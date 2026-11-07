# Design direction

Decided with the owner 2026-11-01: "calm, balanced design, with a thorough
emphasis on UX". Anything marked _(assumption)_ is inferred and open to change.

- **Feel:** Calm, balanced, clear.
  - Calm rules out alarm: no red walls, flashing, confetti, countdowns, or
    score-shaming. Problems are stated plainly with a next step.
  - Balanced rules out crowding and emptiness: one main thing per screen,
    generous but not sparse spacing, nothing competing with the score.
  - Clear rules out decoration that costs comprehension. UX beats visual flair.
- **Palette:** _(assumption)_ Soft off-white and warm-grey neutrals, one muted
  blue-green (teal) as the brand/action colour. Meaning is carried by colour
  plus an icon or word, never colour alone. Score bands: green-teal for strong,
  amber for improvable, a muted rust red only for real blockers (e.g. ATS
  can't read the file). Dark mode follows the same roles. Text and controls
  meet WCAG 2.2 AA. Replace the current pure-grey shadcn tokens in
  `src/app/globals.css` with these roles.
- **Type:** Keep Geist Sans (already loaded); Geist Mono only for numbers or
  code-like data. Few steps: page title, section heading, body (16px min,
  never below 14px for secondary), the score as the one large figure. Line
  length capped near 70 characters. Must reflow at large text sizes.
- **Density and shape:** Medium-spacious. Radius around 12px on cards and
  overlays, fully rounded only for chips. Soft 1px borders over shadows;
  shadow only to lift overlays. One column on phone; on laptop a capped
  content width with an optional side panel for suggestions. Touch targets at
  least 44px. On phone this is done with
  the `max-sm:` variant (44px minimum height on buttons, tabs and
  auth controls), so laptop density is unchanged. `e2e/tap-targets.spec.ts`
  guards it by measuring control heights on Home at phone width. Motion is short and gentle, off under reduced-motion.
- **Tone of words:** Plain, warm, brief; speak to the user as "you", use job
  seeker words (resume, role, job description), not jargon. Say what to do next.
  - In tone: "Your resume matches 72% of this role. Three changes would help most."
  - In tone: "Couldn't read that file. Try a PDF or paste the text."
  - Out of tone: "Error 500: analysis pipeline failure." / "Amazing! You crushed it!"
  - Waiting: "Checking your resume against the role. This can take a moment."
- **Reference apps:** None named yet. _(assumption)_ Calm, guided flows like
  Linear's restraint and Notion's quiet pages; guided-step wizards like
  TurboTax for "just answer, we'll place it". Ask the owner for one or two
  real examples later.
