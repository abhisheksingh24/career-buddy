# 0013. Licence scan in CI

Status: Accepted
Date: 2026-11-01

## Context

The quality bar requires a licence scan against a permissive allowlist (#41).
ADR 0009 recorded one by-hand scan and its exceptions. Secret scanning
(gitleaks) and static analysis (Semgrep) already run on every PR in
`security.yml`; the licence scan was the missing third. `license-checker`
output differs by platform because optional native packages (`@img/sharp-*`,
`@next/swc-*`) install only for the host OS and CPU.

## Decision

- New workflow `licences.yml` runs `scripts/licenses.mjs` on PRs, pushes to main
  and weekly, on the Linux runner after `npm ci --ignore-scripts`.
- The script runs the local binary of `license-checker-rseidelsohn`, an
  exact-pinned (no caret) devDependency at 5.0.1 (a maintained fork of
  license-checker, BSD-3-Clause). It is a devDependency, not a runtime one, so
  it never ships. Being in the lockfile gives it integrity hashes, `npm audit`
  coverage and Dependabot updates under the 7-day cooldown. An earlier draft
  ran it with `npx --yes` to avoid a dependency; that is superseded, because
  it fetched unlockfiled registry code on every run, outside the cooldown and
  the audit. The dev tree adds moderate advisories via `@npmcli/arborist`
  (dev only; CI audits production at high), and no new high or critical.
- Policy is `.github/licence-policy.json`: an allowlist of SPDX ids (MIT,
  Apache-2.0, ISC, BSD-2/3-Clause, 0BSD, Zlib, BlueOak-1.0.0, CC0-1.0,
  Python-2.0, Unlicense) and exceptions with reason and ADR. SPDX expressions
  are evaluated: `A OR B` passes if one side is allowed (so jszip's
  `MIT OR GPL-3.0-or-later` needs no exception), `A AND B` needs both (pako).
  Unknown, UNLICENSED and guessed (`BSD*`) licences fail unless excepted.
- Exceptions match by package name (a trailing `*` is a prefix) and the exact
  licence string, so they are platform-agnostic and a licence change on update
  fails again. An exception unused on this platform is a notice, not an error.
- Exceptions: `@img/sharp-libvips-*` (LGPL-3.0-or-later, ADR 0009),
  `caniuse-lite` (CC-BY-4.0, ADR 0009), `duck` (`BSD*`). The licence file in
  `node_modules/duck/LICENSE` is the BSD 2-clause text (Michael Williamson,
  2013), so it is permissive; the scanner only guessed.

## Consequences

- A new copyleft or unknown production licence fails PRs until replaced or
  recorded with an ADR.
- Dev dependencies are not scanned (they are not shipped).
- If the npm registry is down the `npx` fetch fails the job; re-run it.
- Platform-specific packages absent on Linux are not seen by the scan, which is
  why the exception list is name-based rather than per-platform.
