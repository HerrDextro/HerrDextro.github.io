<script>
  import { base } from '$app/paths';
  import { page } from '$app/state';
  import ThemeToggle from './ThemeToggle.svelte';
  import Swatch from './Swatch.svelte';

  let { overlay = false, show = true } = $props();

  const links = [
    { href: `${base}/projects/`, label: 'Projects', match: '/projects' },
    { href: `${base}/collection/`, label: 'Collection', match: '/collection' },
    { href: `${base}/#contact`, label: 'Contact', match: null }
  ];
  const active = (m) => m && page.url.pathname.startsWith(`${base}${m}`);
</script>

<header class="nav" class:overlay class:show>
  <a class="home" href="{base}/" aria-label="Neo Dijkstra, home">
    <Swatch size={22} />
    {#if !overlay}<span class="name">Neo Dijkstra</span>{/if}
  </a>
  <nav aria-label="Main">
    {#each links as l}
      <a href={l.href} aria-current={active(l.match) ? 'page' : undefined}>{l.label}</a>
    {/each}
    <ThemeToggle />
  </nav>
</header>

<style>
  .nav {
    position: relative;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px var(--page-pad);
    max-width: calc(var(--max) + var(--page-pad) * 2);
    margin: 0 auto;
  }
  .nav.overlay {
    position: absolute;
    inset: 0 0 auto 0;
    max-width: none;
    opacity: 0;
    transition: opacity 0.6s ease;
  }
  .nav.overlay.show { opacity: 1; }
  @media (prefers-reduced-motion: reduce) { .nav.overlay { transition: none; } }

  .home {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.5rem;
    line-height: 1;
  }
  nav { display: flex; align-items: center; gap: clamp(12px, 2.4vw, 32px); }
  nav a {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.3rem;
    text-decoration: none;
    line-height: 1;
  }
  nav a:hover, nav a[aria-current='page'] { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 0.25em; }
  @media (max-width: 480px) {
    .name { display: none; }
    nav a { font-size: 1.15rem; }
  }
</style>
