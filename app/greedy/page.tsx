"use client";

// 第 6 章 · 贪心 —— 承接回溯(把树画出来),预告 DP(贪心失效之地)。
// 叙事主线:贪心难的不是贪,是证明贪完不后悔。
//   §01 为什么贪心(直觉 + 快 + 危险)→ §02 交换论证 · 分发饼干(本章灵魂)→
//   §03 序列贪心(376/53盘/122 贪心 vs DP 双视角)→ §04 跳跃游戏(55/45 覆盖范围)→
//   §05 模拟贪心(860/134/135/406)→ §06 区间贪心(435/452/763/56盘,按左端还是右端)→
//   §07 贪心失效之地(322 反例 + 贪心 vs DP 判据,与第 7 章 §07 口径一致)→ 题单 → 测验。
// 可视化在 ./viz:CookieMatch(455)、JumpReach(55)、JumpMin(45)、
// IntervalTimeline(435 自建时间轴)、CoinGreedyLab(322 交互反例)。

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
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { PROBLEMS, QUIZ } from "@/lib/greedy-data";
import {
  CookieMatch,
  JumpReach,
  JumpMin,
  IntervalTimeline,
  CoinGreedyLab,
} from "./viz";

const CHIPS = [
  { id: "why", n: "01", label: "为什么贪心" },
  { id: "proof", n: "02", label: "交换论证 · 饼干" },
  { id: "seq", n: "03", label: "序列贪心" },
  { id: "jump", n: "04", label: "跳跃游戏" },
  { id: "sim", n: "05", label: "模拟贪心" },
  { id: "interval", n: "06", label: "区间贪心" },
  { id: "fail", n: "07", label: "贪心失效" },
  { id: "problems", n: "08", label: "高频题单" },
  { id: "quiz", n: "09", label: "通关测验" },
];

// 摆动序列小图示:1,4,7,2,5 —— 只有拐点(7、2)与端点算入摆动长度
const WIGGLE = [
  { v: 1, h: 32, peak: true },
  { v: 4, h: 68, peak: false },
  { v: 7, h: 104, peak: true },
  { v: 2, h: 44, peak: true },
  { v: 5, h: 80, peak: true },
];

export default function GreedyChapter() {
  return (
    <main className="page" data-ch="greedy">
      <Hero
        ch="greedy"
        title={
          <>
            贪心 <span className="grad">Greedy</span>
          </>
        }
        essence={
          <>
            贪心是最诱人、也最危险的策略:<strong>每一步都拿眼前最好的</strong>,
            快到起飞 —— 可它只在能证明「贪完不后悔」时才成立。本章教你三件事:
            什么时候能贪、<strong>怎么证明能贪(交换论证)</strong>、以及贪心翻车时怎么优雅地退回 DP。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 为什么贪心 ================= */}
      <Section
        id="why"
        index="01"
        title="为什么会有贪心:快,但要有证据"
        desc="贪心不是新数据结构,是一种「敢于只看眼前」的解题世界观"
      >
        <div className="prose">
          <p>
            先说个你每天都在做的贪心:<strong>找零</strong>。收银员要找你 ¥68,
            他不会去解方程,而是「先拿一张 ¥50,再 ¥10,再 ¥5,再三个 ¥1」——
            每一步都抓当下能用的最大面额。这就是贪心(greedy):
            <strong>把大问题拆成一连串小决策,每一步都选当下看起来最优的,而且绝不回头</strong>。
          </p>
          <p>
            对比一下你已经学过的两种世界观:<strong>回溯</strong>(第 5 章)把所有选择都试一遍,
            走进死胡同再退回来 —— 必对,但慢(指数级);
            <strong>动态规划</strong>(下一章)也枚举所有决策,但把子问题答案记下来复用 ——
            必对,多项式时间。贪心最激进:<strong>它连「试」都不试,一步定终身</strong>。
            所以它最快(通常 O(n) 或 O(n log n)),但也最需要证明 —— 万一「当下最优」把「全局最优」堵死了呢?
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">特征 01</div>
            <div className="card-title">👀 局部最优 → 全局最优</div>
            <p>
              贪心赌的是一件事:<b>每一步的局部最优,能累积成全局最优</b>。
              这个赌注不一定成立 —— 成立了才叫「贪心选择性质」,不成立就得换 DP。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">特征 02</div>
            <div className="card-title">🚫 不反悔</div>
            <p>
              选了就不撤回,不像回溯会退一步。正因为不回头,才快 ——
              但也正因为不回头,<b>一旦某一步选错就无从挽回</b>。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">特征 03</div>
            <div className="card-title">⚡ 常常先排序</div>
            <p>
              大量贪心题的第一步是<b>排序</b>(455 / 435 / 452):把「该先处理谁」
              这个决策顺序先定下来。所以贪心的复杂度常被排序的 <BigO o="nlogn" /> 主导。
            </p>
          </div>
        </div>
        <Callout tone="warn" title="贪心最大的坑:它「看起来」总是对的">
          <p>
            贪心的代码往往短到可疑,跑几个例子还都过 —— 于是你以为对了。
            但「测了几个例子都对」<b>不是证明</b>。经典翻车:硬币面额 <code>[1, 3, 4]</code> 凑 ¥6,
            贪心先拿最大的 4,只能 4+1+1 = 3 枚;而最优是 3+3 = <b>2 枚</b>。
            贪心永远看不见「两个 3」那条路 —— 这就是本章 §07 要专门解剖的反例,也是下一章 DP 的开场戏。
            <b>能不能证明,是贪心和「碰巧对」的唯一区别。</b>
          </p>
        </Callout>
        <Callout tone="story" title="哈夫曼编码:一个学生作业里诞生的贪心经典">
          <p>
            1951 年,MIT 的研究生 David Huffman 在信息论课上被老师 Robert Fano 出了道期末题:
            找最优的前缀编码。Fano 自己和香农(Shannon)都只想出了自顶向下的次优解。
            Huffman 差点放弃去背书应考,却在最后一刻灵光一现:<b>自底向上,每次合并两个频率最小的节点</b> ——
            一个纯粹的贪心。结果他的作业解法,反而超过了两位大师。哈夫曼编码至今仍活在 JPEG、
            MP3、ZIP 里。贪心一旦被证明成立,就是又快又漂亮的屠龙术。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 交换论证 + 精讲 A ================= */}
      <Section
        id="proof"
        index="02"
        title="交换论证:证明「贪完不后悔」的通用武器"
        desc="精讲 A · LC 455 分发饼干 —— 本章灵魂,先学会证明,再谈贪"
        badge={<span className="lc-badge" data-d="easy">EASY</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>有一群孩子,每个孩子有个胃口值 g[i];有一堆饼干,每块有个尺寸 s[j]。
            一块饼干只能喂一个孩子,且必须 <code>s[j] ≥ g[i]</code> 才能让孩子满足。
            问最多能满足几个孩子?
          </p>
          <p>
            <b>贪心直觉:</b>别浪费。把双方都排序,然后用<strong>刚好够的最小饼干,去喂最容易满足的孩子</strong>——
            喂不动就把这块太小的饼干丢掉(它对谁都没用),换更大的。先亲眼看一遍这个过程:
          </p>
        </div>
        <CookieMatch />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            代码短得可疑 —— 排序 + 双指针一遍扫完。但短不等于对,<b>下面才是重点:凭什么这样贪是最优的?</b>
          </p>
        </div>
        <CodeTabs
          title="lc455_assign_cookies"
          java={{
            code: `class Solution {
    public int findContentChildren(int[] g, int[] s) {
        Arrays.sort(g);                 // 孩子胃口升序
        Arrays.sort(s);                 // 饼干尺寸升序
        int child = 0;                  // 当前要满足的孩子(胃口最小的未满足者)
        for (int j = 0; j < s.length && child < g.length; j++) {
            if (s[j] >= g[child]) {     // 这块饼干喂得动当前孩子
                child++;                // 满足一个,换下一个孩子
            }                           // 喂不动:这块小饼干对谁都没用,跳过
        }
        return child;                   // 满足的孩子数
    }
}`,
            hl: [7, 8],
            note: (
              <>
                双指针都只往前走:饼干和孩子各扫一遍 O(n),
                总复杂度由排序的 <b>O(n log n)</b> 主导,空间 O(1)(不算排序)。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def findContentChildren(self, g: list[int], s: list[int]) -> int:
        g.sort()                        # 孩子胃口升序
        s.sort()                        # 饼干尺寸升序
        child = 0
        for cookie in s:                # 从最小饼干开始试
            if child < len(g) and cookie >= g[child]:
                child += 1              # 刚好够,满足当前最小胃口的孩子
        return child`,
            hl: [7, 8],
            note: (
              <>
                遍历饼干、指针指向孩子:只要当前饼干喂得动<b>最小胃口的未满足孩子</b>就发出去,
                喂不动就自然跳到下一块更大的饼干。
              </>
            ),
          }}
          js={{
            code: `var findContentChildren = function (g, s) {
  g.sort((a, b) => a - b);           // 坑:JS 默认按字符串排,数字必须传比较器
  s.sort((a, b) => a - b);
  let child = 0;
  for (let j = 0; j < s.length && child < g.length; j++) {
    if (s[j] >= g[child]) child++;   // 满足一个孩子,换下一个
  }
  return child;
};`,
            hl: [2, 3],
            note: (
              <>
                <b>JS 高频坑:</b><code>[10, 2].sort()</code> 得到 <code>[10, 2]</code>——
                默认按字符串比较!数字排序<b>务必</b>写 <code>(a, b) =&gt; a - b</code>,否则贪心从根上就错了。
              </>
            ),
          }}
        />
        <div className="prose">
          <p>
            现在证明。要用的武器叫<strong>交换论证(exchange argument)</strong>——
            它是几乎所有贪心正确性证明的通用模板,核心是一句话:
            <strong>假设存在一个最优解和贪心的选择不一样,我就把它「掰」成贪心的样子,而且证明掰完不会更差。</strong>
            既然掰完不更差,贪心解就和最优解一样好 —— 贪心也是最优。三步走:
          </p>
        </div>
        <div className="grd-steps">
          <div className="grd-step">
            <div>
              <h4>假设有个最优解 OPT,它和贪心第一步不同</h4>
              <p>
                贪心的第一步:拿最小的能用饼干 s* 去喂胃口最小的孩子 c₀。
                假设某个最优解 OPT 没这么做 —— 要么 c₀ 在 OPT 里没被满足,要么 c₀ 被别的饼干喂了。
              </p>
            </div>
          </div>
          <div className="grd-step">
            <div>
              <h4>做一次交换,把 OPT 往贪心的选择上靠</h4>
              <p>
                若 OPT 里 c₀ 由更大的饼干 s′ 满足(s′ ≥ s*):把 c₀ 换成用 s*,
                空出来的 s′ 拿去顶替原来 s* 的位置 —— s′ 更大,原来 s* 能喂的孩子它一定也喂得动。
                若 c₀ 在 OPT 里没被满足而 s* 闲置,直接用 s* 喂 c₀,满足数还 +1。
              </p>
            </div>
          </div>
          <div className="grd-step">
            <div>
              <h4>交换后「不更差」,再对剩下的归纳</h4>
              <p>
                无论哪种情况,交换后满足的孩子数<b>不减少</b>,而且新解和贪心的第一步一致了。
                把 c₀ 和 s* 拿掉,对剩下的孩子和饼干重复同样的论证 ——
                一步步逼近,最终整个贪心解和某个最优解一样好。<b>证毕。</b>
              </p>
            </div>
          </div>
        </div>
        <Callout tone="deep" title="交换论证 = 数学归纳法穿了件应用题的外衣">
          <p>
            剥开来看,交换论证就是<b>归纳法</b>:归纳假设「前 k 步和贪心一致的最优解存在」,
            归纳步骤「第 k+1 步也能通过一次不变差的交换,和贪心对齐」。
            排序类贪心(455 / 435 / 452 / 56)、活动选择、哈夫曼编码,证明骨架全是这一套。
            面试时你不必写满黑板,但要能说出<b>「我拿最优解和贪心的第一处分歧做交换,证明替换后不更差」</b>——
            这一句话,就是你和「我觉得应该这样贪」之间的天壤之别。
          </p>
        </Callout>
        <Callout tone="win" title="面试话术:如何优雅地「证明」你的贪心">
          <p>
            「我先排序,让最容易满足的孩子配最小的可用饼干。<b>正确性用交换论证</b>:
            任何最优解如果和我的选择不同,我都能把它那一步换成我的选择而不减少满足人数,
            归纳下去说明贪心就是最优。」—— 讲到「交换论证」四个字,面试官就知道你不是在碰运气。
            这比背出代码值钱得多。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 序列贪心 ================= */}
      <Section
        id="seq"
        index="03"
        title="序列贪心:在一维数组上「顺手」做决策"
        desc="376 数拐点 · 53 复盘 Kadane · 122 股票(贪心 vs DP 双视角)"
      >
        <div className="prose">
          <p>
            最轻量的一类贪心:一次线性扫描,每一步根据「和前一个的关系」做个小决定。
            先看 <strong>LC 376 摆动序列</strong>:一个序列的相邻差要正负交替(上、下、上、下……),
            问最长的摆动子序列有多长。
          </p>
          <p>
            <b>贪心洞察:</b>答案就等于<strong>「拐点」的个数加一</strong>。
            一段持续上升的数里,中间的点全是废的 —— 只有从上升转下降(山峰)、
            或从下降转上升(山谷)的<b>转折点</b>才对摆动有贡献。下图中 <code>[1, 4, 7, 2, 5]</code>,
            中间的 4 只是上坡途中的一站(灰),真正算数的是端点和拐点 7、2(高亮):
          </p>
        </div>
        <div className="viz">
          <div className="viz-title">LC 376 · 只有拐点算数:1 → 7(峰)→ 2(谷)→ 5,长度 4</div>
          <div className="viz-stage">
            <div className="grd-wiggle">
              {WIGGLE.map((w, i) => (
                <div
                  key={i}
                  className="grd-wcol"
                  data-peak={w.peak ? "1" : "0"}
                  style={{ height: w.h }}
                >
                  {w.v}
                </div>
              ))}
            </div>
          </div>
          <div className="viz-msg">
            高亮的 4 个点组成摆动子序列 1 → 7 → 2 → 5(差值 +6, −5, +3 正负交替);
            灰色的 4 被跳过,因为 1 → 4 → 7 是同方向的,4 白给。
          </div>
        </div>
        <CodeTabs
          title="lc376_wiggle_subsequence"
          java={{
            code: `class Solution {
    public int wiggleMaxLength(int[] nums) {
        if (nums.length < 2) return nums.length;
        int up = 1, down = 1;           // 以「最后一步上升 / 下降」结尾的最长摆动
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] > nums[i - 1]) up = down + 1;      // 上升拐点
            else if (nums[i] < nums[i - 1]) down = up + 1; // 下降拐点
            // 相等:方向没变,up / down 都不动
        }
        return Math.max(up, down);
    }
}`,
            hl: [6, 7],
            note: (
              <>
                up / down 双状态贪心:遇到真正的拐点才 +1,一段连续相等只当一个点。
                时间 <b>O(n)</b>、空间 O(1)。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def wiggleMaxLength(self, nums: list[int]) -> int:
        if len(nums) < 2:
            return len(nums)
        up = down = 1
        for i in range(1, len(nums)):
            if nums[i] > nums[i - 1]:
                up = down + 1           # 上升拐点
            elif nums[i] < nums[i - 1]:
                down = up + 1           # 下降拐点
        return max(up, down)`,
            hl: [8, 10],
            note: (
              <>
                「相等」那一支故意什么都不写 —— 平台期不产生拐点,是本题最容易漏的分支。
              </>
            ),
          }}
          js={{
            code: `var wiggleMaxLength = function (nums) {
  if (nums.length < 2) return nums.length;
  let up = 1, down = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > nums[i - 1]) up = down + 1;
    else if (nums[i] < nums[i - 1]) down = up + 1;
  }
  return Math.max(up, down);
};`,
            hl: [5, 6],
            note: (
              <>
                只用两个变量滚动,不需要额外数组 —— 每个拐点让 up / down 交替 +1,
                最后取两者较大值。
              </>
            ),
          }}
        />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            <b>LC 53 最大子数组和(复盘)：</b>Kadane 算法的贪心直觉是「<b>前面那段和为负就是拖累,立刻丢弃</b>」——
            <code>cur = max(nums[i], cur + nums[i])</code>,全程记录最大值。它同时也是「以 i 结尾的最大和」的
            一维 DP(第 7 章主讲,那里有逐格动画)。同一段代码,贪心和 DP 两种世界观 ——
            这就是 lc.md 规则 2 说的「一题两解都讲」。这里只作复盘,不展开。
          </p>
        </div>
        <Callout tone="idea" title="精讲插曲 · LC 122 买卖股票 II:贪心和 DP 各说各话,答案一样">
          <p>
            <b>题意:</b>一支股票每天一个价,允许无限次买卖(但手里最多一股),求最大利润。
            <b> 贪心视角:</b>把所有「今天比昨天贵」的差价都收进口袋 ——
            <code>profit += max(0, price[i] − price[i−1])</code>。为什么对?分两步:任何一次持仓(第 i 天买、第 j 天卖)的收益
            <code>p[j] − p[i]</code> 等于这段区间<b>全部</b>相邻差之和,而它必然
            ≤ 区间内相邻<b>正</b>差之和 —— 所以 <code>Σmax(0, Δ)</code> 是任何策略都
            超不过的<b>上界</b>;又因为「每个上涨日都买卖一次」恰好取到这个上界,
            所以它就是最优解。
            <b> DP 视角:</b>两个状态 —— 手里「持股」或「空仓」,每天在买 / 卖 / 不动之间转移
            (第 10 章股票族谱主讲)。两条路殊途同归:
          </p>
        </Callout>
        <div className="grd-duel">
          <div className="card">
            <div className="card-kicker">贪心 · 收割每个上坡日</div>
            <div className="card-title"><b className="mono">Σ max(0, Δ)</b></div>
            <p>
              一行搞定,O(n)、O(1)。适合能一眼看出「差价可拆」的场合 ——
              但需要那句证明(多日涨幅 = 相邻正差价之和)兜底。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">DP · 持有 / 空仓状态机</div>
            <div className="card-title"><b className="mono">hold / cash</b></div>
            <p>
              <code>hold = max(hold, cash − p)</code>;<code>cash = max(cash, hold + p)</code>。
              带手续费(714)、限次数(123)时贪心失灵,只有状态机 DP 扛得住 —— 通用但稍重。
            </p>
          </div>
        </div>
        <CodeTabs
          title="lc122_best_time_to_buy_sell_stock_ii"
          java={{
            code: `class Solution {
    public int maxProfit(int[] prices) {
        int profit = 0;
        for (int i = 1; i < prices.length; i++) {
            if (prices[i] > prices[i - 1])
                profit += prices[i] - prices[i - 1]; // 每个上坡日都收差价
        }
        return profit;
    }
}`,
            hl: [5, 6],
            note: (
              <>
                贪心把整段上涨拆成一天天的小赚;下跌日差价为负,直接不加。O(n)、O(1)。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        return sum(
            max(0, prices[i] - prices[i - 1])   # 只累加相邻正差价
            for i in range(1, len(prices))
        )`,
            hl: [3, 4, 5],
            note: (
              <>
                一行贪心。想不出贪心时先写 DP 状态机(第 10 章),两者答案必然一致 ——
                可以互相验算。
              </>
            ),
          }}
          js={{
            code: `var maxProfit = function (prices) {
  let profit = 0;
  for (let i = 1; i < prices.length; i++) {
    profit += Math.max(0, prices[i] - prices[i - 1]);
  }
  return profit;
};`,
            hl: [4],
            note: (
              <>
                等价的 DP 写法:<code>hold = Math.max(hold, cash - p)</code>、
                <code>cash = Math.max(cash, hold + p)</code> —— 面试时把两种都摆出来最稳。
              </>
            ),
          }}
        />
      </Section>

      {/* ================= §04 跳跃游戏 + 精讲 B ================= */}
      <Section
        id="jump"
        index="04"
        title="跳跃游戏:盯住「覆盖范围」,而不是「怎么跳」"
        desc="精讲 B · LC 55 能否到达 → LC 45 最少几步"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>LC 55 题意:</b>数组每个数字表示「站在这格最多能往前跳几步」,问能否从 0 号到达末尾。
            <b> 暴力:</b>回溯枚举每一格跳几步,指数级。
            <b> 贪心洞察:</b>你根本不需要知道<strong>具体怎么跳</strong>,
            只需要一路维护<strong>「目前最远能覆盖到哪」</strong>—— 只要没被这个范围甩下,就能继续往前;
            一旦某个下标超出了覆盖范围,就彻底卡死。看这个「差一步够不着」的经典反例:
          </p>
        </div>
        <JumpReach />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            55 的代码只有三行核心:<code>reach = max(reach, i + nums[i])</code>,
            若 <code>i &gt; reach</code> 返回 false。把「能不能到」升级成「<strong>最少几步到</strong>」,
            就是精讲 B 的主角 —— <strong>LC 45 跳跃游戏 II</strong>。
          </p>
          <p>
            <b>暴力 / DP:</b>dp[i] = 到 i 的最少步数,对每个 i 回看所有能跳到它的位置取 min ——
            O(n²)。<b>为什么能优化到 O(n):</b>贪心把它看成<strong>分层</strong>——
            「一步之内能到的所有格子」是第一层,「两步之内」是第二层……
            每一层就是一次跳跃的覆盖范围。我们要做的,是在<strong>当前这一跳的范围里,
            提前挑出「能让下一跳蹦得最远」的落点</strong>,走到本层边界时才真正跳一次。逐帧看:
          </p>
        </div>
        <JumpMin />
        <CodeTabs
          title="lc45_jump_game_ii"
          java={{
            code: `class Solution {
    public int jump(int[] nums) {
        int jumps = 0, curEnd = 0, farthest = 0;
        for (int i = 0; i < nums.length - 1; i++) { // 到 n-2 即可
            farthest = Math.max(farthest, i + nums[i]); // 本跳内最远可达
            if (i == curEnd) {          // 走到当前这一跳的边界
                jumps++;                // 必须再跳一次
                curEnd = farthest;      // 边界推进到「最远」
            }
        }
        return jumps;
    }
}`,
            hl: [5, 6, 7, 8],
            note: (
              <>
                只循环到 n-2:到达最后一格时无需再起跳,否则会多数一步。
                curEnd 是「这一跳的射程」,farthest 是「下一跳的射程」。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def jump(self, nums: list[int]) -> int:
        jumps = cur_end = farthest = 0
        for i in range(len(nums) - 1):        # 到 n-2 即可
            farthest = max(farthest, i + nums[i])
            if i == cur_end:                  # 用尽本跳射程,必须再跳
                jumps += 1
                cur_end = farthest
        return jumps`,
            hl: [5, 6, 7, 8],
            note: (
              <>
                题目保证一定能到终点,所以不必判无解。若不保证,farthest 追不上 i 时返回 −1。
              </>
            ),
          }}
          js={{
            code: `var jump = function (nums) {
  let jumps = 0, curEnd = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === curEnd) {
      jumps++;
      curEnd = farthest;
    }
  }
  return jumps;
};`,
            hl: [4, 5, 6, 7, 8],
            note: (
              <>
                55(能否到达)只需维护 farthest、判断 <code>i &gt; farthest</code>;
                45 多了一层「到边界 → 计步」。<b>一套覆盖范围思想,两道题。</b>
              </>
            ),
          }}
        />
        <Callout tone="deep" title="工程现场:45 就是 BFS 最短路的贪心压缩">
          <p>
            把每个下标看成图的节点,「i 能一步跳到 j」看成一条边,45 求的正是<b>最短路径的层数</b>——
            标准做法是 BFS。而贪心把 BFS 的队列压成了两个变量(curEnd = 当前层边界、farthest = 下一层边界),
            省掉了整个队列,时空双降到 O(n) / O(1)。<b>「能把 BFS 分层压成一次线性扫描」</b>正是覆盖范围类贪心的精髓,
            网络路由的跳数估计、游戏里的最少移动步数都用得上。
          </p>
        </Callout>
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            55 / 45 都是时间 <b>O(n)</b>、空间 <b>O(1)</b>。高频追问:①「为什么循环到 n−2?」——
            站在最后一格不需要再跳,写到 n−1 会把「到达」误记成「又跳了一次」;
            ②「45 用 DP 怎么写?」—— dp[i]=min(dp[j])+1(j 能跳到 i),O(n²),用来向面试官展示优化前后的对比;
            ③「若不保证能到终点?」—— 一旦 <code>farthest ≤ i</code> 且还没到末尾,说明卡死,返回 −1。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 模拟贪心 ================= */}
      <Section
        id="sim"
        index="05"
        title="模拟贪心:一条局部规则,一次遍历到底"
        desc="860 找零 · 134 加油站 · 135 分发糖果 · 406 身高重建"
      >
        <div className="prose">
          <p>
            这一类题没有华丽的排序技巧,靠的是<strong>想清楚一条局部规则,然后老老实实模拟</strong>。
            难点全在「凭什么这条规则不会让我后悔」。
          </p>
          <p>
            <b>LC 860 柠檬水找零(热身):</b>顾客用 5 / 10 / 20 付款,你要实时找零。规则:
            收 5 不找;收 10 找一张 5;收 20 <strong>优先用「10 + 5」</strong>,不够再用「5 + 5 + 5」。
            为什么优先出 10?因为 <b>10 元只能拿来找 20,而 5 元哪儿都能用</b> ——
            把最灵活的 5 元攒着,是唯一不会把自己逼到没零钱可找的策略。这就是一个能一句话说清的交换论证。
          </p>
        </div>
        <Callout tone="idea" title="LC 134 加油站:把「环形」化简成一次线性扫描">
          <p>
            <b>题意:</b>环形路上 n 个加油站,站 i 有 gas[i] 升油,从 i 开到 i+1 耗 cost[i] 升。
            求能跑完整圈的出发站(唯一或不存在)。<b>两个关键结论:</b>
            ① 若总油量 Σgas &lt; 总消耗 Σcost,<b>无解</b>;
            ② 若从站 a 出发,油箱在站 b 第一次变负,那么 a 到 b 之间<b>任何一站做起点都会更早断油</b>——
            所以起点直接跳到 b+1,前面全部一次性排除。一次遍历 O(n) 搞定。
          </p>
        </Callout>
        <CodeTabs
          title="lc134_gas_station"
          java={{
            code: `class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < gas.length; i++) {
            int diff = gas[i] - cost[i];
            total += diff;              // 全程净油量
            tank += diff;               // 从 start 出发到此的油箱
            if (tank < 0) {             // 开到 i 就断油
                start = i + 1;          // 起点只可能在 i 之后
                tank = 0;               // 从新起点重新起算
            }
        }
        return total < 0 ? -1 : start;  // 总油量够 → start 一定能跑完
    }
}`,
            hl: [8, 9, 10, 11],
            note: (
              <>
                别被「环形」吓到:贪心「见负即弃前缀」把它化成了普通线性扫描,
                失败的起点一个都不用回头再试。O(n)、O(1)。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def canCompleteCircuit(self, gas: list[int], cost: list[int]) -> int:
        total = tank = 0
        start = 0
        for i in range(len(gas)):
            diff = gas[i] - cost[i]
            total += diff
            tank += diff
            if tank < 0:               # 到 i 断油,起点跳到 i+1
                start = i + 1
                tank = 0
        return -1 if total < 0 else start`,
            hl: [9, 10, 11],
            note: (
              <>
                total 和 tank 分工明确:total 判「有没有解」,tank 找「起点在哪」——
                两个累加器一趟扫完。
              </>
            ),
          }}
          js={{
            code: `var canCompleteCircuit = function (gas, cost) {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    total += diff;
    tank += diff;
    if (tank < 0) {                  // 到 i 断油
      start = i + 1;                 // 起点只能更靠后
      tank = 0;
    }
  }
  return total < 0 ? -1 : start;
};`,
            hl: [7, 8, 9, 10],
            note: (
              <>
                贪心的胆量来自结论②的证明:被跳过的起点必然更早断油 —— 想清楚这一点,才敢一次遍历。
              </>
            ),
          }}
        />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            <b>LC 135 分发糖果(hard,但套路清晰):</b>每个孩子有评分,规则是「评分更高的孩子,
            要比相邻的孩子拿更多糖」,求最少糖数。难点在于<strong>一个孩子同时受左右两个邻居约束</strong>。
            贪心拆招:<strong>一个约束扫一遍</strong>—— 从左到右满足「比左邻高就多一颗」,
            再从右到左满足「比右邻高就多一颗」,两遍取 max 让两侧同时成立。
          </p>
        </div>
        <CodeTabs
          title="lc135_candy"
          java={{
            code: `class Solution {
    public int candy(int[] ratings) {
        int n = ratings.length;
        int[] candy = new int[n];
        Arrays.fill(candy, 1);                 // 每人先发 1 颗
        for (int i = 1; i < n; i++)            // 左 → 右:比左邻高就多 1
            if (ratings[i] > ratings[i - 1]) candy[i] = candy[i - 1] + 1;
        for (int i = n - 2; i >= 0; i--)       // 右 → 左:比右邻高就取 max
            if (ratings[i] > ratings[i + 1])
                candy[i] = Math.max(candy[i], candy[i + 1] + 1);
        int sum = 0;
        for (int c : candy) sum += c;
        return sum;
    }
}`,
            hl: [6, 7, 8, 9, 10],
            note: (
              <>
                右遍历必须用 <b>max</b> 而非直接赋值 —— 否则会把左遍历刚满足的约束毁掉。这是本题唯一的坑。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def candy(self, ratings: list[int]) -> int:
        n = len(ratings)
        candy = [1] * n
        for i in range(1, n):                  # 左 → 右
            if ratings[i] > ratings[i - 1]:
                candy[i] = candy[i - 1] + 1
        for i in range(n - 2, -1, -1):         # 右 → 左
            if ratings[i] > ratings[i + 1]:
                candy[i] = max(candy[i], candy[i + 1] + 1)
        return sum(candy)`,
            hl: [8, 9, 10],
            note: (
              <>
                「一个方向的约束就用一次单向扫描」——双向依赖被拆成两次独立的单向贪心,再合并。
              </>
            ),
          }}
          js={{
            code: `var candy = function (ratings) {
  const n = ratings.length;
  const candy = new Array(n).fill(1);
  for (let i = 1; i < n; i++)                 // 左 → 右
    if (ratings[i] > ratings[i - 1]) candy[i] = candy[i - 1] + 1;
  for (let i = n - 2; i >= 0; i--)            // 右 → 左
    if (ratings[i] > ratings[i + 1])
      candy[i] = Math.max(candy[i], candy[i + 1] + 1);
  return candy.reduce((a, b) => a + b, 0);
};`,
            hl: [6, 7, 8],
            note: (
              <>
                时间 <b>O(n)</b>、空间 O(n)。这是「双向约束 → 两遍单向扫描」的样板题,值得记牢。
              </>
            ),
          }}
        />
        <Callout tone="idea" title="LC 406 根据身高重建队列:先站高个子(进阶)">
          <p>
            <b>题意:</b>每人用 (h, k) 描述 —— 身高 h、前面恰好有 k 个身高 ≥ 自己的人,求还原后的队列。
            <b> 贪心:</b>按<b>身高降序、k 升序</b>排序,然后把每个人依次<b>插入到下标 k 的位置</b>。
            为什么对?因为按高到矮处理,后插入的人都比队里已有的矮(或同高但 k 更大),
            <b>插进去不会改变前面任何人看到的「更高者个数」</b>—— 每个人的 k 一次到位。
            「先固定影响最大的维度(身高),再安排次要维度(k)」是排序 + 贪心的经典配方。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 区间贪心 + 精讲 C ================= */}
      <Section
        id="interval"
        index="06"
        title="区间贪心:按左端还是右端排序?"
        desc="精讲 C · LC 435 无重叠区间 —— 附 452 / 763 / 56 一网打尽"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            区间题几乎都要先排序,而<strong>「按左端还是右端排」直接决定成败</strong>。
            先看本章重头戏 <strong>LC 435 无重叠区间</strong>:给一堆区间,最少删几个,能让剩下的互不重叠?
          </p>
          <p>
            <b>暴力:</b>枚举保留哪些子集,2ⁿ。
            <b> 贪心洞察:</b>「删最少」等价于「<strong>保留最多互不重叠的区间</strong>」。
            要保留得多,就该<strong>每次都留下「结束最早」的那个</strong>——
            它结束得早,给后面腾出的空间最大。所以<strong>按右端点排序</strong>,
            从左往右扫,不重叠就保留、重叠就删。逐帧看这条时间轴:
          </p>
        </div>
        <IntervalTimeline />
        <CodeTabs
          title="lc435_non_overlapping_intervals"
          java={{
            code: `class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        // 按右端升序 —— 结束越早,给后面留的空间越大
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));
        int kept = 0, lastEnd = Integer.MIN_VALUE;
        for (int[] iv : intervals) {
            if (iv[0] >= lastEnd) {     // 不与上一个保留区间重叠
                kept++;                 // 保留它
                lastEnd = iv[1];        // 更新「上一个终点」这道门槛
            }                           // 否则重叠 → 删掉(什么都不做)
        }
        return intervals.length - kept; // 删除数 = 总数 − 保留数
    }
}`,
            hl: [4, 7, 8, 9],
            note: (
              <>
                用 <code>Integer.compare(a[1], b[1])</code> 而非 <code>a[1] - b[1]</code>——
                后者在端点为大负 / 大正数时可能<b>整型溢出</b>,把比较结果搞反。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def eraseOverlapIntervals(self, intervals: list[list[int]]) -> int:
        intervals.sort(key=lambda iv: iv[1])   # 按右端升序
        kept, last_end = 0, float("-inf")
        for s, e in intervals:
            if s >= last_end:                  # 不重叠 → 保留
                kept += 1
                last_end = e
        return len(intervals) - kept`,
            hl: [3, 6, 7, 8],
            note: (
              <>
                <code>key=lambda iv: iv[1]</code> 是「按右端排」的精髓所在。改成 <code>iv[0]</code>
                (按左端)这题就错了 —— 一个长区间会挤掉后面多个短区间。
              </>
            ),
          }}
          js={{
            code: `var eraseOverlapIntervals = function (intervals) {
  intervals.sort((a, b) => a[1] - b[1]);   // 按右端升序
  let kept = 0, lastEnd = -Infinity;
  for (const [s, e] of intervals) {
    if (s >= lastEnd) {                     // 不重叠 → 保留
      kept++;
      lastEnd = e;
    }
  }
  return intervals.length - kept;
};`,
            hl: [2, 5, 6, 7],
            note: (
              <>
                <b>LC 452 引爆气球几乎同款:</b>把「s ≥ lastEnd 保留」换成「s &gt; lastEnd 才需要新箭」——
                气球边界是闭区间,相切(s == lastEnd)也能一箭串起。
              </>
            ),
          }}
        />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            <b>为什么是右端,不是左端?</b>交换论证:设最优解保留的第一个区间是 X,
            贪心保留的是「结束最早的」G。因为 G 结束不晚于 X,把最优解里的 X 换成 G,
            后面能保留的区间只会更多不会更少 —— 归纳下去,贪心保留的数量就是最多的。
            <b>结束早 = 留白多 = 后续机会多</b>,这就是区间调度的黄金法则。
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 6 }}>
          <div className="card hoverable">
            <div className="card-kicker">同款 · LC 452</div>
            <div className="card-title">🎈 最少的箭</div>
            <p>
              按右端排,一支箭射在当前最小右端,凡是 <code>start ≤</code> 该值的气球都被穿爆;
              遇到够不着的换新箭。和 435 是<b>同一道题换皮</b>。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">变体 · LC 763</div>
            <div className="card-title">🔤 划分字母区间</div>
            <p>
              先记每个字母<b>最后出现的下标</b>,遍历时把当前段右界扩到「段内字母的最远出现处」,
              扫到右界就切一刀 —— 本质是合并同字母的区间。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">对照 · LC 56(复盘)</div>
            <div className="card-title">🔗 合并区间</div>
            <p>
              目标是<b>合并</b>不是筛选,所以<b>按左端排</b>:能接上就把终点取 max,
              接不上就另起一段。主讲在第 1 章排序,此处专门用来对照排序键的选择。
            </p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>你的目标是……</th>
                <th>排序键</th>
                <th>贪心动作</th>
                <th>代表题</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>选最多不重叠 / 删最少 / 用最少的箭</b></td>
                <td>右端点升序</td>
                <td>留结束最早者,给后面留最多空间</td>
                <td>435 · 452 · 活动选择</td>
              </tr>
              <tr>
                <td><b>合并所有重叠区间</b></td>
                <td>左端点升序</td>
                <td>能接上就扩右界,接不上就新开一段</td>
                <td>56 · 57</td>
              </tr>
              <tr>
                <td><b>按内容切分连续段</b></td>
                <td>不排区间,记「最后出现位置」</td>
                <td>扫到当前段右界就切</td>
                <td>763</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="deep" title="工程现场:区间调度就是资源分配的日常">
          <p>
            435 的另一个名字叫<b>活动选择(activity selection)</b>——
            会议室排会(同一间屋最多塞几场不冲突的会)、CPU 抢占式调度选任务、
            带宽 / 云主机的时间片分配,全是它。「按结束时间排、贪结束最早」是运筹学里被证明了几十年的老将。
            下次日历自动帮你避开冲突会议时,背后大概率就有它。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 贪心失效之地 ================= */}
      <Section
        id="fail"
        index="07"
        title="贪心失效之地:证不出来,就退回 DP"
        desc="反例意识 + 贪心 vs DP 判据 —— 承上启下接第 7 章"
      >
        <div className="prose">
          <p>
            学到这里你手里握着一把快刀,但请记住本章开头的警告:<strong>贪心会翻车</strong>。
            最著名的翻车现场就在下一章的开场 —— <strong>LC 322 零钱兑换</strong>。
            硬币面额 <code>[1, 3, 4]</code>,凑 ¥6。亲手玩一下,感受贪心是怎么和最优解擦肩而过的:
          </p>
        </div>
        <CoinGreedyLab />
        <div className="grd-duel" style={{ marginTop: 4 }}>
          <div className="card">
            <div className="card-kicker">贪心 · 每步拿最大</div>
            <div className="card-title"><b className="mono">4 + 1 + 1 = 3 枚</b></div>
            <p>
              先抓最大的 4(剩 2)→ 3 超了,只能 1 + 1。每一步都「当下最优」,
              却一头扎进了回不去的世界线 —— 它<b>永远看不见「两个 3」</b>。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">DP · 每种拿法都记账</div>
            <div className="card-title"><b className="mono">3 + 3 = 2 枚</b></div>
            <p>
              dp[6] 枚举「最后一枚是 1 / 3 / 4」三种可能取最小,一分不漏。
              它不做「选择」,它把所有选择的后果都算了一遍 —— <b>这就是 DP 的兜底能力</b>。
            </p>
          </div>
        </div>
        <div className="prose">
          <p>
            <b>为什么贪心在这里失灵?</b>因为硬币 [1, 3, 4] 不满足<strong>贪心选择性质</strong>——
            「先拿 4」这个局部最优,恰恰破坏了「3 + 3」这个全局最优的结构。
            你没法用交换论证证明「先拿最大面额不吃亏」(反例就摆在眼前),
            <strong>证不出来,就不能贪</strong>。那怎么办?退回 DP:老老实实枚举「最后一枚硬币是谁」,
            把每个子问题的答案记下来。这正是第 7 章 §07 的主戏 —— 那里有 dp[6] 的逐格填充动画,
            本章的反例伏笔在那里收线。
          </p>
        </div>
        <div className="grd-steps">
          <div className="grd-step">
            <div>
              <h4>先试贪心:能写出一句话的交换论证吗?</h4>
              <p>
                能一句话说清「局部最优为什么不会毁掉全局最优」(如 435「结束早留白多」、
                455「小饼干配小胃口不亏」)—— 那就大胆贪,O(n log n) 收工。
              </p>
            </div>
          </div>
          <div className="grd-step">
            <div>
              <h4>证不出?先找反例</h4>
              <p>
                构造小例子试图打破贪心(硬币 [1,3,4] 凑 6、按左端排 435)。
                一旦找到反例,贪心当场出局 —— 别心存侥幸「大数据也许就对了」。
              </p>
            </div>
          </div>
          <div className="grd-step">
            <div>
              <h4>退回 DP:枚举所有决策 + 记账</h4>
              <p>
                「最后一步有哪几种可能」逐一枚举、取 min/max,子问题答案记下来复用。
                慢一点(多项式),但<b>必对</b>。这就是下一章要交给你的兜底武器。
              </p>
            </div>
          </div>
        </div>
        <Callout tone="idea" title="范式雷达 · 一道最优化题的标准过脑顺序">
          <p>
            碰到最优化问题,按这个顺序在脑子里过一遍,就是标准答题姿势:
            <b>回溯</b>(枚举所有选择,必对但指数级,只配当草稿)→
            <b>贪心</b>(每步局部最优,最快,但<b>必须能证明</b>,[1,3,4] 上直接翻车)→
            <b>DP</b>(枚举决策 + 记账,必对,多项式时间)。
            一句话判据:<b>能证明交换论证就贪,证不出就 DP。</b>这条叙事线,下一章会全程展开。
          </p>
        </Callout>
      </Section>

      {/* ================= §08 题单 ================= */}
      <Section
        id="problems"
        index="08"
        title="高频题单:贪心 18 题"
        desc="按「交换论证 → 序列 → 跳跃 → 模拟 → 区间」分层,由易到难。先想 30 秒再看提示"
        badge={<span className="chip">主线必做</span>}
      >
        <ProblemSet ch="greedy" items={PROBLEMS} />
      </Section>

      {/* ================= §09 Quiz ================= */}
      <Section
        id="quiz"
        index="09"
        title="通关测验"
        desc="8 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="greedy" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            贪心 = <b>每步局部最优 + 不反悔</b>;成立的前提是<b>贪心选择性质</b>
            (局部最优能导出全局最优)+ <b>最优子结构</b>。快,但要有证据。
          </>,
          <>
            <b>交换论证</b>是本章灵魂:假设最优解和贪心第一步不同,用一次「不变差」的交换把它对齐贪心,
            归纳下去 ⇒ 贪心即最优。它是数学归纳法的应用外衣。
          </>,
          <>
            区间题的排序键决定成败:<b>筛选 / 删最少 / 最少箭 → 按右端排</b>(结束早留白多);
            <b>合并 → 按左端排</b>。这是 435 / 452 / 56 的分水岭。
          </>,
          <>
            跳跃游戏盯住<b>覆盖范围</b>而非「具体怎么跳」:55 维护最远可达判可行;
            45 多一层「到边界才计步」,本质是 <b>BFS 分层的贪心压缩</b>。
          </>,
          <>
            模拟贪心的共性是<b>「一条局部规则 + 一次遍历」</b>:134 见负即弃前缀、
            135 双向约束拆成两遍单向扫、860 攒住最灵活的面额。
          </>,
          <>
            同一道题常有贪心与 DP 两种视角(122 股票、53 Kadane)——
            贪心快、DP 通用;能证明就用贪心,拿不准就用 DP 兜底验算。
          </>,
          <>
            <b>贪心失效之地就是 DP 的主场</b>:硬币 [1,3,4] 凑 6 证不出贪心选择性质,
            就退回「枚举所有决策 + 记账」。判据一句话:<b>证得出就贪,证不出就 DP</b> —— 下一章见。
          </>,
        ]}
      />

      <ChapterFooter ch="greedy" />
    </main>
  );
}
