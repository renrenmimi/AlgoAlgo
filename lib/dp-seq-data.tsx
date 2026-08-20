// 第 9 章 · 子序列 DP —— 题单与测验数据。
// 题单按「子序列判定 → LIS → 连续型 → 双序列(LCS/编辑距离/删改) → 回文」由易到难;
// hint 只给方向不剧透,key 用一段话把状态定义、转移、边界与答案位置讲透。
// 双语:所有文案都是 Loc<…>,英文为默认。题名用 LeetCode 官方中英标题。

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

export const PROBLEMS: Problem[] = [
  {
    lc: 392,
    title: { en: "Is Subsequence", zh: "判断子序列" },
    d: "easy",
    tags: {
      en: ["Subsequence", "Two pointers", "DP optional"],
      zh: ["子序列", "双指针", "DP 可选"],
    },
    hint: {
      en: "A subsequence only has to keep the original order. Move one pointer along s and one along t, and advance the s pointer whenever the two characters match.",
      zh: "子序列只要求保持原来的先后顺序。一根指针扫 s、一根扫 t,两个字符相同时 s 的指针前进一格。",
    },
    key: {
      en: (
        <>
          Two pointers, O(n): i walks over s and j walks over t. When s[i] equals
          t[j], advance i. At the end, s is a subsequence of t exactly when i
          reached the end of s. This is the smallest possible exercise on the
          definition of a subsequence. A common follow-up asks what to do when
          many different strings s are tested against the <b>same</b> t. Then
          preprocess t once: nxt[j][c] is the first position at or after j where
          the character c appears. Each query then costs O(length of s) with no
          scanning of t at all. Trading memory for repeated query speed is a
          common engineering decision.
        </>
      ),
      zh: (
        <>
          双指针 O(n):i 扫 s、j 扫 t,s[i] == t[j] 时 i 前进一格;
          最后看 i 是否走完 s。它是「子序列」这个定义最小的练习题。
          常见追问是:有大量不同的 s 反复来问<b>同一个</b> t 怎么办?
          那就把 t 预处理一次:nxt[j][c] = 从位置 j 起字符 c 第一次出现的下标,
          之后每次查询只要 O(len(s)),完全不用再扫 t。
          「多次查询就用空间换时间」是很常见的工程权衡。
        </>
      ),
    },
  },
  {
    lc: 300,
    title: {
      en: "Longest Increasing Subsequence",
      zh: "最长递增子序列",
    },
    d: "medium",
    tags: {
      en: ["Subsequence", "LIS", "Binary search"],
      zh: ["子序列", "LIS", "二分优化"],
    },
    hint: {
      en: "Define dp[i] as the length of the longest increasing subsequence that ends at index i. Fixing the last element is what makes the transition possible.",
      zh: "把 dp[i] 定义成「以下标 i 结尾」的最长上升子序列长度 —— 固定末尾,转移才写得出来。",
    },
    key: {
      en: (
        <>
          O(n²) version. State: dp[i] is the length of the longest increasing
          subsequence <b>ending at index i</b>. Transition: dp[i] = max(dp[j] + 1)
          over every j &lt; i with nums[j] &lt; nums[i]. Base: every dp[i] starts
          at 1, because the element alone is already a subsequence of length 1.
          The answer is the <b>maximum over the whole dp array</b>, not dp[n-1],
          because the longest subsequence does not have to end at the last
          element. O(n log n) version: keep an array tails, where tails[k] is the
          smallest possible last value among all increasing subsequences of length
          k+1. For each new value, binary search for the first entry that is ≥ it
          and replace it; if there is none, append. The answer is the length of
          tails. Worked example A animates both.
        </>
      ),
      zh: (
        <>
          O(n²) 写法。状态:dp[i] = <b>以下标 i 结尾</b>的最长上升子序列长度。
          转移:dp[i] = max(dp[j] + 1),j 取遍所有满足 j &lt; i 且 nums[j] &lt; nums[i] 的下标。
          初始:每个 dp[i] 都从 1 起步 —— 单个元素本身就是长度 1 的子序列。
          答案取<b>整个 dp 数组的最大值</b>,不是 dp[n-1],
          因为最长的那条不一定以最后一个元素结尾。
          O(n log n) 写法:维护数组 tails,tails[k] = 所有长度为 k+1 的上升子序列中
          「最小的那个结尾值」。每来一个新数,二分找到第一个 ≥ 它的位置替换掉;
          找不到就追加。tails 的长度就是答案。本章精讲 A 两种写法都有动画。
        </>
      ),
    },
  },
  {
    lc: 673,
    title: {
      en: "Number of Longest Increasing Subsequence",
      zh: "最长递增子序列的个数",
    },
    d: "medium",
    tags: {
      en: ["LIS", "Counting DP", "Review"],
      zh: ["LIS", "计数 DP", "复盘"],
    },
    hint: {
      en: "Keep a second array next to dp[i] from LC 300: when a longer subsequence is found, reset the count; when the same length is matched, add to it.",
      zh: "在 LC 300 的 dp[i] 旁边再挂一个数组:发现更长就重置计数,长度打平就累加计数。",
    },
    key: {
      en: (
        <>
          Two arrays in parallel. len[i] is the length of the longest increasing
          subsequence ending at i, and cnt[i] is how many such subsequences reach
          that length. While scanning a predecessor j, if len[j] + 1 &gt; len[i],
          then len[i] is updated and cnt[i] = cnt[j], because a longer route was
          just found and all earlier counts are obsolete. If len[j] + 1 == len[i],
          then cnt[i] += cnt[j], because this is another route of the same best
          length. The answer is the sum of cnt[i] over every i whose len[i] equals
          the global maximum. A main array plus a counting array is the standard
          shape of a counting DP.
        </>
      ),
      zh: (
        <>
          两个数组并行:len[i] = 以 i 结尾的最长上升子序列长度,
          cnt[i] = 达到该长度的方案数。扫描前驱 j 时,
          若 len[j] + 1 &gt; len[i],则更新 len[i] 并令 cnt[i] = cnt[j] ——
          发现了更长的路,之前的计数全部作废;
          若 len[j] + 1 == len[i],则 cnt[i] += cnt[j] —— 又多了一条同样长的路。
          答案 = 所有 len[i] 等于全局最大值的 cnt[i] 之和。
          「主数组 + 计数数组」是计数型 DP 的通用形状。
        </>
      ),
    },
  },
  {
    lc: 718,
    title: {
      en: "Maximum Length of Repeated Subarray",
      zh: "最长重复子数组",
    },
    d: "medium",
    tags: {
      en: ["Subarray", "Contiguous", "2D DP"],
      zh: ["子数组", "连续", "二维 DP"],
    },
    hint: {
      en: "A subarray must be contiguous. Define dp[i][j] as the longest common run that ends exactly at a[i-1] and b[j-1].",
      zh: "子数组必须连续。把 dp[i][j] 定义成「正好以 a[i-1] 和 b[j-1] 结尾」的最长公共连续段。",
    },
    key: {
      en: (
        <>
          State: dp[i][j] is the length of the longest common contiguous run that
          <b> ends at a[i-1] and at b[j-1]</b>. Transition: if a[i-1] == b[j-1],
          then dp[i][j] = dp[i-1][j-1] + 1, otherwise dp[i][j] = 0. Base: row 0
          and column 0 are all 0. The 0 is the whole point. Once the two current
          elements differ, the run is broken and nothing can be carried over. That
          is the difference from LC 1143. The answer is the <b>maximum over the
          whole table</b>, not the bottom-right cell, because a run can end
          anywhere. There are (m+1)(n+1) states and each transition is O(1), so
          the time is O(mn) and the table is O(mn) space. Section 03 fills this
          table cell by cell.
        </>
      ),
      zh: (
        <>
          状态:dp[i][j] = <b>正好以 a[i-1]、b[j-1] 结尾</b>的最长公共连续段长度。
          转移:a[i-1] == b[j-1] 时 dp[i][j] = dp[i-1][j-1] + 1,否则 dp[i][j] = 0。
          初始:第 0 行、第 0 列全为 0。关键就是那个 0 ——
          当前两个元素一旦不同,连续段就断了,前面攒的长度一点也带不过来,
          这正是它和 LC 1143 的分界。答案取<b>整张表的最大值</b>,不是右下角,
          因为连续段可以在任何位置结束。共 (m+1)(n+1) 个状态、每格 O(1),
          时间 O(mn),表本身占 O(mn) 空间。§03 有逐格填表动画。
        </>
      ),
    },
  },
  {
    lc: 1143,
    title: { en: "Longest Common Subsequence", zh: "最长公共子序列" },
    d: "medium",
    tags: {
      en: ["Two sequences", "LCS", "Diagonal transition"],
      zh: ["双序列", "LCS", "对角线转移"],
    },
    hint: {
      en: "A subsequence does not have to be contiguous, so the state can be about prefixes: dp[i][j] over the first i and the first j characters.",
      zh: "子序列不要求连续,所以状态可以只谈前缀:dp[i][j] 只关心前 i 个和前 j 个字符。",
    },
    key: {
      en: (
        <>
          State: dp[i][j] is the length of the longest common subsequence of the
          first i characters of s and the first j characters of t. Transition: if
          the two last characters are equal, they can both be used, so dp[i][j] =
          dp[i-1][j-1] + 1 — the <b>diagonal</b> is the only cell that represents
          &quot;both characters consumed as a matched pair&quot;. If they differ,
          at least one of them cannot be part of a common subsequence that ends
          here, so drop one and keep the better result: dp[i][j] =
          max(dp[i-1][j], dp[i][j-1]). It <b>never resets to 0</b>. Base: row 0
          and column 0 are 0, since an empty string shares nothing. The answer is
          dp[m][n], the bottom-right cell, because the state already covers both
          full strings. Time O(mn), space O(mn) for the table. Worked example B
          animates it.
        </>
      ),
      zh: (
        <>
          状态:dp[i][j] = s 的前 i 个字符与 t 的前 j 个字符的最长公共子序列长度。
          转移:两个末字符相等时可以一起用上,dp[i][j] = dp[i-1][j-1] + 1 ——
          <b>对角线</b>是唯一表示「两个字符作为一对被同时消化」的格子;
          不等时,至少有一个末字符不能出现在这里结束的公共子序列中,
          于是放弃一个、保留较好的结果:dp[i][j] = max(dp[i-1][j], dp[i][j-1]),
          <b>任何时候都不清零</b>。初始:第 0 行、第 0 列为 0,空串与谁都没有公共部分。
          答案就是右下角 dp[m][n],因为状态本身已经覆盖了两个完整的串。
          时间 O(mn),表占 O(mn) 空间。本章精讲 B 是它的逐格动画。
        </>
      ),
    },
  },
  {
    lc: 1035,
    title: { en: "Uncrossed Lines", zh: "不相交的线" },
    d: "medium",
    tags: {
      en: ["LCS", "Restated problem", "Review"],
      zh: ["LCS", "换皮题", "复盘"],
    },
    hint: {
      en: "The lines connect equal numbers and may not cross, so the pairs they connect appear in the same order in both rows. Which problem is that?",
      zh: "连线只能连相等的数,而且不能交叉 —— 也就是配对在两排里的顺序一致。这是哪道题?",
    },
    key: {
      en: (
        <>
          Two lines cross exactly when their pairs appear in opposite orders in
          the two rows. Forbidding crossings therefore means the chosen pairs
          appear in the same relative order in both arrays, and equal values are
          matched. &quot;Pair up equal elements in the same order, as many pairs as
          possible&quot; is the definition of the longest common subsequence.
          Treat the two arrays as two strings and reuse the LC 1143 transition
          with no change at all. This is the clearest example of a restated LCS:
          the story is different, the table is identical. Recognising the LCS
          skeleton behind a new description is the skill being tested.
        </>
      ),
      zh: (
        <>
          两条线交叉,当且仅当它们所连的两对数在两排里的先后顺序相反。
          所以「不交叉」就等于:选出的这些配对在两个数组里顺序一致,而且配的是相等的数。
          「按相同顺序配对相等元素,且配对数最多」正是最长公共子序列的定义。
          把两个数组当成两个「字符串」,直接套 LC 1143 的转移,一行都不用改。
          这是 LCS 最典型的换皮题:故事换了,表没换。
          能从新说法里认出 LCS 的骨架,才是这题真正考的能力。
        </>
      ),
    },
  },
  {
    lc: 583,
    title: {
      en: "Delete Operation for Two Strings",
      zh: "两个字符串的删除操作",
    },
    d: "medium",
    tags: {
      en: ["Two sequences", "LCS", "Edit distance"],
      zh: ["双序列", "LCS", "编辑距离"],
    },
    hint: {
      en: "Only deletion is allowed. Whatever survives in both strings is a common subsequence, so the longer that part is, the fewer deletions you need.",
      zh: "只允许删除。两串里活下来的部分是它们的公共子序列 —— 这部分越长,要删的就越少。",
    },
    key: {
      en: (
        <>
          Two equivalent views. First: compute the LCS length L with LC 1143. The
          characters that survive are exactly one longest common subsequence, so
          the answer is (m - L) + (n - L). Second: a direct DP. dp[i][j] is the
          fewest deletions that make the first i characters of s equal to the
          first j characters of t. If the two last characters are equal, keep both
          and take dp[i-1][j-1]. If not, delete one of them: min(dp[i-1][j],
          dp[i][j-1]) + 1. Base: dp[i][0] = i and dp[0][j] = j, since making a
          prefix equal to the empty string means deleting all of it. This is edit
          distance with insert and replace removed, so LC 72 makes this one easy.
        </>
      ),
      zh: (
        <>
          两种等价视角。其一:用 LC 1143 求出 LCS 长度 L,
          留下来的字符恰好构成一条最长公共子序列,所以答案 = (m − L) + (n − L)。
          其二:直接写 DP。dp[i][j] = 让 s 的前 i 个字符与 t 的前 j 个字符相等所需的最少删除次数。
          两个末字符相等 → 都留着,dp[i][j] = dp[i-1][j-1];
          不等 → 删掉其中一个,dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + 1。
          初始:dp[i][0] = i、dp[0][j] = j —— 要和空串相等只能全删。
          它就是编辑距离砍掉「增」和「改」之后的样子,理解了 LC 72,这题顺手就能写。
        </>
      ),
    },
  },
  {
    lc: 516,
    title: { en: "Longest Palindromic Subsequence", zh: "最长回文子序列" },
    d: "medium",
    tags: {
      en: ["Palindrome", "Interval DP", "Diagonal"],
      zh: ["回文", "区间 DP", "对角线"],
    },
    hint: {
      en: "A palindrome reads the same forwards and backwards. So what is a common subsequence of s and of s reversed?",
      zh: "回文正着读、反着读一样 —— 那么「s 与 s 的反转」的公共子序列是什么?",
    },
    key: {
      en: (
        <>
          Two routes. First: the answer equals LCS(s, reverse(s)), so LC 1143 can
          be reused directly. Second: interval DP. State: dp[i][j] is the length
          of the longest palindromic subsequence inside the substring s[i..j].
          Transition: if s[i] == s[j], the two ends pair up, so dp[i][j] =
          dp[i+1][j-1] + 2; otherwise drop one end, dp[i][j] = max(dp[i+1][j],
          dp[i][j-1]). Base: dp[i][i] = 1, a single character. The iteration order
          is forced by the transition: dp[i][j] reads dp[i+1][…], which is the row
          <b> below</b> it, so i must run from high to low while j runs from low to
          high (filling by increasing interval length works too). Time O(n²),
          space O(n²). This ordering rule is the entry point to interval DP in
          Chapter 10.
        </>
      ),
      zh: (
        <>
          两条路。其一:答案就等于 LCS(s, reverse(s)),直接复用 LC 1143。
          其二:区间 DP。状态:dp[i][j] = 子串 s[i..j] 里最长回文子序列的长度。
          转移:s[i] == s[j] 时两端可以配对,dp[i][j] = dp[i+1][j-1] + 2;
          否则丢掉一端,dp[i][j] = max(dp[i+1][j], dp[i][j-1])。
          初始:dp[i][i] = 1,单个字符本身就是回文。
          遍历顺序由转移决定:dp[i][j] 要读 dp[i+1][…],也就是<b>下面那一行</b>,
          所以 i 必须从大到小、j 从小到大(按区间长度从短到长填也可以)。
          时间 O(n²),空间 O(n²)。这条定序规则,正是第 10 章区间 DP 的入口。
        </>
      ),
    },
  },
  {
    lc: 5,
    title: { en: "Longest Palindromic Substring", zh: "最长回文子串" },
    d: "medium",
    tags: {
      en: ["Palindrome", "Expand from centre", "Review"],
      zh: ["回文", "中心扩展", "复盘"],
    },
    hint: {
      en: "A substring must be contiguous. Instead of listing all substrings, list all possible centres of a palindrome and expand outwards.",
      zh: "子串必须连续。与其枚举所有子串,不如枚举回文的「中心」,再向两边扩。",
    },
    key: {
      en: (
        <>
          Expand from the centre: O(n²) time and <b>O(1) extra space</b>. There
          are 2n-1 centres — n single characters for odd lengths and n-1 gaps
          between neighbouring characters for even lengths. From each centre, move
          both ends outwards while the two characters are equal, and record the
          longest result. The interval DP form also works: dp[i][j] is whether
          s[i..j] is a palindrome, and dp[i][j] = (s[i] == s[j] &amp;&amp; (j - i
          &lt; 2 || dp[i+1][j-1])). It reads dp[i+1][j-1], the shorter interval
          inside it, so you must fill by increasing interval length (or with i
          descending), and it costs O(n²) space. Chapter 12 revisits this problem
          together with Manacher&apos;s algorithm. Section 06 animates the centre
          expansion step by step.
        </>
      ),
      zh: (
        <>
          中心扩展:时间 O(n²)、<b>额外空间 O(1)</b>。一共 2n−1 个中心 ——
          n 个单字符中心对应奇数长度,n−1 个「相邻字符之间的缝隙」对应偶数长度。
          从每个中心出发,两端字符相等就继续向外扩,记录最长的那个。
          区间 DP 也能做:dp[i][j] = s[i..j] 是否回文 =
          (s[i] == s[j] &amp;&amp; (j − i &lt; 2 || dp[i+1][j-1]))。
          它要读 dp[i+1][j-1],也就是被它包住的更短区间,
          所以必须按区间长度从短到长填(或让 i 倒序),而且要付 O(n²) 空间。
          第 12 章会把这题和 Manacher 算法放在一起复盘。§06 有中心扩展的逐帧动画。
        </>
      ),
    },
  },
  {
    lc: 647,
    title: { en: "Palindromic Substrings", zh: "回文子串" },
    d: "medium",
    tags: {
      en: ["Palindrome", "Counting", "Expand from centre"],
      zh: ["回文", "计数", "中心扩展"],
    },
    hint: {
      en: "Same skeleton as LC 5. Replace \"remember the longest\" with \"add one to a counter on every successful expansion\".",
      zh: "和 LC 5 是同一个骨架 —— 只把「记录最长」换成「每成功扩一步就计数加一」。",
    },
    key: {
      en: (
        <>
          Count how many substrings are palindromes. Use the same 2n-1 centres.
          Each time the two ends match during an expansion, one more palindromic
          substring has been found, so increase the counter. The single character
          at an odd centre counts as one as well. LC 5 and LC 647 are twins: the
          same expansion, a different thing measured. One keeps the maximum, the
          other keeps a sum. It is worth noticing how often a DP or scanning
          template stays fixed while only the operator changes.
        </>
      ),
      zh: (
        <>
          统计回文子串的个数。中心还是那 2n−1 个。
          扩展过程中每一次两端字符相等,就意味着又找到了一个回文子串,计数加一;
          奇数中心上的那个单字符本身也算一个。
          LC 5 和 LC 647 是一对孪生题:扩展过程完全一样,只是量的东西不同 ——
          一个留最大值,一个求总和。骨架不变、算子随题型改变,这种情况非常常见。
        </>
      ),
    },
  },
  {
    lc: 72,
    title: { en: "Edit Distance", zh: "编辑距离" },
    d: "hard",
    tags: {
      en: ["Two sequences", "Edit distance", "Three sources"],
      zh: ["双序列", "编辑距离", "三来源"],
    },
    hint: {
      en: "Insert, delete, and replace. When the two current characters differ, ask which smaller subproblem each of the three operations leaves behind.",
      zh: "增、删、改三种操作。当前两个字符不同时,问一句:这三种操作各自留下哪个更小的子问题?",
    },
    key: {
      en: (
        <>
          State: dp[i][j] is the fewest operations that turn the first i
          characters of word1 into the first j characters of word2. If the two
          last characters are equal, neither has to be touched, so dp[i][j] =
          dp[i-1][j-1] with no cost added. If they differ, take the cheapest of
          three: dp[i-1][j-1] + 1 <b>replaces</b> the last character of word1 (both
          ends are consumed, so the diagonal), dp[i-1][j] + 1 <b>deletes</b> the
          last character of word1 (word1 gets one shorter, so the cell above), and
          dp[i][j-1] + 1 <b>inserts</b> the last character of word2 at the end of
          word1 (one more character of word2 is matched, so the cell on the left).
          Base: dp[i][0] = i and dp[0][j] = j, which are the pure-delete and
          pure-insert rows. Time O(mn), space O(mn). Worked example C takes the
          three sources apart cell by cell.
        </>
      ),
      zh: (
        <>
          状态:dp[i][j] = 把 word1 的前 i 个字符变成 word2 的前 j 个字符所需的最少操作数。
          两个末字符相等时谁都不用动,dp[i][j] = dp[i-1][j-1],不加操作;
          不等时在三种操作里取最便宜的:dp[i-1][j-1] + 1 是<b>替换</b> word1 的末字符
          (两端同时被消化,所以是对角线);dp[i-1][j] + 1 是<b>删除</b> word1 的末字符
          (word1 短了一位,所以是上方);dp[i][j-1] + 1 是在 word1 末尾<b>插入</b> word2 的末字符
          (word2 又被匹配掉一位,所以是左方)。
          初始:dp[i][0] = i、dp[0][j] = j,分别是「全删」和「全增」这两条边。
          时间 O(mn),空间 O(mn)。本章精讲 C 逐格拆解这三个来源。
        </>
      ),
    },
  },
  {
    lc: 132,
    title: { en: "Palindrome Partitioning II", zh: "分割回文串 II" },
    d: "hard",
    tags: {
      en: ["Palindrome", "DP on a lookup table", "Optional"],
      zh: ["回文", "DP + 预处理", "选做"],
    },
    hint: {
      en: "First build a table that answers \"is s[i..j] a palindrome?\" in O(1). Then run a one-dimensional DP for the fewest cuts on top of it.",
      zh: "先用一张表把「s[i..j] 是不是回文」变成 O(1) 查询,再在这张表上跑一维「最少切几刀」的 DP。",
    },
    key: {
      en: (
        <>
          Two DPs stacked. First, interval DP builds isPal[i][j], which says
          whether s[i..j] is a palindrome, in O(n²). Then dp[i] is the fewest cuts
          needed for the first i characters: dp[i] = min(dp[j] + 1) over every j
          &lt; i for which s[j..i-1] is a palindrome, and dp[i] = 0 when s[0..i-1]
          is itself a palindrome, since no cut is needed. Base: dp[0] = 0, and the
          answer is dp[n]. Time O(n²), space O(n²) for the lookup table. Building
          a lookup table first and running the main DP on top of it is a common
          combination, and worth practising once the main line feels stable.
        </>
      ),
      zh: (
        <>
          两层 DP 叠在一起。先用区间 DP 在 O(n²) 内算出 isPal[i][j],
          表示 s[i..j] 是否回文;再设 dp[i] = 前 i 个字符的最少切割次数,
          dp[i] = min(dp[j] + 1),其中 j &lt; i 且 s[j..i-1] 是回文;
          若 s[0..i-1] 本身就是回文,则 dp[i] = 0,一刀都不用切。
          初始 dp[0] = 0,答案是 dp[n]。时间 O(n²),判定表占 O(n²) 空间。
          「先预处理一张判定表,再在表上跑主 DP」是很常见的组合,
          等主线内容熟了之后值得专门练一次。
        </>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "What is the difference between a subsequence and a subarray (a substring)?",
      zh: "「子序列(subsequence)」和「子数组 / 子串(subarray / substring)」的区别是什么?",
    },
    opts: {
      en: [
        "A subsequence keeps the original relative order but does not have to be contiguous; a subarray is a contiguous block of the original sequence",
        "A subsequence must be contiguous; a subarray may skip elements",
        "They are the same thing under two names",
        "A subsequence must contain an even number of elements; a subarray has no such limit",
      ],
      zh: [
        "子序列保持原来的相对顺序,但不要求连续;子数组 / 子串是原序列里连续的一段",
        "子序列必须连续,子数组可以跳着取",
        "两者是同一个东西的两种叫法",
        "子序列只能取偶数个元素,子数组没有这个限制",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "This is the other way round. The contiguous one is the subarray. A subsequence is allowed to skip elements as long as the order is kept.",
        "They differ, and the difference decides the state definition: a contiguous problem such as LC 718 resets to 0 on a mismatch, while LC 1143 keeps the larger of two neighbours.",
        "There is no restriction on how many elements you take. The only difference is whether the elements have to be contiguous.",
      ],
      zh: [
        undefined,
        "说反了。要求连续的是子数组;子序列恰恰允许跳过元素,只要不打乱先后顺序。",
        "两者不同,而且这个差别直接决定状态怎么定义:连续型(LC 718)不匹配时归零,LC 1143 不匹配时取两个邻格里较大的那个。",
        "取几个元素没有任何限制。唯一的差别是元素是否必须连续。",
      ],
    },
    why: {
      en: "Whether the elements must be contiguous is the first fork in this chapter. It decides what happens in the mismatch case: reset to 0 for a subarray, or carry the larger neighbour forward for a subsequence. The lab in section 01 lets you try both.",
      zh: "「是否要求连续」是本章的第一个分岔口:它决定了不匹配那一格该归零(子数组),还是继承较大的邻格(子序列)。§01 的实验室就是让你亲手感受这条界线。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In the O(n²) solution to LC 300, dp[i] is defined as the length of the longest increasing subsequence ending at index i, rather than the longest one among the first i elements. Why?",
      zh: "LC 300 的 O(n²) 解法把 dp[i] 定义成「以下标 i 结尾的最长上升子序列长度」,而不是「前 i 个元素里的最长上升子序列长度」。为什么?",
    },
    opts: {
      en: [
        "Fixing the last element is what makes the transition possible: you can compare nums[j] with nums[i] and decide whether nums[i] can be appended",
        "Because \"ending at i\" runs faster and has a lower complexity",
        "The two definitions are equivalent, so either one works",
        "Because \"the longest among the first i\" cannot be stored in an array",
      ],
      zh: [
        "固定了末尾元素,转移才写得出来:可以比较 nums[j] 与 nums[i],判断 nums[i] 能不能接上去",
        "因为「以 i 结尾」跑得更快,复杂度更低",
        "两种定义等价,随便选一个都行",
        "因为「前 i 个里的最长上升子序列」没法用数组存",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Both definitions would be O(n²) if they worked. Speed is not the reason. The reason is that a fixed last element gives the transition something to compare against.",
        "They are not equivalent. \"The longest among the first i\" does not say which element it ends with, so you cannot tell whether nums[i] may be appended to it. The transition cannot be written at all.",
        "Both are single numbers per index, so storage is not the issue. The problem is that \"the longest among the first i\" leaves out the last element, which the transition needs.",
      ],
      zh: [
        undefined,
        "如果第二种定义能用,复杂度同样是 O(n²)。快慢不是理由,理由是固定末尾之后,转移才有可比较的对象。",
        "两者并不等价。「前 i 个里的最长上升子序列」没有说它以哪个元素结尾,于是无法判断 nums[i] 能否接上去,转移根本写不出来。",
        "两种定义每个下标都只是一个数,存储不是问题。问题在于「前 i 个里的最长」丢掉了「末尾元素是谁」,而转移正需要这个信息。",
      ],
    },
    why: {
      en: "Anchoring a subproblem by its last element is the central technique of subsequence DP. The cost of that choice is that the answer is no longer in the last cell: you must take the maximum over the whole dp array.",
      zh: "「用末尾元素锚定子问题」是子序列 DP 的核心技巧。代价是答案不再落在最后一格 —— 必须取整个 dp 数组的最大值。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          Work it out by hand: for nums = [1, 3, 2, 4, 5], how long is the longest
          increasing subsequence?
        </>
      ),
      zh: (
        <>
          手推一遍:nums = [1, 3, 2, 4, 5] 的最长上升子序列有多长?
        </>
      ),
    },
    placeholder: { en: "Enter a whole number…", zh: "输入一个整数…" },
    answers: ["4"],
    hint: {
      en: "dp = [1, 2, 2, 3, ?]. The last value, 5, is larger than every earlier value, so it can extend the best subsequence found so far.",
      zh: "dp = [1, 2, 2, 3, ?]。最后一个数 5 比前面所有数都大,可以接在目前最好的那条后面。",
    },
    why: {
      en: "dp = [1, 2, 2, 3, 4] and the maximum is 4, for example [1, 3, 4, 5] or [1, 2, 4, 5]. Here the maximum happens to sit in dp[4], because the largest value is at the end. Change the input and the answer can be anywhere in the array, which is why you take the maximum of all of it.",
      zh: "dp = [1, 2, 2, 3, 4],最大值是 4,对应 [1, 3, 4, 5] 或 [1, 2, 4, 5]。这里最大值恰好落在 dp[4],是因为最大的数正好在末尾。换一组数据,最大值可能出现在数组的任何位置 —— 所以要取全数组的最大值。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Both LC 718 (maximum length of repeated subarray) and LC 1143 (longest common subsequence) fill a two-dimensional table. How do they differ when the two current characters are not equal?",
      zh: "LC 718(最长重复子数组)和 LC 1143(最长公共子序列)都在填一张二维表。当前两个字符不相等时,它们的转移有什么不同?",
    },
    opts: {
      en: [
        "LC 718 resets the cell to 0 because the run is broken; LC 1143 takes max(dp[i-1][j], dp[i][j-1]) because a subsequence may skip the mismatching character",
        "Both reset the cell to 0",
        "Both take max(above, left)",
        "LC 718 takes the max and LC 1143 resets to 0",
      ],
      zh: [
        "LC 718 把该格归零,因为连续段断了;LC 1143 取 max(dp[i-1][j], dp[i][j-1]),因为子序列可以跳过对不上的字符",
        "两者都归零",
        "两者都取 max(上, 左)",
        "LC 718 取 max,LC 1143 归零",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Only LC 718 resets. LC 1143 asks for a subsequence, so the mismatching character can be skipped and the larger of the two neighbours is carried forward.",
        "Only LC 1143 takes the max. LC 718 asks for a contiguous run, so one mismatch ends the run and the cell must go back to 0.",
        "This is the wrong way round. Resetting belongs to LC 718, which requires contiguity. Taking the max belongs to LC 1143, which does not.",
      ],
      zh: [
        undefined,
        "只有 LC 718 归零。LC 1143 求的是子序列,可以跳过对不上的字符,把两个邻格里较大的那个继承下来。",
        "只有 LC 1143 取 max。LC 718 求的是连续段,一次不匹配这段就断了,格子必须回到 0。",
        "正好说反。归零的是要求连续的 LC 718;取 max 的是不要求连续的 LC 1143。",
      ],
    },
    why: {
      en: "One word in the problem statement, contiguous or not, turns the mismatch case from \"reset to 0\" into \"keep the larger neighbour\". In the match case the two are identical: both go to the diagonal, dp[i-1][j-1] + 1.",
      zh: "题面上「连续」这两个字,把不匹配那一格从「归零」变成了「保留较大的邻格」。而匹配时两者完全一样,都走对角线 dp[i-1][j-1] + 1。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which of these statements about dp[i][j] in LC 1143 (longest common subsequence) are correct? (Select all that apply)",
      zh: "关于 LC 1143(最长公共子序列)的 dp[i][j],下面哪些说法是对的?(多选)",
    },
    opts: {
      en: [
        "When s[i-1] == t[j-1], dp[i][j] = dp[i-1][j-1] + 1, so the value comes from the diagonal",
        "When s[i-1] != t[j-1], dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
        "Row 0 and column 0, which stand for an empty string, are all 0",
        "When the characters differ, dp[i][j] should be reset to 0",
      ],
      zh: [
        "当 s[i-1] == t[j-1] 时,dp[i][j] = dp[i-1][j-1] + 1,值来自对角线",
        "当 s[i-1] != t[j-1] 时,dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
        "第 0 行和第 0 列(代表空串)全部为 0",
        "字符不相等时应该把 dp[i][j] 归零",
      ],
    },
    correct: [0, 1, 2],
    missHint: {
      en: "The three parts are: the diagonal on a match, the larger of the two neighbours on a mismatch, and 0 along the empty-string row and column. Check which one you left out.",
      zh: "三件套是:匹配走对角线、不匹配取两个邻格里较大的、空串那一行一列是 0。看看漏了哪一条。",
    },
    extraHint: {
      en: "One option belongs to LC 718. Resetting to 0 is what a contiguous problem does. A longest common subsequence never resets.",
      zh: "有一个选项是 LC 718 的规则。归零是「要求连续」的题才会做的事,最长公共子序列任何时候都不清零。",
    },
    why: {
      en: "The diagonal handles a matched pair, the two neighbours handle \"drop one character and keep looking\", and the empty-string row and column are the base cases. Because nothing ever resets, the answer is always the bottom-right cell.",
      zh: "对角线负责「配对成功」,两个邻格负责「放弃一个字符继续找」,空串行和空串列是初始值。正因为任何时候都不清零,答案总是落在右下角。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In LC 72 (edit distance), when word1[i-1] != word2[j-1] the transition is dp[i][j] = min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]) + 1. Which operation does each source cell stand for?",
      zh: "LC 72(编辑距离)中,当 word1[i-1] != word2[j-1] 时,转移是 dp[i][j] = min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]) + 1。这三个来源格分别对应哪种操作?",
    },
    opts: {
      en: [
        "dp[i-1][j-1] is replace, dp[i-1][j] is delete, dp[i][j-1] is insert",
        "All three stand for replace, only along different paths",
        "dp[i-1][j-1] is insert, dp[i-1][j] is replace, dp[i][j-1] is delete",
        "The diagonal is delete, the cell above is insert, the cell on the left is replace",
      ],
      zh: [
        "dp[i-1][j-1] 是替换,dp[i-1][j] 是删除,dp[i][j-1] 是插入",
        "三个都是替换,只是路径不同",
        "dp[i-1][j-1] 是插入,dp[i-1][j] 是替换,dp[i][j-1] 是删除",
        "对角线是删除,上方是插入,左方是替换",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The three are different operations: the diagonal replaces, the cell above deletes, the cell on the left inserts.",
        "The diagonal is replace, not insert. One replacement consumes the last character of both strings at once, and that is exactly one step diagonally.",
        "The mapping is wrong. The diagonal replaces the last character of word1, the cell above deletes it, and the cell on the left inserts the last character of word2 at the end of word1.",
      ],
      zh: [
        undefined,
        "三者是不同的操作:对角线是替换,上方是删除,左方是插入。",
        "对角线是替换,不是插入。一次替换同时消化掉两个串的末字符,正好对应斜着走一格。",
        "映射错了。对角线是替换 word1 的末字符,上方是删除它,左方是在 word1 末尾插入 word2 的末字符。",
      ],
    },
    why: {
      en: "Read each source cell as \"what does the string look like after that one operation\". Delete makes word1 one shorter, so i drops by 1. Insert matches one more character of word2, so j drops by 1. Replace consumes one character from each, so both drop by 1. When the two characters are already equal, no operation is needed and the value is copied straight from the diagonal.",
      zh: "把每个来源格读成「做完那一步操作之后,串变成什么样」:删除让 word1 短一位,所以 i 减 1;插入又匹配掉 word2 的一位,所以 j 减 1;替换同时消化两边各一位,所以 i、j 都减 1。而两个字符本来就相等时不需要任何操作,直接抄对角线的值。",
    },
  },
  {
    type: "choice",
    q: {
      en: "LC 516 asks for the longest palindromic subsequence. Which known problem can it be turned into directly?",
      zh: "LC 516 求最长回文子序列。它可以直接转化成下面哪个已知问题?",
    },
    opts: {
      en: [
        "The longest common subsequence of s and reverse(s)",
        "The longest increasing subsequence of s",
        "The most frequent character in s",
        "The longest run of equal characters after sorting s",
      ],
      zh: [
        "s 与 reverse(s)(s 的反转)的最长公共子序列",
        "s 的最长上升子序列",
        "s 中出现次数最多的字符",
        "把 s 排序后最长的相同字符连续段",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The longest increasing subsequence is about values getting larger. A palindrome is about symmetry, which is a different property.",
        "The most frequent character only counts occurrences. It cannot tell you how long the longest symmetric subsequence is.",
        "Sorting destroys the original order, and the symmetry of a palindrome depends entirely on that order.",
      ],
      zh: [
        undefined,
        "最长上升子序列关心的是数值递增,而回文关心的是对称,两者不是一回事。",
        "出现次数最多的字符只统计频次,回答不了「最长的对称子序列有多长」。",
        "排序会打乱原来的顺序,而回文的对称性完全依赖这个顺序。",
      ],
    },
    why: {
      en: "A palindrome reads the same in both directions, so a palindromic subsequence of s is a subsequence that also appears, in the same order, in reverse(s). That makes it a common subsequence of the two strings, and LC 1143 solves it unchanged. Interval DP solves it directly as well, which is the preview of Chapter 10.",
      zh: "回文正读反读一样,所以 s 的回文子序列同时也会按相同顺序出现在 reverse(s) 里 —— 也就是这两个串的公共子序列,LC 1143 的代码原封不动就能用。当然也可以直接写区间 DP,那是第 10 章的预告。",
    },
  },
];
