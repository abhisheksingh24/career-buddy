import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((u: string) => {
    throw new Error(`REDIRECT:${u}`);
  }),
}));

import { getServerSession } from "next-auth";

import { requireSession, signInUrl } from "./require-session";

describe("signInUrl", () => {
  it("returns to the requested allow-listed page", () => {
    expect(signInUrl("/analyze/interactive")).toBe(
      "/api/auth/signin?callbackUrl=%2Fanalyze%2Finteractive",
    );
    expect(signInUrl("/analyze")).toBe("/api/auth/signin?callbackUrl=%2Fanalyze");
    expect(signInUrl("/upload")).toBe("/api/auth/signin?callbackUrl=%2Fupload");
  });
  it("never echoes other paths or external URLs", () => {
    for (const p of ["https://evil.com", "//evil.com", "/analyze/../x", "/admin"]) {
      expect(signInUrl(p)).toBe("/api/auth/signin?callbackUrl=%2Fdashboard");
    }
  });
});

describe("requireSession", () => {
  it("redirects signed-out visitors back to the requested page", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    await expect(requireSession("/analyze/interactive")).rejects.toThrow(
      "REDIRECT:/api/auth/signin?callbackUrl=%2Fanalyze%2Finteractive",
    );
  });
  it("lets signed-in users through", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);
    await expect(requireSession("/analyze")).resolves.toBeUndefined();
  });
});
