<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/booking.php';

/**
 * Vehicle handover: the odometer readings taken at pickup and return.
 *
 * These two numbers decide the extra-KM charge, so they are treated as
 * evidence rather than as editable fields. A misread meter is corrected by a
 * new record that cites the one it replaces and says why; the original
 * reading stays readable, and the difference between the two is visible.
 *
 * Recording a pickup or return also moves the vehicle: out on rental, or back
 * on the lot with its odometer brought up to date.
 */

/**
 * The handover checklist, as a JSON string to store, or null.
 *
 * Only the items the panel actually sent, and only as ticked or not -- so a
 * checklist saved today is still readable after the list changes, and an item
 * that did not exist then simply is not in it.
 */
function checklist_json(mixed $sent): ?string
{
    if (!is_array($sent) || $sent === []) {
        return null;
    }
    $clean = [];
    foreach ($sent as $key => $value) {
        $key = substr(preg_replace('/[^a-z0-9_-]/i', '', (string) $key) ?? '', 0, 40);
        if ($key !== '') {
            $clean[$key] = (bool) $value;
        }
    }
    return $clean === [] ? null : json_encode($clean);
}

/** Whether this database can store one yet. */
function checklist_ready(): bool
{
    return table_has_column('km_records', 'checklist');
}

$action = $_GET['action'] ?? '';

switch ($action) {

    // ------------------------------------------------------------- pickup --
    case 'pickup': {
        $user  = api_guard('km.create', true);
        $input = json_input();

        $data = (new Validator($input))
            ->integer('booking_id', 'Booking', 1)
            ->integer('odometer_km', 'Starting KM', 0, 9999999)
            ->required('recorded_at', 'Pickup date and time')
            ->inList('fuel_level', 'Fuel level', FUEL_LEVELS, false)
            ->optional('condition_note', 255)
            ->optional('notes', 255)
            ->orFail();

        $booking = booking_for_km((int) $data['booking_id']);

        if (km_reading((int) $booking['id'], 'pickup') !== null) {
            json_error('Pickup has already been recorded for this booking. Correct the reading instead.', 409);
        }

        $recordedAt = normalise_dt($data['recorded_at']);

        $checklistReady = checklist_ready();
        $checklist      = checklist_json($input['checklist'] ?? null);

        $id = transaction(function () use ($data, $booking, $recordedAt, $user, $checklistReady, $checklist) {
            query(
                'INSERT INTO km_records
                   (booking_id, leg, odometer_km, recorded_at, fuel_level,
                    condition_note, notes, created_by'
                  . ($checklistReady ? ', checklist' : '') . ')
                 VALUES (?, \'pickup\', ?,?,?,?,?,?' . ($checklistReady ? ',?' : '') . ')',
                array_merge(
                    [$booking['id'], $data['odometer_km'], $recordedAt, $data['fuel_level'],
                     $data['condition_note'], $data['notes'], $user['id']],
                    $checklistReady ? [$checklist] : []
                )
            );
            $recordId = last_insert_id();

            query("UPDATE bookings SET status = 'Active' WHERE id = ?", [$booking['id']]);
            query("UPDATE vehicles SET status = 'On Rental' WHERE id = ?", [$booking['vehicle_id']]);

            audit_log('vehicle_picked_up', 'km', 'km_record', $recordId, null,
                ['odometer_km' => $data['odometer_km'], 'fuel_level' => $data['fuel_level'],
                 'recorded_at' => $recordedAt],
                null, (int) $user['id'], $user['name'],
                (int) $booking['id'], (int) $booking['customer_id'], (int) $booking['vehicle_id']);

            return $recordId;
        });

        json_out(['km_record_id' => $id, 'km' => extra_km_position((int) $booking['id'])]);
    }

    // ------------------------------------------------------------- return --
    case 'return': {
        $user  = api_guard('km.create', true);
        $input = json_input();

        $data = (new Validator($input))
            ->integer('booking_id', 'Booking', 1)
            ->integer('odometer_km', 'Ending KM', 0, 9999999)
            ->required('recorded_at', 'Return date and time')
            ->inList('fuel_level', 'Fuel level', FUEL_LEVELS, false)
            ->optional('condition_note', 255)
            ->optional('notes', 255)
            ->orFail();

        $booking = booking_for_km((int) $data['booking_id']);
        $pickup  = km_reading((int) $booking['id'], 'pickup');

        if ($pickup === null) {
            json_error('Record the pickup first — without a starting reading there is nothing to measure against.', 409);
        }
        if (km_reading((int) $booking['id'], 'return') !== null) {
            json_error('Return has already been recorded for this booking. Correct the reading instead.', 409);
        }
        // An odometer cannot run backwards; this is almost always a typo, and
        // accepting it would produce a negative distance and a nonsense charge.
        if ((int) $data['odometer_km'] < (int) $pickup['odometer_km']) {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['odometer_km' =>
                    'The closing reading is lower than the ' . number_format((float) $pickup['odometer_km'])
                    . ' km recorded at pickup.']]);
        }

        $recordedAt = normalise_dt($data['recorded_at']);

        $checklistReady = checklist_ready();
        $checklist      = checklist_json($input['checklist'] ?? null);

        $id = transaction(function () use ($data, $booking, $recordedAt, $user, $checklistReady, $checklist) {
            query(
                'INSERT INTO km_records
                   (booking_id, leg, odometer_km, recorded_at, fuel_level,
                    condition_note, notes, created_by'
                  . ($checklistReady ? ', checklist' : '') . ')
                 VALUES (?, \'return\', ?,?,?,?,?,?' . ($checklistReady ? ',?' : '') . ')',
                array_merge(
                    [$booking['id'], $data['odometer_km'], $recordedAt, $data['fuel_level'],
                     $data['condition_note'], $data['notes'], $user['id']],
                    $checklistReady ? [$checklist] : []
                )
            );
            $recordId = last_insert_id();

            query("UPDATE bookings SET status = 'Returned' WHERE id = ?", [$booking['id']]);
            // The car is back, and its odometer now reads what was seen at
            // handover rather than whatever it said when it left.
            query("UPDATE vehicles SET status = 'Available', current_km = ? WHERE id = ?",
                [$data['odometer_km'], $booking['vehicle_id']]);

            $km = extra_km_position((int) $booking['id']);
            audit_log('vehicle_returned', 'km', 'km_record', $recordId, null,
                ['odometer_km' => $data['odometer_km'], 'total_km' => $km['total_km'],
                 'allowed_km' => $km['allowed_km'], 'extra_km' => $km['extra_km'],
                 'extra_km_charge' => $km['extra_km_charge']],
                null, (int) $user['id'], $user['name'],
                (int) $booking['id'], (int) $booking['customer_id'], (int) $booking['vehicle_id']);

            return $recordId;
        });

        json_out([
            'km_record_id' => $id,
            'km'    => extra_km_position((int) $booking['id']),
            'money' => booking_money((int) $booking['id']),
        ]);
    }

    // ------------------------------------------------------------ correct --
    case 'correct': {
        $user  = api_guard('km.correct', true);
        $input = json_input();

        // Fuel level, the condition note and the time are optional: a caller
        // sending only a corrected odometer gets exactly what it used to,
        // and anything left out keeps what the original reading said.
        $data = (new Validator($input))
            ->integer('id', 'Reading', 1)
            ->integer('odometer_km', 'Corrected KM', 0, 9999999)
            ->inList('fuel_level', 'Fuel level', FUEL_LEVELS, false)
            ->optional('condition_note', 255)
            ->optional('recorded_at')
            ->required('reason', 'Reason')
            ->orFail();

        $original = fetch_one('SELECT * FROM km_records WHERE id = ?', [(int) $data['id']]);
        if ($original === null) {
            json_error('That reading no longer exists.', 404);
        }
        if ($original['status'] !== 'active') {
            json_error('That reading has already been superseded.', 409);
        }

        $booking = booking_for_km((int) $original['booking_id']);

        // A corrected return must still be at or above the pickup reading.
        if ($original['leg'] === 'return') {
            $pickup = km_reading((int) $booking['id'], 'pickup');
            if ($pickup !== null && (int) $data['odometer_km'] < (int) $pickup['odometer_km']) {
                json_error('Please correct the highlighted fields.', 422,
                    ['fields' => ['odometer_km' => 'Still lower than the reading taken at pickup.']]);
            }
        }

        $difference = (int) $data['odometer_km'] - (int) $original['odometer_km'];

        // What was not sent stays as it was. A blank condition note is a
        // deliberate clearing, which is why the key being present is the
        // test rather than the value being non-empty.
        $fuel      = array_key_exists('fuel_level', $input) && $data['fuel_level'] !== null
            ? $data['fuel_level'] : $original['fuel_level'];
        $condition = array_key_exists('condition_note', $input)
            ? $data['condition_note'] : $original['condition_note'];
        $recordedAt = array_key_exists('recorded_at', $input) && $data['recorded_at'] !== null
            ? normalise_dt((string) $data['recorded_at']) : $original['recorded_at'];

        $id = transaction(function () use ($data, $original, $booking, $difference, $user,
                                           $fuel, $condition, $recordedAt) {
            // The superseded reading is marked, not deleted, so both figures
            // and the gap between them stay on the record.
            query("UPDATE km_records SET status = 'voided' WHERE id = ?", [$original['id']]);

            query(
                'INSERT INTO km_records
                   (booking_id, leg, odometer_km, recorded_at, fuel_level, condition_note,
                    notes, corrects_id, correct_reason, created_by)
                 VALUES (?,?,?,?,?,?,?,?,?,?)',
                [$original['booking_id'], $original['leg'], $data['odometer_km'],
                 $recordedAt, $fuel, $condition,
                 $original['notes'], $original['id'], $data['reason'], $user['id']]
            );
            $recordId = last_insert_id();

            if ($original['leg'] === 'return') {
                query('UPDATE vehicles SET current_km = ? WHERE id = ?',
                    [$data['odometer_km'], $booking['vehicle_id']]);
            }

            audit_log('km_corrected', 'km', 'km_record', $recordId,
                ['odometer_km' => $original['odometer_km'],
                 'fuel_level' => $original['fuel_level'],
                 'condition_note' => $original['condition_note'],
                 'recorded_at' => $original['recorded_at']],
                ['odometer_km' => $data['odometer_km'], 'difference' => $difference,
                 'fuel_level' => $fuel, 'condition_note' => $condition,
                 'recorded_at' => $recordedAt, 'leg' => $original['leg']],
                $data['reason'], (int) $user['id'], $user['name'],
                (int) $booking['id'], (int) $booking['customer_id'], (int) $booking['vehicle_id']);

            return $recordId;
        });

        json_out([
            'km_record_id' => $id,
            'difference'   => $difference,
            'km'           => extra_km_position((int) $booking['id']),
            'money'        => booking_money((int) $booking['id']),
        ]);
    }

    default:
        json_error('Unknown action', 404);
}

// ---------------------------------------------------------------- helpers --

function booking_for_km(int $id): array
{
    $booking = fetch_one('SELECT * FROM bookings WHERE id = ?', [$id]);
    if ($booking === null) {
        json_error('That booking no longer exists.', 404);
    }
    if ($booking['status'] === 'Cancelled') {
        json_error('This booking is cancelled.', 409);
    }
    return $booking;
}

function normalise_dt(string $value): string
{
    $time = strtotime(trim(str_replace('T', ' ', $value)));
    return date('Y-m-d H:i:s', $time === false ? time() : $time);
}
