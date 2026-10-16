<?php
declare(strict_types=1);

require_once __DIR__ . '/http.php';
require_once __DIR__ . '/money.php';
require_once __DIR__ . '/booking-extras.php';

/**
 * Booking rules that must hold regardless of which endpoint is calling.
 *
 * These live here rather than in the endpoints because the same guarantees
 * apply whether a booking is created, edited, or has money recorded against
 * it, and because they are the rules an auditor would check.
 */

const BOOKING_STATUSES  = ['Enquiry', 'Confirmed', 'Ready', 'Active', 'Returned', 'Completed', 'Cancelled'];
const BLOCKING_STATUSES = ['Confirmed', 'Ready', 'Active'];
const PAYMENT_KINDS     = ['advance', 'balance', 'additional', 'extra_km'];

/**
 * How the customer found us.
 *
 * A fixed list rather than free text, because the point is to count them and
 * "instagram", "Insta" and "IG" do not add up. Blank is allowed and common --
 * nobody should be blocked from taking a booking because they forgot to ask.
 */
const REFERRAL_SOURCES = [
    'google'       => 'Google search',
    'google_maps'  => 'Google Maps',
    'instagram'    => 'Instagram',
    'facebook'     => 'Facebook',
    'whatsapp'     => 'WhatsApp',
    'referral'     => 'Friend or family',
    'website'      => 'Our website',
    'repeat'       => 'Came back to us',
    'walk_in'      => 'Walked in',
    'other'        => 'Somewhere else',
];
const PAYMENT_METHODS   = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];
const FUEL_LEVELS       = ['Full', '3/4', '1/2', '1/4', 'Empty'];

/**
 * Rental duration in days, rounded up: any part of a day is a chargeable day,
 * and a booking is never zero days long.
 */
function rental_days(string $startAt, string $returnAt): int
{
    $start = strtotime($startAt);
    $end   = strtotime($returnAt);
    if ($start === false || $end === false || $end <= $start) {
        return 1;
    }
    return max(1, (int) ceil(($end - $start) / 86400));
}

/**
 * True when the vehicle is already committed for any part of this window.
 *
 * Two ranges overlap when each starts before the other ends. Completed and
 * cancelled bookings do not block — the car is back.
 */
function vehicle_double_booked(int $vehicleId, string $startAt, string $returnAt, ?int $excludeBookingId = null): ?array
{
    $placeholders = implode(',', array_fill(0, count(BLOCKING_STATUSES), '?'));
    $params = array_merge([$vehicleId], BLOCKING_STATUSES, [$returnAt, $startAt]);

    $sql = "SELECT id, booking_number, start_at, return_at
              FROM bookings
             WHERE vehicle_id = ?
               AND status IN ({$placeholders})
               AND start_at < ?
               AND return_at > ?";

    if ($excludeBookingId !== null) {
        $sql .= ' AND id <> ?';
        $params[] = $excludeBookingId;
    }

    return fetch_one($sql . ' LIMIT 1', $params);
}

/** The rate card in force for a vehicle today, used to freeze a booking's terms. */
function current_rate(int $vehicleId): ?array
{
    return fetch_one(
        'SELECT * FROM vehicle_rates
          WHERE vehicle_id = ? AND effective_from <= CURDATE()
       ORDER BY effective_from DESC, id DESC LIMIT 1',
        [$vehicleId]
    );
}

/** The live charge row for a booking — the newest one not superseded. */
function booking_charges(int $bookingId): ?array
{
    return fetch_one(
        'SELECT * FROM booking_charges WHERE booking_id = ? ORDER BY id DESC LIMIT 1',
        [$bookingId]
    );
}

/**
 * Total KM driven, from the live pickup and return readings.
 * A correction supersedes the reading it corrects, so only the newest active
 * row for each leg counts.
 */
function km_reading(int $bookingId, string $leg): ?array
{
    return fetch_one(
        "SELECT * FROM km_records
          WHERE booking_id = ? AND leg = ? AND status = 'active'
       ORDER BY id DESC LIMIT 1",
        [$bookingId, $leg]
    );
}

/**
 * Extra-KM position for a booking.
 *
 * Allowed KM is the booking's own frozen limit multiplied by its own frozen
 * duration — never today's rate card, so a price change never rewrites what a
 * past customer owed.
 */
function extra_km_position(int $bookingId): array
{
    $booking = fetch_one('SELECT * FROM bookings WHERE id = ?', [$bookingId]);
    $charges = booking_charges($bookingId);
    $pickup  = km_reading($bookingId, 'pickup');
    $return  = km_reading($bookingId, 'return');

    if ($booking === null || $charges === null || $pickup === null || $return === null) {
        return ['total_km' => 0, 'allowed_km' => 0, 'extra_km' => 0, 'extra_km_charge' => '0.00', 'complete' => false];
    }

    $totalKm   = max(0, (int) $return['odometer_km'] - (int) $pickup['odometer_km']);
    $allowedKm = (int) $charges['km_limit_per_day'] * (int) $booking['duration_days'];
    $extraKm   = max(0, $totalKm - $allowedKm);
    $charge    = money_times((string) $charges['extra_km_rate'], $extraKm);

    return [
        'total_km'        => $totalKm,
        'allowed_km'      => $allowedKm,
        'extra_km'        => $extraKm,
        'extra_km_charge' => $charge,
        'complete'        => true,
    ];
}

/**
 * What a booking is owed and what has been paid.
 *
 * Security deposits are excluded on purpose: that money is being held, not
 * earned, and folding it into revenue would overstate income and understate
 * what the customer is still owed back.
 */
function booking_money(int $bookingId): array
{
    $charges = booking_charges($bookingId);
    if ($charges === null) {
        return ['total' => '0.00', 'paid' => '0.00', 'balance' => '0.00',
                'extra_km_charge' => '0.00', 'deposit_held' => '0.00',
                'deposit_received' => '0.00', 'deposit_refunded' => '0.00',
                'deposit_deducted' => '0.00'];
    }

    $km = extra_km_position($bookingId);

    // Charges raised at return -- cleaning, fuel, a damage recharge -- each on
    // their own line rather than lumped into other_charges, where nobody could
    // tell afterwards what the number was made of.
    $extras = booking_extras_total($bookingId);

    // Recomputed rather than read back, so a return recorded after the
    // booking was created is reflected without needing an edit.
    $total = money_add($charges['base_rental'], $km['extra_km_charge'],
        $charges['other_charges'], $extras);
    $total = money_sub($total, $charges['discount']);

    $paid = fetch_one(
        "SELECT COALESCE(SUM(amount), 0) AS s FROM payments
          WHERE booking_id = ? AND status = 'active'",
        [$bookingId]
    )['s'] ?? '0.00';

    $deposit = fetch_one(
        "SELECT COALESCE(SUM(amount), 0) AS s FROM deposits
          WHERE booking_id = ? AND status = 'active'",
        [$bookingId]
    )['s'] ?? '0.00';

    $settled = fetch_one(
        "SELECT COALESCE(SUM(refund_amount), 0) AS refunded,
                COALESCE(SUM(deduction), 0)     AS deducted
           FROM refunds WHERE booking_id = ? AND status = 'active'",
        [$bookingId]
    ) ?? ['refunded' => '0.00', 'deducted' => '0.00'];
    $refunded = $settled['refunded'];
    $deducted = $settled['deducted'];

    // What the business actually earns on this booking, and what it owes on.
    //
    // On our own car the whole rental is ours. On somebody else's it is not:
    // the customer's money is mostly passed to the car's owner and what we
    // keep is the commission agreed when the booking was made. Counting the
    // full rental as revenue on a brokered hire overstates the business by the
    // owner's share, every time.
    $commission = $charges['commission'] ?? '0.00';
    $brokered   = money_cmp($commission, '0.00') > 0;
    $earned     = $brokered ? $commission : $total;
    $ownerDue   = $brokered ? money_sub($total, $commission) : '0.00';

    return [
        'total'            => $total,
        'extra_km_charge'  => $km['extra_km_charge'],
        'extras'           => $extras,
        'commission'       => money_add($commission),
        // The rental less the commission: what is collected on the owner's
        // behalf and has to reach them.
        'owner_payout'     => $ownerDue,
        'earned'           => $earned,
        'paid'             => money_add($paid),
        'balance'          => money_sub($total, $paid),
        // What is still owed back to the customer. A deduction is money the
        // business kept — it is settled, not held, so it comes off too.
        // Counting it as held would suggest a refund is still due when none is.
        'deposit_held'     => money_sub(money_sub($deposit, $refunded), $deducted),
        'deposit_received' => money_add($deposit),
        'deposit_refunded' => money_add($refunded),
        'deposit_deducted' => money_add($deducted),
    ];
}

/**
 * Payment status, derived rather than stored so it can never disagree with
 * the payment rows it describes.
 */
function payment_status(array $money): string
{
    $paid    = $money['paid'];
    $balance = $money['balance'];

    if (money_is_zero($paid))              return 'Unpaid';
    if (money_cmp($balance, '0.00') < 0)   return 'Overpaid';
    if (money_is_zero($balance))           return 'Fully Paid';
    return 'Partially Paid';
}

/**
 * Finds an existing customer by phone, or creates one.
 *
 * Phone is the practical identifier for a rental business — names are typed
 * differently every time, and matching on them would split one customer's
 * history across several records.
 */
function find_or_create_customer(array $data, int $userId): int
{
    $phone = preg_replace('/\s+/', '', $data['phone']);

    // Only the columns the database actually has. A panel one migration behind
    // still takes bookings; it simply does not keep the newer details yet.
    $extra = [];
    foreach (['whatsapp', 'licence_expiry', 'id_number', 'customer_type'] as $column) {
        if (table_has_column('customers', $column)) {
            $extra[] = $column;
        }
    }

    $existing = fetch_one('SELECT * FROM customers WHERE phone = ? LIMIT 1', [$phone]);
    if ($existing !== null) {
        // Fill in details we did not have before, without overwriting good
        // data with blanks. customer_type is the exception: someone explicitly
        // marking a customer Corporate is a correction, not a gap being filled.
        $updates = [];
        $params  = [];
        $fillable = array_merge(['name', 'address', 'licence_number'], $extra);

        foreach ($fillable as $column) {
            if (($data[$column] ?? '') === '' || $data[$column] === null) {
                continue;
            }
            $overwrite = $column === 'customer_type';
            if ($overwrite || empty($existing[$column])) {
                $updates[] = "{$column} = ?";
                $params[]  = $data[$column];
            }
        }
        if ($updates !== []) {
            $params[] = $existing['id'];
            query('UPDATE customers SET ' . implode(', ', $updates) . ' WHERE id = ?', $params);
        }
        return (int) $existing['id'];
    }

    $columns = ['name', 'phone', 'address', 'licence_number'];
    $values  = [$data['name'], $phone, $data['address'] ?? null, $data['licence_number'] ?? null];

    // Only the extras the caller actually gave. Leaving a column out is not
    // the same as writing NULL into it: customer_type is NOT NULL with a
    // default of 'New', so a null refused the whole insert -- and turning an
    // enquiry into a booking died there, because an enquiry has no customer
    // type to send and should not have to invent one. Left out, the column
    // takes its own default, which is what "no answer" means.
    foreach ($extra as $column) {
        $value = $data[$column] ?? '';
        if ($value === '' || $value === null) {
            continue;
        }
        $columns[] = $column;
        $values[]  = $value;
    }

    $columns[] = 'created_by';
    $values[]  = $userId;

    query(
        'INSERT INTO customers (' . implode(', ', $columns) . ') VALUES ('
        . implode(',', array_fill(0, count($columns), '?')) . ')',
        $values
    );
    return last_insert_id();
}
