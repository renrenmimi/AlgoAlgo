// Chapter 11 - Math and Number Theory: quiz data.
// Kept apart from the problem set so that the atlas, which lists every chapter's problems,
// does not load the quizzes too.

import type { QuizItem } from "@/lib/quiz";

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: (
        <>
          A long chain of multiplications must be reduced modulo 10⁹+7. Which
          approach actually avoids overflow?
        </>
      ),
      zh: <>大数连乘要对 10⁹+7 取模。下面哪种做法能真正避免溢出?</>,
    },
    opts: {
      en: [
        <>
          Take the modulus after every single multiplication and addition, so
          every intermediate value stays below 10⁹+7
        </>,
        "Compute everything in a normal 32-bit int and take the modulus once at the end",
        "Use a modulus larger than 10⁹+7, which removes the overflow",
        "Take the modulus only when printing the result",
      ],
      zh: [
        <>每做一次乘法 / 加法就立刻取一次模,让中间结果始终 &lt; 10⁹+7</>,
        "全程用普通 int 算完,最后再取一次模",
        "把模数换成比 10⁹+7 更大的数就不会溢出了",
        "只在最后打印结果时对它取模",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "By the time you reach the end, the intermediate product has already passed the limit of int and even of long. It wrapped around into a wrong value, and taking the modulus of a wrong value gives another wrong value. Reduce as you go.",
        "It is the opposite. The larger the modulus m, the larger m² is, and m² is the size of a product of two reduced values. 10⁹+7 is chosen because its square is about 10¹⁸, which still fits in a 64-bit long (limit about 9.2×10¹⁸).",
        "That is the same as taking the modulus at the end. The overflow already happened during the computation. The modulus has to be applied throughout.",
      ],
      zh: [
        undefined,
        "「算完再取模」时,中间乘积早就冲破了 int 甚至 long 的上限、回绕成一个错的数 —— 对错的数取模只会得到另一个错的数。必须边算边模。",
        "恰恰相反:模数 m 越大,m² 越大,而 m² 正是两个已取模的数相乘的量级。选 10⁹+7 是因为它平方后 ≈ 10¹⁸,还落在 64 位 long(上限 ≈ 9.2×10¹⁸)内。",
        "打印时才取模就是「最后取模」的翻版,溢出在计算过程中早就发生了。取模必须贯穿整个计算。",
      ],
    },
    why: {
      en: "Addition and multiplication distribute over the modulus, so you can reduce at every step and keep each intermediate value below 10⁹+7. A product of two such values is at most about (10⁹)² = 10¹⁸, which fits in a 64-bit long. That is the engineering reason 10⁹+7 is used everywhere.",
      zh: "加法和乘法对取模是分配的,所以可以「边算边模」,把每个中间量控制在 10⁹+7 以下;两个这样的数相乘最大约 (10⁹)² = 10¹⁸,刚好能放进 64 位 long —— 这就是 10⁹+7 被普遍采用的工程理由。",
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Which of these modular identities is <b>false</b>? (Here % means the
          non-negative remainder, as in mathematics.)
        </>
      ),
      zh: <>下面哪一条取模等式是<b>错的</b>(不成立)?(本题的 % 指数学意义上的非负余数)</>,
    },
    opts: {
      en: [
        <>(a + b) % m == ((a % m) + (b % m)) % m</>,
        <>(a × b) % m == ((a % m) × (b % m)) % m</>,
        <>(a − b) % m == ((a % m) − (b % m) + m) % m</>,
        <>(a ÷ b) % m == ((a % m) ÷ (b % m)) % m</>,
      ],
      zh: [
        <>(a + b) % m == ((a % m) + (b % m)) % m</>,
        <>(a × b) % m == ((a % m) × (b % m)) % m</>,
        <>(a − b) % m == ((a % m) − (b % m) + m) % m</>,
        <>(a ÷ b) % m == ((a % m) ÷ (b % m)) % m</>,
      ],
    },
    correct: 3,
    wrong: {
      en: [
        "Addition distributes over the modulus, so this one holds. The question asks for the identity that does not hold.",
        "Multiplication distributes over the modulus in the same way, so this one holds.",
        "After distributing, a subtraction can produce a negative value. Adding m and reducing again is the standard correction, so this one holds.",
        undefined,
      ],
      zh: [
        "加法对取模是分配的,这条成立 —— 题目找的是「不成立」的那条。",
        "乘法对取模同样分配,这条成立。",
        "减法分配后结果可能为负,+m 再取模是标准修正,这条成立。",
        undefined,
      ],
    },
    why: {
      en: "Division does not distribute over the modulus. To compute (a ÷ b) % m you need the modular inverse of b, and an inverse exists only when b and m share no common factor other than 1. When m is prime, every b that is not a multiple of m has an inverse, and Fermat's little theorem gives it as b^(m−2) mod m. That is exactly why 10⁹+7 was chosen to be prime.",
      zh: "除法不能直接分配到取模。要算 (a ÷ b) % m,得用 b 的「模逆元」,而逆元只在 b 与 m 互质时存在。当 m 是质数时,任何不是 m 倍数的 b 都有逆元,且由费马小定理 b 的逆元 = b^(m−2) mod m。这也正是 10⁹+7 特意选一个质数的原因。",
    },
  },
  {
    type: "fill",
    q: {
      en: <>Use the Euclidean algorithm to compute gcd(48, 36).</>,
      zh: <>用辗转相除法(欧几里得算法)求 gcd(48, 36) = ?</>,
    },
    placeholder: { en: "Enter an integer…", zh: "输入一个整数…" },
    answers: ["12"],
    hint: {
      en: "48 % 36 = 12, so gcd(48, 36) = gcd(36, 12). Then 36 % 12 = 0, and you stop.",
      zh: "48 % 36 = 12,于是 gcd(48,36) = gcd(36,12);36 % 12 = 0,停。",
    },
    why: {
      en: "gcd(a, b) = gcd(b, a % b). Repeat until the remainder is 0, and the divisor at that point is the answer: gcd(48, 36) = gcd(36, 12) = gcd(12, 0) = 12. Why does the step hold? Any common divisor of a and b also divides a % b = a − k·b, and any common divisor of b and a % b also divides a. The two pairs have exactly the same set of common divisors, so they have the same greatest one. The number of steps is O(log min(a, b)).",
      zh: "gcd(a, b) = gcd(b, a % b),辗转到余数为 0,此时的除数就是答案:gcd(48,36) = gcd(36,12) = gcd(12,0) = 12。为什么成立?a、b 的任意公约数都能整除 a % b = a − k·b,反之若某数整除 b 和 a % b,它也整除 a —— 两组数的公约数集合完全相同,最大的那个自然相等。步数是 O(log min(a, b))。",
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          In the sieve of Eratosthenes, why does the marking of multiples of i
          start at <b>i×i</b> instead of 2×i?
        </>
      ),
      zh: <>埃氏筛划合数时,划掉 i 的倍数为什么<b>从 i×i 开始</b>,而不是从 2×i?</>,
    },
    opts: {
      en: [
        <>
          Because every multiple of i below i×i (2i, 3i, and so on) already has a
          smaller prime factor and was marked earlier
        </>,
        "Because no number below i×i is a multiple of i",
        "It is purely a way to write a slightly shorter loop",
        "Because there are no composite numbers below i×i",
      ],
      zh: [
        <>因为所有小于 i×i 的 i 的倍数(2i、3i…)都已被更小的质因子划过了</>,
        "因为 i×i 之前的数都不是 i 的倍数",
        "纯粹为了少写一点循环",
        "因为 i×i 之前根本没有合数",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "2i and 3i are of course multiples of i. The point is that they were already marked by the smaller primes 2 and 3, so there is no need to mark them again.",
        "Starting at 2i still gives the correct answer, but it re-marks 2i, 3i, and the rest. Starting at i² is what removes the repeated work.",
        "There are many composite numbers below i², such as 4, 6, and 8. They are marked by smaller primes, not by i.",
      ],
      zh: [
        undefined,
        "2i、3i 当然是 i 的倍数 —— 只是它们已经被 2、3 这些更小的质数划过了,不必重划。",
        "从 2i 开始结果也对,但会把 2i、3i… 这些划过的数重复划一遍。从 i² 起步正是为了去掉这些重复劳动。",
        "i² 之前多得是合数(4、6、8…),只是它们由更小的质数负责划,轮不到 i。",
      ],
    },
    why: {
      en: "Any k·i with k < i has a prime factor smaller than i, so it was already marked by that smaller prime. Starting at i² skips all the repeated work. The same reasoning explains why the outer loop only needs to reach √n: a composite number x ≤ n always has a factor no larger than √x, so it is marked by some prime up to √n. Note that starting at i² lowers the constant work; the O(n log log n) bound comes from summing n/p over the primes p.",
      zh: "任何 k·i(k < i)都含有一个小于 i 的质因子,早被那个质因子划过了,所以从 i² 起步能跳过全部重复劳动。同一个道理也解释了外层为什么只需枚举到 √n:合数 x ≤ n 一定有一个不超过 √x 的因子,所以它会被某个 ≤ √n 的质数划掉。注意:从 i² 起步省的是常数级重复工作;O(n log log n) 这个界来自把 n/p 对所有质数 p 求和。",
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Boyer-Moore voting finds the element that appears more than n/2 times.
          What does it <b>require</b>?
        </>
      ),
      zh: <>摩尔投票能找出「出现次数超过 n/2 的多数元素」。它成立的<b>前提</b>是?</>,
    },
    opts: {
      en: [
        <>
          The problem guarantees that such an element exists (it appears more than
          n/2 times)
        </>,
        "The array must be sorted first",
        "All elements must be positive integers",
        "The majority element must appear at the start of the array",
      ],
      zh: [
        <>题目保证多数元素一定存在(出现次数 &gt; n/2)</>,
        "数组必须先排好序",
        "数组元素必须都是正整数",
        "多数元素必须出现在数组开头",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The algorithm is a single linear scan and needs no order at all. Sorting first would be slower, at O(n log n), and would not help.",
        "The type of the elements does not matter as long as you can test equality. Sign and size are irrelevant.",
        "The position does not matter. An element that appears more than half the time cannot be cancelled away, wherever its copies sit.",
      ],
      zh: [
        undefined,
        "摩尔投票是一趟线性扫描,根本不需要有序 —— 先排序反而更慢(O(n log n))还没有帮助。",
        "元素是什么类型都行(只要能判相等),和正负、大小毫无关系。",
        "多数元素出现在哪都行:它超过一半,和别人成对抵消也抵不完,一定活到最后。",
      ],
    },
    why: {
      en: "Every −1 step cancels one copy of the current candidate against one copy of a different value. If a value appears more than n/2 times, all the other values together are fewer than n/2, so it cannot be cancelled away and it survives. If the problem does not guarantee that such a value exists, the scan still returns some candidate, so you have to scan a second time and check that it really appears more than n/2 times.",
      zh: "每次 −1 都是拿一个候选和一个异值成对抵消。若某个值出现次数 &gt; n/2,其他所有值加起来不到 n/2,它抵消不完,一定留到最后。若题目不保证这样的值存在,扫描仍会给出一个候选,所以要再扫一遍、验证它是否真的出现 &gt; n/2 次。",
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Nim: n stones on the table, players alternately take 1 to 3 stones, and
          the player who takes the last stone wins. With n = 12, what happens to
          the first player?
        </>
      ),
      zh: <>Nim 游戏:桌上 n 颗石子,两人轮流拿 1~3 颗,拿到最后一颗者胜。n = 12 时先手?</>,
    },
    opts: {
      en: [
        <>
          Loses. 12 is a multiple of 4, so whatever the first player takes, the
          opponent can restore the pile to a multiple of 4
        </>,
        "Wins by taking 3 stones first",
        "Wins by taking 1 stone first",
        "It depends on luck",
      ],
      zh: [
        <>必败 —— 12 是 4 的倍数,先手拿几颗对手都能补成 4,把局面拉回 4 的倍数</>,
        "必胜 —— 先手拿 3 颗即可",
        "必胜 —— 先手拿 1 颗即可",
        "看运气,不一定",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Take 3 and 9 remain. The opponent takes 1, leaving 8, which is again a multiple of 4, so you are back in the losing position. No move escapes it.",
        "Take 1 and 11 remain. The opponent takes 3, leaving 8. Again a multiple of 4. With 12 stones the first player has no winning move.",
        "Nim is a game of perfect information with no randomness. The result is decided by n % 4 alone.",
      ],
      zh: [
        undefined,
        "拿 3 剩 9,对手拿 1 补成 8(仍是 4 的倍数),你又回到「面对 4 的倍数」的必败局。任何拿法都逃不掉。",
        "拿 1 剩 11,对手拿 3 补成 8;同样被拉回 4 的倍数。先手在 12 颗时没有能扭转局面的走法。",
        "Nim 是完全信息、无随机的博弈,结果由 n % 4 唯一决定,不存在运气。",
      ],
    },
    why: {
      en: "The invariant: if it is your turn and the pile is a multiple of 4, you lose. You take k (1 to 3) and the opponent takes 4−k, so the pile is a multiple of 4 again. This repeats until you face 0 stones, which is also a multiple of 4 and leaves you no move. So n % 4 == 0 means the first player loses.",
      zh: "不变量:轮到某人时若剩余是 4 的倍数,他必败。他拿 k 颗(1~3),对手总能拿 4−k 颗补回 4 的倍数,直到把 0(也是 4 的倍数)留给他、他无法操作。n % 4 == 0 ⇒ 先手必败。",
    },
  },
  {
    type: "multi",
    q: {
      en: (
        <>
          Which of these problems are solved by finding an invariant or a pattern,
          rather than by applying a complicated formula? (Select all that apply.)
        </>
      ),
      zh: <>下面哪些题的突破口是「找不变量 / 找规律」,而不是套复杂数学公式?(多选)</>,
    },
    opts: {
      en: [
        "292 Nim Game (n % 4 decides the winner)",
        "319 Bulb Switcher (the bulbs left on sit at perfect-square positions)",
        "169 Majority Element (the cancellation argument behind Boyer-Moore voting)",
        "Finding the median of two sorted arrays, which requires integration from advanced calculus",
      ],
      zh: [
        "292 Nim 游戏(用 n % 4 判胜负)",
        "319 灯泡开关(最终亮着的是完全平方数位置)",
        "169 多数元素(摩尔投票的抵消论证)",
        "对两个已排序数组求中位数,必须动用高等数学的积分",
      ],
    },
    correct: [0, 1, 2],
    missHint: {
      en: "The first three all follow the same route: try a few small cases, guess the pattern or invariant, then prove it. Check which one you left out.",
      zh: "前三题都是「先试几个小例子 → 猜出规律 / 不变量 → 归纳验证」,再看看你漏了哪个。",
    },
    extraHint: {
      en: "One option claims a simple problem needs advanced calculus. The point of this chapter is the opposite: these problems need one observation, not a formula.",
      zh: "有一个选项把简单题说成需要「高等数学」—— 本章的重点恰恰相反:这些题几乎不用公式,只用一个观察。",
    },
    why: {
      en: "292 rests on n % 4, 319 on \"an odd number of divisors means a perfect square\", and 169 on the cancellation argument. All three are patterns or invariants. Option D is the distractor: the median of two sorted arrays is a binary search or two-pointer problem and has nothing to do with integration. Interview maths problems test whether you can find the pattern.",
      zh: "292 靠 n % 4、319 靠「因子个数为奇 ⇔ 完全平方数」、169 靠抵消论证 —— 全是找规律 / 找不变量。D 是干扰项:求两个有序数组的中位数是二分 / 双指针,和积分毫无关系。数学题考的是能不能发现规律。",
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Happy number: repeatedly replace a number by the sum of the squares of
          its digits; the number is happy if this reaches 1. How do you decide
          reliably that it will <b>never</b> reach 1?
        </>
      ),
      zh: <>快乐数(反复把各位平方求和,变成 1 即快乐):怎样严谨判断它「永远变不成 1」?</>,
    },
    opts: {
      en: [
        <>
          Treat the process as a chain of next pointers and detect a cycle with
          two pointers at different speeds, or with a hash set
        </>,
        "Run 100 iterations, and if 1 has not appeared, call the number unhappy",
        "Once a value grows beyond the range of int, the number is unhappy",
        "There is no reliable way; you can only keep computing",
      ],
      zh: [
        <>把过程看成一条「next 链」,用快慢指针(或哈希集合)检测它是否成环</>,
        "只要算够 100 次还没到 1,就判定不快乐",
        "数字一旦大到超过 int 范围,就是不快乐",
        "无解,只能无限算下去",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "A fixed limit of 100 is a guess. Why 100 and not 99? Detect the cycle instead: as soon as a value repeats, the sequence provably repeats forever.",
        "The sum of squared digits never grows without bound. For a three-digit number the largest possible sum is 3 × 9² = 243, so nothing overflows. Growth is not a usable test.",
        "There is a reliable way. The sequence either reaches 1 or enters a fixed cycle (4 → 16 → 37 → … → 4), and both outcomes show up within a finite number of steps.",
      ],
      zh: [
        undefined,
        "「随意定个 100 次上限」不严谨:凭什么是 100 不是 99?正确做法是检测环 —— 一旦某个数重复出现,就可以断定序列永远循环。",
        "各位平方和不会无限变大(三位数最大 3 × 9² = 243),数字根本不会溢出,「变大」不能作为判据。",
        "确实有解:序列要么到 1,要么进入一个固定循环(4→16→37→…→4),两种结局都会在有限步内出现。",
      ],
    },
    why: {
      en: "Treat \"the next number\" as the next pointer of a linked list, and the question becomes whether the list has a cycle. That is Floyd's method from DataData · 03: move one pointer one step and the other two steps; if they meet, there is a cycle and the number is not happy; if the fast pointer reaches 1, it is happy. A hash set of the values already seen works too, at the cost of extra space.",
      zh: "把「下一个数」看成链表的 next 指针,问题就变成「链表是否有环」(DataData · 03 讲过的 Floyd 快慢指针):慢走一步、快走两步,相遇即有环即不快乐;快指针到 1 则快乐。也可用哈希集合记录出现过的数,重复即成环,代价是额外空间。",
    },
  },
];
