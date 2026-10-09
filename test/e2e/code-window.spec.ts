// The code window shows exactly the characters a learner types, and stays usable on a phone:
// the file name is readable and a highlighted line's band survives sideways scrolling.

import { expect, test } from "@playwright/test";

test("code and inputs render operators as typed, without ligatures", async ({ page }) => {
  await page.goto("/sorting");
  const line = page.locator(".cl-c", { hasText: "<=" }).first();
  await expect(line).toBeAttached();
  expect(await line.evaluate((e) => getComputedStyle(e).fontVariantLigatures)).toBe(
    "no-contextual",
  );
  const input = page.locator(".q-input").first();
  if (await input.count()) {
    expect(await input.evaluate((e) => getComputedStyle(e).fontVariantLigatures)).toBe(
      "no-contextual",
    );
  }
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the full file name sits on its own row above the language tabs", async ({ page }) => {
    await page.goto("/sorting");
    const win = page.locator(".codewin", { has: page.locator('[role="tablist"]') }).first();
    await win.scrollIntoViewIfNeeded();
    const name = win.locator(".codewin-name");
    const truncated = await name.evaluate((e) => e.scrollWidth > e.clientWidth);
    expect(truncated).toBe(false);
    const nameBox = (await name.boundingBox())!;
    const tabsBox = (await win.locator('[role="tablist"]').boundingBox())!;
    expect(nameBox.y + nameBox.height).toBeLessThanOrEqual(tabsBox.y);
  });

  test("a highlighted line's band spans the whole scrollable width", async ({ page }) => {
    await page.goto("/sorting");
    const widths = await page.locator(".codewin-body").evaluateAll((bodies) => {
      const wide = bodies.find(
        (b) => b.scrollWidth > b.clientWidth && b.querySelector(".cl.hl"),
      );
      if (!wide) return null;
      const hl = wide.querySelector<HTMLElement>(".cl.hl")!;
      return { band: hl.offsetWidth, scroll: wide.scrollWidth };
    });
    expect(widths).not.toBeNull();
    expect(widths!.band).toBe(widths!.scroll);
  });
});
