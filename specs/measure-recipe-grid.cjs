const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("node:fs");
const path = require("node:path");

const baseURL = process.env.PERF_URL || "http://localhost:3147";
const output = process.argv[2];
if (!output) throw new Error("Supply an output directory.");
if (fs.existsSync(output)) throw new Error("Use a new evidence directory.");
fs.mkdirSync(output, { recursive: true });

const recipes = Array.from({ length: 300 }, (_, index) => ({
  _id: `recipe-${index}`,
  title: `Chicken dinner ${index}`,
  createdAt: "2025-01-15T12:00:00.000Z",
  owner: "perf-user",
  sharedWith: [],
  isPublic: false,
  emoji: "",
  imageURL: "",
  tags: ["dinner"],
}));

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.PERF_BROWSER,
  });
  const trials = [];
  try {
    for (let trial = 0; trial < 7; trial++) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        locale: "en-US",
        timezoneId: "UTC",
        serviceWorkers: "allow",
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route("**/api/**", async (route) => {
        const url = new URL(route.request().url());
        let body;
        if (url.pathname === "/api/auth/session") {
          body = {
            user: {
              id: "perf-user",
              email: "perf@example.test",
              name: "Perf User",
            },
            expires: "2099-01-01T00:00:00.000Z",
          };
        } else if (url.pathname === "/api/recipes") {
          body = recipes;
        } else if (url.pathname === "/api/tags") {
          body = ["dinner"];
        } else {
          body = [];
        }
        await route.fulfill({ json: body });
      });
      const cdp = await context.newCDPSession(page);
      await cdp.send("Performance.enable");
      await page.goto(`${baseURL}/recipes`, { waitUntil: "networkidle" });
      await page.getByText("Chicken dinner 299", { exact: true }).waitFor();
      await page.waitForTimeout(1000);
      if (process.env.PERF_PROFILE && trial === 6) {
        await cdp.send("Profiler.enable");
        await cdp.send("Profiler.start");
      }
      const before = await cdp.send("Performance.getMetrics");
      const timings = [];
      for (const value of [
        "c",
        "ch",
        "chi",
        "chic",
        "chick",
        "chicke",
        "chicken",
      ]) {
        // Two animation frames approximate presentation, not physical key latency.
        timings.push(
          await page.evaluate(async (text) => {
            const input = document.querySelector(
              'input[placeholder="Search for snacks"]',
            );
            if (!(input instanceof HTMLInputElement))
              throw new Error("Search input missing");
            const setValue = Object.getOwnPropertyDescriptor(
              HTMLInputElement.prototype,
              "value",
            ).set;
            const start = performance.now();
            setValue.call(input, text);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            );
            return performance.now() - start;
          }, value),
        );
      }
      await page.waitForTimeout(700);
      await page.getByText('matching "chicken"', { exact: false }).waitFor();
      const after = await cdp.send("Performance.getMetrics");
      if (process.env.PERF_PROFILE && trial === 6) {
        const { profile } = await cdp.send("Profiler.stop");
        fs.writeFileSync(
          path.join(output, "search.cpuprofile"),
          JSON.stringify(profile),
        );
      }
      const delta = (name) =>
        1000 *
        (after.metrics.find((metric) => metric.name === name).value -
          before.metrics.find((metric) => metric.name === name).value);
      trials.push({
        trial,
        scriptMs: delta("ScriptDuration"),
        taskMs: delta("TaskDuration"),
        inputToPaintMs: timings,
        cards: await page.getByText(/^Chicken dinner \d+$/).count(),
        errors,
      });
      if (trial === 6) {
        await page.screenshot({
          path: path.join(output, "recipes.png"),
          animations: "disabled",
        });
        fs.writeFileSync(
          path.join(output, "visible-text.txt"),
          await page.locator("body").innerText(),
        );
        await page
          .getByRole("button", { name: "More options" })
          .first()
          .click();
        await page.getByRole("menuitem", { name: "Change Title" }).click();
        const title = page.getByRole("textbox", { name: "Recipe title" });
        await title.waitFor();
        if ((await title.inputValue()) !== "Chicken dinner 0") {
          throw new Error("Card menu lost its recipe context.");
        }
        await page.getByRole("button", { name: "Cancel", exact: true }).click();
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(output, "recipes-mobile.png"),
          animations: "disabled",
        });
        trials[trial].menuVerified = true;
      }
      await context.close();
    }
    const result = {
      baseURL,
      fixtureRecipes: recipes.length,
      browser: browser.version(),
      node: process.version,
      environment: {
        locale: "en-US",
        timezone: "UTC",
        viewport: "1440x900",
        serviceWorkers: "allowed",
      },
      boundary:
        "Seven search input updates through paint and settled 300ms debounced query; production React and DOM, deterministic API responses, no database/network latency",
      trials,
    };
    fs.writeFileSync(
      path.join(output, "results.json"),
      JSON.stringify(result, null, 2),
    );
    console.log(JSON.stringify(result, null, 2));
    if (trials.some((trial) => trial.cards !== 300 || trial.errors.length)) {
      throw new Error("Production fixture did not render correctly.");
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
