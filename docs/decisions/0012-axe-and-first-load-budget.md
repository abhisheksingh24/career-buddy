# 0012. Accessibility and performance checks in CI

Status: Accepted
Date: 2026-11-01

## Context

The quality bar asks for automated accessibility (WCAG 2.2 AA) and performance
checks; none ran (#42). Signed-in pages need a session, and test sign-in (#38)
does not exist yet. The CI runner may be self-hosted macOS, so no `container:`
or `services:`.

## Decision

- **Accessibility:** `@axe-core/playwright` 4.14.0 with `@playwright/test`
  1.64.1 (exact pins, both older than the 7-day cooldown), Chromium only, at a
  desktop and a phone width. Pages: `/` and `/signin`, served by
  `next start` on the production build. These need no database (no session
  cookie means NextAuth never queries it), so `DATABASE_URL` is a dummy and no
  Postgres is started. Serious and critical violations fail. Known ones are
  explicit entries in `e2e/a11y.spec.ts` with an issue number; an entry that
  stops matching fails the run so the list cannot rot. Today: `image-alt` on
  the NextAuth built-in sign-in page (#102).
- **Performance:** `scripts/perf-budget.mjs` sums the gzipped JS each
  page loads at start and fails over a per-page budget (values in the profile).
  Prerendered pages are read from the built HTML. Server-rendered pages (the
  sign-in-guarded dynamic `/upload` and `/analyze` routes, #37) have no HTML, so they are read from
  Next's `.next/diagnostics/route-bundle-stats.json`, plus the shared scripts
  Next leaves out of that list, so both kinds are measured the same way. A
  missing build file, a route without stats, or a page without a budget fails
  the run. Chosen over Lighthouse CI: it is
  deterministic, has no extra dependency and no flaky timing on shared runners.
  Runtime metrics (INP) are not covered yet.
- New workflow `quality.yml`, separate from `ci.yml` so the browser install
  does not slow lint and tests.
- **Licences:** `axe-core` and `@axe-core/playwright` are MPL-2.0 (file-level
  copyleft). They are dev-only, unmodified and not distributed, so nothing is
  triggered. Playwright is Apache-2.0. Recorded in `licenses.md`.

## Consequences

- Signed-in pages stay unchecked until #38 provides a session; add them to
  `PAGES` then.
- The sign-in page violation is accepted until we replace the built-in page.
- Budgets sit about 10% above today's size; tighten them as the bundle shrinks.
