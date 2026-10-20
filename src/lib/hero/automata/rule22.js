// Rule 22: an elementary (1-D) cellular automaton. Each row of the screen is
// one generation; a cell's next state depends on itself and its left/right
// neighbours in the row above:
//
//    neighbourhood  111 110 101 100 011 010 001 000
//    new cell        0   0   0   1   0   1   1   0    → 00010110 = 22
//
// (a cell turns on when exactly one of the three above it was on).
// From one black cell it draws one big Sierpinski triangle; from a random
// first row it fills the screen with many small ones.
// The rows are computed once; during the intro a sweep reveals them top to
// bottom over the popped-in pixels. After that it's static.
import { T } from '../engine.js';
import { easeInOut } from '../name.js';

const RULE = 22;
const FIRST_ROW_DENSITY = 0.5;
const SWEEP_START = 450, SWEEP_SPAN = 1150;

export function rule22() {
  let grid, noise, cols = 0, rows = 0;
  return {
    tick: 0, // no stepping: every row is already computed
    idleTick: 0,
    seedDensity: 0.2,
    init(g) {
      ({ cols, rows } = g);
      grid = new Uint8Array(g.n);
      noise = new Uint8Array(g.n);
      for (let x = 0; x < cols; x++) grid[x] = Math.random() < FIRST_ROW_DENSITY ? 1 : 0;
      for (let y = 1; y < rows; y++) {
        const prev = (y - 1) * cols, cur = y * cols;
        for (let x = 0; x < cols; x++) {
          const l = grid[prev + ((x - 1 + cols) % cols)];
          const c = grid[prev + x];
          const r = grid[prev + ((x + 1) % cols)];
          grid[cur + x] = (RULE >> ((l << 2) | (c << 1) | r)) & 1; // look up the rule's bit
        }
      }
    },
    seed(g, i) {
      noise[i] = 1;
    },
    // rows above the sweep line show the automaton, below it the popped-in pixels
    value(i, t) {
      if (t >= T.done) return grid[i];
      const front = Math.ceil(rows * easeInOut((t - SWEEP_START) / SWEEP_SPAN));
      return ((i / cols) | 0) < front ? grid[i] : noise[i];
    }
  };
}
