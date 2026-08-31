import { describe, expect, it } from "vitest";
import {
  RaceAbort,
  createTracer,
  rng,
  runRace,
  type RaceRunnable,
  type Tracer,
} from "@/lib/race-core";
import { INSERTION, RANDOM, SORTED, cloneArr, type Arr } from "@/lib/race-sorts";

describe("tracer counting", () => {
  it("counts comparisons and moves, with and without an explicit amount", () => {
    const t = createTracer();
    t.cmp();
    t.cmp(5);
    t.mov();
    t.mov(3);
    expect(t.counts.cmp).toBe(6);
    expect(t.counts.mov).toBe(4);
  });

  it("does not let comparisons and moves bleed into each other", () => {
    const t = createTracer();
    t.cmp(7);
    expect(t.counts.mov).toBe(0);
    t.mov(2);
    expect(t.counts.cmp).toBe(7);
  });

  it("counts auxiliary cells and recursion frames in the same space budget", () => {
    const cells = createTracer();
    cells.alloc(4);
    expect(cells.counts.space).toBe(4);

    const frames = createTracer();
    frames.enter();
    frames.enter();
    frames.enter();
    expect(frames.counts.space).toBe(3);

    // A contender holding both at once is charged for both.
    const both = createTracer();
    both.alloc(4);
    both.enter();
    both.enter();
    expect(both.counts.space).toBe(6);
  });

  it("releases cells on free and frames on exit", () => {
    const t = createTracer();
    t.alloc(10);
    t.free(10);
    t.alloc(2);
    // The peak stays at 10; see the peak test below. What matters here is that the
    // live total came back down, so the later alloc did not stack on top of it.
    expect(t.counts.space).toBe(10);

    const deep = createTracer();
    deep.enter();
    deep.enter();
    deep.exit();
    deep.exit();
    deep.enter();
    expect(deep.counts.space).toBe(2);
  });

  it("never reports negative space when free or exit is unbalanced", () => {
    const t = createTracer();
    t.free(5);
    t.exit();
    t.alloc(1);
    expect(t.counts.space).toBeGreaterThanOrEqual(0);
    expect(t.counts.space).toBe(1);
  });
});

describe("extra space is a peak, not a final reading", () => {
  it("keeps the high-water mark after everything is released", () => {
    const t = createTracer();
    t.alloc(64);
    t.free(64);
    expect(t.counts.space).toBe(64);
  });

  it("keeps the deepest recursion depth after unwinding", () => {
    const t = createTracer();
    for (let i = 0; i < 12; i++) t.enter();
    for (let i = 0; i < 12; i++) t.exit();
    expect(t.counts.space).toBe(12);
  });

  it("reports the simultaneous peak, not the sum of everything ever taken", () => {
    const t = createTracer();
    // Three allocations of 10, each released before the next: the peak is 10.
    for (let i = 0; i < 3; i++) {
      t.alloc(10);
      t.free(10);
    }
    expect(t.counts.space).toBe(10);
  });
});

describe("the input is not charged as extra space", () => {
  it("reports the same O(1) footprint no matter how large the input is", () => {
    const small = createTracer();
    INSERTION.run(SORTED.make(8, 1), small);
    const large = createTracer();
    INSERTION.run(SORTED.make(256, 1), large);

    expect(small.counts.space).toBe(large.counts.space);
    // An in-place sort holds one element in hand; nothing about the 256-element
    // array is added to that.
    expect(large.counts.space).toBe(1);
  });

  it("charges a contender only for what it takes on top of the input", () => {
    const t = createTracer();
    const input = SORTED.make(100, 1);
    // Reading the input costs nothing; only the explicit allocation is counted.
    for (const v of input) t.cmp(v > 0 ? 1 : 1);
    expect(t.counts.space).toBe(0);
    t.alloc(3);
    expect(t.counts.space).toBe(3);
  });
});

describe("the operation cap", () => {
  it("throws RaceAbort once the cap is passed", () => {
    const t = createTracer(10);
    expect(() => {
      for (let i = 0; i < 50; i++) t.cmp();
    }).toThrow(RaceAbort);
  });

  it("counts recursion frames towards the cap, so infinite recursion is stopped", () => {
    const t = createTracer(100);
    expect(() => {
      for (let i = 0; i < 500; i++) t.enter();
    }).toThrow(RaceAbort);
  });

  it("marks the lane aborted instead of letting the error escape runRace", () => {
    const runaway: RaceRunnable<number> = {
      id: "runaway",
      run: (_n, t) => {
        // eslint-disable-next-line no-constant-condition
        while (true) t.cmp();
      },
    };
    let results!: ReturnType<typeof runRace<number>>;
    expect(() => {
      results = runRace<number>([runaway], 1, (v) => v, 1_000);
    }).not.toThrow();
    expect(results[0].aborted).toBe(true);
    expect(results[0].id).toBe("runaway");
  });

  it("lets a genuine bug in a contender surface instead of hiding it as an abort", () => {
    const broken: RaceRunnable<number> = {
      id: "broken",
      run: () => {
        throw new TypeError("not a cap problem");
      },
    };
    expect(() => runRace<number>([broken], 1, (v) => v, 1_000)).toThrow(TypeError);
  });
});

describe("one aborted contender does not stop the others", () => {
  it("still reports full counts for the lanes that finished", () => {
    const runaway: RaceRunnable<Arr> = {
      id: "runaway",
      run: (_a, t) => {
        // eslint-disable-next-line no-constant-condition
        while (true) t.cmp();
      },
    };
    const cheap: RaceRunnable<Arr> = {
      id: "cheap",
      run: (a, t) => {
        t.alloc(1);
        for (let i = 1; i < a.length; i++) t.cmp();
      },
    };

    const results = runRace([runaway, cheap, INSERTION], SORTED.make(32, 1), cloneArr, 5_000);

    expect(results.map((r) => r.id)).toEqual(["runaway", "cheap", "insertion"]);
    expect(results[0].aborted).toBe(true);
    expect(results[1].aborted).toBe(false);
    expect(results[1].counts.cmp).toBe(31);
    expect(results[2].aborted).toBe(false);
    expect(results[2].counts.cmp).toBe(31);
  });

  it("keeps an aborted lane's counters from leaking into the next lane", () => {
    const greedy: RaceRunnable<number> = {
      id: "greedy",
      run: (_n, t) => {
        // eslint-disable-next-line no-constant-condition
        while (true) t.mov();
      },
    };
    const tiny: RaceRunnable<number> = {
      id: "tiny",
      run: (_n, t) => t.mov(2),
    };
    const results = runRace<number>([greedy, tiny], 0, (v) => v, 500);
    expect(results[1].counts.mov).toBe(2);
  });
});

describe("every contender races the same input", () => {
  it("hands each lane its own clone, so a sort cannot disturb the next lane", () => {
    const seen: Arr[] = [];
    const spy = (id: string): RaceRunnable<Arr> => ({
      id,
      run: (a) => {
        seen.push([...a]);
        a.sort((x, y) => x - y); // destructive on purpose
      },
    });

    const input = RANDOM.make(16, 3);
    const before = [...input];
    runRace([spy("a"), spy("b"), spy("c")], input, cloneArr, 1e6);

    expect(seen).toHaveLength(3);
    expect(seen[0]).toEqual(before);
    expect(seen[1]).toEqual(before);
    expect(seen[2]).toEqual(before);
  });

  it("leaves the caller's input untouched", () => {
    const input = RANDOM.make(16, 3);
    const before = [...input];
    runRace([INSERTION], input, cloneArr, 1e6);
    expect(input).toEqual(before);
  });

  it("gives each lane a distinct array object, not a shared reference", () => {
    const refs: Arr[] = [];
    const capture = (id: string): RaceRunnable<Arr> => ({
      id,
      run: (a) => {
        refs.push(a);
      },
    });
    const input = RANDOM.make(8, 5);
    runRace([capture("a"), capture("b")], input, cloneArr, 1e6);
    expect(refs[0]).not.toBe(refs[1]);
    expect(refs[0]).not.toBe(input);
  });
});

describe("deterministic randomness", () => {
  it("produces an identical stream for the same seed", () => {
    const a = rng(12345);
    const b = rng(12345);
    const left = Array.from({ length: 20 }, () => a());
    const right = Array.from({ length: 20 }, () => b());
    expect(left).toEqual(right);
  });

  it("builds the identical input for the same seed", () => {
    expect(RANDOM.make(64, 7)).toEqual(RANDOM.make(64, 7));
  });

  it("builds a different input for a different seed", () => {
    expect(RANDOM.make(64, 7)).not.toEqual(RANDOM.make(64, 8));
  });

  it("stays inside the unit interval", () => {
    const r = rng(99);
    for (let i = 0; i < 500; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("keeps a seed-independent shape identical across seeds", () => {
    // "Already sorted" has exactly one form for a given n, which is why the
    // Reroll button is disabled for it.
    expect(SORTED.make(32, 1)).toEqual(SORTED.make(32, 999));
  });
});

// Guards the Tracer contract that every contender is written against.
describe("tracer interface", () => {
  it("accepts any object satisfying Tracer", () => {
    const calls: string[] = [];
    const fake: Tracer = {
      cmp: () => calls.push("cmp"),
      mov: () => calls.push("mov"),
      alloc: () => calls.push("alloc"),
      free: () => calls.push("free"),
      enter: () => calls.push("enter"),
      exit: () => calls.push("exit"),
    };
    INSERTION.run([3, 1, 2], fake);
    expect(calls).toContain("cmp");
    expect(calls).toContain("alloc");
  });
});
