<?php
declare(strict_types=1);

require_once __DIR__ . '/src/csrf.php';
require_once __DIR__ . '/src/assets.php';

// Only ever via POST with a token: a plain GET /logout.php could be triggered
// by an <img> tag on another site and sign the admin out unexpectedly.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    logout();
}

panel_redirect('index.php');
