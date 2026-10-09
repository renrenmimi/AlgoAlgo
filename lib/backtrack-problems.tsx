// Chapter 5 - Backtracking: problem set (the quiz is in lib/backtrack-quiz.tsx).
// The problem set covers the backtracking module of lc.md: combinations (77/216/17/39/40),
// partitioning (131/93), subsets (78/90/491), permutations (46/47) and board problems
// (51/37), plus one extra -- Generate Parentheses (22) -- for 15 problems in total.
// hint only points at a direction without spoiling; key explains the optimal solution and
// the underlying pattern in one paragraph.
// Bilingual: title / tags / hint / key and every piece of quiz copy are Loc<...>, written
// inline as { en, zh }.
// The English title uses LeetCode's official English name, the Chinese one its official
// Chinese name.

import type { Problem } from "@/lib/problems";

export const PROBLEMS: Problem[] = [
  {
    lc: 17,
    title: {
      en: "Letter Combinations of a Phone Number",
      zh: "电话号码的字母组合",
    },
    d: "medium",
    tags: {
      en: ["Combinations", "Several sets", "Starter"],
      zh: ["组合", "多个集合", "入门"],
    },
    hint: {
      en: "Each digit maps to its own group of letters, and you take one letter from each group. Every level of the tree uses a different group, so there is no startIndex here.",
      zh: "每个数字对应一组字母,是从「多个不同集合」里各挑一个 —— 树的每一层换一个集合,没有 startIndex。",
    },
    key: {
      en: (
        <>
          Decision tree: level i holds the letters of digit i. Loop over the letters
          of that level, append one to the path, recurse into level i+1, then remove
          it. The stop condition is that the path length equals the number of digits.
          The difference from LC 77 is what a deeper call may reuse:{" "}
          <b>77 picks from one set and needs a startIndex to avoid repeating the same
          combination in a different order; 17 changes set at every level, so the
          level index alone says which group to read</b>, and no startIndex is needed.
        </>
      ),
      zh: (
        <>
          决策树:第 i 层对应第 i 个数字的字母集合。遍历这一层的每个字母、加入路径、递归到第 i+1 层,再撤销。结束条件是路径长度等于数字个数。它和 77 的区别在于「更深一层允许重用什么」:
          <b>77 是从同一个集合里选,要靠 startIndex 防止同一个组合换个顺序再来一遍;
          17 每层换一个集合,层号本身就指明了该读哪一组</b>,不需要 startIndex。
        </>
      ),
    },
  },
  {
    lc: 77,
    title: { en: "Combinations", zh: "组合" },
    d: "medium",
    tags: {
      en: ["Combinations", "startIndex", "Pruning", "Worked example"],
      zh: ["组合", "startIndex", "剪枝", "精讲"],
    },
    hint: {
      en: "Choose k numbers from 1..n, where [1,2] and [2,1] count as the same answer. How do you make each combination appear once? Then ask: once the numbers still left cannot fill k slots, is there any reason to go deeper?",
      zh: "从 1..n 里选 k 个,[1,2] 和 [2,1] 算同一个 —— 怎么保证每个组合只出现一次?再想想:剩下的数已经不够凑满 k 个,还有必要往下走吗?",
    },
    key: {
      en: (
        <>
          dfs(start): when the path holds k numbers, record a copy of it; otherwise
          loop i from start to n, take i, recurse with dfs(i+1), then undo.{" "}
          <b>startIndex forces every pick to move forward</b>, so each combination is
          generated once, in increasing order. The pruning is the point of this
          problem: <span className="mono">k − path.size</span> more numbers are still
          needed, so the loop can stop at{" "}
          <span className="mono">n − (k − path.size) + 1</span> instead of n. That is
          a constraint check — the cut branches cannot produce a valid answer at all.
          Worked example A has the two decision trees, before and after pruning.
        </>
      ),
      zh: (
        <>
          dfs(start):路径满 k 个就收一份拷贝;否则从 start 遍历到 n,选 i、递归 dfs(i+1)、撤销。
          <b>startIndex 保证「只往后选」</b>,于是每个组合只按升序生成一次。剪枝是本题的精髓:还需要 <span className="mono">k − path.size</span> 个数,循环上界可以从 n 收紧到{" "}
          <span className="mono">n − (k − path.size) + 1</span>。这属于约束剪枝 —— 被砍掉的分支根本凑不出合法答案。本章精讲 A 有剪枝前后两棵决策树的对照动画。
        </>
      ),
    },
  },
  {
    lc: 78,
    title: { en: "Subsets", zh: "子集" },
    d: "medium",
    tags: {
      en: ["Subsets", "Record at every node", "Worked example"],
      zh: ["子集", "每节点收集", "精讲"],
    },
    hint: {
      en: "A combination is only an answer once it holds k numbers. What about a subset? The empty set and every single-element set are answers too, so the moment you record is different.",
      zh: "组合要「选够 k 个才算一个答案」,子集呢?空集、单元素集也都是答案 —— 收集的时机不一样。",
    },
    key: {
      en: (
        <>
          The same tree as combinations, with one difference:{" "}
          <b>record at every node instead of at the leaves</b>, because the current
          path is already a subset, the empty one included. dfs(start): add a copy of
          the path to the answers, then pick forward from start, recurse, and undo.
          Time is O(n · 2ⁿ), where n is the number of elements: there are 2ⁿ subsets
          and copying one costs up to O(n). Worked example B animates the node-by-node
          collection.
        </>
      ),
      zh: (
        <>
          和组合是同一棵树,唯一区别:<b>不在叶子收,而是每进入一个节点就收一次</b>
          —— 因为「当前路径」本身就是一个子集,空集也算。dfs(start):先把 path 的一份拷贝加入答案,再从 start 往后选、递归、撤销。时间 O(n·2ⁿ),n 是元素个数:2ⁿ 个子集,复制一个最多 O(n)。本章精讲 B 有逐节点收集的动画。
        </>
      ),
    },
  },
  {
    lc: 46,
    title: { en: "Permutations", zh: "全排列" },
    d: "medium",
    tags: {
      en: ["Permutations", "used array", "Worked example"],
      zh: ["排列", "used 数组", "精讲"],
    },
    hint: {
      en: "Order matters here, so [1,2] and [2,1] are two different answers. A startIndex that only moves forward would lose half of them. What else can tell you which numbers are already on the path?",
      zh: "排列讲顺序,[1,2] 和 [2,1] 是两个不同答案 —— 只往后选的 startIndex 会漏掉一半。那怎么知道哪些数已经在路径里?",
    },
    key: {
      en: (
        <>
          Every level of a permutation must be able to reach{" "}
          <b>every position that is not on the path yet</b>, including positions
          before the current one, so <b>a used boolean array replaces startIndex</b>.
          dfs(): when the path holds n numbers, record a copy; otherwise loop over
          every index i, skip it if used[i] is true, and otherwise choose it
          (used[i]=true, push to path), recurse, and undo both (used[i]=false, pop).
          Time is O(n · n!): n! permutations, each copied in O(n). Worked example C shows
          the used array frame by frame.
        </>
      ),
      zh: (
        <>
          排列的每一层都要能选到<b>所有还没进入路径的位置</b>,包括比当前更靠前的,所以<b>用 used 布尔数组代替 startIndex</b>。dfs():路径满 n 个就收一份拷贝;否则遍历每个下标 i,若 used[i] 为真就跳过,否则选它(used[i]=true、入路径)、递归、把两处状态都撤销(used[i]=false、出路径)。时间 O(n·n!):n! 个排列,每个复制一次 O(n)。本章精讲 C 有 used 数组的逐帧现场。
        </>
      ),
    },
  },
  {
    lc: 216,
    title: { en: "Combination Sum III", zh: "组合总和 III" },
    d: "medium",
    tags: {
      en: ["Combinations", "Two prunings"],
      zh: ["组合", "双重剪枝"],
    },
    hint: {
      en: "LC 77 with a second requirement: the k numbers must also add up to n. Two constraints give you two places to prune.",
      zh: "77 的加强版:不但要选够 k 个,和还必须等于 n。两个约束 = 两处剪枝。",
    },
    key: {
      en: (
        <>
          Keep the skeleton of 77 and carry a running sum. When the path holds k
          numbers, record it only if the sum equals n. Two prunings stack: (1) not
          enough numbers left, the same upper-limit rule as 77; (2){" "}
          <b>the running sum already exceeds n, and since only 1..9 are available and
          all are positive, going deeper can only make it larger, so stop</b>. &quot;More
          constraints means more places to prune&quot; is the general pattern for the
          harder combination problems.
        </>
      ),
      zh: (
        <>
          沿用 77 的骨架,再带一个 sum:路径满 k 个时,还要 sum 等于 n 才收集。两处剪枝叠加:①个数不够(同 77 的上界剪枝);②
          <b>当前和已经超过 n —— 可选的只有 1..9 且全是正数,再往下只会更大,直接停</b>。「多个约束 → 多处剪枝」是组合类进阶题的通用套路。
        </>
      ),
    },
  },
  {
    lc: 39,
    title: { en: "Combination Sum", zh: "组合总和" },
    d: "medium",
    tags: {
      en: ["Combinations", "Reuse the same number", "Distinct values"],
      zh: ["组合", "可重复选", "无重复元素"],
    },
    hint: {
      en: "The same number may be picked many times. So when you recurse, should you pass i or i+1?",
      zh: "同一个数可以选很多次 —— 那递归时 startIndex 应该传 i 还是 i+1?",
    },
    key: {
      en: (
        <>
          The values are distinct but <b>each may be used any number of times</b>. The
          one change: recurse with <b>dfs(i), not dfs(i+1)</b>, so the deeper level can
          pick the same value again. The start index still prevents the same multiset
          from appearing in a different order (2+3 and 3+2 keep only one form).
          Pruning: sort first, and when{" "}
          <span className="mono">sum + candidates[i] &gt; target</span>, every later
          candidate is larger, so <code>break</code> out of the loop instead of
          continuing.
        </>
      ),
      zh: (
        <>
          元素互不相同,但<b>每个数可以无限次使用</b>。关键改动只有一处:递归时传 <b>dfs(i) 而不是 dfs(i+1)</b>,让下一层还能再选到自己。start 仍然防止同一组数换个顺序再来一遍(2+3 和 3+2 只留一个)。剪枝:先排序,当{" "}
          <span className="mono">sum + candidates[i] &gt; target</span> 时,后面的候选只会更大,直接 <code>break</code> 掉整个循环。
        </>
      ),
    },
  },
  {
    lc: 40,
    title: { en: "Combination Sum II", zh: "组合总和 II" },
    d: "medium",
    tags: {
      en: ["Combinations", "Skip at the same level", "Duplicate values"],
      zh: ["组合", "树层去重", "重复元素"],
    },
    hint: {
      en: "This time the array contains duplicate values and each element may be used once. How do you stop one loop from picking two equal values and producing the same combination twice?",
      zh: "这次数组里有重复元素,而且每个元素只能用一次 —— 怎么防止同一个循环选到两个相同的值,产生重复组合?",
    },
    key: {
      en: (
        <>
          Duplicate values, each element used once: <b>sort first</b> so equal values
          sit next to each other, then <b>skip a repeat inside the same loop</b> —{" "}
          <span className="mono">
            if (i &gt; start &amp;&amp; nums[i] == nums[i-1]) continue;
          </span>
          . Recurse with dfs(i+1), since each element is used once. Section 08 uses a
          decision tree to explain why the test is{" "}
          <span className="mono">i &gt; start</span> and not{" "}
          <span className="mono">i &gt; 0</span>.
        </>
      ),
      zh: (
        <>
          元素有重复、每个只用一次:先<b>排序</b>让相同的值相邻,再在<b>同一个循环里跳过重复值</b> ——{" "}
          <span className="mono">
            if (i &gt; start &amp;&amp; nums[i] == nums[i-1]) continue;
          </span>
          。递归传 dfs(i+1)(每个元素用一次)。本章 §08「去重两板斧」用决策树讲透:为什么是{" "}
          <span className="mono">i &gt; start</span> 而不是{" "}
          <span className="mono">i &gt; 0</span>。
        </>
      ),
    },
  },
  {
    lc: 90,
    title: { en: "Subsets II", zh: "子集 II" },
    d: "medium",
    tags: {
      en: ["Subsets", "Skip at the same level", "Review"],
      zh: ["子集", "树层去重", "复盘"],
    },
    hint: {
      en: "LC 78 plus the deduplication of LC 40. The array has duplicate values: how do you make [1,1] appear exactly once and [1] appear exactly once?",
      zh: "78 子集 + 40 的去重。数组有重复元素,怎么让 [1,1] 只出现一次、[1] 也不重复出现?",
    },
    key: {
      en: (
        <>
          Record-at-every-node from 78 combined with the same-level skip from 40.
          After sorting, dfs(start) first records a copy of the path, then skips with{" "}
          <span className="mono">i &gt; start &amp;&amp; nums[i] == nums[i-1]</span>.
          Section 08 animates exactly this on the subsets of [1,1,2]: without the skip
          you get two {"{1}"} and two {"{1,2}"}; with it the duplicate branch is never
          entered, while {"{1,1}"} still survives.
        </>
      ),
      zh: (
        <>
          78 的每节点收集 + 40 的树层去重。排序后,dfs(start) 先收一份 path 的拷贝,再用 <span className="mono">i &gt; start &amp;&amp; nums[i] == nums[i-1]</span> 跳过同层重复。本章 §08 就是拿 [1,1,2] 的子集树做的对照动画:不去重会冒出两个 {"{1}"}、两个 {"{1,2}"};去重后那条重复分支一步都不进,而 {"{1,1}"} 依然保住。
        </>
      ),
    },
  },
  {
    lc: 47,
    title: { en: "Permutations II", zh: "全排列 II" },
    d: "medium",
    tags: {
      en: ["Permutations", "Skip at the same level", "used"],
      zh: ["排列", "树层去重", "used"],
    },
    hint: {
      en: "LC 46 gave you the used array, and now the input also has duplicate values. In the skip condition, what exactly is !used[i-1] testing?",
      zh: "46 有了 used 数组,现在数组还有重复元素。去重条件里那个 !used[i-1],到底在判断什么?",
    },
    key: {
      en: (
        <>
          Deduplicating permutations = the used array of 46 plus the same-level skip.
          After sorting, skip when{" "}
          <span className="mono">
            i &gt; 0 &amp;&amp; nums[i] == nums[i-1] &amp;&amp; !used[i-1]
          </span>
          . <b>!used[i-1] is the part that matters</b>: if the equal value before it
          has already been tried and undone, it is not on the path, which means this
          is a repeat at the same node — skip. If it is still on the path
          (used[i-1] is true), the second copy is being appended after the first one
          along the path, which is a real permutation such as [1,1] — keep it. Using{" "}
          <span className="mono">used[i-1]</span> instead also returns correct answers,
          but it detects the repetition deeper in the tree, so it prunes later and runs
          slower. Section 08 compares the two.
        </>
      ),
      zh: (
        <>
          排列去重 = 46 的 used 数组 + 树层去重。排序后,跳过条件是{" "}
          <span className="mono">
            i &gt; 0 &amp;&amp; nums[i] == nums[i-1] &amp;&amp; !used[i-1]
          </span>
          。<b>!used[i-1] 是关键</b>:前一个相同的值已经试完并撤销、不在路径上,说明这是同一个节点上的重复选择,跳过;若它还在路径上(used[i-1] 为真),那是第二个相同值接在第一个后面,是 [1,1] 这种真实存在的排列,必须保留。换成 <span className="mono">used[i-1]</span> 同样能得到正确答案,只是要到更深的地方才发现重复,剪得更晚、更慢。§08 有两者的对照。
        </>
      ),
    },
  },
  {
    lc: 131,
    title: { en: "Palindrome Partitioning", zh: "分割回文串" },
    d: "medium",
    tags: {
      en: ["Partitioning", "startIndex is the cut point"],
      zh: ["分割", "startIndex 当切割线"],
    },
    hint: {
      en: "Treat cutting as a choice too: startIndex no longer says which number to pick, it says where the next piece begins.",
      zh: "把「切割」也看成决策:startIndex 不再是选哪个数,而是「下一段从哪里开始」。",
    },
    key: {
      en: (
        <>
          The idea behind partitioning problems:{" "}
          <b>startIndex is the beginning of the next piece, that is, the position
          right after the previous cut</b>. dfs(start): let i run from start to the
          end and take the substring s[start..i]. If it is a palindrome, append it to
          the path, recurse with dfs(i+1), and undo; if it is not, skip it — that skip
          is the pruning. When start reaches the end of the string, one complete way
          of cutting has been found. &quot;A cut is a choice made in the gap between two
          characters&quot; is the shared model for this family.
        </>
      ),
      zh: (
        <>
          分割问题的要点:<b>startIndex 表示下一段的起点,也就是上一刀之后的位置</b>。dfs(start):让 i 从 start 走到末尾,取子串 s[start..i];若它是回文,就加入路径、递归 dfs(i+1)、撤销;不是回文就跳过 —— 这一跳就是剪枝。start 到达串尾 = 找到一种完整切法。「切割 = 在字符间隙上做选择」是分割类题目的统一模型。
        </>
      ),
    },
  },
  {
    lc: 93,
    title: { en: "Restore IP Addresses", zh: "复原 IP 地址" },
    d: "medium",
    tags: {
      en: ["Partitioning", "Many prunings"],
      zh: ["分割", "多重剪枝"],
    },
    hint: {
      en: "Still cutting, but with more rules: exactly 4 pieces, each between 0 and 255, and no leading zero. More rules means more branches you can cut.",
      zh: "还是切割,但限制更多:必须切成 4 段,每段 0~255,且不能有前导零。约束越多,能剪的分支越多。",
    },
    key: {
      en: (
        <>
          The cutting frame of 131 plus a set of validity checks: each piece is 1 to 3
          characters, its value is at most 255, and it has no leading zero unless the
          piece is exactly &quot;0&quot;. Once 4 pieces are cut, all characters must
          have been used exactly. <b>Treat the number of pieces as a second
          dimension</b> — four pieces is the stop condition — and cut a branch as soon
          as a piece fails a check. It is the same partitioning skeleton as 131; only
          the number of pruning rules differs.
        </>
      ),
      zh: (
        <>
          131 的切割框架 + 一组合法性检查:每段长度 1~3、数值不超过 255、除了「0」本身之外不能有前导零;切满 4 段时必须正好用完所有字符。
          <b>把「段数」当第二个维度</b>(切满 4 段就是结束条件),某段的合法性检查一旦失败就立刻剪掉这条分支。它和 131 是同一套分割骨架,区别只在剪枝规则的多少。
        </>
      ),
    },
  },
  {
    lc: 491,
    title: { en: "Non-decreasing Subsequences", zh: "非递减子序列" },
    d: "medium",
    tags: {
      en: ["Subsets", "Deduplication", "Cannot sort"],
      zh: ["子集", "去重", "不能排序"],
    },
    hint: {
      en: "Find every non-decreasing subsequence without duplicates. But this time you cannot sort first, because sorting would destroy the original order. So what replaces the compare-with-the-previous rule?",
      zh: "求所有非递减子序列,还要去重 —— 但这次不能先排序(一排序就破坏了原有顺序)。那树层去重靠什么?",
    },
    key: {
      en: (
        <>
          The trap: the original order must be kept, so <b>you cannot sort</b>, and
          the &quot;compare with the previous element&quot; rule from 40 and 90 no longer
          proves anything. Use <b>one set per level</b> instead: inside a single dfs
          call, keep a set of the values already picked at this node and skip a value
          that is in it. Add the condition that the subsequence stays non-decreasing
          (nums[i] &ge; the last element of the path) and that its length is at least
          2. It is the same rule as before —{" "}
          <b>never pick two equal values at the same node</b> — written for the case
          where sorting is not allowed.
        </>
      ),
      zh: (
        <>
          要注意:必须保持原顺序,<b>不能排序</b>,所以 40 / 90 的「和前一个比」失去依据。改用<b>每层一个 set</b>:在一次 dfs 调用内部记录「这个节点上已经选过哪些值」,遇到集合里已有的值就跳过。再叠加「必须非递减(nums[i] ≥ path 末尾)」和「长度至少为 2」两个条件。它和前面是同一条规则 ——
          <b>同一个节点上不选两个相同的值</b> —— 只是换成不能排序时的写法。
        </>
      ),
    },
  },
  {
    lc: 22,
    title: { en: "Generate Parentheses", zh: "括号生成" },
    d: "medium",
    tags: {
      en: ["Combinations", "The constraint is the pruning", "Extra"],
      zh: ["组合", "合法性剪枝", "补充"],
    },
    hint: {
      en: "Each step has only two choices: write '(' or write ')'. When is writing ')' illegal? Answer that and you have the best possible pruning.",
      zh: "每一步只有两个选择:放「(」或放「)」。什么时候放「)」是非法的?想清楚,就是最好的剪枝。",
    },
    key: {
      en: (
        <>
          Two choices per level. The pruning rules:{" "}
          <b>
            write <code>(</code> only while fewer than n of them have been used, and
            write <code>)</code> only while the number of <code>)</code> is smaller
            than the number of <code>(</code>
          </b>{" "}
          — otherwise a closing bracket would appear with no open bracket to match.
          When both counts reach n, the string is one
          valid answer. This problem usually has no visible undo step, because the
          partial string is <b>passed down as a new value at each call</b> instead of
          being mutated and restored. That is the second correct way to carry a path:
          it costs a copy per node, but here the string is short and it reads well.
          It is also a clear example of using a validity rule as the pruning.
        </>
      ),
      zh: (
        <>
          决策树每层二选一。剪枝规则:
          <b>
            左括号用了不到 n 个才能放 <code>(</code>;右括号数量小于左括号数量才能放{" "}
            <code>)</code>
          </b>
          —— 否则会出现没有左括号与之配对的右括号。左右都用满 n 个,就是一个合法解。这道题通常看不到显式的撤销,因为半成品字符串是
          <b>每次调用都以新值往下传</b>,而不是「改一改再还原」。这正是带路径的第二种正确写法:每个节点多一次复制,但这里字符串很短,读起来更顺。它也是「用合法性当剪枝」的绝佳范例。
        </>
      ),
    },
  },
  {
    lc: 51,
    title: { en: "N-Queens", zh: "N 皇后" },
    d: "hard",
    tags: {
      en: ["Board", "Conflict check", "Worked example"],
      zh: ["棋盘", "冲突检测", "精讲"],
    },
    hint: {
      en: "Place one queen per row and choose its column. Before placing, ask: does any queen already on the board share this column or one of the two diagonals?",
      zh: "逐行放皇后,每行选一列。放下前先问:这一列、两条斜线上有没有已经放好的皇后?",
    },
    key: {
      en: (
        <>
          Rows become the levels of the tree: dfs(row) tries every column col, and if
          (row, col) is attacked by no queen above — same column, same{" "}
          <span className="mono">row − col</span> diagonal, or same{" "}
          <span className="mono">row + col</span> diagonal — it places a queen,
          recurses into dfs(row+1), and undoes. Reaching row n means one solution is
          complete. Three boolean arrays or sets (one column set and the two diagonal
          sets) make the check <b>O(1)</b>; moving down a{" "}
          <span className="mono">\</span> diagonal adds 1 to both row and col, so{" "}
          <span className="mono">row − col</span> is constant along it, and moving
          down a <span className="mono">/</span> diagonal keeps{" "}
          <span className="mono">row + col</span> constant. Worked example D animates a 4×4
          board, conflicts and all.
        </>
      ),
      zh: (
        <>
          把「行」当决策树的层:dfs(row) 遍历每一列 col,若 (row, col) 不被上方任何皇后攻击(同列、同 <span className="mono">row − col</span> 对角线、同 <span className="mono">row + col</span> 对角线),就放下、递归 dfs(row+1)、撤销。row 到达 n = 找到一个解。用三个布尔数组或集合(一个列集合 + 两个对角线集合)可以把冲突检测降到 <b>O(1)</b>:沿 <span className="mono">\</span> 对角线往下走,
          row 和 col 同时加 1,所以 <span className="mono">row − col</span> 恒定;沿 <span className="mono">/</span> 对角线往下走,
          <span className="mono">row + col</span> 恒定。本章精讲 D 有 4×4 棋盘的逐行放置 + 冲突 + 回退动画。
        </>
      ),
    },
  },
  {
    lc: 37,
    title: { en: "Sudoku Solver", zh: "解数独" },
    d: "hard",
    tags: {
      en: ["Board", "2D backtracking", "Bitmask version"],
      zh: ["棋盘", "二维回溯", "位运算进阶"],
    },
    hint: {
      en: "Find the first empty cell and try the digits 1 to 9. Place a digit that breaks no rule and solve the rest; if that fails, erase it and try the next digit.",
      zh: "找到第一个空格,试填 1~9,填一个合法数字就递归解剩下的;填不下去就擦掉换一个。",
    },
    key: {
      en: (
        <>
          Backtracking on a two-dimensional board: find an empty cell, try the digits
          1 to 9, and if a digit breaks none of the row, column, or 3×3 box rules,
          write it and solve the rest. If the recursion succeeds, return true all the
          way up; if it fails, erase the digit — that is the undo. The three rule
          checks are the constraint pruning. A faster version{" "}
          <b>packs the digits already used in each row, column, and box into the bits
          of one integer</b>, so both the check and the &quot;which digits are still
          allowed&quot; question become bit operations (see chapter 04 · bit
          manipulation). This is the &quot;one problem, two solutions&quot; pairing
          that lc.md rule 2 asks for: plain backtracking, then the bitmask version.
        </>
      ),
      zh: (
        <>
          二维棋盘上的回溯:找一个空格,枚举 1~9,若填入不违反行、列、3×3 宫的规则,就填下并递归解剩下的棋盘;递归成功就一路返回 true,失败就擦掉 —— 这一擦就是撤销。三项规则检查就是它的约束剪枝。更快的版本
          <b>把每行、每列、每宫「已用的数字」压进一个整数的各个二进制位</b>,于是判重和「还能填哪些数字」都变成位运算(见第 04 章 · 位运算)。这正是 lc.md 规则 2 点名的「同题两解:普通回溯 + 位运算优化」。
        </>
      ),
    },
  },
];
