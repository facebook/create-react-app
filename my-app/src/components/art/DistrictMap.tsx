import { useId } from 'react';

/**
 * The cape, with the places we deliver to marked on it.
 *
 * Drawn rather than mapped, for the same reason the scenes beside it are: a
 * tile from a map provider is a network request, a licence, an attribution
 * line and a grey rectangle while it loads, and it invites somebody to read a
 * service boundary off it that we have not drawn. This is a sketch of the
 * coast with five towns on it, and it says so by looking like one.
 *
 * What is not sketched is where the towns are. Every pin is placed from its
 * real latitude and longitude through the projection below, so the shape of
 * the journey -- Marthandam inland, Muttom on the west coast, Kanyakumari at
 * the tip -- is the shape it is on the road. A decorative map with the towns
 * in invented positions would be the one kind of wrong worth avoiding here:
 * somebody deciding whether we come to them reads distance off it.
 *
 * Five pins, not ten. Parvathipuram is inside Nagercoil and the two stations
 * and the bus stand are inside those towns; drawn at this size they would be
 * one smudge of overlapping labels. The list beside this names all ten, which
 * is where the answer actually lives.
 */

/** Degrees to the viewBox. South and east are larger, as on a map. */
const WEST = 77.04;
const EAST = 77.66;
const NORTH = 8.54;
const SOUTH = 8.03;
const W = 440;
const H = 380;

const x = (lon: number) => ((lon - WEST) / (EAST - WEST)) * W;
const y = (lat: number) => ((NORTH - lat) / (NORTH - SOUTH)) * H;

/** The coastline and the inland edge, as a handful of real points. */
const OUTLINE: Array<[number, number]> = [
  // The inland edge, west to east along the hills.
  [77.09, 8.42],
  [77.17, 8.48],
  [77.3, 8.49],
  [77.45, 8.42],
  [77.55, 8.32],
  // Down the eastern side to the tip.
  [77.6, 8.22],
  [77.58, 8.11],
  // The cape, drawn a touch beyond the town that sits on it. The smoothing
  // below cuts every corner inward, and this corner is the sharpest on the
  // map -- at the town's own coordinate the curve passes inside it and the
  // pin ends up in the sea.
  [77.56, 8.066],
  // Back up the west coast.
  [77.46, 8.1],
  [77.4, 8.11],
  [77.32, 8.115],
  [77.25, 8.155],
  [77.17, 8.22],
  [77.09, 8.3],
];

/**
 * A closed path through the points with the corners taken off.
 *
 * Each corner is cut back by a fraction of the two edges meeting at it and
 * bridged with one quadratic; everything between corners stays straight. The
 * obvious alternative -- a curve through the midpoints of every edge -- rounds
 * the whole outline evenly, which turns a cape into an egg: the sharpest
 * corner on this map is the tip at Kanyakumari, and it is the one corner that
 * has to survive.
 */
function roundedLoop(points: Array<[number, number]>, cut = 0.16): string {
  const p = points.map(([lon, lat]) => [x(lon), y(lat)] as const);
  const at = (i: number) => p[(i + p.length) % p.length];
  const lerp = (a: readonly number[], b: readonly number[], t: number) => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
  ];
  const f = (n: number) => n.toFixed(1);

  const first = lerp(at(0), at(1), cut);
  let d = `M${f(first[0])} ${f(first[1])}`;

  for (let i = 1; i <= p.length; i++) {
    const v = at(i);
    const into = lerp(v, at(i - 1), cut);
    const out = lerp(v, at(i + 1), cut);
    d += ` L${f(into[0])} ${f(into[1])} Q${f(v[0])} ${f(v[1])} ${f(out[0])} ${f(out[1])}`;
  }

  return `${d}Z`;
}

/**
 * Where the pins go, and where each label sits relative to its pin.
 *
 * Under the pin for everything inland, because the pin is drawn upward from
 * its point and the space below it is always land. Kanyakumari is the one
 * exception: it is the tip, so below it is sea and its name goes up and to
 * the left instead.
 */
const PLACES = [
  { name: 'Marthandam', lat: 8.307, lon: 77.222, dx: 0, dy: 15, anchor: 'middle' },
  { name: 'Thuckalay', lat: 8.245, lon: 77.313, dx: 0, dy: 15, anchor: 'middle' },
  { name: 'Nagercoil', lat: 8.178, lon: 77.428, dx: 0, dy: 15, anchor: 'middle' },
  { name: 'Muttom', lat: 8.126, lon: 77.316, dx: 0, dy: 15, anchor: 'middle' },
  { name: 'Kanyakumari', lat: 8.078, lon: 77.541, dx: -8, dy: -22, anchor: 'end' },
] as const;

/** The run between them, in the order somebody would actually drive it. */
const ROUTE = ['Marthandam', 'Thuckalay', 'Muttom', 'Nagercoil', 'Kanyakumari'];

function routePath(): string {
  const stops = ROUTE.map((name) => {
    const place = PLACES.find((p) => p.name === name)!;
    return [x(place.lon), y(place.lat)] as const;
  });

  // Bowed slightly rather than ruler-straight: roads here follow the coast,
  // and a straight line between two towns reads as a flight path.
  let d = `M${stops[0][0].toFixed(1)} ${stops[0][1].toFixed(1)}`;
  for (let i = 1; i < stops.length; i++) {
    const [ax, ay] = stops[i - 1];
    const [bx, by] = stops[i];
    const cx = (ax + bx) / 2 + (by - ay) * 0.12;
    const cy = (ay + by) / 2 - (bx - ax) * 0.12;
    d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
  }
  return d;
}

const ROUTE_D = routePath();
const LAND_D = roundedLoop(OUTLINE);

export function DistrictMap({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      style={style}
      role="img"
      aria-label="Kanyakumari district, with Marthandam, Thuckalay, Muttom, Nagercoil and Kanyakumari marked"
    >
      <defs>
        <linearGradient id={`land-${uid}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#fffdf8" />
          <stop offset="100%" stopColor="#f4e6c8" />
        </linearGradient>
        <filter id={`lift-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#05070f" floodOpacity="0.45" />
        </filter>
      </defs>

      <g className="map-land" filter={`url(#lift-${uid})`}>
        <path d={LAND_D} fill={`url(#land-${uid})`} />
        <path d={LAND_D} fill="none" stroke="#d4af37" strokeWidth="2" strokeOpacity="0.55" />
      </g>

      {/* The run between the towns. Dashed, because it is a route rather than
          a border -- a solid line around this shape would read as one. */}
      <path
        className="map-route"
        d={ROUTE_D}
        fill="none"
        stroke="#0a0e20"
        strokeWidth="2"
        strokeDasharray="7 6"
        strokeLinecap="round"
        strokeOpacity="0.55"
      />

      {/* The car along it, as one group so the motion path moves the drawing
          rather than each stroke of it. */}
      <g className="map-car" aria-hidden="true">
        <g transform="translate(-11 -7)">
          <rect x="0" y="4" width="22" height="8" rx="3" fill="#0a0e20" />
          <path d="M4.5 4.2l2.4-3.1A2.4 2.4 0 0 1 8.8 0h4.4a2.4 2.4 0 0 1 1.9 1.1l2.4 3.1z" fill="#0a0e20" />
          <circle cx="6" cy="12.4" r="2.1" fill="#14100d" />
          <circle cx="16" cy="12.4" r="2.1" fill="#14100d" />
          <rect x="1.5" y="6" width="19" height="2" rx="1" fill="#d4af37" opacity="0.85" />
        </g>
      </g>

      {PLACES.map((place, i) => {
        const px = x(place.lon);
        const py = y(place.lat);

        return (
          <g
            key={place.name}
            className="map-pin"
            style={{ '--pin-delay': `${i * 120}ms` } as React.CSSProperties}
          >
            {/* Drawn from its point, so the drop animation lands the tip on
                the town rather than scaling the whole thing off it. */}
            <g transform={`translate(${px.toFixed(1)} ${py.toFixed(1)})`}>
              <g className="map-pin-mark">
                <path
                  d="M0 0c0-0.2-7.5-6.8-7.5-11.4a7.5 7.5 0 1 1 15 0C7.5-6.8 0-0.2 0 0z"
                  fill="#d4af37"
                  stroke="#0a0e20"
                  strokeWidth="1.2"
                />
                <circle cy="-11.4" r="2.9" fill="#0a0e20" />
              </g>
              <text
                className="map-label"
                x={place.dx}
                y={place.dy}
                textAnchor={place.anchor}
                fill="#0a0e20"
              >
                {place.name}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/** The path the car runs, for the stylesheet's offset-path. */
export const DISTRICT_ROUTE_D = ROUTE_D;
