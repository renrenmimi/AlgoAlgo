"use client";

// 序章专属可视化:
//  - HeroDecision:hero 右侧的自动播放动画 —— 一棵决策树被逐步探索,
//    死路变灰回退、正确路径亮绿,一眼看懂「算法 = 一串看得见的决策」。
//    节点/边直接复用 globals.css 的 .tp-node / .tp-edge 状态样式。
//  - RecursionLab:递归调用栈实验室 —— 逐帧看 factorial(3) 的栈帧
//    怎么压进去、又怎么带着返回值弹出来。递归是全书的地基。
//
// 界面双语:所有可见文案走 <T en zh />;节点标签是符号,两种语言共用。

import { useEffect, useState } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { T, useL } from "@/lib/i18n";

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

// 每帧:各节点状态(未列出 = idle)。
// 【首帧刻意做「富状态」】:根节点已点亮(cur)、两条主干已在候选路径上(path),
// 一进首屏右侧就是「有内容、好看」的画面,而不是等动画跑几秒才浮现。
// 之后逐帧展开探索:进 A 撞两次死路 → 回退 → 进 B 命中解;末帧短暂定格庆祝后循环。
const H_FRAMES: Record<string, NState>[] = [
  { r: "cur", a: "path", b: "path" }, // 首帧:根点亮 + 主干候选,一进来就满
  { r: "path", a: "cur", b: "path" }, // 决定先探 A 分支
  { r: "path", a: "path", a1: "cur", b: "path" }, // 试 a1
  { r: "path", a: "path", a1: "dead", a2: "cur", b: "path" }, // a1 死路 → 试 a2
  { r: "path", a: "dead", a1: "dead", a2: "dead", b: "path" }, // A 整枝无解 → 回退
  { r: "path", a: "dead", a1: "dead", a2: "dead", b: "cur" }, // 转而探 B 分支
  { r: "path", a: "dead", a1: "dead", a2: "dead", b: "path", b1: "cur" }, // 试 b1
  { r: "sol", a: "dead", a1: "dead", a2: "dead", b: "sol", b1: "sol" }, // 命中!解路径亮绿
  { r: "sol", a: "dead", a1: "dead", a2: "dead", b: "sol", b1: "sol" }, // 定格一拍再循环
];

export function HeroDecision() {
  const L = useL();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // 尊重「减弱动态」:直接停在首帧 —— 它已被设计成「富状态」,静态也好看。
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const f = H_FRAMES[tick % H_FRAMES.length];

  return (
    <div className="hm-wrap">
      <svg
        className="hm-svg"
        viewBox="0 0 380 200"
        role="img"
        aria-label={L({
          en: "Animation of a decision tree being explored: dead ends turn grey, the path to a solution turns green",
          zh: "决策树探索动画:死路变灰,通向解的路径变绿",
        })}
      >
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
        <span className="hm-caption-zh">
          <T
            en={<>An algorithm is a sequence of decisions</>}
            zh={<>算法 = 一串看得见的决策</>}
          />
        </span>
        {/* 英文模式下主文案已经是英文,不再重复一行全大写英文 */}
        <T en={null} zh={<span className="hm-caption-en">VISIBLE DECISIONS</span>} />
      </div>
    </div>
  );
}

/* ---------------- RecursionLab ---------------- */

interface StackFrameBox {
  name: string;
  note: React.ReactNode;
  state?: "cur" | "wait" | "ret";
}

interface RecFrame {
  stack: StackFrameBox[];
  msg: React.ReactNode;
}

const REC_FRAMES: RecFrame[] = [
  {
    stack: [
      {
        name: "fact(3)",
        note: <T en="needs 3 × fact(2)" zh="要算 3 × fact(2),先等它" />,
        state: "cur",
      },
    ],
    msg: (
      <>
        <T
          en={
            <>
              Call <b>fact(3)</b>. The program pushes a stack frame that records
              which call this is and where it stopped. It cannot finish until
              fact(2) returns an answer.
            </>
          }
          zh={
            <>
              调用 <b>fact(3)</b>:内存里压入一个栈帧,记着「我是谁、算到哪了」。
              它需要 fact(2) 的答案才能继续。
            </>
          }
        />
      </>
    ),
  },
  {
    stack: [
      {
        name: "fact(3)",
        note: <T en="waiting for fact(2)…" zh="等 fact(2)…" />,
        state: "wait",
      },
      {
        name: "fact(2)",
        note: <T en="needs 2 × fact(1)" zh="要算 2 × fact(1),先等它" />,
        state: "cur",
      },
    ],
    msg: (
      <>
        <T
          en={
            <>
              <b>fact(2)</b> is pushed. fact(3) has not gone away. It sits below,
              suspended, holding its own local values. That is why deep recursion
              uses a lot of memory.
            </>
          }
          zh={
            <>
              <b>fact(2)</b> 压栈。注意:fact(3) 没有消失,它在下面挂起等待,
              自己的局部变量还占着地方 —— 这就是深递归费内存的原因。
            </>
          }
        />
      </>
    ),
  },
  {
    stack: [
      {
        name: "fact(3)",
        note: <T en="waiting for fact(2)…" zh="等 fact(2)…" />,
        state: "wait",
      },
      {
        name: "fact(2)",
        note: <T en="waiting for fact(1)…" zh="等 fact(1)…" />,
        state: "wait",
      },
      {
        name: "fact(1)",
        note: <T en="base case: returns 1" zh="基准情形:直接返回 1" />,
        state: "cur",
      },
    ],
    msg: (
      <>
        <T
          en={
            <>
              <b>fact(1)</b> reaches the <b>base case</b>: the smallest input
              whose answer is known without another call. It returns 1. A
              recursion with no base case keeps pushing frames until the stack
              runs out of space.
            </>
          }
          zh={
            <>
              <b>fact(1)</b> 命中<b>基准情形(base case)</b>:
              最小的那个输入,不用再往下调用就知道答案是 1。
              没有基准情形,栈帧会一直压下去,直到栈空间耗尽。
            </>
          }
        />
      </>
    ),
  },
  {
    stack: [
      {
        name: "fact(3)",
        note: <T en="waiting for fact(2)…" zh="等 fact(2)…" />,
        state: "wait",
      },
      {
        name: "fact(2)",
        note: <T en="got 1 → 2 × 1 = 2" zh="拿到 1 → 算出 2 × 1 = 2" />,
        state: "ret",
      },
    ],
    msg: (
      <>
        <T
          en={
            <>
              fact(1) returns <b>1</b> and its frame is popped. fact(2) resumes
              where it stopped: 2 × 1 = <b>2</b>. Now it is fact(2)&apos;s turn to
              return.
            </>
          }
          zh={
            <>
              fact(1) 带着返回值 <b>1</b> 弹出栈。fact(2) 从中断处继续:
              2 × 1 = <b>2</b>,轮到它带着答案退场。
            </>
          }
        />
      </>
    ),
  },
  {
    stack: [
      {
        name: "fact(3)",
        note: <T en="got 2 → 3 × 2 = 6" zh="拿到 2 → 算出 3 × 2 = 6" />,
        state: "ret",
      },
    ],
    msg: (
      <>
        <T
          en={
            <>
              fact(2) is popped and returns <b>2</b>. fact(3) resumes: 3 × 2 ={" "}
              <b>6</b>.
            </>
          }
          zh={
            <>
              fact(2) 弹出,返回 <b>2</b>。fact(3) 从中断处继续:3 × 2 = <b>6</b>。
            </>
          }
        />
      </>
    ),
  },
  {
    stack: [],
    msg: (
      <>
        <T
          en={
            <>
              The stack is empty and the final answer is <b>6</b>. Recursion does
              two things: <b>on the way down it splits the problem into smaller
              copies (push), and on the way back up it combines their answers
              (pop)</b>. Divide and conquer, backtracking, and dynamic programming
              are all built on this.
            </>
          }
          zh={
            <>
              栈清空,最终答案 <b>6</b>。递归就做两件事:
              <b>去的时候把问题拆成同款小问题(压栈),回的时候把答案拼起来(弹栈)</b>。
              分治、回溯、DP 都建在这上面。
            </>
          }
        />
      </>
    ),
  },
];

export function RecursionLab() {
  const stepper = useStepper(REC_FRAMES.length, 1600);
  const f = REC_FRAMES[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Recursion lab: the life of fact(3)"
          zh="递归调用栈实验室 —— fact(3) 的一生"
        />
      </div>
      <div className="viz-stage" style={{ alignItems: "flex-end", minHeight: 190 }}>
        <div className="rec-stack">
          <div className="rec-floor">
            <T
              en="Call stack (last in, first out; grows upward)"
              zh="调用栈(后进先出,向上生长)"
            />
          </div>
          {f.stack.length === 0 && (
            <div className="rec-empty">
              <T
                en="(empty) — the computation is finished and 6 has been returned to the caller"
                zh="(空)—— 计算完成,答案 6 已交还给调用者"
              />
            </div>
          )}
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
