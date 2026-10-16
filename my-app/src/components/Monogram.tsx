/**
 * The mark in the header, until there is a real one to replace it.
 *
 * The header carried a drawn coiled snake, which was removed because it was
 * asked for -- and what was left was the business name in text with nothing
 * beside it. That reads as a page whose logo failed to load rather than as a
 * deliberate wordmark.
 *
 * So: the initials, in a gold ring, in the site's own two colours. Not a
 * picture of anything, and not pretending to be artwork somebody commissioned
 * -- a monogram is what a business uses while it does not have a logo, and it
 * is honest about being one.
 *
 * The letters are paths rather than <text>. The same geometry is used for the
 * favicon file, where there is no page font to inherit and <text> would render
 * in whatever the browser happened to pick.
 *
 * It disappears the moment a real logo is uploaded under Website content --
 * Logo.tsx prefers the upload and never draws both.
 */
export function Monogram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="32" cy="32" r="30" fill="#0A0E20" />
      <circle cx="32" cy="32" r="30" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
      <g transform="translate(-2 0)">
      {/* N: two uprights and the diagonal between them, drawn as one filled
          outline so the stroke can be heavier than the counters. */}
      <path
        fill="#D4AF37"
        d="M14 20h6.6l8.8 13.4V20H36v24h-6.6l-8.8-13.4V44H14z"
      />
      {/* S: a squared-off letter rather than a true curve. At 16px a rounded S
          closes up into a blob; the flat cuts keep the two counters open. */}
      <path
        fill="#D4AF37"
        d="M39.5 24.6c0-2.6 2.6-4.6 6.6-4.6h4.4v5.4h-4.4c-.5 0-.8.2-.8.6s.3.6.8.6h1.5c4 0 6.4 2.2 6.4 5.6v6.2c0 3.4-2.6 5.6-6.6 5.6H41V38.6h6.4c.5 0 .8-.2.8-.6v-1.4c0-.4-.3-.6-.8-.6H46c-4 0-6.5-2.2-6.5-5.6z"
      />
      </g>
    </svg>
  );
}
