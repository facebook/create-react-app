<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/http.php';
require_once __DIR__ . '/../src/audit.php';
require_once __DIR__ . '/../src/booking-files.php';

/**
 * Attaching files to a booking, and removing them.
 *
 * Separate from bookings.php and payments.php because this one takes multipart
 * form data rather than JSON -- the same reason vehicle-photo.php is separate
 * from vehicles.php. Folding an upload into an endpoint that parses a JSON
 * body means the body being read two different ways depending on the request.
 *
 * Several files in one request, because the pickup and return boxes accept
 * several and asking the browser to make five round trips for five photographs
 * over a phone connection is how half of them end up missing.
 */

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'add': {
        $user = api_guard('booking.create', true);

        $bookingId = (int) ($_POST['booking_id'] ?? 0);
        $kind      = (string) ($_POST['kind'] ?? '');
        $refId     = ($_POST['ref_id'] ?? '') === '' ? null : (int) $_POST['ref_id'];

        if ($bookingId <= 0) {
            json_error('Which booking this belongs to was not sent.', 422);
        }
        if (!isset(BOOKING_FILE_KINDS[$kind])) {
            json_error('That is not one of the places a file can be attached.', 422);
        }
        if (!booking_files_ready()) {
            $why = last_migration_error();
            json_error(
                'The attachments table is still missing from the database.'
                . ($why !== null ? ' The database refused to add it: ' . $why : ''),
                500
            );
        }

        // A <input type="file" multiple> arrives as one $_FILES entry holding
        // parallel arrays rather than one entry per file, so it is turned back
        // into ordinary uploads here. A single-file input arrives as scalars,
        // and both shapes go through the same path below.
        $sent = $_FILES['files'] ?? null;
        if (!is_array($sent) || !isset($sent['tmp_name'])) {
            json_error('No file was attached.', 422);
        }

        $uploads = [];
        if (is_array($sent['tmp_name'])) {
            foreach (array_keys($sent['tmp_name']) as $i) {
                $uploads[] = [
                    'name'     => $sent['name'][$i] ?? '',
                    'type'     => $sent['type'][$i] ?? '',
                    'tmp_name' => $sent['tmp_name'][$i] ?? '',
                    'error'    => $sent['error'][$i] ?? UPLOAD_ERR_NO_FILE,
                    'size'     => $sent['size'][$i] ?? 0,
                ];
            }
        } else {
            $uploads[] = $sent;
        }

        $saved    = 0;
        $problems = [];

        foreach ($uploads as $upload) {
            if (($upload['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
                continue;
            }

            // The name the file arrived with, kept only as a caption. It is
            // never used to build a path -- see booking_file_save -- but
            // "scan_20260921.jpg" is worth showing under a thumbnail.
            $caption = substr(preg_replace('/[^\w. -]/', '', (string) ($upload['name'] ?? '')) ?? '', 0, 160);

            $problem = booking_file_save($bookingId, $kind, $upload, (int) $user['id'], $refId,
                $caption === '' ? null : $caption);

            if ($problem !== null) {
                $problems[] = $problem;
            } else {
                $saved++;
            }
        }

        if ($saved === 0) {
            json_error($problems[0] ?? 'No file was attached.', 422);
        }

        audit_log('booking_files_added', 'bookings', 'booking', $bookingId, null,
            ['kind' => $kind, 'count' => $saved], null,
            (int) $user['id'], $user['name'], $bookingId);

        // Partial success is still success, and saying which ones were refused
        // is the difference between "some photos are missing" and knowing why.
        json_out([
            'ok'      => true,
            'saved'   => $saved,
            'warning' => $problems === [] ? null : implode(' ', array_unique($problems)),
            'files'   => booking_files($bookingId),
        ]);
    }

    case 'delete': {
        $user = api_guard('booking.create', true);

        $body = json_input();
        $id   = (int) ($body['id'] ?? 0);
        if ($id <= 0) {
            json_error('Which file to remove was not sent.', 422);
        }

        $bookingId = booking_file_delete($id);
        if ($bookingId === null) {
            json_error('That file is not there any more.', 404);
        }

        audit_log('booking_file_removed', 'bookings', 'booking', $bookingId, null,
            ['file_id' => $id], null, (int) $user['id'], $user['name'], $bookingId);

        json_out(['ok' => true, 'files' => booking_files($bookingId)]);
    }

    default:
        json_error('Unknown action.', 404);
}
