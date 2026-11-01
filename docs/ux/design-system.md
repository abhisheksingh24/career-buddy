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

## Text inputs on phones

Single-line text inputs are at least 44px high below 768px (global rule in
`src/app/globals.css`, tested in `src/app/globals.test.ts`). Desktop height
is unchanged. File, checkbox and radio inputs are excluded. Text areas grow
with their rows, so the rule does not apply to them. New inputs get this
without any class; do not add a per-input height.
