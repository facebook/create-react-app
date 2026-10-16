<?php
declare(strict_types=1);

require_once __DIR__ . '/src/site-images.php';

/**
 * Streams one of the site's own images.
 *
 * Public, like the car photographs: these are the logo, the banners and the
 * cards on every page of the website. What is checked is that the name is one
 * this code generates, matching the exact shape and nothing else -- a request
 * for ../../nitesha-config/config.php has to come back a 404.
 *
 * Reached two ways. /admin/images/<name> is what the site asks for now, sent
 * here by admin/.htaccess, because the words in a file name are worth having
 * in the address. ?f=<name> still answers: every image uploaded before this
 * has that address stored in a page somewhere, and breaking them to tidy up
 * the newer ones would be the wrong trade.
 */

$name = image_requested_name();

if (!preg_match(IMAGE_NAME_PATTERN, $name, $m)) {
    image_not_found();
}

$path = site_image_dir() . '/' . $name;
if (!is_file($path)) {
    image_not_found();
}

image_stream($path, VEHICLE_PHOTO_MIME[$m[1]]);
