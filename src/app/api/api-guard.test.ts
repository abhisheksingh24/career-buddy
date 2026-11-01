/// <reference types="vite/client" />
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession, aiCalls } = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  aiCalls: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("@/lib/ai", () => ({
  aiEnabled: () => true,
  getSuggestions: async (...a: unknown[]) => {
    aiCalls(...a);
    return { bullets: ["b"], skills: [] };
  },
}));
vi.mock("@/lib/analysis-engine", () => ({
  analyzeResume: async (...a: unknown[]) => {
    aiCalls(...a);
    throw new Error("analysis reached");
  },
}));
vi.mock("@/lib/ai-extraction", () => ({
  detectDomain: vi.fn(),
  extractSkillsFromText: vi.fn(),
  extractJobRequirements: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ prisma: {}, default: {} }));

import { resetRateLimits } from "@/lib/rate-limit";

import { POST as analyze } from "./resume/analyze/route";
import { POST as suggest } from "./resume/suggest/route";

const post = (body: unknown) =>
  new Request("http://x/", { method: "POST", body: JSON.stringify(body) }) as never;

beforeEach(() => {
  resetRateLimits();
  aiCalls.mockClear();
  getServerSession.mockReset();
});

describe.each([
  ["suggest", suggest],
  ["analyze", analyze],
])("%s route", (_name, handler) => {
  it("refuses anonymous callers with 401 before any AI work", async () => {
    getServerSession.mockResolvedValue(null);
    const res = await handler(post({ resumeText: "r", jobDescription: "j" }));
    expect(res.status).toBe(401);
    expect(aiCalls).not.toHaveBeenCalled();
  });

  it("limits rapid calls with a 429 and a clear message", async () => {
    getServerSession.mockResolvedValue({ user: { id: "u1" } });
    for (let i = 0; i < 10; i++) {
      await handler(post({ resumeText: "r", jobDescription: "j" })).catch(() => undefined);
    }
    const res = await handler(post({ resumeText: "r", jobDescription: "j" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBeTruthy();
    expect((await res.json()).error).toMatch(/too quickly/);
  });

  it("rejects an oversized body", async () => {
    getServerSession.mockResolvedValue({ user: { id: "u1" } });
    const res = await handler(post({ resumeText: "x".repeat(300_000) }));
    expect(res.status).toBe(400);
    expect(aiCalls).not.toHaveBeenCalled();
  });
});

it("does not count different users together", async () => {
  getServerSession.mockResolvedValue({ user: { id: "u1" } });
  for (let i = 0; i < 11; i++) await suggest(post({}));
  getServerSession.mockResolvedValue({ user: { id: "u2" } });
  expect((await suggest(post({}))).status).toBe(200);
});

describe("every API route uses the shared guard", () => {
  // Raw source of each route file, keyed by relative path (no filesystem path building).
  const routes = import.meta.glob("./**/route.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;
  const entries = Object.entries(routes);

  it("finds the route files", () => {
    expect(entries.length).toBeGreaterThan(3);
  });

  it.each(entries)("%s", (rel, src) => {
    if (rel.includes("/auth/")) return; // NextAuth's own handler
    expect(src).toMatch(/await guard\(/);
  });
});
