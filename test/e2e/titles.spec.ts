// Every chapter has its own tab title, in the reader's language, and a path outside the
// course is a real 404 that does not pretend to be the prologue.

import { expect, test } from "@playwright/test";

const ROUTES = ["/sorting", "/binary", "/dp", "/strings", "/atlas"];

test("each chapter has a distinct title", async ({ page }) => {
  const titles: string[] = [];
  for (const route of ROUTES) {
    await page.goto(route);
    const title = await page.title();
    expect(title).toMatch(/ · AlgoAlgo$/);
    titles.push(title);
  }
  expect(new Set(titles).size).toBe(ROUTES.length);
});

test("a Chinese reader's tab stays in Chinese across navigation", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("aa-lang", "zh");
    localStorage.setItem("algo-lang", "zh");
  });
  await page.goto("/sorting");
  // Next.js rewrites the English title when its metadata hydrates; wait that out
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveTitle("排序 · AlgoAlgo");
  await page.locator('.side-link[href="/dp"]').click();
  await expect(page).toHaveURL(/\/dp$/);
  await expect(page).toHaveTitle(/^动态规划.* · AlgoAlgo$/);
  await page.locator('.side-link[href="/"]').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page).toHaveTitle("AlgoAlgo · 看得见的算法");
  await page.goto("/no-such-chapter");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveTitle("页面不存在 · AlgoAlgo");
});

test("switching the interface language retitles the tab", async ({ page }) => {
  await page.goto("/sorting");
  await expect(page).toHaveTitle("Sorting · AlgoAlgo");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page).toHaveTitle("排序 · AlgoAlgo");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page).toHaveTitle("Sorting · AlgoAlgo");
});

test("an unknown path is a 404 with its own breadcrumb", async ({ page }) => {
  const response = await page.goto("/no-such-chapter");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page does not exist");
  await expect(page.locator(".tb-crumb")).toContainText("Page not found");
  await expect(page.locator('.side-link[aria-current="page"]')).toHaveCount(0);
  await expect(page).toHaveTitle("Page not found · AlgoAlgo");
});
