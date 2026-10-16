import { useSyncExternalStore } from 'react';
import live from './live.json';
import { apiUrl, panelUrl } from '../lib/api';
import { photoFor } from '../lib/photos';
// @ts-expect-error -- plain ESM, shared verbatim with the build script so the
// two can never disagree about which edits are safe to show.
import { mergeContent } from './merge.mjs';

/**
 * The site's editable copy.
 *
 * There are two versions of this and both matter.
 *
 * `live.json` is written by scripts/fetch-content.mjs before Vite starts, so
 * the words are in the HTML as served. That is not a detail: WhatsApp,
 * Facebook and most link unfurlers do not run JavaScript, and a site competing
 * on local search wants its copy in the markup rather than behind a fetch.
 *
 * But the panel is edited after the build, and this site is published by
 * committing a built folder -- so text changed in "Website content" would sit
 * there invisible until someone happened to rebuild. That is the same class of
 * silent failure as a car added to the fleet that never appears: the person
 * did the thing the interface offered and nothing happened.
 *
 * So the baked copy is the starting point, and the browser asks the panel for
 * anything newer once the page is up. Crawlers and unfurlers get the built
 * copy, visitors get the current one, and neither has to wait for the other.
 * A content edit therefore shows to people immediately and to Google at the
 * next publish, which is the right way round.
 */

type Content = typeof live;

/**
 * Images uploaded in the panel, by slot.
 *
 * Open-ended rather than two named fields: the panel's list of slots grows
 * whenever a new place on the site can take a picture, and a type that had to
 * be edited in step with it would be edited one release late.
 */
export type Brand = Record<string, string | undefined>;

// Module state rather than a context: the copy is read by eight sections of one
// page, none of which can change it, so a provider would be ceremony around a
// value that is effectively global. One fetch serves all of them.
let current: Content = live;
let brand: Brand = {};
let started = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

async function loadOnce(): Promise<void> {
  if (started) return;
  started = true;

  try {
    const response = await fetch(apiUrl('public-content.php'), {
      headers: { accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`the server answered ${response.status}`);

    const body: { ok?: boolean; overrides?: unknown; brand?: Record<string, unknown> } =
      await response.json();
    if (!body.ok) throw new Error('the response was not the expected { ok } shape');

    // The panel returns these relative to itself, so they have to be resolved
    // against the panel and not the page -- an <img> would otherwise ask for
    // /cars/brand.php on the fleet page and get a 404 on some pages only.
    const nextBrand: Brand = {};
    for (const [slot, value] of Object.entries(body.brand ?? {})) {
      if (typeof value === 'string' && value !== '') nextBrand[slot] = panelUrl(value);
    }

    const merged = mergeContent(live, body.overrides ?? {}, (message: string) =>
      console.info(`[content] ${message}`),
    ) as Content;

    // Re-rendering eight sections to paint identical text is wasted work on
    // every page load, and this is the common case: nothing edited since the
    // last build.
    const changed =
      JSON.stringify(merged) !== JSON.stringify(current) ||
      JSON.stringify(nextBrand) !== JSON.stringify(brand);

    if (changed) {
      current = merged;
      brand = nextBrand;
      notify();
    }
  } catch (error) {
    // The built-in copy is already on screen and is a complete, correct site,
    // so there is nothing to fall back to and nothing a visitor should see.
    // Said out loud anyway: "my edit did not show up" is otherwise
    // indistinguishable from "I forgot to press save".
    console.warn(
      `[content] Could not read the panel's copy — ${(error as Error)?.message ?? 'unknown error'}. ` +
        'Showing the wording from the last build. Open /fleet-check.html to test the panel connection.',
    );
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  void loadOnce();
  return () => {
    listeners.delete(listener);
  };
}

/** The home page's copy, updating in place if the panel has newer wording. */
export function useHome(): Content['home'] {
  return useSyncExternalStore(
    subscribe,
    () => current.home,
    // Prerendering and any non-browser render get the built copy, which is
    // exactly what should end up in the HTML.
    () => live.home,
  );
}

/** The about page's copy, the same way. */
export function useAbout(): Content['about'] {
  return useSyncExternalStore(
    subscribe,
    () => current.about,
    () => live.about,
  );
}

/** Images uploaded in the panel, empty until it answers. */
export function useBrand(): Brand {
  return useSyncExternalStore(
    subscribe,
    () => brand,
    // Prerendering has no panel to ask, so the drawn versions go into the HTML
    // -- which is right: a crawler should not wait on an image request.
    () => EMPTY_BRAND,
  );
}

// A stable identity: useSyncExternalStore compares snapshots by reference, and
// a fresh {} each call would loop forever.
const EMPTY_BRAND: Brand = {};

/**
 * One uploaded image, falling back to a file committed under public/photos.
 *
 * Every place that shows a picture asks this, so an upload in the panel and a
 * file in the repository are the same question with one answer, and the
 * uploaded one wins -- it is the one an owner can change without a deploy.
 */
export function useSiteImage(slot: string): string | undefined {
  return useBrand()[slot] ?? photoFor(slot);
}

/** The copy as it stood at build time. For anything outside a component. */
export const content = live;
export const home = live.home;
