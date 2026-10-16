<?php
declare(strict_types=1);

/**
 * First-run installer.
 *
 * Open this in a browser once the files are on the server. It checks the
 * hosting can run the panel, creates the tables, writes config.php and makes
 * the first Super Admin account.
 *
 * It refuses to do any of that once an account exists, so leaving the file on
 * the server does not hand the next visitor a way to take the panel over.
 * Deleting it afterwards is still the tidier ending, and the last screen says
 * so.
 */

require_once __DIR__ . '/src/db.php';
require_once __DIR__ . '/src/migrate.php';

/**
 * Where a new config.php should be written.
 *
 * It used to be __DIR__ . '/config.php', beside the panel. That is inside the
 * document root, and the document root is rebuilt from scratch on every
 * deploy -- so the installer's own output was erased by the next publish, and
 * the panel came back reporting it had never been set up. It happened, and it
 * took the admin down.
 *
 * config() looks for nitesha-config/config.php in each directory above the
 * panel, so a file one level above the document root is found and is out of
 * reach of anything that rewrites the site. That is where this writes.
 *
 * Beside the panel stays as the fallback for hosting where the parent
 * directory cannot be written, because a panel that works until the next
 * deploy beats a panel that never starts. install_config_path() says which
 * one was used so the last screen can be honest about it.
 */
function install_config_dir_preferred(): string
{
    // __DIR__ is <docroot>/admin, so this is the directory holding the
    // document root -- above everything a deploy replaces.
    return dirname(__DIR__, 2) . '/nitesha-config';
}

function install_config_path(): string
{
    // An existing config wins wherever it is: rewriting a working install's
    // settings into a second file would leave two, and config() would pick
    // whichever it reached first.
    $existing = config_path();
    if ($existing !== null) {
        return $existing;
    }

    $preferred = install_config_dir_preferred();
    if (is_dir($preferred) || @mkdir($preferred, 0750, true) || is_dir($preferred)) {
        if (is_writable($preferred)) {
            return $preferred . '/config.php';
        }
    }

    return __DIR__ . '/config.php';
}
const MIN_PHP        = '8.1';
const MIN_PASSWORD   = 10;

session_start();
if (empty($_SESSION['install_token'])) {
    $_SESSION['install_token'] = bin2hex(random_bytes(32));
}

header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');

$errors = [];
$done   = false;

// ---------------------------------------------------------------------------
// Already installed?
//
// The presence of config.php is not enough — a half-finished attempt leaves
// one behind. What settles it is whether anyone can sign in.
// ---------------------------------------------------------------------------
$existingConfig = config_path();
if ($existingConfig !== null) {
    try {
        $existing = require $existingConfig;
        config_set(is_array($existing) ? $existing : []);
        $n = (int) (fetch_one('SELECT COUNT(*) AS n FROM users')['n'] ?? 0);
        if ($n > 0) {
            render_installed();
            exit;
        }
    } catch (Throwable $e) {
        // No usable database yet; carry on and let the form fix it.
    }
}

$form = [
    'db_host'     => $_POST['db_host']     ?? 'localhost',
    'db_name'     => $_POST['db_name']     ?? '',
    'db_user'     => $_POST['db_user']     ?? '',
    'db_pass'     => $_POST['db_pass']     ?? '',
    'site_origin' => $_POST['site_origin'] ?? 'https://niteshacars.in',
    'admin_name'  => $_POST['admin_name']  ?? '',
    'admin_email' => $_POST['admin_email'] ?? '',
];

$checks = environment_checks();
$canRun = !in_array(false, array_column($checks, 'ok'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals($_SESSION['install_token'], (string) ($_POST['token'] ?? ''))) {
        $errors[] = 'That form had expired. Please try again.';
    } elseif (!$canRun) {
        $errors[] = 'The hosting does not meet the requirements above.';
    } else {
        $errors = install($form);
        $done   = $errors === [];
    }
}

/**
 * Runs the whole installation, or returns what stopped it. Nothing is written
 * until the database details are known to work, so a wrong password costs a
 * correction rather than a half-configured site.
 */
function install(array $form): array
{
    $errors = [];

    foreach (['db_name' => 'Database name', 'db_user' => 'Database user',
              'admin_name' => 'Your name', 'admin_email' => 'Your email'] as $field => $label) {
        if (trim((string) $form[$field]) === '') {
            $errors[] = "$label is required.";
        }
    }
    if (!filter_var($form['admin_email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'That email address does not look right.';
    }

    $password = (string) ($_POST['admin_password'] ?? '');
    if (strlen($password) < MIN_PASSWORD) {
        $errors[] = 'The password must be at least ' . MIN_PASSWORD . ' characters.';
    }
    if ($password !== (string) ($_POST['admin_password2'] ?? '')) {
        $errors[] = 'The two passwords do not match.';
    }
    if ($errors !== []) {
        return $errors;
    }

    $config = build_config($form);
    config_set($config);

    try {
        // Connected directly rather than through db(), which reports a failure
        // to the browser as a bare 500 — right for the panel, useless here.
        db_set(db_connect($config['db']));
    } catch (Throwable $e) {
        error_log('installer could not connect: ' . $e->getMessage());
        return ['Could not connect to the database. Check the name, user and '
              . 'password, and that the user is attached to that database.'];
    }

    try {
        $applied = migrate();
    } catch (Throwable $e) {
        return ['Setting up the tables failed: ' . $e->getMessage()];
    }

    // The config is written before the account, and that order matters.
    //
    // It used to be the other way round, which broke the one case this file is
    // now most often opened for: a database that still holds everything, and a
    // config.php that a deploy erased. create_user() then failed on the
    // duplicate email, returned early, and write_config() never ran -- so the
    // panel stayed dead and the installer sent you round the same loop with no
    // way out. Writing the config first means a problem creating an account is
    // a problem creating an account, not a panel that will not start.
    if (!write_config($config)) {
        return ['The database details work, but config.php could not be written to '
              . h(dirname(install_config_path())) . '. Create it there by hand '
              . 'from config.sample.php, using the details above.'];
    }

    // An account already in this database is the signal that the database is
    // not new -- so this is a reconnection, not an installation, and making a
    // second Super Admin would be wrong.
    $existingUsers = 0;
    try {
        $existingUsers = (int) (fetch_one('SELECT COUNT(*) AS n FROM users')['n'] ?? 0);
    } catch (Throwable $e) {
        // A fresh database that has only just been migrated; treat it as empty.
    }

    if ($existingUsers > 0) {
        $GLOBALS['__applied']  = $applied;
        $GLOBALS['__reconnect'] = true;
        return [];
    }

    try {
        require_once __DIR__ . '/src/audit.php';
        require_once __DIR__ . '/src/auth.php';
        create_user($form['admin_name'], $form['admin_email'], $password, 'super_admin');
    } catch (Throwable $e) {
        return ['The settings were saved, but creating your account failed: '
              . $e->getMessage() . ' If you already have an account in this database, '
              . 'reload this page -- the panel is configured now and should let you '
              . 'sign in with it.'];
    }

    $GLOBALS['__applied'] = $applied;
    return [];
}

/**
 * Did the visitor arrive over HTTPS?
 *
 * Behind a proxy that terminates TLS -- which is how this host works -- PHP
 * sees a plain HTTP request and $_SERVER['HTTPS'] is unset, so asking PHP
 * alone gives the wrong answer for every visitor on the secure site.
 */
function request_is_https(): bool
{
    if ((($_SERVER['HTTPS'] ?? '') !== '') && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }
    if (strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https') {
        return true;
    }
    return strtolower((string) ($_SERVER['REQUEST_SCHEME'] ?? '')) === 'https';
}

function build_config(array $form): array
{
    $origins = array_values(array_filter(array_map(
        'trim',
        preg_split('/[\s,]+/', (string) $form['site_origin']) ?: []
    )));

    return [
        'db' => [
            'host' => trim((string) $form['db_host']) ?: 'localhost',
            'name' => trim((string) $form['db_name']),
            'user' => trim((string) $form['db_user']),
            'password' => (string) $form['db_pass'],
            'charset'  => 'utf8mb4',
        ],
        // Above the document root for the same reason config.php is: anything
        // inside it is temporary, because a deploy rebuilds it.
        'storage_path'       => dirname(__DIR__, 2) . '/nitesha-storage',
        'public_site_origin' => $origins,
        // Hostinger serves these domains over HTTPS, and the session cookie
        // carries the sign-in, so it should never travel in the clear.
        // $_SERVER['HTTPS'] alone is not enough on this host. Hostinger
        // terminates TLS upstream, so PHP can be handed a plain HTTP request
        // for a visitor who arrived over HTTPS -- the site's own .htaccess
        // says exactly this about %{HTTPS} and redirects on X-Forwarded-Proto
        // instead. Getting it wrong here decides whether the session cookie
        // carries the Secure flag, so it is worth reading both.
        'https_only'         => request_is_https(),
        // The panel reads session_idle_minutes. This wrote session_minutes, so
        // the value was ignored and a hardcoded fallback was doing the work --
        // which means changing it here had no effect at all.
        'session_idle_minutes' => 120,
    ];
}

function write_config(array $config): bool
{
    $target = install_config_path();

    $php = "<?php\n\n// Written by install.php. Holds the database password —\n"
         . "// keep it out of version control and off any public URL.\n\n"
         . 'return ' . var_export($config, true) . ";\n";

    $dir = dirname($target);
    if (!is_dir($dir) && !@mkdir($dir, 0750, true) && !is_dir($dir)) {
        return false;
    }

    if (@file_put_contents($target, $php) === false) {
        return false;
    }
    @chmod($target, 0640);

    $GLOBALS['__config_written_to'] = $target;
    return true;
}

function environment_checks(): array
{
    // The directory that matters is the one write_config() will use, which is
    // normally above the document root -- not this one. Checking __DIR__ told
    // people the install would work when the file was going somewhere else
    // entirely.
    $target  = install_config_path();
    $dir     = dirname($target);
    $writable = is_dir($dir) ? is_writable($dir) : is_writable(dirname($dir));
    $aboveRoot = $dir !== __DIR__;
    return [
        ['label' => 'PHP ' . MIN_PHP . ' or newer',
         'ok'    => version_compare(PHP_VERSION, MIN_PHP, '>='),
         'note'  => 'Running PHP ' . PHP_VERSION],
        ['label' => 'MySQL support (pdo_mysql)',
         'ok'    => extension_loaded('pdo_mysql'),
         'note'  => extension_loaded('pdo_mysql') ? 'Available' : 'Enable it in hPanel → PHP Configuration'],
        ['label' => 'JSON support',
         'ok'    => extension_loaded('json'), 'note' => ''],
        ['label' => 'Somewhere to keep config.php',
         'ok'    => $writable,
         'note'  => !$writable
             ? 'You will need to create ' . $dir . '/config.php by hand'
             : ($aboveRoot
                 ? 'Will be written to ' . $dir . ', above the website folder, where a deploy cannot erase it'
                 : 'Will be written beside the panel. A deploy that rebuilds the website folder will erase it')],
        ['label' => 'sql/ files present',
         'ok'    => (glob(__DIR__ . '/sql/*.sql') ?: []) !== [],
         'note'  => 'The table definitions'],
    ];
}

function h(?string $v): string
{
    return htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8');
}

function render_installed(): void
{
    page('Already set up', '
      <p class="install-note">This panel is already installed and has at least one
      account, so the installer will not run again.</p>
      <p class="install-note">If you are locked out, create another account over SSH
      with <code>php tools/create-user.php</code>.</p>
      <p style="margin-top:18px"><a class="btn btn-primary btn-block" href="index.php">Go to sign in</a></p>
      <p class="install-note" style="margin-top:18px">You can safely delete
      <code>install.php</code> from the server.</p>');
}

function page(string $title, string $body): void
{
    echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">'
       . '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
       . '<title>' . h($title) . ' — NiteSha Cars &amp; Bikes Admin</title>'
       . '<meta name="robots" content="noindex, nofollow">'
       . '<link rel="preconnect" href="https://fonts.googleapis.com">'
       . '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">'
       . '<link rel="stylesheet" href="admin.css"></head><body>'
       . '<div class="login-screen"><div class="login-card install-card">'
       . '<div class="login-logo"><span class="logo-mark">'
       . '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5A500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12.5l1.4-4.2A2 2 0 0 1 6.3 7h11.4a2 2 0 0 1 1.9 1.3L21 12.5"/><rect x="2.5" y="12.5" width="19" height="5" rx="1.5"/><circle cx="7" cy="18" r="1.4" fill="#F5A500" stroke="none"/><circle cx="17" cy="18" r="1.4" fill="#F5A500" stroke="none"/></svg>'
       . '</span>NiteSha Cars</div><h1>' . h($title) . '</h1>'
       . $body
       . '</div></div>'
       // Same rule module the panel uses, so the name field here behaves
       // the way the same field does everywhere else.
       . '<script src="input-rules.js"></script>'
       . '</body></html>';
}

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------
if ($done) {
    $applied = $GLOBALS['__applied'] ?? [];
    page('Ready',
      '<p class="install-note">The panel is set up. '
      . (empty($GLOBALS['__reconnect'])
          ? 'Sign in with the account you just made.'
          : 'Your existing data and accounts were already there and were left alone.')
      . '</p>
      <ul class="install-checks">'
      . ($applied === [] ? '' : '<li class="ok">Tables created (' . h(implode(', ', $applied)) . ')</li>')
      . (empty($GLOBALS['__reconnect'])
          ? '<li class="ok">Your Super Admin account was created</li>'
          : '<li class="ok">This database already had accounts in it, so no new one was
             made &mdash; sign in with the one you already use</li>')
      . '<li class="ok">config.php was written to <code>'
      . h((string) ($GLOBALS['__config_written_to'] ?? 'the panel folder')) . '</code></li>'
      . (str_contains((string) ($GLOBALS['__config_written_to'] ?? ''), 'nitesha-config')
          ? ''
          : '<li class="warn">That is inside the website folder. A deploy that rebuilds the
             site will erase it and the panel will report it has never been set up. Move it
             to a folder named <code>nitesha-config</code> above the website folder when you
             can &mdash; the panel looks there first.</li>')
      . '
      </ul>
      <p style="margin-top:18px"><a class="btn btn-primary btn-block" href="index.php">Sign in</a></p>
      <p class="install-note" style="margin-top:18px"><strong>One last step:</strong>
      delete <code>install.php</code> from the server. It will not run again while an
      account exists, but there is no reason to leave it there.</p>');
    exit;
}

ob_start();
?>
<p class="install-note">This sets up the admin panel: it creates the tables and
your first account. It runs once.</p>

<ul class="install-checks">
  <?php foreach ($checks as $check): ?>
    <li class="<?= $check['ok'] ? 'ok' : 'no' ?>">
      <?= h($check['label']) ?>
      <?php if ($check['note'] !== ''): ?><span><?= h($check['note']) ?></span><?php endif; ?>
    </li>
  <?php endforeach; ?>
</ul>

<?php if ($errors !== []): ?>
  <div class="install-errors">
    <?php foreach ($errors as $error): ?><p><?= h($error) ?></p><?php endforeach; ?>
  </div>
<?php endif; ?>

<form method="post" autocomplete="off">
  <input type="hidden" name="token" value="<?= h($_SESSION['install_token']) ?>">

  <h2 class="install-heading">Database</h2>
  <p class="install-note">Create a database and user in hPanel first, then put
  the same details here.</p>

  <label for="db_host">Host</label>
  <input type="text" id="db_host" name="db_host" value="<?= h($form['db_host']) ?>" required>

  <label for="db_name">Database name</label>
  <input type="text" id="db_name" name="db_name" value="<?= h($form['db_name']) ?>" required>

  <label for="db_user">Database user</label>
  <input type="text" id="db_user" name="db_user" value="<?= h($form['db_user']) ?>" required>

  <label for="db_pass">Database password</label>
  <input type="password" id="db_pass" name="db_pass" value="<?= h($form['db_pass']) ?>">

  <h2 class="install-heading">Your website</h2>
  <p class="install-note">The address the enquiry form posts from. Separate more
  than one with a space.</p>

  <label for="site_origin">Website address</label>
  <input type="text" id="site_origin" name="site_origin" value="<?= h($form['site_origin']) ?>">

  <h2 class="install-heading">Your account</h2>
  <p class="install-note">This is the Super Admin — the account that can create
  the others.</p>

  <label for="admin_name">Your name</label>
  <input type="text" id="admin_name" name="admin_name" value="<?= h($form['admin_name']) ?>" data-rule="name" required>

  <label for="admin_email">Email</label>
  <input type="email" id="admin_email" name="admin_email" value="<?= h($form['admin_email']) ?>" required>

  <label for="admin_password">Password</label>
  <input type="password" id="admin_password" name="admin_password" required
         minlength="<?= MIN_PASSWORD ?>" autocomplete="new-password">

  <label for="admin_password2">Password again</label>
  <input type="password" id="admin_password2" name="admin_password2" required
         autocomplete="new-password">

  <button type="submit" class="btn btn-primary btn-block" style="margin-top:18px">Set up the panel</button>
</form>
<?php
page('Set up', (string) ob_get_clean());
