"use client";

// The contenders and input shapes for the sorting race -- consumed by <AlgoRace>.
//
// Every implementation keeps its books by the same rules (see the top of lib/race.tsx):
//   comparison = one size comparison between elements; move = one array write (a swap = 2);
//   space = the peak of auxiliary cells + recursion stack frames.
// The implementations are deliberately kept textbook-plain, with no adaptive optimizations
// slipped in -- because "merge sort still pays full price on an already-sorted array" is
// exactly the point this chapter makes (and exactly why Timsort adds run detection).

import type { RaceAlgo, RaceInput } from "@/lib/race";
import { rng, type Tracer } from "@/lib/race-core";

export type Arr = number[];

export const cloneArr = (a: Arr): Arr => a.slice();

/* ---------------- Contenders ---------------- */

function bubble(a: Arr, t: Tracer) {
  t.alloc(1); // The temporary variable used for swapping
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      t.cmp();
      if (a[j] > a[j + 1]) {
        const x = a[j];
        a[j] = a[j + 1];
        a[j + 1] = x;
        t.mov(2);
        swapped = true;
      }
    }
    if (!swapped) break; // A full pass with no swap: already sorted, so stop early
  }
}

function selection(a: Arr, t: Tracer) {
  t.alloc(1);
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let m = i;
    for (let j = i + 1; j < n; j++) {
      t.cmp();
      if (a[j] < a[m]) m = j;
    }
    if (m !== i) {
      const x = a[i];
      a[i] = a[m];
      a[m] = x;
      t.mov(2);
    }
  }
}

function insertion(a: Arr, t: Tracer) {
  t.alloc(1); // The card currently held in your hand
  const n = a.length;
  for (let i = 1; i < n; i++) {
    const x = a[i];
    let j = i - 1;
    while (j >= 0) {
      t.cmp();
      if (a[j] > x) {
        a[j + 1] = a[j];
        t.mov();
        j--;
      } else break;
    }
    if (j + 1 !== i) {
      a[j + 1] = x;
      t.mov();
    }
  }
}

function mergeSort(a: Arr, t: Tracer) {
  const n = a.length;
  const buf = new Array<number>(n);
  t.alloc(n); // Merging must borrow a scratch area of the same size
  const go = (lo: number, hi: number) => {
    t.enter();
    if (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      go(lo, mid);
      go(mid, hi);
      let i = lo;
      let j = mid;
      let k = lo;
      while (i < mid && j < hi) {
        t.cmp();
        buf[k++] = a[i] <= a[j] ? a[i++] : a[j++];
        t.mov();
      }
      while (i < mid) {
        buf[k++] = a[i++];
        t.mov();
      }
      while (j < hi) {
        buf[k++] = a[j++];
        t.mov();
      }
      for (let x = lo; x < hi; x++) {
        a[x] = buf[x];
        t.mov();
      }
    }
    t.exit();
  };
  go(0, n);
  t.free(n);
}

/** Lomuto partition, always taking the last element as the pivot -- an already-sorted input
 *  drags it back down to O(n^2). */
function quickLast(a: Arr, t: Tracer) {
  t.alloc(1);
  const go = (lo: number, hi: number) => {
    t.enter();
    if (lo < hi) {
      const p = a[hi];
      let i = lo;
      for (let j = lo; j < hi; j++) {
        t.cmp();
        if (a[j] < p) {
          if (i !== j) {
            const x = a[i];
            a[i] = a[j];
            a[j] = x;
            t.mov(2);
          }
          i++;
        }
      }
      if (i !== hi) {
        const x = a[i];
        a[i] = a[hi];
        a[hi] = x;
        t.mov(2);
      }
      go(lo, i - 1);
      go(i + 1, hi);
    }
    t.exit();
  };
  go(0, a.length - 1);
}

/** Randomized pivot: swap a random element to the end first, then run Lomuto as usual. */
function quickRandom(a: Arr, t: Tracer) {
  t.alloc(1);
  const rand = rng(20260716);
  const go = (lo: number, hi: number) => {
    t.enter();
    if (lo < hi) {
      const r = lo + Math.floor(rand() * (hi - lo + 1));
      if (r !== hi) {
        const y = a[r];
        a[r] = a[hi];
        a[hi] = y;
        t.mov(2);
      }
      const p = a[hi];
      let i = lo;
      for (let j = lo; j < hi; j++) {
        t.cmp();
        if (a[j] < p) {
          if (i !== j) {
            const x = a[i];
            a[i] = a[j];
            a[j] = x;
            t.mov(2);
          }
          i++;
        }
      }
      if (i !== hi) {
        const x = a[i];
        a[i] = a[hi];
        a[hi] = x;
        t.mov(2);
      }
      go(lo, i - 1);
      go(i + 1, hi);
    }
    t.exit();
  };
  go(0, a.length - 1);
}

const A = (
  id: string,
  name: { en: string; zh: string },
  time: string,
  space: { en: string; zh: string },
  note: { en: string; zh: string },
  run: (a: Arr, t: Tracer) => void,
): RaceAlgo<Arr> => ({ id, name, time, space, note, run });

export const BUBBLE = A(
  "bubble",
  { en: "Bubble sort (early exit)", zh: "冒泡排序(带提前退出)" },
  "n2",
  { en: "O(1)", zh: "O(1)" },
  {
    en: "Swaps neighbours. A clean pass means done — so a sorted array costs one pass.",
    zh: "只交换相邻的两个元素。一整趟没有发生交换就提前结束 —— 所以已排序的数组只需一趟。",
  },
  bubble,
);

export const SELECTION = A(
  "selection",
  { en: "Selection sort", zh: "选择排序" },
  "n2",
  { en: "O(1)", zh: "O(1)" },
  {
    en: "Scans for the minimum every round: comparisons never drop, but it writes at most 2(n−1) times.",
    zh: "每轮扫一遍找最小:比较次数永远不会少,但写入最多只有 2(n−1) 次。",
  },
  selection,
);

export const INSERTION = A(
  "insertion",
  { en: "Insertion sort", zh: "插入排序" },
  "n2",
  { en: "O(1)", zh: "O(1)" },
  {
    en: "Inserts each card into a sorted hand — the closer to sorted, the less it does.",
    zh: "把每张牌插进已排好的手牌 —— 输入越接近有序,它做的事越少。",
  },
  insertion,
);

export const MERGE = A(
  "merge",
  { en: "Merge sort (textbook)", zh: "归并排序(教科书版)" },
  "nlogn",
  { en: "O(n)", zh: "O(n)" },
  {
    en: "Splits and merges, always. Steady but pays full price even on sorted input, and rents O(n) of scratch space.",
    zh: "无论输入如何都完整地拆分与合并。性能稳定,但即使输入已排序也要付出全部代价,还需要 O(n) 的临时空间。",
  },
  mergeSort,
);

export const QUICK_LAST = A(
  "quick-last",
  { en: "Quicksort (last as pivot)", zh: "快速排序(固定取末位为轴)" },
  "nlogn",
  { en: "O(log n) ~ O(n)", zh: "O(log n) ~ O(n)" },
  {
    en: "Fast on random data. Feed it a sorted array and every partition splits 0 : n−1 — back to O(n²).",
    zh: "随机数据上很快。但输入已排序数组时,每次划分都是 0 : n−1 —— 退化回 O(n²)。",
  },
  quickLast,
);

export const QUICK_RANDOM = A(
  "quick-rand",
  { en: "Quicksort (random pivot)", zh: "快速排序(随机轴)" },
  "nlogn",
  { en: "O(log n)", zh: "O(log n)" },
  {
    en: "One line of randomisation defeats inputs aimed at a fixed pivot. This Lomuto version still degrades on many duplicate values; a three-way partition fixes that.",
    zh: "一行随机化让专门针对固定轴的输入失效;但这里用的是 Lomuto 划分,大量重复值仍会让它退化,要靠三路划分解决。",
  },
  quickRandom,
);

/* ---------------- Input shapes ---------------- */

const S = (
  id: string,
  label: { en: string; zh: string },
  make: (n: number, seed: number) => Arr,
  hint: { en: string; zh: string },
): RaceInput<Arr> => ({ id, label, make, hint });

export const RANDOM = S(
  "random",
  { en: "Random", zh: "随机" },
  (n, seed) => {
    const r = rng(seed * 2654435761);
    return Array.from({ length: n }, () => Math.floor(r() * 100));
  },
  {
    en: "The average case everyone quotes. This is where O(n log n) earns its reputation.",
    zh: "人人引用的平均情况。O(n log n) 的名声就是在这里挣来的。",
  },
);

export const SORTED = S(
  "sorted",
  { en: "Already sorted", zh: "已排序" },
  (n) => Array.from({ length: n }, (_, i) => i),
  {
    en: "The best case for adaptive sorts — and the worst case for a fixed-pivot quicksort.",
    zh: "自适应排序的最好情况 —— 同时是固定轴快排的最坏情况。",
  },
);

export const REVERSED = S(
  "reversed",
  { en: "Reversed", zh: "逆序" },
  (n) => Array.from({ length: n }, (_, i) => n - i),
  {
    en: "Every pair is out of order: insertion sort must shift everything, its true worst case.",
    zh: "每一对都是逆的:插入排序必须把所有元素都往后挪,这是它真正的最坏情况。",
  },
);

export const NEARLY = S(
  "nearly",
  { en: "Nearly sorted", zh: "近乎有序" },
  (n, seed) => {
    const a = Array.from({ length: n }, (_, i) => i);
    // Nothing to disturb below two elements. Without this guard the swap count is
    // forced to at least one, and at n = 0 the partner index lands on -1, which
    // writes past the start of the array and hands back a bogus [undefined].
    if (n < 2) return a;
    const r = rng(seed * 40503);
    for (let k = 0; k < Math.max(1, Math.round(n * 0.05)); k++) {
      const i = Math.floor(r() * n);
      const j = Math.min(n - 1, i + 1 + Math.floor(r() * 2));
      const x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  },
  {
    en: "The shape real data actually takes — log files, re-sorted tables, incremental updates.",
    zh: "真实数据最常见的形状 —— 日志、被重新排过的表、增量更新。",
  },
);

export const FEW_UNIQUE = S(
  "few",
  { en: "Many duplicates", zh: "大量重复" },
  (n, seed) => {
    const r = rng(seed * 22695477);
    return Array.from({ length: n }, () => Math.floor(r() * 3));
  },
  {
    en: "Only three distinct values. Lomuto partitioning handles ties poorly — hence three-way quicksort.",
    zh: "只有三种取值。Lomuto 划分处理相等元素很吃力 —— 这就是三路快排存在的理由。",
  },
);

export const SHAPES: RaceInput<Arr>[] = [RANDOM, NEARLY, SORTED, REVERSED, FEW_UNIQUE];
