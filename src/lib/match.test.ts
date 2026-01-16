import { describe, it, expect } from "vitest";

import { tokenize, scoreMatch } from "./match";

describe("tokenize", () => {
  it("returns tokens for basic text", () => {
    expect(tokenize("React, Node.js + SQL")).toContain("react");
  });
  it("handles empty", () => {
    expect(tokenize("")).toEqual([]);
  });
});

describe("scoreMatch", () => {
  it("gives 100 when resume covers all JD tokens", () => {
    const r = scoreMatch("react node sql", "react node sql");
    expect(r.score).toBe(100);
    expect(r.missingKeywords.length).toBe(0);
  });
  it("detects missing tokens", () => {
    const r = scoreMatch("react", "react node sql");
    expect(r.score).toBeLessThan(100);
    expect(r.missingKeywords).toContain("node");
  });
});
