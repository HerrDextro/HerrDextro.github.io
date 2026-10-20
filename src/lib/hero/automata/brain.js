// Brian's Brain: on → dying → off; an off cell turns on with exactly 2 "on" neighbours.
// It never settles down, so it keeps running behind the page.
const ON = 1, DYING = 2;

export function brain() {
  let a, b;
  return {
    tick: 90,
    idleTick: 200,
    seedDensity: 0.1,
    init(g) {
      a = new Uint8Array(g.n);
      b = new Uint8Array(g.n);
    },
    seed(g, i) {
      a[i] = ON;
    },
    step({ cols, rows }) {
      for (let y = 0; y < rows; y++) {
        const up = ((y - 1 + rows) % rows) * cols, mid = y * cols, dn = ((y + 1) % rows) * cols;
        for (let x = 0; x < cols; x++) {
          const i = mid + x;
          if (a[i] === ON) { b[i] = DYING; continue; }
          if (a[i] === DYING) { b[i] = 0; continue; }
          const l = (x - 1 + cols) % cols, r = (x + 1) % cols;
          const n = (a[up + l] === ON) + (a[up + x] === ON) + (a[up + r] === ON) + (a[mid + l] === ON) +
                    (a[mid + r] === ON) + (a[dn + l] === ON) + (a[dn + x] === ON) + (a[dn + r] === ON);
          b[i] = n === 2 ? ON : 0;
        }
      }
      [a, b] = [b, a];
    },
    value: (i) => (a[i] === ON ? 1 : a[i] === DYING ? 0.4 : 0),
    afterIntro({ n }) {
      let on = 0;
      for (let i = 0; i < n; i++) on += a[i] === ON;
      if (on < n * 0.01) for (let k = 0; k < n * 0.05; k++) a[(Math.random() * n) | 0] = ON;
    }
  };
}
