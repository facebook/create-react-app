# NiteSha Cars & Bikes

The deliverable site. **All changes go in this folder** — it is the single
source of truth for the project.

Self-drive car rental for Nagercoil & Kanyakumari: a public marketing site
plus a browser-based admin panel for managing the fleet and bookings.

## Files

| File | Purpose |
|---|---|
| `index.html` | Home — hero, featured vehicles, how it works, FAQ |
| `cars.html` | Full fleet with body-type filters |
| `features.html` | Why choose NiteSha, testimonials |
| `services.html` | Service overview |
| `contact.html` | Contact details and callback form |
| `admin.html` | Admin panel (not linked from the public site) |
| `styles.css` | Public site styling and brand tokens |
| `admin.css` | Admin styling |
| `script.js` | Public site behaviour |
| `car-data.js` | Vehicle records and card rendering |
| `booking-data.js` | Bookings, payments, deposits, KM calculations |
| `admin.js` | Admin panel logic |

## Running it

No build step and no dependencies — open `index.html` in a browser, or serve
the folder:

```bash
python3 -m http.server 8080
```

Admin panel is at `/admin.html`. Demo password: `nitesha2026`.

## Brand

Taken from the live niteshacars.in site.

| Token | Value |
|---|---|
| Navy (header, footer) | `#0A0E20` |
| Gold (accent, CTAs) | `#F5A500` |
| Deep gold (text on white) | `#B36B00` |
| Cream (alt background) | `#FFF8EE` |

Typeface is Poppins throughout.

## Current limitations

Data is stored in the browser via `localStorage`, so records live on one
device only and the admin password is client-side. Both are addressed by the
planned backend — see the platform blueprint for the migration plan.
