// The home page's decision tree advances only while it can be seen and has not been paused,
// and readers who prefer reduced motion start paused (WCAG 2.2.2).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { HeroDecision } from "@/app/home-viz";
import { LangProvider } from "@/lib/i18n";
import { stubMatchMedia } from "./setup";

let report: (visible: boolean) => void = () => {};

class FakeIntersectionObserver {
  constructor(cb: IntersectionObserverCallback) {
    report = (visible) =>
      cb([{ isIntersecting: visible } as IntersectionObserverEntry], this as never);
  }
  observe() {}
  disconnect() {}
}

/** The state of node "a" (branch A): it changes on every one of the first frames. */
const frameOf = () =>
  [...document.querySelectorAll(".tp-node")].map((n) => n.getAttribute("data-state")).join(",");

function renderTree() {
  render(
    <LangProvider>
      <HeroDecision />
    </LangProvider>,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  stubMatchMedia(false);
});

describe("HeroDecision", () => {
  it("advances every second while it is on screen", () => {
    renderTree();
    act(() => report(true));
    const first = frameOf();
    act(() => vi.advanceTimersByTime(1000));
    expect(frameOf()).not.toBe(first);
  });

  it("stops while it is off screen", () => {
    renderTree();
    const first = frameOf();
    act(() => report(false));
    act(() => vi.advanceTimersByTime(5000));
    expect(frameOf()).toBe(first);
    act(() => report(true));
    act(() => vi.advanceTimersByTime(1000));
    expect(frameOf()).not.toBe(first);
  });

  it("can be paused and resumed by the reader", () => {
    renderTree();
    act(() => report(true));
    fireEvent.click(screen.getByRole("button", { name: "Pause the decision-tree animation" }));
    const held = frameOf();
    act(() => vi.advanceTimersByTime(5000));
    expect(frameOf()).toBe(held);
    fireEvent.click(screen.getByRole("button", { name: "Play the decision-tree animation" }));
    act(() => vi.advanceTimersByTime(1000));
    expect(frameOf()).not.toBe(held);
  });

  it("starts paused for readers who prefer reduced motion", () => {
    stubMatchMedia(true);
    renderTree();
    act(() => report(true));
    expect(
      screen.getByRole("button", { name: "Play the decision-tree animation" }),
    ).toBeInTheDocument();
    const first = frameOf();
    act(() => vi.advanceTimersByTime(5000));
    expect(frameOf()).toBe(first);
  });
});
