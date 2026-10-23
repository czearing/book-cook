import { expect, test } from "./control-fixture";

for (const colorScheme of ["light", "dark"] as const) {
  test(`sidebar hover, press, focus and reduced-motion feedback in ${colorScheme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.goto("/recipes");
    const item = page.getByRole("button", { name: "Recipes", exact: true });
    await expect(item).toHaveAttribute("aria-current", "page");
    const background = () =>
      item.evaluate((element) => getComputedStyle(element).backgroundColor);
    const resting = await background();
    await item.hover();
    await expect.poll(background).not.toBe(resting);
    const hovered = await background();
    await page.mouse.down();
    await expect.poll(background).not.toBe(hovered);
    await page.mouse.up();
    await item.focus();
    await item.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(item).toBeFocused();
    expect(
      await item.evaluate((element) => getComputedStyle(element).boxShadow),
    ).not.toBe("none");
    expect(
      await item.evaluate(
        (element) => getComputedStyle(element).transitionDuration,
      ),
    ).toBe("0s");
    await expect(
      page.getByRole("button", { name: "Collections", exact: true }),
    ).toBeDisabled();
  });
}
