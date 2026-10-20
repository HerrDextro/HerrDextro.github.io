// Shared between Backdrop.svelte (in the layout), Hero.svelte and
// AutomatonNote.svelte. A .svelte.js file may use runes like $state.
export const backdrop = $state({
  ready: false, // the engine is running
  current: null, // the automaton entry from automata/index.js
  phase: 'start' // intro progress: start → morph → named → done
});

// the engine itself is a plain object; keep it out of $state
let engine = null;
export const setEngine = (e) => (engine = e);
export const getEngine = () => engine;
