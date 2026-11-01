# 0004. Use OpenAI for suggestions and embeddings, with a mock mode

- **Date:** 2026-11-01
- **Status:** Adopted
- **Issue / PR:** n/a (recorded at onboarding)

## Context

Reason not recorded. README describes mock AI mode for development without API calls.

## Options considered

Not recorded.

## Decision

`openai` SDK (default model gpt-4o-mini, text-embedding-3-small). Feature flags: `OPENAI_API_KEY`, `ENABLE_AI_SUGGESTIONS`, `MOCK_AI_SUGGESTIONS`, `ENABLE_SEMANTIC_MATCHING`. Scoring itself is local code (`src/lib/comprehensive-scoring.ts`, `match.ts`, `analysis-engine.ts`).

## Consequences

Recorded as found; revisit when a change touches it.
