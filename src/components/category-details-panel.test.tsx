import { render, screen } from "@testing-library/react";
import { TrendingUp } from "lucide-react";
import { describe, expect, it } from "vitest";

import { CategoryDetailsPanel } from "./category-details-panel";
import type { Category } from "./category-navigation";

const base: Category = {
  id: "overview",
  name: "Match Overview",
  icon: TrendingUp,
  score: 0,
  actionItemsCount: 0,
};

describe("CategoryDetailsPanel score display", () => {
  it("shows a neutral state, not 0% or Critical, before an analysis", () => {
    const { container } = render(
      <CategoryDetailsPanel selectedCategory={{ ...base, analysed: false }} />,
    );
    expect(screen.getByText(/Not analysed yet/)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/0%|Critical/);
  });

  it("shows the real score after an analysis", () => {
    render(<CategoryDetailsPanel selectedCategory={{ ...base, score: 72 }} />);
    expect(screen.getByText("72%")).toBeInTheDocument();
    expect(screen.queryByText(/Not analysed yet/)).toBeNull();
  });

  it("shows a real 0 score for an analysed category", () => {
    render(<CategoryDetailsPanel selectedCategory={{ ...base, score: 0, analysed: true }} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
