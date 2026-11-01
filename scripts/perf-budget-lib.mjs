// Performance budget helpers (issue #42, ADR 0012).
import { readFileSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

/** Script paths a prerendered page loads at start, from its built HTML. */
export function scriptsFromHtml(html) {
  const found = new Set();
  for (const m of html.matchAll(/(?:src|href)="(\/_next\/static\/[^"?]+\.js)(?:\?[^"]*)?"/g)) {
    found.add(m[1]);
  }
  return [...found].sort();
}

/** Gzipped size in bytes of the JS a page loads up front ("first-load JS"). */
export function firstLoadBytes(htmlFile, distDir = ".next") {
  const scripts = scriptsFromHtml(readFileSync(htmlFile, "utf8"));
  if (scripts.length === 0) throw new Error(`no scripts found in ${htmlFile}`);
  let total = 0;
  for (const s of scripts) {
    const file = path.join(distDir, s.replace(/^\/_next\//, ""));
    total += gzipSync(readFileSync(file)).length;
  }
  return total;
}

/** Returns one message per page over budget. */
export function overBudget(measured, budgets) {
  return Object.entries(budgets)
    .filter(([page]) => page in measured && measured[page] > budgets[page])
    .map(
      ([page]) =>
        `${page}: ${(measured[page] / 1024).toFixed(1)} kB gzip exceeds budget ${(budgets[page] / 1024).toFixed(1)} kB`,
    );
}
