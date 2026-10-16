<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/booking.php';
require_once __DIR__ . '/../src/vocab.php';

/**
 * Expenses, and the finance summary the Finance tab is built from.
 *
 * Expenses follow the same rule as every other financial record here: rows are
 * added, never edited or deleted. A wrong figure is corrected by a second row
 * carrying the difference and citing the one it corrects; an expense recorded
 * in error is voided with a reason. Both readings stay on file, because the
 * question an auditor asks is not only what the figure is but what it was and
 * who changed it.
 *
 * Income is not entered here. It is summed from the payments already recorded
 * against bookings, so the Finance tab cannot disagree with the bookings it is
 * meant to summarise. Deposits are excluded: a deposit is the customer's money
 * being held, not the business's money earned.
 */

// The categories and methods live in src/vocab.php, which the form renders
// from and this validates against -- so a category the owner can choose is a
// category that saves. They used to be declared here as well, and the two
// lists had drifted by six.

$action = $_GET['action'] ?? 'list';

switch ($action) {

    // ---------------------------------------------------------------- list --
    case 'list': {
        api_guard('expense.view');

        [$from, $to] = date_range();
        $where  = ['e.spent_on BETWEEN ? AND ?'];
        $params = [$from, $to];

        $category = (string) ($_GET['category'] ?? '');
        if ($category !== '' && in_array($category, EXPENSE_CATEGORIES, true)) {
            $where[]  = 'e.category = ?';
            $params[] = $category;
        }
        if (!empty($_GET['vehicle_id'])) {
            $where[]  = 'e.vehicle_id = ?';
            $params[] = (int) $_GET['vehicle_id'];
        }
        // Voided rows stay out of the way by default but are never gone; an
        // auditor asks for them explicitly.
        if (($_GET['include_voided'] ?? '') !== '1') {
            $where[] = "e.status = 'active'";
        }

        $rows = fetch_all(
            'SELECT e.*, v.name AS vehicle_name, v.reg_number,
                    b.booking_number, u.name AS recorded_by,
                    c.expense_number AS corrects_number
               FROM expenses e
               LEFT JOIN vehicles  v ON v.id = e.vehicle_id
               LEFT JOIN bookings  b ON b.id = e.booking_id
               LEFT JOIN users     u ON u.id = e.created_by
               LEFT JOIN expenses  c ON c.id = e.corrects_id
              WHERE ' . implode(' AND ', $where) . '
           ORDER BY e.spent_on DESC, e.id DESC
              LIMIT 500',
            $params
        );

        json_out(['expenses' => array_map('present_expense', $rows), 'from' => $from, 'to' => $to]);
    }

    // ------------------------------------------------------------- summary --
    case 'summary': {
        api_guard('report.view');
        [$from, $to] = date_range();

        // Income is what customers actually paid, taken straight from the
        // payments ledger. Correction rows carry a difference and are summed
        // with the rest, so the figure follows the corrections automatically.
        $income = fetch_one(
            "SELECT COALESCE(SUM(amount), 0) AS total
               FROM payments WHERE status = 'active' AND paid_on BETWEEN ? AND ?",
            [$from, $to]
        )['total'] ?? '0.00';

        $byKind = fetch_all(
            "SELECT kind, COALESCE(SUM(amount), 0) AS total
               FROM payments WHERE status = 'active' AND paid_on BETWEEN ? AND ?
              GROUP BY kind ORDER BY total DESC",
            [$from, $to]
        );

        $byMethod = fetch_all(
            "SELECT method, COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n
               FROM payments WHERE status = 'active' AND paid_on BETWEEN ? AND ?
              GROUP BY method ORDER BY total DESC",
            [$from, $to]
        );

        $spent = fetch_one(
            "SELECT COALESCE(SUM(amount), 0) AS total
               FROM expenses WHERE status = 'active' AND spent_on BETWEEN ? AND ?",
            [$from, $to]
        )['total'] ?? '0.00';

        $byCategory = fetch_all(
            "SELECT category, COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n
               FROM expenses WHERE status = 'active' AND spent_on BETWEEN ? AND ?
              GROUP BY category ORDER BY total DESC",
            [$from, $to]
        );

        $byVehicle = fetch_all(
            "SELECT v.id, v.name, v.reg_number, COALESCE(SUM(e.amount), 0) AS total
               FROM expenses e JOIN vehicles v ON v.id = e.vehicle_id
              WHERE e.status = 'active' AND e.spent_on BETWEEN ? AND ?
              GROUP BY v.id, v.name, v.reg_number ORDER BY total DESC",
            [$from, $to]
        );

        // Deposits are reported beside the figures, never inside them, so it
        // is clear the money is held rather than earned.
        $deposits = fetch_one(
            "SELECT COALESCE(SUM(amount), 0) AS received FROM deposits
              WHERE status = 'active' AND received_on BETWEEN ? AND ?",
            [$from, $to]
        )['received'] ?? '0.00';

        $refunded = fetch_one(
            "SELECT COALESCE(SUM(refund_amount), 0) AS refunded FROM refunds
              WHERE status = 'active' AND refunded_on BETWEEN ? AND ?",
            [$from, $to]
        )['refunded'] ?? '0.00';

        $pending = fetch_one(
            "SELECT COUNT(*) AS n, COALESCE(SUM(amount), 0) AS total
               FROM expenses
              WHERE status = 'active' AND approval_state = 'pending'
                AND spent_on BETWEEN ? AND ?",
            [$from, $to]
        );

        json_out([
            'from'    => $from,
            'to'      => $to,
            'income'  => [
                'total'     => (float) $income,
                'by_kind'   => array_map(fn($r) => ['kind' => $r['kind'], 'total' => (float) $r['total']], $byKind),
                'by_method' => array_map(fn($r) => [
                    'method' => $r['method'], 'total' => (float) $r['total'], 'count' => (int) $r['n'],
                ], $byMethod),
            ],
            'expenses' => [
                'total'       => (float) $spent,
                'by_category' => array_map(fn($r) => [
                    'category' => $r['category'], 'total' => (float) $r['total'], 'count' => (int) $r['n'],
                ], $byCategory),
                'by_vehicle'  => array_map(fn($r) => [
                    'vehicle_id' => (int) $r['id'], 'name' => $r['name'],
                    'reg_number' => $r['reg_number'], 'total' => (float) $r['total'],
                ], $byVehicle),
                'pending_approval' => [
                    'count' => (int) ($pending['n'] ?? 0),
                    'total' => (float) ($pending['total'] ?? 0),
                ],
            ],
            // Deposits are deliberately absent from this subtraction.
            'net'      => (float) money_sub($income, $spent),
            'deposits' => [
                'received' => (float) $deposits,
                'refunded' => (float) $refunded,
            ],
        ]);
    }

    // ---------------------------------------------------------------- save --
    case 'save': {
        $user  = api_guard('expense.create', true);
        $input = json_input();

        $data = (new Validator($input))
            ->money('amount', 'Amount')
            ->inList('category', 'Category', EXPENSE_CATEGORIES)
            ->inList('method', 'Paid by', EXPENSE_METHODS)
            ->required('spent_on', 'Date')
            ->optional('description', 255)
            ->optional('vendor', 120)
            ->orFail();

        if (money_is_zero($data['amount'])) {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['amount' => 'An expense of zero is not worth recording.']]);
        }

        $spentOn = valid_day($data['spent_on']);
        if ($spentOn === null) {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['spent_on' => 'That date could not be read.']]);
        }
        // A date in the future is almost always a typo in the year, and it
        // would quietly fall outside every report until that month arrived.
        if ($spentOn > date('Y-m-d')) {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['spent_on' => 'An expense cannot be dated in the future.']]);
        }

        $vehicleId = ref_or_null('vehicles', $input['vehicle_id'] ?? null, 'That vehicle no longer exists.');
        $bookingId = ref_or_null('bookings', $input['booking_id'] ?? null, 'That booking no longer exists.');

        $result = transaction(function () use ($data, $spentOn, $vehicleId, $bookingId, $user) {
            $number = next_number('EXP');
            query(
                'INSERT INTO expenses
                   (expense_number, spent_on, category, description, amount,
                    vehicle_id, booking_id, vendor, method, created_by)
                 VALUES (?,?,?,?,?,?,?,?,?,?)',
                [$number, $spentOn, $data['category'], $data['description'], $data['amount'],
                 $vehicleId, $bookingId, $data['vendor'], $data['method'], $user['id']]
            );
            $id = last_insert_id();

            audit_log('expense_recorded', 'expenses', 'expense', $id, null,
                ['expense_number' => $number, 'amount' => $data['amount'],
                 'category' => $data['category']],
                null, (int) $user['id'], $user['name'], $bookingId, null, $vehicleId);

            return ['id' => $id, 'expense_number' => $number];
        });

        json_out(['ok' => true] + $result);
    }

    // ---------------------------------------------------------------- void --
    case 'void': {
        $user  = api_guard('expense.void', true);
        $input = json_input();

        $data = (new Validator($input))
            ->integer('id', 'Expense', 1)
            ->required('reason', 'Reason')
            ->orFail();

        $expense = expense_or_404((int) $data['id']);
        if ($expense['status'] !== 'active') {
            json_error('That expense is already ' . $expense['status'] . '.', 409);
        }

        query("UPDATE expenses SET status = 'voided', status_reason = ? WHERE id = ?",
            [$data['reason'], $data['id']]);

        audit_log('expense_voided', 'expenses', 'expense', (int) $data['id'],
            ['status' => 'active', 'amount' => $expense['amount']],
            ['status' => 'voided'],
            $data['reason'], (int) $user['id'], $user['name']);

        json_out(['ok' => true]);
    }

    // ------------------------------------------------------------- correct --
    case 'correct': {
        $user  = api_guard('expense.correct', true);
        $input = json_input();

        $data = (new Validator($input))
            ->integer('corrects_id', 'Expense being corrected', 1)
            ->money('amount', 'Adjustment', true, signed: true)
            ->required('reason', 'Reason')
            ->orFail();

        $original = expense_or_404((int) $data['corrects_id']);
        if ($original['status'] !== 'active') {
            json_error('A ' . $original['status'] . ' expense cannot be corrected. '
                     . 'Record a fresh expense instead.', 409);
        }
        if (money_is_zero($data['amount'])) {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['amount' => 'A correction of zero changes nothing.']]);
        }

        $result = transaction(function () use ($data, $original, $user) {
            $number = next_number('EXP');
            // The adjustment is its own row: positive if too little was
            // recorded, negative if too much. The original figure stands.
            query(
                'INSERT INTO expenses
                   (expense_number, spent_on, category, description, amount, vehicle_id,
                    booking_id, vendor, method, corrects_id, status_reason, created_by)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
                [$number, $original['spent_on'], $original['category'],
                 'Correction to ' . $original['expense_number'], $data['amount'],
                 $original['vehicle_id'], $original['booking_id'], $original['vendor'],
                 $original['method'], $original['id'], $data['reason'], $user['id']]
            );
            $id = last_insert_id();

            audit_log('expense_corrected', 'expenses', 'expense', (int) $original['id'],
                ['amount' => $original['amount']],
                ['adjustment' => $data['amount'], 'expense_number' => $number],
                $data['reason'], (int) $user['id'], $user['name'],
                $original['booking_id'] === null ? null : (int) $original['booking_id'],
                null,
                $original['vehicle_id'] === null ? null : (int) $original['vehicle_id']);

            return ['id' => $id, 'expense_number' => $number];
        });

        json_out(['ok' => true] + $result);
    }

    // ------------------------------------------------------------- approve --
    case 'approve': {
        $user  = api_guard('expense.approve', true);
        $input = json_input();

        $data = (new Validator($input))
            ->integer('id', 'Expense', 1)
            ->inList('state', 'Decision', ['approved', 'rejected'])
            ->optional('reason', 255)
            ->orFail();

        $expense = expense_or_404((int) $data['id']);
        if ($expense['status'] !== 'active') {
            json_error('A ' . $expense['status'] . ' expense cannot be approved.', 409);
        }
        if ($expense['approval_state'] !== 'pending') {
            json_error('That expense was already ' . $expense['approval_state'] . '.', 409);
        }
        // Refusing a claim is a decision someone will ask about later.
        if ($data['state'] === 'rejected' && ($data['reason'] ?? '') === '') {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['reason' => 'Please say why it was rejected.']]);
        }

        query(
            'UPDATE expenses SET approval_state = ?, approved_by = ?, approved_at = NOW(),
                    status_reason = COALESCE(?, status_reason)
              WHERE id = ?',
            [$data['state'], $user['id'], $data['reason'] ?: null, $data['id']]
        );

        audit_log('expense_' . $data['state'], 'expenses', 'expense', (int) $data['id'],
            ['approval_state' => 'pending'], ['approval_state' => $data['state']],
            $data['reason'] ?? null, (int) $user['id'], $user['name']);

        json_out(['ok' => true]);
    }

    default:
        json_error('Unknown action', 404);
}

// ---------------------------------------------------------------- helpers --

/**
 * The window a report covers. Defaults to the current month, which is what
 * someone opening the Finance tab almost always wants to see.
 */
function date_range(): array
{
    $from = valid_day($_GET['from'] ?? null) ?? date('Y-m-01');
    $to   = valid_day($_GET['to'] ?? null)   ?? date('Y-m-t');

    // Reversed dates would silently return nothing at all.
    return $from <= $to ? [$from, $to] : [$to, $from];
}

function valid_day(mixed $value): ?string
{
    if (!is_string($value) || trim($value) === '') {
        return null;
    }
    $time = strtotime($value);
    return $time === false ? null : date('Y-m-d', $time);
}

/** Checks an optional reference exists before it becomes a foreign key error. */
function ref_or_null(string $table, mixed $id, string $message): ?int
{
    if (empty($id)) {
        return null;
    }
    $row = fetch_one("SELECT id FROM {$table} WHERE id = ?", [(int) $id]);
    if ($row === null) {
        json_error($message, 404);
    }
    return (int) $row['id'];
}

function expense_or_404(int $id): array
{
    $row = fetch_one('SELECT * FROM expenses WHERE id = ?', [$id]);
    if ($row === null) {
        json_error('That expense no longer exists.', 404);
    }
    return $row;
}

function present_expense(array $row): array
{
    return [
        'id'             => (int) $row['id'],
        'expense_number' => $row['expense_number'],
        'spent_on'       => $row['spent_on'],
        'category'       => $row['category'],
        'description'    => $row['description'],
        'amount'         => (float) $row['amount'],
        'vendor'         => $row['vendor'],
        'method'         => $row['method'],
        'vehicle_id'     => $row['vehicle_id'] === null ? null : (int) $row['vehicle_id'],
        'vehicle_name'   => $row['vehicle_name'] ?? null,
        'reg_number'     => $row['reg_number'] ?? null,
        'booking_number' => $row['booking_number'] ?? null,
        'status'         => $row['status'],
        'status_reason'  => $row['status_reason'],
        'approval_state' => $row['approval_state'],
        'corrects_id'    => $row['corrects_id'] === null ? null : (int) $row['corrects_id'],
        'corrects_number' => $row['corrects_number'] ?? null,
        'recorded_by'    => $row['recorded_by'] ?? null,
        'created_at'     => $row['created_at'],
    ];
}
