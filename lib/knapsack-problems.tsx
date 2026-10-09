// Chapter 8 - Knapsack Problems: problem set (the quiz is in lib/knapsack-quiz.tsx).
// The problem set covers the knapsack problems on lc.md's main track (0/1 / unbounded /
// two-dimensional cost / counting / permutations vs combinations / grouped), ordered easy to
// hard; hint only points at a direction without spoiling, key explains the optimal solution
// in one paragraph. 322 is taught in chapter 7 and revisited here.
// Bilingual: all copy is Loc<...> with English as the default. Titles use LeetCode's official
// English and Chinese names.
// Terminology: 0-1 背包 = 0/1 knapsack; 完全背包 = unbounded knapsack;
//              多重背包 = bounded knapsack; 分组背包 = grouped knapsack.

import type { Problem } from "@/lib/problems";

export const PROBLEMS: Problem[] = [
  {
    lc: 416,
    title: { en: "Partition Equal Subset Sum", zh: "分割等和子集" },
    d: "medium",
    tags: {
      en: ["0/1 knapsack", "Fill exactly", "Subset sum"],
      zh: ["0-1 背包", "装满型", "子集和"],
    },
    hint: {
      en: "If the total is odd, the answer is false. Otherwise the question becomes: can you pick some of the numbers so that they add up to exactly sum/2?",
      zh: "总和是奇数直接 false;否则问题变成:能不能挑一些数,正好凑出 sum/2?",
    },
    key: {
      en: (
        <>
          State: dp[j] is true when some subset of the numbers seen so far adds up
          to exactly j. Transition: dp[j] = dp[j] or dp[j-num]. Base: dp[0] =
          true, because the empty subset adds up to 0. The answer is dp[sum/2];
          if sum is odd, no split exists at all. Each number may be used at most
          once, so the one-dimensional loop over capacity runs <b>downward</b>:
          dp[j-num] then still holds the value from before this number was
          processed. Time O(n × sum/2), space O(sum/2). Worked example A fills the
          whole boolean table cell by cell.
        </>
      ),
      zh: (
        <>
          状态:dp[j] = 用已经处理过的那些数,能否正好凑出 j。转移:dp[j] = dp[j] 或 dp[j−num]。初始:dp[0] = true(空集凑出 0)。答案是 dp[sum/2];sum 为奇数时根本无法等分。每个数最多用一次,所以一维数组遍历容量要<b>倒序</b> ——
          这样 dp[j−num] 读到的还是「还没处理这个数」时的值。时间 O(n × sum/2),空间 O(sum/2)。本章精讲 A 有整张布尔表逐格点亮的动画。
        </>
      ),
    },
  },
  {
    lc: 1049,
    title: { en: "Last Stone Weight II", zh: "最后一块石头的重量 II" },
    d: "medium",
    tags: {
      en: ["0/1 knapsack", "Fill as much as possible", "Variant of 416"],
      zh: ["0-1 背包", "尽量装满", "416 变式"],
    },
    hint: {
      en: "Split the stones into two piles and make the two totals as close as possible. That is LC 416 with a different question.",
      zh: "把石头分成两堆,让两堆重量尽量接近 —— 和 LC 416 是同一道题换了个问法。",
    },
    key: {
      en: (
        <>
          Smashing two stones and keeping the difference is the same as giving
          every stone a plus or a minus sign, so the final weight is the
          difference between two piles. To make that difference smallest, one pile
          must get as close to sum/2 as possible without going over. So: capacity
          sum/2, and each stone&apos;s weight is both its cost and its value. Find
          the largest reachable weight maxHalf; the answer is sum - 2 × maxHalf.
          Same skeleton as LC 416, with &quot;can it be filled exactly&quot;
          replaced by &quot;how full can it get&quot;.
        </>
      ),
      zh: (
        <>
          每次砸两块石头、保留差值,等价于给每块石头分配一个正号或负号,最终重量就是两堆之差。要让这个差最小,就得让其中一堆尽量接近 sum/2(但不超过)。于是:容量 sum/2,每块石头的重量既是费用也是价值,求能装下的最大重量 maxHalf,答案 = sum − 2 × maxHalf。骨架与 LC 416 一致,只把「能否正好装满」换成「最多能装多满」。
        </>
      ),
    },
  },
  {
    lc: 494,
    title: { en: "Target Sum", zh: "目标和" },
    d: "medium",
    tags: {
      en: ["0/1 knapsack", "Counting", "Also a backtracking problem"],
      zh: ["0-1 背包", "计数型", "也可用回溯解"],
    },
    hint: {
      en: "Let P be the sum of the numbers you give a plus sign and N the sum of the rest: P - N = target and P + N = sum, so P = (sum + target) / 2.",
      zh: "设加正号的数之和为 P、加负号的绝对值之和为 N:P−N=target、P+N=sum ⇒ P=(sum+target)/2。",
    },
    key: {
      en: (
        <>
          Each number gets a plus or a minus sign, so backtracking takes O(2ⁿ).
          The algebra above turns the problem into: how many subsets add up to
          exactly P? If P is not a whole number, is negative, or is larger than
          sum, the answer is 0. What is left is a <b>counting 0/1 knapsack</b>:
          dp[j] += dp[j-num] with capacity descending, and dp[0] = 1 because the
          empty subset is one way to reach 0. Time O(n × P). Worked example B puts
          the decision tree and the counting table side by side.
        </>
      ),
      zh: (
        <>
          每个数选 + 或 −,回溯是 O(2ⁿ)。上面那步代数把问题变成:有几个子集的和正好等于 P?若 P 不是整数、为负数,或大于 sum,则答案为 0。剩下的是一个<b>计数型 0-1 背包</b>:dp[j] += dp[j−num],容量倒序,
          dp[0] = 1(空集是凑出 0 的一种方案)。时间 O(n × P)。本章精讲 B 把决策树和计数表并排放在一起。
        </>
      ),
    },
  },
  {
    lc: 474,
    title: { en: "Ones and Zeroes", zh: "一和零" },
    d: "medium",
    tags: {
      en: ["0/1 knapsack", "Two costs"],
      zh: ["0-1 背包", "二维费用"],
    },
    hint: {
      en: "Each string spends two kinds of capacity at once: some zeros and some ones. Give the table one dimension per resource.",
      zh: "每个字符串同时花掉两种容量:若干个 0 和若干个 1 —— 每种受限资源给 dp 开一维。",
    },
    key: {
      en: (
        <>
          Two-cost 0/1 knapsack. Each string is one item; its two costs are the
          number of 0s and the number of 1s it contains, and its value is 1
          because you are counting strings. State: dp[i][j] is the largest number
          of strings you can choose using at most i zeros and j ones. Transition:{" "}
          <span className="mono">dp[i][j] = max(dp[i][j], dp[i-z][j-o] + 1)</span>
          . Each string is still used at most once, so <b>both</b> capacity loops
          run downward. Time O(len(strs) × m × n). The skeleton is unchanged; only
          the weight became a pair of numbers.
        </>
      ),
      zh: (
        <>
          二维费用 0-1 背包。每个字符串是一件物品,两种费用是它含的 0 数与 1 数,价值恒为 1(数的是件数)。状态:dp[i][j] = 最多用 i 个 0、j 个 1 时能选的字符串数。转移:
          <span className="mono">dp[i][j] = max(dp[i][j], dp[i−z][j−o] + 1)</span>
          。每个字符串仍然只用一次,所以<b>两层</b>容量都倒序。时间 O(len(strs) × m × n)。骨架没变,只是「重量」变成了一对数。
        </>
      ),
    },
  },
  {
    lc: 322,
    title: { en: "Coin Change", zh: "零钱兑换" },
    d: "medium",
    tags: {
      en: ["Unbounded knapsack", "Minimum", "Review"],
      zh: ["完全背包", "最值型", "复盘"],
    },
    hint: {
      en: "Every coin can be used any number of times. In the one-dimensional form, does the capacity loop go up or down, and why?",
      zh: "每种硬币可以用无限次。一维数组遍历容量该正序还是倒序,为什么?",
    },
    key: {
      en: (
        <>
          Chapter 7 solved this by asking which coin is the last one. Here the
          same problem is modelled as an <b>unbounded knapsack</b>: coins are
          items with unlimited supply, the amount is the capacity, and dp[j] is
          the smallest number of coins that add up to j. Transition: dp[j] =
          min(dp[j], dp[j-coin] + 1), base dp[0] = 0, and amounts that cannot be
          reached keep a value larger than any real answer. The capacity loop runs{" "}
          <b>upward</b>, so dp[j-coin] may already include this same coin, which
          is exactly how a coin gets reused. Two models, one answer; the code
          differs only in the order of the two loops.
        </>
      ),
      zh: (
        <>
          第 7 章用「枚举最后一枚硬币」解过它;这里换成<b>完全背包</b>建模:硬币 = 可无限取的物品,金额 = 容量,dp[j] = 凑出 j 的最少硬币数。转移 dp[j] = min(dp[j], dp[j−coin] + 1),初始 dp[0] = 0,凑不出的金额保持一个比任何真实答案都大的值。容量遍历<b>正序</b>,于是 dp[j−coin] 里可能已经含有同一枚硬币 ——
          这正是「同一种硬币被重复使用」的实现方式。两种建模,同一个答案;代码只差两层循环的嵌套顺序。
        </>
      ),
    },
  },
  {
    lc: 518,
    title: { en: "Coin Change II", zh: "零钱兑换 II" },
    d: "medium",
    tags: {
      en: ["Unbounded knapsack", "Counting", "Combinations"],
      zh: ["完全背包", "计数型", "求组合数"],
    },
    hint: {
      en: "You are counting ways, and order does not matter (1+2 and 2+1 are the same way). Which loop goes on the outside, coins or amount?",
      zh: "求「凑法有几种」,且不区分顺序(1+2 和 2+1 算一种)—— 外层循环该放硬币还是金额?",
    },
    key: {
      en: (
        <>
          Counting with unlimited supply: dp[j] += dp[j-coin], dp[0] = 1. The loop
          nesting decides what you count. With <b>coins in the outer loop</b> and
          capacity ascending inside, each coin is introduced once and always after
          the coins before it, so one set of coins is only ever counted in one
          order. That counts <b>combinations</b>. Swapping the two loops counts
          permutations instead (see LC 377). Worked example C runs the two
          versions against each other.
        </>
      ),
      zh: (
        <>
          物品无限供应的计数:dp[j] += dp[j−coin],dp[0] = 1。两层循环的嵌套顺序决定你数出的是什么。<b>外层遍历硬币</b>、内层容量正序时,每种硬币只在自己那一轮登场,且永远排在前面的硬币之后,于是同一组硬币只会以一种顺序被数到 —— 数出的是<b>组合数</b>。把两层调换,数出的就是排列数(见 LC 377)。本章精讲 C 把两种写法对照演示。
        </>
      ),
    },
  },
  {
    lc: 279,
    title: { en: "Perfect Squares", zh: "完全平方数" },
    d: "medium",
    tags: {
      en: ["Unbounded knapsack", "Minimum", "Same as 322"],
      zh: ["完全背包", "最值型", "322 同构"],
    },
    hint: {
      en: "Treat 1, 4, 9, 16 ... as denominations with unlimited supply and find the smallest number of them that adds up to n. That is LC 322.",
      zh: "把 1、4、9、16… 看成可无限使用的「面额」,求凑出 n 的最少个数 —— 就是 LC 322。",
    },
    key: {
      en: (
        <>
          The squares 1, 4, 9, ... are items with unlimited supply, n is the
          capacity, and you want the smallest count, so this is LC 322 with a
          different item list. dp[j] = min(dp[j], dp[j - i×i] + 1), squares in the
          outer loop, capacity ascending, dp[0] = 0. Time O(n√n). Number theory
          also settles it: by Lagrange&apos;s four-square theorem the answer is
          always 1, 2, 3, or 4, and by Legendre&apos;s three-square theorem it is
          4 exactly when n = 4<sup>a</sup>(8b + 7). Checking those cases costs
          about O(√n). Learn the knapsack version anyway, because it works for any
          item list.
        </>
      ),
      zh: (
        <>
          平方数 1、4、9… 是可无限使用的物品,n 是容量,求最少个数 ——
          与 LC 322 完全同构,只换了物品清单。dp[j] = min(dp[j], dp[j − i×i] + 1),外层枚举平方数、内层容量正序,dp[0] = 0,时间 O(n√n)。数论也能直接判:由拉格朗日四平方和定理,答案一定是 1、2、3 或 4;由勒让德三平方和定理,答案为 4 当且仅当 n = 4<sup>a</sup>(8b + 7),逐项检查约 O(√n)。但仍要掌握背包写法 —— 换任何物品清单它都成立。
        </>
      ),
    },
  },
  {
    lc: 139,
    title: { en: "Word Break", zh: "单词拆分" },
    d: "medium",
    tags: {
      en: ["Unbounded knapsack", "Order matters"],
      zh: ["完全背包", "顺序有关"],
    },
    hint: {
      en: 'A sentence has an order: "apple pen" is not "pen apple". That decides which of the two loops goes on the outside.',
      zh: "拼出的句子有先后顺序(apple pen ≠ pen apple)—— 这决定了两层循环谁在外。",
    },
    key: {
      en: (
        <>
          Dictionary words may be reused, and <b>order matters</b>, because you
          are building one sentence. State: dp[i] is true when the first i
          characters of s can be cut into dictionary words. Base dp[0] = true.
          With <b>capacity i in the outer loop and words in the inner loop</b>:
          dp[i] = dp[i] or (dp[i-len] and s[i-len..i] is in the dictionary).
          Capacity on the outside is the nesting that respects order, the same one
          LC 377 uses. Put the dictionary in a hash set so each membership test is
          O(1).
        </>
      ),
      zh: (
        <>
          词典里的词可以重复使用,而且<b>顺序重要</b> —— 拼出来的是一句话。状态:dp[i] = s 的前 i 个字符能否被切成词典里的词,初始 dp[0] = true。
          <b>外层遍历长度 i(容量)、内层枚举单词</b>:
          dp[i] = dp[i] 或 (dp[i−len] 且 s[i−len..i] 在词典里)。容量在外正是「关心顺序」的嵌套方式,和 LC 377 是同一套。词典放进哈希集合,单次查询才是 O(1)。
        </>
      ),
    },
  },
  {
    lc: 377,
    title: { en: "Combination Sum IV", zh: "组合总和 IV" },
    d: "medium",
    tags: {
      en: ["Unbounded knapsack", "Counting", "Permutations"],
      zh: ["完全背包", "计数型", "求排列数"],
    },
    hint: {
      en: "The title says combination, but (1,3) and (3,1) count as two answers. So which loop belongs on the outside?",
      zh: "标题写着「组合」,但 (1,3) 和 (3,1) 算两种答案 —— 那么外层该遍历什么?",
    },
    key: {
      en: (
        <>
          The name is misleading: this problem counts <b>permutations</b>, because
          two orders of the same numbers count separately. The transition is the
          same as LC 518, dp[j] += dp[j-num] with dp[0] = 1, but the{" "}
          <b>capacity is the outer loop and the numbers are the inner loop</b>. At
          each capacity every number gets a turn as the last one added, so the two
          orders are counted separately. It is the exact mirror of LC 518. Which
          loop sits outside decides whether you count combinations or
          permutations, and that is the most common mistake in this chapter.
          Some intermediate cells overflow even a 64-bit integer, but none of
          them is ever added into dp[target]: a cell that feeds it never holds
          more than the final answer, so the straightforward code is correct (in
          C++, use an unsigned type, because signed overflow is undefined
          behavior there).
        </>
      ),
      zh: (
        <>
          题名有误导:它数的是<b>排列数</b> —— 同一组数的不同顺序算不同方案。转移和 LC 518 一样是 dp[j] += dp[j−num]、dp[0] = 1,但<b>外层遍历容量、内层遍历数字</b>:对每个容量,每个数字都有机会当「最后一个」,于是两种顺序被分别计入。它正是 LC 518 的镜像。哪一层在外,决定你数的是组合还是排列 —— 这是本章最常见的错误。有些中间格子连 64 位整数都会溢出,但它们都不会被累加进 dp[target]:能累加进去的格子,计数都不超过最终答案,所以按这个转移直接累加就是正确的(C++ 中有符号溢出是未定义行为,那里要改用无符号类型)。
        </>
      ),
    },
  },
  {
    lc: 1155,
    title: {
      en: "Number of Dice Rolls With Target Sum",
      zh: "掷骰子等于目标和",
    },
    d: "medium",
    tags: {
      en: ["Grouped knapsack", "Counting", "One per group"],
      zh: ["分组背包", "计数型", "组内选一件"],
    },
    hint: {
      en: "There are n dice, each rolled exactly once, and each can show 1 to k. Every die must contribute exactly one face.",
      zh: "n 个骰子,每个恰好用一次,每个能出 1~k 点 —— 每个骰子必须贡献恰好一个面。",
    },
    key: {
      en: (
        <>
          Grouped counting knapsack: each die is a group, and exactly one face
          must be chosen from every group. State: dp[i][s] is the number of ways
          the first i dice add up to s. Transition: dp[i][s] = Σ dp[i-1][s-f] for
          f from 1 to k. Base dp[0][0] = 1. This is <b>not</b> an unbounded
          knapsack: the number of dice is fixed, and a die can neither be skipped
          nor reused. Time O(n × target × k). Take the result modulo 10⁹+7, and
          reduce inside the loop so the running sum never overflows.
        </>
      ),
      zh: (
        <>
          分组计数背包:每个骰子是一个组,每组必须<b>恰好</b>选一个面。状态:dp[i][s] = 前 i 个骰子点数和为 s 的方案数。转移:dp[i][s] = Σ dp[i−1][s−f](f 从 1 到 k),初始 dp[0][0] = 1。它<b>不是</b>完全背包:骰子数量固定,既不能跳过也不能重复使用。时间 O(n × target × k)。答案对 10⁹+7 取模,并在循环里就取模,避免累加溢出。
        </>
      ),
    },
  },
];
