// Chapter 2 - Divide and Conquer: quiz data.
// Kept apart from the problem set so that the atlas, which lists every chapter's problems,
// does not load the quizzes too.

import type { QuizItem } from "@/lib/quiz";
import { T } from "@/lib/i18n";

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "What are the three steps of divide and conquer, in order?",
      zh: "分治(Divide & Conquer)的三个步骤,按顺序是?",
    },
    opts: {
      en: [
        "Divide (cut into smaller problems of the same kind) → conquer (solve each one by recursion) → combine (build the final answer from the sub-answers)",
        "Guess a candidate → check whether it works → shrink the range",
        "Define the state → write the transition → set the base values",
        "Sort → two pointers → sliding window",
      ],
      zh: [
        "分(拆成同款子问题)→ 治(递归解决子问题)→ 合(把子答案拼成总答案)",
        "猜(选一个候选)→ 验(检查是否可行)→ 缩(缩小范围)",
        "定义状态 → 写转移方程 → 初始化",
        "排序 → 双指针 → 滑动窗口",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "That is binary search on the answer, which belongs to the binary search chapter. It is not the three-step skeleton of divide and conquer.",
        "That is the dynamic programming procedure. DP and divide and conquer part ways over one question: do the subproblems overlap?",
        "Those are array techniques covered in the sister site DataData. They are not the general model of divide and conquer.",
      ],
      zh: [
        undefined,
        "这是「二分答案」的节奏(猜-验-缩),属于二分那一章,不是分治的三步骨架。",
        "这是动态规划(DP)的流程 —— DP 与分治的分水岭只有一句话:子问题是否重叠。",
        "这些是依附数组结构的套路(由姊妹篇 DataData 负责),不是分治的通用心智模型。",
      ],
    },
    why: {
      en: "Divide, conquer, combine. Cut the problem into smaller problems of the same form, let the recursion solve each one, then build the final answer in the combine step. Merge sort, fast power, and LC 23 all use this skeleton.",
      zh: "分 / 治 / 合是分治的心智模型:先把问题切成同一形式的小问题,信任递归把每个小问题解决,最后在「合」这一步把子答案组合起来。归并排序、快速幂、LC 23 都是这副骨架。",
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Merge sort satisfies T(n) = 2T(n/2) + O(n). Using &quot;work per level
          × number of levels&quot;, what is the running time?
        </>
      ),
      zh: (
        <>
          归并排序的递推式 T(n) = 2T(n/2) + O(n)。用「每层工作量 × 层数」的直觉估,它是?
        </>
      ),
    },
    opts: {
      en: [
        "Each level merges O(n) elements in total, and cutting n down to 1 takes log₂n levels → O(n log n)",
        "2 × O(n) = O(n)",
        "O(n²), because it splits into two subproblems",
        "O(2ⁿ), because each call splits in two",
      ],
      zh: [
        "每层合并共 O(n),从 n 砍到 1 有 log₂n 层 → O(n log n)",
        "2 × O(n) = O(n)",
        "O(n²),因为分裂出两个子问题",
        "O(2ⁿ),因为每次分裂成两半",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "One level is not the whole tree. Each level costs O(n), and there are log n levels, so the sum is O(n log n).",
        "Two subproblems does not mean squaring. Each subproblem has size n/2, so the two together are still one level of O(n) work.",
        "Exponential growth happens when subproblems overlap and results are not stored, as in plain recursive Fibonacci. Merge sort's subproblems do not overlap and halve at every level, so it is O(n log n).",
      ],
      zh: [
        undefined,
        "不能只算一层 —— 要乘上层数 log n。单看一层是 O(n),整棵递归树累加才是 O(n log n)。",
        "「两个子问题」不等于平方:每个子问题规模只有 n/2,两个合起来仍是一层 O(n) 的活。",
        "指数级增长只发生在「子问题重叠且不记录结果」时(如朴素递归斐波那契);归并的子问题不重叠、规模逐层减半,是 O(n log n)。",
      ],
    },
    why: {
      en: "Draw the recursion tree, count the total work on one level, count the levels, and multiply. Merge sort does O(n) per level over log n levels → O(n log n) in the best, average, and worst case. The same counting gives T(n) = T(n/2) + O(1) → O(log n) for binary search and fast power.",
      zh: "把递归画成树,数「每层总工作量」和「共几层」再相乘。归并每层合并都是 O(n)、共 log n 层 → 最好、平均、最坏都是 O(n log n)。同一套数法:T(n) = T(n/2) + O(1) → O(log n)(二分查找、快速幂)。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          Fast power computes x¹⁶ with how many squarings? (x² → x⁴ → x⁸ → x¹⁶ —
          count them.)
        </>
      ),
      zh: (
        <>
          快速幂计算 x¹⁶ 要做几次平方?(x² → x⁴ → x⁸ → x¹⁶,数一数)
        </>
      ),
    },
    placeholder: { en: "Type a whole number…", zh: "输入一个整数…" },
    answers: ["4", "4次", "四", "四次", "four"],
    hint: {
      en: "16 is 2 to the power of 4. Each squaring doubles the exponent, so how many steps go from x¹ to x¹⁶?",
      zh: "16 是 2 的 4 次方:每一步把指数翻倍(平方一次),从 x¹ 到 x¹⁶ 需要几步?",
    },
    why: {
      en: "x² = x·x, x⁴ = (x²)², x⁸ = (x⁴)², x¹⁶ = (x⁸)². That is 4 squarings, against 15 multiplications for the plain loop. Each squaring doubles the exponent, so the count is log₂16 = 4. This is where O(log n) comes from. As everywhere in this chapter, trivial multiplications by 1 are not counted: the recursive code in §03 stops at x⁰ = 1, so on the way back it also computes 1 × 1 and 1 × x, which changes nothing about the growth.",
      zh: "x² = x·x,x⁴ =(x²)²,x⁸ =(x⁴)²,x¹⁶ =(x⁸)²,共 4 次平方,而暴力要乘 15 次。指数每次翻倍 ⇒ log₂16 = 4 步,这就是 O(log n) 的由来。和本章其他地方一样,这里不计与 1 相乘的平凡乘法:§03 的递归代码以 x⁰ = 1 为基例,回来的路上还会算 1 × 1 和 1 × x,但这不改变增长趋势。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In the divide and conquer solution to Maximum Subarray (LC 53), why is the answer not simply max(best in left half, best in right half)?",
      zh: "用分治解「最大子数组和」(LC 53),为什么答案不能简单地取 max(左半最大, 右半最大)?",
    },
    opts: {
      en: [
        "Because the best subarray may cross the midpoint, and neither half can see that case, so it has to be computed separately",
        "Because the best value in the left half may equal the best value in the right half",
        "Because divide and conquer requires adding the three results together",
        "Because the recursion misses the elements at the two ends of the array",
      ],
      zh: [
        "因为最大子数组可能横跨中点,这种情况左右两半各自都算不到,必须单独求「跨中点最大和」",
        "因为左半和右半的最大值可能相等",
        "因为分治规定必须把三个结果相加",
        "因为递归会漏掉数组两端的边界元素",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Equal values do not break anything, since you take the maximum either way. The case that is actually missed is the subarray sitting across the cut.",
        <>
          You do not add them, you take the <b>maximum</b> of the three: best on
          the left, best on the right, best crossing the midpoint.
        </>,
        "With a correct base case for a single element, the recursion covers both ends. The only case it misses is the one that crosses the midpoint.",
      ],
      zh: [
        undefined,
        "相等与否不影响正确性(取 max 即可)—— 真正的漏网之鱼是那段「骑在切口上」的子数组。",
        <>
          不是相加,而是三者<b>取 max</b>:左半最大 / 右半最大 / 跨中点最大。
        </>,
        "只要基例(单元素)写对,递归不会漏边界;被漏掉的恰恰是横跨中点的那一段。",
      ],
    },
    why: {
      en: "A subarray has exactly three possible homes: entirely left, entirely right, or crossing the midpoint. The first two come from the recursion. The crossing case must contain the midpoint, so scan outward from the midpoint for the best suffix on the left and the best prefix on the right, then add them. That scan is the combine step.",
      zh: "最大子数组有三种互斥归宿:全在左、全在右、跨中点。前两者交给递归,跨中点段必含中点,所以从中点向两侧扩,分别求左半最大后缀、右半最大前缀,再相加。这一次扫描就是「合」。",
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          You merge k sorted linked lists of length n each (N = kn nodes in
          total). What are the running times of &quot;merge the others into the
          first list one at a time&quot; and &quot;merge in pairs&quot;?
        </>
      ),
      zh: (
        <>
          合并 k 条各长 n 的有序链表(总节点 N = kn)。「拿第一条依次并入其余」与「两两归并」的时间复杂度分别是?
        </>
      ),
    },
    opts: {
      en: [
        "O(kN) and O(N log k)",
        "O(N) and O(N)",
        "O(N log N) and O(N log k)",
        "They are the same, both O(kN)",
      ],
      zh: [
        "O(kN) 与 O(N log k)",
        "O(N) 与 O(N)",
        "O(N log N) 与 O(N log k)",
        "两者一样,都是 O(kN)",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Merging one at a time makes the base list grow: merge number i walks about i·n nodes, and the sum is O(kN), not O(N).",
        "Merging one at a time is O(kN), not O(N log N). Only the pairwise version is O(N log k).",
        "Pairwise merging cuts the number of rounds from k to log k, so it is strictly better whenever k > 2.",
      ],
      zh: [
        undefined,
        "逐条并入时底链越来越长:第 i 次合并要扫过约 i·n 个节点,累加起来是 O(kN),不是 O(N)。",
        "逐条并入是 O(kN) 而非 O(N log N);只有两两归并才是 O(N log k)。",
        "两两归并把合并轮数从 k 压到 log k,只要 k > 2 就严格更优,不可能与逐条并入相同。",
      ],
    },
    why: {
      en: "Merging one at a time removes one list per round while the base list keeps growing → O(kN). Merging in pairs halves the number of lists each round, so there are log k rounds, and each round touches all N nodes once → O(N log k). Pairwise merging written recursively also uses O(log k) stack. Worked example B shows this.",
      zh: "逐条并入 = 每轮只消掉一条、且底链渐长 → O(kN);两两归并 = 每轮条数减半、共 log k 轮、每轮触碰全部 N 个节点 → O(N log k),递归写法额外 O(log k) 栈。这就是分治的杠杆(本章精讲 B)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "A classic fast power bug is computing x^(n/2) twice. Which line makes that mistake and falls back to O(n)?",
      zh: "快速幂的一个经典错误:把 x^(n/2) 算了两遍。下面哪种写法正好犯了这个错、退化成 O(n)?",
    },
    opts: {
      en: [
        "return pow(x, n/2) * pow(x, n/2) * (n odd ? x : 1);",
        "double h = pow(x, n/2); return h * h * (n odd ? x : 1);",
        "Iterative with bit operations: while (n) { if (n&1) res *= x; x *= x; n >>= 1; }",
        "Returning 1 as the base case when n == 0",
      ],
      zh: [
        "return pow(x, n/2) * pow(x, n/2) * (n 为奇 ? x : 1);",
        "double h = pow(x, n/2); return h * h * (n 为奇 ? x : 1);",
        "迭代 + 位运算:while (n) { if (n&1) res *= x; x *= x; n >>= 1; }",
        "n == 0 时返回 1 作为基例",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "That is the correct form: compute x^(n/2) once, store it in a variable, then square it. This is exactly what keeps the time at O(log n).",
        "The iterative version shifts n right once per round, so it loops log n times. It is correct and uses no stack.",
        "Returning 1 for n == 0 is the correct base case and has nothing to do with the slowdown.",
      ],
      zh: [
        undefined,
        "这是标准写法:先把 x^(n/2) 存进变量、只算一次,再自乘 —— 正是 O(log n) 的关键。",
        "迭代位运算版每轮把 n 右移一位,循环 log n 次,既正确又没有递归栈开销。",
        "n == 0 返回 1 是正确的基例,和退化无关。",
      ],
    },
    why: {
      en: "Two recursive calls per level double the number of calls, so the recursion tree becomes a full binary tree again and the time returns to O(n). Store the value once. This is also the border with DP: an overlapping subproblem that is not stored gets recomputed.",
      zh: "递归里若把 pow(x, n/2) 写两遍,每层调用数翻倍,递归树重新长成满二叉树 → O(n),白白丢掉分治优势。务必先存进变量、只算一次 —— 这也解释了分治与 DP 的边界:重叠子问题不记账就会重复计算。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which of these are signals that a problem suits divide and conquer? (Select all that apply.)",
      zh: "下面哪些是「这道题适合分治」的信号?(多选)",
    },
    opts: {
      en: [
        "The large problem splits into smaller problems of the same form, so a function can call itself",
        "The subproblems are independent: they do not overlap and do not share intermediate results",
        "The sub-answers can be combined into the full answer at an affordable cost",
        "The same subproblem comes up again and again",
      ],
      zh: [
        "大问题能拆成同一形式的小问题(能递归调用自己)",
        "子问题相互独立:互不重叠,也不共享中间结果",
        "子问题的解能在可接受的「合并代价」内拼成大问题的解",
        "同一个子问题被反复求解",
      ],
    },
    correct: [0, 1, 2],
    missHint: {
      en: "Divide and conquer needs three things: it splits, the pieces are independent, and the pieces combine. Check which one you left out.",
      zh: "分治三要素「拆得开、算得独立、合得回」—— 再看看漏了哪一条。",
    },
    extraHint: {
      en: "Repeated subproblems is the signal for DP, not divide and conquer. If subproblems repeat and nothing is stored, the same work is done many times.",
      zh: "「同一个子问题被反复求解」恰恰是 DP 的信号,不是分治。子问题重复又不记账,同样的活就会做很多遍。",
    },
    why: {
      en: "Divide and conquer applies when the problem splits, the subproblems are independent, and the sub-answers combine. Independence is the key condition: each subproblem is solved exactly once, so there is nothing to store. Once subproblems repeat, switch to DP.",
      zh: "分治成立 = 分 / 治 / 合三要素齐备,且子问题相互独立。独立是关键条件:每个子问题只被解一次,没什么可记的。一旦子问题开始重复,就该换 DP。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Divide and conquer and dynamic programming both break a large problem into smaller ones. What is the real difference?",
      zh: "分治和动态规划都把大问题拆小,它们最本质的区别是?",
    },
    opts: {
      en: [
        "Divide and conquer has independent subproblems, each solved once. DP has overlapping subproblems, so results are stored and reused.",
        "Divide and conquer must be recursive and DP must be a loop",
        "Divide and conquer is always faster than DP",
        "Divide and conquer works on arrays and DP works on strings",
      ],
      zh: [
        "分治的子问题相互独立(算一次就够);DP 的子问题大量重叠(要把结果存下来复用)",
        "分治只能用递归,DP 只能用循环",
        "分治永远比 DP 快",
        "分治处理数组,DP 处理字符串",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "DP can be written top-down with memoization or bottom-up with loops, and divide and conquer is often written iteratively too. Recursion versus loop is not the difference.",
        "It depends on the problem. When subproblems overlap, DP is far faster than divide and conquer without stored results.",
        "Both work on arrays and on strings. What decides the method is whether the subproblems overlap, not the data type.",
      ],
      zh: [
        undefined,
        "DP 既能自顶向下递归(记忆化),也能自底向上循环;分治也常写成迭代。递归 / 循环不是区别所在。",
        "快慢取决于问题:在重叠子问题上,DP 远快于「不记账的分治」。",
        "两者都能处理数组或字符串;是否适用只看子问题是否重叠,与数据类型无关。",
      ],
    },
    why: {
      en: "One sentence: independent subproblems → divide and conquer (merge sort, fast power); overlapping subproblems → DP (store each answer). Fast power shows the border. Compute x^(n/2) twice and the time goes back to O(n), because an overlapping subproblem was recomputed instead of stored. Chapters 07 to 10 build on this.",
      zh: "判据一句话:子问题独立 → 分治(归并、快速幂);子问题重叠 → DP(把答案存下来)。快速幂正好说明了这条边界:x^(n/2) 算两遍,时间就回到 O(n) —— 重叠子问题不存就得重算。这也是通往第 7~10 章 DP 的伏笔。",
    },
  },
];
