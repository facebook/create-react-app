/**
 * The routes the town pages live at, derived from towns.json.
 *
 * Plain ESM and shared verbatim by the app and by the build, for the same
 * reason merge.mjs is: useSeo needs these to set the title after a
 * client-side navigation, and prerender-seo.mjs needs them to write each
 * page's HTML and its line in the sitemap. Two lists would be two lists to
 * keep in step, and the way that fails is a page that exists, renders, and is
 * invisible to Google because nothing wrote it into the sitemap.
 */

/** Everything under here is a town page. */
export const TOWN_BASE = '/car-rental';

/** The hub that lists them, which is also what the breadcrumbs point through. */
export function townHubRoute(site) {
  return {
    path: TOWN_BASE,
    title: `Self Drive Car & Bike Rental Across ${site.district} District`,
    // Kept under the length a search result shows. The old wording ran to
    // 176 characters, and the last two towns in it were never read by anyone.
    description:
      `Self drive cars, bikes, wedding cars and tourist vehicles delivered across ` +
      `${site.district} district — ${site.areas.slice(0, 4).join(', ')} and beyond.`,
    priority: '0.8',
    imageSlot: 'coast',
    imageAlt: `The towns of ${site.district} district where we deliver vehicles`,
  };
}

/** One route per town. */
export function townRoutes(towns, site) {
  return towns.map((town) => ({
    path: `${TOWN_BASE}/${town.slug}`,
    title: town.title,
    description: town.description,
    priority: '0.7',
    imageSlot: 'cars-hero',
    imageAlt: `Self drive cars and bikes for hire in ${town.name}, ${site.district} district`,
  }));
}

/** The hub and the towns, in the order a sitemap should list them. */
export function allTownRoutes(towns, site) {
  return [townHubRoute(site), ...townRoutes(towns, site)];
}
