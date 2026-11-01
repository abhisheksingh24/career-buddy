import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession, findUnique, upsert } = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findUnique: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("@/lib/db", () => {
  const prisma = { profile: { findUnique, upsert } };
  return { prisma, default: prisma };
});

import { GET, PUT } from "./route";

const put = (body: unknown) =>
  new Request("http://x/", { method: "PUT", body: JSON.stringify(body) }) as never;

beforeEach(() => {
  getServerSession.mockReset().mockResolvedValue({ user: { id: "u1" } });
  findUnique.mockReset();
  upsert.mockReset().mockImplementation(async (a: { update: unknown }) => a.update);
});

describe("profile route", () => {
  it("returns an empty profile (200) for a user with no saved profile", async () => {
    findUnique.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ headline: null, skills: [] });
  });

  it("returns the saved profile", async () => {
    findUnique.mockResolvedValue({ headline: "Dev", skills: ["a"] });
    expect(await (await GET()).json()).toEqual({ headline: "Dev", skills: ["a"] });
  });

  it("refuses anonymous callers", async () => {
    getServerSession.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
  });

  it("saves a first profile with blank optional links and skills", async () => {
    const res = await PUT(
      put({ headline: "x", bio: "", website: "", linkedin: "", github: "", skills: [""] }),
    );
    expect(res.status).toBe(200);
    const arg = upsert.mock.calls[0][0];
    expect(arg.update).toMatchObject({ website: null, linkedin: null, github: null, skills: [] });
  });

  it("still rejects a malformed link", async () => {
    expect((await PUT(put({ website: "not a url" }))).status).toBe(400);
  });

  it.each([
    ["headline", { headline: "x".repeat(201) }],
    ["bio", { bio: "x".repeat(2001) }],
    ["location", { location: "x".repeat(201) }],
    ["a skill", { skills: ["x".repeat(51)] }],
    ["skill count", { skills: Array.from({ length: 51 }, (_, i) => `s${i}`) }],
    ["a url", { website: "https://a.com/" + "x".repeat(2048) }],
  ])("rejects an over-long %s with 400", async (_n, body) => {
    expect((await PUT(put(body))).status).toBe(400);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("accepts values at the caps", async () => {
    const res = await PUT(
      put({ headline: "x".repeat(200), bio: "x".repeat(2000), skills: ["x".repeat(50)] }),
    );
    expect(res.status).toBe(200);
  });
});
