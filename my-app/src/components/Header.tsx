import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import seo from '../data/seo.json';
import { Logo } from './Logo';

/* The menu used to open onto these six. They are still pages, still linked
   from /services and from the footer -- but a visitor asking "what do you
   hire?" was being handed a list of six places to go and read instead of an
   answer. /services is the answer now, and the menu says so once.

   The list stays for one job: telling the menu to light up while somebody is
   on one of them. */
const servicePaths = [
  '/services',
  '/cars',
  '/bikes',
  '/wedding-cars',
  '/tourist-vehicles',
  '/monthly',
  '/nri',
];

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/tariff', label: 'Tariff' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

/** Gold dot over the current page, as on the old site. */
const activeDot =
  "before:absolute before:-top-1.5 before:left-1/2 before:size-1.5 before:-translate-x-1/2 before:rounded-full before:bg-gold-light before:content-['']";

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Closing on navigation belongs to the click that navigates, not to an
  // effect watching the path: an effect would set state during render and
  // cascade an extra one.
  const closeMenus = () => {
    setOpen(false);
  };

  // Lit while somebody is on any of the pages behind it, not only on
  // /services itself: a menu that goes dark when you follow it reads as a
  // page that lost its place.
  const onServicePage = servicePaths.includes(pathname);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'relative py-1 text-sm font-semibold transition',
      isActive ? `text-gold-light ${activeDot}` : 'text-white/70 hover:text-gold-light',
    ].join(' ');

  return (
    <header className="sticky top-0 z-50 bg-navy-deep">
      <div className="mx-auto flex max-w-[86rem] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12 py-4">
        <Logo onClick={closeMenus} />

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          <NavLink to="/" end onClick={closeMenus} className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/about" onClick={closeMenus} className={linkClass}>
            About Us
          </NavLink>

          <NavLink
            to="/services"
            onClick={closeMenus}
            className={() =>
              [
                'relative py-1 text-sm font-semibold transition',
                onServicePage ? `text-gold-light ${activeDot}` : 'text-white/70 hover:text-gold-light',
              ].join(' ')
            }
          >
            Services
          </NavLink>

          {links.slice(2).map((l) => (
            <NavLink key={l.to} to={l.to} onClick={closeMenus} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${seo.site.phone}`}
            className="hidden rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:block"
          >
            Call us
          </a>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 text-gold-light transition hover:border-gold/60 lg:hidden"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
              {open ? (
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Main"
          data-menu=""
          className="border-t border-white/10 bg-navy-deep px-5 pb-4 lg:hidden"
        >
          <ul className="grid gap-1 pt-2">
            {[links[0], links[1], { to: '/services', label: 'Services' }, ...links.slice(2)].map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  onClick={closeMenus}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2.5 font-semibold transition ${
                      isActive ? 'bg-gold text-navy' : 'text-white/75 hover:bg-white/10'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li>
              <a
                href={`tel:${seo.site.phone}`}
                className="mt-1 block rounded-xl bg-gold px-3 py-2.5 text-center font-semibold text-navy sm:hidden"
              >
                Call +91 63749 42976
              </a>
            </li>
          </ul>
        </nav>
      ) : null}

      <div className="gold-rule" />
    </header>
  );
}
