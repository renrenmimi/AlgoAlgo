// Chapter 1 - Sorting: problem set (the quiz is in lib/sorting-quiz.tsx).
// The problem set covers lc.md's sorting track (merge sort and quicksort as two solutions to
// the same problem, two-pointer merging, partition variants, custom comparators, counting),
// ordered easy to hard; hint only points at a direction, key explains it fully in one
// paragraph.
// Bilingual: title / tags / hint / key and all quiz copy are { en, zh };
// English titles use LeetCode's official English names, Chinese titles its official Chinese
// names.

import type { Problem } from "@/lib/problems";

export const PROBLEMS: Problem[] = [
  {
    lc: 1365,
    title: {
      en: "How Many Numbers Are Smaller Than the Current Number",
      zh: "有多少小于当前数字的数字",
    },
    d: "easy",
    tags: { en: ["Counting sort", "Prefix sum"], zh: ["计数排序", "前缀和"] },
    hint: {
      en: "Every value is between 0 and 100. Instead of comparing every pair in O(n²), count how many times each value appears.",
      zh: "所有值都在 0 到 100 之间。与其两两比较做 O(n²),不如先数一遍每个值出现几次。",
    },
    key: {
      en: (
        <>
          Make a counting array of size 101 and count how often each value
          appears, then take the prefix sum: the sum of all buckets before{" "}
          <code>v</code> is exactly how many numbers are smaller than{" "}
          <code>v</code>. That is O(n + k) with no comparison at all. It is
          counting sort applied directly — when the value range is small,
          counting is much faster than comparing.
        </>
      ),
      zh: (
        <>
          开一个大小 101 的计数数组,统计每个值出现的次数,再求前缀和:
          <code>v</code> 之前所有桶的和,就正好是「小于 <code>v</code> 的数字个数」。O(n + k) 完成,全程没有比较。这就是计数排序的直接应用 ——
          值域小的时候,数数比比较快得多。
        </>
      ),
    },
  },
  {
    lc: 88,
    title: { en: "Merge Sorted Array", zh: "合并两个有序数组" },
    d: "easy",
    tags: {
      en: ["Two pointers", "Merge", "In-place"],
      zh: ["双指针", "归并", "原地"],
    },
    hint: {
      en: "Both arrays are already sorted, so merging itself is O(m+n). The difficulty is writing the result into nums1 in place: filling from the front overwrites values you still need. Which end is safe?",
      zh: "两个数组都已有序,合并本身是 O(m+n)。难点在于要原地写进 nums1:从前往后填会覆盖还没用到的值。从哪一头填才安全?",
    },
    key: {
      en: (
        <>
          This is the merge step of merge sort on its own. The technique:{" "}
          <b>fill from the back</b> with three pointers. The tail of nums1 is
          empty, so writing the larger of the two candidates into the last free
          slot can never overwrite a value that has not been processed yet.
          Filling forward would require shifting elements; filling backward
          finishes in one pass.
        </>
      ),
      zh: (
        <>
          这道题就是归并排序里的合并步骤单独拿出来考。技巧是:
          <b>从后往前填</b>,用三个指针。nums1 的尾部是空的,所以把两个候选里较大的那个写进最后一个空位,永远不会覆盖掉还没处理的值。正着填需要挪动元素,倒着填一遍就完。
        </>
      ),
    },
  },
  {
    lc: 1356,
    title: {
      en: "Sort Integers by The Number of 1 Bits",
      zh: "根据数字二进制下 1 的数目排序",
    },
    d: "easy",
    tags: {
      en: ["Comparator", "Stability"],
      zh: ["自定义比较器", "稳定性"],
    },
    hint: {
      en: "The sort key is not the value itself but the number of 1 bits in it. Values with the same bit count are ordered by value. How do you put two keys into one comparator?",
      zh: "排序键不是值本身,而是它二进制里 1 的个数。个数相同的再按值排。怎么把两个键放进一个比较器?",
    },
    key: {
      en: (
        <>
          Write a comparator that first compares the number of 1 bits (
          <code>Integer.bitCount</code> in Java,{" "}
          <code>bin(x).count(&apos;1&apos;)</code> in Python), and compares the
          values themselves when the counts are equal. The idea to take away is
          that <b>a sort key can be any value you can compare</b>; it does not
          have to be the element. You can also pack it as the pair (bit count,
          value) and sort the pairs — pair comparison already works field by
          field.
        </>
      ),
      zh: (
        <>
          写一个比较器:先比二进制里 1 的个数(Java 用{" "}
          <code>Integer.bitCount</code>,Python 用{" "}
          <code>bin(x).count(&apos;1&apos;)</code>),个数相同再比值本身。要带走的想法是:<b>排序键可以是任何能比较的量</b>,不必是元素本身。也可以打包成 (1 的个数, 值) 这样的二元组直接排 —— 元组比较本来就是逐字段进行的。
        </>
      ),
    },
  },
  {
    lc: 912,
    title: { en: "Sort an Array", zh: "排序数组" },
    d: "medium",
    tags: {
      en: ["Merge sort", "Quicksort", "Template"],
      zh: ["归并", "快排", "模板"],
    },
    hint: {
      en: "The built-in sort solves this in one line, but the point of the problem is to write an O(n log n) sort yourself. Pick merge sort or quicksort — ideally learn both.",
      zh: "内置 sort 一行就能过,但这道题的意义是让你自己写一个 O(n log n) 排序。归并和快排选一个,最好两个都会。",
    },
    key: {
      en: (
        <>
          The practice ground for both main algorithms of this chapter.{" "}
          <b>Merge sort</b>: split in half, sort each half, merge; stable, O(n
          log n) even in the worst case, needs O(n) auxiliary space.{" "}
          <b>Quicksort</b>: partition around a pivot, then recurse on each side;
          in-place and fastest on average, but you <b>must use a random pivot</b>{" "}
          or sorted input drives it to O(n²). LeetCode includes test cases that
          are already sorted, and cases where every value is equal, so a naive
          version times out. For the all-equal case a random pivot is not enough;
          use a three-way partition. Both solutions have step-by-step animations
          in this chapter.
        </>
      ),
      zh: (
        <>
          本章两个主要算法的练习场。<b>归并</b>:劈成两半,各自排好,再合并;稳定,最坏也是 O(n log n),需要 O(n) 辅助空间。
          <b>快排</b>:围绕基准划分,再对两侧递归;原地、平均最快,但<b>必须用随机基准</b>,否则已排序的输入会把它拖到 O(n²)。LeetCode 放了已排序的用例,也放了所有值相等的用例,朴素写法会超时。全相等的情况光靠随机基准不够,要改用三路划分。本章对两种解法都配了逐帧动画。
        </>
      ),
    },
  },
  {
    lc: 75,
    title: { en: "Sort Colors", zh: "颜色分类" },
    d: "medium",
    tags: {
      en: ["Three-way partition", "Dutch flag"],
      zh: ["三路 partition", "荷兰国旗"],
    },
    hint: {
      en: "There are only three values, 0, 1, and 2, and the array must be sorted in one pass, in place. Think of the quicksort partition pointers, but with three regions instead of two.",
      zh: "只有 0、1、2 三种值,要求一趟扫完、原地完成。想想快排 partition 的指针,只是这次分三段而不是两段。",
    },
    key: {
      en: (
        <>
          The Dutch national flag problem: partition extended to three regions.
          Three pointers: <code>lo</code> (right edge of the 0 region),{" "}
          <code>hi</code> (left edge of the 2 region), and <code>i</code> (the
          scan). On 0, swap with <code>lo</code> and advance both. On 2, swap
          with <code>hi</code> and <b>do not advance i</b> — the value that came
          back from <code>hi</code> has not been examined yet. On 1, just advance{" "}
          <code>i</code>. Advancing <code>i</code> after a swap with{" "}
          <code>lo</code> is safe because the value coming back from{" "}
          <code>lo</code> has already been scanned: it is a 1, or{" "}
          <code>lo</code> and <code>i</code> are the same slot. One pass, O(n)
          time, O(1) space. This is also the core of the three-way quicksort used
          when the input has many duplicates.
        </>
      ),
      zh: (
        <>
          荷兰国旗问题,就是把 partition 从两段推广到三段。三个指针:
          <code>lo</code>(0 区右界)、<code>hi</code>(2 区左界)、
          <code>i</code>(扫描)。遇到 0,与 <code>lo</code> 交换,两个指针都前进;遇到 2,与 <code>hi</code> 交换,而且 <b>i 不动</b> ——
          从 <code>hi</code> 换回来的值还没检查过;遇到 1,只让 <code>i</code> 前进。与 <code>lo</code> 交换后 <code>i</code> 可以前进,是因为从 <code>lo</code>{" "}
          换回来的值已经扫描过:它是 1,或者 <code>lo</code> 与 <code>i</code> 本来就是同一格。一趟扫完,时间 O(n),空间 O(1)。它也是输入含大量重复值时所用的三路快排的核心。
        </>
      ),
    },
  },
  {
    lc: 56,
    title: { en: "Merge Intervals", zh: "合并区间" },
    d: "medium",
    tags: { en: ["Sorting", "Linear scan"], zh: ["排序应用", "扫描"] },
    hint: {
      en: "While the intervals are in random order it is hard to tell which ones overlap. What changes if you sort them by left endpoint first?",
      zh: "区间乱序时很难判断谁和谁重叠。如果先按左端点排好序,会有什么变化?",
    },
    key: {
      en: (
        <>
          Sorting here is preparation, not the goal. After sorting by left
          endpoint, intervals that can be merged are always adjacent, so one
          linear scan is enough: keep the right endpoint <code>end</code> of the
          current merged interval; if the next left endpoint is ≤{" "}
          <code>end</code>, extend <code>end</code>; otherwise close the current
          interval and start a new one. O(n log n) for the sort plus O(n) for the
          scan. Worked example C in this chapter animates it. &quot;Sort to make
          the structure visible, then handle it linearly&quot; solves a large
          family of problems.
        </>
      ),
      zh: (
        <>
          这里的排序是准备工作,不是目的。按左端点排序之后,能合并的区间一定相邻,所以线性扫一遍就够了:记住当前合并段的右端点 <code>end</code>;下一个区间的左端点 ≤ <code>end</code> 就扩大 <code>end</code>,否则收尾并另起一段。排序 O(n log n) 加扫描 O(n)。本章精讲 C 有逐帧动画。「排序把结构显出来,再线性处理」能解一大类题。
        </>
      ),
    },
  },
  {
    lc: 179,
    title: { en: "Largest Number", zh: "最大数" },
    d: "medium",
    tags: { en: ["Comparator", "Strings"], zh: ["自定义比较器", "字符串"] },
    hint: {
      en: "Is the largest number from [3, 30] equal to 330 or 303? Deciding which of two numbers goes first cannot be done by comparing their values.",
      zh: "把 [3, 30] 拼成最大数,是 330 还是 303?判断两个数谁该排在前面,不能只看数值大小。",
    },
    key: {
      en: (
        <>
          The classic custom comparator problem: to decide whether a comes before
          b, compare the concatenations <code>a+b</code> and <code>b+a</code> as
          strings, and put the one that produces the larger string first. This
          comparison is transitive, which can be proved, so it is safe to use for
          sorting. Concatenate the sorted list to get the answer, and handle
          leading zeros: if the input is all zeros, return{" "}
          <code>&quot;0&quot;</code>. The lesson: the order a sort produces is
          defined entirely by the comparator.
        </>
      ),
      zh: (
        <>
          经典的自定义比较器题:判断 a 是否应排在 b 前面,就把拼接结果 <code>a+b</code> 与 <code>b+a</code> 当字符串比较,谁拼出来的字符串更大谁排前面。这个比较满足传递性(可以证明),所以能安全用于排序。把排好的列表拼起来就是答案,注意处理前导零:输入全是 0 时应返回 <code>&quot;0&quot;</code>。这题的收获是:排序排出什么顺序,完全由比较器定义。
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
    tags: { en: ["Quickselect", "Heap"], zh: ["快速选择", "堆"] },
    hint: {
      en: "To get the kth largest, do you really have to sort the whole array? If you only want one position, partition can throw away about half the array each time.",
      zh: "要第 K 大,真的必须把整个数组排好吗?只想要一个位置的话,partition 每次能扔掉大约一半。",
    },
    key: {
      en: (
        <>
          Two approaches. <b>Quickselect</b>: run partition, look at where the
          pivot landed; if that index is the target, return the value, otherwise
          continue in the side that contains the target only. Average O(n).
          Randomize the pivot to make the sorted-input worst case unlikely, and
          partition three ways (smaller, equal, larger, as in LC 75): with many
          equal values a two-way partition removes one element per pass and costs
          O(n²), which a random pivot cannot prevent. <b>Heap</b>: keep
          a min-heap of size K, which is O(n log K), does not modify the input,
          and works on a stream of values (heaps are covered in DataData · 09).
          Interviewers usually ask you to compare them: quickselect is faster on
          average but reorders the array and is O(n²) in the worst case; the heap
          is slower but predictable and can handle data that does not fit in
          memory. Worked example B covers this in detail.
        </>
      ),
      zh: (
        <>
          两条路。<b>快速选择</b>:做一次 partition,看基准落在哪个下标;正好是目标下标就返回,否则只在包含目标的那一侧继续。平均 O(n)。基准要随机化,以降低「输入已排序」这种最坏情况的概率;还要按小于、等于、大于基准分三组(同 LC 75):相等值很多时,两路划分每趟只能去掉一个元素,代价是 O(n²),随机基准也挡不住。
          <b>堆</b>:维护一个大小为 K 的小顶堆,
          O(n log K),不修改输入,而且能处理逐个到达的数据流(堆见 DataData · 09)。面试通常要你对比两者:快速选择平均更快,但会打乱数组,最坏 O(n²);堆更慢但结果可预期,还能处理装不进内存的数据。本章精讲 B 有详细讲解。
        </>
      ),
    },
  },
  {
    lc: 148,
    title: { en: "Sort List", zh: "排序链表" },
    d: "medium",
    tags: {
      en: ["Merge sort", "Linked list", "O(1) space"],
      zh: ["归并", "链表", "O(1) 空间"],
    },
    hint: {
      en: "Reading a linked list at an arbitrary position is expensive, so the array version of quicksort, which swaps elements by index, does not carry over. Which sort works well on a structure you can only walk forward through?",
      zh: "链表按下标随机访问很贵,数组版快排那种按下标交换的写法搬不过来。哪种排序天然适合「只能顺着往前走」的结构?",
    },
    key: {
      en: (
        <>
          Merge sort is the natural fit for linked lists: find the middle with a
          slow and a fast pointer, cut the list in two, sort each half
          recursively, then merge the two sorted lists — merging lists needs no
          extra array, only pointer updates. The recursive version uses O(log n)
          stack space. The bottom-up version merges runs of length 1, then 2,
          then 4, and so on, which reaches genuine O(1) extra space. Quicksort can
          be written on a list too, by walking it into smaller, equal, and larger
          sublists, but without access by index a good pivot is hard to pick, a
          bad one makes it O(n²), and relinking nodes costs more per step than
          swapping array slots. Merge sort has none of these problems. The
          structure decides which algorithm to use.
        </>
      ),
      zh: (
        <>
          归并排序天然适合链表:用快慢指针找中点,把链表断成两半,递归排好每一半,再合并两条有序链 ——
          合并链表不需要额外数组,改指针就行。递归版占 O(log n) 栈空间。自底向上的版本按长度 1、2、4…… 依次两两合并,能做到真正的 O(1) 额外空间。链表上也能写快排(遍历一遍,分成小于、等于、大于基准的三条子链),但没有下标访问就很难选出好的基准,基准选得不好会退化到 O(n²),而且改链接的每一步开销比交换数组元素大。归并排序没有这些问题。结构决定了该用哪个算法。
        </>
      ),
    },
  },
];
