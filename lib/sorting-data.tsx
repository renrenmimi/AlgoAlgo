// 第 1 章 · 排序 —— 题单与测验数据。
// 题单覆盖 lc.md 排序主线(归并/快排双解、双指针合并、partition 变体、
// 自定义比较器、计数),由易到难;hint 只给方向,key 一段话讲透。
// 双语:title / tags / hint / key 与所有测验文案都是 { en, zh };
// 英文题名用 LeetCode 官方英文标题,中文题名用官方中文标题。

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

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
          <code>v</code> 之前所有桶的和,就正好是「小于 <code>v</code> 的数字个数」。
          O(n + k) 完成,全程没有比较。这就是计数排序的直接应用 ——
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
          <b>从后往前填</b>,用三个指针。nums1 的尾部是空的,
          所以把两个候选里较大的那个写进最后一个空位,
          永远不会覆盖掉还没处理的值。正着填需要挪动元素,倒着填一遍就完。
        </>
      ),
    },
  },
  {
    lc: 1356,
    title: {
      en: "Sort Integers by The Number of 1 Bits",
      zh: "根据二进制中 1 的数目排序",
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
          <code>bin(x).count(&apos;1&apos;)</code>),个数相同再比值本身。
          要带走的想法是:<b>排序键可以是任何能比较的量</b>,不必是元素本身。
          也可以打包成 (1 的个数, 值) 这样的二元组直接排 —— 元组比较本来就是逐字段进行的。
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
          本章两个主要算法的练兵场。<b>归并</b>:劈成两半,各自排好,再合并;
          稳定,最坏也是 O(n log n),需要 O(n) 辅助空间。
          <b>快排</b>:围绕基准划分,再对两侧递归;原地、平均最快,
          但<b>必须用随机基准</b>,否则已排序的输入会把它拖到 O(n²)。
          LeetCode 放了已排序的用例,也放了所有值相等的用例,朴素写法会超时。
          全相等的情况光靠随机基准不够,要改用三路划分。
          本章对两种解法都配了逐帧动画。
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
          <code>i</code>. One pass, O(n) time, O(1) space. This is also the core
          of the three-way quicksort used when the input has many duplicates.
        </>
      ),
      zh: (
        <>
          荷兰国旗问题,就是把 partition 从两段推广到三段。三个指针:
          <code>lo</code>(0 区右界)、<code>hi</code>(2 区左界)、
          <code>i</code>(扫描)。遇到 0,与 <code>lo</code> 交换,两个指针都前进;
          遇到 2,与 <code>hi</code> 交换,而且 <b>i 不动</b> ——
          从 <code>hi</code> 换回来的值还没检查过;遇到 1,只让 <code>i</code> 前进。
          一趟扫完,时间 O(n),空间 O(1)。它也是输入含大量重复值时所用的三路快排的核心。
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
          这里的排序是准备工作,不是目的。按左端点排序之后,
          能合并的区间一定相邻,所以线性扫一遍就够了:
          记住当前合并段的右端点 <code>end</code>;
          下一个区间的左端点 ≤ <code>end</code> 就扩大 <code>end</code>,
          否则收尾并另起一段。排序 O(n log n) 加扫描 O(n)。
          本章精讲 C 有逐帧动画。「排序把结构显出来,再线性处理」能解一大类题。
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
          经典的自定义比较器题:判断 a 是否应排在 b 前面,
          就把拼接结果 <code>a+b</code> 与 <code>b+a</code> 当字符串比较,
          谁拼出来的字符串更大谁排前面。这个比较满足传递性(可以证明),
          所以能安全用于排序。把排好的列表拼起来就是答案,注意处理前导零:
          输入全是 0 时应返回 <code>&quot;0&quot;</code>。
          这题的收获是:排序排出什么顺序,完全由比较器定义。
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
          recurse into the side that contains the target only. Average O(n), and
          randomize the pivot to make the worst case unlikely. <b>Heap</b>: keep
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
          两条路。<b>快速选择</b>:做一次 partition,看基准落在哪个下标;
          正好是目标下标就返回,否则只在包含目标的那一侧继续。平均 O(n),
          基准要随机化以降低最坏情况的概率。<b>堆</b>:维护一个大小为 K 的小顶堆,
          O(n log K),不修改输入,而且能处理逐个到达的数据流
          (堆见 DataData · 09)。面试通常要你对比两者:
          快速选择平均更快,但会打乱数组,最坏 O(n²);
          堆更慢但结果可预期,还能处理装不进内存的数据。本章精讲 B 有详细讲解。
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
      en: "Reading a linked list at an arbitrary position is expensive, so quicksort's index jumps do not fit. Which sort works well on a structure you can only walk forward through?",
      zh: "链表按下标随机访问很贵,快排的下标跳转不适合。哪种排序天然适合「只能顺着往前走」的结构?",
    },
    key: {
      en: (
        <>
          Merge sort is the natural fit for linked lists: find the middle with a
          slow and a fast pointer, cut the list in two, sort each half
          recursively, then merge the two sorted lists — merging lists needs no
          extra array, only pointer updates. The recursive version uses O(log n)
          stack space. The bottom-up version merges runs of length 1, then 2,
          then 4, and so on, which reaches genuine O(1) extra space. Quicksort is
          awkward here because it needs O(1) access by index, which a linked list
          does not provide. The structure decides which algorithm to use.
        </>
      ),
      zh: (
        <>
          归并排序天然适合链表:用快慢指针找中点,把链表断成两半,
          递归排好每一半,再合并两条有序链 ——
          合并链表不需要额外数组,改指针就行。递归版占 O(log n) 栈空间。
          自底向上的版本按长度 1、2、4…… 依次两两合并,能做到真正的 O(1) 额外空间。
          快排在这里很别扭,因为它需要按下标 O(1) 访问,而链表给不了。
          结构决定了该用哪个算法。
        </>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "Why does any comparison-based sort need at least Ω(n log n) comparisons in the worst case?",
      zh: "为什么任何基于比较的排序,最坏情况下至少需要 Ω(n log n) 次比较?",
    },
    opts: {
      en: [
        "n elements have n! possible orders, and each comparison has only two outcomes; to tell n! cases apart, the decision tree needs at least log₂(n!) ≈ n log n levels",
        "Because merge sort is O(n log n), that must be the lower bound",
        "Because one pass over an array is O(n), and sorting needs log n passes",
        "Because quicksort is O(n log n) on average",
      ],
      zh: [
        "n 个元素有 n! 种可能的顺序,而每次比较只有两种结果;要区分 n! 种情况,决策树至少要有 log₂(n!) ≈ n log n 层",
        "因为归并排序是 O(n log n),所以这就是下界",
        "因为遍历数组一遍是 O(n),排序需要遍历 log n 遍",
        "因为快排平均是 O(n log n)",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Using the cost of one particular algorithm as the lower bound is circular. A lower bound has to show that no comparison sort can be faster, and the argument for that is the height of the decision tree.",
        '"log n passes" is a rough description of how some algorithms behave. It is not a proof, and it does not explain why O(n) is impossible.',
        "Again this takes one algorithm's performance as the bound. Quicksort is also O(n²) in the worst case, so its average behaviour cannot be used to argue about a worst-case lower bound.",
      ],
      zh: [
        undefined,
        "拿某一个具体算法的代价当下界是循环论证。下界必须说明「没有任何比较排序能更快」,这个论证靠的是决策树的高度。",
        "「遍历 log n 遍」只是对某些算法行为的粗略描述,它不是证明,也解释不了为什么不可能是 O(n)。",
        "同样是把某个算法的表现当成下界。而且快排最坏是 O(n²),用它的平均表现来论证最坏情况的下界不成立。",
      ],
    },
    why: {
      en: (
        <>
          Each comparison answers one yes/no question, so a run of the algorithm
          is a path in a binary decision tree, and a tree of height h has at most
          2ʰ leaves. To distinguish n! orders you need 2ʰ ≥ n!, that is h ≥
          log₂(n!) ≈ n log n. Note the scope: this bound applies to{" "}
          <b>comparison-based</b> sorting only. Counting, bucket, and radix sort
          are not covered by it because they make no comparisons; they use the
          value range instead.
        </>
      ),
      zh: (
        <>
          每次比较回答一个「是 / 否」的问题,所以算法的一次运行是二叉决策树上的一条路径,
          而高为 h 的树最多有 2ʰ 个叶子。要区分 n! 种顺序就需要 2ʰ ≥ n!,
          即 h ≥ log₂(n!) ≈ n log n。注意适用范围:这条下界只管
          <b>基于比较</b>的排序。计数、桶、基数排序不在其中,
          因为它们不做比较,用的是值域信息。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: "Which of these four sorts is stable — that is, elements with equal keys keep their original relative order?",
      zh: "下面四种排序,哪一种是稳定的 —— 也就是键相等的元素排完后仍保持原来的相对顺序?",
    },
    opts: {
      en: ["Merge sort", "Quicksort", "Heap sort", "Selection sort"],
      zh: ["归并排序", "快速排序", "堆排序", "选择排序"],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "During partition, quicksort swaps elements across long distances, which can move a later element in front of an equal one. The standard in-place version is not stable.",
        "Heap sort swaps elements between positions that are far apart while building the heap and while sifting down, so the relative order of equal elements is not preserved.",
        "Selection sort moves the minimum to the front with one long swap, which often jumps over an equal element. A short example: [5a, 5b, 3] becomes [3, 5b, 5a], so 5b now comes before 5a.",
      ],
      zh: [
        undefined,
        "快排在 partition 时会做长距离交换,可能把靠后的元素挪到与它相等的元素前面。标准的原地版本不稳定。",
        "堆排序在建堆和下沉的过程中会在相距很远的位置之间交换元素,相等元素的相对顺序保不住。",
        "选择排序用一次长距离交换把最小值送到前面,这一跳常常越过相等的元素。举个短例子:[5a, 5b, 3] 会变成 [3, 5b, 5a],于是 5b 跑到了 5a 前面。",
      ],
    },
    why: {
      en: (
        <>
          The merge step takes the left value when the two candidates are equal,
          which preserves the original order, so merge sort is stable. Insertion
          sort and bubble sort are stable too. Stability pays off when you sort
          by more than one key: sort by the secondary key first, then by the
          primary key with a stable sort, and the secondary order survives inside
          each group of equal primary keys. LC 1356 relies on exactly this.
        </>
      ),
      zh: (
        <>
          合并这一步在两个候选相等时取左边,原有顺序因此被保留,所以归并排序稳定。
          插入排序和冒泡排序也稳定。稳定性在按多个键排序时才体现价值:
          先按次要键排,再用稳定排序按主要键排,
          于是主键相同的那一组里,次要键的顺序被保留下来。LC 1356 靠的正是这一点。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          What is the <b>average</b> time complexity of quickselect for finding
          the kth largest element? (Use the O(...) form, such as O(n) or O(n log
          n).)
        </>
      ),
      zh: (
        <>
          快速选择(quickselect)求第 K 大元素,<b>平均</b>时间复杂度是多少?
          (用 O(...) 形式,例如 O(n) 或 O(n log n)。)
        </>
      ),
    },
    placeholder: {
      en: "Type a complexity, for example O(n)…",
      zh: "输入复杂度,例如 O(n)…",
    },
    answers: ["O(n)", "o(n)", "n"],
    hint: {
      en: "After each partition it searches only the side that contains the target, and the expected size halves each time: what does n + n/2 + n/4 + … add up to?",
      zh: "每次划分之后它只在包含目标的那一侧继续,期望规模每轮减半:n + n/2 + n/4 + … 加起来是多少?",
    },
    why: {
      en: (
        <>
          n + n/2 + n/4 + … = 2n = O(n) on average. Compare: a full sort is O(n
          log n), and the heap solution is O(n log K). The cost is the worst
          case, O(n²), which happens when the pivot is always near one end, so
          the pivot must be chosen at random. The idea to remember: if you only
          want the value at one position, you do not have to order everything
          else.
        </>
      ),
      zh: (
        <>
          n + n/2 + n/4 + … = 2n = O(n),这是平均情况。
          对比:完整排序是 O(n log n),堆解法是 O(n log K)。
          代价是最坏情况 O(n²) —— 当基准每次都靠近一端时发生,
          所以基准必须随机选。要记住的想法是:
          只要一个位置上的值,就不必把其余所有元素也排好。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: "After one pass of the quicksort partition, what is true about the pivot element?",
      zh: "快排的 partition 走完一趟之后,关于基准元素,下面哪句是对的?",
    },
    opts: {
      en: [
        "It is at the index it will have in the fully sorted array, with every value on its left ≤ it and every value on its right ≥ it",
        "It still has to move during the later recursive calls",
        "It always ends up in the middle of the array",
        "It is only marked; its value is not decided yet",
      ],
      zh: [
        "它已经位于完全有序数组里属于它的下标上,左边的值都 ≤ 它,右边的值都 ≥ 它",
        "它在后面的递归里还需要继续移动",
        "它一定落在数组正中间",
        "它只是被标记了,值还没确定",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The opposite is true, and that is the point of partition: the pivot arrives at its final index in one pass and never moves again. This is exactly what lets quickselect discard one whole side.",
        "Where the pivot lands depends on how many values are smaller than it, so it can be anywhere. Landing in the middle is the good case, not a guarantee — a pivot near one end is what causes the O(n²) worst case.",
        "The value was decided when you chose the pivot. What partition does is move it to the correct index.",
      ],
      zh: [
        undefined,
        "恰恰相反,而这正是 partition 的意义:基准一趟就到达最终下标,再也不动。快速选择能整块丢掉一侧,靠的就是这一点。",
        "基准落在哪里,取决于有多少值比它小,所以可能在任何位置。落在中间是好情况,不是保证 —— 基准靠近一端正是 O(n²) 最坏情况的成因。",
        "值在你选择基准时就已经确定了。partition 做的是把它移动到正确的下标上。",
      ],
    },
    why: {
      en: (
        <>
          The invariant of partition: when it finishes, everything left of the
          pivot is ≤ the pivot and everything right of it is ≥ the pivot, so the
          index the pivot occupies is its position in the sorted array.
          Quicksort uses this by recursing on both sides; quickselect uses the
          same partition but continues on one side only. One operation, two
          algorithms.
        </>
      ),
      zh: (
        <>
          partition 的不变量:结束时基准左边的值都 ≤ 基准,右边的值都 ≥ 基准,
          所以基准所在的下标就是它在有序数组里的位置。
          快排利用这一点对两侧都递归;快速选择用同一个 partition,但只在一侧继续。
          同一个操作,两种算法。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: "Which statements about counting, bucket, and radix sort (the non-comparison sorts) are correct? Select all that apply.",
      zh: "关于计数排序 / 桶排序 / 基数排序(非比较排序),哪些说法正确?(多选)",
    },
    opts: {
      en: [
        "They never compare two elements, so the Ω(n log n) bound for comparison sorts does not apply to them",
        "Counting sort suits integers whose value range k is small, and runs in O(n + k)",
        "When the value range is huge, for example arbitrary 64-bit integers, counting sort can be slower than quicksort or run out of memory",
        "They can sort any comparable objects, such as structs ordered by several fields, so they are more general than quicksort",
      ],
      zh: [
        "它们从不比较两个元素,所以针对比较排序的 Ω(n log n) 下界管不到它们",
        "计数排序适合值域 k 较小的整数,时间 O(n + k)",
        "值域极大时(例如任意 64 位整数),计数排序可能比快排还慢,甚至耗尽内存",
        "它们能对任意可比较的对象排序(比如按多个字段排的结构体),因此比快排更通用",
      ],
    },
    correct: [0, 1, 2],
    missHint: {
      en: "The first three all describe why non-comparison sorts can be faster and what limits them. If you missed one, think again about the role of the value range k.",
      zh: "前三条都在讲非比较排序为什么能更快、又受什么限制。漏掉了某一条的话,再想想值域 k 的作用。",
    },
    extraHint: {
      en: "One option is wrong: non-comparison sorts are the opposite of general. They need keys that map to a bounded range of integers or to buckets, and they cannot use an arbitrary comparison rule.",
      zh: "有一条是错的:非比较排序恰恰不通用。它们要求键能映射到有界的整数范围或桶,无法使用任意的比较规则。",
    },
    why: {
      en: (
        <>
          Counting, bucket, and radix sort replace comparison with information
          about the value range, which is how counting sort reaches O(n + k) and
          radix sort reaches O(d(n + k)). The price is that they only apply when
          the key can be turned into a bounded integer or a bucket index, and
          that both time and space get out of control when k is large. Quicksort
          and merge sort remain the general tools: anything you can compare in
          pairs, they can sort.
        </>
      ),
      zh: (
        <>
          计数、桶、基数排序用值域信息代替比较,
          计数排序因此是 O(n + k),基数排序是 O(d(n + k))。
          代价是它们只在键能变成有界整数或桶下标时才适用,
          而且 k 一大,时间和空间都会失控。
          快排和归并才是通用工具:凡是能两两比较的东西,它们都能排。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: "LC 179, largest number: build the largest integer from [3, 30, 34, 5, 9]. Which comparison rule is correct?",
      zh: "LC 179 最大数:把 [3, 30, 34, 5, 9] 拼成最大的整数。正确的比较规则是哪个?",
    },
    opts: {
      en: [
        "To compare a and b, compare the strings a+b and b+a, and put the one that gives the larger string first",
        "Sort by value from largest to smallest, then concatenate",
        "Sort by number of digits, from most to fewest",
        "Sort by the first digit of each number, from largest to smallest",
      ],
      zh: [
        "比较 a 和 b 时,比较拼接字符串 a+b 与 b+a,拼出更大字符串的排前面",
        "按数值从大到小排,然后直接拼接",
        "按位数从多到少排",
        "按每个数的首位数字从大到小排",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        'Sorting by value gives 34, 30, 9, 5, 3, which is not the largest. Consider [30, 3]: 30 > 3 by value, but "303" < "330", so 3 has to come first.',
        'More digits does not mean a larger result: 9 (one digit) must come before 30 (two digits), because "930" > "309".',
        'Looking only at the first digit fails when first digits are equal: in [3, 30] both start with 3, so the rule cannot order them, yet the answer requires 3 before 30.',
      ],
      zh: [
        undefined,
        "按数值排会得到 34、30、9、5、3,拼出来并不是最大。看 [30, 3]:数值上 30 > 3,但「303」<「330」,所以 3 必须排前面。",
        "位数多不等于拼出来更大:9(一位)必须排在 30(两位)前面,因为「930」>「309」。",
        "只看首位在首位相同时会失效:[3, 30] 的首位都是 3,这个规则分不出先后,而答案要求 3 排在 30 前面。",
      ],
    },
    why: {
      en: (
        <>
          Define &quot;a comes before b&quot; directly as the string comparison
          a+b versus b+a. That answers the question in one step, and the relation
          can be proved transitive, so it is safe to hand to a sort. The lesson:
          the order a sort produces is defined by the comparator, so choosing the
          right comparator turns a hard problem into a plain sort. Remember the
          leading-zero case: [0, 0] must return &quot;0&quot;, not
          &quot;00&quot;.
        </>
      ),
      zh: (
        <>
          直接把「a 应排在 b 前面」定义成字符串比较 a+b 与 b+a,一步到位;
          而且这个关系可以证明满足传递性,所以能安全交给排序。
          这题的收获是:排序排出什么顺序由比较器定义,
          选对比较器,难题就变成了普通排序。别忘了前导零的情况:
          [0, 0] 应返回「0」而不是「00」。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: "On an array that is already nearly sorted, what is the best-case time complexity of insertion sort?",
      zh: "在一个已经近乎有序的数组上,插入排序的最好情况时间复杂度是多少?",
    },
    opts: {
      en: [
        "O(n) — almost no value has to move back, so the inner loop stops immediately",
        "O(n log n)",
        "O(n²); insertion sort is always quadratic",
        "O(log n)",
      ],
      zh: [
        "O(n) —— 几乎没有值需要往回挪,内层循环立刻停止",
        "O(n log n)",
        "O(n²),插入排序永远是平方级",
        "O(log n)",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "O(n log n) is the level of merge sort and heap sort. On nearly sorted data insertion sort is faster than that and reaches linear time, which is exactly its advantage on small arrays and on sorted runs.",
        "O(n²) is the worst case, which happens on input in reverse order. Insertion sort is very sensitive to how sorted the input already is, and its best case is O(n).",
        "O(log n) is not even enough to look at every element once. Any sort must be at least O(n), and insertion sort has to draw every card.",
      ],
      zh: [
        undefined,
        "O(n log n) 是归并和堆排序的量级。近乎有序时插入排序比这更快,能达到线性 —— 这正是它在小数组和有序片段上的优势。",
        "O(n²) 是最坏情况,发生在输入完全逆序时。插入排序对输入的有序程度非常敏感,它的最好情况是 O(n)。",
        "O(log n) 连把每个元素看一遍都不够。任何排序至少是 O(n),而插入排序必须把每张牌都摸一次。",
      ],
    },
    why: {
      en: (
        <>
          On nearly sorted data the inner loop that searches backwards stops
          almost immediately for every card, so the total cost is about O(n).
          This is why TimSort, used by Python and by Java for objects, applies
          insertion sort to short pieces and to stretches that are already
          sorted, and then merges those pieces.
        </>
      ),
      zh: (
        <>
          近乎有序时,每摸一张牌,那个往回找位置的内层循环几乎立刻就停,
          所以总代价约为 O(n)。这正是 TimSort
          (Python 用它,Java 排对象也用它)对短片段和天然有序的片段
          先用插入排序、再把这些片段合并起来的原因。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: "An interviewer asks you to choose between quickselect and a heap of size K for LC 215. Which statement of the trade-off is the most accurate?",
      zh: "面试官让你在 quickselect 和「大小为 K 的堆」之间为 LC 215 选一个,下面哪句对取舍的描述最准确?",
    },
    opts: {
      en: [
        "Quickselect is O(n) on average and usually faster, but it reorders the input and is O(n²) in the worst case; the heap is O(n log K), slower but predictable, does not modify the input, and works on a stream",
        "The heap is always faster because it is O(log n)",
        "The two are equivalent, so either is fine",
        "Quickselect is always better because it needs no extra space",
      ],
      zh: [
        "quickselect 平均 O(n),通常更快,但它会打乱输入,最坏 O(n²);堆是 O(n log K),更慢但结果可预期,不修改输入,还能处理数据流",
        "堆一定更快,因为它是 O(log n)",
        "两者完全等价,选哪个都行",
        "quickselect 一定更好,因为它不需要额外空间",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The heap solution is O(n log K), not O(log n): every one of the n values has to be offered to the heap. And it is not faster in general — quickselect is O(n) on average.",
        "There is a real trade-off here: speed, whether the input may be reordered, and whether the data can be held in memory at once. Different situations give different answers.",
        "Quickselect is close to in-place, but the price is that it reorders the input and is O(n²) in the worst case. When the data is read-only, or arrives as a stream, the heap is the correct choice.",
      ],
      zh: [
        undefined,
        "堆解法是 O(n log K),不是 O(log n):n 个值都要过一遍堆。而且它并不更快 —— quickselect 平均是 O(n)。",
        "这里有实实在在的取舍:速度、是否允许打乱输入、数据能否一次装进内存。场景不同,答案就不同。",
        "quickselect 确实接近原地,但代价是它会打乱输入,且最坏 O(n²)。数据只读、或者以流的形式到达时,堆才是对的选择。",
      ],
    },
    why: {
      en: (
        <>
          There is no single right answer: if the data fits in memory, may be
          reordered, and you want the best average speed, use quickselect; if the
          data is a stream, is read-only, or you need a worst-case guarantee, use
          a heap of size K at O(n log K). Being able to state this trade-off
          scores better than knowing only one solution. Heaps are covered in
          DataData · 09.
        </>
      ),
      zh: (
        <>
          没有唯一正确答案:数据放得下内存、允许打乱、想要最好的平均速度,
          就用 quickselect;数据是流、是只读的、或者需要最坏情况的保证,
          就用大小为 K 的堆,O(n log K)。
          能把这组取舍说清楚,比只会一种解法更能拿分。堆见 DataData · 09。
        </>
      ),
    },
  },
];
