<script>
  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import MediaBlock from '$lib/components/MediaBlock.svelte';
  import { pack, tileModel, GRIDS } from '$lib/collection-layout.js';

  let { data } = $props();
  const c = $derived(data.collection);

  // per section: a width for every tile on the desktop grid (4 columns) and the
  // tablet grid (2), chosen so every row is full and the order stays as written
  const sections = $derived(
    c.sections.map((s) => {
      const w4 = pack(s.blocks.map((b) => tileModel(b, GRIDS.desktop)), 4);
      const w2 = pack(s.blocks.map((b) => tileModel(b, GRIDS.tablet)), 2);
      return { ...s, tiles: s.blocks.map((b, i) => ({ b, w4: w4[i], w2: w2[i] })) };
    })
  );
</script>

<svelte:head>
  <title>{c.title} — Neo Dijkstra</title>
  <meta name="description" content={c.summaryHtml.replace(/<[^>]+>/g, '')} />
</svelte:head>

<Nav />

<main class="page collection">
  <div class="bento">
    <header class="tile w4 pixel-corners head">
      {#if c.eyebrow}<p class="muted from">{c.eyebrow}</p>{/if}
      <h1>{c.title}</h1>
      <p class="lead">{@html c.summaryHtml}</p>
      {#if c.sections.length > 1}
        <nav class="jump" aria-label="Sections">
          {#each c.sections.filter((s) => s.heading) as s}
            <a href="#{s.id}">{@html s.heading}</a>
          {/each}
        </nav>
      {/if}
    </header>

    {#each sections as s}
      {#if s.heading}
        <h2 class="w4 section-title" id={s.id}>{@html s.heading}</h2>
      {/if}
      {#each s.tiles as { b, w4, w2 }}
        {#if b.type === 'text' && b.heading}
          <!-- a card: one thing from the collection, its picture on top (or on the left when wide) -->
          <section class="tile pixel-corners cell card" class:wide4={w4 > 1} class:wide2={w2 > 1} style="--w4: {w4}; --w2: {w2}">
            {#if b.cover}
              <div class="cover">
                <img src={b.cover.url} alt={b.cover.alt} width={b.cover.width || undefined} height={b.cover.height || undefined} loading="lazy" />
              </div>
            {/if}
            <div class="body">
              <h3 class="tile-title small">{@html b.heading}</h3>
              <div class="prose">{@html b.html}</div>
            </div>
          </section>
        {:else if b.type === 'text'}
          <section class="tile pixel-corners cell text" style="--w4: {w4}; --w2: {w2}">
            <div class="prose">{@html b.html}</div>
          </section>
        {:else}
          <div class="tile pixel-corners cell photo" style="--w4: {w4}; --w2: {w2}; --ar: {b.width && b.height ? `${b.width} / ${b.height}` : '4 / 3'}">
            <MediaBlock block={b} fill />
          </div>
        {/if}
      {/each}
    {/each}
  </div>
</main>

<Footer />

<style>
  .collection { padding-top: clamp(16px, 3vw, 40px); }
  /* keep the written order; collection-layout.js picks widths so the rows have no gaps */
  .collection .bento { grid-auto-flow: row; grid-auto-rows: auto; }
  .cell { grid-column: span var(--w4); }
  @media (max-width: 1100px) {
    .cell { grid-column: span var(--w2); }
  }
  @media (max-width: 640px) {
    .cell { grid-column: auto; }
  }
  .head { gap: 14px; }
  .from { margin: 0; font-size: 1rem; }
  h1 { font-size: clamp(3rem, 8vw, 8rem); line-height: 0.86; }
  .lead { font-size: clamp(1.1rem, 1.4vw, 1.3rem); max-width: 36em; color: var(--muted); margin: 0; }
  .jump { display: flex; flex-wrap: wrap; gap: 6px 22px; margin-top: 8px; }
  .jump a { font-family: var(--font-display); font-weight: 700; font-size: 1.3rem; text-decoration: none; }
  .jump a:hover { text-decoration: underline; }

  .section-title {
    grid-column: 1 / -1;
    font-size: clamp(2.6rem, 5.5vw, 5rem);
    line-height: 0.9;
    margin: calc(var(--gap) * 2.5) 0 0;
    scroll-margin-top: 24px;
  }

  .photo { padding: 14px 14px 16px; background: var(--photo); color: var(--on-photo); --muted: color-mix(in srgb, var(--on-photo) 66%, var(--photo)); min-height: clamp(280px, 26vw, 400px); }

  /* cards: picture on top, it grows when the row is taller than the card */
  .card { gap: 18px; }
  .cover { position: relative; flex: 1 1 auto; min-height: clamp(200px, 17vw, 250px); background: var(--white); }
  .cover img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .body { flex: none; min-width: 0; }
  .card .tile-title { margin-bottom: 0.4em; }

  /* wide cards: picture on the left, text on the right */
  @media (min-width: 1101px) {
    .card.wide4 { flex-direction: row; gap: 28px; }
    .card.wide4 .cover { flex: 0 0 clamp(220px, 42%, 520px); min-height: 280px; }
    .card.wide4 .body { flex: 1 1 0; }
  }
  @media (min-width: 641px) and (max-width: 1100px) {
    .card.wide2 { flex-direction: row; gap: 24px; }
    .card.wide2 .cover { flex: 0 0 42%; min-height: 260px; }
    .card.wide2 .body { flex: 1 1 0; }
  }
  /* phones: one column, photos at their own shape */
  @media (max-width: 640px) {
    .photo { min-height: 0; }
    .collection .photo :global(.img-wrap) { flex: none; min-height: 0; aspect-ratio: var(--ar); }
    .cover { flex: none; min-height: 0; aspect-ratio: 4 / 3; }
  }
  .text .prose :global(ul) { columns: 2 16em; column-gap: 32px; }
  .text .prose :global(li) { break-inside: avoid; }
</style>
