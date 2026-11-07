import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { Input, Textarea } from "./input";

describe("Input and Textarea focus ring (#148)", () => {
  it("use the ring token and add no second outline", () => {
    const { container } = render(
      <>
        <Input className="w-full" />
        <Textarea className="w-full" />
      </>,
    );
    expect(container.children).toHaveLength(2);
    for (const el of Array.from(container.children)) {
      const c = el.className;
      expect(c).toContain("focus-visible:ring-ring");
      expect(c).toContain("focus-visible:ring-[3px]");
      expect(c).toContain("outline-none");
      expect(c).toContain("w-full");
    }
  });

  it("no screen still uses the blue focus ring", () => {
    for (const f of [
      "../../app/(app)/profile/page.tsx",
      "../../app/(app)/analyze/(main)/page.tsx",
      "../../app/(app)/analyze/interactive/page.tsx",
    ]) {
      expect(readFileSync(join(__dirname, f), "utf8")).not.toContain("focus:ring-blue");
    }
  });
});
