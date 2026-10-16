import { Link } from 'react-router-dom';
import pickupData from '../data/pickups.json';
import { useHome, useSiteImage } from '../content';
import { Reveal } from './Reveal';
import { DistrictMap, DISTRICT_ROUTE_D } from './art/DistrictMap';

/**
 * Where a vehicle can be handed over, named on the page and marked on a map.
 *
 * Local search leans on what a page actually says, not only on its meta tags
 * and structured data. Someone searching "self drive car Nagercoil railway
 * station" is best served by a page that says exactly that.
 *
 * Grouped by town rather than listed flat, because four of these are in
 * Nagercoil and two are in Kanyakumari: a flat row of ten reads as ten places
 * and overstates how far apart they are. Under a heading each, the three
 * Nagercoil spots read as what they are -- three doors into the same town.
 *
 * Drawn as stops on a route that draws itself downward as the section is
 * scrolled to, beside a sketch of the cape with the towns pinned on it from
 * their real coordinates. A list of places is a list; a line through them is
 * what a delivery actually is. The motion lives in index.css under "the
 * route" and "the delivery band", including the part that turns all of it off
 * for anybody who has asked their system for less of it.
 *
 * The band is dark so the photograph behind it can be a photograph rather than
 * a washed-out backdrop. It has to read with no photograph at all, which is
 * the state a panel slot is in until somebody fills it, so the dark is a
 * gradient of the brand's own colours and the picture is an improvement on it
 * rather than a requirement of it.
 *
 * The twelve towns of towns.json used to be listed underneath this, to keep a
 * link from the home page to each of their pages. They are one step further
 * away now: "See every town we deliver to" goes to /car-rental, which lists
 * all twelve and links them. Still reachable, still crawlable, one hop out.
 */

/* One glyph per kind of place, drawn rather than fetched -- three small shapes
   are a few hundred bytes of markup here, and an icon font is a request and a
   fallback. pathLength="1" for the same reason the rest of the site uses it:
   one dash rule can then draw any of them. */
const GLYPHS: Record<string, React.ReactNode> = {
  // A pin.
  town: (
    <>
      <path pathLength="1" d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10z" />
      <circle pathLength="1" cx="12" cy="11" r="2.1" />
    </>
  ),
  // A train, head on.
  rail: (
    <>
      <rect pathLength="1" x="6" y="3.5" width="12" height="13" rx="3" />
      <path pathLength="1" d="M6.8 10.5h10.4" />
      <path pathLength="1" d="M9.5 13.8h.01M14.5 13.8h.01" />
      <path pathLength="1" d="M8.5 16.5L6.5 20.5M15.5 16.5l2 4" />
    </>
  ),
  // A bus, from the side.
  bus: (
    <>
      <rect pathLength="1" x="3.5" y="5" width="17" height="10.5" rx="2.5" />
      <path pathLength="1" d="M3.5 10h17" />
      <path pathLength="1" d="M7.5 15.5v2M16.5 15.5v2" />
      <path pathLength="1" d="M7 12.8h.01M17 12.8h.01" />
    </>
  ),
};

function PlaceIcon({ kind }: { kind: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="route-ico"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLYPHS[kind] ?? GLYPHS.town}
    </svg>
  );
}

/**
 * The heading, with the district's name picked out in gold.
 *
 * Split here rather than stored as two fields, because the heading is edited
 * in the panel and a second field is a second thing to keep in step. No match
 * means no highlight and the line reads plainly, which is the right answer for
 * a heading somebody has rewritten into something else entirely.
 */
function splitHeading(heading: string, mark: string): readonly [string, string] {
  const at = heading.toLowerCase().lastIndexOf(mark.toLowerCase());
  if (at < 0) return [heading, ''] as const;
  return [heading.slice(0, at).trimEnd(), heading.slice(at)] as const;
}

export function AreasServed() {
  const home = useHome();
  const { heading, intro, footnoteLead, footnoteLinkLabel, footnoteTail } =
    home.areasServed;
  const photo = useSiteImage('coast');

  const [plain, marked] = splitHeading(heading, 'Kanyakumari');

  return (
    <section className="deliver-band">
      {photo ? (
        <img src={photo} alt="" aria-hidden="true" className="deliver-photo" loading="lazy" />
      ) : null}
      <span aria-hidden="true" className="deliver-veil" />

      <div className="deliver-inner mx-auto grid max-w-[86rem] gap-10 px-5 sm:px-8 lg:px-12 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:gap-14">
        <div>
          <Reveal>
            <p className="deliver-eyebrow">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22s7-6.2 7-11.7A7 7 0 1 0 5 10.3C5 15.8 12 22 12 22zm0-13.6a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2z" />
              </svg>
              We deliver where you need
            </p>
            <h2 className="deliver-heading">
              {plain}
              {marked ? <span className="deliver-heading-mark">{marked}</span> : null}
            </h2>
            <p className="deliver-intro">{intro}</p>
          </Reveal>

          <div className="mt-8">
            {pickupData.groups.map((group, g) => (
              <Reveal key={group.town} delay={g * 150} className="route-stop">
                <span aria-hidden="true" className="route-dot" />

                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="route-town">{group.town}</h3>
                  {group.note ? <span className="route-note">{group.note}</span> : null}
                </div>

                <ul className="route-chips">
                  {group.points.map((point, i) => {
                    // The point's own town page, the group's, or the list of
                    // every town. Never a dead chip: a place worth naming is
                    // worth somewhere to read about.
                    const slug =
                      ('slug' in point ? (point.slug as string) : undefined) ??
                      ('slug' in group ? (group.slug as string) : undefined);

                    return (
                      <li
                        key={point.name}
                        style={{ '--chip-delay': `${i * 80}ms` } as React.CSSProperties}
                      >
                        <Link
                          to={slug ? `/car-rental/${slug}` : '/car-rental'}
                          className="route-chip tap-target"
                        >
                          <PlaceIcon kind={point.kind} />
                          {point.name}
                          {'tag' in point && point.tag ? (
                            <span className="route-tag">{point.tag as string}</span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {'line' in group && group.line ? (
                  <p className="route-line">{group.line as string}</p>
                ) : null}
              </Reveal>
            ))}
          </div>

          <Reveal delay={240}>
            <p className="deliver-foot">
              {footnoteLead} <Link to="/contact">{footnoteLinkLabel}</Link> {footnoteTail}{' '}
              <Link to="/car-rental">See every town we deliver to</Link>.
            </p>
          </Reveal>
        </div>

        <Reveal delay={80} className="deliver-map-wrap">
          {/* Decorative, and it says the heading again in fewer words, so it
              stays out of the accessibility tree rather than being read twice
              to somebody who cannot see it. */}
          <p className="deliver-script" aria-hidden="true">
            <span className="deliver-script-1">Explore Kanyakumari</span>
            <span className="deliver-script-2">
              with <strong>NiteSha</strong>
            </span>
            <svg className="deliver-swoosh" viewBox="0 0 170 16" fill="none">
              <path
                pathLength="1"
                d="M3 11C34 15 92 13 167 4"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </p>

          <DistrictMap
            className="deliver-map"
            // The car's path, handed to the stylesheet rather than written out
            // there as well: one definition of the route, in the file that
            // works it out from the coordinates.
            style={{ '--route-d': `path('${DISTRICT_ROUTE_D}')` } as React.CSSProperties}
          />
        </Reveal>
      </div>
    </section>
  );
}
