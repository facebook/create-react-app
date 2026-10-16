<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/image-names.php';
require_once __DIR__ . '/vehicle-photos.php';

/**
 * A customer's identity documents.
 *
 * Against the customer rather than the booking. A returning customer's licence
 * is the same licence, and asking for it again every hire is how a file ends
 * up attached to three bookings and missing from the fourth.
 *
 * These are the most private things this system holds -- a licence carries a
 * name, an address, a date of birth and a photograph. They are stored above
 * the document root like every other upload and read back only by a signed-in
 * user, and the file names carry nothing.
 */

const CUSTOMER_FILE_KINDS = [
    'licence'  => 'Driving licence',
    'id'       => 'Aadhaar / ID',
    'passport' => 'Passport',
    'other'    => 'Other document',
];

/** Documents are commonly a PDF or a photograph of one, so both are taken. */
const DOCUMENT_TYPES = [
    'jpg'  => 'image/jpeg',
    'png'  => 'image/png',
    'webp' => 'image/webp',
    'avif' => 'image/avif',
    'pdf'  => 'application/pdf',
];

/** 8 MB. A scanned licence is under one; a phone photograph of one is two. */
const DOCUMENT_MAX_BYTES = 8 * 1024 * 1024;

function customer_file_dir(): string
{
    $base = (string) (config('storage_path') ?? (dirname(__DIR__, 3) . '/nitesha-storage'));
    $dir  = rtrim($base, '/') . '/customers';

    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    return $dir;
}

function customer_files_ready(): bool
{
    return table_has_column('customer_files', 'file');
}

/**
 * Checks an upload and returns [extension, null] or [null, reason].
 *
 * Not vehicle_photo_check, which decides by getimagesize and so refuses every
 * PDF -- and a PDF is what most licences arrive as. A PDF is identified by its
 * first five bytes rather than by what the browser called it, for the same
 * reason the images are: the person uploading chooses the file name and the
 * declared type, and neither is evidence of anything.
 */
function document_check(array $file): array
{
    $error = $file['error'] ?? UPLOAD_ERR_NO_FILE;

    if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE) {
        return [null, 'That file is larger than the server will accept. Around 5 MB is the limit.'];
    }
    if ($error !== UPLOAD_ERR_OK) {
        return [null, 'The file did not finish uploading. Try again.'];
    }
    if (($file['size'] ?? 0) > DOCUMENT_MAX_BYTES) {
        return [null, 'That file is over 8 MB. A photograph of the document is usually far smaller.'];
    }

    $tmp = (string) ($file['tmp_name'] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) {
        return [null, 'That upload could not be read.'];
    }

    // A PDF starts "%PDF-". Anything else has to be an image the site can show.
    $head = (string) @file_get_contents($tmp, false, null, 0, 5);
    if ($head === '%PDF-') {
        return ['pdf', null];
    }

    $info = @getimagesize($tmp);
    if ($info === false || !isset(VEHICLE_PHOTO_TYPES[$info[2]])) {
        return [null, 'That is not a document this can store. Use a PDF, or a JPG or PNG photograph of it.'];
    }

    return [VEHICLE_PHOTO_TYPES[$info[2]], null];
}

/** The URL the panel fetches one of these from. */
function customer_file_url(string $name): string
{
    return 'customer-file.php?f=' . rawurlencode($name);
}

/** Every document held for a customer, newest of each kind first. */
function customer_files(int $customerId): array
{
    if (!customer_files_ready() || $customerId <= 0) {
        return [];
    }

    try {
        $rows = fetch_all(
            'SELECT id, kind, file, caption, expires_on, created_at
               FROM customer_files WHERE customer_id = ? ORDER BY id DESC',
            [$customerId]
        );
    } catch (Throwable $e) {
        error_log('customer_files read failed: ' . $e->getMessage());
        return [];
    }

    $out = [];
    foreach ($rows as $row) {
        $name = (string) $row['file'];
        $out[] = [
            'id'         => (int) $row['id'],
            'kind'       => (string) $row['kind'],
            'label'      => CUSTOMER_FILE_KINDS[$row['kind']] ?? 'Document',
            'url'        => customer_file_url($name),
            'caption'    => $row['caption'],
            'expires_on' => $row['expires_on'],
            'is_pdf'     => str_ends_with($name, '.pdf'),
            'created_at' => $row['created_at'],
        ];
    }
    return $out;
}

/**
 * Stores one document against a customer, replacing the previous one of that
 * kind.
 *
 * Replacing rather than accumulating: a customer has one driving licence, and
 * four uploads of it is four things to look through to find the current one.
 * "Other" is the exception -- that is where anything else goes, and there can
 * be several.
 */
function customer_file_save(
    int $customerId,
    string $kind,
    array $file,
    int $userId,
    ?string $expiresOn = null
): ?string {
    if (!isset(CUSTOMER_FILE_KINDS[$kind])) {
        return 'That is not one of the documents this keeps.';
    }
    if (!customer_files_ready()) {
        return 'The database has not been updated for documents yet. Open the panel again and retry.';
    }

    [$extension, $problem] = document_check($file);
    if ($problem !== null) {
        return $problem;
    }

    $name = sprintf('cu%d-%s-%s.%s', $customerId, $kind, bin2hex(random_bytes(8)), $extension);

    if (!move_uploaded_file((string) $file['tmp_name'], customer_file_dir() . '/' . $name)) {
        return 'The document could not be saved on the server.';
    }
    @chmod(customer_file_dir() . '/' . $name, 0640);

    $replaced = [];
    if ($kind !== 'other') {
        $replaced = fetch_all(
            'SELECT id FROM customer_files WHERE customer_id = ? AND kind = ?',
            [$customerId, $kind]
        );
    }

    query(
        'INSERT INTO customer_files (customer_id, kind, file, caption, expires_on, uploaded_by)
         VALUES (?,?,?,?,?,?)',
        [$customerId, $kind, $name, substr((string) ($file['name'] ?? ''), 0, 160),
         $expiresOn === '' ? null : $expiresOn, $userId]
    );

    // Only once the new one is stored, so a failed write never leaves the
    // customer with no licence on file.
    foreach ($replaced as $old) {
        customer_file_delete((int) $old['id']);
    }

    return null;
}

/** Removes one document and its file. Returns the customer it belonged to. */
function customer_file_delete(int $id): ?int
{
    if (!customer_files_ready()) {
        return null;
    }

    $row = fetch_one('SELECT customer_id, file FROM customer_files WHERE id = ?', [$id]);
    if ($row === null) {
        return null;
    }

    query('DELETE FROM customer_files WHERE id = ?', [$id]);

    $name = (string) $row['file'];
    if ($name !== '' && !str_contains($name, '/') && !str_contains($name, '\\')) {
        @unlink(customer_file_dir() . '/' . $name);
    }

    return (int) $row['customer_id'];
}
