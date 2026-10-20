<script>
  // A product-shot tile: photo on the tile colour, short caption
  let { src, alt, caption = alt, fit = 'contain', class: cls = '', pad = true, style = '' } = $props();
</script>

<figure class="tile image-tile pixel-corners {cls}" class:pad {style}>
  <div class="frame">
    <img {src} {alt} loading="lazy" style:object-fit={fit} />
  </div>
  {#if caption}<figcaption>{caption}</figcaption>{/if}
</figure>

<style>
  .image-tile { margin: 0; padding: 0; overflow: hidden; background: var(--photo); color: var(--on-photo); --muted: color-mix(in srgb, var(--on-photo) 66%, var(--photo)); }
  .frame { flex: 1 1 auto; min-height: 160px; position: relative; }
  .pad .frame { margin: var(--tile-pad) var(--tile-pad) 0; }
  img { position: absolute; inset: 0; width: 100%; height: 100%; }
  figcaption {
    padding: 14px var(--tile-pad) calc(var(--tile-pad) * 0.8);
    font-size: 0.9rem;
    color: var(--muted);
  }
</style>
