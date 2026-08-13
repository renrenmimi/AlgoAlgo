"use client";

// 第 7 章 · 动态规划入门 —— 全书样板章。
// 九段式结构:直觉(递归树看重复)→ 记忆化 → 递推 + 精讲 A(爬楼梯)→
// 五步法 → 网格 DP + 精讲 B(不同路径)→ 打家劫舍 + 精讲 C →
// 贪心失效 + 精讲 D(零钱兑换)→ 题单 → 测验 → 要点。
// DP 表格动画统一用 lib/algviz 的 DPTable;递归树用 TreePlayer(见 ./viz)。

import "./chapter.css";
import {
  Hero,
  Section,
  Callout,
  BigO,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { DPTable, type DPFrame, type DPCell } from "@/lib/algviz";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { PROBLEMS, QUIZ } from "@/lib/dp-data";
import { FibNaiveTree, FibMemoTree, RobLab } from "./viz";

/* ================= 精讲 A · LC 70 爬楼梯:一维表逐格填充 ================= */

const CLIMB_VALS = [1, 2, 3, 5, 8, 13]; // dp[1..6]

function climbCells(upto: number, cur?: number, srcs?: number[], final = false): DPCell[][] {
  const row: DPCell[] = CLIMB_VALS.map((v, idx) => {
    const i = idx + 1;
    if (cur === i) return { v, state: "cur" };
    if (srcs?.includes(i)) return { v, state: "src" };
    if (i <= upto) return { v, state: final && i === 6 ? "ok" : "done" };
    return { v: "?", state: "ghost" };
  });
  return [row];
}

const F_CLIMB: DPFrame[] = [
  {
    cells: climbCells(0),
    msg: (
      <>
        先立状态:<b>dp[i] = 爬到第 i 阶的方案数</b>。整张表还是问号 ——
        我们要做的,就是让答案从左往右「长」出来。
      </>
    ),
  },
  {
    cells: climbCells(2),
    msg: (
      <>
        初始化:dp[1] = <b>1</b>(一步跨 1 阶,唯一走法)、dp[2] = <b>2</b>
        (1+1 或直接跨 2)。这两格不靠推导,靠<b>数手指</b> —— 初始值错,后面全错。
      </>
    ),
  },
  {
    cells: climbCells(2, 3, [1, 2]),
    msg: (
      <>
        dp[3]:最后一步要么从第 2 阶跨 1 步来,要么从第 1 阶跨 2 步来 ——
        两个来路<b>互斥且覆盖全部</b>,所以 dp[3] = dp[2] + dp[1] = 2 + 1 = <b>3</b>。
      </>
    ),
  },
  {
    cells: climbCells(3, 4, [2, 3]),
    msg: (
      <>
        dp[4] = dp[3] + dp[2] = 3 + 2 = <b>5</b>。注意:我们<b>完全没有</b>去数
        5 条路各长什么样 —— 只是把两个「已经可信」的答案加了起来。
      </>
    ),
  },
  {
    cells: climbCells(4, 5, [3, 4]),
    msg: (
      <>
        dp[5] = dp[4] + dp[3] = 5 + 3 = <b>8</b>。发现了吗?这就是斐波那契数列 ——
        爬楼梯是它披着 LeetCode 外衣的样子。
      </>
    ),
  },
  {
    cells: climbCells(5, 6, [4, 5]),
    msg: (
      <>
        dp[6] = dp[5] + dp[4] = 8 + 5 = <b>13</b>。每一格只算一次、只花 O(1),
        整张表 O(n) —— 对比朴素递归的 O(2ⁿ),这就是「降档」。
      </>
    ),
  },
  {
    cells: climbCells(6, undefined, undefined, true),
    msg: (
      <>
        表填完,答案就躺在最后一格:<b>13</b>。递推的本质:
        <b>按依赖顺序,把记忆化会算到的每个子问题,提前、顺序地算一遍</b>。
      </>
    ),
  },
];

/* ================= 精讲 B · LC 62 不同路径:二维表逐格填充 ================= */

const P62 = [
  [1, 1, 1, 1],
  [1, 2, 3, 4],
  [1, 3, 6, 10],
];

function pathCells(
  filled: (i: number, j: number) => boolean,
  cur?: [number, number],
  srcs?: [number, number][],
  final = false,
): DPCell[][] {
  return P62.map((row, i) =>
    row.map((v, j) => {
      if (cur && cur[0] === i && cur[1] === j) return { v, state: "cur" as const };
      if (srcs?.some(([a, b]) => a === i && b === j)) return { v, state: "src" as const };
      if (filled(i, j)) return { v, state: final && i === 2 && j === 3 ? ("ok" as const) : ("done" as const) };
      return { v: "?", state: "ghost" as const };
    }),
  );
}

const INNER_62: [number, number][] = [
  [1, 1],
  [1, 2],
  [1, 3],
  [2, 1],
  [2, 2],
  [2, 3],
];

const F62: DPFrame[] = [
  {
    cells: pathCells(() => false),
    msg: (
      <>
        3×4 的网格,机器人从左上走到右下,只能向右或向下。
        状态:<b>dp[i][j] = 走到 (i, j) 的路径条数</b>。
      </>
    ),
  },
  {
    cells: pathCells((i, j) => i === 0 || j === 0),
    msg: (
      <>
        初始化:第一行、第一列全是 <b>1</b> —— 只能一路向右(或一路向下)走过来,
        没有第二种选择。边界就是「不证自明的子问题」。
      </>
    ),
  },
  ...INNER_62.map(([i, j], k) => {
    const done = (a: number, b: number) =>
      a === 0 || b === 0 || INNER_62.slice(0, k).some(([x, y]) => x === a && y === b);
    return {
      cells: pathCells(done, [i, j], [
        [i - 1, j],
        [i, j - 1],
      ]),
      msg: (
        <>
          dp[{i}][{j}]:最后一步只能<b>从上面来</b>(dp[{i - 1}][{j}] = {P62[i - 1][j]})或
          <b>从左面来</b>(dp[{i}][{j - 1}] = {P62[i][j - 1]}),两类互斥、无遗漏 ——
          相加得 <b>{P62[i][j]}</b>。
        </>
      ),
    };
  }),
  {
    cells: pathCells(() => true, undefined, undefined, true),
    msg: (
      <>
        右下角 <b>10</b> 就是答案。每格 O(1)、共 m×n 格 → <b>O(mn)</b>。
        暴力枚举所有路径是 C(5,2) = 10 条还数得过来;换成 20×20 的网格,
        路径就有 350 亿条 —— 而这张表仍然只有 400 格。
      </>
    ),
  },
];

/* ================= 精讲 C · LC 198 打家劫舍:选 / 不选 ================= */

const ROB_NUMS = [2, 7, 9, 3, 1];
const ROB_DP = [2, 7, 11, 11, 12];
const ROB_LABELS = ROB_NUMS.map((v, i) => (
  <span key={i}>
    🏠{i}
    <br />¥{v}
  </span>
));

function robCells(upto: number, cur?: number, srcs?: number[], final = false): DPCell[][] {
  const row: DPCell[] = ROB_DP.map((v, i) => {
    if (cur === i) return { v, state: "cur" };
    if (srcs?.includes(i)) return { v, state: "src" };
    if (i <= upto) return { v, state: final && i === 4 ? "ok" : "done" };
    return { v: "?", state: "ghost" };
  });
  return [row];
}

const F_ROB: DPFrame[] = [
  {
    cells: robCells(-1),
    msg: (
      <>
        状态:<b>dp[i] = 只考虑前 i+1 间房、且不触发警报,能偷到的最大金额</b>。
        注意措辞是「只考虑前几间」,<b>不是</b>「必须偷第 i 间」—— 这个区别决定转移怎么写。
      </>
    ),
  },
  {
    cells: robCells(0, 0),
    msg: (
      <>
        dp[0]:天地间只有一间 ¥2 的房,没有警报可触发 —— 偷!dp[0] = <b>2</b>。
      </>
    ),
  },
  {
    cells: robCells(0, 1, [0]),
    msg: (
      <>
        dp[1]:两间相邻,只能挑一间 —— max(2, 7) = <b>7</b>。
      </>
    ),
  },
  {
    cells: robCells(1, 2, [0, 1]),
    msg: (
      <>
        dp[2] 面临本章最重要的一次二选一:<b>偷 ¥9</b> → 1 号不能碰,收益 dp[0] + 9 = 11;
        <b>不偷</b> → 直接继承 dp[1] = 7。max(11, 7) = <b>11</b>。
      </>
    ),
  },
  {
    cells: robCells(2, 3, [1, 2]),
    msg: (
      <>
        dp[3]:偷 ¥3 → dp[1] + 3 = 10;不偷 → dp[2] = 11。max = <b>11</b> ——
        这次「不偷」赢了,¥3 不值得放弃 ¥9 的邻位。
      </>
    ),
  },
  {
    cells: robCells(3, 4, [2, 3]),
    msg: (
      <>
        dp[4]:偷 ¥1 → dp[2] + 1 = 12;不偷 → dp[3] = 11。max = <b>12</b>。
      </>
    ),
  },
  {
    cells: robCells(4, undefined, undefined, true),
    msg: (
      <>
        答案 <b>12</b>(¥2 + ¥9 + ¥1)。每一格都只做一次「偷 or 不偷」的比较 ——
        <b>「选 / 不选」这个决策模型,就是下一章背包问题的全部雏形</b>。
      </>
    ),
  },
];

/* ================= 精讲 D · LC 322 零钱兑换:min 型 DP ================= */

const COIN_DP = [0, 1, 2, 1, 1, 2, 2]; // coins = [1,3,4], amount = 6
const COIN_LABELS = COIN_DP.map((_, a) => `¥${a}`);

function coinCells(upto: number, cur?: number, srcs?: number[], final = false): DPCell[][] {
  const row: DPCell[] = COIN_DP.map((v, a) => {
    if (cur === a) return { v, state: "cur" };
    if (srcs?.includes(a)) return { v, state: "src" };
    if (a <= upto) return { v, state: final && a === 6 ? "ok" : "done" };
    return { v: "?", state: "ghost" };
  });
  return [row];
}

const F_COIN: DPFrame[] = [
  {
    cells: coinCells(0, 0),
    msg: (
      <>
        硬币 [1, 3, 4],目标 ¥6。状态:<b>dp[a] = 凑出金额 a 的最少硬币数</b>。
        出发点 dp[0] = <b>0</b>:凑 0 元,一枚都不用 —— 别小看这格,所有答案都从它长出来。
      </>
    ),
  },
  {
    cells: coinCells(0, 1, [0]),
    msg: (
      <>
        dp[1]:最后一枚只能是 ¥1(¥3、¥4 都超了)→ dp[0] + 1 = <b>1</b>。
      </>
    ),
  },
  {
    cells: coinCells(1, 2, [1]),
    msg: (
      <>
        dp[2]:还是只有 ¥1 可用 → dp[1] + 1 = <b>2</b>。
      </>
    ),
  },
  {
    cells: coinCells(2, 3, [2, 0]),
    msg: (
      <>
        dp[3] 开始有分岔:最后一枚是 ¥1 → dp[2]+1 = 3;是 ¥3 → dp[0]+1 = <b>1</b>。
        取 min = <b>1</b>。「枚举最后一枚硬币」= 枚举所有可能的最后一步。
      </>
    ),
  },
  {
    cells: coinCells(3, 4, [3, 1, 0]),
    msg: (
      <>
        dp[4]:¥1 → dp[3]+1 = 2;¥3 → dp[1]+1 = 2;¥4 → dp[0]+1 = <b>1</b>。min = <b>1</b>。
      </>
    ),
  },
  {
    cells: coinCells(4, 5, [4, 2, 1]),
    msg: (
      <>
        dp[5]:¥1 → dp[4]+1 = 2;¥3 → dp[2]+1 = 3;¥4 → dp[1]+1 = 2。min = <b>2</b>。
      </>
    ),
  },
  {
    cells: coinCells(5, 6, [5, 3, 2]),
    msg: (
      <>
        dp[6]:¥1 → dp[5]+1 = 3;<b>¥3 → dp[3]+1 = 2</b>;¥4 → dp[2]+1 = 3。
        min = <b>2</b>,路径是 3 + 3 —— 正是贪心永远看不见的那个组合。
      </>
    ),
  },
  {
    cells: coinCells(6, undefined, undefined, true),
    msg: (
      <>
        贪心:4+1+1 = 3 枚 ✗;DP:3+3 = <b>2 枚</b> ✓。
        DP 赢在<b>不做选择,只做记账</b>:每种「最后一枚」都试过,数学上保证不漏。
      </>
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "why", n: "01", label: "为什么会有 DP" },
  { id: "memo", n: "02", label: "记忆化" },
  { id: "tabulation", n: "03", label: "递推 · 爬楼梯" },
  { id: "framework", n: "04", label: "五步法" },
  { id: "grid", n: "05", label: "网格 DP" },
  { id: "rob", n: "06", label: "打家劫舍" },
  { id: "coin", n: "07", label: "贪心失效之地" },
  { id: "problems", n: "08", label: "高频题单" },
  { id: "quiz", n: "09", label: "通关测验" },
];

export default function DPChapter() {
  return (
    <main className="page" data-ch="dp">
      <Hero
        ch="dp"
        title={
          <>
            动态规划 <span className="grad">DP</span>
          </>
        }
        essence={
          <>
            动态规划不是玄学,是一句大白话:<strong>把算过的子问题记下来,别再算第二遍</strong>。
            本章从一棵会「爆炸」的递归树出发,亲眼看着 O(2ⁿ) 塌缩成 O(n) ——
            然后你会得到一套五步法,从此每道 DP 题都按同一个节奏拆。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 为什么 ================= */}
      <Section
        id="why"
        index="01"
        title="为什么会有 DP:一棵会爆炸的递归树"
        desc="DP 不是新技巧,是对「递归太浪费」的一次补救"
      >
        <div className="prose">
          <p>
            从一个人畜无害的问题开始:爬一段 n 阶的楼梯,每步跨 1 阶或 2 阶,
            有几种爬法?按序章教的递归三问来想:站在第 n 阶往回看,
            <strong>最后一步只有两种可能</strong> —— 从第 n−1 阶跨 1 步上来,
            或从第 n−2 阶跨 2 步上来。两种来路不会重复、也不会漏,所以:
            <code>f(n) = f(n−1) + f(n−2)</code>,出口是 f(1)=1、f(2)=2。
          </p>
          <p>
            三行递归就能写完,提交 —— <strong>超时</strong>。哪里出了问题?
            把 f(5) 的调用过程完整画出来(这里用等价的斐波那契 f(5) 演示,
            f(0)=0、f(1)=1),一步步播放,注意旁白里的「⚠️」:
          </p>
        </div>
        <FibNaiveTree />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">诊断 01</div>
            <div className="card-title">重叠子问题</div>
            <p>
              f(3) 被完整算了 2 遍、f(2) 3 遍、f(1) 5 遍 ——
              递归树里大量枝条<b>长得一模一样</b>。这是病根:重复劳动随 n 指数增长。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">诊断 02</div>
            <div className="card-title">最优子结构</div>
            <p>
              f(5) 的答案能由 f(4)、f(3) 的答案<b>直接拼出来</b>,
              不需要知道那些方案「具体长什么样」。子问题的答案可信、可复用。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">处方</div>
            <div className="card-title">记账</div>
            <p>
              既然同一个问题会被问很多遍,而答案又不会变 ——
              <b>算完记下来,下次直接查</b>。这一下,就是动态规划的全部。
            </p>
          </div>
        </div>
        <Callout tone="story" title="「动态规划」这名字,是一句公关话术">
          <p>
            1950 年代,Richard Bellman 在兰德公司研究多阶段决策。他后来在自传里坦白:
            选「dynamic programming」这个名字,一半是因为当时的国防部长讨厌「research」
            这个词,得挑一个<b>「连国会议员都无法反对」</b>的词 —— dynamic 听起来很有活力,
            programming 当时指「规划」而非写代码。所以别试图从字面理解它:
            它既不特别 dynamic,也不是 programming,<b>它就是「递归 + 记账」</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 记忆化 ================= */}
      <Section
        id="memo"
        index="02"
        title="记忆化:给递归发一本备忘录"
        desc="代码只加两行,复杂度从 O(2ⁿ) 塌缩到 O(n) —— 亲眼看"
      >
        <div className="prose">
          <p>
            补救方案朴素到近乎无赖:进函数先查表,<strong>「这个问题我答过吗?」</strong>
            答过就直接返回;没答过,算完先记到本子上再返回。
            这本本子叫<strong>备忘录(memo)</strong>,这种写法叫
            <strong>记忆化搜索(memoized search)</strong>。同一棵 f(5) 的树,
            这次带着备忘录再走一遍:
          </p>
        </div>
        <FibMemoTree />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            幽灵节点是<strong>根本没长出来的子树</strong> —— 每个子问题第一次被算之后,
            后续所有的重逢都变成 O(1) 查表。n 个不同的子问题、每个只算一次,
            总复杂度 <strong>O(n)</strong>。代码上,它就是「暴力递归 + 两行」:
          </p>
        </div>
        <CodeTabs
          title="climb_memo"
          java={{
            code: `class Solution {
    private int[] memo;

    public int climbStairs(int n) {
        memo = new int[n + 1];             // 0 代表「还没算过」
        return dfs(n);
    }

    private int dfs(int n) {
        if (n <= 2) return n;              // 基准情形:f(1)=1, f(2)=2
        if (memo[n] != 0) return memo[n];  // ① 先查表:答过直接用
        memo[n] = dfs(n - 1) + dfs(n - 2); // 老实计算
        return memo[n];                    // ② 记账后返回
    }
}`,
            hl: [11, 12],
            note: (
              <>
                <b>坑:</b>用数组当备忘录时,要保证「未计算」的标记值(这里是 0)
                不会和真实答案撞车 —— 若答案可能为 0,请改用 <code>-1</code> 初始化或{" "}
                <code>HashMap</code>。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def climbStairs(self, n: int) -> int:
        from functools import cache

        @cache                    # ① 一行装饰器 = 自动备忘录
        def dfs(i: int) -> int:
            if i <= 2:
                return i          # 基准情形
            return dfs(i - 1) + dfs(i - 2)  # ② 结果自动缓存

        return dfs(n)`,
            hl: [5],
            note: (
              <>
                <b>省心点:</b><code>functools.cache</code>(3.9+)把任何纯函数变成记忆化版本。
                但别忘了 Python 递归深度默认限 1000 ——
                深递归还是要 <code>sys.setrecursionlimit</code> 或改递推。
              </>
            ),
          }}
          js={{
            code: `var climbStairs = function (n) {
  const memo = new Map();          // 备忘录:i -> f(i)
  const dfs = (i) => {
    if (i <= 2) return i;          // 基准情形
    if (memo.has(i)) return memo.get(i); // ① 先查表
    const val = dfs(i - 1) + dfs(i - 2);
    memo.set(i, val);              // ② 记账后返回
    return val;
  };
  return dfs(n);
};`,
            hl: [5, 7],
            note: (
              <>
                <b>细节:</b>键是数字时用 <code>Map</code> 或数组都行;
                用普通对象 <code>{"{}"}</code> 也能跑,但键会被转成字符串,大数据量下更慢。
              </>
            ),
          }}
        />
        <Callout tone="win" title="面试可以直接这么说">
          <p>
            「我先写暴力递归,发现子问题重叠,加备忘录变成记忆化搜索,
            复杂度从 O(2ⁿ) 降到 O(n);如果需要,我可以再改成自底向上的递推。」——
            这段话完整展示了 DP 的推导链路,比背出最优解可信一百倍。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 递推 + 精讲 A ================= */}
      <Section
        id="tabulation"
        index="03"
        title="递推:把表正着填一遍"
        desc="精讲 A · LC 70 爬楼梯 —— 从递归到表格,再把表格扔掉"
        badge={<span className="lc-badge" data-d="easy">EASY</span>}
      >
        <div className="prose">
          <p>
            记忆化是<strong>自顶向下</strong>:从 f(n) 出发,递归到哪算到哪。
            换个方向想:既然 f(3) 依赖 f(2)、f(1),f(4) 依赖 f(3)、f(2)……
            那干脆<strong>从最小的子问题开始,按依赖顺序正着算</strong>,
            用一个数组把答案一格格填满 —— 这叫<strong>递推(tabulation)</strong>,
            也就是大家常说的「填 DP 表」。逐格看:
          </p>
        </div>
        <DPTable
          title="LC 70 · dp 表逐格填充(n = 6)"
          frames={F_CLIMB}
          colLabels={["1 阶", "2 阶", "3 阶", "4 阶", "5 阶", "6 阶"]}
          cornerLabel="dp"
        />
        <CodeTabs
          title="lc70_climb_stairs"
          java={{
            code: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;       // dp[1], dp[2]
        for (int i = 3; i <= n; i++) {
            int cur = prev1 + prev2;    // dp[i] = dp[i-1] + dp[i-2]
            prev2 = prev1;              // 窗口右移一格
            prev1 = cur;
        }
        return prev1;
    }
}`,
            hl: [6, 7, 8],
            note: (
              <>
                转移只依赖最近两格 → 数组直接砍成两个变量,空间 O(n) → <b>O(1)</b>。
                「滚动优化」在背包一章还会升级(那里连遍历方向都有讲究)。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        prev2, prev1 = 1, 2             # dp[1], dp[2]
        for _ in range(3, n + 1):
            prev2, prev1 = prev1, prev1 + prev2  # 一行完成转移+滚动
        return prev1`,
            hl: [7],
            note: (
              <>
                <b>优势:</b>Python 的元组解包让「转移 + 滚动」一行写完,
                且右边先整体求值,不会出现覆盖顺序 bug。
              </>
            ),
          }}
          js={{
            code: `var climbStairs = function (n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;        // dp[1], dp[2]
  for (let i = 3; i <= n; i++) {
    const cur = prev1 + prev2;     // dp[i] = dp[i-1] + dp[i-2]
    prev2 = prev1;                 // 窗口右移一格
    prev1 = cur;
  }
  return prev1;
};`,
            hl: [5, 6, 7],
            note: (
              <>
                <b>细节:</b>n ≤ 45 时结果在安全整数范围内;如果题目扩到更大,
                JS 要考虑 <code>BigInt</code>(Number 超过 2⁵³ 会丢精度)。
              </>
            ),
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>写法</th>
                <th>方向</th>
                <th>时间</th>
                <th>空间</th>
                <th>什么时候选它</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>朴素递归</b></td>
                <td>自顶向下</td>
                <td><BigO o="2n" /></td>
                <td><BigO o="n" label="O(n) 栈" /></td>
                <td>只配活在草稿纸上,用来找出转移方程</td>
              </tr>
              <tr>
                <td><b>记忆化搜索</b></td>
                <td>自顶向下</td>
                <td><BigO o="n" /></td>
                <td><BigO o="n" /></td>
                <td>状态转移复杂、或状态空间稀疏时,写起来最顺手</td>
              </tr>
              <tr>
                <td><b>递推(填表)</b></td>
                <td>自底向上</td>
                <td><BigO o="n" /></td>
                <td><BigO o="n" /></td>
                <td>依赖顺序清晰时的默认选择,没有栈深限制</td>
              </tr>
              <tr>
                <td><b>递推 + 滚动</b></td>
                <td>自底向上</td>
                <td><BigO o="n" /></td>
                <td><BigO o="1" /></td>
                <td>转移只看最近 k 格时的终极形态</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(n)</b>、空间 <b>O(1)</b>(滚动后)。高频追问:①「每次可以爬 1 到 m 阶呢?」
            → dp[i] 累加前 m 格,进一步就是完全背包(第 8 章);②「结果要模 10⁹+7 呢?」
            → 每步取模,防溢出(数学章细讲);③「n = 10¹⁸ 呢?」→ 矩阵快速幂 O(log n),
            分治章的快速幂思想 + 线性代数,面试出现率不高但值得知道方向。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 五步法 ================= */}
      <Section
        id="framework"
        index="04"
        title="DP 五步法:从此按同一个节奏拆题"
        desc="爬楼梯只是热身 —— 真正带走的是这套流程"
      >
        <div className="prose">
          <p>
            回放一遍刚才做了什么,你会发现每一步都可以标准化。
            这套流程适用于本课全部四章 DP,<strong>顺序不能乱:
            状态定义没写清楚之前,不要碰转移方程</strong>。
          </p>
        </div>
        <div className="dp-steps">
          <div className="dp-step">
            <div>
              <h4>定义状态 —— dp[i] 是什么,用一句人话说清</h4>
              <p>
                「dp[i] = 爬到第 i 阶的方案数」「dp[i] = 前 i+1 间房的最大收益」。
                检验:含义说得清、答案取得出、转移推得动。这一步值得花掉一半时间。
              </p>
            </div>
          </div>
          <div className="dp-step">
            <div>
              <h4>写转移方程 —— 按「最后一步」分类讨论</h4>
              <p>
                站在 dp[i] 往回看:最后一步有哪几种可能?每种对应哪个子问题?
                计数题相加、最值题取 min/max —— 分类必须互斥且不漏。
              </p>
            </div>
          </div>
          <div className="dp-step">
            <div>
              <h4>初始化 —— 找到「不证自明」的格子</h4>
              <p>
                dp[0]、第一行第一列、空串…… 这些格子不靠转移,靠<b>直接数</b>。
                宁可多花一分钟手数,别让错误的初始值污染整张表。
              </p>
            </div>
          </div>
          <div className="dp-step">
            <div>
              <h4>确定遍历顺序 —— 保证「用到时已算出」</h4>
              <p>
                转移用到左边就从左往右,用到上面就从上往下。
                一维还好,到了背包(第 8 章)顺序会成为主角:正序倒序,结果天差地别。
              </p>
            </div>
          </div>
          <div className="dp-step">
            <div>
              <h4>手推一个小例子 —— 用 3~6 个数据验证全表</h4>
              <p>
                别急着提交:拿 n=5 手填一遍表,和暴力答案对一次。
                DP 的 bug 几乎全在初始化和顺序上,小例子一照就现形。
              </p>
            </div>
          </div>
        </div>
        <Callout tone="warn" title="新手三大坑,全在前三步">
          <p>
            ① <b>状态含糊</b>:「dp[i] 表示答案」不叫定义 —— 是「以 i 结尾」还是「前 i 个」?
            差一个字,转移全变(53 vs 198 正是这对区别);
            ② <b>初始化省事</b>:63 题第一行遇到障碍后仍一律填 1,直接出错;
            ③ <b>转移抄模板</b>:计数用 +、最值用 min/max、可行性用「或」——
            算子跟着<b>问题问什么</b>走,不跟着上一道题走。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 网格 DP + 精讲 B ================= */}
      <Section
        id="grid"
        index="05"
        title="网格 DP:表格第一次变成二维"
        desc="精讲 B · LC 62 不同路径 —— 一套骨架,三道题换皮"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>m×n 网格,机器人从左上角出发只能向右/向下,问走到右下角有几条路。
            <b> 暴力:</b>回溯枚举每一步,路径数是组合级的 —— 20×20 就有 350 亿条。
            <b> 正解:</b>问题只问「有几条」,不问「长什么样」,这是 DP 的招牌信号。
            按五步法:状态 dp[i][j] = 到 (i,j) 的路径数;最后一步只能从上或从左来 →
            <code>dp[i][j] = dp[i−1][j] + dp[i][j−1]</code>;第一行第一列初始化为 1;
            从左到右、从上到下填:
          </p>
        </div>
        <DPTable
          title="LC 62 · 3×4 网格逐格填充(蓝色虚线格 = 转移来源)"
          frames={F62}
          colLabels={["j=0", "j=1", "j=2", "j=3"]}
          rowLabels={["i=0", "i=1", "i=2"]}
          cornerLabel="dp"
        />
        <CodeTabs
          title="lc62_unique_paths"
          java={{
            code: `class Solution {
    public int uniquePaths(int m, int n) {
        int[][] dp = new int[m][n];
        for (int i = 0; i < m; i++) dp[i][0] = 1; // 第一列:只能一路向下
        for (int j = 0; j < n; j++) dp[0][j] = 1; // 第一行:只能一路向右
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1]; // 上 + 左
        return dp[m - 1][n - 1];
    }
}`,
            hl: [8],
            note: (
              <>
                想省空间?dp[i][j] 只依赖本行左边和上一行同列 →
                用一维数组滚动:<code>dp[j] += dp[j-1]</code>,空间 O(n)。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [1] * n                  # 滚动一维:初始即第一行
        for _ in range(1, m):
            for j in range(1, n):
                dp[j] += dp[j - 1]    # 新 dp[j] = 旧 dp[j](上) + 新 dp[j-1](左)
        return dp[-1]`,
            hl: [6],
            note: (
              <>
                直接给出一维滚动版:<code>dp[j]</code> 在赋值前是「上一行的值」,
                <code>dp[j-1]</code> 已是「本行的新值」—— 一个 += 同时吃到上、左两个来源。
              </>
            ),
          }}
          js={{
            code: `var uniquePaths = function (m, n) {
  const dp = Array(n).fill(1);     // 滚动一维:初始即第一行
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[j] += dp[j - 1];          // 上(旧值) + 左(新值)
    }
  }
  return dp[n - 1];
};`,
            hl: [5],
            note: (
              <>
                m、n ≤ 100 时结果可能非常大,但本题保证答案 ≤ 2×10⁹,
                Number 装得下;更大的计数题记得上 <code>BigInt</code>。
              </>
            ),
          }}
        />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">换皮 01 · LC 63</div>
            <div className="card-title">加障碍</div>
            <p>
              障碍格 dp = 0;<b>第一行/列被障碍截断后,其后全是 0</b>,
              不能不加判断地填 1 —— 全题只考初始化的边界意识。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">换皮 02 · LC 64</div>
            <div className="card-title">求最小和</div>
            <p>
              把 + 换成 min:<code>dp[i][j] = min(上, 左) + grid[i][j]</code>,
              第一行/列变成前缀和。骨架一个字没动。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">换皮 03 · LC 120</div>
            <div className="card-title">三角形</div>
            <p>
              自底向上填,<code>dp[j] = tri[i][j] + min(dp[j], dp[j+1])</code> ——
              倒着来,左右边界问题自动消失。
            </p>
          </div>
        </div>
        <Callout tone="deep" title="工程现场:网格 DP 就在你手机里">
          <p>
            图片<b>内容感知缩放(seam carving)</b>:找一条「能量最低」的像素路径删掉,
            让照片变窄却不挤坏主体 —— 那条路径就是 64 题的最小路径和,逐行 DP 出来的。
            输入法的滑行输入、语音识别的维特比(Viterbi)解码,同样是网格上的最优路径 DP。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 打家劫舍 + 精讲 C ================= */}
      <Section
        id="rob"
        index="06"
        title="打家劫舍:「选 / 不选」决策模型"
        desc="精讲 C · LC 198 —— 通往背包问题的桥,先亲手偷一轮"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>一排房子各有现金,<strong>相邻两间同时被偷会触发警报</strong>,
            求不触发警报能偷到的最大金额。先别看解法 —— 亲手点一点,
            感受一下「约束之下的最优」有多不直观:
          </p>
        </div>
        <RobLab />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <b>暴力:</b>每间房偷或不偷,2ⁿ 种组合逐一验证 —— n=100 时宇宙都凉了。
            <b> 正解:</b>对第 i 间房,决策只有两个:<strong>偷</strong>
            (收益 = dp[i−2] + nums[i],因为 i−1 必须放弃)或<strong>不偷</strong>
            (收益 = dp[i−1],直接继承)。取较大者:
          </p>
        </div>
        <DPTable
          title="LC 198 · dp 表逐格填充(nums = [2, 7, 9, 3, 1])"
          frames={F_ROB}
          colLabels={ROB_LABELS}
          cornerLabel="dp"
          cellW={64}
        />
        <CodeTabs
          title="lc198_house_robber"
          java={{
            code: `class Solution {
    public int rob(int[] nums) {
        int n = nums.length;
        if (n == 1) return nums[0];
        int prev2 = nums[0];                    // dp[0]
        int prev1 = Math.max(nums[0], nums[1]); // dp[1]
        for (int i = 2; i < n; i++) {
            int cur = Math.max(prev1, prev2 + nums[i]); // 不偷 / 偷
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}`,
            hl: [8],
            note: (
              <>
                <b>边界:</b>n=1 要单独处理(初始化用到 nums[1])。
                转移只看前两格,照例滚动成两个变量。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def rob(self, nums: list[int]) -> int:
        prev2, prev1 = 0, 0     # 巧妙初始化:想象前面有两间空房
        for x in nums:
            prev2, prev1 = prev1, max(prev1, prev2 + x)  # 不偷 / 偷
        return prev1`,
            hl: [5],
            note: (
              <>
                <b>技巧:</b>把初始状态设为「两间收益为 0 的虚拟房」,
                连 n=1 的特判都省了 —— 虚拟边界(哨兵)是简化 DP 初始化的常用手筋。
              </>
            ),
          }}
          js={{
            code: `var rob = function (nums) {
  let prev2 = 0, prev1 = 0;   // 虚拟两间空房,免特判
  for (const x of nums) {
    const cur = Math.max(prev1, prev2 + x); // 不偷 / 偷
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
};`,
            hl: [4],
            note: (
              <>
                与 Python 版同一个哨兵技巧。注意两行滚动赋值的顺序不能颠倒 ——
                JS 没有元组解包整体求值的保护(解构赋值可以:
                <code>[prev2, prev1] = [prev1, cur]</code>)。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(n)</b>、空间 <b>O(1)</b>。经典追问链:①「房子围成一圈?」(LC 213)
            → 首尾不能同偷,拆成 [0, n−2] 和 [1, n−1] 两条链各跑一遍取 max;
            ②「房子是一棵树?」(LC 337)→ 每个节点返回「偷 / 不偷」两个状态,
            树形 DP,第 10 章主场;③「为什么 dp[i−1] 不加 nums[i]?」
            → 回到状态定义:「前 i 间的最优」不承诺偷第 i 间 —— 答不上这条,等于没懂。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 贪心失效 + 精讲 D ================= */}
      <Section
        id="coin"
        index="07"
        title="贪心失效之地:零钱兑换"
        desc="精讲 D · LC 322 —— 上一章的贪心在这里失效,DP 接住"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>给定硬币面额(每种无限枚)和金额 amount,求凑出它的最少硬币数。
            凑不出返回 −1。日常直觉(也是上一章刚学的贪心):
            <strong>每次拿能拿的最大面额</strong> —— 人民币、美元这么找零都对。
            但把面额换成 <code>[1, 3, 4]</code>、目标 ¥6:
          </p>
        </div>
        <div className="dp-duel">
          <div className="card">
            <div className="card-kicker">贪心 · 每步拿最大</div>
            <div className="card-title">
              <b className="mono">4 + 1 + 1</b>
            </div>
            <p>
              先拿 ¥4(剩 2)→ ¥3 超了,拿 ¥1(剩 1)→ 再拿 ¥1。
              <b>3 枚</b>。每一步都「当下最优」,却再也无法退回「两枚 ¥3」那条路径。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">动态规划 · 每种拿法都记账</div>
            <div className="card-title">
              <b className="mono">3 + 3</b>
            </div>
            <p>
              dp[6] 枚举最后一枚是 ¥1 / ¥3 / ¥4 三种可能,取最小 ——
              <b>2 枚</b>。它不做「选择」,它把所有选择的后果都算了一遍。
            </p>
          </div>
        </div>
        <div className="prose">
          <p>
            为什么贪心会失效?硬币系统 [1,3,4] 不满足<strong>贪心选择性质</strong>:
            拿走 ¥4 这个「局部最优」会破坏「全局最优」(3+3)的结构。
            贪心章教过:<strong>证明不了交换论证,就不要贪</strong>。此时退回 DP:
            状态 dp[a] = 凑出金额 a 的最少硬币数,按「最后一枚硬币是谁」分类:
          </p>
        </div>
        <DPTable
          title="LC 322 · dp 表逐格填充(coins = [1, 3, 4],amount = 6)"
          frames={F_COIN}
          colLabels={COIN_LABELS}
          cornerLabel="dp"
        />
        <CodeTabs
          title="lc322_coin_change"
          java={{
            code: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);   // 「无穷大」:再多也到不了 amount+1 枚
        dp[0] = 0;                     // 凑 ¥0 用 0 枚
        for (int a = 1; a <= amount; a++)
            for (int c : coins)
                if (c <= a)
                    dp[a] = Math.min(dp[a], dp[a - c] + 1); // 最后一枚是 c
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
            hl: [9],
            note: (
              <>
                <b>坑:</b>「无穷大」别用 <code>Integer.MAX_VALUE</code> ——
                +1 会溢出成负数。用 <code>amount + 1</code> 这种「不可能达到的值」最稳。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        INF = float("inf")
        dp = [0] + [INF] * amount      # dp[0] = 0,其余未知
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a:
                    dp[a] = min(dp[a], dp[a - c] + 1)  # 最后一枚是 c
        return -1 if dp[amount] == INF else dp[amount]`,
            hl: [8],
            note: (
              <>
                Python 的 <code>float(&quot;inf&quot;)</code> 加 1 依然是 inf,
                天然免疫溢出 —— 「凑不出」的状态会原样传播到最后。
              </>
            ),
          }}
          js={{
            code: `var coinChange = function (coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;                       // 凑 ¥0 用 0 枚
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1); // 最后一枚是 c
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
};`,
            hl: [6],
            note: (
              <>
                <code>Infinity</code> 参与 <code>Math.min</code> 完全安全。
                时间 O(amount × 硬币种数),空间 O(amount)。
              </>
            ),
          }}
        />
        <Callout tone="deep" title="预告:这道题还有第二重身份">
          <p>
            「每种硬币无限枚 + 凑目标值」——
            这是<b>完全背包</b>的标准形状。第 8 章会把 322 重新建模一遍:
            为什么内外层循环可以交换?把 min 换成「求方案数」为什么就变成了 LC 518?
            同一道题两次建模,是 lc.md 训练路线特意保留的「一题两吃」。
          </p>
        </Callout>
        <Callout tone="idea" title="范式雷达 · 阶段小结">
          <p>
            走到这里,你已经见过三种世界观在同一类问题上的表现:
            <b>回溯</b>枚举所有拿法(必对,但 O(面额^金额) 起步)→
            <b>贪心</b>每步拿最大(最快,但需要证明,[1,3,4] 上直接失效)→
            <b>DP</b> 枚举决策 + 记账(必对,多项式时间)。
            面试遇到最优化问题,按这个顺序梳理一遍,就是标准的作答顺序。
          </p>
        </Callout>
      </Section>

      {/* ================= §08 题单 ================= */}
      <Section
        id="problems"
        index="08"
        title="高频题单:DP 入门 13 题"
        desc="按「线性 → 网格 → 决策」分层,由易到难。先想 30 秒再看提示"
        badge={<span className="chip">主线必做</span>}
      >
        <ProblemSet ch="dp" items={PROBLEMS} />
      </Section>

      {/* ================= §09 Quiz ================= */}
      <Section
        id="quiz"
        index="09"
        title="通关测验"
        desc="8 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="dp" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            DP = <b>递归 + 记账</b>:适用前提是<b>重叠子问题</b>(记账有利可图)+
            <b>最优子结构</b>(答案能往上拼)。
          </>,
          <>
            标准推导链:<b>暴力递归 → 记忆化搜索 → 递推填表 → 滚动优化</b> ——
            面试时把这条链说出来,比直接背最优解值钱。
          </>,
          <>
            五步法:<b>定义状态 → 按「最后一步」写转移 → 初始化 → 定顺序 → 手推小例子</b>;
            状态定义没说清之前,不碰转移方程。
          </>,
          <>
            转移方程的算子跟着问题走:计数<b>相加</b>(70/62)、
            最值<b>取 min/max</b>(64/198/322)—— 骨架可复用,算子不能抄。
          </>,
          <>
            「<b>选 / 不选</b>」(198)是 DP 最重要的决策模型,直通背包;
            「<b>枚举最后一步</b>」(322 的最后一枚硬币)是万能的转移起手式。
          </>,
          <>
            贪心失效之处正是 DP 的主场:证不出贪心选择性质(硬币 [1,3,4]),
            就退回「枚举所有决策 + 记账」。
          </>,
          <>
            空间优化法则:转移只看最近 k 格 ⇒ 空间可压到 O(k) ——
            但<b>先写对二维/一维全表,再优化</b>,顺序别反。
          </>,
        ]}
      />

      <ChapterFooter ch="dp" />
    </main>
  );
}
