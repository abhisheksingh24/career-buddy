import { describe, expect, it } from "vitest";

import { assertTestLoginAllowed, testLoginRefusals } from "./test-login-lib.mjs";

const ok = {
  TEST_LOGIN: "true",
  NODE_ENV: "development",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/career_buddy_demo1",
  NEXTAUTH_URL: "http://localhost:3101",
};

describe("test login guard", () => {
  it("allows a local instance with the flag on", () => {
    expect(testLoginRefusals(ok)).toEqual([]);
    expect(() => assertTestLoginAllowed(ok)).not.toThrow();
  });

  it("refuses when the flag is off or unset", () => {
    expect(testLoginRefusals({ ...ok, TEST_LOGIN: undefined })).not.toEqual([]);
    expect(testLoginRefusals({ ...ok, TEST_LOGIN: "1" })).not.toEqual([]);
    expect(() => assertTestLoginAllowed({ ...ok, TEST_LOGIN: "false" })).toThrow(/refused/);
  });

  it("refuses in production even with the flag on", () => {
    expect(() => assertTestLoginAllowed({ ...ok, NODE_ENV: "production" })).toThrow(/production/);
    expect(() => assertTestLoginAllowed({ ...ok, VERCEL_ENV: "production" })).toThrow();
  });

  it("refuses a remote database", () => {
    const remote = "postgresql://u:p@db.abc.supabase.co:5432/career_buddy";
    expect(() => assertTestLoginAllowed({ ...ok, DATABASE_URL: remote })).toThrow(/not local/);
    const sneaky = "postgresql://localhost:x@db.abc.supabase.co/career_buddy";
    expect(testLoginRefusals({ ...ok, DATABASE_URL: sneaky })).not.toEqual([]);
  });

  it("refuses an unrelated local database, a missing url or a remote app url", () => {
    expect(testLoginRefusals({ ...ok, DATABASE_URL: "postgresql://localhost/other" })).not.toEqual(
      [],
    );
    expect(testLoginRefusals({ ...ok, DATABASE_URL: undefined })).not.toEqual([]);
    expect(testLoginRefusals({ ...ok, NEXTAUTH_URL: "https://app.example.com" })).not.toEqual([]);
    expect(testLoginRefusals({ ...ok, NEXTAUTH_URL: undefined })).not.toEqual([]);
  });
});
