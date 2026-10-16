<?php
declare(strict_types=1);

require_once __DIR__ . '/src/csrf.php';
require_once __DIR__ . '/src/assets.php';

// Already signed in — go straight through.
if (current_user() !== null) {
    panel_redirect('dashboard.php');
}

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();

    $result = attempt_login(
        (string) ($_POST['email'] ?? ''),
        (string) ($_POST['password'] ?? '')
    );

    if ($result['ok']) {
        panel_redirect('dashboard.php');
    }
    $error = $result['error'] ?? 'Sign in failed.';
}

// A fresh install has no accounts yet; say so rather than letting someone
// guess at credentials that do not exist.
$hasUsers = (int) (fetch_one('SELECT COUNT(*) AS n FROM users')['n'] ?? 0) > 0;

// Clickjacking and MIME-sniffing protections for the login page itself.
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in — NiteSha Cars &amp; Bikes Admin</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= asset('admin.css') ?>">
</head>
<body>

<div class="login-screen">
  <div class="login-card">
    <div class="login-logo">
      <img class="brand-mark" src="<?= asset('nitesha-cars-and-bikes-emblem.webp') ?>"
           alt="" aria-hidden="true" width="72" height="31" decoding="async">
      NiteSha Cars &amp; Bikes
    </div>

    <h1>Admin Sign In</h1>

    <?php if (!$hasUsers): ?>
      <p class="login-note">
        No accounts exist yet. On the server, run<br>
        <code>php tools/create-user.php</code><br>
        to create the first Super Admin.
      </p>
    <?php else: ?>
      <p class="login-note">Signed-in sessions end after a period of inactivity.</p>
    <?php endif; ?>

    <form method="post" autocomplete="on">
      <?= csrf_field() ?>

      <label for="email">Email</label>
      <input type="email" id="email" name="email" required autocomplete="username"
             value="<?= e($_POST['email'] ?? '') ?>" autofocus>

      <label for="password">Password</label>
      <input type="password" id="password" name="password" required autocomplete="current-password">

      <p class="login-error"><?= e($error) ?></p>

      <button type="submit" class="btn btn-primary btn-block">Sign In</button>
    </form>
  </div>
</div>

</body>
</html>
