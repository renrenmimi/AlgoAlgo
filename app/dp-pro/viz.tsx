"use client";

// 第 10 章 · DP 进阶的四个专属可视化,对应四大高级 DP 类型:
//  - StockFSM   :自建 SVG 状态转移图 —— 精讲 309 含冷冻期,三状态逐日流动。
//  - RobTreeDP  :TreePlayer 演示 337 打家劫舍 III 的后序遍历、自底向上汇报 [偷,不偷]。
//  - BalloonInterval:DPTable 演示 312 戳气球「按区间长度从小到大、斜着填」。
//  - MaskLab    :交互式「用一个整数的二进制位表示集合」—— 状压 DP(526)的地基。

import { useMemo, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
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
const FSM_FRAMES: FsmFrame[] = [
  {
    vals: { hold: Q, rest: Q, sold: Q },
    onSt: [],
    onEdge: [],
    msg: (
      <>
        三个状态就是「今天收盘时你处于什么身份」:<b>持有 hold</b>(手上有股)、
        <b>空仓 rest</b>(没股、且不在冷冻,可以买)、<b>刚卖 sold</b>(今天刚卖出,进入冷冻)。
        箭头是「昨天 → 今天」的合法转移。下面按天播放 prices = [1, 2, 3, 0, 2]。
      </>
    ),
  },
  {
    vals: { hold: -1, rest: 0, sold: 0 },
    onSt: ["hold"],
    onEdge: ["buy"],
    msg: (
      <>
        第 0 天,price = 1。要么<b>买入</b> → hold = 0 − 1 = <b>−1</b>(空仓的钱减去买价);
        要么什么都不做 → rest、sold 都还是 0。初始就位。
      </>
    ),
  },
  {
    vals: { hold: -1, rest: 0, sold: 1 },
    onSt: ["sold"],
    onEdge: ["sell"],
    msg: (
      <>
        第 1 天,price = 2。<b>卖出</b>:sold = hold(−1) + 2 = <b>1</b>;
        hold 保持 −1(今天再买更亏);rest 仍是 0。第一次赚到钱。
      </>
    ),
  },
  {
    vals: { hold: -1, rest: 1, sold: 2 },
    onSt: ["sold", "rest"],
    onEdge: ["sell", "thaw"],
    msg: (
      <>
        第 2 天,price = 3。卖出 → sold = −1 + 3 = <b>2</b>;
        rest = max(旧 rest 0, <b>昨天的 sold 1</b>) = 1 —— 冷冻期一满,钱就从「刚卖」流进「空仓」。
      </>
    ),
  },
  {
    vals: { hold: 1, rest: 2, sold: -1 },
    onSt: ["hold", "rest"],
    onEdge: ["buy", "thaw"],
    msg: (
      <>
        第 3 天,price = 0!抄底:hold = max(旧 hold −1, <b>rest(1) − 0</b>) = <b>1</b> 一举反超;
        rest = max(1, 昨 sold 2) = 2。注意买入只能来自 rest,<b>刚卖的 sold 今天不能买</b> —— 这就是冷冻期。
      </>
    ),
  },
  {
    vals: { hold: 1, rest: 2, sold: 3 },
    onSt: ["sold"],
    onEdge: ["sell"],
    msg: (
      <>
        第 4 天,price = 2。卖出 → sold = hold(1) + 2 = <b>3</b>;rest 保持 2。
        最后一天了,该结算。
      </>
    ),
  },
  {
    vals: { hold: 1, rest: 2, sold: 3 },
    onSt: ["sold", "rest"],
    onEdge: [],
    answer: true,
    msg: (
      <>
        收官:最后一天手上不该还留着股票,所以答案 = max(<b>sold 3</b>, rest 2) = <b>3</b>。
        约束(冷冻期)从两状态涨到三状态 —— 这就是状态机 DP:<b>局面越多,状态越多,转移照旧一格格推</b>。
      </>
    ),
  },
];

const BOX = { w: 150, h: 60 };
const POS: Record<St, { x: number; y: number }> = {
  hold: { x: 205, y: 40 },
  rest: { x: 30, y: 215 },
  sold: { x: 380, y: 215 },
};
const ST_NAME: Record<St, string> = { hold: "持有 hold", rest: "空仓 rest", sold: "刚卖 sold" };

function FsmBox({ st, val, on, answer }: { st: St; val: ReactNode; on: boolean; answer: boolean }) {
  const p = POS[st];
  return (
    <g className={`pro-fsm-box${on ? " on" : ""}${answer ? " ans" : ""}`}>
      <rect x={p.x} y={p.y} width={BOX.w} height={BOX.h} rx={14} />
      <text className="pro-fsm-name" x={p.x + BOX.w / 2} y={p.y + 24} textAnchor="middle">
        {ST_NAME[st]}
      </text>
      <text className="pro-fsm-val" x={p.x + BOX.w / 2} y={p.y + 46} textAnchor="middle">
        {val}
      </text>
    </g>
  );
}

export function StockFSM() {
  const stepper = useStepper(FSM_FRAMES.length, 1500);
  const f = FSM_FRAMES[stepper.step];
  const onE = (e: Edge) => (f.onEdge.includes(e) ? " on" : "");

  return (
    <div className="viz">
      <div className="viz-title">LC 309 · 含冷冻期的股票状态机(prices = [1, 2, 3, 0, 2])</div>
      <div className="viz-stage" style={{ overflowX: "auto" }}>
        <svg
          className="pro-fsm-svg"
          viewBox="0 0 560 320"
          role="img"
          aria-label="股票买卖状态转移图"
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
          <text className="pro-fsm-lab" x={160} y={156} textAnchor="middle">买入 −p</text>
          <text className="pro-fsm-lab" x={402} y={156} textAnchor="middle">卖出 +p</text>
          <text className="pro-fsm-lab" x={280} y={250} textAnchor="middle">解冻</text>
          <text className="pro-fsm-lab" x={280} y={12} textAnchor="middle">保持</text>
          <text className="pro-fsm-lab" x={100} y={318} textAnchor="middle">保持</text>

          {(["hold", "rest", "sold"] as St[]).map((st) => (
            <FsmBox key={st} st={st} val={f.vals[st]} on={f.onSt.includes(st)} answer={!!f.answer && st !== "hold"} />
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
  { id: "r", label: "¥3" },
  { id: "rL", label: "¥4", parent: "r" },
  { id: "rR", label: "¥5", parent: "r" },
  { id: "rLL", label: "¥1", parent: "rL" },
  { id: "rLR", label: "¥3", parent: "rL" },
  { id: "rRR", label: "¥1", parent: "rR" },
];

const ALL_DONE: Record<string, TreeNodeState> = {
  r: "done", rL: "done", rR: "done", rLL: "done", rLR: "done", rRR: "done",
};

const TREE_FRAMES: TreeFrame[] = [
  {
    states: {},
    msg: (
      <>
        树上的打家劫舍:偷了父节点就不能偷孩子。答案不在根、而在叶子先算好 ——
        <b>后序遍历,自底向上</b>。每个节点向上汇报一对值 <b>[偷它, 不偷它]</b>。
      </>
    ),
  },
  {
    states: { r: "path", rL: "path", rLL: "cur" },
    msg: (
      <>
        一路下钻到最左叶子 <b>¥1</b>:它没有孩子 → 偷 = 1、不偷 = 0,汇报 <b>[1, 0]</b>。
      </>
    ),
  },
  {
    states: { r: "path", rL: "path", rLL: "done", rLR: "cur" },
    msg: (
      <>
        兄弟叶子 <b>¥3</b> → 汇报 <b>[3, 0]</b>。左子树的两片叶子都算完了。
      </>
    ),
  },
  {
    states: { r: "path", rL: "cur", rLL: "done", rLR: "done" },
    msg: (
      <>
        回到 <b>¥4</b>:偷它 = 4 + 左不偷(0) + 右不偷(0) = <b>4</b>;
        不偷它 = max(1,0) + max(3,0) = <b>4</b>。汇报 [4, 4]。
      </>
    ),
  },
  {
    states: { r: "path", rL: "done", rR: "path", rRR: "cur" },
    msg: (
      <>
        左子树汇报完毕,转向右子树,下钻到叶子 <b>¥1</b> → [1, 0]。
      </>
    ),
  },
  {
    states: { r: "path", rL: "done", rR: "cur", rRR: "done" },
    msg: (
      <>
        回到 <b>¥5</b>:偷它 = 5 + 0 = <b>5</b>;不偷它 = max(1,0) = <b>1</b>。汇报 [5, 1]。
      </>
    ),
  },
  {
    states: { ...ALL_DONE, r: "cur" },
    msg: (
      <>
        两个孩子都汇报了,轮到根 <b>¥3</b>:偷根 = 3 + 左不偷(4) + 右不偷(1) = <b>8</b>;
        不偷根 = max(4,4) + max(5,1) = 4 + 5 = <b>9</b>。
      </>
    ),
  },
  {
    states: { ...ALL_DONE, r: "sol" },
    msg: (
      <>
        答案 = max(偷 8, <b>不偷 9</b>) = <b>9</b>。「不偷根」反而赢 —— 正因为每个节点都把
        「偷/不偷」两种可能都汇报了上来,父亲才不会漏算。这就是 198「选/不选」搬上了树。
      </>
    ),
  },
];

export function RobTreeDP() {
  return (
    <TreePlayer
      title="LC 337 · 树形 DP 后序遍历(自底向上汇报 [偷, 不偷])"
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
      <>
        两端补上虚拟气球(值 1),arr = [1, 3, 1, 5, 8, 1]。
        <b>dp[i][j] = 开区间 (i, j) 内所有气球戳完的最大硬币</b>。当 j − i &lt; 2,
        区间里根本没气球 → dp = <b>0</b>(对角线附近的基例,已填好)。
      </>
    ),
  },
  {
    cells: ivCells({ spanMax: 2, cur: SPAN2 }),
    msg: (
      <>
        <b>先填长度 2 的区间</b>(中间只 1 个气球,它就是「最后戳的」):
        dp[0][2] = 1·3·1 = 3、dp[1][3] = 3·1·5 = 15、dp[2][4] = 1·5·8 = 40、dp[3][5] = 5·8·1 = 40。
        注意这一批格子<b>斜着排</b> —— 同一条对角线 = 同一个区间长度。
      </>
    ),
  },
  {
    cells: ivCells({ spanMax: 3, cur: SPAN3 }),
    msg: (
      <>
        <b>再填长度 3</b>(中间 2 个气球,枚举「最后戳哪个」取 max)。以 dp[1][4] 为例:
        最后戳 k=3 → dp[1][3](15) + 3·5·8(120) + dp[3][4](0) = <b>135</b> 胜出。
        每个长格子都在「查更短区间的现成答案」。
      </>
    ),
  },
  {
    cells: ivCells({ spanMax: 4, cur: SPAN4 }),
    msg: (
      <>
        <b>长度 4</b>:dp[0][4] = 159、dp[1][5] = 159。表越填越往右上角逼近,
        每一步都站在「已经算好的更短区间」肩膀上 —— 这就是「按长度从小到大」的意义。
      </>
    ),
  },
  {
    cells: ivCells({ spanMax: 5, src: [[0, 4], [4, 5]], ok: [0, 5] }),
    msg: (
      <>
        <b>最后一格 dp[0][5]</b> = 整段答案。枚举最后戳的气球 k:k=4(值 8)时
        dp[0][4](<b>159</b>,蓝虚线)+ arr[0]·arr[4]·arr[5](1·8·1=8)+ dp[4][5](0)= <b>167</b> —— 最优!
        「枚举最后戳的那个」让左右两段独立,正是逆向思维的威力。
      </>
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
      title="LC 312 · 区间 DP 斜着填(行 i / 列 j,格中数字 = dp[i][j])"
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
      <div className="viz-title">状压 DP 实验室 —— 点亮「已用过的数字」,看它如何变成一个整数</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 14 }}>
        <div className="pro-lamp-row">
          {NUMS.map((num, i) => (
            <button
              key={num}
              type="button"
              className={`pro-lamp${used[i] ? " on" : ""}`}
              onClick={() => toggle(i)}
              aria-pressed={used[i]}
              aria-label={`数字 ${num},${used[i] ? "已用" : "未用"}`}
            >
              <span className="pro-lamp-bit">bit {i}</span>
              <span className="pro-lamp-num">{num}</span>
              <span className="pro-lamp-state">{used[i] ? "已用 1" : "未用 0"}</span>
            </button>
          ))}
        </div>
        <div className="pro-mask-readout">
          <span>
            mask = <b className="mono">0b{bin}</b> = <b className="mono">{mask}</b>
          </span>
          <span>
            popcount = 已填位置数 = <b>{pos}</b>
          </span>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {full ? (
          <>
            🎉 mask = 0b111 = 7,三个数字全部用完 —— <b>一个完整排列填好了</b>。
            dp[全 1] 累加的就是这样填到底的方案数。
          </>
        ) : (
          <>
            接下来要填<b>位置 {nextPos}</b>。合法的数字(满足 num % {nextPos} == 0 或 {nextPos} % num == 0):
            {legalNext.length ? (
              <b> {legalNext.join("、")}</b>
            ) : (
              <b> 无 —— 这条分支走死了,剪掉</b>
            )}
            。每选一个合法数字,就把它对应的 bit 点亮 → dp[mask | bit] += dp[mask]。
          </>
        )}
      </div>
      <div className="viz-ctl">
        <button type="button" className="btn btn-sm" onClick={() => setUsed(NUMS.map(() => false))}>
          清空重来
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          n = 3 · 优美排列共 3 个
        </span>
      </div>
    </div>
  );
}
