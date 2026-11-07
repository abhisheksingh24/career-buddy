# API Overview (MVP)

All routes are Next.js App Router handlers under `src/app/api`. Every handler (except NextAuth's own) calls `guard()` from `src/lib/api-guard.ts` first: 401 without a session, 429 with `Retry-After` when a rate limit is exceeded (ADR 0015). Rate limits (in memory per server instance, ADR 0015): analyze and suggest 10 a minute per user, upload 10 a minute, profile writes 30 a minute, sign-in POSTs 20 a minute per client address, and the sign-in one applies only when `TRUSTED_PROXY=true` (ADR 0022). JSON bodies are read with `readJson()`, which counts bytes while streaming and returns 400 for missing, invalid or oversized bodies (200 kB; profile 50 kB). Handled errors are `{ error: string }`; the analyze and suggest routes have no try/catch, so an unexpected failure there is an unhandled 500 without that shape.

On a 429 the analyze pages (`/analyze` and `/analyze/interactive`) read `Retry-After` with `parseRetryAfter()` (`src/lib/retry-wait.ts`), show a rate-limit message, and disable the analyze button with a live countdown until the wait ends (`src/lib/use-retry-countdown.ts`). The notice (`RateLimitNotice`, which wraps the button) shows the alert above the button and scrolls itself into view when it appears, so it is never hidden below the fold on a phone; its text is constant so screen readers announce it once.

## Auth

- GET /api/auth/session: returns current session
- GET/POST /api/auth/[...nextauth]: NextAuth handlers (Google enabled)
  - POST only: 20 a minute per client address (429 `{ error }` with `Retry-After`), keyed on the proxy-appended `X-Forwarded-For` entry and only when `TRUSTED_PROXY=true`; otherwise not limited. GET (session reads, OAuth callback) is never limited

## Profile

- GET /api/profile
  - Session required (401). Returns the user's `Profile`; a user who has not saved one yet gets 200 with an empty profile (`EMPTY_PROFILE`: null text fields, `skills: []`), never 404. The `user` record is not included
- PUT /api/profile
  - Session required (401); 30 writes a minute per user (429 with `Retry-After`); body max 50 kB (400). JSON validated by `profileSchema` (`src/lib/profile-schema.ts`); creates or updates the profile. Blank link fields (`website`, `linkedin`, `github`) are treated as unset; blank skills are dropped. Length caps (PUT only, so stored rows can always be read): headline 200, location 200, bio 3000, each skill 50 and at most 50 skills, each URL 2048
  - Response: the saved `Profile`; 400 `{ error: <readable sentence, e.g. "Bio is too long (max 3000 characters)">, issues: <raw zod issues> }`; 500 `{ error }`

## Resume

- POST /api/resume/upload
  - Session required (401); 10 uploads a minute per user (429 with `Retry-After`); declared request over about 5 MB + 64 kB, or file over 5 MB: 413
  - multipart/form-data: `file` (.pdf, .docx, .txt, .md). The type is decided from the file's bytes and name, not the client Content-Type: DOCX needs a `.docx` name (a zip without it gives 415); text needs `.txt` or `.md` and no NUL bytes
  - 400 `{ error: "No file" }` when the form or `file` is missing; 415 when the type is unsupported; 422 when the text cannot be extracted (fixed message, never the parser's)
  - Stores a `Resume` in the user's default portfolio (created on first use); PDF and DOCX bytes are kept in the database (ADR 0014)
  - Response: `{ id, originalName, mimeType, length }` (`length` is the extracted text length)

- GET /api/resume/active
  - Session required (401). Returns the latest-version resume in the user's default portfolio: `{ id, name, rawText, fileType, createdAt }`
  - `null` (200) when there is no default portfolio or no resume, so pages load without a failed request; 500 on failure

- GET /api/resume/[id]/file
  - Session required (401); 404 if the resume does not exist, 403 if it belongs to another user
  - Serves the original PDF (`application/pdf`, from the database, or local disk for older uploads) with `Content-Disposition`, `X-Content-Type-Options: nosniff`, `Cache-Control: private, max-age=3600`
  - `Content-Disposition` is built by `contentDisposition` (`src/lib/content-disposition.ts`) from the stored name: lone surrogates are replaced with U+FFFD, control characters are stripped, the name is cut to 150 code points (never splitting a surrogate pair) and trimmed, falling back to `resume.pdf` if empty. It sends an ASCII `filename` (non-ASCII, quotes, backslash, `;` and `%` become `_`) plus an RFC 5987 `filename*=UTF-8''...`
  - 404 when there is no stored file (text-only or placeholder resume) or it is missing on disk; 400 when the resume is not a PDF; 500 on failure

- POST /api/resume/analyze
  - Session required (401); 10 calls a minute per user (429); body max 200 kB (400)
  - JSON: `{ resumeText: string, jobDescription: string, jobTitle?: string, company?: string, domain?: string }`
  - Response: the `EnhancedAnalysisResult` fields (`src/lib/types/analysis.ts`) plus `categories` and `analysisId`:
    `overallScore`, `atsScore`, `domain`, `scoreBreakdown`, `weights`, `totalYearsExperience`, `matchedSkills`, `missingSkills`, `relevantExperiences`, `experienceGaps`, `strengthAreas`, `improvementAreas`, `atsTips`, `suggestedBullets`, `missingKeywords` (legacy), `categories` (category-structured feedback), `analysisId`
  - Persists a `ResumeAnalysis` linked to a placeholder `Resume` (`pasted-resume`) in the user's default portfolio, with the category data stored in its `suggestions` JSON

- GET /api/resume/analysis/[id]/categories
  - Session required (401); 400 if the id is empty; 404 if not found; 403 if the analysis belongs to another user
  - Response: the stored category analysis. Older analyses without stored categories are rebuilt from the saved fields (some score breakdown values are then defaults)
  - 500 `{ error }` on failure

- POST /api/resume/suggest
  - Session required (401); 10 calls a minute per user (429); body max 200 kB (400)
  - JSON: `{ resumeText: string, jobDescription: string }`
  - Response: `{ suggestions: string[], skills: string[] }`; when AI is disabled (no OpenAI key or `ENABLE_AI_SUGGESTIONS=false`): `{ suggestions: [], disabled: true }`. `MOCK_AI_SUGGESTIONS=true` returns canned suggestions only when `OPENAI_API_KEY` is set and `ENABLE_AI_SUGGESTIONS` is not `false`; the AI-enabled check runs before the mock check, so with no key the response is still `disabled: true`

## Models

See `prisma/schema.prisma`: `User`, `Account`, `Session`, `VerificationToken`, `Profile`, `Portfolio`, `Resume`, `ResumeAnalysis`, `JobApplication`, `Review`.

## Notes

- PDF parsing uses `pdf-parse` externalized in `next.config.ts`.
- DOCX parsing uses `mammoth`.
- Consider swapping PDF parsing to `pdfjs-dist` for higher reliability.
