<?php
declare(strict_types=1);

/**
 * Why the sign-in page says "Session expired".
 *
 * That message means the CSRF check failed, and the CSRF check fails when the
 * token stored in the session on one request is not there on the next. Which
 * is almost never about tokens: it is the session itself not surviving between
 * the page loading and the form being submitted. From the outside those look
 * identical, and there are four quite different reasons for it.
 *
 * So this does exactly what signing in does -- puts a token in the session,
 * renders it in a form, and checks it when the form comes back -- and reports
 * what actually happened, with the settings that decide it.
 *
 * It changes nothing and reads no credentials. It does print server paths and
 * cookie settings, which are not secrets but are nobody's business either, so
 * delete it once the panel works. It is the same bargain as install.php.
 */

require_once __DIR__ . '/src/csrf.php';

header('X-Robots-Tag: noindex, nofollow');
header('X-Frame-Options: DENY');
header('Content-Type: text/html; charset=utf-8');

$cookieName = 'nitesha_admin';
$sentCookie = isset($_COOKIE[$cookieName]);

session_start_secure();

$posted   = $_SERVER['REQUEST_METHOD'] === 'POST';
$expected = $_SESSION['check_token'] ?? '';
$given    = (string) ($_POST['check_token'] ?? '');

// The one combination that silently eats every session: a cookie the browser
// is told to keep only for HTTPS, handed out over HTTP. Worked out before the
// verdict, because it outranks it -- browsers exempt localhost from the Secure
// rule, so a test on a local copy can round-trip happily while the same
// settings lose every session on a real domain. A page that reports success
// and names a fault in the same breath is worse than one that reports neither.
$cookieTrap = false;

$verdict = null;
if ($posted) {
    if ($expected === '') {
        $verdict = ['bad', 'The session was empty when the form came back.',
            'The token was stored, the browser was told to keep a cookie, and on this '
            . 'request there was no session to read it from. That is the same failure as '
            . '"Session expired" on the sign-in page, so whatever is below is the cause.'];
    } elseif (hash_equals($expected, $given)) {
        $verdict = ['ok', 'The session survived the round trip.',
            'Sessions are working, so "Session expired" on the sign-in page is not what '
            . 'it says. Try signing in again -- if it still fails, the password is being '
            . 'rejected rather than the session, and the panel would say so.'];
    } else {
        $verdict = ['bad', 'A session came back, but holding a different token.',
            'Two sessions are in play -- usually the page and the form being on different '
            . 'addresses, such as one with www and one without.'];
    }
}

// A fresh token every time, so a reload is always a real test rather than a
// replay of the last one.
$_SESSION['check_token'] = bin2hex(random_bytes(16));

$params   = session_get_cookie_params();
$savePath = session_save_path() ?: sys_get_temp_dir();

/** Did the visitor arrive over HTTPS, as opposed to what PHP was handed? */
$phpHttps  = (($_SERVER['HTTPS'] ?? '') !== '') && $_SERVER['HTTPS'] !== 'off';
$forwarded = strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''));
$browserHttps = $phpHttps || $forwarded === 'https';

$cookieTrap = ((bool) $params['secure']) && !$browserHttps;

if ($cookieTrap) {
    // Overrides whatever the round trip appeared to show. On a real domain
    // this configuration loses every session; if the test just passed, it
    // passed because of a local exemption and not because this works.
    $verdict = ['bad', 'The session cookie cannot come back over this connection.',
        'The cookie is marked Secure and this page is not on HTTPS, so the browser '
        . 'takes it and then refuses to send it again. That is what "Session expired" '
        . 'is reporting.'];
}

$rows = [
    ['The browser sent a session cookie', $sentCookie,
        $sentCookie ? 'Yes' : 'No — either this is the first visit, or the browser is refusing to keep it'],
    ['Session storage is writable', is_writable($savePath),
        $savePath . (is_writable($savePath) ? '' : ' — PHP cannot save sessions here, so nothing persists')],
    ['Cookie marked Secure', (bool) $params['secure'],
        $params['secure']
            ? 'Yes — the browser will only send it over HTTPS'
            : 'No — it will be sent over plain HTTP too'],
    ['Visitor is on HTTPS', $browserHttps,
        $browserHttps ? 'Yes' : 'No'],
];

$e = static fn (?string $v): string => htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8');
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Session check</title>
<style>
  body{margin:0;padding:28px 16px;background:#FAF7F2;color:#1A2233;
       font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  main{max-width:680px;margin:0 auto}
  h1{font-size:1.35rem;margin:0 0 4px}
  .sub{color:#5C5348;margin:0 0 20px}
  .card{background:#fff;border:1px solid #E7E0D6;border-radius:14px;padding:18px;margin-bottom:14px}
  .verdict{font-weight:700;margin:0 0 6px}
  .ok{color:#2F6B4F}.bad{color:#B3261E}
  table{border-collapse:collapse;width:100%;margin-top:6px;font-size:.92rem}
  td{padding:7px 4px;border-bottom:1px solid #E7E0D6;vertical-align:top}
  td:first-child{width:46%}
  .mark{font-weight:800;width:22px}
  .note{color:#5C5348;font-size:.88rem}
  code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.82rem;
       background:#FAF7F2;padding:2px 5px;border-radius:5px;word-break:break-all}
  button{background:#E8A317;color:#1A2233;border:0;font:inherit;font-weight:700;
         padding:11px 20px;border-radius:10px;cursor:pointer}
  .trap{background:#FFF4E0;border:1px solid #E8A317;border-radius:10px;padding:12px;margin-top:12px}
</style>
</head>
<body>
<main>
  <h1>Session check</h1>
  <p class="sub">Does a session survive from one request to the next? That is all "Session expired" is about.</p>

<?php if ($verdict !== null): ?>
  <div class="card">
    <p class="verdict <?= $verdict[0] === 'ok' ? 'ok' : 'bad' ?>"><?= $e($verdict[1]) ?></p>
    <p class="note"><?= $e($verdict[2]) ?></p>
  </div>
<?php endif; ?>

  <div class="card">
    <form method="post">
      <input type="hidden" name="check_token" value="<?= $e($_SESSION['check_token']) ?>">
      <p style="margin:0 0 12px">Press this. It stores a token in the session and checks it comes back — exactly what signing in does.</p>
      <button type="submit">Run the test</button>
    </form>
  </div>

  <div class="card">
    <table>
<?php foreach ($rows as [$label, $ok, $detail]): ?>
      <tr>
        <td class="mark <?= $ok ? 'ok' : 'bad' ?>"><?= $ok ? '&check;' : '&times;' ?></td>
        <td><?= $e($label) ?></td>
        <td class="note"><?= $e($detail) ?></td>
      </tr>
<?php endforeach; ?>
    </table>

<?php if ($cookieTrap): ?>
    <div class="trap">
      <strong>This is the fault.</strong> The session cookie is marked Secure, but this page
      was not served over HTTPS — so the browser accepts the cookie and then refuses to send
      it back, and every session is lost the instant it is created. Reach the panel over
      <code>https://</code>, or set <code>'https_only' =&gt; false</code> in config.php.
    </div>
<?php endif; ?>
  </div>

  <div class="card note">
    <p style="margin:0 0 8px"><strong>What the server says:</strong></p>
    <p style="margin:0 0 4px">Session name: <code><?= $e(session_name()) ?></code>,
       path <code><?= $e($params['path']) ?></code>,
       SameSite <code><?= $e($params['samesite'] ?: 'not set') ?></code></p>
    <p style="margin:0 0 4px"><code>$_SERVER['HTTPS']</code>: <code><?= $e(($_SERVER['HTTPS'] ?? '') === '' ? 'not set' : $_SERVER['HTTPS']) ?></code></p>
    <p style="margin:0 0 4px"><code>X-Forwarded-Proto</code>: <code><?= $e($forwarded === '' ? 'not set' : $forwarded) ?></code></p>
    <p style="margin:0 0 4px"><code>https_only</code> in config.php: <code><?= config('https_only') ? 'true' : 'false' ?></code></p>
    <p style="margin:0">Address in use: <code><?= $e(($_SERVER['HTTP_HOST'] ?? '') . ($_SERVER['REQUEST_URI'] ?? '')) ?></code></p>
  </div>

  <p class="note">Delete this file once the panel works.</p>
</main>
</body>
</html>
