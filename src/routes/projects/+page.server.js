import { projectCards, TAGS } from '$lib/server/content.js';

export function load() {
  const projects = projectCards();
  const used = new Set(projects.flatMap((p) => p.tags.map((t) => t.id)));
  return {
    projects,
    tags: Object.entries(TAGS).filter(([id]) => used.has(id)).map(([id, label]) => ({ id, label }))
  };
}
