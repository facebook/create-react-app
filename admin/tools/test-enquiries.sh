#!/usr/bin/env bash
# Enquiries: the public submission endpoint and the admin side that handles
# what comes through it.
#
#   tools/test-enquiries.sh http://127.0.0.1:8210 admin@example.com password
#
# The public endpoint is the only unauthenticated door in the system, so most
# of what follows is about what it refuses.

set -u
BASE="${1:?usage: test-enquiries.sh <base-url> <email> <password>}"
EMAIL="${2:?}"
PASSWORD="${3:?}"
JAR="$(mktemp)"
PASS=0; FAIL=0
STAMP="$(date +%d%H%M%S)"

ok()   { PASS=$((PASS+1)); echo "  ok    $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  FAIL  $1${2:+ — $2}"; }
check(){ if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "expected $3, got $2"; fi; }
has()  { if body | grep -q "$2"; then ok "$1"; else bad "$1" "$(body | head -c 160)"; fi; }
hasnt(){ if body | grep -q "$2"; then bad "$1" "found $2"; else ok "$1"; fi; }
body() { cat /tmp/eq_body; }

# Public submission — no session, no CSRF token, as a stranger's browser sends it.
submit() {
  printf '%s' "$1" > /tmp/eq_payload
  curl -s -o /tmp/eq_body -w '%{http_code}' -X POST \
    -H 'Content-Type: application/json' ${2:+-H "Origin: $2"} \
    --data-binary @/tmp/eq_payload "$BASE/api/enquiry-submit.php"
}
post() {
  printf '%s' "$2" > /tmp/eq_payload
  curl -s -o /tmp/eq_body -w '%{http_code}' -b "$JAR" -X POST \
    -H 'Content-Type: application/json' -H "X-CSRF-Token: $TOKEN" \
    --data-binary @/tmp/eq_payload "$BASE/api/$1"
}
get() { curl -s -o /tmp/eq_body -w '%{http_code}' -b "$JAR" "$BASE/api/$1"; }

# Every local suite posts from 127.0.0.1 and shares one throttle window, so
# the window is cleared first; the flood below then exercises it deliberately.
# If it cannot reach the database it says so and this stops, rather than
# every submission below being refused for a reason nothing explains.
php "$(dirname "$0")/clear-enquiry-throttle.php" >/dev/null || {
  echo "  FAIL  the rate-limit window could not be cleared"
  exit 1
}

echo
echo "-- the public form --"
check "a valid enquiry is accepted" \
  "$(submit "{\"name\":\"Priya S\",\"phone\":\"98765 43210\",\"email\":\"priya@example.com\",
     \"message\":\"Need a car for a wedding\",\"pickup_location\":\"Nagercoil\"}")" "201"
has "an enquiry number comes back" '"enquiry_number":"ENQ-'
ENQ=$(body | sed -n 's/.*"enquiry_number":"\([^"]*\)".*/\1/p')
hasnt "nothing about the business leaks back" 'vehicle_name'

check "a missing name is refused"  "$(submit '{"phone":"9876543210"}')" "422"
check "a missing phone is refused" "$(submit '{"name":"No Phone"}')" "422"
check "a short phone is refused"   "$(submit '{"name":"X","phone":"12345"}')" "422"
has  "the phone message is clear"  'valid phone number'
check "a bad email is refused"     "$(submit '{"name":"X","phone":"9876543210","email":"not-an-email"}')" "422"
check "a return before the start is refused" \
  "$(submit '{"name":"X","phone":"9876543210","start_date":"2026-12-10","return_date":"2026-12-01"}')" "422"

echo
echo "-- defences --"
# The honeypot is invisible to people, so anything filling it is automated.
check "a honeypot submission looks accepted" \
  "$(submit '{"name":"Bot","phone":"9876543210","website":"http://spam.example"}')" "200"
has "but no enquiry number is issued" '"enquiry_number":null'

check "a post from another site is refused" \
  "$(submit '{"name":"Evil","phone":"9876543210"}' 'https://not-your-site.example')" "403"
check "a post from the real site is accepted" \
  "$(submit "{\"name\":\"Origin OK $STAMP\",\"phone\":\"9876543211\"}" 'https://niteshacars.in')" "201"

echo
echo "-- rate limiting --"
LIMITED=no
for i in 1 2 3 4 5 6 7; do
  CODE=$(submit "{\"name\":\"Flood $i\",\"phone\":\"98765432$i$i\"}")
  [ "$CODE" = "429" ] && LIMITED=yes && break
done
[ "$LIMITED" = "yes" ] && ok "a flood is cut off" || bad "a flood is cut off" "seven went through"
has "and says what to do instead" 'call us'

echo
echo "-- the admin side --"
TOKEN=$(curl -s -c "$JAR" "$BASE/index.php" | grep -o 'name="csrf_token" value="[^"]*"' | sed 's/.*value="//;s/"//')
curl -s -b "$JAR" -c "$JAR" -o /dev/null -X POST \
  -d "csrf_token=$TOKEN&email=$EMAIL&password=$PASSWORD" "$BASE/index.php"
TOKEN=$(curl -s -b "$JAR" -c "$JAR" "$BASE/dashboard.php" | grep -o 'name="csrf-token" content="[^"]*"' | sed 's/.*content="//;s/"//')

check "listing without a session is refused" \
  "$(curl -s -o /tmp/eq_body -w '%{http_code}' "$BASE/api/enquiries.php?action=list")" "401"

check "the admin can list enquiries" "$(get 'enquiries.php?action=list')" "200"
has "the wedding enquiry is there" 'Priya S'
hasnt "the honeypot submission was never stored" '"name":"Bot"'

get "enquiries.php?action=list&q=Priya" >/dev/null
has "search finds it by name" 'Priya S'
get "enquiries.php?action=list&status=New" >/dev/null
has "filtering by status works" '"status":"New"'

EID=$(curl -s -b "$JAR" "$BASE/api/enquiries.php?action=list&q=Priya" \
  | tr '{' '\n' | grep 'Priya S' | sed -n 's/.*"id":\([0-9]*\).*/\1/p' | head -1)

echo
echo "-- handling it --"
check "marking as contacted" "$(post 'enquiries.php?action=status' "{\"id\":$EID,\"status\":\"Contacted\",\"note\":\"Called, wants a Swift\"}")" "200"
check "rejecting without a reason is refused" "$(post 'enquiries.php?action=status' "{\"id\":$EID,\"status\":\"Rejected\"}")" "422"
has  "and says why a reason matters" 'explained later'
check "adding a note" "$(post 'enquiries.php?action=note' "{\"id\":$EID,\"note\":\"Prefers automatic\"}")" "200"
get "enquiries.php?action=get&id=$EID" >/dev/null
has "the notes are kept" 'wants a Swift'
has "and appended to, not replaced" 'Prefers automatic'

echo
echo "-- converting to a booking --"
REG="EQ$STAMP"
post "vehicles.php?action=save" "{\"name\":\"Enquiry Car\",\"brand\":\"Maruti\",\"reg_number\":\"$REG\",
  \"body_type\":\"Hatchback\",\"fuel\":\"Petrol\",\"transmission\":\"Manual\",\"seats\":5,
  \"model_year\":2024,\"colour\":\"#334455\",\"status\":\"Available\",\"current_km\":20000,
  \"rate_daily\":\"2400\",\"km_limit_per_day\":180,\"extra_km_rate\":\"7\",
  \"security_deposit\":\"4000\"}" >/dev/null
VID=$(body | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

check "converting creates a booking" \
  "$(post 'enquiries.php?action=convert' "{\"id\":$EID,\"vehicle_id\":$VID,
     \"start_at\":\"2026-12-01 10:00\",\"return_at\":\"2026-12-03 10:00\",
     \"base_rental\":\"4800\",\"licence_number\":\"TN0120230055555\",\"address\":\"Nagercoil\"}")" "200"
has "a booking number is issued" '"booking_number":"NSC-'
BNUM=$(body | sed -n 's/.*"booking_number":"\([^"]*\)".*/\1/p')
echo "        $ENQ  ->  $BNUM"

get "enquiries.php?action=get&id=$EID" >/dev/null
has "the enquiry is marked Converted" '"status":"Converted"'
has "and links to the booking" "$BNUM"

check "converting a second time is refused" \
  "$(post 'enquiries.php?action=convert' "{\"id\":$EID,\"vehicle_id\":$VID,
     \"start_at\":\"2027-01-01 10:00\",\"return_at\":\"2027-01-03 10:00\",
     \"base_rental\":\"4800\",\"licence_number\":\"TN01\"}")" "409"
has "and says which booking it became" "$BNUM"

check "a converted enquiry cannot be re-statused" \
  "$(post 'enquiries.php?action=status' "{\"id\":$EID,\"status\":\"Pending\"}")" "409"

echo
echo "-- the booking carries the enquiry across --"
get "bookings.php?action=list" >/dev/null
has "the booking exists" "$BNUM"
has "under the customer's name" 'Priya S'

rm -f "$JAR"
echo
echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
