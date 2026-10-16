<?php
declare(strict_types=1);

require_once __DIR__ . '/src/places.php';

/**
 * Streams a place's photograph. Public, like the car photographs.
 *
 * Only names of the shape this code generates are answered, which is a better
 * rule than trying to enumerate the ways a path can escape a directory.
 *
 * /admin/place-photos/<name> is the address the site uses now, routed here by
 * admin/.htaccess; ?f=<name> still answers for anything stored earlier.
 */

$name = image_requested_name();

if (!preg_match(IMAGE_NAME_PATTERN, $name, $m)) {
    image_not_found();
}

$path = place_photo_dir() . '/' . $name;
if (!is_file($path)) {
    image_not_found();
}

image_stream($path, VEHICLE_PHOTO_MIME[$m[1]]);
