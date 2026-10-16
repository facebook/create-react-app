/**
 * The fleet's shape, and the copy of it that ships with the build.
 *
 * The live list lives in the admin database. scripts/fetch-fleet.mjs pulls it
 * in before Vite runs and writes fleet.json, which is what this exports -- so
 * the vehicles are in the HTML as served rather than arriving after a fetch.
 * That matters more here than almost anywhere else on the site: /cars and
 * /tariff are the two pages people search for by car name, and they used to be
 * served to a crawler as "Loading our cars…".
 *
 * The browser still asks the panel on load, so this is the floor rather than
 * the ceiling: a car added this morning appears this morning.
 *
 * Fields mirror the vehicles and vehicle_rates tables so the two stay
 * comparable: rates are rupees, kmLimitPerDay and extraKmRate come from the
 * current rate card, and deposit is security_deposit.
 */
import snapshot from './fleet.json';

export type BodyType = 'Hatchback' | 'Sedan' | 'SUV' | 'MUV';
export type Fuel = 'Petrol' | 'Diesel' | 'Electric' | 'CNG';
export type Transmission = 'Manual' | 'Automatic';

export interface Car {
  id: string;
  brand: string;
  name: string;
  bodyType: BodyType;
  fuel: Fuel;
  transmission: Transmission;
  seats: number;
  year: number;
  /** Daily rate in rupees. What a booking is charged at. */
  rateDaily: number;
  /**
   * Top of the advertised daily band, when the price is a range rather than
   * one figure. Display only -- rateDaily is still what is charged.
   */
  rateDailyMax?: number;
  /** Per-day rate when hired for a week or more. Omit if not offered. */
  rateWeekly?: number;
  /** Per-day rate for a month or more. Omit if not offered. */
  rateMonthly?: number;
  kmLimitPerDay: number;
  extraKmRate: number;
  deposit: number;
  image?: string;
  available: boolean;
}

/**
 * What ships in the bundle: the panel's list as of the last build.
 *
 * Not hand-edited except to correct a model name. Rates are the panel's, and
 * a rate of 0 means the panel had none to give -- see dailyRate below.
 */
export const cars = snapshot.vehicles as Car[];

/** Whether that snapshot came from the panel or is the committed floor. */
export const fleetIsLive = snapshot.live;

/** Rupee formatting, Indian digit grouping, no decimals. */
export const inr = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

/**
 * What a card prints as the daily price.
 *
 * A band when the panel carries an upper rate, one figure otherwise. An upper
 * rate equal to or below the daily rate is treated as no band at all: printing
 * "₹1,600 – ₹1,600" would look like a fault, and "₹1,800 – ₹1,600" like a
 * different one.
 *
 * Nothing at all becomes "On request", never ₹0. A tariff is a promise, and a
 * figure nobody at the business typed is not one they can keep -- which is
 * exactly what would get published if a missing rate printed as a number.
 */
export const dailyRate = (car: Pick<Car, 'rateDaily' | 'rateDailyMax'>) =>
  car.rateDaily <= 0
    ? 'On request'
    : car.rateDailyMax !== undefined && car.rateDailyMax > car.rateDaily
      ? `${inr(car.rateDaily)} – ${inr(car.rateDailyMax)}`
      : inr(car.rateDaily);

/** A figure, or a dash where the panel has none. For the tariff table. */
export const orDash = (n: number | undefined) => (n && n > 0 ? inr(n) : '—');
