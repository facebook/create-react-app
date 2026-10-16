#!/usr/bin/env bash
#
# Exercises find-panel-dir.sh against a local FTP server whose directory trees
# mirror the shapes this has actually hit on the real host.
#
# Needs python3 with pyftpdlib:  pip install pyftpdlib
# Run from the repository root:  .github/scripts/find-panel-dir.test.sh
#
# The fixture speaks plain FTP, so PANEL_SEARCH_CURL_TLS is emptied for the
# duration. That is the one behaviour these cases cannot cover; everything the
# script decides -- which directory wins, when to refuse -- is exercised here.

set -uo pipefail

script="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/find-panel-dir.sh"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

cat > "$work/server.py" <<'PY'
import sys
from pyftpdlib.authorizers import DummyAuthorizer
from pyftpdlib.handlers import FTPHandler
from pyftpdlib.servers import FTPServer

auth = DummyAuthorizer()
auth.add_user("tester", "secret", sys.argv[1], perm="elradfmw")
FTPHandler.authorizer = auth
FTPServer(("127.0.0.1", int(sys.argv[2])), FTPHandler).serve_forever()
PY

pass=0
fail=0
rc=0
out=""
err=""

run() { # $1 = function that builds the tree under $root
  root="$work/root"
  rm -rf "$root"
  mkdir -p "$root"
  "$1"

  port=$((21000 + RANDOM % 2000))
  python3 "$work/server.py" "$root" "$port" >/dev/null 2>&1 &
  local pid=$!
  for _ in $(seq 40); do
    (exec 3<>/dev/tcp/127.0.0.1/$port) 2>/dev/null && break
    sleep 0.1
  done

  err="$(FTP_SERVER="127.0.0.1:$port" FTP_USERNAME=tester FTP_PASSWORD=secret \
         FTP_REMOTE_DIR="${HINT:-}" PANEL_SEARCH_CURL_TLS= \
         bash "$script" 2>&1 >"$work/out")"
  rc=$?
  out="$(cat "$work/out")"

  kill "$pid" 2>/dev/null
  wait "$pid" 2>/dev/null
}

check() { # $1 = name, $2 = expected exit code, $3 = expected stdout
  if [ "$rc" = "$2" ] && [ "$out" = "$3" ]; then
    echo "  PASS  $1"
    pass=$((pass + 1))
  else
    echo "  FAIL  $1"
    echo "        exit $rc (wanted $2), printed '$out' (wanted '$3')"
    printf '%s\n' "$err" | head -12 | sed 's/^/        | /'
    fail=$((fail + 1))
  fi
}

# The shape the live server actually has: the account lands in the main site's
# web root, and the panel is one folder down among the site's own files.
tree_real() {
  mkdir -p "$root/admin.niteshacars.in/api" "$root/admin.niteshacars.in/src"
  touch "$root/admin.niteshacars.in/config.php" "$root/admin.niteshacars.in/index.php"
  touch "$root/asset-manifest.json" "$root/background car.webp"
}
HINT="/domains/admin.niteshacars.in/public_html/" run tree_real
check "finds the panel despite a stale hint" 0 "admin.niteshacars.in/"

tree_at_root() { touch "$root/config.php" "$root/index.php"; mkdir -p "$root/api"; }
HINT="" run tree_at_root
check "account rooted at the panel itself" 0 "./"

tree_deep() {
  mkdir -p "$root/domains/admin.niteshacars.in/public_html"
  touch "$root/domains/admin.niteshacars.in/public_html/config.php"
}
HINT="" run tree_deep
check "panel three levels down" 0 "domains/admin.niteshacars.in/public_html/"

tree_none() { mkdir -p "$root/images"; touch "$root/index.html"; }
HINT="" run tree_none
check "no panel anywhere: refuses" 1 ""

# Two copies is the state an earlier wrong path leaves behind. Picking one
# would put the deploy back where it started, so it refuses without a hint.
tree_two() {
  mkdir -p "$root/admin.niteshacars.in" "$root/domains/admin.niteshacars.in/public_html"
  touch "$root/admin.niteshacars.in/config.php"
  touch "$root/domains/admin.niteshacars.in/public_html/config.php"
}
HINT="" run tree_two
check "two copies, no hint: refuses" 1 ""

HINT="/domains/admin.niteshacars.in/public_html/" run tree_two
check "two copies, hint breaks the tie" 0 "domains/admin.niteshacars.in/public_html/"

tree_nested() {
  mkdir -p "$root/panel/src"
  touch "$root/panel/config.php" "$root/panel/src/config.php"
}
HINT="" run tree_nested
check "a subfolder cannot shadow the panel" 0 "panel/"

# "background car.webp" is really sitting in that web root, so names with
# spaces are not hypothetical. Unencoded, curl rejects the URL outright and
# the search reports the panel missing.
tree_spaces() {
  mkdir -p "$root/my admin folder"
  touch "$root/my admin folder/config.php" "$root/background car.webp"
}
HINT="" run tree_spaces
check "directory name containing spaces" 0 "my admin folder/"

echo ""
echo "  $pass passed, $fail failed"
[ "$fail" -eq 0 ]
