import { Link } from 'react-router-dom';
import { PageHeader } from './PageHeader';

export function NotFound() {
  return (
    <>
      <PageHeader
        title="Page not found"
        intro="That address does not match anything on this site."
      />
      <section className="mx-auto max-w-[86rem] px-5 py-16 sm:px-8 lg:px-12 text-center">
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-xl bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy/90"
          >
            Back to home
          </Link>
          <Link
            to="/cars"
            className="rounded-xl border border-line px-6 py-3 font-semibold text-ink-dim transition hover:border-navy/40 hover:text-navy"
          >
            See our cars
          </Link>
        </div>
      </section>
    </>
  );
}
