import { useAbout } from '../content';
import { Reveal } from './Reveal';

/**
 * The four things worth knowing about hiring here, on the about page.
 *
 * Cards shaped like folders, stepped down and up across the row, in the four
 * colours the site already uses -- navy, cream, gold, bronze. A row of four
 * identical white boxes is what every other rental site in the district has;
 * this is the page where the business is allowed to look like itself.
 *
 * The words are the panel's, including the numbers. "1000+ customers" and
 * "20+ vehicles" are claims that change, and a claim written into a component
 * is a claim nobody can correct without a deploy.
 */

/** One per card, by position. Drawn rather than an icon font: four glyphs are
 *  four kilobytes of markup here, and a font is a request and a fallback. */
/* pathLength="1" on every shape, so one dash rule draws all of them: without
   it a dash pattern measured in user units draws a long path at a crawl and a
   short one before anybody sees it. */
const ICONS = [
  // A shield with a tick in it.
  <>
    <path pathLength="1" d="M12 3l7 3v5.5c0 4.3-2.9 8.2-7 9.5-4.1-1.3-7-5.2-7-9.5V6l7-3z" />
    <path pathLength="1" d="M8.8 12.2l2.2 2.2 4.2-4.4" />
  </>,
  // A drop with a shine, for a car that has just been washed.
  <>
    <path pathLength="1" d="M12 3.5c3.2 3.6 5.2 6.3 5.2 9a5.2 5.2 0 1 1-10.4 0c0-2.7 2-5.4 5.2-9z" />
    <path pathLength="1" d="M9.6 13.8a2.6 2.6 0 0 0 2.2 2.4" />
  </>,
  // Two people.
  <>
    <circle pathLength="1" cx="9" cy="8.5" r="3.1" />
    <path pathLength="1" d="M3.6 19.4a5.6 5.6 0 0 1 10.8 0" />
    <path pathLength="1" d="M16 6.2a3 3 0 0 1 0 5.8" />
    <path pathLength="1" d="M17.2 14.6a5.6 5.6 0 0 1 3.4 4.8" />
  </>,
  // A car from the side.
  <>
    <path pathLength="1" d="M4 14.5h16" />
    <path pathLength="1" d="M5.5 14.5l1.6-4.3A2 2 0 0 1 9 8.9h6a2 2 0 0 1 1.9 1.3l1.6 4.3" />
    <path pathLength="1" d="M4 14.5v3.1h2.2" />
    <path pathLength="1" d="M20 14.5v3.1h-2.2" />
    <circle pathLength="1" cx="7.6" cy="17.6" r="1.4" />
    <circle pathLength="1" cx="16.4" cy="17.6" r="1.4" />
  </>,
];

export function Benefits() {
  const { benefits } = useAbout();
  const items = benefits?.items ?? [];

  if (items.length === 0) return null;

  return (
    <section className="benefits bg-white py-20">
      <div className="mx-auto max-w-[86rem] px-5 sm:px-8 lg:px-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            {benefits.heading}{' '}
            <span className="text-gold-deep">{benefits.headingAccent}</span>
          </h2>
        </Reveal>

        <div className="benefit-row mt-12 sm:mt-14 lg:mt-24">
          {items.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 110}
              className={`benefit-card benefit-${(i % 4) + 1}`}
            >
              <span aria-hidden="true" className="benefit-tab" />

              {/* The mark on a disc of its own, in the colour the card is
                  not. It draws itself as the card arrives and then keeps a
                  slow float, each one offset from the next so the row breathes
                  rather than pulses in time. */}
              <span aria-hidden="true" className="benefit-badge">
                <svg
                  className="benefit-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {ICONS[i % ICONS.length]}
                </svg>
              </span>

              <h3 className="benefit-title">{item.title}</h3>
              <p className="benefit-body">{item.body}</p>
            </Reveal>
          ))}

          {/* The stamp between the middle two, turning slowly. It says what
              the logo used to say under the name, which is where this line
              came from. */}
          {benefits.badge ? (
            <div aria-hidden="true" className="benefit-stamp">
              <svg viewBox="0 0 120 120" className="benefit-stamp-svg">
                <defs>
                  <path
                    id="benefit-stamp-path"
                    d="M60 60m-42 0a42 42 0 1 1 84 0a42 42 0 1 1 -84 0"
                  />
                </defs>
                <text className="benefit-stamp-text">
                  <textPath href="#benefit-stamp-path">{benefits.badge}</textPath>
                </text>
              </svg>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
