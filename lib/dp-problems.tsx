// Chapter 7 - Dynamic Programming Basics: problem set (the quiz is in lib/dp-quiz.tsx).
// The problem set covers the introductory DP problems on lc.md's main track (linear / grid /
// House Robber), ordered easy to hard; hint only points at a direction without spoiling,
// key explains the optimal solution in one paragraph.
// Bilingual: all copy is Loc<...> with English as the default. Titles use LeetCode's official
// English and Chinese names.

import type { Problem } from "@/lib/problems";

export const PROBLEMS: Problem[] = [
  {
    lc: 509,
    title: { en: "Fibonacci Number", zh: "斐波那契数" },
    d: "easy",
    tags: { en: ["1D DP", "Template"], zh: ["一维 DP", "模板题"] },
    hint: {
      en: "Plain recursion recomputes the same values many times. But f(n) only needs the two values before it, so one forward pass is enough.",
      zh: "朴素递归会把同一个值算很多遍。但 f(n) 只依赖前两个值,顺着算一遍就够了。",
    },
    key: {
      en: (
        <>
          State: dp[i] is the i-th Fibonacci number. Transition: dp[i] = dp[i-1]
          + dp[i-2]. Base: dp[0] = 0, dp[1] = 1. Fill from left to right, because
          the transition reads the two cells on the left. There are n states and
          each transition costs O(1), so the time is O(n). The table is O(n)
          space, and since only the last two cells are ever read, two variables
          replace it and the space drops to O(1). This is the smallest complete
          example of a linear DP.
        </>
      ),
      zh: (
        <>
          状态:dp[i] = 第 i 个斐波那契数。转移:dp[i] = dp[i-1] + dp[i-2]。初始:dp[0] = 0、dp[1] = 1。转移读的是左边两格,所以必须从左往右填。共 n 个状态、每次转移 O(1),时间 O(n);整张表占 O(n) 空间,而任何时刻只会读到最近两格,于是用两个变量代替数组,空间降到 O(1)。这是线性 DP 最小的完整样本。
        </>
      ),
    },
  },
  {
    lc: 70,
    title: { en: "Climbing Stairs", zh: "爬楼梯" },
    d: "easy",
    tags: { en: ["1D DP", "Counting"], zh: ["一维 DP", "计数"] },
    hint: {
      en: "Stand on step n and look back. The last move came either from step n-1 or from step n-2. The two cases never overlap and nothing else is possible.",
      zh: "站在第 n 阶回头看:最后一步要么从第 n−1 阶来,要么从第 n−2 阶来 —— 两种来路互不重叠,也没有第三种。",
    },
    key: {
      en: (
        <>
          State: dp[i] is the number of distinct ways to reach step i. The last
          move is either one step or two steps, so dp[i] = dp[i-1] + dp[i-2].
          Base: dp[1] = 1, dp[2] = 2. The values are the Fibonacci numbers
          shifted by one position. Splitting by &quot;how did the last step
          arrive&quot; is the standard way to write a counting DP. Worked example
          A in this chapter fills the table cell by cell.
        </>
      ),
      zh: (
        <>
          状态:dp[i] = 爬到第 i 阶的方案数。最后一步只能跨 1 阶或 2 阶,所以 dp[i] = dp[i-1] + dp[i-2],初始 dp[1] = 1、dp[2] = 2。这串数就是错开一位的斐波那契数列。「最后一步是怎么来的」是计数型 DP 最通用的提问方式。本章精讲 A 有逐格动画。
        </>
      ),
    },
  },
  {
    lc: 746,
    title: { en: "Min Cost Climbing Stairs", zh: "使用最小花费爬楼梯" },
    d: "easy",
    tags: { en: ["1D DP", "Minimum"], zh: ["一维 DP", "最值"] },
    hint: {
      en: "Same skeleton as LC 70. Replace \"add the two counts\" with \"take the cheaper of the two ways in\".",
      zh: "和 LC 70 同一个骨架,把「两个方案数相加」换成「两条来路取更便宜的那条」。",
    },
    key: {
      en: (
        <>
          State: dp[i] is the minimum cost to stand on step i, before paying to
          jump off it. Transition: dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] +
          cost[i-2]). Base: dp[0] = dp[1] = 0, because you may start from either
          step 0 or step 1 for free. The answer is dp[n]. Same table as LC 70,
          with min instead of +. The operator in the transition follows the
          question the problem asks: counting adds, optimization takes min or
          max.
        </>
      ),
      zh: (
        <>
          状态:dp[i] = 站上第 i 阶(还没为跳离它付钱)的最小花费。转移:dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])。初始 dp[0] = dp[1] = 0 —— 从第 0 阶或第 1 阶起跳都不要钱。答案是 dp[n]。和 LC 70 是同一张表,只把 + 换成 min:转移里用哪个算子,取决于题目问的是「多少种」还是「最优值」。
        </>
      ),
    },
  },
  {
    lc: 62,
    title: { en: "Unique Paths", zh: "不同路径" },
    d: "medium",
    tags: { en: ["Grid DP", "Counting"], zh: ["网格 DP", "计数"] },
    hint: {
      en: "The robot can only arrive from above or from the left. The number of paths to a cell is the sum of the paths to those two cells.",
      zh: "机器人只能从上方或左方来 —— 到每一格的路数,等于这两个来路的路数之和。",
    },
    key: {
      en: (
        <>
          State: dp[i][j] is the number of paths from (0, 0) to (i, j).
          Transition: dp[i][j] = dp[i-1][j] + dp[i][j-1]. Base: the first row and
          the first column are all 1, because there is only one straight way in.
          The transition reads the cell above and the cell on the left, so fill
          top to bottom and left to right. There are m×n states and each costs
          O(1), so the time is O(mn) and the table is O(mn). Keeping only one row
          brings the space to O(n). A closed form C(m+n-2, m-1) also exists, but
          learn the table first. Worked example B animates the whole table.
        </>
      ),
      zh: (
        <>
          状态:dp[i][j] = 从 (0, 0) 走到 (i, j) 的路径条数。转移:dp[i][j] = dp[i-1][j] + dp[i][j-1]。初始:第一行、第一列全为 1 —— 只有一条直路能走进来。转移读的是上一行同列和本行左边一格,所以从上到下、从左到右填。共 m×n 个状态、每个 O(1),时间 O(mn),表 O(mn);只保留一行可把空间降到 O(n)。它也有组合数闭式解 C(m+n-2, m-1),但先学会填表。本章精讲 B 有整张表逐格填充的动画。
        </>
      ),
    },
  },
  {
    lc: 63,
    title: { en: "Unique Paths II", zh: "不同路径 II" },
    d: "medium",
    tags: { en: ["Grid DP", "Initialization"], zh: ["网格 DP", "边界处理"] },
    hint: {
      en: "Only one thing changes from LC 62: what is dp for an obstacle cell? And after the first row hits an obstacle, is the rest of that row still 1?",
      zh: "和 62 唯一的区别:障碍格的 dp 值是多少?第一行遇到障碍之后,后面还全是 1 吗?",
    },
    key: {
      en: (
        <>
          An obstacle cell has dp = 0, because no path can stop on it. Every
          other cell uses the LC 62 transition. The real work is in the
          initialization: once the first row or the first column hits an
          obstacle, every cell after it in that line is 0, so you cannot fill the
          border with 1 unconditionally. That single condition is the whole
          problem.
        </>
      ),
      zh: (
        <>
          障碍格 dp = 0 —— 没有任何路径能停在障碍上,其余格子的转移和 62 一样。真正的考点在初始化:第一行或第一列一旦出现障碍,该行(列)其后的所有格子都是 0,不能不加判断地填 1。这一个条件就是本题的全部。
        </>
      ),
    },
  },
  {
    lc: 64,
    title: { en: "Minimum Path Sum", zh: "最小路径和" },
    d: "medium",
    tags: { en: ["Grid DP", "Minimum"], zh: ["网格 DP", "最值"] },
    hint: {
      en: "The LC 62 skeleton again. Replace \"add the two path counts\" with \"take the smaller of the two path sums, then add the current cell\".",
      zh: "还是 62 的骨架,把「两个路数相加」换成「两条来路的和取小,再加上本格」。",
    },
    key: {
      en: (
        <>
          State: dp[i][j] is the minimum sum along a path from (0, 0) to (i, j).
          Transition: dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j]. The
          first row and the first column are prefix sums. LC 62, 63, and 64 share
          one grid and one loop order. Only the operator and the base values
          change. That is what a grid DP template really means.
        </>
      ),
      zh: (
        <>
          状态:dp[i][j] = 从 (0, 0) 走到 (i, j) 的路径和的最小值。转移:dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j],第一行、第一列是前缀和。62 / 63 / 64 共用同一张网格和同一套遍历顺序,变的只有算子和初始值 —— 这才是「网格 DP 模板」的真正含义。
        </>
      ),
    },
  },
  {
    lc: 120,
    title: { en: "Triangle", zh: "三角形最小路径和" },
    d: "medium",
    tags: { en: ["Grid DP", "Fill upwards"], zh: ["网格 DP", "倒序遍历"] },
    hint: {
      en: "Filling downwards forces you to special-case both ends of each row. Fill upwards instead: the last row is already the answer for itself.",
      zh: "自顶向下要处理每行两端的边界;自底向上呢?最后一行本身就是现成的初始值。",
    },
    key: {
      en: (
        <>
          Fill from the bottom row upwards. State: dp[j] is the minimum sum from
          cell j of the current row down to the bottom. Transition: dp[j] =
          triangle[i][j] + min(dp[j], dp[j+1]). Start with the last row and move
          up; the answer is dp[0]. Going upwards means every cell has both
          children inside the triangle, so the end-of-row special cases
          disappear. Changing the fill direction to remove boundary cases is a
          common DP move.
        </>
      ),
      zh: (
        <>
          自底向上填。状态:dp[j] = 从当前行第 j 格往下走到底的最小路径和。转移:dp[j] = triangle[i][j] + min(dp[j], dp[j+1]),从倒数第二行滚到顶,答案是 dp[0]。倒着填时,每一格的两个孩子都还在三角形内,行两端的特判自然消失 —— 「换个填表方向消掉边界」是 DP 的常用手法。
        </>
      ),
    },
  },
  {
    lc: 343,
    title: { en: "Integer Break", zh: "整数拆分" },
    d: "medium",
    tags: { en: ["1D DP", "Enumerate a split"], zh: ["一维 DP", "决策枚举"] },
    hint: {
      en: "Split n into j and n-j. The second part can either stay whole or be broken up further. Both cases must be compared.",
      zh: "把 n 拆成 j 和 n−j 两部分:后一半是「就到此为止」还是「继续拆」?两种都要比。",
    },
    key: {
      en: (
        <>
          State: dp[i] is the largest product you can get by breaking i into at
          least two positive parts. Transition: dp[i] = max over j from 1 to i-1
          of max(j × (i-j), j × dp[i-j]). The first term keeps i-j whole; the
          second breaks it further. Base: dp[2] = 1. Here the transition
          enumerates a split point instead of reading one or two fixed cells, so
          the work per state is O(i) and the total time is O(n²). A pure math
          solution (use as many 3s as possible) is faster, but the
          &quot;enumerate the split point&quot; pattern comes back in interval
          DP.
        </>
      ),
      zh: (
        <>
          状态:dp[i] = 把 i 拆成至少两个正整数后,乘积的最大值。转移:dp[i] = max(j × (i−j), j × dp[i−j]),j 从 1 取到 i−1 ——
          前一项表示 i−j 不再拆,后一项表示继续拆。初始 dp[2] = 1。这里的转移第一次不是读固定的一两格,而是<b>枚举拆分点 j</b>:每个状态的转移代价是 O(i),总时间 O(n²)。数学解(尽量拆 3)更快,但「枚举拆分点」这个模式会在区间 DP 里反复出现。
        </>
      ),
    },
  },
  {
    lc: 96,
    title: { en: "Unique Binary Search Trees", zh: "不同的二叉搜索树" },
    d: "medium",
    tags: { en: ["1D DP", "Enumerate the root"], zh: ["一维 DP", "枚举根"] },
    hint: {
      en: "Enumerate which value is the root. The left subtree uses j nodes and the right subtree uses i-1-j. The two sides are independent, so multiply.",
      zh: "枚举谁当根:左子树用掉 j 个节点,右子树用掉 i−1−j 个 —— 两边互不影响,方案数相乘。",
    },
    key: {
      en: (
        <>
          State: dp[i] is the number of distinct BST shapes built from i nodes.
          Transition: dp[i] = sum over j from 0 to i-1 of dp[j] × dp[i-1-j],
          where j is the size of the left subtree. Base: dp[0] = 1 (the empty
          tree counts as one shape). Enumerating a split point and multiplying
          the two sides is the standard recurrence for the Catalan numbers. Like
          LC 343, the work per state is O(i), so the total is O(n²).
        </>
      ),
      zh: (
        <>
          状态:dp[i] = 用 i 个节点能构成的不同二叉搜索树形态数。转移:dp[i] = Σ dp[j] × dp[i−1−j](j 为左子树的节点数,从 0 取到 i−1)。初始 dp[0] = 1 —— 空树也算一种形态。「枚举分界点,左右方案数相乘」是卡特兰数的标准递推式。和 343 一样,每个状态的转移代价是 O(i),总时间 O(n²)。
        </>
      ),
    },
  },
  {
    lc: 53,
    title: { en: "Maximum Subarray", zh: "最大子数组和" },
    d: "medium",
    tags: { en: ["1D DP", "Kadane", "Review"], zh: ["一维 DP", "Kadane", "复盘"] },
    hint: {
      en: "Define dp[i] as the largest sum of a subarray that ends exactly at index i. Note \"ends at i\", not \"within the first i elements\".",
      zh: "把 dp[i] 定义成「以下标 i 结尾的最大子数组和」—— 注意是「以 i 结尾」,不是「前 i 个之内」。",
    },
    key: {
      en: (
        <>
          State: dp[i] is the largest sum of a subarray ending exactly at index
          i. Transition: dp[i] = max(nums[i], dp[i-1] + nums[i]). If the piece
          before you contributes a positive amount, extend it; otherwise start
          again at i. The answer is the maximum over all dp[i], not dp[n-1],
          because the best subarray may end anywhere. This is Kadane&apos;s
          algorithm seen as a DP. The divide and conquer view of the same problem
          is in chapter 02.
        </>
      ),
      zh: (
        <>
          状态:dp[i] = 以下标 i 结尾的最大子数组和。转移:dp[i] = max(nums[i], dp[i-1] + nums[i]) ——
          前面那段贡献为正就带上,否则从 i 自己重新开始。答案是所有 dp[i] 的最大值,<b>不是 dp[n−1]</b>,因为最优段可以在任意位置结尾。这就是 Kadane 算法的 DP 视角;同一道题的分治视角在第 02 章。
        </>
      ),
    },
  },
  {
    lc: 198,
    title: { en: "House Robber", zh: "打家劫舍" },
    d: "medium",
    tags: { en: ["1D DP", "Choose or skip"], zh: ["一维 DP", "选或不选"] },
    hint: {
      en: "Each house allows only two decisions: take it, and then house i-1 must be skipped; or skip it, and inherit the best result so far.",
      zh: "对每间房只有两个决策:偷(那就必须放弃第 i−1 间)或不偷(直接继承前面的最优)。",
    },
    key: {
      en: (
        <>
          State: dp[i] is the largest amount you can take from houses 0 through
          i without taking two neighbors. Transition: dp[i] = max(dp[i-1],
          dp[i-2] + nums[i]). Note that the first term does not add nums[i]: dp
          means &quot;the best over houses 0 through i&quot;, not &quot;the best
          that must include house i&quot;, so the branch that skips house i
          simply carries dp[i-1] forward. The state definition decides what the
          transition looks like. Worked example C takes this apart cell by cell.
        </>
      ),
      zh: (
        <>
          状态:dp[i] = 只考虑第 0 到第 i 间房、且不偷相邻两间时,能拿到的最大金额。转移:dp[i] = max(dp[i-1], dp[i-2] + nums[i])。注意第一项没有加 nums[i]:dp 的含义是「第 0 到第 i 间之内的最优」,不是「必须偷第 i 间」,所以「不偷第 i 间」这一支直接把 dp[i-1] 抄过来。状态定义决定转移长什么样。本章精讲 C 有逐格拆解。
        </>
      ),
    },
  },
  {
    lc: 213,
    title: { en: "House Robber II", zh: "打家劫舍 II" },
    d: "medium",
    tags: { en: ["1D DP", "Break the circle"], zh: ["一维 DP", "环形拆解"] },
    hint: {
      en: "A circle adds exactly one new constraint: the first and the last house cannot both be taken. Split into two cases and run LC 198 on each.",
      zh: "首尾相邻只带来一条新约束:第一间和最后一间不能同时偷。分成两种情况,各跑一遍 198。",
    },
    key: {
      en: (
        <>
          A circle is two lines. Either give up the last house and solve LC 198
          on the range [0, n-2], or give up the first house and solve it on
          [1, n-1]. Take the larger of the two. Every valid selection skips at
          least one of the two ends, so the two cases cover all of them. Turning
          a circular constraint into two linear runs is easier and safer than
          encoding the circle inside the transition. Handle n = 1 separately.
        </>
      ),
      zh: (
        <>
          环等于两条链:要么放弃最后一间,在区间 [0, n−2] 上跑 198;要么放弃第一间,在 [1, n−1] 上跑一遍,取两者较大值。任何合法方案都至少放弃首尾之一,所以两种情况覆盖了全部可能。把环形约束拆成两次线性求解,比在转移里硬处理环简单得多。注意 n = 1 要单独处理。
        </>
      ),
    },
  },
  {
    lc: 322,
    title: { en: "Coin Change", zh: "零钱兑换" },
    d: "medium",
    tags: { en: ["1D DP", "Greedy fails"], zh: ["一维 DP", "贪心反例"] },
    hint: {
      en: "Coins 1, 3, 4 and a target of 6: taking the largest coin first gives 3 coins, but the answer is 2. Why does taking the largest first fail here?",
      zh: "硬币 [1, 3, 4] 凑 6:先拿最大的 4,结果是 3 枚;正确答案是 3+3 两枚 —— 贪心为什么错了?",
    },
    key: {
      en: (
        <>
          State: dp[a] is the fewest coins that add up to exactly a, or infinity
          if a cannot be formed. Transition: dp[a] = min over every coin c with
          c ≤ a of dp[a-c] + 1, which enumerates what the last coin was. Base:
          dp[0] = 0. There are amount+1 states and each transition scans all k
          coin values, so the time is O(amount × k) and the table is O(amount).
          Taking the largest coin first can rule out the best combination; the DP
          tries every choice of last coin instead. Worked example D shows this.
          Chapter 08 rebuilds the same problem as an unbounded knapsack.
        </>
      ),
      zh: (
        <>
          状态:dp[a] = 恰好凑出金额 a 所需的最少硬币数,凑不出则为无穷大。转移:dp[a] = min(dp[a−c] + 1),c 取遍所有满足 c ≤ a 的面额 ——
          也就是枚举「最后一枚硬币是谁」。初始 dp[0] = 0。共 amount+1 个状态,每次转移要扫过全部 k 种面额,时间 O(amount × k),表占 O(amount) 空间。每步拿最大面额会直接排除掉最优组合,而 DP 把每一种「最后一枚」都试了一遍。本章精讲 D 演示了这一点;第 8 章会以完全背包的视角重新建模这道题。
        </>
      ),
    },
  },
];
