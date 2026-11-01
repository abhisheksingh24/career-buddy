import { afterEach, describe, expect, it } from "vitest";
import { uploadsRoot } from "./uploads";

describe("uploadsRoot", () => {
  const original = process.env.UPLOADS_DIR;
  afterEach(() => {
    if (original === undefined) delete process.env.UPLOADS_DIR;
    else process.env.UPLOADS_DIR = original;
  });

  it("defaults to ./uploads under the working directory", () => {
    delete process.env.UPLOADS_DIR;
    expect(uploadsRoot()).toBe(`${process.cwd()}/uploads`);
  });

  it("uses UPLOADS_DIR when set (relative or absolute)", () => {
    process.env.UPLOADS_DIR = "/var/tmp/x";
    expect(uploadsRoot()).toBe("/var/tmp/x");
    process.env.UPLOADS_DIR = "uploads/inst";
    expect(uploadsRoot()).toBe(`${process.cwd()}/uploads/inst`);
  });
});
