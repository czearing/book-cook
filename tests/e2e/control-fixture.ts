import { test as base, expect } from "@playwright/test";
import type { Locator } from "@playwright/test";

export { expect };

export const test = base.extend<{ queries: URL[] }>({
  queries: [
    async ({ page }, use) => {
      const queries: URL[] = [];
      await page.addInitScript(() => localStorage.clear());
      await page.route("**/api/**", async (route) => {
        const url = new URL(route.request().url());
        if (url.pathname === "/api/recipes") {
          queries.push(url);
        }
        await route.fulfill({
          json:
            url.pathname === "/api/auth/session"
              ? {
                  user: {
                    id: "control-test",
                    email: "controls@example.test",
                    name: "Control tester",
                  },
                  expires: "2099-01-01T00:00:00.000Z",
                }
              : url.pathname === "/api/recipes"
                ? [
                    {
                      _id: "507f1f77bcf86cd799439011",
                      title: "Dinner soup",
                      data: "",
                      tags: ["dinner"],
                      imageURL: "",
                      emoji: "",
                      createdAt: "2026-01-01T00:00:00.000Z",
                    },
                  ]
                : [],
        });
      });
      await use(queries);
    },
    { auto: true },
  ],
});

export async function surface(control: Locator) {
  return control.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      height: element.getBoundingClientRect().height,
      borders: [
        style.borderTopColor,
        style.borderRightColor,
        style.borderBottomColor,
        style.borderLeftColor,
      ],
      widths: [
        style.borderTopWidth,
        style.borderRightWidth,
        style.borderBottomWidth,
        style.borderLeftWidth,
      ],
      radius: style.borderTopLeftRadius,
      background: style.backgroundColor,
      shadow: style.boxShadow,
    };
  });
}
