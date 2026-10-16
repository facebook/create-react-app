import { Link, useParams } from 'react-router-dom';
import seo from '../data/seo.json';
import townData from '../data/towns.json';
import serviceAreaData from '../data/service-areas.json';
import modelData from '../data/models.json';
import { readablePhone } from '../lib/phone';
import { Reveal } from '../components/Reveal';
import { PageHeader } from './PageHeader';
import { NotFound } from './NotFound';

/**
 * One page per town we deliver to.
 *
 * Someone in Marthandam searching for a car does not search for "Kanyakumari
 * district" -- they search for Marthandam. A single page naming twelve towns
 * competes for none of them properly, because it has nothing specific to say
 * about any one.
 *
 * The risk in doing this is the opposite failure: twelve pages that are one
 * page with the name swapped. Google calls those doorway pages and treats them
 * as a reason to trust the whole site less, which would be worse than not
 * having them. So every page here is written from its own data -- what the
 * town is, what the roads around it are like, what people actually hire there
 * and where they drive -- and none of it is generated from a template with a
 * placeholder in it. If a town has nothing particular to say, it should not
 * have a page.
 */

const { towns } = townData;

export function Town() {
  const { slug } = useParams<{ slug: string }>();
  const town = towns.find((t) => t.slug === slug);

  // A slug nobody has written a town for is genuinely not a page, and saying
  // so is better than rendering an empty frame with a name in it.
  if (!town) return <NotFound />;

  const others = towns.filter((t) => t.slug !== town.slug);
  const enquire = `/contact?town=${encodeURIComponent(town.name)}`;

  // Where a service has a page written for this particular town, the list
  // below points at that rather than at the general one -- which is the more
  // useful link for the reader and the one that gets those pages crawled.
  const areas = serviceAreaData.pages.filter((page) => page.slug === town.slug);
  const areaFor = (base: string) => areas.find((page) => page.base === base);

  return (
    <>
      <PageHeader
        photo="cars-hero"
        scene="/cars"
        title={`Self drive car & bike rental in ${town.name}`}
        imageAlt={`Self drive cars and bikes for rent in ${town.name}, ${seo.site.district} district`}
        intro={town.intro}
      />

      <div className="mx-auto max-w-[86rem] px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <Reveal>
              <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Getting a vehicle in {town.name}
              </h2>
              <p className="mt-4 leading-relaxed text-ink-dim">
                {town.distanceKm === 0 ? (
                  <>
                    {town.name} is where the vehicles are kept, so there is no
                    delivery to wait for. Tell us when you want it and it is
                    ready when you arrive — or we bring it to you anywhere in
                    town.
                  </>
                ) : (
                  <>
                    {town.name} is about {town.distanceKm} km from our base in{' '}
                    {townData.base}, and we deliver rather than asking you to
                    come and collect. Give us the address and a time; the
                    vehicle arrives with its papers, a full tank noted down and
                    the KM reading written in front of you.
                  </>
                )}
              </p>
              <p className="mt-4 leading-relaxed text-ink-dim">{town.local}</p>
            </Reveal>

            <Reveal delay={90}>
              <h2 className="mt-12 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Around {town.name}
              </h2>
              <p className="mt-3 text-ink-dim">
                Known for {town.knownFor}.
              </p>
              <ul className="mt-5 space-y-2.5">
                {town.landmarks.map((landmark) => (
                  <li key={landmark} className="flex items-start gap-2.5 text-ink-dim">
                    <span aria-hidden="true" className="bullet-dot" />
                    {landmark}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={140}>
              <h2 className="mt-12 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Drives from {town.name}
              </h2>
              {/* Distances are the thing people actually want before they
                  decide whether a day's rental is worth it, and they are
                  approximate road distances rather than straight lines. */}
              <ul className="mt-5 divide-y divide-line border-y border-line">
                {town.trips.map((trip) => (
                  <li key={trip.to} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
                    <span className="font-semibold text-navy">{trip.to}</span>
                    <span className="text-sm font-semibold text-gold-deep">
                      about {trip.km} km
                    </span>
                    <span className="w-full text-sm text-ink-dim sm:w-auto sm:flex-1">
                      {trip.note}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div>
            <Reveal delay={60}>
              <div className="rounded-[14px] border border-line bg-cream p-6 sm:p-7">
                <h2 className="text-lg font-bold text-navy">
                  Rental cars in {town.name}
                </h2>
                <ul className="mt-4 space-y-3">
                  {[
                    { to: '/cars', label: 'Self drive cars', note: 'Hatchbacks, sedans and SUVs' },
                    { to: '/bikes', label: 'Bikes and scooters', note: 'By the hour, day or week' },
                    { to: '/wedding-cars', label: 'Wedding cars', note: 'Decorated, for the season' },
                    { to: '/tourist-vehicles', label: 'Tourist vehicles', note: 'With a driver, for groups' },
                    { to: '/monthly', label: 'Monthly rental', note: 'Cheaper the longer you keep it' },
                  ].map((base) => {
                    const local = areaFor(base.to);
                    return local
                      ? { ...base, to: `${local.base}/${local.slug}`, note: `Written for ${town.name}` }
                      : base;
                  }).map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="tap-target group flex items-baseline gap-2 font-semibold text-navy transition hover:text-gold-deep"
                      >
                        {item.label}
                        <span
                          aria-hidden="true"
                          className="text-gold transition group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </Link>
                      <p className="text-sm text-ink-dim">{item.note}</p>
                    </li>
                  ))}
                </ul>

                <Link
                  to={enquire}
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 font-semibold text-navy transition hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                >
                  Check availability in {town.name}
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
              </div>
            </Reveal>
          </div>
        </div>

        {/* The vehicles by name, from every town page -- as a line of links
            rather than six cards.

            The cards were the same six names, the same six specifications and
            the same six calls to action on all twelve town pages, which is
            about eighty words of identical text added to pages whose whole
            justification is that they are not each other. Measured, it pushed
            the average overlap between two town pages from the high twenties
            to nearly thirty-six per cent at worst. A crawler reaches the car
            pages from here either way; only one of the two versions costs the
            town pages their distinctness. */}
        <Reveal delay={60}>
          <h2 className="mt-16 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            What we would bring
          </h2>
          <p className="mt-3 text-ink-dim">
            {modelData.models.map((model, i) => (
              <span key={model.slug}>
                {i > 0 ? (i === modelData.models.length - 1 ? ' and ' : ', ') : ''}
                <Link
                  to={`/cars/${model.slug}`}
                  className="font-semibold text-navy hover:text-gold-deep"
                >
                  {model.name}
                </Link>
              </span>
            ))}
            . Rates for all of them are on the{' '}
            <Link to="/tariff" className="font-semibold text-navy hover:text-gold-deep">
              tariff page
            </Link>
            , and they come down on a longer rental.
          </p>
        </Reveal>

        {/* The other towns, from every town page. Twelve pages that each link
            to the other eleven is how a crawler finds all of them from any one
            -- and it is genuinely useful to a reader whose town is not the one
            they landed on. */}
        <Reveal delay={80}>
          <h2 className="mt-16 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            We also deliver to
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  to={`/car-rental/${other.slug}`}
                  className="tap-target inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-sm font-semibold text-ink-dim transition hover:border-gold hover:text-navy"
                >
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
                  {other.name}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </>
  );
}
