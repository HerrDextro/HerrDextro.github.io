<script>
  import { base } from '$app/paths';
  import Hero from '$lib/hero/Hero.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import AgeCounter from '$lib/components/AgeCounter.svelte';
  import ImageTile from '$lib/components/ImageTile.svelte';
  import ContactIcon from '$lib/components/ContactIcon.svelte';
  import { site } from '$lib/site.js';

  import hexacopter from '$lib/images/hexacopter.webp';
  import meshnode from '$lib/images/meshnode.webp';
  import lanterns from '$lib/images/hobby-lanterns.webp';
  import pigeon from '$lib/images/hobby-pigeon.webp';
  import roadworks from '$lib/images/hobby-roadworks.webp';

  let { data } = $props();

  // the projects card lists this many, then "+ N more"
  const SHOW = 4;
  const listed = $derived(data.projects.slice(0, SHOW));
  const more = $derived(data.projects.length - listed.length);

  // Discord has no link-by-username, so the handle is copied to the clipboard
  let copied = $state('');
  let copyTimer;
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      copied = text;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => (copied = ''), 2000);
    } catch {
      copied = '';
    }
  }

  const [beforeAge, afterAge] = site.introP1.split('{AGE}');
  const [beforeNl, afterNl] = afterAge.split('{NL}');
  const introP3 = site.introP3.replace('{PROJECTS}', `${base}/projects/`);
</script>

<svelte:head>
  <title>Neo Dijkstra — Portfolio (v{site.version})</title>
  <meta name="description" content="Neo Dijkstra, Applications Development student in Aargau, Switzerland. Projects in hardware, radio, embedded and fullstack software." />
</svelte:head>

<Hero />

<!--
  Desktop: three columns.
    top:      about me (columns 1+2) | praktikum, CV (column 3)
    column 1: skills → projects
    column 2: education → currently → hexacopter
    column 3: … outside of code → before IMS → mesh node
  The last tile of every column stretches, so the columns end level.
  Below 1100 px everything becomes one list, ordered by `--o`.
-->
<main class="page home" id="about">
  <div class="layout">
    <!-- left: about me (two columns wide), then two columns of tiles -->
    <div class="left">
      <section class="tile pixel-corners about" style="--o: 1">
        <h2 class="hello">{site.greeting}</h2>
        <div class="intro">
          <p>
            {beforeAge}<AgeCounter />{beforeNl}<span class="nl">Netherlands<svg class="flag" viewBox="0 0 9 6" width="18" height="12" shape-rendering="crispEdges" role="img" aria-label="Dutch flag"><rect width="9" height="2" fill="#ae1c28" /><rect y="2" width="9" height="2" fill="#ffffff" /><rect y="4" width="9" height="2" fill="#21468b" /></svg></span>{afterNl}
          </p>
          <p>{site.aboutP2}</p>
          <p>{@html introP3}</p>
        </div>
      </section>
      <div class="pair">
        <!-- column 1 -->
        <div class="col">
          <section class="tile pixel-corners skills" style="--o: 4">
            <h2 class="tile-title">{site.skills.title}</h2>
            <h3>{site.skills.langPlatLabel}</h3>
            <ol class="ranked">
              {#each site.skills.langPlat as s}<li>{s}</li>{/each}
            </ol>
            <h3>{site.skills.techLabel}</h3>
            <ol class="ranked">
              {#each site.skills.tech as s}<li>{s}</li>{/each}
            </ol>
          </section>
          <section class="tile ink pixel-corners projects stretch" id="projects" style="--o: 5">
            <h2 class="tile-title">Projects</h2>
            <ul class="plist">
              {#each listed as p (p.slug)}
                <li>
                  <a href="{base}/projects/{p.slug}/">
                    <span class="ptitle">{p.title}</span>
                    <span class="pmeta">{p.statusLabel}{#if p.approachLabel} · {p.approachLabel}{/if}</span>
                    <span class="psum">{@html p.summaryHtml}</span>
                  </a>
                </li>
              {/each}
            </ul>
            <a class="all" href="{base}/projects/">
              {more > 0 ? `All projects (+${more} more)` : 'All projects'}
              <span class="go" aria-hidden="true"></span>
            </a>
          </section>
        </div>
        <!-- column 2 -->
        <div class="col">
          <section class="tile pixel-corners education" style="--o: 6">
            <h2 class="tile-title">Education</h2>
            <ol class="timeline">
              {#each site.education as e, i}
                <li class:now={i === 0}>
                  <span class="date">{e.date}</span>
                  <strong>{e.title}</strong>
                  <span class="muted">{e.place}</span>
                </li>
              {/each}
            </ol>
          </section>
          <section class="tile pixel-corners" style="--o: 7">
            <h2 class="tile-title small">{site.currently.title}</h2>
            <p class="small-text">{site.currently.text}</p>
          </section>
          <ImageTile class="stretch" src={hexacopter} alt="Hexacopter" style="--o: 11" />
        </div>
      </div>
    </div>

    <!-- column 3 -->
    <div class="col">
      <section class="tile accent pixel-corners looking" style="--o: 2">
        <h2 class="tile-title">Praktikum from August 2027</h2>
        <p>{site.lookingFor}</p>
        <p class="push"><a class="btn ink" href="#contact">Contact me</a></p>
      </section>
      <section class="tile pixel-corners cv" style="--o: 3">
        <div class="cv-thumb" aria-hidden="true">
          <span class="cv-lines"></span>
          <span class="cv-label">PDF</span>
        </div>
        <h2 class="tile-title">
          {#if data.cv}
            <a class="tile-link" href="{base}/{data.cv.href}" download>CV (PDF)</a>
          {:else}
            CV (PDF)
          {/if}
        </h2>
        <p class="muted">{data.cv ? `Download, ${data.cv.size}` : site.cv.note}</p>
      </section>
      <section class="tile pixel-corners hobbies" style="--o: 9">
        <h2 class="tile-title">
          <a class="tile-link" href="{base}/collection/">{site.hobbies.title}</a>
        </h2>
        <p>{site.hobbies.text}</p>
        <p class="muted">{site.hobbies.text2}</p>
        <div class="prints" aria-hidden="true">
          <img src={lanterns} alt="" loading="lazy" />
          <img src={roadworks} alt="" loading="lazy" />
          <img src={pigeon} alt="" loading="lazy" />
        </div>
        <p class="hobby-link">{site.hobbies.link} <span class="go" aria-hidden="true"></span></p>
      </section>
      <section class="tile pixel-corners" style="--o: 8">
        <h2 class="tile-title small">{site.beforeIms.title}</h2>
        <p class="small-text">{site.beforeIms.text}</p>
      </section>
      <ImageTile class="stretch" src={meshnode} alt="Meshtastic node" style="--o: 10" />
    </div>

    <!-- contact, full width -->
    <section class="tile accent pixel-corners contact" id="contact" style="--o: 13">
      <h2 class="tile-title">Get in touch</h2>
      <div class="ways">
        {#each [site.contact.left, site.contact.right] as group}
          <ul>
            {#each group as c}
              <li>
                <span class="ico"><ContactIcon name={c.icon} /></span>
                <span class="what">
                  <span class="label">{c.label}</span>
                  {#if c.copy}
                    <button type="button" class="copy" onclick={() => copy(c.text)} title="Copy {c.label} username">
                      {c.text}
                      <ContactIcon name="copy" size={12} />
                      <span class="copied" aria-live="polite">{copied === c.text ? 'Copied' : ''}</span>
                    </button>
                  {:else if c.url && c.url !== '#'}
                    <a href={c.url} target={c.url.startsWith('mailto:') ? undefined : '_blank'} rel="noopener">{c.text}</a>
                  {:else if c.url === '#'}
                    <span class="soon">{c.text} <span class="chip">coming soon</span></span>
                  {:else}
                    <span>{c.text}</span>
                  {/if}
                </span>
              </li>
            {/each}
          </ul>
        {/each}
      </div>
    </section>
  </div>
</main>

<Footer />

<style>
  .home { padding-top: clamp(48px, 8vw, 120px); }
  :global(#projects) { scroll-margin-top: 40px; }

  /* ===================== layout ===================== */
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: var(--gap);
  }
  .left, .col { display: flex; flex-direction: column; gap: var(--gap); min-width: 0; }
  .pair {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--gap);
  }
  /* the last tile in each column takes up the slack so the columns end level */
  .col > :global(.stretch) { flex: 1 1 auto; }
  .col > :global(.image-tile) { min-height: 280px; }
  .contact { grid-column: 1 / -1; }

  @media (max-width: 1100px) {
    /* one list, in reading order */
    .layout { display: flex; flex-direction: column; max-width: 760px; margin: 0 auto; }
    .left, .col, .pair { display: contents; }
    .layout :global(.tile) { order: var(--o); }
    .layout :global(.image-tile) { min-height: 300px; }
  }

  /* ===================== tiles ===================== */
  .about { gap: 26px; }
  .hello { font-size: clamp(2.8rem, 6vw, 6.4rem); line-height: 0.86; max-width: 7em; }
  .intro { font-size: clamp(1.05rem, 1.2vw, 1.15rem); max-width: 44em; }
  .nl { white-space: nowrap; }
  .flag {
    display: inline-block;
    vertical-align: -0.05em;
    margin: 0 0.15em 0 0.3em;
    outline: 1px solid var(--hair);
  }

  .looking { gap: 4px; }
  .looking p { font-size: 1rem; }
  .push { margin-top: auto; padding-top: 14px; }
  .looking .btn.ink { background: var(--on-accent); color: var(--accent); }

  /* skills */
  .skills h3 { font-size: 1.35rem; margin: 20px 0 8px; }
  .ranked { list-style: none; margin: 0; padding: 0; counter-reset: r; }
  .ranked li {
    counter-increment: r;
    display: flex;
    gap: 10px;
    padding: 6px 0;
    border-bottom: 1px solid var(--hair);
    font-size: 0.98rem;
  }
  .ranked li::before {
    content: counter(r);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--muted);
    min-width: 1.4em;
    padding-top: 0.2em;
  }

  /* projects: a list, so it scales past three projects */
  .projects { gap: 6px; --line: color-mix(in srgb, var(--bg) 22%, transparent); }
  .plist { list-style: none; margin: 0 0 18px; padding: 0; border-top: 1px solid var(--line); }
  .plist li { border-bottom: 1px solid var(--line); }
  .plist a { display: grid; gap: 3px; padding: 12px 0; text-decoration: none; }
  .ptitle { font-family: var(--font-display); font-weight: 800; font-size: 1.55rem; line-height: 1; }
  .plist a:hover .ptitle { text-decoration: underline; text-decoration-thickness: 2px; }
  .pmeta { font-family: var(--font-mono); font-size: 0.72rem; opacity: 0.7; }
  .psum { font-size: 0.92rem; opacity: 0.85; line-height: 1.4; }
  .all {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--font-display);
    font-weight: 750;
    font-size: 1.35rem;
    text-decoration: none;
  }
  .all:hover { text-decoration: underline; }
  .all:hover .go { transform: translate(3px, -3px); }

  /* education: a real sequence, so a real timeline */
  .timeline { list-style: none; margin: 0; padding: 0; display: grid; gap: 18px; }
  .timeline li {
    position: relative;
    padding-left: calc(var(--cell) * 4);
    display: grid;
    gap: 2px;
    line-height: 1.35;
  }
  .timeline li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.35em;
    width: calc(var(--cell) * 1.5);
    height: calc(var(--cell) * 1.5);
    background: var(--ink);
  }
  .timeline li.now::before { background: var(--accent); outline: 3px solid var(--accent); outline-offset: 2px; }
  .timeline li:not(:last-child)::after {
    content: '';
    position: absolute;
    left: calc(var(--cell) * 0.75 - 1px);
    top: calc(0.35em + var(--cell) * 1.5 + 4px);
    bottom: -16px;
    width: 2px;
    background: repeating-linear-gradient(to bottom, var(--hair) 0 4px, transparent 4px 8px);
  }
  .date { font-size: 0.86rem; color: var(--muted); }
  .timeline strong { font-weight: 650; }

  .small-text { font-size: 1rem; color: var(--muted); }

  /* hobbies */
  .hobbies { gap: 14px; }
  .hobbies p { margin: 0; }
  .prints { display: grid; grid-template-columns: 4fr 3fr 3fr; gap: 8px; height: 190px; margin-top: 6px; }
  .prints img { width: 100%; height: 100%; object-fit: cover; }
  .hobby-link { display: flex; align-items: center; justify-content: space-between; font-family: var(--font-display); font-weight: 750; font-size: 1.35rem; }

  /* CV: a big pixel "document" */
  .cv { justify-content: center; align-items: flex-start; gap: 8px; }
  .cv-thumb {
    position: relative;
    width: calc(var(--cell) * 8);
    aspect-ratio: 1 / 1.3;
    background: var(--faint);
    clip-path: polygon(0 0, 72% 0, 100% 20%, 100% 100%, 0 100%);
    margin-bottom: 18px;
  }
  .cv-lines {
    position: absolute;
    inset: 30% 18% 26% 14%;
    background: repeating-linear-gradient(to bottom, var(--hair) 0 var(--cell), transparent var(--cell) calc(var(--cell) * 2));
  }
  .cv-label {
    position: absolute;
    left: 10px;
    bottom: 8px;
    font-family: var(--font-mono);
    font-size: 0.8rem;
  }

  /* contact */
  .contact { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 28px 48px; align-items: end; }
  .contact .tile-title { font-size: clamp(2.6rem, 6vw, 6rem); margin: 0; }
  .ways { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 40px; }
  .ways ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 18px; }
  .ways li { display: flex; align-items: center; gap: 14px; min-width: 0; }
  /* official black/white logo variants: white on the dark green, black on the pale green */
  .ico { display: grid; place-items: center; width: 40px; height: 40px; flex: none; color: var(--logo-on-accent); }
  .what { display: grid; min-width: 0; font-size: 1.1rem; line-height: 1.3; }
  .what a, .what span { overflow-wrap: anywhere; }
  .label { font-size: 0.85rem; color: var(--muted); }
  .copy {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }
  .copy:hover { text-decoration-thickness: 2px; }
  .copied { font-family: var(--font-mono); font-size: 0.75rem; }
  .soon .chip { margin-left: 6px; font-size: 0.75rem; vertical-align: 0.1em; background: transparent; color: inherit; opacity: 0.75; outline: 1px solid currentColor; outline-offset: -1px; }

  @media (max-width: 1100px) {
    .contact { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .ways { grid-template-columns: 1fr; gap: 18px; }
  }
  @media (max-width: 640px) {
    .prints { height: 150px; }
    .layout :global(.image-tile) { min-height: 240px; }
  }
</style>
