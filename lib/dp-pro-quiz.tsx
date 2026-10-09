// Chapter 10 - Advanced DP (dp-pro): quiz data.
// Kept apart from the problem set so that the atlas, which lists every chapter's problems,
// does not load the quizzes too.

import type { QuizItem } from "@/lib/quiz";

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "LC 309 (with cooldown) needs one more state than LC 122. What does that extra state represent?",
      zh: "LC 309(含冷冻期)比 LC 122 多出一个状态。这个多出来的状态代表什么?",
    },
    opts: {
      en: [
        "\"Sold today, so the cooldown is in effect\" — it forces one blocked day between a sale and the next allowed buy",
        "\"Holding two shares at the same time\"",
        "\"How many trades have already been used\"",
        "\"The running profit is negative\"",
      ],
      zh: [
        "「今天刚卖出,正处于冷冻期」—— 它在卖出和下一次可买之间强行隔开一天",
        "「同时持有两支股票」的状态",
        "「已经用掉几次交易」的计数状态",
        "「当前利润为负」的状态",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "In a single-stock problem you hold at most one share at any time, so \"two shares\" never occurs. The cooldown rule has nothing to do with how many shares you hold.",
        "The number of trades is the extra dimension in LC 123 and LC 188 (at most k trades). LC 309 has no limit on the number of trades; the extra state is the cooldown, not a counter.",
        "A DP state records the situation you are in (holding? in cash? in cooldown?), not the sign of the profit. The profit is the value stored inside each state.",
      ],
      zh: [
        undefined,
        "单支股票的问题里任何时刻最多持有 1 股,不存在「持有两支」;冷冻期规则和持股数量无关。",
        "「交易次数」是 LC 123 / 188 的额外维度(最多 k 次)。LC 309 不限交易次数,多出来的是冷冻状态,不是计数器。",
        "DP 状态记的是「你处在什么局面」(持有?空仓?冷冻?),不是利润的正负 —— 利润是每个状态里存的那个值。",
      ],
    },
    why: {
      en: "The cooldown means you may only buy from the second day after a sale. Two states cannot express \"I sold yesterday, so today I still may not buy\", so the empty-handed case splits into sold (just sold) and rest (free to buy): hold = max(hold, rest − p), sold = hold + p, rest = max(rest, sold). More conditions in the problem means more states. That is the usual pattern in state machine DP.",
      zh: "冷冻期的意思是卖出后要隔一天才能买。两个状态无法表达「昨天刚卖,今天还不能买」,所以把空仓拆成 sold(刚卖)和 rest(可买):hold = max(hold, rest − p)、sold = hold + p、rest = max(rest, sold)。题目的约束一多,状态就多 —— 这是状态机 DP 的常见模式。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In LC 337 (House Robber III), why does each node return the pair [rob, skip] instead of just \"the largest amount obtainable in this subtree\"?",
      zh: "LC 337 打家劫舍 III,每个节点为什么要返回 [rob, skip] 一对值,而不是直接返回「这棵子树能偷到的最大金额」?",
    },
    opts: {
      en: [
        "Whether the parent may take itself depends on whether the child was taken — a single max throws away \"the best total when the child is skipped\"",
        "Because a binary tree has two children, so two values are returned",
        "To use less stack space during the recursion",
        "Because a single value would overflow",
      ],
      zh: [
        "父节点能不能偷自己,取决于孩子偷没偷 —— 只返回一个 max 会丢掉「孩子不偷时的最优值」",
        "因为二叉树有两个孩子,所以要返回两个值",
        "为了让递归少用一些栈空间",
        "因为一个值会整数溢出",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The two values correspond to the two decisions \"take this node\" and \"skip this node\". Having two children is a coincidence: on a tree with any number of children you still return exactly these two values.",
        "Returning two values uses slightly more space, not less. The stack depth of a tree DP is set by the height of the tree, not by how many values you return.",
        "Overflow is not the issue. The issue is completeness: when the parent takes itself it needs the child's skip value, and a single max does not contain it.",
      ],
      zh: [
        undefined,
        "两个返回值对应的是「偷当前节点」和「不偷当前节点」两个决策。有两个孩子只是巧合 —— 换成多叉树,返回的仍然是这两个值。",
        "返回两个值反而多用一点空间。树形 DP 的栈深由树高决定,和返回几个值无关。",
        "和溢出无关。问题在于信息是否完整:父节点偷自己时需要孩子的 skip 值,而一个 max 里没有它。",
      ],
    },
    why: {
      en: "If the parent takes itself, both children must be skipped, so it needs each child's skip value. If the parent skips itself, each child may choose freely, so it needs max(rob, skip). Both numbers are needed, so every node reports both. This is LC 198 \"take it or skip it\" from Chapter 07, moved onto a tree.",
      zh: "父节点若偷自己,两个孩子都不能偷,所以需要孩子的 skip 值;父节点若不偷自己,孩子各自随意,所以需要 max(rob, skip)。两个数都要用到,所以每个节点都得把两个都汇报上来。这就是第 7 章 198「选/不选」搬上了树。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Why does interval DP (LC 312, LC 516) fill the table in order of increasing interval length?",
      zh: "区间 DP(如 LC 312 / 516)为什么要按区间长度从小到大填表?",
    },
    opts: {
      en: [
        "The transition for a long interval reads the answers of strictly shorter intervals, so those must already be computed",
        "Because filling in that order uses less memory",
        "Because interval DP can only be written recursively",
        "Because a longer interval always has a larger answer, so the order sorts them",
      ],
      zh: [
        "长区间的转移要读严格更短区间的答案,所以那些必须先算好",
        "因为按这个顺序填更省内存",
        "因为区间 DP 只能用递归实现",
        "因为区间越长答案一定越大,从小到大填正好排好序",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The fill order does not change how much memory the table uses. The only constraint on the order is that every cell a transition reads is already computed.",
        "Interval DP can be written as a bottom-up loop or as memoised recursion. Filling by increasing length is exactly the bottom-up order, so recursion is not required.",
        "A longer interval does not always have a larger answer, since interval DP often takes a max or a min with no monotonic guarantee. The order is about dependencies, not about sorting.",
      ],
      zh: [
        undefined,
        "填表顺序不改变表占用的内存。顺序的唯一约束是:转移读到的每一格都必须已经算好。",
        "区间 DP 递推和记忆化搜索都能写。按长度从小到大填正是递推(自底向上)的顺序,并不是只能递归。",
        "长区间的答案不一定更大 —— 区间 DP 常取 max 或 min,数值没有单调保证。顺序的关键是依赖关系,不是排序。",
      ],
    },
    why: {
      en: "dp[i][j] is defined in terms of strictly shorter intervals, such as dp[i][k], dp[k][j], or dp[i+1][j−1]. Until every shorter interval is filled, the transition has nothing to read. The dependency is what forces the order; \"fill along the diagonals\" is just what that order looks like in the table.",
      zh: "dp[i][j] 的定义里用到的都是严格更短的区间,比如 dp[i][k]、dp[k][j] 或 dp[i+1][j−1]。更短的区间没填完,转移就无处可读。是依赖关系逼出了这个顺序;「沿对角线填」只是这个顺序在表格里的样子。",
    },
  },
  {
    type: "choice",
    q: {
      en: "LC 312 is modelled by enumerating the balloon k that is burst last. Why last and not first?",
      zh: "LC 312 戳气球的建模是「枚举最后一个被戳破的气球 k」。为什么是「最后」而不是「第一个」?",
    },
    opts: {
      en: [
        "Once k is fixed as the last one, the two sides never affect each other and each becomes its own subproblem. Fixing the first one makes the two sides merge, so the subproblems depend on each other",
        "Because the last balloon always has the highest value",
        "Because scanning the array from the end is faster",
        "Because the first balloon is always one of the padded virtual balloons",
      ],
      zh: [
        "一旦固定「k 最后戳」,左右两段互不影响,各自成为独立子问题;若固定「第一个戳」,两边会合并,子问题互相纠缠",
        "因为最后一个气球的分数一定最高",
        "因为从后往前遍历数组更快",
        "因为第一个气球一定是补上的虚拟气球",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Value has nothing to do with it. Which balloon is burst last is decided by the DP, not by picking the largest value.",
        "This is not about scan direction. It is about how the problem is cut into subproblems. Enumerating the first burst is exactly what destroys the independence of the subproblems.",
        "The padded balloons are the two 1s at the ends and are never burst. The k in \"k is burst last\" is always a real balloon.",
      ],
      zh: [
        undefined,
        "和分数高低无关。哪个气球最后戳是 DP 求出来的,不是挑分数最高的那个。",
        "这不是遍历方向的问题,而是「怎么把问题切成子问题」的问题。枚举「第一个戳」恰恰会破坏子问题的独立性。",
        "补上的虚拟气球是两端的两个 1,永远不会被戳。「k 最后戳」里的 k 一定是真实气球。",
      ],
    },
    why: {
      en: "Bursting a balloon makes its two neighbors become adjacent, so enumerating \"which one first\" keeps merging the remaining sequence and no independent subproblem is left. Fix k as the last one instead: when k is burst both sides are already empty, so its neighbors are exactly the endpoints i and j, and the two ranges (i, k) and (k, j) are solved separately. That is why the recurrence is dp[i][j] = max over k of dp[i][k] + arr[i]×arr[k]×arr[j] + dp[k][j].",
      zh: "戳破一个气球会让它左右的邻居贴到一起,所以枚举「先戳谁」会让剩下的序列不断合并,拆不出独立的子问题。反过来固定「k 最后戳」:戳 k 时左右已经空了,它的邻居恰好是端点 i 和 j,于是 (i, k) 与 (k, j) 两段各自独立求解。这就是转移写成 dp[i][j] = 对 k 取 max ( dp[i][k] + arr[i]×arr[k]×arr[j] + dp[k][j] ) 的原因。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which features of a problem suggest bitmask DP (state compression)? (Select all that apply)",
      zh: "题目具备哪些特征时,应该想到状压(状态压缩)DP?(多选)",
    },
    opts: {
      en: [
        "The constraints contain a surprisingly small n, roughly n ≤ 20",
        "The state has to record a set: which elements are already used or visited",
        "The natural state is a subset, and there are 2ⁿ subsets in total",
        "The array is already sorted",
      ],
      zh: [
        "数据范围里有个小得反常的 n(大约 n ≤ 20)",
        "状态必须记录一个集合:哪些元素已用 / 已访问",
        "自然的状态就是「某个子集」,子集总共有 2ⁿ 个",
        "数组已经排好了序",
      ],
    },
    correct: [0, 1, 2],
    missHint: {
      en: "There are three signals: a very small n, a state that is a set, and 2ⁿ subsets in total. You missed one of them.",
      zh: "三个信号:n 极小、状态是一个集合、子集共 2ⁿ 个 —— 你漏了其中之一。",
    },
    extraHint: {
      en: "A sorted array is a signal for binary search, two pointers, or a greedy rule. It says nothing about bitmask DP, which is triggered by the state itself being a set.",
      zh: "「数组有序」是二分、双指针或贪心的信号,和状压无关。状压的触发点是状态本身就是一个集合。",
    },
    why: {
      en: "Bitmask DP stores a set in the binary digits of one integer. It works only when the set is small, because the table has 2ⁿ entries, so n ≤ 20 is the practical limit. The cost is (number of subsets) × (work per transition). When a very small n and a set-shaped state appear together (LC 526, the traveling salesman problem), think bitmask. The groundwork is \"bits as a set\" from Chapter 04.",
      zh: "状压 DP 把一个集合存进一个整数的二进制位。它成立的前提是集合小 —— 表有 2ⁿ 项,所以 n ≤ 20 是实际上限。代价 =(子集个数)×(每个转移的工作量)。当「极小的 n」和「状态是集合」同时出现(LC 526、旅行商问题)就该想状压。地基是第 4 章的「用 bit 表示集合」。",
    },
  },
  {
    type: "choice",
    q: {
      en: "For LC 122 (unlimited trades), which statement about the greedy solution and the state machine DP is correct?",
      zh: "关于 LC 122(可无限次买卖)的贪心解与状态机 DP 解,哪个说法正确?",
    },
    opts: {
      en: [
        "Both are correct and give the same result: the greedy takes every rise between neighboring days, Σ max(0, p[i] − p[i−1]), and the DP moves between the hold and cash states",
        "The greedy is wrong; only the DP gives the correct answer",
        "The DP is wrong; only the greedy is correct",
        "They give different answers, so you pick one based on the input size",
      ],
      zh: [
        "两者都对且结果相同:贪心收下每一段相邻上涨(Σ max(0, p[i]−p[i−1])),DP 在 hold 和 cash 两个状态间转移",
        "贪心是错的,只有 DP 能得到正确答案",
        "DP 是错的,只有贪心对",
        "两者答案不同,要看数据规模选哪一个",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The greedy for LC 122 can be proved correct: the profit of any rising run equals the sum of its daily differences. This is the line that separates it from LC 322 (coin change), where a greedy rule really does fail.",
        "The DP with two states is equally correct, and it extends naturally to a transaction fee (LC 714) and to a cooldown (LC 309).",
        "The two solutions agree on every input. They are two views of the same optimum, so there is nothing to choose between them by input size.",
      ],
      zh: [
        undefined,
        "LC 122 的贪心是可以证明的:任意一段上涨的总利润等于逐日差之和。这正是它和 LC 322(零钱兑换,贪心确实会失效)的分界线。",
        "两状态的 DP 同样正确,而且能自然推广到含手续费(LC 714)和含冷冻期(LC 309)。",
        "两解在任何输入上答案都相同 —— 它们是同一个最优解的两种视角,不存在「按规模二选一」。",
      ],
    },
    why: {
      en: "With unlimited trades, \"take every rise\" is provably safe and equals the hold/cash DP. Add a condition, though, and the greedy has to be re-proved: with a fee (LC 714) or a cooldown (LC 309) the simple rule breaks, while the state machine keeps working. That is why the stock problems are taught as one family.",
      zh: "交易次数不限时,「收下每段上涨」可以证明是安全的,和 hold/cash 两状态 DP 等价。但只要加一个约束,贪心就必须重新证明:加手续费(LC 714)或加冷冻期(LC 309)后,这条简单规则就不成立了,而状态机照旧能用。这就是把这些股票题当成一个家族来讲的原因。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          Tree DP exercise. The binary tree is [3, 4, 5, 1, 3, null, 1]: the root
          is 3, its children are 4 and 5, the children of 4 are 1 and 3, and 5 has
          a right child 1. Following the rules of House Robber III, what is the
          largest amount you can take?
        </>
      ),
      zh: (
        <>
          树形 DP 练习。二叉树 [3, 4, 5, 1, 3, null, 1]:根是 3,它的孩子是 4 和 5,
          4 的孩子是 1 和 3,5 有一个右孩子 1。按打家劫舍 III 的规则,能偷到的最大金额是多少?
        </>
      ),
    },
    placeholder: { en: "Enter an integer…", zh: "输入一个整数…" },
    answers: ["9"],
    hint: {
      en: "A leaf reports [its own value, 0]. Node 4 reports [4, 1+3 = 4] and node 5 reports [5, 1]. Skipping the root gives max(4, 4) + max(5, 1).",
      zh: "叶子汇报 [自己的值, 0];4 号点汇报 [4, 1+3 = 4],5 号点汇报 [5, 1]。不偷根 = max(4, 4) + max(5, 1)。",
    },
    why: {
      en: "Skip the root: max(4, 4) = 4 from node 4, plus max(5, 1) = 5 from node 5, so 9. Take the root: 3 + node 4's skip value (4) + node 5's skip value (1) = 8. max(8, 9) = 9. Here skipping the root is better, which is exactly why each node must report both values. Section 03 steps through this same tree.",
      zh: "不偷根:4 号的 max(4, 4) = 4 加上 5 号的 max(5, 1) = 5,共 9。偷根:3 + 4 号的 skip(4)+ 5 号的 skip(1)= 8。max(8, 9) = 9。这里「不偷根」反而更优 —— 这正是每个节点必须汇报两个值的原因。本章 §03 逐帧走的就是这棵树。",
    },
  },
];
