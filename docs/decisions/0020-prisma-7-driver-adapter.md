# 0020. Migrate to Prisma 7 with the pg driver adapter

- **Date:** 2026-11-02
- **Status:** Accepted
- **Issue / PR:** #74

## Context

Prisma 6's CLI pulled in `deepmerge-ts` 7.x, which has a Dependabot alert (ADR 0008 left it open and ignored Prisma majors until this migration).

## Options considered

- Stay on Prisma 6 and keep the ignore rule: leaves the alert open.
- Prisma 7 (7.10.1): fixes the chain (`deepmerge-ts` 8.x). The `npm` `latest` tag points at an 8.0 release candidate; we pin the 7 line (`^7`) rather than adopt a release candidate.

## Decision

Prisma 7.10.1 with `@prisma/adapter-pg` (MIT/Apache-2.0, as Prisma). The connection URL moved from `schema.prisma` to `prisma.config.ts`, which loads `.env` via `dotenv`. `src/lib/db.ts` and `scripts/test-login.mjs` build `PrismaClient` with a `PrismaPg` adapter. The generator stays `prisma-client-js` (still supported; output unchanged, so imports are untouched). The Dependabot ignore rules for `prisma` and `@prisma/client` are removed.

## Consequences

`prisma migrate deploy` still creates a missing database, so `scripts/instance.sh` is unchanged. The adapter uses `pg`, so connection pooling is now driver-level. Moving to the `prisma-client` generator is a possible later step.
