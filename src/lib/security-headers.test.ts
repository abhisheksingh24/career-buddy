import { describe, expect, it } from "vitest";

import { buildCsp, securityHeaders } from "./security-headers";
import nextConfig from "../../next.config";

const names = (dev: boolean) => securityHeaders(dev).map((h) => h.key);

describe("security headers", () => {
  it("includes the required static headers", () => {
    expect(names(false)).toEqual(
      expect.arrayContaining([
        "Reporting-Endpoints",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "X-Frame-Options",
        "Permissions-Policy",
        "Strict-Transport-Security",
      ]),
    );
  });
  it("leaves the CSP to the proxy (it needs a per-request nonce)", () => {
    expect(names(false).join()).not.toMatch(/Content-Security-Policy/);
  });
  it("sends HSTS only outside dev", () => {
    expect(names(true)).not.toContain("Strict-Transport-Security");
  });
  it("CSP uses the nonce, with no unsafe-inline for scripts or style elements", () => {
    const csp = buildCsp("abc123", false);
    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp).toContain("style-src-elem 'self' 'nonce-abc123'");
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(csp).not.toMatch(/style-src-elem[^;]*unsafe-inline/);
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("report-uri /api/csp-report");
    expect(csp).toContain("report-to csp");
  });
  it("CSP denies framing and plugins, allows the pdf worker", () => {
    const csp = buildCsp("n", false);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("worker-src 'self' blob:");
  });
  it("dev relaxes eval and inline style elements only", () => {
    const csp = buildCsp("n", true);
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toMatch(/style-src-elem[^;]*unsafe-inline/);
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
  });
  it("next.config applies them to every path", async () => {
    const rules = await nextConfig.headers!();
    expect(rules[0].source).toBe("/:path*");
    expect(rules[0].headers.map((h) => h.key)).toContain("X-Content-Type-Options");
  });
});
