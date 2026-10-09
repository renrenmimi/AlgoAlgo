// Chapter 8 - Knapsack Problems: quiz data.
// Kept apart from the problem set so that the atlas, which lists every chapter's problems,
// does not load the quizzes too.

import type { QuizItem } from "@/lib/quiz";

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "In the one-dimensional form of the 0/1 knapsack, why must the capacity loop run downward?",
      zh: "0-1 背包压成一维数组后,遍历容量为什么必须【倒序】?",
    },
    opts: {
      en: [
        "Going down, dp[j-w] still holds the value from before this item was processed, so the item can enter the bag at most once",
        "Going down is only faster; going up also gives the correct answer",
        "Going down computes the large capacities first, which keeps the index in range",
        "Because the array has to be initialized from right to left",
      ],
      zh: [
        "倒序时 dp[j−w] 读到的还是「处理本物品之前」的值,所以这件物品最多只会进包一次",
        "倒序只是更快;正序也能得到正确答案",
        "倒序先算大容量,数组下标不会越界",
        "因为数组必须从右往左初始化",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Going up gives a wrong answer, and speed is not the point. Going up, dp[j-w] may already have been updated in this pass, so it already contains one copy of this item. Adding the item again puts the same item in the bag twice.",
        "The index stays in range in both directions, because both loops only visit j in [w, W]. The reason for going down is which value dp[j-w] holds when it is read.",
        "Initialization has nothing to do with the direction. The direction decides whether dp[j-w] is read before or after this pass updates it.",
      ],
      zh: [
        undefined,
        "正序会算错,这不是效率问题:正序时 dp[j−w] 可能已经在本轮被更新过,里面已含一件本物品,再加一次就等于同一件物品放了两次。",
        "两个方向都只访问 [w, W] 内的 j,都不会越界。倒序的理由是「读到 dp[j−w] 时它是哪个值」。",
        "初始化和遍历方向无关。方向决定的是 dp[j−w] 在本轮更新之前还是之后被读到。",
      ],
    },
    why: {
      en: "The one-dimensional array is the two-dimensional dp[i][*] rolled into one row. The 0/1 transition reads dp[i-1][j-w], the previous item's row. Going down, dp[j-w] has not been touched yet in this pass, so it is still that previous row. The comparison animation in §03 shows how going up counts the same item twice.",
      zh: "一维数组是二维 dp[i][*] 滚动成一行的结果。0-1 背包的转移读 dp[i−1][j−w],也就是上一件物品那一行。倒序时 dp[j−w] 在本轮还没被碰过,所以它仍是上一行的值。§03 的对比动画演示了正序如何把同一件物品算两次。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Run the one-dimensional 0/1 loop upward instead, with a single item of weight 2 and value 3, capacities 0 to 5. What does dp[4] become, and what does that show?",
      zh: "把 0-1 背包的一维遍历改成【正序】,只放一件重 2、值 3 的物品,容量 0~5。dp[4] 会算成多少,说明什么?",
    },
    opts: {
      en: [
        "6 — dp[4] reads dp[2] = 3, which this pass just wrote, so the same item is added a second time",
        "3 — going up and going down give the same result",
        "0 — going up misses the item",
        "9 — going up counts the item three times",
      ],
      zh: [
        "6 —— dp[4] 读到本轮刚写入的 dp[2] = 3,于是同一件物品被又加了一次",
        "3 —— 正序和倒序结果一样",
        "0 —— 正序会漏掉这件物品",
        "9 —— 正序会把物品算三次",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "They differ here. Going up, dp[2] has already been changed to 3 by this pass, so dp[4] = max(0, 3 + 3) = 6, while the correct answer is 3.",
        "Going up does not lose the item; it counts it more than once. dp[4] becomes 6, not 0.",
        "One item and one pass can only be double-counted once here. dp[4] = 6 already shows the bug.",
      ],
      zh: [
        undefined,
        "这里两者不同:正序时 dp[2] 已被本轮改成 3,于是 dp[4] = max(0, 3+3) = 6,而正确答案是 3。",
        "正序不会漏掉物品,而是重复计入:dp[4] 变成 6,不是 0。",
        "只有一件物品、只扫一遍,这里最多重复一次;dp[4] = 6 已经暴露了问题。",
      ],
    },
    why: {
      en: "dp[2] is set to 3 in this pass, meaning one copy of the item is inside. Going up, dp[4] then reads that 3 and adds 3 again, giving 6 — the one item was placed in the bag twice. That is why the 0/1 form cannot go up, and it is also why going up is exactly what the unbounded knapsack wants.",
      zh: "dp[2] 在本轮被写成 3(里面已装了一件)。正序算到 dp[4] 时读到这个 3,再 +3 得 6 —— 这唯一的一件物品被装进背包两次。这就是 0-1 背包不能正序的原因,也正好是完全背包想要的效果。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In the one-dimensional unbounded knapsack (every item has unlimited supply), the capacity loop runs upward. Why?",
      zh: "完全背包(每件物品无限个)压成一维后,遍历容量要【正序】。原因是?",
    },
    opts: {
      en: [
        "Going up, dp[j-w] may already contain this item, so adding it again reuses the same item — which is what unlimited supply means",
        "The unbounded knapsack should go down, just like the 0/1 knapsack",
        "Going up is faster and does not change the result",
        "Going up prevents an item from being used more than once",
      ],
      zh: [
        "正序时 dp[j−w] 里可能已含本物品,再加一次就是重复使用同一件 —— 这正是「无限供应」的含义",
        "完全背包和 0-1 背包一样,都该倒序",
        "正序更快,和结果无关",
        "正序可以避免同一件物品被用多次",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The directions are opposite: 0/1 needs each item at most once, so it goes down; unbounded allows reuse, so it goes up. The wrong direction turns one problem into the other.",
        "In the unbounded knapsack, going up is about correctness, not speed: it is what allows reuse.",
        "It is the other way round. Going up is what allows reuse; going down is what limits an item to one use.",
      ],
      zh: [
        undefined,
        "方向恰好相反:0-1 要「每件最多一次」所以倒序,完全背包允许重复所以正序。方向写错,就把一道题做成了另一道。",
        "在完全背包里,正序是为了正确性(允许重复取),不是为了速度。",
        "说反了:正序才是「允许重复使用」,倒序才是「每件只用一次」。",
      ],
    },
    why: {
      en: "Both forms share the same line dp[j] = f(dp[j], dp[j-w]). The direction decides which row dp[j-w] comes from: going down it is the previous item's row, so the item is used at most once; going up it is the current item's own row, so the item can be reused. The direction is not a rule to memorize. It follows from which value you need to read.",
      zh: "两种形态共用同一行 dp[j] = f(dp[j], dp[j−w])。方向决定 dp[j−w] 来自哪一行:倒序来自上一件物品那一行,于是每件最多用一次;正序来自本件物品自己这一行,于是可以重复取。方向不是要背的口诀,它由「你需要读到哪个值」推出来。",
    },
  },
  {
    type: "choice",
    q: {
      en: 'For "how many ways add up to n", LC 518 counts combinations (1+2 and 2+1 are one way) and LC 377 counts permutations (they are two). The code is almost identical. Where is the difference?',
      zh: "求「凑出金额 n 的方案数」时,LC 518 数组合(1+2 与 2+1 算一种)、LC 377 数排列(算两种),代码几乎一样。差别在哪?",
    },
    opts: {
      en: [
        "518 loops over items outside and capacity inside; 377 loops over capacity outside and items inside",
        "518 adds, 377 multiplies",
        "518 goes up, 377 goes down",
        "There is no real difference; the two answers are always equal",
      ],
      zh: [
        "518 外层遍历物品、内层遍历容量;377 外层遍历容量、内层遍历物品",
        "518 用加法,377 用乘法",
        "518 正序,377 倒序",
        "两者没有本质区别,答案总是相等",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "Both use the same addition, dp[j] += dp[j-num]. Only the nesting of the two loops differs.",
        "Both are unbounded knapsacks and both run the capacity upward. Going down would limit each item to one use, which is a different problem.",
        "The difference is real: the number of combinations is at most the number of permutations, and usually smaller. Coins [1,2] and amount 3: one combination (1+2), two permutations (1+2, 2+1).",
      ],
      zh: [
        undefined,
        "两者都是同一个加法 dp[j] += dp[j−num]。区别只在两层循环的嵌套顺序。",
        "两者都是完全背包,容量都正序。倒序会把每件物品限制成只用一次,那是另一道题。",
        "区别确实存在:组合数不会超过排列数,通常还更小。硬币 [1,2] 凑 3:组合 1 种(1+2),排列 2 种(1+2、2+1)。",
      ],
    },
    why: {
      en: "Items outside: each item is introduced once and always after the earlier items, so one set of items is only counted in one order — combinations (518). Capacity outside: at each capacity every item gets a turn as the last one added, so different orders are counted separately — permutations (377). LC 139 Word Break also cares about order, so it puts capacity outside too. Worked example C compares the two.",
      zh: "物品在外:每件物品只在自己那一轮登场,且永远排在前面的物品之后,同一组物品只会以一种顺序被数到 —— 组合数(518)。容量在外:每个容量都让所有物品轮流当「最后一个」,不同顺序被分别计入 —— 排列数(377)。LC 139 单词拆分同样关心顺序,所以也把容量放在外层。本章精讲 C 对照演示。",
    },
  },
  {
    type: "choice",
    q: {
      en: "LC 416 asks whether an array can be split into two subsets with equal sums. What is the correct reduction to a knapsack?",
      zh: "LC 416 分割等和子集,把数组分成两个和相等的子集。转化成背包的正确做法是?",
    },
    opts: {
      en: [
        "Check the total first: if sum is odd, return false; otherwise ask whether some of the numbers add up to exactly sum/2",
        "Check whether the maximum subarray sum equals sum/2",
        "Sort the array, then move two pointers inward until they reach sum/2",
        "Find the smallest number of elements to delete so that the rest sums to an even number",
      ],
      zh: [
        "先看总和:sum 为奇数直接返回 false;否则问「能否用若干个数正好凑出 sum/2」",
        "求数组的最大子数组和是否等于 sum/2",
        "先排序,再用双指针从两端向 sum/2 逼近",
        "求最少删几个数,能让剩下的和为偶数",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "The maximum subarray sum (Kadane) needs the elements to be next to each other. A subset can pick any elements, so that is the wrong model.",
        "Two pointers work on a sorted array for two-sum style questions. Here every element is chosen or not chosen, which is a 0/1 knapsack.",
        "The question is whether an equal split exists, not how many elements to delete.",
      ],
      zh: [
        undefined,
        "最大子数组和(Kadane)要求元素连续,而子集可以任意挑 —— 模型不对。",
        "双指针适用于有序数组上的「两数之和」类问题。这里每个元素都是选或不选,是 0-1 背包。",
        "题目问的是能否等分,不是删几个数。",
      ],
    },
    why: {
      en: "If the two subsets have equal sums, each one sums to sum/2, so an odd total makes a split impossible. Otherwise it is a 0/1 knapsack with capacity sum/2 and the question \"can it be filled exactly\": dp[j] = dp[j] or dp[j-num], with capacity descending. This is a reduction to a problem you already solved, not a new algorithm.",
      zh: "两个子集和相等 ⇒ 每个子集的和都是 sum/2,所以总和为奇数时不可能等分。否则就是容量 sum/2 的「能否正好装满」型 0-1 背包:dp[j] = dp[j] 或 dp[j−num],容量倒序。这是把问题归约到已经解决的模型,不是一个新算法。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          LC 494 Target Sum, nums = [1,1,1,1,1] and target = 3. Using P = (sum +
          target) / 2, the problem becomes &quot;how many subsets add up to
          P?&quot; How many are there?
        </>
      ),
      zh: (
        <>
          LC 494 目标和,nums = [1,1,1,1,1]、target = 3。用 P = (sum + target) / 2
          转成「和为 P 的子集有几个」,答案是多少?
        </>
      ),
    },
    placeholder: { en: "Enter a whole number…", zh: "输入一个整数…" },
    answers: ["5", "5种", "5ways"],
    hint: {
      en: "sum = 5, so P = (5 + 3) / 2 = 4. Picking a subset of five 1s that adds up to 4 means picking four of them: C(5,4).",
      zh: "sum = 5,所以 P = (5 + 3) / 2 = 4。从 5 个 1 里挑出和为 4 的子集,就是挑 4 个 1,即 C(5,4)。",
    },
    why: {
      en: "P = 4, so you pick four of the five 1s: C(5,4) = 5. Filling dp[j] += dp[j-num] one number at a time produces exactly one row of Pascal's triangle. Worked example B animates it.",
      zh: "P = 4,即从 5 个 1 里挑 4 个:C(5,4) = 5。逐个数字执行 dp[j] += dp[j−num],得到的正是杨辉三角的一行。本章精讲 B 有逐帧动画。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which of these are signals to model a problem as an unbounded knapsack (every item has unlimited supply)? (Select all that apply)",
      zh: "下面哪些是「该往【完全背包】(每件物品无限个)方向想」的信号?(多选)",
    },
    opts: {
      en: [
        "The statement says a coin or a denomination may be used any number of times",
        "You are making up a target amount and the same denomination may be taken again (LC 322 / LC 518)",
        'The number of items is fixed and each is taken at most once (for example "each number may be used only once")',
        "Treating 1, 4, 9, 16 ... as denominations with unlimited supply to reach a number (LC 279)",
      ],
      zh: [
        "题面写着某种硬币 / 面额可以使用无限次",
        "凑一个目标金额,且同一面额可以反复取(LC 322 / LC 518)",
        "物品总数固定、每件最多取一次(例如「每个数只能用一次」)",
        "把 1、4、9、16… 当作可无限取的面额去凑出一个数(LC 279)",
      ],
    },
    correct: [0, 1, 3],
    missHint: {
      en: "Unlimited reuse is the signal. Look again for the options that stress taking the same item again.",
      zh: "「可以无限次重复取」才是信号 —— 再找找哪些选项在强调「可以再取同一件」。",
    },
    extraHint: {
      en: "One option describes a 0/1 knapsack, where each item is used at most once. Leave it out.",
      zh: "有一个选项描述的是 0-1 背包(每件最多用一次),不要选它。",
    },
    why: {
      en: 'The test for an unbounded knapsack is one sentence: the same item may be taken any number of times, so the capacity loop runs upward. LC 322, 518, and 279 all pass it. "Each number may be used only once" and "the item count is fixed" describe a 0/1 knapsack, where the capacity loop runs downward.',
      zh: "完全背包的判据只有一句:同一件物品可以取任意多次,所以容量正序。LC 322、518、279 都符合。「每个数只能用一次」「物品总数固定」说的是 0-1 背包,容量倒序。",
    },
  },
  {
    type: "choice",
    q: {
      en: "For the two-dimensional 0/1 knapsack, where dp[i][j] is the largest value using the first i items with capacity at most j, which transition is correct?",
      zh: "0-1 背包的二维 dp[i][j](只用前 i 件物品、容量不超过 j 时的最大价值),下面哪个转移是对的?",
    },
    opts: {
      en: [
        "dp[i][j] = max(dp[i-1][j], dp[i-1][j-w[i]] + v[i]) — skip item i, or take it; when j < w[i], only skipping is possible",
        "dp[i][j] = max(dp[i-1][j], dp[i][j-w[i]] + v[i])",
        "dp[i][j] = dp[i-1][j] + dp[i-1][j-w[i]]",
        "dp[i][j] = max(dp[i-1][j], dp[i-1][j] + v[i])",
      ],
      zh: [
        "dp[i][j] = max(dp[i−1][j], dp[i−1][j−w[i]] + v[i]) —— 不装 i 或装 i;j < w[i] 时只能不装",
        "dp[i][j] = max(dp[i−1][j], dp[i][j−w[i]] + v[i])",
        "dp[i][j] = dp[i−1][j] + dp[i−1][j−w[i]]",
        "dp[i][j] = max(dp[i−1][j], dp[i−1][j] + v[i])",
      ],
    },
    correct: 0,
    wrong: {
      en: [
        undefined,
        "\"Take item i\" must read dp[i-1][j-w[i]], the row where item i has not been considered yet. Reading dp[i][j-w[i]] allows item i to be taken again, which is the unbounded knapsack.",
        "Addition is the operator for counting. Here you want the largest value, so take the max of taking and skipping.",
        "Taking item i must first free w[i] of capacity, so it reads dp[i-1][j-w[i]]. Writing dp[i-1][j] + v[i] adds the value without paying the weight.",
      ],
      zh: [
        undefined,
        "「装 i」这一项必须读 dp[i−1][j−w[i]],也就是还没考虑过第 i 件的那一行。读 dp[i][j−w[i]] 会允许第 i 件被再取一次,那是完全背包。",
        "相加是计数型的算子。这里求最大价值,应该在「装」和「不装」之间取 max。",
        "装第 i 件必须先腾出 w[i] 的容量,所以读 dp[i−1][j−w[i]]。写成 dp[i−1][j] + v[i] 等于加了价值却没占容量。",
      ],
    },
    why: {
      en: "The whole 0/1 knapsack is one question per item: take it or skip it. Skip it and you inherit dp[i-1][j]. Take it and you free w[i] first, then add v[i], which is dp[i-1][j-w[i]] + v[i]. This is the same take-or-skip model as House Robber in chapter 7, and reading the previous row is exactly why the rolled one-dimensional form has to run the capacity downward.",
      zh: "0-1 背包的全部内容就是对每件物品问一句:装还是不装。不装 = 继承 dp[i−1][j];装 = 先腾出 w[i] 再加 v[i],即 dp[i−1][j−w[i]] + v[i]。这与第 7 章打家劫舍的「选 / 不选」是同一个模型;而「读上一行」正是压成一维后必须倒序遍历容量的原因。",
    },
  },
];
