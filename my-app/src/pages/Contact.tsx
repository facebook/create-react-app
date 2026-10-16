import { Link } from 'react-router-dom';
import seo from '../data/seo.json';
import { useHome } from '../content';
import { readablePhone } from '../lib/phone';
import { Enquiry } from '../components/Enquiry';
import { AreasServed } from '../components/AreasServed';
import { Icon3d } from '../components/Icon3d';
import type { Icon3dName } from '../components/Icon3d';
import { Reveal } from '../components/Reveal';
import { PageHeader } from './PageHeader';

/**
 * Contact: the ways to reach us on the left, the form on the right.
 *
 * They used to run one under the other -- two cards, then a form centred in
 * its own band -- so on a desktop the page was a column of things down the
 * middle with a screen of nothing either side, and the phone number was a
 * scroll away from the form by the time anybody had read it. Side by side,
 * both are on screen at once and the choice between ringing and typing is
 * one glance rather than one decision at a time.
 *
 * Under a thousand pixels they stack, in that order: most people arriving on
 * this page on a phone want the number, not the form.
 */

/** One way to reach us: a plate, a label, and the thing itself. */
function Way({
  icon,
  label,
  href,
  children,
  external,
}: {
  icon: Icon3dName;
  label: string;
  href?: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const body = (
    <>
      <Icon3d name={icon} size={42} />
      <span className="min-w-0">
        <span className="block text-xs font-semibold tracking-wide text-ink-faint uppercase">
          {label}
        </span>
        <span className="mt-0.5 block font-semibold break-words text-navy">{children}</span>
      </span>
    </>
  );

  const shell =
    'contact-way flex items-center gap-4 rounded-[16px] border border-line bg-white p-4 shadow-[0_10px_26px_rgba(16,24,40,0.07)]';

  if (!href) {
    return <div className={shell}>{body}</div>;
  }

  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`${shell} transition hover:border-gold/60`}
    >
      {body}
    </a>
  );
}

export function Contact() {
  const f = useHome().footer;
  const digits = seo.site.phone.replace(/[^0-9]/g, '');

  const mapSrc =
    f.mapQuery.trim() === ''
      ? null
      : `https://www.google.com/maps?q=${encodeURIComponent(f.mapQuery)}&output=embed`;

  return (
    <>
      <PageHeader
        photo="contact-hero"
        imageAlt="The NiteSha Cars & Bikes office in Nagercoil, Kanyakumari district"
        scene="coast"
        title="Contact"
        intro="Call us, write to us, or send the form — for self drive car rental in Nagercoil, or a vehicle anywhere else in Kanyakumari district. Only your name and phone number are needed to start."
      />

      <section className="mx-auto max-w-[86rem] px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: the ways to reach us, and where we are. */}
          <Reveal className="lg:col-span-5">
            <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Talk to us
            </h2>
            <p className="mt-2 leading-relaxed text-ink-dim">
              A call is the quickest way to know whether a vehicle is free on
              your dates. The form does the same thing if we are on the road.
            </p>

            <div className="mt-7 grid gap-3">
              <Way icon="phone" label="Phone" href={`tel:${seo.site.phone}`}>
                {readablePhone(seo.site.phone)}
              </Way>

              <Way icon="whatsapp" label="WhatsApp" href={`https://wa.me/${digits}`} external>
                Message us
              </Way>

              <Way icon="mail" label="Email" href={`mailto:${seo.site.email}`}>
                {seo.site.email}
              </Way>

              <Way icon="pin" label={f.locationHeading}>
                {f.address.join(', ')}
              </Way>
            </div>

            {f.hours.trim() !== '' ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-dim">
                <span className="font-semibold text-navy">Open</span> {f.hours}
              </p>
            ) : null}

            {/* The map belongs on the page somebody opens to find us, not
                only at the foot of every other one. */}
            {mapSrc ? (
              <div className="mt-6 overflow-hidden rounded-[16px] border border-line">
                <iframe
                  src={mapSrc}
                  title={`Map of ${f.mapQuery}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block h-56 w-full border-0"
                />
              </div>
            ) : null}
          </Reveal>

          {/* Right: the form. */}
          <Reveal delay={90} className="lg:col-span-7">
            <Enquiry />
          </Reveal>
        </div>
      </section>

      {/* What happens next, which is the question a form leaves unanswered
          and the reason a lot of people close the tab instead of sending it. */}
      <section className="mx-auto max-w-[86rem] px-5 pb-16 sm:px-8 lg:px-12">
        <div className="grid gap-8 rounded-[18px] border border-line bg-cream p-6 sm:p-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-navy">
              What happens after you send it
            </h2>
            <ol className="mt-5 space-y-4">
              {[
                'We check what is free on your dates. If the vehicle you asked for is out, we will say so and tell you what else would suit rather than quietly substituting something.',
                'We call you back with the daily rate, the kilometre allowance, the extra-KM rate and the deposit. All four, before anything is agreed.',
                'If it suits you, we book it. Nothing is paid now — the deposit is taken at handover and comes back when the vehicle does.',
                'We bring the vehicle to you at the time agreed, anywhere in the district, with its papers in it.',
              ].map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-gold"
                  >
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-ink-dim">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-navy">
              What to have ready
            </h2>
            <p className="mt-4 leading-relaxed text-ink-dim">
              Nothing, to enquire — a name and a number is enough. To take a
              vehicle you will need an original driving licence for the class
              you are renting, one government photo ID, and the deposit.
              Visitors from abroad should bring a passport and an international
              driving permit alongside their home licence.
            </p>
            <p className="mt-4 leading-relaxed text-ink-dim">
              The{' '}
              <Link
                to="/blog/documents-to-rent-a-self-drive-car"
                className="font-semibold text-navy hover:text-gold-deep"
              >
                full list of documents
              </Link>{' '}
              covers the exceptions, and{' '}
              <Link to="/tariff" className="font-semibold text-navy hover:text-gold-deep">
                the tariff
              </Link>{' '}
              has the figures for every vehicle if you would rather look before
              you ask.
            </p>
            <p className="mt-4 leading-relaxed text-ink-dim">
              A call is quicker than the form if your dates are close. We
              answer{' '}
              <a
                href={`tel:${seo.site.phone}`}
                className="font-semibold text-navy hover:text-gold-deep"
              >
                {readablePhone(seo.site.phone)}
              </a>{' '}
              and the same number on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      <AreasServed />
    </>
  );
}
