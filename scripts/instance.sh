#!/usr/bin/env bash
# Start an isolated dev instance (build-easy ADR 0014).
# Needs PORT; INSTANCE_ID is optional and only names the instance's database.
# Runs the app on PORT with NEXTAUTH_URL pointing at it and AI in mock mode.
# The database name is not yet per-instance (issue #44); until then
# DATABASE_URL from .env (or the environment) is used as is.
set -euo pipefail
if [ "${NODE_ENV:-}" = "production" ]; then
  echo "instance.sh sets a fixed, public dev NEXTAUTH_SECRET and must not run with NODE_ENV=production." >&2
  exit 1
fi
: "${PORT:?PORT must be set}"
cd "$(dirname "$0")/.."
export NEXTAUTH_URL="http://localhost:${PORT}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-instance-secret-not-for-production}"
export MOCK_AI_SUGGESTIONS="${MOCK_AI_SUGGESTIONS:-true}"
exec npx next dev -p "$PORT"
