"use client";

// 第 3 章 · 二分进阶 —— 八段式结构:
//  §01 模板复盘(死循环三要素)→ §02 找边界 + 精讲 A(LC 34)→
//  §03 二段性 · 旋转数组 + 精讲 B(LC 33)→ §04 峰值与矩阵(162/852/74/240)→
//  §05 二分答案 + 精讲 C(LC 875 吃香蕉,RangeShrink)→ §06 答案二分续(1011/410/69/367)→
//  §07 题单 → §08 通关测验 → 要点。
// 二分答案主可视化用 lib/algviz 的 RangeShrink(帧写在本文件);
// 找边界 / 旋转数组用 ArrayStepper 自建帧(见 ./viz)。

import "./chapter.css";
import {
  Hero,
  Section,
  Callout,
  BigO,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { RangeShrink, type RangeFrame } from "@/lib/algviz";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { PROBLEMS, QUIZ } from "@/lib/binary-data";
import { GuessLab, BoundaryStepper, RotatedStepper } from "./viz";

/* ============ 精讲 C · LC 875 吃香蕉:RangeShrink 逐帧收窄 ============ */
// piles = [3,6,7,11], h = 8 → 最小吃速 k = 4。值域 [1,11],宽度 11 ≤ 20,可读。
// hours(k) = ⌈3/k⌉+⌈6/k⌉+⌈7/k⌉+⌈11/k⌉。probe 依次为 6 → 3 → 4。

const KOKO_FRAMES: RangeFrame[] = [
  {
    lo: 1,
    hi: 11,
    msg: (
      <>
        候选吃速 1~11 根/时(11 是最大的一堆)。核心洞察:速度越快 → 用时越少 →
        越容易吃完 —— 这是一条<b>单调</b>的判定线,于是能二分。
      </>
    ),
  },
  {
    lo: 1,
    hi: 11,
    probe: 6,
    verdict: "ok",
    msg: (
      <>
        试 k=6:各堆用时 ⌈3/6⌉+⌈6/6⌉+⌈7/6⌉+⌈11/6⌉ = 1+1+2+2 = <b>6</b> ≤ 8,吃得完 ✓。
        那答案 ≤ 6 —— 比 6 更快的速度都不必看了,收左半。
      </>
    ),
  },
  {
    lo: 1,
    hi: 5,
    probe: 3,
    verdict: "no",
    msg: (
      <>
        试 k=3:1+2+3+4 = <b>10</b> &gt; 8,吃不完 ✗。k=3 及更慢的全部淘汰,lo = 4。
      </>
    ),
  },
  {
    lo: 4,
    hi: 5,
    probe: 4,
    verdict: "ok",
    msg: (
      <>
        试 k=4:1+2+2+3 = <b>8</b> ≤ 8,刚好吃完 ✓!答案 ≤ 4,继续往左收(hi = 3)。
      </>
    ),
  },
  {
    lo: 4,
    hi: 3,
    answer: 4,
    msg: (
      <>
        区间被挤空(lo=4 &gt; hi=3),循环结束,ans 停在最后一次记录的
        <b> k = 4</b> —— 它就是「能在 8 小时吃完」的最小速度。
        全程没有直接算「答案是几」,只反复问「这个速度行不行」—— 这就是二分答案。
      </>
    ),
  },
];

/* ============ 页面 ============ */

const CHIPS = [
  { id: "why", n: "01", label: "模板复盘" },
  { id: "bound", n: "02", label: "找边界" },
  { id: "rotate", n: "03", label: "二段性 · 旋转" },
  { id: "peak", n: "04", label: "峰值与矩阵" },
  { id: "answer", n: "05", label: "二分答案" },
  { id: "answer2", n: "06", label: "答案二分续" },
  { id: "problems", n: "07", label: "高频题单" },
  { id: "quiz", n: "08", label: "通关测验" },
];

export default function BinaryChapter() {
  return (
    <main className="page" data-ch="binary">
      <Hero
        ch="binary"
        title={
          <>
            二分进阶 <span className="grad">Binary Search+</span>
          </>
        }
        essence={
          <>
            很多人以为二分只会「在有序数组里找一个数」。其实它的真身是一句话:
            <strong>只要答案有单调性,就能把「找答案」变成「猜大小」</strong>。
            本章从统一模板出发,一路走到找边界、旋转数组、峰值,最后抵达全章重头戏 ——
            <strong>二分答案</strong>:把一道求最优值的难题,翻译成一连串是非判断。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 模板复盘 ================= */}
      <Section
        id="why"
        index="01"
        title="先把地基夯平:一个模板,三个死因"
        desc="二分难的从来不是思路,是边界 —— 先立一套永不死循环的写法"
      >
        <div className="prose">
          <p>
            二分查找(binary search)的思路一句话讲完:在一个有序序列里,
            每次拿<strong>正中间</strong>的元素和目标比一下,就能判断答案在左半还是右半,
            于是一刀砍掉一半候选。100 个数最多问 7 次(⌈log₂100⌉),
            10 亿个数也不过 30 次 —— 先亲手感受这份「砍半」的威力:
          </p>
        </div>
        <GuessLab />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            道理谁都懂,可真上手写,十个人有九个写出<strong>死循环</strong>或
            <strong>差一错误(off-by-one)</strong>。这不是你笨 ——
            计算机科学家 Jon Bentley 在《编程珠玑》里报告:他给上百位职业程序员几个小时,
            <strong>能写出完全正确二分的还不到一成</strong>。所以我们不靠感觉,
            靠一套「三要素对齐」的固定模板。先看最基础的精确查找(LC 704):
          </p>
        </div>
        <CodeTabs
          title="lc704_binary_search"
          java={{
            code: `class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;    // 闭区间 [lo, hi]
        while (lo <= hi) {                   // 区间非空:lo == hi 时还有一个要查
            int mid = lo + (hi - lo) / 2;    // 防溢出:不写 (lo + hi) / 2
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) lo = mid + 1;  // 答案在右半
            else hi = mid - 1;                           // 答案在左半
        }
        return -1;                           // 区间空了 = 没找到
    }
}`,
            hl: [4, 5],
            note: (
              <>
                <b>坑(mid 溢出):</b>当 lo、hi 接近 <code>Integer.MAX_VALUE</code> 时,
                <code>(lo + hi)</code> 会溢出成负数,mid 变成非法下标 ——
                这是 JDK 二分里潜伏了九年的真实 bug。<code>lo + (hi - lo) / 2</code> 恒等价又安全。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1            # 闭区间 [lo, hi]
        while lo <= hi:
            mid = lo + (hi - lo) // 2        # // 向下取整
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                lo = mid + 1                 # 答案在右半
            else:
                hi = mid - 1                 # 答案在左半
        return -1`,
            hl: [4, 5],
            note: (
              <>
                <b>省心处:</b>Python 整数是无限精度,<code>lo + hi</code> 不会溢出,
                写 <code>(lo + hi) // 2</code> 也安全。但跨语言保持 <code>lo + (hi - lo) // 2</code>{" "}
                这个习惯,换到 Java / C++ 就不会翻车。
              </>
            ),
          }}
          js={{
            code: `var search = function (nums, target) {
  let lo = 0, hi = nums.length - 1;          // 闭区间 [lo, hi]
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) lo = mid + 1;  // 答案在右半
    else hi = mid - 1;                           // 答案在左半
  }
  return -1;
};`,
            hl: [4, 5],
            note: (
              <>
                <b>别用位运算 <code>(lo + hi) &gt;&gt; 1</code>:</b>JS 的 <code>&gt;&gt;</code>{" "}
                会把数强转成 32 位整数 —— 在「二分答案」里值域可能超过 2³¹,
                一转就出错。老实用 <code>Math.floor((hi - lo) / 2)</code> 最稳。
              </>
            ),
          }}
        />
        <div className="grid-3 bin-tri" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">死因 01</div>
            <div className="card-title">📐 区间定义与循环条件不一致</div>
            <p>
              选了闭区间 <code>[lo, hi]</code>,while 就必须是 <code>lo &lt;= hi</code>
              (lo==hi 时区间里还有一个数)。用 <code>lo &lt; hi</code> 会漏查最后一个。
              开区间另有一套写法 —— <b>选一种,全程一致</b>。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">死因 02</div>
            <div className="card-title">🧮 mid 溢出</div>
            <p>
              <code>(lo + hi) / 2</code> 在定长整型里可能溢出。永远写
              <code>lo + (hi - lo) / 2</code> —— 差值减半再加回,结果一样,却绝不越界。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">死因 03</div>
            <div className="card-title">🔁 边界没挪动</div>
            <p>
              每轮 lo 或 hi <b>必须朝中间挪至少一格</b>(mid±1)。若写成
              <code>lo = mid</code> 而 mid 恰等于 lo,区间不缩小 → 死循环。闭区间下就该 mid±1。
            </p>
          </div>
        </div>
        <Callout tone="story" title="那个藏了九年的 bug">
          <p>
            2006 年,Java 之父之一 Joshua Bloch 发了篇著名博客
            《Extra, Extra - Read All About It: Nearly All Binary Searches Are Broken》。
            他指出:<code>java.util.Arrays.binarySearch</code> 里用的
            <code>(low + high) / 2</code>,当数组够大时 low+high 会溢出 ——
            这段代码<b>自 JDK 诞生起错了九年</b>,还被无数教科书照抄。
            修复只有一行:改成 <code>low + (high - low) / 2</code>。
            二分的魔鬼,永远在边界里。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 找边界 + 精讲 A ================= */}
      <Section
        id="bound"
        index="02"
        title="找边界:lower_bound 与 upper_bound"
        desc="精讲 A · LC 34 —— 有重复元素时,「第一个」和「最后一个」在哪"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            精确查找有个软肋:数组里有<strong>重复元素</strong>时,它随便返回一个匹配下标 ——
            但很多题要的是「第一个」或「最后一个」。这就要升级到<strong>找边界</strong>。
            两把最有用的尺子:
          </p>
          <p>
            <strong>lower_bound(target)</strong> = 第一个 <strong>≥ target</strong> 的下标;
            <strong> upper_bound(target)</strong> = 第一个 <strong>&gt; target</strong> 的下标。
            它俩只差一个等号,却能拼出几乎所有边界问题。本章统一用一个好记的写法:
            <strong>闭区间 + 一个 ans 变量记候选</strong> —— 满足条件就先把当前 mid 记下来,
            <strong>再往想要的方向继续挤</strong>,循环结束 ans 就是答案。
          </p>
          <p>
            <b>题意(LC 34):</b>在升序数组里找 target 的<strong>起始和结束下标</strong>,
            不存在返回 [−1, −1]。<b> 暴力:</b>找到一个后向左右线性扩张 ——
            全是 target 时退化到 O(n),白瞎了有序性。<b> 正解:</b>
            左边界 = lower_bound(target);右边界 = 「第一个 &gt; target」再退一格。逐帧看:
          </p>
        </div>
        <BoundaryStepper />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            注意动画里的巧思:「第一个 &gt; 8」等价于「第一个 ≥ 9」,
            即 <code>upper_bound(t) = lower_bound(t + 1)</code> —— 于是只需写一个
            lower_bound 函数,喂 target 得左界、喂 target+1 减一得右界:
          </p>
        </div>
        <CodeTabs
          title="lc34_search_range"
          java={{
            code: `class Solution {
    public int[] searchRange(int[] nums, int target) {
        int left = lowerBound(nums, target);           // 第一个 >= target
        if (left == nums.length || nums[left] != target)
            return new int[]{-1, -1};                   // target 根本不存在
        int right = lowerBound(nums, target + 1) - 1;   // (第一个 > target) 再退一格
        return new int[]{left, right};
    }

    // 第一个 >= t 的下标;不存在则返回 nums.length
    private int lowerBound(int[] nums, int t) {
        int lo = 0, hi = nums.length - 1, ans = nums.length;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] >= t) { ans = mid; hi = mid - 1; } // 记候选,继续往左挤
            else lo = mid + 1;
        }
        return ans;
    }
}`,
            hl: [6, 15],
            note: (
              <>
                <b>核心心法:</b><code>ans = mid; hi = mid - 1;</code> ——
                「满足就记下、再往左找更早的」。想找最右就反过来往右挤。整章的找边界都用这一招。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def searchRange(self, nums: list[int], target: int) -> list[int]:
        def lower(t: int) -> int:               # 第一个 >= t 的下标
            lo, hi, ans = 0, len(nums) - 1, len(nums)
            while lo <= hi:
                mid = lo + (hi - lo) // 2
                if nums[mid] >= t:
                    ans, hi = mid, mid - 1      # 记候选,再往左挤
                else:
                    lo = mid + 1
            return ans

        left = lower(target)
        if left == len(nums) or nums[left] != target:
            return [-1, -1]
        return [left, lower(target + 1) - 1]    # upper_bound = lower_bound(t + 1)`,
            hl: [8, 16],
            note: (
              <>
                <b>标准库彩蛋:</b>Python 的 <code>bisect_left</code> 就是 lower_bound、
                <code>bisect_right</code> 就是 upper_bound。面试想秒杀可直接调,
                但手写一遍才真懂边界。
              </>
            ),
          }}
          js={{
            code: `var searchRange = function (nums, target) {
  const lower = (t) => {                        // 第一个 >= t 的下标
    let lo = 0, hi = nums.length - 1, ans = nums.length;
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (nums[mid] >= t) { ans = mid; hi = mid - 1; } // 记候选,继续左探
      else lo = mid + 1;
    }
    return ans;
  };
  const left = lower(target);
  if (left === nums.length || nums[left] !== target) return [-1, -1];
  return [left, lower(target + 1) - 1];         // upper = lower(t + 1)
};`,
            hl: [6, 13],
            note: (
              <>
                <b>细节:</b>先判 <code>left === nums.length</code> 再访问
                <code>nums[left]</code>,顺序不能反 —— 否则越界。&& 的短路正好保护了这一点。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            两次二分,时间 <b>O(log n)</b>、空间 <b>O(1)</b>。高频追问:①「只用一个函数怎么同时拿左右界?」
            → 就是上面的 <code>lower_bound(t)</code> 与 <code>lower_bound(t+1)-1</code>;
            ②「target 出现几次?」→ 右界 − 左界 + 1,或直接 upper_bound − lower_bound;
            ③「LC 35 搜索插入位置怎么做?」→ 答案就是 lower_bound(target),
            连「是否存在」都不用判 —— 找边界模板的一鱼多吃。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 二段性 · 旋转数组 + 精讲 B ================= */}
      <Section
        id="rotate"
        index="03"
        title="二段性:二分真正的前提"
        desc="精讲 B · LC 33 —— 数组被转乱了,凭什么还能砍半"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            现在戳破一个误解:<strong>二分的前提从来不是「数组有序」</strong>。
            真正的前提是 —— <strong>你能 O(1) 判断出「答案在左半还是右半」</strong>。
            这个「可判断的分界」,就叫<strong>二段性(binary property)</strong>:
            整个区间能按某个标准一分为二,一半全「否」、一半全「是」。
            有序只是二段性最常见的一种来源,不是唯一。
          </p>
          <p>
            <b>题意(LC 33):</b>一个升序数组被<strong>旋转</strong>过(如 [0,1,2,4,5,6,7]
            转成 [4,5,6,7,0,1,2]),在里面找 target,返回下标。数组整体不再有序,
            精确二分直接失效。<b> 关键观察:</b>无论从哪切一刀,
            <strong>左右两半里至少有一半是完全有序的</strong> ——
            因为断崖只有一个。只要判断出哪半有序、target 在不在那个有序半里,就能安全砍掉一半:
          </p>
        </div>
        <RotatedStepper />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            判据很简单:<code>nums[lo] &lt;= nums[mid]</code> ⇒ 左半 [lo, mid] 有序;
            否则右半 [mid, hi] 有序。然后在<strong>那个有序半</strong>里用大小比较判断
            target 在不在,决定收哪边 —— 有序半里判断范围是可靠的,乱的那半留到下轮再说:
          </p>
        </div>
        <CodeTabs
          title="lc33_search_rotated"
          java={{
            code: `class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {                 // 左半 [lo, mid] 有序
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; // 落在有序左半
                else lo = mid + 1;
            } else {                                     // 右半 [mid, hi] 有序
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; // 落在有序右半
                else hi = mid - 1;
            }
        }
        return -1;
    }
}`,
            hl: [7, 11],
            note: (
              <>
                <b>坑:</b>判有序用的是 <code>nums[lo] &lt;= nums[mid]</code>(带等号)——
                当区间只剩两个元素、mid==lo 时,等号保证「左半有序」成立,不会漏判。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if nums[mid] == target:
                return mid
            if nums[lo] <= nums[mid]:                 # 左半有序
                if nums[lo] <= target < nums[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:                                     # 右半有序
                if nums[mid] < target <= nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
        return -1`,
            hl: [8, 14],
            note: (
              <>
                <b>爽点:</b>Python 的链式比较 <code>nums[lo] &lt;= target &lt; nums[mid]</code>
                {" "}直接照抄数学区间写法,可读性拉满,也不会写错方向。
              </>
            ),
          }}
          js={{
            code: `var search = function (nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {                    // 左半有序
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {                                        // 右半有序
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
};`,
            hl: [6, 10],
            note: (
              <>
                <b>提醒:</b>JS 没有链式比较,<code>a &lt; b &lt; c</code> 会先算
                <code>a &lt; b</code> 得布尔再和 c 比 —— 大错。必须拆成
                <code>a &lt; b && b &lt; c</code>。
              </>
            ),
          }}
        />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">变式 01 · LC 153</div>
            <div className="card-title">🔻 找旋转最小值</div>
            <p>
              拿 <code>nums[mid]</code> 和<b>右端点</b> <code>nums[hi]</code> 比:
              大于 hi 说明最小值在右(lo=mid+1),否则 hi=mid。收敛到单点即最小。
              和 a[lo] 比会在「没旋转」时误判 —— 细节是灵魂。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">变式 02 · LC 81</div>
            <div className="card-title">⚠️ 重复元素来捣乱</div>
            <p>
              当 <code>a[lo]==a[mid]==a[hi]</code>(如 [1,1,0,1,1]),
              哪半有序都说不准 —— 二段性被击穿,只能 <code>lo++, hi--</code> 各缩一格,
              最坏退化到 <BigO o="n" />。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">变式 03 · LC 154</div>
            <div className="card-title">🔻⚠️ 最小值 + 重复</div>
            <p>
              153 的重复版:<code>a[mid]==a[hi]</code> 时无法判断,只能 <code>hi--</code>
              保守收缩,最坏 <BigO o="n" />。它和 81 是「重复破坏二段性」的一对孪生反例。
            </p>
          </div>
        </div>
        <Callout tone="warn" title="为什么 81 / 154 会退化,153 却不会">
          <p>
            无重复时,<code>a[lo]</code> 和 <code>a[mid]</code> 永远能比出大小,
            二段性铁打不动 → 稳稳 O(log n)。一旦允许重复,
            <code>a[lo]==a[mid]</code> 就无法区分「左半平坦有序」和「断崖恰好被重复值盖住」两种局面,
            只好放弃这一步的砍半、退回线性挪一格。<strong>重复元素是二分的天敌</strong> ——
            记住这条,面试被追问「有重复怎么办」时就能答到点子上。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 峰值与矩阵 ================= */}
      <Section
        id="peak"
        index="04"
        title="峰值与矩阵:二段性的两次变形"
        desc="不靠「有序」也能砍半:靠爬坡方向,靠行列的单调"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意(LC 162 寻找峰值):</b>数组里找<strong>任意一个</strong>峰值
            (比左右邻居都大),相邻元素不相等,可认为两端外侧是 −∞。数组毫无有序性,
            但<strong>爬坡方向</strong>提供了二段性:若 <code>nums[mid] &lt; nums[mid+1]</code>,
            说明此刻在上坡 —— 右边<strong>一定</strong>存在一个峰(一直升总要有个顶);
            否则峰在 mid 或其左侧。于是照着「往高处走」就能砍半:
          </p>
        </div>
        <CodeTabs
          title="lc162_find_peak"
          java={{
            code: `class Solution {
    public int findPeakElement(int[] nums) {
        int lo = 0, hi = nums.length - 1;   // 闭区间,但这次收敛到单点
        while (lo < hi) {                   // 注意是 < :最后 lo == hi 即峰
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] < nums[mid + 1]) lo = mid + 1; // 右邻更高,峰在右
            else hi = mid;                               // 否则峰在 mid 或左(mid 不能丢)
        }
        return lo;
    }
}`,
            hl: [4, 6],
            note: (
              <>
                <b>收敛型模板:</b>目标不是「精确命中某个值」而是「挤到唯一幸存者」——
                所以 <code>while (lo &lt; hi)</code> + 一边 <code>mid+1</code> 一边
                <code>mid</code>(不能 mid−1,mid 可能就是峰),最后返回 lo。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def findPeakElement(self, nums: list[int]) -> int:
        lo, hi = 0, len(nums) - 1           # 收敛到单点
        while lo < hi:
            mid = lo + (hi - lo) // 2
            if nums[mid] < nums[mid + 1]:
                lo = mid + 1                # 右邻更高,峰在右
            else:
                hi = mid                    # 否则峰在 mid 或左
        return lo`,
            hl: [4, 6],
            note: (
              <>
                <b>为什么不会越界:</b><code>while lo &lt; hi</code> 保证 mid &lt; hi,
                所以 <code>mid + 1</code> 一定合法,不会摸到数组外。
              </>
            ),
          }}
          js={{
            code: `var findPeakElement = function (nums) {
  let lo = 0, hi = nums.length - 1;         // 收敛到单点
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] < nums[mid + 1]) lo = mid + 1; // 峰在右
    else hi = mid;                               // 峰在 mid 或左
  }
  return lo;
};`,
            hl: [3, 5],
            note: (
              <>
                <b>孪生题 LC 852:</b>山脉数组(先严格升后严格降)求峰顶,
                <b>代码一字不改</b> —— 852 只是保证唯一峰,162 允许多峰但只要任一峰。
              </>
            ),
          }}
        />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            再看二维。矩阵搜索有两种<strong>本质不同</strong>的题型,区别只在「有序到什么程度」:
          </p>
        </div>
        <div className="bin-duel">
          <div className="card">
            <div className="card-kicker">LC 74 · 全局有序</div>
            <div className="card-title">
              <b className="mono">拉直成一维,直接二分</b>
            </div>
            <p>
              每行递增,且<b>下一行开头 &gt; 上一行结尾</b> —— 把 m×n 逐行接起来就是一条严格递增的数组。
              在 [0, mn−1] 上二分,用 <code>mid/n</code>、<code>mid%n</code> 把一维下标还原成行列。
              <BigO o="logn" label="O(log mn)" />。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">LC 240 · 局部有序</div>
            <div className="card-title">
              <b className="mono">从右上角走阶梯</b>
            </div>
            <p>
              只保证<b>行内、列内</b>各自递增,行间不衔接 —— 拉直后并不有序,不能整体二分。
              站在<b>右上角</b>:比目标大就左移(排掉一列),小就下移(排掉一行),
              每步砍掉一整行或列,<BigO o="n" label="O(m + n)" />。
            </p>
          </div>
        </div>
        <CodeTabs
          title="lc74_search_matrix"
          java={{
            code: `class Solution {
    // LC 74:全局有序 —— 把矩阵当一维数组二分
    public boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length, n = matrix[0].length;
        int lo = 0, hi = m * n - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int val = matrix[mid / n][mid % n];  // 一维下标 → 二维坐标
            if (val == target) return true;
            else if (val < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return false;
    }
}`,
            hl: [8],
            note: (
              <>
                <b>关键换算:</b>第 mid 个元素在第 <code>mid / n</code> 行、
                第 <code>mid % n</code> 列(n 是列数)。别把行数列数搞反。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    # LC 74:全局有序 —— 整个矩阵视作一条有序数组
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        lo, hi = 0, m * n - 1
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            val = matrix[mid // n][mid % n]      # 展平下标还原成行列
            if val == target:
                return True
            elif val < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return False`,
            hl: [8],
            note: (
              <>
                <b>对照 240:</b>若矩阵只是「行列各自有序」,这段就会漏解 ——
                因为拉直后不是单调序列。判断题型再选模板,别背串了。
              </>
            ),
          }}
          js={{
            code: `var searchMatrix = function (matrix, target) {
  // LC 74:全局有序 —— 拉平成一维再二分
  const m = matrix.length, n = matrix[0].length;
  let lo = 0, hi = m * n - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const val = matrix[Math.floor(mid / n)][mid % n];
    if (val === target) return true;
    else if (val < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
};`,
            hl: [7],
            note: (
              <>
                <b>细节:</b>JS 里行号要 <code>Math.floor(mid / n)</code> ——
                <code>/</code> 是浮点除法,不取整会得到非法下标(<code>arr[1.5]</code> = undefined)。
              </>
            ),
          }}
        />
        <CodeTabs
          title="lc240_search_matrix_ii"
          java={{
            code: `class Solution {
    // LC 240:局部有序 —— 从右上角阶梯排除
    public boolean searchMatrix(int[][] matrix, int target) {
        int r = 0, c = matrix[0].length - 1;      // 起点:右上角
        while (r < matrix.length && c >= 0) {
            int val = matrix[r][c];
            if (val == target) return true;
            else if (val > target) c--;           // 太大 → 排掉这一列,左移
            else r++;                             // 太小 → 排掉这一行,下移
        }
        return false;
    }
}`,
            hl: [4, 8, 9],
            note: (
              <>
                <b>为什么右上角:</b>那里是「本行最大、本列最小」的独特角 ——
                一次比较就能确定该排掉整行还是整列。左下角同理(对称)。左上/右下角则不行。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    # LC 240:局部有序 —— 右上角阶梯排除
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        r, c = 0, len(matrix[0]) - 1              # 右上角
        while r < len(matrix) and c >= 0:
            val = matrix[r][c]
            if val == target:
                return True
            elif val > target:
                c -= 1                            # 排掉一整列
            else:
                r += 1                            # 排掉一整行
        return False`,
            hl: [4, 9, 11],
            note: (
              <>
                <b>直觉:</b>把它想成在一棵「隐形的二叉搜索树」上走 —— 右上角是根,
                左是更小、下是更大,每步走一条边,故 O(m + n)。
              </>
            ),
          }}
          js={{
            code: `var searchMatrix = function (matrix, target) {
  // LC 240:局部有序 —— 右上角阶梯排除
  let r = 0, c = matrix[0].length - 1;           // 右上角
  while (r < matrix.length && c >= 0) {
    const val = matrix[r][c];
    if (val === target) return true;
    else if (val > target) c--;                  // 左移一列
    else r++;                                     // 下移一行
  }
  return false;
};`,
            hl: [4, 7, 8],
            note: (
              <>
                <b>复杂度:</b>r 只增、c 只减,各自最多走 m、n 步 → <BigO o="n" label="O(m + n)" />,
                比逐行二分 O(m log n) 更好也更短。
              </>
            ),
          }}
        />
      </Section>

      {/* ================= §05 二分答案 + 精讲 C ================= */}
      <Section
        id="answer"
        index="05"
        title="二分答案:本章的思维跃迁"
        desc="精讲 C · LC 875 吃香蕉 —— 求解太难,就改成一连串「行不行」"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            前面二分的都是「数组下标」。现在来一次真正的升级:
            <strong>二分的对象可以是「答案本身」</strong>。核心跃迁只有一句 ——
            <strong>当「直接求最优答案」很难,但「验证某个候选答案行不行」很容易时,
            就去二分答案</strong>。前提是这个「行不行」随答案单调变化:
            一旦某个值可行,比它更宽松的值全都可行。画出来就是一条 F…F | T…T 的分界线:
          </p>
        </div>
        <div className="bin-ft" aria-hidden>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((k) => {
            const ok = k >= 4;
            return (
              <div
                key={k}
                className="bin-ft-cell"
                data-v={ok ? "T" : "F"}
                data-first={k === 4 ? "1" : undefined}
              >
                <span className="bin-ft-k">k={k}</span>
                <span className="bin-ft-v">{ok ? "可行 ✓" : "不可行 ✗"}</span>
              </div>
            );
          })}
        </div>
        <div className="prose">
          <p>
            找的就是那个<strong>被高亮的分界点</strong>(第一个「可行」)。这不就是 §02 的
            lower_bound 吗?只不过判断标准从「和 target 比大小」换成了一个自己写的
            <strong>判定函数(judge / check)</strong>。
          </p>
          <p>
            <b>题意(LC 875):</b>珂珂有几堆香蕉 <code>piles</code>,警卫 <code>h</code> 小时后回来。
            她每小时挑一堆吃,速度 k 根/时(一堆吃不完这一小时也不换堆)。求
            <strong>能在 h 小时内吃完的最小速度 k</strong>。
            <b> 暴力:</b>从 k=1 试到 k=max,第一个够快的就是答案 —— O(max × n),max 可达 10⁹,超时。
            <b> 为什么能二分:</b>速度越快,总用时越少(单调!)——
            所以「k 能不能 h 小时吃完」是一条 F…F T…T 的线。judge(k) = Σ⌈pile/k⌉ ≤ h,
            在值域 [1, max(piles)] 上找第一个可行的 k:
          </p>
        </div>
        <RangeShrink
          title="LC 875 · 在吃速值域 [1,11] 上二分(piles=[3,6,7,11], h=8)"
          min={1}
          max={11}
          frames={KOKO_FRAMES}
          unit="根/小时"
        />
        <CodeTabs
          title="lc875_koko_eating_bananas"
          java={{
            code: `class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int lo = 1, hi = 0;
        for (int p : piles) hi = Math.max(hi, p);   // 值域 [1, 最大的一堆]
        int ans = hi;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;           // 试探速度 mid
            if (canFinish(piles, h, mid)) {         // 判定:吃得完吗?
                ans = mid; hi = mid - 1;            // 可行 → 试试更慢的
            } else {
                lo = mid + 1;                       // 太慢 → 必须更快
            }
        }
        return ans;
    }

    private boolean canFinish(int[] piles, int h, int k) {
        long hours = 0;
        for (int p : piles) hours += (p + k - 1) / k; // ⌈p/k⌉ 的整数写法
        return hours <= h;
    }
}`,
            hl: [8, 9, 18],
            note: (
              <>
                <b>两个坑:</b>①<code>⌈p/k⌉</code> 用 <code>(p+k-1)/k</code> 避免浮点误差;
                ②<code>hours</code> 用 <code>long</code> —— piles 很多时求和可能超 int。
                结构和 §02 找边界一模一样:只是把 <code>nums[mid]&gt;=t</code> 换成
                <code>canFinish(mid)</code>。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def minEatingSpeed(self, piles: list[int], h: int) -> int:
        def can(k: int) -> bool:                   # 速度 k 能否 h 小时吃完
            return sum((p + k - 1) // k for p in piles) <= h

        lo, hi, ans = 1, max(piles), max(piles)
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if can(mid):
                ans, hi = mid, mid - 1             # 可行,再压低速度
            else:
                lo = mid + 1                       # 不可行,提速
        return ans`,
            hl: [3, 9, 10],
            note: (
              <>
                <b>可读写法:</b><code>-(-p // k)</code> 或 <code>math.ceil(p / k)</code>
                都能求上取整;<code>(p + k - 1) // k</code> 是纯整数、最稳。
                Python 大整数免溢出,不用担心求和。
              </>
            ),
          }}
          js={{
            code: `var minEatingSpeed = function (piles, h) {
  const can = (k) =>
    piles.reduce((s, p) => s + Math.ceil(p / k), 0) <= h; // 判定函数

  let lo = 1, hi = Math.max(...piles), ans = hi;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (can(mid)) { ans = mid; hi = mid - 1; }   // 可行,试更慢
    else lo = mid + 1;                            // 太慢,提速
  }
  return ans;
};`,
            hl: [2, 8, 9],
            note: (
              <>
                <b>细节:</b><code>Math.ceil(p / k)</code> 在 p、k 都是安全整数时精确;
                值域上界用 <code>Math.max(...piles)</code>。记得别用 <code>&gt;&gt;</code> 求 mid ——
                值域可能很大。
              </>
            ),
          }}
        />
        <Callout tone="deep" title="工程现场:二分答案是资源规划的暗线">
          <p>
            这套「猜答案 + 判定」的思路在真实系统里到处都是:
            <b>压测限流</b>时,用二分找「系统不崩的最大 QPS」;<b>视频码率自适应</b>,
            二分找「不卡顿的最高清晰度」;<b>数据库 / 编译器</b>做代价估算时,
            二分找「满足延迟预算的最小并行度」。共同点都是:直接算最优很难,
            但给定一个配置去<b>验证达不达标</b>很容易 —— 于是在答案空间上二分。
          </p>
        </Callout>
        <Callout tone="win" title="面试话术:二分答案的三连自问">
          <p>
            碰到「最大化最小值 / 最小化最大值 / 求满足条件的极值」,当场这样口述:
            ①<b>「答案的值域是多少?」</b>(定 lo、hi);
            ②<b>「给定一个候选答案 x,能不能 O(n) 判定它可行?」</b>(写 judge);
            ③<b>「可行性随 x 单调吗?」</b>(确认 F…F T…T)。
            三问都点头,就是二分答案 —— 时间 <b>O(n · log(值域))</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 答案二分续 ================= */}
      <Section
        id="answer2"
        index="06"
        title="答案二分续:同一套路的三种脸"
        desc="最大值最小化(1011/410)、最大可行(69/367)—— 换汤不换药"
      >
        <div className="prose">
          <p>
            吃透 875,下面这些题就都是<strong>换皮</strong>。先看「最大值最小化」母题
            <strong> LC 1011 送包裹</strong>:传送带上的包裹必须按<strong>顺序</strong>装船,
            求「D 天内运完」所需的<strong>最小运力</strong>。judge(cap) = 贪心地装,
            装不下就换新的一天,数出总天数 ≤ D 吗?值域下界是<strong>最重的包裹</strong>
            (再小就永远装不上它),上界是<strong>所有重量之和</strong>(一天全运完):
          </p>
        </div>
        <CodeTabs
          title="lc1011_ship_within_days"
          java={{
            code: `class Solution {
    public int shipWithinDays(int[] weights, int days) {
        int lo = 0, sum = 0;
        for (int w : weights) { lo = Math.max(lo, w); sum += w; } // 下界=最重包裹
        int hi = sum, ans = sum;                                  // 上界=总和
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (canShip(weights, days, mid)) { ans = mid; hi = mid - 1; }
            else lo = mid + 1;
        }
        return ans;
    }

    private boolean canShip(int[] weights, int days, int cap) {
        int need = 1, cur = 0;                    // 至少 1 天
        for (int w : weights) {
            if (cur + w > cap) { need++; cur = 0; } // 装不下,开新的一天
            cur += w;
        }
        return need <= days;
    }
}`,
            hl: [4, 8, 15],
            note: (
              <>
                <b>下界不能取 0 或 1:</b>必须是 <code>max(weights)</code> ——
                运力比最重的包裹还小,那件货永远上不了船,judge 会陷入死结。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def shipWithinDays(self, weights: list[int], days: int) -> int:
        def can(cap: int) -> bool:
            need, cur = 1, 0
            for w in weights:
                if cur + w > cap:
                    need, cur = need + 1, 0        # 开新的一天
                cur += w
            return need <= days

        lo, hi = max(weights), sum(weights)       # 值域:最重包裹 ~ 总和
        ans = hi
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if can(mid):
                ans, hi = mid, mid - 1
            else:
                lo = mid + 1
        return ans`,
            hl: [11, 15, 16],
            note: (
              <>
                <b>和 875 对照:</b>结构完全一样 —— 只是 judge 从「按速度算小时」
                变成「按运力算天数」。认出这层同构,一道题的力气能省到十道题上。
              </>
            ),
          }}
          js={{
            code: `var shipWithinDays = function (weights, days) {
  const can = (cap) => {
    let need = 1, cur = 0;
    for (const w of weights) {
      if (cur + w > cap) { need++; cur = 0; }     // 开新的一天
      cur += w;
    }
    return need <= days;
  };

  let lo = Math.max(...weights);
  let hi = weights.reduce((a, b) => a + b, 0);    // 总和
  let ans = hi;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (can(mid)) { ans = mid; hi = mid - 1; }
    else lo = mid + 1;
  }
  return ans;
};`,
            hl: [11, 12, 17],
            note: (
              <>
                <b>孪生题 LC 410 分割数组的最大值:</b>把「D 天」换成「m 段」、
                「运力」换成「每段和的上限」,judge 一字不改 —— 它俩是同一道题,
                410 挂着 hard 的牌子却只有 medium 的难度。
              </>
            ),
          }}
        />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            最后一类是<strong>平方根</strong>(LC 69):求 ⌊√x⌋ = 最大的整数 k 使
            <code>k×k ≤ x</code>。谓词「k×k ≤ x」也是单调的,但这次要找
            <strong>最后一个可行</strong>(最大的 k)—— 于是记候选后往<strong>右</strong>挤
            (<code>lo = mid + 1</code>),和 875 的方向正好相反。这对镜像务必分清:
          </p>
        </div>
        <CodeTabs
          title="lc69_sqrt"
          java={{
            code: `class Solution {
    public int mySqrt(int x) {
        int lo = 0, hi = x, ans = 0;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if ((long) mid * mid <= x) {   // 可行 → 记候选,往大试
                ans = mid; lo = mid + 1;
            } else {
                hi = mid - 1;              // 太大了,往小收
            }
        }
        return ans;
    }
}`,
            hl: [6, 7],
            note: (
              <>
                <b>坑:</b><code>mid * mid</code> 在 int 下会溢出(x 可达 2³¹),
                必须 <code>(long) mid * mid</code>。方向:找最大可行 → <code>lo = mid + 1</code>,
                与 875(找最小可行 → <code>hi = mid - 1</code>)相反。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def mySqrt(self, x: int) -> int:
        lo, hi, ans = 0, x, 0
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if mid * mid <= x:            # 可行 → 记候选,往大试
                ans, lo = mid, mid + 1
            else:
                hi = mid - 1             # 太大,往小收
        return ans`,
            hl: [6, 7],
            note: (
              <>
                <b>无溢出之忧:</b>Python 整数任意精度,<code>mid * mid</code> 随便算。
                <b> 孪生题 LC 367</b>:把 <code>&lt;=</code> 改成精确 <code>==</code> 判断即可,
                找到返回 True。
              </>
            ),
          }}
          js={{
            code: `var mySqrt = function (x) {
  let lo = 0, hi = x, ans = 0;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (mid * mid <= x) { ans = mid; lo = mid + 1; } // 可行,往大试
    else hi = mid - 1;                               // 太大,往小收
  }
  return ans;
};`,
            hl: [5],
            note: (
              <>
                <b>关于溢出:</b>mid 是<b>探测值</b>不是答案 —— 第一轮 mid ≈ x/2,
                <code>mid * mid</code> 可达 10¹⁸,早已越过 JS 的安全整数(2⁵³ ≈ 9×10¹⁵)。
                但双精度的相对误差约 10⁻¹⁶,与 x 差着九个数量级,<b>比较方向不会翻转</b>,
                结果仍然正确。Java / C++ 里 int 会真溢出,必须用 long,或改写成
                <code>mid &lt;= x / mid</code> 绕开乘法。
              </>
            ),
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>模板</th>
                <th>循环条件</th>
                <th>命中/满足时</th>
                <th>返回</th>
                <th>代表题</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>精确查找</b></td>
                <td>lo &lt;= hi</td>
                <td>相等即 return mid</td>
                <td>下标 / −1</td>
                <td>704 · 74</td>
              </tr>
              <tr>
                <td><b>找边界(最小可行)</b></td>
                <td>lo &lt;= hi</td>
                <td>ans=mid; hi=mid−1</td>
                <td>ans</td>
                <td>34 · 35 · 875 · 1011</td>
              </tr>
              <tr>
                <td><b>找边界(最大可行)</b></td>
                <td>lo &lt;= hi</td>
                <td>ans=mid; lo=mid+1</td>
                <td>ans</td>
                <td>69 · 367</td>
              </tr>
              <tr>
                <td><b>收敛型</b></td>
                <td>lo &lt; hi</td>
                <td>一侧 mid+1、一侧 mid</td>
                <td>lo</td>
                <td>153 · 162 · 852</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="idea" title="一张表看懂:普通二分 vs 二分答案">
          <p>
            <b>普通二分</b>在「已经排好的数据」上找位置,值域就是数组下标;
            <b>二分答案</b>在「答案的取值范围」上猜,值域是 [最小可能答案, 最大可能答案],
            数组本身可能根本没排序。判断标准也从「和 target 比大小」升级为
            「一个你自己写的 judge 函数」。想通这层,二分的世界就从「查字典」
            扩张到了「解优化题」。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title="高频题单:二分进阶 18 题"
        desc="按「模板 → 找边界 → 二段性 → 二分答案」分层,由易到难。先想 30 秒再看提示"
        badge={<span className="chip">主线必做</span>}
      >
        <ProblemSet ch="binary" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="8 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="binary" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            二分的真正前提不是「数组有序」,而是<b>能 O(1) 判断答案在哪半</b> ——
            这个可判断的分界,就叫<b>二段性</b>。有序只是它最常见的一种来源。
          </>,
          <>
            统一模板 + 死循环三要素:<b>区间定义与 while 条件一致</b>、
            <b>mid = lo+(hi−lo)/2 防溢出</b>、<b>边界每轮必挪 mid±1</b>。
          </>,
          <>
            找边界 = <b>记候选 ans + 满足就继续往一侧挤</b>。
            lower_bound(第一个 ≥)、upper_bound(第一个 &gt;)是两把尺,
            且 <b>upper_bound(t) = lower_bound(t+1)</b>。
          </>,
          <>
            旋转数组:一刀总有一半有序,判目标在不在有序半;
            <b>重复元素(81/154)会击穿二段性</b>,最坏退化到 O(n)。
          </>,
          <>
            二分答案的思维跃迁:<b>求解太难 ⇒ 改判定</b> —— 若「答案 ≤ x 是否可行」单调
            (F…F T…T),就在<b>值域</b>上二分 + judge。875 / 1011 / 410 是同一套路。
          </>,
          <>
            判定型二分分两个镜像:<b>找「最小可行」</b>(875,hi=mid−1)与
            <b>找「最大可行」</b>(69 平方根,lo=mid+1)—— 方向千万别记反。
          </>,
          <>
            矩阵两条路:<b>全局有序拉直二分</b>(74,O(log mn))、
            <b>局部有序阶梯排除</b>(240,从右上角走 O(m+n))—— 先辨题型再落笔。
          </>,
        ]}
      />

      <ChapterFooter ch="binary" />
    </main>
  );
}
