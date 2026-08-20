"use client";

// 第 3 章 · 二分进阶 —— 八段式结构:
//  §01 模板复盘(区间约定 + 死循环三要素)→ §02 找边界 + 精讲 A(LC 34)→
//  §03 二段性 · 旋转数组 + 精讲 B(LC 33)→ §04 峰值与矩阵(162/852/74/240)→
//  §05 二分答案 + 精讲 C(LC 875 吃香蕉,RangeShrink)→ §06 答案二分续(1011/410/69/367)→
//  §07 题单 → §08 通关测验 → 要点。
// 二分答案主可视化用 lib/algviz 的 RangeShrink(帧写在本文件);
// 找边界 / 旋转数组用 ArrayStepper 自建帧(见 ./viz)。
//
// 双语:正文用 <T en zh />;组件的文案型 props 传 { en, zh }。
// CodeTabs 的 code 也给两份 —— 两份之间只有注释不同,可执行代码逐行一致(hl 行号才对得上)。

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
import { T } from "@/lib/i18n";
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
      <T
        en={
          <>
            The candidate speeds are 1 to 11 bananas per hour. The upper bound is
            11 because 11 is the largest pile: Koko eats from only one pile per
            hour, so any speed above 11 finishes each pile in the same one hour.
            A faster speed never needs more time, so the test &quot;can she
            finish within h hours&quot; is <b>monotonic</b> in k. That is what
            makes binary search valid here.
          </>
        }
        zh={
          <>
            候选吃速 1~11 根/时。上界取 11(最大的一堆):每小时只吃一堆,
            速度超过 11 之后每堆仍然要占满一小时,再快也没有意义。
            速度越快,总用时不会变多 —— 判定「能否在 h 小时内吃完」对 k
            是<b>单调</b>的,于是可以二分。
          </>
        }
      />
    ),
  },
  {
    lo: 1,
    hi: 11,
    probe: 6,
    verdict: "ok",
    msg: (
      <T
        en={
          <>
            Try k = 6. The piles take ⌈3/6⌉+⌈6/6⌉+⌈7/6⌉+⌈11/6⌉ = 1+1+2+2 ={" "}
            <b>6</b> hours, and 6 ≤ 8, so this speed works. Because the test is
            monotonic, every speed above 6 also works. Record 6 as the best
            answer so far, drop the right half, and keep looking for something
            smaller: hi = 5.
          </>
        }
        zh={
          <>
            试 k=6:各堆用时 ⌈3/6⌉+⌈6/6⌉+⌈7/6⌉+⌈11/6⌉ = 1+1+2+2 = <b>6</b> ≤ 8,
            吃得完 ✓。由单调性,比 6 更快的速度也都可行,所以把 6 记为当前最优候选、
            整体丢掉右半,再往更小的方向找:hi = 5。
          </>
        }
      />
    ),
  },
  {
    lo: 1,
    hi: 5,
    probe: 3,
    verdict: "no",
    msg: (
      <T
        en={
          <>
            Try k = 3. The piles take 1+2+3+4 = <b>10</b> hours, and 10 &gt; 8,
            so this speed fails. Every speed below 3 is even slower, so all of
            them fail too. Set lo = 4.
          </>
        }
        zh={
          <>
            试 k=3:1+2+3+4 = <b>10</b> &gt; 8,吃不完 ✗。比 3 更慢的速度更不可行,
            一并淘汰,lo = 4。
          </>
        }
      />
    ),
  },
  {
    lo: 4,
    hi: 5,
    probe: 4,
    verdict: "ok",
    msg: (
      <T
        en={
          <>
            Try k = 4. The piles take 1+2+2+3 = <b>8</b> hours, and 8 ≤ 8, so it
            works with no time to spare. Record 4 as the best answer so far, then
            keep looking for something smaller: hi = 3.
          </>
        }
        zh={
          <>
            试 k=4:1+2+2+3 = <b>8</b> ≤ 8,刚好吃完 ✓。把 4 记为当前最优候选,
            再继续往更小的方向找:hi = 3。
          </>
        }
      />
    ),
  },
  {
    lo: 4,
    hi: 3,
    answer: 4,
    msg: (
      <T
        en={
          <>
            The interval is now empty (lo = 4 &gt; hi = 3), so the loop stops.
            The last recorded candidate is <b>k = 4</b>, the smallest speed that
            finishes within 8 hours. Notice that the code never computed the
            answer directly. It only asked &quot;does this speed work?&quot;
            about four times. That is binary search on the answer.
          </>
        }
        zh={
          <>
            区间被挤空(lo=4 &gt; hi=3),循环结束,ans 停在最后一次记录的
            <b> k = 4</b> —— 它就是「能在 8 小时吃完」的最小速度。
            全程没有直接计算答案,只反复问「这个速度行不行」—— 这就是二分答案。
          </>
        }
      />
    ),
  },
];

/* ============ 页面 ============ */

const CHIPS = [
  { id: "why", n: "01", label: { en: "One template", zh: "模板复盘" } },
  { id: "bound", n: "02", label: { en: "Boundaries", zh: "找边界" } },
  { id: "rotate", n: "03", label: { en: "Rotated arrays", zh: "二段性 · 旋转" } },
  { id: "peak", n: "04", label: { en: "Peaks, matrices", zh: "峰值与矩阵" } },
  { id: "answer", n: "05", label: { en: "Search the answer", zh: "二分答案" } },
  { id: "answer2", n: "06", label: { en: "More answer search", zh: "答案二分续" } },
  { id: "problems", n: "07", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "08", label: { en: "Quiz", zh: "通关测验" } },
];

export default function BinaryChapter() {
  return (
    <main className="page" data-ch="binary">
      <Hero
        ch="binary"
        title={{
          en: (
            <>
              Binary <span className="grad">search+</span>
            </>
          ),
          zh: (
            <>
              二分进阶 <span className="grad">Binary Search+</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              Binary search is usually introduced as &quot;find a value in a
              sorted array&quot;. That is only one case. What the method really
              needs is{" "}
              <strong>
                a yes/no test that flips from false to true exactly once and
                never flips back
              </strong>
              . This chapter starts from one template and one interval
              convention, then works through boundaries, rotated arrays, and
              peaks, and ends at <strong>binary search on the answer</strong>:
              turning a hard optimization problem into a short series of yes/no
              questions.
            </>
          ),
          zh: (
            <>
              二分通常被介绍成「在有序数组里找一个数」,那只是其中一种情形。
              它真正需要的是
              <strong>一个只从「否」翻到「是」一次、之后不再翻回去的判定</strong>。
              本章从一个模板和一套区间约定出发,依次走过找边界、旋转数组、峰值,
              最后抵达<strong>二分答案</strong>:把一道求最优值的难题,
              翻译成一小串是非判断。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 模板复盘 ================= */}
      <Section
        id="why"
        index="01"
        title={{
          en: "One template: name the interval, then derive everything else",
          zh: "先把地基夯平:先定区间,其余全部推导出来",
        }}
        desc={{
          en: "The idea is easy. The boundaries are not. Fix a convention that cannot loop forever.",
          zh: "二分难的从来不是思路,是边界 —— 先立一套永不死循环的写法",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Binary search works on a sorted sequence. Compare the element
                  in the <strong>middle</strong> with the target. That single
                  comparison tells you whether the answer is in the left half or
                  the right half, so half of the candidates disappear at once.
                  100 numbers need at most 7 questions (⌈log₂100⌉), and a billion
                  numbers need 30. Try it yourself first:
                </>
              }
              zh={
                <>
                  二分查找(binary search)作用在一个有序序列上:
                  拿<strong>正中间</strong>的元素和目标比一下,
                  这一次比较就能判断答案在左半还是右半,于是一半候选立刻消失。
                  100 个数最多问 7 次(⌈log₂100⌉),10 亿个数也不过 30 次。
                  先亲手感受一下:
                </>
              }
            />
          </p>
        </div>
        <GuessLab />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  The idea is easy to state and hard to write. Most people
                  produce an <strong>infinite loop</strong> or an{" "}
                  <strong>off-by-one error</strong> on the first attempt. This is
                  well documented: Jon Bentley reported in{" "}
                  <i>Programming Pearls</i> that when he gave professional
                  programmers a couple of hours to write a binary search, fewer
                  than 10 percent produced a correct one. So do not write it from
                  intuition. Write it from a convention.
                </>
              }
              zh={
                <>
                  思路好说,代码难写。第一次动手时,大多数人写出的是
                  <strong>死循环</strong>或<strong>差一错误(off-by-one)</strong>。
                  这一点有据可查:Jon Bentley 在《编程珠玑》里报告过,
                  他给职业程序员几个小时写一个二分查找,
                  <strong>写对的不到一成</strong>。所以不要靠感觉写,要靠约定写。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Start by naming the interval. This chapter uses the{" "}
                  <strong>closed interval [lo, hi]</strong>: both ends are still
                  candidates. The{" "}
                  <strong>
                    invariant is that if target is in the array, its index is
                    inside [lo, hi]
                  </strong>
                  . Everything already discarded has been proved not to be the
                  answer. The loop condition and both updates follow from that
                  one sentence:
                </>
              }
              zh={
                <>
                  第一步是给区间起名。本章统一使用
                  <strong>闭区间 [lo, hi]</strong>:两个端点都还是候选。
                  <strong>
                    不变量是:如果 target 在数组里,它的下标一定在 [lo, hi] 内
                  </strong>
                  。已经丢掉的部分,都是被证明过不可能是答案的。
                  循环条件和两条更新,全都从这一句推导出来:
                </>
              }
            />
          </p>
          <ul>
            <li>
              <T
                en={
                  <>
                    [lo, hi] is non-empty exactly when <code>lo &lt;= hi</code>,
                    so that is the loop condition. When lo == hi there is still
                    one element left to check.
                  </>
                }
                zh={
                  <>
                    [lo, hi] 非空当且仅当 <code>lo &lt;= hi</code>,
                    所以循环条件就是它。lo == hi 时区间里还剩一个元素要查。
                  </>
                }
              />
            </li>
            <li>
              <T
                en={
                  <>
                    If <code>nums[mid] &lt; target</code>, then mid and every
                    index to its left hold values smaller than target. The answer
                    can only be in [mid+1, hi], so <code>lo = mid + 1</code>.
                  </>
                }
                zh={
                  <>
                    若 <code>nums[mid] &lt; target</code>,则 mid 及其左边的值
                    全都小于 target,答案只可能落在 [mid+1, hi],
                    所以 <code>lo = mid + 1</code>。
                  </>
                }
              />
            </li>
            <li>
              <T
                en={
                  <>
                    If <code>nums[mid] &gt; target</code>, the answer can only be
                    in [lo, mid−1], so <code>hi = mid - 1</code>.
                  </>
                }
                zh={
                  <>
                    若 <code>nums[mid] &gt; target</code>,答案只可能落在
                    [lo, mid−1],所以 <code>hi = mid - 1</code>。
                  </>
                }
              />
            </li>
          </ul>
          <p>
            <T
              en={
                <>
                  <b>Why it terminates:</b> mid always lies inside [lo, hi], and
                  both updates step past mid, so each iteration removes at least
                  the element at mid. hi − lo therefore strictly decreases and
                  the interval reaches empty in a finite number of steps. Each
                  iteration also removes about half of what is left, so the loop
                  runs about log₂n times. <b>Time <BigO o="logn" />.</b> The
                  iterative version keeps only two numbers, so extra space is{" "}
                  <BigO o="1" />; written recursively, the call stack is{" "}
                  <BigO o="logn" /> deep.
                </>
              }
              zh={
                <>
                  <b>为什么一定会结束:</b>mid 永远落在 [lo, hi] 内,
                  而两条更新都越过了 mid,所以每一轮至少删掉 mid 这一格,
                  hi − lo 严格变小,有限步内区间必然变空。
                  同时每一轮还砍掉了剩余部分的一半左右,所以循环大约执行 log₂n 次。
                  <b>时间 <BigO o="logn" />。</b>迭代写法只维护两个数,
                  额外空间 <BigO o="1" />;写成递归则调用栈深 <BigO o="logn" />。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  There is a second convention: the{" "}
                  <strong>half-open interval [lo, hi)</strong>, where hi is one
                  position <i>past</i> the last candidate. Derive it the same
                  way. [lo, hi) is non-empty when <code>lo &lt; hi</code>, so the
                  loop is <code>while (lo &lt; hi)</code>. Discarding the right
                  part is <code>hi = mid</code>, not <code>mid - 1</code>,
                  because hi is already outside the interval. Discarding the left
                  part is still <code>lo = mid + 1</code>. Both conventions are
                  correct. <strong>Mixing them is the classic bug</strong> —{" "}
                  <code>while (lo &lt;= hi)</code> together with{" "}
                  <code>hi = mid</code> never ends. Pick one convention and
                  derive the rest from it. Everything below uses the closed
                  interval.
                </>
              }
              zh={
                <>
                  还有第二套约定:<strong>半开区间 [lo, hi)</strong>,
                  其中 hi 指向最后一个候选的<i>下一个</i>位置。推导方式完全一样:
                  [lo, hi) 非空的条件是 <code>lo &lt; hi</code>,所以循环写
                  <code>while (lo &lt; hi)</code>;丢掉右半时写 <code>hi = mid</code>
                  而不是 <code>mid - 1</code>,因为 hi 本来就在区间之外;
                  丢掉左半仍然是 <code>lo = mid + 1</code>。
                  两套约定都对,<strong>把它们混用才是那个经典 bug</strong> ——
                  <code>while (lo &lt;= hi)</code> 配 <code>hi = mid</code> 永远停不下来。
                  选一套,其余全部由它推出。下文一律使用闭区间。
                </>
              }
            />
          </p>
          <p>
            <T
              en={<>Here is the plain exact search (LC 704) written that way:</>}
              zh={<>按这套约定写出的精确查找(LC 704)长这样:</>}
            />
          </p>
        </div>
        <CodeTabs
          title="lc704_binary_search"
          java={{
            code: {
              en: `class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;    // closed interval [lo, hi]
        while (lo <= hi) {                   // non-empty exactly when lo <= hi
            int mid = lo + (hi - lo) / 2;    // safe from overflow
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) lo = mid + 1;  // answer is on the right
            else hi = mid - 1;                          // answer is on the left
        }
        return -1;                           // empty interval = not present
    }
}`,
              zh: `class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;    // 闭区间 [lo, hi]
        while (lo <= hi) {                   // 非空当且仅当 lo <= hi
            int mid = lo + (hi - lo) / 2;    // 防溢出写法
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) lo = mid + 1;  // 答案在右半
            else hi = mid - 1;                          // 答案在左半
        }
        return -1;                           // 区间空了 = 不存在
    }
}`,
            },
            hl: [4, 5],
            note: {
              en: (
                <>
                  <b>Overflow:</b> when lo and hi are both close to{" "}
                  <code>Integer.MAX_VALUE</code>, <code>(lo + hi)</code> wraps
                  around to a negative number and mid becomes an invalid index.
                  This exact bug sat in the JDK for about nine years.{" "}
                  <code>lo + (hi - lo) / 2</code> halves a difference that
                  already fits, so it gives the same value and never leaves
                  [lo, hi].
                </>
              ),
              zh: (
                <>
                  <b>溢出:</b>当 lo、hi 都接近 <code>Integer.MAX_VALUE</code> 时,
                  <code>(lo + hi)</code> 会回绕成负数,mid 变成非法下标 ——
                  这个 bug 在 JDK 里躺了约九年。<code>lo + (hi - lo) / 2</code>{" "}
                  只是把一个本来就装得下的差值减半,结果相同,且永远不会跑出 [lo, hi]。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1            # closed interval [lo, hi]
        while lo <= hi:
            mid = lo + (hi - lo) // 2        # // rounds down
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                lo = mid + 1                 # answer is on the right
            else:
                hi = mid - 1                 # answer is on the left
        return -1`,
              zh: `class Solution:
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
            },
            hl: [4, 5],
            note: {
              en: (
                <>
                  Python integers have arbitrary precision, so{" "}
                  <code>lo + hi</code> cannot overflow and{" "}
                  <code>(lo + hi) // 2</code> is safe here. Keeping the{" "}
                  <code>lo + (hi - lo) // 2</code> habit still pays off, because
                  the same code translated to Java or C++ stays correct.
                </>
              ),
              zh: (
                <>
                  Python 整数是任意精度,<code>lo + hi</code> 不会溢出,
                  在这里写 <code>(lo + hi) // 2</code> 也安全。
                  但保持 <code>lo + (hi - lo) // 2</code> 的习惯仍然值得 ——
                  同一段代码搬到 Java / C++ 也不会出错。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var search = function (nums, target) {
  let lo = 0, hi = nums.length - 1;          // closed interval [lo, hi]
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) lo = mid + 1;  // answer is on the right
    else hi = mid - 1;                          // answer is on the left
  }
  return -1;
};`,
              zh: `var search = function (nums, target) {
  let lo = 0, hi = nums.length - 1;          // 闭区间 [lo, hi]
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) lo = mid + 1;  // 答案在右半
    else hi = mid - 1;                          // 答案在左半
  }
  return -1;
};`,
            },
            hl: [3, 4],
            note: {
              en: (
                <>
                  JavaScript numbers are doubles and represent every integer up
                  to 2⁵³ exactly, so <code>Math.floor((lo + hi) / 2)</code> is
                  also safe. What is not safe is{" "}
                  <code>(lo + hi) &gt;&gt; 1</code>: <code>&gt;&gt;</code>{" "}
                  converts its operands to 32-bit integers first, so it silently
                  gives the wrong answer once the values pass 2³¹. In binary
                  search on the answer the range can be that large, so avoid the
                  bit shift.
                </>
              ),
              zh: (
                <>
                  JavaScript 的数字是双精度浮点,能精确表示 2⁵³ 以内的所有整数,
                  所以 <code>Math.floor((lo + hi) / 2)</code> 同样安全。
                  不安全的是 <code>(lo + hi) &gt;&gt; 1</code>:
                  <code>&gt;&gt;</code> 会先把操作数转成 32 位整数,
                  一旦数值超过 2³¹ 就会悄悄算错。二分答案时值域可能真有这么大,
                  所以别用位移。
                </>
              ),
            },
          }}
        />
        <div className="grid-3 bin-tri" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Failure 01" zh="死因 01" />
            </div>
            <div className="card-title">
              <T
                en="Interval and loop condition disagree"
                zh="区间定义与循环条件不一致"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    With the closed interval <code>[lo, hi]</code> the loop must
                    be <code>lo &lt;= hi</code>, because lo == hi still leaves one
                    element to check. Using <code>lo &lt; hi</code> skips it. The
                    half-open form has its own matching set.{" "}
                    <b>Pick one and stay with it.</b>
                  </>
                }
                zh={
                  <>
                    用闭区间 <code>[lo, hi]</code> 时,循环必须写{" "}
                    <code>lo &lt;= hi</code> —— lo == hi 时区间里还有一个元素没查。
                    写成 <code>lo &lt; hi</code> 就会漏掉它。半开区间另有一套配对写法。
                    <b>选一种,全程一致。</b>
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Failure 02" zh="死因 02" />
            </div>
            <div className="card-title">
              <T en="mid overflows" zh="mid 溢出" />
            </div>
            <p>
              <T
                en={
                  <>
                    In a language with fixed-width integers, such as Java or C++,{" "}
                    <code>(lo + hi) / 2</code> can overflow. Write{" "}
                    <code>lo + (hi - lo) / 2</code>: same value, no overflow.
                    Python integers cannot overflow, and JavaScript numbers are
                    exact up to 2⁵³ — but <code>&gt;&gt;</code> truncates to 32
                    bits there, so do not use it.
                  </>
                }
                zh={
                  <>
                    在 Java / C++ 这类定长整型语言里,<code>(lo + hi) / 2</code>{" "}
                    可能溢出。写 <code>lo + (hi - lo) / 2</code>:取值相同,不会越界。
                    Python 整数不会溢出,JavaScript 在 2⁵³ 以内精确 ——
                    但那里的 <code>&gt;&gt;</code> 会截成 32 位,别用。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Failure 03" zh="死因 03" />
            </div>
            <div className="card-title">
              <T en="The interval stops shrinking" zh="区间不再变小" />
            </div>
            <p>
              <T
                en={
                  <>
                    <code>mid</code> rounds down, so mid == lo whenever hi == lo
                    or hi == lo+1. With <code>while (lo &lt;= hi)</code>,{" "}
                    <code>hi = mid</code> rewrites hi with the value it already
                    had once lo == hi: <b>infinite loop</b>. With{" "}
                    <code>while (lo &lt; hi)</code>, <code>lo = mid</code> does
                    the same once hi == lo+1. Every branch must move past mid.
                  </>
                }
                zh={
                  <>
                    <code>mid</code> 向下取整,所以 hi == lo 或 hi == lo+1 时 mid == lo。
                    在 <code>while (lo &lt;= hi)</code> 下,一旦 lo == hi,
                    <code>hi = mid</code> 只是把 hi 写回原值 —— <b>死循环</b>;
                    在 <code>while (lo &lt; hi)</code> 下,hi == lo+1 时{" "}
                    <code>lo = mid</code> 同理。每个分支都必须越过 mid。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="story"
          title={{
            en: "The bug that hid for nine years",
            zh: "那个藏了九年的 bug",
          }}
        >
          <p>
            <T
              en={
                <>
                  In 2006 Joshua Bloch published{" "}
                  <i>
                    Extra, Extra — Read All About It: Nearly All Binary Searches
                    and Mergesorts Are Broken
                  </i>
                  . He pointed out that{" "}
                  <code>java.util.Arrays.binarySearch</code> computed{" "}
                  <code>(low + high) / 2</code>, which overflows into a negative
                  number once the array is large enough. The code had been
                  shipping for about <b>nine years</b>, and the same line had
                  been copied into many textbooks. The fix was one line:{" "}
                  <code>low + (high - low) / 2</code>. In binary search, the hard
                  part is always the boundaries.
                </>
              }
              zh={
                <>
                  2006 年,Joshua Bloch 发表了
                  《Extra, Extra — Read All About It: Nearly All Binary Searches
                  and Mergesorts Are Broken》。他指出{" "}
                  <code>java.util.Arrays.binarySearch</code> 里算的是{" "}
                  <code>(low + high) / 2</code>,数组一大就会溢出成负数。
                  这段代码已经发布了约<b>九年</b>,同一行还被抄进了许多教科书。
                  修复只有一行:<code>low + (high - low) / 2</code>。
                  二分难的地方,永远是边界。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 找边界 + 精讲 A ================= */}
      <Section
        id="bound"
        index="02"
        title={{
          en: "Boundaries: lower_bound and upper_bound",
          zh: "找边界:lower_bound 与 upper_bound",
        }}
        desc={{
          en: "Worked example A · LC 34 — with duplicates, where do the first and last copies sit?",
          zh: "精讲 A · LC 34 —— 有重复元素时,「第一个」和「最后一个」在哪",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The exact search has a weakness. When the array contains{" "}
                  <strong>duplicates</strong>, it returns whichever matching
                  index it happened to land on. Many problems need the first or
                  the last one instead. Two precise tools cover almost every such
                  question:
                </>
              }
              zh={
                <>
                  精确查找有个软肋:数组里有<strong>重复元素</strong>时,
                  它返回的是碰巧撞上的那个下标。而很多题要的是「第一个」或「最后一个」。
                  两把精确的尺子几乎能覆盖所有这类问题:
                </>
              }
            />
          </p>
          <ul>
            <li>
              <T
                en={
                  <>
                    <strong>lower_bound(t)</strong> is the index of the{" "}
                    <strong>first element ≥ t</strong>. It equals the number of
                    elements smaller than t. If every element is smaller than t,
                    it returns <code>n</code>, the array length — one position
                    past the end.
                  </>
                }
                zh={
                  <>
                    <strong>lower_bound(t)</strong> = <strong>第一个 ≥ t</strong>{" "}
                    的元素下标,也等于「比 t 小的元素个数」。
                    若所有元素都比 t 小,它返回 <code>n</code>(数组长度)——
                    也就是末尾的下一个位置。
                  </>
                }
              />
            </li>
            <li>
              <T
                en={
                  <>
                    <strong>upper_bound(t)</strong> is the index of the{" "}
                    <strong>first element &gt; t</strong>. It equals the number
                    of elements ≤ t. If every element is ≤ t, it also returns{" "}
                    <code>n</code>.
                  </>
                }
                zh={
                  <>
                    <strong>upper_bound(t)</strong> = <strong>第一个 &gt; t</strong>{" "}
                    的元素下标,也等于「≤ t 的元素个数」。
                    若所有元素都 ≤ t,它同样返回 <code>n</code>。
                  </>
                }
              />
            </li>
          </ul>
          <p>
            <T
              en={
                <>
                  Everything else follows. The number of copies of t is{" "}
                  <code>upper_bound(t) − lower_bound(t)</code>; if that is 0, t
                  is absent. The first occurrence is{" "}
                  <code>lower_bound(t)</code>, but only after checking that this
                  index is below n and that the value there really is t. If it
                  is, the last occurrence is <code>upper_bound(t) − 1</code>.
                </>
              }
              zh={
                <>
                  其余问题都由它们导出:t 的出现次数是{" "}
                  <code>upper_bound(t) − lower_bound(t)</code>,为 0 就说明 t 不存在;
                  第一次出现的位置是 <code>lower_bound(t)</code> ——
                  但要先确认这个下标小于 n、且那里的值确实等于 t;
                  确认之后,最后一次出现的位置是 <code>upper_bound(t) − 1</code>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Both are written with one template:{" "}
                  <strong>closed interval plus a candidate variable</strong>.
                  When the test passes, record the current mid in{" "}
                  <code>ans</code>, then keep shrinking toward the side you want.
                  The invariant is: <code>ans</code> is the best index found so
                  far, and any better one is still inside [lo, hi]. Initialize{" "}
                  <code>ans</code> to <code>n</code> so that &quot;nothing
                  matched&quot; comes out correctly.
                </>
              }
              zh={
                <>
                  两者用同一个模板写成:
                  <strong>闭区间 + 一个候选变量</strong>。
                  判定通过就把当前 mid 记进 <code>ans</code>,
                  再朝想要的方向继续挤。不变量是:<code>ans</code>{" "}
                  是目前找到的最好下标,而更好的下标(如果有)一定还在 [lo, hi] 内。
                  <code>ans</code> 初值取 <code>n</code>,「一个都不满足」的情形才会正确。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>LC 34:</b> in a sorted array, return the{" "}
                  <strong>first and last index</strong> of target, or [−1, −1] if
                  it is absent. <b>Brute force:</b> find any match, then walk
                  left and right — that is O(n) when the array is all target, and
                  it wastes the sorted order. <b>Solution:</b> the left end is
                  lower_bound(target); the right end is the first index greater
                  than target, minus one. Step through it:
                </>
              }
              zh={
                <>
                  <b>LC 34:</b>在升序数组里返回 target 的
                  <strong>第一个和最后一个下标</strong>,不存在返回 [−1, −1]。
                  <b> 暴力:</b>先找到任意一个匹配,再向左右线性扩张 ——
                  全是 target 时退化到 O(n),也白白浪费了有序性。
                  <b> 正解:</b>左边界 = lower_bound(target);
                  右边界 = 「第一个大于 target 的下标」再退一格。逐帧看:
                </>
              }
            />
          </p>
        </div>
        <BoundaryStepper />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  Note the shortcut in the animation. &quot;First index &gt;
                  8&quot; is the same position as &quot;first index ≥ 9&quot;, so{" "}
                  <code>upper_bound(t) = lower_bound(t + 1)</code>. That rewrite
                  is only valid because the values are{" "}
                  <strong>integers</strong>, where t + 1 is the next possible
                  value; on floating-point data you would need a real
                  upper_bound. With integers, one lower_bound function produces
                  both ends:
                </>
              }
              zh={
                <>
                  注意动画里的巧思:「第一个 &gt; 8」和「第一个 ≥ 9」是同一个位置,
                  所以 <code>upper_bound(t) = lower_bound(t + 1)</code>。
                  这个改写成立,是因为元素是<strong>整数</strong> ——
                  t + 1 恰好是「下一个可能取值」;换成浮点数据就必须真写一个 upper_bound。
                  在整数上,一个 lower_bound 函数就能给出两个边界:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc34_search_range"
          java={{
            code: {
              en: `class Solution {
    public int[] searchRange(int[] nums, int target) {
        int left = lowerBound(nums, target);           // first index >= target
        if (left == nums.length || nums[left] != target)
            return new int[]{-1, -1};                   // target is not present
        int right = lowerBound(nums, target + 1) - 1;   // (first index > target) minus one
        return new int[]{left, right};
    }

    // first index with nums[i] >= t; returns nums.length if there is none
    private int lowerBound(int[] nums, int t) {
        int lo = 0, hi = nums.length - 1, ans = nums.length;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] >= t) { ans = mid; hi = mid - 1; } // record, then look further left
            else lo = mid + 1;
        }
        return ans;
    }
}`,
              zh: `class Solution {
    public int[] searchRange(int[] nums, int target) {
        int left = lowerBound(nums, target);           // 第一个 >= target
        if (left == nums.length || nums[left] != target)
            return new int[]{-1, -1};                   // target 不存在
        int right = lowerBound(nums, target + 1) - 1;   // (第一个 > target) 再退一格
        return new int[]{left, right};
    }

    // 第一个满足 nums[i] >= t 的下标;不存在则返回 nums.length
    private int lowerBound(int[] nums, int t) {
        int lo = 0, hi = nums.length - 1, ans = nums.length;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] >= t) { ans = mid; hi = mid - 1; } // 记候选,再往左找
            else lo = mid + 1;
        }
        return ans;
    }
}`,
            },
            hl: [6, 15],
            note: {
              en: (
                <>
                  <b>The core move:</b> <code>ans = mid; hi = mid - 1;</code> —
                  record the candidate, then keep pushing left for an earlier
                  one. To find the last matching index instead, record and push
                  right. Every boundary search in this chapter is one of those
                  two.
                </>
              ),
              zh: (
                <>
                  <b>核心动作:</b><code>ans = mid; hi = mid - 1;</code> ——
                  记下候选,再往左找更早的。想找最后一个满足的下标,就记下候选后往右挤。
                  本章所有找边界的写法,都是这两者之一。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def searchRange(self, nums: list[int], target: int) -> list[int]:
        def lower(t: int) -> int:               # first index with nums[i] >= t
            lo, hi, ans = 0, len(nums) - 1, len(nums)
            while lo <= hi:
                mid = lo + (hi - lo) // 2
                if nums[mid] >= t:
                    ans, hi = mid, mid - 1      # record, then look further left
                else:
                    lo = mid + 1
            return ans

        left = lower(target)
        if left == len(nums) or nums[left] != target:
            return [-1, -1]
        return [left, lower(target + 1) - 1]    # upper_bound = lower_bound(t + 1)`,
              zh: `class Solution:
    def searchRange(self, nums: list[int], target: int) -> list[int]:
        def lower(t: int) -> int:               # 第一个满足 nums[i] >= t 的下标
            lo, hi, ans = 0, len(nums) - 1, len(nums)
            while lo <= hi:
                mid = lo + (hi - lo) // 2
                if nums[mid] >= t:
                    ans, hi = mid, mid - 1      # 记候选,再往左找
                else:
                    lo = mid + 1
            return ans

        left = lower(target)
        if left == len(nums) or nums[left] != target:
            return [-1, -1]
        return [left, lower(target + 1) - 1]    # upper_bound = lower_bound(t + 1)`,
            },
            hl: [8, 16],
            note: {
              en: (
                <>
                  The standard library already has both:{" "}
                  <code>bisect.bisect_left</code> is lower_bound and{" "}
                  <code>bisect.bisect_right</code> is upper_bound. You may call
                  them in an interview, but write the loop by hand at least once
                  — that is where the boundaries become clear.
                </>
              ),
              zh: (
                <>
                  标准库里两者都有:<code>bisect.bisect_left</code> 就是 lower_bound,
                  <code>bisect.bisect_right</code> 就是 upper_bound。
                  面试中可以直接调用,但至少手写一遍循环 —— 边界是在手写时才真正弄懂的。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var searchRange = function (nums, target) {
  const lower = (t) => {                        // first index with nums[i] >= t
    let lo = 0, hi = nums.length - 1, ans = nums.length;
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (nums[mid] >= t) { ans = mid; hi = mid - 1; } // record, then look left
      else lo = mid + 1;
    }
    return ans;
  };
  const left = lower(target);
  if (left === nums.length || nums[left] !== target) return [-1, -1];
  return [left, lower(target + 1) - 1];         // upper = lower(t + 1)
};`,
              zh: `var searchRange = function (nums, target) {
  const lower = (t) => {                        // 第一个满足 nums[i] >= t 的下标
    let lo = 0, hi = nums.length - 1, ans = nums.length;
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (nums[mid] >= t) { ans = mid; hi = mid - 1; } // 记候选,再往左找
      else lo = mid + 1;
    }
    return ans;
  };
  const left = lower(target);
  if (left === nums.length || nums[left] !== target) return [-1, -1];
  return [left, lower(target + 1) - 1];         // upper = lower(t + 1)
};`,
            },
            hl: [6, 13],
            note: {
              en: (
                <>
                  <b>Order matters:</b> test <code>left === nums.length</code>{" "}
                  before reading <code>nums[left]</code>. Reversing the two would
                  read past the end. <code>||</code> stops at the first true
                  operand, which is what protects the second test.
                </>
              ),
              zh: (
                <>
                  <b>顺序不能反:</b>先判 <code>left === nums.length</code>,
                  再访问 <code>nums[left]</code>。反过来就会越界读。
                  <code>||</code> 在第一个为真的操作数处短路,正好保护了后一个判断。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and the usual follow-up questions",
            zh: "复杂度 & 追问",
          }}
        >
          <p>
            <T
              en={
                <>
                  Two binary searches: <b>O(log n)</b> time, <b>O(1)</b> space.
                  Common follow-ups: (1) &quot;Can one function give both
                  ends?&quot; — yes, <code>lower_bound(t)</code> and{" "}
                  <code>lower_bound(t+1)-1</code>. (2) &quot;How many times does
                  target occur?&quot; — right − left + 1, or equivalently
                  upper_bound − lower_bound. (3) &quot;What about LC 35, search
                  insert position?&quot; — the answer is lower_bound(target)
                  directly, with no existence check at all. Same template, three
                  uses.
                </>
              }
              zh={
                <>
                  两次二分,时间 <b>O(log n)</b>、空间 <b>O(1)</b>。常见追问:
                  ①「一个函数怎么同时拿到左右界?」—— 就是{" "}
                  <code>lower_bound(t)</code> 与 <code>lower_bound(t+1)-1</code>;
                  ②「target 出现几次?」—— 右界 − 左界 + 1,
                  等价于 upper_bound − lower_bound;
                  ③「LC 35 搜索插入位置怎么做?」—— 答案直接就是 lower_bound(target),
                  连「是否存在」都不用判。同一个模板,三种用法。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 二段性 · 旋转数组 + 精讲 B ================= */}
      <Section
        id="rotate"
        index="03"
        title={{
          en: "What binary search actually requires",
          zh: "二段性:二分真正的前提",
        }}
        desc={{
          en: "Worked example B · LC 33 — the array is scrambled, so why can you still halve it?",
          zh: "精讲 B · LC 33 —— 数组被转乱了,凭什么还能砍半",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Time to correct a common belief.{" "}
                  <strong>
                    Binary search does not require the array to be sorted
                  </strong>
                  . What it requires is that{" "}
                  <strong>
                    one O(1) test tells you which half can be discarded
                  </strong>
                  . Put differently: the range must split into a part where the
                  test is false and a part where it is true, with a single flip
                  between them. Sorted order is the most common way to get such a
                  split, but it is not the only way.
                </>
              }
              zh={
                <>
                  先纠正一个常见误解:
                  <strong>二分的前提不是「数组有序」</strong>。
                  真正的前提是 —— <strong>一次 O(1) 判断就能决定丢掉哪一半</strong>。
                  换句话说:整个范围能被切成「判定为否的一段」和「判定为是的一段」,
                  中间只翻转一次。中文里把这个性质叫<strong>二段性</strong>。
                  有序只是产生二段性最常见的来源,不是唯一来源。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>LC 33:</b> a sorted array was <strong>rotated</strong> — for
                  example [0,1,2,4,5,6,7] became [4,5,6,7,0,1,2] — and you must
                  find target and return its index. The array is no longer sorted
                  as a whole, so the plain search fails.{" "}
                  <b>The key observation:</b> a rotation creates exactly{" "}
                  <strong>one drop</strong>, so wherever you cut,{" "}
                  <strong>at least one of the two halves is fully sorted</strong>
                  . Decide which half that is, then decide whether target lies
                  inside it, and one half can be discarded safely. LC 33
                  guarantees that all values are distinct, which keeps the first
                  decision unambiguous:
                </>
              }
              zh={
                <>
                  <b>LC 33:</b>一个升序数组被<strong>旋转</strong>过
                  (如 [0,1,2,4,5,6,7] 变成 [4,5,6,7,0,1,2]),要在里面找 target 并返回下标。
                  数组整体不再有序,精确二分直接失效。
                  <b> 关键观察:</b>旋转只会造成<strong>一个下跌处</strong>,
                  所以无论从哪里切,<strong>左右两半里至少有一半是完全有序的</strong>。
                  先判断哪一半有序,再判断 target 在不在其中,就能安全丢掉一半。
                  LC 33 保证元素互不相同,这让第一步判断永远不会含糊:
                </>
              }
            />
          </p>
        </div>
        <RotatedStepper />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  The test is short: <code>nums[lo] &lt;= nums[mid]</code> means
                  [lo, mid] is sorted; otherwise [mid, hi] is. Then compare
                  target against the two ends of{" "}
                  <strong>that sorted half</strong>. Inside a sorted half a range
                  comparison is reliable; the other half may contain the drop, so
                  it is left for the next iteration.
                </>
              }
              zh={
                <>
                  判据很短:<code>nums[lo] &lt;= nums[mid]</code> 说明 [lo, mid] 有序,
                  否则 [mid, hi] 有序。然后拿 target 和<strong>那个有序半</strong>
                  的两个端点比。在有序的一半里做范围比较是可靠的;
                  另一半可能含着下跌处,留到下一轮再说。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc33_search_rotated"
          java={{
            code: {
              en: `class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {                 // [lo, mid] is sorted
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; // inside it
                else lo = mid + 1;
            } else {                                     // [mid, hi] is sorted
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; // inside it
                else hi = mid - 1;
            }
        }
        return -1;
    }
}`,
              zh: `class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {                 // [lo, mid] 有序
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; // 落在其中
                else lo = mid + 1;
            } else {                                     // [mid, hi] 有序
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; // 落在其中
                else hi = mid - 1;
            }
        }
        return -1;
    }
}`,
            },
            hl: [7, 11],
            note: {
              en: (
                <>
                  <b>The equals sign matters:</b> the test is{" "}
                  <code>nums[lo] &lt;= nums[mid]</code>. When only two elements
                  remain, mid equals lo, and the equals sign makes &quot;the left
                  half is sorted&quot; true — a one-element range is sorted. With
                  a strict <code>&lt;</code> that case would fall into the wrong
                  branch.
                </>
              ),
              zh: (
                <>
                  <b>等号不能少:</b>判据是 <code>nums[lo] &lt;= nums[mid]</code>。
                  当区间只剩两个元素时 mid 等于 lo,等号让「左半有序」成立 ——
                  只有一个元素的区间当然有序。写成严格的 <code>&lt;</code>{" "}
                  就会掉进错误的分支。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if nums[mid] == target:
                return mid
            if nums[lo] <= nums[mid]:                 # left half is sorted
                if nums[lo] <= target < nums[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:                                     # right half is sorted
                if nums[mid] < target <= nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
        return -1`,
              zh: `class Solution:
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
            },
            hl: [8, 14],
            note: {
              en: (
                <>
                  Python allows chained comparison, so{" "}
                  <code>nums[lo] &lt;= target &lt; nums[mid]</code> reads exactly
                  like the mathematical interval. It is easier to read and harder
                  to get backwards.
                </>
              ),
              zh: (
                <>
                  Python 支持链式比较,<code>nums[lo] &lt;= target &lt; nums[mid]</code>{" "}
                  和数学区间写法一致,读起来更清楚,也不容易把方向写反。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var search = function (nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {                    // left half is sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {                                        // right half is sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
};`,
              zh: `var search = function (nums, target) {
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
            },
            hl: [6, 10],
            note: {
              en: (
                <>
                  JavaScript has no chained comparison. <code>a &lt; b &lt; c</code>{" "}
                  evaluates <code>a &lt; b</code> to a boolean and then compares
                  that boolean with c, which is not what you meant. Write{" "}
                  <code>a &lt; b && b &lt; c</code>.
                </>
              ),
              zh: (
                <>
                  JavaScript 没有链式比较。<code>a &lt; b &lt; c</code> 会先把{" "}
                  <code>a &lt; b</code> 算成布尔值,再拿这个布尔值和 c 比 ——
                  完全不是你想要的。必须写成 <code>a &lt; b && b &lt; c</code>。
                </>
              ),
            },
          }}
        />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Variant 01 · LC 153" zh="变式 01 · LC 153" />
            </div>
            <div className="card-title">
              <T
                en="Minimum of a rotated array"
                zh="找旋转最小值"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    Compare <code>nums[mid]</code> with the{" "}
                    <b>right end</b> <code>nums[hi]</code>: greater means the
                    minimum is strictly to the right (lo = mid+1), otherwise
                    hi = mid. Converge to a single index. Comparing with{" "}
                    <code>nums[lo]</code> misjudges an array that was not
                    actually rotated.
                  </>
                }
                zh={
                  <>
                    拿 <code>nums[mid]</code> 和<b>右端点</b>{" "}
                    <code>nums[hi]</code> 比:大于就说明最小值严格在右边
                    (lo = mid+1),否则 hi = mid。收敛到单点即最小值。
                    改和 <code>nums[lo]</code> 比,会在「实际没旋转」的数组上误判。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Variant 02 · LC 81" zh="变式 02 · LC 81" />
            </div>
            <div className="card-title">
              <T en="⚠️ Duplicates get in the way" zh="⚠️ 重复元素来捣乱" />
            </div>
            <p>
              <T
                en={
                  <>
                    When <code>a[lo] == a[mid] == a[hi]</code>, as in
                    [1,1,1,0,1], neither half can be shown to be sorted. The
                    split is gone, so the only safe move is{" "}
                    <code>lo++, hi--</code>, and the worst case becomes{" "}
                    <BigO o="n" />.
                  </>
                }
                zh={
                  <>
                    当 <code>a[lo] == a[mid] == a[hi]</code>(如 [1,1,1,0,1])时,
                    哪一半有序都证不出来。二段性没了,只能{" "}
                    <code>lo++, hi--</code>,最坏退化到 <BigO o="n" />。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Variant 03 · LC 154" zh="变式 03 · LC 154" />
            </div>
            <div className="card-title">
              <T en="⚠️ Minimum with duplicates" zh="⚠️ 最小值 + 重复" />
            </div>
            <p>
              <T
                en={
                  <>
                    The duplicate version of LC 153. When{" "}
                    <code>a[mid] == a[hi]</code> there is nothing to decide on,
                    so shrink conservatively with <code>hi--</code>; the minimum
                    stays in range because a copy of a[hi] sits at mid. Worst
                    case <BigO o="n" />.
                  </>
                }
                zh={
                  <>
                    153 的重复版:<code>a[mid] == a[hi]</code> 时无从判断,
                    只能保守地 <code>hi--</code> 收缩一格;
                    因为 mid 处还有一份 a[hi] 的副本,最小值一定仍在区间内。
                    最坏 <BigO o="n" />。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "Why 81 and 154 degrade while 153 does not",
            zh: "为什么 81 / 154 会退化,153 却不会",
          }}
        >
          <p>
            <T
              en={
                <>
                  Without duplicates, <code>a[lo]</code> and <code>a[mid]</code>{" "}
                  always compare to a definite answer, so the split holds on
                  every step and the time stays O(log n). Once duplicates are
                  allowed and{" "}
                  <code>a[lo] == a[mid] == a[hi]</code>, the same three values
                  are consistent with &quot;the left half is flat and
                  sorted&quot; and with &quot;the drop is hidden among equal
                  values&quot;. Nothing distinguishes them, so that step gives up
                  halving and removes one element from each end instead.{" "}
                  <strong>Duplicates are what break binary search</strong>, and
                  saying that clearly is what an interviewer is listening for
                  when they ask &quot;what if there are duplicates?&quot;
                </>
              }
              zh={
                <>
                  没有重复时,<code>a[lo]</code> 与 <code>a[mid]</code>{" "}
                  永远比得出确定的大小,分界每一步都成立,复杂度稳定在 O(log n)。
                  一旦允许重复,且 <code>a[lo] == a[mid] == a[hi]</code>,
                  这三个值既符合「左半是一段平坦的有序区」,
                  也符合「下跌处被相等的值盖住了」—— 两种局面无从区分,
                  这一步只好放弃砍半,改成两端各删一个元素。
                  <strong>重复元素正是二分的破绽</strong>;
                  面试官问「有重复怎么办」时,想听的就是这句话。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 峰值与矩阵 ================= */}
      <Section
        id="peak"
        index="04"
        title={{
          en: "Peaks and matrices: two more sources of the split",
          zh: "峰值与矩阵:二段性的两次变形",
        }}
        desc={{
          en: "Halving without sorted order: from the direction of the slope, and from row and column order.",
          zh: "不靠「有序」也能砍半:靠爬坡方向,靠行列的单调",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>LC 162, find a peak:</b> return the index of{" "}
                  <strong>any</strong> element larger than both of its
                  neighbors. Neighboring values are never equal, and positions
                  outside the array count as −∞. The array has no order at all,
                  yet the <strong>direction of the slope</strong> gives the
                  split. If <code>nums[mid] &lt; nums[mid+1]</code>, the values
                  are rising at mid, and a peak <strong>must</strong> exist in
                  [mid+1, hi]: either they keep rising all the way to hi, which
                  is then a peak because its right neighbor is −∞, or they stop
                  rising at some index, which is then a peak. Otherwise a peak
                  exists in [lo, mid]. So you can halve the range by always
                  walking uphill:
                </>
              }
              zh={
                <>
                  <b>LC 162 寻找峰值:</b>返回<strong>任意一个</strong>
                  比左右邻居都大的元素下标。相邻元素不相等,数组外侧视作 −∞。
                  数组毫无有序性,但<strong>坡的方向</strong>提供了分界:
                  若 <code>nums[mid] &lt; nums[mid+1]</code>,说明在 mid 处正在上升,
                  那么 [mid+1, hi] 里<strong>一定</strong>有峰 ——
                  要么一路升到 hi(它的右邻是 −∞,所以 hi 就是峰),
                  要么在某处停止上升(那里就是峰)。否则 [lo, mid] 里有峰。
                  于是「一直往高处走」就能砍半:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc162_find_peak"
          java={{
            code: {
              en: `class Solution {
    public int findPeakElement(int[] nums) {
        int lo = 0, hi = nums.length - 1;   // converge to one surviving index
        while (lo < hi) {                   // note: < , stop when lo == hi
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] < nums[mid + 1]) lo = mid + 1; // rising: a peak is on the right
            else hi = mid;                               // otherwise mid itself may be it
        }
        return lo;
    }
}`,
              zh: `class Solution {
    public int findPeakElement(int[] nums) {
        int lo = 0, hi = nums.length - 1;   // 收敛到唯一幸存的下标
        while (lo < hi) {                   // 注意是 < ,lo == hi 时停
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] < nums[mid + 1]) lo = mid + 1; // 在上升:峰在右边
            else hi = mid;                               // 否则 mid 自己可能就是峰
        }
        return lo;
    }
}`,
            },
            hl: [4, 6],
            note: {
              en: (
                <>
                  <b>The converging form.</b> The goal is not to hit a specific
                  value but to squeeze the interval down to one index, so the
                  loop is <code>while (lo &lt; hi)</code> and it stops with
                  lo == hi. <code>hi = mid</code> is required here because mid
                  may be the peak, and it is also safe: lo &lt; hi forces
                  mid &lt; hi, so hi strictly decreases. Using this update with{" "}
                  <code>lo &lt;= hi</code> instead would loop forever.
                </>
              ),
              zh: (
                <>
                  <b>收敛型模板。</b>目标不是命中某个具体值,而是把区间挤到只剩一个下标,
                  所以循环写 <code>while (lo &lt; hi)</code>,以 lo == hi 结束。
                  这里必须写 <code>hi = mid</code>,因为 mid 可能就是峰;
                  这样写也是安全的:lo &lt; hi 保证 mid &lt; hi,hi 一定变小。
                  但把这条更新配上 <code>lo &lt;= hi</code>,就会死循环。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def findPeakElement(self, nums: list[int]) -> int:
        lo, hi = 0, len(nums) - 1           # converge to one index
        while lo < hi:
            mid = lo + (hi - lo) // 2
            if nums[mid] < nums[mid + 1]:
                lo = mid + 1                # rising: a peak is on the right
            else:
                hi = mid                    # otherwise a peak is at mid or left
        return lo`,
              zh: `class Solution:
    def findPeakElement(self, nums: list[int]) -> int:
        lo, hi = 0, len(nums) - 1           # 收敛到单点
        while lo < hi:
            mid = lo + (hi - lo) // 2
            if nums[mid] < nums[mid + 1]:
                lo = mid + 1                # 在上升:峰在右边
            else:
                hi = mid                    # 否则峰在 mid 或其左侧
        return lo`,
            },
            hl: [4, 6],
            note: {
              en: (
                <>
                  <b>Why nums[mid + 1] is always a valid read:</b>{" "}
                  <code>while lo &lt; hi</code> guarantees mid &lt; hi, and hi is
                  the last index, so mid + 1 is at most hi. The index never goes
                  past the end of the array.
                </>
              ),
              zh: (
                <>
                  <b>为什么 nums[mid + 1] 一定不越界:</b>
                  <code>while lo &lt; hi</code> 保证 mid &lt; hi,
                  而 hi 是最后一个下标,所以 mid + 1 最多等于 hi,不会摸到数组外。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var findPeakElement = function (nums) {
  let lo = 0, hi = nums.length - 1;         // converge to one index
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] < nums[mid + 1]) lo = mid + 1; // a peak is on the right
    else hi = mid;                               // a peak is at mid or left
  }
  return lo;
};`,
              zh: `var findPeakElement = function (nums) {
  let lo = 0, hi = nums.length - 1;         // 收敛到单点
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] < nums[mid + 1]) lo = mid + 1; // 峰在右边
    else hi = mid;                               // 峰在 mid 或其左侧
  }
  return lo;
};`,
            },
            hl: [3, 5],
            note: {
              en: (
                <>
                  <b>LC 852 uses the same code, unchanged.</b> A mountain array
                  rises strictly and then falls strictly, so{" "}
                  <code>nums[mid] &lt; nums[mid+1]</code> is true on the way up
                  and false from the peak onward — it flips exactly once. LC 852
                  guarantees a single peak; LC 162 allows several and accepts any
                  of them.
                </>
              ),
              zh: (
                <>
                  <b>LC 852 用同一段代码,一字不改。</b>
                  山脉数组先严格升后严格降,所以{" "}
                  <code>nums[mid] &lt; nums[mid+1]</code> 在上升段为真、
                  从峰顶起为假 —— 恰好只翻转一次。852 保证唯一峰,
                  162 允许多峰、任取其一。
                </>
              ),
            },
          }}
        />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            <T
              en={
                <>
                  Now two dimensions. Matrix search comes in two{" "}
                  <strong>genuinely different</strong> forms, and the difference
                  is how far the ordering reaches:
                </>
              }
              zh={
                <>
                  再看二维。矩阵搜索有两种<strong>本质不同</strong>的题型,
                  区别在于「有序覆盖到多大范围」:
                </>
              }
            />
          </p>
        </div>
        <div className="bin-duel">
          <div className="card">
            <div className="card-kicker">
              <T en="LC 74 · ordered everywhere" zh="LC 74 · 全局有序" />
            </div>
            <div className="card-title">
              <b className="mono">
                <T en="Flatten it, then search" zh="拉直成一维,直接二分" />
              </b>
            </div>
            <p>
              <T
                en={
                  <>
                    Each row increases, and <b>the first value of a row is
                    greater than the last value of the row above</b>. Reading
                    m×n row by row gives one strictly increasing array. Search
                    [0, mn−1] and map back with <code>mid/n</code> and{" "}
                    <code>mid%n</code>. <BigO o="logn" label="O(log mn)" />.
                  </>
                }
                zh={
                  <>
                    每行递增,且<b>下一行开头 &gt; 上一行结尾</b>。
                    把 m×n 逐行接起来就是一条严格递增的数组。
                    在 [0, mn−1] 上二分,再用 <code>mid/n</code>、
                    <code>mid%n</code> 还原成行列。<BigO o="logn" label="O(log mn)" />。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="LC 240 · ordered locally" zh="LC 240 · 局部有序" />
            </div>
            <div className="card-title">
              <b className="mono">
                <T en="Walk in from the top-right" zh="从右上角走阶梯" />
              </b>
            </div>
            <p>
              <T
                en={
                  <>
                    Only <b>each row and each column</b> is sorted; rows do not
                    connect. Flattening gives no order, so a single search would
                    miss values. Stand at the <b>top-right corner</b>: too large
                    means move left (drop a column), too small means move down
                    (drop a row). <BigO o="n" label="O(m + n)" />.
                  </>
                }
                zh={
                  <>
                    只保证<b>行内、列内</b>各自递增,行与行之间不衔接。
                    拉直后并不有序,单次二分会漏解。站在<b>右上角</b>:
                    比目标大就左移(排掉一列),小就下移(排掉一行)。
                    <BigO o="n" label="O(m + n)" />。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <CodeTabs
          title="lc74_search_matrix"
          java={{
            code: {
              en: `class Solution {
    // LC 74: ordered everywhere - treat the matrix as one flat array
    public boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length, n = matrix[0].length;
        int lo = 0, hi = m * n - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int val = matrix[mid / n][mid % n];  // flat index -> row, column
            if (val == target) return true;
            else if (val < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return false;
    }
}`,
              zh: `class Solution {
    // LC 74:全局有序 —— 把矩阵当成一条一维数组
    public boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length, n = matrix[0].length;
        int lo = 0, hi = m * n - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int val = matrix[mid / n][mid % n];  // 一维下标 -> 行、列
            if (val == target) return true;
            else if (val < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return false;
    }
}`,
            },
            hl: [8],
            note: {
              en: (
                <>
                  <b>The conversion:</b> element number mid sits in row{" "}
                  <code>mid / n</code> and column <code>mid % n</code>, where n
                  is the number of <b>columns</b>. Dividing by the number of rows
                  is the usual mistake.
                </>
              ),
              zh: (
                <>
                  <b>换算关系:</b>第 mid 个元素在第 <code>mid / n</code> 行、
                  第 <code>mid % n</code> 列,其中 n 是<b>列数</b>。
                  拿行数去除是最常见的错误。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    # LC 74: ordered everywhere - the whole matrix is one sorted array
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        lo, hi = 0, m * n - 1
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            val = matrix[mid // n][mid % n]      # flat index back to row, column
            if val == target:
                return True
            elif val < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return False`,
              zh: `class Solution:
    # LC 74:全局有序 —— 整个矩阵视作一条有序数组
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        lo, hi = 0, m * n - 1
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            val = matrix[mid // n][mid % n]      # 展平下标还原成行、列
            if val == target:
                return True
            elif val < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return False`,
            },
            hl: [8],
            note: {
              en: (
                <>
                  <b>Compare with LC 240:</b> if the matrix only guarantees order
                  within each row and each column, this code misses values,
                  because the flattened sequence is not sorted. Identify which
                  kind of matrix you have before choosing a template.
                </>
              ),
              zh: (
                <>
                  <b>对照 240:</b>若矩阵只保证行内、列内有序,
                  这段代码会漏解 —— 因为拉直后不是有序序列。
                  先辨清是哪一类矩阵,再选模板。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var searchMatrix = function (matrix, target) {
  // LC 74: ordered everywhere - flatten, then binary search
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
              zh: `var searchMatrix = function (matrix, target) {
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
            },
            hl: [7],
            note: {
              en: (
                <>
                  <b>Detail:</b> the row index needs{" "}
                  <code>Math.floor(mid / n)</code>. In JavaScript{" "}
                  <code>/</code> is floating-point division, and an unrounded
                  index reads nothing: <code>arr[1.5]</code> is{" "}
                  <code>undefined</code>.
                </>
              ),
              zh: (
                <>
                  <b>细节:</b>行号必须写 <code>Math.floor(mid / n)</code>。
                  JavaScript 的 <code>/</code> 是浮点除法,不取整就读不到东西:
                  <code>arr[1.5]</code> 是 <code>undefined</code>。
                </>
              ),
            },
          }}
        />
        <CodeTabs
          title="lc240_search_matrix_ii"
          java={{
            code: {
              en: `class Solution {
    // LC 240: ordered locally - eliminate from the top-right corner
    public boolean searchMatrix(int[][] matrix, int target) {
        int r = 0, c = matrix[0].length - 1;      // start: top-right corner
        while (r < matrix.length && c >= 0) {
            int val = matrix[r][c];
            if (val == target) return true;
            else if (val > target) c--;           // too large -> drop this column
            else r++;                             // too small -> drop this row
        }
        return false;
    }
}`,
              zh: `class Solution {
    // LC 240:局部有序 —— 从右上角开始排除
    public boolean searchMatrix(int[][] matrix, int target) {
        int r = 0, c = matrix[0].length - 1;      // 起点:右上角
        while (r < matrix.length && c >= 0) {
            int val = matrix[r][c];
            if (val == target) return true;
            else if (val > target) c--;           // 太大 -> 排掉这一列
            else r++;                             // 太小 -> 排掉这一行
        }
        return false;
    }
}`,
            },
            hl: [4, 8, 9],
            note: {
              en: (
                <>
                  <b>Why the top-right corner:</b> that value is the largest in
                  its row and the smallest in its column, so a single comparison
                  rules out a whole row or a whole column. The bottom-left corner
                  works the same way by symmetry. The top-left and bottom-right
                  corners do not: there, one comparison rules out nothing.
                </>
              ),
              zh: (
                <>
                  <b>为什么是右上角:</b>那个值是所在行的最大、所在列的最小,
                  所以一次比较就能排掉一整行或一整列。左下角对称,同样可行。
                  左上角和右下角不行 —— 在那里,一次比较什么也排除不了。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    # LC 240: ordered locally - eliminate from the top-right corner
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        r, c = 0, len(matrix[0]) - 1              # top-right corner
        while r < len(matrix) and c >= 0:
            val = matrix[r][c]
            if val == target:
                return True
            elif val > target:
                c -= 1                            # drop a whole column
            else:
                r += 1                            # drop a whole row
        return False`,
              zh: `class Solution:
    # LC 240:局部有序 —— 从右上角开始排除
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
            },
            hl: [4, 9, 11],
            note: {
              en: (
                <>
                  One way to picture it: the matrix behaves like a binary search
                  tree rooted at the top-right corner. Moving left goes to
                  smaller values, moving down goes to larger ones, and each step
                  follows one edge — hence O(m + n).
                </>
              ),
              zh: (
                <>
                  一个便于记忆的看法:这张矩阵可以看成一棵以右上角为根的二叉搜索树 ——
                  左移是更小,下移是更大,每一步只走一条边,所以是 O(m + n)。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var searchMatrix = function (matrix, target) {
  // LC 240: ordered locally - eliminate from the top-right corner
  let r = 0, c = matrix[0].length - 1;           // top-right corner
  while (r < matrix.length && c >= 0) {
    const val = matrix[r][c];
    if (val === target) return true;
    else if (val > target) c--;                  // move left one column
    else r++;                                     // move down one row
  }
  return false;
};`,
              zh: `var searchMatrix = function (matrix, target) {
  // LC 240:局部有序 —— 从右上角开始排除
  let r = 0, c = matrix[0].length - 1;           // 右上角
  while (r < matrix.length && c >= 0) {
    const val = matrix[r][c];
    if (val === target) return true;
    else if (val > target) c--;                  // 左移一列
    else r++;                                     // 下移一行
  }
  return false;
};`,
            },
            hl: [4, 7, 8],
            note: {
              en: (
                <>
                  <b>Complexity:</b> r only increases and c only decreases, at
                  most m and n steps respectively, so{" "}
                  <BigO o="n" label="O(m + n)" /> — better and shorter than
                  binary searching every row, which is O(m log n).
                </>
              ),
              zh: (
                <>
                  <b>复杂度:</b>r 只增、c 只减,各自最多走 m、n 步,
                  所以是 <BigO o="n" label="O(m + n)" /> ——
                  比逐行二分的 O(m log n) 更好也更短。
                </>
              ),
            },
          }}
        />
      </Section>

      {/* ================= §05 二分答案 + 精讲 C ================= */}
      <Section
        id="answer"
        index="05"
        title={{
          en: "Binary search on the answer",
          zh: "二分答案:本章的思维跃迁",
        }}
        desc={{
          en: "Worked example C · LC 875 Koko — when computing the answer is hard, ask a series of yes/no questions instead.",
          zh: "精讲 C · LC 875 吃香蕉 —— 求解太难,就改成一连串「行不行」",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  So far the search ran over <strong>array indices</strong>. Now
                  it runs over <strong>the answer itself</strong>. The rule is
                  one sentence:{" "}
                  <strong>
                    when computing the best answer is hard but checking a
                    candidate answer is easy, search the answer
                  </strong>
                  . The condition is that the check must be{" "}
                  <strong>monotonic</strong>: there is a point where the yes/no
                  test flips from false to true and it never flips back. Drawn
                  out, it is a line of F…F followed by T…T. Note what is{" "}
                  <b>not</b> required: the input array does not have to be
                  sorted. Only the predicate has to be monotonic.
                </>
              }
              zh={
                <>
                  前面二分的都是<strong>数组下标</strong>,现在要二分的是
                  <strong>答案本身</strong>。规则只有一句:
                  <strong>
                    当「直接算出最优答案」很难,而「验证某个候选答案」很容易时,就去二分答案
                  </strong>
                  。条件是这个验证必须<strong>单调</strong>:
                  存在一个点,判定在那里从否翻成是,之后不再翻回去。
                  画出来就是一条 F…F 接 T…T 的线。注意<b>不</b>要求的东西:
                  输入数组根本不必有序,只有谓词必须单调。
                </>
              }
            />
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
                <span className="bin-ft-v">
                  {ok ? <T en="yes ✓" zh="可行 ✓" /> : <T en="no ✗" zh="不可行 ✗" />}
                </span>
              </div>
            );
          })}
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  What you are looking for is the{" "}
                  <strong>highlighted flip point</strong>, the first candidate
                  that passes. That is exactly the lower_bound from §02, with one
                  substitution: instead of comparing with target, you call a{" "}
                  <strong>predicate you wrote yourself</strong>, usually named
                  judge or check.
                </>
              }
              zh={
                <>
                  要找的就是那个<strong>被高亮的翻转点</strong> ——
                  第一个通过判定的候选。这正是 §02 的 lower_bound,
                  只替换了一处:判断标准不再是「和 target 比大小」,
                  而是调用一个<strong>你自己写的谓词</strong>(通常叫 judge 或 check)。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>LC 875:</b> Koko has several piles of bananas,{" "}
                  <code>piles</code>, and the guards come back in{" "}
                  <code>h</code> hours. Each hour she picks one pile and eats k
                  bananas from it; if the pile runs out she waits for the next
                  hour rather than starting another pile. Find the{" "}
                  <strong>smallest speed k that finishes within h hours</strong>.{" "}
                  <b>Brute force:</b> try k = 1, 2, 3, … and stop at the first
                  one that works — O(max × n), and max can be 10⁹, so it is too
                  slow. <b>Why binary search applies:</b> a higher speed never
                  needs more hours, so judge(k) = Σ⌈pile/k⌉ ≤ h is monotonic in
                  k. Search the value range [1, max(piles)] for the first k that
                  passes. The F/T line drawn above is this exact problem, with
                  piles = [3,6,7,11] and h = 8:
                </>
              }
              zh={
                <>
                  <b>LC 875:</b>珂珂有几堆香蕉 <code>piles</code>,警卫{" "}
                  <code>h</code> 小时后回来。她每小时挑一堆,从中吃 k 根;
                  一堆吃完了就等下一个小时,不会接着吃另一堆。求
                  <strong>能在 h 小时内吃完的最小速度 k</strong>。
                  <b> 暴力:</b>从 k=1 依次试到第一个可行的 —— O(max × n),
                  max 可达 10⁹,超时。
                  <b> 为什么能二分:</b>速度越快用时不会更多,
                  所以 judge(k) = Σ⌈pile/k⌉ ≤ h 对 k 单调。
                  在值域 [1, max(piles)] 上找第一个通过的 k。
                  上面画的那条 F/T 线,正是本题在 piles = [3,6,7,11]、h = 8 时的样子:
                </>
              }
            />
          </p>
        </div>
        <RangeShrink
          title={{
            en: "LC 875 · searching the speed range [1, 11] (piles = [3,6,7,11], h = 8)",
            zh: "LC 875 · 在吃速值域 [1,11] 上二分(piles=[3,6,7,11], h=8)",
          }}
          min={1}
          max={11}
          frames={KOKO_FRAMES}
          unit={{ en: "bananas per hour", zh: "根/小时" }}
        />
        <CodeTabs
          title="lc875_koko_eating_bananas"
          java={{
            code: {
              en: `class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int lo = 1, hi = 0;
        for (int p : piles) hi = Math.max(hi, p);   // range [1, largest pile]
        int ans = hi;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;           // try speed mid
            if (canFinish(piles, h, mid)) {         // judge: does it fit in h hours?
                ans = mid; hi = mid - 1;            // it works -> try something slower
            } else {
                lo = mid + 1;                       // too slow -> must go faster
            }
        }
        return ans;
    }

    private boolean canFinish(int[] piles, int h, int k) {
        long hours = 0;
        for (int p : piles) hours += (p + k - 1) / k; // integer form of ceil(p / k)
        return hours <= h;
    }
}`,
              zh: `class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int lo = 1, hi = 0;
        for (int p : piles) hi = Math.max(hi, p);   // 值域 [1, 最大的一堆]
        int ans = hi;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;           // 试探速度 mid
            if (canFinish(piles, h, mid)) {         // 判定:h 小时内吃得完吗?
                ans = mid; hi = mid - 1;            // 可行 -> 再试更慢的
            } else {
                lo = mid + 1;                       // 太慢 -> 必须更快
            }
        }
        return ans;
    }

    private boolean canFinish(int[] piles, int h, int k) {
        long hours = 0;
        for (int p : piles) hours += (p + k - 1) / k; // ceil(p / k) 的整数写法
        return hours <= h;
    }
}`,
            },
            hl: [8, 9, 18],
            note: {
              en: (
                <>
                  <b>Two details:</b> (1) write the ceiling as{" "}
                  <code>(p + k - 1) / k</code> so the whole computation stays in
                  integers and no rounding error can appear; (2) accumulate into
                  a <code>long</code>, because with many piles the sum of hours
                  can pass the int limit. The structure is identical to the
                  boundary search in §02 — only{" "}
                  <code>nums[mid] &gt;= t</code> became{" "}
                  <code>canFinish(mid)</code>.
                </>
              ),
              zh: (
                <>
                  <b>两个细节:</b>①上取整写成 <code>(p + k - 1) / k</code>,
                  全程留在整数域,不会出现舍入误差;
                  ②用 <code>long</code> 累加 —— 堆数很多时,小时数之和可能超过 int 上限。
                  结构和 §02 的找边界完全一致,只是把{" "}
                  <code>nums[mid] &gt;= t</code> 换成了 <code>canFinish(mid)</code>。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def minEatingSpeed(self, piles: list[int], h: int) -> int:
        def can(k: int) -> bool:                   # can speed k finish within h?
            return sum((p + k - 1) // k for p in piles) <= h

        lo, hi, ans = 1, max(piles), max(piles)
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if can(mid):
                ans, hi = mid, mid - 1             # it works -> try slower
            else:
                lo = mid + 1                       # too slow -> go faster
        return ans`,
              zh: `class Solution:
    def minEatingSpeed(self, piles: list[int], h: int) -> int:
        def can(k: int) -> bool:                   # 速度 k 能在 h 小时内吃完吗?
            return sum((p + k - 1) // k for p in piles) <= h

        lo, hi, ans = 1, max(piles), max(piles)
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if can(mid):
                ans, hi = mid, mid - 1             # 可行 -> 再试更慢的
            else:
                lo = mid + 1                       # 太慢 -> 提速
        return ans`,
            },
            hl: [3, 9, 10],
            note: {
              en: (
                <>
                  <code>-(-p // k)</code> and <code>math.ceil(p / k)</code> also
                  round up, but <code>(p + k - 1) // k</code> stays in integers
                  and is the safest of the three. Python integers are arbitrary
                  precision, so the sum cannot overflow.
                </>
              ),
              zh: (
                <>
                  <code>-(-p // k)</code> 和 <code>math.ceil(p / k)</code>{" "}
                  也能上取整,但 <code>(p + k - 1) // k</code>{" "}
                  全程是整数运算,三者中最稳。Python 整数任意精度,求和不会溢出。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var minEatingSpeed = function (piles, h) {
  const can = (k) =>
    piles.reduce((s, p) => s + Math.ceil(p / k), 0) <= h; // the judge function

  let lo = 1, hi = Math.max(...piles), ans = hi;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (can(mid)) { ans = mid; hi = mid - 1; }   // works -> try slower
    else lo = mid + 1;                            // too slow -> go faster
  }
  return ans;
};`,
              zh: `var minEatingSpeed = function (piles, h) {
  const can = (k) =>
    piles.reduce((s, p) => s + Math.ceil(p / k), 0) <= h; // 判定函数

  let lo = 1, hi = Math.max(...piles), ans = hi;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (can(mid)) { ans = mid; hi = mid - 1; }   // 可行 -> 试更慢的
    else lo = mid + 1;                            // 太慢 -> 提速
  }
  return ans;
};`,
            },
            hl: [2, 8, 9],
            note: {
              en: (
                <>
                  <code>Math.ceil(p / k)</code> is exact as long as p stays well
                  below 2⁵³, which holds here. The upper bound comes from{" "}
                  <code>Math.max(...piles)</code>. And this is the place to
                  remember not to compute mid with <code>&gt;&gt;</code>: the
                  value range in an answer search can be far larger than an array
                  index.
                </>
              ),
              zh: (
                <>
                  只要 p 远小于 2⁵³,<code>Math.ceil(p / k)</code> 就是精确的,
                  本题满足。上界用 <code>Math.max(...piles)</code> 取。
                  另外,这里正是要记住「别用 <code>&gt;&gt;</code> 求 mid」的场合:
                  二分答案的值域可能远大于数组下标。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "In production: answer search shows up in capacity planning",
            zh: "工程现场:二分答案是资源规划的暗线",
          }}
        >
          <p>
            <T
              en={
                <>
                  The pattern of &quot;guess a value, then verify it&quot; is
                  common in real systems. Load testing uses it to find the
                  highest request rate a service still survives. Adaptive video
                  players use it to pick the highest bitrate that does not
                  stall. Query planners and compilers use it to find the smallest
                  degree of parallelism that meets a latency budget. In every
                  case computing the optimum directly is hard, while checking one
                  configuration is easy — so the search runs over the space of
                  answers.
                </>
              }
              zh={
                <>
                  「先猜一个值,再验证」的模式在真实系统里很常见。
                  压测用它找「服务仍然撑得住的最高请求速率」;
                  自适应视频播放器用它挑「不会卡顿的最高码率」;
                  查询规划器和编译器用它找「满足延迟预算的最小并行度」。
                  共同点是:直接算最优很难,而验证一个配置很容易 ——
                  于是把搜索放到答案空间上。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="win"
          title={{
            en: "Three questions to ask out loud in an interview",
            zh: "面试话术:二分答案的三连自问",
          }}
        >
          <p>
            <T
              en={
                <>
                  When a problem says &quot;maximize the minimum&quot;,
                  &quot;minimize the maximum&quot;, or &quot;find the extreme
                  value that satisfies a condition&quot;, say these three things:
                  (1) <b>&quot;What is the range of the answer?&quot;</b> — that
                  fixes lo and hi. (2){" "}
                  <b>
                    &quot;Given a candidate x, can I check it in O(n)?&quot;
                  </b>{" "}
                  — that is the judge function. (3){" "}
                  <b>&quot;Is the check monotonic in x?&quot;</b> — that is the
                  F…F T…T line. Three yes answers mean binary search on the
                  answer, at <b>O(n · log(range))</b>.
                </>
              }
              zh={
                <>
                  碰到「最大化最小值 / 最小化最大值 / 求满足条件的极值」,
                  当场把这三句说出来:
                  ①<b>「答案的取值范围是多少?」</b>—— 定下 lo、hi;
                  ②<b>「给定一个候选 x,能不能 O(n) 验证?」</b>—— 这就是 judge 函数;
                  ③<b>「验证结果随 x 单调吗?」</b>—— 确认那条 F…F T…T 的线。
                  三个都点头,就是二分答案,时间 <b>O(n · log(值域))</b>。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 答案二分续 ================= */}
      <Section
        id="answer2"
        index="06"
        title={{
          en: "More answer search: one method, three appearances",
          zh: "答案二分续:同一套路的三种脸",
        }}
        desc={{
          en: "Minimize the maximum (LC 1011, LC 410) and find the largest feasible value (LC 69, LC 367).",
          zh: "最大值最小化(1011/410)、最大可行(69/367)—— 换汤不换药",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Once LC 875 is clear, the problems below are the same method in
                  different words. Start with the standard{" "}
                  <strong>&quot;minimize the maximum&quot;</strong> problem,{" "}
                  <strong>LC 1011</strong>: packages on a conveyor belt must be
                  loaded <strong>in their given order</strong>, and you need the{" "}
                  <strong>smallest ship capacity</strong> that gets them all
                  delivered within D days. judge(cap) loads packages one by one
                  and starts a new day whenever the next one does not fit, then
                  compares the day count with D. The lower end of the range is
                  the <strong>heaviest package</strong> — below that, that
                  package can never be loaded at all — and the upper end is the{" "}
                  <strong>sum of all weights</strong>, which ships everything in
                  one day.
                </>
              }
              zh={
                <>
                  吃透 875,下面这些题就是同一套方法换了说法。先看
                  <strong>「最大值最小化」</strong>的母题{" "}
                  <strong>LC 1011</strong>:传送带上的包裹必须
                  <strong>按给定顺序</strong>装船,求 D 天内运完所需的
                  <strong>最小运力</strong>。judge(cap) 依次装货,
                  装不下就开新的一天,最后比较天数与 D。
                  值域下界是<strong>最重的包裹</strong> ——
                  再小那件货永远装不上;上界是<strong>所有重量之和</strong>,
                  一天就能全部运完。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc1011_ship_within_days"
          java={{
            code: {
              en: `class Solution {
    public int shipWithinDays(int[] weights, int days) {
        int lo = 0, sum = 0;
        for (int w : weights) { lo = Math.max(lo, w); sum += w; } // low = heaviest package
        int hi = sum, ans = sum;                                  // high = total weight
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (canShip(weights, days, mid)) { ans = mid; hi = mid - 1; }
            else lo = mid + 1;
        }
        return ans;
    }

    private boolean canShip(int[] weights, int days, int cap) {
        int need = 1, cur = 0;                    // at least one day
        for (int w : weights) {
            if (cur + w > cap) { need++; cur = 0; } // does not fit -> start a new day
            cur += w;
        }
        return need <= days;
    }
}`,
              zh: `class Solution {
    public int shipWithinDays(int[] weights, int days) {
        int lo = 0, sum = 0;
        for (int w : weights) { lo = Math.max(lo, w); sum += w; } // 下界 = 最重的包裹
        int hi = sum, ans = sum;                                  // 上界 = 总重量
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (canShip(weights, days, mid)) { ans = mid; hi = mid - 1; }
            else lo = mid + 1;
        }
        return ans;
    }

    private boolean canShip(int[] weights, int days, int cap) {
        int need = 1, cur = 0;                    // 至少要一天
        for (int w : weights) {
            if (cur + w > cap) { need++; cur = 0; } // 装不下 -> 开新的一天
            cur += w;
        }
        return need <= days;
    }
}`,
            },
            hl: [4, 8, 15],
            note: {
              en: (
                <>
                  <b>The lower bound cannot be 0 or 1.</b> It must be{" "}
                  <code>max(weights)</code>. With a capacity smaller than the
                  heaviest package, that package never fits on any day, and{" "}
                  <code>canShip</code> would keep starting new days without
                  making progress.
                </>
              ),
              zh: (
                <>
                  <b>下界不能取 0 或 1</b>,必须是 <code>max(weights)</code>。
                  运力比最重的包裹还小,那件货任何一天都装不上,
                  <code>canShip</code> 会不停地开新的一天却毫无进展。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def shipWithinDays(self, weights: list[int], days: int) -> int:
        def can(cap: int) -> bool:
            need, cur = 1, 0
            for w in weights:
                if cur + w > cap:
                    need, cur = need + 1, 0       # start a new day
                cur += w
            return need <= days

        lo, hi = max(weights), sum(weights)       # range: heaviest package .. total
        ans = hi
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if can(mid):
                ans, hi = mid, mid - 1
            else:
                lo = mid + 1
        return ans`,
              zh: `class Solution:
    def shipWithinDays(self, weights: list[int], days: int) -> int:
        def can(cap: int) -> bool:
            need, cur = 1, 0
            for w in weights:
                if cur + w > cap:
                    need, cur = need + 1, 0       # 开新的一天
                cur += w
            return need <= days

        lo, hi = max(weights), sum(weights)       # 值域:最重包裹 .. 总和
        ans = hi
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if can(mid):
                ans, hi = mid, mid - 1
            else:
                lo = mid + 1
        return ans`,
            },
            hl: [11, 15, 16],
            note: {
              en: (
                <>
                  <b>Compare with LC 875:</b> the structure is identical. Only
                  the judge changed, from &quot;hours needed at this speed&quot;
                  to &quot;days needed at this capacity&quot;. Recognizing that
                  sameness turns the effort spent on one problem into ten.
                </>
              ),
              zh: (
                <>
                  <b>和 875 对照:</b>结构完全一样,只有 judge 变了 ——
                  从「按速度算小时数」变成「按运力算天数」。
                  认出这层相同,一道题的力气就能用到十道题上。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var shipWithinDays = function (weights, days) {
  const can = (cap) => {
    let need = 1, cur = 0;
    for (const w of weights) {
      if (cur + w > cap) { need++; cur = 0; }     // start a new day
      cur += w;
    }
    return need <= days;
  };

  let lo = Math.max(...weights);
  let hi = weights.reduce((a, b) => a + b, 0);    // total weight
  let ans = hi;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (can(mid)) { ans = mid; hi = mid - 1; }
    else lo = mid + 1;
  }
  return ans;
};`,
              zh: `var shipWithinDays = function (weights, days) {
  const can = (cap) => {
    let need = 1, cur = 0;
    for (const w of weights) {
      if (cur + w > cap) { need++; cur = 0; }     // 开新的一天
      cur += w;
    }
    return need <= days;
  };

  let lo = Math.max(...weights);
  let hi = weights.reduce((a, b) => a + b, 0);    // 总重量
  let ans = hi;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (can(mid)) { ans = mid; hi = mid - 1; }
    else lo = mid + 1;
  }
  return ans;
};`,
            },
            hl: [11, 12, 17],
            note: {
              en: (
                <>
                  <b>LC 410, Split Array Largest Sum, is the same problem.</b>{" "}
                  Replace &quot;D days&quot; with &quot;m subarrays&quot; and
                  &quot;capacity&quot; with &quot;upper limit on a subarray
                  sum&quot;, and the judge function does not change at all. LC
                  410 is labeled hard mostly because of how it is worded.
                </>
              ),
              zh: (
                <>
                  <b>LC 410「分割数组的最大值」就是同一道题。</b>
                  把「D 天」换成「m 段」、「运力」换成「每段和的上限」,
                  judge 一字不改。410 挂着 hard,主要难在题面的说法。
                </>
              ),
            },
          }}
        />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            <T
              en={
                <>
                  The last shape is the <strong>square root</strong> (LC 69):
                  compute ⌊√x⌋, the largest integer k with{" "}
                  <code>k×k ≤ x</code>. That predicate is monotonic too, but it
                  runs the other way: it is true for small k and false for large
                  k, so you want the <strong>last</strong> value that passes.
                  Record the candidate, then push <strong>right</strong> with{" "}
                  <code>lo = mid + 1</code> — the mirror image of LC 875. Keep
                  the two directions apart:
                </>
              }
              zh={
                <>
                  最后一种形状是<strong>平方根</strong>(LC 69):
                  求 ⌊√x⌋,即满足 <code>k×k ≤ x</code> 的最大整数 k。
                  这个谓词同样单调,但方向相反:小 k 为真、大 k 为假,
                  所以要的是<strong>最后一个</strong>通过的值。
                  记下候选后往<strong>右</strong>挤:<code>lo = mid + 1</code> ——
                  正是 875 的镜像。两个方向务必分清:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc69_sqrt"
          java={{
            code: {
              en: `class Solution {
    public int mySqrt(int x) {
        int lo = 0, hi = x, ans = 0;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if ((long) mid * mid <= x) {   // passes -> record, then try larger
                ans = mid; lo = mid + 1;
            } else {
                hi = mid - 1;              // too large -> shrink downward
            }
        }
        return ans;
    }
}`,
              zh: `class Solution {
    public int mySqrt(int x) {
        int lo = 0, hi = x, ans = 0;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if ((long) mid * mid <= x) {   // 通过 -> 记候选,再往大试
                ans = mid; lo = mid + 1;
            } else {
                hi = mid - 1;              // 太大 -> 往小收
            }
        }
        return ans;
    }
}`,
            },
            hl: [6, 7],
            note: {
              en: (
                <>
                  <b>Overflow:</b> <code>mid * mid</code> overflows int, since x
                  can be close to 2³¹, so cast first:{" "}
                  <code>(long) mid * mid</code>. Rewriting the test as{" "}
                  <code>mid &lt;= x / mid</code> also avoids the multiplication,
                  but only if mid ≥ 1 — with <code>lo = 0</code> the first mid
                  can be 0 and that form divides by zero. <b>Direction:</b>{" "}
                  largest feasible value means <code>lo = mid + 1</code>, the
                  opposite of LC 875.
                </>
              ),
              zh: (
                <>
                  <b>溢出:</b>x 可接近 2³¹,<code>mid * mid</code> 会溢出 int,
                  必须先转型:<code>(long) mid * mid</code>。
                  把判定改写成 <code>mid &lt;= x / mid</code> 也能绕开乘法,
                  但前提是 mid ≥ 1 —— 当 <code>lo = 0</code> 时首个 mid 可能是 0,
                  那样会除以零。<b>方向:</b>找最大可行值用{" "}
                  <code>lo = mid + 1</code>,与 875 相反。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def mySqrt(self, x: int) -> int:
        lo, hi, ans = 0, x, 0
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if mid * mid <= x:            # passes -> record, then try larger
                ans, lo = mid, mid + 1
            else:
                hi = mid - 1             # too large -> shrink downward
        return ans`,
              zh: `class Solution:
    def mySqrt(self, x: int) -> int:
        lo, hi, ans = 0, x, 0
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if mid * mid <= x:            # 通过 -> 记候选,再往大试
                ans, lo = mid, mid + 1
            else:
                hi = mid - 1             # 太大 -> 往小收
        return ans`,
            },
            hl: [6, 7],
            note: {
              en: (
                <>
                  <b>No overflow to worry about:</b> Python integers are
                  arbitrary precision, so <code>mid * mid</code> is always exact.{" "}
                  <b>LC 367</b> is the same search with a different exit: return
                  true on <code>mid * mid == num</code>, and false once the
                  interval is empty.
                </>
              ),
              zh: (
                <>
                  <b>不用担心溢出:</b>Python 整数任意精度,
                  <code>mid * mid</code> 永远精确。
                  <b> LC 367</b> 是同一个搜索、换一个出口:
                  <code>mid * mid == num</code> 时返回 true,区间空了返回 false。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var mySqrt = function (x) {
  let lo = 0, hi = x, ans = 0;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (mid * mid <= x) { ans = mid; lo = mid + 1; } // passes -> try larger
    else hi = mid - 1;                               // too large -> go down
  }
  return ans;
};`,
              zh: `var mySqrt = function (x) {
  let lo = 0, hi = x, ans = 0;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (mid * mid <= x) { ans = mid; lo = mid + 1; } // 通过 -> 往大试
    else hi = mid - 1;                               // 太大 -> 往小收
  }
  return ans;
};`,
            },
            hl: [5],
            note: {
              en: (
                <>
                  <b>About precision:</b> mid is a probe, not the answer. On the
                  first iteration mid ≈ x/2, so <code>mid * mid</code> can reach
                  about 10¹⁸, past JavaScript&apos;s exact integer range (2⁵³ ≈
                  9×10¹⁵). The result is still correct, because the product is
                  only inexact when it is already thousands of times larger than
                  x, so the comparison cannot come out the wrong way. Near the
                  answer, mid ≈ √x ≤ 46341 and mid×mid is exact. In Java or C++
                  an int really does overflow, so use long there, or rewrite as{" "}
                  <code>mid &lt;= x / mid</code> with mid ≥ 1.
                </>
              ),
              zh: (
                <>
                  <b>关于精度:</b>mid 是探测值,不是答案。第一轮 mid ≈ x/2,
                  <code>mid * mid</code> 可达约 10¹⁸,已超出 JavaScript
                  的精确整数范围(2⁵³ ≈ 9×10¹⁵)。但结果依然正确:
                  乘积不精确时,它已经比 x 大了好几个数量级,比较方向不可能翻转;
                  而在答案附近 mid ≈ √x ≤ 46341,mid×mid 是精确的。
                  Java / C++ 的 int 则是真溢出,那里必须用 long,
                  或在 mid ≥ 1 的前提下改写成 <code>mid &lt;= x / mid</code>。
                </>
              ),
            },
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th><T en="Template" zh="模板" /></th>
                <th><T en="Interval" zh="区间" /></th>
                <th><T en="Loop" zh="循环条件" /></th>
                <th><T en="When the test passes" zh="命中 / 满足时" /></th>
                <th><T en="Returns" zh="返回" /></th>
                <th><T en="Problems" zh="代表题" /></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b><T en="Exact search" zh="精确查找" /></b></td>
                <td>[lo, hi]</td>
                <td>lo &lt;= hi</td>
                <td><T en="equal -> return mid" zh="相等即 return mid" /></td>
                <td><T en="index / −1" zh="下标 / −1" /></td>
                <td>704 · 74</td>
              </tr>
              <tr>
                <td>
                  <b><T en="Boundary (first feasible)" zh="找边界(最小可行)" /></b>
                </td>
                <td>[lo, hi]</td>
                <td>lo &lt;= hi</td>
                <td>ans=mid; hi=mid−1</td>
                <td>ans</td>
                <td>34 · 35 · 875 · 1011</td>
              </tr>
              <tr>
                <td>
                  <b><T en="Boundary (last feasible)" zh="找边界(最大可行)" /></b>
                </td>
                <td>[lo, hi]</td>
                <td>lo &lt;= hi</td>
                <td>ans=mid; lo=mid+1</td>
                <td>ans</td>
                <td>69 · 367</td>
              </tr>
              <tr>
                <td><b><T en="Converging" zh="收敛型" /></b></td>
                <td>[lo, hi]</td>
                <td>lo &lt; hi</td>
                <td>
                  <T
                    en="mid+1 on one side, mid on the other"
                    zh="一侧 mid+1、一侧 mid"
                  />
                </td>
                <td>lo</td>
                <td>153 · 162 · 852</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "Ordinary binary search vs binary search on the answer",
            zh: "一张表看懂:普通二分 vs 二分答案",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>Ordinary binary search</b> looks for a position in data that
                  is already sorted; the range it searches is the set of array
                  indices. <b>Binary search on the answer</b> guesses inside the
                  range of possible answers, from the smallest to the largest one
                  that could be correct, and the input array may not be sorted at
                  all. The test also changes: instead of comparing with target,
                  you call a judge function you wrote. That is what takes binary
                  search from &quot;look something up&quot; to &quot;solve an
                  optimization problem&quot;.
                </>
              }
              zh={
                <>
                  <b>普通二分</b>在已经排好的数据里找位置,搜索范围是数组下标;
                  <b>二分答案</b>在「答案可能的取值范围」里猜,
                  从最小可能答案到最大可能答案,输入数组甚至可能根本没排序。
                  判断标准也变了:不再是「和 target 比大小」,
                  而是调用一个你自己写的 judge 函数。
                  正是这一步,把二分从「查一个值」推进到「解一道最优化问题」。
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
          en: "Problem set: 18 binary search problems",
          zh: "高频题单:二分进阶 18 题",
        }}
        desc={{
          en: "Grouped as template, boundaries, monotonic split, and answer search, from easier to harder. Think for 30 seconds before opening the hint.",
          zh: "按「模板 → 找边界 → 二段性 → 二分答案」分层,由易到难。先想 30 秒再看提示",
        }}
        badge={
          <span className="chip">
            <T en="Core set" zh="主线必做" />
          </span>
        }
      >
        <ProblemSet ch="binary" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Answer all 9 correctly to mark this chapter as complete.",
          zh: "9 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="binary" items={QUIZ} />
      </Section>

      <KeyPoints
        points={{
          en: [
            <>
              Binary search does not require a sorted array. It requires{" "}
              <b>one O(1) test that says which half to discard</b> — a range that
              splits into a false part and a true part with a single flip
              between them. Sorted order is the most common source of that
              split, not the only one.
            </>,
            <>
              <b>Name the interval first, then derive the rest.</b> Closed
              interval [lo, hi] goes with <code>lo &lt;= hi</code>,{" "}
              <code>hi = mid - 1</code>, and <code>lo = mid + 1</code>. Half-open
              [lo, hi) goes with <code>lo &lt; hi</code> and{" "}
              <code>hi = mid</code>. Mixing the two is the classic bug.
            </>,
            <>
              The invariant is: <b>if the answer exists, its index is inside
              [lo, hi]</b>. Every claim about correctness traces back to it, and
              every branch must move past mid so the interval strictly shrinks
              and the loop ends.
            </>,
            <>
              Overflow is language-specific. In Java or C++,{" "}
              <code>(lo + hi) / 2</code> can overflow, so write{" "}
              <code>lo + (hi - lo) / 2</code>. Python integers are arbitrary
              precision. JavaScript numbers are exact to 2⁵³, so plain division
              is fine, but <code>(lo + hi) &gt;&gt; 1</code> truncates to 32 bits
              and is wrong for large ranges.
            </>,
            <>
              Boundary search = <b>record a candidate, then keep pushing to one
              side</b>. lower_bound(t) is the first index ≥ t, upper_bound(t) the
              first index &gt; t; both return n when nothing qualifies, and for
              integers <b>upper_bound(t) = lower_bound(t+1)</b>.
            </>,
            <>
              Rotated arrays: one of the two halves is always sorted, so ask
              which one and whether target is inside it.{" "}
              <b>Duplicates (LC 81, LC 154) destroy that test</b> and the worst
              case becomes O(n).
            </>,
            <>
              Binary search on the answer: <b>when solving is hard, check
              instead</b>. If the yes/no test on a candidate answer is monotonic,
              search the <b>range of answers</b> and call judge. LC 875, LC 1011,
              and LC 410 are the same method. Two mirrored directions:{" "}
              <b>first feasible</b> (LC 875, hi = mid−1) and{" "}
              <b>last feasible</b> (LC 69, lo = mid+1).
            </>,
            <>
              Cost: <b>O(log n)</b> time, <b>O(1)</b> extra space when written
              iteratively, <b>O(log n)</b> stack when written recursively. For an
              answer search it is O(cost of judge × log(range)).
            </>,
          ],
          zh: [
            <>
              二分不要求数组有序,要求的是<b>一次 O(1) 判断就能决定丢掉哪一半</b> ——
              整个范围能切成「否的一段」和「是的一段」,中间只翻转一次。
              有序是产生这个分界最常见的来源,不是唯一来源。
            </>,
            <>
              <b>先定区间,其余全部推导。</b>闭区间 [lo, hi] 配{" "}
              <code>lo &lt;= hi</code>、<code>hi = mid - 1</code>、
              <code>lo = mid + 1</code>;半开区间 [lo, hi) 配{" "}
              <code>lo &lt; hi</code> 与 <code>hi = mid</code>。
              把两套混用,就是那个经典 bug。
            </>,
            <>
              不变量是:<b>如果答案存在,它的下标就在 [lo, hi] 内</b>。
              所有关于正确性的说法都回到这一句;
              每个分支都必须越过 mid,区间才会严格变小、循环才会结束。
            </>,
            <>
              溢出问题因语言而异:Java / C++ 里 <code>(lo + hi) / 2</code>{" "}
              可能溢出,写 <code>lo + (hi - lo) / 2</code>;
              Python 整数任意精度;JavaScript 在 2⁵³ 内精确,普通除法没问题,
              但 <code>(lo + hi) &gt;&gt; 1</code> 会截成 32 位,值域一大就错。
            </>,
            <>
              找边界 = <b>记下候选,再朝一侧继续挤</b>。
              lower_bound(t) 是第一个 ≥ t 的下标,upper_bound(t) 是第一个 &gt; t 的下标;
              都在「无人满足」时返回 n,且在整数上有{" "}
              <b>upper_bound(t) = lower_bound(t+1)</b>。
            </>,
            <>
              旋转数组:两半里总有一半有序,所以先问哪半有序、目标在不在其中。
              <b>重复元素(81 / 154)会毁掉这个判据</b>,最坏退化到 O(n)。
            </>,
            <>
              二分答案:<b>求解太难,就改成验证</b>。
              若对候选答案的是非判定是单调的,就在<b>答案的取值范围</b>上二分 + judge。
              875 / 1011 / 410 是同一套方法。两个镜像方向:
              <b>第一个可行</b>(875,hi = mid−1)与
              <b>最后一个可行</b>(69,lo = mid+1)。
            </>,
            <>
              代价:时间 <b>O(log n)</b>;迭代写法额外空间 <b>O(1)</b>,
              递归写法调用栈 <b>O(log n)</b>。二分答案则是
              O(judge 的代价 × log(值域))。
            </>,
          ],
        }}
      />

      <ChapterFooter ch="binary" />
    </main>
  );
}
