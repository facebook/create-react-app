<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/http.php';
require_once __DIR__ . '/../src/vocab.php';
require_once __DIR__ . '/../src/vehicle-photos.php';
require_once __DIR__ . '/../src/fleet-upkeep.php';

/**
 * Vehicles.
 *
 * A vehicle's rates live in vehicle_rates, dated, rather than as columns on
 * the vehicle itself. Changing a price writes a new dated row, so a booking
 * taken last month can still be explained by the rate card that was live then.
 *
 * Vehicles are never hard-deleted: bookings, expenses and KM records point at
 * them, and deleting one would either fail or orphan history. Retiring sets
 * the status to Inactive instead.
 */

/**
 * Is the advertised upper daily rate available yet?
 *
 * api_guard applies pending migrations before anything here runs, so this is
 * normally true. It is checked anyway because naming a column that does not
 * exist fails the whole statement: if 007 had not applied, selecting it would
 * take the entire fleet list down rather than hiding one optional figure.
 * That exact shape of failure has happened here once already, with
 * vehicles.photo_file.
 */
function rate_band_ready(): bool
{
    static $ready = null;
    return $ready ??= table_has_column('vehicle_rates', 'rate_daily_max');
}

/** The rate columns to read, with the optional one only when it is there. */
function rate_columns(): string
{
    return 'r.rate_daily, ' . (rate_band_ready() ? 'r.rate_daily_max, ' : '')
        . 'r.rate_7day, r.rate_15day, r.rate_30day,';
}

$action = $_GET['action'] ?? ($_SERVER['REQUEST_METHOD'] === 'POST' ? 'save' : 'list');

switch ($action) {

    // ---------------------------------------------------------------- list --
    case 'list': {
        api_guard('vehicle.view');

        $includeInactive = ($_GET['include_inactive'] ?? '0') === '1';

        // The current rate is the newest row not dated in the future, so a
        // price scheduled for next month does not leak into today's figures.
        $rows = fetch_all(
            "SELECT v.*,
                    " . rate_columns() . "
                    r.km_limit_per_day, r.extra_km_rate, r.security_deposit,
                    r.effective_from AS rate_effective_from
               FROM vehicles v
               LEFT JOIN vehicle_rates r
                 ON r.id = (
                      SELECT id FROM vehicle_rates
                       WHERE vehicle_id = v.id AND effective_from <= CURDATE()
                    ORDER BY effective_from DESC, id DESC LIMIT 1
                    )
              WHERE (:all = 1 OR v.status <> 'Inactive')
           ORDER BY v.name",
            ['all' => $includeInactive ? 1 : 0]
        );

        json_out(['vehicles' => array_map('present_vehicle', $rows)]);
    }

    // ---------------------------------------------------------------- save --
    case 'save': {
        $user = api_guard('vehicle.edit', true);
        $input = json_input();

        $id = isset($input['id']) && $input['id'] !== '' ? (int) $input['id'] : null;

        $data = (new Validator($input))
            ->required('name', 'Listing name')
            ->required('brand', 'Brand')
            ->required('reg_number', 'Registration number')
            ->inList('body_type', 'Body type', BODY_TYPES)
            ->inList('fuel', 'Fuel', FUEL_TYPES)
            ->inList('transmission', 'Transmission', TRANSMISSIONS)
            ->inList('status', 'Status', VEHICLE_STATUSES)
            ->integer('seats', 'Seats', 1, 25)
            ->integer('model_year', 'Year', 1980, (int) date('Y') + 2)
            ->integer('current_km', 'Odometer', 0, 9999999)
            ->hexColour('colour', 'Colour')
            ->money('rate_daily', 'Daily rate')
            // Display only: the top of the advertised band. Optional, because
            // most cars have one price.
            ->money('rate_daily_max', 'Daily rate (up to)', false)
            ->money('rate_7day', '7-day rate', false)
            ->money('rate_15day', '15-day rate', false)
            ->money('rate_30day', 'Monthly rate', false)
            ->integer('km_limit_per_day', 'KM limit', 0, 5000)
            ->money('extra_km_rate', 'Extra KM rate')
            ->money('security_deposit', 'Security deposit')
            ->orFail();

        // Whose car this is. Everything about the money downstream depends on
        // it, so it is read here rather than inferred from whether an owner
        // name happens to be filled in.
        $ownership = ($input['ownership'] ?? 'own') === 'partner' ? 'partner' : 'own';
        $ownerName  = $ownership === 'partner' ? trim((string) ($input['owner_name'] ?? '')) : '';
        // The code arrives separately, the same as every other phone field.
        $ownerPhone = '';
        if ($ownership === 'partner') {
            $ownerCode   = trim((string) ($input['owner_phone_code'] ?? DIAL_DEFAULT));
            $ownerDigits = preg_replace('/[^0-9]/', '', (string) ($input['owner_phone'] ?? ''));
            if ($ownerDigits !== '') {
                $allowed = dial_digits($ownerCode);
                if ($allowed !== null && !in_array(strlen($ownerDigits), $allowed, true)) {
                    $want = count($allowed) === 1
                        ? $allowed[0] . ' digits'
                        : implode(' or ', $allowed) . ' digits';
                    json_error('Please correct the highlighted fields.', 422, ['fields' => [
                        'owner_phone' => "A {$ownerCode} number is {$want}, and this one is "
                            . strlen($ownerDigits) . '.',
                    ]]);
                }
                $ownerPhone = join_phone($ownerCode, $ownerDigits);
            }
        }
        $temporary  = $ownership === 'partner' && !empty($input['is_temporary']) ? 1 : 0;

        if ($ownership === 'partner' && $ownerName === '') {
            json_error('Please correct the highlighted fields.', 422, ['fields' => [
                'owner_name' => "Whose car it is -- there is no one to pay without it.",
            ]]);
        }

        // A band that reads "1,800 to 1,600" is a typo, and it would print on
        // the site exactly as entered.
        if ($data['rate_daily_max'] !== null && $data['rate_daily_max'] < $data['rate_daily']) {
            json_error('Please correct the highlighted fields.', 422, ['fields' => [
                'rate_daily_max' => 'The upper rate cannot be below the daily rate.',
            ]]);
        }

        $reg = strtoupper(preg_replace('/\s+/', '', $data['reg_number']));

        // Registration numbers identify a specific car; two rows sharing one
        // would make every report ambiguous.
        $clash = fetch_one(
            'SELECT id FROM vehicles WHERE reg_number = ? AND (? IS NULL OR id <> ?)',
            [$reg, $id, $id]
        );
        if ($clash !== null) {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['reg_number' => 'Another vehicle already uses this registration number.']]);
        }

        $before = $id !== null ? fetch_one('SELECT * FROM vehicles WHERE id = ?', [$id]) : null;
        if ($id !== null && $before === null) {
            json_error('That vehicle no longer exists.', 404);
        }

        // Columns added by later migrations, written only where they exist --
        // so a panel whose database is a version behind still saves a car
        // rather than failing on a column that is not there yet.
        //
        // Built as one list rather than a pair per feature: there are two
        // migrations' worth now and a third would have meant a third set of
        // four variables to thread through the same two queries.
        $optional = [];

        if (table_has_column('vehicles', 'ownership')) {
            $optional += [
                'ownership'    => $ownership,
                'owner_name'   => $ownerName === '' ? null : $ownerName,
                'owner_phone'  => $ownerPhone === '' ? null : $ownerPhone,
                'is_temporary' => $temporary,
            ];
        }

        if (fleet_upkeep_ready()) {
            // A blank date is null, not the empty string: '' in a DATE column
            // becomes 0000-00-00 on a permissive server, and an alert would
            // then say the insurance expired in the year zero.
            $date = static fn(string $k): ?string =>
                trim((string) ($input[$k] ?? '')) === '' ? null : trim((string) $input[$k]);
            $text = static fn(string $k): ?string =>
                trim((string) ($input[$k] ?? '')) === '' ? null : substr(trim((string) $input[$k]), 0, 60);

            $optional += [
                'purchase_date'    => $date('purchase_date'),
                'insurance_expiry' => $date('insurance_expiry'),
                'pollution_expiry' => $date('pollution_expiry'),
                'fitness_expiry'   => $date('fitness_expiry'),
                'service_due_km'   => ((int) ($input['service_due_km'] ?? 0)) ?: null,
                'service_due_on'   => $date('service_due_on'),
                'gps_provider'     => $text('gps_provider'),
                'gps_device_id'    => $text('gps_device_id'),
                // A link, not a credential: what is wanted is the provider's
                // own page for this car, and only an http(s) one can be that.
                'gps_url'          => preg_match('~^https?://~i', (string) ($input['gps_url'] ?? ''))
                    ? substr(trim((string) $input['gps_url']), 0, 255) : null,
            ];
        }

        $ownerCols = $optional === [] ? '' : ', ' . implode(', ', array_keys($optional));
        $ownerPlaceholders = str_repeat(',?', count($optional));
        $ownerSets = $optional === [] ? ''
            : ', ' . implode(', ', array_map(static fn(string $c): string => "{$c} = ?", array_keys($optional)));
        $ownerValues = array_values($optional);

        $savedId = transaction(function () use (
            $id, $data, $reg, $before, $user,
            $ownerCols, $ownerPlaceholders, $ownerSets, $ownerValues
        ) {
            if ($id === null) {
                query(
                    'INSERT INTO vehicles
                       (name, brand, reg_number, body_type, fuel, transmission,
                        seats, model_year, colour, status, current_km, created_by' . $ownerCols . ')
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?' . $ownerPlaceholders . ')',
                    array_merge(
                        [$data['name'], $data['brand'], $reg, $data['body_type'], $data['fuel'],
                         $data['transmission'], $data['seats'], $data['model_year'], $data['colour'],
                         $data['status'], $data['current_km'], $user['id']],
                        $ownerValues
                    )
                );
                $vehicleId = last_insert_id();
                audit_log('vehicle_created', 'vehicles', 'vehicle', $vehicleId, null,
                    ['name' => $data['name'], 'reg_number' => $reg], null,
                    (int) $user['id'], $user['name'], null, null, $vehicleId);
            } else {
                $vehicleId = $id;
                query(
                    'UPDATE vehicles SET name = ?, brand = ?, reg_number = ?, body_type = ?,
                            fuel = ?, transmission = ?, seats = ?, model_year = ?, colour = ?,
                            status = ?, current_km = ?' . $ownerSets . '
                      WHERE id = ?',
                    array_merge(
                        [$data['name'], $data['brand'], $reg, $data['body_type'], $data['fuel'],
                         $data['transmission'], $data['seats'], $data['model_year'], $data['colour'],
                         $data['status'], $data['current_km']],
                        $ownerValues,
                        [$vehicleId]
                    )
                );
                $after = fetch_one('SELECT * FROM vehicles WHERE id = ?', [$vehicleId]);
                [$prev, $curr] = diff_changes($before ?? [], $after ?? []);
                if ($curr !== []) {
                    audit_log('vehicle_updated', 'vehicles', 'vehicle', $vehicleId,
                        $prev, $curr, null, (int) $user['id'], $user['name'], null, null, $vehicleId);
                }
            }

            // Only write a rate row when something about the pricing actually
            // changed — otherwise every incidental edit would clutter the
            // rate history and make it useless for explaining old bookings.
            $currentRate = fetch_one(
                'SELECT * FROM vehicle_rates WHERE vehicle_id = ?
                  ORDER BY effective_from DESC, id DESC LIMIT 1',
                [$vehicleId]
            );

            $incoming = [
                'rate_daily'       => $data['rate_daily'],
                'rate_7day'        => $data['rate_7day'],
                'rate_15day'       => $data['rate_15day'],
                'rate_30day'       => $data['rate_30day'],
                'km_limit_per_day' => (string) $data['km_limit_per_day'],
                'extra_km_rate'    => $data['extra_km_rate'],
                'security_deposit' => $data['security_deposit'],
            ];

            if (rate_band_ready()) {
                $incoming['rate_daily_max'] = $data['rate_daily_max'];
            }

            // Compared as numbers. This used to trim trailing zeros off both
            // sides as strings, and the two sides are not the same shape:
            // MySQL returns "1800.00", which trims to "1800", while the
            // validator returns 1800, which trims to "18". So every rate
            // ending in a zero looked changed on every save and wrote a
            // redundant rate row -- the one thing the check exists to prevent.
            $same = static function (mixed $a, mixed $b): bool {
                $aEmpty = $a === null || $a === '';
                $bEmpty = $b === null || $b === '';
                if ($aEmpty || $bEmpty) {
                    return $aEmpty && $bEmpty;
                }
                // Half a paisa: these are DECIMAL(12,2) either side.
                return abs((float) $a - (float) $b) < 0.005;
            };

            $changed = $currentRate === null;
            if (!$changed) {
                foreach ($incoming as $key => $value) {
                    if (!$same($currentRate[$key] ?? null, $value)) {
                        $changed = true;
                        break;
                    }
                }
            }

            if ($changed) {
                // Built from $incoming so the optional band column appears in
                // the statement only when the database has it.
                $columns = array_keys($incoming);
                $set     = implode(', ', array_map(
                    static fn (string $c): string => "$c = VALUES($c)", $columns));

                query(
                    'INSERT INTO vehicle_rates (vehicle_id, effective_from, created_by, '
                    . implode(', ', $columns) . ')
                     VALUES (?, CURDATE(), ?, ' . implode(', ', array_fill(0, count($columns), '?')) . ')
                     ON DUPLICATE KEY UPDATE ' . $set,
                    [$vehicleId, $user['id'], ...array_values($incoming)]
                );
                audit_log('vehicle_rate_changed', 'vehicles', 'vehicle', $vehicleId,
                    $currentRate === null ? null : array_intersect_key($currentRate, $incoming),
                    $incoming, null, (int) $user['id'], $user['name'], null, null, $vehicleId);
            }

            return $vehicleId;
        });

        $row = fetch_one(
            "SELECT v.*, " . rate_columns() . "
                    r.km_limit_per_day, r.extra_km_rate, r.security_deposit,
                    r.effective_from AS rate_effective_from
               FROM vehicles v
               LEFT JOIN vehicle_rates r ON r.id = (
                    SELECT id FROM vehicle_rates WHERE vehicle_id = v.id
                     ORDER BY effective_from DESC, id DESC LIMIT 1)
              WHERE v.id = ?",
            [$savedId]
        );

        json_out(['vehicle' => present_vehicle($row ?? [])]);
    }

    // ------------------------------------------------------------- retire --
    case 'retire': {
        $user  = api_guard('vehicle.delete', true);
        $input = json_input();
        $id    = (int) ($input['id'] ?? 0);
        $reason = trim((string) ($input['reason'] ?? ''));

        $vehicle = fetch_one('SELECT * FROM vehicles WHERE id = ?', [$id]);
        if ($vehicle === null) {
            json_error('That vehicle no longer exists.', 404);
        }

        // A car that is out on hire cannot be retired — the booking still has
        // to be returned, its KM read and its charges settled.
        $live = fetch_one(
            "SELECT COUNT(*) AS n FROM bookings
              WHERE vehicle_id = ? AND status IN ('Confirmed','Ready','Active')",
            [$id]
        );
        if ((int) ($live['n'] ?? 0) > 0) {
            json_error('This vehicle has active or upcoming bookings. Complete or cancel those first.', 409);
        }

        query("UPDATE vehicles SET status = 'Inactive' WHERE id = ?", [$id]);
        audit_log('vehicle_retired', 'vehicles', 'vehicle', $id,
            ['status' => $vehicle['status']], ['status' => 'Inactive'],
            $reason !== '' ? $reason : null,
            (int) $user['id'], $user['name'], null, null, $id);

        json_out(['ok' => true]);
    }

    default:
        json_error('Unknown action', 404);
}

/** Shapes a database row for the browser, with numbers as numbers. */
function present_vehicle(array $row): array
{
    if ($row === []) {
        return [];
    }

    return [
        'id'               => (int) $row['id'],
        'name'             => $row['name'],
        'brand'            => $row['brand'],
        'reg_number'       => $row['reg_number'],
        'body_type'        => $row['body_type'],
        'fuel'             => $row['fuel'],
        'transmission'     => $row['transmission'],
        'seats'            => (int) $row['seats'],
        'model_year'       => (int) $row['model_year'],
        'colour'           => $row['colour'],
        // Absent on a database that has not run 009 yet, so defaulted rather
        // than assumed: an older panel shows every car as ours, which is what
        // it was before the column existed.
        'ownership'        => $row['ownership'] ?? 'own',
        'owner_name'       => $row['owner_name'] ?? null,
        'owner_phone'      => $row['owner_phone'] ?? null,
        'is_temporary'     => (bool) ($row['is_temporary'] ?? 0),
        'purchase_date'    => $row['purchase_date'] ?? null,
        'insurance_expiry' => $row['insurance_expiry'] ?? null,
        'pollution_expiry' => $row['pollution_expiry'] ?? null,
        'fitness_expiry'   => $row['fitness_expiry'] ?? null,
        'service_due_km'   => $row['service_due_km'] === null ? null : (int) $row['service_due_km'],
        'service_due_on'   => $row['service_due_on'] ?? null,
        'gps_provider'     => $row['gps_provider'] ?? null,
        'gps_device_id'    => $row['gps_device_id'] ?? null,
        'gps_url'          => $row['gps_url'] ?? null,
        'photo'            => vehicle_photo_url($row['photo_file'] ?? null),
        'status'           => $row['status'],
        'current_km'       => (int) $row['current_km'],
        'rate_daily'       => isset($row['rate_daily']) ? (float) $row['rate_daily'] : 0.0,
        'rate_daily_max'   => isset($row['rate_daily_max']) ? (float) $row['rate_daily_max'] : null,
        'rate_7day'        => isset($row['rate_7day'])  ? (float) $row['rate_7day']  : null,
        'rate_15day'       => isset($row['rate_15day']) ? (float) $row['rate_15day'] : null,
        'rate_30day'       => isset($row['rate_30day']) ? (float) $row['rate_30day'] : null,
        'km_limit_per_day' => (int) ($row['km_limit_per_day'] ?? 0),
        'extra_km_rate'    => (float) ($row['extra_km_rate'] ?? 0),
        'security_deposit' => (float) ($row['security_deposit'] ?? 0),
        'rate_effective_from' => $row['rate_effective_from'] ?? null,
    ];
}
