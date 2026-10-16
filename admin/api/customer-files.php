<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/http.php';
require_once __DIR__ . '/../src/audit.php';
require_once __DIR__ . '/../src/customer-files.php';

/**
 * Uploading and removing a customer's documents.
 *
 * Multipart, so it is its own endpoint rather than part of bookings.php, for
 * the same reason vehicle-photo.php is separate from vehicles.php.
 */

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list': {
        api_guard('booking.view');
        $customerId = (int) ($_GET['customer_id'] ?? 0);
        json_out(['ok' => true, 'files' => customer_files($customerId)]);
    }

    case 'add': {
        $user = api_guard('booking.create', true);

        $customerId = (int) ($_POST['customer_id'] ?? 0);
        $kind       = (string) ($_POST['kind'] ?? '');
        $expires    = trim((string) ($_POST['expires_on'] ?? ''));

        if ($customerId <= 0) {
            json_error('Which customer this belongs to was not sent.', 422);
        }
        if (!isset(CUSTOMER_FILE_KINDS[$kind])) {
            json_error('That is not one of the documents this keeps.', 422);
        }
        if (!customer_files_ready()) {
            $why = last_migration_error();
            json_error('The documents table is still missing from the database.'
                . ($why !== null ? ' The database refused to add it: ' . $why : ''), 500);
        }

        $file = $_FILES['file'] ?? null;
        if (!is_array($file)) {
            json_error('No document was attached.', 422);
        }

        $problem = customer_file_save($customerId, $kind, $file, (int) $user['id'],
            $expires === '' ? null : $expires);
        if ($problem !== null) {
            json_error($problem, 422);
        }

        audit_log('customer_document_added', 'bookings', 'customer', $customerId, null,
            ['kind' => $kind], null, (int) $user['id'], $user['name'], null, $customerId);

        json_out(['ok' => true, 'files' => customer_files($customerId)]);
    }

    // What the document is and when it runs out, without re-uploading it.
    //
    // A licence photographed into the wrong slot, or filed with the expiry
    // read off the wrong line, used to mean removing the file and finding it
    // again on whichever phone took it. The file itself is never changed
    // here: replacing it is a removal and a fresh upload, which is what the
    // record should say happened.
    case 'edit': {
        $user = api_guard('booking.create', true);
        $body = json_input();

        $id      = (int) ($body['id'] ?? 0);
        $kind    = (string) ($body['kind'] ?? '');
        $caption = trim((string) ($body['caption'] ?? ''));
        $expires = trim((string) ($body['expires_on'] ?? ''));

        if ($id <= 0) {
            json_error('Which document to change was not sent.', 422);
        }
        if (!isset(CUSTOMER_FILE_KINDS[$kind])) {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['kind' => 'That is not one of the documents this keeps.']]);
        }
        if ($expires !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $expires)) {
            json_error('Please correct the highlighted fields.', 422,
                ['fields' => ['expires_on' => 'A date, as year-month-day.']]);
        }

        $row = fetch_one('SELECT * FROM customer_files WHERE id = ?', [$id]);
        if ($row === null) {
            json_error('That document is no longer on file.', 404);
        }

        query('UPDATE customer_files SET kind = ?, caption = ?, expires_on = ? WHERE id = ?',
            [$kind, $caption === '' ? null : mb_substr($caption, 0, 160),
             $expires === '' ? null : $expires, $id]);

        audit_log('customer_document_changed', 'bookings', 'customer',
            (int) $row['customer_id'],
            ['kind' => $row['kind'], 'caption' => $row['caption'],
             'expires_on' => $row['expires_on']],
            ['kind' => $kind, 'caption' => $caption, 'expires_on' => $expires],
            null, (int) $user['id'], $user['name'], null, (int) $row['customer_id']);

        json_out(['ok' => true, 'files' => customer_files((int) $row['customer_id'])]);
    }

    case 'delete': {
        $user = api_guard('booking.create', true);
        $body = json_input();
        $id   = (int) ($body['id'] ?? 0);

        if ($id <= 0) {
            json_error('Which document to remove was not sent.', 422);
        }

        $customerId = customer_file_delete($id);
        if ($customerId === null) {
            json_error('That document is not there any more.', 404);
        }

        audit_log('customer_document_removed', 'bookings', 'customer', $customerId, null,
            ['file_id' => $id], null, (int) $user['id'], $user['name'], null, $customerId);

        json_out(['ok' => true, 'files' => customer_files($customerId)]);
    }

    default:
        json_error('Unknown action.', 404);
}
