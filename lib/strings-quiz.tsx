// Chapter 12 - String Algorithms: quiz data.
// Kept apart from the problem set so that the atlas, which lists every chapter's problems,
// does not load the quizzes too.

import type { QuizItem } from "@/lib/quiz";
import { T } from "@/lib/i18n";

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
            暴力法失配就把 i 拽回去重来,已经确认匹配的前缀信息被白白扔掉。KMP 的全部动机就是把这段信息保存进 next 数组,让主串指针永不回退。
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
            <b>真</b>的意思是这段前缀和后缀都不能等于整个子串,否则答案永远是 i+1,毫无用处。这个值记录了模式串「自己和自己有多像」。失配时,已匹配的后缀恰好等于某个前缀,所以模式指针可以直接跳到那个前缀之后,而主串指针原地不动。
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
            整串是 aabaa。它的真前缀有 a / aa / aab / aaba,真后缀有 a / aa / baa / abaa。两边都出现的最长的那个是哪个?
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
            aabaa 的最长相等真前后缀是 <b>aa</b>,长度 2 —— 前两位等于后两位。完整数组是 next = [0,1,0,1,2]。这一格正是 459 / 214 / 1392 都要用到的值。
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
            KMP 匹配主串 haystack 时发生失配(haystack[i] ≠ pattern[j],且 j &gt; 0),正确的动作是?
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
            equal to a prefix, so the matched prefix is never compared again from the start. A
            text character may be compared a few more times after fallbacks, but j rises by at
            most 1 per step and every fallback lowers it, so there are at most n fallbacks in
            total and the scan stays O(n).
          </>
        }
        zh={
          <>
            i 永不回退是 KMP 达到 O(n + m) 的关键。j = next[j−1] 意味着放弃当前对齐,但保留已匹配后缀里等于前缀的那一段,所以已经匹配的前缀不必从头再比。同一个文本字符在回退后可能再比几次,但 j 每步最多 +1、每次回退至少 −1,所以回退总次数不超过 n,整个扫描仍是 O(n)。
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
        "The next array always contains a 0, because next[0] is 0 by definition, so this test is never true.",
      ],
      zh: [
        undefined,
        "前后缀必须是「真」的,所以 k 永远小于 n,这个条件恒不成立。",
        "k 的奇偶和循环节没有关系;真正的判据是 n − k 能否整除 n。",
        "next 里一定有 0(next[0] 按定义就是 0),这个条件永远不成立。",
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
            相等的前后缀重叠了 k 个字符,它们之间错开 n − k,这就是循环节候选长度。只有当 n − k 整除 n、且 k &gt; 0(串确实存在自相似)时,s 才由这个循环节严丝合缝地铺满。
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
            有一条是错的:哈希把一整段子串压成一个数,碰撞永远可能发生。相信「哈希相等即匹配」就是接受假匹配,结果可能出错。
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
            O(1) 更新让窗口哈希变得便宜。但哈希把一段子串压成一个数,不同子串可能碰撞,所以哈希相等只是候选,必须逐字符复核。有这一步复核,期望复杂度是 O(n + m);碰撞频繁时最坏是 O(n·m)。取大质数模是为了把数值控制在范围内并降低碰撞率。
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
            &quot;aba&quot; 这类奇回文的对称中心是中间那个字符;&quot;abba&quot; 这类偶回文的对称中心在两个 b 之间的缝隙里。只枚举 n 个字符中心会漏掉所有偶数长度的回文,所以要枚举 n + (n−1) = 2n−1 个中心。
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
            同构要求映射<b>两个方向都一对一</b>:s → t 要一致,t → s 也要一致。只查单向会放过「多个源字符落到同一个目标字符」的情况,所以要同时维护两张映射表,任一方向冲突即判否。
          </>
        }
      />
    ),
  },
];
