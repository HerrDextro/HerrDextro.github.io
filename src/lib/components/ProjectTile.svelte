<script>
  import { base } from '$app/paths';
  import Placeholder from './Placeholder.svelte';
  let { project, size = 'small', class: cls = '', id = undefined } = $props();
</script>

<article class="tile project {size} pixel-corners {cls}" {id}>
  {#if project.cover?.placeholder}
    <div class="cover"><Placeholder label="Screenshot to come" compact /></div>
  {:else if project.cover}
    <div class="cover">
      <img src={project.cover.url} alt={project.cover.alt} width={project.cover.width || undefined} height={project.cover.height || undefined} loading="lazy" />
    </div>
  {:else}
    <div class="cover empty" aria-hidden="true"></div>
  {/if}
  <div class="body">
    <div class="meta">
      <span class="chip accent">{project.statusLabel}</span>
      {#if project.approachLabel}<span class="chip">{project.approachLabel}</span>{/if}
    </div>
    <h3 class="title">
      <a class="tile-link" href="{base}/projects/{project.slug}/">{project.title}</a>
    </h3>
    <p class="summary">{@html project.summaryHtml}</p>
    <div class="foot">
      <span class="muted">{project.tags.map((t) => t.label).join(', ')}</span>
      <span class="go" aria-hidden="true"></span>
    </div>
  </div>
</article>

<style>
  .project { padding: 0; overflow: hidden; }
  .cover {
    position: relative;
    background: var(--white);
    flex: 1 1 170px;
    min-height: 170px;
    overflow: hidden;
    border-bottom: 1px solid var(--hair);
  }
  .large .cover { flex-basis: 260px; min-height: 260px; }
  .cover img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; }
  .cover.empty { background: repeating-linear-gradient(45deg, var(--faint) 0 var(--cell), transparent var(--cell) calc(var(--cell) * 2)); }
  .body {
    padding: var(--tile-pad);
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 0 0 auto;
  }
  .meta { display: flex; gap: 6px; flex-wrap: wrap; }
  .title { font-size: clamp(1.8rem, 2.4vw, 2.4rem); }
  .large .title { font-size: clamp(2.2rem, 3.4vw, 3.4rem); }
  .summary { color: var(--muted); max-width: 46ch; }
  .foot { margin-top: auto; display: flex; align-items: end; justify-content: space-between; gap: 12px; font-size: 0.9rem; }
</style>
