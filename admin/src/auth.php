<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/audit.php';
require_once __DIR__ . '/abilities.php';

/**
 * Authentication and role checks.
 *
 * Passwords are stored as password_hash() digests — the plaintext is never
 * written anywhere, and a stolen database does not hand over anyone's
 * password. Repeated failures lock the account for a while, so an attacker
 * cannot simply try passwords until one works.
 */

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_MINUTES = 15;

function session_start_secure(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    // Command-line tools and tests have no cookies to configure; PHP emits
    // warnings if we try, and session files are pointless there.
    if (PHP_SAPI === 'cli') {
        if (session_status() === PHP_SESSION_NONE) {
            $_SESSION ??= [];
        }
        return;
    }

    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => (bool) config('https_only'),
        'httponly' => true,   // JavaScript cannot read the cookie, so an XSS
                              // bug cannot simply steal the session.
        'samesite' => 'Lax',  // Not sent on cross-site POSTs.
    ]);
    session_name('nitesha_admin');
    session_start();

    // Expire idle sessions rather than letting an unattended browser stay
    // logged in indefinitely.
    $idleLimit = ((int) (config('session_idle_minutes') ?? 120)) * 60;
    if (isset($_SESSION['last_seen']) && (time() - (int) $_SESSION['last_seen']) > $idleLimit) {
        logout(false);
        session_start();
    }
    $_SESSION['last_seen'] = time();
}

/**
 * @return array{ok:bool, error?:string, user?:array}
 */
function attempt_login(string $email, string $password): array
{
    $email = trim(strtolower($email));

    $user = fetch_one(
        'SELECT u.*, r.slug AS role_slug, r.name AS role_name
           FROM users u JOIN roles r ON r.id = u.role_id
          WHERE u.email = ?',
        [$email]
    );

    // Always spend roughly the same time whether or not the account exists,
    // so response timing cannot be used to discover valid email addresses.
    if ($user === null) {
        password_verify($password, '$2y$12$usesomesillystringfor.thisdummyhashvalue0000000000000000');
        return ['ok' => false, 'error' => 'Incorrect email or password.'];
    }

    if ((int) $user['is_active'] !== 1) {
        return ['ok' => false, 'error' => 'This account is disabled.'];
    }

    if ($user['locked_until'] !== null && strtotime((string) $user['locked_until']) > time()) {
        $minutes = (int) ceil((strtotime((string) $user['locked_until']) - time()) / 60);
        return ['ok' => false, 'error' => "Too many failed attempts. Try again in {$minutes} minute(s)."];
    }

    if (!password_verify($password, (string) $user['password_hash'])) {
        $attempts = ((int) $user['failed_logins']) + 1;
        $lockUntil = $attempts >= LOGIN_MAX_ATTEMPTS
            ? date('Y-m-d H:i:s', time() + LOGIN_LOCK_MINUTES * 60)
            : null;

        query(
            'UPDATE users SET failed_logins = ?, locked_until = ? WHERE id = ?',
            [$attempts, $lockUntil, $user['id']]
        );
        audit_log('login_failed', 'auth', 'user', (int) $user['id'], null, null,
            $lockUntil !== null ? 'Account locked after repeated failures' : null,
            (int) $user['id'], $user['email']);

        return ['ok' => false, 'error' => 'Incorrect email or password.'];
    }

    // Re-hash if PHP's default cost or algorithm has moved on since signup.
    if (password_needs_rehash((string) $user['password_hash'], PASSWORD_DEFAULT)) {
        query('UPDATE users SET password_hash = ? WHERE id = ?',
            [password_hash($password, PASSWORD_DEFAULT), $user['id']]);
    }

    query(
        'UPDATE users SET failed_logins = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?',
        [$user['id']]
    );

    session_start_secure();
    // A brand-new session id at the moment privilege changes, so a session id
    // captured before login cannot be reused after it.
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_regenerate_id(true);
    }

    $_SESSION['user_id']   = (int) $user['id'];
    $_SESSION['role']      = $user['role_slug'];
    $_SESSION['name']      = $user['name'];
    $_SESSION['last_seen'] = time();

    audit_log('login', 'auth', 'user', (int) $user['id'], null, null, null,
        (int) $user['id'], $user['email']);

    unset($user['password_hash']);
    return ['ok' => true, 'user' => $user];
}

function logout(bool $writeAudit = true): void
{
    session_start_secure();

    if ($writeAudit && isset($_SESSION['user_id'])) {
        audit_log('logout', 'auth', 'user', (int) $_SESSION['user_id'], null, null, null,
            (int) $_SESSION['user_id'], $_SESSION['name'] ?? null);
    }

    $_SESSION = [];
    if (session_status() !== PHP_SESSION_ACTIVE) {
        return; // CLI: nothing further to tear down.
    }
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

function current_user(): ?array
{
    session_start_secure();
    if (empty($_SESSION['user_id'])) {
        return null;
    }

    $user = fetch_one(
        'SELECT u.id, u.name, u.email, u.is_active, r.slug AS role_slug, r.name AS role_name
           FROM users u JOIN roles r ON r.id = u.role_id
          WHERE u.id = ?',
        [(int) $_SESSION['user_id']]
    );

    // A user disabled mid-session loses access on their next request, rather
    // than staying in until the cookie happens to expire.
    if ($user === null || (int) $user['is_active'] !== 1) {
        logout(false);
        return null;
    }

    return $user;
}

function require_login(): array
{
    $user = current_user();
    if ($user === null) {
        if (str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')) {
            http_response_code(401);
            header('Content-Type: application/json');
            exit(json_encode(['error' => 'Not signed in']));
        }
        header('Location: index.php');
        exit;
    }
    return $user;
}

/**
 * Who may do what is in src/abilities.php now -- role_can() and the map it
 * reads moved there to sit beside the catalogue of permissions and the
 * per-person exceptions, which are the other two thirds of the same answer.
 * This file is about proving who somebody is; that one is about what follows
 * from it.
 */

function user_can(string $ability): bool
{
    $user = current_user();
    return $user !== null && user_allows($user, $ability);
}

function require_can(string $ability): array
{
    $user = require_login();
    if (!user_allows($user, $ability)) {
        audit_log('permission_denied', 'auth', null, null, null, null, $ability,
            (int) $user['id'], $user['email']);
        http_response_code(403);
        if (str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')) {
            header('Content-Type: application/json');
            exit(json_encode(['error' => 'Not permitted']));
        }
        exit('Not permitted.');
    }
    return $user;
}

function create_user(string $name, string $email, string $password, string $roleSlug): int
{
    $role = fetch_one('SELECT id FROM roles WHERE slug = ?', [$roleSlug]);
    if ($role === null) {
        throw new InvalidArgumentException("Unknown role: {$roleSlug}");
    }
    if (strlen($password) < 10) {
        throw new InvalidArgumentException('Password must be at least 10 characters.');
    }

    query(
        'INSERT INTO users (role_id, name, email, password_hash) VALUES (?, ?, ?, ?)',
        [$role['id'], $name, strtolower(trim($email)), password_hash($password, PASSWORD_DEFAULT)]
    );
    return last_insert_id();
}
