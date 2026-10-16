<?php
declare(strict_types=1);

/**
 * What an uploaded picture is called, and therefore what its address is.
 *
 * Every image on this site is stored above the document root and streamed back
 * by a small PHP reader, so the address a visitor sees is one this code makes
 * up. It used to make up `v12-9f3a1c4b7d2e5a60.jpg`, served from
 * `photo.php?f=...`, and that is a wasted asset on a site whose whole business
 * is being found for "self drive car rental Nagercoil".
 *
 * Google reads the words in an image's URL -- it says so in its own image SEO
 * documentation, and the file name is one of the few signals it has about a
 * picture besides the alt text and the page around it. A name made of random
 * bytes says nothing. `maruti-swift-self-drive-car-rental-nagercoil-9f3a...jpg`
 * says what the picture is, in the words someone would search for.
 *
 * Three rules hold it together:
 *
 * 1. The words come from the site, never from the uploader. A file name that
 *    arrives from a browser can contain path separators, and writing outside
 *    the storage directory is the one thing that must not be possible.
 *
 * 2. The random suffix stays. It is what makes a replaced picture a new
 *    address, which is what lets the reader cache for a year -- and it stops
 *    the addresses being guessable from a vehicle's name.
 *
 * 3. One shape for all three kinds of image, checked by one pattern. The
 *    directory decides which kind it is; the name only has to be safe. The old
 *    shapes -- v12-<hex>, p3-<hex>, bcars-hero-<hex> -- all satisfy it too, so
 *    everything already uploaded keeps working without a migration.
 */

/**
 * The only shape any of the readers will answer for.
 *
 * Lowercase words joined by single hyphens, then sixteen hex characters, then
 * one extension. There is no way to write `..` or a separator in that, which
 * is a far better rule than trying to spot the ways a path can escape a
 * directory.
 */
const IMAGE_NAME_PATTERN = '/^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{16}\.(jpg|png|webp|avif)$/';

/** How much of the name may be words. Long enough to describe, short enough to read. */
const IMAGE_SLUG_MAX = 70;

/**
 * Words to a URL slug: lowercase, hyphen-joined, ASCII only.
 *
 * Accented and non-Latin characters are dropped rather than transliterated.
 * Vehicle names and place names here are written in Latin script already, and
 * a half-right transliteration in a URL is worse than a shorter one -- it
 * reads as a typo to the person who sees it in a search result.
 */
function image_slug(string $words, string $fallback = 'photo'): string
{
    $slug = strtolower($words);
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?? '';
    $slug = trim($slug, '-');

    if (strlen($slug) > IMAGE_SLUG_MAX) {
        $slug = substr($slug, 0, IMAGE_SLUG_MAX);
        // Cut at the last whole word rather than mid-word: "self-drive-car-re"
        // is not a phrase anyone searches for.
        $cut = strrpos($slug, '-');
        if ($cut !== false && $cut > 20) {
            $slug = substr($slug, 0, $cut);
        }
        $slug = trim($slug, '-');
    }

    return $slug === '' ? $fallback : $slug;
}

/**
 * A full stored file name: the words, a random suffix, the extension.
 *
 * Always satisfies IMAGE_NAME_PATTERN, whatever it is handed -- which is what
 * makes it safe to build one from a vehicle name somebody typed.
 */
function image_name(string $words, string $extension, string $fallback = 'photo'): string
{
    return sprintf('%s-%s.%s', image_slug($words, $fallback), bin2hex(random_bytes(8)), $extension);
}

/**
 * Which image was asked for, however it was asked for.
 *
 * Three ways, and all three have to keep working:
 *
 *   /admin/images/self-drive-car-nagercoil-a1b2.webp   the address used now,
 *                                                      rewritten to ?f= by
 *                                                      admin/.htaccess
 *   /admin/brand.php/self-drive-car-nagercoil-a1b2.webp  the same words in the
 *                                                      address with no rewrite
 *                                                      involved, so a server
 *                                                      without mod_rewrite is
 *                                                      one line away rather
 *                                                      than broken
 *   /admin/brand.php?f=bcars-hero-a1b2.webp            everything uploaded
 *                                                      before this change
 *
 * Whatever comes back is matched against IMAGE_NAME_PATTERN before it is used,
 * so none of these is trusted any further than the others.
 */
function image_requested_name(): string
{
    $fromQuery = (string) ($_GET['f'] ?? '');
    if ($fromQuery !== '') {
        return $fromQuery;
    }

    $path = (string) ($_SERVER['PATH_INFO'] ?? '');
    return ltrim($path, '/');
}

/**
 * Sends a stored image, or the 304 that means the browser already has it.
 *
 * Shared by the three readers because there is one right answer here and three
 * copies of it would drift. The caching is the point: these addresses change
 * whenever the picture does, so a year is safe, and a conditional request
 * costs a few hundred bytes instead of a few hundred kilobytes for a visitor
 * coming back to a page.
 */
function image_stream(string $path, string $mime): void
{
    $modified = (int) filemtime($path);
    $size     = (int) filesize($path);
    $etag     = '"' . dechex($modified) . '-' . dechex($size) . '"';

    header('Content-Type: ' . $mime);
    header('Cache-Control: public, max-age=31536000, immutable');
    header('X-Content-Type-Options: nosniff');
    // Nothing here is HTML, and a browser deciding otherwise about a file
    // someone uploaded is the whole problem with serving uploads.
    header('Content-Disposition: inline');
    header('ETag: ' . $etag);
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $modified) . ' GMT');

    $knownEtag = trim((string) ($_SERVER['HTTP_IF_NONE_MATCH'] ?? ''));
    $knownDate = strtotime((string) ($_SERVER['HTTP_IF_MODIFIED_SINCE'] ?? '')) ?: 0;

    if ($knownEtag === $etag || ($knownDate > 0 && $knownDate >= $modified)) {
        http_response_code(304);
        return;
    }

    header('Content-Length: ' . (string) $size);
    readfile($path);
}

/**
 * The same as image_stream, for a file that must not be cached or shared.
 *
 * Booking attachments are private records rather than pictures of cars, so
 * they get no ETag, no long cache and no revalidation dance -- the caller has
 * already sent Cache-Control, and adding a validator here would only invite a
 * store somewhere in the middle to keep a copy.
 */
function image_stream_private(string $path, string $mime): void
{
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . (string) filesize($path));
    header('X-Content-Type-Options: nosniff');
    header('Content-Disposition: inline');

    readfile($path);
}

/** The 404 every reader gives for a name it does not recognise. */
function image_not_found(): never
{
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    exit("Not found\n");
}
