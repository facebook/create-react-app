#!/usr/bin/env bash
#
# Checks that the generated config.php is valid PHP and carries the values
# through intact -- including the ones that break naive quoting.
#
# Needs php-cli. Run from the repository root.

set -uo pipefail

script="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/write-admin-config.sh"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

pass=0
fail=0

check() { # name, password, expected-read-back
  local name="$1" password="$2"
  local out="$work/config.php"

  DB_HOST=localhost DB_NAME=u123_db DB_USER=u123_user DB_PASSWORD="$password" \
    bash "$script" "$out" >/dev/null 2>&1

  if ! php -l "$out" >/dev/null 2>&1; then
    echo "  FAIL  $name — generated file is not valid PHP"
    php -l "$out" 2>&1 | head -3 | sed 's/^/        /'
    fail=$((fail + 1))
    return
  fi

  # Read it back the way the panel does, and compare to what went in.
  local got
  got="$(php -r '$c = require $argv[1]; echo $c["db"]["password"];' "$out" 2>/dev/null)"
  if [ "$got" = "$password" ]; then
    echo "  PASS  $name"
    pass=$((pass + 1))
  else
    echo "  FAIL  $name — read back [$got], expected [$password]"
    fail=$((fail + 1))
  fi
}

check "ordinary password"          'Str0ngPass'
check "apostrophe"                 "it's-a-pass'word"
check "backslash"                  'back\slash\\double'
check "both, adjacent"             "\\'mixed\\'"
check "dollar and braces"          'a$b${c}d`e`'
check "double quotes"              'say "hello" now'
check "leading and trailing space" '  padded  '
check "unicode"                    'pässwörd-தமிழ்'

# The structural fields must survive too, not just the password.
out="$work/config.php"
DB_HOST=db.example.net DB_NAME=mydb DB_USER=myuser DB_PASSWORD=pw \
  PUBLIC_SITE_ORIGIN='https://a.test, https://b.test' HTTPS_ONLY=true \
  bash "$script" "$out" >/dev/null 2>&1
shape="$(php -r '
  $c = require $argv[1];
  echo $c["db"]["host"], "|", $c["db"]["name"], "|",
       implode(",", $c["public_site_origin"]), "|",
       var_export($c["https_only"], true), "|",
       $c["session_idle_minutes"];
' "$out" 2>/dev/null)"
want='db.example.net|mydb|https://a.test,https://b.test|true|120'
if [ "$shape" = "$want" ]; then
  echo "  PASS  host, name, origins, https_only and idle carry through"
  pass=$((pass + 1))
else
  echo "  FAIL  structure — got [$shape], wanted [$want]"
  fail=$((fail + 1))
fi

# The panel reads storage_path as a path relative to its own directory.
if php -r '$c = require $argv[1]; exit(str_ends_with($c["storage_path"], "/../nitesha-storage") ? 0 : 1);' "$out"; then
  echo "  PASS  storage_path resolves relative to the panel"
  pass=$((pass + 1))
else
  echo "  FAIL  storage_path did not resolve as expected"
  fail=$((fail + 1))
fi

# A public build log must never carry the password.
log="$(DB_NAME=d DB_USER=u DB_PASSWORD='SUPERSECRET123' bash "$script" "$work/c2.php" 2>&1)"
if printf '%s' "$log" | grep -q 'SUPERSECRET123'; then
  echo "  FAIL  the password appeared in the script's own output"
  fail=$((fail + 1))
else
  echo "  PASS  nothing sensitive is printed"
  pass=$((pass + 1))
fi

echo ""
echo "  $pass passed, $fail failed"
[ "$fail" -eq 0 ]
