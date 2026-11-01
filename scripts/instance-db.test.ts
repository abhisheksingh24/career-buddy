import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const lib = join(__dirname, "instance-db.sh");

function run(url: string) {
  const r = spawnSync("bash", ["-c", `. "${lib}"; instance_db_url "$1" abc`, "_", url], {
    encoding: "utf8",
  });
  return { ok: r.status === 0, out: r.stdout.trim() };
}

describe("instance_db_url", () => {
  it.each([
    [
      "postgresql://postgres:postgres@localhost:5432/career_buddy",
      "postgresql://postgres:postgres@localhost:5432/career_buddy_abc",
    ],
    ["postgres://u@127.0.0.1/db", "postgres://u@127.0.0.1/career_buddy_abc"],
    [
      "postgresql://u:p@localhost:5432/db?schema=public",
      "postgresql://u:p@localhost:5432/career_buddy_abc?schema=public",
    ],
    ["postgresql://u@localhost", "postgresql://u@localhost/career_buddy_abc"],
    ["postgresql://u@localhost?schema=x", "postgresql://u@localhost/career_buddy_abc?schema=x"],
  ])("accepts %s", (url, expected) => {
    expect(run(url)).toEqual({ ok: true, out: expected });
  });

  it.each([
    "postgresql://u:p@evil.com/x@localhost/db",
    "postgresql://u@evil.com/db?a=@localhost/",
    "postgresql://u@localhost:5432/db?host=evil.com",
    "postgresql://u@localhost/db?schema=x&HostAddr=1.2.3.4",
    "postgresql://u@localhost/db?socket=/tmp",
    "postgresql://u@localhost/db?%68ost=evil.com",
    "postgresql://u@localhost/db?service=prod",
    "postgresql://u@localhost.evil.com/db",
    "postgresql://u@evil.com/db",
    "postgresql://u@db.supabase.co:5432/postgres",
    "postgresql://u@[::1]:5432/db",
    "postgresql://u@127.0.0.2/db",
    "postgresql://u@localhost:5432x/db",
    "postgresql://u@localhost,evil.com/db",
    "postgresql://localhost@evil.com/db",
    "mysql://u@localhost/db",
    "",
  ])("rejects %s", (url) => {
    expect(run(url).ok).toBe(false);
  });
});
