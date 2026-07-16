"use client";

// 终章 · 范式选型向导 —— 交互式决策树。
// 拿到一道题,依次问「求什么 → 贪心能否证明 → 子问题重不重叠 → 答案有无单调值域」,
// 一步步走到推荐范式,并给出本课对应章节的站内链接。走过的路径留成面包屑,随时重来。

import { useState } from "react";
import Link from "next/link";

interface QNode {
  kind: "q";
  q: string;
  opts: { label: string; next: string }[];
}

interface RNode {
  kind: "r";
  paradigm: string;
  href: string;
  chLabel: string;
  why: string;
  runnerUp?: string;
}

type Node = QNode | RNode;

const TREE: Record<string, Node> = {
  root: {
    kind: "q",
    q: "第一问:这道题到底在「求什么」?",
    opts: [
      { label: "🎯 一个最优值(最大 / 最小 / 最少步 / 最多个)", next: "optimize" },
      { label: "📋 列出所有具体方案(组合 / 子集 / 排列 / 切割 / 棋盘)", next: "r-backtrack" },
      { label: "🧮 方案总数(有多少种走法 / 凑法)", next: "count" },
      { label: "🔎 在一个有序 / 单调的空间里定位一个答案", next: "search" },
      { label: "✂️ 能把它切成两半「同款小问题」分别解再合并", next: "r-divide" },
      { label: "🔧 只在整数的二进制位上做文章(集合 / 开关 / 异或)", next: "r-bits" },
    ],
  },

  optimize: {
    kind: "q",
    q: "第二问:每一步都拿眼前最优,你能用「交换论证」证明它全局也不后悔吗?",
    opts: [
      { label: "✅ 能证明,贪了不后悔", next: "r-greedy" },
      { label: "🤔 证不出来 / 已有反例(如硬币 [1,3,4])", next: "opt-dp" },
    ],
  },
  "opt-dp": {
    kind: "q",
    q: "第三问:子问题会被反复计算,且大问题的最优能由子问题的最优拼出来吗?",
    opts: [
      { label: "✅ 有重叠子问题 + 最优子结构", next: "r-dp" },
      { label: "❌ 子问题不重叠、各自独立", next: "opt-binans" },
    ],
  },
  "opt-binans": {
    kind: "q",
    q: "第四问:那个最优答案,是否落在一个「单调值域」里(答案越大越难 / 越容易满足)?",
    opts: [
      { label: "✅ 是,可以「先猜一个答案再验证可行性」", next: "r-binans" },
      { label: "❌ 都不是,只能老老实实搜索", next: "r-backtrack-opt" },
    ],
  },

  count: {
    kind: "q",
    q: "追问:这个「有多少种」能写成「最后一步从哪来」的递推吗?",
    opts: [
      { label: "✅ 能递推(方案数逐步累加,如爬楼梯 / 硬币组合)", next: "r-dp-count" },
      { label: "❌ 纯排列组合,有现成公式 / 规律", next: "r-math" },
    ],
  },

  search: {
    kind: "q",
    q: "追问:你面对的「有序空间」具体是?",
    opts: [
      { label: "一个已经排好序的数组,找某个值 / 某条边界", next: "r-binary" },
      { label: "一个单调的「答案值域」,想猜答案再验证", next: "r-binans" },
    ],
  },

  /* ---------- 叶子:推荐范式 ---------- */
  "r-greedy": {
    kind: "r",
    paradigm: "贪心 Greedy",
    href: "/greedy",
    chLabel: "06 贪心",
    why: "每一步都拿当前最优,不回头。难点从来不是「贪」,而是用交换论证 / 反证法说明「贪完不后悔」。区间调度、跳跃游戏、股票贪心都归它。",
    runnerUp: "证不出贪心选择性质?立刻退回 DP 兜底 —— 这正是本课 06→07 章的叙事。",
  },
  "r-dp": {
    kind: "r",
    paradigm: "动态规划 DP",
    href: "/dp",
    chLabel: "07 DP 入门 → 10 DP 进阶",
    why: "把算过的子问题记下来别再算第二遍。五步法:定义状态 → 写转移 → 定初始 → 定遍历顺序 → 验边界。它是「回溯太慢、贪心失灵」时的终极兜底。",
    runnerUp: "背包型看 08 章,双序列 / 编辑距离看 09 章,状态机 / 区间 / 树形 / 状压看 10 章。",
  },
  "r-dp-count": {
    kind: "r",
    paradigm: "动态规划 DP(计数型)",
    href: "/dp",
    chLabel: "07 DP 入门 / 08 背包",
    why: "「有多少种」= 把「最后一步怎么来」的方案数相加。爬楼梯、不同路径、硬币组合(518)全是这个骨架,只是把 min 换成了 +。",
    runnerUp: "涉及「选物品凑总量」的计数,去 08 背包章看完全背包的组合 / 排列之别。",
  },
  "r-binans": {
    kind: "r",
    paradigm: "二分答案 Binary Search on Answer",
    href: "/binary",
    chLabel: "03 二分进阶",
    why: "当「求最优值」遇上「给定一个值,能 O(n) 判断可不可行」且可行性随值单调时 —— 别去求答案,去猜答案:二分那个单调值域,把最优化变成判定题。",
    runnerUp: "吃香蕉(875)、分割数组最大值(410)、运送包裹(1011)都是它。",
  },
  "r-binary": {
    kind: "r",
    paradigm: "二分查找 Binary Search",
    href: "/binary",
    chLabel: "03 二分进阶",
    why: "有序 + 随机访问 = 每步砍一半。进阶在「找边界」(lower / upper_bound)与「二段性」(旋转数组每次总有一半有序)。",
    runnerUp: "找左右边界看 34,旋转数组看 33 / 153,矩阵看 74 / 240。",
  },
  "r-backtrack": {
    kind: "r",
    paradigm: "回溯 Backtracking",
    href: "/backtrack",
    chLabel: "05 回溯",
    why: "「列出所有可行解」的专业户。三问定式:路径(已选什么)、选择列表(还能选什么)、结束条件。走进死胡同就撤一步换条路 —— 本质是一棵画得出来的决策树。",
    runnerUp: "去重分「树层去重」和「树枝去重」两板斧;剪枝能把指数树砍瘦。",
  },
  "r-backtrack-opt": {
    kind: "r",
    paradigm: "回溯 + 最优性剪枝(暴搜兜底)",
    href: "/backtrack",
    chLabel: "05 回溯",
    why: "既贪不了、又没有重叠子问题、答案也不单调时,只能搜。但要带上「当前已经比已知最优还差就剪枝」,把无望的分支尽早砍掉。",
    runnerUp: "如果发现子问题其实重叠了 —— 回到 07 章,那就是 DP 该出场的信号。",
  },
  "r-divide": {
    kind: "r",
    paradigm: "分治 Divide & Conquer",
    href: "/divide",
    chLabel: "02 分治",
    why: "分 → 治 → 合三步:把大问题切成同款小问题,信任递归带回子答案,再合并。归并排序、快速幂、合并 K 链表都是它;用递归树估复杂度。",
    runnerUp: "子问题若开始重叠,分治就升级成 DP(记忆化)。",
  },
  "r-bits": {
    kind: "r",
    paradigm: "位运算 Bit Manipulation",
    href: "/bits",
    chLabel: "04 位运算",
    why: "一个 int 就是 32 盏灯。异或找单身狗(136)、n&(n-1) 消最低位 1(191)、用位表示集合枚举子集(状压 DP 前置)—— 轻量却锋利的工具箱。",
  },
  "r-math": {
    kind: "r",
    paradigm: "数学与数论 Math",
    href: "/math",
    chLabel: "11 数学与数论",
    why: "数学题不考数学,考的是能不能找到那个不变量:摩尔投票、埃氏筛、快速幂、博弈奇偶。找到规律,O(n) 甚至 O(1) 一步到位。",
  },
};

export function DecisionLab() {
  const [path, setPath] = useState<string[]>(["root"]);
  const cur = TREE[path[path.length - 1]];

  return (
    <div className="viz atl-decision">
      <div className="viz-title">范式选型向导 —— 拿到题,先陪自己走一遍这几问</div>

      {path.length > 1 && (
        <div className="atl-crumbs">
          {path.slice(0, -1).map((id, i) => {
            const n = TREE[id];
            return (
              <span key={i} className="atl-crumb">
                {n.kind === "q" ? n.q : ""}
              </span>
            );
          })}
        </div>
      )}

      {cur.kind === "q" ? (
        <>
          <p className="atl-q">{cur.q}</p>
          <div className="atl-opts">
            {cur.opts.map((o) => (
              <button
                key={o.next}
                type="button"
                className="atl-opt"
                onClick={() => setPath((p) => [...p, o.next])}
              >
                <span>{o.label}</span>
                <span className="arr" aria-hidden>
                  →
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="atl-result">
          <div className="atl-result-label">该亮的灯</div>
          <div className="atl-result-name">{cur.paradigm}</div>
          <p className="atl-result-why">{cur.why}</p>
          {cur.runnerUp && <p className="atl-result-runner">💡 {cur.runnerUp}</p>}
          <div className="atl-result-actions">
            <Link href={cur.href} className="btn btn-sm btn-primary">
              去「{cur.chLabel}」章复习 →
            </Link>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setPath(["root"])}
            >
              ↻ 再走一次
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
            ← 上一问
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => setPath(["root"])}
          >
            ↻ 重新开始
          </button>
        </div>
      )}
    </div>
  );
}
