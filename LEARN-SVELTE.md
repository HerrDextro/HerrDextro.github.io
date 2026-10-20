# Learning Svelte with your own portfolio

This guide teaches Svelte 5 and SvelteKit 2 using the code in this folder. Every example points at a real file, so keep the editor open next to it. It assumes you know JavaScript and C#; it doesn't re-explain programming, only what Svelte does differently.

**How to use it**
- Run `npm run dev` and keep http://localhost:5173 open. Saving a file updates the page instantly, so every change you try shows up right away.
- Read parts 1–5 in order (about an hour). Part 6 is a recipe list for things you'll do often. Part 7 has exercises with hidden solutions; each one has been tested against this codebase.
- For Monday you only need parts 1, 2, 4 and recipes A–C. The rest is your Svelte arc.

---

## 1. The mental model

**Svelte is a compiler.** A `.svelte` file is compiled at build time into plain JavaScript that updates the DOM directly. There's no virtual DOM and no runtime framework doing diffing. When a variable that the template uses changes, the compiled code knows exactly which text node or attribute to update.

**SvelteKit is the framework around it**: routing from folders, loading data, building the static site. In C# terms, Svelte is the Razor component and SvelteKit is ASP.NET (routing, hosting, build).

A `.svelte` file has three optional parts:

```svelte
<script>
  // JavaScript: runs once when the component is created
</script>

<!-- markup: HTML plus {expressions} and {#blocks} -->

<style>
  /* CSS that only applies to this component */
</style>
```

**Map of this codebase**, in the order worth reading:

| file | what it teaches |
|---|---|
| `src/lib/components/Swatch.svelte` | the smallest component: props + a loop |
| `src/lib/components/AgeCounter.svelte` | state, lifecycle, cleanup |
| `src/lib/components/ProjectTile.svelte` | props from a parent, conditions, `{@html}` |
| `src/routes/projects/+page.svelte` | `$derived`, events, keyed loops |
| `src/routes/+page.svelte` | composing components; the bento grid |
| `src/routes/+layout.svelte` + `+layout.js` | what wraps every page; prerendering |
| `src/routes/projects/[slug]/+page.server.js` | loading data, dynamic routes |
| `src/lib/server/content.js` | plain JS: Markdown → data (not Svelte at all) |
| `src/lib/hero/Backdrop.svelte` | `bind:this`, `onMount` with cleanup, a component that survives navigation |
| `src/lib/hero/backdrop.svelte.js` | shared reactive state in a plain `.js` file |
| `src/lib/hero/Hero.svelte` | `$effect` that waits for two things, then cleans up after itself |
| `src/lib/hero/engine.js` | plain JS canvas code; Svelte only hosts it |

---

## 2. Components and props

Open `src/lib/components/Swatch.svelte`:

```svelte
<script>
  import { CONSOLE_SWATCHES } from '$lib/hero/name.js';
  let { size = 22 } = $props();
</script>

<svg viewBox="0 0 11 11" width={size} height={size} …>
  {#each CONSOLE_SWATCHES as c, i}
    <rect x={(i % 3) * 4} y={Math.floor(i / 3) * 4} width="3" height="3" fill={c} />
  {/each}
</svg>
```

- `$props()` is how a component receives its inputs. You destructure it like a normal object, with defaults. This is the equivalent of `[Parameter]` properties.
- `{size}` in the markup inserts a JS expression. `width={size}` sets an attribute from it.
- `$lib` is an alias for `src/lib`, so imports don't need `../../..`.

Using it from `Nav.svelte`: `<Swatch size={22} />`. A component is just an import with a capitalised name.

Two prop patterns you'll see in `ProjectTile.svelte`:

```js
let { project, size = 'small', class: cls = '', id = undefined } = $props();
```

- `class: cls`: `class` is a reserved word in JS, so the prop is renamed while destructuring. The parent can then write `<ProjectTile class="w2 h2" … />`, which is how the bento sizes get passed in.
- `{id}` on an element is shorthand for `id={id}`.

**Children.** `+layout.svelte` ends with `{@render children()}`. Whatever page is active gets rendered there. This is Svelte 5's version of `@Body` in a Razor layout.

---

## 3. Reactivity: `$state`, `$derived`, `$effect`

These three "runes" (the `$` functions) are the whole reactivity system. They only work inside `.svelte` files, and inside `.svelte.js` files if you need shared reactive state in plain JS.

### `$state`: a variable the UI depends on

`src/lib/components/AgeCounter.svelte`:

```svelte
<script>
  let value = $state(age().toFixed(2));

  onMount(() => {
    const id = setInterval(() => (value = age().toFixed(12)), 50);
    return () => clearInterval(id);
  });
</script>

<span class="age mono">{value}</span>
```

Assigning to `value` is enough: no `setState` and no `PropertyChanged`. The compiled code updates that one text node. Objects and arrays in `$state` are deeply reactive, so `list.push(x)` or `obj.name = 'x'` also update the UI.

### `$derived`: a value computed from other values

`src/routes/projects/+page.svelte`, the tag filter:

```js
let tag = $state('all');
const shown = $derived(tag === 'all'
  ? data.projects
  : data.projects.filter((p) => p.tags.some((t) => t.id === tag)));
```

`shown` recalculates whenever `tag` (or `data`) changes. Svelte tracks which values were read while computing it. Think of a C# get-only property that is automatically cached and invalidated.

For logic that needs statements, use `$derived.by(() => { …; return x; })`. The project page uses it to turn sections into rows (`src/routes/projects/[slug]/+page.svelte`).

**Rule of thumb:** if you're tempted to write "when A changes, set B", it's a `$derived`, not an effect.

### `$effect`: run side effects when values change

An effect runs after the DOM updates, only in the browser, and again whenever a value it read changes. Use it to sync with things outside Svelte (canvas, localStorage, timers). This codebase doesn't need one yet; exercise 5 is where you'll write your first.

```js
$effect(() => {
  drawPattern(canvas, rule); // re-runs whenever `rule` changes
  return () => {
    /* optional cleanup before the next run */
  };
});
```

### Events

Event handlers are normal attributes in Svelte 5:

```svelte
<button onclick={() => (tag = t.id)}>{t.label}</button>
```

(Older tutorials show `on:click`. That's the Svelte 4 syntax, now deprecated, so don't learn it.)

---

## 4. Template syntax

All of these appear in your files:

```svelte
{#if project.cover?.placeholder}
  <Placeholder label="Screenshot to come" />
{:else if project.cover}
  <img src={project.cover.url} alt={project.cover.alt} />
{:else}
  …
{/if}

{#each shown as project (project.slug)}   <!-- (key): helps Svelte track items when the list changes -->
  <ProjectTile {project} />
{:else}
  <p>Nothing matches that filter.</p>       <!-- shown when the list is empty -->
{/each}

{@html project.summaryHtml}                 <!-- insert raw HTML (only for trusted content!) -->

<div class:show={shown}>                    <!-- adds class "show" while `shown` is true -->
<div style:top={`${y}px`}>                  <!-- sets one style property -->
<canvas bind:this={canvas}>                 <!-- puts the DOM element into a variable -->
<input bind:value={rule}>                   <!-- two-way binding: typing updates `rule` -->
```

`{@html}` is used for Markdown that `content.js` already turned into HTML at build time. It's safe here because the HTML comes from your own files. Never use it on text a visitor typed.

`<svelte:head>` (top of every page) puts the `<title>` and meta tags into the document head.

---

## 5. SvelteKit: pages, data, build

### Routing = folders

```
src/routes/+page.svelte                    →  /
src/routes/projects/+page.svelte           →  /projects/
src/routes/projects/[slug]/+page.svelte    →  /projects/antennasim/ …
src/routes/collection/+page.svelte         →  /collection/
src/routes/+layout.svelte                  →  wraps all of them (fonts, CSS, grid size)
```

A new folder with a `+page.svelte` is a new page. `[slug]` is a parameter, like `{slug}` in an ASP.NET route.

### Loading data: `+page.server.js`

`src/routes/projects/[slug]/+page.server.js`:

```js
export function entries() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export function load({ params }) {
  const project = getProject(params.slug);
  if (!project) error(404, 'No project with that name');
  return { project };
}
```

- `load` runs on the server. Whatever it returns arrives in the page as the `data` prop: `let { data } = $props();` and then `data.project`.
- Because it's a `.server.js` file, its imports (file system, `marked`, `js-yaml`) never ship to the browser.
- `entries()` tells the static build which slugs exist, so it can write one HTML file per project.

### Prerendering: why there's no server in production

`src/routes/+layout.js`:

```js
export const prerender = true; // build every page to static HTML
export const trailingSlash = 'always'; // /projects/ → projects/index.html (GitHub Pages friendly)
```

`npm run build` runs every `load` once, renders every page to HTML, and writes everything to `build/`. That folder is the whole website. After loading, SvelteKit takes over in the browser ("hydration"), so clicking links doesn't reload the page.

**The one gotcha this causes:** the top level of a component's `<script>` also runs during the build, in Node, where there's no `window`, `document` or `localStorage`. Anything browser-only goes in `onMount`, `$effect` or an event handler. That's why `Backdrop.svelte` starts the canvas inside `onMount`:

```js
onMount(() => {
  const engine = createBackdrop(canvas, { … }); // canvas exists, window exists
  setEngine(engine);
  backdrop.ready = true;
  return () => engine.destroy(); // runs when the component is removed
});
```

`Backdrop.svelte` sits in `+layout.svelte`, and the layout stays mounted while you click between pages. So the automaton is never destroyed; only the page inside `{@render children()}` changes.

**Sharing state between components.** `Hero.svelte` needs the engine that `Backdrop.svelte` created, but neither is the other's parent. `src/lib/hero/backdrop.svelte.js` holds it:

```js
export const backdrop = $state({ ready: false, current: null, phase: 'start' });
```

Because the file ends in `.svelte.js`, `$state` works there. Any component that imports `backdrop` and reads `backdrop.ready` re-runs when it changes. `Hero.svelte` uses that in an `$effect`: it waits until the engine is ready *and* the font has loaded, then lends the engine its canvas. The function it returns detaches the canvas again when you leave the home page:

```js
$effect(() => {
  if (!backdrop.ready || !fontsReady) return; // reads both, so re-runs when either changes
  const detach = getEngine().attachName({ canvas: heroCanvas, … });
  return detach;
});
```

### Links and paths

Internal links use `{base}` from `$app/paths`: `href="{base}/projects/"`. On GitHub Pages the site lives under `/<repo>/`, and `base` adds that prefix. The workflow sets it at build time.

`page` from `$app/state` gives the current URL. `Nav.svelte` uses it to underline the active link.

### Where plain JS fits

Not everything needs to be Svelte. `content.js` (Markdown → blocks), `engine.js`, `name.js` and the automata in `src/lib/hero/automata/` (canvas animation) are plain JS modules. The components just call them. Keep heavy logic in `.js` and keep the `.svelte` files about UI; it's easier to test and to reason about.

---

## 6. Recipes

**A. Change text on the main page.** Everything is in `src/lib/site.js`: intro, education, skills, contact, CV. Edit and save.

**B. Add a project.** Copy `content/projects/_template/` to `content/projects/my-thing/`, fill in the frontmatter, add `cover.png`, write the sections with `##` headings. It appears on the home page, the projects list and at `/projects/my-thing/`. Run `npm run check` to see what's still TODO.

**C. Add a tile to the bento.** In `src/routes/+page.svelte`, copy any `<section class="tile …">`. Size it with `w2` (2 columns wide), `w4` (full width) and `h2` (2 rows tall). Tiles fill gaps automatically (`grid-auto-flow: dense` in `app.css`). Add `accent` or `ink` for the dark-green or black tile look.

**D. Add a page.** Create `src/routes/uses/+page.svelte`:

```svelte
<script>
  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<Nav />
<main class="page"><div class="bento">
  <section class="tile w4 pixel-corners"><h1>Uses</h1></section>
</div></main>
<Footer />
```

Then add ``{ href: `${base}/uses/`, label: 'Uses', match: '/uses' }`` to `links` in `Nav.svelte`.

**E. Make a component.** New file in `src/lib/components/`, `let { … } = $props()` for inputs, import it where you need it.

**F. Colours.** The four values at the top of `src/app.css`. Dark mode is derived from them.

**G. The intro.** `heroAutomaton` in `src/lib/site.js` is the one for the first visit; after that it's random. Add `?ca=lenia` to the URL to force one. Your own automaton: see "Adding your own" in the README.

**H. Update the CV.** Replace the PDF in `static/cv/`. `src/lib/server/cv.js` finds it at build time and `+page.server.js` passes it to the page as `data.cv`. It's the same pattern as the projects: plain JS on the server, data into the page.

---

## 7. Exercises

Each one builds on the last. Try it before opening the solution.

### Exercise 1: make the Matrix line copyable (data → markup)

Matrix IDs are often pasted into an app rather than clicked. Make the Matrix line in the contact tile a copy button, like Discord, without touching any `.svelte` file.

<details><summary>Solution</summary>

In `src/lib/site.js`, in `contact.right`, give the Matrix entry `copy: true`. `+page.svelte` checks `{#if c.copy}` first, so the entry turns into a copy button even though it still has a `url`. That's the point of the exercise: the markup decides *how* to show a contact line, the data only says *what* it is. To undo, remove `copy: true` again.
</details>

### Exercise 2: a "Right now" tile (props, each)

Make `src/lib/components/Now.svelte`, a tile listing what you're working on. The data goes in `site.js` as `now: [{ what: 'AntennaSim', note: '…' }, …]`. Use it in `+page.svelte` as `<Now items={site.now} class="w2" />`. If the list is empty, show "Nothing on the bench."

<details><summary>Hint</summary>

You need `$props()` with an `items` prop and a renamed `class` prop, plus `{#each}` with `{:else}`.
</details>

<details><summary>Solution</summary>

```svelte
<script>
  let { items, class: cls = '' } = $props();
</script>

<section class="tile pixel-corners {cls}">
  <h2 class="tile-title small">Right now</h2>
  <ul>
    {#each items as item}
      <li><strong>{item.what}</strong> <span class="muted">{item.note}</span></li>
    {:else}
      <li class="muted">Nothing on the bench.</li>
    {/each}
  </ul>
</section>
```
</details>

### Exercise 3: clickable age (state, events)

Clicking the ticking age in the About tile should toggle between `20.18773…` and a plain `20`. Change `AgeCounter.svelte`.

<details><summary>Hint</summary>

A second `$state` boolean, a `<button>` instead of the `<span>`, and `onclick` flips the boolean. Show one or the other with a ternary in `{…}`.
</details>

<details><summary>Solution</summary>

```svelte
<script>
  // … existing imports, born, YEAR, age(), value, onMount …
  let precise = $state(true);
</script>

<button type="button" class="age mono" onclick={() => (precise = !precise)}>
  {precise ? value : Math.floor(Number(value))}
</button>

<style>
  .age { font: inherit; font-family: var(--font-mono); color: inherit; background: none;
         border: 0; padding: 0; cursor: pointer; text-decoration: underline dotted; }
</style>
```
</details>

### Exercise 4: a `/uses` page (routing)

Follow recipe D: a page listing the hardware and software you use, with a nav link. Bonus: move the list into `site.js` and render it with `{#each}`.

### Exercise 5: rule explorer (`bind`, `$effect`, canvas)

A tile with a slider from 0 to 255. Moving it redraws that elementary cellular automaton, starting from one black cell. Rule 22 and 90 give Sierpinski triangles, 30 gives chaos and 110 is Turing-complete.

<details><summary>Hint</summary>

`let rule = $state(22)`, `<input type="range" bind:value={rule}>`, `<canvas bind:this={canvas}>`. Draw inside `$effect`: because it reads `rule`, it re-runs on every slider move. The rule lookup is the same line as in `src/lib/hero/automata/rule22.js`.
</details>

<details><summary>Solution</summary>

```svelte
<script>
  let rule = $state(22);
  let canvas;
  const COLS = 101, ROWS = 50, CELL = 4;

  $effect(() => {
    const ctx = canvas.getContext('2d');
    let row = new Uint8Array(COLS);
    row[Math.floor(COLS / 2)] = 1; // one black cell in the middle
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = getComputedStyle(canvas).color;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) if (row[x]) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      const next = new Uint8Array(COLS);
      for (let x = 0; x < COLS; x++) {
        const l = row[(x - 1 + COLS) % COLS], c = row[x], r = row[(x + 1) % COLS];
        next[x] = (rule >> ((l << 2) | (c << 1) | r)) & 1;
      }
      row = next;
    }
  });
</script>

<section class="tile w2 pixel-corners">
  <h2 class="tile-title small">Rule {rule}</h2>
  <canvas bind:this={canvas} width={COLS * CELL} height={ROWS * CELL}></canvas>
  <label>
    Rule number
    <input type="range" min="0" max="255" bind:value={rule} />
  </label>
</section>

<style>
  canvas { width: 100%; height: auto; image-rendering: pixelated; color: var(--ink); margin-bottom: 12px; }
  label { display: grid; gap: 4px; font-size: 0.9rem; }
</style>
```

**Follow-up:** switch to dark mode and the drawing stays black. Why? (The effect only re-runs when a value it *read* changes, and the theme isn't Svelte state.) Fix it by listening for the `themechange` event that `ThemeToggle.svelte` dispatches and bumping a `$state` counter that the effect reads.
</details>

### Exercise 6: on your own

- Add a `featured: true` frontmatter field and show only featured projects on the home page. Filter in `src/routes/+page.server.js` and read the field in `content.js`.
- Let a contact line have both a link *and* a copy button (an entry with `url` and `copy: true`). The `copy()` function in `+page.svelte` already exists; change the `{#if}` chain so the button is shown next to the link instead of replacing it.
- Make the pixel arrow on link tiles nudge on keyboard focus too, not only on hover (CSS `:focus-within`, next to `.tile:hover .go` in `app.css`).

---

## 8. Gotchas you will hit

- **"window is not defined" during build** means browser code is at the top level of `<script>`. Move it into `onMount` or `$effect`.
- **Destructured props aren't live.** `const { title } = data.project;` won't update if `data` changes. Use `$derived(data.project.title)`, as `+page.svelte` does for `first` and `rest`.
- **Scoped CSS.** Styles in a component's `<style>` only hit that component's elements. To style HTML from `{@html}` or a child component, wrap the selector: `.prose :global(table) { … }`.
- **Runes in `.js` files** need the file to be named `.svelte.js`.
- **Accessibility warnings** in the terminal are the compiler being helpful. Read them; they're usually right.

## 9. Further reading

- Interactive tutorial (best next step): https://svelte.dev/tutorial
- Svelte docs: https://svelte.dev/docs/svelte
- SvelteKit docs: https://svelte.dev/docs/kit
