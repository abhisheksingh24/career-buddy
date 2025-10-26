# Career Buddy - Development Makefile

.PHONY: help init dev build test lint clean docker-up docker-down migrate generate

# Default target
help:
	@echo "Career Buddy - Available commands:"
	@echo "  make init     - Complete setup: docker up, migrate, generate, install deps"
	@echo "  make dev      - Start development server"
	@echo "  make build    - Build for production"
	@echo "  make test     - Run tests"
	@echo "  make lint     - Run linting"
	@echo "  make clean    - Clean build artifacts"
	@echo "  make docker-up   - Start Docker services"
	@echo "  make docker-down - Stop Docker services"
	@echo "  make migrate     - Run Prisma migrations"
	@echo "  make generate    - Generate Prisma client"

# Complete initialization - handles everything needed to start development
init: docker-up migrate generate
	@echo "✅ Career Buddy initialization complete!"
	@echo "🚀 Run 'make dev' to start the development server"
	@echo ""
	@echo "📝 Note: Make sure your .env file has the correct DATABASE_URL"
	@echo "   For Docker: postgresql://postgres:postgres@localhost:5432/career_buddy"
	@echo "   For Supabase: postgresql://user:pass@host:5432/db?sslmode=require"

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
