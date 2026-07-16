"use client";

// 第 3 章 · 二分进阶的三个专属可视化:
//  - GuessLab:猜数字实验室 —— 你想一个数,机器用二分来猜,亲手体会「砍半」有多快。
//  - BoundaryStepper:LC 34 找左右边界 —— lower_bound / upper_bound 逐帧,ArrayStepper。
//  - RotatedStepper:LC 33 旋转数组搜索 —— 每一步判断「哪半有序」,ArrayStepper 自建帧。
// 二分答案(875 吃香蕉)用的是共享库 lib/algviz 的 RangeShrink,帧数据写在 page.tsx。

import { useState } from "react";
import { ArrayStepper, type ArrayFrame, type ArrayCell } from "@/lib/stepper";

/* ============================================================
   GuessLab —— 猜数字实验室(交互:你出数,机器二分猜)
   ============================================================ */

const GUESS_LO = 1;
const GUESS_HI = 100;
// 100 个数,最多 ⌈log2(100)⌉ = 7 次一定能猜到。
const GUESS_MAX = 7;

export function GuessLab() {
  const [lo, setLo] = useState(GUESS_LO);
  const [hi, setHi] = useState(GUESS_HI);
  const [tries, setTries] = useState(0);
  const [status, setStatus] = useState<"play" | "won" | "err">("play");

  const guess = Math.floor(lo + (hi - lo) / 2);
  const remaining = hi - lo + 1;

  const tooHigh = () => {
    if (status !== "play") return;
    setTries((t) => t + 1);
    const nh = guess - 1;
    if (nh < lo) setStatus("err");
    else setHi(nh);
  };
  const tooLow = () => {
    if (status !== "play") return;
    setTries((t) => t + 1);
    const nl = guess + 1;
    if (nl > hi) setStatus("err");
    else setLo(nl);
  };
  const correct = () => {
    if (status !== "play") return;
    setTries((t) => t + 1);
    setStatus("won");
  };
  const reset = () => {
    setLo(GUESS_LO);
    setHi(GUESS_HI);
    setTries(0);
    setStatus("play");
  };

  return (
    <div className="viz">
      <div className="viz-title">
        猜数字实验室 —— 心里想一个 1~100 的数,别说出来,让机器来猜
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 6 }}>
        {status === "won" ? (
          <div className="bin-guess-big" style={{ color: "var(--ok)" }}>🎯 {guess}</div>
        ) : status === "err" ? (
          <div className="bin-guess-big" style={{ fontSize: 30 }}>🤔 咦?</div>
        ) : (
          <div className="bin-guess-big">{guess}</div>
        )}
        <div className="bin-guess-sub">
          {status === "won" ? (
            <>
              <b>{tries}</b> 次搞定!100 个数,理论上限是 <b>{GUESS_MAX}</b> 次 —— 每问一次就砍掉一半。
            </>
          ) : status === "err" ? (
            <>区间已经空了,却还没猜中 —— 你是不是中途改了主意?点「重来」再玩一次。</>
          ) : (
            <>
              当前候选区间 [<b>{lo}</b>, <b>{hi}</b>],还剩 <b>{remaining}</b> 个数 · 已猜{" "}
              <b>{tries}</b> 次 / 理论最多 {GUESS_MAX} 次
            </>
          )}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {status === "play" ? (
          <>
            机器猜 <b>{guess}</b>(区间正中间)。它比你想的数大还是小?点下面告诉它 ——
            注意每点一次,候选区间就<b>少一半</b>。
          </>
        ) : status === "won" ? (
          <>
            看清楚这条曲线了吗:100 → 50 → 25 → … 每次减半,7 步内必到。这就是{" "}
            <b>O(log n)</b> —— 二分永远比一个个试(O(n))快得多。
          </>
        ) : (
          <>二分只在「答案确实在区间里」时成立;区间被挤空说明反馈前后矛盾。</>
        )}
      </div>
      <div className="viz-ctl">
        <button type="button" className="btn btn-sm" onClick={tooHigh} disabled={status !== "play"}>
          太大了 ↓
        </button>
        <button type="button" className="btn btn-sm" onClick={tooLow} disabled={status !== "play"}>
          太小了 ↑
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={correct}
          disabled={status !== "play"}
        >
          猜对了 ✓
        </button>
        <button type="button" className="btn btn-sm" onClick={reset} style={{ marginLeft: "auto" }}>
          重来
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   BoundaryStepper —— LC 34 找左右边界(lower_bound / upper_bound)
   ============================================================ */

const BND = [5, 7, 7, 8, 8, 8, 10]; // target = 8,答案区间 [3, 5]

/** 按「存活区间 [lo,hi] + 当前 mid + 已锁定的 ok 下标」渲染一排单元格 */
function bndCells(lo: number, hi: number, mid?: number, ok?: number[]): ArrayCell[] {
  return BND.map((v, i) => {
    if (ok?.includes(i)) return { v, state: "ok" as const };
    if (i === mid) return { v, state: "lit" as const };
    if (i < lo || i > hi) return { v, state: "ghost" as const };
    return { v };
  });
}

const BND_FRAMES: ArrayFrame[] = [
  {
    cells: bndCells(0, 6),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <>
        目标 8 出现了好几次。先找<b>最左</b>的那个 —— 用「第一个 ≥ 8」的模板:
        满足就记下候选,再往左继续挤。
      </>
    ),
  },
  {
    cells: bndCells(0, 6, 3),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 3, label: "mid" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <>
        mid=3,a[3]=8 ≥ 8 ✓。先把 <b>3</b> 记成候选答案,但它左边可能还有 8 ——
        不停手,hi = mid−1 = 2,继续往左找。
      </>
    ),
  },
  {
    cells: bndCells(0, 2, 1),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 1, label: "mid" },
      { i: 2, label: "hi" },
    ],
    msg: (
      <>
        新区间 [0,2]。mid=1,a[1]=7 &lt; 8,太小 —— 答案在右边,lo = mid+1 = 2。
      </>
    ),
  },
  {
    cells: bndCells(2, 2, 2),
    ptrs: [
      { i: 2, label: "lo·mid·hi" },
    ],
    msg: (
      <>
        区间只剩 [2,2]。mid=2,a[2]=7 &lt; 8,lo = 3 —— 此时 lo &gt; hi,循环结束。
      </>
    ),
  },
  {
    cells: bndCells(3, 3, undefined, [3]),
    msg: (
      <>
        循环里最后记下的候选是 <b>3</b> —— 这就是 lower_bound(8),最左的 8 在下标 3。
      </>
    ),
  },
  {
    cells: bndCells(0, 6),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <>
        再找<b>最右</b>的 8。技巧:找「第一个 ≥ 9」再退一格 —— 因为「第一个 &gt; 8」
        就等于「第一个 ≥ 9」(upper_bound(t) = lower_bound(t+1))。
      </>
    ),
  },
  {
    cells: bndCells(0, 6, 3),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 3, label: "mid" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <>
        找「第一个 ≥ 9」:mid=3,a[3]=8 &lt; 9,太小 → lo = 4。
      </>
    ),
  },
  {
    cells: bndCells(4, 6, 5),
    ptrs: [
      { i: 4, label: "lo" },
      { i: 5, label: "mid" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <>
        区间 [4,6]。mid=5,a[5]=8 &lt; 9,还是太小 → lo = 6。
      </>
    ),
  },
  {
    cells: bndCells(6, 6, 6),
    ptrs: [{ i: 6, label: "lo·mid·hi" }],
    msg: (
      <>
        区间 [6,6]。mid=6,a[6]=10 ≥ 9 ✓,记候选 6,hi = 5 —— lo &gt; hi 结束。
        lower_bound(9) = 6。
      </>
    ),
  },
  {
    cells: bndCells(3, 5, undefined, [3, 4, 5]),
    msg: (
      <>
        右边界 = 6 − 1 = <b>5</b>。合起来:8 占据区间 <b>[3, 5]</b>。
        两个边界一减(6−3=3)还顺带得到「8 出现了几次」。
      </>
    ),
  },
];

export function BoundaryStepper() {
  return <ArrayStepper title="LC 34 · 找 8 的左右边界(先 lower_bound,再 upper_bound)" frames={BND_FRAMES} />;
}

/* ============================================================
   RotatedStepper —— LC 33 旋转数组搜索(每步判断哪半有序)
   ============================================================ */

const ROT = [4, 5, 6, 7, 0, 1, 2]; // 升序数组「转了一下」,target = 0,答案下标 4

function rotCells(lo: number, hi: number, mid?: number, ok?: number): ArrayCell[] {
  return ROT.map((v, i) => {
    if (ok === i) return { v, state: "ok" as const };
    if (i === mid) return { v, state: "lit" as const };
    if (i < lo || i > hi) return { v, state: "ghost" as const };
    return { v };
  });
}

const ROT_FRAMES: ArrayFrame[] = [
  {
    cells: rotCells(0, 6),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <>
        [4,5,6,7,0,1,2] 是升序数组「转了一下」:7 后面接的是 0,有个<b>断崖</b>。
        整体不有序,但一刀切下去,总有一半是有序的。目标 <b>0</b>。
      </>
    ),
  },
  {
    cells: rotCells(0, 6, 3),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 3, label: "mid" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <>
        mid=3,a[3]=7 ≠ 0。看左半 [4,5,6,7]:a[lo]=4 ≤ a[mid]=7 → <b>左半有序</b>。
        0 不在 [4, 7) 里 → 整个有序左半都能扔,lo = 4。
      </>
    ),
  },
  {
    cells: rotCells(4, 6, 5),
    ptrs: [
      { i: 4, label: "lo" },
      { i: 5, label: "mid" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <>
        区间 [4,6]。mid=5,a[5]=1 ≠ 0。左半 [0,1]:a[lo]=0 ≤ a[mid]=1 → 有序。
        0 落在 [0, 1) 里 → 收右,hi = 4。
      </>
    ),
  },
  {
    cells: rotCells(4, 4, 4),
    ptrs: [{ i: 4, label: "lo·mid·hi" }],
    msg: (
      <>
        区间 [4,4]。mid=4,a[4]=0 = target —— <b>命中!</b>返回下标 4。
      </>
    ),
  },
  {
    cells: rotCells(4, 4, undefined, 4),
    msg: (
      <>
        3 次判断锁定答案。每一步都靠「哪半有序 + 目标在不在有序半」把范围砍半 →{" "}
        <b>O(log n)</b>,和普通有序数组一样快。
      </>
    ),
  },
];

export function RotatedStepper() {
  return <ArrayStepper title="LC 33 · 在旋转数组里找 0(每步先问:哪半是有序的?)" frames={ROT_FRAMES} />;
}
