# UX principles

Rules screens are checked against, on top of the baseline in
`$BUILD_EASY_HOME/harness/quality-bar.md`.

| Principle                                                                                                                                                                              | Why (owner's words or finding)                                        | Since      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------- |
| The user only does the thinking: they give rough content; the app decides placement, structure, filtering and format. Never ask for a layout or formatting choice the app can make.    | "I wish I only needed to worry about the thinking part"               | 2026-11-01 |
| Guided steps: any multi-part task is a short sequence of steps, each with one clear next action and visible progress ("Step 2 of 3").                                                  | "simple/guided steps"                                                 | 2026-11-01 |
| Land on action: the home screen leads with the resume score and the top improvements; the first improvement is one tap away.                                                           | "most important action items - my resume score and how to improve it" | 2026-11-01 |
| Every score and suggestion shows its reason (what was found, what is missing) so it can be judged. Accuracy beats speed.                                                               | Stops using if inaccurate or not useful                               | 2026-11-01 |
| Slow work shows progress, never a frozen screen: say what is happening, keep the page responsive, and keep the user's input if it fails. Waiting for accuracy is fine; silence is not. | "sluggish UI... I don't mind waiting a bit for accurate results"      | 2026-11-01 |
| The app never changes the resume silently: suggestions are accepted or skipped one by one, and every accept can be undone. _(assumption)_                                              | Trust in accuracy                                                     | 2026-11-01 |
| Tailoring starts from the base resume and leaves it untouched; a tailored version is a separate copy. _(assumption)_                                                                   | Daily per-role tailoring, occasional base edits                       | 2026-11-01 |
| Works on phone and laptop: every task is completable at 390px; writing-heavy steps may be easier on laptop but are never blocked.                                                      | Phone and laptop                                                      | 2026-11-01 |
| Never type what we can look up or already know (skills, dates, job text from the saved resume or pasted posting).                                                                      | Derived from "only the thinking part"                                 | 2026-11-01 |

## Signed-out screens

A signed-out screen shows exactly one sign-in action, and every tap target (including sign-in) is at least 44px. Upload shows the chosen file name once (the file input is visually hidden behind the "Choose file" button, so the "Selected" line is the only place the name appears).

## One main landmark per page

The root layout (`src/app/layout.tsx`) renders the only `<main>`. Pages and
components must not render another, because screen readers expect a single
main landmark. `src/components/main-landmark.test.ts` scans `src/**/*.tsx`
and fails if any other file renders `<main` (#139).
