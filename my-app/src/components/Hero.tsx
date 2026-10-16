import { useHome, useSiteImage } from '../content';
import { ContentLink } from './ContentLink';
import { HeroEnquiry } from './HeroEnquiry';

export function Hero() {
  const home = useHome();
  const h = home.hero;

  // The banner photograph. The one that used to be here was a 383px-wide
  // portrait stretched across the whole width, which is why it looked wrong --
  // not because a banner should not have a picture. This one is 1920x1080 and
  // landscape, which is the shape the space actually is.
  //
  // It is the site's only photograph of that size, and it was being spent on
  // a band halfway down the page. The banner is where it earns its weight.
  const uploaded = useSiteImage('home-hero');
  const BAKED = '/mountain-road-at-sunrise-self-drive-car-rental.webp';
  const background = uploaded ?? BAKED;

  // Narrower copies of the committed photograph, so a phone is not sent a
  // 1920-pixel-wide file to paint across 390 points. At 800 wide it is 44 KB
  // rather than 166 -- and this image is the largest thing above the fold,
  // which is to say it is what Google measures this page's loading speed by.
  //
  // Only for the committed one. A photograph uploaded in the panel is served
  // by the panel at whatever size it was cropped to, and inventing -800w
  // addresses for it would be inventing files that 404.
  const widths = [800, 1280];
  const set = (ext: string) =>
    [
      ...widths.map((w) => `${BAKED.replace('.webp', `-${w}w${ext}`)} ${w}w`),
      `${BAKED.replace('.webp', ext)} 1920w`,
    ].join(', ');

  const sources = uploaded ? undefined : set('.webp');
  // The same picture again in AVIF, offered first. Measured against the
  // original, it is as faithful as the WebP at 42 per cent of the size -- and
  // this is the home page's largest contentful paint, so those bytes are the
  // number Google reports. A browser too old to read it skips the source and
  // takes the img below, which is the file it gets today.
  const avif = uploaded ? undefined : set('.avif');

  return (
    <section id="top" className="relative isolate overflow-hidden bg-navy text-white">
      {/* Under the photograph, not instead of it. The gold glows still do the
          work while the picture is decoding, and they fill the band at the
          bottom that a 16:9 image cannot reach on a tall phone. */}
      <div aria-hidden="true" className="hero-backdrop absolute inset-0 -z-10" />

      {/* The largest thing above the fold, so it is what Google measures the
          page's loading speed by: fetched first, never lazily.

          Described rather than hidden. The sitemap lists this picture as the
          one representing the home page, and alt text is most of what image
          search has besides the file name -- a page cannot tell a crawler
          "this is the photograph of the business" and a screen reader "there
          is nothing here". The words are editable beside the heading. */}
      {/* display:contents, so the picture is a wrapper for the browser's
          choosing and not a box in the layout -- the img inside is absolutely
          positioned and an inline <picture> around it would still generate a
          line box in the band. */}
      <picture className="contents">
      {avif ? <source type="image/avif" srcSet={avif} sizes="100vw" /> : null}
      <img
        src={background}
        srcSet={sources}
        // The band is full width at every size, so the browser needs no more
        // than that to pick from the set above.
        sizes={sources ? '100vw' : undefined}
        alt={h.imageAlt ?? `${h.headingLead} ${h.headingAccent}`}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        // Stated so the space is reserved before the file lands. The element
        // is absolutely positioned and object-cover, so these are the source's
        // proportions rather than a size it will be drawn at.
        width={1920}
        height={1080}
        className="hero-photo absolute inset-0 -z-10 h-full w-full object-cover object-center"
      />
      </picture>
      <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />

      <div className="relative mx-auto max-w-[86rem] px-5 pt-10 pb-12 sm:px-8 sm:pt-14 sm:pb-16 lg:px-12">
        {/* Words and the form side by side from lg up, stacked below it.
            Twelve columns rather than a half each: the form needs about 380px
            to stop its two date boxes wrapping, and the headline needs the
            rest -- an even split gave the words a column so narrow the heading
            broke over four lines. */}
        {/* Three blocks, placed rather than stacked: the words, the card, and
            the points. On a phone they run in that order, which puts the form
            a screen-height higher than it sat when it simply followed
            everything in the left column -- on the device most likely to want
            it. On a desktop the points return to under the words, where the
            card has room beside both. */}
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-9">
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-1 xl:col-span-8">
            <p data-hero-item="" style={{ ['--hero-delay' as string]: '40ms' }} className="eyebrow-gold mb-4 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-3.5 py-1.5 text-[11px]">
              {h.eyebrow}
            </p>

            {/* Two lines on a desktop, three on a phone. It was four of
                sixty-pixel type, which pushed everything that matters -- the
                buttons, the form -- under the fold on a laptop. */}
            <h1 data-hero-item="" style={{ ['--hero-delay' as string]: '120ms' }} className="text-[1.85rem] leading-[1.14] font-bold tracking-tight sm:text-[2.4rem] lg:text-[2.85rem]">
              {h.headingLead}
              <span className="block text-gold">{h.headingAccent}</span>
            </h1>

            <p data-hero-item="" style={{ ['--hero-delay' as string]: '200ms' }} className="mt-4 text-base font-semibold text-white sm:text-lg">
              {h.tagline}
            </p>

            <p data-hero-item="" style={{ ['--hero-delay' as string]: '260ms' }} className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/85 sm:text-white/75">
              {h.intro}
            </p>

            <div data-hero-item="" style={{ ['--hero-delay' as string]: '340ms' }} className="mt-7 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:flex sm:flex-wrap">
              <ContentLink
                to={h.primaryHref}
                className="rounded-xl bg-gold px-3 py-3 text-center text-[14px] font-semibold text-navy transition hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-6 sm:text-base"
              >
                {h.primaryLabel}
              </ContentLink>
              <ContentLink
                to={h.secondaryHref}
                className="rounded-xl border border-gold/40 px-3 py-3 text-center text-[14px] font-semibold text-gold-light transition hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:px-6 sm:text-base"
              >
                {h.secondaryLabel}
              </ContentLink>
            </div>

          </div>

          {/* Second on a phone, beside the words on a desktop. It spans both
              rows there so the points can sit under the heading without
              leaving a hole next to them. */}
          <div data-hero-item="" style={{ ['--hero-delay' as string]: '300ms' }} className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 xl:col-span-4 xl:col-start-9">
            <HeroEnquiry
              title={h.formTitle ?? 'Check a date'}
              note={h.formNote ?? 'Tell us when you need it and we will call you back.'}
            />
          </div>

          {/* Three promises, as badges rather than as a bulleted row.
              They were three sentences of small grey type -- "Unlimited-choice
              pickup across the city" and two more -- and three sentences side
              by side under a headline are read as a paragraph, which means
              they are not read. A badge is read, because there is nothing in
              it to skip: a tick and two or three words. The words are still
              the panel's. */}
          <ul data-hero-item="" style={{ ['--hero-delay' as string]: '420ms' }} className="flex flex-wrap gap-2.5 lg:col-span-7 lg:col-start-1 lg:row-start-2 xl:col-span-8">
            {h.points.map((p) => (
              <li key={p} className="hero-chip inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/[0.08] py-2 pr-4 pl-2.5 text-[13px] font-semibold text-white sm:text-sm">
                <span aria-hidden="true" className="hero-chip-tick grid size-5 shrink-0 place-items-center rounded-full bg-gold/20 text-gold-light">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6.4l2.3 2.3L9.5 3.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
