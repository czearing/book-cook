import { expect, test } from '@playwright/test';

test('checkbox typing, keyboard toggling and save/reload retain task state', async ({ page }) => {
  const recipeId = '507f1f77bcf86cd799439011';
  let recipe = {
    _id: recipeId,
    title: 'Checkbox regression recipe',
    data: '<p></p>',
    tags: [],
    imageURL: '',
    emoji: '',
    owner: 'checkbox-test-user',
    sharedWith: [],
  };
  await page.route('**/api/**', async route => {
    const { pathname } = new URL(route.request().url());
    if (pathname === '/api/auth/session') {
      await route.fulfill({
        json: {
          user: {
            id: recipe.owner,
            email: 'checkbox@example.test',
            name: 'Editor tester',
          },
          expires: '2099-01-01T00:00:00.000Z',
        },
      });
    } else if (pathname === `/api/recipes/${recipeId}`) {
      if (route.request().method() === 'PUT') {
        const payload: unknown = route.request().postDataJSON();
        if (!payload || typeof payload !== 'object' || !('data' in payload) || typeof payload.data !== 'string') {
          throw new Error('Expected a recipe HTML save payload');
        }
        recipe = { ...recipe, data: payload.data };
      }
      await route.fulfill({ json: recipe });
    } else {
      await route.fulfill({ json: [] });
    }
  });

  await page.goto(`/recipes/${recipeId}`);
  const editor = page.getByRole('textbox', {
    name: 'Recipe content',
    exact: true,
  });
  await expect(editor).toBeVisible({ timeout: 90000 });
  await editor.pressSequentially('[] Chop onions');
  const checkbox = page.getByRole('checkbox', {
    name: 'Chop onions',
    exact: true,
  });
  await expect(checkbox).toBeVisible();
  await expect(checkbox).not.toBeChecked();
  await checkbox.focus();
  await expect(checkbox).toBeFocused();
  await checkbox.press('Space');
  await expect(checkbox).toBeChecked();
  await editor.press('Control+End');
  await editor.press('Enter');
  await page.keyboard.type('Cook onions');
  const nextTask = page.getByRole('checkbox', {
    name: 'Cook onions',
    exact: true,
  });
  await expect(nextTask).not.toBeChecked();

  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect.poll(() => recipe.data).toContain('data-checked="true"');
  await expect(page.getByRole('button', { name: 'Save changes', exact: true })).not.toBeVisible();
  await page.reload();
  await expect(checkbox).toBeChecked();
  await expect(nextTask).not.toBeChecked();
  await expect(editor).toContainText('Chop onions');
});
