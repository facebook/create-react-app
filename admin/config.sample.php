<?php
// Copy this file to config.php and fill in the real values.
//
// config.php is git-ignored and must never be committed — it holds the
// database password. On the server, keep it readable only by the web user
// (chmod 640).

return [
    'db' => [
        'host'     => 'localhost',
        'name'     => 'CHANGE_ME_database',
        'user'     => 'CHANGE_ME_user',
        'password' => 'CHANGE_ME_password',
        'charset'  => 'utf8mb4',
    ],

    // Where uploaded receipts and photos are written. Keep this OUTSIDE the
    // web root so documents cannot be fetched by guessing a URL — they are
    // served through a PHP endpoint that checks the session first.
    'storage_path' => __DIR__ . '/../nitesha-storage',

    // The site allowed to post to the public enquiry endpoint. Browsers are
    // told only these origins may call it, so another site cannot post
    // through a visitor's browser. Leave empty to allow same-origin only.
    // Include the scheme and no trailing slash. A list is accepted, which is
    // usually needed: a site answers on both the bare name and www, and a
    // staging copy posts from its own subdomain.
    'public_site_origin' => [
        'https://niteshacars.in',
        'https://www.niteshacars.in',
    ],

    // Set true once the subdomain has HTTPS, so the session cookie is only
    // ever sent over an encrypted connection.
    'https_only' => false,

    // Minutes of inactivity before a session is treated as expired.
    'session_idle_minutes' => 120,
];
