"use client";

// 第 10 章 · DP 进阶 —— DP 四章收官。四大高级 DP 类型各成一节:
// §02 状态机 DP(股票族谱,精讲 309)→ §03 树形 DP(精讲 337)→
// §04 区间 DP(精讲 312)→ §05 状压 DP(526 入门)→ §06 数位/概率 一句话地图。
// 招牌可视化:自建 SVG 状态转移图(StockFSM)、TreePlayer(RobTreeDP)、
// DPTable 斜着填(BalloonInterval)、交互式 bit 集合(MaskLab)—— 均在 ./viz。
//
// 双语:正文用 <T en zh />;组件的文案型 props 传 { en, zh }。
// CodeTabs 的 code 也给两份 —— 两份之间只有注释不同,可执行代码逐行一致(hl 行号才对得上)。

import "./chapter.css";
import { Hero, Section, Callout, BigO, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { T } from "@/lib/i18n";
import { PROBLEMS, QUIZ } from "@/lib/dp-pro-data";
import { StockFSM, RobTreeDP, BalloonInterval, MaskLab } from "./viz";

const CHIPS = [
  { id: "why", n: "01", label: { en: "Four shapes", zh: "四张高级地图" } },
  { id: "fsm", n: "02", label: { en: "State machine · stocks", zh: "状态机 · 股票族谱" } },
  { id: "tree", n: "03", label: { en: "Tree DP", zh: "树形 DP" } },
  { id: "interval", n: "04", label: { en: "Interval DP · LC 312", zh: "区间 DP · 戳气球" } },
  { id: "bitmask", n: "05", label: { en: "Bitmask DP", zh: "状压 DP" } },
  { id: "map", n: "06", label: { en: "Digit & probability DP", zh: "数位/概率地图" } },
  { id: "problems", n: "07", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "08", label: { en: "Quiz", zh: "通关测验" } },
];

/* ================= 精讲代码(两份只差注释,可执行行逐行一致) ================= */

const STOCK_122 = {
  java: {
    code: {
      en: `class Solution {
    public int maxProfit(int[] prices) {
        int hold = -prices[0];   // hold: you own one share
        int cash = 0;            // cash: you own nothing
        for (int p : prices) {
            hold = Math.max(hold, cash - p); // keep holding / buy today
            cash = Math.max(cash, hold + p); // stay in cash / sell today
        }
        return cash;             // you should not still own a share
    }
}`,
      zh: `class Solution {
    public int maxProfit(int[] prices) {
        int hold = -prices[0];   // hold:手上有一股
        int cash = 0;            // cash:手上没有股票
        for (int p : prices) {
            hold = Math.max(hold, cash - p); // 继续持有 / 今天买入
            cash = Math.max(cash, hold + p); // 继续空仓 / 今天卖出
        }
        return cash;             // 结束时不该还持有
    }
}`,
    },
    hl: [6, 7],
    note: {
      en: (
        <>
          Each state is one variable, so the space is <b>O(1)</b>. Keep this shape
          in mind: LC 309 below only adds one more state on top of it.
        </>
      ),
      zh: (
        <>
          每个状态就是一个变量,空间 <b>O(1)</b>。记住这个形状 ——
          下面的 LC 309 只是在它上面再加一个状态。
        </>
      ),
    },
  },
  python: {
    code: {
      en: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        hold, cash = -prices[0], 0
        for p in prices:
            hold = max(hold, cash - p)   # keep / buy
            cash = max(cash, hold + p)   # keep / sell
        return cash`,
      zh: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        hold, cash = -prices[0], 0
        for p in prices:
            hold = max(hold, cash - p)   # 保持 / 买入
            cash = max(cash, hold + p)   # 保持 / 卖出
        return cash`,
    },
    hl: [5, 6],
    note: {
      en: (
        <>
          The greedy version is shorter:{" "}
          <code>sum(max(0, b - a) for a, b in zip(prices, prices[1:]))</code>. The
          state machine version extends to LC 714 and LC 309 without changing
          shape. The one-liner does not.
        </>
      ),
      zh: (
        <>
          贪心版更短:
          <code>sum(max(0, b - a) for a, b in zip(prices, prices[1:]))</code>。
          状态机版能原样升级到 LC 714 和 LC 309,这个一行版不能。
        </>
      ),
    },
  },
  js: {
    code: {
      en: `var maxProfit = function (prices) {
  let hold = -prices[0], cash = 0;
  for (const p of prices) {
    hold = Math.max(hold, cash - p); // keep / buy
    cash = Math.max(cash, hold + p); // keep / sell
  }
  return cash;
};`,
      zh: `var maxProfit = function (prices) {
  let hold = -prices[0], cash = 0;
  for (const p of prices) {
    hold = Math.max(hold, cash - p); // 保持 / 买入
    cash = Math.max(cash, hold + p); // 保持 / 卖出
  }
  return cash;
};`,
    },
    hl: [4, 5],
    note: {
      en: (
        <>
          Inside one iteration <code>hold</code> is updated before{" "}
          <code>cash</code>, so <code>cash</code> reads today&apos;s{" "}
          <code>hold</code>. With unlimited trades that is the same as buying and
          selling on the same day, which changes nothing, so the answer stays
          correct.
        </>
      ),
      zh: (
        <>
          同一轮里先更新 <code>hold</code> 再更新 <code>cash</code>,
          所以 <code>cash</code> 读到的是今天的 <code>hold</code>。
          在不限次数的情况下,这等于「当天买当天卖」,不产生任何收益,答案照旧正确。
        </>
      ),
    },
  },
};

const STOCK_309 = {
  java: {
    code: {
      en: `class Solution {
    public int maxProfit(int[] prices) {
        int hold = -prices[0]; // you own a share
        int sold = 0;          // you sold today, so tomorrow is blocked
        int rest = 0;          // no share, not blocked, so you may buy
        for (int i = 1; i < prices.length; i++) {
            int p = prices[i];
            int nHold = Math.max(hold, rest - p); // keep / buy out of rest
            int nSold = hold + p;                 // sell today
            int nRest = Math.max(rest, sold);     // keep / cooldown ends
            hold = nHold; sold = nSold; rest = nRest;
        }
        return Math.max(sold, rest);              // do not end still holding
    }
}`,
      zh: `class Solution {
    public int maxProfit(int[] prices) {
        int hold = -prices[0]; // 手上有一股
        int sold = 0;          // 今天卖出了,明天被封
        int rest = 0;          // 没股、不在冷冻,可以买
        for (int i = 1; i < prices.length; i++) {
            int p = prices[i];
            int nHold = Math.max(hold, rest - p); // 保持 / 从 rest 买入
            int nSold = hold + p;                 // 今天卖出
            int nRest = Math.max(rest, sold);     // 保持 / 冷冻期结束
            hold = nHold; sold = nSold; rest = nRest;
        }
        return Math.max(sold, rest);              // 结束时不该还持有
    }
}`,
    },
    hl: [8, 9, 10],
    note: {
      en: (
        <>
          The three <code>n*</code> temporaries are required. If you assigned to
          hold, sold, and rest directly, the later transitions would read{" "}
          <b>today&apos;s</b> new values instead of yesterday&apos;s and the answer
          would be wrong. This is the general condition for shrinking a DP down to
          a few variables: it is only valid while every transition reads values
          from the previous step.
        </>
      ),
      zh: (
        <>
          三个 <code>n*</code> 临时变量是必需的。若直接给 hold、sold、rest 赋值,
          后面的转移读到的就是<b>今天</b>的新值而不是昨天的值,答案会错。
          这也是「把 DP 压成几个变量」的通用前提:
          只有当每条转移都只读上一步的值时才成立。
        </>
      ),
    },
  },
  python: {
    code: {
      en: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        hold, sold, rest = -prices[0], 0, 0
        for p in prices[1:]:
            hold, sold, rest = (
                max(hold, rest - p),  # keep / buy out of rest
                hold + p,             # sell today
                max(rest, sold),      # keep / cooldown ends
            )
        return max(sold, rest)`,
      zh: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        hold, sold, rest = -prices[0], 0, 0
        for p in prices[1:]:
            hold, sold, rest = (
                max(hold, rest - p),  # 保持 / 从 rest 买入
                hold + p,             # 今天卖出
                max(rest, sold),      # 保持 / 冷冻期结束
            )
        return max(sold, rest)`,
    },
    hl: [6, 7, 8],
    note: {
      en: (
        <>
          Tuple assignment evaluates all three expressions on the right{" "}
          <b>first</b>, using yesterday&apos;s values, and then assigns them
          together. No temporary variables are needed.
        </>
      ),
      zh: (
        <>
          元组赋值会<b>先</b>把右边三个表达式全部求值(用的都是昨天的值),
          再一起赋回去 —— 不需要临时变量。
        </>
      ),
    },
  },
  js: {
    code: {
      en: `var maxProfit = function (prices) {
  let hold = -prices[0], sold = 0, rest = 0;
  for (let i = 1; i < prices.length; i++) {
    const p = prices[i];
    [hold, sold, rest] = [
      Math.max(hold, rest - p), // keep / buy out of rest
      hold + p,                 // sell today
      Math.max(rest, sold),     // keep / cooldown ends
    ];
  }
  return Math.max(sold, rest);
};`,
      zh: `var maxProfit = function (prices) {
  let hold = -prices[0], sold = 0, rest = 0;
  for (let i = 1; i < prices.length; i++) {
    const p = prices[i];
    [hold, sold, rest] = [
      Math.max(hold, rest - p), // 保持 / 从 rest 买入
      hold + p,                 // 今天卖出
      Math.max(rest, sold),     // 保持 / 冷冻期结束
    ];
  }
  return Math.max(sold, rest);
};`,
    },
    hl: [6, 7, 8],
    note: {
      en: (
        <>
          Array destructuring behaves like the Python tuple: the whole right-hand
          side is built first, then assigned. All three transitions safely read
          yesterday&apos;s values. Space O(1).
        </>
      ),
      zh: (
        <>
          数组解构和 Python 元组一样:先把整个右侧构造出来,再一起赋值。
          三条转移都安全地读到昨天的值。空间 O(1)。
        </>
      ),
    },
  },
};

const ROB_337 = {
  java: {
    code: {
      en: `class Solution {
    public int rob(TreeNode root) {
        int[] r = dfs(root);
        return Math.max(r[0], r[1]); // max(take root, skip root)
    }

    // returns [best when node is taken, best when node is skipped]
    private int[] dfs(TreeNode node) {
        if (node == null) return new int[]{0, 0};
        int[] l = dfs(node.left);
        int[] r = dfs(node.right);
        int rob = node.val + l[1] + r[1];                       // take: skip both children
        int skip = Math.max(l[0], l[1]) + Math.max(r[0], r[1]); // skip: children choose freely
        return new int[]{rob, skip};
    }
}`,
      zh: `class Solution {
    public int rob(TreeNode root) {
        int[] r = dfs(root);
        return Math.max(r[0], r[1]); // max(偷根, 不偷根)
    }

    // 返回 [偷当前节点的最大值, 不偷当前节点的最大值]
    private int[] dfs(TreeNode node) {
        if (node == null) return new int[]{0, 0};
        int[] l = dfs(node.left);
        int[] r = dfs(node.right);
        int rob = node.val + l[1] + r[1];                       // 偷:两个孩子都不能偷
        int skip = Math.max(l[0], l[1]) + Math.max(r[0], r[1]); // 不偷:孩子各自随意
        return new int[]{rob, skip};
    }
}`,
    },
    hl: [12, 13],
    note: {
      en: (
        <>
          Post-order: both children are resolved into [rob, skip] before the node
          itself is computed. That is what &quot;bottom-up&quot; means here. An
          empty child returns <code>[0, 0]</code>, which is the base case, so
          leaves need no special handling.
        </>
      ),
      zh: (
        <>
          后序:先把两个孩子解成 [rob, skip],再算当前节点 ——
          这就是「自底向上」。空孩子返回 <code>[0, 0]</code>,这就是基例,
          叶子不用特判。
        </>
      ),
    },
  },
  python: {
    code: {
      en: `class Solution:
    def rob(self, root: TreeNode) -> int:
        def dfs(node):
            if not node:
                return (0, 0)                 # (take, skip)
            lr, ls = dfs(node.left)
            rr, rs = dfs(node.right)
            rob = node.val + ls + rs          # take: skip both children
            skip = max(lr, ls) + max(rr, rs)  # skip: children choose freely
            return (rob, skip)
        return max(dfs(root))`,
      zh: `class Solution:
    def rob(self, root: TreeNode) -> int:
        def dfs(node):
            if not node:
                return (0, 0)                 # (偷, 不偷)
            lr, ls = dfs(node.left)
            rr, rs = dfs(node.right)
            rob = node.val + ls + rs          # 偷:两个孩子都不能偷
            skip = max(lr, ls) + max(rr, rs)  # 不偷:孩子各自随意
            return (rob, skip)
        return max(dfs(root))`,
    },
    hl: [8, 9],
    note: {
      en: (
        <>
          A tuple <code>(take, skip)</code> is the natural way to report two
          values. <code>max(dfs(root))</code> then takes the larger of the two
          elements in one call.
        </>
      ),
      zh: (
        <>
          用元组 <code>(偷, 不偷)</code> 汇报两个值最自然;
          最后 <code>max(dfs(root))</code> 一步取出二者中较大的那个。
        </>
      ),
    },
  },
  js: {
    code: {
      en: `var rob = function (root) {
  const dfs = (node) => {
    if (!node) return [0, 0];        // [take, skip]
    const [lr, ls] = dfs(node.left);
    const [rr, rs] = dfs(node.right);
    const robIt = node.val + ls + rs;                 // take: skip both children
    const skip = Math.max(lr, ls) + Math.max(rr, rs); // skip: children choose freely
    return [robIt, skip];
  };
  const [a, b] = dfs(root);
  return Math.max(a, b);
};`,
      zh: `var rob = function (root) {
  const dfs = (node) => {
    if (!node) return [0, 0];        // [偷, 不偷]
    const [lr, ls] = dfs(node.left);
    const [rr, rs] = dfs(node.right);
    const robIt = node.val + ls + rs;                 // 偷:两个孩子都不能偷
    const skip = Math.max(lr, ls) + Math.max(rr, rs); // 不偷:孩子各自随意
    return [robIt, skip];
  };
  const [a, b] = dfs(root);
  return Math.max(a, b);
};`,
    },
    hl: [6, 7],
    note: {
      en: (
        <>
          The variable is named <code>robIt</code> to avoid shadowing the outer{" "}
          <code>rob</code>. A two-element array carries the two states and is
          destructured on arrival, the same idea as Java&apos;s{" "}
          <code>int[]</code>.
        </>
      ),
      zh: (
        <>
          变量取名 <code>robIt</code>,避免遮蔽外面的 <code>rob</code>。
          用一个长度 2 的数组携带两个状态,接收时解构 ——
          和 Java 的 <code>int[]</code> 是同一个思路。
        </>
      ),
    },
  },
};

const BALLOON_312 = {
  java: {
    code: {
      en: `class Solution {
    public int maxCoins(int[] nums) {
        int n = nums.length;
        int[] arr = new int[n + 2];
        arr[0] = arr[n + 1] = 1;                   // pad both ends with 1
        for (int i = 0; i < n; i++) arr[i + 1] = nums[i];

        int[][] dp = new int[n + 2][n + 2];
        for (int len = 2; len <= n + 1; len++)     // interval length, smallest first
            for (int i = 0; i + len <= n + 1; i++) {
                int j = i + len;                   // open interval (i, j)
                for (int k = i + 1; k < j; k++)    // k is burst last
                    dp[i][j] = Math.max(dp[i][j],
                        dp[i][k] + arr[i] * arr[k] * arr[j] + dp[k][j]);
            }
        return dp[0][n + 1];
    }
}`,
      zh: `class Solution {
    public int maxCoins(int[] nums) {
        int n = nums.length;
        int[] arr = new int[n + 2];
        arr[0] = arr[n + 1] = 1;                   // 两端补上值为 1 的气球
        for (int i = 0; i < n; i++) arr[i + 1] = nums[i];

        int[][] dp = new int[n + 2][n + 2];
        for (int len = 2; len <= n + 1; len++)     // 区间长度,从小到大
            for (int i = 0; i + len <= n + 1; i++) {
                int j = i + len;                   // 开区间 (i, j)
                for (int k = i + 1; k < j; k++)    // k 是最后被戳破的
                    dp[i][j] = Math.max(dp[i][j],
                        dp[i][k] + arr[i] * arr[k] * arr[j] + dp[k][j]);
            }
        return dp[0][n + 1];
    }
}`,
    },
    hl: [9, 12, 13, 14],
    note: {
      en: (
        <>
          Three loops: interval length on the outside, which guarantees the shorter
          intervals are already done; then the left endpoint; then the choice of
          the balloon burst last. Time O(n³), which passes at n ≤ 500.
        </>
      ),
      zh: (
        <>
          三层循环:最外层是区间长度,它保证更短的区间已经算完;
          中层是左端点;内层枚举「最后戳的气球」。时间 O(n³),n ≤ 500 能过。
        </>
      ),
    },
  },
  python: {
    code: {
      en: `class Solution:
    def maxCoins(self, nums: list[int]) -> int:
        arr = [1] + nums + [1]              # pad both ends with 1
        n = len(arr)
        dp = [[0] * n for _ in range(n)]
        for length in range(2, n):          # interval length, smallest first
            for i in range(n - length):
                j = i + length              # open interval (i, j)
                for k in range(i + 1, j):   # k is burst last
                    dp[i][j] = max(dp[i][j],
                        dp[i][k] + arr[i] * arr[k] * arr[j] + dp[k][j])
        return dp[0][n - 1]`,
      zh: `class Solution:
    def maxCoins(self, nums: list[int]) -> int:
        arr = [1] + nums + [1]              # 两端补上值为 1 的气球
        n = len(arr)
        dp = [[0] * n for _ in range(n)]
        for length in range(2, n):          # 区间长度,从小到大
            for i in range(n - length):
                j = i + length              # 开区间 (i, j)
                for k in range(i + 1, j):   # k 是最后被戳破的
                    dp[i][j] = max(dp[i][j],
                        dp[i][k] + arr[i] * arr[k] * arr[j] + dp[k][j])
        return dp[0][n - 1]`,
    },
    hl: [6, 9, 10, 11],
    note: {
      en: (
        <>
          <code>arr = [1] + nums + [1]</code> adds both padded balloons in one
          line. The length starts at 2 because an interval shorter than that holds
          no balloon and its dp value stays 0.
        </>
      ),
      zh: (
        <>
          <code>arr = [1] + nums + [1]</code> 一行补好两端。
          长度从 2 起,因为更短的区间里没有气球,它们的 dp 保持 0。
        </>
      ),
    },
  },
  js: {
    code: {
      en: `var maxCoins = function (nums) {
  const arr = [1, ...nums, 1];          // pad both ends with 1
  const n = arr.length;
  const dp = Array.from({ length: n }, () => Array(n).fill(0));
  for (let len = 2; len < n; len++) {   // interval length, smallest first
    for (let i = 0; i + len < n; i++) {
      const j = i + len;                // open interval (i, j)
      for (let k = i + 1; k < j; k++) { // k is burst last
        dp[i][j] = Math.max(dp[i][j],
          dp[i][k] + arr[i] * arr[k] * arr[j] + dp[k][j]);
      }
    }
  }
  return dp[0][n - 1];
};`,
      zh: `var maxCoins = function (nums) {
  const arr = [1, ...nums, 1];          // 两端补上值为 1 的气球
  const n = arr.length;
  const dp = Array.from({ length: n }, () => Array(n).fill(0));
  for (let len = 2; len < n; len++) {   // 区间长度,从小到大
    for (let i = 0; i + len < n; i++) {
      const j = i + len;                // 开区间 (i, j)
      for (let k = i + 1; k < j; k++) { // k 是最后被戳破的
        dp[i][j] = Math.max(dp[i][j],
          dp[i][k] + arr[i] * arr[k] * arr[j] + dp[k][j]);
      }
    }
  }
  return dp[0][n - 1];
};`,
    },
    hl: [5, 8, 9, 10],
    note: {
      en: (
        <>
          Do not build the 2-D array with <code>Array(n).fill(Array(n))</code>:
          every row would be the same array object. The factory function passed to{" "}
          <code>Array.from</code> creates an independent row each time.
        </>
      ),
      zh: (
        <>
          别用 <code>Array(n).fill(Array(n))</code> 造二维数组 ——
          那样每一行都是同一个数组对象。传给 <code>Array.from</code> 的工厂函数
          每次都会新建一行。
        </>
      ),
    },
  },
};

const MASK_526 = {
  java: {
    code: {
      en: `class Solution {
    public int countArrangement(int n) {
        int[] dp = new int[1 << n];
        dp[0] = 1;                              // empty arrangement: 1 way
        for (int mask = 0; mask < (1 << n); mask++) {
            int pos = Integer.bitCount(mask);   // filled positions -> fill pos+1 next
            for (int num = 1; num <= n; num++) {
                int bit = 1 << (num - 1);
                if ((mask & bit) == 0 && (num % (pos + 1) == 0 || (pos + 1) % num == 0))
                    dp[mask | bit] += dp[mask]; // put num at position pos+1
            }
        }
        return dp[(1 << n) - 1];
    }
}`,
      zh: `class Solution {
    public int countArrangement(int n) {
        int[] dp = new int[1 << n];
        dp[0] = 1;                              // 空排列:1 种
        for (int mask = 0; mask < (1 << n); mask++) {
            int pos = Integer.bitCount(mask);   // 已填位置数 —— 下一个填 pos+1
            for (int num = 1; num <= n; num++) {
                int bit = 1 << (num - 1);
                if ((mask & bit) == 0 && (num % (pos + 1) == 0 || (pos + 1) % num == 0))
                    dp[mask | bit] += dp[mask]; // 把 num 放到位置 pos+1
            }
        }
        return dp[(1 << n) - 1];
    }
}`,
    },
    hl: [6, 9, 10],
    note: {
      en: (
        <>
          <code>Integer.bitCount(mask)</code> counts the 1 bits of mask, which is
          how many numbers are already placed. Looping mask upward is what makes
          the order correct: <code>mask | bit</code> is always larger than{" "}
          <code>mask</code>, so dp[mask] is final before anything reads it.
        </>
      ),
      zh: (
        <>
          <code>Integer.bitCount(mask)</code> 数出 mask 里 1 的个数,
          也就是已经放好几个数字。mask 从小到大遍历保证了顺序正确:
          <code>mask | bit</code> 一定大于 <code>mask</code>,
          所以 dp[mask] 被读到时已经是最终值。
        </>
      ),
    },
  },
  python: {
    code: {
      en: `class Solution:
    def countArrangement(self, n: int) -> int:
        dp = [0] * (1 << n)
        dp[0] = 1
        for mask in range(1 << n):
            pos = bin(mask).count("1")          # filled positions
            for num in range(1, n + 1):
                bit = 1 << (num - 1)
                if not (mask & bit) and (num % (pos + 1) == 0 or (pos + 1) % num == 0):
                    dp[mask | bit] += dp[mask]  # put num at position pos+1
        return dp[-1]`,
      zh: `class Solution:
    def countArrangement(self, n: int) -> int:
        dp = [0] * (1 << n)
        dp[0] = 1
        for mask in range(1 << n):
            pos = bin(mask).count("1")          # 已填位置数
            for num in range(1, n + 1):
                bit = 1 << (num - 1)
                if not (mask & bit) and (num % (pos + 1) == 0 or (pos + 1) % num == 0):
                    dp[mask | bit] += dp[mask]  # 把 num 放到位置 pos+1
        return dp[-1]`,
    },
    hl: [6, 9, 10],
    note: {
      en: (
        <>
          <code>bin(mask).count(&quot;1&quot;)</code> counts the 1 bits. Python
          3.10 and later have the faster <code>mask.bit_count()</code>.{" "}
          <code>dp[-1]</code> is the last entry, the mask with every bit set.
        </>
      ),
      zh: (
        <>
          <code>bin(mask).count(&quot;1&quot;)</code> 用来数 1 的个数;
          Python 3.10 及以上可以用更快的 <code>mask.bit_count()</code>。
          <code>dp[-1]</code> 就是最后一项,即所有位都为 1 的 mask。
        </>
      ),
    },
  },
  js: {
    code: {
      en: `var countArrangement = function (n) {
  const dp = new Array(1 << n).fill(0);
  dp[0] = 1;
  const popcount = (m) => { let c = 0; while (m) { m &= m - 1; c++; } return c; };
  for (let mask = 0; mask < (1 << n); mask++) {
    const pos = popcount(mask);           // filled positions
    for (let num = 1; num <= n; num++) {
      const bit = 1 << (num - 1);
      if (!(mask & bit) && (num % (pos + 1) === 0 || (pos + 1) % num === 0))
        dp[mask | bit] += dp[mask];       // put num at position pos+1
    }
  }
  return dp[(1 << n) - 1];
};`,
      zh: `var countArrangement = function (n) {
  const dp = new Array(1 << n).fill(0);
  dp[0] = 1;
  const popcount = (m) => { let c = 0; while (m) { m &= m - 1; c++; } return c; };
  for (let mask = 0; mask < (1 << n); mask++) {
    const pos = popcount(mask);           // 已填位置数
    for (let num = 1; num <= n; num++) {
      const bit = 1 << (num - 1);
      if (!(mask & bit) && (num % (pos + 1) === 0 || (pos + 1) % num === 0))
        dp[mask | bit] += dp[mask];       // 把 num 放到位置 pos+1
    }
  }
  return dp[(1 << n) - 1];
};`,
    },
    hl: [6, 9, 10],
    note: {
      en: (
        <>
          JavaScript has no built-in popcount. <code>m &amp;= m - 1</code> clears
          the lowest 1 bit of <code>m</code>, so the loop runs once per set bit
          (the bit identity from Chapter 04). The related{" "}
          <code>m &amp; -m</code> isolates that lowest set bit instead of clearing
          it. With n ≤ 15 there are only 2¹⁵ masks.
        </>
      ),
      zh: (
        <>
          JavaScript 没有内置的 popcount。<code>m &amp;= m - 1</code> 会消掉{" "}
          <code>m</code> 最低位的那个 1,所以循环次数等于 1 的个数
          (第 4 章的位运算恒等式)。与它成对的 <code>m &amp; -m</code>{" "}
          则是把最低位的 1 单独取出来,而不是消掉。n ≤ 15 时只有 2¹⁵ 个 mask。
        </>
      ),
    },
  },
};

export default function DPProChapter() {
  return (
    <main className="page" data-ch="dp-pro">
      <Hero
        ch="dp-pro"
        title={{
          en: (
            <>
              Four shapes of a <span className="grad">DP state</span>
            </>
          ),
          zh: (
            <>
              DP 进阶 <span className="grad">Advanced DP</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              This is the last of the four DP chapters. So far the state has been a
              plain <code>dp[i]</code> or <code>dp[i][j]</code>. Here it takes four
              new shapes: a <strong>machine</strong>, an{" "}
              <strong>interval</strong>, a <strong>tree</strong>, and a{" "}
              <strong>set</strong>. The routine does not change: define the state,
              write the transition by looking at the last step, then fix the order
              in which the table is filled. What changes is what the state looks
              like.
            </>
          ),
          zh: (
            <>
              DP 四章的最后一章。前三章的状态都是老实的 <code>dp[i]</code>、
              <code>dp[i][j]</code>;这一章,状态换了四副面孔:一台
              <strong>机器</strong>、一段<strong>区间</strong>、一棵
              <strong>树</strong>、一个<strong>集合</strong>。
              流程没变 —— 定义状态、按「最后一步」写转移、定好填表顺序;
              变的只是「状态长什么样」。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 四张高级地图 ================= */}
      <Section
        id="why"
        index="01"
        title={{
          en: "From one table to four shapes of state",
          zh: "从「一维表」到「四张高级地图」",
        }}
        desc={{
          en: "Advanced DP is not a new method. Only the shape of the state changes.",
          zh: "DP 进阶不是新方法 —— 只是状态的形状变了",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Look back at the three DP chapters so far. Chapter 07 used{" "}
                  <code>dp[i]</code> along a line. Chapter 08 used{" "}
                  <code>dp[i][j]</code> for knapsack and grids, with two
                  dimensions. Chapter 09 used a two-dimensional table comparing two
                  strings. In all of them the state fits in one sentence and is
                  located by one or two indices. In this chapter the questions get
                  harder, and{" "}
                  <strong>the state itself grows a structure</strong>.
                </>
              }
              zh={
                <>
                  回顾 DP 前三章:第 7 章是线性的 <code>dp[i]</code>;
                  第 8 章的背包与网格是两个维度的 <code>dp[i][j]</code>;
                  第 9 章是两个字符串比对的二维表。
                  它们的状态都能一句话说清、用一两个下标定位。
                  到了这一章,题目问得更刁,<strong>状态本身长出了结构</strong>。
                </>
              }
            />
          </p>
        </div>
        <div className="grid-2" style={{ marginTop: 6 }}>
          <div className="card hoverable">
            <div className="pro-type-ico" aria-hidden>🎛️</div>
            <div className="card-kicker">
              <T en={<>§02 · state machine DP</>} zh={<>§02 · 状态机 DP</>} />
            </div>
            <div className="card-title">
              <T en={<>The state is a situation</>} zh={<>状态是一种「局面」</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    The problem moves between a few named <b>situations</b>:
                    holding, in cash, in cooldown. Each situation is one state, and
                    the transitions are the legal moves between them. Signal: at
                    any moment you are in one of a few modes, and there are clear
                    rules for switching. The main example is the stock trading
                    family.
                  </>
                }
                zh={
                  <>
                    问题在几种有名字的<b>局面</b>之间移动:持有、空仓、冷冻中。
                    每种局面是一个状态,转移就是局面之间的合法走法。
                    信号:任一时刻你处在若干种模式之一,且模式之间有明确的切换规则。
                    代表是股票买卖这一家族。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="pro-type-ico" aria-hidden>🌳</div>
            <div className="card-kicker">
              <T en={<>§03 · tree DP</>} zh={<>§03 · 树形 DP</>} />
            </div>
            <div className="card-title">
              <T en={<>The state hangs on a tree</>} zh={<>状态挂在「树」上</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    dp no longer walks along an array. It follows the parent-child
                    links: <b>children are computed first and combined upward</b>,
                    which is a post-order traversal. Signal: the problem is defined
                    on a tree, and a node&apos;s answer is built from its
                    children&apos;s answers. Examples: House Robber III, the
                    diameter of a binary tree.
                  </>
                }
                zh={
                  <>
                    dp 不再沿数组走,而是沿树的父子关系:
                    <b>先算孩子,再往上合并</b> —— 也就是后序遍历。
                    信号:问题定义在一棵树上,而父节点的答案由孩子的答案拼成。
                    代表:树上打家劫舍、二叉树的直径。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="pro-type-ico" aria-hidden>📏</div>
            <div className="card-kicker">
              <T en={<>§04 · interval DP</>} zh={<>§04 · 区间 DP</>} />
            </div>
            <div className="card-title">
              <T en={<>The state is an interval</>} zh={<>状态是一段「区间」</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    dp[i][j] is the best value for the interval from i to j. Its
                    transition reads only <b>strictly shorter</b> intervals, so
                    every shorter interval has to be computed first. In the table
                    that means filling one diagonal at a time. Signal: an operation
                    merges or splits a run of adjacent items. Examples: Burst
                    Balloons, longest palindromic subsequence.
                  </>
                }
                zh={
                  <>
                    dp[i][j] 表示区间 i 到 j 的最优值。它的转移只读
                    <b>严格更短</b>的区间,所以更短的区间必须先算完。
                    在表格里,这表现为一条对角线一条对角线地填。
                    信号:某个操作会合并或切分一段相邻的元素。
                    代表:戳气球、最长回文子序列。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="pro-type-ico" aria-hidden>🔦</div>
            <div className="card-kicker">
              <T en={<>§05 · bitmask DP</>} zh={<>§05 · 状压 DP</>} />
            </div>
            <div className="card-title">
              <T en={<>The state is a set</>} zh={<>状态是一个「集合」</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    The binary digits of one integer record which elements are
                    already used, so dp[mask] is the best value for using exactly
                    that set. Signal: n is surprisingly small (about 20 or less)
                    and the state has to remember a set. The groundwork is bit
                    manipulation in Chapter 04. Examples: Beautiful Arrangement,
                    the traveling salesman problem.
                  </>
                }
                zh={
                  <>
                    用一个整数的二进制位记下哪些元素已经用过,
                    于是 dp[mask] 就是「恰好用掉这批元素」时的最优值。
                    信号:n 小得反常(大约 20 以内),而状态必须记住一个集合。
                    地基是第 4 章的位运算。代表:优美的排列、旅行商问题。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "All four use the same five steps",
            zh: "四类共享同一套五步法",
          }}
        >
          <p>
            <T
              en={
                <>
                  Four types sounds like four things to learn, but they all follow
                  the <b>five steps</b> from Chapter 07: define the state, split by
                  the last step, set the base cases, fix the iteration order, and
                  check a small example by hand. The only new work is{" "}
                  <b>recognising what shape the state should have</b>. A few
                  switching situations means a state machine. A tree means tree DP.
                  Merging or splitting an interval means interval DP. A small n
                  plus a set means bitmask. Once the shape is right, the transition
                  usually follows from the same question as always: what was the
                  last step?
                </>
              }
              zh={
                <>
                  「四种类型」听起来像四件事,但它们走的都是第 7 章那套
                  <b>五步法</b>:定义状态 → 按「最后一步」写转移 → 初始化 →
                  定遍历顺序 → 手推小例子。唯一的新功课是
                  <b>认出「状态该长成什么形状」</b>:
                  看到几种局面切换想状态机、看到树想树形、
                  看到区间合并或切分想区间 DP、看到小 n 加集合想状压。
                  形状认对了,转移方程往往就跟着那句老问题浮现出来 ——
                  最后一步是什么?
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 状态机 DP · 股票族谱 ================= */}
      <Section
        id="fsm"
        index="02"
        title={{
          en: "State machine DP: one diagram for the whole stock family",
          zh: "状态机 DP:一张图讲清整个股票族谱",
        }}
        desc={{
          en: "Worked example · LC 309 with a cooldown: holding, in cash, and in cooldown, day by day",
          zh: "精讲 · LC 309 含冷冻期 —— 把「持有 / 空仓 / 冷冻」画成会流动的状态",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The buy-and-sell-stock problems on LeetCode are one{" "}
                  <strong>family</strong>: the same core with one more condition
                  added each time. Rather than memorising them separately, learn
                  the model they share, a <strong>state machine</strong>. At the
                  close of any day you are in one of a small number of situations,
                  and tomorrow&apos;s situation is decided by today&apos;s
                  situation plus today&apos;s action. Draw the situations as boxes
                  and the legal actions as arrows. The DP then grows the best
                  profit inside each box, one day at a time.
                </>
              }
              zh={
                <>
                  LeetCode 的「买卖股票」是一整个<strong>家族</strong>:
                  同一个内核,每次多加一条约束。与其一道道背,
                  不如认清它们共享的模型 —— <strong>状态机</strong>:
                  任何一天收盘时,你只可能处在少数几种局面里,
                  而明天的局面由今天的局面加今天的操作决定。
                  把局面画成方框、把合法操作画成箭头,
                  DP 就是让每个方框里的最大利润一天天长大。
                </>
              }
            />
          </p>
        </div>
        <div className="pro-ladder">
          <div className="pro-rung">
            <span className="pro-rung-lc">LC 121</span>
            <div>
              <h4>
                <T en={<>One buy and one sell</>} zh={<>只能买卖一次</>} />
              </h4>
              <p>
                <span className="add">
                  <T en={<>Adds: </>} zh={<>加什么:</>} />
                </span>
                <T
                  en={
                    <>
                      nothing yet. Keep the lowest price seen so far; the answer is
                      the largest value of price − lowest so far. This is where the
                      family starts.
                    </>
                  }
                  zh={
                    <>
                      还什么都没加。一路记录「到今天为止的最低价」,
                      答案是 price − 最低价 的最大值。家族的起点。
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <div className="pro-rung">
            <span className="pro-rung-lc">LC 122</span>
            <div>
              <h4>
                <T en={<>Unlimited trades</>} zh={<>可以无限次买卖</>} />
              </h4>
              <p>
                <span className="add">
                  <T en={<>Adds: </>} zh={<>加什么:</>} />
                </span>
                <T
                  en={
                    <>
                      two states, hold and cash, which convert into each other any
                      number of times. A greedy rule also works here (take every
                      rise) and gives the same answer, but the state machine
                      version is the one that survives the next conditions.
                    </>
                  }
                  zh={
                    <>
                      两个状态 hold 和 cash,可以反复互相转化。
                      这题也能贪心(吃下每段上涨),答案相同,
                      但状态机版才扛得住后面几条约束。
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <div className="pro-rung">
            <span className="pro-rung-lc">LC 123 / 188</span>
            <div>
              <h4>
                <T en={<>At most k trades</>} zh={<>最多买卖 k 次</>} />
              </h4>
              <p>
                <span className="add">
                  <T en={<>Adds: </>} zh={<>加什么:</>} />
                </span>
                <T
                  en={
                    <>
                      the number of trades already used becomes part of the state.
                      LC 123 is the case k = 2, which needs four running values. LC
                      188 is the general dp[k][hold], costing O(nk).
                    </>
                  }
                  zh={
                    <>
                      「已经用掉几次交易」变成状态的一部分。
                      LC 123 是 k = 2 的情形,四个变量即可;
                      LC 188 是一般的 dp[k][hold],代价 O(nk)。
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <div className="pro-rung">
            <span className="pro-rung-lc">LC 309</span>
            <div>
              <h4>
                <T
                  en={<>A one-day cooldown (worked example below)</>}
                  zh={<>含冷冻期(本节精讲)</>}
                />
              </h4>
              <p>
                <span className="add">
                  <T en={<>Adds: </>} zh={<>加什么:</>} />
                </span>
                <T
                  en={
                    <>
                      one new state, sold, meaning you sold today. After a sale you
                      must wait a day before buying, and two states cannot express
                      that gap.
                    </>
                  }
                  zh={
                    <>
                      一个新状态 sold,表示「今天卖出了」。
                      卖出后必须等一天才能买,两个状态装不下这个空窗。
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <div className="pro-rung">
            <span className="pro-rung-lc">LC 714</span>
            <div>
              <h4>
                <T en={<>A transaction fee</>} zh={<>含手续费</>} />
              </h4>
              <p>
                <span className="add">
                  <T en={<>Adds: </>} zh={<>加什么:</>} />
                </span>
                <T
                  en={
                    <>
                      no new state. Subtract the fee in the selling transition. It
                      does break the LC 122 greedy rule, because many small trades
                      each pay the fee, so from here on the DP is what you rely on.
                    </>
                  }
                  zh={
                    <>
                      不加状态,只在「卖出」那条转移里扣 fee。
                      但它让 122 的贪心失效了 —— 频繁的小额交易每笔都要付费,
                      从此只能靠 DP 记账。
                    </>
                  }
                />
              </p>
            </div>
          </div>
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Start from the smallest core, <strong>LC 122</strong> with
                  unlimited trades: two states and two transitions. Every later
                  stock problem adds states or edits transitions on top of this
                  shape.
                </>
              }
              zh={
                <>
                  先立最小内核 <strong>LC 122</strong>(无限次买卖):
                  两个状态、两条转移。后面所有股票题都是在这个形状上
                  「加状态、改转移」。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc122_stock_state_machine"
          java={STOCK_122.java}
          python={STOCK_122.python}
          js={STOCK_122.js}
        />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            <T
              en={
                <>
                  <b>Problem (LC 309):</b> you may trade any number of times, but
                  you may <strong>not buy on the day right after a sale</strong>.
                  <b> Why are two states not enough?</b> Because &quot;I sold
                  today&quot; and &quot;I have been in cash for a while&quot; allow
                  different actions tomorrow: the first may not buy, the second
                  may. They have to be different states. So the empty-handed case
                  splits into sold (just sold, blocked) and rest (in cash, free to
                  buy). Three states, three transitions. Watch them move day by
                  day:
                </>
              }
              zh={
                <>
                  <b>题意(LC 309):</b>可以无限次买卖,但
                  <strong>卖出后第二天不能买</strong>。
                  <b> 为什么两个状态不够?</b>因为「今天刚卖出」和「已经空仓一段时间」
                  这两种局面,明天可做的操作不同 —— 前者不能买,后者能买,
                  所以它们必须是两个不同的状态。于是把「手上没股」拆成
                  sold(刚卖、被封)和 rest(空仓、可买)。
                  三个状态、三条转移,逐日看它们怎么流动:
                </>
              }
            />
          </p>
        </div>
        <StockFSM />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            <T
              en={
                <>
                  Now translate the three arrows into code. The one thing to watch:
                  all three new values must be computed from{" "}
                  <strong>yesterday&apos;s</strong> values. Either use temporary
                  variables, or use an assignment form that evaluates the whole
                  right-hand side before assigning.
                </>
              }
              zh={
                <>
                  把上图的三条箭头直接翻译成代码。唯一要小心的地方:
                  三个新值都必须由<strong>昨天</strong>的值算出来。
                  要么用临时变量,要么用「先整体求值再赋值」的写法。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc309_stock_with_cooldown"
          java={STOCK_309.java}
          python={STOCK_309.python}
          js={STOCK_309.js}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and follow-up questions",
            zh: "复杂度 & 面试追问",
          }}
        >
          <p>
            <T
              en={
                <>
                  Time <BigO o="n" />, space <BigO o="1" />. Follow-ups: (1) With a
                  fee (LC 714), subtract it in the selling transition; two states
                  are still enough. (2) At most k trades (LC 188): make the trade
                  count a dimension, dp[k][2], for O(nk) time. (3) Why does a
                  one-day cooldown need only one new state, instead of storing how
                  many cooldown days are left? Because the wait is exactly one day,
                  so &quot;sold today&quot; already says everything about what
                  tomorrow allows. If the wait were m days, the remaining cooldown
                  would have to go into the state.{" "}
                  <b>
                    More conditions means more states or more dimensions, and that
                    is what makes state machine DP easy to extend.
                  </b>
                </>
              }
              zh={
                <>
                  时间 <BigO o="n" />、空间 <BigO o="1" />。追问:
                  ①「加手续费?」(LC 714)→ 在卖出转移里扣掉,两个状态仍然够用;
                  ②「最多 k 次交易?」(LC 188)→ 把交易次数升成一个维度 dp[k][2],
                  时间 O(nk);③「为什么一天的冷冻期只需一个新状态,
                  而不用记『还剩几天冷冻』?」→ 因为等待恰好是一天,
                  「今天刚卖」已经把明天能做什么说全了;
                  若要等 m 天,就必须把「剩余冷冻天数」也放进状态。
                  <b>约束越多,状态或维度就越多 —— 状态机 DP 好扩展,正在于此。</b>
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="deep"
          title={{
            en: "State machines outside practice problems",
            zh: "工程现场:状态机无处不在",
          }}
        >
          <p>
            <T
              en={
                <>
                  The &quot;state plus transition&quot; idea in these stock
                  problems is a <b>finite state machine</b>, and it is used widely.
                  A TCP connection moves through CLOSED, SYN_SENT, and ESTABLISHED.
                  An order moves through awaiting payment, paid, shipped, and
                  complete. A regular expression engine matches text by moving
                  between states. A screen in an application is loading, loaded, or
                  failed. Learning to break a situation into a fixed set of states
                  with explicit transitions is useful well beyond practice
                  problems.
                </>
              }
              zh={
                <>
                  股票题里的「状态 + 转移」就是<b>有限状态机</b>,
                  它在工程中随处可见:TCP 连接会经过 CLOSED、SYN_SENT、ESTABLISHED;
                  订单会经过待支付、已支付、已发货、已完成;
                  正则引擎靠在状态之间移动来匹配文本;
                  一个界面则处于加载中、加载成功或加载失败。
                  学会「把局面拆成有限的几个状态 + 明确的转移」,
                  受益的远不止刷题。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 树形 DP ================= */}
      <Section
        id="tree"
        index="03"
        title={{
          en: "Tree DP: take or skip, moved onto a tree",
          zh: "树形 DP:把「选 / 不选」搬上一棵树",
        }}
        desc={{
          en: "Worked example · LC 337 House Robber III: post-order, and every node reports two values",
          zh: "精讲 · LC 337 打家劫舍 III —— 后序遍历,每个节点汇报两个值",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  In Chapter 07, House Robber (LC 198) is a <strong>row</strong> of
                  houses and dp[i] only looks at the previous cell. Now put the
                  houses on a <strong>binary tree</strong> (LC 337): if you take a
                  node, neither of its children may be taken. &quot;The previous
                  cell&quot; of the array becomes &quot;the two children&quot;. The
                  direction of the transition changes from looking left along an
                  array to asking downward along the tree.
                </>
              }
              zh={
                <>
                  第 7 章的打家劫舍(LC 198)是<strong>一排</strong>房子,
                  dp[i] 只看前一格。现在把房子摆到<strong>一棵二叉树</strong>上
                  (LC 337):偷了一个节点,它的两个孩子就都不能偷。
                  数组的「前一格」变成了「两个孩子」——
                  转移的方向,从「沿数组往左看」变成了「沿树往下问」。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>The key point:</b> each node must report <strong>two</strong>{" "}
                  numbers to its parent, not one. Say clearly what the recursive
                  function promises to return:{" "}
                  <b>dfs(node) returns [rob, skip] for the subtree at node</b>,
                  where rob is the best total when node is taken and skip is the
                  best total when node is not taken. The parent needs both. If it
                  takes itself, both children must be skipped, so it needs their
                  skip values. If it skips itself, each child chooses freely, so it
                  needs max(rob, skip) for each. A single max does not contain the
                  skip value, so the parent could not combine the answers.{" "}
                  <strong>Post-order traversal</strong> — recurse into both children
                  first, then compute the node — is what produces the values
                  bottom-up:
                </>
              }
              zh={
                <>
                  <b>关键点:</b>每个节点必须向父亲汇报<strong>两个</strong>数,
                  而不是一个。先把递归函数承诺返回什么说清楚:
                  <b>dfs(node) 返回以 node 为根的子树的 [rob, skip]</b> ——
                  rob 是偷 node 时的最大金额,skip 是不偷 node 时的最大金额。
                  父亲两个都要用:父亲若偷自己,两个孩子都不能偷,所以要孩子的 skip;
                  父亲若不偷自己,孩子各自随意,所以要各自的 max(rob, skip)。
                  只给一个 max,里面没有 skip,父亲就没法组合了。
                  <strong>后序遍历</strong> —— 先递归两个孩子、再算当前节点 ——
                  正是把值自底向上算出来的顺序:
                </>
              }
            />
          </p>
        </div>
        <RobTreeDP />
        <CodeTabs
          title="lc337_house_robber_iii"
          java={ROB_337.java}
          python={ROB_337.python}
          js={ROB_337.js}
        />
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en={<>Same pattern · LC 543 (review)</>} zh={<>同款套路 · LC 543(复盘)</>} />
            </div>
            <div className="card-title">
              <T en={<>Diameter of a binary tree</>} zh={<>二叉树的直径</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    Tree DP where the return value is not the answer. dfs returns
                    the number of nodes on the longest downward path from the node,
                    while at each node it also updates a separate best-so-far
                    variable with <b>left depth + right depth</b>. That sum counts
                    edges, which is what the problem asks for. Returning one
                    quantity and updating another is the standard shape, and LC 124
                    (maximum path sum) is identical.
                  </>
                }
                zh={
                  <>
                    「返回值 ≠ 答案」的树形 DP。dfs 返回从该节点向下的最长路径上的节点数,
                    同时在每个节点用<b>左深 + 右深</b>去更新另一个「目前最优」的变量。
                    这个和数的是边数,正是题目要的直径。
                    「返回一个量、更新另一个量」是通用写法,
                    LC 124(最大路径和)与它完全同构。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en={<>Advanced · LC 968 (review)</>} zh={<>进阶 · LC 968(复盘)</>} />
            </div>
            <div className="card-title">
              <T en={<>Binary tree cameras</>} zh={<>监控二叉树</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    Each node returns one of three codes: not watched, watched, or
                    has a camera. Bottom-up, plus a greedy choice: delay every
                    camera to the parent of an uncovered node, because one camera
                    there covers the node, its siblings, and its own parent. Tree
                    DP and greedy combined. Harder than the main line; come back to
                    it later.
                  </>
                }
                zh={
                  <>
                    每个节点返回三种编码之一:未覆盖、已覆盖、有摄像头。
                    自底向上,再加一个贪心选择:把摄像头一路推迟到未覆盖节点的父亲 ——
                    装在那里,一台能同时覆盖该节点、它的兄弟和它自己的父亲。
                    树形 DP 与贪心合体。比主线更难,之后再回来看。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "Two common mistakes in tree DP",
            zh: "树形 DP 的两个常见错误",
          }}
        >
          <p>
            <T
              en={
                <>
                  (1) <b>Returning a single value.</b> A common first attempt is to
                  have dfs return &quot;the largest amount obtainable in this
                  subtree&quot;. Then, when the parent wants to take itself, the
                  child&apos;s skip value is gone.{" "}
                  <b>An incomplete state makes the transition wrong.</b> (2){" "}
                  <b>Using the wrong traversal order.</b> It must be{" "}
                  <b>post-order</b>, with the children computed first. Pre-order or
                  level order would use a child&apos;s value before that value
                  exists, which breaks the rule that every value a transition reads
                  must already be final.
                </>
              }
              zh={
                <>
                  ① <b>只返回一个值。</b>很多人第一版会让 dfs 返回
                  「以这个节点为根能偷的最大值」——
                  结果父节点想偷自己时,孩子的 skip 值已经丢了。
                  <b>状态不完整,转移必错。</b>
                  ② <b>用错遍历顺序。</b>必须是<b>后序</b>,先算孩子。
                  前序或层序会在孩子的值还不存在时就去用它,
                  违反「转移读到的每个值都必须已经是最终值」这条规则。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 区间 DP · 戳气球 ================= */}
      <Section
        id="interval"
        index="04"
        title={{
          en: "Interval DP: a long interval stands on shorter ones",
          zh: "区间 DP:大区间站在小区间的肩膀上",
        }}
        desc={{
          en: "Worked example · LC 312 Burst Balloons: reason backwards, then fill by increasing interval length",
          zh: "精讲 · LC 312 戳气球 —— 逆向思考,再按区间长度从小到大填",
        }}
        badge={<span className="lc-badge" data-d="hard">HARD</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>Problem (LC 312):</b> a row of balloons each holds a number.
                  Bursting balloon i gives{" "}
                  <code>left × nums[i] × right</code> coins, where left and right
                  are its current immediate neighbors. After a balloon bursts, its
                  two neighbors become adjacent. Find the largest number of coins
                  from bursting every balloon.
                </>
              }
              zh={
                <>
                  <b>题意(LC 312):</b>一排气球各有一个数字。戳破第 i 个可得
                  <code>left × nums[i] × right</code> 枚硬币,
                  其中 left / right 是它当前紧邻的两个气球。
                  一个气球被戳破后,它左右两边会贴到一起。求戳完全部气球的最大硬币数。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>Why does forward reasoning get stuck?</b> If you enumerate
                  which balloon to burst first, the two remaining halves merge into
                  one new row, so they affect each other. The subproblems are{" "}
                  <strong>not independent</strong>, and there is no clean state to
                  define. This is the classic trap of interval DP.
                </>
              }
              zh={
                <>
                  <b>为什么正向想会卡住?</b>如果枚举「先戳哪个」,
                  剩下的左右两半会合并成新的一排,于是互相影响。
                  子问题<strong>不独立</strong>,也就定不出干净的状态。
                  这正是区间 DP 的经典陷阱。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>Reasoning backwards:</b> enumerate the balloon k that is burst{" "}
                  <strong>last</strong> instead. When k is burst, every other
                  balloon in the interval (i, j) is already gone, so k&apos;s
                  neighbors are <strong>exactly the endpoints i and j</strong>,
                  which gives <code>arr[i] × arr[k] × arr[j]</code>. Everything to
                  the left of k, and everything to the right of k, was burst
                  earlier and never interacted, so (i, k) and (k, j) are
                  independent subproblems. That gives:
                </>
              }
              zh={
                <>
                  <b>换成逆向思考:</b>改为枚举<strong>最后</strong>
                  一个被戳破的气球 k。戳 k 时,区间 (i, j) 里其他气球都已经没了,
                  所以 k 的邻居<strong>恰好是端点 i 和 j</strong>,
                  得 <code>arr[i] × arr[k] × arr[j]</code>。
                  k 左边的那些和 k 右边的那些都在更早戳完,彼此从未接触,
                  所以 (i, k) 和 (k, j) 是两个独立的子问题。于是:
                </>
              }
            />
          </p>
          <p style={{ textAlign: "center" }}>
            <code>dp[i][j] = max over k∈(i,j) of ( dp[i][k] + arr[i]×arr[k]×arr[j] + dp[k][j] )</code>
          </p>
          <p>
            <T
              en={
                <>
                  Pad both ends with a <strong>balloon of value 1</strong> so the
                  endpoints always exist and no boundary case is needed. Every cell
                  the transition reads — dp[i][k] and dp[k][j] — is a{" "}
                  <strong>strictly shorter</strong> interval than (i, j). So all
                  shorter intervals must be filled first, and filling{" "}
                  <strong>by increasing interval length</strong> is how you
                  guarantee that. In the table it looks like moving along one
                  diagonal at a time. The order is not a convention; it is what the
                  dependency requires. Step through the table:
                </>
              }
              zh={
                <>
                  两端各补一个<strong>值为 1 的气球</strong>,
                  端点就永远存在,不用写边界特判。
                  转移读到的每一格 —— dp[i][k] 与 dp[k][j] ——
                  都是比 (i, j) <strong>严格更短</strong>的区间。
                  所以更短的区间必须先填完,而
                  <strong>按区间长度从小到大填</strong>就是保证这一点的办法;
                  在表格里,它表现为一次沿着一条对角线推进。
                  这个顺序不是约定,而是依赖关系的要求。逐帧看这张表:
                </>
              }
            />
          </p>
        </div>
        <BalloonInterval />
        <CodeTabs
          title="lc312_burst_balloons"
          java={BALLOON_312.java}
          python={BALLOON_312.python}
          js={BALLOON_312.js}
        />
        <Callout
          tone="idea"
          title={{
            en: "Two shapes of interval transition: shrink from both ends, or pick a split point",
            zh: "区间 DP 的两副面孔:两端收缩 vs 枚举分割点",
          }}
        >
          <p>
            <T
              en={
                <>
                  An interval transition is usually one of two shapes. (1){" "}
                  <b>Shrink from both ends</b>: compare s[i] with s[j] and move
                  inward, as in <b>LC 516 longest palindromic subsequence</b>,
                  where s[i] == s[j] gives dp[i+1][j−1] + 2. Chapter 09 solved that
                  one as an LCS; here it is the interval view of the same problem.
                  (2) <b>Pick a point k inside (i, j)</b> — a split point, or the
                  last step — as in Burst Balloons, merging stones, and matrix chain
                  multiplication. Both shapes share the same consequence:{" "}
                  <b>
                    a long interval depends on shorter ones, so fill by increasing
                    length
                  </b>
                  .
                </>
              }
              zh={
                <>
                  区间 DP 的转移通常是两副面孔之一。①<b>两端收缩</b>:
                  比较 s[i] 与 s[j],再往里缩 —— 如<b>LC 516 最长回文子序列</b>,
                  s[i] == s[j] 时 dp[i][j] = dp[i+1][j−1] + 2。
                  第 9 章从 LCS 角度解过它,这里是同一题的区间视角。
                  ②<b>在 (i, j) 内挑一个 k</b> —— 分割点,或者「最后一步」——
                  如戳气球、石子合并、矩阵链乘。两副面孔的结论相同:
                  <b>长区间依赖短区间,所以按长度从小到大填</b>。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="win"
          title={{
            en: "Complexity and follow-up questions",
            zh: "复杂度 & 面试追问",
          }}
        >
          <p>
            <T
              en={
                <>
                  Time <BigO o="n2" label="O(n³)" />: there are O(n²) intervals and
                  each one tries O(n) choices of k. Space <BigO o="n2" /> for the
                  table. The table cannot be reduced to a single row here, because
                  the transition reads dp[i][k] from the same row and dp[k][j] from
                  another row, not only from the previous diagonal. Follow-ups: (1)
                  &quot;Why the last balloon and not the first?&quot; Only fixing
                  the last one keeps the two sides independent; going forward makes
                  the intervals merge. This is the heart of the problem, so answer
                  it. (2) &quot;What are the padded balloons for?&quot; They make
                  the neighbors of the edge balloons always exist, with value 1,
                  which removes a lot of boundary handling. (3) &quot;Can it be
                  memoised instead?&quot; Yes: top-down dfs(i, j) with a memo table
                  has the same complexity and is often easier to write.
                </>
              }
              zh={
                <>
                  时间 <BigO o="n2" label="O(n³)" />:区间共 O(n²) 个,
                  每个再试 O(n) 个 k。空间 <BigO o="n2" />,就是那张表。
                  这里的表不能压成一行 —— 转移读的 dp[i][k] 在同一行、
                  dp[k][j] 在另一行,并不只读上一条对角线。追问:
                  ①「为什么是最后戳而不是先戳?」→ 只有固定最后戳,左右两段才独立;
                  正向会让区间合并。这是本题的核心,一定要答出来。
                  ②「补的虚拟气球有什么用?」→ 让边缘气球的邻居永远存在(值 1),
                  省掉大量边界处理。③「能写成记忆化吗?」→ 能,
                  自顶向下 dfs(i, j) 加一张 memo 表,复杂度同阶,而且常常更好写。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 状压 DP ================= */}
      <Section
        id="bitmask"
        index="05"
        title={{
          en: "Bitmask DP: a set stored in one integer",
          zh: "状压 DP:把一个集合塞进一个整数",
        }}
        desc={{
          en: "LC 526 Beautiful Arrangement, built on \"bits as a set\" from Chapter 04",
          zh: "LC 526 优美的排列 —— 复盘第 4 章「用 bit 表示集合」",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  In some problems the state is naturally a{" "}
                  <strong>set</strong>: which elements have already been used. A set
                  of n elements has 2ⁿ subsets. When n is small, about 20 or less,
                  you can store the subset in the{" "}
                  <strong>binary digits of one integer</strong>: bit b is 1 when
                  element b has been used. This is called{" "}
                  <strong>bitmask DP</strong>, or state compression. The groundwork
                  is Chapter 04, where an int is treated as a row of switches. Try
                  the correspondence between a set and an integer first:
                </>
              }
              zh={
                <>
                  有一类题,状态天然就是一个<strong>集合</strong>:
                  哪些元素已经用过了。n 个元素的集合有 2ⁿ 个子集。
                  当 n 很小(大约 20 以内),就可以把子集存进
                  <strong>一个整数的二进制位</strong>里:
                  第 b 位为 1 表示元素 b 已用。这叫<strong>状压 DP</strong>
                  (状态压缩)。地基是第 4 章 ——
                  那里把一个 int 当成一排开关。先亲手玩一下「集合 ↔ 整数」的对应:
                </>
              }
            />
          </p>
        </div>
        <MaskLab />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            <T
              en={
                <>
                  <b>Problem (LC 526):</b> place 1..n into n positions. If every
                  position i (counting from 1) satisfies{" "}
                  <code>perm[i] % i == 0</code> or <code>i % perm[i] == 0</code>,
                  the placement is a beautiful arrangement. Count them.
                  <b> Brute force:</b> generate all n! permutations and check each
                  one, which is far too slow at n = 15.
                  <b> Bitmask:</b> what matters about the past is only{" "}
                  <b>which numbers are already used</b>, not the order they went
                  in, and n ≤ 15. So let mask be the used set. Then{" "}
                  <code>popcount(mask)</code> is the number of filled positions,
                  call it pos, and the next position to fill is pos+1. Try every
                  unused number that is compatible with pos+1. There are 2ⁿ masks
                  and each tries n numbers, so the cost is (number of subsets) ×
                  (work per subset) = <b>O(2ⁿ × n)</b> time and <b>O(2ⁿ)</b> space.
                </>
              }
              zh={
                <>
                  <b>题意(LC 526):</b>把 1..n 填进 n 个位置。
                  若每个位置 i(从 1 数)都满足 <code>perm[i] % i == 0</code>
                  或 <code>i % perm[i] == 0</code>,就是一个优美的排列。求个数。
                  <b> 暴力:</b>生成全部 n! 个排列逐个检查,n = 15 时太慢。
                  <b> 状压:</b>关于过去,唯一有用的信息是
                  <b>哪些数字已经用过</b>,而不是它们的先后顺序,而且 n ≤ 15。
                  于是让 mask 表示已用集合,<code>popcount(mask)</code>
                  就是已填位置数,记作 pos,下一个要填的是位置 pos+1。
                  枚举所有还没用过、且与 pos+1 相容的数字。
                  mask 共 2ⁿ 个,每个再试 n 个数字,
                  所以代价 =(子集个数)×(每个子集的工作量)=
                  时间 <b>O(2ⁿ × n)</b>、空间 <b>O(2ⁿ)</b>。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc526_beautiful_arrangement"
          java={MASK_526.java}
          python={MASK_526.python}
          js={MASK_526.js}
        />
        <Callout
          tone="deep"
          title={{
            en: "The ceiling of bitmask DP: the traveling salesman problem",
            zh: "状压的天花板:旅行商问题(TSP)",
          }}
        >
          <p>
            <T
              en={
                <>
                  The best known use of bitmask DP is the{" "}
                  <b>traveling salesman problem</b>: visit n cities once each,
                  along the shortest route. The state is{" "}
                  <code>dp[mask][i]</code> = the shortest distance for a route that
                  has visited exactly the cities in mask and currently stops at
                  city i. There are 2ⁿ·n states and each one tries n next cities,
                  so the cost is <b>O(2ⁿ × n²)</b> instead of checking n!
                  routes. That is still exponential, but it solves instances up to
                  about n = 20, which is enough for real tasks such as planning a
                  delivery route or ordering the drill holes on a circuit board.
                  This is the boundary of bitmask DP: n must be small, but a small n
                  can still be worth a lot.
                </>
              }
              zh={
                <>
                  状压 DP 最著名的应用是<b>旅行商问题</b>:
                  走遍 n 个城市各一次,求最短路线。状态是
                  <code>dp[mask][i]</code> = 「已走过 mask 这批城市、
                  当前停在城市 i」时的最短距离。状态共 2ⁿ·n 个,
                  每个再试 n 个下一站,所以代价是 <b>O(2ⁿ × n²)</b>,
                  而不是枚举 n! 条路线。它仍是指数级,
                  但已经能解到 n ≈ 20 的实例 ——
                  规划配送路线、给电路板打孔排序这类真实任务够用了。
                  这就是状压的边界:n 必须小,但小的 n 也能很值钱。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="warn"
          title={{
            en: "Where bitmask DP stops working",
            zh: "状压的适用红线",
          }}
        >
          <p>
            <T
              en={
                <>
                  Seeing a set is not enough; check n first, because{" "}
                  <b>the table has 2ⁿ entries and has to fit in memory</b>. n ≤ 20
                  is comfortable: 2²⁰ is about one million. n = 25 is 33 million and
                  n = 30 is about one billion, which is out. This is why a bitmask
                  problem almost always comes with a{" "}
                  <b>surprisingly small n</b> in its constraints. It is both the
                  hint and the limit.
                </>
              }
              zh={
                <>
                  看到「集合」还不够,先看 n ——
                  <b>表有 2ⁿ 项,必须装得进内存</b>。n ≤ 20 是舒适区:
                  2²⁰ 约一百万。n = 25 是 3300 万,n = 30 约十亿,基本出局。
                  所以状压题的数据范围里几乎总有一个<b>小得反常的 n</b>:
                  它既是提示,也是红线。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 数位/概率 一句话地图 ================= */}
      <Section
        id="map"
        index="06"
        title={{
          en: "One step further: digit DP and probability DP",
          zh: "再往前一步:数位 DP 与概率 DP",
        }}
        desc={{
          en: "Recognising the signal is enough here. Neither is required, and both are rare in interviews.",
          zh: "认得出信号就够了 —— 不作主线要求,面试也少见",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Two more areas of DP are worth naming. Both follow fixed patterns
                  but need more background than this chapter assumes. For now it is
                  enough to <strong>know they exist and recognize the signal</strong>
                  , and to read more when you actually meet one.
                </>
              }
              zh={
                <>
                  DP 还有两块区域值得点个名。它们套路固定,
                  但需要的背景比本章假设的更多。现在只要
                  <strong>知道它们存在、认得出信号</strong>就够了,
                  真遇到时再深入。
                </>
              }
            />
          </p>
        </div>
        <div className="pro-mini">
          <div className="card">
            <div className="pro-type-ico" aria-hidden>🔢</div>
            <div className="card-kicker">
              <T en={<>Digit DP</>} zh={<>数位 DP</>} />
            </div>
            <div className="card-title">
              <T en={<>Fill one digit at a time</>} zh={<>按「数位」逐位填</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    <b>Signal:</b> count the integers in a range [L, R] whose digits
                    have some property (no digit 4, strictly increasing digits, a
                    given digit sum). <b>State:</b> which digit position you are at,
                    a flag saying whether the digits chosen so far still match the
                    bound exactly, and whatever else the property needs. That flag
                    is usually called <b>tight</b>, and it is what keeps the count
                    inside the numeric bound: while it is true, the current digit
                    may not exceed the bound&apos;s digit at this position; once you
                    place a smaller digit it becomes false and all later positions
                    are free. Search from the most significant digit down, with
                    memoisation. <b>Example:</b> LC 233 Number of Digit One.
                  </>
                }
                zh={
                  <>
                    <b>信号:</b>统计区间 [L, R] 内数位满足某种性质的整数个数
                    (不含数字 4、各位严格递增、数位和为某值)。
                    <b>状态:</b>当前处理到第几位、一个标记表示
                    「到目前为止选的数位是否还与上界完全相同」,
                    再加上该性质需要的其他信息。这个标记通常叫
                    <b>tight(贴着上界)</b>,它正是把计数限制在数值上界内的关键:
                    只要它为真,当前位就不能超过上界在这一位的数字;
                    一旦放了更小的数字,它变为假,后面所有位就自由了。
                    从最高位往下记忆化搜索。<b>代表:</b>LC 233 数字 1 的个数。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="pro-type-ico" aria-hidden>🎲</div>
            <div className="card-kicker">
              <T en={<>Probability and expected value DP</>} zh={<>概率 / 期望 DP</>} />
            </div>
            <div className="card-title">
              <T en={<>The state stores a probability</>} zh={<>状态里存的是概率</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    <b>Signal:</b> the question asks for a probability, or for the
                    expected value of some quantity. <b>Transition:</b> instead of
                    adding counts, add the branches weighted by their probabilities.
                    <b> Watch out:</b> an expected value often has to be computed{" "}
                    <b>backwards</b>, from the final states toward the start,
                    because &quot;the expected value so far&quot; cannot be defined
                    usefully going forward. <b>Examples:</b> LC 688 Knight
                    Probability in Chessboard, LC 837 New 21 Game.
                  </>
                }
                zh={
                  <>
                    <b>信号:</b>题目问某事件的概率,或某个量的期望值。
                    <b>转移:</b>把「方案数相加」换成「按各分支的概率加权求和」。
                    <b> 注意:</b>期望常常必须<b>逆推</b> ——
                    从终止状态往起点算,因为「到目前为止的期望」正向定义不出有用的含义。
                    <b>代表:</b>LC 688 骑士在棋盘上的概率、LC 837 新 21 点。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="story"
          title={{
            en: "You have now covered the whole DP range",
            zh: "到这里,你已经走完了整座 DP 山脉",
          }}
        >
          <p>
            <T
              en={
                <>
                  From the one-line idea in Chapter 07 — store a result so you can
                  reuse it — through the linear table, the knapsack capacity table,
                  and the two-sequence table, to the state machine, tree, interval,
                  and set of this chapter, you now have a full routine: recognize
                  the shape of the state, then apply the five steps. Digit DP and
                  probability DP are two smaller areas at the edge.{" "}
                  <b>
                    DP is not mysterious. It writes out how decisions and states
                    develop, one cell at a time.
                  </b>
                </>
              }
              zh={
                <>
                  从第 7 章那句大白话 —— 把算过的结果记下来重复用 ——
                  到入门的线性表、背包的容量表、子序列的双序列表,
                  再到这一章的状态机、树形、区间、集合,
                  你手里已经有一整套流程:先认出状态的形状,再套五步法。
                  数位 DP 和概率 DP 只是边缘的两小块。
                  <b>DP 并不玄:它只是把决策与状态的演进,一格一格地写出来。</b>
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title={{
          en: "Problem set: 12 advanced DP problems",
          zh: "高频题单:DP 进阶 12 题",
        }}
        desc={{
          en: "Grouped as state machine, tree, interval, bitmask, and optional. Think for 30 seconds before opening the hint.",
          zh: "按「状态机 → 树形 → 区间 → 状压 → 选做」分层。先想 30 秒再看提示",
        }}
        badge={
          <span className="chip">
            <T en={<>Main line + advanced</>} zh={<>主线 + 进阶</>} />
          </span>
        }
      >
        <ProblemSet ch="dp-pro" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "All 7 correct turns this chapter green, and finishes the DP series.",
          zh: "7 题全对,点亮本章绿灯 —— 也点亮整个 DP 系列",
        }}
        badge={
          <span className="chip">
            <T en={<>✎ Quiz</>} zh={<>✎ 通关测验</>} />
          </span>
        }
      >
        <Quiz ch="dp-pro" items={QUIZ} />
      </Section>

      <KeyPoints
        points={{
          en: [
            <>
              Advanced DP <b>changes the shape of the state, not the routine</b>: a
              situation (state machine), a node on a tree, an interval [i, j], or a
              set. Get the shape right and the transition usually follows.
            </>,
            <>
              <b>State machine DP</b>: the problem moves between a few named
              situations, and each new condition adds a state or a dimension (LC
              121 → 122 → 123 → 309 → 714). A cooldown adds the state sold, meaning
              &quot;sold today&quot;.
            </>,
            <>
              <b>Tree DP</b>: post-order, bottom-up, and every node{" "}
              <b>reports more than one value</b> ([rob, skip] in LC 337). Say what
              the recursive function promises to return. Often the return value is
              not the answer (LC 543 returns a depth and updates a diameter).
            </>,
            <>
              <b>Interval DP</b>: dp[i][j] reads strictly shorter intervals, so{" "}
              <b>fill by increasing interval length</b> — one diagonal at a time.
              The hard part is usually choosing the split point or the last step k
              (in LC 312, the balloon burst last).
            </>,
            <>
              <b>Bitmask DP</b>: the bits of one integer are a set, and dp[mask] is
              the best value for using exactly that set. The practical limit is{" "}
              <b>n ≤ 20</b>, so that 2ⁿ fits. <code>m &amp; (m - 1)</code> clears
              the lowest set bit; <code>m &amp; -m</code> isolates it.
            </>,
            <>
              <b>&quot;What was the last step?&quot; opens every DP</b>: which cell
              did the last one come from (linear), take the last item or not
              (knapsack), which balloon was burst last (interval), which number was
              placed last (bitmask).
            </>,
            <>
              Complexity is always <b>(number of states) × (work per transition)</b>
              , and the table counts in the space before any reduction. Recognising
              digit DP and probability DP is enough. The four DP chapters end here.
            </>,
          ],
          zh: [
            <>
              DP 进阶<b>换的是状态的形状,不是流程</b>:
              一种局面(状态机)、树上的一个节点、一段区间 [i, j]、一个集合。
              形状认对了,转移方程往往就跟着出来了。
            </>,
            <>
              <b>状态机 DP</b>:问题在几种有名字的局面间移动,
              每加一条约束就多一个状态或一个维度
              (LC 121 → 122 → 123 → 309 → 714)。
              冷冻期多出的是 sold,意思是「今天刚卖」。
            </>,
            <>
              <b>树形 DP</b>:后序、自底向上,每个节点<b>汇报不止一个值</b>
              (LC 337 的 [rob, skip])。先把递归函数承诺返回什么说清楚。
              常见「返回值 ≠ 答案」(LC 543 返回深度,更新直径)。
            </>,
            <>
              <b>区间 DP</b>:dp[i][j] 读的是严格更短的区间,所以
              <b>按区间长度从小到大填</b>,一次一条对角线。
              难点通常在选分割点或「最后一步」k
              (LC 312 里是最后被戳破的那个气球)。
            </>,
            <>
              <b>状压 DP</b>:一个整数的各位就是一个集合,
              dp[mask] 是恰好用掉这批元素时的最优值。实际上限是
              <b>n ≤ 20</b>,让 2ⁿ 装得下。<code>m &amp; (m - 1)</code>
              消掉最低位的 1,<code>m &amp; -m</code> 把它单独取出来。
            </>,
            <>
              <b>「最后一步是什么?」是所有 DP 的起手式</b>:
              最后一格从哪来(线性)、最后一个物品选不选(背包)、
              最后戳哪个气球(区间)、最后放哪个数字(状压)。
            </>,
            <>
              复杂度永远是<b>(状态数)×(每次转移的工作量)</b>,
              而且在任何优化之前,那张表本身就要算进空间。
              数位 DP 与概率 DP 认得出信号即可。DP 四章到此走完。
            </>,
          ],
        }}
      />

      <ChapterFooter ch="dp-pro" />
    </main>
  );
}
