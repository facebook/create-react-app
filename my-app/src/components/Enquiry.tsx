import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { submitEnquiry } from '../lib/enquiry';
import { useFleet } from '../lib/useFleet';
import { useAvailability, busyForVehicle } from '../lib/useAvailability';
import { DatePick } from './DatePick';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; enquiryNumber: string | null }
  | { kind: 'error'; message: string; fields?: Record<string, string> };

const field =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-ink outline-none transition placeholder:text-ink-faint focus:border-navy focus:ring-2 focus:ring-navy/15';
// What "please correct the highlighted fields" means. Border and tint, never
// colour alone: the reason is written under the box as well, and the box
// carries aria-invalid so it is announced rather than merely seen.
const fieldWrong =
  'w-full rounded-xl border border-danger bg-danger/[0.04] px-3.5 py-2.5 text-ink outline-none transition placeholder:text-ink-faint focus:border-danger focus:ring-2 focus:ring-danger/20';
const label = 'block text-sm font-semibold text-ink-dim';

// The server names the field it refused; the form has to know which box that
// is. Only the keys enquiry-submit.php can actually return are here.
const BOX: Record<string, string> = {
  name: 'name',
  phone: 'phone',
  email: 'email',
  pickup_location: 'pickup',
  message: 'message',
  requirements: 'car',
  return_date: 'return',
};

export function Enquiry() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  // A car chosen on the fleet page arrives as ?car=..., so the choice
  // survives the navigation here.
  const fleet = useFleet();
  const cars = fleet.status === 'ready' ? fleet.cars : [];

  const [searchParams] = useSearchParams();
  const [selectedCar, setSelectedCar] = useState(searchParams.get('car') ?? '');

  // Which days are gone. Once a vehicle is chosen it is that vehicle's diary;
  // before then it is only the days on which nothing at all is free, because
  // one car being out says nothing about whether we can help.
  const availability = useAvailability();
  const chosen = cars.find((c) => `${c.brand} ${c.name}`.trim() === selectedCar);
  const busy = busyForVehicle(availability, chosen?.id);

  const [startDate, setStartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: 'sending' });

    const data = new FormData(event.currentTarget);
    const get = (k: string) => String(data.get(k) ?? '').trim();

    const result = await submitEnquiry({
      name: get('name'),
      phone: get('phone'),
      email: get('email'),
      pickupLocation: get('pickup'),
      startDate: get('start'),
      returnDate: get('return'),
      car: get('car'),
      // The id as well as the name, so the panel shows the enquiry against
      // the real vehicle rather than only mentioning it in the notes.
      vehicleId: chosen?.id,
      message: get('message'),
      website: get('website'),
    });

    if (result.ok) {
      setStatus({ kind: 'sent', enquiryNumber: result.enquiryNumber });
      return;
    }

    setStatus({ kind: 'error', message: result.error, fields: result.fields });

    // Highlighting the box is no use to somebody who cannot see it, and no
    // use to anybody if it is off the bottom of the screen. Moving to it does
    // both jobs: it scrolls into view and its reason is read out.
    const first = Object.keys(result.fields ?? {}).find((k) => k in BOX);
    if (first) {
      requestAnimationFrame(() => {
        const el = document.getElementById(BOX[first]);
        // focus() scrolls on its own, abruptly and only just into view. Taking
        // that off it and scrolling deliberately puts the box in the middle,
        // where the reason under it is on screen too.
        el?.focus({ preventScroll: true });
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    }
  }

  if (status.kind === 'sent') {
    return (
      <div
        id="enquire"
        className="scroll-mt-28 rounded-[18px] border border-line bg-white p-8 text-center shadow-[0_18px_44px_rgba(16,24,40,0.10)]"
      >
        <p aria-hidden="true" className="text-4xl">
          ✓
        </p>
        <h2 className="mt-3 text-2xl font-bold text-navy">Enquiry received</h2>
        <p className="mt-2 text-ink-dim">
          Thanks — we'll call you back shortly to confirm availability.
        </p>
        {status.enquiryNumber ? (
          <p className="mt-4 text-sm text-ink-faint">
            Your reference:{' '}
            <span className="font-semibold text-navy">{status.enquiryNumber}</span>
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setStatus({ kind: 'idle' })}
          className="mt-6 rounded-xl border border-line px-5 py-2.5 font-semibold text-ink-dim transition hover:border-navy/40 hover:text-navy"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  const fieldError = (name: string) =>
    status.kind === 'error' ? status.fields?.[name] : undefined;
  const sending = status.kind === 'sending';

  /**
   * Everything a refused box needs, in one place: the red border, the link to
   * its reason, and the flag that makes a screen reader say "invalid". Spread
   * onto the input so none of the three can be forgotten on one field and
   * present on the next.
   */
  const wrong = (key: string) => {
    const message = fieldError(key);
    const id = BOX[key];
    return {
      className: `mt-1.5 ${message ? fieldWrong : field}`,
      'aria-invalid': message ? true : undefined,
      'aria-describedby': message ? `${id}-why` : undefined,
    } as const;
  };

  /** The reason, under the box it belongs to and tied to it by id. */
  const why = (key: string) => {
    const message = fieldError(key);
    if (!message) return null;
    return (
      <p id={`${BOX[key]}-why`} className="mt-1 text-sm font-medium text-danger">
        {message}
      </p>
    );
  };

  return (
    // A card the page places, not a section of its own: /contact stands it in
    // the right-hand column beside the ways to reach us. The id stays here,
    // because /contact#enquire is linked from half the site and has to land
    // on the form rather than on the column holding it.
    <div
      id="enquire"
      className="scroll-mt-28 rounded-[18px] border border-line bg-white p-6 shadow-[0_18px_44px_rgba(16,24,40,0.10)] sm:p-8"
    >
      <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
        Check availability
      </h2>
      <p className="mt-2 text-ink-dim">
        Tell us when you need the car and we'll call you back to confirm.
        Only your name and phone number are required.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-5">
        {/* Honeypot: hidden from people, tempting to bots. */}
        <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
          <label htmlFor="website">Leave this empty</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="name">
              Your name <span className="text-danger">*</span>
            </label>
            <input id="name" name="name" required {...wrong('name')} />
            {why('name')}
          </div>

          <div>
            <label className={label} htmlFor="phone">
              Phone number <span className="text-danger">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              required
              {...wrong('phone')}
            />
            {why('phone')}
          </div>
        </div>

        <div>
          <label className={label} htmlFor="email">
            Email <span className="text-ink-faint">(optional)</span>
          </label>
          <input id="email" name="email" type="email" {...wrong('email')} />
          {why('email')}
        </div>

        {cars.length === 0 ? null : (
        <div>
          <label className={label} htmlFor="car">
            Car you're interested in
          </label>
          <select
            id="car"
            name="car"
            value={selectedCar}
            onChange={(e) => setSelectedCar(e.target.value)}
            {...wrong('requirements')}
          >
            <option value="">No preference</option>
            {cars.map((c) => (
              <option key={c.id} value={`${c.brand} ${c.name}`}>
                {c.brand} {c.name}
              </option>
            ))}
          </select>
          {why('requirements')}
        </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label} id="start-label" htmlFor="start">
              Pickup date
            </label>
            <div className="mt-1.5">
              <DatePick
                id="start"
                name="start"
                labelledBy="start-label"
                value={startDate}
                onChange={(next) => {
                  setStartDate(next);
                  // A return before the pickup is not a date anyone meant.
                  if (returnDate !== '' && returnDate < next) setReturnDate(next);
                }}
                busy={busy}
              />
            </div>
          </div>
          <div>
            <label className={label} id="return-label" htmlFor="return">
              Return date
            </label>
            <div className="mt-1.5">
              <DatePick
                id="return"
                name="return"
                labelledBy="return-label"
                value={returnDate}
                onChange={setReturnDate}
                busy={busy}
                min={startDate || undefined}
                invalid={fieldError('return_date') !== undefined}
                describedBy={fieldError('return_date') ? 'return-why' : undefined}
              />
            </div>
            {why('return_date')}
          </div>
        </div>

        <div>
          <label className={label} htmlFor="pickup">
            Pickup location
          </label>
          <input id="pickup" name="pickup" {...wrong('pickup_location')} />
          {why('pickup_location')}
        </div>

        <div>
          <label className={label} htmlFor="message">
            {cars.length === 0
              ? 'What kind of car do you need?'
              : 'Anything else?'}
          </label>
          <textarea id="message" name="message" rows={3} {...wrong('message')} />
          {why('message')}
        </div>

        {status.kind === 'error' ? (
          <p role="alert" className="rounded-xl bg-danger/8 px-4 py-3 text-sm text-danger">
            {status.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={sending}
          className="rounded-xl bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          {sending ? 'Sending…' : 'Send enquiry'}
        </button>
      </form>
    </div>
  );
}
