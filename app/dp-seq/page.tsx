"use client";

// 第 9 章 · 子序列 DP —— DP 系列第三章(承接 07 入门、08 背包)。
// 结构:子序列 vs 子数组(定调)→ 精讲 A LIS 300(以 i 结尾 + 二分优化)→
// 连续型 718(归零)→ 精讲 B LCS 1143(双序列二维表主场,对角线转移)→
// 精讲 C 编辑距离 72(增删改三来源)→ 回文家族 5/516/647/132 → 题单 → 测验。
// 二维表全部用 lib/algviz 的 DPTable;帧由本文件的 grid2D / seqFrames 生成
// (参考样板章 app/dp 的 climbCells / pathCells)。

import "./chapter.css";
import {
  Hero,
  Section,
  Callout,
  BigO,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { ArrayStepper, type ArrayFrame } from "@/lib/stepper";
import { DPTable, type DPFrame, type DPCell } from "@/lib/algviz";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { PROBLEMS, QUIZ } from "@/lib/dp-seq-data";
import { SubseqLab, LisPlayer } from "./viz";
import type { ReactNode } from "react";

/* ================= 二维 DP 表帧生成器(全章共用) ================= */

/** 生成一帧整表快照:cur = 当前格,srcs = 转移来源格,ok = 已锁定答案格。 */
function grid2D(
  DP: number[][],
  filled: (i: number, j: number) => boolean,
  cur?: [number, number],
  srcs?: [number, number][],
  ok?: [number, number],
): DPCell[][] {
  return DP.map((row, i) =>
    row.map((v, j): DPCell => {
      if (cur && cur[0] === i && cur[1] === j) return { v, state: "cur" };
      if (srcs?.some(([a, b]) => a === i && b === j)) return { v, state: "src" };
      if (ok && ok[0] === i && ok[1] === j) return { v, state: "ok" };
      if (filled(i, j)) return { v, state: "done" };
      return { v: "?", state: "ghost" };
    }),
  );
}

/** 按行优先逐格填内层,自动串成帧序列(开场 + 每个内层格 + 收尾)。 */
function seqFrames(
  DP: number[][],
  border: (i: number, j: number) => boolean,
  transition: (i: number, j: number) => [number, number][],
  initMsg: ReactNode,
  cellMsg: (i: number, j: number) => ReactNode,
  finalMsg: ReactNode,
  finalCell: [number, number],
): DPFrame[] {
  const m = DP.length - 1;
  const n = DP[0].length - 1;
  const inner: [number, number][] = [];
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) inner.push([i, j]);
  const isFilled = (k: number) => (a: number, b: number) =>
    border(a, b) || inner.slice(0, k).some(([x, y]) => x === a && y === b);

  const frames: DPFrame[] = [
    { cells: grid2D(DP, border), msg: initMsg },
  ];
  inner.forEach(([i, j], k) => {
    frames.push({
      cells: grid2D(DP, isFilled(k), [i, j], transition(i, j)),
      msg: cellMsg(i, j),
    });
  });
  frames.push({
    cells: grid2D(DP, () => true, undefined, undefined, finalCell),
    msg: finalMsg,
  });
  return frames;
}

const border0 = (i: number, j: number) => i === 0 || j === 0;

/* ---------- 精讲 A 附:LIS 二分优化(tails / 耐心排序)---------- */

const F_TAILS: ArrayFrame[] = [
  {
    cells: [{ v: 1, state: "lit" }],
    msg: <>拿到 <b>1</b>:牌堆是空的 → 新开一堆。tails = [1],当前最长长度 1。</>,
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 3, state: "lit" }],
    msg: (
      <>
        拿到 <b>3</b>:它比现在的堆顶 1 还大 → 另起一堆放最后。tails = [1, 3],长度 2。
      </>
    ),
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 2, state: "lit" }],
    msg: (
      <>
        拿到 <b>2</b>:卡在 1 和 3 之间 → 二分找到第一个 ≥ 2 的堆顶(3),把它换成 2。
        长度不变(还是 2),但「结尾更小 = 后劲更足」。
      </>
    ),
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 2, state: "ok" }, { v: 4, state: "lit" }],
    msg: <>拿到 <b>4</b>:比堆顶 2 大 → 新开一堆。tails = [1, 2, 4],长度 3。</>,
  },
  {
    cells: [
      { v: 1, state: "ok" },
      { v: 2, state: "ok" },
      { v: 4, state: "ok" },
      { v: 5, state: "lit" },
    ],
    msg: (
      <>
        拿到 <b>5</b>:比堆顶 4 大 → 新开一堆。tails = [1, 2, 4, 5],长度 <b>4</b> = 答案。
        每个数只做一次二分 → <b>O(n log n)</b>。
      </>
    ),
  },
];

/* ================= 精讲 B · LC 1143 最长公共子序列 ================= */

const LCS_A = "abcde"; // 行(i = 1..5)
const LCS_B = "ace"; // 列(j = 1..3)
const DP_LCS = [
  [0, 0, 0, 0],
  [0, 1, 1, 1],
  [0, 1, 1, 1],
  [0, 1, 2, 2],
  [0, 1, 2, 2],
  [0, 1, 2, 3],
];

const F_LCS = seqFrames(
  DP_LCS,
  border0,
  (i, j) =>
    LCS_A[i - 1] === LCS_B[j - 1]
      ? [[i - 1, j - 1]]
      : [
          [i - 1, j],
          [i, j - 1],
        ],
  <>
    A =「abcde」(行),B =「ace」(列)。状态:
    <b>dp[i][j] = A 前 i 个字符与 B 前 j 个字符的最长公共子序列长度</b>。
    第 0 行、第 0 列代表「空串对任何串」,公共子序列长度必然是 0 —— 这是不证自明的边界。
  </>,
  (i, j) => {
    const a = LCS_A[i - 1];
    const b = LCS_B[j - 1];
    return a === b ? (
      <>
        「{a}」=「{b}」两字符相同 → 走<b>对角线</b>:dp[{i - 1}][{j - 1}] ={" "}
        {DP_LCS[i - 1][j - 1]},配对成功加一 = <b>{DP_LCS[i][j]}</b>。对角线是「匹配」的独家来路。
      </>
    ) : (
      <>
        「{a}」≠「{b}」→ 放弃其中一个字符,取上、左较大者 max(dp[{i - 1}][{j}] ={" "}
        {DP_LCS[i - 1][j]}, dp[{i}][{j - 1}] = {DP_LCS[i][j - 1]}) = <b>{DP_LCS[i][j]}</b>。
        注意<b>不归零</b> —— 之前攒下的公共长度原样保留。
      </>
    );
  },
  <>
    右下角 <b>3</b> 就是答案(公共子序列「ace」)。每格 O(1)、共 (m+1)(n+1) 格 →{" "}
    <b>O(mn)</b>。这张表就是本章的地基,后面编辑距离、回文全在它上面改算子。
  </>,
  [5, 3],
);

/* ================= 连续型 · LC 718 最长重复子数组 ================= */

const A718 = [1, 2, 3, 2, 1];
const B718 = [3, 2, 1, 4, 7];
const DP_718 = [
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0, 0],
  [0, 0, 2, 0, 0, 0],
  [0, 0, 0, 3, 0, 0],
];

const F_718 = seqFrames(
  DP_718,
  border0,
  (i, j) => (A718[i - 1] === B718[j - 1] ? [[i - 1, j - 1]] : []),
  <>
    A = [1, 2, 3, 2, 1](行),B = [3, 2, 1, 4, 7](列)。状态:
    <b>dp[i][j] = 分别以 A[i-1]、B[j-1] 结尾的最长公共连续子数组长度</b>。
    「以…结尾」+「连续」是子数组题的招牌措辞。
  </>,
  (i, j) => {
    const a = A718[i - 1];
    const b = B718[j - 1];
    return a === b ? (
      <>
        A[{i - 1}] = B[{j - 1}] = <b>{a}</b> → 在对角线 dp[{i - 1}][{j - 1}] ={" "}
        {DP_718[i - 1][j - 1]} 的连续段后接一位 = <b>{DP_718[i][j]}</b>。
      </>
    ) : (
      <>
        A[{i - 1}] = {a} ≠ B[{j - 1}] = {b} → 连续断了,<b>直接归零</b>。
        它不看上 / 左,只认对角线 —— 这就是和 LCS 的分水岭。
      </>
    );
  },
  <>
    答案是<b>整张表的最大值 3</b>(公共连续段 [3, 2, 1]),不是右下角!因为「连续」的段可能出现在中间,
    随时会被归零打断。O(mn)。
  </>,
  [5, 3],
);

/* ================= 精讲 C · LC 72 编辑距离 ================= */

const EDIT_A = "horse";
const EDIT_B = "ros";
const DP_72 = [
  [0, 1, 2, 3],
  [1, 1, 2, 3],
  [2, 2, 1, 2],
  [3, 2, 2, 2],
  [4, 3, 3, 2],
  [5, 4, 4, 3],
];

const F_72 = seqFrames(
  DP_72,
  border0,
  (i, j) =>
    EDIT_A[i - 1] === EDIT_B[j - 1]
      ? [[i - 1, j - 1]]
      : [
          [i - 1, j - 1],
          [i - 1, j],
          [i, j - 1],
        ],
  <>
    把 word1 =「horse」(行)改成 word2 =「ros」(列)。状态:
    <b>dp[i][j] = word1 前 i 个变成 word2 前 j 个的最少操作数</b>。
    边界很关键:dp[i][0] = i(把 i 个字符全删空)、dp[0][j] = j(从空串一路增出 j 个)。
  </>,
  (i, j) => {
    const a = EDIT_A[i - 1];
    const b = EDIT_B[j - 1];
    return a === b ? (
      <>
        「{a}」=「{b}」→ 末字符不用动,直接抄对角线 dp[{i - 1}][{j - 1}] ={" "}
        <b>{DP_72[i][j]}</b>,一步操作都不加。
      </>
    ) : (
      <>
        「{a}」≠「{b}」→ 三选一取最小 + 1:<span className="seq-op">改 {DP_72[i - 1][j - 1]}</span>
        <span className="seq-op">删 {DP_72[i - 1][j]}</span>
        <span className="seq-op">增 {DP_72[i][j - 1]}</span>= <b>{DP_72[i][j]}</b>。
      </>
    );
  },
  <>
    右下角 <b>3</b> 就是答案(horse → rorse → rose → ros:改、删、删)。O(mn)。
    编辑距离是双序列 DP 的巅峰,因为它一格里同时握着<b>三个来源</b>。
  </>,
  [5, 3],
);

/* ================= 回文家族 · 中心扩展 ================= */

const F_CENTER: ArrayFrame[] = [
  {
    cells: "abcba".split("").map((c, i) => ({
      v: c,
      state: i === 2 ? "lit" : undefined,
    })),
    ptrs: [{ i: 2, label: "中" }],
    msg: <>奇数中心:从下标 2 的「c」出发,单个字符天生是回文,长度 1。</>,
  },
  {
    cells: "abcba".split("").map((c, i) => ({
      v: c,
      state: i >= 1 && i <= 3 ? "lit" : undefined,
    })),
    ptrs: [
      { i: 1, label: "l" },
      { i: 3, label: "r" },
    ],
    msg: <>向两边各扩一步:s[1] = s[3] =「b」相等 → 「bcb」是回文,长度 3。</>,
  },
  {
    cells: "abcba".split("").map((c) => ({ v: c, state: "lit" as const })),
    ptrs: [
      { i: 0, label: "l" },
      { i: 4, label: "r" },
    ],
    msg: <>再扩:s[0] = s[4] =「a」相等 → 「abcba」整串都是回文,长度 5。</>,
  },
  {
    cells: "abcba".split("").map((c) => ({ v: c, state: "ok" as const })),
    msg: (
      <>
        l 再往左就出界了,停。以下标 2 为中心的最长回文子串 = 整串,长度 5。
        偶数长度的回文(如「bb」)从「两字符之间的缝隙」起扩,一共 2n−1 个中心要试。
      </>
    ),
  },
];

/* ================= 精讲代码 ================= */

const LIS_N2 = {
  java: {
    code: `class Solution {
    public int lengthOfLIS(int[] nums) {
        int n = nums.length, ans = 1;
        int[] dp = new int[n];
        Arrays.fill(dp, 1);              // 每个数至少自成一段,dp 全填 1
        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i])   // 能接在 j 后面
                    dp[i] = Math.max(dp[i], dp[j] + 1);
            }
            ans = Math.max(ans, dp[i]);  // 答案是全表最大,不是 dp[n-1]
        }
        return ans;
    }
}`,
    hl: [7, 8, 9],
    note: (
      <>
        <b>坑:</b>最后 <code>return</code> 的是全表最大值,不是 <code>dp[n-1]</code> ——
        以最大元素结尾时答案才恰好在末尾,别顺手写错。
      </>
    ),
  },
  python: {
    code: `class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        n = len(nums)
        dp = [1] * n                     # 每个数至少自成一段
        for i in range(1, n):
            for j in range(i):
                if nums[j] < nums[i]:    # 能接在 j 后面
                    dp[i] = max(dp[i], dp[j] + 1)
        return max(dp)                   # 答案是全表最大`,
    hl: [7, 8, 9],
    note: (
      <>
        <b>爽点:</b><code>max(dp)</code> 一行取全表最大;空数组要另外判(题目保证 n ≥ 1 就免了)。
      </>
    ),
  },
  js: {
    code: `var lengthOfLIS = function (nums) {
  const n = nums.length;
  const dp = new Array(n).fill(1);   // 每个数至少自成一段
  let ans = 1;
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    ans = Math.max(ans, dp[i]);
  }
  return ans;
};`,
    hl: [6, 7],
    note: (
      <>
        <b>细节:</b>双层循环 <b>O(n²)</b>;n ≤ 2500 时够用,更大的数据要上下面的二分版。
      </>
    ),
  },
};

const LIS_NLOGN = {
  java: {
    code: `class Solution {
    public int lengthOfLIS(int[] nums) {
        List<Integer> tails = new ArrayList<>();
        for (int x : nums) {
            int lo = 0, hi = tails.size();
            while (lo < hi) {                 // 二分:第一个 >= x 的位置
                int mid = (lo + hi) >>> 1;
                if (tails.get(mid) < x) lo = mid + 1;
                else hi = mid;
            }
            if (lo == tails.size()) tails.add(x); // 更大 → 新开一堆
            else tails.set(lo, x);                // 否则换成更小的结尾
        }
        return tails.size();
    }
}`,
    hl: [5, 6, 7, 8, 9],
    note: (
      <>
        <b>坑:</b>返回的是 <code>tails.size()</code>(长度对);<code>tails</code> 里的具体值
        <b>不一定是一条真实的 LIS</b>,后来的替换可能把它搅乱 —— 只借它数长度。
      </>
    ),
  },
  python: {
    code: `import bisect

class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        tails = []
        for x in nums:
            i = bisect.bisect_left(tails, x)  # 第一个 >= x 的位置
            if i == len(tails):
                tails.append(x)               # 新开一堆
            else:
                tails[i] = x                  # 换成更小的结尾
        return len(tails)`,
    hl: [7],
    note: (
      <>
        <b>爽点:</b><code>bisect_left</code> 一行完成二分。若求「最长<b>不下降</b>子序列」
        (允许相等),把它换成 <code>bisect_right</code> 即可。
      </>
    ),
  },
  js: {
    code: `var lengthOfLIS = function (nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {                    // 第一个 >= x 的位置
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    if (lo === tails.length) tails.push(x);
    else tails[lo] = x;
  }
  return tails.length;
};`,
    hl: [4, 5, 6, 7, 8],
    note: (
      <>
        <b>细节:</b>手写二分要用「左闭右开」找第一个 ≥ x 的位置,退出时 <code>lo</code> 就是插入点 ——
        这正是第 3 章 lower_bound 的模板。
      </>
    ),
  },
};

/* ================= 页面 ================= */

const CHIPS = [
  { id: "vs", n: "01", label: "子序列 vs 子数组" },
  { id: "lis", n: "02", label: "LIS 最长上升" },
  { id: "subarray", n: "03", label: "连续型 · 718" },
  { id: "lcs", n: "04", label: "LCS 双序列主场" },
  { id: "edit", n: "05", label: "编辑距离" },
  { id: "palindrome", n: "06", label: "回文家族" },
  { id: "problems", n: "07", label: "高频题单" },
  { id: "quiz", n: "08", label: "通关测验" },
];

export default function DpSeqChapter() {
  return (
    <main className="page" data-ch="dp-seq">
      <Hero
        ch="dp-seq"
        title={
          <>
            子序列 <span className="grad">Subsequence DP</span>
          </>
        }
        essence={
          <>
            上两章的 DP 都在<strong>一个</strong>序列里做决策。这一章升级:
            <strong>两个序列的恩怨,全写进一张二维表格</strong> ——
            行是一个串、列是另一个串,每一格回答「这两段前缀之间发生了什么」。
            LIS、LCS、编辑距离、回文,看似四道题,底层是同一张表换算子。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 子序列 vs 子数组 ================= */}
      <Section
        id="vs"
        index="01"
        title="先分清:子序列(可不连续)vs 子数组(必连续)"
        desc="这一个字的区别,决定了状态怎么定义、不匹配时该归零还是取 max"
      >
        <div className="prose">
          <p>
            本章所有题都绕着两个词打转,先把它们钉死 ——
          </p>
          <ul>
            <li>
              <strong>子序列(subsequence)</strong>:从原序列里<strong>按原顺序</strong>挑出若干元素,
              <strong>允许不连续</strong>。「abcde」里「ace」是子序列。
            </li>
            <li>
              <strong>子数组 / 子串(subarray / substring)</strong>:原序列里<strong>连续的一段</strong>。
              「abcde」里「bcd」是子串,「ace」不是。
            </li>
          </ul>
          <p>
            为什么零基础也必须先记牢这一条?因为它直接决定 DP 转移的形状:
            <strong>连续型一旦当前元素对不上,那一段就断了、必须归零</strong>(718);
            <strong>不连续型对不上还能跳过它、继承之前的最优</strong>(1143)。
            同一张二维表,差别就在「不匹配」那一格 —— 亲手点一点体会:
          </p>
        </div>
        <SubseqLab />
        <div className="seq-duo">
          <div className="card hoverable">
            <div className="card-kicker">子序列 · 允许跳</div>
            <div className="card-title">🪁 状态常按「以 i 结尾 / 前 i 个」定义</div>
            <p>
              因为可以跳过元素,转移时「放弃当前元素」是合法选项 ——
              于是不匹配就<b>取上一个最优</b>(max),绝不清零。代表:LIS、LCS、编辑距离。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">子数组 · 必须连</div>
            <div className="card-title">🧱 状态几乎总是「以 i 结尾」</div>
            <p>
              连续的段有明确的「末尾」,一旦末尾对不上,整段作废 ——
              于是不匹配就<b>归零</b>重来,答案在全表最大值里。代表:718、最大子数组和(53)。
            </p>
          </div>
        </div>
        <Callout tone="warn" title="新手最容易在这里翻车">
          <p>
            拿到题先问一句:<b>它要的是「顺序对就行」还是「必须连着」?</b>
            —— 「最长公共<b>子序列</b>」和「最长公共<b>子数组</b>」只差两个字,
            转移方程却完全不同(§03、§04 会把这对孪生题并排拆开)。
            读错题意 = 写错状态 = 满盘皆输,这是双序列 DP 的头号坑。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 精讲 A · LIS 300 ================= */}
      <Section
        id="lis"
        index="02"
        title="精讲 A · 最长递增子序列(LIS)"
        desc="LC 300 —— 单序列子序列 DP 的入门,再顺手把复杂度砍到 O(n log n)"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>给一个数组,求最长的<strong>严格递增子序列</strong>的长度(可不连续)。
            例 [1, 3, 2, 4, 5] → [1, 3, 4, 5] 或 [1, 2, 4, 5],长度 4。
          </p>
          <p>
            <b>暴力:</b>每个元素选或不选,2ⁿ 个子序列逐个检查是否递增 —— n = 40 就跑不动。
            <b> 为什么能优化:</b>「最长递增子序列」有明显的<strong>最优子结构</strong> ——
            一条长上升序列,去掉末尾还是一条上升序列。于是关键是<strong>怎么定义状态</strong>。
          </p>
          <p>
            这里藏着子序列 DP 最重要的手筋:<strong>用「结尾」锚定子问题</strong>。
            定义 <code>dp[i] = 以 nums[i] 结尾的最长上升子序列长度</code>。
            为什么非要「以 i 结尾」?因为只有固定了末尾,才能判断「谁能接在谁后面」——
            往左找所有比 nums[i] 小的 nums[j],把它们的 dp[j] 取最大再 +1。逐格看:
          </p>
        </div>
        <LisPlayer />
        <CodeTabs
          title="lc300_lis_n2"
          java={LIS_N2.java}
          python={LIS_N2.python}
          js={LIS_N2.js}
        />
        <div className="prose">
          <p>
            时间 <b>O(n²)</b>、空间 O(n)。但 300 还能更快 ——
            这就引出一个漂亮的贪心 + 二分技巧,叫<strong>耐心排序(patience sorting)</strong>。
            维护一个 <code>tails</code> 数组:<code>tails[k]</code> = 「长度为 k+1 的上升子序列」
            目前<strong>最小可能的结尾</strong>。每来一个新数,用<strong>二分</strong>(第 3 章的
            lower_bound)找到第一个 ≥ 它的位置换掉;比所有堆顶都大就追加。tails 的长度就是答案:
          </p>
        </div>
        <ArrayStepper
          title="LC 300 · tails 数组的成长(nums = [1, 3, 2, 4, 5])"
          frames={F_TAILS}
        />
        <CodeTabs
          title="lc300_lis_nlogn"
          java={LIS_NLOGN.java}
          python={LIS_NLOGN.python}
          js={LIS_NLOGN.js}
        />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">复杂度对比</div>
            <div className="card-title">📉 O(n²) → O(n log n)</div>
            <p>
              内层「回头扫一遍」被「二分找位置」取代:n 次操作、每次 O(log n)。
              n = 10⁵ 时 O(n²) 要百亿次、二分版只要百万级。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">变式 · LC 673</div>
            <div className="card-title">🔢 数 LIS 有几条</div>
            <p>
              在 dp[i] 旁再挂 cnt[i]:发现更长就<b>重置计数</b>,长度打平就<b>累加计数</b>。
              「主数组 + 计数数组」是计数型 DP 的通用套路。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">易错点</div>
            <div className="card-title">⚠️ 答案不在最后一格</div>
            <p>
              dp[i] 是「以 i 结尾」,最长的那条不一定以最后一个数结尾 ——
              答案要取<b>整个 dp 数组的最大值</b>。
            </p>
          </div>
        </div>
        <Callout tone="story" title="「耐心排序」这名字,真的来自打牌">
          <p>
            这个技巧得名于纸牌游戏 patience(英式接龙)。发牌时把每张牌压到「牌顶比它大的最左边一摞」上,
            压不上就新起一摞 —— 最后<b>摞数</b>正好等于最长上升子序列长度。数学家把这套「贪心 + 二分」
            提炼出来,成了 LIS 的经典 O(n log n) 解。算法史上不少妙招,都是先有直觉游戏、后有证明。
          </p>
        </Callout>
        <Callout tone="deep" title="工程现场:LIS 就是 diff 和版本控制的近亲">
          <p>
            <code>git diff</code>、文本对比工具的核心,是找两个文件「最长的公共不变行序列」——
            也就是下一节的 <b>LCS</b>。而 LCS 在特定条件下可转化成 LIS 来加速(Hunt–Szymanski 算法),
            大文件 diff 之所以快,背后正是这条 O(n log n) 的耐心排序。你每天按的 ⌘Z、看的代码评审高亮,
            都踩在子序列 DP 上。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 连续型 · 718 ================= */}
      <Section
        id="subarray"
        index="03"
        title="连续型:最长重复子数组"
        desc="LC 718 —— 双序列的第一张二维表,先立「归零」这条规矩"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>两个整数数组 A、B,求它们<strong>公共的、连续的</strong>子数组最长有多长。
            注意是<strong>子数组(必须连续)</strong>,这决定了它的状态定义。
          </p>
          <p>
            <b>暴力:</b>枚举 A 的每个起点、B 的每个起点,再往后逐位比 —— O(m·n·min(m,n)) 起步。
            <b> 正解:</b>双序列问题的通用起手 —— <strong>开一张二维表,行扫 A、列扫 B</strong>。
            但「连续」要求状态必须<strong>钉住结尾</strong>:
            <code>dp[i][j] = 分别以 A[i-1]、B[j-1] 结尾的最长公共连续子数组长度</code>。
            两字符相等就在对角线的连续段后 +1;<strong>一旦不等,连续断裂,直接归零</strong>:
          </p>
        </div>
        <DPTable
          title="LC 718 · 二维表逐格填充(蓝色虚线格 = 对角线来源;不匹配即归零)"
          frames={F_718}
          colLabels={["∅", "3", "2", "1", "4", "7"]}
          rowLabels={["∅", "1", "2", "3", "2", "1"]}
          cornerLabel="dp"
        />
        <CodeTabs
          title="lc718_max_repeated_subarray"
          java={{
            code: `class Solution {
    public int findLength(int[] a, int[] b) {
        int m = a.length, n = b.length, ans = 0;
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++) {
                if (a[i - 1] == b[j - 1])
                    dp[i][j] = dp[i - 1][j - 1] + 1;  // 接上对角线连续段
                // 不相等:不写 else,数组默认 0 = 天然归零
                ans = Math.max(ans, dp[i][j]);        // 答案是全表最大
            }
        return ans;
    }
}`,
            hl: [7, 8],
            note: (
              <>
                <b>坑:</b>没有 <code>else</code> 分支 —— Java 的 <code>int[][]</code> 默认全 0,
                「不匹配归零」是白送的。答案在<b>全表最大值</b>,不在右下角。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def findLength(self, a: list[int], b: list[int]) -> int:
        m, n = len(a), len(b)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        ans = 0
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if a[i - 1] == b[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                    ans = max(ans, dp[i][j])
        return ans`,
            hl: [8, 9],
            note: (
              <>
                只在「相等」时更新;不等的格子保持初始 0。空间可压成一维,但必须
                <b>从右往左</b>更新一行(否则会读到已被本轮覆盖的对角线值)。
              </>
            ),
          }}
          js={{
            code: `var findLength = function (a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  let ans = 0;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        ans = Math.max(ans, dp[i][j]);
      }
    }
  }
  return ans;
};`,
            hl: [8, 9],
            note: (
              <>
                <code>Array.from</code> 建二维表,避免 <code>fill</code> 共享同一行引用的经典坑。
                时间、空间都是 <b>O(mn)</b>。
              </>
            ),
          }}
        />
        <Callout tone="idea" title="盯住那个「0」——它是 718 的灵魂">
          <p>
            整张表里最有信息量的不是那些 1、2、3,而是<b>满地的 0</b>:每个 0 都在说
            「到这里连续就断了」。对角线上 1→2→3 的那条斜线,就是一段正在生长的公共连续段。
            下一节把同一对序列换成「不要求连续」,你会看到这些 0 全部消失 ——
            那就是 LCS 与 718 的本质分野。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 精讲 B · LCS 1143 ================= */}
      <Section
        id="lcs"
        index="04"
        title="精讲 B · 最长公共子序列(LCS)"
        desc="LC 1143 —— 本章主场,一张表把「对角线转移」讲到骨子里"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>两个字符串,求最长<strong>公共子序列</strong>(公共、保持顺序、
            <strong>可不连续</strong>)的长度。「abcde」与「ace」→「ace」,长度 3。
          </p>
          <p>
            <b>为什么能优化:</b>和 718 同源 —— 开二维表、行扫一个串列扫另一个串。
            但因为<strong>不要求连续</strong>,状态可以更「大方」:
            <code>dp[i][j] = A 前 i 个字符与 B 前 j 个字符的 LCS 长度</code>
            (不再强求「以某字符结尾」)。转移只看当前两个末字符:
          </p>
          <ul>
            <li>
              <strong>相等</strong> → 这对字符必进 LCS,走<strong>对角线</strong>:
              <code>dp[i][j] = dp[i-1][j-1] + 1</code>。对角线是「配对成功」的<b>独家</b>来路。
            </li>
            <li>
              <strong>不等</strong> → 至少放弃其中一个末字符,取较大者:
              <code>dp[i][j] = max(dp[i-1][j], dp[i][j-1])</code> —— <strong>绝不归零</strong>。
            </li>
          </ul>
          <p>
            逐格填这张表(注意每次匹配时那条<strong>蓝色虚线的对角线来源</strong>):
          </p>
        </div>
        <DPTable
          title="LC 1143 · 二维表逐格填充(蓝虚线格 = 转移来源;匹配走对角线,不匹配取上/左 max)"
          frames={F_LCS}
          colLabels={["∅", "a", "c", "e"]}
          rowLabels={["∅", "a", "b", "c", "d", "e"]}
          cornerLabel="dp"
        />
        <CodeTabs
          title="lc1143_longest_common_subsequence"
          java={{
            code: `class Solution {
    public int longestCommonSubsequence(String s, String t) {
        int m = s.length(), n = t.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++) {
                if (s.charAt(i - 1) == t.charAt(j - 1))
                    dp[i][j] = dp[i - 1][j - 1] + 1;              // 对角线 + 1
                else
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); // 取上/左较大者
            }
        return dp[m][n];
    }
}`,
            hl: [7, 8, 9, 10],
            note: (
              <>
                <b>和 718 唯一的差别就在这个 <code>else</code>:</b>718 是隐式归零,LCS 是取上 / 左
                max。也因为不会归零,答案稳稳落在<b>右下角</b> dp[m][n]。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def longestCommonSubsequence(self, s: str, t: str) -> int:
        m, n = len(s), len(t)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if s[i - 1] == t[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        return dp[m][n]`,
            hl: [7, 8, 9, 10],
            note: (
              <>
                <b>细节:</b>下标错位是双序列 DP 的头号 bug 源 —— 记牢
                <code>dp[i][j]</code> 对应 <code>s[i-1]</code> 与 <code>t[j-1]</code>(表比串多一行一列)。
              </>
            ),
          }}
          js={{
            code: `var longestCommonSubsequence = function (s, t) {
  const m = s.length, n = t.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s[i - 1] === t[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
};`,
            hl: [6, 7],
            note: (
              <>
                时间、空间 <b>O(mn)</b>。要还原具体的公共子序列,就从 dp[m][n] 沿「当初从哪来」
                回溯:对角线来 = 记下这个字符。
              </>
            ),
          }}
        />
        <div className="prose">
          <p>
            <strong>718 vs 1143 —— lc.md 点名的一对孪生题,并排看最清楚:</strong>
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>维度</th>
                <th>LC 718 最长重复子数组</th>
                <th>LC 1143 最长公共子序列</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>要连续吗</b></td>
                <td>要(子数组)</td>
                <td>不要(子序列)</td>
              </tr>
              <tr>
                <td><b>dp[i][j] 含义</b></td>
                <td>以 A[i-1]、B[j-1] <b>结尾</b>的公共段</td>
                <td>前 i、前 j 个字符的 LCS(不限结尾)</td>
              </tr>
              <tr>
                <td><b>匹配时</b></td>
                <td>dp[i-1][j-1] + 1(对角线)</td>
                <td>dp[i-1][j-1] + 1(对角线)</td>
              </tr>
              <tr>
                <td><b>不匹配时</b></td>
                <td><b>归零</b>(连续断了)</td>
                <td><b>max(上, 左)</b>(跳过一个字符)</td>
              </tr>
              <tr>
                <td><b>答案在哪</b></td>
                <td>全表最大值</td>
                <td>右下角 dp[m][n]</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间、空间 <b>O(mn)</b>,空间可滚动压到 O(min(m,n))。高频追问:
            ①「要打印出那条公共子序列?」→ 从右下角回溯来源;
            ②「LC 1035 不相交的线是什么?」→ 换皮的 LCS,一行不用改(见题单);
            ③「和 718 差在哪?」→ 就是上表那一行「不匹配时」—— 答不出这条,等于没真懂。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 精讲 C · 编辑距离 72 ================= */}
      <Section
        id="edit"
        index="05"
        title="精讲 C · 编辑距离"
        desc="LC 72 —— 双序列 DP 的巅峰:一格里同时握着三个来源"
        badge={<span className="lc-badge" data-d="hard">HARD</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>把 word1 改成 word2,每步可以<strong>增、删、改</strong>一个字符,
            求最少操作数。「horse」→「ros」答案是 3。
          </p>
          <p>
            <b>为什么能优化:</b>还是那张二维表 ——
            <code>dp[i][j] = word1 前 i 个变成 word2 前 j 个的最少操作数</code>。
            难点在<strong>「不匹配」时的转移比 LCS 多一个来源</strong>。站在 dp[i][j] 想「最后一步做了啥」:
          </p>
          <div style={{ margin: "6px 0 2px" }}>
            <span className="seq-op">改 = dp[i-1][j-1] + 1</span>
            <span className="seq-op">删 = dp[i-1][j] + 1</span>
            <span className="seq-op">增 = dp[i][j-1] + 1</span>
          </div>
          <ul>
            <li>
              <strong>改</strong>:把 word1 第 i 个字符替换成 word2 第 j 个 ——
              两个末字符都消化掉,回到 <code>dp[i-1][j-1]</code>(<strong>对角线</strong>)。
            </li>
            <li>
              <strong>删</strong>:删掉 word1 第 i 个字符 —— word1 少一位,回到{" "}
              <code>dp[i-1][j]</code>(<strong>上方</strong>)。
            </li>
            <li>
              <strong>增</strong>:给 word1 末尾补上 word2 第 j 个字符 —— word2 被消化一位,回到{" "}
              <code>dp[i][j-1]</code>(<strong>左方</strong>)。
            </li>
          </ul>
          <p>
            当两个末字符<strong>相等</strong>时最省:白拿对角线 <code>dp[i-1][j-1]</code>,一步操作都不加。
            逐格看这三个来源怎么打架(不匹配时三个来源格同时高亮):
          </p>
        </div>
        <DPTable
          title="LC 72 · 二维表逐格填充(不匹配时:对角=改、上=删、左=增,取最小 +1)"
          frames={F_72}
          colLabels={["∅", "r", "o", "s"]}
          rowLabels={["∅", "h", "o", "r", "s", "e"]}
          cornerLabel="dp"
        />
        <CodeTabs
          title="lc72_edit_distance"
          java={{
            code: `class Solution {
    public int minDistance(String a, String b) {
        int m = a.length(), n = b.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i;   // a 全删成空串
        for (int j = 0; j <= n; j++) dp[0][j] = j;   // 空串一路增出 b
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1))
                    dp[i][j] = dp[i - 1][j - 1];             // 相等,白拿
                else
                    dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], // 改
                                   Math.min(dp[i - 1][j],     // 删
                                            dp[i][j - 1]));   // 增
            }
        return dp[m][n];
    }
}`,
            hl: [11, 12, 13, 14],
            note: (
              <>
                <b>坑:</b>别漏了两条边界 <code>dp[i][0] = i</code>、<code>dp[0][j] = j</code> ——
                它们是「一路删空」和「从空串一路增」的基准,漏了整表全错。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def minDistance(self, a: str, b: str) -> int:
        m, n = len(a), len(b)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m + 1):
            dp[i][0] = i                      # a 全删成空串
        for j in range(n + 1):
            dp[0][j] = j                      # 空串一路增出 b
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if a[i - 1] == b[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]            # 相等,白拿
                else:
                    dp[i][j] = 1 + min(dp[i - 1][j - 1],   # 改
                                       dp[i - 1][j],       # 删
                                       dp[i][j - 1])       # 增
        return dp[m][n]`,
            hl: [13, 14, 15, 16],
            note: (
              <>
                <b>爽点:</b>Python 的 <code>min</code> 直接吃三个参数,增删改一行写完。
                三个来源格分别是左、上、对角 —— 和可视化里高亮的三格一一对应。
              </>
            ),
          }}
          js={{
            code: `var minDistance = function (a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;   // a 全删成空串
  for (let j = 0; j <= n; j++) dp[0][j] = j;   // 空串一路增出 b
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
};`,
            hl: [8, 9],
            note: (
              <>
                时间、空间 <b>O(mn)</b>。相等时是「白拿对角线、不加操作」,别顺手写成 +1 ——
                这是编辑距离最常见的低级错。
              </>
            ),
          }}
        />
        <Callout tone="deep" title="工程现场:拼写检查、DNA 比对都是它">
          <p>
            编辑距离(又叫 Levenshtein 距离)是「两个序列有多像」的通用尺子:
            输入法 / 搜索框的<b>「你是不是想搜……」</b>,靠它排候选;
            生物信息里<b>比对 DNA / 蛋白质序列</b>(Needleman–Wunsch 算法)是同一张表加权版;
            <code>git</code> 的行级 diff、模糊搜索(fzf)、抄袭检测,底层都是这套增删改 DP。
            学会 72,等于握住了「序列相似度」这一大类问题的钥匙。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 回文家族 ================= */}
      <Section
        id="palindrome"
        index="06"
        title="回文家族:向外扩 or 向内缩"
        desc="LC 5 / 516 / 647 / 132 —— 子序列 DP 的最后一块拼图"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            回文 = <strong>正着读、反着读一样</strong>。处理回文有两种互补的视角:
          </p>
          <div className="seq-duo">
            <div className="card">
              <div className="card-kicker">视角一 · 中心扩展(向外)</div>
              <div className="card-title">🎯 枚举中心,两边同时扩</div>
              <p>
                回文关于中心对称,所以枚举 <b>2n−1 个中心</b>(n 个单字符 + n−1 个字符缝隙,
                分管奇 / 偶长度),每个向两边扩到不等为止。O(n²) 时间、<b>O(1) 空间</b>,
                最适合<b>子串(连续)</b>题:LC 5、647。
              </p>
            </div>
            <div className="card">
              <div className="card-kicker">视角二 · 区间 DP(向内)</div>
              <div className="card-title">📐 dp[i][j] 描述一段区间</div>
              <p>
                dp[i][j] 表示子串 s[i..j] 的性质(是否回文 / 最长回文子序列)。
                转移看两端 s[i]、s[j],依赖<b>更短的内层区间</b> dp[i+1][j-1] ——
                这是<b>第 10 章区间 DP</b> 的预演,最适合<b>子序列</b>题:LC 516。
              </p>
            </div>
          </div>
          <p>
            先看最直观的<strong>中心扩展</strong>(LC 5 最长回文子串 / LC 647 回文子串计数共用它):
          </p>
        </div>
        <ArrayStepper
          title="回文中心扩展(s = 「abcba」,以下标 2 为奇数中心)"
          frames={F_CENTER}
        />
        <CodeTabs
          title="lc5_longest_palindrome_substring"
          java={{
            code: `class Solution {
    private int start = 0, maxLen = 1;

    public String longestPalindrome(String s) {
        if (s.length() < 2) return s;
        for (int i = 0; i < s.length(); i++) {
            expand(s, i, i);       // 奇数长度中心:单个字符
            expand(s, i, i + 1);   // 偶数长度中心:两字符之间的缝隙
        }
        return s.substring(start, start + maxLen);
    }

    private void expand(String s, int l, int r) {
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
            l--; r++;              // 两端相等就继续向外扩
        }
        int len = r - l - 1;       // 退出时真正的回文是 [l+1, r-1]
        if (len > maxLen) { maxLen = len; start = l + 1; }
    }
}`,
            hl: [7, 8],
            note: (
              <>
                <b>坑:</b>奇偶两种中心都要试。退出循环时 l、r 已经各多走一步,
                真正的回文区间是 <code>[l+1, r-1]</code>,长度 <code>r - l - 1</code> ——
                这个 ±1 极易写错。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        res = ""
        def expand(l: int, r: int) -> str:
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            return s[l + 1 : r]        # 退出时 [l+1, r-1] 是回文
        for i in range(len(s)):
            for cand in (expand(i, i), expand(i, i + 1)):  # 奇 / 偶中心
                if len(cand) > len(res):
                    res = cand
        return res`,
            hl: [10],
            note: (
              <>
                切片 <code>s[l+1:r]</code> 右开区间正好对应回文范围,连长度计算都省了 ——
                Python 切片语义天然吃下那个 ±1。
              </>
            ),
          }}
          js={{
            code: `var longestPalindrome = function (s) {
  let start = 0, maxLen = 1;
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    if (r - l - 1 > maxLen) { maxLen = r - l - 1; start = l + 1; }
  };
  for (let i = 0; i < s.length; i++) {
    expand(i, i);       // 奇数中心
    expand(i, i + 1);   // 偶数中心
  }
  return s.substring(start, start + maxLen);
};`,
            hl: [8, 9],
            note: (
              <>
                <b>LC 647 只需改结算:</b>把「记录最长」换成「每成功扩一步 <code>count++</code>」——
                同一个中心扩展骨架,一个求最长、一个数总数。
              </>
            ),
          }}
        />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            再看<strong>区间 DP</strong> 视角的 LC 516 最长回文子序列。有个漂亮的偷懒法:
            <strong>回文子序列 = s 与 reverse(s) 的最长公共子序列</strong> —— 直接复用上一节的 1143!
            当然也能直接写区间 DP,注意它的<strong>填表方向</strong>(i 倒序、j 正序),
            这正是第 10 章区间 DP 的节奏:
          </p>
        </div>
        <CodeTabs
          title="lc516_longest_palindromic_subsequence"
          java={{
            code: `class Solution {
    public int longestPalindromeSubseq(String s) {
        int n = s.length();
        int[][] dp = new int[n][n];
        for (int i = n - 1; i >= 0; i--) {    // i 从大到小
            dp[i][i] = 1;                     // 单个字符,回文长度 1
            for (int j = i + 1; j < n; j++) { // j 从小到大
                if (s.charAt(i) == s.charAt(j))
                    dp[i][j] = dp[i + 1][j - 1] + 2;      // 两端配对
                else
                    dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
            }
        }
        return dp[0][n - 1];
    }
}`,
            hl: [5, 7],
            note: (
              <>
                <b>坑:</b>遍历方向不能乱 —— dp[i][j] 依赖 <code>dp[i+1][…]</code>(下一行),
                所以 i 必须<b>倒序</b>。这是区间 DP 的招牌节奏,第 10 章细讲。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def longestPalindromeSubseq(self, s: str) -> int:
        n = len(s)
        dp = [[0] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):        # i 倒序
            dp[i][i] = 1
            for j in range(i + 1, n):         # j 正序
                if s[i] == s[j]:
                    dp[i][j] = dp[i + 1][j - 1] + 2
                else:
                    dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
        return dp[0][n - 1]`,
            hl: [5, 7],
            note: (
              <>
                <b>更快记:</b><code>return LCS(s, s[::-1])</code> 直接复用 1143 ——
                回文子序列就是「自己和自己的倒影」的公共子序列。
              </>
            ),
          }}
          js={{
            code: `var longestPalindromeSubseq = function (s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {       // i 倒序
    dp[i][i] = 1;
    for (let j = i + 1; j < n; j++) {      // j 正序
      if (s[i] === s[j]) dp[i][j] = dp[i + 1][j - 1] + 2;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
  }
  return dp[0][n - 1];
};`,
            hl: [4, 6],
            note: (
              <>
                时间、空间 <b>O(n²)</b>。别和 LC 5(最长回文<b>子串</b>,要连续)搞混 ——
                516 求的是<b>子序列</b>,可以跳字符。
              </>
            ),
          }}
        />
        <Callout tone="win" title="提点 · LC 132 分割回文串 II(面试进阶)">
          <p>
            当回文遇上「分割」:把字符串切成若干段、每段都是回文,求<b>最少切几刀</b>。
            套路是<b>两层 DP 叠加</b> —— 先用区间 DP 预处理 <code>isPal[i][j]</code>(任意子串是否回文),
            再做一维分割 DP:<code>dp[i] = min(dp[j] + 1)</code>,其中 s[j..i-1] 回文。
            「先预处理一张判定表,再在表上跑主 DP」是很常见的组合拳,主线稳定后值得专门练。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title="高频题单:子序列 DP 12 题"
        desc="按「子序列判定 → LIS → 连续 → 双序列 → 回文」分层,由易到难。先想 30 秒再看提示"
        badge={<span className="chip">主线必做</span>}
      >
        <ProblemSet ch="dp-seq" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="7 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="dp-seq" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            第一分水岭:<b>子序列(可不连续)vs 子数组 / 子串(必连续)</b> ——
            读题先分清,它决定「不匹配」那一格是<b>归零</b>还是<b>取 max</b>。
          </>,
          <>
            单序列子序列 DP(LIS)的手筋:<b>用「以 i 结尾」锚定子问题</b>,
            往左找可接的前驱取最优;代价是<b>答案取全表最大值,不在最后一格</b>。
          </>,
          <>
            LIS 可从 <b>O(n²)</b> 降到 <b>O(n log n)</b>:维护 tails(各长度的最小结尾)+ 二分
            (耐心排序)—— 二分部分就是第 3 章的 lower_bound。
          </>,
          <>
            双序列 DP 的通用骨架:<b>开二维表,行扫一个串、列扫另一个串</b>;
            <b>匹配一律走对角线 dp[i-1][j-1]</b>,区别全在「不匹配」怎么处理。
          </>,
          <>
            孪生题对照:<b>718 不匹配归零</b>(连续)、<b>1143 不匹配取上 / 左 max</b>(不连续);
            <b>72 编辑距离多一个来源</b>(对角改 / 上删 / 左增,取最小 +1)。
          </>,
          <>
            回文两视角:<b>中心扩展</b>(向外,O(1) 空间,宜子串 5/647)、
            <b>区间 DP</b>(向内 dp[i][j],宜子序列 516);且<b>最长回文子序列 = LCS(s, reverse(s))</b>。
          </>,
          <>
            双序列 DP 的头号 bug 是<b>下标错位</b>:牢记表比串多一行一列,
            <b>dp[i][j] 对应 s[i-1] 与 t[j-1]</b>,边界(空串行 / 列)必须先填对。
          </>,
        ]}
      />

      <ChapterFooter ch="dp-seq" />
    </main>
  );
}
