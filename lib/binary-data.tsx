// 第 3 章 · 二分进阶 —— 题单与测验数据。
// 题单覆盖 lc.md 主线的二分进阶题(找边界 / 二段性 / 二分答案),由易到难;
// hint 只给方向不剧透,key 用一段话把最优解讲透。
// 双语:所有文案都是 Loc<…>,英文为默认。题名用 LeetCode 官方中英标题。

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

export const PROBLEMS: Problem[] = [
  {
    lc: 704,
    title: { en: "Binary Search", zh: "二分查找" },
    d: "easy",
    tags: { en: ["Template", "Review"], zh: ["模板", "复盘"] },
    hint: {
      en: "A sorted array and one exact value. This is the base template for the whole chapter: choose an interval convention first, then make the loop condition match it.",
      zh: "有序数组找定值 —— 全章二分的地基模板。先定区间约定,再让循环条件与之匹配。",
    },
    key: {
      en: (
        <>
          Closed interval [lo, hi] means both ends are still candidates. That
          interval is non-empty exactly when lo &lt;= hi, so that is the loop
          condition. mid = lo + (hi − lo) / 2 rounds down and always lands inside
          the interval. If nums[mid] &lt; target, then mid and everything to its
          left are ruled out, so lo = mid + 1. If nums[mid] &gt; target, then hi =
          mid − 1. Every branch removes at least the element at mid, so hi − lo
          strictly decreases and the loop ends. The invariant is: if target is in
          the array, its index is still inside [lo, hi]. Time O(log n), extra
          space O(1) iteratively and O(log n) for the call stack if you write it
          recursively.
        </>
      ),
      zh: (
        <>
          闭区间 [lo, hi] 表示两个端点都仍是候选。区间非空当且仅当 lo ≤ hi,
          所以循环条件就是 lo ≤ hi。mid = lo + (hi − lo) / 2 向下取整,
          永远落在区间内。nums[mid] &lt; target 时,mid 及其左边全部出局 → lo = mid + 1;
          nums[mid] &gt; target 时 hi = mid − 1。每个分支都至少删掉 mid 这一格,
          所以 hi − lo 严格变小,循环必然结束。不变量是:若 target 在数组里,
          它的下标一定还在 [lo, hi] 内。时间 O(log n);迭代写法额外空间 O(1),
          递归写法调用栈 O(log n)。
        </>
      ),
    },
  },
  {
    lc: 35,
    title: { en: "Search Insert Position", zh: "搜索插入位置" },
    d: "easy",
    tags: { en: ["Boundaries", "lower_bound"], zh: ["找边界", "lower_bound"] },
    hint: {
      en: "When target is missing you must return the position where it belongs. That is the first index whose value is >= target.",
      zh: "找不到时要返回「该插进去的位置」—— 这不就是第一个 ≥ target 的下标吗?",
    },
    key: {
      en: (
        <>
          The answer is lower_bound(target): the first index whose value is ≥
          target. Use the closed-interval template with a candidate variable.
          When nums[mid] ≥ target, record ans = mid and keep looking further
          left with hi = mid − 1; otherwise lo = mid + 1. Initialize ans to
          nums.length, because when every element is smaller than target the
          answer is one position past the last index. When target is absent, that
          index is exactly where target has to go to keep the array sorted.
        </>
      ),
      zh: (
        <>
          答案就是 lower_bound(target):第一个 ≥ target 的下标。
          用「闭区间 + 一个候选变量」的模板:nums[mid] ≥ target 就记下 ans = mid,
          再用 hi = mid − 1 继续往左找更早的;否则 lo = mid + 1。
          ans 初值取 nums.length —— 当所有元素都比 target 小时,
          答案就是末尾的下一个位置。target 缺席时,这个下标正是它保持有序的插入点。
        </>
      ),
    },
  },
  {
    lc: 278,
    title: { en: "First Bad Version", zh: "第一个错误的版本" },
    d: "easy",
    tags: { en: ["Answer search", "Predicate"], zh: ["二分答案", "判定函数"] },
    hint: {
      en: "isBadVersion is false for a while and then true forever. Find the position where it flips.",
      zh: "isBadVersion 先一路 false、之后一路 true —— 找那个翻转点。",
    },
    key: {
      en: (
        <>
          The versions form a false…false, true…true line for isBadVersion, and
          it never flips back. Finding the first true is lower_bound applied to a
          predicate instead of to a value. That is the bridge from &quot;compare
          with target&quot; to &quot;call a yes/no function&quot;. Version numbers
          can be close to the largest int, so in Java use mid = lo + (hi − lo) /
          2: lo + hi would overflow.
        </>
      ),
      zh: (
        <>
          版本序列对 isBadVersion 是「前一段 false、后一段 true」,而且不会翻回去。
          求第一个 true 的位置,就是把 lower_bound 从「比较值」换成「调用一个判定函数」——
          这是从找边界通往二分答案的桥。版本号可能接近 int 上限,
          所以在 Java 里必须写 mid = lo + (hi − lo) / 2,lo + hi 会溢出。
        </>
      ),
    },
  },
  {
    lc: 69,
    title: { en: "Sqrt(x)", zh: "x 的平方根" },
    d: "easy",
    tags: { en: ["Answer search", "Square root"], zh: ["二分答案", "平方根"] },
    hint: {
      en: "The answer k satisfies k×k <= x. That test is true for small k and false for large k, so look for the last k that passes.",
      zh: "答案 k 满足 k×k ≤ x:小 k 全真、大 k 全假 —— 找最后一个为真的 k。",
    },
    key: {
      en: (
        <>
          Search [0, x] for the largest k with k×k ≤ x. The predicate is
          true…true then false…false, so you want the <b>last</b> true: record
          ans = mid, then move right with lo = mid + 1. In Java, cast before
          multiplying — <code>(long) mid * mid</code> — because mid×mid overflows
          int. In JavaScript the product is a double: it becomes inexact only
          when it is already far larger than x, so the comparison still gives the
          right answer. Python integers are arbitrary precision. Note the mirror
          with LC 875: 875 looks for the first true, this one for the last.
        </>
      ),
      zh: (
        <>
          在 [0, x] 上找满足 k×k ≤ x 的最大 k。谓词是「真…真 假…假」,
          要的是<b>最后一个</b>真:记下 ans = mid,再用 lo = mid + 1 往大试。
          Java 里必须先转型再乘 —— <code>(long) mid * mid</code>,否则 mid×mid 会溢出 int。
          JavaScript 里乘积是双精度浮点:只有当它已经远大于 x 时才不精确,
          比较结果依然正确。Python 整数任意精度。注意它和 875 互为镜像:
          875 找第一个真,这里找最后一个真。
        </>
      ),
    },
  },
  {
    lc: 367,
    title: { en: "Valid Perfect Square", zh: "有效的完全平方数" },
    d: "easy",
    tags: { en: ["Answer search", "Review"], zh: ["二分答案", "复盘"] },
    hint: {
      en: "Same value range as LC 69. Here you need an exact hit rather than the largest k that fits.",
      zh: "和 69 同一个值域,只是这次要精确命中,而不是找最大的可行 k。",
    },
    key: {
      en: (
        <>
          Binary search k in [1, num]. If mid×mid == num return true; if mid×mid
          &lt; num then lo = mid + 1; otherwise hi = mid − 1. Return false once
          the interval is empty. Use <code>(long) mid * mid</code> in Java. There
          is also an arithmetic shortcut: 1+3+5+…+(2i−1) = i², so subtracting
          successive odd numbers from num and landing exactly on 0 proves it is a
          perfect square. Binary search is the general method; the odd-number sum
          is the special trick.
        </>
      ),
      zh: (
        <>
          在 [1, num] 上二分 k:mid×mid == num 返回 true;mid×mid &lt; num 则 lo = mid + 1;
          否则 hi = mid − 1;区间空了返回 false。Java 里用 <code>(long) mid * mid</code>。
          另有一个算术彩蛋:1+3+5+…+(2i−1) = i²,所以从 num 里连减奇数、
          恰好减到 0 就说明它是完全平方数。二分是通法,奇数和是巧法。
        </>
      ),
    },
  },
  {
    lc: 34,
    title: {
      en: "Find First and Last Position of Element in Sorted Array",
      zh: "在排序数组中查找元素的第一个和最后一个位置",
    },
    d: "medium",
    tags: {
      en: ["Boundaries", "lower/upper bound"],
      zh: ["找边界", "lower/upper bound"],
    },
    hint: {
      en: "The left end is the first index >= target. The right end is one before the first index > target.",
      zh: "左边界 = 第一个 ≥ target;右边界 = (第一个 > target) 再退一格。",
    },
    key: {
      en: (
        <>
          left = lower_bound(target). If left == nums.length or nums[left] !=
          target, return [−1, −1]. Otherwise right = lower_bound(target + 1) − 1.
          The values are integers, so &quot;the first index whose value is &gt;
          target&quot; is the same as &quot;the first index whose value is ≥
          target + 1&quot;, and a single function produces both ends. That
          rewrite only works on a discrete type where target + 1 is the next
          possible value. Subtracting the two bounds also tells you how many
          times target occurs. Worked example A in this chapter steps through
          both searches.
        </>
      ),
      zh: (
        <>
          left = lower_bound(target)。若 left == nums.length 或 nums[left] != target,
          返回 [−1, −1];否则 right = lower_bound(target + 1) − 1。
          因为元素是整数,「第一个 &gt; target」等价于「第一个 ≥ target + 1」,
          于是一个函数就能给出两个边界 —— 但这个改写只在 target + 1
          确实是「下一个可能取值」的离散类型上成立。两个边界一减,
          还顺带得到 target 出现了几次。本章精讲 A 有逐帧动画。
        </>
      ),
    },
  },
  {
    lc: 33,
    title: { en: "Search in Rotated Sorted Array", zh: "搜索旋转排序数组" },
    d: "medium",
    tags: {
      en: ["Monotonic split", "Rotated array"],
      zh: ["二段性", "旋转数组"],
    },
    hint: {
      en: "Cut anywhere and at least one of the two halves is still fully sorted. Ask which one, then ask whether target is inside it.",
      zh: "一刀切下去,左右总有一半是完全有序的 —— 先问哪半有序,再问目标在不在里面。",
    },
    key: {
      en: (
        <>
          If nums[mid] == target, return mid. Otherwise decide which half is
          sorted: nums[lo] ≤ nums[mid] means [lo, mid] is sorted, otherwise
          [mid, hi] is. Inside a sorted half a range comparison is reliable, so
          check whether target lies in it. If it does, keep that half; if it does
          not, keep the other one. The problem guarantees distinct values, so the
          test is never ambiguous and the time stays O(log n). Worked example B
          in this chapter steps through it.
        </>
      ),
      zh: (
        <>
          nums[mid] == target 直接返回;否则先判哪半有序:nums[lo] ≤ nums[mid]
          说明 [lo, mid] 有序,否则 [mid, hi] 有序。在有序的那一半里,
          用范围比较判断 target 在不在是可靠的:在,就收进这一半;不在,
          就收进另一半。本题保证元素互不相同,判据永远不会含糊,复杂度稳定 O(log n)。
          本章精讲 B 有逐帧动画。
        </>
      ),
    },
  },
  {
    lc: 81,
    title: {
      en: "Search in Rotated Sorted Array II",
      zh: "搜索旋转排序数组 II",
    },
    d: "medium",
    tags: {
      en: ["Monotonic split", "Duplicates degrade"],
      zh: ["二段性", "重复退化"],
    },
    hint: {
      en: "Duplicates are allowed now. When nums[lo], nums[mid], and nums[hi] are all equal, can you still tell which half is sorted?",
      zh: "现在允许重复:当 nums[lo]、nums[mid]、nums[hi] 三者相等时,你还判得出哪半有序吗?",
    },
    key: {
      en: (
        <>
          Same shape as LC 33, with one extra branch. When nums[lo] ==
          nums[mid] == nums[hi] — for example [1,1,1,0,1] — neither half can be
          shown to be sorted, so the usual fix is lo++ and hi−−, which discards
          only one element from each side. In the worst case that happens on
          almost every step and the time becomes O(n). Understanding why it
          degrades matters more than memorizing the code: duplicates destroy the
          false-then-true split the search depends on.
        </>
      ),
      zh: (
        <>
          骨架同 33,只多一个分支。当 nums[lo] == nums[mid] == nums[hi]
          (例如 [1,1,1,0,1])时,哪半有序都证不出来,通用做法是 lo++、hi−−,
          每侧只丢一个元素。最坏情况下几乎每步都撞上这种局面,时间退化到 O(n)。
          理解「为什么退化」比背代码重要:重复元素破坏了二分赖以成立的
          「前段全否、后段全是」的分界。
        </>
      ),
    },
  },
  {
    lc: 153,
    title: {
      en: "Find Minimum in Rotated Sorted Array",
      zh: "寻找旋转排序数组中的最小值",
    },
    d: "medium",
    tags: {
      en: ["Monotonic split", "Converging form"],
      zh: ["二段性", "收敛型"],
    },
    hint: {
      en: "Compare nums[mid] with the right end nums[hi], not with the left end. That single choice decides which side the minimum is on.",
      zh: "拿 nums[mid] 跟右端点 nums[hi] 比,而不是跟左端点比 —— 这一个选择就决定了最小值在哪半。",
    },
    key: {
      en: (
        <>
          while (lo &lt; hi): if nums[mid] &gt; nums[hi], the minimum is strictly
          to the right, so lo = mid + 1; otherwise hi = mid, because mid itself
          may be the minimum. The interval converges to a single index, which is
          the answer. Compare with nums[hi] and not with nums[lo]: on an array
          that was not actually rotated, such as [1,2,3,4,5], nums[mid] is larger
          than nums[lo], and that test would send the search to the right, away
          from the minimum at index 0.
        </>
      ),
      zh: (
        <>
          while (lo &lt; hi):nums[mid] &gt; nums[hi] 说明最小值严格在右边,lo = mid + 1;
          否则 hi = mid(mid 本身可能就是最小值)。区间收敛到单点,即答案。
          为什么跟 nums[hi] 比而不是 nums[lo]?因为在「实际没有旋转」的数组上
          (如 [1,2,3,4,5]),nums[mid] 比 nums[lo] 大,那个判据会把搜索带向右边,
          而最小值其实在下标 0。
        </>
      ),
    },
  },
  {
    lc: 154,
    title: {
      en: "Find Minimum in Rotated Sorted Array II",
      zh: "寻找旋转排序数组中的最小值 II",
    },
    d: "medium",
    tags: {
      en: ["Monotonic split", "Duplicates degrade"],
      zh: ["二段性", "重复退化"],
    },
    hint: {
      en: "The duplicate version of LC 153. When nums[mid] == nums[hi], neither side can be discarded safely. What is left?",
      zh: "153 的重复版:nums[mid] == nums[hi] 时,砍哪边都不安全,还剩什么办法?",
    },
    key: {
      en: (
        <>
          Same as LC 153, except that nums[mid] == nums[hi] carries no
          information. The search only looks at those two values, and in
          [1,3,3,3] and [3,3,1,3] they are 3 and 3 in both cases — yet the
          minimum sits at index 0 in the first array and at index 2 in the
          second. The only safe move is hi−−, which drops one element and still
          keeps the minimum in range, because the value at hi also appears at
          mid. Worst case O(n).
          Together with LC 81 this is the standard demonstration that duplicates
          break the O(log n) bound.
        </>
      ),
      zh: (
        <>
          同 153,但 nums[mid] == nums[hi] 提供不了任何信息:算法只看这两个值,
          而 [1,3,3,3] 与 [3,3,1,3] 在这两处都是 3 和 3 —— 可最小值一个在下标 0、
          一个在下标 2。唯一安全的动作是 hi−−:只丢一个元素,
          且 hi 处的值在 mid 还有一份,最小值一定仍在区间内。最坏 O(n)。
          它和 81 一起,是「重复元素击穿 O(log n)」的标准演示。
        </>
      ),
    },
  },
  {
    lc: 162,
    title: { en: "Find Peak Element", zh: "寻找峰值" },
    d: "medium",
    tags: {
      en: ["Monotonic split", "Converging form"],
      zh: ["二段性", "收敛型"],
    },
    hint: {
      en: "You do not need the highest value. If nums[mid] < nums[mid+1], a peak must exist somewhere to the right.",
      zh: "不必找全局最高:只要 nums[mid] < nums[mid+1],右边就一定存在一个峰。",
    },
    key: {
      en: (
        <>
          A peak is any index whose value is larger than both neighbours;
          positions outside the array count as negative infinity. while (lo &lt;
          hi): if nums[mid] &lt; nums[mid+1] the values rise at mid, so a peak
          must exist in [mid+1, hi] — either they keep rising up to hi, which is
          then a peak, or they stop rising at some index, which is then a peak.
          So lo = mid + 1. Otherwise hi = mid, since mid itself may be the peak.
          lo &lt; hi forces mid &lt; hi, so mid+1 is always a valid index and hi =
          mid always shrinks the interval. The array is not sorted at all: the
          split comes from the direction of the slope.
        </>
      ),
      zh: (
        <>
          峰值 = 比左右邻居都大的位置,数组外侧视作 −∞。while (lo &lt; hi):
          若 nums[mid] &lt; nums[mid+1],说明在 mid 处正在上升,那么 [mid+1, hi]
          里一定有峰 —— 要么一路升到 hi(hi 就是峰),要么在某处停止上升(那里就是峰)。
          于是 lo = mid + 1;否则 hi = mid(mid 本身可能就是峰)。
          lo &lt; hi 保证 mid &lt; hi,所以 mid+1 一定是合法下标,hi = mid 也一定让区间变小。
          数组完全无序 —— 这里的分界来自「坡的方向」。
        </>
      ),
    },
  },
  {
    lc: 852,
    title: { en: "Peak Index in a Mountain Array", zh: "山脉数组的峰顶索引" },
    d: "medium",
    tags: { en: ["Monotonic split", "Review"], zh: ["二段性", "复盘"] },
    hint: {
      en: "The array is guaranteed to rise strictly and then fall strictly. The code from LC 162 works unchanged.",
      zh: "数组保证先严格升后严格降 —— LC 162 的代码一字不改即可。",
    },
    key: {
      en: (
        <>
          Exactly the same converging search as LC 162: nums[mid] &lt;
          nums[mid+1] gives lo = mid + 1, otherwise hi = mid, and the answer is
          lo. Here the predicate nums[mid] &lt; nums[mid+1] is true on the rising
          part and false from the peak onward, so it flips exactly once. The only
          difference is the guarantee: 852 promises a single peak, while 162
          allows several and accepts any one of them.
        </>
      ),
      zh: (
        <>
          与 162 完全相同的收敛型二分:nums[mid] &lt; nums[mid+1] 则 lo = mid + 1,
          否则 hi = mid,返回 lo。这里谓词 nums[mid] &lt; nums[mid+1] 在上升段为真、
          从峰顶起为假,恰好只翻转一次。区别只在保证:852 承诺唯一峰,
          162 允许多峰、任取其一即可。
        </>
      ),
    },
  },
  {
    lc: 74,
    title: { en: "Search a 2D Matrix", zh: "搜索二维矩阵" },
    d: "medium",
    tags: { en: ["Binary search", "Flatten"], zh: ["二分", "矩阵拉直"] },
    hint: {
      en: "Each row increases, and the first value of a row is larger than the last value of the row above. Read the matrix row by row and see what you get.",
      zh: "每行递增,且下一行开头比上一行结尾大 —— 逐行读下来会得到什么?",
    },
    key: {
      en: (
        <>
          Reading the matrix row by row gives one strictly increasing sequence,
          so binary search on the flat range [0, m×n − 1]. Map a flat index back
          with row = mid / n and col = mid % n, where n is the number of columns.
          Time O(log(mn)). This is the &quot;fully sorted, so flatten and
          search&quot; case, and LC 240 is the counter-example.
        </>
      ),
      zh: (
        <>
          逐行读下来正好是一条严格递增的序列,所以直接在展平后的 [0, m×n − 1]
          上二分。用 row = mid / n、col = mid % n 把一维下标还原成行列(n 是列数)。
          时间 O(log(mn))。这是「全局有序 → 拉直即可二分」的代表,240 是它的反例。
        </>
      ),
    },
  },
  {
    lc: 240,
    title: { en: "Search a 2D Matrix II", zh: "搜索二维矩阵 II" },
    d: "medium",
    tags: { en: ["Staircase walk", "Matrix"], zh: ["阶梯排除", "矩阵"] },
    hint: {
      en: "Only rows and columns are sorted on their own; there is no global order. Try starting from the top-right corner.",
      zh: "只有行内、列内各自有序,没有全局顺序 —— 试试从右上角出发。",
    },
    key: {
      en: (
        <>
          Flattening does not produce a sorted sequence here, so a single binary
          search would miss values. Start at the top-right corner, which is the
          largest value in its row and the smallest in its column. If it is
          larger than target, no value in that column can be the target, so move
          left. If it is smaller, no value in that row can be it, so move down.
          Each step removes one whole row or column, so at most m + n steps,
          O(m + n). This is not binary search, but it rests on the same idea: one
          comparison rules out a whole block.
        </>
      ),
      zh: (
        <>
          这里拉直后并不是有序序列,单次二分会漏解。改从右上角出发 ——
          那个位置是所在行的最大值、所在列的最小值。比目标大,则这一整列都不可能是目标,
          左移;比目标小,则这一整行都不可能是,下移。每步排掉一整行或一整列,
          最多走 m + n 步,O(m + n)。它不是二分,但依据同一个想法:
          一次比较排除一整块。
        </>
      ),
    },
  },
  {
    lc: 875,
    title: { en: "Koko Eating Bananas", zh: "爱吃香蕉的珂珂" },
    d: "medium",
    tags: { en: ["Answer search", "judge function"], zh: ["二分答案", "judge 函数"] },
    hint: {
      en: "Computing the minimum speed directly is hard, but checking whether a given speed k finishes in h hours is easy — and a larger k never needs more hours.",
      zh: "直接求最小吃速很难,但「速度 k 能否 h 小时吃完」一问就明 —— 而且 k 越大用时不会更多。",
    },
    key: {
      en: (
        <>
          Binary search on the answer, not on an index. The candidate speeds are
          [1, max(piles)]; a speed above max(piles) still spends one hour per
          pile, so it can never help. judge(k) = Σ⌈pile / k⌉ ≤ h. A larger k
          never needs more hours, so judge is false…false then true…true and
          never flips back. Look for the first true: when judge succeeds, record
          ans = mid and continue with hi = mid − 1; otherwise lo = mid + 1. Write
          the ceiling as (p + k − 1) / k to stay in integers, and accumulate the
          hours in a 64-bit value in Java. Worked example C steps through the
          interval.
        </>
      ),
      zh: (
        <>
          二分的对象是答案而不是下标。候选速度是 [1, max(piles)] ——
          比最大堆还快的速度,每堆仍然要占满一小时,没有意义。judge(k) = Σ⌈pile / k⌉ ≤ h。
          k 越大用时不会更多,所以 judge 是「假…假 真…真」,且不会翻回去。
          要找第一个真:可行就记 ans = mid 并继续 hi = mid − 1,不可行就 lo = mid + 1。
          上取整写成 (p + k − 1) / k 以保持纯整数;Java 里用 64 位变量累加小时数。
          本章精讲 C 有逐帧动画。
        </>
      ),
    },
  },
  {
    lc: 1011,
    title: {
      en: "Capacity To Ship Packages Within D Days",
      zh: "在 D 天内送达包裹的能力",
    },
    d: "medium",
    tags: { en: ["Answer search", "Minimax"], zh: ["二分答案", "最大值最小化"] },
    hint: {
      en: "Same shape as LC 875: guess a capacity cap, then check whether the packages fit into D days.",
      zh: "和 875 一模一样的套路:猜一个运力 cap,再判定「D 天送得完吗」。",
    },
    key: {
      en: (
        <>
          The value range is [max(weights), sum(weights)]. The lower end must be
          the heaviest package: any capacity below it can never carry that
          package at all. The upper end ships everything in a single day.
          judge(cap) loads packages in the given order and starts a new day
          whenever the next package does not fit, then compares the day count
          with days. The packages must stay in their original order, which is
          what makes that greedy count exact. Find the smallest feasible cap.
        </>
      ),
      zh: (
        <>
          值域是 [max(weights), sum(weights)]:下界必须是最重的包裹 ——
          运力比它还小,那件货永远装不上;上界是一天全部运完。
          judge(cap) 按给定顺序装货,装不下就开新的一天,最后比较天数与 days。
          包裹必须保持原顺序,正是这一点让这个贪心计数是精确的。求最小可行 cap。
        </>
      ),
    },
  },
  {
    lc: 410,
    title: { en: "Split Array Largest Sum", zh: "分割数组的最大值" },
    d: "hard",
    tags: { en: ["Answer search", "Minimax"], zh: ["二分答案", "最大值最小化"] },
    hint: {
      en: "\"Make the largest piece as small as possible\" becomes: guess a limit x, then ask whether the array can be cut into at most m pieces with every piece sum <= x.",
      zh: "「让最大的那一段尽量小」翻译成:猜一个上限 x,再问「能不能切成 ≤ m 段、每段和都 ≤ x」。",
    },
    key: {
      en: (
        <>
          The same problem as LC 1011 in different words: a day becomes a
          subarray and the capacity becomes the upper limit on a subarray sum.
          Value range [max(nums), sum(nums)]. judge(x) walks the array once and
          counts how many pieces are needed when each piece sum stays ≤ x; the
          answer is the smallest x whose count is ≤ m. The pieces are contiguous
          and ordered, so the greedy count is exact. The hard label comes from
          the wording, not from the solution.
        </>
      ),
      zh: (
        <>
          它和 1011 是同一道题换了说法:一天变成一段子数组,运力变成每段和的上限。
          值域 [max(nums), sum(nums)]。judge(x) 扫一遍数组,数出「每段和 ≤ x」
          需要多少段;答案是段数 ≤ m 的最小 x。段是连续且有序的,所以贪心计数精确。
          它挂着 hard,难在题面,不难在解法。
        </>
      ),
    },
  },
  {
    lc: 4,
    title: { en: "Median of Two Sorted Arrays", zh: "寻找两个正序数组的中位数" },
    d: "hard",
    tags: { en: ["Binary search", "Optional", "Stretch"], zh: ["二分", "选做", "冲刺"] },
    hint: {
      en: "The O(log(m+n)) solution searches the split position inside the shorter array. It is demanding, and skipping it does not affect the rest of the chapter.",
      zh: "O(log(m+n)) 的正解是在较短数组的分割位置上二分 —— 门槛很高,先跳过不影响主线。",
    },
    key: {
      en: (
        <>
          Binary search a split position i in the shorter array. The split j in
          the other array follows from the total length, so that the left side
          holds exactly half of all elements. Then adjust i until max(left) ≤
          min(right); the median reads off those four boundary values. The edge
          cases are easy to get wrong and the problem is rare in interviews.
          Treat it as an optional challenge after the rest of the chapter is
          solid.
        </>
      ),
      zh: (
        <>
          在较短的数组上二分一个分割点 i,另一个数组的分割点 j 由总长度推出,
          使左半正好装下全部元素的一半;再调整 i 直到 max(左半) ≤ min(右半),
          中位数就由这四个边界值读出。边界极易写错,面试出现率也不高。
          把它当作学完全章之后的冲刺题。
        </>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "Why is mid = lo + (hi − lo) / 2 preferred over (lo + hi) / 2?",
      zh: "写二分时,为什么推荐 mid = lo + (hi − lo) / 2 而不是 (lo + hi) / 2?",
    },
    opts: {
      en: [
        "In a language with fixed-width integers, such as Java, lo + hi can exceed the maximum int and wrap to a negative number. lo + (hi − lo) / 2 always stays inside [lo, hi].",
        "The two forms compute different values of mid; the first lands closer to lo and converges faster.",
        "It is only a style preference; the two forms behave identically in every language.",
        "Because (lo + hi) / 2 gives a wrong result when lo and hi are both odd.",
      ],
      zh: [
        "在 Java 这类定长整型语言里,lo + hi 可能超出 int 上限、回绕成负数;lo + (hi − lo) / 2 的结果永远落在 [lo, hi] 内。",
        "两种写法算出的 mid 不同,前者更靠近左端,收敛更快。",
        "只是写法偏好,两者在任何语言里表现都完全一样。",
        "因为 (lo + hi) / 2 在 lo、hi 都是奇数时会算错。",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "When no overflow happens, both forms produce exactly the same mid: integer division rounds down in both cases. The difference is safety, not position.",
        "They do behave the same in Python and in JavaScript. They do not in Java or C++, where lo + hi can overflow — that was a real bug in java.util.Arrays.binarySearch.",
        "Both forms round down, so they agree on every input where no overflow occurs. There is no odd-number problem.",
      ],
      zh: [
        undefined,
        "只要不溢出,两种写法算出的 mid 完全相同 —— 整数除法都向下取整。区别在安全,不在取值位置。",
        "在 Python 和 JavaScript 里确实一样;但在 Java / C++ 里不一样,lo + hi 会溢出 —— 那是 java.util.Arrays.binarySearch 里的真实 bug。",
        "两种写法都向下取整,不溢出时结果一致,不存在「奇数算错」这回事。",
      ],
    },
    why: {
      en: (
        <>
          The difference is overflow, not the value of mid. In Java or C++ with
          32-bit int, lo + hi can pass Integer.MAX_VALUE and become negative,
          producing an invalid index; lo + (hi − lo) / 2 halves a difference that
          already fits, so it stays inside [lo, hi]. Python integers have
          arbitrary precision, so (lo + hi) // 2 is safe there. JavaScript numbers
          are doubles and exact up to 2⁵³, so plain division is safe as well — but{" "}
          <code>(lo + hi) &gt;&gt; 1</code> is not, because <code>&gt;&gt;</code>{" "}
          first converts to a 32-bit integer.
        </>
      ),
      zh: (
        <>
          区别在溢出,不在 mid 的取值。Java / C++ 的 32 位 int 下,lo + hi
          可能越过 Integer.MAX_VALUE 变成负数,得到非法下标;
          lo + (hi − lo) / 2 只是把一个本来就装得下的差值减半,结果永远在 [lo, hi] 内。
          Python 整数任意精度,写 (lo + hi) // 2 也安全。JavaScript 的数字是双精度浮点,
          在 2⁵³ 以内精确,所以普通除法同样安全 —— 但{" "}
          <code>(lo + hi) &gt;&gt; 1</code> 不行,<code>&gt;&gt;</code>{" "}
          会先把数转成 32 位整数。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: "A search uses the closed interval [lo, hi] and mid = lo + (hi − lo) / 2. Which pair of loop condition and update runs forever?",
      zh: "某个二分用闭区间 [lo, hi],mid = lo + (hi − lo) / 2。下面哪一组「循环条件 + 更新」会死循环?",
    },
    opts: {
      en: [
        "while (lo <= hi) together with hi = mid",
        "while (lo <= hi) together with hi = mid − 1",
        "while (lo < hi) together with hi = mid on one side and lo = mid + 1 on the other",
        "while (lo <= hi) together with lo = mid + 1",
      ],
      zh: [
        "while (lo <= hi) 配 hi = mid",
        "while (lo <= hi) 配 hi = mid − 1",
        "while (lo < hi) 配「一侧 hi = mid、另一侧 lo = mid + 1」",
        "while (lo <= hi) 配 lo = mid + 1",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "hi = mid − 1 always removes mid from the interval, so hi − lo strictly decreases and the loop ends.",
        "This is the converging form. lo < hi forces mid < hi, so hi = mid strictly decreases hi, and lo = mid + 1 strictly increases lo. Both moves shrink the interval.",
        "lo = mid + 1 always moves past mid, so the interval strictly shrinks every time that branch runs.",
      ],
      zh: [
        undefined,
        "hi = mid − 1 一定把 mid 删出区间,hi − lo 严格变小,循环必然结束。",
        "这是收敛型模板。lo < hi 保证 mid < hi,所以 hi = mid 一定让 hi 变小,lo = mid + 1 一定让 lo 变大,两个方向都在收缩。",
        "lo = mid + 1 一定越过 mid,只要走到这个分支,区间就严格变小。",
      ],
    },
    why: {
      en: (
        <>
          Integer division rounds down, so when lo == hi the value of mid is lo.
          With <code>while (lo &lt;= hi)</code> the loop still runs at that
          moment, and <code>hi = mid</code> writes back the value hi already had.
          Nothing changes, so the loop never ends. Every iteration has to remove
          at least the element at mid. The closed interval [lo, hi] goes with
          lo &lt;= hi, hi = mid − 1, and lo = mid + 1. Only the converging form,
          which stops at lo &lt; hi, may use hi = mid.
        </>
      ),
      zh: (
        <>
          整数除法向下取整,所以 lo == hi 时 mid 就等于 lo。
          <code>while (lo &lt;= hi)</code> 在这一刻仍会进入循环,而{" "}
          <code>hi = mid</code> 把 hi 写回了它原本的值 —— 什么都没变,循环永远停不下来。
          每一轮至少要删掉 mid 这一格。闭区间 [lo, hi] 配的是 lo ≤ hi、hi = mid − 1、
          lo = mid + 1;只有以 lo &lt; hi 收尾的收敛型模板,才可以写 hi = mid。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: "A binary search returns the first index whose value is >= target (lower_bound). What does it return when target is not in the array?",
      zh: "对有序数组用「第一个 ≥ target」的二分(lower_bound),当 target 不在数组里时,返回值是什么?",
    },
    opts: {
      en: [
        "The position where target would have to be inserted to keep the array sorted — exactly the answer to LC 35. If every element is smaller than target, that position is the array length.",
        "−1, meaning not found.",
        "The array length, always.",
        "The index of the element closest in value to target.",
      ],
      zh: [
        "target 保持有序时该插入的位置 —— 正是 LC 35 的答案。若所有元素都比 target 小,这个位置就是数组长度。",
        "−1,表示没找到。",
        "数组长度,恒定不变。",
        "数值上离 target 最近的那个元素的下标。",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "−1 is the convention for an exact search. lower_bound always returns a position, never −1, and that is what makes it more useful.",
        "It returns the array length only when every element is smaller than target. Otherwise it returns a position inside the array.",
        "It returns the first index whose value is ≥ target. The closest value may sit at the index before it, which is smaller than target.",
      ],
      zh: [
        undefined,
        "−1 是「精确查找」找不到时的约定。lower_bound 永远返回一个位置,不返回 −1 —— 这正是它更有用的地方。",
        "只有当所有元素都比 target 小时才返回数组长度;一般情况返回数组内部的某个位置。",
        "它返回第一个 ≥ target 的下标。数值最近的那个可能在它前面,比 target 小。",
      ],
    },
    why: {
      en: (
        <>
          lower_bound(t) equals the number of elements smaller than t, so it is
          also the index of the first element that is ≥ t. When t is absent,
          inserting t at that index keeps the array sorted, which is why LC 35 is
          just lower_bound. upper_bound(t) is the first index whose value is
          &gt; t; it differs by one comparison, and it also returns the array
          length when every element is ≤ t.
        </>
      ),
      zh: (
        <>
          lower_bound(t) 等于「比 t 小的元素个数」,所以它也是第一个 ≥ t 的元素下标。
          t 缺席时,把 t 插在这个下标上仍然有序 —— 这就是 LC 35 直接等于 lower_bound 的原因。
          upper_bound(t) 是第一个 &gt; t 的下标,只差一个等号;当所有元素都 ≤ t 时,
          它同样返回数组长度。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          In the sorted array [5,7,7,8,8,8,10], how many times does 8 occur?
          (Work it out as upper_bound(8) − lower_bound(8).)
        </>
      ),
      zh: (
        <>
          有序数组 [5,7,7,8,8,8,10] 中,元素 8 出现了几次?(用 upper_bound(8) −
          lower_bound(8) 算一算)
        </>
      ),
    },
    placeholder: { en: "Enter a whole number…", zh: "输入一个整数…" },
    answers: ["3", "three", "3次", "3个"],
    hint: {
      en: "lower_bound(8) is the first index whose value is ≥ 8. upper_bound(8) is the first index whose value is > 8. Subtract them.",
      zh: "lower_bound(8) 是第一个 ≥ 8 的下标,upper_bound(8) 是第一个 > 8 的下标,两者相减就是个数。",
    },
    why: {
      en: (
        <>
          lower_bound(8) = 3 and upper_bound(8) = 6, so 6 − 3 = 3. Subtracting
          the two bounds is the most useful side product of LC 34: it counts
          occurrences in O(log n), without scanning the equal values one by one.
        </>
      ),
      zh: (
        <>
          lower_bound(8) = 3、upper_bound(8) = 6,6 − 3 = 3。
          「两个边界一减得计数」是 LC 34 最实用的副产品:O(log n) 数出出现次数,
          不用逐个扫过相等的元素。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: "A rotated sorted array such as [4,5,6,7,0,1,2] is not sorted as a whole. Why can binary search still work on it?",
      zh: "旋转后的升序数组(如 [4,5,6,7,0,1,2])不再整体有序,为什么还能二分?",
    },
    opts: {
      en: [
        "Cut at mid and at least one of the two halves is fully sorted. Decide which one, then check whether target lies inside it, and one half can be discarded safely.",
        "The array is still sorted; you just start reading it from the middle.",
        "It cannot really be binary searched; only a linear scan in O(n) works.",
        "You must first spend O(n) finding the rotation point; there is no other way.",
      ],
      zh: [
        "从 mid 切开,左右两半至少有一半是完全有序的。先判断哪一半有序,再看 target 在不在里面,就能安全丢掉一半。",
        "旋转数组其实还是有序的,只是从中间开始读而已。",
        "不能真正二分,只能顺序扫描 O(n)。",
        "必须先花 O(n) 找到旋转点,除此之外没有别的办法。",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "It is not sorted: 7 is followed by 0, so there is exactly one drop. That drop is why an extra test is needed to find out which half is sorted.",
        "It can be searched in O(log n) when the values are distinct, which is what LC 33 asks for.",
        "Finding the rotation point works, but it is unnecessary. One pass of binary search that asks \"which half is sorted\" already solves it in O(log n).",
      ],
      zh: [
        undefined,
        "它不是有序的:7 后面接的是 0,恰好有一个下跌处。正因为有这个下跌,才需要额外判断哪半有序。",
        "元素互不相同时可以做到 O(log n),这正是 LC 33 的考点。",
        "找旋转点是可行的思路,但没必要 —— 一次二分里直接问「哪半有序」就够了,同样 O(log n)。",
      ],
    },
    why: {
      en: (
        <>
          Binary search does not require the whole array to be sorted. It
          requires that one comparison can tell you which half to keep. In a
          rotated array there is exactly one drop, so at most one half can
          contain it: nums[lo] ≤ nums[mid] means [lo, mid] is sorted, otherwise
          [mid, hi] is. Inside the sorted half a range comparison decides whether
          target is there, and the other half is discarded.
        </>
      ),
      zh: (
        <>
          二分不要求整个数组有序,只要求「一次比较就能决定保留哪一半」。
          旋转数组里恰好只有一个下跌处,所以最多一半会含有它:nums[lo] ≤ nums[mid]
          说明 [lo, mid] 有序,否则 [mid, hi] 有序。在有序的那一半里,
          用范围比较判断 target 在不在,另一半直接丢掉。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: "What is the worst-case time of LC 81 (rotated array search with duplicates), and why?",
      zh: "LC 81(带重复元素的旋转数组搜索)最坏时间复杂度会退化到多少?为什么?",
    },
    opts: {
      en: [
        "O(n): when nums[lo] == nums[mid] == nums[hi], neither half can be shown to be sorted, so the only safe move is lo++ and hi−−, one element at a time.",
        "Still O(log n); duplicates change nothing.",
        "O(n log n), because the array has to be sorted first.",
        "O(log² n).",
      ],
      zh: [
        "O(n):当 nums[lo] == nums[mid] == nums[hi] 时,哪一半有序都证不出来,只能 lo++、hi−− 一格格挪。",
        "仍然是 O(log n),重复元素没有任何影响。",
        "O(n log n),因为要先排序。",
        "O(log² n)。",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "They do change things. In [1,1,1,1,1,0,1,1] the values at lo, mid, and hi are all 1, and nothing tells you which side holds the 0.",
        "The array is already a rotated sorted array; no sorting is needed. The slowdown comes from not being able to tell which half is sorted.",
        "There is no log² structure here. In the worst case each step removes only one element from each end, which is linear.",
      ],
      zh: [
        undefined,
        "有影响:在 [1,1,1,1,1,0,1,1] 里,lo、mid、hi 三处都是 1,谁也说不出 0 在哪一侧。",
        "数组本来就是(旋转过的)有序数组,不需要排序。变慢的原因是判不出哪半有序。",
        "这里没有 log² 的结构。最坏情况下每步只从两端各删一个元素,那是线性的。",
      ],
    },
    why: {
      en: (
        <>
          When the three sampled values are equal, the test nums[lo] ≤ nums[mid]
          carries no information, so the search falls back to lo++ and hi−−,
          which removes one element from each end. In the worst case that happens
          on nearly every step, giving O(n). This is why LC 33 and LC 153 (no
          duplicates) stay O(log n) while LC 81 and LC 154 do not.
        </>
      ),
      zh: (
        <>
          三处取样的值相等时,nums[lo] ≤ nums[mid] 这个判据提供不了信息,
          只能退回 lo++、hi−−,每端各删一个元素。最坏情况下几乎每步都这样,于是 O(n)。
          这就是 33 / 153(无重复)能保持 O(log n),而 81 / 154 不能的原因。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: "Which of these are binary search on the answer — guess a candidate answer, then verify it with a monotonic yes/no test? (Select all that apply)",
      zh: "下面哪些问题属于「二分答案」(先猜一个答案,再用一个单调的判定函数验证)?(多选)",
    },
    opts: {
      en: [
        "LC 875 Koko Eating Bananas: guess a speed k, then test whether she finishes within h hours.",
        "LC 1011 Ship Packages: guess a capacity cap, then test whether the packages fit into D days.",
        "LC 410 Split Array Largest Sum: guess a limit x on a piece sum, then test whether at most m pieces are enough.",
        "LC 704: look up a value that is known to exist in a given sorted array.",
      ],
      zh: [
        "LC 875 吃香蕉:猜一个吃速 k,判定「能否在 h 小时吃完」。",
        "LC 1011 送包裹:猜一个运力 cap,判定「能否在 D 天送完」。",
        "LC 410 分割数组:猜一个「每段和的上限 x」,判定「能否分成 ≤ m 段」。",
        "LC 704:在给定的有序数组里查一个确定存在的值。",
      ],
    },
    correct: [0, 1, 2],
    missHint: {
      en: "Any problem where the yes/no test flips once from false to true and never flips back can be searched this way. You missed one of them.",
      zh: "凡是判定「从否翻到是之后不再翻回去」的问题,都能这样二分 —— 你漏了其中一个。",
    },
    extraHint: {
      en: "One option looks up a value that already exists in a sorted array. That is ordinary binary search over indices, not a search over an answer range.",
      zh: "有一个选项是「在有序数组里找一个已存在的值」—— 那是普通二分,搜索的是下标,不是答案的取值范围。",
    },
    why: {
      en: (
        <>
          The mark of binary search on the answer is a yes/no test that flips
          once, from false to true, and never flips back. LC 875, LC 1011, and
          LC 410 all search a range of candidate answers and call a judge
          function on each candidate; the input array does not even need to be
          sorted. LC 704 searches indices of an array that is sorted by
          assumption, which is ordinary binary search.
        </>
      ),
      zh: (
        <>
          二分答案的标志是:判定只翻转一次,从否翻到是之后不再翻回去。
          875 / 1011 / 410 都在「候选答案的取值范围」上搜索,对每个候选调用一个 judge 函数,
          输入数组甚至不需要有序。704 搜索的是「已假定有序的数组」的下标,属于普通二分。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: "In LC 875 the test is \"can Koko finish within h hours at speed k?\". Which statement about its monotonicity is correct?",
      zh: "LC 875 的判定函数是「速度 k 能否在 h 小时吃完」。关于它的单调性,正确的是?",
    },
    opts: {
      en: [
        "A larger k never needs more hours, so the test reads false…false | true…true, and the answer is the first k that passes — the smallest feasible speed.",
        "A larger k makes it harder to finish, so you want the last k that passes.",
        "The test is not monotonic, so every k has to be tried one by one.",
        "You want the largest feasible k, because eating faster is better.",
      ],
      zh: [
        "k 越大用时不会更多,所以判定呈「不可行…不可行 | 可行…可行」,答案是第一个可行的 k —— 最小可行速度。",
        "k 越大越难吃完,所以要找最后一个可行的 k。",
        "判定没有单调性,只能逐个枚举 k。",
        "要找最大的可行 k,因为吃得越快越好。",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "It is the other way round. A higher speed empties each pile in the same number of hours or fewer, so a large k is always easier, not harder.",
        "It is monotonic: as k grows, the total number of hours never increases, so once the test passes it keeps passing. That is what makes the search valid.",
        "The problem asks for the smallest speed that still fits in h hours. The largest feasible speed is simply max(piles), which carries no information.",
      ],
      zh: [
        undefined,
        "反了:速度越高,每堆花的小时数只会更少或相同,所以大 k 永远更容易,不是更难。",
        "它是单调的:k 增大时总小时数不会增加,一旦判定为真就不再翻假 —— 正是这条性质让二分成立。",
        "题目要的是仍能在 h 小时内吃完的最小速度。最大的可行速度就是 max(piles),没有信息量。",
      ],
    },
    why: {
      en: (
        <>
          Σ⌈pile / k⌉ never increases as k grows, so canFinish(k) is false for
          small k and true from some point on, and never flips back. The answer
          is that flip point. Use the boundary template: when the test passes,
          record ans = mid and continue with hi = mid − 1 to look for something
          smaller.
        </>
      ),
      zh: (
        <>
          k 增大时 Σ⌈pile / k⌉ 不会增加,所以 canFinish(k) 在小 k 处为假、
          从某一点起为真,且不再翻回去 —— 答案就是那个翻转点。
          用找边界模板:判定通过就记 ans = mid,再用 hi = mid − 1 继续找更小的。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: "LC 74 (rows increasing, and the first value of each row larger than the last value of the row above) can be solved with one binary search, but LC 240 (rows and columns each increasing, no relation between rows) cannot. Why?",
      zh: "LC 74(每行递增、且下一行首元素 > 上一行末元素)能一次二分,LC 240(每行每列各自递增,但不保证行间衔接)却不能。为什么?",
    },
    opts: {
      en: [
        "Read row by row, LC 74 is one strictly increasing sequence, so a single O(log(mn)) search works. LC 240 has no global order, so it uses the staircase walk from the top-right corner, O(m + n).",
        "The two problems are the same; both allow one O(log(mn)) search.",
        "LC 240 can also be searched, but you have to binary search each row, and O(m log n) is the best possible.",
        "LC 74 cannot be binary searched; it needs a row-by-row scan.",
      ],
      zh: [
        "逐行读下来,74 是一条严格递增的序列,一次 O(log(mn)) 二分即可;240 没有全局顺序,改用从右上角出发的阶梯排除,O(m + n)。",
        "两题完全一样,都能 O(log(mn)) 二分。",
        "240 也能二分,只是要对每一行各做一次,O(m log n) 才是最优。",
        "74 不能二分,只能逐行扫描。",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "They differ: in LC 240 the order between matrix[i][j] and matrix[i+1][j−1] is unknown, so the flattened sequence is not sorted and a single search would miss values.",
        "Searching each row does work at O(m log n), but it is not the best. The staircase walk removes a whole row or column per step and runs in O(m + n).",
        "LC 74 is the standard case for binary search: the flattened matrix is sorted, so one O(log(mn)) search finds the value.",
      ],
      zh: [
        undefined,
        "两题不同:240 里 matrix[i][j] 和 matrix[i+1][j−1] 的大小关系不确定,拉直后不是有序序列,单次二分会漏解。",
        "逐行二分 O(m log n) 确实可行,但不是最优。阶梯排除每步排掉一整行或一整列,O(m + n) 更好。",
        "74 恰恰是二分的标准场景:拉直后有序,一次 O(log(mn)) 二分即可。",
      ],
    },
    why: {
      en: (
        <>
          A single binary search needs one order over all the values. LC 74 has
          it, so the matrix can be treated as a flat array of length m×n. LC 240
          only guarantees order along each row and each column. Standing at the
          top-right corner gives a value that is the largest in its row and the
          smallest in its column, so one comparison removes a whole column (move
          left) or a whole row (move down): O(m + n).
        </>
      ),
      zh: (
        <>
          单次二分需要所有元素上的一个统一顺序。74 有,所以可以把矩阵当成长度 m×n
          的一维数组。240 只保证行内、列内有序。站在右上角时,那个值是所在行的最大、
          所在列的最小,一次比较就能排掉一整列(左移)或一整行(下移),O(m + n)。
        </>
      ),
    },
  },
];
