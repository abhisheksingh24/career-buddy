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

## Licence finding and outcome

Prisma 7's CLI pulls `@prisma/studio-core`, which brings `elkjs@0.11.1` (EPL-2.0) and `@visx/vendor@4.0.0-alpha.0` ("MIT and ISC"). Neither is on the allowlist and we chose not to add exceptions or allow EPL-2.0. `prisma` and `dotenv` are therefore `devDependencies` (CI and the build run `npx prisma generate` after `npm ci`; `instance.sh` runs `migrate deploy` where devDependencies are installed). Caveat found while verifying: `@prisma/client` declares `prisma` as an optional peer, so npm still places the CLI subtree in a production-flagged scan (`devOptional` in the lockfile, and even `npm ci --omit=dev` installs it). The `licence-scan` check therefore still reports the two packages; see the PR for the open decision.

A future production deploy that runs `prisma migrate deploy` must install the CLI (it is not in a production-only install by design).

`prisma.config.ts` fails fast with a clear message when `DATABASE_URL` is missing for `migrate`, `db` and `studio`, but not for `generate`. `src/lib/db.ts` creates the client on first use and throws a clear message then, so `next build` needs no database URL.

## Consequences

`prisma migrate deploy` still creates a missing database, so `scripts/instance.sh` is unchanged. The adapter uses `pg`, so connection pooling is now driver-level. Moving to the `prisma-client` generator is a possible later step.
