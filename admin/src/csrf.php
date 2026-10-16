<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';

/**
 * Cross-site request forgery protection.
 *
 * Without this, another site could quietly submit a form to this one using
 * the admin's logged-in cookie — cancelling a booking or recording a payment
 * without the admin ever knowing. Every state-changing request must carry a
 * token that only this site's own pages can know.
 */

function csrf_token(): string
{
    session_start_secure();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf_token" value="'
        . htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') . '">';
}

function csrf_valid(?string $token): bool
{
    session_start_secure();
    $expected = $_SESSION['csrf_token'] ?? '';
    if ($expected === '' || $token === null || $token === '') {
        return false;
    }
    // Constant-time comparison: a plain === leaks, through timing, how much
    // of a guessed token was correct.
    return hash_equals($expected, $token);
}

/** Call at the top of anything that changes state. */
function require_csrf(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return;
    }

    $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
    if (!csrf_valid(is_string($token) ? $token : null)) {
        http_response_code(419);
        if (str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')) {
            header('Content-Type: application/json');
            exit(json_encode(['error' => 'Session expired. Reload the page and try again.']));
        }
        exit('Session expired. Reload the page and try again.');
    }
}

/** Escapes anything interpolated into HTML. */
function e(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}
