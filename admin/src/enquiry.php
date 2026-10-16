<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

/**
 * Which enquiries have been looked at.
 *
 * Read and resolved are different questions. Status says where an enquiry got
 * to -- contacted, accepted, converted. This says whether anybody has opened
 * it yet, which is what the sidebar badge is actually asking.
 */

/**
 * Whether this database knows what has been read.
 *
 * Guarded like every other new column, so a panel that has not run the
 * migration yet keeps working -- it simply never shows an unread count.
 */
function enquiry_read_ready(): bool
{
    return table_has_column('enquiries', 'viewed_at');
}

/**
 * How many enquiries nobody has opened.
 *
 * This is what the sidebar badge counts. Not "how many are unresolved": an
 * enquiry stays Contacted for days while somebody waits for a callback, and a
 * badge that sits on 1 the whole time is one nobody looks at, so the morning
 * it says 3 reads the same as every other morning.
 */
function enquiry_unread(): int
{
    if (!enquiry_read_ready()) {
        return 0;
    }
    return (int) (fetch_one(
        'SELECT COUNT(*) AS n FROM enquiries WHERE viewed_at IS NULL'
    )['n'] ?? 0);
}

/** Stamps an enquiry as seen, the first time it is opened and never again. */
function enquiry_mark_seen(int $id, int $userId): void
{
    if (!enquiry_read_ready()) {
        return;
    }
    // The condition matters: opening an enquiry a second time must not move
    // the timestamp, or "when was this first picked up" stops being answerable.
    query('UPDATE enquiries SET viewed_at = NOW(), viewed_by = ?
            WHERE id = ? AND viewed_at IS NULL', [$userId, $id]);
}
