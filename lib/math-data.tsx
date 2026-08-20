// 第 11 章 · 数学与数论 —— 题单与测验数据。
// 题单覆盖蓝图指定的 13 题(202 7 9 50 69 169 31 292 1025 319 204 43 67),由易到难;
// hint 只给方向不剧透,key 用一段话把最优解 / 那个「不变量」讲透。
// 灵魂:数学题不考数学,考的是能不能找到那个不变量 / 规律。
// 双语:所有文案都是 Loc<…>,英文为默认。题名用 LeetCode 官方中英标题。

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

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
          A negative number is never a palindrome, because the minus sign is only
          at the front. Reverse the digits of the second half one at a time and
          compare them with the first half. Stop when{" "}
          <b>the reversed value is greater than or equal to the remaining value</b>.
          That single condition handles both an even and an odd number of digits;
          with an odd count the middle digit ends up in the reversed value and
          does not affect the comparison. Everything is integer arithmetic, so the
          time is O(log n) in the number of digits and the extra space is O(1).
          The idea to notice is &quot;reverse only half&quot;, not any advanced
          maths.
        </>
      ),
      zh: (
        <>
          负数一律不是回文(负号只在开头)。把后半段数字逐位反转,和前半段比较:
          当 <b>反转值 ≥ 剩余值</b> 时停下。这一个条件同时处理了奇偶位数 ——
          位数为奇时,中间那位会落进反转值里,不影响比较结果。
          全程只用整数运算,时间 O(log n)(位数),空间 O(1)。
          核心是「只反转一半」这个观察,而不是任何高深数学。
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
          converges faster: x_{"{k+1}"} = (x_k + n/x_k) / 2. This chapter treats
          the problem as a review of &quot;binary search plus overflow-safe
          rounding&quot;. For the binary search template itself, see chapter 03.
        </>
      ),
      zh: (
        <>
          二分答案:在 [0, x] 上找<b>最大</b>的 mid 满足 mid×mid ≤ x ——
          mid×mid 要用 64 位类型算,两个 int 相乘会溢出。
          也可用牛顿迭代 x_{"{k+1}"} = (x_k + n/x_k) / 2,收敛更快。
          本章把它当作「二分 + 防溢出取整」的复盘;二分模板细节回看第 3 章。
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
          双指针从两串末尾往前走,每位 sum = a 位 + b 位 + 进位,
          当前位 = sum % 2、新进位 = sum / 2,循环结束后别漏了最高位的进位。
          位运算在第 4 章主讲,这里练的是「进位模拟」的手感。
          Java / JS 别偷懒用 <code>parseInt</code> 整串转数字 —— 输入长度足以让数值失真,
          老实逐位加。
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
          DataData · 03 链表讲过)。若两者在非 1 的值上相遇 → 序列永远循环 → 不快乐;
          快指针先到 1 → 快乐。也可用哈希集合记录见过的数,重复即成环。
          关键一步是把数论问题<b>改述成环检测</b>。本章 §08 精讲。
        </>
      ),
    },
  },
  {
    lc: 169,
    title: { en: "Majority Element", zh: "多数元素" },
    d: "easy",
    tags: {
      en: ["Boyer-Moore voting", "Invariant"],
      zh: ["摩尔投票", "不变量"],
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
          摩尔投票 O(n) 时间、O(1) 空间:维护一个候选和一个计数,
          同值 +1、异值 −1、归零就换候选。每次 −1 都是「丢掉一个候选 + 丢掉一个异值」,
          两者成对抵消。出现次数 &gt; n/2 的元素抵消不完 ——
          因为其他所有元素加起来还不到 n/2,所以它一定是最后留下的那个。
          本章 §05 精讲这条<b>抵消论证</b>。
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
          结论很短:<b>n 为偶数先手必胜,奇数必败</b>。
          归纳:偶数可以减 1,把奇数丢给对手;而奇数的因子全是奇数,
          减去后必然变偶数留给对手 —— 双方在奇偶之间来回,拿到 1 的人无法操作而输。
          看出「奇偶」这个不变量后,一行 <code>return n % 2 == 0</code> 就够了,
          完全不需要枚举。
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
          <b>n % 4 == 0 先手必败,否则必胜</b>。不变量:轮到你时若石子数是 4 的倍数,
          无论你拿 k 颗(1~3),对手总能拿 4−k 颗把局面补回 4 的倍数,
          如此循环,直到把 0 颗留给你、你无法操作。
          一行 <code>return n % 4 != 0</code>。本章 §07 精讲 + Nim 交互实验室。
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
          灯 i 在第 d 轮被拨,当且仅当 d 整除 i,所以它被拨的次数 = i 的因子个数。
          因子成对出现(d 与 i/d),个数本该是偶数 —— 除非一对里的两个数相等,
          而这只在 i 是<b>完全平方数</b>、d = √i 时发生。
          所以只有完全平方数有奇数个因子,最终才亮着。答案 = ⌊√n⌋。
          靠「因子配对」这个观察,n = 10⁹ 也是 O(1)。
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
          埃氏筛(Sieve of Eratosthenes):i 从 2 枚举到 √n,
          每遇到一个还没被划掉的 i(它就是质数),就把从 <b>i²</b> 起的倍数全划成合数;
          最后统计没被划掉的个数。时间 O(n log log n),近乎线性,空间 O(n)。
          本章 §03 精讲网格动画。进阶:线性筛(欧拉筛)让每个合数只被它的
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
          快速幂(第 2 章分治主讲):按 n 的二进制位,底数不断平方,
          遇到为 1 的位就把当前的幂乘进结果,O(log n)。
          两个坑:n 为负要先取 x 的倒数;对 Integer.MIN_VALUE 直接取负会溢出,
          先转成 64 位再取负。本章 §04 复盘它的<b>取模变体</b>(边乘边模,别等算完)。
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
          ④ 反转 i 之后那段(降序 → 升序,即该段的最小排列)。
          每一步都只关心<b>位置</b>,数值本身没参与任何运算。O(n) 时间、O(1) 空间。
          本章 §06 有逐帧动画。
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
          。关键是溢出判断:在 res 乘 10 <b>之前</b>,先拿它和 INT_MAX / 10、
          INT_MIN / 10 比较,看下一步会不会越出 32 位范围(Java / C++ 的标准写法)。
          Python 整数无上限、JS 的 Number 在这个量级也够用,
          但两者仍要<b>手动</b>判 32 位范围,越界返回 0。这道题考的就是溢出意识。
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
          normalise all the carries in one pass and strip the leading zeros. This
          is the first form of <b>big-number multiplication</b>: once the numbers
          are wider than a 64-bit integer, digit-by-digit simulation is the only
          option. O(m × n).
        </>
      ),
      zh: (
        <>
          num1[i] × num2[j] 的乘积落在结果的第 i+j 与 i+j+1 位;
          用长度 m+n 的数组逐位累加,再统一处理进位,最后去掉前导零。
          这是<b>大数乘法</b>的雏形 —— 一旦数字宽过 64 位整数,就只能回到逐位模拟。
          O(m × n)。
        </>
      ),
    },
  },
];

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
      zh: "加法和乘法对取模是分配的,所以可以「边算边模」,把每个中间量摁在 10⁹+7 以下;两个这样的数相乘最大约 (10⁹)² = 10¹⁸,刚好塞进 64 位 long —— 这就是全世界都用 10⁹+7 的工程理由。",
    },
  },
  {
    type: "choice",
    q: {
      en: <>Which of these modular identities is <b>false</b>?</>,
      zh: <>下面哪一条取模等式是<b>错的</b>(不成立)?</>,
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
        "Only to write a shorter loop. Starting at 2i gives the same result and the same complexity",
        "Because there are no composite numbers below i×i",
      ],
      zh: [
        <>因为所有小于 i×i 的 i 的倍数(2i、3i…)都已被更小的质因子划过了</>,
        "因为 i×i 之前的数都不是 i 的倍数",
        "纯粹为了少写一点循环,从 2i 开始结果和复杂度都完全一样",
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
      zh: "每次 −1 都是拿一个候选和一个异值成对抵消。若某个值出现次数 &gt; n/2,其他所有值加起来不到 n/2,它抵消不完,一定留到最后。若题目不保证这样的值存在,扫描仍会吐出一个候选,所以要再扫一遍、验证它是否真的出现 &gt; n/2 次。",
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
        "拿 1 剩 11,对手拿 3 补成 8;同样被拉回 4 的倍数。先手在 12 颗下没有翻盘手。",
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
      zh: "前三题都是「先手玩几个小例子 → 猜出规律 / 不变量 → 归纳验证」,再看看你漏了哪个。",
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
        "「拍脑袋定个 100 次上限」不严谨:凭什么是 100 不是 99?正确做法是检测环 —— 一旦某个数重复出现,就可以断定序列永远循环。",
        "各位平方和不会无限变大(三位数最大 3 × 9² = 243),数字根本溢不出去,「变大」不能作为判据。",
        "确实有解:序列要么到 1,要么进入一个固定循环(4→16→37→…→4),两种结局都会在有限步内出现。",
      ],
    },
    why: {
      en: "Treat \"the next number\" as the next pointer of a linked list, and the question becomes whether the list has a cycle. That is Floyd's method from DataData · 03: move one pointer one step and the other two steps; if they meet, there is a cycle and the number is not happy; if the fast pointer reaches 1, it is happy. A hash set of the values already seen works too, at the cost of extra space.",
      zh: "把「下一个数」看成链表的 next 指针,问题就变成「链表是否有环」(DataData · 03 讲过的 Floyd 快慢指针):慢走一步、快走两步,相遇即有环即不快乐;快指针到 1 则快乐。也可用哈希集合记录出现过的数,重复即成环,代价是额外空间。",
    },
  },
];
