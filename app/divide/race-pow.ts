// Fast-exponentiation race: contenders, input shapes and metric labels.
//
// Kept apart from page.tsx so the counting logic can be imported by tests without
// pulling in React. The verdict copy stays in page.tsx because it renders JSX.

import type { RaceAlgo, RaceInput, RaceMetric } from "@/lib/race";
import type { Tracer } from "@/lib/race-core";

/* ================= §03 Fast-exponentiation race: contenders, input shapes, verdict =================
   The same exponent is handed to three implementations and two bills are measured:
   multiplication count and peak space.
   What is computed is 3^n mod (10^9+7) —— a floating-point x^10000 would have
   overflowed long ago, and taking the modulus after every multiplication is the
   standard way to do modular exponentiation anyway, which is what lets the three
   results be checked against each other digit for digit.
   Accounting conventions: one multiplication records one t.cmp(); a recursive frame
   records 1 through each of enter/exit; a working variable is recorded with
   alloc(1). This problem has no notion of an array write, so mov is never recorded
   and metrics shows only two entries. */

const POW_MOD = 1_000_000_007n;
const POW_BASE = 3n;

/** The largest power of 2 that does not exceed n. Doubling is used instead of Math.log2 to avoid floating-point error. */
export const pow2Floor = (n: number) => {
  let p = 1;
  while (p * 2 <= n) p *= 2;
  return p;
};

/** Naive repeated multiplication: start from x and multiply one step at a time —— n − 1 multiplications. */
function powNaive(n: number, t: Tracer) {
  t.alloc(1); // one running-product variable
  if (n === 0) return 1n;
  let res = POW_BASE;
  for (let i = 1; i < n; i++) {
    res = (res * POW_BASE) % POW_MOD;
    t.cmp();
  }
  return res;
}

/** Recursive fast exponentiation: x^n = (x^(n/2))². The base case sits at x¹, so reaching exponent 1 costs no multiplication. */
function powRecursive(n: number, t: Tracer) {
  const go = (e: number): bigint => {
    t.enter(); // one level of recursion = one live stack frame
    let r: bigint;
    if (e <= 1) {
      r = e === 1 ? POW_BASE : 1n;
    } else {
      const half = go(e >> 1);
      r = (half * half) % POW_MOD;
      t.cmp(); // squaring
      if (e & 1) {
        r = (r * POW_BASE) % POW_MOD;
        t.cmp(); // the extra multiplication for an odd exponent
      }
    }
    t.exit();
    return r;
  };
  return go(n);
}

/** Iterative fast exponentiation: the same chain of squarings, driven by the binary digits of n instead; the final round skips the squaring that would go unused. */
function powIterative(n: number, t: Tracer) {
  t.alloc(2); // two working variables: the result res and b, the base at the current rung
  let res = 1n;
  let b = POW_BASE;
  let e = n;
  while (e > 0) {
    if (e & 1) {
      res = (res * b) % POW_MOD;
      t.cmp();
    }
    e >>= 1;
    if (e > 0) {
      b = (b * b) % POW_MOD;
      t.cmp();
    }
  }
  return res;
}

export const POW_ALGOS: RaceAlgo<number>[] = [
  {
    id: "pow-naive",
    name: { en: "Naive chaining", zh: "朴素连乘" },
    time: "n",
    space: { en: "O(1)", zh: "O(1)" },
    note: {
      en: "Multiplies x into an accumulator one step at a time: n − 1 multiplications, one variable.",
      zh: "把 x 一次一次乘进累乘变量:n − 1 次乘法,一个变量。",
    },
    run: powNaive,
  },
  {
    id: "pow-rec",
    name: { en: "Fast power · recursive", zh: "递归快速幂" },
    time: "logn",
    space: { en: "O(log n)", zh: "O(log n)" },
    note: {
      en: "One squaring per level, and the chain has ⌊log₂n⌋ + 1 levels — every level a live stack frame.",
      zh: "每层一次平方,而这条链有 ⌊log₂n⌋ + 1 层 —— 每一层都是一个活着的栈帧。",
    },
    run: powRecursive,
  },
  {
    id: "pow-iter",
    name: { en: "Fast power · iterative", zh: "迭代快速幂" },
    time: "logn",
    space: { en: "O(1)", zh: "O(1)" },
    note: {
      en: "The same squarings, driven by the bits of n in a loop: two variables, no stack. It skips the final squaring the textbook loop computes and never uses.",
      zh: "同样的平方序列,改由 n 的二进制位在循环里驱动:两个变量,没有栈。它省掉了教科书循环里最后那次算完就用不上的平方。",
    },
    run: powIterative,
  },
];

export const POW_SHAPES: RaceInput<number>[] = [
  {
    id: "general",
    label: { en: "General exponent", zh: "一般指数" },
    make: (n) => n,
    hint: {
      en: "The exponent is exactly the size you pick — nothing here is random, so Reroll changes nothing. Note 31 = (11111)₂: every bit is 1, the most expensive exponent of its bit-length.",
      zh: "指数就是所选的规模,这里没有随机成分,「换一组」不会改变结果。留意 31 =(11111)₂:每一位都是 1,是同位长里最费的指数。",
    },
  },
  {
    id: "pow2",
    label: { en: "Power of two", zh: "2 的幂" },
    make: (n) => pow2Floor(n),
    hint: {
      en: "Rounded down to the nearest power of two (10000 → 8192). Only one bit is set, so fast power does nothing but square — the cheapest exponent of its bit-length.",
      zh: "向下取到最近的 2 的幂(10000 → 8192)。二进制只有一个 1,快速幂只需连续平方 —— 同位长里最省的指数。",
    },
  },
];

export const POW_METRICS: RaceMetric[] = [
  {
    key: "cmp",
    label: { en: "Multiplications", zh: "乘法次数" },
    tip: {
      en: "One multiplication of two numbers; a squaring and an extra multiply for a 1 bit each count as one.",
      zh: "两个数之间的一次乘法;一次平方、一次为 1 的二进制位补乘,都各记一次。",
    },
  },
  {
    key: "space",
    label: { en: "Peak space (stack)", zh: "峰值空间(栈)" },
    tip: {
      en: "Peak units held at the same time: one per live recursion frame, one per working variable. The exponent itself is not counted.",
      zh: "同时占用的峰值单元:每个活着的递归栈帧记 1,每个工作变量记 1,不含指数本身。",
    },
  },
];
