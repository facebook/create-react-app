import { Link } from 'react-router-dom';
import seo from '../data/seo.json';
import { PageHeader } from './PageHeader';
import { Reveal } from '../components/Reveal';
import { AreasServed } from '../components/AreasServed';
import { WhatsAppButton } from '../components/WhatsAppButton';

/**
 * Monthly hire.
 *
 * A separate page because it is a separate search: "monthly car rental
 * Nagercoil" is not the same query as "self drive car rental Nagercoil", and
 * the competitor ranking above us has a page for it.
 *
 * As on the NRI page, no figures. The owner has not set monthly rates, and a
 * number here is a promise a customer can hold them to.
 */

const audiences = [
  {
    title: 'Families visiting from abroad',
    body: 'Home for a month or two and need a car the whole time. Works out far cheaper than renting by the day, and the vehicle stays yours for the stay.',
  },
  {
    title: 'Work postings and projects',
    body: 'Sent to the district for a few months and would rather not ship a car down. Monthly rental covers it without a purchase or a lease.',
  },
  {
    title: 'Between vehicles',
    body: 'Car being repaired, sold, or waiting on delivery. A month on rental fills the gap without a hurried decision.',
  },
  {
    title: 'Extended family visits',
    body: 'Relatives staying for a season, a wedding stretching over weeks, or an elder needing regular hospital trips.',
  },
];

const rateFactors = [
  'Which vehicle — a hatchback, a sedan, an SUV or a 7 seater',
  'Manual or automatic',
  'How long you keep it: the daily rate falls as the rental lengthens',
  'Time of year — festival and wedding seasons are busier',
  'Where in the district you want it delivered and collected',
];

const practical = [
  {
    q: 'How many kilometres are included?',
    a: 'Monthly rentals carry a monthly allowance rather than a daily one, so a long drive one week and none the next evens out. Anything past the allowance is charged at the extra-KM rate, which we tell you before you take the car.',
  },
  {
    q: 'Who services the car during the month?',
    a: 'We do. If a service falls due while you have it, we arrange it and, where we can, give you something else to drive meanwhile so you are not left without.',
  },
  {
    q: 'What if something goes wrong?',
    a: 'Call us. Breakdowns are ours to sort out, not yours — that is the point of renting rather than buying. For anything major we will get you into another vehicle.',
  },
  {
    q: 'Can I extend if my plans change?',
    a: 'Usually yes, and it is easier if you tell us early — the vehicle may be booked after you. A quick message as soon as you know is enough.',
  },
  {
    q: 'What deposit is needed?',
    a: 'A refundable deposit, higher than a daily rental because the vehicle is with you longer. It comes back when the car does, less any extra-KM charges or damage.',
  },
  {
    q: 'What do I need to bring?',
    a: 'A valid driving licence and government photo ID. Coming from abroad, see the notes on licences for visitors.',
  },
];

export function Monthly() {
  const wa =
    'Hello, I would like monthly car rental. I need a vehicle from ___ for about ___ month(s).';

  return (
    <>
      <PageHeader
        photo="monthly-hero"
        imageAlt="A car on monthly rental parked at a home in Nagercoil"
        scene="/monthly"
        title="Monthly car rental in Nagercoil"
        intro={`Need a car for weeks rather than days? Monthly self drive rental across ${seo.site.district} district — hatchbacks, sedans, SUVs and 7 seater vehicles.`}
      />

      <section className="mx-auto max-w-[86rem] px-5 py-16 sm:px-8 lg:px-12">
        <Reveal>
          <p className="leading-relaxed text-ink-dim">
            Renting by the day adds up quickly. Once you need a vehicle for more
            than a couple of weeks, a monthly rate is a different and much
            cheaper arrangement — and you keep the same car throughout rather
            than starting again every few days.
          </p>
        </Reveal>

        <Reveal delay={60}>
          <h2 className="mt-12 text-2xl font-bold tracking-tight text-navy">
            Who takes a car by the month
          </h2>
        </Reveal>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {audiences.map((a, i) => (
            <Reveal key={a.title} delay={i * 70}>
              <div
                data-lift=""
                className="h-full rounded-[14px] border border-line bg-white p-5 shadow-[0_10px_30px_rgba(16,24,40,0.08)]"
              >
                <h3 className="font-semibold text-navy">{a.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{a.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={60}>
          <div className="mt-12 rounded-[14px] border border-line bg-cream p-6">
            <h2 className="text-xl font-semibold text-navy">
              What decides your monthly rate
            </h2>
            <p className="mt-2 text-ink-dim">
              We quote per booking rather than publishing one figure, because
              these change what it costs:
            </p>
            <ul className="mt-4 space-y-2.5">
              {rateFactors.map((f) => (
                <li key={f} className="flex gap-2.5 text-ink-dim">
                  <span aria-hidden="true" className="bullet-dot" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-ink-faint">
              Tell us the vehicle and the dates and you will have a figure the
              same day — no obligation.
            </p>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <h2 className="mt-12 text-2xl font-bold tracking-tight text-navy">
            The things people actually ask
          </h2>
        </Reveal>
        <dl className="mt-6 space-y-6">
          {practical.map((p, i) => (
            <Reveal key={p.q} delay={i * 55}>
              <dt className="font-semibold text-navy">{p.q}</dt>
              <dd className="mt-1.5 leading-relaxed text-ink-dim">{p.a}</dd>
            </Reveal>
          ))}
        </dl>

        <Reveal delay={60}>
          <div className="mt-12 rounded-[14px] border border-line bg-white p-8 text-center shadow-[0_10px_30px_rgba(16,24,40,0.08)]">
            <h2 className="text-xl font-semibold text-navy">
              Ask about monthly rates
            </h2>
            <p className="mx-auto mt-2 max-w-md text-ink-dim">
              Tell us the vehicle you have in mind and how long you need it.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <WhatsAppButton message={wa}>Ask on WhatsApp</WhatsAppButton>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-xl bg-navy px-5 py-2.5 font-semibold text-white transition hover:bg-navy/90"
              >
                Send an enquiry
              </Link>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-ink-faint">
              Visiting from abroad?{' '}
              <Link to="/nri" className="font-semibold text-navy hover:text-gold-deep">
                We can have it waiting at the airport
              </Link>
              . Based in the district headquarters?{' '}
              <Link to="/monthly/nagercoil" className="font-semibold text-navy hover:text-gold-deep">
                Monthly rental in Nagercoil
              </Link>{' '}
              covers how it works there.
            </p>
          </div>
        </Reveal>
      </section>

      <AreasServed />
    </>
  );
}
