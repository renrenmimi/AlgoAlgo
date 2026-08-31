import { describe, expect, it } from "vitest";
import { createTracer, runRace, type RaceRunnable } from "@/lib/race-core";
import { DEFAULT_METRICS } from "@/lib/race";
import {
  SEARCH_ALGOS,
  SEARCH_METRICS,
  SEARCH_SHAPES,
  binaryFind,
  binaryFindRec,
  cloneHaystack,
  linearFind,
  type Haystack,
} from "@/app/binary/race-search";
import {
  FIB_INPUTS,
  FIB_LOOP,
  FIB_MEMO,
  FIB_NAIVE,
  cloneN,
  fibLoop,
  fibMemo,
  fibNaive,
} from "@/app/dp/race-fib";
import {
  POW_ALGOS,
  POW_BASE,
  POW_METRICS,
  POW_MOD,
  POW_SHAPES,
  pow2Floor,
  powIterative,
  powNaive,
  powRecursive,
} from "@/app/divide/race-pow";

const NO_CAP = Number.MAX_SAFE_INTEGER;

/* ================================================================
   Binary search: every variant must face the identical haystack
   ================================================================ */

describe("search race", () => {
  it("hands every contender the same array and the same target", () => {
    for (const shape of SEARCH_SHAPES) {
      const input = shape.make(256, 3);
      const seen: Haystack[] = [];
      const spies: RaceRunnable<Haystack>[] = SEARCH_ALGOS.map((algo) => ({
        id: algo.id,
        run: (h, t) => {
          seen.push({ a: [...h.a], target: h.target });
          algo.run(h, t);
        },
      }));

      runRace(spies, input, cloneHaystack, NO_CAP);

      expect(seen).toHaveLength(SEARCH_ALGOS.length);
      for (const got of seen) {
        expect(got.target, shape.id).toBe(input.target);
        expect(got.a, shape.id).toEqual(input.a);
      }
    }
  });

  it("makes all three variants agree on the answer", () => {
    for (const shape of SEARCH_SHAPES) {
      for (const n of [1, 2, 3, 16, 64, 256]) {
        const input = shape.make(n, 5);
        const expected = input.a.indexOf(input.target);
        const lin = linearFind(cloneHaystack(input), createTracer());
        const bin = binaryFind(cloneHaystack(input), createTracer());
        const rec = binaryFindRec(cloneHaystack(input), createTracer());
        const where = `${shape.id} n=${n}`;
        expect(lin, where).toBe(expected);
        expect(bin, where).toBe(expected);
        expect(rec, where).toBe(expected);
      }
    }
  });

  it("gives every shape a sorted haystack, which binary search depends on", () => {
    for (const shape of SEARCH_SHAPES) {
      const { a } = shape.make(128, 2);
      expect(a.every((v, i) => i === 0 || a[i - 1] <= v), shape.id).toBe(true);
    }
  });

  it("keeps binary search within its worst-case ceiling of floor(log2 n) + 1", () => {
    for (const shape of SEARCH_SHAPES) {
      for (const n of [16, 64, 256, 1024]) {
        const t = createTracer();
        binaryFind(shape.make(n, 2), t);
        const ceiling = Math.floor(Math.log2(n)) + 1;
        expect(t.counts.cmp, `${shape.id} n=${n}`).toBeLessThanOrEqual(ceiling);
      }
    }
  });

  it("adds one comparison per doubling instead of doubling the work", () => {
    const absent = SEARCH_SHAPES.find((s) => s.id === "absent") ?? SEARCH_SHAPES[0];
    const probes = [64, 128, 256, 512].map((n) => {
      const t = createTracer();
      binaryFind(absent.make(n, 2), t);
      return t.counts.cmp;
    });
    for (let i = 1; i < probes.length; i++) {
      expect(probes[i] - probes[i - 1]).toBe(1);
    }
  });

  it("does not report array writes, because a search writes nothing", () => {
    const t = createTracer();
    binaryFind(SEARCH_SHAPES[0].make(128, 1), t);
    expect(t.counts.mov).toBe(0);
    // The metric list therefore shows only two entries.
    expect(SEARCH_METRICS.map((m) => m.key)).toEqual(["cmp", "space"]);
  });
});

/* ================================================================
   DP: the three Fibonacci contenders must agree before costs matter
   ================================================================ */

const fibReference = (n: number): number => {
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
};

describe("Fibonacci race", () => {
  it("makes all three contenders return the same answer", () => {
    for (let n = 0; n <= 25; n++) {
      const expected = fibReference(n);
      expect(fibNaive(n, createTracer()), `naive n=${n}`).toBe(expected);
      expect(fibMemo(n, createTracer()), `memo n=${n}`).toBe(expected);
      expect(fibLoop(n, createTracer()), `loop n=${n}`).toBe(expected);
    }
  });

  it("hands every contender the same exponent", () => {
    const seen: number[] = [];
    const spies: RaceRunnable<number>[] = [FIB_NAIVE, FIB_MEMO, FIB_LOOP].map((algo) => ({
      id: algo.id,
      run: (n, t) => {
        seen.push(n);
        algo.run(n, t);
      },
    }));
    runRace(spies, 20, cloneN, NO_CAP);
    expect(seen).toEqual([20, 20, 20]);
  });

  it("charges naive recursion exactly 2*fib(n+1)-1 calls", () => {
    // The chapter quotes this formula, so the counter has to match it.
    for (const n of [5, 10, 15, 20]) {
      const t = createTracer();
      fibNaive(n, t);
      expect(t.counts.cmp, `n=${n}`).toBe(2 * fibReference(n + 1) - 1);
    }
  });

  it("charges memoization 2n-1 calls and n-1 additions", () => {
    for (const n of [5, 10, 20, 30]) {
      const t = createTracer();
      fibMemo(n, t);
      expect(t.counts.cmp, `n=${n}`).toBe(2 * n - 1);
      expect(t.counts.mov, `n=${n}`).toBe(n - 1);
    }
  });

  it("leaves tabulation with the n-1 additions but constant space", () => {
    for (const n of [10, 30, 60]) {
      const t = createTracer();
      fibLoop(n, t);
      expect(t.counts.mov, `n=${n}`).toBe(n - 1);
      expect(t.counts.space, `n=${n}`).toBeLessThanOrEqual(4);
    }
  });

  it("aborts the naive lane while the other two still report", () => {
    const results = runRace([FIB_NAIVE, FIB_MEMO, FIB_LOOP], 30, cloneN, 3_000_000);
    expect(results[0].aborted).toBe(true);
    expect(results[1].aborted).toBe(false);
    expect(results[2].aborted).toBe(false);
    expect(results[1].counts.cmp).toBe(2 * 30 - 1);
  });

  it("declares an input shape that ignores the seed", () => {
    // fib(n) has exactly one form for a given n, so Reroll has nothing to change.
    expect(FIB_INPUTS[0].make(20, 1)).toBe(FIB_INPUTS[0].make(20, 999));
  });
});

/* ================================================================
   Divide and conquer: the fast-power contenders
   ================================================================ */

const powReference = (n: number): bigint => {
  let r = 1n;
  for (let i = 0; i < n; i++) r = (r * POW_BASE) % POW_MOD;
  return r;
};

const popcount = (n: number) => n.toString(2).split("").filter((c) => c === "1").length;

describe("fast power race", () => {
  it("makes all three contenders compute the same power", () => {
    for (const n of [0, 1, 2, 7, 10, 31, 64, 100, 512, 1000]) {
      const expected = powReference(n);
      expect(powNaive(n, createTracer()), `naive n=${n}`).toBe(expected);
      expect(powRecursive(n, createTracer()), `recursive n=${n}`).toBe(expected);
      expect(powIterative(n, createTracer()), `iterative n=${n}`).toBe(expected);
    }
  });

  it("hands every contender the same exponent", () => {
    for (const shape of POW_SHAPES) {
      const input = shape.make(1000, 1);
      const seen: number[] = [];
      const spies: RaceRunnable<number>[] = POW_ALGOS.map((algo) => ({
        id: algo.id,
        run: (n, t) => {
          seen.push(n);
          algo.run(n, t);
        },
      }));
      runRace(spies, input, (v) => v, NO_CAP);
      expect(seen, shape.id).toEqual([input, input, input]);
    }
  });

  it("charges naive chaining n-1 multiplications", () => {
    for (const n of [10, 31, 100, 1000, 10000]) {
      const t = createTracer();
      powNaive(n, t);
      expect(t.counts.cmp, `n=${n}`).toBe(n - 1);
    }
  });

  it("charges recursive fast power floor(log2 n) + popcount(n) - 1", () => {
    for (const n of [10, 31, 100, 1000, 10000]) {
      const t = createTracer();
      powRecursive(n, t);
      expect(t.counts.cmp, `n=${n}`).toBe(
        Math.floor(Math.log2(n)) + popcount(n) - 1,
      );
    }
  });

  it("keeps the recursive stack logarithmic and the iterative one constant", () => {
    for (const n of [100, 1000, 10000]) {
      const rec = createTracer();
      powRecursive(n, rec);
      const iter = createTracer();
      powIterative(n, iter);
      expect(rec.counts.space, `n=${n}`).toBe(Math.floor(Math.log2(n)) + 1);
      expect(iter.counts.space, `n=${n}`).toBe(2);
    }
  });

  it("never records an array write, because this problem has none", () => {
    for (const algo of POW_ALGOS) {
      const t = createTracer();
      algo.run(1000, t);
      expect(t.counts.mov, algo.id).toBe(0);
    }
    expect(POW_METRICS.map((m) => m.key)).toEqual(["cmp", "space"]);
  });

  it("builds the power-of-two shape as the largest 2^k not exceeding n", () => {
    expect(pow2Floor(10)).toBe(8);
    expect(pow2Floor(31)).toBe(16);
    expect(pow2Floor(1000)).toBe(512);
    expect(pow2Floor(10000)).toBe(8192);
    const pow2 = POW_SHAPES.find((s) => s.id === "pow2");
    expect(pow2?.make(10000, 1)).toBe(8192);
  });
});

/* ================================================================
   Metric labels: the numbers only mean something if the labels do
   ================================================================ */

describe("metric labels", () => {
  it("defines comparisons, moves and extra space in the default set", () => {
    expect(DEFAULT_METRICS.map((m) => m.key)).toEqual(["cmp", "mov", "space"]);

    const [cmp, mov, space] = DEFAULT_METRICS;
    expect(cmp.label).toEqual({ en: "Comparisons", zh: "比较次数" });
    expect(mov.label).toEqual({ en: "Moves", zh: "移动次数" });
    expect(space.label).toEqual({ en: "Extra space", zh: "额外空间" });

    // A swap counting as two writes is the rule the sorting numbers rely on.
    expect(JSON.stringify(mov.tip)).toContain("swap counts as 2");
    // Extra space must be stated as a peak that excludes the input.
    expect(JSON.stringify(space.tip)).toContain("Peak");
    expect(JSON.stringify(space.tip)).toContain("input excluded");
  });

  it("gives every metric both languages", () => {
    for (const set of [DEFAULT_METRICS, SEARCH_METRICS, POW_METRICS]) {
      for (const m of set) {
        expect(m.label).toHaveProperty("en");
        expect(m.label).toHaveProperty("zh");
        expect(m.tip, `${m.key} needs a definition`).toBeDefined();
        expect(m.tip).toHaveProperty("en");
        expect(m.tip).toHaveProperty("zh");
      }
    }
  });

  it("relabels cmp where a plain comparison is not what is being counted", () => {
    // A search compares, but fast power multiplies and Fibonacci calls.
    expect(JSON.stringify(POW_METRICS[0].label)).toContain("Multiplication");
    expect(JSON.stringify(SEARCH_METRICS[0].label)).toContain("Comparisons");
  });
});
