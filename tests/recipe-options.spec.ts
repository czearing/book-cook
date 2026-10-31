import { expect, test } from "@playwright/test";

import { original, setup } from "./recipe-options.fixture";

test("clean options, save failure/retry, persistence, and discard", async ({
  page,
}) => {
  const fixture = await setup(page);
  const trigger = page.getByRole("button", {
    name: "Recipe options",
    exact: true,
  });
  await expect(
    page.getByRole("button", { name: "Save", exact: true }),
  ).toHaveCount(0);
  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "Recipe options",
    exact: true,
  });
  await expect(
    dialog.getByRole("button", { name: "Save changes", exact: true }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole("button", { name: "Discard changes", exact: true }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  expect(fixture.writes).toEqual([]);

  const heading = page.getByRole("heading", { level: 1 });
  await heading.fill("Updated recipe");
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(heading).toHaveText("Updated recipe");
  fixture.failSave(true);
  await trigger.click();
  await dialog
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText("Save failed");
  fixture.failSave(false);
  await dialog
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await page.reload();
  await expect(heading).toHaveText("Updated recipe");
  await heading.fill("Discard this title");
  await trigger.click();
  await dialog
    .getByRole("button", { name: "Discard changes", exact: true })
    .click();
  await expect(heading).toHaveText("Updated recipe");
  // The app retries a failed mutation once before exposing the retry action.
  expect(fixture.writes).toEqual(["PUT", "PUT", "PUT"]);
});

test("delete requires confirmation and supports cancel, failure, and retry", async ({
  page,
}) => {
  const fixture = await setup(page);
  const trigger = page.getByRole("button", {
    name: "Recipe options",
    exact: true,
  });
  await trigger.click();
  await page
    .getByRole("button", { name: "Delete recipe", exact: true })
    .click();
  const confirmation = page.getByRole("dialog", {
    name: "Delete recipe?",
    exact: true,
  });
  await expect(confirmation).toContainText(original.title);
  await expect(
    confirmation.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeFocused();
  expect(fixture.writes).toEqual([]);
  await confirmation
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Recipe options", exact: true }),
  ).toBeVisible();
  fixture.failDelete(true);
  await page
    .getByRole("button", { name: "Delete recipe", exact: true })
    .click();
  await confirmation
    .getByRole("button", { name: "Delete recipe", exact: true })
    .click();
  await expect(confirmation.getByRole("alert")).toContainText("Delete failed");
  await expect(page).toHaveURL(new RegExp(`/recipes/${original._id}$`));
  fixture.failDelete(false);
  await confirmation
    .getByRole("button", { name: "Delete recipe", exact: true })
    .click();
  await expect(page).toHaveURL("/recipes");
  await expect(
    page.getByRole("main").getByText("No recipes found.", { exact: true }),
  ).toBeVisible();
  expect(fixture.writes).toEqual(["DELETE", "DELETE", "DELETE"]);
});

test("options fit a narrow screen and keyboard dismissal restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await setup(page);
  const trigger = page.getByRole("button", {
    name: "Recipe options",
    exact: true,
  });
  await trigger.click();
  await page.keyboard.press("Escape");
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", {
    name: "Recipe options",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});
