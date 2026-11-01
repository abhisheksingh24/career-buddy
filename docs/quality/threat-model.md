# Threat model

Short and current. Update it in any PR that changes what data the product
holds, where that data goes, or who can reach it. Written 2026-11-01 from
the code on `main`. Mitigations listed are ones that exist in code today;
everything else is under Open risks.

## What we protect

- **Resumes** (PDF/DOCX files and extracted text): names, contact details, employment and education history. The main asset; a leak harms the user.
- **Job descriptions, applications and analysis results**: reveal which jobs a person is pursuing.
- **Google identity and sessions** (`User`, `Account`, `Session` tables): a session token grants full access to one user's data. `Account` rows hold Google OAuth tokens.
- **Secrets**: `NEXTAUTH_SECRET`, Google client secret, `OPENAI_API_KEY`, `DATABASE_URL`. Server-side environment only.
- **OpenAI spend**: the API key can be drained by anyone who can call the AI routes.

## Entry points

```mermaid
flowchart LR
  B[Browser] -->|HTTPS, session cookie| N[Next.js routes]
  N -->|Prisma| D[(PostgreSQL)]
  N -->|read/write| F[./uploads/resumes]
  N -->|resume text, job text| O[OpenAI API]
  B -->|OAuth| G[Google]
  G --> N
```

| Entry point                                                                          | Trust boundary                                                                                 | Auth today                                                                                                |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `POST /api/resume/upload`                                                            | Untrusted file (PDF, DOCX or anything else) parsed by `pdf-parse` and `mammoth`, saved to disk | Session required                                                                                          |
| `GET /api/resume/[id]/file`                                                          | Reads a stored file named by a DB record                                                       | Session and ownership check                                                                               |
| `GET /api/resume/active`, `GET /api/resume/analysis/[id]/categories`, `/api/profile` | User data from the DB                                                                          | Session checked in each route; scoping is per route, no central guard                                     |
| `POST /api/resume/analyze`                                                           | Untrusted JSON (resume text, job description) which may be sent to OpenAI                      | No session needed to run; the session only decides whether the result is saved                            |
| `POST /api/resume/suggest`                                                           | Untrusted JSON sent to OpenAI                                                                  | None                                                                                                      |
| `/api/auth/*`                                                                        | Google OAuth, NextAuth session cookie                                                          | NextAuth                                                                                                  |
| Environment                                                                          | Secrets from env                                                                               | Not in the client bundle; `.env` is git-ignored, `.env.example` is tracked without values; gitleaks in CI |
| Third parties                                                                        | Google (sign-in), OpenAI (resume text leaves our servers), Google Fonts at build time          | Terms in `licenses.md`                                                                                    |

## Threats and mitigations

| Threat                                                            | Mitigation                                                                                                                                                                                                                                                 | Where (code / ADR)                                                        |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Account takeover or forged login                                  | Vetted provider (NextAuth with Google OAuth), no custom crypto, no password storage, database sessions that can be revoked                                                                                                                                 | `src/lib/auth.ts`, ADR 0003                                               |
| Test login used to bypass sign-in in a real deployment            | No app route or provider exists for it: `scripts/test-login.mjs` writes a one-hour session row directly and refuses unless `TEST_LOGIN=true`, `NODE_ENV` is not production, and the database and `NEXTAUTH_URL` are local (database named `career_buddy*`) | `scripts/test-login-lib.mjs`, `scripts/test-login.test.ts`, ADR 0016      |
| One user reads another's resume file (IDOR)                       | File route loads the record and returns 403 when `portfolio.userId` differs from the session user                                                                                                                                                          | `src/app/api/resume/[id]/file/route.ts`                                   |
| Anonymous access to stored data                                   | 401 without a session on the upload, file, active, categories and profile routes                                                                                                                                                                           | `src/app/api/**/route.ts`                                                 |
| SQL injection                                                     | All DB access goes through Prisma (parameterised)                                                                                                                                                                                                          | ADR 0002                                                                  |
| Secrets in the repo or client bundle                              | gitleaks in CI; secrets read only server-side                                                                                                                                                                                                              | `security.yml`                                                            |
| Known-vulnerable dependencies                                     | Next 16, Vitest 4, Zod 4, OpenAI 7 sweep; Dependabot weekly                                                                                                                                                                                                | ADR 0008, `.github/dependabot.yml`                                        |
| Insecure code patterns                                            | Semgrep `p/default` in CI; full scan clean                                                                                                                                                                                                                 | `security.yml`                                                            |
| Path traversal through the file name                              | Stored name is `userId_timestamp_name` with characters outside `[a-zA-Z0-9.-]` replaced; the read path comes from the DB record, not from the request                                                                                                      | `src/app/api/resume/upload/route.ts`                                      |
| Clickjacking, MIME sniffing, referrer and device-permission leaks | `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera, microphone, geolocation off), HSTS in production. CSP itself is report-only (see gaps)                                               | `src/lib/security-headers.ts`, `next.config.ts`                           |
| Header injection / open CORS on resume file download              | `Access-Control-Allow-Origin` removed (viewer is same-origin); file name sanitised and sent as `filename` plus RFC 5987 `filename*`                                                                                                                        | `src/lib/content-disposition.ts`, `src/app/api/resume/[id]/file/route.ts` |
| Resume sent to OpenAI when not intended                           | `aiEnabled()` gates the calls; mock mode needs no key and sends nothing                                                                                                                                                                                    | `src/lib/ai.ts`, ADR 0004                                                 |

## Open risks

Known gaps, not mitigated yet. Each has an issue.

- **Upload handling (#36):** no file size limit; no content verification (the type comes from the client `Content-Type`, and unknown types are decoded as text); PDF and DOCX parsers run on untrusted input inside the request process; the parser error message is returned to the client; files sit unencrypted on local disk.
- **No central auth and no rate limiting (#37):** per-route checks are repeated by hand, so a new route can forget one. `POST /api/resume/suggest` and `POST /api/resume/analyze` can be called without signing in and spend OpenAI budget. Nothing limits request rate or body size on any route, including sign-in.
- **Test login (#38):** not built; when it is, it must be impossible to enable in production.
- **No audit logging (#43):** sign-ins, uploads and access are not recorded, so misuse cannot be investigated.
- **Shared dev state (#44, fixed):** each instance gets its own database (`career_buddy_<INSTANCE_ID>`) and uploads directory (`uploads/<INSTANCE_ID>/`); `scripts/instance.sh` refuses a `DATABASE_URL` whose parsed host is not exactly `localhost` or `127.0.0.1` (or that carries `host=`/`hostaddr=`/socket parameters). This is a dev-script safety check against creating databases on a remote server by mistake, not a security boundary: anyone who controls the environment can still run `prisma` against any database. Upload filenames are sanitised to `[a-zA-Z0-9.-]` and prefixed with the user id and timestamp, so they cannot escape the uploads directory.
- **Remaining audit findings (#7, #14 via #74, #75):** items ADR 0008 could not fix (for example `deepmerge-ts` through the Prisma 6 CLI, build time only).
- **No user data export or delete.** Required once accounts exist; needs a story before going public.
- **CSP is report-only (#87):** the policy is sent as `Content-Security-Policy-Report-Only`, so violations show in the browser console but nothing is blocked. It still allows inline scripts (no nonces yet). Follow-up: check for violations in real use, move to nonces, then switch to an enforcing `Content-Security-Policy`.
- **Encryption at rest** relies on the database host for rows; uploaded files have none until storage moves off local disk.
- **Prompt injection:** resume and job text go straight into OpenAI prompts. Output is shown only to the same user, so impact is low, but it is not validated beyond schema parsing where used.
