// Langton's ant: on a white cell turn right, on a black cell turn left;
// flip the cell, step forward. A few ants run at once, fast during the intro.
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0]; // up, right, down, left

export function ant() {
  let cells, ants = [], idle = false;
  return {
    tick: 33,
    idleTick: 80,
    seedDensity: 0.012,
    init(g) {
      cells = new Uint8Array(g.n);
      ants = [];
      idle = false;
    },
    seed(g, i) {
      cells[i] = 1;
    },
    start({ cols, rows, n }) {
      const count = Math.max(4, Math.round(n / 2500));
      for (let k = 0; k < count; k++) {
        ants.push({ x: (Math.random() * cols) | 0, y: (Math.random() * rows) | 0, d: (Math.random() * 4) | 0 });
      }
    },
    step({ cols, rows }) {
      const moves = idle ? 2 : 45;
      for (const a of ants) {
        for (let k = 0; k < moves; k++) {
          const i = a.y * cols + a.x;
          a.d = (a.d + (cells[i] ? 3 : 1)) % 4; // black: left, white: right
          cells[i] ^= 1;
          a.x = (a.x + DX[a.d] + cols) % cols;
          a.y = (a.y + DY[a.d] + rows) % rows;
        }
      }
    },
    value: (i) => cells[i],
    afterIntro() {
      idle = true;
    },
    // the ants themselves, a little stronger than the trail
    drawExtra(ctx, g, c, t, masked) {
      for (const a of ants) {
        if (masked(a.x, a.y)) continue;
        ctx.fillRect(Math.round(a.x * c), Math.round(a.y * c), Math.ceil(c), Math.ceil(c));
      }
    }
  };
}
