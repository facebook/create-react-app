<?php
declare(strict_types=1);

/**
 * Creates an admin account from the command line.
 *
 * Run over SSH on the server:
 *   php tools/create-user.php
 *
 * Prompted rather than passed as arguments, so the password never lands in
 * the shell history or the process list.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../src/db.php';
require_once __DIR__ . '/../src/audit.php';
require_once __DIR__ . '/../src/auth.php';

function ask(string $prompt, bool $hidden = false): string
{
    echo $prompt;
    if ($hidden && DIRECTORY_SEPARATOR !== '\\') {
        shell_exec('stty -echo 2>/dev/null');
        $value = trim((string) fgets(STDIN));
        shell_exec('stty echo 2>/dev/null');
        echo "\n";
        return $value;
    }
    return trim((string) fgets(STDIN));
}

$roles = fetch_all('SELECT slug, name FROM roles ORDER BY id');
if ($roles === []) {
    exit("No roles found. Import sql/001_schema.sql first.\n");
}

echo "\nCreate a NiteSha admin account\n------------------------------\n";

$name  = ask('Full name: ');
$email = ask('Email: ');

echo "\nRoles:\n";
foreach ($roles as $r) {
    echo "  {$r['slug']}  —  {$r['name']}\n";
}
$role = ask("\nRole [super_admin]: ") ?: 'super_admin';

$password = ask('Password (min 10 characters): ', true);
$confirm  = ask('Confirm password: ', true);

if ($password !== $confirm) {
    exit("\nPasswords do not match. Nothing was created.\n");
}

try {
    $id = create_user($name, $email, $password, $role);
    audit_log('user_created', 'auth', 'user', $id, null,
        ['name' => $name, 'email' => $email, 'role' => $role],
        'Created via CLI', $id, $name);
    echo "\nCreated user #{$id} ({$email}) as {$role}.\n";
    echo "Sign in at your admin URL.\n\n";
} catch (Throwable $e) {
    exit("\nCould not create the user: {$e->getMessage()}\n");
}
