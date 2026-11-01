// Fails when the JavaScript a prerendered page loads up front (gzipped) is over
// its budget. Run after `npm run build`. Budgets are in kB and are recorded in
// docs/quality/profile.md; raise one only with a reason in the PR (ADR 0012).
import { existsSync } from "node:fs";

import { firstLoadBytes, overBudget } from "./perf-budget-lib.mjs";

const PAGES = {
  "/": ".next/server/app/index.html",
  "/profile": ".next/server/app/profile.html",
  "/upload": ".next/server/app/upload.html",
  "/analyze": ".next/server/app/analyze.html",
};

// kB gzipped. Set about 10% above the size measured on 2026-11-01
// (/ 183, /profile 230, /upload 183, /analyze 203). Tighten as the bundle shrinks.
const BUDGET_KB = { "/": 200, "/profile": 255, "/upload": 200, "/analyze": 225 };

const missing = Object.values(PAGES).filter((f) => !existsSync(f));
if (missing.length) {
  console.error(`Build output missing (${missing.join(", ")}). Run npm run build first.`);
  process.exit(1);
}

const measured = {};
for (const [page, file] of Object.entries(PAGES)) {
  measured[page] = firstLoadBytes(file);
  console.log(
    `${page.padEnd(10)} ${(measured[page] / 1024).toFixed(1)} kB gzip (budget ${BUDGET_KB[page]} kB)`,
  );
}

const budgets = Object.fromEntries(Object.entries(BUDGET_KB).map(([p, kb]) => [p, kb * 1024]));
const failures = overBudget(measured, budgets);
if (failures.length) {
  for (const f of failures) console.error(`::error::${f}`);
  process.exit(1);
}
