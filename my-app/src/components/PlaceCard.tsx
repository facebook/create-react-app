import type { Place } from '../lib/places';

/**
 * One place, as a card.
 *
 * Shared between the home page's rail and the full page, so the two cannot
 * drift into looking like different features.
 *
 * The picture is a fixed height rather than an aspect ratio, and the name is
 * held to two lines. Both are about the row rather than the card: a card is
 * read beside three others, and a name that runs to two lines where its
 * neighbour's runs to one puts every line below it out of step with the card
 * next to it. Fixed, every heading in a row starts on the same line and every
 * Directions button ends on one.
 *
 * `decorative` is for the duplicate set the rail loops through. That copy is
 * already out of the tab order and hidden from the accessibility tree; this
 * takes the name off its picture and the link out of its Directions button,
 * so the same twelve places are not announced twice and the same twelve links
 * are not two tab stops each.
 */
export function PlaceCard({ place, decorative = false }: { place: Place; decorative?: boolean }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-white shadow-[0_10px_30px_rgba(16,24,40,0.08)]">
      <div className="place-media relative bg-cream">
        {place.photo ? (
          <img
            src={place.photo}
            // Named, not decorative: someone searching for a photograph of
            // Vattakottai Fort should be able to find this one.
            alt={decorative ? '' : `${place.name}, Kanyakumari district`}
            loading="lazy"
            decoding="async"
            width={1200}
            height={750}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="grid h-full w-full place-items-center bg-navy/5 text-sm text-ink-faint"
          >
            {place.category || 'Kanyakumari'}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {place.category ? (
          <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
            {place.category}
          </p>
        ) : null}
        <h3 className="place-title mt-0.5 font-semibold text-navy">{place.name}</h3>
        {place.blurb ? <p className="place-blurb mt-1.5 flex-1 text-ink-dim">{place.blurb}</p> : null}

        {place.mapUrl ? (
          <a
            href={place.mapUrl}
            target="_blank"
            {...(decorative ? { tabIndex: -1, 'aria-hidden': true } : {})}
            // noreferrer alongside noopener: the new tab should not be handed a
            // reference back to this one, nor told where it came from.
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 self-start rounded-xl border border-line px-3.5 py-1.5 text-sm font-semibold text-navy transition hover:border-navy/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Directions
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none">
              <path d="M6 3h7v7M13 3 3.5 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="sr-only">to {place.name}, opens Google Maps in a new tab</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
