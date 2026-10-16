import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import seo from '../data/seo.json';
// The fixed pages plus one per town, car, service area and post, composed at
// build time by scripts/seo-routes.mjs from those same files -- and read here
// rather than recomposed.
//
// This used to import towns.json, models.json, service-areas.json and
// posts.json and compose the list in the browser. All four then landed in the
// entry chunk, so every page of the site shipped every blog post's body and
// every car's luggage capacity in order to end up with a path, a title and a
// sentence. On a mid-range phone that was the longest task of the load, and
// none of it was on screen.
import generated from '../data/seo-routes.json';

const routes: { path: string; title: string; description: string }[] =
  generated.routes;

/**
 * Keeps the document title, description and canonical in step with the route.
 *
 * The build prerenders correct tags into each route's HTML, which is what
 * crawlers and link previews read. This handles the other half: once the app
 * has booted, navigation is client-side and never re-requests HTML, so without
 * this the title would stay on whichever page was loaded first -- wrong in the
 * tab, in bookmarks, and in browser history.
 */
export function useSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Static hosts serve directory URLs with a trailing slash: GitHub Pages
    // redirects /cars to /cars/. seo.json and the sitemap store the bare form,
    // so an exact match fails for anyone arriving from search or refreshing --
    // React Router still matches and renders the right page, which is what
    // made this invisible on screen while the title said "Page not found".
    const path = pathname.replace(/\/+$/, '') || '/';

    const route =
      routes.find((r) => r.path === path) ??
      ({
        title: `Page not found — ${seo.site.name}`,
        description: '',
      } as (typeof seo.routes)[number]);

    document.title = route.title;

    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.head.querySelector<HTMLMetaElement>(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', route.description);
    setMeta('meta[property="og:title"]', 'content', route.title);
    setMeta('meta[property="og:description"]', 'content', route.description);
    setMeta('meta[property="og:url"]', 'content', seo.site.origin + path);

    const canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (canonical) canonical.href = seo.site.origin + path;
  }, [pathname]);
}
