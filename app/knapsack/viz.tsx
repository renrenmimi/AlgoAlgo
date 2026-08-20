"use client";

// 第 8 章 · 背包问题的三个专属可视化:
//  - KnapSackLab:0-1 背包实验室 —— 亲手往容量有限的书包里塞物品,
//    体会「选 / 不选」在容量约束下有多不直观(承接第 7 章打家劫舍实验室)。
//  - RollingCompare:本章最重要的可视化 —— 一维滚动数组的【正序 vs 倒序】对比。
//    同一件物品扫一遍,倒序读到的是「处理本物品之前的值」(物品只用一次),
//    正序读到的是「本轮刚更新过的值」(同一件物品被重复计入)。
//  - TargetSumTree:LC 494 目标和的 ± 决策树(回溯视角),配合正文的「回溯 vs 背包」。
//
// 双语:文案一律用 <T en zh />;组件的文案型 props 传 { en, zh };
// 需要纯字符串的地方(aria-label)用 useL() 解析。

import { useMemo, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import {
  TreePlayer,
  type TreeNodeSpec,
  type TreeFrame,
  type TreeNodeState,
} from "@/lib/algviz";
import { T, useL } from "@/lib/i18n";

/* ============================================================
   KnapSackLab —— 0-1 背包实验室
   ============================================================ */

interface Item {
  w: number;
  v: number;
  emoji: string;
  name: { en: string; zh: string };
}

const LAB_ITEMS: Item[] = [
  { w: 1, v: 1, emoji: "🧦", name: { en: "Socks", zh: "袜子" } },
  { w: 3, v: 4, emoji: "📕", name: { en: "Dictionary", zh: "词典" } },
  { w: 4, v: 5, emoji: "💻", name: { en: "Laptop", zh: "笔记本" } },
  { w: 5, v: 7, emoji: "📷", name: { en: "Camera", zh: "相机" } },
];
const CAP = 7;
const BEST_V = 9; // 词典 + 笔记本(w3+w4=7,v4+5=9)
const BEST_SET = [1, 2];

export function KnapSackLab() {
  const L = useL();
  const [picked, setPicked] = useState<boolean[]>(() =>
    LAB_ITEMS.map(() => false),
  );
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
      <div className="viz-title">
        <T
          en={
            <>
              0/1 knapsack lab — there is one of each item, click to take it or
              leave it (the bag holds {CAP} kg)
            </>
          }
          zh={
            <>
              0-1 背包实验室 —— 每件物品只有一件,点一下决定装不装(书包上限 {CAP} kg)
            </>
          }
        />
      </div>
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
                aria-label={L({
                  en: `${it.name.en}, weight ${it.w} kg, value ${it.v}`,
                  zh: `${it.name.zh},重 ${it.w} kg,价值 ${it.v}`,
                })}
              >
                <span className="kp-item-emoji">{it.emoji}</span>
                <span className="kp-item-name">{L(it.name)}</span>
                <span className="kp-item-stat">
                  <T
                    en={
                      <>
                        {it.w} kg · value {it.v}
                      </>
                    }
                    zh={
                      <>
                        {it.w}kg · 值 {it.v}
                      </>
                    }
                  />
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
            <span>
              <T en={<>total value {value}</>} zh={<>总价值 {value}</>} />
            </span>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {over ? (
          <T
            en={
              <>
                🎒💥 <b>The bag is over its limit</b> ({weight} &gt; {CAP}). The
                capacity limit is what makes this problem hard. Take one item out.
              </>
            }
            zh={
              <>
                🎒💥 <b>背包超重了</b>({weight} &gt; {CAP})—— 容量上限正是这道题的难点,
                先拿掉一件。
              </>
            }
          />
        ) : isBest ? (
          <T
            en={
              <>
                🏆 <b>{value}</b> — that is the best possible (dictionary +
                laptop). Notice what it costs: with those two in the bag, the
                camera, which is worth the most on its own (7), no longer fits.
                Every item competes with the others for the same capacity.
              </>
            }
            zh={
              <>
                🏆 <b>{value}</b> —— 这就是最优解(词典 + 笔记本)。注意它的代价:
                装下这两件之后,单件价值最高的相机(7)就再也塞不进去了 ——
                每件物品都在和其他物品争同一份容量。
              </>
            }
          />
        ) : revealed ? (
          <T
            en={
              <>
                You have <b>{value}</b>. The best is <b>{BEST_V}</b>: dictionary +
                laptop (3 + 4 = 7 kg, 4 + 5 = 9). Taking the highest value per
                unit of weight first picks the camera (7 / 5 = 1.4); after that
                only the socks still fit, for a total of 8. Chapter 6 shows why
                that greedy rule stops being optimal once items cannot be split.
                With four items you can try every combination by hand. With 30 you
                cannot, and that is what the knapsack DP is for.
              </>
            }
            zh={
              <>
                当前 <b>{value}</b>,最优是 <b>{BEST_V}</b>:词典 + 笔记本(3 + 4 = 7 kg,
                4 + 5 = 9)。按「单位重量价值最高」先拿,会先拿相机(7 / 5 = 1.4),
                之后只剩袜子塞得下,总价值只有 8。
                第 6 章讲过:物品不能拆分时,这条贪心规则就不再最优。
                4 件物品你还能手动穷举,30 件就不行了 —— 那正是背包 DP 的用处。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                Current value within the limit: <b>{value}</b>. Think you are at
                the top? Press &quot;Show the best&quot; to compare.
              </>
            }
            zh={
              <>
                当前不超重的价值:<b>{value}</b>。觉得到顶了?点「看最优」对答案。
              </>
            }
          />
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
          <T en="Clear all" zh="清空重来" />
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => setRevealed(true)}
        >
          <T en="Show the best" zh="看最优" />
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => {
            setPicked(LAB_ITEMS.map((_, i) => BEST_SET.includes(i)));
            setRevealed(true);
          }}
        >
          <T en="Pick the best set" zh="一键最优" />
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          <T
            en={
              <>
                capacity {CAP} · best {BEST_V}
              </>
            }
            zh={
              <>
                容量 {CAP} · 最优 {BEST_V}
              </>
            }
          />
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

// 倒序(正确):j 从大到小,读到的永远是「处理本物品之前」的值
function buildBack(): RollFrame[] {
  const dp = Array(RN).fill(0);
  const frames: RollFrame[] = [
    {
      dp: [...dp],
      msg: (
        <T
          en={
            <>
              One item only: weight <b>{RW}</b>, value <b>{RV}</b>. The
              one-dimensional dp[j] is the largest value that fits in capacity j,
              and every cell starts at 0. Transition:{" "}
              <span className="mono">
                dp[j] = max(dp[j], dp[j−{RW}] + {RV})
              </span>
              .
            </>
          }
          zh={
            <>
              只处理一件物品:重 <b>{RW}</b>、值 <b>{RV}</b>。
              一维的 dp[j] = 容量 j 时装得下的最大价值,初值全 0。转移:
              <span className="mono">
                dp[j] = max(dp[j], dp[j−{RW}] + {RV})
              </span>
              。
            </>
          }
        />
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
        <T
          en={
            <>
              dp[{j}]: read dp[{r}] = <b>{dp[r]}</b>. This pass moves from right
              to left, so dp[{r}] has <b>not been touched yet</b> — it is still
              the value from before this item was processed. dp[{j}] = max(
              {oldVal}, {dp[r]}+{RV}) = <b>{dp[j]}</b>. The item is counted{" "}
              <b>once</b> ✓.
            </>
          }
          zh={
            <>
              dp[{j}]:读 dp[{r}] = <b>{dp[r]}</b>。这一轮从右往左走,dp[{r}]{" "}
              <b>还没被碰过</b> —— 它仍是「处理本物品之前」的值。dp[{j}] = max(
              {oldVal}, {dp[r]}+{RV}) = <b>{dp[j]}</b>。物品只被算了<b>一次</b> ✓。
            </>
          }
        />
      ),
    });
  }
  frames.push({
    dp: [...dp],
    done: true,
    msg: (
      <T
        en={
          <>
            ✓ <b>Downward is correct</b>: dp = [{dp.join(", ")}]. Capacity 4 and
            capacity 5 both answer <b>{RV}</b>, because one item can contribute
            its value only once. That is why the one-dimensional 0/1 knapsack runs
            the capacity <b>downward</b>.
          </>
        }
        zh={
          <>
            ✓ <b>倒序正确</b>:dp = [{dp.join(", ")}]。容量 4 和容量 5 的答案都是{" "}
            <b>{RV}</b> —— 一件物品只能贡献一次价值。
            这就是一维 0-1 背包要<b>倒序</b>遍历容量的原因。
          </>
        }
      />
    ),
  });
  return frames;
}

// 正序(错误):j 从小到大,读到的可能是本轮刚更新过的值 → 物品被重复使用
function buildFwd(): RollFrame[] {
  const dp = Array(RN).fill(0);
  const updated = new Set<number>();
  const frames: RollFrame[] = [
    {
      dp: [...dp],
      msg: (
        <T
          en={
            <>
              The same single item (weight <b>{RW}</b>, value <b>{RV}</b>), but
              this time the capacity runs <b>upward</b>: j from small to large.
              Watch each dp[j−{RW}] as it is read: is it still the old value, or
              one this pass has already changed?
            </>
          }
          zh={
            <>
              同一件物品(重 <b>{RW}</b>、值 <b>{RV}</b>),这次容量<b>正序</b>扫:
              j 从小到大。盯住每次读到的 dp[j−{RW}]:它还是旧值,还是本轮已经改过的值?
            </>
          }
        />
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
        <T
          en={
            <>
              ⚠️ dp[{j}]: read dp[{r}] = <b>{dp[r]}</b>, and{" "}
              <b>this pass just set it to {dp[r]}</b> — it <b>already contains</b>{" "}
              one copy of this item. dp[{j}] = max({prev}, {dp[r]}+{RV}) ={" "}
              <b>{dp[j]}</b>, so the same item has now been counted <b>twice</b>{" "}
              ✗.
            </>
          }
          zh={
            <>
              ⚠️ dp[{j}]:读 dp[{r}] = <b>{dp[r]}</b> —— 它<b>本轮刚被改成 {dp[r]}</b>,
              里面<b>已经含一件</b>本物品!dp[{j}] = max({prev}, {dp[r]}+{RV}) ={" "}
              <b>{dp[j]}</b> —— 同一件物品被算了<b>两次</b> ✗。
            </>
          }
        />
      ) : (
        <T
          en={
            <>
              dp[{j}]: read dp[{r}] = <b>{dp[r]}</b> (still the old value) → dp[
              {j}] = max({prev}, {dp[r]}+{RV}) = <b>{dp[j]}</b>. Nothing looks
              wrong yet. Keep going right.
            </>
          }
          zh={
            <>
              dp[{j}]:读 dp[{r}] = <b>{dp[r]}</b>(此刻还是旧值)→ dp[{j}] = max(
              {prev}, {dp[r]}+{RV}) = <b>{dp[j]}</b>。暂时看不出问题,继续往右。
            </>
          }
        />
      ),
    });
  }
  frames.push({
    dp: [...dp],
    done: true,
    bad: [4, 5], // 红色标出被重复计入而算错的格子(应为 3,却成了 6)
    msg: (
      <T
        en={
          <>
            ✗ <b>Upward is wrong here</b>: dp = [{dp.join(", ")}]. The <b>red</b>{" "}
            dp[4] and dp[5] hold <b>6</b>, the value of two items, but there is
            only <b>one</b>. Going up fed dp[2], which already had the item
            inside, back into dp[4], so the item entered the bag <b>twice</b>. The
            0/1 knapsack does not allow that; the correct answer is 3.
          </>
        }
        zh={
          <>
            ✗ <b>正序在这里是错的</b>:dp = [{dp.join(", ")}]。<b>红色</b>的 dp[4]、dp[5]
            是 <b>6</b> —— 两件物品的价值,可我们<b>只有一件</b>。
            正序让「已装了一件」的 dp[2] 又被喂给 dp[4],物品<b>进包两次</b>。
            0-1 背包不允许这样,正确答案是 3。
          </>
        }
      />
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
      <div
        className="viz-stage"
        style={{ flexDirection: "column", gap: 6, overflowX: "auto" }}
      >
        {/* 标签行:写 / 读 + 「旧值 / 已改过」标记 */}
        <div className="kp-roll-row">
          {f.dp.map((_, i) => (
            <div key={i} className="kp-roll-tagcell">
              {f.write === i && (
                <span className="kp-tag write">
                  <T en={<>write dp[{i}]</>} zh={<>写 dp[{i}]</>} />
                </span>
              )}
              {f.read === i && (
                <span className={`kp-tag read${f.dirty ? " dirty" : ""}`}>
                  {f.dirty ? (
                    <T en="read: changed" zh="读:已改过" />
                  ) : (
                    <T en="read: old" zh="读:旧值" />
                  )}
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
  const L = useL();
  const [order, setOrder] = useState<"back" | "fwd">("back");
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en={
            <>
              One-dimensional rolling array: capacity downward (correct) vs upward
              (wrong) — switch to compare
            </>
          }
          zh={<>一维滚动数组:容量倒序(正确) vs 正序(错误)—— 切换看差别</>}
        />
      </div>
      <div
        className="kp-modebar"
        role="tablist"
        aria-label={L({ en: "Capacity loop direction", zh: "容量遍历方向" })}
      >
        <button
          type="button"
          role="tab"
          aria-selected={order === "back"}
          className={`kp-mode-btn${order === "back" ? " on" : ""}`}
          onClick={() => setOrder("back")}
        >
          <T en="← Downward (correct for 0/1)" zh="← 倒序(0-1 背包正解)" />
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={order === "fwd"}
          className={`kp-mode-btn${order === "fwd" ? " on" : ""}`}
          onClick={() => setOrder("fwd")}
        >
          <T en="→ Upward (wrong answer)" zh="→ 正序(会出错)" />
        </button>
      </div>
      {/* key 切换时重挂载,播放进度归零 */}
      <RollPlayer
        key={order}
        frames={order === "back" ? BACK_FRAMES : FWD_FRAMES}
      />
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

const LEAVES = [
  "rppp",
  "rppm",
  "rpmp",
  "rpmm",
  "rmpp",
  "rmpm",
  "rmmp",
  "rmmm",
];
const SOL_LEAVES = ["rppm", "rpmp", "rmpp"]; // 累计和 == target(1)
const INNER = ["r", "rp", "rpp", "rpm", "rm", "rmp", "rmm"];

const TS_FRAMES: TreeFrame[] = [
  {
    states: { r: "cur" },
    msg: (
      <T
        en={
          <>
            nums = [1, 1, 1], target = <b>1</b>. Give each number a + or a − (
            <b>left branch is +, right branch is −</b>) and start from a running
            sum of 0.
          </>
        }
        zh={
          <>
            nums = [1, 1, 1],target = <b>1</b>。给每个数挑 + 或 −(
            <b>左枝 +,右枝 −</b>),从累计和 0 出发。
          </>
        }
      />
    ),
  },
  {
    states: { r: "path", rp: "done", rm: "done" },
    msg: (
      <T
        en={
          <>
            First 1: choosing + gives a sum of 1, choosing − gives −1.{" "}
            <b>Every number splits the tree once.</b>
          </>
        }
        zh={
          <>
            第一个 1:选 + → 和 = 1,选 − → 和 = −1。<b>每个数都让树分一次叉。</b>
          </>
        }
      />
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
    msg: (
      <T
        en={<>After the second 1: 2² = 4 states.</>}
        zh={<>第二个 1 分完:2² = 4 种局面。</>}
      />
    ),
  },
  {
    states: {
      ...Object.fromEntries(INNER.map((id) => [id, "done" as TreeNodeState])),
      ...Object.fromEntries(LEAVES.map((id) => [id, "done" as TreeNodeState])),
    },
    msg: (
      <T
        en={
          <>
            After the third 1: <b>2³ = 8</b> complete paths. That is all the work
            backtracking has to do.
          </>
        }
        zh={
          <>
            第三个 1 分完:<b>2³ = 8</b> 条到底的路径 —— 这就是回溯要走的全部工作量。
          </>
        }
      />
    ),
  },
  {
    states: {
      ...Object.fromEntries(INNER.map((id) => [id, "done" as TreeNodeState])),
      ...Object.fromEntries(
        LEAVES.map((id) => [
          id,
          (SOL_LEAVES.includes(id) ? "sol" : "dead") as TreeNodeState,
        ]),
      ),
    },
    msg: (
      <T
        en={
          <>
            Only <b>3</b> paths end at 1 ✓ (++−, +−+, −++), so the answer is{" "}
            <b>3</b>. But with 20 numbers this tree has 2²⁰ ≈ one million leaves.
            So the tree gets <b>rewritten as a knapsack count</b>, which replaces
            the 2ⁿ paths with a table of about n × P cells.
          </>
        }
        zh={
          <>
            只有 <b>3</b> 条路径的终点和 = 1 ✓(++−、+−+、−++),所以答案是 <b>3</b>。
            但 nums 有 20 个数时,这棵树有 2²⁰ ≈ 100 万片叶子。
            于是我们把它<b>改写成背包计数</b>,用一张约 n × P 格的表代替 2ⁿ 条路径。
          </>
        }
      />
    ),
  },
];

export function TargetSumTree() {
  return (
    <TreePlayer
      title={{
        en: "LC 494 · the ± decision tree (nums = [1,1,1], target = 1) — the exponential work backtracking does",
        zh: "LC 494 · ± 决策树(nums = [1,1,1],target = 1)—— 回溯的指数级工作量",
      }}
      nodes={TS_NODES}
      frames={TS_FRAMES}
      nodeW={44}
      gapX={12}
    />
  );
}
