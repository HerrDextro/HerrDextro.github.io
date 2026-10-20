<script>
  // The automaton behind every page. It sits in +layout.svelte, so it isn't
  // re-created when you navigate: the same simulation keeps running.
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { page } from '$app/state';
  import { createBackdrop } from './engine.js';
  import { pickAutomaton } from './automata/index.js';
  import { backdrop, setEngine, getEngine } from './backdrop.svelte.js';
  import { site } from '$lib/site.js';

  let canvas;
  const isHome = $derived(page.url.pathname === `${base}/` || page.url.pathname === base);

  onMount(() => {
    const choice = pickAutomaton(site.heroAutomaton);
    backdrop.current = choice;
    const engine = createBackdrop(canvas, {
      sim: choice.make(),
      intro: isHome, // a direct visit to another page starts without the intro
      image: site.heroImage,
      onPhase: (p) => (backdrop.phase = p)
    });
    engine.setCalm(!isHome);
    setEngine(engine);
    backdrop.ready = true;

    const refresh = () => engine.refreshColors();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    window.addEventListener('themechange', refresh);
    mq.addEventListener('change', refresh);
    return () => {
      engine.destroy();
      setEngine(null);
      backdrop.ready = false;
      window.removeEventListener('themechange', refresh);
      mq.removeEventListener('change', refresh);
    };
  });

  // fainter and slower behind the other pages
  $effect(() => {
    const calm = !isHome;
    if (backdrop.ready) getEngine()?.setCalm(calm);
  });
</script>

<canvas class="backdrop" bind:this={canvas} aria-hidden="true"></canvas>

<style>
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    height: 100lvh; /* doesn't change when a phone's URL bar hides */
    z-index: -1;
    pointer-events: none;
    image-rendering: pixelated;
  }
</style>
