<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/db.php';
require_once __DIR__ . '/../src/http.php';
require_once __DIR__ . '/../src/places.php';

/**
 * Places worth driving to, for the public website.
 *
 * Read-only, no session, published rows only. Same shape of endpoint as
 * public-vehicles.php, and the same short cache: long enough to absorb a burst
 * of visitors, short enough that adding a place does not feel broken.
 */

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Only GET is supported here.', 405);
}

header('Cache-Control: public, max-age=60');

$places = [];
foreach (places_all() as $row) {
    $places[] = [
        'id'       => (string) $row['id'],
        'name'     => (string) $row['name'],
        'category' => (string) $row['category'],
        'blurb'    => (string) $row['blurb'],
        'mapUrl'   => (string) $row['map_url'],
        // Relative to the panel, which is where the site asks -- resolved
        // against the panel and not the page by the site's own helper.
        'photo'    => place_photo_url($row['photo_file'] ?? null),
    ];
}

json_out(['ok' => true, 'places' => $places]);
