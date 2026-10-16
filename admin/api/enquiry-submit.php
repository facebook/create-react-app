<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/http.php';

/**
 * The public enquiry endpoint, for the booking form on niteshacars.in.
 *
 * This is the only part of the system that accepts unauthenticated input, so
 * it is deliberately narrow: it can create an enquiry and nothing else. It
 * reads no records, returns no data about the business, and cannot touch
 * bookings, payments or vehicles.
 *
 * Three defences, none of which inconveniences a real customer:
 *
 *   - Origin check. Browsers are told only the configured site may call this,
 *     so another site cannot quietly post through a visitor's browser.
 *   - Honeypot. A field hidden from people but filled in by most bots. When
 *     it arrives populated the submission is accepted-looking but discarded,
 *     so the bot has no signal to adapt to.
 *   - Rate limit per address. A person sends one enquiry; a script sends
 *     hundreds. Beyond a few an hour, further ones are refused.
 *
 * None of this is a substitute for reading enquiries with judgement — the
 * contents are whatever a stranger typed, and are escaped everywhere they are
 * displayed.
 */

const ENQUIRIES_PER_HOUR = 5;
const HONEYPOT_FIELD     = 'website';   // hidden in the form; humans never fill it

// ---- CORS: answer the browser's preflight before anything else ----
// A site is usually reachable at more than one name — with and without the
// www prefix, and a staging copy alongside the live one — so the setting
// takes either a single origin or a list of them.
$allowed = config('public_site_origin') ?? '';
$allowed = array_values(array_filter(array_map('strval', is_array($allowed) ? $allowed : [$allowed])));
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
$originAllowed = $origin !== '' && in_array($origin, $allowed, true);

if ($originAllowed) {
    // Echoed rather than wildcarded, so the browser only ever hands the
    // response to the site that asked for it.
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

// A POST from anywhere else is refused outright. Some browsers send no Origin
// header on a same-origin post, so an absent one is allowed through.
if ($origin !== '' && $allowed !== [] && !$originAllowed) {
    json_error('Not permitted', 403);
}

$input = json_input();

// Silently accepted, deliberately not stored. Telling a bot it was caught
// only teaches it which field to leave alone next time.
if (trim((string) ($input[HONEYPOT_FIELD] ?? '')) !== '') {
    json_out(['ok' => true, 'enquiry_number' => null]);
}

$ip = client_ip_binary();
if ($ip !== null) {
    $recent = fetch_one(
        'SELECT COUNT(*) AS n FROM enquiries
          WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
        [$ip]
    );
    if ((int) ($recent['n'] ?? 0) >= ENQUIRIES_PER_HOUR) {
        json_error('Too many enquiries from this connection. Please call us instead.', 429);
    }
}

$data = (new Validator($input))
    ->required('name', 'Your name')
    ->required('phone', 'Phone number')
    ->optional('email', 190)
    ->optional('pickup_location', 190)
    ->optional('message', 2000)
    ->optional('requirements', 2000)
    ->orFail();

// The checks the Validator cannot make, gathered rather than answered one at
// a time. A form that says "the highlighted fields" and then highlights the
// phone, waits for it to be fixed, and only then mentions the email, sends
// somebody round the loop once per mistake. Every reason goes back together,
// and the form marks every box it names.
$wrong = [];

// Phone is how the business calls back, so it has to be usable. Digits are
// counted after stripping the punctuation people naturally type.
$phoneDigits = preg_replace('/\D/', '', $data['phone']);
if (strlen($phoneDigits) < 10 || strlen($phoneDigits) > 15) {
    $wrong['phone'] = 'Please enter a valid phone number.';
}

if ($data['email'] !== null && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $wrong['email'] = 'That email address does not look right.';
}

$startDate  = valid_date($input['start_date'] ?? null);
$returnDate = valid_date($input['return_date'] ?? null);
if ($startDate !== null && $returnDate !== null && $returnDate < $startDate) {
    $wrong['return_date'] = 'The return date is before the start date.';
}

if ($wrong !== []) {
    json_error('Please correct the highlighted fields.', 422, ['fields' => $wrong]);
}

// A vehicle may be named, but an unknown id is ignored rather than refused —
// a customer should never see an error because the fleet changed while they
// were filling in the form.
$vehicleId = null;
if (!empty($input['vehicle_id'])) {
    $vehicle = fetch_one('SELECT id FROM vehicles WHERE id = ?', [(int) $input['vehicle_id']]);
    $vehicleId = $vehicle === null ? null : (int) $vehicle['id'];
}

try {
    $number = transaction(function () use ($data, $phoneDigits, $vehicleId, $startDate, $returnDate, $ip) {
        $number = next_number('ENQ');
        query(
            'INSERT INTO enquiries
               (enquiry_number, name, phone, email, vehicle_id, start_date, return_date,
                pickup_location, message, requirements, source, ip_address, user_agent, status)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?, \'New\')',
            [$number, $data['name'], $phoneDigits, $data['email'], $vehicleId,
             $startDate, $returnDate, $data['pickup_location'], $data['message'],
             $data['requirements'], 'website', $ip,
             substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255) ?: null]
        );
        $id = last_insert_id();

        // No user id: this action has no signed-in author, and recording one
        // would misattribute it.
        audit_log('enquiry_received', 'enquiries', 'enquiry', $id, null,
            ['enquiry_number' => $number, 'name' => $data['name']],
            null, null, 'Public form');

        return $number;
    });
} catch (Throwable $e) {
    error_log('enquiry submission failed: ' . $e->getMessage());
    json_error('We could not record your enquiry. Please call us instead.', 500);
}

// The reference is all that comes back. Nothing about the fleet, the business
// or other enquiries crosses this boundary.
json_out(['ok' => true, 'enquiry_number' => $number], 201);

function valid_date(mixed $value): ?string
{
    if (!is_string($value) || trim($value) === '') {
        return null;
    }
    $time = strtotime($value);
    return $time === false ? null : date('Y-m-d', $time);
}
