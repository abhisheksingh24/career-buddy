# 0022. Sign-in limit key and a separate anonymous limiter store

- **Date:** 2026-11-02
- **Status:** Accepted
- **Issue / PR:** #112, #135

## Context

Sign-in has no session, so its rate limit (20 POSTs a minute) needs a client address. The first version keyed on the first `X-Forwarded-For` entry, which the client writes unless a proxy overwrites it. That let a caller rotate the header to bypass the limit, put a victim's address in it to lock the victim out, or (with no header) share one `unknown` bucket and block sign-in for everyone. The limiter also shared one 10,000-key map with per-user limits, so flooding it with anonymous keys evicted every user's counters (oldest first) and reset the AI, upload and profile limits.

## Decision

- Forwarding headers are read only when `TRUSTED_PROXY=true`, meaning a proxy we run sets them. The address is the entry the proxy appended: the Nth from the right, N = `TRUSTED_PROXY_HOPS` (default 1). If the header has fewer entries than the hop count the chain is not what we configured, so there is no address (sign-in not address-limited); `X-Real-IP` is used only when `X-Forwarded-For` is absent entirely.
- When no proxy is trusted there is no safe address, so sign-in is not address-limited. We do not use one global bucket (any shared cap can be filled by one client) and do not trust the header. Sign-in POSTs only redirect to Google, which holds the credentials, so the cost of leaving them unlimited is low.
- Anonymous limits use their own bounded store (`anonRateLimit`), separate from the signed-in one (`rateLimit`). Flooding anonymous keys can only evict other anonymous keys.
- `readJson` now counts bytes while streaming (via `readBodyLimited`), so chunked bodies without Content-Length are never buffered past the cap. Over-size JSON still returns 400, as before.

## Consequences

- Production behind a proxy must set `TRUSTED_PROXY=true` (and the hop count) for sign-in limiting to apply; documented in `.env.example`. Setting it without a proxy that overwrites the header re-opens the spoofing problems.
- Counters are still per process; a shared store remains an open owner decision (#112).
