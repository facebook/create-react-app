<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/http.php';
require_once __DIR__ . '/../src/reminder.php';

/**
 * Reminders somebody sets themselves.
 *
 * Deliberately small. A title, a date, an optional time and an optional note,
 * and a tick when it is done. Anything more -- repeats, categories, priority
 * -- is a to-do application, and the one that already exists on everybody's
 * phone is better at being one than this will be. What this has that the phone
 * does not is that it sits beside the bookings the reminders are about.
 */

$action = $_GET['action'] ?? 'list';
$today  = date('Y-m-d');

switch ($action) {

    // ---------------------------------------------------------------- list --
    case 'list': {
        api_guard('reminder.view');
        if (!reminders_ready()) {
            // A panel that has not run the migration says so plainly rather
            // than showing an empty list somebody would add to and lose.
            json_out(['ok' => true, 'ready' => false, 'open' => [], 'done' => []]);
        }
        json_out([
            'ok'    => true,
            'ready' => true,
            'open'  => array_map(static fn(array $r): array => present_reminder($r, $today),
                                 reminders_open()),
            'done'  => array_map(static fn(array $r): array => present_reminder($r, $today),
                                 reminders_done()),
        ]);
    }

    // ---------------------------------------------------------------- save --
    case 'save': {
        // Guarded for what this call actually is. Editing somebody else's
        // reminder is a different permission to writing your own.
        //
        // Written out as two calls rather than one with a conditional
        // argument so that the permission names are literals: the Users
        // screen offers only abilities something enforces, and the check
        // that keeps that honest reads this file for them.
        $input = json_input();
        $id    = (int) ($input['id'] ?? 0);
        $user  = $id > 0
            ? api_guard('reminder.edit', true)
            : api_guard('reminder.create', true);

        if (!reminders_ready()) {
            json_error('This panel is a database update behind. Reload it and try again.', 409);
        }

        $data = (new Validator($input))
            ->required('title', 'Reminder')
            ->optional('note', 2000)
            ->required('due_on', 'Date')
            ->optional('due_at', 5)
            ->integer('booking_id', 'Booking', 1, null, false)
            ->integer('vehicle_id', 'Vehicle', 1, null, false)
            ->orFail();

        // Longer than the column and MySQL would truncate it without a word,
        // so the reminder somebody wrote is not the one they get back.
        if (mb_strlen($data['title']) > 190) {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['title' => 'Keep the reminder under 190 characters.'
                    . ' The longer version belongs in the note.']]);
        }

        // A date the database would reject silently becomes a reminder that
        // never fires, which is worse than one that was never set.
        $due = date_create_immutable_from_format('!Y-m-d', $data['due_on']);
        if ($due === false || $due->format('Y-m-d') !== $data['due_on']) {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['due_on' => 'That is not a date.']]);
        }

        $at = null;
        if (($data['due_at'] ?? '') !== '' && $data['due_at'] !== null) {
            if (!preg_match('/^([01][0-9]|2[0-3]):[0-5][0-9]$/', (string) $data['due_at'])) {
                json_error('Please correct the highlighted fields.', 422,
                    ['fields' => ['due_at' => 'A time looks like 09:00 or 17:30.']]);
            }
            $at = $data['due_at'] . ':00';
        }

        if ($id > 0) {
            $before = reminder_find($id);
            if ($before === null) {
                json_error('That reminder no longer exists.', 404);
            }
            query('UPDATE reminders SET title = ?, note = ?, due_on = ?, due_at = ?,
                          booking_id = ?, vehicle_id = ? WHERE id = ?',
                [$data['title'], $data['note'] ?: null, $data['due_on'], $at,
                 $data['booking_id'], $data['vehicle_id'], $id]);
            audit_log('reminder_updated', 'reminders', 'reminder', $id,
                ['title' => $before['title'], 'due_on' => $before['due_on']],
                ['title' => $data['title'], 'due_on' => $data['due_on']], null,
                (int) $user['id'], $user['name']);
        } else {
            query('INSERT INTO reminders (title, note, due_on, due_at, booking_id, vehicle_id, created_by)
                   VALUES (?,?,?,?,?,?,?)',
                [$data['title'], $data['note'] ?: null, $data['due_on'], $at,
                 $data['booking_id'], $data['vehicle_id'], $user['id']]);
            $id = last_insert_id();
            audit_log('reminder_added', 'reminders', 'reminder', $id, null,
                ['title' => $data['title'], 'due_on' => $data['due_on']], null,
                (int) $user['id'], $user['name']);
        }

        $row = fetch_one(
            'SELECT r.*, u.name AS created_by_name, b.booking_number, v.name AS vehicle_name
               FROM reminders r
          LEFT JOIN users    u ON u.id = r.created_by
          LEFT JOIN bookings b ON b.id = r.booking_id
          LEFT JOIN vehicles v ON v.id = r.vehicle_id
              WHERE r.id = ?', [$id]);

        if ($row === null) {
            json_error('The reminder was saved but could not be read back.', 500);
        }
        json_out(['ok' => true, 'reminder' => present_reminder($row, $today)]);
    }

    // ---------------------------------------------------------------- done --
    //
    // Ticked off, and untickable. A reminder marked done by mistake is a
    // reminder lost, and the fix should not be retyping it from memory.
    case 'done':
    case 'reopen': {
        $user = api_guard('reminder.edit', true);
        $id   = (int) (json_input()['id'] ?? 0);

        $row = reminder_find($id);
        if ($row === null) {
            json_error('That reminder no longer exists.', 404);
        }

        $closing = $action === 'done';
        query($closing
            ? 'UPDATE reminders SET done_at = NOW(), done_by = ? WHERE id = ? AND done_at IS NULL'
            : 'UPDATE reminders SET done_at = NULL, done_by = NULL WHERE id = ?',
            $closing ? [$user['id'], $id] : [$id]);

        audit_log($closing ? 'reminder_done' : 'reminder_reopened', 'reminders', 'reminder', $id,
            ['done' => $row['done_at'] !== null], ['done' => $closing], null,
            (int) $user['id'], $user['name']);

        json_out(['ok' => true]);
    }

    // -------------------------------------------------------------- delete --
    //
    // Unlike money, a reminder is not a record of anything that happened, so
    // there is nothing to preserve by voiding it instead of removing it.
    case 'delete': {
        $user = api_guard('reminder.delete', true);
        $id   = (int) (json_input()['id'] ?? 0);

        $row = reminder_find($id);
        if ($row === null) {
            json_error('That reminder no longer exists.', 404);
        }
        query('DELETE FROM reminders WHERE id = ?', [$id]);
        audit_log('reminder_deleted', 'reminders', 'reminder', $id,
            ['title' => $row['title'], 'due_on' => $row['due_on']], null, null,
            (int) $user['id'], $user['name']);

        json_out(['ok' => true]);
    }

    default:
        json_error('Unknown action', 400);
}
