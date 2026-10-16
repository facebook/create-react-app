import { Link, useLocation } from 'react-router-dom';
import seo from '../data/seo.json';
import serviceAreaData from '../data/service-areas.json';
import { PageHeader } from './PageHeader';
import { AreasServed } from '../components/AreasServed';
import { Reveal } from '../components/Reveal';
import type { SceneName } from '../components/art/scenes';

export interface ServiceSection {
  heading: string;
  body: string;
}

interface ServicePageProps {
  title: string;
  intro: string;
  sections: ServiceSection[];
  /** Shown as a bulleted list under the prose. */
  points?: string[];
  /** Text on the primary call to action. */
  cta?: string;
  /** Photo slot for the banner -- a filename in public/photos, no extension. */
  photo?: string;
  /** What that photograph shows, for image search and screen readers. */
  imageAlt?: string;
  /** Drawn behind the title until that photograph exists. */
  scene?: SceneName;
}

/**
 * The shared layout behind the bike, wedding and tourist pages.
 *
 * Each is a separate route rather than a section on one page because they are
 * separate searches: someone looking for a wedding car is not the person
 * looking to hire a scooter, and a page can only rank for what it is about.
 */
export function ServicePage({ title, intro, sections, points, cta, photo, scene, imageAlt }: ServicePageProps) {
  // The towns this particular service has a page of its own for. Only a few
  // do, on purpose -- see service-areas.json -- so this is usually one or two
  // links rather than a list of twelve, and it is empty on the services that
  // have none.
  const { pathname } = useLocation();
  const base = pathname.replace(/\/+$/, '') || '/';
  const areas = serviceAreaData.pages.filter((page) => page.base === base);

  return (
    <>
      <PageHeader title={title} intro={intro} photo={photo} scene={scene} imageAlt={imageAlt} />

      <section className="mx-auto max-w-[86rem] px-5 py-16 sm:px-8 lg:px-12">
        <div className="space-y-8">
          {sections.map((s, i) => (
            <Reveal key={s.heading} delay={i * 70}>
              <h2 className="text-xl font-semibold text-navy">{s.heading}</h2>
              <p className="mt-2 leading-relaxed text-ink-dim">{s.body}</p>
            </Reveal>
          ))}
        </div>

        {points?.length ? (
          <ul className="mt-8 space-y-2.5">
            {points.map((p) => (
              <li key={p} className="flex gap-2.5 text-ink-dim">
                <span aria-hidden="true" className="bullet-dot" />
                {p}
              </li>
            ))}
          </ul>
        ) : null}

        {areas.length > 0 ? (
          <Reveal className="mt-10 block rounded-[14px] border border-line bg-cream p-6 sm:p-7">
            <h2 className="text-lg font-bold text-navy">Town by town</h2>
            <p className="mt-2 text-ink-dim">
              Where this works differently depending on where you are, we have
              written it up separately.
            </p>
            <ul className="mt-4 space-y-3">
              {areas.map((area) => (
                <li key={area.slug}>
                  <Link
                    to={`${area.base}/${area.slug}`}
                    className="tap-target group flex items-baseline gap-2 font-semibold text-navy transition hover:text-gold-deep"
                  >
                    {area.service} in {area.town}
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
          </Reveal>
        ) : null}

        <Reveal className="mt-10 block rounded-[14px] border border-line bg-white p-6 text-center shadow-[0_10px_30px_rgba(16,24,40,0.08)]">
          <p className="text-lg font-semibold text-navy">{cta ?? 'Ask us for a quote'}</p>
          <p className="mx-auto mt-2 max-w-md text-ink-dim">
            Tell us your dates and where you are in {seo.site.district} district,
            and we will come back with availability and the rate.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="rounded-xl bg-navy px-5 py-2.5 font-semibold text-white transition hover:bg-navy/90"
            >
              Send an enquiry
            </Link>
            <a
              href={`tel:${seo.site.phone}`}
              className="rounded-xl border border-line px-5 py-2.5 font-semibold text-ink-dim transition hover:border-navy/40 hover:text-navy"
            >
              Call +91 63749 42976
            </a>
          </div>
        </Reveal>
      </section>

      <AreasServed />
    </>
  );
}
