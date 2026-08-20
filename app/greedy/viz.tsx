"use client";

// 第 6 章 · 贪心的专属可视化:
//  - CookieMatch:LC 455 分发饼干 —— 双行(孩子 / 饼干)双指针匹配逐帧,
//    亲眼看「小饼干配小胃口、喂不动就换大的」这条贪心规则如何展开。
//  - JumpReach:LC 55 跳跃游戏 —— 覆盖范围 ArrayStepper,演示「够不够得着终点」。
//  - JumpMin:LC 45 跳跃游戏 II —— 覆盖范围 + 跳跃边界 ArrayStepper,数最少步数。
//  - IntervalTimeline:LC 435 无重叠区间 —— 自建时间轴,按右端排序后逐个「选 / 弃」。
//  - CoinGreedyLab:硬币 [1,3,4] 凑 6 的贪心反例实验室(§07,预告第 7 章)。
//
// 双语:帧旁白直接写 <T en zh />;ArrayStepper 的 title / ptr label 传 { en, zh }。

import { useMemo, useState, type ReactNode } from "react";
import { T, useL } from "@/lib/i18n";
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
      <T
        en={
          <>
            Appetites g = [2, 3, 5], cookie sizes s = [1, 2, 4, 4] —{" "}
            <b>both arrays are sorted first</b>. Goal: satisfy as many children
            as possible, where a child is satisfied by any cookie with size ≥
            appetite.
          </>
        }
        zh={
          <>
            孩子胃口 g = [2, 3, 5],饼干尺寸 s = [1, 2, 4, 4] ——{" "}
            <b>两边都先排好序</b>。目标:让尽量多的孩子吃到「尺寸 ≥ 胃口」的饼干。
          </>
        }
      />
    ),
  },
  {
    child: ["cur", "pending", "pending"],
    cookie: ["cur", "pending", "pending", "pending"],
    msg: (
      <T
        en={
          <>
            Both pointers start at the smallest value. Offer the smallest cookie{" "}
            <b>1</b> to the child with the smallest appetite <b>2</b>. Since 1
            &lt; 2, it is not enough.
          </>
        }
        zh={
          <>
            两个指针都从最小开始:拿最小的饼干 <b>1</b> 试喂胃口最小的孩子{" "}
            <b>2</b> —— 1 &lt; 2,喂不动。
          </>
        }
      />
    ),
  },
  {
    child: ["cur", "pending", "pending"],
    cookie: ["dropped", "cur", "pending", "pending"],
    msg: (
      <T
        en={
          <>
            Cookie 1 cannot satisfy even the least demanding child, so it can
            satisfy <b>no child at all</b>. Discard it and move to cookie 2. Now
            2 ≥ 2, so this child is satisfied.
          </>
        }
        zh={
          <>
            饼干 1 连最不挑的孩子都满足不了,那它<b>对谁都没用</b> ——
            直接丢弃,换下一块饼干 2。2 ≥ 2,成交。
          </>
        }
      />
    ),
  },
  {
    child: ["ok", "cur", "pending"],
    cookie: ["dropped", "used", "cur", "pending"],
    msg: (
      <T
        en={
          <>
            One child is fed. Both pointers move forward: cookie <b>4</b> is
            offered to the child with appetite <b>3</b>, and 4 ≥ 3, so that
            child is satisfied too. Note that greedy <b>did not</b> look for a
            bigger cookie. The smallest one that works is enough.
          </>
        }
        zh={
          <>
            一个孩子满足了。两个指针同时右移:饼干 <b>4</b> 试喂胃口 <b>3</b>{" "}
            的孩子 —— 4 ≥ 3,又成交。注意贪心<b>没有</b>去找更大的饼干,
            刚好够用就行。
          </>
        }
      />
    ),
  },
  {
    child: ["ok", "ok", "cur"],
    cookie: ["dropped", "used", "used", "cur"],
    msg: (
      <T
        en={
          <>
            Two children are fed. The last cookie <b>4</b> is offered to the
            child with the largest appetite <b>5</b>. Since 4 &lt; 5, it is not
            enough, and there are no cookies left.
          </>
        }
        zh={
          <>
            两个孩子满足了。最后一块饼干 <b>4</b> 试喂胃口最大的孩子 <b>5</b>{" "}
            —— 4 &lt; 5,喂不动,而饼干也用完了。
          </>
        }
      />
    ),
  },
  {
    child: ["ok", "ok", "miss"],
    cookie: ["dropped", "used", "used", "dropped"],
    msg: (
      <T
        en={
          <>
            Result: <b>2 children</b> are fed, and the child with appetite 5 is
            not. Every step used the smallest cookie that was still large
            enough, so no large cookie was spent on a small appetite. The
            exchange argument below is what proves this rule cannot lose.
          </>
        }
        zh={
          <>
            结果:<b>2 个孩子</b>吃饱,胃口 5 的孩子没吃到。
            每一步都用「刚好够」的饼干,所以没有把大饼干浪费在小胃口上。
            下面的交换论证正是用来证明这条规则不会吃亏的。
          </>
        }
      />
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
  const L = useL();
  const f = COOKIE_FRAMES[stepper.step];
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en={<>LC 455 · Assign Cookies: smallest usable cookie, smallest appetite</>}
          zh={<>LC 455 · 分发饼干:小饼干先喂小胃口(逐帧)</>}
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 20, overflowX: "auto" }}>
        <div className="grd-row">
          <span className="grd-rowlab">
            {L({ en: "children g", zh: "孩子·胃口" })}
          </span>
          <div className="grd-cells">
            {G.map((v, i) => (
              <div key={i} className={chCls(f.child[i])} style={{ width: 50, height: 50 }}>
                🧒{v}
              </div>
            ))}
          </div>
        </div>
        <div className="grd-row">
          <span className="grd-rowlab">
            {L({ en: "cookies s", zh: "饼干·尺寸" })}
          </span>
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
      <T
        en={
          <>
            nums = [3, 2, 1, 0, 4]. Each number is how many steps forward you may
            jump from that cell. Can you get from index 0 to the last index? The
            scan tracks one value: <b>reach</b>, the farthest index reachable so
            far.
          </>
        }
        zh={
          <>
            nums = [3, 2, 1, 0, 4],每个数字表示「站在这格最多能往前跳几步」。
            问:能从 0 号走到末尾吗?扫描只维护一个值 —— <b>reach</b>,
            目前最远能到的下标。
          </>
        }
      />
    ),
  },
  {
    cells: R_NUMS.map((v, i) => ({ v, state: i === 0 ? "lit" : i <= 3 ? "ok" : "ghost" })),
    ptrs: [
      { i: 0, label: "i" },
      { i: 3, label: "reach" },
    ],
    msg: (
      <T
        en={
          <>
            i = 0 (value 3): reach = max(0, 0 + 3) = <b>3</b>. Indices 0 to 3 are
            reachable (green); index 4 is not reachable yet (grey).
          </>
        }
        zh={
          <>
            i = 0(值 3):reach = max(0, 0 + 3) = <b>3</b>。
            0~3 号都够得着(绿色),4 号暂时够不着(灰色)。
          </>
        }
      />
    ),
  },
  {
    cells: R_NUMS.map((v, i) => ({ v, state: i === 1 ? "lit" : i <= 3 ? "ok" : "ghost" })),
    ptrs: [
      { i: 1, label: "i" },
      { i: 3, label: "reach" },
    ],
    msg: (
      <T
        en={
          <>
            i = 1 (value 2): 1 + 2 = 3, so reach does not grow. It stays at{" "}
            <b>3</b>.
          </>
        }
        zh={
          <>
            i = 1(值 2):1 + 2 = 3,覆盖范围没有变大,还是 <b>3</b>。
          </>
        }
      />
    ),
  },
  {
    cells: R_NUMS.map((v, i) => ({ v, state: i === 2 ? "lit" : i <= 3 ? "ok" : "ghost" })),
    ptrs: [
      { i: 2, label: "i" },
      { i: 3, label: "reach" },
    ],
    msg: (
      <T
        en={
          <>
            i = 2 (value 1): 2 + 1 = 3, and reach is still <b>3</b>. The scan
            index is catching up with reach, which is the warning sign.
          </>
        }
        zh={
          <>
            i = 2(值 1):2 + 1 = 3,reach 依旧停在 <b>3</b>。
            扫描下标正在追上 reach,这是危险信号。
          </>
        }
      />
    ),
  },
  {
    cells: R_NUMS.map((v, i) => ({ v, state: i === 3 ? "lit" : i < 3 ? "ok" : "ghost" })),
    ptrs: [
      { i: 3, label: "i" },
      { i: 3, label: "reach" },
    ],
    msg: (
      <T
        en={
          <>
            i = 3 (value <b>0</b>): 3 + 0 = 3, so this cell <b>cannot move at
            all</b>. reach is stuck at index 3, and i has now caught up with it.
          </>
        }
        zh={
          <>
            i = 3(值 <b>0</b>):3 + 0 = 3,站在这格<b>一步都跳不出去</b>。
            reach 死死钉在 3 号,而 i 已经追平了它。
          </>
        }
      />
    ),
  },
  {
    cells: R_NUMS.map((v, i) => ({ v, state: i === 4 ? "bad" : "ok" })),
    ptrs: [{ i: 4, label: { en: "goal", zh: "终点" } }],
    msg: (
      <T
        en={
          <>
            Index 4 is needed, but reach is only 3, and 4 &gt; 3, so{" "}
            <b>return false</b>. Every index up to 3 was reachable using cells 0
            to 3 as launch points, and no cell beyond that can be used, because
            you only ever move forward.
          </>
        }
        zh={
          <>
            要到 4 号,而 reach 只到 3,4 &gt; 3,<b>返回 false</b>。
            用 0~3 号做起跳点能覆盖的下标最多到 3,
            而更远的格子根本用不上 —— 因为只能往前走。
          </>
        }
      />
    ),
  },
];

export function JumpReach() {
  return (
    <ArrayStepper
      title={{
        en: "LC 55 · reach never covers the last index (answer: false)",
        zh: "LC 55 · 覆盖范围盖不到终点(答案 false)",
      }}
      frames={REACH_FRAMES}
      cellW={62}
    />
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
      <T
        en={
          <>
            nums = [2, 3, 1, 1, 4]. Find the <b>smallest number of jumps</b> to
            the last index. Two values are tracked: <b>curEnd</b>, the last index
            reachable with the jumps taken so far, and <b>farthest</b>, the last
            index reachable with one more jump.
          </>
        }
        zh={
          <>
            nums = [2, 3, 1, 1, 4],求跳到末尾的<b>最少步数</b>。
            扫描维护两个值:<b>curEnd</b>(已跳的步数内能到的最远下标)和{" "}
            <b>farthest</b>(再跳一次能到的最远下标)。
          </>
        }
      />
    ),
  },
  {
    cells: M_NUMS.map((v, i) => ({ v, state: i === 0 ? "lit" : i <= 2 ? "ok" : "ghost" })),
    ptrs: [
      { i: 0, label: "i" },
      { i: 0, label: "curEnd" },
      { i: 2, label: "farthest" },
    ],
    msg: (
      <T
        en={
          <>
            i = 0 (value 2): farthest = 0 + 2 = <b>2</b>. The scan has reached
            curEnd = 0, so this layer is finished:{" "}
            <b>one jump is used (jumps = 1)</b> and curEnd moves to 2.
          </>
        }
        zh={
          <>
            i = 0(值 2):farthest = 0 + 2 = <b>2</b>。
            扫描已经走到 curEnd = 0,这一层用尽了:
            <b>跳一次(jumps = 1)</b>,curEnd 推进到 2。
          </>
        }
      />
    ),
  },
  {
    cells: M_NUMS.map((v, i) => ({ v, state: i === 1 ? "lit" : i <= 4 ? "ok" : "ghost" })),
    ptrs: [
      { i: 1, label: "i" },
      { i: 2, label: "curEnd" },
      { i: 4, label: "farthest" },
    ],
    msg: (
      <T
        en={
          <>
            i = 1 (value 3): from here you could reach 1 + 3 = <b>4</b>, so
            farthest becomes 4. i has not reached curEnd = 2 yet, so no jump is
            counted. The scan keeps looking for a better landing spot.
          </>
        }
        zh={
          <>
            i = 1(值 3):从这里能到 1 + 3 = <b>4</b>,于是 farthest 更新为 4。
            i 还没走到 curEnd = 2,所以先不计步,继续在本层里找更好的落点。
          </>
        }
      />
    ),
  },
  {
    cells: M_NUMS.map((v, i) => ({ v, state: i === 2 ? "lit" : "ok" })),
    ptrs: [
      { i: 2, label: "i" },
      { i: 2, label: "curEnd" },
      { i: 4, label: "farthest" },
    ],
    msg: (
      <T
        en={
          <>
            i = 2 (value 1): the scan reached curEnd = 2, so another jump is
            needed. <b>jumps = 2</b>, and the new curEnd is farthest = 4, which
            already covers the last index. The landing spot that produced it was
            index 1.
          </>
        }
        zh={
          <>
            i = 2(值 1):扫描走到了 curEnd = 2,必须再跳一次。
            <b>jumps = 2</b>,新的 curEnd = farthest = 4,已经盖住末尾。
            把 farthest 顶到 4 的落点正是 1 号。
          </>
        }
      />
    ),
  },
  {
    cells: M_NUMS.map((v) => ({ v, state: "ok" as const })),
    ptrs: [{ i: 4, label: { en: "goal", zh: "终点" } }],
    msg: (
      <T
        en={
          <>
            Two jumps reach the end (0 → 1 → 4). Why two is the minimum: after k
            increments, curEnd is exactly the farthest index reachable in k
            jumps. The last index first falls inside that range at k = 2, so no
            plan can do it in one.
          </>
        }
        zh={
          <>
            2 跳到达末尾(0 → 1 → 4)。为什么这是最少:累加 k 次之后,
            curEnd 恰好是「k 跳能到的最远下标」。末尾第一次落进这个范围是在 k = 2,
            所以没有任何跳法能用 1 跳做到。
          </>
        }
      />
    ),
  },
];

export function JumpMin() {
  return (
    <ArrayStepper
      title={{
        en: "LC 45 · one jump per layer, count the layers (answer: 2)",
        zh: "LC 45 · 每层选最远落点,数最少跳数(答案 2)",
      }}
      frames={MIN_FRAMES}
      cellW={62}
    />
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
      <T
        en={
          <>
            Five intervals, already <b>sorted by right endpoint</b>, so the one
            that ends earliest comes first. Goal: remove as few as possible so
            that the rest do not overlap. The rule is to always keep the
            interval that <b>ends earliest</b>.
          </>
        }
        zh={
          <>
            5 个区间,已<b>按右端点升序</b>排好,结束越早越靠前。
            目标:删掉尽量少的区间,让剩下的互不重叠。
            规则是永远优先保留<b>结束最早</b>的那个。
          </>
        }
      />
    ),
  },
  {
    st: ["kept", "pending", "pending", "pending", "pending"],
    lastEnd: 3,
    removed: 0,
    msg: (
      <T
        en={
          <>
            Keep [2, 3], the interval that ends earliest (green). Record the end
            of the last kept interval, <b>lastEnd = 3</b>. That value is the
            threshold every later interval has to clear.
          </>
        }
        zh={
          <>
            保留结束最早的 [2, 3](绿色)。记下上一个保留区间的终点{" "}
            <b>lastEnd = 3</b> —— 它就是后面每个区间必须跨过的门槛。
          </>
        }
      />
    ),
  },
  {
    st: ["kept", "removed", "pending", "pending", "pending"],
    lastEnd: 3,
    removed: 1,
    msg: (
      <T
        en={
          <>
            Look at [1, 4]: its start 1 is before lastEnd 3, so it{" "}
            <b>overlaps</b> the kept [2, 3]. Remove it (red). Removed = 1, and
            lastEnd does not change.
          </>
        }
        zh={
          <>
            看 [1, 4]:起点 1 早于 lastEnd 3,和已保留的 [2, 3] <b>重叠</b>,
            删掉(红色)。删除数 = 1,lastEnd 不变。
          </>
        }
      />
    ),
  },
  {
    st: ["kept", "removed", "kept", "pending", "pending"],
    lastEnd: 5,
    removed: 1,
    msg: (
      <T
        en={
          <>
            Look at [3, 5]: its start 3 is not before lastEnd 3, so the two only
            touch. <b>Keep it</b> and set lastEnd = 5.
          </>
        }
        zh={
          <>
            看 [3, 5]:起点 3 不早于 lastEnd 3,两者只是相接而不重叠。
            <b>保留</b>,并令 lastEnd = 5。
          </>
        }
      />
    ),
  },
  {
    st: ["kept", "removed", "kept", "kept", "pending"],
    lastEnd: 8,
    removed: 1,
    msg: (
      <T
        en={
          <>
            Look at [6, 8]: its start 6 is after lastEnd 5, so there is no
            overlap. <b>Keep it</b> and set lastEnd = 8.
          </>
        }
        zh={
          <>
            看 [6, 8]:起点 6 晚于 lastEnd 5,不重叠。<b>保留</b>,并令 lastEnd = 8。
          </>
        }
      />
    ),
  },
  {
    st: ["kept", "removed", "kept", "kept", "removed"],
    lastEnd: 8,
    removed: 2,
    msg: (
      <T
        en={
          <>
            Look at [7, 9]: its start 7 is before lastEnd 8, so it{" "}
            <b>overlaps</b>. Remove it. Removed = 2.
          </>
        }
        zh={
          <>
            看 [7, 9]:起点 7 早于 lastEnd 8,<b>重叠</b>,删掉。删除数 = 2。
          </>
        }
      />
    ),
  },
  {
    st: ["kept", "removed", "kept", "kept", "removed"],
    lastEnd: 8,
    removed: 2,
    msg: (
      <T
        en={
          <>
            Done: 3 intervals kept ([2,3], [3,5], [6,8]) and <b>2 removed</b>.
            Taking the earliest ending interval each time leaves the largest
            possible amount of time for everything after it, and the exchange
            argument below turns that into a proof that no other choice keeps
            more.
          </>
        }
        zh={
          <>
            结束:保留 3 个([2,3]、[3,5]、[6,8]),<b>删除 2 个</b>。
            每次都取结束最早的区间,给后面留下的时间最多;
            下面的交换论证把这一点变成「没有别的选法能保留更多」的证明。
          </>
        }
      />
    ),
  },
];

function ivBarCls(s: IvSt): string {
  return `grd-bar grd-bar-${s}`;
}

export function IntervalTimeline() {
  const stepper = useStepper(IV_FRAMES.length);
  const L = useL();
  const f = IV_FRAMES[stepper.step];
  const pct = (x: number) => (x / AXIS_MAX) * 100;
  const ticks = Array.from({ length: AXIS_MAX + 1 }, (_, i) => i);

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en={<>LC 435 · sorted by end time, then keep or remove one at a time</>}
          zh={<>LC 435 · 区间时间轴:按右端排序后逐个「选 / 弃」</>}
        />
      </div>
      <div className="viz-legend" aria-hidden>
        <span className="viz-key">
          <i className="grd-sw grd-bar-cur" />
          {L({ en: "current", zh: "当前考察" })}
        </span>
        <span className="viz-key">
          <i className="grd-sw grd-bar-kept" />
          {L({ en: "kept", zh: "保留" })}
        </span>
        <span className="viz-key">
          <i className="grd-sw grd-bar-removed" />
          {L({ en: "removed", zh: "删除" })}
        </span>
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
        {f.msg}{" "}
        <span className="dim">
          {L({ en: "· removed so far: ", zh: "· 已删 " })}
          {f.removed}
        </span>
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={IV_FRAMES.length} />
    </div>
  );
}

/* ================================================================
   CoinGreedyLab —— 硬币 [1,3,4] 凑 6 的贪心反例(§07)
   ================================================================ */

const COINS = [1, 3, 4];
const TARGET = 6;

export function CoinGreedyLab() {
  const [picks, setPicks] = useState<number[]>([]);
  const L = useL();
  const sum = useMemo(() => picks.reduce((s, v) => s + v, 0), [picks]);
  const count = picks.length;

  const add = (c: number) => setPicks((p) => [...p, c]);
  const clear = () => setPicks([]);
  const showGreedy = () => setPicks([4, 1, 1]); // 贪心:每步拿能用的最大面额
  const showOpt = () => setPicks([3, 3]); // 最优

  let msg: ReactNode;
  if (sum === 0) {
    msg = (
      <T
        en={
          <>
            Click the coins below and try to make {TARGET} with the{" "}
            <b>fewest coins</b>. Or compare the two strategies directly.
          </>
        }
        zh={
          <>
            点下面的硬币,试着用<b>最少的枚数</b>凑出 {TARGET}。
            或者直接对比两种策略。
          </>
        }
      />
    );
  } else if (sum > TARGET) {
    msg = (
      <T
        en={
          <>
            Too much ({sum} &gt; {TARGET}). The total has to match exactly, so
            clear and try again.
          </>
        }
        zh={
          <>
            超了({sum} &gt; {TARGET})—— 总额必须刚好相等,清空重来。
          </>
        }
      />
    );
  } else if (sum < TARGET) {
    msg = (
      <T
        en={
          <>
            Current total {sum}, {TARGET - sum} to go. Coins used so far:{" "}
            <b>{count}</b>.
          </>
        }
        zh={
          <>
            当前 {sum},还差 {TARGET - sum}。已用 <b>{count}</b> 枚。
          </>
        }
      />
    );
  } else if (count === 2) {
    msg = (
      <T
        en={
          <>
            🏆 <b>2 coins (3 + 3)</b> is the best answer. Greedy takes the
            largest coin that fits, so it starts with 4 and is then forced into 1
            + 1, using 3 coins. It never considers a plan that starts with 3.
          </>
        }
        zh={
          <>
            🏆 <b>2 枚(3 + 3)</b>,这就是最优解。
            贪心每步拿能用的最大面额,所以先拿 4,之后只能用 1 + 1 收尾,共 3 枚 ——
            它从不考虑「以 3 开头」的方案。
          </>
        }
      />
    );
  } else {
    msg = (
      <T
        en={
          <>
            You reached {TARGET}, but with <b>{count}</b> coins. Fewer is
            possible: the best answer is <b>2 coins (3 + 3)</b>. Press
            &quot;Show best&quot; to compare.
          </>
        }
        zh={
          <>
            凑出了 {TARGET},但用了 <b>{count}</b> 枚 —— 还能更少。
            最优是 <b>2 枚(3 + 3)</b>,点「看最优」对答案。
          </>
        }
      />
    );
  }

  const reached = sum === TARGET;

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en={<>Coins [1, 3, 4], amount 6: where greedy loses</>}
          zh={<>硬币 [1, 3, 4] 凑 6:贪心为什么会失效</>}
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 14 }}>
        <div className="grd-coin-row">
          {picks.length === 0 ? (
            <span className="dim">{L({ en: "(no coins yet)", zh: "(还没选硬币)" })}</span>
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
            {sum}
          </span>
          <span className="dim">
            {" "}
            / {TARGET} · {count} {L({ en: "coins", zh: "枚" })}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {COINS.map((c) => (
            <button key={c} type="button" className="btn btn-sm" onClick={() => add(c)}>
              + {c}
            </button>
          ))}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <div className="viz-ctl">
        <button type="button" className="btn btn-sm" onClick={clear}>
          {L({ en: "Clear", zh: "清空" })}
        </button>
        <button type="button" className="btn btn-sm" onClick={showGreedy}>
          {L({ en: "Show greedy", zh: "看贪心" })}
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={showOpt}>
          {L({ en: "Show best", zh: "看最优" })}
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          {L({ en: "greedy 3 · best 2", zh: "贪心 3 枚 · 最优 2 枚" })}
        </span>
      </div>
    </div>
  );
}
