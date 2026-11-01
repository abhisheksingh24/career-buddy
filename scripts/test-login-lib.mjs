// Guard and helpers for the demo test-login script (issue #38, ADR 0016).
// Pure functions so the guard can be unit-tested.

export const TEST_USER_EMAIL = "test-login@example.invalid";
export const SESSION_TTL_MS = 60 * 60 * 1000;
// NextAuth's cookie name over plain http (local instances never use https).
export const SESSION_COOKIE = "next-auth.session-token";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

function localUrl(raw, label) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    return `${label} is missing or not a valid URL`;
  }
  if (!LOCAL_HOSTS.has(u.hostname)) return `${label} is not local (${u.hostname})`;
  return null;
}

/**
 * Returns a list of reasons test login must NOT run (empty = allowed).
 * Every condition must hold: explicit flag, not production, local database
 * named career_buddy*, local NEXTAUTH_URL.
 */
export function testLoginRefusals(env) {
  const reasons = [];
  if (env.TEST_LOGIN !== "true") reasons.push("TEST_LOGIN is not set to true");
  if (env.NODE_ENV === "production") reasons.push("NODE_ENV is production");
  if (env.VERCEL || env.VERCEL_ENV === "production") reasons.push("running on a hosting platform");
  const db = localUrl(env.DATABASE_URL ?? "", "DATABASE_URL");
  if (db) reasons.push(db);
  else if (!new URL(env.DATABASE_URL).pathname.startsWith("/career_buddy")) {
    reasons.push("database name does not start with career_buddy");
  }
  const auth = localUrl(env.NEXTAUTH_URL ?? "", "NEXTAUTH_URL");
  if (auth) reasons.push(auth);
  return reasons;
}

export function assertTestLoginAllowed(env) {
  const reasons = testLoginRefusals(env);
  if (reasons.length) throw new Error(`Test login refused: ${reasons.join("; ")}`);
}
