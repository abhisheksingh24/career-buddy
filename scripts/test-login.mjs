// Create a signed-in session for automated demo runs, without Google.
// Usage: TEST_LOGIN=true NEXTAUTH_URL=http://localhost:PORT DATABASE_URL=... node scripts/test-login.mjs
// Prints JSON: { name, value, url, expires }. Set that cookie in the browser.
// Refuses unless every guard in test-login-lib.mjs passes. See ADR 0016.
import { randomBytes } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import {
  assertTestLoginAllowed,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  TEST_USER_EMAIL,
} from "./test-login-lib.mjs";

try {
  assertTestLoginAllowed(process.env);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  const user = await prisma.user.upsert({
    where: { email: TEST_USER_EMAIL },
    update: {},
    create: { email: TEST_USER_EMAIL, name: "Test User" },
  });
  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { sessionToken, userId: user.id, expires } });
  console.log(
    JSON.stringify({
      name: SESSION_COOKIE,
      value: sessionToken,
      url: process.env.NEXTAUTH_URL,
      expires: expires.toISOString(),
    }),
  );
} finally {
  await prisma.$disconnect();
}
