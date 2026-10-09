"use client";

// The algorithm race -- run two (or more) algorithms on the same input and measure the real
// bill: comparisons, moves, extra space.
//
// Why it is needed: big-O only describes the growth trend, not what a particular input
// actually costs. Insertion sort, at O(n^2), can get away with n-1 comparisons on a nearly
// sorted array and thoroughly beat O(n log n) merge sort -- you only see that once you add up
// the bill. This component is the machine that keeps those books.
//
// Three steps to use it:
//   1. Write an algorithm with counters: call t.cmp() on every comparison, t.mov() on every
//      write, t.alloc(n)/t.free(n) when taking and releasing auxiliary cells, and
//      t.enter()/t.exit() on entering and leaving a recursive call.
//   2. Declare the input shapes (random / sorted / reversed / many duplicates ...); the same
//      shape is fed to every contender.
//   3. <AlgoRace algos={[A, B]} inputs={PATTERNS} sizes={[8,16,32]} />
//
// The engine only knows about counts, not about algorithms, so sorting, fast exponentiation,
// Fibonacci and binary search can all share it.
//
// How things are counted (uniform across the site, printed in the UI, no hand-waving):
//   . comparison = one size comparison between two elements
//   . move = one write into an array slot; one swap = 2 writes
//   . space = the peak of "auxiliary cells + recursion stack frames" at any instant
//     (the input itself is not counted)

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useL, type Loc } from "@/lib/i18n";
import { BigO } from "@/lib/kit";
import {
  runRace,
  type LaneResult,
  type RaceCounts,
  type Tracer,
} from "@/lib/race-core";

// The counting engine lives in lib/race-core.ts (no React, so it can be unit tested
// on its own). Re-exported here because chapters import it from "@/lib/race".
export { createTracer, rng, runRace, RaceAbort } from "@/lib/race-core";
export type {
  LaneResult,
  RaceCounts,
  RaceRunnable,
  Tracer,
  TracerHandle,
} from "@/lib/race-core";

/* ================================================================
   1. Contenders and inputs
   ================================================================ */

export interface RaceAlgo<I> {
  id: string;
  /** Contender name */
  name: Loc<string>;
  /** One sentence on why it is fast or slow (shown on its lane) */
  note?: Loc<ReactNode>;
  /** Time complexity, passed to <BigO o=...>: 1|logn|n|nlogn|n2|2n */
  time: string;
  /** Override text for the space complexity, e.g. "O(1)" / "O(n)" */
  space: Loc<string>;
  /** Run once. input is a copy, so mutate it freely; every operation must be booked honestly. */
  run: (input: I, t: Tracer) => void;
}

export interface RaceInput<I> {
  id: string;
  /** Shape name: random / sorted / reversed / ... */
  label: Loc<string>;
  /** Build an input of size n; the same seed produces exactly the same input */
  make: (n: number, seed: number) => I;
  /** What this shape is meant to demonstrate (shown while it is selected) */
  hint?: Loc<ReactNode>;
  /** Set when the seed cannot change any count for this shape, even though it changes the
   *  values (a binary search's cost depends only on where the target sits). The reroll button
   *  is then disabled, and this says why. */
  seedless?: Loc<string>;
}

/** Display configuration for the three metrics. When reusing this engine for non-sorting
 *  algorithms, just relabel them. */
export interface RaceMetric {
  key: keyof RaceCounts;
  label: Loc<string>;
  /** Explains what this metric actually counts */
  tip?: Loc<string>;
}

export const DEFAULT_METRICS: RaceMetric[] = [
  {
    key: "cmp",
    label: { en: "Comparisons", zh: "比较次数" },
    tip: {
      en: "One size comparison between two elements.",
      zh: "两个元素之间的一次大小比较。",
    },
  },
  {
    key: "mov",
    label: { en: "Moves", zh: "移动次数" },
    tip: {
      en: "One write into an array slot; a swap counts as 2.",
      zh: "一次写入数组槽位;一次交换记 2 次。",
    },
  },
  {
    key: "space",
    label: { en: "Extra space", zh: "额外空间" },
    tip: {
      en: "Peak of auxiliary cells + recursion frames, input excluded.",
      zh: "辅助单元 + 递归栈帧的峰值,不含输入本身。",
    },
  },
];

/* ================================================================
   2. Number roll-up (respects prefers-reduced-motion)
   ================================================================ */

function useCountUp(target: number, ms = 620) {
  const [v, setV] = useState(target);
  // The value on screen right now: an interrupted roll-up continues from here rather than
  // jumping back to the previous target first
  const shown = useRef(target);
  useEffect(() => {
    shown.current = v;
  });
  useEffect(() => {
    const a = shown.current;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || ms <= 0 || a === target) {
      setV(target);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(a + (target - a) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Safety net: rAF pauses on a hidden or throttled tab, but setTimeout still fires --
    // the numbers are what this component stands on, so they must never be left stale.
    const settle = window.setTimeout(() => setV(target), ms + 140);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
    };
  }, [target, ms]);
  return v;
}

const fmt = (n: number) => n.toLocaleString("en-US");

/* ================================================================
   3. Component
   ================================================================ */

export function AlgoRace<I>({
  title,
  algos,
  inputs,
  sizes,
  clone,
  metrics = DEFAULT_METRICS,
  defaultInput = 0,
  defaultSize,
  opCap = 3_000_000,
  verdict,
  unitLabel,
}: {
  title: Loc<ReactNode>;
  /** Two or three contenders read best */
  algos: RaceAlgo<I>[];
  inputs: RaceInput<I>[];
  sizes: number[];
  /** Deep-copies the input for each contender, so "the same input" really means the same input */
  clone: (v: I) => I;
  metrics?: RaceMetric[];
  defaultInput?: number;
  defaultSize?: number;
  /** Operation cap; exceeding it marks the contender as aborted */
  opCap?: number;
  /** The reading: why the result came out this way (the caller explains it once the scores are in) */
  verdict?: (r: LaneResult[], ctx: { size: number; inputId: string }) => Loc<ReactNode>;
  /** Unit for the size, n by default */
  unitLabel?: Loc<string>;
}) {
  const L = useL();
  const [ii, setII] = useState(defaultInput);
  const [size, setSize] = useState(defaultSize ?? sizes[Math.min(1, sizes.length - 1)]);
  const [seed, setSeed] = useState(7);

  const shape = inputs[Math.min(ii, inputs.length - 1)];

  const results = useMemo(
    () => runRace(algos, shape.make(size, seed), clone, opCap),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [algos, shape, size, seed, opCap],
  );

  // Some shapes do not depend on the seed (there is only one sorted array of n elements), so
  // "reshuffle" would change nothing. A button that does nothing when pressed is a bad
  // experience, so disable it and say why.
  const seedMatters = useMemo(() => {
    if (shape.seedless) return false;
    try {
      return (
        JSON.stringify(shape.make(size, seed)) !==
        JSON.stringify(shape.make(size, seed + 1))
      );
    } catch {
      return true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape, size, seed]);

  // The maximum for each metric -- bars are normalized against it (aborted contenders are
  // excluded so they do not blow out the scale)
  const maxOf = (k: keyof RaceCounts) =>
    Math.max(1, ...results.filter((r) => !r.aborted).map((r) => r.counts[k]));

  // Every contender scored the same on this metric, so there is nothing to compare: draw the
  // bars in a neutral color rather than misleadingly filling them all to the top.
  const tiedOn = (k: keyof RaceCounts): boolean => {
    const live = results.filter((r) => !r.aborted);
    return live.length > 1 && live.every((r) => r.counts[k] === live[0].counts[k]);
  };

  // The contenders with the lowest value for each metric. Several share it on a partial tie,
  // and all of them are marked; when everyone ties, tiedOn takes over instead.
  const winnersOf = (k: keyof RaceCounts): string[] => {
    const live = results.filter((r) => !r.aborted);
    if (live.length === 0 || tiedOn(k)) return [];
    const low = Math.min(...live.map((r) => r.counts[k]));
    return live.filter((r) => r.counts[k] === low).map((r) => r.id);
  };

  return (
    <div className="viz race">
      <div className="viz-title">{L(title)}</div>

      {/* Control bar: input shape + size */}
      <div className="race-ctl">
        <div className="race-ctl-row">
          <span className="race-ctl-lab">{L({ en: "Input shape", zh: "输入形状" })}</span>
          <div className="seg race-seg">
            {inputs.map((s, k) => (
              <button
                key={s.id}
                type="button"
                className={`seg-btn${k === ii ? " on" : ""}`}
                aria-pressed={k === ii}
                onClick={() => setII(k)}
              >
                {L(s.label)}
              </button>
            ))}
          </div>
        </div>
        <div className="race-ctl-row">
          <span className="race-ctl-lab">
            {L(unitLabel ?? { en: "Size n", zh: "规模 n" })}
          </span>
          <div className="seg race-seg">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                className={`seg-btn${s === size ? " on" : ""}`}
                aria-pressed={s === size}
                onClick={() => setSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-sm race-reroll"
            onClick={() => setSeed((v) => v + 1)}
            disabled={!seedMatters}
            title={L(
              seedMatters
                ? { en: "New input of the same shape", zh: "换一份同形状的输入" }
                : (shape.seedless ?? {
                    en: "This shape has only one form at a given n — nothing to reroll.",
                    zh: "这个形状在给定 n 下只有一种，没有可换的输入。",
                  }),
            )}
          >
            {L({ en: "↻ Reroll", zh: "↻ 换一组" })}
          </button>
        </div>
      </div>

      {shape.hint && <p className="race-hint">{L(shape.hint)}</p>}

      {/* Lanes */}
      <div className="race-lanes">
        {algos.map((a, k) => {
          const r = results.find((x) => x.id === a.id)!;
          return (
            <div key={a.id} className="race-lane" data-rank={k}>
              <div className="race-lane-head">
                <span className="race-lane-name">{L(a.name)}</span>
                <BigO o={a.time} />
                <span className="race-space-o mono">{L(a.space)}</span>
              </div>
              {a.note && <p className="race-lane-note">{L(a.note)}</p>}

              {r.aborted ? (
                <p className="race-abort">
                  {L({
                    en: `Aborted past ${fmt(opCap)} operations — at this size it is simply unusable.`,
                    zh: `操作数超过 ${fmt(opCap)} 已中止 —— 这个规模上它已经不可用。`,
                  })}
                </p>
              ) : (
                <div className="race-bars">
                  {metrics.map((m) => {
                    const winners = winnersOf(m.key);
                    return (
                      <Bar
                        key={m.key}
                        label={L(m.label)}
                        value={r.counts[m.key]}
                        max={maxOf(m.key)}
                        win={winners.includes(a.id)}
                        tie={tiedOn(m.key)}
                        // Two "best" flags already say it is a tie; the flag column has
                        // no room for a longer word on phones
                        winLabel={L({ en: "best", zh: "最少" })}
                        tieLabel={L({ en: "tied", zh: "并列" })}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* How things are counted -- the numbers have to stand up to questioning */}
      <ul className="race-legend">
        {metrics.map((m) => (
          <li key={m.key}>
            <b>{L(m.label)}</b>
            {m.tip ? <> · {L(m.tip)}</> : null}
          </li>
        ))}
      </ul>

      {verdict && (
        <div className="race-verdict">
          {L(verdict(results, { size, inputId: shape.id }))}
        </div>
      )}
    </div>
  );
}

function Bar({
  label,
  value,
  max,
  win,
  tie,
  winLabel,
  tieLabel,
}: {
  label: string;
  value: number;
  max: number;
  win: boolean;
  /** Every contender scored the same on this metric -- the bar turns neutral and is marked
   *  as a tie */
  tie: boolean;
  winLabel: string;
  tieLabel: string;
}) {
  const shown = useCountUp(value);
  // Do not fill the bar on a tie (a full bar reads as "off the charts", while a tie often
  // means everyone was cheap)
  const pct = tie ? 30 : max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 2;
  return (
    <div className={`race-bar${win ? " win" : ""}${tie ? " tie" : ""}`}>
      <span className="race-bar-lab">{label}</span>
      <span className="race-bar-track">
        <span className="race-bar-fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="race-bar-val mono">{fmt(shown)}</span>
      <span className="race-bar-flag">{win ? winLabel : tie ? tieLabel : ""}</span>
    </div>
  );
}
