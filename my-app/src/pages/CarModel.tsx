import { Link, useParams } from 'react-router-dom';
import seo from '../data/seo.json';
import modelData from '../data/models.json';
import { dailyRate, orDash, type Car } from '../data/cars';
import { readablePhone } from '../lib/phone';
import { useFleet } from '../lib/useFleet';
import { Reveal } from '../components/Reveal';
import { PageHeader } from './PageHeader';
import { NotFound } from './NotFound';

/**
 * One page per vehicle people ask for by name.
 *
 * Somebody deciding between a Swift and an Innova is not searching for "self
 * drive car rental" -- they are searching for "Swift rent Nagercoil", and the
 * fleet listing answers that with one card in a grid of six. A page each lets
 * the answer be the one they actually want: what the car is like on these
 * roads, who it suits, what it will not do, and what it costs.
 *
 * The risk in doing this is the doorway page -- six pages that are one page
 * with the name swapped, which Google treats as a reason to trust the whole
 * site less. So every page here is written from its own entry in models.json,
 * including the part that says what the car is bad at, and a model with
 * nothing particular to say should not have a page.
 *
 * Editorial here, inventory from the panel: the description is committed, the
 * rate is whatever the fleet is carrying today. A model nobody has set up in
 * the panel still gets its page, with "On request" where the figure goes --
 * which is honest, and better than a page that disappears when a rate card
 * expires.
 */

const { models } = modelData;

/** The fleet entry this page is about, if the panel is carrying one. */
function inFleet(cars: Car[], match: string): Car | undefined {
  const want = match.toLowerCase();
  return cars.find((c) => `${c.brand} ${c.name}`.toLowerCase().includes(want));
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-line py-3">
      <dt className="text-xs font-semibold tracking-wide text-ink-faint uppercase">{label}</dt>
      <dd className="mt-0.5 font-semibold text-navy">{value}</dd>
    </div>
  );
}

export function CarModel() {
  const { slug } = useParams<{ slug: string }>();
  const model = models.find((m) => m.slug === slug);

  const fleet = useFleet();
  const cars = fleet.status === 'ready' ? fleet.cars : [];

  // A slug nobody has written a car for is genuinely not a page.
  if (!model) return <NotFound />;

  const car = inFleet(cars, model.match);
  const others = models.filter((m) => m.slug !== model.slug);
  const enquire = `/contact?car=${encodeURIComponent(model.name)}`;

  return (
    <>
      <PageHeader
        photo="cars-hero"
        scene="/cars"
        title={`${model.name} on self drive rental`}
        imageAlt={`${model.name} for self drive rental in ${seo.site.city}, ${seo.site.district} district`}
        intro={model.intro}
      />

      <div className="mx-auto max-w-[86rem] px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <Reveal>
              <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Who the {model.short} suits
              </h2>
              <p className="mt-4 leading-relaxed text-ink-dim">{model.suits}</p>
            </Reveal>

            <Reveal delay={90}>
              <h2 className="mt-12 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                What it is like to drive here
              </h2>
              <p className="mt-4 leading-relaxed text-ink-dim">{model.drive}</p>

              <ul className="mt-6 space-y-2.5">
                {model.good.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-ink-dim">
                    <span aria-hidden="true" className="bullet-dot" />
                    {point}
                  </li>
                ))}
              </ul>

              {/* The part most rental sites leave out. A page that only says
                  what a car is good at is an advertisement; somebody choosing
                  between two of ours needs to know which one is wrong for
                  them, and they will trust the rest of the page more for
                  being told. */}
              <div className="mt-6 rounded-[14px] border border-line bg-cream p-5">
                <h3 className="text-sm font-bold tracking-wide text-navy uppercase">
                  Worth knowing
                </h3>
                <p className="mt-2 leading-relaxed text-ink-dim">{model.watch}</p>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <h2 className="mt-12 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Questions about the {model.short}
              </h2>
              <dl className="mt-5 divide-y divide-line border-y border-line">
                {model.faq.map((item) => (
                  <div key={item.question} className="py-4">
                    <dt className="font-semibold text-navy">{item.question}</dt>
                    <dd className="mt-2 leading-relaxed text-ink-dim">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <div>
            <Reveal delay={60}>
              <div className="rounded-[14px] border border-line bg-white p-6 shadow-[0_10px_30px_rgba(16,24,40,0.08)] sm:p-7">
                <h2 className="text-lg font-bold text-navy">The {model.short}, in figures</h2>

                <dl className="mt-4">
                  <Spec label="Seats" value={`${model.seats}`} />
                  <Spec label="Fuel" value={model.fuel} />
                  <Spec label="Gearbox" value={model.transmission} />
                  <Spec label="Type" value={model.bodyType} />
                  <Spec label="Luggage" value={model.luggage} />
                  {/* From the panel, and only when the panel has it. A rate
                      nobody at the business typed is not a rate we publish. */}
                  <Spec label="Per day" value={car ? dailyRate(car) : 'On request'} />
                  <Spec
                    label="KM included each day"
                    value={car && car.kmLimitPerDay > 0 ? `${car.kmLimitPerDay} km` : 'Agreed when you book'}
                  />
                  <Spec label="Extra KM" value={car ? orDash(car.extraKmRate) : '—'} />
                  <Spec label="Refundable deposit" value={car ? orDash(car.deposit) : 'Told to you before you book'} />
                </dl>

                <Link
                  to={enquire}
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 font-semibold text-navy transition hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                >
                  Check {model.short} availability
                  <span aria-hidden="true" className="transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <p className="mt-3 text-center text-sm text-ink-dim">
                  or call{' '}
                  <a
                    href={`tel:${seo.site.phone}`}
                    className="font-semibold text-navy hover:text-gold-deep"
                  >
                    {readablePhone(seo.site.phone)}
                  </a>
                </p>

                <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-ink-dim">
                  Every rate on this page is the whole rate. See the{' '}
                  <Link to="/tariff" className="font-semibold text-navy hover:text-gold-deep">
                    full tariff
                  </Link>{' '}
                  for how the daily figure falls on a weekly or monthly rental.
                </p>
              </div>
            </Reveal>

            <Reveal delay={110}>
              <div className="mt-6 rounded-[14px] border border-line bg-cream p-6 sm:p-7">
                <h2 className="text-lg font-bold text-navy">Often taken for</h2>
                <ul className="mt-4 space-y-3">
                  {model.goesWellWith.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="tap-target group flex items-baseline gap-2 font-semibold text-navy transition hover:text-gold-deep"
                      >
                        {link.label}
                        <span
                          aria-hidden="true"
                          className="text-gold transition group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Every car page links to the other five, so a crawler reaches all of
            them from any one -- and so does somebody who has just worked out
            that the car they landed on is the wrong one. */}
        <Reveal delay={80}>
          <h2 className="mt-16 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            The rest of the fleet
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  to={`/cars/${other.slug}`}
                  className="card-lift group flex h-full flex-col rounded-[14px] border border-line bg-white p-5 transition hover:border-gold/60"
                >
                  <span className="font-bold text-navy">{other.name}</span>
                  <span className="mt-1 text-sm text-ink-dim">
                    {other.seats} seats &middot; {other.fuel} &middot; {other.transmission}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep">
                    See the {other.short}
                    <span aria-hidden="true" className="transition group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-ink-dim">
            Not sure which?{' '}
            <Link to="/cars" className="font-semibold text-navy hover:text-gold-deep">
              See the whole fleet
            </Link>{' '}
            or{' '}
            <Link to="/contact" className="font-semibold text-navy hover:text-gold-deep">
              tell us your dates
            </Link>{' '}
            and we will say what is free.
          </p>
        </Reveal>
      </div>
    </>
  );
}
