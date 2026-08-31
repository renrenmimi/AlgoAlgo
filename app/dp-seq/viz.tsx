"use client";

// Chapter 9 - the visualizations that belong to the subsequence DP chapter:
//  - SubseqLab: the subsequence vs. subarray lab - pick characters by hand and compare "order is enough"
//    against "must be contiguous". That difference drives how every state below is defined.
//  - LisPlayer: the O(n^2) bottom-up LIS animation - the nums and dp rows move together, highlighting how "ending at i"
//    reaches back for the best predecessor. A custom two-row player reusing the control bar from lib/stepper.
//
//  (The two-sequence 2-D tables 718 / 1143 / 72 use the shared DPTable, with frames generated in page.tsx;
//   the patience-sorting tails and the palindrome center expansion use the shared ArrayStepper.)
//
// Bilingual: narration uses <T en zh />; string props such as aria-label resolve { en, zh } through useL().

import { useMemo, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { T, useL } from "@/lib/i18n";

/* ================= SubseqLab - subsequence vs. subarray ================= */

const SUB_STR = "ABCDE";

export function SubseqLab() {
  const L = useL();
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
        <T
          en="Subsequence or subarray: pick some characters and see which one you get"
          zh="子序列还是子数组:点亮几个字符,看它算哪一种"
        />
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
                aria-label={L({
                  en: `Character ${ch} at index ${i}`,
                  zh: `第 ${i} 个字符 ${ch}`,
                })}
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
          <T
            en={
              <>
                Pick a few characters. Whatever you pick is always a subsequence.
                It is a subarray only when the indexes you picked are next to each
                other.
              </>
            }
            zh={
              <>
                随便点几个字符。不管怎么点,选出来的都是子序列;
                只有当选中的下标彼此相邻时,它才同时是子数组。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                You picked <b>{letters}</b> (indexes {idxs.join(", ")}):
                <br />
                subsequence{" "}
                <b style={{ color: "var(--acc-ink)" }}>✓ always valid</b> — the
                characters keep their original order, and the gaps between them do
                not matter;
                <br />
                subarray or substring{" "}
                {contiguous ? (
                  <b style={{ color: "var(--ok)" }}>✓ also valid</b>
                ) : (
                  <b style={{ color: "var(--risk)" }}>✗ not valid</b>
                )}{" "}
                — this one needs the indexes to be <b>contiguous</b>
                {contiguous
                  ? " (yours have no gap)."
                  : " (yours have a gap in the middle)."}
              </>
            }
            zh={
              <>
                你选中了 <b>{letters}</b>(下标 {idxs.join(", ")}):
                <br />
                子序列(subsequence){" "}
                <b style={{ color: "var(--acc-ink)" }}>✓ 永远成立</b> ——
                这些字符保持着原来的先后顺序,中间隔多远都不影响;
                <br />
                子数组 / 子串(subarray){" "}
                {contiguous ? (
                  <b style={{ color: "var(--ok)" }}>✓ 同时成立</b>
                ) : (
                  <b style={{ color: "var(--risk)" }}>✗ 不成立</b>
                )}{" "}
                —— 它要求下标<b>连续</b>
                {contiguous ? "(你选的正好挨着)。" : "(你选的中间有缺口)。"}
              </>
            }
          />
        )}
      </div>
      <div className="viz-ctl">
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setPicked(SUB_STR.split("").map(() => false))}
        >
          <T en="Clear" zh="清空" />
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setPicked([true, false, true, false, true])}
        >
          <T en="Pick ACE · subsequence only" zh="选 ACE · 只是子序列" />
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => setPicked([false, true, true, true, false])}
        >
          <T en="Pick BCD · also a subarray" zh="选 BCD · 同时是子数组" />
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          <T
            en="green = also a subarray · amber = subsequence only"
            zh="绿 = 同时是子数组 · 琥珀 = 仅子序列"
          />
        </span>
      </div>
    </div>
  );
}

/* ================= LisPlayer - the O(n^2) bottom-up LIS animation ================= */

const LIS_NUMS = [1, 3, 2, 4, 5];
const LIS_DP = [1, 2, 2, 3, 4];

interface LisFrame {
  /** the index being computed; null = opening/closing frame */
  i: number | null;
  /** the set of indices that are valid predecessors (nums[j] < nums[i]) */
  preds: number[];
  /** the largest index whose dp value is already filled in (-1 = nothing filled yet) */
  dpUpto: number;
  /** one longest increasing subsequence, highlighted in the closing frame */
  chain?: number[];
  msg: ReactNode;
}

const LIS_FRAMES: LisFrame[] = [
  {
    i: null,
    preds: [],
    dpUpto: -1,
    msg: (
      <T
        en={
          <>
            State first: <b>dp[i] is the length of the longest increasing
            subsequence that ends at index i</b>. The words &quot;ends at i&quot;
            are what make this work: once the last element is fixed, you can ask
            whether one subsequence may be extended by another element. Every cell
            starts at <b>1</b>, because the element on its own is already a
            subsequence of length 1.
          </>
        }
        zh={
          <>
            先立状态:<b>dp[i] = 以下标 i 结尾的最长上升子序列长度</b>。
            「以 i 结尾」这几个字是关键:末尾元素一旦固定,
            才能问「某条子序列能不能再接上一个元素」。
            每一格都从 <b>1</b> 起步 —— 单个元素本身就是长度 1 的子序列。
          </>
        }
      />
    ),
  },
  {
    i: 0,
    preds: [],
    dpUpto: 0,
    msg: (
      <T
        en={
          <>
            dp[0]: nothing sits to the left of 1, so there is no smaller value to
            build on. The subsequence is 1 by itself, and dp[0] = <b>1</b>.
          </>
        }
        zh={
          <>
            dp[0]:1 的左边什么都没有,没有更小的数可以接。
            子序列只有它自己,dp[0] = <b>1</b>。
          </>
        }
      />
    ),
  },
  {
    i: 1,
    preds: [0],
    dpUpto: 1,
    msg: (
      <T
        en={
          <>
            dp[1]: nums[1] = 3. Look left for values smaller than 3. nums[0] = 1 is
            one, so 3 can be appended to the subsequence that ends at index 0:
            dp[1] = dp[0] + 1 = <b>2</b>, which is [1, 3].
          </>
        }
        zh={
          <>
            dp[1]:nums[1] = 3。往左找比 3 小的数,nums[0] = 1 符合,
            所以 3 可以接在「以下标 0 结尾」的那条后面:
            dp[1] = dp[0] + 1 = <b>2</b>,也就是 [1, 3]。
          </>
        }
      />
    ),
  },
  {
    i: 2,
    preds: [0],
    dpUpto: 2,
    msg: (
      <T
        en={
          <>
            dp[2]: nums[2] = 2. Only nums[0] = 1 is smaller; nums[1] = 3 is too
            large to come before it. So dp[2] = dp[0] + 1 = <b>2</b>, which is
            [1, 2]. Same length as dp[1], but this one ends at a smaller value, so
            more elements can still be appended to it later.
          </>
        }
        zh={
          <>
            dp[2]:nums[2] = 2。左边只有 nums[0] = 1 比它小,nums[1] = 3 太大接不上。
            所以 dp[2] = dp[0] + 1 = <b>2</b>,也就是 [1, 2]。
            长度和 dp[1] 一样,但它的结尾更小,后面还能接上更多元素。
          </>
        }
      />
    ),
  },
  {
    i: 3,
    preds: [0, 1, 2],
    dpUpto: 3,
    msg: (
      <T
        en={
          <>
            dp[3]: nums[3] = 4. All of 1, 3, and 2 are smaller, so <b>all three
            can come before it</b>. Take the one with the largest dp value
            (dp[1] = dp[2] = 2): dp[3] = 2 + 1 = <b>3</b>. Scanning back over every
            candidate is exactly what the inner loop does, and it is where the
            O(n²) comes from.
          </>
        }
        zh={
          <>
            dp[3]:nums[3] = 4。左边的 1、3、2 都比它小,<b>三个都能接</b>。
            当然要挑 dp 最大的那个(dp[1] = dp[2] = 2):dp[3] = 2 + 1 = <b>3</b>。
            「回头把每个候选前驱都扫一遍」正是内层循环做的事,O(n²) 就来自这里。
          </>
        }
      />
    ),
  },
  {
    i: 4,
    preds: [0, 1, 2, 3],
    dpUpto: 4,
    msg: (
      <T
        en={
          <>
            dp[4]: nums[4] = 5 is larger than everything to its left. The best
            predecessor is index 3 with dp[3] = 3, so dp[4] = 3 + 1 = <b>4</b>.
          </>
        }
        zh={
          <>
            dp[4]:nums[4] = 5 比左边所有数都大。最优前驱是下标 3(dp[3] = 3),
            所以 dp[4] = 3 + 1 = <b>4</b>。
          </>
        }
      />
    ),
  },
  {
    i: null,
    preds: [],
    dpUpto: 4,
    chain: [0, 1, 3, 4],
    msg: (
      <T
        en={
          <>
            The answer is the <b>maximum of the dp array, 4</b>. Here that maximum
            happens to be in the last cell, only because the largest value, 5, is
            at the end. That is not guaranteed, so always take the maximum of the
            whole array rather than dp[n-1]. Following the best predecessors
            backwards gives one longest increasing subsequence: [1, 3, 4, 5]. Each
            cell scans everything to its left, so the total time is <b>O(n²)</b>.
          </>
        }
        zh={
          <>
            答案是 <b>dp 数组的最大值 4</b>。这里最大值恰好落在最后一格,
            只是因为最大的数 5 正好在末尾 —— 这没有任何保证,
            所以要取整个数组的最大值,而不是 dp[n-1]。
            沿最优前驱回溯,可以还原出一条最长上升子序列 [1, 3, 4, 5]。
            每一格都要扫一遍它左边的全部元素,总时间 <b>O(n²)</b>。
          </>
        }
      />
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
        <T
          en="LC 300 · dp[i] = longest increasing subsequence ending at i (nums = [1, 3, 2, 4, 5])"
          zh="LC 300 · dp[i] = 以 i 结尾的最长上升子序列(nums = [1, 3, 2, 4, 5])"
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 4 }}>
        <div className="seq-lis">
          {/* pointer row */}
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
          {/* nums row */}
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
          {/* dp row */}
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
