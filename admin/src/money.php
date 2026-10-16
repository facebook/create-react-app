<?php
declare(strict_types=1);

/**
 * Money arithmetic in integer paise.
 *
 * Rupee amounts are held as strings like "10000.00" in the database and as
 * integers internally: 10000.00 becomes 1000000 paise. Integers add and
 * subtract exactly, so totals never drift the way float arithmetic does
 * (0.1 + 0.2 = 0.30000000000000004), and an auditor's sums always agree with
 * the system's.
 *
 * bcmath would do the same job, but it is not enabled everywhere and money
 * handling should not depend on an optional extension.
 */

/** "1234.56" or 1234.56 -> 123456 paise. */
function to_paise(string|int|float|null $amount): int
{
    if ($amount === null || $amount === '') {
        return 0;
    }

    $text = trim((string) $amount);
    $negative = str_starts_with($text, '-');
    $text = ltrim($text, '+-');

    // Split on the decimal point rather than multiplying by 100, which would
    // reintroduce the float error this function exists to avoid.
    $parts  = explode('.', $text, 2);
    $rupees = (int) preg_replace('/\D/', '', $parts[0] === '' ? '0' : $parts[0]);

    $fraction = $parts[1] ?? '0';
    $fraction = preg_replace('/\D/', '', $fraction);
    $fraction = substr(str_pad($fraction, 2, '0'), 0, 2);   // truncate, never round up

    $paise = $rupees * 100 + (int) $fraction;
    return $negative ? -$paise : $paise;
}

/** 123456 paise -> "1234.56", ready for a DECIMAL column. */
function from_paise(int $paise): string
{
    $negative = $paise < 0;
    $paise = abs($paise);
    return ($negative ? '-' : '') . intdiv($paise, 100) . '.' . str_pad((string) ($paise % 100), 2, '0', STR_PAD_LEFT);
}

function money_add(string|int|float|null ...$amounts): string
{
    $total = 0;
    foreach ($amounts as $amount) {
        $total += to_paise($amount);
    }
    return from_paise($total);
}

function money_sub(string|int|float|null $a, string|int|float|null $b): string
{
    return from_paise(to_paise($a) - to_paise($b));
}

/** Multiplying money by a count — days, or kilometres — stays exact. */
function money_times(string|int|float|null $amount, int $multiplier): string
{
    return from_paise(to_paise($amount) * $multiplier);
}

/** -1, 0 or 1, like a spaceship comparison. */
function money_cmp(string|int|float|null $a, string|int|float|null $b): int
{
    return to_paise($a) <=> to_paise($b);
}

function money_is_zero(string|int|float|null $amount): bool
{
    return to_paise($amount) === 0;
}

/**
 * ₹1,32,224 -- Indian grouping, which number_format cannot do.
 *
 * The last three digits, then pairs. A total shown as ₹132,224 reads as a
 * different number to everyone who will see this panel.
 */
function rupees(string|float $amount): string
{
    $n    = (string) (int) round((float) $amount);
    $sign = str_starts_with($n, '-') ? '-' : '';
    $n    = ltrim($n, '-');

    if (strlen($n) <= 3) {
        return $sign . '₹' . $n;
    }

    $last  = substr($n, -3);
    $rest  = substr($n, 0, -3);
    $rest  = preg_replace('/\\B(?=(\\d{2})+$)/', ',', $rest) ?? $rest;

    return $sign . '₹' . $rest . ',' . $last;
}
