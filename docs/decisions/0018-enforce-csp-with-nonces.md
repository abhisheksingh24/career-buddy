# 0018. Enforce the CSP with per-request nonces

Status: Accepted
Date: 2026-11-01

## Context

PR #94 shipped a report-only CSP that allowed `'unsafe-inline'` scripts, which
makes it useless against XSS. Next.js injects inline bootstrap scripts, so
removing `unsafe-inline` needs a nonce on each one (#96).

## Decision

- `src/proxy.ts` (Next 16's middleware) makes a nonce per page request, sets
  the CSP on the request (Next stamps the nonce on its own scripts and styles)
  and on the response. `script-src 'self' 'nonce-…' 'strict-dynamic'`;
  `style-src-elem` with the nonce. Dev adds `unsafe-eval` and inline style
  elements for HMR.
- `style-src-attr 'unsafe-inline'` stays: React `style={{}}` attributes (score
  bars) cannot carry nonces, and attribute styles cannot execute script.
- The root layout awaits `connection()`, so every page renders per request.
  Cost: no static HTML, so the first-load budget script cannot read built HTML
  and reads every page from the route bundle stats plus the build manifest's
  polyfills (budgets unchanged).
- Violations go to `/api/csp-report` (via `report-uri` and
  `Reporting-Endpoints`/`report-to`), which logs trimmed fields only. Browsers
  send reports without cookies, so it cannot use `guard()`. It is the one
  documented exception: it calls `publicGuard()` (`src/lib/api-guard.ts`), which
  refuses a declared Content-Length over 8 kB and applies one shared limit of 60 reports a minute
  (in memory per instance, ADR 0015); `api-guard.test.ts` requires it. The
  route then reads the body with `readBodyLimited()` (8 kB), so chunked bodies
  without a length are cut off too and get 413.
- Zod's JIT probes for eval with `new Function`, which would be a real
  `script-src` violation on every load. The profile page no longer imports zod
  (type only), and `profile-schema.ts` sets `z.config({ jitless: true })`.
- Rejected: hash-based CSP (Next's inline script content changes per page),
  and keeping static pages with `unsafe-inline` (defeats the point).

## Consequences

Pages cost a render per request. Third-party scripts or inline styles added
later will be blocked and show up in the report log.
