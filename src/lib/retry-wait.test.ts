import { describe, expect, it } from "vitest";
import { formatSeconds, parseRetryAfter, rateLimitMessage, secondsLeft } from "./retry-wait";

describe("retry wait", () => {
  it("uses the singular for one second", () => {
    expect(formatSeconds(1)).toBe("1 second");
    expect(rateLimitMessage(1)).toContain("wait 1 second and");
  });
  it("uses the plural otherwise", () => {
    expect(formatSeconds(2)).toBe("2 seconds");
  });
  it("parses Retry-After", () => {
    expect(parseRetryAfter("12")).toBe(12);
    expect(parseRetryAfter(null)).toBeNull();
    expect(parseRetryAfter("0")).toBeNull();
    expect(parseRetryAfter("soon")).toBeNull();
  });
  it("counts whole seconds left, never below zero", () => {
    expect(secondsLeft(10_000, 0)).toBe(10);
    expect(secondsLeft(10_000, 9_001)).toBe(1);
    expect(secondsLeft(10_000, 10_000)).toBe(0);
    expect(secondsLeft(10_000, 20_000)).toBe(0);
  });
});
