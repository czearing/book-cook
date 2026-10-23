const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const baseURL = process.env.PERF_URL || "http://localhost:3157";
const output = process.argv[2];
if (!output || fs.existsSync(output)) {
  throw new Error("Supply a new evidence directory.");
}
fs.mkdirSync(output, { recursive: true });

const recipes = Array.from({ length: 12 }, (_, index) => ({
  _id: `recipe-${index}`,
  title: `${index % 2 ? "Chocolate cake" : "Chicken dinner"} ${index}`,
  createdAt: `2025-01-${String(index + 1).padStart(2, "0")}T12:00:00.000Z`,
  data: "<p>Recipe instructions</p>",
  owner: "perf-user",
  sharedWith: [],
  emoji: "",
  imageURL: "",
  tags: [index % 2 ? "dessert" : "dinner"],
}));

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.PERF_BROWSER,
  });
  const errors = [];
  const requests = [];
  const checks = [];
  let releaseSearch;
  let searchStarted;
  let holdSearch = false;
  let updatedId;
  const searchPending = new Promise((resolve) => {
    searchStarted = resolve;
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: "en-US",
      timezoneId: "UTC",
      serviceWorkers: "allow",
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/**", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      requests.push({
        method: request.method(),
        path: url.pathname,
        query: url.search,
      });
      let body = [];
      if (url.pathname === "/api/auth/session") {
        body = {
          user: {
            id: "perf-user",
            email: "perf@example.test",
            name: "Perf User",
          },
          expires: "2099-01-01T00:00:00.000Z",
        };
      } else if (url.pathname === "/api/tags") {
        body = ["dinner", "dessert"];
      } else if (url.pathname === "/api/recipes") {
        if (holdSearch && url.searchParams.get("search") === "chicken") {
          holdSearch = false;
          await new Promise((resolve) => {
            releaseSearch = resolve;
            searchStarted();
          });
        }
        const search = (url.searchParams.get("search") || "").toLowerCase();
        const tags = url.searchParams.getAll("tags");
        const property = url.searchParams.get("sortProperty") || "createdAt";
        const direction =
          url.searchParams.get("sortDirection") === "asc" ? 1 : -1;
        body = recipes
          .filter((recipe) => recipe.title.toLowerCase().includes(search))
          .filter((recipe) => tags.every((tag) => recipe.tags.includes(tag)))
          .sort((a, b) => direction * a[property].localeCompare(b[property]));
      } else if (url.pathname.startsWith("/api/recipes/")) {
        const recipe = recipes.find((item) =>
          url.pathname.endsWith(`/${item._id}`),
        );
        assert.ok(recipe, `Unknown recipe: ${url.pathname}`);
        if (request.method() === "PUT") {
          Object.assign(recipe, request.postDataJSON());
          updatedId = recipe._id;
        }
        body = recipe;
      }
      await route.fulfill({ json: body });
    });

    await page.goto(`${baseURL}/recipes`, { waitUntil: "networkidle" });
    await page
      .getByText("12 recipes in your collection", { exact: true })
      .waitFor();
    const firstTitle = page.getByText("Chicken dinner 10", { exact: true });
    const originalNode = await firstTitle.elementHandle();
    assert.ok(originalNode);

    holdSearch = true;
    await page.getByPlaceholder("Search for snacks").fill("chicken");
    await searchPending;
    assert.equal(await originalNode.evaluate((node) => node.isConnected), true);
    assert.equal(
      await page.getByText("No data available", { exact: true }).count(),
      0,
    );
    releaseSearch();
    await page
      .getByText('6 recipes matching "chicken"', { exact: true })
      .waitFor();
    assert.equal(await originalNode.evaluate((node) => node.isConnected), true);
    assert.equal(await page.getByText(/^Chocolate cake \d+$/).count(), 0);
    checks.push("Pending search and changed results retain matching DOM nodes");

    await page.getByRole("combobox").click();
    await page
      .getByRole("option", { name: "Sort by title (desc)", exact: true })
      .click();
    await page.waitForFunction(() => {
      const titles = [...document.querySelectorAll("span")].filter((node) =>
        /^Chicken dinner \d+$/.test(node.textContent),
      );
      return titles[0]?.textContent === "Chicken dinner 8";
    });
    checks.push("Sorting updates card order");

    await page.getByPlaceholder("Search for snacks").fill("");
    await page
      .getByText("12 recipes in your collection", { exact: true })
      .waitFor();
    await page
      .getByRole("textbox", { name: "Search for tags" })
      .fill("dessert");
    await page.getByText("dessert", { exact: true }).first().click();
    await page
      .getByText("6 recipes in your collection with tags: dessert", {
        exact: true,
      })
      .waitFor();
    assert.equal(await page.getByText(/^Chicken dinner \d+$/).count(), 0);
    await page.getByRole("button", { name: "Remove dessert tag" }).click();
    await page
      .getByText("12 recipes in your collection", { exact: true })
      .waitFor();
    checks.push("Tag filtering and clearing replace the collection");

    const expectedId = recipes.find(
      (recipe) => recipe.title === "Chocolate cake 9",
    )._id;
    await page.getByRole("button", { name: "More options" }).first().click();
    await page
      .getByRole("menuitem", { name: "Change Title", exact: true })
      .click();
    const titleInput = page.getByRole("textbox", { name: "Recipe title" });
    await titleInput.waitFor();
    assert.equal(await titleInput.inputValue(), "Chocolate cake 9");
    await titleInput.fill("Updated recipe title");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.getByText("Updated recipe title", { exact: true }).waitFor();
    assert.equal(updatedId, expectedId);
    checks.push(
      "Recipe-action context saves the correct recipe and refetches updated data",
    );

    await page.getByPlaceholder("Search for snacks").fill("no-matching-recipe");
    await page.getByText("No data available", { exact: true }).waitFor();
    assert.equal(
      await page.getByText("Updated recipe title", { exact: true }).count(),
      0,
    );
    await page.getByPlaceholder("Search for snacks").fill("");
    await page.getByText("Updated recipe title", { exact: true }).waitFor();
    checks.push(
      "Empty results replace stale cards and clearing search restores results",
    );

    await page.getByText("Updated recipe title", { exact: true }).click();
    await page.waitForURL(`${baseURL}/recipes/${expectedId}`);
    await page
      .getByRole("button", {
        name: "Convert Measurements using AI",
        exact: true,
      })
      .waitFor();
    await page.getByText("Updated recipe title", { exact: true }).waitFor();
    checks.push("Updated cards navigate to the correct recipe detail");
    assert.deepEqual(errors, []);

    fs.writeFileSync(
      path.join(output, "results.json"),
      JSON.stringify(
        { baseURL, browser: browser.version(), checks, errors, requests },
        null,
        2,
      ),
    );
    console.log(JSON.stringify({ checks, errors }, null, 2));
  } finally {
    if (releaseSearch) releaseSearch();
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
