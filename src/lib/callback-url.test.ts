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
});
