// SmoothLife (Stephan Rafler, 2011): Game of Life with continuous values.
// Each cell looks at the average of a small disk (itself) and of the ring
// around it, and a smooth version of Life's rule gives its next value.
// This is the discrete-time version, which makes round gliders.
const RA = 7; // outer radius in cells; the inner disk is RA / 3
const B1 = 0.278, B2 = 0.365, D1 = 0.267, D2 = 0.445, AN = 0.028, AM = 0.147;

const s1 = (x, a, al) => 1 / (1 + Math.exp((-(x - a) * 4) / al));
const s2 = (x, a, b) => s1(x, a, AN) * (1 - s1(x, b, AN));
const sm = (x, y, m) => x * (1 - s1(m, 0.5, AM)) + y * s1(m, 0.5, AM);
const rule = (n, m) => s2(n, sm(B1, D1, m), sm(B2, D2, m));

export function smoothlife() {
  let f, next, M, N, inner = [], ring = [], mass0 = 0;
  const RI = RA / 3;
  for (let dy = -RA; dy <= RA; dy++) {
    for (let dx = -RA; dx <= RA; dx++) {
      const d = Math.hypot(dx, dy);
      if (d <= RI) inner.push([dx, dy]);
      else if (d <= RA) ring.push([dx, dy]);
    }
  }

  // drop a square blob (gliders grow out of these)
  function blob({ cols, rows }, cx, cy) {
    for (let y = -RA; y < RA; y++) {
      for (let x = -RA; x < RA; x++) f[((cy + y + rows) % rows) * cols + ((cx + x + cols) % cols)] = 1;
    }
  }

  return {
    tick: 90,
    idleTick: 130,
    seedDensity: 0.008,
    warmup: 20,
    init(g) {
      f = new Float32Array(g.n);
      next = new Float32Array(g.n);
      M = new Float32Array(g.n);
      N = new Float32Array(g.n);
    },
    seed(g, i) {
      if (Math.random() < 0.7) blob(g, i % g.cols, (i / g.cols) | 0);
    },
    start(g) {
      mass0 = 0;
      for (let i = 0; i < g.n; i++) mass0 += f[i];
    },
    step({ cols, rows, n }) {
      M.fill(0);
      N.fill(0);
      // scatter: only cells with a value spread into their neighbourhoods
      for (let i = 0; i < n; i++) {
        const v = f[i];
        if (v < 0.001) continue;
        const x = i % cols, y = (i / cols) | 0;
        for (const [dx, dy] of inner) M[((y + dy + rows) % rows) * cols + ((x + dx + cols) % cols)] += v;
        for (const [dx, dy] of ring) N[((y + dy + rows) % rows) * cols + ((x + dx + cols) % cols)] += v;
      }
      for (let i = 0; i < n; i++) next[i] = rule(N[i] / ring.length, M[i] / inner.length);
      [f, next] = [next, f];
    },
    value: (i) => f[i],
    afterIntro(g) {
      let mass = 0;
      for (let i = 0; i < g.n; i++) mass += f[i];
      // everything died out: drop a few new blobs
      if (mass < Math.max(40, mass0 * 0.02)) {
        for (let k = 0; k < 6; k++) blob(g, (Math.random() * g.cols) | 0, (Math.random() * g.rows) | 0);
      }
    }
  };
}
