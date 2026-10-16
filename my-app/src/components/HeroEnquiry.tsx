import { useState, type FormEvent } from 'react';
import { submitEnquiry } from '../lib/enquiry';
import { useFleet } from '../lib/useFleet';
import { useAvailability, busyForVehicle } from '../lib/useAvailability';
import { DatePick } from './DatePick';
import { WhatsAppButton } from './WhatsAppButton';

/**
 * The short enquiry card in the home page banner.
 *
 * Deliberately not the full form from the contact page. Name, number, the two
 * dates and which car -- asking for an email and a pickup point on a banner is
 * asking for choices nobody has made yet, and the usual answer to that is to
 * close the tab.
 *
 * The car is a single tap on a list that is already there, and it changes the
 * call back from "what would you like?" to "yes, that one is free" -- so it
 * earns its place beside the number, which needs ten digits and no more.
 * It disappears when the fleet cannot be reached, because an empty dropdown
 * asks a question with no answers.
 *
 * The rest of the detail is gathered on the phone, or on /contact by whoever
 * would rather type it. Both land in the same place.
 *
 * The dates use the site's own picker, the same one the contact form uses.
 * They were native date boxes, for weight: this card sits in the part of the
 * page the browser measures for loading speed. But a native box opens the
 * browser's calendar, and the browser's calendar does not know that the car
 * they have just chosen is out that weekend -- so the first this person heard
 * of it was the call back. The picker only puts a month in the page once it is
 * opened, which is what makes it affordable here.
 */
const box =
  'w-full rounded-lg border border-line bg-white px-3 py-1.5 text-[14px] text-ink outline-none transition ' +
  'placeholder:text-ink-faint focus:border-navy focus:ring-2 focus:ring-navy/15 sm:py-2';
const cap = 'block text-[11px] font-semibold text-ink-dim mb-0.5 sm:text-[12px] sm:mb-1';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; ref: string | null }
  | { kind: 'error'; message: string };

export function HeroEnquiry({ title, note }: { title: string; note: string }) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [start, setStart] = useState('');
  const [back, setBack] = useState('');

  const fleet = useFleet();
  const cars = fleet.status === 'ready' ? fleet.cars : [];
  const [car, setCar] = useState('');
  const chosen = cars.find((c) => c.id === car);

  // That vehicle's diary once one is chosen; before then, only the days on
  // which nothing at all is free -- one car being out says nothing about
  // whether we can help.
  const busy = busyForVehicle(useAvailability(), chosen?.id);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: 'sending' });

    const data = new FormData(event.currentTarget);
    const get = (k: string) => String(data.get(k) ?? '').trim();

    const result = await submitEnquiry({
      name: get('name'),
      phone: get('phone'),
      startDate: get('start'),
      returnDate: get('return'),
      // Both: the id so the panel shows the enquiry against the real vehicle,
      // the name so it still reads correctly if that vehicle is ever sold.
      car: chosen ? `${chosen.brand} ${chosen.name}`.trim() : '',
      vehicleId: chosen?.id,
      message: 'Sent from the home page banner.',
      website: get('website'),
    });

    if (result.ok) {
      setStatus({ kind: 'sent', ref: result.enquiryNumber });
      return;
    }

    // The server's 422 is "Please correct the highlighted fields", and this
    // card highlights nothing -- four boxes do not need it. What is useful is
    // the per-field reason underneath, so that is what gets shown.
    const reasons = Object.values(result.fields ?? {});
    setStatus({
      kind: 'error',
      message: reasons.length ? reasons.join(' ') : result.error,
    });
  }

  if (status.kind === 'sent') {
    return (
      <div className="hero-card rounded-2xl bg-white p-5 text-center sm:p-6">
        <p aria-hidden="true" className="text-3xl text-ok">✓</p>
        <h2 className="mt-2 text-xl font-bold text-navy">We have it</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-dim">
          We will call you back shortly to confirm what is free on those dates.
        </p>
        {status.ref ? (
          <p className="mt-3 text-[13px] text-ink-faint">
            Your reference <span className="font-semibold text-navy">{status.ref}</span>
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setStatus({ kind: 'idle' })}
          className="mt-5 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink-dim transition hover:border-navy/40 hover:text-navy"
        >
          Send another
        </button>
      </div>
    );
  }

  const sending = status.kind === 'sending';

  return (
    <div className="hero-card rounded-2xl bg-white p-3.5 sm:p-5">
      <h2 className="text-[16px] font-bold text-navy sm:text-[17px]">{title}</h2>
      <p className="mt-0.5 text-[12px] leading-snug text-ink-dim">{note}</p>

      <form onSubmit={handleSubmit} className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5" noValidate={false}>
        <div>
          <label className={cap} htmlFor="heroName">Your name</label>
          <input id="heroName" name="name" required autoComplete="name"
                 placeholder="Name" className={box} />
        </div>

        {/* A number is ten digits wide whatever box it is in, so the room it
            was taking goes to the car instead. Without a fleet to choose from
            it keeps the whole row, rather than sitting oddly at two fifths of
            it beside nothing. */}
        <div className={cars.length ? 'grid grid-cols-5 gap-2 sm:gap-2.5' : ''}>
          <div className={cars.length ? 'col-span-2' : ''}>
            <label className={cap} htmlFor="heroPhone">Phone</label>
            <input id="heroPhone" name="phone" required type="tel" inputMode="tel"
                   autoComplete="tel" placeholder="10-digit" className={box} />
          </div>

          {cars.length ? (
            <div className="col-span-3">
              <label className={cap} htmlFor="heroCar">Vehicle</label>
              <select id="heroCar" name="car" value={car}
                      onChange={(e) => setCar(e.target.value)}
                      className={`${box} pr-7`}>
                <option value="">Any vehicle</option>
                {cars.map((c) => (
                  <option key={c.id} value={c.id}>{`${c.brand} ${c.name}`.trim()}</option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          <div>
            <label className={cap} id="heroStartLabel" htmlFor="heroStart">Pick up</label>
            <DatePick
              id="heroStart"
              name="start"
              size="sm"
              placeholder="Date"
              labelledBy="heroStartLabel"
              value={start}
              busy={busy}
              onChange={(next) => {
                setStart(next);
                // A return before the pickup is not a date anyone meant.
                if (back !== '' && next !== '' && back < next) setBack(next);
              }}
            />
          </div>
          <div>
            <label className={cap} id="heroReturnLabel" htmlFor="heroReturn">Return</label>
            {/* Never before the pickup: the calendar will not offer it, so a
                wrong pair cannot be sent and then argued about on the phone. */}
            <DatePick
              id="heroReturn"
              name="return"
              size="sm"
              placeholder="Date"
              labelledBy="heroReturnLabel"
              value={back}
              busy={busy}
              onChange={setBack}
              min={start || undefined}
            />
          </div>
        </div>

        {/* Bots fill this in; people never see it. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off"
               aria-hidden="true" className="hidden" />

        {status.kind === 'error' ? (
          <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-[13px] text-danger">
            {status.message}
          </p>
        ) : null}

        {/* Two ways to ask, side by side rather than stacked: they are
            alternatives, not steps, and a column of two full-width buttons
            reads as the second one being what you do after the first.
            WhatsApp on the left, in its own green, because for a lot of
            people it is the only one they would use -- and the form's own
            button on the right, where the thumb ends up. */}
        <div className="mt-0.5 grid grid-cols-2 gap-2">
          <WhatsAppButton
            message="Hello, I would like to check availability for a self-drive vehicle."
            className="w-full rounded-lg px-2 py-2.5 text-[13px] whitespace-nowrap sm:text-[14px]"
          >
            WhatsApp
          </WhatsAppButton>

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-lg bg-navy px-2 py-2.5 text-[13px] font-semibold whitespace-nowrap text-white transition hover:bg-navy-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:opacity-60 sm:text-[14px]"
          >
            {sending ? 'Sending…' : 'Check availability'}
          </button>
        </div>

        {/* On a phone this said the same thing as the line under the heading,
            twice, in a card fighting for the first screen. The one kept is the
            one the owner can edit; this is the one written into the code. */}
        <p className="hidden text-center text-[11px] leading-snug text-ink-faint sm:block">
          No payment now. We call you back to confirm.
        </p>
      </form>
    </div>
  );
}
