<?php
/**
 * Phone numbers, and the country code in front of them.
 *
 * The panel took a free-text phone number, which meant "9876543210",
 * "98765 43210", "+91 9876543210" and "976543210" all went in and only three
 * of them could be dialled. A number that cannot be dialled is worse than a
 * missing one: nobody notices until the customer is late and the car is gone.
 *
 * So: the code is picked from a list and the digits are counted against that
 * country. Stored as "+91 9876543210" -- code, one space, national digits --
 * which fits the VARCHAR(20) the columns already are and reads the way a
 * person would write it.
 *
 * The list is the countries NiteSha actually takes bookings from: India, the
 * Gulf where most of the NRI customers are, and the English-speaking
 * countries the rest come home from. It is not a world list, because a
 * hundred-row dropdown is a worse input than a short one.
 */

const DIAL_CODES = [
    ['code' => '+91',  'name' => 'India',          'digits' => [10]],
    ['code' => '+971', 'name' => 'UAE',            'digits' => [9]],
    ['code' => '+966', 'name' => 'Saudi Arabia',   'digits' => [9]],
    ['code' => '+965', 'name' => 'Kuwait',         'digits' => [8]],
    ['code' => '+974', 'name' => 'Qatar',          'digits' => [8]],
    ['code' => '+968', 'name' => 'Oman',           'digits' => [8]],
    ['code' => '+973', 'name' => 'Bahrain',        'digits' => [8]],
    ['code' => '+65',  'name' => 'Singapore',      'digits' => [8]],
    ['code' => '+60',  'name' => 'Malaysia',       'digits' => [9, 10]],
    ['code' => '+94',  'name' => 'Sri Lanka',      'digits' => [9]],
    ['code' => '+44',  'name' => 'United Kingdom', 'digits' => [10]],
    ['code' => '+1',   'name' => 'USA / Canada',   'digits' => [10]],
    ['code' => '+61',  'name' => 'Australia',      'digits' => [9]],
];

/** The default, because almost every booking is a local one. */
const DIAL_DEFAULT = '+91';

/** The digit counts a code accepts, or null when the code is not on the list. */
function dial_digits(string $code): ?array
{
    foreach (DIAL_CODES as $entry) {
        if ($entry['code'] === $code) {
            return $entry['digits'];
        }
    }
    return null;
}

/**
 * A stored number back into [code, digits].
 *
 * Numbers saved before this existed have no code at all. They are Indian --
 * that is who was being booked -- so they read back as +91 rather than as
 * broken. Longest code first, or +9 would match before +91.
 */
function split_phone(?string $stored): array
{
    $stored = trim((string) $stored);
    if ($stored === '') {
        return [DIAL_DEFAULT, ''];
    }

    if (str_starts_with($stored, '+')) {
        $bare  = preg_replace('/[^0-9]/', '', $stored);
        $codes = array_column(DIAL_CODES, 'code');
        usort($codes, static fn($a, $b) => strlen($b) <=> strlen($a));
        foreach ($codes as $code) {
            $digits = substr($code, 1);
            if (str_starts_with($bare, $digits)) {
                return [$code, substr($bare, strlen($digits))];
            }
        }
        // A code we do not list. Keep the number whole rather than mangling
        // it: it is still dialable, it just cannot be length-checked.
        return ['', $stored];
    }

    return [DIAL_DEFAULT, preg_replace('/[^0-9]/', '', $stored)];
}

/** [code, digits] back into what goes in the column. */
function join_phone(string $code, string $digits): string
{
    $digits = preg_replace('/[^0-9]/', '', $digits);
    if ($digits === '') {
        return '';
    }
    return $code === '' ? $digits : $code . ' ' . $digits;
}
