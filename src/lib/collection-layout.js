// Tile widths for the collection page: rows without gaps, in the order the
// Markdown is written.
//
// The grid has 4 columns on desktop and 2 on tablets. Every row has to add up
// to exactly that many columns, so the job is to pick a width for each tile.
// For every possible row this file estimates how tall each tile would be,
// then scores the row:
//   - text tiles don't stretch, so a text tile in a taller row leaves white
//     space at its bottom: that costs
//   - photos do stretch (they're cropped to fill), so the cost is how much of
//     the photo gets cropped away
// A small dynamic program (like justifying a paragraph, with tiles instead of
// words) then picks the cheapest set of rows. It runs at build time only.
//
// The numbers below are rough measurements of the CSS (src/app.css and
// src/routes/collection/+page.svelte) at 1440 px and 900 px wide. If the
// layout looks off after a CSS change, these are the ones to adjust.

export const GRIDS = {
  desktop: { cols: 4, col: 300, gap: 23, pad: 35, coverMin: 245, photoMin: 374, wideCoverMin: 280, title: 26 },
  tablet: { cols: 2, col: 389, gap: 14, pad: 22, coverMin: 200, photoMin: 280, wideCoverMin: 260, title: 24 }
};

const CHAR = 7.9; // average width of a character of body text, px
const LINE = 26.3; // body line height, px
const PARA = 15; // space between paragraphs
const MEASURE = 636; // .prose paragraphs stop at 68ch
const HOLE = 1000; // per empty column in the last row: only when nothing else fits

/* ---------- height estimates ---------- */
const plain = (html) => html.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').trim();

// height of a .prose block of HTML at a given width
function textHeight(html, width, { listColumns = false } = {}) {
  const w = Math.min(width, MEASURE);
  let h = 0;
  const parts = html.match(/<p>[\s\S]*?<\/p>|<ul>[\s\S]*?<\/ul>|<ol>[\s\S]*?<\/ol>/g) ?? [html];
  for (const part of parts) {
    if (/^<[uo]l>/.test(part)) {
      const cols = listColumns && width >= 600 ? 2 : 1;
      const colW = (w - (cols - 1) * 32) / cols - 20;
      const items = part.match(/<li>[\s\S]*?<\/li>/g) ?? [];
      const lines = items.reduce((n, li) => n + Math.ceil((plain(li).length * CHAR) / colW), 0);
      h += Math.ceil(lines / cols) * LINE + items.length * 6;
    } else {
      h += Math.ceil((plain(part).length * CHAR) / w) * LINE;
    }
    h += PARA;
  }
  return h;
}

const titleHeight = (text, width, size) => Math.ceil((plain(text).length * size * 0.42) / width) * size + size * 0.4;

// how much of a photo is cut away when it's shown at w × h (0 = nothing)
function crop(w, h, aspect) {
  if (!aspect || w <= 0) return 0;
  h = Math.max(h, 40);
  return ((w * h) / 1e4) * 0.6 * Math.abs(Math.log(w / h / aspect));
}

/* ---------- one model per kind of tile ---------- */
// Each model answers: how tall must this tile be at width w (columns), and
// what does it cost to show it at width w in a row of height H?
export function tileModel(b, g) {
  const outer = (w) => w * g.col + (w - 1) * g.gap;
  const inner = (w) => outer(w) - 2 * g.pad;

  if (b.type === 'image' || b.type === 'placeholder') {
    const aspect = b.width && b.height ? b.width / b.height : 0.75;
    const capH = (w) => (b.caption ? Math.ceil((plain(b.caption).length * 7) / (outer(w) - 28)) * 21 + 10 : 0);
    return {
      min: () => g.photoMin,
      cost: (w, H) => crop(outer(w) - 28, H - 30 - capH(w), aspect)
    };
  }

  if (b.type === 'text' && b.heading) {
    // a card: picture on top when it's one column wide, on the left when wider
    const aspect = b.cover?.width && b.cover?.height ? b.cover.width / b.cover.height : 0;
    const long = plain(b.html).length > 350; // too much text for one narrow column
    const coverW = (w) => Math.min(520, Math.max(220, inner(w) * 0.42));
    const textW = (w) => inner(w) - coverW(w) - 28;
    const vertical = (w) => w === 1 || !b.cover;
    const body = (w) => {
      const tw = vertical(w) ? inner(w) : textW(w);
      return titleHeight(b.heading, tw, g.title) + textHeight(b.html, tw);
    };
    const min = (w) =>
      vertical(w)
        ? 2 * g.pad + (b.cover ? g.coverMin + 18 : 0) + body(w)
        : 2 * g.pad + Math.max(g.wideCoverMin, body(w));
    return {
      min,
      cost: (w, H) => {
        const base = w === 1 && long ? 4 : 0;
        if (!b.cover) return base + ((H - min(w)) * outer(w)) / 1e4;
        if (vertical(w)) return base + crop(inner(w), H - (min(w) - g.coverMin), aspect);
        // wide card: the picture fills the height; white space under the text counts a little
        return base + crop(coverW(w), H - 2 * g.pad, aspect) + (0.3 * (H - 2 * g.pad - body(w)) * textW(w)) / 1e4;
      }
    };
  }

  // plain text (the start of a section, a list)
  const chars = plain(b.html).length;
  const min = (w) => 2 * g.pad + textHeight(b.html, inner(w), { listColumns: true });
  return {
    min,
    cost: (w, H) => (w === 1 && chars > 300 ? 4 : 0) + ((H - min(w)) * outer(w)) / 1e4
  };
}

/* ---------- the rows ---------- */
// all ways to split `cols` columns between `k` tiles (each at least 1)
function splits(k, cols) {
  if (k === 1) return [[cols]];
  const out = [];
  for (let w = 1; w <= cols - (k - 1); w++) for (const rest of splits(k - 1, cols - w)) out.push([w, ...rest]);
  return out;
}

/**
 * @param {{ min: (w: number) => number, cost: (w: number, H: number) => number }[]} tiles
 * @param {number} cols
 * @returns {number[]} a width for every tile
 */
export function pack(tiles, cols) {
  const n = tiles.length;
  const best = new Array(n + 1).fill(Infinity);
  const choice = new Array(n + 1).fill(null);
  best[n] = 0;

  const rowCost = (i, widths) => {
    const H = Math.max(...widths.map((w, j) => tiles[i + j].min(w)));
    return widths.reduce((sum, w, j) => sum + tiles[i + j].cost(w, H), 0);
  };

  for (let i = n - 1; i >= 0; i--) {
    for (let k = 1; k <= cols && i + k <= n; k++) {
      const options = splits(k, cols);
      // the last row may stay short, at a high price, if nothing else works
      if (i + k === n) for (let used = k; used < cols; used++) options.push(...splits(k, used).map((s) => [...s, -(cols - used)]));
      for (const opt of options) {
        const hole = opt.at(-1) < 0 ? -opt.at(-1) : 0;
        const widths = hole ? opt.slice(0, -1) : opt;
        const c = rowCost(i, widths) + hole * HOLE + best[i + k];
        if (c < best[i]) {
          best[i] = c;
          choice[i] = widths;
        }
      }
    }
  }

  const widths = [];
  for (let i = 0; i < n; i += choice[i].length) widths.push(...choice[i]);
  return widths;
}
