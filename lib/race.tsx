"use client";

// 算法竞速 —— 同一份输入,让两种(或多种)算法同场跑,量出真实账单:
// 比较次数、移动次数、额外空间。
//
// 为什么需要它:大 O 只说「增长趋势」,不说「这一份输入上到底花了多少」。
// O(n²) 的插入排序在近乎有序的数组上可以只比较 n−1 次,把 O(n log n) 的归并
// 打得很惨 —— 这种事只有把账算出来才看得见。本组件就是那台记账机。
//
// 用法三步:
//   1. 写「带计数器的算法」:每次比较调 t.cmp(),每次写入调 t.mov(),
//      申请辅助单元调 t.alloc(n)/t.free(n),递归进出调 t.enter()/t.exit()。
//   2. 声明输入形状(随机 / 已排序 / 逆序 / 大量重复…),同一形状喂给所有选手。
//   3. <AlgoRace algos={[A, B]} inputs={PATTERNS} sizes={[8,16,32]} />
//
// 引擎只认计数、不认算法,所以排序、快速幂、斐波那契、二分查找都能共用同一套。
//
// 计数口径(全站统一,写在界面上,不许含糊):
//   · 比较 = 两个元素之间的一次大小比较
//   · 移动 = 一次「写入数组槽位」;一次交换 = 2 次写入
//   · 空间 = 任一时刻「辅助单元 + 递归栈帧」的峰值(不含输入本身)

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useL, type Loc } from "@/lib/i18n";
import { BigO } from "@/lib/kit";

/* ================================================================
   1. 计数器
   ================================================================ */

export interface RaceCounts {
  /** 比较次数 */
  cmp: number;
  /** 移动(数组写入)次数 */
  mov: number;
  /** 额外空间峰值:辅助单元 + 递归栈帧 */
  space: number;
}

export interface Tracer {
  /** 记一次比较 */
  cmp(n?: number): void;
  /** 记 n 次写入(一次交换请记 2) */
  mov(n?: number): void;
  /** 申请 n 个辅助单元 */
  alloc(n: number): void;
  /** 归还 n 个辅助单元 */
  free(n: number): void;
  /** 进入一层递归 */
  enter(): void;
  /** 退出一层递归 */
  exit(): void;
}

/** 操作数超过上限时抛出 —— 让「naive 递归会爆」这件事以可控的方式被看见。 */
class RaceAbort extends Error {}

class Trace implements Tracer {
  private c = 0;
  private m = 0;
  private live = 0;
  private depth = 0;
  private peak = 0;
  private ops = 0;
  constructor(private cap: number) {}

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

/* ================================================================
   2. 选手与输入
   ================================================================ */

export interface RaceAlgo<I> {
  id: string;
  /** 选手名 */
  name: Loc<string>;
  /** 一句话:它凭什么快 / 慢(显示在赛道上) */
  note?: Loc<ReactNode>;
  /** 时间复杂度,传给 <BigO o=…>:1|logn|n|nlogn|n2|2n */
  time: string;
  /** 空间复杂度覆盖文字,如 "O(1)" / "O(n)" */
  space: Loc<string>;
  /** 跑一遍:input 是「副本」,可以随意改;每步操作要如实记账 */
  run: (input: I, t: Tracer) => void;
}

export interface RaceInput<I> {
  id: string;
  /** 形状名:随机 / 已排序 / 逆序… */
  label: Loc<string>;
  /** 造一份规模为 n 的输入;seed 相同 → 输入完全相同 */
  make: (n: number, seed: number) => I;
  /** 这个形状想说明什么(选中时显示) */
  hint?: Loc<ReactNode>;
}

/** 三项指标的展示配置。复用同一引擎跑非排序算法时,改标签即可。 */
export interface RaceMetric {
  key: keyof RaceCounts;
  label: Loc<string>;
  /** 说明这一项到底在数什么 */
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
   3. 确定性随机 —— 同一 seed 造出同一份输入,结果可复现
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
   4. 跑一场
   ================================================================ */

export interface LaneResult {
  id: string;
  counts: RaceCounts;
  /** 操作数超上限被中止 —— 说明它在这个规模上已经不可用 */
  aborted: boolean;
}

export function runRace<I>(
  algos: RaceAlgo<I>[],
  input: I,
  clone: (v: I) => I,
  cap: number,
): LaneResult[] {
  return algos.map((a) => {
    const t = new Trace(cap);
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

/* ================================================================
   5. 数字滚动(尊重 prefers-reduced-motion)
   ================================================================ */

function useCountUp(target: number, ms = 620) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const a = from.current;
    from.current = target; // 立刻记账,下次动画不会从更老的值起跳
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
    // 兜底:隐藏标签页 / 被节流时 rAF 会暂停,setTimeout 仍会到 ——
    // 数字是这个组件的立身之本,绝不允许停在旧值上。
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
   6. 组件
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
  /** 2~3 名选手最好读 */
  algos: RaceAlgo<I>[];
  inputs: RaceInput<I>[];
  sizes: number[];
  /** 把输入深拷一份给每位选手 —— 保证「同一输入」名副其实 */
  clone: (v: I) => I;
  metrics?: RaceMetric[];
  defaultInput?: number;
  defaultSize?: number;
  /** 操作数上限,超了记为「已中止」 */
  opCap?: number;
  /** 判读:为什么是这个结果(拿到成绩后由调用方解释) */
  verdict?: (r: LaneResult[], ctx: { size: number; inputId: string }) => Loc<ReactNode>;
  /** 规模单位,默认 n */
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

  // 有些形状与 seed 无关(「已排序」的 n 元数组只有一种),此时「换一组」按了也不会变 ——
  // 按了没反应的按钮是坏体验,直接禁用并说明原因。
  const seedMatters = useMemo(() => {
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

  // 每项指标的最大值 —— 条形按它归一化(被中止的选手不参与,免得把标尺撑爆)
  const maxOf = (k: keyof RaceCounts) =>
    Math.max(1, ...results.filter((r) => !r.aborted).map((r) => r.counts[k]));

  // 本项所有选手数值相同 → 没有可比性,条形走中性色,避免「全部拉满」的误导
  const tiedOn = (k: keyof RaceCounts): boolean => {
    const live = results.filter((r) => !r.aborted);
    return live.length > 1 && live.every((r) => r.counts[k] === live[0].counts[k]);
  };

  // 每项指标的赢家(并列则都不标)
  const winnerOf = (k: keyof RaceCounts): string | null => {
    const live = results.filter((r) => !r.aborted);
    if (live.length < 2) return live.length === 1 ? live[0].id : null;
    let best = live[0];
    let tie = false;
    for (const r of live.slice(1)) {
      if (r.counts[k] < best.counts[k]) {
        best = r;
        tie = false;
      } else if (r.counts[k] === best.counts[k]) tie = true;
    }
    return tie ? null : best.id;
  };

  return (
    <div className="viz race">
      <div className="viz-title">{L(title)}</div>

      {/* 控制条:输入形状 + 规模 */}
      <div className="race-ctl">
        <div className="race-ctl-row">
          <span className="race-ctl-lab">{L({ en: "Input shape", zh: "输入形状" })}</span>
          <div className="seg race-seg">
            {inputs.map((s, k) => (
              <button
                key={s.id}
                type="button"
                className={`seg-btn${k === ii ? " on" : ""}`}
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
                : {
                    en: "This shape has only one form at a given n — nothing to reroll.",
                    zh: "这个形状在给定 n 下只有一种,没有可换的输入。",
                  },
            )}
          >
            {L({ en: "↻ Reroll", zh: "↻ 换一组" })}
          </button>
        </div>
      </div>

      {shape.hint && <p className="race-hint">{L(shape.hint)}</p>}

      {/* 赛道 */}
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
                  {metrics.map((m) => (
                    <Bar
                      key={m.key}
                      label={L(m.label)}
                      value={r.counts[m.key]}
                      max={maxOf(m.key)}
                      win={winnerOf(m.key) === a.id}
                      tie={tiedOn(m.key)}
                      winLabel={L({ en: "best", zh: "最少" })}
                      tieLabel={L({ en: "tied", zh: "并列" })}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 口径说明 —— 数字必须可追问 */}
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
  /** 本项所有选手同分 —— 条形转中性,并标「并列」 */
  tie: boolean;
  winLabel: string;
  tieLabel: string;
}) {
  const shown = useCountUp(value);
  // 同分时不拉满(拉满会被读成「爆表」,而同分往往恰恰是都很省)
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
