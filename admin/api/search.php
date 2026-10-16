<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/http.php';
require_once __DIR__ . '/../src/booking.php';

/**
 * One box that finds anything.
 *
 * A booking number, a registration, a phone number, a customer's name, a car's
 * name -- whichever of those somebody has in front of them is the one they
 * will type, and which tab it lives under is not something they should have to
 * work out first. At a few hundred bookings that stops being a convenience.
 *
 * Deliberately not clever. It matches what was typed against the handful of
 * fields anybody actually searches by, and says which kind each hit is. A
 * ranked full-text index over everything would find more and be trusted less.
 */

api_guard('booking.view');

$q = trim((string) ($_GET['q'] ?? ''));

// Two characters finds most of the database, which is the same as finding
// nothing. Answering empty is the honest response to half a search term.
if (mb_strlen($q) < 3) {
    json_out(['ok' => true, 'query' => $q, 'results' => []]);
}

$like = '%' . str_replace(['%', '_'], ['\%', '\_'], $q) . '%';

// A phone number is typed with spaces as often as without, so it is matched
// against the digits alone. REPLACE rather than a stored normalised column:
// this runs on a few thousand rows at most, and a second copy of a phone
// number is a second thing to keep in step.
$digits = preg_replace('/\D+/', '', $q);
$phone  = $digits === '' ? null : '%' . $digits . '%';

$results = [];

try {
    $bookings = fetch_all(
        "SELECT b.id, b.booking_number, b.status, b.start_at, b.return_at,
                c.name AS customer_name, c.phone AS customer_phone, v.name AS vehicle_name
           FROM bookings b
           JOIN customers c ON c.id = b.customer_id
           JOIN vehicles  v ON v.id = b.vehicle_id
          WHERE b.booking_number LIKE ?
             OR b.vehicle_reg_number LIKE ?
             OR c.name LIKE ?
             OR (? IS NOT NULL AND REPLACE(REPLACE(c.phone, ' ', ''), '-', '') LIKE ?)
       ORDER BY b.start_at DESC, b.id DESC
          LIMIT 8",
        [$like, $like, $like, $phone, $phone ?? '']
    );
    foreach ($bookings as $row) {
        $money = booking_money((int) $row['id']);
        $results[] = [
            'kind'     => 'booking',
            'id'       => (int) $row['id'],
            'title'    => $row['booking_number'] . ' · ' . $row['customer_name'],
            'subtitle' => $row['vehicle_name'] . ' · '
                . date('d M', strtotime((string) $row['start_at'])) . ' → '
                . date('d M', strtotime((string) $row['return_at']))
                . ' · ' . $row['status'],
            'note'     => (float) $money['balance'] > 0
                ? number_format((float) $money['balance']) . ' still due' : '',
        ];
    }
} catch (Throwable $e) {
    error_log('search: bookings failed: ' . $e->getMessage());
}

try {
    $vehicles = fetch_all(
        "SELECT id, name, brand, reg_number, status, current_km
           FROM vehicles
          WHERE name LIKE ? OR brand LIKE ? OR reg_number LIKE ?
       ORDER BY name LIMIT 5",
        [$like, $like, $like]
    );
    foreach ($vehicles as $row) {
        $results[] = [
            'kind'     => 'vehicle',
            'id'       => (int) $row['id'],
            'title'    => $row['brand'] . ' ' . $row['name'],
            'subtitle' => $row['reg_number'] . ' · ' . $row['status'],
            'note'     => number_format((float) $row['current_km']) . ' km',
        ];
    }
} catch (Throwable $e) {
    error_log('search: vehicles failed: ' . $e->getMessage());
}

try {
    $customers = fetch_all(
        "SELECT id, name, phone, licence_number
           FROM customers
          WHERE name LIKE ?
             OR (? IS NOT NULL AND REPLACE(REPLACE(phone, ' ', ''), '-', '') LIKE ?)
             OR licence_number LIKE ?
       ORDER BY name LIMIT 5",
        [$like, $phone, $phone ?? '', $like]
    );
    foreach ($customers as $row) {
        $results[] = [
            'kind'     => 'customer',
            'id'       => (int) $row['id'],
            'title'    => $row['name'],
            'subtitle' => $row['phone'],
            'note'     => $row['licence_number'] ?? '',
        ];
    }
} catch (Throwable $e) {
    error_log('search: customers failed: ' . $e->getMessage());
}

json_out(['ok' => true, 'query' => $q, 'results' => $results]);
