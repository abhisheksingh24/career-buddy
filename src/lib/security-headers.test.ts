import { describe, expect, it } from "vitest";

import { buildCsp, securityHeaders } from "./security-headers";
import nextConfig from "../../next.config";

const names = (dev: boolean) => securityHeaders(dev).map((h) => h.key);

describe("security headers", () => {
  it("includes the required headers", () => {
    expect(names(false)).toEqual(
      expect.arrayContaining([
        "Content-Security-Policy-Report-Only",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "X-Frame-Options",
        "Permissions-Policy",
        "Strict-Transport-Security",
      ]),
    );
  });
  it("sends HSTS only outside dev", () => {
    expect(names(true)).not.toContain("Strict-Transport-Security");
  });
  it("CSP denies framing and plugins, allows the pdf worker", () => {
    const csp = buildCsp(false);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("worker-src 'self' blob:");
    expect(csp).not.toContain("unsafe-eval");
    expect(buildCsp(true)).toContain("unsafe-eval");
  });
  it("next.config applies them to every path", async () => {
    const rules = await nextConfig.headers!();
    expect(rules[0].source).toBe("/:path*");
    expect(rules[0].headers.map((h) => h.key)).toContain("X-Content-Type-Options");
  });
});
