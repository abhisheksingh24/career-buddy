# Changelog fragments

Each PR adds one file here instead of editing `CHANGELOG.md`, so parallel
PRs never conflict on it.

- Name: `<issue>-<slug>.<kind>.md`, where kind is `added`, `changed`,
  `fixed`, `security` or `removed`. Example: `42-barcode-scan.added.md`.
- Body: the entry text only, as it would read after "- " (product language
  first, technical detail after). No heading, no bullet.
- At release, `node "$BUILD_EASY_HOME/scripts/changelog-collect.mjs" --version x.y.z`
  folds the fragments into `CHANGELOG.md` and deletes them.
  `--print` shows what would be added.
