# 0009. Quality profile, threat model and licence exceptions

- **Date:** 2026-11-01
- **Status:** Accepted
- **Issue / PR:** #40

## Context

The quality docs were empty templates. The product holds resumes (personal
data) off the device, so the baseline applies at ASVS L2, but several
baseline checks are not implemented yet.

## Decision

- ASVS L2. The profile and threat model state what is and is not in place
  and link each gap to its issue (#36, #37, #38, #43, #44, #7/#14). Gaps are
  not marked "not applicable"; they are open work.
- Dependency audit, licence scan and axe accessibility checks are not in CI
  yet. They are recorded as gaps rather than claimed.
- The licence scan of production packages found only permissive licences
  except: LGPL-3.0-or-later `sharp-libvips` (optional, dynamically loaded
  native binary via Next, unmodified, app hosted not distributed); `jszip`
  dual MIT or GPL (we take MIT); `caniuse-lite` CC-BY-4.0 (build data,
  attribution at distribution); `duck` with an unclassified "BSD\*" tag.
  All are accepted for now with the conditions in `licenses.md`.

## Consequences

- Reviewers can hold PRs to the stated profile and see which gaps remain.
- Adding the audit, licence and axe jobs to CI is follow-up work; the
  exceptions above go on that scan's allowlist when it is added.
- A `LICENSE` file and shipped notices are needed before a public release.
