<script>
  // The live age, as a row of pixel-art nixie tubes.
  // Every tube is a 10 × 15 pixel drawing (glass, dark inside, the unlit
  // cathodes of all ten digits, a socket), with the lit digit drawn on top
  // in orange plus a ring of darker orange pixels as its glow. Everything is
  // one SVG; on each tick only the digits change. Between the whole years and
  // the decimals sits a narrow tube with a glowing colon.
  import { onMount } from 'svelte';
  import { site } from '$lib/site.js';

  const born = new Date(site.birthDate).getTime();
  const YEAR = 1000 * 60 * 60 * 24 * 365.2425;
  const age = () => (Date.now() - born) / YEAR;

  /* ---------- the pixel drawings ---------- */
  // 5 × 9 digits, thin strokes like real nixie cathodes
  const GLYPHS = {
    0: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    2: ['.###.', '#...#', '....#', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
    3: ['#####', '...#.', '..#..', '.###.', '....#', '....#', '....#', '#...#', '.###.'],
    4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.', '...#.', '...#.'],
    5: ['#####', '#....', '#....', '####.', '....#', '....#', '....#', '#...#', '.###.'],
    6: ['..##.', '.#...', '#....', '#....', '####.', '#...#', '#...#', '#...#', '.###.'],
    7: ['#####', '....#', '...#.', '...#.', '..#..', '..#..', '.#...', '.#...', '.#...'],
    8: ['.###.', '#...#', '#...#', '#...#', '.###.', '#...#', '#...#', '#...#', '.###.'],
    9: ['.###.', '#...#', '#...#', '#...#', '.####', '....#', '....#', '...#.', '.##..']
  };
  const W = 10; // tube width in pixels
  const GAP = 1; // pixels between tubes
  const H = 17; // tube + socket + plinth
  const DX = 2, DY = 3; // where the digit sits inside the tube
  const SEP_W = 6; // the narrow colon tube

  // colours of a physical object: the same in light and dark mode
  const C = {
    glass: '#9fb3b8',
    shine: '#d6e4e7',
    inside: '#0f0905',
    unlit: '#2e1b11',
    glow: '#5c210b',
    lit: '#ffa94d',
    socket: '#3b3b3b',
    socketTop: '#5c5c5c',
    plinth: '#262626'
  };

  const px = (pts) => pts.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('');
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const cells = (rows) => rows.flatMap((r, y) => [...r].flatMap((ch, x) => (ch === '#' ? [[x + DX, y + DY]] : [])));
  const insideOf = (w) => (x, y) => x >= 1 && x <= w - 2 && y >= 2 && y <= 12;

  // a lit glyph and its glow: the inside pixels directly above, below, left and right of it
  function litPaths(points, isInside = insideOf(W)) {
    const on = new Set(points.map(([x, y]) => `${x},${y}`));
    const glow = new Set();
    for (const [x, y] of points)
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = `${x + dx},${y + dy}`;
        if (!on.has(k) && isInside(x + dx, y + dy)) glow.add(k);
      }
    return { lit: px(points), glow: px([...glow].map((k) => k.split(',').map(Number))) };
  }
  const DIGITS = Object.fromEntries(Object.entries(GLYPHS).map(([d, rows]) => [d, litPaths(cells(rows))]));

  // a tube w pixels wide: glass dome and walls, the dark inside, a shine on the glass, the socket
  const tube = (w) => {
    const a = w >= 8 ? 3 : 2; // where the dome starts
    return {
      glass: px([...range(a, w - 1 - a).map((x) => [x, 0]), ...range(1, a - 1).map((x) => [x, 1]), ...range(w - a, w - 2).map((x) => [x, 1]), ...range(2, 12).flatMap((y) => [[0, y], [w - 1, y]])]),
      inside: px([...range(a, w - 1 - a).map((x) => [x, 1]), ...range(2, 12).flatMap((y) => range(1, w - 2).map((x) => [x, y]))]),
      shine: px(range(3, 7).map((y) => [1, y])),
      socketTop: px(range(0, w - 1).map((x) => [x, 13])),
      socket: px(range(0, w - 1).map((x) => [x, 14]))
    };
  };
  // digit tubes also show all ten cathodes, unlit, behind the lit one
  const unlitCells = new Set(Object.values(GLYPHS).flatMap((rows) => cells(rows).map((p) => p.join(','))));
  const TUBE = { ...tube(W), unlit: px([...unlitCells].map((k) => k.split(',').map(Number))) };
  // the colon tube: two 2 × 2 dots
  const SEP = tube(SEP_W);
  const COLON = litPaths([[2, 4], [3, 4], [2, 5], [3, 5], [2, 9], [3, 9], [2, 10], [3, 10]], insideOf(SEP_W));

  /* ---------- the number ---------- */
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let decimals = $state(12); // phones: 7 (20.2328278), set in onMount
  let value = $state(age().toFixed(12));

  // every tube with its x position: digits, and the colon where the decimal point is
  const tubes = $derived.by(() => {
    let x = 0;
    return [...value].map((ch) => {
      const t = { ch, x };
      x += (ch === '.' ? SEP_W : W) + GAP;
      return t;
    });
  });
  const width = $derived(tubes.length ? tubes.at(-1).x + W : W);

  onMount(() => {
    const narrow = window.matchMedia('(max-width: 640px)');
    const tick = () => (value = age().toFixed(decimals));
    const fit = () => {
      decimals = narrow.matches ? 7 : 12;
      tick();
    };
    fit();
    narrow.addEventListener('change', fit);
    if (reduced) return () => narrow.removeEventListener('change', fit);
    const id = setInterval(tick, 50);
    return () => {
      clearInterval(id);
      narrow.removeEventListener('change', fit);
    };
  });
</script>

<svg
  class="nixie"
  viewBox="0 0 {width} {H}"
  width={width}
  height={H}
  shape-rendering="crispEdges"
  role="img"
  aria-label="{age().toFixed(2)} years"
>
  <title>Live: years since I was born</title>
  <path d="M0 15h{width}v2h-{width}z" fill={C.plinth} />
  {#each tubes as { ch, x }}
    {@const t = ch === '.' ? SEP : TUBE}
    {@const lit = ch === '.' ? COLON : DIGITS[ch]}
    <g transform="translate({x} 0)">
      <path d={t.inside} fill={C.inside} />
      {#if t.unlit}<path d={t.unlit} fill={C.unlit} />{/if}
      <path d={lit.glow} fill={C.glow} />
      <path d={lit.lit} fill={C.lit} />
      <path d={t.glass} fill={C.glass} />
      <path d={t.shine} fill={C.shine} />
      <path d={t.socketTop} fill={C.socketTop} />
      <path d={t.socket} fill={C.socket} />
    </g>
  {/each}
</svg>

<style>
  /* sits in the sentence: about two lines of text tall, every pixel the same size */
  .nixie {
    display: inline-block;
    height: 2.4em;
    width: auto;
    vertical-align: middle;
    margin: 0 0.15em;
    image-rendering: pixelated;
  }
</style>
