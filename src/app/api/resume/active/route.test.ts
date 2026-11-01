import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession, findPortfolio, findResume } = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findPortfolio: vi.fn(),
  findResume: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("@/lib/db", () => {
  const prisma = {
    portfolio: { findFirst: findPortfolio },
    resume: { findFirst: findResume },
  };
  return { prisma, default: prisma };
});

import { GET } from "./route";

beforeEach(() => {
  vi.resetAllMocks();
  getServerSession.mockResolvedValue({ user: { id: "u1" } });
});

describe("GET /api/resume/active", () => {
  it("returns 401 without a session", async () => {
    getServerSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(findPortfolio).not.toHaveBeenCalled();
  });

  it("returns 200 null when the user has no default portfolio", async () => {
    findPortfolio.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
    expect(findResume).not.toHaveBeenCalled();
  });

  it("returns 200 null when the portfolio has no resume", async () => {
    findPortfolio.mockResolvedValue({ id: "p1" });
    findResume.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  });

  it("returns the latest resume when present", async () => {
    findPortfolio.mockResolvedValue({ id: "p1" });
    findResume.mockResolvedValue({
      id: "r1",
      name: "CV",
      rawText: "text",
      fileType: "pdf",
      createdAt: "2026-01-01T00:00:00.000Z",
      version: 3,
    });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      id: "r1",
      name: "CV",
      rawText: "text",
      fileType: "pdf",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  });
});
