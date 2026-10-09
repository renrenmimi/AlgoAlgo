// Chapter 7 - Dynamic Programming Basics: quiz data.
// Kept apart from the problem set so that the atlas, which lists every chapter's problems,
// does not load the quizzes too.

import type { QuizItem } from "@/lib/quiz";
import { T } from "@/lib/i18n";

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "Which two properties must a problem have before dynamic programming helps?",
      zh: "一个问题能用 DP 高效解决,需要同时具备哪两个性质?",
    },
    opts: {
      en: [
        "Overlapping subproblems (the same subproblem is reached many times) and optimal substructure (an optimal solution is built from optimal solutions of subproblems)",
        "Sorted input and permission to use extra memory",
        "The greedy choice property and no aftereffect",
        "Independent subproblems and the ability to write it recursively",
      ],
      zh: [
        "重叠子问题(同一个子问题被反复求解)+ 最优子结构(最优解由子问题的最优解拼成)",
        "数据有序 + 允许使用额外空间",
        "有贪心选择性质 + 无后效性",
        "子问题互相独立 + 可以写成递归",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Sorted input is a signal for binary search or two pointers. Extra memory is an implementation detail, not a condition for DP.",
        "The greedy choice property is exactly what lets you skip DP: if you can prove it, take the greedy solution. \"No aftereffect\" is half right, but the other half is overlapping subproblems.",
        "Independent subproblems is the signal for divide and conquer: merge sort splits into two halves that never share work. DP exists precisely because the subproblems are not independent.",
      ],
      zh: [
        undefined,
        "有序是二分 / 双指针的信号;额外空间只是实现细节,不是 DP 成立的前提。",
        "「贪心选择性质」恰恰是可以跳过 DP 的理由 —— 能证明它,直接用贪心即可。无后效性说对了一半,另一半是重叠子问题。",
        "「子问题互相独立」是分治的信号(归并排序切出的两半互不共享工作)。DP 存在的意义,正是子问题不独立、大量重叠。",
      ],
    },
    why: {
      en: "Overlapping subproblems means storing an answer pays off. Optimal substructure means the stored answers can be combined into the answer above. Without overlap, use divide and conquer. Without optimal substructure, you have to search all combinations.",
      zh: "重叠子问题 ⇒ 把答案记下来才有收益;最优子结构 ⇒ 记下来的答案能往上拼。不重叠就用分治;拼不出最优解,就只能搜索所有组合。",
    },
  },
  {
    type: "choice",
    q: {
      en: "What is the most accurate description of how memoized recursion relates to filling a table?",
      zh: "「记忆化搜索」和「递推填表」的关系,最准确的说法是?",
    },
    opts: {
      en: [
        "Two ways to fill the same DP table: memoization fills it top-down and on demand, tabulation fills it bottom-up in a fixed order",
        "Memoization is brute force; only tabulation is real DP",
        "Memoization is always faster, because it skips states it does not need",
        "They have different complexities: memoization is O(2ⁿ) and tabulation is O(n)",
      ],
      zh: [
        "同一张 DP 表的两种填法:记忆化自顶向下按需填,递推自底向上按固定顺序填",
        "记忆化是暴力,递推才是真正的 DP",
        "记忆化一定更快,因为它跳过了不需要的状态",
        "两者复杂度不同:记忆化 O(2ⁿ),递推 O(n)",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Memoized recursion is real DP. Each state is computed once, so it has the same complexity as tabulation. The only difference is that the recursion decides the evaluation order for you.",
        "It can do less work when many states are unreachable for this input. It also pays for function calls and uses the call stack, which can overflow on deep inputs. Neither form is faster in general.",
        "Once the memo is in place, each state is computed at most once. Both forms take O(number of states × work per transition).",
      ],
      zh: [
        undefined,
        "记忆化搜索是货真价实的 DP:每个状态只算一次,复杂度和递推同阶,区别只是求值顺序由递归自动决定。",
        "当很多状态在本次输入下根本到不了时,它确实少算一些;但它要付函数调用的开销,还占用调用栈,输入太深会栈溢出。两种写法都不是普遍更快的那个。",
        "加上备忘录之后,每个状态最多算一次:两种写法都是 O(状态数 × 单次转移代价)。",
      ],
    },
    why: {
      en: "Brute-force recursion, then a memo, then (optionally) a table filled bottom-up: that is the standard path in this chapter. The two forms compute the same values and can be translated into each other at any time.",
      zh: "先写暴力递归 → 加备忘录 → (可选)改成自底向上填表,这是本章给你的标准路径。两种写法算出的值完全相同,随时可以互相翻译。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          Climbing stairs, 1 or 2 steps at a time: how many ways are there to
          climb 5 steps? (Fill the table by hand: dp[1] = 1, dp[2] = 2, …)
        </>
      ),
      zh: (
        <>
          爬楼梯(每次 1 或 2 阶):n = 5 时有多少种爬法?
          (手推一遍 dp 表:dp[1] = 1、dp[2] = 2、…)
        </>
      ),
    },
    placeholder: { en: "Enter a whole number…", zh: "输入一个整数…" },
    answers: ["8", "8种", "8ways"],
    hint: {
      en: "dp[3] = dp[2] + dp[1] = 3, dp[4] = dp[3] + dp[2] = 5, dp[5] = ?",
      zh: "dp[3] = dp[2] + dp[1] = 3,dp[4] = dp[3] + dp[2] = 5,dp[5] = ?",
    },
    why: {
      en: "dp[5] = dp[4] + dp[3] = 5 + 3 = 8. Filling a small table by hand is the fastest way to check a transition, and it is worth doing out loud in an interview.",
      zh: "dp[5] = dp[4] + dp[3] = 5 + 3 = 8。手动填一张小表是验证转移方程最快的办法,面试时也值得当着面试官这么做。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In LC 62 Unique Paths (the robot moves only right or down), which transition is correct?",
      zh: "LC 62 不同路径(只能向右或向下),dp[i][j] 的正确转移是?",
    },
    opts: [
      "dp[i][j] = dp[i-1][j] + dp[i][j-1]",
      "dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
      "dp[i][j] = dp[i-1][j-1] + 1",
      "dp[i][j] = dp[i-1][j] + dp[i][j-1] + dp[i-1][j-1]",
    ],
    correct: 0,
    wrong: {
      en: [
        undefined,
        "max belongs to an optimization problem such as LC 64 Minimum Path Sum. This problem asks how many paths there are, so the two counts are added.",
        "A diagonal transition belongs to DP over two strings (LCS and edit distance, chapter 09). Here the robot cannot move diagonally.",
        "The robot moves only right or down, so there is no third way in from (i-1, j-1). Every path through that cell is already counted inside the other two terms, and adding it counts those paths twice.",
      ],
      zh: [
        undefined,
        "max 是最值题的算子(比如 LC 64 最小路径和)。本题问的是「有几条路」,两个来路的方案数要相加。",
        "对角线转移属于「两个字符串比对」类 DP(LCS、编辑距离,第 9 章)—— 这里机器人不能斜着走。",
        "机器人只能向右或向下,不存在从 (i−1, j−1) 直接走来的第三条来路。经过那一格的路径已经被前两项统计过了,再加一次就是重复计数。",
      ],
    },
    why: {
      en: "The last step into (i, j) has exactly two possibilities: from above or from the left. The two sets of paths do not overlap and cover everything, so the counts add. Splitting by the last step is the standard opening for a counting DP.",
      zh: "走到 (i, j) 的最后一步只有两种:从上面来、从左面来。两类路径互斥且覆盖全部,所以直接相加。「按最后一步分类」是计数型 DP 的标准切入点。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In House Robber, dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Why does the first term not add nums[i]?",
      zh: "打家劫舍 dp[i] = max(dp[i-1], dp[i-2] + nums[i]) 中,为什么 dp[i-1] 那一项不加 nums[i]?",
    },
    opts: {
      en: [
        "Because dp[i-1] is the branch that skips house i. dp[i] means the best over houses 0 through i; it does not require taking house i",
        "Because taking two neighbors triggers the alarm, so nums[i] has to be subtracted",
        "It is a mistake in the solution; nums[i] should be added there too",
        "Because dp[i-1] already includes nums[i]",
      ],
      zh: [
        "因为 dp[i-1] 是「不偷第 i 间」的那一支 —— dp[i] 的含义是第 0 到第 i 间之内的最优,并不要求偷第 i 间",
        "因为偷相邻两间会触发警报,所以要减去 nums[i]",
        "是题解写错了,这里也应该加上 nums[i]",
        "因为 dp[i-1] 里已经包含了 nums[i]",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The alarm constraint lives in the other term: when you take house i you may only build on dp[i-2]. The dp[i-1] term does not take house i at all, so no alarm is involved.",
        "The equation is right. If both terms added nums[i], house i would be taken in every case, and the state would change meaning to \"the best selection that must include house i\". That definition also works, but then the transition and the place of the answer both change.",
        "dp[i-1] is the best over houses 0 through i-1. It does not know that house i exists, so it cannot contain nums[i].",
      ],
      zh: [
        undefined,
        "警报约束体现在另一项里:偷第 i 间时只能接在 dp[i-2] 上。dp[i-1] 这一项根本没偷第 i 间,谈不上触发警报。",
        "方程没错。若两项都加 nums[i],就等于强制偷第 i 间,状态含义会从「前 i 间之内的最优」变成「必须偷第 i 间的最优」——那也是一种可行的定义,但转移和取答案的位置都得跟着改。",
        "dp[i-1] 是第 0 到第 i−1 间之内的最优,它根本不知道第 i 间的存在,不可能包含 nums[i]。",
      ],
    },
    why: {
      en: "Read every term of a transition strictly against the state definition. If dp[i] is the best over houses 0 through i, the two branches are exactly \"skip house i\" and \"take house i\". A vague state definition produces a wrong equation almost every time.",
      zh: "转移方程的每一项都必须严格贴着状态定义来读:「dp[i] = 第 0 到第 i 间之内的最大金额」⇒ 两支分别是「不偷 i」和「偷 i」。状态定义一含糊,方程几乎必错。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which of these show that a state definition is good enough? (Choose all that apply)",
      zh: "下面哪些是「状态定义合格」的标志?(多选)",
    },
    opts: {
      en: [
        "You can say in one plain sentence what dp[i] means (for example, \"the largest sum of a subarray ending at index i\")",
        "The final answer can be read directly out of one state, or a small set of states",
        "Every transition reads only states that are already computed",
        "The more dimensions the state has, the safer, because it carries more information",
      ],
      zh: [
        "能用一句平实的话说清 dp[i] 是什么(例如「以下标 i 结尾的最大子数组和」)",
        "最终答案能从某一个(或某几个)状态里直接读出来",
        "每次转移只读取「已经算好」的状态",
        "状态维度越多越好,信息越全越安全",
      ],
    },
    correct: [0, 1, 2],
    missHint: {
      en: "Three checks: can you state it, can you read the answer out of it, can you compute it in some order? Look again at which one you left out.",
      zh: "三个要点:说得清、取得出、算得动 —— 再看看你漏了哪一条。",
    },
    extraHint: {
      en: "More dimensions means a larger state space, which costs more time and more memory. A good state is just large enough to separate the cases that must be separated. If one dimension is enough, do not add a second.",
      zh: "维度越多,状态空间越大,时间和内存都更贵。好的状态定义是「刚好够用」:能区分必须区分的局面就行,一维能解决就不要上二维。",
    },
    why: {
      en: "Three questions for any state definition: can you say what it means, is the answer somewhere in the table, and is there an order in which every dependency is ready first? Defining the state is worth about half of your thinking time.",
      zh: "检验状态定义的三问:①含义说得清吗?②答案在表里吗?③存在一种顺序,让每次转移用到的格子都已算好吗?五步法的第一步值得花掉一半的思考时间。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Coins 1, 3, 4 and a target of 6. Taking the largest coin first gives 4+1+1 = 3 coins, but the answer is 3+3 = 2 coins. What does this show?",
      zh: "硬币 [1, 3, 4] 凑金额 6:每次拿最大面额得到 4+1+1 = 3 枚,但正确答案是 3+3 = 2 枚。这说明?",
    },
    opts: {
      en: [
        "This coin set has no greedy choice property: the locally best move (take 4) rules out the globally best answer (two 3s), so the DP has to try every choice of last coin",
        "Greedy algorithms are wrong in general and should never be used",
        "You just have to take the coins from smallest to largest instead",
        "DP guesses better than greedy does",
      ],
      zh: [
        "这组面额不具备贪心选择性质:局部最优(先拿 4)排除了全局最优(两个 3),所以必须让 DP 把每种「最后一枚」都试一遍",
        "贪心算法本身就是错的,任何题都不该用",
        "只要把硬币从小到大拿就对了",
        "DP 靠猜比贪心准",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Greedy is not wrong; it is only wrong in the wrong place. In LC 860 Lemonade Change, with bills of 5, 10, and 20, giving the largest bill first is provably safe.",
        "Smallest first is worse: 1+1+1+1+1+1 = 6 coins. The problem is not the order, it is that each step looks only at the current amount.",
        "DP does not guess. dp[a] = min(dp[a-c] + 1) enumerates every possible last coin, so no combination is missed. That is exhaustive search with stored results, not luck.",
      ],
      zh: [
        undefined,
        "贪心没错,错的是用错地方:LC 860 柠檬水找零(面额 5 / 10 / 20)先给大面额就是对的 —— 区别在于那里的局部最优可以被证明是安全的。",
        "从小到大更糟:1+1+1+1+1+1 = 6 枚。问题不在拿的顺序,而在「每一步只看当前金额」这件事本身。",
        "DP 不靠猜:dp[a] = min(dp[a−c] + 1) 枚举了「最后一枚硬币」的所有可能,数学上保证不漏 —— 这叫穷举加记账,不叫运气。",
      ],
    },
    why: {
      en: "When you cannot prove that the greedy choice is safe, fall back to enumerating every decision and storing the subproblem answers. Chapter 08 rebuilds this problem as an unbounded knapsack.",
      zh: "证明不了贪心选择是安全的,就退回「枚举所有决策 + 记住子问题答案」的 DP。第 8 章会把这道题重新建模成完全背包。",
    },
  },
  {
    type: "choice",
    q: {
      en: "The climbing stairs transition dp[i] = dp[i-1] + dp[i-2] reads only the last two cells. If you replace the whole dp array with two rolling variables, what is the space complexity?",
      zh: "爬楼梯的递推 dp[i] = dp[i-1] + dp[i-2] 只读最近两格。把整个 dp 数组换成两个滚动变量后,空间复杂度是?",
    },
    opts: {
      en: [
        "O(1) — two numbers, no matter how large n is",
        "O(log n)",
        "O(n); the array is only hidden, not removed",
        "This optimization is not valid; the result would be wrong",
      ],
      zh: [
        "O(1) —— 无论 n 多大,只存两个数",
        "O(log n)",
        "O(n),数组只是被藏起来了",
        "不能这么优化,结果会算错",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "A log factor comes from repeatedly halving something, and nothing is halved here. The storage is a constant 2, so it is O(1).",
        "Nothing is hidden. Each old value is discarded as soon as it has been used, so memory holds exactly two numbers at any moment.",
        "As long as the transition reads only a fixed number of recent cells, dropping the older values cannot affect any later computation. The results are identical.",
      ],
      zh: [
        undefined,
        "log 来自「反复对半」的结构,这里没有对半;存储量是常数 2,就是 O(1)。",
        "没有任何隐藏数组:旧值一用完就丢,任何时刻内存里只有两个数字。",
        "只要转移读的是固定的最近几格,丢掉更早的值就不会影响任何后续计算,结果分毫不差。",
      ],
    },
    why: (
      <T
        en={
          <>
            The rule: if the transition reads only the last k cells, the space
            can be reduced to O(k). This works because the cells it drops are
            never read again. It does not apply to every DP — LC 322 reads
            dp[a-c] for every coin value c, so no constant number of cells is
            enough. Chapter 08 raises this to a one-dimensional knapsack array,
            where the loop direction starts to matter.
          </>
        }
        zh={
          <>
            规则:转移只读最近 k 格 ⇒ 空间可压到 O(k) —— 因为被丢掉的格子以后再也不会被读。但它不是对所有 DP 都成立:LC 322 要读 dp[a−c],c 取遍所有面额,保留固定几格根本不够。第 8 章背包的一维滚动数组是它的进阶版,那里连遍历方向都会影响结果。
          </>
        }
      />
    ),
  },
];
