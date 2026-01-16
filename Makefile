# Career Buddy - Development Makefile

.PHONY: help init install deps dev build test lint clean docker-up docker-down migrate generate check-prereqs

# Default target
help:
	@echo "Career Buddy - Available commands:"
	@echo "  make check-prereqs - Check if all prerequisites are installed"
	@echo "  make init     - Complete setup: install deps, docker up, migrate, generate"
	@echo "  make install  - Install npm dependencies"
	@echo "  make dev      - Start development server"
	@echo "  make build    - Build for production"
	@echo "  make test     - Run tests"
	@echo "  make lint     - Run linting"
	@echo "  make clean    - Clean build artifacts"
	@echo "  make docker-up   - Start Docker services"
	@echo "  make docker-down - Stop Docker services"
	@echo "  make migrate     - Run Prisma migrations"
	@echo "  make generate    - Generate Prisma client"

# Check prerequisites
check-prereqs:
	@echo "🔍 Checking prerequisites..."
	@echo ""
	@which node >/dev/null 2>&1 && echo "✅ Node.js: $$(node --version)" || echo "❌ Node.js: Not installed (see README.md for installation)"
	@which npm >/dev/null 2>&1 && echo "✅ npm: $$(npm --version)" || echo "❌ npm: Not installed"
	@which docker >/dev/null 2>&1 && echo "✅ Docker: $$(docker --version 2>/dev/null | head -1 | cut -d' ' -f3 | cut -d',' -f1 || echo 'installed')" || echo "❌ Docker: Not installed (see README.md for installation)"
	@which docker-compose >/dev/null 2>&1 && echo "✅ Docker Compose: $$(docker-compose --version 2>/dev/null | head -1 | cut -d' ' -f4 | cut -d',' -f1 || echo 'installed')" || echo "❌ Docker Compose: Not installed"
	@which git >/dev/null 2>&1 && echo "✅ Git: $$(git --version | cut -d' ' -f3)" || echo "❌ Git: Not installed (see README.md for installation)"
	@echo ""
	@echo "📝 If any prerequisites are missing, see README.md for installation instructions"

# Install npm dependencies
install:
	@echo "📦 Installing npm dependencies..."
	npm install
	@echo "✅ Dependencies installed"

# Complete initialization - handles everything needed to start development
# Note: Requires .env file to be set up first (see README)
init: install docker-up migrate generate
	@echo ""
	@echo "✅ Career Buddy initialization complete!"
	@echo "🚀 Run 'make dev' to start the development server"
	@echo ""
	@echo "📝 Important: Make sure your .env file is configured:"
	@echo "   - Copy .env.example to .env (if it exists)"
	@echo "   - Set DATABASE_URL (default for Docker: postgresql://postgres:postgres@localhost:5432/career_buddy)"
	@echo "   - Set NEXTAUTH_URL and NEXTAUTH_SECRET (required)"
	@echo "   - Optional: GOOGLE_CLIENT_ID/SECRET, OPENAI_API_KEY"
	@echo ""
	@echo "   See README.md for detailed setup instructions"

# Start Docker services
docker-up:
	@echo "🐳 Starting Docker services..."
	docker-compose up -d
	@echo "⏳ Waiting for database to be ready..."
	@sleep 5
	@echo "📊 pgAdmin available at: http://localhost:8080"
	@echo "   Email: admin@career-buddy.local"
	@echo "   Password: admin"

# Stop Docker services
docker-down:
	@echo "🛑 Stopping Docker services..."
	docker-compose down

# Run Prisma migrations
migrate:
	@echo "📊 Running Prisma migrations..."
	npx prisma migrate dev --name init
	@echo "✅ Database migrations applied"

# Generate Prisma client
generate:
	@echo "🔧 Generating Prisma client..."
	npx prisma generate
	@echo "✅ Prisma client generated"

# Start development server
dev:
	@echo "🚀 Starting development server..."
	npm run dev

# Build for production
build:
	@echo "🏗️  Building for production..."
	npm run build

# Run tests
test:
	@echo "🧪 Running tests..."
	npm run test

# Run linting
lint:
	@echo "🔍 Running linting..."
	npm run lint

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf .next
	rm -rf node_modules/.cache
	@echo "✅ Clean complete"

# Reset everything (useful for troubleshooting)
reset: docker-down clean
	@echo "🔄 Resetting project..."
	docker-compose up -d
	@sleep 5
	npx prisma migrate reset --force
	npx prisma generate
	@echo "✅ Project reset complete"
