/**
 * Scene names, kept apart from the drawings themselves.
 *
 * Splitting this out is not organisational tidiness: a module that exports a
 * component and a plain function together breaks Vite's fast refresh, which
 * then reloads the whole page on every edit instead of swapping the component
 * in place. SectionArt.tsx exports components only; the lookup helper lives
 * here.
 */

export const SCENE_NAMES = [
  '/cars',
  '/bikes',
  '/wedding-cars',
  '/tourist-vehicles',
  '/monthly',
  '/nri',
  'coast',
  'step-1',
  'step-2',
  'step-3',
] as const;

export type SceneName = (typeof SCENE_NAMES)[number];

/** True when this key has a drawing, so callers can fall back rather than crash. */
export function hasScene(name: string): name is SceneName {
  return (SCENE_NAMES as readonly string[]).includes(name);
}
