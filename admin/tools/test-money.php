<?php
declare(strict_types=1);

/**
 * Money arithmetic. No database needed.
 *
 * These are the cases that make float-based money go wrong, plus the ones a
 * rental business actually hits: long multiplications for extra KM, repeated
 * part-payments that must land exactly on zero, and refunds that must not
 * quietly gain or lose a paisa.
 */

require_once __DIR__ . '/../src/money.php';

$pass = 0;
$fail = 0;

function is_eq(string $label, mixed $actual, mixed $expected): void
{
    global $pass, $fail;
    if ((string) $actual === (string) $expected) {
        $pass++;
        echo "  ok    {$label}\n";
    } else {
        $fail++;
        echo "  FAIL  {$label} — expected {$expected}, got {$actual}\n";
    }
}

echo "\n-- parsing --\n";
is_eq('whole rupees',            to_paise('1500'),      150000);
is_eq('rupees and paise',        to_paise('1234.56'),   123456);
is_eq('single decimal place',    to_paise('10.5'),      1050);
is_eq('empty is zero',           to_paise(''),          0);
is_eq('null is zero',            to_paise(null),        0);
is_eq('negative',                to_paise('-250.75'),   -25075);
is_eq('float input',             to_paise(1234.56),     123456);
// Truncating rather than rounding up means the system never invents money
// that the customer was not charged.
is_eq('extra decimals truncate', to_paise('10.999'),    1099);

echo "\n-- formatting --\n";
is_eq('round trip',              from_paise(123456),    '1234.56');
is_eq('pads single paise',       from_paise(1205),      '12.05');
is_eq('zero',                    from_paise(0),         '0.00');
is_eq('negative',                from_paise(-25075),    '-250.75');
is_eq('exact rupees',            from_paise(150000),    '1500.00');

echo "\n-- the case float gets wrong --\n";
is_eq('0.10 + 0.20 is exactly 0.30', money_add('0.10', '0.20'), '0.30');
// Adding ten paise a hundred times must land on exactly ten rupees.
$running = '0.00';
for ($i = 0; $i < 100; $i++) {
    $running = money_add($running, '0.10');
}
is_eq('0.10 added 100 times is 10.00', $running, '10.00');

$floatRunning = 0.0;
for ($i = 0; $i < 100; $i++) {
    $floatRunning += 0.10;
}
echo "        (float would give: " . var_export($floatRunning === 10.0, true) . " for the same sum)\n";

echo "\n-- arithmetic --\n";
is_eq('add several',        money_add('1000.00', '250.50', '99.49'), '1349.99');
is_eq('subtract',           money_sub('9000.00', '1000.00'),          '8000.00');
is_eq('subtract to zero',   money_sub('2500.00', '2500.00'),          '0.00');
is_eq('overpayment is negative', money_sub('1000.00', '1200.00'),     '-200.00');
is_eq('multiply by days',   money_times('2500.00', 3),                '7500.00');
is_eq('multiply by zero',   money_times('2500.00', 0),                '0.00');

echo "\n-- extra KM, the long multiplication --\n";
// 1,247 km over the limit at ₹8.50/km.
is_eq('1247 km at 8.50', money_times('8.50', 1247), '10599.50');
is_eq('347 km at 9.00',  money_times('9.00', 347),  '3123.00');

echo "\n-- comparison --\n";
is_eq('equal',        money_cmp('100.00', '100.00'),  0);
is_eq('less',         money_cmp('99.99',  '100.00'), -1);
is_eq('greater',      money_cmp('100.01', '100.00'),  1);
is_eq('zero check',   var_export(money_is_zero('0.00'), true), 'true');
is_eq('near-zero is not zero', var_export(money_is_zero('0.01'), true), 'false');

echo "\n-- a realistic booking --\n";
// 3 days at ₹2,500, 120 extra km at ₹8, ₹500 cleaning, ₹1,000 goodwill discount.
$base     = money_times('2500.00', 3);
$extraKm  = money_times('8.00', 120);
$total    = money_sub(money_add($base, $extraKm, '500.00'), '1000.00');
is_eq('base rental',  $base,    '7500.00');
is_eq('extra km',     $extraKm, '960.00');
is_eq('total owed',   $total,   '7960.00');

// Paid as an advance and two part-payments.
$paid = money_add('3000.00', '2500.00', '2460.00');
is_eq('total paid',   $paid,    '7960.00');
is_eq('balance clears exactly', money_sub($total, $paid), '0.00');

echo "\n-- deposit held separately --\n";
$deposit  = '5000.00';
$deducted = '750.00';
$refund   = money_sub($deposit, $deducted);
is_eq('refund after deduction', $refund, '4250.00');
// The deposit must never be folded into what the rental earned.
is_eq('revenue excludes the deposit', $total, '7960.00');

echo "\n-- written the way it is read here --\n";
// Indian grouping: the last three digits, then pairs. number_format cannot do
// this, and a lakh shown the Western way reads as a different number to
// everyone who will see the panel.
is_eq('a lakh and a bit', rupees('132224.00'), '₹1,32,224');
is_eq('a crore',          rupees('12345678'),  '₹1,23,45,678');
is_eq('under a thousand', rupees('999'),       '₹999');
is_eq('exactly a thousand', rupees('1000'),    '₹1,000');
is_eq('ten thousand',     rupees('10000'),     '₹10,000');
is_eq('a lakh',           rupees('100000'),    '₹1,00,000');
is_eq('nothing',          rupees('0.00'),      '₹0');
// The minus belongs before the symbol, not between it and the digits.
is_eq('a refund due',     rupees('-45000'),    '-₹45,000');
is_eq('a small refund',   rupees('-500'),      '-₹500');
// Paise are rounded, not truncated: a balance of 1999.60 is two thousand.
is_eq('rounded up',       rupees('1999.60'),   '₹2,000');
is_eq('rounded down',     rupees('1999.40'),   '₹1,999');

echo "\n{$pass} passed, {$fail} failed\n";
exit($fail === 0 ? 0 : 1);
