"use client";

// 第 8 章 · 背包问题 —— DP 系列第二章,承接第 7 章「选 / 不选」模型与 322 零钱。
// 十段式结构:为什么是背包 → 0-1 二维表 → 一维滚动(为什么倒序,正序 vs 倒序对比)→
// 装满型(416 精讲)→ 计数型(494 精讲,回溯 vs 背包)→ 二维费用(474)→
// 完全背包(为什么正序,322 盘)→ 排列 vs 组合(518 vs 377 精讲)→ 题单 → 测验。
// DPTable 是本章主场;一维滚动正序/倒序对比动画在 ./viz(RollingCompare)。

import "./chapter.css";
import { Hero, Section, Callout, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { DPTable, type DPFrame, type DPCell } from "@/lib/algviz";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { PROBLEMS, QUIZ } from "@/lib/knapsack-data";
import { KnapSackLab, RollingCompare, TargetSumTree } from "./viz";

/* ============ 通用一维行帧生成器 ============ */

function row1D(
  vals: (number | string)[],
  o: { cur?: number[]; src?: number[]; ok?: number[]; ghost?: number[] } = {},
): DPCell[][] {
  return [
    vals.map((v, i) => {
      let state: DPCell["state"];
      if (o.ok?.includes(i)) state = "ok";
      else if (o.cur?.includes(i)) state = "cur";
      else if (o.src?.includes(i)) state = "src";
      else if (o.ghost?.includes(i)) state = "ghost";
      else state = "done";
      return { v, state };
    }),
  ];
}

/* ============ 精讲基座 · 0-1 背包二维表 ============ */
/* 物品 w=[1,3,4] v=[15,20,30],容量 W=4;答案 dp[3][4]=35(物品①+②) */

const DP2 = [
  [0, 0, 0, 0, 0],
  [0, 15, 15, 15, 15],
  [0, 15, 15, 20, 35],
  [0, 15, 15, 20, 35],
];

function knap2D(
  uptoRow: number,
  cur?: [number, number],
  srcs?: [number, number][],
  ok?: [number, number],
): DPCell[][] {
  return DP2.map((row, i) =>
    row.map((v, j) => {
      if (ok && ok[0] === i && ok[1] === j) return { v, state: "ok" as const };
      if (cur && cur[0] === i && cur[1] === j) return { v, state: "cur" as const };
      if (srcs?.some(([a, b]) => a === i && b === j)) return { v, state: "src" as const };
      if (i <= uptoRow) return { v, state: "done" as const };
      return { v: "?", state: "ghost" as const };
    }),
  );
}

const F_2D: DPFrame[] = [
  {
    cells: knap2D(-1),
    msg: (
      <>
        物品:①w1·值15、②w3·值20、③w4·值30,背包容量 <b>4</b>。
        状态 <b>dp[i][j] = 只从前 i 件里挑、容量不超过 j 时的最大价值</b>。整表待填。
      </>
    ),
  },
  {
    cells: knap2D(0),
    msg: (
      <>
        第 0 行 = <b>一件物品都不拿</b>:无论容量多大,价值都是 0 —— 这是不证自明的边界,
        整张表从这一行「长」出来。
      </>
    ),
  },
  {
    cells: knap2D(1, [1, 4], [[0, 4], [0, 3]]),
    msg: (
      <>
        物品①(w1·v15):容量 ≥ 1 都装得下。dp[1][4] = max(<b>不装</b> dp[0][4]=0,
        <b>装</b> dp[0][<b>4−1</b>]+15=15)= <b>15</b>。「装」这一项要先<b>空出 1 的容量</b>再加价值。
      </>
    ),
  },
  {
    cells: knap2D(2, [2, 4], [[1, 4], [1, 1]]),
    msg: (
      <>
        物品②(w3·v20)在 dp[2][4] 面临关键二选一:<b>不装</b> = dp[1][4]=15;
        <b>装</b> = dp[1][<b>4−3</b>]+20 = 15+20 = <b>35</b>。装赢了 —— 答案雏形出现。
      </>
    ),
  },
  {
    cells: knap2D(3, [3, 4], [[2, 4], [2, 0]]),
    msg: (
      <>
        物品③(w4·v30)在 dp[3][4]:<b>不装</b> = dp[2][4]=35;<b>装</b> = dp[2][0]+30 = 30。
        这次<b>不装赢了</b> —— 相机太占地方,腾不出更值钱的搭配。
      </>
    ),
  },
  {
    cells: knap2D(3, undefined, undefined, [3, 4]),
    msg: (
      <>
        右下角 <b>35</b> 就是答案(装物品①+②)。每格 O(1)、共 (n+1)(W+1) 格 →{" "}
        <b>O(nW)</b>。对比回溯枚举 2ⁿ 个子集,这张表只有 20 格。
      </>
    ),
  },
];

/* ============ §03 · 一维滚动:与二维每一行对齐 ============ */

const F_ROLL: DPFrame[] = [
  {
    cells: row1D([0, 0, 0, 0, 0]),
    msg: (
      <>
        只留一行:dp[j] = 容量 j 的最大价值,初值全 0。每处理一件物品,
        就从右往左<b>倒序</b>刷一遍这一行 —— 刷完的一行,正好等于二维表的对应行。
      </>
    ),
  },
  {
    cells: row1D([0, 15, 15, 15, 15], { cur: [1, 2, 3, 4] }),
    msg: (
      <>
        处理物品①(w1·v15)后:dp = [0,15,15,15,15] —— 和二维表第 1 行<b>一模一样</b>。
      </>
    ),
  },
  {
    cells: row1D([0, 15, 15, 20, 35], { cur: [3, 4] }),
    msg: (
      <>
        处理物品②(w3·v20):dp[4]=35、dp[3]=20 被刷新 —— 对应二维表第 2 行。
        为什么必须倒序?看下面的对比动画。
      </>
    ),
  },
  {
    cells: row1D([0, 15, 15, 20, 35], { ok: [4] }),
    msg: (
      <>
        处理物品③(w4·v30)后 dp 不变,dp[4] = <b>35</b> 就是答案。
        空间从 O(nW) 压到 <b>O(W)</b>,一张表塌成一行。
      </>
    ),
  },
];

/* ============ 精讲 A · LC 416 分割等和子集(布尔装满型) ============ */
/* nums=[1,5,11,5] sum=22 target=11;子集 {1,5,5}=11 ⇒ 可等分 */

function boolRow(
  reach: Set<number>,
  n: number,
  extra: { cur?: number[]; ok?: number[] } = {},
): DPCell[][] {
  const vals = Array.from({ length: n }, (_, i) => (reach.has(i) ? "✓" : "·"));
  const ghost = Array.from({ length: n }, (_, i) => i).filter((i) => !reach.has(i));
  return row1D(vals, { ghost, ...extra });
}

const F_416: DPFrame[] = [
  {
    cells: boolRow(new Set([0]), 12),
    msg: (
      <>
        sum=22 → target = <b>11</b>。dp[j] = 能否从数组里挑几个数正好凑出 j。
        初始只有 dp[0]=✓(什么都不选,凑出 0)。目标:点亮 dp[11]。
      </>
    ),
  },
  {
    cells: boolRow(new Set([0, 1]), 12, { cur: [1] }),
    msg: (
      <>
        放数字 <b>1</b>:凡是 dp[j−1] 为 ✓ 的地方,dp[j] 也变 ✓ → dp[1] 点亮。
        容量倒序刷,保证 1 只被用一次。
      </>
    ),
  },
  {
    cells: boolRow(new Set([0, 1, 5, 6]), 12, { cur: [5, 6] }),
    msg: (
      <>
        放数字 <b>5</b>:dp[5](=5)、dp[6](=1+5)相继点亮。可达集合:{"{0,1,5,6}"}。
      </>
    ),
  },
  {
    cells: boolRow(new Set([0, 1, 5, 6, 11]), 12, { cur: [11] }),
    msg: (
      <>
        放数字 <b>11</b>:dp[11] = dp[0] 为 ✓ → <b>dp[11] 点亮!</b>说明 {"{11}"} 这一堆自成一半。
      </>
    ),
  },
  {
    cells: boolRow(new Set([0, 1, 5, 6, 10, 11]), 12, { ok: [11] }),
    msg: (
      <>
        放第二个 <b>5</b>:dp[10](=5+5)也可达。dp[11] 早已为真 —— <b>能等分</b>({"{1,5,5}"} vs {"{11}"})。
        时间 O(n·target),空间 O(target)。
      </>
    ),
  },
];

/* ============ 精讲 B · LC 494 目标和(计数型) ============ */
/* 与上方决策树同一实例:nums=[1,1,1] target=1 → P=(3+1)/2=2;凑 2 的子集数 = C(3,2)=3 */

const F_494: DPFrame[] = [
  {
    cells: row1D([1, 0, 0], { ghost: [1, 2] }),
    msg: (
      <>
        接着上面那棵树(nums=[1,1,1]、target=1)算:转化后数「凑出和为 P=2 的子集有几个」。
        dp[j] = 凑出 j 的方案数,dp[0] = <b>1</b>(空集凑出 0,算一种)。转移{" "}
        <span className="mono">dp[j] += dp[j−num]</span>,倒序。
      </>
    ),
  },
  {
    cells: row1D([1, 1, 0], { cur: [1], ghost: [2] }),
    msg: <>放第 1 个「1」:dp[1] += dp[0] → dp = [1,1,0]。</>,
  },
  {
    cells: row1D([1, 2, 1], { cur: [1, 2] }),
    msg: <>放第 2 个「1」:dp = [1,2,1] —— 认得吗?这是杨辉三角的第 2 行(每格由上一行「错位相加」)。</>,
  },
  {
    cells: row1D([1, 3, 3], { ok: [2] }),
    msg: (
      <>
        放第 3 个「1」:dp = [1,3,3]。dp[2] = <b>3</b> = C(3,2) —— 和上面回溯树数出的
        <b>3 条</b>路径(++−、+−+、−++)完全对上,但只花了 O(n·P) 时间。
      </>
    ),
  },
];

/* ============ §07 · 完全背包重建模 322(硬币逐枚正序) ============ */
/* coins=[1,3,4] amount=6;dp[6]=2(3+3),与第 7 章 min-DP 结论一致 */

const INF = "∞";
const F_322: DPFrame[] = [
  {
    cells: row1D([0, INF, INF, INF, INF, INF, INF], { ghost: [1, 2, 3, 4, 5, 6] }),
    msg: (
      <>
        换个视角:硬币 = 可<b>无限取</b>的物品,金额 = 容量。dp[j] = 凑出 j 的最少硬币数,
        dp[0]=0,其余先记 ∞。完全背包内层容量<b>正序</b>。
      </>
    ),
  },
  {
    cells: row1D([0, 1, 2, 3, 4, 5, 6], { cur: [1, 2, 3, 4, 5, 6] }),
    msg: (
      <>
        硬币 <b>¥1</b> 正序刷:dp[2]=dp[1]+1=2、dp[6]=6 —— 注意 dp[2] 用了<b>两枚 ¥1</b>!
        正序让「本轮已放过 ¥1」的结果再喂给更大容量,同一硬币被<b>反复使用</b> —— 这正是完全背包要的。
      </>
    ),
  },
  {
    cells: row1D([0, 1, 2, 1, 2, 3, 2], { cur: [6], src: [3] }),
    msg: (
      <>
        硬币 <b>¥3</b>:先有 dp[3]=dp[0]+1=1。关键看 dp[6] = <b>dp[3]</b>+1 = <b>2</b> ——
        蓝色虚线的 dp[3] 里已含一枚 ¥3,<b>正序</b>让它被复用,再加一枚 ¥3 = 两枚。
        凑 6 元由此出现「两枚 ¥3」的走法。
      </>
    ),
  },
  {
    cells: row1D([0, 1, 2, 1, 1, 2, 2], { ok: [6], cur: [4, 5] }),
    msg: (
      <>
        硬币 <b>¥4</b>:dp[4]=dp[0]+1=1、dp[6] 保持 <b>2</b>。答案 <b>2</b>(3+3)——
        和第 7 章「枚举最后一枚硬币」的 min-DP 结论完全一致,只是这次按「一枚枚硬币」填。
      </>
    ),
  },
];

/* ============ 精讲 C · LC 518 组合数(外硬币内容量) ============ */
/* coins=[1,2,5] amount=5 → 4 种组合 */

const F_518: DPFrame[] = [
  {
    cells: row1D([1, 0, 0, 0, 0, 0], { ghost: [1, 2, 3, 4, 5] }),
    msg: (
      <>
        求「凑 5 元有几种<b>组合</b>」(1+2 与 2+1 算一种)。dp[j] = 组合数,dp[0]=1。
        <b>外层遍历硬币</b>、内层容量正序 —— 这个顺序是数出组合数的关键。
      </>
    ),
  },
  {
    cells: row1D([1, 1, 1, 1, 1, 1], { cur: [1, 2, 3, 4, 5] }),
    msg: <>只用 <b>¥1</b>:每个金额都只有 1 种凑法(全用 1)。dp = [1,1,1,1,1,1]。</>,
  },
  {
    cells: row1D([1, 1, 2, 2, 3, 3], { cur: [2, 3, 4, 5] }),
    msg: (
      <>
        加入 <b>¥2</b>:dp[j] += dp[j−2]。dp[4]=3(1+1+1+1、1+1+2、2+2)、dp[5]=3。
        因为 ¥2「整体」在 ¥1 之后才登场,不会数出「先 2 后 1」这种重复顺序。
      </>
    ),
  },
  {
    cells: row1D([1, 1, 2, 2, 3, 4], { ok: [5] }),
    msg: (
      <>
        加入 <b>¥5</b>:dp[5] += dp[0] → <b>4</b> 种组合:{"{5}"}、{"{1,2,2}"}、{"{1,1,1,2}"}、{"{1,1,1,1,1}"}。
      </>
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "why", n: "01", label: "为什么是背包" },
  { id: "table2d", n: "02", label: "0-1 二维表" },
  { id: "rolling", n: "03", label: "一维·为什么倒序" },
  { id: "subset", n: "04", label: "装满型 · 416" },
  { id: "count", n: "05", label: "计数型 · 494" },
  { id: "twocost", n: "06", label: "二维费用 · 474" },
  { id: "complete", n: "07", label: "完全背包 · 正序" },
  { id: "permcomb", n: "08", label: "排列 vs 组合" },
  { id: "problems", n: "09", label: "高频题单" },
  { id: "quiz", n: "10", label: "通关测验" },
];

export default function KnapsackChapter() {
  return (
    <main className="page" data-ch="knapsack">
      <Hero
        ch="knapsack"
        title={
          <>
            背包问题 <span className="grad">Knapsack</span>
          </>
        }
        essence={
          <>
            一个容量有限的书包,一堆各有重量与价值的物品 ——{" "}
            <strong>怎么装,价值最大?</strong>这道题本身不难,难的是它会换上千百种皮:
            分割数组、凑硬币、拼单词、掷骰子……本章把第 7 章的「选 / 不选」升级成一套建模流程,
            并讲透全书最容易翻车的一行:<strong>一维滚动数组,到底正序还是倒序。</strong>
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 为什么是背包 ================= */}
      <Section
        id="why"
        index="01"
        title="为什么是背包:「选 / 不选」撞上了容量墙"
        desc="第 7 章打家劫舍的决策模型,加一条「总容量有限」的约束,就是背包"
      >
        <div className="prose">
          <p>
            上一章的打家劫舍,每间房只有「偷 / 不偷」两个决策;背包问题几乎一样 —— 每件物品只有
            <strong>「装 / 不装」</strong>两个决策。唯一的新东西,是一堵<strong>容量墙</strong>:
            所有装进去的物品,重量之和不能超过背包容量。先亲手装一次,感受这堵墙有多难绕:
          </p>
        </div>
        <KnapSackLab />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <b>暴力怎么做?</b>每件物品选或不选,n 件就是 2ⁿ 种组合,逐一验证重量、比价值 ——
            30 件物品就是十亿级,回溯直接超时(这正是第 5 章回溯树的老问题)。
            <b> 为什么能优化?</b>因为大量子问题在重复:「前 3 件、容量 5 的最优」会被无数条决策路径反复问到。
            重叠子问题 + 最优子结构(小背包的最优能拼出大背包的最优)—— DP 的两个前提全齐,记账即可。
          </p>
        </div>
        <div className="kp-def">
          <h4>📦 背包问题的标准形状(记住这四个问句)</h4>
          <p>
            ① <b>谁是物品</b>(一件件被决策的东西)?② <b>谁是容量</b>(那堵墙,常是「和 / 金额 / 长度」)?
            ③ <b>每件能用几次</b>(一次 = 0-1 背包;无限次 = 完全背包;有限几次 = 多重背包)?
            ④ <b>求什么</b>(最大价值 / 能否装满 / 方案数 / 最少个数)?
            —— 把这四问答清楚,剩下的几乎就是套模板。
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">物品用几次</div>
            <div className="card-title">🎒 0-1 背包</div>
            <p>
              每件物品<b>最多用一次</b>。是最基础的形态,分割子集、目标和、一和零都是它。
              一维滚动时容量<b>倒序</b>。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">物品用几次</div>
            <div className="card-title">♾️ 完全背包</div>
            <p>
              每件物品可<b>无限次</b>使用。凑硬币、完全平方数、单词拆分都是它。
              一维滚动时容量<b>正序</b> —— 和 0-1 只差这一行。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">物品用几次</div>
            <div className="card-title">🔢 多重背包</div>
            <p>
              每件物品有<b>固定个数</b>上限。可拆成 0-1(或二进制优化),
              掷骰子、分组选择都属于这一支,§07 末尾一句话带过。
            </p>
          </div>
        </div>
        <Callout tone="story" title="背包问题:计算机科学的「网红题」">
          <p>
            背包问题(Knapsack Problem)是运筹学与计算机科学里被研究得最透的组合优化问题之一,
            19 世纪末就有数学家讨论过它的雏形。它还是<b>密码学的地基</b>之一 ——
            1978 年的 Merkle–Hellman 背包密码系统,正是拿「子集和难解」当安全性来源(后来被攻破了)。
            你在 LeetCode 上刷的这些题,是它最温柔的一面:数据小,还保证有多项式解法。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 0-1 背包二维表 ================= */}
      <Section
        id="table2d"
        index="02"
        title="0-1 背包:从一张二维表推起"
        desc="dp[i][j] = 前 i 件物品、容量 j 的最大价值 —— 「装 / 不装」写成转移方程"
        badge={<span className="chip">地基</span>}
      >
        <div className="prose">
          <p>
            按第 7 章的五步法来。<b>定义状态:</b>
            <code>dp[i][j] = 只考虑前 i 件物品、背包容量不超过 j 时的最大价值</code>。
            <b> 写转移:</b>站在第 i 件物品前,只有两条路 ——
          </p>
          <ul>
            <li>
              <b>不装它:</b>价值等于「前 i−1 件、容量还是 j」的最优,即 <code>dp[i−1][j]</code>;
            </li>
            <li>
              <b>装它:</b>得先空出 w[i] 的容量,再加上它的价值,即{" "}
              <code>dp[i−1][j−w[i]] + v[i]</code>(前提 j ≥ w[i]);
            </li>
          </ul>
          <p>两条路取较大者。逐格看这张表怎么长出来(蓝色虚线格 = 转移来源):</p>
        </div>
        <div className="kp-formula">
          dp[i][j] = max( <b>dp[i−1][j]</b> <span className="dim">不装</span> ,{" "}
          <b>dp[i−1][j−w[i]] + v[i]</b> <span className="dim">装(j ≥ w[i])</span> )
        </div>
        <DPTable
          title="0-1 背包 · 二维表逐行填充(物品 w=[1,3,4] v=[15,20,30],容量 4)"
          frames={F_2D}
          colLabels={["0", "1", "2", "3", "4"]}
          rowLabels={["∅", "①w1·v15", "②w3·v20", "③w4·v30"]}
          cornerLabel="i \ j"
          cellW={62}
        />
        <CodeTabs
          title="knapsack01_2d"
          java={{
            code: `class Solution {
    // 0-1 背包:前 i 件物品、容量 j 的最大价值
    public int knapsack01(int[] w, int[] v, int W) {
        int n = w.length;
        int[][] dp = new int[n + 1][W + 1];      // dp[0][*] = 0:没有物品,价值 0
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j <= W; j++) {
                dp[i][j] = dp[i - 1][j];         // 不装第 i 件
                if (j >= w[i - 1])               // 装得下才考虑装
                    dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - w[i - 1]] + v[i - 1]);
            }
        }
        return dp[n][W];
    }
}`,
            hl: [8, 9, 10],
            note: (
              <>
                <b>坑:</b>物品下标从 0 起、dp 行号从 1 起(第 0 行留给「没有物品」),
                所以取物品要写 <code>w[i-1]</code>、<code>v[i-1]</code> —— 差一位是最常见的手滑。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def knapsack01(self, w: list[int], v: list[int], W: int) -> int:
        n = len(w)
        dp = [[0] * (W + 1) for _ in range(n + 1)]
        for i in range(1, n + 1):
            for j in range(W + 1):
                dp[i][j] = dp[i - 1][j]                      # 不装
                if j >= w[i - 1]:
                    dp[i][j] = max(dp[i][j], dp[i - 1][j - w[i - 1]] + v[i - 1])
        return dp[n][W]`,
            hl: [7, 8, 9],
            note: (
              <>
                <b>关键观察:</b>二维写法里容量 j <b>正序倒序都对</b> —— 因为 dp[i][*] 只读
                dp[i−1][*](上一行),本行怎么填都不干扰。顺序的讲究,是压成一维之后才冒出来的(见 §03)。
              </>
            ),
          }}
          js={{
            code: `var knapsack01 = function (w, v, W) {
  const n = w.length;
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j <= W; j++) {
      dp[i][j] = dp[i - 1][j];                 // 不装
      if (j >= w[i - 1])
        dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - w[i - 1]] + v[i - 1]); // 装
    }
  }
  return dp[n][W];
};`,
            hl: [6, 7, 8],
            note: (
              <>
                <code>Array.from(&#123;length&#125;, () =&gt; Array(...).fill(0))</code> 才能建出
                「每行独立」的二维数组;写成 <code>Array(n).fill(Array(...))</code> 会让所有行共享同一个引用。
              </>
            ),
          }}
        />
        <Callout tone="warn" title="「装它」为什么读的是 dp[i−1][j−w],不是 dp[i][j−w]?">
          <p>
            因为第 i 件物品<b>只有一件</b>。要装它,就必须回到「还没考虑它」的状态 dp[i−1][…] 去腾容量,
            否则会把它重复装入。把 <code>i−1</code> 写成 <code>i</code>,0-1 背包就悄悄变成了完全背包
            (物品可无限取)—— 这个一字之差,正是 §07 的主角。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 一维滚动 · 为什么倒序 ================= */}
      <Section
        id="rolling"
        index="03"
        title="一维滚动数组:全书最该背下来的一行"
        desc="二维表压成一行:0-1 背包容量【倒序】—— 亲眼看正序如何把物品算两次"
        badge={<span className="lc-badge" data-d="hard">易错点</span>}
      >
        <div className="prose">
          <p>
            观察上面的转移:dp[i][j] 只依赖<strong>上一行</strong>的两个格子。既然只看上一行,
            那就别存整张表了 —— 用<strong>一行</strong>反复覆盖。二维的 dp[i][j] 变成一维的 dp[j],
            每来一件物品就整体刷新一次。刷完一遍,这一行恰好等于二维表的对应行:
          </p>
        </div>
        <DPTable
          title="一维 dp 刷新:每处理一件物品 = 二维表的一行"
          frames={F_ROLL}
          colLabels={["0", "1", "2", "3", "4"]}
          cornerLabel="dp"
          cellW={62}
        />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            但压成一维带来一个致命细节:刷新 dp[j] 时,我要读 dp[j−w] ——
            <strong>它到底是「上一行的旧值」还是「本行刚被我改过的新值」?</strong>
            0-1 背包要的是<strong>上一行的旧值</strong>(那才代表「还没放这件物品」)。
            遍历方向决定了这一点。切换下面的按钮,同一件物品,看正序和倒序读到的值有何不同:
          </p>
        </div>
        <RollingCompare />
        <div className="kp-duel">
          <div className="card">
            <div className="card-kicker">← 倒序 · 正确</div>
            <div className="card-title">
              <b className="mono">dp[4] = 3</b>
            </div>
            <p>
              j 从大到小:算 dp[j] 时,dp[j−w] 还没被本轮碰过,读到的是<b>上一行旧值</b> ——
              物品只被放进一次。这是 0-1 背包的正解。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">→ 正序 · 出错</div>
            <div className="card-title">
              <b className="mono">dp[4] = 6</b>
            </div>
            <p>
              j 从小到大:算 dp[4] 时 dp[2] 已被本轮改成 3(已含一件),再 +3 得 6 ——
              <b>同一件物品放了两次</b>。0-1 背包禁止。
            </p>
          </div>
        </div>
        <CodeTabs
          title="knapsack01_1d"
          java={{
            code: `class Solution {
    public int knapsack01(int[] w, int[] v, int W) {
        int[] dp = new int[W + 1];                // dp[j] = 容量 j 的最大价值
        for (int i = 0; i < w.length; i++)        // 外层:一件件物品
            for (int j = W; j >= w[i]; j--)       // 内层:容量【倒序】!
                dp[j] = Math.max(dp[j], dp[j - w[i]] + v[i]);
        return dp[W];
    }
}`,
            hl: [5, 6],
            note: (
              <>
                倒序让 dp[j−w[i]] 读到「还没放本物品」的旧值;内层条件写成 <code>j &gt;= w[i]</code>{" "}
                顺手省掉了「装得下吗」的判断(装不下的容量根本不进循环)。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def knapsack01(self, w, v, W):
        dp = [0] * (W + 1)
        for i in range(len(w)):
            for j in range(W, w[i] - 1, -1):      # 容量倒序:W → w[i]
                dp[j] = max(dp[j], dp[j - w[i]] + v[i])
        return dp[W]`,
            hl: [5, 6],
            note: (
              <>
                <code>range(W, w[i] - 1, -1)</code> 表示「从 W 递减到 w[i]」——
                终点写 <code>w[i]-1</code> 是因为 range 右端开区间。少减这个 1,就会漏掉 j=w[i] 那一格。
              </>
            ),
          }}
          js={{
            code: `var knapsack01 = function (w, v, W) {
  const dp = Array(W + 1).fill(0);
  for (let i = 0; i < w.length; i++)
    for (let j = W; j >= w[i]; j--)             // 容量倒序
      dp[j] = Math.max(dp[j], dp[j - w[i]] + v[i]);
  return dp[W];
};`,
            hl: [3, 4],
            note: (
              <>
                记住这个对照:<b>0-1 背包 → 内层倒序</b>;<b>完全背包 → 内层正序</b>。
                整段代码就这一行不同,却决定了物品能用一次还是无限次。
              </>
            ),
          }}
        />
        <Callout tone="win" title="面试话术:一句话讲清倒序">
          <p>
            「一维数组是二维 dp[i][·] 的滚动。0-1 背包的转移读上一行的 dp[i−1][j−w],
            所以我倒序遍历容量,保证覆盖 dp[j] 之前 dp[j−w] 还是上一行的值 ——
            这样每件物品只会被放进一次。」把这段说出来,面试官就知道你是真懂,不是背的。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 装满型 · 416 ================= */}
      <Section
        id="subset"
        index="04"
        title="装满型:从「最大价值」到「能不能装满」"
        desc="精讲 A · LC 416 分割等和子集 —— 价值题的孪生兄弟"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>给一个正整数数组,能否把它分成两个<strong>和相等</strong>的子集?
            <b> 转化:</b>两堆和相等 ⇒ 每堆都是 <code>sum/2</code>。sum 是奇数直接无解;
            否则问题变成:<strong>能否挑若干个数,正好凑出 sum/2?</strong>这就是一个背包 ——
            物品是每个数,容量是 sum/2,每个数用一次(0-1),但求的不是最大价值,而是
            <strong>「能否恰好装满」</strong>。
          </p>
          <p>
            <b>为什么能这么转?</b>因为「最大价值」和「能否装满」共用同一套「装 / 不装」骨架,
            只需把转移的算子从 <code>max</code> 换成布尔<strong>「或」</strong>:
            dp[j] = 「本来就能凑出 j」<code>||</code>「凑出 j−num 后再放一个 num」。看整张布尔表点亮:
          </p>
        </div>
        <DPTable
          title="LC 416 · 布尔表逐帧点亮(nums=[1,5,11,5],target=11)"
          frames={F_416}
          colLabels={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]}
          cornerLabel="dp"
          cellW={38}
        />
        <CodeTabs
          title="lc416_partition_equal_subset"
          java={{
            code: `class Solution {
    public boolean canPartition(int[] nums) {
        int sum = 0;
        for (int x : nums) sum += x;
        if (sum % 2 != 0) return false;         // 奇数无法等分
        int target = sum / 2;
        boolean[] dp = new boolean[target + 1];
        dp[0] = true;                           // 凑 0 永远可行(什么都不选)
        for (int x : nums)
            for (int j = target; j >= x; j--)   // 0-1 背包:容量倒序
                dp[j] = dp[j] || dp[j - x];
        return dp[target];
    }
}`,
            hl: [10, 11],
            note: (
              <>
                <b>先判奇偶</b>是 O(1) 的剪枝,能挡掉一半用例。转移用布尔「或」——
                「装满型」只关心能不能,不关心价值。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def canPartition(self, nums: list[int]) -> bool:
        s = sum(nums)
        if s % 2:
            return False
        target = s // 2
        dp = [True] + [False] * target
        for x in nums:
            for j in range(target, x - 1, -1):   # 容量倒序
                dp[j] = dp[j] or dp[j - x]
        return dp[target]`,
            hl: [9, 10],
            note: (
              <>
                进阶:Python 可用大整数当 bitset —— <code>bits |= bits &lt;&lt; x</code> 一次位运算
                完成整层转移,常数极小。第 4 章「位运算表示集合」正是为这类技巧铺路。
              </>
            ),
          }}
          js={{
            code: `var canPartition = function (nums) {
  const sum = nums.reduce((a, b) => a + b, 0);
  if (sum % 2) return false;
  const target = sum / 2;
  const dp = Array(target + 1).fill(false);
  dp[0] = true;
  for (const x of nums)
    for (let j = target; j >= x; j--)
      dp[j] = dp[j] || dp[j - x];
  return dp[target];
};`,
            hl: [8, 9],
            note: (
              <>
                小优化:内层若发现 <code>dp[target]</code> 已为 true,可直接返回。
                复杂度 O(n·target),因约束里 sum ≤ 20000,完全跑得动。
              </>
            ),
          }}
        />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">变式 · LC 1049</div>
            <div className="card-title">🪨 最后一块石头 II</div>
            <p>
              把石头分两堆使差最小 ⇒ 让一堆尽量接近 sum/2。容量 sum/2、重量既是费用也是价值,
              求<b>最多装多满</b>,答案 = sum − 2×maxHalf。416 的「能否」升级成「多满」。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">变式 · LC 494</div>
            <div className="card-title">🎯 目标和</div>
            <p>
              把「能否装满」再升级成「有几种装满法」—— 下一节主讲。装满型的三级跳:
              <b>能否 → 多满 → 几种</b>。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">识别信号</div>
            <div className="card-title">🔎 何时想到装满型</div>
            <p>
              题面出现「分成两半」「凑出某个和」「刚好等于」—— 先算总和、定出目标容量,
              十有八九是 0-1 背包的装满型。
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §05 计数型 · 494 ================= */}
      <Section
        id="count"
        index="05"
        title="计数型:回溯的 2ⁿ,翻译成背包的记账"
        desc="精讲 B · LC 494 目标和 —— 同一道题,回溯与背包一题两吃"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>给数组 nums,给每个数前面添 <code>+</code> 或 <code>−</code>,
            使表达式结果等于 target,问有<strong>几种</strong>添法。
            <b> 回溯视角:</b>每个数二选一,天然是一棵深度 n 的二叉决策树 —— 走到底数一数有几片
            「和 = target」的叶子。逻辑没错,但 O(2ⁿ):
          </p>
        </div>
        <TargetSumTree />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <b>为什么能优化成背包?</b>做个漂亮的代数变换。设添正号的数之和为 <code>P</code>、
            添负号的绝对值之和为 <code>N</code>,那么:
          </p>
        </div>
        <div className="kp-formula">
          P − N = target &nbsp;且&nbsp; P + N = sum &nbsp; ⇒ &nbsp; <b>P = (sum + target) / 2</b>
          <br />
          <span className="dim">
            于是问题变成:有几个子集的和恰好等于 P?—— 计数型 0-1 背包(P 非整数或越界则无解)
          </span>
        </div>
        <div className="prose">
          <p>
            剩下的和 416 是同一个模子,只把布尔「或」换成<strong>方案数累加</strong>
            <code>dp[j] += dp[j−num]</code>:凑出 j 的方案 = 原有的 + 「先凑 j−num 再放一个 num」的。
            dp[0] = 1(空集是凑出 0 的唯一方案)。看方案数怎么长成一行杨辉三角:
          </p>
        </div>
        <DPTable
          title="LC 494 · 计数表逐帧填充(nums=[1,1,1],P=2)—— 与上面的决策树同一实例"
          frames={F_494}
          colLabels={["0", "1", "2"]}
          cornerLabel="dp"
          cellW={56}
        />
        <CodeTabs
          title="lc494_target_sum"
          java={{
            code: `class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        int sum = 0;
        for (int x : nums) sum += x;
        // P - N = target, P + N = sum  =>  P = (sum + target) / 2
        if (Math.abs(target) > sum || (sum + target) % 2 != 0) return 0;
        int P = (sum + target) / 2;
        int[] dp = new int[P + 1];
        dp[0] = 1;                              // 凑 0 有 1 种方案(空集)
        for (int x : nums)
            for (int j = P; j >= x; j--)        // 0-1 背包计数,容量倒序
                dp[j] += dp[j - x];
        return dp[P];
    }
}`,
            hl: [11, 12],
            note: (
              <>
                <b>两道关卡:</b><code>|target| &gt; sum</code> 无解;<code>(sum+target)</code> 为奇数
                无解(P 必须是整数)。漏判会数组越界或算错。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def findTargetSumWays(self, nums: list[int], target: int) -> int:
        s = sum(nums)
        if abs(target) > s or (s + target) % 2:
            return 0
        P = (s + target) // 2
        dp = [1] + [0] * P
        for x in nums:
            for j in range(P, x - 1, -1):
                dp[j] += dp[j - x]
        return dp[P]`,
            hl: [9, 10],
            note: (
              <>
                nums 里的 <b>0</b> 很微妙:它加正加负都行。上面的计数天然把每个 0 按「两种选择」
                计入方案数(x=0 时内层让 dp[j] 翻倍),无需特判。
              </>
            ),
          }}
          js={{
            code: `var findTargetSumWays = function (nums, target) {
  const sum = nums.reduce((a, b) => a + b, 0);
  if (Math.abs(target) > sum || (sum + target) % 2) return 0;
  const P = (sum + target) / 2;
  const dp = Array(P + 1).fill(0);
  dp[0] = 1;
  for (const x of nums)
    for (let j = P; j >= x; j--) dp[j] += dp[j - x];
  return dp[P];
};`,
            hl: [7, 8],
            note: (
              <>
                时间 O(n·P)、空间 O(P)。从 O(2ⁿ) 的回溯树到这里,正是「重叠子问题记账」的胜利 ——
                两种写法都要会:回溯讲清「有哪些选择」,背包讲清「怎么不重复地数」。
              </>
            ),
          }}
        />
        <Callout tone="deep" title="工程现场:计数型 DP 在算什么">
          <p>
            「有几种方式凑出某个总量」在现实里到处都是:掷 n 个骰子点数和为 s 的概率(LC 1155)、
            找零系统统计「一共有多少种找法」、编译器里的<b>语法分析计数</b>(一个句子有几种合法解析)。
            它们都能归约成这里的 <code>dp[j] += dp[j−x]</code> —— 记账,而不是枚举。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 二维费用 · 474 ================= */}
      <Section
        id="twocost"
        index="06"
        title="二维费用:一件物品,花两种容量"
        desc="LC 474 一和零 —— 背包再开一维,骨架纹丝不动"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>给一堆 0/1 字符串,以及最多能用的 <code>m</code> 个 0 和 <code>n</code> 个 1,
            问最多能选出多少个字符串。<b> 观察:</b>每个字符串是一件 0-1 物品,但它同时消耗两种资源 ——
            含几个 0、含几个 1。这就是<strong>二维费用背包</strong>:容量墙从「一堵」变成「两堵」,
            于是 dp 多开一维。
          </p>
          <p>
            <code>dp[i][j] = 用不超过 i 个 0、j 个 1 时能选的最多字符串数</code>。
            转移还是「选 / 不选」这个字符串,只是「腾容量」要同时腾两种:
            <code>dp[i][j] = max(dp[i][j], dp[i−zeros][j−ones] + 1)</code>。
            因为每个字符串仍只用一次,<strong>两层容量都倒序</strong>:
          </p>
        </div>
        <div className="kp-formula">
          dp[i][j] = max( <b>dp[i][j]</b> <span className="dim">不选</span> ,{" "}
          <b>dp[i−zeros][j−ones] + 1</b> <span className="dim">选(价值 +1 = 多一个字符串)</span> )
        </div>
        <CodeTabs
          title="lc474_ones_and_zeroes"
          java={{
            code: `class Solution {
    public int findMaxForm(String[] strs, int m, int n) {
        int[][] dp = new int[m + 1][n + 1];       // 二维费用:m 个 0、n 个 1
        for (String s : strs) {
            int zeros = 0, ones = 0;
            for (char ch : s.toCharArray()) { if (ch == '0') zeros++; else ones++; }
            for (int i = m; i >= zeros; i--)      // 两层容量都【倒序】(0-1)
                for (int j = n; j >= ones; j--)
                    dp[i][j] = Math.max(dp[i][j], dp[i - zeros][j - ones] + 1);
        }
        return dp[m][n];
    }
}`,
            hl: [7, 8, 9],
            note: (
              <>
                别被「二维」吓到:它仍是一件件物品的 0-1 背包,只是每件的「重量」是一对数
                <code>(zeros, ones)</code>,价值恒为 +1(数的是件数)。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def findMaxForm(self, strs: list[str], m: int, n: int) -> int:
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for s in strs:
            zeros = s.count("0")
            ones = len(s) - zeros
            for i in range(m, zeros - 1, -1):      # 两层容量倒序
                for j in range(n, ones - 1, -1):
                    dp[i][j] = max(dp[i][j], dp[i - zeros][j - ones] + 1)
        return dp[m][n]`,
            hl: [7, 8, 9],
            note: (
              <>
                <code>s.count(&quot;0&quot;)</code> 一行拿到 0 的个数,ones 用长度减即可 ——
                先把每件物品的两种费用预处理出来,循环里就清爽了。
              </>
            ),
          }}
          js={{
            code: `var findMaxForm = function (strs, m, n) {
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (const s of strs) {
    let zeros = 0;
    for (const ch of s) if (ch === "0") zeros++;
    const ones = s.length - zeros;
    for (let i = m; i >= zeros; i--)             // 两层容量倒序
      for (let j = n; j >= ones; j--)
        dp[i][j] = Math.max(dp[i][j], dp[i - zeros][j - ones] + 1);
  }
  return dp[m][n];
};`,
            hl: [7, 8, 9],
            note: (
              <>
                复杂度 O(len(strs) · m · n)。这已经是「按物品滚动」的最省形态 ——
                dp 只有 (m+1)(n+1) 大小,不必也无法再压。
              </>
            ),
          }}
        />
        <Callout tone="idea" title="举一反三:维度是可以叠加的">
          <p>
            背包的「容量」本质是一种<b>受限资源</b>。一种资源 → 一维 dp;两种资源(0 和 1)→ 二维;
            三种就三维。只要每件物品仍是「用一次」,新增的每一维都照 0-1 的规矩倒序即可。
            题目给你几种「不能超」的预算,dp 就开几维 —— 别慌,骨架永远是那句「选 / 不选」。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 完全背包 · 为什么正序 ================= */}
      <Section
        id="complete"
        index="07"
        title="完全背包:把倒序改成正序,物品就能无限拿"
        desc="LC 322 零钱兑换(第 7 章复盘,换完全背包视角)/ 279 / 139"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <strong>完全背包(complete knapsack)</strong>:每件物品可以拿<strong>无限次</strong>。
            还记得 §03 里正序为什么错吗?—— 因为 dp[j−w] 读到了「本轮已放过本物品」的脏值,
            导致物品被重复计入。可对完全背包来说,「重复计入」正是我们<strong>想要</strong>的效果!
            所以完全背包和 0-1 背包代码几乎一样,<strong>只把内层容量从倒序改成正序</strong>:
          </p>
        </div>
        <div className="kp-duel">
          <div className="card">
            <div className="card-kicker">0-1 背包 · 每件一次</div>
            <div className="card-title">
              <b className="mono">for j = W … w[i]</b>
            </div>
            <p>
              容量<b>倒序</b>。读到的 dp[j−w] 是「还没放本物品」的旧值 ——
              每件最多进包一次。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">完全背包 · 每件无限</div>
            <div className="card-title">
              <b className="mono">for j = w[i] … W</b>
            </div>
            <p>
              容量<b>正序</b>。读到的 dp[j−w] 可能「已放过本物品」——
              于是同一件被反复叠加,实现无限取。
            </p>
          </div>
        </div>
        <div className="prose">
          <p>
            用第 7 章的老朋友 <strong>LC 322 零钱兑换</strong> 来实证。上一章我们按「枚举最后一枚硬币」
            填 dp[金额];这次换<strong>完全背包</strong>视角:硬币是可无限取的物品,金额是容量,
            <strong>一枚硬币一枚硬币地正序填</strong>。同一道题,两种建模,殊途同归(lc.md 规则 2):
          </p>
        </div>
        <DPTable
          title="LC 322 · 完全背包视角逐枚填(coins=[1,3,4],amount=6)"
          frames={F_322}
          colLabels={["¥0", "¥1", "¥2", "¥3", "¥4", "¥5", "¥6"]}
          cornerLabel="dp"
          cellW={52}
        />
        <CodeTabs
          title="lc322_coin_change_complete"
          java={{
            code: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);            // 「无穷大」占位
        dp[0] = 0;
        for (int c : coins)                     // 外层:每种硬币
            for (int j = c; j <= amount; j++)   // 内层:容量【正序】= 硬币可无限取
                dp[j] = Math.min(dp[j], dp[j - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
            hl: [6, 7, 8],
            note: (
              <>
                与 0-1 背包一维版逐字对照,<b>唯一的差别</b>就是内层 <code>j</code> 正序。
                求「最少个数」是 min 型,dp[0]=0、其余初始化为「无穷大」(用 amount+1 避免溢出)。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        dp = [0] + [amount + 1] * amount
        for c in coins:
            for j in range(c, amount + 1):      # 容量正序
                dp[j] = min(dp[j], dp[j - c] + 1)
        return dp[amount] if dp[amount] <= amount else -1`,
            hl: [4, 5, 6],
            note: (
              <>
                用 <code>amount+1</code> 当「无穷大」:凑 amount 最多用 amount 枚(全 ¥1),
                永远到不了 amount+1,天然免溢出 —— 比 <code>float(&quot;inf&quot;)</code> 更省心。
              </>
            ),
          }}
          js={{
            code: `var coinChange = function (coins, amount) {
  const dp = Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (const c of coins)
    for (let j = c; j <= amount; j++)          // 容量正序
      dp[j] = Math.min(dp[j], dp[j - c] + 1);
  return dp[amount] > amount ? -1 : dp[amount];
};`,
            hl: [4, 5, 6],
            note: (
              <>
                <b>记忆锚点:</b>min/max 型完全背包,内外层顺序<b>都行</b>(不影响最值);
                但一旦是<b>计数型</b>,顺序就决定了组合还是排列 —— 见下一节。
              </>
            ),
          }}
        />
        <Callout tone="warn" title="min/max 型:内外层顺序无所谓;计数型:大有所谓">
          <p>
            322/279 求「最少个数」是最值型,先遍历硬币还是先遍历容量<b>结果都对</b> ——
            因为 min 只关心「凑出 j 的所有拼法里最小的」,与拼法的顺序无关。
            但到了 518/377 这种<b>数方案数</b>的题,遍历顺序会决定你数的是「组合」还是「排列」,
            天差地别。下一节专门拆这个坑。
          </p>
        </Callout>
        <div className="grid-3" style={{ marginTop: 8 }}>
          <div className="card hoverable">
            <div className="card-kicker">同构 · LC 279</div>
            <div className="card-title">🔲 完全平方数</div>
            <p>
              把 1,4,9,16… 当作面额无限的「硬币」,凑出 n 用的最少个数 ——
              和 322 一字不改,只是硬币换成了平方数。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">排列味 · LC 139</div>
            <div className="card-title">🧩 单词拆分</div>
            <p>
              词典里的词可重复用,且<b>顺序重要</b>(拼的是一句话)—— 外层遍历长度、内层枚举单词,
              是完全背包的排列写法(详见下一节)。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">拓展 · 多重背包</div>
            <div className="card-title">🔢 每件有个数上限</div>
            <p>
              介于 0-1 与完全之间:每件最多 k 个。朴素做法把「k 个」摊成 k 件跑 0-1;
              进阶用<b>二进制拆分</b>(把 k 拆成 1,2,4,…)把 k 件压到 log k 件,是面试彩蛋。
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §08 排列 vs 组合 ================= */}
      <Section
        id="permcomb"
        index="08"
        title="排列 vs 组合:两层循环谁在外,决定你数的是什么"
        desc="精讲 C · LC 518 组合数 vs LC 377 排列数 —— 全章最经典的易错点"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            完全背包的计数题里藏着一个魔鬼细节。同样是「凑出金额 n 有几种方案」,同样是
            <code>dp[j] += dp[j−coin]</code>,只因为两层循环的<strong>先后顺序</strong>不同,
            数出来的东西就完全不一样:
          </p>
        </div>
        <div className="kp-duel">
          <div className="card">
            <div className="card-kicker">LC 518 · 求组合数</div>
            <div className="card-title">
              <b className="mono">外层硬币 · 内层容量</b>
            </div>
            <p>
              1+2 与 2+1 算<b>一种</b>。每种硬币「整体」只在自己那一轮被考虑,后来的硬币不会「插队」到前面 ——
              顺序被抹平,数的是<b>组合</b>。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">LC 377 · 求排列数</div>
            <div className="card-title">
              <b className="mono">外层容量 · 内层数字</b>
            </div>
            <p>
              1+2 与 2+1 算<b>两种</b>。每个容量都让所有数字轮流当「最后一个」,
              于是不同顺序被分别计入,数的是<b>排列</b>。
            </p>
          </div>
        </div>
        <div className="prose">
          <p>
            先看 <strong>518(组合数)</strong>:coins=[1,2,5] 凑 5 元。外层遍历硬币,意味着我们
            <strong>先把所有「只用 ¥1」的方案数清,再引入 ¥2,再引入 ¥5</strong> ——
            ¥2 永远排在 ¥1 之后登场,所以不会出现「先 2 后 1」这种换序重复。逐帧看:
          </p>
        </div>
        <DPTable
          title="LC 518 · 组合数(外硬币内容量,coins=[1,2,5],amount=5)"
          frames={F_518}
          colLabels={["0", "1", "2", "3", "4", "5"]}
          cornerLabel="dp"
          cellW={56}
        />
        <CodeTabs
          title="lc518_vs_lc377"
          java={{
            code: `// LC 518 求【组合数】:外层硬币,内层容量
class Solution {
    public int change(int amount, int[] coins) {
        int[] dp = new int[amount + 1];
        dp[0] = 1;
        for (int c : coins)                     // 外层:硬币(组合数的关键!)
            for (int j = c; j <= amount; j++)   // 内层:容量正序(完全背包)
                dp[j] += dp[j - c];
        return dp[amount];
    }
}

// LC 377 求【排列数】:外层容量,内层数字
class Solution377 {
    public int combinationSum4(int[] nums, int target) {
        int[] dp = new int[target + 1];
        dp[0] = 1;
        for (int j = 1; j <= target; j++)       // 外层:容量(排列数的关键!)
            for (int x : nums)                  // 内层:数字
                if (j >= x) dp[j] += dp[j - x];
        return dp[target];
    }
}`,
            hl: [6, 18],
            note: (
              <>
                <b>377 溢出提示:</b>中间结果可能超过 int;LeetCode 保证最终答案在 int 内,
                但严格起见可用 <code>long</code> 累加,或先确认题目约束。
              </>
            ),
          }}
          python={{
            code: `# LC 518 求【组合数】:外层硬币,内层容量
class Solution:
    def change(self, amount: int, coins: list[int]) -> int:
        dp = [1] + [0] * amount
        for c in coins:                 # 外层硬币 → 组合数
            for j in range(c, amount + 1):
                dp[j] += dp[j - c]
        return dp[amount]

# LC 377 求【排列数】:外层容量,内层数字
class Solution377:
    def combinationSum4(self, nums: list[int], target: int) -> int:
        dp = [1] + [0] * target
        for j in range(1, target + 1):  # 外层容量 → 排列数
            for x in nums:
                if j >= x:
                    dp[j] += dp[j - x]
        return dp[target]`,
            hl: [5, 14],
            note: (
              <>
                两段代码的差别只在<b>哪个循环在外</b>。背下这句口诀:
                <b>「求组合数:物品在外;求排列数:容量在外」</b>。
              </>
            ),
          }}
          js={{
            code: `// LC 518 求【组合数】:外层硬币,内层容量
var change = function (amount, coins) {
  const dp = Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const c of coins)              // 外层硬币 → 组合数
    for (let j = c; j <= amount; j++) dp[j] += dp[j - c];
  return dp[amount];
};

// LC 377 求【排列数】:外层容量,内层数字
var combinationSum4 = function (nums, target) {
  const dp = Array(target + 1).fill(0);
  dp[0] = 1;
  for (let j = 1; j <= target; j++)   // 外层容量 → 排列数
    for (const x of nums)
      if (j >= x) dp[j] += dp[j - x];
  return dp[target];
};`,
            hl: [5, 14],
            note: (
              <>
                <b>139 单词拆分</b>也是「外层容量」的一员:拼句子讲究先后顺序,所以外层遍历长度、
                内层枚举单词 —— 和 377 同一套路。凡「顺序有关」,容量就该在外层。
              </>
            ),
          }}
        />
        <Callout tone="win" title="一句话记牢排列 vs 组合">
          <p>
            <b>外层物品、内层容量 → 组合数(518):</b>物品有固定出场次序,顺序被抹平。<br />
            <b>外层容量、内层物品 → 排列数(377/139):</b>每个容量都让所有物品当结尾,顺序被计入。<br />
            判断题目要哪个,只问一句:<b>「1+2 和 2+1 算一种还是两种?」</b>算一种用 518 写法,算两种用 377 写法。
          </p>
        </Callout>
      </Section>

      {/* ================= §09 题单 ================= */}
      <Section
        id="problems"
        index="09"
        title="高频题单:背包 10 题"
        desc="按「0-1 → 装满 → 计数 → 二维费用 → 完全 → 排列组合」分层。先想 30 秒再看提示"
        badge={<span className="chip">主线必做</span>}
      >
        <ProblemSet ch="knapsack" items={PROBLEMS} />
      </Section>

      {/* ================= §10 Quiz ================= */}
      <Section
        id="quiz"
        index="10"
        title="通关测验"
        desc="8 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="knapsack" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            背包 = 打家劫舍「<b>选 / 不选</b>」+ 一堵<b>容量墙</b>:
            dp[i][j] = 前 i 件、容量 j 的最优;<b>装</b> = dp[i−1][j−w]+v,<b>不装</b> = dp[i−1][j]。
          </>,
          <>
            一维滚动只有一行差别:<b>0-1 背包容量倒序</b>(每件一次)、
            <b>完全背包容量正序</b>(每件无限)—— 这是全章最该背下来的一句。
          </>,
          <>
            转移算子跟着<b>问什么</b>走:最大价值 <b>max</b>、能否装满 <b>「或」</b>、
            方案数 <b>+=</b>、最少个数 <b>min</b> —— 骨架不变,算子不能抄上一题。
          </>,
          <>
            装满型三级跳:<b>能否装满(416)→ 最接近装满(1049)→ 有几种装法(494)</b>;
            计数型把回溯的 2ⁿ 翻译成 O(n·target) 的记账。
          </>,
          <>
            完全背包数方案数时:<b>外物品内容量 = 组合数(518)</b>,
            <b>外容量内物品 = 排列数(377/139)</b>;判据一句话「1+2 与 2+1 算一种还是两种」。
          </>,
          <>
            二维费用(474)= 把「一个重量」换成「一对费用」,每多一种受限资源就多开一维,
            每维照 0-1/完全的规矩定方向。
          </>,
          <>
            建模四问:<b>谁是物品 · 谁是容量 · 每件用几次 · 求什么</b>。
            答完这四问,背包题基本就是抄模板 —— 这也是一半 DP 面试题的通关钥匙。
          </>,
        ]}
      />

      <ChapterFooter ch="knapsack" />
    </main>
  );
}
