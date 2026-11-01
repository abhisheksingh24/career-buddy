# 0013. Central API guard and in-memory rate limit

Status: Accepted
Date: 2026-11-01

## Context

Each API route checked the session by hand (#37). `suggest` had no check and
`analyze` ran OpenAI work for anonymous callers, so anyone could spend the
OpenAI budget. Nothing limited request rate or body size.

## Decision

- `guard()` in `src/lib/api-guard.ts` is called first in every route handler. It
  returns `{ userId }`, or the 401 (or 429) response to return. A test reads every
  `route.ts` and fails if one (other than NextAuth's) does not call it.
- Not Next middleware: sessions are in the database (ADR 0003), and middleware
  on the edge runtime cannot read them; a cookie-presence check would give a
  false sense of safety. The per-route guard plus the enforcing test gives a
  real check with the same "cannot forget" property.
- Rate limit: sliding window, 10 calls a minute per user on analyze and suggest,
  kept in process memory (`src/lib/rate-limit.ts`, bounded to 10,000 keys). No new
  dependency or service.
- Analyze and suggest read the body through `readJson`, which refuses bodies over
  200 kB or invalid JSON with 400.
- The analyze route now always saves the analysis, since callers are always signed in.
- The categories route checks the session before the database lookup, so a
  signed-out caller learns nothing about which ids exist.

## Consequences

- With more than one app instance the limit is per instance (effective limit
  multiplied) and a restart resets it. Move to a shared store (for example the
  database or Redis) before scaling out; recorded in the threat model.
- Signed-out use of analyze is gone; the pages already sit behind sign-in.
- Limits of 10 per minute are generous for a person and can be tuned in `AI_RATE_LIMIT`.
