// Fibonacci race: contenders, input shapes and the clone helper.
//
// Kept apart from viz.tsx so the counting logic can be imported by tests without
// pulling in React.

import type { RaceAlgo, RaceInput } from "@/lib/race";
import type { Tracer } from "@/lib/race-core";

/* ---------------- Fibonacci race: the three contenders ---------------- */
// The counters are relabeled in this chapter (see FIB_METRICS in app/dp/page.tsx for the labels and their explanations):
//   cmp = one function entry (base cases and memo hits count too);
//   mov = one execution of the addition f(i-1)+f(i-2);
//   space = peak of live stack frames + memo table cells + rolling variables (the peak is taken automatically from alloc/free and enter/exit).
// All three implementations stay textbook-plain with no extra optimizations - the numbers have to be verifiable by hand:
//   naive: 2*fib(n+1)-1 calls, fib(n+1)-1 additions, peak space n (the recursion depth);
//   memoized: 2n-1 calls, n-1 additions, peak space 2n+1 (an (n+1)-cell memo table + n stack levels);
//   bottom-up: 1 call, n-1 additions, peak space 4 (3 rolling variables + 1 stack frame).

function fibNaive(n: number, t: Tracer): number {
  const go = (k: number): number => {
    t.enter();
    t.cmp(); // one function call
    if (k < 2) {
      t.exit();
      return k;
    }
    const v = go(k - 1) + go(k - 2);
    t.mov(); // one addition
    t.exit();
    return v;
  };
  return go(n);
}

function fibMemo(n: number, t: Tracer): number {
  const memo = new Array<number>(n + 1).fill(-1);
  t.alloc(n + 1); // memo table: n+1 cells, -1 means "not computed yet"
  const go = (k: number): number => {
    t.enter();
    t.cmp();
    if (k < 2) {
      t.exit();
      return k;
    }
    if (memo[k] >= 0) {
      t.exit();
      return memo[k]; // memo hit: the subtree never has to grow
    }
    const v = go(k - 1) + go(k - 2);
    t.mov();
    memo[k] = v;
    t.exit();
    return v;
  };
  const out = go(n);
  t.free(n + 1);
  return out;
}

function fibLoop(n: number, t: Tracer): number {
  t.enter(); // only this one stack frame, and it never grows
  t.cmp();
  t.alloc(3); // prev / cur / next - the count is independent of n
  if (n < 2) {
    t.free(3);
    t.exit();
    return n;
  }
  let prev = 0;
  let cur = 1;
  for (let i = 2; i <= n; i++) {
    const next = prev + cur;
    t.mov();
    prev = cur;
    cur = next;
  }
  t.free(3);
  t.exit();
  return cur;
}

export const FIB_NAIVE: RaceAlgo<number> = {
  id: "fib-naive",
  name: { en: "Naive recursion", zh: "朴素递归" },
  time: "2n",
  space: { en: "O(n) stack", zh: "O(n) 栈" },
  note: {
    en: "Recomputes every overlapping subproblem. The call count is exactly 2·fib(n+1)−1, so raising n by 1 multiplies the work by about 1.618.",
    zh: "每个重叠子问题都重算一遍。调用次数恰好是 2·fib(n+1)−1,n 每加 1,工作量就乘以约 1.618。",
  },
  run: (n, t) => {
    fibNaive(n, t);
  },
};

export const FIB_MEMO: RaceAlgo<number> = {
  id: "fib-memo",
  name: { en: "Memoized recursion (top-down)", zh: "记忆化递归(自顶向下)" },
  time: "n",
  space: { en: "O(n) stack + O(n) memo", zh: "O(n) 栈 + O(n) 备忘表" },
  note: {
    en: "The same recursion plus a table. Each of the n−1 real subproblems is computed once; every later request for it is one lookup.",
    zh: "同一份递归,外加一张表。n−1 个真正的子问题各算一次,之后对它的每次请求都只是一次查表。",
  },
  run: (n, t) => {
    fibMemo(n, t);
  },
};

export const FIB_LOOP: RaceAlgo<number> = {
  id: "fib-iter",
  name: {
    en: "Tabulation, two rolling values (bottom-up)",
    zh: "递推 · 两个滚动变量(自底向上)",
  },
  time: "n",
  space: { en: "O(1)", zh: "O(1)" },
  note: {
    en: "Fills 0, 1, 2, … in order, so the two values it needs are always already in hand: no stack, no table.",
    zh: "按 0、1、2… 的顺序往上填,需要的两个值永远已经在手边:不要栈,也不要表。",
  },
  run: (n, t) => {
    fibLoop(n, t);
  },
};

/** Fibonacci takes a single parameter, so there is only one input shape: n itself. */
export const FIB_INPUTS: RaceInput<number>[] = [
  {
    id: "n",
    label: { en: "fib(n)", zh: "fib(n)" },
    make: (n) => n,
    hint: {
      en: "Fibonacci takes a single argument, so there is only one shape to feed: the value of n itself. Raise n and watch the three bills part ways.",
      zh: "斐波那契只有一个参数,所以能喂进去的「形状」只有一种:n 本身。把 n 调大,三张账单就会分道扬镳。",
    },
  },
];

/** The input is a number; there is no internal structure to deep-copy. */
export const cloneN = (v: number): number => v;
