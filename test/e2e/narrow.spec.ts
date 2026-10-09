// On a phone nothing is cut off at the right edge of any page, and text fields are large
// enough that iOS does not zoom in when they are focused.

import { expect, test } from "@playwright/test";
import { elementsPastViewport } from "./overflow";

const ROUTES = [
  "/",
  "/sorting",
  "/divide",
  "/binary",
  "/bits",
  "/backtrack",
  "/greedy",
  "/dp",
  "/knapsack",
  "/dp-seq",
  "/dp-pro",
  "/math",
  "/strings",
  "/atlas",
];

/** Show every scroll-revealed section, in English and in Chinese. */
async function open(page: import("@playwright/test").Page, route: string, lang: "en" | "zh") {
  await page.addInitScript((l) => {
    try {
      localStorage.setItem("aa-lang", l);
      localStorage.setItem("algo-lang", l);
    } catch {
      /* ignore */
    }
  }, lang);
  await page.goto(route);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("html")).toHaveAttribute("data-lang", lang);
  await page.evaluate(() =>
    document.querySelectorAll(".reveal").forEach((e) => e.classList.add("in")),
  );
}

for (const width of [360, 390]) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const route of ROUTES) {
      for (const lang of ["en", "zh"] as const) {
        test(`nothing on ${route} (${lang}) is cut off at the right edge`, async ({ page }) => {
          await open(page, route, lang);
          expect(await elementsPastViewport(page)).toEqual([]);
        });
      }
    }
  });
}

test.describe("text fields on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("are at least 16px, so iOS Safari does not zoom in on focus", async ({ page }) => {
    await page.goto("/");
    // The quiz fill-in and the palette's search box are not always on the page, so measure a
    // field with each of their classes
    const sizes = await page.evaluate(() =>
      ["q-input", "cmdk-input"].map((cls) => {
        const field = document.createElement("input");
        field.className = cls;
        document.body.appendChild(field);
        const size = parseFloat(getComputedStyle(field).fontSize);
        field.remove();
        return size;
      }),
    );
    for (const size of sizes) expect(size).toBeGreaterThanOrEqual(16);
  });
});
