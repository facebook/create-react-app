<?php
declare(strict_types=1);

require_once __DIR__ . '/csrf.php';
require_once __DIR__ . '/migrate.php';
require_once __DIR__ . '/phone.php';

/**
 * Shared plumbing for the JSON endpoints.
 *
 * Every endpoint checks the session and the caller's role on the server. The
 * browser hiding a button is a convenience, not a control — requests arrive
 * however the caller chooses to send them.
 */

function json_out(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error(string $message, int $status = 400, array $extra = []): never
{
    json_out(['error' => $message] + $extra, $status);
}

/**
 * Makes an endpoint answer JSON whatever happens to it, including a crash.
 *
 * A PHP error printed into the reply -- or a fatal that ends it with an empty
 * body -- is not JSON, so the panel could not read it and said so: "The
 * server returned an unreadable response." True, and no use to anybody. The
 * failure was a database one, and the message that would have named it went
 * to a log nobody was looking at.
 *
 * So: nothing is ever printed into the body, the detail is written where it
 * can be read afterwards, and the browser gets a JSON error it can show.
 */
function api_failures_as_json(): void
{
    // Never into the response. A single warning ahead of the JSON makes the
    // whole reply unparseable, and the caller is left with nothing to show.
    ini_set('display_errors', '0');
    error_reporting(E_ALL);

    set_exception_handler(static function (Throwable $e): void {
        $ref = api_log_failure(
            get_class($e) . ': ' . $e->getMessage()
            . ' in ' . $e->getFile() . ':' . $e->getLine()
        );
        json_error('Something went wrong at our end and the change was not saved. '
            . 'Please try again. If it keeps happening, quote ' . $ref . '.', 500);
    });

    register_shutdown_function(static function (): void {
        $last = error_get_last();
        if ($last === null
            || !in_array($last['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR], true)) {
            return;
        }
        // Headers already out means the endpoint answered and the trouble came
        // afterwards; there is no reply left to fix.
        if (headers_sent()) {
            return;
        }
        $ref = api_log_failure($last['message'] . ' in ' . $last['file'] . ':' . $last['line']);
        json_error('Something went wrong at our end and the change was not saved. '
            . 'Please try again. If it keeps happening, quote ' . $ref . '.', 500);
    });
}

/**
 * Writes a failure where it can be found, and returns a short reference so
 * the person on the screen and the line in the log can be matched up.
 *
 * Into storage_path, which is above the document root: a deploy rewrites the
 * site, and a log inside it would be wiped exactly when a history of failures
 * is what is wanted. The host's own error log gets it too, or instead, if
 * that directory cannot be written.
 */
function api_log_failure(string $detail): string
{
    $ref  = strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
    $line = sprintf(
        "[%s] %s %s %s -- %s\n",
        date('Y-m-d H:i:s'),
        $ref,
        $_SERVER['REQUEST_METHOD'] ?? '-',
        $_SERVER['REQUEST_URI'] ?? '-',
        $detail
    );

    // config_path() first, and config() only if there is something to read.
    // One of the failures this exists to record is the panel not finding its
    // own configuration, and config() answers that by drawing a setup page
    // and stopping -- which, from in here, would replace the reply being
    // written with a page of HTML and lose the log line as well.
    $base = dirname(__DIR__, 3) . '/nitesha-storage';
    try {
        if (config_path() !== null) {
            $base = (string) (config('storage_path') ?? $base);
        }
    } catch (Throwable) {
        // Keep the default; there is a more important failure to record.
    }
    $dir  = $base . '/logs';
    $file = $dir . '/panel-errors.log';
    if (is_dir($dir) || @mkdir($dir, 0770, true)) {
        // One roll-over, so a fault that repeats all night cannot fill the
        // disk and take the panel down with it. The previous file is kept:
        // the first occurrence is usually the one worth reading.
        if (@filesize($file) > 1048576) {
            @rename($file, $dir . '/panel-errors.1.log');
        }
        if (@file_put_contents($file, $line, FILE_APPEND | LOCK_EX) !== false) {
            return $ref;
        }
    }

    error_log(rtrim($line));
    return $ref;
}

/** Reads a JSON request body, falling back to form-encoded input. */
function json_input(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if ($raw !== '') {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return $decoded;
        }
    }
    return $_POST;
}

/**
 * Guards a state-changing endpoint: correct method, valid CSRF token, signed
 * in, and permitted. Returns the acting user.
 */
function api_guard(string $ability, bool $writes = false): array
{
    session_start_secure();

    if ($writes) {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            json_error('Method not allowed', 405);
        }
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($_POST['csrf_token'] ?? null);
        if (!csrf_valid(is_string($token) ? $token : null)) {
            json_error('Session expired. Reload the page and try again.', 419);
        }
    }

    $user = current_user();
    if ($user === null) {
        json_error('Not signed in', 401);
    }

    // Bring the schema up to date here rather than relying on someone loading
    // a particular page. Every endpoint in the panel comes through this, so a
    // deploy that adds a column has it created by the first action taken after
    // it, whatever that action is.
    migrate_if_needed();

    if (!user_allows($user, $ability)) {
        audit_log('permission_denied', 'api', null, null, null, null, $ability,
            (int) $user['id'], $user['name']);
        json_error('You do not have permission to do that.', 403);
    }
    return $user;
}

// ------------------------------------------------------------ validation --

/**
 * Validation that returns every problem at once rather than stopping at the
 * first, so a form can show all of its errors in one pass.
 */
final class Validator
{
    private array $errors = [];
    private array $clean  = [];

    public function __construct(private array $input) {}

    public function required(string $field, string $label): self
    {
        $value = trim((string) ($this->input[$field] ?? ''));
        if ($value === '') {
            $this->errors[$field] = "{$label} is required.";
        } else {
            $this->clean[$field] = $value;
        }
        return $this;
    }

    public function optional(string $field, ?int $maxLength = null): self
    {
        $value = trim((string) ($this->input[$field] ?? ''));
        $this->clean[$field] = $value === '' ? null
            : ($maxLength !== null ? mb_substr($value, 0, $maxLength) : $value);
        return $this;
    }

    /**
     * An amount of money.
     *
     * $signed is for a correction and nothing else. Almost every figure the
     * panel takes is a sum of money that cannot be less than nothing -- a
     * payment of minus five hundred rupees is a mistake, not an entry -- so
     * the default refuses it. An adjustment row is the exception: "the
     * amount should have been 2,500, not 3,000" is recorded as -500 beside
     * the original, and without this the correction endpoints could only
     * ever revise a figure upwards.
     */
    public function money(string $field, string $label, bool $required = true,
                          bool $signed = false): self
    {
        $raw = $this->input[$field] ?? null;
        if ($raw === null || $raw === '') {
            if ($required) {
                $this->errors[$field] = "{$label} is required.";
            } else {
                $this->clean[$field] = null;
            }
            return $this;
        }
        if (!is_numeric($raw)) {
            $this->errors[$field] = "{$label} must be a number.";
            return $this;
        }
        $value = round((float) $raw, 2);
        if ($value < 0 && !$signed) {
            $this->errors[$field] = "{$label} cannot be negative.";
            return $this;
        }
        if (abs($value) > 99999999.99) {
            $this->errors[$field] = "{$label} is unrealistically large.";
            return $this;
        }
        // Kept as a string so it reaches DECIMAL without a float round-trip.
        $this->clean[$field] = number_format($value, 2, '.', '');
        return $this;
    }

    public function integer(string $field, string $label, int $min = 0, ?int $max = null, bool $required = true): self
    {
        $raw = $this->input[$field] ?? null;
        if ($raw === null || $raw === '') {
            if ($required) {
                $this->errors[$field] = "{$label} is required.";
            } else {
                $this->clean[$field] = null;
            }
            return $this;
        }
        if (!is_numeric($raw) || (int) $raw != $raw) {
            $this->errors[$field] = "{$label} must be a whole number.";
            return $this;
        }
        $value = (int) $raw;
        if ($value < $min) {
            $this->errors[$field] = "{$label} cannot be less than {$min}.";
        } elseif ($max !== null && $value > $max) {
            $this->errors[$field] = "{$label} cannot be more than {$max}.";
        } else {
            $this->clean[$field] = $value;
        }
        return $this;
    }

    public function inList(string $field, string $label, array $allowed, bool $required = true): self
    {
        $value = trim((string) ($this->input[$field] ?? ''));
        if ($value === '') {
            if ($required) {
                $this->errors[$field] = "{$label} is required.";
            } else {
                $this->clean[$field] = null;
            }
            return $this;
        }
        if (!in_array($value, $allowed, true)) {
            $this->errors[$field] = "{$label} is not a recognised value.";
            return $this;
        }
        $this->clean[$field] = $value;
        return $this;
    }

    public function hexColour(string $field, string $label): self
    {
        $value = trim((string) ($this->input[$field] ?? ''));
        if ($value === '') {
            $this->clean[$field] = '#5B6472';
            return $this;
        }
        if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $value)) {
            $this->errors[$field] = "{$label} must be a colour like #5B6472.";
            return $this;
        }
        $this->clean[$field] = strtoupper($value);
        return $this;
    }

    /**
     * A phone number, with its country code counted.
     *
     * The code arrives in its own field ("{field}_code") because it is picked
     * from a list rather than typed. A wrong digit count is refused here as
     * well as in the browser: the browser check is a courtesy to whoever is
     * typing, and this one is what actually keeps an undialable number out of
     * the column.
     */
    public function phone(string $field, string $label, bool $required = true): self
    {
        $code   = trim((string) ($this->input[$field . '_code'] ?? DIAL_DEFAULT));
        $digits = preg_replace('/[^0-9]/', '', (string) ($this->input[$field] ?? ''));

        if ($digits === '') {
            if ($required) {
                $this->errors[$field] = "{$label} is needed.";
            } else {
                $this->clean[$field] = null;
            }
            return $this;
        }

        $allowed = dial_digits($code);
        if ($allowed === null) {
            $this->errors[$field] = "Pick a country code for the {$label}.";
            return $this;
        }
        if (!in_array(strlen($digits), $allowed, true)) {
            $want = count($allowed) === 1
                ? $allowed[0] . ' digits'
                : implode(' or ', $allowed) . ' digits';
            $this->errors[$field] =
                "A {$code} {$label} is {$want}, and this one is " . strlen($digits) . '.';
            return $this;
        }

        $this->clean[$field] = join_phone($code, $digits);
        return $this;
    }

    public function fails(): bool
    {
        return $this->errors !== [];
    }

    public function errors(): array
    {
        return $this->errors;
    }

    public function clean(): array
    {
        return $this->clean;
    }

    /** Ends the request with a 422 and every field error, if any failed. */
    public function orFail(): array
    {
        if ($this->fails()) {
            json_error('Please correct the highlighted fields.', 422, ['fields' => $this->errors]);
        }
        return $this->clean;
    }
}

// ------------------------------------------------------------- installed --
//
// For the endpoints only. A page that breaks should show the host's error
// page; a JSON reply in the middle of some HTML would be the confusing half
// of both. Everything under api/ is a request the browser reads as JSON.
if (PHP_SAPI !== 'cli'
    && basename(dirname((string) ($_SERVER['SCRIPT_FILENAME'] ?? ''))) === 'api') {
    api_failures_as_json();
}
