# Design system

The building blocks every screen uses, so the app feels like one product.
Owned by the dev agent; the `ux` agent checks screens against it. Point to
the code that implements each item. Direction (tone, palette rationale,
density) is in `design-direction.md`; this file is the parts.

How it grows: a new component or pattern is added only when it is useful
(a second place needs it) and unique (nothing here already does the job),
reuses the tokens and primitives, and follows the words rules below. Each
entry says **when to use** and **when not to**. Describe the parts, not the
history of one screen; screen specifics belong in the issue and the PR.

## Tokens

All raw values live in one tokens file; screens never inline them.

<!-- Colour roles with contrast-checked pairs (light and dark), type scale
(named steps, not pixel sizes), spacing scale, radii, elevation, motion.
Path to the tokens file. -->

## Layout

<!-- Width classes: compact < 600, medium 600-839, expanded 840+ (Material
3). Column caps, how screens use extra width, stack and row spacing. -->

## Primitives

<!-- Name -> purpose -> when to use / when not to -> code. At least: Screen,
Button, Stack/Row (spacing rhythm), Row with chevron, Overlay (bottom sheet
on compact, centred dialog from medium; one implementation for every sheet
and dialog), Disclosure (the control names what it reveals), CheckList
(short lines with a check). Prefer extending one over adding a near-duplicate. -->

## Patterns

<!-- Navigation and back behaviour, lists, forms and validation, empty /
loading / error states, confirmation and undo, progressive disclosure. -->

## Words

<!-- Vocabulary (one term per concept), tone, number and unit formats,
how errors and empty states are phrased. Short lines, no paragraph over two
short lines, say it once. -->

## Checking tap targets

Every control a person taps is at least 44px high at phone width (`max-sm:min-h-11`
or `max-sm:h-11`; the Button sizes already do this). That includes native file
inputs (give the input and its `file:` button the same minimum) and full-width
toggles. Text field heights are set by the form-field work, not this rule.

`e2e/tap-targets.spec.ts` checks the public Home screen in CI. It checks the
signed-in screens (`/dashboard`, `/profile`, `/upload`, `/analyze`,
`/analyze/interactive`) only when `A11Y_SESSION_TOKEN` is set, because a session
needs a database that CI does not have. To run it locally: start an instance
(`.harness/project.md`, Instance), run `scripts/test-login.mjs` for a cookie, then
`A11Y_PORT=<port> A11Y_SESSION_TOKEN=<cookie value> npx playwright test tap-targets --project=phone`.
