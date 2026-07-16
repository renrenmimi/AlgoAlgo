"use client";

// 第 9 章 · 子序列 DP 的专属可视化:
//  - SubseqLab:子序列 vs 子数组 交互实验室 —— 亲手选字符,看「保持顺序即可」
//    与「必须连续」两条规则的区别。这个区别决定了后面所有状态怎么定义。
//  - LisPlayer:LIS 的 O(n²) 递推动画 —— nums 与 dp 两行联动,高亮「以 i 结尾」
//    如何回头去接那个「最优前驱」。自建两行播放器,复用 lib/stepper 的控制条。
//
//  (双序列二维表 718 / 1143 / 72 用共享库 DPTable,帧在 page.tsx 里生成;
//   耐心排序 tails、回文中心扩展用共享库 ArrayStepper。)

import { useMemo, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================= SubseqLab · 子序列 vs 子数组 ================= */

const SUB_STR = "ABCDE";

export function SubseqLab() {
  const [picked, setPicked] = useState<boolean[]>(() =>
    SUB_STR.split("").map(() => false),
  );

  const idxs = useMemo(
    () => picked.map((p, i) => (p ? i : -1)).filter((i) => i >= 0),
    [picked],
  );
  const letters = idxs.map((i) => SUB_STR[i]).join("");
  const contiguous =
    idxs.length > 0 && idxs[idxs.length - 1] - idxs[0] + 1 === idxs.length;

  const toggle = (i: number) =>
    setPicked((p) => p.map((v, j) => (j === i ? !v : v)));

  return (
    <div className="viz">
      <div className="viz-title">
        子序列 vs 子数组实验室 —— 点亮几个字符,看它算哪一种
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 10 }}>
        <div className="seq-toks">
          {SUB_STR.split("").map((ch, i) => {
            const on = picked[i];
            const cls = `cell${on ? (contiguous ? " ok" : " lit") : ""}`;
            return (
              <button
                key={i}
                type="button"
                className={cls}
                style={{ width: 56, height: 56, cursor: "pointer" }}
                onClick={() => toggle(i)}
                aria-pressed={on}
                aria-label={`第 ${i} 个字符 ${ch}`}
              >
                {ch}
                <span className="cell-idx">{i}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {idxs.length === 0 ? (
          <>点几个字符看看 —— 它们组成的「{"选中串"}」既是子序列,又可能是子数组。</>
        ) : (
          <>
            选中「<b>{letters}</b>」(下标 {idxs.join(", ")}):
            <br />
            子序列(subsequence)<b style={{ color: "var(--acc-ink)" }}>✓ 永远合法</b> ——
            只要没打乱原来的先后顺序就行,中间隔多远都无所谓;
            <br />
            子数组 / 子串(subarray){" "}
            {contiguous ? (
              <b style={{ color: "var(--ok)" }}>✓ 也成立</b>
            ) : (
              <b style={{ color: "var(--risk)" }}>✗ 不成立</b>
            )}{" "}
            —— 它要求下标<b>连续</b>
            {contiguous ? "(你选的正好连着)" : "(你选的中间有窟窿)"}。
          </>
        )}
      </div>
      <div className="viz-ctl">
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setPicked(SUB_STR.split("").map(() => false))}
        >
          清空
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setPicked([true, false, true, false, true])}
        >
          选 A_C_E(只是子序列)
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => setPicked([false, true, true, true, false])}
        >
          选 BCD(连续 = 子数组)
        </button>
        <span
          className="mono dim"
          style={{ marginLeft: "auto", fontSize: 12 }}
        >
          绿 = 也是子数组 · 琥珀 = 仅子序列
        </span>
      </div>
    </div>
  );
}

/* ================= LisPlayer · LIS 的 O(n²) 递推动画 ================= */

const LIS_NUMS = [1, 3, 2, 4, 5];
const LIS_DP = [1, 2, 2, 3, 4];

interface LisFrame {
  /** 正在计算的下标,null = 开场/收尾 */
  i: number | null;
  /** 合法前驱(nums[j] < nums[i])的下标集合 */
  preds: number[];
  /** 已填好 dp 的最大下标(-1 = 还没开始填) */
  dpUpto: number;
  /** 收尾时高亮的一条最长上升子序列 */
  chain?: number[];
  msg: ReactNode;
}

const LIS_FRAMES: LisFrame[] = [
  {
    i: null,
    preds: [],
    dpUpto: -1,
    msg: (
      <>
        状态:<b>dp[i] = 以 nums[i] 结尾的最长上升子序列长度</b>。
        为什么强调「以 i 结尾」?因为这样每个子问题都有一个明确的「末尾」,
        才能谈「谁能接在谁后面」。每格起步至少是 <b>1</b>(自己单独成一段)。
      </>
    ),
  },
  {
    i: 0,
    preds: [],
    dpUpto: 0,
    msg: (
      <>
        dp[0]:1 前面空无一物,没有更小的数可接 → 只有它自己,dp[0] = <b>1</b>。
      </>
    ),
  },
  {
    i: 1,
    preds: [0],
    dpUpto: 1,
    msg: (
      <>
        dp[1]:nums[1] = 3。往左找结尾比 3 小的:nums[0] = 1 &lt; 3 ✓ ——
        接在它的 dp[0] = 1 后面 → dp[1] = 1 + 1 = <b>2</b>(子序列 1,3)。
      </>
    ),
  },
  {
    i: 2,
    preds: [0],
    dpUpto: 2,
    msg: (
      <>
        dp[2]:nums[2] = 2。左边比 2 小的只有 nums[0] = 1(nums[1] = 3 太大,接不上)——
        dp[2] = dp[0] + 1 = <b>2</b>(子序列 1,2)。长度和 dp[1] 一样,但结尾更小,后劲更足。
      </>
    ),
  },
  {
    i: 3,
    preds: [0, 1, 2],
    dpUpto: 3,
    msg: (
      <>
        dp[3]:nums[3] = 4。左边 1、3、2 全 &lt; 4,<b>三个都能接</b> ——
        当然挑 dp 最大的那个(dp[1] = dp[2] = 2)→ dp[3] = 2 + 1 = <b>3</b>。
        「回头挑最优前驱」正是 O(n²) 的那层内循环在干的事。
      </>
    ),
  },
  {
    i: 4,
    preds: [0, 1, 2, 3],
    dpUpto: 4,
    msg: (
      <>
        dp[4]:nums[4] = 5,左边全部比它小,最优前驱是 dp[3] = 3 →
        dp[4] = 3 + 1 = <b>4</b>。
      </>
    ),
  },
  {
    i: null,
    preds: [],
    dpUpto: 4,
    chain: [0, 1, 3, 4],
    msg: (
      <>
        答案 = dp 数组的<b>最大值 4</b>,不是最后一格!(只有「以最大数结尾」时答案才恰好在末尾。)
        沿最优前驱回溯,得到一条最长上升子序列 [1, 3, 4, 5]。
        每格都要回头扫一遍左侧 → <b>O(n²)</b>。
      </>
    ),
  },
];

export function LisPlayer() {
  const stepper = useStepper(LIS_FRAMES.length, 1500);
  const f = LIS_FRAMES[stepper.step];
  const n = LIS_NUMS.length;

  const numState = (i: number): string => {
    if (f.chain?.includes(i)) return "ok";
    if (f.i === i) return "lit";
    if (f.preds.includes(i)) return "seq-pred";
    return "";
  };

  return (
    <div className="viz">
      <div className="viz-title">
        LC 300 · 以 i 结尾的 LIS 逐格递推(nums = [1, 3, 2, 4, 5])
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 4 }}>
        <div className="seq-lis">
          {/* 指针行 */}
          <div
            className="seq-lis-cells"
            style={{ gridTemplateColumns: `repeat(${n}, 56px)`, minHeight: 24 }}
          >
            {LIS_NUMS.map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                }}
              >
                {f.i === i && <span className="ptr">i</span>}
              </div>
            ))}
          </div>
          {/* nums 行 */}
          <div className="seq-lis-row">
            <span className="seq-lis-tag">nums</span>
            <div
              className="seq-lis-cells"
              style={{ gridTemplateColumns: `repeat(${n}, 56px)` }}
            >
              {LIS_NUMS.map((v, i) => {
                const s = numState(i);
                return (
                  <div
                    key={i}
                    className={`cell${s ? ` ${s}` : ""}`}
                    style={{ width: 56, height: 56 }}
                  >
                    {v}
                    <span className="cell-idx">{i}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* dp 行 */}
          <div className="seq-lis-row" style={{ marginTop: 8 }}>
            <span className="seq-lis-tag">dp</span>
            <div
              className="seq-lis-cells"
              style={{ gridTemplateColumns: `repeat(${n}, 56px)` }}
            >
              {LIS_DP.map((v, i) => {
                const filled = i <= f.dpUpto;
                const isMax = !!f.chain && i === 4;
                let cls = "cell";
                if (isMax) cls += " ok";
                else if (f.i === i) cls += " lit";
                else if (!filled) cls += " ghost";
                return (
                  <div key={i} className={cls} style={{ width: 56, height: 56 }}>
                    {filled ? v : "?"}
                    <span className="cell-idx">{i}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={LIS_FRAMES.length} />
    </div>
  );
}
