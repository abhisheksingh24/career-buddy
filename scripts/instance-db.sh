#!/usr/bin/env bash
# Database URL helpers for scripts/instance.sh (issue #44). Source this file.
#
# instance_db_url <base-url> <instance-id>
#   Prints the URL of the instance database (career_buddy_<id>) on the same
#   server, or prints a reason on stderr and returns 1. The base URL must point
#   at the local dev Postgres: this is a safety control so instance setup never
#   creates databases on a shared or remote server (Supabase).
#   Accepted: postgres[ql]://[userinfo@]localhost|127.0.0.1[:port][/db][?query]
#   Rejected: any other host (the host is what follows the LAST "@" of the
#   authority, which ends at the first "/" or "?"), IPv6 forms, and any query
#   parameter that can redirect the connection (host, hostaddr, socket*, service*,
#   or a percent-encoded key we do not decode).
instance_db_url() {
  local LC_ALL=C
  local url="$1" id="$2" scheme rest authority query="" hostport host port key pair q
  # Allowlist the whole URL first: no "#" (fragment), backslash, whitespace,
  # control characters or newlines, and no non-ASCII. Such characters let
  # drivers read a different host than the one parsed below.
  case "$url" in
    *[!A-Za-z0-9._~:/?\&=@%+,\;\!\$\'\(\)\*-]*)
      echo "Refusing DATABASE_URL with characters outside the allowed set" >&2; return 1 ;;
  esac
  case "$url" in
    postgresql://*) scheme="postgresql" ;;
    postgres://*) scheme="postgres" ;;
    *) echo "DATABASE_URL must start with postgresql:// or postgres://" >&2; return 1 ;;
  esac
  rest="${url#*://}"
  case "$rest" in *\?*) query="${rest#*\?}"; rest="${rest%%\?*}" ;; esac
  authority="${rest%%/*}"
  hostport="${authority##*@}"
  host="${hostport%%:*}"
  port=""
  case "$hostport" in *:*) port="${hostport#*:}" ;; esac
  case "$host" in
    localhost | 127.0.0.1) ;;
    *) echo "Refusing to create an instance database on a non-local DATABASE_URL" >&2; return 1 ;;
  esac
  case "$hostport" in
    *:) echo "Refusing DATABASE_URL with an empty port" >&2; return 1 ;;
  esac
  case "$port" in
    *[!0-9]*) echo "Refusing DATABASE_URL with an invalid port" >&2; return 1 ;;
  esac
  q="$query"
  while [ -n "$q" ]; do
    pair="${q%%&*}"
    case "$q" in *\&*) q="${q#*&}" ;; *) q="" ;; esac
    key="$(printf '%s' "${pair%%=*}" | tr 'A-Z' 'a-z')"
    case "$key" in
      host | hostaddr | socket* | service* | *%*)
        echo "Refusing DATABASE_URL with a connection-redirecting query parameter ($key)" >&2
        return 1 ;;
    esac
  done
  printf '%s://%s/career_buddy_%s%s\n' "$scheme" "$authority" "$id" "${query:+?$query}"
}
