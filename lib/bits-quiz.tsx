// Chapter 4 - Bit Manipulation: quiz data.
// Kept apart from the problem set so that the atlas, which lists every chapter's problems,
// does not load the quizzes too.

import type { QuizItem } from "@/lib/quiz";

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "In a 32-bit signed integer (two's complement), what is the binary representation of -1?",
      zh: "在 32 位有符号整数(补码)里,−1 的二进制表示是?",
    },
    opts: {
      en: [
        "Thirty-two 1 bits (all bits set)",
        "The top bit is 1 and the rest are 0 (1000…0)",
        "Thirty-two 0 bits with the lowest bit set (00…01)",
        "The same bits as +1, with one extra bit acting as a minus sign",
      ],
      zh: [
        "32 个 1(全 1)",
        "最高位是 1、其余全 0(1000…0)",
        "32 个 0、最低位是 1(00…01)",
        "和 +1 一样,只是最高位标一个「负号」",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "1000…0 is -2³¹, the smallest value. Two's complement is not a sign bit plus a magnitude.",
        "00…01 is +1.",
        "Two's complement exists so that no separate sign marker is needed. The same adder handles positive and negative values, and there is no independent sign field.",
      ],
      zh: [
        undefined,
        "1000…0 是 −2³¹(最小值),不是 −1。补码不是「符号位 + 绝对值」那一套。",
        "00…01 是 +1。",
        "补码正是为了「不需要单独的符号标记」而设计:同一个加法器对正负数一视同仁,不存在独立的符号字段。",
      ],
    },
    why: {
      en: "The two's complement rule is -n = ~n + 1. So -1 = ~1 + 1 = 1111…1110 + 1 = all bits set. Adding 1 to all-ones wraps back to 0, which matches -1 + 1 = 0. That wrap is exactly why one adder can ignore the sign.",
      zh: "补码规则是 −n = ~n + 1:−1 = ~1 + 1 = 1111…1110 + 1 = 全 1。全 1 再 +1 会溢出回 0,恰好对应 −1 + 1 = 0 —— 正是这个回绕让同一个加法器可以无视符号。",
    },
  },
  {
    type: "choice",
    q: {
      en: "What does the expression n & (n - 1) do?",
      zh: "表达式 n & (n − 1) 的效果是?",
    },
    opts: {
      en: [
        "Clears the lowest 1 bit of n to 0",
        "Flips the lowest 0 bit of n to 1",
        "Extracts the lowest 1 bit of n (the lowest set bit)",
        "Doubles n",
      ],
      zh: [
        "把 n 二进制里最低位的那个 1 清成 0",
        "把 n 最低位的 0 翻成 1",
        "取出 n 最低位的 1(lowbit)",
        "把 n 翻倍",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "It is the opposite. Subtracting 1 borrows: the lowest 1 becomes 0 and every 0 to its right becomes 1. ANDing with n then clears that 1 and everything to its right.",
        "Extracting the lowest 1 bit is n & (-n). Keep the two apart: one clears the lowest 1 bit, the other keeps only that bit.",
        "Doubling is n << 1.",
      ],
      zh: [
        undefined,
        "恰好相反:n−1 会借位,把最低位的 1 变 0、其右侧的 0 全变 1;再与 n 相与,这个 1 连同右侧一起被清零。",
        "取出最低位的 1 是 n & (−n)。两者要分清:一个是「清掉」最低位的 1,一个是「只留下」这一位。",
        "翻倍是 n << 1。",
      ],
    },
    why: {
      en: "n - 1 turns the lowest 1 into 0 and every 0 to its right into 1. ANDing with n clears the lowest 1 bit and the bits to its right, and leaves the higher bits alone. The net effect is removing one 1 bit. Repeat until n is 0 and the number of steps is the population count (LC 191).",
      zh: "n−1 把最低位的 1 变 0、其右侧的 0 全变 1;再和 n 相与,这个 1 及其右侧被清零、更高位不变 —— 净效果就是抹掉一个 1。反复做直到 n 为 0,做的次数就是 popcount(191)。",
    },
  },
  {
    type: "fill",
    q: {
      en: <>Compute 5 ^ 3 (XOR). Answer in decimal.</>,
      zh: <>计算 5 ^ 3 =(异或,用十进制作答)</>,
    },
    placeholder: { en: "Type a whole number…", zh: "输入一个整数…" },
    answers: ["6"],
    hint: {
      en: "5 is 101 and 3 is 011. Compare bit by bit: equal bits give 0, different bits give 1.",
      zh: "5 = 101,3 = 011,逐位比较:相同为 0,不同为 1。",
    },
    why: {
      en: "101 ^ 011 = 110 = 6. XOR asks, for each position, whether the two bits differ. It is also described as addition without carry.",
      zh: "101 ^ 011 = 110 = 6。异或就是逐位判断两者是否不同,也叫「不进位的加法」。",
    },
  },
  {
    type: "choice",
    q: {
      en: "LC 136 (every value appears twice except one) is solved by XORing everything. Which set of XOR properties makes that correct?",
      zh: "LC 136(每个数出现两次、只有一个出现一次)用「全体异或」求解,靠的是异或的哪组性质?",
    },
    opts: {
      en: [
        "a^a = 0 and a^0 = a, and the operation is commutative and associative",
        "a^a = 1 and a^0 = 0",
        "XOR behaves exactly like ordinary addition",
        "XOR is monotonic, so binary search applies",
      ],
      zh: [
        "a^a = 0、a^0 = a,且满足交换律与结合律",
        "a^a = 1、a^0 = 0",
        "异或完全等价于普通加法",
        "异或有单调性,可以拿来二分",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "These are reversed. a^a = 0, a value cancels itself, and a^0 = a, XOR with 0 changes nothing.",
        "XOR is addition without carry, which is not the same thing: 1^1 = 0 but 1+1 = 2. Dropping the carry is exactly what makes pairs cancel.",
        "XOR is not monotonic. Binary search needs a sorted order or a monotonic predicate, which XOR does not provide.",
      ],
      zh: [
        undefined,
        "记反了:a^a = 0(自己和自己抵消)、a^0 = a(和 0 异或保持不变)。",
        "异或是「不进位的加法」,和普通加法不同(1^1 = 0 但 1+1 = 2)。正是「不进位」这一点让成对的数彼此抵消。",
        "异或没有单调性;二分需要有序或单调的判定条件,异或提供不了。",
      ],
    },
    why: {
      en: "Commutativity and associativity let you reorder the values so each pair sits together. a^a = 0 cancels every pair, and x^0 = x leaves the answer. O(n) time and O(1) space.",
      zh: "因为可交换、可结合,可以任意重排、把成对的数凑到一起;a^a = 0 让它们全部抵消,剩下 x^0 = x 就是答案。O(n) 时间、O(1) 空间。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which of these bitwise expressions are correct? (Select all that apply.)",
      zh: "下面哪些位运算写法是正确的?(多选)",
    },
    opts: {
      en: [
        "Test that x is even: (x & 1) == 0",
        "Test that n is a power of two: n > 0 and (n & (n - 1)) == 0",
        "Extract the lowest 1 bit of n: n & (-n)",
        "Divide x by 2: x & 2",
      ],
      zh: [
        "判断 x 是偶数:(x & 1) == 0",
        "判断 n 是 2 的幂:n > 0 且 (n & (n − 1)) == 0",
        "取出 n 最低位的 1:n & (−n)",
        "计算 x 除以 2:x & 2",
      ],
    },
    correct: [0, 1, 2],
    missHint: {
      en: "The first three are all correct. You missed one of them. For each expression, work out which bits it keeps and which it clears.",
      zh: "前三个都是对的,你漏了其中一个 —— 逐个想清楚每个表达式保留了哪些位、清掉了哪些位。",
    },
    extraHint: {
      en: "One option is wrong: x & 2 only keeps bit 1 of x and has nothing to do with division. Dividing by 2 is x >> 1.",
      zh: "有一个是错的:x & 2 只保留 x 的第 1 位,和除法无关。除以 2 应该写 x >> 1。",
    },
    why: {
      en: "A reads the lowest bit, which is 0 for even numbers. B clears the only 1 bit and checks for 0, with the n > 0 guard required. C keeps only the lowest 1 bit. D is wrong: x & 2 just extracts bit 1. Halving is x >> 1, and note that an arithmetic right shift rounds toward negative infinity, so -7 >> 1 is -4, not -3.",
      zh: "A 读最低位,偶数的最低位是 0。B 清掉唯一的 1 再判 0,前面必须有 n > 0。C 只留下最低位的 1。D 错:x & 2 只是取出第 1 位。除以 2 是 x >> 1,而且要注意算术右移是向负无穷取整,所以 −7 >> 1 = −4,不是 −3。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In Java, what are the values of -8 >> 1 and -8 >>> 1?",
      zh: "在 Java 里,−8 >> 1 和 −8 >>> 1 的结果分别是?",
    },
    opts: {
      en: [
        "-8 >> 1 = -4 (arithmetic shift, the sign bit 1 is copied in); -8 >>> 1 = 2147483644 (unsigned shift, 0 is shifted in)",
        "Both equal -4",
        "Both equal 2147483644",
        "-8 >> 1 = 2147483644; -8 >>> 1 = -4",
      ],
      zh: [
        "−8 >> 1 = −4(算术右移,高位补符号位 1);−8 >>> 1 = 2147483644(无符号右移,高位补 0)",
        "两者都等于 −4",
        "两者都等于 2147483644",
        "−8 >> 1 = 2147483644;−8 >>> 1 = −4",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        ">>> shifts in 0, not the sign bit. A negative value shifted this way becomes a large positive value, so it cannot stay -4.",
        ">> is the arithmetic shift and copies the sign bit, which is 1 for a negative value, so -8 >> 1 stays negative and equals -4.",
        "These are swapped: >> copies the sign bit and gives -4, >>> shifts in 0 and gives a large positive value.",
      ],
      zh: [
        undefined,
        ">>> 高位补 0,不是补符号位 —— 负数经它右移会变成一个大正数,不可能仍是 −4。",
        ">> 是算术右移,高位补符号位(负数补 1),所以 −8 >> 1 保持负号 = −4。",
        "说反了:>> 补符号位(得 −4),>>> 补 0(得大正数)。",
      ],
    },
    why: {
      en: "-8 as a 32-bit pattern is 111…1000. >> copies the sign bit, so the result is 111…100 = -4, which is division by 2 rounded toward negative infinity. >>> always shifts in 0, so the result is 0111…100 = 2147483644. Java and JavaScript both have >>>. Python has no >>>, because its integers have no fixed width and no sign bit to shift; to imitate an unsigned shift, mask with & 0xFFFFFFFF first. This is the clearest bitwise difference between the three languages.",
      zh: "−8 的 32 位模式是 111…1000。>> 补符号位,结果是 111…100 = −4,相当于向负无穷取整地除以 2;>>> 一律补 0,结果是 0111…100 = 2147483644。Java 和 JavaScript 都有 >>>。Python 没有 >>>,因为它的整数没有固定位宽,也就没有可移动的符号位;要模拟无符号右移,得先 & 0xFFFFFFFF。这是三语言位运算最明显的差异。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Bit i of an integer s records whether element i is in a set. Which expression correctly tests whether element i is in s?",
      zh: "用整数 s 的第 i 位表示「元素 i 是否在集合里」。判断元素 i 是否在集合 s 中,正确写法是?",
    },
    opts: {
      en: [
        "(s >> i) & 1 equals 1, which is the same as (s & (1 << i)) != 0",
        "s & i",
        "s % i == 0",
        "s << i",
      ],
      zh: [
        "(s >> i) & 1 等于 1(等价于 (s & (1 << i)) != 0)",
        "s & i",
        "s % i == 0",
        "s << i",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "s & i ANDs s with the number i itself, which is not a test of bit i. To test bit i you first move a 1 into position i: 1 << i.",
        "A remainder tells you nothing about one specific binary digit.",
        "s << i shifts the whole of s left by i places. It changes s and cannot query a single bit.",
      ],
      zh: [
        undefined,
        "s & i 是把 s 和「数字 i 本身」按位与,不是检查第 i 位。要检查第 i 位,得先把 1 挪到第 i 位:1 << i。",
        "取模和二进制的某一位没有关系。",
        "s << i 是把整个 s 左移 i 位(改变的是 s),不能用来查询某一位。",
      ],
    },
    why: {
      en: "Shift 1 into position i to build a mask (1 << i); a non-zero AND means the element is present. Or shift s right by i and read the lowest bit. Add an element with s |= (1 << i) and remove one with s &= ~(1 << i). Watch the width: in Java, 1 << i overflows an int once i reaches 31, so write 1L << i for larger i. This use of an integer as a set is the foundation of state compression DP in chapter 10.",
      zh: "把 1 左移到第 i 位当掩码(1 << i),与 s 相与非 0 即在集合中;或者把 s 右移 i 位后看最低位。加入元素 s |= (1 << i),删除元素 s &= ~(1 << i)。注意位宽:Java 里 i 到 31 时 1 << i 就会溢出 int,i 更大要写 1L << i。这套「整数当集合」正是第 10 章状压 DP 的地基。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          n &amp; (-n) keeps only the lowest 1 bit of n, together with the place
          value that bit stands for. What is 12 &amp; (-12)? Answer in decimal.
        </>
      ),
      zh: (
        <>
          n &amp; (−n) 只留下 n 最低位的 1,连同这一位代表的权值。12 &amp; (−12) =
          (用十进制作答)
        </>
      ),
    },
    placeholder: { en: "Type a whole number…", zh: "输入一个整数…" },
    answers: ["4"],
    hint: {
      en: "12 is 1100. Its lowest 1 bit sits at position 2, and position 2 stands for 4.",
      zh: "12 = 1100,最低位的 1 在第 2 位,第 2 位的权值是 4。",
    },
    why: {
      en: "12 is 1100. -12 in two's complement is ~12 + 1, which ends in …0100. So 12 & (-12) = 100 = 4. The result is the value that the lowest 1 bit represents, not its position index. A Fenwick tree uses this value to jump between ranges.",
      zh: "12 = 1100。−12 的补码是 ~12 + 1,末几位是 …0100,所以 12 & (−12) = 100 = 4。结果是「最低位的 1 所代表的数值」,不是它的位置下标。树状数组就靠这个数值在区间之间跳跃。",
    },
  },
];
