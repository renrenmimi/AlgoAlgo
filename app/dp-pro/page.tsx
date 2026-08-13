"use client";

// 第 10 章 · DP 进阶 —— DP 四章收官。四大高级 DP 类型各成一节:
// §02 状态机 DP(股票族谱,精讲 309)→ §03 树形 DP(精讲 337)→
// §04 区间 DP(精讲 312)→ §05 状压 DP(526 入门)→ §06 数位/概率 一句话地图。
// 招牌可视化:自建 SVG 状态转移图(StockFSM)、TreePlayer(RobTreeDP)、
// DPTable 斜着填(BalloonInterval)、交互式 bit 集合(MaskLab)—— 均在 ./viz。

import "./chapter.css";
import { Hero, Section, Callout, BigO, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { PROBLEMS, QUIZ } from "@/lib/dp-pro-data";
import { StockFSM, RobTreeDP, BalloonInterval, MaskLab } from "./viz";

const CHIPS = [
  { id: "why", n: "01", label: "四张高级地图" },
  { id: "fsm", n: "02", label: "状态机 · 股票族谱" },
  { id: "tree", n: "03", label: "树形 DP" },
  { id: "interval", n: "04", label: "区间 DP · 戳气球" },
  { id: "bitmask", n: "05", label: "状压 DP" },
  { id: "map", n: "06", label: "数位/概率地图" },
  { id: "problems", n: "07", label: "高频题单" },
  { id: "quiz", n: "08", label: "通关测验" },
];

export default function DPProChapter() {
  return (
    <main className="page" data-ch="dp-pro">
      <Hero
        ch="dp-pro"
        title={
          <>
            DP 进阶 <span className="grad">Advanced DP</span>
          </>
        }
        essence={
          <>
            DP 四章收官。前三章的状态都是老实的 <code>dp[i]</code>、<code>dp[i][j]</code>;
            这一章,状态换了四副面孔:一台<strong>机器</strong>(状态机)、一段
            <strong>区间</strong>、一棵<strong>树</strong>、一个<strong>集合</strong>。
            骨架没变 —— 定义状态、按「最后一步」写转移、定填表顺序;变的只是「状态长什么样」。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 四张高级地图 ================= */}
      <Section
        id="why"
        index="01"
        title="从「一维表」到「四张高级地图」"
        desc="DP 进阶不是新魔法 —— 只是状态的形状变了"
      >
        <div className="prose">
          <p>
            回顾 DP 前三章:入门是 <code>dp[i]</code>(线性)、背包与网格是 <code>dp[i][j]</code>
            (两个维度)、子序列是两个字符串比对的二维表。它们的状态都能「一句话说清、一个下标定位」。
            到了进阶,题目开始逼你回答更刁钻的问题,<strong>状态本身长出了结构</strong>:
          </p>
        </div>
        <div className="grid-2" style={{ marginTop: 6 }}>
          <div className="card hoverable">
            <div className="pro-type-ico" aria-hidden>🎛️</div>
            <div className="card-kicker">§02 · 状态机 DP</div>
            <div className="card-title">状态是一台「机器」</div>
            <p>
              局面在几种<b>身份</b>之间跳(持有/空仓/冷冻…),每种身份是一个状态,
              转移是身份之间的箭头。信号:同一时刻你「处于某种模式」,且模式之间有明确的切换规则。
              招牌是股票买卖族谱。
            </p>
          </div>
          <div className="card hoverable">
            <div className="pro-type-ico" aria-hidden>🌳</div>
            <div className="card-kicker">§03 · 树形 DP</div>
            <div className="card-title">状态挂在「树」上</div>
            <p>
              dp 不再沿数组走,而是沿树的父子关系,<b>后序遍历、自底向上</b>汇报。
              信号:问题定义在一棵树/图上,且父节点的答案由孩子的答案拼成。
              代表:树上打家劫舍、二叉树直径。
            </p>
          </div>
          <div className="card hoverable">
            <div className="pro-type-ico" aria-hidden>📏</div>
            <div className="card-kicker">§04 · 区间 DP</div>
            <div className="card-title">状态是一段「区间」</div>
            <p>
              dp[i][j] 表示「区间 [i, j] 的最优」,大区间由小区间拼成,所以要
              <b>按区间长度从小到大、斜着填</b>。信号:操作会「合并/切分」一段连续区间。
              代表:戳气球、最长回文子序列。
            </p>
          </div>
          <div className="card hoverable">
            <div className="pro-type-ico" aria-hidden>🔦</div>
            <div className="card-kicker">§05 · 状压 DP</div>
            <div className="card-title">状态是一个「集合」</div>
            <p>
              用一个整数的二进制位表示「哪些元素已用」,dp[mask] 就是「用掉这批元素的最优」。
              信号:n 小到反常(≤ 20)且状态要记一个集合。地基是第 4 章位运算。
              代表:优美排列、旅行商 TSP。
            </p>
          </div>
        </div>
        <Callout tone="idea" title="四类共享同一套五步法">
          <p>
            别被「四种类型」吓到 —— 它们全都套用第 7 章的<b>五步法</b>:定义状态 → 按「最后一步」
            写转移 → 初始化 → 定遍历顺序 → 手推小例子。唯一的新功课,是学会<b>认出「状态该长成什么形状」</b>:
            看到「几种身份切换」想状态机、看到「树」想树形、看到「区间合并」想区间 DP、
            看到「小 n + 集合」想状压。认对了形状,转移方程往往水到渠成。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 状态机 DP · 股票族谱 ================= */}
      <Section
        id="fsm"
        index="02"
        title="状态机 DP:一张图讲清整个股票族谱"
        desc="精讲 · LC 309 含冷冻期 —— 把「持有/空仓/冷冻」画成会流动的状态"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            LeetCode 的「买卖股票」是一整个<strong>族谱</strong>:同一个内核,不断加约束。
            与其一道道背,不如认清它们共享的心智模型 —— <strong>状态机(state machine)</strong>:
            任何一天收盘时,你只可能处在有限的几种「身份」里,明天的身份由今天的身份 + 今天的操作决定。
            把身份画成方框、把合法操作画成箭头,DP 就是「让每个方框里的最大利润一天天长大」。
          </p>
        </div>
        <div className="pro-ladder">
          <div className="pro-rung">
            <span className="pro-rung-lc">LC 121</span>
            <div>
              <h4>只能买卖一次</h4>
              <p>
                <span className="add">加什么:</span>单状态 —— 一路记录「到今天为止的最低买点」,
                答案是每天 price − 最低价 的最大值。族谱的原点。
              </p>
            </div>
          </div>
          <div className="pro-rung">
            <span className="pro-rung-lc">LC 122</span>
            <div>
              <h4>可以无限次买卖</h4>
              <p>
                <span className="add">加什么:</span>两状态 hold(持有)/ cash(空仓)反复横跳。
                这题也能贪心(吃下每段上涨),两解等价 —— 但状态机版才好往下升级。
              </p>
            </div>
          </div>
          <div className="pro-rung">
            <span className="pro-rung-lc">LC 123 / 188</span>
            <div>
              <h4>最多买卖 k 次</h4>
              <p>
                <span className="add">加什么:</span>把「已用掉几次交易」升成一个状态维度。
                123 是 k=2 的特例(五个状态),188 是一般的 dp[k][hold]。
              </p>
            </div>
          </div>
          <div className="pro-rung">
            <span className="pro-rung-lc">LC 309</span>
            <div>
              <h4>含冷冻期(本节精讲)</h4>
              <p>
                <span className="add">加什么:</span>一个新状态 sold(今天刚卖出)——
                卖出后必须冷冻一天才能再买,两状态装不下这个「空窗」。
              </p>
            </div>
          </div>
          <div className="pro-rung">
            <span className="pro-rung-lc">LC 714</span>
            <div>
              <h4>含手续费</h4>
              <p>
                <span className="add">加什么:</span>不加状态,只在「卖出」那条转移里扣 fee。
                但它让 122 的贪心失效 —— 从此只能靠状态 DP 记账。
              </p>
            </div>
          </div>
        </div>
        <div className="prose">
          <p>
            先立<strong>最小内核 122</strong>(无限次买卖):两个状态,两条转移。记住这段模板,
            后面所有股票题都是在它身上「加状态、改转移」:
          </p>
        </div>
        <CodeTabs
          title="lc122_stock_state_machine"
          java={{
            code: `class Solution {
    public int maxProfit(int[] prices) {
        int hold = -prices[0];   // 持有:第一天就买入
        int cash = 0;            // 空仓:什么都没干
        for (int p : prices) {
            hold = Math.max(hold, cash - p); // 保持持有 / 今天买入
            cash = Math.max(cash, hold + p); // 保持空仓 / 今天卖出
        }
        return cash;             // 最后一天不该还持有
    }
}`,
            hl: [6, 7],
            note: (
              <>
                两个状态各占一个变量,空间 O(1)。把它当模板背下来 ——
                下面 309 只是在它上面「多挂一个状态」。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        hold, cash = -prices[0], 0
        for p in prices:
            hold = max(hold, cash - p)   # 保持 / 买入
            cash = max(cash, hold + p)   # 保持 / 卖出
        return cash`,
            hl: [5, 6],
            note: (
              <>
                贪心一行版更短:<code>sum(max(0, b - a) for a, b in zip(prices, prices[1:]))</code>;
                但状态机版能无缝升级到 714 / 309,贪心不能。
              </>
            ),
          }}
          js={{
            code: `var maxProfit = function (prices) {
  let hold = -prices[0], cash = 0;
  for (const p of prices) {
    hold = Math.max(hold, cash - p); // 保持 / 买入
    cash = Math.max(cash, hold + p); // 保持 / 卖出
  }
  return cash;
};`,
            hl: [4, 5],
            note: (
              <>
                同一轮里先更新 hold 再更新 cash,cash 用到的是「刚更新的 hold」——
                对无限次交易恰好等价于「当天买当天卖」,不影响结果。
              </>
            ),
          }}
        />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            <b>题意(309):</b>可无限次买卖,但<strong>卖出后第二天不能买</strong>(冷冻一天)。
            <b> 为什么两状态不够?</b>因为「今天刚卖出」和「早就空仓着」这两种局面,明天的可选操作不同 ——
            前者不能买、后者能买。它们必须是两个不同的状态。于是把空仓拆成 sold(刚卖·冷冻中)和
            rest(空仓·可买)。三个状态、三条转移,亲眼看它们逐日流动:
          </p>
        </div>
        <StockFSM />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            把上图的三条转移原样翻译成代码。关键坑:三个新值都要用<strong>昨天</strong>的旧值算出来,
            所以要么用临时变量、要么用「整体求值再赋值」的解包语法:
          </p>
        </div>
        <CodeTabs
          title="lc309_stock_with_cooldown"
          java={{
            code: `class Solution {
    public int maxProfit(int[] prices) {
        int hold = -prices[0]; // 持有股票
        int sold = 0;          // 今天刚卖出 → 冷冻期
        int rest = 0;          // 空仓且不在冷冻,可以买
        for (int i = 1; i < prices.length; i++) {
            int p = prices[i];
            int nHold = Math.max(hold, rest - p); // 保持 / 从「空仓」买入
            int nSold = hold + p;                 // 今天卖出
            int nRest = Math.max(rest, sold);     // 保持 / 冷冻期满
            hold = nHold; sold = nSold; rest = nRest;
        }
        return Math.max(sold, rest);              // 结束时不该持有
    }
}`,
            hl: [8, 9, 10],
            note: (
              <>
                三个 <code>n*</code> 临时变量是必需的:若直接覆盖 hold/sold/rest,
                后面的转移会读到「今天的新值」而非「昨天的旧值」,结果全乱。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        hold, sold, rest = -prices[0], 0, 0
        for p in prices[1:]:
            hold, sold, rest = (
                max(hold, rest - p),  # 保持 / 从空仓买入
                hold + p,             # 今天卖出
                max(rest, sold),      # 保持 / 冷冻期满
            )
        return max(sold, rest)`,
            hl: [6, 7, 8],
            note: (
              <>
                元组解包会先把右边三项<b>整体求值</b>(全用昨天的值),再一起赋值 ——
                天然免掉临时变量,这正是 Python 写状态机 DP 的便利之处。
              </>
            ),
          }}
          js={{
            code: `var maxProfit = function (prices) {
  let hold = -prices[0], sold = 0, rest = 0;
  for (let i = 1; i < prices.length; i++) {
    const p = prices[i];
    [hold, sold, rest] = [
      Math.max(hold, rest - p), // 保持 / 从空仓买入
      hold + p,                 // 今天卖出
      Math.max(rest, sold),     // 保持 / 冷冻期满
    ];
  }
  return Math.max(sold, rest);
};`,
            hl: [6, 7, 8],
            note: (
              <>
                数组解构和 Python 元组一样「先整体求值右侧,再一起赋值」,
                三个转移都安全地读到昨天的值。空间 O(1)。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 面试追问">
          <p>
            时间 <BigO o="n" />、空间 <BigO o="1" />。追问链:①「加手续费?」(714)→ 卖出转移里减 fee,
            两状态即可;②「最多 k 次交易?」(188)→ 把交易次数升成维度 dp[k][2];
            ③「为什么冷冻期只需 1 个新状态,而不是把『冷冻剩几天』也记下来?」→ 因为冷冻恰好 1 天,
            「刚卖」这一个状态就完整表达了「明天不能买」;若冷冻 m 天,才需要把「冷冻进度」也塞进状态。
            <b>约束多复杂,状态就多几维 —— 这就是状态机 DP 的可扩展性。</b>
          </p>
        </Callout>
        <Callout tone="deep" title="工程现场:状态机无处不在">
          <p>
            股票 DP 的「状态 + 转移」正是<b>有限状态机(FSM)</b>的思想,它是工程里的基础设施:
            TCP 连接的 CLOSED → SYN_SENT → ESTABLISHED、订单系统的「待支付 → 已支付 → 已发货 → 完成」、
            正则引擎的匹配、UI 的加载/成功/失败态 —— 全是状态机。学会「把局面拆成有限状态 + 明确转移」,
            受益的远不止刷题。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 树形 DP ================= */}
      <Section
        id="tree"
        index="03"
        title="树形 DP:把「选 / 不选」搬上一棵树"
        desc="精讲 · LC 337 打家劫舍 III —— 后序遍历,自底向上汇报两个状态"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            第 7 章的打家劫舍(198)是<strong>一排</strong>房子:dp[i] 只看前一格。
            现在把房子摆成<strong>一棵二叉树</strong>(337):偷了父节点,两个孩子就都不能偷。
            数组的「前一格」在树上变成了「两个孩子」—— 转移的方向,从「沿数组往左看」变成了
            「沿树往下问孩子」。
          </p>
          <p>
            <b>关键洞察:</b>每个节点必须向父亲汇报<strong>两个</strong>数,而不是一个:
            「偷我能得多少」和「不偷我能得多少」。因为父亲若想偷自己,就要求孩子<b>不偷</b>;
            父亲若不偷自己,孩子才能<b>各取最优</b>。只汇报一个 max,父亲就没法组合了。
            用<strong>后序遍历</strong>(先递归左右孩子、再算自己)实现「自底向上」:
          </p>
        </div>
        <RobTreeDP />
        <CodeTabs
          title="lc337_house_robber_iii"
          java={{
            code: `class Solution {
    public int rob(TreeNode root) {
        int[] r = dfs(root);
        return Math.max(r[0], r[1]); // max(偷根, 不偷根)
    }

    // 返回 [偷当前节点的最大值, 不偷当前节点的最大值]
    private int[] dfs(TreeNode node) {
        if (node == null) return new int[]{0, 0};
        int[] l = dfs(node.left);
        int[] r = dfs(node.right);
        int rob = node.val + l[1] + r[1];                       // 偷:孩子必须不偷
        int skip = Math.max(l[0], l[1]) + Math.max(r[0], r[1]); // 不偷:孩子随意
        return new int[]{rob, skip};
    }
}`,
            hl: [12, 13],
            note: (
              <>
                后序遍历:先递归拿到左右孩子的 [偷, 不偷],再算自己 —— 这就是「自底向上」。
                空孩子返回 <code>[0, 0]</code> 是天然基例,不用特判叶子。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def rob(self, root: TreeNode) -> int:
        def dfs(node):
            if not node:
                return (0, 0)                 # (偷, 不偷)
            lr, ls = dfs(node.left)
            rr, rs = dfs(node.right)
            rob = node.val + ls + rs          # 偷:孩子必须不偷
            skip = max(lr, ls) + max(rr, rs)  # 不偷:孩子随意
            return (rob, skip)
        return max(dfs(root))`,
            hl: [8, 9],
            note: (
              <>
                用元组 <code>(偷, 不偷)</code> 汇报最自然;最后 <code>max(dfs(root))</code>
                直接对二元组取较大值 —— Python 的 max 一步搞定。
              </>
            ),
          }}
          js={{
            code: `var rob = function (root) {
  const dfs = (node) => {
    if (!node) return [0, 0];        // [偷, 不偷]
    const [lr, ls] = dfs(node.left);
    const [rr, rs] = dfs(node.right);
    const robIt = node.val + ls + rs;                 // 偷:孩子必须不偷
    const skip = Math.max(lr, ls) + Math.max(rr, rs); // 不偷:孩子随意
    return [robIt, skip];
  };
  const [a, b] = dfs(root);
  return Math.max(a, b);
};`,
            hl: [6, 7],
            note: (
              <>
                变量名避开保留字用 <code>robIt</code>;返回长度 2 的数组当「双状态」,
                解构接收 —— 和 Java 的 <code>int[]</code> 一个思路。
              </>
            ),
          }}
        />
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">同款套路 · LC 543(复盘)</div>
            <div className="card-title">二叉树的直径</div>
            <p>
              「返回值 ≠ 答案」的树形 DP:dfs 返回「向下的最大深度」,却在每个节点用
              <b>左深 + 右深</b>顺手更新全局答案。返回一个量、更新另一个量 —— 树形 DP 的通用手筋
              (124 最大路径和同款)。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">进阶 · LC 968(复盘)</div>
            <div className="card-title">监控二叉树</div>
            <p>
              每个节点返回三态:未覆盖 / 已覆盖 / 有摄像头。自底向上 + 贪心
              (让摄像头尽量装在叶子的父层)。树形 DP 与贪心合体,难度更高,主线过后再碰。
            </p>
          </div>
        </div>
        <Callout tone="warn" title="树形 DP 两大坑">
          <p>
            ① <b>只返回一个值</b>:很多人一上来就让 dfs 返回「以该节点为根能偷的最大值」——
            结果父节点想偷自己时,拿不到「孩子不偷」的那个数。<b>状态不完整,转移必错。</b>
            ② <b>用错遍历序</b>:必须<b>后序</b>(先算孩子)。前序/层序会在孩子还没算好时就用它 ——
            违反「用到时已算出」的铁律。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 区间 DP · 戳气球 ================= */}
      <Section
        id="interval"
        index="04"
        title="区间 DP:大区间站在小区间的肩膀上"
        desc="精讲 · LC 312 戳气球 —— 逆向思维 + 按区间长度斜着填"
        badge={<span className="lc-badge" data-d="hard">HARD</span>}
      >
        <div className="prose">
          <p>
            <b>题意(312):</b>一排气球各有分数,戳破第 i 个得到
            <code>left × nums[i] × right</code> 的硬币(left/right 是它当前紧邻的气球),
            气球戳破后左右会贴合。求戳完全部气球的最大硬币。
          </p>
          <p>
            <b>为什么正向想会卡死?</b>如果枚举「先戳哪个」,戳完之后左右两半会合并成新的一排,
            两半互相影响 —— 子问题<strong>纠缠</strong>在一起,没法独立求解。这正是区间 DP 的经典陷阱。
          </p>
          <p>
            <b>逆向的灵光一闪:</b>换成枚举「<strong>最后</strong>一个被戳破的气球 k」。
            当 k 最后戳时,区间 (i, j) 里除了 k 全都戳空了,所以 k 的左右邻居<strong>一定是端点 i 和 j</strong> ——
            得 <code>arr[i] × arr[k] × arr[j]</code>;而 (i, k) 和 (k, j) 两段在 k 之前各自独立戳完,
            互不干扰。于是:
          </p>
          <p style={{ textAlign: "center" }}>
            <code>dp[i][j] = max over k∈(i,j) of ( dp[i][k] + arr[i]×arr[k]×arr[j] + dp[k][j] )</code>
          </p>
          <p>
            两端补上<strong>虚拟气球(值 1)</strong>,边界就不用特判了。因为长区间要用到短区间的答案,
            必须<strong>按区间长度从小到大填</strong> —— 也就是沿对角线「斜着」推。逐帧看这张表怎么长出来:
          </p>
        </div>
        <BalloonInterval />
        <CodeTabs
          title="lc312_burst_balloons"
          java={{
            code: `class Solution {
    public int maxCoins(int[] nums) {
        int n = nums.length;
        int[] arr = new int[n + 2];
        arr[0] = arr[n + 1] = 1;                   // 两端补虚拟气球
        for (int i = 0; i < n; i++) arr[i + 1] = nums[i];

        int[][] dp = new int[n + 2][n + 2];
        for (int len = 2; len <= n + 1; len++)     // 区间长度从小到大
            for (int i = 0; i + len <= n + 1; i++) {
                int j = i + len;                   // 开区间 (i, j)
                for (int k = i + 1; k < j; k++)    // 枚举最后戳破的气球 k
                    dp[i][j] = Math.max(dp[i][j],
                        dp[i][k] + arr[i] * arr[k] * arr[j] + dp[k][j]);
            }
        return dp[0][n + 1];
    }
}`,
            hl: [9, 12, 13, 14],
            note: (
              <>
                三层循环:外层「区间长度」(保证短区间先算好)、中层左端点、内层枚举「最后戳的 k」。
                时间 O(n³),n ≤ 500 稳过。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def maxCoins(self, nums: list[int]) -> int:
        arr = [1] + nums + [1]              # 两端补虚拟气球
        n = len(arr)
        dp = [[0] * n for _ in range(n)]
        for length in range(2, n):          # 区间长度从小到大
            for i in range(n - length):
                j = i + length              # 开区间 (i, j)
                for k in range(i + 1, j):   # 枚举最后戳破的气球 k
                    dp[i][j] = max(dp[i][j],
                        dp[i][k] + arr[i] * arr[k] * arr[j] + dp[k][j])
        return dp[0][n - 1]`,
            hl: [6, 9, 10, 11],
            note: (
              <>
                <code>arr = [1] + nums + [1]</code> 一行完成加虚拟边界;length 从 2 起
                (长度不足 2 的区间里没有气球,dp 保持 0)。
              </>
            ),
          }}
          js={{
            code: `var maxCoins = function (nums) {
  const arr = [1, ...nums, 1];          // 两端补虚拟气球
  const n = arr.length;
  const dp = Array.from({ length: n }, () => Array(n).fill(0));
  for (let len = 2; len < n; len++) {   // 区间长度从小到大
    for (let i = 0; i + len < n; i++) {
      const j = i + len;                // 开区间 (i, j)
      for (let k = i + 1; k < j; k++) { // 枚举最后戳破的气球 k
        dp[i][j] = Math.max(dp[i][j],
          dp[i][k] + arr[i] * arr[k] * arr[j] + dp[k][j]);
      }
    }
  }
  return dp[0][n - 1];
};`,
            hl: [5, 8, 9, 10],
            note: (
              <>
                造二维数组别用 <code>Array(n).fill(Array(n))</code>(每行共享同一引用!)——
                用 <code>Array.from</code> 的工厂函数保证每行独立。
              </>
            ),
          }}
        />
        <Callout tone="idea" title="区间 DP 的两副面孔:相向收缩 vs 枚举分割点">
          <p>
            区间 DP 的转移通常两选一:①<b>相向收缩</b> —— 从两端往里缩,看 s[i] 与 s[j] 的关系,
            如 <b>516 最长回文子序列</b>(s[i]==s[j] 就 dp[i+1][j−1]+2,第 9 章从 LCS 视角讲过,
            这里是区间视角复盘);②<b>枚举分割/最后一步点 k</b> —— 在 (i, j) 里挑一个 k 切开,
            如戳气球、石子合并、矩阵链乘。两副面孔的共同点始终是:<b>大区间依赖小区间 ⇒ 按长度从小到大填。</b>
          </p>
        </Callout>
        <Callout tone="win" title="复杂度 & 面试追问">
          <p>
            时间 <BigO o="n2" label="O(n³)" />(区间对 × 枚举 k)、空间 <BigO o="n2" />。
            追问:①「为什么是『最后』戳而不是『第一个』戳?」→ 只有固定最后戳,左右两段才独立;
            正向会让区间合并、子问题纠缠(这是本题的灵魂,务必答出);
            ②「虚拟气球有什么用?」→ 让边界气球的邻居永远存在(值 1),省掉大量边界特判;
            ③「记忆化能写吗?」→ 能,自顶向下 dfs(i, j) + memo,和递推同阶,思路更直观。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 状压 DP ================= */}
      <Section
        id="bitmask"
        index="05"
        title="状压 DP:把一个集合塞进一个整数"
        desc="LC 526 优美排列 —— 复盘第 4 章「用 bit 表示集合」"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            有一类题,状态天然是「<strong>哪些元素已经用过了</strong>」这样一个<strong>集合</strong>。
            集合有 2ⁿ 个子集,若 n 很小(≤ 20),就能用一个整数的<strong>二进制位</strong>表示它:
            第 b 位是 1 表示「第 b 个元素已用」。这叫<strong>状态压缩(bitmask)DP</strong> ——
            它的地基,正是第 4 章位运算讲过的「一个 int 就是一排开关」。先亲手玩一下这个「集合 ↔ 整数」的对应:
          </p>
        </div>
        <MaskLab />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            <b>题意(526):</b>把 1..n 填进 n 个位置,若每个位置 i(1 起)都满足
            <code> perm[i] % i == 0</code> 或 <code>i % perm[i] == 0</code>,就是一个「优美排列」。
            求优美排列的个数。<b> 暴力:</b>全排列 n! 逐个验证,n=15 时 n! 是天文数字。
            <b> 状压:</b>注意到「已用哪些数字」决定了后面的选择,而 n ≤ 15 ——
            用 mask 表示已用集合,<code>popcount(mask)</code> 就是「已填好的位置数 pos」,
            下一个要填位置 pos+1。枚举一个没用过、且和 pos+1 相容的数字放进去:
          </p>
        </div>
        <CodeTabs
          title="lc526_beautiful_arrangement"
          java={{
            code: `class Solution {
    public int countArrangement(int n) {
        int[] dp = new int[1 << n];
        dp[0] = 1;                              // 空排列:1 种
        for (int mask = 0; mask < (1 << n); mask++) {
            int pos = Integer.bitCount(mask);   // 已填位置数 → 下一个填 pos+1
            for (int num = 1; num <= n; num++) {
                int bit = 1 << (num - 1);
                if ((mask & bit) == 0 && (num % (pos + 1) == 0 || (pos + 1) % num == 0))
                    dp[mask | bit] += dp[mask]; // 把 num 放到位置 pos+1
            }
        }
        return dp[(1 << n) - 1];
    }
}`,
            hl: [6, 9, 10],
            note: (
              <>
                <code>Integer.bitCount(mask)</code> 数出 mask 里有几个 1 = 已放好几个数字;
                mask 从小到大遍历,保证「用得少的状态」先算好。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def countArrangement(self, n: int) -> int:
        dp = [0] * (1 << n)
        dp[0] = 1
        for mask in range(1 << n):
            pos = bin(mask).count("1")          # 已填位置数
            for num in range(1, n + 1):
                bit = 1 << (num - 1)
                if not (mask & bit) and (num % (pos + 1) == 0 or (pos + 1) % num == 0):
                    dp[mask | bit] += dp[mask]  # 把 num 放到位置 pos+1
        return dp[-1]`,
            hl: [6, 9, 10],
            note: (
              <>
                <code>bin(mask).count(&quot;1&quot;)</code> 是数 1 的偷懒写法(3.10+ 可用
                <code>mask.bit_count()</code> 更快);<code>dp[-1]</code> 就是 dp[全 1]。
              </>
            ),
          }}
          js={{
            code: `var countArrangement = function (n) {
  const dp = new Array(1 << n).fill(0);
  dp[0] = 1;
  const popcount = (m) => { let c = 0; while (m) { m &= m - 1; c++; } return c; };
  for (let mask = 0; mask < (1 << n); mask++) {
    const pos = popcount(mask);           // 已填位置数
    for (let num = 1; num <= n; num++) {
      const bit = 1 << (num - 1);
      if (!(mask & bit) && (num % (pos + 1) === 0 || (pos + 1) % num === 0))
        dp[mask | bit] += dp[mask];       // 把 num 放到位置 pos+1
    }
  }
  return dp[(1 << n) - 1];
};`,
            hl: [6, 9, 10],
            note: (
              <>
                JS 没有内置 popcount,用 <code>m &amp;= m - 1</code> 逐个消掉最低位的 1
                (第 4 章的位运算技巧);n ≤ 15 时 2¹⁵ 个状态毫无压力。
              </>
            ),
          }}
        />
        <Callout tone="deep" title="状压的天花板:旅行商问题(TSP)">
          <p>
            状压 DP 最著名的应用是<b>旅行商问题</b>:走遍 n 个城市各一次的最短路。
            状态 <code>dp[mask][i]</code> = 「已走过 mask 这批城市、当前停在城市 i」的最短距离。
            它把「暴力枚举 n! 条路线」压成 <b>O(2ⁿ × n²)</b> —— 虽然仍是指数级,却已能解 n≈20 的实例
            (物流排线、PCB 打孔路径优化都用它)。这就是状压的边界:n 小,但小得「值钱」。
          </p>
        </Callout>
        <Callout tone="warn" title="状压的适用红线">
          <p>
            看到「集合」就想状压,但先看 n:<b>2ⁿ 必须装得下</b>。n ≤ 20 是舒适区(2²⁰≈100 万);
            n=25 就 3300 万、n=30 就 10 亿,基本出局。所以状压题的数据范围几乎总有个
            <b>刺眼的小 n</b> —— 它既是提示,也是红线。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 数位/概率 一句话地图 ================= */}
      <Section
        id="map"
        index="06"
        title="再往前一步:数位 DP 与概率 DP 一句话地图"
        desc="认得出信号即可 —— 不作主线要求,面试也少见"
      >
        <div className="prose">
          <p>
            DP 的世界还有两块「进阶区」。它们套路固定但门槛偏高,对零基础学习者<strong>知道有这么回事、
            认得出信号</strong>就够了 —— 真遇到再深入。
          </p>
        </div>
        <div className="pro-mini">
          <div className="card">
            <div className="pro-type-ico" aria-hidden>🔢</div>
            <div className="card-kicker">数位 DP</div>
            <div className="card-title">按「数位」逐位填</div>
            <p>
              <b>信号:</b>统计区间 [L, R] 内满足某种「数位性质」的整数个数(如不含数字 4、
              各位严格递增、数位和是某值)。<b>状态:</b>「处理到第几位 + 是否仍贴着上界 + 若干附加信息」,
              从高位到低位记忆化搜索。<b>代表:</b>233 数字 1 的个数、面试爱考的「windy 数」。
            </p>
          </div>
          <div className="card">
            <div className="pro-type-ico" aria-hidden>🎲</div>
            <div className="card-kicker">概率 / 期望 DP</div>
            <div className="card-title">状态里存的是概率</div>
            <p>
              <b>信号:</b>求某事件的概率或某量的期望值。<b>转移:</b>把「方案数相加」换成
              「按概率加权求和」(乘上各分支概率)。<b>坑:</b>期望常要<b>逆推</b>
              (从终点状态往起点算),正推会发现「当前期望」定义不出来。
              <b>代表:</b>688 骑士在棋盘上的概率、837 新 21 点。
            </p>
          </div>
        </div>
        <Callout tone="story" title="到这里,你已经走完了整座 DP 山脉">
          <p>
            从第 7 章「记账」的一句大白话,到入门的线性表、背包的容量表、子序列的双序列表,
            再到这一章的状态机、树形、区间、状压 —— 你手里已经有了一整套「认形状 → 套五步法」的工具。
            剩下的数位/概率 DP 只是山脉边缘的两座小峰。<b>DP 不再是玄学,它只是「把决策与状态的演进,
            一格一格地画出来」。</b>
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title="高频题单:DP 进阶 12 题"
        desc="按「状态机 → 树形 → 区间 → 状压 → 选做」分层。先想 30 秒再看提示"
        badge={<span className="chip">主线 + 进阶</span>}
      >
        <ProblemSet ch="dp-pro" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="7 题全对,点亮本章绿灯 —— 也点亮整个 DP 系列"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="dp-pro" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            DP 进阶 = <b>换状态的形状,不换五步法</b>:状态机(几种身份)、树形(挂在树上)、
            区间([i, j] 段)、状压(一个集合)—— 认对形状,转移方程往往自然浮现。
          </>,
          <>
            <b>状态机 DP</b>:局面在有限「身份」间跳转,每加一条约束就多一维/一个状态
            (股票族谱 121→122→123→309→714)。冷冻期 = 多一个「刚卖 sold」状态。
          </>,
          <>
            <b>树形 DP</b>:后序遍历、自底向上,每个节点<b>汇报多个状态</b>(337 的 [偷, 不偷])。
            常见「返回值 ≠ 答案」(543 返回深度、更新直径)。
          </>,
          <>
            <b>区间 DP</b>:大区间依赖小区间 ⇒ <b>按区间长度从小到大、斜着填</b>;
            难点常是「枚举最后一步 / 分割点 k」(312 枚举最后戳的气球,逆向思维)。
          </>,
          <>
            <b>状压 DP</b>:用整数的 bit 表示集合,dp[mask] = 用掉这批元素的最优;
            触发红线是<b>刺眼的小 n(≤ 20)</b>,让 2ⁿ 装得下。
          </>,
          <>
            <b>「枚举最后一步」是贯穿全 DP 的起手式</b>:线性是「最后一格从哪来」、
            背包是「最后一个物品选不选」、区间是「最后戳哪个」、状压是「最后放哪个数字」。
          </>,
          <>
            数位 DP / 概率期望 DP 认得出信号即可(小 n 之外的两块进阶区);
            至此 DP 四章走完 —— <b>DP 就是把「决策与状态的演进」一格格画出来</b>。
          </>,
        ]}
      />

      <ChapterFooter ch="dp-pro" />
    </main>
  );
}
