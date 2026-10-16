import { useEffect, useState } from 'react';
import { apiUrl } from './api';

/**
 * The days already spoken for, from the panel.
 *
 * `busy` is the list the enquiry form wants: a visitor has not picked a
 * vehicle, so a day is only genuinely unavailable when every vehicle is out.
 * `vehicles` is the same thing per vehicle, for anywhere that knows which one.
 *
 * A failure is not an error state here. The form still works with no dates
 * marked, and the panel refuses a clashing booking on save regardless, so the
 * worst case is the old behaviour rather than a broken page.
 */
export interface Availability {
  /** ISO days on which nothing at all is free. */
  busy: Set<string>;
  /** Vehicle id -> the [from, to] day ranges it is out for. */
  vehicles: Record<string, [string, string][]>;
}

const EMPTY: Availability = { busy: new Set(), vehicles: {} };

export function useAvailability(): Availability {
  const [state, setState] = useState<Availability>(EMPTY);

  useEffect(() => {
    const abort = new AbortController();

    void (async () => {
      try {
        const response = await fetch(apiUrl('public-availability.php'), {
          signal: abort.signal,
          headers: { accept: 'application/json' },
        });
        if (!response.ok) throw new Error(`the server answered ${response.status}`);

        const body: { ok?: boolean; busy?: unknown; vehicles?: unknown } = await response.json();
        if (!body.ok) throw new Error('the response was not the expected { ok } shape');

        setState({
          busy: new Set(Array.isArray(body.busy) ? body.busy.filter((d) => typeof d === 'string') : []),
          vehicles:
            body.vehicles && typeof body.vehicles === 'object'
              ? (body.vehicles as Record<string, [string, string][]>)
              : {},
        });
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') return;
        // Said out loud, not shown: the form is still usable and still safe.
        console.info(
          `[availability] Could not read which days are taken — ${(error as Error)?.message ?? 'unknown error'}. ` +
            'Every day will be offered; a clash is still refused when the booking is saved.',
        );
      }
    })();

    return () => abort.abort();
  }, []);

  return state;
}

/** Every day from `from` to `to` inclusive, as ISO strings. */
export function daysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  const end = new Date(`${to}T00:00:00`);
  const day = new Date(`${from}T00:00:00`);
  // Capped for the same reason the server caps it: a mistyped return date
  // should not become a loop that never finishes.
  for (let i = 0; i < 400 && day <= end; i++) {
    out.push(day.toISOString().slice(0, 10));
    day.setDate(day.getDate() + 1);
  }
  return out;
}

/** The days one vehicle is out for, as a set. */
export function busyForVehicle(a: Availability, vehicleId: string | undefined): Set<string> {
  if (!vehicleId) return a.busy;
  const ranges = a.vehicles[vehicleId];
  if (!ranges) return new Set();
  return new Set(ranges.flatMap(([from, to]) => daysBetween(from, to)));
}
