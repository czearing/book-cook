import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async route => {
    const { pathname } = new URL(route.request().url());
    await route.fulfill({
      json:
        pathname === '/api/auth/session'
          ? {
              user: {
                id: 'account-layout-test',
                email: 'account@example.test',
                name: 'Account tester',
              },
              expires: '2099-01-01T00:00:00.000Z',
            }
          : [],
    });
  });
});

for (const width of [1280, 390]) {
  test(`account layout is flat and stacked at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/settings');
    await page.getByRole('button', { name: 'Account', exact: true }).click();
    await expect(page.getByText('account@example.test', { exact: true })).toBeVisible();
    await expect(page.getByText('Profile Information', { exact: true })).toHaveCount(0);
    await expect(page.getByText(/Your account details/)).toHaveCount(0);
    const heading = page.getByRole('heading', {
      name: 'Danger Zone',
      exact: true,
    });
    const button = page.getByRole('button', {
      name: 'Delete Account',
      exact: true,
    });
    await expect(heading).toBeVisible();
    await expect(button).toBeVisible();
    const group = heading.locator('..');
    await expect(group).toHaveCSS('display', 'flex');
    await expect(group).toHaveCSS('flex-direction', 'column');
    await expect(group).toHaveCSS('border-top-width', '0px');
    await expect(group).toHaveCSS('border-right-width', '0px');
    await expect(group).toHaveCSS('border-bottom-width', '0px');
    await expect(group).toHaveCSS('border-left-width', '0px');
    await expect(group).toHaveCSS('padding', '0px');
    await expect(group.getByRole('separator')).toHaveCount(0);
    await expect
      .poll(async () => {
        const titleBox = await heading.boundingBox();
        const buttonBox = await button.boundingBox();
        if (!titleBox || !buttonBox) {
          throw new Error('Expected visible danger heading and delete button');
        }
        return buttonBox.y > titleBox.y + titleBox.height && Math.abs(buttonBox.x - titleBox.x) < 1;
      })
      .toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await button.focus();
    await expect(button).toBeFocused();
    await Promise.all([
      page.waitForEvent('dialog').then(async dialog => {
        expect(dialog.message()).toBe('This feature is not yet implemented');
        await dialog.dismiss();
      }),
      button.press('Enter'),
    ]);
    await page.screenshot({
      path: testInfo.outputPath('account-layout.png'),
      fullPage: true,
      animations: 'disabled',
    });

    const search = page.getByRole('searchbox', { name: 'Search settings' });
    await search.fill('delete');
    await expect(button).toBeVisible();
    await expect(page.getByText('account@example.test', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Sign Out', exact: true })).toHaveCount(0);
    await search.fill('email');
    await expect(page.getByText('account@example.test', { exact: true })).toBeVisible();
    await expect(button).toHaveCount(0);
  });
}
