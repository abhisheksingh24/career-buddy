// Dependency audit for CI: `npm audit --omit=dev --audit-level=high` with
// retries, an explicit allowlist, and a split between findings (fail) and
// network failures (warn). See docs/decisions/0010-dependency-audit-in-ci.md.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const ATTEMPTS = 3;
const DELAY_MS = Number(process.env.AUDIT_RETRY_DELAY_MS ?? 10_000);
// npm reports a failed registry request as {message, error:{summary,detail}} with
// no code, so classify on the whole text. Findings never produce `error`.
const NETWORK =
  /ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|EPIPE|FETCH_ERROR|ERR_SOCKET_TIMEOUT|audit request to .* failed|audit endpoint returned an error|\b(429|50\d)\b/;
const errText = (r) => [r.error?.code, r.message, r.error?.summary, r.error?.detail].filter(Boolean).join(" ");

const allow = new Map(
  JSON.parse(readFileSync(new URL("../.github/audit-allowlist.json", import.meta.url), "utf8")).accepted.map(
    (a) => [a.id, a],
  ),
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function runAudit() {
  const r = spawnSync("npm", ["audit", "--omit=dev", "--audit-level=high", "--json"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  try {
    return JSON.parse(r.stdout);
  } catch {
    return { error: { code: "UNPARSEABLE", summary: (r.stderr || r.stdout || "").slice(0, 500) } };
  }
}

let report;
for (let i = 1; i <= ATTEMPTS; i++) {
  report = runAudit();
  if (!report.error || !NETWORK.test(errText(report))) break;
  console.log(`Attempt ${i}/${ATTEMPTS}: registry unreachable.`);
  if (i < ATTEMPTS) await sleep(DELAY_MS * i);
}

if (report.error) {
  const text = errText(report);
  if (NETWORK.test(text)) {
    console.log(
      `::warning::npm audit skipped: registry unreachable after ${ATTEMPTS} attempts (${text.slice(0, 200)}). Not a finding.`,
    );
    process.exit(0);
  }
  console.error(`::error::npm audit failed to run: ${text}`);
  process.exit(1);
}

const bad = new Map();
const accepted = new Set();
for (const v of Object.values(report.vulnerabilities ?? {})) {
  for (const via of v.via) {
    if (typeof via === "string" || !["high", "critical"].includes(via.severity)) continue;
    const id = via.url.split("/").pop();
    if (allow.has(id)) accepted.add(id);
    else bad.set(id, `${via.dependency} (${via.severity}): ${via.title} ${via.url}`);
  }
}
for (const id of accepted) console.log(`Accepted ${id}: ${allow.get(id).reason} [${allow.get(id).tracking}]`);
for (const id of allow.keys()) {
  if (!accepted.has(id))
    console.log(`::warning::Allowlist entry ${id} no longer reported; remove it from .github/audit-allowlist.json.`);
}
if (bad.size) {
  for (const m of bad.values()) console.error(`::error::${m}`);
  process.exit(1);
}
console.log("npm audit: no unaccepted high or critical findings in production dependencies.");
