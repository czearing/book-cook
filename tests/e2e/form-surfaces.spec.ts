import { expect, test, surface } from "./control-fixture";

for (const theme of ["light", "dark"] as const) {
  test(`settings and portal controls share surfaces: ${theme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.goto("/settings");
    const search = page.getByRole("searchbox", { name: "Search settings" });
    await expect(search).toBeVisible();
    await page.getByRole("heading", { name: "Settings", exact: true }).click();
    const resting = await surface(search.locator(".."));
    await page.getByRole("button", { name: "Appearance", exact: true }).click();
    const color = page.getByLabel("Select primary color");
    await expect.poll(() => surface(color.locator(".."))).toEqual(resting);
    await page
      .getByRole("button", { name: "Recipe Preferences", exact: true })
      .click();
    const dropdown = page.getByRole("combobox");
    await expect.poll(() => surface(dropdown.locator(".."))).toEqual(resting);
    await dropdown.click();
    await page
      .getByRole("option", { name: "Metric (grams, milliliters)", exact: true })
      .click();
    await expect(dropdown).toContainText("Metric");
    await page.getByRole("button", { name: "Sharing", exact: true }).click();
    const email = page.getByRole("textbox", { name: "user@example.com" });
    await expect.poll(() => surface(email.locator(".."))).toEqual(resting);
    await email.fill("friend@example.test");
    await expect(email).toHaveValue("friend@example.test");

    await page.getByRole("button", { name: "New Recipe", exact: true }).click();
    const dialog = page.getByRole("dialog");
    const title = dialog.getByRole("textbox", { name: "Recipe title" });
    const root = title.locator("..");
    await expect(title).toBeFocused();
    await title.fill("Test recipe");
    await dialog.getByRole("heading", { name: "New Recipe" }).click();
    const multiline = await surface(root);
    expect(multiline.height).toBeGreaterThanOrEqual(80);
    expect({ ...multiline, height: resting.height }).toEqual(resting);

    let release: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/api/recipes", async (route) => {
      await gate;
      await route.fulfill({
        status: 500,
        json: { error: "Isolated test failure" },
      });
    });
    try {
      await dialog
        .getByRole("button", { name: "Create Recipe", exact: true })
        .click();
      await expect(title).toBeDisabled();
      const disabled = await surface(root);
      expect(disabled.borders).not.toEqual(resting.borders);
      expect(disabled.shadow).toBe("none");
      await root.hover();
      await expect.poll(() => surface(root)).toEqual(disabled);
    } finally {
      release?.();
    }
    await expect(title).toBeEnabled();
    const runtimeError = page.getByRole("dialog", { name: "Runtime Error" });
    await expect(runtimeError).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(runtimeError).toBeHidden();
    // Next's development overlay leaves the existing portal aria-hidden.
    const failedDialog = page.getByRole("dialog", { includeHidden: true });
    await expect(
      failedDialog.getByText("Failed to upload recipe", { exact: true }),
    ).toBeVisible();
    await failedDialog
      .getByRole("button", { name: "Cancel", exact: true, includeHidden: true })
      .click();
    await expect(failedDialog).toBeHidden();

    const preference = theme === "light" ? "Dark" : "Light";
    await page.getByRole("radio", { name: preference, exact: true }).check();
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem("appThemePreference")),
      )
      .toBe(preference.toLowerCase());

    await page.emulateMedia({ forcedColors: "active" });
    await search.focus();
    await expect(search.locator("..")).toHaveCSS("outline-style", "solid");
    await expect(search.locator("..")).not.toHaveCSS(
      "outline-color",
      "rgba(0, 0, 0, 0)",
    );
  });
}
