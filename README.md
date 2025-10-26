AI Resume & Portfolio Optimizer (MVP)

Tech stack: Next.js 15 (App Router), TypeScript, Tailwind v4, shadcn, NextAuth.js, Prisma, Supabase (Postgres)

Features (current)

- Auth with Google (NextAuth + Prisma adapter)
- Profile management with resume upload and storage
- Resume analysis against job descriptions with AI-powered suggestions
- Dashboard showing analysis history with matching scores
- Mock AI mode for development (no OpenAI API calls needed)

Local setup

### Quick Start (Recommended)

```bash
make init    # Complete setup: docker up, migrate, generate
make dev     # Start development server
```

### Manual Setup

1. Install deps

```bash
npm install
```

2. Environment
   Create `.env` at repo root:

```bash
# For Docker (local development)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/career_buddy

# For Supabase (production)
# DATABASE_URL=postgresql://<USER>:<PASSWORD>@db.<PROJECT-REF>.supabase.co:5432/postgres?sslmode=require

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<strong-random-string>
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>
MOCK_AI_SUGGESTIONS=true
```

3. DB schema

```bash
make migrate    # or: npx prisma migrate dev --name init
make generate   # or: npx prisma generate
```

4. Run dev server

```bash
make dev        # or: npm run dev
```

Open http://localhost:3000

### Database Management

- **pgAdmin**: http://localhost:8080
  - Email: `admin@career-buddy.local`
  - Password: `admin`
  - Add server: Host `postgres`, Port `5432`, Database `career_buddy`, User `postgres`, Password `postgres`

Auth (Google)

- In Google Cloud Console, create an OAuth 2.0 Client (Web).
- Redirect URI: `http://localhost:3000/api/auth/callback/google`
- Add your email under OAuth consent screen → Test users.

Common tasks

### Make Commands (Recommended)

```bash
make help      # Show all available commands
make init      # Complete setup: docker up, migrate, generate
make dev       # Start development server
make build     # Build for production
make test      # Run tests
make lint      # Run linting
make clean     # Clean build artifacts
make reset     # Reset everything (useful for troubleshooting)
```

### NPM Commands

```bash
npm run test   # Run tests (Node 20 LTS recommended)
npm run lint   # Format/lint
npm run build # Build for production
npm run dev   # Start development server
```

Notes

- PDF parsing is enabled by externalizing `pdf-parse` in `next.config.ts`.
- For reliability, we may switch to `pdfjs-dist` in a later iteration.

Roadmap (short term)

- Add cloud storage for resume files (S3/Supabase Storage)
- Implement multi-resume support per user
- Add recruiter dashboard for job posting
- Enhanced AI suggestions with custom prompts
- Resume templates and formatting tools
