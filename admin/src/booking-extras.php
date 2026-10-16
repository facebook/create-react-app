<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/money.php';

/**
 * Charges raised after the booking was priced, and damage that explains them.
 *
 * Itemised rather than folded into other_charges, because "₹1,150 of other
 * charges" is not something a customer accepts and not something anyone can
 * explain a month later. Cleaning, fuel, a damage recharge and anything else
 * keep their own line, amount and note.
 *
 * Damage is a record, not money. An estimate is not a charge: some damage is
 * charged to the customer, some is held back from the deposit, some is
 * absorbed. The row says what happened to the car; how it was settled is a
 * booking_extras line or a refund deduction, and both point back at this.
 */

const EXTRA_KINDS = [
    'cleaning' => 'Cleaning',
    'fuel'     => 'Fuel',
    'damage'   => 'Damage',
    'late'     => 'Late return',
    'other'    => 'Other',
];

function booking_extras_ready(): bool
{
    return table_has_column('booking_extras', 'amount');
}

function booking_damages_ready(): bool
{
    return table_has_column('booking_damages', 'description');
}

/** Every live charge on a booking, oldest first. */
function booking_extras(int $bookingId): array
{
    if (!booking_extras_ready()) {
        return [];
    }
    try {
        return fetch_all(
            "SELECT id, kind, amount, note, created_at FROM booking_extras
              WHERE booking_id = ? AND status = 'active' ORDER BY id",
            [$bookingId]
        );
    } catch (Throwable $e) {
        error_log('booking_extras read failed: ' . $e->getMessage());
        return [];
    }
}

/**
 * What those charges add up to.
 *
 * Its own function because booking_money needs the number and nothing else,
 * and summing in the database keeps a booking with twenty lines to one query.
 */
function booking_extras_total(int $bookingId): string
{
    if (!booking_extras_ready()) {
        return '0.00';
    }
    try {
        $row = fetch_one(
            "SELECT COALESCE(SUM(amount), 0) AS s FROM booking_extras
              WHERE booking_id = ? AND status = 'active'",
            [$bookingId]
        );
        return money_add($row['s'] ?? '0.00');
    } catch (Throwable $e) {
        error_log('booking_extras total failed: ' . $e->getMessage());
        return '0.00';
    }
}

/** Every live damage record on a booking. */
function booking_damages(int $bookingId): array
{
    if (!booking_damages_ready()) {
        return [];
    }
    try {
        return fetch_all(
            "SELECT id, description, estimated_cost, noticed_at, note, created_at
               FROM booking_damages WHERE booking_id = ? AND status = 'active' ORDER BY id",
            [$bookingId]
        );
    } catch (Throwable $e) {
        error_log('booking_damages read failed: ' . $e->getMessage());
        return [];
    }
}
