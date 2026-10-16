import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHome, useSiteImage } from '../content';
import { Reveal } from './Reveal';
import { CircleBadge } from './CircleBadge';

/**
 * Two columns: stacked photographs on one side, an accordion on the other.
 *
 * The accordion is buttons with aria-expanded rather than details/summary,
 * because only one panel should be open at a time and native details has no
 * notion of a group.
 */
export function WhyUs() {
  const home = useHome();

  // Both uploadable. These were two hardcoded paths, so the only way to show
  // the real fleet here was a deploy.
  const photoOne = useSiteImage('why-us-1') ?? '/self-drive-car-rental-nitesha-cars-and-bikes.webp';
  const photoTwo = useSiteImage('why-us-2') ?? '/maruti-brezza-self-drive-car-rental-nagercoil.avif';
  const { badge, heading, intro, items } = home.whyUs;
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-cream py-20">
      <div className="mx-auto grid max-w-[86rem] gap-12 px-5 sm:px-8 lg:px-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        {/* Photographs */}
        <Reveal>
          <div className="relative pb-16 sm:pb-20 lg:pb-24">
            <img
              src={photoOne}
              alt="Self-drive rental car on the road in Kanyakumari district"
              loading="lazy"
              className="aspect-4/3 w-[78%] rounded-[14px] object-cover shadow-[0_10px_30px_rgba(16,24,40,0.12)]"
            />
            <img
              src={photoTwo}
              alt="Maruti Brezza available for self-drive rental in Nagercoil"
              loading="lazy"
              className="absolute right-0 bottom-0 aspect-4/3 w-[62%] rounded-[14px] border-4 border-cream object-cover shadow-[0_10px_30px_rgba(16,24,40,0.16)]"
            />
            <div className="absolute bottom-4 left-[6%] sm:bottom-6">
              <CircleBadge />
            </div>
          </div>
        </Reveal>

        {/* Copy and accordion */}
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold tracking-wide text-navy uppercase shadow-[0_10px_30px_rgba(16,24,40,0.06)]">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
              {badge}
            </p>

            <h2 className="mt-6 text-3xl leading-tight font-bold tracking-tight text-navy sm:text-4xl">
              {heading}
            </h2>

            <p className="mt-5 leading-relaxed text-ink-dim">
              {intro}
            </p>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-8 divide-y divide-line border-y border-line">
              {items.map((item, i) => {
                const isOpen = i === open;
                return (
                  <div key={item.title}>
                    <h3>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? -1 : i)}
                        aria-expanded={isOpen}
                        aria-controls={`why-panel-${i}`}
                        // group, so the row answers as one thing. Without
                        // it this was a full-width button that did nothing
                        // at all under the pointer -- the only sign it could
                        // be opened was the chevron, which looks like
                        // decoration until something moves.
                        className="group flex w-full items-center justify-between gap-4 py-5 text-left"
                      >
                        <span className="text-lg font-semibold text-navy transition group-hover:text-gold-deep">
                          {i + 1}. {item.title}
                        </span>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                          fill="none"
                          className={`shrink-0 text-gold transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        >
                          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </h3>
                    <div
                      id={`why-panel-${i}`}
                      hidden={!isOpen}
                      className="pb-5 leading-relaxed text-ink-dim"
                    >
                      {item.body}
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <Link
              to="/about"
              className="tap-target group mt-8 inline-flex items-center gap-1.5 font-semibold text-navy transition hover:text-gold-deep"
            >
              More about us
              <span aria-hidden="true" className="transition group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
