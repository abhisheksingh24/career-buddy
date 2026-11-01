# 0017. One PII-safe logger for server code

Status: Accepted
Date: 2026-11-01

## Context

Resumes, job descriptions, names and emails are personal data (#43). Server
code logged AI responses, parsed JSON, resume excerpts and raw error objects
through ad-hoc `console` calls. Error objects from parsers, the OpenAI SDK and
Zod can quote their input, so even "just log the error" can leak content.

## Decision

- `src/lib/logger.ts` is the only place server code (`src/lib`,
  `src/app/api`) writes logs. `log(level, message, metadata)` emits one JSON
  line; `logError(message, error, metadata)` records only the error class,
  a `code` and an HTTP `status`, never its message or stack.
- Messages are static strings. Metadata is sanitised on the way out: numbers,
  booleans and null pass; strings pass only under an allowlisted key (event,
  route, code, status, ...) and up to 80 characters; arrays become a length;
  anything else is `[redacted]`. A caller who passes resume text by mistake
  gets `[redacted]`, not a leak.
- Debug logs of AI responses, resume excerpts, matched dates and scores were
  deleted rather than converted.
- `logger.test.ts` fails if any non-test file under `src/lib` or
  `src/app/api` calls `console.*`. A test, not an ESLint rule, keeps this
  independent of lint config and works for routes added by parallel PRs.
- It composes with the central route guard (#37): the guard and any route
  call `log`/`logError` with a route name and status; user ids are not
  needed in log metadata.

## Consequences

- Less detail when debugging AI failures; reproduce with mock data instead.
- Client components still use `console.error` in the user's own browser with
  non-resume errors; out of scope.
- This does not add a security event trail (who signed in, uploaded or read
  what); that remains an open risk in `threat-model.md`.
