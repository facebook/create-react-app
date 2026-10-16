import { Link } from 'react-router-dom';
import seo from '../data/seo.json';
import { useSiteImage } from '../content';
import { Monogram } from './Monogram';
import { LOGO_FALLBACK } from './BrandPanel';

/**
 * The mark in the header, and nothing beside it.
 *
 * It used to be the mark plus PREMIUM RENTALS over the business name in live
 * text. That made sense while there was no logo: the words were the logo. It
 * stopped making sense the moment a real one arrived, because this one has the
 * name drawn into it -- so the header was saying "NiteSha Cars & Bikes" twice,
 * once as artwork and once as type, in two faces at two sizes.
 *
 * The full lockup rather than the emblem, precisely because the text is gone:
 * with no words beside it, the mark has to carry the name itself. It is set
 * large enough that it does, which makes the header taller than a wordmark
 * would -- the cost of a logo with its name drawn in.
 *
 * Alt text rather than aria-hidden, for the same reason. There is no longer a
 * written name for a screen reader to find, so the picture has to supply it.
 *
 * The monogram and the old wordmark stay as the fallback for a site with no
 * logo at all, which is what this was before the owner sent one.
 */
export function Logo({ onClick }: { onClick?: () => void }) {
  // An upload replaces it; until then, the file the owner supplied.
  const uploaded = useSiteImage('logo');
  const logo = uploaded ?? LOGO_FALLBACK;

  // The committed lockup is 1209 pixels wide and is drawn at about 110. That
  // is 108 KB fetched at high priority, above the fold, on every page, to
  // paint something a tenth of the size -- and on the home page it is
  // competing for bandwidth with the banner photograph, which is what the
  // page's loading speed is actually measured on. At 400 wide it is 27 KB and
  // still sharper than any screen will show.
  //
  // Only for the committed file, as with the banner: a logo uploaded in the
  // panel is served by the panel, and inventing -400w addresses for it would
  // be inventing files that 404.
  //
  // 240 is here for the phone. The header draws the lockup 83 points wide
  // below the sm breakpoint, so a two-times screen wants about 166 pixels and
  // was being sent the 400-wide file: 27 KB for a picture it renders at a
  // fifth of that. At 240 it is 17 KB and still over the density it needs.
  const widths = [240, 400, 800];
  const set = (ext: string) =>
    [
      ...widths.map((w) => `${LOGO_FALLBACK.replace('.webp', `-${w}w${ext}`)} ${w}w`),
      `${LOGO_FALLBACK.replace('.webp', ext)} 1209w`,
    ].join(', ');

  const sources = uploaded ? undefined : set('.webp');
  // And in AVIF, which the browser takes if it can read it. On this lockup it
  // is both smaller and closer to the original than the WebP -- flat colour
  // and hard edges are what AVIF is best at -- and its transparency survives,
  // which is the thing to check before believing any of that.
  const avif = uploaded ? undefined : set('.avif');

  if (logo) {
    return (
      <Link
        to="/"
        onClick={onClick}
        // Every other thing in the header answers a pointer and this did
        // not, which on the one link that is on every page reads as a
        // picture rather than a way home. Brightness rather than a lift: the
        // mark is gold on navy, and lighting it is what gold does.
        className="flex shrink-0 items-center transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      >
        <picture className="contents">
        {avif ? (
          <source
            type="image/avif"
            srcSet={avif}
            sizes="(min-width: 640px) 110px, 83px"
          />
        ) : null}
        <img
          src={logo}
          srcSet={sources}
          // 48px tall below the sm breakpoint and 64px above it; the lockup is
          // about 1.72 times as wide as it is tall, so that is 83 and 110
          // points of width. Stated in pixels rather than as a vw fraction
          // because the header does not scale with the window.
          sizes={sources ? '(min-width: 640px) 110px, 83px' : undefined}
          alt={seo.site.name}
          // The one picture above the fold on every page, so it is not left to
          // be discovered late.
          fetchPriority="high"
          decoding="async"
          width={1209}
          height={705}
          className="h-12 w-auto object-contain sm:h-16"
        />
        </picture>
      </Link>
    );
  }

  return (
    <Link
      to="/"
      onClick={onClick}
      className="flex min-w-0 items-center gap-2.5 sm:gap-3 transition hover:brightness-110"
    >
      <Monogram className="size-11 shrink-0 sm:size-12" />
      {/* whitespace-nowrap because "NiteSha Cars & Bikes" was breaking after
          "Cars", which reads as two businesses. */}
      <span className="min-w-0 leading-tight">
        <span className="eyebrow-gold block text-[9px] sm:text-[11px]">
          Premium Rentals
        </span>
        <span className="block text-[15px] font-bold tracking-tight whitespace-nowrap text-white sm:text-lg">
          {seo.site.name}
        </span>
      </span>
    </Link>
  );
}
