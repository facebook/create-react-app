import { Link, useLocation } from 'react-router-dom';
import seo from '../data/seo.json';
import serviceAreaData from '../data/service-areas.json';
import { readablePhone } from '../lib/phone';
import { Reveal } from '../components/Reveal';
import { PageHeader } from './PageHeader';
import { NotFound } from './NotFound';

/**
 * One service, in one town.
 *
 * "Bike rental Kanyakumari" and "bike rental Nagercoil" are different
 * searches made by people wanting different things -- a sunrise run along the
 * coast, and a morning of errands through heavy traffic. One page covering
 * both answers neither well.
 *
 * What this must not become is a matrix. Four services across twelve towns is
 * forty-eight pages that are one page with two words swapped, which is what
 * Google means by a doorway page and is treated as a reason to trust the whole
 * site less. So service-areas.json holds only the combinations with something
 * of their own to say, and hiring a car by the month in Kanyakumari rather
 * than Nagercoil is not one of them.
 */

const { pages } = serviceAreaData;

export function ServiceArea() {
  // Matched on the whole path rather than on a slug: these live under their
  // own service (/bikes/kanyakumari), so the service is half the address.
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, '') || '/';
  const page = pages.find((p) => `${p.base}/${p.slug}` === path);

  if (!page) return <NotFound />;

  const enquire = `/contact?town=${encodeURIComponent(page.town)}`;

  return (
    <>
      <PageHeader
        photo="cars-hero"
        scene="/cars"
        title={`${page.service} in ${page.town}`}
        imageAlt={`${page.service} in ${page.town}, ${seo.site.district} district`}
        intro={page.intro}
      />

      <div className="mx-auto max-w-[86rem] px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            {page.sections.map((section, i) => (
              <Reveal key={section.heading} delay={i * 70}>
                <h2
                  className={`text-2xl font-bold tracking-tight text-navy sm:text-3xl ${
                    i === 0 ? '' : 'mt-12'
                  }`}
                >
                  {section.heading}
                </h2>
                <p className="mt-4 leading-relaxed text-ink-dim">{section.body}</p>
              </Reveal>
            ))}

            <Reveal delay={140}>
              <h2 className="mt-12 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Questions about {page.service.toLowerCase()} in {page.town}
              </h2>
              <dl className="mt-5 divide-y divide-line border-y border-line">
                {page.faq.map((item) => (
                  <div key={item.question} className="py-4">
                    <dt className="font-semibold text-navy">{item.question}</dt>
                    <dd className="mt-2 leading-relaxed text-ink-dim">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <div>
            <Reveal delay={60}>
              <div className="rounded-[14px] border border-line bg-cream p-6 sm:p-7">
                <h2 className="text-lg font-bold text-navy">
                  How it works in {page.town}
                </h2>
                <ul className="mt-4 space-y-3">
                  {page.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-ink-dim">
                      <span aria-hidden="true" className="bullet-dot" />
                      {point}
                    </li>
                  ))}
                </ul>

                <Link
                  to={enquire}
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 font-semibold text-navy transition hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                >
                  Check availability in {page.town}
                  <span aria-hidden="true" className="transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <p className="mt-3 text-center text-sm text-ink-dim">
                  or call{' '}
                  <a
                    href={`tel:${seo.site.phone}`}
                    className="font-semibold text-navy hover:text-gold-deep"
                  >
                    {readablePhone(seo.site.phone)}
                  </a>
                </p>
              </div>
            </Reveal>

            <Reveal delay={110}>
              <div className="mt-6 rounded-[14px] border border-line bg-white p-6 shadow-[0_10px_30px_rgba(16,24,40,0.08)] sm:p-7">
                <h2 className="text-lg font-bold text-navy">Also worth reading</h2>
                <ul className="mt-4 space-y-3">
                  {page.alsoSee.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="tap-target group flex items-baseline gap-2 font-semibold text-navy transition hover:text-gold-deep"
                      >
                        {link.label}
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
      </div>
    </>
  );
}
