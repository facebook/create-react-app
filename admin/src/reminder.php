<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

/**
 * Reminders somebody sets themselves.
 *
 * The bell already carries what the panel works out on its own. This is the
 * other half: the things only the person running the business knows are
 * coming, which otherwise live on a phone and are forgotten when the phone is
 * in a pocket.
 */

/** How far ahead a reminder starts showing in the bell. */
const REMINDER_HORIZON_DAYS = 7;

/** Whether this database has the table yet. */
function reminders_ready(): bool
{
    return table_has_column('reminders', 'due_on');
}

/**
 * Open reminders, soonest first, oldest overdue at the top.
 *
 * Everything still open is returned rather than only what is due, because the
 * list somebody opens to manage their reminders is not the same list the bell
 * shows -- that one is filtered below.
 */
function reminders_open(int $limit = 100): array
{
    if (!reminders_ready()) {
        return [];
    }
    try {
        return fetch_all(
            "SELECT r.*, u.name AS created_by_name, b.booking_number, v.name AS vehicle_name
               FROM reminders r
          LEFT JOIN users    u ON u.id = r.created_by
          LEFT JOIN bookings b ON b.id = r.booking_id
          LEFT JOIN vehicles v ON v.id = r.vehicle_id
              WHERE r.done_at IS NULL
           ORDER BY r.due_on, r.due_at IS NULL, r.due_at, r.id
              LIMIT " . max(1, min(200, $limit))
        );
    } catch (Throwable $e) {
        error_log('reminders: open list failed: ' . $e->getMessage());
        return [];
    }
}

/** Recently ticked off, so a mistake can be undone without hunting for it. */
function reminders_done(int $limit = 20): array
{
    if (!reminders_ready()) {
        return [];
    }
    try {
        return fetch_all(
            "SELECT r.*, u.name AS created_by_name, b.booking_number, v.name AS vehicle_name
               FROM reminders r
          LEFT JOIN users    u ON u.id = r.created_by
          LEFT JOIN bookings b ON b.id = r.booking_id
          LEFT JOIN vehicles v ON v.id = r.vehicle_id
              WHERE r.done_at IS NOT NULL
           ORDER BY r.done_at DESC
              LIMIT " . max(1, min(50, $limit))
        );
    } catch (Throwable $e) {
        error_log('reminders: done list failed: ' . $e->getMessage());
        return [];
    }
}

/** One reminder, or null. */
function reminder_find(int $id): ?array
{
    if (!reminders_ready()) {
        return null;
    }
    return fetch_one('SELECT * FROM reminders WHERE id = ?', [$id]);
}

/** How a reminder reads on screen: "Friday 26 Sept" or "today at 9:00 am". */
function reminder_when(array $row, string $today): string
{
    $due  = (string) $row['due_on'];
    $time = $row['due_at'] === null ? '' : ' at ' . date('g:i a', strtotime('2000-01-01 ' . $row['due_at']));

    if ($due === $today) {
        return 'Today' . $time;
    }
    if ($due === date('Y-m-d', strtotime($today . ' +1 day'))) {
        return 'Tomorrow' . $time;
    }
    if ($due < $today) {
        $days = (int) floor((strtotime($today) - strtotime($due)) / 86400);
        return $days === 1 ? 'Yesterday' . $time : $days . ' days ago' . $time;
    }
    // Inside the week the day name is what people plan by; past that a date
    // is the only thing that means anything.
    $days = (int) floor((strtotime($due) - strtotime($today)) / 86400);
    return ($days <= 6 ? date('l', strtotime($due)) : date('D d M', strtotime($due))) . $time;
}

/**
 * The ones the bell should carry, in the shape every other alert uses.
 *
 * Only what is overdue or due inside the week. A reminder set for next month
 * is a real reminder and not something to be told about every morning until
 * then -- that is how a list stops being read.
 */
function reminder_alerts(string $today): array
{
    $horizon = date('Y-m-d', strtotime($today . ' +' . REMINDER_HORIZON_DAYS . ' days'));
    $out     = [];

    foreach (reminders_open() as $row) {
        $due = (string) $row['due_on'];
        if ($due > $horizon) {
            continue;
        }
        $late = $due < $today;
        $out[] = [
            'kind'        => 'reminder',
            'level'       => $late ? 'overdue' : 'soon',
            'reminder_id' => (int) $row['id'],
            'booking_id'  => $row['booking_id'] === null ? null : (int) $row['booking_id'],
            'vehicle_id'  => $row['vehicle_id'] === null ? null : (int) $row['vehicle_id'],
            'subject'     => $row['title'],
            'message'     => reminder_when($row, $today)
                . ($row['note'] !== null && $row['note'] !== '' ? ' · ' . $row['note'] : ''),
            // Sorted with everything else: overdue first, most overdue at the
            // top. Negative days is what the alert sort reads as "late".
            'days'        => $late
                ? -((int) floor((strtotime($today) - strtotime($due)) / 86400)) - 1
                : (int) floor((strtotime($due) - strtotime($today)) / 86400),
        ];
    }
    return $out;
}

/** What the client is given for each reminder. */
function present_reminder(array $row, string $today): array
{
    return [
        'id'         => (int) $row['id'],
        'title'      => $row['title'],
        'note'       => $row['note'],
        'due_on'     => $row['due_on'],
        'due_at'     => $row['due_at'],
        'when'       => reminder_when($row, $today),
        'overdue'    => $row['done_at'] === null && (string) $row['due_on'] < $today,
        'done'       => $row['done_at'] !== null,
        'done_at'    => $row['done_at'],
        'booking_id' => $row['booking_id'] === null ? null : (int) $row['booking_id'],
        'vehicle_id' => $row['vehicle_id'] === null ? null : (int) $row['vehicle_id'],
        'booking_number' => $row['booking_number'] ?? null,
        'vehicle_name'   => $row['vehicle_name'] ?? null,
        'set_by'     => $row['created_by_name'] ?? null,
    ];
}
