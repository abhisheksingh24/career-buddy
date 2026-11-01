# API Overview (MVP)

All routes are Next.js App Router handlers under `src/app/api`. Every handler (except NextAuth's own) calls `guard()` from `src/lib/api-guard.ts` first: 401 without a session, 429 with `Retry-After` when a rate limit is exceeded (ADR 0015).

## Auth

- GET /api/auth/session: returns current session
- GET/POST /api/auth/[...nextauth]: NextAuth handlers (Google enabled)

## Resume

- POST /api/resume/upload
  - Session required (401 without one); max 5 MB (413)
  - multipart/form-data: `file` (.pdf, .docx, .txt)
  - Response: `{ id, originalName, mimeType, length }` or `{ error }`

- POST /api/resume/analyze
  - Session required (401); 10 calls a minute per user (429); body max 200 kB (400)
  - JSON: `{ resumeText: string, jobDescription: string }`
  - Response: `{ score: number, missingKeywords: string[] }`
  - Persists an `Analysis` linked to a placeholder `Resume`

- POST /api/resume/suggest (stub)
  - Session required (401); 10 calls a minute per user (429); body max 200 kB (400)
  - JSON: `{ resumeText: string, jobDescription: string }`
  - Response: `{ suggestions: string[] }`

## Models

See `prisma/schema.prisma` for `User`, `Account`, `Session`, `VerificationToken`, `Resume`, `Analysis`.

## Notes

- PDF parsing uses `pdf-parse` externalized in `next.config.ts`.
- DOCX parsing uses `mammoth`.
- Consider swapping PDF parsing to `pdfjs-dist` for higher reliability.
