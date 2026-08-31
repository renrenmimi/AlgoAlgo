import { expect, test, type Locator, type Page } from "@playwright/test";

/** The first race on the sorting chapter: the three O(n^2) siblings. */
const firstRace = (page: Page): Locator => page.locator(".race").first();

const counters = async (race: Locator): Promise<string[]> =>
  (await race.locator(".race-bar-val").allTextContents()).map((s) => s.trim());

const laneNames = async (race: Locator): Promise<string[]> =>
  (await race.locator(".race-lane-name").allTextContents()).map((s) => s.trim());

/** Reveal-on-scroll hides sections until they enter the viewport. */
async function showEverything(page: Page) {
  await page.evaluate(() =>
    document.querySelectorAll(".reveal").forEach((e) => e.classList.add("in")),
  );
}

async function openSorting(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("algo-lang", "en");
    } catch {
      /* ignore */
    }
  });
  await page.goto("/sorting");
  await page.waitForSelector(".race");
  await showEverything(page);
}

/** A lane located by contender name, so the assertions do not depend on lane order. */
const lane = (race: Locator, name: string) =>
  race.locator(".race-lane").filter({ has: race.page().locator(".race-lane-name", { hasText: name }) });

/** One metric row inside a lane, located by its label. */
const metric = (race: Locator, contender: string, label: string) =>
  lane(race, contender).locator(".race-bar").filter({ hasText: label }).locator(".race-bar-val");

const shapeButton = (race: Locator, name: string) =>
  race.locator(".race-ctl-row").first().locator(".seg-btn", { hasText: name });

const sizeButton = (race: Locator, n: string) =>
  race.locator(".race-ctl-row").nth(1).locator(".seg-btn", { hasText: new RegExp(`^${n}$`) });

test.describe("the race reacts to its controls", () => {
  test("switching Random to Already sorted repaints the counters", async ({ page }) => {
    await openSorting(page);
    const race = firstRace(page);

    // Random, n = 32, seed 7.
    await expect(race.locator(".race-bar-val").first()).toHaveText("254");
    const before = await counters(race);

    await shapeButton(race, "Already sorted").click();

    // Insertion sort: n-1 comparisons, no moves.
    await expect(race.locator(".race-bar-val").first()).toHaveText("31");
    const after = await counters(race);
    expect(after).not.toEqual(before);
    expect(after.slice(0, 3)).toEqual(["31", "0", "1"]);
  });

  test("changing the size updates every count", async ({ page }) => {
    await openSorting(page);
    const race = firstRace(page);
    const before = await counters(race);

    await sizeButton(race, "8").click();

    // Selection sort at n = 8: 8*7/2 = 28 comparisons. Assert on the settled value --
    // the counters roll towards it, so reading them mid-animation proves nothing.
    await expect(metric(race, "Selection sort", "Comparisons")).toHaveText("28");
    const after = await counters(race);
    expect(after).not.toEqual(before);
    // Insertion sort shrinks with the input too.
    expect(Number(after[0])).toBeLessThan(Number(before[0]));
  });

  test("reroll changes the random input but not the contenders", async ({ page }) => {
    await openSorting(page);
    const race = firstRace(page);
    const namesBefore = await laneNames(race);
    const badgesBefore = await race.locator(".big-o").allTextContents();
    const before = await counters(race);

    await race.locator(".race-reroll").click();

    await expect
      .poll(async () => (await counters(race)).join(","))
      .not.toBe(before.join(","));
    expect(await laneNames(race)).toEqual(namesBefore);
    expect(await race.locator(".big-o").allTextContents()).toEqual(badgesBefore);
  });

  test("reroll is disabled for a shape with only one form", async ({ page }) => {
    await openSorting(page);
    const race = firstRace(page);
    await expect(race.locator(".race-reroll")).toBeEnabled();
    await shapeButton(race, "Already sorted").click();
    await expect(race.locator(".race-reroll")).toBeDisabled();
  });
});

test.describe("language", () => {
  test("switches the race copy without changing the numbers", async ({ page }) => {
    await openSorting(page);
    const race = firstRace(page);

    expect((await laneNames(race))[0]).toBe("Insertion sort");
    const inEnglish = await counters(race);

    await page.getByRole("button", { name: "中文", exact: true }).click();
    await expect(race.locator(".race-lane-name").first()).toHaveText("插入排序");
    await showEverything(page);
    expect(await race.locator(".race-bar-lab").first().textContent()).toBe("比较次数");
    expect(await counters(race)).toEqual(inEnglish);

    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(race.locator(".race-lane-name").first()).toHaveText("Insertion sort");
    expect(await counters(race)).toEqual(inEnglish);
  });
});

test.describe("narrow viewport", () => {
  for (const path of ["/sorting", "/dp", "/divide", "/binary"]) {
    test(`no horizontal overflow at 360px on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(path);
      await page.waitForSelector(".race");
      await showEverything(page);

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        const problems: string[] = [];
        if (doc.scrollWidth > window.innerWidth + 1) {
          problems.push(`document ${doc.scrollWidth} > ${window.innerWidth}`);
        }
        const scrollable = (el: Element) => {
          const o = getComputedStyle(el).overflowX;
          return o === "auto" || o === "scroll";
        };
        // Nothing inside a race may be cut off without a way to scroll to it.
        document
          .querySelectorAll(".race, .race-lane, .race-bar, .race-ctl, .race-legend, .race-verdict")
          .forEach((el) => {
            if (el.scrollWidth > el.clientWidth + 1 && !scrollable(el)) {
              problems.push(`${el.className}: ${el.scrollWidth} > ${el.clientWidth}`);
            }
          });
        // A metric label that is cut off stops explaining what is being counted.
        document.querySelectorAll(".race-bar-lab").forEach((el) => {
          if (el.scrollWidth > el.clientWidth + 1) {
            problems.push(`clipped label: ${el.textContent}`);
          }
        });
        return problems;
      });

      expect(overflow).toEqual([]);
    });
  }
});

test.describe("reduced motion", () => {
  test("settles directly on the final numbers", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openSorting(page);
    const race = firstRace(page);

    await shapeButton(race, "Already sorted").click();

    // No polling and no waiting: with motion reduced the value must already be final
    // on the first paint after the click.
    await expect(race.locator(".race-bar-val").first()).toHaveText("31", { timeout: 250 });
    expect((await counters(race)).slice(0, 3)).toEqual(["31", "0", "1"]);
  });

  test("still lands exactly when motion is allowed", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openSorting(page);
    const race = firstRace(page);

    await shapeButton(race, "Already sorted").click();
    await expect(race.locator(".race-bar-val").first()).toHaveText("31");
    expect((await counters(race)).slice(0, 3)).toEqual(["31", "0", "1"]);
  });
});
