// Chapter 9 - Subsequence DP: quiz data.
// Kept apart from the problem set so that the atlas, which lists every chapter's problems,
// does not load the quizzes too.

import type { QuizItem } from "@/lib/quiz";

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "What is the difference between a subsequence and a subarray (a substring)?",
      zh: "「子序列(subsequence)」和「子数组 / 子串(subarray / substring)」的区别是什么?",
    },
    opts: {
      en: [
        "A subsequence keeps the original relative order but does not have to be contiguous; a subarray is a contiguous block of the original sequence",
        "A subsequence must be contiguous; a subarray may skip elements",
        "They are the same thing under two names",
        "A subsequence must contain an even number of elements; a subarray has no such limit",
      ],
      zh: [
        "子序列保持原来的相对顺序,但不要求连续;子数组 / 子串是原序列里连续的一段",
        "子序列必须连续,子数组可以跳着取",
        "两者是同一个东西的两种叫法",
        "子序列只能取偶数个元素,子数组没有这个限制",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "This is the other way round. The contiguous one is the subarray. A subsequence is allowed to skip elements as long as the order is kept.",
        "They differ, and the difference decides the state definition: a contiguous problem such as LC 718 resets to 0 on a mismatch, while LC 1143 keeps the larger of two neighbors.",
        "There is no restriction on how many elements you take. The only difference is whether the elements have to be contiguous.",
      ],
      zh: [
        undefined,
        "说反了。要求连续的是子数组;子序列恰恰允许跳过元素,只要不打乱先后顺序。",
        "两者不同,而且这个差别直接决定状态怎么定义:连续型(LC 718)不匹配时归零,LC 1143 不匹配时取两个邻格里较大的那个。",
        "取几个元素没有任何限制。唯一的差别是元素是否必须连续。",
      ],
    },
    why: {
      en: "Whether the elements must be contiguous is the first fork in this chapter. It decides what happens in the mismatch case: reset to 0 for a subarray, or carry the larger neighbor forward for a subsequence. The lab in section 01 lets you try both.",
      zh: "「是否要求连续」是本章的第一个分岔口:它决定了不匹配那一格该归零(子数组),还是继承较大的邻格(子序列)。§01 的实验室就是让你亲手感受这条界线。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In the O(n²) solution to LC 300, dp[i] is defined as the length of the longest increasing subsequence ending at index i, rather than the longest one among the first i elements. Why?",
      zh: "LC 300 的 O(n²) 解法把 dp[i] 定义成「以下标 i 结尾的最长上升子序列长度」,而不是「前 i 个元素里的最长上升子序列长度」。为什么?",
    },
    opts: {
      en: [
        "Fixing the last element is what makes the transition possible: you can compare nums[j] with nums[i] and decide whether nums[i] can be appended",
        "Because \"ending at i\" runs faster and has a lower complexity",
        "The two definitions are equivalent, so either one works",
        "Because \"the longest among the first i\" cannot be stored in an array",
      ],
      zh: [
        "固定了末尾元素,转移才写得出来:可以比较 nums[j] 与 nums[i],判断 nums[i] 能不能接上去",
        "因为「以 i 结尾」跑得更快,复杂度更低",
        "两种定义等价,随便选一个都行",
        "因为「前 i 个里的最长上升子序列」没法用数组存",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Both definitions would be O(n²) if they worked. Speed is not the reason. The reason is that a fixed last element gives the transition something to compare against.",
        "They are not equivalent. \"The longest among the first i\" does not say which element it ends with, so you cannot tell whether nums[i] may be appended to it. The transition cannot be written at all.",
        "Both are single numbers per index, so storage is not the issue. The problem is that \"the longest among the first i\" leaves out the last element, which the transition needs.",
      ],
      zh: [
        undefined,
        "如果第二种定义能用,复杂度同样是 O(n²)。快慢不是理由,理由是固定末尾之后,转移才有可比较的对象。",
        "两者并不等价。「前 i 个里的最长上升子序列」没有说它以哪个元素结尾,于是无法判断 nums[i] 能否接上去,转移根本写不出来。",
        "两种定义每个下标都只是一个数,存储不是问题。问题在于「前 i 个里的最长」丢掉了「末尾元素是谁」,而转移正需要这个信息。",
      ],
    },
    why: {
      en: "Anchoring a subproblem by its last element is the central technique of subsequence DP. The cost of that choice is that the answer is no longer in the last cell: you must take the maximum over the whole dp array.",
      zh: "「用末尾元素锚定子问题」是子序列 DP 的核心技巧。代价是答案不再落在最后一格 —— 必须取整个 dp 数组的最大值。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          Work it out by hand: for nums = [1, 3, 2, 4, 5], how long is the longest
          increasing subsequence?
        </>
      ),
      zh: (
        <>
          手推一遍:nums = [1, 3, 2, 4, 5] 的最长上升子序列有多长?
        </>
      ),
    },
    placeholder: { en: "Enter a whole number…", zh: "输入一个整数…" },
    answers: ["4"],
    hint: {
      en: "dp = [1, 2, 2, 3, ?]. The last value, 5, is larger than every earlier value, so it can extend the best subsequence found so far.",
      zh: "dp = [1, 2, 2, 3, ?]。最后一个数 5 比前面所有数都大,可以接在目前最好的那条后面。",
    },
    why: {
      en: "dp = [1, 2, 2, 3, 4] and the maximum is 4, for example [1, 3, 4, 5] or [1, 2, 4, 5]. Here the maximum happens to sit in dp[4], because the largest value is at the end. Change the input and the answer can be anywhere in the array, which is why you take the maximum of all of it.",
      zh: "dp = [1, 2, 2, 3, 4],最大值是 4,对应 [1, 3, 4, 5] 或 [1, 2, 4, 5]。这里最大值恰好落在 dp[4],是因为最大的数正好在末尾。换一组数据,最大值可能出现在数组的任何位置 —— 所以要取全数组的最大值。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Both LC 718 (maximum length of repeated subarray) and LC 1143 (longest common subsequence) fill a two-dimensional table. How do they differ when the two current characters are not equal?",
      zh: "LC 718(最长重复子数组)和 LC 1143(最长公共子序列)都在填一张二维表。当前两个字符不相等时,它们的转移有什么不同?",
    },
    opts: {
      en: [
        "LC 718 resets the cell to 0 because the run is broken; LC 1143 takes max(dp[i-1][j], dp[i][j-1]) because a subsequence may skip the mismatching character",
        "Both reset the cell to 0",
        "Both take max(above, left)",
        "LC 718 takes the max and LC 1143 resets to 0",
      ],
      zh: [
        "LC 718 把该格归零,因为连续段断了;LC 1143 取 max(dp[i-1][j], dp[i][j-1]),因为子序列可以跳过对不上的字符",
        "两者都归零",
        "两者都取 max(上, 左)",
        "LC 718 取 max,LC 1143 归零",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Only LC 718 resets. LC 1143 asks for a subsequence, so the mismatching character can be skipped and the larger of the two neighbors is carried forward.",
        "Only LC 1143 takes the max. LC 718 asks for a contiguous run, so one mismatch ends the run and the cell must go back to 0.",
        "This is the wrong way round. Resetting belongs to LC 718, which requires contiguity. Taking the max belongs to LC 1143, which does not.",
      ],
      zh: [
        undefined,
        "只有 LC 718 归零。LC 1143 求的是子序列,可以跳过对不上的字符,把两个邻格里较大的那个继承下来。",
        "只有 LC 1143 取 max。LC 718 求的是连续段,一次不匹配这段就断了,格子必须回到 0。",
        "正好说反。归零的是要求连续的 LC 718;取 max 的是不要求连续的 LC 1143。",
      ],
    },
    why: {
      en: "One word in the problem statement, contiguous or not, turns the mismatch case from \"reset to 0\" into \"keep the larger neighbor\". In the match case the two are identical: both go to the diagonal, dp[i-1][j-1] + 1.",
      zh: "题面上「连续」这两个字,把不匹配那一格从「归零」变成了「保留较大的邻格」。而匹配时两者完全一样,都走对角线 dp[i-1][j-1] + 1。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which of these statements about dp[i][j] in LC 1143 (longest common subsequence) are correct? (Select all that apply)",
      zh: "关于 LC 1143(最长公共子序列)的 dp[i][j],下面哪些说法是对的?(多选)",
    },
    opts: {
      en: [
        "When s[i-1] == t[j-1], dp[i][j] = dp[i-1][j-1] + 1, so the value comes from the diagonal",
        "When s[i-1] != t[j-1], dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
        "Row 0 and column 0, which stand for an empty string, are all 0",
        "When the characters differ, dp[i][j] should be reset to 0",
      ],
      zh: [
        "当 s[i-1] == t[j-1] 时,dp[i][j] = dp[i-1][j-1] + 1,值来自对角线",
        "当 s[i-1] != t[j-1] 时,dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
        "第 0 行和第 0 列(代表空串)全部为 0",
        "字符不相等时应该把 dp[i][j] 归零",
      ],
    },
    correct: [0, 1, 2],
    missHint: {
      en: "The three parts are: the diagonal on a match, the larger of the two neighbors on a mismatch, and 0 along the empty-string row and column. Check which one you left out.",
      zh: "三个要点是:匹配走对角线、不匹配取两个邻格里较大的、空串那一行一列是 0。看看漏了哪一条。",
    },
    extraHint: {
      en: "One option belongs to LC 718. Resetting to 0 is what a contiguous problem does. A longest common subsequence never resets.",
      zh: "有一个选项是 LC 718 的规则。归零是「要求连续」的题才会做的事,最长公共子序列任何时候都不清零。",
    },
    why: {
      en: "The diagonal handles a matched pair, the two neighbors handle \"drop one character and keep looking\", and the empty-string row and column are the base cases. Because nothing ever resets, the answer is always the bottom-right cell.",
      zh: "对角线负责「配对成功」,两个邻格负责「放弃一个字符继续找」,空串行和空串列是初始值。正因为任何时候都不清零,答案总是落在右下角。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In LC 72 (edit distance), when word1[i-1] != word2[j-1] the transition is dp[i][j] = min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]) + 1. Which operation does each source cell stand for?",
      zh: "LC 72(编辑距离)中,当 word1[i-1] != word2[j-1] 时,转移是 dp[i][j] = min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]) + 1。这三个来源格分别对应哪种操作?",
    },
    opts: {
      en: [
        "dp[i-1][j-1] is replace, dp[i-1][j] is delete, dp[i][j-1] is insert",
        "All three stand for replace, only along different paths",
        "dp[i-1][j-1] is insert, dp[i-1][j] is replace, dp[i][j-1] is delete",
        "The diagonal is delete, the cell above is insert, the cell on the left is replace",
      ],
      zh: [
        "dp[i-1][j-1] 是替换,dp[i-1][j] 是删除,dp[i][j-1] 是插入",
        "三个都是替换,只是路径不同",
        "dp[i-1][j-1] 是插入,dp[i-1][j] 是替换,dp[i][j-1] 是删除",
        "对角线是删除,上方是插入,左方是替换",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The three are different operations: the diagonal replaces, the cell above deletes, the cell on the left inserts.",
        "The diagonal is replace, not insert. One replacement consumes the last character of both strings at once, and that is exactly one step diagonally.",
        "The mapping is wrong. The diagonal replaces the last character of word1, the cell above deletes it, and the cell on the left inserts the last character of word2 at the end of word1.",
      ],
      zh: [
        undefined,
        "三者是不同的操作:对角线是替换,上方是删除,左方是插入。",
        "对角线是替换,不是插入。一次替换同时消化掉两个串的末字符,正好对应斜着走一格。",
        "映射错了。对角线是替换 word1 的末字符,上方是删除它,左方是在 word1 末尾插入 word2 的末字符。",
      ],
    },
    why: {
      en: "Read each source cell as \"what does the string look like after that one operation\". Delete makes word1 one shorter, so i drops by 1. Insert matches one more character of word2, so j drops by 1. Replace consumes one character from each, so both drop by 1. When the two characters are already equal, no operation is needed and the value is copied straight from the diagonal.",
      zh: "把每个来源格读成「做完那一步操作之后,串变成什么样」:删除让 word1 短一位,所以 i 减 1;插入又匹配掉 word2 的一位,所以 j 减 1;替换同时消化两边各一位,所以 i、j 都减 1。而两个字符本来就相等时不需要任何操作,直接抄对角线的值。",
    },
  },
  {
    type: "choice",
    q: {
      en: "LC 516 asks for the longest palindromic subsequence. Which known problem can it be turned into directly?",
      zh: "LC 516 求最长回文子序列。它可以直接转化成下面哪个已知问题?",
    },
    opts: {
      en: [
        "The longest common subsequence of s and reverse(s)",
        "The longest increasing subsequence of s",
        "The most frequent character in s",
        "The longest run of equal characters after sorting s",
      ],
      zh: [
        "s 与 reverse(s)(s 的反转)的最长公共子序列",
        "s 的最长上升子序列",
        "s 中出现次数最多的字符",
        "把 s 排序后最长的相同字符连续段",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The longest increasing subsequence is about values getting larger. A palindrome is about symmetry, which is a different property.",
        "The most frequent character only counts occurrences. It cannot tell you how long the longest symmetric subsequence is.",
        "Sorting destroys the original order, and the symmetry of a palindrome depends entirely on that order.",
      ],
      zh: [
        undefined,
        "最长上升子序列关心的是数值递增,而回文关心的是对称,两者不是一回事。",
        "出现次数最多的字符只统计频次,回答不了「最长的对称子序列有多长」。",
        "排序会打乱原来的顺序,而回文的对称性完全依赖这个顺序。",
      ],
    },
    why: {
      en: "A palindrome reads the same in both directions, so a palindromic subsequence of s is a subsequence that also appears, in the same order, in reverse(s). That makes it a common subsequence of the two strings, and LC 1143 solves it unchanged. Interval DP solves it directly as well, which is the preview of Chapter 10.",
      zh: "回文正读反读一样,所以 s 的回文子序列同时也会按相同顺序出现在 reverse(s) 里 —— 也就是这两个串的公共子序列,LC 1143 的代码原封不动就能用。当然也可以直接写区间 DP,那是第 10 章的预告。",
    },
  },
];
