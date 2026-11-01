# Project

## Product

<!-- Filled during onboarding, in the owner's own language. -->

**What it is:**

**Who it's for:**

**What they most want to do:**

**Where they use it:**

**What a good first version looks like:**

## Engineering

<!-- Owned by the dev agent. Keep every command copy-pasteable and current. -->

**Stack:** TypeScript, Next.js 15 (App Router, Turbopack dev), React 19, Tailwind v4 + shadcn/Radix, NextAuth v4 (Google, database sessions), Prisma 6 on PostgreSQL (Docker locally, Supabase intended in production), OpenAI (optional, mock mode), Vitest. See docs/decisions/0001-0006 and docs/architecture/README.md.

**Install:** `npm ci && npx prisma generate` (needs a `.env` copied from `.env.example`; note `.env.example` is git-ignored, see gaps). Database: `docker-compose up -d` then `npx prisma migrate dev` (or `make init`).

**Run (web):** `npm run dev` (http://localhost:3000). Set `MOCK_AI_SUGGESTIONS=true` to run without an OpenAI key.

**Run (mobile):** not applicable (web only).

**Test:** `npx vitest run --maxWorkers=2`. Currently RED: `jsdom` is configured as the test environment but is not in package.json (see baseline). Only one test file exists (`src/lib/match.test.ts`).

**Lint:** `npm run lint` (next lint; passes with warnings). Typecheck: `npx tsc --noEmit` (currently 34 errors). Format: `npm run format`.

**Build:** `npm run build` (currently fails on a type error in `src/app/api/resume/[id]/file/route.ts`).

**Instance:** `PORT=$PORT npx next dev -p $PORT` (unverified; needs per-instance Postgres, e.g. `DATABASE_URL` pointing at a database named for `$INSTANCE_ID`, and `NEXTAUTH_URL=http://localhost:$PORT`). Ready path: `/api/auth/providers` (unverified). Resume files are written to `./uploads/`, which is not per-instance.

**CI:** `layered` (no existing workflows; harness workflows added alongside).

**Demo:** start the instance with `MOCK_AI_SUGGESTIONS=true`; sign-in is Google OAuth only (no credentials provider), so the demo agent needs a seeded session row in the database or test credentials (unverified). Screens: `/`, `/dashboard`, `/profile`, `/upload`, `/analyze`, `/analyze/interactive`.

**Deploy:** (not yet; README names Supabase for the database, no hosting config in the repo)
