// 终章 · 范式地图 —— 20 周计划 + 面试标准 + 复习节奏 + 全景图 + 终极测验。
//
// 全书题单总表不在这里:page.tsx 直接 import 12 章各自的 PROBLEMS,
// 保证与各章一字不差、进度互通(pid 一律是 `<ch>/<lc>`)。
//
// 双语:prose 用 <T en zh />,需要纯字符串的地方用 Loc<string>。

import type { QuizItem } from "@/lib/quiz";
import type { ChapterId } from "@/lib/curriculum";
import type { ReactNode } from "react";
import { T, type Loc } from "@/lib/i18n";

/* ===================================================================== *
 * 20 周学习计划(内容映射到本课章节 / 姊妹篇 DataData 结构篇)             *
 * ===================================================================== */

/** 归属:algo = 本课(算法篇),ds = DataData(结构篇),both = 两篇合流。
 *  这是稳定 id,同时作为 CSS 的 [data-t] 选择器,不随语言变化。 */
export type Track = "algo" | "ds" | "both";

export const TRACK_LABEL: Record<Track, Loc<string>> = {
  algo: { en: "Algorithms", zh: "算法篇" },
  ds: { en: "Structures", zh: "结构篇" },
  both: { en: "Both", zh: "两篇合流" },
};

export interface WeekRow {
  /** React key,与语言无关 */
  id: string;
  wk: Loc<string>;
  topic: Loc<string>;
  goal: Loc<string>;
  track: Track;
  /** 命中本课(算法篇)章节时给出路由,渲染成站内链接 */
  ch?: ChapterId;
  href?: string;
}

export const WEEKS: WeekRow[] = [
  {
    id: "w0",
    wk: { en: "Week 0", zh: "第 0 周" },
    topic: {
      en: "Recursion, Big-O, comparators, testing habits",
      zh: "递归、Big-O、比较器、测试习惯",
    },
    goal: {
      en: "Write the common templates without help and explain their complexity.",
      zh: "能独立写出常用模板,并解释它的复杂度。",
    },
    track: "algo",
    ch: "home",
    href: "/",
  },
  {
    id: "w1",
    wk: { en: "Week 1", zh: "第 1 周" },
    topic: {
      en: "Array basics, fast and slow pointers, editing in place",
      zh: "数组基础、快慢指针、原地修改",
    },
    goal: {
      en: "Handle indexes, overwriting, deletion, and moving elements.",
      zh: "能处理下标、覆盖、删除与移动。",
    },
    track: "ds",
  },
  {
    id: "w2",
    wk: { en: "Week 2", zh: "第 2 周" },
    topic: {
      en: "Hash tables, counting characters, prefix sums",
      zh: "哈希、字符串计数、前缀和",
    },
    goal: {
      en: "Recognize lookup, counting, and range-sum problems.",
      zh: "能识别「查找 / 计数 / 区间和」三类问题。",
    },
    track: "ds",
  },
  {
    id: "w3",
    wk: { en: "Week 3", zh: "第 3 周" },
    topic: {
      en: "Linked lists, the dummy head node, fast and slow pointers",
      zh: "链表、虚拟头结点、快慢指针",
    },
    goal: {
      en: "Draw the pointers yourself, then insert, delete, and reverse.",
      zh: "能独立画出指针图,并完成增、删、反转。",
    },
    track: "ds",
  },
  {
    id: "w4",
    wk: { en: "Week 4", zh: "第 4 周" },
    topic: {
      en: "Stacks, queues, brackets, expressions",
      zh: "栈、队列、括号、表达式",
    },
    goal: {
      en: "Decide when the order should be LIFO and when it should be FIFO.",
      zh: "能判断何时该用 LIFO、何时该用 FIFO。",
    },
    track: "ds",
  },
  {
    id: "w5",
    wk: { en: "Week 5", zh: "第 5 周" },
    topic: {
      en: "Two pointers and the sliding window",
      zh: "双指针与滑动窗口",
    },
    goal: {
      en: "Write both the fixed-size and the variable-size window template.",
      zh: "能写出固定窗口与可变窗口两套模板。",
    },
    track: "ds",
  },
  {
    id: "w6",
    wk: { en: "Week 6", zh: "第 6 周" },
    topic: {
      en: "Binary search and its boundaries, then binary search in depth",
      zh: "二分查找及边界 → 二分进阶",
    },
    goal: {
      en: "Write the closed-interval template, explain the state at exit, and practice guessing a monotonic answer.",
      zh: "能写闭区间模板、解释退出时的状态,并练二分答案。",
    },
    track: "algo",
    ch: "binary",
    href: "/binary",
  },
  {
    id: "w7",
    wk: { en: "Week 7", zh: "第 7 周" },
    topic: {
      en: "Sorting, merging, quickselect, and divide and conquer",
      zh: "排序、归并、快速选择 + 分治",
    },
    goal: {
      en: "Compare comparison sorts, heaps, and quickselect, and estimate cost with a recursion tree.",
      zh: "能比较「比较排序 / 堆 / 快速选择」,并用递归树估复杂度。",
    },
    track: "algo",
    ch: "sorting",
    href: "/sorting",
  },
  {
    id: "w8",
    wk: { en: "Week 8", zh: "第 8 周" },
    topic: {
      en: "Binary tree DFS and BFS, and the three parts of a recursive call",
      zh: "二叉树 DFS / BFS 与递归三要素",
    },
    goal: {
      en: "Write preorder, inorder, postorder, and level-order traversal.",
      zh: "能写出前序、中序、后序与层序遍历。",
    },
    track: "ds",
  },
  {
    id: "w9",
    wk: { en: "Week 9", zh: "第 9 周" },
    topic: {
      en: "Binary search trees, building a tree, lowest common ancestor",
      zh: "BST、构造树、最近公共祖先",
    },
    goal: {
      en: "Use the ordering of a BST instead of visiting every node.",
      zh: "能利用 BST 的有序性,而不是全树遍历。",
    },
    track: "ds",
  },
  {
    id: "w10",
    wk: { en: "Week 10", zh: "第 10 周" },
    topic: {
      en: "Heaps, Top-K, the monotonic stack",
      zh: "堆、Top-K、单调栈",
    },
    goal: {
      en: "Recognize the signals for next greater or smaller element, and for Top-K.",
      zh: "能识别「最近更大 / 更小」与 Top-K 两类信号。",
    },
    track: "ds",
  },
  {
    id: "w11",
    wk: { en: "Week 11", zh: "第 11 周" },
    topic: {
      en: "Backtracking: combinations, subsets, permutations",
      zh: "回溯:组合、子集、排列",
    },
    goal: {
      en: "Draw the search tree, and handle used and startIndex correctly.",
      zh: "能画出搜索树,并正确处理 used / startIndex。",
    },
    track: "algo",
    ch: "backtrack",
    href: "/backtrack",
  },
  {
    id: "w12",
    wk: { en: "Week 12", zh: "第 12 周" },
    topic: {
      en: "Backtracking: partitioning, board problems, pruning and duplicates",
      zh: "回溯:切割、棋盘、剪枝去重",
    },
    goal: {
      en: "Explain the difference between skipping duplicates across a level and along a branch.",
      zh: "能解释树层去重与树枝去重的区别。",
    },
    track: "algo",
    ch: "backtrack",
    href: "/backtrack",
  },
  {
    id: "w13",
    wk: { en: "Week 13", zh: "第 13 周" },
    topic: {
      en: "Graph DFS and BFS, islands, fewest steps in an unweighted graph",
      zh: "图的 DFS / BFS、岛屿、无权图最少步数",
    },
    goal: {
      en: "Handle visited, connected components, and multi-source BFS.",
      zh: "能处理 visited、连通块与多源 BFS。",
    },
    track: "ds",
  },
  {
    id: "w14",
    wk: { en: "Week 14", zh: "第 14 周" },
    topic: {
      en: "Union-find, topological sort, a first shortest-path algorithm",
      zh: "并查集、拓扑排序、基础最短路",
    },
    goal: {
      en: "Course Schedule, redundant connection, and Dijkstra on non-negative weights.",
      zh: "掌握课程表、冗余连接,以及非负权图上的 Dijkstra。",
    },
    track: "ds",
  },
  {
    id: "w15",
    wk: { en: "Week 15", zh: "第 15 周" },
    topic: {
      en: "Greedy: intervals, jump game, stock problems",
      zh: "贪心、区间、跳跃、股票贪心",
    },
    goal: {
      en: "Explain why each local choice is safe, with an exchange argument.",
      zh: "能用交换论证说明每一步的局部选择为什么成立。",
    },
    track: "algo",
    ch: "greedy",
    href: "/greedy",
  },
  {
    id: "w16",
    wk: { en: "Week 16", zh: "第 16 周" },
    topic: {
      en: "DP basics, grid DP, House Robber",
      zh: "DP 基础、网格、打家劫舍",
    },
    goal: {
      en: "Write the state definition and the transition with the five-step method.",
      zh: "能按五步法写出状态定义与转移方程。",
    },
    track: "algo",
    ch: "dp",
    href: "/dp",
  },
  {
    id: "w17",
    wk: { en: "Week 17", zh: "第 17 周" },
    topic: {
      en: "Knapsack, coin change, target sum",
      zh: "背包、零钱、目标和",
    },
    goal: {
      en: "Tell 0/1 from unbounded knapsack, and get the loop order right.",
      zh: "能区分 0-1 与完全背包,并写对遍历顺序。",
    },
    track: "algo",
    ch: "knapsack",
    href: "/knapsack",
  },
  {
    id: "w18",
    wk: { en: "Week 18", zh: "第 18 周" },
    topic: {
      en: "LIS, LCS, stock DP, advanced DP, and tries",
      zh: "LIS / LCS / 股票 DP、进阶 DP + Trie",
    },
    goal: {
      en: "Cover the important advanced problems. Full coverage is not the goal.",
      zh: "拿下重点进阶题,不求全覆盖。",
    },
    track: "algo",
    ch: "dp-seq",
    href: "/dp-seq",
  },
  {
    id: "w19",
    wk: { en: "Weeks 19–20", zh: "第 19–20 周" },
    topic: {
      en: "Mixed timed sets, mock interviews, redoing what you got wrong",
      zh: "混合限时、模拟面试、错题复刷",
    },
    goal: {
      en: "Finish a medium problem in 35 to 45 minutes while explaining every step out loud.",
      zh: "35–45 分钟完成一道中等题,并口述全过程。",
    },
    track: "algo",
    ch: "atlas",
    href: "/atlas",
  },
];

/** 20 周表未单列、可随时插入的「工具 / 补漏」章。
 *  note 只写章名之后的说明,页面会把章名单独渲染成链接。 */
export const SIDE_CHAPTERS: { ch: ChapterId; href: string; note: Loc<string> }[] =
  [
    {
      ch: "divide",
      href: "/divide",
      note: {
        en: "Take it together with sorting in week 7: fast exponentiation, merging, and an intuition for the master theorem.",
        zh: "随第 7 周排序一起吃:快速幂、归并、主定理直觉。",
      },
    },
    {
      ch: "bits",
      href: "/bits",
      note: {
        en: "A light tool chapter. Fit it into weeks 6 and 7; it prepares you for bitmask DP in chapter 10.",
        zh: "轻量工具课,第 6–7 周穿插,为第 10 章状压 DP 铺路。",
      },
    },
    {
      ch: "dp-pro",
      href: "/dp-pro",
      note: {
        en: "Right after week 18: state machines, interval DP, tree DP, and bitmask DP.",
        zh: "紧接第 18 周:状态机、区间、树形、状压。",
      },
    },
    {
      ch: "math",
      href: "/math",
      note: {
        en: "Insert it wherever you find a gap: modular arithmetic, the prime sieve, majority vote, and game theory.",
        zh: "查漏时按需插入:取模、质数筛、摩尔投票、博弈。",
      },
    },
    {
      ch: "strings",
      href: "/strings",
      note: {
        en: "Finish with it after week 18: KMP, rolling hash, and palindromes.",
        zh: "第 18 周后收尾:KMP、滚动哈希、回文。",
      },
    },
  ];

/* ===================================================================== *
 * 面试级完成标准 + 复习节奏                                               *
 * ===================================================================== */

export const STANDARDS: { icon: string; text: ReactNode }[] = [
  {
    icon: "🗣",
    text: (
      <T
        en={
          <>
            When you read a problem, <b>describe the brute-force solution first,
            then improve it step by step</b>. Do not stay silent until the
            optimal answer arrives.
          </>
        }
        zh={
          <>
            看到题目能<b>先说暴力解,再逐步优化</b> —— 而不是憋着,憋出最优解才开口。
          </>
        }
      />
    ),
  },
  {
    icon: "🧭",
    text: (
      <T
        en={
          <>
            Explain <b>why you chose this data structure or paradigm</b>, and
            why you did not choose the obvious alternative.
          </>
        }
        zh={
          <>
            能解释<b>为什么选这个数据结构 / 范式</b>,也能说清「为什么不用另一个」。
          </>
        }
      />
    ),
  },
  {
    icon: "📐",
    text: (
      <T
        en={
          <>
            State the <b>time and space complexity</b>, and explain where those
            numbers come from.
          </>
        }
        zh={
          <>
            能写出<b>时间与空间复杂度</b>,并讲得出这个数字是怎么来的。
          </>
        }
      />
    ),
  },
  {
    icon: "🧪",
    text: (
      <T
        en={
          <>
            Cover five kinds of edge case without being asked:{" "}
            <b>empty input, one element, duplicate values, index out of range,
            and overflow</b>.
          </>
        }
        zh={
          <>
            主动覆盖<b>空输入、单元素、重复值、越界、溢出</b>五类边界。
          </>
        }
      />
    ),
  },
  {
    icon: "⌨️",
    text: (
      <T
        en={
          <>
            Write code that runs, on a whiteboard or in a plain text editor,{" "}
            <b>with no autocomplete</b>.
          </>
        }
        zh={
          <>
            在<b>没有自动补全</b>的白板 / 记事本里,也能写出可运行的代码。
          </>
        }
      />
    ),
  },
  {
    icon: "⏱",
    text: (
      <T
        en={
          <>
            Within the time limit, go through all four steps:{" "}
            <b>clarify the question, design, code, test</b>. Getting Accepted is
            not the goal.
          </>
        }
        zh={
          <>
            限时内走完<b>澄清题意 → 设计 → 编码 → 测试</b>,而不是只追 Accepted。
          </>
        }
      />
    ),
  },
];

export const REVIEW: {
  id: string;
  tag: Loc<string>;
  when: Loc<string>;
  how: ReactNode;
}[] = [
  {
    id: "d1",
    tag: "D+1",
    when: { en: "The next day", zh: "第二天" },
    how: (
      <T
        en={
          <>
            <b>Say the approach out loud</b> and write the core code by hand. If
            you cannot explain it, you do not know it yet.
          </>
        }
        zh={
          <>
            <b>口述</b>思路并手写核心代码 —— 说得出,才是真会。
          </>
        }
      />
    ),
  },
  {
    id: "d7",
    tag: "D+7",
    when: { en: "One week later", zh: "一周后" },
    how: (
      <T
        en={
          <>
            <b>Redo the whole problem</b> without your notes, to check what
            actually stayed.
          </>
        }
        zh={
          <>
            <b>完整重做</b>一遍,不看笔记,检验记忆是否落地。
          </>
        }
      />
    ),
  },
  {
    id: "d21",
    tag: "D+21",
    when: { en: "Three weeks later", zh: "三周后" },
    how: (
      <T
        en={
          <>
            <b>Redo it under a time limit</b>, so that solving it becomes
            routine rather than possible.
          </>
        }
        zh={
          <>
            <b>限时重做</b>,模拟面试压力,把「会」逼成「熟」。
          </>
        }
      />
    ),
  },
  {
    id: "pre",
    tag: { en: "Pre-interview", zh: "面试前" },
    when: { en: "Final stretch", zh: "冲刺期" },
    how: (
      <T
        en={
          <>
            <b>Pick problems at random by pattern</b>, not in chapter order. An
            interview will not tell you which chapter the problem comes from.
          </>
        }
        zh={
          <>
            按<b>模式随机抽题</b>,而不是按章节顺序回忆 —— 面试不会给你章节名。
          </>
        }
      />
    ),
  },
];

/* ===================================================================== *
 * DataData × AlgoAlgo 全景图                                             *
 * ===================================================================== */

/** side 是稳定 id(同时是 CSS 的 [data-side] 选择器):ds = 结构篇,algo = 算法篇。 */
export const PANORAMA: {
  side: "ds" | "algo";
  sideLabel: Loc<string>;
  name: Loc<string>;
  desc: ReactNode;
  items: ReactNode[];
}[] = [
  {
    side: "ds",
    sideLabel: { en: "Structures", zh: "结构篇" },
    name: {
      en: "DataData · Data structures you can see",
      zh: "DataData · 看得见的数据结构",
    },
    desc: (
      <T
        en="The nouns an algorithm works on. The shape you store data in decides how fast you can move it."
        zh="算法操作的「名词」—— 数据摆成什么形状,决定了能怎么快地动它。"
      />
    ),
    items: [
      <T
        key="a"
        en="Arrays / strings / linked lists"
        zh="数组 / 字符串 / 链表"
      />,
      <T
        key="b"
        en="Stacks / queues / monotonic stack / monotonic deque"
        zh="栈 / 队列 / 单调栈 / 单调队列"
      />,
      <T
        key="c"
        en="Hash tables / binary trees / binary search trees"
        zh="哈希表 / 二叉树 / BST"
      />,
      <T
        key="d"
        en="Heaps / tries / union-find / graphs"
        zh="堆 / Trie / 并查集 / 图"
      />,
      <T
        key="e"
        en="Two pointers · sliding window · BFS · DFS · topological sort · Dijkstra"
        zh="双指针 · 滑窗 · BFS · DFS · 拓扑 · Dijkstra"
      />,
    ],
  },
  {
    side: "algo",
    sideLabel: { en: "Algorithms", zh: "算法篇" },
    name: {
      en: "AlgoAlgo · Algorithms you can see",
      zh: "AlgoAlgo · 看得见的算法",
    },
    desc: (
      <T
        en="The verbs applied to those structures. Each one turns a problem into a sequence of decisions and states."
        zh="作用在结构上的「动词」—— 把问题拆成一串决策与状态的演进。"
      />
    ),
    items: [
      <T
        key="a"
        en="Sorting / divide and conquer / binary search in depth / bit manipulation"
        zh="排序 / 分治 / 二分进阶 / 位运算"
      />,
      <T
        key="b"
        en="Backtracking (a decision tree) / greedy (an exchange argument)"
        zh="回溯(决策树)/ 贪心(交换论证)"
      />,
      <T
        key="c"
        en="Four DP chapters: basics → knapsack → subsequences → advanced"
        zh="DP 四章:入门 → 背包 → 子序列 → 进阶"
      />,
      <T
        key="d"
        en="Math and number theory / string algorithms (KMP)"
        zh="数学与数论 / 字符串算法(KMP)"
      />,
      <T
        key="e"
        en="Choosing a paradigm: from the problem statement to an approach"
        zh="范式选型:看到题 → 亮起哪盏灯"
      />,
    ],
  },
];

/* ===================================================================== *
 * 终极测验 —— 不考定义,只考「看到题选哪个范式」                          *
 * ===================================================================== */

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "Coins [1, 3, 4], target 6. Greedy takes the largest coin every time: 4 + 1 + 1, three coins. The best answer is 3 + 3, two coins. What does this show?",
      zh: "凑出目标金额的最少硬币数,面额 [1,3,4] 凑 6:贪心每次拿最大得 4+1+1=3 枚,但正解是 3+3=2 枚。这说明什么?",
    },
    opts: {
      en: [
        "Greedy fails on this input, so DP is the fallback",
        "Greedy can never be used on coin problems",
        "The test data must be wrong",
        "Only backtracking works here; DP does not apply",
      ],
      zh: [
        "贪心在这里失效,应换 DP 兜底",
        "贪心永远不能用于硬币问题",
        "题目数据一定有误",
        "只能用回溯,DP 不适用",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "On other denomination sets greedy does give the best answer: the coins [1, 5, 10, 25], for example, or any set where each coin divides the next larger one. You cannot tell by looking, so you need a proof that the greedy choice is safe.",
        "The data is fine. This set of denominations breaks the greedy choice property: taking the largest coin first leads to a longer answer.",
        "Backtracking finds the right answer but takes exponential time. DP is the intended solution, and LC 322 with coins [1, 3, 4] is the counterexample that connects chapter 06 to chapter 07.",
      ],
      zh: [
        undefined,
        "换成 [1,5,10,25],或者任何「每个面额都整除下一个更大面额」的面额组,贪心又对了 —— 光看是看不出来的,得有证明。",
        "数据没问题,是这组面额破坏了贪心选择性质:先拿最大反而绕远路。",
        "回溯能得到对的答案,但指数级会超时;DP 才是这题的正解 —— 322 硬币 [1,3,4] 正是把 06 章接到 07 章的那个反例。",
      ],
    },
    why: {
      en: "\"Greedy has no proof here, so fall back to DP\" is the line that connects chapter 06 (Greedy) to chapter 07 (DP). Coin Change (LC 322) with coins [1, 3, 4] is the standard counterexample.",
      zh: "「贪心失效 ⇒ DP 兜底」是本课 06 贪心 → 07 DP 的主线叙事;322 硬币 [1,3,4] 是那个经典反例。",
    },
  },
  {
    type: "choice",
    q: {
      en: "You have to find a target value in a sorted array that has been rotated, in O(log n) time. Which paradigm?",
      zh: "在「旋转后的有序数组」里查找目标值,要求 O(log n)。选哪个范式?",
    },
    opts: {
      en: [
        "Binary search: decide which half is sorted, then keep the half that can contain the target",
        "Scan from the first element to the last",
        "Backtracking over every position",
        "Dynamic programming",
      ],
      zh: [
        "二分查找(判断哪半有序,朝可能含目标的那半收窄)",
        "从头到尾顺序扫描",
        "回溯枚举所有位置",
        "动态规划",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "A linear scan is O(n), which does not meet the required O(log n).",
        "Backtracking is for listing every possibility. Here you only need to locate one value, and it would also be too slow.",
        "DP needs overlapping subproblems. This problem has no subproblem structure at all.",
      ],
      zh: [
        undefined,
        "顺序扫描 O(n),不满足 O(log n) 的硬要求。",
        "回溯用于「列出所有可能」,这里只要定位一个值,既大材小用又会超时。",
        "DP 需要重叠子问题,这里根本没有子问题结构。",
      ],
    },
    why: {
      en: "A rotated sorted array still has a usable property: at any midpoint, one of the two halves is sorted. Check which half the target falls into and continue the binary search there (chapter 03, LC 33).",
      zh: "旋转数组仍有「二段性」:任意 mid 处总有一半是有序的,判断 target 落在哪半继续二分(本课 03 章 33 题)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "The problem asks you to output every permutation of an array. First choice?",
      zh: "题目要求「输出一个数组的全部排列」。首选?",
    },
    opts: {
      en: [
        "Backtracking: a decision tree with a used array, recording at the leaf and undoing on the way back",
        "Greedy",
        "Binary search",
        "Prefix sums",
      ],
      zh: [
        "回溯(决策树 + used 数组,到底收集、回来撤销)",
        "贪心",
        "二分查找",
        "前缀和",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Greedy produces one best answer. Permutations ask for all answers.",
        "Binary search locates one answer inside a range that behaves monotonically. It does not enumerate.",
        "Prefix sums answer range-sum questions. They have nothing to do with enumerating candidates.",
      ],
      zh: [
        undefined,
        "贪心只产出一个「最好」的解,而排列要的是「所有」解。",
        "二分是在单调的空间里定位一个答案,不负责枚举。",
        "前缀和处理的是区间求和,与枚举方案无关。",
      ],
    },
    why: {
      en: "\"List every valid answer\" means backtracking: at each level pick an element you have not used, record the path at the leaf, and undo the choice when you return (chapter 05, LC 46).",
      zh: "「列出所有可行方案」= 回溯:每层选一个没用过的元素,走到底收集,返回时撤销选择(本课 05 章 46 题)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Compute x to the power n, where n can be as large as 10⁹. Which one?",
      zh: "求 x 的 n 次方,n 可能高达 10⁹。选哪个?",
    },
    opts: {
      en: [
        "Fast exponentiation (divide and conquer: halve the exponent each step)",
        "Multiply n times in a loop",
        "Dynamic programming",
        "Greedy",
      ],
      zh: [
        "快速幂(分治:指数每次折半)",
        "循环连乘 n 次",
        "动态规划",
        "贪心",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Repeated multiplication is O(n). With n = 10⁹ that is far too slow.",
        "The subproblems of a power are independent and never repeat, so storing results gains nothing. DP's condition is not met.",
        "There is no local choice to make here.",
      ],
      zh: [
        undefined,
        "连乘 O(n),n = 10⁹ 时直接超时。",
        "幂运算的子问题彼此独立、不会重复,记忆化没有收益 —— 不满足 DP 的前提。",
        "这里没有「局部最优」可贪。",
      ],
    },
    why: {
      en: "x^n = (x^(n/2))², so each step halves the exponent: O(log n). This is the standard divide and conquer application (chapter 02, LC 50).",
      zh: "x^n = (x^(n/2))²,把指数折半 ⇒ O(log n)。分治的招牌应用(本课 02 章 50 题)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "What is the clearest signal that a problem needs DP?",
      zh: "判断「该不该上 DP」,最关键的信号是?",
    },
    opts: {
      en: [
        "The same subproblems are solved again and again, and the optimal answer is built from optimal answers to those subproblems",
        "The input array is sorted",
        "The problem asks you to output every concrete answer",
        "Every step can be justified with an exchange argument",
      ],
      zh: [
        "存在「重叠子问题」,且具备「最优子结构」",
        "输入数组是有序的",
        "题目要求输出所有具体方案",
        "每一步都能用交换论证证明贪心成立",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "A sorted input points to binary search, not DP. And what binary search really needs is a predicate that switches from false to true only once over the range; a sorted array is the common special case.",
        "\"Output every answer\" is the backtracking signal. DP usually returns an optimal value or a count.",
        "If you can prove the greedy choice is safe, use greedy: it is faster and uses less memory. You do not need DP.",
      ],
      zh: [
        undefined,
        "「有序」是二分的信号,不是 DP 的 —— 而二分真正需要的是判定条件在区间上单调,有序数组只是最常见的特例。",
        "「输出所有方案」是回溯的信号;DP 通常只求最优值或方案数。",
        "能证明贪心成立就直接贪心,更快也更省空间,不必上 DP。",
      ],
    },
    why: {
      en: "DP has two conditions. Subproblems must repeat, otherwise storing their results gains nothing. And the optimal answer to the whole problem must be built from optimal answers to subproblems. Repeated subproblems are what separates DP from divide and conquer.",
      zh: "DP 两大前提:子问题会被重复计算(记忆化才有意义)+ 大问题的最优由子问题的最优拼成(最优子结构)。「子问题重复」正是 DP 与分治的分界线。",
    },
  },
  {
    type: "choice",
    q: {
      en: "\"Halve the largest value in the array, repeat k times, then minimize the array sum.\" For a problem where each step takes the locally best option and you can prove you will not regret it, what is the first choice?",
      zh: "「每次把当前最大值减半,k 次操作后求最小数组和」这类「每步取眼前最优、且能证明不后悔」的题,首选?",
    },
    opts: {
      en: [
        "Greedy, usually with a max-heap",
        "Dynamic programming",
        "Backtracking",
        "Binary search on the answer",
      ],
      zh: ["贪心(常配大顶堆)", "动态规划", "回溯", "二分答案"],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The state would be \"how many operations are used, and what the heap looks like\". That state space is huge and nothing is ever reused, so DP only adds cost.",
        "Backtracking would try every choice at every step, which takes exponential time.",
        "There is no monotonic range of candidate answers to guess and verify here.",
      ],
      zh: [
        undefined,
        "状态是「操作了几次、堆成什么样」,空间爆炸且无需重用,DP 反而累赘。",
        "回溯枚举每步选谁,会指数级超时。",
        "没有一个单调的「答案值域」可供猜测验证,二分答案无从下手。",
      ],
    },
    why: {
      en: "Take the current largest value each time, using a max-heap. An exchange argument shows this choice is never worse, so greedy is safe here (chapter 06).",
      zh: "「每步拿当前最大来砍」用大顶堆实现的贪心;能用交换论证说明这样砍不会更差,就放心贪(本课 06 章)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Find the length of the longest common subsequence of two strings. Which one?",
      zh: "求「两个字符串的最长公共子序列」长度。选哪个?",
    },
    opts: {
      en: [
        "Two-dimensional DP, where dp[i][j] is the LCS of the first i and the first j characters",
        "Greedy matching character by character",
        "One pass with two pointers",
        "Counting with a hash table",
      ],
      zh: [
        "二维 DP(dp[i][j] = 前 i、前 j 的 LCS)",
        "贪心逐字符匹配",
        "双指针一遍扫过去",
        "哈希表计数",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "A locally greedy match can block a longer pairing later, so it does not guarantee the global longest.",
        "Two pointers suit a contiguous substring or sorted data. A subsequence may skip characters, so one pass misses answers.",
        "A hash table counts whether something appears and how often. It cannot measure the longest match that keeps the original order.",
      ],
      zh: [
        undefined,
        "贪心的局部匹配可能堵死后面更长的配对,无法保证全局最长。",
        "双指针适合「连续子串」或已排序数据;子序列允许跳过字符,一遍扫会漏。",
        "哈希能数「有没有 / 几个」,数不出「保持顺序的最长」。",
      ],
    },
    why: {
      en: "A problem about two sequences maps to a two-dimensional table. If the two characters are equal, take the upper-left value plus 1. Otherwise take the larger of the values above and to the left (chapter 09, LC 1143).",
      zh: "两个序列的问题 → 二维表:字符相等取左上角 +1,否则取上 / 左的较大值(本课 09 章 1143)。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which of these statements about greedy and DP are correct? (Select all that apply.)",
      zh: "关于「贪心 vs DP」,下列哪些说法正确?(多选)",
    },
    opts: {
      en: [
        "Greedy never revisits a choice; DP works out the subproblems it needs and combines them",
        "Greedy needs a proof that the greedy choice is safe. Without one, do not use it",
        "Maximum Subarray (53) and Best Time to Buy and Sell Stock II (122) can each be solved by greedy or by DP",
        "DP is always faster than greedy",
      ],
      zh: [
        "贪心一旦做出选择就不回头;DP 会把需要的子问题都算清再组合",
        "贪心必须能证明「贪心选择性质」,证不出来就别贪",
        "53 最大子数组、122 买卖股票 II,既能贪心也能 DP",
        "DP 一定比贪心更快",
      ],
    },
    correct: [0, 1, 2],
    missHint: {
      en: "The first three describe not revisiting choices, needing a proof, and one problem having two solutions. One of them is still unselected.",
      zh: "前三条分别讲「不回头 / 需证明 / 同题多解」—— 再想想漏了哪条。",
    },
    extraHint: {
      en: "\"DP is always faster\" is wrong. When greedy applies it is usually faster and uses less memory. DP is the general fallback, not the faster option.",
      zh: "「DP 一定更快」是错的:能贪心时贪心通常更快更省空间,DP 是通用兜底,不是速度更优。",
    },
    why: {
      en: "Greedy commits to a local choice and therefore needs a proof. DP works out every subproblem it needs. Problems 53 and 122 are taught from both angles in this course.",
      zh: "贪心是「敢赌局部最优」,但要给出证明;DP 是「把需要的子问题都算清」。53 / 122 两种视角本课都讲过。",
    },
  },
];
