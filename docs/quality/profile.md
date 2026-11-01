# Quality profile

How this project meets the build-easy quality bar
(`$BUILD_EASY_HOME/harness/quality-bar.md`). Owned by the dev agent; change
it through an ADR in the PR that needs the change. Written 2026-11-01 from
the code on `main` (ADR 0009). Where a check does not exist yet it says so
and names the issue.

## Risk

- **Data held:** Resume files (PDF/DOCX) and extracted resume text, pasted job descriptions, profile details, analysis results, and Google account identity (name, email, avatar). All of it is on the server: PostgreSQL (Docker locally, Supabase intended for production) and files in `./uploads/resumes/` on the app host's disk (ADR 0005). Resume text and job descriptions are also sent to OpenAI when AI is enabled (ADR 0004). Nothing is held on the device beyond the session cookie.
- **Accounts:** Google sign-in only, through NextAuth v4 with database sessions (ADR 0003). No passwords are stored by us.
- **ASVS level:** L2, because there are accounts and personal data (resumes) stored off the device. The product does not yet meet L2: see the open risks in `threat-model.md`.
- **MASVS:** not applicable, web only. Revisit if a native app is built.
- **Distribution intent:** personal today (the owner is the only user); the owner intends to make it public once production-ready and secure (`.harness/project.md`). No `LICENSE` file exists yet; add one that matches the final intent before going public (see `licenses.md`).

## Checks

| Baseline item                       | How this project checks it                                                                                                                                                                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lint, typecheck, tests              | `ci.yml` runs `npm run lint`, `npx tsc --noEmit`, `npx vitest run --maxWorkers=2`, `npm run build`                                                                                                                                            |
| Dependency audit                    | `audit.yml` runs `scripts/audit.mjs` (`npm audit --omit=dev --audit-level=high`, retried; an outage warns). Accepted advisories are in `.github/audit-allowlist.json`: today only deepmerge-ts via the Prisma CLI (ADR 0010, 0008; #74 / #75) |
| Licence scan (permissive allowlist) | `licences.yml` runs `scripts/licenses.mjs` (pinned license-checker, production deps; allowlist and exceptions in `.github/licence-policy.json`; ADR 0012)                                                                                     |
| Secret scanning                     | `security.yml` (gitleaks)                                                                                                                                                                                                                     |
| Static analysis                     | `security.yml` (Semgrep `p/default`, no baseline). Last full scan: no findings                                                                                                                                                                |
| Dependency updates                  | `.github/dependabot.yml` (npm and GitHub Actions, weekly, 7-day cooldown; Prisma majors ignored per ADR 0008)                                                                                                                                 |
| Accessibility (WCAG 2.2 AA)         | Not checked automatically yet (gap): no axe run exists. Reviewer and UX review only                                                                                                                                                           |
| Performance budgets                 | None set or measured yet (gap). Proposed when UX work starts: INP under 200 ms on a mid-range phone; any action over 1 s shows progress                                                                                                       |
| Docs alongside code                 | `docs-check.yml`                                                                                                                                                                                                                              |

## Project rules

- Resumes are personal data. No resume text, job description or file name is written to logs, and no resume content appears in error responses (the upload route currently echoes a parser message; tracked in #36).
- Every route that reads or writes user data checks the session on the server and scopes queries to the signed-in user. Today this is repeated by hand per route; #37 centralises it.
- Anything that spends money (OpenAI calls) must be authenticated and rate limited (#37). Mock mode (`MOCK_AI_SUGGESTIONS=true`) is used for development and demos.
- Uploaded files are served only through an owner-checked route, never from a public path (ADR 0005).

## Not applicable yet

- **MASVS:** no mobile app.
- **User export and delete of data** (quality bar, Data Protection): applies now that accounts exist, but the feature does not exist. This is a gap, not an exemption; it needs a story before public release.
- **Coverage floor:** not set; very few tests exist. Set one once the auth and upload tests from #36 / #37 land.
