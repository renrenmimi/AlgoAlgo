// Chapter 11 - Math and Number Theory: problem set (the quiz is in lib/math-quiz.tsx).
// The problem set covers the 13 problems named in the blueprint (202, 7, 9, 50, 69, 169, 31,
// 292, 1025, 319, 204, 43, 67), ordered easy to hard; hint only points at a direction without
// spoiling, key explains the optimal solution -- or the invariant behind it -- in one paragraph.
// The point of the chapter: math problems do not test mathematics, they test whether you can
// find the invariant or the pattern.
// Bilingual: all copy is Loc<...> with English as the default. Titles use LeetCode's official
// English and Chinese names.

import type { Problem } from "@/lib/problems";

export const PROBLEMS: Problem[] = [
  {
    lc: 9,
    title: { en: "Palindrome Number", zh: "回文数" },
    d: "easy",
    tags: {
      en: ["Find the pattern", "No string conversion"],
      zh: ["找规律", "不转字符串"],
    },
    hint: {
      en: "Can you check a palindrome without turning the integer into a string? Try reversing only the second half of the digits.",
      zh: "不把整数转成字符串,也能判回文吗?试试「只反转后一半」。",
    },
    key: {
      en: (
        <>
          First rule out two kinds of numbers: negative numbers, because the
          minus sign is only at the front, and non-zero numbers that end in 0 (x %
          10 == 0 and x ≠ 0), because a palindrome cannot start with 0. Then
          reverse the second half digit by digit, and stop when{" "}
          <b>the reversed value is greater than or equal to the remaining value</b>.
          Compare the two: with an even number of digits they must be equal; with
          an odd count the middle digit has ended up in the reversed value, so
          compare the remaining value with reversed / 10. Everything is integer
          arithmetic, so the
          time is O(log n) in the number of digits and the extra space is O(1).
          The idea to notice is &quot;reverse only half&quot;, not any advanced
          maths.
        </>
      ),
      zh: (
        <>
          先排除两类数:负数(负号只在开头),以及末位为 0 的非零数(x % 10 == 0 且 x ≠ 0)—— 回文不可能以 0 开头。然后把后半段逐位反转,当 <b>反转值 ≥ 剩余值</b> 时停下,再比较两者:位数为偶时两者应相等;位数为奇时中间那位落进了反转值,比较剩余值与反转值 / 10。全程只用整数运算,时间 O(log n)(位数),空间 O(1)。核心是「只反转一半」这个观察,而不是任何高深数学。
        </>
      ),
    },
  },
  {
    lc: 69,
    title: { en: "Sqrt(x)", zh: "x 的平方根" },
    d: "easy",
    tags: {
      en: ["Review", "Binary search on the answer", "Newton's method"],
      zh: ["复盘", "二分答案", "牛顿迭代"],
    },
    hint: {
      en: "Find the largest k with k×k ≤ x. The answer is monotonic, which is exactly what binary search needs (chapter 03 covers it).",
      zh: "找最大的 k 使 k×k ≤ x —— 答案单调,天生适合二分(第 3 章主讲)。",
    },
    key: {
      en: (
        <>
          Binary search on the answer: in [0, x], find the <b>largest</b> mid with
          mid×mid ≤ x. Compute mid×mid in a 64-bit type, because the product of
          two ints can overflow. Newton&apos;s method is an alternative and
          converges faster: y_{"{k+1}"} = (y_k + x/y_k) / 2. This chapter treats
          the problem as a review of &quot;binary search plus overflow-safe
          rounding&quot;. For the binary search template itself, see chapter 03.
        </>
      ),
      zh: (
        <>
          二分答案:在 [0, x] 上找<b>最大</b>的 mid 满足 mid×mid ≤ x ——
          mid×mid 要用 64 位类型算,两个 int 相乘会溢出。也可用牛顿迭代 y_{"{k+1}"} = (y_k + x/y_k) / 2,收敛更快。本章把它当作「二分 + 防溢出取整」的复盘;二分模板细节回看第 3 章。
        </>
      ),
    },
  },
  {
    lc: 67,
    title: { en: "Add Binary", zh: "二进制求和" },
    d: "easy",
    tags: {
      en: ["Review", "Carry simulation"],
      zh: ["复盘", "模拟进位"],
    },
    hint: {
      en: "Add the digits from right to left, the way you add numbers on paper, and remember to keep the carry.",
      zh: "像竖式一样,从末位往前逐位相加,别忘了记进位。",
    },
    key: {
      en: (
        <>
          Walk two pointers backwards from the end of each string. At every
          position sum = digit of a + digit of b + carry, so the output digit is
          sum % 2 and the new carry is sum / 2. After the loop, do not forget the
          final carry. Bit operations are covered in chapter 04; here the point is
          the feel of carry propagation. In Java and JavaScript, do not convert
          the whole string with <code>parseInt</code> — the inputs are long enough
          to lose the exact value. Add digit by digit.
        </>
      ),
      zh: (
        <>
          双指针从两串末尾往前走,每位 sum = a 位 + b 位 + 进位,当前位 = sum % 2、新进位 = sum / 2,循环结束后别漏了最高位的进位。位运算在第 4 章主讲,这里练的是「进位模拟」的手感。Java / JS 不要用 <code>parseInt</code> 把整串转成数字 —— 输入长度足以让数值失真,应逐位相加。
        </>
      ),
    },
  },
  {
    lc: 202,
    title: { en: "Happy Number", zh: "快乐数" },
    d: "easy",
    tags: {
      en: ["Cycle detection", "Fast and slow pointers"],
      zh: ["循环检测", "快慢指针"],
    },
    hint: {
      en: "The sequence either reaches 1 or repeats forever. Repeating forever is the same question as finding a cycle in a linked list.",
      zh: "序列要么走到 1,要么陷入循环 —— 这不就是「链表找环」吗?",
    },
    key: {
      en: (
        <>
          Treat &quot;next number = sum of the squares of the digits&quot; as a
          next pointer. The question becomes{" "}
          <b>does this chain contain a cycle</b>. Move one pointer one step and
          the other two steps (Floyd&apos;s method, covered in DataData · 03
          linked lists). If they meet at a value other than 1, the sequence
          repeats forever and the number is not happy. If the fast pointer reaches
          1, the number is happy. A hash set of the values already seen works too:
          a repeat means a cycle. The useful step is{" "}
          <b>restating a number-theory question as cycle detection</b>. Section 08
          of this chapter walks through it.
        </>
      ),
      zh: (
        <>
          把「下一个数 = 各位平方和」看成 next 指针,问题就变成
          <b>「这条链有没有环」</b>:一个指针走一步、另一个走两步(Floyd 判圈,
          DataData · 03 链表讲过)。若两者在非 1 的值上相遇 → 序列永远循环 → 不快乐;快指针先到 1 → 快乐。也可用哈希集合记录见过的数,重复即成环。关键一步是把数论问题<b>改述成环检测</b>。本章 §08 精讲。
        </>
      ),
    },
  },
  {
    lc: 169,
    title: { en: "Majority Element", zh: "多数元素" },
    d: "easy",
    tags: {
      en: ["Boyer-Moore voting", "Invariant", "Review"],
      zh: ["摩尔投票", "不变量", "复盘"],
    },
    hint: {
      en: "Same value +1, different value −1, and pick a new candidate when the count reaches zero. Which value can survive to the end?",
      zh: "相同 +1、不同 −1,票数归零就换候选 —— 谁能撑到最后?",
    },
    key: {
      en: (
        <>
          Boyer-Moore voting runs in O(n) time and O(1) space: keep one candidate
          and one count. Add 1 for a matching value, subtract 1 for a different
          value, and replace the candidate when the count is zero. Every −1 step
          discards one copy of the candidate together with one copy of a different
          value, so the two cancel as a pair. A value that appears more than n/2
          times cannot be cancelled away, because all the other values together
          are fewer than n/2. So it is the value left at the end. Section 05
          covers this <b>cancellation argument</b> in detail.
        </>
      ),
      zh: (
        <>
          摩尔投票 O(n) 时间、O(1) 空间:维护一个候选和一个计数,同值 +1、异值 −1、归零就换候选。每次 −1 都是「丢掉一个候选 + 丢掉一个异值」,两者成对抵消。出现次数 &gt; n/2 的元素抵消不完 ——
          因为其他所有元素加起来还不到 n/2,所以它一定是最后留下的那个。本章 §05 精讲这条<b>抵消论证</b>。
        </>
      ),
    },
  },
  {
    lc: 1025,
    title: { en: "Divisor Game", zh: "除数博弈" },
    d: "easy",
    tags: {
      en: ["Game theory", "Find the pattern", "Parity"],
      zh: ["博弈", "找规律", "奇偶"],
    },
    hint: {
      en: "Play n = 2, 3, 4, 5 by hand and write down who wins. The pattern appears on its own.",
      zh: "手玩 n = 2、3、4、5……记下先手的输赢,规律会自己冒出来。",
    },
    key: {
      en: (
        <>
          The answer is short: <b>the first player wins when n is even and loses
          when n is odd</b>. Why: from an even n you can subtract 1 and hand an
          odd number to your opponent. From an odd n every divisor is odd, so
          whatever you subtract, the result is even and your opponent receives an
          even number. The parity keeps flipping, and the player who receives 1
          has no legal move and loses. Once you see that parity is the invariant,
          the whole problem is <code>return n % 2 == 0</code> with no search at
          all.
        </>
      ),
      zh: (
        <>
          结论很短:<b>n 为偶数先手必胜,奇数必败</b>。归纳:偶数可以减 1,把奇数留给对手;而奇数的因子全是奇数,减去后必然变偶数留给对手 —— 双方在奇偶之间来回,拿到 1 的人无法操作而输。看出「奇偶」这个不变量后,一行 <code>return n % 2 == 0</code> 就够了,完全不需要枚举。
        </>
      ),
    },
  },
  {
    lc: 292,
    title: { en: "Nim Game", zh: "Nim 游戏" },
    d: "easy",
    tags: {
      en: ["Game theory", "Invariant", "n % 4"],
      zh: ["博弈", "不变量", "n%4"],
    },
    hint: {
      en: "The player who faces a multiple of 4 loses. Work out why first.",
      zh: "谁面对「4 的倍数」谁就输 —— 先想清楚为什么。",
    },
    key: {
      en: (
        <>
          <b>The first player loses when n % 4 == 0 and wins otherwise.</b> The
          invariant: if it is your turn and the pile is a multiple of 4, then
          whatever k you take (1 to 3), your opponent takes 4−k and the pile is a
          multiple of 4 again. This repeats until you are left with 0 stones and
          no move. One line: <code>return n % 4 != 0</code>. Section 07 explains
          it and includes an interactive Nim board.
        </>
      ),
      zh: (
        <>
          <b>n % 4 == 0 先手必败,否则必胜</b>。不变量:轮到你时若石子数是 4 的倍数,无论你拿 k 颗(1~3),对手总能拿 4−k 颗把局面补回 4 的倍数,如此循环,直到把 0 颗留给你、你无法操作。一行 <code>return n % 4 != 0</code>。本章 §07 精讲 + Nim 交互实验室。
        </>
      ),
    },
  },
  {
    lc: 319,
    title: { en: "Bulb Switcher", zh: "灯泡开关" },
    d: "medium",
    tags: {
      en: ["Find the pattern", "Perfect squares"],
      zh: ["找规律", "完全平方数"],
    },
    hint: {
      en: "Bulb i is toggled once for each divisor of i. Which numbers have an odd number of divisors?",
      zh: "第 i 个灯被拨的次数 = i 的因子个数;什么数的因子个数是奇数?",
    },
    key: {
      en: (
        <>
          Bulb i is toggled in round d exactly when d divides i, so the number of
          toggles equals the number of divisors of i. Divisors come in pairs, d
          and i/d, so the count is even — unless the two members of a pair are the
          same number, which happens only when i is a{" "}
          <b>perfect square</b> and d = √i. Only perfect squares have an odd
          number of divisors, so only those bulbs end up on. The answer is ⌊√n⌋.
          The divisor-pairing observation gives an O(1) answer even for n = 10⁹.
        </>
      ),
      zh: (
        <>
          灯 i 在第 d 轮被拨,当且仅当 d 整除 i,所以它被拨的次数 = i 的因子个数。因子成对出现(d 与 i/d),个数本该是偶数 —— 除非一对里的两个数相等,而这只在 i 是<b>完全平方数</b>、d = √i 时发生。所以只有完全平方数有奇数个因子,最终才亮着。答案 = ⌊√n⌋。靠「因子配对」这个观察,n = 10⁹ 也是 O(1)。
        </>
      ),
    },
  },
  {
    lc: 204,
    title: { en: "Count Primes", zh: "计数质数" },
    d: "medium",
    tags: {
      en: ["Extra", "Sieve of Eratosthenes"],
      zh: ["补充", "埃氏筛"],
    },
    hint: {
      en: "Testing each number one by one is slow. Turn it around: take each prime you already know and cross out its multiples.",
      zh: "一个个试除太慢;反过来,用已知的质数去「划掉」它的倍数。",
    },
    key: {
      en: (
        <>
          Sieve of Eratosthenes: for i from 2 up to √n, whenever i is still
          unmarked it is prime, so mark every multiple of i starting at{" "}
          <b>i²</b> as composite. Then count the numbers that were never marked.
          The time is O(n log log n), which is close to linear, and the space is
          O(n). Section 03 animates the grid. A further step is the linear sieve,
          which marks every composite exactly once through its{" "}
          <b>smallest prime factor</b> and runs in O(n).
        </>
      ),
      zh: (
        <>
          埃氏筛(Sieve of Eratosthenes):i 从 2 枚举到 √n,每遇到一个还没被划掉的 i(它就是质数),就把从 <b>i²</b> 起的倍数全划成合数;最后统计没被划掉的个数。时间 O(n log log n),近乎线性,空间 O(n)。本章 §03 精讲网格动画。进阶:线性筛(欧拉筛)让每个合数只被它的
          <b>最小质因子</b>划恰好一次,做到 O(n)。
        </>
      ),
    },
  },
  {
    lc: 50,
    title: { en: "Pow(x, n)", zh: "Pow(x, n)" },
    d: "medium",
    tags: {
      en: ["Review", "Fast power", "Divide and conquer"],
      zh: ["复盘", "快速幂", "分治"],
    },
    hint: {
      en: "x¹⁶ does not need 16 multiplications. Square repeatedly: x → x² → x⁴ → x⁸ → x¹⁶, which is 4 steps.",
      zh: "x¹⁶ 不用乘 16 次 —— 平方再平方:x → x² → x⁴ → x⁸ → x¹⁶,只要 4 步。",
    },
    key: {
      en: (
        <>
          Fast power (chapter 02 covers it): read the binary digits of n, square
          the base at every step, and multiply the current power into the result
          for every digit that is 1. That is O(log n). Two traps: a negative n
          needs the reciprocal of x, and negating Integer.MIN_VALUE overflows, so
          convert n to a 64-bit type before negating it. Section 04 of this
          chapter reviews the <b>modular version</b>: take the modulus after every
          multiplication instead of at the end.
        </>
      ),
      zh: (
        <>
          快速幂(第 2 章分治主讲):按 n 的二进制位,底数不断平方,遇到为 1 的位就把当前的幂乘进结果,O(log n)。两个陷阱:n 为负要先取 x 的倒数;对 Integer.MIN_VALUE 直接取负会溢出,先转成 64 位再取负。本章 §04 复盘它的<b>取模变体</b>(边乘边模,别等算完)。
        </>
      ),
    },
  },
  {
    lc: 31,
    title: { en: "Next Permutation", zh: "下一个排列" },
    d: "medium",
    tags: {
      en: ["Find the pattern", "Lexicographic order"],
      zh: ["找规律", "字典序"],
    },
    hint: {
      en: "From the right, find the first position that breaks the decreasing run. Swap it with a slightly larger value from its right side, then reverse the right part.",
      zh: "从右找第一个「打破递减」的位置,再从右找个刚好更大的数换过来,最后翻转右段。",
    },
    key: {
      en: (
        <>
          Four steps in lexicographic order: (1) from the right, find the first i
          with nums[i] &lt; nums[i+1]; (2) from the right, find the first j with
          nums[j] &gt; nums[i]; (3) swap i and j; (4) reverse everything after i,
          which turns a decreasing run into an increasing one and therefore into
          the smallest arrangement of that part. Every step is about{" "}
          <b>positions</b> — no arithmetic on the values at all. O(n) time and
          O(1) space. Section 06 has a frame-by-frame animation.
        </>
      ),
      zh: (
        <>
          四步字典序规律:① 从右找首个 nums[i] &lt; nums[i+1];
          ② 从右找首个 nums[j] &gt; nums[i];③ 交换 i、j;
          ④ 反转 i 之后那段(降序 → 升序,即该段的最小排列)。每一步都只关心<b>位置</b>,数值本身没参与任何运算。O(n) 时间、O(1) 空间。本章 §06 有逐帧动画。
        </>
      ),
    },
  },
  {
    lc: 7,
    title: { en: "Reverse Integer", zh: "整数反转" },
    d: "medium",
    tags: {
      en: ["Overflow", "Digit simulation"],
      zh: ["溢出", "模拟"],
    },
    hint: {
      en: "Pop a digit with % 10 and push it with × 10. The whole difficulty is deciding whether the reversed value still fits in a 32-bit int.",
      zh: "逐位 pop(% 10)再 push(× 10),难点全在「反转后会不会溢出 int」。",
    },
    key: {
      en: (
        <>
          <code>while (x != 0) {"{"} d = x % 10; x /= 10; res = res * 10 + d; {"}"}</code>
          . The important part is the overflow check:{" "}
          <b>before</b> multiplying res by 10, compare it against INT_MAX / 10 and
          INT_MIN / 10 to see whether the next step would leave the 32-bit range.
          This is the standard approach in Java and C++. Python integers are
          unbounded and JavaScript numbers are wide enough here, but both still
          have to check the 32-bit range <b>by hand</b> and return 0 when it is
          exceeded. The problem is really a test of overflow awareness.
        </>
      ),
      zh: (
        <>
          <code>while (x != 0) {"{"} d = x % 10; x /= 10; res = res * 10 + d; {"}"}</code>
          。关键是溢出判断:在 res 乘 10 <b>之前</b>,先拿它和 INT_MAX / 10、INT_MIN / 10 比较,看下一步会不会越出 32 位范围(Java / C++ 的标准写法)。Python 整数无上限、JS 的 Number 在这个量级也够用,但两者仍要<b>手动</b>判 32 位范围,越界返回 0。这道题考的就是溢出意识。
        </>
      ),
    },
  },
  {
    lc: 43,
    title: { en: "Multiply Strings", zh: "字符串相乘" },
    d: "medium",
    tags: {
      en: ["Big number arithmetic", "Digit simulation"],
      zh: ["高精度", "模拟"],
    },
    hint: {
      en: "You cannot convert the inputs to integers, because they are too long. Multiply digit by digit and add the products at the right offset, the way you multiply on paper.",
      zh: "不能转成整数(输入太长会失真),像竖式那样逐位相乘、错位累加。",
    },
    key: {
      en: (
        <>
          The product of num1[i] and num2[j] lands in positions i+j and i+j+1 of
          the result. Use an array of length m+n, add every product into it, then
          normalize all the carries in one pass and strip the leading zeros. This
          is the first form of <b>big-number multiplication</b>: once the numbers
          are wider than a 64-bit integer, digit-by-digit simulation is the only
          option. O(m × n).
        </>
      ),
      zh: (
        <>
          num1[i] × num2[j] 的乘积落在结果的第 i+j 与 i+j+1 位;用长度 m+n 的数组逐位累加,再统一处理进位,最后去掉前导零。这是<b>大数乘法</b>的雏形 —— 一旦数字宽过 64 位整数,就只能回到逐位模拟。O(m × n)。
        </>
      ),
    },
  },
];
