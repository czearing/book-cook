import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react";

import { fetchAllRecipes } from "../clientToServer/fetch/fetchAllRecipes";
import type { Recipe } from "../clientToServer/types";
import { RecipeCard } from "../components";
import type { RecipeCardProps } from "../components/RecipeCard/RecipeCard.types";
import { RecipeProvider } from "../context";
import Recipes from "../pages/recipes";

let mockSearchBoxValue = "";

jest.mock("../clientToServer/fetch/fetchAllRecipes", () => ({
  fetchAllRecipes: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: "user-1" } } }),
}));

jest.mock("next/router", () => ({
  useRouter: () => ({ query: {} }),
}));

jest.mock("../context", () => ({
  useSearchBox: () => ({ searchBoxValue: mockSearchBoxValue }),
  RecipeProvider: jest.fn(
    ({ children }: { children: React.ReactNode }) => children,
  ),
}));

jest.mock("@griffel/react", () => ({
  makeStyles: () => () => ({}),
}));

jest.mock("@fluentui/react-components", () => ({
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Title3: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  Dropdown: ({
    children,
    defaultValue,
    onOptionSelect,
  }: {
    children: React.ReactNode;
    defaultValue: string;
    onOptionSelect: (
      event: React.ChangeEvent<HTMLSelectElement>,
      data: { selectedOptions: string[] },
    ) => void;
  }) => (
    <select
      aria-label="Sort recipes"
      defaultValue={defaultValue}
      onChange={(event) =>
        onOptionSelect(event, { selectedOptions: [event.target.value] })
      }
    >
      {children}
    </select>
  ),
  Option: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <option value={value}>{children}</option>,
}));

jest.mock("../components", () => ({
  RecipeCard: jest.fn(({ title, id }: RecipeCardProps) => (
    <span data-testid={id}>{title}</span>
  )),
  FallbackScreen: ({
    children,
    isLoading,
    isError,
    dataLength,
  }: {
    children: React.ReactNode;
    isLoading: boolean;
    isError: boolean;
    dataLength: number;
  }) =>
    isError ? (
      <span>Recipe error</span>
    ) : isLoading ? (
      <span>Loading recipes</span>
    ) : !dataLength ? (
      <span>No recipes</span>
    ) : (
      children
    ),
  Unauthorized: () => null,
}));

jest.mock("../components/Toolbar/SearchBar", () => ({
  SearchBar: () => (
    <input aria-label="Search recipes" value={mockSearchBoxValue} readOnly />
  ),
}));

jest.mock("../components/TagPicker/TagPicker", () => ({
  TagPicker: ({ onTagsChange }: { onTagsChange: (tags: string[]) => void }) => (
    <button onClick={() => onTagsChange(["dinner"])}>Filter dinner</button>
  ),
}));

const mockFetchAllRecipes = jest.mocked(fetchAllRecipes);
const mockRecipeProvider = jest.mocked(RecipeProvider);
const mockRecipeCard = jest.mocked(RecipeCard);
const recipe: Recipe = {
  _id: "recipe-1",
  title: "Chicken dinner",
  createdAt: "2025-01-15T12:00:00.000Z",
  data: "",
  imageURL: "",
  emoji: "",
  tags: ["dinner"],
  owner: "user-1",
  sharedWith: [],
};

describe("recipe search requests", () => {
  let queryClient: QueryClient;

  const page = (): React.ReactElement => (
    <QueryClientProvider client={queryClient}>
      <Recipes />
    </QueryClientProvider>
  );

  const advanceTime = async (milliseconds: number): Promise<void> => {
    await act(async () => {
      await jest.advanceTimersByTimeAsync(milliseconds);
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mockSearchBoxValue = "";
    mockFetchAllRecipes.mockReset().mockResolvedValue([]);
    mockRecipeProvider.mockClear();
    mockRecipeCard.mockClear();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(() => {
    queryClient.clear();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("reduces a ten-keystroke burst to one search request after 300ms idle", async () => {
    const { rerender } = render(page());
    await advanceTime(0);
    expect(mockFetchAllRecipes).toHaveBeenCalledTimes(1);

    const search = "chocolates";
    for (let length = 1; length <= search.length; length += 1) {
      await advanceTime(100);
      mockSearchBoxValue = search.slice(0, length);
      rerender(page());
      expect(screen.getByLabelText("Search recipes")).toHaveValue(
        mockSearchBoxValue,
      );
    }

    await advanceTime(299);
    expect(mockFetchAllRecipes).toHaveBeenCalledTimes(1);
    await advanceTime(1);
    expect(mockFetchAllRecipes).toHaveBeenCalledTimes(2);
    expect(mockFetchAllRecipes).toHaveBeenLastCalledWith(
      search,
      "dateNewest",
      [],
    );
  });

  it("fetches an initial search immediately", () => {
    mockSearchBoxValue = "pasta";
    render(page());
    expect(mockFetchAllRecipes).toHaveBeenCalledWith("pasta", "dateNewest", []);
  });

  it("fetches again when typing pauses and when the search is cleared", async () => {
    const { rerender } = render(page());
    await advanceTime(0);

    for (const search of ["rice", "rice soup", ""]) {
      mockSearchBoxValue = search;
      rerender(page());
      await advanceTime(300);
      await advanceTime(0);
      expect(mockFetchAllRecipes).toHaveBeenLastCalledWith(
        search,
        "dateNewest",
        [],
      );
    }
    expect(mockFetchAllRecipes).toHaveBeenCalledTimes(4);
  });

  it("applies sorting and tag filters without the search delay", async () => {
    const { rerender } = render(page());
    await advanceTime(0);
    mockSearchBoxValue = "soup";
    rerender(page());
    await advanceTime(300);

    fireEvent.change(screen.getByLabelText("Sort recipes"), {
      target: { value: "ascTitle" },
    });
    expect(mockFetchAllRecipes).toHaveBeenLastCalledWith(
      "soup",
      "ascTitle",
      [],
    );

    fireEvent.click(screen.getByRole("button", { name: "Filter dinner" }));
    expect(mockFetchAllRecipes).toHaveBeenLastCalledWith("soup", "ascTitle", [
      "dinner",
    ]);
  });

  it("cancels a pending search when the page unmounts", async () => {
    const { rerender, unmount } = render(page());
    await advanceTime(0);
    mockSearchBoxValue = "cancelled";
    rerender(page());
    unmount();
    await advanceTime(300);
    expect(mockFetchAllRecipes).toHaveBeenCalledTimes(1);
  });

  it("skips grid and provider renders while search changes but results do not", async () => {
    mockFetchAllRecipes.mockResolvedValue([recipe]);
    const { rerender } = render(page());
    await advanceTime(300);
    expect(screen.getByTestId("recipe-1")).toHaveTextContent("Chicken dinner");
    const providerRenders = mockRecipeProvider.mock.calls.length;
    const cardRenders = mockRecipeCard.mock.calls.length;

    for (const search of ["c", "ch", "chi", "chicken"]) {
      mockSearchBoxValue = search;
      rerender(page());
      await advanceTime(50);
      expect(screen.getByLabelText("Search recipes")).toHaveValue(search);
      expect(mockRecipeProvider).toHaveBeenCalledTimes(providerRenders);
      expect(mockRecipeCard).toHaveBeenCalledTimes(cardRenders);
    }

    await advanceTime(300);
    expect(mockFetchAllRecipes).toHaveBeenLastCalledWith(
      "chicken",
      "dateNewest",
      [],
    );
    const settledRenders = mockRecipeProvider.mock.calls.length;
    mockSearchBoxValue = "chickens";
    rerender(page());
    expect(mockRecipeProvider).toHaveBeenCalledTimes(settledRenders);
  });

  it("updates the grid when query data changes, including empty results", async () => {
    mockFetchAllRecipes.mockResolvedValue([recipe]);
    render(page());
    await advanceTime(300);

    act(() => {
      queryClient.setQueryData(
        ["recipes", "", "dateNewest", []],
        [
          { ...recipe, title: "Updated dinner" },
          { ...recipe, _id: "recipe-2", title: "Rice soup" },
        ],
      );
    });
    await advanceTime(0);
    expect(screen.getByTestId("recipe-1")).toHaveTextContent("Updated dinner");
    expect(screen.getByTestId("recipe-2")).toHaveTextContent("Rice soup");

    act(() => {
      queryClient.setQueryData(["recipes", "", "dateNewest", []], []);
    });
    await advanceTime(0);
    expect(screen.getByText("No recipes")).toBeInTheDocument();
    expect(screen.queryByTestId("recipe-1")).not.toBeInTheDocument();
  });

  it("updates delayed loading and error fallbacks after a search", async () => {
    mockFetchAllRecipes.mockResolvedValueOnce([recipe]);
    const { rerender } = render(page());
    await advanceTime(300);
    mockFetchAllRecipes.mockImplementationOnce(
      () =>
        new Promise<Recipe[]>((_resolve, reject) => {
          setTimeout(() => reject(new Error("Search failed")), 1000);
        }),
    );
    mockSearchBoxValue = "unavailable";
    rerender(page());
    await advanceTime(300);
    expect(screen.getByTestId("recipe-1")).toHaveTextContent("Chicken dinner");
    await advanceTime(301);
    expect(screen.getByText("Loading recipes")).toBeInTheDocument();
    await advanceTime(1000);
    expect(screen.getByText("Recipe error")).toBeInTheDocument();
    expect(screen.queryByText("Loading recipes")).not.toBeInTheDocument();
  });
});
