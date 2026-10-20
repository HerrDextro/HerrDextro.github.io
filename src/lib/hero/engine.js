/*
  The backdrop engine: runs one automaton on a fixed, screen-sized canvas
  behind every page. It lives in +layout.svelte, so it keeps running while
  you click between pages (see Backdrop.svelte).

  On the home page the hero "attaches" a second canvas for the name and the
  colour block (attachName). That canvas scrolls with the page; the engine
  keeps the automaton out of the area around the name, wherever it is.

  An automaton (src/lib/hero/automata/*.js) only says how to seed, step and
  draw its cells:

    {
      tick: 85,          // ms between generations during the intro (0 = never steps)
      idleTick: 240,     // ms between generations afterwards (0 = freeze)
      seedDensity: 0.24, // share of cells popped in before it starts
      warmup: 14,        // generations to run when skipping straight to the end
      init(g)            // allocate state; g = { cols, rows, cell, n }
      seed(g, i)         // pop in cell i (before the automaton starts)
      start?(g)          // called once when stepping begins
      step?(g)           // one generation
      value(i, t)        // 0..1: how visible cell i is at time t (ms since start)
      afterIntro?(g)     // called every idle tick; reseed when it dies down
      drawExtra?(ctx, g, c, t) // e.g. the ants themselves
    }
*/
import { layoutName, markClear, drawName, ditherImage, loadImage, cellSizeFor, rand, ease } from './name.js';

// the intro timeline, in ms
export const T = {
  seedEnd: 900, // random pixels popping in
  simStart: 650, // automaton starts while the last pixels arrive
  morphStart: 1700, // name cells lock in, centre outwards
  morphSpan: 1100,
  swatchStart: 2650,
  fadeStart: 3000,
  fadeSpan: 1500,
  done: 4600
};
const FAINT = 0.11; // opacity of the automaton after the intro
const CALM = 0.75; // on other pages: fainter (× this) and half as fast
const LEVELS = 6; // opacity steps for automata with in-between values

/**
 * @param {HTMLCanvasElement} canvas  fixed, covers the screen
 * @param {{ sim: object, intro: boolean, image?: string|null, onPhase?: (p: string) => void }} opts
 */
export function createBackdrop(canvas, opts) {
  const { sim } = opts;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const g = { cols: 0, rows: 0, cell: 8, n: 0 };
  let dpr = 1, cssW = 0, cssH = 0;
  let buckets, counts;
  let ink = '#000';
  let t0 = 0, raf = 0, lastTick = 0, started = false, finished = false, calm = false, dirty = true, alive = true;
  const phaseSent = new Set();
  let photo = null, photoCells = null;
  let nl = null; // the name layer, while the home page is shown
  let lastTop = NaN;

  const now = () => performance.now() - t0;

  /* ---------- size ---------- */
  function measure() {
    const r = canvas.getBoundingClientRect();
    cssW = Math.max(1, Math.round(r.width));
    cssH = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    g.cell = cellSizeFor(window.innerWidth);
    g.cols = Math.ceil(cssW / g.cell);
    g.rows = Math.ceil(cssH / g.cell);
    g.n = g.cols * g.rows;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    buckets = Array.from({ length: LEVELS }, () => new Int32Array(g.n));
    counts = new Int32Array(LEVELS);
    started = false;
    sim.init(g);
    photoCells = photo ? ditherImage(photo, g.cols, g.rows) : null;
    dirty = true;
  }

  /* ---------- automaton ---------- */
  function seedSome(count) {
    for (let k = 0; k < count; k++) sim.seed(g, (Math.random() * g.n) | 0);
  }

  function step() {
    if (!started) {
      started = true;
      sim.start?.(g);
    }
    sim.step?.(g);
  }

  function jumpToEnd() {
    t0 = performance.now() - T.done - 1;
    if (!started) seedSome(Math.round(g.n * sim.seedDensity));
    if (sim.step) for (let k = 0; k < (sim.warmup ?? 14); k++) step();
    else started = true;
    finished = true;
    ['morph', 'named', 'done'].forEach(phase);
    dirty = true;
    if (nl) nl.dirty = true;
  }

  function phase(p) {
    if (phaseSent.has(p)) return;
    phaseSent.add(p);
    opts.onPhase?.(p);
  }

  /* ---------- drawing ---------- */
  // is backdrop cell (x, y) inside the clean area around the name?
  function maskedFn(t) {
    if (!nl) return () => false;
    const shift = Math.round(nl.top / g.cell); // hero top, in rows (negative once scrolled)
    const { keepClear, clearAt } = nl.name;
    return (x, y) => {
      const hy = y - shift;
      if (hy < 0 || hy >= nl.rows || x >= nl.cols) return false;
      const j = hy * nl.cols + x;
      return keepClear[j] === 1 && t >= clearAt[j];
    };
  }

  function drawBackdrop(t) {
    const c = g.cell * dpr, { cols } = g;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = ink;
    const fade = finished ? 1 : ease((t - T.fadeStart) / T.fadeSpan);
    const faint = FAINT * (calm ? CALM : 1);
    const masked = maskedFn(t);
    const rect = (i) => ctx.fillRect(Math.round((i % cols) * c), Math.round(((i / cols) | 0) * c), Math.ceil(c), Math.ceil(c));

    if (photoCells) {
      ctx.globalAlpha = 0.16 * fade * (calm ? CALM : 1);
      for (let i = 0; i < g.n; i++) if (photoCells[i] && !masked(i % cols, (i / cols) | 0)) rect(i);
    }

    // sort visible cells into a few opacity levels, then draw level by level
    counts.fill(0);
    for (let i = 0; i < g.n; i++) {
      const v = sim.value(i, t);
      if (v < 0.05 || masked(i % cols, (i / cols) | 0)) continue;
      const b = Math.min(LEVELS - 1, (v * LEVELS) | 0);
      buckets[b][counts[b]++] = i;
    }
    const base = 1 - (1 - faint) * fade;
    for (let b = 0; b < LEVELS; b++) {
      if (!counts[b]) continue;
      ctx.globalAlpha = base * ((b + 1) / LEVELS);
      for (let k = 0; k < counts[b]; k++) rect(buckets[b][k]);
    }

    if (sim.drawExtra) {
      ctx.globalAlpha = Math.max(base, calm ? 0.35 : 0.5);
      sim.drawExtra(ctx, g, c, t, masked);
    }
    ctx.globalAlpha = 1;
  }

  function drawNameLayer(t) {
    const { ctx: nctx, canvas: nc } = nl;
    nctx.clearRect(0, 0, nc.width, nc.height);
    nctx.globalAlpha = 1;
    nctx.fillStyle = ink;
    drawName(nctx, nl.name, { cols: nl.cols }, g.cell * nl.dpr, finished ? Math.max(t, T.done) : t);
    nl.dirty = false;
  }

  /* ---------- loop ---------- */
  function frame(ts) {
    raf = 0;
    if (!alive) return;
    const t = ts - t0;

    if (!finished) {
      if (t < T.seedEnd) {
        const share = 1 / Math.max(1, (T.seedEnd - t) / 16);
        seedSome(Math.ceil(g.n * sim.seedDensity * share * 0.5));
      }
      if (t >= T.morphStart) phase('morph');
      if (t >= T.fadeStart) phase('named');
      if (t >= T.done) {
        phase('done');
        finished = true;
      }
      dirty = true;
      if (nl) nl.dirty = true;
    }

    if (!reduced) {
      const interval = !finished ? sim.tick : sim.idleTick * (calm ? 2 : 1);
      if (sim.step && t >= T.simStart && interval && ts - lastTick >= interval) {
        step();
        lastTick = ts;
        if (finished) sim.afterIntro?.(g);
        dirty = true;
      }
    }

    // the clean area follows the name when the page scrolls
    if (nl) {
      const top = nl.canvas.getBoundingClientRect().top;
      if (top !== lastTop) {
        lastTop = top;
        nl.top = top;
        dirty = true;
      }
    }

    if (dirty) {
      drawBackdrop(t);
      dirty = false;
    }
    if (nl?.dirty) drawNameLayer(t);
    raf = requestAnimationFrame(frame);
  }

  const readInk = () => (ink = getComputedStyle(canvas).getPropertyValue('--ink').trim() || '#000');

  /* ---------- the name layer (home page only) ---------- */
  function layoutNameLayer() {
    const r = nl.canvas.getBoundingClientRect();
    nl.dpr = dpr;
    nl.cols = Math.ceil(r.width / g.cell);
    nl.rows = Math.ceil(r.height / g.cell);
    nl.top = r.top;
    nl.canvas.width = Math.round(r.width * dpr);
    nl.canvas.height = Math.round(r.height * dpr);
    nl.name = layoutName({ cols: nl.cols, rows: nl.rows, cell: g.cell, text: nl.opts.text, font: nl.opts.font, weight: nl.opts.weight, T });
    nl.dirty = true;
    dirty = true;
    nl.opts.onLayout?.(nl.name.layout);
  }

  /* ---------- size changes ---------- */
  let resizeTimer = 0;
  let lastW = window.innerWidth;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // phones change the height while scrolling (URL bar); only react to real changes
      const h = canvas.getBoundingClientRect().height;
      if (Math.abs(window.innerWidth - lastW) < 2 && Math.abs(h - cssH) < 120) {
        if (nl) layoutNameLayer();
        return;
      }
      lastW = window.innerWidth;
      measure();
      jumpToEnd();
      if (nl) layoutNameLayer();
    }, 150);
  }
  window.addEventListener('resize', onResize);

  /* ---------- start ---------- */
  measure();
  readInk();
  loadImage(opts.image).then((im) => {
    photo = im;
    if (im) {
      photoCells = ditherImage(im, g.cols, g.rows);
      dirty = true;
    }
  });
  if (opts.intro && !reduced) {
    t0 = performance.now();
    lastTick = t0;
  } else {
    jumpToEnd();
  }
  raf = requestAnimationFrame(frame);

  return {
    /** the home page's name canvas; returns a function that detaches it */
    attachName(o) {
      const ctx2 = o.canvas.getContext('2d');
      nl = { canvas: o.canvas, ctx: ctx2, opts: o, dirty: true };
      layoutNameLayer();
      return () => {
        nl = null;
        dirty = true;
      };
    },
    /** keep the automaton out of a DOM area (CSS px relative to the name canvas) */
    addClearRect(px, py, pw, ph) {
      if (!nl) return;
      const when = () => (finished ? 0 : T.fadeStart - 400 + rand(0, 400));
      markClear(nl.name, { cols: nl.cols, rows: nl.rows, cell: g.cell }, px, py, pw, ph, when);
      dirty = true;
    },
    /** other pages: fainter and slower */
    setCalm(v) {
      if (calm === v) return;
      calm = v;
      dirty = true;
    },
    refreshColors() {
      readInk();
      dirty = true;
      if (nl) nl.dirty = true;
    },
    skip() {
      if (!finished) jumpToEnd();
    },
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
    }
  };
}
