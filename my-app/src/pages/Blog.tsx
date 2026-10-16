import { Link } from 'react-router-dom';
import postData from '../data/posts.json';
import { Reveal } from '../components/Reveal';
import { PageHeader } from './PageHeader';
import { BrandPanel } from '../components/BrandPanel';

/**
 * The article list.
 *
 * Posts live in posts.json and each one has its own page at /blog/<slug>.
 * The empty state is kept rather than deleted: an honest "nothing here yet" is
 * better than a list of invented articles, and if every post were ever removed
 * this page should say so rather than render a heading over nothing.
 */

const { posts } = postData;

const readable = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export function Blog() {
  // Newest first, decided here rather than relied on in the file: a post added
  // at the bottom of posts.json should not land at the bottom of the page.
  const ordered = [...posts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader
        photo="blog-hero"
        imageAlt="Driving routes and travel tips around Kanyakumari district"
        scene="coast"
        title="Blog"
        intro="Answers to the things people ask before they rent a vehicle — documents, distances, what a day out really takes, and what the roads are like."
      />

      <section className="mx-auto max-w-[86rem] px-5 py-16 sm:px-8 lg:px-12">
        {ordered.length === 0 ? (
          <BrandPanel title="Nothing here yet">
            We have not published anything so far. In the meantime, the fastest
            way to get an answer is to ask us directly.
          </BrandPanel>
        ) : (
          <ul className="space-y-6">
            {ordered.map((post, i) => (
              <Reveal key={post.slug} delay={i * 60}>
                <li className="rounded-[14px] border border-line bg-white p-6 shadow-[0_10px_30px_rgba(16,24,40,0.08)] transition hover:border-gold/60 sm:p-7">
                  <p className="text-xs tracking-wide text-ink-faint uppercase">
                    <time dateTime={post.date}>{readable(post.date)}</time>
                  </p>
                  <h2 className="mt-1.5 text-xl font-bold tracking-tight text-navy sm:text-2xl">
                    <Link to={`/blog/${post.slug}`} className="hover:text-gold-deep">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2.5 leading-relaxed text-ink-dim">{post.excerpt}</p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="tap-target group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep"
                  >
                    Read it
                    <span aria-hidden="true" className="transition group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
