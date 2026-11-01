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

  it.each([
    ["a;b.pdf", `inline; filename="a_b.pdf"; filename*=UTF-8''a%3Bb.pdf`],
    ["a\\b.pdf", `inline; filename="a_b.pdf"; filename*=UTF-8''a%5Cb.pdf`],
    ["a%b.pdf", `inline; filename="a_b.pdf"; filename*=UTF-8''a%25b.pdf`],
    ['a"b.pdf', `inline; filename="a_b.pdf"; filename*=UTF-8''a%22b.pdf`],
    ["a\u0000b\u007fc\td.pdf", `inline; filename="abcd.pdf"; filename*=UTF-8''abcd.pdf`],
    ["é.pdf", `inline; filename="_.pdf"; filename*=UTF-8''%C3%A9.pdf`],
    ["😀.pdf", `inline; filename="_.pdf"; filename*=UTF-8''%F0%9F%98%80.pdf`],
    ["a'b(c)d*e.pdf", `inline; filename="a'b(c)d*e.pdf"; filename*=UTF-8''a%27b%28c%29d%2Ae.pdf`],
  ])("produces the exact header for %j", (name, header) => {
    expect(contentDisposition(name)).toBe(header);
  });

  it("replaces lone surrogates instead of throwing", () => {
    expect(contentDisposition("a\ud800b.pdf")).toBe(
      `inline; filename="a_b.pdf"; filename*=UTF-8''a%EF%BF%BDb.pdf`,
    );
    expect(contentDisposition("a\udc00")).toContain("%EF%BF%BD");
  });

  it("truncates long names to 150 code points without splitting pairs", () => {
    expect(contentDisposition("😀".repeat(200))).toBe(
      `inline; filename="${"_".repeat(150)}"; filename*=UTF-8''${"%F0%9F%98%80".repeat(150)}`,
    );
    expect(contentDisposition("a".repeat(500) + ".pdf")).toContain(`filename="${"a".repeat(150)}"`);
  });
});
