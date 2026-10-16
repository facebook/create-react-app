import { Link, useParams } from 'react-router-dom';
import postData from '../data/posts.json';
import { Reveal } from '../components/Reveal';
import { PageHeader } from './PageHeader';
import { NotFound } from './NotFound';

/**
 * One article.
 *
 * The body is blocks of data rather than a string of HTML, which is the whole
 * reason this file is short. A post is content, and content that arrives as
 * markup is content that can carry a script tag -- writing the blocks out as
 * elements means nothing in posts.json can put anything into the page but
 * words.
 *
 * Three block kinds cover everything these articles need: a heading, a
 * paragraph, a list. Wanting a fourth is usually a sign the article wants
 * editing rather than the renderer wants extending.
 */

const { posts } = postData;

const readable = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export function Post() {
  const { slug } = useParams<{ slug: string }>();
  const post = posts.find((p) => p.slug === slug);

  if (!post) return <NotFound />;

  // All of them, not the first three. With five articles a cut list is three
  // links and two posts nothing points at -- and which two depends on the
  // order they happen to sit in the file, which is not a decision anybody
  // made.
  const others = posts.filter((p) => p.slug !== post.slug);

  return (
    <>
      <PageHeader
        photo="blog-hero"
        scene="coast"
        title={post.title}
        imageAlt={post.title}
        intro={post.excerpt}
      />

      <article className="mx-auto max-w-[46rem] px-5 py-16 sm:px-8">
        <Reveal>
          {/* Both dates, because an article that says when it was written and
              when it was last checked is one a reader can judge. */}
          <p className="text-sm text-ink-faint">
            <time dateTime={post.date}>{readable(post.date)}</time>
            {post.updated && post.updated !== post.date ? (
              <>
                {' '}
                &middot; checked{' '}
                <time dateTime={post.updated}>{readable(post.updated)}</time>
              </>
            ) : null}
          </p>
        </Reveal>

        <div className="mt-8">
          {post.body.map((block, i) => {
            if (block.t === 'h') {
              return (
                <Reveal key={i}>
                  <h2
                    className={`text-2xl font-bold tracking-tight text-navy sm:text-[1.7rem] ${
                      i === 0 ? '' : 'mt-10'
                    }`}
                  >
                    {block.v as string}
                  </h2>
                </Reveal>
              );
            }

            if (block.t === 'ul') {
              return (
                <Reveal key={i}>
                  <ul className="mt-5 space-y-2.5">
                    {(block.v as string[]).map((item) => (
                      <li key={item} className="flex items-start gap-2.5 leading-relaxed text-ink-dim">
                        <span aria-hidden="true" className="bullet-dot" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              );
            }

            return (
              <Reveal key={i}>
                <p className="mt-4 leading-relaxed text-ink-dim">{block.v as string}</p>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div className="mt-12 rounded-[14px] border border-line bg-cream p-6 sm:p-7">
            <h2 className="text-lg font-bold text-navy">Read next</h2>
            <ul className="mt-4 space-y-3">
              {post.related.map((link) => (
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

        {/* Every article links to the others, so a crawler that finds one
            finds all of them, and so does a reader who has finished. */}
        <Reveal>
          <h2 className="mt-12 text-xl font-bold tracking-tight text-navy">
            More from the blog
          </h2>
          <ul className="mt-4 space-y-4">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  to={`/blog/${other.slug}`}
                  className="group block rounded-[14px] border border-line bg-white p-5 transition hover:border-gold/60"
                >
                  <span className="font-semibold text-navy group-hover:text-gold-deep">
                    {other.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-dim">
                    {other.excerpt}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* The <p> here is spacing, not a sentence, so the link is a
              standalone target and gets a thumb-sized one. */}
          <p className="mt-8">
            <Link to="/blog" className="tap-target font-semibold text-navy hover:text-gold-deep">
              &larr; All articles
            </Link>
          </p>
        </Reveal>
      </article>
    </>
  );
}
