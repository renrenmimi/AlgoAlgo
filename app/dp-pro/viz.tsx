"use client";

// 第 10 章 · DP 进阶的四个专属可视化,对应四大高级 DP 类型:
//  - StockFSM   :自建 SVG 状态转移图 —— 精讲 309 含冷冻期,三状态逐日流动。
//  - RobTreeDP  :TreePlayer 演示 337 打家劫舍 III 的后序遍历、自底向上汇报 [rob, skip]。
//  - BalloonInterval:DPTable 演示 312 戳气球「按区间长度从小到大、斜着填」。
//  - MaskLab    :交互式「用一个整数的二进制位表示集合」—— 状压 DP(526)的地基。
//
// 双语:帧旁白直接写 <T en zh />;title / 状态名 / 边标签传 { en, zh },组件内用 useL() 解析。

import { useMemo, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { T, useL, type Loc } from "@/lib/i18n";
import {
  TreePlayer,
  DPTable,
  type TreeNodeSpec,
  type TreeFrame,
  type TreeNodeState,
  type DPFrame,
  type DPCell,
} from "@/lib/algviz";

/* ================================================================
   StockFSM —— 股票状态机转移图(精讲 LC 309 含冷冻期)
   ================================================================ */

type St = "hold" | "rest" | "sold";
type Edge = "buy" | "sell" | "thaw" | "keepHold" | "keepRest";

interface FsmFrame {
  vals: Record<St, ReactNode>;
  onSt: St[];
  onEdge: Edge[];
  answer?: boolean;
  msg: ReactNode;
}

const Q = "?";

// prices = [1, 2, 3, 0, 2] —— LC 309 官方样例,最优利润 3。
// 每一帧的三个数字与 §02 的 Java/Python/JS 代码逐日结果完全一致。
const FSM_FRAMES: FsmFrame[] = [
  {
    vals: { hold: Q, rest: Q, sold: Q },
    onSt: [],
    onEdge: [],
    msg: (
      <T
        en={
          <>
            A state is the situation you are in at the close of the day.{" "}
            <b>hold</b>: you own a share. <b>rest</b>: you own nothing and are
            not blocked, so you may buy. <b>sold</b>: you sold today, so
            tomorrow is blocked. The number in each box is the largest profit you
            can have while ending the day in that situation. Arrows are the legal
            moves from yesterday to today. Now play prices = [1, 2, 3, 0, 2].
          </>
        }
        zh={
          <>
            一个状态就是「今天收盘时你处于什么局面」。<b>hold</b>:手上有一股;
            <b>rest</b>:没股、且不在冷冻,可以买;<b>sold</b>:今天卖出了,明天被封。
            方框里的数字是「以这个局面收盘」时能拿到的最大利润。
            箭头是「昨天 → 今天」的合法转移。下面按天播放 prices = [1, 2, 3, 0, 2]。
          </>
        }
      />
    ),
  },
  {
    vals: { hold: -1, rest: 0, sold: 0 },
    onSt: ["hold"],
    onEdge: ["buy"],
    msg: (
      <T
        en={
          <>
            Day 0, price = 1. Either <b>buy</b>, which gives hold = 0 − 1 ={" "}
            <b>−1</b> (the cash you had, minus the price), or do nothing, which
            leaves rest and sold at 0. These are the starting values.
          </>
        }
        zh={
          <>
            第 0 天,price = 1。要么<b>买入</b> → hold = 0 − 1 = <b>−1</b>
            (手上的钱减去买价);要么什么都不做 → rest、sold 都还是 0。这就是初始值。
          </>
        }
      />
    ),
  },
  {
    vals: { hold: -1, rest: 0, sold: 1 },
    onSt: ["sold"],
    onEdge: ["sell", "keepHold"],
    msg: (
      <T
        en={
          <>
            Day 1, price = 2. <b>Sell</b>: sold = hold(−1) + 2 = <b>1</b>. hold
            stays at −1, because buying today at 2 would be worse. rest is still
            0. This is the first profit.
          </>
        }
        zh={
          <>
            第 1 天,price = 2。<b>卖出</b>:sold = hold(−1)+ 2 = <b>1</b>。
            hold 保持 −1,因为今天以 2 买入更差;rest 仍是 0。这是第一笔利润。
          </>
        }
      />
    ),
  },
  {
    vals: { hold: -1, rest: 1, sold: 2 },
    onSt: ["sold", "rest"],
    onEdge: ["sell", "thaw"],
    msg: (
      <T
        en={
          <>
            Day 2, price = 3. Sell: sold = −1 + 3 = <b>2</b>. rest = max(old rest
            0, <b>yesterday&apos;s sold 1</b>) = 1. When the cooldown ends, the
            money moves from sold into rest.
          </>
        }
        zh={
          <>
            第 2 天,price = 3。卖出 → sold = −1 + 3 = <b>2</b>;
            rest = max(旧 rest 0, <b>昨天的 sold 1</b>)= 1 ——
            冷冻期一结束,钱就从 sold 流进 rest。
          </>
        }
      />
    ),
  },
  {
    vals: { hold: 1, rest: 2, sold: -1 },
    onSt: ["hold", "rest"],
    onEdge: ["buy", "thaw"],
    msg: (
      <T
        en={
          <>
            Day 3, price = 0. Buying is cheap: hold = max(old hold −1,{" "}
            <b>rest(1) − 0</b>) = <b>1</b>, which is now the best of the three.
            rest = max(1, yesterday&apos;s sold 2) = 2. Note that a buy may only
            come from rest. <b>You cannot buy out of sold</b> — that is the
            cooldown.
          </>
        }
        zh={
          <>
            第 3 天,price = 0,买入很便宜:hold = max(旧 hold −1,{" "}
            <b>rest(1)− 0</b>)= <b>1</b>,一举成为三者中最高;
            rest = max(1, 昨天的 sold 2)= 2。注意买入只能从 rest 来 ——
            <b>不能从 sold 买入</b>,这就是冷冻期。
          </>
        }
      />
    ),
  },
  {
    vals: { hold: 1, rest: 2, sold: 3 },
    onSt: ["sold"],
    onEdge: ["sell", "keepRest"],
    msg: (
      <T
        en={
          <>
            Day 4, price = 2. Sell: sold = hold(1) + 2 = <b>3</b>. rest stays at
            2. This is the last day, so it is time to read the answer.
          </>
        }
        zh={
          <>
            第 4 天,price = 2。卖出 → sold = hold(1)+ 2 = <b>3</b>;rest 保持 2。
            最后一天了,该读答案了。
          </>
        }
      />
    ),
  },
  {
    vals: { hold: 1, rest: 2, sold: 3 },
    onSt: ["sold", "rest"],
    onEdge: [],
    answer: true,
    msg: (
      <T
        en={
          <>
            You should not still own a share at the end, so the answer =
            max(<b>sold 3</b>, rest 2) = <b>3</b>. One extra rule, the cooldown,
            turned two states into three. That is state machine DP:{" "}
            <b>
              more situations means more states, and the transitions are still
              computed one day at a time
            </b>
            .
          </>
        }
        zh={
          <>
            结束时不该还持有股票,所以答案 = max(<b>sold 3</b>, rest 2)= <b>3</b>。
            多了一条冷冻期规则,状态就从两个变成三个。这就是状态机 DP:
            <b>局面越多,状态越多,转移照旧一天一天地推</b>。
          </>
        }
      />
    ),
  },
];

const BOX = { w: 150, h: 60 };
const POS: Record<St, { x: number; y: number }> = {
  hold: { x: 205, y: 40 },
  rest: { x: 30, y: 215 },
  sold: { x: 380, y: 215 },
};

// 状态名要放进 150px 宽的方框里,英文比中文长 —— 保持在 16 个字符以内。
const ST_NAME: Record<St, Loc<string>> = {
  hold: { en: "hold (own share)", zh: "持有 hold" },
  rest: { en: "rest (may buy)", zh: "空仓 rest" },
  sold: { en: "sold (cooldown)", zh: "刚卖 sold" },
};

const EDGE_LAB: Record<"buy" | "sell" | "thaw" | "stay", Loc<string>> = {
  buy: { en: "buy −p", zh: "买入 −p" },
  sell: { en: "sell +p", zh: "卖出 +p" },
  thaw: { en: "cooldown ends", zh: "冷冻结束" },
  stay: { en: "stay", zh: "保持" },
};

function FsmBox({
  st,
  name,
  val,
  on,
  answer,
}: {
  st: St;
  name: string;
  val: ReactNode;
  on: boolean;
  answer: boolean;
}) {
  const p = POS[st];
  return (
    <g className={`pro-fsm-box${on ? " on" : ""}${answer ? " ans" : ""}`}>
      <rect x={p.x} y={p.y} width={BOX.w} height={BOX.h} rx={14} />
      <text className="pro-fsm-name" x={p.x + BOX.w / 2} y={p.y + 24} textAnchor="middle">
        {name}
      </text>
      <text className="pro-fsm-val" x={p.x + BOX.w / 2} y={p.y + 46} textAnchor="middle">
        {val}
      </text>
    </g>
  );
}

export function StockFSM() {
  const L = useL();
  const stepper = useStepper(FSM_FRAMES.length, 1500);
  const f = FSM_FRAMES[stepper.step];
  const onE = (e: Edge) => (f.onEdge.includes(e) ? " on" : "");

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en={<>LC 309 · stock state machine with a cooldown (prices = [1, 2, 3, 0, 2])</>}
          zh={<>LC 309 · 含冷冻期的股票状态机(prices = [1, 2, 3, 0, 2])</>}
        />
      </div>
      <div className="viz-stage" style={{ overflowX: "auto" }}>
        <svg
          className="pro-fsm-svg"
          viewBox="0 0 560 320"
          role="img"
          aria-label={L({
            en: "State transition diagram for buying and selling stock",
            zh: "股票买卖状态转移图",
          })}
          style={{ width: "100%", maxWidth: 560, minWidth: 460 }}
        >
          <defs>
            <marker
              id="pro-fsm-arrow"
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
            </marker>
          </defs>

          {/* 边(路径 + 箭头),状态跟随 onEdge */}
          <path className={`pro-fsm-edge${onE("buy")}`} d="M150,218 L214,104" markerEnd="url(#pro-fsm-arrow)" />
          <path className={`pro-fsm-edge${onE("sell")}`} d="M346,104 L410,218" markerEnd="url(#pro-fsm-arrow)" />
          <path className={`pro-fsm-edge${onE("thaw")}`} d="M378,258 L184,258" markerEnd="url(#pro-fsm-arrow)" />
          <path
            className={`pro-fsm-edge${onE("keepHold")}`}
            d="M252,40 C248,6 312,6 308,40"
            fill="none"
            markerEnd="url(#pro-fsm-arrow)"
          />
          <path
            className={`pro-fsm-edge${onE("keepRest")}`}
            d="M70,275 C70,308 130,308 130,277"
            fill="none"
            markerEnd="url(#pro-fsm-arrow)"
          />

          {/* 边标签 */}
          <text className="pro-fsm-lab" x={160} y={156} textAnchor="middle">{L(EDGE_LAB.buy)}</text>
          <text className="pro-fsm-lab" x={402} y={156} textAnchor="middle">{L(EDGE_LAB.sell)}</text>
          <text className="pro-fsm-lab" x={280} y={250} textAnchor="middle">{L(EDGE_LAB.thaw)}</text>
          <text className="pro-fsm-lab" x={280} y={12} textAnchor="middle">{L(EDGE_LAB.stay)}</text>
          <text className="pro-fsm-lab" x={100} y={316} textAnchor="middle">{L(EDGE_LAB.stay)}</text>

          {(["hold", "rest", "sold"] as St[]).map((st) => (
            <FsmBox
              key={st}
              st={st}
              name={L(ST_NAME[st])}
              val={f.vals[st]}
              on={f.onSt.includes(st)}
              answer={!!f.answer && st !== "hold"}
            />
          ))}
        </svg>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={FSM_FRAMES.length} />
    </div>
  );
}

/* ================================================================
   RobTreeDP —— 树形 DP 后序遍历(精讲 LC 337 打家劫舍 III)
   树:[3, 4, 5, 1, 3, null, 1] —— 答案 9(不偷根反而更优)。
   ================================================================ */

const TREE_NODES: TreeNodeSpec[] = [
  { id: "r", label: { en: "$3", zh: "¥3" } },
  { id: "rL", label: { en: "$4", zh: "¥4" }, parent: "r" },
  { id: "rR", label: { en: "$5", zh: "¥5" }, parent: "r" },
  { id: "rLL", label: { en: "$1", zh: "¥1" }, parent: "rL" },
  { id: "rLR", label: { en: "$3", zh: "¥3" }, parent: "rL" },
  { id: "rRR", label: { en: "$1", zh: "¥1" }, parent: "rR" },
];

const ALL_DONE: Record<string, TreeNodeState> = {
  r: "done", rL: "done", rR: "done", rLL: "done", rLR: "done", rRR: "done",
};

const TREE_FRAMES: TreeFrame[] = [
  {
    states: {},
    msg: (
      <T
        en={
          <>
            House Robber on a tree: taking a node forbids taking its children. The
            answer is not computed at the root first. The leaves are computed
            first, so the traversal is <b>post-order, bottom-up</b>. Each node
            reports a pair to its parent: <b>[rob, skip]</b> — the best total when
            the node is taken, and the best total when it is skipped.
          </>
        }
        zh={
          <>
            树上的打家劫舍:偷了一个节点,它的孩子就都不能偷。答案不是先在根算出来的 ——
            叶子先算好,所以遍历是<b>后序、自底向上</b>。每个节点向父亲汇报一对值{" "}
            <b>[rob, skip]</b>:偷它的最大金额,和不偷它的最大金额。
          </>
        }
      />
    ),
  },
  {
    states: { r: "path", rL: "path", rLL: "cur" },
    msg: (
      <T
        en={
          <>
            Go down to the leftmost leaf <b>$1</b>. It has no children, so rob = 1
            and skip = 0. It reports <b>[1, 0]</b>.
          </>
        }
        zh={
          <>
            一路下钻到最左边的叶子 <b>¥1</b>:它没有孩子,所以 rob = 1、skip = 0,
            汇报 <b>[1, 0]</b>。
          </>
        }
      />
    ),
  },
  {
    states: { r: "path", rL: "path", rLL: "done", rLR: "cur" },
    msg: (
      <T
        en={
          <>
            Its sibling leaf <b>$3</b> reports <b>[3, 0]</b>. Both leaves under the
            left child are done.
          </>
        }
        zh={
          <>
            兄弟叶子 <b>¥3</b> 汇报 <b>[3, 0]</b>。左孩子下面的两片叶子都算完了。
          </>
        }
      />
    ),
  },
  {
    states: { r: "path", rL: "cur", rLL: "done", rLR: "done" },
    msg: (
      <T
        en={
          <>
            Back at <b>$4</b>. rob = 4 + left.skip(0) + right.skip(0) = <b>4</b>.
            skip = max(1, 0) + max(3, 0) = <b>4</b>. It reports [4, 4].
          </>
        }
        zh={
          <>
            回到 <b>¥4</b>:rob = 4 + 左.skip(0)+ 右.skip(0)= <b>4</b>;
            skip = max(1, 0)+ max(3, 0)= <b>4</b>。汇报 [4, 4]。
          </>
        }
      />
    ),
  },
  {
    states: { r: "path", rL: "done", rR: "path", rRR: "cur" },
    msg: (
      <T
        en={
          <>
            The left subtree has reported. Move to the right subtree and go down to
            the leaf <b>$1</b>, which reports [1, 0].
          </>
        }
        zh={
          <>
            左子树汇报完毕,转向右子树,下钻到叶子 <b>¥1</b>,汇报 [1, 0]。
          </>
        }
      />
    ),
  },
  {
    states: { r: "path", rL: "done", rR: "cur", rRR: "done" },
    msg: (
      <T
        en={
          <>
            Back at <b>$5</b>. It has only a right child. rob = 5 + 0 = <b>5</b>.
            skip = max(1, 0) = <b>1</b>. It reports [5, 1].
          </>
        }
        zh={
          <>
            回到 <b>¥5</b>:它只有右孩子。rob = 5 + 0 = <b>5</b>;
            skip = max(1, 0)= <b>1</b>。汇报 [5, 1]。
          </>
        }
      />
    ),
  },
  {
    states: { ...ALL_DONE, r: "cur" },
    msg: (
      <T
        en={
          <>
            Both children have reported, so the root <b>$3</b> can be computed. rob
            = 3 + left.skip(4) + right.skip(1) = <b>8</b>. skip = max(4, 4) +
            max(5, 1) = 4 + 5 = <b>9</b>.
          </>
        }
        zh={
          <>
            两个孩子都汇报了,轮到根 <b>¥3</b>:rob = 3 + 左.skip(4)+ 右.skip(1)={" "}
            <b>8</b>;skip = max(4, 4)+ max(5, 1)= 4 + 5 = <b>9</b>。
          </>
        }
      />
    ),
  },
  {
    states: { ...ALL_DONE, r: "sol" },
    msg: (
      <T
        en={
          <>
            The answer = max(rob 8, <b>skip 9</b>) = <b>9</b>. Skipping the root
            wins. The parent could only see that because every node reported both
            possibilities. This is LC 198 &quot;take it or skip it&quot; moved onto
            a tree.
          </>
        }
        zh={
          <>
            答案 = max(rob 8, <b>skip 9</b>)= <b>9</b>。「不偷根」反而更优 ——
            父亲能看到这一点,只因为每个节点都把两种可能都汇报了上来。
            这就是 198「选/不选」搬上了树。
          </>
        }
      />
    ),
  },
];

export function RobTreeDP() {
  return (
    <TreePlayer
      title={{
        en: "LC 337 · post-order tree DP (each node reports [rob, skip] upward)",
        zh: "LC 337 · 树形 DP 后序遍历(每个节点向上汇报 [rob, skip])",
      }}
      nodes={TREE_NODES}
      frames={TREE_FRAMES}
      nodeW={52}
      gapX={26}
      gapY={40}
    />
  );
}

/* ================================================================
   BalloonInterval —— 区间 DP 按长度斜着填(精讲 LC 312 戳气球)
   nums = [3, 1, 5, 8] → 两端补 1 → arr = [1, 3, 1, 5, 8, 1]。答案 167。
   ================================================================ */

const ARR = [1, 3, 1, 5, 8, 1];
// DP[i][j] = 开区间 (i,j) 内戳完的最大硬币;i>j 无效(null);j−i<2 为基例 0。
const DP: (number | null)[][] = [
  [0, 0, 3, 30, 159, 167],
  [null, 0, 0, 15, 135, 159],
  [null, null, 0, 0, 40, 48],
  [null, null, null, 0, 0, 40],
  [null, null, null, null, 0, 0],
  [null, null, null, null, null, 0],
];

type Cell2 = [number, number];
function eq(a: Cell2, c: Cell2) {
  return a[0] === c[0] && a[1] === c[1];
}

function ivCells(opts: {
  spanMax: number;
  cur?: Cell2[];
  src?: Cell2[];
  ok?: Cell2;
}): DPCell[][] {
  const { spanMax, cur = [], src = [], ok } = opts;
  return DP.map((row, i) =>
    row.map((v, j) => {
      if (v === null || i > j) return { v: "", state: "ghost" as const };
      const span = j - i;
      if (ok && eq(ok, [i, j])) return { v, state: "ok" as const };
      if (cur.some((c) => eq(c, [i, j]))) return { v, state: "cur" as const };
      if (src.some((c) => eq(c, [i, j]))) return { v, state: "src" as const };
      if (span < 2) return { v, state: "done" as const }; // 基例始终可见
      if (span <= spanMax) return { v, state: "done" as const };
      return { v: "?", state: "ghost" as const };
    }),
  );
}

const SPAN2: Cell2[] = [[0, 2], [1, 3], [2, 4], [3, 5]];
const SPAN3: Cell2[] = [[0, 3], [1, 4], [2, 5]];
const SPAN4: Cell2[] = [[0, 4], [1, 5]];

const IV_FRAMES: DPFrame[] = [
  {
    cells: ivCells({ spanMax: 1 }),
    msg: (
      <T
        en={
          <>
            Pad both ends with a balloon of value 1, so arr = [1, 3, 1, 5, 8, 1].{" "}
            <b>
              dp[i][j] = the largest number of coins from bursting every balloon
              strictly between i and j
            </b>{" "}
            (an open interval). When j − i &lt; 2 the interval holds no balloon, so
            dp = <b>0</b>. Those are the base cases near the diagonal, already
            filled.
          </>
        }
        zh={
          <>
            两端各补一个值为 1 的气球,arr = [1, 3, 1, 5, 8, 1]。
            <b>dp[i][j] = 把下标严格位于 i 与 j 之间的气球全戳完能拿到的最大硬币</b>
            (开区间)。当 j − i &lt; 2 时区间里没有气球,dp = <b>0</b> ——
            这就是对角线附近的基例,已经填好。
          </>
        }
      />
    ),
  },
  {
    cells: ivCells({ spanMax: 2, cur: SPAN2 }),
    msg: (
      <T
        en={
          <>
            <b>Fill the intervals of length 2 first.</b> Each holds exactly one
            balloon, which must therefore be the last one burst: dp[0][2] = 1·3·1 =
            3, dp[1][3] = 3·1·5 = 15, dp[2][4] = 1·5·8 = 40, dp[3][5] = 5·8·1 = 40.
            These cells sit on <b>one diagonal</b>: the same diagonal means the
            same interval length.
          </>
        }
        zh={
          <>
            <b>先填长度为 2 的区间</b>。它们中间只有一个气球,那个气球必然是最后戳的:
            dp[0][2] = 1·3·1 = 3、dp[1][3] = 3·1·5 = 15、dp[2][4] = 1·5·8 = 40、
            dp[3][5] = 5·8·1 = 40。这批格子落在<b>同一条对角线</b>上 ——
            同一条对角线就是同一个区间长度。
          </>
        }
      />
    ),
  },
  {
    cells: ivCells({ spanMax: 3, cur: SPAN3 }),
    msg: (
      <T
        en={
          <>
            <b>Now length 3.</b> Each holds two balloons, so try both choices of
            &quot;which one is burst last&quot; and keep the larger. Take dp[1][4]:
            with k = 3, dp[1][3](15) + 3·5·8(120) + dp[3][4](0) = <b>135</b>, which
            wins over k = 2. Every longer cell only reads answers of shorter
            intervals that are already on the table.
          </>
        }
        zh={
          <>
            <b>再填长度 3。</b>它们中间有两个气球,所以要试两种「最后戳哪个」,取较大值。
            以 dp[1][4] 为例:取 k = 3 时,dp[1][3](15)+ 3·5·8(120)+ dp[3][4](0)={" "}
            <b>135</b>,胜过 k = 2。每个更长的格子读的都是表上已经算好的更短区间。
          </>
        }
      />
    ),
  },
  {
    cells: ivCells({ spanMax: 4, cur: SPAN4 }),
    msg: (
      <T
        en={
          <>
            <b>Length 4:</b> dp[0][4] = 159 and dp[1][5] = 159. The filled region
            moves toward the top-right corner, and each step reads only intervals
            that are strictly shorter. That dependency is what forces the order
            &quot;by increasing length&quot;.
          </>
        }
        zh={
          <>
            <b>长度 4:</b>dp[0][4] = 159、dp[1][5] = 159。已填区域不断向右上角推进,
            而每一步读到的都是严格更短的区间。正是这个依赖关系,
            逼出了「按长度从小到大」的填表顺序。
          </>
        }
      />
    ),
  },
  {
    cells: ivCells({ spanMax: 5, src: [[0, 4], [4, 5]], ok: [0, 5] }),
    msg: (
      <T
        en={
          <>
            <b>The last cell dp[0][5]</b> is the answer for the whole row. Try each
            balloon as the last one burst. With k = 4 (value 8): dp[0][4](
            <b>159</b>, dashed blue) + arr[0]·arr[4]·arr[5](1·8·1 = 8) +
            dp[4][5](0) = <b>167</b>, the best of the four choices. Fixing the
            balloon burst last is what keeps the two sides independent.
          </>
        }
        zh={
          <>
            <b>最后一格 dp[0][5]</b> 就是整段的答案。逐个试哪个气球最后戳:
            取 k = 4(值 8)时,dp[0][4](<b>159</b>,蓝色虚线)+
            arr[0]·arr[4]·arr[5](1·8·1 = 8)+ dp[4][5](0)= <b>167</b>,
            是四种选择里最大的。固定「最后戳的那个」,左右两段才互不影响。
          </>
        }
      />
    ),
  },
];

const IV_LABELS = ARR.map((v, i) => (
  <span key={i}>
    {i}
    <br />
    <span className="pro-bval">{v}</span>
  </span>
));

export function BalloonInterval() {
  return (
    <DPTable
      title={{
        en: "LC 312 · interval DP filled by diagonals (row i, column j, cell = dp[i][j])",
        zh: "LC 312 · 区间 DP 斜着填(行 i / 列 j,格中数字 = dp[i][j])",
      }}
      frames={IV_FRAMES}
      colLabels={IV_LABELS}
      rowLabels={IV_LABELS}
      cornerLabel="dp"
      cellW={54}
    />
  );
}

/* ================================================================
   MaskLab —— 交互式「用一个整数的二进制位表示集合」(状压 DP · LC 526)
   ================================================================ */

const NUMS = [1, 2, 3]; // n = 3,数字 1..3

export function MaskLab() {
  const L = useL();
  const [used, setUsed] = useState<boolean[]>(() => NUMS.map(() => false));

  const mask = useMemo(
    () => used.reduce((m, on, i) => (on ? m | (1 << i) : m), 0),
    [used],
  );
  const pos = used.filter(Boolean).length; // popcount = 已填位置数
  const nextPos = pos + 1;
  const full = pos === NUMS.length;

  const legalNext = useMemo(
    () =>
      NUMS.filter(
        (num, i) => !used[i] && (num % nextPos === 0 || nextPos % num === 0),
      ),
    [used, nextPos],
  );

  const bin = used.map((on) => (on ? "1" : "0")).reverse().join(""); // 高位在前

  const toggle = (i: number) => setUsed((u) => u.map((v, j) => (j === i ? !v : v)));

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en={<>Bitmask lab · switch on the numbers already used and watch them become one integer</>}
          zh={<>状压 DP 实验室 · 点亮「已用过的数字」,看它如何变成一个整数</>}
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 14 }}>
        <div className="pro-lamp-row">
          {NUMS.map((num, i) => (
            <button
              key={num}
              type="button"
              className={`pro-lamp${used[i] ? " on" : ""}`}
              onClick={() => toggle(i)}
              aria-pressed={used[i]}
              aria-label={L({
                en: `number ${num}, ${used[i] ? "used" : "not used"}`,
                zh: `数字 ${num},${used[i] ? "已用" : "未用"}`,
              })}
            >
              <span className="pro-lamp-bit">bit {i}</span>
              <span className="pro-lamp-num">{num}</span>
              <span className="pro-lamp-state">
                {used[i] ? L({ en: "used 1", zh: "已用 1" }) : L({ en: "free 0", zh: "未用 0" })}
              </span>
            </button>
          ))}
        </div>
        <div className="pro-mask-readout">
          <span>
            mask = <b className="mono">0b{bin}</b> = <b className="mono">{mask}</b>
          </span>
          <span>
            <T en={<>popcount = positions filled = </>} zh={<>popcount = 已填位置数 = </>} />
            <b>{pos}</b>
          </span>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {full ? (
          <T
            en={
              <>
                🎉 mask = 0b111 = 7. All three numbers are used, so{" "}
                <b>one complete arrangement is filled in</b>. dp[all ones] is the
                total number of ways to reach this state, which is the answer.
              </>
            }
            zh={
              <>
                🎉 mask = 0b111 = 7,三个数字全部用完 —— <b>一个完整的排列填好了</b>。
                dp[全 1] 累加的就是走到这个状态的方案数,也就是答案。
              </>
            }
          />
        ) : (
          <>
            <T
              en={
                <>
                  {pos} bits are on, so {pos} positions are filled and the next one
                  to fill is <b>position {nextPos}</b>. The numbers allowed there
                  (num % {nextPos} == 0 or {nextPos} % num == 0):
                </>
              }
              zh={
                <>
                  已点亮 {pos} 个 bit,所以已填好 {pos} 个位置,
                  下一个要填的是<b>位置 {nextPos}</b>。可以放在那里的数字
                  (满足 num % {nextPos} == 0 或 {nextPos} % num == 0):
                </>
              }
            />
            {legalNext.length ? (
              <b> {legalNext.join(L({ en: ", ", zh: "、" }))}</b>
            ) : (
              <b>
                {" "}
                <T
                  en={<>none — this branch is dead, so it contributes nothing</>}
                  zh={<>无 —— 这条分支走死了,贡献为 0</>}
                />
              </b>
            )}
            <T
              en={
                <>
                  . Each time you pick an allowed number, switch on its bit:
                  dp[mask | bit] += dp[mask].
                </>
              }
              zh={
                <>
                  。每选一个合法数字,就点亮它对应的 bit:dp[mask | bit] += dp[mask]。
                </>
              }
            />
          </>
        )}
      </div>
      <div className="viz-ctl">
        <button type="button" className="btn btn-sm" onClick={() => setUsed(NUMS.map(() => false))}>
          <T en={<>Reset</>} zh={<>清空重来</>} />
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          <T
            en={<>n = 3 · 3 beautiful arrangements in total</>}
            zh={<>n = 3 · 优美排列共 3 个</>}
          />
        </span>
      </div>
    </div>
  );
}
