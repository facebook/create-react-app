import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

/**
 * Start the app on top of the HTML the build already wrote.
 *
 * This used to be createRoot().render(), which does not hydrate: it empties
 * #root and renders the whole page again from scratch. Every prerendered page
 * was therefore thrown away the moment its JavaScript ran -- the content that
 * was already on screen vanished, the page collapsed to the Suspense fallback
 * while the route's chunk arrived, and came back a third of a second later.
 * That measured 0.19 CLS on every inner page, and it made the prerender worth
 * nothing to anybody who runs JavaScript.
 *
 * hydrateRoot reuses the markup instead, and React keeps server-rendered
 * content on screen while a suspended boundary resolves -- so the lazy route
 * chunk now loads behind a page that is already readable.
 *
 * Only when the markup belongs to this page, though. A static host serves
 * 404.html for every address it has no file for, and that file is a copy of
 * the home page: hydrating the home page's markup as some other route is a
 * mismatch, and React's recovery from one is to re-render anyway, with a
 * console error nobody can act on. The build stamps the route it rendered;
 * when it is not this one, render fresh, which is what used to happen
 * everywhere.
 */
const root = document.getElementById('root')!
const rendered = root.dataset.route
const matches =
  rendered !== undefined &&
  rendered === (window.location.pathname.replace(/\/+$/, '') || '/')

const tree = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

if (matches) {
  hydrateRoot(root, tree)
} else {
  createRoot(root).render(tree)
}
