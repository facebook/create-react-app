<?php
declare(strict_types=1);

/**
 * Sets a new password for an existing admin account.
 *
 * Two ways to run it:
 *
 *   SSH        php tools/reset-password.php
 *              Reaching a shell already proves you hold the server, so the
 *              token below is not required and nothing is asked twice.
 *
 *   Browser    Edit RESET_TOKEN, upload, open it, delete it.
 *              For hosting with no SSH. Read the guards before relying on it.
 *
 * A password reset page left reachable on a live server is how panels get
 * taken over, so the browser path refuses to do anything unless all of the
 * following hold. Each one is here because without it the file becomes a
 * back door rather than a tool:
 *
 *   - RESET_TOKEN has been changed from the placeholder and is long enough
 *     to be worth guessing at. Shipped as-is, the file is inert.
 *   - The token arrives by POST, never in the URL, so it does not end up in
 *     the server's access log or a browser's history.
 *   - The connection is HTTPS, or the token and the new password would cross
 *     the network in clear.
 *   - The file was uploaded within the last WINDOW_MINUTES. Forgetting to
 *     delete it is the likely mistake, so the window closes by itself; a
 *     fresh upload re-opens it.
 *   - Wrong tokens are counted and the page stops answering after a handful,
 *     so the token cannot be worked out by trying.
 *
 * On success it deletes itself. If that fails, it says so in red and you
 * should remove it by hand.
 */

// -- Edit this ---------------------------------------------------------------
// Replace with a long random string. Something like:
//   php -r "echo bin2hex(random_bytes(24));"
const RESET_TOKEN = 'CHANGE-ME-BEFORE-UPLOADING';

// How long after upload the browser path stays usable.
const WINDOW_MINUTES = 60;
// ----------------------------------------------------------------------------

const PLACEHOLDER_TOKEN = 'CHANGE-ME-BEFORE-UPLOADING';
const MIN_TOKEN_LENGTH  = 24;
const MIN_PASSWORD      = 10;
const MAX_TOKEN_TRIES   = 5;

require_once __DIR__ . '/../src/db.php';
require_once __DIR__ . '/../src/audit.php';
require_once __DIR__ . '/../src/auth.php';

/**
 * Applies the new password.
 *
 * Clearing failed_logins and locked_until matters: someone resetting a
 * password has usually been failing to sign in, and the lockout outlives the
 * old password. Without this they would set a new one and still be refused,
 * with nothing on screen explaining why.
 *
 * is_active is deliberately left alone. An account switched off was switched
 * off on purpose, and a password reset is not the place to quietly undo that
 * -- but the caller is told, so the reason for a later refusal is not a
 * mystery.
 */
function reset_password(string $email, string $password): array
{
    $email = strtolower(trim($email));

    if (strlen($password) < MIN_PASSWORD) {
        throw new InvalidArgumentException(
            'Password must be at least ' . MIN_PASSWORD . ' characters.'
        );
    }

    $user = fetch_one(
        'SELECT id, name, email, is_active FROM users WHERE email = ?',
        [$email]
    );
    if ($user === null) {
        throw new RuntimeException("No account with that email: {$email}");
    }

    query(
        'UPDATE users
            SET password_hash = ?, failed_logins = 0, locked_until = NULL
          WHERE id = ?',
        [password_hash($password, PASSWORD_DEFAULT), $user['id']]
    );

    audit_log(
        'password_reset', 'auth', 'user', (int) $user['id'],
        null, null,
        'Reset with tools/reset-password.php',
        (int) $user['id'], (string) $user['name']
    );

    return $user;
}

// ---------------------------------------------------------------------------
// Command line
// ---------------------------------------------------------------------------
if (PHP_SAPI === 'cli') {
    $ask = function (string $prompt, bool $hidden = false): string {
        echo $prompt;
        if ($hidden && DIRECTORY_SEPARATOR !== '\\') {
            shell_exec('stty -echo 2>/dev/null');
            $value = trim((string) fgets(STDIN));
            shell_exec('stty echo 2>/dev/null');
            echo "\n";
            return $value;
        }
        return trim((string) fgets(STDIN));
    };

    echo "\nReset a NiteSha admin password\n------------------------------\n";

    $users = fetch_all('SELECT email, is_active FROM users ORDER BY id');
    if ($users === []) {
        exit("There are no accounts yet. Run tools/create-user.php instead.\n");
    }
    echo "\nAccounts:\n";
    foreach ($users as $u) {
        echo '  ' . $u['email'] . ($u['is_active'] ? '' : '   (disabled)') . "\n";
    }

    $email    = $ask("\nEmail: ");
    $password = $ask('New password (min ' . MIN_PASSWORD . ' characters): ', true);
    $confirm  = $ask('Confirm password: ', true);

    if ($password !== $confirm) {
        exit("\nPasswords do not match. Nothing was changed.\n");
    }

    try {
        $user = reset_password($email, $password);
        echo "\nPassword updated for {$user['email']}.\n";
        echo "Any lockout has been cleared.\n";
        if (!$user['is_active']) {
            echo "Note: this account is disabled, so it still cannot sign in.\n";
        }
        echo "\n";
    } catch (Throwable $e) {
        exit("\n{$e->getMessage()}\n");
    }
    exit;
}

// ---------------------------------------------------------------------------
// Browser
// ---------------------------------------------------------------------------
header('X-Robots-Tag: noindex, nofollow');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store');

session_start();

/** Refuses with a bare page. Nothing here should hint at what is behind it. */
function refuse(string $why, int $status = 403): never
{
    http_response_code($status);
    echo '<!doctype html><meta charset="utf-8"><title>Not available</title>'
       . '<p style="font:15px system-ui;margin:3rem auto;max-width:34rem">'
       . htmlspecialchars($why, ENT_QUOTES) . '</p>';
    exit;
}

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

if (RESET_TOKEN === PLACEHOLDER_TOKEN || strlen(RESET_TOKEN) < MIN_TOKEN_LENGTH) {
    refuse(
        'This file is inert. Open it in an editor, set RESET_TOKEN to a long '
        . 'random string of at least ' . MIN_TOKEN_LENGTH . ' characters, and upload it again.'
    );
}

if (!$isHttps) {
    refuse('Open this over https:// — over http:// the token and the new password would travel in clear.');
}

$ageMinutes = (time() - (int) filemtime(__FILE__)) / 60;
if ($ageMinutes > WINDOW_MINUTES) {
    refuse(
        'This file expired ' . (int) ($ageMinutes - WINDOW_MINUTES) . ' minutes ago. '
        . 'Delete it, or upload it again to reopen the window.'
    );
}

$_SESSION['reset_tries'] ??= 0;
if ($_SESSION['reset_tries'] >= MAX_TOKEN_TRIES) {
    refuse('Too many attempts. Delete this file and upload it again to start over.', 429);
}

$errors = [];
$done   = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // hash_equals compares in constant time, so the token cannot be recovered
    // by measuring how long a wrong guess takes to be rejected.
    if (!hash_equals(RESET_TOKEN, (string) ($_POST['token'] ?? ''))) {
        $_SESSION['reset_tries']++;
        sleep(1);
        $errors[] = 'That token is not right.';
    } else {
        $_SESSION['reset_tries'] = 0;
        $password = (string) ($_POST['password'] ?? '');

        if ($password !== (string) ($_POST['password2'] ?? '')) {
            $errors[] = 'The two passwords do not match.';
        } else {
            try {
                $done = reset_password((string) ($_POST['email'] ?? ''), $password);
            } catch (Throwable $e) {
                $errors[] = $e->getMessage();
            }
        }
    }
}

$selfDeleted = false;
if ($done !== null) {
    $selfDeleted = @unlink(__FILE__);
}

$h = fn(string $s): string => htmlspecialchars($s, ENT_QUOTES);
?>
<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Reset an admin password</title>
<style>
  body { font: 15px/1.6 system-ui, sans-serif; max-width: 34rem; margin: 3rem auto; padding: 0 1rem; color: #12172b; }
  h1 { font-size: 1.35rem; }
  label { display: block; margin: 1rem 0 .3rem; font-weight: 600; }
  input { width: 100%; padding: .6rem .7rem; border: 1px solid #c9cbd6; border-radius: 8px; font-size: 1rem; }
  button { margin-top: 1.5rem; padding: .7rem 1.3rem; border: 0; border-radius: 8px; background: #12172b; color: #fff; font-size: 1rem; font-weight: 600; cursor: pointer; }
  .bad { background: #fdeaea; border-left: 3px solid #c0392b; padding: .7rem .9rem; margin: 1rem 0; }
  .ok { background: #eaf7ee; border-left: 3px solid #1e8e3e; padding: .7rem .9rem; margin: 1rem 0; }
  .warn { background: #fff6e5; border-left: 3px solid #c47f00; padding: .7rem .9rem; margin: 1rem 0; }
  .note { color: #5a6072; font-size: .9rem; }
</style>

<?php if ($done !== null): ?>
  <h1>Password updated</h1>
  <div class="ok">
    <strong><?= $h((string) $done['email']) ?></strong> has a new password.
    Any lockout from failed sign-ins has been cleared.
  </div>

  <?php if (!$done['is_active']): ?>
    <div class="warn">
      This account is marked disabled, so it still will not sign in. Re-enable it
      in the panel, or reset a different account.
    </div>
  <?php endif; ?>

  <?php if ($selfDeleted): ?>
    <div class="ok">This file has deleted itself. Nothing further to do.</div>
  <?php else: ?>
    <div class="bad">
      <strong>This file could not delete itself.</strong> Remove
      <code>tools/reset-password.php</code> from the server now — while it is
      there, anyone holding the token can change a password.
    </div>
  <?php endif; ?>

  <p><a href="../index.php">Go to the sign-in page</a></p>

<?php else: ?>
  <h1>Reset an admin password</h1>
  <p class="note">
    Expires <?= (int) max(0, WINDOW_MINUTES - $ageMinutes) ?> minutes from now.
    Delete this file once you are done.
  </p>

  <?php foreach ($errors as $e): ?>
    <div class="bad"><?= $h($e) ?></div>
  <?php endforeach; ?>

  <form method="post" autocomplete="off">
    <label for="token">Reset token</label>
    <input type="password" id="token" name="token" required autocomplete="off">

    <label for="email">Account email</label>
    <input type="email" id="email" name="email" required autocomplete="off"
           value="<?= $h((string) ($_POST['email'] ?? '')) ?>">

    <label for="password">New password</label>
    <input type="password" id="password" name="password" required
           minlength="<?= MIN_PASSWORD ?>" autocomplete="new-password">

    <label for="password2">Confirm new password</label>
    <input type="password" id="password2" name="password2" required
           minlength="<?= MIN_PASSWORD ?>" autocomplete="new-password">

    <button type="submit">Set the new password</button>
  </form>
<?php endif; ?>
