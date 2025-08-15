# Project Structure

This document explains the organization of our codebase.

```
career-buddy/
├── docs/                      # Documentation
│   ├── API.md                # API documentation
│   ├── ONBOARDING.md         # Onboarding guide
│   └── PROJECT_STRUCTURE.md  # This file
│
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma        # Database models
│   └── migrations/          # Database migrations
│
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── (app)/          # Protected routes (require auth)
│   │   │   ├── analyze/    # Resume analysis page
│   │   │   ├── dashboard/  # User dashboard
│   │   │   ├── profile/    # User profile
│   │   │   └── upload/     # Resume upload
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication endpoints
│   │   │   ├── profile/   # Profile management
│   │   │   └── resume/    # Resume operations
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   │
│   ├── components/         # Reusable React components
│   │   ├── auth-buttons.tsx
│   │   ├── providers.tsx
│   │   └── suggestions-list.tsx
│   │
│   ├── lib/               # Utility functions and services
│   │   ├── ai.ts         # OpenAI integration
│   │   ├── auth.ts       # Authentication setup
│   │   ├── db.ts         # Database client
│   │   ├── logger.ts     # Logging utility
│   │   ├── match.ts      # Resume matching logic
│   │   └── parse.ts      # Resume parsing
│   │
│   └── types/            # TypeScript type definitions
│
├── public/               # Static assets
│
├── .env.example         # Example environment variables
├── .env.local          # Local environment variables (git-ignored)
├── docker-compose.yml   # Docker configuration
├── next.config.ts      # Next.js configuration
├── package.json        # Project dependencies
├── README.md           # Project overview
└── tsconfig.json       # TypeScript configuration
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

TypeScript type definitions and interfaces.

## File Naming Conventions

1. **React Components**: PascalCase with `.tsx` extension
   - Example: `AuthButtons.tsx`

2. **Utility Functions**: camelCase with `.ts` extension
   - Example: `parseResume.ts`

3. **Pages**: `page.tsx` within directories
   - Example: `src/app/dashboard/page.tsx`

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
