"use client";

// 第 1 章 · 排序的专属可视化。排序的招牌是「条形图慢放」:
//  - SortLab:条形图排序实验室 —— 同一组数据,冒泡 / 选择 / 插入三种排法自由切换,
//    逐帧看「比较」「交换」「就位」三种动作。核心自建组件。
//  - PartitionDemo:快排 partition 逐帧(Lomuto),复用 lib/stepper 的 ArrayStepper。
//  - MergeDemo:归并的心脏 —— 两个有序段的「三指针合并」逐帧。
//  - CountingDemo:计数排序 —— 不比较大小,只数数,突破 O(n log n) 下界。
//  - StabilityDemo:稳定 vs 不稳定 —— 同 key 元素的相对顺序会不会被打乱。

import { useState, type ReactNode } from "react";
import { useStepper, StepControls, ArrayStepper, type ArrayFrame } from "@/lib/stepper";

/* ==================================================================
   SortLab —— 条形图排序实验室(冒泡 / 选择 / 插入)
   ================================================================== */

type BarState = "idle" | "cmp" | "swap" | "sorted" | "key" | "min";

interface BarFrame {
  arr: number[];
  states: BarState[];
  msg: ReactNode;
}

const BASE = [5, 2, 9, 1, 6]; // 5 个数,maxV = 9,帧数适中
const MAXV = 9;

/* 冒泡:相邻逆序就换,大的往右冒 */
function bubbleFrames(): BarFrame[] {
  const a = [...BASE];
  const n = a.length;
  const sorted = new Set<number>();
  const frames: BarFrame[] = [];
  const snap = (mark: Record<number, BarState>, msg: ReactNode) =>
    frames.push({
      arr: [...a],
      states: a.map((_, i) => (sorted.has(i) ? "sorted" : mark[i] ?? "idle")),
      msg,
    });

  snap({}, <>冒泡排序:每一轮从左扫到右,把相邻的「逆序对」换过来 —— 最大的元素像气泡一样浮到最右端。</>);
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      const gt = a[j] > a[j + 1];
      snap(
        { [j]: "cmp", [j + 1]: "cmp" },
        <>
          比较 <b>{a[j]}</b> 与 <b>{a[j + 1]}</b>:
          {gt ? <>{a[j]} &gt; {a[j + 1]},逆序 → 交换。</> : <>{a[j]} ≤ {a[j + 1]},已就序,不动。</>}
        </>,
      );
      if (gt) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        snap({ [j]: "swap", [j + 1]: "swap" }, <>交换完成,较大的 <b>{a[j + 1]}</b> 又往右挪了一格。</>);
      }
    }
    sorted.add(n - 1 - i);
    snap(
      {},
      <>
        第 {i + 1} 轮结束:<b>{a[n - 1 - i]}</b> 已被冒到位(标绿),它不会再动了。
        {!swapped && <> 本轮一次交换都没有 —— 数组已经有序,提前收工!</>}
      </>,
    );
    if (!swapped) {
      for (let k = 0; k <= n - 1 - i; k++) sorted.add(k);
      break;
    }
  }
  sorted.add(0);
  snap({}, <>全部就位。冒泡的「提前退出」优化让近乎有序的数组能跑出 O(n) 的最好情况。</>);
  return frames;
}

/* 选择:每轮选出最小值,换到前面 */
function selectionFrames(): BarFrame[] {
  const a = [...BASE];
  const n = a.length;
  const sorted = new Set<number>();
  const frames: BarFrame[] = [];
  const snap = (mark: Record<number, BarState>, msg: ReactNode) =>
    frames.push({
      arr: [...a],
      states: a.map((_, i) => (sorted.has(i) ? "sorted" : mark[i] ?? "idle")),
      msg,
    });

  snap({}, <>选择排序:每一轮在「未排序区」里挑出最小的一个,和区首交换 —— 前缀一格格变绿。</>);
  for (let i = 0; i < n - 1; i++) {
    let m = i;
    snap({ [i]: "min" }, <>第 {i + 1} 轮:先假设区首 <b>{a[i]}</b> 是最小(黄),从它右边开始找真正的最小值。</>);
    for (let j = i + 1; j < n; j++) {
      const smaller = a[j] < a[m];
      snap(
        { [m]: "min", [j]: "cmp" },
        <>
          比较当前最小 <b>{a[m]}</b> 与 <b>{a[j]}</b>:
          {smaller ? <>{a[j]} 更小,更新候选。</> : <>没它小,继续扫。</>}
        </>,
      );
      if (smaller) {
        m = j;
        snap({ [m]: "min" }, <>新的最小候选变成 <b>{a[m]}</b>(下标 {m})。</>);
      }
    }
    if (m !== i) {
      [a[i], a[m]] = [a[m], a[i]];
      snap({ [i]: "swap", [m]: "swap" }, <>把最小值 <b>{a[i]}</b> 一步交换到位置 {i}。</>);
    }
    sorted.add(i);
    snap({}, <>位置 {i} 敲定为 <b>{a[i]}</b>(标绿)。</>);
  }
  sorted.add(n - 1);
  snap({}, <>最后一个自动就位。选择排序无论数据如何,比较次数恒为 O(n²),但交换最多只有 n−1 次。</>);
  return frames;
}

/* 插入:摸牌插入到已排好的手牌里 */
function insertionFrames(): BarFrame[] {
  const a = [...BASE];
  const n = a.length;
  const frames: BarFrame[] = [];
  const snap = (mark: Record<number, BarState>, sortedUpto: number, msg: ReactNode) =>
    frames.push({
      arr: [...a],
      states: a.map((_, i) => mark[i] ?? (i <= sortedUpto ? "sorted" : "idle")),
      msg,
    });

  frames.push({
    arr: [...a],
    states: a.map((_, i) => (i === 0 ? "sorted" : "idle")),
    msg: <>插入排序:把第 0 张牌当作「已排好的手牌」,然后一张张摸新牌,插进手牌里正确的位置。</>,
  });
  for (let i = 1; i < n; i++) {
    const key = a[i];
    snap({ [i]: "key" }, i - 1, <>摸起第 {i} 张牌 <b>{key}</b>(蓝),先把它拿在手上,要插进左边这副有序牌里。</>);
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      snap({ [j]: "cmp", [j + 1]: "key" }, i - 1, <><b>{a[j]}</b> &gt; <b>{key}</b>,{a[j]} 要给新牌让位,右移一格(注意:蓝牌是手里拿着的 {key})。</>);
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
    snap({ [j + 1]: "swap" }, i, <>手里的 <b>{key}</b> 落位到下标 {j + 1},左边 {i + 1} 张牌重新有序。</>);
  }
  snap({}, n - 1, <>全部插入完毕。若数据近乎有序,几乎不用挪牌,插入排序会退化成 O(n) —— 这是它成为 TimSort 基石的原因。</>);
  return frames;
}

const ALGO = {
  bubble: { label: "冒泡", frames: bubbleFrames() },
  selection: { label: "选择", frames: selectionFrames() },
  insertion: { label: "插入", frames: insertionFrames() },
} as const;

type AlgoId = keyof typeof ALGO;

function Bar({ v, state, idx }: { v: number; state: BarState; idx: number }) {
  const h = 26 + (v / MAXV) * 140;
  return (
    <div className="srt-bar" data-state={state} style={{ height: h }}>
      <span className="srt-bar-v">{v}</span>
      <span className="cell-idx">{idx}</span>
    </div>
  );
}

function SortRunner({ frames }: { frames: BarFrame[] }) {
  const stepper = useStepper(frames.length);
  const f = frames[stepper.step];
  return (
    <>
      <div className="viz-stage" style={{ overflowX: "auto" }}>
        <div className="srt-bars">
          {f.arr.map((v, i) => (
            <Bar key={i} v={v} state={f.states[i]} idx={i} />
          ))}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </>
  );
}

export function SortLab() {
  const [algo, setAlgo] = useState<AlgoId>("bubble");
  return (
    <div className="viz">
      <div className="viz-title">条形图排序实验室 —— 同一组数据 [5, 2, 9, 1, 6],三种 O(n²) 排法</div>
      <div className="srt-algo-tabs">
        {(Object.keys(ALGO) as AlgoId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`btn btn-sm${algo === id ? " btn-primary" : ""}`}
            onClick={() => setAlgo(id)}
          >
            {ALGO[id].label}排序
          </button>
        ))}
      </div>
      <div className="srt-legend" aria-hidden>
        <span><i className="srt-sw" data-state="cmp" />比较中</span>
        <span><i className="srt-sw" data-state="swap" />交换/落位</span>
        <span><i className="srt-sw" data-state="min" />当前最小</span>
        <span><i className="srt-sw" data-state="key" />手里的牌</span>
        <span><i className="srt-sw" data-state="sorted" />已就位</span>
      </div>
      {/* key 切换时强制重挂载,播放进度归零 */}
      <SortRunner key={algo} frames={ALGO[algo].frames} />
    </div>
  );
}

/* ==================================================================
   PartitionDemo —— 快排的 partition(Lomuto)逐帧
   ================================================================== */

function partitionFrames(): ArrayFrame[] {
  const a = [6, 2, 8, 1, 9, 3, 5];
  const n = a.length;
  const pivot = a[n - 1];
  let i = -1;
  const frames: ArrayFrame[] = [];

  const snap = (curJ: number | null, msg: ReactNode, finalPivot?: number) =>
    frames.push({
      cells: a.map((v, idx) => {
        if (finalPivot !== undefined && idx === finalPivot) return { v, state: "ok" as const };
        if (idx === n - 1 && finalPivot === undefined) return { v, state: "bad" as const };
        if (idx <= i) return { v, state: "ok" as const };
        if (idx === curJ) return { v, state: "lit" as const };
        return { v };
      }),
      ptrs: [
        ...(i >= 0 ? [{ i, label: "i·边界" }] : []),
        ...(curJ !== null ? [{ i: curJ, label: "j·扫描" }] : []),
        ...(finalPivot === undefined ? [{ i: n - 1, label: "基准" }] : []),
      ],
      msg,
    });

  snap(
    null,
    <>
      取最右的 <b>{pivot}</b> 作基准(红)。目标:把 &lt; {pivot} 的甩到左边,≥ {pivot} 的留右边。
      指针 <b>i</b> 标记「小值区」的右边界(初始 −1),指针 <b>j</b> 负责从左往右扫。
    </>,
  );
  for (let j = 0; j < n - 1; j++) {
    const less = a[j] < pivot;
    snap(
      j,
      <>
        j 扫到 <b>{a[j]}</b>:{less ? <>{a[j]} &lt; {pivot},属于小值区。</> : <>{a[j]} ≥ {pivot},留在原地,i 不动。</>}
      </>,
    );
    if (less) {
      i++;
      if (i !== j) {
        [a[i], a[j]] = [a[j], a[i]];
        snap(j, <>i 前进到 {i},把 <b>{a[i]}</b> 换进小值区(与位置 {j} 交换)。</>);
      } else {
        snap(j, <>i 前进到 {i},恰好就是 j,原地不动。</>);
      }
    }
  }
  const p = i + 1;
  [a[p], a[n - 1]] = [a[n - 1], a[p]];
  snap(null, <>扫描结束。最后一步:把基准 <b>{pivot}</b> 换到 i+1 = {p} 这个「分界缝」上。</>, p);
  frames.push({
    cells: a.map((v, idx) => ({
      v,
      state: idx === p ? ("ok" as const) : idx < p ? ("lit" as const) : undefined,
    })),
    msg: (
      <>
        完成!基准 <b>{pivot}</b> 归位到下标 {p},左边全 &lt; {pivot}、右边全 ≥ {pivot}。
        它这辈子再也不用动了 —— 接下来只需对左右两段各自递归 partition。
      </>
    ),
  });
  return frames;
}

const PARTITION_FRAMES = partitionFrames();

export function PartitionDemo() {
  return <ArrayStepper title="快排 partition 逐帧(Lomuto 方案,基准 = 5)" frames={PARTITION_FRAMES} cellW={54} />;
}

/* ==================================================================
   MergeDemo —— 归并的心脏:两个有序段的三指针合并
   ================================================================== */

const MERGE_L = [1, 4, 7];
const MERGE_R = [2, 3, 8];

interface MergeFrame {
  li: number;
  rj: number;
  out: number[];
  pick: "L" | "R" | null;
  msg: ReactNode;
}

function mergeFrames(): MergeFrame[] {
  const L = MERGE_L;
  const R = MERGE_R;
  const frames: MergeFrame[] = [];
  const out: number[] = [];
  let i = 0;
  let j = 0;
  frames.push({ li: 0, rj: 0, out: [], pick: null, msg: <>两段各自已经有序:左段 [1, 4, 7]、右段 [2, 3, 8]。各放一个指针在段首,每次取「两个指针里较小的那个」放进结果。</> });
  while (i < L.length && j < R.length) {
    if (L[i] <= R[j]) {
      out.push(L[i]);
      frames.push({ li: i, rj: j, out: [...out], pick: "L", msg: <>比较 <b>{L[i]}</b> 与 <b>{R[j]}</b>:左边小(或相等,优先取左 → 稳定),取 <b>{L[i]}</b>,左指针右移。</> });
      i++;
    } else {
      out.push(R[j]);
      frames.push({ li: i, rj: j, out: [...out], pick: "R", msg: <>比较 <b>{L[i]}</b> 与 <b>{R[j]}</b>:右边小,取 <b>{R[j]}</b>,右指针右移。</> });
      j++;
    }
  }
  while (i < L.length) {
    out.push(L[i]);
    frames.push({ li: i, rj: j, out: [...out], pick: "L", msg: <>右段已空,把左段剩下的 <b>{L[i]}</b> 直接搬过来。</> });
    i++;
  }
  while (j < R.length) {
    out.push(R[j]);
    frames.push({ li: i, rj: j, out: [...out], pick: "R", msg: <>左段已空,把右段剩下的 <b>{R[j]}</b> 直接搬过来。</> });
    j++;
  }
  frames.push({ li: i, rj: j, out: [...out], pick: null, msg: <>合并完成:[1, 2, 3, 4, 7, 8]。整个过程只走了一遍两段之和 —— O(n) 线性时间。</> });
  return frames;
}

const MERGE_FRAMES = mergeFrames();

function MiniCells({ vals, mark }: { vals: number[]; mark: (i: number) => string }) {
  return (
    <div className="srt-cells">
      {vals.length === 0 ? (
        <div className="cell ghost" style={{ width: 44, height: 44, opacity: 0.35 }}>·</div>
      ) : (
        vals.map((v, i) => (
          <div key={i} className={`cell${mark(i) ? ` ${mark(i)}` : ""}`} style={{ width: 44, height: 44 }}>
            {v}
          </div>
        ))
      )}
    </div>
  );
}

export function MergeDemo() {
  const stepper = useStepper(MERGE_FRAMES.length);
  const f = MERGE_FRAMES[stepper.step];
  return (
    <div className="viz">
      <div className="viz-title">归并的心脏 —— 两个有序段的三指针合并</div>
      <div className="viz-stage">
        <div className="srt-rows">
          <div className="srt-row">
            <span className="srt-row-lab">左段 L(指针 i = {Math.min(f.li, MERGE_L.length - 1)}{f.li >= MERGE_L.length ? " · 已空" : ""})</span>
            <MiniCells vals={MERGE_L} mark={(i) => (i < f.li ? "ghost" : i === f.li && f.li < MERGE_L.length ? (f.pick === "L" ? "ok" : "lit") : "")} />
          </div>
          <div className="srt-row">
            <span className="srt-row-lab">右段 R(指针 j = {Math.min(f.rj, MERGE_R.length - 1)}{f.rj >= MERGE_R.length ? " · 已空" : ""})</span>
            <MiniCells vals={MERGE_R} mark={(i) => (i < f.rj ? "ghost" : i === f.rj && f.rj < MERGE_R.length ? (f.pick === "R" ? "ok" : "lit") : "")} />
          </div>
          <div className="srt-row">
            <span className="srt-row-lab">合并结果(有序输出)</span>
            <MiniCells vals={f.out} mark={(i) => (i === f.out.length - 1 && f.pick ? "ok" : "")} />
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={MERGE_FRAMES.length} />
    </div>
  );
}

/* ==================================================================
   CountingDemo —— 计数排序:不比较,只数数
   ================================================================== */

const COUNT_IN = [2, 4, 2, 0, 3, 0];
const COUNT_MAX = 4;

interface CountFrame {
  counts: number[];
  litIn: number | null; // 正在数的输入下标
  litBucket: number | null; // 高亮的桶
  out: (number | null)[];
  msg: ReactNode;
}

function countingFrames(): CountFrame[] {
  const frames: CountFrame[] = [];
  const counts = Array(COUNT_MAX + 1).fill(0);
  frames.push({ counts: [...counts], litIn: null, litBucket: null, out: [], msg: <>计数排序:数值范围只有 0~4,那就开 5 个桶。第一步 —— 挨个数每个值出现了几次,完全不做大小比较。</> });
  // 计数阶段
  for (let i = 0; i < COUNT_IN.length; i++) {
    const v = COUNT_IN[i];
    counts[v]++;
    frames.push({ counts: [...counts], litIn: i, litBucket: v, out: [], msg: <>读到输入第 {i} 位 = <b>{v}</b>,把 {v} 号桶 +1(现在是 {counts[v]})。</> });
  }
  frames.push({ counts: [...counts], litIn: null, litBucket: null, out: [], msg: <>数完了:桶 = [{counts.join(", ")}]。意思是「0 出现 2 次、2 出现 2 次、3 和 4 各 1 次」。</> });
  // 重建阶段
  const out: (number | null)[] = [];
  for (let b = 0; b <= COUNT_MAX; b++) {
    for (let c = 0; c < counts[b]; c++) {
      out.push(b);
      frames.push({ counts: [...counts], litIn: null, litBucket: b, out: [...out], msg: <>从左到右倒桶:{b} 号桶有 {counts[b]} 个,依次写出 <b>{b}</b>。</> });
    }
  }
  frames.push({ counts: [...counts], litIn: null, litBucket: null, out: [...out], msg: <>输出 [{out.join(", ")}] 已完全有序。全程只扫了输入一遍、桶一遍 —— O(n + k),k 是值域大小。当 k 不太大时,它彻底甩开 O(n log n)。</> });
  return frames;
}

const COUNT_FRAMES = countingFrames();

export function CountingDemo() {
  const stepper = useStepper(COUNT_FRAMES.length);
  const f = COUNT_FRAMES[stepper.step];
  return (
    <div className="viz">
      <div className="viz-title">计数排序 —— 用桶数数,不比较大小</div>
      <div className="viz-stage">
        <div className="srt-rows">
          <div className="srt-row">
            <span className="srt-row-lab">输入数组</span>
            <div className="srt-cells">
              {COUNT_IN.map((v, i) => (
                <div key={i} className={`cell${f.litIn === i ? " lit" : ""}`} style={{ width: 44, height: 44 }}>
                  {v}
                </div>
              ))}
            </div>
          </div>
          <div className="srt-row">
            <span className="srt-row-lab">计数桶(下标 = 数值)</span>
            <div className="srt-cells">
              {f.counts.map((c, b) => (
                <div key={b} className="srt-bucket">
                  <div className={`cell${f.litBucket === b ? " lit" : c > 0 ? " ok" : " ghost"}`} style={{ width: 44, height: 44 }}>
                    {c}
                  </div>
                  <span className="srt-bucket-lab">值 {b}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="srt-row">
            <span className="srt-row-lab">重建输出</span>
            <div className="srt-cells">
              {f.out.length === 0 ? (
                <div className="cell ghost" style={{ width: 44, height: 44, opacity: 0.35 }}>·</div>
              ) : (
                f.out.map((v, i) => (
                  <div key={i} className={`cell${i === f.out.length - 1 ? " ok" : ""}`} style={{ width: 44, height: 44 }}>
                    {v}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={COUNT_FRAMES.length} />
    </div>
  );
}

/* ==================================================================
   StabilityDemo —— 稳定 vs 不稳定
   ================================================================== */

// 每张牌:key = 排序主键(第一次按它排),tag = 出场顺序编号(用来肉眼追踪)。
// hue 跟着 key 走,方便看清「相同 key 的牌」在排完后谁前谁后。
interface Card {
  key: number;
  tag: string;
  hue: "a" | "b" | "c";
}

const CARDS: Card[] = [
  { key: 3, tag: "①", hue: "a" },
  { key: 1, tag: "②", hue: "b" },
  { key: 3, tag: "③", hue: "a" },
  { key: 1, tag: "④", hue: "b" },
  { key: 2, tag: "⑤", hue: "c" },
];

// 稳定:相同 key 保持出场先后 → 按 tag 升序;不稳定:相同 key 顺序被打乱(这里演示为倒序)。
const STABLE = [...CARDS].sort((a, b) => a.key - b.key || a.tag.localeCompare(b.tag));
const UNSTABLE = [...CARDS].sort((a, b) => a.key - b.key || b.tag.localeCompare(a.tag));

function CardRow({ cards }: { cards: Card[] }) {
  return (
    <div className="srt-stab">
      {cards.map((c, i) => (
        <div key={i} className="srt-chip" data-hue={c.hue}>
          <span className="k">{c.key}</span>
          <span className="tag">{c.tag}</span>
        </div>
      ))}
    </div>
  );
}

export function StabilityDemo() {
  const [mode, setMode] = useState<"orig" | "stable" | "unstable">("orig");
  const cards = mode === "orig" ? CARDS : mode === "stable" ? STABLE : UNSTABLE;
  return (
    <div className="viz">
      <div className="viz-title">稳定性实验 —— 相同主键的元素,排完还保持出场顺序吗?</div>
      <div className="srt-algo-tabs">
        <button type="button" className={`btn btn-sm${mode === "orig" ? " btn-primary" : ""}`} onClick={() => setMode("orig")}>
          原始顺序
        </button>
        <button type="button" className={`btn btn-sm${mode === "stable" ? " btn-primary" : ""}`} onClick={() => setMode("stable")}>
          稳定排序结果
        </button>
        <button type="button" className={`btn btn-sm${mode === "unstable" ? " btn-primary" : ""}`} onClick={() => setMode("unstable")}>
          不稳定排序结果
        </button>
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 8 }}>
        <CardRow cards={cards} />
      </div>
      <div className="srt-stab-note" aria-live="polite">
        {mode === "orig" ? (
          <>大数字是排序主键 key,小圈号 ①~⑤ 是「出场顺序」。现在按 key 排一遍,盯住两张 key=1(②④)和两张 key=3(①③)。</>
        ) : mode === "stable" ? (
          <>稳定:key 相同的牌,② 仍在 ④ 前、① 仍在 ③ 前 —— 出场先后被完整保留。归并排序天生如此。</>
        ) : (
          <>不稳定:key 相同的两张牌,相对顺序被打乱了(④ 跑到了 ② 前面)。快排 / 堆排就可能这样。</>
        )}
      </div>
    </div>
  );
}

/* ==================================================================
   IntervalsDemo —— LC 56 合并区间:排序后一次线性扫描
   ================================================================== */

const IVS: [number, number][] = [
  [1, 3],
  [2, 6],
  [8, 10],
  [15, 18],
];
const IV_SCALE = 19;

interface IvFrame {
  curIdx: number | null; // 正在看的输入区间
  merged: [number, number][]; // 已收尾的段
  cur: [number, number] | null; // 当前正在合并的段
  msg: ReactNode;
}

function intervalFrames(): IvFrame[] {
  const frames: IvFrame[] = [];
  frames.push({ curIdx: null, merged: [], cur: null, msg: <>先按左端点排序:[1,3] [2,6] [8,10] [15,18]。排序保证了「能合并的区间一定挨在一起」,于是只需线性扫一遍。</> });
  let cur: [number, number] = [...IVS[0]] as [number, number];
  const merged: [number, number][] = [];
  frames.push({ curIdx: 0, merged: [], cur: [...cur] as [number, number], msg: <>拿第一个区间 [1, 3] 作为「当前合并段」(亮)。</> });
  for (let k = 1; k < IVS.length; k++) {
    const iv = IVS[k];
    if (iv[0] <= cur[1]) {
      const before = cur[1];
      cur[1] = Math.max(cur[1], iv[1]);
      frames.push({ curIdx: k, merged: merged.map((m) => [...m] as [number, number]), cur: [...cur] as [number, number], msg: <>看 [{iv[0]}, {iv[1]}]:左端 {iv[0]} ≤ 当前右端 {before} → <b>重叠</b>,把右端扩到 {cur[1]},当前段变 [{cur[0]}, {cur[1]}]。</> });
    } else {
      merged.push([...cur] as [number, number]);
      frames.push({ curIdx: k, merged: merged.map((m) => [...m] as [number, number]), cur: [...iv] as [number, number], msg: <>看 [{iv[0]}, {iv[1]}]:左端 {iv[0]} &gt; 当前右端 {cur[1]} → <b>断开</b>,把 [{cur[0]}, {cur[1]}] 收进结果,开启新段 [{iv[0]}, {iv[1]}]。</> });
      cur = [...iv] as [number, number];
    }
  }
  merged.push([...cur] as [number, number]);
  frames.push({ curIdx: null, merged: merged.map((m) => [...m] as [number, number]), cur: null, msg: <>扫描结束,最后一段收尾。结果 [[1,6], [8,10], [15,18]] —— 排序 O(n log n) + 扫描 O(n)。</> });
  return frames;
}

const IV_FRAMES = intervalFrames();

function Seg({ iv, tone }: { iv: [number, number]; tone: "in" | "cur" | "done" | "ghost" }) {
  const left = (iv[0] / IV_SCALE) * 100;
  const width = ((iv[1] - iv[0]) / IV_SCALE) * 100;
  return (
    <div className="srt-seg" data-tone={tone} style={{ left: `${left}%`, width: `${width}%` }}>
      {iv[0]},{iv[1]}
    </div>
  );
}

export function IntervalsDemo() {
  const stepper = useStepper(IV_FRAMES.length);
  const f = IV_FRAMES[stepper.step];
  return (
    <div className="viz">
      <div className="viz-title">LC 56 · 排序后线性扫描合并区间(数轴 0~18)</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 18 }}>
        <div className="srt-row" style={{ width: "100%" }}>
          <span className="srt-row-lab">输入区间(已按左端点排序)</span>
          <div className="srt-track">
            {IVS.map((iv, i) => (
              <Seg key={i} iv={iv} tone={f.curIdx === i ? "cur" : "in"} />
            ))}
          </div>
        </div>
        <div className="srt-row" style={{ width: "100%" }}>
          <span className="srt-row-lab">合并结果 + 当前段</span>
          <div className="srt-track">
            {f.merged.map((iv, i) => (
              <Seg key={`m${i}`} iv={iv} tone="done" />
            ))}
            {f.cur && <Seg iv={f.cur} tone="cur" />}
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={IV_FRAMES.length} />
    </div>
  );
}
