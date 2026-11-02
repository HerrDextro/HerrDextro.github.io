<script>
  // The live age, as a row of pixel-art nixie tubes.
  // Every tube is a 10 × 15 pixel drawing (glass, dark inside, the unlit
  // cathodes of all ten digits, a socket), with the lit digit drawn on top
  // in orange plus a ring of darker orange pixels as its glow. Everything is
  // one SVG; on each tick only the digits change.
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
  const DOT = [8, 11]; // the decimal point (bottom right, like an IN-12B)

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
  const isInside = (x, y) => x >= 1 && x <= 8 && y >= 2 && y <= 12;

  // a lit glyph and its glow: the inside pixels directly above, below, left and right of it
  function litPaths(points) {
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
  const DOT_PATHS = litPaths([DOT]);

  // the tube itself: glass dome and walls, the dark inside, a shine on the glass,
  // all ten cathodes unlit, and the socket
  const unlitCells = new Set(Object.values(GLYPHS).flatMap((rows) => cells(rows).map((p) => p.join(','))));
  const TUBE = {
    glass: px([...range(3, 6).map((x) => [x, 0]), [1, 1], [2, 1], [7, 1], [8, 1], ...range(2, 12).flatMap((y) => [[0, y], [9, y]])]),
    inside: px([...range(3, 6).map((x) => [x, 1]), ...range(2, 12).flatMap((y) => range(1, 8).map((x) => [x, y]))]),
    shine: px(range(3, 7).map((y) => [1, y])),
    unlit: px([...unlitCells].map((k) => k.split(',').map(Number))),
    socketTop: px(range(0, 9).map((x) => [x, 13])),
    socket: px(range(0, 9).map((x) => [x, 14]))
  };

  /* ---------- the number ---------- */
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let decimals = $state(12); // phones: 7 (20.2328278), set in onMount
  let value = $state(age().toFixed(12));

  const digits = $derived(value.replace('.', '').split(''));
  const dotAfter = $derived(value.indexOf('.') - 1); // tube that carries the decimal point
  const width = $derived(digits.length * (W + GAP) - GAP);

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
  {#each digits as d, i}
    <g transform="translate({i * (W + GAP)} 0)">
      <path d={TUBE.inside} fill={C.inside} />
      <path d={TUBE.unlit} fill={C.unlit} />
      <path d={DIGITS[d].glow} fill={C.glow} />
      {#if i === dotAfter}<path d={DOT_PATHS.glow} fill={C.glow} />{/if}
      <path d={DIGITS[d].lit} fill={C.lit} />
      {#if i === dotAfter}<path d={DOT_PATHS.lit} fill={C.lit} />{/if}
      <path d={TUBE.glass} fill={C.glass} />
      <path d={TUBE.shine} fill={C.shine} />
      <path d={TUBE.socketTop} fill={C.socketTop} />
      <path d={TUBE.socket} fill={C.socket} />
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
