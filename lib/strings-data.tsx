// 第 12 章 · 字符串算法 —— 题单与测验数据。
// 题单按「暴力 → KMP → 前缀函数应用 → 回文 → 解析类」由易到难铺开;
// hint 只给方向不剧透,key 用一段话把最优解讲透。
// 全章统一 next/π 约定:next[i] = 子串 s[0..i] 的「最长相等真前后缀」长度,next[0]=0。
//
// 双语:title / tags 传 { en, zh };hint / key / 测验文案直接写 <T en zh />。

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";
import { T } from "@/lib/i18n";

export const PROBLEMS: Problem[] = [
  {
    lc: 28,
    title: {
      en: "Find the Index of the First Occurrence in a String",
      zh: "找出字符串中第一个匹配项的下标(strStr)",
    },
    d: "easy",
    tags: {
      en: ["KMP", "Rolling hash", "Worked example"],
      zh: ["KMP", "滚动哈希", "精讲"],
    },
    hint: (
      <T
        en={
          <>
            Brute force pulls the text pointer back to the next start position after every
            mismatch. Can you keep what the failed comparison already told you, so the text
            pointer never moves backwards?
          </>
        }
        zh={
          <>
            暴力每次失配都把主串指针拽回起点的下一格重来。有没有办法把「失败前已经确认的信息」
            留住,让主串指针永不回退?
          </>
        }
      />
    ),
    key: (
      <T
        en={
          <>
            Two solutions to the same problem, and both are the point of this chapter.
            <b> KMP</b>: first match the pattern against itself to compute the prefix
            function <code>next</code> (the length of the longest equal proper prefix and
            suffix). During matching the text pointer i never moves back; on a mismatch set
            j = next[j−1] to slide the pattern to a position that is already known to agree.
            That is O(n + m) in the worst case. <b>Rabin-Karp</b>: hash the window of length
            m into one number and update that number in O(1) when the window moves right.
            Equal hashes are only a candidate, so you must compare the characters. With
            verification the expected cost is O(n + m), but the worst case is O(n·m) when
            many hashes collide. Naive matching is O(n·m). Worked example A covers both.
          </>
        }
        zh={
          <>
            本章两大主角的同题双解。<b>KMP</b>:先让模式串和自己匹配,算出前缀函数
            <code> next</code>(最长相等真前后缀长度);匹配时主串指针 i 永不回退,失配就令
            j = next[j−1],把模式串滑到「已知能对上」的位置,最坏情况也是 O(n + m)。
            <b>Rabin-Karp</b>:把长度 m 的窗口哈希成一个数,窗口右移时 O(1) 更新这个数。
            哈希相等只是候选,必须再逐字符复核。带复核的期望复杂度是 O(n + m),
            但碰撞频繁时最坏会退化到 O(n·m)。暴力匹配是 O(n·m)。本章精讲 A 两种都讲透。
          </>
        }
      />
    ),
  },
  {
    lc: 459,
    title: { en: "Repeated Substring Pattern", zh: "重复的子字符串" },
    d: "easy",
    tags: {
      en: ["KMP", "Using next", "Worked example"],
      zh: ["KMP", "next 妙用", "精讲"],
    },
    hint: (
      <T
        en={
          <>
            If s is one substring repeated, then shifting s by exactly one period still lines
            it up with itself. The prefix function measures exactly that overlap.
          </>
        }
        zh={
          <>
            如果 s 由某个子串重复而成,那把 s 整体错开一个循环节,它还能和自己对上 ——
            前缀函数量的正是这段重叠。
          </>
        }
      />
    ),
    key: (
      <T
        en={
          <>
            The prefix function answers this in one line. Let n = len(s) and let k = next[n−1]
            be the length of the longest equal proper prefix and suffix of the whole string.
            The candidate period length is n − k. If <b>k &gt; 0 and n % (n − k) == 0</b>,
            then s is a substring of length (n − k) repeated. Why: the equal prefix and suffix
            overlap in k characters, so the part they are shifted by is n − k, and that shift
            is the smallest period. There is also a one-line solution: s is built from a
            repeated substring exactly when (s + s) with the first and last character removed
            still contains s. Worked example B explains the reasoning.
          </>
        }
        zh={
          <>
            前缀函数的一行判据。设 n = len(s),k = next[n−1] 是整串的最长相等真前后缀长度,
            循环节候选长度就是 n − k。若 <b>k &gt; 0 且 n % (n − k) == 0</b>,
            则 s 由长度 (n−k) 的子串重复而成。原因:相等的前后缀重叠了 k 个字符,
            它们错开的那 (n−k) 就是最小循环节。另有一行解:把 s 接两遍、掐头去尾后仍包含 s,
            等价于 s 由重复子串构成。本章精讲 B 讲原理。
          </>
        }
      />
    ),
  },
  {
    lc: 205,
    title: { en: "Isomorphic Strings", zh: "同构字符串" },
    d: "easy",
    tags: {
      en: ["Hash map", "Parsing"],
      zh: ["哈希映射", "解析类"],
    },
    hint: (
      <T
        en={
          <>
            egg → add works, but foo → bar does not, because o would have to become both a
            and r. One character gets one replacement, and the replacement must be used by
            only that character.
          </>
        }
        zh={
          <>
            egg → add 能对上,foo → bar 不行(o 要同时变成 a 和 r)。
            一个字符只能有一个替换目标,反过来一个目标也只能被一个字符占用。
          </>
        }
      />
    ),
    key: (
      <T
        en={
          <>
            Build <b>two</b> maps: map1 records s[i] → t[i], map2 records t[i] → s[i]. While
            scanning, if either map already holds a different value for the current
            character, return false. A single map misses the case where two different
            characters map to the same target, for example badc → baba. O(n) time. A neat
            variant: replace every character by the position where it last appeared, then the
            two strings are isomorphic exactly when those position sequences are equal.
          </>
        }
        zh={
          <>
            建<b>两张</b>映射:map1 记 s[i] → t[i],map2 记 t[i] → s[i]。遍历时若任一张表里
            当前字符已有不同的映射值,直接判否。只做单向映射会漏掉「两个不同字符映射到同一个」
            的情况,例如 badc → baba。O(n) 时间。技巧变体:把每个字符替换成「它上次出现的位置」,
            两串的位置序列相等即同构。
          </>
        }
      />
    ),
  },
  {
    lc: 796,
    title: { en: "Rotate String", zh: "旋转字符串" },
    d: "easy",
    tags: {
      en: ["Substring test", "KMP application"],
      zh: ["子串判定", "KMP 应用"],
    },
    hint: (
      <T
        en={
          <>
            Write s twice in a row. Every rotation of s is somewhere inside that doubled
            string. Is goal one of those substrings?
          </>
        }
        zh={
          <>
            把 s 连着写两遍,s 的每一种旋转结果都藏在这条双倍串里 —— goal 是它的子串吗?
          </>
        }
      />
    ),
    key: (
      <T
        en={
          <>
            The key observation: the rotations of s are exactly the substrings of s + s that
            have length len(s). So the answer is yes exactly when{" "}
            <b>len(s) == len(goal) and goal is a substring of s + s</b>. The substring test is
            LC 28 again. A built-in contains is fine, and KMP turns this problem into an
            application of LC 28: O(n) with KMP, O(n²) with naive substring search.
          </>
        }
        zh={
          <>
            关键观察:s 的所有旋转形态,恰好是 s + s 中所有长度为 len(s) 的子串。
            所以答案为真的条件是 <b>len(s) == len(goal) 且 goal 是 s + s 的子串</b>。
            判子串就回到 28 题:用内置 contains 可以,用 KMP 就把本题变成 28 的一道应用 ——
            KMP 是 O(n),朴素判子串是 O(n²)。
          </>
        }
      />
    ),
  },
  {
    lc: 5,
    title: { en: "Longest Palindromic Substring", zh: "最长回文子串" },
    d: "medium",
    tags: {
      en: ["Expand from center", "Review", "Worked example"],
      zh: ["中心扩展", "复盘", "精讲"],
    },
    hint: (
      <T
        en={
          <>
            A palindrome is symmetric around its center. Instead of enumerating the two ends,
            enumerate the center and expand outwards. Remember that an even-length palindrome
            has its center between two characters.
          </>
        }
        zh={
          <>
            回文关于中心对称。与其枚举「两端」,不如枚举「中心」再向两边扩。
            别忘了偶数长度的回文,中心在两个字符之间。
          </>
        }
      />
    ),
    key: (
      <T
        en={
          <>
            Expand from center: try every possible center of symmetry and grow outwards while
            the two characters match. There are <b>2n−1</b> centers: n single-character
            centers for odd lengths, and n−1 gap centers for even lengths. Each center
            expands at most O(n) times, so the total is O(n²) time and O(1) extra space.
            The Manacher algorithm reuses the symmetry of palindromes already found to
            skip repeated expansion and reaches O(n); this chapter explains the idea only.
            The DataData array and two-pointer chapter introduced expand from center, so this
            is a review that then connects to Manacher.
          </>
        }
        zh={
          <>
            中心扩展:枚举每一个可能的对称中心,两侧字符相等就继续向外扩。中心共有 <b>2n−1</b> 个
            (n 个单字符中心对应奇长度,n−1 个字符缝隙中心对应偶长度)。每个中心最多扩 O(n) 次,
            总计 O(n²) 时间、O(1) 额外空间。Manacher 算法复用「已求出的回文的对称性」跳过重复扩张,
            做到 O(n),本章只讲它的思路。DataData 的数组 / 双指针章介绍过中心扩展,
            这里作复盘,并接上 Manacher。
          </>
        }
      />
    ),
  },
  {
    lc: 8,
    title: { en: "String to Integer (atoi)", zh: "字符串转换整数(atoi)" },
    d: "medium",
    tags: {
      en: ["Simulation", "Parsing", "Edge cases"],
      zh: ["模拟", "解析类", "边界"],
    },
    hint: (
      <T
        en={
          <>
            The algorithm is easy. The work is turning the rules into ordered states: skip
            spaces, read one optional sign, read digits, stop at the first non-digit, clamp on
            overflow.
          </>
        }
        zh={
          <>
            这题不难在算法,难在把规则拆成有序的状态:跳空格 → 读符号 → 读数字 →
            遇非数字停 → 溢出夹紧。
          </>
        }
      />
    ),
    key: (
      <T
        en={
          <>
            This is a <b>state machine written out by hand</b>: (1) skip leading spaces;
            (2) read at most one + or − sign; (3) read digits and accumulate{" "}
            <code>ans = ans*10 + d</code>; (4) stop at the first character that is not a
            digit; (5) check the 32-bit range at every step and clamp to INT_MAX or INT_MIN.
            All the difficulty is in the edge cases: empty string, only spaces, a sign with no
            digits after it, leading zeros, and overflow in both directions. Interviewers use
            this problem because it tests turning a vague specification into exact logic.
          </>
        }
        zh={
          <>
            典型的<b>手写状态机</b>:①跳过前导空格;②最多读一个 +/− 号;③连续读数字,
            边读边 <code>ans = ans*10 + d</code>;④遇到第一个非数字立即停止;
            ⑤每步检查 32 位范围,溢出就夹到 INT_MAX 或 INT_MIN。难点全在边界:
            空串、全是空格、符号后面没有数字、前导零、正负两侧溢出。
            面试官爱这道题,是因为它考「把模糊需求翻译成确定逻辑」的能力。
          </>
        }
      />
    ),
  },
  {
    lc: 686,
    title: { en: "Repeated String Match", zh: "重复叠加字符串匹配" },
    d: "medium",
    tags: {
      en: ["Substring test", "KMP application"],
      zh: ["子串判定", "KMP 应用"],
    },
    hint: (
      <T
        en={
          <>
            How many copies of a are long enough to contain b? Compute the smallest count that
            is long enough, add one more copy for safety, then test for a substring.
          </>
        }
        zh={
          <>
            a 要叠加几次才够长到能包住 b?先算够长的最少次数,再多给一次余量,然后判子串。
          </>
        }
      />
    ),
    key: (
      <T
        en={
          <>
            If b is a substring of a repeated some number of times, then repeating a{" "}
            <b>⌈len(b)/len(a)⌉</b> times is usually long enough. One more copy may still be
            needed, because b can start near the end of one copy and cross into the next, so
            the bound is that count plus 1. Build the long string, test whether b is a
            substring of it (KMP or a built-in), and return the number of copies used, or −1
            if no count works. The pattern is repeat until long enough, then test for a
            substring, which is LC 28 applied again.
          </>
        }
        zh={
          <>
            若 b 是 a 叠加若干次后的子串,那把 a 重复 <b>⌈len(b)/len(a)⌉</b> 次通常已经够长。
            但 b 可能从某一份的靠后位置开始、跨到下一份里,所以还要允许再多叠一次,上界是这个次数 + 1。
            构造出足够长的串后判 b 是否为其子串(KMP 或内置函数),返回用到的叠加次数,
            判不出返回 −1。套路是「重复到够长 + 判子串」,又是 28 题的一次应用。
          </>
        }
      />
    ),
  },
  {
    lc: 214,
    title: { en: "Shortest Palindrome", zh: "最短回文串" },
    d: "hard",
    tags: {
      en: ["KMP", "Using next", "Optional"],
      zh: ["KMP", "next 妙用", "选做"],
    },
    hint: (
      <T
        en={
          <>
            You may only add characters at the front, so the part you keep is the longest
            palindromic prefix. The rest is reversed and placed in front. How do you find that
            prefix quickly?
          </>
        }
        zh={
          <>
            只能在前面加字符,所以要保留的是「从头开始的最长回文前缀」,其余部分翻转后补到最前。
            怎么快速找到这个前缀?
          </>
        }
      />
    ),
    key: (
      <T
        en={
          <>
            The goal is the <b>longest palindromic prefix</b> of s; reverse the part after it
            and put that in front. The trick: build{" "}
            <code>t = s + &apos;#&apos; + reverse(s)</code> and compute the prefix function of
            t. Then <b>next[last]</b> is the length of the longest palindromic prefix of s,
            because a prefix of s that equals a suffix of reverse(s) is a prefix of s that
            reads the same backwards. The separator <code>#</code> must be a character that
            does not appear in s; it stops a match from running past the middle and mixing the
            two halves. O(n). This is the classic combination of &quot;a palindrome is a
            string compared with its own reverse&quot; and KMP.
          </>
        }
        zh={
          <>
            目标是 s 的<b>最长回文前缀</b>:把它之后的部分翻转,拼到最前面。
            妙招:构造 <code>t = s + &apos;#&apos; + reverse(s)</code>,对 t 求前缀函数,
            <b>next[末位]</b> 就是 s 的最长回文前缀长度 —— 因为「既是 s 的前缀、又是 reverse(s)
            的后缀」的那段,正是 s 中正反读相同的前缀。分隔符 <code>#</code> 必须取一个 s 里
            不出现的字符,它挡住匹配越过中线、把两半串到一起。O(n)。
            这是「回文 = 字符串与自己的翻转比对」加 KMP 的经典组合。
          </>
        }
      />
    ),
  },
  {
    lc: 1392,
    title: { en: "Longest Happy Prefix", zh: "最长快乐前缀" },
    d: "hard",
    tags: {
      en: ["KMP", "Prefix function"],
      zh: ["KMP", "前缀函数"],
    },
    hint: (
      <T
        en={
          <>
            A happy prefix is the longest substring that is both a proper prefix and a proper
            suffix. That is the definition of the last entry of the prefix function.
          </>
        }
        zh={
          <>
            「快乐前缀」= 既是真前缀又是真后缀的最长子串 —— 这正是前缀函数末位的定义本身。
          </>
        }
      />
    ),
    key: (
      <T
        en={
          <>
            This problem asks for the prefix function <b>by definition</b>: the answer is
            s[0 .. next[n−1] − 1], the prefix of length next[n−1]. Build the prefix function
            once and slice with the last value; if it is 0, the answer is the empty string.
            O(n). After this problem the term &quot;longest equal proper prefix and
            suffix&quot; should be fully clear. It is the same engine behind KMP, LC 459, and
            LC 214.
          </>
        }
        zh={
          <>
            本题就是前缀函数的<b>裸定义题</b>:答案 = s[0 .. next[n−1] − 1],
            即长度为 next[n−1] 的前缀。跑一遍前缀函数构建,取末位值切片即可;末位为 0 时答案是空串。
            O(n)。做完这题,「最长相等真前后缀」这个词就彻底清楚了 ——
            它是 KMP、459、214 背后同一个引擎。
          </>
        }
      />
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            Naive string matching costs O(n·m) in the worst case. Where exactly is the work
            wasted?
          </>
        }
        zh={<>暴力字符串匹配最坏是 O(n·m)。它的浪费究竟发生在哪里?</>}
      />
    ),
    opts: {
      en: [
        "After a mismatch the text pointer i goes back to the position right after the current start, so the prefix that already matched is thrown away and compared again from the beginning",
        "The length of the pattern is recomputed on every attempt",
        "Comparing single characters is too slow, so hashing should be used instead",
        "Memory is allocated too often, which makes it slow",
      ],
      zh: [
        "失配后,主串指针 i 退回到「本次起点的下一格」,已经比对成功的那段前缀被丢弃、下次从头再比",
        "每次都要重新计算模式串的长度",
        "字符比较本身太慢,应该改用哈希",
        "内存分配太频繁导致变慢",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Reading the length is O(1), or O(m) once. That is not the same order as the O(n·m) main loop, so it is not the bottleneck.",
        "One character comparison is O(1). Hashing does not remove the structural waste of moving the text pointer back. Rabin-Karp is fast because the window hash updates in O(1), not because comparing characters is faster.",
        "Memory allocation has nothing to do with the cost here. The bottleneck is repeated comparison.",
      ],
      zh: [
        undefined,
        "取长度是 O(1)(或一次性 O(m)),和主循环的 O(n·m) 不在一个量级,不是瓶颈。",
        "单次字符比较是 O(1),换成哈希也去不掉「指针回退重比」这个结构性浪费;Rabin-Karp 快是因为窗口哈希 O(1) 更新,不是因为字符比较更快。",
        "内存分配和这里的复杂度无关 —— 瓶颈是重复比较,不是分配。",
      ],
    },
    why: (
      <T
        en={
          <>
            Naive matching drags i back on a mismatch and starts over, so the information from
            the prefix that already matched is discarded. That is the whole motivation for
            KMP: store that information in the next array so the text pointer never moves
            backwards.
          </>
        }
        zh={
          <>
            暴力法失配就把 i 拽回去重来,已经确认匹配的前缀信息被白白扔掉。
            KMP 的全部动机就是把这段信息保存进 next 数组,让主串指针永不回退。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            In the prefix function (the next array), what is next[i] exactly? (This chapter
            defines next[i] over the substring s[0..i].)
          </>
        }
        zh={<>next 数组(前缀函数)中,next[i] 的准确含义是?(本章约定 next[i] 针对子串 s[0..i])</>}
      />
    ),
    opts: {
      en: [
        "The length of the longest equal proper prefix and suffix of s[0..i]: the longest substring that is both a prefix and a suffix of s[0..i] and is not the whole of s[0..i]",
        "How many times the character s[i] appears in the whole string",
        "The length of the longest palindromic substring starting at i",
        "The number of distinct characters in s[0..i]",
      ],
      zh: [
        "s[0..i] 的「最长相等真前后缀」长度:既是它的前缀、又是它的后缀,且不等于 s[0..i] 本身的最长子串的长度",
        "字符 s[i] 在整个串里出现的次数",
        "从 i 开始的最长回文子串长度",
        "s[0..i] 里不同字符的个数",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The prefix function has nothing to do with character frequency. It measures how much a prefix and a suffix of the same substring agree.",
        "Palindrome length is what expand from center and Manacher measure. The prefix function is a different tool.",
        "The number of distinct characters is unrelated. The prefix function is about the overlap between a prefix and a suffix.",
      ],
      zh: [
        undefined,
        "前缀函数和字符频率无关;它度量的是同一段子串「前缀与后缀有多相同」。",
        "回文长度是中心扩展 / Manacher 的度量,不是前缀函数;两套工具别混。",
        "不同字符个数是另一回事;前缀函数关心的是前后缀的重叠长度。",
      ],
    },
    why: (
      <T
        en={
          <>
            <b>Proper</b> means the prefix and the suffix are not allowed to be the whole
            substring, otherwise the answer would always be i+1 and useless. This value
            records how much the pattern repeats itself. On a mismatch the suffix that already
            matched is equal to some prefix, so the pattern pointer can jump straight past
            that prefix while the text pointer stays where it is.
          </>
        }
        zh={
          <>
            <b>真</b>的意思是这段前缀和后缀都不能等于整个子串,否则答案永远是 i+1,毫无用处。
            这个值记录了模式串「自己和自己有多像」。失配时,已匹配的后缀恰好等于某个前缀,
            所以模式指针可以直接跳到那个前缀之后,而主串指针原地不动。
          </>
        }
      />
    ),
  },
  {
    type: "fill",
    q: (
      <T
        en={
          <>
            With next[i] = the length of the longest equal proper prefix and suffix of
            s[0..i], compute next[4] (the last entry) for the pattern &quot;aabaa&quot;.
          </>
        }
        zh={
          <>
            按 next[i] = s[0..i] 的最长相等真前后缀长度,对模式串 &quot;aabaa&quot; 计算
            next[4](末位)= ?
          </>
        }
      />
    ),
    placeholder: { en: "Enter an integer…", zh: "输入一个整数…" },
    answers: ["2"],
    hint: (
      <T
        en={
          <>
            The whole string is aabaa. Its proper prefixes are a, aa, aab, aaba. Its proper
            suffixes are a, aa, baa, abaa. Which is the longest one that appears in both
            lists?
          </>
        }
        zh={
          <>
            整串是 aabaa。它的真前缀有 a / aa / aab / aaba,真后缀有 a / aa / baa / abaa。
            两边都出现的最长的那个是哪个?
          </>
        }
      />
    ),
    why: (
      <T
        en={
          <>
            The longest equal proper prefix and suffix of aabaa is <b>aa</b>, length 2: the
            first two characters equal the last two. The full array is next = [0,1,0,1,2].
            This last entry is the value LC 459, LC 214, and LC 1392 all use.
          </>
        }
        zh={
          <>
            aabaa 的最长相等真前后缀是 <b>aa</b>,长度 2 —— 前两位等于后两位。
            完整数组是 next = [0,1,0,1,2]。这一格正是 459 / 214 / 1392 都要用到的值。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            KMP is scanning haystack and hits a mismatch (haystack[i] ≠ pattern[j], with
            j &gt; 0). What is the correct action?
          </>
        }
        zh={
          <>
            KMP 匹配主串 haystack 时发生失配(haystack[i] ≠ pattern[j],且 j &gt; 0),
            正确的动作是?
          </>
        }
      />
    ),
    opts: {
      en: [
        "Leave the text pointer i where it is and set j = next[j−1], which slides the pattern forward using the fact that the suffix already matched is equal to some prefix",
        "Move both the text pointer i and the pattern pointer j back to where this attempt started",
        "Move the text pointer i back to the start of this attempt plus one, and set j to 0",
        "Return −1 immediately, because the match failed",
      ],
      zh: [
        "主串指针 i 原地不动,令 j = next[j−1] —— 用「已匹配后缀恰是某前缀」的性质让模式串滑过去",
        "主串指针 i 和模式指针 j 都退回本次尝试的起点重新开始",
        "主串指针 i 回退到本次起点 +1,j 归零",
        "直接返回 −1,匹配失败",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Moving both pointers back is naive matching again. The point of KMP is that the text pointer i never moves backwards.",
        "Moving i back to the start plus one is exactly what naive matching does. KMP removes that step.",
        "One mismatch does not mean the whole search failed. Only j moves back along the next chain; the scan of the text continues.",
      ],
      zh: [
        undefined,
        "两个指针都回退就退化成暴力法了 —— KMP 的要点恰恰是主串指针 i 永不回退。",
        "「i 回退到起点 +1」正是暴力法的做法,KMP 就是要消灭这一步。",
        "单次失配不代表整体失败;只是 j 沿 next 链回退,主串继续往前扫。",
      ],
    },
    why: (
      <T
        en={
          <>
            i never moving backwards is why KMP reaches O(n + m). Setting j = next[j−1] means
            you give up the current alignment but keep the part of the matched suffix that is
            equal to a prefix, so nothing is compared twice.
          </>
        }
        zh={
          <>
            i 永不回退是 KMP 达到 O(n + m) 的关键。j = next[j−1] 意味着放弃当前对齐,
            但保留已匹配后缀里等于前缀的那一段,所以没有任何字符被重复比较。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            LC 459 asks whether a string s of length n is a substring repeated. Using
            k = next[n−1], which test is correct?
          </>
        }
        zh={<>LC 459 判断长度为 n 的字符串 s 是否由重复子串构成,用 k = next[n−1]。正确判据是?</>}
      />
    ),
    opts: {
      en: [
        "k > 0 and n % (n − k) == 0, in which case the smallest period has length n − k",
        "k == n, that is, the whole string equals its own prefix",
        "k is even",
        "The next array contains no 0",
      ],
      zh: [
        "k > 0 且 n % (n − k) == 0 —— 此时最小循环节长度就是 n − k",
        "k == n,即整串等于自己的前缀",
        "k 是偶数",
        "next 数组里没有 0",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The prefix and suffix must be proper, so k is always less than n. This test can never be true.",
        "Whether k is even says nothing about the period. The real test is whether n − k divides n.",
        "The next array almost always contains 0; next[0] is 0 by definition. This test makes no sense.",
      ],
      zh: [
        undefined,
        "前后缀必须是「真」的,所以 k 永远小于 n,这个条件恒不成立。",
        "k 的奇偶和循环节没有关系;真正的判据是 n − k 能否整除 n。",
        "next 里几乎总有 0(next[0] 按定义就是 0),这个条件说不通。",
      ],
    },
    why: (
      <T
        en={
          <>
            The equal prefix and suffix overlap in k characters, so the shift between them is
            n − k, which is the candidate period length. s is built from that period only when
            n − k divides n exactly and k &gt; 0, that is, when the string does repeat itself
            at all.
          </>
        }
        zh={
          <>
            相等的前后缀重叠了 k 个字符,它们之间错开 n − k,这就是循环节候选长度。
            只有当 n − k 整除 n、且 k &gt; 0(串确实存在自相似)时,s 才由这个循环节严丝合缝地铺满。
          </>
        }
      />
    ),
  },
  {
    type: "multi",
    q: (
      <T
        en={<>Which statements about the Rabin-Karp rolling hash are true? (Select all.)</>}
        zh={<>关于 Rabin-Karp 滚动哈希,下面哪些说法是对的?(多选)</>}
      />
    ),
    opts: {
      en: [
        "When the window moves right by one, the hash can be updated in O(1): subtract the contribution of the character that leaves, multiply by the base, add the new character",
        "Even when the hashes are equal, the characters still have to be compared, because two different substrings can hash to the same value",
        "A large prime modulus is normally used to keep the numbers in range and to lower the collision rate",
        "If the hash function is good enough, equal hashes always mean a real match, so comparing characters is unnecessary",
      ],
      zh: [
        "窗口右移一格时,哈希可以 O(1) 更新:减去移出字符的贡献、乘以基数、加上新字符",
        "哈希值相等时仍需逐字符复核,因为不同的子串可能哈希相同",
        "通常对一个大质数取模,以把数值控制在范围内并降低碰撞率",
        "只要哈希函数够好,哈希相等就一定是真匹配,不必再比字符",
      ],
    },
    correct: [0, 1, 2],
    missHint: (
      <T
        en={
          <>
            The three points of a rolling hash are the O(1) update, the modulus, and the
            character check after equal hashes. You missed one of them.
          </>
        }
        zh={<>滚动哈希的三个要点:O(1) 滑动更新、取模、哈希相等后要复核 —— 你漏了其中一条。</>}
      />
    ),
    extraHint: (
      <T
        en={
          <>
            One option is false. A hash compresses a whole substring into one number, so
            collisions are always possible. Trusting equal hashes means accepting false
            matches, and the answer can then be wrong.
          </>
        }
        zh={
          <>
            有一条是错的:哈希把一整段子串压成一个数,碰撞永远可能发生。
            相信「哈希相等即匹配」就是接受假匹配,结果可能出错。
          </>
        }
      />
    ),
    why: (
      <T
        en={
          <>
            The O(1) update is what makes the window hash cheap. But a hash compresses a
            substring into one number, so different substrings can collide. Equal hashes are
            only a candidate, and the characters must be compared. With that check the
            expected cost is O(n + m); with many collisions the worst case is O(n·m). The
            large prime modulus keeps the values in range and lowers the collision rate.
          </>
        }
        zh={
          <>
            O(1) 更新让窗口哈希变得便宜。但哈希把一段子串压成一个数,不同子串可能碰撞,
            所以哈希相等只是候选,必须逐字符复核。有这一步复核,期望复杂度是 O(n + m);
            碰撞频繁时最坏是 O(n·m)。取大质数模是为了把数值控制在范围内并降低碰撞率。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            When you find the longest palindromic substring by expanding from centers, why are
            there 2n−1 centers instead of n?
          </>
        }
        zh={<>用「中心扩展」求最长回文子串,为什么要枚举 2n−1 个中心而不是 n 个?</>}
      />
    ),
    opts: {
      en: [
        "Palindromes come in two shapes: an odd length has its center on a character (n of those), and an even length has its center in the gap between two characters (n−1 of those)",
        "Because you have to expand once forwards and once backwards",
        "To support both uppercase and lowercase letters",
        "The extra centers lower the time complexity",
      ],
      zh: [
        "回文分两种:奇数长度的中心落在某个字符上(n 个),偶数长度的中心落在两个字符的缝隙里(n−1 个)",
        "因为要正着扩一遍再倒着扩一遍",
        "为了兼容大小写字母",
        "多枚举中心是为了降低时间复杂度",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Expanding already moves left and right at the same time. There is no forward pass and backward pass, and the number of centers has nothing to do with direction.",
        "Letter case has nothing to do with the number of centers. The two kinds of center exist because palindromes have odd and even lengths.",
        "More centers only add a constant factor. They are needed so that no even-length palindrome is missed.",
      ],
      zh: [
        undefined,
        "扩张本身就是同时向左右两侧走,不存在「正着一遍倒着一遍」;中心数目和方向无关。",
        "大小写和中心数量无关 —— 两种中心是为了区分奇、偶长度的回文。",
        "多枚举只增加常数,不会降低复杂度;它是为了不漏掉偶数长度的回文。",
      ],
    },
    why: (
      <T
        en={
          <>
            An odd palindrome such as &quot;aba&quot; is symmetric around its middle
            character. An even palindrome such as &quot;abba&quot; is symmetric around the gap
            between the two b characters. Trying only the n character centers misses every
            even-length palindrome, so you try n + (n−1) = 2n−1 centers.
          </>
        }
        zh={
          <>
            &quot;aba&quot; 这类奇回文的对称中心是中间那个字符;&quot;abba&quot; 这类偶回文的
            对称中心在两个 b 之间的缝隙里。只枚举 n 个字符中心会漏掉所有偶数长度的回文,
            所以要枚举 n + (n−1) = 2n−1 个中心。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            For LC 205, checking only the one-way map s[i] → t[i] gives the wrong answer on
            which kind of input?
          </>
        }
        zh={<>LC 205 同构字符串,只用「s[i] → t[i] 单向映射」判断,会在哪种输入上出错?</>}
      />
    ),
    opts: {
      en: [
        'Two different characters of s map to the same character of t, for example s = "badc", t = "baba", where both b and d map to b',
        "The two strings have different lengths",
        "The strings contain spaces",
        'The strings consist of one repeated character, for example s = "aaa", t = "bbb"',
      ],
      zh: [
        's 里两个不同的字符映射到 t 里同一个字符,例如 s = "badc"、t = "baba",b 和 d 都映射到 b',
        "两个字符串长度不同时",
        "字符串里有空格时",
        's 全是同一个字符时,例如 s = "aaa"、t = "bbb"',
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Different lengths can be rejected before the scan starts, and that has nothing to do with one-way versus two-way maps.",
        "A space is an ordinary character. It does not expose the weakness of a one-way map.",
        "aaa → bbb is a valid isomorphism, and a one-way map accepts it correctly. It is not a counterexample.",
      ],
      zh: [
        undefined,
        "长度不同可以在扫描前直接判否,和单向 / 双向映射的漏洞无关。",
        "空格只是一个普通字符,不会暴露单向映射的缺陷。",
        "aaa → bbb 是合法同构,单向映射也能正确通过 —— 它不是反例。",
      ],
    },
    why: (
      <T
        en={
          <>
            Isomorphic means the mapping is <b>one to one in both directions</b>: s → t must be
            consistent, and t → s must be consistent too. A one-way check accepts the case
            where several source characters land on the same target character, so you keep two
            maps and reject as soon as either direction conflicts.
          </>
        }
        zh={
          <>
            同构要求映射<b>两个方向都一对一</b>:s → t 要一致,t → s 也要一致。
            只查单向会放过「多个源字符落到同一个目标字符」的情况,
            所以要同时维护两张映射表,任一方向冲突即判否。
          </>
        }
      />
    ),
  },
];
