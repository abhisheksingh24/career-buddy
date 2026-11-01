import { describe, expect, it } from "vitest";

// A page may have only one <main>. The root layout owns it, so no other
// component or page may render another (#139).
// Limitation: this is a text scan, so a `<main` inside a comment or string
// in a .tsx file would also be reported.
const sources = import.meta.glob("../**/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

describe("main landmark", () => {
  it("is rendered only by the root layout", () => {
    const offenders = Object.entries(sources)
      .filter(([, text]) => /<main[\s>]/.test(text))
      .map(([file]) => file);
    expect(offenders).toEqual(["../app/layout.tsx"]);
  });
});
