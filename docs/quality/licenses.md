# Licences and provenance

What this product uses that someone else owns, and on what terms (see
"Licensing and provenance" in `$BUILD_EASY_HOME/harness/quality-bar.md`).
Owned by the dev agent; update it in the PR that adds or removes an entry.
The CI licence scan covers every package; list here only what a scan
cannot see, plus any package that is not plainly permissive.

Scan run 2026-11-01 on `main` with `npx license-checker --production --summary`.
There is no licence scan in CI yet (see the profile). Result: MIT 116,
Apache-2.0 18, ISC 10, BSD-2-Clause 5, BSD-3-Clause 3, 0BSD 1, plus the
exceptions below.

## Distribution intent

Personal today; the owner intends a public release once the product is
production-ready and secure. There is no `LICENSE` file in the repository
yet (`package.json` is `private`). Before going public, add one that matches
the intent chosen then; until then all rights stay with the owner.

## Packages needing a decision

| Package                                                                | Licence (SPDX)                       | Why we use it                                                                                       | ADR / owner decision                                                                                                                    |
| ---------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `@img/sharp-libvips-<platform>` (via `sharp`, Next image optimisation) | LGPL-3.0-or-later                    | Prebuilt native library pulled in as an optional dependency of Next; dynamically loaded, unmodified | ADR 0009. Accepted while the app is a hosted service; revisit if we bundle or modify it. Owner not yet asked in plain words             |
| `jszip` (via `mammoth`)                                                | MIT OR GPL-3.0-or-later              | DOCX parsing                                                                                        | ADR 0009. We take the MIT option                                                                                                        |
| `caniuse-lite` (via browserslist)                                      | CC-BY-4.0                            | Browser data used at build time                                                                     | ADR 0009. Attribution to ship in notices before distribution                                                                            |
| `duck` (transitive)                                                    | "BSD\*" (scanner could not classify) | Pulled in by a dependency; BSD-style text                                                           | ADR 0009. Confirm the licence text when the CI scan is added                                                                            |
| `pako` (transitive)                                                    | MIT AND Zlib                         | Compression                                                                                         | Both permissive; no action                                                                                                              |
| `axe-core`, `@axe-core/playwright` (dev only)                          | MPL-2.0                              | Accessibility checks in CI (`e2e/`); never in the production bundle                                 | ADR 0012. File-level copyleft; we do not modify or redistribute them, so no obligation is triggered. Owner not yet asked in plain words |
| `@playwright/test` (dev only)                                          | Apache-2.0                           | Browser runner for the accessibility checks                                                         | Permissive; no action                                                                                                                   |
| `web`                                                                  | UNLICENSED                           | This project itself                                                                                 | n/a                                                                                                                                     |

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
