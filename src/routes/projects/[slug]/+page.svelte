<script>
  import { base } from '$app/paths';
  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ProjectFacts from '$lib/components/ProjectFacts.svelte';
  import MediaBlock from '$lib/components/MediaBlock.svelte';
  import Placeholder from '$lib/components/Placeholder.svelte';

  let { data } = $props();
  const p = $derived(data.project);

  // Each ## section becomes one row: text beside its pictures (alternating
  // sides), or a full-width tile with the heading in its own column.
  const rows = $derived.by(() => {
    let flip = false;
    return p.sections.map((s) => {
      const text = s.blocks.filter((b) => b.type === 'text');
      const media = s.blocks.filter((b) => b.type !== 'text');
      if (media.length) {
        flip = !flip;
        return { kind: 'media', s, text, media, flip: !flip };
      }
      return { kind: 'full', s, text };
    });
  });
</script>

<svelte:head>
  <title>{p.title} — Neo Dijkstra</title>
  <meta name="description" content={p.summary} />
</svelte:head>

<Nav />

<main class="page project">
  <div class="bar">
    <a class="back" href="{base}/projects/">All projects</a>
  </div>

  <div class="bento">
    <header class="tile w2 pixel-corners head">
      <div class="chips">
        <span class="chip accent">{p.statusLabel}</span>
        {#if p.approachLabel}<span class="chip">{p.approachLabel}</span>{/if}
        {#if p.contextLabel}<span class="chip">{p.contextLabel}</span>{/if}
      </div>
      <h1>{p.title}</h1>
      <p class="summary">{@html p.summaryHtml}</p>
      {#if p.links.length}
        <p class="links">
          {#each p.links as l}
            <a class="btn ink" href={l.url} target="_blank" rel="noopener">{l.label}</a>
          {/each}
        </p>
      {/if}
    </header>

    <figure class="tile w2 flush pixel-corners cover">
      {#if p.cover?.placeholder}
        <Placeholder label="Screenshot to come" caption={p.cover.alt} />
      {:else if p.cover}
        <img src={p.cover.url} alt={p.cover.alt} />
      {:else}
        <Placeholder label="Cover to come" />
      {/if}
    </figure>

    <ProjectFacts project={p} />

    {#each rows as row}
      {#if row.kind === 'media'}
        <div class="row w4" class:flip={row.flip}>
        <section class="tile pixel-corners section-text" id={row.s.id}>
          {#if row.s.heading}<h2 class="sec-title">{@html row.s.heading}</h2>{/if}
          <div class="prose">
            {#each row.text as b}
              {#if b.heading}<h3>{@html b.heading}</h3>{/if}
              {@html b.html}
            {/each}
          </div>
        </section>
        <div class="tile pixel-corners section-media">
          <div class="stick">
            {#each row.media as m}<MediaBlock block={m} />{/each}
          </div>
        </div>
        </div>
      {:else}
        <section class="tile w4 pixel-corners section-full" id={row.s.id}>
          {#if row.s.heading}<h2 class="sec-title">{@html row.s.heading}</h2>{/if}
          <div class="prose">
            {#each row.text as b}
              {#if b.heading}<h3>{@html b.heading}</h3>{/if}
              {@html b.html}
            {/each}
          </div>
        </section>
      {/if}
    {/each}

    {#if p.next}
      <section class="tile w2 ink pixel-corners next">
        <span class="muted-on-ink">Next project</span>
        <h2 class="tile-title"><a class="tile-link" href="{base}/projects/{p.next.slug}/">{p.next.title}</a></h2>
        <p>{@html p.next.summaryHtml}</p>
        <span class="go" aria-hidden="true"></span>
      </section>
    {/if}
    <section class="tile w2 pixel-corners next">
      <span class="muted">Back to</span>
      <h2 class="tile-title"><a class="tile-link" href="{base}/projects/">All projects</a></h2>
      <p class="muted">Each project is tagged with its real status and with how it was made: by hand, or AI-assisted.</p>
      <span class="go" aria-hidden="true"></span>
    </section>
  </div>
</main>

<Footer />

<style>
  .project { padding-top: clamp(16px, 3vw, 40px); }
  .bar { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: var(--gap); }
  .back { font-family: var(--font-display); font-weight: 700; font-size: 1.25rem; text-decoration: none; }
  .back::before { content: '← '; }
  .back:hover { text-decoration: underline; }

  .head { gap: 18px; justify-content: flex-end; }
  @media (min-width: 641px) { .head { min-height: 380px; } }
  h1 { font-size: clamp(3rem, 6.4vw, 6.6rem); line-height: 0.86; }
  .summary { font-size: clamp(1.1rem, 1.4vw, 1.3rem); max-width: 36em; }
  .links { display: flex; gap: 8px; flex-wrap: wrap; margin: 0; }

  .cover { margin: 0; background: var(--white); min-height: 320px; position: relative; }
  .cover img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

  .sec-title { font-size: clamp(2rem, 3vw, 3rem); margin-bottom: 0.6em; }

  .row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--gap); }
  .row.flip .section-media { order: -1; }
  @media (max-width: 900px) {
    .row { grid-template-columns: minmax(0, 1fr); }
    .row.flip .section-media { order: 0; }
  }
  .section-media { justify-content: flex-start; }
  .stick { position: sticky; top: var(--gap); display: grid; gap: 28px; }

  .section-full { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 3fr); gap: 0 40px; align-items: start; }
  .section-full .sec-title { position: sticky; top: var(--gap); }
  @media (max-width: 900px) {
    .section-full { grid-template-columns: 1fr; }
    .section-full .sec-title { position: static; }
  }

  .next { gap: 10px; }
  .next .go { margin-top: auto; align-self: flex-end; }
  .muted-on-ink { color: color-mix(in srgb, var(--bg) 70%, var(--ink)); }
</style>
