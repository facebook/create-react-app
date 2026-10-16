<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/db.php';
require_once __DIR__ . '/../src/http.php';
require_once __DIR__ . '/../src/vehicle-photos.php';
require_once __DIR__ . '/../src/vocab.php';

/**
 * The fleet, for the public website.
 *
 * api/vehicles.php is the admin's endpoint and calls api_guard('vehicle.view'),
 * so a signed-out visitor cannot read it. This is the read-only counterpart:
 * no session, no writes, and a deliberately narrow set of columns.
 *
 * What it deliberately does NOT return, even though the admin's version does:
 *
 *   reg_number   a vehicle's registration plate is not the public's business
 *   current_km   operational, and reveals how hard a car has been worked
 *   created_by   internal user ids
 *   created_at   internal
 *   colour       a UI swatch for the panel, meaningless here
 *
 * Every vehicle the business rents is listed -- Available, Booked and On
 * Rental alike. The site is a catalogue of the fleet, not a live availability
 * board: a car that went out this morning is still a car the business rents,
 * and hiding it until it came back lost the enquiry for next week. Which days
 * it is free is answered separately and properly by public-availability.php,
 * which greys out the taken days in the date pickers.
 *
 * Maintenance and Inactive stay out: one is off the road, the other usually
 * sold. LISTED_STATUSES in vocab.php is the single definition, shared with
 * the availability endpoint so the two cannot disagree about what the site
 * shows.
 *
 * A temporary car is excluded as well, whatever its status. One brought in
 * from another owner for a hire or two is not part of what the business
 * offers: advertising it wins enquiries for a car that will be gone next
 * week, and the photograph and the price on the site would be somebody
 * else's. It stays fully usable inside the panel, where a booking can be
 * made against it like any other -- it is the shop window it stays out of,
 * not the business.
 *
 * Rates come from the dated rate card the same way the admin reads them: the
 * newest row not dated in the future, so a price scheduled for next month does
 * not leak out early.
 */

// ---- CORS: same allowlist the enquiry endpoint uses ----
$allowed = config('public_site_origin') ?? '';
$allowed = array_values(array_filter(array_map('strval', is_array($allowed) ? $allowed : [$allowed])));
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin !== '' && in_array($origin, $allowed, true)) {
    // Echoed rather than wildcarded, so the browser only hands the response
    // to the site that asked for it.
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Only GET is supported here.', 405);
}

// A short cache keeps a burst of visitors off the database. Five minutes was
// too long once photographs existed: changing a car's picture and then not
// seeing it on the site reads as the upload having failed, and the natural
// response is to upload it again. A minute still absorbs any burst worth
// absorbing.
header('Cache-Control: public, max-age=60');

// Named only when it exists. A deploy adds the column, but the migration that
// creates it does not run until someone opens the panel -- and this endpoint
// serves the public website in the meantime. Selecting it unconditionally
// meant a change made inside the admin could empty the fleet on the live site.
$hasPhoto = table_has_column('vehicles', 'photo_file');
$photoColumn = $hasPhoto ? 'v.photo_file,' : "NULL AS photo_file,";

// Same reasoning for the advertised upper rate, added later still.
$bandColumn = table_has_column('vehicle_rates', 'rate_daily_max')
    ? 'r.rate_daily_max,'
    : 'NULL AS rate_daily_max,';

// And the same again for the temporary flag, added by 009. Naming a column
// that is not there yet would not list one car too many -- it would fail the
// query and empty the fleet on the live site.
$notTemporary = table_has_column('vehicles', 'is_temporary')
    ? 'AND v.is_temporary = 0'
    : '';

// Placeholders rather than the statuses inlined: the list is a constant, but
// the query is built as a string and a constant that grows should not have to
// be re-escaped by hand.
$listed = implode(',', array_fill(0, count(LISTED_STATUSES), '?'));

$rows = fetch_all(
    "SELECT v.id,
            v.name,
            v.brand,
            $photoColumn
            v.body_type,
            v.fuel,
            v.transmission,
            v.seats,
            v.model_year,
            r.rate_daily,
            $bandColumn
            r.rate_7day,
            r.rate_15day,
            r.rate_30day,
            r.km_limit_per_day,
            r.extra_km_rate,
            r.security_deposit
       FROM vehicles v
       LEFT JOIN vehicle_rates r
         ON r.id = (
              SELECT id FROM vehicle_rates
               WHERE vehicle_id = v.id AND effective_from <= CURDATE()
            ORDER BY effective_from DESC, id DESC LIMIT 1
            )
      WHERE v.status IN ($listed)
            $notTemporary
   ORDER BY v.brand, v.name",
    LISTED_STATUSES
);

// A vehicle with no rate card has no price to show, so listing it would invite
// an enquiry nobody can answer. Skip it rather than print a blank.
$vehicles = [];
foreach ($rows as $row) {
    if ($row['rate_daily'] === null) {
        continue;
    }

    $vehicles[] = [
        'id'            => (string) $row['id'],
        'brand'         => (string) $row['brand'],
        'name'          => (string) $row['name'],
        'bodyType'      => (string) $row['body_type'],
        // Relative to the panel, which is where the site asks for vehicles, so
        // it resolves the same way whatever the site is served from.
        'photo'         => vehicle_photo_url($row['photo_file'] ?? null),
        'fuel'          => (string) $row['fuel'],
        'transmission'  => (string) $row['transmission'],
        'seats'         => (int) $row['seats'],
        'year'          => (int) $row['model_year'],
        'rateDaily'     => (float) $row['rate_daily'],
        // The top of the advertised band, when there is one. Display only:
        // rateDaily is still the figure a booking is charged at.
        'rateDailyMax'  => $row['rate_daily_max'] !== null ? (float) $row['rate_daily_max'] : null,
        'rateWeekly'    => $row['rate_7day']  !== null ? (float) $row['rate_7day']  : null,
        'rateFortnight' => $row['rate_15day'] !== null ? (float) $row['rate_15day'] : null,
        'rateMonthly'   => $row['rate_30day'] !== null ? (float) $row['rate_30day'] : null,
        'kmLimitPerDay' => (int) $row['km_limit_per_day'],
        'extraKmRate'   => (float) $row['extra_km_rate'],
        'deposit'       => (float) $row['security_deposit'],
    ];
}

json_out(['ok' => true, 'vehicles' => $vehicles]);
