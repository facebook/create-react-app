// Booking vocabulary and the schedule state shown beside a booking's status.
//
// Bookings themselves live on the server; nothing here reads or writes
// storage. What remains is the shared vocabulary the panel renders with, and
// one derivation the server has no reason to compute: where a booking stands
// against the clock right now.

const BOOKING_STATUSES = ['Enquiry', 'Confirmed', 'Ready', 'Active', 'Returned', 'Completed', 'Cancelled'];

const PAYMENT_TYPES = ['advance', 'balance', 'additional', 'extra_km'];
const PAYMENT_TYPE_LABELS = {
  advance: 'Advance',
  balance: 'Balance',
  additional: 'Additional Payment',
  extra_km: 'Extra KM',
};

// The three lists the server validates against, written once here rather
// than in each <select> that offers them. src/booking.php holds the same
// values and refuses anything else; these are what the edit dialogs build
// their dropdowns from.
const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];
const FUEL_LEVELS     = ['Full', '3/4', '1/2', '1/4', 'Empty'];
const EXTRA_KINDS     = [
  ['cleaning', 'Cleaning'],
  ['fuel', 'Fuel'],
  ['damage', 'Damage'],
  ['late', 'Late return'],
  ['other', 'Other'],
];

const SCHEDULE_TONES = { neutral: 'neutral', due: 'due', live: 'live', late: 'late' };

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

/**
 * Where a booking stands against its dates, derived from the recorded status
 * and the clock.
 *
 * This is deliberately separate from booking.status. Status records what has
 * actually happened — a booking only becomes Active when someone records a
 * pickup with an odometer reading. Letting the clock flip that would invent a
 * rental that never started and leave the extra-KM charge computing from a
 * missing starting reading.
 */
function bookingScheduleState(booking, now = new Date()) {
  if (booking.status === 'Cancelled' || booking.status === 'Completed') return null;

  const start = new Date(String(booking.start_at).replace(' ', 'T'));
  const end = new Date(String(booking.return_at).replace(' ', 'T'));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  // Back on the lot, waiting for final charges and completion.
  if (booking.status === 'Returned') {
    return { key: 'awaiting-completion', label: 'Awaiting Completion', tone: SCHEDULE_TONES.due };
  }

  // Out with the customer.
  if (booking.status === 'Active') {
    if (now > end) return { key: 'overdue-return', label: 'Overdue Return', tone: SCHEDULE_TONES.late };
    if (isSameDay(now, end)) return { key: 'due-back', label: 'Due Back Today', tone: SCHEDULE_TONES.due };
    return { key: 'on-rent', label: 'On Rent', tone: SCHEDULE_TONES.live };
  }

  // Booked but not yet collected.
  if (now > end) return { key: 'not-collected', label: 'Not Collected', tone: SCHEDULE_TONES.late };
  if (now >= start) return { key: 'overdue-pickup', label: 'Awaiting Pickup', tone: SCHEDULE_TONES.late };
  if (isSameDay(now, start)) return { key: 'starts-today', label: 'Starts Today', tone: SCHEDULE_TONES.due };
  return { key: 'upcoming', label: 'Upcoming', tone: SCHEDULE_TONES.neutral };
}

/**
 * The chip markup, kept next to the state it renders so the two cannot drift.
 * Returns an empty string when there is nothing useful to say — a completed
 * or cancelled booking has no live schedule position.
 */
function scheduleChipHTML(booking, { quiet = false } = {}) {
  const state = bookingScheduleState(booking);
  if (!state) return '';

  // quiet drops the one state that says nothing. The chip is here to show a
  // booking whose real position has drifted from its recorded status --
  // overdue, due back, not collected. "Upcoming" is the absence of drift, and
  // beside a Confirmed booking it is the same fact twice. The list asks for
  // quiet because there it costs a column ninety pixels, which is the
  // difference between a booking on one line and a booking on two; the record
  // and the dashboard card have the room and still show it.
  if (quiet && state.key === 'upcoming') return '';

  return `<span class="sched-chip sched-${state.tone}" title="Derived from the booking dates">${state.label}</span>`;
}
