import { Link } from 'react-router-dom';
import seo from '../data/seo.json';
import townData from '../data/towns.json';
import serviceAreaData from '../data/service-areas.json';
import { Reveal } from '../components/Reveal';
import { PageHeader } from './PageHeader';

/**
 * The hub the town pages hang off.
 *
 * It exists for two reasons and both matter. A crawler arriving on any one
 * town page can reach the other eleven from here in one hop, and a reader who
 * has landed on the wrong town can find theirs without going back to a search
 * engine. A set of pages with no page above them is a set of orphans.
 */

const { towns } = townData;

export function CarRentalAreas() {
  return (
    <>
      <PageHeader
        photo="coast"
        scene="coast"
        title={`Self drive car rental across ${seo.site.district} district`}
        imageAlt={`The towns of ${seo.site.district} district where we deliver vehicles`}
        intro={`We bring the vehicle to you rather than asking you to come and fetch it. Twelve towns with a page of their own below, and everywhere in between them on request — tell us the address and we will say yes or tell you what it costs.`}
      />

      <div className="mx-auto max-w-[86rem] px-5 py-16 sm:px-8 lg:px-12">
        {/* Said once, above the grid, rather than on each of twelve cards.
            "About 30 km from Nagercoil" twelve times made the name of the base
            town nearly eight per cent of every word on this page, which reads
            as a page written for a search engine rather than for a reader. */}
        <p className="mb-8 text-ink-dim">
          Distances are approximate road distances from {townData.base}, where
          the vehicles are kept.
        </p>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {towns.map((town, i) => (
            <Reveal key={town.slug} as="li" delay={i * 50} className="h-full">
              <Link
                to={`/car-rental/${town.slug}`}
                className="card-lift group flex h-full flex-col rounded-[14px] border border-line bg-white p-6 shadow-[0_10px_30px_rgba(16,24,40,0.06)]"
              >
                <h2 className="text-lg font-bold text-navy">{town.name}</h2>
                <p className="mt-1 text-sm font-semibold text-gold-deep">
                  {town.distanceKm === 0
                    ? 'Where the vehicles are kept'
                    : `About ${town.distanceKm} km away`}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-dim">
                  Known for {town.knownFor}.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
                  Rental cars in {town.name}
                  <span
                    aria-hidden="true"
                    className="text-gold transition group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>

        {/* Where a service has a page of its own for a town, this is the
            shortest route to it -- and the only place on the site that lists
            them together. */}
        <Reveal delay={100}>
          <h2 className="mt-16 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Written up town by town
          </h2>
          <p className="mt-3 text-ink-dim">
            Some of what we rent works differently depending on where you are.
            Where it does, it has a page of its own.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {serviceAreaData.pages.map((page) => (
              <li key={`${page.base}/${page.slug}`}>
                <Link
                  to={`${page.base}/${page.slug}`}
                  className="card-lift group flex h-full flex-col rounded-[14px] border border-line bg-white p-5 transition hover:border-gold/60"
                >
                  <span className="font-bold text-navy">{page.service}</span>
                  <span className="mt-1 text-sm text-ink-dim">in {page.town}</span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep">
                    Read it
                    <span aria-hidden="true" className="transition group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-12 text-ink-dim">
            Somewhere not on this list?{' '}
            <Link to="/contact" className="font-semibold text-navy hover:text-gold-deep">
              Ask us
            </Link>{' '}
            — most of {seo.site.district} district is a short enough run that the
            answer is yes.
          </p>
        </Reveal>
      </div>
    </>
  );
}
