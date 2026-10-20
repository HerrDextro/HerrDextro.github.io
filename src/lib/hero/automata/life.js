// Conway's Game of Life: born with exactly 3 neighbours, survives with 2 or 3.
export function life() {
  let a, b;
  return {
    tick: 85,
    idleTick: 240,
    seedDensity: 0.24,
    init(g) {
      a = new Uint8Array(g.n);
      b = new Uint8Array(g.n);
    },
    seed(g, i) {
      a[i] = 1;
    },
    step({ cols, rows }) {
      for (let y = 0; y < rows; y++) {
        const up = ((y - 1 + rows) % rows) * cols, mid = y * cols, dn = ((y + 1) % rows) * cols;
        for (let x = 0; x < cols; x++) {
          const l = (x - 1 + cols) % cols, r = (x + 1) % cols;
          const n = a[up + l] + a[up + x] + a[up + r] + a[mid + l] + a[mid + r] + a[dn + l] + a[dn + x] + a[dn + r];
          const i = mid + x;
          b[i] = n === 3 || (n === 2 && a[i]) ? 1 : 0;
        }
      }
      [a, b] = [b, a];
    },
    value: (i) => a[i],
    // keep the faint background alive: drop a few random blobs when it dies down
    afterIntro({ cols, rows, n }) {
      let pop = 0;
      for (let i = 0; i < n; i++) pop += a[i];
      if (pop > n * 0.035) return;
      for (let k = 0; k < 4; k++) {
        const cx = (Math.random() * cols) | 0, cy = (Math.random() * rows) | 0;
        for (let j = 0; j < 18; j++) {
          const x = (cx + ((Math.random() * 7) | 0) - 3 + cols) % cols;
          const y = (cy + ((Math.random() * 7) | 0) - 3 + rows) % rows;
          a[y * cols + x] = 1;
        }
      }
    }
  };
}
