"use client";

// 第 9 章 · 子序列 DP —— DP 系列第三章(承接 07 入门、08 背包)。
// 结构:子序列 vs 子数组(定调)→ 精讲 A LIS 300(以 i 结尾 + 二分优化)→
// 连续型 718(归零)→ 精讲 B LCS 1143(双序列二维表主场,对角线转移)→
// 精讲 C 编辑距离 72(增删改三来源)→ 回文家族 5/516/647/132 → 题单 → 测验。
// 二维表全部用 lib/algviz 的 DPTable;帧由本文件的 grid2D / seqFrames 生成
// (参考样板章 app/dp 的 climbCells / pathCells)。
//
// 双语:正文用 <T en zh />;组件的文案型 props 传 { en, zh }。
// CodeTabs 的 code 也给两份 —— 两份之间只有注释不同,可执行代码逐行一致(hl 行号才对得上)。

import "./chapter.css";
import {
  Hero,
  Section,
  Callout,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { ArrayStepper, type ArrayFrame } from "@/lib/stepper";
import { DPTable, type DPFrame, type DPCell } from "@/lib/algviz";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { T } from "@/lib/i18n";
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
    msg: (
      <T
        en={
          <>
            Read <b>1</b>. tails is empty, so there is nothing to replace: append
            it. tails = [1], and the longest length found so far is 1.
          </>
        }
        zh={
          <>
            读入 <b>1</b>。tails 是空的,没有可替换的位置 —— 直接追加。
            tails = [1],目前找到的最长长度是 1。
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 3, state: "lit" }],
    msg: (
      <T
        en={
          <>
            Read <b>3</b>. It is larger than every value in tails, so no entry is
            ≥ 3 and there is nothing to replace: append it. tails = [1, 3], length
            2. Appending is the only step that makes the answer grow.
          </>
        }
        zh={
          <>
            读入 <b>3</b>。它比 tails 里所有值都大,没有 ≥ 3 的位置可替换 ——
            直接追加。tails = [1, 3],长度 2。只有「追加」这一步会让答案变长。
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 2, state: "lit" }],
    msg: (
      <T
        en={
          <>
            Read <b>2</b>. Binary search finds the first entry that is ≥ 2, which
            is the 3 at index 1, and replaces it. tails = [1, 2]. The length does
            not change, but a length-2 subsequence now ends at 2 instead of 3, and
            a smaller ending value is easier to extend later.
          </>
        }
        zh={
          <>
            读入 <b>2</b>。二分找到第一个 ≥ 2 的位置(下标 1 上的 3),把它替换掉。
            tails = [1, 2]。长度没变,但长度为 2 的子序列现在以 2 结尾而不是 3 ——
            结尾更小,后面更容易接上新元素。
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 2, state: "ok" }, { v: 4, state: "lit" }],
    msg: (
      <T
        en={
          <>
            Read <b>4</b>. Larger than everything in tails, so append it. tails =
            [1, 2, 4], length 3.
          </>
        }
        zh={
          <>
            读入 <b>4</b>。比 tails 里所有值都大,追加。
            tails = [1, 2, 4],长度 3。
          </>
        }
      />
    ),
  },
  {
    cells: [
      { v: 1, state: "ok" },
      { v: 2, state: "ok" },
      { v: 4, state: "ok" },
      { v: 5, state: "lit" },
    ],
    msg: (
      <T
        en={
          <>
            Read <b>5</b>. Append again. tails = [1, 2, 4, 5], so the answer is
            its length, <b>4</b>. Each of the n values costs one binary search
            over an array of at most n entries, so the total time is{" "}
            <b>O(n log n)</b>.
          </>
        }
        zh={
          <>
            读入 <b>5</b>。继续追加。tails = [1, 2, 4, 5],答案就是它的长度 <b>4</b>。
            n 个数、每个数做一次长度不超过 n 的二分,总时间 <b>O(n log n)</b>。
          </>
        }
      />
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
  <T
    en={
      <>
        A = &quot;abcde&quot; along the rows, B = &quot;ace&quot; along the
        columns. State: <b>dp[i][j] is the length of the longest common
        subsequence of the first i characters of A and the first j characters of
        B</b>. Row 0 and column 0 stand for an empty string, which shares nothing
        with anything, so they are all 0.
      </>
    }
    zh={
      <>
        A = 「abcde」放在行,B = 「ace」放在列。状态:
        <b>dp[i][j] = A 的前 i 个字符与 B 的前 j 个字符的最长公共子序列长度</b>。
        第 0 行和第 0 列代表空串,空串和谁都没有公共部分,所以全是 0。
      </>
    }
  />,
  (i, j) => {
    const a = LCS_A[i - 1];
    const b = LCS_B[j - 1];
    return a === b ? (
      <T
        en={
          <>
            &quot;{a}&quot; and &quot;{b}&quot; are equal. Matching this pair is
            never worse than skipping it, so take the answer for the two shorter
            prefixes and add one: dp[{i - 1}][{j - 1}] = {DP_LCS[i - 1][j - 1]},
            so dp[{i}][{j}] = <b>{DP_LCS[i][j]}</b>. The <b>diagonal</b> is the
            only cell that means &quot;both characters used as one pair&quot;.
          </>
        }
        zh={
          <>
            「{a}」和「{b}」相等。把这一对配上,不会比不配更差 ——
            于是取两段更短前缀的答案再加一:dp[{i - 1}][{j - 1}] ={" "}
            {DP_LCS[i - 1][j - 1]},所以 dp[{i}][{j}] = <b>{DP_LCS[i][j]}</b>。
            <b>对角线</b>是唯一表示「两个字符作为一对被用掉」的格子。
          </>
        }
      />
    ) : (
      <T
        en={
          <>
            &quot;{a}&quot; and &quot;{b}&quot; differ, so they cannot be a matched
            pair. At least one of them must be dropped. Drop A&apos;s last
            character and you land on the cell <b>above</b>, dp[{i - 1}][{j}] ={" "}
            {DP_LCS[i - 1][j]}; drop B&apos;s and you land on the cell{" "}
            <b>to the left</b>, dp[{i}][{j - 1}] = {DP_LCS[i][j - 1]}. Keep the
            larger: <b>{DP_LCS[i][j]}</b>. Note that it <b>never resets to 0</b>;
            the common length found so far is carried forward.
          </>
        }
        zh={
          <>
            「{a}」和「{b}」不同,配不成一对,至少要放弃其中一个。
            放弃 A 的末字符就落到<b>上方</b>那格 dp[{i - 1}][{j}] ={" "}
            {DP_LCS[i - 1][j]};放弃 B 的末字符就落到<b>左方</b>那格 dp[{i}][
            {j - 1}] = {DP_LCS[i][j - 1]}。取较大的那个:<b>{DP_LCS[i][j]}</b>。
            注意它<b>任何时候都不清零</b> —— 之前攒下的公共长度原样保留。
          </>
        }
      />
    );
  },
  <T
    en={
      <>
        The bottom-right cell, <b>3</b>, is the answer, and the subsequence behind
        it is &quot;ace&quot;. There are (m+1)(n+1) states and each transition is
        O(1), so the time is <b>O(mn)</b> and the table takes O(mn) space. This
        table is the base for the rest of the chapter: edit distance and the
        palindrome problems keep the shape and change the rule inside a cell.
      </>
    }
    zh={
      <>
        右下角的 <b>3</b> 就是答案,背后的子序列是「ace」。
        共 (m+1)(n+1) 个状态、每格转移 O(1),时间 <b>O(mn)</b>,表本身占 O(mn) 空间。
        这张表是本章后半程的地基:编辑距离和回文题保留同样的形状,只换格子里的规则。
      </>
    }
  />,
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
  <T
    en={
      <>
        A = [1, 2, 3, 2, 1] along the rows, B = [3, 2, 1, 4, 7] along the columns.
        State: <b>dp[i][j] is the length of the longest common run that ends
        exactly at A[i-1] and at B[j-1]</b>. &quot;Ends exactly at&quot; is the
        wording a contiguous problem needs, because a run has a definite last
        element.
      </>
    }
    zh={
      <>
        A = [1, 2, 3, 2, 1] 放在行,B = [3, 2, 1, 4, 7] 放在列。状态:
        <b>dp[i][j] = 正好以 A[i-1] 和 B[j-1] 结尾的最长公共连续段长度</b>。
        「正好以…结尾」是连续型题目必须的措辞 —— 连续段有一个明确的末尾元素。
      </>
    }
  />,
  (i, j) => {
    const a = A718[i - 1];
    const b = B718[j - 1];
    return a === b ? (
      <T
        en={
          <>
            A[{i - 1}] = B[{j - 1}] = <b>{a}</b>, so this pair extends the run that
            ended one position earlier in both arrays: dp[{i - 1}][{j - 1}] ={" "}
            {DP_718[i - 1][j - 1]}, plus one, gives <b>{DP_718[i][j]}</b>.
          </>
        }
        zh={
          <>
            A[{i - 1}] = B[{j - 1}] = <b>{a}</b>,这一对可以接在「两边都各退一格」的
            那段连续段后面:dp[{i - 1}][{j - 1}] = {DP_718[i - 1][j - 1]},加一得{" "}
            <b>{DP_718[i][j]}</b>。
          </>
        }
      />
    ) : (
      <T
        en={
          <>
            A[{i - 1}] = {a} and B[{j - 1}] = {b} differ. A run that has to end
            here cannot exist, so the cell <b>goes back to 0</b>. It never looks at
            the cell above or the one on the left. That is the whole difference
            from LCS.
          </>
        }
        zh={
          <>
            A[{i - 1}] = {a} 与 B[{j - 1}] = {b} 不同。必须在这里结束的连续段不存在,
            所以这一格<b>回到 0</b>。它从不看上方和左方的格子 ——
            这就是它和 LCS 的全部差别。
          </>
        }
      />
    );
  },
  <T
    en={
      <>
        The answer is the <b>maximum over the whole table, 3</b>, not the
        bottom-right cell. The common run [3, 2, 1] ends in the middle of both
        arrays, and every mismatch resets a cell, so the best value can sit
        anywhere. Time <b>O(mn)</b>, and the table takes O(mn) space.
      </>
    }
    zh={
      <>
        答案是<b>整张表的最大值 3</b>,不是右下角。
        公共连续段 [3, 2, 1] 在两个数组的中间就结束了,而每次不匹配都会把一格清零,
        所以最大值可能出现在任何位置。时间 <b>O(mn)</b>,表占 O(mn) 空间。
      </>
    }
  />,
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
  <T
    en={
      <>
        Turning word1 = &quot;horse&quot; (rows) into word2 = &quot;ros&quot;
        (columns). State: <b>dp[i][j] is the fewest operations that turn the first
        i characters of word1 into the first j characters of word2</b>. The base
        cases carry real meaning: dp[i][0] = i, because emptying a prefix of i
        characters takes i deletions, and dp[0][j] = j, because building j
        characters out of the empty string takes j insertions.
      </>
    }
    zh={
      <>
        把 word1 = 「horse」(行)改成 word2 = 「ros」(列)。状态:
        <b>dp[i][j] = 把 word1 的前 i 个字符变成 word2 的前 j 个字符所需的最少操作数</b>。
        边界本身就有含义:dp[i][0] = i,把 i 个字符删空要 i 次删除;
        dp[0][j] = j,从空串造出 j 个字符要 j 次插入。
      </>
    }
  />,
  (i, j) => {
    const a = EDIT_A[i - 1];
    const b = EDIT_B[j - 1];
    return a === b ? (
      <T
        en={
          <>
            &quot;{a}&quot; and &quot;{b}&quot; are equal, so the last character
            needs no work at all. Copy the diagonal: dp[{i}][{j}] = dp[{i - 1}][
            {j - 1}] = <b>{DP_72[i - 1][j - 1]}</b>, with nothing added.
          </>
        }
        zh={
          <>
            「{a}」和「{b}」相等,末字符什么都不用做。直接抄对角线:
            dp[{i}][{j}] = dp[{i - 1}][{j - 1}] = <b>{DP_72[i - 1][j - 1]}</b>,
            不增加任何操作。
          </>
        }
      />
    ) : (
      <T
        en={
          <>
            &quot;{a}&quot; and &quot;{b}&quot; differ, so one operation is needed.
            Three cells are candidates:
            <span className="seq-op">replace {DP_72[i - 1][j - 1]}</span>
            <span className="seq-op">delete {DP_72[i - 1][j]}</span>
            <span className="seq-op">insert {DP_72[i][j - 1]}</span>
            Take the smallest and add one: dp[{i}][{j}] = <b>{DP_72[i][j]}</b>.
          </>
        }
        zh={
          <>
            「{a}」和「{b}」不同,必须动一次手。三个来源格都是候选:
            <span className="seq-op">替换 {DP_72[i - 1][j - 1]}</span>
            <span className="seq-op">删除 {DP_72[i - 1][j]}</span>
            <span className="seq-op">插入 {DP_72[i][j - 1]}</span>
            取最小的再加一:dp[{i}][{j}] = <b>{DP_72[i][j]}</b>。
          </>
        }
      />
    );
  },
  <T
    en={
      <>
        The bottom-right cell, <b>3</b>, is the answer: horse → rorse (replace h
        with r) → rose (delete r) → ros (delete e). Time <b>O(mn)</b>, and the
        table takes O(mn) space. Edit distance is the densest cell in this chapter,
        because one cell holds <b>three different operations at once</b>.
      </>
    }
    zh={
      <>
        右下角的 <b>3</b> 就是答案:horse → rorse(把 h 替换成 r)→ rose(删掉 r)
        → ros(删掉 e)。时间 <b>O(mn)</b>,表占 O(mn) 空间。
        编辑距离是本章信息量最大的一格,因为<b>一格里同时握着三种操作</b>。
      </>
    }
  />,
  [5, 3],
);

/* ================= 回文家族 · 中心扩展 ================= */

const F_CENTER: ArrayFrame[] = [
  {
    cells: "abcba".split("").map((c, i) => ({
      v: c,
      state: i === 2 ? "lit" : undefined,
    })),
    ptrs: [{ i: 2, label: { en: "centre", zh: "中心" } }],
    msg: (
      <T
        en={
          <>
            An odd-length centre: start at index 2, the letter &quot;c&quot;. A
            single character is always a palindrome, so the length so far is 1.
          </>
        }
        zh={
          <>
            奇数长度的中心:从下标 2 的「c」出发。
            单个字符一定是回文,所以目前长度是 1。
          </>
        }
      />
    ),
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
    msg: (
      <T
        en={
          <>
            Move both ends outwards by one. s[1] = s[3] = &quot;b&quot;, so
            &quot;bcb&quot; is a palindrome of length 3.
          </>
        }
        zh={
          <>
            两端各向外移动一格。s[1] = s[3] = 「b」,
            所以「bcb」是长度 3 的回文。
          </>
        }
      />
    ),
  },
  {
    cells: "abcba".split("").map((c) => ({ v: c, state: "lit" as const })),
    ptrs: [
      { i: 0, label: "l" },
      { i: 4, label: "r" },
    ],
    msg: (
      <T
        en={
          <>
            Expand again. s[0] = s[4] = &quot;a&quot;, so the whole string
            &quot;abcba&quot; is a palindrome of length 5.
          </>
        }
        zh={
          <>
            继续扩。s[0] = s[4] = 「a」,所以整串「abcba」都是回文,长度 5。
          </>
        }
      />
    ),
  },
  {
    cells: "abcba".split("").map((c) => ({ v: c, state: "ok" as const })),
    msg: (
      <T
        en={
          <>
            One more step would move l out of the array, so this centre is done.
            The longest palindrome centred at index 2 is the whole string, length
            5. Even-length palindromes such as &quot;bb&quot; start from the gap
            between two characters instead, which is why there are 2n−1 centres to
            try in total.
          </>
        }
        zh={
          <>
            再走一步 l 就出界了,这个中心到此为止。
            以下标 2 为中心的最长回文就是整串,长度 5。
            偶数长度的回文(例如「bb」)改从「两个字符之间的缝隙」起扩 ——
            所以一共有 2n−1 个中心要试。
          </>
        }
      />
    ),
  },
];

/* ================= 精讲代码 ================= */

const LIS_N2 = {
  java: {
    code: {
      en: `class Solution {
    public int lengthOfLIS(int[] nums) {
        int n = nums.length, ans = 1;
        int[] dp = new int[n];
        Arrays.fill(dp, 1);              // every element alone has length 1
        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i])   // nums[i] can follow nums[j]
                    dp[i] = Math.max(dp[i], dp[j] + 1);
            }
            ans = Math.max(ans, dp[i]);  // answer is the max, not dp[n-1]
        }
        return ans;
    }
}`,
      zh: `class Solution {
    public int lengthOfLIS(int[] nums) {
        int n = nums.length, ans = 1;
        int[] dp = new int[n];
        Arrays.fill(dp, 1);              // 单个元素本身长度就是 1
        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i])   // nums[i] 可以接在 nums[j] 后面
                    dp[i] = Math.max(dp[i], dp[j] + 1);
            }
            ans = Math.max(ans, dp[i]);  // 答案取最大值,不是 dp[n-1]
        }
        return ans;
    }
}`,
    },
    hl: [7, 8, 9],
    note: {
      en: (
        <>
          <b>Common mistake:</b> returning <code>dp[n-1]</code>. That cell only
          holds the answer when some longest increasing subsequence happens to end
          at the last element. Track the maximum instead.
        </>
      ),
      zh: (
        <>
          <b>常见错误:</b>返回 <code>dp[n-1]</code>。
          只有当某条最长上升子序列恰好以最后一个元素结尾时,那一格才是答案 ——
          应该一路记录最大值。
        </>
      ),
    },
  },
  python: {
    code: {
      en: `class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        n = len(nums)
        dp = [1] * n                     # every element alone has length 1
        for i in range(1, n):
            for j in range(i):
                if nums[j] < nums[i]:    # nums[i] can follow nums[j]
                    dp[i] = max(dp[i], dp[j] + 1)
        return max(dp)                   # the answer is the largest cell`,
      zh: `class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        n = len(nums)
        dp = [1] * n                     # 单个元素本身长度就是 1
        for i in range(1, n):
            for j in range(i):
                if nums[j] < nums[i]:    # nums[i] 可以接在 nums[j] 后面
                    dp[i] = max(dp[i], dp[j] + 1)
        return max(dp)                   # 答案是最大的那一格`,
    },
    hl: [7, 8, 9],
    note: {
      en: (
        <>
          <code>max(dp)</code> reads the answer in one line. It raises an error on
          an empty list, which is safe here because LC 300 guarantees n ≥ 1.
        </>
      ),
      zh: (
        <>
          <code>max(dp)</code> 一行读出答案。空列表会抛错,
          但 LC 300 保证 n ≥ 1,这里不用额外判断。
        </>
      ),
    },
  },
  js: {
    code: {
      en: `var lengthOfLIS = function (nums) {
  const n = nums.length;
  const dp = new Array(n).fill(1);   // every element alone has length 1
  let ans = 1;
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    ans = Math.max(ans, dp[i]);
  }
  return ans;
};`,
      zh: `var lengthOfLIS = function (nums) {
  const n = nums.length;
  const dp = new Array(n).fill(1);   // 单个元素本身长度就是 1
  let ans = 1;
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    ans = Math.max(ans, dp[i]);
  }
  return ans;
};`,
    },
    hl: [6, 7],
    note: {
      en: (
        <>
          Two nested loops give <b>O(n²)</b> time and O(n) space. That is fast
          enough for LC 300, where n ≤ 2500. Larger inputs need the binary-search
          version below.
        </>
      ),
      zh: (
        <>
          双层循环:时间 <b>O(n²)</b>、空间 O(n)。
          LC 300 的 n ≤ 2500,这已经够用;数据更大就要用下面的二分版本。
        </>
      ),
    },
  },
};

const LIS_NLOGN = {
  java: {
    code: {
      en: `class Solution {
    public int lengthOfLIS(int[] nums) {
        List<Integer> tails = new ArrayList<>();
        for (int x : nums) {
            int lo = 0, hi = tails.size();
            while (lo < hi) {                 // first index with tails[i] >= x
                int mid = (lo + hi) >>> 1;
                if (tails.get(mid) < x) lo = mid + 1;
                else hi = mid;
            }
            if (lo == tails.size()) tails.add(x); // larger than all: append
            else tails.set(lo, x);                // else: smaller ending
        }
        return tails.size();
    }
}`,
      zh: `class Solution {
    public int lengthOfLIS(int[] nums) {
        List<Integer> tails = new ArrayList<>();
        for (int x : nums) {
            int lo = 0, hi = tails.size();
            while (lo < hi) {                 // 第一个 tails[i] >= x 的下标
                int mid = (lo + hi) >>> 1;
                if (tails.get(mid) < x) lo = mid + 1;
                else hi = mid;
            }
            if (lo == tails.size()) tails.add(x); // 比所有值都大:追加
            else tails.set(lo, x);                // 否则:换成更小的结尾
        }
        return tails.size();
    }
}`,
    },
    hl: [5, 6, 7, 8, 9],
    note: {
      en: (
        <>
          The return value is <code>tails.size()</code>, and that length is
          correct. The <b>contents</b> of <code>tails</code> are not: later
          replacements can leave values that never form an increasing subsequence
          of the input in that order. Use it to count, not to reconstruct.
        </>
      ),
      zh: (
        <>
          返回的是 <code>tails.size()</code>,这个长度是对的。
          但 <code>tails</code> 里的<b>具体内容</b>不是答案:
          后续替换可能留下一组在原数组里并不按此顺序出现的值。
          它只能用来数长度,不能用来还原子序列。
        </>
      ),
    },
  },
  python: {
    code: {
      en: `import bisect

class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        tails = []
        for x in nums:
            i = bisect.bisect_left(tails, x)  # first index with tails[i] >= x
            if i == len(tails):
                tails.append(x)               # larger than all: append
            else:
                tails[i] = x                  # else: smaller ending
        return len(tails)`,
      zh: `import bisect

class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        tails = []
        for x in nums:
            i = bisect.bisect_left(tails, x)  # 第一个 tails[i] >= x 的下标
            if i == len(tails):
                tails.append(x)               # 比所有值都大:追加
            else:
                tails[i] = x                  # 否则:换成更小的结尾
        return len(tails)`,
    },
    hl: [7],
    note: {
      en: (
        <>
          <code>bisect_left</code> does the binary search in one line. For the
          longest <b>non-decreasing</b> subsequence, where equal values are
          allowed, switch it to <code>bisect_right</code>.
        </>
      ),
      zh: (
        <>
          <code>bisect_left</code> 一行完成二分。
          若要求最长<b>不下降</b>子序列(允许相等),
          把它换成 <code>bisect_right</code> 即可。
        </>
      ),
    },
  },
  js: {
    code: {
      en: `var lengthOfLIS = function (nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {                    // first index with tails[i] >= x
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    if (lo === tails.length) tails.push(x);
    else tails[lo] = x;
  }
  return tails.length;
};`,
      zh: `var lengthOfLIS = function (nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {                    // 第一个 tails[i] >= x 的下标
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    if (lo === tails.length) tails.push(x);
    else tails[lo] = x;
  }
  return tails.length;
};`,
    },
    hl: [4, 5, 6, 7, 8],
    note: {
      en: (
        <>
          A hand-written binary search on a half-open range [lo, hi) finds the
          first index whose value is ≥ x. When the loop ends, <code>lo</code> is
          that index. This is the lower-bound template from Chapter 03.
        </>
      ),
      zh: (
        <>
          在左闭右开区间 [lo, hi) 上手写二分,找第一个值 ≥ x 的下标;
          循环结束时 <code>lo</code> 就是那个下标。
          这正是第 3 章的 lower_bound 模板。
        </>
      ),
    },
  },
};

/* ================= 页面 ================= */

const CHIPS = [
  { id: "vs", n: "01", label: { en: "Subsequence vs subarray", zh: "子序列 vs 子数组" } },
  { id: "lis", n: "02", label: { en: "LIS · LC 300", zh: "LIS · LC 300" } },
  { id: "subarray", n: "03", label: { en: "Contiguous · LC 718", zh: "连续型 · LC 718" } },
  { id: "lcs", n: "04", label: { en: "LCS · LC 1143", zh: "LCS · LC 1143" } },
  { id: "edit", n: "05", label: { en: "Edit distance · LC 72", zh: "编辑距离 · LC 72" } },
  { id: "palindrome", n: "06", label: { en: "Palindromes", zh: "回文家族" } },
  { id: "problems", n: "07", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "08", label: { en: "Quiz", zh: "通关测验" } },
];

export default function DpSeqChapter() {
  return (
    <main className="page" data-ch="dp-seq">
      <Hero
        ch="dp-seq"
        title={{
          en: (
            <>
              Subsequence <span className="grad">DP</span>
            </>
          ),
          zh: (
            <>
              子序列 <span className="grad">DP</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A subsequence keeps the original order but{" "}
              <strong>does not have to be contiguous</strong>. That single
              condition decides how every state in this chapter is defined. One
              sequence gives you a one-dimensional table (LIS). Two sequences give
              you a <strong>two-dimensional table, where each cell answers a
              question about one pair of prefixes</strong>. LCS, edit distance,
              and the palindrome problems are that same table with a different
              rule in the mismatch case.
            </>
          ),
          zh: (
            <>
              子序列保持原来的先后顺序,但<strong>不要求连续</strong>。
              仅这一个条件,就决定了本章每道题的状态怎么定义。
              一个序列对应一维表(LIS);两个序列对应一张
              <strong>二维表,每一格回答的都是「这一对前缀之间发生了什么」</strong>。
              LCS、编辑距离、回文,都是同一张表在「不匹配」那一格换了规则。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 子序列 vs 子数组 ================= */}
      <Section
        id="vs"
        index="01"
        title={{
          en: "First: subsequence (may skip) vs subarray (must be contiguous)",
          zh: "先分清:子序列(可跳过)vs 子数组(必须连续)",
        }}
        desc={{
          en: "This one condition decides how the state is defined, and what happens to a cell when the two characters do not match.",
          zh: "这一个条件,决定了状态怎么定义,也决定了两个字符不匹配时那一格会怎样",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={<>Every problem in this chapter turns on two words. Fix them first.</>}
              zh={<>本章所有题都围绕两个词展开,先把它们钉死。</>}
            />
          </p>
          <ul>
            <li>
              <T
                en={
                  <>
                    A <strong>subsequence</strong> is what you get by taking some
                    elements out of a sequence{" "}
                    <strong>in their original order</strong>, with{" "}
                    <strong>gaps allowed</strong>. In &quot;abcde&quot;,
                    &quot;ace&quot; is a subsequence.
                  </>
                }
                zh={
                  <>
                    <strong>子序列(subsequence)</strong>:
                    从序列里<strong>按原来的先后顺序</strong>取出若干元素,
                    <strong>允许中间有缺口</strong>。
                    在「abcde」里,「ace」是子序列。
                  </>
                }
              />
            </li>
            <li>
              <T
                en={
                  <>
                    A <strong>subarray</strong> (called a{" "}
                    <strong>substring</strong> when the sequence is a string) is a{" "}
                    <strong>contiguous block</strong> of the sequence. In
                    &quot;abcde&quot;, &quot;bcd&quot; is a substring;
                    &quot;ace&quot; is not.
                  </>
                }
                zh={
                  <>
                    <strong>子数组(subarray)</strong>
                    (序列是字符串时叫<strong>子串 substring</strong>):
                    序列里<strong>连续的一段</strong>。
                    在「abcde」里,「bcd」是子串,「ace」不是。
                  </>
                }
              />
            </li>
          </ul>
          <p>
            <T
              en={
                <>
                  Why does this matter before any code is written? Because it
                  decides the shape of the transition.{" "}
                  <strong>A contiguous problem must reset a cell to 0 the moment
                  the two current elements differ</strong>, since the run is
                  broken (LC 718). <strong>A subsequence problem may skip the
                  mismatching element and keep the best result found so
                  far</strong> (LC 1143). Same two-dimensional table, one
                  different rule. Try it below.
                </>
              }
              zh={
                <>
                  为什么一行代码都还没写就要先分清?因为它决定了转移的形状。
                  <strong>连续型题目一旦当前两个元素不同,那一格就必须归零</strong>,
                  因为连续段断了(LC 718);
                  <strong>子序列题目可以跳过对不上的元素,保留目前最好的结果</strong>
                  (LC 1143)。同一张二维表,只差这一条规则。下面亲手点一点:
                </>
              }
            />
          </p>
        </div>
        <SubseqLab />
        <div className="seq-duo">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Subsequence · gaps allowed" zh="子序列 · 允许跳过" />
            </div>
            <div className="card-title">
              <T
                en={`State: "the first i", or "ending at i"`}
                zh="状态:「前 i 个」或「以 i 结尾」"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    Because elements may be skipped, &quot;do not use this
                    element&quot; is always a legal move. So a mismatch{" "}
                    <b>carries the better of the smaller states forward</b> with
                    max, and never resets. Examples: LIS, LCS, edit distance.
                  </>
                }
                zh={
                  <>
                    因为元素可以跳过,「不用这个元素」永远是一个合法选择。
                    于是不匹配时<b>用 max 把更小状态里较好的那个继承下来</b>,
                    绝不清零。代表:LIS、LCS、编辑距离。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Subarray · must be contiguous" zh="子数组 · 必须连续" />
            </div>
            <div className="card-title">
              <T
                en={`State: almost always "ending at i"`}
                zh="状态:几乎总是「以 i 结尾」"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    A run has a definite last element, and one mismatch destroys
                    the whole run. So a mismatch <b>resets the cell to 0</b>, and
                    the answer is the maximum over the whole table. Examples: LC
                    718, maximum subarray sum (LC 53).
                  </>
                }
                zh={
                  <>
                    连续段有明确的末尾元素,而一次不匹配就会毁掉整段。
                    于是不匹配时<b>把这一格归零</b>,
                    答案要到整张表的最大值里去找。代表:LC 718、最大子数组和(LC 53)。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "The most common mistake here",
            zh: "这里最常见的错误",
          }}
        >
          <p>
            <T
              en={
                <>
                  Read the problem and ask one question first:{" "}
                  <b>does it need the order kept, or does it need the elements
                  next to each other?</b> &quot;Longest common{" "}
                  <b>subsequence</b>&quot; and &quot;longest common{" "}
                  <b>subarray</b>&quot; differ by one word, and their transitions
                  are not the same (sections 03 and 04 put the pair side by side).
                  Misreading the question means defining the wrong state, and
                  everything after that is wasted work.
                </>
              }
              zh={
                <>
                  拿到题先问一句:<b>它要的是「顺序不乱就行」,还是「必须挨着」?</b>
                  「最长公共<b>子序列</b>」和「最长公共<b>子数组</b>」只差两个字,
                  转移方程却不一样(§03、§04 会把这一对并排拆开)。
                  读错题意就会定错状态,后面写得再对也没用。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 精讲 A · LIS 300 ================= */}
      <Section
        id="lis"
        index="02"
        title={{
          en: "Worked example A · longest increasing subsequence",
          zh: "精讲 A · 最长上升子序列(LIS)",
        }}
        desc={{
          en: "LC 300 — subsequence DP on a single sequence, then the same answer in O(n log n).",
          zh: "LC 300 —— 单序列的子序列 DP,再把同一个答案降到 O(n log n)",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> given an array, find the length of the
                  longest <strong>strictly increasing subsequence</strong>. Gaps
                  are allowed. For [1, 3, 2, 4, 5] the answer is 4, from [1, 3, 4,
                  5] or [1, 2, 4, 5].
                </>
              }
              zh={
                <>
                  <b>题意:</b>给一个数组,求最长的
                  <strong>严格上升子序列</strong>有多长,允许中间有缺口。
                  [1, 3, 2, 4, 5] 的答案是 4,对应 [1, 3, 4, 5] 或 [1, 2, 4, 5]。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>Brute force:</b> each element is either taken or not, so
                  there are 2ⁿ subsequences to check. At n = 40 that is already
                  out of reach. <b>Why DP applies:</b> the problem has{" "}
                  <strong>optimal substructure</strong> — remove the last element
                  of a long increasing subsequence and what remains is still an
                  increasing subsequence. So the real question is{" "}
                  <strong>how to define the state</strong>.
                </>
              }
              zh={
                <>
                  <b>暴力:</b>每个元素选或不选,共 2ⁿ 个子序列要逐个检查 ——
                  n = 40 就已经跑不动了。<b>为什么能用 DP:</b>它有
                  <strong>最优子结构</strong> ——
                  一条上升子序列去掉末尾元素,剩下的仍然是上升子序列。
                  所以真正的问题是<strong>状态怎么定义</strong>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Here is the central technique of subsequence DP:{" "}
                  <strong>anchor the subproblem by its last element</strong>.
                  Define <code>dp[i]</code> as{" "}
                  <strong>the length of the longest increasing subsequence that
                  ends at index i</strong>. Why insist on &quot;ends at i&quot;?
                  Because only a fixed last element lets you ask whether one
                  subsequence can be extended by another: look left for every j
                  with nums[j] &lt; nums[i], take the largest dp[j], and add 1.
                  The base case is dp[i] = 1, since the element alone is already a
                  subsequence. Step through it:
                </>
              }
              zh={
                <>
                  这里有子序列 DP 最核心的技巧:
                  <strong>用末尾元素锚定子问题</strong>。
                  定义 <code>dp[i]</code> ={" "}
                  <strong>以下标 i 结尾的最长上升子序列长度</strong>。
                  为什么非要「以 i 结尾」?因为只有末尾固定下来,
                  才能判断一条子序列能不能再接上一个元素:
                  往左找所有满足 nums[j] &lt; nums[i] 的 j,取最大的 dp[j] 再加 1。
                  初始值是 dp[i] = 1 —— 单个元素本身就是一条子序列。逐格看:
                </>
              }
            />
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
            <T
              en={
                <>
                  Time <b>O(n²)</b>, space O(n). LC 300 can be solved faster with
                  a greedy idea plus binary search, known as{" "}
                  <strong>patience sorting</strong>. Keep an array{" "}
                  <code>tails</code> in which <code>tails[k]</code> is{" "}
                  <strong>the smallest possible last value among all increasing
                  subsequences of length k+1</strong> seen so far. For each new
                  value, use <strong>binary search</strong> (the lower-bound
                  template from Chapter 03) to find the first entry that is ≥ it
                  and replace that entry. If every entry is smaller, append
                  instead. <code>tails</code> stays sorted, and its length is the
                  answer:
                </>
              }
              zh={
                <>
                  时间 <b>O(n²)</b>、空间 O(n)。LC 300 还能更快 ——
                  用一个贪心加二分的做法,叫<strong>耐心排序(patience sorting)</strong>。
                  维护一个数组 <code>tails</code>,其中 <code>tails[k]</code> ={" "}
                  <strong>目前见过的所有长度为 k+1 的上升子序列中,最小的那个结尾值</strong>。
                  每来一个新数,用<strong>二分</strong>(第 3 章的 lower_bound 模板)
                  找到第一个 ≥ 它的位置并替换掉;
                  若所有值都比它小,就追加到末尾。
                  <code>tails</code> 始终有序,它的长度就是答案:
                </>
              }
            />
          </p>
        </div>
        <ArrayStepper
          title={{
            en: "LC 300 · how tails grows (nums = [1, 3, 2, 4, 5])",
            zh: "LC 300 · tails 数组的成长(nums = [1, 3, 2, 4, 5])",
          }}
          frames={F_TAILS}
        />
        <CodeTabs
          title="lc300_lis_nlogn"
          java={LIS_NLOGN.java}
          python={LIS_NLOGN.python}
          js={LIS_NLOGN.js}
        />
        <Callout
          tone="warn"
          title={{
            en: "tails holds a length, not a subsequence",
            zh: "tails 给的是长度,不是子序列",
          }}
        >
          <p>
            <T
              en={
                <>
                  The length of <code>tails</code> is the correct answer, but the
                  values inside it <b>are not a valid subsequence of the input in
                  general</b>. A later replacement can overwrite an entry with a
                  value that appears earlier in the array than the entries to its
                  left. For nums = [3, 4, 1], tails ends as [1, 4], yet 1 comes
                  after 4 in the input. If you also need to reconstruct one actual
                  longest subsequence, record the position each value was placed
                  at and follow those links backwards, or use the O(n²) version,
                  where the predecessor of every cell is available directly.
                </>
              }
              zh={
                <>
                  <code>tails</code> 的长度是正确答案,但里面的值
                  <b>一般不是原数组的一条合法子序列</b>。
                  后来的替换可能写入一个在原数组里位置更靠前的值。
                  例如 nums = [3, 4, 1] 时,tails 最终是 [1, 4],
                  可是 1 在输入里排在 4 后面。
                  如果还要还原出一条真正的最长子序列,
                  就得记录每个值被放到哪个位置、再顺着这些链接回溯;
                  或者干脆用 O(n²) 版本 —— 那里每一格的前驱是现成的。
                </>
              }
            />
          </p>
        </Callout>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Complexity" zh="复杂度对比" />
            </div>
            <div className="card-title">O(n²) → O(n log n)</div>
            <p>
              <T
                en={
                  <>
                    The inner loop that scans everything to the left is replaced
                    by one binary search: n operations, O(log n) each. At n = 10⁵,
                    O(n²) is about 10 billion steps and the binary-search version
                    is under two million.
                  </>
                }
                zh={
                  <>
                    「回头把左侧全扫一遍」的内层循环,被一次二分取代:
                    n 次操作,每次 O(log n)。n = 10⁵ 时,
                    O(n²) 约一百亿步,二分版不到两百万步。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Variant · LC 673" zh="变式 · LC 673" />
            </div>
            <div className="card-title">
              <T en="Counting the longest ones" zh="数一数有几条最长的" />
            </div>
            <p>
              <T
                en={
                  <>
                    Keep cnt[i] next to dp[i]: when a longer subsequence is found,{" "}
                    <b>reset the count</b>; when the same length is matched,{" "}
                    <b>add to it</b>. A main array plus a counting array is the
                    standard shape of a counting DP.
                  </>
                }
                zh={
                  <>
                    在 dp[i] 旁边再挂一个 cnt[i]:发现更长的就<b>重置计数</b>,
                    长度打平就<b>累加计数</b>。
                    「主数组 + 计数数组」是计数型 DP 的通用形状。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Easy to get wrong" zh="易错点" />
            </div>
            <div className="card-title">
              <T
                en="⚠️ The answer is not in the last cell"
                zh="⚠️ 答案不在最后一格"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    dp[i] is about subsequences that <b>end at i</b>, and the
                    longest one does not have to end at the last element. Take the{" "}
                    <b>maximum over the whole dp array</b>.
                  </>
                }
                zh={
                  <>
                    dp[i] 说的是<b>以 i 结尾</b>的子序列,
                    而最长的那条不一定以最后一个元素结尾。
                    答案要取<b>整个 dp 数组的最大值</b>。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="story"
          title={{
            en: "The name \"patience sorting\" comes from a card game",
            zh: "「耐心排序」这个名字,真的来自纸牌游戏",
          }}
        >
          <p>
            <T
              en={
                <>
                  The technique is named after the card game patience, called
                  solitaire in the United States. Deal the cards one at a time and
                  put each card on the leftmost pile whose top card is not smaller
                  than it; if there is no such pile, start a new pile on the right.
                  When the deck is finished, the <b>number of piles</b> equals the
                  length of the longest increasing subsequence. The top cards of
                  the piles, read from left to right, are exactly the{" "}
                  <code>tails</code> array in the code above.
                </>
              }
              zh={
                <>
                  这个技巧得名于纸牌游戏 patience(美国叫 solitaire)。
                  一张张发牌,每张牌放到「牌顶不比它小的最左边一摞」上;
                  没有这样的一摞,就在右边新起一摞。
                  发完之后,<b>摞数</b>正好等于最长上升子序列的长度。
                  从左到右读各摞的牌顶,得到的就是上面代码里的 <code>tails</code> 数组。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="deep"
          title={{
            en: "In practice: diff tools are built on subsequence DP",
            zh: "工程现场:diff 工具就建在子序列 DP 上",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>git diff</code> and text comparison tools look for the
                  longest sequence of lines that both files share in the same
                  order. That is the <b>longest common subsequence</b> of the next
                  section, with whole lines instead of characters. Real diff tools
                  do not fill a plain m×n table. They use refinements such as the
                  Myers algorithm, or Hunt–Szymanski, which turns the LCS problem
                  into an LIS problem and is fast when the two files have few
                  identical lines in common. The question they answer, though, is
                  the one in the next section.
                </>
              }
              zh={
                <>
                  <code>git diff</code> 和各种文本对比工具,
                  找的是两个文件里按相同顺序共有的最长行序列 ——
                  这正是下一节的<b>最长公共子序列</b>,只是把字符换成了整行。
                  真实的 diff 工具不会老老实实填一张 m×n 的表,
                  而是用 Myers 算法这类改进,或者 Hunt–Szymanski ——
                  后者把 LCS 归约成 LIS,在两个文件相同行不多时很快。
                  但它们回答的问题,就是下一节要讲的那个。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 连续型 · 718 ================= */}
      <Section
        id="subarray"
        index="03"
        title={{
          en: "The contiguous case: maximum length of repeated subarray",
          zh: "连续型:最长重复子数组",
        }}
        desc={{
          en: "LC 718 — the first two-dimensional table in this chapter, and the rule that a mismatch resets a cell.",
          zh: "LC 718 —— 本章第一张二维表,先立下「不匹配就归零」这条规矩",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> given two integer arrays A and B, find the
                  length of the longest <strong>contiguous</strong> block that
                  appears in both. It asks for a{" "}
                  <strong>subarray, so the elements must be next to each
                  other</strong>, and that is what fixes the state.
                </>
              }
              zh={
                <>
                  <b>题意:</b>给两个整数数组 A、B,
                  求同时出现在两者中的<strong>连续</strong>段最长有多长。
                  它要的是<strong>子数组,元素必须挨着</strong> ——
                  这一条决定了状态怎么定。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>Brute force:</b> pick a start in A, pick a start in B, and
                  compare forwards, which costs O(m·n·min(m, n)).{" "}
                  <b>The DP:</b> the standard opening for a two-sequence problem
                  is <strong>a two-dimensional table with A along the rows and B
                  along the columns</strong>. Because the block has to be
                  contiguous, the state must{" "}
                  <strong>pin down where the block ends</strong>:{" "}
                  <code>dp[i][j] = the length of the longest common run ending
                  exactly at A[i-1] and B[j-1]</code>. Equal elements extend the
                  run on the diagonal by one.{" "}
                  <strong>Unequal elements break the run, so the cell goes back to
                  0</strong>:
                </>
              }
              zh={
                <>
                  <b>暴力:</b>枚举 A 的起点、枚举 B 的起点,再往后逐位比较,
                  代价 O(m·n·min(m, n))。<b>DP 解法:</b>双序列问题的通用起手是
                  <strong>开一张二维表,行放 A、列放 B</strong>。
                  由于这段必须连续,状态必须<strong>钉住这段在哪里结束</strong>:
                  <code>dp[i][j] = 正好以 A[i-1] 和 B[j-1] 结尾的最长公共连续段长度</code>。
                  两个元素相等,就在对角线的那段连续段上加一;
                  <strong>不相等则连续段断裂,格子回到 0</strong>:
                </>
              }
            />
          </p>
        </div>
        <DPTable
          title={{
            en: "LC 718 · filling the table cell by cell (blue dashed cell = the source; a mismatch resets to 0)",
            zh: "LC 718 · 二维表逐格填充(蓝色虚线格 = 转移来源;不匹配即归零)",
          }}
          frames={F_718}
          colLabels={["∅", "3", "2", "1", "4", "7"]}
          rowLabels={["∅", "1", "2", "3", "2", "1"]}
          cornerLabel="dp"
        />
        <CodeTabs
          title="lc718_max_repeated_subarray"
          java={{
            code: {
              en: `class Solution {
    public int findLength(int[] a, int[] b) {
        int m = a.length, n = b.length, ans = 0;
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++) {
                if (a[i - 1] == b[j - 1])
                    dp[i][j] = dp[i - 1][j - 1] + 1;  // extend the run
                // no else: a Java int[][] starts at 0, which is the reset
                ans = Math.max(ans, dp[i][j]);        // answer is the table max
            }
        return ans;
    }
}`,
              zh: `class Solution {
    public int findLength(int[] a, int[] b) {
        int m = a.length, n = b.length, ans = 0;
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++) {
                if (a[i - 1] == b[j - 1])
                    dp[i][j] = dp[i - 1][j - 1] + 1;  // 接长这段连续段
                // 没有 else:Java 的 int[][] 初值就是 0,归零是自动的
                ans = Math.max(ans, dp[i][j]);        // 答案是整张表的最大值
            }
        return ans;
    }
}`,
            },
            hl: [7, 8],
            note: {
              en: (
                <>
                  There is no <code>else</code> branch, because a Java{" "}
                  <code>int[][]</code> is already filled with 0 and that is
                  exactly the reset value. Remember that the answer is the{" "}
                  <b>maximum over the whole table</b>, not the bottom-right cell.
                </>
              ),
              zh: (
                <>
                  这里没有 <code>else</code> 分支:Java 的 <code>int[][]</code>{" "}
                  初值本来就是 0,而 0 正是要归零的值。
                  注意答案是<b>整张表的最大值</b>,不是右下角。
                </>
              ),
            },
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
            note: {
              en: (
                <>
                  A cell is only written when the two elements are equal;
                  everything else keeps its initial 0. The table can be reduced to
                  a single row, but then the row must be updated{" "}
                  <b>from right to left</b>, because dp[j] reads the previous
                  row&apos;s dp[j-1] and a left-to-right pass would already have
                  overwritten it.
                </>
              ),
              zh: (
                <>
                  只有两个元素相等时才写入,其余格子保持初始的 0。
                  这张表可以压成一行,但那样必须<b>从右往左</b>更新 ——
                  因为 dp[j] 要读上一行的 dp[j-1],从左往右扫会先把它覆盖掉。
                </>
              ),
            },
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
            note: {
              en: (
                <>
                  <code>Array.from</code> builds each row separately. Using{" "}
                  <code>fill</code> with one array would make every row the same
                  object. Time and space are both <b>O(mn)</b>.
                </>
              ),
              zh: (
                <>
                  <code>Array.from</code> 会为每一行单独建数组;
                  用 <code>fill</code> 填同一个数组会让所有行共享同一个对象。
                  时间和空间都是 <b>O(mn)</b>。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="idea"
          title={{
            en: "The zeros carry the information",
            zh: "有信息量的是那些 0",
          }}
        >
          <p>
            <T
              en={
                <>
                  The most informative cells in this table are not the 1s, 2s and
                  3s. They are the <b>zeros</b>. Each 0 says &quot;a run cannot
                  end here&quot;. The diagonal line of 1 → 2 → 3 is one common run
                  growing. In the next section the same pair of sequences is used
                  with the contiguity requirement removed, and those zeros
                  disappear. That is the difference between LC 718 and LCS, seen
                  directly in the table.
                </>
              }
              zh={
                <>
                  整张表里信息量最大的不是那些 1、2、3,而是<b>那些 0</b>:
                  每个 0 都在说「连续段不可能在这里结束」。
                  对角线上 1 → 2 → 3 那条斜线,就是一段公共连续段在生长。
                  下一节把同一对序列去掉「必须连续」的要求,你会看到这些 0 全部消失 ——
                  LC 718 与 LCS 的差别,直接写在表面上。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 精讲 B · LCS 1143 ================= */}
      <Section
        id="lcs"
        index="04"
        title={{
          en: "Worked example B · longest common subsequence",
          zh: "精讲 B · 最长公共子序列(LCS)",
        }}
        desc={{
          en: "LC 1143 — the central table of this chapter, and where the diagonal transition is explained in full.",
          zh: "LC 1143 —— 本章的中心表格,把「对角线转移」讲透",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> given two strings, find the length of their
                  longest <strong>common subsequence</strong>: shared, in the same
                  order, <strong>gaps allowed</strong>. For &quot;abcde&quot; and
                  &quot;ace&quot; the answer is 3, from &quot;ace&quot;.
                </>
              }
              zh={
                <>
                  <b>题意:</b>给两个字符串,求它们最长的
                  <strong>公共子序列</strong>有多长:两边都有、顺序一致、
                  <strong>允许中间有缺口</strong>。
                  「abcde」与「ace」的答案是 3,对应「ace」。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>The DP:</b> the same opening as LC 718 — a two-dimensional
                  table with one string along the rows and the other along the
                  columns. But because the result{" "}
                  <strong>does not have to be contiguous</strong>, the state can
                  be simpler:{" "}
                  <code>dp[i][j] = the length of the longest common subsequence of
                  the first i characters of A and the first j characters of B</code>
                  . Nothing is said about where it ends. The transition only looks
                  at the two last characters:
                </>
              }
              zh={
                <>
                  <b>DP 解法:</b>起手和 LC 718 一样 ——
                  一张二维表,一个串放行、另一个放列。
                  但因为结果<strong>不要求连续</strong>,状态可以更简单:
                  <code>dp[i][j] = A 的前 i 个字符与 B 的前 j 个字符的最长公共子序列长度</code>,
                  完全不提它在哪里结束。转移只看两个末字符:
                </>
              }
            />
          </p>
          <ul>
            <li>
              <T
                en={
                  <>
                    <strong>Equal</strong> → matching this pair is never worse
                    than leaving it out, so use it and add one to the answer for
                    the two shorter prefixes:{" "}
                    <code>dp[i][j] = dp[i-1][j-1] + 1</code>. The{" "}
                    <strong>diagonal</strong> is the only cell that means
                    &quot;both characters consumed as one matched pair&quot;.
                  </>
                }
                zh={
                  <>
                    <strong>相等</strong> → 把这一对配上,不会比不配更差,
                    所以用掉它,并在两段更短前缀的答案上加一:
                    <code>dp[i][j] = dp[i-1][j-1] + 1</code>。
                    <strong>对角线</strong>是唯一表示
                    「两个字符作为一对被同时用掉」的格子。
                  </>
                }
              />
            </li>
            <li>
              <T
                en={
                  <>
                    <strong>Different</strong> → they cannot be a matched pair, so
                    at least one of them is unusable here. Drop A&apos;s last
                    character and you are left with dp[i-1][j]; drop B&apos;s and
                    you are left with dp[i][j-1]. One of the two must be optimal,
                    so keep the larger:{" "}
                    <code>dp[i][j] = max(dp[i-1][j], dp[i][j-1])</code> —{" "}
                    <strong>never a reset</strong>.
                  </>
                }
                zh={
                  <>
                    <strong>不等</strong> → 它们配不成一对,
                    至少有一个在这里用不上。
                    放弃 A 的末字符就剩下 dp[i-1][j],
                    放弃 B 的末字符就剩下 dp[i][j-1];
                    最优解必在两者之一,所以取较大的:
                    <code>dp[i][j] = max(dp[i-1][j], dp[i][j-1])</code> ——
                    <strong>绝不清零</strong>。
                  </>
                }
              />
            </li>
          </ul>
          <p>
            <T
              en={
                <>
                  Base case: row 0 and column 0 are 0, because an empty string
                  shares nothing. Fill the table one cell at a time and watch the{" "}
                  <strong>blue dashed source cells</strong> change between a match
                  and a mismatch:
                </>
              }
              zh={
                <>
                  初始:第 0 行和第 0 列都是 0,因为空串与谁都没有公共部分。
                  逐格填这张表,注意匹配与不匹配时
                  <strong>蓝色虚线来源格</strong>的变化:
                </>
              }
            />
          </p>
        </div>
        <DPTable
          title={{
            en: "LC 1143 · filling the table cell by cell (a match uses the diagonal; a mismatch takes the larger of above and left)",
            zh: "LC 1143 · 二维表逐格填充(蓝虚线格 = 转移来源;匹配走对角线,不匹配取上 / 左较大者)",
          }}
          frames={F_LCS}
          colLabels={["∅", "a", "c", "e"]}
          rowLabels={["∅", "a", "b", "c", "d", "e"]}
          cornerLabel="dp"
        />
        <CodeTabs
          title="lc1143_longest_common_subsequence"
          java={{
            code: {
              en: `class Solution {
    public int longestCommonSubsequence(String s, String t) {
        int m = s.length(), n = t.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++) {
                if (s.charAt(i - 1) == t.charAt(j - 1))
                    dp[i][j] = dp[i - 1][j - 1] + 1;              // diagonal + 1
                else
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); // larger of above/left
            }
        return dp[m][n];
    }
}`,
              zh: `class Solution {
    public int longestCommonSubsequence(String s, String t) {
        int m = s.length(), n = t.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++) {
                if (s.charAt(i - 1) == t.charAt(j - 1))
                    dp[i][j] = dp[i - 1][j - 1] + 1;              // 对角线加一
                else
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); // 取上 / 左较大者
            }
        return dp[m][n];
    }
}`,
            },
            hl: [7, 8, 9, 10],
            note: {
              en: (
                <>
                  <b>The only difference from LC 718 is this <code>else</code>:</b>{" "}
                  LC 718 resets to 0 implicitly, LCS keeps the larger of the two
                  neighbours. Because nothing ever resets, the answer is always
                  the bottom-right cell, dp[m][n].
                </>
              ),
              zh: (
                <>
                  <b>和 LC 718 的唯一差别就是这个 <code>else</code>:</b>
                  LC 718 靠初值隐式归零,LCS 则保留两个邻格里较大的那个。
                  正因为任何时候都不清零,答案总是落在右下角 dp[m][n]。
                </>
              ),
            },
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
            note: {
              en: (
                <>
                  Off-by-one indexing is the most common bug in two-sequence DP.
                  The table has one extra row and one extra column, so{" "}
                  <code>dp[i][j]</code> is about <code>s[i-1]</code> and{" "}
                  <code>t[j-1]</code>.
                </>
              ),
              zh: (
                <>
                  下标错位是双序列 DP 最常见的 bug。
                  表比串多一行一列,所以 <code>dp[i][j]</code> 对应的是{" "}
                  <code>s[i-1]</code> 和 <code>t[j-1]</code>。
                </>
              ),
            },
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
            note: {
              en: (
                <>
                  Time and space are both <b>O(mn)</b>. To recover the actual
                  subsequence, start at dp[m][n] and walk backwards along the
                  cell each value came from. Every diagonal step is one character
                  of the answer.
                </>
              ),
              zh: (
                <>
                  时间和空间都是 <b>O(mn)</b>。
                  要还原出具体的公共子序列,就从 dp[m][n] 出发,
                  沿着「这个值是从哪一格来的」往回走 ——
                  每走一次对角线,就记下一个字符。
                </>
              ),
            },
          }}
        />
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <strong>LC 718 and LC 1143 side by side.</strong> One word in
                  the problem statement, and everything below the third row
                  changes:
                </>
              }
              zh={
                <>
                  <strong>LC 718 与 LC 1143 并排看。</strong>
                  题面上一个词的差别,让第三行以下全部改变:
                </>
              }
            />
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Aspect" zh="维度" />
                </th>
                <th>
                  <T en="LC 718 · subarray" zh="LC 718 · 子数组" />
                </th>
                <th>
                  <T en="LC 1143 · subsequence" zh="LC 1143 · 子序列" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T en="Contiguous?" zh="要连续吗" />
                  </b>
                </td>
                <td>
                  <T en="Yes (a subarray)" zh="要(子数组)" />
                </td>
                <td>
                  <T en="No (a subsequence)" zh="不要(子序列)" />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="What dp[i][j] means" zh="dp[i][j] 的含义" />
                  </b>
                </td>
                <td>
                  <T
                    en="The common run that ends at A[i-1] and B[j-1]"
                    zh="正好以 A[i-1]、B[j-1] 结尾的公共连续段"
                  />
                </td>
                <td>
                  <T
                    en="The LCS of the first i and the first j characters"
                    zh="前 i 个与前 j 个字符的 LCS"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="On a match" zh="匹配时" />
                  </b>
                </td>
                <td>
                  <T
                    en="dp[i-1][j-1] + 1 (diagonal)"
                    zh="dp[i-1][j-1] + 1(对角线)"
                  />
                </td>
                <td>
                  <T
                    en="dp[i-1][j-1] + 1 (diagonal)"
                    zh="dp[i-1][j-1] + 1(对角线)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="On a mismatch" zh="不匹配时" />
                  </b>
                </td>
                <td>
                  <b>
                    <T en="Reset to 0 (the run is broken)" zh="归零(连续段断了)" />
                  </b>
                </td>
                <td>
                  <b>
                    <T
                      en="max(above, left) (skip one character)"
                      zh="max(上, 左)(跳过一个字符)"
                    />
                  </b>
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Where the answer is" zh="答案在哪" />
                  </b>
                </td>
                <td>
                  <T en="The maximum of the whole table" zh="整张表的最大值" />
                </td>
                <td>
                  <T en="The bottom-right cell, dp[m][n]" zh="右下角 dp[m][n]" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="win"
          title={{
            en: "Complexity, and the follow-up questions",
            zh: "复杂度与常见追问",
          }}
        >
          <p>
            <T
              en={
                <>
                  There are (m+1)(n+1) states and each transition is O(1), so the
                  time is <b>O(mn)</b> and the table itself is <b>O(mn)</b> space.
                  The space can be reduced to O(min(m, n)) by keeping only one
                  row, with the shorter string along the columns — but{" "}
                  <b>not for free</b>. The transition also reads the diagonal
                  dp[i-1][j-1], which a left-to-right pass overwrites before it is
                  used, so that value must be{" "}
                  <b>saved in a temporary variable before the cell is
                  assigned</b>. Common follow-ups: (1) print the subsequence
                  itself → walk backwards from the bottom-right cell; (2) what is
                  LC 1035, uncrossed lines? → the same problem in different words,
                  with no change to the code (see the problem set); (3) how does
                  it differ from LC 718? → the mismatch row of the table above.
                </>
              }
              zh={
                <>
                  共 (m+1)(n+1) 个状态、每格转移 O(1),
                  时间 <b>O(mn)</b>,表本身占 <b>O(mn)</b> 空间。
                  把较短的串放在列上、只保留一行,空间可以压到 O(min(m, n)),
                  但<b>不是白送的</b>:转移还要读对角线 dp[i-1][j-1],
                  而从左往右扫会在用到它之前就把它覆盖 ——
                  必须<b>在写入这一格之前,先把那个值存进临时变量</b>。
                  常见追问:①「把那条公共子序列打印出来」→ 从右下角回溯来源;
                  ②「LC 1035 不相交的线是什么」→ 换个说法的同一道题,代码一行不用改
                  (见题单);③「和 LC 718 差在哪」→ 上表「不匹配时」那一行。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 精讲 C · 编辑距离 72 ================= */}
      <Section
        id="edit"
        index="05"
        title={{
          en: "Worked example C · edit distance",
          zh: "精讲 C · 编辑距离",
        }}
        desc={{
          en: "LC 72 — one cell, three source cells, and each one is a different operation.",
          zh: "LC 72 —— 一格三个来源,每个来源对应一种不同的操作",
        }}
        badge={<span className="lc-badge" data-d="hard">HARD</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> turn word1 into word2. Each step may{" "}
                  <strong>insert, delete, or replace</strong> one character. Find
                  the fewest steps. For &quot;horse&quot; → &quot;ros&quot; the
                  answer is 3.
                </>
              }
              zh={
                <>
                  <b>题意:</b>把 word1 改成 word2,
                  每一步可以<strong>插入、删除或替换</strong>一个字符,
                  求最少步数。「horse」→「ros」的答案是 3。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>The DP:</b> the same table again.{" "}
                  <code>dp[i][j] = the fewest operations that turn the first i
                  characters of word1 into the first j characters of word2</code>.
                  What is new is that a mismatch has{" "}
                  <strong>three source cells instead of two</strong>. Stand on
                  dp[i][j] and ask what the last operation was:
                </>
              }
              zh={
                <>
                  <b>DP 解法:</b>还是那张表。
                  <code>dp[i][j] = 把 word1 的前 i 个字符变成 word2 的前 j 个字符所需的最少操作数</code>。
                  新东西是:不匹配时有<strong>三个来源格,而不是两个</strong>。
                  站在 dp[i][j] 上问一句「最后一步做了什么」:
                </>
              }
            />
          </p>
          <div style={{ margin: "6px 0 2px" }}>
            <span className="seq-op">
              <T en="replace = dp[i-1][j-1] + 1" zh="替换 = dp[i-1][j-1] + 1" />
            </span>
            <span className="seq-op">
              <T en="delete = dp[i-1][j] + 1" zh="删除 = dp[i-1][j] + 1" />
            </span>
            <span className="seq-op">
              <T en="insert = dp[i][j-1] + 1" zh="插入 = dp[i][j-1] + 1" />
            </span>
          </div>
          <ul>
            <li>
              <T
                en={
                  <>
                    <strong>Replace</strong>: change the i-th character of word1
                    into the j-th character of word2. Both last characters are
                    consumed at once, which leaves{" "}
                    <code>dp[i-1][j-1]</code> — the cell on the{" "}
                    <strong>diagonal</strong>.
                  </>
                }
                zh={
                  <>
                    <strong>替换</strong>:把 word1 的第 i 个字符改成 word2 的第 j 个。
                    两边的末字符同时被消化掉,剩下{" "}
                    <code>dp[i-1][j-1]</code> —— <strong>对角线</strong>那一格。
                  </>
                }
              />
            </li>
            <li>
              <T
                en={
                  <>
                    <strong>Delete</strong>: remove the i-th character of word1.
                    word1 gets one shorter and word2 is untouched, which leaves{" "}
                    <code>dp[i-1][j]</code> — the cell <strong>above</strong>.
                  </>
                }
                zh={
                  <>
                    <strong>删除</strong>:删掉 word1 的第 i 个字符。
                    word1 短了一位,word2 没变,剩下{" "}
                    <code>dp[i-1][j]</code> —— <strong>上方</strong>那一格。
                  </>
                }
              />
            </li>
            <li>
              <T
                en={
                  <>
                    <strong>Insert</strong>: append the j-th character of word2 to
                    word1. That character is now matched, so one more character of
                    word2 is handled and word1 is otherwise unchanged, which
                    leaves <code>dp[i][j-1]</code> — the cell on the{" "}
                    <strong>left</strong>.
                  </>
                }
                zh={
                  <>
                    <strong>插入</strong>:在 word1 末尾补上 word2 的第 j 个字符。
                    这个字符当场被匹配掉,word2 少了一位,word1 其余部分不变,
                    剩下 <code>dp[i][j-1]</code> —— <strong>左方</strong>那一格。
                  </>
                }
              />
            </li>
          </ul>
          <p>
            <T
              en={
                <>
                  When the two last characters are already{" "}
                  <strong>equal</strong>, no operation is needed: copy{" "}
                  <code>dp[i-1][j-1]</code> without adding anything. Watch the
                  three sources light up together on every mismatch:
                </>
              }
              zh={
                <>
                  当两个末字符本来就<strong>相等</strong>时不需要任何操作:
                  直接抄 <code>dp[i-1][j-1]</code>,一步都不加。
                  注意每次不匹配时三个来源格会同时高亮:
                </>
              }
            />
          </p>
        </div>
        <DPTable
          title={{
            en: "LC 72 · filling the table cell by cell (mismatch: diagonal = replace, above = delete, left = insert)",
            zh: "LC 72 · 二维表逐格填充(不匹配时:对角 = 替换,上 = 删除,左 = 插入,取最小再加一)",
          }}
          frames={F_72}
          colLabels={["∅", "r", "o", "s"]}
          rowLabels={["∅", "h", "o", "r", "s", "e"]}
          cornerLabel="dp"
        />
        <CodeTabs
          title="lc72_edit_distance"
          java={{
            code: {
              en: `class Solution {
    public int minDistance(String a, String b) {
        int m = a.length(), n = b.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i;   // delete all of a
        for (int j = 0; j <= n; j++) dp[0][j] = j;   // insert all of b
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1))
                    dp[i][j] = dp[i - 1][j - 1];             // equal, no cost
                else
                    dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], // replace
                                   Math.min(dp[i - 1][j],     // delete
                                            dp[i][j - 1]));   // insert
            }
        return dp[m][n];
    }
}`,
              zh: `class Solution {
    public int minDistance(String a, String b) {
        int m = a.length(), n = b.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i;   // 把 a 全删空
        for (int j = 0; j <= n; j++) dp[0][j] = j;   // 从空串增出 b
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1))
                    dp[i][j] = dp[i - 1][j - 1];             // 相等,不加操作
                else
                    dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], // 替换
                                   Math.min(dp[i - 1][j],     // 删除
                                            dp[i][j - 1]));   // 插入
            }
        return dp[m][n];
    }
}`,
            },
            hl: [11, 12, 13, 14],
            note: {
              en: (
                <>
                  <b>Common mistake:</b> forgetting the two boundary loops.{" "}
                  <code>dp[i][0] = i</code> and <code>dp[0][j] = j</code> are the
                  costs of deleting everything and of inserting everything. If
                  they are left at 0, every later cell is wrong.
                </>
              ),
              zh: (
                <>
                  <b>常见错误:</b>漏掉两条边界循环。
                  <code>dp[i][0] = i</code> 和 <code>dp[0][j] = j</code>{" "}
                  分别是「全部删掉」和「全部插入」的代价;
                  留成 0 的话,后面每一格都是错的。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def minDistance(self, a: str, b: str) -> int:
        m, n = len(a), len(b)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m + 1):
            dp[i][0] = i                      # delete all of a
        for j in range(n + 1):
            dp[0][j] = j                      # insert all of b
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if a[i - 1] == b[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]            # equal, no cost
                else:
                    dp[i][j] = 1 + min(dp[i - 1][j - 1],   # replace
                                       dp[i - 1][j],       # delete
                                       dp[i][j - 1])       # insert
        return dp[m][n]`,
              zh: `class Solution:
    def minDistance(self, a: str, b: str) -> int:
        m, n = len(a), len(b)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m + 1):
            dp[i][0] = i                      # 把 a 全删空
        for j in range(n + 1):
            dp[0][j] = j                      # 从空串增出 b
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if a[i - 1] == b[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]            # 相等,不加操作
                else:
                    dp[i][j] = 1 + min(dp[i - 1][j - 1],   # 替换
                                       dp[i - 1][j],       # 删除
                                       dp[i][j - 1])       # 插入
        return dp[m][n]`,
            },
            hl: [13, 14, 15, 16],
            note: {
              en: (
                <>
                  Python&apos;s <code>min</code> takes all three arguments at
                  once, so the three operations fit on one expression. The three
                  source cells are the diagonal, the one above, and the one on the
                  left, matching the three highlighted cells in the animation.
                </>
              ),
              zh: (
                <>
                  Python 的 <code>min</code> 可以直接吃三个参数,
                  三种操作写在一个表达式里。
                  三个来源格分别是对角、上方、左方,
                  和动画里同时高亮的那三格一一对应。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var minDistance = function (a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;   // delete all of a
  for (let j = 0; j <= n; j++) dp[0][j] = j;   // insert all of b
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
};`,
              zh: `var minDistance = function (a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;   // 把 a 全删空
  for (let j = 0; j <= n; j++) dp[0][j] = j;   // 从空串增出 b
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
};`,
            },
            hl: [8, 9],
            note: {
              en: (
                <>
                  Time and space are both <b>O(mn)</b>. When the characters are
                  equal the cost is copied with no <code>+ 1</code>; adding one
                  there is the most common error in this problem. A single rolling
                  row also works here, but the diagonal value must be saved in a
                  temporary variable before the cell is overwritten.
                </>
              ),
              zh: (
                <>
                  时间和空间都是 <b>O(mn)</b>。字符相等时是直接抄、
                  <b>不加</b> <code>+ 1</code> —— 顺手写成 +1 是这题最常见的错误。
                  这里同样可以只滚动一行,但必须先把对角线的值存进临时变量,
                  再覆盖当前格。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "In practice: spell checking and DNA alignment use this table",
            zh: "工程现场:拼写检查与 DNA 比对用的就是这张表",
          }}
        >
          <p>
            <T
              en={
                <>
                  Edit distance, also called Levenshtein distance, is a general
                  measure of how similar two sequences are. Search boxes and input
                  methods use it to rank <b>&quot;did you mean …&quot;</b>{" "}
                  suggestions. In bioinformatics, aligning DNA or protein
                  sequences (the Needleman–Wunsch algorithm) is the same table
                  with a score for each operation instead of a fixed cost of 1.
                  Line-level <code>git</code> diffs, fuzzy finders such as fzf, and
                  plagiarism checks all rest on this insert-delete-replace DP.
                </>
              }
              zh={
                <>
                  编辑距离(又叫 Levenshtein 距离)是衡量「两个序列有多像」的通用尺子。
                  搜索框和输入法用它给<b>「你是不是想搜……」</b>的候选排序;
                  生物信息学里比对 DNA 或蛋白质序列(Needleman–Wunsch 算法)
                  就是同一张表,只是把固定代价 1 换成了每种操作各自的分数;
                  <code>git</code> 的行级 diff、fzf 之类的模糊搜索、查重系统,
                  底层都是这套「增删改」DP。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 回文家族 ================= */}
      <Section
        id="palindrome"
        index="06"
        title={{
          en: "Palindromes: expand outwards, or shrink inwards",
          zh: "回文家族:向外扩,还是向内缩",
        }}
        desc={{
          en: "LC 5 / 516 / 647 / 132 — the last piece of subsequence DP, and the entry point to interval DP.",
          zh: "LC 5 / 516 / 647 / 132 —— 子序列 DP 的最后一块拼图,也是区间 DP 的入口",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  A palindrome <strong>reads the same forwards and
                  backwards</strong>. There are two complementary ways to work
                  with one:
                </>
              }
              zh={
                <>
                  回文就是<strong>正着读和反着读一样</strong>。
                  处理回文有两种互补的视角:
                </>
              }
            />
          </p>
          <div className="seq-duo">
            <div className="card">
              <div className="card-kicker">
                <T en="View 1 · expand from a centre" zh="视角一 · 中心扩展(向外)" />
              </div>
              <div className="card-title">
                <T
                  en="Try every centre, move both ends outwards"
                  zh="枚举中心,两端同时向外"
                />
              </div>
              <p>
                <T
                  en={
                    <>
                      A palindrome is symmetric about its centre, so try all{" "}
                      <b>2n−1 centres</b>: n single characters for odd lengths and
                      n−1 gaps between neighbouring characters for even lengths.
                      From each centre, move outwards while the two ends match.
                      O(n²) time, <b>O(1) extra space</b>. Best for{" "}
                      <b>substring</b> problems, which need contiguity: LC 5, LC
                      647.
                    </>
                  }
                  zh={
                    <>
                      回文关于中心对称,所以把 <b>2n−1 个中心</b>都试一遍:
                      n 个单字符中心对应奇数长度,
                      n−1 个「相邻字符之间的缝隙」对应偶数长度。
                      从每个中心出发,两端相等就继续向外走。
                      时间 O(n²)、<b>额外空间 O(1)</b>。
                      最适合要求连续的<b>子串</b>题:LC 5、LC 647。
                    </>
                  }
                />
              </p>
            </div>
            <div className="card">
              <div className="card-kicker">
                <T en="View 2 · interval DP" zh="视角二 · 区间 DP(向内)" />
              </div>
              <div className="card-title">
                <T
                  en="dp[i][j] describes one interval"
                  zh="dp[i][j] 描述的是一段区间"
                />
              </div>
              <p>
                <T
                  en={
                    <>
                      dp[i][j] states something about the substring s[i..j]:
                      whether it is a palindrome, or how long its longest
                      palindromic subsequence is. The transition compares the two
                      ends s[i] and s[j] and reads{" "}
                      <b>the shorter interval inside it</b>, dp[i+1][j-1]. That
                      dependency <b>forces the iteration order</b>: fill by
                      increasing interval length, or let i run from high to low so
                      that row i+1 is finished first. This is the entry point to{" "}
                      <b>interval DP in Chapter 10</b>, and it is what LC 516
                      needs.
                    </>
                  }
                  zh={
                    <>
                      dp[i][j] 描述子串 s[i..j] 的性质:
                      它是否回文,或者它的最长回文子序列有多长。
                      转移比较两端 s[i] 与 s[j],并读取
                      <b>被它包住的更短区间</b> dp[i+1][j-1]。
                      这条依赖<b>直接决定了遍历顺序</b>:
                      要么按区间长度从短到长填,要么让 i 从大到小走,
                      保证第 i+1 行先算完。
                      这就是<b>第 10 章区间 DP</b> 的入口,也是 LC 516 需要的写法。
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <p>
            <T
              en={
                <>
                  Start with <strong>expanding from a centre</strong>, which LC 5
                  (longest palindromic substring) and LC 647 (counting
                  palindromic substrings) both use:
                </>
              }
              zh={
                <>
                  先看最直观的<strong>中心扩展</strong>,
                  LC 5(最长回文子串)和 LC 647(回文子串计数)共用它:
                </>
              }
            />
          </p>
        </div>
        <ArrayStepper
          title={{
            en: "Expanding from a centre (s = \"abcba\", odd centre at index 2)",
            zh: "回文中心扩展(s = 「abcba」,以下标 2 为奇数中心)",
          }}
          frames={F_CENTER}
        />
        <CodeTabs
          title="lc5_longest_palindrome_substring"
          java={{
            code: {
              en: `class Solution {
    private int start = 0, maxLen = 1;

    public String longestPalindrome(String s) {
        if (s.length() < 2) return s;
        for (int i = 0; i < s.length(); i++) {
            expand(s, i, i);       // odd length: centre is one character
            expand(s, i, i + 1);   // even length: centre is the gap
        }
        return s.substring(start, start + maxLen);
    }

    private void expand(String s, int l, int r) {
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
            l--; r++;              // ends match, keep moving outwards
        }
        int len = r - l - 1;       // on exit the palindrome is [l+1, r-1]
        if (len > maxLen) { maxLen = len; start = l + 1; }
    }
}`,
              zh: `class Solution {
    private int start = 0, maxLen = 1;

    public String longestPalindrome(String s) {
        if (s.length() < 2) return s;
        for (int i = 0; i < s.length(); i++) {
            expand(s, i, i);       // 奇数长度:中心是一个字符
            expand(s, i, i + 1);   // 偶数长度:中心是字符间的缝隙
        }
        return s.substring(start, start + maxLen);
    }

    private void expand(String s, int l, int r) {
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
            l--; r++;              // 两端相等,继续向外走
        }
        int len = r - l - 1;       // 退出时回文区间是 [l+1, r-1]
        if (len > maxLen) { maxLen = len; start = l + 1; }
    }
}`,
            },
            hl: [7, 8],
            note: {
              en: (
                <>
                  <b>Common mistake:</b> testing only odd centres. Also note that
                  when the loop exits, l and r have each moved one step too far,
                  so the palindrome is <code>[l+1, r-1]</code> and its length is{" "}
                  <code>r - l - 1</code>. That off-by-one is easy to get wrong.
                </>
              ),
              zh: (
                <>
                  <b>常见错误:</b>只试了奇数中心。
                  另外,循环退出时 l 和 r 都已经多走了一步,
                  真正的回文区间是 <code>[l+1, r-1]</code>,
                  长度为 <code>r - l - 1</code> —— 这个 ±1 很容易写错。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        res = ""
        def expand(l: int, r: int) -> str:
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            return s[l + 1 : r]        # on exit [l+1, r-1] is the palindrome
        for i in range(len(s)):
            for cand in (expand(i, i), expand(i, i + 1)):  # odd / even centre
                if len(cand) > len(res):
                    res = cand
        return res`,
              zh: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        res = ""
        def expand(l: int, r: int) -> str:
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            return s[l + 1 : r]        # 退出时 [l+1, r-1] 就是回文
        for i in range(len(s)):
            for cand in (expand(i, i), expand(i, i + 1)):  # 奇 / 偶中心
                if len(cand) > len(res):
                    res = cand
        return res`,
            },
            hl: [10],
            note: {
              en: (
                <>
                  The slice <code>s[l+1:r]</code> is half-open on the right, which
                  is exactly the palindrome range, so the length calculation
                  disappears. Python slicing absorbs the off-by-one.
                </>
              ),
              zh: (
                <>
                  切片 <code>s[l+1:r]</code> 右端开区间,正好就是回文的范围,
                  连长度计算都省了 —— Python 的切片语义天然吃掉了那个 ±1。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var longestPalindrome = function (s) {
  let start = 0, maxLen = 1;
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    if (r - l - 1 > maxLen) { maxLen = r - l - 1; start = l + 1; }
  };
  for (let i = 0; i < s.length; i++) {
    expand(i, i);       // odd centre
    expand(i, i + 1);   // even centre
  }
  return s.substring(start, start + maxLen);
};`,
              zh: `var longestPalindrome = function (s) {
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
            },
            hl: [8, 9],
            note: {
              en: (
                <>
                  <b>LC 647 only changes what is recorded:</b> instead of keeping
                  the longest, add one to a counter on every successful expansion
                  step. Same skeleton, one measures a maximum and the other a
                  total.
                </>
              ),
              zh: (
                <>
                  <b>LC 647 只需改「记什么」:</b>
                  把「记录最长」换成「每成功扩一步就计数加一」。
                  骨架完全一样,一个求最大值,一个求总数。
                </>
              ),
            },
          }}
        />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            <T
              en={
                <>
                  Now LC 516, the longest palindromic{" "}
                  <strong>subsequence</strong>, from the interval DP side. There
                  is a shortcut worth knowing:{" "}
                  <strong>the longest palindromic subsequence of s is the longest
                  common subsequence of s and reverse(s)</strong>, so the code
                  from the previous section solves it unchanged. Writing the
                  interval DP directly also works, and it shows the{" "}
                  <strong>iteration order</strong> that Chapter 10 is built on: i
                  runs from high to low, j from low to high, because dp[i][j]
                  reads dp[i+1][…].
                </>
              }
              zh={
                <>
                  再看 LC 516 最长回文<strong>子序列</strong>,
                  从区间 DP 的角度。有一条值得知道的捷径:
                  <strong>s 的最长回文子序列,就是 s 与 reverse(s) 的最长公共子序列</strong>,
                  所以上一节的代码原封不动就能解它。
                  直接写区间 DP 也可以,而且能看清第 10 章要用的
                  <strong>遍历顺序</strong>:i 从大到小、j 从小到大 ——
                  因为 dp[i][j] 要读 dp[i+1][…]。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc516_longest_palindromic_subsequence"
          java={{
            code: {
              en: `class Solution {
    public int longestPalindromeSubseq(String s) {
        int n = s.length();
        int[][] dp = new int[n][n];
        for (int i = n - 1; i >= 0; i--) {    // i from high to low
            dp[i][i] = 1;                     // one character is a palindrome
            for (int j = i + 1; j < n; j++) { // j from low to high
                if (s.charAt(i) == s.charAt(j))
                    dp[i][j] = dp[i + 1][j - 1] + 2;      // both ends pair up
                else
                    dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
            }
        }
        return dp[0][n - 1];
    }
}`,
              zh: `class Solution {
    public int longestPalindromeSubseq(String s) {
        int n = s.length();
        int[][] dp = new int[n][n];
        for (int i = n - 1; i >= 0; i--) {    // i 从大到小
            dp[i][i] = 1;                     // 单个字符就是回文
            for (int j = i + 1; j < n; j++) { // j 从小到大
                if (s.charAt(i) == s.charAt(j))
                    dp[i][j] = dp[i + 1][j - 1] + 2;      // 两端配成一对
                else
                    dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
            }
        }
        return dp[0][n - 1];
    }
}`,
            },
            hl: [5, 7],
            note: {
              en: (
                <>
                  <b>The loop order is not a matter of taste.</b> dp[i][j] reads{" "}
                  <code>dp[i+1][…]</code>, which is the row below it, so row i+1
                  must be complete before row i starts, and i has to run{" "}
                  <b>downwards</b>. Filling by increasing interval length works
                  for the same reason. Chapter 10 covers this in full.
                </>
              ),
              zh: (
                <>
                  <b>循环顺序不是随便挑的。</b>dp[i][j] 要读{" "}
                  <code>dp[i+1][…]</code>,也就是下面那一行,
                  所以第 i+1 行必须先算完,i 只能<b>倒着走</b>。
                  按区间长度从短到长填,道理完全相同。第 10 章会细讲。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def longestPalindromeSubseq(self, s: str) -> int:
        n = len(s)
        dp = [[0] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):        # i from high to low
            dp[i][i] = 1
            for j in range(i + 1, n):         # j from low to high
                if s[i] == s[j]:
                    dp[i][j] = dp[i + 1][j - 1] + 2
                else:
                    dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
        return dp[0][n - 1]`,
              zh: `class Solution:
    def longestPalindromeSubseq(self, s: str) -> int:
        n = len(s)
        dp = [[0] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):        # i 从大到小
            dp[i][i] = 1
            for j in range(i + 1, n):         # j 从小到大
                if s[i] == s[j]:
                    dp[i][j] = dp[i + 1][j - 1] + 2
                else:
                    dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
        return dp[0][n - 1]`,
            },
            hl: [5, 7],
            note: {
              en: (
                <>
                  <b>The one-line version:</b>{" "}
                  <code>return LCS(s, s[::-1])</code>, reusing LC 1143. A
                  palindromic subsequence of s is a subsequence shared by s and
                  its reverse.
                </>
              ),
              zh: (
                <>
                  <b>一行版:</b><code>return LCS(s, s[::-1])</code>,直接复用 LC 1143。
                  s 的回文子序列,就是 s 和它的反转共有的子序列。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var longestPalindromeSubseq = function (s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {       // i from high to low
    dp[i][i] = 1;
    for (let j = i + 1; j < n; j++) {      // j from low to high
      if (s[i] === s[j]) dp[i][j] = dp[i + 1][j - 1] + 2;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
  }
  return dp[0][n - 1];
};`,
              zh: `var longestPalindromeSubseq = function (s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {       // i 从大到小
    dp[i][i] = 1;
    for (let j = i + 1; j < n; j++) {      // j 从小到大
      if (s[i] === s[j]) dp[i][j] = dp[i + 1][j - 1] + 2;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
  }
  return dp[0][n - 1];
};`,
            },
            hl: [4, 6],
            note: {
              en: (
                <>
                  Time and space are both <b>O(n²)</b>. Do not confuse this with
                  LC 5, the longest palindromic <b>substring</b>, which must be
                  contiguous. LC 516 asks for a <b>subsequence</b>, so characters
                  may be skipped.
                </>
              ),
              zh: (
                <>
                  时间和空间都是 <b>O(n²)</b>。
                  别和 LC 5(最长回文<b>子串</b>,必须连续)搞混:
                  LC 516 求的是<b>子序列</b>,可以跳过字符。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Going further · LC 132, palindrome partitioning II",
            zh: "再进一步 · LC 132 分割回文串 II",
          }}
        >
          <p>
            <T
              en={
                <>
                  What happens when palindromes meet partitioning: cut the string
                  into pieces so that every piece is a palindrome, using the{" "}
                  <b>fewest cuts</b>. The approach is <b>two DPs stacked</b>.
                  First, interval DP builds <code>isPal[i][j]</code>, a table that
                  answers &quot;is s[i..j] a palindrome&quot; in O(1). Then a
                  one-dimensional DP over the cuts: <code>dp[i] = min(dp[j] + 1)</code>{" "}
                  over every j for which s[j..i-1] is a palindrome. Building a
                  lookup table first and running the main DP on top of it is a
                  common combination, and worth practising once the main line
                  feels stable.
                </>
              }
              zh={
                <>
                  当回文遇上分割:把字符串切成若干段、每段都是回文,
                  求<b>最少切几刀</b>。做法是<b>两层 DP 叠在一起</b>。
                  先用区间 DP 算出 <code>isPal[i][j]</code>,
                  让「s[i..j] 是否回文」变成 O(1) 查询;
                  再做一维的分割 DP:<code>dp[i] = min(dp[j] + 1)</code>,
                  其中 j 取遍所有使 s[j..i-1] 为回文的位置。
                  「先预处理一张判定表,再在表上跑主 DP」是很常见的组合,
                  等主线内容熟了之后值得专门练一次。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title={{
          en: "Problem set: 12 subsequence DP problems",
          zh: "高频题单:子序列 DP 12 题",
        }}
        desc={{
          en: "Grouped as subsequence checking, LIS, contiguous, two sequences, and palindromes, from easier to harder. Think for 30 seconds before opening the hint.",
          zh: "按「子序列判定 → LIS → 连续型 → 双序列 → 回文」分层,由易到难。先想 30 秒再看提示",
        }}
        badge={
          <span className="chip">
            <T en="Core set" zh="主线必做" />
          </span>
        }
      >
        <ProblemSet ch="dp-seq" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Answer all 7 correctly to mark this chapter as complete.",
          zh: "7 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="dp-seq" items={QUIZ} />
      </Section>

      <KeyPoints
        points={{
          en: [
            <>
              The first fork: <b>a subsequence may skip elements, a subarray or
              substring may not</b>. Decide which one the problem wants before
              defining the state, because it decides whether a mismatch{" "}
              <b>resets the cell to 0</b> or <b>keeps the larger neighbour</b>.
            </>,
            <>
              On a single sequence (LIS), <b>anchor the subproblem by its last
              element</b>: dp[i] is the length of the longest increasing
              subsequence <b>ending at index i</b>. The price of that choice is
              that the answer is the <b>maximum of the whole array</b>, not
              dp[n-1].
            </>,
            <>
              LIS drops from <b>O(n²)</b> to <b>O(n log n)</b> with tails, where
              tails[k] is the smallest possible last value of an increasing
              subsequence of length k+1, plus a binary search. Its{" "}
              <b>length</b> is the answer; its <b>contents</b> are not a
              subsequence of the input.
            </>,
            <>
              The skeleton for two sequences: <b>one table, one string along the
              rows and the other along the columns</b>. A match always goes to
              the <b>diagonal, dp[i-1][j-1]</b>. All the differences between
              these problems are in the mismatch case.
            </>,
            <>
              The pair to remember: <b>LC 718 resets to 0</b> on a mismatch
              (contiguous), <b>LC 1143 takes max(above, left)</b> (not
              contiguous), and <b>LC 72 has one more source</b> (diagonal =
              replace, above = delete, left = insert, take the smallest and add
              one).
            </>,
            <>
              Two views on palindromes: <b>expand from a centre</b> (outwards,
              O(1) extra space, for substrings — LC 5, LC 647) and{" "}
              <b>interval DP</b> (inwards, dp[i][j], for subsequences — LC 516).
              Also, <b>the longest palindromic subsequence of s is LCS(s,
              reverse(s))</b>.
            </>,
            <>
              The iteration order comes from the transition. Interval DP reads
              dp[i+1][j-1], so i must run downwards or the table must be filled
              by increasing interval length. Complexity is{" "}
              <b>(number of states) × (work per transition)</b>, and the table
              counts in the space. A rolling row is safe only when the transition
              reads the previous row alone; if it also reads the diagonal, save
              that value before overwriting the cell.
            </>,
            <>
              The most common bug in two-sequence DP is <b>off-by-one
              indexing</b>. The table has one extra row and column, so{" "}
              <b>dp[i][j] is about s[i-1] and t[j-1]</b>, and the empty-string
              row and column must be filled first.
            </>,
          ],
          zh: [
            <>
              第一个分岔口:<b>子序列可以跳过元素,子数组 / 子串不行</b>。
              定状态之前先判断题目要哪一种 ——
              它决定了不匹配时是<b>把格子归零</b>还是<b>保留较大的邻格</b>。
            </>,
            <>
              单序列(LIS)的做法是<b>用末尾元素锚定子问题</b>:
              dp[i] = <b>以下标 i 结尾</b>的最长上升子序列长度。
              代价是答案要取<b>整个数组的最大值</b>,而不是 dp[n-1]。
            </>,
            <>
              LIS 可以从 <b>O(n²)</b> 降到 <b>O(n log n)</b>:
              维护 tails(tails[k] = 长度为 k+1 的上升子序列中最小的结尾值)加二分。
              它的<b>长度</b>是答案,但它的<b>内容</b>不是原数组的子序列。
            </>,
            <>
              双序列的通用骨架:<b>一张表,一个串放行、另一个放列</b>。
              匹配时一律走<b>对角线 dp[i-1][j-1]</b>,
              这几道题的全部差别都在「不匹配」那一格。
            </>,
            <>
              要记住的这一组:不匹配时 <b>LC 718 归零</b>(连续),
              <b>LC 1143 取 max(上, 左)</b>(不连续),
              <b>LC 72 多一个来源</b>(对角 = 替换、上 = 删除、左 = 插入,取最小再加一)。
            </>,
            <>
              回文的两种视角:<b>中心扩展</b>(向外,额外空间 O(1),适合子串 —— LC 5、LC 647)
              与<b>区间 DP</b>(向内,dp[i][j],适合子序列 —— LC 516)。
              另外,<b>s 的最长回文子序列 = LCS(s, reverse(s))</b>。
            </>,
            <>
              遍历顺序由转移决定:区间 DP 要读 dp[i+1][j-1],
              所以 i 必须倒序,或者按区间长度从短到长填。
              复杂度是<b>状态数 × 单次转移代价</b>,空间要把表本身算进去。
              只有当转移仅读上一行时,滚动一行才是安全的;
              若它还要读对角线,就得在覆盖当前格之前先把那个值存下来。
            </>,
            <>
              双序列 DP 最常见的 bug 是<b>下标错位</b>:
              表比串多一行一列,所以 <b>dp[i][j] 对应的是 s[i-1] 与 t[j-1]</b>,
              空串那一行一列必须先填对。
            </>,
          ],
        }}
      />

      <ChapterFooter ch="dp-seq" />
    </main>
  );
}
