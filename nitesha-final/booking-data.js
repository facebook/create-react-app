// Shared booking/rental-management data layer used by admin.html.
// Same localStorage-backed pattern as car-data.js — see the note there about
// this being client-side only (no shared backend yet).

const BOOKING_STORE_KEY = 'nitesha_bookings_v1';

// Booking lifecycle. 'Confirmed'/'Active' bookings block double-booking;
// 'Completed'/'Cancelled' do not.
const BOOKING_STATUSES = ['Confirmed', 'Active', 'Completed', 'Cancelled'];
const BLOCKING_STATUSES = ['Confirmed', 'Active'];

// Payment types recorded against a booking's rental balance. Security
// deposit and its refund are tracked completely separately (see
// booking.securityDeposit / booking.depositRefund) and must never be summed
// into these — deposit money is not rental revenue.
const PAYMENT_TYPES = ['advance', 'balance', 'additional', 'extra_km'];
const PAYMENT_TYPE_LABELS = {
  advance: 'Advance',
  balance: 'Balance',
  additional: 'Additional Payment',
  extra_km: 'Extra KM',
};

function loadBookings() {
  try {
    const raw = localStorage.getItem(BOOKING_STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem(BOOKING_STORE_KEY, JSON.stringify(bookings));
}

function getBooking(id) {
  return loadBookings().find((b) => b.id === id) || null;
}

function updateBooking(id, updater) {
  const bookings = loadBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  bookings[idx] = updater({ ...bookings[idx] });
  saveBookings(bookings);
  return bookings[idx];
}

// ---- Booking number: NSC-{year}-{0001, 0002, ...} ----
function generateBookingNumber(bookings, year = new Date().getFullYear()) {
  const prefix = `NSC-${year}-`;
  const usedNumbers = bookings
    .map((b) => b.bookingNumber)
    .filter((num) => typeof num === 'string' && num.startsWith(prefix))
    .map((num) => parseInt(num.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (usedNumbers.length ? Math.max(...usedNumbers) : 0) + 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

// ---- Date/time helpers ----
function combineDateTime(dateStr, timeStr) {
  if (!dateStr) return null;
  return new Date(`${dateStr}T${timeStr || '00:00'}:00`);
}

function calcRentalDurationDays(startDate, startTime, returnDate, returnTime) {
  const start = combineDateTime(startDate, startTime);
  const end = combineDateTime(returnDate, returnTime);
  if (!start || !end || end <= start) return 1;
  return Math.max(1, Math.ceil((end - start) / (24 * 60 * 60 * 1000)));
}

// ---- Schedule state (derived from the clock, never stored) ----
// booking.status records what has actually *happened* (pickup and return are
// only set when someone records them, with odometer readings). This derives
// where the booking stands against its scheduled dates, so a booking whose
// start time has passed stops reading as a plain "Confirmed".
//
// It is deliberately not written back to booking.status: flipping a booking to
// Active without a pickup would invent a rental that never started and leave
// startKm empty, which silently breaks every extra-KM calculation.
const SCHEDULE_TONES = { neutral: 'neutral', due: 'due', live: 'live', late: 'late' };

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function bookingScheduleState(booking, now = new Date()) {
  if (booking.status === 'Cancelled' || booking.status === 'Completed') return null;

  const start = combineDateTime(booking.startDate, booking.startTime);
  const end = combineDateTime(booking.returnDate, booking.returnTime);
  if (!start || !end) return null;

  // Vehicle already back — waiting on final charges and completion.
  if (booking.return) {
    return { key: 'awaiting-completion', label: 'Awaiting Completion', tone: SCHEDULE_TONES.due };
  }

  // Vehicle is out with the customer.
  if (booking.pickup) {
    if (now > end) return { key: 'overdue-return', label: 'Overdue Return', tone: SCHEDULE_TONES.late };
    if (isSameDay(now, end)) return { key: 'due-back', label: 'Due Back Today', tone: SCHEDULE_TONES.due };
    return { key: 'on-rent', label: 'On Rent', tone: SCHEDULE_TONES.live };
  }

  // Not picked up yet.
  if (now > end) return { key: 'not-collected', label: 'Not Collected', tone: SCHEDULE_TONES.late };
  if (now >= start) return { key: 'overdue-pickup', label: 'Awaiting Pickup', tone: SCHEDULE_TONES.late };
  if (isSameDay(now, start)) return { key: 'starts-today', label: 'Starts Today', tone: SCHEDULE_TONES.due };
  return { key: 'upcoming', label: 'Upcoming', tone: SCHEDULE_TONES.neutral };
}

// Overlap check for double-booking protection. Two ranges overlap when
// startA < endB AND startB < endA. excludeBookingId lets an edit compare
// against every *other* booking without flagging itself.
function isVehicleDoubleBooked(vehicleId, startDate, startTime, returnDate, returnTime, excludeBookingId = null) {
  const newStart = combineDateTime(startDate, startTime);
  const newEnd = combineDateTime(returnDate, returnTime);
  if (!newStart || !newEnd) return false;

  return loadBookings().some((b) => {
    if (b.id === excludeBookingId) return false;
    if (b.vehicleId !== vehicleId) return false;
    if (!BLOCKING_STATUSES.includes(b.status)) return false;
    const existingStart = combineDateTime(b.startDate, b.startTime);
    const existingEnd = combineDateTime(b.returnDate, b.returnTime);
    if (!existingStart || !existingEnd) return false;
    return newStart < existingEnd && existingStart < newEnd;
  });
}

// ---- KM / charge calculations (point 7) ----
function computeAllowedKm(rentalDurationDays, kmLimitPerDay) {
  return Math.max(0, rentalDurationDays) * Math.max(0, kmLimitPerDay);
}

function computeExtraKm(totalKm, allowedKm) {
  return Math.max(0, totalKm - allowedKm);
}

function computeExtraKmCharge(extraKm, extraKmRate) {
  return extraKm * Math.max(0, extraKmRate);
}

function computeTotalKm(booking) {
  if (!booking.pickup || !booking.return) return 0;
  return Math.max(0, booking.return.endKm - booking.pickup.startKm);
}

function computeExtraKmForBooking(booking) {
  const totalKm = computeTotalKm(booking);
  const allowedKm = computeAllowedKm(booking.rentalDurationDays, booking.kmLimitPerDay);
  const extraKm = computeExtraKm(totalKm, allowedKm);
  const extraKmCharge = computeExtraKmCharge(extraKm, booking.extraKmRate);
  return { totalKm, allowedKm, extraKm, extraKmCharge };
}

// ---- Payments (rental revenue only — never security deposit) ----
function rentalPaymentsTotal(booking) {
  return (booking.payments || []).reduce((sum, p) => sum + p.amount, 0);
}

// The amount actually owed for the rental, including any extra-KM charge
// once the vehicle has been returned and KM calculated.
function rentalAmountDue(booking) {
  const { extraKmCharge } = booking.return ? computeExtraKmForBooking(booking) : { extraKmCharge: 0 };
  return booking.rentalAmount + extraKmCharge;
}

function rentalBalanceDue(booking) {
  return rentalAmountDue(booking) - rentalPaymentsTotal(booking);
}

function addPayment(bookingId, payment) {
  return updateBooking(bookingId, (booking) => {
    booking.payments = [...(booking.payments || []), { ...payment, id: Date.now(), recordedAt: new Date().toISOString() }];
    pushTimeline(booking, `${PAYMENT_TYPE_LABELS[payment.type] || 'Payment'} received — ${formatINR(payment.amount)}`);
    return booking;
  });
}

function deletePayment(bookingId, paymentId) {
  return updateBooking(bookingId, (booking) => {
    booking.payments = (booking.payments || []).filter((p) => p.id !== paymentId);
    return booking;
  });
}

// ---- Security deposit (tracked separately — not rental revenue) ----
function setSecurityDeposit(bookingId, deposit) {
  return updateBooking(bookingId, (booking) => {
    booking.securityDeposit = { ...deposit, recordedAt: new Date().toISOString() };
    pushTimeline(booking, `Security deposit received — ${formatINR(deposit.amount)}`);
    return booking;
  });
}

function setDepositRefund(bookingId, refund) {
  return updateBooking(bookingId, (booking) => {
    const refundAmount = (booking.securityDeposit?.amount || 0) - refund.deduction;
    booking.depositRefund = { ...refund, refundAmount, recordedAt: new Date().toISOString() };
    pushTimeline(booking, `Security deposit refunded — ${formatINR(refundAmount)}`);
    return booking;
  });
}

// ---- Pickup / Return ----
function setPickup(bookingId, pickup) {
  return updateBooking(bookingId, (booking) => {
    booking.pickup = { ...pickup, recordedAt: new Date().toISOString() };
    booking.status = 'Active';
    pushTimeline(booking, `Vehicle picked up — ${pickup.startKm.toLocaleString('en-IN')} km`);
    return booking;
  });
}

function setReturn(bookingId, returnData) {
  return updateBooking(bookingId, (booking) => {
    booking.return = { ...returnData, recordedAt: new Date().toISOString() };
    pushTimeline(booking, `Vehicle returned — ${returnData.endKm.toLocaleString('en-IN')} km`);
    const { extraKm, extraKmCharge } = computeExtraKmForBooking(booking);
    if (extraKm > 0) {
      pushTimeline(booking, `Extra KM calculated — ${extraKm.toLocaleString('en-IN')} km (${formatINR(extraKmCharge)})`);
    } else {
      pushTimeline(booking, 'KM calculated — within allowed limit');
    }
    return booking;
  });
}

function completeBooking(bookingId) {
  return updateBooking(bookingId, (booking) => {
    booking.status = 'Completed';
    pushTimeline(booking, 'Booking completed');
    return booking;
  });
}

function cancelBooking(bookingId) {
  return updateBooking(bookingId, (booking) => {
    booking.status = 'Cancelled';
    pushTimeline(booking, 'Booking cancelled');
    return booking;
  });
}

function pushTimeline(booking, event) {
  booking.timeline = [...(booking.timeline || []), { event, at: new Date().toISOString() }];
}

// ---- Create / edit ----
function createBooking(data) {
  const bookings = loadBookings();
  const booking = {
    id: Date.now(),
    bookingNumber: generateBookingNumber(bookings),
    status: 'Confirmed',
    payments: [],
    securityDeposit: null,
    depositRefund: null,
    pickup: null,
    return: null,
    timeline: [{ event: 'Booking created', at: new Date().toISOString() }],
    createdAt: new Date().toISOString(),
    ...data,
  };
  saveBookings([booking, ...bookings]);
  return booking;
}

function updateBookingDetails(bookingId, data) {
  return updateBooking(bookingId, (booking) => {
    const updated = { ...booking, ...data };
    pushTimeline(updated, 'Booking details updated');
    return updated;
  });
}

function deleteBooking(bookingId) {
  saveBookings(loadBookings().filter((b) => b.id !== bookingId));
}
