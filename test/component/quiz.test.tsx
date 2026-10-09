// The quiz component: lenient matching for answers typed with a Chinese IME, and the
// keyboard / screen-reader behaviour of the three question types.

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangProvider } from "@/lib/i18n";
import { ProgressProvider } from "@/lib/progress";
import { Quiz, answerMatches, displayAnswer, type QuizItem } from "@/lib/quiz";

describe("answer matching", () => {
  it.each([
    ["O（n）", ["O(n)"]],
    ["Ｏ(ｎ log ｎ)", ["O(n log n)"]],
    ["0。75", ["0.75"]],
    ["3、4", ["0.75", "3/4"]],
    ["1，2，3", ["1,2,3"]],
    ["1、2、3", ["1,2,3"]],
    ["n&（n-1）", ["n&(n-1)"]],
    ["  Top Down ", ["top down"]],
  ])("accepts %s", (typed, answers) => {
    expect(answerMatches(typed, answers)).toBe(true);
  });

  it.each([
    ["O(n2)", ["O(n)"]],
    ["", ["O(n)"]],
    ["0.7", ["0.75"]],
  ])("rejects %j", (typed, answers) => {
    expect(answerMatches(typed, answers)).toBe(false);
  });

  it("shows the accepted answer written in the reader's language", () => {
    const answers = ["记忆化", "memoization", "memo"];
    expect(displayAnswer(answers, "zh")).toBe("记忆化");
    expect(displayAnswer(answers, "en")).toBe("memoization");
    expect(displayAnswer(["2024"], "zh")).toBe("2024");
  });
});

const ITEMS: QuizItem[] = [
  {
    type: "choice",
    q: "Pick B.",
    opts: ["A", "B", "C"],
    correct: 1,
    wrong: ["A is wrong.", undefined, "C is wrong."],
    why: "B is right.",
  },
  {
    type: "multi",
    q: "Pick A and C.",
    opts: ["A", "B", "C"],
    correct: [0, 2],
    missHint: "You missed one.",
    extraHint: "One is extra.",
    why: "A and C.",
  },
  {
    type: "fill",
    q: "What is caching subproblem results called?",
    answers: ["记忆化", "memoization", "memo"],
    hint: "It starts with memo.",
    why: "Memoization stores each subproblem's answer the first time it is computed.",
  },
];

function renderQuiz() {
  return render(
    <LangProvider>
      <ProgressProvider>
        <Quiz ch="dp" items={ITEMS} />
      </ProgressProvider>
    </LangProvider>,
  );
}

const fillInput = () => screen.getByRole("textbox", { name: "Answer to question 3" });

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  delete document.documentElement.dataset.lang;
});

describe("quiz interaction", () => {
  it("keeps focus on the picked option and announces the verdict", async () => {
    const user = userEvent.setup();
    renderQuiz();
    const first = document.querySelectorAll<HTMLElement>(".q-item")[0];
    const wrong = within(first).getByRole("button", { name: /^A\s*A$/ });
    await user.click(wrong);

    expect(wrong).toHaveFocus();
    expect(wrong).toHaveAttribute("aria-disabled", "true");
    const feedback = screen.getByText(/A is wrong\./).closest(".q-feedback");
    expect(feedback?.parentElement).toHaveAttribute("aria-live", "polite");
  });

  it("does not let an answered question be answered again", async () => {
    const user = userEvent.setup();
    renderQuiz();
    const first = document.querySelectorAll<HTMLElement>(".q-item")[0];
    await user.click(within(first).getByRole("button", { name: /^A\s*A$/ }));
    await user.click(within(first).getByRole("button", { name: /^B\s*B$/ }));
    expect(document.querySelector(".q-feedback.ok")).toBeNull();
    expect(screen.getByText(/A is wrong\./)).toBeInTheDocument();
  });

  it("exposes multi-select picks as pressed buttons and keeps the check button", async () => {
    const user = userEvent.setup();
    renderQuiz();
    const group = screen.getByRole("group", { name: "Select all that apply" });
    const [a, , c] = Array.from(group.querySelectorAll("button"));
    expect(a).toHaveAttribute("aria-pressed", "false");
    await user.click(a);
    await user.click(c);
    expect(a).toHaveAttribute("aria-pressed", "true");

    const check = screen.getByRole("button", { name: "Check answer" });
    check.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText(/A and C\./, { selector: ".q-feedback.ok" })).toBeInTheDocument();
    expect(check).toHaveFocus();
    expect(check).toHaveAttribute("aria-disabled", "true");
  });

  it("labels the fill-in box and ignores the Enter that ends an IME composition", () => {
    renderQuiz();
    const input = fillInput();
    fireEvent.change(input, { target: { value: "ji yi" } });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(screen.queryByText(/Not quite/)).toBeNull();

    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText(/Not quite/)).toBeInTheDocument();
  });

  it("accepts an answer typed with full-width forms and keeps focus in the box", async () => {
    const user = userEvent.setup();
    renderQuiz();
    await user.type(fillInput(), "ｍｅｍｏｉｚａｔｉｏｎ{Enter}");
    expect(screen.getByText(/Memoization stores/)).toBeInTheDocument();
    // Solved: the box turns read-only instead of disabled, so focus stays
    expect(fillInput()).toHaveAttribute("readonly");
    expect(fillInput()).toHaveFocus();
  });

  it("reveals the accepted answer in English after three misses, with an English dash", async () => {
    const user = userEvent.setup();
    renderQuiz();
    for (let k = 0; k < 3; k++) {
      await user.clear(fillInput());
      await user.type(fillInput(), `wrong${k}{Enter}`);
    }
    expect(screen.getByText("memoization", { selector: "code" })).toBeInTheDocument();
    expect(document.querySelector(".q-feedback.no")?.textContent).not.toContain("——");
  });

  it("numbers questions and reveals the answer in Chinese for Chinese readers", async () => {
    // A Chinese reader: the stored choice, already applied to <html> by langScript
    window.localStorage.setItem("aa-lang", "zh");
    window.localStorage.setItem("algo-lang", "zh");
    document.documentElement.dataset.lang = "zh";
    const user = userEvent.setup();
    renderQuiz();
    expect(screen.getByText("第 1 题 / 共 3 题")).toBeInTheDocument();

    const input = screen.getByRole("textbox", { name: "第 3 题的答案" });
    for (let k = 0; k < 3; k++) {
      await user.clear(input);
      await user.type(input, `wrong${k}{Enter}`);
    }
    expect(screen.getByText("记忆化", { selector: "code" })).toBeInTheDocument();
  });

  it("shows the saved best score above the questions", () => {
    window.localStorage.setItem(
      "aa-progress-v1",
      JSON.stringify({ problems: {}, quiz: { dp: { right: 2, total: 3 } } }),
    );
    renderQuiz();
    expect(screen.getByText(/Your best score so far:/)).toHaveTextContent(
      "Your best score so far: 2/3.",
    );
  });

  it("reports the score once, when the last question is answered", async () => {
    const user = userEvent.setup();
    renderQuiz();
    const [q1] = Array.from(document.querySelectorAll<HTMLElement>(".q-item"));
    await user.click(within(q1).getByRole("button", { name: /^B\s*B$/ }));
    const group = screen.getByRole("group", { name: "Select all that apply" });
    const [a, , c] = Array.from(group.querySelectorAll("button"));
    await user.click(a);
    await user.click(c);
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(window.localStorage.getItem("aa-progress-v1")).toBeNull();

    await user.type(fillInput(), "memo{Enter}");
    const saved = JSON.parse(window.localStorage.getItem("aa-progress-v1") ?? "null");
    expect(saved.quiz.dp).toEqual({ right: 3, total: 3 });
  });
});
