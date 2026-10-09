// Chapter 3 - Binary Search in Depth: quiz data.
// Kept apart from the problem set so that the atlas, which lists every chapter's problems,
// does not load the quizzes too.

import type { QuizItem } from "@/lib/quiz";

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
          lo + (hi − lo) / 2 只是把一个本来就装得下的差值减半,结果永远在 [lo, hi] 内。Python 整数任意精度,写 (lo + hi) // 2 也安全。JavaScript 的数字是双精度浮点,在 2⁵³ 以内精确,所以普通除法同样安全 —— 但{" "}
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
          <code>hi = mid</code> 把 hi 写回了它原本的值 —— 什么都没变,循环永远停不下来。每一轮至少要删掉 mid 这一格。闭区间 [lo, hi] 配的是 lo ≤ hi、hi = mid − 1、lo = mid + 1;只有以 lo &lt; hi 收尾的收敛型模板,才可以写 hi = mid。
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
          lower_bound(t) 等于「比 t 小的元素个数」,所以它也是第一个 ≥ t 的元素下标。t 缺席时,把 t 插在这个下标上仍然有序 —— 这就是 LC 35 直接等于 lower_bound 的原因。upper_bound(t) 是第一个 &gt; t 的下标,只差一个等号;当所有元素都 ≤ t 时,它同样返回数组长度。
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
          lower_bound(8) = 3、upper_bound(8) = 6,6 − 3 = 3。「两个边界一减得计数」是 LC 34 最实用的副产品:O(log n) 数出出现次数,不用逐个扫过相等的元素。
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
          二分不要求整个数组有序,只要求「一次比较就能决定保留哪一半」。旋转数组里恰好只有一个下跌处,所以最多一半会含有它:nums[lo] ≤ nums[mid]
          说明 [lo, mid] 有序,否则 [mid, hi] 有序。在有序的那一半里,用范围比较判断 target 在不在,另一半直接丢掉。
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
          三处取样的值相等时,nums[lo] ≤ nums[mid] 这个判据提供不了信息,只能退回 lo++、hi−−,每端各删一个元素。最坏情况下几乎每步都这样,于是 O(n)。这就是 33 / 153(无重复)能保持 O(log n),而 81 / 154 不能的原因。
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
          二分答案的标志是:判定只翻转一次,从否翻到是之后不再翻回去。875 / 1011 / 410 都在「候选答案的取值范围」上搜索,对每个候选调用一个 judge 函数,输入数组甚至不需要有序。704 搜索的是「已假定有序的数组」的下标,属于普通二分。
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
          k 增大时 Σ⌈pile / k⌉ 不会增加,所以 canFinish(k) 在小 k 处为假、从某一点起为真,且不再翻回去 —— 答案就是那个翻转点。用找边界模板:判定通过就记 ans = mid,再用 hi = mid − 1 继续找更小的。
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
          的一维数组。240 只保证行内、列内有序。站在右上角时,那个值是所在行的最大、所在列的最小,一次比较就能排掉一整列(左移)或一整行(下移),O(m + n)。
        </>
      ),
    },
  },
];
