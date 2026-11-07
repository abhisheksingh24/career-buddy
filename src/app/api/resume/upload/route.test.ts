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

import { UPLOAD_RATE_LIMIT } from "@/lib/api-guard";
import { resetRateLimits } from "@/lib/rate-limit";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-validation";

import { POST } from "./route";

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
    resetRateLimits();
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

  it("returns 429 with Retry-After past the upload limit", async () => {
    for (let i = 0; i < UPLOAD_RATE_LIMIT.limit; i++) {
      expect((await POST(req(new File(["hello"], "cv.txt")))).status).toBe(200);
    }
    const res = await POST(req(new File(["hello"], "cv.txt")));
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(create).toHaveBeenCalledTimes(UPLOAD_RATE_LIMIT.limit);
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

  it("rejects a chunked body without Content-Length once it passes the cap, without reading it all", async () => {
    let pulled = 0;
    const chunk = new Uint8Array(1024 * 1024);
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled += 1;
        if (pulled > 50) controller.close();
        else controller.enqueue(chunk);
      },
    });
    const request = new Request("http://localhost/api/resume/upload", {
      method: "POST",
      body: stream,
      headers: { "content-type": "multipart/form-data; boundary=x" },
      duplex: "half",
    } as RequestInit);
    const res = await POST(request);
    expect(res.status).toBe(413);
    expect(pulled).toBeLessThan(15);
    expect(create).not.toHaveBeenCalled();
  });
});
