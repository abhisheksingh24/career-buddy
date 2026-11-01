import { describe, expect, it } from "vitest";

import {
  evaluate,
  expressionAllowed,
  nameMatches,
  packageName,
} from "../../scripts/licenses-lib.mjs";

const allowed = new Set(["MIT", "Apache-2.0", "ISC", "Zlib"]);
const policy = {
  allowed: [...allowed],
  exceptions: [
    { package: "@img/sharp-libvips-*", licenses: "LGPL-3.0-or-later", reason: "r", adr: "0009" },
    { package: "duck", licenses: "BSD*", reason: "r", adr: "0012" },
  ],
};
const rep = (o: Record<string, string | string[]>) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { licenses: v }]));

describe("packageName / nameMatches", () => {
  it("strips the version, keeping scopes", () => {
    expect(packageName("@img/sharp-libvips-linux-x64@1.3.4")).toBe("@img/sharp-libvips-linux-x64");
    expect(packageName("duck@0.1.12")).toBe("duck");
  });
  it("matches exact names and trailing-star prefixes", () => {
    expect(nameMatches("@img/sharp-libvips-*", "@img/sharp-libvips-darwin-arm64")).toBe(true);
    expect(nameMatches("duck", "duck-typing")).toBe(false);
  });
});

describe("expressionAllowed", () => {
  it("accepts permissive atoms and rejects others", () => {
    expect(expressionAllowed("MIT", allowed)).toBe(true);
    expect(expressionAllowed("GPL-3.0", allowed)).toBe(false);
    expect(expressionAllowed("UNKNOWN", allowed)).toBe(false);
    expect(expressionAllowed("UNLICENSED", allowed)).toBe(false);
    expect(expressionAllowed("BSD*", allowed)).toBe(false);
    expect(expressionAllowed("Custom: https://x.test/licence", allowed)).toBe(false);
    expect(expressionAllowed("", allowed)).toBe(false);
  });
  it("fails closed on a missing operand or unbalanced parentheses", () => {
    expect(expressionAllowed("MIT OR", allowed)).toBe(false);
    expect(expressionAllowed("OR MIT", allowed)).toBe(false);
    expect(expressionAllowed("MIT AND", allowed)).toBe(false);
    expect(expressionAllowed("(MIT OR", allowed)).toBe(false);
    expect(expressionAllowed("MIT OR )", allowed)).toBe(false);
  });
  it("OR needs one permissive side, AND needs both", () => {
    expect(expressionAllowed("(MIT OR GPL-3.0-or-later)", allowed)).toBe(true);
    expect(expressionAllowed("(MIT AND Zlib)", allowed)).toBe(true);
    expect(expressionAllowed("(MIT AND GPL-3.0)", allowed)).toBe(false);
    expect(expressionAllowed("(GPL-2.0 OR GPL-3.0)", allowed)).toBe(false);
    expect(expressionAllowed("(MIT OR (GPL-3.0 AND ISC))", allowed)).toBe(true);
  });
});

describe("evaluate", () => {
  it("passes permissive packages", () => {
    expect(evaluate(rep({ "a@1.0.0": "MIT" }), policy).status).toBe("pass");
  });
  it("fails a new copyleft or unknown licence", () => {
    const r = evaluate(
      rep({ "a@1.0.0": "MIT", "b@2.0.0": "GPL-3.0", "c@1.0.0": "UNKNOWN" }),
      policy,
    );
    expect(r.status).toBe("fail");
    expect(r.messages.join("\n")).toContain("b@2.0.0");
    expect(r.messages.join("\n")).toContain("c@1.0.0");
  });
  it("accepts a recorded exception on any platform build", () => {
    const linux = rep({ "@img/sharp-libvips-linux-x64@1.3.4": "LGPL-3.0-or-later" });
    const mac = rep({ "@img/sharp-libvips-darwin-arm64@1.3.4": "LGPL-3.0-or-later" });
    expect(evaluate(linux, policy).status).toBe("pass");
    expect(evaluate(mac, policy).status).toBe("pass");
  });
  it("fails when an excepted package changes licence", () => {
    expect(evaluate(rep({ "duck@0.2.0": "GPL-3.0" }), policy).status).toBe("fail");
  });
  it("does not let an exception cover a different package", () => {
    expect(evaluate(rep({ "other@1.0.0": "BSD*" }), policy).status).toBe("fail");
  });
  it("treats an unused exception as a notice, not a failure", () => {
    const r = evaluate(rep({ "a@1.0.0": "MIT" }), policy);
    expect(r.status).toBe("pass");
    expect(r.messages.join("\n")).toContain("::notice::");
  });
});
