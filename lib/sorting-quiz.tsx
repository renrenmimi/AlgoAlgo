// Chapter 1 - Sorting: quiz data.
// Kept apart from the problem set so that the atlas, which lists every chapter's problems,
// does not load the quizzes too.

import type { QuizItem } from "@/lib/quiz";

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
        "Again this takes one algorithm's performance as the bound. Quicksort is also O(n²) in the worst case, so its average behavior cannot be used to argue about a worst-case lower bound.",
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
          每次比较回答一个「是 / 否」的问题,所以算法的一次运行是二叉决策树上的一条路径,而高为 h 的树最多有 2ʰ 个叶子。要区分 n! 种顺序就需要 2ʰ ≥ n!,即 h ≥ log₂(n!) ≈ n log n。注意适用范围:这条下界只管
          <b>基于比较</b>的排序。计数、桶、基数排序不在其中,因为它们不做比较,用的是值域信息。
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
          each group of equal primary keys. LC 1356 can also be solved this way.
        </>
      ),
      zh: (
        <>
          合并这一步在两个候选相等时取左边,原有顺序因此被保留,所以归并排序稳定。插入排序和冒泡排序也稳定。稳定性在按多个键排序时才体现价值:先按次要键排,再用稳定排序按主要键排,于是主键相同的那一组里,次要键的顺序被保留下来。LC 1356 也可以这样解。
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
          n + n/2 + n/4 + … = 2n = O(n),这是平均情况。对比:完整排序是 O(n log n),堆解法是 O(n log K)。代价是最坏情况 O(n²) —— 当基准每次都靠近一端时发生,所以基准必须随机选。要记住的想法是:只要一个位置上的值,就不必把其余所有元素也排好。
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
          partition 的不变量:结束时基准左边的值都 ≤ 基准,右边的值都 ≥ 基准,所以基准所在的下标就是它在有序数组里的位置。快排利用这一点对两侧都递归;快速选择用同一个 partition,但只在一侧继续。同一个操作,两种算法。
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
          计数、桶、基数排序用值域信息代替比较,计数排序因此是 O(n + k),基数排序是 O(d(n + k))。代价是它们只在键能变成有界整数或桶下标时才适用,而且 k 一大,时间和空间都会失控。快排和归并才是通用工具:凡是能两两比较的东西,它们都能排。
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
          直接把「a 应排在 b 前面」定义成字符串比较 a+b 与 b+a,一步到位;而且这个关系可以证明满足传递性,所以能安全交给排序。这题的收获是:排序排出什么顺序由比较器定义,选对比较器,难题就变成了普通排序。别忘了前导零的情况:
          [0, 0] 应返回「0」而不是「00」。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: "On an array that is already nearly sorted, about how long does insertion sort take?",
      zh: "在一个已经近乎有序的数组上,插入排序大约要花多少时间?",
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
        "O(log n) is not even enough to look at every element once. Any sort needs at least Ω(n), and insertion sort has to draw every card.",
      ],
      zh: [
        undefined,
        "O(n log n) 是归并和堆排序的量级。近乎有序时插入排序比这更快,能达到线性 —— 这正是它在小数组和有序片段上的优势。",
        "O(n²) 是最坏情况,发生在输入完全逆序时。插入排序对输入的有序程度非常敏感,它的最好情况是 O(n)。",
        "O(log n) 连把每个元素看一遍都不够。任何排序至少要 Ω(n),而插入排序必须把每张牌都摸一次。",
      ],
    },
    why: {
      en: (
        <>
          On nearly sorted data the inner loop that searches backwards stops
          almost immediately for every card, so the total cost is about O(n).
          This is why TimSort, used by Python and by Java for objects, keeps the
          stretches that are already sorted as they are, uses insertion sort only
          to extend runs that are too short to a minimum length, and then merges
          the runs.
        </>
      ),
      zh: (
        <>
          近乎有序时,每摸一张牌,那个往回找位置的内层循环几乎立刻就停,所以总代价约为 O(n)。这正是 TimSort
          (Python 用它,Java 排对象也用它)会保留天然有序的片段,只用插入排序把过短的片段补到最小长度,再把各段归并的原因。
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
          没有唯一正确答案:数据放得下内存、允许打乱、想要最好的平均速度,就用 quickselect;数据是流、是只读的、或者需要最坏情况的保证,就用大小为 K 的堆,O(n log K)。能把这组取舍说清楚,比只会一种解法更有说服力。堆见 DataData · 09。
        </>
      ),
    },
  },
];
