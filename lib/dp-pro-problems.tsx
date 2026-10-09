// Chapter 10 - Advanced DP (dp-pro): problem set (the quiz is in lib/dp-pro-quiz.tsx).
// The four advanced DP families: state machine (the stock-trading family tree) / tree DP /
// interval DP / bitmask DP, plus optional problems.
// hint only points at a direction without spoiling; key explains the optimal solution in one
// paragraph; every wrong quiz option gets a correction specific to that option.
// Bilingual: all copy is Loc<...> with English as the default. Titles use LeetCode's official
// English and Chinese names.

import type { Problem } from "@/lib/problems";

export const PROBLEMS: Problem[] = [
  /* ---------------- State-machine DP: the stock-trading family tree ---------------- */
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
          daily differences, so no profit is lost by splitting it up (chapter 06
          proves it with an upper-bound argument). <b>State machine DP:</b> two
          states, hold (you own one share) and cash (you own none). hold =
          max(hold, cash − price), cash = max(cash, hold + price). The number of
          trades is unlimited, so the two states can convert into each other any
          number of times. Both give the same number. Time O(n), space O(1).
          Section 02 of this chapter draws the transition diagram.
        </>
      ),
      zh: (
        <>
          同一个答案,两种视角。<b>贪心:</b>把所有「相邻两天的上涨」全部收下,
          ans = Σ max(0, price[i] − price[i−1])。它成立是因为任意一段上涨的总利润等于逐日差之和,拆开来算不会少赚(第 6 章用上界论证证过)。
          <b>状态机 DP:</b>两个状态 —— hold(持有一股)、cash(空仓)。hold = max(hold, cash − price)、cash = max(cash, hold + price)。交易次数不限,所以两个状态可以反复互相转化。两解结果相同,时间 O(n)、空间 O(1)。本章 §02 会画出它的状态转移图。
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
          cash = max(cash, hold + price − fee)、hold = max(hold, cash − price)。一笔完整交易只需收一次费,所以把 fee 记在卖出(或全部记在买入,但不能两边都记)都是对的。122 的「逐日差贪心」在这里失效了:频繁的小额交易每笔都要付 fee,手续费可能超过差价。DP 会自动处理 —— 只有 hold + price − fee 优于继续空仓时才卖。时间 O(n)、空间 O(1)。这题的意义在于:约束一多,状态机照旧能用,而贪心规则必须重新证明。
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
          hold(持有一股)、sold(今天卖出,所以明天被封)、rest(空仓且不在冷冻,可以买)。转移:hold = max(hold, rest − price),因为买入只能从 rest 来;sold = hold + price;rest = max(rest, sold),即继续空仓或冷冻期结束。答案 max(sold, rest) —— 结束时不该还持有。冷冻期在「卖出」和「可再买」之间强行插了一天,所以「今天刚卖」必须单列成一个状态。时间 O(n)、空间 O(1)。本章 §02 逐日演示这三个状态的流动。
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
          max(sell2, buy2 + p). The answer is sell2. It already covers using
          only one trade: the second trade may buy and sell on the same day for
          no gain, so sell2 is never less than sell1. The real move is
          promoting <b>the number of trades used, k</b>, to a state dimension.
          Generalised to &quot;at most k trades&quot; this becomes LC 188 with
          dp[k][hold], costing O(nk) time. Time O(n), space O(1) here.
        </>
      ),
      zh: (
        <>
          一天可以处于五种局面:没开始、第一次买入后持有、第一次卖出完成、第二次买入后持有、第二次卖出完成。「没开始」恒为 0,所以四个变量就够了。每天按这个顺序更新:buy1 = max(buy1, −p)、sell1 = max(sell1, buy1 + p)、buy2 = max(buy2, sell1 − p)、sell2 = max(sell2, buy2 + p)。答案是 sell2 ——
          第二笔交易可以在同一天买入又卖出(收益为 0),所以 sell2 不会小于 sell1,「只交易一次」的情况已经包含在内。真正的关键是把<b>已用交易次数 k</b> 升成一个状态维度;推广到「最多 k 次」就是 LC 188 的 dp[k][hold],时间 O(nk)。本题时间 O(n)、空间 O(1)。
        </>
      ),
    },
  },
  /* ---------------- Tree DP ---------------- */
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
          rob 是<b>偷 node</b> 时的最大金额,skip 是<b>不偷 node</b> 时的最大金额。rob = node.val + 左.skip + 右.skip,因为偷了当前节点,两个孩子都不能偷;
          skip = max(左.rob, 左.skip) + max(右.rob, 右.skip),因为此时孩子各自随意。空孩子返回 [0, 0],这就是基例,叶子不用特判。答案 = max(根.rob, 根.skip)。这正是第 7 章 198「选/不选」搬到树上 —— 一维数组的「前一格」变成了「两个孩子的汇报」。时间 O(n),递归栈 O(h)。本章 §03 用 TreePlayer 逐帧演示。
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
          <b>从 node 向下出发的最长路径上的节点数</b>,即 1 + max(左深, 右深)。同时在每个节点用「左深 + 右深」去更新<b>另一个变量:目前的最优答案</b>。这个和数的是<b>边</b>的条数,而题目问的直径也是按边计的,两者正好对上。「返回一个量、更新另一个量」是树形 DP 的通用写法,
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
          树形 DP 加一个贪心选择。dfs(node) 返回三种编码之一:0 = 未被覆盖、1 = 已覆盖但自己没摄像头、2 = 装了摄像头。空孩子返回 1,所以叶子看到 1 和 1,返回 0。<b>判断顺序不能换</b>,贪心的正确性正来自这个顺序:任一孩子返回 0 → 当前节点<b>必须</b>装摄像头,返 2;否则任一孩子返回 2 → 当前已被覆盖,返 1;否则返 0,等父亲来装。若根最终返回 0,再补一台。「把摄像头一路推迟到未覆盖节点的父亲」就是贪心 ——
          装在那里,一台能同时覆盖该节点、它的兄弟和它自己的父亲。时间 O(n)。本题偏难,学完主线再做。
        </>
      ),
    },
  },
  /* ---------------- Interval DP ---------------- */
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
      zh: "在一个字符串里找最长回文「子序列」—— 当区间两端字符相等,两端可以一起用上。",
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
          dp[i][j] = dp[i+1][j−1] + 2;否则 dp[i][j] = max(dp[i+1][j], dp[i][j−1])。基例 dp[i][i] = 1。所有来源格都是<b>严格更短</b>的区间,所以遍历顺序是被逼出来的:要么按区间长度从小到大,要么 i 从大到小、j 从小到大。第 9 章从「s 与 reverse(s) 的 LCS」角度解过它,这里换成区间视角。时间 O(n²),表本身占空间 O(n²)。同题两解,最能体会「状态定义决定填表顺序」这件事。
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
          逆向的区间 DP。两端补上值为 1 的虚拟气球:arr = [1, nums…, 1]。dp[i][j] = 把下标严格位于 i 与 j 之间的气球全戳完能拿到的最大硬币(开区间)。枚举<b>最后</b>一个被戳破的气球 k(i &lt; k &lt; j):此刻左右两段都已戳空,所以 k 的邻居恰好是 i 和 j,得 arr[i]×arr[k]×arr[j],再加上两个互不影响的子问题 dp[i][k] 和 dp[k][j]。dp[i][j] = 对所有 k 取这个和的最大值。每个来源区间都严格短于 (i, j),所以必须按区间长度从小到大填。答案 dp[0][n+1]。时间 O(n³)、空间 O(n²)。本章 §04 沿对角线一条条填出这张表。
        </>
      ),
    },
  },
  /* ---------------- Bitmask DP ---------------- */
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
          状压 DP。mask 的第 b 位为 1 表示数字 b+1 已经用过。popcount(mask) 就是已填好的位置数,记作 pos。dp[mask] = 恰好用 mask 里这批数字填满位置 1..pos 的优美排列个数。枚举一个没用过的数字 num 放到位置 pos+1,只要 num % (pos+1) == 0
          或 (pos+1) % num == 0 就合法,于是 dp[mask | bit] += dp[mask]。从 dp[0] = 1 出发,答案在 dp[(1&lt;&lt;n)−1]。复杂度 =(子集个数)×(每个子集的工作量)= 时间 O(2ⁿ × n)、空间 O(2ⁿ),
          n ≤ 15 时完全可行。这是状压 DP 的入门模板:一个集合变成一个整数。地基是第 4 章的「一个 int 就是一排开关」。
        </>
      ),
    },
  },
  /* ---------------- Optional ---------------- */
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
          DP 加三个指针。dp[1..n] 按从小到大存丑数,dp[1] = 1。三个指针 p2、p3、p5 分别指向<b>下一个要 ×2 / ×3 / ×5 的丑数</b>。每一步 dp[i] = min(dp[p2]×2, dp[p3]×3, dp[p5]×5),凡是候选值等于这个最小值的指针都要前移。同时移动所有并列的指针正是去重的关键 ——
          6 既能由 2×3 得到,也能由 3×2 得到。时间 O(n)、空间 O(n)。用最小堆加一个已访问集合同样可行,也更直观;多指针版更快,因为它从不存重复值。
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
          逆向 DP。dp[i][j] = <b>进入格子 (i, j) 时至少需要的血量</b>,要保证一路走到右下角血量始终 ≥ 1。从终点倒推:
          need = min(dp[i+1][j], dp[i][j+1]) − dungeon[i][j],dp[i][j] = max(1, need),因为血量任何时候都不能降到 0。为什么必须逆向?因为「最低血量需求」只由前方剩下的路决定;而「当前血量」由已经走过的选择决定,且当前血量最大并不总意味着起始血量最小 —— 正向的状态没有最优子结构。时间 O(mn),空间 O(mn),用一行滚动可降到 O(n)。它是「正向失效 ⇒ 换个方向定义状态」的标准例子,难度偏高,主线之外再挑战。
        </>
      ),
    },
  },
];
