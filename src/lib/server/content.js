// Reads /content at build time (prerender) and turns the Markdown into
// blocks the pages lay out as tiles. Nothing here ships to the browser.
//
//   content/projects/<slug>/index.md     one project: YAML frontmatter + write-up
//   content/projects/<slug>/<images>     referenced as ![caption](file.png)
//   content/projects/_template/          ignored (folders starting with _)
//   content/collection/index.md          the "Outside of code" page
//   <!-- IMAGE: what it should show -->  becomes a placeholder tile
import fs from 'node:fs';
import path from 'node:path';
import { load as parseYaml } from 'js-yaml';
import { Marked } from 'marked';
import { imageSize } from 'image-size';
import { dev } from '$app/environment';

const ROOT = path.resolve('content');
const SHOW_TODOS = dev || process.env.PREVIEW === '1';

// Vite copies every content image into the build and gives us its URL
const assetUrls = import.meta.glob('/content/**/*.{png,jpg,jpeg,webp,svg,gif}', {
  eager: true,
  query: '?url',
  import: 'default'
});

/* ===================== vocabulary ===================== */
export const STATUS = {
  'in-progress': { label: 'In progress', sort: 0 },
  paused: { label: 'Paused', sort: 1 },
  done: { label: 'Done', sort: 2 },
  planned: { label: 'Planned', sort: 3 }
};
export const APPROACH = {
  'hand-built': 'Hand-built',
  'ai-assisted': 'AI-assisted',
  mixed: 'Mixed'
};
export const CONTEXT = { personal: 'Personal project', school: 'School project' };
export const TAGS = {
  hardware: 'Hardware', embedded: 'Embedded', rf: 'RF', networking: 'Networking',
  backend: 'Backend', frontend: 'Frontend', fullstack: 'Fullstack', desktop: 'Desktop',
  mobile: 'Mobile', algorithms: 'Algorithms', tooling: 'Tooling', ai: 'AI'
};
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* ===================== helpers ===================== */
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// wrap TODO markers in <mark> (text only, never inside tags/attributes)
export function todo(html) {
  if (!SHOW_TODOS) return html;
  return html.replace(/(<[^>]+>)|([^<]+)/g, (m, tag, text) =>
    tag ? tag : text.replace(/\bTODO\b:?/g, (t) => `<mark class="todo">${t}</mark>`)
  );
}
const text = (s) => todo(esc(s));

function frontmatter(raw, file) {
  const m = raw.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing --- frontmatter ---`);
  return { meta: parseYaml(m[1]) ?? {}, body: m[2] };
}

function ym(v) {
  if (!v) return null;
  if (v instanceof Date) return { y: v.getUTCFullYear(), m: v.getUTCMonth() + 1 };
  const m = String(v).match(/^(\d{4})-(\d{1,2})/);
  return m ? { y: +m[1], m: +m[2] } : null;
}
const monthYear = (d) => (d ? `${MONTHS[d.m - 1]} ${d.y}` : '');

function slugify(s) {
  return String(s).toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function resolveImage(dir, src) {
  const clean = decodeURI(src).replace(/^\.\//, '');
  const key = `/content/${dir}/${clean}`;
  const url = assetUrls[key];
  if (!url) throw new Error(`content/${dir}: image "${src}" is not in the folder`);
  let width = 0, height = 0;
  try {
    const dim = imageSize(fs.readFileSync(path.join(ROOT, dir, clean)));
    width = dim.width ?? 0;
    height = dim.height ?? 0;
  } catch {
    /* svg without size: treated as landscape */
  }
  return { url, width, height, landscape: !height || width / height > 1.15 };
}

const PLACEHOLDER = /^<!--\s*IMAGE:\s*([\s\S]*?)\s*-->\s*$/;

/* ===================== Markdown → blocks ===================== */
function makeMarked(dir) {
  const md = new Marked({ gfm: true });
  md.use({
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        return `<h${depth} id="${slugify(inner)}">${inner}</h${depth}>\n`;
      },
      table(token) {
        // default rendering, wrapped so wide tables scroll inside their tile
        const head = token.header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join('');
        const rows = token.rows
          .map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`)
          .join('\n');
        return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
      },
      image({ href, text: alt }) {
        const img = resolveImage(dir, href);
        return `<img src="${img.url}" alt="${esc(alt)}" width="${img.width || ''}" height="${img.height || ''}" loading="lazy">`;
      },
      html({ text: raw }) {
        const ph = raw.trim().match(PLACEHOLDER);
        if (ph) return `<div class="ph-inline">${esc(ph[1])}</div>`;
        if (/^<\/?div[^>]*>\s*$/.test(raw.trim())) return '';
        return raw;
      }
    }
  });
  return md;
}

const isImageParagraph = (t) =>
  t.type === 'paragraph' && t.tokens?.length && t.tokens.every((x) => x.type === 'image' || (x.type === 'text' && !x.text.trim()) || x.type === 'br');

/**
 * Split a Markdown body into sections (by ##) made of text blocks, images
 * and placeholders, so pages can lay each piece out as its own tile.
 */
export function toSections(body, dir, { splitH3 = false, standIn = false } = {}) {
  const md = makeMarked(dir);
  const tokens = md.lexer(body);
  const sections = [];
  let section = null;
  let buf = null;

  const render = (toks) => {
    const arr = Object.assign([...toks], { links: tokens.links });
    return todo(md.parser(arr));
  };
  const flush = () => {
    // a ### block (a card on the collection page): its first picture goes on the card
    const cover = buf?.heading && buf.deferred?.[0]?.type === 'image' ? buf.deferred.shift() : null;
    if (buf && buf.tokens.some((t) => t.type !== 'space')) {
      const html = render(buf.tokens);
      const plain = html.replace(/<[^>]+>/g, '');
      section.blocks.push({
        type: 'text',
        heading: buf.heading,
        headingId: buf.heading ? slugify(buf.heading) : null,
        html,
        length: plain.length,
        hasTable: html.includes('<table'),
        hasPre: html.includes('<pre'),
        cover
      });
    } else if (buf?.heading) {
      // a ### with nothing but pictures under it: keep the heading as its own block
      section.blocks.push({ type: 'text', heading: buf.heading, headingId: slugify(buf.heading), html: '', length: 0, hasTable: false, hasPre: false, cover });
    }
    if (buf?.deferred) section.blocks.push(...buf.deferred);
    buf = null;
  };
  const ensureSection = () => {
    if (!section) {
      section = { heading: null, id: null, blocks: [] };
      sections.push(section);
    }
  };
  const ensureBuf = () => {
    ensureSection();
    if (!buf) buf = { heading: null, tokens: [] };
  };

  for (const t of tokens) {
    if (t.type === 'heading' && t.depth <= 2) {
      flush();
      const heading = md.parseInline(t.text);
      section = { heading, id: slugify(heading), blocks: [] };
      sections.push(section);
      continue;
    }
    if (t.type === 'heading' && t.depth === 3 && splitH3) {
      flush();
      ensureSection();
      buf = { heading: md.parseInline(t.text), tokens: [] };
      continue;
    }
    if (isImageParagraph(t)) {
      const blocks = t.tokens
        .filter((x) => x.type === 'image')
        .map((im) => {
          const img = resolveImage(dir, im.href);
          // stand_in_images: the file is a stand-in, show what it should become
          return standIn
            ? { type: 'placeholder', caption: text(im.text) }
            : { type: 'image', ...img, alt: im.text, caption: text(im.text) };
        });
      if (splitH3 && buf?.heading) {
        // keep a ### block's text ahead of its pictures (they follow it as tiles)
        (buf.deferred ??= []).push(...blocks);
        continue;
      }
      flush();
      ensureSection();
      section.blocks.push(...blocks);
      continue;
    }
    if (t.type === 'html') {
      const ph = t.text.trim().match(PLACEHOLDER);
      if (ph) {
        const block = { type: 'placeholder', caption: esc(ph[1]) };
        if (splitH3 && buf?.heading) {
          (buf.deferred ??= []).push(block);
          continue;
        }
        flush();
        ensureSection();
        section.blocks.push(block);
        continue;
      }
      if (/^<\/?div[^>]*>\s*$/.test(t.text.trim())) continue; // old .col-grid wrappers
    }
    ensureBuf();
    buf.tokens.push(t);
  }
  flush();
  return sections.filter((s) => s.blocks.length || s.heading);
}

/* ===================== projects ===================== */
function readProject(slug) {
  const file = path.join(ROOT, 'projects', slug, 'index.md');
  const { meta, body } = frontmatter(fs.readFileSync(file, 'utf8'), `content/projects/${slug}/index.md`);
  const where = `content/projects/${slug}/index.md`;
  if (!meta.title) throw new Error(`${where}: missing title`);
  if (!STATUS[meta.status]) throw new Error(`${where}: unknown status "${meta.status}"`);
  if (meta.approach && !APPROACH[meta.approach]) throw new Error(`${where}: unknown approach "${meta.approach}"`);
  for (const tag of meta.tags ?? []) if (!TAGS[tag]) throw new Error(`${where}: unknown tag "${tag}"`);

  const started = ym(meta.started);
  const ended = ym(meta.ended);
  const dir = `projects/${slug}`;
  const cover = meta.cover ? resolveImage(dir, meta.cover) : null;

  return {
    slug,
    title: meta.title,
    summary: meta.summary ?? '',
    summaryHtml: text(meta.summary ?? ''),
    status: meta.status,
    statusLabel: STATUS[meta.status].label,
    statusNote: text(meta.status_note ?? ''),
    approach: meta.approach ?? null,
    approachLabel: meta.approach ? APPROACH[meta.approach] : null,
    approachNote: text(meta.approach_note ?? ''),
    context: meta.context ?? null,
    contextLabel: meta.context ? CONTEXT[meta.context] ?? meta.context : null,
    team: meta.team_size > 1 ? `Team of ${meta.team_size}` : 'Solo',
    role: meta.role ? text(meta.role) : '',
    period: started ? `${monthYear(started)} – ${ended ? monthYear(ended) : 'ongoing'}` : 'Not started yet',
    sortKey: [STATUS[meta.status].sort, meta.order ?? 999, -(started ? started.y * 12 + started.m : 0)],
    tags: (meta.tags ?? []).map((t) => ({ id: t, label: TAGS[t] })),
    stack: meta.stack ?? [],
    links: (meta.links ?? []).filter((l) => l?.url),
    cover: cover ? { ...cover, alt: meta.cover_alt ?? '', placeholder: !!meta.stand_in_images } : null,
    standIn: !!meta.stand_in_images,
    body
  };
}

let cache = null;
export function getProjects() {
  if (cache && !dev) return cache;
  const dir = path.join(ROOT, 'projects');
  const slugs = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_') && fs.existsSync(path.join(dir, d.name, 'index.md')))
    .map((d) => d.name);
  const list = slugs.map(readProject).sort((a, b) => {
    for (let i = 0; i < a.sortKey.length; i++) if (a.sortKey[i] !== b.sortKey[i]) return a.sortKey[i] - b.sortKey[i];
    return a.title.localeCompare(b.title);
  });
  cache = list;
  return list;
}

/** what cards and lists need: no write-up */
export function projectCards() {
  return getProjects().map(({ body, sortKey, ...card }) => card);
}

export function getProject(slug) {
  const list = getProjects();
  const i = list.findIndex((p) => p.slug === slug);
  if (i < 0) return null;
  const { body, sortKey, ...p } = list[i];
  const next = list[(i + 1) % list.length];
  return {
    ...p,
    sections: toSections(body, `projects/${slug}`, { standIn: p.standIn }),
    next: next.slug !== slug ? { slug: next.slug, title: next.title, summaryHtml: next.summaryHtml } : null
  };
}

/* ===================== collection ===================== */
export function getCollection() {
  const file = path.join(ROOT, 'collection', 'index.md');
  const { meta, body } = frontmatter(fs.readFileSync(file, 'utf8'), 'content/collection/index.md');
  return {
    title: meta.title ?? 'The collection',
    eyebrow: meta.eyebrow ?? '',
    summaryHtml: text(meta.summary ?? ''),
    sections: toSections(body, 'collection', { splitH3: true })
  };
}
