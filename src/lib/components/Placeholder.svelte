<script>
  // Stand-in for a picture that doesn't exist yet: a checkerboard of grid
  // cells plus the description of what the photo should show.
  let { caption = '', label = 'Image to come', compact = false, class: cls = '' } = $props();
</script>

<div class="ph {cls}" class:compact role="img" aria-label="{label}: {caption.replace(/<[^>]+>/g, '')}">
  <span class="label">{label}</span>
  {#if caption && !compact}<span class="what">{@html caption}</span>{/if}
</div>

<style>
  .ph {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 6px;
    min-height: 180px;
    height: 100%;
    padding: 18px;
    background:
      repeating-conic-gradient(var(--faint) 0 25%, transparent 0 50%) 0 0 / calc(var(--cell) * 2) calc(var(--cell) * 2),
      var(--tile);
    color: var(--ink);
  }
  .label {
    align-self: flex-start;
    font-family: var(--font-display);
    font-weight: 750;
    font-size: 1.2rem;
    line-height: 1;
    background: var(--ink);
    color: var(--tile);
    padding: 0.3em 0.55em 0.35em;
  }
  .what {
    align-self: flex-start;
    max-width: 44ch;
    font-size: 0.86rem;
    line-height: 1.4;
    background: var(--tile);
    padding: 0.45em 0.6em;
  }
  .compact { min-height: 0; }
</style>
