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
  title: string;
  /** 英文副标 —— hero 大字与侧栏小字 */
  en: string;
  /** 一句话本质 */
  essence: string;
  /** oklch 色相角,决定整章主题色 */
  hue: number;
  /** 难度 1–5,世界地图与侧栏展示 */
  level: 1 | 2 | 3 | 4 | 5;
  /** LeetCode 出现频率 1–5(5 = 顶级高频) */
  freq: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: "home",
    href: "/",
    num: "00",
    title: "序章 · 算法地图",
    en: "The Map & Recursion",
    essence: "数据结构是名词,算法是动词 —— 这门课教你把问题变成一串决策。",
    hue: 62,
    level: 1,
    freq: 5,
    tags: ["算法思维", "递归", "四大范式"],
  },
  {
    id: "sorting",
    href: "/sorting",
    num: "01",
    title: "排序",
    en: "Sorting",
    essence: "排序是算法思想的展览馆:每一次变快,都是一种新的世界观。",
    hue: 200,
    level: 1,
    freq: 4,
    tags: ["归并", "快排", "稳定性", "快速选择"],
  },
  {
    id: "divide",
    href: "/divide",
    num: "02",
    title: "分治",
    en: "Divide & Conquer",
    essence: "把大问题切成同款小问题,然后信任递归会把答案带回来。",
    hue: 260,
    level: 2,
    freq: 3,
    tags: ["快速幂", "归并思想", "递归树"],
  },
  {
    id: "binary",
    href: "/binary",
    num: "03",
    title: "二分进阶",
    en: "Binary Search+",
    essence: "只要答案有单调性,就能把「找答案」变成「猜大小」。",
    hue: 178,
    level: 2,
    freq: 5,
    tags: ["找边界", "旋转数组", "二分答案"],
  },
  {
    id: "bits",
    href: "/bits",
    num: "04",
    title: "位运算",
    en: "Bit Manipulation",
    essence: "一个 int 就是 32 盏灯 —— 与或非异或,拨的是开关。",
    hue: 130,
    level: 2,
    freq: 3,
    tags: ["异或", "lowbit", "状态压缩"],
  },
  {
    id: "backtrack",
    href: "/backtrack",
    num: "05",
    title: "回溯",
    en: "Backtracking",
    essence: "穷举不是蛮干:走进死胡同就退一步换条路,仅此而已。",
    hue: 330,
    level: 3,
    freq: 5,
    tags: ["决策树", "剪枝", "组合排列", "去重"],
  },
  {
    id: "greedy",
    href: "/greedy",
    num: "06",
    title: "贪心",
    en: "Greedy",
    essence: "每一步都拿眼前最好的 —— 难的不是贪,是证明贪完不后悔。",
    hue: 85,
    level: 3,
    freq: 4,
    tags: ["交换论证", "区间", "跳跃游戏"],
  },
  {
    id: "dp",
    href: "/dp",
    num: "07",
    title: "动态规划入门",
    en: "DP Basics",
    essence: "把算过的子问题记下来,别再算第二遍 —— 这就是 DP 的全部魔法。",
    hue: 292,
    level: 4,
    freq: 5,
    tags: ["记忆化", "递推", "网格DP", "打家劫舍"],
  },
  {
    id: "knapsack",
    href: "/knapsack",
    num: "08",
    title: "背包问题",
    en: "Knapsack",
    essence: "容量有限,价值最大 —— 一半的 DP 面试题都是它换的皮。",
    hue: 230,
    level: 4,
    freq: 5,
    tags: ["0-1背包", "完全背包", "滚动数组"],
  },
  {
    id: "dp-seq",
    href: "/dp-seq",
    num: "09",
    title: "子序列 DP",
    en: "Subsequence DP",
    essence: "两个序列的恩怨,全写在一张二维表格里。",
    hue: 355,
    level: 4,
    freq: 5,
    tags: ["LIS", "LCS", "编辑距离", "回文"],
  },
  {
    id: "dp-pro",
    href: "/dp-pro",
    num: "10",
    title: "DP 进阶",
    en: "Advanced DP",
    essence: "状态机、区间、树形、状压 —— DP 世界的四张高级地图。",
    hue: 310,
    level: 5,
    freq: 4,
    tags: ["股票系列", "区间DP", "树形DP", "状压DP"],
  },
  {
    id: "math",
    href: "/math",
    num: "11",
    title: "数学与数论",
    en: "Math & Number Theory",
    essence: "数学题不考数学,考的是你能不能找到那个不变量。",
    hue: 45,
    level: 3,
    freq: 3,
    tags: ["取模", "质数", "博弈", "摩尔投票"],
  },
  {
    id: "strings",
    href: "/strings",
    num: "12",
    title: "字符串算法",
    en: "String Algorithms",
    essence: "KMP 的精髓:把每一次失败,都变成下一次的情报。",
    hue: 152,
    level: 4,
    freq: 3,
    tags: ["KMP", "滚动哈希", "Manacher"],
  },
  {
    id: "atlas",
    href: "/atlas",
    num: "✦",
    title: "终章 · 范式地图",
    en: "Paradigm Atlas",
    essence: "看到题目的那一刻,你脑子里应该亮起哪盏灯?",
    hue: 62,
    level: 5,
    freq: 5,
    tags: ["选型决策", "高频题总表", "模拟面试"],
  },
];

export function chapterByPath(path: string): Chapter {
  if (path === "/") return CHAPTERS[0];
  const hit = CHAPTERS.find(
    (c) => c.href !== "/" && (path === c.href || path.startsWith(c.href + "/")),
  );
  return hit ?? CHAPTERS[0];
}

export function prevNext(id: ChapterId): { prev?: Chapter; next?: Chapter } {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  return {
    prev: i > 0 ? CHAPTERS[i - 1] : undefined,
    next: i >= 0 && i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : undefined,
  };
}
