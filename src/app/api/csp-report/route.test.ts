import { resetRateLimits } from "@/lib/rate-limit";
import { beforeEach, describe, expect, it, vi } from "vitest";


import { POST } from "./route";

const post = (body: string) =>
  POST(new Request("http://x/api/csp-report", { method: "POST", body }));

describe("POST /api/csp-report", () => {
  beforeEach(() => resetRateLimits());
  it("accepts a legacy report and logs only known fields", async () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await post(
      JSON.stringify({
        "csp-report": {
          "blocked-uri": "https://cdn.example/x.js?token=secret#frag",
          "violated-directive": "script-src-elem",
          evil: "x",
          "line-number": 3,
        },
      }),
    );
    expect(res.status).toBe(204);
    const logged = String(spy.mock.calls[0][0]);
    expect(logged).toContain("csp-violation");
    expect(logged).not.toContain("redacted");
    const meta = JSON.parse(logged).metadata;
    expect(meta).toEqual({
      blockedUri: "https://cdn.example/x.js",
      directive: "script-src-elem",
      lineNumber: 3,
    });
    expect(logged).not.toContain("secret");
    expect(logged).not.toContain("evil");
    spy.mockRestore();
  });
  it("accepts Reporting API arrays", async () => {
    const res = await post(JSON.stringify([{ type: "csp-violation", body: { blockedURL: "x" } }]));
    expect(res.status).toBe(204);
  });
  it("rejects bad JSON and oversized bodies", async () => {
    expect((await post("nope")).status).toBe(400);
    expect((await post("a".repeat(9000))).status).toBe(413);
  });
  it("works signed out but is rate limited with Retry-After", async () => {
    const body = JSON.stringify({ "csp-report": { "violated-directive": "x" } });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    for (let i = 0; i < 60; i++) expect((await post(body)).status).toBe(204);
    const res = await post(body);
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBeTruthy();
  });
});
