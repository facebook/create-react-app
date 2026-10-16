import { Link } from 'react-router-dom';
import { useHome } from '../content';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { AreasServed } from '../components/AreasServed';
import { PlacesTeaser } from '../components/PlacesTeaser';
import { Services } from '../components/Services';
import { WhyUs } from '../components/WhyUs';
import { Faq } from '../components/Faq';
// @ts-expect-error -- plain ESM, shared verbatim with the build so the number
// shown and the number in the structured data cannot disagree.
import { HOME_FAQ_SHOWN } from '../data/faq-shown.mjs';

export function Home() {
  const home = useHome();
  const c = home.closingCta;

  return (
    <>
      <Hero />
      <Services />
      <WhyUs />
      <HowItWorks />
      <AreasServed />
      <PlacesTeaser />
      {/* Six of the ten. The rest are on the tariff page, which is where
          somebody with a detailed question already is -- and a home page is
          not the place to answer every question, only the ones that stop a
          booking. */}
      <Faq limit={HOME_FAQ_SHOWN} moreHref="/tariff" moreLabel="All questions and rates" />

      <section className="mx-auto max-w-[86rem] px-5 sm:px-8 lg:px-12 py-20">
        <div className="rounded-[14px] border border-line bg-white p-8 text-center shadow-[0_10px_30px_rgba(16,24,40,0.08)] sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            {c.heading}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-ink-dim">
            {c.body}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to={c.primaryHref}
              className="rounded-xl bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {c.primaryLabel}
            </Link>
            <Link
              to={c.secondaryHref}
              className="rounded-xl border border-line px-6 py-3 font-semibold text-ink-dim transition hover:border-navy/40 hover:text-navy"
            >
              {c.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
