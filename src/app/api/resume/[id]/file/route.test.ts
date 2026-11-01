import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn(async () => ({ user: { id: "u1" } })) }));
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
});
