import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { RecipePageActions } from "./RecipePageActions";

import { deleteRecipe } from "../../clientToServer/delete/deleteRecipe";

const push = jest.fn().mockResolvedValue(true);
jest.mock("next/router", () => ({ useRouter: () => ({ push }) }));
jest.mock("../../clientToServer/delete/deleteRecipe", () => ({
  deleteRecipe: jest.fn(),
}));

const props = {
  recipeId: "test-recipe",
  title: "Dinner",
  isDirty: false,
  status: "idle" as const,
  onSave: jest.fn(),
  onDiscard: jest.fn(),
};

const renderActions = (
  overrides: Partial<Parameters<typeof RecipePageActions>[0]> = {},
) => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <RecipePageActions {...props} {...overrides} />
    </QueryClientProvider>,
  );
};

const openOptions = (): void => {
  fireEvent.click(screen.getByRole("button", { name: "Recipe options" }));
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("unchanged recipes disable save/discard and do not delete without confirmation", () => {
  renderActions();
  openOptions();
  expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Discard changes" }),
  ).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Delete recipe" }));
  expect(
    screen.getByRole("dialog", { name: "Delete recipe?" }),
  ).toHaveTextContent('"Dinner"');
  expect(deleteRecipe).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.getByRole("dialog", { name: "Recipe options" })).toBeVisible();
});

test("edited recipes dispatch save and discard through the page-owned handlers", () => {
  renderActions({ isDirty: true });
  openOptions();
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(props.onSave).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
  expect(props.onDiscard).toHaveBeenCalledTimes(1);
});

test("saving blocks competing actions and dismissal", () => {
  renderActions({ isDirty: true, status: "saving" });
  openOptions();
  expect(screen.getByRole("button", { name: "Saving changes" })).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Discard changes" }),
  ).toBeDisabled();
  expect(screen.getByRole("button", { name: "Delete recipe" })).toBeDisabled();
  expect(
    screen.queryByRole("button", { name: "Close dialog" }),
  ).not.toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(screen.getByRole("dialog")).toBeVisible();
});

test("failed saves remain visible and retryable", () => {
  renderActions({ isDirty: true, status: "error" });
  openOptions();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Your changes are still here",
  );
  expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
});

test("pending deletion prevents duplicate submissions and navigates after success", async () => {
  let resolveDelete!: (value: { message: string; recipeId: string }) => void;
  jest.mocked(deleteRecipe).mockReturnValue(
    new Promise((resolve) => {
      resolveDelete = resolve;
    }),
  );
  renderActions();
  openOptions();
  fireEvent.click(screen.getByRole("button", { name: "Delete recipe" }));
  fireEvent.click(screen.getByRole("button", { name: "Delete recipe" }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Deleting recipe" }),
    ).toBeDisabled(),
  );
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(screen.getByRole("dialog")).toBeVisible();
  expect(deleteRecipe).toHaveBeenCalledTimes(1);
  expect(deleteRecipe).toHaveBeenCalledWith(props.recipeId);
  act(() => {
    resolveDelete({ message: "Deleted", recipeId: props.recipeId });
  });
  await waitFor(() => expect(push).toHaveBeenCalledWith("/recipes"));
});

test("delete failures retain the confirmation and allow an explicit retry", async () => {
  const errorLog = jest.spyOn(console, "error").mockImplementation(() => {});
  jest.mocked(deleteRecipe).mockRejectedValueOnce(new Error("Unavailable"));
  renderActions();
  openOptions();
  fireEvent.click(screen.getByRole("button", { name: "Delete recipe" }));
  fireEvent.click(screen.getByRole("button", { name: "Delete recipe" }));
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent("Delete failed"),
  );
  expect(screen.getByRole("button", { name: "Delete recipe" })).toBeEnabled();
  expect(push).not.toHaveBeenCalled();
  expect(errorLog).toHaveBeenCalledWith(
    "Failed to delete recipe:",
    "Unavailable",
  );
  errorLog.mockRestore();
});

test.each(["rejected", "cancelled"])(
  "a %s navigation after deletion surfaces an error without allowing another delete",
  async (outcome) => {
    push.mockImplementationOnce(() =>
      outcome === "rejected"
        ? Promise.reject(new Error("Navigation unavailable"))
        : Promise.resolve(false),
    );
    jest
      .mocked(deleteRecipe)
      .mockResolvedValue({ message: "Deleted", recipeId: props.recipeId });
    renderActions();
    openOptions();
    fireEvent.click(screen.getByRole("button", { name: "Delete recipe" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete recipe" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("navigation failed"),
    );
    expect(
      screen.getByRole("button", { name: "Delete recipe" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  },
);
