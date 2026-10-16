import { Link } from 'react-router-dom';
import { RAIL_REPEAT, useRailCrawl } from '../lib/useRailCrawl';
import { useHome } from '../content';
import { Reveal } from './Reveal';
import { SectionArt } from './art/SectionArt';
import { hasScene } from './art/scenes';

/**
 * What we hire, as a rail that moves on its own.
 *
 * Six cards in a three-wide grid is two rows, and the second row is under the
 * fold on a laptop and a long way down on a phone -- so half of what the
 * business does was seen only by somebody who kept scrolling. In a rail they
 * all go past on their own, and a card leaving the frame is what says there
 * is more of it.
 *
 * The first few cards are rendered again after the list and the crawl wraps
 * where that repeat begins, so the loop is seamless. How that works, and everything else the rail does about
 * hover, focus, touch and reduced motion, is in lib/useRailCrawl -- shared
 * with the places rail on the home page rather than written twice.
 *
 * `showHeading` is off where a page banner has just said the same words: a
 * heading repeating the title directly above it reads as a rendering fault
 * rather than as a section.
 */

export function Services({ showHeading = true }: { showHeading?: boolean }) {
  const home = useHome();
  const { eyebrow, heading, items } = home.services;

  // On the home page these cards sit under a section heading, so they are the
  // level below it. Without one -- the page title is the h1 and these are its
  // sections -- leaving them at h3 skips a level, which is what a screen
  // reader's outline is built from.
  const CardHeading = showHeading ? 'h3' : 'h2';

  const { rail, page, ready } = useRailCrawl(items.length);

  const card = (s: (typeof items)[number], copy: boolean, first = false) => (
    <div
      key={`${copy ? 'again-' : ''}${s.to}`}
      className="rail-item"
      {...(first ? { 'data-rail-repeat': '' } : {})}
    >
      <Link
        data-rail-card=""
        to={s.to}
        // The second set is scenery: the same six links again would be six
        // more stops for a keyboard and six more announcements for a screen
        // reader, saying nothing new either time.
        {...(copy ? { tabIndex: -1, 'aria-hidden': true } : {})}
        className="card-lift group flex h-full flex-col overflow-hidden rounded-[16px] border border-line bg-white shadow-[0_10px_30px_rgba(16,24,40,0.08)]"
      >
        {/* Falls back to a plain navy panel rather than breaking if a service
            is added to the content file before it has a scene.

            Described when it is a photograph, decorative when it is the
            drawing. SectionArt makes that call; what it needs from here is
            the sentence. An uploaded picture of a wedding car with alt="" is
            a picture Google cannot read, on a site whose traffic comes from
            searching for exactly that. */}
        {hasScene(s.to) ? (
          <SectionArt name={s.to} alt={copy ? '' : s.title} />
        ) : (
          <div className="art-frame" />
        )}

        <div className="flex flex-1 flex-col p-5">
          <CardHeading className="text-lg font-semibold text-navy">{s.title}</CardHeading>
          <p className="mt-2 text-sm leading-relaxed text-ink-dim">{s.body}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-deep">
            See details
            <span aria-hidden="true" className="transition group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </Link>
    </div>
  );

  // pb-16 rather than pb-20: the rail below carries pb-4 so the cards' shadows
  // are not clipped by its own overflow-x, and that 16px reads as section
  // spacing. 64 + 16 lands on the same 80 as every other section, so the gap
  // to the next one matches the rest of the page.
  return (
    <section className="pt-20 pb-16">
      <div className="mx-auto max-w-[86rem] px-5 sm:px-8 lg:px-12">
        <div className="flex items-end justify-between gap-6">
          {showHeading ? (
            <Reveal>
              <p className="section-eyebrow">{eyebrow}</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                {heading}
              </h2>
            </Reveal>
          ) : (
            <span />
          )}

          {/* Hidden from a phone, where the gesture is the affordance. */}
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => page(-1)}
              aria-label="Previous services"
              className="rail-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => page(1)}
              aria-label="More services"
              className="rail-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Inside the page's own column, not running to the window edge, with
            the cards fading out at both ends rather than being cut off. */}
        <div className="rail-mask mt-10">
          <div
            ref={rail}
            tabIndex={0}
            role="region"
            aria-label={heading}
            className="rail flex gap-5 overflow-x-auto pb-4"
          >
            {items.map((s) => card(s, false))}
            {/* Only once the rail is nearly on screen: see useRailCrawl. */}
            {ready ? items.slice(0, RAIL_REPEAT).map((s, i) => card(s, true, i === 0)) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
