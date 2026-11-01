// Licence scan for CI: lists production dependency licences with a pinned
// license-checker and fails on any that is not permissive or a recorded
// exception (.github/licence-policy.json). Logic lives in licenses-lib.mjs.
// Run on the Linux runner; optional native packages differ per platform, so
// exceptions match by package name and unused ones only produce a notice.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { evaluate } from "./licenses-lib.mjs";

// Pinned (ADR 0012). Dependabot cannot see it; bump by hand.
const CHECKER = "license-checker-rseidelsohn@5.0.1";

const policy = JSON.parse(
  readFileSync(new URL("../.github/licence-policy.json", import.meta.url), "utf8"),
);

const r = spawnSync(
  "npx",
  ["--yes", CHECKER, "--production", "--json", "--excludePrivatePackages"],
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);
let report;
try {
  report = JSON.parse(r.stdout);
} catch {
  console.error(`::error::licence scan could not run: ${(r.stderr || r.stdout).slice(0, 500)}`);
  process.exit(1);
}

const { status, messages } = evaluate(report, policy);
for (const m of messages) (m.startsWith("::error") ? console.error : console.log)(m);
process.exit(status === "fail" ? 1 : 0);
