// Chapter 3 - Binary Search in Depth: problem set (the quiz is in lib/binary-quiz.tsx).
// The problem set covers the advanced binary-search problems on lc.md's main track (finding
// boundaries / two-part monotonicity / binary search on the answer), ordered easy to hard;
// hint only points at a direction without spoiling, key explains the optimal solution in one
// paragraph.
// Bilingual: all copy is Loc<...> with English as the default. Titles use LeetCode's official
// English and Chinese names.

import type { Problem } from "@/lib/problems";

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
          闭区间 [lo, hi] 表示两个端点都仍是候选。区间非空当且仅当 lo ≤ hi,所以循环条件就是 lo ≤ hi。mid = lo + (hi − lo) / 2 向下取整,永远落在区间内。nums[mid] &lt; target 时,mid 及其左边全部出局 → lo = mid + 1;
          nums[mid] &gt; target 时 hi = mid − 1。每个分支都至少删掉 mid 这一格,所以 hi − lo 严格变小,循环必然结束。不变量是:若 target 在数组里,它的下标一定还在 [lo, hi] 内。时间 O(log n);迭代写法额外空间 O(1),递归写法调用栈 O(log n)。
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
          答案就是 lower_bound(target):第一个 ≥ target 的下标。用「闭区间 + 一个候选变量」的模板:nums[mid] ≥ target 就记下 ans = mid,再用 hi = mid − 1 继续往左找更早的;否则 lo = mid + 1。ans 初值取 nums.length —— 当所有元素都比 target 小时,答案就是末尾的下一个位置。target 缺席时,这个下标正是它保持有序的插入点。
        </>
      ),
    },
  },
  {
    lc: 278,
    title: { en: "First Bad Version", zh: "第一个错误的版本" },
    d: "easy",
    tags: { en: ["Binary search on the answer", "Predicate"], zh: ["二分答案", "判定函数"] },
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
          版本序列对 isBadVersion 是「前一段 false、后一段 true」,而且不会翻回去。求第一个 true 的位置,就是把 lower_bound 从「比较值」换成「调用一个判定函数」——
          这是从找边界通往二分答案的桥。版本号可能接近 int 上限,所以在 Java 里必须写 mid = lo + (hi − lo) / 2,lo + hi 会溢出。
        </>
      ),
    },
  },
  {
    lc: 69,
    title: { en: "Sqrt(x)", zh: "x 的平方根" },
    d: "easy",
    tags: { en: ["Binary search on the answer", "Square root"], zh: ["二分答案", "平方根"] },
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
          在 [0, x] 上找满足 k×k ≤ x 的最大 k。谓词是「真…真 假…假」,要的是<b>最后一个</b>真:记下 ans = mid,再用 lo = mid + 1 往大试。Java 里必须先转型再乘 —— <code>(long) mid * mid</code>,否则 mid×mid 会溢出 int。JavaScript 里乘积是双精度浮点:只有当它已经远大于 x 时才不精确,比较结果依然正确。Python 整数任意精度。注意它和 875 互为镜像:
          875 找第一个真,这里找最后一个真。
        </>
      ),
    },
  },
  {
    lc: 367,
    title: { en: "Valid Perfect Square", zh: "有效的完全平方数" },
    d: "easy",
    tags: { en: ["Binary search on the answer", "Review"], zh: ["二分答案", "复盘"] },
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
          在 [1, num] 上二分 k:mid×mid == num 返回 true;mid×mid &lt; num 则 lo = mid + 1;否则 hi = mid − 1;区间空了返回 false。Java 里用 <code>(long) mid * mid</code>。另有一条算术捷径:1+3+5+…+(2i−1) = i²,所以从 num 里连减奇数、恰好减到 0 就说明它是完全平方数。二分是通法,奇数和是巧法。
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
          left = lower_bound(target)。若 left == nums.length 或 nums[left] != target,返回 [−1, −1];否则 right = lower_bound(target + 1) − 1。因为元素是整数,「第一个 &gt; target」等价于「第一个 ≥ target + 1」,于是一个函数就能给出两个边界 —— 但这个改写只在 target + 1
          确实是「下一个可能取值」的离散类型上成立。两个边界一减,还顺带得到 target 出现了几次。本章精讲 A 有逐帧动画。
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
          说明 [lo, mid] 有序,否则 [mid, hi] 有序。在有序的那一半里,用范围比较判断 target 在不在是可靠的:在,就收进这一半;不在,就收进另一半。本题保证元素互不相同,判据永远不会含糊,复杂度稳定 O(log n)。本章精讲 B 有逐帧动画。
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
          (例如 [1,1,1,0,1])时,哪半有序都证不出来,通用做法是 lo++、hi−−,每侧只丢一个元素。最坏情况下几乎每步都撞上这种局面,时间退化到 O(n)。理解「为什么退化」比背代码重要:重复元素破坏了二分赖以成立的「前段全否、后段全是」的分界。
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
          while (lo &lt; hi):nums[mid] &gt; nums[hi] 说明最小值严格在右边,lo = mid + 1;否则 hi = mid(mid 本身可能就是最小值)。区间收敛到单点,即答案。为什么跟 nums[hi] 比而不是 nums[lo]?因为在「实际没有旋转」的数组上(如 [1,2,3,4,5]),nums[mid] 比 nums[lo] 大,那个判据会把搜索带向右边,而最小值其实在下标 0。
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
    d: "hard",
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
          同 153,但 nums[mid] == nums[hi] 提供不了任何信息:算法只看这两个值,而 [1,3,3,3] 与 [3,3,1,3] 在这两处都是 3 和 3 —— 可最小值一个在下标 0、一个在下标 2。唯一安全的动作是 hi−−:只丢一个元素,且 hi 处的值在 mid 还有一份,最小值一定仍在区间内。最坏 O(n)。它和 81 一起,是「重复元素击穿 O(log n)」的标准演示。
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
          A peak is any index whose value is larger than both neighbors;
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
          峰值 = 比左右邻居都大的位置,数组外侧视作 −∞。while (lo &lt; hi):若 nums[mid] &lt; nums[mid+1],说明在 mid 处正在上升,那么 [mid+1, hi]
          里一定有峰 —— 要么一路升到 hi(hi 就是峰),要么在某处停止上升(那里就是峰)。于是 lo = mid + 1;否则 hi = mid(mid 本身可能就是峰)。lo &lt; hi 保证 mid &lt; hi,所以 mid+1 一定是合法下标,hi = mid 也一定让区间变小。数组完全无序 —— 这里的分界来自「坡的方向」。
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
          与 162 完全相同的收敛型二分:nums[mid] &lt; nums[mid+1] 则 lo = mid + 1,否则 hi = mid,返回 lo。这里谓词 nums[mid] &lt; nums[mid+1] 在上升段为真、从峰顶起为假,恰好只翻转一次。区别只在保证:852 承诺唯一峰,
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
          上二分。用 row = mid / n、col = mid % n 把一维下标还原成行列(n 是列数)。时间 O(log(mn))。这是「全局有序 → 拉直即可二分」的代表,240 是它的反例。
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
          那个位置是所在行的最大值、所在列的最小值。比目标大,则这一整列都不可能是目标,左移;比目标小,则这一整行都不可能是,下移。每步排掉一整行或一整列,最多走 m + n 步,O(m + n)。它不是二分,但依据同一个想法:一次比较排除一整块。
        </>
      ),
    },
  },
  {
    lc: 875,
    title: { en: "Koko Eating Bananas", zh: "爱吃香蕉的珂珂" },
    d: "medium",
    tags: { en: ["Binary search on the answer", "Judge function"], zh: ["二分答案", "judge 函数"] },
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
          比最大堆还快的速度,每堆仍然要占满一小时,没有意义。judge(k) = Σ⌈pile / k⌉ ≤ h。k 越大用时不会更多,所以 judge 是「假…假 真…真」,且不会翻回去。要找第一个真:可行就记 ans = mid 并继续 hi = mid − 1,不可行就 lo = mid + 1。上取整写成 (p + k − 1) / k 以保持纯整数;Java 里用 64 位变量累加小时数。本章精讲 C 有逐帧动画。
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
    tags: { en: ["Binary search on the answer", "Minimax"], zh: ["二分答案", "最大值最小化"] },
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
          运力比它还小,那件货永远装不上;上界是一天全部运完。judge(cap) 按给定顺序装货,装不下就开新的一天,最后比较天数与 days。包裹必须保持原顺序,正是这一点让这个贪心计数是精确的。求最小可行 cap。
        </>
      ),
    },
  },
  {
    lc: 410,
    title: { en: "Split Array Largest Sum", zh: "分割数组的最大值" },
    d: "hard",
    tags: { en: ["Binary search on the answer", "Minimax"], zh: ["二分答案", "最大值最小化"] },
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
          它和 1011 是同一道题换了说法:一天变成一段子数组,运力变成每段和的上限。值域 [max(nums), sum(nums)]。judge(x) 扫一遍数组,数出「每段和 ≤ x」需要多少段;答案是段数 ≤ m 的最小 x。段是连续且有序的,所以贪心计数精确。它标为 hard,难在题面,不难在解法。
        </>
      ),
    },
  },
  {
    lc: 4,
    title: { en: "Median of Two Sorted Arrays", zh: "寻找两个正序数组的中位数" },
    d: "hard",
    tags: {
      en: ["Binary search", "Optional", "Stretch", "Review"],
      zh: ["二分", "选做", "冲刺", "复盘"],
    },
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
          在较短的数组上二分一个分割点 i,另一个数组的分割点 j 由总长度推出,使左半正好装下全部元素的一半;再调整 i 直到 max(左半) ≤ min(右半),中位数就由这四个边界值读出。边界极易写错,面试出现率也不高。把它当作学完全章之后的冲刺题。
        </>
      ),
    },
  },
];
