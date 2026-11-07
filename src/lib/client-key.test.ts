import { afterEach, describe, expect, it, vi } from "vitest";

import { clientKey, readJson } from "./api-guard";

const req = (headers: Record<string, string> = {}) => new Request("http://x/", { headers });

afterEach(() => vi.unstubAllEnvs());

describe("clientKey", () => {
  it("ignores forwarding headers unless a proxy is trusted", () => {
    expect(clientKey(req({ "x-forwarded-for": "1.2.3.4", "x-real-ip": "5.6.7.8" }))).toBeNull();
    expect(clientKey(req())).toBeNull();
  });

  it("takes the entry the proxy appended (right-most), not the client's first", () => {
    vi.stubEnv("TRUSTED_PROXY", "true");
    expect(clientKey(req({ "x-forwarded-for": "6.6.6.6, 9.9.9.9" }))).toBe("9.9.9.9");
    expect(clientKey(req({ "x-forwarded-for": "9.9.9.9" }))).toBe("9.9.9.9");
  });

  it("counts hops from the right when more proxies are configured", () => {
    vi.stubEnv("TRUSTED_PROXY", "true");
    vi.stubEnv("TRUSTED_PROXY_HOPS", "2");
    expect(clientKey(req({ "x-forwarded-for": "6.6.6.6, 9.9.9.9, 10.0.0.1" }))).toBe("9.9.9.9");
  });

  it("falls back to x-real-ip only when x-forwarded-for is absent", () => {
    vi.stubEnv("TRUSTED_PROXY", "true");
    expect(clientKey(req({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
    expect(clientKey(req())).toBeNull();
  });

  it("returns null when x-forwarded-for has fewer entries than the hop count", () => {
    vi.stubEnv("TRUSTED_PROXY", "true");
    vi.stubEnv("TRUSTED_PROXY_HOPS", "2");
    expect(clientKey(req({ "x-forwarded-for": "9.9.9.9", "x-real-ip": "5.6.7.8" }))).toBeNull();
  });
});

describe("readJson", () => {
  it("stops reading a chunked body that has no Content-Length once over the cap", async () => {
    const chunk = new TextEncoder().encode("x".repeat(40));
    let pulls = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(c) {
        pulls++;
        c.enqueue(chunk);
      },
    });
    const r = new Request("http://x/", {
      method: "POST",
      body,
      duplex: "half",
    } as RequestInit);
    expect(await readJson(r, 100)).toBeNull();
    expect(pulls).toBeLessThan(10);
  });

  it("parses a valid body under the cap", async () => {
    const r = new Request("http://x/", { method: "POST", body: '{"a":1}' });
    expect(await readJson(r, 100)).toEqual({ a: 1 });
  });
});
