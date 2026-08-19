// 课程注册表 —— 全站唯一的章节清单。
// 侧栏、命令面板、章节页脚(上一章/下一章)、进度系统都从这里取数据。
// 新增章节:在 CHAPTERS 里插入一条,并保证 app/<id>/page.tsx 存在。
//
// 路线设计依据(详见 CLAUDE.md「课程结构与依据」):
//   排序/分治先立「递归 + 分而治之」的地基 → 二分进阶练「用单调性砍半」 →
//   位运算做轻量工具箱(为状压 DP 铺路)→ 回溯把递归树画出来 →
//   贪心学「敢贪的证明」→ DP 四章(入门→背包→子序列→进阶)承接
//   「回溯的树 + 贪心的反例」→ 数学/字符串收尾 → 终章选型地图。
// 依附于数据结构的套路(双指针/滑窗/BFS/DFS/单调栈/Dijkstra/拓扑排序)
// 由姊妹篇 DataData 负责,本课在相应位置给出链接。
//
// 本文件同时被 server 与 client 文件 import,所以保持为纯数据模块(无 "use client"):
// title / alt / essence / tags 是 Loc<…>,由「消费方」用 useL() 解析成当前语言。

import type { Loc } from "@/lib/i18n";

export type ChapterId =
  | "home"
  | "sorting"
  | "divide"
  | "binary"
  | "bits"
  | "backtrack"
  | "greedy"
  | "dp"
  | "knapsack"
  | "dp-seq"
  | "dp-pro"
  | "math"
  | "strings"
  | "atlas";

export interface Chapter {
  id: ChapterId;
  href: string;
  /** 章节编号展示:00–12,终章用 ✦ */
  num: string;
  /** 章节名(当前语言) */
  title: Loc<string>;
  /** 英文名 —— hero 眉题固定用它,同时是命令面板的搜索键(两种语言都可搜) */
  en: string;
  /** 一句话本质 */
  essence: Loc<string>;
  /** oklch 色相角,决定整章主题色 */
  hue: number;
  /** 难度 1–5,世界地图与侧栏展示 */
  level: 1 | 2 | 3 | 4 | 5;
  /** LeetCode 出现频率 1–5(5 = 顶级高频) */
  freq: 1 | 2 | 3 | 4 | 5;
  tags: Loc<string[]>;
}

export const CHAPTERS: Chapter[] = [
  {
    id: "home",
    href: "/",
    num: "00",
    title: { en: "Start Here · The Map", zh: "序章 · 算法地图" },
    en: "The Map & Recursion",
    essence: {
      en: "A data structure is a noun. An algorithm is a verb. This course teaches you to turn a problem into a sequence of decisions.",
      zh: "数据结构是名词,算法是动词 —— 这门课教你把问题变成一串决策。",
    },
    hue: 62,
    level: 1,
    freq: 5,
    tags: {
      en: ["Algorithmic thinking", "Recursion", "Four paradigms"],
      zh: ["算法思维", "递归", "四大范式"],
    },
  },
  {
    id: "sorting",
    href: "/sorting",
    num: "01",
    title: { en: "Sorting", zh: "排序" },
    en: "Sorting",
    essence: {
      en: "Sorting is a museum of algorithmic ideas. Every speedup comes from seeing the data in a new way.",
      zh: "排序是算法思想的展览馆:每一次变快,都是一种新的世界观。",
    },
    hue: 200,
    level: 1,
    freq: 4,
    tags: {
      en: ["Merge sort", "Quicksort", "Stability", "Quickselect"],
      zh: ["归并", "快排", "稳定性", "快速选择"],
    },
  },
  {
    id: "divide",
    href: "/divide",
    num: "02",
    title: { en: "Divide and Conquer", zh: "分治" },
    en: "Divide & Conquer",
    essence: {
      en: "Cut a large problem into smaller copies of itself, then trust the recursion to bring the answers back.",
      zh: "把大问题切成同款小问题,然后信任递归会把答案带回来。",
    },
    hue: 260,
    level: 2,
    freq: 3,
    tags: {
      en: ["Fast exponentiation", "Merging", "Recursion tree"],
      zh: ["快速幂", "归并思想", "递归树"],
    },
  },
  {
    id: "binary",
    href: "/binary",
    num: "03",
    title: { en: "Binary Search in Depth", zh: "二分进阶" },
    en: "Binary Search+",
    essence: {
      en: "When the answer is monotonic, finding it becomes guessing high or low.",
      zh: "只要答案有单调性,就能把「找答案」变成「猜大小」。",
    },
    hue: 178,
    level: 2,
    freq: 5,
    tags: {
      en: ["Boundaries", "Rotated arrays", "Binary search on the answer"],
      zh: ["找边界", "旋转数组", "二分答案"],
    },
  },
  {
    id: "bits",
    href: "/bits",
    num: "04",
    title: { en: "Bit Manipulation", zh: "位运算" },
    en: "Bit Manipulation",
    essence: {
      en: "One 32-bit int is 32 switches. AND, OR, NOT, and XOR are how you flip them.",
      zh: "一个 int 就是 32 盏灯 —— 与或非异或,拨的是开关。",
    },
    hue: 130,
    level: 2,
    freq: 3,
    tags: {
      en: ["XOR", "lowbit", "Bitmask state"],
      zh: ["异或", "lowbit", "状态压缩"],
    },
  },
  {
    id: "backtrack",
    href: "/backtrack",
    num: "05",
    title: { en: "Backtracking", zh: "回溯" },
    en: "Backtracking",
    essence: {
      en: "Trying every option is not brute force if you undo each wrong turn and take the next road.",
      zh: "穷举不是蛮干:走进死胡同就退一步换条路,仅此而已。",
    },
    hue: 330,
    level: 3,
    freq: 5,
    tags: {
      en: [
        "Decision tree",
        "Pruning",
        "Combinations and permutations",
        "Removing duplicates",
      ],
      zh: ["决策树", "剪枝", "组合排列", "去重"],
    },
  },
  {
    id: "greedy",
    href: "/greedy",
    num: "06",
    title: { en: "Greedy", zh: "贪心" },
    en: "Greedy",
    essence: {
      en: "Take the best option available at each step. The hard part is proving you will not regret it later.",
      zh: "每一步都拿眼前最好的 —— 难的不是贪,是证明贪完不后悔。",
    },
    hue: 85,
    level: 3,
    freq: 4,
    tags: {
      en: ["Exchange argument", "Intervals", "Jump Game"],
      zh: ["交换论证", "区间", "跳跃游戏"],
    },
  },
  {
    id: "dp",
    href: "/dp",
    num: "07",
    title: { en: "Dynamic Programming", zh: "动态规划入门" },
    en: "DP Basics",
    essence: {
      en: "Write down the answer to each subproblem once, then reuse it. That is all dynamic programming does.",
      zh: "把算过的子问题记下来,别再算第二遍 —— 这就是 DP 的全部要点。",
    },
    hue: 292,
    level: 4,
    freq: 5,
    tags: {
      en: ["Memoization", "Bottom-up", "Grid DP", "House Robber"],
      zh: ["记忆化", "递推", "网格DP", "打家劫舍"],
    },
  },
  {
    id: "knapsack",
    href: "/knapsack",
    num: "08",
    title: { en: "Knapsack Problems", zh: "背包问题" },
    en: "Knapsack",
    essence: {
      en: "Limited capacity, maximum value. Many DP interview questions are this problem in disguise.",
      zh: "容量有限,价值最大 —— 大量 DP 面试题都是它换的皮。",
    },
    hue: 230,
    level: 4,
    freq: 5,
    tags: {
      en: ["0/1 knapsack", "Unbounded knapsack", "Rolling array"],
      zh: ["0-1背包", "完全背包", "滚动数组"],
    },
  },
  {
    id: "dp-seq",
    href: "/dp-seq",
    num: "09",
    title: { en: "Subsequence DP", zh: "子序列 DP" },
    en: "Subsequence DP",
    essence: {
      en: "The whole relationship between two sequences fits in one two-dimensional table.",
      zh: "两个序列的关系,全写在一张二维表格里。",
    },
    hue: 355,
    level: 4,
    freq: 5,
    tags: {
      en: ["LIS", "LCS", "Edit distance", "Palindromes"],
      zh: ["LIS", "LCS", "编辑距离", "回文"],
    },
  },
  {
    id: "dp-pro",
    href: "/dp-pro",
    num: "10",
    title: { en: "Advanced DP", zh: "DP 进阶" },
    en: "Advanced DP",
    essence: {
      en: "State machines, intervals, trees, and bitmasks: four advanced maps of the DP world.",
      zh: "状态机、区间、树形、状压 —— DP 世界的四张高级地图。",
    },
    hue: 310,
    level: 5,
    freq: 4,
    tags: {
      en: ["Stock series", "Interval DP", "Tree DP", "Bitmask DP"],
      zh: ["股票系列", "区间DP", "树形DP", "状压DP"],
    },
  },
  {
    id: "math",
    href: "/math",
    num: "11",
    title: { en: "Math & Number Theory", zh: "数学与数论" },
    en: "Math & Number Theory",
    essence: {
      en: "Math problems in interviews rarely test math. They test whether you can find the quantity that never changes.",
      zh: "数学题不考数学,考的是你能不能找到那个不变量。",
    },
    hue: 45,
    level: 3,
    freq: 3,
    tags: {
      en: ["Modular arithmetic", "Primes", "Game theory", "Majority vote"],
      zh: ["取模", "质数", "博弈", "摩尔投票"],
    },
  },
  {
    id: "strings",
    href: "/strings",
    num: "12",
    title: { en: "String Algorithms", zh: "字符串算法" },
    en: "String Algorithms",
    essence: {
      en: "The core idea of KMP: every failed comparison tells you something useful about the next one.",
      zh: "KMP 的精髓:把每一次失败,都变成下一次的情报。",
    },
    hue: 152,
    level: 4,
    freq: 3,
    tags: {
      en: ["KMP", "Rolling hash", "Manacher"],
      zh: ["KMP", "滚动哈希", "Manacher"],
    },
  },
  {
    id: "atlas",
    href: "/atlas",
    num: "✦",
    title: { en: "Finale · Paradigm Atlas", zh: "终章 · 范式地图" },
    en: "Paradigm Atlas",
    essence: {
      en: "The moment you read a problem, which approach should come to mind first?",
      zh: "看到题目的那一刻,你脑子里应该先想到哪个范式?",
    },
    hue: 62,
    level: 5,
    freq: 5,
    tags: {
      en: ["Choosing a paradigm", "Master problem list", "Mock interviews"],
      zh: ["选型决策", "高频题总表", "模拟面试"],
    },
  },
];

export function chapterByPath(path: string): Chapter {
  if (path === "/") return CHAPTERS[0];
  const hit = CHAPTERS.find(
    (c) => c.href !== "/" && (path === c.href || path.startsWith(c.href + "/")),
  );
  return hit ?? CHAPTERS[0];
}

/** 侧栏 / 命令面板的副标。
 *  中文界面下显示章节的英文名,作为术语对照;
 *  英文界面下标题本身就是英文,再显示一遍只是重复,所以留空。 */
export function subLabel(c: Chapter): Loc<string> {
  return { en: "", zh: c.en };
}

export function prevNext(id: ChapterId): { prev?: Chapter; next?: Chapter } {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  return {
    prev: i > 0 ? CHAPTERS[i - 1] : undefined,
    next: i >= 0 && i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : undefined,
  };
}
