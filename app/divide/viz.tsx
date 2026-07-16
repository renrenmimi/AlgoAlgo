"use client";

// 第 2 章 · 分治的专属可视化:
//  - PowTree:快速幂 3¹³ 的分解「树」(其实是一条链)—— 复用 lib/algviz 的 TreePlayer,
//    亲眼看指数每次对半砍,只有 log n 层。
//  - LayeredMerge:自建的「分层合并图」(useStepper + StepControls)。
//    两处复用:归并排序的逐层合并(讲 O(n log n) 由来)、LC 23 的两两归并链表。
//  - CrossMidLab:LC 53 分治视角的「跨中点最大和」扫描(复用 ArrayStepper)。
//  - InversionLab:归并统计逆序对(复用 ArrayStepper)。

import { type ReactNode } from "react";
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
      <>
        要算 <b>3¹³</b>。暴力是乘 13 次;分治先问一句:<b>13 能不能对半砍?</b>
        13 = 6×2 + 1,所以 3¹³ =(3⁶)² × 3。先把 3⁶ 求出来。
      </>
    ),
  },
  {
    states: { e13: "path", e6: "cur" } as PS,
    msg: <>3⁶:6 是偶数,3⁶ =(3³)²,不用补乘。继续往下砍。</>,
  },
  {
    states: { e13: "path", e6: "path", e3: "cur" } as PS,
    msg: <>3³:3 是奇数,3³ =(3¹)² × 3。再砍一半。</>,
  },
  {
    states: { e13: "path", e6: "path", e3: "path", e1: "cur" } as PS,
    msg: <>3¹:奇数,3¹ =(3⁰)² × 3。指数只剩 1 了。</>,
  },
  {
    states: { e13: "path", e6: "path", e3: "path", e1: "path", e0: "cur" } as PS,
    msg: <>3⁰ = 1,<b>基准情形</b>,触底。现在开始「合」—— 一路平方着回乘。</>,
  },
  {
    states: { e13: "path", e6: "path", e3: "path", e1: "cur", e0: "done" } as PS,
    msg: <>回到 3¹ = 1² × 3 = <b>3</b>(指数是奇数,补乘一个底数 3)。</>,
  },
  {
    states: { e13: "path", e6: "path", e3: "cur", e1: "done", e0: "done" } as PS,
    msg: <>回到 3³ = 3² × 3 = <b>27</b>(奇数,再补乘一个 3)。</>,
  },
  {
    states: { e13: "path", e6: "cur", e3: "done", e1: "done", e0: "done" } as PS,
    msg: <>回到 3⁶ = 27² = <b>729</b>(偶数,只平方,不补乘)。</>,
  },
  {
    states: { e13: "sol", e6: "done", e3: "done", e1: "done", e0: "done" } as PS,
    msg: (
      <>
        回到 3¹³ = 729² × 3 = <b>1 594 323</b>。全程只做了 <b>4 次平方 + 3 次补乘</b> ——
        约 log₂13 步。指数每层减半 ⇒ 层数 O(log n),这就是快速幂快在哪。
      </>
    ),
  },
];

export function PowTree() {
  return (
    <TreePlayer
      title="快速幂 3¹³:指数每次对半砍,只有 log n 层"
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
  title: string;
  /** 从最细粒度(L0)到最终合成的各层快照 */
  layers: Layer[];
  frames: LayerFrame[];
  /** 桶内元素之间画「→」,用于示意链表 */
  linked?: boolean;
}) {
  const stepper = useStepper(frames.length, 1300);
  const f = frames[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">{title}</div>
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
      <>
        先「分」:一路对半砍,直到每段只剩 1 个元素 —— <b>单个元素天然有序</b>。
        真正的活儿全在往回「合」的路上。
      </>
    ),
  },
  {
    active: 1,
    msg: (
      <>
        第 1 层合并:相邻两段两两归并成有序段。从头扫到尾,每个元素只被搬一次 →
        <b> 本层 O(n)</b>。
      </>
    ),
  },
  {
    active: 2,
    msg: (
      <>
        第 2 层:段更长、段数减半,但<b>被触碰的元素总数还是 n</b> —— 依然 O(n)。
      </>
    ),
  },
  {
    active: 3,
    msg: (
      <>
        第 3 层合成整段。层数 = 把 n 对半砍到 1 的次数 = <b>log₂n</b>。
        总功 = 每层 O(n) × log₂n 层 = <b>O(n log n)</b>。
      </>
    ),
  },
];

export function MergeSortLayers() {
  return <LayeredMerge title="归并排序:每层都扫一遍 n 个元素,共 log n 层" layers={MS_LAYERS} frames={MS_FRAMES} />;
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
      <>
        4 条各自有序的链表。最笨的办法:拿第 1 条当底,依次并入其余 3 条 ——
        底链越并越长,总代价 <b>O(k·N)</b>。
      </>
    ),
  },
  {
    active: 1,
    msg: (
      <>
        分治法:<b>两两配对归并</b>。4 条 → 2 条,这一轮每个节点被比较搬运一次 → O(N)。
      </>
    ),
  },
  {
    active: 2,
    msg: (
      <>
        再合并这 2 条 → 1 条,又是 O(N)。配对轮数 = <b>log₂k</b>,
        总代价 <b>O(N·log k)</b> —— k 越大,比逐条并入越省。
      </>
    ),
  },
];

export function MergeKLists() {
  return <LayeredMerge title="LC 23:两两归并,k 条链表 log k 轮合成一条" layers={MK_LAYERS} frames={MK_FRAMES} linked />;
}

/* ================= CrossMidLab:LC 53 跨中点最大和(ArrayStepper) ================= */

const XA = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

function xframe(opts: {
  lit?: [number, number];
  ok?: [number, number][];
  ptr?: { i: number; label: string };
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
      <>
        分治先切一刀:中点在下标 4。最大子数组只有三种归宿 —— 全在左半、全在右半、
        或<b>横跨中点</b>。左右两半交给递归(相信它算对),难点是「跨中点」这一段。
      </>
    ),
  }),
  xframe({
    lit: [4, 4],
    ptr: { i: 4, label: "←扫" },
    msg: <>跨中点段必须含中点。从下标 4 往左累加:−1,当前和 −1,左侧最佳 = −1。</>,
  }),
  xframe({
    lit: [3, 4],
    ptr: { i: 3, label: "←扫" },
    msg: <>加下标 3 的 4 → 和 3,刷新左侧最佳 = <b>3</b>(左边界停在下标 3)。</>,
  }),
  xframe({
    lit: [2, 4],
    ptr: { i: 2, label: "←扫" },
    msg: <>加 −3 → 和 0 &lt; 3,不刷新;但要继续往左试(后面可能翻盘)。</>,
  }),
  xframe({
    lit: [1, 4],
    ptr: { i: 1, label: "←扫" },
    msg: <>加 1 → 和 1,仍 &lt; 3。</>,
  }),
  xframe({
    lit: [0, 4],
    ptr: { i: 0, label: "←扫" },
    msg: <>加 −2 → 和 −1。左侧扫完:最佳 = 3,最优左边界 = 下标 3。</>,
  }),
  xframe({
    ok: [[3, 4]],
    lit: [5, 5],
    ptr: { i: 5, label: "扫→" },
    msg: <>锁定左段(绿)。再从下标 5 往右累加:2,和 2,右侧最佳 = 2。</>,
  }),
  xframe({
    ok: [[3, 4]],
    lit: [5, 6],
    ptr: { i: 6, label: "扫→" },
    msg: <>加 1 → 和 3,刷新右侧最佳 = <b>3</b>(右边界到下标 6)。</>,
  }),
  xframe({
    ok: [[3, 4]],
    lit: [5, 7],
    ptr: { i: 7, label: "扫→" },
    msg: <>加 −5 → 和 −2 &lt; 3,不刷新,继续。</>,
  }),
  xframe({
    ok: [[3, 4]],
    lit: [5, 8],
    ptr: { i: 8, label: "扫→" },
    msg: <>加 4 → 和 2 &lt; 3。右侧扫完:最佳 = 3,最优右边界 = 下标 6。</>,
  }),
  xframe({
    ok: [[3, 6]],
    msg: (
      <>
        跨中点最大 = 左 3 + 右 3 = <b>6</b>,对应子数组 [4, −1, 2, 1]。
        它骑在切口上,左右两半各自的递归结果都看不到它 —— 这正是分治「合」这一步的价值。
      </>
    ),
  }),
];

export function CrossMidLab() {
  return <ArrayStepper title="LC 53 分治:算「跨中点」的最大和(从中点向两侧扩)" frames={CROSS_FRAMES} cellW={48} />;
}

/* ================= InversionLab:归并统计逆序对(ArrayStepper) ================= */

const ILAB = [3, 5, 2, 4];

function iframe(states: (ArrayCell["state"] | undefined)[], ptrs: { i: number; label: string }[], msg: ReactNode): ArrayFrame {
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
      { i: 0, label: "左" },
      { i: 2, label: "右" },
    ],
    (
      <>
        归并排序顺手就能数<b>逆序对</b>(前面比后面大的数对)。左半 [3, 5]、右半 [2, 4] 各自已排好,
        合并时只需数「跨越两半」的逆序对。
      </>
    ),
  ),
  iframe(
    ["bad", "bad", "lit", undefined],
    [
      { i: 0, label: "i" },
      { i: 2, label: "j" },
    ],
    (
      <>
        比 3 与 2:2 更小,先输出 2。此刻<b>左半还剩 [3, 5] 两个数都比 2 大</b> →
        一次进账 <b>2</b> 对:(3,2)、(5,2)。累计 = 2。
      </>
    ),
  ),
  iframe(
    ["lit", undefined, "ok", undefined],
    [
      { i: 0, label: "i" },
      { i: 3, label: "j" },
    ],
    <>比 3 与 4:3 更小,输出 3 —— 左边的数先出,不产生逆序对。累计仍 = 2。</>,
  ),
  iframe(
    [undefined, "bad", undefined, "lit"],
    [
      { i: 1, label: "i" },
      { i: 3, label: "j" },
    ],
    (
      <>
        比 5 与 4:4 更小,先输出 4。左半还剩 [5] 比 4 大 → 再进账 <b>1</b> 对:(5,4)。累计 = <b>3</b>。
      </>
    ),
  ),
  iframe(
    [undefined, "ok", undefined, undefined],
    [{ i: 1, label: "i" }],
    (
      <>
        输出 5,合并完成。跨越逆序对 = <b>3</b>。关键:每次从右半取数,<b>左半剩几个就一次加几个</b> ——
        靠有序省掉逐对比较,总复杂度仍是 O(n log n)。
      </>
    ),
  ),
];

export function InversionLab() {
  return <ArrayStepper title="归并的副产品:合并时数出跨越两半的逆序对" frames={INV_FRAMES} cellW={56} />;
}
