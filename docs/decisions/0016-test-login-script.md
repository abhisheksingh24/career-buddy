# 0016. Test login is a local script, not an app provider

- **Date:** 2026-11-01
- **Status:** Accepted
- **Issue / PR:** #38

## Context

Sign-in is Google OAuth only, so the demo agent cannot sign in (issue #38). The change touches auth, and it must be impossible to enable in production.

## Decision

`scripts/test-login.mjs` inserts a session row (random 256-bit token, one-hour expiry) for a fixed test user and prints the NextAuth cookie. The app itself gets no new provider, route or flag, so nothing exists in a deployed build to switch on. Sessions it creates are ordinary database sessions, so `guard()` and `requireSession` (ADR 0013) treat them like any other.

The script refuses unless all hold (`scripts/test-login-lib.mjs`, unit-tested): `TEST_LOGIN=true`; `NODE_ENV` is not production and no hosting-platform env is set; `DATABASE_URL` host is localhost or 127.0.0.1 with a database named `career_buddy*` and only allowlisted query parameters (`schema`, `connection_limit`, `connect_timeout`, `sslmode`, `pgbouncer`, none repeated), because Prisma lets `?host=` or `?hostaddr=` override the URL authority; `NEXTAUTH_URL` is local `http` with no path, query, fragment or credentials.

## Options considered

- NextAuth Credentials provider behind an env flag: it forces JWT sessions (we use database sessions) and ships a login path in the production bundle guarded only by a flag.
- A dev-only API route: still shipped code that one misconfigured env var exposes.

## Consequences

The demo agent needs shell access to the instance's database, which it already has via `scripts/instance.sh`. Someone with a production database URL could still insert a session by hand, but that needs database access, which already means full compromise.
