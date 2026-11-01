// Dependency audit for CI: runs `npm audit --omit=dev --audit-level=high` with
// retries. Findings fail, network failures warn. Logic lives in audit-lib.mjs.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { evaluate, isNetworkError, parseAudit } from "./audit-lib.mjs";

const ATTEMPTS = 3;
const DELAY_MS = Number(process.env.AUDIT_RETRY_DELAY_MS ?? 10_000);

const allow = new Map(
  JSON.parse(
    readFileSync(new URL("../.github/audit-allowlist.json", import.meta.url), "utf8"),
  ).accepted.map((a) => [a.id, a]),
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function runAudit() {
  const r = spawnSync("npm", ["audit", "--omit=dev", "--audit-level=high", "--json"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return parseAudit(r.stdout, r.stderr);
}

let report;
for (let i = 1; i <= ATTEMPTS; i++) {
  report = runAudit();
  if (!isNetworkError(report)) break;
  console.log(`Attempt ${i}/${ATTEMPTS}: registry unreachable.`);
  if (i < ATTEMPTS) await sleep(DELAY_MS * i);
}

const { status, messages } = evaluate(report, allow);
for (const m of messages) (m.startsWith("::error") ? console.error : console.log)(m);
process.exit(status === "fail" ? 1 : 0);
