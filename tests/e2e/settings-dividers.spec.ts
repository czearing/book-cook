import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const { pathname } = new URL(route.request().url());
    await route.fulfill({
      json:
        pathname === "/api/auth/session"
          ? {
              user: {
                id: "settings-dividers-test",
                email: "settings@example.test",
                name: "Settings tester",
              },
              expires: "2099-01-01T00:00:00.000Z",
            }
          : [],
    });
  });
});

for (const width of [1280, 390]) {
  test(`flat settings and filtered dividers at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/settings");
    const title = page.getByRole("heading", { name: "Settings", exact: true });
    await expect(title).toBeVisible();
    const content = title.locator("../..");
    await expect(content).toHaveCSS("box-shadow", "none");
    await expect(content).toHaveCSS("border-radius", "0px");
    await expect(content).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    for (const side of ["top", "right", "bottom", "left"]) {
      await expect(content).toHaveCSS(`border-${side}-width`, "0px");
    }

    const appearance = page.getByRole("button", {
      name: "Appearance",
      exact: true,
    });
    const recipe = page.getByRole("button", {
      name: "Recipe Preferences",
      exact: true,
    });
    const sharing = page.getByRole("button", { name: "Sharing", exact: true });
    const account = page.getByRole("button", { name: "Account", exact: true });
    const sections = [appearance, recipe, sharing, account].map((header) =>
      header.locator("../.."),
    );
    const search = page.getByRole("searchbox", { name: "Search settings" });
    await appearance.focus();
    await appearance.press("Enter");
    await expect(appearance).toHaveAttribute("aria-expanded", "true");

    for (const theme of ["Light", "Dark"]) {
      await page.getByRole("radio", { name: theme, exact: true }).check();
      await expect(
        page.getByRole("radio", { name: theme, exact: true }),
      ).toBeChecked();
      for (const [index, section] of sections.entries()) {
        await expect(section).toHaveCSS(
          "border-top-width",
          index === 0 ? "0px" : "1px",
        );
        await expect(section).toHaveCSS("border-bottom-width", "0px");
        await expect(section).toHaveCSS("border-left-width", "0px");
        await expect(section).toHaveCSS("border-right-width", "0px");
        if (index > 0) {
          await expect(section).toHaveCSS("border-top-style", "solid");
          const stroke = await section.evaluate((element) => {
            const probe = document.createElement("span");
            probe.style.color = "var(--colorNeutralStroke2)";
            element.append(probe);
            try {
              return getComputedStyle(probe).color;
            } finally {
              probe.remove();
            }
          });
          expect(stroke).not.toBe("");
          await expect(section).toHaveCSS("border-top-color", stroke);
        }
      }
      await expect(content).toHaveCSS("box-shadow", "none");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(`settings-${theme.toLowerCase()}.png`),
        fullPage: true,
        animations: "disabled",
      });
    }

    await appearance.press("Enter");
    await expect(appearance).toHaveAttribute("aria-expanded", "false");
    await search.fill("email");
    await expect(appearance).toHaveCount(0);
    await expect(recipe).toHaveCount(0);
    await expect(sharing).toHaveAttribute("aria-expanded", "true");
    await expect(account).toHaveAttribute("aria-expanded", "true");
    await expect(sections[2]).toHaveCSS("border-top-width", "0px");
    await expect(sections[3]).toHaveCSS("border-top-width", "1px");

    await search.fill("account");
    await expect(sharing).toHaveCount(0);
    await expect(account).toHaveAttribute("aria-expanded", "true");
    await expect(sections[3]).toHaveCSS("border-top-width", "0px");
    await search.fill("no-matching-setting");
    await expect(account).toHaveCount(0);
    await expect(page.getByText("No matching settings found")).toBeVisible();
    await search.fill("");
    for (const header of [appearance, recipe, sharing, account]) {
      await expect(header).toBeVisible();
    }
    await expect(sections[0]).toHaveCSS("border-top-width", "0px");
    for (const section of sections.slice(1)) {
      await expect(section).toHaveCSS("border-top-width", "1px");
    }
  });
}
