<?php
declare(strict_types=1);

require_once __DIR__ . '/src/auth.php';
require_once __DIR__ . '/src/booking-files.php';

/**
 * Streams a file attached to a booking. Signed-in users only.
 *
 * This is the one image reader on the site that is not public, and the
 * difference is the whole point of it. brand.php and photo.php serve
 * advertisements; this serves a screenshot of somebody's UPI payment, with
 * their name and their bank on it, and photographs of a car with its
 * registration plate visible. A random file name is not access control -- the
 * session is.
 *
 * require_login redirects a browser to the sign-in form, which is right: these
 * are opened by clicking a thumbnail in the panel, and being sent to sign in
 * again after a session expires is the expected thing rather than a broken
 * image.
 */

require_login();

$name = image_requested_name();

// The shape this code generates: bk<id>-<kind>-<16 hex>.<ext>. Checked even
// though a session is already required, because a signed-in user is not a
// reason to let a path escape the directory.
if (!preg_match('/^bk\d+-[a-z]+-[0-9a-f]{16}\.(jpg|png|webp|avif)$/', $name, $m)) {
    image_not_found();
}

$path = booking_file_dir() . '/' . $name;
if (!is_file($path)) {
    image_not_found();
}

// Never cached by anything shared. A proxy holding a copy of a customer's
// payment screenshot is exactly what "private" is for, and these are small
// enough that re-fetching costs nothing worth saving.
header('Cache-Control: private, max-age=0, no-store');
header('Referrer-Policy: same-origin');

image_stream_private($path, VEHICLE_PHOTO_MIME[$m[1]]);
