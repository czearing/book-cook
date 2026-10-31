import { expect, type Page } from "@playwright/test";

export const original = {
  _id: "507f1f77bcf86cd799439011",
  title: "Options test recipe",
  emoji: "",
  tags: ["dinner"],
  createdAt: "2026-03-01T00:00:00.000Z",
  data: "Recipe content",
  imageURL: "",
  owner: "options@example.test",
  isPublic: false,
};

type OptionsFixture = {
  writes: string[];
  failSave: (value: boolean) => void;
  failDelete: (value: boolean) => void;
};

/** Isolated persistence and failure controls shared by the options browser flows. */
export const setup = async (page: Page): Promise<OptionsFixture> => {
  let recipe = { ...original };
  let deleted = false;
  const writes: string[] = [];
  let failSave = false;
  let failDelete = false;
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === `/api/recipes/${recipe._id}`) {
      if (request.method() === "PUT") {
        writes.push("PUT");
        if (failSave) {
          return route.fulfill({
            status: 500,
            json: { message: "Save unavailable" },
          });
        }
        const payload: unknown = request.postDataJSON();
        if (
          !payload ||
          typeof payload !== "object" ||
          !("title" in payload) ||
          typeof payload.title !== "string" ||
          !("data" in payload) ||
          typeof payload.data !== "string" ||
          !("emoji" in payload) ||
          typeof payload.emoji !== "string" ||
          !("tags" in payload) ||
          !Array.isArray(payload.tags) ||
          !payload.tags.every((tag: unknown) => typeof tag === "string")
        ) {
          throw new Error("Expected a complete recipe save payload");
        }
        recipe = {
          ...recipe,
          title: payload.title,
          data: payload.data,
          emoji: payload.emoji,
          tags: payload.tags,
        };
      } else if (request.method() === "DELETE") {
        writes.push("DELETE");
        deleted = !failDelete;
        return route.fulfill({
          status: failDelete ? 500 : 200,
          json: {
            message: failDelete ? "Delete unavailable" : "Deleted",
            recipeId: recipe._id,
          },
        });
      } else if (request.method() !== "GET") {
        throw new Error(`Unexpected recipe write: ${request.method()}`);
      }
      return route.fulfill({
        status: deleted ? 404 : 200,
        json: deleted ? { message: "Recipe not found" } : recipe,
      });
    }
    if (request.method() !== "GET") {
      throw new Error(`Unexpected API write: ${request.method()} ${path}`);
    }
    if (path === "/api/auth/session") {
      return route.fulfill({
        json: {
          user: { name: "Options tester", email: recipe.owner, image: null },
          expires: "2099-01-01T00:00:00.000Z",
        },
      });
    }
    if (path === "/api/recipes") {
      return route.fulfill({
        json: {
          recipes: deleted ? [] : [recipe],
          totalCount: deleted ? 0 : 1,
          hasMore: false,
        },
      });
    }
    if (path === "/api/user/recentlyViewed") {
      return route.fulfill({ json: [] });
    }
    throw new Error(`Unexpected API request: ${request.method()} ${path}`);
  });
  await page.goto(`/recipes/${recipe._id}`);
  await expect(
    page.getByRole("heading", { name: recipe.title, exact: true }),
  ).toBeVisible();
  return {
    writes,
    failSave: (value) => {
      failSave = value;
    },
    failDelete: (value) => {
      failDelete = value;
    },
  };
};
