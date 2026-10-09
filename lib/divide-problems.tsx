// Chapter 2 - Divide and Conquer: problem set (the quiz is in lib/divide-quiz.tsx).
// The problem set covers the divide-and-conquer problems assigned by the lc.md blueprint
// (50, 23, 53, 169, 215 review, 148 review, 4 optional), ordered easy to hard;
// hint only points at a direction without spoiling, key explains the optimal solution in one
// paragraph. Review problems carry the "Review" tag.
// Bilingual: all copy is Loc<...> with English as the default. Titles use LeetCode's official
// English and Chinese names.

import type { Problem } from "@/lib/problems";
import { T } from "@/lib/i18n";

export const PROBLEMS: Problem[] = [
  {
    lc: 169,
    title: { en: "Majority Element", zh: "多数元素" },
    d: "easy",
    tags: {
      en: ["Divide and conquer", "Boyer-Moore"],
      zh: ["分治", "摩尔投票"],
    },
    hint: {
      en: "Cut the array in half. If a value is the majority of the whole array, it must also be the majority of at least one of the two halves. That is what makes recursion possible.",
      zh: "把数组切成两半:如果一个数是整段的多数,它一定至少是左半或右半之一的多数 —— 这就能递归。",
    },
    key: {
      en: (
        <>
          Divide and conquer: dc(range) returns the majority element of that
          range. Get a candidate from each half. If the two candidates are the
          same, return it. Otherwise count both candidates across the whole
          range and keep the one that appears more often. The count is the
          combine step and costs O(n), so T(n) = 2T(n/2) + O(n) = O(n log n)
          time and O(log n) stack. Boyer-Moore voting solves the same problem in
          O(n) time and O(1) space, and the maths chapter covers it. The divide
          and conquer view is still worth reading, because it explains why
          &quot;being the majority&quot; survives cutting the array.
        </>
      ),
      zh: (
        <>
          分治视角:dc(区间) 返回该区间的多数元素。左右各求一个候选,若两者相同直接返回;否则在整段里数一下两个候选各出现多少次,取多的那个。这次计数就是「合」,代价 O(n),所以 T(n) = 2T(n/2) + O(n) = O(n log n),外加 O(log n) 递归栈。更快的解法是摩尔投票,O(n) 时间、O(1) 空间(数学章主讲)——
          但分治视角能讲清「多数」这个性质为什么经得起对半切。
        </>
      ),
    },
  },
  {
    lc: 50,
    title: { en: "Pow(x, n)", zh: "Pow(x, n)" },
    d: "medium",
    tags: {
      en: ["Fast power", "Recursion", "Divide and conquer"],
      zh: ["快速幂", "递归", "分治"],
    },
    hint: {
      en: "x¹³ does not need 13 multiplications. x¹³ = (x⁶)²·x, and x⁶ = (x³)², and so on. The exponent is cut in half at every step.",
      zh: "x¹³ 不必乘 13 次:x¹³ =(x⁶)²·x,而 x⁶ =(x³)²…… 指数每次对半砍。",
    },
    key: {
      en: (
        <>
          Fast power cuts the exponent in half. If n is even, x^n = (x^(n/2))².
          If n is odd, multiply by one more x. <b>The trap:</b> store x^(n/2) in
          a variable and compute it <b>once</b>. Writing two recursive calls and
          multiplying them makes each level double, and the running time falls
          back to O(n). The exponent halves at every level, so the recursion has
          O(log n) levels: O(log n) time and O(log n) stack, or O(1) stack for
          the iterative version. For a negative exponent take the reciprocal of
          x, and convert n to a 64-bit type first, because negating
          Integer.MIN_VALUE overflows. Taking a modulus after every
          multiplication gives modular exponentiation, covered in the maths
          chapter. Worked example A in this chapter animates 3¹³.
        </>
      ),
      zh: (
        <>
          快速幂:把指数 n 对半砍。n 为偶 → x^n =(x^(n/2))²;n 为奇 → 再补乘一个 x。
          <b>关键陷阱</b>:必须先把 x^(n/2) 存进变量、<b>只算一次</b>;写成两个递归调用相乘,每层调用数就会翻倍,退化回 O(n)。指数每层减半 ⇒ 递归 O(log n) 层:时间 O(log n),递归栈 O(log n),迭代版栈 O(1)。负指数取底数的倒数,并先把 n 转成 64 位 —— 对 Integer.MIN_VALUE 取负会溢出。每步乘完取模就是快速幂取模(数学章主讲)。本章精讲 A 有 3¹³ 的分解动画。
        </>
      ),
    },
  },
  {
    lc: 53,
    title: { en: "Maximum Subarray", zh: "最大子数组和" },
    d: "medium",
    tags: {
      en: ["Divide and conquer", "Divide and conquer vs DP"],
      zh: ["分治", "分治 vs DP"],
    },
    hint: {
      en: "After one cut in the middle, the best subarray has only three possible homes: entirely in the left half, entirely in the right half, or crossing the midpoint. The first two are handled by the recursion.",
      zh: "切一刀之后,最大子数组只有三种归宿:全在左半、全在右半、横跨中点。前两种交给递归。",
    },
    key: {
      en: (
        <>
          Divide and conquer: dc(l, r) returns the maximum of three values, the
          best in the left half, the best in the right half, and the best
          subarray that crosses the midpoint. A crossing subarray must contain
          the midpoint, so scan left from the midpoint for the largest suffix sum
          of the left half, scan right for the largest prefix sum of the right
          half, and add them. T(n) = 2T(n/2) + O(n) = O(n log n) time with
          O(log n) stack. The chapter 07 problem set gives the{" "}
          <b>Kadane / DP view</b>: dp[i] =
          max(nums[i], dp[i-1] + nums[i]), one linear pass in O(n) time and O(1)
          space, which is faster. Know both. Worked example C in this chapter
          animates the crossing scan.
        </>
      ),
      zh: (
        <>
          分治:dc(l, r) 返回三者取 max —— 左半最大、右半最大、跨中点最大。跨中点段必含中点,所以从中点向左扫求左半的最大后缀和、向右扫求右半的最大前缀和,相加即可。T(n) = 2T(n/2) + O(n) = O(n log n),递归栈 O(log n)。对照第 7 章题单给出的 <b>Kadane / DP 视角</b>:dp[i] = max(nums[i], dp[i-1] + nums[i]),一次线性扫描,O(n) 时间、O(1) 空间,更优。两种都要会。本章精讲 C 有跨中点扫描动画。
        </>
      ),
    },
  },
  {
    lc: 215,
    title: {
      en: "Kth Largest Element in an Array",
      zh: "数组中的第 K 个最大元素",
    },
    d: "medium",
    tags: {
      en: ["Quickselect", "Decrease and conquer", "Review"],
      zh: ["快速选择", "减治", "复盘"],
    },
    hint: {
      en: "After a quicksort partition, the pivot already sits at its final sorted position. Compare that position with k and only one side needs to be searched.",
      zh: "快排的 partition 之后,基准落在它最终的位置上 —— 只要看这个位置和 k 的关系,就只需递归一侧。",
    },
    key: {
      en: (
        <>
          Quickselect: after partition the pivot is at its final index. If that
          index is the one you want, return the pivot. Otherwise recurse into{" "}
          <b>only the side that can contain the answer</b>. Discarding one side
          instead of solving both is called <b>decrease and conquer</b>, a close
          relative of divide and conquer. With a randomly chosen pivot the
          expected recurrence is T(n) = T(n/2) + O(n) = O(n) expected time. The
          worst case is still O(n²), when every partition is maximally
          unbalanced. A min-heap of size k solves the same problem in O(n log k)
          time and O(k) space, and heaps are covered in DataData chapter 09.
        </>
      ),
      zh: (
        <>
          快速选择(Quickselect):partition 后基准的最终下标已确定,若它正好是要找的位置就返回;否则只递归<b>可能包含答案的那一侧</b>。丢掉一侧、不解两边,叫
          <b>减治(decrease and conquer)</b>,是分治的近亲。随机选基准时,期望递推是 T(n) = T(n/2) + O(n) = O(n) 期望时间;最坏仍是 O(n²)(每次划分都极不均匀)。对照堆解法:大小为 k 的小顶堆,
          O(n log k) 时间、O(k) 空间 —— 堆见 DataData · 09 堆。
        </>
      ),
    },
  },
  {
    lc: 148,
    title: { en: "Sort List", zh: "排序链表" },
    d: "medium",
    tags: {
      en: ["Merge sort", "Linked list", "Review"],
      zh: ["归并", "链表", "复盘"],
    },
    hint: {
      en: "O(n log n) time with O(1) extra space? A linked list fits merge sort well. Find the middle with a slow and a fast pointer, cut the list there, sort both halves, then merge them.",
      zh: "要 O(n log n) 又只能 O(1) 额外空间?链表天生适合归并 —— 快慢指针找中点,断开,递归两半再合并。",
    },
    key: {
      en: (
        <>
          Merge sort on a linked list: find the middle with a slow and a fast
          pointer, cut the list into two, sort each part recursively, then merge
          two sorted lists the same way LC 21 does. The top-down version uses
          O(log n) stack. The bottom-up version merges runs of length 1, then 2,
          then 4, and so on with a loop, which reaches true O(1) extra space.
          Merge sort on an array needs an O(n) buffer, but a linked list only
          needs pointer rewrites, so nothing has to be copied.
        </>
      ),
      zh: (
        <>
          归并排序链表:快慢指针找中点断成两段,递归排序,再像 LC 21 那样合并两条有序链表。自顶向下版占 O(log n) 递归栈;<b>自底向上</b>版用循环按子段长度 1、2、4… 逐轮合并,做到真正的 O(1) 额外空间。数组归并需要 O(n) 辅助数组,链表只改指针、不搬数据,所以天生契合归并。
        </>
      ),
    },
  },
  {
    lc: 23,
    title: { en: "Merge k Sorted Lists", zh: "合并 K 个升序链表" },
    d: "hard",
    tags: {
      en: ["Merge", "Divide and conquer", "Linked list"],
      zh: ["归并", "分治", "链表"],
    },
    hint: {
      en: "Do not take the first list and merge the other lists into it one by one, because that base list keeps growing. Merge the lists in pairs instead, which halves the number of lists each round.",
      zh: "别拿第一条链依次并入其余(越并越长)。两两配对合并,条数每轮减半。",
    },
    key: {
      en: (
        <>
          Merge in pairs: k lists become k/2, then k/4, down to 1, which is
          log₂k rounds. Each round moves every one of the N nodes exactly once,
          so the total is <b>O(N log k)</b> time and O(log k) stack. Merging one
          list at a time costs O(kN), because the base list grows with every
          merge. The other standard solution is a <b>min-heap</b> holding the k
          current head nodes: pop the smallest, append it, then push its
          successor. That is also O(N log k) time, with O(k) extra space, and it
          also works when the lists arrive as streams. Heaps are covered in
          DataData chapter 09. Worked example B in this chapter animates the
          pairwise merge.
        </>
      ),
      zh: (
        <>
          两两归并:k 条 → k/2 → … → 1,共 log₂k 轮;每轮把全部 N 个节点各搬一次 →
          <b>O(N log k)</b> 时间、O(log k) 递归栈。逐条并入是 O(kN),因为底链越并越长。另一主流解法是<b>优先队列(小顶堆)</b>:堆里放 k 条链的当前头节点,每次弹出最小的接到结果、再把它的后继入堆,同样 O(N log k),额外 O(k) 空间,而且天然支持流式到来的数据 —— 堆见 DataData · 09 堆。本章精讲 B 有分层合并动画。
        </>
      ),
    },
  },
  {
    lc: 4,
    title: {
      en: "Median of Two Sorted Arrays",
      zh: "寻找两个正序数组的中位数",
    },
    d: "hard",
    tags: {
      en: ["Divide and conquer", "Binary search", "Optional"],
      zh: ["分治", "二分", "选做"],
    },
    hint: {
      en: "The median splits both arrays with one cut each, so that every value on the left is at most every value on the right, and the left side holds exactly half of all elements.",
      zh: "中位数 = 把两数组各切一刀,使「左边全体 ≤ 右边全体」且左边元素个数恰好是总数的一半。",
    },
    key: {
      en: (
        <>
          Binary search the cut position in the <b>shorter</b> array. The cut in
          the other array follows, because the total number of elements on the
          left is fixed. Check that maxLeft ≤ minRight; if not, move the cut. The
          time is O(log min(m, n)) with O(1) extra space. This problem is hard
          for its edge cases: an empty side must be treated as −∞ or +∞, and the
          odd and even total lengths give different answers. Come back to it
          after chapter 03 on binary search, and treat it as the combined
          exercise for divide and conquer plus binary search.
        </>
      ),
      zh: (
        <>
          在<b>较短</b>的数组上二分它的切割位置,另一数组的切割位置由「左边总数固定」推出;校验 maxLeft ≤ minRight,不满足就调整切点。O(log min(m, n)) 时间、O(1) 额外空间。这题难在边界:空的一侧要当成 −∞ / +∞,总长为奇为偶时答案取法也不同。建议学完第 3 章「二分进阶」再回头做,当作分治与二分的综合练习。
        </>
      ),
    },
  },
];
