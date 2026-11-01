/**
 * In-memory sliding-window rate limiter.
 *
 * State lives in this process only. That is correct for one instance; with
 * several instances each keeps its own counts, so the effective limit is
 * multiplied (ADR 0012). Move to a shared store before scaling out.
 */
export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

const hits = new Map<string, number[]>();
const MAX_KEYS = 10_000;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)),
    };
  }
  recent.push(now);
  hits.delete(key); // re-insert so the oldest keys are first for eviction
  hits.set(key, recent);
  if (hits.size > MAX_KEYS) {
    const oldest = hits.keys().next().value;
    if (oldest !== undefined) hits.delete(oldest);
  }
  return { ok: true };
}

export function resetRateLimits(): void {
  hits.clear();
}
