// 第 8 章 · 背包问题 —— 题单与测验数据。
// 题单覆盖 lc.md 主线的背包题(0-1 / 完全 / 二维费用 / 计数 / 排列组合 / 分组),由易到难;
// hint 只给方向不剧透,key 用一段话把最优解讲透。322 是第 7 章主讲、本章复盘。
// 双语:所有文案都是 Loc<…>,英文为默认。题名用 LeetCode 官方中英标题。
// 术语约定:0-1 背包 = 0/1 knapsack;完全背包 = unbounded knapsack;
//          多重背包 = bounded knapsack;分组背包 = grouped knapsack。

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

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
          状态:dp[j] = 用已经处理过的那些数,能否正好凑出 j。
          转移:dp[j] = dp[j] 或 dp[j−num]。初始:dp[0] = true(空集凑出 0)。
          答案是 dp[sum/2];sum 为奇数时根本无法等分。
          每个数最多用一次,所以一维数组遍历容量要<b>倒序</b> ——
          这样 dp[j−num] 读到的还是「还没处理这个数」时的值。
          时间 O(n × sum/2),空间 O(sum/2)。本章精讲 A 有整张布尔表逐格点亮的动画。
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
      zh: ["0-1 背包", "装满型", "416 变式"],
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
          每次砸两块石头、保留差值,等价于给每块石头分配一个正号或负号,
          最终重量就是两堆之差。要让这个差最小,就得让其中一堆尽量接近 sum/2(但不超过)。
          于是:容量 sum/2,每块石头的重量既是费用也是价值,
          求能装下的最大重量 maxHalf,答案 = sum − 2 × maxHalf。
          骨架与 LC 416 一致,只把「能否正好装满」换成「最多能装多满」。
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
      zh: ["0-1 背包", "计数型", "回溯一题两吃"],
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
          每个数选 + 或 −,回溯是 O(2ⁿ)。上面那步代数把问题变成:
          有几个子集的和正好等于 P?若 P 不是整数、为负数,或大于 sum,则答案为 0。
          剩下的是一个<b>计数型 0-1 背包</b>:dp[j] += dp[j−num],容量倒序,
          dp[0] = 1(空集是凑出 0 的一种方案)。时间 O(n × P)。
          本章精讲 B 把决策树和计数表并排放在一起。
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
          二维费用 0-1 背包。每个字符串是一件物品,两种费用是它含的 0 数与 1 数,
          价值恒为 1(数的是件数)。状态:dp[i][j] = 最多用 i 个 0、j 个 1 时能选的字符串数。
          转移:
          <span className="mono">dp[i][j] = max(dp[i][j], dp[i−z][j−o] + 1)</span>
          。每个字符串仍然只用一次,所以<b>两层</b>容量都倒序。
          时间 O(len(strs) × m × n)。骨架没变,只是「重量」变成了一对数。
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
          is exactly how a coin gets reused. Two models, one piece of code.
        </>
      ),
      zh: (
        <>
          第 7 章用「枚举最后一枚硬币」解过它;这里换成<b>完全背包</b>建模:
          硬币 = 可无限取的物品,金额 = 容量,dp[j] = 凑出 j 的最少硬币数。
          转移 dp[j] = min(dp[j], dp[j−coin] + 1),初始 dp[0] = 0,
          凑不出的金额保持一个比任何真实答案都大的值。
          容量遍历<b>正序</b>,于是 dp[j−coin] 里可能已经含有同一枚硬币 ——
          这正是「同一种硬币被重复使用」的实现方式。两种建模,同一份代码。
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
          物品无限供应的计数:dp[j] += dp[j−coin],dp[0] = 1。
          两层循环的嵌套顺序决定你数出的是什么。<b>外层遍历硬币</b>、内层容量正序时,
          每种硬币只在自己那一轮登场,且永远排在前面的硬币之后,
          于是同一组硬币只会以一种顺序被数到 —— 数出的是<b>组合数</b>。
          把两层调换,数出的就是排列数(见 LC 377)。本章精讲 C 把两种写法对照演示。
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
          与 LC 322 完全同构,只换了物品清单。dp[j] = min(dp[j], dp[j − i×i] + 1),
          外层枚举平方数、内层容量正序,dp[0] = 0,时间 O(n√n)。
          数论也能直接判:由拉格朗日四平方和定理,答案一定是 1、2、3 或 4;
          由勒让德三平方和定理,答案为 4 当且仅当 n = 4<sup>a</sup>(8b + 7),
          逐项检查约 O(√n)。但仍要掌握背包写法 —— 换任何物品清单它都成立。
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
      zh: ["完全背包", "排列型", "顺序有关"],
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
          词典里的词可以重复使用,而且<b>顺序重要</b> —— 拼出来的是一句话。
          状态:dp[i] = s 的前 i 个字符能否被切成词典里的词,初始 dp[0] = true。
          <b>外层遍历长度 i(容量)、内层枚举单词</b>:
          dp[i] = dp[i] 或 (dp[i−len] 且 s[i−len..i] 在词典里)。
          容量在外正是「关心顺序」的嵌套方式,和 LC 377 是同一套。
          词典放进哈希集合,单次查询才是 O(1)。
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
          Intermediate sums can exceed a 32-bit int, so accumulate in a wider
          type.
        </>
      ),
      zh: (
        <>
          题名有误导:它数的是<b>排列数</b> —— 同一组数的不同顺序算不同方案。
          转移和 LC 518 一样是 dp[j] += dp[j−num]、dp[0] = 1,
          但<b>外层遍历容量、内层遍历数字</b>:对每个容量,每个数字都有机会当「最后一个」,
          于是两种顺序被分别计入。它正是 LC 518 的镜像。
          哪一层在外,决定你数的是组合还是排列 —— 这是本章最常见的错误。
          中间结果可能超出 32 位整数,累加时用更宽的类型。
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
          分组计数背包:每个骰子是一个组,每组必须<b>恰好</b>选一个面。
          状态:dp[i][s] = 前 i 个骰子点数和为 s 的方案数。
          转移:dp[i][s] = Σ dp[i−1][s−f](f 从 1 到 k),初始 dp[0][0] = 1。
          它<b>不是</b>完全背包:骰子数量固定,既不能跳过也不能重复使用。
          时间 O(n × target × k)。答案对 10⁹+7 取模,并在循环里就取模,避免累加溢出。
        </>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "In the one-dimensional form of the 0/1 knapsack, why must the capacity loop run downward?",
      zh: "0-1 背包压成一维数组后,遍历容量为什么必须【倒序】?",
    },
    opts: {
      en: [
        "Going down, dp[j-w] still holds the value from before this item was processed, so the item can enter the bag at most once",
        "Going down is only faster; going up also gives the correct answer",
        "Going down computes the large capacities first, which keeps the index in range",
        "Because the array has to be initialized from right to left",
      ],
      zh: [
        "倒序时 dp[j−w] 读到的还是「处理本物品之前」的值,所以这件物品最多只会进包一次",
        "倒序只是更快;正序也能得到正确答案",
        "倒序先算大容量,数组下标不会越界",
        "因为数组必须从右往左初始化",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Going up gives a wrong answer, and speed is not the point. Going up, dp[j-w] may already have been updated in this pass, so it already contains one copy of this item. Adding the item again puts the same item in the bag twice.",
        "The index stays in range in both directions, because both loops only visit j in [w, W]. The reason for going down is which value dp[j-w] holds when it is read.",
        "Initialization has nothing to do with the direction. The direction decides whether dp[j-w] is read before or after this pass updates it.",
      ],
      zh: [
        undefined,
        "正序会算错,这不是效率问题:正序时 dp[j−w] 可能已经在本轮被更新过,里面已含一件本物品,再加一次就等于同一件物品放了两次。",
        "两个方向都只访问 [w, W] 内的 j,都不会越界。倒序的理由是「读到 dp[j−w] 时它是哪个值」。",
        "初始化和遍历方向无关。方向决定的是 dp[j−w] 在本轮更新之前还是之后被读到。",
      ],
    },
    why: {
      en: "The one-dimensional array is the two-dimensional dp[i][*] rolled into one row. The 0/1 transition reads dp[i-1][j-w], the previous item's row. Going down, dp[j-w] has not been touched yet in this pass, so it is still that previous row. The comparison animation in §03 shows how going up counts the same item twice.",
      zh: "一维数组是二维 dp[i][*] 滚动成一行的结果。0-1 背包的转移读 dp[i−1][j−w],也就是上一件物品那一行。倒序时 dp[j−w] 在本轮还没被碰过,所以它仍是上一行的值。§03 的对比动画演示了正序如何把同一件物品算两次。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Run the one-dimensional 0/1 loop upward instead, with a single item of weight 2 and value 3, capacities 0 to 5. What does dp[4] become, and what does that show?",
      zh: "把 0-1 背包的一维遍历改成【正序】,只放一件重 2、值 3 的物品,容量 0~5。dp[4] 会算成多少,说明什么?",
    },
    opts: {
      en: [
        "6 — dp[4] reads dp[2] = 3, which this pass just wrote, so the same item is added a second time",
        "3 — going up and going down give the same result",
        "0 — going up misses the item",
        "9 — going up counts the item three times",
      ],
      zh: [
        "6 —— dp[4] 读到本轮刚写入的 dp[2] = 3,于是同一件物品被又加了一次",
        "3 —— 正序和倒序结果一样",
        "0 —— 正序会漏掉这件物品",
        "9 —— 正序会把物品算三次",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "They differ here. Going up, dp[2] has already been changed to 3 by this pass, so dp[4] = max(0, 3 + 3) = 6, while the correct answer is 3.",
        "Going up does not lose the item; it counts it more than once. dp[4] becomes 6, not 0.",
        "One item and one pass can only be double-counted once here. dp[4] = 6 already shows the bug.",
      ],
      zh: [
        undefined,
        "这里两者不同:正序时 dp[2] 已被本轮改成 3,于是 dp[4] = max(0, 3+3) = 6,而正确答案是 3。",
        "正序不会漏掉物品,而是重复计入:dp[4] 变成 6,不是 0。",
        "只有一件物品、只扫一遍,这里最多重复一次;dp[4] = 6 已经暴露了问题。",
      ],
    },
    why: {
      en: "dp[2] is set to 3 in this pass, meaning one copy of the item is inside. Going up, dp[4] then reads that 3 and adds 3 again, giving 6 — the one item was placed in the bag twice. That is why the 0/1 form cannot go up, and it is also why going up is exactly what the unbounded knapsack wants.",
      zh: "dp[2] 在本轮被写成 3(里面已装了一件)。正序算到 dp[4] 时读到这个 3,再 +3 得 6 —— 这唯一的一件物品被装进背包两次。这就是 0-1 背包不能正序的原因,也正好是完全背包想要的效果。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In the one-dimensional unbounded knapsack (every item has unlimited supply), the capacity loop runs upward. Why?",
      zh: "完全背包(每件物品无限个)压成一维后,遍历容量要【正序】。原因是?",
    },
    opts: {
      en: [
        "Going up, dp[j-w] may already contain this item, so adding it again reuses the same item — which is what unlimited supply means",
        "The unbounded knapsack should go down, just like the 0/1 knapsack",
        "Going up is faster and does not change the result",
        "Going up prevents an item from being used more than once",
      ],
      zh: [
        "正序时 dp[j−w] 里可能已含本物品,再加一次就是重复使用同一件 —— 这正是「无限供应」的含义",
        "完全背包和 0-1 背包一样,都该倒序",
        "正序更快,和结果无关",
        "正序可以避免同一件物品被用多次",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The directions are opposite: 0/1 needs each item at most once, so it goes down; unbounded allows reuse, so it goes up. The wrong direction turns one problem into the other.",
        "In the unbounded knapsack, going up is about correctness, not speed: it is what allows reuse.",
        "It is the other way round. Going up is what allows reuse; going down is what limits an item to one use.",
      ],
      zh: [
        undefined,
        "方向恰好相反:0-1 要「每件最多一次」所以倒序,完全背包允许重复所以正序。方向写错,就把一道题做成了另一道。",
        "在完全背包里,正序是为了正确性(允许重复取),不是为了速度。",
        "说反了:正序才是「允许重复使用」,倒序才是「每件只用一次」。",
      ],
    },
    why: {
      en: "Both forms share the same line dp[j] = f(dp[j], dp[j-w]). The direction decides which row dp[j-w] comes from: going down it is the previous item's row, so the item is used at most once; going up it is the current item's own row, so the item can be reused. The direction is not a rule to memorize. It follows from which value you need to read.",
      zh: "两种形态共用同一行 dp[j] = f(dp[j], dp[j−w])。方向决定 dp[j−w] 来自哪一行:倒序来自上一件物品那一行,于是每件最多用一次;正序来自本件物品自己这一行,于是可以重复取。方向不是要背的口诀,它由「你需要读到哪个值」推出来。",
    },
  },
  {
    type: "choice",
    q: {
      en: 'For "how many ways add up to n", LC 518 counts combinations (1+2 and 2+1 are one way) and LC 377 counts permutations (they are two). The code is almost identical. Where is the difference?',
      zh: "求「凑出金额 n 的方案数」时,LC 518 数组合(1+2 与 2+1 算一种)、LC 377 数排列(算两种),代码几乎一样。差别在哪?",
    },
    opts: {
      en: [
        "518 loops over items outside and capacity inside; 377 loops over capacity outside and items inside",
        "518 adds, 377 multiplies",
        "518 goes up, 377 goes down",
        "There is no real difference; the two answers are always equal",
      ],
      zh: [
        "518 外层遍历物品、内层遍历容量;377 外层遍历容量、内层遍历物品",
        "518 用加法,377 用乘法",
        "518 正序,377 倒序",
        "两者没有本质区别,答案总是相等",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Both use the same addition, dp[j] += dp[j-num]. Only the nesting of the two loops differs.",
        "Both are unbounded knapsacks and both run the capacity upward. Going down would limit each item to one use, which is a different problem.",
        "The difference is real: the number of combinations is at most the number of permutations, and usually smaller. Coins [1,2] and amount 3: one combination (1+2), two permutations (1+2, 2+1).",
      ],
      zh: [
        undefined,
        "两者都是同一个加法 dp[j] += dp[j−num]。区别只在两层循环的嵌套顺序。",
        "两者都是完全背包,容量都正序。倒序会把每件物品限制成只用一次,那是另一道题。",
        "区别是实打实的:组合数不会超过排列数,通常还更小。硬币 [1,2] 凑 3:组合 1 种(1+2),排列 2 种(1+2、2+1)。",
      ],
    },
    why: {
      en: "Items outside: each item is introduced once and always after the earlier items, so one set of items is only counted in one order — combinations (518). Capacity outside: at each capacity every item gets a turn as the last one added, so different orders are counted separately — permutations (377). LC 139 Word Break also cares about order, so it puts capacity outside too. Worked example C compares the two.",
      zh: "物品在外:每件物品只在自己那一轮登场,且永远排在前面的物品之后,同一组物品只会以一种顺序被数到 —— 组合数(518)。容量在外:每个容量都让所有物品轮流当「最后一个」,不同顺序被分别计入 —— 排列数(377)。LC 139 单词拆分同样关心顺序,所以也把容量放在外层。本章精讲 C 对照演示。",
    },
  },
  {
    type: "choice",
    q: {
      en: "LC 416 asks whether an array can be split into two subsets with equal sums. What is the correct reduction to a knapsack?",
      zh: "LC 416 分割等和子集,把数组分成两个和相等的子集。转化成背包的正确做法是?",
    },
    opts: {
      en: [
        "Check the total first: if sum is odd, return false; otherwise ask whether some of the numbers add up to exactly sum/2",
        "Check whether the maximum subarray sum equals sum/2",
        "Sort the array, then move two pointers inward until they reach sum/2",
        "Find the smallest number of elements to delete so that the rest sums to an even number",
      ],
      zh: [
        "先看总和:sum 为奇数直接返回 false;否则问「能否用若干个数正好凑出 sum/2」",
        "求数组的最大子数组和是否等于 sum/2",
        "先排序,再用双指针从两端向 sum/2 逼近",
        "求最少删几个数,能让剩下的和为偶数",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The maximum subarray sum (Kadane) needs the elements to be next to each other. A subset can pick any elements, so that is the wrong model.",
        "Two pointers work on a sorted array for two-sum style questions. Here every element is chosen or not chosen, which is a 0/1 knapsack.",
        "The question is whether an equal split exists, not how many elements to delete.",
      ],
      zh: [
        undefined,
        "最大子数组和(Kadane)要求元素连续,而子集可以任意挑 —— 模型不对。",
        "双指针适用于有序数组上的「两数之和」类问题。这里每个元素都是选或不选,是 0-1 背包。",
        "题目问的是能否等分,不是删几个数。",
      ],
    },
    why: {
      en: "If the two subsets have equal sums, each one sums to sum/2, so an odd total makes a split impossible. Otherwise it is a 0/1 knapsack with capacity sum/2 and the question \"can it be filled exactly\": dp[j] = dp[j] or dp[j-num], with capacity descending. This is a reduction to a problem you already solved, not a new algorithm.",
      zh: "两个子集和相等 ⇒ 每个子集的和都是 sum/2,所以总和为奇数时不可能等分。否则就是容量 sum/2 的「能否正好装满」型 0-1 背包:dp[j] = dp[j] 或 dp[j−num],容量倒序。这是把问题归约到已经解决的模型,不是一个新算法。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          LC 494 Target Sum, nums = [1,1,1,1,1] and target = 3. Using P = (sum +
          target) / 2, the problem becomes &quot;how many subsets add up to
          P?&quot; How many are there?
        </>
      ),
      zh: (
        <>
          LC 494 目标和,nums = [1,1,1,1,1]、target = 3。用 P = (sum + target) / 2
          转成「和为 P 的子集有几个」,答案是多少?
        </>
      ),
    },
    placeholder: { en: "Enter a whole number…", zh: "输入一个整数…" },
    answers: ["5", "5种", "5ways"],
    hint: {
      en: "sum = 5, so P = (5 + 3) / 2 = 4. Picking a subset of five 1s that adds up to 4 means picking four of them: C(5,4).",
      zh: "sum = 5,所以 P = (5 + 3) / 2 = 4。从 5 个 1 里挑出和为 4 的子集,就是挑 4 个 1,即 C(5,4)。",
    },
    why: {
      en: "P = 4, so you pick four of the five 1s: C(5,4) = 5. Filling dp[j] += dp[j-num] one number at a time produces exactly one row of Pascal's triangle. Worked example B animates it.",
      zh: "P = 4,即从 5 个 1 里挑 4 个:C(5,4) = 5。逐个数字执行 dp[j] += dp[j−num],得到的正是杨辉三角的一行。本章精讲 B 有逐帧动画。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which of these are signals to model a problem as an unbounded knapsack (every item has unlimited supply)? (Select all that apply)",
      zh: "下面哪些是「该往【完全背包】(每件物品无限个)方向想」的信号?(多选)",
    },
    opts: {
      en: [
        "The statement says a coin or a denomination may be used any number of times",
        "You are making up a target amount and the same denomination may be taken again (LC 322 / LC 518)",
        'The number of items is fixed and each is taken at most once (for example "each number may be used only once")',
        "Treating 1, 4, 9, 16 ... as denominations with unlimited supply to reach a number (LC 279)",
      ],
      zh: [
        "题面写着某种硬币 / 面额可以使用无限次",
        "凑一个目标金额,且同一面额可以反复取(LC 322 / LC 518)",
        "物品总数固定、每件最多取一次(例如「每个数只能用一次」)",
        "把 1、4、9、16… 当作可无限取的面额去凑出一个数(LC 279)",
      ],
    },
    correct: [0, 1, 3],
    missHint: {
      en: "Unlimited reuse is the signal. Look again for the options that stress taking the same item again.",
      zh: "「可以无限次重复取」才是信号 —— 再找找哪些选项在强调「可以再取同一件」。",
    },
    extraHint: {
      en: "One option describes a 0/1 knapsack, where each item is used at most once. Leave it out.",
      zh: "有一个选项描述的是 0-1 背包(每件最多用一次),不要选它。",
    },
    why: {
      en: 'The test for an unbounded knapsack is one sentence: the same item may be taken any number of times, so the capacity loop runs upward. LC 322, 518, and 279 all pass it. "Each number may be used only once" and "the item count is fixed" describe a 0/1 knapsack, where the capacity loop runs downward.',
      zh: "完全背包的判据只有一句:同一件物品可以取任意多次,所以容量正序。LC 322、518、279 都符合。「每个数只能用一次」「物品总数固定」说的是 0-1 背包,容量倒序。",
    },
  },
  {
    type: "choice",
    q: {
      en: "For the two-dimensional 0/1 knapsack, where dp[i][j] is the largest value using the first i items with capacity at most j, which transition is correct?",
      zh: "0-1 背包的二维 dp[i][j](只用前 i 件物品、容量不超过 j 时的最大价值),下面哪个转移是对的?",
    },
    opts: {
      en: [
        "dp[i][j] = max(dp[i-1][j], dp[i-1][j-w[i]] + v[i]) — skip item i, or take it; when j < w[i], only skipping is possible",
        "dp[i][j] = max(dp[i-1][j], dp[i][j-w[i]] + v[i])",
        "dp[i][j] = dp[i-1][j] + dp[i-1][j-w[i]]",
        "dp[i][j] = max(dp[i-1][j], dp[i-1][j] + v[i])",
      ],
      zh: [
        "dp[i][j] = max(dp[i−1][j], dp[i−1][j−w[i]] + v[i]) —— 不装 i 或装 i;j < w[i] 时只能不装",
        "dp[i][j] = max(dp[i−1][j], dp[i][j−w[i]] + v[i])",
        "dp[i][j] = dp[i−1][j] + dp[i−1][j−w[i]]",
        "dp[i][j] = max(dp[i−1][j], dp[i−1][j] + v[i])",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "\"Take item i\" must read dp[i-1][j-w[i]], the row where item i has not been considered yet. Reading dp[i][j-w[i]] allows item i to be taken again, which is the unbounded knapsack.",
        "Addition is the operator for counting. Here you want the largest value, so take the max of taking and skipping.",
        "Taking item i must first free w[i] of capacity, so it reads dp[i-1][j-w[i]]. Writing dp[i-1][j] + v[i] adds the value without paying the weight.",
      ],
      zh: [
        undefined,
        "「装 i」这一项必须读 dp[i−1][j−w[i]],也就是还没考虑过第 i 件的那一行。读 dp[i][j−w[i]] 会允许第 i 件被再取一次,那是完全背包。",
        "相加是计数型的算子。这里求最大价值,应该在「装」和「不装」之间取 max。",
        "装第 i 件必须先腾出 w[i] 的容量,所以读 dp[i−1][j−w[i]]。写成 dp[i−1][j] + v[i] 等于加了价值却没占容量。",
      ],
    },
    why: {
      en: "The whole 0/1 knapsack is one question per item: take it or skip it. Skip it and you inherit dp[i-1][j]. Take it and you free w[i] first, then add v[i], which is dp[i-1][j-w[i]] + v[i]. This is the same take-or-skip model as House Robber in chapter 7, and reading the previous row is exactly why the rolled one-dimensional form has to run the capacity downward.",
      zh: "0-1 背包的全部内容就是对每件物品问一句:装还是不装。不装 = 继承 dp[i−1][j];装 = 先腾出 w[i] 再加 v[i],即 dp[i−1][j−w[i]] + v[i]。这与第 7 章打家劫舍的「选 / 不选」是同一个模型;而「读上一行」正是压成一维后必须倒序遍历容量的原因。",
    },
  },
];
