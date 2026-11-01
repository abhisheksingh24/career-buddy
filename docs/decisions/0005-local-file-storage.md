# 0005. Store uploaded resume files on the local filesystem

- **Date:** 2026-11-01
- **Status:** Adopted
- **Issue / PR:** n/a (recorded at onboarding)

## Context

Reason not recorded. uploadthing packages are installed but the upload route writes to disk.

## Options considered

Not recorded.

## Decision

`/api/resume/upload` parses PDF (pdf-parse) or DOCX (mammoth), stores raw text in Postgres and the file under `./uploads/resumes`; `/api/resume/[id]/file` serves it to the react-pdf viewer.

## Consequences

Recorded as found; revisit when a change touches it.
