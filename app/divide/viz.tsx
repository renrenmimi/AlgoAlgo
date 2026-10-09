"use client";

// Chapter 2 · Divide-and-conquer-specific visualizations:
//  - PowTree: the decomposition "tree" of 3¹³ under fast exponentiation (really a
//    chain) —— reuses TreePlayer from lib/algviz, so you can watch the exponent get
//    halved each time and see that there are only log n levels.
//  - LayeredMerge: a hand-built layered merge diagram (useStepper + StepControls).
//    Reused in two places: the level-by-level merging of merge sort (which explains
//    where O(n log n) comes from) and the pairwise merging of lists in LC 23.
//  - CrossMidLab: the cross-midpoint maximum-sum scan from the divide-and-conquer
//    view of LC 53 (reuses ArrayStepper).
//  - InversionLab: counting inversions during a merge (reuses ArrayStepper).
//  - powVerdict: the reading under the fast-power race in §03.
//
// Bilingual: frame narration is written inline as <T en zh />; title and pointer
// labels take { en, zh }.

import { type ReactNode } from "react";
import { T, useL, type Loc } from "@/lib/i18n";
import { TreePlayer, type TreeNodeSpec, type TreeFrame, type TreeNodeState } from "@/lib/algviz";
import { ArrayStepper, useStepper, StepControls, type ArrayFrame, type ArrayCell } from "@/lib/stepper";
import type { LaneResult } from "@/lib/race-core";
import { pow2Floor } from "./race-pow";

/* ================= PowTree: the 3¹³ fast-exponentiation decomposition chain (TreePlayer) ================= */

const POW_NODES: TreeNodeSpec[] = [
  { id: "e13", label: "3¹³", w: 56 },
  { id: "e6", label: "3⁶", parent: "e13", w: 52 },
  { id: "e3", label: "3³", parent: "e6", w: 52 },
  { id: "e1", label: "3¹", parent: "e3", w: 52 },
  { id: "e0", label: "3⁰", parent: "e1", w: 52 },
];

type PS = Record<string, TreeNodeState>;
const POW_FRAMES: TreeFrame[] = [
  {
    states: { e13: "cur" } as PS,
    msg: (
      <T
        en={
          <>
            The goal is <b>3¹³</b>. A plain loop multiplies 13 times. Divide and
            conquer asks one question first: <b>can 13 be cut in half?</b>{" "}
            13 = 6×2 + 1, so 3¹³ = (3⁶)² × 3. Compute 3⁶ first.
          </>
        }
        zh={
          <>
            要算 <b>3¹³</b>。暴力是乘 13 次;分治先问一句:<b>13 能不能对半砍?</b>
            13 = 6×2 + 1,所以 3¹³ =(3⁶)² × 3。先把 3⁶ 求出来。
          </>
        }
      />
    ),
  },
  {
    states: { e13: "path", e6: "cur" } as PS,
    msg: (
      <T
        en={<>3⁶: 6 is even, so 3⁶ = (3³)² with no extra multiplication. Cut again.</>}
        zh={<>3⁶:6 是偶数,3⁶ =(3³)²,不用补乘。继续往下砍。</>}
      />
    ),
  },
  {
    states: { e13: "path", e6: "path", e3: "cur" } as PS,
    msg: (
      <T
        en={<>3³: 3 is odd, so 3³ = (3¹)² × 3. Cut in half once more.</>}
        zh={<>3³:3 是奇数,3³ =(3¹)² × 3。再砍一半。</>}
      />
    ),
  },
  {
    states: { e13: "path", e6: "path", e3: "path", e1: "cur" } as PS,
    msg: (
      <T
        en={<>3¹: odd, so 3¹ = (3⁰)² × 3. The exponent is down to 1.</>}
        zh={<>3¹:奇数,3¹ =(3⁰)² × 3。指数只剩 1 了。</>}
      />
    ),
  },
  {
    states: { e13: "path", e6: "path", e3: "path", e1: "path", e0: "cur" } as PS,
    msg: (
      <T
        en={
          <>
            3⁰ = 1. This is the <b>base case</b>, so the recursion stops going
            down. Now the combine step runs back up, squaring at every level.
          </>
        }
        zh={<>3⁰ = 1,这是<b>基例</b>,递归到底。现在开始「合」—— 一路平方着往回乘。</>}
      />
    ),
  },
  {
    states: { e13: "path", e6: "path", e3: "path", e1: "cur", e0: "done" } as PS,
    msg: (
      <T
        en={
          <>
            Back at 3¹ = 1² × 3 = <b>3</b>. The exponent is odd, so one extra 3 is
            multiplied in. Both multiplications here involve the 1 from the base
            case, so they do no real work; the count at the end leaves them out.
          </>
        }
        zh={
          <>
            回到 3¹ = 1² × 3 = <b>3</b>(指数是奇数,补乘一个底数 3)。这里的两次乘法都是和基例的 1 相乘,属于平凡乘法,最后计数时不算。
          </>
        }
      />
    ),
  },
  {
    states: { e13: "path", e6: "path", e3: "cur", e1: "done", e0: "done" } as PS,
    msg: (
      <T
        en={<>Back at 3³ = 3² × 3 = <b>27</b>. Odd again, so one more 3.</>}
        zh={<>回到 3³ = 3² × 3 = <b>27</b>(奇数,再补乘一个 3)。</>}
      />
    ),
  },
  {
    states: { e13: "path", e6: "cur", e3: "done", e1: "done", e0: "done" } as PS,
    msg: (
      <T
        en={<>Back at 3⁶ = 27² = <b>729</b>. Even, so square only and multiply nothing extra.</>}
        zh={<>回到 3⁶ = 27² = <b>729</b>(偶数,只平方,不补乘)。</>}
      />
    ),
  },
  {
    states: { e13: "sol", e6: "done", e3: "done", e1: "done", e0: "done" } as PS,
    msg: (
      <T
        en={
          <>
            Back at 3¹³ = 729² × 3 = <b>1,594,323</b>. Leaving out the two
            trivial multiplications by 1 at the bottom, the whole computation used{" "}
            <b>5 multiplications: 3 squarings and 2 extra multiplications</b>, which
            is ⌊log₂13⌋ + popcount(13) − 1 = 3 + 3 − 1. Each level halves the
            exponent, so there are O(log n) levels — and, since the chain is that
            deep, O(log n) stack frames as well.
          </>
        }
        zh={
          <>
            回到 3¹³ = 729² × 3 = <b>1 594 323</b>。不计链底那两次和 1 相乘的平凡乘法,全程只做了 <b>5 次乘法:3 次平方 + 2 次补乘</b>,正是
            ⌊log₂13⌋ + popcount(13) − 1 = 3 + 3 − 1。指数每层减半 ⇒ 层数 O(log n);链有多深,递归栈就有多深,同样是 O(log n)。
          </>
        }
      />
    ),
  },
];

export function PowTree() {
  return (
    <TreePlayer
      title={{
        en: "Fast power 3¹³: the exponent halves every level, so there are only log n levels",
        zh: "快速幂 3¹³:指数每次对半砍,只有 log n 层",
      }}
      nodes={POW_NODES}
      frames={POW_FRAMES}
      nodeW={52}
      gapY={30}
      legend={false}
    />
  );
}

/* ================= LayeredMerge: the layered merge diagram (hand-built) ================= */

type Bucket = (number | string)[];
type Layer = Bucket[];

interface LayerFrame {
  active: number;
  msg: ReactNode;
}

function LayeredMerge({
  title,
  layers,
  frames,
  linked = false,
}: {
  title: Loc<ReactNode>;
  /** Snapshots of each level, from the finest granularity (L0) up to the final combined result */
  layers: Layer[];
  frames: LayerFrame[];
  /** Draw a "→" between elements inside a bucket, to suggest a linked list */
  linked?: boolean;
}) {
  const L = useL();
  const stepper = useStepper(frames.length, 1300);
  const f = frames[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">{L(title)}</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 10, alignItems: "stretch" }}>
        {layers.map((layer, li) => {
          const state = li === f.active ? "on" : li < f.active ? "done" : "idle";
          return (
            <div key={li} className="dvd-layer" data-state={state}>
              <span className="dvd-layer-tag">L{li}</span>
              <div className="dvd-buckets">
                {layer.map((b, bi) => (
                  <div key={bi} className="dvd-bucket">
                    {b.map((v, vi) => (
                      <span key={vi} className="dvd-cellrow">
                        <span className="dvd-num">{v}</span>
                        {linked && vi < b.length - 1 && <i className="dvd-arrow">→</i>}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </div>
  );
}

/* — Level-by-level merging in merge sort (§02, complexity) — */

const MS_LAYERS: Layer[] = [
  [[5], [2], [8], [1], [9], [3], [7], [4]],
  [
    [2, 5],
    [1, 8],
    [3, 9],
    [4, 7],
  ],
  [
    [1, 2, 5, 8],
    [3, 4, 7, 9],
  ],
  [[1, 2, 3, 4, 5, 7, 8, 9]],
];

const MS_FRAMES: LayerFrame[] = [
  {
    active: 0,
    msg: (
      <T
        en={
          <>
            Divide first: halve the array again and again until every piece holds
            one element. <b>A single element is already sorted</b>, so the real
            work all happens on the way back up.
          </>
        }
        zh={
          <>
            先「分」:一路对半砍,直到每段只剩 1 个元素 —— <b>单个元素天然有序</b>。真正的活儿全在往回「合」的路上。
          </>
        }
      />
    ),
  },
  {
    active: 1,
    msg: (
      <T
        en={
          <>
            Level 1 merge: neighboring pieces are merged in pairs. The pass walks
            from start to end and moves each element once →{" "}
            <b>O(n) for this level</b>.
          </>
        }
        zh={
          <>
            第 1 层合并:相邻两段两两归并成有序段。从头扫到尾,每个元素只被搬一次 →
            <b> 本层 O(n)</b>。
          </>
        }
      />
    ),
  },
  {
    active: 2,
    msg: (
      <T
        en={
          <>
            Level 2: the pieces are longer and there are half as many, but{" "}
            <b>the number of elements touched is still n</b> — still O(n).
          </>
        }
        zh={
          <>
            第 2 层:段更长、段数减半,但<b>被触碰的元素总数还是 n</b> —— 依然 O(n)。
          </>
        }
      />
    ),
  },
  {
    active: 3,
    msg: (
      <T
        en={
          <>
            Level 3 merges everything into one run. The number of levels is the
            number of times n can be halved down to 1 = <b>log₂n</b>. Total work
            = O(n) per level × log₂n levels = <b>O(n log n)</b>, in the best,
            average, and worst case alike.
          </>
        }
        zh={
          <>
            第 3 层合成整段。层数 = 把 n 对半砍到 1 的次数 = <b>log₂n</b>。总功 = 每层 O(n) × log₂n 层 = <b>O(n log n)</b>,而且最好、平均、最坏都一样。
          </>
        }
      />
    ),
  },
];

export function MergeSortLayers() {
  return (
    <LayeredMerge
      title={{
        en: "Merge sort: every level touches all n elements, and there are log n levels",
        zh: "归并排序:每层都扫一遍 n 个元素,共 log n 层",
      }}
      layers={MS_LAYERS}
      frames={MS_FRAMES}
    />
  );
}

/* — LC 23, merging K linked lists pairwise (§04) — */

const MK_LAYERS: Layer[] = [
  [
    [1, 4, 5],
    [1, 3, 4],
    [2, 6],
    [3, 7],
  ],
  [
    [1, 1, 3, 4, 4, 5],
    [2, 3, 6, 7],
  ],
  [[1, 1, 2, 3, 3, 4, 4, 5, 6, 7]],
];

const MK_FRAMES: LayerFrame[] = [
  {
    active: 0,
    msg: (
      <T
        en={
          <>
            Four sorted lists. The naive method takes the first list and merges
            the other three into it one at a time. That base list keeps growing,
            so the total cost is <b>O(k·N)</b>.
          </>
        }
        zh={
          <>
            4 条各自有序的链表。最笨的办法:拿第 1 条当底,依次并入其余 3 条 ——
            底链越并越长,总代价 <b>O(k·N)</b>。
          </>
        }
      />
    ),
  },
  {
    active: 1,
    msg: (
      <T
        en={
          <>
            Divide and conquer: <b>merge the lists in pairs</b>. 4 lists become
            2, and this round moves every node exactly once → O(N).
          </>
        }
        zh={
          <>
            分治法:<b>两两配对归并</b>。4 条 → 2 条,这一轮每个节点被比较搬运一次 → O(N)。
          </>
        }
      />
    ),
  },
  {
    active: 2,
    msg: (
      <T
        en={
          <>
            Merge those 2 into 1, again O(N). The number of rounds is{" "}
            <b>log₂k</b>, so the total is <b>O(N log k)</b>. The larger k is, the
            more this saves over merging one list at a time.
          </>
        }
        zh={
          <>
            再合并这 2 条 → 1 条,又是 O(N)。配对轮数 = <b>log₂k</b>,总代价 <b>O(N·log k)</b> —— k 越大,比逐条并入越省。
          </>
        }
      />
    ),
  },
];

export function MergeKLists() {
  return (
    <LayeredMerge
      title={{
        en: "LC 23: merge in pairs, so k lists become one in log k rounds",
        zh: "LC 23:两两归并,k 条链表 log k 轮合成一条",
      }}
      layers={MK_LAYERS}
      frames={MK_FRAMES}
      linked
    />
  );
}

/* ================= CrossMidLab: LC 53 cross-midpoint maximum sum (ArrayStepper) ================= */

const XA = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

const SCAN_L: Loc<string> = { en: "← scan", zh: "←扫" };
const SCAN_R: Loc<string> = { en: "scan →", zh: "扫→" };

function xframe(opts: {
  lit?: [number, number];
  ok?: [number, number][];
  ptr?: { i: number; label: Loc<string> };
  msg: ReactNode;
}): ArrayFrame {
  const cells: ArrayCell[] = XA.map((v, i) => {
    const inOk = (opts.ok ?? []).some(([lo, hi]) => i >= lo && i <= hi);
    if (inOk) return { v, state: "ok" };
    if (opts.lit && i >= opts.lit[0] && i <= opts.lit[1]) return { v, state: "lit" };
    return { v };
  });
  return { cells, ptrs: opts.ptr ? [opts.ptr] : [], msg: opts.msg };
}

const CROSS_FRAMES: ArrayFrame[] = [
  xframe({
    ptr: { i: 4, label: "mid" },
    msg: (
      <T
        en={
          <>
            Divide and conquer cuts once: the midpoint is index 4. The best
            subarray has only three possible homes — entirely in the left half,
            entirely in the right half, or <b>crossing the midpoint</b>. The two
            halves go to the recursion. The crossing case is what has to be
            computed here.
          </>
        }
        zh={
          <>
            分治先切一刀:中点在下标 4。最大子数组只有三种归宿 —— 全在左半、全在右半、或<b>横跨中点</b>。左右两半交给递归(相信它算对),难点是「跨中点」这一段。
          </>
        }
      />
    ),
  }),
  xframe({
    lit: [4, 4],
    ptr: { i: 4, label: SCAN_L },
    msg: (
      <T
        en={
          <>
            A crossing subarray must contain the midpoint. Add values from index
            4 going left: −1. Current sum −1, best on the left = −1.
          </>
        }
        zh={<>跨中点段必须含中点。从下标 4 往左累加:−1,当前和 −1,左侧最佳 = −1。</>}
      />
    ),
  }),
  xframe({
    lit: [3, 4],
    ptr: { i: 3, label: SCAN_L },
    msg: (
      <T
        en={
          <>
            Add 4 at index 3 → sum 3. New best on the left = <b>3</b>, with the
            left edge at index 3.
          </>
        }
        zh={<>加下标 3 的 4 → 和 3,刷新左侧最佳 = <b>3</b>(左边界停在下标 3)。</>}
      />
    ),
  }),
  xframe({
    lit: [2, 4],
    ptr: { i: 2, label: SCAN_L },
    msg: (
      <T
        en={
          <>
            Add −3 → sum 0 &lt; 3, so the best does not change. Keep going left:
            a value further out may still turn it around.
          </>
        }
        zh={<>加 −3 → 和 0 &lt; 3,不刷新;但要继续往左试(更外侧的值仍可能让和反超)。</>}
      />
    ),
  }),
  xframe({
    lit: [1, 4],
    ptr: { i: 1, label: SCAN_L },
    msg: <T en={<>Add 1 → sum 1, still &lt; 3.</>} zh={<>加 1 → 和 1,仍 &lt; 3。</>} />,
  }),
  xframe({
    lit: [0, 4],
    ptr: { i: 0, label: SCAN_L },
    msg: (
      <T
        en={
          <>
            Add −2 → sum −1. The left scan is finished: best = 3, best left edge
            = index 3.
          </>
        }
        zh={<>加 −2 → 和 −1。左侧扫完:最佳 = 3,最优左边界 = 下标 3。</>}
      />
    ),
  }),
  xframe({
    ok: [[3, 4]],
    lit: [5, 5],
    ptr: { i: 5, label: SCAN_R },
    msg: (
      <T
        en={
          <>
            The left part is fixed (green). Now add from index 5 going right: 2.
            Sum 2, best on the right = 2.
          </>
        }
        zh={<>锁定左段(绿)。再从下标 5 往右累加:2,和 2,右侧最佳 = 2。</>}
      />
    ),
  }),
  xframe({
    ok: [[3, 4]],
    lit: [5, 6],
    ptr: { i: 6, label: SCAN_R },
    msg: (
      <T
        en={
          <>
            Add 1 → sum 3. New best on the right = <b>3</b>, with the right edge
            at index 6.
          </>
        }
        zh={<>加 1 → 和 3,刷新右侧最佳 = <b>3</b>(右边界到下标 6)。</>}
      />
    ),
  }),
  xframe({
    ok: [[3, 4]],
    lit: [5, 7],
    ptr: { i: 7, label: SCAN_R },
    msg: (
      <T
        en={<>Add −5 → sum −2 &lt; 3, no change. Keep going.</>}
        zh={<>加 −5 → 和 −2 &lt; 3,不刷新,继续。</>}
      />
    ),
  }),
  xframe({
    ok: [[3, 4]],
    lit: [5, 8],
    ptr: { i: 8, label: SCAN_R },
    msg: (
      <T
        en={
          <>
            Add 4 → sum 2 &lt; 3. The right scan is finished: best = 3, best
            right edge = index 6.
          </>
        }
        zh={<>加 4 → 和 2 &lt; 3。右侧扫完:最佳 = 3,最优右边界 = 下标 6。</>}
      />
    ),
  }),
  xframe({
    ok: [[3, 6]],
    msg: (
      <T
        en={
          <>
            Best crossing sum = left 3 + right 3 = <b>6</b>, which is the
            subarray [4, −1, 2, 1]. It sits across the cut, so neither half&apos;s
            recursion can see it. Computing it is exactly what the combine step
            is for.
          </>
        }
        zh={
          <>
            跨中点最大 = 左 3 + 右 3 = <b>6</b>,对应子数组 [4, −1, 2, 1]。它骑在切口上,左右两半各自的递归结果都看不到它 —— 这正是分治「合」这一步的价值。
          </>
        }
      />
    ),
  }),
];

export function CrossMidLab() {
  return (
    <ArrayStepper
      title={{
        en: "LC 53 divide and conquer: the best sum that crosses the midpoint",
        zh: "LC 53 分治:算「跨中点」的最大和(从中点向两侧扩)",
      }}
      frames={CROSS_FRAMES}
      cellW={48}
    />
  );
}

/* ================= InversionLab: counting inversions during a merge (ArrayStepper) ================= */

const ILAB = [3, 5, 2, 4];

function iframe(
  states: (ArrayCell["state"] | undefined)[],
  ptrs: { i: number; label: Loc<string> }[],
  msg: ReactNode,
): ArrayFrame {
  return {
    cells: ILAB.map((v, i) => ({ v, state: states[i] })),
    ptrs,
    msg,
  };
}

const INV_FRAMES: ArrayFrame[] = [
  iframe(
    ["ok", "ok", undefined, undefined],
    [
      { i: 0, label: { en: "left", zh: "左" } },
      { i: 2, label: { en: "right", zh: "右" } },
    ],
    (
      <T
        en={
          <>
            Merge sort can count <b>inversions</b> along the way. An inversion is
            a pair where an earlier value is larger than a later one. The left
            half [3, 5] and the right half [2, 4] are already sorted, so the
            merge only has to count the inversions that cross the two halves.
          </>
        }
        zh={
          <>
            归并排序在合并时就能同时数出<b>逆序对</b>(前面比后面大的数对)。左半 [3, 5]、右半 [2, 4] 各自已排好,合并时只需数「跨越两半」的逆序对。
          </>
        }
      />
    ),
  ),
  iframe(
    ["bad", "bad", "lit", undefined],
    [
      { i: 0, label: "i" },
      { i: 2, label: "j" },
    ],
    (
      <T
        en={
          <>
            Compare 3 with 2. 2 is smaller, so 2 is output first. At this moment{" "}
            <b>the left half still holds [3, 5], and both are larger than 2</b>{" "}
            and sit before it → 2 inversions at once: (3,2) and (5,2). Running
            total = 2.
          </>
        }
        zh={
          <>
            比 3 与 2:2 更小,先输出 2。此刻<b>左半还剩 [3, 5] 两个数都比 2 大</b> →
            一次进账 <b>2</b> 对:(3,2)、(5,2)。累计 = 2。
          </>
        }
      />
    ),
  ),
  iframe(
    ["lit", undefined, "ok", undefined],
    [
      { i: 0, label: "i" },
      { i: 3, label: "j" },
    ],
    (
      <T
        en={
          <>
            Compare 3 with 4. 3 is smaller, so 3 is output. A value taken from
            the left half creates no inversion. Total stays 2.
          </>
        }
        zh={<>比 3 与 4:3 更小,输出 3 —— 左边的数先出,不产生逆序对。累计仍 = 2。</>}
      />
    ),
  ),
  iframe(
    [undefined, "bad", undefined, "lit"],
    [
      { i: 1, label: "i" },
      { i: 3, label: "j" },
    ],
    (
      <T
        en={
          <>
            Compare 5 with 4. 4 is smaller, so 4 is output. The left half still
            holds [5], which is larger than 4 → <b>1</b> more inversion: (5,4).
            Total = <b>3</b>.
          </>
        }
        zh={
          <>
            比 5 与 4:4 更小,先输出 4。左半还剩 [5] 比 4 大 → 再进账 <b>1</b> 对:(5,4)。累计 = <b>3</b>。
          </>
        }
      />
    ),
  ),
  iframe(
    [undefined, "ok", undefined, undefined],
    [{ i: 1, label: "i" }],
    (
      <T
        en={
          <>
            Output 5 and the merge is done. Crossing inversions = <b>3</b>, and
            neither half had any of its own, so [3, 5, 2, 4] has 3 inversions in
            total. The key move: every time a value is taken from the right half,
            add however many values are still waiting in the left half. Sorted
            halves remove the pair-by-pair comparison, and the whole count stays
            O(n log n).
          </>
        }
        zh={
          <>
            输出 5,合并完成。跨越逆序对 = <b>3</b>;两半内部各自没有逆序对,所以 [3, 5, 2, 4] 一共 3 对。关键:每次从右半取数,<b>左半剩几个就一次加几个</b> ——
            两半有序省掉了逐对比较,总复杂度仍是 O(n log n)。
          </>
        }
      />
    ),
  ),
];

export function InversionLab() {
  return (
    <ArrayStepper
      title={{
        en: "A by-product of merging: counting the inversions that cross the two halves",
        zh: "归并的副产品:合并时数出跨越两半的逆序对",
      }}
      frames={INV_FRAMES}
      cellW={56}
    />
  );
}

/* ================= Fast-power race verdict (§03) =================
   Built from the measured counts and the exponent actually raced, so the
   explanation follows the size and shape the reader picks.
   test/unit/divide-race-verdict.test.tsx checks every shape × size. */

/** The exponents offered by the fast-power race. */
export const POW_RACE_SIZES = [10, 31, 100, 1000, 10000];

export function powVerdict(
  r: LaneResult[],
  { size, inputId }: { size: number; inputId: string },
): Loc<ReactNode> {
  const counts = (id: string) => {
    const lane = r.find((x) => x.id === id);
    if (!lane) throw new Error(`fast-power verdict: no lane "${id}"`);
    return lane.counts;
  };
  const nv = counts("pow-naive");
  const rc = counts("pow-rec");
  const it = counts("pow-iter");
  const e = inputId === "pow2" ? pow2Floor(size) : size;
  const bin = e.toString(2);
  const lg = bin.length - 1; // ⌊log₂n⌋
  const ones = bin.split("").filter((c) => c === "1").length; // popcount(n)
  const extra = ones - 1;
  const ratio = Math.round(nv.cmp / Math.max(1, rc.cmp));

  const spaceEn = (
    <>
      {" "}
      The two fast versions do the same amount of arithmetic — {rc.cmp} against{" "}
      {it.cmp} multiplications. The iterative one is behind by exactly one because its
      result starts at 1, so the first multiplication into it only multiplies by 1.
      Ignore that. The bar to read is the second one: the recursive version holds{" "}
      <b>{rc.space} units</b> at the peak and every one of them is a live stack frame
      (⌊log₂n⌋ + 1 = {lg + 1}), while the iterative version holds <b>{it.space}</b> no
      matter how large n grows. Naive chaining is in fact the most frugal on space, with{" "}
      {nv.space} variable, and it buys nothing — it already lost on the axis that
      decides this problem. The engineering reading: when a recursion is a straight
      chain with nothing left to combine on the way back, write the loop. Same
      complexity, and no stack that can overflow.
    </>
  );
  const spaceZh = (
    <>
      两个快速幂版本做的算术量一样 —— {rc.cmp} 对 {it.cmp} 次乘法,迭代版只多 1 次,原因很小:它的结果从 1 起步,第一次乘进结果的那一下只是乘以 1。这 1 次可以不看。要看的是第二根条:递归版峰值占用 <b>{rc.space} 个单元</b>,而且每一个都是活着的栈帧(⌊log₂n⌋ + 1 = {lg + 1});迭代版无论 n 多大都只占 <b>{it.space}</b> 个。朴素连乘反而是空间上最省的({nv.space} 个变量),但这点节省什么也换不到 ——
      它在决定这道题的那根轴上已经输了。工程上的读法:当递归是一条直链、回来的路上没有东西要合并时,就把它写成循环 ——
      复杂度一样,而且没有可以溢出的栈。
    </>
  );

  if (inputId === "pow2") {
    // The exponent of the same bit-length with every bit set: same squarings, the
    // most surcharge.
    const full = 2 * e - 1;
    const fullBin = full.toString(2);
    const offered = POW_RACE_SIZES.includes(full);
    return {
      en: (
        <>
          Exponent n = {e} = 2^{lg}, a single 1 bit. Fast power then does nothing but
          square: <b>{rc.cmp} multiplications</b>, exactly log₂n, and no sequence of
          squarings can reach this exponent in fewer steps. Naive chaining still pays{" "}
          <b>{nv.cmp}</b>. Compare the exponent with the same bit-length and every bit
          set, {full} = ({fullBin})₂: the squarings stay at {lg}, but the {lg} set bits
          after the leading one each add a multiply, so fast power needs {2 * lg} there
          {offered && <> — pick General and {full} to see it</>}. That is what ⌊log₂n⌋ +
          popcount(n) − 1 means in practice: the squarings are fixed by the bit-length,
          the 1 bits are the surcharge.
          {spaceEn}
        </>
      ),
      zh: (
        <>
          指数 n = {e} = 2^{lg},二进制只有一个 1。此时快速幂只做平方:
          <b>{rc.cmp} 次乘法</b>,正好是 log₂n,而且没有任何平方序列能更快到达这个指数;朴素连乘仍要付 <b>{nv.cmp}</b> 次。对照同样位长、各位全是 1 的指数 {full} =({fullBin})₂:平方次数仍是 {lg},但其余 {lg} 个 1 每个都要补乘一次,快速幂要 {2 * lg} 次
          {offered && <>(选「一般指数」和 {full} 就能看到)</>}。这就是 ⌊log₂n⌋ + popcount(n) − 1 的现实含义:平方次数由位长决定,二进制里的 1 是附加费。
          {spaceZh}
        </>
      ),
    };
  }

  const extraEn =
    extra === 0
      ? "no extra multiplication, because n has a single 1 bit"
      : extra === 1
        ? "popcount(n) − 1 = 1 extra multiplication, for the remaining 1 bit"
        : `popcount(n) − 1 = ${extra} extra multiplications, one for each remaining 1 bit`;
  return {
    en: (
      <>
        Exponent n = {e} = ({bin})₂. Naive chaining pays <b>{nv.cmp}</b>{" "}
        multiplications — exactly n − 1, one per loop step. Fast power pays{" "}
        <b>{rc.cmp}</b>, and the number splits cleanly: ⌊log₂n⌋ = {lg} squarings to
        build x², x⁴, x⁸ … plus {extraEn}. That is a factor of {ratio}, and it is not a
        fixed factor: doubling n adds {e} steps on the left and one step on the right.
        {spaceEn}
      </>
    ),
    zh: (
      <>
        指数 n = {e} =({bin})₂。朴素连乘付 <b>{nv.cmp}</b> 次乘法 —— 正好是 n − 1,循环每走一步一次。快速幂付 <b>{rc.cmp}</b> 次,而这个数字拆得很干净:
        ⌊log₂n⌋ = {lg} 次平方,用来造出 x²、x⁴、x⁸……
        外加 popcount(n) − 1 = {extra} 次补乘,对应二进制里剩下的每一个 1。差距是 {ratio} 倍,而且这个倍数不是固定的:把 n 翻一倍,左边多 {e} 步,右边只多 1 步。
        {spaceZh}
      </>
    ),
  };
}
