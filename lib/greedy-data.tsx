// 第 6 章 · 贪心 —— 题单与测验数据。
// 题单覆盖 lc.md 贪心主线(交换论证 / 序列 / 跳跃 / 模拟 / 区间),由易到难;
// hint 只给方向不剧透,key 用一段话把最优解讲透。复盘题(在别章主讲)标 tag「复盘」。
// 双语:title / tags / hint / key 都是 Loc<…>,直接写 { en, zh }。

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

export const PROBLEMS: Problem[] = [
  {
    lc: 455,
    title: { en: "Assign Cookies", zh: "分发饼干" },
    d: "easy",
    tags: {
      en: ["exchange argument", "sorting", "core"],
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
          双方排序,再用双指针:把当前最小的饼干给胃口最小的未满足孩子。
          如果这块饼干喂不动他,那它对谁都不够用,直接丢掉。
          正确性靠<b>交换论证</b>:任取一个最优解,把它改写成「第一步和贪心一致」的样子,
          且满足的孩子数不减少。总复杂度由排序决定:O(n log n)。
          §02 有逐帧动画和完整证明。
        </>
      ),
    },
  },
  {
    lc: 860,
    title: { en: "Lemonade Change", zh: "柠檬水找零" },
    d: "easy",
    tags: {
      en: ["simulation", "which bill to spend"],
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
          维护两个计数:手里有几张 5、几张 10。收 5 不用找;收 10 找一张 5;
          收 20 可以找 10 + 5 或 5 + 5 + 5,优先前者。
          为什么这样不吃亏:选 10 + 5 之后,你比另一种选法多两张 5、少一张 10。
          如果后面某位顾客需要那张你已经没有的 10,你可以改用 5 + 5 + 5 去找他,
          代价正好是多出来的那两张 5。所以优先出 10 不会把本来能做到的情况变成失败。
          O(n)、O(1)。
        </>
      ),
    },
  },
  {
    lc: 1005,
    title: {
      en: "Maximize Sum Of Array After K Negations",
      zh: "K 次取反后最大化数组和",
    },
    d: "easy",
    tags: {
      en: ["sorting", "two phases", "optional"],
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
          排序后从最负的数开始翻正:每翻一个负数,总和增加 2|x|,而最负的数收益最大。
          若 K 先用完,就结束了。若负数翻完 K 还有剩:偶数次多余的翻转互相抵消,
          奇数次则必须付出一次代价。把这一次花在<b>绝对值最小</b>的元素上 ——
          这次翻转会让总和减少 2|x|,自然要挑最小的 |x|。
          两段贪心:先拿最大收益,再把躲不掉的损失压到最小。
        </>
      ),
    },
  },
  {
    lc: 376,
    title: { en: "Wiggle Subsequence", zh: "摆动序列" },
    d: "medium",
    tags: {
      en: ["sequence greedy", "direction changes"],
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
          把数组切成若干「只升」或「只降」的极大单调段,相等的相邻元素忽略。
          每段只保留端点、删掉段内的点,摆动长度不会变短 ——
          所以有 k 段时,答案就是 k + 1。写成代码就是两个计数器:
          <code>up</code> 表示以「上升」结尾的最长摆动长度,<code>down</code>{" "}
          表示以「下降」结尾的最长长度。遇到上升令 <code>up = down + 1</code>,
          遇到下降令 <code>down = up + 1</code>,相等则都不动。O(n)。
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
      en: ["sequence greedy", "stock", "two views"],
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
          贪心:<code>profit += max(0, p[i] − p[i−1])</code>。
          为什么最优,分两步。其一,任何一次「第 i 天买、第 j 天卖」的收益{" "}
          <code>p[j] − p[i]</code> 等于这段区间内全部相邻差之和,
          因此不超过区间内<i>正</i>差之和;而多次交易的持仓区间互不重叠,
          每个差值最多被算一次,所以 <code>Σ max(0, Δ)</code>{" "}
          是任何策略都超不过的上界。其二,「每个上涨日都买卖一次」恰好取到这个上界,
          所以它就是最优解。同一答案也能用状态机 DP(持有 / 空仓)得到,第 10 章主讲。
        </>
      ),
    },
  },
  {
    lc: 53,
    title: { en: "Maximum Subarray", zh: "最大子数组和" },
    d: "medium",
    tags: {
      en: ["sequence greedy", "Kadane", "review"],
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
          justify it. Chapter 07 is where this is taught in full; here it is a
          review.
        </>
      ),
      zh: (
        <>
          Kadane:<code>cur = max(nums[i], cur + nums[i])</code>,全程记录最大的{" "}
          <code>cur</code>。贪心读法是「负的前缀只会拖后腿,不如从当前元素重新开始」;
          DP 读法是「<code>cur</code> 表示以下标 i 结尾的最大子数组和」。
          同一行代码,两种解释。第 7 章主讲,这里只作复盘。
        </>
      ),
    },
  },
  {
    lc: 55,
    title: { en: "Jump Game", zh: "跳跃游戏" },
    d: "medium",
    tags: { en: ["jump", "reach"], zh: ["跳跃", "覆盖范围"] },
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
          从左往右扫,维护 <code>reach = max(reach, i + nums[i])</code>。
          不变量是:当扫描走到下标 i 且 <code>i ≤ reach</code> 时,
          0 到 i 的每个下标都能从 0 号到达,而 <code>reach</code>{" "}
          是「只用 0..i 这些格子起跳」所能到达的最远下标。因此一旦{" "}
          <code>i &gt; reach</code>,i 号就不可达;又因为只能往前走,
          它后面的格子也都不可达,返回 false。扫完时若{" "}
          <code>reach ≥ n − 1</code>,末尾可达。O(n)、O(1)。
        </>
      ),
    },
  },
  {
    lc: 45,
    title: { en: "Jump Game II", zh: "跳跃游戏 II" },
    d: "medium",
    tags: { en: ["jump", "featured", "BFS in O(1) space"], zh: ["跳跃", "精讲", "BFS 压缩"] },
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
          <code>curEnd</code> 恰好是「k 跳能到的最远下标」,
          所以第一个包含 n − 1 的层数就是最少跳数。
          它等价于在同一张图上做 BFS,只是把队列换成了两个整数。
          O(n)、O(1)。§04 有逐帧动画。
        </>
      ),
    },
  },
  {
    lc: 134,
    title: { en: "Gas Station", zh: "加油站" },
    d: "medium",
    tags: { en: ["simulation", "choosing a start"], zh: ["模拟", "起点选择"] },
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
          累加进 <code>tank</code>。如果走到 i 之后 <code>tank &lt; 0</code>,
          那么当前候选起点 a 到 i 之间的任何一站 c 也不可能是答案:
          因为从 a 到 c − 1 的部分和一直 ≥ 0,所以从 c 到 i 的和不超过从 a 到 i 的和,
          而后者是负的 —— 从 c 出发最迟到 i 也会断油。于是把候选起点设为 i + 1、
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
    tags: { en: ["sorting", "insertion", "advanced"], zh: ["排序", "模拟", "进阶"] },
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
          按身高降序排序,同身高时 k 升序;然后把每个人依次插入结果列表的下标 k 处。
          正确性在于:已经排好的人都不比当前这个人矮,
          所以插入一个更矮的人不会改变任何已排好的人前面「不比他矮的人数」;
          而新插入的人前面恰好有 k 个这样的人。
          「先固定影响最大的维度,再安排次要维度」是排序 + 贪心的经典配方。
          因为要做列表插入,复杂度 O(n²)。
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
    tags: { en: ["intervals", "sort by end"], zh: ["区间贪心", "右端排序"] },
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
          的气球都被穿爆。遇到 <code>start &gt; x</code> 的气球就换新箭,
          射在它自己的右端。论证和 LC 435 同款:
          射在「尽量早的端点」不会比射得更晚穿爆更少的气球,
          所以交换论证能把任何一组最优的箭改写成这一组。O(n log n)。
        </>
      ),
    },
  },
  {
    lc: 435,
    title: { en: "Non-overlapping Intervals", zh: "无重叠区间" },
    d: "medium",
    tags: { en: ["intervals", "featured", "sort by end"], zh: ["区间贪心", "精讲", "右端排序"] },
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
          solution can be rewritten to start with it. Sorting by start time or by
          shortest length is not optimal. O(n log n). Section 06 walks through
          the timeline.
        </>
      ),
      zh: (
        <>
          按右端排序。若当前区间的起点不早于「上一个保留区间」的终点就保留,
          否则删掉。答案 = 总数 − 保留数。按结束时间排序正是最优性的来源:
          在所有区间里,结束最早的那个给后面留下的时间最多,
          而交换论证说明任何最优解都能改写成以它开头。
          按起点排序或按长度排序都不是最优的。O(n log n)。§06 有时间轴动画。
        </>
      ),
    },
  },
  {
    lc: 763,
    title: { en: "Partition Labels", zh: "划分字母区间" },
    d: "medium",
    tags: { en: ["intervals", "advanced"], zh: ["区间贪心", "进阶"] },
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
          先记下每个字母最后出现的下标。然后遍历,把当前段的右边界扩到
          「段内已见字母的最远出现位置」。当扫描位置等于这个右边界时,切一刀。
          此刻段内所有字母都不会再出现在后面,所以这一刀合法;
          而在第一个合法位置切能分出最多段,因为任何合法的切点都不会更早。O(n)。
        </>
      ),
    },
  },
  {
    lc: 56,
    title: { en: "Merge Intervals", zh: "合并区间" },
    d: "medium",
    tags: { en: ["intervals", "sort by start", "review"], zh: ["区间贪心", "左端排序", "复盘"] },
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
          按左端升序排序,再依次合并:若当前起点不晚于上一段的终点,
          就用 <code>max</code> 扩展终点;否则新开一段。
          注意这里排的是<b>左端</b>,因为目标是合并而不是筛选 ——
          按右端排的话,互相重叠的区间就不一定挨在一起了。
          第 1 章主讲,这里作为「排序键怎么选」的对照。
        </>
      ),
    },
  },
  {
    lc: 738,
    title: { en: "Monotone Increasing Digits", zh: "单调递增的数字" },
    d: "medium",
    tags: { en: ["digits", "optional"], zh: ["贪心", "数位", "选做"] },
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
          i 从最低位向上扫到第 1 位。若 <code>d[i−1] &gt; d[i]</code>,
          令 <code>d[i−1]--</code> 并记下位置 i。扫完之后,
          把记下的位置及其后面的所有数位统统置为 9。
          在尽量高的位上只减最小的量,再把后面填成最大的数字,
          得到的就是不超过原数、且单调不减的最大值。
          例:332 第一次修正成 329,第二次修正后变成 299。O(位数)。
        </>
      ),
    },
  },
  {
    lc: 402,
    title: { en: "Remove K Digits", zh: "移掉 K 位数字" },
    d: "medium",
    tags: { en: ["monotonic stack", "optional"], zh: ["贪心", "单调栈", "选做"] },
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
          itself is covered in DataData chapter 03; here it carries the greedy
          idea.
        </>
      ),
      zh: (
        <>
          维护一个单调不减栈:当前数字比栈顶小、且删除额度还有剩,就弹栈。
          把高位上的较大数字删掉,比删任何低位的数字都更能压小整个数 ——
          因为数位的权重高于数字本身的大小。额度用完就停止弹栈,
          最后处理前导零、并把没用完的额度从末尾扣掉。O(n)。
          单调栈这个结构在 DataData 第 3 章讲过,这里用的是它承载的贪心思想。
        </>
      ),
    },
  },
  {
    lc: 135,
    title: { en: "Candy", zh: "分发糖果" },
    d: "hard",
    tags: { en: ["two passes", "constraints"], zh: ["模拟", "两次遍历"] },
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
          <code>candy[i] = max(candy[i], candy[i+1] + 1)</code>。
          每一遍给出的都是「只满足一侧约束」的最小值,
          因此两者都是任何合法方案的下界,取 max 之后仍是下界;
          而这个 max 本身是合法的,所以它就是逐位最小的合法方案,总和自然最小。
          「双向约束拆成两次单向扫描」是这里真正值得带走的招式。O(n)。
        </>
      ),
    },
  },
  {
    lc: 968,
    title: { en: "Binary Tree Cameras", zh: "监控二叉树" },
    d: "hard",
    tags: { en: ["tree greedy", "optional"], zh: ["树形贪心", "选做"] },
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
          后序遍历,每个节点三种状态:未被覆盖 / 已覆盖但没装摄像头 / 装了摄像头。
          只要有孩子未被覆盖,本节点就必须装摄像头;有孩子装了摄像头,本节点就被覆盖;
          否则本节点保持「未被覆盖」,交给父节点处理。
          贪心之处在于把每个摄像头尽量往上推 ——
          装在更高的节点能同时覆盖父节点、自己和孩子。最后别忘了检查根节点。O(n)。
        </>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "A greedy algorithm returns an optimal answer only when the problem has which two properties?",
      zh: "贪心算法能得到最优解,依赖的核心性质是?",
    },
    opts: {
      en: [
        "The greedy-choice property (a locally best choice is part of some optimal solution) and optimal substructure (what is left after that choice is the same kind of problem)",
        "The input must already be sorted",
        "The subproblems are independent and can be solved separately",
        "The subproblems overlap heavily, and past choices do not affect the future",
      ],
      zh: [
        "贪心选择性质(当下最优的那个选择,存在于某个最优解中)+ 最优子结构(选完之后剩下的仍是同类问题)",
        "输入数据必须已经有序",
        "子问题互相独立,可以分别求解",
        "存在重叠子问题,且无后效性",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Sorted input is not a condition. Many greedy solutions sort the input themselves as their first step (455, 435, 452). Sorting is a common preparation, not a requirement.",
        "Independent subproblems is the signal for divide and conquer, where the two halves never interact. Greedy does not split the problem into subproblems at all; it makes one choice and moves on.",
        "Overlapping subproblems is the signal for dynamic programming, because storing results pays off there. Greedy never revisits a subproblem. The second half of this option is fine, but the part that matters, the greedy-choice property, is missing.",
      ],
      zh: [
        undefined,
        "有序不是前提 —— 很多贪心的第一步恰恰是自己排序(455 / 435 / 452)。有序只是常见的预处理,不是成立条件。",
        "「子问题独立」是分治的标志(归并的两半互不打扰)。贪心根本不把问题拆成子问题,它只是做一个选择然后往前走。",
        "「重叠子问题」是动态规划的信号 —— 那说明记账有利可图。贪心从不回头重算子问题。无后效性说对了一半,缺的正是关键的贪心选择性质。",
      ],
    },
    why: {
      en: "Greedy needs the greedy-choice property plus optimal substructure. The first one is what separates greedy from DP: you may commit to one choice only if you can show that some optimal solution contains it. If you cannot show it, use DP.",
      zh: "贪心 = 贪心选择性质 + 最优子结构。前者是贪心区别于 DP 的命门:只有能证明「某个最优解包含这个选择」,才敢一步定终身;证不出来就退回 DP。",
    },
  },
  {
    type: "choice",
    q: {
      en: "What does an exchange argument actually prove?",
      zh: "「交换论证(exchange argument)」在贪心正确性证明里,到底证明了什么?",
    },
    opts: {
      en: [
        "That some optimal solution can be rewritten step by step into the greedy solution, and no single rewrite makes it worse, so the greedy solution is optimal too",
        "That the greedy solution is identical, element by element, to one unique optimal solution",
        "That greedy runs faster than brute force",
        "That swapping any two elements of the array leaves the answer unchanged",
      ],
      zh: [
        "存在一个最优解可以一步步改写成贪心解,且每次改写都不会变差 —— 所以贪心解也是最优的",
        "贪心解一定和某个唯一的最优解逐位完全相同",
        "贪心的时间复杂度低于暴力枚举",
        "数组里任意两个元素交换位置后,答案都不变",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "There can be several optimal solutions, and the argument does not claim the greedy answer matches any particular one. It only shows the greedy answer scores as well as an optimal one.",
        "That is complexity analysis, not a correctness proof. An exchange argument answers whether the result is right, not how fast it is produced.",
        "The exchange is between one choice inside an optimal solution and the choice greedy makes. It is not a statement about swapping array elements.",
      ],
      zh: [
        undefined,
        "最优解可能不止一个,交换论证也不要求贪心解等于某个特定最优解 —— 它只证明贪心解的得分和最优解一样好。",
        "那是复杂度分析,不是正确性证明。交换论证只回答「对不对」,不回答「快不快」。",
        "交换的是「最优解里的某个选择」和「贪心的选择」,证明替换后不更差 —— 不是说随便交换数组元素答案不变。",
      ],
    },
    why: {
      en: "An exchange argument is induction in disguise. Assume an optimal solution disagrees with greedy at the first step, replace that step with the greedy choice without making the solution worse, then repeat on what is left. The conclusion is that greedy is optimal.",
      zh: "交换论证是数学归纳法换了件外衣:假设某个最优解在第一步和贪心不同,就把那一步换成贪心的选择而不变差,再对剩下的部分重复同样的论证。结论是贪心全程最优。",
    },
  },
  {
    type: "choice",
    q: {
      en: "LC 455 Assign Cookies, with appetite array g and cookie size array s. Which greedy rule is correct?",
      zh: "LC 455 分发饼干(胃口数组 g,饼干尺寸数组 s),下面哪种贪心策略是对的?",
    },
    opts: {
      en: [
        "Sort both arrays, and give each child the smallest remaining cookie that satisfies him; if it does not, discard that cookie and try a larger one",
        "Do not sort, and hand out cookies to children in random order",
        "Sort only the appetites, leave the cookies unsorted, and hand them out in the given order",
        "Give the largest cookie to the child with the smallest appetite",
      ],
      zh: [
        "双方都排序,用「刚好能满足当前孩子的最小饼干」去喂他,喂不动就丢掉这块换更大的",
        "不排序,把饼干随机分给孩子",
        "只排序孩子的胃口,饼干不排序,依次发放",
        "优先用最大的饼干去喂胃口最小的孩子",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Random assignment has no optimality guarantee. The greedy rule depends on both arrays being sorted, and on always using the smallest cookie that is still large enough.",
        "Sorting one side is not enough. With unsorted cookies you cannot guarantee that the cookie you hand out is the smallest usable one, so a large cookie may be spent on a small appetite while a hungrier child gets nothing.",
        "A large cookie on a small appetite is exactly the waste to avoid. The child with the smallest appetite is satisfied by the smallest usable cookie, and the large cookie should be saved for a child who is harder to satisfy.",
      ],
      zh: [
        undefined,
        "随机分配没有任何最优性保证 —— 贪心的前提是双方都有序,而且每次都用「刚好够」的那块饼干。",
        "只排一边不够:饼干不排序就无法保证发出去的是「最小的可用饼干」,可能拿大饼干喂了小胃口,把更难满足的孩子饿着。",
        "大饼干喂小胃口正是要避免的浪费 —— 胃口最小的孩子用最小的可用饼干就能满足,大饼干应该留给更难满足的人。方向反了。",
      ],
    },
    why: {
      en: "After sorting both sides, giving the smallest usable cookie to the child with the smallest appetite wastes nothing, and an exchange argument shows this choice appears in some optimal assignment. Section 02 has the animation and the proof.",
      zh: "双方排序后,让最小的可用饼干去满足胃口最小的孩子不会造成浪费;交换论证说明这个选择存在于某个最优解中。§02 有逐帧动画和完整证明。",
    },
  },
  {
    type: "multi",
    q: {
      en: "For which of these problems is sorting the intervals by right endpoint the correct choice? (Select all)",
      zh: "下面哪些题,「按区间右端点排序」是正确的选择?(多选)",
    },
    opts: {
      en: [
        "LC 435 Non-overlapping Intervals (delete the fewest intervals so the rest do not overlap)",
        "LC 452 Minimum Number of Arrows to Burst Balloons",
        "LC 56 Merge Intervals",
        "LC 763 Partition Labels",
      ],
      zh: [
        "LC 435 无重叠区间(删最少的区间,使剩下的互不重叠)",
        "LC 452 用最少数量的箭引爆气球",
        "LC 56 合并区间",
        "LC 763 划分字母区间",
      ],
    },
    correct: [0, 1],
    missHint: {
      en: "Sorting by end time belongs to selection problems: keep the most, or cover with the fewest. Ask what 435 and 452 have in common.",
      zh: "按结束时间排序属于「筛选」类问题:保留最多,或用最少的东西覆盖。想想 435 和 452 的共同目标。",
    },
    extraHint: {
      en: "One of your picks merges intervals or cuts a string into parts. Merge Intervals sorts by start, and Partition Labels does not sort intervals at all; it uses the last index of each letter.",
      zh: "你选中的项里有一道是「合并」或「按下标分段」的:合并区间按左端排,划分字母区间根本不对区间排序,它用的是每个字母最后出现的位置。",
    },
    why: {
      en: "When the goal is to keep the most non-overlapping intervals, or to cover them with the fewest arrows, sort by right endpoint and always take the one that ends earliest, because it leaves the most room for the rest. LC 56 merges, so it sorts by start. LC 763 works from the last index of each letter. Short version: selecting looks at the end, merging looks at the start.",
      zh: "目标是「保留最多不重叠区间」或「用最少的箭覆盖」时,按右端排序、优先取结束最早的那个,因为它给后面留下的空间最大。LC 56 是合并,按左端排;LC 763 靠每个字母最后出现的位置分段。一句话:筛选看右端,合并看左端。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In LC 45 Jump Game II, when should the greedy scan increase the jump counter?",
      zh: "LC 45 跳跃游戏 II 用贪心求最少步数,jumps 计数应该在什么时候 +1?",
    },
    opts: {
      en: [
        "When index i reaches curEnd, the last index reachable with the jumps taken so far; then set curEnd to farthest",
        "Once for every index the scan visits",
        "Every time nums[i] > 0",
        "Once at the end, when i reaches the last index",
      ],
      zh: [
        "当下标 i 走到 curEnd(已跳步数内能到的最远下标)时 +1,并把 curEnd 更新为 farthest",
        "每访问一个下标就 +1",
        "每当 nums[i] > 0 就 +1",
        "等 i 到达最后一个下标时,一次性结算出来",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "That counts visited cells, not jumps. One jump can cross many cells, so counting per cell badly overestimates the answer.",
        "Whether nums[i] is positive says nothing about whether you should land there. The scan looks ahead inside the current range and jumps only when the range is used up.",
        "The count cannot wait until the end. Each time the current range is used up, one more jump has become necessary, and that is the only moment when you know it.",
      ],
      zh: [
        undefined,
        "那是在数「访问了几格」,不是「跳了几次」—— 一跳可以跨过很多格,逐格计数会大大高估步数。",
        "nums[i] 是不是正数,和「要不要在这里落脚起跳」无关。贪心是在当前范围内探路,范围用尽时才跳。",
        "步数不能等到最后再算:每当当前范围用尽,就确定又必须多跳一次,而那一刻正是唯一能确定它的时机。",
      ],
    },
    why: {
      en: "Think of the indices reachable in k jumps as layer k. When i reaches curEnd, layer k is finished, so one more jump is needed and the new boundary is farthest, the last index reachable in k + 1 jumps. That is breadth-first search with the queue replaced by two integers.",
      zh: "把「k 跳能到的下标」看成第 k 层。i 走到 curEnd 说明这一层走完了,必须再跳一次,而新边界就是 farthest —— k + 1 跳能到的最远下标。这就是把 BFS 的队列换成两个整数。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          Intervals [[1,4], [2,3], [3,5], [6,8], [7,9]]. What is the smallest
          number of intervals you must remove so that the rest do not overlap?
          (Sort by right endpoint and work through it by hand.)
        </>
      ),
      zh: (
        <>
          区间 [[1,4], [2,3], [3,5], [6,8], [7,9]],至少删掉几个区间,
          才能让剩下的互不重叠?(按右端排序后逐个贪心保留,手推一遍)
        </>
      ),
    },
    placeholder: { en: "Type a whole number…", zh: "输入一个整数…" },
    answers: ["2", "2个", "two"],
    hint: {
      en: "Sorted by end: [2,3], [1,4], [3,5], [6,8], [7,9]. Keep [2,3] (end = 3). [1,4] starts at 1, which is before 3, so remove it. [3,5] starts at 3, so keep it. Continue and count how many you kept.",
      zh: "按右端排序 → [2,3], [1,4], [3,5], [6,8], [7,9]。保留 [2,3](end = 3);[1,4] 起点 1 早于 3,删掉;[3,5] 起点 3,保留…… 继续数保留了几个。",
    },
    why: {
      en: "You keep [2,3], [3,5], and [6,8], which is 3 intervals, and remove [1,4] and [7,9]. Removals = 5 − 3 = 2. This is the same example used in the timeline animation in section 06.",
      zh: "保留 [2,3]、[3,5]、[6,8] 共 3 个,删掉 [1,4]、[7,9] 共 2 个。删除数 = 5 − 3 = 2。这正是 §06 时间轴动画里用的例子。",
    },
  },
  {
    type: "choice",
    q: {
      en: "LC 122 adds up every rise between two consecutive days. Why is that optimal?",
      zh: "LC 122 买卖股票 II 的贪心「累加所有相邻上涨差价」,为什么正确?",
    },
    opts: {
      en: [
        "Any multi-day rise equals the sum of its day-to-day differences, so the sum of all positive differences is an upper bound that trading on every rising day reaches exactly",
        "Because the price goes up every day",
        "Because you may hold at most one share, and greedy happens to sidestep that rule",
        "Because greedy is faster than DP, so it must be right",
      ],
      zh: [
        "任何一段多日上涨都等于其中相邻差之和,所以「全部正差之和」是一个上界,而「每个上涨日都交易一次」恰好取到它",
        "因为股票每天都在涨",
        "因为规则限制只能持有一股,贪心恰好绕过了这个限制",
        "因为贪心比 DP 快,所以一定对",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Prices do fall. On a falling day the difference is negative, and max(0, Δ) skips it. The claim is about which gains are reachable, not about the direction of the market.",
        "The one-share rule is handled by the fact that you may sell and buy again on the same day. That explains why the schedule is legal, but it is not the reason the total is optimal.",
        "Speed and correctness are different questions. Greedy is correct here because of the upper-bound argument. On coins [1, 3, 4] the same kind of greedy is fast and wrong.",
      ],
      zh: [
        undefined,
        "股票当然会跌 —— 下跌那天差价是负的,max(0, Δ) 会跳过它。这里说的是「能赚到多少」的上界,不是行情方向。",
        "「只能持有一股」是靠「当天卖出后可以立刻再买」化解的。那解释了这个交易安排为什么合法,但不是收益最优的原因。",
        "快慢和对错是两码事。这里贪心正确是因为上界论证成立;换成硬币 [1, 3, 4],同类贪心又快又错。",
      ],
    },
    why: {
      en: "A trade from day i to day j earns p[j] − p[i], which is the sum of the day-to-day differences in that range, so it is at most the sum of the positive ones. Trades do not overlap, so every difference is used at most once. Buying and selling on each rising day reaches that bound, so nothing is left on the table. The state machine DP in chapter 10 gives the same number from another angle.",
      zh: "第 i 天买、第 j 天卖的收益 p[j] − p[i],等于这段区间内相邻差之和,因此不超过其中正差之和;而多次交易的区间互不重叠,每个差值最多用一次。「每个上涨日都交易一次」恰好取到这个上界,一分不少。第 10 章的状态机 DP 会从另一个角度给出同一个数。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Coins [1, 3, 4], amount 6. Greedy (always take the largest coin that fits) gives 4 + 1 + 1 = 3 coins; the best answer is 3 + 3 = 2 coins. What is the right conclusion?",
      zh: "硬币 [1, 3, 4] 凑金额 6:贪心(每次拿能用的最大面额)得 4 + 1 + 1 = 3 枚,最优是 3 + 3 = 2 枚。正确的结论是?",
    },
    opts: {
      en: [
        "This coin set does not have the greedy-choice property: taking the 4 first rules out the best answer, so you need DP, which tries every last coin and stores the results",
        "Greedy is a broken technique and should not be used",
        "Sorting the coins from large to small would fix it",
        "DP is used instead because DP guesses better than greedy",
      ],
      zh: [
        "这套面额不满足贪心选择性质:先拿 4 直接排除了最优解,所以要退回 DP —— 枚举最后一枚硬币的所有可能并把结果记下来",
        "贪心算法本身是错的,以后都不该用",
        "只要把硬币从大到小排序就能修好",
        "换成 DP 是因为 DP 比贪心更会碰运气",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Greedy is not broken; it was applied where its condition does not hold. In this same chapter, 860 and 435 are greedy and provably optimal. The difference is whether you can prove the greedy-choice property.",
        "Taking from large to small is exactly what greedy already does here, and it still returns 3 coins. The problem is not the order; it is that for this coin set, a locally best choice is not part of any best answer.",
        "DP does not guess. dp[a] = min over coins of dp[a − coin] + 1 enumerates every possible last coin, so nothing is missed. That is exhaustive search with stored results, not luck.",
      ],
      zh: [
        undefined,
        "贪心没错,是用错了地方 —— 同一章的 860、435 都是贪心,而且可以证明最优。区别只在于能不能证明贪心选择性质。",
        "从大到小拿正是这里的贪心做法,结果还是 3 枚。问题不在排序,而在于对这套面额,当下最优的选择不属于任何最优解。",
        "DP 不靠运气:dp[a] = min(dp[a − coin]) + 1 枚举了「最后一枚硬币是谁」的所有可能,数学上保证不漏。这叫穷举 + 记账,不叫运气。",
      ],
    },
    why: {
      en: "The rule this chapter leaves you with: prove the exchange argument and you may be greedy; fail to prove it and use DP. On coins [1, 3, 4] the greedy-choice property does not hold, so the problem goes to DP. Note that the same greedy is optimal for other coin sets, such as 1, 5, 10, 25. Chapter 07 opens with exactly this example.",
      zh: "本章留给你的判据:能证明交换论证就贪,证不出就用 DP。硬币 [1, 3, 4] 上贪心选择性质不成立,于是交给 DP。注意同一种贪心在别的面额上是最优的,比如 1、5、10、25。第 7 章的开场用的正是这个例子。",
    },
  },
];
