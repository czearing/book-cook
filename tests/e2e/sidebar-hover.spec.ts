import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });
  await page.route('**/api/**', async route => {
    const { pathname } = new URL(route.request().url());
    await route.fulfill({
      json:
        pathname === '/api/auth/session'
          ? {
              user: {
                id: 'sidebar-test',
                email: 'sidebar@example.test',
                name: 'Sidebar tester',
              },
              expires: '2099-01-01T00:00:00.000Z',
            }
          : [],
    });
  });
});

for (const theme of ['light', 'dark'] as const) {
  for (const reducedMotion of ['reduce', 'no-preference'] as const) {
    test(`sidebar interactions: ${theme}, motion ${reducedMotion}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 800, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion });
      await page.goto('/recipes');
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      const menu = page.getByRole('dialog');
      await expect(menu).toBeVisible();

      const selected = menu.getByRole('button', {
        name: 'Recipes',
        exact: true,
      });
      const other = menu.getByRole('button', {
        name: 'Collections',
        exact: true,
      });
      const home = menu.getByRole('button', { name: 'Home', exact: true });
      const fill = (button: typeof selected) => button.evaluate(element => getComputedStyle(element).backgroundColor);
      await menu.getByRole('heading', { name: 'Menu', exact: true }).hover();

      for (const button of [home, other, selected]) {
        const restingFill = await fill(button);
        const restingBox = await button.boundingBox();
        await button.hover();
        const channels = (color: string) => Array.from(color.matchAll(/\d+/g), ([channel]) => Number(channel));
        await expect
          .poll(async () => {
            const difference = channels(await fill(button)).map((channel, index) =>
              Math.abs(channel - channels(restingFill)[index]),
            );
            return Math.max(...difference);
          })
          .toBeGreaterThanOrEqual(12);
        expect(await button.boundingBox()).toEqual(restingBox);
        await menu.getByRole('heading', { name: 'Menu', exact: true }).hover();
        await expect.poll(() => fill(button)).toBe(restingFill);
      }
      await expect(selected).toHaveAttribute('aria-current', 'page');
      await expect(other).not.toHaveAttribute('aria-current');
      await expect(selected).toHaveCSS('font-weight', '600');
      const indicator = await selected.evaluate(element => {
        const style = getComputedStyle(element, '::before');
        return { color: style.backgroundColor, width: style.width };
      });
      await selected.hover();
      expect(
        await selected.evaluate(element => {
          const style = getComputedStyle(element, '::before');
          return { color: style.backgroundColor, width: style.width };
        }),
      ).toEqual(indicator);
      expect(indicator.width).toBe('3px');
      await expect(other).toHaveCSS('transition-duration', reducedMotion === 'reduce' ? '0s' : '0.15s');
      const screenshotPath = testInfo.outputPath('selected-hover.png');
      await menu.screenshot({ path: screenshotPath });
      await testInfo.attach('selected-hover', {
        path: screenshotPath,
        contentType: 'image/png',
      });

      await menu.getByRole('button', { name: 'Close', exact: true }).focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(home).toBeFocused();
      await expect(home).toHaveCSS('outline-style', 'solid');
      await expect(home).toHaveCSS('outline-width', '2px');
      await other.focus();
      await other.press('Enter');
      await expect(page).toHaveURL(/\/collections$/);
      await expect(menu).not.toBeVisible();

      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      await menu.getByRole('button', { name: 'Close', exact: true }).click();
      await expect(menu).not.toBeVisible();
    });
  }
}

test.describe('touch sidebar navigation', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test('destinations work without hover and close the drawer', async ({ page }) => {
    await page.goto('/recipes');
    await page.getByRole('button', { name: 'Menu', exact: true }).tap();
    const menu = page.getByRole('dialog');
    await expect(menu).toBeVisible();
    await menu.getByRole('button', { name: 'Collections', exact: true }).tap();
    await expect(page).toHaveURL(/\/collections$/);
    await expect(menu).not.toBeVisible();
  });
});
