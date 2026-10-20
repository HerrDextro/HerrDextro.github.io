<script>
  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ProjectTile from '$lib/components/ProjectTile.svelte';

  let { data } = $props();
  let tag = $state('all');
  const shown = $derived(tag === 'all' ? data.projects : data.projects.filter((p) => p.tags.some((t) => t.id === tag)));
</script>

<svelte:head>
  <title>Projects — Neo Dijkstra</title>
  <meta name="description" content="What Neo Dijkstra has built: antennas, simulation tools, firmware pipelines." />
</svelte:head>

<Nav />

<main class="page projects">
  <div class="bento">
    <header class="tile w4 pixel-corners head">
      <h1>What I've built</h1>
      <p class="lead">Each project is tagged with its real status and with how it was made: by hand, or AI-assisted.</p>
      <div class="filter" role="group" aria-label="Filter by domain">
        <button type="button" aria-pressed={tag === 'all'} onclick={() => (tag = 'all')}>All</button>
        {#each data.tags as t}
          <button type="button" aria-pressed={tag === t.id} onclick={() => (tag = t.id)}>{t.label}</button>
        {/each}
      </div>
    </header>

    {#each shown as project (project.slug)}
      <ProjectTile {project} size="large" class="w2 h2" />
    {:else}
      <p class="tile w4 pixel-corners empty">Nothing matches that filter.</p>
    {/each}

    <section class="tile w2 pixel-corners more">
      <h2 class="tile-title small">More coming soon: hand-coded projects, every line written by me.</h2>
    </section>
  </div>
</main>

<Footer />

<style>
  .projects { padding-top: clamp(16px, 3vw, 40px); }
  .head { gap: 18px; }
  h1 { font-size: clamp(3rem, 8vw, 8rem); line-height: 0.86; }
  .lead { font-size: clamp(1.1rem, 1.4vw, 1.3rem); max-width: 36em; color: var(--muted); margin: 0; }
  .filter { display: flex; flex-wrap: wrap; gap: 6px; }
  .filter button {
    font: inherit;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.1rem;
    line-height: 1.1;
    padding: 0.35em 0.8em;
    border: 0;
    background: var(--faint);
    color: var(--ink);
    cursor: pointer;
  }
  .filter button[aria-pressed='true'] { background: var(--ink); color: var(--tile); }
  .more { justify-content: center; background: transparent; outline: 2px dashed var(--hair); outline-offset: -2px; clip-path: none; }
  .more h2 { color: var(--muted); margin: 0; }
  .empty { margin: 0; }
</style>
