# Quality profile

How this project meets the build-easy quality bar
(`$BUILD_EASY_HOME/harness/quality-bar.md`). Owned by the dev agent; change
it through an ADR in the PR that needs the change.

## Risk

- **Data held:** <what, and where: device / server / third party>
- **Accounts:** <none, or how sign-in works>
- **ASVS level:** <L1 | L2 | L3>, because <reason>
- **MASVS:** <applies | not applicable, because ...>
- **Distribution intent:** <personal | shared with friends | app stores or sold | open source>, from the owner's interview; the project `LICENSE` matches it

## Checks

| Baseline item                       | How this project checks it                                             |
| ----------------------------------- | ---------------------------------------------------------------------- |
| Lint, typecheck, tests              | <workflow → command>                                                   |
| Dependency audit                    | <workflow → command>                                                   |
| Licence scan (permissive allowlist) | <workflow → command, e.g. license-checker / pip-licenses / cargo-deny> |
| Secret scanning                     | `security.yml` (gitleaks)                                              |
| Static analysis                     | `security.yml` (Semgrep)                                               |
| Dependency updates                  | `.github/dependabot.yml`                                               |
| Accessibility (WCAG 2.2 AA)         | <workflow → axe on key screens>                                        |
| Performance budgets                 | <e.g. INP < 200 ms, launch < 2 s on a mid-range phone; how measured>   |

## Project rules

<!-- Rules this product needs beyond the baseline, each with a one-line reason and its ADR. -->

## Not applicable yet

<!-- Baseline items that do not apply, why, and what would make them apply. -->
