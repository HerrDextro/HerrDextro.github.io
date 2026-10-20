import { projectCards } from '$lib/server/content.js';
import { findCv } from '$lib/server/cv.js';

export function load() {
  return { projects: projectCards(), cv: findCv() };
}
