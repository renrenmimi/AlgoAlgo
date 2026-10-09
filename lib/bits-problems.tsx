// Chapter 4 - Bit Manipulation: problem set (the quiz is in lib/bits-quiz.tsx).
// The problem set covers lc.md's bit-manipulation track (XOR / n&(n-1) / lowbit / sets as
// bitmasks / shifting), ordered easy to hard; hint only points at a direction without
// spoiling, key explains the optimal solution in one paragraph.
// "(review)" = taught in another chapter, revisited here; carries the "Review" tag.
// Bilingual: all copy is Loc<...> with English as the default. Titles use LeetCode's official
// English and Chinese names.

import type { Problem } from "@/lib/problems";

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
          把全体元素依次异或。异或的三条性质让这招成立:a^a = 0、a^0 = a,而且交换、结合都不改变结果。于是成对出现的数两两抵消归零,最后只剩那个落单的数。O(n) 时间、O(1) 额外空间 —— 一次遍历、一个变量。本章精讲 A 有逐帧动画演示抵消过程。
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
          n = n &amp; (n-1) 直到 n 变 0」的循环次数,正好等于 1 的个数(popcount)。数里 1 很少时,它比固定右移 32 次快得多。内置函数各语言不同:
          Java 有 Integer.bitCount;Python 3.10+ 有 int.bit_count(),也可写 bin(n).count(&quot;1&quot;);JavaScript 没有内置,得自己写循环。Java 和 JavaScript 里负数的符号位是 1,若改用移位来数,要用无符号右移 &gt;&gt;&gt;。
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
          test is required. For n = 0, 0 &amp; (−1) is 0. With 32-bit integers,
          as in Java and JavaScript, n = −2³¹, whose bits are 1000…0, also gives
          n &amp; (n−1) = 0; no other negative number passes, and Python&apos;s
          unbounded integers let no negative number through at all. The n &gt; 0
          guard rules out these cases at once. The check n &amp; (-n) == n works
          too, and it needs the same n &gt; 0 guard.
        </>
      ),
      zh: (
        <>
          2 的幂在二进制里恰好只有一个 1(1、10、100…)。所以 n &gt; 0 且
          n &amp; (n-1) == 0 即可判定 —— 清掉唯一的 1 后得 0,说明原本只有一个 1。n &gt; 0 这个前置条件不能省:n = 0 时 0 &amp; (−1) = 0;在 32 位整数下(如 Java、JavaScript),n = −2³¹ 的二进制是 1000…0,
          n &amp; (n−1) 也是 0。其余负数都不满足,而 Python 的整数没有固定位宽,任何负数都通不过。写上 n &gt; 0 可以一次挡住这些情况。用 n &amp; (-n) == n 判定同样可行,也同样要先判 n &gt; 0。
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
          两种解法。异或法:把 0..n 的每个下标 i 和每个 nums[i] 全折叠进同一个异或值。出现过的数都会和它对应的下标抵消,剩下的就是缺失的那个。O(1) 空间,而且没有溢出风险。求和法:期望和 n(n+1)/2 减去实际和 ——
          更直观,但 n 很大时期望和会溢出 32 位 int,要换成 64 位。异或法和 136 是同一个思路。
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
          汉明距离就是 x 和 y 二进制下不同位的个数。x ^ y 恰好在「不同的位」上得 1、相同的位上得 0,于是问题化归为「数 x^y 里有几个 1」,也就是 191 的
          popcount。两个小技巧的组合:异或标出差异,popcount 数出个数。
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
          divide and conquer version in O(log w), where w = 32 is the word size,
          that swaps blocks of 16, 8, 4,
          2, then 1 bits. In Java and JavaScript use the unsigned shift
          &gt;&gt;&gt; so the sign bit does not repeat. Python integers have no
          fixed width, so mask with &amp; 0xFFFFFFFF to keep the value inside 32
          bits.
        </>
      ),
      zh: (
        <>
          逐位法:循环 32 次,每次先把结果左移一位腾出空位,再把 n 的最低位(n &amp; 1)放进去,然后 n 右移一位 —— res = (res &lt;&lt; 1) | (n &amp; 1)。还有 O(log w) 的分治版本(w = 32 为字长):按 16/8/4/2/1 位的块两两互换。Java 和 JavaScript 要用无符号右移 &gt;&gt;&gt;,否则符号位会不断复制;
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
          通法是「逐位统计」:对 32 个二进制位分别统计有多少个数在该位上是 1。出现 3 次的数在每位贡献 0 或 3,对 3 取模后只剩下「那个只出现一次的数」在该位的贡献,逐位还原即得答案。O(32n)。更短的写法用 ones/twos 两个变量做小状态机,让每一位自动按模 3 循环。Python 整数没有固定位宽,统计时要 &amp; 0xFFFFFFFF,最后再转回有符号值。本章精讲 C 有逐位统计表的动画。
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
          全部异或得 x = a ^ b。a、b 不相等,所以 x 至少有一位是 1,在这一位上 a、b 恰好不同。用 x &amp; (-x) 取出最低的这一位,再按「该位是 0 还是 1」把所有数分成两组:a、b 必落入不同组,而成对的数一定和自己的同伴落进同一组,于是每组内各做一次异或就得到一个答案。O(n) 时间、O(1) 空间 —— 136 加上 lowbit 的组合。
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
          把每个单词压成一个 26 位掩码:第 k 位为 1 表示单词含第 k 个字母。两个单词无公共字母 ⟺ mask1 &amp; mask2 == 0。先预处理出所有掩码,再两两配对,满足条件时更新长度乘积的最大值。这把「两个集合的交集是否为空」从逐字符扫描降成一次位与,正是「用整数表示集合」的实战用法,也是第 10 章状压 DP 的地基。26 位放进 32 位 int 还很宽裕。
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
          以 1 的个数(popcount)为第一关键字、数值本身为第二关键字排序即可。popcount 用 191 的 n &amp; (n-1) 循环或语言内置函数算。排序本身是第 01 章的内容,这题复盘的是「位运算结果 + 自定义比较器」的组合。
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
          双指针从两个字符串的末尾往前走。每一列把两位数字加上进位 carry:写下的位是 sum % 2,新的进位是 sum / 2。循环结束后别忘了最后一次进位,然后把结果反转。也可以转成整数,反复迭代「无进位和 a^b、进位(a&amp;b)&lt;&lt;1」直到进位为 0,但输入可能比任何固定位宽的整数都长,所以字符串模拟才是稳妥答案。这题考的是进位处理的细心,不是花哨的恒等式。
        </>
      ),
    },
  },
];
