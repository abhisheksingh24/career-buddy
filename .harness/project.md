# Project

## Product

<!-- Filled during onboarding, in the owner's own language. -->

**What it is:** A resume and job-search companion for job seekers. Today it scores an uploaded resume against a job description and suggests improvements. The goal is a polished end-to-end app: build your resume in the UI, get it scored (including ATS) with suggestions that are accurate and useful, and tailor it to a role easily.

**Who it's for:** All job seekers. The owner is the first user. The plan is to make it public as soon as it is production-ready and secure.

**What they most want to do:**

1. Build a base resume in the UI.
2. See how relevant a job is and how good a fit they are.
3. Tailor the resume to a specific role.
4. Score the resume and get suggestions to improve it, including ATS.
5. Later: scrape for jobs, track applications, and (distant future) build a community.

**Where they use it:** Phone and laptop.

**What would make them stop using it:** Inaccurate scores or suggestions that are not useful.

**What a good first version looks like:** A polished end-to-end application that lets you build your resume via the UI, suggests improvements, scores it, and helps you tailor it to a role easily.

**Reference:** The owner started a different take at `~/projects/resume` with more structured architecture choices; borrow from it where it helps. Direction after setup is to be discussed in detail with the owner.

## Engineering

<!-- Owned by the dev agent. Keep every command copy-pasteable and current. -->

**Stack:** TypeScript, Next.js 16 (App Router, Turbopack dev), React 19, Tailwind v4 + shadcn/Radix, NextAuth v4 (Google, database sessions), Prisma 6 on PostgreSQL (Docker locally, Supabase intended in production), OpenAI (optional, mock mode), Vitest. See docs/decisions/0001-0006 and docs/architecture/README.md.

**Install:** `npm ci && npx prisma generate` (needs a `.env` copied from `.env.example`; note `.env.example` is git-ignored, see gaps). Database: `docker-compose up -d` then `npx prisma migrate dev` (or `make init`).

**Run (web):** `npm run dev` (http://localhost:3000). Set `MOCK_AI_SUGGESTIONS=true` to run without an OpenAI key.

**Run (mobile):** not applicable (web only).

**Test:** `npx vitest run --maxWorkers=2`. Green. `jsdom` (the configured test environment) is a devDependency. Only one test file exists (`src/lib/match.test.ts`).

**Lint:** `npm run lint` (`eslint .`; passes with warnings). Typecheck: `npx tsc --noEmit` (clean). Format: `npm run format`.

**Build:** `npm run build` (green).

**Instance:** `PORT=$PORT npx next dev -p $PORT` (unverified; needs per-instance Postgres, e.g. `DATABASE_URL` pointing at a database named for `$INSTANCE_ID`, and `NEXTAUTH_URL=http://localhost:$PORT`). Ready path: `/api/auth/providers` (unverified). Resume files are written to `./uploads/`, which is not per-instance.

**CI:** `layered` (no existing workflows; harness workflows added alongside).

**Demo:** start the instance with `MOCK_AI_SUGGESTIONS=true`; sign-in is Google OAuth only (no credentials provider), so the demo agent needs a seeded session row in the database or test credentials (unverified). Screens: `/`, `/dashboard`, `/profile`, `/upload`, `/analyze`, `/analyze/interactive`.

**Deploy:** (not yet; README names Supabase for the database, no hosting config in the repo)
