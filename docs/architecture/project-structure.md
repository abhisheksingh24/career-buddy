# Project Structure

This document explains the organization of our codebase.

```
career-buddy/
├── docs/                    # architecture, ux, decisions, quality, research, design
├── e2e/                     # Playwright accessibility checks
├── prisma/                  # schema.prisma and migrations/
├── public/                  # static assets
├── scripts/                 # instance.sh, perf-budget.mjs
├── src/
│   ├── app/
│   │   ├── (app)/           # signed-in pages
│   │   │   ├── analyze/     # page.tsx and interactive/page.tsx
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   └── upload/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── profile/
│   │   │   └── resume/      # [id]/file, active, analysis/[id]/categories,
│   │   │                    # analyze, suggest, upload
│   │   ├── layout.tsx
│   │   └── page.tsx         # home
│   ├── components/          # feature components (analysis results, category
│   │   │                    # panels, PDF viewer, suggestions, auth buttons)
│   │   └── ui/              # shadcn primitives (alert, badge, button, card,
│   │                        # progress, skeleton, tabs)
│   ├── lib/                 # scoring and analysis (analysis-engine, match,
│   │   │                    # semantic-match, comprehensive-scoring,
│   │   │                    # category-*, feedback-generator), AI (ai,
│   │   │                    # ai-extraction, openai-params), parse, uploads,
│   │   │                    # auth, db, logger, security-headers, schemas
│   │   └── types/           # analysis types
│   └── types/               # next-auth.d.ts
├── .env.example             # placeholders only; copy to .env
├── docker-compose.yml       # postgres and pgAdmin
├── Makefile
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Key Directories and Files

### `/docs`

Contains all project documentation, including API specs, guides, and architecture decisions.

### `/prisma`

Database-related files including schema definition and migrations. The schema defines our data models and relationships.

### `/src/app`

Next.js application routes and API endpoints. Uses the App Router pattern for routing.

- `(app)`: Route group for authenticated pages
- `api`: Backend API endpoints

### `/src/components`

Reusable React components used across multiple pages.

### `/src/lib`

Utility functions, services, and business logic.

### `/src/types`

Ambient type declarations (NextAuth session augmentation). Shared analysis types live in `src/lib/types`.

## File Naming Conventions

1. **React Components**: PascalCase with `.tsx` extension
   - Example: `AuthButtons.tsx`

2. **Utility Functions**: camelCase with `.ts` extension
   - Example: `parseResume.ts`

3. **Pages**: `page.tsx` within directories
   - Example: `src/app/(app)/dashboard/page.tsx`

4. **API Routes**: `route.ts` within directories
   - Example: `src/app/api/resume/analyze/route.ts`

5. **Test Files**: Same name as the file being tested with `.test.ts` extension
   - Example: `match.test.ts`

## Best Practices

1. Keep components small and focused
2. Use TypeScript types for all props and functions
3. Follow the file organization pattern when adding new features
4. Add documentation for new directories or significant files
5. Keep related files close together in the directory structure

## Pre-commit hook (`scripts/pre-commit.sh`)

`.husky/pre-commit` calls `scripts/pre-commit.sh`, which runs `lint-staged`
from the current worktree's own `node_modules`. If that is missing (a fresh
git worktree) or is a symlink to another checkout, the script removes the
symlink and runs `npm ci --ignore-scripts` in the worktree first. We install
instead of bypassing with `--no-verify` (which skips lint) or symlinking
(eslint then resolves `eslint-config-next` from the wrong checkout).
