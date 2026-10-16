<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/image-names.php';
require_once __DIR__ . '/vehicle-photos.php';

/**
 * Places worth driving to.
 *
 * Content, not code: somewhere new opens and the owner adds it, rather than
 * waiting for a deploy. The glass bridge is the case that makes the point --
 * it opened recently, and a hardcoded list would have missed it until someone
 * noticed and asked.
 *
 * Photographs are stored the way every other upload here is: above the
 * document root, read back through a small PHP script, validated by the same
 * function the car photographs use.
 */

function place_photo_dir(): string
{
    $base = (string) (config('storage_path') ?? (dirname(__DIR__, 3) . '/nitesha-storage'));
    $dir  = rtrim($base, '/') . '/places';

    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    return $dir;
}

function place_photo_url(?string $name): ?string
{
    // /place-photos/, from the site root, for the same reason as the other
    // two: the words in the file name belong in the address, and the folder
    // they sit in should not be one a crawler is told to stay out of. The
    // ?f= form and the old /admin/ path both still answer.
    return ($name === null || $name === '') ? null : '/place-photos/' . rawurlencode($name);
}

/** Every place, in display order. Published only, unless asked otherwise. */
function places_all(bool $includeHidden = false): array
{
    if (!table_has_column('places', 'name')) {
        return [];
    }
    try {
        return fetch_all(
            'SELECT id, name, category, blurb, map_url, photo_file, sort_order, published
               FROM places'
            . ($includeHidden ? '' : ' WHERE published = 1')
            . ' ORDER BY sort_order, name'
        );
    } catch (Throwable $e) {
        error_log('places read failed: ' . $e->getMessage());
        return [];
    }
}

/**
 * Only http(s), and only a URL the browser will treat as one.
 *
 * A "link" field that accepts anything is a stored-XSS hole the first time
 * someone pastes javascript: into it -- and the person pasting need not be
 * hostile, only careless with something they copied.
 */
function place_map_url_ok(string $url): bool
{
    if ($url === '') {
        return true;
    }
    $parts = parse_url($url);
    return is_array($parts)
        && in_array(strtolower($parts['scheme'] ?? ''), ['http', 'https'], true)
        && ($parts['host'] ?? '') !== '';
}

/** Creates or updates one place. Returns null, or why it was refused. */
function place_save(array $input, ?array $file, int $userId): ?string
{
    $id    = isset($input['id']) && $input['id'] !== '' ? (int) $input['id'] : null;
    $name  = trim((string) ($input['name'] ?? ''));
    $url   = trim((string) ($input['map_url'] ?? ''));

    if ($name === '') {
        return 'A place needs a name.';
    }
    if (!place_map_url_ok($url)) {
        return 'The map link has to start with http:// or https://.';
    }

    $fields = [
        $name,
        trim((string) ($input['category'] ?? '')),
        trim((string) ($input['blurb'] ?? '')),
        $url,
        (int) ($input['sort_order'] ?? 0),
        isset($input['published']) ? 1 : 0,
    ];

    if ($id === null) {
        query('INSERT INTO places (name, category, blurb, map_url, sort_order, published)
               VALUES (?,?,?,?,?,?)', $fields);
        $id = (int) last_insert_id();
    } else {
        query('UPDATE places SET name = ?, category = ?, blurb = ?, map_url = ?,
                      sort_order = ?, published = ? WHERE id = ?',
            [...$fields, $id]);
    }

    // The photograph is optional on every save, so leaving the field empty
    // keeps the picture that is already there rather than clearing it.
    if (is_array($file) && ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
        [$extension, $problem] = vehicle_photo_check($file);
        if ($problem !== null) {
            return 'The place was saved, but the image was not: ' . $problem;
        }

        $previous = (string) (fetch_one('SELECT photo_file FROM places WHERE id = ?', [$id])['photo_file'] ?? '');
        // Named for the place, so the file is called
        // vattakottai-fort-places-to-visit-kanyakumari-<random>.jpg. These end
        // up in the image sitemap, and a picture of a landmark is exactly the
        // kind of thing found through image search.
        $stored   = image_name($name . ' places to visit Kanyakumari', $extension, 'place-' . $id);

        if (!move_uploaded_file((string) $file['tmp_name'], place_photo_dir() . '/' . $stored)) {
            return 'The place was saved, but the image could not be written.';
        }
        @chmod(place_photo_dir() . '/' . $stored, 0640);

        query('UPDATE places SET photo_file = ? WHERE id = ?', [$stored, $id]);
        place_photo_delete($previous);
    }

    audit_log('place_saved', 'places', 'place', $id, null, ['name' => $name], null, $userId, '');
    return null;
}

function place_delete(int $id, int $userId): void
{
    $row = fetch_one('SELECT name, photo_file FROM places WHERE id = ?', [$id]);
    if ($row === null) {
        return;
    }
    query('DELETE FROM places WHERE id = ?', [$id]);
    place_photo_delete((string) ($row['photo_file'] ?? ''));
    audit_log('place_deleted', 'places', 'place', $id, ['name' => $row['name']], null, null, $userId, '');
}

function place_photo_delete(?string $name): void
{
    if ($name === null || $name === '' || str_contains($name, '/') || str_contains($name, '\\')) {
        return;
    }
    @unlink(place_photo_dir() . '/' . $name);
}
