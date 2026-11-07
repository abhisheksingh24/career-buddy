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

### Focus ring

The keyboard focus ring is the `--ring` token in `src/app/globals.css`, drawn
as a solid 3px ring (`focus-visible:ring-[3px] ring-ring`, no opacity) on
buttons, badges and tabs. Rule: at least 3:1 against the surface it sits on
(WCAG 2.2 1.4.11). Buttons and badges that are focused and marked invalid
(`aria-invalid`) use the full-strength destructive ring
(`focus-visible:aria-invalid:ring-destructive`, no opacity) instead; the
faint `/20` ring applies only when unfocused. Measured:

| Mode  | Ring               | Against               | Ratio |
| ----- | ------------------ | --------------------- | ----- |
| Light | `oklch(0.556 0 0)` | page and card (white) | 4.7:1 |
| Light | `oklch(0.556 0 0)` | primary button        | 3.8:1 |
| Dark  | `oklch(0.708 0 0)` | page                  | 7.6:1 |
| Dark  | `oklch(0.708 0 0)` | card                  | 6.9:1 |

Before, the ring was 50% transparent (about 1.5:1). In dark mode the primary
button is near-white, so a single grey cannot reach 3:1 against both it and
the page; the outer edge on the page is what counts. `src/lib/focus-ring-contrast.test.ts`
fails if a token change drops below 3:1.

Every focusable control uses this one ring and no second outline: buttons,
tabs, text fields (`Input`, `Textarea`), the header brand link and sign in/out
button, and the file choosers. Never use `focus:ring-blue-*` or the browser's
default outline.

Scrollable regions that take focus (the interactive analysis "Category details") use the same ring drawn inset (`focus-visible:ring-inset`), so the scroll container does not clip it.

### Input and Textarea

`src/components/ui/input.tsx`. Use for every text field and text area; it
carries the focus ring (`focusRing` is exported for custom controls). Pass
layout, border and size classes as usual. Do not use a raw `<input>` or
`<textarea>` for text. File inputs stay native (hidden behind a Button, with
`peer-focus-visible:ring-ring peer-focus-visible:ring-[3px]` on the Button, or
visible with `focus-visible:ring-ring focus-visible:ring-[3px]`).

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

## Accessible names

A control with visible text takes its accessible name from that text: no `aria-label` that replaces it (WCAG 2.5.3 Label in Name). Where a name is needed and no text is visible, say the same words people see elsewhere. Toggles that show or hide a region expose `aria-expanded` (example: the Show/Hide Resume Preview bar on `/analyze/interactive`).

## Text inputs on phones

Single-line text inputs are at least 44px high below 768px (global rule in
`src/app/globals.css`, tested in `src/app/globals.test.ts`). Desktop height
is unchanged. File, checkbox and radio inputs are excluded. Text areas grow
with their rows, so the rule does not apply to them. New inputs get this
without any class; do not add a per-input height.

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
