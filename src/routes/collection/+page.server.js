import { getCollection } from '$lib/server/content.js';

export function load() {
  return { collection: getCollection() };
}
