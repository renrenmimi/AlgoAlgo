// Search race: contenders, input shapes and metric labels.
//
// Kept apart from viz.tsx so the counting logic can be imported by tests without
// pulling in the chapter's visualization components. It is .tsx rather than .ts
// because the lane notes are written as JSX.

import type { RaceAlgo, RaceInput, RaceMetric } from "@/lib/race";
import type { Tracer } from "@/lib/race-core";

/* ============================================================
   The search race —— linear scan vs binary search (iterative / recursive), consumed
   by <AlgoRace>
   ============================================================

   Accounting conventions (also stated in the UI; no hand-waving allowed):
     · A comparison = comparing one element against the target once. A linear scan
       records one per element it looks at; binary search records one per probe of
       mid (the source writes both == and < against mid, but that is a single probe,
       so the convention is one three-way comparison, which is what makes the two
       contenders comparable).
     · Extra space = the peak number of variables and stack frames held at once, not
       counting the input itself: 1 index for the linear scan; lo and hi, so 2, for
       iterative binary search; one stack frame per level for recursive binary search.
     · Searching never writes to the array, so mov is always 0 —— the page shows only
       two metrics.

   All three implementations had their boundaries enumerated with node in the
   scratchpad (n = 0/1/2/3/17/1000, with targets covering every index plus three
   kinds of absent value), and they return identical indices. */

export type Haystack = { a: number[]; target: number };

/** Shallow copy: slice the array, and since target is a number it can be carried over as is */
export const cloneHaystack = (h: Haystack): Haystack => ({
  a: h.a.slice(),
  target: h.target,
});

/** Linear scan: it does not require sorted input, which is also why it cannot skip any element */
export function linearFind({ a, target }: Haystack, t: Tracer): number {
  t.alloc(1); // one index, i
  for (let i = 0; i < a.length; i++) {
    t.cmp();
    if (a[i] === target) return i;
  }
  return -1;
}

/** Iterative binary search over the closed interval [lo, hi] —— line for line the same as the §01 template */
export function binaryFind({ a, target }: Haystack, t: Tracer): number {
  t.alloc(2); // lo and hi
  let lo = 0;
  let hi = a.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    t.cmp();
    if (a[mid] === target) return mid;
    if (a[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1; // the interval is empty = the target is not present
}

/** Recursive binary search: exactly the same number of probes as the iterative version, at the cost of one stack frame per level */
export function binaryFindRec({ a, target }: Haystack, t: Tracer): number {
  const go = (lo: number, hi: number): number => {
    t.enter();
    let r: number;
    if (lo > hi) r = -1;
    else {
      const mid = lo + Math.floor((hi - lo) / 2);
      t.cmp();
      if (a[mid] === target) r = mid;
      else if (a[mid] < target) r = go(mid + 1, hi);
      else r = go(lo, mid - 1);
    }
    t.exit();
    return r;
  };
  return go(0, a.length - 1);
}

export const SEARCH_ALGOS: RaceAlgo<Haystack>[] = [
  {
    id: "linear",
    name: { en: "Linear scan", zh: "线性扫描" },
    time: "n",
    space: { en: "O(1)", zh: "O(1)" },
    note: {
      en: (
        <>
          Looks at one element after another and stops at the first match. It
          asks nothing of the input — and for exactly that reason it can never
          skip anything either.
        </>
      ),
      zh: (
        <>
          一个接一个地看,撞上就停。它对输入不提任何要求 ——
          也正因为如此,它永远没有资格跳过任何元素。
        </>
      ),
    },
    run: (input, t) => {
      linearFind(input, t);
    },
  },
  {
    id: "binary",
    name: { en: "Binary search (iterative)", zh: "二分查找(迭代)" },
    time: "logn",
    space: { en: "O(1)", zh: "O(1)" },
    note: {
      en: (
        <>
          Probes the middle and discards half of the remaining candidates every
          time. It buys that on credit: the array must already be sorted.
        </>
      ),
      zh: (
        <>
          探测正中间,每次丢掉一半候选。这份便宜是赊来的:数组必须事先有序。
        </>
      ),
    },
    run: (input, t) => {
      binaryFind(input, t);
    },
  },
  {
    id: "binary-rec",
    name: { en: "Binary search (recursive)", zh: "二分查找(递归)" },
    time: "logn",
    space: { en: "O(log n)", zh: "O(log n)" },
    note: {
      en: (
        <>
          The same probes as the loop, written as recursion. The space column is
          its stack: one frame per level of halving.
        </>
      ),
      zh: (
        <>
          和迭代版探测同样的位置,只是写成了递归。额外空间那一栏就是它的调用栈:
          每砍一刀多一个栈帧。
        </>
      ),
    },
    run: (input, t) => {
      binaryFindRec(input, t);
    },
  },
];

/** A strictly increasing arithmetic sequence. Every element shares the same parity, so a value of the opposite parity is guaranteed not to be in the array. */
const ladder = (n: number, seed: number): number[] => {
  const base = seed % 5; // a different data set: the whole sequence shifts, the shape stays the same
  return Array.from({ length: n }, (_, i) => base + 2 * i);
};

const H = (
  id: string,
  label: { en: string; zh: string },
  pick: (a: number[], n: number) => number,
  hint: { en: string; zh: string },
): RaceInput<Haystack> => ({
  id,
  label,
  make: (n, seed) => {
    const a = ladder(n, seed);
    return { a, target: n === 0 ? 0 : pick(a, n) };
  },
  hint,
  // A reroll shifts every value but keeps the target's position, and that position alone
  // decides every count here
  seedless: {
    en: "Here the counts depend only on where the target sits, and a reroll would only shift the values.",
    zh: "这里的计数只取决于目标所在的位置，换一组只会平移数值，计数不会变化。",
  },
});

export const SEARCH_SHAPES: RaceInput<Haystack>[] = [
  H(
    "mid",
    { en: "Target in the middle", zh: "目标在正中间" },
    (a, n) => a[Math.floor((n - 1) / 2)],
    {
      en: "Binary search probes the middle first, so this is its best case: one comparison. The scan still has to walk half the array.",
      zh: "二分第一次探测的就是正中间,所以这是它的最好情况:一次比较。而扫描仍要走完半个数组。",
    },
  ),
  H(
    "last",
    { en: "Target at the last position", zh: "目标在最后一个" },
    (a, n) => a[n - 1],
    {
      en: "The worst case for a scan: it must examine all n elements. Binary search does not care where the target sits.",
      zh: "扫描的最坏情况:n 个元素一个都躲不掉。而目标在哪里,二分并不在意。",
    },
  ),
  H(
    "absent",
    { en: "Target not present", zh: "目标不存在" },
    (a, n) => a[Math.floor(n * 0.6)] + 1,
    {
      en: "The target falls in a gap between two elements. Worst case against worst case: the scan must check everything before it may say no.",
      zh: "目标落在两个元素之间的空隙里。最坏情况对最坏情况:扫描必须全部看过,才有资格说「没有」。",
    },
  ),
  H(
    "first",
    { en: "Target at the very front", zh: "目标在最前面" },
    (a) => a[0],
    {
      en: "The one shape where the scan wins: it answers after a single comparison, while binary search still has to walk in from the middle.",
      zh: "扫描唯一赢的形状:它一次比较就能回答,而二分还得从正中间一路走进来。",
    },
  ),
];

export const SEARCH_METRICS: RaceMetric[] = [
  {
    key: "cmp",
    label: { en: "Comparisons", zh: "比较次数" },
    tip: {
      en: "One comparison of one element against the target: the scan counts one per element it examines, binary search one per probe of the middle.",
      zh: "把一个元素与目标比较一次:扫描每看一个元素记一次,二分每探测一次 mid 记一次。",
    },
  },
  {
    key: "space",
    label: { en: "Extra space", zh: "额外空间" },
    tip: {
      en: "Peak number of variables and stack frames held, input excluded: one index for the scan, lo and hi for the loop, one frame per level for the recursion.",
      zh: "峰值时持有的变量与栈帧个数,不含输入本身:扫描 1 个下标,迭代二分 lo 与 hi 两个,递归二分每层一个栈帧。",
    },
  },
];
