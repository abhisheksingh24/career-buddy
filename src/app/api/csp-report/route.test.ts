import { describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const post = (body: string) =>
  POST(new Request("http://x/api/csp-report", { method: "POST", body }));

describe("POST /api/csp-report", () => {
  it("accepts a legacy report and logs only known fields", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const res = await post(
      JSON.stringify({ "csp-report": { "blocked-uri": "inline", evil: "x", "line-number": 3 } }),
    );
    expect(res.status).toBe(204);
    const logged = String(spy.mock.calls[0][0]);
    expect(logged).toContain("csp-violation");
    expect(logged).toContain("blocked-uri");
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
});
