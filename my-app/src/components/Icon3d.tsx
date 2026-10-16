import { useId } from 'react';

/**
 * The site's icons: a coloured plate with a mark on it.
 *
 * Every icon on the site was a hairline drawn in one colour, which is what an
 * icon set looks like when it is drawn a piece at a time in whatever component
 * needed one. Four of them on four coloured cards read as four smudges, and a
 * phone, a pin and an envelope in identical grey say nothing about which is
 * which before you read the line beside them.
 *
 * So: one recipe, used everywhere the icon is big enough to carry it. A plate
 * with a diagonal gradient, a gloss across its top half, a shadow underneath
 * and a rim inside the edge -- the four things that make a flat shape read as
 * an object -- and the mark on top in white.
 *
 * Drawn rather than fetched: the whole set is a few kilobytes of markup, it
 * stays sharp on any screen, and there is no request to fail. It is also why
 * every glyph here is stroked paths rather than a font -- a font is a
 * download, a fallback and a flash of nothing.
 *
 * Small controls keep their hairlines on purpose. A plate at sixteen pixels
 * is a coloured square with something indistinct on it; the chevron beside a
 * menu and the tick inside a chip are clearer flat.
 */

export type Icon3dName =
  | 'phone'
  | 'whatsapp'
  | 'mail'
  | 'pin'
  | 'instagram'
  | 'facebook'
  | 'shield'
  | 'drop'
  | 'people'
  | 'car'
  | 'arrow-up';

/**
 * The plate's colours: the stops across it, the shadow it casts, and -- where
 * a brand's own gradient runs a particular way -- the corners it runs between.
 *
 * Two stops is the house recipe. More than two is for a mark whose colour is
 * not ours to choose: Instagram's is five, from yellow at the bottom left
 * through orange and pink to blue at the top right, and anything else reads
 * as the wrong icon rather than as a design decision.
 */
const TONES = {
  gold: { stops: ['#f6dc84', '#c9a227'], shadow: '#c9a227' },
  bronze: { stops: ['#e6a860', '#a85f22'], shadow: '#a85f22' },
  navy: { stops: ['#2b3a72', '#0a0e20'], shadow: '#0a0e20' },
  cream: { stops: ['#fffdf6', '#e8dcc4'], shadow: '#e8dcc4' },
  green: { stops: ['#5ee08a', '#128c3e'], shadow: '#128c3e' },
  plum: { stops: ['#d08bd6', '#7b2f86'], shadow: '#7b2f86' },
  // Instagram's own, and running its own way: bottom left to top right.
  instagram: {
    stops: ['#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5'],
    shadow: '#962fbf',
    // The shadow of a five-stop plate takes its colour from the middle,
    // because neither end is what the eye reads the plate as.
    line: [0.1, 1, 0.9, 0] as const,
  },
  // Facebook's blue, for the same reason.
  facebook: { stops: ['#3b8bf5', '#1877f2'], shadow: '#0b4ea2' },
} as const;

export type Icon3dTone = keyof typeof TONES;

/** Which plate each mark sits on unless the caller says otherwise. */
const DEFAULT_TONE: Record<Icon3dName, Icon3dTone> = {
  phone: 'gold',
  whatsapp: 'green',
  mail: 'navy',
  pin: 'bronze',
  instagram: 'instagram',
  facebook: 'facebook',
  shield: 'gold',
  drop: 'bronze',
  people: 'navy',
  car: 'cream',
  'arrow-up': 'navy',
};

/** The mark itself, drawn in a 24-unit box and scaled onto the plate. */
const GLYPHS: Record<Icon3dName, React.ReactNode> = {
  phone: (
    <path
      fill="currentColor"
      stroke="none"
      d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2z"
    />
  ),
  whatsapp: (
    <>
      <path
        fill="currentColor"
        stroke="none"
        d="M12.04 3C7.1 3 3.1 7 3.1 11.94c0 1.58.42 3.12 1.2 4.48L3 21l4.74-1.24a8.95 8.95 0 0 0 4.3 1.1h.01c4.94 0 8.95-4.02 8.95-8.96 0-2.39-.93-4.64-2.62-6.33A8.88 8.88 0 0 0 12.04 3zm0 16.38h-.01a7.4 7.4 0 0 1-3.78-1.04l-.27-.16-2.82.74.75-2.75-.18-.28a7.42 7.42 0 0 1-1.14-3.95c0-4.1 3.35-7.44 7.46-7.44a7.4 7.4 0 0 1 7.44 7.45c0 4.1-3.34 7.43-7.45 7.43z"
      />
      <path
        fill="currentColor"
        stroke="none"
        d="M16.16 14.1c-.23-.11-1.33-.66-1.54-.73-.2-.08-.35-.11-.5.11-.16.23-.59.74-.72.89-.13.15-.27.17-.5.06-.22-.11-.95-.35-1.8-1.12-.67-.6-1.12-1.33-1.25-1.55-.13-.23-.02-.35.1-.46.1-.1.22-.27.34-.4.11-.14.15-.23.23-.38.07-.15.04-.29-.02-.4-.06-.12-.5-1.21-.7-1.66-.18-.44-.36-.38-.5-.39h-.43c-.15 0-.4.06-.6.28-.21.23-.79.78-.79 1.88s.81 2.18.92 2.33c.12.15 1.6 2.43 3.86 3.41.54.23.96.37 1.29.48.54.17 1.03.15 1.42.09.43-.06 1.33-.54 1.51-1.07.19-.53.19-.98.14-1.07-.06-.1-.21-.16-.44-.27z"
      />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3.8 7.6l8.2 5.7 8.2-5.7" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6.6-6 6.6-10.6a6.6 6.6 0 1 0-13.2 0C5.4 15 12 21 12 21z" />
      <circle cx="12" cy="10.2" r="2.5" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="16.9" cy="7.1" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <path
      fill="currentColor"
      stroke="none"
      d="M13.6 21v-7.7h2.6l.4-3h-3V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.25A21 21 0 0 0 14.4 4c-2.3 0-3.9 1.4-3.9 4v2.3H8v3h2.5V21h3.1z"
    />
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5.5c0 4.3-2.9 8.2-7 9.5-4.1-1.3-7-5.2-7-9.5V6l7-3z" />
      <path d="M8.8 12.2l2.2 2.2 4.2-4.4" />
    </>
  ),
  drop: (
    <>
      <path d="M12 3.5c3.2 3.6 5.2 6.3 5.2 9a5.2 5.2 0 1 1-10.4 0c0-2.7 2-5.4 5.2-9z" />
      <path d="M9.6 13.8a2.6 2.6 0 0 0 2.2 2.4" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8.5" r="3.1" />
      <path d="M3.6 19.4a5.6 5.6 0 0 1 10.8 0" />
      <path d="M16 6.2a3 3 0 0 1 0 5.8" />
      <path d="M17.2 14.6a5.6 5.6 0 0 1 3.4 4.8" />
    </>
  ),
  car: (
    <>
      <path d="M4 14.5h16" />
      <path d="M5.5 14.5l1.6-4.3A2 2 0 0 1 9 8.9h6a2 2 0 0 1 1.9 1.3l1.6 4.3" />
      <path d="M4 14.5v3.1h2.2" />
      <path d="M20 14.5v3.1h-2.2" />
      <circle cx="7.6" cy="17.6" r="1.4" />
      <circle cx="16.4" cy="17.6" r="1.4" />
    </>
  ),
  'arrow-up': (
    <>
      <path d="M12 19V6" />
      <path d="M6 12l6-6 6 6" />
    </>
  ),
};

/** The mark is white on every plate but the pale ones. */
const INK: Partial<Record<Icon3dTone, string>> = {
  cream: '#8a5a00',
};

export function Icon3d({
  name,
  size = 44,
  tone,
  shape = 'round',
  className,
}: {
  name: Icon3dName;
  /** Rendered edge to edge, shadow included. */
  size?: number;
  tone?: Icon3dTone;
  /** A disc, or a rounded square the way an app icon is drawn. */
  shape?: 'round' | 'square';
  className?: string;
}) {
  // One set of gradient ids per instance: six plates all defining #plate would
  // every one of them paint with whichever definition the browser read last.
  const uid = useId().replace(/:/g, '');
  const key = tone ?? DEFAULT_TONE[name];
  const plate: { stops: readonly string[]; shadow: string; line?: readonly number[] } = TONES[key];
  const { stops, shadow } = plate;
  // Top left to bottom right unless the brand's own gradient runs elsewhere.
  const [x1, y1, x2, y2] = plate.line ?? [0.15, 0, 0.85, 1];
  const ink = INK[key] ?? '#fff';

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`plate-${uid}`} x1={x1} y1={y1} x2={x2} y2={y2}>
          {stops.map((colour, i) => (
            <stop
              key={colour}
              offset={`${Math.round((i / (stops.length - 1)) * 100)}%`}
              stopColor={colour}
            />
          ))}
        </linearGradient>
        {/* The gloss: bright at the top edge, gone by the middle. */}
        <linearGradient id={`gloss-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`drop-${uid}`} x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor={shadow} floodOpacity="0.45" />
        </filter>
      </defs>

      <g filter={`url(#drop-${uid})`}>
        {shape === 'round' ? (
          <>
            <circle cx="24" cy="23" r="21" fill={`url(#plate-${uid})`} />
            {/* The rim, inside the edge: light at the top, where the light is. */}
            <circle cx="24" cy="23" r="20" fill="none" stroke="#fff" strokeOpacity="0.28" />
            <ellipse cx="24" cy="15" rx="18" ry="12" fill={`url(#gloss-${uid})`} />
          </>
        ) : (
          <>
            <rect x="3" y="2" width="42" height="42" rx="13" fill={`url(#plate-${uid})`} />
            <rect
              x="4"
              y="3"
              width="40"
              height="40"
              rx="12"
              fill="none"
              stroke="#fff"
              strokeOpacity="0.28"
            />
            <rect x="5" y="4" width="38" height="20" rx="11" fill={`url(#gloss-${uid})`} />
          </>
        )}
      </g>

      {/* The mark, drawn in a 24-unit box and set on the middle of the plate. */}
      <g
        transform="translate(12 11) scale(1)"
        fill="none"
        stroke={ink}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        color={ink}
      >
        {GLYPHS[name]}
      </g>
    </svg>
  );
}
