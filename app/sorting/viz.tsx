"use client";

// Chapter 1 · Sorting-specific visualizations. The signature device here is the
// slow-motion bar chart:
//  - SortLab: the bar-chart sorting lab —— one data set, freely switchable between
//    bubble, selection and insertion sort, showing the three actions (compare, swap,
//    settled) frame by frame. The core hand-built component.
//  - PartitionDemo: quicksort's partition step by step (Lomuto), reusing ArrayStepper
//    from lib/stepper.
//  - MergeDemo: the heart of merge sort —— the three-pointer merge of two sorted runs,
//    frame by frame.
//  - CountingDemo: counting sort —— no magnitude comparisons at all, just tallying,
//    which is how it breaks the comparison-sort lower bound.
//  - StabilityDemo: stable vs unstable —— whether the relative order of equal-key
//    elements survives.
//  - sortRace1Verdict / sortRace2Verdict / sortRace3Verdict: the readings under the
//    three algorithm races in §05, written against the measured counts.
//
// Bilingual: frame narration is written inline as <T en zh />; titles, buttons,
// legends and pointer labels take { en, zh } and are resolved with useL() inside the
// component. A frame's narration must match the array state that frame actually
// renders.

import { useState, type ReactNode } from "react";
import { T, useL, type Loc } from "@/lib/i18n";
import { useStepper, StepControls, ArrayStepper, type ArrayFrame } from "@/lib/stepper";
import type { LaneResult, RaceCounts } from "@/lib/race-core";

/* ==================================================================
   SortLab —— the bar-chart sorting lab (bubble / selection / insertion)
   ================================================================== */

type BarState = "idle" | "cmp" | "swap" | "sorted" | "key" | "min";

interface BarFrame {
  arr: number[];
  states: BarState[];
  msg: ReactNode;
}

const BASE = [5, 2, 9, 1, 6]; // 5 values, maxV = 9, which keeps the frame count reasonable
const MAXV = 9;

/* Bubble sort: swap any adjacent inversion, so large values bubble to the right.
   Exported for test/unit/sorting-race-verdicts.test.tsx, which replays the rounds. */
export function bubbleFrames(): BarFrame[] {
  const a = [...BASE];
  const n = a.length;
  const sorted = new Set<number>();
  const frames: BarFrame[] = [];
  const snap = (mark: Record<number, BarState>, msg: ReactNode) =>
    frames.push({
      arr: [...a],
      states: a.map((_, i) => (sorted.has(i) ? "sorted" : mark[i] ?? "idle")),
      msg,
    });

  snap(
    {},
    <T
      en={
        <>
          Bubble sort. Each round scans from left to right and swaps any two
          neighbors that are in the wrong order, so the largest remaining value
          is carried to the right end. Green marks values that are already in
          their <b>final position</b>.
        </>
      }
      zh={
        <>
          冒泡排序。每一轮从左扫到右,把顺序不对的相邻两个交换,
          于是剩下的最大值被一路带到最右端。绿色表示已经落在<b>最终位置</b>上的值。
        </>
      }
    />,
  );
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      const gt = a[j] > a[j + 1];
      const x = a[j];
      const y = a[j + 1];
      snap(
        { [j]: "cmp", [j + 1]: "cmp" },
        <T
          en={
            <>
              Compare <b>{x}</b> and <b>{y}</b>:{" "}
              {gt ? (
                <>
                  {x} &gt; {y}, so they are in the wrong order. Swap them.
                </>
              ) : (
                <>
                  {x} ≤ {y}, so the order is already correct. Nothing moves.
                </>
              )}
            </>
          }
          zh={
            <>
              比较 <b>{x}</b> 与 <b>{y}</b>:
              {gt ? (
                <>
                  {x} &gt; {y},顺序不对,交换。
                </>
              ) : (
                <>
                  {x} ≤ {y},顺序已经正确,什么都不动。
                </>
              )}
            </>
          }
        />,
      );
      if (gt) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        snap(
          { [j]: "swap", [j + 1]: "swap" },
          <T
            en={
              <>
                Swapped. The larger value <b>{a[j + 1]}</b> moved one position to
                the right.
              </>
            }
            zh={
              <>
                交换完成。较大的 <b>{a[j + 1]}</b> 往右挪了一格。
              </>
            }
          />,
        );
      }
    }
    const settled = a[n - 1 - i];
    sorted.add(n - 1 - i);
    snap(
      {},
      <T
        en={
          <>
            Round {i + 1} is finished: <b>{settled}</b> has reached its final
            position (green) and will not move again.
            {!swapped && (
              <>
                {" "}
                This round performed no swaps at all, which means the whole array
                is already sorted, so the algorithm stops here.
              </>
            )}
          </>
        }
        zh={
          <>
            第 {i + 1} 轮结束:<b>{settled}</b> 已到达最终位置(标绿),不会再动。
            {!swapped && <> 本轮一次交换都没有,说明整个数组已经有序,算法就此停止。</>}
          </>
        }
      />,
    );
    if (!swapped) {
      for (let k = 0; k <= n - 1 - i; k++) sorted.add(k);
      break;
    }
  }
  sorted.add(0);
  snap(
    {},
    <T
      en={
        <>
          Everything is in place. The early-exit flag is what gives bubble sort
          its best case: on an already sorted array the first round finds no
          swap and the cost is <b>O(n)</b>. Average and worst case are still
          O(n²).
        </>
      }
      zh={
        <>
          全部就位。提前退出的标志位正是冒泡最好情况的来源:
          输入已有序时,第一轮就找不到任何交换,代价是 <b>O(n)</b>。
          平均和最坏情况仍然是 O(n²)。
        </>
      }
    />,
  );
  return frames;
}

/* Selection sort: each round picks the minimum and swaps it to the front */
function selectionFrames(): BarFrame[] {
  const a = [...BASE];
  const n = a.length;
  const sorted = new Set<number>();
  const frames: BarFrame[] = [];
  const snap = (mark: Record<number, BarState>, msg: ReactNode) =>
    frames.push({
      arr: [...a],
      states: a.map((_, i) => (sorted.has(i) ? "sorted" : mark[i] ?? "idle")),
      msg,
    });

  snap(
    {},
    <T
      en={
        <>
          Selection sort. Each round finds the smallest value in the unsorted
          part and swaps it to the front of that part, so the green prefix grows
          by one every round. Green marks values that are in their{" "}
          <b>final position</b>.
        </>
      }
      zh={
        <>
          选择排序。每一轮在未排序区里找出最小值,把它换到该区的最前面,
          于是绿色前缀每轮长一格。绿色表示已在<b>最终位置</b>上的值。
        </>
      }
    />,
  );
  for (let i = 0; i < n - 1; i++) {
    let m = i;
    const first = a[i];
    snap(
      { [i]: "min" },
      <T
        en={
          <>
            Round {i + 1}. Assume the first value of the unsorted part,{" "}
            <b>{first}</b> (yellow), is the smallest, then scan everything to its
            right to check.
          </>
        }
        zh={
          <>
            第 {i + 1} 轮。先假设未排序区的第一个值 <b>{first}</b>(黄色)最小,
            再扫描它右边的全部元素来验证。
          </>
        }
      />,
    );
    for (let j = i + 1; j < n; j++) {
      const smaller = a[j] < a[m];
      const cand = a[m];
      const cur = a[j];
      snap(
        { [m]: "min", [j]: "cmp" },
        <T
          en={
            <>
              Compare the current smallest <b>{cand}</b> with <b>{cur}</b>:{" "}
              {smaller ? (
                <>{cur} is smaller, so it becomes the new candidate.</>
              ) : (
                <>{cur} is not smaller, so the candidate stays and the scan goes on.</>
              )}
            </>
          }
          zh={
            <>
              比较当前最小值 <b>{cand}</b> 与 <b>{cur}</b>:
              {smaller ? (
                <>{cur} 更小,它成为新的候选。</>
              ) : (
                <>{cur} 不比它小,候选不变,继续扫描。</>
              )}
            </>
          }
        />,
      );
      if (smaller) {
        m = j;
        snap(
          { [m]: "min" },
          <T
            en={
              <>
                The smallest value found so far is now <b>{a[m]}</b>, at index{" "}
                {m}.
              </>
            }
            zh={
              <>
                目前找到的最小值变成 <b>{a[m]}</b>,位于下标 {m}。
              </>
            }
          />,
        );
      }
    }
    if (m !== i) {
      [a[i], a[m]] = [a[m], a[i]];
      snap(
        { [i]: "swap", [m]: "swap" },
        <T
          en={
            <>
              One swap moves the smallest value <b>{a[i]}</b> to index {i}. Note
              how far it jumped — this long swap is the reason selection sort is
              not stable.
            </>
          }
          zh={
            <>
              一次交换就把最小值 <b>{a[i]}</b> 送到下标 {i}。
              注意它跨越的距离 —— 这次长距离交换正是选择排序不稳定的原因。
            </>
          }
        />,
      );
    }
    sorted.add(i);
    snap(
      {},
      <T
        en={
          <>
            Index {i} is settled: it holds <b>{a[i]}</b> (green).
          </>
        }
        zh={
          <>
            下标 {i} 敲定了,它的值是 <b>{a[i]}</b>(标绿)。
          </>
        }
      />,
    );
  }
  sorted.add(n - 1);
  snap(
    {},
    <T
      en={
        <>
          The last element is correct automatically. Selection sort always makes
          about n²/2 comparisons, whatever the input looks like, so best,
          average, and worst are all O(n²). It does perform at most n−1 swaps,
          which is the fewest of the three. It is <b>not stable</b>: a long swap
          can move a value past another value equal to it.
        </>
      }
      zh={
        <>
          最后一个元素自动正确。无论输入长什么样,选择排序的比较次数恒为约 n²/2,
          所以最好、平均、最坏都是 O(n²)。但它的交换次数至多 n−1 次,是三者中最少的。
          它<b>不稳定</b>:一次长距离交换可能把某个值挪到与它相等的另一个值前面。
        </>
      }
    />,
  );
  return frames;
}

/* Insertion sort: draw a card and insert it into the already sorted hand */
function insertionFrames(): BarFrame[] {
  const a = [...BASE];
  const n = a.length;
  const frames: BarFrame[] = [];
  const snap = (mark: Record<number, BarState>, sortedUpto: number, msg: ReactNode) =>
    frames.push({
      arr: [...a],
      states: a.map((_, i) => mark[i] ?? (i <= sortedUpto ? "sorted" : "idle")),
      msg,
    });

  frames.push({
    arr: [...a],
    states: a.map((_, i) => (i === 0 ? "sorted" : "idle")),
    msg: (
      <T
        en={
          <>
            Insertion sort. Treat the first card as a hand that is already
            sorted, then take the next card and slide it into the right place in
            that hand. Green here means only{" "}
            <b>these values are sorted relative to each other</b> — a smaller
            card drawn later will still be inserted between them, so green is{" "}
            <b>not</b> a final position.
          </>
        }
        zh={
          <>
            插入排序。把第一张牌看作一手已排好的牌,然后摸起下一张,
            插到这手牌里正确的位置。这里的绿色只表示
            <b>这几个值彼此之间已有序</b> —— 后面摸到更小的牌仍会插进它们中间,
            所以绿色<b>不是</b>最终位置。
          </>
        }
      />
    ),
  });
  for (let i = 1; i < n; i++) {
    const key = a[i];
    snap(
      { [i]: "key" },
      i - 1,
      <T
        en={
          <>
            Pick up the card at index {i}, the value <b>{key}</b> (blue). Hold it
            aside; it has to go into the sorted hand on its left.
          </>
        }
        zh={
          <>
            摸起下标 {i} 的牌,值是 <b>{key}</b>(蓝色)。先把它拿在手上,
            它要插进左边那手已排好的牌里。
          </>
        }
      />,
    );
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      const bigger = a[j];
      snap(
        { [j]: "cmp", [j + 1]: "key" },
        i - 1,
        <T
          en={
            <>
              <b>{bigger}</b> &gt; <b>{key}</b>, so {bigger} moves one step right
              to make room. The blue slot is the gap; the number drawn in it is a
              stale copy that will be overwritten once {key} lands.
            </>
          }
          zh={
            <>
              <b>{bigger}</b> &gt; <b>{key}</b>,所以 {bigger} 右移一格腾出空位。
              蓝色格就是那个空位;里面显示的数字是移动留下的旧副本,
              等 {key} 落位时会被覆盖。
            </>
          }
        />,
      );
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
    snap(
      { [j + 1]: "swap" },
      i,
      <T
        en={
          <>
            The held value <b>{key}</b> lands at index {j + 1}. The first{" "}
            {i + 1} values are sorted again.
          </>
        }
        zh={
          <>
            手上的 <b>{key}</b> 落到下标 {j + 1}。前 {i + 1} 个值重新有序。
          </>
        }
      />,
    );
  }
  snap(
    {},
    n - 1,
    <T
      en={
        <>
          Every card has been inserted. If the input is already nearly sorted,
          almost no value has to be shifted, the inner loop stops immediately,
          and the total cost drops to <b>O(n)</b>. That is why TimSort uses
          insertion sort for its short runs.
        </>
      }
      zh={
        <>
          所有牌都插完了。如果输入近乎有序,几乎不需要挪动任何值,
          内层循环立刻停止,总代价降到 <b>O(n)</b>。
          这正是 TimSort 用插入排序处理短片段的原因。
        </>
      }
    />,
  );
  return frames;
}

const ALGO = {
  bubble: {
    label: { en: "Bubble sort", zh: "冒泡排序" } as Loc<string>,
    frames: bubbleFrames(),
  },
  selection: {
    label: { en: "Selection sort", zh: "选择排序" } as Loc<string>,
    frames: selectionFrames(),
  },
  insertion: {
    label: { en: "Insertion sort", zh: "插入排序" } as Loc<string>,
    frames: insertionFrames(),
  },
} as const;

type AlgoId = keyof typeof ALGO;

function Bar({ v, state, idx }: { v: number; state: BarState; idx: number }) {
  const h = 26 + (v / MAXV) * 140;
  return (
    <div className="srt-bar" data-state={state} style={{ height: h }}>
      <span className="srt-bar-v">{v}</span>
      <span className="cell-idx">{idx}</span>
    </div>
  );
}

function SortRunner({ frames }: { frames: BarFrame[] }) {
  const stepper = useStepper(frames.length);
  const f = frames[stepper.step];
  return (
    <>
      <div className="viz-stage" style={{ overflowX: "auto" }}>
        <div className="srt-bars">
          {f.arr.map((v, i) => (
            <Bar key={i} v={v} state={f.states[i]} idx={i} />
          ))}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </>
  );
}

export function SortLab() {
  const [algo, setAlgo] = useState<AlgoId>("bubble");
  const L = useL();
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Bar chart sorting lab — the same data [5, 2, 9, 1, 6], three O(n²) sorts"
          zh="条形图排序实验室 —— 同一组数据 [5, 2, 9, 1, 6],三种 O(n²) 排法"
        />
      </div>
      <div className="srt-algo-tabs">
        {(Object.keys(ALGO) as AlgoId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`btn btn-sm${algo === id ? " btn-primary" : ""}`}
            onClick={() => setAlgo(id)}
          >
            {L(ALGO[id].label)}
          </button>
        ))}
      </div>
      <div className="srt-legend" aria-hidden>
        <span>
          <i className="srt-sw" data-state="cmp" />
          <T en="being compared" zh="正在比较" />
        </span>
        <span>
          <i className="srt-sw" data-state="swap" />
          <T en="just swapped or placed" zh="刚交换或刚落位" />
        </span>
        <span>
          <i className="srt-sw" data-state="min" />
          <T en="smallest so far" zh="当前最小候选" />
        </span>
        <span>
          <i className="srt-sw" data-state="key" />
          <T en="card held in hand" zh="手里拿着的牌" />
        </span>
        <span>
          <i className="srt-sw" data-state="sorted" />
          <T en="sorted region" zh="已排好的区间" />
        </span>
      </div>
      {/* Changing key forces a remount, which resets playback to the first frame */}
      <SortRunner key={algo} frames={ALGO[algo].frames} />
    </div>
  );
}

/* ==================================================================
   PartitionDemo —— quicksort's partition (Lomuto), frame by frame
   ================================================================== */

function partitionFrames(): ArrayFrame[] {
  const a = [6, 2, 8, 1, 9, 3, 5];
  const n = a.length;
  const pivot = a[n - 1];
  let i = -1;
  const frames: ArrayFrame[] = [];

  const snap = (curJ: number | null, msg: ReactNode, finalPivot?: number) =>
    frames.push({
      cells: a.map((v, idx) => {
        if (finalPivot !== undefined && idx === finalPivot) return { v, state: "ok" as const };
        if (idx === n - 1 && finalPivot === undefined) return { v, state: "bad" as const };
        if (idx <= i) return { v, state: "ok" as const };
        if (idx === curJ) return { v, state: "lit" as const };
        return { v };
      }),
      ptrs: [
        // Pointer labels must be narrower than cellW (54px), or adjacent i / j labels collide
        ...(i >= 0 ? [{ i, label: { en: "i·edge", zh: "i·边界" } }] : []),
        ...(curJ !== null ? [{ i: curJ, label: { en: "j·scan", zh: "j·扫描" } }] : []),
        ...(finalPivot === undefined
          ? [{ i: n - 1, label: { en: "pivot", zh: "基准" } }]
          : []),
      ],
      msg,
    });

  snap(
    null,
    <T
      en={
        <>
          The last value, <b>{pivot}</b>, is the pivot (red). Goal: move every
          value &lt; {pivot} to the left and leave every value ≥ {pivot} on the
          right. Pointer <b>i</b> marks the right edge of the &quot;smaller than
          pivot&quot; region and starts at −1, meaning that region is empty.
          Pointer <b>j</b> scans from left to right.
        </>
      }
      zh={
        <>
          最后一个值 <b>{pivot}</b> 是基准(红色)。目标:把所有 &lt; {pivot}{" "}
          的值挪到左边,所有 ≥ {pivot} 的值留在右边。指针 <b>i</b>{" "}
          标记「小于基准」那一段的右边界,初值 −1,表示这一段还是空的。
          指针 <b>j</b> 从左往右扫。
        </>
      }
    />,
  );
  for (let j = 0; j < n - 1; j++) {
    const less = a[j] < pivot;
    const v = a[j];
    snap(
      j,
      <T
        en={
          <>
            j reaches <b>{v}</b>:{" "}
            {less ? (
              <>
                {v} &lt; {pivot}, so it belongs to the left region.
              </>
            ) : (
              <>
                {v} ≥ {pivot}, so it stays where it is and i does not move.
              </>
            )}
          </>
        }
        zh={
          <>
            j 扫到 <b>{v}</b>:
            {less ? (
              <>
                {v} &lt; {pivot},它属于左边那一段。
              </>
            ) : (
              <>
                {v} ≥ {pivot},它留在原地,i 不动。
              </>
            )}
          </>
        }
      />,
    );
    if (less) {
      i++;
      if (i !== j) {
        const moved = a[j];
        [a[i], a[j]] = [a[j], a[i]];
        snap(
          j,
          <T
            en={
              <>
                i advances to {i}, and <b>{moved}</b> is swapped into the left
                region (exchanged with the value at index {i}).
              </>
            }
            zh={
              <>
                i 前进到 {i},<b>{moved}</b> 被换进左边那一段
                (与下标 {i} 上的值交换)。
              </>
            }
          />,
        );
      } else {
        snap(
          j,
          <T
            en={
              <>
                i advances to {i}, which is exactly where j is, so the swap
                exchanges the value with itself and nothing moves.
              </>
            }
            zh={
              <>
                i 前进到 {i},恰好就是 j 所在的位置,
                所以这次交换是自己和自己换,什么都没动。
              </>
            }
          />,
        );
      }
    }
  }
  const p = i + 1;
  [a[p], a[n - 1]] = [a[n - 1], a[p]];
  snap(
    null,
    <T
      en={
        <>
          The scan is over. Last step: swap the pivot <b>{pivot}</b> into index
          i+1 = {p}, the boundary between the two regions.
        </>
      }
      zh={
        <>
          扫描结束。最后一步:把基准 <b>{pivot}</b> 换到下标 i+1 = {p},
          也就是两段之间的分界处。
        </>
      }
    />,
    p,
  );
  frames.push({
    cells: a.map((v, idx) => ({
      v,
      state: idx === p ? ("ok" as const) : idx < p ? ("lit" as const) : undefined,
    })),
    msg: (
      <T
        en={
          <>
            Done. The pivot <b>{pivot}</b> is at index {p}, everything to its
            left is &lt; {pivot}, and everything to its right is ≥ {pivot}. That
            index is where {pivot} belongs in the fully sorted array, so it never
            moves again. Quicksort now partitions the left part and the right
            part separately.
          </>
        }
        zh={
          <>
            完成。基准 <b>{pivot}</b> 位于下标 {p},它左边全部 &lt; {pivot},
            右边全部 ≥ {pivot}。这个下标就是 {pivot} 在完全有序数组里的位置,
            所以它再也不会移动。接下来快排分别对左右两段继续划分。
          </>
        }
      />
    ),
  });
  return frames;
}

const PARTITION_FRAMES = partitionFrames();

export function PartitionDemo() {
  return (
    <ArrayStepper
      title={{
        en: "Quicksort partition, step by step (Lomuto scheme, pivot = 5)",
        zh: "快排 partition 逐帧(Lomuto 方案,基准 = 5)",
      }}
      frames={PARTITION_FRAMES}
      cellW={54}
    />
  );
}

/* ==================================================================
   MergeDemo —— the heart of merge sort: the three-pointer merge of two sorted runs
   ================================================================== */

const MERGE_L = [1, 4, 7];
const MERGE_R = [2, 3, 8];

interface MergeFrame {
  li: number;
  rj: number;
  out: number[];
  pick: "L" | "R" | null;
  msg: ReactNode;
}

function mergeFrames(): MergeFrame[] {
  const L = MERGE_L;
  const R = MERGE_R;
  const frames: MergeFrame[] = [];
  const out: number[] = [];
  let i = 0;
  let j = 0;
  frames.push({
    li: 0,
    rj: 0,
    out: [],
    pick: null,
    msg: (
      <T
        en={
          <>
            Both runs are already sorted: left = [1, 4, 7], right = [2, 3, 8].
            Put one pointer at the start of each run. At every step, take the
            smaller of the two values the pointers refer to and append it to the
            output.
          </>
        }
        zh={
          <>
            两段各自已经有序:左段 = [1, 4, 7],右段 = [2, 3, 8]。
            各在段首放一个指针。每一步取两个指针所指值中较小的那个,追加到结果里。
          </>
        }
      />
    ),
  });
  while (i < L.length && j < R.length) {
    const lv = L[i];
    const rv = R[j];
    if (lv <= rv) {
      out.push(lv);
      frames.push({
        li: i,
        rj: j,
        out: [...out],
        pick: "L",
        msg: (
          <T
            en={
              <>
                Compare <b>{lv}</b> and <b>{rv}</b>: the left value is smaller
                (and on a tie the left value is taken, which is what makes merge
                sort stable). Append <b>{lv}</b> and advance the left pointer.
              </>
            }
            zh={
              <>
                比较 <b>{lv}</b> 与 <b>{rv}</b>:左边更小
                (相等时也取左边,这正是归并保持稳定的原因)。
                把 <b>{lv}</b> 追加到结果,左指针右移。
              </>
            }
          />
        ),
      });
      i++;
    } else {
      out.push(rv);
      frames.push({
        li: i,
        rj: j,
        out: [...out],
        pick: "R",
        msg: (
          <T
            en={
              <>
                Compare <b>{lv}</b> and <b>{rv}</b>: the right value is smaller.
                Append <b>{rv}</b> and advance the right pointer.
              </>
            }
            zh={
              <>
                比较 <b>{lv}</b> 与 <b>{rv}</b>:右边更小。
                把 <b>{rv}</b> 追加到结果,右指针右移。
              </>
            }
          />
        ),
      });
      j++;
    }
  }
  while (i < L.length) {
    const lv = L[i];
    out.push(lv);
    frames.push({
      li: i,
      rj: j,
      out: [...out],
      pick: "L",
      msg: (
        <T
          en={
            <>
              The right run is empty, so the remaining left value <b>{lv}</b> is
              copied across with no comparison needed.
            </>
          }
          zh={
            <>
              右段已空,左段剩下的 <b>{lv}</b> 无需比较,直接搬过来。
            </>
          }
        />
      ),
    });
    i++;
  }
  while (j < R.length) {
    const rv = R[j];
    out.push(rv);
    frames.push({
      li: i,
      rj: j,
      out: [...out],
      pick: "R",
      msg: (
        <T
          en={
            <>
              The left run is empty, so the remaining right value <b>{rv}</b> is
              copied across with no comparison needed.
            </>
          }
          zh={
            <>
              左段已空,右段剩下的 <b>{rv}</b> 无需比较,直接搬过来。
            </>
          }
        />
      ),
    });
    j++;
  }
  frames.push({
    li: i,
    rj: j,
    out: [...out],
    pick: null,
    msg: (
      <T
        en={
          <>
            Merged: [1, 2, 3, 4, 7, 8]. Each pointer moved forward only, and each
            value was read once, so merging two runs of total length n costs{" "}
            <b>O(n)</b>.
          </>
        }
        zh={
          <>
            合并完成:[1, 2, 3, 4, 7, 8]。两个指针都只向前走,每个值只被读一次,
            所以合并总长为 n 的两段是 <b>O(n)</b>。
          </>
        }
      />
    ),
  });
  return frames;
}

const MERGE_FRAMES = mergeFrames();

function MiniCells({ vals, mark }: { vals: number[]; mark: (i: number) => string }) {
  return (
    <div className="srt-cells">
      {vals.length === 0 ? (
        <div className="cell ghost" style={{ width: 44, height: 44, opacity: 0.35 }}>·</div>
      ) : (
        vals.map((v, i) => (
          <div key={i} className={`cell${mark(i) ? ` ${mark(i)}` : ""}`} style={{ width: 44, height: 44 }}>
            {v}
          </div>
        ))
      )}
    </div>
  );
}

export function MergeDemo() {
  const stepper = useStepper(MERGE_FRAMES.length);
  const f = MERGE_FRAMES[stepper.step];
  const liShown = Math.min(f.li, MERGE_L.length - 1);
  const rjShown = Math.min(f.rj, MERGE_R.length - 1);
  const lEmpty = f.li >= MERGE_L.length;
  const rEmpty = f.rj >= MERGE_R.length;
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="The core of merge sort — merging two sorted runs with three pointers"
          zh="归并的核心 —— 两个有序段的三指针合并"
        />
      </div>
      <div className="viz-stage">
        <div className="srt-rows">
          <div className="srt-row">
            <span className="srt-row-lab">
              <T
                en={<>Left run L (i = {liShown}{lEmpty ? " · empty" : ""})</>}
                zh={<>左段 L(指针 i = {liShown}{lEmpty ? " · 已空" : ""})</>}
              />
            </span>
            <MiniCells vals={MERGE_L} mark={(i) => (i < f.li ? "ghost" : i === f.li && f.li < MERGE_L.length ? (f.pick === "L" ? "ok" : "lit") : "")} />
          </div>
          <div className="srt-row">
            <span className="srt-row-lab">
              <T
                en={<>Right run R (j = {rjShown}{rEmpty ? " · empty" : ""})</>}
                zh={<>右段 R(指针 j = {rjShown}{rEmpty ? " · 已空" : ""})</>}
              />
            </span>
            <MiniCells vals={MERGE_R} mark={(i) => (i < f.rj ? "ghost" : i === f.rj && f.rj < MERGE_R.length ? (f.pick === "R" ? "ok" : "lit") : "")} />
          </div>
          <div className="srt-row">
            <span className="srt-row-lab">
              <T en="Merged output (sorted)" zh="合并结果(有序输出)" />
            </span>
            <MiniCells vals={f.out} mark={(i) => (i === f.out.length - 1 && f.pick ? "ok" : "")} />
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={MERGE_FRAMES.length} />
    </div>
  );
}

/* ==================================================================
   CountingDemo —— counting sort: no comparisons, only tallying
   ================================================================== */

const COUNT_IN = [2, 4, 2, 0, 3, 0];
const COUNT_MAX = 4;

interface CountFrame {
  counts: number[];
  litIn: number | null; // index in the input currently being tallied
  litBucket: number | null; // the highlighted bucket
  out: (number | null)[];
  msg: ReactNode;
}

function countingFrames(): CountFrame[] {
  const frames: CountFrame[] = [];
  const counts = Array(COUNT_MAX + 1).fill(0);
  frames.push({
    counts: [...counts],
    litIn: null,
    litBucket: null,
    out: [],
    msg: (
      <T
        en={
          <>
            Counting sort. Every value here is an integer between 0 and 4, so
            five buckets are enough. Phase one: walk the input and count how many
            times each value appears. No two elements are ever compared.
          </>
        }
        zh={
          <>
            计数排序。这里每个值都是 0 到 4 之间的整数,所以 5 个桶就够了。
            第一阶段:走一遍输入,数出每个值出现了多少次。全程不比较任何两个元素。
          </>
        }
      />
    ),
  });
  // Counting phase
  for (let i = 0; i < COUNT_IN.length; i++) {
    const v = COUNT_IN[i];
    counts[v]++;
    const c = counts[v];
    frames.push({
      counts: [...counts],
      litIn: i,
      litBucket: v,
      out: [],
      msg: (
        <T
          en={
            <>
              Input index {i} holds <b>{v}</b>, so bucket {v} goes up by one and
              is now {c}.
            </>
          }
          zh={
            <>
              输入下标 {i} 处是 <b>{v}</b>,于是 {v} 号桶加一,现在是 {c}。
            </>
          }
        />
      ),
    });
  }
  frames.push({
    counts: [...counts],
    litIn: null,
    litBucket: null,
    out: [],
    msg: (
      <T
        en={
          <>
            Counting is finished: buckets = [{counts.join(", ")}]. Read as: 0
            appears twice, 1 never appears, 2 appears twice, and 3 and 4 appear
            once each.
          </>
        }
        zh={
          <>
            数完了:桶 = [{counts.join(", ")}]。读作:0 出现 2 次,1 一次也没出现,
            2 出现 2 次,3 和 4 各出现 1 次。
          </>
        }
      />
    ),
  });
  // Rebuild phase
  const out: (number | null)[] = [];
  for (let b = 0; b <= COUNT_MAX; b++) {
    for (let c = 0; c < counts[b]; c++) {
      out.push(b);
      const total = counts[b];
      frames.push({
        counts: [...counts],
        litIn: null,
        litBucket: b,
        out: [...out],
        msg: (
          <T
            en={
              <>
                Phase two: walk the buckets from low to high. Bucket {b} holds{" "}
                {total}, so write out <b>{b}</b>.
              </>
            }
            zh={
              <>
                第二阶段:从小到大走过每个桶。{b} 号桶的计数是 {total},
                所以写出一个 <b>{b}</b>。
              </>
            }
          />
        ),
      });
    }
  }
  frames.push({
    counts: [...counts],
    litIn: null,
    litBucket: null,
    out: [...out],
    msg: (
      <T
        en={
          <>
            The output [{out.join(", ")}] is fully sorted. The input was read
            once and the buckets were read once, so the cost is <b>O(n + k)</b>,
            where k is the size of the value range. Two conditions made this
            work: the keys are integers, and their range is known and small. This
            simple version rebuilds the values from the counts, so it is{" "}
            <b>not stable</b>.
          </>
        }
        zh={
          <>
            输出 [{out.join(", ")}] 已完全有序。输入读了一遍,桶读了一遍,
            所以代价是 <b>O(n + k)</b>,k 是值域大小。
            这招能成立靠两个条件:键是整数,且值域已知且不大。
            这个简单版本是按计数把值重新造出来的,所以它<b>不稳定</b>。
          </>
        }
      />
    ),
  });
  return frames;
}

const COUNT_FRAMES = countingFrames();

export function CountingDemo() {
  const stepper = useStepper(COUNT_FRAMES.length);
  const f = COUNT_FRAMES[stepper.step];
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Counting sort — count into buckets, never compare"
          zh="计数排序 —— 用桶数数,不比较大小"
        />
      </div>
      <div className="viz-stage">
        <div className="srt-rows">
          <div className="srt-row">
            <span className="srt-row-lab">
              <T en="Input array" zh="输入数组" />
            </span>
            <div className="srt-cells">
              {COUNT_IN.map((v, i) => (
                <div key={i} className={`cell${f.litIn === i ? " lit" : ""}`} style={{ width: 44, height: 44 }}>
                  {v}
                </div>
              ))}
            </div>
          </div>
          <div className="srt-row">
            <span className="srt-row-lab">
              <T
                en="Count buckets · inside = how many, below = which value"
                zh="计数桶 · 格内是次数,下方是值"
              />
            </span>
            <div className="srt-cells">
              {f.counts.map((c, b) => (
                <div key={b} className="srt-bucket">
                  <div className={`cell${f.litBucket === b ? " lit" : c > 0 ? " ok" : " ghost"}`} style={{ width: 44, height: 44 }}>
                    {c}
                  </div>
                  <span className="srt-bucket-lab">{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="srt-row">
            <span className="srt-row-lab">
              <T en="Output being rebuilt" zh="重建输出" />
            </span>
            <div className="srt-cells">
              {f.out.length === 0 ? (
                <div className="cell ghost" style={{ width: 44, height: 44, opacity: 0.35 }}>·</div>
              ) : (
                f.out.map((v, i) => (
                  <div key={i} className={`cell${i === f.out.length - 1 ? " ok" : ""}`} style={{ width: 44, height: 44 }}>
                    {v}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={COUNT_FRAMES.length} />
    </div>
  );
}

/* ==================================================================
   StabilityDemo —— stable vs unstable
   ================================================================== */

// Each card: key = the sort key (what the first sort orders by), tag = its original
// position number (so it can be tracked by eye).
// hue follows key, which makes it easy to see which of two same-key cards ends up
// first after sorting.
interface Card {
  key: number;
  tag: string;
  hue: "a" | "b" | "c";
}

const CARDS: Card[] = [
  { key: 3, tag: "①", hue: "a" },
  { key: 1, tag: "②", hue: "b" },
  { key: 3, tag: "③", hue: "a" },
  { key: 1, tag: "④", hue: "b" },
  { key: 2, tag: "⑤", hue: "c" },
];

// Stable: equal keys keep their original order → ascending by tag. Unstable: the order of equal keys is disturbed (demonstrated here by reversing it).
const STABLE = [...CARDS].sort((a, b) => a.key - b.key || a.tag.localeCompare(b.tag));
const UNSTABLE = [...CARDS].sort((a, b) => a.key - b.key || b.tag.localeCompare(a.tag));

function CardRow({ cards }: { cards: Card[] }) {
  return (
    <div className="srt-stab">
      {cards.map((c, i) => (
        <div key={i} className="srt-chip" data-hue={c.hue}>
          <span className="k">{c.key}</span>
          <span className="tag">{c.tag}</span>
        </div>
      ))}
    </div>
  );
}

export function StabilityDemo() {
  const [mode, setMode] = useState<"orig" | "stable" | "unstable">("orig");
  const cards = mode === "orig" ? CARDS : mode === "stable" ? STABLE : UNSTABLE;
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Stability — do elements with the same key keep their original order?"
          zh="稳定性 —— 键相同的元素,排完还保持原来的先后吗?"
        />
      </div>
      <div className="srt-algo-tabs">
        <button type="button" className={`btn btn-sm${mode === "orig" ? " btn-primary" : ""}`} onClick={() => setMode("orig")}>
          <T en="Original order" zh="原始顺序" />
        </button>
        <button type="button" className={`btn btn-sm${mode === "stable" ? " btn-primary" : ""}`} onClick={() => setMode("stable")}>
          <T en="After a stable sort" zh="稳定排序的结果" />
        </button>
        <button type="button" className={`btn btn-sm${mode === "unstable" ? " btn-primary" : ""}`} onClick={() => setMode("unstable")}>
          <T en="After an unstable sort" zh="不稳定排序的结果" />
        </button>
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 8 }}>
        <CardRow cards={cards} />
      </div>
      <div className="srt-stab-note" aria-live="polite">
        {mode === "orig" ? (
          <T
            en={
              <>
                The large number is the sort key. The small circled number ①–⑤ is
                the original position. Now sort by key, and watch the two cards
                with key = 1 (② and ④) and the two with key = 3 (① and ③).
              </>
            }
            zh={
              <>
                大数字是排序键,小圈号 ①–⑤ 是原始位置。
                现在按键排序,盯住两张 key = 1 的牌(② 和 ④)和两张 key = 3 的牌(① 和 ③)。
              </>
            }
          />
        ) : mode === "stable" ? (
          <T
            en={
              <>
                Stable: among cards with the same key, ② is still before ④ and ①
                is still before ③. The original order is preserved. Merge sort
                behaves this way by construction.
              </>
            }
            zh={
              <>
                稳定:键相同的牌里,② 仍在 ④ 之前,① 仍在 ③ 之前,原有顺序被保留。
                归并排序在写法上天然就是这样。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                Not stable: among cards with the same key the order changed — ④
                is now before ②. Quicksort and heap sort can produce this,
                because both move elements across long distances.
              </>
            }
            zh={
              <>
                不稳定:键相同的牌顺序变了 —— ④ 现在排到了 ② 前面。
                快排和堆排都可能出现这种结果,因为它们都会做长距离的元素移动。
              </>
            }
          />
        )}
      </div>
    </div>
  );
}

/* ==================================================================
   IntervalsDemo —— LC 56 merge intervals: sort, then a single linear scan
   ================================================================== */

const IVS: [number, number][] = [
  [1, 3],
  [2, 6],
  [8, 10],
  [15, 18],
];
const IV_SCALE = 19;

interface IvFrame {
  curIdx: number | null; // the input interval currently under inspection
  merged: [number, number][]; // segments already finalized
  cur: [number, number] | null; // the segment currently being merged into
  msg: ReactNode;
}

function intervalFrames(): IvFrame[] {
  const frames: IvFrame[] = [];
  frames.push({
    curIdx: null,
    merged: [],
    cur: null,
    msg: (
      <T
        en={
          <>
            First sort by left endpoint: [1,3] [2,6] [8,10] [15,18]. Sorting
            guarantees that intervals which can be merged end up next to each
            other, so one linear scan is enough.
          </>
        }
        zh={
          <>
            先按左端点排序:[1,3] [2,6] [8,10] [15,18]。
            排序保证了能合并的区间一定挨在一起,所以线性扫一遍就够了。
          </>
        }
      />
    ),
  });
  let cur: [number, number] = [...IVS[0]] as [number, number];
  const merged: [number, number][] = [];
  frames.push({
    curIdx: 0,
    merged: [],
    cur: [...cur] as [number, number],
    msg: (
      <T
        en={<>Take the first interval [1, 3] as the current merged interval (highlighted).</>}
        zh={<>把第一个区间 [1, 3] 作为当前合并段(高亮)。</>}
      />
    ),
  });
  for (let k = 1; k < IVS.length; k++) {
    const iv = IVS[k];
    if (iv[0] <= cur[1]) {
      const before = cur[1];
      const lo0 = cur[0];
      cur[1] = Math.max(cur[1], iv[1]);
      const after = cur[1];
      frames.push({
        curIdx: k,
        merged: merged.map((m) => [...m] as [number, number]),
        cur: [...cur] as [number, number],
        msg: (
          <T
            en={
              <>
                Look at [{iv[0]}, {iv[1]}]: its left endpoint {iv[0]} ≤ the
                current right endpoint {before}, so they <b>overlap</b>. Extend
                the right endpoint to {after}. The current interval is now [
                {lo0}, {after}].
              </>
            }
            zh={
              <>
                看 [{iv[0]}, {iv[1]}]:左端点 {iv[0]} ≤ 当前右端点 {before},
                两者<b>重叠</b>。把右端点扩到 {after},当前段变成 [{lo0}, {after}]。
              </>
            }
          />
        ),
      });
    } else {
      const closed: [number, number] = [cur[0], cur[1]];
      merged.push([...cur] as [number, number]);
      frames.push({
        curIdx: k,
        merged: merged.map((m) => [...m] as [number, number]),
        cur: [...iv] as [number, number],
        msg: (
          <T
            en={
              <>
                Look at [{iv[0]}, {iv[1]}]: its left endpoint {iv[0]} &gt; the
                current right endpoint {closed[1]}, so there is <b>no overlap</b>
                . Close [{closed[0]}, {closed[1]}] into the result and start a new
                interval [{iv[0]}, {iv[1]}].
              </>
            }
            zh={
              <>
                看 [{iv[0]}, {iv[1]}]:左端点 {iv[0]} &gt; 当前右端点 {closed[1]},
                两者<b>不重叠</b>。把 [{closed[0]}, {closed[1]}] 收进结果,
                另起新段 [{iv[0]}, {iv[1]}]。
              </>
            }
          />
        ),
      });
      cur = [...iv] as [number, number];
    }
  }
  merged.push([...cur] as [number, number]);
  frames.push({
    curIdx: null,
    merged: merged.map((m) => [...m] as [number, number]),
    cur: null,
    msg: (
      <T
        en={
          <>
            The scan is over, and the last interval is closed. Result: [[1,6],
            [8,10], [15,18]]. Sorting costs O(n log n) and the scan costs O(n),
            so the sort decides the total.
          </>
        }
        zh={
          <>
            扫描结束,最后一段收尾。结果:[[1,6], [8,10], [15,18]]。
            排序 O(n log n),扫描 O(n),所以总时间由排序决定。
          </>
        }
      />
    ),
  });
  return frames;
}

const IV_FRAMES = intervalFrames();

function Seg({ iv, tone }: { iv: [number, number]; tone: "in" | "cur" | "done" | "ghost" }) {
  const left = (iv[0] / IV_SCALE) * 100;
  const width = ((iv[1] - iv[0]) / IV_SCALE) * 100;
  return (
    <div className="srt-seg" data-tone={tone} style={{ left: `${left}%`, width: `${width}%` }}>
      {iv[0]},{iv[1]}
    </div>
  );
}

export function IntervalsDemo() {
  const stepper = useStepper(IV_FRAMES.length);
  const f = IV_FRAMES[stepper.step];
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="LC 56 · merging intervals with one scan after sorting (number line 0–19)"
          zh="LC 56 · 排序后一次线性扫描合并区间(数轴 0~19)"
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 18 }}>
        <div className="srt-row" style={{ width: "100%" }}>
          <span className="srt-row-lab">
            <T en="Input intervals (sorted by left endpoint)" zh="输入区间(已按左端点排序)" />
          </span>
          <div className="srt-track">
            {IVS.map((iv, i) => (
              <Seg key={i} iv={iv} tone={f.curIdx === i ? "cur" : "in"} />
            ))}
          </div>
        </div>
        <div className="srt-row" style={{ width: "100%" }}>
          <span className="srt-row-lab">
            <T en="Merged result + current interval" zh="合并结果 + 当前段" />
          </span>
          <div className="srt-track">
            {f.merged.map((iv, i) => (
              <Seg key={`m${i}`} iv={iv} tone="done" />
            ))}
            {f.cur && <Seg iv={f.cur} tone="cur" />}
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={IV_FRAMES.length} />
    </div>
  );
}

/* ==================================================================
   Race verdicts —— the readings printed under the three races in §05.
   Every number is taken from the measured counts, and every comparison the
   text makes ("fewer", "writes the fewest", "the asymptotics show") is
   checked against those counts before it is said.
   test/unit/sorting-race-verdicts.test.tsx replays every shape × size × seed
   and holds the wording to the data.
   ================================================================== */

type RaceCtx = { size: number; inputId: string };

const fmt = (n: number) => n.toLocaleString("en-US");

function countsOf(r: LaneResult[], id: string): RaceCounts {
  const lane = r.find((x) => x.id === id);
  if (!lane) throw new Error(`race verdict: no lane "${id}"`);
  return lane.counts;
}

/** Both quicksort contenders book one temporary cell before they recurse, so the
 *  recursion depth is their peak extra space minus that cell. */
export const quickDepth = (c: RaceCounts) => c.space - 1;

/** Race 1 · insertion, bubble and selection sort on the same array. */
export function sortRace1Verdict(r: LaneResult[], { size, inputId }: RaceCtx): Loc<ReactNode> {
  const ins = countsOf(r, "insertion");
  const bub = countsOf(r, "bubble");
  const sel = countsOf(r, "selection");

  if (inputId === "sorted" || inputId === "nearly") {
    return {
      en: (
        <>
          Look at selection sort: <b>{fmt(sel.cmp)} comparisons</b> — exactly the same
          number it spends on every other shape. It cannot do better, because to name the
          minimum it must scan all the remaining elements, every single round. Insertion
          sort needs only {fmt(ins.cmp)} comparisons and{" "}
          {ins.mov === 0 ? "does not write at all" : `writes ${fmt(ins.mov)} times`}. That
          gap is what the word <b>adaptive</b> is worth: an algorithm that notices the
          input is already in order.
        </>
      ),
      zh: (
        <>
          看选择排序:<b>{fmt(sel.cmp)} 次比较</b> —— 和它在任何别的形状上花的次数一模一样。
          它没法更少,因为要说出「谁是最小的」,就必须每轮把剩下的元素全扫一遍。
          插入排序只要 {fmt(ins.cmp)} 次比较,
          {ins.mov === 0 ? "一次也不写" : `写 ${fmt(ins.mov)} 次`}。
          这个差距就是<b>自适应(adaptive)</b>一词的实际意义:
          一个算法能察觉「输入本来就有序」。
        </>
      ),
    };
  }

  if (inputId === "reversed") {
    return {
      en: (
        <>
          Reversed input is insertion sort&apos;s true worst case: every element has to be
          shifted all the way to the front, so it writes {fmt(ins.mov)} times against
          selection sort&apos;s {fmt(sel.mov)}. No other shape lets selection sort save as
          many writes against insertion sort — it swaps at most once per round. Which is
          exactly when you would pick it: when a write is far more expensive than a
          comparison.
        </>
      ),
      zh: (
        <>
          逆序是插入排序真正的最坏情况:每个元素都得一路挪到最前面,
          于是它写了 {fmt(ins.mov)} 次,而选择排序只写 {fmt(sel.mov)} 次。
          在所有形状里,逆序时选择排序比插入排序省下的写入最多 —— 它每轮最多只交换一次。
          这也正是你会选它的场合:当一次写入远比一次比较昂贵的时候。
        </>
      ),
    };
  }

  // Random and many-duplicates input.
  const share = Math.round((100 * ins.cmp) / bub.cmp);
  // On a few elements the comparisons every round makes regardless of the data are a
  // large part of both totals, so the ratio sits well above its limit.
  const close = ins.cmp > 0.65 * bub.cmp;
  const fewestOther = Math.min(ins.mov, bub.mov);
  const selWrites: Loc<ReactNode> =
    sel.mov < fewestOther
      ? {
          en: <>, yet it writes the fewest: {fmt(sel.mov)} times</>,
          zh: <>,但写入最少:只有 {fmt(sel.mov)} 次</>,
        }
      : sel.mov === fewestOther
        ? {
            en: <>, and its {fmt(sel.mov)} writes tie for the fewest</>,
            zh: <>,写入 {fmt(sel.mov)} 次,与最少的并列</>,
          }
        : {
            en: (
              <>
                , and on this input it does not even write the fewest: insertion sort
                wrote {fmt(ins.mov)} times, selection sort {fmt(sel.mov)}
              </>
            ),
            zh: (
              <>
                ,而且在这一组输入上连写入都不是最少:插入排序写了 {fmt(ins.mov)} 次,
                选择排序写了 {fmt(sel.mov)} 次
              </>
            ),
          };
  return {
    en: (
      <>
        On unordered data all three stay in the n² family, but the constants differ.
        Insertion sort compares {fmt(ins.cmp)} times, {share}% of bubble sort&apos;s{" "}
        {fmt(bub.cmp)}, because it stops as soon as it finds the right slot instead of
        sweeping to the end.
        {close && (
          <>
            {" "}
            At n = {size} the gap is still narrow: the comparisons every round makes
            regardless of the data are a large share of such small counts. Raise n and
            insertion sort pulls further ahead.
          </>
        )}{" "}
        Selection sort stays pinned at {fmt(sel.cmp)} comparisons whatever the input
        {selWrites.en}.
      </>
    ),
    zh: (
      <>
        在无序数据上三者都还在 n² 这个量级里,但常数不同。
        插入排序比较 {fmt(ins.cmp)} 次,是冒泡 {fmt(bub.cmp)} 次的 {share}%,
        因为它一找到该待的位置就停,不像冒泡非要扫到底。
        {close && (
          <>
            n = {size} 时差距还不明显:每一轮无论数据如何都要做的那几次比较,
            在这么小的总数里占了很大比重。把 n 调大,插入排序会领先得更多。
          </>
        )}
        选择排序则无论输入如何都钉在 {fmt(sel.cmp)} 次比较上{selWrites.zh}。
      </>
    ),
  };
}

/** Race 2 · insertion sort against merge sort and randomised quicksort. */
export function sortRace2Verdict(r: LaneResult[], { size, inputId }: RaceCtx): Loc<ReactNode> {
  const ins = countsOf(r, "insertion");
  const mer = countsOf(r, "merge");
  const qr = countsOf(r, "quick-rand");

  if ((inputId === "sorted" || inputId === "nearly") && ins.cmp < mer.cmp) {
    const both = ins.cmp < qr.cmp;
    return {
      en: (
        <>
          Here is the headline: the O(n²) algorithm beats{" "}
          {both ? "both O(n log n) ones" : "merge sort"}. Insertion sort spends{" "}
          {fmt(ins.cmp)} comparisons and {fmt(ins.mov)} moves; merge sort spends{" "}
          {fmt(mer.cmp)} comparisons,{" "}
          <b>
            {fmt(mer.mov)} moves and {fmt(mer.space)} cells of extra space
          </b>{" "}
          — and it will spend the same {fmt(mer.mov)} moves on every other shape, because
          textbook merge sort is not adaptive: it splits and merges regardless of what the
          data already looks like. Big-O was never wrong: O(n²) is insertion sort&apos;s
          worst case, and on input that is already in order it makes little more than one
          comparison per element, its O(n) best case. Raising n only widens the gap. This
          is precisely why Timsort — the real sort in Python, and in Java for objects —
          first scans for existing sorted runs and hands short pieces to insertion sort.
        </>
      ),
      zh: (
        <>
          这就是本场最重要的结果:O(n²) 的算法打赢了
          {both ? "两个 O(n log n) 的算法" : "归并排序"}。
          插入排序花 {fmt(ins.cmp)} 次比较、{fmt(ins.mov)} 次移动;归并排序花{" "}
          {fmt(mer.cmp)} 次比较、
          <b>
            {fmt(mer.mov)} 次移动、{fmt(mer.space)} 个额外单元
          </b>{" "}
          —— 而且它在任何别的形状上都会花同样的 {fmt(mer.mov)} 次移动,
          因为教科书版归并不自适应:不管数据长什么样,都照样拆分、照样合并。
          大 O 从没说错:O(n²) 是插入排序的最坏情况,而在已经有序的输入上,
          它每个元素只需一次左右的比较,这是它 O(n) 的最好情况。n 越大,差距只会越大。
          这也正是 Timsort(Python 以及 Java 的对象排序里真正在跑的那个排序)
          要先扫描已有的有序段、并把短片段交给插入排序的原因。
        </>
      ),
    };
  }

  if (inputId === "few") {
    const depth = quickDepth(qr);
    const deep = depth > 3 * Math.log2(size);
    const loses = qr.cmp > ins.cmp;
    return {
      en: (
        <>
          Many duplicates are the one input a random pivot cannot fix. This Lomuto
          partition sends every copy of the pivot value to the same side, so once a range
          holds only equal values, each partition removes just one element and the work
          grows like n²: randomised quicksort needs {fmt(qr.cmp)} comparisons
          {loses ? (
            <>, more than even insertion sort&apos;s {fmt(ins.cmp)}</>
          ) : (
            <>, against insertion sort&apos;s {fmt(ins.cmp)}</>
          )}
          , and its recursion goes {fmt(depth)} levels deep
          {deep && <>, far deeper than the O(log n) on its lane, which assumes distinct values</>}
          . Choosing the pivot at random cannot help, because inside such a range every
          choice has the same value; a three-way partition (LC 75) keeps all copies of the
          pivot in the middle and fixes this. Merge sort is not slowed down by duplicates
          and needs {fmt(mer.cmp)}.
        </>
      ),
      zh: (
        <>
          大量重复值是随机选轴解决不了的输入。这里的 Lomuto 划分把与基准相等的值全部送到同一侧,
          所以一旦某个区间只剩相等的值,每次划分只能去掉一个元素,工作量按 n² 增长:
          随机快排需要 {fmt(qr.cmp)} 次比较
          {loses ? <>,比插入排序的 {fmt(ins.cmp)} 次还多</> : <>,插入排序是 {fmt(ins.cmp)} 次</>}
          ,递归深达 {fmt(depth)} 层
          {deep && <>,远超它赛道上标注的 O(log n) —— 那个标注假定值互不相同</>}
          。随机选轴帮不上忙,因为在这样的区间里选哪个值都一样;
          三路划分(LC 75)把基准的所有副本留在中间,才能解决这个问题。
          归并排序不受重复值影响,需要 {fmt(mer.cmp)} 次比较。
        </>
      ),
    };
  }

  // Random and reversed input.
  const ahead = ins.cmp >= 1.2 * mer.cmp;
  const space: Loc<ReactNode> = {
    en: (
      <>
        {" "}
        Note the space column too: merge sort rents <b>{fmt(mer.space)} cells</b> of extra
        space, while randomised quicksort needs only {fmt(qr.space)} — one temporary cell
        plus its recursion stack — for its {fmt(qr.cmp)} comparisons. Sorting in place or
        paying memory for a guaranteed O(n log n) is a trade you make on purpose.
      </>
    ),
    zh: (
      <>
        也请看额外空间这一栏:归并占用了 <b>{fmt(mer.space)} 个额外单元</b>,
        而随机快排只用 {fmt(qr.space)} 个 —— 一个临时单元加上递归栈 ——
        完成 {fmt(qr.cmp)} 次比较。「原地排序」还是「花内存换取有保证的 O(n log n)」,
        是需要你有意做出的取舍。
      </>
    ),
  };
  if (ahead)
    return {
      en: (
        <>
          Now the asymptotics show: insertion sort pays {fmt(ins.cmp)} comparisons against
          merge sort&apos;s {fmt(mer.cmp)}
          {size < 128 && <>, and the gap widens as you raise n — try 128</>}.{space.en}
        </>
      ),
      zh: (
        <>
          这下渐进复杂度开始显现:插入排序付 {fmt(ins.cmp)} 次比较,归并只付{" "}
          {fmt(mer.cmp)} 次{size < 128 && <>,而且把 n 调大差距会拉得更开 —— 试试 128</>}。
          {space.zh}
        </>
      ),
    };
  return {
    en: (
      <>
        At n = {size} the asymptotics have not taken over yet: insertion sort pays{" "}
        {fmt(ins.cmp)} comparisons and merge sort {fmt(mer.cmp)}. With this few elements
        the two growth rates have not separated, so constant factors and lower-order terms
        decide which one comes out ahead. Raise n and merge sort pulls away.{space.en}
      </>
    ),
    zh: (
      <>
        n = {size} 时渐进复杂度还没有起决定作用:插入排序比较 {fmt(ins.cmp)} 次,
        归并 {fmt(mer.cmp)} 次。元素这么少时,两种增长趋势还没有拉开,
        谁多谁少由常数和低阶项决定。把 n 调大,归并就会拉开差距。
        {space.zh}
      </>
    ),
  };
}

/** Race 3 · the same Lomuto quicksort with a fixed last-element pivot and a random one. */
export function sortRace3Verdict(r: LaneResult[], { inputId }: RaceCtx): Loc<ReactNode> {
  const fixed = countsOf(r, "quick-last");
  const rand = countsOf(r, "quick-rand");
  const fdepth = quickDepth(fixed);
  const rdepth = quickDepth(rand);

  if (inputId === "random") {
    const extra = rand.mov > fixed.mov;
    return {
      en: (
        <>
          On random data neither pivot rule has a systematic edge: {fmt(fixed.cmp)} versus{" "}
          {fmt(rand.cmp)} comparisons, and which one comes out ahead changes from draw to
          draw (try Reroll).{" "}
          {extra ? (
            <>
              The random pivot costs some extra writes — {fmt(rand.mov)} against{" "}
              {fmt(fixed.mov)} here, starting with the swap that moves each chosen pivot
              into the last slot — and buys nothing visible.
            </>
          ) : (
            <>
              This time the random pivots even write less ({fmt(rand.mov)} against{" "}
              {fmt(fixed.mov)}), so randomisation costs nothing visible either.
            </>
          )}{" "}
          Switch the shape to <b>Already sorted</b> to see what it is actually insurance
          against.
        </>
      ),
      zh: (
        <>
          在随机数据上,两种选轴规则谁也没有系统性的优势:{fmt(fixed.cmp)} 对{" "}
          {fmt(rand.cmp)} 次比较,谁更少要看这一组数据(可以点「换一组」试试)。
          {extra ? (
            <>
              随机选轴多付了一些写入 —— 这一组是 {fmt(rand.mov)} 对 {fmt(fixed.mov)},
              其中包括每次把选中的轴换到末位的那一次交换 —— 却看不出任何好处。
            </>
          ) : (
            <>
              这一组随机选轴的写入反而更少({fmt(rand.mov)} 对 {fmt(fixed.mov)}),
              随机化看不出任何代价。
            </>
          )}
          把形状切到<b>已排序</b>,就能看到随机选轴防范的是什么。
        </>
      ),
    };
  }

  if (inputId === "reversed")
    return {
      en: (
        <>
          Reversed input is just as bad for a fixed pivot. The last element starts as the
          smallest value, and afterwards the pivot alternates between the smallest and the
          largest remaining value, so every partition is again 0 : n−1 and the cost
          degenerates to <b>{fmt(fixed.cmp)} comparisons</b> with a recursion depth of{" "}
          <b>{fmt(fdepth)}</b>. Randomising the pivot brings the same input down to{" "}
          {fmt(rand.cmp)} comparisons and depth {fmt(rdepth)}.
        </>
      ),
      zh: (
        <>
          逆序输入对固定轴同样致命:末位轴第一次是最小值,
          之后在剩余元素的最小值与最大值之间交替,每次划分仍是 0 : n−1,
          于是退化成 <b>{fmt(fixed.cmp)} 次比较</b>、递归深度 <b>{fmt(fdepth)}</b>。
          把轴随机化,同一份输入降到 {fmt(rand.cmp)} 次比较、深度 {fmt(rdepth)}。
        </>
      ),
    };

  return {
    en: (
      <>
        Sorted input is the fixed-pivot version&apos;s worst case: the pivot is always the
        largest element left, so every partition splits 0 : n−1 and it degenerates to{" "}
        <b>{fmt(fixed.cmp)} comparisons</b> with a recursion depth of <b>{fmt(fdepth)}</b>{" "}
        — the stack grows with n, which is how real services meet a stack overflow.
        Randomising the pivot brings the same input down to {fmt(rand.cmp)} comparisons and
        depth {fmt(rdepth)}. Nothing about the input changed; what changed is that an input
        arranged against the last-element pivot no longer hits it.
      </>
    ),
    zh: (
      <>
        已排序输入是固定轴版本的最坏情况:轴永远是剩下元素里最大的那个,
        于是每次划分都是 0 : n−1,直接退化成 <b>{fmt(fixed.cmp)} 次比较</b>、
        递归深度 <b>{fmt(fdepth)}</b> —— 栈的深度随 n 增长,真实服务里的栈溢出就是这么来的。
        把轴随机化,同一份输入降到 {fmt(rand.cmp)} 次比较、深度 {fmt(rdepth)}。
        输入没有任何变化,变的是:针对末位取轴构造的输入,再也打不中它了。
      </>
    ),
  };
}
