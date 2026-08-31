// Pure counting engine for the algorithm race - no React, no i18n, no DOM.
//
// It lives apart from lib/race.tsx so the measurement logic can be imported and
// tested on its own. lib/race.tsx re-exports everything here, so existing
// imports from "@/lib/race" keep working.
//
// Counting rules (identical to the ones printed under every race, and the reason
// the numbers are trustworthy):
//   - comparison: one size comparison between two elements
//   - move:       one write into an array slot; a swap is 2 writes
//   - extra space: the simultaneous peak of auxiliary cells + recursion frames.
//                  The input array itself is never counted: contenders only report
//                  what they allocate on top of it.

export interface RaceCounts {
  /** Number of comparisons */
  cmp: number;
  /** Number of moves (array writes) */
  mov: number;
  /** Peak extra space: auxiliary cells + recursion stack frames */
  space: number;
}

export interface Tracer {
  /** Record one comparison */
  cmp(n?: number): void;
  /** Record n writes (record 2 for a swap) */
  mov(n?: number): void;
  /** Take n auxiliary cells */
  alloc(n: number): void;
  /** Release n auxiliary cells */
  free(n: number): void;
  /** Enter one level of recursion */
  enter(): void;
  /** Leave one level of recursion */
  exit(): void;
}

/** A tracer that also exposes what it has counted so far. */
export interface TracerHandle extends Tracer {
  readonly counts: RaceCounts;
}

/** Thrown when the operation count exceeds the cap -- it makes "naive recursion blows up"
 *  visible in a controlled way instead of hanging the page. */
export class RaceAbort extends Error {
  constructor() {
    super("Race aborted: operation cap exceeded");
    this.name = "RaceAbort";
  }
}

class Trace implements TracerHandle {
  private c = 0;
  private m = 0;
  private live = 0;
  private depth = 0;
  private peak = 0;
  private ops = 0;
  constructor(private cap: number) {}

  /** Extra space is a peak, not a final reading: sample it whenever the live total grows. */
  private touch() {
    const cur = this.live + this.depth;
    if (cur > this.peak) this.peak = cur;
  }

  private tick(n: number) {
    this.ops += n;
    if (this.ops > this.cap) throw new RaceAbort();
  }

  cmp(n = 1) {
    this.c += n;
    this.tick(n);
  }
  mov(n = 1) {
    this.m += n;
    this.tick(n);
  }
  alloc(n: number) {
    this.live += n;
    this.touch();
  }
  free(n: number) {
    this.live = Math.max(0, this.live - n);
  }
  enter() {
    this.depth++;
    this.tick(1);
    this.touch();
  }
  exit() {
    this.depth = Math.max(0, this.depth - 1);
  }

  get counts(): RaceCounts {
    return { cmp: this.c, mov: this.m, space: this.peak };
  }
}

/** Build a tracer. Without a cap it counts forever; runRace always passes one. */
export function createTracer(cap = Number.POSITIVE_INFINITY): TracerHandle {
  return new Trace(cap);
}

/* ================================================================
   Deterministic randomness -- the same seed builds the same input,
   so a race can be reproduced exactly.
   ================================================================ */

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = (t ^ (t >>> 15)) * (t | 1);
    t ^= t + ((t ^ (t >>> 7)) * (t | 61));
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ================================================================
   Running a race
   ================================================================ */

export interface LaneResult {
  id: string;
  counts: RaceCounts;
  /** Aborted because the operation cap was exceeded -- it is unusable at this size */
  aborted: boolean;
}

/** The only thing runRace needs from a contender; RaceAlgo in lib/race.tsx satisfies it. */
export interface RaceRunnable<I> {
  id: string;
  run: (input: I, t: Tracer) => void;
}

/**
 * Run every contender over the same input and report what each one cost.
 *
 * Each lane gets its own clone, so one contender mutating the input (every sort
 * does) can never change what the next one receives. A lane that exceeds the cap
 * is marked aborted and the remaining lanes still run.
 */
export function runRace<I>(
  algos: RaceRunnable<I>[],
  input: I,
  clone: (v: I) => I,
  cap: number,
): LaneResult[] {
  return algos.map((a) => {
    const t = createTracer(cap);
    let aborted = false;
    try {
      a.run(clone(input), t);
    } catch (e) {
      if (e instanceof RaceAbort) aborted = true;
      else throw e;
    }
    return { id: a.id, counts: t.counts, aborted };
  });
}
