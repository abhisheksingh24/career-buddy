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
    if (!result.ok) return { response: tooManyRequests(result.retryAfterSeconds) };
  }
  return { userId };
}

/** Limits for the routes that call OpenAI. */
export const AI_RATE_LIMIT = { bucket: "ai", limit: 10, windowMs: 60_000 } as const;

/** Limits for resume uploads (parsing is CPU heavy and rows are large). */
export const UPLOAD_RATE_LIMIT = { bucket: "upload", limit: 10, windowMs: 60_000 } as const;

/** Limits for profile writes. */
export const PROFILE_RATE_LIMIT = { bucket: "profile", limit: 30, windowMs: 60_000 } as const;

/** Limits for sign-in requests, counted per client address (no session yet). */
export const SIGNIN_RATE_LIMIT = { bucket: "signin", limit: 20, windowMs: 60_000 } as const;

/** Largest JSON body accepted by the profile route. */
export const MAX_PROFILE_BYTES = 50_000;

/**
 * Best-effort client address for limiting anonymous calls. Behind a proxy this
 * is the first X-Forwarded-For entry, which a client can spoof unless the proxy
 * overwrites it; a missing header shares one "unknown" bucket (stricter, not looser).
 */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** 429 response for a refused rate-limit check. */
export function tooManyRequests(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    {
      error: `You're doing that too quickly. Please wait ${retryAfterSeconds} ${retryAfterSeconds === 1 ? "second" : "seconds"} and try again.`,
    },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

/** Largest JSON body accepted by the AI routes (resume plus job text). */
export const MAX_JSON_BYTES = 200_000;

/** Parse a JSON body; null when it is missing, invalid or larger than `maxBytes`. */
export async function readJson(req: Request, maxBytes = MAX_JSON_BYTES): Promise<unknown | null> {
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  const text = await req.text().catch(() => "");
  if (!text || new TextEncoder().encode(text).length > maxBytes) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
