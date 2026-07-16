"use client";

// 第 8 章 · 背包问题的三个专属可视化:
//  - KnapSackLab:0-1 背包实验室 —— 亲手往容量有限的书包里塞物品,
//    体会「选 / 不选」在容量约束下有多不直观(承接第 7 章打家劫舍实验室)。
//  - RollingCompare:本章最重要的可视化 —— 一维滚动数组的【正序 vs 倒序】对比。
//    同一件物品扫一遍,倒序读到的是「上一轮的旧值」(干净,物品只用一次),
//    正序读到的是「本轮刚更新的脏值」(同一件物品被重复计入)。
//  - TargetSumTree:LC 494 目标和的 ± 决策树(回溯视角),配合正文的「回溯 vs 背包」。

import { useMemo, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { TreePlayer, type TreeNodeSpec, type TreeFrame, type TreeNodeState } from "@/lib/algviz";

/* ============================================================
   KnapSackLab —— 0-1 背包实验室
   ============================================================ */

interface Item {
  w: number;
  v: number;
  emoji: string;
  name: string;
}

const LAB_ITEMS: Item[] = [
  { w: 1, v: 1, emoji: "🧦", name: "袜子" },
  { w: 3, v: 4, emoji: "📕", name: "词典" },
  { w: 4, v: 5, emoji: "💻", name: "笔记本" },
  { w: 5, v: 7, emoji: "📷", name: "相机" },
];
const CAP = 7;
const BEST_V = 9; // 词典 + 笔记本(w3+w4=7,v4+5=9)
const BEST_SET = [1, 2];

export function KnapSackLab() {
  const [picked, setPicked] = useState<boolean[]>(() => LAB_ITEMS.map(() => false));
  const [revealed, setRevealed] = useState(false);

  const weight = useMemo(
    () => LAB_ITEMS.reduce((s, it, i) => s + (picked[i] ? it.w : 0), 0),
    [picked],
  );
  const value = useMemo(
    () => LAB_ITEMS.reduce((s, it, i) => s + (picked[i] ? it.v : 0), 0),
    [picked],
  );

  const over = weight > CAP;
  const isBest = !over && value === BEST_V;

  const toggle = (i: number) => {
    setRevealed(false);
    setPicked((p) => p.map((v, j) => (j === i ? !v : v)));
  };

  return (
    <div className="viz">
      <div className="viz-title">0-1 背包实验室 —— 每件物品只有一件,点一下决定装不装(书包上限 {CAP} kg)</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 14 }}>
        <div className="kp-lab-grid">
          {LAB_ITEMS.map((it, i) => {
            const on = picked[i];
            return (
              <button
                key={i}
                type="button"
                className={`kp-item${on ? " on" : ""}`}
                onClick={() => toggle(i)}
                aria-pressed={on}
                aria-label={`${it.name},重 ${it.w}kg,值 ${it.v}`}
              >
                <span className="kp-item-emoji">{it.emoji}</span>
                <span className="kp-item-name">{it.name}</span>
                <span className="kp-item-stat">
                  {it.w}kg · 值{it.v}
                </span>
              </button>
            );
          })}
        </div>
        <div className="kp-gauge">
          <div className="kp-gauge-bar">
            <div
              className={`kp-gauge-fill${over ? " over" : ""}`}
              style={{ width: `${Math.min(100, (weight / CAP) * 100)}%` }}
            />
          </div>
          <div className="kp-gauge-nums mono">
            <span className={over ? "kp-over" : ""}>
              {weight} / {CAP} kg
            </span>
            <span>总价值 {value}</span>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {over ? (
          <>
            🎒💥 <b>背包撑爆了</b>({weight} &gt; {CAP})—— 容量约束是背包问题的灵魂,先扔掉一件。
          </>
        ) : isBest ? (
          <>
            🏆 <b>{value}</b> —— 最优解(词典 + 笔记本)!注意代价:装下这两件之后,
            价值最高的相机(值 7)就再也塞不进去了 —— 每件物品都在和别人抢容量。
          </>
        ) : revealed ? (
          <>
            当前 <b>{value}</b>,最优是 <b>{BEST_V}</b>(装词典 + 笔记本:w3+w4=7,v4+5=9)。
            贪心「先拿性价比 / 价值最高的」在这里未必最优 —— 4 件物品你能手试,
            30 件呢?这种「容量内的最优组合」正是背包 DP 的主场。
          </>
        ) : (
          <>
            当前合法价值:<b>{value}</b>。觉得到顶了?点「看最优」对答案。
          </>
        )}
      </div>
      <div className="viz-ctl">
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => {
            setPicked(LAB_ITEMS.map(() => false));
            setRevealed(false);
          }}
        >
          清空重来
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => setRevealed(true)}>
          看最优
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => {
            setPicked(LAB_ITEMS.map((_, i) => BEST_SET.includes(i)));
            setRevealed(true);
          }}
        >
          一键最优
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          容量 {CAP} · 最优 {BEST_V}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   RollingCompare —— 一维滚动:正序 vs 倒序(本章招牌)
   ============================================================ */

interface RollFrame {
  dp: number[];
  write?: number; // 正在写入的格子 j
  read?: number; // 转移读取的格子 j - w
  dirty?: boolean; // read 格子是否「本轮已被更新」
  msg: ReactNode;
  done?: boolean; // 收尾帧:无 bad 时全部标绿(ok);有 bad 时只标出算错的格子
  bad?: number[]; // 收尾帧里因重复计入而算错的格子(正序演示专用)
}

const RW = 2; // 物品重量
const RV = 3; // 物品价值
const RN = 6; // dp 数组长度(容量 0..5)

// 倒序(正确):j 从大到小,读到的永远是上一轮旧值
function buildBack(): RollFrame[] {
  const dp = Array(RN).fill(0);
  const frames: RollFrame[] = [
    {
      dp: [...dp],
      msg: (
        <>
          只处理一件物品:重 <b>{RW}</b>、值 <b>{RV}</b>。一维数组 dp[j] = 容量 j 时的最大价值,
          初值全 0。转移:<span className="mono">dp[j] = max(dp[j], dp[j−{RW}] + {RV})</span>。
        </>
      ),
    },
  ];
  for (let j = RN - 1; j >= RW; j--) {
    const r = j - RW;
    const oldVal = dp[j];
    const cand = dp[r] + RV;
    dp[j] = Math.max(oldVal, cand);
    frames.push({
      dp: [...dp],
      write: j,
      read: r,
      dirty: false,
      msg: (
        <>
          dp[{j}]:读 dp[{r}] = <b>{dp[r]}</b> —— 它还是<b>上一轮的旧值</b>(这一轮从右往左,
          还没碰过它)。dp[{j}] = max({oldVal}, {dp[r]}+{RV}) = <b>{dp[j]}</b>。
          物品只被算了<b>一次</b> ✓。
        </>
      ),
    });
  }
  frames.push({
    dp: [...dp],
    done: true,
    msg: (
      <>
        ✓ <b>倒序正确</b>:dp = [{dp.join(", ")}]。容量 4、5 的答案都是 <b>{RV}</b> ——
        一件物品最多贡献一次价值。这就是 0-1 背包一维数组<b>必须倒序</b>的原因。
      </>
    ),
  });
  return frames;
}

// 正序(错误):j 从小到大,读到的可能是本轮刚更新过的脏值 → 物品被重复使用
function buildFwd(): RollFrame[] {
  const dp = Array(RN).fill(0);
  const updated = new Set<number>();
  const frames: RollFrame[] = [
    {
      dp: [...dp],
      msg: (
        <>
          同一件物品(重 <b>{RW}</b>、值 <b>{RV}</b>),这次故意<b>正序</b>扫:j 从小到大。
          盯住每次读取的 dp[j−{RW}] 是「旧值」还是「本轮刚改过的脏值」。
        </>
      ),
    },
  ];
  for (let j = RW; j < RN; j++) {
    const r = j - RW;
    const dirty = updated.has(r);
    const cand = dp[r] + RV;
    const prev = dp[j];
    dp[j] = Math.max(dp[j], cand);
    updated.add(j);
    frames.push({
      dp: [...dp],
      write: j,
      read: r,
      dirty,
      msg: dirty ? (
        <>
          ⚠️ dp[{j}]:读 dp[{r}] = <b>{dp[r]}</b> —— 它<b>本轮刚被改成 {dp[r]}</b>(脏值,里面
          <b>已经含一件</b>本物品)!dp[{j}] = max({prev}, {dp[r]}+{RV}) = <b>{dp[j]}</b> ——
          同一件物品被算了<b>两次</b> ✗。
        </>
      ) : (
        <>
          dp[{j}]:读 dp[{r}] = <b>{dp[r]}</b>(此刻还是旧值)→ dp[{j}] = max({prev}, {dp[r]}+{RV}) ={" "}
          <b>{dp[j]}</b>。暂时看不出问题,继续往右。
        </>
      ),
    });
  }
  frames.push({
    dp: [...dp],
    done: true,
    bad: [4, 5], // 红色标出被重复计入而算错的格子(应为 3,却成了 6)
    msg: (
      <>
        ✗ <b>正序出错</b>:dp = [{dp.join(", ")}]。<b>红色</b>的 dp[4]、dp[5] 竟是 <b>6</b> ={" "}
        两件物品的价值,可我们<b>只有一件</b>!正序让 dp[2] 的「装了一件」结果又喂给了 dp[4],
        物品被<b>重复放进</b>背包 —— 0-1 背包禁止这样(正确答案应是 3)。
      </>
    ),
  });
  return frames;
}

const BACK_FRAMES = buildBack();
const FWD_FRAMES = buildFwd();

function RollPlayer({ frames }: { frames: RollFrame[] }) {
  const stepper = useStepper(frames.length, 1300);
  const f = frames[stepper.step];
  return (
    <>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 6, overflowX: "auto" }}>
        {/* 标签行:▼写 / ▲读 + 脏净标记 */}
        <div className="kp-roll-row">
          {f.dp.map((_, i) => (
            <div key={i} className="kp-roll-tagcell">
              {f.write === i && <span className="kp-tag write">写 dp[{i}]</span>}
              {f.read === i && (
                <span className={`kp-tag read${f.dirty ? " dirty" : ""}`}>
                  读 {f.dirty ? "脏值" : "旧值"}
                </span>
              )}
            </div>
          ))}
        </div>
        {/* dp 单元格行 */}
        <div className="kp-roll-row" style={{ paddingBottom: 26 }}>
          {f.dp.map((v, i) => {
            let cls = "cell";
            if (f.done) {
              // 收尾帧:正序演示用 bad 标出算错的格子,其余保持中性;倒序正解全部标绿
              if (f.bad?.includes(i)) cls += " bad";
              else if (!f.bad) cls += " ok";
            } else if (f.write === i) cls += " lit";
            const isRead = f.read === i;
            return (
              <div
                key={i}
                className={`${cls}${isRead ? ` kp-read${f.dirty ? " dirty" : ""}` : ""}`}
                style={{ width: 48, height: 48 }}
              >
                {v}
                <span className="cell-idx">{i}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </>
  );
}

export function RollingCompare() {
  const [order, setOrder] = useState<"back" | "fwd">("back");
  return (
    <div className="viz">
      <div className="viz-title">一维滚动数组:倒序(正确) vs 正序(错误)—— 切换看差别</div>
      <div className="kp-modebar" role="tablist" aria-label="遍历方向">
        <button
          type="button"
          role="tab"
          aria-selected={order === "back"}
          className={`kp-mode-btn${order === "back" ? " on" : ""}`}
          onClick={() => setOrder("back")}
        >
          ← 倒序(0-1 背包正解)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={order === "fwd"}
          className={`kp-mode-btn${order === "fwd" ? " on" : ""}`}
          onClick={() => setOrder("fwd")}
        >
          → 正序(会出错)
        </button>
      </div>
      {/* key 切换时重挂载,播放进度归零 */}
      <RollPlayer key={order} frames={order === "back" ? BACK_FRAMES : FWD_FRAMES} />
    </div>
  );
}

/* ============================================================
   TargetSumTree —— LC 494 目标和的 ± 决策树(回溯视角)
   ============================================================ */

// 三个 1,给每个挑 + 或 −;左枝 = +,右枝 = −。节点标签 = 当前累计和。
const TS_NODES: TreeNodeSpec[] = [
  { id: "r", label: "0" },
  { id: "rp", label: "1", parent: "r" },
  { id: "rpp", label: "2", parent: "rp" },
  { id: "rppp", label: "3", parent: "rpp" },
  { id: "rppm", label: "1", parent: "rpp" },
  { id: "rpm", label: "0", parent: "rp" },
  { id: "rpmp", label: "1", parent: "rpm" },
  { id: "rpmm", label: "−1", parent: "rpm" },
  { id: "rm", label: "−1", parent: "r" },
  { id: "rmp", label: "0", parent: "rm" },
  { id: "rmpp", label: "1", parent: "rmp" },
  { id: "rmpm", label: "−1", parent: "rmp" },
  { id: "rmm", label: "−2", parent: "rm" },
  { id: "rmmp", label: "−1", parent: "rmm" },
  { id: "rmmm", label: "−3", parent: "rmm" },
];

const LEAVES = ["rppp", "rppm", "rpmp", "rpmm", "rmpp", "rmpm", "rmmp", "rmmm"];
const SOL_LEAVES = ["rppm", "rpmp", "rmpp"]; // 累计和 == target(1)
const INNER = ["r", "rp", "rpp", "rpm", "rm", "rmp", "rmm"];

const TS_FRAMES: TreeFrame[] = [
  {
    states: { r: "cur" },
    msg: (
      <>
        nums = [1, 1, 1],target = <b>1</b>。给每个数挑 + 或 −(<b>左枝 +,右枝 −</b>),
        从累计和 0 出发。
      </>
    ),
  },
  {
    states: { r: "path", rp: "done", rm: "done" },
    msg: (
      <>
        第一个 1:选 + → 和 = 1,选 − → 和 = −1。<b>每个数都让树分一次叉</b>。
      </>
    ),
  },
  {
    states: {
      r: "path",
      rp: "path",
      rm: "path",
      rpp: "done",
      rpm: "done",
      rmp: "done",
      rmm: "done",
    },
    msg: <>第二个 1 分完:2² = 4 种局面。</>,
  },
  {
    states: {
      ...Object.fromEntries(INNER.map((id) => [id, "done" as TreeNodeState])),
      ...Object.fromEntries(LEAVES.map((id) => [id, "done" as TreeNodeState])),
    },
    msg: (
      <>
        第三个 1 分完:<b>2³ = 8 条</b>到底的路径 —— 这就是回溯要走的全部工作量。
      </>
    ),
  },
  {
    states: {
      ...Object.fromEntries(INNER.map((id) => [id, "done" as TreeNodeState])),
      ...Object.fromEntries(
        LEAVES.map((id) => [id, (SOL_LEAVES.includes(id) ? "sol" : "dead") as TreeNodeState]),
      ),
    },
    msg: (
      <>
        只有 <b>3 条</b>路径的终点和 = 1 ✓(++−、+−+、−++)—— 答案 <b>3</b>。
        可当 nums 有 20 个数,这棵树有 2²⁰ ≈ 100 万片叶子。于是我们把它<b>翻译成背包记账</b>,
        指数变多项式。
      </>
    ),
  },
];

export function TargetSumTree() {
  return (
    <TreePlayer
      title="LC 494 · ± 决策树(nums = [1,1,1],target = 1)—— 回溯的指数级工作量"
      nodes={TS_NODES}
      frames={TS_FRAMES}
      nodeW={44}
      gapX={12}
    />
  );
}
