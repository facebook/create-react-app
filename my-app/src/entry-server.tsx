import { renderToString } from 'react-dom/server';
import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router';
import App from './App';

/**
 * The site rendered to HTML at build time, one route at a time.
 *
 * The page used to be served as an empty <div id="root"> with a 300 KB script
 * beside it, so nothing at all was on screen until that script had been
 * fetched, parsed and run -- about three seconds on a mid-range phone on a
 * rural connection, which is most of this site's visitors. Everything Google
 * measures a page by happens in that window, and all of it was waiting on
 * work the visitor did not need done to read a headline.
 *
 * Now the words and the layout are in the file the server sends. The script
 * still loads and takes over -- that is what makes the fleet list and the
 * enquiry form work -- but by then the page has been readable for two and a
 * half seconds.
 */

/* react-dom's bundled types describe the prelude as a web ReadableStream, and
   the Node build hands back a Node one. Described structurally rather than
   pulled in from node:stream, so this file needs no @types/node to compile
   alongside the browser code it sits with. */
type NodeReadable = AsyncIterable<string> & { setEncoding(encoding: string): void };

/**
 * One render whose output is thrown away.
 *
 * The routes are loaded with React.lazy, so the first render of a page is a
 * render of the Suspense fallback with an import in flight. prerender waits
 * for that import; React.lazy remembers what it resolved to. After this, the
 * page's components are in hand and rendering it needs nothing asynchronous.
 */
async function resolveRouteChunks(url: string): Promise<void> {
  const { prelude } = await prerenderToNodeStream(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );

  const stream = prelude as unknown as NodeReadable;
  stream.setEncoding('utf8');
  for await (const chunk of stream) void chunk;
}

/**
 * Why this renders twice rather than keeping the first render's HTML.
 *
 * Whatever a prerender is waiting on, it emits the shell first and sends each
 * Suspense boundary after it -- the page inside <div hidden id="S:0">, with a
 * script at the end of the body that moves it into place. Every route on this
 * site is one boundary, which meant every page was delivered hidden and put
 * on screen by JavaScript. The words were in the file, so a crawler that runs
 * scripts saw them, but the prerender was there precisely for the readers
 * that do not: with scripting off the whole page was a navy band, and a
 * crawler that only reads markup saw the same nothing.
 *
 * renderToString has no streaming to do, so it writes the boundary and its
 * contents where they belong. It cannot wait for anything, which is exactly
 * why the pass above comes first: by the time it runs there is nothing left
 * to wait for.
 *
 * If a route ever does suspend on something that pass cannot resolve,
 * renderToString throws rather than half-rendering. The build says which
 * route and falls back to the streamed HTML, which is what it shipped before
 * -- a page that needs JavaScript to appear, not a page missing from the
 * build.
 */
export async function render(url: string): Promise<string> {
  await resolveRouteChunks(url);

  try {
    return renderToString(
      <StaticRouter location={url}>
        <App />
      </StaticRouter>,
    );
  } catch (error) {
    console.warn(
      `prerender: ${url} suspended on something other than its own chunk ` +
        `(${(error as Error)?.message ?? 'unknown error'}) -- falling back to ` +
        'streamed HTML, which needs JavaScript to be shown.',
    );

    const { prelude } = await prerenderToNodeStream(
      <StaticRouter location={url}>
        <App />
      </StaticRouter>,
    );

    const stream = prelude as unknown as NodeReadable;
    stream.setEncoding('utf8');

    let html = '';
    for await (const chunk of stream) html += chunk;
    return html;
  }
}
