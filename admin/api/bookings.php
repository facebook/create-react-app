<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/booking.php';
require_once __DIR__ . '/../src/booking-files.php';
require_once __DIR__ . '/../src/booking-extras.php';
require_once __DIR__ . '/../src/customer-files.php';

/**
 * Bookings.
 *
 * A booking freezes its own commercial terms at creation. It copies the rate,
 * KM allowance, extra-KM rate and deposit from the vehicle's rate card into
 * booking_charges and never reads the live rate again — so changing a price
 * next month leaves every past booking exactly as it was agreed.
 *
 * The double-booking check runs on the server inside the same transaction as
 * the insert. A check in the browser only stops the careless case; two
 * requests arriving together would both pass it.
 */

$action = $_GET['action'] ?? ($_SERVER['REQUEST_METHOD'] === 'POST' ? 'save' : 'list');

switch ($action) {

    // ---------------------------------------------------------------- list --
    case 'list': {
        api_guard('booking.view');

        $status = $_GET['status'] ?? '';
        $params = [];
        $where  = '1=1';

        if ($status !== '' && in_array($status, BOOKING_STATUSES, true)) {
            $where = 'b.status = ?';
            $params[] = $status;
        }

        $rows = fetch_all(
            "SELECT b.*, c.name AS customer_name, c.phone AS customer_phone,
                    v.name AS vehicle_name" . booking_vehicle_columns() . booking_customer_columns() . "
               FROM bookings b
               JOIN customers c ON c.id = b.customer_id
               JOIN vehicles  v ON v.id = b.vehicle_id
              WHERE {$where}
           ORDER BY b.start_at DESC, b.id DESC",
            $params
        );

        json_out(['bookings' => array_map(
            static fn(array $r): array => present_booking($r, false),
            $rows
        )]);
    }

    // ----------------------------------------------------------------- get --
    case 'get': {
        api_guard('booking.view');
        $id = (int) ($_GET['id'] ?? 0);

        $row = fetch_one(
            "SELECT b.*, c.name AS customer_name, c.phone AS customer_phone,
                    c.address AS customer_address, c.licence_number,
                    v.name AS vehicle_name" . booking_vehicle_columns() . booking_customer_columns() . "
               FROM bookings b
               JOIN customers c ON c.id = b.customer_id
               JOIN vehicles  v ON v.id = b.vehicle_id
              WHERE b.id = ?",
            [$id]
        );
        if ($row === null) {
            json_error('That booking no longer exists.', 404);
        }

        json_out(['booking' => present_booking($row, true)]);
    }

    // -------------------------------------------------------------- delete --
    //
    // Cancelled bookings only, and only once no money is attached to them. A
    // cancelled booking that still holds a payment or a deposit is not
    // finished -- it is a refund waiting to be made, and deleting it would
    // take the only record of the money owed with it.
    //
    // Cancelling is still the ordinary ending. This is for the ones that
    // should never have existed: a test, a duplicate, a booking taken against
    // the wrong car and remade against the right one.
    case 'delete': {
        $user  = api_guard('booking.delete', true);
        $input = json_input();
        $id    = (int) ($input['id'] ?? 0);

        $booking = fetch_one('SELECT * FROM bookings WHERE id = ?', [$id]);
        if ($booking === null) {
            json_error('That booking no longer exists.', 404);
        }

        // Everything this booking works out -- what was charged, what came in,
        // what is held, what the extra kilometres came to -- is deleted with
        // it, so the figures in Finance and in every report stop counting a
        // booking that is not there. That is the whole point of removing one,
        // and doing half of it would leave income with nothing behind it.
        //
        // Two things are deliberately kept. An expense is money that really
        // left the business, so it keeps its amount and loses the booking. And
        // the audit trail keeps its rows: what the booking said is gone, but
        // that it existed, what it held and who removed it is the record that
        // makes the ledger explainable afterwards.
        $money = booking_money($id);

        audit_log('booking_deleted', 'bookings', 'booking', $id,
            ['booking_number'   => $booking['booking_number'],
             'status'           => $booking['status'],
             'start_at'         => $booking['start_at'],
             'return_at'        => $booking['return_at'],
             'payments_removed' => $money['paid'],
             'deposit_removed'  => $money['deposit_held'],
             'was_owed'         => $money['balance']],
            null, $booking['cancelled_reason'] ?? null,
            (int) $user['id'], $user['name'], null,
            (int) $booking['customer_id'], (int) $booking['vehicle_id']);

        // The attachments are files on disk as well as rows. Collected before
        // the rows go, because afterwards there is nothing left saying which
        // files belonged to this booking and they would sit in storage forever.
        $attachments = [];
        if (booking_files_ready()) {
            foreach (booking_files($id) as $group) {
                foreach ($group as $file) {
                    $attachments[] = (int) $file['id'];
                }
            }
        }
        foreach ($attachments as $fileId) {
            booking_file_delete($fileId);
        }

        transaction(function () use ($id) {
            // An approval points at the row it is about, not at the booking,
            // so those go first or they are left pointing at nothing.
            foreach ([['payment', 'payments'], ['deposit', 'deposits'], ['refund', 'refunds'],
                      ['km_record', 'km_records'], ['booking_charge', 'booking_charges']] as [$kind, $table]) {
                if (table_has_column('approvals', 'subject_id') && table_has_column($table, 'booking_id')) {
                    query("DELETE a FROM approvals a
                             JOIN {$table} t ON t.id = a.subject_id
                            WHERE a.subject_type = ? AND t.booking_id = ?", [$kind, $id]);
                }
            }
            if (table_has_column('documents', 'owner_type')) {
                query("DELETE FROM documents WHERE owner_type = 'booking' AND owner_id = ?", [$id]);
            }

            // Children first, refunds before the deposits they came out of:
            // the order is what makes the delete work rather than fail halfway.
            foreach (['refunds', 'deposits', 'payments', 'km_records', 'booking_extras',
                      'booking_damages', 'booking_files', 'booking_charges', 'reminders'] as $table) {
                if (table_has_column($table, 'booking_id')) {
                    query("DELETE FROM {$table} WHERE booking_id = ?", [$id]);
                }
            }

            // Money that really was spent keeps its amount and loses the
            // booking. Deleting it would quietly make the business look more
            // profitable than it was.
            if (table_has_column('expenses', 'booking_id')) {
                query('UPDATE expenses SET booking_id = NULL WHERE booking_id = ?', [$id]);
            }

            // The enquiry it came from goes back to being an enquiry, rather
            // than staying Converted into a booking that no longer exists.
            query("UPDATE enquiries SET status = 'Accepted', booking_id = NULL
                    WHERE booking_id = ?", [$id]);

            // The audit trail keeps its rows but stops pointing at a booking
            // that is not there.
            query('UPDATE audit_logs SET booking_id = NULL WHERE booking_id = ?', [$id]);
            query('DELETE FROM bookings WHERE id = ?', [$id]);
        });

        // A car that went out on this booking and never came back would sit on
        // "On Rental" for good, because the return that frees it has just been
        // deleted along with everything else.
        $vehicleId = (int) $booking['vehicle_id'];
        $stillOut  = fetch_one(
            "SELECT b.id FROM bookings b
               JOIN km_records k ON k.booking_id = b.id AND k.leg = 'pickup' AND k.status = 'active'
              WHERE b.vehicle_id = ? AND b.status = 'Active' LIMIT 1",
            [$vehicleId]
        );
        if ($stillOut === null) {
            query("UPDATE vehicles SET status = 'Available'
                    WHERE id = ? AND status = 'On Rental'", [$vehicleId]);
        }

        json_out([
            'ok'       => true,
            'deleted'  => $booking['booking_number'],
            'removed'  => ['payments' => $money['paid'], 'deposit' => $money['deposit_held']],
        ]);
    }

    // ---------------------------------------------------------------- save --
    case 'save': {
        $user  = api_guard('booking.create', true);
        $input = json_input();
        $id    = isset($input['id']) && $input['id'] !== '' ? (int) $input['id'] : null;

        $data = (new Validator($input))
            ->required('customer_name', 'Customer name')
            ->phone('phone', 'phone number')
            ->required('licence_number', 'Driving licence number')
            ->optional('address', 255)
            ->optional('pickup_location', 190)
            ->optional('return_location', 190)
            ->optional('notes', 2000)
            ->integer('vehicle_id', 'Vehicle', 1)
            ->required('start_at', 'Start date and time')
            ->required('return_at', 'Return date and time')
            ->optional('balance_due_on', 10)
            ->phone('whatsapp', 'WhatsApp number', false)
            ->optional('licence_expiry', 10)
            ->optional('id_number', 40)
            ->integer('estimated_km', 'Estimated KM', 0, 999999, false)
            ->money('discount', 'Discount', false)
            ->money('other_charges', 'Other charges', false)
            ->money('base_rental', 'Rental amount')
            ->integer('km_limit_per_day', 'KM limit', 0, 5000)
            ->money('extra_km_rate', 'Extra KM rate')
            ->orFail();

        $startAt  = normalise_datetime($data['start_at']);
        $returnAt = normalise_datetime($data['return_at']);
        if ($startAt === null || $returnAt === null) {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['start_at' => 'Dates and times must be valid.']]);
        }
        if (strtotime($returnAt) <= strtotime($startAt)) {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['return_at' => 'The return must be after the start.']]);
        }

        $vehicle = fetch_one('SELECT * FROM vehicles WHERE id = ?', [(int) $data['vehicle_id']]);
        if ($vehicle === null) {
            json_error('That vehicle no longer exists.', 404);
        }

        $days = rental_days($startAt, $returnAt);

        $result = transaction(function () use ($id, $data, $startAt, $returnAt, $days, $vehicle, $user) {
            $vehicleId = (int) $data['vehicle_id'];

            $clash = vehicle_double_booked($vehicleId, $startAt, $returnAt, $id);
            if ($clash !== null) {
                json_error(
                    "{$vehicle['name']} is already booked for those dates ({$clash['booking_number']}: "
                    . date('d M, H:i', strtotime((string) $clash['start_at'])) . ' → '
                    . date('d M, H:i', strtotime((string) $clash['return_at'])) . ').',
                    409
                );
            }

            $customerId = find_or_create_customer([
                'name'           => $data['customer_name'],
                'phone'          => $data['phone'],
                'address'        => $data['address'],
                'licence_number' => $data['licence_number'],
                'whatsapp'       => $data['whatsapp'] ?? '',
                'licence_expiry' => $data['licence_expiry'] ?? '',
                'id_number'      => $data['id_number'] ?? '',
                'customer_type'  => in_array($input['customer_type'] ?? '', ['New', 'Returning', 'Corporate'], true)
                    ? $input['customer_type'] : '',
            ], (int) $user['id']);

            // Written only where the column exists, so a panel whose database
            // is one migration behind still takes bookings.
            $dueReady = table_has_column('bookings', 'balance_due_on');
            $dueOn    = trim((string) ($data['balance_due_on'] ?? ''));
            $dueOn    = $dueOn === '' ? null : $dueOn;

            $estReady = table_has_column('bookings', 'estimated_km');
            $estimate = ($data['estimated_km'] ?? null) === null ? null : (int) $data['estimated_km'];

            $refReady = table_has_column('bookings', 'referral_source');
            $referral = isset(REFERRAL_SOURCES[(string) ($input['referral_source'] ?? '')])
                ? (string) $input['referral_source'] : null;

            if ($id === null) {
                $number = next_number('NSC');
                query(
                    'INSERT INTO bookings
                       (booking_number, customer_id, vehicle_id, vehicle_reg_number,
                        start_at, return_at, duration_days, pickup_location,
                        return_location, status, notes, created_by'
                      . ($dueReady ? ', balance_due_on' : '')
                      . ($estReady ? ', estimated_km' : '')
                      . ($refReady ? ', referral_source' : '') . ')
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?'
                      . ($dueReady ? ',?' : '') . ($estReady ? ',?' : '')
                      . ($refReady ? ',?' : '') . ')',
                    array_merge(
                        [$number, $customerId, $vehicleId, $vehicle['reg_number'],
                         $startAt, $returnAt, $days, $data['pickup_location'],
                         $data['return_location'], 'Confirmed', $data['notes'], $user['id']],
                        $dueReady ? [$dueOn] : [],
                        $estReady ? [$estimate] : [],
                        $refReady ? [$referral] : []
                    )
                );
                $bookingId = last_insert_id();

                audit_log('booking_created', 'bookings', 'booking', $bookingId, null,
                    ['booking_number' => $number, 'vehicle' => $vehicle['name'],
                     'start_at' => $startAt, 'return_at' => $returnAt],
                    null, (int) $user['id'], $user['name'], $bookingId, $customerId, $vehicleId);
            } else {
                $before = fetch_one('SELECT * FROM bookings WHERE id = ?', [$id]);
                if ($before === null) {
                    json_error('That booking no longer exists.', 404);
                }
                if (in_array($before['status'], ['Completed', 'Cancelled'], true)) {
                    json_error('A ' . strtolower((string) $before['status']) . ' booking cannot be edited.', 409);
                }

                $bookingId = $id;
                query(
                    'UPDATE bookings SET customer_id = ?, vehicle_id = ?, vehicle_reg_number = ?,
                            start_at = ?, return_at = ?, duration_days = ?, pickup_location = ?,
                            return_location = ?, notes = ?'
                      . ($dueReady ? ', balance_due_on = ?' : '')
                      . ($estReady ? ', estimated_km = ?' : '')
                      . ($refReady ? ', referral_source = ?' : '') . '
                      WHERE id = ?',
                    array_merge(
                        [$customerId, $vehicleId, $vehicle['reg_number'], $startAt, $returnAt,
                         $days, $data['pickup_location'], $data['return_location'], $data['notes']],
                        $dueReady ? [$dueOn] : [],
                        $estReady ? [$estimate] : [],
                        $refReady ? [$referral] : [],
                        [$bookingId]
                    )
                );
                $after = fetch_one('SELECT * FROM bookings WHERE id = ?', [$bookingId]);
                [$prev, $curr] = diff_changes($before, $after ?? []);
                if ($curr !== []) {
                    audit_log('booking_updated', 'bookings', 'booking', $bookingId, $prev, $curr,
                        null, (int) $user['id'], $user['name'], $bookingId, $customerId, $vehicleId);
                }
            }

            // The commercial terms, frozen. Taken from the rate card where the
            // form did not override them, so a booking always carries its own
            // copy rather than pointing at a rate that can move.
            $rate = current_rate($vehicleId);
            $existing = booking_charges($bookingId);

            $baseRental = $data['base_rental'];
            $kmLimit    = (int) $data['km_limit_per_day'];
            $extraRate  = $data['extra_km_rate'];

            // What the business keeps when the car belongs to somebody else.
            // Zero on our own cars, and zero is also what an older database
            // without the column reads back, so the arithmetic below is the
            // same either way.
            // A discount is a decision, and one nobody could record until now:
            // the columns existed and no form wrote to them, so an amount that
            // was not the rate card amount had no explanation anywhere.
            $discount = money_add((string) ($data['discount'] ?? ($existing['discount'] ?? '0.00')));
            $otherChg = money_add((string) ($data['other_charges'] ?? ($existing['other_charges'] ?? '0.00')));

            $commissionReady = table_has_column('booking_charges', 'commission');
            $commission = $commissionReady
                ? money_add((string) ($input['commission'] ?? ($existing['commission'] ?? '0.00')))
                : '0.00';
            $deposit    = $existing['deposit_required'] ?? ($rate['security_deposit'] ?? '0.00');
            $rateDaily  = $existing['rate_daily'] ?? ($rate['rate_daily'] ?? '0.00');

            // A discount bigger than the bill is a typo every time, and left
            // alone it makes the booking's total negative -- which reads as
            // the business owing the customer before they have paid anything,
            // and carries straight into the revenue figures. The form shows
            // zero in that case; the server should not quietly store less.
            $billed = money_add($baseRental, $otherChg);
            if (money_cmp($discount, $billed) > 0) {
                json_error('Please correct the highlighted fields.', 422,
                    ['fields' => ['discount' =>
                        'The discount cannot be more than the ' . rupees($billed)
                        . ' being charged.']]);
            }

            $total = money_sub($billed, $discount);

            $changed = $existing === null
                || money_cmp($existing['base_rental'], $baseRental) !== 0
                || (int) $existing['km_limit_per_day'] !== $kmLimit
                || money_cmp($existing['extra_km_rate'], $extraRate) !== 0
                || ($commissionReady && money_cmp($existing['commission'] ?? '0.00', $commission) !== 0)
                || money_cmp($existing['discount'] ?? '0.00', $discount) !== 0
                || money_cmp($existing['other_charges'] ?? '0.00', $otherChg) !== 0;

            if ($changed) {
                query(
                    'INSERT INTO booking_charges
                       (booking_id, supersedes_id, rate_daily, km_limit_per_day, extra_km_rate,
                        deposit_required, base_rental, other_charges, discount, total, reason, created_by'
                      . ($commissionReady ? ', commission' : '') . ')
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?' . ($commissionReady ? ',?' : '') . ')',
                    array_merge(
                        [$bookingId, $existing['id'] ?? null, $rateDaily, $kmLimit, $extraRate,
                         $deposit, $baseRental, $otherChg, $discount, $total,
                         $existing === null ? 'Booking created' : 'Charges revised', $user['id']],
                        $commissionReady ? [$commission] : []
                    )
                );
                if ($existing !== null) {
                    audit_log('booking_charges_revised', 'bookings', 'booking', $bookingId,
                        ['base_rental' => $existing['base_rental'], 'km_limit_per_day' => $existing['km_limit_per_day'],
                         'extra_km_rate' => $existing['extra_km_rate']],
                        ['base_rental' => $baseRental, 'km_limit_per_day' => $kmLimit,
                         'extra_km_rate' => $extraRate],
                        null, (int) $user['id'], $user['name'], $bookingId, $customerId, $vehicleId);
                }
            }

            return $bookingId;
        });

        $row = fetch_one(
            "SELECT b.*, c.name AS customer_name, c.phone AS customer_phone,
                    c.address AS customer_address, c.licence_number, v.name AS vehicle_name
               FROM bookings b JOIN customers c ON c.id = b.customer_id
               JOIN vehicles v ON v.id = b.vehicle_id WHERE b.id = ?",
            [$result]
        );
        json_out(['booking' => present_booking($row ?? [], true)]);
    }

    // -------------------------------------------------------------- cancel --
    case 'cancel': {
        $user  = api_guard('booking.cancel', true);
        $input = json_input();
        $id    = (int) ($input['id'] ?? 0);
        $reason = trim((string) ($input['reason'] ?? ''));

        $booking = fetch_one('SELECT * FROM bookings WHERE id = ?', [$id]);
        if ($booking === null) {
            json_error('That booking no longer exists.', 404);
        }
        if ($booking['status'] === 'Cancelled') {
            json_error('That booking is already cancelled.', 409);
        }
        if ($booking['status'] === 'Completed') {
            json_error('A completed booking cannot be cancelled.', 409);
        }
        if ($reason === '') {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['reason' => 'A reason is required when cancelling.']]);
        }

        // Who decided, and when. A cancellation with only a reason cannot
        // answer the question that comes up a month later -- whether a fee was
        // right to keep -- because nobody remembers whose choice it was.
        $by = ($input['cancelled_by'] ?? '') === 'customer' ? 'customer' : 'admin';
        $detail = table_has_column('bookings', 'cancelled_at');

        query(
            "UPDATE bookings SET status = 'Cancelled', cancelled_reason = ?"
            . ($detail ? ", cancelled_at = NOW(), cancelled_by = ?" : '')
            . ' WHERE id = ?',
            $detail ? [$reason, $by, $id] : [$reason, $id]
        );

        // A cancellation fee is a charge like any other, so it goes where
        // every other charge goes rather than into a column of its own. That
        // keeps it in the total, in the balance and on the booking's bill
        // without a second set of arithmetic that can drift from the first.
        $fee     = money_add((string) ($input['cancellation_fee'] ?? '0.00'));
        $charged = money_cmp($fee, '0.00') > 0;
        $feeKept = false;
        if ($charged && booking_extras_ready()) {
            query('INSERT INTO booking_extras (booking_id, kind, amount, note, created_by)
                   VALUES (?,?,?,?,?)',
                [$id, 'other', $fee, 'Cancellation fee', $user['id']]);
            $feeKept = true;
        }
        audit_log('booking_cancelled', 'bookings', 'booking', $id,
            ['status' => $booking['status']], ['status' => 'Cancelled'], $reason,
            (int) $user['id'], $user['name'], $id,
            (int) $booking['customer_id'], (int) $booking['vehicle_id']);

        // Recomputed after the fee, so the number quoted is what is actually
        // owed back rather than what was owed a moment ago.
        $after = booking_money($id);

        // A fee asked for and not recorded is money quietly lost, so say so
        // rather than reporting a clean cancellation. It only happens on a
        // panel that has not run the migration yet.
        $notes = [];
        if ($charged && !$feeKept) {
            $notes[] = 'The ' . $fee . ' cancellation fee could not be recorded on this'
                . ' booking — this panel is a database update behind. Reload the panel'
                . ' and add it as a charge.';
        }
        if (!money_is_zero($after['paid']) || !money_is_zero($after['deposit_held'])) {
            $notes[] = 'This booking still holds '
                . money_add($after['paid'], $after['deposit_held'])
                . ' in payments and deposits'
                . ($feeKept ? ', against a ' . $fee . ' cancellation fee' : '')
                . '. Refund the difference separately.';
        }

        json_out([
            'ok'      => true,
            'warning' => $notes === [] ? null : implode(' ', $notes),
        ]);
    }

    // ------------------------------------------------------------ complete --
    case 'complete': {
        $user  = api_guard('booking.complete', true);
        $input = json_input();
        $id    = (int) ($input['id'] ?? 0);

        $booking = fetch_one('SELECT * FROM bookings WHERE id = ?', [$id]);
        if ($booking === null) {
            json_error('That booking no longer exists.', 404);
        }
        if ($booking['status'] === 'Completed') {
            json_error('That booking is already completed.', 409);
        }
        if ($booking['status'] === 'Cancelled') {
            json_error('A cancelled booking cannot be completed.', 409);
        }

        // Completing without a return reading would leave the extra-KM charge
        // uncalculated forever, and the booking's total wrong.
        if (km_reading($id, 'return') === null) {
            json_error('Record the vehicle return first — the extra-KM charge depends on the closing odometer reading.', 409);
        }

        query("UPDATE bookings SET status = 'Completed' WHERE id = ?", [$id]);
        audit_log('booking_completed', 'bookings', 'booking', $id,
            ['status' => $booking['status']], ['status' => 'Completed'], null,
            (int) $user['id'], $user['name'], $id,
            (int) $booking['customer_id'], (int) $booking['vehicle_id']);

        $money = booking_money($id);
        json_out([
            'ok' => true,
            'warning' => money_is_zero($money['balance']) ? null
                : 'Outstanding balance of ' . $money['balance'] . ' on this booking.',
        ]);
    }

    default:
        json_error('Unknown action', 404);
}

// ---------------------------------------------------------------- helpers --

/** Accepts "2026-01-05 10:00" or separate date and time already joined. */
function normalise_datetime(string $value): ?string
{
    $value = trim(str_replace('T', ' ', $value));
    $time  = strtotime($value);
    return $time === false ? null : date('Y-m-d H:i:s', $time);
}

/**
 * The vehicle columns a booking query can select.
 *
 * Empty until 009_commission.sql has run. Naming a column that is not there
 * fails the whole query, which would take the bookings list down rather than
 * showing every car as ours -- and showing every car as ours is exactly what
 * the panel did before the column existed.
 */
/**
 * A pickup or return reading, with its checklist decoded.
 *
 * Stored as JSON so the list of checks can change without a schema change;
 * decoded here so every caller does not have to know that.
 */
function km_leg(int $bookingId, string $leg): ?array
{
    $row = km_reading($bookingId, $leg);
    if ($row === null) {
        return null;
    }
    $checklist = json_decode((string) ($row['checklist'] ?? ''), true);
    $row['checklist'] = is_array($checklist) ? $checklist : null;
    return $row;
}

function booking_customer_columns(): string
{
    $out = '';
    foreach (['whatsapp', 'licence_expiry', 'id_number', 'customer_type'] as $column) {
        if (table_has_column('customers', $column)) {
            $out .= ", c.{$column}";
        }
    }
    return $out;
}

function booking_vehicle_columns(): string
{
    return table_has_column('vehicles', 'ownership')
        ? ', v.ownership, v.owner_name, v.owner_phone, v.is_temporary'
        : '';
}

function present_booking(array $row, bool $detailed): array
{
    if ($row === []) {
        return [];
    }
    $id      = (int) $row['id'];
    $money   = booking_money($id);
    $charges = booking_charges($id);

    $out = [
        'id'              => $id,
        'booking_number'  => $row['booking_number'],
        'status'          => $row['status'],
        'customer_name'   => $row['customer_name'],
        'customer_phone'  => $row['customer_phone'],
        'vehicle_id'      => (int) $row['vehicle_id'],
        'vehicle_name'    => $row['vehicle_name'],
        'vehicle_reg'     => $row['vehicle_reg_number'],
        'start_at'        => $row['start_at'],
        'return_at'       => $row['return_at'],
        'duration_days'   => (int) $row['duration_days'],
        'total'           => (float) $money['total'],
        'commission'      => (float) $money['commission'],
        'owner_payout'    => (float) $money['owner_payout'],
        // Revenue, once the owner's share of a brokered hire is taken out.
        // Every total on the dashboard and in the reports works from this
        // rather than from 'total', which is what the customer pays.
        'earned'          => (float) $money['earned'],
        'extras_total'    => (float) $money['extras'],
        'ownership'       => $row['ownership'] ?? 'own',
        'owner_name'      => $row['owner_name'] ?? null,
        'balance_due_on'  => $row['balance_due_on'] ?? null,
        'referral_source' => $row['referral_source'] ?? null,
        'cancelled_at'    => $row['cancelled_at'] ?? null,
        'cancelled_by'    => $row['cancelled_by'] ?? null,
        'estimated_km'    => $row['estimated_km'] === null ? null : (int) $row['estimated_km'],
        'customer_type'   => $row['customer_type'] ?? 'New',
        'paid'            => (float) $money['paid'],
        'balance'         => (float) $money['balance'],
        'payment_status'  => payment_status($money),
        'deposit_held'    => (float) $money['deposit_held'],
    ];

    // KM travels with the summary as well as the detail: the reports work
    // from the list, and re-fetching every booking to total a column would
    // turn one query into hundreds.
    $km = extra_km_position($id);
    $out['total_km']        = $km['total_km'];
    $out['allowed_km']      = $km['allowed_km'];
    $out['extra_km']        = $km['extra_km'];
    $out['extra_km_charge'] = (float) $km['extra_km_charge'];
    $out['deposit_received'] = (float) $money['deposit_received'];
    $out['deposit_refunded'] = (float) $money['deposit_refunded'];

    if (!$detailed) {
        return $out;
    }

    return $out + [
        'customer_id'      => (int) $row['customer_id'],
        'customer_address' => $row['customer_address'] ?? null,
        'licence_number'   => $row['licence_number'] ?? null,
        'whatsapp'         => $row['whatsapp'] ?? null,
        'licence_expiry'   => $row['licence_expiry'] ?? null,
        'id_number'        => $row['id_number'] ?? null,
        'documents'        => customer_files((int) $row['customer_id']),
        // Itemised, so a total nobody can explain is not possible here.
        'extras'  => array_map(static fn(array $e): array => [
            'id'     => (int) $e['id'],
            'kind'   => $e['kind'],
            'label'  => EXTRA_KINDS[$e['kind']] ?? 'Other',
            'amount' => (float) $e['amount'],
            'note'   => $e['note'],
        ], booking_extras($id)),
        'damages' => array_map(static fn(array $d): array => [
            'id'             => (int) $d['id'],
            'description'    => $d['description'],
            'estimated_cost' => (float) $d['estimated_cost'],
            'noticed_at'     => $d['noticed_at'],
            'note'           => $d['note'],
        ], booking_damages($id)),
        'pickup_location'  => $row['pickup_location'],
        'return_location'  => $row['return_location'],
        'notes'            => $row['notes'],
        'cancelled_reason' => $row['cancelled_reason'],
        'charges' => $charges === null ? null : [
            'rate_daily'       => (float) $charges['rate_daily'],
            'km_limit_per_day' => (int) $charges['km_limit_per_day'],
            'extra_km_rate'    => (float) $charges['extra_km_rate'],
            'deposit_required' => (float) $charges['deposit_required'],
            'base_rental'      => (float) $charges['base_rental'],
            'other_charges'    => (float) $charges['other_charges'],
            'discount'         => (float) $charges['discount'],
            'commission'       => (float) ($charges['commission'] ?? 0),
        ],
        'km' => [
            'total_km'        => (int) $km['total_km'],
            'allowed_km'      => (int) $km['allowed_km'],
            'extra_km'        => (int) $km['extra_km'],
            // Cast for the browser: left as a string it formats as 2000.00
            // rather than ₹2,000.
            'extra_km_charge' => (float) $km['extra_km_charge'],
            'complete'        => (bool) $km['complete'],
        ],
        'deposit_received' => (float) $money['deposit_received'],
        'deposit_refunded' => (float) $money['deposit_refunded'],
        'deposit_deducted' => (float) ($money['deposit_deducted'] ?? 0),
        'payments' => array_map(static fn(array $p): array => [
            'id'         => (int) $p['id'],
            'number'     => $p['payment_number'],
            'kind'       => $p['kind'],
            'amount'     => (float) $p['amount'],
            'paid_on'    => $p['paid_on'],
            'method'     => $p['method'],
            'reference'  => $p['reference'],
            'notes'      => $p['notes'],
            'status'     => $p['status'],
            'corrects_id'=> $p['corrects_id'] === null ? null : (int) $p['corrects_id'],
        ], fetch_all('SELECT * FROM payments WHERE booking_id = ? ORDER BY id', [$id])),
        'deposits' => array_map(static fn(array $d): array => [
            'id'          => (int) $d['id'],
            'amount'      => (float) $d['amount'],
            'received_on' => $d['received_on'],
            'method'      => $d['method'],
            'reference'   => $d['reference'],
            'status'      => $d['status'],
        ], fetch_all('SELECT * FROM deposits WHERE booking_id = ? ORDER BY id', [$id])),
        'refunds' => array_map(static fn(array $r): array => [
            'id'            => (int) $r['id'],
            'deduction'     => (float) $r['deduction'],
            'reason'        => $r['deduction_reason'],
            'refund_amount' => (float) $r['refund_amount'],
            'refunded_on'   => $r['refunded_on'],
            'method'        => $r['method'],
            'reference'     => $r['reference'],
            // So the screen can tell a refund that stands from one that was
            // corrected, and offer to change only the first.
            'status'        => $r['status'],
        ], fetch_all('SELECT * FROM refunds WHERE booking_id = ? ORDER BY id', [$id])),
        'pickup' => km_leg($id, 'pickup'),
        'return' => km_leg($id, 'return'),
        // Grouped by kind, so each section of the detail screen shows its own
        // attachments and nothing else.
        'files' => booking_files($id),
        'timeline' => fetch_all(
            'SELECT action, reason, created_at, user_label FROM audit_logs
              WHERE booking_id = ? ORDER BY id', [$id]
        ),
    ];
}
