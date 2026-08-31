"use client";

// The generic frame-by-frame player -- the skeleton behind every algorithm slow-motion.
// ArrayStepper: a row of cells + pointer labels + narration. Good for demos over arrays,
// strings, stacks, queues, two pointers and sliding windows. Each frame is a complete
// snapshot; the component owns playback control (prev / next / autoplay / progress) and each
// chapter writes its own frame data.
// For free-form animations such as trees and graphs, build a component inside the chapter --
// but the control-bar styling (.viz-ctl) is shared.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useL, type Loc } from "@/lib/i18n";

// Fades the edge of a horizontally scrollable stage on whichever side can still be scrolled --
// content at the edge should not look cut off, it should dissolve softly into a hint that
// there is more to see. The fade only appears when the stage actually overflows, and
// disappears once you scroll to the end.
// Attach the returned ref to .viz-stage and the data value to data-fade on the same element.
export function useEdgeFade<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [fade, setFade] = useState<"none" | "left" | "right" | "both">("none");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 2) return setFade("none"); // Fits: no fade (also clears leftovers after a resize)
      const canL = el.scrollLeft > 2;
      const canR = el.scrollLeft < maxScroll - 2;
      setFade(canL && canR ? "both" : canL ? "left" : canR ? "right" : "none");
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  return { ref, fade };
}

export interface ArrayCell {
  v: ReactNode;
  state?: "lit" | "ok" | "bad" | "ghost";
}

export interface ArrayFrame {
  cells: ArrayCell[];
  /** Pointer labels, rendered above the cells, e.g. { i: 2, label: "slow" } */
  ptrs?: { i: number; label: Loc<string> }[];
  /** Narration for this frame -- write JSX and use <T en zh /> inside it, or pass { en, zh } */
  msg: Loc<ReactNode>;
}

export function useStepper(total: number, intervalMs = 1100) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setStep((s) => {
        if (s >= total - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, intervalMs);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, total, intervalMs]);

  return {
    step,
    playing,
    prev: () => {
      setPlaying(false);
      setStep((s) => Math.max(0, s - 1));
    },
    next: () => {
      setPlaying(false);
      setStep((s) => Math.min(total - 1, s + 1));
    },
    toggle: () => {
      // Never jump frames when pausing. Only when playback is already stopped AND parked on
      // the last frame does pressing the button mean "replay", which returns to frame 0.
      // (The old code called setStep(0) unconditionally, so hitting "pause" on the last frame
      //  snapped the progress back to the beginning.)
      if (playing) {
        setPlaying(false);
        return;
      }
      if (step >= total - 1) setStep(0);
      setPlaying(true);
    },
    reset: () => {
      setPlaying(false);
      setStep(0);
    },
  };
}

export function StepControls({
  stepper,
  step,
  total,
}: {
  stepper: ReturnType<typeof useStepper>;
  step: number;
  total: number;
}) {
  const L = useL();
  return (
    <div className="viz-ctl">
      <button
        type="button"
        className="btn btn-sm"
        onClick={stepper.prev}
        disabled={step === 0}
      >
        {L({ en: "← Back", zh: "← 上一步" })}
      </button>
      <button type="button" className="btn btn-sm btn-primary" onClick={stepper.toggle}>
        {stepper.playing
          ? L({ en: "⏸ Pause", zh: "⏸ 暂停" })
          : step >= total - 1
            ? L({ en: "↻ Replay", zh: "↻ 重播" })
            : L({ en: "▶ Play", zh: "▶ 自动播放" })}
      </button>
      <button
        type="button"
        className="btn btn-sm"
        onClick={stepper.next}
        disabled={step >= total - 1}
      >
        {L({ en: "Next →", zh: "下一步 →" })}
      </button>
      <span
        className="mono dim"
        style={{ marginLeft: "auto", fontSize: 12 }}
        aria-live="polite"
      >
        {step + 1} / {total}
      </span>
    </div>
  );
}

export function ArrayStepper({
  title,
  frames,
  cellW = 56,
}: {
  title: Loc<ReactNode>;
  frames: ArrayFrame[];
  /** Cell width (including the gap); used to position the pointers */
  cellW?: number;
}) {
  const L = useL();
  const stepper = useStepper(frames.length);
  const f = frames[stepper.step];
  const n = Math.max(...frames.map((fr) => fr.cells.length));
  const edge = useEdgeFade<HTMLDivElement>();

  return (
    <div className="viz">
      <div className="viz-title">{L(title)}</div>
      <div
        ref={edge.ref}
        data-fade={edge.fade}
        className="viz-stage"
        style={{
          flexDirection: "column",
          gap: 6,
          overflowX: "auto",
          // safe center: on a narrow screen an over-wide array stays left-aligned and
          // scrollable, instead of pushing the leftmost cells into unreachable negative space
          alignItems: "safe center",
        }}
      >
        {/* Pointer row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${n}, ${cellW}px)`,
            gap: 4,
            minHeight: 30,
          }}
        >
          {Array.from({ length: n }).map((_, i) => {
            const here = (f.ptrs ?? []).filter((p) => p.i === i);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                {here.map((p, k) => (
                  <span key={k} className="ptr">
                    {L(p.label)}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
        {/* Cell row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${n}, ${cellW}px)`,
            gap: 4,
            paddingBottom: 26,
          }}
        >
          {Array.from({ length: n }).map((_, i) => {
            const c = f.cells[i];
            if (!c)
              return <div key={i} className="cell ghost" style={{ width: cellW - 4, height: cellW - 4, opacity: 0 }} />;
            return (
              <div
                key={i}
                className={`cell${c.state ? ` ${c.state}` : ""}`}
                style={{ width: cellW - 4, height: cellW - 4 }}
              >
                {c.v}
                <span className="cell-idx">{i}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {L(f.msg)}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </div>
  );
}
