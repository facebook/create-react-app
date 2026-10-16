<?php
declare(strict_types=1);

require_once __DIR__ . '/src/vehicle-photos.php';

/**
 * Streams a vehicle photograph.
 *
 * The files sit above the document root so a deploy cannot erase them, which
 * also means Apache cannot serve them directly. This reads one and sends it.
 *
 * No session and no permission check: these are pictures of cars for hire,
 * shown on the public website. What it does check is that the name it was
 * given is one of ours and names a file in exactly one directory -- a request
 * for ../../nitesha-config/config.php has to come back as a 404 and nothing
 * else.
 *
 * /admin/photos/<name> is the address the site uses now, routed here by
 * admin/.htaccess; ?f=<name> still answers for anything stored earlier.
 */

$name = image_requested_name();

if (!preg_match(IMAGE_NAME_PATTERN, $name, $m)) {
    image_not_found();
}

$path = vehicle_photo_dir() . '/' . $name;
if (!is_file($path)) {
    image_not_found();
}

image_stream($path, VEHICLE_PHOTO_MIME[$m[1]]);
