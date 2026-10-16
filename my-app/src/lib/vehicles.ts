/**
 * Fleet loading.
 *
 * Vehicles live in the admin panel's database, which is the single place they
 * are managed. The public endpoint returns every car the business rents --
 * out on hire or not -- and only public-safe columns, so adding a car in the
 * panel puts it on the site and setting one to Maintenance or Inactive takes
 * it off.
 *
 * A car being out today does not remove it: the fleet page is a catalogue,
 * and which days each car is free comes from the availability endpoint, which
 * greys those days out in the date pickers.
 *
 * cars.ts remains as a fallback: if the API is unreachable the site shows
 * whatever is in that file rather than an error. It is empty by default, which
 * degrades to the "ask us what's available" state.
 */
import { cars as fallbackCars, type Car } from '../data/cars';
import { apiUrl, panelUrl } from './api';

const ENDPOINT = apiUrl('public-vehicles.php');

interface ApiVehicle {
  id: string;
  brand: string;
  name: string;
  bodyType: string;
  photo: string | null;
  fuel: string;
  transmission: string;
  seats: number;
  year: number;
  rateDaily: number;
  rateDailyMax: number | null;
  rateWeekly: number | null;
  rateFortnight: number | null;
  rateMonthly: number | null;
  kmLimitPerDay: number;
  extraKmRate: number;
  deposit: number;
}

const BODY_TYPES = ['Hatchback', 'Sedan', 'SUV', 'MUV'] as const;
const FUELS = ['Petrol', 'Diesel', 'Electric', 'CNG'] as const;
const TRANSMISSIONS = ['Manual', 'Automatic'] as const;

/**
 * The database allows body types and fuels the site does not render (MUV is
 * shared, but 'Other' exists server-side). Anything unrecognised falls back to
 * a sane value rather than breaking the filters.
 */
function toCar(v: ApiVehicle): Car {
  const bodyType = (BODY_TYPES as readonly string[]).includes(v.bodyType)
    ? (v.bodyType as Car['bodyType'])
    : 'Hatchback';
  const fuel = (FUELS as readonly string[]).includes(v.fuel)
    ? (v.fuel as Car['fuel'])
    : 'Petrol';
  const transmission = (TRANSMISSIONS as readonly string[]).includes(v.transmission)
    ? (v.transmission as Car['transmission'])
    : 'Manual';

  return {
    id: v.id,
    brand: v.brand,
    name: v.name,
    bodyType,
    fuel,
    transmission,
    seats: v.seats,
    year: v.year,
    rateDaily: v.rateDaily,
    rateDailyMax: v.rateDailyMax ?? undefined,
    rateWeekly: v.rateWeekly ?? undefined,
    rateMonthly: v.rateMonthly ?? undefined,
    kmLimitPerDay: v.kmLimitPerDay,
    extraKmRate: v.extraKmRate,
    deposit: v.deposit,
    // Uploaded in the panel. carPhoto() prefers this over anything matched by
    // filename, so a photograph attached to the vehicle always wins.
    image: v.photo ? panelUrl(v.photo) : undefined,
    available: true, // the endpoint only returns Available vehicles
  };
}

export type FleetState =
  | { status: 'loading' }
  | { status: 'ready'; cars: Car[]; live: boolean };

export async function loadFleet(signal?: AbortSignal): Promise<FleetState> {
  try {
    const response = await fetch(ENDPOINT, { signal });
    if (!response.ok) throw new Error(`the server answered ${response.status}`);

    const body: { ok?: boolean; vehicles?: ApiVehicle[] } = await response.json();
    if (!body.ok || !Array.isArray(body.vehicles)) {
      throw new Error('the response was not the expected { ok, vehicles } shape');
    }

    if (body.vehicles.length === 0) {
      // This is the case that used to be indistinguishable from a dead
      // endpoint, and they need completely different fixes. The endpoint only
      // returns vehicles whose status is Available and which have a rate card
      // dated today or earlier, so an empty list is a data question, not a
      // plumbing one.
      console.info(
        '[fleet] The panel answered normally with zero vehicles. Every vehicle is ' +
          'either not set to Available, or has no rate card dated today or earlier.',
      );
    }

    return { status: 'ready', cars: body.vehicles.map(toCar), live: true };
  } catch (error) {
    // Offline, CORS, a 500, a certificate the browser rejects, or the endpoint
    // never uploaded. Falling back keeps the page coherent -- a visitor should
    // never see a broken listing -- but staying silent about it cost real time
    // once already: "no cars" looked the same whether the panel had none or
    // could not be reached at all, and only one of those is a code problem.
    if ((error as Error)?.name === 'AbortError') {
      // Navigating away mid-request. Not a fault, so not worth reporting.
      return { status: 'ready', cars: fallbackCars, live: false };
    }
    console.warn(
      `[fleet] Could not read the vehicle list from ${ENDPOINT} — ` +
        `${(error as Error)?.message ?? 'unknown error'}. Showing the fallback listing. ` +
        'Open that URL directly to see what the server actually returns.',
    );
    return { status: 'ready', cars: fallbackCars, live: false };
  }
}
