/**
 * The routes the service-in-a-town pages live at, derived from
 * service-areas.json.
 *
 * Plain ESM and shared verbatim by the app and by the build, for the same
 * reason town-routes.mjs and model-routes.mjs are: useSeo needs these to set
 * the title after a client-side navigation, and prerender-seo.mjs needs them
 * to write each page's HTML and its line in the sitemap.
 *
 * The path is the service's own page plus the town -- /bikes/kanyakumari
 * rather than /bike-rental-kanyakumari -- so the page sits under the service
 * it is part of and the breadcrumb can say so. A flat slug would read as a
 * page of its own about nothing in particular.
 */

/** Every page's path, from its service and its town. */
export const serviceAreaPath = (page) => `${page.base}/${page.slug}`;

export function serviceAreaRoutes(pages) {
  return pages.map((page) => ({
    path: serviceAreaPath(page),
    title: page.title,
    description: page.description,
    priority: '0.7',
    imageSlot: 'cars-hero',
    imageAlt: `${page.service} in ${page.town}, Kanyakumari district`,
  }));
}

/** The one page for a path, or null. Used by the app's route and the build. */
export function findServiceArea(pages, path) {
  return pages.find((page) => serviceAreaPath(page) === path) ?? null;
}
