"use client";

// 第 8 章 · 背包问题 —— DP 系列第二章,承接第 7 章「选 / 不选」模型与 322 零钱。
// 十段式结构:为什么是背包 → 0/1 二维表 → 一维滚动(为什么倒序,正序 vs 倒序对比)→
// 装满型(416 精讲)→ 计数型(494 精讲,回溯 vs 背包)→ 二维费用(474)→
// 完全背包(为什么正序,322 复盘)→ 排列 vs 组合(518 vs 377 精讲)→ 题单 → 测验。
// DPTable 是本章主场;一维滚动正序/倒序对比动画在 ./viz(RollingCompare)。
//
// 双语:文案一律用 <T en zh />;组件的文案型 props 传 { en, zh };
// 代码块的 code 传 { en, zh },两半只有注释不同,可执行行逐字节相同(hl 才对得上行号)。
// 术语约定(与 lib/knapsack-data.tsx 一致):
//   0-1 背包 = 0/1 knapsack;完全背包 = unbounded knapsack;
//   多重背包 = bounded knapsack;分组背包 = grouped knapsack。

import "./chapter.css";
import { Hero, Section, Callout, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { DPTable, type DPFrame, type DPCell } from "@/lib/algviz";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { T } from "@/lib/i18n";
import { PROBLEMS, QUIZ } from "@/lib/knapsack-data";
import { KnapSackLab, RollingCompare, TargetSumTree } from "./viz";

/* ============ 通用一维行帧生成器 ============ */

function row1D(
  vals: (number | string)[],
  o: { cur?: number[]; src?: number[]; ok?: number[]; ghost?: number[] } = {},
): DPCell[][] {
  return [
    vals.map((v, i) => {
      let state: DPCell["state"];
      if (o.ok?.includes(i)) state = "ok";
      else if (o.cur?.includes(i)) state = "cur";
      else if (o.src?.includes(i)) state = "src";
      else if (o.ghost?.includes(i)) state = "ghost";
      else state = "done";
      return { v, state };
    }),
  ];
}

/* ============ 精讲基座 · 0-1 背包二维表 ============ */
/* 物品 w=[1,3,4] v=[15,20,30],容量 W=4;答案 dp[3][4]=35(物品①+②) */

const DP2 = [
  [0, 0, 0, 0, 0],
  [0, 15, 15, 15, 15],
  [0, 15, 15, 20, 35],
  [0, 15, 15, 20, 35],
];

function knap2D(
  uptoRow: number,
  cur?: [number, number],
  srcs?: [number, number][],
  ok?: [number, number],
): DPCell[][] {
  return DP2.map((row, i) =>
    row.map((v, j) => {
      if (ok && ok[0] === i && ok[1] === j) return { v, state: "ok" as const };
      if (cur && cur[0] === i && cur[1] === j) return { v, state: "cur" as const };
      if (srcs?.some(([a, b]) => a === i && b === j)) return { v, state: "src" as const };
      if (i <= uptoRow) return { v, state: "done" as const };
      return { v: "?", state: "ghost" as const };
    }),
  );
}

const F_2D: DPFrame[] = [
  {
    cells: knap2D(-1),
    msg: (
      <T
        en={
          <>
            Items: ① weight 1, value 15 · ② weight 3, value 20 · ③ weight 4,
            value 30. The bag holds <b>4</b>. State:{" "}
            <b>
              dp[i][j] = the largest value you can reach using only the first i
              items, with total weight at most j
            </b>
            . The whole table is still empty.
          </>
        }
        zh={
          <>
            物品:① 重 1、值 15 · ② 重 3、值 20 · ③ 重 4、值 30,背包容量 <b>4</b>。
            状态:
            <b>dp[i][j] = 只用前 i 件物品、总重量不超过 j 时,能取到的最大价值</b>
            。整张表还没填。
          </>
        }
      />
    ),
  },
  {
    cells: knap2D(0),
    msg: (
      <T
        en={
          <>
            Row 0 = <b>no item is available</b>. Whatever the capacity, the value
            is 0. This is the base case, and every other row is built from it.
          </>
        }
        zh={
          <>
            第 0 行 = <b>一件物品都还没有</b>:无论容量多大,价值都是 0。
            这是基准情形,其余每一行都由它推出来。
          </>
        }
      />
    ),
  },
  {
    cells: knap2D(1, [1, 4], [[0, 4], [0, 3]]),
    msg: (
      <T
        en={
          <>
            Item ① (weight 1, value 15) fits whenever j ≥ 1. dp[1][4] = max(
            <b>skip</b> dp[0][4] = 0, <b>take</b> dp[0][<b>4−1</b>] + 15 = 15) ={" "}
            <b>15</b>. To take an item you first <b>free 1 unit of capacity</b>,
            then add its value.
          </>
        }
        zh={
          <>
            物品①(重 1、值 15)在 j ≥ 1 时都装得下。dp[1][4] = max(
            <b>不装</b> dp[0][4] = 0,<b>装</b> dp[0][<b>4−1</b>] + 15 = 15)={" "}
            <b>15</b>。「装」这一项要先<b>腾出 1 的容量</b>,再加上它的价值。
          </>
        }
      />
    ),
  },
  {
    cells: knap2D(2, [2, 4], [[1, 4], [1, 1]]),
    msg: (
      <T
        en={
          <>
            Item ② (weight 3, value 20) makes the first real choice at dp[2][4].{" "}
            <b>Skip</b> = dp[1][4] = 15. <b>Take</b> = dp[1][<b>4−3</b>] + 20 = 15
            + 20 = <b>35</b>. Taking wins.
          </>
        }
        zh={
          <>
            物品②(重 3、值 20)在 dp[2][4] 面临第一次真正的二选一:
            <b>不装</b> = dp[1][4] = 15;<b>装</b> = dp[1][<b>4−3</b>] + 20 = 15 +
            20 = <b>35</b>。装赢了。
          </>
        }
      />
    ),
  },
  {
    cells: knap2D(3, [3, 4], [[2, 4], [2, 0]]),
    msg: (
      <T
        en={
          <>
            Item ③ (weight 4, value 30) at dp[3][4]: <b>skip</b> = dp[2][4] = 35;{" "}
            <b>take</b> = dp[2][4−4] + 30 = 30. This time <b>skipping wins</b>.
            Item ③ alone is worth more than either ① or ②, but taking it uses the
            whole bag and leaves no room for the pair ① + ②, which is worth more
            together.
          </>
        }
        zh={
          <>
            物品③(重 4、值 30)在 dp[3][4]:<b>不装</b> = dp[2][4] = 35;
            <b>装</b> = dp[2][4−4] + 30 = 30。这次<b>不装赢了</b> ——
            物品③单件价值最高,但装下它就占满整个背包,再也放不下更值钱的组合 ① + ②。
          </>
        }
      />
    ),
  },
  {
    cells: knap2D(3, undefined, undefined, [3, 4]),
    msg: (
      <T
        en={
          <>
            The bottom-right cell, <b>35</b>, is the answer (items ① and ②). The
            table has (n+1)(W+1) cells and each one costs O(1), so the time is{" "}
            <b>O(nW)</b> and the space is O(nW) as well, before the reduction in
            §03. Here that is 4 × 5 = 20 cells, instead of the 2³ subsets a
            brute-force search would list.
          </>
        }
        zh={
          <>
            右下角的 <b>35</b> 就是答案(装物品 ① 和 ②)。表共 (n+1)(W+1) 格、
            每格 O(1),所以时间 <b>O(nW)</b>,在 §03 压缩之前空间也是 O(nW)。
            这里是 4 × 5 = 20 格,而暴力枚举要列出 2³ 个子集。
          </>
        }
      />
    ),
  },
];

/* ============ §03 · 一维滚动:与二维每一行对齐 ============ */

const F_ROLL: DPFrame[] = [
  {
    cells: row1D([0, 0, 0, 0, 0]),
    msg: (
      <T
        en={
          <>
            Keep one row only: dp[j] = the largest value that fits in capacity j,
            all cells starting at 0. For each item, sweep this row once from right
            to left (<b>capacity descending</b>). After the sweep, the row equals
            the matching row of the two-dimensional table.
          </>
        }
        zh={
          <>
            只留一行:dp[j] = 容量 j 时的最大价值,初值全 0。
            每来一件物品,就从右往左把这一行刷一遍(<b>容量倒序</b>)。
            刷完之后,这一行正好等于二维表的对应行。
          </>
        }
      />
    ),
  },
  {
    cells: row1D([0, 15, 15, 15, 15], { cur: [1, 2, 3, 4] }),
    msg: (
      <T
        en={
          <>
            After item ① (weight 1, value 15): dp = [0, 15, 15, 15, 15] — the same
            numbers as row 1 of the two-dimensional table.
          </>
        }
        zh={
          <>
            处理完物品①(重 1、值 15):dp = [0, 15, 15, 15, 15] ——
            和二维表第 1 行的数字完全相同。
          </>
        }
      />
    ),
  },
  {
    cells: row1D([0, 15, 15, 20, 35], { cur: [3, 4] }),
    msg: (
      <T
        en={
          <>
            After item ② (weight 3, value 20): dp[4] becomes 35 and dp[3] becomes
            20, which is row 2. Why must the sweep run from right to left? The
            comparison below answers that.
          </>
        }
        zh={
          <>
            处理完物品②(重 3、值 20):dp[4] 变成 35、dp[3] 变成 20,
            这就是第 2 行。为什么必须从右往左刷?下面的对比动画会回答。
          </>
        }
      />
    ),
  },
  {
    cells: row1D([0, 15, 15, 20, 35], { ok: [4] }),
    msg: (
      <T
        en={
          <>
            Item ③ (weight 4, value 30) changes nothing, and dp[4] = <b>35</b> is
            the answer. The space drops from O(nW) to <b>O(W)</b>: the table
            collapses into one row. The time stays O(nW).
          </>
        }
        zh={
          <>
            物品③(重 4、值 30)刷完后 dp 没有变化,dp[4] = <b>35</b> 就是答案。
            空间从 O(nW) 降到 <b>O(W)</b> —— 整张表塌成一行,时间仍是 O(nW)。
          </>
        }
      />
    ),
  },
];

/* ============ 精讲 A · LC 416 分割等和子集(布尔装满型) ============ */
/* nums=[1,5,11,5] sum=22 target=11;子集 {1,5,5}=11 ⇒ 可等分 */

function boolRow(
  reach: Set<number>,
  n: number,
  extra: { cur?: number[]; ok?: number[] } = {},
): DPCell[][] {
  const vals = Array.from({ length: n }, (_, i) => (reach.has(i) ? "✓" : "·"));
  const ghost = Array.from({ length: n }, (_, i) => i).filter((i) => !reach.has(i));
  return row1D(vals, { ghost, ...extra });
}

const F_416: DPFrame[] = [
  {
    cells: boolRow(new Set([0]), 12),
    msg: (
      <T
        en={
          <>
            sum = 22, so target = <b>11</b>. State: dp[j] is true when some of the
            numbers processed so far add up to exactly j. At the start only dp[0]
            is ✓, because choosing nothing adds up to 0. The goal is to light up
            dp[11].
          </>
        }
        zh={
          <>
            sum = 22,所以 target = <b>11</b>。状态:dp[j] = 用已经处理过的那些数,
            能否正好凑出 j。初始只有 dp[0] 为 ✓(什么都不选,和为 0)。
            目标是点亮 dp[11]。
          </>
        }
      />
    ),
  },
  {
    cells: boolRow(new Set([0, 1]), 12, { cur: [1] }),
    msg: (
      <T
        en={
          <>
            Process the number <b>1</b>: wherever dp[j−1] is ✓, dp[j] becomes ✓ as
            well, so dp[1] lights up. The sweep runs with capacity descending, so
            this 1 is used at most once.
          </>
        }
        zh={
          <>
            处理数字 <b>1</b>:凡是 dp[j−1] 为 ✓ 的位置,dp[j] 也变成 ✓,
            于是 dp[1] 点亮。容量倒序刷,保证这个 1 最多只被用一次。
          </>
        }
      />
    ),
  },
  {
    cells: boolRow(new Set([0, 1, 5, 6]), 12, { cur: [5, 6] }),
    msg: (
      <T
        en={
          <>
            Process <b>5</b>: dp[5] (= 5) and dp[6] (= 1 + 5) light up. Reachable
            sums so far: {"{0, 1, 5, 6}"}.
          </>
        }
        zh={
          <>
            处理 <b>5</b>:dp[5](= 5)和 dp[6](= 1 + 5)相继点亮。
            目前可达的和:{"{0, 1, 5, 6}"}。
          </>
        }
      />
    ),
  },
  {
    cells: boolRow(new Set([0, 1, 5, 6, 11]), 12, { cur: [11] }),
    msg: (
      <T
        en={
          <>
            Process <b>11</b>: dp[11] reads dp[0], which is ✓, so{" "}
            <b>dp[11] lights up</b>. The subset {"{11}"} is already one half on its
            own.
          </>
        }
        zh={
          <>
            处理 <b>11</b>:dp[11] 读 dp[0],它是 ✓,于是 <b>dp[11] 点亮</b>。
            子集 {"{11}"} 自己就已经是其中一半。
          </>
        }
      />
    ),
  },
  {
    cells: boolRow(new Set([0, 1, 5, 6, 10, 11]), 12, { ok: [11] }),
    msg: (
      <T
        en={
          <>
            Process the second <b>5</b>: dp[10] (= 5 + 5) becomes reachable too.
            dp[11] was already true, so the array <b>can be split</b>:{" "}
            {"{1, 5, 5}"} against {"{11}"}. Time O(n × target), space O(target).
          </>
        }
        zh={
          <>
            处理第二个 <b>5</b>:dp[10](= 5 + 5)也变得可达。dp[11] 早已为真,
            所以数组<b>可以等分</b>:{"{1, 5, 5}"} 与 {"{11}"}。
            时间 O(n × target),空间 O(target)。
          </>
        }
      />
    ),
  },
];

/* ============ 精讲 B · LC 494 目标和(计数型) ============ */
/* 与上方决策树同一实例:nums=[1,1,1] target=1 → P=(3+1)/2=2;凑 2 的子集数 = C(3,2)=3 */

const F_494: DPFrame[] = [
  {
    cells: row1D([1, 0, 0], { ghost: [1, 2] }),
    msg: (
      <T
        en={
          <>
            The same instance as the tree above (nums = [1,1,1], target = 1).
            After the rewrite the question is: how many subsets add up to P = 2?
            State: dp[j] is the number of subsets that add up to j, and dp[0] ={" "}
            <b>1</b> because the empty subset adds up to 0. Transition:{" "}
            <span className="mono">dp[j] += dp[j−num]</span>, capacity descending.
          </>
        }
        zh={
          <>
            还是上面那棵树的实例(nums = [1,1,1],target = 1)。
            转化之后问题变成:和为 P = 2 的子集有几个?
            状态:dp[j] = 和为 j 的子集个数,dp[0] = <b>1</b>(空集的和是 0)。
            转移:<span className="mono">dp[j] += dp[j−num]</span>,容量倒序。
          </>
        }
      />
    ),
  },
  {
    cells: row1D([1, 1, 0], { cur: [1], ghost: [2] }),
    msg: (
      <T
        en={<>Process the first 1: dp[1] += dp[0], so dp = [1, 1, 0].</>}
        zh={<>处理第 1 个「1」:dp[1] += dp[0],于是 dp = [1, 1, 0]。</>}
      />
    ),
  },
  {
    cells: row1D([1, 2, 1], { cur: [1, 2] }),
    msg: (
      <T
        en={
          <>
            Process the second 1: dp = [1, 2, 1]. That is row 2 of Pascal&apos;s
            triangle, and for a good reason — every cell is the sum of two cells
            from the previous state.
          </>
        }
        zh={
          <>
            处理第 2 个「1」:dp = [1, 2, 1] —— 这是杨辉三角的第 2 行,
            原因也很直接:每一格都是上一轮两个格子相加得到的。
          </>
        }
      />
    ),
  },
  {
    cells: row1D([1, 3, 3], { ok: [2] }),
    msg: (
      <T
        en={
          <>
            Process the third 1: dp = [1, 3, 3], and dp[2] = <b>3</b> = C(3,2).
            That matches the <b>3</b> paths the decision tree found (++−, +−+,
            −++), but the work here is O(n × P) instead of 2ⁿ.
          </>
        }
        zh={
          <>
            处理第 3 个「1」:dp = [1, 3, 3],dp[2] = <b>3</b> = C(3,2)。
            这与决策树数出的 <b>3</b> 条路径(++−、+−+、−++)一致,
            但工作量是 O(n × P),而不是 2ⁿ。
          </>
        }
      />
    ),
  },
];

/* ============ §07 · 完全背包重建模 322(硬币逐枚正序) ============ */
/* coins=[1,3,4] amount=6;dp[6]=2(3+3),与第 7 章 min-DP 结论一致 */

const INF = "∞";
const F_322: DPFrame[] = [
  {
    cells: row1D([0, INF, INF, INF, INF, INF, INF], { ghost: [1, 2, 3, 4, 5, 6] }),
    msg: (
      <T
        en={
          <>
            A different model for the same problem: a coin is an item with{" "}
            <b>unlimited supply</b>, and the amount is the capacity. dp[j] is the
            smallest number of coins that add up to j. dp[0] = 0, and every other
            cell starts at ∞. In the unbounded knapsack the inner capacity loop
            runs <b>upward</b>.
          </>
        }
        zh={
          <>
            换一种建模:硬币是<b>可以无限取</b>的物品,金额就是容量。
            dp[j] = 凑出 j 所需的最少硬币数,dp[0] = 0,其余先记为 ∞。
            完全背包的内层容量循环<b>正序</b>。
          </>
        }
      />
    ),
  },
  {
    cells: row1D([0, 1, 2, 3, 4, 5, 6], { cur: [1, 2, 3, 4, 5, 6] }),
    msg: (
      <T
        en={
          <>
            Sweep coin <b>¥1</b> upward: dp[2] = dp[1] + 1 = 2, and dp[6] = 6.
            Note that dp[2] already uses <b>two ¥1 coins</b>. Going up feeds a
            cell that this same pass has updated into a larger capacity, so one
            coin is <b>used again</b> — which is exactly what unlimited supply
            means.
          </>
        }
        zh={
          <>
            硬币 <b>¥1</b> 正序刷一遍:dp[2] = dp[1] + 1 = 2,dp[6] = 6。
            注意 dp[2] 已经用了<b>两枚 ¥1</b>。正序会把本轮刚更新过的格子
            再喂给更大的容量,同一种硬币因此<b>被再次取用</b> ——
            这正是「无限供应」的含义。
          </>
        }
      />
    ),
  },
  {
    cells: row1D([0, 1, 2, 1, 2, 3, 2], { cur: [6], src: [3] }),
    msg: (
      <T
        en={
          <>
            Coin <b>¥3</b>: first dp[3] = dp[0] + 1 = 1. The interesting cell is
            dp[6] = <b>dp[3]</b> + 1 = <b>2</b>. The dashed dp[3] already contains
            one ¥3, and going <b>up</b> lets that result be read again, so adding
            one more ¥3 gives two. That is where the 3 + 3 solution comes from.
          </>
        }
        zh={
          <>
            硬币 <b>¥3</b>:先有 dp[3] = dp[0] + 1 = 1。关键的一格是
            dp[6] = <b>dp[3]</b> + 1 = <b>2</b>。虚线框里的 dp[3] 已经含一枚 ¥3,
            <b>正序</b>让这个结果被再次读到,再加一枚 ¥3 就是两枚 ——
            凑 6 元的 3 + 3 走法就是这么来的。
          </>
        }
      />
    ),
  },
  {
    cells: row1D([0, 1, 2, 1, 1, 2, 2], { ok: [6], cur: [4, 5] }),
    msg: (
      <T
        en={
          <>
            Coin <b>¥4</b>: dp[4] = dp[0] + 1 = 1, and dp[6] stays <b>2</b>. The
            answer is <b>2</b> coins (3 + 3). Chapter 7 reached the same number by
            asking which coin is the last one; this pass fills the same array one
            coin type at a time.
          </>
        }
        zh={
          <>
            硬币 <b>¥4</b>:dp[4] = dp[0] + 1 = 1,dp[6] 保持 <b>2</b>。
            答案是 <b>2</b> 枚(3 + 3)。第 7 章用「枚举最后一枚硬币」得到同一个数字,
            这里换成「一种硬币一种硬币地填」同一个数组。
          </>
        }
      />
    ),
  },
];

/* ============ 精讲 C · LC 518 组合数(外硬币内容量) ============ */
/* coins=[1,2,5] amount=5 → 4 种组合 */

const F_518: DPFrame[] = [
  {
    cells: row1D([1, 0, 0, 0, 0, 0], { ghost: [1, 2, 3, 4, 5] }),
    msg: (
      <T
        en={
          <>
            Count the <b>combinations</b> that make 5 (1 + 2 and 2 + 1 count as
            one). dp[j] is the number of combinations that make j, and dp[0] = 1.{" "}
            <b>Coins are the outer loop</b> and capacity runs upward inside. That
            nesting is what makes the count come out as combinations.
          </>
        }
        zh={
          <>
            求凑出 5 元的<b>组合</b>数(1 + 2 与 2 + 1 算一种)。
            dp[j] = 凑出 j 的组合数,dp[0] = 1。
            <b>外层遍历硬币</b>,内层容量正序 —— 正是这个嵌套顺序让结果是组合数。
          </>
        }
      />
    ),
  },
  {
    cells: row1D([1, 1, 1, 1, 1, 1], { cur: [1, 2, 3, 4, 5] }),
    msg: (
      <T
        en={
          <>
            With only <b>¥1</b> available, every amount has exactly one
            combination: all ones. dp = [1, 1, 1, 1, 1, 1].
          </>
        }
        zh={
          <>
            只有 <b>¥1</b> 可用时,每个金额都只有一种组合:全用 1。
            dp = [1, 1, 1, 1, 1, 1]。
          </>
        }
      />
    ),
  },
  {
    cells: row1D([1, 1, 2, 2, 3, 3], { cur: [2, 3, 4, 5] }),
    msg: (
      <T
        en={
          <>
            Add <b>¥2</b>: dp[j] += dp[j−2]. dp[4] = 3 (1+1+1+1, 1+1+2, 2+2) and
            dp[5] = 3. Because ¥2 enters after ¥1 and never before it, the order
            &quot;2 then 1&quot; is never counted as a separate way.
          </>
        }
        zh={
          <>
            加入 <b>¥2</b>:dp[j] += dp[j−2]。dp[4] = 3(1+1+1+1、1+1+2、2+2),
            dp[5] = 3。因为 ¥2 在 ¥1 之后才登场、永远排在它后面,
            「先 2 后 1」这种顺序不会被单独数一次。
          </>
        }
      />
    ),
  },
  {
    cells: row1D([1, 1, 2, 2, 3, 4], { ok: [5] }),
    msg: (
      <T
        en={
          <>
            Add <b>¥5</b>: dp[5] += dp[0], giving <b>4</b> combinations: {"{5}"},{" "}
            {"{1,2,2}"}, {"{1,1,1,2}"}, {"{1,1,1,1,1}"}.
          </>
        }
        zh={
          <>
            加入 <b>¥5</b>:dp[5] += dp[0],得到 <b>4</b> 种组合:{"{5}"}、
            {"{1,2,2}"}、{"{1,1,1,2}"}、{"{1,1,1,1,1}"}。
          </>
        }
      />
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "why", n: "01", label: { en: "Why a knapsack", zh: "为什么是背包" } },
  { id: "table2d", n: "02", label: { en: "The 2-D table", zh: "0-1 二维表" } },
  { id: "rolling", n: "03", label: { en: "Why descending", zh: "一维 · 为什么倒序" } },
  { id: "subset", n: "04", label: { en: "Fill exactly · 416", zh: "装满型 · 416" } },
  { id: "count", n: "05", label: { en: "Counting · 494", zh: "计数型 · 494" } },
  { id: "twocost", n: "06", label: { en: "Two costs · 474", zh: "二维费用 · 474" } },
  { id: "complete", n: "07", label: { en: "Unbounded · ascending", zh: "完全背包 · 正序" } },
  { id: "permcomb", n: "08", label: { en: "Combinations vs permutations", zh: "组合 vs 排列" } },
  { id: "problems", n: "09", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "10", label: { en: "Quiz", zh: "通关测验" } },
];

export default function KnapsackChapter() {
  return (
    <main className="page" data-ch="knapsack">
      <Hero
        ch="knapsack"
        title={{
          en: (
            <>
              Knapsack <span className="grad">Problems</span>
            </>
          ),
          zh: (
            <>
              背包问题 <span className="grad">Knapsack</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A bag with a fixed capacity, and a set of items that each have a
              weight and a value — <strong>which items give the most value?</strong>{" "}
              The model itself is small. What makes it worth a chapter is how many
              problems are this problem in another form: splitting an array,
              making change, cutting a sentence into words, rolling dice. This
              chapter turns the take-or-skip decision from Chapter 7 into a fixed
              modelling procedure, and explains the one line that is most often
              written the wrong way round:{" "}
              <strong>
                in the one-dimensional form, does the capacity loop run down or
                up?
              </strong>
            </>
          ),
          zh: (
            <>
              一个容量固定的背包,一批各有重量和价值的物品 ——{" "}
              <strong>装哪些,总价值最大?</strong>模型本身很小,
              值得单开一章的是:有太多题目其实就是它换了个说法 ——
              分割数组、凑硬币、把句子切成单词、掷骰子。
              本章把第 7 章的「选 / 不选」整理成一套固定的建模流程,
              并讲清最容易写反的那一行:
              <strong>一维形态下,容量循环到底是倒序还是正序?</strong>
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 为什么是背包 ================= */}
      <Section
        id="why"
        index="01"
        title={{
          en: "Why a knapsack: take-or-skip, plus a capacity limit",
          zh: "为什么是背包:「选 / 不选」加上一条容量限制",
        }}
        desc={{
          en: "The decision model from House Robber in Chapter 7, with one extra rule: the total weight cannot exceed the capacity.",
          zh: "第 7 章打家劫舍的决策模型,加一条规则:总重量不能超过容量",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  In House Robber each house had two options: rob it or skip it.
                  The knapsack problem is almost the same. Each item has two
                  options: <strong>take it or leave it</strong>. The one new
                  element is a <strong>capacity limit</strong>: the weights of the
                  items you take must add up to no more than the capacity of the
                  bag. Pack the bag yourself first and see how the limit changes
                  the decisions.
                </>
              }
              zh={
                <>
                  打家劫舍里每间房只有两个选择:偷或不偷。背包问题几乎一样 ——
                  每件物品也只有两个选择:<strong>装或不装</strong>。
                  唯一的新东西是一条<strong>容量限制</strong>:
                  装进去的物品,重量之和不能超过背包容量。
                  先自己装一次,看看这条限制如何改变每一步的决策。
                </>
              }
            />
          </p>
        </div>
        <KnapSackLab />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  <b>What does brute force cost?</b> Each item is taken or not, so
                  n items give 2ⁿ subsets. Checking every subset&apos;s weight and
                  value is about a billion steps at n = 30, which is far too slow.
                  That is the same growth as the backtracking tree in Chapter 5.{" "}
                  <b>Why can it be improved?</b> Because the same subproblem is
                  asked many times. &quot;The best value from the first 3 items
                  with capacity 5&quot; is reached by many different decision
                  paths, and the answer is the same every time. Overlapping
                  subproblems plus optimal substructure — the best answer for a
                  smaller capacity is part of the best answer for a larger one —
                  are exactly the two conditions DP needs.
                </>
              }
              zh={
                <>
                  <b>暴力要花多少?</b>每件物品选或不选,n 件就有 2ⁿ 个子集。
                  逐个检查重量与价值,n = 30 时约十亿步,远远跑不完 ——
                  和第 5 章回溯树的增长完全一样。
                  <b> 为什么能优化?</b>因为同一个子问题被反复问到:
                  「前 3 件、容量 5 的最大价值」会被很多条不同的决策路径问到,
                  而答案每次都相同。重叠子问题,加上最优子结构
                  (小容量的最优解是大容量最优解的一部分)——
                  这正是 DP 需要的两个条件。
                </>
              }
            />
          </p>
        </div>
        <div className="kp-def">
          <h4>
            <T
              en={<>📦 Four questions that turn a problem into a knapsack</>}
              zh={<>📦 把一道题变成背包的四个问句</>}
            />
          </h4>
          <p>
            <T
              en={
                <>
                  ① <b>What is an item</b> (the thing you decide on, one at a
                  time)? ② <b>What is the capacity</b> (the limited resource —
                  often a sum, an amount, or a length)? ③{" "}
                  <b>How many times may one item be used</b> (at most once = 0/1
                  knapsack; any number of times = unbounded knapsack; at most k
                  times = bounded knapsack)? ④ <b>What is being asked</b> (largest
                  value / can it be filled exactly / how many ways / fewest
                  items)? Answer these four and the code is nearly fixed.
                </>
              }
              zh={
                <>
                  ① <b>什么是物品</b>(被一件件决策的东西)?②{" "}
                  <b>什么是容量</b>(那个受限资源,常常是「和 / 金额 / 长度」)?③{" "}
                  <b>每件最多用几次</b>(最多一次 = 0-1 背包;任意多次 = 完全背包;
                  最多 k 次 = 多重背包)?④{" "}
                  <b>问的是什么</b>(最大价值 / 能否正好装满 / 有几种方案 /
                  最少件数)?这四问答完,代码基本就定下来了。
                </>
              }
            />
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Uses per item" zh="每件用几次" />
            </div>
            <div className="card-title">
              <T en="0/1 knapsack" zh="0-1 背包" />
            </div>
            <p>
              <T
                en={
                  <>
                    Each item is used <b>at most once</b>. This is the base form:
                    LC 416, LC 494, and LC 474 are all 0/1 knapsacks. In the
                    one-dimensional form the capacity loop runs <b>downward</b>.
                  </>
                }
                zh={
                  <>
                    每件物品<b>最多用一次</b>。这是最基础的形态:LC 416、LC 494、
                    LC 474 都属于它。一维形态下,容量循环<b>倒序</b>。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Uses per item" zh="每件用几次" />
            </div>
            <div className="card-title">
              <T en="♾️ Unbounded knapsack" zh="♾️ 完全背包" />
            </div>
            <p>
              <T
                en={
                  <>
                    Each item may be used <b>any number of times</b>. LC 322, LC
                    279, and LC 139 are unbounded. In the one-dimensional form the
                    capacity loop runs <b>upward</b> — one line different from the
                    0/1 form.
                  </>
                }
                zh={
                  <>
                    每件物品可以用<b>任意多次</b>。LC 322、LC 279、LC 139 属于它。
                    一维形态下,容量循环<b>正序</b> —— 与 0-1 只差这一行。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Uses per item" zh="每件用几次" />
            </div>
            <div className="card-title">
              <T en="Bounded and grouped" zh="多重背包与分组背包" />
            </div>
            <p>
              <T
                en={
                  <>
                    <b>Bounded</b>: item i may be used at most k times. Splitting
                    it into k separate 0/1 items always works. <b>Grouped</b>:
                    items come in groups and you take at most one, or exactly one,
                    from each group. LC 1155 (dice) is the grouped form: every die
                    contributes exactly one face. §07 comes back to both.
                  </>
                }
                zh={
                  <>
                    <b>多重背包</b>:第 i 件最多用 k 次,把它拆成 k 件 0-1
                    物品总是可行。<b>分组背包</b>:物品分成若干组,
                    每组最多选一件(或必须恰好选一件)。LC 1155
                    掷骰子就是分组形态:每个骰子恰好贡献一个面。§07 会回到这两种。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="story"
          title={{
            en: "The knapsack problem is old, and it is still NP-hard",
            zh: "背包问题很老,而且至今仍是 NP 困难的",
          }}
        >
          <p>
            <T
              en={
                <>
                  The knapsack problem is one of the most studied problems in
                  operations research, with work on it going back more than a
                  century. It has also been used in cryptography: the 1978
                  Merkle–Hellman scheme took its security from the difficulty of
                  subset sum, and was broken by Shamir in 1982.
                  <br />
                  One thing to be careful about: the O(nW) solution in this
                  chapter is <b>not</b> a polynomial-time algorithm for the
                  general problem. W is a <i>value</i>, and writing that value
                  down takes only about log W digits, so O(nW) is exponential in
                  the size of the input. An algorithm whose cost is polynomial in
                  the numeric values, but not in the input length, is called{" "}
                  <b>pseudo-polynomial</b>. The 0/1 knapsack problem is NP-hard,
                  and no polynomial-time algorithm for it is known. The problems
                  in this chapter are solvable because their capacities are small:
                  LC 416 caps the total at 20000, LC 322 caps the amount at 10⁴.
                </>
              }
              zh={
                <>
                  背包问题是运筹学中被研究得最多的问题之一,相关工作可以追溯到一个多世纪前。
                  它也曾被用于密码学:1978 年的 Merkle–Hellman 方案就把安全性建立在
                  子集和的困难性上,1982 年被 Shamir 攻破。
                  <br />
                  有一点要说清楚:本章的 O(nW) 解法<b>并不是</b>
                  一般背包问题的多项式时间算法。W 是一个<i>数值</i>,
                  把它写下来只需要约 log W 位,所以 O(nW) 相对于输入长度是指数级的。
                  这种「对数值是多项式、对输入长度不是」的复杂度叫
                  <b>伪多项式</b>。0/1 背包问题是 NP 困难的,至今没有已知的多项式算法。
                  本章这些题之所以能做,是因为容量本身很小:LC 416 的总和上限是 20000,
                  LC 322 的金额上限是 10⁴。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 0-1 背包二维表 ================= */}
      <Section
        id="table2d"
        index="02"
        title={{
          en: "The 0/1 knapsack, starting from a two-dimensional table",
          zh: "0-1 背包:从一张二维表推起",
        }}
        desc={{
          en: "dp[i][j] = the largest value using the first i items with weight at most j — take-or-skip written as a recurrence.",
          zh: "dp[i][j] = 只用前 i 件、总重不超过 j 时的最大价值 —— 把「装 / 不装」写成递推式",
        }}
        badge={
          <span className="chip">
            <T en="Foundation" zh="地基" />
          </span>
        }
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Follow the five steps from Chapter 7. <b>Define the state in
                  words first:</b>{" "}
                  <code>
                    dp[i][j] = the largest value you can reach when only the first
                    i items are available and the total weight is at most j
                  </code>
                  . <b>Then write the transition.</b> Standing in front of item i,
                  there are exactly two options:
                </>
              }
              zh={
                <>
                  按第 7 章的五步法来。<b>先用一句话定义状态:</b>
                  <code>
                    dp[i][j] = 只有前 i 件物品可用、且总重量不超过 j 时,
                    能取到的最大价值
                  </code>
                  。<b>再写转移。</b>站在第 i 件物品面前,只有两个选择:
                </>
              }
            />
          </p>
          <ul>
            <li>
              <T
                en={
                  <>
                    <b>Skip it:</b> the value is the best you could do with the
                    first i−1 items and the same capacity j, which is{" "}
                    <code>dp[i−1][j]</code>.
                  </>
                }
                zh={
                  <>
                    <b>不装它:</b>价值等于「只用前 i−1 件、容量仍是 j」时的最优,
                    即 <code>dp[i−1][j]</code>。
                  </>
                }
              />
            </li>
            <li>
              <T
                en={
                  <>
                    <b>Take it:</b> first free w[i] of capacity, then add its
                    value, which is <code>dp[i−1][j−w[i]] + v[i]</code>. This
                    option only exists when j ≥ w[i].
                  </>
                }
                zh={
                  <>
                    <b>装它:</b>先腾出 w[i] 的容量,再加上它的价值,即{" "}
                    <code>dp[i−1][j−w[i]] + v[i]</code>。只有 j ≥ w[i] 时才有这个选项。
                  </>
                }
              />
            </li>
          </ul>
          <p>
            <T
              en={
                <>
                  Take the larger of the two. <b>Base case:</b> row 0 is all
                  zeros, because with no item available the value is 0 at every
                  capacity. <b>The answer</b> is dp[n][W], the bottom-right cell.
                  Watch the table fill in, cell by cell. A dashed blue cell is a
                  value the current cell reads.
                </>
              }
              zh={
                <>
                  两者取较大。<b>基准情形:</b>第 0 行全是 0 ——
                  没有物品可用时,任何容量下的价值都是 0。<b>答案</b>
                  在 dp[n][W],也就是右下角那一格。
                  逐格看这张表怎么填出来,蓝色虚线格是当前格读取的值。
                </>
              }
            />
          </p>
        </div>
        <div className="kp-formula">
          dp[i][j] = max( <b>dp[i−1][j]</b>{" "}
          <span className="dim">
            <T en="skip" zh="不装" />
          </span>{" "}
          , <b>dp[i−1][j−w[i]] + v[i]</b>{" "}
          <span className="dim">
            <T en="take (needs j ≥ w[i])" zh="装(需 j ≥ w[i])" />
          </span>{" "}
          )
        </div>
        <DPTable
          title={{
            en: "0/1 knapsack · filling the 2-D table row by row (w = [1,3,4], v = [15,20,30], capacity 4)",
            zh: "0-1 背包 · 二维表逐行填充(w = [1,3,4],v = [15,20,30],容量 4)",
          }}
          frames={F_2D}
          colLabels={["0", "1", "2", "3", "4"]}
          rowLabels={{
            en: ["none", "① w1 v15", "② w3 v20", "③ w4 v30"],
            zh: ["∅", "① w1·v15", "② w3·v20", "③ w4·v30"],
          }}
          cornerLabel="i \ j"
          cellW={62}
        />
        <CodeTabs
          title="knapsack01_2d"
          java={{
            code: {
              en: `class Solution {
    // 0/1 knapsack: largest value from the first i items with capacity j
    public int knapsack01(int[] w, int[] v, int W) {
        int n = w.length;
        int[][] dp = new int[n + 1][W + 1];      // dp[0][*] = 0: no item, no value
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j <= W; j++) {
                dp[i][j] = dp[i - 1][j];         // skip item i
                if (j >= w[i - 1])               // only take it if it fits
                    dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - w[i - 1]] + v[i - 1]);
            }
        }
        return dp[n][W];
    }
}`,
              zh: `class Solution {
    // 0-1 背包:只用前 i 件物品、容量 j 时的最大价值
    public int knapsack01(int[] w, int[] v, int W) {
        int n = w.length;
        int[][] dp = new int[n + 1][W + 1];      // dp[0][*] = 0:没有物品就没有价值
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j <= W; j++) {
                dp[i][j] = dp[i - 1][j];         // 不装第 i 件
                if (j >= w[i - 1])               // 装得下才考虑装
                    dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - w[i - 1]] + v[i - 1]);
            }
        }
        return dp[n][W];
    }
}`,
            },
            hl: [8, 9, 10],
            note: {
              en: (
                <>
                  <b>Common mistake:</b> item indices start at 0 but dp rows start
                  at 1, because row 0 is reserved for &quot;no item available&quot;.
                  So item i lives at <code>w[i-1]</code> and <code>v[i-1]</code>.
                  Mixing the two index bases is the usual off-by-one here.
                </>
              ),
              zh: (
                <>
                  <b>常见错误:</b>物品下标从 0 开始,dp 的行号却从 1 开始
                  (第 0 行留给「没有物品」)。所以第 i 件物品要写{" "}
                  <code>w[i-1]</code>、<code>v[i-1]</code>。
                  两套下标混用,就是这里最常见的差一错误。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def knapsack01(self, w: list[int], v: list[int], W: int) -> int:
        n = len(w)
        dp = [[0] * (W + 1) for _ in range(n + 1)]
        for i in range(1, n + 1):
            for j in range(W + 1):
                dp[i][j] = dp[i - 1][j]                      # skip
                if j >= w[i - 1]:
                    dp[i][j] = max(dp[i][j], dp[i - 1][j - w[i - 1]] + v[i - 1])
        return dp[n][W]`,
              zh: `class Solution:
    def knapsack01(self, w: list[int], v: list[int], W: int) -> int:
        n = len(w)
        dp = [[0] * (W + 1) for _ in range(n + 1)]
        for i in range(1, n + 1):
            for j in range(W + 1):
                dp[i][j] = dp[i - 1][j]                      # 不装
                if j >= w[i - 1]:
                    dp[i][j] = max(dp[i][j], dp[i - 1][j - w[i - 1]] + v[i - 1])
        return dp[n][W]`,
            },
            hl: [7, 8, 9],
            note: {
              en: (
                <>
                  <b>Worth noticing:</b> in the two-dimensional form the capacity
                  loop may run in <b>either direction</b>. Row i only ever reads
                  row i−1, so nothing row i writes can affect what row i reads.
                  The direction only starts to matter once the table is rolled
                  into a single row — see §03.
                </>
              ),
              zh: (
                <>
                  <b>值得注意:</b>二维写法里容量循环<b>正序倒序都对</b>。
                  第 i 行只会读第 i−1 行,本行写入什么都不会影响本行读到什么。
                  方向的讲究,是把表压成一行之后才出现的 —— 见 §03。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var knapsack01 = function (w, v, W) {
  const n = w.length;
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j <= W; j++) {
      dp[i][j] = dp[i - 1][j];                 // skip
      if (j >= w[i - 1])
        dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - w[i - 1]] + v[i - 1]); // take
    }
  }
  return dp[n][W];
};`,
              zh: `var knapsack01 = function (w, v, W) {
  const n = w.length;
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j <= W; j++) {
      dp[i][j] = dp[i - 1][j];                 // 不装
      if (j >= w[i - 1])
        dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - w[i - 1]] + v[i - 1]); // 装
    }
  }
  return dp[n][W];
};`,
            },
            hl: [6, 7, 8],
            note: {
              en: (
                <>
                  <code>Array.from(&#123;length&#125;, () =&gt; Array(...).fill(0))</code>{" "}
                  builds a two-dimensional array whose rows are separate objects.{" "}
                  <code>Array(n).fill(Array(...))</code> would make every row point
                  at the same array, so writing one row writes all of them.
                </>
              ),
              zh: (
                <>
                  <code>Array.from(&#123;length&#125;, () =&gt; Array(...).fill(0))</code>{" "}
                  才能建出每一行都是独立对象的二维数组。写成{" "}
                  <code>Array(n).fill(Array(...))</code>,所有行都指向同一个数组,
                  改一行等于改所有行。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="warn"
          title={{
            en: 'Why does "take it" read dp[i−1][j−w] and not dp[i][j−w]?',
            zh: "「装它」为什么读 dp[i−1][j−w],而不是 dp[i][j−w]?",
          }}
        >
          <p>
            <T
              en={
                <>
                  Because there is <b>only one copy</b> of item i. To take it you
                  must free capacity from a state where item i has not been
                  considered yet, and that state is row i−1. Reading{" "}
                  <code>dp[i][j−w]</code> instead would allow item i to be taken
                  again, and again. That single character turns the 0/1 knapsack
                  into the unbounded knapsack, which is the subject of §07. Keep
                  this correspondence in mind: <b>0/1 reads the previous row,
                  unbounded reads the current row</b>. §03 shows what each of them
                  becomes once the table is rolled into one row.
                </>
              }
              zh={
                <>
                  因为第 i 件物品<b>只有一件</b>。要装它,就必须从「还没考虑过它」
                  的状态里腾容量,而那个状态在第 i−1 行。若改读{" "}
                  <code>dp[i][j−w]</code>,第 i 件就可以被一取再取 ——
                  这一个字符之差,把 0-1 背包变成了完全背包,也就是 §07 的主题。
                  记住这组对应:<b>0-1 读上一行,完全背包读本行</b>。
                  §03 会说明把表压成一行之后,这两者各自变成什么。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 一维滚动 · 为什么倒序 ================= */}
      <Section
        id="rolling"
        index="03"
        title={{
          en: "The rolling array: where the loop direction comes from",
          zh: "一维滚动数组:遍历方向是怎么推出来的",
        }}
        desc={{
          en: "Roll the table into one row, and the 0/1 knapsack must run the capacity downward. Watch what going up does instead.",
          zh: "把表压成一行后,0-1 背包的容量必须倒序 —— 亲眼看正序会算成什么",
        }}
        badge={
          <span className="lc-badge" data-d="hard">
            <T en="COMMON MISTAKE" zh="易错点" />
          </span>
        }
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Look at the transition again: dp[i][j] reads only two cells, and
                  both are in the <strong>previous row</strong>. Once row i−1 has
                  been used, it is never needed again. So there is no reason to
                  keep the whole table. Keep <strong>one row</strong> and overwrite
                  it. The two-dimensional dp[i][j] becomes the one-dimensional
                  dp[j], and each item is one full sweep of that row. After the
                  sweep the row holds exactly the numbers of the matching table
                  row.
                </>
              }
              zh={
                <>
                  再看一次转移:dp[i][j] 只读两个格子,而且都在
                  <strong>上一行</strong>。第 i−1 行用过之后就再也不需要了,
                  所以没必要保存整张表 —— 留<strong>一行</strong>反复覆盖就够。
                  二维的 dp[i][j] 变成一维的 dp[j],每件物品对应把这一行完整刷一遍。
                  刷完之后,这一行的数字正好等于二维表的对应行。
                </>
              }
            />
          </p>
        </div>
        <DPTable
          title={{
            en: "The one-dimensional dp after each item: one sweep = one row of the 2-D table",
            zh: "每处理一件物品后的一维 dp:刷一遍 = 二维表的一行",
          }}
          frames={F_ROLL}
          colLabels={["0", "1", "2", "3", "4"]}
          cornerLabel="dp"
          cellW={62}
        />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  Rolling the table introduces one question that did not exist
                  before. When the sweep writes dp[j], it reads dp[j−w].{" "}
                  <strong>
                    Is that the old value from the previous row, or a value this
                    same sweep has already overwritten?
                  </strong>{" "}
                  In the 0/1 knapsack the transition needs{" "}
                  <code>dp[i−1][j−w]</code>, which is the old value — the state in
                  which this item has not been used yet. The direction of the
                  sweep is what decides which of the two you get. Switch between
                  the two buttons below: same item, same array, two directions.
                </>
              }
              zh={
                <>
                  压成一行之后,出现了一个原本不存在的问题:
                  写 dp[j] 的时候要读 dp[j−w] ——
                  <strong>它是上一行留下的旧值,还是本轮已经被覆盖过的新值?</strong>
                  0-1 背包的转移需要的是 <code>dp[i−1][j−w]</code>,也就是旧值,
                  那才代表「这件物品还没用过」。
                  遍历方向决定你读到哪一个。切换下面两个按钮:
                  同一件物品、同一个数组,两种方向。
                </>
              }
            />
          </p>
        </div>
        <RollingCompare />
        <div className="kp-duel">
          <div className="card">
            <div className="card-kicker">
              <T en="← Downward · correct" zh="← 倒序 · 正确" />
            </div>
            <div className="card-title">
              <b className="mono">dp[4] = 3</b>
            </div>
            <p>
              <T
                en={
                  <>
                    j goes from large to small. When dp[j] is written, dp[j−w] has
                    not been touched in this sweep, so it is still the{" "}
                    <b>previous row</b>. The item enters the bag at most once,
                    which is what the 0/1 knapsack means.
                  </>
                }
                zh={
                  <>
                    j 从大到小。写 dp[j] 时,dp[j−w] 在本轮还没被碰过,
                    所以它仍是<b>上一行</b>的值。物品最多进包一次 ——
                    这正是 0-1 背包的含义。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="→ Upward · wrong here" zh="→ 正序 · 这里是错的" />
            </div>
            <div className="card-title">
              <b className="mono">dp[4] = 6</b>
            </div>
            <p>
              <T
                en={
                  <>
                    j goes from small to large. By the time dp[4] is written, this
                    sweep has already set dp[2] to 3, so dp[2] contains one copy
                    of the item. Adding 3 again gives 6:{" "}
                    <b>the same item was placed in the bag twice</b>.
                  </>
                }
                zh={
                  <>
                    j 从小到大。算到 dp[4] 时,本轮已经把 dp[2] 改成 3,
                    里面已经含一件本物品,再加 3 得 6 ——
                    <b>同一件物品被放进背包两次</b>。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <CodeTabs
          title="knapsack01_1d"
          java={{
            code: {
              en: `class Solution {
    public int knapsack01(int[] w, int[] v, int W) {
        int[] dp = new int[W + 1];                // dp[j] = best value in capacity j
        for (int i = 0; i < w.length; i++)        // outer: one item at a time
            for (int j = W; j >= w[i]; j--)       // inner: capacity DESCENDING
                dp[j] = Math.max(dp[j], dp[j - w[i]] + v[i]);
        return dp[W];
    }
}`,
              zh: `class Solution {
    public int knapsack01(int[] w, int[] v, int W) {
        int[] dp = new int[W + 1];                // dp[j] = 容量 j 时的最大价值
        for (int i = 0; i < w.length; i++)        // 外层:一件件物品
            for (int j = W; j >= w[i]; j--)       // 内层:容量【倒序】
                dp[j] = Math.max(dp[j], dp[j - w[i]] + v[i]);
        return dp[W];
    }
}`,
            },
            hl: [5, 6],
            note: {
              en: (
                <>
                  Going down makes dp[j−w[i]] still hold the value from before
                  this item was processed. Writing the inner bound as{" "}
                  <code>j &gt;= w[i]</code> also removes the &quot;does it
                  fit&quot; test: capacities that are too small never enter the
                  loop, and dp[j] correctly keeps its old value there.
                </>
              ),
              zh: (
                <>
                  倒序让 dp[j−w[i]] 仍是「处理本物品之前」的值。
                  内层边界写成 <code>j &gt;= w[i]</code> 还顺手省掉了「装得下吗」
                  的判断:装不下的容量根本不进循环,dp[j] 在那里保持原值,正是所需。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def knapsack01(self, w, v, W):
        dp = [0] * (W + 1)
        for i in range(len(w)):
            for j in range(W, w[i] - 1, -1):      # capacity descending: W down to w[i]
                dp[j] = max(dp[j], dp[j - w[i]] + v[i])
        return dp[W]`,
              zh: `class Solution:
    def knapsack01(self, w, v, W):
        dp = [0] * (W + 1)
        for i in range(len(w)):
            for j in range(W, w[i] - 1, -1):      # 容量倒序:从 W 递减到 w[i]
                dp[j] = max(dp[j], dp[j - w[i]] + v[i])
        return dp[W]`,
            },
            hl: [5, 6],
            note: {
              en: (
                <>
                  <code>range(W, w[i] - 1, -1)</code> counts down from W to w[i].
                  The stop value is <code>w[i]-1</code> because the right end of a
                  Python range is excluded. Forgetting the −1 skips the cell j =
                  w[i].
                </>
              ),
              zh: (
                <>
                  <code>range(W, w[i] - 1, -1)</code> 表示从 W 递减到 w[i]。
                  终点写 <code>w[i]-1</code> 是因为 Python 的 range 不含右端点。
                  少减这个 1,就会漏掉 j = w[i] 那一格。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var knapsack01 = function (w, v, W) {
  const dp = Array(W + 1).fill(0);
  for (let i = 0; i < w.length; i++)
    for (let j = W; j >= w[i]; j--)             // capacity descending
      dp[j] = Math.max(dp[j], dp[j - w[i]] + v[i]);
  return dp[W];
};`,
              zh: `var knapsack01 = function (w, v, W) {
  const dp = Array(W + 1).fill(0);
  for (let i = 0; i < w.length; i++)
    for (let j = W; j >= w[i]; j--)             // 容量倒序
      dp[j] = Math.max(dp[j], dp[j - w[i]] + v[i]);
  return dp[W];
};`,
            },
            hl: [4, 5],
            note: {
              en: (
                <>
                  The whole difference between the two families is this one line:{" "}
                  <b>0/1 knapsack, capacity descending</b>;{" "}
                  <b>unbounded knapsack, capacity ascending</b>. Everything else
                  in the function is identical, and the direction is what decides
                  whether an item can be used once or many times.
                </>
              ),
              zh: (
                <>
                  两个家族的全部差别就在这一行:<b>0-1 背包,容量倒序</b>;
                  <b>完全背包,容量正序</b>。函数其余部分完全相同,
                  而方向决定了一件物品能用一次还是多次。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Say it in one paragraph, without memorizing a rule",
            zh: "用一段话说清方向,而不是背口诀",
          }}
        >
          <p>
            <T
              en={
                <>
                  &quot;The one-dimensional array is the two-dimensional table
                  rolled into a single row. The 0/1 transition reads{" "}
                  <code>dp[i−1][j−w]</code>, a cell in the previous row, so I
                  sweep the capacity downward: then dp[j−w] has not been
                  overwritten yet and still holds the previous row, and each item
                  enters the bag at most once. If I sweep upward, dp[j−w] comes
                  from the current row, which already includes this item — that is
                  the unbounded knapsack, not this one.&quot; The direction is not
                  a rule to remember. It follows from which row you need to read,
                  and you can re-derive it every time.
                </>
              }
              zh={
                <>
                  「一维数组就是二维表滚动成的一行。0-1 背包的转移读{" "}
                  <code>dp[i−1][j−w]</code>,那是上一行的格子,所以我把容量倒序刷:
                  这样 dp[j−w] 还没被覆盖,仍是上一行的值,每件物品最多进包一次。
                  如果正序刷,dp[j−w] 来自本行,里面已经含这件物品 ——
                  那是完全背包,不是这道题。」
                  方向不需要背,它由「你要读哪一行」推出来,每次都能重新推一遍。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 装满型 · 416 ================= */}
      <Section
        id="subset"
        index="04"
        title={{
          en: "Fill exactly: from largest value to can it be filled",
          zh: "装满型:从「最大价值」到「能不能正好装满」",
        }}
        desc={{
          en: "Worked example A · LC 416 Partition Equal Subset Sum — a reduction to the 0/1 knapsack you already have.",
          zh: "精讲 A · LC 416 分割等和子集 —— 归约到已经写过的 0-1 背包",
        }}
        badge={
          <span className="lc-badge" data-d="medium">
            MEDIUM
          </span>
        }
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> given an array of positive integers, can it
                  be split into two subsets with <strong>equal sums</strong>?
                  <b> The reduction:</b> if the two sums are equal, each one is{" "}
                  <code>sum/2</code>. So an odd total makes a split impossible.
                  Otherwise the question becomes:{" "}
                  <strong>
                    can some of the numbers add up to exactly sum/2?
                  </strong>{" "}
                  That is a 0/1 knapsack — each number is an item used at most
                  once, sum/2 is the capacity — but instead of the largest value
                  it asks <strong>whether the bag can be filled exactly</strong>.
                </>
              }
              zh={
                <>
                  <b>题意:</b>给一个正整数数组,能否把它分成两个<strong>和相等</strong>
                  的子集?
                  <b> 归约:</b>两个子集的和相等,说明每个子集的和都是{" "}
                  <code>sum/2</code>,所以总和为奇数时不可能等分。
                  否则问题变成:<strong>能否挑出若干个数,和正好等于 sum/2?</strong>
                  这就是一个 0-1 背包 —— 每个数是最多用一次的物品,sum/2 是容量 ——
                  只是问的不是最大价值,而是<strong>能否正好装满</strong>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>Why does the same code work?</b> Because &quot;largest
                  value&quot; and &quot;can it be filled&quot; use the same
                  take-or-skip skeleton. Only the operator changes, from{" "}
                  <code>max</code> to boolean <strong>or</strong>: dp[j] = &quot;j
                  was already reachable&quot; <code>||</code> &quot;j−num was
                  reachable and we add one num&quot;. Nothing here is a new
                  algorithm; it is the same table with a boolean in each cell.
                </>
              }
              zh={
                <>
                  <b>为什么同一份代码就够?</b>因为「最大价值」和「能否装满」
                  用的是同一套「装 / 不装」骨架,变的只有算子:把 <code>max</code>{" "}
                  换成布尔<strong>「或」</strong> —— dp[j] = 「j 本来就可达」
                  <code>||</code>「j−num 可达,再放一个 num」。
                  这里没有新算法,只是同一张表,每格换成了布尔值。
                </>
              }
            />
          </p>
        </div>
        <DPTable
          title={{
            en: "LC 416 · lighting up the boolean table (nums = [1,5,11,5], target = 11)",
            zh: "LC 416 · 布尔表逐帧点亮(nums = [1,5,11,5],target = 11)",
          }}
          frames={F_416}
          colLabels={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]}
          cornerLabel="dp"
          cellW={38}
        />
        <CodeTabs
          title="lc416_partition_equal_subset"
          java={{
            code: {
              en: `class Solution {
    public boolean canPartition(int[] nums) {
        int sum = 0;
        for (int x : nums) sum += x;
        if (sum % 2 != 0) return false;         // an odd total cannot be split
        int target = sum / 2;
        boolean[] dp = new boolean[target + 1];
        dp[0] = true;                           // the empty subset adds up to 0
        for (int x : nums)
            for (int j = target; j >= x; j--)   // 0/1 knapsack: capacity descending
                dp[j] = dp[j] || dp[j - x];
        return dp[target];
    }
}`,
              zh: `class Solution {
    public boolean canPartition(int[] nums) {
        int sum = 0;
        for (int x : nums) sum += x;
        if (sum % 2 != 0) return false;         // 总和为奇数,无法等分
        int target = sum / 2;
        boolean[] dp = new boolean[target + 1];
        dp[0] = true;                           // 空集的和是 0
        for (int x : nums)
            for (int j = target; j >= x; j--)   // 0-1 背包:容量倒序
                dp[j] = dp[j] || dp[j - x];
        return dp[target];
    }
}`,
            },
            hl: [10, 11],
            note: {
              en: (
                <>
                  <b>Checking the parity first</b> costs O(1) and rejects about
                  half the inputs immediately. The transition uses boolean or,
                  because this version only asks whether a sum is reachable, not
                  how much value it carries.
                </>
              ),
              zh: (
                <>
                  <b>先判奇偶</b>只花 O(1),却能立刻否掉大约一半的输入。
                  转移用布尔「或」,因为这个版本只问某个和能否达到,不关心价值。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def canPartition(self, nums: list[int]) -> bool:
        s = sum(nums)
        if s % 2:
            return False
        target = s // 2
        dp = [True] + [False] * target
        for x in nums:
            for j in range(target, x - 1, -1):   # capacity descending
                dp[j] = dp[j] or dp[j - x]
        return dp[target]`,
              zh: `class Solution:
    def canPartition(self, nums: list[int]) -> bool:
        s = sum(nums)
        if s % 2:
            return False
        target = s // 2
        dp = [True] + [False] * target
        for x in nums:
            for j in range(target, x - 1, -1):   # 容量倒序
                dp[j] = dp[j] or dp[j - x]
        return dp[target]`,
            },
            hl: [9, 10],
            note: {
              en: (
                <>
                  A faster variant in Python: store the whole boolean row as the
                  bits of one big integer. Then{" "}
                  <code>bits |= bits &lt;&lt; x</code> performs the entire sweep
                  for one number in a single shift, with a very small constant
                  factor. Chapter 4 covers using an integer as a set.
                </>
              ),
              zh: (
                <>
                  Python 里有个更快的写法:把整行布尔值存成一个大整数的各个二进制位,
                  于是 <code>bits |= bits &lt;&lt; x</code>{" "}
                  一次移位就完成某个数字的整轮转移,常数极小。
                  第 4 章讲过「用一个整数表示集合」。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var canPartition = function (nums) {
  const sum = nums.reduce((a, b) => a + b, 0);
  if (sum % 2) return false;
  const target = sum / 2;
  const dp = Array(target + 1).fill(false);
  dp[0] = true;                                 // the empty subset adds up to 0
  for (const x of nums)
    for (let j = target; j >= x; j--)           // capacity descending
      dp[j] = dp[j] || dp[j - x];
  return dp[target];
};`,
              zh: `var canPartition = function (nums) {
  const sum = nums.reduce((a, b) => a + b, 0);
  if (sum % 2) return false;
  const target = sum / 2;
  const dp = Array(target + 1).fill(false);
  dp[0] = true;                                 // 空集的和是 0
  for (const x of nums)
    for (let j = target; j >= x; j--)           // 容量倒序
      dp[j] = dp[j] || dp[j - x];
  return dp[target];
};`,
            },
            hl: [8, 9],
            note: {
              en: (
                <>
                  Small optimisation: if <code>dp[target]</code> is already true,
                  you can return immediately. The cost is O(n × target). The
                  constraints keep the total at most 20000, so the table stays
                  small — that is why this pseudo-polynomial method is fast enough
                  here.
                </>
              ),
              zh: (
                <>
                  小优化:一旦 <code>dp[target]</code> 已为 true,就可以直接返回。
                  复杂度 O(n × target)。题目约束把总和限制在 20000 以内,表因此很小 ——
                  这正是这个伪多项式方法在这里够快的原因。
                </>
              ),
            },
          }}
        />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Variant · LC 1049" zh="变式 · LC 1049" />
            </div>
            <div className="card-title">
              <T en="Last Stone Weight II" zh="最后一块石头的重量 II" />
            </div>
            <p>
              <T
                en={
                  <>
                    Split the stones into two piles with the smallest possible
                    difference, so one pile should get as close to sum/2 as it can
                    without going over. Capacity sum/2, and each weight is both
                    the cost and the value. Find the largest reachable weight
                    maxHalf; the answer is sum − 2 × maxHalf. LC 416 asks{" "}
                    <b>can it be filled</b>; this one asks{" "}
                    <b>how full can it get</b>.
                  </>
                }
                zh={
                  <>
                    把石头分成两堆、使差值最小,也就是让其中一堆尽量接近 sum/2
                    但不超过。容量 sum/2,每块石头的重量既是费用也是价值,
                    求能装到的最大重量 maxHalf,答案 = sum − 2 × maxHalf。
                    LC 416 问<b>能否装满</b>,这道题问<b>最多能装多满</b>。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Variant · LC 494" zh="变式 · LC 494" />
            </div>
            <div className="card-title">
              <T en="Target Sum" zh="目标和" />
            </div>
            <p>
              <T
                en={
                  <>
                    Replace &quot;can it be filled&quot; with &quot;in how many
                    ways can it be filled&quot;, which is the next section. The
                    three questions in order: <b>can it, how full, how many
                    ways</b>.
                  </>
                }
                zh={
                  <>
                    把「能否装满」换成「有几种装满的方法」,就是下一节的内容。
                    三个问题依次是:<b>能否装满 → 最多多满 → 有几种</b>。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="How to recognise it" zh="怎么识别" />
            </div>
            <div className="card-title">
              <T en="Signals for a fill-exactly problem" zh="装满型的信号" />
            </div>
            <p>
              <T
                en={
                  <>
                    The statement says &quot;split into two halves&quot;,
                    &quot;reach this sum&quot;, or &quot;equal to exactly&quot;.
                    Compute the total first, derive the target capacity from it,
                    and you usually have a 0/1 knapsack that asks for an exact
                    fill.
                  </>
                }
                zh={
                  <>
                    题面出现「分成两半」「凑出某个和」「正好等于」这类说法时,
                    先算总和、由它定出目标容量,通常就是一道「能否正好装满」的
                    0-1 背包。
                  </>
                }
              />
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §05 计数型 · 494 ================= */}
      <Section
        id="count"
        index="05"
        title={{
          en: "Counting: the same problem as a tree of 2ⁿ paths, and as a table",
          zh: "计数型:同一道题,一棵 2ⁿ 的树,和一张表",
        }}
        desc={{
          en: "Worked example B · LC 494 Target Sum — backtracking and knapsack side by side.",
          zh: "精讲 B · LC 494 目标和 —— 回溯与背包并排看",
        }}
        badge={
          <span className="lc-badge" data-d="medium">
            MEDIUM
          </span>
        }
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> put a <code>+</code> or a <code>−</code> in
                  front of every number in nums so the expression equals target,
                  and count <strong>how many ways</strong> there are.
                  <b> As backtracking:</b> each number has two options, so the
                  search is a binary decision tree of depth n. Walk to the bottom
                  and count the leaves whose sum is target. The logic is right,
                  but the cost is O(2ⁿ):
                </>
              }
              zh={
                <>
                  <b>题意:</b>给数组 nums,在每个数前面加 <code>+</code> 或{" "}
                  <code>−</code>,使表达式结果等于 target,问有<strong>几种</strong>
                  加法。
                  <b> 回溯视角:</b>每个数有两个选择,搜索过程是一棵深度 n 的二叉决策树。
                  走到底,数一数和等于 target 的叶子有几片。逻辑没错,代价是 O(2ⁿ):
                </>
              }
            />
          </p>
        </div>
        <TargetSumTree />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  <b>How does this become a knapsack?</b> Through one algebraic
                  step. Let <code>P</code> be the sum of the numbers that get a
                  plus sign, and <code>N</code> the sum of the absolute values of
                  the rest. Then:
                </>
              }
              zh={
                <>
                  <b>它怎么变成背包?</b>只需一步代数。设加正号的数之和为{" "}
                  <code>P</code>,加负号的那些数的绝对值之和为 <code>N</code>,那么:
                </>
              }
            />
          </p>
        </div>
        <div className="kp-formula">
          P − N = target &nbsp;
          <T en="and" zh="且" />
          &nbsp; P + N = sum &nbsp; ⇒ &nbsp;{" "}
          <b>P = (sum + target) / 2</b>
          <br />
          <span className="dim">
            <T
              en="So the question becomes: how many subsets add up to exactly P? — a counting 0/1 knapsack. If P is not a whole number, is negative, or exceeds sum, the answer is 0."
              zh="于是问题变成:有几个子集的和正好等于 P?—— 一个计数型 0-1 背包。若 P 不是整数、为负,或大于 sum,答案就是 0。"
            />
          </span>
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The rest is the LC 416 skeleton with the boolean or replaced by{" "}
                  <strong>addition of counts</strong>:{" "}
                  <code>dp[j] += dp[j−num]</code>. The number of ways to make j is
                  the ways already counted, plus the ways to make j−num followed
                  by this num. Base case dp[0] = 1, because the empty subset is
                  one way to make 0. The capacity still runs downward, because
                  each number is used at most once.
                </>
              }
              zh={
                <>
                  剩下的就是 LC 416 的骨架,只把布尔「或」换成<strong>方案数相加</strong>:
                  <code>dp[j] += dp[j−num]</code>。凑出 j 的方案数 = 已经数到的方案数,
                  加上「先凑出 j−num、再放一个 num」的方案数。
                  基准情形 dp[0] = 1,因为空集是凑出 0 的一种方案。
                  容量仍然倒序,因为每个数最多用一次。
                </>
              }
            />
          </p>
        </div>
        <DPTable
          title={{
            en: "LC 494 · filling the counting table (nums = [1,1,1], P = 2) — the same instance as the tree above",
            zh: "LC 494 · 计数表逐帧填充(nums = [1,1,1],P = 2)—— 与上面的决策树同一实例",
          }}
          frames={F_494}
          colLabels={["0", "1", "2"]}
          cornerLabel="dp"
          cellW={56}
        />
        <CodeTabs
          title="lc494_target_sum"
          java={{
            code: {
              en: `class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        int sum = 0;
        for (int x : nums) sum += x;
        // P - N = target, P + N = sum  =>  P = (sum + target) / 2
        if (Math.abs(target) > sum || (sum + target) % 2 != 0) return 0;
        int P = (sum + target) / 2;
        int[] dp = new int[P + 1];
        dp[0] = 1;                              // one way to make 0: the empty subset
        for (int x : nums)
            for (int j = P; j >= x; j--)        // counting 0/1 knapsack, capacity descending
                dp[j] += dp[j - x];
        return dp[P];
    }
}`,
              zh: `class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        int sum = 0;
        for (int x : nums) sum += x;
        // P - N = target, P + N = sum  =>  P = (sum + target) / 2
        if (Math.abs(target) > sum || (sum + target) % 2 != 0) return 0;
        int P = (sum + target) / 2;
        int[] dp = new int[P + 1];
        dp[0] = 1;                              // 凑出 0 有一种方案:空集
        for (int x : nums)
            for (int j = P; j >= x; j--)        // 计数型 0-1 背包,容量倒序
                dp[j] += dp[j - x];
        return dp[P];
    }
}`,
            },
            hl: [11, 12],
            note: {
              en: (
                <>
                  <b>Two guards are needed.</b> If <code>|target| &gt; sum</code>{" "}
                  the target cannot be reached at all. If{" "}
                  <code>sum + target</code> is odd, P is not a whole number and no
                  subset exists. Skipping either one gives a wrong answer or an
                  out-of-range array size.
                </>
              ),
              zh: (
                <>
                  <b>需要两道判断。</b>若 <code>|target| &gt; sum</code>,
                  目标根本达不到;若 <code>sum + target</code> 为奇数,
                  P 不是整数,不存在这样的子集。少写任何一条,
                  都会算错,或者开出非法长度的数组。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def findTargetSumWays(self, nums: list[int], target: int) -> int:
        s = sum(nums)
        if abs(target) > s or (s + target) % 2:
            return 0
        P = (s + target) // 2
        dp = [1] + [0] * P
        for x in nums:
            for j in range(P, x - 1, -1):   # capacity descending
                dp[j] += dp[j - x]
        return dp[P]`,
              zh: `class Solution:
    def findTargetSumWays(self, nums: list[int], target: int) -> int:
        s = sum(nums)
        if abs(target) > s or (s + target) % 2:
            return 0
        P = (s + target) // 2
        dp = [1] + [0] * P
        for x in nums:
            for j in range(P, x - 1, -1):   # 容量倒序
                dp[j] += dp[j - x]
        return dp[P]`,
            },
            hl: [9, 10],
            note: {
              en: (
                <>
                  A <b>0</b> in nums is worth thinking about: it can take either
                  sign, so it doubles the number of ways. The code already handles
                  it. When x is 0 the inner loop runs down to j = 0 and performs{" "}
                  <code>dp[j] += dp[j]</code>, which doubles every cell. No special
                  case is needed.
                </>
              ),
              zh: (
                <>
                  nums 里的 <b>0</b> 值得想一想:它加正号加负号都行,
                  因此会让方案数翻倍。上面的代码已经处理好了:x 为 0 时,
                  内层一直走到 j = 0,执行 <code>dp[j] += dp[j]</code>,
                  正好让每一格翻倍,不需要特判。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var findTargetSumWays = function (nums, target) {
  const sum = nums.reduce((a, b) => a + b, 0);
  if (Math.abs(target) > sum || (sum + target) % 2) return 0;
  const P = (sum + target) / 2;
  const dp = Array(P + 1).fill(0);
  dp[0] = 1;                                    // the empty subset makes 0
  for (const x of nums)
    for (let j = P; j >= x; j--) dp[j] += dp[j - x];
  return dp[P];
};`,
              zh: `var findTargetSumWays = function (nums, target) {
  const sum = nums.reduce((a, b) => a + b, 0);
  if (Math.abs(target) > sum || (sum + target) % 2) return 0;
  const P = (sum + target) / 2;
  const dp = Array(P + 1).fill(0);
  dp[0] = 1;                                    // 空集凑出 0
  for (const x of nums)
    for (let j = P; j >= x; j--) dp[j] += dp[j - x];
  return dp[P];
};`,
            },
            hl: [7, 8],
            note: {
              en: (
                <>
                  Time O(n × P), space O(P). Note that P is at most sum, so this
                  is fast only because the numbers themselves are small. Learn
                  both versions: backtracking makes the set of choices visible,
                  and the knapsack shows how to count them without walking every
                  path.
                </>
              ),
              zh: (
                <>
                  时间 O(n × P),空间 O(P)。注意 P 最大等于 sum,
                  所以它快是因为数值本身就小。两种写法都要掌握:
                  回溯让「有哪些选择」看得见,背包则说明如何不走遍每条路径也能数清。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "Where counting DP shows up outside interviews",
            zh: "计数型 DP 在面试之外的用处",
          }}
        >
          <p>
            <T
              en={
                <>
                  &quot;How many ways can this total be reached&quot; is a common
                  question in practice: the probability that n dice sum to s (LC
                  1155), a change machine reporting how many ways a payment can be
                  made, or a parser counting how many valid parse trees a sentence
                  has. All of them reduce to the same line,{" "}
                  <code>dp[j] += dp[j−x]</code>, and all of them count without
                  listing.
                </>
              }
              zh={
                <>
                  「某个总量有几种凑法」在实际中很常见:n 个骰子点数和为 s 的概率
                  (LC 1155)、找零机统计一笔金额有几种付法、
                  解析器统计一个句子有几棵合法的语法树。
                  它们都归约到同一行 <code>dp[j] += dp[j−x]</code> ——
                  数清楚,而不是列出来。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 二维费用 · 474 ================= */}
      <Section
        id="twocost"
        index="06"
        title={{
          en: "Two costs: one item spends two kinds of capacity",
          zh: "二维费用:一件物品同时花掉两种容量",
        }}
        desc={{
          en: "LC 474 Ones and Zeroes — add one dimension to the table, and the skeleton does not change.",
          zh: "LC 474 一和零 —— 给表多开一维,骨架完全不变",
        }}
        badge={
          <span className="lc-badge" data-d="medium">
            MEDIUM
          </span>
        }
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> given a list of binary strings and a budget
                  of at most <code>m</code> zeros and <code>n</code> ones, how many
                  strings can you choose? <b>The observation:</b> each string is a
                  0/1 item, but it spends two resources at once — the zeros it
                  contains and the ones it contains. That is a{" "}
                  <strong>two-cost knapsack</strong>: two limits instead of one, so
                  the table gets one more dimension.
                </>
              }
              zh={
                <>
                  <b>题意:</b>给一组 0/1 字符串,以及最多可用的 <code>m</code>{" "}
                  个 0 和 <code>n</code> 个 1,问最多能选出几个字符串。
                  <b> 观察:</b>每个字符串是一件 0-1 物品,但它同时消耗两种资源 ——
                  它含的 0 的个数和 1 的个数。这就是<strong>二维费用背包</strong>:
                  限制从一条变成两条,于是表多开一维。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  State:{" "}
                  <code>
                    dp[i][j] = the largest number of strings you can choose using
                    at most i zeros and j ones
                  </code>
                  . The transition is still take-or-skip this string; the only
                  change is that taking it frees two kinds of capacity:{" "}
                  <code>dp[i][j] = max(dp[i][j], dp[i−zeros][j−ones] + 1)</code>.
                  Each string is still used at most once, so{" "}
                  <strong>both capacity loops run downward</strong>, for exactly
                  the reason given in §03.
                </>
              }
              zh={
                <>
                  状态:
                  <code>dp[i][j] = 最多用 i 个 0、j 个 1 时,能选出的字符串个数上限</code>
                  。转移仍然是「选或不选」这个字符串,只是「选」要同时腾出两种容量:
                  <code>dp[i][j] = max(dp[i][j], dp[i−zeros][j−ones] + 1)</code>。
                  每个字符串仍然最多用一次,所以<strong>两层容量都倒序</strong> ——
                  理由和 §03 完全相同。
                </>
              }
            />
          </p>
        </div>
        <div className="kp-formula">
          dp[i][j] = max( <b>dp[i][j]</b>{" "}
          <span className="dim">
            <T en="skip" zh="不选" />
          </span>{" "}
          , <b>dp[i−zeros][j−ones] + 1</b>{" "}
          <span className="dim">
            <T
              en="take (value +1 = one more string)"
              zh="选(价值 +1 = 多一个字符串)"
            />
          </span>{" "}
          )
        </div>
        <CodeTabs
          title="lc474_ones_and_zeroes"
          java={{
            code: {
              en: `class Solution {
    public int findMaxForm(String[] strs, int m, int n) {
        int[][] dp = new int[m + 1][n + 1];       // two costs: m zeros, n ones
        for (String s : strs) {
            int zeros = 0, ones = 0;
            for (char ch : s.toCharArray()) { if (ch == '0') zeros++; else ones++; }
            for (int i = m; i >= zeros; i--)      // both capacities DESCENDING (0/1)
                for (int j = n; j >= ones; j--)
                    dp[i][j] = Math.max(dp[i][j], dp[i - zeros][j - ones] + 1);
        }
        return dp[m][n];
    }
}`,
              zh: `class Solution {
    public int findMaxForm(String[] strs, int m, int n) {
        int[][] dp = new int[m + 1][n + 1];       // 两种费用:m 个 0、n 个 1
        for (String s : strs) {
            int zeros = 0, ones = 0;
            for (char ch : s.toCharArray()) { if (ch == '0') zeros++; else ones++; }
            for (int i = m; i >= zeros; i--)      // 两层容量都【倒序】(0-1)
                for (int j = n; j >= ones; j--)
                    dp[i][j] = Math.max(dp[i][j], dp[i - zeros][j - ones] + 1);
        }
        return dp[m][n];
    }
}`,
            },
            hl: [7, 8, 9],
            note: {
              en: (
                <>
                  The extra dimension does not change the model. This is still a
                  0/1 knapsack processed one item at a time. The weight of an item
                  is now a pair, <code>(zeros, ones)</code>, and its value is
                  always +1 because the answer counts strings.
                </>
              ),
              zh: (
                <>
                  多出来的一维并没有改变模型:它仍是一件件物品处理的 0-1 背包。
                  只是每件物品的「重量」变成了一对数 <code>(zeros, ones)</code>,
                  价值恒为 +1 —— 因为答案数的是字符串个数。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def findMaxForm(self, strs: list[str], m: int, n: int) -> int:
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for s in strs:
            zeros = s.count("0")
            ones = len(s) - zeros
            for i in range(m, zeros - 1, -1):      # both capacities descending
                for j in range(n, ones - 1, -1):
                    dp[i][j] = max(dp[i][j], dp[i - zeros][j - ones] + 1)
        return dp[m][n]`,
              zh: `class Solution:
    def findMaxForm(self, strs: list[str], m: int, n: int) -> int:
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for s in strs:
            zeros = s.count("0")
            ones = len(s) - zeros
            for i in range(m, zeros - 1, -1):      # 两层容量都倒序
                for j in range(n, ones - 1, -1):
                    dp[i][j] = max(dp[i][j], dp[i - zeros][j - ones] + 1)
        return dp[m][n]`,
            },
            hl: [7, 8, 9],
            note: {
              en: (
                <>
                  <code>s.count(&quot;0&quot;)</code> gives the number of zeros in
                  one call, and ones is the length minus that. Computing both costs
                  of an item before the loops keeps the inner lines readable.
                </>
              ),
              zh: (
                <>
                  <code>s.count(&quot;0&quot;)</code> 一次调用就拿到 0 的个数,
                  1 的个数用长度减去它即可。在进入循环之前算好两种费用,
                  内层的两行就清楚多了。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var findMaxForm = function (strs, m, n) {
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (const s of strs) {
    let zeros = 0;
    for (const ch of s) if (ch === "0") zeros++;
    const ones = s.length - zeros;
    for (let i = m; i >= zeros; i--)             // both capacities descending
      for (let j = n; j >= ones; j--)
        dp[i][j] = Math.max(dp[i][j], dp[i - zeros][j - ones] + 1);
  }
  return dp[m][n];
};`,
              zh: `var findMaxForm = function (strs, m, n) {
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (const s of strs) {
    let zeros = 0;
    for (const ch of s) if (ch === "0") zeros++;
    const ones = s.length - zeros;
    for (let i = m; i >= zeros; i--)             // 两层容量都倒序
      for (let j = n; j >= ones; j--)
        dp[i][j] = Math.max(dp[i][j], dp[i - zeros][j - ones] + 1);
  }
  return dp[m][n];
};`,
            },
            hl: [7, 8, 9],
            note: {
              en: (
                <>
                  Complexity: the number of states is (m+1)(n+1) and each item
                  visits all of them, so the time is O(len(strs) × m × n). The item
                  dimension is already rolled away, so dp holds only (m+1)(n+1)
                  numbers and cannot be reduced further.
                </>
              ),
              zh: (
                <>
                  复杂度:状态数是 (m+1)(n+1),每件物品都会走遍所有状态,
                  所以时间是 O(len(strs) × m × n)。物品那一维已经滚动掉了,
                  dp 只存 (m+1)(n+1) 个数,无法再压。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="idea"
          title={{
            en: "One limited resource, one dimension",
            zh: "一种受限资源,一维",
          }}
        >
          <p>
            <T
              en={
                <>
                  Capacity in a knapsack is just a <b>limited resource</b>. One
                  resource gives a one-dimensional table, two resources (zeros and
                  ones) give two dimensions, three give three. Each new dimension
                  takes its own loop direction from the rule for that resource:
                  descending if the item is used at most once, ascending if it may
                  be reused. The skeleton stays take-or-skip. Note the cost: the
                  number of states is the product of all the limits, so a third
                  budget can make the table too large to be practical.
                </>
              }
              zh={
                <>
                  背包里的「容量」就是一种<b>受限资源</b>。一种资源对应一维表,
                  两种资源(0 和 1)对应二维,三种就三维。
                  每新增一维,方向由那种资源自己的规则决定:
                  物品最多用一次就倒序,可以重复用就正序。骨架始终是「选 / 不选」。
                  但要注意代价:状态数是所有上限的乘积,再加第三种预算,
                  表就可能大到不实用。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 完全背包 · 为什么正序 ================= */}
      <Section
        id="complete"
        index="07"
        title={{
          en: "The unbounded knapsack: ascending capacity is what allows reuse",
          zh: "完全背包:正序遍历容量,正是「可以重复取」的实现方式",
        }}
        desc={{
          en: "LC 322 Coin Change modelled again (Chapter 7 solved it another way), plus LC 279 and LC 139.",
          zh: "LC 322 零钱兑换换一种建模(第 7 章用的是另一种),以及 LC 279、LC 139",
        }}
        badge={
          <span className="lc-badge" data-d="medium">
            MEDIUM
          </span>
        }
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  In an <strong>unbounded knapsack</strong> each item may be taken{" "}
                  <strong>any number of times</strong>. Recall why going up was
                  wrong in §03: dp[j−w] had already been updated in the same sweep,
                  so it already contained one copy of the item, and the item was
                  counted twice. For the unbounded knapsack that is not a bug —
                  reusing an item is exactly what the problem allows. So the code
                  is the 0/1 code with <strong>one direction reversed</strong>.
                </>
              }
              zh={
                <>
                  <strong>完全背包</strong>里,每件物品可以取<strong>任意多次</strong>。
                  回想 §03 里正序为什么错:dp[j−w] 在本轮已经被更新过,
                  里面已经含一件本物品,于是这件物品被算了两次。
                  但对完全背包来说这不是错误 —— 重复取用正是题目允许的。
                  所以代码就是 0-1 的代码,<strong>只把一个方向反过来</strong>。
                </>
              }
            />
          </p>
        </div>
        <div className="kp-duel">
          <div className="card">
            <div className="card-kicker">
              <T en="0/1 · at most once each" zh="0-1 背包 · 每件最多一次" />
            </div>
            <div className="card-title">
              <b className="mono">for j = W … w[i]</b>
            </div>
            <p>
              <T
                en={
                  <>
                    Capacity <b>descending</b>. dp[j−w] is still the value from
                    before this item was processed — in table terms, row i−1. Each
                    item enters the bag at most once.
                  </>
                }
                zh={
                  <>
                    容量<b>倒序</b>。dp[j−w] 仍是「处理本物品之前」的值 ——
                    换成表的说法,就是第 i−1 行。每件物品最多进包一次。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Unbounded · unlimited each" zh="完全背包 · 每件无限次" />
            </div>
            <div className="card-title">
              <b className="mono">for j = w[i] … W</b>
            </div>
            <p>
              <T
                en={
                  <>
                    Capacity <b>ascending</b>. dp[j−w] may already include this
                    item — in table terms, row i itself. So the same item can be
                    added again and again.
                  </>
                }
                zh={
                  <>
                    容量<b>正序</b>。dp[j−w] 里可能已经含这件物品 ——
                    换成表的说法,就是第 i 行本身。于是同一件可以一取再取。
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
                  The two-dimensional form makes the same distinction visible in
                  one character. The 0/1 transition is{" "}
                  <code>dp[i][j] = max(dp[i−1][j], dp[i−1][j−w] + v)</code>. The
                  unbounded transition is{" "}
                  <code>dp[i][j] = max(dp[i−1][j], dp[i][j−w] + v)</code> — it
                  reads its <b>own</b> row, the row in which item i may already
                  have been taken. Rolling each of them into a single array gives
                  exactly the two directions above: reading the previous row means
                  reading a cell this sweep has not touched, which is the
                  descending order, and reading the current row means reading a
                  cell this sweep has already written, which is the ascending
                  order.
                </>
              }
              zh={
                <>
                  二维形态把同一个区别写成了一个字符的差别。0-1 的转移是{" "}
                  <code>dp[i][j] = max(dp[i−1][j], dp[i−1][j−w] + v)</code>;
                  完全背包的转移是{" "}
                  <code>dp[i][j] = max(dp[i−1][j], dp[i][j−w] + v)</code> ——
                  它读的是<b>自己这一行</b>,而第 i 件在这一行里可能已经被取过。
                  把两者各自压成一个数组,得到的正是上面两个方向:
                  「读上一行」就是读本轮还没碰过的格子,也就是倒序;
                  「读本行」就是读本轮已经写过的格子,也就是正序。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <strong>LC 322 Coin Change</strong> makes a good test, because
                  Chapter 7 already solved it a different way: there, dp[amount]
                  was filled by asking which coin is the last one. Here the model
                  is an unbounded knapsack — coins are items with unlimited supply,
                  the amount is the capacity — and the array is filled one coin
                  type at a time, ascending. Two models, one answer:
                </>
              }
              zh={
                <>
                  <strong>LC 322 零钱兑换</strong>很适合做对照,
                  因为第 7 章已经用另一种方式解过它:那里是通过「枚举最后一枚硬币」
                  来填 dp[金额]。这里换成完全背包建模 ——
                  硬币是可无限取的物品,金额是容量 ——
                  按「一种硬币一种硬币」正序填同一个数组。两种建模,同一个答案:
                </>
              }
            />
          </p>
        </div>
        <DPTable
          title={{
            en: "LC 322 · the unbounded knapsack view, one coin type at a time (coins = [1,3,4], amount = 6)",
            zh: "LC 322 · 完全背包视角,逐种硬币填(coins = [1,3,4],amount = 6)",
          }}
          frames={F_322}
          colLabels={["¥0", "¥1", "¥2", "¥3", "¥4", "¥5", "¥6"]}
          cornerLabel="dp"
          cellW={52}
        />
        <CodeTabs
          title="lc322_coin_change_complete"
          java={{
            code: {
              en: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);            // stands in for "unreachable"
        dp[0] = 0;
        for (int c : coins)                     // outer: one coin type at a time
            for (int j = c; j <= amount; j++)   // inner: capacity ASCENDING = reuse allowed
                dp[j] = Math.min(dp[j], dp[j - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
              zh: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);            // 代表「凑不出」
        dp[0] = 0;
        for (int c : coins)                     // 外层:一种硬币一种硬币地来
            for (int j = c; j <= amount; j++)   // 内层:容量【正序】= 允许重复取
                dp[j] = Math.min(dp[j], dp[j - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
            },
            hl: [6, 7, 8],
            note: {
              en: (
                <>
                  Compare this line by line with the one-dimensional 0/1 code in
                  §03: the <b>only</b> difference is that <code>j</code> counts up.
                  The question asks for the fewest coins, so the operator is min,
                  dp[0] = 0, and every other cell starts at a value larger than any
                  real answer.
                </>
              ),
              zh: (
                <>
                  把这段和 §03 的一维 0-1 代码逐行对照:<b>唯一</b>的差别是{" "}
                  <code>j</code> 变成递增。题目求最少枚数,所以算子是 min,
                  dp[0] = 0,其余每格都先设成一个比任何真实答案都大的值。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        dp = [0] + [amount + 1] * amount
        for c in coins:
            for j in range(c, amount + 1):      # capacity ascending
                dp[j] = min(dp[j], dp[j - c] + 1)
        return dp[amount] if dp[amount] <= amount else -1`,
              zh: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        dp = [0] + [amount + 1] * amount
        for c in coins:
            for j in range(c, amount + 1):      # 容量正序
                dp[j] = min(dp[j], dp[j - c] + 1)
        return dp[amount] if dp[amount] <= amount else -1`,
            },
            hl: [4, 5, 6],
            note: {
              en: (
                <>
                  Why <code>amount + 1</code> works as &quot;unreachable&quot;: any
                  amount that can be made needs at most amount coins, so a real
                  answer never reaches amount + 1. Adding 1 to it also cannot
                  overflow, which is a risk with a very large sentinel value.
                </>
              ),
              zh: (
                <>
                  为什么用 <code>amount + 1</code> 表示「凑不出」:
                  凡是能凑出的金额,最多用 amount 枚硬币,
                  所以真实答案永远到不了 amount + 1。而且给它加 1 也不会溢出 ——
                  用一个极大的哨兵值反而有这个风险。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var coinChange = function (coins, amount) {
  const dp = Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (const c of coins)
    for (let j = c; j <= amount; j++)          // capacity ascending
      dp[j] = Math.min(dp[j], dp[j - c] + 1);
  return dp[amount] > amount ? -1 : dp[amount];
};`,
              zh: `var coinChange = function (coins, amount) {
  const dp = Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (const c of coins)
    for (let j = c; j <= amount; j++)          // 容量正序
      dp[j] = Math.min(dp[j], dp[j - c] + 1);
  return dp[amount] > amount ? -1 : dp[amount];
};`,
            },
            hl: [4, 5, 6],
            note: {
              en: (
                <>
                  Complexity: the number of states is amount + 1, and each coin
                  type visits all of them, so the time is O(len(coins) × amount)
                  and the space is O(amount). Again this is polynomial in the{" "}
                  <i>value</i> of amount, not in the length of the input.
                </>
              ),
              zh: (
                <>
                  复杂度:状态数是 amount + 1,每种硬币都会走遍所有状态,
                  所以时间是 O(len(coins) × amount),空间 O(amount)。
                  同样地,这是对 amount 的<i>数值</i>而言的多项式,
                  不是对输入长度而言的。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="warn"
          title={{
            en: "For min and max, the loop order does not matter. For counting, it decides the answer.",
            zh: "求最值时,两层循环谁在外都行;计数时,它决定答案",
          }}
        >
          <p>
            <T
              en={
                <>
                  In an unbounded knapsack that asks for a smallest or largest
                  value — LC 322 and LC 279 — you may put either loop on the
                  outside and <b>both give the correct answer</b>. min only cares
                  about the best of all the ways to make j, and the best does not
                  depend on the order the items were considered in. Counting is
                  different. In LC 518 and LC 377 the loop order decides whether
                  you count <b>combinations</b> or <b>permutations</b>, and the two
                  numbers are not the same. The next section is about exactly that.
                </>
              }
              zh={
                <>
                  在求最值的完全背包里 —— LC 322、LC 279 ——
                  两层循环谁在外都可以,<b>两种写法都对</b>。
                  min 只关心「凑出 j 的所有方式里最好的那个」,
                  而最好的那个与考虑物品的顺序无关。计数就不同了:
                  在 LC 518 和 LC 377 里,循环顺序决定你数的是<b>组合数</b>还是
                  <b>排列数</b>,这两个数并不相等。下一节专门讲这件事。
                </>
              }
            />
          </p>
        </Callout>
        <div className="grid-3" style={{ marginTop: 8 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Same problem · LC 279" zh="同构 · LC 279" />
            </div>
            <div className="card-title">
              <T en="Perfect Squares" zh="完全平方数" />
            </div>
            <p>
              <T
                en={
                  <>
                    Treat 1, 4, 9, 16 ... as denominations with unlimited supply and
                    find the fewest of them that add up to n. The code is LC 322
                    with a different item list. Time O(n√n), because there are
                    about √n squares below n.
                  </>
                }
                zh={
                  <>
                    把 1、4、9、16… 看作可无限取的面额,求凑出 n 的最少个数。
                    代码就是 LC 322,只换了物品清单。时间 O(n√n) ——
                    因为 n 以下大约有 √n 个平方数。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Order matters · LC 139" zh="顺序有关 · LC 139" />
            </div>
            <div className="card-title">
              <T en="Word Break" zh="单词拆分" />
            </div>
            <p>
              <T
                en={
                  <>
                    Dictionary words may be reused, and <b>order matters</b>,
                    because the result is one sentence. So the capacity (the prefix
                    length) is the outer loop and the words are the inner loop —
                    the same nesting LC 377 uses. The next section explains why.
                  </>
                }
                zh={
                  <>
                    词典里的词可以重复使用,而且<b>顺序有关</b> ——
                    拼出来的是一句话。所以容量(前缀长度)在外层、单词在内层,
                    和 LC 377 是同一种嵌套。下一节解释原因。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Extension · bounded" zh="拓展 · 多重背包" />
            </div>
            <div className="card-title">
              <T en="A count limit per item" zh="每件有个数上限" />
            </div>
            <p>
              <T
                en={
                  <>
                    Between 0/1 and unbounded: item i may be used at most k times.
                    The direct method copies it into k separate 0/1 items. A better
                    one is <b>binary splitting</b>: replace k copies with items of
                    size 1, 2, 4, ... so any count from 0 to k can still be formed,
                    which turns k items into about log k.
                  </>
                }
                zh={
                  <>
                    介于 0-1 与完全之间:第 i 件最多用 k 次。
                    最直接的做法是把它复制成 k 件 0-1 物品;更好的做法是
                    <b>二进制拆分</b> —— 用大小为 1、2、4… 的若干件代替 k 件,
                    仍能凑出 0 到 k 的任意个数,于是 k 件压缩到约 log k 件。
                  </>
                }
              />
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §08 排列 vs 组合 ================= */}
      <Section
        id="permcomb"
        index="08"
        title={{
          en: "Combinations or permutations: which loop is on the outside decides",
          zh: "组合还是排列:哪一层循环在外决定了答案",
        }}
        desc={{
          en: "Worked example C · LC 518 counts combinations, LC 377 counts permutations, and the code differs by one line.",
          zh: "精讲 C · LC 518 数组合、LC 377 数排列,代码只差一行",
        }}
        badge={
          <span className="lc-badge" data-d="medium">
            MEDIUM
          </span>
        }
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Counting problems on the unbounded knapsack have one detail that
                  is easy to get wrong. Two problems can both ask &quot;how many
                  ways make the amount n&quot;, both use{" "}
                  <code>dp[j] += dp[j−coin]</code>, and still count different
                  things, because of the <strong>order of the two loops</strong>.
                </>
              }
              zh={
                <>
                  完全背包的计数题里有一个很容易写错的细节。
                  两道题都问「凑出金额 n 有几种方案」,都用{" "}
                  <code>dp[j] += dp[j−coin]</code>,数出来的却是不同的东西 ——
                  区别只在<strong>两层循环的顺序</strong>。
                </>
              }
            />
          </p>
        </div>
        <div className="kp-duel">
          <div className="card">
            <div className="card-kicker">
              <T en="LC 518 · combinations" zh="LC 518 · 求组合数" />
            </div>
            <div className="card-title">
              <b className="mono">
                <T en="items outside · capacity inside" zh="外层物品 · 内层容量" />
              </b>
            </div>
            <p>
              <T
                en={
                  <>
                    1 + 2 and 2 + 1 count as <b>one</b> way. Each coin type is
                    introduced in its own pass, and always after the coins before
                    it, so one set of coins is only ever reached in one order.
                    Order is not counted: these are <b>combinations</b>.
                  </>
                }
                zh={
                  <>
                    1 + 2 与 2 + 1 算<b>一种</b>。每种硬币只在自己那一轮登场,
                    而且永远排在前面的硬币之后,所以同一组硬币只会以一种顺序被数到。
                    顺序不计入 —— 数的是<b>组合</b>。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="LC 377 · permutations" zh="LC 377 · 求排列数" />
            </div>
            <div className="card-title">
              <b className="mono">
                <T en="capacity outside · items inside" zh="外层容量 · 内层数字" />
              </b>
            </div>
            <p>
              <T
                en={
                  <>
                    1 + 2 and 2 + 1 count as <b>two</b> ways. At every capacity all
                    the numbers get a turn as the last one added, so the two orders
                    land in separate counts. Order is counted: these are{" "}
                    <b>permutations</b>.
                  </>
                }
                zh={
                  <>
                    1 + 2 与 2 + 1 算<b>两种</b>。在每个容量上,
                    所有数字都轮流当「最后加进来的那个」,
                    于是两种顺序被分别计入。顺序计入 —— 数的是<b>排列</b>。
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
                  Start with <strong>LC 518, combinations</strong>: coins = [1,2,5]
                  and amount 5. Coins on the outside means the passes happen in a
                  fixed order —{" "}
                  <strong>
                    first count every way that uses only ¥1, then bring in ¥2, then
                    ¥5
                  </strong>
                  . ¥2 always enters after ¥1, so no way is ever counted twice
                  under a different ordering. Step through it:
                </>
              }
              zh={
                <>
                  先看 <strong>LC 518,求组合数</strong>:coins = [1,2,5],凑 5 元。
                  硬币在外层,意味着各轮有固定次序 ——
                  <strong>先数清只用 ¥1 的方案,再引入 ¥2,再引入 ¥5</strong>。
                  ¥2 永远在 ¥1 之后登场,所以同一种方案不会因为换个顺序被数第二次。
                  逐帧看:
                </>
              }
            />
          </p>
        </div>
        <DPTable
          title={{
            en: "LC 518 · combinations (coins outside, capacity inside; coins = [1,2,5], amount = 5)",
            zh: "LC 518 · 组合数(外层硬币、内层容量;coins = [1,2,5],amount = 5)",
          }}
          frames={F_518}
          colLabels={["0", "1", "2", "3", "4", "5"]}
          cornerLabel="dp"
          cellW={56}
        />
        <CodeTabs
          title="lc518_vs_lc377"
          java={{
            code: {
              en: `// LC 518 counts COMBINATIONS: coins outside, capacity inside
class Solution {
    public int change(int amount, int[] coins) {
        int[] dp = new int[amount + 1];
        dp[0] = 1;
        for (int c : coins)                     // outer: coins -> combinations
            for (int j = c; j <= amount; j++)   // inner: capacity ascending (unbounded)
                dp[j] += dp[j - c];
        return dp[amount];
    }
}

// LC 377 counts PERMUTATIONS: capacity outside, numbers inside
class Solution377 {
    public int combinationSum4(int[] nums, int target) {
        int[] dp = new int[target + 1];
        dp[0] = 1;
        for (int j = 1; j <= target; j++)       // outer: capacity -> permutations
            for (int x : nums)                  // inner: numbers
                if (j >= x) dp[j] += dp[j - x];
        return dp[target];
    }
}`,
              zh: `// LC 518 数【组合数】:外层硬币,内层容量
class Solution {
    public int change(int amount, int[] coins) {
        int[] dp = new int[amount + 1];
        dp[0] = 1;
        for (int c : coins)                     // 外层:硬币 → 组合数
            for (int j = c; j <= amount; j++)   // 内层:容量正序(完全背包)
                dp[j] += dp[j - c];
        return dp[amount];
    }
}

// LC 377 数【排列数】:外层容量,内层数字
class Solution377 {
    public int combinationSum4(int[] nums, int target) {
        int[] dp = new int[target + 1];
        dp[0] = 1;
        for (int j = 1; j <= target; j++)       // 外层:容量 → 排列数
            for (int x : nums)                  // 内层:数字
                if (j >= x) dp[j] += dp[j - x];
        return dp[target];
    }
}`,
            },
            hl: [6, 18],
            note: {
              en: (
                <>
                  <b>Overflow in LC 377:</b> the intermediate counts can exceed the
                  range of a 32-bit int even when the final answer fits.
                  LeetCode guarantees the final answer fits in an int, so this code
                  is accepted, but accumulating in <code>long</code> is the safer
                  habit.
                </>
              ),
              zh: (
                <>
                  <b>LC 377 的溢出:</b>即使最终答案在 32 位 int 范围内,
                  中间的累加值也可能超出。LeetCode 保证最终答案能放进 int,
                  所以这份代码能通过,但用 <code>long</code> 累加是更稳妥的习惯。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `# LC 518 counts COMBINATIONS: coins outside, capacity inside
class Solution:
    def change(self, amount: int, coins: list[int]) -> int:
        dp = [1] + [0] * amount
        for c in coins:                 # coins outside -> combinations
            for j in range(c, amount + 1):
                dp[j] += dp[j - c]
        return dp[amount]

# LC 377 counts PERMUTATIONS: capacity outside, numbers inside
class Solution377:
    def combinationSum4(self, nums: list[int], target: int) -> int:
        dp = [1] + [0] * target
        for j in range(1, target + 1):  # capacity outside -> permutations
            for x in nums:
                if j >= x:
                    dp[j] += dp[j - x]
        return dp[target]`,
              zh: `# LC 518 数【组合数】:外层硬币,内层容量
class Solution:
    def change(self, amount: int, coins: list[int]) -> int:
        dp = [1] + [0] * amount
        for c in coins:                 # 硬币在外 → 组合数
            for j in range(c, amount + 1):
                dp[j] += dp[j - c]
        return dp[amount]

# LC 377 数【排列数】:外层容量,内层数字
class Solution377:
    def combinationSum4(self, nums: list[int], target: int) -> int:
        dp = [1] + [0] * target
        for j in range(1, target + 1):  # 容量在外 → 排列数
            for x in nums:
                if j >= x:
                    dp[j] += dp[j - x]
        return dp[target]`,
            },
            hl: [5, 14],
            note: {
              en: (
                <>
                  The two functions differ in <b>which loop is on the outside</b>,
                  and nothing else. Do not memorise it as a rule — read it off the
                  meaning: an item that is introduced once, after all earlier
                  items, cannot produce a second ordering.
                </>
              ),
              zh: (
                <>
                  两个函数的差别只有<b>哪一层循环在外</b>。
                  不必把它当口诀背 —— 从含义上读出来就行:
                  一件物品只登场一次、且总在前面的物品之后,就不可能产生第二种顺序。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// LC 518 counts COMBINATIONS: coins outside, capacity inside
var change = function (amount, coins) {
  const dp = Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const c of coins)              // coins outside -> combinations
    for (let j = c; j <= amount; j++) dp[j] += dp[j - c];
  return dp[amount];
};

// LC 377 counts PERMUTATIONS: capacity outside, numbers inside
var combinationSum4 = function (nums, target) {
  const dp = Array(target + 1).fill(0);
  dp[0] = 1;
  for (let j = 1; j <= target; j++)   // capacity outside -> permutations
    for (const x of nums)
      if (j >= x) dp[j] += dp[j - x];
  return dp[target];
};`,
              zh: `// LC 518 数【组合数】:外层硬币,内层容量
var change = function (amount, coins) {
  const dp = Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const c of coins)              // 硬币在外 → 组合数
    for (let j = c; j <= amount; j++) dp[j] += dp[j - c];
  return dp[amount];
};

// LC 377 数【排列数】:外层容量,内层数字
var combinationSum4 = function (nums, target) {
  const dp = Array(target + 1).fill(0);
  dp[0] = 1;
  for (let j = 1; j <= target; j++)   // 容量在外 → 排列数
    for (const x of nums)
      if (j >= x) dp[j] += dp[j - x];
  return dp[target];
};`,
            },
            hl: [5, 14],
            note: {
              en: (
                <>
                  <b>LC 139 Word Break</b> belongs to the capacity-outside family
                  too. A sentence has an order, so the outer loop runs over prefix
                  lengths and the inner loop over dictionary words — the same shape
                  as LC 377. Whenever order matters, capacity goes on the outside.
                </>
              ),
              zh: (
                <>
                  <b>LC 139 单词拆分</b>同样属于「容量在外」这一族:
                  句子有先后顺序,所以外层遍历前缀长度、内层枚举词典单词 ——
                  和 LC 377 是同一个形状。凡是顺序有关,容量就放外层。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "How to tell which one a problem wants",
            zh: "怎么判断题目要哪一个",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>Items outside, capacity inside → combinations (LC 518):</b>{" "}
                  the items enter in a fixed order, so orderings are not counted
                  separately.
                  <br />
                  <b>
                    Capacity outside, items inside → permutations (LC 377, LC 139):
                  </b>{" "}
                  every item gets a turn as the last one added at each capacity, so
                  orderings are counted separately.
                  <br />
                  To decide, ask one question about the problem statement:{" "}
                  <b>do 1 + 2 and 2 + 1 count as one answer or two?</b> One answer
                  means the LC 518 nesting; two answers means the LC 377 nesting.
                  Note that LC 377 is named &quot;Combination Sum IV&quot; but
                  counts permutations, so read the examples rather than the title.
                </>
              }
              zh={
                <>
                  <b>物品在外、容量在内 → 组合数(LC 518):</b>
                  物品按固定次序登场,不同顺序不会被分开计数。
                  <br />
                  <b>容量在外、物品在内 → 排列数(LC 377、LC 139):</b>
                  每个容量都让所有物品轮流当「最后一个」,不同顺序被分别计数。
                  <br />
                  判断时只问一句:<b>1 + 2 和 2 + 1 算一种答案还是两种?</b>
                  算一种用 LC 518 的嵌套,算两种用 LC 377 的嵌套。
                  另外注意 LC 377 题名叫「组合总和 IV」,数的却是排列 ——
                  要看示例,不要看标题。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §09 题单 ================= */}
      <Section
        id="problems"
        index="09"
        title={{
          en: "Problem set: ten knapsack problems",
          zh: "高频题单:背包 10 题",
        }}
        desc={{
          en: "Ordered as fill exactly → counting → two costs → unbounded → combinations and permutations → grouped. Think for 30 seconds before opening a hint.",
          zh: "顺序是 装满型 → 计数型 → 二维费用 → 完全背包 → 组合与排列 → 分组背包。先想 30 秒再看提示",
        }}
        badge={
          <span className="chip">
            <T en="Core set" zh="主线必做" />
          </span>
        }
      >
        <ProblemSet ch="knapsack" items={PROBLEMS} />
      </Section>

      {/* ================= §10 Quiz ================= */}
      <Section
        id="quiz"
        index="10"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Answer all 8 correctly to mark this chapter complete.",
          zh: "8 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="knapsack" items={QUIZ} />
      </Section>

      <KeyPoints
        points={{
          en: [
            <>
              A knapsack is the <b>take-or-skip</b> model from House Robber plus a{" "}
              <b>capacity limit</b>. State: dp[i][j] = the best result using the
              first i items with weight at most j. <b>Take</b> = dp[i−1][j−w] + v,{" "}
              <b>skip</b> = dp[i−1][j], base row 0 = 0, answer at dp[n][W].
            </>,
            <>
              In the rolled one-dimensional form, <b>0/1 runs the capacity
              downward</b> and <b>unbounded runs it upward</b>. Do not memorise
              this. Derive it: descending reads dp[j−w] from the previous
              item&apos;s row, ascending reads it from the current item&apos;s row,
              and reading the current row is what lets an item be reused.
            </>,
            <>
              The operator follows the question: largest value → <b>max</b>, can it
              be filled → <b>or</b>, how many ways → <b>+=</b>, fewest items →{" "}
              <b>min</b>. The skeleton stays the same, so copying the operator from
              the previous problem is the usual mistake.
            </>,
            <>
              Subset-sum problems are reductions, not new algorithms. LC 416 asks{" "}
              <b>can it be filled</b>, LC 1049 asks <b>how full can it get</b>, LC
              494 asks <b>in how many ways</b> — all three are the 0/1 knapsack
              with a different cell type.
            </>,
            <>
              For counting on an unbounded knapsack:{" "}
              <b>items outside gives combinations (LC 518)</b>,{" "}
              <b>capacity outside gives permutations (LC 377, LC 139)</b>. The test
              is one question: do 1 + 2 and 2 + 1 count as one way or two? For min
              and max problems the order does not matter.
            </>,
            <>
              Two costs (LC 474) means one weight becomes a pair of weights. Each
              limited resource adds one dimension, and each dimension takes its
              direction from its own reuse rule. The number of states is the
              product of the limits.
            </>,
            <>
              The cost is (number of states) × (work per transition). For the basic
              form that is O(nW) time, and O(nW) space before the rolling
              reduction, O(W) after. O(nW) is polynomial in the <i>value</i> of W,
              not in the length of the input, so this does not make the knapsack
              problem easy — it is still NP-hard.
            </>,
            <>
              Four modelling questions: <b>what is an item · what is the capacity ·
              how many times may one item be used · what is being asked</b>. Answer
              them and the code is nearly determined.
            </>,
          ],
          zh: [
            <>
              背包 = 打家劫舍的「<b>选 / 不选</b>」加上一条<b>容量限制</b>。
              状态:dp[i][j] = 只用前 i 件、总重不超过 j 时的最优值。
              <b>装</b> = dp[i−1][j−w] + v,<b>不装</b> = dp[i−1][j],
              第 0 行全为 0,答案在 dp[n][W]。
            </>,
            <>
              压成一维后,<b>0-1 背包容量倒序</b>,<b>完全背包容量正序</b>。
              这不需要背,可以推:倒序时 dp[j−w] 来自上一件物品那一行,
              正序时来自本件物品自己这一行,而「读本行」正是允许重复取用的原因。
            </>,
            <>
              算子跟着问题走:最大价值 → <b>max</b>,能否装满 → <b>或</b>,
              有几种方案 → <b>+=</b>,最少件数 → <b>min</b>。
              骨架不变,所以直接照抄上一题的算子是最常见的错误。
            </>,
            <>
              子集和类问题是归约,不是新算法:LC 416 问<b>能否装满</b>,
              LC 1049 问<b>最多能装多满</b>,LC 494 问<b>有几种装法</b> ——
              三者都是 0-1 背包,只是每格存的东西不同。
            </>,
            <>
              完全背包的计数题:<b>物品在外数出组合数(LC 518)</b>,
              <b>容量在外数出排列数(LC 377、LC 139)</b>。
              判据只有一句:1 + 2 与 2 + 1 算一种还是两种?
              而求最值时,两层顺序无所谓。
            </>,
            <>
              二维费用(LC 474)就是把一个重量换成一对重量。
              每多一种受限资源就多开一维,每一维的方向由它自己的重复取用规则决定。
              状态数是各个上限的乘积。
            </>,
            <>
              复杂度 =(状态数)×(每次转移的工作量)。基本形态是时间 O(nW),
              压缩之前空间 O(nW),压缩之后 O(W)。O(nW) 是对 W 的<i>数值</i>
              而言的多项式,不是对输入长度而言的,所以这并不意味着背包问题很容易 ——
              它仍然是 NP 困难的。
            </>,
            <>
              建模四问:<b>什么是物品 · 什么是容量 · 每件最多用几次 · 问的是什么</b>。
              答完这四问,代码基本就定下来了。
            </>,
          ],
        }}
      />

      <ChapterFooter ch="knapsack" />
    </main>
  );
}
