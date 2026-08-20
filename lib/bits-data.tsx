// 第 4 章 · 位运算 —— 题单与测验数据。
// 题单覆盖 lc.md 位运算主线(异或 / n&(n-1) / lowbit / 位表示集合 / 移位),
// 由易到难;hint 只给方向不剧透,key 用一段话把最优解讲透。
// (盘)= 别章主讲、本章复盘;标 tag「复盘」。
// 双语:所有文案都是 Loc<…>,英文为默认。题名用 LeetCode 官方中英标题。

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

export const PROBLEMS: Problem[] = [
  {
    lc: 136,
    title: { en: "Single Number", zh: "只出现一次的数字" },
    d: "easy",
    tags: { en: ["XOR", "Worked example"], zh: ["异或", "精讲"] },
    hint: {
      en: "Two equal numbers should cancel each other out. Is there an operation where a value combined with itself gives 0?",
      zh: "两个相同的数放在一起应该互相抵消 —— 有没有一种运算,自己和自己做等于 0?",
    },
    key: {
      en: (
        <>
          XOR every element together. XOR has three properties that make this
          work: a^a = 0, a^0 = a, and the order of the operands does not matter.
          So every value that appears twice cancels to 0, and the single
          unpaired value is left. O(n) time and O(1) extra space: one pass and
          one variable. Worked example A in this chapter animates the
          cancellation step by step.
        </>
      ),
      zh: (
        <>
          把全体元素依次异或。异或的三条性质让这招成立:a^a = 0、a^0 = a,
          而且交换、结合都不改变结果。于是成对出现的数两两抵消归零,
          最后只剩那个落单的数。O(n) 时间、O(1) 额外空间 —— 一次遍历、一个变量。
          本章精讲 A 有逐帧动画演示抵消过程。
        </>
      ),
    },
  },
  {
    lc: 191,
    title: { en: "Number of 1 Bits", zh: "位 1 的个数" },
    d: "easy",
    tags: { en: ["n & (n-1)", "Worked example"], zh: ["n&(n-1)", "精讲"] },
    hint: {
      en: "Checking one bit at a time always costs 32 iterations. Can the loop instead run exactly as many times as there are 1 bits?",
      zh: "逐位检查要固定循环 32 次;有没有办法让循环次数正好等于 1 的个数?",
    },
    key: {
      en: (
        <>
          n &amp; (n-1) turns the lowest 1 bit of n into 0 and leaves the higher
          bits unchanged. So the loop &quot;n = n &amp; (n-1) until n is 0&quot;
          runs exactly once per 1 bit, and the iteration count is the number of
          1 bits (the population count). That beats 32 fixed shifts whenever the
          number has few 1 bits. Built-ins differ by language: Java has
          Integer.bitCount, Python has int.bit_count() on 3.10+ or
          bin(n).count(&quot;1&quot;), and JavaScript has none, so you write the
          loop yourself. In Java and JavaScript, a negative int has its sign bit
          set, so shift with the unsigned operator &gt;&gt;&gt; if you loop with
          shifts instead.
        </>
      ),
      zh: (
        <>
          n &amp; (n-1) 会把 n 最低位的那个 1 变成 0,更高位不变。所以「不断
          n = n &amp; (n-1) 直到 n 变 0」的循环次数,正好等于 1 的个数(popcount)。
          数里 1 很少时,它比固定右移 32 次快得多。内置函数各语言不同:
          Java 有 Integer.bitCount;Python 3.10+ 有 int.bit_count(),
          也可写 bin(n).count(&quot;1&quot;);JavaScript 没有内置,得自己写循环。
          Java 和 JavaScript 里负数的符号位是 1,若改用移位来数,要用无符号右移 &gt;&gt;&gt;。
        </>
      ),
    },
  },
  {
    lc: 231,
    title: { en: "Power of Two", zh: "2 的幂" },
    d: "easy",
    tags: { en: ["n & (n-1)", "Reuse"], zh: ["n&(n-1)", "复用"] },
    hint: {
      en: "What does a power of two look like in binary? Exactly one 1 bit. How do you test for that in one step?",
      zh: "2 的幂的二进制长什么样?只有一个 1。怎么一步判断「只有一个 1」?",
    },
    key: {
      en: (
        <>
          A power of two has exactly one 1 bit in binary: 1, 10, 100, and so on.
          So n is a power of two when n &gt; 0 and n &amp; (n-1) == 0. Clearing
          the only 1 bit leaves 0, which proves there was just one. The n &gt; 0
          test is required, because 0 and every negative number also give
          n &amp; (n-1) == 0 for the wrong reason. The check n &amp; (-n) == n
          works too, and it needs the same n &gt; 0 guard.
        </>
      ),
      zh: (
        <>
          2 的幂在二进制里恰好只有一个 1(1、10、100…)。所以 n &gt; 0 且
          n &amp; (n-1) == 0 即可判定 —— 清掉唯一的 1 后得 0,说明原本只有一个 1。
          n &gt; 0 这个前置条件不能省:0 和所有负数也会让 n &amp; (n-1) == 0 成立,
          但理由完全不同。用 n &amp; (-n) == n 判定同样可行,也同样要先判 n &gt; 0。
        </>
      ),
    },
  },
  {
    lc: 268,
    title: { en: "Missing Number", zh: "丢失的数字" },
    d: "easy",
    tags: { en: ["XOR", "Summation"], zh: ["异或", "求和"] },
    hint: {
      en: "The range [0, n] holds n+1 values and the array is missing one of them. What happens if you XOR every index together with every value?",
      zh: "[0, n] 共 n+1 个数,数组里少了一个。把「下标」和「数值」一起异或会怎样?",
    },
    key: {
      en: (
        <>
          Two solutions. XOR: fold every index from 0 to n and every nums[i]
          into one running XOR. Each present value meets its matching index and
          cancels, so the missing value survives. O(1) space and no risk of
          overflow. Summation: subtract the actual sum from the expected sum
          n(n+1)/2. That is easier to picture, but for a large n the expected sum
          can overflow a 32-bit int, so widen it to a 64-bit type. The XOR
          version is the same idea as LC 136.
        </>
      ),
      zh: (
        <>
          两种解法。异或法:把 0..n 的每个下标 i 和每个 nums[i] 全折叠进同一个异或值。
          出现过的数都会和它对应的下标抵消,剩下的就是缺失的那个。
          O(1) 空间,而且没有溢出风险。求和法:期望和 n(n+1)/2 减去实际和 ——
          更直观,但 n 很大时期望和会溢出 32 位 int,要换成 64 位。
          异或法和 136 是同一个思路。
        </>
      ),
    },
  },
  {
    lc: 461,
    title: { en: "Hamming Distance", zh: "汉明距离" },
    d: "easy",
    tags: {
      en: ["XOR", "Population count", "Reuse"],
      zh: ["异或", "popcount", "复用"],
    },
    hint: {
      en: "You need to count how many bit positions differ. Which operation marks exactly the differing positions with a 1?",
      zh: "两个数「有多少位不同」—— 什么运算能把「不同的位」精确标成 1?",
    },
    key: {
      en: (
        <>
          The Hamming distance is the number of bit positions where x and y
          differ. x ^ y puts a 1 in exactly those positions and a 0 everywhere
          the bits agree. So the problem becomes &quot;how many 1 bits does
          x ^ y have&quot;, which is the population count from LC 191. Two small
          ideas combined: XOR marks the differences, population count counts
          them.
        </>
      ),
      zh: (
        <>
          汉明距离就是 x 和 y 二进制下不同位的个数。x ^ y 恰好在「不同的位」上得 1、
          相同的位上得 0,于是问题化归为「数 x^y 里有几个 1」,也就是 191 的
          popcount。两个小招的组合:异或标出差异,popcount 数出个数。
        </>
      ),
    },
  },
  {
    lc: 190,
    title: { en: "Reverse Bits", zh: "颠倒二进制位" },
    d: "easy",
    tags: { en: ["Shifting", "Bit by bit"], zh: ["移位", "逐位"] },
    hint: {
      en: "Reversing 32 bits means taking one bit at a time and placing it at the mirrored position in the result.",
      zh: "把 32 位前后翻转 —— 一位位取出来,塞到结果的镜像位置。",
    },
    key: {
      en: (
        <>
          Bit by bit: loop 32 times. Each round, shift the result left by one to
          open a slot, put the lowest bit of n (n &amp; 1) into it, then shift n
          right by one: res = (res &lt;&lt; 1) | (n &amp; 1). There is also a
          divide and conquer version in O(log n) that swaps blocks of 16, 8, 4,
          2, then 1 bits. In Java and JavaScript use the unsigned shift
          &gt;&gt;&gt; so the sign bit does not repeat. Python integers have no
          fixed width, so mask with &amp; 0xFFFFFFFF to keep the value inside 32
          bits.
        </>
      ),
      zh: (
        <>
          逐位法:循环 32 次,每次先把结果左移一位腾出空位,再把 n 的最低位
          (n &amp; 1)放进去,然后 n 右移一位 —— res = (res &lt;&lt; 1) | (n &amp; 1)。
          还有 O(log n) 的分治版本:按 16/8/4/2/1 位的块两两互换。
          Java 和 JavaScript 要用无符号右移 &gt;&gt;&gt;,否则符号位会不断复制;
          Python 整数没有固定位宽,要 &amp; 0xFFFFFFFF 把值截在 32 位内。
        </>
      ),
    },
  },
  {
    lc: 137,
    title: { en: "Single Number II", zh: "只出现一次的数字 II" },
    d: "medium",
    tags: {
      en: ["Per-bit counting", "Worked example"],
      zh: ["逐位统计", "精讲"],
    },
    hint: {
      en: "Every other number appears three times, so XOR no longer helps: it only cancels pairs. Count the 1 bits at each position and take the remainder modulo 3.",
      zh: "其他数都出现 3 次 —— 异或只能消掉成对的,不管用了。统计每一位上 1 的总数,再对 3 取模。",
    },
    key: {
      en: (
        <>
          The general method is per-bit counting. For each of the 32 bit
          positions, count how many numbers have a 1 there. A number that
          appears three times contributes either 0 or 3 to that count, so taking
          the count modulo 3 leaves only the contribution of the number that
          appears once. Rebuild the answer position by position. O(32n) time. A
          shorter version uses two variables, ones and twos, as a small state
          machine that keeps each bit modulo 3. In Python, mask with
          &amp; 0xFFFFFFFF while counting and convert the result back to a
          signed value, because Python integers have no fixed width. Worked
          example C in this chapter animates the per-bit counting table.
        </>
      ),
      zh: (
        <>
          通法是「逐位统计」:对 32 个二进制位分别统计有多少个数在该位上是 1。
          出现 3 次的数在每位贡献 0 或 3,对 3 取模后只剩下「那个只出现一次的数」
          在该位的贡献,逐位还原即得答案。O(32n)。更短的写法用 ones/twos 两个变量
          做小状态机,让每一位自动按模 3 循环。Python 整数没有固定位宽,
          统计时要 &amp; 0xFFFFFFFF,最后再转回有符号值。
          本章精讲 C 有逐位统计表的动画。
        </>
      ),
    },
  },
  {
    lc: 260,
    title: { en: "Single Number III", zh: "只出现一次的数字 III" },
    d: "medium",
    tags: {
      en: ["XOR", "Lowest set bit", "Grouping"],
      zh: ["异或", "lowbit", "分组"],
    },
    hint: {
      en: "Two values are unpaired, a and b. XOR of everything gives a ^ b, which is not 0. How do you use it to split a and b into different groups?",
      zh: "有两个落单的数 a、b。全体异或得到 a^b(非 0)—— 怎么用它把 a、b 分到两组?",
    },
    key: {
      en: (
        <>
          XOR everything to get x = a ^ b. Since a and b are different, x has at
          least one 1 bit, and at that position a and b differ. Take the lowest
          such bit with x &amp; (-x), then split all the numbers into two groups
          by whether that bit is 0 or 1. a and b land in different groups, and
          every paired value lands in the same group as its partner, so XOR
          inside each group gives one answer. O(n) time and O(1) space: LC 136
          plus the lowest-set-bit trick.
        </>
      ),
      zh: (
        <>
          全部异或得 x = a ^ b。a、b 不相等,所以 x 至少有一位是 1,
          在这一位上 a、b 恰好不同。用 x &amp; (-x) 取出最低的这一位,
          再按「该位是 0 还是 1」把所有数分成两组:a、b 必落入不同组,
          而成对的数一定和自己的同伴落进同一组,于是每组内各做一次异或就得到一个答案。
          O(n) 时间、O(1) 空间 —— 136 加上 lowbit 的组合。
        </>
      ),
    },
  },
  {
    lc: 318,
    title: {
      en: "Maximum Product of Word Lengths",
      zh: "最大单词长度乘积",
    },
    d: "medium",
    tags: {
      en: ["Bitmask as a set", "State compression"],
      zh: ["位表示集合", "状压"],
    },
    hint: {
      en: "Comparing two words letter by letter is slow. Use 26 bits to record which letters a word uses, and one & tells you whether they share a letter.",
      zh: "逐字符比较两个单词有没有共同字母太慢?用 26 位记录一个单词用过哪些字母,一次 & 就能判。",
    },
    key: {
      en: (
        <>
          Compress each word into a 26-bit mask, where bit k is set when the word
          contains the k-th letter. Two words share no letter exactly when
          mask1 &amp; mask2 == 0. Build all the masks first, then test every pair
          and keep the largest product of lengths. This turns &quot;does the
          intersection of two sets look empty&quot; from a character-by-character
          scan into a single bitwise AND. It is the practical form of using an
          integer as a set, which is also the foundation of state compression DP
          in chapter 10. 26 bits fit in a 32-bit int with room to spare.
        </>
      ),
      zh: (
        <>
          把每个单词压成一个 26 位掩码:第 k 位为 1 表示单词含第 k 个字母。
          两个单词无公共字母 ⟺ mask1 &amp; mask2 == 0。先预处理出所有掩码,
          再两两配对,满足条件时更新长度乘积的最大值。这把「两个集合的交集是否为空」
          从逐字符扫描降成一次位与,正是「用整数表示集合」的实战用法,
          也是第 10 章状压 DP 的地基。26 位放进 32 位 int 还很宽裕。
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
    tags: { en: ["Population count", "Review"], zh: ["popcount", "复盘"] },
    hint: {
      en: "The sort key is each number's population count from LC 191, with the value itself breaking ties. Sorting details are in chapter 01.",
      zh: "排序的 key 就是每个数的 popcount(191),相同再按数值。(排序细节见第 01 章)",
    },
    key: {
      en: (
        <>
          Sort with the number of 1 bits as the first key and the value itself as
          the second key. Compute the population count with the n &amp; (n-1)
          loop from LC 191, or with the language built-in. Sorting itself belongs
          to chapter 01. What this problem reviews is the combination of a
          bitwise computation and a custom comparator.
        </>
      ),
      zh: (
        <>
          以 1 的个数(popcount)为第一关键字、数值本身为第二关键字排序即可。
          popcount 用 191 的 n &amp; (n-1) 循环或语言内置函数算。
          排序本身是第 01 章的内容,这题复盘的是「位运算结果 + 自定义比较器」的组合。
        </>
      ),
    },
  },
  {
    lc: 67,
    title: { en: "Add Binary", zh: "二进制求和" },
    d: "easy",
    tags: { en: ["Simulation", "Carry"], zh: ["模拟", "进位"] },
    hint: {
      en: "This is written addition, except a column carries when it reaches 2 instead of 10. Align the two strings at the right end and move left.",
      zh: "就是竖式加法,只不过逢 2 进 1。从末尾对齐,往前逐位加。",
    },
    key: {
      en: (
        <>
          Walk two pointers from the end of both strings toward the front. At
          each column add the two digits plus the carry: the digit written is
          sum % 2 and the new carry is sum / 2. Do not forget a final carry after
          the loop, then reverse the result. You could also convert to integers
          and iterate &quot;sum without carry a^b, carry (a&amp;b)&lt;&lt;1&quot;
          until the carry is 0, but the inputs can be longer than any fixed
          integer width, so the string simulation is the safe answer. This
          problem tests careful carry handling, not a clever identity.
        </>
      ),
      zh: (
        <>
          双指针从两个字符串的末尾往前走。每一列把两位数字加上进位 carry:
          写下的位是 sum % 2,新的进位是 sum / 2。循环结束后别忘了最后一次进位,
          然后把结果反转。也可以转成整数,反复迭代「无进位和 a^b、进位
          (a&amp;b)&lt;&lt;1」直到进位为 0,但输入可能比任何固定位宽的整数都长,
          所以字符串模拟才是稳妥答案。这题考的是进位处理的细心,不是花哨的恒等式。
        </>
      ),
    },
  },
];

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
