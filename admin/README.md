# NiteSha Cars — Admin Panel

Rental management for NiteSha Cars & Bikes: vehicles, bookings, payments,
security deposits, KM tracking, enquiries and reports.

The public website lives separately at **niteshacars.in**. This is the admin
panel it links to, and the endpoint its enquiry form posts to.

Plain PHP and MySQL. No framework, no Composer, no build step — deploying is
uploading the files.

## Putting it on the server

1. **Create a database.** In hPanel → Databases → MySQL, create a database and
   a user, and note the name, user and password.

2. **Upload the files** into the folder the subdomain serves, e.g.
   `admin.niteshacars.in`. Upload everything except `config.php`, which does
   not exist yet and is created for you.

3. **Open `install.php`** in a browser — `https://admin.niteshacars.in/install.php`.
   It checks the hosting, creates the tables, writes `config.php` and makes your
   Super Admin account.

4. **Delete `install.php`.** It refuses to run once an account exists, so it is
   not a way in, but there is no reason to leave it there.

5. **Sign in** at `https://admin.niteshacars.in/`.

To connect the enquiry form on the public site, post to
`https://admin.niteshacars.in/api/enquiry-submit.php` with `name` and `phone`
(and optionally `email`, `message`, `pickup_location`, `start_date`,
`return_date`, `vehicle_id`). Include a field named `website`, hidden with CSS —
it is a honeypot, and real visitors never fill it in. The address you post from
must be listed in `public_site_origin` in `config.php`.

## What it does

- **Dashboard** — fleet and finance figures, active and upcoming rentals
- **Bookings** — create, take payments, record deposits and refunds, log
  pickup and return, and track KM with automatic extra-KM charges
- **Vehicles** — fleet, rate card, KM policy, deposit, odometer, status,
  and whose car it is
- **Enquiries** — what the public form sends, tracked until it becomes a
  booking or is turned down with a reason
- **Finance** — expenses by category and vehicle, against income taken
  straight from the payments recorded on bookings
- **Reports** — booking, revenue, vehicle, KM, deposit and payment reports

### Cars the website never shows

The website's fleet comes from `api/public-vehicles.php`, which lists a car
only when its status is Available, it has a rate card, **and it is not
marked temporary**.

Temporary is for a car brought in from another owner for a hire or two.
Ticking it on the car means:

- it never appears on the website — not the fleet page, not the tariff
  table, not the car list on either enquiry form
- it is not counted when the site works out whether a day is fully booked,
  so a car nobody can see being free never makes a full weekend look open
- it behaves like any other car inside the panel: it can be booked, paid
  for, handed over and returned

So it is the shop window a temporary car stays out of, not the business.
Retire it when the hire is over and it leaves the fleet list too.

## How it is built

**Money is never a float.** Amounts are handled in whole paise
(`src/money.php`), because `0.10 × 100` is not exactly `10.00` in floating
point and a rental business cannot afford figures that drift.

**Financial records are added, never edited.** Payments, deposits, refunds,
charges, expenses and KM readings are only ever inserted. A mistake is
corrected by a new row that cites the one it corrects, and cancelling is a
status change with a reason. Nothing is deleted, so the trail an auditor
follows is the trail of what actually happened.

Every one of them has an **Edit** on the booking that holds it, and none of
those edits overwrites anything. Asked for the figure that should have been
recorded, the panel works out the difference and the server writes it as a
correction — an adjustment row beside a payment or an expense, a replacement
row citing the old one for a deposit, refund, charge or odometer reading. The
wrong figure stays on the record with the reason it was wrong against it.

**Income is never typed in.** The Finance tab sums the payments already
recorded against bookings, so it cannot disagree with the bookings it
summarises, and the same money cannot be entered twice. Deposits are reported
beside the figures but never inside them: a deposit is the customer's money
being held, not the business's money earned.

**Prices are frozen at booking.** A booking copies the rate, KM allowance,
extra-KM rate and deposit into `booking_charges` when it is created. Changing
the rate card afterwards never alters what an existing customer owes.

**Recorded status is separate from the calendar.** A booking's status moves
only on a real pickup or return, so it is never marked Active without the
odometer reading its extra-KM charge depends on. Alongside it, a schedule chip
derived from the clock reads Upcoming, Awaiting Pickup, On Rent, Overdue
Return and so on.

## Who may do what

Five roles, set per account on the Users screen, which only a Super Admin
sees:

- **Super Admin** — everything, including who else may sign in
- **Admin** — the day's work and the public website; sees the money, does not
  move it
- **Accounts** — the money: payments, deposits, refunds, expenses and the
  corrections to all four
- **Staff** — the counter: bookings, the fleet, enquiries, KM readings
- **Auditor** — reads everything and changes nothing

A role is the starting point, not the whole answer. Any one permission can be
added to or taken from one person, and what is stored is the difference — so
an account reads as "Accounts, and may also cancel a booking" and stays that
way when the role itself is adjusted later.

Every screen and every endpoint checks for itself. The navigation only shows
what the signed-in account may open, which is a courtesy rather than the
guard: typing the address of a screen you may not use gets a 403 either way.

## Security

Passwords are hashed; five failed attempts lock an account for fifteen
minutes; wrong-password and unknown-account give the same answer, so the form
cannot be used to discover who has an account. Sessions regenerate on sign-in
and the cookie is HttpOnly. Every write carries a CSRF token, every query is a
prepared statement, and permissions are checked on the server for each request
rather than by hiding buttons.

`config.php` holds the database password: it is git-ignored, and `.htaccess`
denies it — along with `src/`, `sql/` and `tools/` — over the web.

The only unauthenticated endpoint is `api/enquiry-submit.php`. It can create an
enquiry and nothing else, and is guarded by an origin allowlist, a honeypot,
and a per-address hourly limit.

## Tidying up records

`tools/tidy-records.sql` keeps a named set of bookings and inquiries, deletes
the rest, and renumbers what is left so the numbering starts at 1 again. Edit
the two lists at the top, look at what it says it will delete, then run it in
phpMyAdmin. It refuses to do anything unless those lists find exactly what
they say they will, so a mistyped number changes nothing rather than deleting
everything.

## Tests

```bash
php tools/test-money.php                       # money arithmetic
php tools/test-auth.php <dsn> <user> <pass>    # sign-in, roles, numbering
php tools/test-api-failure.php                 # a crash still answers JSON
bash tools/test-api.sh       <url> <email> <password>
bash tools/test-bookings.sh  <url> <email> <password>
bash tools/test-ledger.sh    <url> <email> <password>
bash tools/test-enquiries.sh <url> <email> <password>
bash tools/test-expenses.sh  <url> <email> <password>
bash tools/test-public.sh    <url> <email> <password>   # what the website sees
node tools/test-ui.js         <url> <email> <password>
node tools/test-booking-ui.js <url> <email> <password>
node tools/test-enquiry-ui.js <url> <email> <password>
node tools/test-finance-ui.js <url> <email> <password>
node tools/test-nav-ui.js     <url> <email> <password>
node tools/test-records-ui.js <url> <email> <password>
node tools/test-brand-ui.js   <url> <email> <password>
node tools/test-install-ui.js <url> <db-name> <db-user>   # on a spare database
```

Around 475 checks, covering the money arithmetic, the append-only ledger,
price freezing, double-booking, the KM audit trail, the enquiry defences,
expense corrections and voiding, getting from one panel to another, sorting,
searching and paging the record lists, what deleting a booking takes with it,
which brand images are framed and which are kept whole, what the public
endpoints show the website and what they keep back,
what a crashed endpoint replies, and the booking, enquiry and finance flows
driven through a real browser.

The suites that take a URL want the panel served at the root of it, as it is
on the server: `http://127.0.0.1:8210`, not `.../admin`. They write to the
database they are pointed at, so point them at a scratch one.

## Brand

| Token | Value |
|---|---|
| Navy | `#0A0E20` |
| Gold | `#F5A500` |
| Deep gold (text on white) | `#B36B00` |

Typeface is Poppins.
