#!/usr/bin/env bash
#
# Finds the directory that holds the admin panel, by looking for config.php.
#
# Why this exists: an FTP path is walked from the account's *login* directory,
# which is not the filesystem root. The path hPanel's File Manager shows --
# /home/uNNNNNNN/domains/.../public_html/admin -- is therefore not the path the
# deploy needs, and there is no way to convert one into the other from the
# outside. Every attempt to guess it cost a round trip through a human, and the
# guesses that "worked" were worse than the ones that failed: the deploy action
# creates directories it cannot find, so a wrong path silently produced a second
# copy of the whole panel in a folder nobody serves.
#
# So stop guessing and go look. config.php is the fingerprint: it holds the
# database password, it is gitignored, and no deploy has ever written it -- so
# it exists only where the panel was really installed.
#
# Prints the panel's path, relative to the login directory and with a trailing
# slash, on stdout. Everything else goes to stderr, so the caller can capture
# the path alone. Exits non-zero if there is not exactly one answer.
#
# Directory names go to the log; credentials never do. This repository is
# public.

set -uo pipefail

: "${FTP_SERVER:?FTP_SERVER is not set}"
: "${FTP_USERNAME:?FTP_USERNAME is not set}"
: "${FTP_PASSWORD:?FTP_PASSWORD is not set}"

# A hint, not an instruction. When the search turns up more than one candidate
# -- which means there are stale copies on the server -- a hint that matches one
# of them breaks the tie. It can never point the deploy at a directory that has
# no config.php in it, which is the whole failure mode this replaces.
hint="${FTP_REMOTE_DIR:-}"

max_depth="${PANEL_SEARCH_MAX_DEPTH:-3}"
max_listings="${PANEL_SEARCH_MAX_LISTINGS:-40}"

# --ssl-reqd encrypts the connection; --insecure skips verifying the server's
# certificate. The second half is a real weakening and it is here because the
# deploy step this guards already does exactly the same thing: Hostinger's FTP
# host presents a certificate curl will not validate, and SamKirkland's action
# completes FTPS against it regardless. A check stricter than the deploy it
# guards blocks the work without protecting anything -- an earlier version did
# precisely that, reporting a folder as missing when it had only been refused
# the handshake. The fix that would let this be strict is a valid certificate
# on the FTP host, which is Hostinger's to provide.
#
# Overridable so the test suite can drive the same code against a local
# plain-FTP fixture. Nothing in CI sets it.
curl_tls="${PANEL_SEARCH_CURL_TLS---ssl-reqd --insecure}"

cfg="$(mktemp)"
trap 'rm -f "$cfg" "$cfg.err"' EXIT

listings=0
list_err=""

# Percent-encodes a path for a URL, leaving the separators alone. Without this
# a folder whose name contains a space -- ordinary on this server, which has
# "background car.webp" sitting in the web root -- makes curl reject the URL as
# malformed, and the search reports the panel missing when it never looked.
# LC_ALL=C makes the loop walk bytes, so multi-byte names encode correctly.
urlenc() {
  local LC_ALL=C s="$1" out="" c i
  for (( i = 0; i < ${#s}; i++ )); do
    c="${s:i:1}"
    case "$c" in
      [a-zA-Z0-9._~/-]) out+="$c" ;;
      *) out+="$(printf '%%%02X' "'$c")" ;;
    esac
  done
  printf '%s' "$out"
}

# Lists one directory. $1 is a path relative to the login directory, with a
# trailing slash; empty means the login directory itself. Credentials go in a
# config file rather than on the command line, which would put the password in
# the process list.
ftp_list() {
  printf 'user = "%s:%s"\nurl = "ftp://%s/%s"\n' \
    "$FTP_USERNAME" "$FTP_PASSWORD" "$FTP_SERVER" "$(urlenc "$1")" > "$cfg"
  # shellcheck disable=SC2086  # curl_tls is a deliberate word-split list
  curl --silent --show-error $curl_tls --connect-timeout 20 --max-time 60 \
       --config "$cfg" 2>"$cfg.err"
}

# Pulls names out of a raw LIST response. $1 is the listing, $2 is 'd' for
# directories or 'f' for everything else. The name is every field from the
# ninth on, so names containing spaces ("background car.webp") survive.
names() {
  printf '%s\n' "$1" | awk -v want="$2" '
    NF >= 9 {
      kind = (substr($1, 1, 1) == "d") ? "d" : "f"
      if (kind != want) next
      name = $0
      for (i = 1; i <= 8; i++) sub(/^[^ \t]+[ \t]+/, "", name)
      if (name == "." || name == "..") next
      print name
    }'
}

# Breadth-first, so the shallowest copy is found first and a nested one cannot
# shadow it. A directory holding config.php is not descended into: the panel's
# own subfolders are not more panels.
queue=("")
found=()
map=()
depth=0
truncated=0

while [ "$depth" -le "$max_depth" ] && [ "${#queue[@]}" -gt 0 ]; do
  next=()
  for path in "${queue[@]}"; do
    if [ "$listings" -ge "$max_listings" ]; then
      truncated=1
      break
    fi

    out="$(ftp_list "$path")"
    rc=$?
    listings=$((listings + 1))
    if [ "$rc" -ne 0 ]; then
      # A directory that cannot be listed is not a failure of the search --
      # permissions vary across a shared host. Only the login directory failing
      # is fatal, and that is checked after the loop.
      [ -z "$list_err" ] && list_err="$(cat "$cfg.err" 2>/dev/null)"
      continue
    fi

    # A map of what was actually seen. "Not found" on its own says nothing
    # about whether the search was in the right neighbourhood; a directory
    # holding index.php and the panel's own subfolders is worth knowing about
    # even when config.php is missing from it, because that combination means
    # the files are there and only the one gitignored file is not.
    marks=""
    printf '%s\n' "$out" | grep -q ' index\.php$'  && marks="$marks index.php"
    for sub in api src sql tools; do
      names "$out" d | grep -qx "$sub" && marks="$marks $sub/"
    done
    marks="${marks# }"
    file_count="$(names "$out" f | grep -c . || true)"
    map+=("${path:-./}|${file_count} files|${marks:-nothing recognisable}")

    if names "$out" f | grep -qx 'config.php'; then
      found+=("$path")
      continue
    fi

    while IFS= read -r dir; do
      [ -n "$dir" ] || continue
      case "$dir" in
        .*) continue ;;                      # .git, .well-known, and friends
        node_modules|vendor|cache|tmp) continue ;;
      esac
      next+=("$path$dir/")
    done < <(names "$out" d)
  done

  [ "$truncated" -eq 1 ] && break
  queue=("${next[@]}")
  depth=$((depth + 1))
done

# Compares a found path against the hint. The hint is whatever someone typed
# into the secret, so it may carry a leading slash, a filesystem prefix, or
# neither; matching on the tail is the only comparison that holds up.
matches_hint() {
  local candidate="${1%/}" want="${hint%/}"
  candidate="${candidate#/}"
  want="${want#/}"
  [ -n "$want" ] || return 1
  [ "$candidate" = "$want" ] || [ "${want%"/$candidate"}" != "$want" ]
}

if [ "${#found[@]}" -eq 0 ]; then
  echo "::error::Could not find the admin panel on the server." >&2
  echo "" >&2
  echo "Searched $listings directories, $max_depth levels out from the FTP" >&2
  echo "account's login directory. None contains config.php, so there is no" >&2
  echo "folder reachable from here that is the panel." >&2
  # Whether the search ran out of budget changes what this result means: a
  # completed search proves the panel is not reachable, a truncated one only
  # says it was not found yet. Reporting "not found" for both would be the
  # same class of mistake as reporting a failed listing as an empty folder.
  if [ "$truncated" -eq 1 ]; then
    echo "" >&2
    echo "The search stopped early at its $max_listings-directory limit, so this" >&2
    echo "is not proof the panel is absent -- only that it was not found yet." >&2
  fi
  if [ -n "$list_err" ]; then
    echo "" >&2
    echo "curl reported at least one error while looking:" >&2
    printf '%s\n' "$list_err" | head -5 | sed 's/^/  /' >&2
  fi
  echo "" >&2
  echo "Every directory it looked in, and what was in each:" >&2
  echo "" >&2
  for entry in "${map[@]}"; do
    IFS='|' read -r where count marks <<< "$entry"
    printf '  %-44s %-10s %s\n' "$where" "$count" "$marks" >&2
  done
  echo "" >&2
  echo "A row listing index.php alongside api/ src/ is this panel's own layout." >&2
  echo "If one of those appears above, the panel's files are there and only" >&2
  echo "config.php is missing from it -- which is what a copy made by a deploy" >&2
  echo "looks like, since config.php is excluded from every upload." >&2
  echo "" >&2
  echo "The account logs in here, and this is what it can see:" >&2
  echo "" >&2
  home="$(ftp_list "")"
  if [ $? -eq 0 ] && [ -n "$home" ]; then
    printf '%s\n' "$home" | awk 'NF >= 9 { name = $0; for (i = 1; i <= 8; i++) sub(/^[^ \t]+[ \t]+/, "", name); if (name != "." && name != "..") print (substr($1,1,1) == "d" ? "  " name "/" : "  " name) }' | head -30 >&2
  else
    echo "  (the login directory could not be listed at all -- this looks like" >&2
    echo "   an account or connection problem, not a wrong path)" >&2
  fi
  echo "" >&2
  echo "If the panel is not reachable from here, the FTP account is rooted in the" >&2
  echo "wrong place. In hPanel -> Files -> FTP Accounts, the account's Directory" >&2
  echo "must be at or above the folder holding config.php." >&2
  exit 1
fi

if [ "${#found[@]}" -gt 1 ]; then
  for candidate in "${found[@]}"; do
    if matches_hint "$candidate"; then
      echo "More than one folder here contains config.php; FTP_REMOTE_DIR picks one:" >&2
      printf '  %s\n' "${found[@]}" >&2
      printf '%s\n' "${candidate:-./}"
      exit 0
    fi
  done

  echo "::error::More than one folder on the server contains config.php." >&2
  echo "" >&2
  printf '  %s\n' "${found[@]}" >&2
  echo "" >&2
  echo "These are almost certainly stale copies left by an earlier deploy that" >&2
  echo "ran against a wrong path. Delete the ones that are not served, or set" >&2
  echo "FTP_REMOTE_DIR to the one that is, and run this again." >&2
  echo "" >&2
  echo "Refusing to guess: deploying into the wrong one leaves the live panel" >&2
  echo "unchanged while the run reports success." >&2
  exit 1
fi

echo "Found the panel by its config.php, at: ${found[0]:-the login directory}" >&2
if [ "$truncated" -eq 1 ]; then
  echo "(the search stopped at $max_listings directories)" >&2
fi
printf '%s\n' "${found[0]:-./}"
