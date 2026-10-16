import { useRef } from 'react';
import type { SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import { useHome, useSiteImage } from '../content';

/** The photograph this band falls back to when the panel holds none. */
const BAKED = '/mountain-road-at-sunrise-self-drive-car-rental.webp';
import { useReveal } from '../lib/useReveal';
import { Reveal } from './Reveal';

/**
 * The questions people ask before they book.
 *
 * Here because they are asked on the phone every day, and because a page that
 * answers a question in the words somebody typed is the page that gets found.
 * "Do I need a deposit for a self drive car in Nagercoil" is a search; a
 * tariff table is not an answer to it.
 *
 * <details> rather than a pile of JavaScript: it opens and closes with no
 * script at all, it is keyboard-operable and announced correctly without any
 * work, and -- the part that matters here -- the answers are in the HTML
 * whether they are open or shut, so a crawler reads every one of them.
 *
 * The same questions are turned into FAQPage structured data at build time by
 * scripts/prerender-seo.mjs, which builds each page's list exactly the way
 * this does -- same source, same slice. Google asks that such data match what
 * the page shows, and one list built twice from one rule is how that stays
 * true.
 *
 * No question is answered at two URLs. The home page takes the first six of
 * the panel's; the tariff page asks its own six about the table above it and
 * then picks up the panel's from the seventh. Before that split the tariff
 * page rendered all ten, so six questions and six answers were claimed by
 * both pages -- and of a duplicate pair Google shows one and the other earns
 * nothing.
 *
 * Panels of the band's own navy rather than cream cards. Ten pale blocks on a
 * dark photograph read as a stack of paper dropped on the page -- the section
 * fought the banner behind it and won, which is not what a photograph is for.
 * Lit from within instead, with a gold hairline, it sits in the band.
 */

/** Shared by every card in the list, which is what makes them exclusive. */
const GROUP = 'faq';

function Item({
  question,
  answer,
  delay,
  onToggle,
}: {
  question: string;
  answer: string;
  delay: number;
  onToggle: (event: SyntheticEvent<HTMLDetailsElement>) => void;
}) {
  const ref = useReveal<HTMLDetailsElement>();

  return (
    <details
      ref={ref}
      data-reveal=""
      style={{ ['--reveal-delay' as string]: `${delay}ms` }}
      // Browsers that know this attribute close the open one themselves, with
      // no script at all. The handler below is for the ones that do not.
      name={GROUP}
      onToggle={onToggle}
      className="faq-panel group rounded-[16px] px-5 py-3.5 text-left sm:px-6 sm:py-4"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] leading-snug font-semibold text-white marker:content-none sm:text-[16.5px]">
        {question}
        {/* A chevron that turns rather than a plus that becomes a minus: the
            rotation says "this opens downwards", which is what it does. */}
        <span
          aria-hidden="true"
          className="faq-chevron grid size-8 shrink-0 place-items-center rounded-full border border-gold/35 text-gold"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>
      <p className="faq-answer mt-3 border-t border-white/12 pt-3.5 text-[14.5px] leading-relaxed text-white/75">
        {answer}
      </p>
    </details>
  );
}

export type FaqItem = { question: string; answer: string };

export function Faq({
  /** How many to show. Everything, unless a page says otherwise. */
  limit,
  /** Where the ones that did not fit can be read, when some did not. */
  moreHref,
  moreLabel,
  /**
   * Questions belonging to this page, asked before the panel's.
   *
   * The tariff page's questions are about how its own table is written --
   * what a per-day column means, how the allowance is counted -- which is
   * not something the owner edits when the figures change, so they live in
   * src/data and arrive here.
   */
  items: own,
  /**
   * Panel questions to drop from the front, because another page answers
   * them. The home page shows the first six; the tariff page skips those six
   * and shows the rest, so no question on this site is answered at two URLs
   * -- which is also what keeps each page's FAQPage data its own.
   */
  skip = 0,
  /**
   * Overrides the panel's own, for a page whose questions are not its.
   *
   * A heading on its own drops the panel's intro rather than keeping it:
   * "if yours is not here" is written about that list of questions, and
   * under a different heading it is a sentence about something else.
   */
  heading,
  intro,
}: {
  limit?: number;
  moreHref?: string;
  moreLabel?: string;
  items?: readonly FaqItem[];
  skip?: number;
  heading?: string;
  intro?: string;
} = {}) {
  const { faq } = useHome();
  const all = [...(own ?? []), ...(faq?.items ?? []).slice(skip)];
  const title = heading ?? faq?.heading;
  const blurb = intro ?? (heading ? undefined : faq?.intro);
  const list = useRef<HTMLDivElement>(null);

  // A photograph almost entirely behind navy. The section was a white list on
  // cream and read as small print at the foot of the page; what it actually is
  // is the page answering the things people phone up to ask, which is worth a
  // band of its own.
  //
  // Its own slot in the panel now. It used to read home-hero, which meant
  // there was no way to set this band's picture at all and the tariff page's
  // questions sat over the home page's photograph. home-hero is still the
  // fallback, so a site that has only ever set that one looks exactly as it
  // did.
  //
  // Both read unconditionally, and chosen between afterwards. Written as
  // `useSiteImage('faq') ?? useSiteImage('home-hero')` the ?? short-circuits,
  // so the second hook stops being called the moment the first returns
  // something -- the hook order changes between renders and React breaks, on
  // the render after somebody uploads a picture here.
  const uploadedFaq = useSiteImage('faq');
  const uploadedHero = useSiteImage('home-hero');
  const chosen = uploadedFaq ?? uploadedHero;
  const photo = chosen ?? BAKED;

  // Only the committed file gets narrower copies: a photograph uploaded in the
  // panel is served by the panel at the size it was cropped to, and inventing
  // -800w addresses for it would be inventing files that 404.
  //
  // It was asking for the full 1920-wide original -- 166 KB, nearly half the
  // weight of the tariff page -- for a picture that is lazily loaded, purely
  // decorative, and sunk under a navy wash. 800 wide in AVIF is 26 KB and
  // there is nothing in this band anyone can see well enough to miss.
  const sources = chosen
    ? undefined
    : [800, 1280].map((w) => `${BAKED.replace('.webp', `-${w}w.webp`)} ${w}w`).join(', ');
  const avif = chosen
    ? undefined
    : [800, 1280].map((w) => `${BAKED.replace('.webp', `-${w}w.avif`)} ${w}w`).join(', ');

  if (all.length === 0) return null;

  const items = limit === undefined ? all : all.slice(0, limit);
  const rest = all.length - items.length;

  // One open at a time, which is what the shared name does in Chrome 120,
  // Safari 17.2 and Firefox 130 and later. Older browsers ignore the
  // attribute and would leave every answer someone had opened on the screen,
  // so the same rule is applied here by hand. In a browser that already did
  // it, this finds nothing to close.
  const closeTheRest = (event: SyntheticEvent<HTMLDetailsElement>) => {
    const opened = event.currentTarget;
    if (!opened.open) return;

    for (const other of list.current?.querySelectorAll('details[open]') ?? []) {
      if (other !== opened) (other as HTMLDetailsElement).open = false;
    }
  };

  return (
    <section className="relative isolate overflow-hidden bg-navy py-20 text-white">
      <picture className="contents">
        {avif ? <source type="image/avif" srcSet={avif} sizes="100vw" /> : null}
        <img
          src={photo}
          srcSet={sources}
          sizes={sources ? '100vw' : undefined}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="faq-photo absolute inset-0 -z-10 h-full w-full object-cover object-center"
        />
      </picture>
      <div aria-hidden="true" className="faq-wash absolute inset-0 -z-10" />

      <div className="mx-auto max-w-[86rem] px-5 sm:px-8 lg:px-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          {title ? (
            <h2 className="text-[1.6rem] font-bold tracking-tight sm:text-[2.1rem]">
              {title}
            </h2>
          ) : null}
          {blurb ? (
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/75">
              {blurb}
            </p>
          ) : null}
        </Reveal>

        {/* Two columns from the tablet up.

            Two stacks rather than a two-column grid, which matters the moment
            an answer opens: in a grid the row grows to the taller of the pair
            and the card beside it is left sitting over a hole the size of the
            answer. Each stack closes up on its own.

            Split in half rather than by odd and even, because on a phone the
            two stacks become one and its order is the order of the markup.
            Halves keep the questions in the order the panel lists them --
            deposit, documents, kilometres -- which is the order they are
            asked in. */}
        <div
          ref={list}
          className="mx-auto mt-7 grid max-w-4xl gap-2.5 sm:mt-9 sm:grid-cols-2 sm:gap-3"
        >
          {[
            items.slice(0, Math.ceil(items.length / 2)),
            items.slice(Math.ceil(items.length / 2)),
          ].map((column, side) => (
            <div key={side} className="flex flex-col gap-2.5 sm:gap-3">
              {column.map((item, i) => (
                <Item
                  key={item.question}
                  question={item.question}
                  answer={item.answer}
                  delay={Math.min(i, 5) * 60}
                  onToggle={closeTheRest}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Only when there are some, and only when the page has somewhere to
            send them. A link saying "and four more" that goes nowhere is
            worse than not mentioning them. */}
        {rest > 0 && moreHref ? (
          <Reveal className="mt-7 text-center">
            <Link
              to={moreHref}
              className="group inline-flex items-center gap-2 rounded-xl border border-gold/40 px-5 py-2.5 text-[15px] font-semibold text-gold-light transition hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {moreLabel ?? `${rest} more question${rest === 1 ? '' : 's'}`}
              <span aria-hidden="true" className="transition group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
