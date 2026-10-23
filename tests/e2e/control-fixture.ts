import { test as base, expect } from "@playwright/test";

export { expect };
export const recipeId = "507f1f77bcf86cd799439011";
export const test = base.extend<{
  api: { queries: URL[]; recipe: { data: string } };
}>({
  api: [
    async ({ page }, use) => {
      const recipe = {
        _id: recipeId,
        title: "Regression recipe",
        data: "",
        tags: ["dinner"],
        emoji: "",
        imageURL: "",
        createdAt: "2026-01-01T00:00:00.000Z",
        owner: "regression@example.test",
        isPublic: false,
      };
      const queries: URL[] = [];
      await page.route("**/api/**", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.pathname === "/api/auth/session") {
          await route.fulfill({
            json: {
              user: {
                name: "Regression tester",
                email: recipe.owner,
                image: null,
              },
              expires: "2099-01-01T00:00:00.000Z",
            },
          });
        } else if (url.pathname === `/api/recipes/${recipeId}`) {
          if (request.method() === "PUT") {
            const payload: unknown = request.postDataJSON();
            if (
              !payload ||
              typeof payload !== "object" ||
              !("data" in payload) ||
              typeof payload.data !== "string"
            ) {
              throw new Error("Expected recipe Markdown");
            }
            recipe.data = payload.data;
          } else if (request.method() !== "GET") {
            throw new Error(`Unexpected recipe write: ${request.method()}`);
          }
          await route.fulfill({ json: recipe });
        } else if (url.pathname === "/api/recipes") {
          queries.push(url);
          await route.fulfill({ json: { recipes: [recipe], totalCount: 41 } });
        } else if (request.method() === "GET") {
          await route.fulfill({ json: [] });
        } else if (
          url.pathname === "/api/user/recentlyViewed" &&
          request.method() === "DELETE"
        ) {
          await route.fulfill({ json: { message: "Cleared" } });
        } else {
          throw new Error(
            `Unexpected API write: ${request.method()} ${url.pathname}`,
          );
        }
      });
      await use({ queries, recipe });
    },
    { auto: true },
  ],
});
