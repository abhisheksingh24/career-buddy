# 0019. Enforce the upload size limit while streaming the body

- **Date:** 2026-11-01
- **Status:** Accepted
- **Issue / PR:** #107

## Context

ADR 0014 capped uploads at 5 MB with a Content-Length pre-check. A chunked body has no Content-Length, so `request.formData()` buffered all of it before the size check ran.

## Decision

The upload route reads the body itself with `readBodyLimited` (`src/lib/read-limited-body.ts`), counting bytes as they arrive and cancelling the stream once the request exceeds `MAX_REQUEST_BYTES` (5 MB plus multipart framing); it answers 413. Only a body within the cap is then parsed with `formData()`. The Content-Length pre-check stays as a cheap early exit. No new dependency.

## Consequences

Memory per upload is bounded by the cap plus one chunk. The body is held once as bytes and once as parsed form data, so about 10 MB transiently at most. A hosting platform may still apply its own, earlier body limit.
