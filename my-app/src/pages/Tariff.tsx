import { Link } from 'react-router-dom';
import { dailyRate, orDash, type Car } from '../data/cars';
import modelData from '../data/models.json';
import { useFleet } from '../lib/useFleet';
import { PageHeader } from './PageHeader';
import { BrandPanel } from '../components/BrandPanel';
import { Faq } from '../components/Faq';
import tariffFaq from '../data/tariff-faq.json';
// @ts-expect-error -- plain ESM, shared verbatim with the build so the
// questions this page shows and the ones in its structured data cannot
// disagree about which of the panel's the home page already answered.
import { HOME_FAQ_SHOWN } from '../data/faq-shown.mjs';

/** The page written about this vehicle, if there is one. */
function modelPath(car: Car): string | null {
  const label = `${car.brand} ${car.name}`.toLowerCase();
  const model = modelData.models.find((m) => label.includes(m.match.toLowerCase()));
  return model ? `/cars/${model.slug}` : null;
}

export function Tariff() {
  const fleet = useFleet();
  const cars = fleet.status === 'ready' ? fleet.cars : [];
  const empty = cars.length === 0;

  return (
    <>
      <PageHeader
        photo="tariff-hero"
        imageAlt="Self-drive car rental rates in Nagercoil and Kanyakumari district"
        scene="/cars"
        title="Tariff"
        intro="These are our self drive car rental rates, per day. Longer rentals bring the daily rate down, and every figure below is what you pay — there is no separate booking fee."
      />

      <section className="mx-auto max-w-[86rem] px-5 sm:px-8 lg:px-12 py-16">
        {empty ? (
          <BrandPanel title="Ask us for a quote">
            Our rate card is not published here yet. Tell us the car you want
            and your dates, and we will give you the figure.
          </BrandPanel>
        ) : (
          <div className="overflow-x-auto rounded-[14px] border border-line bg-white shadow-[0_10px_30px_rgba(16,24,40,0.08)]">
            <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-cream/60 text-xs tracking-wide text-ink-faint uppercase">
                  <th scope="col" className="px-5 py-3 font-semibold">Car</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Per day</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Weekly</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Monthly</th>
                  <th scope="col" className="px-5 py-3 font-semibold">KM/day</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Extra KM</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Deposit</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id} className="border-b border-line/70 last:border-0">
                    <th scope="row" className="px-5 py-4 font-semibold text-navy">
                      {/* A rate table is where somebody compares, and the
                          next question after "how much" is "what is it
                          like" -- so the name is the way through to the
                          page that answers it. */}
                      {modelPath(car) ? (
                        <Link to={modelPath(car)!} className="tap-target transition hover:text-gold-deep">
                          {car.brand} {car.name}
                        </Link>
                      ) : (
                        <>
                          {car.brand} {car.name}
                        </>
                      )}
                      <span className="block text-xs font-normal text-ink-faint">
                        {car.bodyType} · {car.fuel} · {car.transmission}
                      </span>
                    </th>
                    <td className="px-5 py-4 font-semibold text-navy">{dailyRate(car)}</td>
                    <td className="px-5 py-4 text-ink-dim">
                      {orDash(car.rateWeekly)}
                    </td>
                    <td className="px-5 py-4 text-ink-dim">
                      {orDash(car.rateMonthly)}
                    </td>
                    <td className="px-5 py-4 text-ink-dim">
                      {car.kmLimitPerDay > 0 ? `${car.kmLimitPerDay} km` : '—'}
                    </td>
                    <td className="px-5 py-4 text-ink-dim">{orDash(car.extraKmRate)}</td>
                    <td className="px-5 py-4 text-ink-dim">{orDash(car.deposit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-6 text-sm leading-relaxed text-ink-faint">
          Weekly and monthly columns show the <strong>per-day</strong> rate for
          those rental lengths. The deposit is refundable and returned after the
          car comes back, less any extra-KM charges or damage.
        </p>

        {/* The table raises three questions and answers none of them in full.
            This is where the reader is when they ask. */}
        <div className="mt-8 rounded-[14px] border border-line bg-cream p-6 sm:p-7">
          <h2 className="text-lg font-bold text-navy">Before you compare quotes</h2>
          <p className="mt-2 leading-relaxed text-ink-dim">
            A daily rate on its own does not tell you what a rental costs — the
            kilometre allowance and the extra-KM rate decide as much as the
            headline figure does.
          </p>
          <ul className="mt-4 space-y-3">
            <li>
              <Link
                to="/blog/km-limits-and-deposits-explained"
                className="tap-target group inline-flex items-baseline gap-2 font-semibold text-navy transition hover:text-gold-deep"
              >
                KM limits, extra-KM rates and deposits, explained plainly
                <span aria-hidden="true" className="text-gold transition group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/blog/documents-to-rent-a-self-drive-car"
                className="tap-target group inline-flex items-baseline gap-2 font-semibold text-navy transition hover:text-gold-deep"
              >
                What documents you need to take a self-drive car
                <span aria-hidden="true" className="text-gold transition group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* The questions the figures above raise -- what a per-day column
          means, how the allowance is counted, what the deposit is -- asked
          and answered on the page that raises them.

          Then the panel's own questions, minus the ones the home page
          already shows. This page used to show all ten, which meant six of
          them were answered at two URLs: the same six questions, the same
          six answers, and the same six in both pages' FAQPage data. Google
          picks one of a pair like that and the other is wasted. Now each
          question is answered once, on one page. */}
      <Faq
        heading={tariffFaq.heading}
        intro={tariffFaq.intro}
        items={tariffFaq.items}
        skip={HOME_FAQ_SHOWN}
      />
    </>
  );
}
