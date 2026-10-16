#!/usr/bin/env bash
# What the website is allowed to see.
#
#   tools/test-public.sh http://127.0.0.1:8210 admin@example.com password
#
# api/public-vehicles.php and api/public-availability.php are the only doors
# the fleet goes out through, and they need no sign-in. Everything the site
# shows about a car comes through here, so what they leave out matters as much
# as what they return.

set -u
BASE="${1:?usage: test-public.sh <base-url> <email> <password>}"
EMAIL="${2:?}"
PASSWORD="${3:?}"
JAR="$(mktemp)"
PASS=0; FAIL=0
STAMP="$(date +%d%H%M%S)"

ok()   { PASS=$((PASS+1)); echo "  ok    $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  FAIL  $1${2:+ — $2}"; }
check(){ if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "expected $3, got $2"; fi; }
code() { curl -s -o /tmp/pub_body -w '%{http_code}' "$@"; }
body() { cat /tmp/pub_body; }

# As a stranger's browser asks: no cookie, no token.
public() { curl -s "$BASE/api/$1"; }

echo
echo "-- sign in --"
TOKEN=$(curl -s -c "$JAR" "$BASE/index.php" | grep -o 'name="csrf_token" value="[^"]*"' | sed 's/.*value="//;s/"//')
curl -s -b "$JAR" -c "$JAR" -o /dev/null -X POST \
  -d "csrf_token=$TOKEN&email=$EMAIL&password=$PASSWORD" "$BASE/index.php"
TOKEN=$(curl -s -b "$JAR" -c "$JAR" "$BASE/dashboard.php" | grep -o 'name="csrf-token" content="[^"]*"' | sed 's/.*content="//;s/"//')
[ -n "$TOKEN" ] && ok "signed in" || bad "signed in"

# One of ours, and one brought in from another owner for a hire or two.
save_car() {
  printf '{"name":"%s","brand":"Maruti","reg_number":"%s","body_type":"Hatchback",
    "fuel":"Petrol","transmission":"Manual","seats":5,"model_year":2024,"colour":"#123456",
    "status":"%s","current_km":77777,"ownership":"%s","owner_name":"%s","is_temporary":%s,
    "rate_daily":"2400","km_limit_per_day":200,"extra_km_rate":"8","security_deposit":"5000"}' \
    "$1" "$2" "$3" "$4" "$5" "$6" > /tmp/pub_payload
  code -b "$JAR" -X POST -H 'Content-Type: application/json' -H "X-CSRF-Token: $TOKEN" \
    --data-binary @/tmp/pub_payload "$BASE/api/vehicles.php?action=save"
}

echo
echo "-- a car of ours --"
OURS_REG="PB$STAMP"
check "saved" "$(save_car "Ours $STAMP" "$OURS_REG" Available own "" 0)" "200"
public public-vehicles.php | grep -q "Ours $STAMP" \
  && ok "it is on the website" || bad "it is on the website"

echo
echo "-- a temporary car --"
TEMP_REG="PT$STAMP"
check "saved" "$(save_car "Temp $STAMP" "$TEMP_REG" Available partner "Ravi Anna" 1)" "200"
body | grep -q '"is_temporary":true' && ok "stored as temporary" || bad "stored as temporary" "$(body | head -c 160)"
TEMP_ID=$(body | sed -n 's/.*"id":\([0-9]*\).*/\1/p' | head -1)

public public-vehicles.php | grep -q "Temp $STAMP" \
  && bad "it is kept off the website" "the site is advertising it" \
  || ok "it is kept off the website"

# The whole point: out of the shop window, still in the business.
curl -s -b "$JAR" "$BASE/api/vehicles.php?action=list" | grep -q "Temp $STAMP" \
  && ok "but it is still in the panel's own fleet" || bad "but it is still in the panel's own fleet"
curl -s -b "$JAR" "$BASE/api/vehicles.php?action=list" | grep -q "\"id\":$TEMP_ID" \
  && ok "so a booking can be made against it" || bad "so a booking can be made against it"

echo
echo "-- a car that is out on hire --"
# The site is a catalogue, not an availability board: a car out this morning
# is still a car the business rents, and hiding it loses next week's enquiry.
# Which days it is free is the availability endpoint's job, not this one's.
RENT_REG="PR$STAMP"
check "saved" "$(save_car "OnHire $STAMP" "$RENT_REG" "On Rental" own "" 0)" "200"
public public-vehicles.php | grep -q "OnHire $STAMP" \
  && ok "it is still on the website" || bad "it is still on the website"

echo
echo "-- a car in for work, and a retired one --"
MAINT_REG="PM$STAMP"
check "saved" "$(save_car "InShop $STAMP" "$MAINT_REG" Maintenance own "" 0)" "200"
public public-vehicles.php | grep -q "InShop $STAMP" \
  && bad "a car in for work stays off" "the site is advertising it" \
  || ok "a car in for work stays off"

DEAD_REG="PD$STAMP"
check "saved" "$(save_car "Gone $STAMP" "$DEAD_REG" Inactive own "" 0)" "200"
public public-vehicles.php | grep -q "Gone $STAMP" \
  && bad "an inactive car stays off" "the site is advertising it" \
  || ok "an inactive car stays off"

echo
echo "-- the fleet count the date boxes use --"
AVAIL=$(public public-availability.php)
FLEET_WITH=$(printf '%s' "$AVAIL" | sed -n 's/.*"fleet":\([0-9]*\).*/\1/p')
# Retiring our listed car must drop the count by one; the temporary one was
# never in it, so retiring that changes nothing.
code -b "$JAR" -X POST -H 'Content-Type: application/json' -H "X-CSRF-Token: $TOKEN" \
  -d "{\"id\":$TEMP_ID,\"reason\":\"Hire over\"}" "$BASE/api/vehicles.php?action=retire" >/dev/null
FLEET_AFTER=$(public public-availability.php | sed -n 's/.*"fleet":\([0-9]*\).*/\1/p')
check "retiring a temporary car does not change it" "$FLEET_AFTER" "$FLEET_WITH"

echo
echo "-- what never goes out --"
OUT=$(public public-vehicles.php)
for secret in reg_number "$OURS_REG" current_km 77777 colour created_by; do
  printf '%s' "$OUT" | grep -q "$secret" \
    && bad "$secret stays in the panel" || ok "$secret stays in the panel"
done

echo
echo "-- a car nobody could hire today --"
MAINT_REG="PM$STAMP"
check "saved under maintenance" "$(save_car "Maint $STAMP" "$MAINT_REG" Maintenance own "" 0)" "200"
public public-vehicles.php | grep -q "Maint $STAMP" \
  && bad "it is not advertised" || ok "it is not advertised"

echo
echo "-- the doors themselves --"
check "the fleet needs no sign-in"        "$(code "$BASE/api/public-vehicles.php")" "200"
check "availability needs no sign-in"     "$(code "$BASE/api/public-availability.php")" "200"
check "the fleet is read-only"            "$(code -X POST "$BASE/api/public-vehicles.php")" "405"
check "availability is read-only"         "$(code -X POST "$BASE/api/public-availability.php")" "405"

rm -f "$JAR"
echo
echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
