import { describe, expect, it } from "vitest";

import { MAX_UPLOAD_BYTES, detectKind } from "./upload-validation";

describe("detectKind", () => {
  it("recognises a PDF by its header, whatever the name", () => {
    expect(detectKind(Buffer.from("%PDF-1.7 ..."), "cv.bin")).toBe("pdf");
  });

  it("recognises DOCX (zip) only with a .docx name", () => {
    const zip = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0]);
    expect(detectKind(zip, "cv.DOCX")).toBe("docx");
    expect(detectKind(zip, "cv.zip")).toBeNull();
  });

  it("accepts text files without NUL bytes", () => {
    expect(detectKind(Buffer.from("hello"), "cv.txt")).toBe("text");
    expect(detectKind(Buffer.from([104, 0, 105]), "cv.txt")).toBeNull();
  });

  it("rejects empty files and unknown content", () => {
    expect(detectKind(Buffer.alloc(0), "cv.pdf")).toBeNull();
    expect(detectKind(Buffer.from("MZ\x90"), "cv.pdf")).toBeNull();
    expect(detectKind(Buffer.from("hello"), "cv.exe")).toBeNull();
  });

  it("limits uploads to 5 MB", () => {
    expect(MAX_UPLOAD_BYTES).toBe(5 * 1024 * 1024);
  });
});
