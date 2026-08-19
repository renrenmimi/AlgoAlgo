"use client";

// 第 2 章 · 分治 Divide & Conquer。
// 结构:分治三步(分/治/合)+ 通用模板 → 递归树与主定理直觉 →
// 精讲 A 快速幂(LC 50,PowTree)→ 精讲 B 合并 K 链表(LC 23,分层合并图)→
// 精讲 C 最大子数组分治视角(LC 53,对比 07 章 Kadane)→ 逆序对 + Karatsuba →
// 题单 → 测验 → 要点。招牌可视化:TreePlayer(快速幂)、自建分层合并图。
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
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { T } from "@/lib/i18n";
import { PROBLEMS, QUIZ } from "@/lib/divide-data";
import { PowTree, MergeSortLayers, MergeKLists, CrossMidLab, InversionLab } from "./viz";

const CHIPS = [
  { id: "why", n: "01", label: { en: "Three steps", zh: "分治三步" } },
  { id: "cost", n: "02", label: { en: "Recursion tree", zh: "递归树与复杂度" } },
  { id: "pow", n: "03", label: { en: "Fast power · LC 50", zh: "快速幂 · LC 50" } },
  { id: "merge", n: "04", label: { en: "Merge k lists · LC 23", zh: "归并分治 · LC 23" } },
  { id: "maxsub", n: "05", label: { en: "Max subarray · LC 53", zh: "最大子数组 · LC 53" } },
  { id: "inversion", n: "06", label: { en: "Inversions & Karatsuba", zh: "逆序对 & Karatsuba" } },
  { id: "problems", n: "07", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "08", label: { en: "Quiz", zh: "通关测验" } },
];

export default function DivideChapter() {
  return (
    <main className="page" data-ch="divide">
      <Hero
        ch="divide"
        title={{
          en: (
            <>
              Divide and <span className="grad">conquer</span>
            </>
          ),
          zh: (
            <>
              分治 <span className="grad">Divide &amp; Conquer</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              Divide and conquer is one idea:{" "}
              <strong>
                cut a large problem into smaller problems of the same shape, let the
                recursion solve each one, then combine the sub-answers into the final
                answer
              </strong>
              . The introduction chapter asked you to trust recursion. This is the first
              chapter where that trust pays off. You will see a slow O(n) or O(n²) method
              become O(n log n), and sometimes O(log n), only because the input is cut in
              half at every step.
            </>
          ),
          zh: (
            <>
              分治只有一句话:<strong>把大问题切成同款的小问题,信任递归把答案带回来,
              再把子答案拼成总答案</strong>。序章教过的「递归信任」在这里第一次派上大用场 ——
              你会看到 O(n) 甚至 O(n²) 的暴力,如何被「对半砍」一路压成 O(n log n),
              有时甚至压到 O(log n)。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 分治三步 ================= */}
      <Section
        id="why"
        index="01"
        title={{
          en: "Three steps: divide, conquer, combine",
          zh: "分治三步:分 / 治 / 合",
        }}
        desc={{
          en: "Recursion is a way to write code. Divide and conquer is a way to design a solution.",
          zh: "不是新魔法,是把「递归」从一种写法,升级成一种解题世界观",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Start with a simple picture. You have a stack of 1000 ballots to count.
                  One person counting alone takes all day. A faster way:{" "}
                  <strong>split the stack into 10 smaller stacks</strong> and give one
                  stack to each of 10 people. Each person may split their stack again.
                  At the end, <strong>add the 10 subtotals together</strong>. That is
                  divide and conquer: cut the problem into smaller problems of the same
                  shape, solve them separately, then combine the results.
                </>
              }
              zh={
                <>
                  先讲个场景。你面前有一叠 1000 张的选票要清点,一个人数到天黑。
                  聪明的做法:把票<strong>分成 10 摞</strong>,发给 10 个人各数一摞
                  (每个人又可以把自己那摞再分下去),最后<strong>把 10 个小计加起来</strong>。
                  这就是分治(Divide &amp; Conquer,古罗马人叫它「分而治之」):
                  大问题拆成同样形状的小问题,分头解决,再汇总。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  How is this different from plain recursion? Recursion is{" "}
                  <strong>the language feature that lets a function call itself</strong>.
                  Divide and conquer is{" "}
                  <strong>a strategy that uses recursion to solve a problem</strong>, and
                  it is the most common one. Every divide and conquer solution has the
                  same three steps.
                </>
              }
              zh={
                <>
                  它和序章的递归是什么关系?递归是<strong>「函数调用自己」这个语法工具</strong>;
                  分治是<strong>「用递归解题」的一种策略</strong> —— 而且是最经典的那种。
                  每道分治题,都能拆成雷打不动的三步:
                </>
              }
            />
          </p>
        </div>
        <div className="dvd-steps">
          <div className="dvd-step">
            <div className="dvd-step-ico" aria-hidden>✂️</div>
            <h4>
              <T en={<>Divide</>} zh={<>分<span className="en">Divide</span></>} />
            </h4>
            <p>
              <T
                en={
                  <>
                    Cut a problem of size n into several <b>smaller problems of the same
                    kind</b>, usually two problems of size n/2. Every piece must be
                    strictly smaller than the original, otherwise the recursion never
                    reaches the base case. The pieces must also <b>not overlap</b>:
                    they share no work, so each one is solved exactly once.
                  </>
                }
                zh={
                  <>
                    把规模为 n 的问题,切成若干个<b>同款、更小</b>的子问题
                    (通常对半,规模减到 n/2)。切法要保证子问题真的更小,否则递归停不下来;
                    还要保证子问题<b>互不重叠</b> —— 它们不共享工作,每个只会被解一次。
                  </>
                }
              />
            </p>
          </div>
          <div className="dvd-step">
            <div className="dvd-step-ico" aria-hidden>🧩</div>
            <h4>
              <T en={<>Conquer</>} zh={<>治<span className="en">Conquer</span></>} />
            </h4>
            <p>
              <T
                en={
                  <>
                    Solve each subproblem by recursion. When a subproblem is small enough
                    to answer directly, such as a single element, return the answer at
                    once. That case is the <b>base case</b>. Here you use the idea from
                    the introduction chapter: <b>trust the recursion</b> to return a
                    correct sub-answer, and do not trace the calls in your head.
                  </>
                }
                zh={
                  <>
                    递归解决每个子问题。到了<b>基准情形</b>(小到不能再分,如单个元素)就直接返回。
                    这一步用的是序章的<b>「递归信任」</b>:相信递归会把子答案正确带回来,别去展开想细节。
                  </>
                }
              />
            </p>
          </div>
          <div className="dvd-step">
            <div className="dvd-step-ico" aria-hidden>🔗</div>
            <h4>
              <T en={<>Combine</>} zh={<>合<span className="en">Combine</span></>} />
            </h4>
            <p>
              <T
                en={
                  <>
                    <b>Assemble</b> the sub-answers into the answer for the original
                    problem. This step decides almost everything: how hard the problem is
                    to solve, and what the final time complexity turns out to be.
                  </>
                }
                zh={
                  <>
                    把子答案<b>拼装</b>成原问题的答案。这一步是分治的灵魂 ——
                    一道题好不好做、复杂度多少,几乎全看「合」有多贵。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  In code the three steps become a fixed skeleton. The example below is{" "}
                  <strong>merge sort</strong>. Sorting is the classic first use of divide
                  and conquer. Chapter 01 covers its stability and its in-place version;
                  here it only shows the skeleton.
                </>
              }
              zh={
                <>
                  这三步落到代码里,就是一个固定骨架。下面用<strong>归并排序</strong>当模板
                  (排序是分治的「首秀」,01 排序章会细讲它的稳定性与原地优化,这里只借它示范骨架):
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="merge_sort_template"
          java={{
            code: {
              en: `class Solution {
    public int[] sortArray(int[] a) {
        if (a.length <= 1) return a;      // conquer: one element is already sorted
        int mid = a.length / 2;           // divide: cut in half
        int[] left  = sortArray(Arrays.copyOfRange(a, 0, mid));
        int[] right = sortArray(Arrays.copyOfRange(a, mid, a.length));
        return merge(left, right);        // combine: merge two sorted halves
    }

    private int[] merge(int[] x, int[] y) {
        int[] out = new int[x.length + y.length];
        int i = 0, j = 0, k = 0;
        while (i < x.length && j < y.length)
            out[k++] = x[i] <= y[j] ? x[i++] : y[j++];  // <= keeps it stable
        while (i < x.length) out[k++] = x[i++];
        while (j < y.length) out[k++] = y[j++];
        return out;
    }
}`,
              zh: `class Solution {
    public int[] sortArray(int[] a) {
        if (a.length <= 1) return a;      // 治:单个元素本身就是有序的
        int mid = a.length / 2;           // 分:对半切
        int[] left  = sortArray(Arrays.copyOfRange(a, 0, mid));
        int[] right = sortArray(Arrays.copyOfRange(a, mid, a.length));
        return merge(left, right);        // 合:合并两段有序数组
    }

    private int[] merge(int[] x, int[] y) {
        int[] out = new int[x.length + y.length];
        int i = 0, j = 0, k = 0;
        while (i < x.length && j < y.length)
            out[k++] = x[i] <= y[j] ? x[i++] : y[j++];  // <= 保证稳定
        while (i < x.length) out[k++] = x[i++];
        while (j < y.length) out[k++] = y[j++];
        return out;
    }
}`,
            },
            hl: [3, 4, 5, 6, 7],
            note: {
              en: (
                <>
                  The three steps are visible in order: <b>divide</b> (cut in half),{" "}
                  <b>conquer</b> (recurse on both sides), <b>combine</b> (merge).{" "}
                  <code>Arrays.copyOfRange</code> allocates a new array at every level, so
                  this version uses O(n) extra space. Chapter 01 shows the version that
                  reuses one shared buffer.
                </>
              ),
              zh: (
                <>
                  三步一目了然:<b>分</b>(对半)→ <b>治</b>(递归左右)→ <b>合</b>(merge)。
                  <code>Arrays.copyOfRange</code> 每层都新建数组,额外空间 O(n);排序章会讲带辅助数组的原地版。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def sortArray(self, a: list[int]) -> list[int]:
        if len(a) <= 1:
            return a                     # conquer: base case
        mid = len(a) // 2                # divide: cut in half
        left = self.sortArray(a[:mid])
        right = self.sortArray(a[mid:])
        return self._merge(left, right)  # combine: merge two sorted halves

    def _merge(self, x: list[int], y: list[int]) -> list[int]:
        out, i, j = [], 0, 0
        while i < len(x) and j < len(y):
            if x[i] <= y[j]:
                out.append(x[i]); i += 1
            else:
                out.append(y[j]); j += 1
        out.extend(x[i:]); out.extend(y[j:])
        return out`,
              zh: `class Solution:
    def sortArray(self, a: list[int]) -> list[int]:
        if len(a) <= 1:
            return a                     # 治:基准情形
        mid = len(a) // 2                # 分:对半切
        left = self.sortArray(a[:mid])
        right = self.sortArray(a[mid:])
        return self._merge(left, right)  # 合:合并两段有序数组

    def _merge(self, x: list[int], y: list[int]) -> list[int]:
        out, i, j = [], 0, 0
        while i < len(x) and j < len(y):
            if x[i] <= y[j]:
                out.append(x[i]); i += 1
            else:
                out.append(y[j]); j += 1
        out.extend(x[i:]); out.extend(y[j:])
        return out`,
            },
            hl: [5, 6, 7, 8],
            note: {
              en: (
                <>
                  A slice such as <code>a[:mid]</code> <b>copies</b> the elements every
                  time. That is easy to read but it costs extra time and memory. A common
                  alternative is to pass the index range <code>(lo, hi)</code> and read
                  the original list in place.
                </>
              ),
              zh: (
                <>
                  <code>a[:mid]</code> 这类切片每次都<b>复制</b>一份,直观但有额外开销;
                  竞赛里常改成传下标 <code>(lo, hi)</code> 只读不复制。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var sortArray = function (a) {
  if (a.length <= 1) return a;          // conquer: base case
  const mid = a.length >> 1;            // divide: cut in half
  const left = sortArray(a.slice(0, mid));
  const right = sortArray(a.slice(mid));
  return merge(left, right);            // combine
};

function merge(x, y) {
  const out = [];
  let i = 0, j = 0;
  while (i < x.length && j < y.length)
    out.push(x[i] <= y[j] ? x[i++] : y[j++]);
  while (i < x.length) out.push(x[i++]);
  while (j < y.length) out.push(y[j++]);
  return out;
}`,
              zh: `var sortArray = function (a) {
  if (a.length <= 1) return a;          // 治:基准情形
  const mid = a.length >> 1;            // 分:对半切
  const left = sortArray(a.slice(0, mid));
  const right = sortArray(a.slice(mid));
  return merge(left, right);            // 合
};

function merge(x, y) {
  const out = [];
  let i = 0, j = 0;
  while (i < x.length && j < y.length)
    out.push(x[i] <= y[j] ? x[i++] : y[j++]);
  while (i < x.length) out.push(x[i++]);
  while (j < y.length) out.push(y[j++]);
  return out;
}`,
            },
            hl: [2, 3, 4, 5, 6],
            note: {
              en: (
                <>
                  <code>a.length &gt;&gt; 1</code> shifts right by one bit, which is
                  integer division by 2. <code>slice</code> also copies the elements, so
                  it costs extra memory on large inputs.
                </>
              ),
              zh: (
                <>
                  <code>a.length &gt;&gt; 1</code> 是「整数除以 2」的位运算写法(右移一位)。
                  <code>slice</code> 同样是复制,数据量大时注意开销。
                </>
              ),
            },
          }}
        />
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Three properties of merge sort are worth fixing in your memory now,
                  because they come back in every sorting question. Its time is{" "}
                  <BigO o="nlogn" /> in the best, the average, <b>and</b> the worst
                  case, because the split is always down the middle and never depends
                  on the values. It needs <BigO o="n" /> auxiliary space for the output
                  buffer, plus <BigO o="logn" /> for the call stack. And it is{" "}
                  <b>stable</b>: equal values keep their original order, because the
                  merge takes from the left half on a tie. That is what{" "}
                  <code>&lt;=</code> is doing in the code above.
                </>
              }
              zh={
                <>
                  归并排序有三条性质,现在记住,后面每道排序题都会用到。时间是{" "}
                  <BigO o="nlogn" />,而且最好、平均、<b>最坏</b>都一样 ——
                  因为它永远从正中间切,切法与数据无关。空间上,输出缓冲要{" "}
                  <BigO o="n" /> 辅助空间,递归栈再占 <BigO o="logn" />。
                  它还是<b>稳定</b>的:相等的元素保持原来的先后,因为合并时遇到相等取左半那个 ——
                  这就是上面代码里 <code>&lt;=</code> 的作用。
                </>
              }
            />
          </p>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "Why is divide and conquer correct? Induction",
            zh: "为什么分治一定对?数学归纳法",
          }}
        >
          <p>
            <T
              en={
                <>
                  A divide and conquer solution is proved correct by <b>induction</b>, the
                  same method used for recursion. Step one: <b>the base case is correct</b>.
                  A single element is already sorted, so that is true. Step two:{" "}
                  <b>the inductive step is correct</b>. Assume the recursive calls sort the
                  left half and the right half correctly. If <code>merge</code> turns two
                  sorted arrays into one sorted array, the whole array is sorted. Both
                  steps hold, so the result holds for every input size.{" "}
                  <b>You only ever have to prove the combine step</b>. The recursive part
                  is covered by the inductive assumption. That is the reason you are
                  allowed to trust the recursion.
                </>
              }
              zh={
                <>
                  证明分治正确,套的是<b>归纳法</b>,和证递归同一个模子:①<b>基准情形对</b>
                  —— 单个元素本身就是有序的,这一步显然成立;②<b>归纳步对</b> ——
                  假设递归能把左、右两半各自排好(归纳假设),只要 merge 能把两段有序数组正确合成一段有序,
                  那整段就对了。两步都成立 ⇒ 对任意规模都对。<b>你永远只需要证「合」这一步</b>,
                  递归的部分交给归纳假设,这正是「递归信任」的数学底气。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="warn"
          title={{ en: "Two common beginner mistakes", zh: "新手最容易翻的两条船" }}
        >
          <p>
            <T
              en={
                <>
                  1. <b>The subproblem does not get smaller.</b> If the divide step
                  produces one empty part and one part the same size as the input, the
                  recursion never ends and the call stack overflows. Every call must move
                  closer to the base case. 2. <b>The base case is missing or wrong.</b> If
                  you forget the <code>length &lt;= 1</code> exit, or write the condition
                  incorrectly, the recursion also never ends. The rule from the
                  introduction chapter still applies: <b>write the exit first, then write
                  the recursive calls</b>.
                </>
              }
              zh={
                <>
                  ① <b>子问题没变小</b>:如果「分」之后子问题规模没真的下降(比如切出一个空段 + 原样大段),
                  递归就会无限套娃、栈溢出。务必保证每次都朝基准情形靠近。
                  ② <b>漏写基准情形</b>:忘了 <code>length &lt;= 1</code> 的出口,或出口条件写错,
                  同样停不下来。序章说过:<b>先写出口,再写递归</b>。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="deep"
          title={{
            en: "In practice: divide and conquer scales computation",
            zh: "工程现场:分治是大规模计算的底层世界观",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>MapReduce</b> (from Google), Hadoop, and Spark all use this structure.
                  They split a large dataset into pieces, send the pieces to many machines
                  that each compute a partial result (map), and then combine the partial
                  results (reduce). When the data does not fit in memory,{" "}
                  <b>external merge sort</b> splits the file into blocks that do fit, sorts
                  each block, and merges the sorted blocks. That is the same merge step,
                  applied to files instead of arrays. Divide and conquer matters because it
                  is also the standard way to describe work that can run in parallel.
                </>
              }
              zh={
                <>
                  Google 的 <b>MapReduce</b>、Hadoop、Spark,本质都是分治:把海量数据切片(map)分发到成千上万台机器,
                  各自算局部结果,再汇总(reduce)。数据大到单机装不下时,<b>外部归并排序</b>把文件切成能进内存的小块,
                  分别排好再多路归并 —— 就是本章 merge 的放大版。分治之所以重要,是因为它是「把大事拆成能并行的小事」的通用语言。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 递归树与复杂度 ================= */}
      <Section
        id="cost"
        index="02"
        title={{
          en: "The recursion tree: work per level × number of levels",
          zh: "递归树:分治的复杂度,画出来就懂",
        }}
        desc={{
          en: "You can count the cost of a divide and conquer algorithm without memorizing any formula.",
          zh: "不背主定理公式,只数「每层做多少工 × 一共几层」",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Almost every divide and conquer running time can be written as a{" "}
                  <strong>recurrence</strong>. Read it as: the original problem costs{" "}
                  <code>a</code> subproblems of size <code>n/b</code>, plus{" "}
                  <code>f(n)</code> for the divide and combine steps.
                </>
              }
              zh={
                <>
                  分治的时间复杂度,几乎都能写成一个<strong>递推式</strong>。读法是:
                  原问题 = <code>a</code> 个规模 <code>n/b</code> 的子问题,
                  加上「分」与「合」的代价 <code>f(n)</code>。
                </>
              }
            />
          </p>
        </div>
        <div className="dvd-formula">T(n) = a · T(n/b) + f(n)</div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Merge sort is <code>T(n) = 2·T(n/2) + O(n)</code>: two halves, and one
                  linear pass to merge them. Rather than memorizing a formula, draw the
                  recursion <strong>as a tree</strong> and count two numbers.
                </>
              }
              zh={
                <>
                  归并排序就是 <code>T(n) = 2·T(n/2) + O(n)</code>:切成 2 个半问题,
                  合并扫一遍是 O(n)。与其背公式,不如把递归<strong>画成一棵树</strong>,数两个数:
                </>
              }
            />
          </p>
        </div>
        <MergeSortLayers />
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Look at the levels in the animation.{" "}
                  <strong>The merging work on each level adds up to O(n)</strong>: level 1
                  does four merges that produce runs of 2, level 2 does two merges that
                  produce runs of 4, and level 3 does one merge of 8. The number of
                  elements never changes, so each level costs O(n). The number of levels
                  is the number of times n can be halved down to 1, which is{" "}
                  <strong>log₂n</strong>. Multiply the two numbers:{" "}
                  <strong>O(n) × log n = O(n log n)</strong>. No formula needed.
                </>
              }
              zh={
                <>
                  看动画里的分层:<strong>每一层的合并工作量加起来都是 O(n)</strong>
                  (第 1 层是 4 次合并、每次产出长度 2 的段,第 2 层是 2 次合并、每次产出长度 4 的段,
                  第 3 层合成长度 8)。元素总数不变,所以每层都是 O(n)。
                  而层数是「把 n 对半砍到 1 的次数」= <strong>log₂n</strong>。
                  两个数一乘:<strong>O(n) × log n = O(n log n)</strong>,不需要任何公式。
                </>
              }
            />
          </p>
          <p>
            <T
              en={<>The same counting handles most of the recurrences you will meet:</>}
              zh={<>同一套「数两个数」的方法,能秒算一大票常见递推式:</>}
            />
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th><T en="Recurrence" zh="递推式" /></th>
                <th><T en="Work per level" zh="每层总工" /></th>
                <th><T en="Levels" zh="层数" /></th>
                <th><T en="Result" zh="结果" /></th>
                <th><T en="Example" zh="代表算法" /></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>T(n)=2T(n/2)+O(n)</code></td>
                <td><T en="O(n), the same on every level" zh="O(n)(每层相同)" /></td>
                <td>log n</td>
                <td><BigO o="nlogn" /></td>
                <td><T en="Merge sort, LC 23" zh="归并排序、LC 23" /></td>
              </tr>
              <tr>
                <td><code>T(n)=2T(n/2)+O(1)</code></td>
                <td><T en="Grows downward, the leaves dominate" zh="越往下越多(叶子主导)" /></td>
                <td>log n</td>
                <td><BigO o="n" /></td>
                <td>
                  <T
                    en="Visiting every node of a full binary tree"
                    zh="遍历满二叉树的每个节点"
                  />
                </td>
              </tr>
              <tr>
                <td><code>T(n)=T(n/2)+O(1)</code></td>
                <td>O(1)</td>
                <td>log n</td>
                <td><BigO o="logn" /></td>
                <td><T en="Binary search, fast power" zh="二分查找、快速幂" /></td>
              </tr>
              <tr>
                <td><code>T(n)=T(n/2)+O(n)</code></td>
                <td><T en="Shrinks downward, the root dominates" zh="越往上越多(树根主导)" /></td>
                <td>log n</td>
                <td><BigO o="n" /></td>
                <td><T en="Quickselect (expected)" zh="快速选择(期望)" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The pattern behind the table is one question:{" "}
                  <strong>
                    is the work concentrated at the root, spread evenly, or concentrated
                    at the leaves?
                  </strong>{" "}
                  Evenly spread costs one extra factor of log n. Root-heavy follows the
                  root. Leaf-heavy follows the number of leaves. The Master theorem is
                  the exact version of that question.
                </>
              }
              zh={
                <>
                  规律看出来了吗?这张表只在问一句话:
                  <strong>「工作量集中在树根、均匀分布,还是集中在叶子?」</strong>
                  均匀(每层一样)就多一个 log 因子;根重就随树根走;叶子重就随叶子总数走。
                  主定理,就是这句话的精确版本。
                </>
              }
            />
          </p>
        </div>
        <Callout
          tone="deep"
          title={{
            en: "The Master theorem, stated exactly",
            zh: "主定理的精确写法",
          }}
        >
          <p>
            <T
              en={
                <>
                  For <code>T(n) = a·T(n/b) + f(n)</code> with <code>a ≥ 1</code> and{" "}
                  <code>b &gt; 1</code>, compare <code>f(n)</code>, the cost of dividing
                  and combining, with <code>n^(log_b a)</code>, which is how many leaves
                  the tree has.
                </>
              }
              zh={
                <>
                  对 <code>T(n) = a·T(n/b) + f(n)</code>(<code>a ≥ 1</code>、
                  <code>b &gt; 1</code>),把「分 + 合」的代价 <code>f(n)</code> 和
                  <code>n^(log_b a)</code>(递归树的叶子数)做比较:
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>Case 1.</b> <code>f(n)</code> is <b>polynomially smaller</b>, that is{" "}
                  <code>f(n) = O(n^(log_b a − ε))</code> for some <code>ε &gt; 0</code>.
                  The leaves dominate and <code>T(n) = Θ(n^(log_b a))</code>.
                  <br />
                  <b>Case 2.</b> The two have the same order,{" "}
                  <code>f(n) = Θ(n^(log_b a))</code>. Every level costs the same and{" "}
                  <code>T(n) = Θ(n^(log_b a) · log n)</code>.
                  <br />
                  <b>Case 3.</b> <code>f(n)</code> is <b>polynomially larger</b>,{" "}
                  <code>f(n) = Ω(n^(log_b a + ε))</code> for some <code>ε &gt; 0</code>,{" "}
                  <b>and</b> the regularity condition <code>a·f(n/b) ≤ c·f(n)</code>{" "}
                  holds for some constant <code>c &lt; 1</code> and all large enough n.
                  Then the root dominates and <code>T(n) = Θ(f(n))</code>.
                </>
              }
              zh={
                <>
                  <b>情况 1.</b> <code>f(n)</code> <b>多项式地更小</b>,即存在{" "}
                  <code>ε &gt; 0</code> 使 <code>f(n) = O(n^(log_b a − ε))</code>。
                  叶子主导,<code>T(n) = Θ(n^(log_b a))</code>。
                  <br />
                  <b>情况 2.</b> 两者同阶,<code>f(n) = Θ(n^(log_b a))</code>。
                  每层代价相同,<code>T(n) = Θ(n^(log_b a) · log n)</code>。
                  <br />
                  <b>情况 3.</b> <code>f(n)</code> <b>多项式地更大</b>,即存在{" "}
                  <code>ε &gt; 0</code> 使 <code>f(n) = Ω(n^(log_b a + ε))</code>,
                  <b>并且</b>满足正则条件:存在常数 <code>c &lt; 1</code>,
                  对充分大的 n 有 <code>a·f(n/b) ≤ c·f(n)</code>。
                  此时树根主导,<code>T(n) = Θ(f(n))</code>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Two things are easy to get wrong. The regularity condition in case 3 is
                  <b> not optional</b>: without it the root cost may not shrink fast
                  enough going down, and the sum is no longer Θ(f(n)). And the three cases{" "}
                  <b>do not cover every recurrence</b> — there are gaps between them.{" "}
                  <code>T(n) = 2T(n/2) + n log n</code> is one: here{" "}
                  <code>n^(log_b a) = n</code> and <code>f(n) = n log n</code> is larger
                  than n but not <i>polynomially</i> larger, so no case applies. Its
                  answer, <code>Θ(n log²n)</code>, has to come from the recursion tree.
                  That is why the picture is worth more than the formula.
                </>
              }
              zh={
                <>
                  两处最容易记错。其一,情况 3 的正则条件<b>不能省</b> ——
                  没有它,根的代价往下未必衰减得够快,总和也就不再是 Θ(f(n))。
                  其二,这三种情况<b>并不覆盖所有递推式</b>,它们之间有缝隙。
                  <code>T(n) = 2T(n/2) + n log n</code> 就掉在缝里:此时{" "}
                  <code>n^(log_b a) = n</code>,而 <code>f(n) = n log n</code> 比 n 大,
                  却不是<i>多项式地</i>大,三种情况都套不上。它的真实答案{" "}
                  <code>Θ(n log²n)</code> 只能靠递归树数出来 —— 所以画图比背公式更管用。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="win"
          title={{
            en: "How to answer a complexity question in an interview",
            zh: "面试话术:被问复杂度,就画递归树",
          }}
        >
          <p>
            <T
              en={
                <>
                  When the interviewer asks how fast your divide and conquer solution is,
                  do not jump straight to the answer. Say this instead: &quot;I write the
                  recurrence T(n) = a·T(n/b) + f(n) and draw the recursion tree. The root
                  costs f(n), there are about log_b n levels, and the tree has n^(log_b a)
                  leaves. Comparing those two tells me which side dominates, so...&quot;
                  Deriving it on the spot is safer than reciting a result, and it shows
                  where the number comes from. This one method covers every divide and
                  conquer problem in the chapter.
                </>
              }
              zh={
                <>
                  面试官问「你这个分治多少复杂度?」,别急着报答案。可以说:
                  「我先写出递推式 T(n) = a·T(n/b) + f(n),再画递归树:树根这一层是 f(n),
                  一共约 log_b n 层,叶子有 n^(log_b a) 个 —— 比较这两边谁占主导,所以……」
                  当场推导比背结论稳,也说清了这个数是怎么来的。
                  这套方法足以覆盖本章所有分治题。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 精讲 A · 快速幂 LC 50 ================= */}
      <Section
        id="pow"
        index="03"
        title={{
          en: "Worked example A · LC 50 Pow(x, n): from n multiplications to log n",
          zh: "精讲 A · LC 50 Pow(x, n):把「乘 n 次」压成 log n 次",
        }}
        desc={{
          en: "The first big win of divide and conquer: the exponent is halved at every step.",
          zh: "分治的第一个惊艳战果 —— 指数每次对半砍",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>Problem:</b> compute x raised to the power n. <b>Brute force:</b> a
                  loop that multiplies n times, O(n). When n is near 2³¹ that is more
                  than two billion multiplications, too slow to pass.{" "}
                  <b>How can it be faster?</b> To get x⁸, instead of multiplying x by
                  itself eight times, compute x² = x·x, then x⁴ = (x²)², then x⁸ = (x⁴)².{" "}
                  <strong>Each squaring doubles the exponent</strong>, so three squarings
                  reach x⁸. Going from exponent 8 down to 1 takes log₂8 = 3 steps.
                </>
              }
              zh={
                <>
                  <b>题意:</b>实现 x 的 n 次幂,x^n。<b>暴力:</b>一个循环乘 n 次,O(n)。
                  n 接近 2³¹ 时要乘二十多亿次,超时。<b>能不能更快?</b>关键观察:
                  算 x⁸ 时,与其把 x 自乘 8 次,不如 x² =(x·x),x⁴ =(x²)²,x⁸ =(x⁴)² ——
                  <strong>每平方一次,指数就翻倍</strong>,3 次平方就到 x⁸。
                  指数从 8 降到 1,只要 log₂8 = 3 步。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  This is divide and conquer: <code>x^n = (x^(n/2))²</code>. If n is even,
                  square directly. If n is odd, <code>x^n = (x^(n/2))² · x</code>, adding
                  back the single x that integer division dropped. Here is 3¹³ being cut
                  down and combined back up:
                </>
              }
              zh={
                <>
                  这正是分治:<code>x^n =(x^(n/2))²</code>。n 是偶数直接平方;n 是奇数,就
                  <code>x^n =(x^(n/2))² · x</code>(补回整数除法丢掉的那一个 x)。
                  以 3¹³ 为例,一路砍下去再合回来:
                </>
              }
            />
          </p>
        </div>
        <PowTree />
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Notice that this &quot;tree&quot; is really a <strong>chain</strong>.
                  Each call produces <strong>one</strong> subproblem, x^(n/2), not two. So
                  there are log n levels with O(1) work on each:{" "}
                  <strong>O(log n) time and O(log n) stack</strong>.{" "}
                  <strong>Binary search has the same shape</strong> — it splits the range
                  in two, but only one half survives, so it is O(log n) and not
                  O(n log n). Merge sort keeps both halves, and that is exactly why it
                  costs O(n log n) instead.
                </>
              }
              zh={
                <>
                  注意这棵「树」其实是一条<strong>链</strong> —— 每次递归只产生
                  <strong>一个</strong>子问题(x^(n/2)),不是两个。所以层数 = log n,
                  每层 O(1),合计 <strong>O(log n) 时间、O(log n) 递归栈</strong>。
                  <strong>二分查找是同一个形状</strong>:也把区间切两半,但只有一半活下来,
                  所以是 O(log n) 而不是 O(n log n)。归并排序两半都要留,
                  这才是它要 O(n log n) 的原因。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc50_fast_pow_recursive"
          java={{
            code: {
              en: `class Solution {
    public double myPow(double x, int n) {
        long N = n;                       // cast to long: negating -2^31 overflows int
        if (N < 0) { x = 1 / x; N = -N; } // negative exponent: take 1/x
        return fastPow(x, N);
    }

    private double fastPow(double x, long n) {
        if (n == 0) return 1.0;           // base case: x^0 = 1
        double half = fastPow(x, n / 2);  // compute it ONCE, keep it in a variable
        double sq = half * half;          // squaring doubles the exponent
        return (n % 2 == 1) ? sq * x : sq; // odd n needs one extra x
    }
}`,
              zh: `class Solution {
    public double myPow(double x, int n) {
        long N = n;                       // 先转 long:n = -2³¹ 取负会溢出 int
        if (N < 0) { x = 1 / x; N = -N; } // 负指数 = 底数取倒数
        return fastPow(x, N);
    }

    private double fastPow(double x, long n) {
        if (n == 0) return 1.0;           // 基准情形:x⁰ = 1
        double half = fastPow(x, n / 2);  // ★ 只算一次,存进变量!
        double sq = half * half;          // 平方 → 指数翻倍
        return (n % 2 == 1) ? sq * x : sq; // 奇数补乘一个 x
    }
}`,
            },
            hl: [10, 11, 12],
            note: {
              en: (
                <>
                  <b>Two traps.</b> 1. When <code>n = Integer.MIN_VALUE</code>,{" "}
                  <code>-n</code> overflows, so convert to <code>long</code> before
                  negating. 2. Never write{" "}
                  <code>fastPow(x,n/2)*fastPow(x,n/2)</code>. That solves the same
                  subproblem twice and the time falls back to O(n).
                </>
              ),
              zh: (
                <>
                  <b>两个坑:</b>① <code>n = Integer.MIN_VALUE</code> 时 <code>-n</code> 溢出 ——
                  先转 <code>long</code> 再取负;② 千万别写成
                  <code>fastPow(x,n/2)*fastPow(x,n/2)</code>,那会把同一个子问题算两遍,退化成 O(n)。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n < 0:
            x, n = 1 / x, -n         # Python ints are unbounded, negating is safe
        def fast(n: int) -> float:
            if n == 0:
                return 1.0           # base case
            half = fast(n // 2)      # compute it ONCE
            sq = half * half
            return sq * x if n & 1 else sq  # n & 1 tests the lowest bit
        return fast(n)`,
              zh: `class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n < 0:
            x, n = 1 / x, -n         # Python 整数无限精度,取负不会溢出
        def fast(n: int) -> float:
            if n == 0:
                return 1.0           # 基准情形
            half = fast(n // 2)      # ★ 只算一次
            sq = half * half
            return sq * x if n & 1 else sq  # n & 1 判奇偶
        return fast(n)`,
            },
            hl: [8, 9, 10],
            note: {
              en: (
                <>
                  Python integers have unlimited precision, so the overflow trap does not
                  exist here and a negative exponent can be negated directly.{" "}
                  <code>n &amp; 1</code> reads the lowest bit to test odd or even; it is
                  more common than <code>n % 2</code> in this kind of code (the bit
                  manipulation chapter covers it).
                </>
              ),
              zh: (
                <>
                  Python 的大整数天生免疫溢出坑,负指数直接取负即可。
                  <code>n &amp; 1</code> 取最低位判奇偶,比 <code>n % 2</code> 更常见(位运算章会细讲)。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var myPow = function (x, n) {
  let N = n;
  if (N < 0) { x = 1 / x; N = -N; }  // negative exponent: take 1/x
  const fast = (n) => {
    if (n === 0) return 1;           // base case
    const half = fast(Math.floor(n / 2)); // compute it ONCE
    const sq = half * half;
    return n % 2 === 1 ? sq * x : sq; // odd n needs one extra x
  };
  return fast(N);
};`,
              zh: `var myPow = function (x, n) {
  let N = n;
  if (N < 0) { x = 1 / x; N = -N; }  // 负指数 = 取倒数
  const fast = (n) => {
    if (n === 0) return 1;           // 基准情形
    const half = fast(Math.floor(n / 2)); // ★ 只算一次
    const sq = half * half;
    return n % 2 === 1 ? sq * x : sq; // 奇数补乘
  };
  return fast(N);
};`,
            },
            hl: [6, 7, 8],
            note: {
              en: (
                <>
                  A JavaScript <code>number</code> is a 64-bit float and represents 2³¹
                  exactly, so there is no need for the <code>long</code> cast Java
                  requires. But keep <code>Math.floor(n/2)</code> and do not write{" "}
                  <code>n &gt;&gt; 1</code>: bitwise operators truncate their operand to
                  32 bits.
                </>
              ),
              zh: (
                <>
                  JS 的 <code>number</code> 是 64 位浮点,能精确表示 2³¹,不必像 Java 特意转 long;
                  但 <code>Math.floor(n/2)</code> 别写成 <code>n &gt;&gt; 1</code> —— 位运算会把操作数截成 32 位。
                </>
              ),
            },
          }}
        />
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The recursive version is clear, but it costs O(log n) stack. Production
                  code usually prefers the <strong>iterative version</strong>. Write n in
                  binary and scan from the lowest bit upward. Whenever a bit is 1,
                  multiply the value belonging to that bit position into the result. It is
                  the same computation with no stack at all:
                </>
              }
              zh={
                <>
                  递归清晰,但有 O(log n) 的栈开销。工程里更爱<strong>迭代版</strong>:
                  把 n 写成二进制,从低位往高位扫,遇到 1 就把「当前这一档的 x」乘进结果 ——
                  本质是同一件事,零栈开销:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc50_fast_pow_iterative"
          java={{
            code: {
              en: `class Solution {
    public double myPow(double x, int n) {
        long N = n;
        if (N < 0) { x = 1 / x; N = -N; }
        double res = 1.0;
        while (N > 0) {
            if ((N & 1) == 1) res *= x;  // this bit is 1 -> multiply it in
            x *= x;                      // x becomes x^2, x^4, x^8...
            N >>= 1;                     // shift right = divide the exponent by 2
        }
        return res;
    }
}`,
              zh: `class Solution {
    public double myPow(double x, int n) {
        long N = n;
        if (N < 0) { x = 1 / x; N = -N; }
        double res = 1.0;
        while (N > 0) {
            if ((N & 1) == 1) res *= x;  // 该二进制位是 1 → 乘上这一档
            x *= x;                      // x 依次变成 x², x⁴, x⁸…
            N >>= 1;                     // 指数右移一位 = 除以 2
        }
        return res;
    }
}`,
            },
            hl: [7, 8, 9],
            note: {
              en: (
                <>
                  Read the binary form of n: 13 = (1101)₂ = 8+4+1, so x¹³ = x⁸·x⁴·x¹. The
                  loop multiplies exactly those three values into <code>res</code>. This
                  is the default version in competitive and production code.
                </>
              ),
              zh: (
                <>
                  把「n 的二进制」拆开看:13 =(1101)₂ = 8+4+1,于是 x¹³ = x⁸·x⁴·x¹ ——
                  循环里正好在这三档乘进 res。迭代版是竞赛 / 工程的默认写法。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n < 0:
            x, n = 1 / x, -n
        res = 1.0
        while n:
            if n & 1:
                res *= x          # this bit is 1
            x *= x                # x -> x^2, x^4, x^8...
            n >>= 1
        return res`,
              zh: `class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n < 0:
            x, n = 1 / x, -n
        res = 1.0
        while n:
            if n & 1:
                res *= x          # 该二进制位为 1
            x *= x                # x → x², x⁴, x⁸…
            n >>= 1
        return res`,
            },
            hl: [6, 7, 8, 9],
            note: {
              en: (
                <>
                  In Python <code>while n:</code> means <code>while n != 0</code>. This
                  version has no recursion, so the recursion depth limit never applies.
                  It is the safest choice for very large exponents.
                </>
              ),
              zh: (
                <>
                  <code>while n:</code> 在 Python 里等价于 <code>while n != 0</code>。
                  这版没有递归,也就没有递归深度限制,处理超大指数最稳。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var myPow = function (x, n) {
  let N = n, res = 1;
  if (N < 0) { x = 1 / x; N = -N; }
  while (N > 0) {
    if (N % 2 === 1) res *= x;   // this bit is 1
    x *= x;                      // x -> x^2, x^4, x^8...
    N = Math.floor(N / 2);       // N can reach 2^31, so do not use >>
  }
  return res;
};`,
              zh: `var myPow = function (x, n) {
  let N = n, res = 1;
  if (N < 0) { x = 1 / x; N = -N; }
  while (N > 0) {
    if (N % 2 === 1) res *= x;   // 该位为 1
    x *= x;                      // x → x², x⁴, x⁸…
    N = Math.floor(N / 2);       // N 可达 2³¹,别用 >>(会截成 32 位)
  }
  return res;
};`,
            },
            hl: [5, 6, 7],
            note: {
              en: (
                <>
                  <code>% 2</code> and <code>Math.floor(N/2)</code> are used here on
                  purpose instead of bitwise operators: when N reaches 2³¹ it no longer
                  fits in 32 bits, and <code>&amp;</code> or <code>&gt;&gt;</code> would
                  give the wrong result.
                </>
              ),
              zh: (
                <>
                  这里刻意用 <code>% 2</code> 和 <code>Math.floor(N/2)</code> 而非位运算:
                  N 取到 2³¹ 时超出 32 位,<code>&amp;</code> / <code>&gt;&gt;</code> 会算错。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and follow-up questions",
            zh: "复杂度 & 追问",
          }}
        >
          <p>
            <T
              en={
                <>
                  Time <b>O(log n)</b>. Space O(log n) for the recursive version and{" "}
                  <b>O(1)</b> for the iterative one. Three follow-ups come up often.{" "}
                  1. &quot;What if the answer must be taken modulo a large prime?&quot;
                  Take the modulus after every multiplication. That is{" "}
                  <b>modular exponentiation</b>, the core of RSA and of many counting
                  problems (the maths chapter covers it). 2. &quot;Compute the 10¹⁸-th
                  Fibonacci number.&quot; Use <b>matrix fast power</b>: write the
                  recurrence as a matrix product and apply fast power to the matrix, which
                  needs O(log n) matrix multiplications. 3. &quot;Why can you not compute
                  x^(n/2) twice?&quot; Because the recursion tree becomes full again and
                  the time returns to O(n).
                </>
              }
              zh={
                <>
                  时间 <b>O(log n)</b>,空间 O(log n)(递归)或 <b>O(1)</b>(迭代)。三个高频追问:
                  ①「要对大质数取模呢?」→ 每步乘完就取模,这就是<b>快速幂取模</b>,
                  RSA 加密和很多计数题的核心(数学章细讲);②「算斐波那契第 10¹⁸ 项?」→
                  <b>矩阵快速幂</b>:把递推写成矩阵乘法,再对矩阵做快速幂,只需 O(log n) 次矩阵乘;
                  ③「为什么不能算两遍 x^(n/2)?」→ 递归树会重新长成满二叉树,时间退化回 O(n)。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="deep"
          title={{
            en: "In practice: every HTTPS handshake runs fast power",
            zh: "工程现场:每一次 HTTPS 握手,都在跑快速幂",
          }}
        >
          <p>
            <T
              en={
                <>
                  Public key cryptography such as RSA and Diffie-Hellman is built on
                  modular exponentiation, a^b mod m, where b has hundreds or thousands of
                  bits. Multiplying one step at a time would take about 2^2048
                  multiplications for a 2048-bit exponent, which no machine can finish.
                  Fast power needs about 2048 squarings, plus at most one extra
                  multiplication per bit. The lock icon in your address bar rests on these
                  few lines of divide and conquer.
                </>
              }
              zh={
                <>
                  RSA、Diffie-Hellman 这些公钥密码,核心运算是「模幂」a^b mod m,
                  其中 b 是几百上千位的大数。老老实实一次次相乘,2048 位的指数要乘约 2^2048 次,
                  任何机器都算不完;换成快速幂,只需约 2048 次平方,外加每一位至多一次补乘。
                  浏览器地址栏那把小锁,底层就站着这几行分治代码。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 精讲 B · 合并 K 链表 LC 23 ================= */}
      <Section
        id="merge"
        index="04"
        title={{
          en: "Worked example B · LC 23 Merge k Sorted Lists: merge in pairs",
          zh: "精讲 B · LC 23 合并 K 个升序链表:两两归并",
        }}
        desc={{
          en: "Merging moves from arrays to linked lists, and pairing saves a whole factor.",
          zh: "归并思想从「排数组」升级到「合链表」—— 分治省下一个量级",
        }}
        badge={<span className="lc-badge" data-d="hard">HARD</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>Problem:</b> given k sorted linked lists, merge them into one sorted
                  list. Let N be the total number of nodes.{" "}
                  <b>Brute force (one list at a time):</b> take the first list as the
                  base, merge the second into it, then the third, and so on. The problem
                  is that the base list <strong>grows with every merge</strong>: merge
                  number i walks about the first i lists in full, and the sum is{" "}
                  <BigO o="n2" label="O(k·N)" />. <b>The idea:</b> merging two lists costs
                  only the total length of those two lists, so{" "}
                  <strong>reduce the number of merges</strong>. Merging in pairs does
                  exactly that:
                </>
              }
              zh={
                <>
                  <b>题意:</b>给 k 条各自升序的链表,合并成一条升序链表。设总节点数为 N。
                  <b> 暴力(逐条并入):</b>拿第 1 条当底,把第 2 条合并进来,再合并第 3 条……
                  问题是底链<strong>越并越长</strong>:第 i 次合并要扫过约前 i 条的全部节点,
                  累加下来是 <BigO o="n2" label="O(k·N)" />。
                  <b> 优化思路:</b>合并两条链表的代价,只跟这两条的总长有关 ——
                  那就<strong>让合并次数尽量少</strong>。两两配对归并正好做到:
                </>
              }
            />
          </p>
        </div>
        <MergeKLists />
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Compare the two methods. Merging one at a time needs k rounds and the
                  base list keeps growing. Merging in pairs{" "}
                  <strong>halves the number of lists each round</strong>, so it needs only
                  log₂k rounds, and within a round every one of the N nodes is{" "}
                  <strong>compared and moved exactly once</strong> (O(N) per level).
                  Multiply the two numbers: <strong>O(N log k)</strong>, plus O(log k)
                  stack for the recursion. With k = 10000, log₂k ≈ 13, three orders of
                  magnitude below k.
                </>
              }
              zh={
                <>
                  对比一下:逐条并入要 k 轮,且底链持续变长;两两归并每轮把链表条数
                  <strong>减半</strong>,只需 log₂k 轮,而每一轮里,所有 N 个节点
                  <strong>各自只被比较搬运一次</strong>(每层总工 O(N))。
                  两个数一乘:<strong>O(N log k)</strong>,外加 O(log k) 递归栈。
                  k = 10000 时,log₂k ≈ 13,比 k 小了三个量级。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc23_merge_k_lists"
          java={{
            code: {
              en: `class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        if (lists.length == 0) return null;
        return merge(lists, 0, lists.length - 1);
    }

    // divide and conquer: merge lists[lo..hi] into one list
    private ListNode merge(ListNode[] lists, int lo, int hi) {
        if (lo == hi) return lists[lo];        // base case: one list left
        int mid = (lo + hi) >>> 1;             // divide: cut in half
        ListNode l = merge(lists, lo, mid);    // conquer: left half -> one list
        ListNode r = merge(lists, mid + 1, hi);// conquer: right half -> one list
        return mergeTwo(l, r);                 // combine: merge two sorted lists (LC 21)
    }

    private ListNode mergeTwo(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(0), tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { tail.next = a; a = a.next; }
            else { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = (a != null) ? a : b;       // attach whichever list has nodes left
        return dummy.next;
    }
}`,
              zh: `class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        if (lists.length == 0) return null;
        return merge(lists, 0, lists.length - 1);
    }

    // 分治:合并 lists[lo..hi] 这一段链表
    private ListNode merge(ListNode[] lists, int lo, int hi) {
        if (lo == hi) return lists[lo];        // 基准:只剩一条,直接返回
        int mid = (lo + hi) >>> 1;             // 分:对半
        ListNode l = merge(lists, lo, mid);    // 治:左半合成一条
        ListNode r = merge(lists, mid + 1, hi);// 治:右半合成一条
        return mergeTwo(l, r);                 // 合:合并两条有序链表(LC 21)
    }

    private ListNode mergeTwo(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(0), tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { tail.next = a; a = a.next; }
            else { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = (a != null) ? a : b;       // 接上剩余那条
        return dummy.next;
    }
}`,
            },
            hl: [9, 10, 11, 12, 13],
            note: {
              en: (
                <>
                  <code>mergeTwo</code> is the LC 21 template from the linked list chapter
                  of DataData. The <code>dummy</code> sentinel node removes the special
                  case for the head. The recursion is log k deep and performs k−1 merges
                  in total.
                </>
              ),
              zh: (
                <>
                  <code>mergeTwo</code> 就是 DataData 链表章的 LC 21 模板;
                  <code>dummy</code> 哨兵节点免去「头节点特判」。递归深度 log k,合并次数 k−1。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def mergeKLists(self, lists: list[ListNode]) -> ListNode:
        if not lists:
            return None

        def merge(lo: int, hi: int) -> ListNode:
            if lo == hi:
                return lists[lo]          # base case: one list left
            mid = (lo + hi) // 2          # divide
            l, r = merge(lo, mid), merge(mid + 1, hi)  # conquer
            return merge_two(l, r)        # combine

        def merge_two(a, b):
            dummy = tail = ListNode()
            while a and b:
                if a.val <= b.val:
                    tail.next, a = a, a.next
                else:
                    tail.next, b = b, b.next
                tail = tail.next
            tail.next = a or b            # attach whichever list is left
            return dummy.next

        return merge(0, len(lists) - 1)`,
              zh: `class Solution:
    def mergeKLists(self, lists: list[ListNode]) -> ListNode:
        if not lists:
            return None

        def merge(lo: int, hi: int) -> ListNode:
            if lo == hi:
                return lists[lo]          # 基准:只剩一条
            mid = (lo + hi) // 2          # 分
            l, r = merge(lo, mid), merge(mid + 1, hi)  # 治
            return merge_two(l, r)        # 合

        def merge_two(a, b):
            dummy = tail = ListNode()
            while a and b:
                if a.val <= b.val:
                    tail.next, a = a, a.next
                else:
                    tail.next, b = b, b.next
                tail = tail.next
            tail.next = a or b            # 接上剩余
            return dummy.next

        return merge(0, len(lists) - 1)`,
            },
            hl: [9, 10, 11],
            note: {
              en: (
                <>
                  <code>tail.next = a or b</code> uses Python short-circuiting: it takes a
                  when a is not empty, otherwise b. The nested function closes over{" "}
                  <code>lists</code>, so it does not have to be passed down.
                </>
              ),
              zh: (
                <>
                  <code>tail.next = a or b</code> 利用 Python 的短路:a 非空取 a,否则取 b。
                  嵌套函数直接闭包捕获 <code>lists</code>,不必层层传参。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var mergeKLists = function (lists) {
  if (lists.length === 0) return null;

  const mergeTwo = (a, b) => {
    const dummy = new ListNode(0);
    let tail = dummy;
    while (a && b) {
      if (a.val <= b.val) { tail.next = a; a = a.next; }
      else { tail.next = b; b = b.next; }
      tail = tail.next;
    }
    tail.next = a || b;                  // attach whichever list is left
    return dummy.next;
  };

  const merge = (lo, hi) => {
    if (lo === hi) return lists[lo];     // base case: one list left
    const mid = (lo + hi) >> 1;          // divide
    const l = merge(lo, mid), r = merge(mid + 1, hi); // conquer
    return mergeTwo(l, r);               // combine
  };

  return merge(0, lists.length - 1);
};`,
              zh: `var mergeKLists = function (lists) {
  if (lists.length === 0) return null;

  const mergeTwo = (a, b) => {
    const dummy = new ListNode(0);
    let tail = dummy;
    while (a && b) {
      if (a.val <= b.val) { tail.next = a; a = a.next; }
      else { tail.next = b; b = b.next; }
      tail = tail.next;
    }
    tail.next = a || b;                  // 接上剩余
    return dummy.next;
  };

  const merge = (lo, hi) => {
    if (lo === hi) return lists[lo];     // 基准:只剩一条
    const mid = (lo + hi) >> 1;          // 分
    const l = merge(lo, mid), r = merge(mid + 1, hi); // 治
    return mergeTwo(l, r);               // 合
  };

  return merge(0, lists.length - 1);
};`,
            },
            hl: [17, 18, 19, 20],
            note: {
              en: (
                <>
                  <code>tail.next = a || b</code> is the same short-circuit trick.
                  Recursing on the index range <code>[lo, hi]</code> is cheaper than
                  slicing an array: no list is copied, only pointers move.
                </>
              ),
              zh: (
                <>
                  <code>tail.next = a || b</code> 同样是短路取非空链。
                  下标区间 <code>[lo, hi]</code> 递归比「切数组」更省 —— 不复制链表,只挪指针。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and follow-up: merging against a priority queue",
            zh: "复杂度 & 追问:归并 vs 优先队列",
          }}
        >
          <p>
            <T
              en={
                <>
                  The divide and conquer solution runs in <b>O(N log k)</b> time with
                  O(log k) stack. The usual follow-up is &quot;is there another
                  solution?&quot; Yes: a <b>priority queue (min-heap)</b>. Put the head
                  node of each of the k lists into the heap, pop the smallest, append it
                  to the result, and push its successor. That is also{" "}
                  <b>O(N log k)</b>. Both are accepted answers. The difference is that the
                  heap needs O(k) extra space and has a larger constant factor, but it
                  works when the lists arrive as streams instead of all at once. Heaps are
                  the main topic of DataData chapter 09; here you get the divide and
                  conquer route to the same bound.
                </>
              }
              zh={
                <>
                  分治法 <b>O(N log k)</b> 时间、O(log k) 递归栈。经典追问:「还有别的解法吗?」——
                  有,<b>优先队列(小顶堆)</b>:把 k 条链的头节点丢进堆,每次弹出最小的接到结果、
                  再把它的后继入堆,同样 <b>O(N log k)</b>。两种都是标准答案,区别在于:
                  堆解法额外 O(k) 空间、常数略大,但天然支持「流式」到来的数据。
                  堆的用法在 DataData · 09 堆里主讲,这里从分治视角给出另一条路。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="deep"
          title={{
            en: "In practice: multi-way merging in databases and log systems",
            zh: "工程现场:多路归并撑起数据库与日志系统",
          }}
        >
          <p>
            <T
              en={
                <>
                  An LSM-tree, the storage engine behind LevelDB, RocksDB, and Cassandra,
                  continuously merges many small sorted files into larger ones in the
                  background. A distributed system merges the sorted result streams
                  returned by k machines into one globally sorted stream. Both are LC 23
                  at production scale. The only difference is that with billions of
                  records they use a k-way heap merge, combining all k streams at once
                  instead of two at a time.
                </>
              }
              zh={
                <>
                  LSM-Tree(LevelDB、RocksDB、Cassandra 的存储引擎)后台不断把多个有序小文件
                  <b>多路归并</b>成大文件;分布式系统把 k 台机器返回的有序结果流合并成全局有序 ——
                  都是 LC 23 的工业放大版。区别只在于:数据以亿计时,用的是 k 路堆归并,
                  一次合并 k 条而非两条。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 精讲 C · 最大子数组 LC 53 ================= */}
      <Section
        id="maxsub"
        index="05"
        title={{
          en: "Worked example C · LC 53 Maximum Subarray: the divide and conquer view",
          zh: "精讲 C · LC 53 最大子数组和:分治视角",
        }}
        desc={{
          en: "One problem, two methods: O(n log n) here, against Kadane's O(n) in chapter 07.",
          zh: "一道题,两种世界观 —— 分治的 O(n log n),对照第 7 章 Kadane 的 O(n)",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>Problem:</b> given an integer array, find the{" "}
                  <strong>contiguous</strong> subarray with the largest sum and return
                  that sum. <b>Brute force:</b> try every range, O(n²).{" "}
                  <b>The divide and conquer idea:</b> cut once in the middle. The best
                  subarray then has exactly{" "}
                  <strong>three mutually exclusive homes</strong>:
                </>
              }
              zh={
                <>
                  <b>题意:</b>给整数数组,找一段<strong>连续</strong>子数组,使它的和最大,返回这个最大和。
                  <b> 暴力:</b>枚举所有区间求和,O(n²)。<b> 分治怎么想?</b>在正中间切一刀,
                  最大子数组就只有<strong>三种互斥的归宿</strong>:
                </>
              }
            />
          </p>
          <ul>
            <li>
              <T
                en={
                  <>
                    1. entirely in the <strong>left half</strong> — the left recursion
                    returns it;
                  </>
                }
                zh={<>① 完全落在<strong>左半</strong> —— 交给左半的递归;</>}
              />
            </li>
            <li>
              <T
                en={
                  <>
                    2. entirely in the <strong>right half</strong> — the right recursion
                    returns it;
                  </>
                }
                zh={<>② 完全落在<strong>右半</strong> —— 交给右半的递归;</>}
              />
            </li>
            <li>
              <T
                en={
                  <>
                    3. <strong>crossing the midpoint</strong> — neither recursion can see
                    it, so it has to be computed here.
                  </>
                }
                zh={<>③ <strong>横跨中点</strong> —— 左右两半的递归都看不到它,必须单独算。</>}
              />
            </li>
          </ul>
          <p>
            <T
              en={
                <>
                  Take the maximum of the three. Cases 1 and 2 come from trusting the
                  recursion, so the only real work is case 3. Case 3 has a useful
                  property: such a subarray <strong>must contain the midpoint</strong>. So
                  scan left from the midpoint for the largest sum of a segment that{" "}
                  <strong>ends at the midpoint</strong> (the best suffix of the left half),
                  then scan right for the largest sum of a segment that{" "}
                  <strong>starts just after the midpoint</strong> (the best prefix of the
                  right half), and add the two. Follow the scan:
                </>
              }
              zh={
                <>
                  三者取最大即可。①② 靠「递归信任」,真正要算的只有 ③。而 ③ 有个好性质:
                  它<strong>必然包含中点</strong>,所以从中点<strong>向左扫</strong>,
                  求「以中点结尾」的最大段和(也就是左半的最大后缀和);再从中点右侧
                  <strong>向右扫</strong>,求「紧接中点开始」的最大段和(右半的最大前缀和),
                  两段相加就是「跨中点最大和」。看这段扫描:
                </>
              }
            />
          </p>
        </div>
        <CrossMidLab />
        <CodeTabs
          title="lc53_max_subarray_divide"
          java={{
            code: {
              en: `class Solution {
    public int maxSubArray(int[] nums) {
        return dc(nums, 0, nums.length - 1);
    }

    private int dc(int[] a, int lo, int hi) {
        if (lo == hi) return a[lo];              // base case: single element
        int mid = (lo + hi) >>> 1;
        int left  = dc(a, lo, mid);              // 1. entirely on the left
        int right = dc(a, mid + 1, hi);          // 2. entirely on the right
        int cross = crossSum(a, lo, mid, hi);    // 3. crossing the midpoint
        return Math.max(Math.max(left, right), cross);
    }

    private int crossSum(int[] a, int lo, int mid, int hi) {
        int sum = 0, bestL = Integer.MIN_VALUE;
        for (int i = mid; i >= lo; i--) {        // left: best segment ending at mid
            sum += a[i];
            bestL = Math.max(bestL, sum);
        }
        sum = 0;
        int bestR = Integer.MIN_VALUE;
        for (int j = mid + 1; j <= hi; j++) {    // right: best segment starting at mid+1
            sum += a[j];
            bestR = Math.max(bestR, sum);
        }
        return bestL + bestR;                    // both contain mid, so add them
    }
}`,
              zh: `class Solution {
    public int maxSubArray(int[] nums) {
        return dc(nums, 0, nums.length - 1);
    }

    private int dc(int[] a, int lo, int hi) {
        if (lo == hi) return a[lo];              // 基准:单元素
        int mid = (lo + hi) >>> 1;
        int left  = dc(a, lo, mid);              // ① 全在左半
        int right = dc(a, mid + 1, hi);          // ② 全在右半
        int cross = crossSum(a, lo, mid, hi);    // ③ 跨中点
        return Math.max(Math.max(left, right), cross);
    }

    private int crossSum(int[] a, int lo, int mid, int hi) {
        int sum = 0, bestL = Integer.MIN_VALUE;
        for (int i = mid; i >= lo; i--) {        // 左:以 mid 结尾的最大段
            sum += a[i];
            bestL = Math.max(bestL, sum);
        }
        sum = 0;
        int bestR = Integer.MIN_VALUE;
        for (int j = mid + 1; j <= hi; j++) {    // 右:从 mid+1 开始的最大段
            sum += a[j];
            bestR = Math.max(bestR, sum);
        }
        return bestL + bestR;                    // 两段都含中点侧,相加即可
    }
}`,
            },
            hl: [9, 10, 11, 12],
            note: {
              en: (
                <>
                  <code>bestL</code> and <code>bestR</code> start at{" "}
                  <code>MIN_VALUE</code>, which forces each side to take at least one
                  element. Without that, an all-negative array would produce a wrong
                  answer. Taking the maximum of three values is the typical shape of a
                  combine step.
                </>
              ),
              zh: (
                <>
                  <code>bestL / bestR</code> 用 <code>MIN_VALUE</code> 起手,
                  强制两侧各至少取一个元素;否则全负数组会算错。三路取 max 是分治「合」的典型形态。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        def dc(lo: int, hi: int) -> int:
            if lo == hi:
                return nums[lo]                  # base case: single element
            mid = (lo + hi) // 2
            left = dc(lo, mid)                   # 1. entirely on the left
            right = dc(mid + 1, hi)              # 2. entirely on the right
            cross = cross_sum(lo, mid, hi)       # 3. crossing the midpoint
            return max(left, right, cross)

        def cross_sum(lo: int, mid: int, hi: int) -> int:
            s, best_l = 0, float("-inf")
            for i in range(mid, lo - 1, -1):     # left: best segment ending at mid
                s += nums[i]
                best_l = max(best_l, s)
            s, best_r = 0, float("-inf")
            for j in range(mid + 1, hi + 1):     # right: best segment from mid+1
                s += nums[j]
                best_r = max(best_r, s)
            return best_l + best_r

        return dc(0, len(nums) - 1)`,
              zh: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        def dc(lo: int, hi: int) -> int:
            if lo == hi:
                return nums[lo]                  # 基准:单元素
            mid = (lo + hi) // 2
            left = dc(lo, mid)                   # ① 全在左半
            right = dc(mid + 1, hi)              # ② 全在右半
            cross = cross_sum(lo, mid, hi)       # ③ 跨中点
            return max(left, right, cross)

        def cross_sum(lo: int, mid: int, hi: int) -> int:
            s, best_l = 0, float("-inf")
            for i in range(mid, lo - 1, -1):     # 左:以 mid 结尾的最大段
                s += nums[i]
                best_l = max(best_l, s)
            s, best_r = 0, float("-inf")
            for j in range(mid + 1, hi + 1):     # 右:从 mid+1 开始的最大段
                s += nums[j]
                best_r = max(best_r, s)
            return best_l + best_r

        return dc(0, len(nums) - 1)`,
            },
            hl: [7, 8, 9, 10],
            note: {
              en: (
                <>
                  <code>range(mid, lo - 1, -1)</code> counts down from mid to lo; the end
                  value has to be written as lo−1 because the end is exclusive.{" "}
                  <code>float(&quot;-inf&quot;)</code> is negative infinity, so an
                  all-negative array still gives the right answer.
                </>
              ),
              zh: (
                <>
                  <code>range(mid, lo - 1, -1)</code> 是「从 mid 倒着数到 lo」的写法
                  (终点开区间,所以要写 lo−1)。
                  <code>float(&quot;-inf&quot;)</code> 当负无穷起手,处理全负数组也不出错。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var maxSubArray = function (nums) {
  const crossSum = (lo, mid, hi) => {
    let sum = 0, bestL = -Infinity;
    for (let i = mid; i >= lo; i--) {          // left: best segment ending at mid
      sum += nums[i];
      bestL = Math.max(bestL, sum);
    }
    sum = 0;
    let bestR = -Infinity;
    for (let j = mid + 1; j <= hi; j++) {      // right: best segment from mid+1
      sum += nums[j];
      bestR = Math.max(bestR, sum);
    }
    return bestL + bestR;
  };

  const dc = (lo, hi) => {
    if (lo === hi) return nums[lo];            // base case: single element
    const mid = (lo + hi) >> 1;
    const left = dc(lo, mid), right = dc(mid + 1, hi), cross = crossSum(lo, mid, hi);
    return Math.max(left, right, cross);
  };

  return dc(0, nums.length - 1);
};`,
              zh: `var maxSubArray = function (nums) {
  const crossSum = (lo, mid, hi) => {
    let sum = 0, bestL = -Infinity;
    for (let i = mid; i >= lo; i--) {          // 左:以 mid 结尾的最大段
      sum += nums[i];
      bestL = Math.max(bestL, sum);
    }
    sum = 0;
    let bestR = -Infinity;
    for (let j = mid + 1; j <= hi; j++) {      // 右:从 mid+1 开始的最大段
      sum += nums[j];
      bestR = Math.max(bestR, sum);
    }
    return bestL + bestR;
  };

  const dc = (lo, hi) => {
    if (lo === hi) return nums[lo];            // 基准:单元素
    const mid = (lo + hi) >> 1;
    const left = dc(lo, mid), right = dc(mid + 1, hi), cross = crossSum(lo, mid, hi);
    return Math.max(left, right, cross);
  };

  return dc(0, nums.length - 1);
};`,
            },
            hl: [18, 19, 20, 21],
            note: {
              en: (
                <>
                  <code>-Infinity</code> works directly as negative infinity, so an
                  all-negative array is safe. In <code>(lo + hi) &gt;&gt; 1</code> both lo
                  and hi are array indices and stay well inside 32 bits, so the bitwise
                  midpoint is safe here.
                </>
              ),
              zh: (
                <>
                  <code>-Infinity</code> 天然当负无穷,全负数组也稳。
                  <code>(lo + hi) &gt;&gt; 1</code> 这里 lo、hi 都是数组下标(远在 32 位内),
                  用位运算取中点是安全的。
                </>
              ),
            },
          }}
        />
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Complexity <BigO o="nlogn" />: the recurrence is T(n) = 2T(n/2) + O(n),
                  the same as merge sort, with O(log n) stack.{" "}
                  <strong>But this problem has a faster solution.</strong> Chapter 07 on
                  dynamic programming gives the Kadane view: define dp[i] as the largest
                  sum of a subarray ending at index i, and one linear scan gives{" "}
                  <BigO o="n" /> time and O(1) space. Compare the two:
                </>
              }
              zh={
                <>
                  复杂度 <BigO o="nlogn" />:递推式 T(n) = 2T(n/2) + O(n),和归并排序同款,
                  另有 O(log n) 递归栈。<strong>但这道题其实有更快的解法。</strong>
                  第 7 章动态规划会给出 Kadane 视角:定义 dp[i] = 以 i 结尾的最大子数组和,
                  一次线性扫描搞定 <BigO o="n" />,空间 O(1)。两种世界观对照:
                </>
              }
            />
          </p>
        </div>
        <div className="dvd-duel">
          <div className="card">
            <div className="card-kicker">
              <T en="This chapter · divide and conquer" zh="本章 · 分治视角" />
            </div>
            <div className="card-title">
              <b className="mono">O(n log n)</b>
            </div>
            <p>
              <T
                en={
                  <>
                    Cut in half, compute the crossing segment separately, take the maximum
                    of the three. The split is <b>by position</b>: the answer is on the
                    left, on the right, or across the cut. Slower, but it exposes the
                    structure that lets two ranges be combined.
                  </>
                }
                zh={
                  <>
                    切两半 + 单独算跨中点段,三路取 max。思路是<b>空间上的划分</b>:
                    答案要么在左、在右、或骑在切口上。稍慢,但揭示了「两个区间可以合并」的结构。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Chapter 07 · DP / Kadane" zh="第 7 章 · DP / Kadane" />
            </div>
            <div className="card-title">
              <b className="mono">O(n)</b>
            </div>
            <p>
              <T
                en={
                  <>
                    dp[i] = max(nums[i], dp[i−1] + nums[i]), updating the best value as
                    you scan. The split is <b>by time</b>: at each position you only ask
                    whether the piece before you is worth keeping. Faster, and it is the
                    optimal solution here.
                  </>
                }
                zh={
                  <>
                    dp[i] = max(nums[i], dp[i−1]+nums[i]),边扫边更新全局最大。思路是<b>时间上的推进</b>:
                    每个位置只问「前面那段值不值得带上」。更快,是本题的最优解。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <CodeTabs
          title="lc53_kadane_for_compare"
          java={{
            code: {
              en: `// For comparison: chapter 07 DP / Kadane, one pass, O(n)
class Solution {
    public int maxSubArray(int[] nums) {
        int cur = nums[0], best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]); // extend, or start again at i
            best = Math.max(best, cur);
        }
        return best;
    }
}`,
              zh: `// 对照:第 7 章 DP / Kadane —— 一次扫描 O(n)
class Solution {
    public int maxSubArray(int[] nums) {
        int cur = nums[0], best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]); // 接上前面,或从 i 重新开始
            best = Math.max(best, cur);
        }
        return best;
    }
}`,
            },
            hl: [6],
            note: {
              en: (
                <>
                  <code>cur</code> is &quot;the largest sum ending at index i&quot;. It is
                  the dp array collapsed into a single variable. Chapter 07 derives it in
                  full.
                </>
              ),
              zh: (
                <>
                  <code>cur</code> 就是「以 i 结尾的最大和」,是 dp 数组压成一个变量的结果。
                  完整推导见第 7 章精讲。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `# For comparison: chapter 07 DP / Kadane, one pass, O(n)
class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        cur = best = nums[0]
        for x in nums[1:]:
            cur = max(x, cur + x)      # extend, or start again at x
            best = max(best, cur)
        return best`,
              zh: `# 对照:第 7 章 DP / Kadane —— 一次扫描 O(n)
class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        cur = best = nums[0]
        for x in nums[1:]:
            cur = max(x, cur + x)      # 接上前面,或从 x 重新开始
            best = max(best, cur)
        return best`,
            },
            hl: [6],
            note: {
              en: <>One transition line takes the problem from O(n log n) to O(n).</>,
              zh: <>一行转移方程,把 O(n log n) 直接降到 O(n)。</>,
            },
          }}
          js={{
            code: {
              en: `// For comparison: chapter 07 DP / Kadane, one pass, O(n)
var maxSubArray = function (nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
};`,
              zh: `// 对照:第 7 章 DP / Kadane —— 一次扫描 O(n)
var maxSubArray = function (nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
};`,
            },
            hl: [5],
            note: {
              en: (
                <>
                  The DP view is faster for this problem, but the divide and conquer view
                  is not wasted. See the note below.
                </>
              ),
              zh: <>同一道题,DP 视角更优;但分治视角并非无用 —— 见下方说明。</>,
            },
          }}
        />
        <Callout
          tone="idea"
          title={{
            en: "So what is the divide and conquer view good for?",
            zh: "那分治视角还有什么用?",
          }}
        >
          <p>
            <T
              en={
                <>
                  Kadane is faster, so why learn the divide and conquer solution? Because{" "}
                  <b>the structure it exposes, that two neighboring ranges can be
                  combined, is the basis of a segment tree</b>. Suppose the problem changes
                  to: answer many queries for the largest subarray sum inside an arbitrary
                  range [l, r], with updates in between. One Kadane pass is no longer
                  enough. The divide and conquer solution stores four values per range —
                  the range sum, the largest prefix sum, the largest suffix sum, and the
                  largest subarray sum inside the range. Those four values sit on each node
                  of a segment tree and combine in O(1), which answers a query in O(log n).{" "}
                  <b>Two solutions to one problem lead to two different places</b>: one to
                  DP, one to segment trees.
                </>
              }
              zh={
                <>
                  既然 Kadane 更快,为什么还学分治解?因为
                  <b>分治揭示的「相邻区间可合并」结构,正是线段树的地基</b>。
                  当题目变成「多次查询任意子区间 [l, r] 的最大子段和,中间还带修改」时,
                  Kadane 的一次性扫描就不够用了 —— 而分治那套「每个区间维护四个值:
                  区间和、最大前缀、最大后缀、区间最大子段和」,恰好能挂到线段树的每个节点上,
                  O(1) 合并、O(log n) 单次查询。
                  <b>同一道题的两种解法,分别通向 DP 和线段树两个方向</b> —— 这就是一题多解的价值。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 逆序对 + Karatsuba ================= */}
      <Section
        id="inversion"
        index="06"
        title={{
          en: "Merging can also count: inversions, and a faster multiplication",
          zh: "归并的另外两个用处:数逆序对 + 更快的大数乘法",
        }}
        desc={{
          en: "Divide and conquer is not only for sorting. The same merge measures how far an array is from sorted, and a different split makes multiplication faster.",
          zh: "分治不止排序 —— 同一次合并能顺手量出「数组有多乱」,换一种切法还能让大数乘法更快",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  An <strong>inversion</strong> is a pair of positions with{" "}
                  <code>i &lt; j</code> and <code>nums[i] &gt; nums[j]</code>. The number
                  of inversions measures how far an array is from sorted: a fully
                  increasing array has 0, and a fully decreasing array of length n has
                  n(n−1)/2, the maximum possible. Comparing every pair costs O(n²). But
                  merge sort can{" "}
                  <strong>count them during the merge, at no extra cost</strong>, so the
                  total stays O(n log n). (On LeetCode China this is LCR 170.)
                </>
              }
              zh={
                <>
                  <strong>逆序对</strong>:数组里满足 <code>i &lt; j</code> 但{" "}
                  <code>nums[i] &gt; nums[j]</code> 的数对。它衡量一个数组离有序有多远 ——
                  完全升序是 0 对,长度 n 的完全倒序是 n(n−1)/2 对,取到上限。
                  两两比较是 O(n²)。但归并排序能
                  <strong>在合并的过程中顺手把它们数出来</strong>,总代价还是 O(n log n)
                  (LeetCode 中国站的 LCR 170)。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The trick appears when merging two sorted halves. When you take a
                  smaller value out of the <strong>right</strong> half,{" "}
                  <strong>
                    every value still waiting in the left half is larger than it and sits
                    before it
                  </strong>
                  , so all of them form an inversion with it. Add the count of remaining
                  left-half values in one step, with no pair-by-pair comparison:
                </>
              }
              zh={
                <>
                  诀窍在合并两段有序数组时:当你从<strong>右半</strong>取出一个较小的数,
                  此刻<strong>左半还没被取走的每一个数,都比它大、且下标都在它前面</strong> ——
                  它们全都和这个数构成逆序对。于是「左半剩几个,就一次性加几个」,不用逐对比较:
                </>
              }
            />
          </p>
        </div>
        <InversionLab />
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Why does this miss nothing and count nothing twice? Every inversion that
                  crosses the two halves is settled <strong>exactly once</strong>, at the
                  moment its right-hand value is taken out. Inversions{" "}
                  <strong>inside</strong> a half were already counted by that half&apos;s
                  own recursion, and the two halves do not overlap, so no pair is counted
                  by both. Divide, conquer, and combine each do their part, which turns a
                  by-product of sorting into the answer to a counting problem.
                </>
              }
              zh={
                <>
                  为什么这样不漏、不重?因为跨越两半的逆序对,<strong>一定</strong>在
                  「右半元素被取出」的那一刻被结算,而且只结算一次;两半<strong>内部</strong>的逆序对,
                  早在各自的递归里数过了 —— 两半互不重叠,所以没有一对会被数两次。
                  分 / 治 / 合各司其职,把「排序」的副产品变成了「计数」的答案。
                </>
              }
            />
          </p>
        </div>
        <Callout
          tone="deep"
          title={{
            en: "Inversions outside the exercise",
            zh: "逆序对不只是道题",
          }}
        >
          <p>
            <T
              en={
                <>
                  Counting inversions is the standard way to measure{" "}
                  <b>how much two rankings disagree</b>, known as the Kendall tau distance.
                  A recommender system compares your stated preferences with its own
                  ordering, judges in a competition compare their rankings, and
                  bioinformatics compares the order of genes — all with the same count. It
                  is also exactly <b>the number of swaps a bubble sort performs</b>, so
                  &quot;how unsorted is this array&quot; has a precise numeric answer.
                </>
              }
              zh={
                <>
                  逆序对是<b>衡量两个排名有多不一致</b>的标准工具(Kendall tau 距离):
                  推荐系统比较「你的喜好」和「算法的排序」差多少、体育比赛比对不同评委的排名、
                  生物信息里比对基因顺序,用的都是它。
                  它还正好等于<b>冒泡排序要交换的次数</b> —— 一个数组的「乱度」由此有了精确的数字定义。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="story"
          title={{
            en: "Karatsuba: a 23-year-old student disproved a conjectured limit",
            zh: "Karatsuba:一个 23 岁的学生,推翻了「乘法极限」的猜想",
          }}
        >
          <p>
            <T
              en={
                <>
                  Multiplying two n-digit numbers the way you learned at school costs
                  O(n²): every digit meets every digit. For a long time that was believed
                  to be the limit. In 1960 Andrey Kolmogorov stated in a seminar that O(n²)
                  could not be beaten. A week later{" "}
                  <b>Anatoly Karatsuba</b>, a 23-year-old student in the audience, showed
                  otherwise. Split each number into a high and a low half:{" "}
                  <code>x = a·10^m + b</code> and <code>y = c·10^m + d</code>. The school
                  method needs 4 products: ac, ad, bc, bd. Karatsuba noticed that{" "}
                  <b>3 are enough</b>. Compute ac, bd, and (a+b)(c+d); then the middle term
                  comes out for nothing, because ad + bc = (a+b)(c+d) − ac − bd.
                </>
              }
              zh={
                <>
                  两个 n 位大数相乘,小学竖式是 O(n²):每一位都要和另一个数的每一位相乘。
                  人们一度以为这是极限。1960 年,数学家柯尔莫哥洛夫在讨论班上公开猜想「O(n²) 无法突破」。
                  台下 23 岁的学生 <b>Karatsuba(卡拉楚巴)</b>一周后就给出了反例:
                  把两个数各切成高低两半 <code>x = a·10^m + b</code>、
                  <code>y = c·10^m + d</code>。竖式要算 4 个子乘积(ac、ad、bc、bd),
                  而 Karatsuba 发现<b>只需算 3 个</b> —— 算出 ac、bd 和 (a+b)(c+d) 之后,
                  中间那项直接减出来:ad + bc = (a+b)(c+d) − ac − bd。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The recurrence changes from T(n) = 4T(n/2) + O(n) to{" "}
                  <b>T(n) = 3T(n/2) + O(n)</b>, and the time drops from O(n²) to
                  O(n^log₂3) ≈ <b>O(n¹·⁵⁸)</b>. That is the lesson of this chapter in one
                  line: <b>removing a single subproblem changes the growth rate of the
                  whole algorithm</b>. Big-number libraries still use Karatsuba for
                  medium-sized inputs and switch to methods based on the fast Fourier
                  transform for very large ones; Schoenhage-Strassen, for example, runs in
                  O(n log n log log n).
                </>
              }
              zh={
                <>
                  递推式从 T(n) = 4T(n/2) + O(n) 变成 <b>T(n) = 3T(n/2) + O(n)</b>,
                  复杂度从 O(n²) 降到 O(n^log₂3) ≈ <b>O(n¹·⁵⁸)</b>。
                  这就是本章的道理浓缩成一句:<b>「合」这一步少算一个子问题,
                  整个算法的增长阶就变了</b>。今天的大数库在中等规模上仍用 Karatsuba,
                  规模再大就换成基于快速傅里叶变换的方法 —— 例如 Schönhage-Strassen,
                  复杂度 O(n log n log log n)。
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
          en: "Problem set: 7 divide and conquer problems",
          zh: "高频题单:分治 7 题",
        }}
        desc={{
          en: "From fast power to multi-way merging, ending with a problem that mixes divide and conquer with binary search. Think for 30 seconds before opening a hint.",
          zh: "从快速幂到多路归并,再到分治 + 二分的压轴。先想 30 秒再看提示",
        }}
        badge={<span className="chip"><T en="Core + review" zh="主线 + 复盘" /></span>}
      >
        <ProblemSet ch="divide" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Answer all 8 correctly to mark this chapter as complete.",
          zh: "8 题全对,点亮本章绿灯",
        }}
        badge={<span className="chip"><T en="✎ Quiz" zh="✎ 通关测验" /></span>}
      >
        <Quiz ch="divide" items={QUIZ} />
      </Section>

      <KeyPoints
        points={{
          en: [
            <>
              Divide and conquer is <b>divide, conquer, combine</b>: cut into smaller
              problems of the same form, solve each by recursion, then build the answer
              in the combine step. How hard a problem is usually depends on how
              expensive the combine step is.
            </>,
            <>
              You do not have to memorize the Master theorem.{" "}
              <b>Draw the recursion tree and count work per level × number of levels.</b>{" "}
              T(n)=2T(n/2)+O(n) → O(n log n); T(n)=T(n/2)+O(1) → O(log n). The theorem
              has gaps between its cases; the tree does not.
            </>,
            <>
              <b>Fast power</b> turns n multiplications into O(log n): x^n = (x^(n/2))²,
              with one extra x when n is odd. The rule: compute x^(n/2){" "}
              <b>once</b>. Writing it twice returns the time to O(n).
            </>,
            <>
              When merging k things, <b>merge in pairs (log k rounds)</b> instead of one
              at a time (k rounds): O(N log k) instead of O(k·N) (LC 23).
            </>,
            <>
              <b>Know both solutions.</b> LC 53: divide and conquer O(n log n) against
              Kadane O(n). LC 23: pairwise merging against a min-heap. The divide and
              conquer view often leads to segment trees; the DP or heap view is often
              faster.
            </>,
            <>
              Merging can <b>count inversions</b> at no extra cost: when a value is taken
              from the right half, add the number of values still waiting in the left
              half. A by-product of sorting answers a counting problem, still in
              O(n log n).
            </>,
            <>
              <b>Always state the stack.</b> Recursion depth is real memory: merge sort
              is O(n) auxiliary plus O(log n) stack, fast power is O(log n) stack (O(1)
              iterative), and LC 23 is O(log k) stack.
            </>,
            <>
              The line between divide and conquer and DP:{" "}
              <b>independent, non-overlapping subproblems → divide and conquer</b> (solve
              each once); <b>overlapping subproblems → DP</b> (store the results, or the
              same work is repeated, exactly as in the fast power computed twice).
            </>,
          ],
          zh: [
            <>
              分治 = <b>分 / 治 / 合</b> 三步:拆成同款子问题 → 递归解决(信任它)→
              把子答案<b>合</b>成总答案。一道题好不好做,几乎全看「合」有多贵。
            </>,
            <>
              复杂度不必背公式:<b>画递归树,数「每层总工 × 层数」</b>。
              T(n)=2T(n/2)+O(n) → O(n log n);T(n)=T(n/2)+O(1) → O(log n)。
              主定理的三种情况之间有缝隙,递归树没有。
            </>,
            <>
              <b>快速幂</b>把「乘 n 次」压成 O(log n):x^n =(x^(n/2))²,奇数补乘。
              铁律:x^(n/2) <b>只算一次</b>,写两遍会退化回 O(n)。
            </>,
            <>
              合并 k 个东西时,<b>两两归并(log k 轮)</b>远胜逐条并入(k 轮):
              把 O(k·N) 压到 O(N log k)(LC 23)。
            </>,
            <>
              <b>一题多解要都会</b>:LC 53 分治 O(n log n) 对照 Kadane O(n);
              LC 23 两两归并对照优先队列 —— 分治视角常通向线段树,DP / 堆视角常更快。
            </>,
            <>
              归并能顺手<b>数逆序对</b>:从右半取数时,左半剩几个就加几个 ——
              把「排序」的副产品变成「计数」的答案,仍是 O(n log n)。
            </>,
            <>
              <b>时间之外别忘了栈</b>:递归深度是实打实的内存。归并排序 O(n) 辅助空间 + O(log n) 栈;
              快速幂 O(log n) 栈(迭代版 O(1));LC 23 O(log k) 栈。
            </>,
            <>
              分治 vs DP 的分水岭:<b>子问题独立、互不重叠 → 分治</b>(算一次即可);
              <b>子问题重叠 → DP</b>(把结果存下来,否则就会像「算两遍的快速幂」一样重复劳动)。
            </>,
          ],
        }}
      />

      <ChapterFooter ch="divide" />
    </main>
  );
}
