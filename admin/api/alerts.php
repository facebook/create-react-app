<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/http.php';
require_once __DIR__ . '/../src/booking.php';
require_once __DIR__ . '/../src/fleet-upkeep.php';

/**
 * What needs attention today.
 *
 * The dashboard had ten figures and no answer to "what do I do this morning".
 * A number tells you where the business stands; this tells you what is about
 * to go wrong. They are different questions and only one of them has a
 * deadline.
 *
 * Every line is a thing somebody has to act on, sorted so the overdue ones are
 * first. Nothing is here because it is interesting.
 */

api_guard('booking.view');

require_once __DIR__ . '/../src/reminder.php';

$today  = date('Y-m-d');
$alerts = fleet_alerts();

// --------------------------------------------------------- returns today --
//
// The one with a time on it: a car due back at ten and not back by four is
// either late or has been extended, and nobody finds that out from a total.
try {
    $due = fetch_all(
        "SELECT b.id, b.booking_number, b.return_at, c.name AS customer_name, v.name AS vehicle_name
           FROM bookings b
           JOIN customers c ON c.id = b.customer_id
           JOIN vehicles  v ON v.id = b.vehicle_id
          WHERE b.status = 'Active' AND DATE(b.return_at) <= ?
       ORDER BY b.return_at",
        [$today]
    );
    foreach ($due as $row) {
        $late = substr((string) $row['return_at'], 0, 10) < $today;
        $alerts[] = [
            'kind'       => 'return_due',
            'level'      => $late ? 'overdue' : 'soon',
            'booking_id' => (int) $row['id'],
            'subject'    => $row['booking_number'] . ' · ' . $row['vehicle_name'],
            'message'    => $late
                ? 'Was due back ' . date('d M', strtotime((string) $row['return_at']))
                : 'Due back today at ' . date('g:i a', strtotime((string) $row['return_at'])),
            'days'       => $late ? -1 : 0,
        ];
    }
} catch (Throwable $e) {
    error_log('alerts: returns failed: ' . $e->getMessage());
}

// -------------------------------------------------------- money still out --
//
// Only where a date was agreed or the car is already back. A balance on a
// booking that has not started is not late, and listing it would make the
// list something to scroll past.
try {
    $open = fetch_all(
        "SELECT b.id, b.booking_number, b.status, b.return_at, c.name AS customer_name"
        . (table_has_column('bookings', 'balance_due_on') ? ', b.balance_due_on' : '') . "
           FROM bookings b
           JOIN customers c ON c.id = b.customer_id
          WHERE b.status IN ('Active','Returned','Completed')"
    );
    foreach ($open as $row) {
        $money = booking_money((int) $row['id']);
        if (money_cmp($money['balance'], '0.00') <= 0) {
            continue;
        }

        $dueOn    = $row['balance_due_on'] ?? null;
        $returned = in_array($row['status'], ['Returned', 'Completed'], true);

        if ($dueOn === null && !$returned) {
            continue;
        }

        $late = ($dueOn !== null && $dueOn < $today) || $returned;
        $alerts[] = [
            'kind'       => 'payment_due',
            'level'      => $late ? 'overdue' : 'soon',
            'booking_id' => (int) $row['id'],
            'subject'    => $row['booking_number'] . ' · ' . $row['customer_name'],
            'amount'     => $money['balance'],
            'message'    => rupees($money['balance']) . ' still to collect'
                . ($dueOn !== null ? ', due ' . date('d M', strtotime((string) $dueOn)) : ''),
            'days'       => $late ? -1 : 1,
        ];
    }
} catch (Throwable $e) {
    error_log('alerts: balances failed: ' . $e->getMessage());
}

// ---------------------------------------------------- deposits still held --
//
// A deposit on a finished booking is the customer's money sitting in the
// business. Nobody chases it, which is exactly why it belongs on this list.
try {
    $finished = fetch_all(
        "SELECT b.id, b.booking_number, c.name AS customer_name
           FROM bookings b
           JOIN customers c ON c.id = b.customer_id
          WHERE b.status IN ('Returned','Completed')"
    );
    foreach ($finished as $row) {
        $money = booking_money((int) $row['id']);
        if (money_cmp($money['deposit_held'], '0.00') <= 0) {
            continue;
        }
        $alerts[] = [
            'kind'       => 'deposit_due',
            'level'      => 'soon',
            'booking_id' => (int) $row['id'],
            'subject'    => $row['booking_number'] . ' · ' . $row['customer_name'],
            'amount'     => $money['deposit_held'],
            'message'    => rupees($money['deposit_held']) . ' deposit still to refund',
            'days'       => 1,
        ];
    }
} catch (Throwable $e) {
    error_log('alerts: deposits failed: ' . $e->getMessage());
}

// ----------------------------------------------------------- new enquiries --
try {
    $fresh = fetch_all(
        "SELECT id, enquiry_number, name, created_at FROM enquiries
          WHERE status = 'New' ORDER BY id DESC LIMIT 10"
    );
    foreach ($fresh as $row) {
        $alerts[] = [
            'kind'        => 'enquiry',
            'level'       => 'new',
            'enquiry_id'  => (int) $row['id'],
            'subject'     => $row['name'],
            'message'     => 'New enquiry, ' . date('d M', strtotime((string) $row['created_at'])),
            'days'        => 2,
        ];
    }
} catch (Throwable $e) {
    error_log('alerts: enquiries failed: ' . $e->getMessage());
}

// ------------------------------------------------- reminders somebody set --
//
// Carried in the same list as everything the panel works out for itself. A
// separate place for "things I wrote down" and "things the system noticed"
// would be two lists to check every morning, and the second one would win.
try {
    foreach (reminder_alerts($today) as $alert) {
        $alerts[] = $alert;
    }
} catch (Throwable $e) {
    error_log('alerts: reminders failed: ' . $e->getMessage());
}

// Overdue first, then what is coming, then the merely new. Within a level the
// most overdue leads, because that is the order somebody would work them in.
usort($alerts, static function (array $a, array $b): int {
    $rank = ['overdue' => 0, 'soon' => 1, 'new' => 2];
    return [$rank[$a['level']] ?? 3, $a['days']] <=> [$rank[$b['level']] ?? 3, $b['days']];
});

// ------------------------------------------------------ today's numbers --
//
// The counts somebody wants before they have read anything: how many cars go
// out, how many come back, what is owed. Separate from the alerts because
// these are the shape of the day rather than things that have gone wrong --
// three pickups is not a problem, it is a morning.
$today_ops = [
    'pickups'   => 0,
    'returns'   => 0,
    'payments'  => '0.00',
    'deposits'  => '0.00',
    'servicing' => 0,
    'enquiries' => 0,
    'reminders' => 0,
];

try {
    $today_ops['pickups'] = (int) (fetch_one(
        "SELECT COUNT(*) AS n FROM bookings
          WHERE status IN ('Confirmed','Ready') AND DATE(start_at) = ?", [$today]
    )['n'] ?? 0);

    $today_ops['returns'] = (int) (fetch_one(
        "SELECT COUNT(*) AS n FROM bookings
          WHERE status = 'Active' AND DATE(return_at) = ?", [$today]
    )['n'] ?? 0);

    $today_ops['servicing'] = (int) (fetch_one(
        "SELECT COUNT(*) AS n FROM vehicles WHERE status = 'Maintenance'"
    )['n'] ?? 0);

    $today_ops['enquiries'] = (int) (fetch_one(
        "SELECT COUNT(*) AS n FROM enquiries WHERE status = 'New'"
    )['n'] ?? 0);
} catch (Throwable $e) {
    error_log('alerts: today failed: ' . $e->getMessage());
}

// Summed from the same alerts rather than queried again, so the figure at the
// top and the list under it can never disagree about what is owed.
foreach ($alerts as $alert) {
    // Reminders due today or already past, counted from the same list rather
    // than queried again.
    if ($alert['kind'] === 'reminder' && ($alert['days'] ?? 1) <= 0) {
        $today_ops['reminders']++;
    }
    if ($alert['kind'] === 'payment_due') {
        $today_ops['payments'] = money_add($today_ops['payments'], $alert['amount'] ?? '0.00');
    }
    if ($alert['kind'] === 'deposit_due') {
        $today_ops['deposits'] = money_add($today_ops['deposits'], $alert['amount'] ?? '0.00');
    }
}

json_out([
    'ok'      => true,
    'today'   => $today_ops + [
        'payments_label' => rupees($today_ops['payments']),
        'deposits_label' => rupees($today_ops['deposits']),
    ],
    'alerts'  => $alerts,
    'overdue' => count(array_filter($alerts, static fn(array $a): bool => $a['level'] === 'overdue')),
]);
