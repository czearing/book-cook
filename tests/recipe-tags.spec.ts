import { expect, test, type Locator } from "@playwright/test";

const recipe = {
  _id: "507f1f77bcf86cd799439011",
  title: "Tag layout regression",
  emoji: "",
  tags: ["italian", "vegetarian", "dinner"],
  createdAt: "2026-03-01T00:00:00.000Z",
  data: "Recipe content",
  imageURL: null,
  owner: "tag-layout@example.test",
  isPublic: false,
};

const expectNoEmptyRow = async (editor: Locator): Promise<void> => {
  await expect
    .poll(() =>
      editor.evaluate((element) => {
        const tags = Array.from(element.children).filter(
          (child) => child.tagName === "SPAN",
        );
        const first = tags[0].getBoundingClientRect();
        const last = tags[tags.length - 1].getBoundingClientRect();
        return (
          element.getBoundingClientRect().height -
          Math.max(26, last.bottom - first.top)
        );
      }),
    )
    .toBeLessThan(1);
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== "GET") {
      throw new Error(`Unexpected API write: ${path}`);
    }
    if (path === "/api/auth/session") {
      return route.fulfill({
        json: {
          user: { name: "Tag tester", email: recipe.owner, image: null },
          expires: "2099-01-01T00:00:00.000Z",
        },
      });
    }
    if (path === `/api/recipes/${recipe._id}`) {
      return route.fulfill({ json: recipe });
    }
    if (path === "/api/recipes") {
      return route.fulfill({ json: [recipe] });
    }
    if (path === "/api/user/recentlyViewed") {
      return route.fulfill({ json: [] });
    }
    throw new Error(`Unexpected API request: ${path}`);
  });
  await page.goto(`/recipes/${recipe._id}`);
  await expect(
    page.getByRole("button", { name: "Remove tag italian", exact: true }),
  ).toBeVisible();
});

test("clicking away leaves only real tag rows and supports reopening", async ({
  page,
}) => {
  const remove = page.getByRole("button", {
    name: "Remove tag italian",
    exact: true,
  });
  const editor = remove.locator("..").locator("..");
  const input = editor.getByRole("textbox", { name: "Add tags", exact: true });
  const heading = page.getByRole("heading", {
    name: recipe.title,
    exact: true,
  });

  // Force the final chip to fill its row, independent of platform font metrics.
  await editor.evaluate((element) => {
    const widths = Array.from(element.children)
      .filter((child) => child.tagName === "SPAN")
      .map((tag) => tag.getBoundingClientRect().width);
    element.style.width = `${Math.ceil(Math.max(...widths)) + 1}px`;
  });
  await input.focus();
  await expect(input).toBeFocused();
  await heading.click();
  await expect(input).not.toBeFocused();
  await expectNoEmptyRow(editor);

  await editor.getByText("italian", { exact: true }).click();
  await expect(input).toBeFocused();
  await input.fill("quick");
  await input.press("Enter");
  await expect(
    page.getByRole("button", { name: "Remove tag quick", exact: true }),
  ).toBeVisible();
  await heading.click();
  await expectNoEmptyRow(editor);

  await page.getByRole("button", { name: "Remove tag quick" }).focus();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await input.fill(" lunch ");
  await heading.click();
  await expect(
    page.getByRole("button", { name: "Remove tag lunch", exact: true }),
  ).toBeVisible();
  await expectNoEmptyRow(editor);
});

test("removing the last tag restores the empty editor placeholder", async ({
  page,
}) => {
  for (const tag of recipe.tags) {
    await page
      .getByRole("button", { name: `Remove tag ${tag}`, exact: true })
      .click();
  }
  const input = page.getByPlaceholder("Add tags\u2026");
  await expect(input).toBeVisible();
  await input.fill("breakfast");
  await input.press(",");
  await expect(
    page.getByRole("button", { name: "Remove tag breakfast", exact: true }),
  ).toBeVisible();
});
