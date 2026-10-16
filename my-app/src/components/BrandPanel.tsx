import { Link } from 'react-router-dom';
import { useSiteImage } from '../content';
import seo from '../data/seo.json';
import { readablePhone } from '../lib/phone';

/* -v2 because the artwork changed and the name had to: images are cached for
   a week, so keeping the old name would have shown the old lockup -- tagline
   and all -- to everyone who had already been to the site. A new name is a
   new URL, and nothing cached can answer for it. */
export const LOGO_FALLBACK = '/nitesha-cars-and-bikes-logo-nagercoil-v2.webp';

/** The mark on its own, without the name under it.
 *
 *  The header writes the business name out beside it in live text, which stays
 *  crisp at any size and is what a search result quotes. The full lockup's own
 *  wordmark next to that is the same name twice -- and at header height its
 *  "CARS & BIKES" line is a few pixels tall and unreadable anyway. */
export const EMBLEM_FALLBACK = '/nitesha-cars-and-bikes-emblem.webp';

/**
 * What a page shows where it has nothing to list yet.
 *
 * Three pages were carrying a white box with a sentence in it, in the middle
 * of a band of cream two or three times its height -- and the pages with the
 * least to say are the ones a stranger is most likely to land on from a
 * search. An empty page is not a reason for the page to look unfinished.
 *
 * So: the logo, on navy, with the line the page wanted to say and the two ways
 * to ask. Navy and not cream because this logo is a dark-background mark --
 * "CARS & BIKES" is set in white in it, and on a light panel that line simply
 * disappears. That is a property of the artwork, not a preference.
 *
 * The mark is uploadable like everything else; the committed file is what the
 * owner supplied.
 */
export function BrandPanel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  /** Overrides the default pair of buttons when a page wants its own. */
  action?: React.ReactNode;
}) {
  const logo = useSiteImage('logo') ?? LOGO_FALLBACK;
  const tel = `tel:${seo.site.phone.replace(/\s+/g, '')}`;

  return (
    <div className="brand-panel relative overflow-hidden rounded-[18px] bg-navy px-6 py-10 text-center sm:px-10 sm:py-12">
      {/* The same gold glow the banner uses, so the two read as one site. */}
      <div aria-hidden="true" className="brand-panel-glow absolute inset-0" />

      <div className="relative">
        {/* No alt: the business name is written out underneath in the heading
            and again in the footer, and a screen reader saying it a third time
            here is noise, not information. */}
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="mx-auto h-20 w-auto sm:h-24"
        />

        <p className="mt-6 text-xl font-bold text-white">{title}</p>
        <div className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-white/70">
          {children}
        </div>

        {action ?? (
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
        )}
      </div>
    </div>
  );
}
