<script>
  // One image or placeholder block from content.js, as a figure
  import Placeholder from './Placeholder.svelte';
  let { block, fill = false } = $props();
</script>

{#if block.type === 'placeholder'}
  <figure class="media" class:fill>
    <Placeholder caption={block.caption} />
  </figure>
{:else}
  <figure class="media" class:fill>
    <div class="img-wrap">
      <img src={block.url} alt={block.alt} width={block.width || undefined} height={block.height || undefined} loading="lazy" />
    </div>
    {#if block.caption}<figcaption>{@html block.caption}</figcaption>{/if}
  </figure>
{/if}

<style>
  .media { margin: 0; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
  .img-wrap { background: var(--white); }
  img { width: 100%; height: auto; }
  figcaption { font-size: 0.86rem; line-height: 1.45; color: var(--muted); max-width: 70ch; }

  /* fill: the photo takes all the room its tile has (collection grid) */
  .fill { height: 100%; }
  .fill .img-wrap { position: relative; flex: 1 1 auto; min-height: 180px; }
  .fill img { position: absolute; inset: 0; height: 100%; object-fit: cover; }
</style>
