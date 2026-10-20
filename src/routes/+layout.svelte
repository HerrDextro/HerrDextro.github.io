<script>
  import '@fontsource-variable/sofia-sans';
  import '@fontsource-variable/sofia-sans-extra-condensed';
  import '@fontsource/jetbrains-mono/400.css';
  import '../app.css';
  import { onMount } from 'svelte';
  import { cellSizeFor } from '$lib/hero/name.js';
  import Backdrop from '$lib/hero/Backdrop.svelte';

  let { children } = $props();

  // keep the background grid pitch identical to the hero's pixel cells
  onMount(() => {
    const set = () => document.documentElement.style.setProperty('--cell', `${cellSizeFor(window.innerWidth)}px`);
    set();
    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  });
</script>

<Backdrop />
{@render children()}
