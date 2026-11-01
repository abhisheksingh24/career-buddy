import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession } = vi.hoisted(() => ({ getServerSession: vi.fn() }));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("@/lib/db", () => ({ prisma: {}, default: { profile: { upsert: vi.fn() } } }));

import { PROFILE_RATE_LIMIT } from "@/lib/api-guard";
import { resetRateLimits } from "@/lib/rate-limit";

import { PUT } from "./route";

const put = (body: string) => new Request("http://x/", { method: "PUT", body }) as never;

beforeEach(() => {
  resetRateLimits();
  getServerSession.mockReset();
  getServerSession.mockResolvedValue({ user: { id: "u1" } });
});

describe("PUT /api/profile limits", () => {
  it("refuses bodies over the size cap with 400", async () => {
    const res = await PUT(put(JSON.stringify({ bio: "x".repeat(60_000) })));
    expect(res.status).toBe(400);
  });

  it("refuses invalid JSON with 400", async () => {
    expect((await PUT(put("{nope"))).status).toBe(400);
  });

  it("returns 429 with Retry-After past the limit", async () => {
    for (let i = 0; i < PROFILE_RATE_LIMIT.limit; i++) await PUT(put("{}"));
    const res = await PUT(put("{}"));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });
});
