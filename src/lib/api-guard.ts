import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "./auth";
import { rateLimit } from "./rate-limit";

export type GuardOptions = {
  /** Per-user limit: `limit` calls per `windowMs`, counted under `bucket`. */
  rateLimit?: { bucket: string; limit: number; windowMs: number };
};

export type GuardResult = { userId: string } | { response: NextResponse };

/**
 * The one place API routes check who is calling. Every route handler (except
 * NextAuth's own) must call this first; `api-guard.test.ts` fails if one does
 * not. Returns the user id, or the 401 / 429 response to send back.
 */
export async function guard(options: GuardOptions = {}): Promise<GuardResult> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (options.rateLimit) {
    const { bucket, limit, windowMs } = options.rateLimit;
    const result = rateLimit(`${bucket}:${userId}`, limit, windowMs);
    if (!result.ok) {
      return {
        response: NextResponse.json(
          {
            error: `You're doing that too quickly. Please wait ${result.retryAfterSeconds} seconds and try again.`,
          },
          { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
        ),
      };
    }
  }
  return { userId };
}

/** Limits for the routes that call OpenAI. */
export const AI_RATE_LIMIT = { bucket: "ai", limit: 10, windowMs: 60_000 } as const;

/** Largest JSON body accepted by the AI routes (resume plus job text). */
export const MAX_JSON_BYTES = 200_000;

/** Parse a JSON body; null when it is missing, invalid or larger than `maxBytes`. */
export async function readJson(req: Request, maxBytes = MAX_JSON_BYTES): Promise<unknown | null> {
  const text = await req.text().catch(() => "");
  if (!text || new TextEncoder().encode(text).length > maxBytes) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
