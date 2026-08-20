"use client";

// 第 7 章 · 动态规划入门 —— 全书样板章。
// 九段式结构:直觉(递归树看重复)→ 记忆化 → 递推 + 精讲 A(爬楼梯)→
// 五步法 → 网格 DP + 精讲 B(不同路径)→ 打家劫舍 + 精讲 C →
// 贪心失效 + 精讲 D(零钱兑换)→ 题单 → 测验 → 要点。
// DP 表格动画统一用 lib/algviz 的 DPTable;递归树用 TreePlayer(见 ./viz)。
//
// 双语:正文用 <T en zh />;组件的文案型 props 传 { en, zh }。
// CodeTabs 的 code 也给两份 —— 两份之间只有注释不同,可执行代码逐行一致(hl 行号才对得上)。

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
import { DPTable, type DPFrame, type DPCell } from "@/lib/algviz";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { T } from "@/lib/i18n";
import { PROBLEMS, QUIZ } from "@/lib/dp-data";
import { FibNaiveTree, FibMemoTree, RobLab } from "./viz";

/* ================= 精讲 A · LC 70 爬楼梯:一维表逐格填充 ================= */

const CLIMB_VALS = [1, 2, 3, 5, 8, 13]; // dp[1..6]

const CLIMB_COLS = {
  en: ["i=1", "i=2", "i=3", "i=4", "i=5", "i=6"],
  zh: ["1 阶", "2 阶", "3 阶", "4 阶", "5 阶", "6 阶"],
};

function climbCells(upto: number, cur?: number, srcs?: number[], final = false): DPCell[][] {
  const row: DPCell[] = CLIMB_VALS.map((v, idx) => {
    const i = idx + 1;
    if (cur === i) return { v, state: "cur" };
    if (srcs?.includes(i)) return { v, state: "src" };
    if (i <= upto) return { v, state: final && i === 6 ? "ok" : "done" };
    return { v: "?", state: "ghost" };
  });
  return [row];
}

const F_CLIMB: DPFrame[] = [
  {
    cells: climbCells(0),
    msg: (
      <T
        en={
          <>
            State first: <b>dp[i] is the number of distinct ways to reach step i</b>.
            Every cell is still unknown. The job is to fill them from left to right.
          </>
        }
        zh={
          <>
            先立状态:<b>dp[i] = 爬到第 i 阶的方案数</b>。
            现在整张表都还是问号,接下来要做的就是从左往右把它填满。
          </>
        }
      />
    ),
  },
  {
    cells: climbCells(2),
    msg: (
      <T
        en={
          <>
            Base cases: dp[1] = <b>1</b> (a single 1-step move) and dp[2] = <b>2</b>{" "}
            (1+1, or one 2-step move). These two are not derived from the transition.
            You count them by hand. A wrong base value makes every later cell wrong.
          </>
        }
        zh={
          <>
            初始化:dp[1] = <b>1</b>(跨 1 阶,唯一走法),dp[2] = <b>2</b>
            (1+1,或直接跨 2 阶)。这两格不靠转移推导,而是<b>直接数出来</b>的 ——
            初始值错,后面全错。
          </>
        }
      />
    ),
  },
  {
    cells: climbCells(2, 3, [1, 2]),
    msg: (
      <T
        en={
          <>
            dp[3]: the last move came either from step 2 (one step) or from step 1
            (two steps). The two cases <b>do not overlap and nothing else is
            possible</b>, so dp[3] = dp[2] + dp[1] = 2 + 1 = <b>3</b>.
          </>
        }
        zh={
          <>
            dp[3]:最后一步要么从第 2 阶跨 1 步来,要么从第 1 阶跨 2 步来 ——
            两种来路<b>互斥,且没有第三种</b>,所以 dp[3] = dp[2] + dp[1] = 2 + 1 = <b>3</b>。
          </>
        }
      />
    ),
  },
  {
    cells: climbCells(3, 4, [2, 3]),
    msg: (
      <T
        en={
          <>
            dp[4] = dp[3] + dp[2] = 3 + 2 = <b>5</b>. Note that the 5 routes are
            never listed. Two values that are already correct are simply added.
          </>
        }
        zh={
          <>
            dp[4] = dp[3] + dp[2] = 3 + 2 = <b>5</b>。注意:我们<b>完全没有</b>
            去列举那 5 条路各长什么样,只是把两个已经算对的值加了起来。
          </>
        }
      />
    ),
  },
  {
    cells: climbCells(4, 5, [3, 4]),
    msg: (
      <T
        en={
          <>
            dp[5] = dp[4] + dp[3] = 5 + 3 = <b>8</b>. The row 1, 2, 3, 5, 8 is the
            Fibonacci sequence shifted by one position, because the transition is
            the same.
          </>
        }
        zh={
          <>
            dp[5] = dp[4] + dp[3] = 5 + 3 = <b>8</b>。这一行 1、2、3、5、8
            就是错开一位的斐波那契数列 —— 因为转移方程完全相同。
          </>
        }
      />
    ),
  },
  {
    cells: climbCells(5, 6, [4, 5]),
    msg: (
      <T
        en={
          <>
            dp[6] = dp[5] + dp[4] = 8 + 5 = <b>13</b>. There are n states and each
            one costs O(1), so the whole table takes <b>O(n)</b> time — against
            O(2ⁿ) for the plain recursion.
          </>
        }
        zh={
          <>
            dp[6] = dp[5] + dp[4] = 8 + 5 = <b>13</b>。共 n 个状态、每格 O(1),
            整张表 <b>O(n)</b> —— 对比朴素递归的 O(2ⁿ)。
          </>
        }
      />
    ),
  },
  {
    cells: climbCells(6, undefined, undefined, true),
    msg: (
      <T
        en={
          <>
            The table is full and the answer sits in the last cell: <b>13</b>.
            That is what filling a table means: compute every subproblem the
            memoized version would have reached, in an order that guarantees each
            value is ready before it is read.
          </>
        }
        zh={
          <>
            表填完,答案就在最后一格:<b>13</b>。递推的本质:
            <b>把记忆化会算到的每个子问题,按「用到时已算好」的顺序提前算一遍</b>。
          </>
        }
      />
    ),
  },
];

/* ================= 精讲 B · LC 62 不同路径:二维表逐格填充 ================= */

const P62 = [
  [1, 1, 1, 1],
  [1, 2, 3, 4],
  [1, 3, 6, 10],
];

function pathCells(
  filled: (i: number, j: number) => boolean,
  cur?: [number, number],
  srcs?: [number, number][],
  final = false,
): DPCell[][] {
  return P62.map((row, i) =>
    row.map((v, j) => {
      if (cur && cur[0] === i && cur[1] === j) return { v, state: "cur" as const };
      if (srcs?.some(([a, b]) => a === i && b === j)) return { v, state: "src" as const };
      if (filled(i, j)) return { v, state: final && i === 2 && j === 3 ? ("ok" as const) : ("done" as const) };
      return { v: "?", state: "ghost" as const };
    }),
  );
}

const INNER_62: [number, number][] = [
  [1, 1],
  [1, 2],
  [1, 3],
  [2, 1],
  [2, 2],
  [2, 3],
];

const F62: DPFrame[] = [
  {
    cells: pathCells(() => false),
    msg: (
      <T
        en={
          <>
            A 3×4 grid. The robot starts at the top left, ends at the bottom
            right, and may only move right or down. State:{" "}
            <b>dp[i][j] is the number of paths from (0, 0) to (i, j)</b>.
          </>
        }
        zh={
          <>
            3×4 的网格,机器人从左上走到右下,只能向右或向下。
            状态:<b>dp[i][j] = 从 (0, 0) 走到 (i, j) 的路径条数</b>。
          </>
        }
      />
    ),
  },
  {
    cells: pathCells((i, j) => i === 0 || j === 0),
    msg: (
      <T
        en={
          <>
            Base cases: the first row and the first column are all <b>1</b>. There
            is only one way in — straight right, or straight down. These are the
            cells you can fill without using the transition.
          </>
        }
        zh={
          <>
            初始化:第一行、第一列全是 <b>1</b> —— 只能一路向右(或一路向下)走过来,
            没有第二种选择。这些就是不需要转移、直接能填的格子。
          </>
        }
      />
    ),
  },
  ...INNER_62.map(([i, j], k) => {
    const done = (a: number, b: number) =>
      a === 0 || b === 0 || INNER_62.slice(0, k).some(([x, y]) => x === a && y === b);
    return {
      cells: pathCells(done, [i, j], [
        [i - 1, j],
        [i, j - 1],
      ]),
      msg: (
        <T
          en={
            <>
              dp[{i}][{j}]: the last step came either <b>from above</b> (dp[{i - 1}][
              {j}] = {P62[i - 1][j]}) or <b>from the left</b> (dp[{i}][{j - 1}] ={" "}
              {P62[i][j - 1]}). The two groups of paths do not overlap and cover
              all of them, so the counts add up to <b>{P62[i][j]}</b>.
            </>
          }
          zh={
            <>
              dp[{i}][{j}]:最后一步只能<b>从上面来</b>(dp[{i - 1}][{j}] ={" "}
              {P62[i - 1][j]})或<b>从左面来</b>(dp[{i}][{j - 1}] = {P62[i][j - 1]})。
              两类路径互斥、无遗漏,相加得 <b>{P62[i][j]}</b>。
            </>
          }
        />
      ),
    };
  }),
  {
    cells: pathCells(() => true, undefined, undefined, true),
    msg: (
      <T
        en={
          <>
            The bottom-right cell, <b>10</b>, is the answer. There are m×n states
            and each transition is one addition, so the time is <b>O(mn)</b>. Here
            you could still count all 10 paths by hand. A 20×20 grid has about 35
            billion paths, and the table still has only 400 cells.
          </>
        }
        zh={
          <>
            右下角的 <b>10</b> 就是答案。共 m×n 个状态、每次转移只做一次加法,
            时间 <b>O(mn)</b>。这里 10 条路还数得过来;换成 20×20 的网格,
            路径约有 350 亿条,而这张表仍然只有 400 格。
          </>
        }
      />
    ),
  },
];

/* ================= 精讲 C · LC 198 打家劫舍:选 / 不选 ================= */

const ROB_NUMS = [2, 7, 9, 3, 1];
const ROB_DP = [2, 7, 11, 11, 12];

const ROB_LABELS = {
  en: ROB_NUMS.map((v, i) => (
    <span key={i}>
      🏠{i}
      <br />
      {v}
    </span>
  )),
  zh: ROB_NUMS.map((v, i) => (
    <span key={i}>
      🏠{i}
      <br />¥{v}
    </span>
  )),
};

function robCells(upto: number, cur?: number, srcs?: number[], final = false): DPCell[][] {
  const row: DPCell[] = ROB_DP.map((v, i) => {
    if (cur === i) return { v, state: "cur" };
    if (srcs?.includes(i)) return { v, state: "src" };
    if (i <= upto) return { v, state: final && i === 4 ? "ok" : "done" };
    return { v: "?", state: "ghost" };
  });
  return [row];
}

const F_ROB: DPFrame[] = [
  {
    cells: robCells(-1),
    msg: (
      <T
        en={
          <>
            State: <b>dp[i] is the largest amount you can take from houses 0
            through i without taking two neighbors</b>. Read the wording
            carefully — it is &quot;from houses 0 through i&quot;, <b>not</b>{" "}
            &quot;house i must be taken&quot;. That difference decides how the
            transition is written.
          </>
        }
        zh={
          <>
            状态:<b>dp[i] = 只考虑第 0 到第 i 间房、且不偷相邻两间时,能拿到的最大金额</b>。
            注意措辞是「第 0 到第 i 间之内」,<b>不是</b>「必须偷第 i 间」——
            这个区别决定了转移怎么写。
          </>
        }
      />
    ),
  },
  {
    cells: robCells(0, 0),
    msg: (
      <T
        en={
          <>
            dp[0]: only one house exists, so there is no neighbor to trigger the
            alarm. Take it. dp[0] = <b>2</b>.
          </>
        }
        zh={
          <>
            dp[0]:只有一间房,没有邻居可触发警报 —— 直接偷。dp[0] = <b>2</b>。
          </>
        }
      />
    ),
  },
  {
    cells: robCells(0, 1, [0]),
    msg: (
      <T
        en={
          <>
            dp[1]: the two houses are neighbors, so at most one can be taken.
            max(2, 7) = <b>7</b>.
          </>
        }
        zh={
          <>
            dp[1]:两间相邻,最多只能挑一间 —— max(2, 7) = <b>7</b>。
          </>
        }
      />
    ),
  },
  {
    cells: robCells(1, 2, [0, 1]),
    msg: (
      <T
        en={
          <>
            dp[2] is the first real choice. <b>Take house 2</b> (worth 9): house 1
            must then be skipped, so the total is dp[0] + 9 = 11.{" "}
            <b>Skip house 2</b>: carry dp[1] = 7 forward. max(11, 7) = <b>11</b>.
          </>
        }
        zh={
          <>
            dp[2] 是第一次真正的二选一:<b>偷第 2 间</b>(¥9)→ 第 1 间必须放弃,
            收益 dp[0] + 9 = 11;<b>不偷</b> → 直接继承 dp[1] = 7。max(11, 7) = <b>11</b>。
          </>
        }
      />
    ),
  },
  {
    cells: robCells(2, 3, [1, 2]),
    msg: (
      <T
        en={
          <>
            dp[3]: take house 3 (worth 3) gives dp[1] + 3 = 10; skip it gives
            dp[2] = 11. max = <b>11</b>. Here skipping wins — 3 is not worth
            giving up the neighbor that holds 9.
          </>
        }
        zh={
          <>
            dp[3]:偷第 3 间(¥3)→ dp[1] + 3 = 10;不偷 → dp[2] = 11。max = <b>11</b> ——
            这次「不偷」赢了,¥3 不值得为它放弃旁边的 ¥9。
          </>
        }
      />
    ),
  },
  {
    cells: robCells(3, 4, [2, 3]),
    msg: (
      <T
        en={
          <>
            dp[4]: take house 4 (worth 1) gives dp[2] + 1 = 12; skip it gives
            dp[3] = 11. max = <b>12</b>.
          </>
        }
        zh={
          <>
            dp[4]:偷第 4 间(¥1)→ dp[2] + 1 = 12;不偷 → dp[3] = 11。max = <b>12</b>。
          </>
        }
      />
    ),
  },
  {
    cells: robCells(4, undefined, undefined, true),
    msg: (
      <T
        en={
          <>
            The answer is <b>12</b> (2 + 9 + 1). Every cell did one comparison
            between &quot;take it&quot; and &quot;skip it&quot;.{" "}
            <b>That choose-or-skip model is the basis of the knapsack chapter</b>.
          </>
        }
        zh={
          <>
            答案 <b>12</b>(¥2 + ¥9 + ¥1)。每一格都只做了一次「偷 / 不偷」的比较 ——
            <b>「选 / 不选」这个决策模型,就是下一章背包问题的雏形</b>。
          </>
        }
      />
    ),
  },
];

/* ================= 精讲 D · LC 322 零钱兑换:min 型 DP ================= */

const COIN_DP = [0, 1, 2, 1, 1, 2, 2]; // coins = [1,3,4], amount = 6

const COIN_LABELS = {
  en: COIN_DP.map((_, a) => `a=${a}`),
  zh: COIN_DP.map((_, a) => `¥${a}`),
};

function coinCells(upto: number, cur?: number, srcs?: number[], final = false): DPCell[][] {
  const row: DPCell[] = COIN_DP.map((v, a) => {
    if (cur === a) return { v, state: "cur" };
    if (srcs?.includes(a)) return { v, state: "src" };
    if (a <= upto) return { v, state: final && a === 6 ? "ok" : "done" };
    return { v: "?", state: "ghost" };
  });
  return [row];
}

const F_COIN: DPFrame[] = [
  {
    cells: coinCells(0, 0),
    msg: (
      <T
        en={
          <>
            Coin values 1, 3, and 4; target amount 6. State:{" "}
            <b>dp[a] is the fewest coins that add up to exactly a</b>. Base:
            dp[0] = <b>0</b>, because an amount of 0 needs no coins. Every other
            value grows out of this cell.
          </>
        }
        zh={
          <>
            硬币面额 1、3、4,目标金额 6。状态:<b>dp[a] = 恰好凑出金额 a 的最少硬币数</b>。
            初始 dp[0] = <b>0</b>:凑 ¥0 一枚都不用 —— 所有答案都从这一格长出来。
          </>
        }
      />
    ),
  },
  {
    cells: coinCells(0, 1, [0]),
    msg: (
      <T
        en={
          <>
            dp[1]: the last coin can only be the 1 (3 and 4 are already larger
            than the amount), so dp[0] + 1 = <b>1</b>.
          </>
        }
        zh={
          <>
            dp[1]:最后一枚只能是 ¥1(¥3、¥4 都超过金额了)→ dp[0] + 1 = <b>1</b>。
          </>
        }
      />
    ),
  },
  {
    cells: coinCells(1, 2, [1]),
    msg: (
      <T
        en={
          <>
            dp[2]: again only the 1 fits, so dp[1] + 1 = <b>2</b>.
          </>
        }
        zh={
          <>
            dp[2]:还是只有 ¥1 可用 → dp[1] + 1 = <b>2</b>。
          </>
        }
      />
    ),
  },
  {
    cells: coinCells(2, 3, [2, 0]),
    msg: (
      <T
        en={
          <>
            dp[3] has a real branch. If the last coin is the 1, the cost is
            dp[2] + 1 = 3. If it is the 3, the cost is dp[0] + 1 = <b>1</b>. Take
            the minimum: <b>1</b>. Enumerating the last coin is the same as
            enumerating every possible last step.
          </>
        }
        zh={
          <>
            dp[3] 开始有分岔:最后一枚是 ¥1 → dp[2] + 1 = 3;是 ¥3 → dp[0] + 1 = <b>1</b>。
            取 min = <b>1</b>。「枚举最后一枚硬币」就是「枚举所有可能的最后一步」。
          </>
        }
      />
    ),
  },
  {
    cells: coinCells(3, 4, [3, 1, 0]),
    msg: (
      <T
        en={
          <>
            dp[4]: last coin 1 gives dp[3] + 1 = 2; last coin 3 gives dp[1] + 1 =
            2; last coin 4 gives dp[0] + 1 = <b>1</b>. min = <b>1</b>.
          </>
        }
        zh={
          <>
            dp[4]:最后一枚是 ¥1 → dp[3] + 1 = 2;¥3 → dp[1] + 1 = 2;
            ¥4 → dp[0] + 1 = <b>1</b>。min = <b>1</b>。
          </>
        }
      />
    ),
  },
  {
    cells: coinCells(4, 5, [4, 2, 1]),
    msg: (
      <T
        en={
          <>
            dp[5]: last coin 1 gives dp[4] + 1 = 2; last coin 3 gives dp[2] + 1 =
            3; last coin 4 gives dp[1] + 1 = 2. min = <b>2</b>.
          </>
        }
        zh={
          <>
            dp[5]:¥1 → dp[4] + 1 = 2;¥3 → dp[2] + 1 = 3;¥4 → dp[1] + 1 = 2。
            min = <b>2</b>。
          </>
        }
      />
    ),
  },
  {
    cells: coinCells(5, 6, [5, 3, 2]),
    msg: (
      <T
        en={
          <>
            dp[6]: last coin 1 gives dp[5] + 1 = 3; <b>last coin 3 gives dp[3] + 1
            = 2</b>; last coin 4 gives dp[2] + 1 = 3. min = <b>2</b>, and the
            combination behind it is 3 + 3 — exactly the one that taking the
            largest coin first can never reach.
          </>
        }
        zh={
          <>
            dp[6]:¥1 → dp[5] + 1 = 3;<b>¥3 → dp[3] + 1 = 2</b>;¥4 → dp[2] + 1 = 3。
            min = <b>2</b>,背后的组合是 3 + 3 —— 正是「每次拿最大面额」永远够不到的那条路。
          </>
        }
      />
    ),
  },
  {
    cells: coinCells(6, undefined, undefined, true),
    msg: (
      <T
        en={
          <>
            Taking the largest coin first: 4+1+1 = 3 coins. The DP: 3+3 ={" "}
            <b>2 coins</b>. The DP never commits to a choice; it tries every
            possible last coin and keeps the best result for each amount, so no
            combination is missed. There are amount+1 states and each transition
            scans all 3 coin values, so the time is O(amount × 3).
          </>
        }
        zh={
          <>
            每次拿最大面额:4+1+1 = 3 枚;DP:3+3 = <b>2 枚</b>。
            DP 不替你做选择,它把每一种「最后一枚」都试过,并为每个金额留下最优结果 ——
            数学上保证不漏。共 amount+1 个状态,每次转移要扫过 3 种面额,时间 O(amount × 3)。
          </>
        }
      />
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "why", n: "01", label: { en: "Why DP exists", zh: "为什么会有 DP" } },
  { id: "memo", n: "02", label: { en: "Memoization", zh: "记忆化" } },
  { id: "tabulation", n: "03", label: { en: "Tabulation · LC 70", zh: "递推 · 爬楼梯" } },
  { id: "framework", n: "04", label: { en: "Five steps", zh: "五步法" } },
  { id: "grid", n: "05", label: { en: "Grid DP · LC 62", zh: "网格 DP" } },
  { id: "rob", n: "06", label: { en: "House robber · LC 198", zh: "打家劫舍" } },
  { id: "coin", n: "07", label: { en: "Where greedy fails", zh: "贪心失效之地" } },
  { id: "problems", n: "08", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "09", label: { en: "Quiz", zh: "通关测验" } },
];

export default function DPChapter() {
  return (
    <main className="page" data-ch="dp">
      <Hero
        ch="dp"
        title={{
          en: (
            <>
              Dynamic <span className="grad">programming</span>
            </>
          ),
          zh: (
            <>
              动态规划 <span className="grad">DP</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              Dynamic programming is one sentence:{" "}
              <strong>
                write down the answer to each subproblem the first time you compute
                it, then reuse it instead of computing it again
              </strong>
              . This chapter starts from a recursion tree that grows exponentially
              and shows O(2ⁿ) turning into O(n). You then get a five-step method
              that works the same way on every DP problem in this course.
            </>
          ),
          zh: (
            <>
              动态规划只有一句话:<strong>子问题第一次算出来就记下来,
              之后直接复用,不再算第二遍</strong>。
              本章从一棵指数级膨胀的递归树出发,亲眼看 O(2ⁿ) 变成 O(n);
              然后给你一套五步法,后面每道 DP 题都按同一个节奏拆。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 为什么 ================= */}
      <Section
        id="why"
        index="01"
        title={{
          en: "Why DP exists: a recursion tree that grows out of control",
          zh: "为什么会有 DP:一棵会爆炸的递归树",
        }}
        desc={{
          en: "DP is not a new trick. It is a repair for recursion that repeats the same work.",
          zh: "DP 不是新技巧,是对「递归重复劳动」的一次修补",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Start with a small problem. You climb a staircase of n steps,
                  moving 1 or 2 steps at a time. How many different ways are
                  there? Use the method from the introduction chapter: stand on
                  step n and look back. <strong>The last move has only two
                  possibilities</strong> — it came from step n−1 with a 1-step
                  move, or from step n−2 with a 2-step move. The two cases never
                  overlap and nothing else is possible, so{" "}
                  <code>f(n) = f(n−1) + f(n−2)</code>, with f(1) = 1 and f(2) = 2.
                </>
              }
              zh={
                <>
                  从一个很小的问题开始:爬一段 n 阶的楼梯,每步跨 1 阶或 2 阶,
                  有几种爬法?按序章教的方法来想 —— 站在第 n 阶往回看,
                  <strong>最后一步只有两种可能</strong>:从第 n−1 阶跨 1 步上来,
                  或从第 n−2 阶跨 2 步上来。两种来路互斥,也没有第三种,所以
                  <code>f(n) = f(n−1) + f(n−2)</code>,出口是 f(1) = 1、f(2) = 2。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Three lines of recursion, submit — <strong>time limit
                  exceeded</strong>. What went wrong? Draw the full call tree for
                  f(5). The player below uses the plain Fibonacci version of the
                  same recurrence (f(0) = 0, f(1) = 1) so the numbers are
                  familiar. Step through it and watch the frames marked
                  &quot;⚠️&quot;.
                </>
              }
              zh={
                <>
                  三行递归就能写完,提交 —— <strong>超时</strong>。哪里出了问题?
                  把 f(5) 的调用过程完整画出来。下面用同一条递推式的标准斐波那契版本演示
                  (f(0) = 0、f(1) = 1),数字更眼熟。一步步播放,注意标着「⚠️」的那几帧:
                </>
              }
            />
          </p>
        </div>
        <FibNaiveTree />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Property 01" zh="性质 01" />
            </div>
            <div className="card-title">
              <T en="Overlapping subproblems" zh="重叠子问题" />
            </div>
            <p>
              <T
                en={
                  <>
                    f(3) is computed 2 times, f(2) 3 times, f(1) 5 times. Large
                    parts of the tree are <b>identical to each other</b>. This is
                    the cause of the timeout: the repeated work grows
                    exponentially with n.
                  </>
                }
                zh={
                  <>
                    f(3) 被完整算了 2 遍、f(2) 3 遍、f(1) 5 遍 ——
                    递归树里大量枝条<b>长得一模一样</b>。
                    这就是超时的原因:重复劳动随 n 指数增长。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Property 02" zh="性质 02" />
            </div>
            <div className="card-title">
              <T en="Optimal substructure" zh="最优子结构" />
            </div>
            <p>
              <T
                en={
                  <>
                    The answer for f(5) is built <b>directly</b> from the answers
                    for f(4) and f(3). You never need to know what those routes
                    look like in detail. A subproblem answer can be trusted and
                    reused as it is.
                  </>
                }
                zh={
                  <>
                    f(5) 的答案能由 f(4)、f(3) 的答案<b>直接拼出来</b>,
                    完全不需要知道那些方案具体长什么样。
                    子问题的答案可信,可以原样复用。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="The fix" zh="对策" />
            </div>
            <div className="card-title">
              <T en="Store each answer once" zh="算过就记下来" />
            </div>
            <p>
              <T
                en={
                  <>
                    The same question is asked many times and the answer never
                    changes. So <b>compute it once, store it, and look it up
                    afterwards</b>. That single change is what dynamic programming
                    does.
                  </>
                }
                zh={
                  <>
                    同一个问题会被问很多遍,而答案又不会变 ——
                    那就<b>算一次、记下来,之后直接查</b>。
                    动态规划做的就是这一件事。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  Dynamic programming needs <strong>both</strong> properties.
                  This is also the exact difference from the previous chapter.
                  Divide and conquer has optimal substructure too: merge sort
                  builds a sorted array from two sorted halves. But its
                  subproblems <strong>do not overlap</strong> — the two halves are
                  disjoint, so no subproblem is ever solved twice, and storing
                  results would gain nothing. Here the subproblems overlap
                  heavily, and storing each answer is exactly what removes the
                  repeated work.
                </>
              }
              zh={
                <>
                  动态规划需要<strong>同时满足这两个性质</strong>,
                  这也正是它和上一章分治的区别所在。分治同样有最优子结构 ——
                  归并排序用两个有序的半段拼出整段有序。但分治的子问题
                  <strong>不重叠</strong>:两半互不相交,任何子问题都只会被解一次,
                  记结果毫无收益。而这里的子问题大量重叠,
                  「把答案记下来」才刚好能消掉重复劳动。
                </>
              }
            />
          </p>
        </div>
        <Callout
          tone="story"
          title={{
            en: "The name \"dynamic programming\" was chosen for politics",
            zh: "「动态规划」这个名字,是一句公关话术",
          }}
        >
          <p>
            <T
              en={
                <>
                  In the 1950s Richard Bellman worked on multi-stage decision
                  problems at RAND. He later wrote in his autobiography that he
                  picked the name partly because the Secretary of Defense at the
                  time disliked the word &quot;research&quot;, so he needed a
                  name <b>nobody in Congress could object to</b>. &quot;Dynamic&quot;
                  sounded active, and &quot;programming&quot; then meant planning,
                  not writing code. So do not try to read meaning into the name.
                  <b> It means recursion plus stored results.</b>
                </>
              }
              zh={
                <>
                  1950 年代,Richard Bellman 在兰德公司研究多阶段决策问题。
                  他后来在自传里坦白:选「dynamic programming」这个名字,
                  一半是因为当时的国防部长讨厌「research」这个词,
                  得挑一个<b>连国会议员都无法反对</b>的说法 —— dynamic 听起来很有活力,
                  programming 在当时指「规划」而不是写代码。所以别试图从字面理解它:
                  <b>它的实质就是「递归 + 把结果记下来」</b>。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 记忆化 ================= */}
      <Section
        id="memo"
        index="02"
        title={{
          en: "Memoization: store each answer the first time",
          zh: "记忆化:算过的答案先记下来",
        }}
        desc={{
          en: "Two extra lines in the code, and O(2ⁿ) becomes O(n). Watch it happen.",
          zh: "代码只加两行,复杂度从 O(2ⁿ) 降到 O(n) —— 亲眼看",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The repair is simple. Before the function computes anything, it
                  checks a table and asks{" "}
                  <strong>&quot;have I answered this exact question before?&quot;</strong>{" "}
                  If yes, it returns the stored answer. If not, it computes the
                  answer, writes it into the table, and then returns it. Storing a
                  computed result so it can be reused instead of computed again is
                  called <strong>memoization</strong>; the table is called a{" "}
                  <strong>memo</strong>, and a recursion written this way is called
                  a <strong>memoized search</strong>, or top-down DP. It helps
                  exactly when the same subproblem is reached many times. Here is
                  the same f(5) tree, walked again with a memo:
                </>
              }
              zh={
                <>
                  修补方式很简单:函数动手计算之前先查一张表,问一句
                  <strong>「这个问题我答过吗?」</strong>答过就直接返回记下的答案;
                  没答过就算出来,先写进表里,再返回。
                  这种「把算过的结果存起来、之后复用而不重算」的做法叫
                  <strong>记忆化(memoization)</strong>,那张表叫
                  <strong>备忘录(memo)</strong>,这样写出来的递归叫
                  <strong>记忆化搜索</strong>,也叫自顶向下的 DP。
                  它的收益完全来自「同一个子问题被反复问到」。
                  同一棵 f(5) 的树,这次带着备忘录再走一遍:
                </>
              }
            />
          </p>
        </div>
        <FibMemoTree />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  The faded nodes are <strong>subtrees that were never built</strong>.
                  Once a subproblem has been computed, every later request for it
                  costs one table lookup. There are n+1 distinct subproblems and
                  each is computed once, so the total time is <strong>O(n)</strong>.
                  In code this is the brute-force recursion plus two lines:
                </>
              }
              zh={
                <>
                  幽灵节点是<strong>根本没有长出来的子树</strong>。
                  每个子问题第一次算出来之后,后续所有请求都只花一次查表。
                  不同的子问题共 n+1 个、每个只算一次,总时间 <strong>O(n)</strong>。
                  代码上,它就是「暴力递归 + 两行」:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="climb_memo"
          java={{
            code: {
              en: `class Solution {
    private int[] memo;

    public int climbStairs(int n) {
        memo = new int[n + 1];             // 0 means "not computed yet"
        return dfs(n);
    }

    private int dfs(int n) {
        if (n <= 2) return n;              // base cases: f(1)=1, f(2)=2
        if (memo[n] != 0) return memo[n];  // 1. look it up first
        memo[n] = dfs(n - 1) + dfs(n - 2); // compute it
        return memo[n];                    // 2. it is stored, now return
    }
}`,
              zh: `class Solution {
    private int[] memo;

    public int climbStairs(int n) {
        memo = new int[n + 1];             // 0 代表「还没算过」
        return dfs(n);
    }

    private int dfs(int n) {
        if (n <= 2) return n;              // 基准情形:f(1)=1, f(2)=2
        if (memo[n] != 0) return memo[n];  // ① 先查表
        memo[n] = dfs(n - 1) + dfs(n - 2); // 老实计算
        return memo[n];                    // ② 已记入表中,返回
    }
}`,
            },
            hl: [11, 12],
            note: {
              en: (
                <>
                  <b>Common mistake:</b> when an array is the memo, the value that
                  marks &quot;not computed&quot; (0 here) must never be a real
                  answer. If 0 can be a real answer, fill the array with{" "}
                  <code>-1</code> instead, or use a <code>HashMap</code>.
                </>
              ),
              zh: (
                <>
                  <b>常见错误:</b>用数组当备忘录时,标记「未计算」的值(这里是 0)
                  不能和真实答案撞车。若答案可能为 0,请改用 <code>-1</code> 初始化,
                  或换成 <code>HashMap</code>。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def climbStairs(self, n: int) -> int:
        from functools import cache

        @cache                    # 1. one decorator = an automatic memo
        def dfs(i: int) -> int:
            if i <= 2:
                return i          # base cases
            return dfs(i - 1) + dfs(i - 2)  # 2. results are cached for you

        return dfs(n)`,
              zh: `class Solution:
    def climbStairs(self, n: int) -> int:
        from functools import cache

        @cache                    # ① 一行装饰器 = 自动备忘录
        def dfs(i: int) -> int:
            if i <= 2:
                return i          # 基准情形
            return dfs(i - 1) + dfs(i - 2)  # ② 结果自动缓存

        return dfs(n)`,
            },
            hl: [5],
            note: {
              en: (
                <>
                  <code>functools.cache</code> (Python 3.9+) turns any pure
                  function into a memoized one. Remember that Python limits
                  recursion depth to about 1000 by default. For deep inputs, raise
                  it with <code>sys.setrecursionlimit</code> or switch to a table.
                </>
              ),
              zh: (
                <>
                  <code>functools.cache</code>(3.9+)能把任何纯函数变成记忆化版本。
                  但别忘了 Python 默认递归深度约 1000 —— 输入很深时要用{" "}
                  <code>sys.setrecursionlimit</code> 调高,或者改成填表。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var climbStairs = function (n) {
  const memo = new Map();          // memo: i -> f(i)
  const dfs = (i) => {
    if (i <= 2) return i;          // base cases
    if (memo.has(i)) return memo.get(i); // 1. look it up first
    const val = dfs(i - 1) + dfs(i - 2);
    memo.set(i, val);              // 2. store it, then return
    return val;
  };
  return dfs(n);
};`,
              zh: `var climbStairs = function (n) {
  const memo = new Map();          // 备忘录:i -> f(i)
  const dfs = (i) => {
    if (i <= 2) return i;          // 基准情形
    if (memo.has(i)) return memo.get(i); // ① 先查表
    const val = dfs(i - 1) + dfs(i - 2);
    memo.set(i, val);              // ② 记入表中再返回
    return val;
  };
  return dfs(n);
};`,
            },
            hl: [5, 7],
            note: {
              en: (
                <>
                  With numeric keys, a <code>Map</code> or an array both work. A
                  plain object <code>{"{}"}</code> also runs, but it converts keys
                  to strings, which is slower on large inputs.
                </>
              ),
              zh: (
                <>
                  键是数字时,用 <code>Map</code> 或数组都可以。
                  用普通对象 <code>{"{}"}</code> 也能跑,但键会被转成字符串,
                  数据量大时更慢。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{ en: "How to say this in an interview", zh: "面试可以直接这么说" }}
        >
          <p>
            <T
              en={
                <>
                  &quot;I would write the brute-force recursion first. I see that
                  the subproblems overlap, so I add a memo, which makes it a
                  memoized search and brings the time from O(2ⁿ) down to O(n). If
                  a table is preferable, I can rewrite it bottom-up.&quot; That
                  sentence shows the whole derivation, which is worth much more
                  than reciting the optimal solution.
                </>
              }
              zh={
                <>
                  「我先写暴力递归,发现子问题重叠,于是加备忘录变成记忆化搜索,
                  时间从 O(2ⁿ) 降到 O(n);如果需要,我可以再改写成自底向上的填表。」——
                  这段话完整展示了推导过程,比直接背出最优解有价值得多。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 递推 + 精讲 A ================= */}
      <Section
        id="tabulation"
        index="03"
        title={{
          en: "Tabulation: fill the table from the bottom up",
          zh: "递推:自底向上把表填一遍",
        }}
        desc={{
          en: "Worked example A · LC 70 Climbing Stairs — from recursion to a table, then to two variables",
          zh: "精讲 A · LC 70 爬楼梯 —— 从递归到表格,再把表格扔掉",
        }}
        badge={<span className="lc-badge" data-d="easy">EASY</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Memoization works <strong>top-down</strong>: it starts at f(n)
                  and computes whatever the recursion happens to reach. Turn the
                  direction around. f(3) depends on f(2) and f(1); f(4) depends on
                  f(3) and f(2); and so on. So{" "}
                  <strong>start from the smallest subproblem and compute forward,
                  in an order where every value is ready before it is read</strong>,
                  filling an array cell by cell. This is called{" "}
                  <strong>tabulation</strong>, or simply filling the DP table.
                  Here it is, one cell at a time:
                </>
              }
              zh={
                <>
                  记忆化是<strong>自顶向下</strong>的:从 f(n) 出发,
                  递归走到哪就算到哪。换个方向想:f(3) 依赖 f(2)、f(1),
                  f(4) 依赖 f(3)、f(2)……那就
                  <strong>从最小的子问题开始正着算,让每个值在被读到之前就已经填好</strong>,
                  用一个数组一格格填满 —— 这叫<strong>递推(tabulation)</strong>,
                  也就是大家常说的「填 DP 表」。逐格看:
                </>
              }
            />
          </p>
        </div>
        <DPTable
          title={{
            en: "LC 70 · filling the dp table cell by cell (n = 6)",
            zh: "LC 70 · dp 表逐格填充(n = 6)",
          }}
          frames={F_CLIMB}
          colLabels={CLIMB_COLS}
          cornerLabel="dp"
        />
        <CodeTabs
          title="lc70_climb_stairs"
          java={{
            code: {
              en: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;       // dp[1], dp[2]
        for (int i = 3; i <= n; i++) {
            int cur = prev1 + prev2;    // dp[i] = dp[i-1] + dp[i-2]
            prev2 = prev1;              // slide the window one cell right
            prev1 = cur;
        }
        return prev1;
    }
}`,
              zh: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;       // dp[1], dp[2]
        for (int i = 3; i <= n; i++) {
            int cur = prev1 + prev2;    // dp[i] = dp[i-1] + dp[i-2]
            prev2 = prev1;              // 窗口右移一格
            prev1 = cur;
        }
        return prev1;
    }
}`,
            },
            hl: [6, 7, 8],
            note: {
              en: (
                <>
                  The transition reads only the last two cells, so the array
                  becomes two variables and the space drops from O(n) to{" "}
                  <b>O(1)</b>. The knapsack chapter takes this further, and there
                  the loop direction starts to matter.
                </>
              ),
              zh: (
                <>
                  转移只读最近两格,于是数组砍成两个变量,空间 O(n) → <b>O(1)</b>。
                  「滚动优化」在背包一章还会升级,那里连遍历方向都有讲究。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        prev2, prev1 = 1, 2             # dp[1], dp[2]
        for _ in range(3, n + 1):
            prev2, prev1 = prev1, prev1 + prev2  # transition and slide in one line
        return prev1`,
              zh: `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        prev2, prev1 = 1, 2             # dp[1], dp[2]
        for _ in range(3, n + 1):
            prev2, prev1 = prev1, prev1 + prev2  # 转移 + 滚动一行写完
        return prev1`,
            },
            hl: [7],
            note: {
              en: (
                <>
                  Tuple unpacking does the transition and the slide in one line.
                  The right-hand side is evaluated completely before anything is
                  assigned, so there is no risk of overwriting a value too early.
                </>
              ),
              zh: (
                <>
                  元组解包让「转移 + 滚动」一行写完:
                  右边整体求值之后才赋值,不会出现「值被提前覆盖」的顺序 bug。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var climbStairs = function (n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;        // dp[1], dp[2]
  for (let i = 3; i <= n; i++) {
    const cur = prev1 + prev2;     // dp[i] = dp[i-1] + dp[i-2]
    prev2 = prev1;                 // slide the window one cell right
    prev1 = cur;
  }
  return prev1;
};`,
              zh: `var climbStairs = function (n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;        // dp[1], dp[2]
  for (let i = 3; i <= n; i++) {
    const cur = prev1 + prev2;     // dp[i] = dp[i-1] + dp[i-2]
    prev2 = prev1;                 // 窗口右移一格
    prev1 = cur;
  }
  return prev1;
};`,
            },
            hl: [5, 6, 7],
            note: {
              en: (
                <>
                  For n ≤ 45 the result stays inside the safe integer range. If a
                  problem allows larger n, JavaScript needs <code>BigInt</code>,
                  because <code>Number</code> loses precision above 2⁵³.
                </>
              ),
              zh: (
                <>
                  n ≤ 45 时结果在安全整数范围内。如果题目允许更大的 n,
                  JS 要改用 <code>BigInt</code> —— <code>Number</code> 超过 2⁵³ 会丢精度。
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
                  Top-down and bottom-up compute <strong>the same values</strong>.
                  The difference is which states get computed. Top-down only
                  visits the states the recursion actually reaches, so it can skip
                  states that this input never needs. Bottom-up fills every state
                  in the table. <strong>Neither one is faster in general.</strong>{" "}
                  Top-down also uses the call stack, so a long chain of
                  subproblems can overflow it; bottom-up has no such limit.
                </>
              }
              zh={
                <>
                  自顶向下和自底向上算出的是<strong>同一批值</strong>,
                  区别只在于哪些状态会被算到。自顶向下只访问递归真正走到的状态,
                  因此能跳过本次输入用不上的状态;自底向上则把表里每个状态都填满。
                  <strong>两者都不是普遍更快的那一个。</strong>
                  另外,自顶向下要占用调用栈,子问题链太长会栈溢出;自底向上没有这个限制。
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
                  <T en="Form" zh="写法" />
                </th>
                <th>
                  <T en="Direction" zh="方向" />
                </th>
                <th>
                  <T en="Time" zh="时间" />
                </th>
                <th>
                  <T en="Space" zh="空间" />
                </th>
                <th>
                  <T en="When to choose it" zh="什么时候选它" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T en="Plain recursion" zh="朴素递归" />
                  </b>
                </td>
                <td>
                  <T en="Top-down" zh="自顶向下" />
                </td>
                <td><BigO o="2n" /></td>
                <td>
                  <BigO o="n" label={{ en: "O(n) stack", zh: "O(n) 栈" }} />
                </td>
                <td>
                  <T
                    en="On paper only, to find the transition"
                    zh="只用在草稿纸上,用来找出转移方程"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Memoized search" zh="记忆化搜索" />
                  </b>
                </td>
                <td>
                  <T en="Top-down" zh="自顶向下" />
                </td>
                <td><BigO o="n" /></td>
                <td>
                  <BigO o="n" label={{ en: "O(n) + stack", zh: "O(n) + 栈" }} />
                </td>
                <td>
                  <T
                    en="Easiest to write when the transition is complex or most states are unreachable"
                    zh="转移复杂、或大部分状态根本到不了时,写起来最顺手"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Tabulation" zh="递推(填表)" />
                  </b>
                </td>
                <td>
                  <T en="Bottom-up" zh="自底向上" />
                </td>
                <td><BigO o="n" /></td>
                <td><BigO o="n" /></td>
                <td>
                  <T
                    en="The default when the dependency order is clear; no stack depth limit"
                    zh="依赖顺序清晰时的默认选择,没有栈深限制"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Tabulation + rolling array" zh="递推 + 滚动数组" />
                  </b>
                </td>
                <td>
                  <T en="Bottom-up" zh="自底向上" />
                </td>
                <td><BigO o="n" /></td>
                <td><BigO o="1" /></td>
                <td>
                  <T
                    en="Only when the transition reads a fixed number of recent cells"
                    zh="只在「转移只读最近固定几格」时可用"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="win"
          title={{ en: "Complexity and follow-up questions", zh: "复杂度 & 追问" }}
        >
          <p>
            <T
              en={
                <>
                  There are n states and each transition is one addition, so the
                  time is <b>O(n)</b>. The full table is O(n) space; because the
                  transition reads only the last two cells, two variables replace
                  it and the space becomes <b>O(1)</b>. Common follow-ups: (1)
                  &quot;what if each move can be 1 to m steps?&quot; — dp[i] sums
                  the previous m cells, so the work per state becomes O(m) and the
                  time becomes O(nm); that is an unbounded knapsack (chapter 08).
                  (2) &quot;what if the result must be taken modulo 10⁹+7?&quot; —
                  apply the modulo at every step to avoid overflow. (3) &quot;what
                  if n = 10¹⁸?&quot; — matrix exponentiation gives O(log n), using
                  the fast power idea from the divide and conquer chapter.
                </>
              }
              zh={
                <>
                  共 n 个状态、每次转移一次加法,时间 <b>O(n)</b>;
                  整张表占 O(n) 空间,而转移只读最近两格,
                  换成两个变量后空间是 <b>O(1)</b>。高频追问:
                  ①「每次可以爬 1 到 m 阶呢?」→ dp[i] 要累加前 m 格,
                  单次转移变成 O(m),总时间 O(nm),这已经是完全背包(第 8 章);
                  ②「结果要模 10⁹+7 呢?」→ 每一步都取模,防止溢出;
                  ③「n = 10¹⁸ 呢?」→ 矩阵快速幂 O(log n),
                  用的是分治章的快速幂思想。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 五步法 ================= */}
      <Section
        id="framework"
        index="04"
        title={{
          en: "The five steps: one routine for every DP problem",
          zh: "DP 五步法:从此按同一个节奏拆题",
        }}
        desc={{
          en: "Climbing stairs was the warm-up. This routine is what you actually take away.",
          zh: "爬楼梯只是热身 —— 真正要带走的是这套流程",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Replay what you just did and every step can be standardised.
                  This routine applies to all four DP chapters in this course, and{" "}
                  <strong>the order matters: do not touch the transition until the
                  state is defined in one clear sentence</strong>.
                </>
              }
              zh={
                <>
                  回放一遍刚才做了什么,你会发现每一步都可以标准化。
                  这套流程适用于本课全部四章 DP,而且<strong>顺序不能乱:
                  状态定义没写清楚之前,不要碰转移方程</strong>。
                </>
              }
            />
          </p>
        </div>
        <div className="dp-steps">
          <div className="dp-step">
            <div>
              <h4>
                <T
                  en="Define the state — say in one plain sentence what dp[i] means"
                  zh="定义状态 —— 用一句人话说清 dp[i] 是什么"
                />
              </h4>
              <p>
                <T
                  en={
                    <>
                      &quot;dp[i] is the number of ways to reach step i.&quot;
                      &quot;dp[i] is the largest amount from houses 0 through
                      i.&quot; Three checks: can you state the meaning, can you
                      read the answer out of the table, and can you derive a
                      transition from it? This step deserves about half of your
                      thinking time.
                    </>
                  }
                  zh={
                    <>
                      「dp[i] = 爬到第 i 阶的方案数」「dp[i] = 第 0 到第 i 间房的最大收益」。
                      三个检验:含义说得清、答案取得出、转移推得动。
                      这一步值得花掉一半的思考时间。
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <div className="dp-step">
            <div>
              <h4>
                <T
                  en="Write the transition — split the cases by the last step"
                  zh="写转移方程 —— 按「最后一步」分类讨论"
                />
              </h4>
              <p>
                <T
                  en={
                    <>
                      Stand at dp[i] and look back. What are the possible last
                      steps, and which subproblem does each one land on? Counting
                      problems add the cases; optimization problems take min or
                      max. The cases must not overlap and must cover everything,
                      or the count is wrong.
                    </>
                  }
                  zh={
                    <>
                      站在 dp[i] 往回看:最后一步有哪几种可能?每种落到哪个子问题上?
                      计数题把各类相加,最值题取 min / max。
                      分类必须互斥且不遗漏,否则结果一定错。
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <div className="dp-step">
            <div>
              <h4>
                <T
                  en="Initialize — find the cells you can fill without the transition"
                  zh="初始化 —— 找到不用转移就能填的格子"
                />
              </h4>
              <p>
                <T
                  en={
                    <>
                      dp[0], the first row and column, the empty string. These
                      cells are counted directly, not derived. Spend the extra
                      minute counting them by hand; a wrong base value spreads
                      through the whole table.
                    </>
                  }
                  zh={
                    <>
                      dp[0]、第一行第一列、空串…… 这些格子靠<b>直接数</b>,不靠转移推。
                      宁可多花一分钟手数一遍 —— 错误的初始值会污染整张表。
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <div className="dp-step">
            <div>
              <h4>
                <T
                  en="Fix the iteration order — every cell the transition reads must already be final"
                  zh="确定遍历顺序 —— 转移读到的格子必须已经是最终值"
                />
              </h4>
              <p>
                <T
                  en={
                    <>
                      The order is not a convention you pick. Read the transition:
                      it names the cells it depends on, and those cells must
                      already hold their final values. If it reads dp[i−1], i must
                      increase. If it reads dp[i+1], i must decrease. In a grid,
                      reading the cell above and the cell on the left forces top
                      to bottom and left to right. In the knapsack chapter this
                      becomes the main point: the same transition gives different
                      results for ascending and descending order.
                    </>
                  }
                  zh={
                    <>
                      顺序不是随便定的约定。读转移方程:它写明了自己依赖哪些格子,
                      而这些格子在被读到时必须已经是最终值。
                      转移读 dp[i−1],i 就必须递增;读 dp[i+1],i 就必须递减;
                      网格里读「上面一格 + 左边一格」,就必须从上到下、从左到右。
                      到了背包(第 8 章)这会成为主角:同一个转移,正序和倒序结果不同。
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <div className="dp-step">
            <div>
              <h4>
                <T
                  en="Check a small example by hand — 3 to 6 values are enough"
                  zh="手推一个小例子 —— 3~6 个数据就够"
                />
              </h4>
              <p>
                <T
                  en={
                    <>
                      Do not submit yet. Fill the table for n = 5 by hand and
                      compare it with a brute-force answer. Almost every DP bug is
                      in the base cases or the iteration order, and a small
                      example exposes both.
                    </>
                  }
                  zh={
                    <>
                      别急着提交:拿 n = 5 手填一遍表,和暴力答案对一次。
                      DP 的 bug 几乎全在初始化和遍历顺序上,小例子一照就现形。
                    </>
                  }
                />
              </p>
            </div>
          </div>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "Three beginner mistakes, all in the first three steps",
            zh: "新手三大坑,全在前三步",
          }}
        >
          <p>
            <T
              en={
                <>
                  (1) <b>A vague state.</b> &quot;dp[i] is the answer&quot; is not
                  a definition. Is it &quot;ending at i&quot; or &quot;within the
                  first i elements&quot;? One word changes the whole transition;
                  LC 53 and LC 198 are exactly this pair. (2){" "}
                  <b>Careless initialization.</b> In LC 63, filling the first row
                  with 1 after an obstacle is already wrong. (3){" "}
                  <b>Copying the operator from another problem.</b> Counting adds,
                  optimization takes min or max, feasibility uses OR. The operator
                  follows <b>what this problem asks</b>, not what the last problem
                  used.
                </>
              }
              zh={
                <>
                  ① <b>状态含糊</b>:「dp[i] 表示答案」不叫定义 ——
                  到底是「以 i 结尾」还是「前 i 个之内」?差一个字,转移全变
                  (LC 53 和 LC 198 正是这一对区别);
                  ② <b>初始化省事</b>:LC 63 里第一行遇到障碍之后仍然一律填 1,直接出错;
                  ③ <b>照抄上一题的算子</b>:计数用 +、最值用 min / max、可行性用「或」——
                  算子跟着<b>这道题问什么</b>走,不跟着上一道题走。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 网格 DP + 精讲 B ================= */}
      <Section
        id="grid"
        index="05"
        title={{
          en: "Grid DP: the table becomes two-dimensional",
          zh: "网格 DP:表格第一次变成二维",
        }}
        desc={{
          en: "Worked example B · LC 62 Unique Paths — one skeleton, three problems",
          zh: "精讲 B · LC 62 不同路径 —— 一套骨架,三道题换皮",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> in an m×n grid, a robot starts at the top
                  left and may only move right or down. How many paths reach the
                  bottom right? <b>Brute force:</b> enumerate every path with
                  backtracking; a 20×20 grid has about 35 billion of them.{" "}
                  <b>The DP:</b> the question asks how many, not which ones, which
                  is the usual signal for DP. Following the five steps: state{" "}
                  <code>dp[i][j]</code> is the number of paths from (0, 0) to (i,
                  j); the last step can only come from above or from the left, so{" "}
                  <code>dp[i][j] = dp[i−1][j] + dp[i][j−1]</code>; the first row
                  and column are 1; and because the transition reads the cell above
                  and the cell on the left, the loops go top to bottom and left to
                  right.
                </>
              }
              zh={
                <>
                  <b>题意:</b>m×n 的网格,机器人从左上角出发,只能向右或向下,
                  问走到右下角有几条路。<b>暴力:</b>回溯枚举每一条路径,
                  20×20 的网格约有 350 亿条。<b>正解:</b>题目只问「有几条」,
                  不问「长什么样」—— 这是 DP 的典型信号。按五步法来:
                  状态 <code>dp[i][j]</code> = 从 (0, 0) 走到 (i, j) 的路径数;
                  最后一步只能从上或从左来,于是
                  <code>dp[i][j] = dp[i−1][j] + dp[i][j−1]</code>;
                  第一行第一列初始化为 1;转移读的是上面一格和左边一格,
                  所以必须从上到下、从左到右填:
                </>
              }
            />
          </p>
        </div>
        <DPTable
          title={{
            en: "LC 62 · filling a 3×4 grid cell by cell (blue dashed cells are the sources of the transition)",
            zh: "LC 62 · 3×4 网格逐格填充(蓝色虚线格 = 转移来源)",
          }}
          frames={F62}
          colLabels={["j=0", "j=1", "j=2", "j=3"]}
          rowLabels={["i=0", "i=1", "i=2"]}
          cornerLabel="dp"
        />
        <CodeTabs
          title="lc62_unique_paths"
          java={{
            code: {
              en: `class Solution {
    public int uniquePaths(int m, int n) {
        int[][] dp = new int[m][n];
        for (int i = 0; i < m; i++) dp[i][0] = 1; // first column: one way down
        for (int j = 0; j < n; j++) dp[0][j] = 1; // first row: one way right
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1]; // above + left
        return dp[m - 1][n - 1];
    }
}`,
              zh: `class Solution {
    public int uniquePaths(int m, int n) {
        int[][] dp = new int[m][n];
        for (int i = 0; i < m; i++) dp[i][0] = 1; // 第一列:只能一路向下
        for (int j = 0; j < n; j++) dp[0][j] = 1; // 第一行:只能一路向右
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1]; // 上 + 左
        return dp[m - 1][n - 1];
    }
}`,
            },
            hl: [8],
            note: {
              en: (
                <>
                  The table is O(mn). dp[i][j] only needs the previous row and the
                  new value on its left, so one row is enough:{" "}
                  <code>dp[j] += dp[j-1]</code> brings the space to O(n).
                </>
              ),
              zh: (
                <>
                  整张表占 O(mn)。dp[i][j] 只需要上一行的同列值和本行左边的新值,
                  所以保留一行就够:<code>dp[j] += dp[j-1]</code>,空间 O(n)。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [1] * n                  # one rolling row: starts as the first row
        for _ in range(1, m):
            for j in range(1, n):
                dp[j] += dp[j - 1]    # new dp[j] = old dp[j] (above) + new dp[j-1] (left)
        return dp[-1]`,
              zh: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [1] * n                  # 滚动一维:初始即第一行
        for _ in range(1, m):
            for j in range(1, n):
                dp[j] += dp[j - 1]    # 新 dp[j] = 旧 dp[j](上) + 新 dp[j-1](左)
        return dp[-1]`,
            },
            hl: [6],
            note: {
              en: (
                <>
                  This is the one-row version. Before the assignment,{" "}
                  <code>dp[j]</code> still holds the value from the row above,
                  while <code>dp[j-1]</code> already holds this row&apos;s new
                  value. A single <code>+=</code> therefore reads both sources.
                </>
              ),
              zh: (
                <>
                  这是一维滚动版:赋值之前,<code>dp[j]</code> 还是上一行的值,
                  而 <code>dp[j-1]</code> 已经是本行的新值 ——
                  一个 <code>+=</code> 同时吃到「上」和「左」两个来源。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var uniquePaths = function (m, n) {
  const dp = Array(n).fill(1);     // one rolling row: starts as the first row
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[j] += dp[j - 1];          // above (old value) + left (new value)
    }
  }
  return dp[n - 1];
};`,
              zh: `var uniquePaths = function (m, n) {
  const dp = Array(n).fill(1);     // 滚动一维:初始即第一行
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[j] += dp[j - 1];          // 上(旧值) + 左(新值)
    }
  }
  return dp[n - 1];
};`,
            },
            hl: [5],
            note: {
              en: (
                <>
                  With m, n ≤ 100 the counts can be large, but this problem
                  guarantees the answer is at most 2×10⁹, which{" "}
                  <code>Number</code> holds exactly. For larger counting problems,
                  use <code>BigInt</code>.
                </>
              ),
              zh: (
                <>
                  m、n ≤ 100 时结果可能很大,但本题保证答案不超过 2×10⁹,
                  <code>Number</code> 能精确表示。更大的计数题记得改用{" "}
                  <code>BigInt</code>。
                </>
              ),
            },
          }}
        />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Variant 01 · LC 63" zh="换皮 01 · LC 63" />
            </div>
            <div className="card-title">
              <T en="Add obstacles" zh="加障碍" />
            </div>
            <p>
              <T
                en={
                  <>
                    An obstacle cell has dp = 0.{" "}
                    <b>After the first row or column hits an obstacle, every cell
                    behind it in that line is 0</b>, so you cannot fill the border
                    with 1 unconditionally. The whole problem tests initialization.
                  </>
                }
                zh={
                  <>
                    障碍格 dp = 0;
                    <b>第一行或第一列被障碍截断之后,其后的格子全是 0</b>,
                    不能不加判断地填 1 —— 全题只考初始化的边界意识。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Variant 02 · LC 64" zh="换皮 02 · LC 64" />
            </div>
            <div className="card-title">
              <T en="Minimum path sum" zh="求最小和" />
            </div>
            <p>
              <T
                en={
                  <>
                    Replace + with min:{" "}
                    <code>dp[i][j] = min(above, left) + grid[i][j]</code>. The
                    first row and column become prefix sums. The skeleton does not
                    change at all.
                  </>
                }
                zh={
                  <>
                    把 + 换成 min:
                    <code>dp[i][j] = min(上, 左) + grid[i][j]</code>,
                    第一行第一列变成前缀和。骨架一个字没动。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Variant 03 · LC 120" zh="换皮 03 · LC 120" />
            </div>
            <div className="card-title">
              <T en="Triangle" zh="三角形" />
            </div>
            <p>
              <T
                en={
                  <>
                    Fill upwards:{" "}
                    <code>dp[j] = tri[i][j] + min(dp[j], dp[j+1])</code>. Going
                    from the bottom row up makes the end-of-row special cases
                    disappear.
                  </>
                }
                zh={
                  <>
                    自底向上填:
                    <code>dp[j] = tri[i][j] + min(dp[j], dp[j+1])</code> ——
                    倒着来,行两端的边界特判自动消失。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="deep"
          title={{ en: "Grid DP in real products", zh: "工程现场:网格 DP 就在你手机里" }}
        >
          <p>
            <T
              en={
                <>
                  <b>Content-aware image resizing (seam carving)</b> finds a path
                  of pixels with the lowest total energy and removes it, so a photo
                  gets narrower without distorting the subject. That path is
                  exactly the minimum path sum of LC 64, computed row by row.
                  Swipe typing on a phone keyboard and Viterbi decoding in speech
                  recognition are also best-path DP over a grid of states.
                </>
              }
              zh={
                <>
                  <b>图片内容感知缩放(seam carving)</b>:
                  找一条总「能量」最低的像素路径删掉,让照片变窄而主体不被挤坏 ——
                  那条路径就是 LC 64 的最小路径和,逐行 DP 算出来的。
                  手机键盘的滑行输入、语音识别里的维特比(Viterbi)解码,
                  同样是在状态网格上求最优路径的 DP。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 打家劫舍 + 精讲 C ================= */}
      <Section
        id="rob"
        index="06"
        title={{
          en: "House robber: the choose-or-skip model",
          zh: "打家劫舍:「选 / 不选」决策模型",
        }}
        desc={{
          en: "Worked example C · LC 198 — the bridge to the knapsack chapter. Try it by hand first.",
          zh: "精讲 C · LC 198 —— 通往背包问题的桥,先亲手偷一轮",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> a row of houses each hold some cash, and{" "}
                  <strong>taking two neighboring houses sets off the alarm</strong>.
                  Find the largest amount you can take without setting it off.
                  Before reading the solution, click through it yourself and see
                  how unintuitive &quot;best under a constraint&quot; is:
                </>
              }
              zh={
                <>
                  <b>题意:</b>一排房子各有现金,
                  <strong>相邻两间同时被偷会触发警报</strong>,
                  求不触发警报时能偷到的最大金额。先别看解法 —— 亲手点一点,
                  感受一下「约束之下的最优」有多不直观:
                </>
              }
            />
          </p>
        </div>
        <RobLab />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  <b>Brute force:</b> each house is taken or skipped, so there are
                  2ⁿ combinations to check — impossible at n = 100.{" "}
                  <b>The DP:</b> for house i there are only two decisions.{" "}
                  <strong>Take it</strong>, which gives dp[i−2] + nums[i], because
                  house i−1 must then be skipped. Or <strong>skip it</strong>,
                  which gives dp[i−1] unchanged. Keep the larger one:
                </>
              }
              zh={
                <>
                  <b>暴力:</b>每间房偷或不偷,共 2ⁿ 种组合逐一验证 ——
                  n = 100 时根本跑不完。<b>正解:</b>对第 i 间房,决策只有两个:
                  <strong>偷</strong>(收益 = dp[i−2] + nums[i],因为第 i−1 间必须放弃)
                  或<strong>不偷</strong>(收益 = dp[i−1],直接继承)。取较大者:
                </>
              }
            />
          </p>
        </div>
        <DPTable
          title={{
            en: "LC 198 · filling the dp table cell by cell (nums = [2, 7, 9, 3, 1])",
            zh: "LC 198 · dp 表逐格填充(nums = [2, 7, 9, 3, 1])",
          }}
          frames={F_ROB}
          colLabels={ROB_LABELS}
          cornerLabel="dp"
          cellW={64}
        />
        <CodeTabs
          title="lc198_house_robber"
          java={{
            code: {
              en: `class Solution {
    public int rob(int[] nums) {
        int n = nums.length;
        if (n == 1) return nums[0];
        int prev2 = nums[0];                    // dp[0]
        int prev1 = Math.max(nums[0], nums[1]); // dp[1]
        for (int i = 2; i < n; i++) {
            int cur = Math.max(prev1, prev2 + nums[i]); // skip / take
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}`,
              zh: `class Solution {
    public int rob(int[] nums) {
        int n = nums.length;
        if (n == 1) return nums[0];
        int prev2 = nums[0];                    // dp[0]
        int prev1 = Math.max(nums[0], nums[1]); // dp[1]
        for (int i = 2; i < n; i++) {
            int cur = Math.max(prev1, prev2 + nums[i]); // 不偷 / 偷
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}`,
            },
            hl: [8],
            note: {
              en: (
                <>
                  <b>Edge case:</b> n = 1 must be handled separately, because the
                  initialization reads nums[1]. The transition reads only the last
                  two cells, so the array becomes two variables again.
                </>
              ),
              zh: (
                <>
                  <b>边界:</b>n = 1 要单独处理 —— 初始化用到了 nums[1]。
                  转移只读最近两格,照例可以滚动成两个变量。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def rob(self, nums: list[int]) -> int:
        prev2, prev1 = 0, 0     # two imaginary empty houses before the first one
        for x in nums:
            prev2, prev1 = prev1, max(prev1, prev2 + x)  # skip / take
        return prev1`,
              zh: `class Solution:
    def rob(self, nums: list[int]) -> int:
        prev2, prev1 = 0, 0     # 想象第一间之前还有两间收益为 0 的空房
        for x in nums:
            prev2, prev1 = prev1, max(prev1, prev2 + x)  # 不偷 / 偷
        return prev1`,
            },
            hl: [5],
            note: {
              en: (
                <>
                  Starting from two imaginary houses worth 0 removes the n = 1
                  special case. Adding a sentinel boundary is a common way to
                  simplify DP initialization.
                </>
              ),
              zh: (
                <>
                  用两间收益为 0 的虚拟房作为起点,连 n = 1 的特判都省了 ——
                  加一个哨兵边界,是简化 DP 初始化的常用手法。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var rob = function (nums) {
  let prev2 = 0, prev1 = 0;   // two imaginary empty houses, so no n === 1 case
  for (const x of nums) {
    const cur = Math.max(prev1, prev2 + x); // skip / take
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
};`,
              zh: `var rob = function (nums) {
  let prev2 = 0, prev1 = 0;   // 两间虚拟空房,免掉 n === 1 的特判
  for (const x of nums) {
    const cur = Math.max(prev1, prev2 + x); // 不偷 / 偷
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
};`,
            },
            hl: [4],
            note: {
              en: (
                <>
                  Same sentinel idea as the Python version. The two rolling
                  assignments must stay in this order: JavaScript has no tuple
                  unpacking that evaluates the whole right side first, although
                  destructuring does:{" "}
                  <code>[prev2, prev1] = [prev1, cur]</code>.
                </>
              ),
              zh: (
                <>
                  和 Python 版是同一个哨兵技巧。注意两行滚动赋值的顺序不能颠倒 ——
                  JS 没有「右边整体先求值」的元组解包保护(解构赋值可以:
                  <code>[prev2, prev1] = [prev1, cur]</code>)。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{ en: "Complexity and follow-up questions", zh: "复杂度 & 追问" }}
        >
          <p>
            <T
              en={
                <>
                  There are n states and each transition is one comparison, so the
                  time is <b>O(n)</b>. The table is O(n); since only the last two
                  cells are read, the space becomes <b>O(1)</b>. Common follow-ups:
                  (1) &quot;what if the houses form a circle?&quot; (LC 213) — the
                  first and last house cannot both be taken, so run the same DP on
                  [0, n−2] and on [1, n−1] and take the larger result. (2)
                  &quot;what if the houses form a tree?&quot; (LC 337) — each node
                  returns two values, one for taken and one for skipped; that is
                  tree DP, chapter 10. (3) &quot;why does the dp[i−1] term not add
                  nums[i]?&quot; — go back to the state definition: &quot;the best
                  over houses 0 through i&quot; does not promise that house i is
                  taken.
                </>
              }
              zh={
                <>
                  共 n 个状态、每次转移一次比较,时间 <b>O(n)</b>;
                  表占 O(n),而只读最近两格,所以空间是 <b>O(1)</b>。经典追问:
                  ①「房子围成一圈呢?」(LC 213)→ 首尾不能同偷,
                  拆成 [0, n−2] 和 [1, n−1] 两条链各跑一遍取较大者;
                  ②「房子是一棵树呢?」(LC 337)→ 每个节点返回「偷 / 不偷」两个值,
                  这是树形 DP,第 10 章主场;
                  ③「为什么 dp[i−1] 那一项不加 nums[i]?」→ 回到状态定义:
                  「第 0 到第 i 间之内的最优」并不承诺偷第 i 间。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 贪心失效 + 精讲 D ================= */}
      <Section
        id="coin"
        index="07"
        title={{
          en: "Where greedy fails: coin change",
          zh: "贪心失效之地:零钱兑换",
        }}
        desc={{
          en: "Worked example D · LC 322 — the greedy method from the previous chapter breaks here",
          zh: "精讲 D · LC 322 —— 上一章的贪心在这里失效,DP 接住",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> given coin values (unlimited coins of each
                  value) and a target amount, find the fewest coins that add up to
                  it, or −1 if it cannot be done. The everyday instinct, which is
                  also the greedy method from the previous chapter, is{" "}
                  <strong>always take the largest coin that still fits</strong>.
                  That works for real euro and dollar coins. Now try the values{" "}
                  <code>[1, 3, 4]</code> with a target of 6:
                </>
              }
              zh={
                <>
                  <b>题意:</b>给定硬币面额(每种无限枚)和目标金额 amount,
                  求凑出它的最少硬币数,凑不出返回 −1。日常直觉 ——
                  也就是上一章刚学的贪心 —— 是<strong>每次拿放得下的最大面额</strong>,
                  人民币、美元这么找零都对。但把面额换成 <code>[1, 3, 4]</code>、
                  目标 ¥6:
                </>
              }
            />
          </p>
        </div>
        <div className="dp-duel">
          <div className="card">
            <div className="card-kicker">
              <T en="Greedy · take the largest" zh="贪心 · 每步拿最大" />
            </div>
            <div className="card-title">
              <b className="mono">4 + 1 + 1</b>
            </div>
            <p>
              <T
                en={
                  <>
                    Take 4 (2 left) → 3 does not fit, take 1 (1 left) → take 1
                    again. <b>3 coins.</b> Every single step was locally best, and
                    after the first one the path through two 3s can never be
                    reached again.
                  </>
                }
                zh={
                  <>
                    先拿 ¥4(剩 2)→ ¥3 放不下,拿 ¥1(剩 1)→ 再拿 ¥1。
                    <b>3 枚。</b>每一步都是当下最优,
                    但第一步之后就再也回不到「两枚 ¥3」那条路径了。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="DP · try every last coin" zh="动态规划 · 每种拿法都记账" />
            </div>
            <div className="card-title">
              <b className="mono">3 + 3</b>
            </div>
            <p>
              <T
                en={
                  <>
                    dp[6] tries all three possible last coins, 1, 3, and 4, and
                    keeps the minimum. <b>2 coins.</b> It does not commit to a
                    choice; it computes the consequence of every choice.
                  </>
                }
                zh={
                  <>
                    dp[6] 把「最后一枚是 ¥1 / ¥3 / ¥4」三种可能都试过,取最小值。
                    <b>2 枚。</b>它不替你做选择,而是把每种选择的后果都算了一遍。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Why does greedy fail here? The coin set [1, 3, 4] does not have
                  the <strong>greedy choice property</strong>: taking 4, the
                  locally best move, destroys the structure of the globally best
                  answer, 3 + 3. The greedy chapter stated the rule:{" "}
                  <strong>if you cannot prove the exchange argument, do not use
                  greedy</strong>. Fall back to DP. State: dp[a] is the fewest
                  coins that add up to exactly a, or infinity if a cannot be
                  formed. Split the cases by which coin was the last one:
                </>
              }
              zh={
                <>
                  贪心为什么会失效?硬币系统 [1, 3, 4] 不满足
                  <strong>贪心选择性质</strong>:拿走 ¥4 这个局部最优,
                  会破坏全局最优(3 + 3)的结构。贪心章讲过规则:
                  <strong>证明不了交换论证,就不要贪</strong>。此时退回 DP:
                  状态 dp[a] = 恰好凑出金额 a 的最少硬币数,凑不出则为无穷大;
                  按「最后一枚硬币是谁」分类:
                </>
              }
            />
          </p>
        </div>
        <DPTable
          title={{
            en: "LC 322 · filling the dp table cell by cell (coins = [1, 3, 4], amount = 6)",
            zh: "LC 322 · dp 表逐格填充(coins = [1, 3, 4],amount = 6)",
          }}
          frames={F_COIN}
          colLabels={COIN_LABELS}
          cornerLabel="dp"
        />
        <CodeTabs
          title="lc322_coin_change"
          java={{
            code: {
              en: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);   // stands for infinity: amount+1 is unreachable
        dp[0] = 0;                     // amount 0 needs 0 coins
        for (int a = 1; a <= amount; a++)
            for (int c : coins)
                if (c <= a)
                    dp[a] = Math.min(dp[a], dp[a - c] + 1); // the last coin is c
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
              zh: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);   // 代表无穷大:amount+1 枚是不可能达到的
        dp[0] = 0;                     // 凑 ¥0 用 0 枚
        for (int a = 1; a <= amount; a++)
            for (int c : coins)
                if (c <= a)
                    dp[a] = Math.min(dp[a], dp[a - c] + 1); // 最后一枚是 c
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
            },
            hl: [9],
            note: {
              en: (
                <>
                  <b>Common mistake:</b> do not use{" "}
                  <code>Integer.MAX_VALUE</code> for infinity — adding 1 overflows
                  into a negative number. A value that simply cannot occur, such
                  as <code>amount + 1</code>, is safer.
                </>
              ),
              zh: (
                <>
                  <b>常见错误:</b>「无穷大」别用 <code>Integer.MAX_VALUE</code> ——
                  再 +1 会溢出成负数。用 <code>amount + 1</code>
                  这种「不可能达到的值」最稳。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        INF = float("inf")
        dp = [0] + [INF] * amount      # dp[0] = 0, everything else unknown
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a:
                    dp[a] = min(dp[a], dp[a - c] + 1)  # the last coin is c
        return -1 if dp[amount] == INF else dp[amount]`,
              zh: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        INF = float("inf")
        dp = [0] + [INF] * amount      # dp[0] = 0,其余未知
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a:
                    dp[a] = min(dp[a], dp[a - c] + 1)  # 最后一枚是 c
        return -1 if dp[amount] == INF else dp[amount]`,
            },
            hl: [8],
            note: {
              en: (
                <>
                  In Python, <code>float(&quot;inf&quot;)</code> plus 1 is still
                  inf, so there is no overflow. An amount that cannot be formed
                  keeps its infinity value all the way to the end.
                </>
              ),
              zh: (
                <>
                  Python 的 <code>float(&quot;inf&quot;)</code> 加 1 依然是 inf,
                  天然免疫溢出 —— 「凑不出」的状态会一路原样传到最后。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var coinChange = function (coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;                       // amount 0 needs 0 coins
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1); // the last coin is c
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
};`,
              zh: `var coinChange = function (coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;                       // 凑 ¥0 用 0 枚
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1); // 最后一枚是 c
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
};`,
            },
            hl: [6],
            note: {
              en: (
                <>
                  <code>Infinity</code> is safe inside <code>Math.min</code>. With
                  k coin values there are amount+1 states and O(k) work per state,
                  so the time is O(amount × k) and the table is O(amount). The
                  rolling-array trick does not apply here: dp[a] can read dp[a−c]
                  for any coin value c, so keeping a fixed number of recent cells
                  is not enough.
                </>
              ),
              zh: (
                <>
                  <code>Infinity</code> 参与 <code>Math.min</code> 完全安全。
                  设面额有 k 种,则共 amount+1 个状态、每个状态 O(k) 的转移代价,
                  时间 O(amount × k),表占 O(amount) 空间。
                  这里用不了滚动数组:dp[a] 可能读到 dp[a−c],c 取遍所有面额,
                  只保留最近固定几格根本不够。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "Preview: this problem has a second identity",
            zh: "预告:这道题还有第二重身份",
          }}
        >
          <p>
            <T
              en={
                <>
                  &quot;Unlimited coins of each value, reach a target amount&quot;
                  is the standard shape of an <b>unbounded knapsack</b>. Chapter 08
                  models LC 322 again from that angle: why can the inner and outer
                  loops be swapped there? And why does replacing min with a count
                  turn it into LC 518? Modeling the same problem twice is
                  deliberate.
                </>
              }
              zh={
                <>
                  「每种硬币无限枚 + 凑出目标金额」——
                  这是<b>完全背包</b>的标准形状。第 8 章会把 LC 322 重新建模一遍:
                  为什么那里内外层循环可以交换?把 min 换成「求方案数」为什么就变成了 LC 518?
                  同一道题两次建模,是这条训练路线特意保留的安排。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="idea"
          title={{ en: "Checkpoint: three strategies compared", zh: "范式雷达 · 阶段小结" }}
        >
          <p>
            <T
              en={
                <>
                  You have now seen three strategies applied to the same kind of
                  problem. <b>Backtracking</b> enumerates every combination: always
                  correct, but with k coin values and a target amount the search
                  tree is about O(k^amount). <b>Greedy</b> takes the largest coin
                  each time: fastest, but it needs a proof, and it fails outright
                  on [1, 3, 4]. <b>DP</b> enumerates the decisions and stores the
                  subproblem answers: always correct, in polynomial time. Working
                  through an optimization problem in that order is a good way to
                  answer in an interview.
                </>
              }
              zh={
                <>
                  走到这里,你已经见过三种策略在同一类问题上的表现:
                  <b>回溯</b>枚举所有拿法(必对,但设面额有 k 种、目标金额为 amount,
                  搜索树约 O(k^amount))→
                  <b>贪心</b>每步拿最大(最快,但需要证明,在 [1, 3, 4] 上直接失效)→
                  <b>DP</b> 枚举决策 + 记住子问题答案(必对,多项式时间)。
                  面试遇到最优化问题,按这个顺序梳理一遍,就是很好的作答顺序。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §08 题单 ================= */}
      <Section
        id="problems"
        index="08"
        title={{
          en: "Problem set: 13 DP problems to start with",
          zh: "高频题单:DP 入门 13 题",
        }}
        desc={{
          en: "Grouped as linear, grid, and decision problems, from easier to harder. Think for 30 seconds before opening the hint.",
          zh: "按「线性 → 网格 → 决策」分层,由易到难。先想 30 秒再看提示",
        }}
        badge={<span className="chip"><T en="Core set" zh="主线必做" /></span>}
      >
        <ProblemSet ch="dp" items={PROBLEMS} />
      </Section>

      {/* ================= §09 Quiz ================= */}
      <Section
        id="quiz"
        index="09"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Answer all 8 correctly to mark this chapter as complete.",
          zh: "8 题全对,点亮本章绿灯",
        }}
        badge={<span className="chip"><T en="✎ Quiz" zh="✎ 通关测验" /></span>}
      >
        <Quiz ch="dp" items={QUIZ} />
      </Section>

      <KeyPoints
        points={{
          en: [
            <>
              DP is <b>recursion plus stored results</b>. It applies when the
              problem has <b>overlapping subproblems</b> (storing pays off) and{" "}
              <b>optimal substructure</b> (stored answers combine into the answer
              above). Divide and conquer has the second but not the first.
            </>,
            <>
              The standard path: <b>brute-force recursion → memoized search →
              tabulation → rolling array</b>. Being able to walk through that chain
              is worth more in an interview than reciting the final solution.
            </>,
            <>
              The five steps: <b>define the state → split by the last step → set
              the base cases → fix the iteration order → check a small example by
              hand</b>. Do not touch the transition before the state is clear.
            </>,
            <>
              The operator follows the question: counting problems <b>add</b>{" "}
              (LC 70, LC 62), optimization problems take <b>min or max</b> (LC 64,
              LC 198, LC 322). Reuse the skeleton, never the operator.
            </>,
            <>
              <b>Choose or skip</b> (LC 198) is the most important decision model
              in DP and leads straight into knapsack.{" "}
              <b>Enumerate the last step</b> (the last coin in LC 322) is the
              general way to start writing a transition.
            </>,
            <>
              The iteration order comes from the transition, not from habit. Every
              cell the transition reads must already hold its final value.
            </>,
            <>
              Complexity of a table DP is <b>(number of states) × (work per
              transition)</b>, and the table itself counts in the space. Space
              drops to O(k) only when the transition reads a fixed set of k recent
              cells — LC 322 does not qualify. Write the full table correctly
              first, then optimize.
            </>,
          ],
          zh: [
            <>
              DP 就是<b>递归 + 把结果记下来</b>。适用前提是<b>重叠子问题</b>
              (记下来才有收益)和<b>最优子结构</b>(记下来的答案能往上拼)。
              分治有后者,没有前者。
            </>,
            <>
              标准推导链:<b>暴力递归 → 记忆化搜索 → 递推填表 → 滚动数组</b> ——
              面试时把这条链讲出来,比直接背最优解值钱。
            </>,
            <>
              五步法:<b>定义状态 → 按「最后一步」写转移 → 初始化 → 定遍历顺序 →
              手推小例子</b>;状态定义没说清之前,不碰转移方程。
            </>,
            <>
              算子跟着问题走:计数题<b>相加</b>(LC 70 / 62),
              最值题<b>取 min / max</b>(LC 64 / 198 / 322)——
              骨架可复用,算子不能抄。
            </>,
            <>
              「<b>选 / 不选</b>」(LC 198)是 DP 最重要的决策模型,直通背包;
              「<b>枚举最后一步</b>」(LC 322 的最后一枚硬币)是写转移的通用起手式。
            </>,
            <>
              遍历顺序由转移方程决定,不靠习惯:
              转移读到的每一格,在被读到时都必须已经是最终值。
            </>,
            <>
              填表型 DP 的复杂度是<b>状态数 × 单次转移代价</b>,
              空间要把表本身算进去。只有当转移读的是固定的最近 k 格时,
              空间才能压到 O(k) —— LC 322 就不满足。
              先写对完整的表,再谈优化。
            </>,
          ],
        }}
      />

      <ChapterFooter ch="dp" />
    </main>
  );
}
