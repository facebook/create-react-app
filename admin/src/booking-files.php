<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/image-names.php';
require_once __DIR__ . '/vehicle-photos.php';

/**
 * Files attached to a booking: payment screenshots and condition photographs.
 *
 * Stored the way every upload here is -- above the document root, so a deploy
 * cannot erase them -- and read back through booking-file.php.
 *
 * With one difference that matters more than the rest of this file. The other
 * readers are deliberately public: a vehicle photograph is an advertisement
 * and a logo is on every page. These are not. A payment screenshot carries a
 * customer's name, their bank and an amount; a pickup photograph shows a
 * registration plate and where the car was standing. booking-file.php requires
 * a signed-in user, and the names here are random rather than descriptive for
 * the same reason -- a file name should not say "advance-payment-10000".
 */

/** The boxes in the panel these can come from. */
const BOOKING_FILE_KINDS = [
    'payment' => 'Payment screenshot',
    'deposit' => 'Deposit proof',
    'refund'  => 'Refund proof',
    'pickup'  => 'Pickup photo',
    'return'  => 'Return photo',
];

/** How many may hang off one booking for one kind. */
const BOOKING_FILE_MAX_PER_KIND = 12;

function booking_file_dir(): string
{
    $base = (string) (config('storage_path') ?? (dirname(__DIR__, 3) . '/nitesha-storage'));
    $dir  = rtrim($base, '/') . '/bookings';

    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    return $dir;
}

/** True once 008_booking_files.sql has run. */
function booking_files_ready(): bool
{
    return table_has_column('booking_files', 'file');
}

/** The URL the panel fetches one of these from. */
function booking_file_url(string $name): string
{
    return 'booking-file.php?f=' . rawurlencode($name);
}

/**
 * Every file on a booking, grouped by kind.
 *
 * Grouped here rather than in the browser because every caller wants it that
 * way: each section of the detail screen shows its own kind and nothing else.
 */
function booking_files(int $bookingId): array
{
    if (!booking_files_ready()) {
        return [];
    }

    try {
        $rows = fetch_all(
            'SELECT id, kind, ref_id, file, caption, created_at
               FROM booking_files WHERE booking_id = ? ORDER BY id',
            [$bookingId]
        );
    } catch (Throwable $e) {
        error_log('booking_files read failed: ' . $e->getMessage());
        return [];
    }

    $out = [];
    foreach ($rows as $row) {
        $out[(string) $row['kind']][] = [
            'id'         => (int) $row['id'],
            'ref_id'     => $row['ref_id'] === null ? null : (int) $row['ref_id'],
            'url'        => booking_file_url((string) $row['file']),
            'caption'    => $row['caption'],
            'created_at' => $row['created_at'],
        ];
    }
    return $out;
}

/**
 * Stores one upload against a booking.
 *
 * Returns null on success or a sentence explaining the refusal, matching the
 * shape site_image_save uses -- the caller decides how to show it.
 */
function booking_file_save(
    int $bookingId,
    string $kind,
    array $file,
    int $userId,
    ?int $refId = null,
    ?string $caption = null
): ?string {
    if (!isset(BOOKING_FILE_KINDS[$kind])) {
        return 'That is not one of the places a file can be attached.';
    }
    if (!booking_files_ready()) {
        return 'The database has not been updated for attachments yet. Open the panel again and retry.';
    }

    [$extension, $problem] = vehicle_photo_check($file);
    if ($problem !== null) {
        return $problem;
    }

    $held = (int) (fetch_one(
        'SELECT COUNT(*) AS n FROM booking_files WHERE booking_id = ? AND kind = ?',
        [$bookingId, $kind]
    )['n'] ?? 0);

    if ($held >= BOOKING_FILE_MAX_PER_KIND) {
        return sprintf(
            'There are already %d %s files on this booking, which is the limit.',
            BOOKING_FILE_MAX_PER_KIND,
            strtolower(BOOKING_FILE_KINDS[$kind])
        );
    }

    // Random rather than descriptive, unlike the public images. Anyone who
    // learns one of these addresses still cannot read it without signing in,
    // and there is no reason for the name itself to say whose payment it is.
    $name = sprintf('bk%d-%s-%s.%s', $bookingId, $kind, bin2hex(random_bytes(8)), $extension);

    if (!move_uploaded_file((string) $file['tmp_name'], booking_file_dir() . '/' . $name)) {
        return 'The file could not be saved on the server.';
    }
    @chmod(booking_file_dir() . '/' . $name, 0640);

    query(
        'INSERT INTO booking_files (booking_id, kind, ref_id, file, caption, uploaded_by)
         VALUES (?,?,?,?,?,?)',
        [$bookingId, $kind, $refId, $name, $caption, $userId]
    );

    return null;
}

/** Removes one file and its row. Returns the booking it belonged to, or null. */
function booking_file_delete(int $id): ?int
{
    if (!booking_files_ready()) {
        return null;
    }

    $row = fetch_one('SELECT booking_id, file FROM booking_files WHERE id = ?', [$id]);
    if ($row === null) {
        return null;
    }

    query('DELETE FROM booking_files WHERE id = ?', [$id]);

    // Only once the row is gone, so a failed delete never leaves the panel
    // showing a thumbnail for a file that is not there.
    $name = (string) $row['file'];
    if ($name !== '' && !str_contains($name, '/') && !str_contains($name, '\\')) {
        @unlink(booking_file_dir() . '/' . $name);
    }

    return (int) $row['booking_id'];
}
