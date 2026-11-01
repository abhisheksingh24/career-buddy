# 0010. Dependency audit in CI

Status: Accepted
Date: 2026-11-01

## Context

The quality bar requires a dependency audit. None ran in CI (#88). Today
`npm audit --omit=dev --audit-level=high` reports 3 high findings, all one
advisory (GHSA-ggr8-5vv4-36mx, deepmerge-ts) reached through `prisma` ->
`@prisma/config`. `prisma` is a production dependency here, and the fix is
Prisma 7, a major upgrade we ignore for now (ADR 0008; #74 / #75). The ESLint
minimatch finding is dev-only and omitted. A raw `npm audit` step would start red.

## Decision

- New workflow `audit.yml` runs `scripts/audit.mjs` on PRs, pushes to main and weekly.
- The script runs the audit as above, with 3 attempts and backoff. It fails on
  any high or critical advisory not listed in `.github/audit-allowlist.json`
  (matched by GHSA id, each with a reason and tracking issue). Unused
  allowlist entries produce a warning so they get removed.
- A registry/network failure (after retries) is a warning and exits 0. Any other
  failure to run the audit (for example a missing lockfile) fails.

## Consequences

- New high advisories fail PRs; the known one is accepted per advisory, not silenced globally.
- While the registry is down, a vulnerable dependency can pass; the weekly run catches it later.
- Remove the allowlist entry when Prisma 7 lands.
