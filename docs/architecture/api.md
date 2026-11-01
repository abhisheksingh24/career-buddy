# API Overview (MVP)

All routes are Next.js App Router handlers under `src/app/api`.

## Auth

- GET /api/auth/session: returns current session
- GET/POST /api/auth/[...nextauth]: NextAuth handlers (Google enabled)

## Resume

- POST /api/resume/upload
  - Auth required
  - multipart/form-data: `file` (.pdf, .docx, .txt)
  - Response: `{ id, originalName, mimeType, length }` or `{ error }`

- POST /api/resume/analyze
  - JSON: `{ resumeText: string, jobDescription: string }`
  - Response: `{ score: number, missingKeywords: string[] }`
  - If signed in: persists an `Analysis` linked to a placeholder `Resume`

- POST /api/resume/suggest (stub)
  - JSON: `{ resumeText: string, jobDescription: string }`
  - Response: `{ suggestions: string[] }`

## Models

See `prisma/schema.prisma` for `User`, `Account`, `Session`, `VerificationToken`, `Resume`, `Analysis`.

## Notes

- PDF parsing uses `pdf-parse` externalized in `next.config.ts`.
- DOCX parsing uses `mammoth`.
- Consider swapping PDF parsing to `pdfjs-dist` for higher reliability.
