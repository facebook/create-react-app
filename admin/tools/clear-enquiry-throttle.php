<?php
declare(strict_types=1);

/**
 * Test fixture: clears the enquiry rate-limit window for loopback addresses.
 *
 *   php tools/clear-enquiry-throttle.php
 *
 * The public endpoint refuses more than a few enquiries an hour from one
 * address. That is the behaviour we want in production, but every local test
 * suite arrives from 127.0.0.1, so whichever suite runs second is throttled by
 * the first. This forgets the address those runs were sent from.
 *
 * Nothing is deleted. The enquiries stay exactly as they were, along with
 * anything they became; only the address they arrived from is cleared, which
 * is held for throttling and for looking into abuse — neither of which means
 * anything for a submission from this machine to itself. It will only ever
 * touch loopback addresses, so a real enquiry is out of its reach, and it is
 * a testing tool that the application never calls.
 */

require_once __DIR__ . '/../src/db.php';

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

query(
    'UPDATE enquiries SET ip_address = NULL
      WHERE ip_address IN (?, ?) AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
    [inet_pton('127.0.0.1'), inet_pton('::1')]
);

$n = db_handle()->query('SELECT ROW_COUNT()')->fetchColumn();
echo "throttle window cleared ($n test enquiries)\n";
