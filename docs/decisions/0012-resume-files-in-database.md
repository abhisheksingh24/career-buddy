# 0012. Keep uploaded resume files in the database, with a 5 MB limit

- **Date:** 2026-11-01
- **Status:** Accepted
- **Issue / PR:** #36
- **Supersedes:** ADR 0005 for new uploads

## Context

Uploads were written to `./uploads`, which fails on serverless hosts (read-only disk, no shared state between instances) and had no size or type limits. Supabase is the intended production database.

## Options considered

- Object storage (Supabase Storage or S3): scalable, but needs a new dependency, credentials and a bucket policy before anything works.
- Local disk: not serverless-safe.
- A `bytea` column on `Resume`: no new service, owner-checked by the same query as the metadata, per-instance automatically (each instance has its own database, #44), and backed up with the data.

## Decision

Store PDF/DOCX bytes in `Resume.fileData` (Postgres `bytea`). Uploads are capped at 5 MB (Content-Length pre-check, then file size), type is decided from file content (PDF header, ZIP header plus `.docx` name, or `.txt`/`.md` without NUL bytes), and parser errors are replaced with a fixed message. The file route serves `fileData`, falling back to the legacy `fileUrl` path on disk for rows written before this change (path confined to `UPLOADS_DIR`).

## Consequences

Database size grows by up to 5 MB per resume; move to object storage if volume demands it (the file route is the only reader, so the change is local). Old disk files keep working only where the disk still exists.
