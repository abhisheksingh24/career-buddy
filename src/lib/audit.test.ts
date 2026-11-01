import { describe, expect, it } from "vitest";
import { evaluate, isNetworkError, parseAudit } from "../../scripts/audit-lib.mjs";

type Entry = { id: string; reason: string; tracking: string };
const allow = new Map<string, Entry>([
  ["GHSA-ok", { id: "GHSA-ok", reason: "accepted", tracking: "#1" }],
]);

const finding = (id: string, severity: string, title = "Some issue") => ({
  vulnerabilities: {
    pkg: {
      via: [
        { dependency: "pkg", severity, title, url: `https://github.com/advisories/${id}` },
        "other", // transitive reference, not an advisory
      ],
    },
  },
});

describe("evaluate", () => {
  it("fails on a high finding that is not allowlisted", () => {
    const r = evaluate(finding("GHSA-new", "high"), allow);
    expect(r.status).toBe("fail");
    expect(r.messages.join("\n")).toContain("pkg (high)");
  });

  it("fails on a critical finding", () => {
    expect(evaluate(finding("GHSA-new", "critical"), allow).status).toBe("fail");
  });

  it("passes an allowlisted GHSA id", () => {
    const r = evaluate(finding("GHSA-ok", "high"), allow);
    expect(r.status).toBe("pass");
    expect(r.messages.join("\n")).toContain("Accepted GHSA-ok");
  });

  it("treats a finding mentioning ENOTFOUND or 503 as a finding, not a network error", () => {
    const r = finding("GHSA-new", "high", "ENOTFOUND handling returns 503 ECONNRESET");
    expect(isNetworkError(r)).toBe(false);
    expect(evaluate(r, allow).status).toBe("fail");
  });

  it("warns about a stale allowlist entry but still passes", () => {
    const r = evaluate({ vulnerabilities: {} }, allow);
    expect(r.status).toBe("pass");
    expect(r.messages.join("\n")).toContain("::warning::Allowlist entry GHSA-ok");
  });

  it("passes a moderate-only report", () => {
    expect(evaluate(finding("GHSA-mod", "moderate"), new Map()).status).toBe("pass");
  });

  it("does not crash when an advisory has no url", () => {
    const r = evaluate(
      {
        vulnerabilities: {
          p: { via: [{ dependency: "p", severity: "high", title: "t", source: 7 }] },
        },
      },
      new Map(),
    );
    expect(r.status).toBe("fail");
  });

  it.each(["ENOTFOUND", "ECONNRESET", "E503", "E429"])("warns (exit 0) on a %s error", (code) => {
    const r = evaluate({ error: { code, summary: "", detail: "" } }, allow);
    expect(r.status).toBe("warn");
  });

  it("warns on npm's code-less audit request failure", () => {
    const report = {
      message: "request to https://registry/-/npm/v1/security/advisories/bulk failed, reason: x",
      error: { summary: "audit request to https://registry failed", detail: "" },
    };
    expect(evaluate(report, allow).status).toBe("warn");
  });

  it("fails on an unrelated error such as a missing lockfile", () => {
    const r = evaluate(
      { error: { code: "ENOLOCK", summary: "requires an existing lockfile" } },
      allow,
    );
    expect(r.status).toBe("fail");
  });
});

describe("parseAudit", () => {
  it("fails on empty stdout with no stderr", () => {
    expect(evaluate(parseAudit("", ""), allow).status).toBe("fail");
  });

  it("fails on garbled stdout", () => {
    expect(evaluate(parseAudit("<html>oops", ""), allow).status).toBe("fail");
  });

  it("warns on empty stdout when stderr is a network error", () => {
    expect(evaluate(parseAudit("", "npm error code ECONNRESET"), allow).status).toBe("warn");
  });

  it("parses valid JSON", () => {
    expect(parseAudit('{"vulnerabilities":{}}', "")).toEqual({ vulnerabilities: {} });
  });
});
