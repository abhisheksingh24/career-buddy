import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 reads the connection URL here, not in schema.prisma.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
