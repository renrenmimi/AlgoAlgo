"use client";

// 序章 · 算法地图 —— 全书入口。
// 四件事:① 建立「算法 = 把问题变成一串决策」的第一直觉(高斯求和);
// ② 划清与姊妹篇 DataData 的分工边界;③ 递归 —— 全书的地基(调用栈实验室);
// ④ 四大范式鸟瞰 + 13 章世界地图 + 怎么用这套课。
//
// 数字口径(改文案前先核对):
//   章节 13 = CHAPTERS 去掉序章(01–12 + 终章),与世界地图的卡片数一致;
//   题目 147 = lib/*-data.tsx 里 lc: 条目总数(其中 131 个不同的 LeetCode 题号);
//   语言 3 = CodeTabs 的 Java / Python / JavaScript;
//   范式 4 = 回溯 / 分治 / 贪心 / DP。

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import "./home.css";
import { CHAPTERS } from "@/lib/curriculum";
import { T, useL, type Loc } from "@/lib/i18n";
import {
  Reveal,
  Section,
  Callout,
  BigO,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { Quiz, type QuizItem } from "@/lib/quiz";
import { CodeTabs } from "@/lib/code";
import { HeroDecision, RecursionLab } from "./home-viz";

/* ---------- 与 DataData 的分工表 ---------- */

// 跨课引用已按 DataData/lib/curriculum.ts 的编号核对:
// 01 数组 · 04 栈 · 05 队列 · 07 二叉树 · 09 堆 · 11 并查集 · 12 图。
const BOUNDARY: { id: string; topic: ReactNode; where: ReactNode; note: ReactNode }[] = [
  {
    id: "two-pointers",
    topic: <T en="Two pointers / sliding window" zh="双指针 / 滑动窗口" />,
    where: <T en="DataData · 01 Array" zh="DataData · 01 数组" />,
    note: (
      <T
        en="Both techniques depend on elements being stored next to each other. The array chapter walks through them frame by frame."
        zh="两者都依赖「元素连续存放」,数组章已经逐帧讲透。"
      />
    ),
  },
  {
    id: "monotonic",
    topic: <T en="Monotonic stack / monotonic queue" zh="单调栈 / 单调队列" />,
    where: <T en="DataData · 04 Stack · 05 Queue" zh="DataData · 04 栈 · 05 队列" />,
    note: (
      <T
        en="They are advanced ways of using a stack and a queue, not separate paradigms."
        zh="它们是栈和队列的高级用法,不是独立范式。"
      />
    ),
  },
  {
    id: "tree-traversal",
    topic: <T en="Tree DFS / BFS and level-order variants" zh="树的 DFS / BFS、层序变式" />,
    where: <T en="DataData · 07 Binary Tree" zh="DataData · 07 二叉树" />,
    note: (
      <T
        en="The first place recursion is applied to a real structure."
        zh="递归第一次用在真实结构上的地方。"
      />
    ),
  },
  {
    id: "heap",
    topic: <T en="Heaps and Top-K" zh="堆与 Top-K" />,
    where: <T en="DataData · 09 Heap" zh="DataData · 09 堆" />,
    note: (
      <T
        en="The kth largest element comes back in chapter 1 of this course, solved with Quickselect instead."
        zh="第 K 大会在本课第 1 章重逢,那里换成 Quickselect 解。"
      />
    ),
  },
  {
    id: "graph",
    topic: <T en="Topological sort / Dijkstra / union-find" zh="拓扑排序 / Dijkstra / 并查集" />,
    where: <T en="DataData · 11 Union-Find · 12 Graph" zh="DataData · 11 并查集 · 12 图" />,
    note: (
      <T
        en="Graph algorithms are easiest to learn together with the graph structure itself."
        zh="图上算法跟着图结构一起学最顺。"
      />
    ),
  },
  {
    id: "here",
    topic: (
      <T
        en="Sorting / divide and conquer / binary search on the answer / backtracking / greedy / DP / bit manipulation / math / string algorithms"
        zh="排序 / 分治 / 二分答案 / 回溯 / 贪心 / DP / 位运算 / 数学 / 字符串算法"
      />
    ),
    where: <T en="This course (AlgoAlgo)" zh="本课(AlgoAlgo)" />,
    note: (
      <T
        en="Algorithms that do not depend on one particular structure. All of them are here."
        zh="不依附特定结构的「纯算法」,全在这里。"
      />
    ),
  },
];

/* ---------- 复杂度六档速览(完整课在 DataData 序章) ---------- */

const TIERS: { o: string; name: ReactNode; meet: ReactNode }[] = [
  {
    o: "1",
    name: <T en="Constant" zh="常数" />,
    meet: (
      <T
        en="Gauss's formula, bit tricks: a fixed number of operations, whatever the input size."
        zh="高斯公式、位运算技巧:操作次数固定,与规模无关。"
      />
    ),
  },
  {
    o: "logn",
    name: <T en="Logarithmic" zh="对数" />,
    meet: (
      <T
        en="Binary search and binary search on the answer: each step discards half of the remaining candidates."
        zh="二分查找、二分答案:每一步砍掉一半候选。"
      />
    ),
  },
  {
    o: "n",
    name: <T en="Linear" zh="线性" />,
    meet: (
      <T
        en="One pass over the data: greedy, Kadane's algorithm, one-dimensional DP."
        zh="一次遍历:贪心、Kadane、一维 DP。"
      />
    ),
  },
  {
    o: "nlogn",
    name: <T en="Linearithmic" zh="线性对数" />,
    meet: (
      <T
        en="Merge sort, heapsort, quicksort on average. No sort that only compares elements can beat Ω(n log n)."
        zh="归并排序、堆排序、平均情况下的快排。只靠比较元素的排序,下界就是 Ω(n log n)。"
      />
    ),
  },
  {
    o: "n2",
    name: <T en="Quadratic" zh="平方" />,
    meet: (
      <T
        en="Two-dimensional DP tables and plain nested loops."
        zh="二维 DP 表格、朴素双重循环。"
      />
    ),
  },
  {
    o: "2n",
    name: <T en="Exponential" zh="指数" />,
    meet: (
      <T
        en="Enumerating every subset; backtracking with no pruning. This is the cost DP exists to remove."
        zh="子集枚举、没有剪枝的回溯 —— DP 要消掉的就是这个成本。"
      />
    ),
  },
];

/* ---------- 序章 Quiz ---------- */

const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "Which statement describes the relationship between data structures and algorithms most accurately?",
      zh: "「数据结构」和「算法」最贴切的关系是?",
    },
    opts: {
      en: [
        "A structure is a noun (how data is stored); an algorithm is a verb (how a problem is solved). Each one needs the other.",
        "An algorithm is a part of a data structure.",
        "They are two names for the same thing.",
        "Data structures matter more than algorithms.",
      ],
      zh: [
        "结构是名词(数据怎么放),算法是动词(问题怎么解)—— 互相成就",
        "算法是数据结构的一部分",
        "两者是同一个东西的两种叫法",
        "数据结构比算法更重要",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Neither one contains the other. Quicksort belongs to no particular structure, and a hash table is not an algorithm.",
        "How data is stored and how it is processed are two different questions. A hundred different algorithms can run on the same array.",
        "Neither is above the other. An algorithm on the wrong structure is slow, and a structure with no algorithm is only storage. Interviews test how you combine them.",
      ],
      zh: [
        undefined,
        "反了也不对 —— 二者谁也不包含谁:快排不属于任何结构,哈希表也不是算法。",
        "「怎么存」和「怎么算」是两个维度:同一个数组上可以跑一百种不同算法。",
        "没有高下:选错结构的算法会慢,没有算法的结构只是仓库。面试考的是二者的配合。",
      ],
    },
    why: {
      en: "The structure decides what each operation costs. The algorithm arranges operations into a solution. DataData teaches the nouns; this course teaches the verbs.",
      zh: "结构决定每种操作的成本,算法负责把操作串成解法。DataData 教名词,本课教动词。",
    },
  },
  {
    type: "choice",
    q: {
      en: "What does a recursive function need so that it does not call itself forever?",
      zh: "一个递归函数想要不无限递归,必须具备什么?",
    },
    opts: {
      en: [
        "A base case, plus arguments that move closer to it on every call",
        "No more than 1000 calls",
        "A call to itself as the last step (tail recursion)",
        "A while loop instead of an if statement",
      ],
      zh: [
        "基准情形(base case)+ 每次递归都向它靠近",
        "调用次数不超过 1000 次",
        "在函数末尾调用自己(尾递归)",
        "用 while 循环代替 if 判断",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "1000 is Python's default recursion limit, not a condition for correctness. A correct recursion may go only three levels deep.",
        "Tail recursion is one shape a recursion can take, not a requirement. fact(n) = n × fact(n−1) is not tail recursive and is still correct.",
        "Loops and recursion are two ways to write the same idea. Neither one requires the other.",
      ],
      zh: [
        undefined,
        "1000 只是 Python 的默认递归深度限制,不是递归正确性的条件 —— 正确的递归可能只递归 3 层。",
        "尾递归只是递归的一种形态,不是必要条件 —— fact(n) = n × fact(n−1) 不是尾递归,照样正确。",
        "循环和递归是两种写法,谁也不是谁的前提。",
      ],
    },
    why: {
      en: "Recursion needs two things: an exit that can be answered without recursing, and arguments that get closer to that exit on every call. Miss either one and the stack runs out of space.",
      zh: "递归两要素:① 有一个不用递归就能直接回答的出口;② 每次调用的参数都在向出口收敛。缺一个就会耗尽栈空间。",
    },
  },
  {
    type: "choice",
    q: {
      en: "fact(3) calls fact(n−1) at each level, down to fact(1). At most, how many fact frames are on the call stack at the same time?",
      zh: "调用 fact(3)(每层调 fact(n−1) 直到 fact(1)),调用栈里【最多】同时存在几个 fact 栈帧?",
    },
    opts: {
      en: [
        "3 — fact(3), fact(2), and fact(1) are on the stack together",
        "1, because each call finishes before the next one starts",
        "2",
        "There is no fixed limit",
      ],
      zh: [
        "3 个 —— fact(3)、fact(2)、fact(1) 同时挂在栈上",
        "1 个,算完一个才有下一个",
        "2 个",
        "无数个",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "fact(3) needs the result of fact(2) before it can continue, so it cannot leave. A waiting call stays on the stack.",
        "While fact(3) and fact(2) are both waiting, fact(1) is pushed as well: three frames at once.",
        "The base case fact(1) stops the descent, so the stack depth is at most the recursion depth n.",
      ],
      zh: [
        undefined,
        "fact(3) 必须等 fact(2) 的结果才能继续,所以它不能退场 —— 等待者会留在栈上。",
        "fact(3) 和 fact(2) 都在等待时,fact(1) 也要压栈:3 个同时在场。",
        "有基准情形 fact(1) 兜底,栈深最多就是递归深度 n。",
      ],
    },
    why: {
      en: "Recursion depth = maximum stack height = where the space cost comes from. Frame 3 of the lab above is exactly this moment.",
      zh: "递归深度 = 栈的最大高度 = 空间复杂度的来源。上面实验室的第 3 帧就是这个瞬间。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Adding 1+2+…+n one number at a time is O(n). What is the cost of the formula n(n+1)/2?",
      zh: "计算 1+2+…+n:逐个累加是 O(n),换成公式 n(n+1)/2 后是?",
    },
    opts: {
      en: [
        "O(1) — three arithmetic operations, independent of n",
        "O(log n)",
        "Still O(n), only with a smaller constant",
        "O(n²)",
      ],
      zh: ["O(1) —— 三次算术运算,与 n 无关", "O(log n)", "还是 O(n),只是常数更小", "O(n²)"],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "A logarithm comes from halving something repeatedly. Nothing is halved here; the answer is computed in one step.",
        "The formula contains no loop that grows with n. Whether n is 100 or a billion, it is one multiplication, one addition, and one division.",
        "O(n²) is the shape of a nested loop. Here there is not even a single loop.",
      ],
      zh: [
        undefined,
        "log 来自「每步砍一半」的过程,这里没有任何砍半 —— 是直接一步到位。",
        "公式里没有任何随 n 增长的循环:n 是 100 还是 10 亿,都是一次乘、一次加、一次除。",
        "n² 是双重循环的形状,这里连一重循环都没有。",
      ],
    },
    why: {
      en: "A better algorithm can change the growth rate itself, not just the constant factor. That is why this course exists: the same problem can cost wildly different amounts.",
      zh: "更好的算法可以改变增长趋势本身,而不只是常数 —— 这就是「算法」这门课存在的意义:同一个问题,成本可以差出好几个数量级。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which of these signal-to-paradigm rules are correct? (select all)",
      zh: "下面哪些「信号 → 范式」的直觉是对的?(多选)",
    },
    opts: {
      en: [
        "The same subproblem is solved again and again, and an optimal answer can be built from optimal answers to those subproblems → dynamic programming",
        "You can prove with an exchange argument that the best choice available now never makes the final answer worse → greedy",
        "The subproblems do not overlap and their answers can be combined → divide and conquer",
        "The input is sorted → you must use DP",
      ],
      zh: [
        "同一个子问题被反复求解,而且最优解可以由子问题的最优解拼出来 → 动态规划",
        "能用交换论证证明「当下最优不会让最终答案变差」 → 贪心",
        "子问题互不重叠、答案可以拼合 → 分治",
        "数据是有序的 → 一定要用 DP",
      ],
    },
    correct: [0, 1, 2],
    missHint: {
      en: "The first three are the signals for DP, greedy, and divide and conquer. Check which one you left out.",
      zh: "前三条分别是 DP、贪心、分治的招牌信号 —— 再检查你漏了哪条。",
    },
    extraHint: {
      en: "Sorted input points to binary search or two pointers, not to DP. And sorted order alone is not enough for binary search either: you need a yes/no test whose answer flips exactly once along the range.",
      zh: "「有序」的第一反应是二分或双指针,和 DP 没有必然关系。而且光「有序」也不够:二分需要一个沿着区间只翻转一次的判定条件。",
    },
    why: {
      en: "Choosing a paradigm starts with reading the signals: overlapping subproblems plus optimal substructure → DP; independent subproblems → divide and conquer; a provable local choice → greedy; none of these → backtracking as the fallback. The final chapter turns this into a decision map.",
      zh: "范式选择靠信号识别:重叠子问题 + 最优子结构 → DP;子问题独立 → 分治;局部最优可证 → 贪心;都不沾 → 回溯穷举兜底。终章的选型地图会把这套雷达练成条件反射。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          You binary search over 1024 candidate answers, discarding half of them
          at every step. About how many checks does the worst case need? (2¹⁰ =
          1024; enter an integer)
        </>
      ),
      zh: (
        <>
          对 1024 个候选答案做二分(每次砍掉一半),最坏需要大约多少次判定?(2¹⁰
          = 1024,输入整数)
        </>
      ),
    },
    placeholder: { en: "Enter an integer…", zh: "输入一个整数…" },
    answers: ["10", "10次"],
    hint: {
      en: "1024 → 512 → 256 → … → 1. Each step divides by 2. Count the divisions.",
      zh: "1024 → 512 → 256 → … → 1,每一步除以 2,数一数除了几次。",
    },
    why: {
      en: "log₂1024 = 10. This is the whole point of binary search: doubling the number of candidates adds only one more check. Chapter 3 pushes the idea further, including binary search on the answer.",
      zh: "log₂1024 = 10。二分的威力全在这里:候选翻一倍,成本只加一次 —— 第 3 章「二分进阶」会把它推到二分答案。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In an interview, why is it recommended to describe the brute-force solution first and improve it from there, instead of going straight to the optimal one?",
      zh: "面试时为什么建议「先说暴力解,再谈优化」,而不是直接甩最优解?",
    },
    opts: {
      en: [
        "The brute-force solution shows you understood the problem, and the steps you take to improve it show how you think. That is what the interview measures.",
        "Because brute force is faster to write and buys time",
        "Because the interviewer usually does not know the optimal solution",
        "There is no reason; it is just a convention",
      ],
      zh: [
        "暴力解证明你理解了问题,优化过程展示你的思考路径 —— 这正是面试想考察的",
        "因为暴力解写起来更快,能拖延时间",
        "因为面试官通常不知道最优解",
        "没有理由,只是行业惯例",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Stalling works against you. The real value is that the brute-force solution gives you and the interviewer a shared starting point, and it still earns credit if time runs out.",
        "The interviewer almost always knows the optimal solution. What they want to see is how you get there, not a memorized result.",
        "There is a method behind it. Every worked problem in this course follows brute force → why it can be improved → optimal, so you practise that path.",
      ],
      zh: [
        undefined,
        "拖时间是反效果 —— 重点是暴力解给了你和面试官一个共同的讨论起点,时间不够时还能兜底拿分。",
        "面试官几乎总是知道最优解 —— 他们想看的是你「怎么走到」最优解,而不是背诵结果。",
        "这是有方法论的:本课每道精讲都按「暴力 → 为什么能优化 → 最优」展开,练的就是这条路径。",
      ],
    },
    why: {
      en: "Brute force → optimization is a way of thinking you can reuse on any problem. The brute-force solution exposes the structure of the problem, and the waste you find in it (repeated work? a monotonic condition?) points to the paradigm that removes it.",
      zh: "「暴力 → 优化」是能复用到任何题上的思考框架:暴力解暴露问题结构,而它里面的浪费(重复计算?单调性?)会指向该用哪个范式。",
    },
  },
];

/* ---------- 首屏统计 ---------- */

// 数字全部按仓库实际内容核对过,见文件顶部的「数字口径」。
const STATS: { id: string; to: number; suffix?: string; label: Loc<string> }[] = [
  {
    id: "chapters",
    to: 13,
    label: { en: "chapters, easy to hard", zh: "章节 · 由易到难" },
  },
  {
    id: "problems",
    to: 147,
    label: { en: "worked LeetCode problems", zh: "LeetCode 高频题精讲" },
  },
  {
    id: "langs",
    to: 3,
    label: { en: "languages: Java / Py / JS", zh: "语言对照 Java/Py/JS" },
  },
  {
    id: "paradigms",
    to: 4,
    label: {
      en: "algorithm paradigms",
      zh: "大范式 回溯/分治/贪心/DP",
    },
  },
];

// 进场时数字从 0 滚到目标值(easeOutCubic);尊重「减弱动态」时直接落定。
function CountStat({
  to,
  suffix = "",
  label,
}: {
  to: number;
  suffix?: string;
  label: Loc<string>;
}) {
  const L = useL();
  const [n, setN] = useState(0);

  useEffect(() => {
    // 不要加「只跑一次」的 ref 守卫:StrictMode 会「挂载 → 清理 → 再挂载」,
    // 守卫会让第二次直接 return、不再排 rAF,数字永远停在 0。
    // 本 effect 自带 cancelAnimationFrame 清理,重复执行是安全的。
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(to);
      return;
    }
    const dur = 900;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(eased * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);

  return (
    <div className="home-stat">
      <div className="v">
        {n}
        {suffix}
      </div>
      <div className="k">{L(label)}</div>
    </div>
  );
}

/* ---------- 页面 ---------- */

export default function Home() {
  const L = useL();
  return (
    <main className="page" data-ch="home">
      {/* Hero */}
      <header className="home-hero">
        <div>
          <span className="home-kicker">
            <span className="pulse" />
            INTERACTIVE COURSE · <T en="DATADATA SISTER COURSE" zh="DATADATA 姊妹篇" />
          </span>
          <h1 className="hero-title">
            <T
              en={
                <>
                  Algorithms,
                  <br />
                  <span className="grad">in slow motion</span>
                </>
              }
              zh={
                <>
                  把算法
                  <br />
                  <span className="grad">拆成慢动作</span>
                </>
              }
            />
          </h1>
          <p className="hero-essence">
            <T
              en={
                <>
                  Decision trees expand one frame at a time, DP tables fill in
                  cell by cell, and search ranges shrink step by step. Every
                  chapter follows the same path: the idea in plain words, a
                  visualization you can step through,{" "}
                  <strong>Java / Python / JavaScript</strong> side by side, and
                  worked LeetCode problems. You watch how an algorithm decides
                  instead of memorizing its code.
                </>
              }
              zh={
                <>
                  决策树逐帧展开、DP 表格逐格填充、候选区间一步步收窄 ——
                  每一章:直觉故事 → 可视化拆解 →{" "}
                  <strong>Java / Python / JavaScript</strong>{" "}
                  三语言对照 → LeetCode 高频精讲。看见算法怎么做决定,而不是背它的代码。
                </>
              }
            />
          </p>
          <div className="home-cta">
            <Link href="/sorting" className="btn btn-primary cta-go">
              <T en="Start with chapter 1 · Sorting" zh="从第 1 章 · 排序开始" />{" "}
              <span className="cta-arrow" aria-hidden="true">→</span>
            </Link>
            <a href="#map" className="btn">
              <T en="See the map" zh="看世界地图" />
            </a>
          </div>
          <div className="home-stats">
            {STATS.map((s) => (
              <CountStat key={s.id} to={s.to} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </div>
        <Reveal delay={150}>
          <HeroDecision />
        </Reveal>
      </header>

      {/* §01 算法是什么 */}
      <Section
        id="what"
        index="01"
        title={{ en: "What is an algorithm, exactly?", zh: "算法到底是什么?" }}
        desc={{
          en: "One old story about a schoolboy adding numbers contains the whole subject of this course",
          zh: "一个关于小学生求和的老故事,讲完了这门课的全部主题",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  A story is often told about the mathematician Carl Friedrich
                  Gauss. His teacher, wanting a quiet half hour, asked the class
                  to add up every number from 1 to 100. The other children
                  started adding one number at a time: 1+2=3, 3+3=6, 6+4=10.
                  Gauss handed in an answer within seconds. He had noticed that
                  1+100=101, 2+99=101, 3+98=101, and so on — 50 pairs, each one
                  adding up to 101, so the total is{" "}
                  <strong>50 × 101 = 5050</strong>. The details of the story are
                  not reliably documented and versions of it differ. The
                  arithmetic is the part that matters here.
                </>
              }
              zh={
                <>
                  关于数学家高斯有一个流传很广的故事:老师为了清静半小时,
                  让全班把 1 加到 100。别的孩子都在逐个累加 1+2=3、3+3=6、6+4=10……
                  高斯几秒钟就交了卷。他发现 1+100=101、2+99=101、3+98=101 ——
                  一共 50 对,每对都是 101,所以答案是
                  <strong> 50 × 101 = 5050</strong>。
                  这个故事的细节没有可靠记载,不同版本的说法也不一样。
                  这里真正重要的是那笔算术。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The class was running one algorithm:{" "}
                  <strong>add the numbers one at a time, so n numbers take n
                  additions</strong>. Double the input size and the work doubles
                  — O(n). Gauss was running a different one:{" "}
                  <strong>pair the numbers up, then do three arithmetic
                  operations</strong>. That takes the same time whether n is 100
                  or a billion — O(1). Same problem, two correct answers, and a
                  whole tier of cost between them.
                </>
              }
              zh={
                <>
                  全班同学执行的是一种算法:<strong>逐个累加,n 个数就加 n 次</strong>,
                  规模翻倍,时间翻倍 —— O(n)。高斯执行的是另一种算法:
                  <strong>配对求和,三次算术运算</strong>,n 是 100 还是 10 亿都一样 ——
                  O(1)。同一个问题、同样正确的两个答案,成本却隔着一整个档位。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  That is what an <strong>algorithm</strong> is: a sequence of
                  steps that solves a problem, where{" "}
                  <strong>every step is unambiguous and the sequence is
                  guaranteed to stop</strong>. An algorithm is the recipe, not
                  the meal. One dish can have many recipes. This course teaches
                  you to read the classic recipes and to judge which one is
                  better.
                </>
              }
              zh={
                <>
                  这就是<strong>算法(algorithm)</strong>:解决一个问题的、
                  <strong>每一步都无歧义且必然终止</strong>的操作序列。它是菜谱,不是菜 ——
                  同一道菜可以有很多份菜谱,而这门课教的就是:怎么读懂经典菜谱,
                  以及怎么判断哪份菜谱更好。
                </>
              }
            />
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">STANDARD 01</div>
            <div className="card-title">
              <T en="✅ First, it must be correct" zh="✅ 首先要对" />
            </div>
            <p>
              <T
                en={
                  <>
                    Correct for <b>every</b> input: an empty array, a single
                    element, repeated values, negative numbers, and values at the
                    edge of the integer range. Interview code usually fails on an
                    edge case, not on the main idea.
                  </>
                }
                zh={
                  <>
                    对<b>所有</b>输入都对:空数组、单元素、重复值、负数、溢出边界。
                    面试里挂掉的代码,大多死在边界而不是思路。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">STANDARD 02</div>
            <div className="card-title">
              <T en="⚡ Then, fast and small" zh="⚡ 然后要快、要省" />
            </div>
            <p>
              <T
                en={
                  <>
                    Big-O measures how the cost grows as the input gets larger.
                    Keep two separate accounts: time and space. The gap between
                    Gauss and the class is the gap between O(1) and O(n).
                  </>
                }
                zh={
                  <>
                    用 Big-O 度量「规模变大时成本的增长趋势」:时间和空间各记一笔账。
                    高斯和全班的差距,就是 O(1) 和 O(n) 的差距。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">STANDARD 03</div>
            <div className="card-title">
              <T en="Finally, you must be able to explain it" zh="最后要讲得清" />
            </div>
            <p>
              <T
                en={
                  <>
                    You have to be able to say why it is correct and why it is
                    fast. A greedy solution needs an exchange argument. A DP
                    solution needs a state definition and a transition. &quot;I
                    have seen this problem before&quot; does not survive a
                    follow-up question.
                  </>
                }
                zh={
                  <>
                    为什么对、为什么快,要能说出来 —— 贪心要给交换论证,
                    DP 要给状态定义和转移。「我背过这题」在追问面前一文不值。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="story"
          title={{ en: "Where the word algorithm comes from", zh: "为什么叫 algorithm" }}
        >
          <p>
            <T
              en={
                <>
                  The word comes from the name of the 9th-century Persian
                  mathematician <b>al-Khwārizmī</b>. His book on the rules for
                  calculating with Indian-Arabic numerals reached Europe, and
                  &quot;calculating in al-Khwārizmī&apos;s way&quot; gradually
                  became <i>algorithm</i>. So from the start the word meant
                  following a precise set of steps. It has nothing to do with
                  computers. Computers only made following steps very fast.
                </>
              }
              zh={
                <>
                  这个词来自 9 世纪波斯数学家<b>花拉子米(al-Khwārizmī)</b>的名字 ——
                  他那本讲印度-阿拉伯数字运算规则的书传入欧洲后,「按花拉子米的方法算」
                  渐渐变成了 algorithm。所以这个词从诞生起就是「按明确步骤办事」的意思,
                  和计算机没关系 —— 计算机只是把「按步骤办事」变得极快而已。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* §02 与 DataData 的分工 */}
      <Section
        id="boundary"
        index="02"
        title={{
          en: "How does this course relate to DataData?",
          zh: "这门课和 DataData 是什么关系?",
        }}
        desc={{
          en: "A structure is a noun, an algorithm is a verb. Together the two courses cover data structures and algorithms.",
          zh: "结构是名词,算法是动词 —— 两门课拼成完整的 DSA",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The sister course <strong>DataData</strong> answers the
                  question &quot;how is data <strong>stored</strong>?&quot;:
                  arrays, linked lists, hash tables, trees, heaps, graphs, and
                  what each operation costs on each of them. This course answers
                  &quot;how is a problem <strong>solved</strong>?&quot;: sorting,
                  binary search, backtracking, greedy, dynamic programming —{" "}
                  <strong>algorithms that do not belong to any one
                  structure</strong>.
                </>
              }
              zh={
                <>
                  姊妹篇 <strong>DataData(看得见的数据结构)</strong>回答「数据怎么
                  <strong>放</strong>」:数组、链表、哈希表、树、堆、图……
                  每种结构上每种操作的成本。
                  本课回答「问题怎么<strong>解</strong>」:排序、二分、回溯、贪心、动态规划……
                  <strong>不依附于某个特定结构的纯算法</strong>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Some techniques only make sense on one structure: two pointers
                  on an array, a monotonic stack on a stack. DataData already
                  covers those, so this course does not repeat them. It links to
                  them where they come up.
                </>
              }
              zh={
                <>
                  有些套路只在某个结构上才成立(双指针长在数组上、单调栈长在栈上),
                  那些已经在 DataData 讲透了,本课不再重复 —— 遇到时会给出跳转指引:
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
                  <T en="Technique" zh="套路" />
                </th>
                <th>
                  <T en="Where it is taught" zh="在哪学" />
                </th>
                <th>
                  <T en="Why" zh="说明" />
                </th>
              </tr>
            </thead>
            <tbody>
              {BOUNDARY.map((r) => (
                <tr key={r.id}>
                  <td><b>{r.topic}</b></td>
                  <td>{r.where}</td>
                  <td>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout
          tone="idea"
          title={{ en: "Suggested order", zh: "推荐的学习方式" }}
        >
          <p>
            <T
              en={
                <>
                  If you have not studied data structures yet, finish the first
                  nine chapters of DataData first (at least through the heap
                  chapter), then start here. This course assumes you already know
                  what an array, a hash table, a tree, and a stack are. If you
                  already know the structures, start with chapter 1 on sorting.
                  This course stands on its own from there.
                </>
              }
              zh={
                <>
                  如果你还没学过数据结构,建议先完成 DataData 的前 9 章(至少到「堆」),
                  再开始本课 —— 本课默认你已经知道数组、哈希表、树、栈是什么。
                  如果你已经会结构,直接从第 1 章「排序」出发即可,本课自成闭环。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* §03 递归 */}
      <Section
        id="recursion"
        index="03"
        title={{
          en: "Recursion: the foundation of everything that follows",
          zh: "递归:全书的地基",
        }}
        desc={{
          en: "Divide and conquer is recursive, backtracking is recursive, and the first version of a DP solution is recursive too. Make this solid first.",
          zh: "分治在递归、回溯在递归、DP 的第一步还是递归 —— 先把它焊死",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <strong>Recursion</strong> means a function calls itself. It
                  sounds circular: the answer to fact(3) depends on fact(2),
                  which depends on fact(1). But as long as there is someone at
                  the end of the line who{" "}
                  <strong>knows the answer without asking anyone else</strong>,
                  the answers travel back up. That case is called the{" "}
                  <strong>base case</strong>.
                </>
              }
              zh={
                <>
                  <strong>递归(recursion)</strong>就是函数调用自己。听起来像悖论:
                  「fact(3) 的答案依赖 fact(2),fact(2) 依赖 fact(1)……」——
                  但只要队伍的尽头有一个<strong>不需要问别人就知道答案的人</strong>,
                  答案就能一路传回来。那个人叫<strong>基准情形(base case)</strong>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Recursion is not magic. It is real pushing and popping on the{" "}
                  <strong>call stack</strong>. Step through the life of fact(3)
                  and watch it happen:
                </>
              }
              zh={
                <>
                  递归不是玄学,是<strong>调用栈(call stack)</strong>上实实在在的压栈与弹栈。
                  亲眼看一遍 fact(3) 的一生:
                </>
              }
            />
          </p>
        </div>
        <RecursionLab />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="ELEMENT 01" zh="要素 01" />
            </div>
            <div className="card-title">
              <T en="Base case" zh="基准情形" />
            </div>
            <p>
              <T
                en={
                  <>
                    The exit that can be answered without recursing: fact(1) = 1,
                    or an empty array summing to 0. <b>Write it first</b>. A
                    recursion with no exit never stops.
                  </>
                }
                zh={
                  <>
                    不用递归就能直接回答的出口:fact(1)=1、空数组返回 0。
                    <b>先写它,再写别的</b> —— 没有出口的递归永远不会停。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="ELEMENT 02" zh="要素 02" />
            </div>
            <div className="card-title">
              <T en="Trust the recursive call" zh="递归信任" />
            </div>
            <p>
              <T
                en={
                  <>
                    When you write fact(n),{" "}
                    <b>assume fact(n−1) already returns the correct answer</b>,
                    and work out only how to build fact(n) from it. Do not try to
                    expand three levels of calls in your head.
                  </>
                }
                zh={
                  <>
                    写 fact(n) 时,<b>直接相信 fact(n−1) 会返回正确答案</b>,
                    只管怎么用它拼出 fact(n)。不要在脑子里展开三层调用。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="ELEMENT 03" zh="要素 03" />
            </div>
            <div className="card-title">
              <T en="Converging state" zh="状态收敛" />
            </div>
            <p>
              <T
                en={
                  <>
                    Every call must <b>move closer to the base case</b>: n−1, half
                    of the range, one level further down the tree. How it
                    converges is the shape of every algorithm in this course.
                  </>
                }
                zh={
                  <>
                    每次调用都必须<b>向基准情形靠近</b>:n−1、区间砍半、树往下走一层。
                    收敛方式,就是后面每个算法的「形状」。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <CodeTabs
          title="factorial"
          java={{
            // 两种语言的代码行数与可执行部分必须逐字相同,只有注释不同(hl 靠行号对齐)。
            code: {
              en: `// Factorial: the hello world of recursion
public long fact(int n) {
    if (n <= 1) return 1;      // (1) base case: the exit
    return n * fact(n - 1);    // (2) trust fact(n-1), build on it
}                              // (3) n-1 moves toward the exit`,
              zh: `// 阶乘:递归的 hello world
public long fact(int n) {
    if (n <= 1) return 1;      // ① 基准情形:出口
    return n * fact(n - 1);    // ② 信任 fact(n-1),用它拼答案
}                              // ③ n-1 在向出口收敛`,
            },
            note: {
              en: (
                <>
                  <b>Watch out:</b> a JVM thread stack is typically about 512 KB
                  to 1 MB, so a recursion tens of thousands of levels deep throws{" "}
                  <code>StackOverflowError</code>. For deep recursion, rewrite it
                  as a loop or manage an explicit stack yourself.
                </>
              ),
              zh: (
                <>
                  <b>注意:</b>JVM 线程栈通常约 512KB~1MB,递归几万层就会{" "}
                  <code>StackOverflowError</code> —— 深递归要么改迭代,要么显式用栈模拟。
                </>
              ),
            },
            hl: [3, 4],
          }}
          python={{
            code: {
              en: `# Factorial: the hello world of recursion
def fact(n: int) -> int:
    if n <= 1:            # (1) base case: the exit
        return 1
    return n * fact(n - 1)  # (2) trust fact(n-1), build on it
                            # (3) n-1 moves toward the exit`,
              zh: `# 阶乘:递归的 hello world
def fact(n: int) -> int:
    if n <= 1:            # ① 基准情形:出口
        return 1
    return n * fact(n - 1)  # ② 信任 fact(n-1),用它拼答案
                            # ③ n-1 在向出口收敛`,
            },
            note: {
              en: (
                <>
                  <b>Watch out:</b> Python&apos;s default recursion limit is{" "}
                  <b>1000</b> (<code>RecursionError</code>). For deep recursion,
                  call <code>sys.setrecursionlimit(10**6)</code> or rewrite the
                  function as a loop.
                </>
              ),
              zh: (
                <>
                  <b>注意:</b>Python 默认递归深度上限 <b>1000</b>(
                  <code>RecursionError</code>)。刷题遇到深递归,记得{" "}
                  <code>sys.setrecursionlimit(10**6)</code> 或改成迭代。
                </>
              ),
            },
            hl: [3, 5],
          }}
          js={{
            code: {
              en: `// Factorial: the hello world of recursion
function fact(n) {
  if (n <= 1) return 1;      // (1) base case: the exit
  return n * fact(n - 1);    // (2) trust fact(n-1), build on it
}                            // (3) n-1 moves toward the exit`,
              zh: `// 阶乘:递归的 hello world
function fact(n) {
  if (n <= 1) return 1;      // ① 基准情形:出口
  return n * fact(n - 1);    // ② 信任 fact(n-1),用它拼答案
}                            // ③ n-1 在向出口收敛`,
            },
            note: {
              en: (
                <>
                  <b>Watch out:</b> JavaScript engines allow roughly ten thousand
                  to a few tens of thousands of frames, depending on the engine.
                  Past that you get{" "}
                  <code>RangeError: Maximum call stack size exceeded</code>. Tail
                  call optimization is in the language specification, but among
                  the major engines only JavaScriptCore (Safari) implements it.
                </>
              ),
              zh: (
                <>
                  <b>注意:</b>JS 引擎栈深约 1 万~几万层(因引擎而异),超了抛{" "}
                  <code>RangeError: Maximum call stack size exceeded</code>。
                  规范里的尾调用优化,主流引擎中只有 JavaScriptCore(Safari)真的实现了。
                </>
              ),
            },
            hl: [3, 4],
          }}
        />
        <Callout
          tone="warn"
          title={{
            en: "A common mistake: expanding the recursion in your head",
            zh: "新手最容易犯的错:试图在脑内展开递归",
          }}
        >
          <p>
            <T
              en={
                <>
                  To check whether a recursion is correct you only need three
                  questions: <b>(1) Is the exit right? (2) Assuming every
                  recursive call returns the correct answer, does this level
                  combine them correctly? (3) Are the arguments converging?</b>{" "}
                  If all three hold, the whole recursion is correct. This is
                  mathematical induction. It is not a shortcut; it is the only
                  way of checking that keeps working as the problem grows.
                  Chapter 2 on divide and conquer and chapter 5 on backtracking
                  show it applied to trees and to decision trees.
                </>
              }
              zh={
                <>
                  检查递归对不对,只需要三问:<b>① 出口对吗?② 假设子调用全对,
                  这一层拼得对吗?③ 参数在收敛吗?</b>三个都对,整个递归就对 ——
                  这就是数学归纳法,不是偷懒,而是问题变大后唯一还管用的检查方式。
                  想看它在树上、在决策树上怎么用,第 2 章分治和第 5 章回溯见。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* §04 四大范式 */}
      <Section
        id="paradigms"
        index="04"
        title={{
          en: "The four paradigms: the frame of the whole course",
          zh: "四大范式鸟瞰:整门课的骨架",
        }}
        desc={{
          en: "Hundreds of problems, four ways of thinking about them, plus a small set of tools",
          zh: "几百道题,背后只有四种解题思路 + 一盒工具",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  LeetCode has thousands of problems and the labels on them sound
                  endless. But once you set aside the techniques that belong to a
                  particular data structure, there are only four ways of
                  approaching a problem. Get familiar with them here. Every
                  chapter comes back to this set:
                </>
              }
              zh={
                <>
                  LeetCode 有几千道题,标签听起来五花八门,
                  但把「依附于某个结构的套路」拿掉之后,解题思路拢共只有四种。
                  先混个脸熟 —— 每一章都会回到这张图:
                </>
              }
            />
          </p>
        </div>
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              PARADIGM 01 · <T en="chapter 5" zh="第 5 章" />
            </div>
            <div className="card-title">
              <T en="Enumeration and backtracking" zh="穷举与回溯" />
            </div>
            <p>
              <T
                en={
                  <>
                    Try every possibility, but try it in an organized way: arrange
                    the possibilities as a <b>decision tree</b>, and turn back as
                    soon as a branch cannot lead to an answer (pruning). It is the
                    slowest paradigm, but it is the one that{" "}
                    <b>always applies</b>, and you have to understand it before DP
                    makes sense.
                  </>
                }
                zh={
                  <>
                    把所有可能都试一遍,但试得有条理:把可能性组织成一棵<b>决策树</b>,
                    一旦某个分支不可能产生答案就立刻回头(剪枝)。
                    它最慢,却是唯一<b>永远可用</b>的兜底,也是理解 DP 的必经之路。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              PARADIGM 02 · <T en="chapters 1–2" zh="第 1–2 章" />
            </div>
            <div className="card-title">
              <T en="Divide and conquer" zh="分治" />
            </div>
            <p>
              <T
                en={
                  <>
                    Cut a large problem into <b>independent</b> smaller copies of
                    itself, solve each one recursively, then combine the results:
                    merge sort, fast exponentiation, merging k sorted lists. The
                    subproblems do not overlap, and that is what separates this
                    from DP.
                  </>
                }
                zh={
                  <>
                    把大问题切成<b>互相独立</b>的同款小问题,递归解决再拼合:
                    归并排序、快速幂、合并 K 个升序链表。子问题不重叠,
                    是它和 DP 的分水岭。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              PARADIGM 03 · <T en="chapter 6" zh="第 6 章" />
            </div>
            <div className="card-title">
              <T en="Greedy" zh="贪心" />
            </div>
            <p>
              <T
                en={
                  <>
                    Take the <b>best option available right now</b> and never go
                    back. It is very fast, but it only works if you can prove that
                    the local choice does not ruin the global answer. The standard
                    proof is an <b>exchange argument</b>: show that any optimal
                    solution can be rewritten to contain your choice without
                    getting worse. No proof, no greedy.
                  </>
                }
                zh={
                  <>
                    每一步都拿<b>当下最优</b>,永不回头。快得惊人,
                    但必须先证明局部最优不会毁掉全局最优。
                    标准做法是<b>交换论证</b>:证明任何一个最优解都能被改写成
                    「包含你这一步的选择」而不变差。证不出来就别贪。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              PARADIGM 04 · <T en="chapters 7–10" zh="第 7–10 章" />
            </div>
            <div className="card-title">
              <T en="Dynamic programming" zh="动态规划" />
            </div>
            <p>
              <T
                en={
                  <>
                    Two conditions have to hold: the same subproblem{" "}
                    <b>keeps coming back</b> during the enumeration, and an
                    optimal answer can be assembled from{" "}
                    <b>optimal answers to those subproblems</b>. When both hold,
                    record each subproblem answer once and reuse it. The path is
                    brute-force recursion → memoization → a bottom-up table. Four
                    chapters and a cell-by-cell animation are spent on it.
                  </>
                }
                zh={
                  <>
                    要同时满足两个条件:穷举过程中<b>同一个子问题被反复求解</b>,
                    而且最优解可以由<b>子问题的最优解</b>拼出来。
                    两条都成立时,把每个子问题的答案记一次、之后直接复用。
                    路径是「暴力递归 → 记忆化 → 递推表格」,
                    本课用整整四章 + 逐格动画把它拆开讲。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="idea"
          title={{ en: "And a box of tools", zh: "还有一盒「工具」" }}
        >
          <p>
            <T
              en={
                <>
                  Sorting (chapter 1), binary search (chapter 3), bit manipulation
                  (chapter 4), and math (chapter 11) are not separate ways of
                  thinking, but the four paradigms use them constantly. A greedy
                  solution almost always starts by sorting. The check inside
                  binary search on the answer is often greedy. Bitmask DP uses bit
                  operations to pack a whole set into one integer. The tool
                  chapters are short and sit between the longer ones.
                </>
              }
              zh={
                <>
                  排序(第 1 章)、二分(第 3 章)、位运算(第 4 章)、数学(第 11 章)
                  不算独立的思路,但四大范式随时都在用它们:贪心几乎总以排序开场,
                  二分答案的判定函数常常是贪心,状压 DP 靠位运算把一个集合塞进一个整数。
                  工具章都很短,穿插在主线里。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* §05 复杂度速查 */}
      <Section
        id="bigo"
        index="05"
        title={{
          en: "Six complexity tiers: the price list for this course",
          zh: "复杂度六档:本课的计价单位",
        }}
        desc={{
          en: "The full Big-O lesson is in the first chapter of DataData. This is only the price list.",
          zh: "完整的 Big-O 课在 DataData 序章 —— 这里只挂一张价目表",
        }}
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Tier" zh="档位" />
                </th>
                <th>
                  <T en="Name" zh="名字" />
                </th>
                <th>
                  <T en="Where you meet it in this course" zh="本课在哪遇到它" />
                </th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map((t) => (
                <tr key={t.o}>
                  <td><BigO o={t.o} /></td>
                  <td><b>{t.name}</b></td>
                  <td>{t.meet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout
          tone="deep"
          title={{
            en: "The story of this course is moving down a tier",
            zh: "算法课的主线剧情,就是「降档」",
          }}
        >
          <p>
            <T
              en={
                <>
                  Backtracking prunes O(2ⁿ) down. DP turns O(2ⁿ) into O(n²) or
                  O(n). Divide and conquer turns O(n²) into O(n log n). Binary
                  search turns O(n) into O(log n). A closed-form formula takes it
                  all the way to O(1).{" "}
                  <b>The turning point of every chapter is one of these
                  drops</b>, and you get to watch it happen.
                </>
              }
              zh={
                <>
                  回溯把 O(2ⁿ) 剪小、DP 把 O(2ⁿ) 压成 O(n²) 甚至 O(n)、
                  分治把 O(n²) 切成 O(n log n)、二分把 O(n) 砍成 O(log n)、
                  一个封闭公式把一切降到 O(1)。
                  <b>每一章的转折点,都是一次降档的瞬间</b> —— 而你会亲眼看着它发生。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* §06 世界地图 */}
      <Section
        id="map"
        index="06"
        title={{
          en: "The map: 13 chapters, easiest first",
          zh: "世界地图:13 章,由易到难",
        }}
        desc={{
          en: "The bar shows difficulty, the stars show how often the topic appears on LeetCode. Click any chapter to start.",
          zh: "色条 = 难度,星标 = LeetCode 出场频率 —— 点击任意一章出发",
        }}
      >
        <div className="map-grid">
          {CHAPTERS.filter((c) => c.id !== "home").map((c, i) => (
            <Reveal key={c.id} delay={Math.min(i * 40, 240)}>
              <Link
                href={c.href}
                className="map-card"
                style={{ "--ch-hue": c.hue } as React.CSSProperties}
              >
                <span className="map-watermark" aria-hidden="true">
                  {c.num}
                </span>
                <div className="map-head">
                  <span className="map-num">{c.num}</span>
                  <span className="map-title">{L(c.title)}</span>
                  {/* 英文界面下标题本身就是英文,再挂一行英文名只是重复 */}
                  <T
                    en={null}
                    zh={
                      <span className="map-en" style={{ marginLeft: "auto" }}>
                        {c.en}
                      </span>
                    }
                  />
                </div>
                <p className="map-essence">{L(c.essence)}</p>
                <div className="map-meta">
                  <span
                    className="map-level"
                    aria-label={L({
                      en: `Difficulty ${c.level} of 5`,
                      zh: `难度 ${c.level}/5`,
                    })}
                  >
                    {[1, 2, 3, 4, 5].map((l) => (
                      <i key={l} className={l <= c.level ? "on" : ""} />
                    ))}
                  </span>
                  <span className="map-freq">
                    <T en="LC FREQ" zh="LC 频率" /> <b>{"★".repeat(c.freq)}</b>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <Callout
          tone="idea"
          title={{ en: "Why this order?", zh: "为什么是这个顺序?" }}
        >
          <p>
            <T
              en={
                <>
                  <b>Sorting</b> and <b>divide and conquer</b> lay the foundation:
                  recursion, and splitting a problem into smaller copies of
                  itself. <b>Binary search</b> practises discarding half of the
                  candidates, which needs a yes/no test whose answer flips exactly
                  once across the range — a sorted array is only the simplest case
                  of that. <b>Bit manipulation</b> is a short tool chapter, and it
                  also prepares bitmask DP. Then the main sequence:{" "}
                  <b>backtracking</b> draws the recursion tree →{" "}
                  <b>greedy</b> teaches the proof you need before you may take the
                  local best → <b>four DP chapters</b> pick up every case where
                  backtracking is too slow and greedy is wrong. Each link rests on
                  the one before it. <b>Math</b> and <b>string algorithms</b> fill
                  the remaining gaps, and the final chapter puts every paradigm
                  into one decision map.
                </>
              }
              zh={
                <>
                  <b>排序、分治</b>先立地基:递归,以及「把问题切成同款小问题」。
                  <b>二分</b>练熟「砍掉一半候选」—— 它需要一个沿区间只翻转一次的判定条件,
                  有序数组只是其中最简单的一种。<b>位运算</b>是轻装工具课
                  (顺便为状压 DP 铺路)。然后进入主线:<b>回溯</b>把递归树画出来 →
                  <b>贪心</b>学会「敢贪之前要给的证明」→
                  <b> DP 四章</b>接住「回溯太慢、贪心失灵」的所有场景 ——
                  这条链的每一环都踩着上一环。<b>数学、字符串</b>殿后查漏,
                  终章把所有范式装进一张选型地图。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* §07 怎么用 */}
      <Section
        id="howto"
        index="07"
        title={{ en: "How to use this course", zh: "这套课怎么用" }}
        desc={{
          en: "Every chapter follows the same rhythm. Three steps, in order.",
          zh: "每章同一个节奏 —— 三步走,别跳步",
        }}
      >
        <div className="grid-3 howto">
          <div className="card">
            <div className="card-title">
              <T en="Understand it first" zh="先看懂" />
            </div>
            <p>
              <T
                en={
                  <>
                    The idea in plain words → why brute force is not enough → the
                    core method. Every conclusion comes with a reason. If a part
                    does not make sense, go back one section instead of pushing
                    on.
                  </>
                }
                zh={
                  <>
                    直觉故事 → 为什么暴力不行 → 核心思想。每个结论都带着「为什么」。
                    某一段读不懂,就退回上一节,不要硬冲。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <T en="Then play with it" zh="再玩透" />
            </div>
            <p>
              <T
                en={
                  <>
                    Every chapter has a visualization you can step through: DP
                    tables filled one cell at a time, decision trees expanded one
                    branch at a time. You have understood it when you{" "}
                    <b>can predict the next frame</b>.
                  </>
                }
                zh={
                  <>
                    每章都有逐帧可视化:DP 表格一格格填、决策树一步步展开。
                    <b>能预测下一帧</b>,才算真看懂了。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <T en="✍️ Then solve problems" zh="✍️ 后刷题" />
            </div>
            <p>
              <T
                en={
                  <>
                    Work through the explained problems, then try the problem set
                    — think for 30 seconds before opening a hint. Your checkmarks
                    are stored in this browser and counted in the sidebar. A
                    perfect quiz score lights the chapter green.
                  </>
                }
                zh={
                  <>
                    精讲跟着走一遍,题单先想 30 秒再看提示。勾选的进度存在本地浏览器里,
                    侧栏实时统计;测验全对会把该章点亮成绿色。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="win"
          title={{
            en: "A review schedule: day 1, day 7, day 21",
            zh: "复习节奏:D+1 / D+7 / D+21",
          }}
        >
          <p>
            <T
              en={
                <>
                  After you finish a problem: <b>one day later</b>, say the
                  approach out loud and write the core code from memory;{" "}
                  <b>seven days later</b>, redo it completely;{" "}
                  <b>twenty-one days later</b>, redo it under time pressure (35 to
                  45 minutes for a medium problem, including explaining it).
                  Before an interview, pick problems at random by paradigm rather
                  than going through the chapters in order. A real interview will
                  not tell you which chapter a problem belongs to.
                </>
              }
              zh={
                <>
                  每道题做完:<b>第 2 天</b>口述思路 + 手写核心代码;
                  <b>第 7 天</b>完整重做;<b>第 21 天</b>限时重做
                  (中等题 35~45 分钟,含讲解)。面试前按「范式」随机抽题,
                  而不是按章节顺序回忆 —— 真实面试不会告诉你这是哪一章的题。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="story"
          title={{ en: "About the three languages", zh: "关于三种语言" }}
        >
          <p>
            <T
              en={
                <>
                  The <b>Java / Python / JS</b> switch in the top bar applies
                  everywhere: change it once and every code window on the site
                  follows. The algorithm is the same in all three; what differs is
                  the syntax and the standard library. Each version carries notes
                  about the things that bite in that language, such as integer
                  overflow in Java or the recursion limit in Python.
                </>
              }
              zh={
                <>
                  顶栏的 <b>Java / Python / JS</b> 切换全站联动:切一次,
                  所有代码窗口一起换。算法逻辑在三种语言里是同一套,
                  差异只在语法和标准库 —— 每份题解都带该语言特有的注意点,
                  比如 Java 的整数溢出、Python 的递归深度上限。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* §08 Quiz */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quick check: chapter quiz", zh: "快问快答:序章通关测验" }}
        desc={{
          en: "Seven questions. A perfect score lights the first green mark in the sidebar.",
          zh: "7 题 —— 全对点亮侧栏第一盏绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Chapter quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="home" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            <T
              en={
                <>
                  An algorithm is{" "}
                  <b>a sequence of unambiguous steps that is guaranteed to
                  stop</b>. A good one meets three standards: correct (including
                  the edge cases), fast and small (Big-O), and explainable
                  (provable).
                </>
              }
              zh={
                <>
                  算法 = <b>每一步都无歧义、且必然终止的解题步骤</b>;
                  好算法三标准:对(含边界)、快且省(Big-O)、讲得清(可证明)。
                </>
              }
            />
          </>,
          <>
            <T
              en={
                <>
                  <b>A structure is a noun, an algorithm is a verb.</b>{" "}
                  Techniques that only work on one structure are in DataData. The
                  structure-independent algorithms (sorting, binary search,
                  backtracking, greedy, DP, bit manipulation, math, strings) are
                  here.
                </>
              }
              zh={
                <>
                  <b>结构是名词,算法是动词</b>:只在某个结构上成立的套路在 DataData,
                  纯算法(排序、二分、回溯、贪心、DP、位运算、数学、字符串)在本课。
                </>
              }
            />
          </>,
          <>
            <T
              en={
                <>
                  Recursion needs three things:{" "}
                  <b>a base case, trust in the recursive call, and arguments that
                  converge</b>. Check a recursion with those three questions
                  instead of expanding the call tree in your head.
                </>
              }
              zh={
                <>
                  递归三要素:<b>基准情形、递归信任、状态收敛</b> ——
                  用这三问检查递归,别在脑内展开调用树。
                </>
              }
            />
          </>,
          <>
            <T
              en={
                <>
                  The four paradigms in one line each: independent subproblems →{" "}
                  <b>divide and conquer</b>; a local choice you can justify with an
                  exchange argument → <b>greedy</b>; overlapping subproblems plus
                  optimal substructure → <b>DP</b>; none of these →{" "}
                  <b>backtracking</b> as the fallback.
                </>
              }
              zh={
                <>
                  四大范式一句话:子问题独立 → <b>分治</b>;
                  局部最优能用交换论证证明 → <b>贪心</b>;
                  子问题重叠 + 最优子结构 → <b>DP</b>;
                  都不沾 → <b>回溯</b>穷举兜底。
                </>
              }
            />
          </>,
          <>
            <T
              en={
                <>
                  The thread running through the course is{" "}
                  <b>moving down a complexity tier</b>: O(2ⁿ) → O(n²) → O(n log n)
                  → O(n) → O(log n) → O(1). Each chapter turns on one of those
                  drops.
                </>
              }
              zh={
                <>
                  整门课的主线是<b>降档</b>:O(2ⁿ) → O(n²) → O(n log n) → O(n) →
                  O(log n) → O(1),每一章的转折点都是一次降档。
                </>
              }
            />
          </>,
          <>
            <T
              en={
                <>
                  Practice routine: think for 30 seconds before opening a hint;
                  review on <b>day 1 out loud, day 7 in full, day 21 under
                  time</b>; before an interview, pick problems by paradigm rather
                  than by chapter.
                </>
              }
              zh={
                <>
                  刷题节奏:先想 30 秒再看提示;
                  <b>D+1 口述、D+7 重做、D+21 限时</b>;
                  面试前按范式抽题,不按章节顺序。
                </>
              }
            />
          </>,
        ]}
      />

      <ChapterFooter ch="home" />
    </main>
  );
}
