<?php
declare(strict_types=1);

/**
 * Database access.
 *
 * One PDO connection per request, configured to throw on error and to use
 * real prepared statements rather than emulated ones — emulation builds the
 * query string client-side, which is where escaping bugs turn into injection.
 */

/** Lets tests (and the CLI tools) supply configuration without a config.php. */
function config_set(array $values): void
{
    $GLOBALS['__config_override'] = $values;
}

/**
 * Finds config.php.
 *
 * It used to be one fixed path, next to the panel. That stopped working when
 * the host began deploying this repository by building it: the build output is
 * the document root and it is recreated from scratch every time, so anything
 * written beside the panel is erased on the next push. Keeping the file there
 * would mean re-uploading the database password after every deploy.
 *
 * So the panel looks outward instead. A directory named nitesha-config,
 * anywhere above the panel, holds the file; being outside the document root it
 * survives deploys and cannot be fetched over HTTP even if a rule is
 * misconfigured, which is where a database password belongs anyway.
 *
 * The old location is still checked first, so an install that predates this
 * keeps working untouched.
 *
 * Returns null when there is nothing to load; the caller decides what to say.
 */
function config_path(): ?string
{
    $explicit = getenv('NITESHA_CONFIG');
    if (is_string($explicit) && $explicit !== '' && is_file($explicit)) {
        return $explicit;
    }

    // Beside the panel: how this has always worked, and still right for an
    // install that is uploaded rather than built.
    $beside = __DIR__ . '/../config.php';
    if (is_file($beside)) {
        return $beside;
    }

    // Then upwards. Six levels is past the account root on every layout this
    // has run on, and stopping at the filesystem root keeps it terminating on
    // any layout it has not.
    $dir = dirname(__DIR__);
    for ($i = 0; $i < 6; $i++) {
        $candidate = $dir . '/nitesha-config/config.php';
        if (is_file($candidate)) {
            return $candidate;
        }
        $parent = dirname($dir);
        if ($parent === $dir) {
            break;
        }
        $dir = $parent;
    }

    return null;
}

/**
 * What the panel shows when it cannot find its configuration.
 *
 * This used to be one sentence of plain text on a 500. It is technically
 * accurate and it is a dead end: it does not say which file is missing, where
 * the panel looked, or that the database itself is untouched -- and it is the
 * first thing an owner sees after a deploy wipes the config, which is a moment
 * where "not set up yet" reads like the data is gone.
 *
 * The paths are the ones config_path() actually searched, computed rather than
 * described, so the instructions cannot drift away from the code. Nothing here
 * is a secret: no credentials are read at this point, because the file that
 * would hold them is the one that is missing.
 */
function config_missing_page(): never
{
    $panelDir = dirname(__DIR__);
    $aboveDir = dirname($panelDir, 2) . '/nitesha-config';

    // At a command line there is no browser to show a page to, and a tool
    // that prints HTML and exits 0 is worse than one that fails: the test
    // fixture that clears the enquiry throttle did exactly that for a while,
    // reporting nothing wrong while doing nothing at all.
    if (PHP_SAPI === 'cli') {
        fwrite(STDERR, "The panel cannot find its configuration.\n"
            . "Looked in {$panelDir}/config.php and {$aboveDir}/config.php.\n"
            . "Set NITESHA_CONFIG to the file, or run this from a checkout that has one.\n");
        exit(1);
    }

    http_response_code(500);
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex, nofollow');

    $e = static fn (string $v): string => htmlspecialchars($v, ENT_QUOTES, 'UTF-8');

    echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'
       . '<meta name="viewport" content="width=device-width, initial-scale=1">'
       . '<title>Panel not configured</title>'
       . '<style>'
       . 'body{margin:0;padding:32px 16px;background:#FAF7F2;color:#1A2233;'
       . 'font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}'
       . 'main{max-width:640px;margin:0 auto;background:#fff;border:1px solid #E7E0D6;'
       . 'border-radius:14px;padding:24px}'
       . 'h1{font-size:1.3rem;margin:0 0 8px}p{margin:0 0 12px}'
       . 'code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.85rem;'
       . 'background:#FAF7F2;padding:2px 5px;border-radius:5px;word-break:break-all}'
       . 'ol{margin:0 0 12px;padding-left:20px}li{margin-bottom:6px}'
       . '.note{color:#5C5348;font-size:.92rem}'
       . 'a.btn{display:inline-block;margin-top:8px;background:#E8A317;color:#1A2233;'
       . 'text-decoration:none;font-weight:700;padding:10px 18px;border-radius:10px}'
       . '</style></head><body><main>'
       . '<h1>The panel cannot find its configuration</h1>'
       . '<p><code>config.php</code> holds the database details. It is deliberately not '
       . 'part of the deploy, so a rebuild of the website folder never overwrites it '
       . '&mdash; but that also means a rebuild cannot put it back.</p>'
       . '<p class="note"><strong>Your data is not affected.</strong> Bookings, vehicles '
       . 'and enquiries live in the database, which this file only points at.</p>'
       . '<p>Two places were checked:</p><ol>'
       . '<li><code>' . $e($panelDir . '/config.php') . '</code></li>'
       . '<li><code>' . $e($aboveDir . '/config.php') . '</code> &mdash; the better one, '
       . 'because it sits above the website folder where a deploy cannot reach it</li>'
       . '</ol>'
       . '<p>The installer will write it for you, in the second place, and will not '
       . 'touch an existing account if one is already in the database.</p>'
       . '<p><a class="btn" href="install.php">Open the installer</a></p>'
       . '</main></body></html>';
    exit;
}

function config(?string $key = null): mixed
{
    static $config = null;

    if (isset($GLOBALS['__config_override'])) {
        $config = $GLOBALS['__config_override'];
    }

    if ($config === null) {
        $path = config_path();
        if ($path === null) {
            config_missing_page();
        }
        $config = require $path;
    }

    if ($key === null) {
        return $config;
    }

    // Supports dotted lookups such as config('db.host').
    $value = $config;
    foreach (explode('.', $key) as $segment) {
        if (!is_array($value) || !array_key_exists($segment, $value)) {
            return null;
        }
        $value = $value[$segment];
    }
    return $value;
}

/**
 * Opens a connection and lets the caller deal with failure. The installer
 * needs that: someone mistyping a database password there is making an
 * ordinary correction, not hitting a server error.
 */
function db_connect(array $db): PDO
{
    // A socket beats a host when one is configured — some hosts (and local
    // test setups) only accept socket connections.
    $dsn = isset($db['unix_socket']) && $db['unix_socket'] !== ''
        ? sprintf('mysql:unix_socket=%s;dbname=%s;charset=%s',
            $db['unix_socket'], $db['name'], $db['charset'] ?? 'utf8mb4')
        : sprintf('mysql:host=%s;dbname=%s;charset=%s',
            $db['host'] ?? 'localhost', $db['name'], $db['charset'] ?? 'utf8mb4');

    return new PDO($dsn, $db['user'] ?? '', $db['password'] ?? '', [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_STRINGIFY_FETCHES  => false,
    ]);
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    try {
        $pdo = db_connect((array) config('db'));
    } catch (PDOException $e) {
        // The exception message can contain the DSN and username; log it, but
        // never show it to the browser.
        error_log('DB connection failed: ' . $e->getMessage());
        http_response_code(500);
        exit('Database unavailable.');
    }

    return $pdo;
}

/**
 * Lets tests run against their own connection without a config.php.
 * Every helper below reads this override first, falling back to db().
 */
function db_set(PDO $pdo): void
{
    $GLOBALS['__db_override'] = $pdo;
}

function db_handle(): PDO
{
    return $GLOBALS['__db_override'] ?? db();
}

function query(string $sql, array $params = []): PDOStatement
{
    $stmt = db_handle()->prepare($sql);
    $stmt->execute($params);
    return $stmt;
}

function fetch_one(string $sql, array $params = []): ?array
{
    $row = query($sql, $params)->fetch();
    return $row === false ? null : $row;
}

function fetch_all(string $sql, array $params = []): array
{
    return query($sql, $params)->fetchAll();
}

function last_insert_id(): int
{
    return (int) db_handle()->lastInsertId();
}

function transaction(callable $work): mixed
{
    $pdo = db_handle();
    $pdo->beginTransaction();
    try {
        $result = $work();
        $pdo->commit();
        return $result;
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

/**
 * Allocates the next sequential document number, e.g. NSC-2026-0001.
 *
 * Uses a locking read inside the caller's transaction so two saves landing at
 * the same moment cannot be handed the same number — a plain SELECT MAX()
 * would let both read the same value before either wrote.
 */
function next_number(string $prefix, ?int $year = null): string
{
    $year ??= (int) date('Y');
    $pdo = db_handle();

    $ownTransaction = !$pdo->inTransaction();
    if ($ownTransaction) {
        $pdo->beginTransaction();
    }

    try {
        query(
            'INSERT INTO number_sequences (prefix, year, last_value) VALUES (?, ?, 0)
             ON DUPLICATE KEY UPDATE last_value = last_value',
            [$prefix, $year]
        );
        $row = fetch_one(
            'SELECT last_value FROM number_sequences WHERE prefix = ? AND year = ? FOR UPDATE',
            [$prefix, $year]
        );
        $next = ((int) ($row['last_value'] ?? 0)) + 1;
        query(
            'UPDATE number_sequences SET last_value = ? WHERE prefix = ? AND year = ?',
            [$next, $prefix, $year]
        );

        if ($ownTransaction) {
            $pdo->commit();
        }
    } catch (Throwable $e) {
        if ($ownTransaction && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }

    return sprintf('%s-%d-%04d', $prefix, $year, $next);
}

/**
 * Is this column on this table yet?
 *
 * Migrations only run when someone opens the panel, and the public website
 * asks for the fleet whether or not anyone has signed in today. So between a
 * deploy that adds a column and an admin next loading the dashboard, a query
 * naming that column would fail -- and the failure would land on the public
 * site's car listing, for a change made entirely inside the panel.
 *
 * Asked once per request and remembered, so a page reading several vehicles
 * does not ask several times.
 */
/**
 * Whether a table is there at all.
 *
 * The same forward-compatibility problem table_has_column solves, one level
 * up: a release that adds a table runs against a database that has not been
 * migrated yet, for exactly as long as it takes somebody to open the panel.
 * Asked the same way and cached the same way, and a failure is logged rather
 * than turned into a confident "no" -- see the note below for why that
 * distinction cost a round of debugging once already.
 */
function table_exists(string $table): bool
{
    static $cache = [];
    if (array_key_exists($table, $cache)) {
        return $cache[$table];
    }

    try {
        $row = fetch_one(
            'SELECT 1 AS present
               FROM information_schema.tables
              WHERE table_schema = DATABASE()
                AND table_name = ?
              LIMIT 1',
            [$table]
        );
        $cache[$table] = $row !== null;
    } catch (Throwable $e) {
        error_log("table_exists($table) failed: " . $e->getMessage());
        $cache[$table] = false;
    }

    return $cache[$table];
}

function table_has_column(string $table, string $column): bool
{
    static $cache = [];
    $key = $table . '.' . $column;

    if (array_key_exists($key, $cache)) {
        return $cache[$key];
    }

    // information_schema rather than SHOW COLUMNS.
    //
    // "SHOW COLUMNS FROM `t` LIKE ?" looks like the obvious way to ask, and it
    // cannot work here: this connection uses real prepared statements
    // (ATTR_EMULATE_PREPARES is false) and MySQL does not accept a placeholder
    // in a SHOW statement. It throws, every time, for every column.
    //
    // That was the first version, and the catch below turned the broken query
    // into a confident "no". So the photograph upload refused with "the
    // database has not been updated" on a database where the column existed,
    // and the public site quietly served NULL for every photograph. An
    // exception that becomes a plausible answer is worse than one that
    // escapes, which is why the failure is logged now rather than only caught.
    //
    // This is an ordinary SELECT, so it prepares, and both names bind as
    // parameters -- nothing is interpolated into the SQL at all.
    try {
        $row = fetch_one(
            'SELECT 1 AS present
               FROM information_schema.columns
              WHERE table_schema = DATABASE()
                AND table_name = ?
                AND column_name = ?
              LIMIT 1',
            [$table, $column]
        );
        $cache[$key] = $row !== null;
    } catch (Throwable $e) {
        error_log("table_has_column($table.$column) failed: " . $e->getMessage());
        $cache[$key] = false;
    }

    return $cache[$key];
}
