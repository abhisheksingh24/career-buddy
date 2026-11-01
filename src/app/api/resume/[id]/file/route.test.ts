import { describe, expect, it, vi } from "vitest";

const { getServerSession } = vi.hoisted(() => ({
  getServerSession: vi.fn(async (): Promise<unknown> => ({ user: { id: "u1" } })),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("fs/promises", () => {
  const readFile = vi.fn(async () => Buffer.from("%PDF"));
  return { readFile, default: { readFile } };
});
vi.mock("@/lib/db", () => ({
  prisma: {
    resume: {
      findUnique: vi.fn(async () => ({
        name: 'a"b\r\nX-Evil: 1é.pdf',
        fileUrl: "f.pdf",
        fileType: "application/pdf",
        portfolio: { userId: "u1" },
      })),
    },
  },
}));

import { GET } from "./route";

describe("GET file route", () => {
  it("sends no CORS headers and a safe disposition", async () => {
    const res = await GET(new Request("http://x/"), { params: Promise.resolve({ id: "r1" }) });
    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
    expect(res.headers.get("content-disposition")).toMatch(/^inline; filename="/);
  });

  it("returns 401 without a session and 403 for another user's resume", async () => {
    getServerSession.mockResolvedValueOnce(null);
    const anon = await GET(new Request("http://x/"), { params: Promise.resolve({ id: "r1" }) });
    expect(anon.status).toBe(401);
    getServerSession.mockResolvedValueOnce({ user: { id: "other" } });
    const other = await GET(new Request("http://x/"), { params: Promise.resolve({ id: "r1" }) });
    expect(other.status).toBe(403);
  });
});
