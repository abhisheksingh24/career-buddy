#!/usr/bin/env bash
# Start an isolated dev instance (build-easy ADR 0014).
# Needs PORT; INSTANCE_ID (default: "port-$PORT") names the instance's state.
# Runs the app on PORT with NEXTAUTH_URL pointing at it and AI in mock mode.
#
# Per-instance state (issue #44):
#   database  career_buddy_<INSTANCE_ID> on the local Postgres (docker-compose),
#             created by `prisma migrate deploy` if missing, then migrated.
#   uploads   ./uploads/<INSTANCE_ID>/ (via UPLOADS_DIR).
# Tear down: DROP DATABASE "career_buddy_<id>" and rm -rf uploads/<id>
# (see docs/architecture/README.md).
set -euo pipefail
: "${PORT:?PORT must be set}"
cd "$(dirname "$0")/.."
export NEXTAUTH_URL="http://localhost:${PORT}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-instance-secret-not-for-production}"
export MOCK_AI_SUGGESTIONS="${MOCK_AI_SUGGESTIONS:-true}"

# Lowercase, [a-z0-9_] only, so the id is safe as a database name and path.
raw_id="${INSTANCE_ID:-port-${PORT}}"
id="$(printf '%s' "$raw_id" | tr 'A-Z' 'a-z' | tr -c 'a-z0-9\n' '_' | cut -c1-40)"
[ -n "$id" ] || { echo "INSTANCE_ID has no usable characters" >&2; exit 1; }

# Base connection: the environment, else .env, else the .env.example default.
base_url="${DATABASE_URL:-}"
if [ -z "$base_url" ] && [ -f .env ]; then
  base_url="$(grep -E '^DATABASE_URL=' .env | tail -n1 | cut -d= -f2- | tr -d "\"'" || true)"
fi
base_url="${base_url:-postgresql://postgres:postgres@localhost:5432/career_buddy}"

# Only ever create databases on the local dev server, never a shared/remote one.
case "$base_url" in
  postgresql://*@localhost[:/]* | postgresql://*@127.0.0.1[:/]* | postgres://*@localhost[:/]* | postgres://*@127.0.0.1[:/]*) ;;
  *) echo "Refusing to create an instance database on a non-local DATABASE_URL" >&2; exit 1 ;;
esac

# Swap the database name (the path segment after host:port), keep any query.
query=""
case "$base_url" in *\?*) query="?${base_url#*\?}"; base_url="${base_url%%\?*}" ;; esac
export DATABASE_URL="${base_url%/*}/career_buddy_${id}${query}"
export UPLOADS_DIR="${UPLOADS_DIR:-$PWD/uploads/${id}}"

echo "instance ${id}: database career_buddy_${id}, uploads ${UPLOADS_DIR}" >&2
# migrate deploy creates the database when it does not exist, then applies migrations.
npx prisma migrate deploy
exec npx next dev -p "$PORT"
