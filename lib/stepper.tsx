"use client";

// 通用「逐帧播放器」—— 算法慢动作的骨架。
// ArrayStepper:一排单元格 + 指针标签 + 旁白,适合数组/字符串/栈/队列/
// 双指针/滑动窗口类演示。每一帧是一张完整快照,组件负责播放控制
// (上一步/下一步/自动播放/进度),帧数据由各章自己写。
// 树/图等自由形态的动画请在章节内自建组件,但控制条样式(.viz-ctl)通用。

import { useEffect, useRef, useState, type ReactNode } from "react";

// 让横向可滚动的舞台在「还能滑」的那一侧淡出边缘 —— 内容到边缘不是被切,
// 而是柔和地渐隐成「→ 还有更多」的暗示。仅在真正溢出时出现,滚到头自动消失。
// 返回 ref 挂到 .viz-stage,data 值挂到同一元素的 data-fade 上。
export function useEdgeFade<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [fade, setFade] = useState<"none" | "left" | "right" | "both">("none");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 2) return setFade("none"); // 放得下 → 不渐隐(顺带清掉 resize 后的残留)
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
  /** 指针标签,渲染在单元格上方,如 { i: 2, label: "slow" } */
  ptrs?: { i: number; label: string }[];
  /** 本帧旁白 */
  msg: ReactNode;
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
      // 暂停时绝不跳帧。只有「当前已停止 + 停在末帧」时按下按钮才是「重播」,回到第 0 帧。
      // (旧写法无条件先 setStep(0),导致在最后一帧上点「暂停」会把进度弹回开头。)
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
  return (
    <div className="viz-ctl">
      <button
        type="button"
        className="btn btn-sm"
        onClick={stepper.prev}
        disabled={step === 0}
      >
        ← 上一步
      </button>
      <button type="button" className="btn btn-sm btn-primary" onClick={stepper.toggle}>
        {stepper.playing ? "⏸ 暂停" : step >= total - 1 ? "↻ 重播" : "▶ 自动播放"}
      </button>
      <button
        type="button"
        className="btn btn-sm"
        onClick={stepper.next}
        disabled={step >= total - 1}
      >
        下一步 →
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
  title: string;
  frames: ArrayFrame[];
  /** 单元格宽度(含间隙),用于指针定位 */
  cellW?: number;
}) {
  const stepper = useStepper(frames.length);
  const f = frames[stepper.step];
  const n = Math.max(...frames.map((fr) => fr.cells.length));
  const edge = useEdgeFade<HTMLDivElement>();

  return (
    <div className="viz">
      <div className="viz-title">{title}</div>
      <div
        ref={edge.ref}
        data-fade={edge.fade}
        className="viz-stage"
        style={{
          flexDirection: "column",
          gap: 6,
          overflowX: "auto",
          // safe center:窄屏数组超宽时靠左可滚,不把左侧格子推进够不着的负区
          alignItems: "safe center",
        }}
      >
        {/* 指针行 */}
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
                {here.map((p) => (
                  <span key={p.label} className="ptr">
                    {p.label}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
        {/* 单元格行 */}
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
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </div>
  );
}
