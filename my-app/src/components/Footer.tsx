import { Link } from 'react-router-dom';
import seo from '../data/seo.json';
import { useHome } from '../content';
import { readablePhone } from '../lib/phone';
import { SocialLinks, hasSocialLinks } from './SocialLinks';
import { Icon3d } from './Icon3d';

/**
 * The foot of every page: who we are, where to go, how to reach us.
 *
 * Five columns rather than four, and the services list is one link now. It
 * used to name five of them and then offer "View all services" underneath,
 * which is six ways of saying the same thing in a column six inches from the
 * bottom of the page -- and since /services now carries every service in
 * full, one link is the whole answer.
 *
 * The ways to reach us are a column of their own with a mark against each,
 * because that is what somebody is looking for when they scroll this far: a
 * number to ring, a number to message, an address, an email.
 */

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold tracking-wide text-white uppercase">{children}</h2>
  );
}

const quickLinks = [
  { to: '/', label: 'Home' },
  // One heading for the lot. Everything we hire is on that page now.
  { to: '/services', label: 'Services' },
  { to: '/cars', label: 'Our cars' },
  { to: '/tariff', label: 'Tariff' },
  { to: '/blog', label: 'Blog' },
];

const company = [
  { to: '/about', label: 'About us' },
  { to: '/contact', label: 'Contact' },
  // On every page, which is the point: the town pages are only linked from
  // the home page otherwise, and a set of pages reachable from one page is a
  // set a crawler may not finish.
  { to: '/car-rental', label: 'Where we deliver' },
  { to: '/places', label: 'Places to visit' },
];

export function Footer() {
  const home = useHome();
  const f = home.footer;
  const social = home.social;

  // Built here from a place name rather than taking a URL from the panel.
  //
  // An <iframe src> is the one field where a pasted address is genuinely
  // dangerous: whatever it points at renders inside our page. Encoding a
  // search term into a URL we construct means the panel can only ever move the
  // pin, never change what is embedded.
  const mapSrc =
    f.mapQuery.trim() === ''
      ? null
      : `https://www.google.com/maps?q=${encodeURIComponent(f.mapQuery)}&output=embed`;
  const directions =
    f.mapQuery.trim() === ''
      ? null
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.mapQuery)}`;

  // The panel's WhatsApp address if it has one, and the site's own number
  // otherwise -- the box is still the one place that link is set.
  const digits = seo.site.phone.replace(/[^0-9]/g, '');
  const whatsapp =
    typeof social?.whatsapp === 'string' && social.whatsapp.trim() !== ''
      ? social.whatsapp
      : `https://wa.me/${digits}`;

  return (
    <footer className="relative isolate overflow-hidden bg-navy text-white/70">
      {/* The same gold glow the banner and the panels use, so the page ends
          in the brand rather than in a flat block of navy. */}
      <div aria-hidden="true" className="footer-glow absolute inset-0 -z-10" />

      {/* Two columns on a phone as well, not one. Stacked, the five blocks
          were a screen and a half of scrolling to reach a phone number --
          the two lists of links sit side by side now, which halves it. */}
      <div className="mx-auto grid max-w-[86rem] grid-cols-2 gap-x-6 gap-y-9 px-5 py-14 sm:gap-x-8 sm:px-8 sm:py-16 lg:grid-cols-12 lg:gap-8 lg:px-12">
        {/* Who */}
        <div className="col-span-2 lg:col-span-3">
          {/* The name set in type, not the lockup: the header already carries
              the artwork, and words stay crisp at any size. */}
          <p className="text-lg font-bold tracking-tight text-white">{seo.site.name}</p>
          <p className="eyebrow-gold mt-1 text-[11px]">Premium Rentals</p>
          <p className="mt-4 text-sm leading-relaxed">{f.blurb}</p>
        </div>

        {/* Where to go */}
        <nav aria-label="Quick links" className="col-span-1 lg:col-span-2">
          <ColumnHeading>Quick links</ColumnHeading>
          <ul className="tap-list mt-4 space-y-2.5 text-sm">
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company" className="col-span-1 lg:col-span-2">
          <ColumnHeading>Company</ColumnHeading>
          <ul className="tap-list mt-4 space-y-2.5 text-sm">
            {company.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* How to reach us */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-3">
          <ColumnHeading>Contact us</ColumnHeading>

          <ul className="tap-list mt-4 space-y-3 text-sm">
            <li>
              <a href={`tel:${seo.site.phone}`} className="flex items-center gap-3 transition hover:text-gold">
                <Icon3d name="phone" size={38} />
                {readablePhone(seo.site.phone)}
              </a>
            </li>

            <li>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition hover:text-gold"
              >
                <Icon3d name="whatsapp" size={38} />
                WhatsApp us
              </a>
            </li>

            <li>
              <a href={`mailto:${seo.site.email}`} className="flex items-center gap-3 transition hover:text-gold">
                <Icon3d name="mail" size={38} />
                {seo.site.email}
              </a>
            </li>
          </ul>

          <div className="mt-4 flex items-start gap-3">
            <Icon3d name="pin" size={38} />
            <address className="text-sm not-italic leading-relaxed">
              {f.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>

          {/* Shown only when the panel has them. Opening hours are one of the
              first things someone checks before setting off to collect a car,
              and they are also what Google reads out of this page's structured
              data -- written once here rather than once for people and once
              for a crawler, which is how the two end up disagreeing. */}
          {f.hours.trim() !== '' ? (
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              <span className="font-semibold text-white">Open</span> {f.hours}
            </p>
          ) : null}
        </div>

        {/* Who to follow, and the map under it: both are "where to find us"
            by another route, and the column has the room a map needs. */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-2">
          {/* Only when there is something to follow. A heading with nothing
              under it is what this column had while the panel's social boxes
              were empty. */}
          {hasSocialLinks(social) ? (
            <>
              <ColumnHeading>{social?.heading || 'Follow us on'}</ColumnHeading>
              <div className="mt-4">
                <SocialLinks />
              </div>
            </>
          ) : null}

          {mapSrc ? (
            <div className={hasSocialLinks(social) ? 'mt-7' : ''}>
              <ColumnHeading>{f.locationHeading}</ColumnHeading>
              <div className="mt-4">
                <div className="overflow-hidden rounded-xl border border-white/15">
                  <iframe
                    // Lazy, and only as tall as it needs to be: a footer map
                    // is the last thing on the page and should not cost
                    // anything before someone scrolls to it.
                    src={mapSrc}
                    title={`Map of ${f.mapQuery}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="block h-28 w-full border-0"
                  />
                </div>
                <a
                  href={directions ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-light transition hover:text-gold"
                >
                  {f.directionsLabel}
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* The line and the row under it: the copyright on one side, the two
          things somebody down here still might want on the other. */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[86rem] flex-col gap-2 px-5 py-5 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p>
            &copy; {new Date().getFullYear()} {seo.site.name}. All rights reserved.
          </p>
          {/* tap-list, because these two are standalone links rather than
              words in a sentence -- 20px of line is not a thumb target. */}
          <p className="tap-list flex items-center gap-3">
            <Link to="/tariff" className="transition hover:text-gold">
              Tariff
            </Link>
            <span aria-hidden="true" className="text-white/25">
              &bull;
            </span>
            <Link to="/contact#enquire" className="transition hover:text-gold">
              Enquire
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
