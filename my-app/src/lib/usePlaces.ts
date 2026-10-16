import { useEffect, useState } from 'react';
import snapshot from '../data/places.json';
import { loadPlaces, type Place } from './places';

/** The list as of the last build. See scripts/fetch-places.mjs. */
const baked = snapshot.places as Place[];

/**
 * The places list, starting from the copy baked into the build.
 *
 * It used to start empty, which is what served /places to a crawler as "The
 * list is on its way" -- on the page most likely to be found by somebody
 * searching for things to do around Kanyakumari, who is exactly the person
 * who then needs a car. The browser still asks the panel, so a place added
 * this morning appears this morning.
 */
export function usePlaces(): Place[] {
  const [places, setPlaces] = useState<Place[]>(baked);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    loadPlaces(controller.signal).then((next) => {
      // Only when the panel actually answered. loadPlaces returns an empty
      // list on a failure, and replacing a good list with nothing would empty
      // the page because a shared host had a bad minute.
      if (active && next.length > 0) setPlaces(next);
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return places;
}
