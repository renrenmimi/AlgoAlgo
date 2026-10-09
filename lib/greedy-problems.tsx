// Chapter 6 - Greedy: problem set (the quiz is in lib/greedy-quiz.tsx).
// The problem set covers lc.md's greedy track (exchange argument / sequences / jumping /
// simulation / intervals), ordered easy to hard; hint only points at a direction without
// spoiling, key explains the optimal solution in one paragraph. Review problems (taught in
// another chapter) carry the "Review" tag.
// Bilingual: title / tags / hint / key are all Loc<...>, written inline as { en, zh }.

import type { Problem } from "@/lib/problems";

export const PROBLEMS: Problem[] = [
  {
    lc: 455,
    title: { en: "Assign Cookies", zh: "分发饼干" },
    d: "easy",
    tags: {
      en: ["Exchange argument", "Sorting", "Seed problem"],
      zh: ["交换论证", "排序", "种子题"],
    },
    hint: {
      en: "Serve the child with the smallest appetite first, and use the smallest cookie that is still large enough.",
      zh: "先满足胃口最小的孩子,而且只用「刚好够」的那块饼干。",
    },
    key: {
      en: (
        <>
          Sort both arrays. Then walk two pointers: give the smallest remaining
          cookie to the child with the smallest unsatisfied appetite. If that
          cookie is too small for that child, it is too small for every child, so
          discard it. The proof is an <b>exchange argument</b>: take any optimal
          assignment, and rewrite it so that it makes the same first choice as
          greedy, without feeding fewer children. Sorting dominates the cost:
          O(n log n). Section 02 has the animation and the full proof.
        </>
      ),
      zh: (
        <>
          双方排序,再用双指针:把当前最小的饼干给胃口最小的未满足孩子。如果这块饼干喂不动他,那它对谁都不够用,直接丢掉。正确性靠<b>交换论证</b>:任取一个最优解,把它改写成「第一步和贪心一致」的样子,且满足的孩子数不减少。总复杂度由排序决定:O(n log n)。§02 有逐帧动画和完整证明。
        </>
      ),
    },
  },
  {
    lc: 860,
    title: { en: "Lemonade Change", zh: "柠檬水找零" },
    d: "easy",
    tags: {
      en: ["Simulation", "Which bill to spend"],
      zh: ["模拟", "面额贪心"],
    },
    hint: {
      en: "Only 5, 10, and 20 exist. When you can pay change two ways, spend the 10 and keep the 5s.",
      zh: "只有 5 / 10 / 20 三种钞票。有两种找法时,先花掉 10,把 5 留在手里。",
    },
    key: {
      en: (
        <>
          Keep two counters: how many 5s and how many 10s you hold. A 5 needs no
          change. A 10 needs one 5. A 20 needs either 10 + 5 or 5 + 5 + 5;
          prefer 10 + 5. Why that is safe: choosing 10 + 5 leaves you with two
          more 5s and one fewer 10 than the other option. If a later customer
          needs a 10 that you no longer have, you can pay that 20 with 5 + 5 + 5
          instead, which costs exactly those two extra 5s. So preferring 10 + 5
          never turns a solvable case into a failure. O(n), O(1).
        </>
      ),
      zh: (
        <>
          维护两个计数:手里有几张 5、几张 10。收 5 不用找;收 10 找一张 5;收 20 可以找 10 + 5 或 5 + 5 + 5,优先前者。为什么这样不会更差:选 10 + 5 之后,你比另一种选法多两张 5、少一张 10。如果后面某位顾客需要那张你已经没有的 10,你可以改用 5 + 5 + 5 去找他,代价正好是多出来的那两张 5。所以优先出 10 不会把本来能做到的情况变成失败。O(n)、O(1)。
        </>
      ),
    },
  },
  {
    lc: 1005,
    title: {
      en: "Maximize Sum Of Array After K Negations",
      zh: "K 次取反后最大化的数组和",
    },
    d: "easy",
    tags: {
      en: ["Sorting", "Two phases", "Optional"],
      zh: ["排序", "两段贪心", "选做"],
    },
    hint: {
      en: "Flip the most negative numbers first. If K is left over and odd, flip the number with the smallest absolute value.",
      zh: "先把最负的数翻正;K 还有剩且是奇数,就翻绝对值最小的那个。",
    },
    key: {
      en: (
        <>
          Sort, then flip negatives starting from the most negative one: each
          such flip adds 2|x| to the sum, and the most negative number gives the
          largest gain. If K runs out first, you are done. If K is left over
          after all negatives are gone, an even number of extra flips cancels
          out, and an odd number costs one flip. Spend it on the element with
          the smallest absolute value, because that flip costs 2|x| and you want
          that loss to be as small as possible. Two phases: take the largest
          gain first, then make the unavoidable loss as small as possible.
        </>
      ),
      zh: (
        <>
          排序后从最负的数开始翻正:每翻一个负数,总和增加 2|x|,而最负的数收益最大。若 K 先用完,就结束了。若负数翻完 K 还有剩:偶数次多余的翻转互相抵消,奇数次则必须付出一次代价。把这一次花在<b>绝对值最小</b>的元素上 ——
          这次翻转会让总和减少 2|x|,自然要挑最小的 |x|。两段贪心:先拿最大收益,再把躲不掉的损失压到最小。
        </>
      ),
    },
  },
  {
    lc: 376,
    title: { en: "Wiggle Subsequence", zh: "摆动序列" },
    d: "medium",
    tags: {
      en: ["Sequence greedy", "Direction changes"],
      zh: ["序列贪心", "拐点计数"],
    },
    hint: {
      en: "Only direction changes matter. Inside a stretch that keeps rising, the middle numbers add nothing.",
      zh: "只有方向改变才算数。一段持续上升的数里,中间那些点毫无贡献。",
    },
    key: {
      en: (
        <>
          Split the array into maximal runs that go only up or only down, and
          ignore equal neighbors. Keeping the endpoint of every run and dropping
          everything inside it does not shorten the wiggle, so if there are k
          runs the answer is k + 1. In code this becomes two counters:{" "}
          <code>up</code> is the length of the longest wiggle subsequence that
          ends with a rise, <code>down</code> the longest that ends with a fall.
          A rise sets <code>up = down + 1</code>, a fall sets{" "}
          <code>down = up + 1</code>, and equal neighbors change nothing. O(n).
        </>
      ),
      zh: (
        <>
          把数组切成若干「只升」或「只降」的极大单调段,相等的相邻元素忽略。每段只保留端点、删掉段内的点,摆动长度不会变短 ——
          所以有 k 段时,答案就是 k + 1。写成代码就是两个计数器:
          <code>up</code> 表示以「上升」结尾的最长摆动长度,<code>down</code>{" "}
          表示以「下降」结尾的最长长度。遇到上升令 <code>up = down + 1</code>,遇到下降令 <code>down = up + 1</code>,相等则都不动。O(n)。
        </>
      ),
    },
  },
  {
    lc: 122,
    title: {
      en: "Best Time to Buy and Sell Stock II",
      zh: "买卖股票的最佳时机 II",
    },
    d: "medium",
    tags: {
      en: ["Sequence greedy", "Stock", "Two views"],
      zh: ["序列贪心", "股票", "一题两解"],
    },
    hint: {
      en: "Trades are unlimited, so collect every day-to-day price increase.",
      zh: "允许无限次交易,那就把每一段「今天比昨天贵」的差价都收进来。",
    },
    key: {
      en: (
        <>
          Greedy: <code>profit += max(0, p[i] − p[i−1])</code>. Why it is
          optimal, in two parts. First, any single trade that buys on day i and
          sells on day j earns <code>p[j] − p[i]</code>, which is the sum of all
          day-to-day differences in that range, so it is at most the sum of the{" "}
          <i>positive</i> differences in that range. Trades never overlap, so
          every difference is counted at most once, and{" "}
          <code>Σ max(0, Δ)</code> is an upper bound for every strategy. Second,
          buying and selling on each rising day reaches that bound exactly, so it
          is optimal. The same answer also comes from a state machine DP (hold /
          cash), covered in chapter 10.
        </>
      ),
      zh: (
        <>
          贪心:<code>profit += max(0, p[i] − p[i−1])</code>。为什么最优,分两步。其一,任何一次「第 i 天买、第 j 天卖」的收益{" "}
          <code>p[j] − p[i]</code> 等于这段区间内全部相邻差之和,因此不超过区间内<i>正</i>差之和;而多次交易的持仓区间互不重叠,每个差值最多被算一次,所以 <code>Σ max(0, Δ)</code>{" "}
          是任何策略都超不过的上界。其二,「每个上涨日都买卖一次」恰好取到这个上界,所以它就是最优解。同一答案也能用状态机 DP(持有 / 空仓)得到,第 10 章主讲。
        </>
      ),
    },
  },
  {
    lc: 53,
    title: { en: "Maximum Subarray", zh: "最大子数组和" },
    d: "medium",
    tags: {
      en: ["Sequence greedy", "Kadane", "Review"],
      zh: ["序列贪心", "Kadane", "复盘"],
    },
    hint: {
      en: "If the sum you carry from the left is negative, it can only make the next subarray smaller. Drop it.",
      zh: "如果从左边带过来的和是负的,它只会让后面的子数组更小 —— 直接丢掉。",
    },
    key: {
      en: (
        <>
          Kadane: <code>cur = max(nums[i], cur + nums[i])</code>, and record the
          largest <code>cur</code> seen so far. The greedy reading is &quot;a
          negative prefix can only hurt, so start again from the current
          element&quot;. The DP reading is that <code>cur</code> is the largest
          sum of a subarray that ends at index i. Same line of code, two ways to
          justify it. The LC 53 entry in the chapter 07 problem set gives its DP
          state and transition; here it is a review.
        </>
      ),
      zh: (
        <>
          Kadane:<code>cur = max(nums[i], cur + nums[i])</code>,全程记录最大的{" "}
          <code>cur</code>。贪心读法是「负的前缀只会让和变小,不如从当前元素重新开始」;
          DP 读法是「<code>cur</code> 表示以下标 i 结尾的最大子数组和」。同一行代码,两种解释。第 7 章题单里的 LC 53 给出了它的 DP 状态与转移,这里只作复盘。
        </>
      ),
    },
  },
  {
    lc: 55,
    title: { en: "Jump Game", zh: "跳跃游戏" },
    d: "medium",
    tags: { en: ["Jump", "Reach"], zh: ["跳跃", "覆盖范围"] },
    hint: {
      en: "Keep one number: the farthest index you can reach so far. You never need to know the actual jumps.",
      zh: "只维护一个数:目前最远能到哪。具体怎么跳根本不用知道。",
    },
    key: {
      en: (
        <>
          Scan left to right and keep{" "}
          <code>reach = max(reach, i + nums[i])</code>. The invariant is: when
          the scan arrives at index i and <code>i ≤ reach</code>, every index
          from 0 to i is reachable from index 0, and <code>reach</code> is the
          farthest index reachable using indices 0..i as launch points. So if{" "}
          <code>i &gt; reach</code>, index i is unreachable, and since you only
          move forward, so is everything after it: return false. If the scan
          finishes with <code>reach ≥ n − 1</code>, the last index is reachable.
          O(n), O(1).
        </>
      ),
      zh: (
        <>
          从左往右扫,维护 <code>reach = max(reach, i + nums[i])</code>。不变量是:当扫描走到下标 i 且 <code>i ≤ reach</code> 时,
          0 到 i 的每个下标都能从 0 号到达,而 <code>reach</code>{" "}
          是「只用 0..i 这些格子起跳」所能到达的最远下标。因此一旦{" "}
          <code>i &gt; reach</code>,i 号就不可达;又因为只能往前走,它后面的格子也都不可达,返回 false。扫完时若{" "}
          <code>reach ≥ n − 1</code>,末尾可达。O(n)、O(1)。
        </>
      ),
    },
  },
  {
    lc: 45,
    title: { en: "Jump Game II", zh: "跳跃游戏 II" },
    d: "medium",
    tags: { en: ["Jump", "Worked example", "BFS in O(1) space"], zh: ["跳跃", "精讲", "BFS 压缩"] },
    hint: {
      en: "Inside the range of the current jump, look ahead for the landing spot that pushes the next range farthest.",
      zh: "在「这一跳能到的范围」里提前找出:哪个落点能把下一跳的范围推得最远。",
    },
    key: {
      en: (
        <>
          Keep <code>curEnd</code>, the last index reachable in the jumps taken
          so far, and <code>farthest</code>, the last index reachable in one more
          jump. When the scan reaches <code>curEnd</code>, that layer is
          finished, so do <code>jumps++</code> and set{" "}
          <code>curEnd = farthest</code>. The invariant is that after k
          increments, <code>curEnd</code> is exactly the farthest index reachable
          in k jumps, so the first layer that contains n − 1 gives the minimum
          number of jumps. This is breadth-first search over the same graph, with
          the queue replaced by two integers. O(n), O(1). Section 04 animates it.
        </>
      ),
      zh: (
        <>
          维护 <code>curEnd</code>(已跳的步数内能到的最远下标)和{" "}
          <code>farthest</code>(再跳一次能到的最远下标)。扫描走到{" "}
          <code>curEnd</code> 说明这一层用尽,于是 <code>jumps++</code> 并令{" "}
          <code>curEnd = farthest</code>。不变量:累加 k 次之后,
          <code>curEnd</code> 恰好是「k 跳能到的最远下标」,所以第一个包含 n − 1 的层数就是最少跳数。它等价于在同一张图上做 BFS,只是把队列换成了两个整数。O(n)、O(1)。§04 有逐帧动画。
        </>
      ),
    },
  },
  {
    lc: 134,
    title: { en: "Gas Station", zh: "加油站" },
    d: "medium",
    tags: { en: ["Simulation", "Choosing a start"], zh: ["模拟", "起点选择"] },
    hint: {
      en: "Whether a solution exists is one check. Where it starts is the station right after the tank first goes negative.",
      zh: "有没有解是一道判断题;起点在哪,看油箱第一次变负的下一站。",
    },
    key: {
      en: (
        <>
          Let <code>diff[i] = gas[i] − cost[i]</code>. If{" "}
          <code>Σ diff &lt; 0</code> there is no answer. Otherwise scan once,
          adding <code>diff[i]</code> to <code>tank</code>. If{" "}
          <code>tank &lt; 0</code> after station i, then no station between the
          current candidate start a and i can work either: for any c in that
          range the partial sum from a to c − 1 was still ≥ 0, so the sum from c
          to i is at most the sum from a to i, which is negative. That means
          starting at c also runs dry by station i at the latest. So set the
          candidate to i + 1, reset <code>tank</code>, and never look back.
          O(n), O(1).
        </>
      ),
      zh: (
        <>
          记 <code>diff[i] = gas[i] − cost[i]</code>。若{" "}
          <code>Σ diff &lt; 0</code>,无解。否则只扫一遍,把 <code>diff[i]</code>{" "}
          累加进 <code>tank</code>。如果走到 i 之后 <code>tank &lt; 0</code>,那么当前候选起点 a 到 i 之间的任何一站 c 也不可能是答案:因为从 a 到 c − 1 的部分和一直 ≥ 0,所以从 c 到 i 的和不超过从 a 到 i 的和,而后者是负的 —— 从 c 出发最迟到 i 也会断油。于是把候选起点设为 i + 1、
          <code>tank</code> 清零,前面的起点一个都不用回头再试。O(n)、O(1)。
        </>
      ),
    },
  },
  {
    lc: 406,
    title: {
      en: "Queue Reconstruction by Height",
      zh: "根据身高重建队列",
    },
    d: "medium",
    tags: { en: ["Sorting", "Insertion", "Advanced"], zh: ["排序", "插入", "进阶"] },
    hint: {
      en: "Place the tall people first. Inserting a shorter person later cannot change what a taller person sees.",
      zh: "先让高个子站好队。矮的后插进来,不会改变高个子看到的人数。",
    },
    key: {
      en: (
        <>
          Sort by height descending, and by k ascending within the same height.
          Then insert each person at index k of the result list. This is correct
          because everyone already placed is at least as tall as the person being
          inserted, so inserting a shorter person does not change the number of
          taller-or-equal people in front of anyone already placed. And the new
          person lands with exactly k such people ahead. Fixing the dominant
          attribute first, then arranging the secondary one, is the standard
          sorting-plus-greedy pattern. O(n²) because of list insertion.
        </>
      ),
      zh: (
        <>
          按身高降序排序,同身高时 k 升序;然后把每个人依次插入结果列表的下标 k 处。正确性在于:已经排好的人都不比当前这个人矮,所以插入一个更矮的人不会改变任何已排好的人前面「不比他矮的人数」;而新插入的人前面恰好有 k 个这样的人。「先固定影响最大的维度,再安排次要维度」是排序 + 贪心的经典配方。因为要做列表插入,复杂度 O(n²)。
        </>
      ),
    },
  },
  {
    lc: 452,
    title: {
      en: "Minimum Number of Arrows to Burst Balloons",
      zh: "用最少数量的箭引爆气球",
    },
    d: "medium",
    tags: { en: ["Intervals", "Sort by end"], zh: ["区间贪心", "右端排序"] },
    hint: {
      en: "One arrow at position x bursts every balloon whose interval contains x. Make each arrow cover as many as possible.",
      zh: "一支箭射在 x 处,能引爆所有区间包含 x 的气球 —— 让每支箭尽量多穿几个。",
    },
    key: {
      en: (
        <>
          Sort by right endpoint. Fire the first arrow at the smallest right
          endpoint x: every balloon with <code>start ≤ x</code> is burst. When a
          balloon has <code>start &gt; x</code>, it needs a new arrow, fired at
          its own right endpoint. Same argument as LC 435: shooting at the
          earliest possible endpoint never bursts fewer balloons than shooting
          later, so an exchange argument turns any optimal set of arrows into
          this one. O(n log n).
        </>
      ),
      zh: (
        <>
          按右端升序排序。第一支箭射在最小的右端 x,凡是 <code>start ≤ x</code>{" "}
          的气球都被穿爆。遇到 <code>start &gt; x</code> 的气球就换新箭,射在它自己的右端。论证和 LC 435 同款:射在「尽量早的端点」不会比射得更晚穿爆更少的气球,所以交换论证能把任何一组最优的箭改写成这一组。O(n log n)。
        </>
      ),
    },
  },
  {
    lc: 435,
    title: { en: "Non-overlapping Intervals", zh: "无重叠区间" },
    d: "medium",
    tags: { en: ["Intervals", "Worked example", "Sort by end"], zh: ["区间贪心", "精讲", "右端排序"] },
    hint: {
      en: "Deleting the fewest is the same as keeping the most. Always keep the interval that ends earliest.",
      zh: "「删最少」等价于「保留最多」。永远优先保留结束最早的那个区间。",
    },
    key: {
      en: (
        <>
          Sort by right endpoint. Keep an interval when its start is not before
          the end of the last kept interval; otherwise delete it. The answer is
          total minus kept. Sorting by end time is what makes this optimal:
          among all intervals, the one that ends earliest leaves the largest
          remaining time for the rest, and an exchange argument shows any optimal
          solution can be rewritten to start with it. Sorting by start time also
          works if, on an overlap, you keep the interval that ends earlier.
          Keeping whichever comes first by start time, or sorting by length, is not
          optimal. O(n log n). Section 06 walks through
          the timeline.
        </>
      ),
      zh: (
        <>
          按右端排序。若当前区间的起点不早于「上一个保留区间」的终点就保留,否则删掉。答案 = 总数 − 保留数。按结束时间排序正是最优性的来源:在所有区间里,结束最早的那个给后面留下的时间最多,而交换论证说明任何最优解都能改写成以它开头。按开始时间排序也可以,但重叠时必须保留结束更早的那个;只按开始时间贪心保留,或按长度排序,都不是最优。O(n log n)。§06 有时间轴动画。
        </>
      ),
    },
  },
  {
    lc: 763,
    title: { en: "Partition Labels", zh: "划分字母区间" },
    d: "medium",
    tags: { en: ["Intervals", "Advanced"], zh: ["区间贪心", "进阶"] },
    hint: {
      en: "A part cannot end while one of its letters still appears later in the string.",
      zh: "只要段内某个字母后面还会出现,这一段就不能收尾。",
    },
    key: {
      en: (
        <>
          First record the last index of every letter. Then scan, extending the
          current part&apos;s right boundary to the farthest last index among the
          letters seen in this part. When the scan position equals that boundary,
          cut. At that moment no letter of this part appears later, so the cut is
          legal; and cutting at the first legal position gives the most parts,
          because any legal cut must be at or after it. O(n).
        </>
      ),
      zh: (
        <>
          先记下每个字母最后出现的下标。然后遍历,把当前段的右边界扩到「段内已见字母的最远出现位置」。当扫描位置等于这个右边界时,切一刀。此刻段内所有字母都不会再出现在后面,所以这一刀合法;而在第一个合法位置切能分出最多段,因为任何合法的切点都不会更早。O(n)。
        </>
      ),
    },
  },
  {
    lc: 56,
    title: { en: "Merge Intervals", zh: "合并区间" },
    d: "medium",
    tags: { en: ["Intervals", "Sort by start", "Review"], zh: ["区间贪心", "左端排序", "复盘"] },
    hint: {
      en: "Sort by start. If the next interval touches the current one, extend it; otherwise open a new one.",
      zh: "按左端排序。下一个区间能接上就扩,接不上就另起一段。",
    },
    key: {
      en: (
        <>
          Sort by start, then merge in order: if the current start is not after
          the end of the last output interval, extend that end with{" "}
          <code>max</code>; otherwise append a new interval. Note the sort key is
          the <b>start</b> here, because the goal is to merge, not to select. If
          you sorted by end, intervals that overlap would no longer be next to
          each other. Chapter 01 teaches this one; here it is the contrast case
          for the choice of sort key.
        </>
      ),
      zh: (
        <>
          按左端升序排序,再依次合并:若当前起点不晚于上一段的终点,就用 <code>max</code> 扩展终点;否则新开一段。注意这里排的是<b>左端</b>,因为目标是合并而不是筛选 ——
          按右端排的话,互相重叠的区间就不一定挨在一起了。第 1 章主讲,这里作为「排序键怎么选」的对照。
        </>
      ),
    },
  },
  {
    lc: 738,
    title: { en: "Monotone Increasing Digits", zh: "单调递增的数字" },
    d: "medium",
    tags: { en: ["Digits", "Optional"], zh: ["数位", "选做"] },
    hint: {
      en: "Scan from the low end. Where a digit is larger than the one on its right, lower it by one and make everything after it a 9.",
      zh: "从低位往高位扫。哪一位比它右边的大,就把它减一,并把后面全部变成 9。",
    },
    key: {
      en: (
        <>
          Scan i from the last digit down to 1. If{" "}
          <code>d[i−1] &gt; d[i]</code>, do <code>d[i−1]--</code> and remember
          position i. After the scan, set every digit from the remembered
          position onward to 9. Lowering the highest possible digit position by
          the smallest amount, then filling the rest with the largest digit,
          gives the largest number that is still non-decreasing. Example: 332
          becomes 329 after the first fix, then 299 after the second. O(number of
          digits).
        </>
      ),
      zh: (
        <>
          i 从最低位向上扫到第 1 位。若 <code>d[i−1] &gt; d[i]</code>,令 <code>d[i−1]--</code> 并记下位置 i。扫完之后,把记下的位置及其后面的所有数位统统置为 9。在尽量高的位上只减最小的量,再把后面填成最大的数字,得到的就是不超过原数、且单调不减的最大值。例:332 第一次修正成 329,第二次修正后变成 299。O(位数)。
        </>
      ),
    },
  },
  {
    lc: 402,
    title: { en: "Remove K Digits", zh: "移掉 K 位数字" },
    d: "medium",
    tags: { en: ["Monotonic stack", "Optional"], zh: ["单调栈", "选做"] },
    hint: {
      en: "Scan left to right with a stack. When the new digit is smaller than the top, the top is a large digit sitting in a high position.",
      zh: "从左往右配一个栈。新数字比栈顶小时,栈顶就是一个「占着高位的大数字」。",
    },
    key: {
      en: (
        <>
          Keep a non-decreasing stack. While the current digit is smaller than
          the top and you still have removals left, pop. Removing a larger digit
          from a higher position lowers the number more than any later removal
          could, because digit position outweighs digit value. When the removal
          budget is used up, stop popping; at the end drop leading zeros and
          remove any remaining budget from the tail. O(n). The stack structure
          itself is covered in DataData chapter 04 (Stack); here it carries the
          greedy idea.
        </>
      ),
      zh: (
        <>
          维护一个单调不减栈:当前数字比栈顶小、且删除额度还有剩,就弹栈。把高位上的较大数字删掉,比删任何低位的数字都更能压小整个数 ——
          因为数位的权重高于数字本身的大小。额度用完就停止弹栈,最后处理前导零、并把没用完的额度从末尾扣掉。O(n)。单调栈这个结构在 DataData 第 4 章(栈)讲过,这里用的是它承载的贪心思想。
        </>
      ),
    },
  },
  {
    lc: 135,
    title: { en: "Candy", zh: "分发糖果" },
    d: "hard",
    tags: { en: ["Two passes", "Constraints"], zh: ["两次遍历", "约束"] },
    hint: {
      en: "Each child is constrained by the left neighbor and by the right neighbor. Handle one direction per pass.",
      zh: "每个孩子同时被左邻和右邻约束 —— 一次遍历只处理一个方向。",
    },
    key: {
      en: (
        <>
          Give everyone 1 candy. Left to right: if{" "}
          <code>r[i] &gt; r[i−1]</code>, set{" "}
          <code>candy[i] = candy[i−1] + 1</code>. Right to left: if{" "}
          <code>r[i] &gt; r[i+1]</code>, set{" "}
          <code>candy[i] = max(candy[i], candy[i+1] + 1)</code>. Each pass
          produces the smallest values that satisfy one side, so both are lower
          bounds for any valid answer, and their maximum is a lower bound too.
          That maximum is itself valid, so it is the pointwise smallest valid
          assignment and therefore has the smallest total. Splitting a two-sided
          constraint into two one-directional passes is the reusable trick here.
          O(n).
        </>
      ),
      zh: (
        <>
          每人先发 1 颗。左 → 右:若 <code>r[i] &gt; r[i−1]</code>,令{" "}
          <code>candy[i] = candy[i−1] + 1</code>。右 → 左:若{" "}
          <code>r[i] &gt; r[i+1]</code>,令{" "}
          <code>candy[i] = max(candy[i], candy[i+1] + 1)</code>。每一遍给出的都是「只满足一侧约束」的最小值,因此两者都是任何合法方案的下界,取 max 之后仍是下界;而这个 max 本身是合法的,所以它就是逐位最小的合法方案,总和自然最小。「双向约束拆成两次单向扫描」是这里真正值得带走的方法。O(n)。
        </>
      ),
    },
  },
  {
    lc: 968,
    title: { en: "Binary Tree Cameras", zh: "监控二叉树" },
    d: "hard",
    tags: { en: ["Tree greedy", "Optional"], zh: ["树形贪心", "选做"] },
    hint: {
      en: "A camera on a leaf covers two nodes. The same camera on the leaf's parent covers three. Work bottom up.",
      zh: "摄像头装在叶子上只盖 2 个点,装在叶子的父节点上盖 3 个 —— 所以自底向上处理。",
    },
    key: {
      en: (
        <>
          Post-order traversal with three states per node: not covered, covered
          without a camera, has a camera. If any child is not covered, this node
          must take a camera. If any child has a camera, this node is covered.
          Otherwise this node is not covered and is left to its parent. The
          greedy step is to delay every camera to the highest node that still
          works, because a camera placed higher covers a parent, a node, and its
          children. Remember to check the root at the end. O(n).
        </>
      ),
      zh: (
        <>
          后序遍历,每个节点三种状态:未被覆盖 / 已覆盖但没装摄像头 / 装了摄像头。只要有孩子未被覆盖,本节点就必须装摄像头;有孩子装了摄像头,本节点就被覆盖;否则本节点保持「未被覆盖」,交给父节点处理。贪心之处在于把每个摄像头尽量往上推 ——
          装在更高的节点能同时覆盖父节点、自己和孩子。最后别忘了检查根节点。O(n)。
        </>
      ),
    },
  },
];
