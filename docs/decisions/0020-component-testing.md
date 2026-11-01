# 0020. Component tests with Testing Library on Vitest

- **Date:** 2026-11-02
- **Status:** Accepted
- **Issue / PR:** #120

## Context

Client pages (for example `/profile` when signed out) could not be tested: Vitest only matched `*.test.ts` and had no DOM assertions. ADR 0006 chose Vitest with jsdom; ADR 0011 covers the jsdom Node range.

## Decision

Vitest now also runs `src/**/*.test.tsx`. JSX needs no plugin: Vitest transforms it using `jsx: react-jsx` from `tsconfig.json`. `vitest.setup.ts` adds the `@testing-library/jest-dom` matchers and cleans up after each test. Three exact-pinned devDependencies were added: `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/dom` (peer of react). `user-event` is not added; `fireEvent` is enough until a test needs realistic typing. All are MIT, older than the Dependabot cooldown, and dev-only (the licence scan covers production packages).

Convention: put `page.test.tsx` next to the page; mock `next-auth/react` (`useSession`, `signIn`) and `fetch` at the module boundary; assert on roles and text the user sees.

## Consequences

Component tests run in the same `npx vitest run` as CI. The example is `src/app/(app)/profile/page.test.tsx`.
