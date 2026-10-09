// Chapter 12 - String Algorithms: problem set (the quiz is in lib/strings-quiz.tsx).
// The problem set covers KMP, applications of the prefix function, palindromes and parsing,
// ordered easy to hard;
// hint only points at a direction without spoiling, key explains the optimal solution in one
// paragraph.
// The whole chapter uses one next/pi convention: next[i] = the length of the longest proper
// prefix of the substring s[0..i] that is also a suffix of it, with next[0] = 0.
//
// Bilingual: title / tags are passed as { en, zh }; hint / key / quiz copy are written
// inline with <T en zh />.

import type { Problem } from "@/lib/problems";
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
            暴力每次失配都把主串指针拽回起点的下一格重来。有没有办法把「失败前已经确认的信息」留住,让主串指针永不回退?
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
            <b>Rabin-Karp</b>:把长度 m 的窗口哈希成一个数,窗口右移时 O(1) 更新这个数。哈希相等只是候选,必须再逐字符复核。带复核的期望复杂度是 O(n + m),但碰撞频繁时最坏会退化到 O(n·m)。暴力匹配是 O(n·m)。本章精讲 A 两种都讲透。
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
            前缀函数的一行判据。设 n = len(s),k = next[n−1] 是整串的最长相等真前后缀长度,循环节候选长度就是 n − k。若 <b>k &gt; 0 且 n % (n − k) == 0</b>,则 s 由长度 (n−k) 的子串重复而成。原因:相等的前后缀重叠了 k 个字符,它们错开的那 (n−k) 就是最小循环节。另有一行解:把 s 接两遍、掐头去尾后仍包含 s,等价于 s 由重复子串构成。本章精讲 B 讲原理。
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
            egg → add 能对上,foo → bar 不行(o 要同时变成 a 和 r)。一个字符只能有一个替换目标,反过来一个目标也只能被一个字符占用。
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
            建<b>两张</b>映射:map1 记 s[i] → t[i],map2 记 t[i] → s[i]。遍历时若任一张表里当前字符已有不同的映射值,直接判否。只做单向映射会漏掉「两个不同字符映射到同一个」的情况,例如 badc → baba。O(n) 时间。技巧变体:把每个字符替换成「它上次出现的位置」,两串的位置序列相等即同构。
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
            关键观察:s 的所有旋转形态,恰好是 s + s 中所有长度为 len(s) 的子串。所以答案为真的条件是 <b>len(s) == len(goal) 且 goal 是 s + s 的子串</b>。判子串就回到 28 题:用内置 contains 可以,用 KMP 就把本题变成 28 的一道应用 ——
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
            回文关于中心对称。与其枚举「两端」,不如枚举「中心」再向两边扩。别忘了偶数长度的回文,中心在两个字符之间。
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
            DataData chapter 02 (String) introduced expand from center, so this is a review
            that then connects to Manacher.
          </>
        }
        zh={
          <>
            中心扩展:枚举每一个可能的对称中心,两侧字符相等就继续向外扩。中心共有 <b>2n−1</b> 个(n 个单字符中心对应奇长度,n−1 个字符缝隙中心对应偶长度)。每个中心最多扩 O(n) 次,总计 O(n²) 时间、O(1) 额外空间。Manacher 算法复用「已求出的回文的对称性」跳过重复扩张,做到 O(n),本章只讲它的思路。DataData 第 2 章(字符串)介绍过中心扩展,这里作复盘,并接上 Manacher。
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
            典型的<b>手写状态机</b>:①跳过前导空格;②最多读一个 +/− 号;③连续读数字,边读边 <code>ans = ans*10 + d</code>;④遇到第一个非数字立即停止;
            ⑤每步检查 32 位范围,溢出就夹到 INT_MAX 或 INT_MIN。难点全在边界:空串、全是空格、符号后面没有数字、前导零、正负两侧溢出。面试官爱这道题,是因为它考「把模糊需求翻译成确定逻辑」的能力。
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
            若 b 是 a 叠加若干次后的子串,那把 a 重复 <b>⌈len(b)/len(a)⌉</b> 次通常已经够长。但 b 可能从某一份的靠后位置开始、跨到下一份里,所以还要允许再多叠一次,上界是这个次数 + 1。构造出足够长的串后判 b 是否为其子串(KMP 或内置函数),返回用到的叠加次数,判不出返回 −1。思路是「重复到够长 + 判子串」,又是 28 题的一次应用。
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
            只能在前面加字符,所以要保留的是「从头开始的最长回文前缀」,其余部分翻转后补到最前。怎么快速找到这个前缀?
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
            目标是 s 的<b>最长回文前缀</b>:把它之后的部分翻转,拼到最前面。技巧:构造 <code>t = s + &apos;#&apos; + reverse(s)</code>,对 t 求前缀函数,
            <b>next[末位]</b> 就是 s 的最长回文前缀长度 —— 因为「既是 s 的前缀、又是 reverse(s)
            的后缀」的那段,正是 s 中正反读相同的前缀。分隔符 <code>#</code> 必须取一个 s 里不出现的字符,它挡住匹配越过中线、把两半串到一起。O(n)。这是「回文 = 字符串与自己的翻转比对」加 KMP 的经典组合。
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
            本题直接考前缀函数的<b>定义</b>:答案 = s[0 .. next[n−1] − 1],即长度为 next[n−1] 的前缀。跑一遍前缀函数构建,取末位值切片即可;末位为 0 时答案是空串。O(n)。做完这题,「最长相等真前后缀」这个词就彻底清楚了 ——
            它是 KMP、459、214 背后同一个引擎。
          </>
        }
      />
    ),
  },
];
