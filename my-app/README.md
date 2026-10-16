# my-app

A React single-page app built with Vite, TypeScript, and Tailwind CSS.

## Requirements

- Node.js 20.19+ / 22.12+

## Getting started

```bash
npm install
npm run dev
```

The dev server prints a local URL (http://localhost:5173 by default).

## Scripts

| Command           | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start the dev server with hot module replacement |
| `npm run build`   | Type-check and build to `dist/`                  |
| `npm run preview` | Serve the production build locally               |
| `npm run lint`    | Lint with oxlint                                 |

## Layout

```
my-app/
├── index.html        # HTML entry point
├── vite.config.ts    # Vite config (React + Tailwind plugins)
├── public/           # Static files copied as-is
└── src/
    ├── main.tsx      # App bootstrap
    ├── App.tsx       # Root component
    └── index.css     # Tailwind entry
```

## Deployment

Deployed to GitHub Pages at <https://niteshacars.in> by
`.github/workflows/deploy-my-app.yml`, which builds this directory and
publishes `dist/`.

It runs on pushes to `main` that touch `my-app/`, and can also be started
by hand from the Actions tab (Run workflow).

`public/CNAME` holds the custom domain. Vite copies `public/` into `dist/`
verbatim, so the file lands at the site root where Pages expects it.
Removing it reverts the site to the default `*.github.io` address.

## Editing the fleet

`src/data/cars.ts` holds the vehicles shown on the site. They are placeholders.

The live fleet lives in the admin database, but `api/vehicles.php` calls
`api_guard('vehicle.view')`, so it cannot be read without signing in — a public
site has no way to fetch it. Edit the file to match the real fleet; pushing to
`main` redeploys automatically.

Fields mirror the `vehicles` and `vehicle_rates` tables, so the two stay
comparable.

## Enquiry form

The form posts to `https://admin.niteshacars.in/api/enquiry-submit.php`.
That endpoint needs no sign-in and already allowlists this site's origin for
CORS via the `public_site_origin` config key.

`vehicle_id` is deliberately not sent. The endpoint validates it against the
`vehicles` table, and the ids in `cars.ts` are placeholders that do not exist
there, so sending one would be rejected. The chosen car is sent as free text in
`requirements` instead. Once `cars.ts` carries real database ids, the id can be
sent and enquiries will link to the vehicle record.

A honeypot field named `website` is included and kept visually hidden, matching
what the endpoint expects.

## Where the fleet comes from

The site fetches `https://admin.niteshacars.in/api/public-vehicles.php`,
which returns only vehicles whose status is `Available`, and only public-safe
columns. Adding a car in the admin panel puts it on the site; setting one to
Maintenance takes it off. No code change, no deploy.

`src/data/cars.ts` is the fallback used when that request fails — offline, a
CORS rejection, or the endpoint not uploaded yet. It is empty, so the site
degrades to its "ask us what's available" state rather than showing an error.

The endpoint lives in this repo at
`admin/api/public-vehicles.php` and reaches the
server through the admin deploy workflow.

Note the two paths are not the same shape. That repo folder maps onto the
subdomain's document root, so `admin/api/x.php` in git is served at
`https://admin.niteshacars.in/api/x.php` -- with no `admin` segment. Assuming
otherwise is what kept the fleet empty: a 404 there is swallowed by the
fallback below rather than reported.

## SEO

`src/data/seo.json` is the single source of per-route titles and descriptions.
It feeds two things:

- `scripts/prerender-seo.mjs`, which runs after each build and writes a
  directory per route (`dist/about/index.html` and so on) with that route's
  title, description, canonical and `og:` tags baked into the HTML. This is
  what crawlers and link previews read — WhatsApp, Facebook and X do not run
  JavaScript, so tags set at runtime never reach them.
- `src/lib/useSeo.ts`, which updates the same tags on client-side navigation,
  since the app never re-requests HTML after boot.

The script also writes `sitemap.xml`. `public/robots.txt` points at it.

`index.html` carries `AutoRental` structured data — the business name, phone
and email — which is what local search results are built from.
