// The problem list keeps its two controls apart: the completion checkbox and the button that
// expands a problem. These tests drive both with the keyboard, since the checkbox used to sit
// inside a clickable row that took over its Enter and Space presses.

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangProvider } from "@/lib/i18n";
import { ProgressProvider } from "@/lib/progress";
import { ProblemSet, type Problem } from "@/lib/problems";

const ITEMS: Problem[] = [
  {
    lc: 509,
    title: "Fibonacci Number",
    d: "easy",
    tags: ["Memoization"],
    hint: "Write the recurrence first.",
    key: "Keep the last two values.",
  },
  {
    lc: 70,
    title: "Climbing Stairs",
    d: "easy",
    tags: ["1-D DP"],
    hint: "Where can the last step come from?",
    key: "f(n) = f(n-1) + f(n-2).",
  },
];

const stored = () => JSON.parse(window.localStorage.getItem("aa-progress-v1") ?? "null");

const checkbox = (lc: number) => screen.getByRole("checkbox", { name: `Mark LC ${lc} as done` });
const titleButton = (lc: number) =>
  screen.getByRole("button", { name: new RegExp(`^LC ${lc} \\S`) });

function renderList() {
  return render(
    <LangProvider>
      <ProgressProvider>
        <ProblemSet ch="dp" items={ITEMS} />
      </ProgressProvider>
    </LangProvider>,
  );
}

beforeEach(() => window.localStorage.clear());

describe("problem list", () => {
  it("records a problem as done with Space on its checkbox, without expanding it", async () => {
    const user = userEvent.setup();
    renderList();
    checkbox(509).focus();
    await user.keyboard(" ");

    expect(checkbox(509)).toHaveAttribute("aria-checked", "true");
    expect(stored().problems).toEqual({ "dp/509": 1 });
    expect(titleButton(509)).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Keep the last two values.")).toBeNull();
  });

  it("toggles with Enter as well, and a second press clears it", async () => {
    const user = userEvent.setup();
    renderList();
    checkbox(70).focus();

    await user.keyboard("{Enter}");
    expect(stored().problems).toEqual({ "dp/70": 1 });
    await user.keyboard("{Enter}");
    expect(checkbox(70)).toHaveAttribute("aria-checked", "false");
    expect(stored().problems).toEqual({});
  });

  it("expands and collapses from the title button, leaving progress alone", async () => {
    const user = userEvent.setup();
    renderList();
    titleButton(509).focus();

    await user.keyboard("{Enter}");
    expect(titleButton(509)).toHaveAttribute("aria-expanded", "true");
    const body = screen.getByText("Keep the last two values.").closest(".prob-body");
    expect(titleButton(509)).toHaveAttribute("aria-controls", body?.id);

    await user.keyboard("{Enter}");
    expect(titleButton(509)).toHaveAttribute("aria-expanded", "false");
    expect(stored()).toBeNull();
  });

  it("offers the checkbox and the title as two tab stops per problem", async () => {
    const user = userEvent.setup();
    renderList();
    await user.tab();
    expect(checkbox(509)).toHaveFocus();
    await user.tab();
    expect(titleButton(509)).toHaveFocus();
    await user.tab();
    expect(checkbox(70)).toHaveFocus();
  });

  it("does not nest one control inside another", () => {
    const { container } = renderList();
    expect(container.querySelector("[role='button'] button, button button")).toBeNull();
  });
});
