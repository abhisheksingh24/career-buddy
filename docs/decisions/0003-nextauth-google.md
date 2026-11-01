# 0003. Use NextAuth v4 with Google sign-in and database sessions

- **Date:** 2026-11-01
- **Status:** Adopted
- **Issue / PR:** n/a (recorded at onboarding)

## Context

Reason not recorded.

## Options considered

Not recorded.

## Decision

`src/lib/auth.ts`: Prisma adapter, Google provider only (enabled when client id/secret are set), `session.strategy = "database"`. API routes check `getServerSession`.

## Consequences

Recorded as found; revisit when a change touches it.
