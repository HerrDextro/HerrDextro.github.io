<script>
  // The little "[+] Rule 22" note in the corner of the intro: which automaton
  // is running, and what it is when you open it.
  let { automaton, show = false } = $props();
  let open = $state(false);
</script>

{#if automaton}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="note" class:show onclick={(e) => e.stopPropagation()}>
    {#if open}
      <div class="panel pixel-corners" id="automaton-note">
        <p>{automaton.text}</p>
        <p class="links">
          <a href={automaton.link} target="_blank" rel="noopener">Read more</a>
          <span class="muted">Reload the page for another one.</span>
        </p>
      </div>
    {/if}
    <button type="button" class="toggle" aria-expanded={open} aria-controls="automaton-note" onclick={() => (open = !open)}>
      <svg viewBox="0 0 7 7" width="14" height="14" shape-rendering="crispEdges" aria-hidden="true">
        <rect x="0" y="3" width="7" height="1" fill="currentColor" />
        {#if !open}<rect x="3" y="0" width="1" height="7" fill="currentColor" />{/if}
      </svg>
      <span class="sr-only">{open ? 'Hide' : 'About'} the animation:</span>
      {automaton.name}
    </button>
  </div>
{/if}

<style>
  .note {
    position: absolute;
    left: var(--page-pad);
    bottom: 22px;
    z-index: 3;
    display: grid;
    justify-items: start;
    gap: 8px;
    max-width: min(22rem, calc(100% - var(--page-pad) * 2));
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.7s ease 0.4s;
  }
  .note.show { opacity: 1; pointer-events: auto; }
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px 6px 8px;
    border: 0;
    background: var(--ink);
    color: var(--bg);
    font-family: var(--font-mono);
    font-size: 0.8rem;
    line-height: 1;
    cursor: pointer;
  }
  .toggle svg {
    padding: 2px;
    background: var(--bg);
    color: var(--ink);
    box-sizing: content-box;
  }
  .panel {
    background: var(--tile);
    color: var(--ink);
    padding: 16px 18px;
    font-size: 0.9rem;
    line-height: 1.45;
  }
  .panel p { margin: 0 0 0.6em; }
  .links { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 0 !important; font-size: 0.85rem; }
  @media (prefers-reduced-motion: reduce) { .note { transition: none; } }
</style>
