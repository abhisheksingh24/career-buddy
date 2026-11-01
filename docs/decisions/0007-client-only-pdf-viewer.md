# 0007. Load the PDF viewer client-side only

- **Date:** 2026-11-01
- **Status:** Accepted
- **Issue / PR:** #1 / #62

## Context

`npm run build` failed prerendering `/analyze/interactive` with `ReferenceError: DOMMatrix is not defined`: pdf.js (via react-pdf) uses browser-only globals at import time.

## Options considered

- Polyfill `DOMMatrix` on the server: adds a dependency and hides a real constraint.
- `next/dynamic` with `ssr: false`: the viewer only makes sense in the browser anyway.

## Decision

Import `ResumePDFViewer` with `next/dynamic({ ssr: false })` and a `Skeleton` loading state. Also add `jsdom` as a devDependency (Vitest environment) and declare Node `^20.19 || ^22.13 || >=24` in `engines` and `.nvmrc`, as jsdom requires.

## Consequences

The viewer is absent from server-rendered HTML and appears after hydration. Any new component using pdf.js must be loaded the same way.
