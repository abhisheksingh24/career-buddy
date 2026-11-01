import { beforeEach, describe, expect, it } from "vitest";

import { rateLimit, resetRateLimits } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(resetRateLimits);

  it("allows up to the limit then refuses with a wait time", () => {
    for (let i = 0; i < 3; i++) expect(rateLimit("k", 3, 60_000, 1000 + i).ok).toBe(true);
    const r = rateLimit("k", 3, 60_000, 2000);
    expect(r).toEqual({ ok: false, retryAfterSeconds: 59 });
  });

  it("allows again once the window has passed", () => {
    for (let i = 0; i < 3; i++) rateLimit("k", 3, 60_000, 1000);
    expect(rateLimit("k", 3, 60_000, 61_001).ok).toBe(true);
  });

  it("counts each key separately", () => {
    rateLimit("a", 1, 60_000, 1000);
    expect(rateLimit("a", 1, 60_000, 1001).ok).toBe(false);
    expect(rateLimit("b", 1, 60_000, 1001).ok).toBe(true);
  });
});
