import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * A date field with the taken days marked and refused.
 *
 * One calendar, and it is this one.
 *
 * This used to be an <input type="date"> with our own month grid sitting open
 * underneath it, which meant a visitor saw two calendars at once and the one
 * they actually tapped -- the browser's -- was the one that knew nothing about
 * which days are already booked. On a phone it is worse: a date input opens
 * the operating system's picker on touch whatever we do to it, so the grid
 * below could only ever be a second opinion nobody asked for.
 *
 * So the field is a button now. Pressing it opens the grid below, and that
 * grid is the only way in -- which is what lets a booked day be drawn as
 * booked and refused when it is pressed. The cost is that a date can no longer
 * be typed. That is a real loss for somebody who knows their dates, and it
 * buys the thing that matters more here: on the one calendar anybody sees,
 * the days we cannot give them are struck out before they ask.
 *
 * The grid is only in the page while it is open, so a form with two of these
 * is two buttons rather than two months of markup.
 *
 * The grid is put at the end of the page and positioned over the field rather
 * than nested inside it. The banner card sits in a section that clips what
 * overflows it -- it has to, the artwork behind it runs past its edges -- and
 * a calendar nested in that card had its last week cut off by it. Out here
 * nothing can clip it, and being measured against the window rather than
 * against a parent is also what keeps it on screen at the foot of a phone.
 *
 * Arrow keys move across the days and over the month boundaries, which is the
 * keyboard route the date input used to provide. One cell is in the tab order
 * at a time -- forty-two tab stops to get out of a calendar is not a keyboard
 * route, it is a trap. Days that cannot be picked stay focusable and are
 * marked aria-disabled rather than being disabled outright: you have to be
 * able to land on the 14th to be told the 14th is gone.
 */

const DAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** The calendar's own width, which is fixed. */
const POP_WIDTH = 272;

/** Its tallest: six rows of days, with the month above and the key below. */
const NEED = 330;

/** The gap it keeps from the field, and from the edge of the window. */
const GAP = 6;
const EDGE = 8;

/** Where the calendar sits, in window coordinates. */
interface Spot {
  left: number;
  top?: number;
  bottom?: number;
  up: boolean;
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Midday-safe parse: these are plain days, never instants. */
const at = (key: string) => new Date(`${key}T00:00:00`);

const step = (key: string, days: number) => {
  const d = at(key);
  d.setDate(d.getDate() + days);
  return iso(d);
};

const monthOf = (key: string) => {
  const d = at(key);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/** Monday-first, which is how a week is written here. */
const weekday = (key: string) => (at(key).getDay() + 6) % 7;

/**
 * "Tue 6 Oct 2026". Built rather than handed to toLocaleDateString in one go,
 * which punctuates it "Tue, 6 Oct, 2026" -- a comma between the month and the
 * year, which reads as a typing mistake.
 *
 * The month is named on purpose. 06/10 is the sixth of October here and the
 * tenth of June to half the people who will read it, and a rental that starts
 * on the wrong day is an argument at the counter.
 */
const readable = (key: string) => {
  const d = at(key);
  return [
    d.toLocaleDateString('en-IN', { weekday: 'short' }),
    d.getDate(),
    d.toLocaleDateString('en-IN', { month: 'short' }),
    d.getFullYear(),
  ].join(' ');
};

export function DatePick({
  id,
  name,
  value,
  onChange,
  busy,
  min,
  labelledBy,
  placeholder = 'Choose a date',
  size = 'md',
  invalid = false,
  describedBy,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (next: string) => void;
  /** ISO days that cannot be chosen. */
  busy: Set<string>;
  /** Nothing before this day. Defaults to today. */
  min?: string;
  labelledBy?: string;
  placeholder?: string;
  /** 'sm' for the banner card, where every row is tighter. */
  size?: 'md' | 'sm';
  /** The server refused this date. Shown the same way a clash is. */
  invalid?: boolean;
  /** The element holding the reason, so it is read out with the field. */
  describedBy?: string;
}) {
  const today = iso(new Date());
  const floor = min ?? today;

  const [open, setOpen] = useState(false);

  // Where the arrow keys are, which is not the same as what has been chosen:
  // you move across days before you pick one.
  const [cursor, setCursor] = useState(() => value || (floor > today ? floor : today));
  const [month, setMonth] = useState(() => monthOf(cursor));

  // Where the calendar goes. Null until it is opened, because it is measured
  // from the field rather than assumed.
  const [spot, setSpot] = useState<Spot | null>(null);

  const wrap = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Set when the cursor moved because of a key or because the calendar just
  // opened. Without it the effect below would pull focus off whatever a mouse
  // was doing every time the month changed.
  const chase = useRef(false);

  const popId = useId();

  const cells = useMemo(() => {
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const lead = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
    return [
      ...Array.from({ length: lead }, () => null),
      ...Array.from(
        { length: days },
        (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1),
      ),
    ];
  }, [month]);

  // Closing: a press anywhere else, or Escape, which also puts the focus back
  // on the field rather than leaving it on a grid that is no longer there.
  useEffect(() => {
    if (!open) return;

    const away = (event: PointerEvent) => {
      // The calendar is at the end of the page, so it is not inside the
      // wrapper: it has to be asked about separately or every press on a day
      // would read as a press somewhere else and shut it.
      if (!inside(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      fieldRef.current?.focus();
    };

    // Positioned against the window, so it has to be told when the window
    // moves under it.
    const follow = () => place();

    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', escape);
    window.addEventListener('scroll', follow, { passive: true, capture: true });
    window.addEventListener('resize', follow);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('scroll', follow, { capture: true });
      window.removeEventListener('resize', follow);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !chase.current) return;
    chase.current = false;
    // The calendar is already fully on screen, so the page has no business
    // moving to show a cell in it.
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-day="${cursor}"]`)
      ?.focus({ preventScroll: true });
  }, [open, cursor, month]);

  const inside = (node: Node | null) =>
    Boolean(wrap.current?.contains(node) || popRef.current?.contains(node));

  /**
   * Under the field when there is room, over it when there is not, and pinned
   * to the top of the window when there is room neither way -- a short window,
   * or a browser giving half the screen to its own furniture. Never off the
   * side: the left edge is clamped, which is the whole of what used to be a
   * left-or-right decision.
   */
  const place = () => {
    const seat = fieldRef.current?.getBoundingClientRect();
    if (!seat) return;

    const below = window.innerHeight - seat.bottom;
    const above = seat.top;
    const left = Math.min(Math.max(EDGE, seat.left), window.innerWidth - POP_WIDTH - EDGE);

    if (below >= NEED) {
      setSpot({ left, top: seat.bottom + GAP, up: false });
    } else if (above >= NEED) {
      setSpot({ left, bottom: window.innerHeight - seat.top + GAP, up: true });
    } else {
      setSpot({ left, top: EDGE, up: false });
    }
  };

  const show = () => {
    // Seeded each time rather than once: the return date's floor moves when a
    // pickup date is chosen, and opening on a month that is entirely in the
    // past is a calendar you have to page out of before you can use it.
    const seed = value || (floor > today ? floor : today);
    setCursor(seed);
    setMonth(monthOf(seed));

    // Placed before it is rendered, not measured afterwards. Rendering it in
    // the wrong place and then moving it means the browser scrolls the page to
    // follow the focus into a calendar that is no longer there, which throws
    // the page half a screen.
    place();

    chase.current = true;
    setOpen(true);
  };

  const pick = (key: string) => {
    onChange(key);
    setOpen(false);
    fieldRef.current?.focus();
  };

  const onGridKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    let next: string | null = null;

    if (event.key in moves) {
      next = step(cursor, moves[event.key]);
    } else if (event.key === 'Home') {
      next = step(cursor, -weekday(cursor));
    } else if (event.key === 'End') {
      next = step(cursor, 6 - weekday(cursor));
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      const from = at(cursor);
      const target = new Date(
        from.getFullYear(),
        from.getMonth() + (event.key === 'PageUp' ? -1 : 1),
        1,
      );
      const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      next = iso(new Date(target.getFullYear(), target.getMonth(), Math.min(from.getDate(), last)));
    }

    if (!next) return;

    event.preventDefault();
    chase.current = true;
    setCursor(next);
    setMonth(monthOf(next));
  };

  const page = (delta: number) => {
    const target = new Date(month.getFullYear(), month.getMonth() + delta, 1);
    setMonth(target);

    // The cursor comes along, or the month on screen would have no cell in the
    // tab order at all and the arrow keys would have nothing to move. The
    // focus itself stays on the arrow, so a second press pages again.
    const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    setCursor(
      iso(new Date(target.getFullYear(), target.getMonth(), Math.min(at(cursor).getDate(), last))),
    );
  };

  // Only reachable by choosing dates and then choosing a vehicle that is out
  // on them: the grid itself will not hand back a booked day.
  const clash = value !== '' && busy.has(value);
  // A day that is taken and a day the server refused look the same to the
  // person reading the form, so they look the same here.
  const wrong = clash || invalid;

  return (
    <div
      ref={wrap}
      className="relative"
      // Tabbing off the end of the grid should close it, the same as pressing
      // somewhere else would.
      onBlur={(event) => {
        if (open && !inside(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      {/* What the form sends. The field itself is a button, and a button's
          value is not what anybody means by the date. */}
      <input type="hidden" name={name} value={value} />

      <button
        ref={fieldRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        // Both, so it is read as "Pickup date, Tue 21 Oct 2026" rather than as
        // one or the other. A <label for> alone would name it after the label
        // and never say which day is in it.
        aria-labelledby={labelledBy ? `${labelledBy} ${id}` : undefined}
        aria-invalid={wrong || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : show())}
        className={`flex w-full items-center border bg-white text-left outline-none transition focus:ring-2 focus:ring-navy/15 ${
          size === 'sm'
            ? 'gap-1.5 rounded-lg px-3 py-1.5 text-[14px] sm:py-2'
            : 'gap-2 rounded-xl px-3.5 py-2.5'
        } ${wrong ? 'border-danger' : open ? 'border-navy' : 'border-line hover:border-navy/40'}`}
      >
        <svg
          width={size === 'sm' ? 15 : 17}
          height={size === 'sm' ? 15 : 17}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
          className="shrink-0 text-ink-faint"
        >
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        <span className={`truncate ${value === '' ? 'text-ink-faint' : 'font-semibold text-ink'}`}>
          {value === '' ? placeholder : readable(value)}
        </span>
      </button>

      {clash ? (
        <p className="mt-1 text-sm text-danger">
          Every vehicle is out that day. Pick one that is not marked.
        </p>
      ) : null}

      {open && spot
        ? createPortal(
            <div
              ref={popRef}
              id={popId}
              role="dialog"
              aria-modal="false"
              aria-label="Choose a date"
              data-drop={spot.up ? 'up' : 'down'}
              // In window coordinates, because it is no longer inside
              // anything that could position it.
              style={{
                left: spot.left,
                top: spot.top,
                bottom: spot.bottom,
                width: POP_WIDTH,
              }}
              className="fixed z-50 rounded-xl border border-line bg-white p-2.5 shadow-[0_18px_44px_rgba(16,24,40,0.16)]"
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => page(-1)}
                  aria-label="Previous month"
                  className="grid size-7 place-items-center rounded-md text-ink-dim transition hover:bg-cream hover:text-navy"
                >
                  &#8249;
                </button>
                <span aria-live="polite" className="text-[13px] font-semibold text-navy">
                  {month.toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => page(1)}
                  aria-label="Next month"
                  className="grid size-7 place-items-center rounded-md text-ink-dim transition hover:bg-cream hover:text-navy"
                >
                  &#8250;
                </button>
              </div>

              <div
                aria-hidden="true"
                className="mt-1.5 grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold text-ink-faint"
              >
                {DAY_NAMES.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              <div ref={gridRef} onKeyDown={onGridKey} className="mt-0.5 grid grid-cols-7 gap-0.5">
                {cells.map((day, i) => {
                  if (!day) return <span key={`pad-${i}`} />;

                  const key = iso(day);
                  const isBusy = busy.has(key);
                  const isPast = key < floor;
                  const isOn = key === value;
                  const blocked = isBusy || isPast;

                  return (
                    <button
                      key={key}
                      data-day={key}
                      type="button"
                      // One cell in the tab order; the arrows do the rest.
                      tabIndex={key === cursor ? 0 : -1}
                      aria-disabled={blocked || undefined}
                      aria-pressed={isOn}
                      aria-label={isBusy ? `${readable(key)} — already booked` : readable(key)}
                      onFocus={() => setCursor(key)}
                      onClick={() => {
                        if (!blocked) pick(key);
                      }}
                      className={`grid h-8 place-items-center rounded-md text-[13px] transition ${
                        isOn
                          ? 'bg-navy font-bold text-white'
                          : isBusy
                            ? // Tinted and struck through, not filled: a solid gold
                              // day read as the day you had chosen rather than as
                              // the day you cannot have. Colour alone is not a
                              // message to somebody who cannot see this one, so the
                              // line through the number carries it too.
                              'cursor-not-allowed bg-gold/45 font-semibold text-gold-deep ring-1 ring-gold-deep/25 line-through decoration-gold-deep/80 decoration-2'
                            : isPast
                              ? 'cursor-not-allowed text-ink-faint/45'
                              : `text-ink-dim hover:bg-cream hover:text-navy ${
                                  key === today ? 'ring-1 ring-navy/30' : ''
                                }`
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-2">
                <p className="flex items-center gap-1.5 text-[11px] text-ink-faint">
                  <span
                    aria-hidden="true"
                    className="inline-block size-3 rounded-sm ring-1 ring-gold-deep/25 bg-gold/45"
                  />
                  Already booked
                </p>
                {value === '' ? null : (
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      setOpen(false);
                      fieldRef.current?.focus();
                    }}
                    className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-ink-dim transition hover:text-navy"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
