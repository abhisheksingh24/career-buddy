// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { create, getServerSession } = vi.hoisted(() => ({
  create: vi.fn(),
  getServerSession: vi.fn(),
}));
vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/parse", () => ({ extractText: vi.fn(async () => "parsed text") }));
vi.mock("@/lib/db", () => ({
  prisma: {
    portfolio: { findFirst: vi.fn(async () => ({ id: "p1" })), create: vi.fn() },
    resume: { findFirst: vi.fn(async () => null), create },
  },
}));

import { POST } from "./route";

import { MAX_UPLOAD_BYTES } from "@/lib/upload-validation";

function req(file: File, headers: Record<string, string> = {}): Request {
  const fd = new FormData();
  fd.append("file", file);
  return new Request("http://localhost/api/resume/upload", {
    method: "POST",
    body: fd,
    headers,
  });
}

describe("POST /api/resume/upload", () => {
  beforeEach(() => {
    create.mockReset();
    create.mockResolvedValue({ id: "r1" });
    getServerSession.mockReset();
    getServerSession.mockResolvedValue({ user: { id: "u1" } });
  });

  it("returns 401 before reading the body or touching the database when signed out", async () => {
    getServerSession.mockResolvedValue(null);
    const formData = vi.fn();
    const res = await POST({ headers: new Headers(), formData } as unknown as Request);
    expect(res.status).toBe(401);
    expect(formData).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects files over the limit with 413 and a clear message", async () => {
    const big = new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], "cv.pdf");
    const res = await POST(req(big));
    expect(res.status).toBe(413);
    expect((await res.json()).error).toMatch(/5 MB/);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects a declared oversized body before reading it", async () => {
    const res = await POST(
      req(new File(["%PDF-1"], "cv.pdf"), { "content-length": String(50 * 1024 * 1024) }),
    );
    expect(res.status).toBe(413);
  });

  it("rejects unsupported content with 415", async () => {
    const res = await POST(req(new File(["MZ binary"], "cv.pdf", { type: "application/pdf" })));
    expect(res.status).toBe(415);
  });

  it("stores a PDF's bytes in the database", async () => {
    const res = await POST(req(new File(["%PDF-1.4 body"], "cv.pdf")));
    expect(res.status).toBe(200);
    const data = create.mock.calls[0][0].data;
    expect(data.fileType).toBe("application/pdf");
    expect(Buffer.from(data.fileData).toString()).toBe("%PDF-1.4 body");
  });
});
