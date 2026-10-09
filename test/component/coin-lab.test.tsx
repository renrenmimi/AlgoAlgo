import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangProvider } from "@/lib/i18n";
import { CoinGreedyLab } from "@/app/greedy/viz";

// The coin lab in chapter 06 (§07) asks the reader to find the fewest coins for 6
// with [1, 3, 4]. It must not print the answer before "Show best" is pressed, and the
// running count must read naturally for a single coin.

function renderLab() {
  const { container } = render(
    <LangProvider>
      <CoinGreedyLab />
    </LangProvider>,
  );
  const ctl = () => container.querySelector(".viz-ctl")?.textContent ?? "";
  const sum = () => container.querySelector(".grd-coin-sum")?.textContent?.replace(/\s+/g, " ").trim();
  const msg = () => container.querySelector(".viz-msg")?.textContent ?? "";
  return { ctl, sum, msg };
}

describe("coin greedy lab", () => {
  it("says 1 coin, not 1 coins", async () => {
    const user = userEvent.setup();
    const lab = renderLab();
    await user.click(screen.getByRole("button", { name: "+ 4" }));
    expect(lab.sum()).toBe("4 / 6 · 1 coin");
    await user.click(screen.getByRole("button", { name: "+ 1" }));
    expect(lab.sum()).toBe("5 / 6 · 2 coins");
  });

  it("keeps the best count hidden until Show best is pressed", async () => {
    const user = userEvent.setup();
    const lab = renderLab();
    expect(lab.ctl()).not.toMatch(/best 2/);
    expect(lab.ctl()).not.toMatch(/greedy 3/);

    await user.click(screen.getByRole("button", { name: "Show greedy" }));
    expect(lab.ctl()).toMatch(/greedy 3/);
    expect(lab.ctl()).not.toMatch(/best 2/);
    // Greedy reached 6 with three coins; the message hints, but does not tell.
    expect(lab.msg()).toMatch(/Fewer is possible/);
    expect(lab.msg()).not.toMatch(/3 \+ 3/);

    await user.click(screen.getByRole("button", { name: "Show best" }));
    expect(lab.ctl()).toMatch(/greedy 3 · best 2/);
    expect(lab.msg()).toMatch(/2 coins \(3 \+ 3\)/);
  });
});
