<script>
  import { onMount } from 'svelte';

  let dark = $state(false);

  function current() {
    const set = document.documentElement.dataset.theme;
    if (set === 'dark' || set === 'light') return set === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  onMount(() => {
    dark = current();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => (dark = current());
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  });

  function toggle() {
    dark = !current();
    const theme = dark ? 'dark' : 'light';
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    try {
      if (theme === system) {
        // back to following the system setting
        delete document.documentElement.dataset.theme;
        localStorage.removeItem('theme');
      } else {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('theme', theme);
      }
    } catch {
      document.documentElement.dataset.theme = theme;
    }
    window.dispatchEvent(new CustomEvent('themechange'));
  }
</script>

<button class="toggle" type="button" onclick={toggle} aria-pressed={dark} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
  <span class="sr-only">Dark mode</span>
  <svg viewBox="0 0 8 8" width="22" height="22" shape-rendering="crispEdges" aria-hidden="true">
    <rect x="0.5" y="0.5" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1" />
    <rect x="4" y="1" width="3" height="6" fill="currentColor" />
  </svg>
</button>

<style>
  .toggle {
    display: inline-grid;
    place-items: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  svg { transition: transform 0.25s steps(4); }
  .toggle[aria-pressed='true'] svg { transform: rotate(180deg); }
</style>
