# 0002. Use PostgreSQL with Prisma

- **Date:** 2026-11-01
- **Status:** Adopted
- **Issue / PR:** n/a (recorded at onboarding)

## Context

Reason not recorded. README names Supabase as the production Postgres; docker-compose.yml runs Postgres 15 and pgAdmin locally.

## Options considered

Not recorded.

## Decision

Prisma 7 with the `pg` driver adapter, see ADR 0020 (`prisma/schema.prisma`, migrations in `prisma/migrations`) over PostgreSQL. Models: User, Account, Session, VerificationToken, Profile, Portfolio, Resume, JobApplication, ResumeAnalysis, Review.

## Consequences

Recorded as found; revisit when a change touches it.
