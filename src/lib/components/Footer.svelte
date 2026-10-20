<script>
  import { site } from '$lib/site.js';
</script>

<footer class="page">
  <span>{site.footer.copyright}</span>
  <span class="tape"><span>{site.footer.disclaimer}</span></span>
  <span class="muted">v{site.version}</span>
  <p class="tm muted">{site.footer.trademarks}</p>
</footer>

<style>
  footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 28px;
    padding-top: calc(var(--gap) * 3);
    padding-bottom: 48px;
    font-size: 0.92rem;
  }
  footer > span:nth-child(3) { margin-left: auto; }
  .tm { flex-basis: 100%; margin: 0; font-size: 0.78rem; }

  /* construction-site tape around the disclaimer (yellow/black on purpose, in both themes) */
  .tape {
    padding: 6px;
    background: repeating-linear-gradient(-45deg, #ffd400 0 8px, #000000 8px 16px);
  }
  .tape span {
    display: block;
    padding: 6px 12px;
    background: var(--bg);
    color: var(--ink);
  }
</style>
