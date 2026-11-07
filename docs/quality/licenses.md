# Licences and provenance

What this product uses that someone else owns, and on what terms (see
"Licensing and provenance" in `$BUILD_EASY_HOME/harness/quality-bar.md`).
Owned by the dev agent; update it in the PR that adds or removes an entry.
The CI licence scan (`licences.yml`, ADR 0013) covers every production
package; list here only what a scan cannot see, plus any package that is not
plainly permissive. Exceptions live in `.github/licence-policy.json`.

Scan run 2026-11-01 on `main` with `npx license-checker --production --summary`.
CI now runs this scan on every PR. Result: MIT 116,
Apache-2.0 18, ISC 10, BSD-2-Clause 5, BSD-3-Clause 3, 0BSD 1, plus the
exceptions below.

## Dev-only test tooling (issue #120, ADR 0021)

Not shipped, so outside the production scan. Checked by hand: `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/dom` are MIT; their dependencies are MIT, ISC or Apache-2.0 (`aria-query`).

## Distribution intent

Personal today; the owner intends a public release once the product is
production-ready and secure. There is no `LICENSE` file in the repository
yet (`package.json` is `private`). Before going public, add one that matches
the intent chosen then; until then all rights stay with the owner.

## Packages needing a decision

| Package                                                                                | Licence (SPDX)                       | Why we use it                                                                                       | ADR / owner decision                                                                                                                    |
| -------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `@img/sharp-libvips-<platform>` (via `sharp`, Next image optimisation)                 | LGPL-3.0-or-later                    | Prebuilt native library pulled in as an optional dependency of Next; dynamically loaded, unmodified | ADR 0009. Accepted while the app is a hosted service; revisit if we bundle or modify it. Owner not yet asked in plain words             |
| `jszip` (via `mammoth`)                                                                | MIT OR GPL-3.0-or-later              | DOCX parsing                                                                                        | ADR 0009. We take the MIT option                                                                                                        |
| `caniuse-lite` (via browserslist)                                                      | CC-BY-4.0                            | Browser data used at build time                                                                     | ADR 0009. Attribution to ship in notices before distribution                                                                            |
| `duck` (transitive)                                                                    | "BSD\*" (scanner could not classify) | Pulled in by a dependency; BSD-style text                                                           | ADR 0009. Licence file read: BSD 2-clause (ADR 0013)                                                                                    |
| `pako` (transitive)                                                                    | MIT AND Zlib                         | Compression                                                                                         | Both permissive; no action                                                                                                              |
| `axe-core`, `@axe-core/playwright` (dev only)                                          | MPL-2.0                              | Accessibility checks in CI (`e2e/`); never in the production bundle                                 | ADR 0012. File-level copyleft; we do not modify or redistribute them, so no obligation is triggered. Owner not yet asked in plain words |
| `@playwright/test` (dev only)                                                          | Apache-2.0                           | Browser runner for the accessibility checks                                                         | Permissive; no action                                                                                                                   |
| `@prisma/adapter-pg`, `@prisma/client`, `pg`                                           | Apache-2.0 / MIT                     | Prisma 7 driver adapter and client                                                                  | ADR 0020. Permissive; no action                                                                                                         |
| `prisma` CLI, `dotenv` (dev only)                                                      | Apache-2.0 / BSD-2-Clause            | Generate and migrate; loads `.env` for `prisma.config.ts`                                           | ADR 0020. Dev only                                                                                                                      |
| `elkjs` (EPL-2.0), `@visx/vendor` ("MIT and ISC") via `prisma` > `@prisma/studio-core` | EPL-2.0 / MIT and ISC                | Prisma Studio UI, never used or shipped                                                             | ADR 0020. Dev only; recorded exceptions in `.github/licence-policy.json` (EPL-2.0 is weak file-level copyleft, unmodified, not shipped) |
| `web`                                                                                  | UNLICENSED                           | This project itself                                                                                 | n/a                                                                                                                                     |

## Dev dependencies added for tooling

| Package                                     | Licence      | Why                                                        |
| ------------------------------------------- | ------------ | ---------------------------------------------------------- |
| `license-checker-rseidelsohn` (exact 5.0.1) | BSD-3-Clause | Runs the CI licence scan (ADR 0013); dev only, not shipped |

## Assets (fonts, icons, images, sounds, copied code or text)

| Asset                                              | Where used                                  | Source                   | Licence     | Attribution required                   |
| -------------------------------------------------- | ------------------------------------------- | ------------------------ | ----------- | -------------------------------------- |
| Geist and Geist Mono fonts                         | `src/app/layout.tsx` via `next/font/google` | Vercel / Google Fonts    | SIL OFL 1.1 | No (licence ships with the font files) |
| `public/pdf.worker.min.mjs`                        | PDF viewer worker                           | Copied from `pdfjs-dist` | Apache-2.0  | Keep the licence notice                |
| `public/*.svg` (file, globe, next, vercel, window) | Leftover create-next-app placeholders       | Next.js template         | MIT         | No; remove if unused                   |

## Data sources and APIs

| Source                    | What for                                   | Terms that matter (commercial use, storing, share-alike, attribution, limits)                                                    | Licence / terms link                                              |
| ------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| OpenAI API                | Optional resume suggestions and extraction | Commercial use allowed; usage limits and cost apply; resume text leaves our servers, so users must be told before public release | https://openai.com/policies/business-terms                        |
| Google OAuth / Sign-In    | Authentication                             | Google API Services User Data Policy; we use basic profile only and store it                                                     | https://developers.google.com/terms/api-services-user-data-policy |
| Google Fonts (build time) | Geist fonts fetched by `next/font`         | OFL fonts, self-hosted by Next after build; no runtime call                                                                      | https://fonts.google.com/about                                    |

## Notices shipped

Not yet distributed. Before the public release, ship third-party notices
(generated from the licence scan) and the `caniuse-lite` attribution on an
about or licences page.

## Licence of this project

Decision (owner, issue #89): all rights reserved. The root `LICENSE` file says
so and `package.json` has `"license": "UNLICENSED"` with `"private": true`.
Revisit before any open-source release.
