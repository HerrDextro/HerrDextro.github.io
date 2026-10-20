<script>
  import { onMount } from 'svelte';
  import { site } from '$lib/site.js';

  const born = new Date(site.birthDate).getTime();
  const YEAR = 1000 * 60 * 60 * 24 * 365.2425;
  const age = () => (Date.now() - born) / YEAR;

  let value = $state(age().toFixed(2));

  onMount(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = () => (value = age().toFixed(reduced ? 4 : 12));
    tick();
    if (reduced) return;
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  });
</script>

<span class="age mono" title="Live: years since I was born">{value}</span>

<style>
  .age { font-variant-numeric: tabular-nums; letter-spacing: -0.02em; white-space: nowrap; }
</style>
