#!/usr/bin/env node
// The publish gate (same idea as `npm run check` in v6): lists everything
// that still isn't real and exits 1 while anything is left.
//   - TODO markers in content/**/*.md
//   - <!-- IMAGE: ... --> placeholders
//   - projects marked stand_in_images: true
//   - placeholder contact details in src/lib/site.js, no CV in static/cv/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const gaps = [];

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!e.name.startsWith('_')) walk(p);
    } else if (e.name.endsWith('.md')) {
      const rel = path.relative(root, p);
      const text = fs.readFileSync(p, 'utf8');
      const todos = (text.match(/\bTODO\b/g) || []).length;
      const images = (text.match(/<!--\s*IMAGE:/g) || []).length;
      if (todos) gaps.push(`${rel}: ${todos} TODO marker${todos > 1 ? 's' : ''}`);
      if (images) gaps.push(`${rel}: ${images} image placeholder${images > 1 ? 's' : ''}`);
      if (/^stand_in_images:\s*true/m.test(text)) gaps.push(`${rel}: stand_in_images is still true (replace the stand-in pictures)`);
    }
  }
}
walk(path.join(root, 'content'));

const site = fs.readFileSync(path.join(root, 'src/lib/site.js'), 'utf8');
if (site.includes('placeholder@example.com')) gaps.push('src/lib/site.js: contact email is still placeholder@example.com');
if (/url:\s*'#'/.test(site)) gaps.push("src/lib/site.js: a contact link (LinkedIn / Matrix / Discord) still points to '#'");
const cvDir = path.join(root, 'static/cv');
const cvs = fs.existsSync(cvDir) ? fs.readdirSync(cvDir).filter((f) => f.toLowerCase().endsWith('.pdf')) : [];
if (!cvs.length) gaps.push('static/cv/: no CV yet (drop the PDF in there)');
if (cvs.length > 1) console.log(`Note: static/cv/ has ${cvs.length} PDFs; the site links ${cvs.sort().at(-1)}. The others are published too.\n`);

if (gaps.length) {
  console.log(`Not ready to publish, ${gaps.length} thing${gaps.length > 1 ? 's' : ''} left:\n`);
  for (const g of gaps) console.log(`  - ${g}`);
  console.log('');
  process.exit(1);
}
console.log('Nothing left to fill in.');
