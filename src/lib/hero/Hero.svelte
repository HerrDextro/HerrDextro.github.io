<script>
  // The home page intro: the pixel name, the line under it and the buttons.
  // The automaton itself runs in Backdrop.svelte (behind every page); this
  // component lends it a canvas for the name while the home page is shown.
  import { onMount, tick } from 'svelte';
  import { base } from '$app/paths';
  import Nav from '$lib/components/Nav.svelte';
  import AutomatonNote from './AutomatonNote.svelte';
  import { backdrop, getEngine } from './backdrop.svelte.js';
  import { site } from '$lib/site.js';

  let heroCanvas;
  let copyEl;
  let layout = $state(null);
  let fontsReady = $state(false);
  const shown = $derived(backdrop.phase === 'named' || backdrop.phase === 'done');

  const FONT = '"Sofia Sans Extra Condensed Variable", "Arial Narrow", sans-serif';
  const WEIGHT = 860;

  onMount(async () => {
    // the name is rasterised from the font, so wait for it (but not forever)
    try {
      await Promise.race([
        document.fonts.load(`${WEIGHT} 100px "Sofia Sans Extra Condensed Variable"`, 'NEO DIJKSTRA'),
        new Promise((r) => setTimeout(r, 1500))
      ]);
    } catch {}
    fontsReady = true;
  });

  // once both the engine and the font are ready, hand the engine our canvas
  $effect(() => {
    if (!backdrop.ready || !fontsReady) return;
    const engine = getEngine();
    const detach = engine.attachName({
      canvas: heroCanvas,
      text: ['NEO', 'DIJKSTRA'],
      font: FONT,
      weight: WEIGHT,
      onLayout: async (r) => {
        layout = r;
        document.documentElement.style.setProperty('--cell', `${r.cell}px`);
        // keep the line + buttons under the name on a clean patch of grid
        await tick();
        await new Promise((res) => requestAnimationFrame(res));
        if (!copyEl) return;
        const box = copyEl.getBoundingClientRect();
        const host = heroCanvas.getBoundingClientRect();
        engine.addClearRect(box.left - host.left, box.top - host.top, box.width, box.height);
      }
    });
    return detach;
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<section class="hero" onclick={() => getEngine()?.skip()}>
  <canvas class="hero-canvas" bind:this={heroCanvas} aria-hidden="true"></canvas>
  <Nav overlay show={shown} />

  <h1 class="sr-only">Neo Dijkstra</h1>
  <noscript><p class="noscript-name">Neo Dijkstra</p></noscript>

  <div
    bind:this={copyEl}
    class="copy"
    class:show={shown}
    style:top={layout ? `${layout.nameBottom + layout.cell * 4}px` : null}
  >
    <p class="line">{site.heroLine}</p>
    <div class="actions">
      <a class="btn ink" href="{base}/#projects">See my projects</a>
      <a class="btn" href="{base}/#contact">Get in touch</a>
    </div>
  </div>

  <a class="cue" class:show={shown} href="#about" aria-label="Scroll to the overview">
    <svg viewBox="0 0 7 4" width="28" height="16" shape-rendering="crispEdges" aria-hidden="true">
      <path d="M0 0h1v1H0zM1 1h1v1H1zM2 2h1v1H2zM3 3h1v1H3zM4 2h1v1H4zM5 1h1v1H5zM6 0h1v1H6z" fill="currentColor" />
    </svg>
  </a>
  <AutomatonNote automaton={backdrop.current} show={shown} />
</section>

<style>
  .hero {
    position: relative;
    height: 100vh;
    height: 100svh;
    min-height: 520px;
    overflow: hidden;
  }
  .hero-canvas { position: absolute; inset: 0; width: 100%; height: 100%; image-rendering: pixelated; pointer-events: none; }
  .copy {
    position: absolute;
    left: 50%;
    top: 62%;
    transform: translate(-50%, 12px);
    width: min(44rem, calc(100% - var(--page-pad) * 2));
    text-align: center;
    opacity: 0;
    transition: opacity 0.7s ease, transform 0.7s ease;
    pointer-events: none;
  }
  .copy.show { opacity: 1; transform: translate(-50%, 0); pointer-events: auto; }
  .line {
    font-size: clamp(1.1rem, 1.5vw, 1.35rem);
    line-height: 1.45;
    margin: 0 auto 1.6rem;
    max-width: 36em;
    text-wrap: balance;
  }
  .actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

  .cue {
    position: absolute;
    left: 50%;
    bottom: 22px;
    transform: translateX(-50%);
    padding: 10px;
    color: var(--ink);
    opacity: 0;
    transition: opacity 0.7s ease 0.4s;
  }
  .cue.show { opacity: 1; animation: nudge 1.6s steps(2) infinite 1.5s; }
  @keyframes nudge { 50% { transform: translate(-50%, 6px); } }

  .noscript-name {
    position: absolute;
    inset: 30% 0 auto;
    text-align: center;
    font-family: var(--font-display);
    font-weight: 860;
    font-size: 18vw;
    line-height: 0.8;
    margin: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .copy, .cue { transition: none; }
    .cue.show { animation: none; }
  }
</style>
