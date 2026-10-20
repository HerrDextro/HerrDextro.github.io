<script>
  // the four fact tiles at the top of a project page
  let { project } = $props();
  const p = $derived(project);
</script>

<section class="tile pixel-corners fact">
  <h2 class="label">Status</h2>
  <p class="big"><span class="chip accent">{p.statusLabel}</span></p>
  <p class="note">{@html p.statusNote}</p>
</section>
{#if p.approachLabel}
  <section class="tile pixel-corners fact">
    <h2 class="label">How it was made</h2>
    <p class="big"><span class="chip">{p.approachLabel}</span></p>
    <p class="note">{@html p.approachNote}</p>
  </section>
{/if}
<section class="tile pixel-corners fact">
  <h2 class="label">When and who</h2>
  <dl>
    <dt>Period</dt><dd>{p.period}</dd>
    {#if p.contextLabel}<dt>Context</dt><dd>{p.contextLabel}</dd>{/if}
    <dt>Team</dt><dd>{p.team}{#if p.role}, {@html p.role}{/if}</dd>
    <dt>Domain</dt><dd>{p.tags.map((t) => t.label).join(', ')}</dd>
  </dl>
</section>
<section class="tile pixel-corners fact">
  <h2 class="label">Stack</h2>
  <ul class="chips">
    {#each p.stack as s}<li class="chip mono-chip">{s}</li>{/each}
  </ul>
</section>

<style>
  .fact { gap: 10px; }
  .label { font-family: var(--font-body); font-weight: 600; font-size: 0.9rem; line-height: 1.3; color: var(--muted); }
  .big { margin: 0; }
  .big .chip { font-size: 1rem; }
  .note { font-size: 0.95rem; margin: 0; }
  dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 14px; margin: 0; font-size: 0.95rem; }
  dt { color: var(--muted); }
  dd { margin: 0; }
  .mono-chip { font-family: var(--font-mono); font-size: 0.76rem; }
</style>
