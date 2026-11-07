/**
 * In-memory sliding-window rate limiter.
 *
 * State lives in this process only. That is correct for one instance; with
 * several instances each keeps its own counts, so the effective limit is
 * multiplied (ADR 0015). Move to a shared store before scaling out.
 *
 * Signed-in limits (`rateLimit`) and anonymous limits (`anonRateLimit`) use
 * separate bounded stores, so unauthenticated traffic that fills its own store
 * can never evict (and so reset) a signed-in user's counters (ADR 0022).
 */
export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export type Limiter = {
  check(key: string, limit: number, windowMs: number, now?: number): RateLimitResult;
  reset(): void;
};

export function createLimiter(maxKeys: number): Limiter {
  const hits = new Map<string, number[]>();
  return {
    check(key, limit, windowMs, now = Date.now()) {
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
      if (hits.size > maxKeys) {
        const oldest = hits.keys().next().value;
        if (oldest !== undefined) hits.delete(oldest);
      }
      return { ok: true };
    },
    reset: () => hits.clear(),
  };
}

export const ANON_MAX_KEYS = 10_000;
const userLimiter = createLimiter(10_000);
const anonLimiter = createLimiter(ANON_MAX_KEYS);

/** Limit for a signed-in user (key includes the user id). */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now?: number,
): RateLimitResult {
  return userLimiter.check(key, limit, windowMs, now);
}

/** Limit for an anonymous caller (key is a client address); its own store. */
export function anonRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now?: number,
): RateLimitResult {
  return anonLimiter.check(key, limit, windowMs, now);
}

export function resetRateLimits(): void {
  userLimiter.reset();
  anonLimiter.reset();
}
