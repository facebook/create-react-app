import { Link } from 'react-router-dom';
import modelData from '../data/models.json';
import { Fleet } from '../components/Fleet';
import { Reveal } from '../components/Reveal';
import { PageHeader } from './PageHeader';

/**
 * The fleet listing, with something said before the grid.
 *
 * It used to be the banner and then six cards, which is about three hundred
 * words of which most are "5 seats · Petrol · Manual" repeated six times --
 * a page that says almost nothing in its own voice on the address people
 * search for when they want a car here. The section below is the part of the
 * conversation that happens on the phone every time: which one, and what is
 * included.
 */

/** How the vehicles group, in the terms somebody choosing actually uses. */
const CHOOSING = [
  {
    heading: 'Two or three of you, staying around town',
    body:
      'A hatchback. It is the cheapest to rent and the cheapest to fuel, it parks where the bigger vehicles cannot, and for the distances inside this district there is nothing it will not do comfortably.',
  },
  {
    heading: 'You would rather not use a clutch',
    body:
      'The automatic. It is the one visitors home from abroad ask for and the one to take if Nagercoil traffic at six in the evening is not something you want to think about. There is normally one rather than six, so ask early.',
  },
  {
    heading: 'Six or seven, or real luggage',
    body:
      'A seven-seater. Petrol if you are staying in the district and watching the fuel bill, diesel if the day involves a long highway run or a full load. Five adults with a week of luggage is the point at which a hatchback stops being the right answer.',
  },
];

/** What every rental includes, whichever vehicle it is. */
const INCLUDED = [
  'A daily kilometre allowance, stated before you book, with the extra-KM rate beside it',
  'A refundable deposit — the figure is told to you in advance, not at handover',
  'The odometer and fuel level written down in front of you at collection and return',
  'Delivery and collection anywhere in Kanyakumari district',
  'Insurance and papers in the vehicle, and servicing that is ours to worry about',
];

export function Cars() {
  return (
    <>
      <PageHeader
        photo="cars-hero"
        imageAlt="Self-drive rental cars available in Nagercoil and across Kanyakumari district"
        scene="/cars"
        title="Our cars"
        intro="Hatchbacks, sedans, SUVs and 7 seater vehicles for self drive car rental in Nagercoil and across Kanyakumari district. Every car lists its KM limit, extra-KM rate and deposit, so there is nothing to discover later."
      />

      <section className="mx-auto max-w-[86rem] px-5 pt-16 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <Reveal>
              <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Which one to take
              </h2>
              <p className="mt-4 leading-relaxed text-ink-dim">
                Most of the choice comes down to three questions: how many of
                you there are, how far you are going, and whether you want to
                drive a manual. Every vehicle below has a page of its own
                saying what it is like on these roads — including what it is
                not good at.
              </p>
            </Reveal>

            <dl className="mt-8 divide-y divide-line border-y border-line">
              {CHOOSING.map((item, i) => (
                <Reveal key={item.heading} delay={(i + 1) * 70}>
                  <div className="py-5">
                    <dt className="font-bold text-navy">{item.heading}</dt>
                    <dd className="mt-2 leading-relaxed text-ink-dim">{item.body}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>

            <Reveal delay={280}>
              <p className="mt-8 leading-relaxed text-ink-dim">
                Still deciding?{' '}
                <Link to="/blog/self-drive-or-with-a-driver" className="font-semibold text-navy hover:text-gold-deep">
                  Self drive or with a driver
                </Link>{' '}
                covers the days when paying for somebody else to drive is the
                cheaper answer, and{' '}
                <Link to="/tariff" className="font-semibold text-navy hover:text-gold-deep">
                  the tariff
                </Link>{' '}
                has every figure for every vehicle.
              </p>
            </Reveal>
          </div>

          <div>
            <Reveal delay={90}>
              <div className="rounded-[14px] border border-line bg-cream p-6 sm:p-7">
                <h2 className="text-lg font-bold text-navy">What every rental includes</h2>
                <ul className="mt-4 space-y-3">
                  {INCLUDED.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 leading-relaxed text-ink-dim">
                      <span aria-hidden="true" className="bullet-dot" />
                      {point}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-ink-dim">
                  What you need to bring is a licence, one photo ID and the
                  deposit —{' '}
                  <Link
                    to="/blog/documents-to-rent-a-self-drive-car"
                    className="font-semibold text-navy hover:text-gold-deep"
                  >
                    the documents in full
                  </Link>
                  .
                </p>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-6 rounded-[14px] border border-line bg-white p-6 shadow-[0_10px_30px_rgba(16,24,40,0.08)] sm:p-7">
                <h2 className="text-lg font-bold text-navy">Read about each one</h2>
                <ul className="mt-4 space-y-2.5">
                  {modelData.models.map((model) => (
                    <li key={model.slug}>
                      <Link
                        to={`/cars/${model.slug}`}
                        className="tap-target group flex items-baseline gap-2 font-semibold text-navy transition hover:text-gold-deep"
                      >
                        {model.name}
                        <span
                          aria-hidden="true"
                          className="text-gold transition group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Fleet />
    </>
  );
}
