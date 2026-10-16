<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

/**
 * What the panel can be permitted to do, and who may do it.
 *
 * Three things live here, in this order, because each needs the one above it:
 *
 *   The catalogue -- every permission the panel actually checks, named once
 *   and written in the words of the business rather than the words of the
 *   code. 'payment.void' is what the server asks for; "Cancel a payment that
 *   was entered wrongly" is what somebody choosing it needs to read.
 *
 *   The roles -- what each of the five grants by default. This map used to sit
 *   in auth.php, which was the right place while a role was the whole answer.
 *   It is here now because it has become the starting point of an answer the
 *   rest of this file finishes.
 *
 *   The exceptions -- what one person may do that their role does not say, or
 *   may not do that it does. Stored per user, one row per difference.
 *
 * Deltas rather than a full copy, deliberately. "Staff, and may also take
 * payments" survives a change to what Staff means; a frozen snapshot of the
 * nine abilities Staff happened to have on the day the account was made does
 * not. It also reads correctly on the screen: two extras and one removal is a
 * sentence somebody can check, where twenty-seven ticks is not.
 *
 * One permission is deliberately absent from the catalogue: user.manage, the
 * one that opens the Users screen. It cannot be handed out a tick at a time,
 * because an account that holds it can reset the Super Admin's password and
 * take the panel. Giving somebody that is a decision to make them a Super
 * Admin -- a role change, which is visible in one word on the list -- and not
 * a checkbox in a group of twenty-seven that nobody rereads.
 */

/**
 * Every permission that something in the panel checks, grouped as the work is
 * grouped.
 *
 * The test for being in here is that some endpoint guards itself with it. A
 * permission that nothing enforces must not be offered: a tick that changes
 * nothing is worse than no tick, because somebody will rely on having removed
 * it.
 */
const ABILITY_GROUPS = [
    'Bookings' => [
        'booking.view'     => 'See bookings',
        'booking.create'   => 'Take a new booking',
        'booking.cancel'   => 'Cancel a booking',
        'booking.complete' => 'Close one off as returned',
        'booking.delete'   => 'Delete a booking',
    ],
    'Vehicles' => [
        'vehicle.view'   => 'See the fleet',
        'vehicle.edit'   => 'Add a car, change its rates and photos',
        'vehicle.delete' => 'Remove a car',
    ],
    'Enquiries' => [
        'enquiry.view'   => 'See enquiries from the website',
        'enquiry.edit'   => 'Update an enquiry and its status',
        'enquiry.delete' => 'Delete an enquiry',
    ],
    'Money coming in' => [
        'payment.create'  => 'Record money received',
        'payment.correct' => 'Correct the amount of a payment',
        'payment.void'    => 'Cancel a payment entered wrongly',
        'deposit.create'  => 'Take and return a deposit',
        'deposit.correct' => 'Correct a deposit entered wrongly',
        'refund.create'   => 'Give a refund',
        'refund.correct'  => 'Correct a refund entered wrongly',
    ],
    'Money going out' => [
        'expense.view'    => 'See what the business spends',
        'expense.create'  => 'Enter an expense',
        'expense.approve' => 'Approve an expense',
        'expense.correct' => 'Correct an expense',
        'expense.void'    => 'Cancel an expense',
    ],
    'Reports' => [
        'report.view' => 'Open the reports',
    ],
    'Kilometres' => [
        'km.create'  => 'Enter a reading',
        'km.correct' => 'Correct a reading',
    ],
    'Reminders' => [
        'reminder.view'   => 'See reminders',
        // Setting one and finishing one are separate ticks because the
        // server has always asked for them separately -- reminders.php
        // guards a new one with create and a change with edit -- and only
        // one of the two was on offer here, so the other could not be
        // withheld from anybody.
        'reminder.create' => 'Set a reminder',
        'reminder.edit'   => 'Change a reminder and tick it off',
        'reminder.delete' => 'Delete a reminder somebody else set',
    ],
    // The public website. Not an internal record like everything above it:
    // what is changed here is read by customers within the minute, which is
    // why seeing the screen and saving from it are two separate ticks.
    'The website' => [
        'content.view' => 'See what the website says',
        'content.edit' => 'Change the words and pictures on the website',
        'place.view'   => 'See the places to visit',
        'place.edit'   => 'Add, change and remove a place to visit',
    ],
];

/**
 * The ones worth a second look before ticking.
 *
 * Not more dangerous to the panel -- dangerous to the record. Every one of
 * these either removes something or changes a figure that has already been
 * counted, and the books are meant to be reconstructible for any past date.
 */
const ABILITY_WEIGHTY = [
    'booking.delete', 'vehicle.delete', 'enquiry.delete', 'reminder.delete',
    'payment.void', 'payment.correct', 'expense.void', 'expense.correct',
    'km.correct', 'refund.create', 'deposit.correct', 'refund.correct',
];

/** The permission that opens this screen, and is never a checkbox. See above. */
const ABILITY_NOT_GRANTABLE = 'user.manage';

/** Every catalogued permission, flat. */
function all_abilities(): array
{
    $out = [];
    foreach (ABILITY_GROUPS as $abilities) {
        foreach (array_keys($abilities) as $ability) {
            $out[] = $ability;
        }
    }
    return $out;
}

function ability_label(string $ability): string
{
    foreach (ABILITY_GROUPS as $abilities) {
        if (isset($abilities[$ability])) {
            return $abilities[$ability];
        }
    }
    return $ability;
}

/**
 * What each role may do. Checked on the server for every action — a
 * client-side check only hides buttons, it does not stop requests.
 */
function role_can(string $role, string $ability): bool
{
    $abilities = [
        'super_admin' => ['*'],
        'admin'       => ['booking.*', 'vehicle.*', 'enquiry.*', 'customer.*', 'km.*',
                          'reminder.*', 'content.*', 'place.*',
                          'payment.view', 'deposit.view', 'expense.view', 'report.view'],
        'accounts'    => ['payment.*', 'deposit.*', 'refund.*', 'expense.*',
                          'reminder.*',
                          'booking.view', 'vehicle.view', 'customer.view', 'report.view'],
        'auditor'     => ['*.view', 'report.view', 'audit.view'],
        // Anybody who runs the day can keep a note of what is coming. Deleting
        // one is not theirs: a reminder somebody else set and relied on should
        // not disappear, and ticking it off says the same thing reversibly.
        'staff'       => ['booking.view', 'booking.create', 'vehicle.view',
                          'enquiry.view', 'enquiry.create', 'km.create',
                          'reminder.view', 'reminder.create', 'reminder.edit'],
    ];

    foreach ($abilities[$role] ?? [] as $granted) {
        if ($granted === '*' || $granted === $ability) {
            return true;
        }
        // 'booking.*' grants every booking ability; '*.view' grants viewing
        // of everything.
        if (str_ends_with($granted, '.*')
            && str_starts_with($ability, substr($granted, 0, -1))) {
            return true;
        }
        if (str_starts_with($granted, '*.')
            && str_ends_with($ability, substr($granted, 1))) {
            return true;
        }
    }
    return false;
}

/**
 * The catalogued permissions a role grants on its own, as ability => bool.
 *
 * Worked out from role_can() rather than written out again. The wildcards are
 * the point of that map; expanding them by hand here would be the fourth copy
 * of a list this panel has already been bitten by keeping three of.
 */
function role_abilities(string $role): array
{
    static $cache = [];
    if (isset($cache[$role])) {
        return $cache[$role];
    }

    $out = [];
    foreach (all_abilities() as $ability) {
        $out[$ability] = role_can($role, $ability);
    }
    return $cache[$role] = $out;
}

/**
 * The differences stored against one person, as ability => bool.
 *
 * Empty for almost everybody, and empty before the migration that adds the
 * table has run -- this is called from require_can(), which on the Users
 * screen happens before migrate_if_needed() does.
 *
 * Cached per request because a permission check happens several times on one
 * page load and the answer cannot change in between. $forget drops the cache
 * after a write, so a form submission that saves and then re-renders shows
 * what it saved rather than what it read on the way in.
 */
function user_ability_overrides(int $userId, bool $forget = false): array
{
    static $cache = [];

    if ($forget) {
        unset($cache[$userId]);
        return [];
    }
    if (isset($cache[$userId])) {
        return $cache[$userId];
    }
    if (!table_exists('user_abilities')) {
        return [];
    }

    $out = [];
    foreach (fetch_all('SELECT ability, granted FROM user_abilities WHERE user_id = ?', [$userId]) as $row) {
        $out[(string) $row['ability']] = (int) $row['granted'] === 1;
    }
    return $cache[$userId] = $out;
}

/**
 * May this person do this?
 *
 * The role answers unless a row says otherwise. Two things the row can never
 * do: grant user.manage, and apply to a Super Admin -- that role means full
 * access, and a Super Admin with pieces missing is a contradiction the screen
 * refuses to create in the first place.
 */
function user_allows(array $user, string $ability): bool
{
    $role = (string) ($user['role_slug'] ?? $user['role'] ?? '');

    if ($role === 'super_admin' || $ability === ABILITY_NOT_GRANTABLE) {
        return role_can($role, $ability);
    }

    $overrides = user_ability_overrides((int) $user['id']);
    if (array_key_exists($ability, $overrides)) {
        return $overrides[$ability];
    }

    return role_can($role, $ability);
}

/**
 * What this person may do, catalogued ability => bool, role and exceptions
 * together. What the screen renders its ticks from.
 */
function user_abilities(int $userId, string $role): array
{
    $effective = role_abilities($role);
    if ($role === 'super_admin') {
        return $effective;
    }
    foreach (user_ability_overrides($userId) as $ability => $granted) {
        if (array_key_exists($ability, $effective)) {
            $effective[$ability] = $granted;
        }
    }
    return $effective;
}

/**
 * Stores the ticked set as differences from the role, and returns what
 * changed so the caller can log and report it.
 *
 * @param list<string> $wanted The abilities that were ticked.
 * @return array{extra:list<string>, removed:list<string>}
 */
function set_user_abilities(int $userId, string $role, array $wanted): array
{
    $defaults = role_abilities($role);
    $wanted   = array_intersect($wanted, all_abilities());

    $extra = [];
    $removed = [];
    $rows = [];
    foreach ($defaults as $ability => $byRole) {
        $ticked = in_array($ability, $wanted, true);
        if ($ticked === $byRole) {
            continue;
        }
        $rows[] = [$ability, $ticked];
        if ($ticked) {
            $extra[] = $ability;
        } else {
            $removed[] = $ability;
        }
    }

    // Replaced wholesale rather than merged: the form posts the complete
    // picture, so a difference that is no longer in it is one that was
    // deliberately taken away.
    query('DELETE FROM user_abilities WHERE user_id = ?', [$userId]);
    foreach ($rows as [$ability, $granted]) {
        query(
            'INSERT INTO user_abilities (user_id, ability, granted) VALUES (?,?,?)',
            [$userId, $ability, $granted ? 1 : 0]
        );
    }
    user_ability_overrides($userId, true);

    return ['extra' => $extra, 'removed' => $removed];
}

/** Back to whatever the role says, with nothing on top. */
function clear_user_abilities(int $userId): void
{
    if (!table_exists('user_abilities')) {
        return;
    }
    query('DELETE FROM user_abilities WHERE user_id = ?', [$userId]);
    user_ability_overrides($userId, true);
}

/**
 * How many exceptions one person has, for the line under their role.
 *
 * @return array{extra:int, removed:int}
 */
function user_ability_counts(int $userId, string $role): array
{
    if ($role === 'super_admin') {
        return ['extra' => 0, 'removed' => 0];
    }
    $extra = 0;
    $removed = 0;
    $defaults = role_abilities($role);
    foreach (user_ability_overrides($userId) as $ability => $granted) {
        if (!array_key_exists($ability, $defaults) || $granted === $defaults[$ability]) {
            continue;   // A role change left this saying nothing. Harmless.
        }
        $granted ? $extra++ : $removed++;
    }
    return ['extra' => $extra, 'removed' => $removed];
}
