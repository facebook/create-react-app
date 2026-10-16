import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

/**
 * A link whose destination is typed into the admin panel.
 *
 * Which element it needs depends on what was typed, and the person typing it
 * should not have to know: "/cars" is a route and must not reload the whole
 * app, "#fleet" is a place on the page already open, and "https://", "tel:"
 * or "mailto:" leaves the site entirely.
 *
 * This existed as a plain <a> before, which is why the two buttons under the
 * headline did nothing: they pointed at #fleet and #enquire, and neither
 * section is on the home page -- the fleet is /cars and the form is /contact.
 */
export function ContentLink({
  to,
  className,
  children,
  onClick,
}: {
  to: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  if (/^(https?:|tel:|mailto:)/i.test(to)) {
    return (
      <a
        href={to}
        className={className}
        onClick={onClick}
        target={/^https?:/i.test(to) ? '_blank' : undefined}
        rel={/^https?:/i.test(to) ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    );
  }

  // A bare #hash belongs to the page that is open; the browser handles it.
  if (to.startsWith('#')) {
    return (
      <a href={to} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
