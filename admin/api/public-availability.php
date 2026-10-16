<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/db.php';
require_once __DIR__ . '/../src/http.php';
require_once __DIR__ . '/../src/booking.php';
require_once __DIR__ . '/../src/vocab.php';

/**
 * Which days each vehicle is already spoken for.
 *
 * So the date boxes can grey out — gold out, here — the days that cannot be
 * booked, rather than letting someone pick one and be told afterwards. The
 * conflict check in api/bookings.php still runs on save: this is the same
 * truth shown earlier, not a replacement for it.
 *
 * What it returns is days, and nothing else. No customer, no booking number,
 * no amount — a date being taken is ordinary availability information, the
 * kind any hire company publishes; who took it is not.
 *
 * BLOCKING_STATUSES rather than a list written out again here, so this and the
 * check that refuses a double booking can never disagree about what "taken"
 * means.
 *
 * Temporary cars are left out entirely, matching public-vehicles.php. One the
 * site does not list cannot be the car a visitor picked, so its diary answers
 * a question nobody asked -- and counting it in the fleet would make a day
 * look open because a car nobody can see is free on it.
 */

// ---- CORS: the same allowlist the other public endpoints use ----
$allowed = config('public_site_origin') ?? '';
$allowed = array_values(array_filter(array_map('strval', is_array($allowed) ? $allowed : [$allowed])));
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin !== '' && in_array($origin, $allowed, true)) {
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

// Short, because someone confirming a booking in the panel wants the site to
// stop offering that day promptly. A minute matches public-vehicles.php.
header('Cache-Control: public, max-age=60');

// The bookings table arrives with 001, but a panel that has never had its
// migrations applied would still 500 here and take the date boxes down with
// it. An empty answer means "nothing known to be taken", which is exactly
// what the form should assume when it cannot find out.
if (!table_has_column('bookings', 'start_at')) {
    json_out(['ok' => true, 'vehicles' => [], 'busy' => []]);
}

// Which cars are not advertised. Read as a set rather than joined in, so the
// booking query keeps the shape it had: this filters who is reported on,
// without changing which bookings the database considers.
$hasTemporary = table_has_column('vehicles', 'is_temporary');
$temporaryIds = [];
if ($hasTemporary) {
    foreach (fetch_all('SELECT id FROM vehicles WHERE is_temporary = 1') as $row) {
        $temporaryIds[(string) $row['id']] = true;
    }
}

// Yesterday onward. A booking that ended last month cannot affect a date
// anyone is able to choose, and sending every row since opening would grow
// without limit.
$placeholders = implode(',', array_fill(0, count(BLOCKING_STATUSES), '?'));

try {
    $rows = fetch_all(
        "SELECT vehicle_id, DATE(start_at) AS from_day, DATE(return_at) AS to_day
           FROM bookings
          WHERE status IN ($placeholders)
            AND DATE(return_at) >= CURDATE()
       ORDER BY start_at",
        BLOCKING_STATUSES,
    );
} catch (Throwable $e) {
    error_log('public availability read failed: ' . $e->getMessage());
    json_out(['ok' => true, 'vehicles' => [], 'busy' => []]);
}

// Grouped per vehicle, plus a combined list.
//
// The combined one is what the public enquiry form needs: a visitor has not
// chosen a vehicle yet, so a day is only worth blocking there when EVERY
// vehicle is out. Sending both means neither side has to reconstruct the
// other's view from the rows.
$perVehicle = [];
$counts     = [];

foreach ($rows as $row) {
    $id = (string) $row['vehicle_id'];
    if (isset($temporaryIds[$id])) {
        continue;
    }
    $perVehicle[$id][] = [$row['from_day'], $row['to_day']];

    // Expanded to days for the tally. Ranges are short -- a hire is days or
    // weeks -- and a month's cap keeps a mistyped multi-year return from
    // turning into a loop that does not end.
    $day = new DateTimeImmutable((string) $row['from_day']);
    $end = new DateTimeImmutable((string) $row['to_day']);
    for ($i = 0; $i < 400 && $day <= $end; $i++) {
        $counts[$day->format('Y-m-d')][$id] = true;
        $day = $day->modify('+1 day');
    }
}

// How many vehicles could be hired at all, so "every one is out" is a fact
// rather than a guess. The same set the site lists, from the same constant:
// counting a car the site never shows would mean a fully booked weekend still
// looked open, and counting fewer than it shows would call a free day full.
//
// This has to move with public-vehicles.php or the arithmetic breaks. When the
// listing only showed Available cars, a fleet of six with two out counted four
// -- and a day both of those two were booked on reached 4 of 4 and was called
// fully busy while four cars sat free.
$notTemporary = $hasTemporary ? ' AND is_temporary = 0' : '';
$listed = implode(',', array_fill(0, count(LISTED_STATUSES), '?'));
$fleet = (int) (fetch_one(
    "SELECT COUNT(*) AS n FROM vehicles WHERE status IN ($listed)$notTemporary",
    LISTED_STATUSES
)['n'] ?? 0);

$allBusy = [];
if ($fleet > 0) {
    foreach ($counts as $date => $vehicles) {
        if (count($vehicles) >= $fleet) {
            $allBusy[] = $date;
        }
    }
    sort($allBusy);
}

json_out([
    'ok'       => true,
    'fleet'    => $fleet,
    // { "<vehicle id>": [["2026-09-20","2026-09-24"], ...] }
    'vehicles' => $perVehicle,
    // Days on which nothing at all is free.
    'busy'     => $allBusy,
]);
