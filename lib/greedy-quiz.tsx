// Chapter 6 - Greedy: quiz data.
// Kept apart from the problem set so that the atlas, which lists every chapter's problems,
// does not load the quizzes too.

import type { QuizItem } from "@/lib/quiz";

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "A greedy algorithm returns an optimal answer only when the problem has which two properties?",
      zh: "贪心算法能得到最优解,依赖的核心性质是?",
    },
    opts: {
      en: [
        "The greedy-choice property (a locally best choice is part of some optimal solution) and optimal substructure (what is left after that choice is the same kind of problem)",
        "The input must already be sorted",
        "The subproblems are independent and can be solved separately",
        "The subproblems overlap heavily, and past choices do not affect the future",
      ],
      zh: [
        "贪心选择性质(当下最优的那个选择,存在于某个最优解中)+ 最优子结构(选完之后剩下的仍是同类问题)",
        "输入数据必须已经有序",
        "子问题互相独立,可以分别求解",
        "存在重叠子问题,且无后效性",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Sorted input is not a condition. Many greedy solutions sort the input themselves as their first step (455, 435, 452). Sorting is a common preparation, not a requirement.",
        "Independent subproblems is the signal for divide and conquer, where the two halves never interact. Greedy does not split the problem into subproblems at all; it makes one choice and moves on.",
        "Overlapping subproblems is the signal for dynamic programming, because storing results pays off there. Greedy never revisits a subproblem. The second half of this option is fine, but the part that matters, the greedy-choice property, is missing.",
      ],
      zh: [
        undefined,
        "有序不是前提 —— 很多贪心的第一步恰恰是自己排序(455 / 435 / 452)。有序只是常见的预处理,不是成立条件。",
        "「子问题独立」是分治的标志(归并的两半互不打扰)。贪心根本不把问题拆成子问题,它只是做一个选择然后往前走。",
        "「重叠子问题」是动态规划的信号 —— 那说明记账有利可图。贪心从不回头重算子问题。无后效性说对了一半,缺的正是关键的贪心选择性质。",
      ],
    },
    why: {
      en: "Greedy needs the greedy-choice property plus optimal substructure. The first one is what separates greedy from DP: you may commit to one choice only if you can show that some optimal solution contains it. If you cannot show it, use DP.",
      zh: "贪心 = 贪心选择性质 + 最优子结构。前者是贪心区别于 DP 的命门:只有能证明「某个最优解包含这个选择」,才敢一步定终身;证不出来就退回 DP。",
    },
  },
  {
    type: "choice",
    q: {
      en: "What does an exchange argument actually prove?",
      zh: "「交换论证(exchange argument)」在贪心正确性证明里,到底证明了什么?",
    },
    opts: {
      en: [
        "That some optimal solution can be rewritten step by step into the greedy solution, and no single rewrite makes it worse, so the greedy solution is optimal too",
        "That the greedy solution is identical, element by element, to one unique optimal solution",
        "That greedy runs faster than brute force",
        "That swapping any two elements of the array leaves the answer unchanged",
      ],
      zh: [
        "存在一个最优解可以一步步改写成贪心解,且每次改写都不会变差 —— 所以贪心解也是最优的",
        "贪心解一定和某个唯一的最优解逐位完全相同",
        "贪心的时间复杂度低于暴力枚举",
        "数组里任意两个元素交换位置后,答案都不变",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "There can be several optimal solutions, and the argument does not claim the greedy answer matches any particular one. It only shows the greedy answer scores as well as an optimal one.",
        "That is complexity analysis, not a correctness proof. An exchange argument answers whether the result is right, not how fast it is produced.",
        "The exchange is between one choice inside an optimal solution and the choice greedy makes. It is not a statement about swapping array elements.",
      ],
      zh: [
        undefined,
        "最优解可能不止一个,交换论证也不要求贪心解等于某个特定最优解 —— 它只证明贪心解的得分和最优解一样好。",
        "那是复杂度分析,不是正确性证明。交换论证只回答「对不对」,不回答「快不快」。",
        "交换的是「最优解里的某个选择」和「贪心的选择」,证明替换后不更差 —— 不是说随便交换数组元素答案不变。",
      ],
    },
    why: {
      en: "An exchange argument is induction in disguise. Assume an optimal solution disagrees with greedy at the first step, replace that step with the greedy choice without making the solution worse, then repeat on what is left. The conclusion is that greedy is optimal.",
      zh: "交换论证是数学归纳法换了件外衣:假设某个最优解在第一步和贪心不同,就把那一步换成贪心的选择而不变差,再对剩下的部分重复同样的论证。结论是贪心全程最优。",
    },
  },
  {
    type: "choice",
    q: {
      en: "LC 455 Assign Cookies, with appetite array g and cookie size array s. Which greedy rule is correct?",
      zh: "LC 455 分发饼干(胃口数组 g,饼干尺寸数组 s),下面哪种贪心策略是对的?",
    },
    opts: {
      en: [
        "Sort both arrays, and give each child the smallest remaining cookie that satisfies him; if it does not, discard that cookie and try a larger one",
        "Do not sort, and hand out cookies to children in random order",
        "Sort only the appetites, leave the cookies unsorted, and hand them out in the given order",
        "Give the largest cookie to the child with the smallest appetite",
      ],
      zh: [
        "双方都排序,用「刚好能满足当前孩子的最小饼干」去喂他,喂不动就丢掉这块换更大的",
        "不排序,把饼干随机分给孩子",
        "只排序孩子的胃口,饼干不排序,依次发放",
        "优先用最大的饼干去喂胃口最小的孩子",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Random assignment has no optimality guarantee. The greedy rule depends on both arrays being sorted, and on always using the smallest cookie that is still large enough.",
        "Sorting one side is not enough. With unsorted cookies you cannot guarantee that the cookie you hand out is the smallest usable one, so a large cookie may be spent on a small appetite while a hungrier child gets nothing.",
        "A large cookie on a small appetite is exactly the waste to avoid. The child with the smallest appetite is satisfied by the smallest usable cookie, and the large cookie should be saved for a child who is harder to satisfy.",
      ],
      zh: [
        undefined,
        "随机分配没有任何最优性保证 —— 贪心的前提是双方都有序,而且每次都用「刚好够」的那块饼干。",
        "只排一边不够:饼干不排序就无法保证发出去的是「最小的可用饼干」,可能拿大饼干喂了小胃口,把更难满足的孩子饿着。",
        "大饼干喂小胃口正是要避免的浪费 —— 胃口最小的孩子用最小的可用饼干就能满足,大饼干应该留给更难满足的人。方向反了。",
      ],
    },
    why: {
      en: "After sorting both sides, giving the smallest usable cookie to the child with the smallest appetite wastes nothing, and an exchange argument shows this choice appears in some optimal assignment. Section 02 has the animation and the proof.",
      zh: "双方排序后,让最小的可用饼干去满足胃口最小的孩子不会造成浪费;交换论证说明这个选择存在于某个最优解中。§02 有逐帧动画和完整证明。",
    },
  },
  {
    type: "multi",
    q: {
      en: "For which of these problems is sorting the intervals by right endpoint the correct choice? (Select all)",
      zh: "下面哪些题,「按区间右端点排序」是正确的选择?(多选)",
    },
    opts: {
      en: [
        "LC 435 Non-overlapping Intervals (delete the fewest intervals so the rest do not overlap)",
        "LC 452 Minimum Number of Arrows to Burst Balloons",
        "LC 56 Merge Intervals",
        "LC 763 Partition Labels",
      ],
      zh: [
        "LC 435 无重叠区间(删最少的区间,使剩下的互不重叠)",
        "LC 452 用最少数量的箭引爆气球",
        "LC 56 合并区间",
        "LC 763 划分字母区间",
      ],
    },
    correct: [0, 1],
    missHint: {
      en: "Sorting by end time belongs to selection problems: keep the most, or cover with the fewest. Ask what 435 and 452 have in common.",
      zh: "按结束时间排序属于「筛选」类问题:保留最多,或用最少的东西覆盖。想想 435 和 452 的共同目标。",
    },
    extraHint: {
      en: "One of your picks merges intervals or cuts a string into parts. Merge Intervals sorts by start, and Partition Labels does not sort intervals at all; it uses the last index of each letter.",
      zh: "你选中的项里有一道是「合并」或「按下标分段」的:合并区间按左端排,划分字母区间根本不对区间排序,它用的是每个字母最后出现的位置。",
    },
    why: {
      en: "When the goal is to keep the most non-overlapping intervals, or to cover them with the fewest arrows, sort by right endpoint and always take the one that ends earliest, because it leaves the most room for the rest. LC 56 merges, so it sorts by start. LC 763 works from the last index of each letter. Short version: selecting looks at the end, merging looks at the start.",
      zh: "目标是「保留最多不重叠区间」或「用最少的箭覆盖」时,按右端排序、优先取结束最早的那个,因为它给后面留下的空间最大。LC 56 是合并,按左端排;LC 763 靠每个字母最后出现的位置分段。一句话:筛选看右端,合并看左端。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In LC 45 Jump Game II, when should the greedy scan increase the jump counter?",
      zh: "LC 45 跳跃游戏 II 用贪心求最少步数,jumps 计数应该在什么时候 +1?",
    },
    opts: {
      en: [
        "When index i reaches curEnd, the last index reachable with the jumps taken so far; then set curEnd to farthest",
        "Once for every index the scan visits",
        "Every time nums[i] > 0",
        "Once at the end, when i reaches the last index",
      ],
      zh: [
        "当下标 i 走到 curEnd(已跳步数内能到的最远下标)时 +1,并把 curEnd 更新为 farthest",
        "每访问一个下标就 +1",
        "每当 nums[i] > 0 就 +1",
        "等 i 到达最后一个下标时,一次性结算出来",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "That counts visited cells, not jumps. One jump can cross many cells, so counting per cell badly overestimates the answer.",
        "Whether nums[i] is positive says nothing about whether you should land there. The scan looks ahead inside the current range and jumps only when the range is used up.",
        "The count cannot wait until the end. Each time the current range is used up, one more jump has become necessary, and that is the only moment when you know it.",
      ],
      zh: [
        undefined,
        "那是在数「访问了几格」,不是「跳了几次」—— 一跳可以跨过很多格,逐格计数会大大高估步数。",
        "nums[i] 是不是正数,和「要不要在这里落脚起跳」无关。贪心是在当前范围内探路,范围用尽时才跳。",
        "步数不能等到最后再算:每当当前范围用尽,就确定又必须多跳一次,而那一刻正是唯一能确定它的时机。",
      ],
    },
    why: {
      en: "Think of the indices reachable in k jumps as layer k. When i reaches curEnd, layer k is finished, so one more jump is needed and the new boundary is farthest, the last index reachable in k + 1 jumps. That is breadth-first search with the queue replaced by two integers.",
      zh: "把「k 跳能到的下标」看成第 k 层。i 走到 curEnd 说明这一层走完了,必须再跳一次,而新边界就是 farthest —— k + 1 跳能到的最远下标。这就是把 BFS 的队列换成两个整数。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          Intervals [[1,4], [2,3], [3,5], [6,8], [7,9]]. What is the smallest
          number of intervals you must remove so that the rest do not overlap?
          (Sort by right endpoint and work through it by hand.)
        </>
      ),
      zh: (
        <>
          区间 [[1,4], [2,3], [3,5], [6,8], [7,9]],至少删掉几个区间,才能让剩下的互不重叠?(按右端排序后逐个贪心保留,手推一遍)
        </>
      ),
    },
    placeholder: { en: "Type a whole number…", zh: "输入一个整数…" },
    answers: ["2", "2个", "two"],
    hint: {
      en: "Sorted by end: [2,3], [1,4], [3,5], [6,8], [7,9]. Keep [2,3] (end = 3). [1,4] starts at 1, which is before 3, so remove it. [3,5] starts at 3, so keep it. Continue and count how many you kept.",
      zh: "按右端排序 → [2,3], [1,4], [3,5], [6,8], [7,9]。保留 [2,3](end = 3);[1,4] 起点 1 早于 3,删掉;[3,5] 起点 3,保留…… 继续数保留了几个。",
    },
    why: {
      en: "You keep [2,3], [3,5], and [6,8], which is 3 intervals, and remove [1,4] and [7,9]. Removals = 5 − 3 = 2. This is the same example used in the timeline animation in section 06.",
      zh: "保留 [2,3]、[3,5]、[6,8] 共 3 个,删掉 [1,4]、[7,9] 共 2 个。删除数 = 5 − 3 = 2。这正是 §06 时间轴动画里用的例子。",
    },
  },
  {
    type: "choice",
    q: {
      en: "LC 122 adds up every rise between two consecutive days. Why is that optimal?",
      zh: "LC 122 买卖股票 II 的贪心「累加所有相邻上涨差价」,为什么正确?",
    },
    opts: {
      en: [
        "Any multi-day rise equals the sum of its day-to-day differences, so the sum of all positive differences is an upper bound that trading on every rising day reaches exactly",
        "Because the price goes up every day",
        "Because you may hold at most one share, and greedy happens to sidestep that rule",
        "Because greedy is faster than DP, so it must be right",
      ],
      zh: [
        "任何一段多日上涨都等于其中相邻差之和,所以「全部正差之和」是一个上界,而「每个上涨日都交易一次」恰好取到它",
        "因为股票每天都在涨",
        "因为规则限制只能持有一股,贪心恰好绕过了这个限制",
        "因为贪心比 DP 快,所以一定对",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Prices do fall. On a falling day the difference is negative, and max(0, Δ) skips it. The claim is about which gains are reachable, not about the direction of the market.",
        "The one-share rule is handled by the fact that you may sell and buy again on the same day. That explains why the schedule is legal, but it is not the reason the total is optimal.",
        "Speed and correctness are different questions. Greedy is correct here because of the upper-bound argument. On coins [1, 3, 4] the same kind of greedy is fast and wrong.",
      ],
      zh: [
        undefined,
        "股票当然会跌 —— 下跌那天差价是负的,max(0, Δ) 会跳过它。这里说的是「能赚到多少」的上界,不是行情方向。",
        "「只能持有一股」是靠「当天卖出后可以立刻再买」化解的。那解释了这个交易安排为什么合法,但不是收益最优的原因。",
        "快慢和对错是两码事。这里贪心正确是因为上界论证成立;换成硬币 [1, 3, 4],同类贪心又快又错。",
      ],
    },
    why: {
      en: "A trade from day i to day j earns p[j] − p[i], which is the sum of the day-to-day differences in that range, so it is at most the sum of the positive ones. Trades do not overlap, so every difference is used at most once. Buying and selling on each rising day reaches that bound, so nothing is left on the table. The state machine DP in chapter 10 gives the same number from another angle.",
      zh: "第 i 天买、第 j 天卖的收益 p[j] − p[i],等于这段区间内相邻差之和,因此不超过其中正差之和;而多次交易的区间互不重叠,每个差值最多用一次。「每个上涨日都交易一次」恰好取到这个上界,一分不少。第 10 章的状态机 DP 会从另一个角度给出同一个数。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Coins [1, 3, 4], amount 6. Greedy (always take the largest coin that fits) gives 4 + 1 + 1 = 3 coins; the best answer is 3 + 3 = 2 coins. What is the right conclusion?",
      zh: "硬币 [1, 3, 4] 凑金额 6:贪心(每次拿能用的最大面额)得 4 + 1 + 1 = 3 枚,最优是 3 + 3 = 2 枚。正确的结论是?",
    },
    opts: {
      en: [
        "This coin set does not have the greedy-choice property: taking the 4 first rules out the best answer, so you need DP, which tries every last coin and stores the results",
        "Greedy is a broken technique and should not be used",
        "Sorting the coins from large to small would fix it",
        "DP is used instead because DP guesses better than greedy",
      ],
      zh: [
        "这套面额不满足贪心选择性质:先拿 4 直接排除了最优解,所以要退回 DP —— 枚举最后一枚硬币的所有可能并把结果记下来",
        "贪心算法本身是错的,以后都不该用",
        "只要把硬币从大到小排序就能修好",
        "换成 DP 是因为 DP 比贪心更会碰运气",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Greedy is not broken; it was applied where its condition does not hold. In this same chapter, 860 and 435 are greedy and provably optimal. The difference is whether you can prove the greedy-choice property.",
        "Taking from large to small is exactly what greedy already does here, and it still returns 3 coins. The problem is not the order; it is that for this coin set, a locally best choice is not part of any best answer.",
        "DP does not guess. dp[a] = min over coins of dp[a − coin] + 1 enumerates every possible last coin, so nothing is missed. That is exhaustive search with stored results, not luck.",
      ],
      zh: [
        undefined,
        "贪心没错,是用错了地方 —— 同一章的 860、435 都是贪心,而且可以证明最优。区别只在于能不能证明贪心选择性质。",
        "从大到小拿正是这里的贪心做法,结果还是 3 枚。问题不在排序,而在于对这套面额,当下最优的选择不属于任何最优解。",
        "DP 不靠运气:dp[a] = min(dp[a − coin]) + 1 枚举了「最后一枚硬币是谁」的所有可能,数学上保证不漏。这叫穷举 + 记账,不叫运气。",
      ],
    },
    why: {
      en: "The rule this chapter leaves you with: prove the exchange argument and you may be greedy; fail to prove it and use DP. On coins [1, 3, 4] the greedy-choice property does not hold, so the problem goes to DP. Note that the same greedy is optimal for other coin sets, such as 1, 5, 10, 25. Worked example D in chapter 07 (LC 322) uses exactly this example.",
      zh: "本章留给你的判据:能证明交换论证就贪,证不出就用 DP。硬币 [1, 3, 4] 上贪心选择性质不成立,于是交给 DP。注意同一种贪心在别的面额上是最优的,比如 1、5、10、25。第 7 章的精讲 D(LC 322)用的正是这个例子。",
    },
  },
];
