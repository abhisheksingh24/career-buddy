import { describe, expect, it } from "vitest";

import { safeCallbackUrl } from "./callback-url";

describe("safeCallbackUrl", () => {
  it("keeps same-site paths with query", () => {
    expect(safeCallbackUrl("/analyze")).toBe("/analyze");
    expect(safeCallbackUrl("/analyze/interactive?x=1")).toBe("/analyze/interactive?x=1");
  });
  it("falls back to the dashboard when missing or off-site", () => {
    for (const v of [
      undefined,
      null,
      "",
      "https://evil.com",
      "//evil.com",
      "/\\evil.com",
      "javascript:alert(1)",
      "evil",
      "/a\nb",
    ]) {
      expect(safeCallbackUrl(v)).toBe("/dashboard");
    }
  });
  it("uses the first value of a repeated param", () => {
    expect(safeCallbackUrl(["/upload", "https://evil.com"])).toBe("/upload");
  });

  describe("absolute URLs", () => {
    const origin = "http://localhost:3000";
    it("accepts the app origin and returns path and query only", () => {
      expect(safeCallbackUrl("http://localhost:3000/", origin)).toBe("/");
      expect(safeCallbackUrl("http://localhost:3000/analyze?x=1#h", origin)).toBe("/analyze?x=1");
      expect(safeCallbackUrl("https://app.example.com/upload", "https://app.example.com")).toBe(
        "/upload",
      );
    });
    it("leaves percent-encoded characters encoded (same as a relative path)", () => {
      expect(safeCallbackUrl("http://localhost:3000/%0d%0a", origin)).toBe("/%0d%0a");
    });
    it("uses NEXTAUTH_URL by default and rejects when unset", () => {
      const prev = process.env.NEXTAUTH_URL;
      process.env.NEXTAUTH_URL = "http://localhost:3000/";
      expect(safeCallbackUrl("http://localhost:3000/upload")).toBe("/upload");
      delete process.env.NEXTAUTH_URL;
      expect(safeCallbackUrl("http://localhost:3000/upload")).toBe("/dashboard");
      if (prev !== undefined) process.env.NEXTAUTH_URL = prev;
    });
    it("rejects other origins and tricks", () => {
      for (const v of [
        "http://evil.com/upload",
        "https://localhost:3000/upload",
        "http://localhost:3001/upload",
        "http://localhost:3000.evil.com/upload",
        "http://localhost:3000@evil.com/upload",
        "http://evil.com@localhost:3000/upload",
        "http://user:pw@localhost:3000/upload",
        "http://localhost:3000//evil.com",
        "http://localhost:3000/\\evil.com",
        "http://localhost:3000\\@evil.com",
        "http://localhost:3000/a\nb",
        "//localhost:3000/upload",
        "///evil.com",
        "javascript:alert(1)",
        "JAVASCRIPT://localhost:3000/%0aalert(1)",
        "data:text/html,x",
        "ftp://localhost:3000/x",
        "http:evil.com",
        "https:/evil.com",
        " http://localhost:3000/upload",
      ]) {
        expect(safeCallbackUrl(v, origin), v).toBe("/dashboard");
      }
    });
  });
});
