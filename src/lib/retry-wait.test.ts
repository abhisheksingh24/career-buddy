import { describe, expect, it, vi } from "vitest";

import { parseRetryAfter, rateLimitMessage, revealAlert, secondsLeft } from "./retry-wait";

describe("retry wait", () => {
  it("keeps the live message constant so it is announced once", () => {
    expect(rateLimitMessage()).toBe(
      "You're doing that too quickly. Please wait a moment and try again.",
    );
    expect(rateLimitMessage()).not.toMatch(/\d/);
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

describe("revealAlert", () => {
  it("scrolls the alert-and-button wrapper into view with the nearest block", () => {
    const scrollIntoView = vi.fn();
    revealAlert({ scrollIntoView }, false);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest", behavior: "smooth" });
  });
  it("jumps instead of animating for reduced motion", () => {
    const scrollIntoView = vi.fn();
    revealAlert({ scrollIntoView }, true);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest", behavior: "auto" });
  });
  it("ignores a missing element", () => {
    expect(() => revealAlert(null, false)).not.toThrow();
  });
});
