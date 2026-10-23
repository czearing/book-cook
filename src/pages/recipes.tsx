import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { fetchRecipesPaginated } from "src/clientToServer/fetch/fetchAllRecipes";
import styles from "./recipes.module.css";
import { Unauthorized } from "../components";
import {
  Dropdown,
  DropdownTrigger,
  DropdownValue,
  DropdownContent,
  DropdownItem,
  DropdownCaret,
} from "../components/Dropdown";
import { MultiSelectMenu } from "../components/MultiSelectMenu";
import { PageTitle, BodyText } from "../components/Typography";
import { VirtualizedRecipeList } from "../components/VirtualizedRecipeList/VirtualizedRecipeList";
import { useSearchBox } from "../context";
import { useDebounce } from "../hooks/useDebounce";

const PAGE_SIZE = 20;

export default function Recipes() {
  const { searchBoxValue } = useSearchBox();
  const settledSearch = useDebounce(searchBoxValue, 300);
  const { data: session, status } = useSession();

  const [sortOption, setSortOption] = React.useState("dateNewest");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);

  // Use page one immediately for a new filter, before the reset effect runs.
  const filterKey = JSON.stringify([settledSearch, sortOption, selectedTags]);
  const previousFilters = React.useRef(filterKey);
  const page = previousFilters.current === filterKey ? currentPage : 1;
  React.useEffect(() => {
    previousFilters.current = filterKey;
    setCurrentPage(1);
  }, [filterKey]);

  const offset = (page - 1) * PAGE_SIZE;

  const { data, isLoading, error } = useQuery({
    queryKey: ["recipes", settledSearch, sortOption, selectedTags, page],
    queryFn: () =>
      fetchRecipesPaginated({
        searchBoxValue: settledSearch,
        orderBy: sortOption,
        selectedTags,
        offset,
        limit: PAGE_SIZE,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: true,
  });

  const recipes = data?.recipes ?? [];
  const totalCount = data?.totalCount ?? 0;

  const availableTags = Array.from(
    new Set(recipes.flatMap((r) => r.tags ?? [])),
  );

  if (status === "loading") {
    return null;
  }

  if (!session) {
    return <Unauthorized />;
  }

  const countLabel = `${totalCount} recipe${totalCount !== 1 ? "s" : ""}${
    searchBoxValue ? ` matching "${searchBoxValue}"` : " in your collection"
  }${selectedTags.length > 0 ? ` with tags: ${selectedTags.join(", ")}` : ""}`;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <PageTitle as="h1">My Recipes</PageTitle>
          <BodyText>{countLabel}</BodyText>
        </div>
        <div className={styles.controls}>
          <Dropdown value={sortOption} onValueChange={setSortOption}>
            <DropdownTrigger>
              <DropdownValue />
              <DropdownCaret />
            </DropdownTrigger>
            <DropdownContent>
              <DropdownItem value="dateNewest">
                Sort by date (newest)
              </DropdownItem>
              <DropdownItem value="dateOldest">
                Sort by date (oldest)
              </DropdownItem>
              <DropdownItem value="ascTitle">Sort by title (asc)</DropdownItem>
              <DropdownItem value="descTitle">
                Sort by title (desc)
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
          <MultiSelectMenu
            options={availableTags}
            value={selectedTags}
            onChange={setSelectedTags}
            label="Filter by tags"
          />
        </div>
      </div>
      <VirtualizedRecipeList
        recipes={recipes}
        totalCount={totalCount}
        currentPage={page}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        error={error}
        onPageChange={setCurrentPage}
        onPageSizeChange={() => undefined}
      />
    </div>
  );
}
