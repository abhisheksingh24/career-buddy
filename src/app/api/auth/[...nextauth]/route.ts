import { SIGNIN_RATE_LIMIT, clientKey, tooManyRequests } from "@/lib/api-guard";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

type Ctx = { params: Promise<{ nextauth: string[] }> };

/**
 * Sign-in has no session yet, so it is limited per client address. Only POSTs
 * (start or finish a sign-in) count; GETs (session reads, OAuth callback) are
 * not limited because the app polls the session.
 */
async function limited(req: Request, ctx: Ctx) {
  const result = rateLimit(
    `${SIGNIN_RATE_LIMIT.bucket}:${clientKey(req)}`,
    SIGNIN_RATE_LIMIT.limit,
    SIGNIN_RATE_LIMIT.windowMs,
  );
  if (!result.ok) return tooManyRequests(result.retryAfterSeconds);
  return handler(req, ctx);
}

export const GET = handler;
export { limited as POST };
