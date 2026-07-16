"use client";

// 第 6 章 · 贪心的专属可视化:
//  - CookieMatch:LC 455 分发饼干 —— 双行(孩子 / 饼干)双指针匹配逐帧,
//    亲眼看「小饼干配小胃口、喂不动就换大的」这条贪心规则如何展开。
//  - JumpReach:LC 55 跳跃游戏 —— 覆盖范围 ArrayStepper,演示「够不够得着终点」。
//  - JumpMin:LC 45 跳跃游戏 II —— 覆盖范围 + 跳跃边界 ArrayStepper,数最少步数。
//  - IntervalTimeline:LC 435 无重叠区间 —— 自建时间轴,按右端排序后逐个「选 / 弃」。
//  - CoinGreedyLab:硬币 [1,3,4] 凑 6 的贪心陷阱实验室(§07 反例意识,预告第 7 章)。

import { useMemo, useState, type ReactNode } from "react";
import {
  useStepper,
  StepControls,
  ArrayStepper,
  type ArrayFrame,
} from "@/lib/stepper";

/* ================================================================
   CookieMatch —— LC 455 分发饼干:双行双指针匹配
   ================================================================ */

const G = [2, 3, 5]; // 孩子胃口(已排序)
const S = [1, 2, 4, 4]; // 饼干尺寸(已排序)

type ChildSt = "pending" | "cur" | "ok" | "miss";
type CookieSt = "pending" | "cur" | "used" | "dropped";

interface CookieFrame {
  child: ChildSt[];
  cookie: CookieSt[];
  msg: ReactNode;
}

const COOKIE_FRAMES: CookieFrame[] = [
  {
    child: ["pending", "pending", "pending"],
    cookie: ["pending", "pending", "pending", "pending"],
    msg: (
      <>
        孩子胃口 g = [2, 3, 5],饼干尺寸 s = [1, 2, 4, 4] —— <b>两边都先排好序</b>。
        目标:让尽量多的孩子吃到「尺寸 ≥ 胃口」的饼干。
      </>
    ),
  },
  {
    child: ["cur", "pending", "pending"],
    cookie: ["cur", "pending", "pending", "pending"],
    msg: (
      <>
        双指针都从最小开始:拿最小饼干 <b>1</b> 试喂胃口最小的孩子 <b>2</b> ——
        1 &lt; 2,喂不动。
      </>
    ),
  },
  {
    child: ["cur", "pending", "pending"],
    cookie: ["dropped", "cur", "pending", "pending"],
    msg: (
      <>
        饼干 1 连最不挑的孩子都满足不了,那它<b>对谁都没用</b> —— 直接丢弃,换下一块饼干 2。
        2 ≥ 2,成交!
      </>
    ),
  },
  {
    child: ["ok", "cur", "pending"],
    cookie: ["dropped", "used", "cur", "pending"],
    msg: (
      <>
        孩子 2 满足 ✓。指针都右移:饼干 <b>4</b> 试喂孩子 <b>3</b> —— 4 ≥ 3,又成交!
        注意我们<b>没有</b>拿更大的饼干去喂他,刚好够就行。
      </>
    ),
  },
  {
    child: ["ok", "ok", "cur"],
    cookie: ["dropped", "used", "used", "cur"],
    msg: (
      <>
        孩子 3 满足 ✓。剩最后一块饼干 <b>4</b> 试喂胃口最大的孩子 <b>5</b> ——
        4 &lt; 5,喂不动,饼干也用光了。
      </>
    ),
  },
  {
    child: ["ok", "ok", "miss"],
    cookie: ["dropped", "used", "used", "dropped"],
    msg: (
      <>
        结束:<b>2 个孩子</b>吃饱,胃口 5 的孩子没饭吃。关键在于每一步都用「刚好够」的饼干 ——
        大饼干从不浪费在小孩子身上,这个「不亏」由交换论证保证(见下方证明)。
      </>
    ),
  },
];

function chCls(s: ChildSt): string {
  if (s === "cur") return "cell lit";
  if (s === "ok") return "cell ok";
  if (s === "miss") return "cell bad";
  return "cell";
}
function ckCls(s: CookieSt): string {
  if (s === "cur") return "cell lit";
  if (s === "used") return "cell ok";
  if (s === "dropped") return "cell ghost";
  return "cell";
}

export function CookieMatch() {
  const stepper = useStepper(COOKIE_FRAMES.length);
  const f = COOKIE_FRAMES[stepper.step];
  return (
    <div className="viz">
      <div className="viz-title">LC 455 · 分发饼干:小饼干先喂小胃口(逐帧)</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 20, overflowX: "auto" }}>
        <div className="grd-row">
          <span className="grd-rowlab">孩子·胃口</span>
          <div className="grd-cells">
            {G.map((v, i) => (
              <div key={i} className={chCls(f.child[i])} style={{ width: 50, height: 50 }}>
                🧒{v}
              </div>
            ))}
          </div>
        </div>
        <div className="grd-row">
          <span className="grd-rowlab">饼干·尺寸</span>
          <div className="grd-cells">
            {S.map((v, i) => (
              <div key={i} className={ckCls(f.cookie[i])} style={{ width: 50, height: 50 }}>
                🍪{v}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={COOKIE_FRAMES.length} />
    </div>
  );
}

/* ================================================================
   JumpReach —— LC 55 跳跃游戏:覆盖范围能否盖到终点
   ================================================================ */

// nums = [3, 2, 1, 0, 4] —— 经典「差一步够不着」的反例:答案 false。
const R_NUMS = [3, 2, 1, 0, 4];

const REACH_FRAMES: ArrayFrame[] = [
  {
    cells: R_NUMS.map((v) => ({ v })),
    msg: (
      <>
        nums = [3, 2, 1, 0, 4],每个数字是「站在这格最多能往前跳几步」。
        问:能从 0 号跳到末尾吗?贪心只盯一件事 —— <b>目前最远能覆盖到哪</b>。
      </>
    ),
  },
  {
    cells: R_NUMS.map((v, i) => ({ v, state: i === 0 ? "lit" : i <= 3 ? "ok" : "ghost" })),
    ptrs: [
      { i: 0, label: "i" },
      { i: 3, label: "覆盖" },
    ],
    msg: (
      <>
        i = 0(值 3):覆盖范围 = max(0, 0 + 3) = <b>3</b>。0~3 号都够得着(绿色),
        4 号暂时够不着(灰)。
      </>
    ),
  },
  {
    cells: R_NUMS.map((v, i) => ({ v, state: i === 1 ? "lit" : i <= 3 ? "ok" : "ghost" })),
    ptrs: [
      { i: 1, label: "i" },
      { i: 3, label: "覆盖" },
    ],
    msg: (
      <>
        i = 1(值 2):1 + 2 = 3,覆盖范围没变大,还是 <b>3</b>。
      </>
    ),
  },
  {
    cells: R_NUMS.map((v, i) => ({ v, state: i === 2 ? "lit" : i <= 3 ? "ok" : "ghost" })),
    ptrs: [
      { i: 2, label: "i" },
      { i: 3, label: "覆盖" },
    ],
    msg: (
      <>
        i = 2(值 1):2 + 1 = 3,覆盖依旧停在 <b>3</b>。危险信号:范围一直不动。
      </>
    ),
  },
  {
    cells: R_NUMS.map((v, i) => ({ v, state: i === 3 ? "lit" : i < 3 ? "ok" : "ghost" })),
    ptrs: [
      { i: 3, label: "i" },
      { i: 3, label: "覆盖" },
    ],
    msg: (
      <>
        i = 3(值 <b>0</b>):3 + 0 = 3,站在这格<b>一步都跳不出去</b>。覆盖范围死死钉在 3 号。
      </>
    ),
  },
  {
    cells: R_NUMS.map((v, i) => ({ v, state: i === 4 ? "bad" : "ok" })),
    ptrs: [{ i: 4, label: "想去" }],
    msg: (
      <>
        要到 4 号,可覆盖范围只到 3 号 —— 4 &gt; 3,<b>卡死,返回 false</b>。
        贪心的判定极简:一旦「想访问的下标」超出「已覆盖范围」,就再也走不动了。
      </>
    ),
  },
];

export function JumpReach() {
  return (
    <ArrayStepper title="LC 55 · 覆盖范围盖不到终点(答案 false)" frames={REACH_FRAMES} cellW={62} />
  );
}

/* ================================================================
   JumpMin —— LC 45 跳跃游戏 II:最少跳几次
   ================================================================ */

// nums = [2, 3, 1, 1, 4] —— 最少 2 跳(0 →1 →4)。
const M_NUMS = [2, 3, 1, 1, 4];

const MIN_FRAMES: ArrayFrame[] = [
  {
    cells: M_NUMS.map((v) => ({ v })),
    msg: (
      <>
        nums = [2, 3, 1, 1, 4],求跳到末尾的<b>最少步数</b>。贪心:在「这一跳能到的范围」里,
        提前记下「下一跳能蹦得最远」的落点,走到边界才真正跳。
      </>
    ),
  },
  {
    cells: M_NUMS.map((v, i) => ({ v, state: i === 0 ? "lit" : i <= 2 ? "ok" : "ghost" })),
    ptrs: [
      { i: 0, label: "i" },
      { i: 0, label: "边界" },
      { i: 2, label: "最远" },
    ],
    msg: (
      <>
        i = 0(值 2):这一跳内最远可达 = 0 + 2 = <b>2</b>。i 已到本跳边界 0 ——
        <b>跳一次(jumps = 1)</b>,把边界推到 2。
      </>
    ),
  },
  {
    cells: M_NUMS.map((v, i) => ({ v, state: i === 1 ? "lit" : i <= 4 ? "ok" : "ghost" })),
    ptrs: [
      { i: 1, label: "i" },
      { i: 2, label: "边界" },
      { i: 4, label: "最远" },
    ],
    msg: (
      <>
        i = 1(值 3):在窗口内探路 —— 从这里能蹦到 1 + 3 = <b>4</b>!更新「最远」= 4。
        但 i 还没到边界 2,先不跳,继续找更优落点。
      </>
    ),
  },
  {
    cells: M_NUMS.map((v, i) => ({ v, state: i === 2 ? "lit" : "ok" })),
    ptrs: [
      { i: 2, label: "i" },
      { i: 2, label: "边界" },
      { i: 4, label: "最远" },
    ],
    msg: (
      <>
        i = 2(值 1):走到本跳边界 2,必须再跳。<b>跳一次(jumps = 2)</b>,
        新边界 = 记录的最远 4 —— 已经盖住终点!所以落点选 1 号(它把「最远」顶到了 4)。
      </>
    ),
  },
  {
    cells: M_NUMS.map((v) => ({ v, state: "ok" as const })),
    ptrs: [{ i: 4, label: "终点" }],
    msg: (
      <>
        2 跳到达末尾(0 → 1 → 4)。为什么最少:每次到边界时,我们都跳向了「让下一跳覆盖最远」的落点 ——
        相当于 BFS 一层层扩张,而层数就是最少步数。
      </>
    ),
  },
];

export function JumpMin() {
  return (
    <ArrayStepper title="LC 45 · 每层选最远落点,数最少跳数(答案 2)" frames={MIN_FRAMES} cellW={62} />
  );
}

/* ================================================================
   IntervalTimeline —— LC 435 无重叠区间:时间轴逐个选 / 弃
   ================================================================ */

const AXIS_MAX = 10;
// 已按右端升序排好:结束越早越靠前。
const IVS: [number, number][] = [
  [2, 3],
  [1, 4],
  [3, 5],
  [6, 8],
  [7, 9],
];

type IvSt = "pending" | "cur" | "kept" | "removed";

interface IvFrame {
  st: IvSt[];
  lastEnd: number | null;
  removed: number;
  msg: ReactNode;
}

const IV_FRAMES: IvFrame[] = [
  {
    st: ["pending", "pending", "pending", "pending", "pending"],
    lastEnd: null,
    removed: 0,
    msg: (
      <>
        5 个区间,已<b>按右端点升序</b>排好(结束越早越靠前)。目标:删最少的区间,让剩下的互不重叠。
        黄金法则:<b>永远优先保留「结束最早」的那个</b>。
      </>
    ),
  },
  {
    st: ["kept", "pending", "pending", "pending", "pending"],
    lastEnd: 3,
    removed: 0,
    msg: (
      <>
        保留结束最早的 [2, 3](绿色)。记住上一个保留区间的终点 <b>lastEnd = 3</b> ——
        它就是「后面区间能不能接上」的门槛。
      </>
    ),
  },
  {
    st: ["kept", "removed", "pending", "pending", "pending"],
    lastEnd: 3,
    removed: 1,
    msg: (
      <>
        看 [1, 4]:它的起点 1 &lt; lastEnd 3 —— 和已保留的 [2, 3] <b>重叠了</b>,删掉(红色)。
        删除数 = 1。lastEnd 不变。
      </>
    ),
  },
  {
    st: ["kept", "removed", "kept", "pending", "pending"],
    lastEnd: 5,
    removed: 1,
    msg: (
      <>
        看 [3, 5]:起点 3 ≥ lastEnd 3 —— 正好接上,<b>保留</b>!更新 lastEnd = 5。
      </>
    ),
  },
  {
    st: ["kept", "removed", "kept", "kept", "pending"],
    lastEnd: 8,
    removed: 1,
    msg: (
      <>
        看 [6, 8]:起点 6 ≥ lastEnd 5 —— 不重叠,<b>保留</b>!更新 lastEnd = 8。
      </>
    ),
  },
  {
    st: ["kept", "removed", "kept", "kept", "removed"],
    lastEnd: 8,
    removed: 2,
    msg: (
      <>
        看 [7, 9]:起点 7 &lt; lastEnd 8 —— <b>重叠</b>,删掉。删除数 = 2。
      </>
    ),
  },
  {
    st: ["kept", "removed", "kept", "kept", "removed"],
    lastEnd: 8,
    removed: 2,
    msg: (
      <>
        结束:保留 3 个([2,3]、[3,5]、[6,8]),<b>删除 2 个</b>。因为总是留下结束最早的区间,
        给后面腾出的空间最大 —— 交换论证能证明,这样删的数量一定最少。
      </>
    ),
  },
];

function ivBarCls(s: IvSt): string {
  return `grd-bar grd-bar-${s}`;
}

export function IntervalTimeline() {
  const stepper = useStepper(IV_FRAMES.length);
  const f = IV_FRAMES[stepper.step];
  const pct = (x: number) => (x / AXIS_MAX) * 100;
  const ticks = Array.from({ length: AXIS_MAX + 1 }, (_, i) => i);

  return (
    <div className="viz">
      <div className="viz-title">LC 435 · 区间时间轴:按右端排序后逐个「选 / 弃」</div>
      <div className="viz-legend" aria-hidden>
        <span className="viz-key"><i className="grd-sw grd-bar-cur" />当前考察</span>
        <span className="viz-key"><i className="grd-sw grd-bar-kept" />保留</span>
        <span className="viz-key"><i className="grd-sw grd-bar-removed" />删除</span>
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
        <div className="grd-timeline">
          {IVS.map(([a, b], i) => (
            <div key={i} className="grd-track">
              <div
                className={ivBarCls(f.st[i])}
                style={{ left: `${pct(a)}%`, width: `${pct(b - a)}%` }}
              >
                [{a}, {b}]
              </div>
            </div>
          ))}
          {/* lastEnd 竖线 */}
          {f.lastEnd !== null && (
            <div className="grd-marker" style={{ left: `${pct(f.lastEnd)}%` }}>
              <span className="grd-marker-lab">lastEnd={f.lastEnd}</span>
            </div>
          )}
        </div>
        {/* 坐标轴 */}
        <div className="grd-axis">
          {ticks.map((t) => (
            <span key={t} className="grd-tick" style={{ left: `${pct(t)}%` }}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg} <span className="dim">· 已删 {f.removed}</span>
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={IV_FRAMES.length} />
    </div>
  );
}

/* ================================================================
   CoinGreedyLab —— 硬币 [1,3,4] 凑 6 的贪心陷阱(§07 反例)
   ================================================================ */

const COINS = [1, 3, 4];
const TARGET = 6;

export function CoinGreedyLab() {
  const [picks, setPicks] = useState<number[]>([]);
  const sum = useMemo(() => picks.reduce((s, v) => s + v, 0), [picks]);
  const count = picks.length;

  const add = (c: number) => setPicks((p) => [...p, c]);
  const clear = () => setPicks([]);
  const showGreedy = () => setPicks([4, 1, 1]); // 贪心:每步拿最大
  const showOpt = () => setPicks([3, 3]); // 最优

  let msg: ReactNode;
  if (sum === 0) {
    msg = <>点下面的硬币,尝试用<b>最少的枚数</b>凑出 ¥{TARGET}。或者直接看两种策略对打。</>;
  } else if (sum > TARGET) {
    msg = (
      <>
        超了(¥{sum} &gt; ¥{TARGET})—— 凑钱不能超额,清空重来。
      </>
    );
  } else if (sum < TARGET) {
    msg = (
      <>
        当前 ¥{sum},还差 ¥{TARGET - sum}。已用 <b>{count}</b> 枚。
      </>
    );
  } else if (count === 2) {
    msg = (
      <>
        🏆 <b>2 枚(3 + 3)</b> —— 这就是最优解!而贪心「每步拿最大」会先抓一个 4,
        然后被迫 1 + 1 收尾,用掉 3 枚 —— 它永远看不见「两个 3」这条路。
      </>
    );
  } else {
    msg = (
      <>
        ¥{TARGET} 凑成了,但用了 <b>{count}</b> 枚 —— 还能更少。最优是 <b>2 枚(3 + 3)</b>,
        点「看最优」对答案。
      </>
    );
  }

  const reached = sum === TARGET;

  return (
    <div className="viz">
      <div className="viz-title">硬币 [1, 3, 4] 凑 ¥6:贪心为什么会翻车</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 14 }}>
        <div className="grd-coin-row">
          {picks.length === 0 ? (
            <span className="dim">(还没选硬币)</span>
          ) : (
            picks.map((c, i) => (
              <span key={i} className="grd-coin">
                {c}
              </span>
            ))
          )}
        </div>
        <div className="grd-coin-sum">
          <span className={reached && count === 2 ? "grd-sum-best" : reached ? "grd-sum-ok" : ""}>
            ¥{sum}
          </span>
          <span className="dim"> / ¥{TARGET} · {count} 枚</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {COINS.map((c) => (
            <button key={c} type="button" className="btn btn-sm" onClick={() => add(c)}>
              + ¥{c}
            </button>
          ))}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <div className="viz-ctl">
        <button type="button" className="btn btn-sm" onClick={clear}>
          清空
        </button>
        <button type="button" className="btn btn-sm" onClick={showGreedy}>
          看贪心(拿最大)
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={showOpt}>
          看最优
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          贪心 3 枚 · 最优 2 枚
        </span>
      </div>
    </div>
  );
}
