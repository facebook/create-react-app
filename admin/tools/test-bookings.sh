#!/usr/bin/env bash
# Booking rules, over real HTTP.
#
#   tools/test-bookings.sh http://127.0.0.1:8210 admin@example.com password
#
# The two rules worth proving are that a vehicle cannot be committed twice for
# overlapping dates, and that a booking's agreed price does not move when the
# vehicle's rate card later changes.

set -u
BASE="${1:?usage: test-bookings.sh <base-url> <email> <password>}"
EMAIL="${2:?}"
PASSWORD="${3:?}"
JAR="$(mktemp)"
PASS=0; FAIL=0
REG="BK$(date +%d%H%M%S)"
PHONE="9$(date +%d%H%M%S)"

ok()   { PASS=$((PASS+1)); echo "  ok    $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  FAIL  $1${2:+ — $2}"; }
check(){ if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "expected $3, got $2"; fi; }
body() { cat /tmp/bk_body; }

post() {  # post <action> <json>
  printf '%s' "$2" > /tmp/bk_payload
  curl -s -o /tmp/bk_body -w '%{http_code}' -b "$JAR" -X POST \
    -H 'Content-Type: application/json' -H "X-CSRF-Token: $TOKEN" \
    --data-binary @/tmp/bk_payload "$BASE/api/$1"
}
get() { curl -s -o /tmp/bk_body -w '%{http_code}' -b "$JAR" "$BASE/api/$1"; }

# --- sign in ---
TOKEN=$(curl -s -c "$JAR" "$BASE/index.php" | grep -o 'name="csrf_token" value="[^"]*"' | sed 's/.*value="//;s/"//')
curl -s -b "$JAR" -c "$JAR" -o /dev/null -X POST \
  -d "csrf_token=$TOKEN&email=$EMAIL&password=$PASSWORD" "$BASE/index.php"
TOKEN=$(curl -s -b "$JAR" -c "$JAR" "$BASE/dashboard.php" | grep -o 'name="csrf-token" content="[^"]*"' | sed 's/.*content="//;s/"//')

echo
echo "-- a vehicle to book --"
post "vehicles.php?action=save" "{\"name\":\"Test Car\",\"brand\":\"Maruti\",\"reg_number\":\"$REG\",
  \"body_type\":\"Hatchback\",\"fuel\":\"Petrol\",\"transmission\":\"Manual\",\"seats\":5,
  \"model_year\":2024,\"colour\":\"#123456\",\"status\":\"Available\",\"current_km\":10000,
  \"rate_daily\":\"2500\",\"km_limit_per_day\":200,\"extra_km_rate\":\"8\",
  \"security_deposit\":\"5000\"}" >/dev/null
VID=$(body | sed -n 's/.*"id":\([0-9]*\).*/\1/p')
[ -n "$VID" ] && ok "vehicle created (#$VID)" || bad "vehicle created"

echo
echo "-- create a booking --"
STATUS=$(post "bookings.php?action=save" "{\"customer_name\":\"Ravi Kumar\",\"phone\":\"$PHONE\",
  \"licence_number\":\"TN0120230012345\",\"address\":\"Nagercoil\",\"vehicle_id\":$VID,
  \"start_at\":\"2026-06-01 10:00\",\"return_at\":\"2026-06-04 10:00\",
  \"base_rental\":\"7500\",\"km_limit_per_day\":200,\"extra_km_rate\":\"8\",\"notes\":\"First\"}")
check "booking created" "$STATUS" "200"
BID=$(body | sed -n 's/.*"id":\([0-9]*\).*/\1/p')
body | grep -qE '"booking_number":"NSC-[0-9]{4}-[0-9]{4}"' && ok "booking number allocated" || bad "booking number allocated" "$(body | head -c 100)"
body | grep -q '"duration_days":3' && ok "duration computed as 3 days" || bad "duration computed as 3 days"
body | grep -q '"total":7500' && ok "total is the agreed rental" || bad "total is the agreed rental"
body | grep -q '"payment_status":"Unpaid"' && ok "starts Unpaid" || bad "starts Unpaid"

echo
echo "-- double booking --"
STATUS=$(post "bookings.php?action=save" "{\"customer_name\":\"Someone Else\",\"phone\":\"9000000001\",
  \"licence_number\":\"TN99\",\"vehicle_id\":$VID,
  \"start_at\":\"2026-06-03 10:00\",\"return_at\":\"2026-06-06 10:00\",
  \"base_rental\":\"7500\",\"km_limit_per_day\":200,\"extra_km_rate\":\"8\"}")
check "overlapping booking refused" "$STATUS" "409"
body | grep -q 'already booked' && ok "message names the clash" || bad "message names the clash" "$(body|head -c 120)"

STATUS=$(post "bookings.php?action=save" "{\"customer_name\":\"Later Customer\",\"phone\":\"9000000002\",
  \"licence_number\":\"TN98\",\"vehicle_id\":$VID,
  \"start_at\":\"2026-06-04 10:00\",\"return_at\":\"2026-06-06 10:00\",
  \"base_rental\":\"5000\",\"km_limit_per_day\":200,\"extra_km_rate\":\"8\"}")
check "booking starting exactly at the previous return is allowed" "$STATUS" "200"

echo
echo "-- dates --"
STATUS=$(post "bookings.php?action=save" "{\"customer_name\":\"Backwards\",\"phone\":\"9000000003\",
  \"licence_number\":\"TN97\",\"vehicle_id\":$VID,
  \"start_at\":\"2026-07-10 10:00\",\"return_at\":\"2026-07-08 10:00\",
  \"base_rental\":\"5000\",\"km_limit_per_day\":200,\"extra_km_rate\":\"8\"}")
check "return before start refused" "$STATUS" "422"

echo
echo "-- the price freeze --"
# Put the vehicle's price up, then confirm the existing booking is untouched.
post "vehicles.php?action=save" "{\"id\":$VID,\"name\":\"Test Car\",\"brand\":\"Maruti\",\"reg_number\":\"$REG\",
  \"body_type\":\"Hatchback\",\"fuel\":\"Petrol\",\"transmission\":\"Manual\",\"seats\":5,
  \"model_year\":2024,\"colour\":\"#123456\",\"status\":\"Available\",\"current_km\":10000,
  \"rate_daily\":\"4000\",\"km_limit_per_day\":150,\"extra_km_rate\":\"15\",
  \"security_deposit\":\"9000\"}" >/dev/null
get "bookings.php?action=get&id=$BID" >/dev/null
body | grep -q '"total":7500' && ok "the booking's total did not move" || bad "the booking's total did not move" "$(body|head -c 160)"
body | grep -q '"km_limit_per_day":200' && ok "the booking kept its own KM limit" || bad "the booking kept its own KM limit"
body | grep -q '"extra_km_rate":8' && ok "the booking kept its own extra-KM rate" || bad "the booking kept its own extra-KM rate"

echo
echo "-- completing without a return reading --"
STATUS=$(post "bookings.php?action=complete" "{\"id\":$BID}")
check "refused until the vehicle is returned" "$STATUS" "409"
body | grep -q 'odometer' && ok "explains why" || bad "explains why"

echo
echo "-- cancelling --"
STATUS=$(post "bookings.php?action=cancel" "{\"id\":$BID}")
check "cancelling without a reason refused" "$STATUS" "422"
STATUS=$(post "bookings.php?action=cancel" "{\"id\":$BID,\"reason\":\"Customer called off\"}")
check "cancelling with a reason accepted" "$STATUS" "200"
STATUS=$(post "bookings.php?action=cancel" "{\"id\":$BID,\"reason\":\"again\"}")
check "cancelling twice refused" "$STATUS" "409"

echo
echo "-- a cancelled slot frees the vehicle --"
STATUS=$(post "bookings.php?action=save" "{\"customer_name\":\"New Customer\",\"phone\":\"9000000004\",
  \"licence_number\":\"TN96\",\"vehicle_id\":$VID,
  \"start_at\":\"2026-06-01 10:00\",\"return_at\":\"2026-06-04 10:00\",
  \"base_rental\":\"7500\",\"km_limit_per_day\":200,\"extra_km_rate\":\"8\"}")
check "the freed dates can be booked again" "$STATUS" "200"

echo
echo "-- deleting takes its money with it --"
# A booking of its own, with money against it, so what the deletion removes
# can be measured rather than assumed.
STATUS=$(post "bookings.php?action=save" "{\"customer_name\":\"Delete Me\",\"phone\":\"9000000009\",
  \"licence_number\":\"TN0120230099999\",\"vehicle_id\":$VID,
  \"start_at\":\"2026-08-01 10:00\",\"return_at\":\"2026-08-03 10:00\",
  \"base_rental\":\"4000\",\"km_limit_per_day\":200,\"extra_km_rate\":\"8\"}")
check "a booking to delete" "$STATUS" "200"
DID=$(body | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

STATUS=$(post "payments.php?action=add" "{\"booking_id\":$DID,\"kind\":\"advance\",
  \"amount\":\"1500\",\"paid_on\":\"2026-07-20\",\"method\":\"UPI\"}")
check "a payment against it" "$STATUS" "200"
STATUS=$(post "payments.php?action=deposit" "{\"booking_id\":$DID,\"amount\":\"5000\",
  \"received_on\":\"2026-08-01\",\"method\":\"Cash\"}")
check "and a deposit" "$STATUS" "200"
# The whole year, because the summary defaults to this month and the payment
# above is dated outside it.
get "expenses.php?action=summary&from=2026-01-01&to=2026-12-31" >/dev/null
INCOME_BEFORE=$(body | sed -n 's/.*"income":{"total":\([0-9.]*\).*/\1/p')

STATUS=$(post "bookings.php?action=delete" "{\"id\":$DID}")
check "the booking is deleted" "$STATUS" "200"
body | grep -q '"deleted":"NSC-' && ok "and says which one" || bad "and says which one" "$(body | head -c 120)"

STATUS=$(get "bookings.php?action=get&id=$DID")
check "it is really gone" "$STATUS" "404"

get "payments.php?action=list&booking_id=$DID" >/dev/null
body | grep -q '"amount":"1500' && bad "its payments went with it" "the 1,500 is still listed" \
  || ok "its payments went with it"

get "expenses.php?action=summary&from=2026-01-01&to=2026-12-31" >/dev/null
INCOME_AFTER=$(body | sed -n 's/.*"income":{"total":\([0-9.]*\).*/\1/p')
if [ -n "$INCOME_BEFORE" ] && [ -n "$INCOME_AFTER" ]; then
  DROP=$(awk -v a="$INCOME_BEFORE" -v b="$INCOME_AFTER" 'BEGIN{printf "%.2f", a-b}')
  check "income drops by the payment it held" "$DROP" "1500.00"
else
  bad "income drops by the payment it held" "no summary figure to compare"
fi

STATUS=$(post "bookings.php?action=delete" "{\"id\":$DID}")
check "deleting it twice is refused" "$STATUS" "404"

echo
echo "-- listing --"
STATUS=$(get "bookings.php?action=list")
check "list returns 200" "$STATUS" "200"
body | grep -q "$PHONE" && ok "the booking appears in the list" || bad "the booking appears in the list"
get "bookings.php?action=list&status=Cancelled" >/dev/null
body | grep -q '"status":"Cancelled"' && ok "status filter works" || bad "status filter works"

rm -f "$JAR"
echo
echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
