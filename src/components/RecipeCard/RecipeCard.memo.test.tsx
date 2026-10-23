import { render, screen, fireEvent } from "@testing-library/react";

import { RecipeCard } from "./RecipeCard";
import type { RecipeCardProps } from "./RecipeCard.types";

import { formatDate } from "../../utils/formatDate";

const push = jest.fn();
jest.mock("next/router", () => ({ useRouter: () => ({ push }) }));
jest.mock("../../utils/formatDate", () => ({
  formatDate: jest.fn(() => "Jan 1, 2026"),
}));

const recipe: NonNullable<RecipeCardProps["recipe"]> = {
  _id: "507f1f77bcf86cd799439011",
  title: "Soup",
  data: "",
  tags: ["dinner"],
  imageURL: "",
  emoji: "",
  createdAt: "2026-01-01T00:00:00.000Z",
  owner: "test@example.test",
  isPublic: false,
};

it("reuses an unchanged card while rendering changed data and preserving navigation", () => {
  jest.clearAllMocks();
  const { rerender } = render(<RecipeCard recipe={recipe} />);
  const calls = jest.mocked(formatDate).mock.calls.length;
  rerender(<RecipeCard recipe={recipe} />);
  expect(formatDate).toHaveBeenCalledTimes(calls);
  rerender(<RecipeCard recipe={{ ...recipe, title: "Updated soup" }} />);
  fireEvent.click(screen.getByRole("button", { name: /Updated soup/ }));
  expect(push).toHaveBeenCalledWith(`/recipes/${recipe._id}`);
});
