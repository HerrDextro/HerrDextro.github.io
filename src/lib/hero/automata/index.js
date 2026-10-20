/*
  Every automaton, with the text for the little (+) note in the hero.
  To add one: write a module with the interface described at the top of
  ../engine.js and add an entry here (`make` returns a fresh instance).
*/
import { rule22 } from './rule22.js';
import { life } from './life.js';
import { brain } from './brain.js';
import { ant } from './ant.js';
import { smoothlife } from './smoothlife.js';
import { lenia } from './lenia.js';

export const AUTOMATA = [
  {
    id: 'rule22',
    name: 'Rule 22',
    make: rule22,
    text: 'A one-dimensional automaton: every row is the next generation of the row above it. A cell turns on when exactly one of the three cells above it was on. From a random first row it fills the screen with nested triangles.',
    link: 'https://en.wikipedia.org/wiki/Elementary_cellular_automaton'
  },
  {
    id: 'life',
    name: 'Game of Life',
    make: life,
    text: 'John Conway, 1970. A dead cell comes alive with exactly three live neighbours; a live cell survives with two or three. Everything else dies.',
    link: "https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
  },
  {
    id: 'smoothlife',
    name: 'SmoothLife',
    make: smoothlife,
    text: 'Stephan Rafler, 2011. The Game of Life with continuous values: each cell compares the average of a small disk around it with the ring around that. The result is round, gliding blobs.',
    link: 'https://arxiv.org/abs/1111.1567'
  },
  {
    id: 'lenia',
    name: 'Lenia',
    make: lenia,
    text: 'Bert Chan, 2018. Continuous states, space and time, with a smooth ring-shaped neighbourhood. The creatures gliding here are Orbium, its best-known lifeform.',
    link: 'https://en.wikipedia.org/wiki/Lenia'
  },
  {
    id: 'ant',
    name: "Langton's ant",
    make: ant,
    text: 'Chris Langton, 1986. On a white cell the ant turns right, on a black one left; it flips the cell and steps forward. A single ant builds a straight "highway" after about 10,000 chaotic steps.',
    link: "https://en.wikipedia.org/wiki/Langton%27s_ant"
  },
  {
    id: 'brain',
    name: "Brian's Brain",
    make: brain,
    text: 'Brian Silverman. Every cell goes on → dying → off; an off cell switches on when exactly two neighbours are on. It never settles down.',
    link: "https://en.wikipedia.org/wiki/Brian%27s_Brain"
  }
];

const SEEN = 'ca-seen';
const LAST = 'ca-last';

/**
 * Which automaton to show (browser only):
 *  - ?ca=<id> in the URL wins (for testing, e.g. ?ca=lenia)
 *  - the first page load in a session is always Rule 22
 *  - after that a random one, never the same twice in a row
 */
export function pickAutomaton(fallback = 'rule22') {
  const byId = (id) => AUTOMATA.find((a) => a.id === id);
  const forced = byId(new URLSearchParams(window.location.search).get('ca'));
  let seen = false, last = null;
  try {
    seen = sessionStorage.getItem(SEEN) === '1';
    last = sessionStorage.getItem(LAST);
  } catch {}

  let pick = forced;
  if (!pick && !seen) pick = byId(fallback) ?? AUTOMATA[0];
  if (!pick) {
    const others = AUTOMATA.filter((a) => a.id !== last);
    pick = others[(Math.random() * others.length) | 0];
  }
  try {
    sessionStorage.setItem(SEEN, '1');
    sessionStorage.setItem(LAST, pick.id);
  } catch {}
  return pick;
}
