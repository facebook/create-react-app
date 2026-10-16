import { Link } from 'react-router-dom';
import { usePlaces } from '../lib/usePlaces';
import { RAIL_REPEAT, useRailCrawl } from '../lib/useRailCrawl';
import { PlaceCard } from './PlaceCard';
import { Reveal } from './Reveal';

/**
 * Where people go, as a rail that moves on its own.
 *
 * It was three cards in a three-wide grid, which meant the home page named
 * three of the district's places and stopped. The rest were behind a link,
 * and a link is a decision somebody has to make before they have seen
 * anything worth deciding about.
 *
 * All of them go past instead, four at a time, and a card leaving the frame
 * is what says there are more. Four rather than three because these cards are
 * a picture, a line of category and a sentence -- narrower than the service
 * cards and perfectly readable at a quarter of the column, where three left
 * each one wider than it had anything to fill with.
 *
 * The crawl, and everything it does about hover, focus, touch and reduced
 * motion, is lib/useRailCrawl, shared with the services rail. The first few
 * places are rendered again after the list so the loop has somewhere to wrap;
 * that repeat is scenery -- out of the tab order, out of the accessibility
 * tree, and with its pictures unnamed, so a screen reader is read one set of
 * places rather than the same set twice.
 *
 * Renders nothing at all when the list is empty, rather than an empty
 * heading. A section that says "places to visit" above white space is worse
 * than no section.
 */
export function PlacesTeaser() {
  const places = usePlaces();
  const { rail, page, ready } = useRailCrawl(places.length);

  if (places.length === 0) return null;

  return (
    <section className="bg-cream/60">
      <div className="mx-auto max-w-[86rem] px-5 sm:px-8 lg:px-12 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Where people go
            </h2>
            <p className="mt-2 max-w-lg text-ink-dim">
              The coast, the temples and the waterfalls are all an easy drive from
              Nagercoil. Take the car and go at your own pace.
            </p>
          </Reveal>

          <div className="flex items-center gap-3">
            {/* Hidden from a phone, where the gesture is the affordance. */}
            <div className="hidden shrink-0 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => page(-1)}
                aria-label="Previous places"
                className="rail-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => page(1)}
                aria-label="More places"
                className="rail-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <Link
              to="/places"
              className="rounded-xl border border-line bg-white px-5 py-2.5 font-semibold text-navy transition hover:border-navy/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              View all {places.length} places
            </Link>
          </div>
        </div>

        {/* Inside the page's own column, with the cards fading out at both
            ends rather than being cut off. */}
        <div className="rail-mask mt-10">
          <div
            ref={rail}
            tabIndex={0}
            role="region"
            aria-label="Places to visit in Kanyakumari district"
            className="rail rail-4 flex gap-5 overflow-x-auto pb-4"
          >
            {places.map((place) => (
              <div key={place.id} className="rail-item" data-rail-card="">
                <PlaceCard place={place} />
              </div>
            ))}
            {/* Only once the rail is nearly on screen: see useRailCrawl. */}
            {ready
              ? places.slice(0, RAIL_REPEAT).map((place, i) => (
                  <div
                    key={`again-${place.id}`}
                    className="rail-item"
                    aria-hidden="true"
                    {...(i === 0 ? { 'data-rail-repeat': '' } : {})}
                  >
                    <PlaceCard place={place} decorative />
                  </div>
                ))
              : null}
          </div>
        </div>
      </div>
    </section>
  );
}
