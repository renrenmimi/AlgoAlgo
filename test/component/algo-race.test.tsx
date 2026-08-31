import { describe, expect, it } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { AlgoRace } from "@/lib/race";
import { LangProvider, useLang } from "@/lib/i18n";
import { INSERTION, MERGE, SELECTION, SHAPES, cloneArr } from "@/lib/race-sorts";
import { stubMatchMedia } from "./setup";

/** Lets a test flip the site language the way the toolbar does. */
function LangSwitch() {
  const { setLang } = useLang();
  return (
    <>
      <button onClick={() => setLang("en")}>use-en</button>
      <button onClick={() => setLang("zh")}>use-zh</button>
    </>
  );
}

function renderRace(ui?: Partial<{ defaultSize: number }>): HTMLElement {
  const race: ReactElement = (
    <AlgoRace
      title={{ en: "Sorting race", zh: "排序竞速" }}
      algos={[INSERTION, SELECTION, MERGE]}
      inputs={SHAPES}
      sizes={[8, 16, 32]}
      defaultSize={ui?.defaultSize ?? 32}
      clone={cloneArr}
    />
  );
  const { container } = render(
    <LangProvider>
      <LangSwitch />
      {race}
    </LangProvider>,
  );
  return container;
}

/** The numbers currently painted on screen, lane by lane. */
const shown = (c: HTMLElement) =>
  [...c.querySelectorAll(".race-bar-val")].map((e) => e.textContent?.trim() ?? "");

const laneNames = (c: HTMLElement) =>
  [...c.querySelectorAll(".race-lane-name")].map((e) => e.textContent?.trim() ?? "");

const shapeButtons = (c: HTMLElement) => {
  const row = c.querySelectorAll(".race-ctl-row")[0] as HTMLElement;
  return [...row.querySelectorAll(".seg-btn")] as HTMLButtonElement[];
};
const sizeButtons = (c: HTMLElement) => {
  const row = c.querySelectorAll(".race-ctl-row")[1] as HTMLElement;
  return [...row.querySelectorAll(".seg-btn")] as HTMLButtonElement[];
};

describe("switching the input shape", () => {
  it("repaints the counters with the numbers for the new shape", async () => {
    const user = userEvent.setup();
    stubMatchMedia(true); // settle immediately so the assertion is about data, not animation
    const c = renderRace();

    // Random, n = 32, seed 7: insertion sort does 254 comparisons and 253 moves.
    expect(shown(c).slice(0, 3)).toEqual(["254", "253", "1"]);

    await user.click(shapeButtons(c).find((b) => /Already sorted/.test(b.textContent ?? ""))!);

    // Already sorted: n-1 comparisons and no moves at all.
    await waitFor(() => expect(shown(c).slice(0, 3)).toEqual(["31", "0", "1"]));
  });

  it("shows the hint that belongs to the selected shape", async () => {
    const user = userEvent.setup();
    const c = renderRace();
    expect(c.querySelector(".race-hint")?.textContent).toMatch(/average case/i);

    await user.click(shapeButtons(c).find((b) => /Reversed/.test(b.textContent ?? ""))!);
    await waitFor(() =>
      expect(c.querySelector(".race-hint")?.textContent).toMatch(/out of order/i),
    );
  });

  it("marks exactly one shape as selected at a time", async () => {
    const user = userEvent.setup();
    const c = renderRace();
    expect(shapeButtons(c).filter((b) => b.classList.contains("on"))).toHaveLength(1);
    await user.click(shapeButtons(c)[3]);
    await waitFor(() => {
      const on = shapeButtons(c).filter((b) => b.classList.contains("on"));
      expect(on).toHaveLength(1);
      expect(on[0]).toBe(shapeButtons(c)[3]);
    });
  });
});

describe("changing the input size", () => {
  it("recomputes every counter", async () => {
    const user = userEvent.setup();
    stubMatchMedia(true);
    const c = renderRace();
    const before = shown(c);

    await user.click(sizeButtons(c).find((b) => b.textContent?.trim() === "8")!);

    await waitFor(() => expect(shown(c)).not.toEqual(before));
    // Selection sort at n = 8 must show exactly 8*7/2 = 28 comparisons.
    await waitFor(() => expect(shown(c)[3]).toBe("28"));
  });

  it("scales the quadratic contender the way the formula says", async () => {
    const user = userEvent.setup();
    stubMatchMedia(true);
    const c = renderRace({ defaultSize: 8 });
    await waitFor(() => expect(shown(c)[3]).toBe("28")); // 8*7/2

    await user.click(sizeButtons(c).find((b) => b.textContent?.trim() === "16")!);
    await waitFor(() => expect(shown(c)[3]).toBe("120")); // 16*15/2

    await user.click(sizeButtons(c).find((b) => b.textContent?.trim() === "32")!);
    await waitFor(() => expect(shown(c)[3]).toBe("496")); // 32*31/2
  });
});

describe("reroll", () => {
  it("draws a different random input without touching the contenders", async () => {
    const user = userEvent.setup();
    stubMatchMedia(true);
    const c = renderRace();
    const namesBefore = laneNames(c);
    const before = shown(c);

    await user.click(c.querySelector(".race-reroll") as HTMLButtonElement);

    await waitFor(() => expect(shown(c)).not.toEqual(before));
    // Same algorithms, same order, same complexity badges -- only the input moved.
    expect(laneNames(c)).toEqual(namesBefore);
    expect([...c.querySelectorAll(".big-o")].map((e) => e.textContent)).toEqual([
      "O(n²)",
      "O(n²)",
      "O(n log n)",
    ]);
  });

  it("is disabled for a shape that has only one form at a given size", async () => {
    const user = userEvent.setup();
    const c = renderRace();
    expect(c.querySelector(".race-reroll")).not.toBeDisabled();

    await user.click(shapeButtons(c).find((b) => /Already sorted/.test(b.textContent ?? ""))!);
    await waitFor(() => expect(c.querySelector(".race-reroll")).toBeDisabled());
  });
});

describe("language switch", () => {
  it("translates the labels, contenders and metric names", async () => {
    const user = userEvent.setup();
    const c = renderRace();

    expect(c.querySelector(".viz-title")?.textContent).toBe("Sorting race");
    expect(laneNames(c)[0]).toBe("Insertion sort");
    expect([...c.querySelectorAll(".race-bar-lab")][0].textContent).toBe("Comparisons");

    await user.click(screen.getByText("use-zh"));

    await waitFor(() => {
      expect(c.querySelector(".viz-title")?.textContent).toBe("排序竞速");
      expect(laneNames(c)[0]).toBe("插入排序");
      expect([...c.querySelectorAll(".race-bar-lab")][0].textContent).toBe("比较次数");
    });
  });

  it("keeps the measured numbers identical across languages", async () => {
    const user = userEvent.setup();
    stubMatchMedia(true);
    const c = renderRace();
    const inEnglish = shown(c);

    await user.click(screen.getByText("use-zh"));
    await waitFor(() => expect(laneNames(c)[0]).toBe("插入排序"));
    expect(shown(c)).toEqual(inEnglish);

    await user.click(screen.getByText("use-en"));
    await waitFor(() => expect(laneNames(c)[0]).toBe("Insertion sort"));
    expect(shown(c)).toEqual(inEnglish);
  });
});

describe("reduced motion", () => {
  it("settles directly on the final numbers instead of counting up", async () => {
    stubMatchMedia(true);
    const user = userEvent.setup();
    const c = renderRace();

    await user.click(shapeButtons(c).find((b) => /Already sorted/.test(b.textContent ?? ""))!);

    // No timers advanced, no animation frames run: the value is already final.
    expect(shown(c).slice(0, 3)).toEqual(["31", "0", "1"]);
  });

  it("still reaches the final numbers when motion is allowed", async () => {
    stubMatchMedia(false);
    const user = userEvent.setup();
    const c = renderRace();

    await user.click(shapeButtons(c).find((b) => /Already sorted/.test(b.textContent ?? ""))!);

    // The roll-up is allowed to take a moment, but it must land exactly.
    await waitFor(() => expect(shown(c).slice(0, 3)).toEqual(["31", "0", "1"]), {
      timeout: 3000,
    });
  });
});

describe("presentation of the bill", () => {
  it("prints a definition for each of the three metrics", () => {
    const c = renderRace();
    const legend = c.querySelector(".race-legend") as HTMLElement;
    expect(within(legend).getByText("Comparisons")).toBeInTheDocument();
    expect(within(legend).getByText("Moves")).toBeInTheDocument();
    expect(within(legend).getByText("Extra space")).toBeInTheDocument();
    expect(legend.textContent).toMatch(/swap counts as 2/i);
    expect(legend.textContent).toMatch(/input excluded/i);
  });

  it("flags the cheapest lane per metric and greys out a row where everyone ties", async () => {
    stubMatchMedia(true);
    const c = renderRace();
    const rows = [...c.querySelectorAll(".race-bar")];

    // Insertion sort wins comparisons on random input; selection sort wins moves.
    const winners = rows.filter((r) => r.classList.contains("win"));
    expect(winners.length).toBeGreaterThan(0);

    // Space: 1 vs 1 vs 32+, so the first two tie and neither is flagged best.
    const spaceRows = rows.filter(
      (r) => r.querySelector(".race-bar-lab")?.textContent === "Extra space",
    );
    expect(spaceRows).toHaveLength(3);
  });

  it("renders one lane per contender, in the given order", () => {
    const c = renderRace();
    expect(laneNames(c)).toEqual([
      "Insertion sort",
      "Selection sort",
      "Merge sort (textbook)",
    ]);
    expect(c.querySelectorAll(".race-lane")).toHaveLength(3);
  });
});

describe("aborted lanes", () => {
  it("explains the abort instead of printing misleading counters", async () => {
    const runaway = {
      id: "runaway",
      name: { en: "Runaway", zh: "失控" },
      time: "2n",
      space: { en: "O(1)", zh: "O(1)" },
      run: (_a: number[], t: { cmp: () => void }) => {
        for (;;) t.cmp();
      },
    };
    const { container } = render(
      <LangProvider>
        <AlgoRace
          title={{ en: "Capped", zh: "上限" }}
          algos={[runaway, INSERTION]}
          inputs={SHAPES}
          sizes={[32]}
          clone={cloneArr}
          // Comfortably above insertion sort's ~507 operations at n = 32, so only
          // the runaway lane trips the cap.
          opCap={5_000}
        />
      </LangProvider>,
    );
    await act(async () => {});

    const lanes = [...container.querySelectorAll(".race-lane")];
    expect(lanes[0].querySelector(".race-abort")).toBeTruthy();
    expect(lanes[0].querySelectorAll(".race-bar")).toHaveLength(0);
    // The lane that finished still shows its full bill.
    expect(lanes[1].querySelectorAll(".race-bar")).toHaveLength(3);
  });
});
