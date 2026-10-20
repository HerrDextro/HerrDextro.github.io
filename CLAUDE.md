# Neo Dijkstra's portfolio (bento grid, SvelteKit)

Portfolio for Swiss internship applications (Praktikum from August 2027). It's SvelteKit 2 + Svelte 5 with adapter-static. README.md explains the layout and commands, so read it first.

## Commands

- `npm run dev`: development server (TODOs highlighted)
- `npm run build`: static site into `build/` (never edit `build/`)
- `npm run check`: fails while any TODO, `<!-- IMAGE: -->` placeholder, `stand_in_images: true` or placeholder contact detail is left. Run it before calling anything publishable.

## Content rules (unchanged from v6)

- Project write-ups are Neo's voice: first person, an enthusiastic nerd who stays professional. Keep it. Fix typos and broken Markdown only; never rewrite them into a different tone. Flag anything unclear instead of changing it.
- No LinkedIn language (passionate, results-driven, team player, leverage, seamless, journey, …) and no emoji.
- Never invent facts, numbers or results. If something is unknown, write a `TODO:` marker.
- Status values: done, in-progress, paused, planned. Approach values: hand-built, ai-assisted, mixed. Tags: see `src/lib/server/content.js`.
- English only for now. The German texts live in the v6 folder.
- Collection page: each `###` in `content/collection/index.md` is a card (see README, "The collection page"). New photos: about 1400 px on the long side, `.jpg`, EXIF (GPS!) stripped, the sharpest of near-duplicate shots only.

## Design rules

- Colours: only the four base tokens in `src/app.css` (`--pale`, `--deep`, `--white`, `--black`) and the role tokens built from them. Dark mode swaps the roles exactly. Never hard-code colours in components. The exceptions are the ConsoleColor swatches, the little Dutch flag and the yellow/black construction tape in the footer. Brand logos (`ContactIcon.svelte`) use `currentColor` only: black or white, never brand colours or other tints.
- Everything sits on the pixel grid (`--cell`, set in `+layout.svelte` from the viewport width). Tiles use `.pixel-corners`. There are no shadows and no gradients.
- Type: Sofia Sans Extra Condensed for headings, buttons and nav (sentence case); Sofia Sans for text; JetBrains Mono only for the age counter, code and stack chips.
- Motion: the intro (`src/lib/hero/`: rule 22 on the first visit, then a random automaton) is the one orchestrated moment. The automaton is a fixed full-screen backdrop in `+layout.svelte` that keeps running across pages (calmer off the home page). Don't add entrance animations to tiles. Respect `prefers-reduced-motion`.
- Check pages at 390 px, 820 px and 1440 px wide, in both light and dark.

## Versioning

Semantic versioning. The version is in `package.json` and in `site.version` in `src/lib/site.js`. A new project or feature is a minor bump; fixes are a patch bump.
