AI Resume & Portfolio Optimizer (MVP)

Tech stack: Next.js 15 (App Router), TypeScript, Tailwind v4, shadcn, NextAuth.js, Prisma, Supabase (Postgres)

Features (current)

- Auth with Google (NextAuth + Prisma adapter)
- Profile management with resume upload and storage
- Resume analysis against job descriptions with AI-powered suggestions
- Dashboard showing analysis history with matching scores
- Mock AI mode for development (no OpenAI API calls needed)

Local setup

### Prerequisites

Before starting, ensure you have the following installed:

#### 1. Node.js (LTS version recommended)

**Check if installed:**

```bash
node --version
npm --version
```

**Installation:**

**macOS (using Homebrew):**

```bash
brew install node
```

**Linux (Ubuntu/Debian):**

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Linux (Fedora/RHEL):**

```bash
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo dnf install -y nodejs
```

**Windows / Manual installation:**

- Download from [nodejs.org](https://nodejs.org/)
- Or use [Chocolatey](https://chocolatey.org/): `choco install nodejs-lts`

#### 2. Docker Desktop

**Check if installed:**

```bash
docker --version
docker-compose --version
```

**Installation:**

**macOS:**

```bash
# Using Homebrew
brew install --cask docker

# Or download from: https://www.docker.com/products/docker-desktop/
```

**Linux (Ubuntu/Debian):**

```bash
# Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to docker group (logout/login required)
sudo usermod -aG docker $USER
```

**Windows:**

- Download from [docker.com](https://www.docker.com/products/docker-desktop/)
- Requires WSL 2 (Windows Subsystem for Linux 2)
- Or use [Chocolatey](https://chocolatey.org/): `choco install docker-desktop`

#### 3. Git

**Check if installed:**

```bash
git --version
```

**Installation:**

**macOS:**

```bash
# Using Homebrew
brew install git

# Or comes pre-installed with Xcode Command Line Tools
xcode-select --install
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt-get update
sudo apt-get install git
```

**Linux (Fedora/RHEL):**

```bash
sudo dnf install git
```

**Windows:**

- Download from [git-scm.com](https://git-scm.com/)
- Or use [Chocolatey](https://chocolatey.org/): `choco install git`

#### Verify Prerequisites

**Quick check using Make:**

```bash
make check-prereqs
```

**Or verify manually:**

```bash
node --version && npm --version && docker --version && docker-compose --version && git --version && echo "✅ All prerequisites are installed!"
```

If any command fails, install the missing prerequisite using the installation commands above.

### Quick Start (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd career-buddy
   ```

2. **Set up environment variables**

   Create a `.env` file at the repo root by copying the example file:

   ```bash
   # Copy example file
   cp .env.example .env

   # Then edit .env and update the values as needed
   ```

   Or create it manually with the following content:

   **Required** variables:

   ```bash
   # Database credentials (used by docker-compose.yml)
   POSTGRES_DB=career_buddy
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres

   # Database connection string (used by Prisma)
   # Must match the POSTGRES_* variables above
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/career_buddy

   # NextAuth (required)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
   ```

   **Optional** variables (for full functionality):

   ```bash
   # Google OAuth (optional - enables Google sign-in)
   # See "Environment Variables Reference" section below for detailed setup instructions
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>

   # OpenAI (optional - enables AI suggestions)
   OPENAI_API_KEY=<your-openai-api-key>
   OPENAI_MODEL=gpt-4o-mini
   OPENAI_TIMEOUT_MS=10000

   # Use mock AI for development (no API key needed)
   MOCK_AI_SUGGESTIONS=true
   ENABLE_AI_SUGGESTIONS=true

   # pgAdmin (optional - defaults provided in docker-compose.yml)
   PGADMIN_DEFAULT_EMAIL=admin@career-buddy.local
   PGADMIN_DEFAULT_PASSWORD=admin
   ```

   **Quick setup:**

   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32

   # Create .env file with minimum required variables
   cat > .env << EOF
   POSTGRES_DB=career_buddy
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/career_buddy
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   MOCK_AI_SUGGESTIONS=true
   EOF
   ```

   **Note:** The `POSTGRES_*` variables are used by `docker-compose.yml` to configure the database container, while `DATABASE_URL` is used by Prisma to connect. They must match for the application to work correctly.

3. **Run initialization**

   ```bash
   make init    # Installs deps, starts Docker, runs migrations
   ```

4. **Start development server**

   ```bash
   make dev     # Starts Next.js dev server
   ```

5. **Open the application**

   Navigate to http://localhost:3000

### Manual Setup (Alternative)

If you prefer to run steps manually:

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables** (see Quick Start step 2 above)

3. **Start Docker services**

   ```bash
   make docker-up    # or: docker-compose up -d
   ```

4. **Run database migrations**

   ```bash
   make migrate      # or: npx prisma migrate dev --name init
   make generate    # or: npx prisma generate
   ```

5. **Start development server**
   ```bash
   make dev         # or: npm run dev
   ```

### Database Management

- **pgAdmin**: http://localhost:8080
  - Email: `admin@career-buddy.local`
  - Password: `admin`
  - Add server: Host `postgres`, Port `5432`, Database `career_buddy`, User `postgres`, Password `postgres`

### Environment Variables Reference

#### Required Variables

- `POSTGRES_DB` - Database name (used by docker-compose.yml)
  - Default: `career_buddy`
  - Must match the database name in `DATABASE_URL`
- `POSTGRES_USER` - Database username (used by docker-compose.yml)
  - Default: `postgres`
  - Must match the username in `DATABASE_URL`
- `POSTGRES_PASSWORD` - Database password (used by docker-compose.yml)
  - Default: `postgres`
  - Must match the password in `DATABASE_URL`
- `DATABASE_URL` - PostgreSQL connection string (used by Prisma)
  - **Where it's used:**
    - Prisma ORM reads this from `prisma/schema.prisma` (line 8: `url = env("DATABASE_URL")`)
    - Used by Prisma Client to connect to the database when:
      - Running migrations (`npx prisma migrate`)
      - Generating Prisma Client (`npx prisma generate`)
      - Executing database queries (via `prisma` instance in `src/lib/db.ts`)
    - Used throughout the app for all database operations:
      - Authentication (NextAuth with PrismaAdapter)
      - Profile management (`/api/profile`)
      - Resume uploads and analysis (`/api/resume/*`)
      - Dashboard data (`/dashboard`)
  - **Why it's in `.env`:**
    - **Security**: Contains database credentials (username, password) that should never be committed to git
    - **Flexibility**: Allows different databases for dev/staging/production without code changes
    - **Prisma requirement**: Prisma reads this environment variable to establish database connections
    - **Best practice**: Keeps sensitive configuration separate from application code
  - **Format:**
    - Docker default: `postgresql://postgres:postgres@localhost:5432/career_buddy`
    - Supabase: `postgresql://<USER>:<PASSWORD>@db.<PROJECT-REF>.supabase.co:5432/postgres?sslmode=require`
    - General: `postgresql://[user]:[password]@[host]:[port]/[database]`
  - **Important:** `DATABASE_URL` must match the `POSTGRES_*` variables above. The `docker-compose.yml` file reads `POSTGRES_*` variables to configure the database container, while Prisma uses `DATABASE_URL` to connect. They serve as a single source of truth when kept in sync.
  - **📖 For detailed explanation**: See [`docs/DATABASE_URL_EXPLAINED.md`](docs/DATABASE_URL_EXPLAINED.md)
- `NEXTAUTH_URL` - Base URL of your application (e.g., `http://localhost:3000`)
- `NEXTAUTH_SECRET` - Secret key for NextAuth (generate with `openssl rand -base64 32`)

#### Optional Variables

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - For Google OAuth sign-in

  **How to obtain Google OAuth credentials:**
  1. **Go to Google Cloud Console**
     - Visit [Google Cloud Console](https://console.cloud.google.com/)
     - Sign in with your Google account
  2. **Create or Select a Project**
     - Click the project dropdown at the top
     - Click "New Project" or select an existing project
     - Give it a name (e.g., "Career Buddy")
     - Click "Create"
  3. **Configure OAuth Consent Screen**
     - Note: You don't need to enable any specific APIs for basic OAuth sign-in
     - Go to "APIs & Services" → "OAuth consent screen"
     - Go to "APIs & Services" → "OAuth consent screen"
     - Select "External" (unless you have a Google Workspace account)
     - Click "Create"
     - Fill in the required fields:
       - App name: `Career Buddy` (or your preferred name)
       - User support email: Your email
       - Developer contact email: Your email
     - Click "Save and Continue"
     - On "Scopes" page, click "Save and Continue" (default scopes are fine for basic sign-in)
     - On "Test users" page, click "+ ADD USERS"
     - Add your Google email address (and any other test users)
     - Click "Save and Continue"
  4. **Create OAuth 2.0 Credentials**
     - Go to "APIs & Services" → "Credentials"
     - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
     - Application type: Select "Web application"
     - Name: `Career Buddy Local` (or your preferred name)
     - Authorized redirect URIs: Click "+ ADD URI"
     - Add: `http://localhost:3000/api/auth/callback/google`
     - Click "Create"
  5. **Copy Your Credentials**
     - A popup will show your Client ID and Client Secret
     - Copy both values immediately (you won't see the secret again)
     - Or go back to "Credentials" → Click on your OAuth 2.0 Client ID
     - Copy the Client ID and Client Secret
  6. **Add to `.env` file**
     ```bash
     GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your-client-secret-here
     ```

  **Important Notes:**
  - For local development, use `http://localhost:3000/api/auth/callback/google` as the redirect URI
  - For production, add your production URL: `https://yourdomain.com/api/auth/callback/google`
  - The OAuth consent screen will show "This app isn't verified" for external apps - this is normal for development
  - Test users must be added to access the app during development

- `OPENAI_API_KEY` - For AI-powered suggestions (or use `MOCK_AI_SUGGESTIONS=true`)
- `OPENAI_MODEL` - OpenAI model to use (default: `gpt-4o-mini`)
- `OPENAI_TIMEOUT_MS` - Timeout for OpenAI requests (default: `10000`)
- `MOCK_AI_SUGGESTIONS` - Set to `true` to use mock AI (no API key needed)
- `ENABLE_AI_SUGGESTIONS` - Set to `false` to disable AI features entirely

Common tasks

### Make Commands (Recommended)

```bash
make help         # Show all available commands
make check-prereqs # Check if all prerequisites are installed
make init         # Complete setup: install deps, docker up, migrate, generate
make install      # Install npm dependencies
make dev          # Start development server
make build        # Build for production
make test         # Run tests
make lint         # Run linting
make clean        # Clean build artifacts
make reset        # Reset everything (useful for troubleshooting)
```

**Note:** `make init` requires a `.env` file to be set up first. See Quick Start above.

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
