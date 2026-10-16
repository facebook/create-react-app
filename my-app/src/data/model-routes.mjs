/**
 * The routes the individual car pages live at, derived from models.json.
 *
 * Plain ESM and shared verbatim by the app and by the build, for the same
 * reason town-routes.mjs is: useSeo needs these to set the title after a
 * client-side navigation, and prerender-seo.mjs needs them to write each
 * page's HTML and its line in the sitemap. Two lists would be two lists to
 * keep in step, and the way that fails is a page that exists, renders, and is
 * invisible to Google because nothing wrote it into the sitemap.
 */

/** Everything under here is a car page. It nests under the fleet listing. */
export const MODEL_BASE = '/cars';

/** One route per model. */
export function modelRoutes(models) {
  return models.map((model) => ({
    path: `${MODEL_BASE}/${model.slug}`,
    title: model.title,
    description: model.description,
    priority: '0.7',
    imageSlot: 'cars-hero',
    imageAlt: `${model.name} for self drive hire in Nagercoil and Kanyakumari district`,
  }));
}
