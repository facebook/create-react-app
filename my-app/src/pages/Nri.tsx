import { Link } from 'react-router-dom';
import seo from '../data/seo.json';
import { PageHeader } from './PageHeader';
import { Reveal } from '../components/Reveal';
import { AreasServed } from '../components/AreasServed';
import { WhatsAppButton } from '../components/WhatsAppButton';

/**
 * For visitors coming from abroad.
 *
 * Kanyakumari district sends a lot of people to the Gulf, Singapore and
 * Malaysia, and they come back for weddings, the December holidays and family
 * occasions. Their problems are not a local customer's problems: they are
 * booking months ahead from another country, landing at an airport in a
 * different state, and often need a vehicle for weeks rather than days.
 *
 * The offers here are deliberately written without figures. The owner chose
 * to give a long-stay discount and airport pickup, but has not set the terms,
 * and a percentage on a live page is a promise a customer can hold them to.
 * Add the numbers once they are decided.
 */

const steps = [
  {
    heading: 'Tell us your dates before you fly',
    body: 'Send us your arrival and return dates on WhatsApp. We will confirm what is free and hold a vehicle for you. Nothing is paid until you are here.',
  },
  {
    heading: 'We meet you at the airport',
    body: 'Trivandrum International is the nearest airport to Nagercoil, about two hours away, and most flights from the Gulf and Singapore land there. We can have the car waiting when you clear customs, or send a driver to bring you home. Madurai and Tuticorin work too — tell us where you are landing.',
  },
  {
    heading: 'Keep it as long as you need',
    body: 'Most people visiting family stay for weeks, not days. Our daily rate comes down for longer rentals, so a fortnight or a month costs considerably less per day than a weekend. See monthly rental for how that works, and ask us for the long-stay rate when you enquire.',
  },
  {
    heading: 'Drop it back when you leave',
    body: 'Return the vehicle at our place, at your house, or at the airport on your way out. Whichever is least trouble on the day you are flying.',
  },
];

const licence = [
  'An Indian driving licence works as it is, provided it has not expired.',
  'A licence from another country needs an International Driving Permit alongside it — carry both.',
  'Bring your passport, and your visa or OCI card, as photo identification.',
  'Send us a photo of your licence on WhatsApp before you travel and we will confirm it is fine, rather than you finding out at the counter.',
];

export function Nri() {
  const waDates =
    'Hello, I am coming from abroad and would like to book a vehicle. My arrival date is ___ and I need it until ___.';

  return (
    <>
      <PageHeader
        photo="nri-hero"
        imageAlt="A rental car ready for an NRI visitor arriving in Kanyakumari district"
        scene="/nri"
        title="Coming home from abroad?"
        intro={`Arrange self drive car rental, or a bike, before you land. We look after families visiting ${seo.site.district} district from the Gulf, Singapore, Malaysia and further afield.`}
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        <Reveal>
          <p className="leading-relaxed text-ink-dim">
            Coming back for a wedding, for the December holidays, or just to
            see family — the last thing you want after a night flight is to
            start hunting for a vehicle. Sort it out from where you are now,
            and it will be ready when you arrive.
          </p>
        </Reveal>

        <div className="mt-10 space-y-8">
          {steps.map((s, i) => (
            <Reveal key={s.heading} delay={i * 70}>
              <h2 className="text-xl font-semibold text-navy">{s.heading}</h2>
              <p className="mt-2 leading-relaxed text-ink-dim">{s.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={80}>
          <div className="mt-12 rounded-[14px] border border-line bg-white p-6 shadow-[0_10px_30px_rgba(16,24,40,0.08)]">
            <h2 className="text-xl font-semibold text-navy">
              Licence and documents
            </h2>
            <p className="mt-2 text-ink-dim">
              Worth checking before you travel rather than after you land:
            </p>
            <ul className="mt-4 space-y-2.5">
              {licence.map((l) => (
                <li key={l} className="flex gap-2.5 text-ink-dim">
                  <span aria-hidden="true" className="bullet-dot" />
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-8 rounded-[14px] border border-line bg-cream p-6">
            <h2 className="text-xl font-semibold text-navy">
              Booking a wedding from abroad
            </h2>
            <p className="mt-2 leading-relaxed text-ink-dim">
              If the trip is for a wedding, tell us early. Muhurtham dates fill
              up months ahead, and families usually need more than one vehicle —
              a decorated car for the couple and others for relatives arriving
              from out of town. We can arrange the lot together so it is one
              conversation rather than five.
            </p>
            <Link
              to="/wedding-cars"
              className="group mt-4 inline-flex items-center gap-1 font-semibold text-gold-deep"
            >
              About our wedding cars
              <span aria-hidden="true" className="transition group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-10 rounded-[14px] border border-line bg-white p-8 text-center shadow-[0_10px_30px_rgba(16,24,40,0.08)]">
            <h2 className="text-xl font-semibold text-navy">
              WhatsApp is easiest
            </h2>
            <p className="mx-auto mt-2 max-w-md text-ink-dim">
              It costs you nothing from abroad and we can reply whatever the
              time difference. Send your dates and we will take it from there.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <WhatsAppButton message={waDates}>
                Message us on WhatsApp
              </WhatsAppButton>
              <a
                href={`tel:${seo.site.phone}`}
                className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 font-semibold text-ink-dim transition hover:border-navy/40 hover:text-navy"
              >
                Call +91 63749 42976
              </a>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-faint">
              Dialling from abroad? The full number is +91 63749 42976.
            </p>
          </div>
        </Reveal>
      </section>

      <AreasServed />
    </>
  );
}
