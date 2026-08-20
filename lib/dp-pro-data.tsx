// 第 10 章 · DP 进阶(dp-pro)—— 题单与测验数据。
// 四大高级 DP 类型:状态机(股票族谱)/ 树形 / 区间 / 状压 + 选做。
// hint 只给方向不剧透;key 用一段话把最优解讲透;测验每个错误选项针对性纠错。
// 双语:所有文案都是 Loc<…>,英文为默认。题名用 LeetCode 官方中英标题。

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

export const PROBLEMS: Problem[] = [
  /* ---------------- 状态机 DP · 股票族谱 ---------------- */
  {
    lc: 122,
    title: {
      en: "Best Time to Buy and Sell Stock II",
      zh: "买卖股票的最佳时机 II",
    },
    d: "medium",
    tags: {
      en: ["State machine DP", "Greedy review"],
      zh: ["状态机 DP", "贪心复盘"],
    },
    hint: {
      en: "You may trade as many times as you want. Whenever today costs more than yesterday, buying yesterday and selling today is a gain. Now write the same solution as a state machine.",
      zh: "可以无限次买卖 —— 只要今天比昨天贵,昨天买今天卖就是净赚。同一件事,换成状态机怎么写?",
    },
    key: {
      en: (
        <>
          Two views of one answer. <b>Greedy:</b> take every rise between two
          neighboring days, ans = Σ max(0, price[i] − price[i−1]). This is
          correct because the profit of any rising run equals the sum of its
          daily differences, so no profit is lost by splitting it up (Chapter 06
          proves it with an exchange argument). <b>State machine DP:</b> two
          states, hold (you own one share) and cash (you own none). hold =
          max(hold, cash − price), cash = max(cash, hold + price). The number of
          trades is unlimited, so the two states can convert into each other any
          number of times. Both give the same number. Time O(n), space O(1).
          Section 02 of this chapter draws the transition diagram.
        </>
      ),
      zh: (
        <>
          同一个答案,两种视角。<b>贪心:</b>把所有「相邻两天的上涨」全吃下,
          ans = Σ max(0, price[i] − price[i−1])。它成立是因为任意一段上涨的总利润
          等于逐日差之和,拆开来算不会少赚(第 6 章用交换论证证过)。
          <b>状态机 DP:</b>两个状态 —— hold(持有一股)、cash(空仓)。
          hold = max(hold, cash − price)、cash = max(cash, hold + price)。
          交易次数不限,所以两个状态可以反复互相转化。两解结果相同,
          时间 O(n)、空间 O(1)。本章 §02 会画出它的状态转移图。
        </>
      ),
    },
  },
  {
    lc: 714,
    title: {
      en: "Best Time to Buy and Sell Stock with Transaction Fee",
      zh: "买卖股票的最佳时机含手续费",
    },
    d: "medium",
    tags: {
      en: ["State machine DP", "Transaction fee"],
      zh: ["状态机 DP", "手续费"],
    },
    hint: {
      en: "Only one thing changes from LC 122: every sale costs a fee. Which transition does the fee belong to?",
      zh: "和 122 只差一处:每次卖出要扣手续费 fee —— 它该加在哪条转移里?",
    },
    key: {
      en: (
        <>
          Keep the two states from LC 122 and subtract the fee in the{" "}
          <b>selling</b> step only: cash = max(cash, hold + price − fee), hold =
          max(hold, cash − price). Charging the fee once per completed trade is
          enough, so putting it on the sale (or equally on the buy, but not
          both) is correct. The daily-difference greedy from LC 122 stops working
          here, because many small trades each pay the fee and the fee can
          exceed the gain. The DP handles that automatically: it only sells when
          hold + price − fee beats staying in cash. Time O(n), space O(1). The
          lesson is that once the rules get more conditions, a state machine
          keeps working while a greedy rule has to be re-proved.
        </>
      ),
      zh: (
        <>
          沿用 122 的两个状态,只在<b>卖出</b>那一步扣费:
          cash = max(cash, hold + price − fee)、hold = max(hold, cash − price)。
          一笔完整交易只需收一次费,所以把 fee 记在卖出(或全部记在买入,但不能两边都记)
          都是对的。122 的「逐日差贪心」在这里失效了:频繁的小额交易每笔都要付 fee,
          手续费可能超过差价。DP 会自动处理 —— 只有 hold + price − fee 优于继续空仓时才卖。
          时间 O(n)、空间 O(1)。这题的意义在于:约束一多,状态机照旧能用,
          而贪心规则必须重新证明。
        </>
      ),
    },
  },
  {
    lc: 309,
    title: {
      en: "Best Time to Buy and Sell Stock with Cooldown",
      zh: "最佳买卖股票时机含冷冻期",
    },
    d: "medium",
    tags: {
      en: ["State machine DP", "Cooldown", "Worked example"],
      zh: ["状态机 DP", "冷冻期", "精讲"],
    },
    hint: {
      en: "You cannot buy on the day right after a sale. That one blocked day forces you to add a state.",
      zh: "卖出后第二天不能买 —— 这个「一天空窗」逼你多加一个状态。",
    },
    key: {
      en: (
        <>
          Three states, each meaning &quot;the largest profit you can hold at
          the close of today, given that today ends in this situation&quot;: hold
          (you own a share), sold (you sold today, so tomorrow is blocked), rest
          (you own nothing and are not blocked, so you may buy). Transitions:
          hold = max(hold, rest − price), because a buy can only come from rest;
          sold = hold + price; rest = max(rest, sold), which is either staying
          in cash or the cooldown ending. The answer is max(sold, rest), since
          you should not still own a share at the end. The cooldown pushes one
          blocked day between &quot;sell&quot; and &quot;may buy again&quot;, so
          &quot;sold today&quot; has to be its own state. Time O(n), space O(1).
          Section 02 animates the three states day by day.
        </>
      ),
      zh: (
        <>
          三个状态,每个的含义都是「今天收盘时处于这种局面,能拿到的最大利润」:
          hold(持有一股)、sold(今天卖出,所以明天被封)、
          rest(空仓且不在冷冻,可以买)。转移:hold = max(hold, rest − price),
          因为买入只能从 rest 来;sold = hold + price;rest = max(rest, sold),
          即继续空仓或冷冻期结束。答案 max(sold, rest) —— 结束时不该还持有。
          冷冻期在「卖出」和「可再买」之间强行插了一天,所以「今天刚卖」必须单列成一个状态。
          时间 O(n)、空间 O(1)。本章 §02 逐日演示这三个状态的流动。
        </>
      ),
    },
  },
  {
    lc: 123,
    title: {
      en: "Best Time to Buy and Sell Stock III",
      zh: "买卖股票的最佳时机 III",
    },
    d: "hard",
    tags: {
      en: ["State machine DP", "Limited trades"],
      zh: ["状态机 DP", "限次数"],
    },
    hint: {
      en: "At most two trades are allowed. Add how many trades you have already used to the state as well.",
      zh: "最多只能交易两次 —— 把「已经用掉几次交易」也塞进状态里。",
    },
    key: {
      en: (
        <>
          Five situations a day can end in: not started, holding after the first
          buy, done with the first sale, holding after the second buy, done with
          the second sale. &quot;Not started&quot; is always 0, so four variables
          are enough. Update them in this order every day: buy1 = max(buy1, −p),
          sell1 = max(sell1, buy1 + p), buy2 = max(buy2, sell1 − p), sell2 =
          max(sell2, buy2 + p). The answer is sell2, which already covers using
          fewer than two trades because sell2 never decreases. The real move is
          promoting <b>the number of trades used, k</b>, to a state dimension.
          Generalised to &quot;at most k trades&quot; this becomes LC 188 with
          dp[k][hold], costing O(nk) time. Time O(n), space O(1) here.
        </>
      ),
      zh: (
        <>
          一天可以处于五种局面:没开始、第一次买入后持有、第一次卖出完成、
          第二次买入后持有、第二次卖出完成。「没开始」恒为 0,所以四个变量就够了。
          每天按这个顺序更新:buy1 = max(buy1, −p)、sell1 = max(sell1, buy1 + p)、
          buy2 = max(buy2, sell1 − p)、sell2 = max(sell2, buy2 + p)。答案是 sell2 ——
          它单调不减,所以「只交易一次」的情况已经被包含在内。
          真正的关键是把<b>已用交易次数 k</b> 升成一个状态维度;
          推广到「最多 k 次」就是 LC 188 的 dp[k][hold],时间 O(nk)。
          本题时间 O(n)、空间 O(1)。
        </>
      ),
    },
  },
  /* ---------------- 树形 DP ---------------- */
  {
    lc: 337,
    title: { en: "House Robber III", zh: "打家劫舍 III" },
    d: "medium",
    tags: {
      en: ["Tree DP", "Take or skip", "Worked example"],
      zh: ["树形 DP", "选或不选", "精讲"],
    },
    hint: {
      en: "House Robber on a tree: if you take a node you cannot take its children. What exactly should each node report to its parent?",
      zh: "树上的打家劫舍:偷了父节点就不能偷子节点 —— 每个节点该向上「汇报」什么?",
    },
    key: {
      en: (
        <>
          Post-order traversal, bottom-up. dfs(node) promises to return a pair
          [rob, skip] for the subtree at node: rob is the best total{" "}
          <b>when node is taken</b>, skip is the best total{" "}
          <b>when node is not taken</b>. rob = node.val + left.skip + right.skip,
          because taking node forbids taking either child. skip = max(left.rob,
          left.skip) + max(right.rob, right.skip), because each child is then
          free to choose. An empty child returns [0, 0], which is the base case,
          so leaves need no special handling. The answer is max(root.rob,
          root.skip). This is LC 198 &quot;take it or skip it&quot; from Chapter
          07 moved onto a tree: &quot;the previous cell&quot; of a 1-D array
          becomes &quot;the reports of the two children&quot;. Time O(n), space
          O(h) for the call stack. Section 03 animates it with TreePlayer.
        </>
      ),
      zh: (
        <>
          后序遍历,自底向上。dfs(node) 承诺返回该子树的一对值 [rob, skip]:
          rob 是<b>偷 node</b> 时的最大金额,skip 是<b>不偷 node</b> 时的最大金额。
          rob = node.val + 左.skip + 右.skip,因为偷了当前节点,两个孩子都不能偷;
          skip = max(左.rob, 左.skip) + max(右.rob, 右.skip),因为此时孩子各自随意。
          空孩子返回 [0, 0],这就是基例,叶子不用特判。答案 = max(根.rob, 根.skip)。
          这正是第 7 章 198「选/不选」搬到树上 —— 一维数组的「前一格」
          变成了「两个孩子的汇报」。时间 O(n),递归栈 O(h)。本章 §03 用 TreePlayer 逐帧演示。
        </>
      ),
    },
  },
  {
    lc: 543,
    title: { en: "Diameter of Binary Tree", zh: "二叉树的直径" },
    d: "easy",
    tags: {
      en: ["Tree DP", "Return value ≠ answer", "Review"],
      zh: ["树形 DP", "返回值≠答案", "复盘"],
    },
    hint: {
      en: "The diameter is the largest value of (deepest on the left + deepest on the right) over all nodes. But that is not what the recursive function returns.",
      zh: "直径 = 某个节点「左最深 + 右最深」的最大值 —— 但递归函数返回的并不是直径本身。",
    },
    key: {
      en: (
        <>
          The classic tree DP where the return value is not the answer. dfs(node)
          promises to return <b>the number of nodes on the longest downward path
          starting at node</b>, which is 1 + max(leftDepth, rightDepth). At every
          node you also update a <b>separate variable holding the best answer so
          far</b>, using leftDepth + rightDepth. That sum counts edges, and the
          problem asks for the diameter in edges, so the two quantities match.
          Returning one quantity while updating another is the standard shape of
          tree DP, and LC 124 (maximum path sum) uses exactly the same shape.
          Time O(n).
        </>
      ),
      zh: (
        <>
          经典的「返回值 ≠ 答案」树形 DP。dfs(node) 承诺返回
          <b>从 node 向下出发的最长路径上的节点数</b>,即 1 + max(左深, 右深)。
          同时在每个节点用「左深 + 右深」去更新<b>另一个变量:目前的最优答案</b>。
          这个和数的是<b>边</b>的条数,而题目问的直径也是按边计的,两者正好对上。
          「返回一个量、更新另一个量」是树形 DP 的通用写法,
          LC 124(二叉树中最大路径和)结构完全相同。时间 O(n)。
        </>
      ),
    },
  },
  {
    lc: 968,
    title: { en: "Binary Tree Cameras", zh: "监控二叉树" },
    d: "hard",
    tags: {
      en: ["Tree DP", "Greedy", "Review"],
      zh: ["树形 DP", "贪心", "复盘"],
    },
    hint: {
      en: "Each node is in one of three situations: it has a camera, it is watched by a neighbor, or it is not watched. Putting cameras on the parents of leaves uses the fewest.",
      zh: "每个节点三种身份:装了摄像头 / 被邻居覆盖 / 没被覆盖 —— 让叶子的父亲去装最省。",
    },
    key: {
      en: (
        <>
          Tree DP with a greedy choice. dfs(node) returns one of three codes: 0 =
          not watched, 1 = watched but has no camera, 2 = has a camera. An empty
          child returns 1, so a leaf sees 1 and 1 and returns 0. Check the two
          children in this order, because the order is what makes the greedy
          correct: if either child returned 0, this node <b>must</b> install a
          camera, so return 2; otherwise, if either child returned 2, this node is
          already watched, so return 1; otherwise return 0 and let the parent
          install one. If the root ends up returning 0, add one more camera.
          Delaying every camera to the parent of an uncovered node is the greedy
          part, since one camera there covers the node, its siblings, and its own
          parent. Time O(n). This one is advanced; come back to it after the main
          line.
        </>
      ),
      zh: (
        <>
          树形 DP 加一个贪心选择。dfs(node) 返回三种编码之一:0 = 未被覆盖、
          1 = 已覆盖但自己没摄像头、2 = 装了摄像头。空孩子返回 1,
          所以叶子看到 1 和 1,返回 0。<b>判断顺序不能换</b>,贪心的正确性正来自这个顺序:
          任一孩子返回 0 → 当前节点<b>必须</b>装摄像头,返 2;
          否则任一孩子返回 2 → 当前已被覆盖,返 1;否则返 0,等父亲来装。
          若根最终返回 0,再补一台。「把摄像头一路推迟到未覆盖节点的父亲」就是贪心 ——
          装在那里,一台能同时覆盖该节点、它的兄弟和它自己的父亲。时间 O(n)。
          本题偏难,主线过后再碰。
        </>
      ),
    },
  },
  /* ---------------- 区间 DP ---------------- */
  {
    lc: 516,
    title: {
      en: "Longest Palindromic Subsequence",
      zh: "最长回文子序列",
    },
    d: "medium",
    tags: {
      en: ["Interval DP", "Palindrome", "Review"],
      zh: ["区间 DP", "回文", "复盘"],
    },
    hint: {
      en: "Find the longest palindromic subsequence in one string. When the two ends of the interval hold the same character, you can take both at once.",
      zh: "在一个字符串里找最长回文「子序列」—— 当区间两端字符相等,能一次吃掉两个。",
    },
    key: {
      en: (
        <>
          Interval DP. dp[i][j] = the length of the longest palindromic
          subsequence inside s[i..j]. If s[i] == s[j] then dp[i][j] = dp[i+1][j−1]
          + 2. Otherwise dp[i][j] = max(dp[i+1][j], dp[i][j−1]). Base case:
          dp[i][i] = 1. Every source cell is a <b>strictly shorter</b> interval,
          so the loop order is forced: either go by increasing interval length, or
          let i run downwards and j run upwards. Chapter 09 solved this as the
          LCS of s and reverse(s); here you see the interval view of the same
          problem. Time O(n²), space O(n²) for the table. Two views of one
          problem is a good way to feel how the state definition decides the fill
          order.
        </>
      ),
      zh: (
        <>
          区间 DP。dp[i][j] = s[i..j] 内最长回文子序列的长度。s[i] == s[j] →
          dp[i][j] = dp[i+1][j−1] + 2;否则 dp[i][j] = max(dp[i+1][j], dp[i][j−1])。
          基例 dp[i][i] = 1。所有来源格都是<b>严格更短</b>的区间,
          所以遍历顺序是被逼出来的:要么按区间长度从小到大,要么 i 从大到小、j 从小到大。
          第 9 章从「s 与 reverse(s) 的 LCS」角度解过它,这里换成区间视角。
          时间 O(n²),表本身占空间 O(n²)。同题两解,最能体会
          「状态定义决定填表顺序」这件事。
        </>
      ),
    },
  },
  {
    lc: 312,
    title: { en: "Burst Balloons", zh: "戳气球" },
    d: "hard",
    tags: {
      en: ["Interval DP", "Work backwards", "Worked example"],
      zh: ["区间 DP", "逆向思维", "精讲"],
    },
    hint: {
      en: "Asking which balloon to burst first makes the two sides merge, so the subproblems depend on each other. Asking which balloon is burst last keeps them independent.",
      zh: "正着问「先戳谁」会让两边合并、子问题互相纠缠;倒过来问「最后戳谁」,左右两段就独立了。",
    },
    key: {
      en: (
        <>
          Interval DP, reasoned backwards. Pad both ends with a value of 1: arr =
          [1, nums…, 1]. dp[i][j] = the largest number of coins from bursting
          every balloon strictly between i and j (an open interval). Enumerate
          the balloon k that is burst <b>last</b>, with i &lt; k &lt; j. At that
          moment both sides are already empty, so k&apos;s neighbors are exactly
          i and j, giving arr[i]×arr[k]×arr[j], plus the two independent
          subproblems dp[i][k] and dp[k][j]. dp[i][j] = max over k of the sum.
          Each source interval is strictly shorter than (i, j), so you must fill
          by increasing interval length. The answer is dp[0][n+1]. Time O(n³),
          space O(n²). Section 04 fills the table diagonal by diagonal.
        </>
      ),
      zh: (
        <>
          逆向的区间 DP。两端补上值为 1 的虚拟气球:arr = [1, nums…, 1]。
          dp[i][j] = 把下标严格位于 i 与 j 之间的气球全戳完能拿到的最大硬币(开区间)。
          枚举<b>最后</b>一个被戳破的气球 k(i &lt; k &lt; j):此刻左右两段都已戳空,
          所以 k 的邻居恰好是 i 和 j,得 arr[i]×arr[k]×arr[j],
          再加上两个互不影响的子问题 dp[i][k] 和 dp[k][j]。dp[i][j] = 对所有 k 取这个和的最大值。
          每个来源区间都严格短于 (i, j),所以必须按区间长度从小到大填。答案 dp[0][n+1]。
          时间 O(n³)、空间 O(n²)。本章 §04 沿对角线一条条填出这张表。
        </>
      ),
    },
  },
  /* ---------------- 状压 DP ---------------- */
  {
    lc: 526,
    title: { en: "Beautiful Arrangement", zh: "优美的排列" },
    d: "medium",
    tags: {
      en: ["Bitmask DP", "A set as an integer"],
      zh: ["状压 DP", "位表示集合"],
    },
    hint: {
      en: "n ≤ 15. A limit that small is a signal: record which numbers are already used in the binary digits of one integer.",
      zh: "n ≤ 15 —— 这个小得反常的数据范围就是信号:用一个整数的二进制位记下哪些数字已经用过。",
    },
    key: {
      en: (
        <>
          Bitmask DP. Bit b of mask is 1 when the number b+1 has been used.
          popcount(mask) is how many positions are already filled, call it pos.
          dp[mask] = the number of beautiful arrangements that use exactly the
          numbers in mask to fill positions 1..pos. Try each unused number num in
          position pos+1; it is allowed when num % (pos+1) == 0 or (pos+1) % num
          == 0, and then dp[mask | bit] += dp[mask]. Start from dp[0] = 1 and read
          the answer at dp[(1&lt;&lt;n)−1]. Complexity is (number of subsets) ×
          (work per subset) = O(2ⁿ × n) time and O(2ⁿ) space, which is fine for n
          ≤ 15. This is the entry template for bitmask DP: a set becomes one
          integer. The groundwork is &quot;an int is a row of switches&quot; from
          Chapter 04.
        </>
      ),
      zh: (
        <>
          状压 DP。mask 的第 b 位为 1 表示数字 b+1 已经用过。
          popcount(mask) 就是已填好的位置数,记作 pos。
          dp[mask] = 恰好用 mask 里这批数字填满位置 1..pos 的优美排列个数。
          枚举一个没用过的数字 num 放到位置 pos+1,只要 num % (pos+1) == 0
          或 (pos+1) % num == 0 就合法,于是 dp[mask | bit] += dp[mask]。
          从 dp[0] = 1 出发,答案在 dp[(1&lt;&lt;n)−1]。
          复杂度 =(子集个数)×(每个子集的工作量)= 时间 O(2ⁿ × n)、空间 O(2ⁿ),
          n ≤ 15 完全跑得动。这是状压 DP 的入门模板:一个集合变成一个整数。
          地基是第 4 章的「一个 int 就是一排开关」。
        </>
      ),
    },
  },
  /* ---------------- 选做 ---------------- */
  {
    lc: 264,
    title: { en: "Ugly Number II", zh: "丑数 II" },
    d: "medium",
    tags: {
      en: ["Multi-pointer DP", "Optional"],
      zh: ["多指针 DP", "选做"],
    },
    hint: {
      en: "Every ugly number is a smaller ugly number multiplied by 2, 3, or 5. Follow those three production lines with three pointers.",
      zh: "每个丑数都是某个更小的丑数 ×2、×3 或 ×5 得来的 —— 用三个指针追这三条「产线」。",
    },
    key: {
      en: (
        <>
          DP with three pointers. dp[1..n] holds the ugly numbers in increasing
          order, dp[1] = 1. The pointers p2, p3, p5 each point at{" "}
          <b>the next ugly number waiting to be multiplied by 2, 3, or 5</b>. Each
          step, dp[i] = min(dp[p2]×2, dp[p3]×3, dp[p5]×5), and every pointer whose
          candidate equals that minimum moves forward. Advancing all of the tied
          pointers is what removes duplicates: 6 is reachable as 2×3 and as 3×2.
          Time O(n), space O(n). A min-heap with a visited set also works and is
          easier to see first; the pointer version is faster because it never
          stores a duplicate.
        </>
      ),
      zh: (
        <>
          DP 加三个指针。dp[1..n] 按从小到大存丑数,dp[1] = 1。
          三个指针 p2、p3、p5 分别指向<b>下一个要 ×2 / ×3 / ×5 的丑数</b>。
          每一步 dp[i] = min(dp[p2]×2, dp[p3]×3, dp[p5]×5),
          凡是候选值等于这个最小值的指针都要前移。同时移动所有并列的指针正是去重的关键 ——
          6 既能由 2×3 得到,也能由 3×2 得到。时间 O(n)、空间 O(n)。
          用最小堆加一个已访问集合同样可行,也更直观;多指针版更快,因为它从不存重复值。
        </>
      ),
    },
  },
  {
    lc: 174,
    title: { en: "Dungeon Game", zh: "地下城游戏" },
    d: "hard",
    tags: {
      en: ["Backwards DP", "Optional"],
      zh: ["逆向 DP", "选做"],
    },
    hint: {
      en: "Computing the health you have right now, forwards from the start, gets stuck: you do not yet know the damage ahead. Compute the health needed to enter each cell, backwards from the end.",
      zh: "从起点正着算「当前血量」会卡住 —— 你还不知道前方的伤害。换个方向,从终点倒着算「进这格至少要多少血」。",
    },
    key: {
      en: (
        <>
          Backwards DP. dp[i][j] = <b>the smallest health you need when entering
          cell (i, j)</b> so that health stays at least 1 all the way to the
          bottom-right cell. Work back from the end: need = min(dp[i+1][j],
          dp[i][j+1]) − dungeon[i][j], and dp[i][j] = max(1, need), because health
          may never drop to 0. Why must this run backwards? The minimum health
          requirement depends only on the path still ahead, while &quot;health
          right now&quot; depends on choices already made, and maximising current
          health does not always minimise the starting health. So the forward
          state has no optimal substructure. Time O(mn), space O(mn) or O(n) with
          one row. It is the standard example of &quot;forward fails, so define
          the state backwards&quot;. Harder than the main line; try it later.
        </>
      ),
      zh: (
        <>
          逆向 DP。dp[i][j] = <b>进入格子 (i, j) 时至少需要的血量</b>,
          要保证一路走到右下角血量始终 ≥ 1。从终点倒推:
          need = min(dp[i+1][j], dp[i][j+1]) − dungeon[i][j],dp[i][j] = max(1, need),
          因为血量任何时候都不能降到 0。为什么必须逆向?
          因为「最低血量需求」只由前方剩下的路决定;而「当前血量」由已经走过的选择决定,
          且当前血量最大并不总意味着起始血量最小 —— 正向的状态没有最优子结构。
          时间 O(mn),空间 O(mn),用一行滚动可降到 O(n)。
          它是「正向失效 ⇒ 换个方向定义状态」的标准例子,难度偏高,主线之外再挑战。
        </>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "LC 309 (with cooldown) needs one more state than LC 122. What does that extra state represent?",
      zh: "LC 309(含冷冻期)比 LC 122 多出一个状态。这个多出来的状态代表什么?",
    },
    opts: {
      en: [
        "\"Sold today, so the cooldown is in effect\" — it forces one blocked day between a sale and the next allowed buy",
        "\"Holding two shares at the same time\"",
        "\"How many trades have already been used\"",
        "\"The running profit is negative\"",
      ],
      zh: [
        "「今天刚卖出,正处于冷冻期」—— 它在卖出和下一次可买之间强行隔开一天",
        "「同时持有两支股票」的状态",
        "「已经用掉几次交易」的计数状态",
        "「当前利润为负」的状态",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "In a single-stock problem you hold at most one share at any time, so \"two shares\" never occurs. The cooldown rule has nothing to do with how many shares you hold.",
        "The number of trades is the extra dimension in LC 123 and LC 188 (at most k trades). LC 309 has no limit on the number of trades; the extra state is the cooldown, not a counter.",
        "A DP state records the situation you are in (holding? in cash? in cooldown?), not the sign of the profit. The profit is the value stored inside each state.",
      ],
      zh: [
        undefined,
        "单支股票的问题里任何时刻最多持有 1 股,不存在「持有两支」;冷冻期规则和持股数量无关。",
        "「交易次数」是 LC 123 / 188 的额外维度(最多 k 次)。LC 309 不限交易次数,多出来的是冷冻状态,不是计数器。",
        "DP 状态记的是「你处在什么局面」(持有?空仓?冷冻?),不是利润的正负 —— 利润是每个状态里存的那个值。",
      ],
    },
    why: {
      en: "The cooldown means you may only buy from the second day after a sale. Two states cannot express \"I sold yesterday, so today I still may not buy\", so the empty-handed case splits into sold (just sold) and rest (free to buy): hold = max(hold, rest − p), sold = hold + p, rest = max(rest, sold). More conditions in the problem means more states. That is the usual pattern in state machine DP.",
      zh: "冷冻期的意思是卖出后要隔一天才能买。两个状态无法表达「昨天刚卖,今天还不能买」,所以把空仓拆成 sold(刚卖)和 rest(可买):hold = max(hold, rest − p)、sold = hold + p、rest = max(rest, sold)。题目的约束一多,状态就多 —— 这是状态机 DP 的常见套路。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In LC 337 (House Robber III), why does each node return the pair [rob, skip] instead of just \"the largest amount obtainable in this subtree\"?",
      zh: "LC 337 打家劫舍 III,每个节点为什么要返回 [rob, skip] 一对值,而不是直接返回「这棵子树能偷到的最大金额」?",
    },
    opts: {
      en: [
        "Whether the parent may take itself depends on whether the child was taken — a single max throws away \"the best total when the child is skipped\"",
        "Because a binary tree has two children, so two values are returned",
        "To use less stack space during the recursion",
        "Because a single value would overflow",
      ],
      zh: [
        "父节点能不能偷自己,取决于孩子偷没偷 —— 只返回一个 max 会丢掉「孩子不偷时的最优值」",
        "因为二叉树有两个孩子,所以要返回两个值",
        "为了让递归少用一些栈空间",
        "因为一个值会整数溢出",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The two values correspond to the two decisions \"take this node\" and \"skip this node\". Having two children is a coincidence: on a tree with any number of children you still return exactly these two values.",
        "Returning two values uses slightly more space, not less. The stack depth of a tree DP is set by the height of the tree, not by how many values you return.",
        "Overflow is not the issue. The issue is completeness: when the parent takes itself it needs the child's skip value, and a single max does not contain it.",
      ],
      zh: [
        undefined,
        "两个返回值对应的是「偷当前节点」和「不偷当前节点」两个决策。有两个孩子只是巧合 —— 换成多叉树,返回的仍然是这两个值。",
        "返回两个值反而多用一点空间。树形 DP 的栈深由树高决定,和返回几个值无关。",
        "和溢出无关。问题在于信息是否完整:父节点偷自己时需要孩子的 skip 值,而一个 max 里没有它。",
      ],
    },
    why: {
      en: "If the parent takes itself, both children must be skipped, so it needs each child's skip value. If the parent skips itself, each child may choose freely, so it needs max(rob, skip). Both numbers are needed, so every node reports both. This is LC 198 \"take it or skip it\" from Chapter 07, moved onto a tree.",
      zh: "父节点若偷自己,两个孩子都不能偷,所以需要孩子的 skip 值;父节点若不偷自己,孩子各自随意,所以需要 max(rob, skip)。两个数都要用到,所以每个节点都得把两个都汇报上来。这就是第 7 章 198「选/不选」搬上了树。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Why does interval DP (LC 312, LC 516) fill the table in order of increasing interval length?",
      zh: "区间 DP(如 LC 312 / 516)为什么要按区间长度从小到大填表?",
    },
    opts: {
      en: [
        "The transition for a long interval reads the answers of strictly shorter intervals, so those must already be computed",
        "Because filling in that order uses less memory",
        "Because interval DP can only be written recursively",
        "Because a longer interval always has a larger answer, so the order sorts them",
      ],
      zh: [
        "长区间的转移要读严格更短区间的答案,所以那些必须先算好",
        "因为按这个顺序填更省内存",
        "因为区间 DP 只能用递归实现",
        "因为区间越长答案一定越大,从小到大填正好排好序",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The fill order does not change how much memory the table uses. The only constraint on the order is that every cell a transition reads is already computed.",
        "Interval DP can be written as a bottom-up loop or as memoised recursion. Filling by increasing length is exactly the bottom-up order, so recursion is not required.",
        "A longer interval does not always have a larger answer, since interval DP often takes a max or a min with no monotonic guarantee. The order is about dependencies, not about sorting.",
      ],
      zh: [
        undefined,
        "填表顺序不改变表占用的内存。顺序的唯一约束是:转移读到的每一格都必须已经算好。",
        "区间 DP 递推和记忆化搜索都能写。按长度从小到大填正是递推(自底向上)的顺序,并不是只能递归。",
        "长区间的答案不一定更大 —— 区间 DP 常取 max 或 min,数值没有单调保证。顺序的关键是依赖关系,不是排序。",
      ],
    },
    why: {
      en: "dp[i][j] is defined in terms of strictly shorter intervals, such as dp[i][k], dp[k][j], or dp[i+1][j−1]. Until every shorter interval is filled, the transition has nothing to read. The dependency is what forces the order; \"fill along the diagonals\" is just what that order looks like in the table.",
      zh: "dp[i][j] 的定义里用到的都是严格更短的区间,比如 dp[i][k]、dp[k][j] 或 dp[i+1][j−1]。更短的区间没填完,转移就无处可读。是依赖关系逼出了这个顺序;「沿对角线填」只是这个顺序在表格里的样子。",
    },
  },
  {
    type: "choice",
    q: {
      en: "LC 312 is modelled by enumerating the balloon k that is burst last. Why last and not first?",
      zh: "LC 312 戳气球的建模是「枚举最后一个被戳破的气球 k」。为什么是「最后」而不是「第一个」?",
    },
    opts: {
      en: [
        "Once k is fixed as the last one, the two sides never affect each other and each becomes its own subproblem. Fixing the first one makes the two sides merge, so the subproblems depend on each other",
        "Because the last balloon always has the highest value",
        "Because scanning the array from the end is faster",
        "Because the first balloon is always one of the padded virtual balloons",
      ],
      zh: [
        "一旦固定「k 最后戳」,左右两段互不影响,各自成为独立子问题;若固定「第一个戳」,两边会合并,子问题互相纠缠",
        "因为最后一个气球的分数一定最高",
        "因为从后往前遍历数组更快",
        "因为第一个气球一定是补上的虚拟气球",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Value has nothing to do with it. Which balloon is burst last is decided by the DP, not by picking the largest value.",
        "This is not about scan direction. It is about how the problem is cut into subproblems. Enumerating the first burst is exactly what destroys the independence of the subproblems.",
        "The padded balloons are the two 1s at the ends and are never burst. The k in \"k is burst last\" is always a real balloon.",
      ],
      zh: [
        undefined,
        "和分数高低无关。哪个气球最后戳是 DP 求出来的,不是挑分数最高的那个。",
        "这不是遍历方向的问题,而是「怎么把问题切成子问题」的问题。枚举「第一个戳」恰恰会破坏子问题的独立性。",
        "补上的虚拟气球是两端的两个 1,永远不会被戳。「k 最后戳」里的 k 一定是真实气球。",
      ],
    },
    why: {
      en: "Bursting a balloon makes its two neighbors become adjacent, so enumerating \"which one first\" keeps merging the remaining sequence and no independent subproblem is left. Fix k as the last one instead: when k is burst both sides are already empty, so its neighbors are exactly the endpoints i and j, and the two ranges (i, k) and (k, j) are solved separately. That is why the recurrence is dp[i][j] = max over k of dp[i][k] + arr[i]×arr[k]×arr[j] + dp[k][j].",
      zh: "戳破一个气球会让它左右的邻居贴到一起,所以枚举「先戳谁」会让剩下的序列不断合并,拆不出独立的子问题。反过来固定「k 最后戳」:戳 k 时左右已经空了,它的邻居恰好是端点 i 和 j,于是 (i, k) 与 (k, j) 两段各自独立求解。这就是转移写成 dp[i][j] = 对 k 取 max ( dp[i][k] + arr[i]×arr[k]×arr[j] + dp[k][j] ) 的原因。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which features of a problem suggest bitmask DP (state compression)? (Select all that apply)",
      zh: "题目具备哪些特征时,应该想到状压(状态压缩)DP?(多选)",
    },
    opts: {
      en: [
        "The constraints contain a surprisingly small n, roughly n ≤ 20",
        "The state has to record a set: which elements are already used or visited",
        "The natural state is a subset, and there are 2ⁿ subsets in total",
        "The array is already sorted",
      ],
      zh: [
        "数据范围里有个小得反常的 n(大约 n ≤ 20)",
        "状态必须记录一个集合:哪些元素已用 / 已访问",
        "自然的状态就是「某个子集」,子集总共有 2ⁿ 个",
        "数组已经排好了序",
      ],
    },
    correct: [0, 1, 2],
    missHint: {
      en: "There are three signals: a very small n, a state that is a set, and 2ⁿ subsets in total. You missed one of them.",
      zh: "三个信号:n 极小、状态是一个集合、子集共 2ⁿ 个 —— 你漏了其中之一。",
    },
    extraHint: {
      en: "A sorted array is a signal for binary search, two pointers, or a greedy rule. It says nothing about bitmask DP, which is triggered by the state itself being a set.",
      zh: "「数组有序」是二分、双指针或贪心的信号,和状压无关。状压的触发点是状态本身就是一个集合。",
    },
    why: {
      en: "Bitmask DP stores a set in the binary digits of one integer. It works only when the set is small, because the table has 2ⁿ entries, so n ≤ 20 is the practical limit. The cost is (number of subsets) × (work per transition). When a very small n and a set-shaped state appear together (LC 526, the traveling salesman problem), think bitmask. The groundwork is \"bits as a set\" from Chapter 04.",
      zh: "状压 DP 把一个集合存进一个整数的二进制位。它成立的前提是集合小 —— 表有 2ⁿ 项,所以 n ≤ 20 是实际上限。代价 =(子集个数)×(每个转移的工作量)。当「极小的 n」和「状态是集合」同时出现(LC 526、旅行商问题)就该想状压。地基是第 4 章的「用 bit 表示集合」。",
    },
  },
  {
    type: "choice",
    q: {
      en: "For LC 122 (unlimited trades), which statement about the greedy solution and the state machine DP is correct?",
      zh: "关于 LC 122(可无限次买卖)的贪心解与状态机 DP 解,哪个说法正确?",
    },
    opts: {
      en: [
        "Both are correct and give the same result: the greedy takes every rise between neighboring days, Σ max(0, p[i] − p[i−1]), and the DP moves between the hold and cash states",
        "The greedy is wrong; only the DP gives the correct answer",
        "The DP is wrong; only the greedy is correct",
        "They give different answers, so you pick one based on the input size",
      ],
      zh: [
        "两者都对且结果相同:贪心吃下每一段相邻上涨(Σ max(0, p[i]−p[i−1])),DP 在 hold 和 cash 两个状态间转移",
        "贪心是错的,只有 DP 能得到正确答案",
        "DP 是错的,只有贪心对",
        "两者答案不同,要看数据规模选哪一个",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The greedy for LC 122 can be proved correct: the profit of any rising run equals the sum of its daily differences. This is the line that separates it from LC 322 (coin change), where a greedy rule really does fail.",
        "The DP with two states is equally correct, and it extends naturally to a transaction fee (LC 714) and to a cooldown (LC 309).",
        "The two solutions agree on every input. They are two views of the same optimum, so there is nothing to choose between them by input size.",
      ],
      zh: [
        undefined,
        "LC 122 的贪心是可以证明的:任意一段上涨的总利润等于逐日差之和。这正是它和 LC 322(零钱兑换,贪心确实会失效)的分界线。",
        "两状态的 DP 同样正确,而且能自然推广到含手续费(LC 714)和含冷冻期(LC 309)。",
        "两解在任何输入上答案都相同 —— 它们是同一个最优解的两种视角,不存在「按规模二选一」。",
      ],
    },
    why: {
      en: "With unlimited trades, \"take every rise\" is provably safe and equals the hold/cash DP. Add a condition, though, and the greedy has to be re-proved: with a fee (LC 714) or a cooldown (LC 309) the simple rule breaks, while the state machine keeps working. That is why the stock problems are taught as one family.",
      zh: "交易次数不限时,「吃下每段上涨」可以证明是安全的,和 hold/cash 两状态 DP 等价。但只要加一个约束,贪心就必须重新证明:加手续费(LC 714)或加冷冻期(LC 309)后,这条简单规则就不成立了,而状态机照旧能用。这就是把这些股票题当成一个家族来讲的原因。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          Tree DP exercise. The binary tree is [3, 4, 5, 1, 3, null, 1]: the root
          is 3, its children are 4 and 5, the children of 4 are 1 and 3, and 5 has
          a right child 1. Following the rules of House Robber III, what is the
          largest amount you can take?
        </>
      ),
      zh: (
        <>
          树形 DP 练习。二叉树 [3, 4, 5, 1, 3, null, 1]:根是 3,它的孩子是 4 和 5,
          4 的孩子是 1 和 3,5 有一个右孩子 1。按打家劫舍 III 的规则,
          能偷到的最大金额是多少?
        </>
      ),
    },
    placeholder: { en: "Enter an integer…", zh: "输入一个整数…" },
    answers: ["9"],
    hint: {
      en: "A leaf reports [its own value, 0]. Node 4 reports [4, 1+3 = 4] and node 5 reports [5, 1]. Skipping the root gives max(4, 4) + max(5, 1).",
      zh: "叶子汇报 [自己的值, 0];4 号点汇报 [4, 1+3 = 4],5 号点汇报 [5, 1]。不偷根 = max(4, 4) + max(5, 1)。",
    },
    why: {
      en: "Skip the root: max(4, 4) = 4 from node 4, plus max(5, 1) = 5 from node 5, so 9. Take the root: 3 + node 4's skip value (4) + node 5's skip value (1) = 8. max(8, 9) = 9. Here skipping the root is better, which is exactly why each node must report both values. Section 03 steps through this same tree.",
      zh: "不偷根:4 号的 max(4, 4) = 4 加上 5 号的 max(5, 1) = 5,共 9。偷根:3 + 4 号的 skip(4)+ 5 号的 skip(1)= 8。max(8, 9) = 9。这里「不偷根」反而更优 —— 这正是每个节点必须汇报两个值的原因。本章 §03 逐帧走的就是这棵树。",
    },
  },
];
