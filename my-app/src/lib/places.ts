import { apiUrl, panelUrl } from './api';

/**
 * Places worth driving to, from the panel.
 *
 * Fetched in the browser rather than baked at build time, for the same reason
 * the fleet is: the owner adds one and it appears, without waiting for anyone
 * to deploy. An empty list is a perfectly good answer -- the sections that use
 * it render nothing rather than an apology.
 */

export interface Place {
  id: string;
  name: string;
  category: string;
  blurb: string;
  mapUrl: string;
  photo?: string;
}

interface ApiPlace {
  id: string;
  name: string;
  category: string;
  blurb: string;
  mapUrl: string;
  photo: string | null;
}

export async function loadPlaces(signal?: AbortSignal): Promise<Place[]> {
  try {
    const response = await fetch(apiUrl('public-places.php'), { signal });
    if (!response.ok) throw new Error(`the server answered ${response.status}`);

    const body: { ok?: boolean; places?: ApiPlace[] } = await response.json();
    if (!body.ok || !Array.isArray(body.places)) {
      throw new Error('the response was not the expected { ok, places } shape');
    }

    return body.places.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      blurb: p.blurb,
      // Only http(s) reaches here -- the panel refuses anything else -- but the
      // check is repeated because this value ends up in an href, and a link
      // that can carry javascript: is a hole wherever it is filled from.
      mapUrl: /^https?:\/\//i.test(p.mapUrl) ? p.mapUrl : '',
      // Relative to the panel, so it must resolve against the panel and not
      // whichever page happens to be showing it.
      photo: p.photo ? panelUrl(p.photo) : undefined,
    }));
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') return [];
    console.warn(
      `[places] Could not read the places list — ${(error as Error)?.message ?? 'unknown error'}.`,
    );
    return [];
  }
}
