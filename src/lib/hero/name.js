/*
  Shared by both intro automata (life.js and rule22.js): the grid size,
  the pixel-art name with its colour block, and a few small helpers.
*/

/* C# System.ConsoleColor values, row by row:
   Red     DarkBlue    DarkGreen
   Cyan    DarkYellow  DarkRed
   Yellow  Magenta     DarkCyan                                          */
export const CONSOLE_SWATCHES = [
  '#ff0000', '#000080', '#008000',
  '#00ffff', '#808000', '#800000',
  '#ffff00', '#ff00ff', '#008080'
];

/** grid pitch in CSS px for a given viewport width (also used for the body grid) */
export function cellSizeFor(width) {
  return Math.max(5, Math.min(13, Math.round(width / 172)));
}

export const rand = (a, b) => a + Math.random() * (b - a);
export const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
export const easeInOut = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/**
 * Rasterise the name onto the cell grid.
 *
 * Returns per-cell arrays (index = y * cols + x):
 *   target    1 where a letter pixel goes
 *   lockAt    ms when that letter pixel appears (centre first)
 *   keepClear 1 in the clean margin around the name
 *   clearAt   ms when that margin cell gets cleared
 * plus the colour swatches and the name's position in CSS px.
 *
 * @param {{cols:number, rows:number, cell:number, text:string[], font:string, weight:number,
 *          T:{morphStart:number, morphSpan:number, swatchStart:number}}} o
 */
export function layoutName({ cols, rows, cell, text, font, weight, T }) {
  const n = cols * rows;
  const target = new Uint8Array(n);
  const lockAt = new Float32Array(n).fill(Infinity);
  const keepClear = new Uint8Array(n);
  const clearAt = new Float32Array(n).fill(Infinity);

  const S = 4; // supersampling per cell
  const SQUEEZE = 0.8; // letters drawn narrower than the font so they come out taller
  const TRACK = 0.03; // extra letter spacing (em) so neighbouring pixels don't merge
  const gapRatio = 0.14; // gap between name and swatch block, in cap heights
  const off = document.createElement('canvas');
  const octx = off.getContext('2d', { willReadFrequently: true });
  const fontAt = (px) => `${weight} ${px}px ${font}`;

  // per-character metrics at 100px; letters are drawn one by one so a
  // descending J can be fitted into the cap height like the others
  octx.font = fontAt(100);
  const capRatio = octx.measureText('H').actualBoundingBoxAscent / 100;
  const glyph = (ch) => {
    const m = octx.measureText(ch);
    return {
      ch,
      adv: m.width / 100,
      lb: -m.actualBoundingBoxLeft / 100, // left bearing
      rb: (m.width - m.actualBoundingBoxRight) / 100, // right bearing
      asc: m.actualBoundingBoxAscent / 100,
      desc: m.actualBoundingBoxDescent / 100
    };
  };
  const shape = (line) => {
    const gs = [...line].map(glyph);
    let x = 0;
    const placed = gs.map((g) => {
      const at = x;
      x += (g.adv + TRACK) * SQUEEZE;
      return { ...g, x: at };
    });
    const first = gs[0], last = gs[gs.length - 1];
    const inkW = x - TRACK * SQUEEZE - (first.lb + last.rb) * SQUEEZE; // in em
    return { placed, ink: inkW, lead: first.lb * SQUEEZE };
  };

  // phones / portrait: NEO over DIJKSTRA, swatches next to NEO
  const portrait = cols / rows < 1.15 || cols < 110;
  const lines = (portrait ? text.slice() : [text.join(' ')]).map(shape);
  const margin = Math.max(3, Math.round(cols * (portrait ? 0.06 : 0.07)));
  const avail = cols - margin * 2;

  // font size in cells
  const lineEm = (l, i) => l.ink + (i === 0 ? capRatio * (1 + gapRatio) : 0);
  let fs = avail / Math.max(...lines.map(lineEm));
  const maxCap = rows * (portrait ? 0.2 : 0.34);
  if (fs * capRatio > maxCap) fs = maxCap / capRatio;

  const cap = Math.round(fs * capRatio);
  const lineGap = Math.max(2, Math.round(cap * 0.2));
  const blockH = lines.length * cap + (lines.length - 1) * lineGap;
  const top = Math.max(4, Math.round(rows * (portrait ? 0.4 : 0.43) - blockH / 2));

  // swatch block: square, as tall as the capitals
  const g = Math.max(1, Math.round(cap / 22));
  const k = Math.max(1, Math.floor((cap - 2 * g) / 3));
  const sw = 3 * k + 2 * g;
  const gap = Math.max(2, Math.round(cap * gapRatio));

  off.width = cols * S;
  off.height = rows * S;
  octx.font = fontAt(fs * S);
  octx.fillStyle = '#000';
  octx.textBaseline = 'alphabetic';

  const blockW = Math.max(...lines.map((l, i) => l.ink * fs + (i === 0 ? gap + sw : 0)));
  const x0 = Math.round((cols - blockW) / 2); // lines share one left edge; the block is centred
  let maxX = 0;
  const lineBoxes = lines.map((l, i) => {
    const baseline = top + i * (cap + lineGap) + cap;
    const w = l.ink * fs;
    for (const gl of l.placed) {
      const gx = (x0 + (gl.x - l.lead) * fs) * S;
      if (gl.desc > 0.04) {
        // descender (J): squash the whole glyph into the cap height
        const sy = capRatio / (gl.asc + gl.desc);
        octx.setTransform(SQUEEZE, 0, 0, sy, gx, (baseline - cap) * S);
        octx.fillText(gl.ch, 0, gl.asc * fs * S);
      } else {
        octx.setTransform(SQUEEZE, 0, 0, 1, gx, 0);
        octx.fillText(gl.ch, 0, baseline * S);
      }
    }
    octx.setTransform(1, 0, 0, 1, 0, 0);
    maxX = Math.max(maxX, x0 + w + (i === 0 ? gap + sw : 0));
    return { x0, w, baseline };
  });

  // when a cell appears: a wave from the centre outwards, with some jitter
  const cx = cols / 2, cy = top + blockH / 2;
  const maxD = Math.hypot(cols / 2, blockH / 2 + 4);
  const dist = (x, y) => Math.hypot((x - cx) * 0.6, (y - cy) * 1.6) / maxD;
  const lockTime = (x, y) => T.morphStart + dist(x, y) * T.morphSpan * 0.75 + rand(0, T.morphSpan * 0.3);

  const img = octx.getImageData(0, 0, off.width, off.height).data;
  for (const b of lineBoxes) {
    // only the cap band: round letters overshoot it by a sliver, which at
    // this resolution would leave single stray pixels
    for (let y = b.baseline - cap; y < b.baseline; y++) {
      if (y < 0 || y >= rows) continue;
      for (let x = 0; x < cols; x++) {
        let sum = 0;
        for (let sy = 0; sy < S; sy++) {
          const row = ((y * S + sy) * off.width + x * S) * 4 + 3;
          for (let sx = 0; sx < S; sx++) sum += img[row + sx * 4];
        }
        if (sum / (S * S * 255) >= 0.48) {
          target[y * cols + x] = 1;
          lockAt[y * cols + x] = lockTime(x, y);
        }
      }
    }
  }

  // tidy the pixel glyphs: fill one-cell notches, drop one-cell spurs
  const at = (x, y) => (x >= 0 && y >= 0 && x < cols && y < rows ? target[y * cols + x] : 0);
  const n4 = (x, y) => at(x - 1, y) + at(x + 1, y) + at(x, y - 1) + at(x, y + 1);
  const fills = [], spurs = [];
  for (let y = top; y < top + blockH; y++) {
    for (let x = 0; x < cols; x++) {
      const v = at(x, y), nb = n4(x, y);
      if (!v && nb >= 3) fills.push([x, y]);
      else if (v && nb <= 1) spurs.push([x, y]);
    }
  }
  for (const [x, y] of fills) {
    target[y * cols + x] = 1;
    lockAt[y * cols + x] = lockTime(x, y);
  }
  for (const [x, y] of spurs) target[y * cols + x] = 0;

  // swatches sit right of the first line, centred on the capitals
  const first = lineBoxes[0];
  const sx0 = Math.round(first.x0 + first.w + gap);
  const sy0 = first.baseline - cap + Math.round((cap - sw) / 2);
  const swatches = CONSOLE_SWATCHES.map((color, idx) => ({
    x: sx0 + (idx % 3) * (k + g),
    y: sy0 + Math.floor(idx / 3) * (k + g),
    s: k,
    color,
    at: T.swatchStart + [0, 1, 2, 1, 2, 3, 2, 3, 4][idx] * 70 // diagonal ripple
  }));

  // keep a clean margin around the name so the letters read
  const pad = Math.max(2, Math.round(cap * 0.18));
  const x1 = Math.max(0, x0 - pad), x2 = Math.min(cols, Math.ceil(maxX) + pad);
  const y1 = Math.max(0, top - pad), y2 = Math.min(rows, top + blockH + pad);
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      keepClear[y * cols + x] = 1;
      clearAt[y * cols + x] = T.morphStart - 150 + dist(x, y) * T.morphSpan * 0.75 + rand(0, 220);
    }
  }

  return {
    target,
    lockAt,
    keepClear,
    clearAt,
    swatches,
    layout: { nameTop: top * cell, nameBottom: (top + blockH) * cell, cell }
  };
}

/**
 * Mark a DOM area (CSS px relative to the canvas) as "keep clear", e.g. the
 * line and buttons under the name. Cells clear at `when` ms.
 */
export function markClear(name, { cols, rows, cell }, px, py, pw, ph, when) {
  const x1 = Math.max(0, Math.floor(px / cell) - 1), x2 = Math.min(cols, Math.ceil((px + pw) / cell) + 1);
  const y1 = Math.max(0, Math.floor(py / cell) - 1), y2 = Math.min(rows, Math.ceil((py + ph) / cell) + 1);
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      const i = y * cols + x;
      if (name.keepClear[i]) continue;
      name.keepClear[i] = 1;
      name.clearAt[i] = when();
    }
  }
}

/** draw the name cells (popping in) and the colour swatches */
export function drawName(ctx, name, { cols }, c, t) {
  const { target, lockAt, swatches } = name;
  for (let i = 0; i < target.length; i++) {
    if (!target[i] || t < lockAt[i]) continue;
    const p = Math.min(1, (t - lockAt[i]) / 140);
    const s = c * (0.35 + 0.65 * p);
    const x = (i % cols) * c + (c - s) / 2, y = ((i / cols) | 0) * c + (c - s) / 2;
    ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(s), Math.ceil(s));
  }
  for (const r of swatches) {
    if (t < r.at) continue;
    const p = ease((t - r.at) / 220);
    const full = r.s * c;
    const s = full * (0.2 + 0.8 * p);
    ctx.fillStyle = r.color;
    ctx.fillRect(Math.round(r.x * c + (full - s) / 2), Math.round(r.y * c + (full - s) / 2), Math.ceil(s), Math.ceil(s));
  }
}

/* ---------- optional background photo, dithered onto the grid ---------- */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

/** 1 where a 4x4 ordered dither of the photo is dark (cover-fit to cols x rows) */
export function ditherImage(image, cols, rows) {
  const off = document.createElement('canvas');
  off.width = cols;
  off.height = rows;
  const o = off.getContext('2d', { willReadFrequently: true });
  const s = Math.max(cols / image.width, rows / image.height);
  const w = image.width * s, h = image.height * s;
  o.drawImage(image, (cols - w) / 2, (rows - h) / 2, w, h);
  const d = o.getImageData(0, 0, cols, rows).data;
  const cells = new Uint8Array(cols * rows);
  for (let i = 0; i < cols * rows; i++) {
    const l = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
    const x = i % cols, y = (i / cols) | 0;
    cells[i] = l < BAYER[(y & 3) * 4 + (x & 3)] ? 1 : 0;
  }
  return cells;
}

export function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}
