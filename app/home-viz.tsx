"use client";

// 序章专属可视化:
//  - HeroDecision:hero 右侧的自动播放动画 —— 一棵决策树被逐步探索,
//    死路变灰回退、正确路径亮绿,一眼看懂「算法 = 一串看得见的决策」。
//    节点/边直接复用 globals.css 的 .tp-node / .tp-edge 状态样式。
//  - RecursionLab:递归调用栈实验室 —— 逐帧看 factorial(3) 的栈帧
//    怎么压进去、又怎么带着返回值弹出来。递归是全书的地基。

import { useEffect, useState } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

/* ---------------- HeroDecision ---------------- */

type NState = "idle" | "cur" | "path" | "dead" | "sol";

interface HNode {
  id: string;
  x: number;
  y: number;
  label: string;
  parent?: string;
}

const H_NODES: HNode[] = [
  { id: "r", x: 190, y: 26, label: "?" },
  { id: "a", x: 95, y: 96, label: "A", parent: "r" },
  { id: "b", x: 285, y: 96, label: "B", parent: "r" },
  { id: "a1", x: 48, y: 168, label: "✗", parent: "a" },
  { id: "a2", x: 142, y: 168, label: "✗", parent: "a" },
  { id: "b1", x: 238, y: 168, label: "✓", parent: "b" },
  { id: "b2", x: 332, y: 168, label: "…", parent: "b" },
];

// 每帧:各节点状态(未列出 = idle)
const H_FRAMES: Record<string, NState>[] = [
  { r: "cur" },
  { r: "path", a: "cur" },
  { r: "path", a: "path", a1: "cur" },
  { r: "path", a: "path", a1: "dead" },
  { r: "path", a: "path", a1: "dead", a2: "cur" },
  { r: "path", a: "path", a1: "dead", a2: "dead" },
  { r: "path", a: "dead", a1: "dead", a2: "dead" },
  { r: "path", a: "dead", a1: "dead", a2: "dead", b: "cur" },
  { r: "path", a: "dead", a1: "dead", a2: "dead", b: "path", b1: "cur" },
  { r: "sol", a: "dead", a1: "dead", a2: "dead", b: "sol", b1: "sol" },
  { r: "sol", a: "dead", a1: "dead", a2: "dead", b: "sol", b1: "sol" },
];

export function HeroDecision() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 950);
    return () => clearInterval(t);
  }, []);

  const f = H_FRAMES[tick % H_FRAMES.length];

  return (
    <div className="hm-wrap">
      <svg className="hm-svg" viewBox="0 0 380 200" role="img" aria-label="决策树探索动画">
        {H_NODES.map((n) => {
          if (!n.parent) return null;
          const p = H_NODES.find((x) => x.id === n.parent)!;
          return (
            <line
              key={`e${n.id}`}
              className="tp-edge"
              data-state={f[n.id] ?? "idle"}
              x1={p.x}
              y1={p.y + 16}
              x2={n.x}
              y2={n.y - 16}
            />
          );
        })}
        {H_NODES.map((n) => (
          <g key={n.id} className="tp-node" data-state={f[n.id] ?? "idle"}>
            <rect x={n.x - 23} y={n.y - 16} width={46} height={32} rx={9} />
            <text x={n.x} y={n.y + 4.5} textAnchor="middle">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="hm-caption">
        <span className="hm-caption-zh">算法 = 一串看得见的决策</span>
        <span className="hm-caption-en">VISIBLE DECISIONS</span>
      </div>
    </div>
  );
}

/* ---------------- RecursionLab ---------------- */

interface StackFrameBox {
  name: string;
  note: string;
  state?: "cur" | "wait" | "ret";
}

interface RecFrame {
  stack: StackFrameBox[];
  msg: React.ReactNode;
}

const REC_FRAMES: RecFrame[] = [
  {
    stack: [{ name: "fact(3)", note: "要算 3 × fact(2),先等它", state: "cur" }],
    msg: (
      <>
        调用 <b>fact(3)</b>:内存里压入一个栈帧,记着「我是谁、算到哪了」。
        它需要 fact(2) 的答案才能继续。
      </>
    ),
  },
  {
    stack: [
      { name: "fact(3)", note: "等 fact(2)…", state: "wait" },
      { name: "fact(2)", note: "要算 2 × fact(1),先等它", state: "cur" },
    ],
    msg: (
      <>
        <b>fact(2)</b> 压栈。注意:fact(3) 没有消失,它在下面「挂起等待」——
        这就是递归会占内存的原因。
      </>
    ),
  },
  {
    stack: [
      { name: "fact(3)", note: "等 fact(2)…", state: "wait" },
      { name: "fact(2)", note: "等 fact(1)…", state: "wait" },
      { name: "fact(1)", note: "基准情形!直接返回 1", state: "cur" },
    ],
    msg: (
      <>
        <b>fact(1)</b> 命中<b>基准情形(base case)</b>:不再往下递,直接知道答案是 1。
        没有基准情形的递归 = 无限压栈 = 栈溢出。
      </>
    ),
  },
  {
    stack: [
      { name: "fact(3)", note: "等 fact(2)…", state: "wait" },
      { name: "fact(2)", note: "拿到 1 → 算出 2×1 = 2", state: "ret" },
    ],
    msg: (
      <>
        fact(1) 带着返回值 <b>1</b> 弹出栈。fact(2) 被唤醒:2 × 1 = <b>2</b>,
        轮到它带着答案退场。
      </>
    ),
  },
  {
    stack: [{ name: "fact(3)", note: "拿到 2 → 算出 3×2 = 6", state: "ret" }],
    msg: (
      <>
        fact(2) 弹出,返回 <b>2</b>。fact(3) 被唤醒:3 × 2 = <b>6</b>。
      </>
    ),
  },
  {
    stack: [],
    msg: (
      <>
        栈清空,最终答案 <b>6</b>。递归的本质:<b>去的时候拆问题(压栈),
        回的时候拼答案(弹栈)</b>。后面每一章 —— 分治、回溯、DP —— 都建在这上面。
      </>
    ),
  },
];

export function RecursionLab() {
  const stepper = useStepper(REC_FRAMES.length, 1600);
  const f = REC_FRAMES[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">递归调用栈实验室 —— fact(3) 的一生</div>
      <div className="viz-stage" style={{ alignItems: "flex-end", minHeight: 190 }}>
        <div className="rec-stack">
          <div className="rec-floor">调用栈(先进后出,向上生长)</div>
          {f.stack.length === 0 && <div className="rec-empty">(空)—— 计算完成,答案 6 已交还给调用者</div>}
          {f.stack.map((s, i) => (
            <div key={s.name} className="rec-frame" data-state={s.state} style={{ zIndex: i + 1 }}>
              <span className="rec-name">{s.name}</span>
              <span className="rec-note">{s.note}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={REC_FRAMES.length} />
    </div>
  );
}
