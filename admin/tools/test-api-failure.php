<?php
declare(strict_types=1);

/**
 * An endpoint that crashes still has to answer JSON.
 *
 *   php tools/test-api-failure.php
 *
 * The panel reads every reply as JSON. A PHP warning printed ahead of the
 * body, or a fatal that ends the request with nothing in it, is not JSON, and
 * all the panel could say was "the server returned an unreadable response" --
 * which is true and no use to anyone. So each way a request can die is run in
 * a child process here, and what comes back is checked for being readable.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

// ---- the child: one way of dying per invocation ----
$mode = $argv[1] ?? '';
if ($mode !== '') {
    require_once __DIR__ . '/../src/db.php';
    require_once __DIR__ . '/../src/http.php';
    api_failures_as_json();

    switch ($mode) {
        case 'throw':  throw new RuntimeException('deliberate: an endpoint threw');
        case 'fatal':  a_function_that_does_not_exist();        // @phpstan-ignore-line
        case 'warn':   echo $neverSet; json_out(['ok' => true]); // a notice, then a real answer
        default:       json_out(['ok' => true]);
    }
}

// ---- the parent ----
$pass = 0;
$fail = 0;
$ok   = function (string $label, string $detail = '') use (&$pass): void {
    $pass++;
    echo '  ok    ' . str_pad($label, 44) . $detail . "\n";
};
$bad = function (string $label, string $detail = '') use (&$fail): void {
    $fail++;
    echo '  FAIL  ' . $label . ($detail !== '' ? ' — ' . $detail : '') . "\n";
};

$run = static function (string $mode): string {
    $cmd = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__) . ' ' . escapeshellarg($mode)
         . ' 2>/dev/null';
    return (string) shell_exec($cmd);
};

foreach ([
    'throw' => 'an uncaught exception',
    'fatal' => 'a fatal error',
] as $mode => $label) {
    $body = $run($mode);
    $json = json_decode($body, true);
    if (!is_array($json)) {
        $bad("{$label} answers JSON", trim(substr($body, 0, 120)) ?: '(empty)');
        continue;
    }
    $ok("{$label} answers JSON");
    isset($json['error']) && is_string($json['error']) && $json['error'] !== ''
        ? $ok("{$label} says something readable", substr($json['error'], 0, 46) . '…')
        : $bad("{$label} says something readable", json_encode($json));
    preg_match('/\b[0-9A-F]{6}\b/', (string) ($json['error'] ?? ''))
        ? $ok("{$label} carries a reference to the log")
        : $bad("{$label} carries a reference to the log", (string) ($json['error'] ?? ''));
}

// A notice must not end up in the body: it is the half of this that turns a
// working reply into an unreadable one.
$body = $run('warn');
$json = json_decode($body, true);
is_array($json) && ($json['ok'] ?? false) === true
    ? $ok('a notice does not spoil a good reply', trim($body))
    : $bad('a notice does not spoil a good reply', trim(substr($body, 0, 120)) ?: '(empty)');

echo "\n{$pass} passed, {$fail} failed\n";
exit($fail === 0 ? 0 : 1);
