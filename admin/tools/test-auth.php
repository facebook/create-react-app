<?php
declare(strict_types=1);

/**
 * Exercises the auth and audit layer against a real MySQL/MariaDB database.
 *
 * Usage: php tools/test-auth.php "mysql:unix_socket=/tmp/mysql.sock;dbname=nitesha_test" root ""
 *
 * Creates and removes its own test users; it does not touch anything else.
 */

$dsn  = $argv[1] ?? null;
$user = $argv[2] ?? 'root';
$pass = $argv[3] ?? '';

if ($dsn === null) {
    fwrite(STDERR, "Usage: php tools/test-auth.php <dsn> [user] [password]\n");
    exit(2);
}

require_once __DIR__ . '/../src/db.php';
config_set(['https_only' => false, 'session_idle_minutes' => 120]);
db_set(new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
]));

require_once __DIR__ . '/../src/audit.php';
require_once __DIR__ . '/../src/auth.php';

$pass_count = 0;
$fail_count = 0;

function check(string $label, bool $ok, string $detail = ''): void
{
    global $pass_count, $fail_count;
    if ($ok) {
        $pass_count++;
        echo "  ok    {$label}\n";
    } else {
        $fail_count++;
        echo "  FAIL  {$label}" . ($detail !== '' ? " — {$detail}" : '') . "\n";
    }
}

// Clean slate for the accounts this script owns.
query("DELETE FROM audit_logs WHERE user_label LIKE 'authtest%' OR user_id IN (SELECT id FROM users WHERE email LIKE 'authtest%')");
query("DELETE FROM users WHERE email LIKE 'authtest%'");

echo "\n-- password storage --\n";
$id = create_user('Auth Test', 'authtest@example.com', 'correct-horse-battery', 'admin');
$row = fetch_one('SELECT password_hash FROM users WHERE id = ?', [$id]);
check('password is not stored in plaintext', !str_contains((string) $row['password_hash'], 'correct-horse-battery'));
check('hash verifies', password_verify('correct-horse-battery', (string) $row['password_hash']));
check('hash uses a real algorithm', str_starts_with((string) $row['password_hash'], '$2y$')
    || str_starts_with((string) $row['password_hash'], '$argon'));

try {
    create_user('Weak', 'authtest-weak@example.com', 'short', 'admin');
    check('short password rejected', false, 'it was accepted');
} catch (InvalidArgumentException) {
    check('short password rejected', true);
}

echo "\n-- login --\n";
$r = attempt_login('authtest@example.com', 'wrong-password');
check('wrong password refused', $r['ok'] === false);
check('error message does not reveal whether the account exists',
    ($r['error'] ?? '') === 'Incorrect email or password.');

$r = attempt_login('nobody-here@example.com', 'whatever');
check('unknown account gives the identical message',
    $r['ok'] === false && ($r['error'] ?? '') === 'Incorrect email or password.');

query('UPDATE users SET failed_logins = 0, locked_until = NULL WHERE id = ?', [$id]);
$r = attempt_login('authtest@example.com', 'correct-horse-battery');
check('correct password accepted', $r['ok'] === true);
check('password hash never returned to the caller', !isset($r['user']['password_hash']));

echo "\n-- lockout --\n";
query('UPDATE users SET failed_logins = 0, locked_until = NULL WHERE id = ?', [$id]);
for ($i = 0; $i < LOGIN_MAX_ATTEMPTS; $i++) {
    attempt_login('authtest@example.com', 'nope');
}
$locked = fetch_one('SELECT failed_logins, locked_until FROM users WHERE id = ?', [$id]);
check('account locks after ' . LOGIN_MAX_ATTEMPTS . ' failures', $locked['locked_until'] !== null);

$r = attempt_login('authtest@example.com', 'correct-horse-battery');
check('correct password refused while locked', $r['ok'] === false,
    'lockout can be bypassed by finally guessing right');
check('lockout message explains the wait', str_contains($r['error'] ?? '', 'Try again in'));

query('UPDATE users SET failed_logins = 0, locked_until = NULL WHERE id = ?', [$id]);

echo "\n-- disabled accounts --\n";
query('UPDATE users SET is_active = 0 WHERE id = ?', [$id]);
$r = attempt_login('authtest@example.com', 'correct-horse-battery');
check('disabled account cannot log in', $r['ok'] === false);
query('UPDATE users SET is_active = 1 WHERE id = ?', [$id]);

echo "\n-- roles --\n";
check('super admin can do anything',            role_can('super_admin', 'payment.delete'));
check('auditor may view payments',              role_can('auditor', 'payment.view'));
check('auditor may NOT create payments',       !role_can('auditor', 'payment.create'));
check('auditor may NOT void payments',         !role_can('auditor', 'payment.void'));
check('auditor may read the audit log',         role_can('auditor', 'audit.view'));
check('accounts may create payments',           role_can('accounts', 'payment.create'));
check('accounts may NOT edit vehicles',        !role_can('accounts', 'vehicle.edit'));
check('admin may create bookings',              role_can('admin', 'booking.create'));
check('admin may NOT create payments',         !role_can('admin', 'payment.create'));
check('staff may view bookings',                role_can('staff', 'booking.view'));
check('staff may NOT view payments',           !role_can('staff', 'payment.view'));
check('staff may NOT read the audit log',      !role_can('staff', 'audit.view'));
check('unknown role gets nothing',             !role_can('nonsense', 'booking.view'));

// The public website is the business's shopfront. Everyone signed in could
// rewrite it, including the read-only Auditor, because the two screens that
// edit it guarded nothing but being signed in.
check('admin may edit the website',             role_can('admin', 'content.edit'));
check('admin may edit the places',              role_can('admin', 'place.edit'));
check('auditor may read the website copy',      role_can('auditor', 'content.view'));
check('auditor may NOT rewrite it',            !role_can('auditor', 'content.edit'));
check('auditor may NOT change the places',     !role_can('auditor', 'place.edit'));
check('staff may not reach the website at all',
    !role_can('staff', 'content.view') && !role_can('staff', 'content.edit'));
check('nor may accounts',
    !role_can('accounts', 'content.view') && !role_can('accounts', 'place.view'));

// Correcting a deposit or a refund moves a figure that has already been
// counted, so it belongs with the rest of the money, not with the booking.
check('accounts may correct a deposit',         role_can('accounts', 'deposit.correct'));
check('accounts may correct a refund',          role_can('accounts', 'refund.correct'));
check('admin may NOT correct a deposit',       !role_can('admin', 'deposit.correct'));
check('auditor may NOT correct a refund',      !role_can('auditor', 'refund.correct'));

echo "\n-- the permission catalogue --\n";

// A tick that changes nothing is worse than no tick, because somebody will
// rely on having removed it. So every permission the screen offers has to be
// one that something actually guards. This is the check that keeps the
// catalogue honest as endpoints come and go.
$guarded = [];
foreach (['/../api', '/..', '/../src'] as $dir) {
    foreach (glob(__DIR__ . $dir . '/*.php') ?: [] as $file) {
        $code = (string) file_get_contents($file);
        if (preg_match_all("/(?:api_guard|require_can|user_can)\\('([a-z_]+\\.[a-z_]+)'/", $code, $m)) {
            foreach ($m[1] as $ability) {
                $guarded[$ability] = true;
            }
        }
    }
}
$unenforced = array_values(array_diff(all_abilities(), array_keys($guarded)));
check('every permission offered is one the server enforces', $unenforced === [],
    'nothing checks: ' . implode(', ', $unenforced));
check('the Users screen permission is not on offer',
    !in_array(ABILITY_NOT_GRANTABLE, all_abilities(), true));
check('a role\'s standard agrees with role_can',
    role_abilities('accounts')['payment.create'] === true
    && role_abilities('accounts')['vehicle.edit'] === false);

echo "\n-- permissions for one person --\n";
$staffId = create_user('Auth Test Staff', 'authtest-perms@example.com', 'correct-horse-battery', 'staff');
$staff   = ['id' => $staffId, 'role_slug' => 'staff'];

check('starts as exactly the role',
    user_allows($staff, 'booking.create') && !user_allows($staff, 'payment.create'));

// Staff's standard, plus one it does not have, minus one it does.
$wanted = array_keys(array_filter(role_abilities('staff')));
$wanted[] = 'payment.create';
$wanted = array_values(array_diff($wanted, ['booking.create']));
$delta = set_user_abilities($staffId, 'staff', $wanted);

check('an added permission is granted',    user_allows($staff, 'payment.create'));
check('a removed permission is refused',  !user_allows($staff, 'booking.create'));
check('the rest of the role is untouched', user_allows($staff, 'booking.view'));
check('only the differences are stored',
    (int) (fetch_one('SELECT COUNT(*) AS n FROM user_abilities WHERE user_id = ?', [$staffId])['n'] ?? -1) === 2,
    'expected two rows, one each way');
check('what changed is reported back',
    $delta['extra'] === ['payment.create'] && $delta['removed'] === ['booking.create']);
check('the count under the role is right',
    user_ability_counts($staffId, 'staff') === ['extra' => 1, 'removed' => 1]);

// The one that must never be grantable, however the form is forged.
set_user_abilities($staffId, 'staff', array_merge($wanted, [ABILITY_NOT_GRANTABLE]));
check('managing users cannot be granted a tick at a time',
    !user_allows($staff, ABILITY_NOT_GRANTABLE));
check('and no row for it is written',
    fetch_one('SELECT 1 AS present FROM user_abilities WHERE user_id = ? AND ability = ?',
        [$staffId, ABILITY_NOT_GRANTABLE]) === null);

// A Super Admin is full access by definition. Even a row that says otherwise
// -- put there by hand, or left behind by a role change -- does not narrow one.
query('INSERT INTO user_abilities (user_id, ability, granted) VALUES (?,?,0)
       ON DUPLICATE KEY UPDATE granted = 0', [$staffId, 'report.view']);
check('a Super Admin is not narrowed by a stored exception',
    user_allows(['id' => $staffId, 'role_slug' => 'super_admin'], 'report.view'));

clear_user_abilities($staffId);
check('clearing puts the role back',
    user_allows($staff, 'booking.create') && !user_allows($staff, 'payment.create'));
check('and leaves no rows behind',
    (int) (fetch_one('SELECT COUNT(*) AS n FROM user_abilities WHERE user_id = ?', [$staffId])['n'] ?? -1) === 0);

// A row that agrees with the role says nothing, which is what a role change
// leaves behind if one is ever missed.
query('INSERT INTO user_abilities (user_id, ability, granted) VALUES (?,?,1)', [$staffId, 'booking.view']);
user_ability_overrides($staffId, true);
check('an exception that matches the role is counted as nothing',
    user_ability_counts($staffId, 'staff') === ['extra' => 0, 'removed' => 0]);
clear_user_abilities($staffId);

echo "\n-- audit trail --\n";
$logs = fetch_all(
    "SELECT action, module FROM audit_logs
      WHERE user_id = ? ORDER BY id DESC LIMIT 20", [$id]
);
$actions = array_column($logs, 'action');
check('successful logins are recorded',  in_array('login', $actions, true));
check('failed logins are recorded',      in_array('login_failed', $actions, true));

audit_log('test_redaction', 'test', 'user', $id,
    ['password' => 'hunter2', 'name' => 'Before'],
    ['password' => 'hunter3', 'name' => 'After'], null, $id, 'authtest');
$entry = fetch_one("SELECT previous_value, new_value FROM audit_logs
                     WHERE action = 'test_redaction' ORDER BY id DESC LIMIT 1");
check('passwords are redacted in the audit trail',
    !str_contains((string) $entry['previous_value'], 'hunter2')
    && !str_contains((string) $entry['new_value'], 'hunter3'));
check('non-sensitive fields are still recorded',
    str_contains((string) $entry['new_value'], 'After'));

[$prev, $curr] = diff_changes(['a' => 1, 'b' => 2], ['a' => 1, 'b' => 3]);
check('diff records only what changed', $prev === ['b' => 2] && $curr === ['b' => 3]);

echo "\n-- document numbering --\n";
query('DELETE FROM number_sequences WHERE prefix = ?', ['TST']);
$first  = next_number('TST', 2026);
$second = next_number('TST', 2026);
check('numbers are sequential and zero-padded', $first === 'TST-2026-0001' && $second === 'TST-2026-0002',
    "{$first} then {$second}");
$newYear = next_number('TST', 2027);
check('numbering restarts each year', $newYear === 'TST-2027-0001', $newYear);

// Tidy up.
query("DELETE FROM audit_logs WHERE user_id = ? OR user_label = 'authtest'", [$id]);
query('DELETE FROM users WHERE email LIKE ?', ['authtest%']);
query('DELETE FROM number_sequences WHERE prefix = ?', ['TST']);

echo "\n{$pass_count} passed, {$fail_count} failed\n";
exit($fail_count === 0 ? 0 : 1);
