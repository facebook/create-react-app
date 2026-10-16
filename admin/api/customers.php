<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/http.php';
require_once __DIR__ . '/../src/booking.php';
require_once __DIR__ . '/../src/customer-files.php';

/**
 * Who this phone number belongs to, and what they have hired before.
 *
 * A returning customer was already matched on their phone number when a
 * booking was saved -- but only then, and silently. Whoever was typing had
 * already keyed the address and the licence number again, and if they typed
 * either differently the record quietly kept whichever came first.
 *
 * Asking before the form is filled in turns that into the opposite: the
 * details arrive, and their previous hires arrive with them, which is the
 * thing you actually want to know before quoting somebody a rate.
 */

api_guard('booking.view');

$action = $_GET['action'] ?? 'lookup';
if ($action !== 'lookup') {
    json_error('Unknown action.', 404);
}

$phone = preg_replace('/\s+/', '', (string) ($_GET['phone'] ?? ''));

// Short enough to be a typo rather than a number. Answering "no customer" for
// two digits would be true and useless; this says nothing instead, so the
// panel does not flash a "new customer" badge at somebody mid-type.
if (strlen((string) $phone) < 6) {
    json_out(['ok' => true, 'customer' => null, 'bookings' => []]);
}

$customer = fetch_one('SELECT * FROM customers WHERE phone = ? LIMIT 1', [$phone]);
if ($customer === null) {
    json_out(['ok' => true, 'customer' => null, 'bookings' => []]);
}

$id = (int) $customer['id'];

try {
    $rows = fetch_all(
        "SELECT b.id, b.booking_number, b.status, b.start_at, b.return_at, b.duration_days,
                v.name AS vehicle_name
           FROM bookings b
           JOIN vehicles v ON v.id = b.vehicle_id
          WHERE b.customer_id = ?
       ORDER BY b.start_at DESC, b.id DESC
          LIMIT 10",
        [$id]
    );
} catch (Throwable $e) {
    error_log('customer lookup failed: ' . $e->getMessage());
    $rows = [];
}

$history = [];
foreach ($rows as $row) {
    $money = booking_money((int) $row['id']);
    $history[] = [
        'id'             => (int) $row['id'],
        'booking_number' => $row['booking_number'],
        'vehicle_name'   => $row['vehicle_name'],
        'status'         => $row['status'],
        'start_at'       => $row['start_at'],
        'duration_days'  => (int) $row['duration_days'],
        'total'          => (float) $money['total'],
        'balance'        => (float) $money['balance'],
    ];
}

json_out([
    'ok' => true,
    'customer' => [
        'id'             => $id,
        'name'           => $customer['name'],
        'phone'          => $customer['phone'],
        'whatsapp'       => $customer['whatsapp'] ?? null,
        'address'        => $customer['address'],
        'licence_number' => $customer['licence_number'],
        'licence_expiry' => $customer['licence_expiry'] ?? null,
        'id_number'      => $customer['id_number'] ?? null,
        'customer_type'  => $customer['customer_type'] ?? 'New',
        'documents'      => customer_files($id),
    ],
    'bookings' => $history,
]);
