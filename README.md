AI Resume & Portfolio Optimizer (MVP)

Tech stack: Next.js 15 (App Router), TypeScript, Tailwind v4, shadcn, NextAuth.js, Prisma, Supabase (Postgres)

Features (current)
- Auth with Google (NextAuth + Prisma adapter)
- Upload: DOCX/TXT parsing; PDF parsing via externalized pdf-parse
- Analyze: keyword gap score; persists `Analysis` tied to user
- Dashboard: lists recent analyses

Local setup
1) Install deps
```bash
npm install
```
2) Environment
Create `.env.local` at repo root:
```bash
DATABASE_URL=postgresql://<USER>:<PASSWORD>@db.<PROJECT-REF>.supabase.co:5432/postgres?sslmode=require
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<strong-random-string>
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>
```
3) DB schema
```bash
npx prisma migrate dev --name init
npx prisma generate
```
4) Run dev server
```bash
npm run dev
```
Open http://localhost:3000

Auth (Google)
- In Google Cloud Console, create an OAuth 2.0 Client (Web).
- Redirect URI: `http://localhost:3000/api/auth/callback/google`
- Add your email under OAuth consent screen → Test users.

Common tasks
- Run tests (Node 20 LTS recommended):
```bash
npm run test
```
- Format/lint:
```bash
npm run lint
```

Notes
- PDF parsing is enabled by externalizing `pdf-parse` in `next.config.ts`.
- For reliability, we may switch to `pdfjs-dist` in a later iteration.

Roadmap (short term)
- Improve Dashboard details and UI with shadcn
- Wire OpenAI suggestions behind env key
- Add API tests (mock Prisma + session)
