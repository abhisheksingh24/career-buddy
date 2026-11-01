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

/**
 * Scripts Next lists as first-load for each route, from
 * `.next/diagnostics/route-bundle-stats.json`. Covers server-rendered routes,
 * which have no built HTML to read. Returns a Map of route to `/_next/...` paths.
 */
export function scriptsFromRouteStats(stats) {
  const out = new Map();
  for (const r of stats) {
    const paths = (r.firstLoadChunkPaths ?? []).map((p) => p.replace(/^\.next\//, "/_next/"));
    out.set(r.route, paths.sort());
  }
  return out;
}

/**
 * Scripts every page loads that Next leaves out of its per-route list (for
 * example the polyfills): what a prerendered page's HTML loads minus what the
 * stats list for the same route.
 */
export function sharedExtras(htmlScripts, statsScripts) {
  const known = new Set(statsScripts);
  return htmlScripts.filter((s) => !known.has(s));
}

/** Gzipped size in bytes of the given `/_next/...` script URLs. */
export function gzipBytes(scripts, distDir = ".next") {
  if (scripts.length === 0) throw new Error("no scripts to measure");
  let total = 0;
  for (const s of scripts) {
    const file = path.join(distDir, s.replace(/^\/_next\//, ""));
    total += gzipSync(readFileSync(file)).length;
  }
  return total;
}

/** Gzipped size in bytes of the JS a prerendered page loads up front ("first-load JS"). */
export function firstLoadBytes(htmlFile, distDir = ".next") {
  const scripts = scriptsFromHtml(readFileSync(htmlFile, "utf8"));
  if (scripts.length === 0) throw new Error(`no scripts found in ${htmlFile}`);
  return gzipBytes(scripts, distDir);
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
