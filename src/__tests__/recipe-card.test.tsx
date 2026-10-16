import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { RecipeCard } from "../components/RecipeCard";
import type { RecipeCardProps } from "../components/RecipeCard/RecipeCard.types";

const mockPush = jest.fn().mockResolvedValue(true);
const mockRouter = { push: mockPush };

jest.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("../components/RecipeActions", () => ({
  RecipeActions: ({ title }: { title: string }) => (
    <button>Actions for {title}</button>
  ),
}));

jest.mock("../components/RecipeCard/RecipeCard.styles", () => ({
  useRecipeCardStyles: () => ({}),
}));

const props: RecipeCardProps = {
  title: "Chicken dinner",
  createdDate: "2025-01-15T12:00:00.000Z",
  id: "recipe-1",
  emoji: "",
  tags: ["dinner"],
};

describe("RecipeCard render boundary", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    mockPush.mockClear();
  });

  it("skips date formatting for unchanged props on parent updates", () => {
    const format = jest.spyOn(Date.prototype, "toLocaleDateString");
    const { rerender } = render(<RecipeCard {...props} />);
    const initialCalls = format.mock.calls.length;
    expect(initialCalls).toBeGreaterThan(0);

    rerender(<RecipeCard {...props} />);

    expect(format).toHaveBeenCalledTimes(initialCalls);
    expect(screen.getByText("Chicken dinner")).toBeInTheDocument();
  });

  it("updates displayed values and navigation when recipe props change", () => {
    const { rerender } = render(<RecipeCard {...props} />);
    rerender(
      <RecipeCard
        {...props}
        title="Updated recipe"
        id="recipe-2"
        createdDate="2025-02-20T12:00:00.000Z"
        tags={["lunch"]}
        emoji="X"
      />,
    );

    expect(screen.queryByText("Chicken dinner")).not.toBeInTheDocument();
    expect(screen.getByText("Updated recipe")).toBeInTheDocument();
    expect(screen.getByText("lunch")).toBeInTheDocument();
    expect(screen.getByText("X")).toBeInTheDocument();
    expect(screen.getByText("Actions for Updated recipe")).toBeInTheDocument();
    expect(
      screen.getByText(
        new Date("2025-02-20T12:00:00.000Z").toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Updated recipe"));
    expect(mockPush).toHaveBeenCalledWith("/recipes/recipe-2");
  });

  it("uses the original timestamp for the 24-hour new-recipe badge", () => {
    jest.useFakeTimers().setSystemTime(new Date("2025-01-16T18:00:00.000Z"));
    const { rerender } = render(
      <RecipeCard {...props} createdDate="2025-01-15T20:00:00.000Z" />,
    );
    expect(screen.getByText("NEW")).toBeInTheDocument();

    rerender(<RecipeCard {...props} createdDate="2025-01-15T17:00:00.000Z" />);
    expect(screen.queryByText("NEW")).not.toBeInTheDocument();
  });

  it("keeps minimal cards free of actions and tags", () => {
    render(<RecipeCard {...props} isMinimal />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("dinner")).not.toBeInTheDocument();
    expect(screen.getByText("Chicken dinner")).toBeInTheDocument();
  });
});
