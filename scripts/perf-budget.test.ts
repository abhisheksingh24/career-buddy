import { describe, expect, it } from "vitest";

import { overBudget, scriptsFromHtml } from "./perf-budget-lib.mjs";

describe("scriptsFromHtml", () => {
  it("lists each static script once, ignoring query strings and other assets", () => {
    const html = `<link rel="preload" href="/_next/static/chunks/a.js?dpl=1"/>
      <script src="/_next/static/chunks/a.js?dpl=1"></script>
      <script src="/_next/static/chunks/b.js"></script>
      <link href="/_next/static/media/f.woff2"/>`;
    expect(scriptsFromHtml(html)).toEqual([
      "/_next/static/chunks/a.js",
      "/_next/static/chunks/b.js",
    ]);
  });
});

describe("overBudget", () => {
  it("reports only pages above their budget", () => {
    const out = overBudget({ "/": 2048, "/x": 100 }, { "/": 1024, "/x": 200, "/y": 1 });
    expect(out).toHaveLength(1);
    expect(out[0]).toContain("/:");
  });

  it("passes at exactly the budget", () => {
    expect(overBudget({ "/": 1024 }, { "/": 1024 })).toEqual([]);
  });
});
