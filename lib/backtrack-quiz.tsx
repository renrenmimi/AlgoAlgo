// Chapter 5 - Backtracking: quiz data.
// Kept apart from the problem set so that the atlas, which lists every chapter's problems,
// does not load the quizzes too.

import type { QuizItem } from "@/lib/quiz";

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "Which sentence describes backtracking most accurately?",
      zh: "回溯算法的本质,最准确的一句话是?",
    },
    opts: {
      en: [
        "A depth-first search over a tree of partial answers: make one choice per step, and when the branch ends or fails, undo the last choice and try the next one",
        "A faster form of dynamic programming",
        "Enumerating every case with nested for loops",
        "A divide-and-conquer algorithm used for sorting",
      ],
      zh: [
        "在一棵「半成品树」上做深度优先搜索:每一步做一个选择,走到底或走不通就撤销刚才的选择、换下一个",
        "一种比 DP 更快的动态规划",
        "把所有情况用多重 for 循环枚举出来",
        "一种专门用来排序的分治算法",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "It is the opposite. Backtracking enumerates every case without missing or repeating one, which is usually exponential. Dynamic programming is faster precisely because it stores results for subproblems that repeat; backtracking keeps no such record.",
        "Nested for loops only handle enumerations whose number of levels is fixed when you write the code. Backtracking exists for the cases where that number is decided during the search: how many numbers to pick, how many cuts to make, how many queens still fit.",
        "Sorting is a different subject. Backtracking is recursive and does branch, but it never splits the input and merges results; it walks every decision path.",
      ],
      zh: [
        undefined,
        "恰恰相反:回溯是不重不漏地穷举,通常是指数级。DP 之所以快,正是因为它把重复出现的子问题记了下来,回溯没有这种记账。",
        "多重 for 循环只能处理「层数在写代码时就固定」的枚举。回溯的用武之地恰恰是层数由搜索过程决定:选几个数、切几刀、还能放下几个皇后。",
        "排序是另一回事。回溯确实是递归 + 分支,但它不拆分输入、也不合并结果,而是走遍每一条决策路径。",
      ],
    },
    why: {
      en: "Organise the problem as a tree of partial answers, walk it depth first, and when a branch fails, undo the last choice and take the next one. Every problem in this chapter differs only in the shape of that tree and in which branches can be cut.",
      zh: "把问题组织成一棵「半成品树」,用 DFS 走遍每条路径,走不通就撤销刚才的选择、换下一个。本章所有题目的差别,只在于「树长什么样」和「哪些分支能剪」。",
    },
  },
  {
    type: "choice",
    q: {
      en: "LC 77 Combinations: choose k numbers from 1..n. Why does the recursion carry a startIndex and only pick from it forward?",
      zh: "LC 77 组合:从 1..n 里选 k 个数。为什么递归要带一个 startIndex,只从它往后选?",
    },
    opts: {
      en: [
        "Order does not matter in a combination, so [1,2] and [2,1] are the same answer. Picking only forward makes every combination appear once, in increasing order.",
        "It makes the code run faster and has nothing to do with correctness",
        "Without it the array index would go out of bounds",
        "startIndex is the marker of a permutation problem",
      ],
      zh: [
        "组合不讲顺序,[1,2] 和 [2,1] 是同一个答案。只往后选,能让每个组合按升序恰好出现一次",
        "只是让代码跑得更快,和正确性无关",
        "不传 startIndex 会导致数组越界",
        "startIndex 是排列问题的标志",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        <>
          It is a <b>correctness</b> question first, not a speed one. Without
          startIndex every level can reach every number, so [1,2] and [2,1] are both
          produced and each combination is counted more than once.
        </>,
        "Bounds have nothing to do with it. Leaving out startIndex does not read past the end of the array; it produces duplicate combinations.",
        <>
          It is the other way round. startIndex marks a <b>combination</b>, where
          picks only move forward. A <b>permutation</b> cares about order, so it
          cannot use startIndex and needs a used array instead.
        </>,
      ],
      zh: [
        undefined,
        <>
          它首先是<b>正确性</b>问题,不只是速度:不带 startIndex,每一层都能选到所有数,于是 [1,2] 和 [2,1] 会同时产生,组合被重复计数。
        </>,
        "越界和它无关。不传 startIndex 不会读到数组之外,只会产生大量重复的组合。",
        <>
          正好说反了:startIndex 是<b>组合</b>的标志(只往后选);
          <b>排列</b>讲顺序,反而不能用 startIndex,要用 used 数组。
        </>,
      ],
    },
    why: {
      en: "A combination has no order, so startIndex forces every pick to move forward and each combination is generated once, in increasing order. This is the basic deduplication tool for the combination family.",
      zh: "组合无序,所以用 startIndex 强制「只往后选」,让每个组合只按升序出现一次 —— 这是组合家族最基本的去重手段。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          LC 77 with n = 4 and k = 2: how many combinations are there? (Count the
          leaves in the decision tree, or compute C(4,2).)
        </>
      ),
      zh: <>LC 77:n = 4、k = 2,一共有多少个组合?(在决策树上数叶子,或用 C(4,2))</>,
    },
    placeholder: { en: "Type an integer…", zh: "输入一个整数…" },
    answers: ["6", "6个"],
    hint: {
      en: "C(4,2) = 4×3 / (2×1). You can also list them: [1,2] [1,3] [1,4] [2,3] [2,4] [3,4].",
      zh: "C(4,2) = 4×3 / (2×1)。也可以直接数:[1,2] [1,3] [1,4] [2,3] [2,4] [3,4]。",
    },
    why: {
      en: "C(4,2) = 6, which is exactly the 6 green leaves in the tree of deep dive A. The branch that starts with 4 can never reach 2 numbers, and pruning removes it before it is entered.",
      zh: "C(4,2) = 6,正是本章精讲 A 决策树里的 6 个绿色叶子。而「从 4 起头」那一支永远凑不满 2 个,剪枝在进门前就把它砍掉了。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Combinations, subsets, and permutations all run on the same kind of decision tree. When does each of them record an answer?",
      zh: "组合、子集、排列都在同一类决策树上跑。它们「收集答案」的时机分别是?",
    },
    opts: {
      en: [
        "Combinations and permutations record at the leaves, where the path meets the required length; subsets record at every node, because the path itself is already a subset",
        "All three record only at the leaves",
        "All three record at every node",
        "Combinations record at every node, subsets and permutations at the leaves",
      ],
      zh: [
        "组合和排列在叶子收(路径满足长度要求时);子集在每一个节点都收,因为路径本身就是一个子集",
        "三者都只在叶子收集",
        "三者都在每个节点收集",
        "组合在每个节点收,子集和排列在叶子收",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        <>
          Subsets do not record only at the leaves. The empty set, {"{1}"}, and{" "}
          {"{1,2}"} are all answers, and they sit at the root, the first level, and
          the second level, so subsets must record at <b>every node</b>.
        </>,
        "Combinations and permutations have a length requirement: k numbers chosen, or all n arranged. Only a leaf satisfies it, so an intermediate node is not an answer for them.",
        "This is reversed. A combination is an answer only once it holds k numbers, which happens at a leaf. A subset is an answer at every node the search reaches.",
      ],
      zh: [
        undefined,
        <>
          子集不是只在叶子收:空集、{"{1}"}、{"{1,2}"} 都是答案,它们分别位于根、第一层、第二层 —— 所以子集要在<b>每个节点</b>收。
        </>,
        "组合和排列有明确的长度要求(选够 k 个、排满 n 个),只有叶子才满足,中途的节点对它们来说不算答案。",
        "正好搞反了。组合要凑够 k 个才算一个答案(叶子收);子集是走到哪个节点、哪个节点就是答案(每节点收)。",
      ],
    },
    why: {
      en: "One sentence to remember: if the path is already meaningful on its own, record at every node (subsets); if the path must satisfy a condition first, record at the leaves (combinations and permutations). This is the detail these three families are most often confused about.",
      zh: "记住一句话:路径本身就有意义 → 每个节点收(子集);路径要满足条件才算数 → 叶子收(组合和排列)。收集时机是这三类题最容易混的点。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Why does LC 46 Permutations use a used boolean array instead of a startIndex like combinations?",
      zh: "LC 46 全排列为什么用 used 布尔数组,而不像组合那样用 startIndex?",
    },
    opts: {
      en: [
        "Order matters, so every level must be able to reach every number that is not on the path yet, including smaller ones. A startIndex would never look back, so it would lose answers; used only excludes what is already on the path.",
        "A used array takes less memory than a startIndex",
        "Because permutations need no deduplication",
        "Either one works; it is a matter of habit",
      ],
      zh: [
        "排列讲顺序,每一层都要能选到所有还没进入路径的数,包括比当前小的。startIndex 只往后看,会漏解;used 只排除已经在路径上的数",
        "used 数组比 startIndex 更省内存",
        "因为排列不需要去重",
        "两者随便用哪个都行,习惯问题",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        <>
          Memory is not the point, and used actually costs one extra array. What
          matters is <b>whether the required number can still be reached</b>:
          startIndex only moves forward, while a permutation must be able to pick a
          number that comes earlier.
        </>,
        <>
          The input of LC 46 has distinct values, so no deduplication is needed there.
          But that is not the issue. The issue is that startIndex would{" "}
          <b>lose answers</b>: in [2,1] the 1 comes after the 2, and startIndex could
          never reach it.
        </>,
        "It is not a matter of habit. With startIndex, [2,1] and [3,1] are never generated at all. That is a correctness difference, not a style one.",
      ],
      zh: [
        undefined,
        <>
          内存不是重点,used 反而多花一个数组。关键是<b>该选的数还能不能选到</b>:
          startIndex 只让你往后选,而排列需要回头选前面的数。
        </>,
        <>
          LC 46 的元素互不相同,确实不用去重。但问题不在去重,而在于用 startIndex 会<b>漏解</b>:[2,1] 里的 1 排在 2 后面,startIndex 根本够不到它。
        </>,
        "不是习惯问题:用 startIndex,[2,1]、[3,1] 压根不会被生成。这是正确性差异,不是风格差异。",
      ],
    },
    why: {
      en: "Combinations only pick forward, so startIndex is enough. Permutations treat a different order as a different answer, so every level must reach every unused number, and used is what records which ones are taken.",
      zh: "组合只往后选,startIndex 就够了;排列把不同顺序算作不同答案,每一层都要能选到所有未使用的数,而记录「哪些已被占用」的正是 used。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In LC 47 Permutations II (the input has duplicates) the skip condition is i>0 && nums[i]==nums[i-1] && !used[i-1]. What is !used[i-1] there for?",
      zh: "LC 47 全排列 II(数组含重复)的去重条件是 i>0 && nums[i]==nums[i-1] && !used[i-1]。这里的 !used[i-1] 在判断什么?",
    },
    opts: {
      en: [
        "It catches a repeat at the same node: the equal value before it has just been tried and undone, so this node already built that exact branch, and the current one is skipped",
        "It prevents an out-of-bounds read, so that i-1 does not become negative",
        "It catches the case where the path has grown too long",
        "It does nothing; the result is the same without it",
      ],
      zh: [
        "它拦的是「同一个节点上的重复」:前一个相同的值刚被试过并撤销,说明这个节点已经开过一模一样的分支,当前这个就跳过",
        "它防数组越界,避免 i-1 变成负数",
        "它拦「路径太长」的情况",
        "它没有作用,删掉结果也一样",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The i>0 in front already handles bounds. !used[i-1] asks whether the previous equal element is on the path right now, which has nothing to do with indexing.",
        "It has nothing to do with the length of the path. used[i-1] describes whether the element at index i-1 is currently taken; it tells you which direction the repetition came from.",
        "Removing it produces many duplicate permutations. !used[i-1] is the switch that separates a repeat at the same node (cut it) from an equal value appended along the path (keep it).",
      ],
      zh: [
        undefined,
        "越界由前面的 i>0 负责。!used[i-1] 判的是「前一个相同元素此刻在不在路径里」,和下标无关。",
        "它和路径长度无关。used[i-1] 描述的是「下标 i-1 的元素当前有没有被占用」,用来判断重复来自哪个方向。",
        "删掉就会产生大量重复排列。!used[i-1] 正是区分「同节点重复(要剪)」和「沿路径延用(要留)」的开关。",
      ],
    },
    why: {
      en: "!used[i-1] true means the previous equal value was tried at this node and undone, so this is a repeat at the same node and the branch is cut. If used[i-1] is true, the equal value is being appended after the first one along the path, which is a real permutation such as [1,1] and must be kept. Using used[i-1] instead also gives correct answers, but it prunes deeper in the tree and runs slower.",
      zh: "!used[i-1] 为真 = 前一个相同的值刚在这个节点上试过并撤销 = 同节点重复 → 剪掉。若 used[i-1] 为真,那是相同值接在第一个后面、沿路径延用,是 [1,1] 这种真实排列,必须保留。换成 used[i-1] 同样能得对,但要到更深处才剪,更慢。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which statements about pruning are correct? (Select all that apply.)",
      zh: "关于「剪枝(pruning)」,下列哪些说法正确?(多选)",
    },
    opts: {
      en: [
        "Pruning means checking, before entering a subtree, whether that subtree can still lead anywhere, and not entering it if it cannot",
        "In LC 77, once the numbers still left cannot fill k slots, the branch can be skipped without entering it",
        "Pruning changes the answers, producing fewer of them",
        "Pruning always improves the worst-case complexity of the search",
      ],
      zh: [
        "剪枝就是在进入一棵子树之前,先判断它还有没有可能走通,没可能就不进",
        "LC 77 里,若剩下的数已经不够凑满 k 个,这一支可以一步不进直接跳过",
        "剪枝会改变问题的答案,让结果变少",
        "剪枝总能改善搜索的最坏情况复杂度",
      ],
    },
    correct: [0, 1],
    missHint: {
      en: "There are two correct statements: the general idea of checking before entering, and the count-based cut in LC 77. You missed one of them.",
      zh: "正确的有两条:「进门前先判断可行性」的通用思想,以及 77 的个数剪枝。你漏了其中一条。",
    },
    extraHint: {
      en: (
        <>
          Pruning <b>does not change the answers</b>, and it does not necessarily
          improve the worst-case bound either — you selected one of the wrong
          options. Pruning such as the diagonal check in N-Queens usually changes the
          actual running time but rarely improves the worst-case bound. It removes
          only branches that were going to fail anyway, so the set of answers is
          identical while the running time can drop by orders of magnitude.
        </>
      ),
      zh: (
        <>
          剪枝<b>不改变答案</b>,也<b>不一定改善最坏情况的上界</b> —— 你多选了一个错误项。像 N 皇后的对角线检查这类剪枝,通常只改变实际运行时间,难以改进最坏情况的上界。被剪掉的都是注定失败的分支,答案一个不少,但运行时间可能快几个数量级。
        </>
      ),
    },
    why: {
      en: "Pruning rejects branches in advance, so the answers stay the same while far fewer nodes are visited. There are two kinds: a branch that cannot be valid (a constraint check, which is what this chapter uses everywhere) and a branch that cannot be better than the best answer so far (a bound, used when searching for an optimum). LC 77 tightening the loop limit from n to n−(k−chosen)+1 is a constraint check, and so is the break in Combination Sum once the running sum exceeds the target. In both cases what falls is mainly the real running time; the worst-case bound usually stays the same.",
      zh: "剪枝提前否定走不通的分支,答案不变,访问的节点数却少得多。它分两种:分支不可能合法(约束检查,本章处处都是),以及分支不可能比当前最优更好(界,求最优解时才用)。77 把上界从 n 收紧到 n−(k−已选)+1 属于前者;组合总和里「和已超过目标就 break」也是。两种情况下下降的主要是真实运行时间,最坏情况的上界通常不变。",
    },
  },
  {
    type: "choice",
    q: {
      en: "The template undoes the choice after every recursive call returns (path.pop(), used[i]=false, erase the square). What happens if you forget the undo?",
      zh: "回溯模板里,每次递归返回后都要撤销选择(path.pop()、used[i]=false、擦掉棋盘)。如果忘了撤销会怎样?",
    },
    opts: {
      en: [
        "The shared state keeps what the previous branch left behind, so the next choice is made on top of it and the answers are wrong",
        "It only runs slower; the answers are still correct",
        "It causes a stack overflow",
        "Nothing changes; the undo is optional",
      ],
      zh: [
        "共享状态会残留上一条分支留下的东西,下一个选择是在这个残留的状态上做的,答案就错了",
        "只是慢一点,结果仍然正确",
        "会导致栈溢出",
        "没有任何影响,撤销可有可无",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "It is not about speed. Without the undo, path keeps elements chosen by the previous branch, and the sibling branches continue on that state, so the answers come out wrong.",
        "A stack overflow comes from recursion that never reaches its stop condition. A missing undo does not change the recursion depth; it corrupts the shared path.",
        "The undo is the \"back\" in backtracking. Without it, sibling branches share a polluted path and the result is almost certainly wrong.",
      ],
      zh: [
        undefined,
        "不是快慢问题,是对错问题:不撤销,path 里会残留上一条分支选过的元素,兄弟分支在脏数据上继续,答案直接错。",
        "栈溢出来自递归永远到不了终止条件。忘记撤销不影响递归深度,只会弄脏共享的路径。",
        "撤销正是「回溯」里的那个「回」。少了它,兄弟分支共用一条被污染的路径,几乎必错。",
      ],
    },
    why: {
      en: "Choose → recurse → un-choose. The undo restores the shared state to exactly what it was before this node was entered, so the sibling branches start clean. It must reverse the choose exactly: if the choose touched both path and used[i], the undo must restore both. Without it, what is left is ordinary recursion over corrupted state.",
      zh: "做选择 → 递归 → 撤销。撤销负责把共享状态恢复成进入这个节点之前的样子,好让兄弟分支从干净的现场出发。它必须精确地反做「选择」:做选择动了 path 和 used[i] 两处,撤销就要把两处都还原。少了它,剩下的只是一个在脏状态上跑的普通递归。",
    },
  },
];
