import { useSiteImage } from '../../content';
import type { SceneName } from './scenes';

/**
 * Illustrated headers for the section cards.
 *
 * These are drawn rather than photographed, and that is a deliberate trade
 * rather than a placeholder. A rental site wants one consistent look across
 * six service cards; six stock photographs never share a light source, a
 * colour cast or a horizon, and the grid reads as a scrapbook. Vector scenes
 * built from the brand palette share all three by construction.
 *
 * They also cost nothing to ship: the whole set is a few kilobytes of markup
 * with no network request, no layout shift while a file loads, and no broken
 * frame if one goes missing. They stay sharp on a phone and on a 5K display
 * alike, and they recolour with the theme.
 *
 * Real photography of the actual fleet beats these on every card it replaces,
 * so they are the floor rather than the ceiling: put a file in public/photos
 * named after the slot and the build's manifest picks it up, no code change.
 * A slot with no file keeps its drawing, which is what makes a half-finished
 * set of photographs still look like a finished site.
 *
 * Every scene is decorative: the heading and copy beside it carry the
 * meaning, so the <svg> is aria-hidden and contributes nothing to the
 * accessibility tree.
 */

/** Sky, horizon glow and ground -- shared by every scene so they sit together. */
function Backdrop({ ground = 152 }: { ground?: number }) {
  return (
    <>
      <rect width="400" height="200" fill="url(#ns-sky)" />
      <circle cx="300" cy={ground - 34} r="60" fill="url(#ns-glow)" />
      <rect y={ground} width="400" height={200 - ground} fill="url(#ns-ground)" />
    </>
  );
}

/**
 * The gradients every scene paints with, defined once for the whole page.
 *
 * They used to be defined inside each drawing, with a useId suffix on every
 * id so twelve copies of `#metal` on the home page would not collide. The
 * suffix was the right answer to the wrong question: the four gradients are
 * byte for byte the same in every instance, so the collision to avoid was
 * one worth having. Twelve <defs> blocks of sixteen nodes each is 192 nodes
 * on the home page -- an eighth of the whole document -- describing four
 * gradients.
 *
 * Rendered once, in App, above everything that draws. Nothing here paints:
 * the svg is zero by zero and out of the accessibility tree, and a <defs>
 * renders nothing in any case.
 *
 * Fixed ids, so a scene can name one without being told which copy is
 * hers. The ns- prefix is the only guard needed now -- there is one of
 * each, and it belongs to this site rather than to an instance.
 */
export function SceneDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false"
         style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="ns-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#070a16" />
          <stop offset="62%" stopColor="#111a38" />
          <stop offset="100%" stopColor="#1d2547" />
        </linearGradient>
        <radialGradient id="ns-glow">
          <stop offset="0%" stopColor="#f0d060" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#d4af37" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ns-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0e20" />
          <stop offset="100%" stopColor="#05070f" />
        </linearGradient>
        <linearGradient id="ns-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0d060" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#c8873a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Perspective road with a centre line, used by several scenes. */
function Road() {
  return (
    <g>
      <path d="M150 200 L186 152 L214 152 L250 200 Z" fill="#161d38" />
      <path d="M198 152 L202 152 L203 164 L197 164 Z" fill="#d4af37" opacity="0.75" />
      <path d="M196 170 L204 170 L206 186 L194 186 Z" fill="#d4af37" opacity="0.6" />
      <path d="M192 192 L208 192 L210 200 L190 200 Z" fill="#d4af37" opacity="0.45" />
      <rect y="150" width="400" height="2" fill="url(#ns-metal)" opacity="0.35" />
    </g>
  );
}

function Car({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M8 38 L18 20 Q22 13 32 13 L74 13 Q84 13 90 20 L104 38 Q110 39 110 46 L110 54 Q110 58 105 58 L98 58 A12 12 0 0 0 74 58 L44 58 A12 12 0 0 0 20 58 L13 58 Q8 58 8 54 Z"
        fill="url(#ns-metal)"
      />
      <path d="M26 21 L36 21 L34 35 L18 35 Z" fill="#0a0e20" opacity="0.62" />
      <path d="M42 21 L72 21 L74 35 L40 35 Z" fill="#0a0e20" opacity="0.62" />
      <circle cx="32" cy="58" r="10" fill="#05070f" />
      <circle cx="32" cy="58" r="4" fill="#d4af37" opacity="0.6" />
      <circle cx="86" cy="58" r="10" fill="#05070f" />
      <circle cx="86" cy="58" r="4" fill="#d4af37" opacity="0.6" />
    </g>
  );
}

function SelfDriveCars() {
  return (
    <>
      <Backdrop />
      <Road />
      <g opacity="0.35">
        <path d="M0 152 L54 112 L104 152 Z" fill="#050810" />
        <path d="M296 152 L352 104 L400 152 Z" fill="#050810" />
      </g>
      <Car x={142} y={92} s={1.05} />
    </>
  );
}

function Bikes() {
  return (
    <>
      <Backdrop />
      <Road />
      {/* Drawn in back-to-front order: exhaust first, then the body, then
          the wheels last so their rings stay crisp instead of being cut into
          by the parts behind them. Everything structural sits above y=34,
          which is the top of the wheels -- overlapping them turned the back
          of the bike into an unreadable lump. */}
      <g transform="translate(136 90) scale(1.1)">
        <path d="M54 46 L38 51" stroke="url(#ns-metal)" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7" />

        {/* Tail and seat. */}
        <path d="M12 28 L50 25 L52 34 L14 36 Z" fill="#d4af37" opacity="0.92" />
        {/* Tank. */}
        <path d="M48 26 Q64 13 82 21 L84 32 L50 34 Z" fill="url(#ns-metal)" />
        {/* Engine block, sitting in the gap between the wheels. */}
        <rect x="52" y="34" width="24" height="15" rx="3" fill="url(#ns-metal)" />
        {/* Front fork and bars. */}
        <path d="M96 20 L104 50" stroke="url(#ns-metal)" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M88 14 L106 19" stroke="url(#ns-metal)" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M74 40 L98 46" stroke="url(#ns-metal)" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="100" cy="27" r="5" fill="#f0d060" />

        <circle cx="26" cy="52" r="15" fill="none" stroke="url(#ns-metal)" strokeWidth="5" />
        <circle cx="104" cy="52" r="15" fill="none" stroke="url(#ns-metal)" strokeWidth="5" />
      </g>
    </>
  );
}

function WeddingCars() {
  return (
    <>
      <Backdrop />
      <g opacity="0.5">
        {[70, 120, 170, 220, 270, 320].map((cx, i) => (
          <circle key={cx} cx={cx} cy={30 + (i % 2) * 12} r="3" fill="#f0d060" opacity="0.7" />
        ))}
        <path
          d="M50 42 Q200 6 350 42"
          fill="none"
          stroke="#d4af37"
          strokeWidth="1.5"
          strokeDasharray="4 7"
          opacity="0.6"
        />
      </g>
      <Road />
      <Car x={142} y={92} s={1.05} />
      {/* Ribbon bow on the bonnet, and streamers trailing off the back. */}
      <g transform="translate(232 104)">
        <path d="M0 0 Q-14 -10 -16 0 Q-14 10 0 0 Z" fill="#fff8ea" opacity="0.92" />
        <path d="M0 0 Q14 -10 16 0 Q14 10 0 0 Z" fill="#fff8ea" opacity="0.92" />
        <circle cx="0" cy="0" r="4" fill="#fff8ea" />
        <path d="M-2 4 L-8 18 M2 4 L6 18" stroke="#fff8ea" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" fill="none" />
      </g>
      <g stroke="#fff8ea" strokeWidth="2" fill="none" opacity="0.55" strokeLinecap="round">
        <path d="M150 132 Q132 138 122 130" />
        <path d="M150 140 Q130 150 116 144" />
      </g>
    </>
  );
}

function TouristVehicles() {
  return (
    <>
      <Backdrop />
      <g opacity="0.4">
        <path d="M0 152 L48 96 L96 152 Z" fill="#050810" />
        <path d="M70 152 L130 82 L190 152 Z" fill="#070b18" />
      </g>
      {/* Palms, for the coast road rather than the hills. Fronds are filled
          shapes: a stroked line tapers to nothing at the trunk and reads as a
          bare spoke. */}
      <g fill="#050810" opacity="0.85">
        <path d="M342 152 Q338 130 337 108 L343 108 Q344 130 348 152 Z" />
        <g transform="translate(340 108)">
          <path d="M0 0 Q-16 -8 -28 2 Q-14 -4 -2 6 Z" />
          <path d="M0 0 Q16 -10 30 -2 Q14 -6 2 6 Z" />
          <path d="M0 0 Q-8 -18 -4 -30 Q-2 -16 4 -4 Z" />
          <path d="M0 0 Q12 -16 24 -18 Q10 -10 4 2 Z" />
          <path d="M0 0 Q-14 -16 -24 -18 Q-10 -10 -2 2 Z" />
          <circle cx="0" cy="0" r="4" />
        </g>
        <path d="M375 152 Q373 138 373 122 L378 122 Q378 138 380 152 Z" />
        <g transform="translate(375 122) scale(0.7)">
          <path d="M0 0 Q-16 -8 -28 2 Q-14 -4 -2 6 Z" />
          <path d="M0 0 Q16 -10 30 -2 Q14 -6 2 6 Z" />
          <path d="M0 0 Q-6 -18 -2 -30 Q0 -16 4 -4 Z" />
          <path d="M0 0 Q12 -16 24 -18 Q10 -10 4 2 Z" />
          <circle cx="0" cy="0" r="4" />
        </g>
      </g>
      <Road />
      {/* Tempo traveller: taller box body, so it reads as a group vehicle. */}
      <g transform="translate(138 82)">
        <path d="M6 62 L6 22 Q6 14 16 14 L104 14 Q116 14 116 26 L116 62 Z" fill="url(#ns-metal)" />
        <rect x="14" y="22" width="24" height="18" rx="2" fill="#0a0e20" opacity="0.6" />
        <rect x="44" y="22" width="24" height="18" rx="2" fill="#0a0e20" opacity="0.6" />
        <rect x="74" y="22" width="34" height="18" rx="2" fill="#0a0e20" opacity="0.6" />
        <circle cx="30" cy="62" r="10" fill="#05070f" />
        <circle cx="94" cy="62" r="10" fill="#05070f" />
      </g>
    </>
  );
}

function Monthly() {
  const cells = Array.from({ length: 20 }, (_, i) => i);
  return (
    <>
      <Backdrop ground={200} />
      <g transform="translate(112 42)">
        <rect width="176" height="122" rx="12" fill="#0d1428" stroke="#d4af37" strokeOpacity="0.4" />
        <rect width="176" height="30" rx="12" fill="url(#ns-metal)" opacity="0.9" />
        <rect y="20" width="176" height="10" fill="url(#ns-metal)" opacity="0.9" />
        {cells.map((i) => {
          const col = i % 5;
          const row = Math.floor(i / 5);
          const active = i > 3 && i < 17;
          return (
            <rect
              key={i}
              x={16 + col * 30}
              y={44 + row * 20}
              width="20"
              height="13"
              rx="3"
              fill={active ? '#d4af37' : '#1b2442'}
              opacity={active ? 0.25 + (i % 5) * 0.14 : 1}
            />
          );
        })}
      </g>
      <g transform="translate(246 116)">
        <circle cx="0" cy="0" r="13" fill="none" stroke="url(#ns-metal)" strokeWidth="5" />
        <path d="M11 4 L34 18 M28 14 L26 22 M34 18 L32 26" stroke="url(#ns-metal)" strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>
    </>
  );
}

function Nri() {
  return (
    <>
      <Backdrop />
      <g opacity="0.55">
        <circle cx="200" cy="112" r="66" fill="none" stroke="#d4af37" strokeOpacity="0.35" strokeWidth="1.5" />
        <ellipse cx="200" cy="112" rx="26" ry="66" fill="none" stroke="#d4af37" strokeOpacity="0.28" strokeWidth="1.5" />
        <path d="M136 94 H264 M136 130 H264" stroke="#d4af37" strokeOpacity="0.28" strokeWidth="1.5" />
      </g>
      <path
        d="M56 128 Q160 34 336 58"
        fill="none"
        stroke="#f0d060"
        strokeWidth="2"
        strokeDasharray="6 8"
        opacity="0.75"
      />
      <g transform="translate(318 44) rotate(24)">
        <path d="M0 10 L40 4 L52 12 L40 20 L0 14 Z" fill="url(#ns-metal)" />
        <path d="M14 12 L6 -8 L14 -8 L28 10 Z" fill="#f0d060" opacity="0.85" />
        <path d="M14 12 L6 32 L14 32 L28 14 Z" fill="#c8873a" opacity="0.85" />
      </g>
      <g transform="translate(40 108) scale(0.62)">
        <Car />
      </g>
    </>
  );
}

function Coast() {
  return (
    <>
      {/* Composed by hand rather than from Backdrop: this one needs a sea
          horizon two-thirds down and a light source on the left, which is the
          opposite of the shared layout. */}
      {/* These two stay here rather than in SceneDefs: only this scene draws
          them, and in the shared block every page in the site would carry
          seven nodes for a sea it never paints. No page puts two coasts on
          at once, and if one ever did the two definitions would be the same
          two gradients, so the duplicate id costs a few nodes and changes
          nothing on the screen. */}
      <defs>
        <linearGradient id="ns-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141d3d" />
          <stop offset="100%" stopColor="#060911" />
        </linearGradient>
        <linearGradient id="ns-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f0d060" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f0d060" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="400" height="200" fill="url(#ns-sky)" />
      <circle cx="318" cy="70" r="54" fill="url(#ns-glow)" />

      {/* The beam, before the tower, so the tower edge stays clean. */}
      <path d="M62 34 L400 4 L400 86 L62 46 Z" fill="url(#ns-beam)" />

      <rect y="126" width="400" height="74" fill="url(#ns-sea)" />
      <rect y="125" width="400" height="1.5" fill="url(#ns-metal)" opacity="0.4" />

      {/* Headland the tower stands on. */}
      <path d="M0 126 Q26 108 56 112 Q86 116 104 126 Z" fill="#05070f" />

      <g>
        <path d="M40 124 L48 48 L64 48 L72 124 Z" fill="#fff8ea" opacity="0.92" />
        <path d="M45 78 L67 78 L69 96 L43 96 Z" fill="#c8873a" opacity="0.85" />
        <path d="M42 106 L70 106 L71 118 L41 118 Z" fill="#c8873a" opacity="0.6" />
        {/* Lantern room and cap. */}
        <rect x="46" y="32" width="20" height="16" rx="2" fill="url(#ns-metal)" />
        <path d="M43 32 L56 20 L69 32 Z" fill="#c8873a" />
        <circle cx="56" cy="40" r="17" fill="url(#ns-glow)" />
        <circle cx="56" cy="40" r="5" fill="#fff8ea" />
      </g>

      {/* Light on the water. Filled crescents were the first attempt and they
          came out as dark olive lozenges: gold at low alpha over a near-black
          sea subtracts more than it adds. Thin bright strokes read as glints
          because they sit above the sea's luminance rather than below it. */}
      <g stroke="#f0d060" strokeLinecap="round" fill="none">
        <path d="M112 144 h26" strokeWidth="2" opacity="0.3" />
        <path d="M158 158 h18" strokeWidth="2" opacity="0.22" />
        <path d="M208 148 h32" strokeWidth="2" opacity="0.26" />
        <path d="M268 164 h22" strokeWidth="2" opacity="0.2" />
        <path d="M318 150 h28" strokeWidth="2" opacity="0.24" />
        <path d="M136 178 h34" strokeWidth="2.5" opacity="0.18" />
        <path d="M228 186 h26" strokeWidth="2.5" opacity="0.15" />
        <path d="M300 176 h36" strokeWidth="2.5" opacity="0.17" />
        <path d="M92 192 h30" strokeWidth="3" opacity="0.12" />
        <path d="M352 190 h30" strokeWidth="3" opacity="0.12" />
      </g>

      {/* The tower's reflection, directly below it and fading out. */}
      <path d="M50 126 L62 126 L68 200 L44 200 Z" fill="#f0d060" opacity="0.07" />
    </>
  );
}

function StepChoose() {
  return (
    <>
      <Backdrop ground={200} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${34 + i * 116} ${56 + (i === 1 ? -10 : 0)})`}>
          <rect width="98" height="88" rx="10" fill="#0d1428" stroke="#d4af37" strokeOpacity={i === 1 ? 0.75 : 0.28} />
          <g transform="translate(6 18) scale(0.76)">
            <Car />
          </g>
          <rect x="16" y="70" width="46" height="6" rx="3" fill="#d4af37" opacity={i === 1 ? 0.8 : 0.3} />
        </g>
      ))}
    </>
  );
}

function StepEnquire() {
  return (
    <>
      <Backdrop ground={200} />
      <g transform="translate(66 44)">
        <path d="M0 14 Q0 0 16 0 L150 0 Q166 0 166 14 L166 74 Q166 88 150 88 L46 88 L20 108 L24 88 L16 88 Q0 88 0 74 Z" fill="#0d1428" stroke="#d4af37" strokeOpacity="0.45" />
        <rect x="22" y="24" width="106" height="8" rx="4" fill="#d4af37" opacity="0.65" />
        <rect x="22" y="44" width="122" height="8" rx="4" fill="#d4af37" opacity="0.38" />
        <rect x="22" y="64" width="72" height="8" rx="4" fill="#d4af37" opacity="0.24" />
      </g>
      <circle cx="286" cy="60" r="20" fill="url(#ns-metal)" opacity="0.9" />
      <path d="M278 60 L284 66 L296 54" stroke="#0a0e20" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function StepDrive() {
  return (
    <>
      <Backdrop />
      <Road />
      <Car x={148} y={96} />
      <g transform="translate(58 62)">
        <circle cx="0" cy="0" r="11" fill="none" stroke="url(#ns-metal)" strokeWidth="4" />
        <path d="M9 4 L28 16 M23 12 L21 19 M28 16 L26 23" stroke="url(#ns-metal)" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
    </>
  );
}

// Typed against SceneName, so adding a name in scenes.ts without drawing it
// here is a compile error rather than a blank card in production.
const SCENES: Record<SceneName, () => React.JSX.Element> = {
  '/cars': SelfDriveCars,
  '/bikes': Bikes,
  '/wedding-cars': WeddingCars,
  '/tourist-vehicles': TouristVehicles,
  '/monthly': Monthly,
  '/nri': Nri,
  coast: Coast,
  'step-1': StepChoose,
  'step-2': StepEnquire,
  'step-3': StepDrive,
};

interface SectionArtProps {
  name: SceneName;
  className?: string;
  /** Overrides the manifest. Rarely needed; the filename normally decides. */
  photo?: string;
  /** Describes the photograph when one is used. A drawing stays decorative. */
  alt?: string;
  /** The page's own banner image, which must not wait for a lazy load. */
  eager?: boolean;
}

export function SectionArt({ name, className, photo, alt, eager }: SectionArtProps) {
  const Scene = SCENES[name];

  // Uploaded in the panel first, then a file in public/photos, then the
  // drawing. This used to ask the file manifest only, which meant every one of
  // these -- the six service cards, the three steps, the areas panel -- had a
  // slot in the panel that nothing on the site ever read. Someone could upload
  // a photograph of their own fleet and watch the drawing stay put.
  //
  // The slot name is the scene name without its leading slash, which is the
  // same thing photoFor() did and what useSiteImage falls back to.
  const uploaded = useSiteImage(name.replace(/^\/+/, ''));
  const src = photo ?? uploaded;

  if (src) {
    // A photograph of the actual vehicle carries information the surrounding
    // copy does not, so it gets a real alt when the caller supplies one. With
    // no description it stays decorative rather than being announced as an
    // unlabelled image.
    const described = Boolean(alt);
    return (
      <div className={`art-frame ${className ?? ''}`}>
        <img
          src={src}
          alt={alt ?? ''}
          aria-hidden={described ? undefined : true}
          loading={eager ? 'eager' : 'lazy'}
          // The banner is the largest thing above the fold; telling the
          // browser to fetch it first is the difference between the page
          // painting complete and painting in two stages.
          fetchPriority={eager ? 'high' : undefined}
          decoding="async"
          className="art-photo"
        />
        <span aria-hidden="true" className="art-sheen" />
      </div>
    );
  }

  return (
    <div className={`art-frame ${className ?? ''}`}>
      <svg
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
        className="art-svg"
      >
        <Scene />
      </svg>
      <span aria-hidden="true" className="art-sheen" />
    </div>
  );
}
