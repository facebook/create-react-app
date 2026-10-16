<?php
declare(strict_types=1);

/**
 * URLs for the panel's own stylesheet and scripts.
 *
 * admin.js and admin.css have fixed names, unlike the site's build output
 * which carries a content hash in the filename. The document root caches every
 * .js and .css for a year as immutable -- correct for hashed files, fatal for
 * these: a browser that loaded the panel once would never fetch them again, so
 * a change reached nobody who had ever used it, with no error and nothing to
 * notice.
 *
 * admin/.htaccess now overrides that header, but only for browsers that ask,
 * and one already holding the file will not ask until next year. The
 * modification time in the query string is what actually breaks that: a
 * changed file is a different URL, so the cached copy cannot match.
 *
 * Its own file rather than http.php, which is the JSON endpoints' plumbing and
 * is not loaded by any page that renders HTML. Putting it there defined it
 * exactly where it was never called from.
 */

function asset(string $file): string
{
    $path = __DIR__ . '/../' . $file;
    $stamp = is_file($path) ? (string) filemtime($path) : '0';
    return $file . '?v=' . $stamp;
}

/**
 * Sends the browser to another page of the panel, by a path from the site
 * root rather than a relative one.
 *
 * "Location: dashboard.php" is read against the address that was asked for.
 * Ask for /site-images/logo.webp on a server that has not been told what that
 * means, and the panel answers with this redirect, which the browser resolves
 * to /site-images/dashboard.php -- another address the server does not know,
 * answered with the same redirect, for as long as the browser will follow it.
 *
 * SCRIPT_NAME is the panel's own file, so its directory is the panel's root
 * whether it is served from a subdomain or from /admin.
 */
function panel_redirect(string $page): never
{
    $dir = str_replace('\\', '/', dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '/index.php')));
    $base = $dir === '/' || $dir === '.' ? '' : rtrim($dir, '/');
    header('Location: ' . $base . '/' . ltrim($page, '/'));
    exit;
}
