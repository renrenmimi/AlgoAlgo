// The content must be readable without JavaScript: scroll-revealed sections show, and the
// home page's statistics are real numbers in the HTML rather than a 0 that would count up.

import { expect, test } from "@playwright/test";

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("every section of a chapter is visible", async ({ page }) => {
    await page.goto("/dp");
    // At once where the browser reports scripting: none, and after the 3 s CSS fallback at
    // the latest
    await expect
      .poll(
        () =>
          page
            .locator(".reveal")
            .evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity !== "1").length),
        { timeout: 6000 },
      )
      .toBe(0);
  });

  test("the home page's statistics show their real values", async ({ page }) => {
    await page.goto("/");
    const finals = await page.locator(".home-stat .count-final").allTextContents();
    expect(finals.length).toBeGreaterThan(0);
    for (const f of finals) expect(Number.parseInt(f, 10)).toBeGreaterThan(0);
    // No rolling 0 is left in the HTML
    for (const live of await page.locator(".home-stat .count-live").allTextContents()) {
      expect(live).toBe("");
    }
  });
});

test("with JavaScript, the statistics still roll up to the real values", async ({ page }) => {
  await page.goto("/");
  const first = page.locator(".home-stat").first();
  const final = (await first.locator(".count-final").textContent()) ?? "";
  await expect(first.locator(".count-live")).toHaveText(final, { timeout: 5000 });
});
