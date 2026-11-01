import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "./auth";
import { rateLimit } from "./rate-limit";
import { readBodyLimited } from "./read-limited-body";

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
 * Client address for limiting anonymous calls, or null when it cannot be known
 * safely. Forwarding headers are client-controlled unless a proxy we run sets
 * them, so they are read only when `TRUSTED_PROXY=true`. Then the entry the
 * proxy appended is used: the Nth from the right, N = `TRUSTED_PROXY_HOPS`
 * (default 1), never the first (which the client writes). If the header has
 * fewer entries than the hop count the chain is not what we configured, so
 * the result is null; `X-Real-IP` is used only when the header is absent
 * entirely. Untrusted: null, and the caller skips per-address limiting rather
 * than sharing one bucket that a single client could fill (ADR 0022).
 */
export function clientKey(req: Request): string | null {
  if (process.env.TRUSTED_PROXY !== "true") return null;
  const hops = Math.max(1, Math.floor(Number(process.env.TRUSTED_PROXY_HOPS)) || 1);
  const entries = (req.headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (entries.length > 0) {
    return entries.length >= hops ? entries[entries.length - hops] : null;
  }
  return req.headers.get("x-real-ip")?.trim() || null;
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
  // Count bytes as they arrive so a chunked body with no Content-Length is
  // never buffered past the cap.
  const bytes = await readBodyLimited(req, maxBytes).catch(() => null);
  if (!bytes || bytes.byteLength === 0) return null;
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}
