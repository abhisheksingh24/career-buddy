import { describe, expect, it } from "vitest";

import { contentDisposition } from "./content-disposition";

describe("contentDisposition", () => {
  it("strips quotes and CR/LF and encodes non-ASCII", () => {
    const v = contentDisposition('a"b\r\nc é.pdf');
    expect(v).not.toMatch(/[\r\n]/);
    expect(v).toContain('filename="a_bc _.pdf"');
    expect(v).toContain("filename*=UTF-8''");
    expect(v).toContain("%C3%A9");
  });

  it("falls back for empty names", () => {
    expect(contentDisposition("\r\n")).toContain('filename="resume.pdf"');
  });
});
