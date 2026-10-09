// How the race marks results: the lowest value on a partial tie, a reroll that cannot change
// any count, the pressed state of the controls, and a roll-up that is interrupted.

import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlgoRace, type RaceAlgo, type RaceInput } from "@/lib/race";
import { LangProvider } from "@/lib/i18n";
import { stubMatchMedia } from "./setup";

/** A contender that books a fixed number of comparisons per input element. */
const fixed = (id: string, perItem: number): RaceAlgo<number[]> => ({
  id,
  name: id,
  time: "O(n)",
  space: "O(1)",
  run: (input, t) => {
    for (let i = 0; i < input.length; i++) t.cmp(perItem);
  },
});

const ALGOS = [fixed("twice-a", 2), fixed("twice-b", 2), fixed("thrice", 3)];

const SHUFFLED: RaceInput<number[]> = {
  id: "shuffled",
  label: "Shuffled",
  make: (n, seed) => Array.from({ length: n }, (_, i) => (i * 7 + seed) % n),
};
const LADDER: RaceInput<number[]> = {
  id: "ladder",
  label: "Ladder",
  make: (n, seed) => Array.from({ length: n }, (_, i) => seed + 2 * i),
  seedless: "Only the position matters here.",
};

function renderRace(inputs: RaceInput<number[]>[] = [SHUFFLED, LADDER]) {
  return render(
    <LangProvider>
      <AlgoRace
        title="Test race"
        algos={ALGOS}
        inputs={inputs}
        sizes={[4, 8]}
        defaultSize={8}
        clone={(a) => [...a]}
      />
    </LangProvider>,
  ).container;
}

/** The flag text of one metric row ("Comparisons" is the first row) in every lane. */
const flags = (c: HTMLElement, row = 0) =>
  [...c.querySelectorAll(".race-bars")].map(
    (bars) => bars.querySelectorAll(".race-bar-flag")[row]?.textContent ?? "",
  );

describe("marking results", () => {
  it("marks every contender that shares the lowest value on a partial tie", () => {
    stubMatchMedia(true);
    const c = renderRace();
    // 16, 16 and 24 comparisons: the two lowest are both marked, the third is not
    expect(flags(c)).toEqual(["best", "best", ""]);
  });

  it("still shows a neutral tie when every contender scores the same", () => {
    stubMatchMedia(true);
    const c = renderRace();
    // Nobody moves anything: all three tie on moves
    expect(flags(c, 1)).toEqual(["tied", "tied", "tied"]);
  });
});

describe("the reroll button", () => {
  it("is enabled when the seed changes the input", () => {
    renderRace();
    expect(screen.getByRole("button", { name: /Reroll/ })).toBeEnabled();
  });

  it("is disabled, with the shape's reason, when no count can change", async () => {
    const user = userEvent.setup();
    renderRace();
    await user.click(screen.getByRole("button", { name: "Ladder" }));
    const reroll = screen.getByRole("button", { name: /Reroll/ });
    expect(reroll).toBeDisabled();
    expect(reroll).toHaveAttribute("title", "Only the position matters here.");
  });
});

describe("the controls", () => {
  it("expose which shape and size are selected", async () => {
    const user = userEvent.setup();
    renderRace();
    expect(screen.getByRole("button", { name: "Shuffled" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "8" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "4" }));
    expect(screen.getByRole("button", { name: "4" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "8" })).toHaveAttribute("aria-pressed", "false");
  });
});

describe("an interrupted roll-up", () => {
  it("continues from the number on screen instead of jumping back to the old target", async () => {
    stubMatchMedia(false);
    // Drive requestAnimationFrame by hand: each call to step() advances the clock and runs
    // the queued frames
    let now = 0;
    let queue: FrameRequestCallback[] = [];
    const realRaf = window.requestAnimationFrame;
    const realNow = performance.now.bind(performance);
    window.requestAnimationFrame = (cb) => {
      queue.push(cb);
      return queue.length;
    };
    performance.now = () => now;
    const step = (ms: number) =>
      act(() => {
        now += ms;
        const q = queue;
        queue = [];
        q.forEach((cb) => cb(now));
      });

    try {
      const user = userEvent.setup();
      const c = renderRace();
      const first = () =>
        Number(c.querySelector(".race-bar-val")?.textContent?.replace(/,/g, "") ?? NaN);
      expect(first()).toBe(16);

      await user.click(screen.getByRole("button", { name: "4" })); // target 8
      step(100);
      const midway = first();
      expect(midway).toBeLessThan(16);
      expect(midway).toBeGreaterThan(8);

      await user.click(screen.getByRole("button", { name: "8" })); // back to 16
      step(16);
      // The next frame starts near the value that was on screen, not near 8 or 16
      expect(Math.abs(first() - midway)).toBeLessThanOrEqual(1);
      step(1000);
      expect(first()).toBe(16);
    } finally {
      window.requestAnimationFrame = realRaf;
      performance.now = realNow;
    }
  });
});
