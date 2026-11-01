# Development setup and workflow

How to run Career Buddy locally. Every command here comes from `package.json`,
`Makefile`, `docker-compose.yml`, `.env.example` and `scripts/instance.sh`.

## Prerequisites

- Git
- Node.js and npm (supported range is in `package.json` `engines`)
- Docker with Docker Compose (runs PostgreSQL and pgAdmin)

`make check-prereqs` reports what is missing.

## Setup

1. Install dependencies and generate the Prisma client:

   ```bash
   npm ci && npx prisma generate
   ```

2. Copy the example environment file to `.env` (`.env.example` is tracked and holds placeholders only):

   ```bash
   cp .env.example .env
   ```

   Set `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`). `NEXTAUTH_URL`
   is `http://localhost:3000` by default. `GOOGLE_CLIENT_ID` and
   `GOOGLE_CLIENT_SECRET` are needed to sign in (Google is the only provider).
   `MOCK_AI_SUGGESTIONS=true` (the example default) makes AI calls return canned data instead of calling OpenAI, but the suggest feature still reports AI as disabled unless `OPENAI_API_KEY` is set to any placeholder value (and `ENABLE_AI_SUGGESTIONS` is not `false`).

3. Start the database and apply migrations:

   ```bash
   docker-compose up -d
   npx prisma migrate dev
   ```

   `make init` does the install, Docker start, migrate and generate steps in one go.

## Running

```bash
npm run dev      # http://localhost:3000
```

Database defaults (from `.env.example`): database `career_buddy`, user `postgres`,
password `postgres`, port 5432.

pgAdmin is at [http://localhost:8080](http://localhost:8080). Default login is
`admin@example.com` / `admin` unless you set `PGADMIN_DEFAULT_EMAIL` and
`PGADMIN_DEFAULT_PASSWORD` in `.env`. To connect, use host `postgres`, port 5432
and the database credentials above.

### Isolated instance

`PORT=3100 INSTANCE_ID=demo scripts/instance.sh` runs the app on its own database
(`career_buddy_<id>`) and uploads directory, with mock AI. It needs the postgres
container running. See `scripts/instance.sh` for teardown.

## Checks

```bash
npm run lint
npx tsc --noEmit
npx vitest run --maxWorkers=2
npm run build
npm run format      # prettier
```

## Common tasks

- Schema change: edit `prisma/schema.prisma`, then `npx prisma migrate dev --name what_changed`.
- New API route: add `route.ts` under `src/app/api/`.
- New page: add `page.tsx` under `src/app/(app)/` for signed-in pages.

Code layout is in `docs/architecture/project-structure.md`.

## Troubleshooting

- Database connection errors: `docker ps`, then `docker-compose logs postgres`.
  Make sure `DATABASE_URL` in `.env` matches the `POSTGRES_*` values.
- Stale build: `make clean` (removes `.next`).
- Sign-in fails: check the Google variables in `.env` and that the redirect URI
  `http://localhost:3000/api/auth/callback/google` is registered.
