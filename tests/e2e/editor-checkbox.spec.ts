import { expect, recipeId, test } from "./control-fixture";

test("checkbox shortcuts, keyboard toggles, continuation and save/reload preserve Markdown", async ({
  page,
  api,
}) => {
  await page.goto(`/recipes/${recipeId}`);
  const editor = page.getByRole("textbox", {
    name: "Recipe content",
    exact: true,
  });
  await expect(editor).toBeVisible();
  await editor.pressSequentially("[] Chop onions");
  const first = page.getByRole("checkbox", {
    name: "Chop onions",
    exact: true,
  });
  await expect(first).not.toBeChecked();
  await first.focus();
  await first.press("Space");
  await expect(first).toBeChecked();
  await editor.press("Control+End");
  await editor.press("Enter");
  await page.keyboard.type("Cook onions");
  const second = page.getByRole("checkbox", {
    name: "Cook onions",
    exact: true,
  });
  await expect(second).not.toBeChecked();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect
    .poll(() => api.recipe.data)
    .toBe("- [x] Chop onions\n- [ ] Cook onions");
  await page.reload();
  await expect(first).toBeChecked();
  await expect(second).not.toBeChecked();
  await second.click({ position: { x: 8, y: 12 } });
  await expect(second).toBeChecked();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => api.recipe.data).toContain("- [x] Cook onions");
});

test("canonical Markdown task syntax and normal lists remain distinct", async ({
  page,
  api,
}) => {
  api.recipe.data = "- [x] Ready\n- [ ] Bake\n\n- Flour\n- Sugar";
  await page.goto(`/recipes/${recipeId}`);
  await expect(
    page.getByRole("checkbox", { name: "Ready", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Bake", exact: true }),
  ).not.toBeChecked();
  await expect(page.getByRole("checkbox")).toHaveCount(2);
  await expect(
    page.getByRole("textbox", { name: "Recipe content" }),
  ).toContainText("Flour");
});
