# Neo Dijkstra, portfolio v1.5.0 (bento grid)

SvelteKit rebuild of the v6 prototype. It has one scrolling main page: a cellular-automata intro, then a bento grid. Projects and the collection have their own pages. Everything is static HTML, ready for GitHub Pages. English only.

New to Svelte? Start with `LEARN-SVELTE.md`.

## Look at it

```
npm install          once (on Windows, in this folder)
npm run dev          http://localhost:5173, reloads as you edit
```

A SvelteKit build can't be opened by double-clicking `index.html`. The browser blocks its scripts from disk, so it always needs a local server: either `npm run dev`, or `npm run build` followed by `npm run preview`.

## Commands

```
npm run dev          development server; TODO markers highlighted in yellow
npm run build        static site into build/
npm run preview      serve build/ locally to check it
npm run check        lists every TODO, image placeholder and placeholder contact detail; exits 1 while any are left
```

## What's where

```
content/                     same format as v6: Markdown + images, copied from neo-portfolio-v6.1.0
  projects/<slug>/index.md   one project (frontmatter + write-up); folder name = URL
  projects/_template/        copy this to start a project (folders starting with _ are skipped)
  collection/index.md        the "Outside of code" page
src/
  app.css                    colour tokens (light + dark), grid, tiles, Markdown styles
  lib/site.js                main-page text: intro, education, skills, contact, CV, footer
  lib/images/                main-page photos (resized to .webp from the v6 originals)
  lib/hero/Backdrop.svelte   the full-screen automaton canvas behind every page (in +layout.svelte)
  lib/hero/backdrop.svelte.js  shared state: which automaton runs, intro phase, the engine
  lib/hero/engine.js         runs any automaton: timeline, fading, the clear area around the name
  lib/hero/Hero.svelte       intro section: name canvas, line under the name, buttons
  lib/hero/AutomatonNote.svelte  the "[+] Rule 22" note in the corner of the intro
  lib/hero/automata/index.js the list of automata + which one to show
  lib/hero/automata/*.js     rule22, life, brain, ant, smoothlife, lenia
  lib/hero/name.js           shared: pixel name, colour block, grid size
  lib/server/content.js      reads content/ at build time, turns Markdown into tiles
  lib/server/cv.js           finds the CV in static/cv/
  lib/collection-layout.js   picks tile widths on the collection page so rows have no gaps
  lib/components/            tiles, nav, theme toggle, placeholders, contact icons …
  routes/                    pages: /, /projects/, /projects/<slug>/, /collection/
static/                      copied as-is (favicon, .nojekyll)
static/cv/                   drop your CV here (one PDF, any name)
scripts/check-content.mjs    the `npm run check` gate
.github/workflows/deploy.yml GitHub Pages deploy
```

## Colours

The four base colours are at the top of `src/app.css`:

| token | value | light mode | dark mode |
|---|---|---|---|
| `--pale` | `#dcefd3` | page | accent tiles, photo tiles |
| `--deep` | `#0d3b22` | accent tiles | page |
| `--white` | `#ffffff` | tiles | text |
| `--black` | `#000000` | text | tiles |

Dark mode is an exact swap of the roles: pale green ↔ dark green and white ↔ black. The page starts in the visitor's system setting. The square button in the nav switches theme and remembers the choice. Switching back to the system's own theme forgets it again.

## The intro

The automaton is a fixed canvas that covers the whole screen, behind every page. It sits in `+layout.svelte`, so it keeps running while you click between pages: on project pages and the collection it runs a little fainter and at half speed. On the home page the hero adds a second canvas for the name; the automaton stays out of the area around the name and the buttons, and that area moves along when you scroll.

Six automata. The first page load of a browser session always shows Rule 22 (`heroAutomaton` in `src/lib/site.js`). After that, every reload picks a random one, never the same twice in a row. A flag in `sessionStorage` (`ca-seen`, `ca-last`) remembers this. To force one for testing, add `?ca=` with the automaton's id to the URL: `?ca=lenia` (the ids are `rule22`, `life`, `smoothlife`, `lenia`, `ant` and `brain`). The note in the bottom-left corner of the intro says which one is running; its + opens a short explanation and a link.

| id | what it is | notes |
|---|---|---|
| `rule22` | elementary 1-D automaton | starts from a random row, so it makes many small triangles. Its rows appear from top to bottom during the intro. Static afterwards |
| `life` | Conway's Game of Life | keeps ticking slowly at 11 % after the intro |
| `smoothlife` | Rafler's SmoothLife, the discrete-time version | square blobs turn into round gliders |
| `lenia` | Lenia with Orbium | starts from Orbium gliders (random soups die or explode at this size). They all face the same way so they never collide. A watchdog restarts them if they die or explode |
| `ant` | Langton's ant | several ants, fast during the intro, then crawling |
| `brain` | Brian's Brain | never settles |

**Adding your own** (Vectorlocust, say): write a module like `src/lib/hero/automata/brain.js`. The interface is described at the top of `engine.js`. Then add an entry to `AUTOMATA` in `automata/index.js` with `id`, `name`, `make`, `text` and `link`. Automata that don't step (like Rule 22) leave out `step` and work everything out in `init`.

Shared by all of them (`src/lib/hero/name.js`):

- `CONSOLE_SWATCHES`: the 3×3 colour block, nine `System.ConsoleColor` values in your order.
- The name is drawn in Sofia Sans Extra Condensed (weight 860), squeezed to 80 % width and snapped to the grid. The J is fitted into the cap height, and one-cell notches and spurs are cleaned up.
- On phones and portrait screens the name breaks into NEO / DIJKSTRA, with the swatches next to NEO.
- The timeline (`T`) and the opacities (`FAINT`, and `CALM` for the other pages) are at the top of `engine.js`.
- Clicking the intro skips straight to the end. With "reduce motion" switched on, the end state shows immediately.

**Background image (for later).** Set `heroImage` in `src/lib/site.js` to an imported photo:

```js
import heroPhoto from '$lib/images/hero.jpg';
// …
heroImage: heroPhoto,
```

The photo is then dithered onto the same pixel grid behind the automata and fades in with them. The area around the name stays clear.

## Content

The format is the same as v6, so new projects work the way the old README describes. Additions:

- `stand_in_images: true` in a project's frontmatter shows a placeholder tile (with the caption saying what should be there) instead of each picture. NodeOS has this set, because its four PNGs are the stand-in Mensa screenshot. Remove the line once real screenshots are in the folder.
- `<!-- IMAGE: what it should show -->` now renders as a checkerboard placeholder tile, not only in preview builds.
- TODO markers are highlighted in `npm run dev` only. `npm run check` lists them.
- Main-page text lives in `src/lib/site.js`, not in the HTML.

### The collection page

`content/collection/index.md`. Each `##` is a section, each `###` is a card:

```markdown
### Midland 2001 Precision Series

![Midland 2001 Precision Series CB radio with its microphone](cb-midland-2001.jpg)

A few sentences about it.

![A second photo, shown as its own tile with this text as caption](cb-midland-back.jpg)
```

- The first picture under a `###` goes on the card (its text is only the alt text). Any further pictures follow the card as photo tiles, with their text as caption.
- Text and pictures before the first `###` of a section become plain tiles (the section intro, the lamp photos).
- You don't arrange anything: `src/lib/collection-layout.js` picks a width for every tile so each row is full, at desktop and tablet width, and keeps the order you wrote. It estimates how tall each tile gets and avoids rows where a short text sits next to something tall.
- Photos: resize them before adding (about 1400 px on the long side is plenty) and keep them as `.jpg`. Every image in the folder is published, used or not.

## Still placeholders (from v6)

`npm run check` lists them all. The ones that aren't in Markdown:

- Contact details are complete. Any entry in `contact.left` / `contact.right` with `url: '#'` shows as "coming soon" (and `npm run check` lists it).
- CV: see "The CV" below.

## The CV

Drop the PDF into `static/cv/`. That's all: no code to change.

- Any file name works (`Neo-Dijkstra-CV.pdf`, say). That's also the name it downloads as.
- The CV tile links it and shows its size. Without a PDF it says "PDF coming soon".
- With `npm run dev` it shows up on the next page reload; otherwise on the next build. On GitHub Pages: commit the PDF and push.
- To update it, replace the file. If you keep several (`cv-2026-10.pdf`, `cv-2027-03.pdf`), the last one by name is linked, but all of them are published, so it's tidier to keep just one.
- `npm run check` lists a missing CV.

## Logos in the contact tile

`src/lib/components/ContactIcon.svelte` draws them, all in one colour (`currentColor`, black or white depending on the theme):

- GitHub, LinkedIn and Discord: the official marks, unmodified apart from the colour. Each brand allows black or white versions. The LinkedIn ® is cropped off, because at 22 px it's an unreadable dot; if you want to be strict, use the full "in" bug from LinkedIn's brand page instead. Brand pages: [GitHub](https://github.com/logos), [LinkedIn](https://brand.linkedin.com/downloads), [Discord](https://discord.com/branding).
- Matrix: the Element logomark (`icon: 'element'` in `site.js`), from the file you supplied, drawn in one colour. Element's [trademark policy](https://element.io/legal/trademark-policy) allows the logo for linking to services Element hosts or supports, and asks for written permission otherwise. A personal Matrix address on another server isn't clearly covered, and their [logo page](https://element.io/logo) doesn't say whether one-colour versions are fine. The [m] mark of the Matrix.org Foundation is still in the component: set `icon: 'matrix'` to switch back. Their [logo guidelines](https://matrix.org/legal/logo-usage/) allow black or white versions; if you switch, change `footer.trademarks` in `site.js` too.
- Email and location: pixel-art icons drawn for this site (no Gmail or Google Maps logos, so nothing to license).
- The footer carries the trademark note (`footer.trademarks` in `site.js`).

## Deploy (GitHub Pages)

1. Push this folder to a GitHub repo, on branch `main`.
2. On GitHub, open Settings → Pages and set Source to "GitHub Actions".
3. Every push to `main` builds and publishes. The workflow sets `BASE_PATH=/<repo-name>` so links work under `https://<user>.github.io/<repo>/`. For a custom domain or a `<user>.github.io` repo, remove that line from `.github/workflows/deploy.yml`.

## Changes from v6

- New look: pixel grid, bento tiles with stepped corners, Sofia Sans plus Sofia Sans Extra Condensed, light and dark mode.
- The scroll reveals, education reel and colour panels are gone. Everything is on one page as tiles.
- English only. The German `.de.md` files and German strings are still in `neo-portfolio-v6.1.0` if you want them back later.
- The version (now 1.5.0) is in `package.json` and in `src/lib/site.js` (shown in the page title and footer).
