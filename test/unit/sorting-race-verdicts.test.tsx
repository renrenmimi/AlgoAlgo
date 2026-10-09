import { describe, expect, it } from "vitest";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createTracer, runRace, type LaneResult, type RaceCounts, type Tracer } from "@/lib/race-core";
import type { RaceAlgo } from "@/lib/race";
import {
  BUBBLE,
  FEW_UNIQUE,
  INSERTION,
  MERGE,
  NEARLY,
  QUICK_LAST,
  QUICK_RANDOM,
  RANDOM,
  REVERSED,
  SELECTION,
  SHAPES,
  SORTED,
  cloneArr,
  type Arr,
} from "@/lib/race-sorts";
import {
  bubbleFrames,
  quickDepth,
  sortRace1Verdict,
  sortRace2Verdict,
  sortRace3Verdict,
} from "@/app/sorting/viz";

// The verdicts under the three sorting races (app/sorting/page.tsx, §05) must agree with
// the numbers printed above them, for every shape, size and seed a reader can reach.
// The race starts at seed 7 and Reroll adds one each time, so seeds 1–40 cover what a
// reader will realistically see.

const CAP = 3_000_000; // AlgoRace's default operation cap
const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);
const SIZES_1 = [8, 16, 32, 64];
const SIZES_2 = [8, 16, 32, 64, 128];
const SIZES_3 = [16, 32, 64, 128];

type Loc = { en: ReactNode; zh: ReactNode };

/** Rendered text of a node, entities decoded and whitespace collapsed. */
function text(node: ReactNode): string {
  return renderToStaticMarkup(<>{node}</>)
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function render(v: unknown): { en: string; zh: string } {
  const loc = v as Loc;
  return { en: text(loc.en), zh: text(loc.zh) };
}

/** Every integer printed in the text ("2,883" counts as 2883). */
const numbersIn = (s: string): number[] =>
  (s.match(/\d[\d,]*/g) ?? []).map((x) => Number(x.replace(/,/g, "")));

const fmt = (n: number) => n.toLocaleString("en-US");

const race = (algos: RaceAlgo<Arr>[], input: Arr): LaneResult[] =>
  runRace(algos, input, cloneArr, CAP);

const countsOf = (r: LaneResult[], id: string): RaceCounts => {
  const lane = r.find((x) => x.id === id);
  if (!lane) throw new Error(`no lane ${id}`);
  return lane.counts;
};

const valuesOf = (c: RaceCounts) => [c.cmp, c.mov, c.space];

/** The deepest recursion a contender reaches, counted independently of its space figure. */
function measuredDepth(algo: RaceAlgo<Arr>, input: Arr): number {
  const inner = createTracer();
  let depth = 0;
  let peak = 0;
  const t: Tracer = {
    cmp: (n) => inner.cmp(n),
    mov: (n) => inner.mov(n),
    alloc: (n) => inner.alloc(n),
    free: (n) => inner.free(n),
    enter: () => {
      inner.enter();
      depth++;
      peak = Math.max(peak, depth);
    },
    exit: () => {
      inner.exit();
      depth--;
    },
  };
  algo.run(cloneArr(input), t);
  return peak;
}

/** Every number the verdict prints must be one the race actually produced. */
function expectOnlyMeasuredNumbers(v: { en: string; zh: string }, allowed: number[], where: string) {
  const ok = new Set(allowed);
  for (const lang of ["en", "zh"] as const) {
    for (const n of numbersIn(v[lang])) {
      expect(ok.has(n), `${where} [${lang}] prints ${n}, which is not a measured value: ${v[lang]}`).toBe(
        true,
      );
    }
  }
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/* ================================================================
   Race 1 · insertion, bubble and selection sort
   ================================================================ */

describe("race 1 verdict", () => {
  it("states only measured numbers and only comparisons the counts support", () => {
    for (const shape of SHAPES) {
      for (const n of SIZES_1) {
        for (const seed of SEEDS) {
          const r = race([INSERTION, BUBBLE, SELECTION], shape.make(n, seed));
          const ins = countsOf(r, "insertion");
          const bub = countsOf(r, "bubble");
          const sel = countsOf(r, "selection");
          const v = render(sortRace1Verdict(r, { size: n, inputId: shape.id }));
          const where = `${shape.id} n=${n} seed=${seed}`;
          const share = Math.round((100 * ins.cmp) / bub.cmp);

          expectOnlyMeasuredNumbers(v, [...valuesOf(ins), ...valuesOf(bub), ...valuesOf(sel), n, share], where);

          // "exactly the same number it spends on every other shape" / "stays pinned"
          expect(sel.cmp, where).toBe((n * (n - 1)) / 2);

          if (shape.id === "sorted" || shape.id === "nearly") {
            expect(v.en, where).toContain(`${fmt(sel.cmp)} comparisons`);
            expect(v.en.includes("does not write at all"), where).toBe(ins.mov === 0);
            expect(v.zh.includes("一次也不写"), where).toBe(ins.mov === 0);
            expect(ins.cmp, where).toBeLessThan(sel.cmp);
            continue;
          }

          if (shape.id === "reversed") {
            expect(v.en, where).toMatch(/^Reversed input/);
            expect(v.en, where).toContain("No other shape lets selection sort save as many writes");
            expect(ins.mov, where).toBeGreaterThan(sel.mov);
            continue;
          }

          // Random and many duplicates.
          expect(v.en, where).toContain(
            `Insertion sort compares ${fmt(ins.cmp)} times, ${share}% of bubble sort's ${fmt(bub.cmp)}`,
          );
          expect(ins.cmp, where).toBeLessThan(bub.cmp);
          const narrow = v.en.includes("the gap is still narrow");
          expect(narrow, where).toBe(ins.cmp > 0.65 * bub.cmp);
          expect(v.zh.includes("差距还不明显"), where).toBe(narrow);

          const fewest = v.en.includes("it writes the fewest");
          const tie = v.en.includes("tie for the fewest");
          const notFewest = v.en.includes("does not even write the fewest");
          expect([fewest, tie, notFewest].filter(Boolean), where).toHaveLength(1);
          if (fewest) expect(sel.mov, where).toBeLessThan(Math.min(ins.mov, bub.mov));
          if (tie) expect(sel.mov, where).toBe(Math.min(ins.mov, bub.mov));
          if (notFewest) expect(ins.mov, where).toBeLessThan(sel.mov);
          expect(v.zh.includes("写入最少"), where).toBe(fewest);
          expect(v.zh.includes("与最少的并列"), where).toBe(tie);
          expect(v.zh.includes("连写入都不是最少"), where).toBe(notFewest);
        }
      }
    }
  });

  it('backs "raise n and insertion sort pulls further ahead" on unordered input', () => {
    for (const shape of [RANDOM, FEW_UNIQUE]) {
      const ratios = SIZES_1.map((n) =>
        mean(
          SEEDS.map((seed) => {
            const r = race([INSERTION, BUBBLE], shape.make(n, seed));
            return countsOf(r, "insertion").cmp / countsOf(r, "bubble").cmp;
          }),
        ),
      );
      for (let i = 1; i < ratios.length; i++) {
        expect(ratios[i], `${shape.id}: ${ratios.join(", ")}`).toBeLessThan(ratios[i - 1]);
      }
    }
  });

  it("backs the claim that reversed input is where selection sort saves the most writes", () => {
    for (const n of SIZES_1) {
      for (const seed of SEEDS) {
        const saved = (input: Arr) => {
          const r = race([INSERTION, SELECTION], input);
          return countsOf(r, "insertion").mov - countsOf(r, "selection").mov;
        };
        const reversed = saved(REVERSED.make(n, seed));
        for (const shape of SHAPES) {
          expect(reversed, `${shape.id} n=${n} seed=${seed}`).toBeGreaterThanOrEqual(
            saved(shape.make(n, seed)),
          );
        }
      }
    }
  });
});

/* ================================================================
   Race 2 · insertion sort against merge sort and randomised quicksort
   ================================================================ */

describe("race 2 verdict", () => {
  it("states only measured numbers and only comparisons the counts support", () => {
    for (const shape of SHAPES) {
      for (const n of SIZES_2) {
        for (const seed of SEEDS) {
          const input = shape.make(n, seed);
          const r = race([INSERTION, MERGE, QUICK_RANDOM], input);
          const ins = countsOf(r, "insertion");
          const mer = countsOf(r, "merge");
          const qr = countsOf(r, "quick-rand");
          const v = render(sortRace2Verdict(r, { size: n, inputId: shape.id }));
          const where = `${shape.id} n=${n} seed=${seed}`;
          const depth = measuredDepth(QUICK_RANDOM, input);

          expect(quickDepth(qr), where).toBe(depth);
          expectOnlyMeasuredNumbers(
            v,
            [...valuesOf(ins), ...valuesOf(mer), ...valuesOf(qr), n, depth, 75, 128],
            where,
          );

          if (v.en.startsWith("Here is the headline")) {
            expect(["sorted", "nearly"], where).toContain(shape.id);
            // "the O(n²) algorithm beats merge sort", on every meter
            expect(ins.cmp, where).toBeLessThan(mer.cmp);
            expect(ins.mov, where).toBeLessThan(mer.mov);
            expect(ins.space, where).toBeLessThan(mer.space);
            if (v.en.includes("beats both O(n log n) ones")) {
              expect(ins.cmp, where).toBeLessThan(qr.cmp);
              expect(ins.mov, where).toBeLessThan(qr.mov);
              expect(ins.space, where).toBeLessThan(qr.space);
            }
            // "little more than one comparison per element"
            expect(ins.cmp, where).toBeLessThan(2 * n);
            // "the same moves on every other shape"
            for (const other of SHAPES) {
              const m = countsOf(race([MERGE], other.make(n, seed)), "merge");
              expect(m.mov, `${where} vs ${other.id}`).toBe(mer.mov);
            }
            continue;
          }
          expect(["sorted", "nearly"], where).not.toContain(shape.id);

          if (shape.id === "few") {
            expect(v.en, where).toContain(`its recursion goes ${fmt(depth)} levels deep`);
            expect(v.zh, where).toContain(`递归深达 ${fmt(depth)} 层`);
            expect(v.en.includes("more than even insertion sort"), where).toBe(qr.cmp > ins.cmp);
            expect(v.zh.includes("比插入排序的"), where).toBe(qr.cmp > ins.cmp);
            if (v.en.includes("far deeper than the O(log n)")) {
              expect(depth, where).toBeGreaterThan(3 * Math.log2(n));
            }
            // "Merge sort is not slowed down by duplicates": still within its n log n bound
            expect(mer.cmp, where).toBeLessThanOrEqual(n * Math.ceil(Math.log2(n)));
            continue;
          }

          // Random and reversed.
          const shows = v.en.startsWith("Now the asymptotics show");
          const notYet = v.en.startsWith(`At n = ${n} the asymptotics have not taken over yet`);
          expect(shows !== notYet, where).toBe(true);
          expect(shows, where).toBe(ins.cmp >= 1.2 * mer.cmp);
          expect(v.zh.startsWith("这下渐进复杂度开始显现"), where).toBe(shows);
          if (v.en.includes("try 128")) expect(n, where).toBeLessThan(128);
          // "randomised quicksort needs only ..."
          expect(qr.space, where).toBeLessThan(mer.space);
        }
      }
    }
  });

  it('backs "raise n" in both directions', () => {
    const meanRatio = (shape: typeof RANDOM, n: number) =>
      mean(
        SEEDS.map((seed) => {
          const r = race([INSERTION, MERGE], shape.make(n, seed));
          return countsOf(r, "insertion").cmp / countsOf(r, "merge").cmp;
        }),
      );
    for (let i = 1; i < SIZES_2.length; i++) {
      // "Raise n and merge sort pulls away" on random input
      expect(meanRatio(RANDOM, SIZES_2[i])).toBeGreaterThan(meanRatio(RANDOM, SIZES_2[i - 1]));
      // "Raising n only widens the gap" on sorted and nearly sorted input
      expect(meanRatio(SORTED, SIZES_2[i])).toBeLessThan(meanRatio(SORTED, SIZES_2[i - 1]));
      expect(meanRatio(NEARLY, SIZES_2[i])).toBeLessThan(meanRatio(NEARLY, SIZES_2[i - 1]));
    }
  });
});

/* ================================================================
   Race 3 · fixed last-element pivot against a random pivot
   ================================================================ */

/** Plain Lomuto with the last element as pivot; records each pivot against its range. */
function lomutoPivots(input: Arr): { pivot: number; min: number; max: number }[] {
  const a = input.slice();
  const out: { pivot: number; min: number; max: number }[] = [];
  const go = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const range = a.slice(lo, hi + 1);
    const p = a[hi];
    out.push({ pivot: p, min: Math.min(...range), max: Math.max(...range) });
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (a[j] < p) {
        [a[i], a[j]] = [a[j], a[i]];
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    go(lo, i - 1);
    go(i + 1, hi);
  };
  go(0, a.length - 1);
  return out;
}

describe("race 3 verdict", () => {
  it("names the shape it is explaining and prints the real recursion depths", () => {
    for (const shape of [SORTED, RANDOM, REVERSED]) {
      for (const n of SIZES_3) {
        for (const seed of SEEDS) {
          const input = shape.make(n, seed);
          const r = race([QUICK_LAST, QUICK_RANDOM], input);
          const fixed = countsOf(r, "quick-last");
          const rand = countsOf(r, "quick-rand");
          const v = render(sortRace3Verdict(r, { size: n, inputId: shape.id }));
          const where = `${shape.id} n=${n} seed=${seed}`;
          const fdepth = measuredDepth(QUICK_LAST, input);
          const rdepth = measuredDepth(QUICK_RANDOM, input);

          expect(quickDepth(fixed), where).toBe(fdepth);
          expect(quickDepth(rand), where).toBe(rdepth);
          expectOnlyMeasuredNumbers(v, [...valuesOf(fixed), ...valuesOf(rand), fdepth, rdepth, 0, 1], where);

          if (shape.id === "random") {
            expect(v.en, where).toMatch(/^On random data/);
            expect(v.en, where).toContain(`${fmt(fixed.cmp)} versus ${fmt(rand.cmp)} comparisons`);
            expect(v.en.includes("costs some extra writes"), where).toBe(rand.mov > fixed.mov);
            expect(v.zh.includes("多付了一些写入"), where).toBe(rand.mov > fixed.mov);
            continue;
          }

          // Sorted and reversed: every partition peels off exactly one element (0 : n−1),
          // which is what n(n−1)/2 comparisons and a depth of n mean.
          expect(fixed.cmp, where).toBe((n * (n - 1)) / 2);
          expect(fdepth, where).toBe(n);
          expect(v.en, where).toContain(`${fmt(fixed.cmp)} comparisons with a recursion depth of ${fmt(fdepth)}`);
          expect(v.en, where).toContain(`${fmt(rand.cmp)} comparisons and depth ${fmt(rdepth)}`);
          expect(v.zh, where).toContain(`递归深度 ${fmt(fdepth)}`);
          expect(rand.cmp, where).toBeLessThan(fixed.cmp);
          expect(v.en, where).toMatch(shape.id === "sorted" ? /^Sorted input/ : /^Reversed input/);
          expect(v.zh, where).toMatch(shape.id === "sorted" ? /^已排序输入/ : /^逆序输入/);
        }
      }
    }
  });

  it("describes the pivots a fixed last-element rule actually picks", () => {
    for (const n of SIZES_3) {
      // Sorted: the pivot is always the largest element left.
      for (const p of lomutoPivots(SORTED.make(n, 1))) expect(p.pivot).toBe(p.max);
      // Reversed: the smallest value first, then alternately the largest and the smallest.
      const seq = lomutoPivots(REVERSED.make(n, 1));
      expect(seq.length).toBe(n - 1);
      seq.forEach((p, k) => expect(p.pivot, `n=${n} partition ${k}`).toBe(k % 2 === 0 ? p.min : p.max));
    }
  });

  it("backs the claim that neither pivot rule wins systematically on random data", () => {
    for (const n of SIZES_3) {
      let fixedAhead = 0;
      let randAhead = 0;
      for (const seed of SEEDS) {
        const r = race([QUICK_LAST, QUICK_RANDOM], RANDOM.make(n, seed));
        const f = countsOf(r, "quick-last").cmp;
        const q = countsOf(r, "quick-rand").cmp;
        if (f < q) fixedAhead++;
        if (q < f) randAhead++;
      }
      expect(fixedAhead, `n=${n}`).toBeGreaterThan(0);
      expect(randAhead, `n=${n}`).toBeGreaterThan(0);
    }
  });
});

/* ================================================================
   The bubble sort animation in the sorting lab (§01)
   ================================================================ */

describe("bubble sort frames", () => {
  const BASE = [5, 2, 9, 1, 6];
  const frames = bubbleFrames();
  const msgEn = (msg: ReactNode) => {
    const el = msg as ReactElement<{ en: ReactNode }>;
    return isValidElement(el) ? text(el.props.en) : text(msg);
  };

  it("ends on the sorted array with every bar settled", () => {
    const last = frames[frames.length - 1];
    expect(last.arr).toEqual([1, 2, 5, 6, 9]);
    expect(last.states.every((s) => s === "sorted")).toBe(true);
  });

  it("announces an early exit only after a round that really made no swap", () => {
    // Replay bubble sort with the early-exit flag and note which rounds swapped.
    const a = BASE.slice();
    const swappedInRound: boolean[] = [];
    const arrAfterRound: number[][] = [];
    for (let i = 0; i < a.length - 1; i++) {
      let swapped = false;
      for (let j = 0; j < a.length - 1 - i; j++) {
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          swapped = true;
        }
      }
      swappedInRound.push(swapped);
      arrAfterRound.push(a.slice());
      if (!swapped) break;
    }

    const roundEnds = frames
      .map((f) => ({ f, msg: msgEn(f.msg) }))
      .filter(({ msg }) => /^Round \d+ is finished/.test(msg));
    expect(roundEnds).toHaveLength(swappedInRound.length);
    roundEnds.forEach(({ f, msg }, k) => {
      expect(msg.startsWith(`Round ${k + 1} is finished`)).toBe(true);
      expect(f.arr).toEqual(arrAfterRound[k]);
      expect(msg.includes("performed no swaps"), `round ${k + 1}`).toBe(!swappedInRound[k]);
    });
    // The input needs more than one round, so round 1 must not claim the array is sorted.
    expect(swappedInRound[0]).toBe(true);
  });
});
