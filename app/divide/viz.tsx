"use client";

// 第 2 章 · 分治的专属可视化:
//  - PowTree:快速幂 3¹³ 的分解「树」(其实是一条链)—— 复用 lib/algviz 的 TreePlayer,
//    亲眼看指数每次对半砍,只有 log n 层。
//  - LayeredMerge:自建的「分层合并图」(useStepper + StepControls)。
//    两处复用:归并排序的逐层合并(讲 O(n log n) 由来)、LC 23 的两两归并链表。
//  - CrossMidLab:LC 53 分治视角的「跨中点最大和」扫描(复用 ArrayStepper)。
//  - InversionLab:归并统计逆序对(复用 ArrayStepper)。
//
// 双语:帧旁白直接写 <T en zh />;title / 指针标签传 { en, zh }。

import { type ReactNode } from "react";
import { T, useL, type Loc } from "@/lib/i18n";
import { TreePlayer, type TreeNodeSpec, type TreeFrame, type TreeNodeState } from "@/lib/algviz";
import { ArrayStepper, useStepper, StepControls, type ArrayFrame, type ArrayCell } from "@/lib/stepper";

/* ================= PowTree:快速幂 3¹³ 分解链(TreePlayer) ================= */

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
        zh={<>3⁰ = 1,<b>基准情形</b>,触底。现在开始「合」—— 一路平方着回乘。</>}
      />
    ),
  },
  {
    states: { e13: "path", e6: "path", e3: "path", e1: "cur", e0: "done" } as PS,
    msg: (
      <T
        en={<>Back at 3¹ = 1² × 3 = <b>3</b>. The exponent is odd, so one extra 3 is multiplied in.</>}
        zh={<>回到 3¹ = 1² × 3 = <b>3</b>(指数是奇数,补乘一个底数 3)。</>}
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
            Back at 3¹³ = 729² × 3 = <b>1,594,323</b>. The whole computation used{" "}
            <b>4 squarings and 3 extra multiplications</b>, about log₂13 steps.
            Each level halves the exponent, so there are O(log n) levels — and,
            since the chain is that deep, O(log n) stack frames as well.
          </>
        }
        zh={
          <>
            回到 3¹³ = 729² × 3 = <b>1 594 323</b>。全程只做了 <b>4 次平方 + 3 次补乘</b> ——
            约 log₂13 步。指数每层减半 ⇒ 层数 O(log n);链有多深,递归栈就有多深,同样是 O(log n)。
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

/* ================= LayeredMerge:分层合并图(自建) ================= */

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
  /** 从最细粒度(L0)到最终合成的各层快照 */
  layers: Layer[];
  frames: LayerFrame[];
  /** 桶内元素之间画「→」,用于示意链表 */
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

/* — 归并排序的逐层合并(§02 复杂度) — */

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
            先「分」:一路对半砍,直到每段只剩 1 个元素 —— <b>单个元素天然有序</b>。
            真正的活儿全在往回「合」的路上。
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
            第 3 层合成整段。层数 = 把 n 对半砍到 1 的次数 = <b>log₂n</b>。
            总功 = 每层 O(n) × log₂n 层 = <b>O(n log n)</b>,而且最好、平均、最坏都一样。
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

/* — LC 23 两两归并 K 条链表(§04) — */

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
            再合并这 2 条 → 1 条,又是 O(N)。配对轮数 = <b>log₂k</b>,
            总代价 <b>O(N·log k)</b> —— k 越大,比逐条并入越省。
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

/* ================= CrossMidLab:LC 53 跨中点最大和(ArrayStepper) ================= */

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
            分治先切一刀:中点在下标 4。最大子数组只有三种归宿 —— 全在左半、全在右半、
            或<b>横跨中点</b>。左右两半交给递归(相信它算对),难点是「跨中点」这一段。
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
        zh={<>加 −3 → 和 0 &lt; 3,不刷新;但要继续往左试(后面可能翻盘)。</>}
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
            跨中点最大 = 左 3 + 右 3 = <b>6</b>,对应子数组 [4, −1, 2, 1]。
            它骑在切口上,左右两半各自的递归结果都看不到它 —— 这正是分治「合」这一步的价值。
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

/* ================= InversionLab:归并统计逆序对(ArrayStepper) ================= */

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
            归并排序顺手就能数<b>逆序对</b>(前面比后面大的数对)。左半 [3, 5]、右半 [2, 4] 各自已排好,
            合并时只需数「跨越两半」的逆序对。
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
            输出 5,合并完成。跨越逆序对 = <b>3</b>;两半内部各自没有逆序对,
            所以 [3, 5, 2, 4] 一共 3 对。关键:每次从右半取数,<b>左半剩几个就一次加几个</b> ——
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
