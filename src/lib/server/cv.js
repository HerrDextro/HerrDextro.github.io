// Finds the CV for the home page. Drop one PDF into static/cv/ (any file
// name) and it's linked on the next build, or on the next reload with
// `npm run dev`. With several PDFs the last one by name wins, so dated
// names like cv-2026-10.pdf and cv-2027-03.pdf pick the newest.
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('static/cv');

export function findCv() {
  if (!fs.existsSync(DIR)) return null;
  const pdfs = fs
    .readdirSync(DIR)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .sort();
  if (!pdfs.length) return null;
  const file = pdfs.at(-1);
  const kb = Math.max(1, Math.round(fs.statSync(path.join(DIR, file)).size / 1024));
  return {
    href: `cv/${encodeURIComponent(file)}`, // relative to the site root, add {base} in front
    size: kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
  };
}
