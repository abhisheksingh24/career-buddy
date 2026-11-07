import { describe, expect, it } from "vitest";

import {
  readUploadResponse,
  UPLOAD_FALLBACK_ERROR,
  UPLOAD_SIGN_IN_ERROR,
  uploadedMessage,
} from "./upload-response";

describe("uploadedMessage", () => {
  it("names the file", () => {
    expect(uploadedMessage("cv.pdf")).toBe("Uploaded cv.pdf");
  });
  it("still reads the same without a name", () => {
    expect(uploadedMessage()).toBe("Uploaded your resume");
  });
});

describe("readUploadResponse", () => {
  it("returns the server error text", async () => {
    const res = new Response(JSON.stringify({ error: "That file is too large" }), { status: 413 });
    expect(await readUploadResponse(res)).toEqual({ ok: false, error: "That file is too large" });
  });
  it("falls back for non-JSON error bodies", async () => {
    const res = new Response("<html>413</html>", { status: 413 });
    expect(await readUploadResponse(res)).toEqual({ ok: false, error: UPLOAD_FALLBACK_ERROR });
  });
  it("asks signed-out users to sign in on a 401", async () => {
    const res = new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    expect(await readUploadResponse(res)).toEqual({ ok: false, error: UPLOAD_SIGN_IN_ERROR });
  });
  it("returns the file name on success", async () => {
    const res = new Response(JSON.stringify({ originalName: "cv.pdf" }), { status: 200 });
    expect(await readUploadResponse(res)).toEqual({ ok: true, fileName: "cv.pdf" });
  });
  it("succeeds with an empty body", async () => {
    const out = await readUploadResponse(new Response("", { status: 200 }));
    expect(out.ok).toBe(true);
  });
});
