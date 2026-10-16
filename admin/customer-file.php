<?php
declare(strict_types=1);

require_once __DIR__ . '/src/auth.php';
require_once __DIR__ . '/src/customer-files.php';

/**
 * Streams a customer's document. Signed-in users only.
 *
 * The most private thing this system serves: a driving licence carries a name,
 * an address, a date of birth and a photograph. Same rules as the booking
 * attachments -- a session is required, nothing shared may cache it, and the
 * file name is random so it says nothing on its own.
 */

require_login();

$name = image_requested_name();

if (!preg_match('/^cu\d+-[a-z]+-[0-9a-f]{16}\.(jpg|png|webp|avif|pdf)$/', $name, $m)) {
    image_not_found();
}

$path = customer_file_dir() . '/' . $name;
if (!is_file($path)) {
    image_not_found();
}

header('Cache-Control: private, max-age=0, no-store');
header('Referrer-Policy: same-origin');

// A PDF is opened by the browser's own viewer, which is what "inline" asks
// for. The nosniff header in image_stream_private is what stops the browser
// deciding a document is something else.
image_stream_private($path, DOCUMENT_TYPES[$m[1]]);
