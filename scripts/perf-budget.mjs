// Fails when the JavaScript a page loads up front (gzipped) is over its budget.
// Run after `npm run build`. Budgets are in kB and are recorded in
// docs/quality/profile.md; raise one only with a reason in the PR (ADR 0012).
import { existsSync, readFileSync } from "node:fs";

import { gzipBytes, overBudget, polyfillScripts, scriptsFromRouteStats } from "./perf-budget-lib.mjs";

// Every page is rendered per request (the root layout calls connection() so the
// CSP nonce can be stamped, ADR 0018), so there is no built HTML to read. Scripts
// come from Next's own per-route list in route-bundle-stats.json.
const STATS_FILE = ".next/diagnostics/route-bundle-stats.json";
const MANIFEST_FILE = ".next/build-manifest.json";
const PAGES = ["/", "/profile", "/upload", "/analyze", "/analyze/interactive"];

// kB gzipped. Set about 10% above the size measured on 2026-11-01
// (/ 183, /profile 230, /upload 183, /analyze 203, /analyze/interactive 206).
// Tighten as the bundle shrinks.
const BUDGET_KB = {
  "/": 200,
  "/profile": 255,
  "/upload": 200,
  "/analyze": 225,
  "/analyze/interactive": 230,
};

const missing = [STATS_FILE, MANIFEST_FILE].filter((f) => !existsSync(f));
if (missing.length) {
  console.error(`Build output missing (${missing.join(", ")}). Run npm run build first.`);
  process.exit(1);
}

const stats = scriptsFromRouteStats(JSON.parse(readFileSync(STATS_FILE, "utf8")));
// Next's per-route list leaves out the polyfills every page loads. Add them back.
const extras = polyfillScripts(JSON.parse(readFileSync(MANIFEST_FILE, "utf8")));
const measured = {};
for (const page of PAGES) {
  const scripts = stats.get(page);
  if (!scripts?.length) {
    console.error(`No bundle stats for ${page} in ${STATS_FILE}. Is the route still built?`);
    process.exit(1);
  }
  measured[page] = gzipBytes([...new Set([...scripts, ...extras])]);
}

// Every measured page needs a budget and every budget a page (no silent skips).
const mismatched = [
  ...Object.keys(measured).filter((p) => !(p in BUDGET_KB)),
  ...Object.keys(BUDGET_KB).filter((p) => !(p in measured)),
];
if (mismatched.length) {
  console.error(`Budget and page lists differ: ${mismatched.join(", ")}`);
  process.exit(1);
}

for (const page of Object.keys(measured)) {
  console.log(
    `${page.padEnd(22)} ${(measured[page] / 1024).toFixed(1)} kB gzip (budget ${BUDGET_KB[page]} kB)`,
  );
}

const budgets = Object.fromEntries(Object.entries(BUDGET_KB).map(([p, kb]) => [p, kb * 1024]));
const failures = overBudget(measured, budgets);
if (failures.length) {
  for (const f of failures) console.error(`::error::${f}`);
  process.exit(1);
}
