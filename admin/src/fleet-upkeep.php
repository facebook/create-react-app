<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/money.php';

/**
 * Keeping the fleet on the road, and saying so before it is too late.
 *
 * Every one of these -- insurance, the pollution certificate, the fitness
 * certificate, the next service -- used to be somebody remembering. They get
 * remembered until the day one does not, and that day the car is off the road
 * or is out with a customer uninsured.
 */

/** How far ahead a paper about to expire is worth mentioning. */
const EXPIRY_WARNING_DAYS = 30;

/** How close to the service distance counts as due. */
const SERVICE_WARNING_KM = 500;

/** The papers a car carries, and what to call each one. */
const VEHICLE_EXPIRIES = [
    'insurance_expiry' => 'Insurance',
    'pollution_expiry' => 'Pollution certificate',
    'fitness_expiry'   => 'Fitness certificate',
];

function fleet_upkeep_ready(): bool
{
    return table_has_column('vehicles', 'insurance_expiry');
}

function vehicle_services_ready(): bool
{
    return table_has_column('vehicle_services', 'serviced_on');
}

/**
 * Every service on a vehicle, newest first.
 */
function vehicle_services(int $vehicleId): array
{
    if (!vehicle_services_ready()) {
        return [];
    }
    try {
        return fetch_all(
            "SELECT * FROM vehicle_services
              WHERE vehicle_id = ? AND status = 'active'
           ORDER BY serviced_on DESC, id DESC",
            [$vehicleId]
        );
    } catch (Throwable $e) {
        error_log('vehicle_services read failed: ' . $e->getMessage());
        return [];
    }
}

/**
 * What the fleet needs attention for.
 *
 * Returns a flat list, each entry saying which vehicle, how urgent, and what
 * in one sentence. Flat rather than grouped because the dashboard wants them
 * in one column sorted by urgency, and grouping them here would mean ungroup-
 * ing them there.
 *
 * "Overdue" and "soon" are separated deliberately. A list where an insurance
 * that lapsed last week sits among six things due next month is a list nobody
 * reads twice.
 */
function fleet_alerts(): array
{
    if (!fleet_upkeep_ready()) {
        return [];
    }

    try {
        $rows = fetch_all(
            "SELECT id, name, reg_number, current_km, status,
                    insurance_expiry, pollution_expiry, fitness_expiry,
                    service_due_km, service_due_on
               FROM vehicles WHERE status <> 'Inactive'"
        );
    } catch (Throwable $e) {
        error_log('fleet_alerts read failed: ' . $e->getMessage());
        return [];
    }

    $today = new DateTimeImmutable('today');
    $out   = [];

    foreach ($rows as $row) {
        $label = trim((string) $row['name'] . ' (' . (string) $row['reg_number'] . ')');

        foreach (VEHICLE_EXPIRIES as $column => $what) {
            $value = $row[$column] ?? null;
            if ($value === null || $value === '') {
                continue;
            }
            $days = (int) $today->diff(new DateTimeImmutable((string) $value))->format('%r%a');
            if ($days > EXPIRY_WARNING_DAYS) {
                continue;
            }
            $out[] = [
                'kind'       => 'vehicle_paper',
                'level'      => $days < 0 ? 'overdue' : 'soon',
                'vehicle_id' => (int) $row['id'],
                'subject'    => $label,
                'message'    => $days < 0
                    ? "{$what} expired " . abs($days) . ' day' . (abs($days) === 1 ? '' : 's') . ' ago'
                    : ($days === 0 ? "{$what} expires today" : "{$what} expires in {$days} days"),
                'days'       => $days,
            ];
        }

        // Service falls due on whichever of the two comes first, and either
        // may be unset -- a car serviced by distance alone has no date.
        $dueOn = $row['service_due_on'] ?? null;
        if ($dueOn !== null && $dueOn !== '') {
            $days = (int) $today->diff(new DateTimeImmutable((string) $dueOn))->format('%r%a');
            if ($days <= EXPIRY_WARNING_DAYS) {
                $out[] = [
                    'kind'       => 'service_due',
                    'level'      => $days < 0 ? 'overdue' : 'soon',
                    'vehicle_id' => (int) $row['id'],
                    'subject'    => $label,
                    'message'    => $days < 0
                        ? 'Service was due ' . abs($days) . ' days ago'
                        : ($days === 0 ? 'Service due today' : "Service due in {$days} days"),
                    'days'       => $days,
                ];
            }
        }

        $dueKm = $row['service_due_km'] ?? null;
        if ($dueKm !== null && (int) $dueKm > 0) {
            $remaining = (int) $dueKm - (int) $row['current_km'];
            if ($remaining <= SERVICE_WARNING_KM) {
                $out[] = [
                    'kind'       => 'service_due',
                    'level'      => $remaining < 0 ? 'overdue' : 'soon',
                    'vehicle_id' => (int) $row['id'],
                    'subject'    => $label,
                    'message'    => $remaining < 0
                        ? 'Service overdue by ' . number_format(abs($remaining)) . ' km'
                        : 'Service due in ' . number_format($remaining) . ' km',
                    'days'       => $remaining < 0 ? -1 : 1,
                ];
            }
        }
    }

    return $out;
}

/**
 * Moves a vehicle's next-service marker after a service is recorded.
 *
 * Written onto the vehicle rather than read back from the newest service row,
 * so the alert has one place to look and an owner can adjust the next due
 * point without inventing a service that did not happen.
 */
function vehicle_set_service_due(int $vehicleId, ?int $nextKm, ?string $nextOn): void
{
    if (!fleet_upkeep_ready()) {
        return;
    }
    query(
        'UPDATE vehicles SET service_due_km = ?, service_due_on = ? WHERE id = ?',
        [$nextKm === null || $nextKm <= 0 ? null : $nextKm,
         $nextOn === null || $nextOn === '' ? null : $nextOn,
         $vehicleId]
    );
}
