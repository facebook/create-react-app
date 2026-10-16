/**
 * The routes the articles live at, derived from posts.json.
 *
 * Plain ESM and shared verbatim by the app and by the build, for the same
 * reason town-routes.mjs is: useSeo needs these after a client-side
 * navigation, and prerender-seo.mjs needs them to write each page and its
 * line in the sitemap.
 */

/** Everything under here is an article. */
export const BLOG_BASE = '/blog';

/** One route per post. The meta title is the one written for a search result. */
export function postRoutes(posts) {
  return posts.map((post) => ({
    path: `${BLOG_BASE}/${post.slug}`,
    title: post.metaTitle ?? post.title,
    description: post.description,
    priority: '0.6',
    imageSlot: 'blog-hero',
    imageAlt: post.title,
  }));
}
