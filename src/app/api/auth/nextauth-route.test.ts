// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { handler } = vi.hoisted(() => ({
  handler: vi.fn(async () => new Response("ok")),
}));
vi.mock("next-auth", () => ({ default: () => handler }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { SIGNIN_RATE_LIMIT } from "@/lib/api-guard";
import { rateLimit, resetRateLimits, ANON_MAX_KEYS, anonRateLimit } from "@/lib/rate-limit";

import { GET, POST } from "./[...nextauth]/route";

const ctx = { params: Promise.resolve({ nextauth: ["signin", "google"] }) };
const call = (fn: unknown, method: string, ip?: string) =>
  (fn as (r: Request, c: typeof ctx) => Promise<Response>)(
    new Request("http://x/api/auth/signin/google", {
      method,
      headers: ip ? { "x-forwarded-for": `6.6.6.6, ${ip}` } : {},
    }),
    ctx,
  );

beforeEach(() => {
  resetRateLimits();
  handler.mockClear();
  vi.stubEnv("TRUSTED_PROXY", "true");
});
afterEach(() => vi.unstubAllEnvs());

describe("NextAuth route limits", () => {
  it("limits POST per address with 429, a body and Retry-After", async () => {
    for (let i = 0; i < SIGNIN_RATE_LIMIT.limit; i++) {
      expect((await call(POST, "POST", "9.9.9.9")).status).toBe(200);
    }
    const res = await call(POST, "POST", "9.9.9.9");
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect((await res.json()).error).toMatch(/too quickly/);
    expect((await call(POST, "POST", "8.8.8.8")).status).toBe(200);
  });

  it("rotating the client's first forwarded entry does not evade the limit", async () => {
    for (let i = 0; i < SIGNIN_RATE_LIMIT.limit; i++) await call(POST, "POST", "9.9.9.9");
    const res = await POST(
      new Request("http://x/", {
        method: "POST",
        headers: { "x-forwarded-for": "1.1.1.1, 9.9.9.9" },
      }),
      ctx,
    );
    expect(res.status).toBe(429);
  });

  it("never limits GET", async () => {
    for (let i = 0; i < SIGNIN_RATE_LIMIT.limit * 3; i++) {
      expect((await call(GET, "GET", "9.9.9.9")).status).toBe(200);
    }
  });

  it("does not limit POST when no proxy is trusted (no shared bucket)", async () => {
    vi.stubEnv("TRUSTED_PROXY", "false");
    for (let i = 0; i < SIGNIN_RATE_LIMIT.limit * 3; i++) {
      expect((await call(POST, "POST")).status).toBe(200);
    }
  });

  it("flooding sign-in keys does not reset a user's bucket", () => {
    rateLimit("ai:u1", 1, 60_000, 1000);
    expect(rateLimit("ai:u1", 1, 60_000, 1001).ok).toBe(false);
    for (let i = 0; i < ANON_MAX_KEYS + 50; i++) anonRateLimit(`signin:ip${i}`, 20, 60_000, 1002);
    expect(rateLimit("ai:u1", 1, 60_000, 1003).ok).toBe(false);
  });
});
