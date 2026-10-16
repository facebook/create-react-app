<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

/**
 * The audit trail.
 *
 * Every mutation writes one row here, answering the questions the system is
 * required to answer for any record: who did it, what changed, when, why, and
 * against which booking, customer or vehicle.
 *
 * Rows are written and never updated or deleted. A failure to write the audit
 * entry must not lose the business action that prompted it, so problems here
 * are logged rather than thrown — but they are never silently swallowed.
 */
function audit_log(
    string $action,
    string $module,
    ?string $recordType = null,
    ?int $recordId = null,
    ?array $previous = null,
    ?array $new = null,
    ?string $reason = null,
    ?int $userId = null,
    ?string $userLabel = null,
    ?int $bookingId = null,
    ?int $customerId = null,
    ?int $vehicleId = null
): void {
    if ($userId === null && session_status() === PHP_SESSION_ACTIVE) {
        $userId    = isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
        $userLabel ??= $_SESSION['name'] ?? null;
    }

    try {
        query(
            'INSERT INTO audit_logs
               (user_id, user_label, action, module, record_type, record_id,
                previous_value, new_value, reason, booking_id, customer_id,
                vehicle_id, ip_address, user_agent)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [
                $userId,
                $userLabel,
                $action,
                $module,
                $recordType,
                $recordId,
                $previous === null ? null : json_encode(redact($previous), JSON_UNESCAPED_UNICODE),
                $new === null ? null : json_encode(redact($new), JSON_UNESCAPED_UNICODE),
                $reason,
                $bookingId,
                $customerId,
                $vehicleId,
                client_ip_binary(),
                substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255) ?: null,
            ]
        );
    } catch (Throwable $e) {
        error_log('audit_log failed: ' . $e->getMessage() . ' [' . $module . '/' . $action . ']');
    }
}

/**
 * Keeps credentials out of the audit trail. The log records that a password
 * changed, never what it changed to.
 */
function redact(array $data): array
{
    $sensitive = ['password', 'password_hash', 'new_password', 'current_password', 'token'];
    foreach ($data as $key => $value) {
        if (in_array(strtolower((string) $key), $sensitive, true)) {
            $data[$key] = '[redacted]';
        } elseif (is_array($value)) {
            $data[$key] = redact($value);
        }
    }
    return $data;
}

/** Stored as packed bytes so both IPv4 and IPv6 fit the same column. */
function client_ip_binary(): ?string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    if (!is_string($ip) || $ip === '') {
        return null;
    }
    $packed = @inet_pton($ip);
    return $packed === false ? null : $packed;
}

function ip_to_string(?string $packed): ?string
{
    if ($packed === null || $packed === '') {
        return null;
    }
    $ip = @inet_ntop($packed);
    return $ip === false ? null : $ip;
}

/**
 * Records only the fields that actually changed, so the trail stays readable
 * and an unchanged field is never presented as an edit.
 */
function diff_changes(array $before, array $after): array
{
    $previous = [];
    $current  = [];
    foreach ($after as $key => $value) {
        $old = $before[$key] ?? null;
        if ((string) $old !== (string) $value) {
            $previous[$key] = $old;
            $current[$key]  = $value;
        }
    }
    return [$previous, $current];
}
