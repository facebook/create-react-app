#!/usr/bin/env bash
# Expenses and the finance summary.
#
#   tools/test-expenses.sh http://127.0.0.1:8210 admin@example.com password
#
# The point of most of this is that money already recorded cannot be quietly
# changed: expenses are added, corrected by a further row, or voided with a
# reason — never edited, never deleted.

set -u
BASE="${1:?usage: test-expenses.sh <base-url> <email> <password>}"
EMAIL="${2:?}"
PASSWORD="${3:?}"
JAR="$(mktemp)"
PASS=0; FAIL=0
TODAY="$(date +%Y-%m-%d)"
MONTH_START="$(date +%Y-%m-01)"
STAMP="$(date +%d%H%M%S)"

ok()   { PASS=$((PASS+1)); echo "  ok    $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  FAIL  $1${2:+ — $2}"; }
check(){ if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "expected $3, got $2"; fi; }
body() { cat /tmp/ex_body; }
has()  { if body | grep -q "$2"; then ok "$1"; else bad "$1" "$(body | head -c 200)"; fi; }
hasnt(){ if body | grep -q "$2"; then bad "$1" "found $2"; else ok "$1"; fi; }

post() {
  printf '%s' "$2" > /tmp/ex_payload
  curl -s -o /tmp/ex_body -w '%{http_code}' -b "$JAR" -X POST \
    -H 'Content-Type: application/json' -H "X-CSRF-Token: $TOKEN" \
    --data-binary @/tmp/ex_payload "$BASE/api/$1"
}
get() { curl -s -o /tmp/ex_body -w '%{http_code}' -b "$JAR" "$BASE/api/$1"; }

# Reads one figure out of the summary by path, e.g. expenses.total. Parsed
# properly rather than grepped: the first "total" in the JSON belongs to
# income, and a test that quietly measures the wrong number is worse than none.
field() { python3 -c 'import json,sys
d=json.load(open("/tmp/ex_body"))
for k in sys.argv[1].split("."): d=d[k]
print(d)' "$1"; }

# What has been spent in the period so far. Other runs leave rows behind, so
# the assertions below are about the change this run causes, not a fixed total.
spent() { get "expenses.php?action=summary&from=$MONTH_START&to=$TODAY" >/dev/null; field expenses.total; }

echo
echo "-- signing in --"
TOKEN=$(curl -s -c "$JAR" "$BASE/index.php" | grep -o 'name="csrf_token" value="[^"]*"' | sed 's/.*value="//;s/"//')
curl -s -b "$JAR" -c "$JAR" -o /dev/null -X POST \
  -d "csrf_token=$TOKEN&email=$EMAIL&password=$PASSWORD" "$BASE/index.php"
TOKEN=$(curl -s -b "$JAR" -c "$JAR" "$BASE/dashboard.php" | grep -o 'name="csrf-token" content="[^"]*"' | sed 's/.*content="//;s/"//')

check "listing without a session is refused" \
  "$(curl -s -o /tmp/ex_body -w '%{http_code}' "$BASE/api/expenses.php?action=list")" "401"

echo
echo "-- recording an expense --"
BEFORE=$(spent)
post "vehicles.php?action=save" "{\"name\":\"Expense Car\",\"brand\":\"Maruti\",\"reg_number\":\"EX$STAMP\",
  \"body_type\":\"Hatchback\",\"fuel\":\"Petrol\",\"transmission\":\"Manual\",\"seats\":5,
  \"model_year\":2024,\"colour\":\"#445566\",\"status\":\"Available\",\"current_km\":15000,
  \"rate_daily\":\"2000\",\"km_limit_per_day\":150,\"extra_km_rate\":\"6\",
  \"security_deposit\":\"3000\"}" >/dev/null
VID=$(body | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

check "a fuel expense is accepted" \
  "$(post 'expenses.php?action=save' "{\"amount\":\"2500\",\"spent_on\":\"$TODAY\",
     \"category\":\"Fuel\",\"method\":\"UPI\",\"vendor\":\"Indian Oil\",
     \"description\":\"Full tank\",\"vehicle_id\":$VID}")" "200"
has "an expense number is issued" '"expense_number":"EXP-'
EXP1=$(body | sed -n 's/.*"id":\([0-9]*\).*/\1/p')
EXPNUM=$(body | sed -n 's/.*"expense_number":"\([^"]*\)".*/\1/p')

check "a zero expense is refused" \
  "$(post 'expenses.php?action=save' "{\"amount\":\"0\",\"spent_on\":\"$TODAY\",\"category\":\"Fuel\",\"method\":\"Cash\"}")" "422"
has "and says why" 'not worth recording'

check "an expense dated in the future is refused" \
  "$(post 'expenses.php?action=save' "{\"amount\":\"500\",\"spent_on\":\"2099-01-01\",\"category\":\"Fuel\",\"method\":\"Cash\"}")" "422"
has "and explains" 'cannot be dated in the future'

check "an unknown category is refused" \
  "$(post 'expenses.php?action=save' "{\"amount\":\"500\",\"spent_on\":\"$TODAY\",\"category\":\"Bribes\",\"method\":\"Cash\"}")" "422"

check "an unknown vehicle is refused" \
  "$(post 'expenses.php?action=save' "{\"amount\":\"500\",\"spent_on\":\"$TODAY\",\"category\":\"Fuel\",
     \"method\":\"Cash\",\"vehicle_id\":999999}")" "404"

echo
echo "-- it shows up --"
get "expenses.php?action=list&from=$MONTH_START&to=$TODAY" >/dev/null
has "the expense is listed" "$EXPNUM"
has "with the vendor" 'Indian Oil'
has "and the vehicle it was for" 'Expense Car'

echo
echo "-- correcting it: the original figure stands --"
# The fuel was 2,500 but the bill was 2,800: the difference is its own row.
check "a correction is accepted" \
  "$(post 'expenses.php?action=correct' "{\"corrects_id\":$EXP1,\"amount\":\"300\",
     \"reason\":\"Bill was 2800, not 2500\"}")" "200"
has "the correction gets its own number" '"expense_number":"EXP-'

get "expenses.php?action=list&from=$MONTH_START&to=$TODAY" >/dev/null
has "the original is still there, untouched" '"amount":2500'
has "and so is the adjustment" '"amount":300'
has "which says what it corrects" "\"corrects_number\":\"$EXPNUM\""

check "a correction of zero is refused" \
  "$(post 'expenses.php?action=correct' "{\"corrects_id\":$EXP1,\"amount\":\"0\",\"reason\":\"x\"}")" "422"
check "a correction without a reason is refused" \
  "$(post 'expenses.php?action=correct' "{\"corrects_id\":$EXP1,\"amount\":\"100\"}")" "422"
# An expense entered too high. The comment beside this endpoint always said
# negative was allowed; the shared amount validator refused it, so until now
# a figure could only ever be corrected upwards.
check "a correction of -300 is accepted" \
  "$(post 'expenses.php?action=correct' "{\"corrects_id\":$EXP1,\"amount\":\"-300\",
     \"reason\":\"Put the 300 on twice\"}")" "200"
# Taken back off, so the totals the rest of this file asserts still hold.
post 'expenses.php?action=correct' "{\"corrects_id\":$EXP1,\"amount\":\"300\",
  \"reason\":\"The 300 was right after all\"}" >/dev/null

echo
echo "-- the summary adds up --"
# 2,500 recorded plus a 300 correction is 2,800 more spent than before.
AFTER=$(spent)
RISE=$(python3 -c "print(round(float('$AFTER') - float('$BEFORE'), 2))")
check "the correction moves the total by 300, not 2,800 twice" "$RISE" "2800.0"
has "broken down by category" '"category":"Fuel"'
has "and by vehicle" '"vehicle_id":'

echo
echo "-- deposits are never counted as income --"
has "deposits are reported separately" '"deposits":'
hasnt "and not folded into income" '"income":{"total":0,"deposits"'

echo
echo "-- approval --"
check "an expense can be approved" \
  "$(post 'expenses.php?action=approve' "{\"id\":$EXP1,\"state\":\"approved\"}")" "200"
check "approving twice is refused" \
  "$(post 'expenses.php?action=approve' "{\"id\":$EXP1,\"state\":\"approved\"}")" "409"
has "and says what it already was" 'already approved'

post "expenses.php?action=save" "{\"amount\":\"900\",\"spent_on\":\"$TODAY\",
  \"category\":\"Repairs\",\"method\":\"Cash\",\"description\":\"To be rejected\"}" >/dev/null
EXP2=$(body | sed -n 's/.*"id":\([0-9]*\).*/\1/p')
check "rejecting without a reason is refused" \
  "$(post 'expenses.php?action=approve' "{\"id\":$EXP2,\"state\":\"rejected\"}")" "422"
has "and asks for one" 'why it was rejected'
check "rejecting with a reason works" \
  "$(post 'expenses.php?action=approve' "{\"id\":$EXP2,\"state\":\"rejected\",\"reason\":\"Personal, not business\"}")" "200"

echo
echo "-- voiding --"
check "voiding without a reason is refused" \
  "$(post 'expenses.php?action=void' "{\"id\":$EXP2}")" "422"
check "voiding with a reason works" \
  "$(post 'expenses.php?action=void' "{\"id\":$EXP2,\"reason\":\"Recorded twice\"}")" "200"
check "voiding twice is refused" \
  "$(post 'expenses.php?action=void' "{\"id\":$EXP2,\"reason\":\"again\"}")" "409"
check "a voided expense cannot be corrected" \
  "$(post 'expenses.php?action=correct' "{\"corrects_id\":$EXP2,\"amount\":\"50\",\"reason\":\"x\"}")" "409"

get "expenses.php?action=list&from=$MONTH_START&to=$TODAY" >/dev/null
hasnt "a voided expense drops out of the list" 'To be rejected'
get "expenses.php?action=list&from=$MONTH_START&to=$TODAY&include_voided=1" >/dev/null
has "but is still on file when asked for" 'To be rejected'
has "with the reason it was voided" 'Recorded twice'

VOIDED=$(spent)
STILL=$(python3 -c "print(round(float('$VOIDED') - float('$BEFORE'), 2))")
check "the voided 900 is back out of the total" "$STILL" "2800.0"

echo
echo "-- a range with nothing in it --"
get "expenses.php?action=summary&from=2001-01-01&to=2001-01-31" >/dev/null
has "reports zero rather than failing" '"total":0'

rm -f "$JAR"
echo
echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
