import { expect, test } from "./control-fixture";

for (const width of [390, 1440]) {
  test(`Settings has flat labelled sections and stacked profile at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/settings");
    for (const name of [
      "Appearance",
      "Recipe Preferences",
      "Sharing",
      "Account",
    ]) {
      const section = page.getByRole("region", { name, exact: true });
      await expect(section).toBeVisible();
      expect(
        await section.evaluate((element) => ({
          border: getComputedStyle(element).borderTopWidth,
          radius: getComputedStyle(element).borderRadius,
          background: getComputedStyle(element).backgroundColor,
        })),
      ).toEqual({
        border: "1px",
        radius: "0px",
        background: "rgba(0, 0, 0, 0)",
      });
    }
    const account = page.getByRole("region", { name: "Account", exact: true });
    await expect(
      account.getByText("Regression tester", { exact: true }),
    ).toBeVisible();
    await expect(
      account.getByText("regression@example.test", { exact: true }),
    ).toBeVisible();
    expect(
      await account
        .getByText("regression@example.test", { exact: true })
        .evaluate(
          (element) => getComputedStyle(element.parentElement!).flexDirection,
        ),
    ).toBe("column");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test("clear history uses the real endpoint and surfaces failure", async ({
  page,
}) => {
  await page.route("**/api/user/recentlyViewed", async (route) => {
    await route.fulfill({
      status: route.request().method() === "DELETE" ? 500 : 200,
      json: [],
    });
  });
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/settings");
  await page
    .getByRole("button", { name: "Clear History", exact: true })
    .click();
  await expect(
    page
      .getByRole("region", { name: "Account", exact: true })
      .getByRole("alert"),
  ).toHaveText("Failed to clear history. Please try again.");
  await expect(
    page.getByRole("button", { name: "Clear History", exact: true }),
  ).toBeEnabled();
});
