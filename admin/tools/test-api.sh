#!/usr/bin/env bash
# Exercises the JSON API over real HTTP, as a browser would.
#
#   tools/test-api.sh http://127.0.0.1:8210 admin@example.com password
#
# Checks that the endpoints refuse unauthenticated and unauthorised callers
# before checking that they work for a permitted one.

set -u
BASE="${1:?usage: test-api.sh <base-url> <email> <password>}"
EMAIL="${2:?}"
PASSWORD="${3:?}"
JAR="$(mktemp)"
PASS=0; FAIL=0
# Registration numbers are unique for the life of the record, so each run
# uses its own rather than trying to reuse or delete the last one.
REG="TS$(date +%d%H%M%S)"

ok()   { PASS=$((PASS+1)); echo "  ok    $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  FAIL  $1${2:+ — $2}"; }
check(){ if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "expected $3, got $2"; fi; }

code() { curl -s -o /tmp/api_body -w '%{http_code}' "$@"; }
body() { cat /tmp/api_body; }

echo
echo "-- unauthenticated access --"
check "listing vehicles without a session is refused" \
  "$(code "$BASE/api/vehicles.php?action=list")" "401"
# CSRF is checked before the session, so an anonymous write is refused with
# 419 rather than 401. Either is a refusal; what matters is that it never
# reaches the database.
SAVE_ANON=$(code -X POST -H 'Content-Type: application/json' -d '{"name":"X"}' "$BASE/api/vehicles.php?action=save")
if [ "$SAVE_ANON" = "401" ] || [ "$SAVE_ANON" = "419" ]; then
  ok "saving without a session is refused ($SAVE_ANON)"
else
  bad "saving without a session is refused" "got $SAVE_ANON"
fi

echo
echo "-- sign in --"
TOKEN=$(curl -s -c "$JAR" "$BASE/index.php" | grep -o 'name="csrf_token" value="[^"]*"' | sed 's/.*value="//;s/"//')
LOGIN=$(curl -s -b "$JAR" -c "$JAR" -o /dev/null -w '%{http_code}' -X POST \
  -d "csrf_token=$TOKEN&email=$EMAIL&password=$PASSWORD" "$BASE/index.php")
check "sign in redirects" "$LOGIN" "302"
TOKEN=$(curl -s -b "$JAR" -c "$JAR" "$BASE/index.php" 2>/dev/null | grep -o 'name="csrf_token" value="[^"]*"' | sed 's/.*value="//;s/"//')
# After signing in, index.php redirects; pull the token from the dashboard.
TOKEN=$(curl -s -b "$JAR" -c "$JAR" "$BASE/dashboard.php" | grep -o 'name="csrf-token" content="[^"]*"' | sed 's/.*content="//;s/"//')
[ -n "$TOKEN" ] && ok "csrf token available to the page" || bad "csrf token available to the page"

echo
echo "-- csrf --"
check "POST without a csrf token is refused" \
  "$(code -b "$JAR" -X POST -H 'Content-Type: application/json' \
      -d '{"name":"X"}' "$BASE/api/vehicles.php?action=save")" "419"

echo
echo "-- validation --"
STATUS=$(code -b "$JAR" -X POST -H 'Content-Type: application/json' -H "X-CSRF-Token: $TOKEN" \
  -d '{"name":"","brand":"","reg_number":"","rate_daily":"-5"}' "$BASE/api/vehicles.php?action=save")
check "incomplete vehicle is rejected" "$STATUS" "422"
echo "$(body)" | grep -q '"name"' && ok "missing name is reported" || bad "missing name is reported"
echo "$(body)" | grep -q 'negative' && ok "negative rate is reported" || bad "negative rate is reported"

echo
echo "-- create --"
STATUS=$(code -b "$JAR" -X POST -H 'Content-Type: application/json' -H "X-CSRF-Token: $TOKEN" -d '{
  "name":"Swift — VXi","brand":"Maruti","reg_number":"'"$REG"'","body_type":"Hatchback",
  "fuel":"Petrol","transmission":"Manual","seats":5,"model_year":2023,"colour":"#D6473C",
  "status":"Available","current_km":42000,"rate_daily":"2500","rate_7day":"16000",
  "rate_15day":"30000","rate_30day":"55000","km_limit_per_day":200,
  "extra_km_rate":"8","security_deposit":"5000"}' "$BASE/api/vehicles.php?action=save")
check "vehicle created" "$STATUS" "200"
VID=$(body | sed -n 's/.*"id":\([0-9]*\).*/\1/p')
body | grep -q "\"reg_number\":\"$REG\"" && ok "registration normalised and stored" || bad "registration normalised" "$(body | head -c 140)"
body | grep -q '"rate_daily":2500' && ok "daily rate stored" || bad "daily rate stored"

echo
echo "-- duplicate registration --"
STATUS=$(code -b "$JAR" -X POST -H 'Content-Type: application/json' -H "X-CSRF-Token: $TOKEN" -d '{
  "name":"Another","brand":"Maruti","reg_number":"'"$REG"'","body_type":"Hatchback",
  "fuel":"Petrol","transmission":"Manual","seats":5,"model_year":2023,"colour":"#111111",
  "status":"Available","current_km":0,"rate_daily":"1000","km_limit_per_day":200,
  "extra_km_rate":"5","security_deposit":"1000"}' "$BASE/api/vehicles.php?action=save")
check "duplicate registration refused" "$STATUS" "422"

echo
echo "-- list --"
STATUS=$(code -b "$JAR" "$BASE/api/vehicles.php?action=list")
check "list returns 200" "$STATUS" "200"
body | grep -q "$REG" && ok "created vehicle appears in the list" || bad "created vehicle appears in the list"

echo
echo "-- rate history --"
# Saving the vehicle again with identical pricing must not add a rate row,
# otherwise the rate history fills with noise and stops explaining anything.
save_vehicle() {
  printf '{"id":%s,"name":"Swift — VXi","brand":"Maruti","reg_number":"%s","body_type":"Hatchback","fuel":"Petrol","transmission":"Manual","seats":5,"model_year":2023,"colour":"#D6473C","status":"Available","current_km":%s,"rate_daily":"%s","rate_7day":"16000","rate_15day":"30000","rate_30day":"55000","km_limit_per_day":200,"extra_km_rate":"8","security_deposit":"5000"}' "$VID" "$REG" "$2" "$1" > /tmp/api_payload
  curl -s -o /tmp/api_body -w '%{http_code}' -b "$JAR" -X POST \
    -H 'Content-Type: application/json' -H "X-CSRF-Token: $TOKEN" \
    --data-binary @/tmp/api_payload "$BASE/api/vehicles.php?action=save"
}
check "edit with unchanged pricing accepted" "$(save_vehicle 2500 42500)" "200"
check "edit with a new daily rate accepted"  "$(save_vehicle 2800 42600)" "200"
body | grep -q '"rate_daily":2800' && ok "new rate is returned" || bad "new rate is returned"

echo
echo "-- retire --"
STATUS=$(code -b "$JAR" -X POST -H 'Content-Type: application/json' -H "X-CSRF-Token: $TOKEN" \
  -d "{\"id\":$VID,\"reason\":\"Sold\"}" "$BASE/api/vehicles.php?action=retire")
check "vehicle retired" "$STATUS" "200"
STATUS=$(code -b "$JAR" "$BASE/api/vehicles.php?action=list")
body | grep -q "$REG" && bad "retired vehicle hidden from the default list" || ok "retired vehicle hidden from the default list"
curl -s -b "$JAR" "$BASE/api/vehicles.php?action=list&include_inactive=1" | grep -q "$REG" \
  && ok "retired vehicle still visible when asked for" || bad "retired vehicle still visible when asked for"

rm -f "$JAR"
echo
echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
