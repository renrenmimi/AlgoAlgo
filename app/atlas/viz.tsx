"use client";

// 终章 · 范式选型向导 —— 交互式决策树。
// 拿到一道题,依次问「求什么 → 贪心能否证明 → 子问题重不重叠 → 答案有无单调值域」,
// 一步步走到推荐范式,并给出本课对应章节的站内链接。走过的路径留成面包屑,随时重来。

import { useState } from "react";
import Link from "next/link";
import { T, useL, type Loc } from "@/lib/i18n";

interface QNode {
  kind: "q";
  q: Loc<string>;
  opts: { label: Loc<string>; next: string }[];
}

interface RNode {
  kind: "r";
  paradigm: Loc<string>;
  href: string;
  /** 章号 + 章名,拼进「去…章复习」按钮 */
  chLabel: Loc<string>;
  why: Loc<string>;
  runnerUp?: Loc<string>;
}

type Node = QNode | RNode;

const TREE: Record<string, Node> = {
  root: {
    kind: "q",
    q: {
      en: "Question 1: what is the problem actually asking for?",
      zh: "第一问:这道题到底在「求什么」?",
    },
    opts: [
      {
        label: {
          en: "🎯 One optimal value (a maximum, a minimum, the fewest steps, the most items)",
          zh: "🎯 一个最优值(最大 / 最小 / 最少步 / 最多个)",
        },
        next: "optimize",
      },
      {
        label: {
          en: "📋 Every concrete answer (combinations, subsets, permutations, partitions, board layouts)",
          zh: "📋 列出所有具体方案(组合 / 子集 / 排列 / 切割 / 棋盘)",
        },
        next: "r-backtrack",
      },
      {
        label: {
          en: "🧮 The number of answers (how many paths, how many ways to make a sum)",
          zh: "🧮 方案总数(有多少种走法 / 凑法)",
        },
        next: "count",
      },
      {
        label: {
          en: "🔎 Locating one answer inside a range where a yes/no test behaves monotonically",
          zh: "🔎 在一个「判定条件单调」的空间里定位一个答案",
        },
        next: "search",
      },
      {
        label: {
          en: "✂️ Splitting the input into smaller copies of the same problem, solving each, then merging",
          zh: "✂️ 能把它切成「同款小问题」分别解再合并",
        },
        next: "r-divide",
      },
      {
        label: {
          en: "🔧 Working only on the binary digits of integers (sets, switches, XOR)",
          zh: "🔧 只在整数的二进制位上做文章(集合 / 开关 / 异或)",
        },
        next: "r-bits",
      },
    ],
  },

  optimize: {
    kind: "q",
    q: {
      en: "Question 2: if you take the best option available at each step, can you prove with an exchange argument that the result is still optimal overall?",
      zh: "第二问:每一步都拿眼前最优,你能用「交换论证」证明它全局也不后悔吗?",
    },
    opts: [
      {
        label: {
          en: "✅ Yes, I can prove the greedy choice is safe",
          zh: "✅ 能证明,贪了不后悔",
        },
        next: "r-greedy",
      },
      {
        label: {
          en: "🤔 No proof, or I already have a counterexample (coins [1, 3, 4])",
          zh: "🤔 证不出来 / 已有反例(如硬币 [1,3,4])",
        },
        next: "opt-dp",
      },
    ],
  },
  "opt-dp": {
    kind: "q",
    q: {
      en: "Question 3: are the same subproblems solved again and again, and is the optimal answer built from optimal answers to those subproblems?",
      zh: "第三问:子问题会被反复计算,且大问题的最优能由子问题的最优拼出来吗?",
    },
    opts: [
      {
        label: {
          en: "✅ Both: overlapping subproblems and optimal substructure",
          zh: "✅ 两个都有:重叠子问题 + 最优子结构",
        },
        next: "r-dp",
      },
      {
        label: {
          en: "❌ The subproblems are independent and never repeat",
          zh: "❌ 子问题不重叠、各自独立",
        },
        next: "opt-binans",
      },
    ],
  },
  "opt-binans": {
    kind: "q",
    q: {
      en: "Question 4: pick a candidate value for the answer. Can you check quickly whether it is achievable, and does that check stay false up to some point and true after it?",
      zh: "第四问:先猜一个答案值,你能快速判断它可不可行,而且这个可行性随答案单调变化吗?",
    },
    opts: [
      {
        label: {
          en: "✅ Yes, I can guess an answer and then verify it",
          zh: "✅ 是,可以「先猜一个答案再验证可行性」",
        },
        next: "r-binans",
      },
      {
        label: {
          en: "❌ None of the above. Searching is the only option left",
          zh: "❌ 都不是,只能老老实实搜索",
        },
        next: "r-backtrack-opt",
      },
    ],
  },

  count: {
    kind: "q",
    q: {
      en: "Follow-up: can \"how many ways\" be written as a recurrence over where the last step came from?",
      zh: "追问:这个「有多少种」能写成「最后一步从哪来」的递推吗?",
    },
    opts: [
      {
        label: {
          en: "✅ Yes, the counts add up step by step (Climbing Stairs, coin combinations)",
          zh: "✅ 能递推(方案数逐步累加,如爬楼梯 / 硬币组合)",
        },
        next: "r-dp-count",
      },
      {
        label: {
          en: "❌ It is plain combinatorics, with a formula or a pattern",
          zh: "❌ 纯排列组合,有现成公式 / 规律",
        },
        next: "r-math",
      },
    ],
  },

  search: {
    kind: "q",
    q: {
      en: "Follow-up: what exactly are you searching through?",
      zh: "追问:你面对的「单调空间」具体是?",
    },
    opts: [
      {
        label: {
          en: "An array that is already sorted; I want a value or a boundary",
          zh: "一个已经排好序的数组,找某个值 / 某条边界",
        },
        next: "r-binary",
      },
      {
        label: {
          en: "A range of candidate answers; I want to guess one and verify it",
          zh: "一个候选答案的取值范围,想猜答案再验证",
        },
        next: "r-binans",
      },
    ],
  },

  /* ---------- 叶子:推荐范式 ---------- */
  "r-greedy": {
    kind: "r",
    paradigm: { en: "Greedy", zh: "贪心 Greedy" },
    href: "/greedy",
    chLabel: { en: "06 Greedy", zh: "06 贪心" },
    why: {
      en: "Take the best option available at each step and never revisit it. The hard part is not the choice; it is proving with an exchange argument that no later step is made worse by it. Interval scheduling, Jump Game, and the greedy stock problems all belong here.",
      zh: "每一步都拿当前最优,不回头。难点从来不是「贪」,而是用交换论证说明「贪完不后悔」。区间调度、跳跃游戏、股票贪心都归它。",
    },
    runnerUp: {
      en: "Cannot prove the greedy choice is safe? Go back to DP. That is exactly the step from chapter 06 to chapter 07.",
      zh: "证不出贪心选择性质?立刻退回 DP 兜底 —— 这正是本课 06 → 07 章的叙事。",
    },
  },
  "r-dp": {
    kind: "r",
    paradigm: { en: "Dynamic programming", zh: "动态规划 DP" },
    href: "/dp",
    chLabel: { en: "07 DP Basics → 10 Advanced DP", zh: "07 DP 入门 → 10 DP 进阶" },
    why: {
      en: "Store the answer to each subproblem once and reuse it. Five steps: define the state, write the transition, set the initial values, choose the loop order, then check the boundaries. DP needs two things at once — overlapping subproblems and optimal substructure. Without the overlap it is only divide and conquer.",
      zh: "把算过的子问题记下来,别再算第二遍。五步法:定义状态 → 写转移 → 定初始 → 定遍历顺序 → 验边界。DP 需要两个条件同时成立:重叠子问题 + 最优子结构;少了「重叠」,那就只是分治。",
    },
    runnerUp: {
      en: "Knapsack-shaped problems are in chapter 08. Two-sequence problems and edit distance are in chapter 09. State machines, intervals, trees, and bitmasks are in chapter 10.",
      zh: "背包型看 08 章,双序列 / 编辑距离看 09 章,状态机 / 区间 / 树形 / 状压看 10 章。",
    },
  },
  "r-dp-count": {
    kind: "r",
    paradigm: {
      en: "Dynamic programming (counting)",
      zh: "动态规划 DP(计数型)",
    },
    href: "/dp",
    chLabel: { en: "07 DP Basics / 08 Knapsack", zh: "07 DP 入门 / 08 背包" },
    why: {
      en: "\"How many ways\" means adding up the counts of every way the last step could have happened. Climbing Stairs, Unique Paths, and Coin Change II (518) share one skeleton: the same table as an optimization DP, with min replaced by addition.",
      zh: "「有多少种」= 把「最后一步怎么来」的方案数相加。爬楼梯、不同路径、硬币组合(518)全是这个骨架,只是把 min 换成了 +。",
    },
    runnerUp: {
      en: "For counting problems that pick items to reach a total, see chapter 08 and the difference between counting combinations and counting permutations in an unbounded knapsack.",
      zh: "涉及「选物品凑总量」的计数,去 08 背包章看完全背包的组合 / 排列之别。",
    },
  },
  "r-binans": {
    kind: "r",
    paradigm: {
      en: "Binary search on the answer",
      zh: "二分答案 Binary Search on Answer",
    },
    href: "/binary",
    chLabel: { en: "03 Binary Search in Depth", zh: "03 二分进阶" },
    why: {
      en: "Use this when the problem asks for an optimal value, you can test a given value for feasibility in about O(n), and feasibility is monotonic: every value above the answer works and every value below it fails, or the other way round. Then stop computing the answer and start guessing it, which turns optimization into a yes/no test.",
      zh: "当「求最优值」遇上「给定一个值,能 O(n) 判断可不可行」,且可行性随这个值单调(答案以上全可行、以下全不可行,或反过来)时 —— 别去求答案,去猜答案:把最优化变成判定题。",
    },
    runnerUp: {
      en: "Koko Eating Bananas (875), Split Array Largest Sum (410), and Capacity to Ship Packages (1011) are all this pattern.",
      zh: "吃香蕉(875)、分割数组最大值(410)、运送包裹(1011)都是它。",
    },
  },
  "r-binary": {
    kind: "r",
    paradigm: { en: "Binary search", zh: "二分查找 Binary Search" },
    href: "/binary",
    chLabel: { en: "03 Binary Search in Depth", zh: "03 二分进阶" },
    why: {
      en: "Each step throws away half of the remaining range. What makes that safe is not sortedness itself but a yes/no test that flips only once across the range; a sorted array is the most common case of it. The advanced part is finding boundaries (lower and upper bound) and using the fact that in a rotated array one half is always sorted.",
      zh: "每一步砍掉一半区间。让这件事成立的不是「有序」本身,而是判定条件在区间上只翻转一次 —— 有序数组只是它最常见的形态。进阶在「找边界」(lower / upper bound)与「二段性」(旋转数组每次总有一半有序)。",
    },
    runnerUp: {
      en: "For left and right boundaries see 34, for rotated arrays see 33 and 153, for matrices see 74 and 240.",
      zh: "找左右边界看 34,旋转数组看 33 / 153,矩阵看 74 / 240。",
    },
  },
  "r-backtrack": {
    kind: "r",
    paradigm: { en: "Backtracking", zh: "回溯 Backtracking" },
    href: "/backtrack",
    chLabel: { en: "05 Backtracking", zh: "05 回溯" },
    why: {
      en: "The standard answer when the task is to list every valid solution. Three things define it: the path so far, the choices still available, and the stop condition. Walk into a dead end, undo one step, take another road. It is a decision tree you can draw.",
      zh: "「列出所有可行解」的专业户。三问定式:路径(已选什么)、选择列表(还能选什么)、结束条件。走进死胡同就撤一步换条路 —— 本质是一棵画得出来的决策树。",
    },
    runnerUp: {
      en: "Removing duplicates has two forms: skipping across a level and skipping along a branch. Pruning cuts an exponential tree down to a workable size.",
      zh: "去重分「树层去重」和「树枝去重」两板斧;剪枝能把指数树砍瘦。",
    },
  },
  "r-backtrack-opt": {
    kind: "r",
    paradigm: {
      en: "Backtracking with pruning on the best answer so far",
      zh: "回溯 + 最优性剪枝(暴搜兜底)",
    },
    href: "/backtrack",
    chLabel: { en: "05 Backtracking", zh: "05 回溯" },
    why: {
      en: "When greedy cannot be proved, subproblems do not overlap, and no monotonic test on the answer exists, searching is what is left. Add one rule: as soon as the partial answer is already worse than the best complete answer you have, stop exploring that branch.",
      zh: "既贪不了、又没有重叠子问题、答案也不单调时,只能搜。但要带上一条规则:当前部分解已经比已知最优还差,就立刻剪掉这条分支。",
    },
    runnerUp: {
      en: "If you notice that the subproblems do repeat after all, go back to chapter 07. That is the signal for DP.",
      zh: "如果发现子问题其实重叠了 —— 回到 07 章,那就是 DP 该出场的信号。",
    },
  },
  "r-divide": {
    kind: "r",
    paradigm: {
      en: "Divide and conquer",
      zh: "分治 Divide & Conquer",
    },
    href: "/divide",
    chLabel: { en: "02 Divide and Conquer", zh: "02 分治" },
    why: {
      en: "Three steps: split, solve, merge. Cut the problem into smaller copies of itself, trust the recursion to return their answers, then combine them. Merge sort, fast exponentiation, and merging k sorted lists all work this way. Use a recursion tree to estimate the cost.",
      zh: "分 → 治 → 合三步:把大问题切成同款小问题,信任递归带回子答案,再合并。归并排序、快速幂、合并 K 个升序链表都是它;用递归树估复杂度。",
    },
    runnerUp: {
      en: "Once the subproblems start to repeat, divide and conquer becomes DP: store each answer instead of recomputing it.",
      zh: "子问题一旦开始重复,分治就升级成 DP(把子答案存下来,别再算第二遍)。",
    },
  },
  "r-bits": {
    kind: "r",
    paradigm: { en: "Bit manipulation", zh: "位运算 Bit Manipulation" },
    href: "/bits",
    chLabel: { en: "04 Bit Manipulation", zh: "04 位运算" },
    why: {
      en: "A 32-bit int is 32 switches. XOR finds the number that appears once (136), n & (n - 1) clears the lowest set bit (191), and a bitmask can represent a set so you can enumerate its subsets, which is the groundwork for bitmask DP.",
      zh: "一个 int 就是 32 盏灯。异或找只出现一次的数(136)、n & (n - 1) 消掉最低位的 1(191)、用位表示集合来枚举子集(状压 DP 的前置)—— 轻量却锋利的工具箱。",
    },
  },
  "r-math": {
    kind: "r",
    paradigm: { en: "Math and number theory", zh: "数学与数论 Math" },
    href: "/math",
    chLabel: { en: "11 Math & Number Theory", zh: "11 数学与数论" },
    why: {
      en: "Math problems in interviews rarely test math. They test whether you can find the quantity that does not change: majority vote, the sieve of Eratosthenes, fast exponentiation, parity in a game. Once you see the pattern, an O(n) or even O(1) answer follows.",
      zh: "数学题不考数学,考的是能不能找到那个不变量:摩尔投票、埃氏筛、快速幂、博弈奇偶。找到规律,O(n) 甚至 O(1) 一步到位。",
    },
  },
};

export function DecisionLab() {
  const L = useL();
  const [path, setPath] = useState<string[]>(["root"]);
  const cur = TREE[path[path.length - 1]];

  return (
    <div className="viz atl-decision">
      <div className="viz-title">
        <T
          en="Choosing a paradigm: the questions to ask, in order"
          zh="范式选型向导 —— 拿到题,先陪自己走一遍这几问"
        />
      </div>

      {path.length > 1 && (
        <div className="atl-crumbs">
          {path.slice(0, -1).map((id, i) => {
            const n = TREE[id];
            return (
              <span key={i} className="atl-crumb">
                {n.kind === "q" ? L(n.q) : ""}
              </span>
            );
          })}
        </div>
      )}

      {cur.kind === "q" ? (
        <>
          <p className="atl-q">{L(cur.q)}</p>
          <div className="atl-opts">
            {cur.opts.map((o) => (
              <button
                key={o.next}
                type="button"
                className="atl-opt"
                onClick={() => setPath((p) => [...p, o.next])}
              >
                <span>{L(o.label)}</span>
                <span className="arr" aria-hidden>
                  →
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="atl-result">
          <div className="atl-result-label">
            <T en="Recommended paradigm" zh="该亮的灯" />
          </div>
          <div className="atl-result-name">{L(cur.paradigm)}</div>
          <p className="atl-result-why">{L(cur.why)}</p>
          {cur.runnerUp && (
            <p className="atl-result-runner">💡 {L(cur.runnerUp)}</p>
          )}
          <div className="atl-result-actions">
            <Link href={cur.href} className="btn btn-sm btn-primary">
              <T
                en={<>Review: {L(cur.chLabel)} →</>}
                zh={<>去「{L(cur.chLabel)}」章复习 →</>}
              />
            </Link>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setPath(["root"])}
            >
              <T en="↻ Start over" zh="↻ 再走一次" />
            </button>
          </div>
        </div>
      )}

      {cur.kind === "q" && path.length > 1 && (
        <div className="viz-ctl">
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => setPath((p) => p.slice(0, -1))}
          >
            <T en="← Previous question" zh="← 上一问" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => setPath(["root"])}
          >
            <T en="↻ Start over" zh="↻ 重新开始" />
          </button>
        </div>
      )}
    </div>
  );
}
