import { Link } from 'react-router-dom';
import seo from '../data/seo.json';
import townData from '../data/towns.json';
import { PageHeader } from './PageHeader';
import { Benefits } from '../components/Benefits';

/**
 * TODO for the owner: the copy below is deliberately generic. It states only
 * what the booking flow actually does, because inventing a founding year, a
 * fleet size or customer numbers would put claims on the site that are not
 * true. Replace each paragraph with the real story.
 *
 * The sections added since say more without saying anything new: how a hire
 * is actually run, and which towns are covered. Both are true of the business
 * as the rest of the site already describes it, which is the only kind of
 * detail that can be added to an about page by somebody who does not work
 * there.
 */
export function About() {
  return (
    <>
      <PageHeader
        photo="about-hero"
        imageAlt="The NiteSha Cars & Bikes team and vehicle yard in Nagercoil"
        scene="coast"
        title="About us"
        intro="NiteSha Cars & Bikes is a self drive car rental in Nagercoil, and we rent two-wheelers, wedding cars and tourist vehicles across Kanyakumari district as well."
      />

      <section className="mx-auto max-w-[86rem] px-5 py-16 sm:px-8 lg:px-12">
        <div className="space-y-5 leading-relaxed text-ink-dim">
          <p>
            We are based in {seo.site.city} and work across the whole of{' '}
            {seo.site.district} district. Four things, under one roof:{' '}
            <Link to="/cars" className="font-semibold text-navy hover:text-gold-deep">
              self drive cars
            </Link>{' '}
            for people who would rather drive themselves,{' '}
            <Link to="/bikes" className="font-semibold text-navy hover:text-gold-deep">
              bikes
            </Link>{' '}
            for getting around town,{' '}
            <Link to="/wedding-cars" className="font-semibold text-navy hover:text-gold-deep">
              wedding cars
            </Link>{' '}
            for the day it matters, and{' '}
            <Link to="/tourist-vehicles" className="font-semibold text-navy hover:text-gold-deep">
              tourist vehicles with a driver
            </Link>{' '}
            for sightseeing.
          </p>
          <p>
            Rates are quoted per day and come down for longer rentals. Each
            vehicle carries a daily KM allowance, a rate for anything beyond it,
            and a refundable deposit. Those three numbers are listed against
            every car, so the price you agree is the price you pay.
          </p>
          <p>
            To rent, you need a valid driving licence and a government photo ID.
            The deposit is returned once the car comes back, less any extra-KM
            charges or damage.
          </p>
        </div>

        <h2 className="mt-12 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          How we run a rental
        </h2>
        <div className="mt-4 space-y-5 leading-relaxed text-ink-dim">
          <p>
            Everything is agreed before the keys change hands. You are told the
            daily rate, the kilometre allowance, what a kilometre past it costs
            and what the deposit is — and none of those move afterwards. There
            is no booking fee on top, and nothing is worked out at the end that
            was not written down at the start.
          </p>
          <p>
            At handover the odometer reading and the fuel level are written
            down in front of you, and we walk round the vehicle together so
            that any mark already on it is a mark we both saw. The same check
            happens when it comes back. Five minutes at the start is what stops
            a disagreement at the end, and it protects you at least as much as
            it protects us.
          </p>
          <p>
            We deliver rather than asking you to collect. Give us an address
            and a time anywhere in {seo.site.district} district and the vehicle
            arrives there with its papers in it. On a long rental the servicing
            is ours to arrange, not yours, and if a vehicle has to go in for
            work we talk to you about a replacement rather than leaving you
            without one.
          </p>
        </div>

        <h2 className="mt-12 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          Where we work
        </h2>
        <p className="mt-4 leading-relaxed text-ink-dim">
          The whole of {seo.site.district} district. These twelve towns have a
          page of their own with what it is like to drive there and how far the
          usual trips are; everywhere between them is a phone call.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {townData.towns.map((town) => (
            <li key={town.slug}>
              <Link
                to={`/car-rental/${town.slug}`}
                className="tap-target inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-sm font-semibold text-ink-dim transition hover:border-gold hover:text-navy"
              >
                <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
                {town.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-[14px] border border-line bg-white p-6 shadow-[0_10px_30px_rgba(16,24,40,0.08)]">
          <h2 className="text-lg font-semibold text-navy">Questions before you book?</h2>
          <p className="mt-2 text-ink-dim">
            Call{' '}
            <a href="tel:+916374942976" className="font-semibold text-navy hover:text-gold-deep">
              +91 63749 42976
            </a>{' '}
            or{' '}
            <Link to="/contact" className="font-semibold text-navy hover:text-gold-deep">
              send an enquiry
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Four things worth knowing, after the page has said who we are and
          before it asks for the call. */}
      <Benefits />
    </>
  );
}
