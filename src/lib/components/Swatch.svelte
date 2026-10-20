<script>
  // The 3x3 C# ConsoleColor block from the hero, as a small mark
  import { CONSOLE_SWATCHES } from '$lib/hero/name.js';
  let { size = 22 } = $props();
</script>

<svg viewBox="0 0 11 11" width={size} height={size} shape-rendering="crispEdges" aria-hidden="true">
  {#each CONSOLE_SWATCHES as c, i}
    <rect x={(i % 3) * 4} y={Math.floor(i / 3) * 4} width="3" height="3" fill={c} />
  {/each}
</svg>
