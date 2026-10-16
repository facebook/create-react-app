<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/booking.php';
require_once __DIR__ . '/../src/enquiry.php';

/**
 * Enquiry management.
 *
 * Accepting an enquiry creates a real booking that carries the customer,
 * vehicle and dates across and keeps a link back to where it came from. The
 * enquiry is not merely relabelled: a booking has commercial terms, a number,
 * money and a vehicle to hand over, none of which an enquiry has, and losing
 * the origin would break the trail from first contact to final invoice.
 */

const ENQUIRY_STATUSES = ['New', 'Contacted', 'Pending', 'Accepted', 'Rejected', 'Cancelled', 'Converted'];

/**
 * The opening of the line lib/enquiry.ts writes into the free-text
 * requirements when a visitor picks a car. Read by enquiry_vehicle_asked()
 * at the foot of this file.
 *
 * It lives up here, above the switch, because it has to. PHP hoists a
 * function declaration to the top of the file but runs a top-level const
 * where it is written -- and every branch of that switch ends in json_out(),
 * which exits. Declared below the switch, this constant was never reached
 * before the function that reads it ran, and the whole enquiries API answered
 * "Undefined constant" instead of JSON.
 */
const VEHICLE_ASKED_PREFIX = 'Vehicle of interest:';

$action = $_GET['action'] ?? 'list';

switch ($action) {

    // ---------------------------------------------------------------- list --
    case 'list': {
        api_guard('enquiry.view');

        $status = (string) ($_GET['status'] ?? '');
        $search = trim((string) ($_GET['q'] ?? ''));

        $where  = ['1=1'];
        $params = [];

        if ($status !== '' && in_array($status, ENQUIRY_STATUSES, true)) {
            $where[] = 'e.status = ?';
            $params[] = $status;
        }
        if ($search !== '') {
            $where[] = '(e.name LIKE ? OR e.phone LIKE ? OR e.enquiry_number LIKE ?)';
            $like = '%' . $search . '%';
            array_push($params, $like, $like, $like);
        }

        $rows = fetch_all(
            'SELECT e.*, v.name AS vehicle_name, b.booking_number
               FROM enquiries e
               LEFT JOIN vehicles v ON v.id = e.vehicle_id
               LEFT JOIN bookings b ON b.id = e.booking_id
              WHERE ' . implode(' AND ', $where) . '
           ORDER BY e.created_at DESC, e.id DESC
              LIMIT 200',
            $params
        );

        json_out([
            'enquiries' => array_map('present_enquiry', $rows),
            // Sent with the list so the badge never needs a request of its own,
            // and counted over the whole table rather than the rows returned --
            // the list is filtered and paged, the badge is not.
            'unread'      => enquiry_unread(),
            // Whether this database tracks reading at all. Without it every
            // row's viewed_at is null, which is indistinguishable from never
            // opened -- and a panel one migration behind would mark the whole
            // list unread. Nothing is marked until the column exists.
            'tracks_read' => enquiry_read_ready(),
        ]);
    }

    // ----------------------------------------------------------------- get --
    case 'get': {
        // Not a write guard: this is a GET, and passing true would demand a
        // POST. Marking the enquiry read below is a side effect of reading it,
        // the way opening a message marks it read, and the worst a forged
        // request could do is clear a badge for somebody already signed in.
        $user = api_guard('enquiry.view');
        $row  = fetch_one(
            'SELECT e.*, v.name AS vehicle_name, b.booking_number
               FROM enquiries e
               LEFT JOIN vehicles v ON v.id = e.vehicle_id
               LEFT JOIN bookings b ON b.id = e.booking_id
              WHERE e.id = ?',
            [(int) ($_GET['id'] ?? 0)]
        );
        if ($row === null) {
            json_error('That enquiry no longer exists.', 404);
        }
        // Opening it is what counts as reading it -- the badge clears itself
        // rather than waiting for somebody to change the status.
        enquiry_mark_seen((int) $row['id'], (int) $user['id']);

        json_out([
            'enquiry' => present_enquiry($row, true),
            'unread'  => enquiry_unread(),
        ]);
    }

    // --------------------------------------------------------------- status --
    case 'status': {
        $user  = api_guard('enquiry.edit', true);
        $input = json_input();

        $data = (new Validator($input))
            ->integer('id', 'Enquiry', 1)
            ->inList('status', 'Status', ['Contacted', 'Pending', 'Accepted', 'Rejected', 'Cancelled'])
            ->optional('note', 2000)
            ->orFail();

        $enquiry = enquiry_or_404((int) $data['id']);

        if ($enquiry['status'] === 'Converted') {
            json_error('This enquiry has already become booking ' . ($enquiry['booking_number'] ?? '') . '.', 409);
        }
        // Turning someone away is a decision worth being able to explain later.
        if (in_array($data['status'], ['Rejected', 'Cancelled'], true) && ($data['note'] ?? '') === '') {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['note' => 'Please say why, so the decision can be explained later.']]);
        }

        query(
            'UPDATE enquiries SET status = ?, handled_by = ?, handled_at = NOW(),
                    admin_notes = TRIM(CONCAT(COALESCE(admin_notes, \'\'), ?))
              WHERE id = ?',
            [$data['status'], $user['id'],
             ($data['note'] ?? '') === '' ? '' : "\n" . date('d M Y H:i') . ' — ' . $data['note'],
             $data['id']]
        );

        audit_log('enquiry_' . strtolower($data['status']), 'enquiries', 'enquiry', (int) $data['id'],
            ['status' => $enquiry['status']], ['status' => $data['status']],
            $data['note'] ?? null, (int) $user['id'], $user['name']);

        json_out(['ok' => true]);
    }

    // ----------------------------------------------------------------- note --
    case 'note': {
        $user  = api_guard('enquiry.edit', true);
        $input = json_input();

        $data = (new Validator($input))
            ->integer('id', 'Enquiry', 1)
            ->required('note', 'Note')
            ->orFail();

        enquiry_or_404((int) $data['id']);

        query(
            'UPDATE enquiries SET admin_notes = TRIM(CONCAT(COALESCE(admin_notes, \'\'), ?)) WHERE id = ?',
            ["\n" . date('d M Y H:i') . ' — ' . $data['note'], $data['id']]
        );
        audit_log('enquiry_note_added', 'enquiries', 'enquiry', (int) $data['id'], null, null,
            $data['note'], (int) $user['id'], $user['name']);

        json_out(['ok' => true]);
    }

    // ----------------------------------------------------------------- edit --
    /*
     * What the customer typed, corrected.
     *
     * The website form is filled in by somebody on a phone, often in a hurry,
     * and a digit goes missing from the number or the pickup is written as
     * "ngl". The panel could read it and could not fix it, so the correction
     * lived in a note and the wrong number stayed in the field the panel
     * dials from. The original is kept in the audit log, which is the point
     * of editing rather than overwriting.
     */
    case 'edit': {
        $user  = api_guard('enquiry.edit', true);
        $input = json_input();

        $data = (new Validator($input))
            ->integer('id', 'Enquiry', 1)
            ->required('name', 'Name')
            ->phone('phone', 'phone number')
            ->optional('email', 190)
            ->optional('pickup_location', 190)
            ->optional('message', 2000)
            ->optional('requirements', 2000)
            ->orFail();

        $before = enquiry_or_404((int) $data['id']);

        // Dates are optional on an enquiry -- plenty come in with "sometime
        // next month" -- so an empty one clears rather than refuses.
        $start  = trim((string) ($input['start_date'] ?? ''));
        $return = trim((string) ($input['return_date'] ?? ''));
        $start  = $start === '' ? null : $start;
        $return = $return === '' ? null : $return;

        if ($start !== null && $return !== null && $return < $start) {
            json_error('Please correct the highlighted fields.', 422, ['fields' => [
                'return_date' => 'The return date is before the start date.',
            ]]);
        }

        $email = ($data['email'] ?? '') === '' ? null : $data['email'];
        if ($email !== null && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            json_error('Please correct the highlighted fields.', 422, ['fields' => [
                'email' => 'That does not look like an email address.',
            ]]);
        }

        $vehicleId = isset($input['vehicle_id']) && $input['vehicle_id'] !== ''
            ? (int) $input['vehicle_id'] : null;

        query(
            'UPDATE enquiries
                SET name = ?, phone = ?, email = ?, vehicle_id = ?,
                    start_date = ?, return_date = ?, pickup_location = ?,
                    message = ?, requirements = ?
              WHERE id = ?',
            [
                $data['name'], $data['phone'], $email, $vehicleId,
                $start, $return,
                ($data['pickup_location'] ?? '') === '' ? null : $data['pickup_location'],
                ($data['message'] ?? '') === '' ? null : $data['message'],
                ($data['requirements'] ?? '') === '' ? null : $data['requirements'],
                $data['id'],
            ]
        );

        $after = enquiry_or_404((int) $data['id']);
        audit_log('enquiry_edited', 'enquiries', 'enquiry', (int) $data['id'],
            $before, $after, null, (int) $user['id'], $user['name']);

        json_out(['ok' => true]);
    }

    // -------------------------------------------------------------- convert --
    case 'convert': {
        $user  = api_guard('booking.create', true);
        $input = json_input();

        $data = (new Validator($input))
            ->integer('id', 'Enquiry', 1)
            ->integer('vehicle_id', 'Vehicle', 1)
            ->required('start_at', 'Start date and time')
            ->required('return_at', 'Return date and time')
            ->money('base_rental', 'Rental amount')
            ->required('licence_number', 'Driving licence number')
            ->optional('address', 255)
            ->orFail();

        $enquiry = enquiry_or_404((int) $data['id']);
        if ($enquiry['status'] === 'Converted') {
            json_error('This enquiry has already become booking ' . ($enquiry['booking_number'] ?? '') . '.', 409);
        }
        if (in_array($enquiry['status'], ['Rejected', 'Cancelled'], true)) {
            json_error('A ' . strtolower((string) $enquiry['status']) . ' enquiry cannot be converted.', 409);
        }

        $startAt  = date('Y-m-d H:i:s', (int) strtotime(str_replace('T', ' ', $data['start_at'])));
        $returnAt = date('Y-m-d H:i:s', (int) strtotime(str_replace('T', ' ', $data['return_at'])));
        if (strtotime($returnAt) <= strtotime($startAt)) {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['return_at' => 'The return must be after the start.']]);
        }

        $vehicle = fetch_one('SELECT * FROM vehicles WHERE id = ?', [(int) $data['vehicle_id']]);
        if ($vehicle === null) {
            json_error('That vehicle no longer exists.', 404);
        }

        $days = rental_days($startAt, $returnAt);
        $rate = current_rate((int) $vehicle['id']);

        $result = transaction(function () use ($enquiry, $data, $vehicle, $rate, $startAt, $returnAt, $days, $user) {
            $clash = vehicle_double_booked((int) $vehicle['id'], $startAt, $returnAt);
            if ($clash !== null) {
                json_error(
                    "{$vehicle['name']} is already booked for those dates ({$clash['booking_number']}).",
                    409
                );
            }

            $customerId = find_or_create_customer([
                'name'           => $enquiry['name'],
                'phone'          => $enquiry['phone'],
                'address'        => $data['address'],
                'licence_number' => $data['licence_number'],
            ], (int) $user['id']);

            $number = next_number('NSC');
            query(
                'INSERT INTO bookings
                   (booking_number, enquiry_id, customer_id, vehicle_id, vehicle_reg_number,
                    start_at, return_at, duration_days, pickup_location, status, notes, created_by)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
                [$number, $enquiry['id'], $customerId, $vehicle['id'], $vehicle['reg_number'],
                 $startAt, $returnAt, $days, $enquiry['pickup_location'], 'Confirmed',
                 // What the customer originally asked for travels with the
                 // booking, so the person handing over the keys can see it.
                 trim((string) ($enquiry['message'] ?? '') . "\n" . (string) ($enquiry['requirements'] ?? '')) ?: null,
                 $user['id']]
            );
            $bookingId = last_insert_id();

            $kmLimit   = (int) ($rate['km_limit_per_day'] ?? 200);
            $extraRate = (string) ($rate['extra_km_rate'] ?? '0.00');
            query(
                'INSERT INTO booking_charges
                   (booking_id, rate_daily, km_limit_per_day, extra_km_rate, deposit_required,
                    base_rental, total, reason, created_by)
                 VALUES (?,?,?,?,?,?,?,?,?)',
                [$bookingId, $rate['rate_daily'] ?? '0.00', $kmLimit, $extraRate,
                 $rate['security_deposit'] ?? '0.00', $data['base_rental'], $data['base_rental'],
                 'Converted from ' . $enquiry['enquiry_number'], $user['id']]
            );

            query(
                "UPDATE enquiries SET status = 'Converted', booking_id = ?, customer_id = ?,
                        handled_by = ?, handled_at = NOW() WHERE id = ?",
                [$bookingId, $customerId, $user['id'], $enquiry['id']]
            );

            audit_log('enquiry_converted', 'enquiries', 'enquiry', (int) $enquiry['id'],
                ['status' => $enquiry['status']],
                ['status' => 'Converted', 'booking_number' => $number],
                'Accepted and booked', (int) $user['id'], $user['name'],
                $bookingId, $customerId, (int) $vehicle['id']);

            audit_log('booking_created', 'bookings', 'booking', $bookingId, null,
                ['booking_number' => $number, 'from_enquiry' => $enquiry['enquiry_number']],
                null, (int) $user['id'], $user['name'],
                $bookingId, $customerId, (int) $vehicle['id']);

            return ['booking_id' => $bookingId, 'booking_number' => $number];
        });

        json_out([
            'ok'             => true,
            'booking_id'     => $result['booking_id'],
            'booking_number' => $result['booking_number'],
            'enquiry_number' => $enquiry['enquiry_number'],
        ]);
    }

    // --------------------------------------------------------------- delete --
    case 'delete': {
        $user  = api_guard('enquiry.delete', true);
        $input = json_input();

        $data = (new Validator($input))
            ->integer('id', 'Enquiry', 1)
            ->orFail();

        $enquiry = enquiry_or_404((int) $data['id']);

        // An enquiry that became a booking is not the enquiry's to delete any
        // more: bookings.enquiry_id points at this row, so removing it would
        // either be refused by the database or leave a booking pointing at
        // nothing. The booking is the record of money owed; the enquiry is how
        // it started, and that story has to stay readable.
        $booking = fetch_one('SELECT booking_number FROM bookings WHERE enquiry_id = ?', [$data['id']]);
        if ($booking !== null) {
            json_error(
                'This enquiry became booking ' . $booking['booking_number']
                . ', so it cannot be deleted. Cancel the booking instead.',
                409,
            );
        }

        // Logged before the row goes, with enough of it to say what was
        // removed -- afterwards there is nothing left to describe.
        audit_log('enquiry_deleted', 'enquiries', 'enquiry', (int) $data['id'],
            [
                'enquiry_number' => $enquiry['enquiry_number'],
                'name'           => $enquiry['name'],
                'status'         => $enquiry['status'],
            ],
            null, null, (int) $user['id'], $user['name']);

        query('DELETE FROM enquiries WHERE id = ?', [$data['id']]);

        json_out(['ok' => true]);
    }

    default:
        json_error('Unknown action', 404);
}

// ---------------------------------------------------------------- helpers --

function enquiry_or_404(int $id): array
{
    $row = fetch_one(
        'SELECT e.*, b.booking_number FROM enquiries e
           LEFT JOIN bookings b ON b.id = e.booking_id WHERE e.id = ?',
        [$id]
    );
    if ($row === null) {
        json_error('That enquiry no longer exists.', 404);
    }
    return $row;
}

/**
 * The car the visitor actually chose.
 *
 * vehicle_id is set only when the website had the real fleet from the panel
 * and that vehicle still exists. On this site it usually is not: the ids in
 * the committed fallback fleet are placeholders, and enquiry-submit.php drops
 * an id it cannot find rather than refusing the enquiry over it.
 *
 * The name always travels, though. lib/enquiry.ts writes it into the
 * requirements as "Vehicle of interest: <name>" for exactly this reason -- so
 * the enquiry stays answerable when the id does not survive, and still reads
 * correctly years later when that vehicle has been sold.
 *
 * So: the join first, the visitor's own words second. The list was showing
 * "Not specified" over enquiries that had named a car perfectly clearly.
 */
function enquiry_vehicle_asked(array $row): ?string
{
    $joined = $row['vehicle_name'] ?? null;
    if ($joined !== null && $joined !== '') {
        return (string) $joined;
    }

    foreach (preg_split('/\r\n|\r|\n/', (string) ($row['requirements'] ?? '')) as $line) {
        $line = trim($line);
        if (stripos($line, VEHICLE_ASKED_PREFIX) !== 0) {
            continue;
        }
        $name = trim(substr($line, strlen(VEHICLE_ASKED_PREFIX)));
        if ($name !== '') {
            return $name;
        }
    }

    return null;
}

function present_enquiry(array $row, bool $detailed = false): array
{
    $out = [
        'id'              => (int) $row['id'],
        'enquiry_number'  => $row['enquiry_number'],
        'name'            => $row['name'],
        'phone'           => $row['phone'],
        'email'           => $row['email'],
        'vehicle_id'      => $row['vehicle_id'] === null ? null : (int) $row['vehicle_id'],
        'vehicle_name'    => $row['vehicle_name'],
        // What to show in the Car column: the real vehicle when the enquiry is
        // tied to one, otherwise the name the visitor picked on the website.
        'vehicle_asked'   => enquiry_vehicle_asked($row),
        'start_date'      => $row['start_date'],
        'return_date'     => $row['return_date'],
        'pickup_location' => $row['pickup_location'],
        'status'          => $row['status'],
        'source'          => $row['source'],
        'booking_number'  => $row['booking_number'],
        'created_at'      => $row['created_at'],
        'viewed_at'       => $row['viewed_at'] ?? null,
    ];

    if ($detailed) {
        $out['message']      = $row['message'];
        $out['requirements'] = $row['requirements'];
        $out['admin_notes']  = $row['admin_notes'];
        $out['handled_at']   = $row['handled_at'];
    }

    return $out;
}
