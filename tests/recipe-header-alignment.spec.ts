import { expect, test, type Locator, type Page } from "@playwright/test";

const recipe = {
  _id: "507f1f77bcf86cd799439012",
  title: "Header alignment regression",
  creatorName: "Header tester",
  emoji: "",
  tags: [] as string[],
  createdAt: "2026-03-15T12:00:00.000Z",
  viewCount: 12,
  savedCount: 3,
  data: "Recipe content",
  imageURL: null,
  owner: "header-layout@example.test",
  isPublic: false,
};

const openRecipe = async (page: Page, tags: string[]): Promise<void> => {
  const fixture = { ...recipe, tags };
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== "GET") {
      throw new Error(`Unexpected API write: ${path}`);
    }
    if (path === "/api/auth/session") {
      return route.fulfill({
        json: {
          user: { name: recipe.creatorName, email: recipe.owner, image: null },
          expires: "2099-01-01T00:00:00.000Z",
        },
      });
    }
    if (path === `/api/recipes/${recipe._id}`) {
      return route.fulfill({ json: fixture });
    }
    if (path === "/api/recipes") {
      return route.fulfill({
        json: { recipes: [fixture], totalCount: 1, hasMore: false },
      });
    }
    if (path === "/api/user/recentlyViewed") {
      return route.fulfill({ json: [] });
    }
    throw new Error(`Unexpected API request: ${path}`);
  });
  await page.goto(`/recipes/${recipe._id}`);
  await expect(
    page.getByRole("heading", { name: recipe.title, exact: true }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
};

// Range boxes and font ascent locate text baselines, not unequal box centers.
const baseline = async (locator: Locator): Promise<number> =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const context = document.createElement("canvas").getContext("2d");
    if (!context) {
      throw new Error("Canvas font metrics are unavailable");
    }
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const metrics = context.measureText("Header");
    if (element instanceof HTMLInputElement) {
      const box = element.getBoundingClientRect();
      const top =
        parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop);
      const bottom =
        parseFloat(style.borderBottomWidth) + parseFloat(style.paddingBottom);
      return (
        box.top +
        top +
        (box.height - top - bottom) / 2 +
        (metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2
      );
    }
    const text = Array.from(element.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
    );
    if (!text) {
      throw new Error("Expected a direct text node for baseline measurement");
    }
    const range = document.createRange();
    range.selectNodeContents(text);
    return range.getBoundingClientRect().top + metrics.fontBoundingBoxAscent;
  });

const expectAligned = async (label: Locator, value: Locator): Promise<void> => {
  await expect
    .poll(async () =>
      Math.abs((await baseline(label)) - (await baseline(value))),
    )
    .toBeLessThanOrEqual(0.25);
};

for (const width of [1440, 390]) {
  test.describe(`header at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("aligns dates, chef and stats text", async ({ page }) => {
      await openRecipe(page, []);
      await expectAligned(
        page.getByText("Created", { exact: true }),
        page.getByText("Mar 15, 2026", { exact: true }),
      );
      await expectAligned(
        page.getByText("Chef", { exact: true }),
        page.getByRole("main").getByText(recipe.creatorName, { exact: true }),
      );
      await expectAligned(
        page.getByText("Stats", { exact: true }),
        page.getByText("12 views", { exact: true }),
      );
    });

    test("aligns the empty add-tags placeholder", async ({ page }) => {
      await openRecipe(page, []);
      await expectAligned(
        page.getByText("Tags", { exact: true }),
        page.getByPlaceholder("Add tags\u2026", { exact: true }),
      );
    });

    test("keeps the tags label on the first line when tags wrap", async ({
      page,
    }) => {
      await openRecipe(page, ["italian", "vegetarian", "dinner"]);
      const first = page.getByText("italian", { exact: true });
      const last = page.getByText("dinner", { exact: true });
      const editor = first.locator("..");
      await expectAligned(page.getByText("Tags", { exact: true }), first);
      await editor.evaluate((element) => {
        const widths = Array.from(element.children)
          .filter((child) => child.tagName === "SPAN")
          .map((child) => child.getBoundingClientRect().width);
        element.style.width = `${Math.ceil(Math.max(...widths)) + 1}px`;
      });
      await expect
        .poll(async () => {
          const start = await first.boundingBox();
          const end = await last.boundingBox();
          if (!start || !end) {
            throw new Error("Tag geometry is unavailable");
          }
          return end.y - start.y;
        })
        .toBeGreaterThan(20);
      await expectAligned(page.getByText("Tags", { exact: true }), first);
      const input = editor.getByRole("textbox");
      await first.click();
      await expect(input).toBeFocused();
      await page.getByRole("heading", { name: recipe.title }).click();
      await expect(input).not.toBeFocused();
      await expectAligned(page.getByText("Tags", { exact: true }), first);
    });
  });
}
