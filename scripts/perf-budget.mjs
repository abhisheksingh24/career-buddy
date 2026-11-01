// Fails when the JavaScript a page loads up front (gzipped) is over its budget.
// Run after `npm run build`. Budgets are in kB and are recorded in
// docs/quality/profile.md; raise one only with a reason in the PR (ADR 0012).
import { existsSync, readFileSync } from "node:fs";

import {
  firstLoadBytes,
  gzipBytes,
  overBudget,
  scriptsFromHtml,
  scriptsFromRouteStats,
  sharedExtras,
} from "./perf-budget-lib.mjs";

// Prerendered pages: scripts are read from the built HTML.
const PAGES = {
  "/": ".next/server/app/index.html",
  "/profile": ".next/server/app/profile.html",
  "/upload": ".next/server/app/upload.html",
};

// Server-rendered pages (behind the sign-in guard) have no built HTML, so their
// scripts come from Next's own per-route list in route-bundle-stats.json.
const STATS_FILE = ".next/diagnostics/route-bundle-stats.json";
const DYNAMIC_PAGES = ["/analyze", "/analyze/interactive"];

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

const missing = [...Object.values(PAGES), STATS_FILE].filter((f) => !existsSync(f));
if (missing.length) {
  console.error(`Build output missing (${missing.join(", ")}). Run npm run build first.`);
  process.exit(1);
}

const measured = {};
for (const [page, file] of Object.entries(PAGES)) measured[page] = firstLoadBytes(file);

const stats = scriptsFromRouteStats(JSON.parse(readFileSync(STATS_FILE, "utf8")));
// Next's list leaves out scripts every page loads (polyfills). Add them back so
// server-rendered pages are measured the same way as prerendered ones.
const home = stats.get("/");
if (!home) {
  console.error(`No "/" entry in ${STATS_FILE}; cannot work out the shared scripts.`);
  process.exit(1);
}
const extras = sharedExtras(scriptsFromHtml(readFileSync(PAGES["/"], "utf8")), home);
for (const page of DYNAMIC_PAGES) {
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
