import "dotenv/config";
import { defineConfig } from "prisma/config";

// Commands that connect to a database. `prisma generate` does not, so it must
// keep working with no DATABASE_URL (CI install, `next build`).
const NEEDS_DATABASE = ["migrate", "db", "studio"];
const url = process.env.DATABASE_URL ?? "";
if (!url && process.argv.some((a) => NEEDS_DATABASE.includes(a))) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env or export it before running this Prisma command.",
  );
}

// Prisma 7 reads the connection URL here, not in schema.prisma.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url },
});
