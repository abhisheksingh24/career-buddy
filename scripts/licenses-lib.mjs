// Pure logic for scripts/licenses.mjs (importable, no side effects). Tested in
// src/lib/licenses.test.ts. See docs/decisions/0012-licence-scan-in-ci.md.

/** "@scope/name@1.2.3" -> "@scope/name" (the version separator is the last "@"). */
export function packageName(key) {
  const i = key.lastIndexOf("@");
  return i > 0 ? key.slice(0, i) : key;
}

/** Exception patterns are exact names, or a prefix ending in "*". */
export function nameMatches(pattern, name) {
  return pattern.endsWith("*") ? name.startsWith(pattern.slice(0, -1)) : pattern === name;
}

/**
 * Is an SPDX-style expression acceptable? "A OR B" needs one acceptable side,
 * "A AND B" needs both. Anything not on the allowlist (including UNKNOWN,
 * UNLICENSED, "BSD*" guesses, "Custom: ...") is not acceptable.
 */
export function expressionAllowed(expr, allowed) {
  const tokens = String(expr ?? "")
    .replace(/([()])/g, " $1 ")
    .split(/\s+/)
    .filter(Boolean);
  let pos = 0;
  let malformed = false;
  const parseOr = () => {
    let ok = parseAnd();
    while (tokens[pos] === "OR") {
      pos++;
      const rhs = parseAnd();
      ok = ok || rhs;
    }
    return ok;
  };
  const parseAnd = () => {
    let ok = parseAtom();
    while (tokens[pos] === "AND") {
      pos++;
      const rhs = parseAtom();
      ok = ok && rhs;
    }
    return ok;
  };
  const parseAtom = () => {
    const t = tokens[pos++];
    if (t === undefined || t === ")" || t === "OR" || t === "AND") {
      malformed = true; // missing operand, e.g. "MIT OR": fail closed
      return false;
    }
    if (t === "(") {
      const ok = parseOr();
      if (tokens[pos] !== ")") {
        malformed = true;
        return false;
      }
      pos++;
      return ok;
    }
    return allowed.has(t);
  };
  if (tokens.length === 0) return false;
  const result = parseOr();
  // Leftover tokens (e.g. "Custom: foo bar") mean we did not understand it.
  return result && !malformed && pos === tokens.length;
}

const asText = (l) => (Array.isArray(l) ? `(${l.join(" OR ")})` : String(l ?? "UNKNOWN"));

/**
 * Decide the outcome from license-checker's JSON (`{ "name@ver": { licenses } }`).
 * `policy` = { allowed: string[], exceptions: [{ package, licenses, reason, adr }] }.
 * An exception applies only while the package keeps exactly the recorded licence
 * string, so a licence change on update fails the scan again.
 * Returns { status: "pass" | "fail", messages }.
 */
export function evaluate(report, policy) {
  const allowed = new Set(policy.allowed);
  const used = new Set();
  const bad = [];
  const accepted = [];
  for (const [key, info] of Object.entries(report)) {
    const name = packageName(key);
    const text = asText(info?.licenses);
    if (expressionAllowed(text, allowed)) continue;
    const idx = policy.exceptions.findIndex(
      (e) => nameMatches(e.package, name) && e.licenses === text,
    );
    if (idx >= 0) {
      used.add(idx);
      accepted.push(`Accepted ${key} (${text}): ${policy.exceptions[idx].reason}`);
    } else {
      bad.push(
        `::error::${key} has licence "${text}", which is not on the permissive allowlist. ` +
          `Replace it, or record an exception in .github/licence-policy.json with an ADR.`,
      );
    }
  }
  const messages = [...new Set(accepted)];
  // Optional native packages differ per platform, so an exception that matches
  // nothing here may match elsewhere: a notice, not an error.
  policy.exceptions.forEach((e, i) => {
    if (!used.has(i))
      messages.push(
        `::notice::Licence exception for ${e.package} was not needed on this platform.`,
      );
  });
  if (bad.length) return { status: "fail", messages: [...messages, ...bad] };
  return {
    status: "pass",
    messages: [
      ...messages,
      `Licence scan: ${Object.keys(report).length} production packages, all permissive or recorded exceptions.`,
    ],
  };
}
