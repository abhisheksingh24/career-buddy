# 0011. Raise the Node range for jsdom 30 and lint-staged 17

- **Date:** 2026-11-01
- **Status:** Accepted
- **Issue / PR:** #77

## Context

jsdom 30 requires Node `^22.22.2 || ^24.15.0 || >=26`; lint-staged 17 requires `>=22.22.1`. ADR 0007 had set `^20.19 || ^22.13 || >=24`.

## Decision

Set `engines.node` to `^22.22.2 || ^24.15.0 || >=26.0.0`. Node 20 is dropped. `.nvmrc` stays `22`; CI uses `node-version-file`, which resolves to the latest 22.x (above 22.22.2). Odd-numbered releases (such as 25) fall outside the range, matching jsdom.

## Consequences

Developers on Node 20 or an older 22 must upgrade. Tailwind 4.3 has no engine change. The Prisma-major ignore rule from ADR 0008 is unchanged.
