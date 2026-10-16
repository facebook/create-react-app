<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/db.php';
require_once __DIR__ . '/../src/http.php';
require_once __DIR__ . '/../src/site-images.php';

/**
 * Page content overrides, for the public website's build.
 *
 * Returns only what has been edited. The site ships every section's default
 * copy in my-app/src/content/defaults.json and lays these on top, so there is
 * no reason to send the defaults back to a caller that already has them --
 * and doing so was the only thing that made this endpoint depend on
 * src/content.php and content-defaults.json.
 *
 * That dependency mattered more than it looked. Those two files are new, so a
 * panel updated by hand has this endpoint without them, and it fails on the
 * require rather than doing anything useful. Reading the table directly keeps
 * this file standing on db.php and http.php alone, both of which have been on
 * the server since the panel was installed.
 *
 * Read by the build rather than by a visitor's browser: content fetched at
 * page load would sit behind JavaScript, and the site's ranking rests on the
 * prerendered HTML carrying the words.
 */

// ---- CORS: the same allowlist the other public endpoints use ----
$allowed = config('public_site_origin') ?? '';
$allowed = array_values(array_filter(array_map('strval', is_array($allowed) ? $allowed : [$allowed])));
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin !== '' && in_array($origin, $allowed, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Only GET is supported here.', 405);
}

// A build runs rarely, and someone who has just pressed Save should not be
// served a stale copy of their own edit.
header('Cache-Control: public, max-age=60');

// The table only exists once 003_content.sql has run. A panel that has not
// been migrated yet has nothing overridden, which is exactly what an empty
// result means -- so say so plainly rather than returning a 500 and making
// the site build fall back for the wrong reason.
$overrides = [];
$ready     = true;

try {
    foreach (fetch_all('SELECT page, section, data FROM content_sections') as $row) {
        $decoded = json_decode((string) $row['data'], true);
        if (is_array($decoded)) {
            $overrides[$row['page']][$row['section']] = $decoded;
        }
    }
} catch (Throwable $e) {
    $ready = false;
}

// The logo and the mark ride along with the wording rather than getting an
// endpoint of their own: the site already makes this request on every page, so
// a second one would be a second round trip for two short strings.
$brand = [];
foreach (site_images() as $slot => $file) {
    $brand[$slot] = site_image_url($file);
}

// Said separately from the map itself, because an empty map has two causes
// that look identical to a caller and need opposite fixes: nobody has
// uploaded anything yet, or 005_site_images.sql has never run on this
// database. site_images() answers [] to both. "No pictures yet" sends someone
// to the upload form; "the table is missing" sends them to open the panel
// once so the migration applies. Guessing between them is how an afternoon
// goes.
$imagesReady = table_has_column('site_images', 'file');

json_out([
    'ok'          => true,
    'ready'       => $ready,
    'imagesReady' => $imagesReady,
    'overrides'   => $overrides === [] ? (object) [] : $overrides,
    'brand'       => $brand === [] ? (object) [] : $brand,
]);
