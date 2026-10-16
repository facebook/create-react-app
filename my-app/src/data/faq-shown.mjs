/**
 * How many questions the home page shows.
 *
 * Plain ESM and shared verbatim by the component and by the build, for the
 * same reason town-routes.mjs is. Google asks that FAQPage structured data
 * match what the page actually displays, so the number the home page renders
 * and the number written into its structured data have to be the same number
 * -- and two copies of it are two copies to keep in step. The way that fails
 * is a page claiming ten answers and showing six, which is the kind of thing
 * that gets a site's rich results turned off rather than improved.
 *
 * Six because the panel carries ten and ten on a home page is a wall: the
 * last of them sits a scroll and a half below the heading, on the page
 * somebody is still deciding whether to keep reading. The rest are on the
 * tariff page, which is where the person with a detailed question already is.
 */
export const HOME_FAQ_SHOWN = 6;
