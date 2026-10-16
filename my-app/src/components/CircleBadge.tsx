import { Link } from 'react-router-dom';

/**
 * The circular badge with text running round its edge.
 *
 * An SVG textPath around a circle, so the letters follow the curve properly
 * rather than being individually rotated with transforms -- which drifts at
 * different font sizes and breaks entirely if the font falls back.
 *
 * The rotation is CSS on the svg only, so the centre icon stays upright, and
 * it stops under prefers-reduced-motion.
 */
export function CircleBadge({ label = 'Contact Us' }: { label?: string }) {
  // Repeated so the ring reads continuously from any angle.
  const text = `${label} • ${label} • `;

  return (
    <Link
      to="/contact"
      aria-label={label}
      className="group relative grid size-[136px] place-items-center rounded-full bg-gold shadow-[0_10px_30px_rgba(16,24,40,0.18)] transition hover:scale-[1.03]"
    >
      <svg viewBox="0 0 120 120" className="absolute inset-0 size-full [animation:spin_14s_linear_infinite] motion-reduce:animate-none">
        <defs>
          <path
            id="badge-circle"
            d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"
            fill="none"
          />
        </defs>
        <text className="fill-navy text-[11px] font-bold tracking-[0.18em] uppercase">
          <textPath href="#badge-circle">{text}</textPath>
        </text>
      </svg>

      <span
        aria-hidden="true"
        className="grid size-12 place-items-center rounded-full bg-navy text-xl text-gold"
      >
        ↗
      </span>
    </Link>
  );
}
