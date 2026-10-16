import { useEffect, useState } from 'react';
import { cars as baked } from '../data/cars';
import { loadFleet, type FleetState } from './vehicles';

/**
 * The fleet, starting from the copy baked into the build.
 *
 * It used to start at `loading`, which is what put "Fetching the current
 * fleet…" and "Loading the rate card…" into the prerendered HTML of the two
 * pages this business is searched for by name. A crawler reading /cars found
 * no cars on it.
 *
 * So the first render already has vehicles -- scripts/fetch-fleet.mjs writes
 * the panel's list into the bundle -- and the browser's fetch replaces them a
 * moment later if anything has changed since the build. Nobody sees a loading
 * state, and nobody is served a page about nothing.
 */
export function useFleet(): FleetState {
  const [state, setState] = useState<FleetState>({
    status: 'ready',
    cars: baked,
    live: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    loadFleet(controller.signal).then((next) => {
      // Only when it is genuinely the panel's answer. loadFleet falls back to
      // this same baked list on a failure, and swapping it for itself would
      // re-render the grid for nothing.
      if (active && next.status === 'ready' && next.live) setState(next);
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return state;
}
