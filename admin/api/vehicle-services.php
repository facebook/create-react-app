<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/http.php';
require_once __DIR__ . '/../src/audit.php';
require_once __DIR__ . '/../src/fleet-upkeep.php';

/**
 * A vehicle's service history.
 *
 * Separate from expenses, which records that money left the business. This
 * records what was done to a car and when the next one falls due -- the same
 * event seen from the workshop rather than from the ledger, and only one of
 * those two can answer "what needs servicing this month".
 */

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list': {
        api_guard('vehicle.view');
        $vehicleId = (int) ($_GET['vehicle_id'] ?? 0);
        json_out(['ok' => true, 'services' => array_map(
            static fn(array $r): array => [
                'id'              => (int) $r['id'],
                'serviced_on'     => $r['serviced_on'],
                'odometer_km'     => (int) $r['odometer_km'],
                'service_type'    => $r['service_type'],
                'amount'          => (float) $r['amount'],
                'garage'          => $r['garage'],
                'next_service_km' => $r['next_service_km'] === null ? null : (int) $r['next_service_km'],
                'next_service_on' => $r['next_service_on'],
                'note'            => $r['note'],
            ],
            vehicle_services($vehicleId)
        )]);
    }

    case 'add': {
        $user  = api_guard('vehicle.edit', true);
        $input = json_input();

        $data = (new Validator($input))
            ->integer('vehicle_id', 'Vehicle', 1)
            ->required('serviced_on', 'Service date')
            ->required('service_type', 'What was done')
            ->integer('odometer_km', 'Odometer', 0, 9999999, false)
            ->money('amount', 'Amount', false)
            ->optional('garage', 120)
            ->integer('next_service_km', 'Next service KM', 0, 9999999, false)
            ->optional('next_service_on', 10)
            ->optional('note', 2000)
            ->orFail();

        if (!vehicle_services_ready()) {
            json_error('The service table is still missing from the database.', 500);
        }

        $vehicle = fetch_one('SELECT * FROM vehicles WHERE id = ?', [$data['vehicle_id']]);
        if ($vehicle === null) {
            json_error('That vehicle no longer exists.', 404);
        }

        // A next-service reading below the one just taken is a typo, and it
        // would make the alert say a service is overdue the moment it is done.
        $odo  = (int) ($data['odometer_km'] ?? 0);
        $next = $data['next_service_km'] === null ? null : (int) $data['next_service_km'];
        if ($next !== null && $next > 0 && $odo > 0 && $next <= $odo) {
            json_error('Please correct the highlighted fields.', 422, ['fields' => [
                'next_service_km' => 'The next service reading has to be above the '
                    . number_format($odo) . ' km recorded now.',
            ]]);
        }

        $nextOn = trim((string) ($data['next_service_on'] ?? ''));

        transaction(function () use ($data, $user, $odo, $next, $nextOn, $vehicle) {
            query(
                'INSERT INTO vehicle_services
                   (vehicle_id, serviced_on, odometer_km, service_type, amount, garage,
                    next_service_km, next_service_on, note, created_by)
                 VALUES (?,?,?,?,?,?,?,?,?,?)',
                [$data['vehicle_id'], $data['serviced_on'], $odo, $data['service_type'],
                 $data['amount'] ?? '0.00', $data['garage'],
                 $next ?: null, $nextOn === '' ? null : $nextOn, $data['note'], $user['id']]
            );

            // The vehicle carries the next-due point, so the alert has one
            // place to look rather than having to find the newest service row.
            vehicle_set_service_due((int) $data['vehicle_id'], $next, $nextOn);

            // A service reading is an odometer reading. Only ever forwards:
            // a workshop noting a lower number than the car has already done
            // is a mistake, and accepting it would corrupt every later sum.
            if ($odo > (int) $vehicle['current_km']) {
                query('UPDATE vehicles SET current_km = ? WHERE id = ?', [$odo, $data['vehicle_id']]);
            }
        });

        audit_log('vehicle_serviced', 'vehicles', 'vehicle', (int) $data['vehicle_id'], null,
            ['service_type' => $data['service_type'], 'amount' => $data['amount'] ?? '0.00',
             'odometer_km' => $odo], null,
            (int) $user['id'], $user['name'], null, null, (int) $data['vehicle_id']);

        json_out(['ok' => true]);
    }

    case 'void': {
        $user  = api_guard('vehicle.edit', true);
        $input = json_input();
        $id    = (int) ($input['id'] ?? 0);

        $row = fetch_one('SELECT * FROM vehicle_services WHERE id = ?', [$id]);
        if ($row === null) {
            json_error('That service record no longer exists.', 404);
        }

        query("UPDATE vehicle_services SET status = 'voided' WHERE id = ?", [$id]);
        audit_log('vehicle_service_removed', 'vehicles', 'vehicle', (int) $row['vehicle_id'],
            ['service_type' => $row['service_type']], null, null,
            (int) $user['id'], $user['name'], null, null, (int) $row['vehicle_id']);

        json_out(['ok' => true]);
    }

    default:
        json_error('Unknown action.', 404);
}
