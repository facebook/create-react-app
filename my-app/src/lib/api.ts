/**
 * Where the admin panel's public endpoints live.
 *
 * The site and the panel now sit on one host: the website at niteshacars.in
 * and the panel at niteshacars.in/admin. That makes these requests same-origin,
 * which removes a whole class of problem rather than configuring around it --
 * no CORS preflight, no allowlist to keep in step with the domain, and no
 * second certificate. The missing certificate on admin.niteshacars.in is
 * exactly what silently emptied the fleet: a browser refuses to read across
 * origins from a host it does not trust, and it fails without a word.
 *
 * VITE_API_BASE overrides it, for running the site locally against a panel
 * that is somewhere else. Unset, it is a relative path, which is what
 * production wants.
 */
const base = import.meta.env.VITE_API_BASE ?? '/admin';

export function apiUrl(endpoint: string): string {
  return `${panelUrl('')}/api/${endpoint.replace(/^\/+/, '')}`;
}

/**
 * A path relative to the panel itself rather than its api/ folder.
 *
 * Vehicle photographs come back from the API as `photo.php?f=...`, which is
 * relative to the panel. Used as-is in an <img> it would resolve against the
 * page instead -- /cars/photo.php on the fleet page -- and every photograph
 * would 404 on some pages and work on others, which is the kind of bug that
 * looks like a caching problem for a day.
 */
export function panelUrl(path: string): string {
  const root = base.replace(/\/+$/, '');
  if (path === '') return root;
  // An address the panel gives as root-absolute is already where it wants to
  // be. Photographs come back as /car-photos/..., /site-images/... and
  // /place-photos/... -- served from the site root rather than from under
  // /admin, so the folder in every picture's URL is a word about the site
  // instead of one a crawler is routinely told to stay out of. Prefixing
  // those with /admin would undo exactly that.
  if (path.startsWith('/')) return path;
  return `${root}/${path.replace(/^\/+/, '')}`;
}
