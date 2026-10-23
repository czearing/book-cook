import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react";

import Recipes from "../pages/recipes";
import { fetchRecipesPaginated } from "../clientToServer/fetch/fetchAllRecipes";
import { useSearchBox } from "../context";

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { email: "test@example.test" } },
    status: "authenticated",
  }),
}));
jest.mock("../context", () => ({ useSearchBox: jest.fn() }));
jest.mock("../components", () => ({ Unauthorized: () => null }));
jest.mock("../components/MultiSelectMenu", () => ({
  MultiSelectMenu: () => null,
}));
jest.mock("../clientToServer/fetch/fetchAllRecipes", () => ({
  fetchRecipesPaginated: jest.fn(),
}));
jest.mock("../components/VirtualizedRecipeList/VirtualizedRecipeList", () => ({
  VirtualizedRecipeList: ({
    currentPage,
    onPageChange,
  }: {
    currentPage: number;
    onPageChange: (page: number) => void;
  }) => (
    <button onClick={() => onPageChange(currentPage + 1)}>
      Page {currentPage}
    </button>
  ),
}));

const search = jest.mocked(useSearchBox);
const fetchRecipes = jest.mocked(fetchRecipesPaginated);

describe("recipe search requests", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    search.mockReturnValue({
      searchBoxValue: "",
      onSearchBoxValueChange: jest.fn(),
    });
    fetchRecipes.mockResolvedValue({
      recipes: [],
      totalCount: 0,
      hasMore: false,
    });
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("queries only the settled value and resets pagination before querying new filters", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const content = (
      <QueryClientProvider client={queryClient}>
        <Recipes />
      </QueryClientProvider>
    );
    const { rerender, unmount } = render(content);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });
    fireEvent.click(screen.getByRole("button", { name: "Page 1" }));
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });
    expect(fetchRecipes).toHaveBeenLastCalledWith(
      expect.objectContaining({ offset: 20, searchBoxValue: "" }),
    );
    fetchRecipes.mockClear();

    search.mockReturnValue({
      searchBoxValue: "sou",
      onSearchBoxValueChange: jest.fn(),
    });
    rerender(
      <QueryClientProvider client={queryClient}>
        <Recipes />
      </QueryClientProvider>,
    );
    await act(async () => {
      await jest.advanceTimersByTimeAsync(150);
    });
    search.mockReturnValue({
      searchBoxValue: "soup",
      onSearchBoxValueChange: jest.fn(),
    });
    rerender(
      <QueryClientProvider client={queryClient}>
        <Recipes />
      </QueryClientProvider>,
    );
    await act(async () => {
      await jest.advanceTimersByTimeAsync(299);
    });
    expect(fetchRecipes).not.toHaveBeenCalled();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(1);
    });
    expect(fetchRecipes).toHaveBeenCalledTimes(1);
    expect(fetchRecipes).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 0, searchBoxValue: "soup", limit: 20 }),
    );
    expect(screen.getByRole("button", { name: "Page 1" })).toBeVisible();

    search.mockReturnValue({
      searchBoxValue: "abandoned",
      onSearchBoxValueChange: jest.fn(),
    });
    rerender(
      <QueryClientProvider client={queryClient}>
        <Recipes />
      </QueryClientProvider>,
    );
    unmount();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(300);
    });
    expect(fetchRecipes).toHaveBeenCalledTimes(1);
    queryClient.clear();
  });
});
