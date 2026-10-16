import { Link } from 'react-router-dom';
import seo from '../data/seo.json';
import { readablePhone } from '../lib/phone';
import { useHome } from '../content';
import { Reveal } from './Reveal';
import { SectionArt } from './art/SectionArt';
import { hasScene } from './art/scenes';

/**
 * Everything we hire, in full, on one page.
 *
 * The menu used to open a list of six pages, so "what do they actually do?"
 * was six clicks and six back buttons. It is one page now: every service laid
 * out in turn, with what it covers, what comes with it, and the way to ask for
 * it -- and the row of buttons at the top jumps straight to whichever one
 * somebody came for.
 *
 * Each service still has its own page underneath this, and they are still
 * linked from every block. They are separate searches -- somebody looking for
 * a wedding car is not the person after a scooter -- and a page can only rank
 * for what it is about. This page is the shop window; those are the rooms.
 *
 * The words are the panel's: the same list the home page and the footer read,
 * so a service added there arrives in all three.
 */

/** "/wedding-cars" -> "wedding-cars", which is what the jump buttons target. */
function anchorFor(to: string): string {
  return to.replace(/^\/+/, '').replace(/[^a-z0-9-]/gi, '-');
}

function Tick() {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold/20 text-gold-deep"
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path
          d="M2.5 6.4l2.3 2.3L9.5 3.9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function ServicesInFull() {
  const { services } = useHome();
  const items = services.items;
  const tel = `tel:${seo.site.phone}`;

  return (
    <>
      {/* Six services is a page tall enough to scroll past what you came for,
          so the page opens by naming all six. Real links to real ids, which
          means they work from a shared URL and from the back button too. */}
      <nav aria-label="Services on this page" className="mx-auto max-w-[86rem] px-5 pt-10 sm:px-8 lg:px-12">
        <ul className="flex flex-wrap justify-center gap-2.5">
          {items.map((s) => (
            <li key={s.to}>
              <a
                href={`#${anchorFor(s.to)}`}
                className="service-jump inline-flex items-center rounded-full border border-line bg-white px-4 py-2 text-[13px] font-semibold text-navy sm:text-sm"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {items.map((s, i) => {
        // Older saves from the panel predate this field, and a section that
        // arrives without it should be a block with no ticks rather than a
        // page that will not render.
        const points = s.points ?? [];
        const flipped = i % 2 === 1;

        return (
          <section
            key={s.to}
            id={anchorFor(s.to)}
            className={`service-block scroll-mt-24 ${flipped ? 'bg-white' : ''}`}
          >
            <div className="mx-auto grid max-w-[86rem] items-center gap-8 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:px-12">
              {/* The picture takes the other side on every second block, so
                  the page alternates instead of running down one rail. On a
                  phone there is one column and it always leads. */}
              <Reveal className={flipped ? 'lg:order-2' : ''}>
                {hasScene(s.to) ? (
                  <SectionArt name={s.to} alt={s.title} className="service-art rounded-[16px]" />
                ) : (
                  <div className="art-frame service-art rounded-[16px]" />
                )}
              </Reveal>

              <Reveal delay={80} className={flipped ? 'lg:order-1' : ''}>
                {/* The numeral beside the heading rather than a line of
                    type above it: six blocks of "OUR SERVICES" says nothing
                    six times, and the number is the one thing that differs. */}
                <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">
                  <span aria-hidden="true" className="service-n">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {s.title}
                </h2>

                <p className="mt-3 max-w-xl leading-relaxed text-ink-dim">{s.body}</p>

                {points.length > 0 ? (
                  <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-[15px] text-ink">
                        <Tick />
                        {p}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to={s.to}
                    className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:text-base"
                  >
                    {s.title}, in detail
                  </Link>
                  <Link
                    to="/contact#enquire"
                    className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink-dim transition hover:border-navy/40 hover:text-navy sm:text-base"
                  >
                    Check availability
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>
        );
      })}

      {/* The end of a list of six is where somebody has decided, so the ask is
          here rather than only at the top. */}
      <section className="mx-auto max-w-[86rem] px-5 py-16 sm:px-8 lg:px-12">
        <Reveal className="relative isolate overflow-hidden rounded-[18px] bg-navy px-6 py-10 text-center text-white sm:px-10 sm:py-12">
          <div aria-hidden="true" className="brand-panel-glow absolute inset-0" />
          <div className="relative">
            <h2 className="text-xl font-bold sm:text-2xl">Not sure which one you need?</h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/75">
              Tell us the dates, the number of people and where you are in{' '}
              {seo.site.district} district. We will say what is free and what it costs.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/contact#enquire"
                className="rounded-xl bg-gold px-5 py-2.5 font-semibold text-navy transition hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Send an enquiry
              </Link>
              <a
                href={tel}
                className="rounded-xl border border-gold/40 px-5 py-2.5 font-semibold text-gold-light transition hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Call {readablePhone(seo.site.phone)}
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
