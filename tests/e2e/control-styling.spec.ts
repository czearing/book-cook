import { expect, test, surface } from "./control-fixture";

for (const theme of ["light", "dark"] as const) {
  for (const width of [1280, 390]) {
    test(`consistent recipe controls: ${theme}, ${width}px`, async ({
      page,
      queries,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.goto("/recipes");
      const search = page.getByRole("searchbox", { name: "Search for snacks" });
      const sort = page.getByRole("combobox");
      const tags = page.getByRole("textbox", { name: "Search for tags" });
      const controls = [
        search.locator(".."),
        sort.locator(".."),
        tags.locator(".."),
      ];
      await expect(tags).toBeVisible();
      await page.getByRole("heading", { name: "My Recipes" }).click();
      const resting = await surface(controls[0]);
      expect(resting.height).toBe(36);
      expect(resting.widths).toEqual(["1px", "1px", "1px", "1px"]);
      for (const control of controls) {
        await expect.poll(() => surface(control)).toEqual(resting);
      }
      let hovered: Awaited<ReturnType<typeof surface>> | undefined;
      for (const control of controls) {
        await control.hover();
        const current = await surface(control);
        hovered ??= current;
        await expect.poll(() => surface(control)).toEqual(hovered);
      }
      await page.getByRole("heading", { name: "My Recipes" }).hover();
      let focused: Awaited<ReturnType<typeof surface>> | undefined;
      for (const [index, input] of [search, sort, tags].entries()) {
        await input.focus();
        const current = await surface(controls[index]);
        focused ??= current;
        await expect.poll(() => surface(controls[index])).toEqual(focused);
        expect(current.shadow).not.toBe("none");
      }
      await tags.fill("dinner");
      await tags.press("Enter");
      await expect(
        page.getByRole("button", { name: "Remove dinner tag" }),
      ).toBeVisible();
      await expect
        .poll(() => queries.at(-1)?.searchParams.get("tags"))
        .toBe("dinner");
      await page.getByRole("button", { name: "Remove dinner tag" }).click();
      await sort.click();
      await page
        .getByRole("option", { name: "Sort by title (asc)", exact: true })
        .click();
      await expect
        .poll(() => queries.at(-1)?.searchParams.get("sortProperty"))
        .toBe("title");
      await search.fill("soup");
      await expect
        .poll(() => queries.at(-1)?.searchParams.get("search"))
        .toBe("soup");
      await expect(
        page.getByRole("heading", { name: "My Recipes" }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath("recipe-controls.png"),
        animations: "disabled",
      });
    });
  }
}
