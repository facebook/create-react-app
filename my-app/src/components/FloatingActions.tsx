import { useEffect, useState } from 'react';
import { Icon3d } from './Icon3d';
import { useLocation } from 'react-router-dom';
import seo from '../data/seo.json';

/**
 * The two buttons that follow you down the page: WhatsApp, and back to the top.
 *
 * Fixed to the bottom-right and stacked, clear of the WhatsApp button's own
 * habit of being the thing people reach for. Back-to-top only appears once
 * there is something to go back to — a button that scrolls to where you
 * already are is a button that teaches people to ignore it.
 *
 * WhatsApp is left off the home page. The enquiry card in the banner carries
 * its own, full width and labelled in words, and two of the same offer on one
 * screen is one of them being ignored -- on a phone they were within a
 * thumb's width of each other.
 *
 * Back-to-top stays there. It is the longest page on the site and it is the
 * one control the banner does not duplicate.
 */
export function FloatingActions() {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  // Both spellings of the same route, because a trailing slash is what a link
  // from outside often carries and a missing button is not something anybody
  // would connect back to it.
  const onHome = pathname === '/' || pathname === '';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const number = seo.site.phone.replace(/[^0-9]/g, '');
  const message = encodeURIComponent('Hello, I would like to enquire about a vehicle.');

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 print:hidden">
      <button
        type="button"
        onClick={() =>
          window.scrollTo({
            top: 0,
            // Respected here rather than assumed: someone who has asked their
            // system for less motion should not be thrown up the page.
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'auto'
              : 'smooth',
          })
        }
        aria-label="Back to the top of the page"
        // Kept in the DOM and faded out rather than unmounted, so it does not
        // appear under a thumb that is already on its way down.
        // The plate carries the colour and the shadow, so the button is the
        // hit area and nothing else.
        className={`icon-btn3d grid size-12 place-items-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
          scrolled ? 'opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
        }`}
      >
        <Icon3d name="arrow-up" size={48} />
      </button>

      {onHome ? null : (
      <a
        href={`https://wa.me/${number}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message us on WhatsApp"
        className="icon-btn3d grid size-14 place-items-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        <Icon3d name="whatsapp" size={56} />
      </a>
      )}
    </div>
  );
}
