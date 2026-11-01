# Project guide

This product is built and maintained by the **build-easy** harness
(PM, Dev, Reviewer, UX and Demo roles run by Claude). The owner steers as a
user; the harness's rules are injected at session start.

Start here to understand the project:

- What it is and how to run it: @.harness/project.md
- Owner preferences and lessons learned: @.harness/learnings.md
- How the product is used and the UX rules: `docs/ux/`
- Research already done and what was decided: `docs/research/`
- Approved designs (technical mode only): `docs/design/`
- Architecture: `docs/architecture/README.md`
- Why things are the way they are: `docs/decisions/`
- What changed when: `CHANGELOG.md` and merged PRs. A PR adds a fragment in
  `docs/changelog.d/` and does not edit `CHANGELOG.md` (`docs/changelog.d/README.md`)
- Work items: GitHub Issues (`node "$BUILD_EASY_HOME/scripts/board.mjs"`)
