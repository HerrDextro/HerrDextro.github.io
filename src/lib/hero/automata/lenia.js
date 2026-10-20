// Lenia (Bert Chan, 2018): continuous space, time and states. Every cell
// adds up its neighbours through a smooth ring-shaped kernel (radius R), and
// a bell-shaped growth function says whether it grows or shrinks.
// Random soups mostly die or explode at this size, so it starts from Orbium,
// Lenia's best-known glider. All of them face the same way, so they glide
// in parallel and never collide.
const R = 13, MU = 0.15, SIGMA = 0.015, DT = 0.1;

// Orbium, 20 x 20 cells (from Bert Chan's Lenia notebooks)
const ORBIUM = [
  [0,0,0,0,0,0,0.1,0.14,0.1,0,0,0.03,0.03,0,0,0.3,0,0,0,0],
  [0,0,0,0,0,0.08,0.24,0.3,0.3,0.18,0.14,0.15,0.16,0.15,0.09,0.2,0,0,0,0],
  [0,0,0,0,0,0.15,0.34,0.44,0.46,0.38,0.18,0.14,0.11,0.13,0.19,0.18,0.45,0,0,0],
  [0,0,0,0,0.06,0.13,0.39,0.5,0.5,0.37,0.06,0,0,0,0.02,0.16,0.68,0,0,0],
  [0,0,0,0.11,0.17,0.17,0.33,0.4,0.38,0.28,0.14,0,0,0,0,0,0.18,0.42,0,0],
  [0,0,0.09,0.18,0.13,0.06,0.08,0.26,0.32,0.32,0.27,0,0,0,0,0,0,0.82,0,0],
  [0.27,0,0.16,0.12,0,0,0,0.25,0.38,0.44,0.45,0.34,0,0,0,0,0,0.22,0.17,0],
  [0,0.07,0.2,0.02,0,0,0,0.31,0.48,0.57,0.6,0.57,0,0,0,0,0,0,0.49,0],
  [0,0.59,0.19,0,0,0,0,0.2,0.57,0.69,0.76,0.76,0.49,0,0,0,0,0,0.36,0],
  [0,0.58,0.19,0,0,0,0,0,0.67,0.83,0.9,0.92,0.87,0.12,0,0,0,0,0.22,0.07],
  [0,0,0.46,0,0,0,0,0,0.7,0.93,1,1,1,0.61,0,0,0,0,0.18,0.11],
  [0,0,0.82,0,0,0,0,0,0.47,1,1,0.98,1,0.96,0.27,0,0,0,0.19,0.1],
  [0,0,0.46,0,0,0,0,0,0.25,1,1,0.84,0.92,0.97,0.54,0.14,0.04,0.1,0.21,0.05],
  [0,0,0,0.4,0,0,0,0,0.09,0.8,1,0.82,0.8,0.85,0.63,0.31,0.18,0.19,0.2,0.01],
  [0,0,0,0.36,0.1,0,0,0,0.05,0.54,0.86,0.79,0.74,0.72,0.6,0.39,0.28,0.24,0.13,0],
  [0,0,0,0.01,0.3,0.07,0,0,0.08,0.36,0.64,0.7,0.64,0.6,0.51,0.39,0.29,0.19,0.04,0],
  [0,0,0,0,0.1,0.24,0.14,0.1,0.15,0.29,0.45,0.53,0.52,0.46,0.4,0.31,0.21,0.08,0,0],
  [0,0,0,0,0,0.08,0.21,0.21,0.22,0.29,0.36,0.39,0.37,0.33,0.26,0.18,0.09,0,0,0],
  [0,0,0,0,0,0,0.03,0.13,0.19,0.22,0.24,0.24,0.23,0.18,0.13,0.05,0,0,0,0],
  [0,0,0,0,0,0,0,0,0.02,0.06,0.08,0.09,0.07,0.05,0.01,0,0,0,0,0]
];

export function lenia() {
  let f, U, kernel = [], ksum = 0, turn = 0, expected = 0;
  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      const r = Math.hypot(dx, dy) / R;
      if (r <= 0 || r >= 1) continue;
      const w = Math.exp(4 - 1 / (r * (1 - r)));
      kernel.push([dx, dy, w]);
      ksum += w;
    }
  }
  for (const k of kernel) k[2] /= ksum;

  function stamp({ cols, rows }, ox, oy) {
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        // rotate the pattern by `turn` quarter turns
        const [sx, sy] = [[x, y], [19 - y, x], [19 - x, 19 - y], [y, 19 - x]][turn];
        const v = ORBIUM[sy][sx];
        if (v) f[((oy + y) % rows) * cols + ((ox + x) % cols)] = v;
      }
    }
  }

  function populate(g) {
    f.fill(0);
    turn = (Math.random() * 4) | 0;
    const count = Math.max(3, Math.round(g.n / 3500));
    const spots = [];
    for (let tries = 0; spots.length < count && tries < 400; tries++) {
      const x = (Math.random() * g.cols) | 0, y = (Math.random() * g.rows) | 0;
      if (spots.every(([sx, sy]) => Math.hypot(sx - x, sy - y) > 30)) spots.push([x, y]);
    }
    for (const [x, y] of spots) stamp(g, x, y);
    expected = spots.length * 71; // an Orbium weighs about 71
  }

  return {
    tick: 45,
    idleTick: 110,
    seedDensity: 0.12,
    warmup: 10,
    init(g) {
      f = new Float32Array(g.n);
      U = new Float32Array(g.n);
    },
    // popped-in noise is faint and dies off once Lenia starts
    seed(g, i) {
      f[i] = Math.random() * 0.5;
    },
    start(g) {
      const noise = f.slice();
      populate(g);
      for (let i = 0; i < g.n; i++) if (!f[i]) f[i] = noise[i] * 0.6;
    },
    step({ cols, rows, n }) {
      U.fill(0);
      for (let i = 0; i < n; i++) {
        const v = f[i];
        if (v < 0.001) continue;
        const x = i % cols, y = (i / cols) | 0;
        for (const [dx, dy, w] of kernel) U[((y + dy + rows) % rows) * cols + ((x + dx + cols) % cols)] += v * w;
      }
      for (let i = 0; i < n; i++) {
        const u = U[i] - MU;
        const growth = 2 * Math.exp(-(u * u) / (2 * SIGMA * SIGMA)) - 1;
        const v = f[i] + DT * growth;
        f[i] = v < 0 ? 0 : v > 1 ? 1 : v;
      }
    },
    value: (i) => f[i],
    // watchdog: if creatures died or something exploded, start fresh
    afterIntro(g) {
      let mass = 0;
      for (let i = 0; i < g.n; i++) mass += f[i];
      if (mass < expected * 0.3 || mass > expected * 2.5) populate(g);
    }
  };
}
