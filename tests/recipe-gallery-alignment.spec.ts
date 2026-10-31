import { expect, test, type Locator } from "@playwright/test";

const recipe = {
  _id: "507f1f77bcf86cd799439011",
  title: "Gallery alignment recipe",
  emoji: "",
  tags: ["dinner"],
  createdAt: "2026-03-01T00:00:00.000Z",
  data: "Recipe content",
  imageURL: "",
  owner: "gallery@example.test",
  isPublic: false,
};

const leftEdge = async (locator: Locator): Promise<number> =>
  locator.evaluate((element) => element.getBoundingClientRect().left);

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() !== "GET") {
      throw new Error(`Unexpected API write: ${url.pathname}`);
    }
    if (url.pathname === "/api/auth/session") {
      return route.fulfill({
        json: {
          user: { name: "Gallery tester", email: recipe.owner, image: null },
          expires: "2099-01-01T00:00:00.000Z",
        },
      });
    }
    if (url.pathname === "/api/user/recentlyViewed") {
      return route.fulfill({ json: [] });
    }
    if (url.pathname === "/api/recipes") {
      return route.fulfill({
        json: { recipes: [recipe], totalCount: 1, hasMore: false },
      });
    }
    throw new Error(`Unexpected API request: ${url.pathname}`);
  });
});

for (const width of [1440, 768, 375]) {
  test(`count and tag filter align with cards at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/recipes");
    const main = page.getByRole("main");
    const count = main.getByText("1 recipe in your collection", {
      exact: true,
    });
    const card = main.getByRole("button", { name: recipe.title, exact: true });
    const filter = main.getByRole("combobox", {
      name: "Filter by tags",
      exact: true,
    });
    await expect(card).toBeVisible();
    await expect(count).toBeVisible();
    await expect(filter).toBeVisible();
    const control = filter.locator("..");
    await expect
      .poll(async () =>
        Math.abs((await leftEdge(count)) - (await leftEdge(card))),
      )
      .toBeLessThan(1);
    await expect
      .poll(async () =>
        Math.abs((await leftEdge(control)) - (await leftEdge(card))),
      )
      .toBeLessThan(1);
    await expect
      .poll(() =>
        main.evaluate((element) => element.scrollWidth - element.clientWidth),
      )
      .toBeLessThanOrEqual(0);
  });
}

test("sorting and tag filtering preserve requests and count", async ({
  page,
}) => {
  await page.goto("/recipes");
  const main = page.getByRole("main");
  await expect(
    main.getByRole("button", { name: recipe.title, exact: true }),
  ).toBeVisible();
  await main.getByRole("combobox").first().click();
  const sorted = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return (
      url.pathname === "/api/recipes" &&
      url.searchParams.get("sortDirection") === "asc"
    );
  });
  await page
    .getByRole("option", { name: "Sort by date (oldest)", exact: true })
    .click();
  await sorted;
  await main
    .getByRole("combobox", { name: "Filter by tags", exact: true })
    .click();
  const filtered = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return (
      url.pathname === "/api/recipes" &&
      url.searchParams.get("tags") === "dinner"
    );
  });
  await page.getByRole("option", { name: "dinner", exact: true }).click();
  await filtered;
  await expect(
    main.getByText("1 recipe in your collection with tags: dinner", {
      exact: true,
    }),
  ).toBeVisible();
});

test("empty results retain aligned count and filter", async ({ page }) => {
  await page.route("**/api/recipes?**", (route) =>
    route.fulfill({ json: { recipes: [], totalCount: 0, hasMore: false } }),
  );
  await page.goto("/recipes");
  const main = page.getByRole("main");
  const count = main.getByText("0 recipes in your collection", { exact: true });
  await expect(count).toBeVisible();
  await expect(
    main.getByText("No recipes found.", { exact: true }),
  ).toBeVisible();
  const filter = main
    .getByRole("combobox", { name: "Filter by tags", exact: true })
    .locator("..");
  await expect
    .poll(async () =>
      Math.abs((await leftEdge(count)) - (await leftEdge(filter))),
    )
    .toBeLessThan(1);
});

test("failed recipe requests retain the explicit error state", async ({
  page,
}) => {
  await page.route("**/api/recipes?**", (route) =>
    route.fulfill({ status: 500, json: { message: "Recipes unavailable" } }),
  );
  await page.goto("/recipes");
  await expect(
    page.getByRole("main").getByText("Something went wrong", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Filter by tags", exact: true }),
  ).toBeVisible();
});
