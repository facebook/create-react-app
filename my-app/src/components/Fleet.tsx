import { useState } from 'react';
import { Link } from 'react-router-dom';
import { dailyRate, inr, orDash, type BodyType, type Car } from '../data/cars';
import modelData from '../data/models.json';
import { carPhoto } from '../lib/carPhoto';
import { useFleet } from '../lib/useFleet';
import { SectionArt } from './art/SectionArt';
import { Reveal } from './Reveal';
import { BrandPanel } from './BrandPanel';

type Filter = 'All' | BodyType;
const filters: Filter[] = ['All', 'Hatchback', 'Sedan', 'SUV', 'MUV'];

/**
 * The page written about this vehicle, if there is one.
 *
 * The listing used to be the end of the road: a card, a price and an enquiry
 * button, with nothing to click for somebody still deciding between two of
 * them. Where a car has a page of its own, the card leads to it -- which is
 * also how a crawler reaches those pages from the listing they belong to.
 */
function modelPath(car: Car): string | null {
  const label = `${car.brand} ${car.name}`.toLowerCase();
  const model = modelData.models.find((m) => label.includes(m.match.toLowerCase()));
  return model ? `/cars/${model.slug}` : null;
}

export function Fleet() {
  const [filter, setFilter] = useState<Filter>('All');
  const fleet = useFleet();

  const cars = fleet.status === 'ready' ? fleet.cars : [];
  const empty = cars.length === 0;
  const shown = filter === 'All' ? cars : cars.filter((c) => c.bodyType === filter);

  return (
    <section id="fleet" className="mx-auto max-w-[86rem] px-5 sm:px-8 lg:px-12 py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Our fleet
          </h2>
          <p className="mt-2 max-w-lg text-ink-dim">
            {empty
              ? 'We are updating our vehicle listing. Call us or send an enquiry and we will tell you what is free for your dates.'
              : 'Rates shown are per day. Longer rentals bring the daily rate down.'}
          </p>
        </div>

        {empty ? null : (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by body type">
          {filters.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                  active
                    ? 'border-navy bg-navy text-white'
                    : 'border-line bg-white text-ink-dim hover:border-navy/40 hover:text-navy'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
        )}
      </div>

      {empty ? (
        <div className="mt-10">
          <BrandPanel title="Ask us what's available">
            Our current vehicles are not listed here yet. Tell us your dates and
            what you need, and we will come back with the options and the rate.
          </BrandPanel>
        </div>
      ) : (
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((car, i) => {
          const label = `${car.brand} ${car.name}`;
          const photo = carPhoto(car);
          const detail = modelPath(car);
          return (
            <Reveal key={car.id} delay={i * 70}>
            <article
              data-lift=""
              className="flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-white shadow-[0_10px_30px_rgba(16,24,40,0.08)]"
            >
              <div className="relative aspect-[16/10] bg-cream">
                {/* No photograph yet falls through to the drawing the rest of
                    the site uses, not a grey initial: a card with a picture on
                    it reads as a vehicle for hire, and a card with a letter on
                    it reads as a page that failed to load. */}
                <SectionArt
                  name="/cars"
                  className="h-full"
                  photo={photo}
                  alt={photo ? label : undefined}
                />
                <span
                  className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    car.available
                      ? 'bg-ok-soft text-ok'
                      : 'bg-line text-ink-faint'
                  }`}
                >
                  {car.available ? 'Available' : 'On rental'}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
                  {car.brand}
                </p>
                <h3 className="mt-0.5 text-lg font-semibold text-navy">
                  {detail ? (
                    <Link to={detail} className="transition hover:text-gold-deep">
                      {car.name}
                    </Link>
                  ) : (
                    car.name
                  )}
                </h3>

                <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-dim">
                  <div className="flex gap-1.5">
                    <dt className="sr-only">Body type</dt>
                    <dd>{car.bodyType}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="sr-only">Fuel</dt>
                    <dd>{car.fuel}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="sr-only">Transmission</dt>
                    <dd>{car.transmission}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="sr-only">Seats</dt>
                    <dd>{car.seats} seats</dd>
                  </div>
                </dl>

                <div className="mt-4 border-t border-line pt-4">
                  {/* A band when the panel carries an upper rate, one figure
                      otherwise — dailyRate decides, so this card and the
                      tariff table can never disagree about the price. */}
                  <p className="flex flex-wrap items-baseline gap-x-1.5">
                    <span className="text-2xl font-bold text-navy">
                      {dailyRate(car)}
                    </span>
                    <span className="text-sm text-ink-faint">/ day</span>
                  </p>
                  {car.rateMonthly ? (
                    <p className="mt-1 text-sm text-gold-deep">
                      {inr(car.rateMonthly)} on monthly rental
                    </p>
                  ) : null}
                  {/* Gold hairlines rather than interpuncts, matching the rule
                      under the logo bar. Marked aria-hidden because a divider
                      read aloud as a character is noise; the items are
                      separate elements, which is what carries the grouping. */}
                  <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-faint">
                    <span>
                      {car.kmLimitPerDay > 0
                        ? `${car.kmLimitPerDay} km/day included`
                        : 'KM limit agreed when you book'}
                    </span>
                    <span aria-hidden="true" className="h-3.5 w-0.5 shrink-0 rounded-full bg-gold-mid" />
                    <span>{orDash(car.extraKmRate)}/km after</span>
                    <span aria-hidden="true" className="h-3.5 w-0.5 shrink-0 rounded-full bg-gold-mid" />
                    <span>{orDash(car.deposit)} deposit</span>
                  </p>
                </div>

                <Link
                  to={`/contact?car=${encodeURIComponent(label)}`}
                  className="mt-5 block w-full rounded-xl bg-navy px-4 py-2.5 text-center font-semibold text-white transition hover:bg-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  Enquire about this car
                </Link>

                {detail ? (
                  <Link
                    to={detail}
                    className="tap-target group mt-3 inline-flex items-center gap-1.5 self-center text-sm font-semibold text-gold-deep"
                  >
                    More about the {car.name}
                    <span aria-hidden="true" className="transition group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                ) : null}
              </div>
            </article>
            </Reveal>
          );
        })}
      </div>
      )}
    </section>
  );
}
