# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Career Buddy is a Next.js 15 (App Router + Turbopack) TypeScript application for AI-powered resume analysis. It uses PostgreSQL (via Docker), Prisma ORM, NextAuth.js for auth, and shadcn/ui components.

### Running services

- **PostgreSQL**: `sudo docker compose up -d postgres` (port 5432). Docker daemon must be started first with `sudo dockerd &>/tmp/dockerd.log &` — wait a few seconds before running containers. The nested container environment requires `fuse-overlayfs` storage driver and `iptables-legacy` (already configured in the VM snapshot).
- **Dev server**: `npm run dev` (port 3000, uses Turbopack). The dev server does not require authentication to access the homepage or the `/analyze` page.
- See `README.md` and `Makefile` (`make help`) for all standard commands.

### Key commands

| Task                   | Command                              |
| ---------------------- | ------------------------------------ |
| Install deps           | `npm install`                        |
| Lint                   | `npm run lint`                       |
| Test                   | `npm run test` (vitest)              |
| Dev server             | `npm run dev`                        |
| Build                  | `npm run build`                      |
| DB migrations          | `npx prisma migrate dev --name init` |
| Generate Prisma client | `npx prisma generate`                |

### Non-obvious notes

- `jsdom` is required for vitest but is not listed in `package.json` devDependencies. If tests fail with "Cannot find package 'jsdom'", run `npm install --save-dev jsdom`.
- The `.env` file must exist before running migrations or the dev server. Copy from `.env.example` and at minimum set `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`).
- `MOCK_AI_SUGGESTIONS=true` enables mock AI mode so the app works without an OpenAI API key.
- The `/analyze` page and its API (`/api/resume/analyze`) work without authentication. Auth is only needed to persist analysis results to the database.
- Husky pre-commit hook runs `lint-staged` (prettier + eslint --fix) on staged files.
- Lint produces warnings (unused vars, import order) but passes with exit code 0.
