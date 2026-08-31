import { describe, expect, it } from "vitest";
import { createTracer, type RaceCounts } from "@/lib/race-core";
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
import type { RaceAlgo } from "@/lib/race";

/** Run one contender over a copy of the input and report both the result and the bill. */
function bill(algo: RaceAlgo<Arr>, input: Arr): { out: Arr; counts: RaceCounts } {
  const t = createTracer();
  const out = cloneArr(input);
  algo.run(out, t);
  return { out, counts: t.counts };
}

const ALL = [BUBBLE, SELECTION, INSERTION, MERGE, QUICK_LAST, QUICK_RANDOM];
const isSorted = (a: Arr) => a.every((v, i) => i === 0 || a[i - 1] <= v);
/** Comparisons a quadratic sort needs when it cannot skip anything: n(n-1)/2. */
const pairs = (n: number) => (n * (n - 1)) / 2;

describe("every contender actually sorts", () => {
  it("returns a sorted permutation of the input for every shape, size and seed", () => {
    for (const shape of SHAPES) {
      for (const n of [0, 1, 2, 3, 5, 17, 32, 64]) {
        for (const seed of [1, 2, 7, 99]) {
          const input = shape.make(n, seed);
          const reference = cloneArr(input).sort((x, y) => x - y);
          for (const algo of ALL) {
            const { out } = bill(algo, input);
            expect(
              out,
              `${algo.id} on ${shape.id} n=${n} seed=${seed}`,
            ).toEqual(reference);
          }
        }
      }
    }
  });
});

describe("already sorted input", () => {
  const n = 32;
  const input = SORTED.make(n, 1);

  it("costs insertion sort n-1 comparisons and no moves at all", () => {
    const { counts, out } = bill(INSERTION, input);
    expect(counts.cmp).toBe(n - 1); // 31
    expect(counts.mov).toBe(0);
    expect(isSorted(out)).toBe(true);
  });

  it("stops bubble sort after a single clean pass", () => {
    const { counts } = bill(BUBBLE, input);
    // One pass over an already ordered array performs n-1 comparisons, swaps
    // nothing, and the swapped flag ends the outer loop.
    expect(counts.cmp).toBe(n - 1); // 31
    expect(counts.mov).toBe(0);
  });

  it("does not help selection sort at all", () => {
    const { counts } = bill(SELECTION, input);
    expect(counts.cmp).toBe(pairs(n)); // 496
    expect(counts.mov).toBe(0);
  });
});

describe("selection sort is blind to input order", () => {
  it("always performs exactly n(n-1)/2 comparisons", () => {
    for (const n of [8, 16, 32, 64]) {
      for (const shape of SHAPES) {
        const { counts } = bill(SELECTION, shape.make(n, 5));
        expect(counts.cmp, `${shape.id} n=${n}`).toBe(pairs(n));
      }
    }
  });

  it("never writes more than 2(n-1) times, which is its selling point", () => {
    for (const shape of SHAPES) {
      const { counts } = bill(SELECTION, shape.make(32, 5));
      expect(counts.mov, shape.id).toBeLessThanOrEqual(2 * (32 - 1));
    }
  });
});

describe("insertion sort scales with disorder", () => {
  const n = 32;

  it("does strictly more work on reversed input than on sorted input", () => {
    const sorted = bill(INSERTION, SORTED.make(n, 1)).counts;
    const nearly = bill(INSERTION, NEARLY.make(n, 1)).counts;
    const reversed = bill(INSERTION, REVERSED.make(n, 1)).counts;

    expect(nearly.cmp).toBeGreaterThanOrEqual(sorted.cmp);
    expect(reversed.cmp).toBeGreaterThan(nearly.cmp);
    expect(reversed.mov).toBeGreaterThan(nearly.mov);
  });

  it("hits its worst case on reversed input", () => {
    const { counts } = bill(INSERTION, REVERSED.make(n, 1));
    // Every element must travel past all of its predecessors.
    expect(counts.cmp).toBe(pairs(n)); // 496
    // Each of the n-1 insertions shifts every earlier element, then lands once.
    expect(counts.mov).toBe(pairs(n) + (n - 1)); // 527
  });
});

describe("merge sort", () => {
  it("returns sorted output and rents O(n)-class auxiliary storage", () => {
    for (const n of [16, 32, 64]) {
      const { out, counts } = bill(MERGE, RANDOM.make(n, 4));
      expect(isSorted(out)).toBe(true);
      // It borrows a full-size buffer, plus the recursion stack on top of it.
      const depth = Math.ceil(Math.log2(n)) + 1;
      expect(counts.space).toBeGreaterThanOrEqual(n);
      expect(counts.space).toBeLessThanOrEqual(n + depth);
    }
  });

  it("pays the same movement cost whatever the input looks like", () => {
    // Textbook merge sort is not adaptive: this is exactly why Timsort adds run
    // detection, and the sorting chapter makes that point with these numbers.
    const moves = SHAPES.map((s) => bill(MERGE, s.make(32, 4)).counts.mov);
    expect(new Set(moves).size).toBe(1);
    // 2 writes per element per level: into the buffer, then back.
    expect(moves[0]).toBe(2 * 32 * Math.log2(32));
  });

  it("uses far fewer comparisons than a quadratic sort at the same size", () => {
    const n = 64;
    const merge = bill(MERGE, RANDOM.make(n, 4)).counts.cmp;
    const selection = bill(SELECTION, RANDOM.make(n, 4)).counts.cmp;
    expect(merge).toBeLessThan(selection / 4);
  });
});

describe("quicksort pivot choice", () => {
  const n = 32;

  it("degrades visibly on sorted input when the pivot is always the last element", () => {
    const sorted = bill(QUICK_LAST, SORTED.make(n, 1)).counts;
    const random = bill(QUICK_LAST, RANDOM.make(n, 1)).counts;

    // Every partition splits 1 : n-1, so it reaches the quadratic comparison count.
    expect(sorted.cmp).toBe(pairs(n)); // 496
    expect(sorted.cmp).toBeGreaterThan(random.cmp * 3);
    // And the recursion depth grows with n instead of log n - this is the stack
    // overflow that the chapter warns about.
    expect(sorted.space).toBeGreaterThanOrEqual(n);
  });

  it("keeps a random pivot near the n log n class on that same input", () => {
    const fixed = bill(QUICK_LAST, SORTED.make(n, 1)).counts;
    const randomised = bill(QUICK_RANDOM, SORTED.make(n, 1)).counts;

    expect(randomised.cmp).toBeLessThan(fixed.cmp / 2);
    expect(randomised.space).toBeLessThan(fixed.space / 2);
  });

  it("makes the random-pivot contender reproducible under its fixed seed", () => {
    // The race must be repeatable, so the randomised pivot uses a seeded generator
    // rather than Math.random.
    const input = RANDOM.make(64, 11);
    const first = bill(QUICK_RANDOM, input);
    const second = bill(QUICK_RANDOM, input);
    expect(second.counts).toEqual(first.counts);
    expect(second.out).toEqual(first.out);
  });
});

describe("duplicate-heavy input", () => {
  it("is still sorted correctly by every contender", () => {
    const input = FEW_UNIQUE.make(64, 6);
    expect(new Set(input).size).toBeLessThanOrEqual(3);
    const reference = cloneArr(input).sort((x, y) => x - y);
    for (const algo of ALL) {
      const { out } = bill(algo, input);
      expect(out, algo.id).toEqual(reference);
    }
  });

  it("preserves the multiset of values, dropping and inventing nothing", () => {
    const input = FEW_UNIQUE.make(48, 9);
    const tally = (a: Arr) =>
      a.reduce<Record<number, number>>((m, v) => ({ ...m, [v]: (m[v] ?? 0) + 1 }), {});
    for (const algo of ALL) {
      expect(tally(bill(algo, input).out), algo.id).toEqual(tally(input));
    }
  });
});

describe("input shapes", () => {
  it("builds what their labels promise", () => {
    const n = 32;
    expect(isSorted(SORTED.make(n, 1))).toBe(true);
    expect(isSorted(REVERSED.make(n, 1))).toBe(false);
    expect([...REVERSED.make(n, 1)].reverse()).toEqual(
      cloneArr(REVERSED.make(n, 1)).sort((a, b) => a - b),
    );
    expect(new Set(FEW_UNIQUE.make(n, 1)).size).toBeLessThanOrEqual(3);
    // "Nearly sorted" must be close to sorted but not identical to it.
    const nearly = NEARLY.make(n, 1);
    expect(isSorted(nearly)).toBe(false);
    expect(bill(INSERTION, nearly).counts.mov).toBeLessThan(n);
  });

  it("gives every shape the requested size", () => {
    for (const shape of SHAPES) {
      for (const n of [0, 1, 8, 33]) {
        expect(shape.make(n, 1), `${shape.id} n=${n}`).toHaveLength(n);
      }
    }
  });
});
