"use client";

// 第 1 章 · 排序 —— 算法设计思想的展览馆。
// 结构:为什么学排序 → O(n²) 三兄弟(不变量) → 归并(分治首秀 + 912 归并解) →
// 快排(partition 逐帧 + 随机化 + 912 快排解) → 突破比较下界(计数/桶/基数) →
// 稳定性 + 内置 sort 真身 → 精讲 215(Quickselect vs 堆) → 精讲 56(排序+扫描) →
// 题单 → 测验 → 要点。
// 招牌可视化:自建条形图排序 stepper(SortLab)、partition ArrayStepper(PartitionDemo)。
// 双语:文案型 props 传 { en, zh },段落内用 <T en zh />;代码窗的注释也给两份,
// 两份的可执行行完全一致、行数相同(hl 才不会指错行)。

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
import { PROBLEMS, QUIZ } from "@/lib/sorting-data";
import {
  SortLab,
  PartitionDemo,
  MergeDemo,
  CountingDemo,
  StabilityDemo,
  IntervalsDemo,
} from "./viz";

/* ================= 页面 ================= */

const CHIPS = [
  { id: "why", n: "01", label: { en: "Why sorting", zh: "为什么学排序" } },
  { id: "n2", n: "02", label: { en: "Three O(n²) sorts", zh: "O(n²) 三兄弟" } },
  { id: "merge", n: "03", label: { en: "Merge sort", zh: "归并 · 分治首秀" } },
  { id: "quick", n: "04", label: { en: "Quicksort · partition", zh: "快排 · partition" } },
  { id: "linear", n: "05", label: { en: "Sorting without comparing", zh: "突破比较下界" } },
  { id: "stable", n: "06", label: { en: "Stability & built-in sort", zh: "稳定性 & 内置 sort" } },
  { id: "select", n: "07", label: { en: "Kth largest", zh: "第 K 大" } },
  { id: "intervals", n: "08", label: { en: "Merge intervals", zh: "合并区间" } },
  { id: "problems", n: "09", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "10", label: { en: "Quiz", zh: "通关测验" } },
];

export default function SortingChapter() {
  return (
    <main className="page" data-ch="sorting">
      <Hero
        ch="sorting"
        title={{
          en: (
            <>
              Sorting <span className="grad">algorithms</span>
            </>
          ),
          zh: (
            <>
              排序 <span className="grad">Sorting</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              Sorting looks like one small task: put the values in order. It is
              also the best place to learn <strong>how algorithms are designed</strong>.
              This chapter moves from comparing pairs of values, to splitting the
              array in two, to counting values instead of comparing them at all.
              Every speedup comes from a different idea, not from more clever code.
              By the end you will be able to write these sorts, explain why each
              one is fast, and <strong>recognize when sorting first makes another
              problem easy</strong>.
            </>
          ),
          zh: (
            <>
              排序看似只是「把数字从小排到大」,却是整门算法课的<strong>思想展览馆</strong>:
              从蛮力的两两比较,到分治的一分为二,再到「根本不比较」的数数 ——
              每一次变快,背后都是一种全新的世界观。学完这一章,你不仅会写排序,
              更会看懂「为什么它能这么快」,以及<strong>什么时候该借排序给别的问题开路</strong>。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 为什么学排序 ================= */}
      <Section
        id="why"
        index="01"
        title={{
          en: "Why sorting deserves its own chapter",
          zh: "为什么排序值得单开一章",
        }}
        desc={{
          en: "Sorting is rarely the goal. It is the ground that many other algorithms stand on.",
          zh: "排序很少是目的,却是无数算法的地基",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  An interviewer will rarely ask you to write a sorting algorithm
                  as the final answer, because every language already ships a{" "}
                  <code>sort</code>. So why study them? Because{" "}
                  <strong>sorting is a way of preparing data</strong>. Many problems
                  look difficult while the input is in random order.{" "}
                  <strong>Once the data is sorted, most of the difficulty is gone.</strong>
                </>
              }
              zh={
                <>
                  先破除一个误会:面试里几乎没人让你「手写一个排序」当最终答案 ——
                  因为每种语言都内置了 <code>sort</code>。那为什么还要学?因为<strong>排序是一种预处理的世界观</strong>:
                  很多看起来杂乱无章的问题,<strong>只要先排个序,难度就塌了一半</strong>。
                </>
              }
            />
          </p>
          <ul>
            <T
              en={
                <>
                  <li>
                    Binary search needs a <strong>sorted</strong> array (chapter 3).
                    Sorting is what makes it sorted.
                  </li>
                  <li>
                    Merging intervals (LC 56) is hard while the intervals are in
                    random order. <strong>After you sort them by left endpoint</strong>,
                    two intervals that overlap are always next to each other.
                  </li>
                  <li>
                    For the kth largest element (LC 215), one partition step
                    discards a whole side of the array — about half of it on
                    average. You never sort all of it.
                  </li>
                  <li>
                    Removing duplicates, finding the most frequent value, checking
                    whether items can be joined, and almost every greedy algorithm
                    start the same way: sort first.
                  </li>
                </>
              }
              zh={
                <>
                  <li>二分查找要求数组<strong>有序</strong>(第 3 章)——「有序」从哪来?排序。</li>
                  <li>合并区间(LC 56)乱序时无从下手,<strong>按左端点排完</strong>,重叠的必然相邻。</li>
                  <li>找第 K 大(LC 215),一次 partition 就能整块丢掉一侧 —— 平均约一半,根本不用全排。</li>
                  <li>去重、找众数、判断能否拼接、贪心的「先排后选」…… 背后都站着排序。</li>
                </>
              }
            />
          </ul>
          <p>
            <T
              en={
                <>
                  Sorting algorithms are also the{" "}
                  <strong>best teaching material for algorithm design</strong>. In this
                  chapter you will see divide and conquer (merge sort), randomization
                  (quicksort), spending memory to save time (counting sort), and
                  stability, which matters a great deal in real systems but is often
                  covered in one line in a textbook. All of these ideas return in
                  later chapters.
                </>
              }
              zh={
                <>
                  更重要的是:排序算法本身是<strong>算法思想的最佳教具</strong>。这一章我们会亲眼见到
                  分治(归并)、随机化(快排)、以空间换时间(计数)、以及「稳定性」这种在工程里
                  要命、教材里却常被一笔带过的概念。它们全都会在后面的章节反复登场。
                </>
              }
            />
          </p>
        </div>
        <Callout
          tone="story"
          title={{
            en: "People have sorted things for centuries. Computers have done it for seventy years.",
            zh: "人类排了几千年,计算机排了七十年",
          }}
        >
          <p>
            <T
              en={
                <>
                  Books arranged by call number, cards arranged in your hand, one
                  click on a spreadsheet column header: putting things in order is an
                  old human habit. In 1945 <b>John von Neumann</b> wrote{" "}
                  <b>merge sort</b> as one of the earliest programs for a
                  stored-program computer. In 1959 <b>Tony Hoare</b> invented{" "}
                  <b>quicksort</b> while working on machine translation from Russian
                  to English, where words had to be sorted before they could be looked
                  up in a dictionary. The history of sorting is close to the history of
                  computer algorithms itself.
                </>
              }
              zh={
                <>
                  图书馆按书号上架、扑克摸牌时理牌、Excel 点一下列头 —— 排序是人类最古老的整理本能。
                  1945 年 <b>冯·诺依曼</b>为第一台存储程序计算机写下的早期程序之一,就是<b>归并排序</b>;
                  1959 年 <b>Tony Hoare</b> 为了给俄英机器翻译排词典,发明了<b>快速排序</b>。
                  排序的历史,几乎就是计算机算法史本身。
                </>
              }
            />
          </p>
        </Callout>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Start from the most direct ideas. You are given the unsorted list
                  [5, 2, 9, 1, 6]. How would you put it in order? The three most
                  natural methods are bubble sort, selection sort, and insertion
                  sort, and all three cost O(n²) in the worst case. Do not memorize
                  the code yet. <strong>Play each one step by step</strong> and
                  watch where the work goes in each of them:
                </>
              }
              zh={
                <>
                  我们从最直接的想法开始。给你一组乱序数据 [5, 2, 9, 1, 6],你会怎么排?
                  最自然的三种办法是冒泡、选择、插入,它们最坏情况下都是 O(n²)。
                  先别急着背代码,<strong>把每一种都逐帧播放一遍</strong>,
                  看清楚每一种的工作量花在了哪里:
                </>
              }
            />
          </p>
        </div>
        <SortLab />
      </Section>

      {/* ================= §02 O(n²) 三兄弟 ================= */}
      <Section
        id="n2"
        index="02"
        title={{
          en: "Three O(n²) sorts, three different invariants",
          zh: "O(n²) 三兄弟:各有各的不变量",
        }}
        desc={{
          en: "Bubble, selection, and insertion sort. All three are slow on large inputs, but each one keeps a different promise after every round.",
          zh: "冒泡 / 选择 / 插入 —— 在大数据上都慢,但每一轮结束时各自守着一句不同的承诺",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  All three use two nested loops and all three cost O(n²) in the
                  worst case. What separates them is the{" "}
                  <strong>loop invariant</strong>: the property that is
                  guaranteed to hold after every round. Learn the invariant and
                  you understand the algorithm. Learn only the code and you have
                  memorized it.
                </>
              }
              zh={
                <>
                  三者都是双层循环,最坏情况都是 O(n²)。真正的区别在<strong>循环不变量</strong>
                  —— 也就是「每一轮结束后,数组一定满足的性质」。
                  记住不变量,才是理解了这个算法;只记代码,那只是背下来了。
                </>
              }
            />
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 4 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Sort 01 · bubble" zh="兄弟 01 · 冒泡" />
            </div>
            <div className="card-title">
              <T en="Large values move right" zh="大的往右冒" />
            </div>
            <p>
              <T
                en={
                  <>
                    <b>Invariant:</b> after round i, the <b>rightmost i values</b>{" "}
                    are the i largest, and they are in their final positions.
                    Each round compares neighbors and swaps them when they are
                    out of order. Add a flag: if a round performs{" "}
                    <b>zero swaps</b>, the array is already sorted and the
                    algorithm stops. Best <b>O(n)</b> (sorted input), average and
                    worst <b>O(n²)</b>, O(1) auxiliary space, stable.
                  </>
                }
                zh={
                  <>
                    <b>不变量:</b>第 i 轮后,<b>最右边 i 个</b>是全局最大的 i 个,
                    并且已落在最终位置。每轮比较相邻两个,逆序就交换。
                    加一个标志位:某轮<b>一次交换都没有</b>,说明数组已经有序,直接停。
                    最好 <b>O(n)</b>(输入已有序),平均与最坏 <b>O(n²)</b>,
                    辅助空间 O(1),稳定。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Sort 02 · selection" zh="兄弟 02 · 选择" />
            </div>
            <div className="card-title">
              <T en="Pick the smallest each round" zh="每轮挑最小" />
            </div>
            <p>
              <T
                en={
                  <>
                    <b>Invariant:</b> after round i, the <b>leftmost i values</b>{" "}
                    are the i smallest, and they are in their final positions.
                    Each round scans the whole unsorted part to find the minimum,
                    then swaps it to the front. It performs the{" "}
                    <b>fewest swaps</b> (at most n−1), but it always makes about
                    n²/2 comparisons, so best, average, and worst are all{" "}
                    <b>O(n²)</b> — sorted input does not help it at all. It is{" "}
                    <b>not stable</b>: the long swap can jump an element over an
                    equal one.
                  </>
                }
                zh={
                  <>
                    <b>不变量:</b>第 i 轮后,<b>最左边 i 个</b>是全局最小的 i 个,
                    并且已落在最终位置。每轮扫完整个未排序区找最小值,再换到区首。
                    它的<b>交换次数最少</b>(至多 n−1 次),但比较次数恒为约 n²/2,
                    所以最好、平均、最坏都是 <b>O(n²)</b> —— 输入已有序也快不了。
                    它<b>不稳定</b>:那一次长距离交换可能把某个元素甩到与它相等的元素前面。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Sort 03 · insertion" zh="兄弟 03 · 插入" />
            </div>
            <div className="card-title">
              <T en="Insert each card into your hand" zh="摸牌插进手里" />
            </div>
            <p>
              <T
                en={
                  <>
                    <b>Invariant:</b> after round i, the <b>first i values</b> are
                    sorted <b>relative to each other</b> — but not necessarily in
                    their final positions. It works like sorting playing cards:
                    take the next card and slide it into the right place among
                    the cards already in your hand. Best <b>O(n)</b> (sorted
                    input), average and worst <b>O(n²)</b>, O(1) auxiliary space,
                    stable. It is the fastest of the three on nearly sorted data,
                    and you will meet it again in section 06.
                  </>
                }
                zh={
                  <>
                    <b>不变量:</b>第 i 轮后,<b>前 i 个</b>元素<b>彼此之间</b>已有序,
                    但不一定在最终位置。像理扑克:摸起一张新牌,插进左手已排好的牌里。
                    最好 <b>O(n)</b>(输入已有序),平均与最坏 <b>O(n²)</b>,
                    辅助空间 O(1),稳定。它是三者中在「近乎有序」数据上最快的一个,
                    §06 还会再遇见它。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="idea"
          title={{
            en: 'The three "first i values" do not mean the same thing',
            zh: "三个「前 i 个」,含义天差地别",
          }}
        >
          <p>
            <T
              en={
                <>
                  For bubble and selection sort, &quot;done&quot; means{" "}
                  <b>final position</b>: those values will never move again. For
                  insertion sort it only means <b>sorted among themselves</b>; a
                  smaller card drawn later will still be inserted between them,
                  pushing them right. That difference explains why insertion sort
                  can stop its inner loop early, while selection sort must scan
                  the whole unsorted part every round.
                </>
              }
              zh={
                <>
                  冒泡和选择说的「已就位」是<b>全局最终位置</b>,这些数再也不动;
                  插入说的「已有序」只是<b>这几个数彼此有序</b>,
                  后面摸到更小的牌仍会插进它们中间,把它们整体右推。
                  分清这个差别,就能解释为什么插入排序的内层循环可以提前停,
                  而选择排序每轮必须把未排序区从头扫到尾。
                </>
              }
            />
          </p>
        </Callout>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Of the three, <strong>insertion sort</strong> is the one worth
                  writing until you can do it from memory. It is a building block
                  of TimSort, and it is the fastest choice on data that is
                  already nearly sorted. Here is the template in three languages.
                  Watch the direction of the inner loop: it walks{" "}
                  <strong>left</strong>, shifting larger values right.
                </>
              }
              zh={
                <>
                  三者之中,<strong>插入排序</strong>最值得写到形成肌肉记忆:
                  它是 TimSort 的组成部分,也是近乎有序数据上的最快选择。
                  下面是三语言模板。注意内层循环的方向:它<strong>向左</strong>走,
                  一路把更大的值往右挪。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="insertion_sort"
          java={{
            code: {
              en: `class Solution {
    public void insertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int key = a[i];             // take the next card
            int j = i - 1;
            while (j >= 0 && a[j] > key) {  // shift every larger value right
                a[j + 1] = a[j];
                j--;
            }
            a[j + 1] = key;             // key lands in the gap that opened up
        }
    }
}`,
              zh: `class Solution {
    public void insertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int key = a[i];             // 摸起第 i 张新牌
            int j = i - 1;
            while (j >= 0 && a[j] > key) {  // 比 key 大的值统统右移
                a[j + 1] = a[j];
                j--;
            }
            a[j + 1] = key;             // key 落进空出来的位置
        }
    }
}`,
            },
            hl: [6, 7, 8],
            note: {
              en: (
                <>
                  <b>Invariant:</b> at the start of each round,{" "}
                  <code>a[0..i-1]</code> is sorted. The inner test is{" "}
                  <code>a[j] &gt; key</code>, a strict comparison, not{" "}
                  <code>&gt;=</code>. That is what keeps the sort{" "}
                  <b>stable</b>: an equal value is never shifted past{" "}
                  <code>key</code>, so two equal elements keep their original
                  order.
                </>
              ),
              zh: (
                <>
                  <b>不变量:</b>每轮开始时 <code>a[0..i-1]</code> 已有序。
                  内层用 <code>a[j] &gt; key</code>(严格大于)而不是{" "}
                  <code>&gt;=</code>,这正是<b>保持稳定</b>的关键:
                  相等的值不会被移到 <code>key</code> 后面,两个相等元素的原有先后被保留。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def insertion_sort(self, a: list[int]) -> None:
        for i in range(1, len(a)):
            key = a[i]                  # take the next card
            j = i - 1
            while j >= 0 and a[j] > key:  # larger values move right
                a[j + 1] = a[j]
                j -= 1
            a[j + 1] = key`,
              zh: `class Solution:
    def insertion_sort(self, a: list[int]) -> None:
        for i in range(1, len(a)):
            key = a[i]                  # 摸起新牌
            j = i - 1
            while j >= 0 and a[j] > key:  # 更大的值往右让位
                a[j + 1] = a[j]
                j -= 1
            a[j + 1] = key`,
            },
            hl: [6, 7, 8],
            note: {
              en: (
                <>
                  <b>Common mistake:</b> the loop compares and shifts at the same
                  time, which only works because <code>key</code> saved the
                  original value first. Without that copy,{" "}
                  <code>a[j+1] = a[j]</code> would overwrite the value you are
                  trying to insert.
                </>
              ),
              zh: (
                <>
                  <b>常见错误:</b>循环里一边比较一边右移,能成立全靠 <code>key</code>{" "}
                  提前存好了原值。没有这一步,<code>a[j+1] = a[j]</code>{" "}
                  会把待插入的值覆盖掉。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var insertionSort = function (a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];               // take the next card
    let j = i - 1;
    while (j >= 0 && a[j] > key) {   // larger values move right
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
  return a;
};`,
              zh: `var insertionSort = function (a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];               // 摸起新牌
    let j = i - 1;
    while (j >= 0 && a[j] > key) {   // 更大的值往右让位
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
  return a;
};`,
            },
            hl: [5, 6, 7],
            note: {
              en: (
                <>
                  The inner <code>while</code> stops as soon as it finds{" "}
                  <code>a[j] &lt;= key</code>. That is where the best case comes
                  from: if the array is already sorted, the test fails
                  immediately every time, no value is shifted, and the total cost
                  is <b>O(n)</b>.
                </>
              ),
              zh: (
                <>
                  内层 <code>while</code> 一旦遇到 <code>a[j] &lt;= key</code>{" "}
                  就停。最好情况正来自这里:输入已有序时,这个判断每次都立刻失败,
                  一个值都不用挪,总代价 <b>O(n)</b>。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="warn"
          title={{
            en: "Why these three are not used on large inputs",
            zh: "为什么大数据上不用这三个",
          }}
        >
          <p>
            <T
              en={
                <>
                  At n = 10⁵, O(n²) is about 10 billion operations, which will
                  time out. O(n log n) is about 1.7 million. That is why
                  submitting bubble sort for LC 912 (sort an array, n up to
                  5×10⁴) fails on time. These three are still worth knowing for
                  two reasons: they teach the invariants, and on{" "}
                  <b>small arrays</b> of a few dozen elements their low constant
                  factor makes them genuinely faster. The next two sections cover
                  the algorithms that handle large inputs.
                </>
              }
              zh={
                <>
                  n = 10⁵ 时,O(n²) 约是 100 亿次操作,必然超时;
                  O(n log n) 只有约 170 万次。所以 LC 912(排序数组,n 可达 5×10⁴)
                  提交冒泡会 TLE。这三个仍然值得学,原因有二:
                  它们讲清了不变量;而且在几十个元素的<b>小数组</b>上,
                  它们常数小,确实更快。真正处理大数据的算法,在接下来两节。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 归并排序(分治首秀 + 912 归并解) ================= */}
      <Section
        id="merge"
        index="03"
        title={{
          en: "Merge sort: the first divide and conquer algorithm here",
          zh: "归并排序:这门课的分治首秀",
        }}
        desc={{
          en: "Worked example A · LC 912 with merge sort — split in two, trust the recursion, then merge.",
          zh: "精讲 A · LC 912(归并解)—— 一分为二,信任递归,再合并",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>Problem (LC 912):</b> given an unsorted array, return it
                  sorted, in O(n log n).
                  <b> Brute force:</b> any of the three sorts above — O(n²), too
                  slow.
                  <b> Why it can be improved:</b> each comparison in those sorts
                  moves a value by one position, so very little is learned per
                  comparison. Divide and conquer changes the plan:{" "}
                  <strong>
                    cut the array in half, sort each half, then combine the two
                    sorted halves
                  </strong>
                  . Combining two already sorted halves takes one linear pass.
                  That is where the time is saved.
                </>
              }
              zh={
                <>
                  <b>题意(LC 912):</b>给一个乱序数组,把它排好并返回,要求 O(n log n)。
                  <b> 暴力:</b>上面三种任选其一 —— O(n²),超时。
                  <b> 为什么能优化:</b>那三种排序每次比较只把一个值挪一格,
                  一次比较获得的信息太少。分治换一种思路:
                  <strong>把数组劈成两半,分别排好,再把两个有序段合并起来</strong>。
                  合并两个已排好的段只需线性扫一遍 —— 时间就是这样省下来的。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  This is also the first full use of{" "}
                  <strong>divide and conquer</strong> in this course: divide
                  (cut in half), conquer (sort each half recursively,{" "}
                  <strong>assuming the recursive call does its job</strong>), and
                  combine (merge). That assumption was introduced in the
                  introduction, section 03, and chapter 2 covers the framework in
                  full. The core of merge sort is the merge step, so play through
                  it on its own first:
                </>
              }
              zh={
                <>
                  这也是本课程第一次完整使用<strong>分治(divide and conquer)</strong>:
                  分(劈成两半)→ 治(递归排好每一半,
                  <strong>相信递归调用一定能完成它的任务</strong>)→ 合(合并)。
                  「相信递归」在序章 §03 出现过,第 2 章会把这套框架讲完整。
                  归并的核心是合并这一步,先单独逐帧看清楚:
                </>
              }
            />
          </p>
        </div>
        <MergeDemo />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  Once merging is clear, the whole algorithm is: split until each
                  piece holds one element (a single element is already sorted),
                  then merge the pieces back level by level. Here it is in three
                  languages. Watch the line marked{" "}
                  <strong>take the left value when they are equal</strong> — that
                  single choice is what makes merge sort stable.
                </>
              }
              zh={
                <>
                  合并看懂了,整个算法就是:一直劈到每段只剩一个元素
                  (单个元素天然有序),再一层层合并回去。下面是三语言实现。
                  注意标着<strong>相等取左</strong>的那一行 ——
                  正是这一个选择让归并排序保持稳定。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc912_merge_sort"
          java={{
            code: {
              en: `class Solution {
    public int[] sortArray(int[] nums) {
        int[] tmp = new int[nums.length];       // one buffer, reused at every level
        mergeSort(nums, 0, nums.length - 1, tmp);
        return nums;
    }
    private void mergeSort(int[] a, int lo, int hi, int[] tmp) {
        if (lo >= hi) return;                   // 0 or 1 element is already sorted
        int mid = lo + (hi - lo) / 2;           // midpoint, written to avoid overflow
        mergeSort(a, lo, mid, tmp);             // conquer: sort the left half
        mergeSort(a, mid + 1, hi, tmp);         // conquer: sort the right half
        merge(a, lo, mid, hi, tmp);             // combine: merge the sorted halves
    }
    private void merge(int[] a, int lo, int mid, int hi, int[] tmp) {
        for (int k = lo; k <= hi; k++) tmp[k] = a[k];
        int i = lo, j = mid + 1;
        for (int k = lo; k <= hi; k++) {
            if (i > mid)                a[k] = tmp[j++];  // left half is used up
            else if (j > hi)            a[k] = tmp[i++];  // right half is used up
            else if (tmp[i] <= tmp[j])  a[k] = tmp[i++];  // equal: take left -> stable
            else                        a[k] = tmp[j++];
        }
    }
}`,
              zh: `class Solution {
    public int[] sortArray(int[] nums) {
        int[] tmp = new int[nums.length];       // 只开一块辅助数组,每层复用
        mergeSort(nums, 0, nums.length - 1, tmp);
        return nums;
    }
    private void mergeSort(int[] a, int lo, int hi, int[] tmp) {
        if (lo >= hi) return;                   // 0 或 1 个元素,天然有序
        int mid = lo + (hi - lo) / 2;           // 取中点,这样写不会整型溢出
        mergeSort(a, lo, mid, tmp);             // 治:排好左半
        mergeSort(a, mid + 1, hi, tmp);         // 治:排好右半
        merge(a, lo, mid, hi, tmp);             // 合:合并两段有序
    }
    private void merge(int[] a, int lo, int mid, int hi, int[] tmp) {
        for (int k = lo; k <= hi; k++) tmp[k] = a[k];
        int i = lo, j = mid + 1;
        for (int k = lo; k <= hi; k++) {
            if (i > mid)                a[k] = tmp[j++];  // 左段已用尽
            else if (j > hi)            a[k] = tmp[i++];  // 右段已用尽
            else if (tmp[i] <= tmp[j])  a[k] = tmp[i++];  // 相等取左 -> 稳定
            else                        a[k] = tmp[j++];
        }
    }
}`,
            },
            hl: [20],
            note: {
              en: (
                <>
                  Write the midpoint as <code>lo + (hi - lo) / 2</code>, not{" "}
                  <code>(lo + hi) / 2</code>. In Java, <code>int</code> addition
                  wraps around on overflow, so the second form can produce a
                  negative index on very large ranges. Chapter 3 returns to this.
                  The buffer is allocated <b>once</b> and passed down, instead of
                  allocating a new array at every level of the recursion.
                </>
              ),
              zh: (
                <>
                  取中点写 <code>lo + (hi - lo) / 2</code>,不要写{" "}
                  <code>(lo + hi) / 2</code>。Java 的 <code>int</code> 相加溢出会回绕,
                  区间很大时后者可能得到负下标。第 3 章还会讲到这一点。
                  辅助数组只<b>开一次</b>再往下传,不要每层递归都新开一个。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def sortArray(self, nums: list[int]) -> list[int]:
        def merge_sort(lo: int, hi: int) -> None:
            if lo >= hi:
                return
            mid = (lo + hi) // 2
            merge_sort(lo, mid)
            merge_sort(mid + 1, hi)
            tmp, i, j = [], lo, mid + 1
            while i <= mid and j <= hi:
                if nums[i] <= nums[j]:          # equal: take left -> stable
                    tmp.append(nums[i]); i += 1
                else:
                    tmp.append(nums[j]); j += 1
            tmp.extend(nums[i:mid + 1])          # rest of the left half
            tmp.extend(nums[j:hi + 1])           # rest of the right half
            nums[lo:hi + 1] = tmp                # write the merged run back
        merge_sort(0, len(nums) - 1)
        return nums`,
              zh: `class Solution:
    def sortArray(self, nums: list[int]) -> list[int]:
        def merge_sort(lo: int, hi: int) -> None:
            if lo >= hi:
                return
            mid = (lo + hi) // 2
            merge_sort(lo, mid)
            merge_sort(mid + 1, hi)
            tmp, i, j = [], lo, mid + 1
            while i <= mid and j <= hi:
                if nums[i] <= nums[j]:          # 相等取左 -> 稳定
                    tmp.append(nums[i]); i += 1
                else:
                    tmp.append(nums[j]); j += 1
            tmp.extend(nums[i:mid + 1])          # 左段剩下的
            tmp.extend(nums[j:hi + 1])           # 右段剩下的
            nums[lo:hi + 1] = tmp                # 把合并好的一段写回
        merge_sort(0, len(nums) - 1)
        return nums`,
            },
            hl: [11],
            note: {
              en: (
                <>
                  Python integers do not overflow, so <code>(lo + hi) // 2</code>{" "}
                  is safe here. The default recursion limit is 1000; at n =
                  5×10⁴ the depth is about log₂(50000) ≈ 16, well inside it. The
                  slice <code>nums[i:mid+1]</code> copies, so a version using
                  plain indices allocates less — but this one is easier to read.
                </>
              ),
              zh: (
                <>
                  Python 的整数不会溢出,所以这里写 <code>(lo + hi) // 2</code> 是安全的。
                  默认递归深度上限是 1000;n = 5×10⁴ 时递归深度约 log₂(50000) ≈ 16,
                  完全够用。切片 <code>nums[i:mid+1]</code> 会复制一份,
                  改用纯下标可以少分配内存,但这个版本更好读。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var sortArray = function (nums) {
  const tmp = new Array(nums.length);
  const mergeSort = (lo, hi) => {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;             // shift right by 1 = divide by 2
    mergeSort(lo, mid);
    mergeSort(mid + 1, hi);
    for (let k = lo; k <= hi; k++) tmp[k] = nums[k];
    let i = lo, j = mid + 1;
    for (let k = lo; k <= hi; k++) {
      if (i > mid) nums[k] = tmp[j++];
      else if (j > hi) nums[k] = tmp[i++];
      else if (tmp[i] <= tmp[j]) nums[k] = tmp[i++];  // equal: take left -> stable
      else nums[k] = tmp[j++];
    }
  };
  mergeSort(0, nums.length - 1);
  return nums;
};`,
              zh: `var sortArray = function (nums) {
  const tmp = new Array(nums.length);
  const mergeSort = (lo, hi) => {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;             // 右移 1 位 = 整除 2
    mergeSort(lo, mid);
    mergeSort(mid + 1, hi);
    for (let k = lo; k <= hi; k++) tmp[k] = nums[k];
    let i = lo, j = mid + 1;
    for (let k = lo; k <= hi; k++) {
      if (i > mid) nums[k] = tmp[j++];
      else if (j > hi) nums[k] = tmp[i++];
      else if (tmp[i] <= tmp[j]) nums[k] = tmp[i++];  // 相等取左 -> 稳定
      else nums[k] = tmp[j++];
    }
  };
  mergeSort(0, nums.length - 1);
  return nums;
};`,
            },
            hl: [13],
            note: {
              en: (
                <>
                  <code>(lo + hi) &gt;&gt; 1</code> is the bitwise way to take a
                  midpoint (chapter 4 covers bit operations). JavaScript{" "}
                  <code>&gt;&gt;</code> converts its operand to a signed 32-bit
                  integer first, so it is only safe while the sum stays below
                  2³¹. Array indices in this problem never come close, so it is
                  fine here.
                </>
              ),
              zh: (
                <>
                  <code>(lo + hi) &gt;&gt; 1</code> 是取中点的位运算写法(第 4 章讲位运算)。
                  JavaScript 的 <code>&gt;&gt;</code> 会先把操作数转成 32 位有符号整数,
                  所以只有在和小于 2³¹ 时才安全。本题的下标远达不到这个量级,可以放心用。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="idea"
          title={{
            en: "Why merge sort is always O(n log n)",
            zh: "为什么归并一定是 O(n log n)",
          }}
        >
          <p>
            <T
              en={
                <>
                  Draw the recursion as a tree. Each level halves the ranges, so
                  there are <b>log₂n levels</b>. Across one level, all the merge
                  calls together touch each of the n elements exactly once, which
                  is <b>O(n)</b>. Levels × cost per level ={" "}
                  <b>O(n log n)</b>, and this does not depend on the input order,
                  so best, average, and worst are all the same. Chapter 2 makes
                  this counting method formal. The cost is{" "}
                  <b>O(n) auxiliary space</b> for the buffer.
                </>
              }
              zh={
                <>
                  把递归画成一棵树:每一层把区间劈半,一共 <b>log₂n 层</b>;
                  同一层里所有 merge 加起来,恰好把 n 个元素各碰一次,是 <b>O(n)</b>。
                  层数 × 每层代价 = <b>O(n log n)</b>,而且与输入顺序无关,
                  所以最好、平均、最坏完全一样。第 2 章会把这套数复杂度的方法讲成正式方法。
                  代价是辅助数组要占 <b>O(n) 空间</b>。
                </>
              }
            />
          </p>
        </Callout>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th><T en="Merge sort" zh="归并排序" /></th>
                <th><T en="Best" zh="最好" /></th>
                <th><T en="Average" zh="平均" /></th>
                <th><T en="Worst" zh="最坏" /></th>
                <th><T en="Aux space" zh="辅助空间" /></th>
                <th><T en="Stable?" zh="稳定?" /></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b><T en="Time / space / stability" zh="时间 / 空间 / 稳定性" /></b></td>
                <td><BigO o="nlogn" /></td>
                <td><BigO o="nlogn" /></td>
                <td><BigO o="nlogn" /></td>
                <td><BigO o="n" /></td>
                <td><T en="✅ Yes" zh="✅ 稳定" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="deep"
          title={{
            en: "In production: sorting data that does not fit in memory",
            zh: "工程现场:数据大到内存装不下怎么办",
          }}
        >
          <p>
            <T
              en={
                <>
                  Merge sort is the basis of <b>external sorting</b>. To sort 1
                  TB of log lines with 8 GB of memory, split the data into chunks
                  that do fit, sort each chunk and write it back to disk, then{" "}
                  <b>merge the sorted files</b> together. Merging only needs to
                  read each file forward and keep one position per file in
                  memory. A database running <code>ORDER BY</code> over a large
                  result set, and the shuffle stage of MapReduce, both work this
                  way. Quicksort cannot be used here because it jumps to
                  arbitrary positions, and disk is slow at that. Merge sort only
                  reads sequentially.
                </>
              }
              zh={
                <>
                  归并是<b>外部排序(external sort)</b>的基础。
                  要排 1TB 日志而内存只有 8GB,就把数据切成装得下的小块,
                  每块排好写回磁盘,再<b>把这些有序文件合并起来</b>。
                  合并时每个文件只需顺序往下读,内存里为每个文件保留一个位置即可。
                  数据库对大结果集执行 <code>ORDER BY</code>、MapReduce 的 shuffle 阶段,
                  用的都是这套办法。快排在这里用不了:它要跳到任意位置读,而磁盘做这件事很慢。
                  归并只需顺序读。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 快速排序(partition + 912 快排解) ================= */}
      <Section
        id="quick"
        index="04"
        title={{
          en: "Quicksort: partition is the whole idea",
          zh: "快速排序:partition 是灵魂",
        }}
        desc={{
          en: "Worked example A · LC 912 with quicksort — pick a pivot, split into two groups in one pass, then sort each group.",
          zh: "精讲 A · LC 912(快排解)—— 选个基准,一趟分成两堆,再各自快排",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Merge sort splits without looking at the values and does the
                  real work while combining. Quicksort is the mirror image:{" "}
                  <strong>
                    it does the real work while splitting, and combining costs
                    nothing
                  </strong>
                  . The operation that does the work is called{" "}
                  <strong>partition</strong>. Choose one element as the{" "}
                  <strong>pivot</strong>, then make one pass that{" "}
                  <strong>
                    moves every smaller value to the left and leaves every larger
                    value on the right
                  </strong>
                  , with the pivot itself ending up on the boundary between them.
                  After that pass,{" "}
                  <strong>
                    the pivot is at the index it will have in the fully sorted
                    array, and it never moves again
                  </strong>
                  .
                </>
              }
              zh={
                <>
                  归并是「先不看值地劈开,合并时才真正干活」;快排正好相反:
                  <strong>划分时就干完活,合并时什么也不用做</strong>。
                  干活的那个操作叫 <strong>partition(划分)</strong>:
                  选一个元素作<strong>基准(pivot)</strong>,扫一遍,
                  <strong>把比它小的挪到左边,比它大的留在右边</strong>,
                  基准自己落到两者之间的分界处。这一趟结束后,
                  <strong>基准就位于它在完全有序数组里的下标上,再也不会移动</strong>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  That one sentence is all of quicksort, and all of quickselect
                  in section 07 as well. Play through one partition using the
                  Lomuto scheme. Watch the two pointers: <b>i</b> marks the right
                  edge of the &quot;smaller than pivot&quot; region, and{" "}
                  <b>j</b> scans from left to right. Then watch how the pivot
                  reaches its place in the final step:
                </>
              }
              zh={
                <>
                  这一句话就是快排的全部,也是 §07 快速选择的全部。
                  逐帧看一次 Lomuto 方案的 partition,盯住两个指针:
                  <b>i</b> 标记「小于基准」那一段的右边界,<b>j</b> 从左往右扫。
                  再看最后一步基准是怎么归位的:
                </>
              }
            />
          </p>
        </div>
        <PartitionDemo />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  With partition in place, quicksort is three lines:{" "}
                  <strong>
                    partition, sort the left part, sort the right part
                  </strong>{" "}
                  (the pivot slot is already correct, so it is skipped). One
                  problem must be handled: <strong>how the pivot is chosen</strong>
                  . If you always take the last element, then on an{" "}
                  <strong>already sorted</strong> array every partition removes
                  just one element, the recursion goes n levels deep, and the
                  cost becomes O(n²) with a real risk of stack overflow. The fix
                  is a <strong>random pivot</strong>: before partitioning, pick a
                  random index and swap that element into the last position. The
                  worst case still exists, but no particular input triggers it,
                  so it becomes very unlikely.
                </>
              }
              zh={
                <>
                  partition 会了,快排就三行:
                  <strong>划分 → 排左段 → 排右段</strong>
                  (基准那一格已经正确,跳过)。但有一个问题必须处理 ——
                  <strong>基准怎么选</strong>。如果总是取最后一个元素,
                  那么面对<strong>已经有序</strong>的数组,每次划分只能切掉一个元素,
                  递归会深达 n 层,代价退化成 O(n²),而且真的可能爆栈。
                  解决办法是<strong>随机基准</strong>:划分前随机选一个下标,
                  把那个元素换到末位。最坏情况依然存在,但不再由某类特定输入触发,
                  概率低到可以忽略。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc912_quick_sort"
          java={{
            code: {
              en: `class Solution {
    public int[] sortArray(int[] nums) {
        quickSort(nums, 0, nums.length - 1);
        return nums;
    }
    private void quickSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int p = partition(a, lo, hi);   // pivot is placed; p is its final index
        quickSort(a, lo, p - 1);        // sort the left part only
        quickSort(a, p + 1, hi);        // sort the right part only (a[p] is done)
    }
    private int partition(int[] a, int lo, int hi) {
        int r = lo + (int) (Math.random() * (hi - lo + 1)); // random pivot
        swap(a, r, hi);                 // move the chosen pivot to the last slot
        int pivot = a[hi], i = lo - 1;
        for (int j = lo; j < hi; j++)
            if (a[j] < pivot) swap(a, ++i, j);  // smaller value joins the left part
        swap(a, i + 1, hi);             // pivot moves to index i+1
        return i + 1;
    }
    private void swap(int[] a, int x, int y) { int t = a[x]; a[x] = a[y]; a[y] = t; }
}`,
              zh: `class Solution {
    public int[] sortArray(int[] nums) {
        quickSort(nums, 0, nums.length - 1);
        return nums;
    }
    private void quickSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int p = partition(a, lo, hi);   // 基准已归位,p 就是它的最终下标
        quickSort(a, lo, p - 1);        // 只排左段
        quickSort(a, p + 1, hi);        // 只排右段(a[p] 已完成)
    }
    private int partition(int[] a, int lo, int hi) {
        int r = lo + (int) (Math.random() * (hi - lo + 1)); // 随机基准
        swap(a, r, hi);                 // 把选中的基准换到末位
        int pivot = a[hi], i = lo - 1;
        for (int j = lo; j < hi; j++)
            if (a[j] < pivot) swap(a, ++i, j);  // 更小的值并入左段
        swap(a, i + 1, hi);             // 基准移到下标 i+1
        return i + 1;
    }
    private void swap(int[] a, int x, int y) { int t = a[x]; a[x] = a[y]; a[y] = t; }
}`,
            },
            hl: [14, 15],
            note: {
              en: (
                <>
                  <b>Without randomization this times out.</b> LC 912 includes
                  test cases that are already sorted and cases where every value
                  is equal, specifically to break a naive quicksort. A random
                  pivot (or median of three) handles the sorted case. It does{" "}
                  <b>not</b> handle the all-equal case: with this scheme every
                  partition still removes only one element. For inputs with many
                  duplicates, use a <b>three-way partition</b> instead (see LC
                  75).
                </>
              ),
              zh: (
                <>
                  <b>不随机化就会超时。</b>LC 912 专门放了「已排序」和「所有值相等」的用例,
                  就是用来卡朴素快排的。随机基准(或三数取中)能应付已排序的情况,
                  但<b>解决不了</b>全相等的情况:这种划分方式下每次仍只能减少一个元素。
                  重复元素很多时,请改用<b>三路划分</b>(见 LC 75)。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `import random

class Solution:
    def sortArray(self, nums: list[int]) -> list[int]:
        def quick(lo: int, hi: int) -> None:
            if lo >= hi:
                return
            r = random.randint(lo, hi)          # random pivot
            nums[r], nums[hi] = nums[hi], nums[r]
            pivot, i = nums[hi], lo - 1
            for j in range(lo, hi):
                if nums[j] < pivot:
                    i += 1
                    nums[i], nums[j] = nums[j], nums[i]
            nums[i + 1], nums[hi] = nums[hi], nums[i + 1]
            p = i + 1
            quick(lo, p - 1)
            quick(p + 1, hi)
        quick(0, len(nums) - 1)
        return nums`,
              zh: `import random

class Solution:
    def sortArray(self, nums: list[int]) -> list[int]:
        def quick(lo: int, hi: int) -> None:
            if lo >= hi:
                return
            r = random.randint(lo, hi)          # 随机基准
            nums[r], nums[hi] = nums[hi], nums[r]
            pivot, i = nums[hi], lo - 1
            for j in range(lo, hi):
                if nums[j] < pivot:
                    i += 1
                    nums[i], nums[j] = nums[j], nums[i]
            nums[i + 1], nums[hi] = nums[hi], nums[i + 1]
            p = i + 1
            quick(lo, p - 1)
            quick(p + 1, hi)
        quick(0, len(nums) - 1)
        return nums`,
            },
            hl: [8],
            note: {
              en: (
                <>
                  Python&apos;s default recursion limit is 1000. With a random
                  pivot the expected depth is O(log n), so this is safe. To bound
                  the depth even in bad runs, recurse on the{" "}
                  <b>shorter side only</b> and handle the longer side with a loop
                  in the same call.
                </>
              ),
              zh: (
                <>
                  Python 默认递归深度上限是 1000。用随机基准时期望深度是 O(log n),
                  所以是安全的。若想在坏情况下也把深度卡住,可以
                  <b>只对较短的一侧递归</b>,较长的一侧在同一次调用里用循环处理。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var sortArray = function (nums) {
  const swap = (x, y) => { [nums[x], nums[y]] = [nums[y], nums[x]]; };
  const quick = (lo, hi) => {
    if (lo >= hi) return;
    const r = lo + Math.floor(Math.random() * (hi - lo + 1)); // random pivot
    swap(r, hi);
    const pivot = nums[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) if (nums[j] < pivot) swap(++i, j);
    swap(i + 1, hi);
    const p = i + 1;
    quick(lo, p - 1);
    quick(p + 1, hi);
  };
  quick(0, nums.length - 1);
  return nums;
};`,
              zh: `var sortArray = function (nums) {
  const swap = (x, y) => { [nums[x], nums[y]] = [nums[y], nums[x]]; };
  const quick = (lo, hi) => {
    if (lo >= hi) return;
    const r = lo + Math.floor(Math.random() * (hi - lo + 1)); // 随机基准
    swap(r, hi);
    const pivot = nums[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) if (nums[j] < pivot) swap(++i, j);
    swap(i + 1, hi);
    const p = i + 1;
    quick(lo, p - 1);
    quick(p + 1, hi);
  };
  quick(0, nums.length - 1);
  return nums;
};`,
            },
            hl: [5],
            note: {
              en: (
                <>
                  Destructuring, <code>[a, b] = [b, a]</code>, is a readable way
                  to swap, but it allocates an array on each call, so it is
                  slightly slower than a temporary variable inside a hot loop.
                  The behavior is identical.
                </>
              ),
              zh: (
                <>
                  解构写法 <code>[a, b] = [b, a]</code> 很好读,
                  但每次调用都会新建一个数组,在热点循环里比用临时变量略慢。
                  两种写法行为完全一致。
                </>
              ),
            },
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th><T en="Quicksort" zh="快速排序" /></th>
                <th><T en="Best" zh="最好" /></th>
                <th><T en="Average" zh="平均" /></th>
                <th><T en="Worst" zh="最坏" /></th>
                <th><T en="Aux space" zh="辅助空间" /></th>
                <th><T en="Stable?" zh="稳定?" /></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b><T en="Time / space / stability" zh="时间 / 空间 / 稳定性" /></b></td>
                <td><BigO o="nlogn" /></td>
                <td><BigO o="nlogn" /></td>
                <td><BigO o="n2" /></td>
                <td><BigO o="logn" /></td>
                <td><T en="❌ No" zh="❌ 不稳定" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The worst case happens when every partition splits the range
                  into one element and everything else — for example, sorted
                  input with a fixed first or last pivot. The space figure is the{" "}
                  <b>expected</b> recursion stack, O(log n); in the worst case
                  the stack is O(n). Quicksort is called{" "}
                  <strong>in-place</strong>, which in this course means it uses
                  O(1) or O(log n) auxiliary space — not literally zero extra
                  memory.
                </>
              }
              zh={
                <>
                  最坏情况出现在每次划分都切成「一个元素 + 其余全部」的时候 ——
                  例如输入已经有序而基准固定取首位或末位。
                  空间栏写的是<b>期望</b>递归栈深 O(log n);最坏情况下栈是 O(n)。
                  说快排是<strong>原地(in-place)</strong>,
                  在本课程里指的是辅助空间为 O(1) 或 O(log n),
                  而不是完全不占额外内存。
                </>
              }
            />
          </p>
        </div>
        <Callout
          tone="win"
          title={{
            en: "How to answer: merge sort or quicksort?",
            zh: "面试话术:归并 vs 快排怎么选",
          }}
        >
          <p>
            <T
              en={
                <>
                  &quot;Both are O(n log n) on average. <b>Quicksort</b> has a
                  smaller constant factor and is in-place (only an O(log n)
                  expected stack), so it is the usual choice for sorting in
                  memory — but it is not stable, its worst case is O(n²), and it
                  needs a random pivot to make that worst case unlikely.{" "}
                  <b>Merge sort</b> is stable and is O(n log n) even in the worst
                  case, which makes it the choice when{" "}
                  <b>
                    stability is required, when sorting a linked list, or when
                    sorting data larger than memory
                  </b>
                  ; the cost is O(n) auxiliary space.&quot; Being able to state
                  this trade-off is worth more than being able to write only one
                  of them.
                </>
              }
              zh={
                <>
                  「两者平均都是 O(n log n)。<b>快排</b>常数更小、原地
                  (只需 O(log n) 期望栈空间),所以是内存排序的常用选择 ——
                  但它不稳定、最坏 O(n²),需要随机基准把最坏情况的概率压下去。
                  <b>归并</b>稳定,最坏也是 O(n log n),所以在
                  <b>要求稳定、排链表、或数据大于内存</b>时选它,
                  代价是 O(n) 辅助空间。」
                  能把这组取舍说清楚,比只会写其中一种更有价值。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="story"
          title={{
            en: "Hoare on what the hard part actually is",
            zh: "快排作者 Hoare 的一句大实话",
          }}
        >
          <p>
            <T
              en={
                <>
                  Tony Hoare invented quicksort at 26. His point about algorithms
                  was that writing one down is not the difficult part —{" "}
                  <b>showing that it is correct, and why it is fast, is</b>. The
                  loop invariant of partition is a good example: at any point
                  during the scan, everything at or left of <b>i</b> is smaller
                  than the pivot, and everything between <b>i</b> and <b>j</b> is
                  not. Once you can state that, the correctness of the whole
                  algorithm follows.
                </>
              }
              zh={
                <>
                  Tony Hoare 26 岁发明了快排。他对算法的看法是:
                  把算法写出来并不难,难的是<b>证明它正确、并说清它为什么快</b>。
                  partition 的循环不变量就是个好例子:扫描进行到任何时刻,
                  下标 <b>i</b> 及其左边的元素都小于基准,而 <b>i</b> 与 <b>j</b>{" "}
                  之间的元素都不小于基准。能把这句话说出来,整个算法的正确性也就跟着成立了。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 突破比较下界 ================= */}
      <Section
        id="linear"
        index="05"
        title={{
          en: "Below the comparison bound: count instead of compare",
          zh: "突破比较排序的下界:不比较,只数数",
        }}
        desc={{
          en: "Counting, bucket, and radix sort — why the Ω(n log n) bound does not apply to them.",
          zh: "计数 / 桶 / 基数排序 —— 为什么 Ω(n log n) 这条下界管不到它们",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Every sort so far decides what to do by{" "}
                  <strong>comparing two values</strong>. For that whole family
                  there is a proven limit: any{" "}
                  <strong>comparison-based</strong> sort needs at least{" "}
                  <strong>Ω(n log n)</strong> comparisons in the worst case. Note
                  the scope carefully — the bound applies to comparison-based
                  sorting only. It is a proof, not a statement that nobody has
                  found something better yet. Here is the argument:
                </>
              }
              zh={
                <>
                  目前为止的每种排序,都靠<strong>比较两个值</strong>来决定下一步做什么。
                  对这一整类算法,有一条被证明过的限制:任何
                  <strong>基于比较</strong>的排序,最坏情况下至少需要
                  <strong>Ω(n log n)</strong> 次比较。请注意这条下界的适用范围 ——
                  它只管基于比较的排序。这是一个证明,
                  不是「暂时还没人想出更好的办法」。证明如下:
                </>
              }
            />
          </p>
        </div>
        <div className="srt-lb">
          <div className="card">
            <div className="card-kicker">
              <T en="Setup" zh="前提" />
            </div>
            <div className="card-title">
              <T en="n! possible orders" zh="n! 种可能" />
            </div>
            <p>
              <T
                en={
                  <>
                    For n distinct elements there are <b>n!</b> possible
                    arrangements. To be correct on every input, the algorithm
                    must be able to <b>tell all of them apart</b>.
                  </>
                }
                zh={
                  <>
                    n 个互不相同的元素,可能的排列有 <b>n!</b> 种。
                    要对所有输入都排对,算法必须能<b>把这 n! 种区分开</b>。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Tool" zh="工具" />
            </div>
            <div className="card-title">
              <T en="One comparison = one branch" zh="一次比较 = 一个分叉" />
            </div>
            <p>
              <T
                en={
                  <>
                    Asking &quot;is a larger than b?&quot; has two possible
                    answers, so a run of the algorithm is a path down a binary{" "}
                    <b>decision tree</b>. A binary tree of height h has at most{" "}
                    <b>2ʰ</b> leaves, and each leaf is one possible output order.
                  </>
                }
                zh={
                  <>
                    问一句「a 比 b 大吗」只有两种答案,
                    所以算法的一次运行就是在一棵二叉<b>决策树</b>上走一条路径。
                    高为 h 的二叉树最多有 <b>2ʰ</b> 个叶子,每个叶子对应一种可能的输出顺序。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Result" zh="结论" />
            </div>
            <div className="card-title">h ≥ log₂(n!)</div>
            <p>
              <T
                en={
                  <>
                    From 2ʰ ≥ n! we get h ≥ log₂(n!) ≈ <b>n log₂ n</b>. The height
                    of the tree is the number of comparisons in the worst case,
                    so <b>every comparison sort needs Ω(n log n)</b>.
                  </>
                }
                zh={
                  <>
                    由 2ʰ ≥ n! 得到 h ≥ log₂(n!) ≈ <b>n log₂ n</b>。
                    树高就是最坏情况下的比较次数,
                    于是<b>任何比较排序都需要 Ω(n log n)</b>。
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
                  So how can counting sort be O(n)? Because it{" "}
                  <strong>never compares two elements</strong>. It uses a
                  different source of information:{" "}
                  <strong>
                    if you know the keys are integers within a small known range
                    — say 0 to 100 — you can prepare one bucket per value and
                    count, instead of asking which of two values is larger
                  </strong>
                  . An algorithm that makes no comparisons is not covered by the
                  comparison bound. The condition matters more than the formula:
                  this only works when the keys can be mapped to a bounded range
                  of integers. Play through the two phases, counting and then
                  writing the values back out:
                </>
              }
              zh={
                <>
                  那计数排序凭什么能做到 O(n)?因为它<strong>从不比较两个元素</strong>。
                  它用的是另一种信息:
                  <strong>
                    如果已知这些键是落在一个小的已知范围里的整数(比如 0 到 100),
                    就可以为每个值准备一个桶去数数,而不必去问两个值谁更大
                  </strong>
                  。不做比较的算法,不在比较下界的管辖范围内。
                  这里条件比公式更重要:只有当键能映射到一个有界的整数范围时,这招才成立。
                  逐帧看它的两个阶段 —— 先数数,再把值写回去:
                </>
              }
            />
          </p>
        </div>
        <CountingDemo />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  The counting sort template. It uses an <strong>offset</strong>{" "}
                  so that negative values work too: the bucket for value{" "}
                  <code>x</code> is at index <code>x - lo</code>.
                </>
              }
              zh={
                <>
                  计数排序模板。它用一个<strong>偏移量</strong>来支持负数:
                  值 <code>x</code> 对应的桶在下标 <code>x - lo</code>。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="counting_sort"
          java={{
            code: {
              en: `int[] countingSort(int[] a) {
    if (a.length == 0) return a;
    int lo = Arrays.stream(a).min().getAsInt();
    int hi = Arrays.stream(a).max().getAsInt();
    int[] cnt = new int[hi - lo + 1];       // one bucket per value in the range
    for (int x : a) cnt[x - lo]++;          // count occurrences; no comparison
    int idx = 0;
    for (int v = 0; v < cnt.length; v++)    // walk the buckets low to high
        while (cnt[v]-- > 0) a[idx++] = v + lo;
    return a;
}`,
              zh: `int[] countingSort(int[] a) {
    if (a.length == 0) return a;
    int lo = Arrays.stream(a).min().getAsInt();
    int hi = Arrays.stream(a).max().getAsInt();
    int[] cnt = new int[hi - lo + 1];       // 值域里每个值一个桶
    for (int x : a) cnt[x - lo]++;          // 数出现次数,不做任何比较
    int idx = 0;
    for (int v = 0; v < cnt.length; v++)    // 从小到大依次走过每个桶
        while (cnt[v]-- > 0) a[idx++] = v + lo;
    return a;
}`,
            },
            hl: [6],
            note: {
              en: (
                <>
                  Time <b>O(n + k)</b>, space <b>O(k)</b>, where k is the width of
                  the value range. This version is <b>not stable</b>: it rebuilds
                  values from counts, so it loses the original order of equal
                  elements. For a stable version — which radix sort requires —
                  turn the counts into a prefix sum and write the elements back{" "}
                  <b>from right to left</b>.
                </>
              ),
              zh: (
                <>
                  时间 <b>O(n + k)</b>,空间 <b>O(k)</b>,k 是值域宽度。
                  这个版本<b>不稳定</b>:它是按计数把值重新造出来的,
                  相等元素的原始顺序丢失了。要写稳定版(基数排序必须用稳定版),
                  就把计数改成前缀和,再<b>从右往左</b>把元素填回去。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `def counting_sort(a: list[int]) -> list[int]:
    if not a:
        return a
    lo, hi = min(a), max(a)
    cnt = [0] * (hi - lo + 1)            # one bucket per value in the range
    for x in a:
        cnt[x - lo] += 1                # count, do not compare
    out = []
    for v, c in enumerate(cnt):         # walk the buckets low to high
        out.extend([v + lo] * c)
    return out`,
              zh: `def counting_sort(a: list[int]) -> list[int]:
    if not a:
        return a
    lo, hi = min(a), max(a)
    cnt = [0] * (hi - lo + 1)            # 值域里每个值一个桶
    for x in a:
        cnt[x - lo] += 1                # 只数数,不比较
    out = []
    for v, c in enumerate(cnt):         # 从小到大依次走过每个桶
        out.extend([v + lo] * c)
    return out`,
            },
            hl: [6, 7],
            note: {
              en: (
                <>
                  <code>[v + lo] * c</code> produces c copies of the same value in
                  one step. LC 1365, &quot;how many numbers are smaller than the
                  current number&quot;, is counting sort plus a prefix sum and
                  nothing else.
                </>
              ),
              zh: (
                <>
                  <code>[v + lo] * c</code> 一步生成 c 个相同的值。
                  LC 1365「有多少小于当前数字的数字」就是计数 + 前缀和,没有别的。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var countingSort = function (a) {
  if (a.length === 0) return a;
  const lo = Math.min(...a), hi = Math.max(...a);
  const cnt = new Array(hi - lo + 1).fill(0);  // one bucket per value
  for (const x of a) cnt[x - lo]++;            // count, do not compare
  let idx = 0;
  for (let v = 0; v < cnt.length; v++)
    while (cnt[v]-- > 0) a[idx++] = v + lo;    // buckets, low to high
  return a;
};`,
              zh: `var countingSort = function (a) {
  if (a.length === 0) return a;
  const lo = Math.min(...a), hi = Math.max(...a);
  const cnt = new Array(hi - lo + 1).fill(0);  // 每个值一个桶
  for (const x of a) cnt[x - lo]++;            // 只数数,不比较
  let idx = 0;
  for (let v = 0; v < cnt.length; v++)
    while (cnt[v]-- > 0) a[idx++] = v + lo;    // 从小到大走过每个桶
  return a;
};`,
            },
            hl: [5],
            note: {
              en: (
                <>
                  <code>Math.min(...a)</code> passes every element as a separate
                  argument, so it throws a range error on very large arrays. In
                  real code, find min and max with a single <code>for</code> loop.
                  The spread is used here only because it is short.
                </>
              ),
              zh: (
                <>
                  <code>Math.min(...a)</code> 会把每个元素当成一个独立参数传进去,
                  数组很大时会抛出范围错误。生产代码请用一个 <code>for</code>{" "}
                  循环求 min 和 max。这里用展开只是因为写起来短。
                </>
              ),
            },
          }}
        />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Counting sort" zh="计数排序" />
            </div>
            <div className="card-title">
              <T en="One bucket per value" zh="一值一桶" />
            </div>
            <p>
              <T
                en={
                  <>
                    For <b>integers within a bounded range k</b>. Time O(n + k),
                    space O(k). When k is large — arbitrary 32-bit integers, for
                    example — the bucket array does not fit in memory, and this
                    is worse than quicksort.
                  </>
                }
                zh={
                  <>
                    适用于<b>值域 k 有界的整数</b>。时间 O(n + k),空间 O(k)。
                    k 很大时(比如任意 32 位整数),桶数组根本放不下,
                    这时它比快排还糟。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Bucket sort" zh="桶排序" />
            </div>
            <div className="card-title">
              <T en="One bucket per sub-range" zh="一段一桶" />
            </div>
            <p>
              <T
                en={
                  <>
                    Cut the value range into intervals, drop each element into its
                    interval, then sort inside each bucket (usually with insertion
                    sort). Close to O(n) when the values are{" "}
                    <b>spread evenly</b>. If they cluster into one bucket, it
                    falls back to the cost of the inner sort.
                  </>
                }
                zh={
                  <>
                    把值域切成若干区间,每个元素扔进它所属的区间,
                    再在桶内排序(通常用插入排序)。数据<b>分布均匀</b>时接近 O(n);
                    如果都挤进同一个桶,代价就退回到桶内排序的代价。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Radix sort" zh="基数排序" />
            </div>
            <div className="card-title">
              <T en="One pass per digit" zh="一位一轮" />
            </div>
            <p>
              <T
                en={
                  <>
                    Sort by the ones digit, then the tens, then the hundreds —{" "}
                    <b>one digit per pass</b>, using a stable counting sort each
                    time. Time O(d(n + k)) where d is the number of digits. Useful
                    for large integers and fixed-length strings. It{" "}
                    <b>only works because counting sort can be made stable</b>:
                    each pass must preserve the order produced by the previous one.
                  </>
                }
                zh={
                  <>
                    先按个位排,再按十位,再按百位 ——<b>每轮处理一位</b>,
                    每轮都用稳定的计数排序。时间 O(d(n + k)),d 是位数。
                    适合大整数和定长字符串。
                    它<b>成立的前提是计数排序可以做到稳定</b>:
                    每一轮都必须保住上一轮排出来的顺序。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "Non-comparison sorts are not general-purpose",
            zh: "非比较排序不是通用工具",
          }}
        >
          <p>
            <T
              en={
                <>
                  They only handle data whose key can be mapped to a bounded range
                  of integers or to buckets. You cannot use counting sort to order
                  arbitrary objects by a custom rule — LC 179, which orders numbers
                  by which concatenation is larger, is a good example. Anything of
                  the form &quot;I can compare any two items, so sort them&quot;
                  still needs quicksort or merge sort.{" "}
                  <b>
                    Check the key range first, then decide: bounded and integral
                    means linear time is possible; otherwise plan for O(n log n)
                  </b>
                  .
                </>
              }
              zh={
                <>
                  它们只能处理「键能映射成有界整数或桶」的数据。
                  你没法用计数排序按自定义规则给任意对象排序 ——
                  LC 179 按「哪种拼接更大」排数字就是个例子。
                  凡是「只要能两两比较就该能排」的需求,还是得交给快排或归并。
                  <b>先看键的取值范围,再做决定:有界的整数键才有可能线性,否则就按 O(n log n) 打算</b>。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 稳定性 + 内置 sort 真身 ================= */}
      <Section
        id="stable"
        index="06"
        title={{
          en: "Stability, and what the built-in sort really is",
          zh: "稳定性,以及内置 sort 到底是什么",
        }}
        desc={{
          en: "One property that matters constantly in real systems and is often given a single line in a textbook.",
          zh: "一个在真实系统里天天用到、教材里却常常只给一行的性质",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  A sort is <strong>stable</strong> when{" "}
                  <strong>
                    elements whose keys are equal keep the same relative order
                    they had before sorting
                  </strong>
                  . For plain numbers this does not matter: two copies of 5 are
                  indistinguishable, so nobody can tell which one came first. It
                  starts to matter as soon as the elements are{" "}
                  <strong>objects with more than one field</strong>, because then
                  two elements can have equal keys and still be different. Try it
                  first:
                </>
              }
              zh={
                <>
                  一个排序是<strong>稳定的</strong>,意思是
                  <strong>键相等的元素,排完之后仍保持排序前的相对顺序</strong>。
                  对纯数字来说这无所谓:两个 5 无法区分,谁在前根本看不出来。
                  一旦元素是<strong>带多个字段的对象</strong>,这件事就重要了 ——
                  因为两个元素可以键相等,却仍然是不同的东西。先动手试一下:
                </>
              }
            />
          </p>
        </div>
        <StabilityDemo />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  Why does it matter? Take an order table. You want it{" "}
                  <strong>
                    sorted by amount, and orders with the same amount sorted by
                    the time they were placed
                  </strong>
                  . You can do this with two ordinary sorts:{" "}
                  <strong>sort by time first, then sort by amount</strong>. If the
                  second sort is <strong>stable</strong>, orders with equal
                  amounts <strong>keep the time order from the first pass</strong>
                  , and you are done. If the second sort is not stable, that time
                  order is destroyed and the first pass was wasted. This is what
                  stability buys you: <strong>sorts that can be applied one after
                  another</strong>.
                </>
              }
              zh={
                <>
                  为什么重要?看一张订单表。你想要的结果是
                  <strong>按金额排序,金额相同的按下单时间排序</strong>。
                  用两次普通排序就能做到:<strong>先按时间排,再按金额排</strong>。
                  只要第二次排序是<strong>稳定</strong>的,金额相同的订单就会
                  <strong>保留第一次排出来的时间顺序</strong>,一步到位。
                  如果第二次排序不稳定,那个时间顺序就被打乱了,第一次白排。
                  这就是稳定性的价值:<strong>排序可以一次接一次地叠加</strong>。
                </>
              }
            />
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table srt-cmp">
            <thead>
              <tr>
                <th><T en="Algorithm" zh="算法" /></th>
                <th><T en="Best" zh="最好" /></th>
                <th><T en="Average" zh="平均" /></th>
                <th><T en="Worst" zh="最坏" /></th>
                <th><T en="Aux space" zh="辅助空间" /></th>
                <th><T en="Stable?" zh="稳定?" /></th>
                <th><T en="What to remember" zh="一句话记忆" /></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b><T en="Bubble" zh="冒泡" /></b></td>
                <td><BigO o="n" /></td><td><BigO o="n2" /></td><td><BigO o="n2" /></td>
                <td><BigO o="1" /></td><td>✅</td>
                <td><T en="Swaps neighbors only, so it is stable; the early-exit flag gives the O(n) best case" zh="只交换相邻元素,所以稳定;靠提前退出的标志位拿到 O(n) 最好情况" /></td>
              </tr>
              <tr>
                <td><b><T en="Insertion" zh="插入" /></b></td>
                <td><BigO o="n" /></td><td><BigO o="n2" /></td><td><BigO o="n2" /></td>
                <td><BigO o="1" /></td><td>✅</td>
                <td><T en="O(n) on nearly sorted data; the best choice for small arrays" zh="近乎有序时 O(n);小数组的首选" /></td>
              </tr>
              <tr>
                <td><b><T en="Selection" zh="选择" /></b></td>
                <td><BigO o="n2" /></td><td><BigO o="n2" /></td><td><BigO o="n2" /></td>
                <td><BigO o="1" /></td><td>❌</td>
                <td><T en="Sorted input does not help; the long swap breaks the order of equal elements" zh="输入有序也快不了;长距离交换会打乱相等元素的顺序" /></td>
              </tr>
              <tr>
                <td><b><T en="Merge" zh="归并" /></b></td>
                <td><BigO o="nlogn" /></td><td><BigO o="nlogn" /></td><td><BigO o="nlogn" /></td>
                <td><BigO o="n" /></td><td>✅</td>
                <td><T en="Stable and O(n log n) even in the worst case; the choice for linked lists and external sorting" zh="稳定,最坏也是 O(n log n);链表和外部排序的选择" /></td>
              </tr>
              <tr>
                <td><b><T en="Quick" zh="快排" /></b></td>
                <td><BigO o="nlogn" /></td><td><BigO o="nlogn" /></td><td><BigO o="n2" /></td>
                <td><BigO o="logn" /></td><td>❌</td>
                <td><T en="Fastest on average, so it is the default in memory; needs a random pivot" zh="平均最快,内存排序的默认选择;需要随机基准" /></td>
              </tr>
              <tr>
                <td><b><T en="Heap" zh="堆排" /></b></td>
                <td><BigO o="nlogn" /></td><td><BigO o="nlogn" /></td><td><BigO o="nlogn" /></td>
                <td><BigO o="1" /></td><td>❌</td>
                <td><T en="O(n log n) guaranteed with O(1) auxiliary space (heaps: DataData · 09)" zh="O(n log n) 有保证,辅助空间 O(1)(堆见 DataData · 09)" /></td>
              </tr>
              <tr>
                <td><b><T en="Counting" zh="计数" /></b></td>
                <td><BigO o="n" label="O(n+k)" /></td><td><BigO o="n" label="O(n+k)" /></td><td><BigO o="n" label="O(n+k)" /></td>
                <td><BigO o="n" label="O(k)" /></td><td>✅*</td>
                <td><T en="No comparisons; needs integer keys in a bounded range k" zh="不做比较;要求键是有界范围 k 内的整数" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>*</b> Counting sort is stable when it is written with a prefix
                  sum and the elements are written back from right to left. The
                  shorter version above, which rebuilds values from the counts, is
                  not stable. Which one you get depends on how you write it.
                </>
              }
              zh={
                <>
                  <b>*</b> 计数排序在用「前缀和 + 从右往左填回」写法时是稳定的。
                  上面那个按计数把值重新造出来的短写法不稳定。
                  是否稳定取决于你怎么写。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Now the answer to the question at the start: what is the{" "}
                  <code>sort</code> you call every day actually running? Not one
                  algorithm.{" "}
                  <strong>
                    Each of these libraries combines several of the algorithms in
                    the table above
                  </strong>
                  , and the three languages do not behave the same way:
                </>
              }
              zh={
                <>
                  现在回答开头的问题:你每天调用的 <code>sort</code>,底层到底在跑什么?
                  不是单一算法。
                  <strong>下面每一种标准库都把上表中的几种算法组合在一起用</strong>,
                  而且三种语言的行为并不一样:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title={{ en: "what_builtin_sort_runs", zh: "内置 sort 的真身" }}
          java={{
            code: {
              en: `int[] a = {5, 2, 9, 1, 6};
// 1. Primitives: dual-pivot quicksort (Yaroslavskiy). Not stable, but two
//    equal ints are the same value, so stability cannot be observed here.
Arrays.sort(a);

// 2. Objects and boxed types: TimSort (merge sort + insertion sort). Stable.
Integer[] b = {5, 2, 9, 1, 6};
Arrays.sort(b, Comparator.reverseOrder());        // descending

// 3. Custom comparator (this is what LC 179 and LC 1356 need)
Integer[] c = {3, 30, 34, 5, 9};
Arrays.sort(c, (x, y) -> ("" + y + x).compareTo("" + x + y));`,
              zh: `int[] a = {5, 2, 9, 1, 6};
// 1. 基本类型:双轴快排(Yaroslavskiy)。不稳定,但两个相等的 int
//    就是同一个值,这里根本观察不到稳定性的差别。
Arrays.sort(a);

// 2. 对象与装箱类型:TimSort(归并 + 插入)。稳定。
Integer[] b = {5, 2, 9, 1, 6};
Arrays.sort(b, Comparator.reverseOrder());        // 降序

// 3. 自定义比较器(LC 179 和 LC 1356 要用的就是它)
Integer[] c = {3, 30, 34, 5, 9};
Arrays.sort(c, (x, y) -> ("" + y + x).compareTo("" + x + y));`,
            },
            hl: [4, 8],
            note: {
              en: (
                <>
                  <b>Why two different algorithms?</b> Two equal{" "}
                  <code>int</code> values carry no other information, so no
                  program can tell whether they were reordered. Stability is
                  unobservable, and Java picks the faster algorithm. Objects are
                  different: two objects can compare equal and still be
                  distinguishable, and users chain sorts on them, so the sort{" "}
                  <b>must be stable</b> and Java uses TimSort. This is the
                  clearest example of stability deciding which algorithm a
                  library ships.
                </>
              ),
              zh: (
                <>
                  <b>为什么用两种算法?</b>两个相等的 <code>int</code>{" "}
                  不携带别的信息,任何程序都无法判断它们是否被调换过顺序 ——
                  稳定性观察不到,于是 Java 选更快的那个。对象不一样:
                  两个对象可以比较结果相等却仍然可区分,而且使用者会把多次排序叠加起来,
                  所以这里的排序<b>必须稳定</b>,Java 用的是 TimSort。
                  这是「稳定性决定标准库选哪个算法」最清楚的一个例子。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `a = [5, 2, 9, 1, 6]
a.sort()                       # sorts in place; TimSort; stable
b = sorted(a, reverse=True)    # returns a new list; a is unchanged

# key= names the sort key and is called once per element
words = ["bb", "a", "ccc", "dd"]
words.sort(key=lambda w: (len(w), w))   # by length, then alphabetically

# When the rule is really "compare these two" (LC 179), convert it:
from functools import cmp_to_key
nums = [3, 30, 34, 5, 9]
nums.sort(key=cmp_to_key(lambda x, y: 1 if f"{y}{x}" > f"{x}{y}" else -1))`,
              zh: `a = [5, 2, 9, 1, 6]
a.sort()                       # 原地排序;TimSort;稳定
b = sorted(a, reverse=True)    # 返回新列表;a 不变

# key= 指定排序键,每个元素只调用一次
words = ["bb", "a", "ccc", "dd"]
words.sort(key=lambda w: (len(w), w))   # 先按长度,再按字典序

# 规则确实是「比较这两个」时(LC 179),把它转换一下:
from functools import cmp_to_key
nums = [3, 30, 34, 5, 9]
nums.sort(key=cmp_to_key(lambda x, y: 1 if f"{y}{x}" > f"{x}{y}" else -1))`,
            },
            hl: [2],
            note: {
              en: (
                <>
                  Both <code>list.sort</code> and <code>sorted</code> use TimSort
                  and are <b>stable</b>. TimSort was written by Tim Peters for
                  Python in 2002 and was later adopted by Java (for objects),
                  Android, and V8. Prefer <code>key=</code> over{" "}
                  <code>cmp_to_key</code>: <code>key=</code> computes one key per
                  element, which is n calls, while a comparison function is
                  called about n log n times.
                </>
              ),
              zh: (
                <>
                  <code>list.sort</code> 和 <code>sorted</code> 都用 TimSort,
                  都是<b>稳定</b>的。TimSort 由 Tim Peters 于 2002 年为 Python 写成,
                  后被 Java(对象排序)、Android、V8 采用。
                  优先用 <code>key=</code> 而不是 <code>cmp_to_key</code>:
                  <code>key=</code> 每个元素算一次键,共 n 次调用;
                  而比较函数会被调用约 n log n 次。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `const a = [5, 2, 9, 1, 6];

// Trap: with no comparator, sort compares elements AS STRINGS.
[1, 10, 2, 21].sort();          // -> [1, 10, 2, 21], not [1, 2, 10, 21]

// Correct: sorting numbers always needs a comparator
a.sort((x, y) => x - y);        // ascending
a.sort((x, y) => y - x);        // descending

// Since ES2019 the specification requires Array.prototype.sort to be stable.
// V8 implements it with TimSort.
const arr = [{ k: 1, id: "a" }, { k: 1, id: "b" }];
arr.sort((x, y) => x.k - y.k);  // "a" stays before "b"`,
              zh: `const a = [5, 2, 9, 1, 6];

// 陷阱:不传比较器时,sort 会把元素当成字符串来比较。
[1, 10, 2, 21].sort();          // -> [1, 10, 2, 21],不是 [1, 2, 10, 21]

// 正确写法:给数字排序一定要传比较器
a.sort((x, y) => x - y);        // 升序
a.sort((x, y) => y - x);        // 降序

// 从 ES2019 起,规范要求 Array.prototype.sort 必须稳定。
// V8 用 TimSort 实现它。
const arr = [{ k: 1, id: "a" }, { k: 1, id: "b" }];
arr.sort((x, y) => x.k - y.k);  // "a" 仍然排在 "b" 前面`,
            },
            hl: [4, 7],
            note: {
              en: (
                <>
                  <b>The most common JavaScript sorting bug:</b>{" "}
                  <code>[1,10,2].sort()</code> returns <code>[1,10,2]</code>. With
                  no comparator, the specification converts each element to a
                  string and compares those strings by UTF-16 code unit, and{" "}
                  <code>&quot;10&quot;</code> &lt; <code>&quot;2&quot;</code>.
                  When you sort numbers, always pass{" "}
                  <code>(x, y) =&gt; x - y</code>.
                </>
              ),
              zh: (
                <>
                  <b>JavaScript 排序最常见的 bug:</b>
                  <code>[1,10,2].sort()</code> 返回 <code>[1,10,2]</code>。
                  不传比较器时,规范会把每个元素转成字符串,
                  再按 UTF-16 码元比较这些字符串,而{" "}
                  <code>&quot;10&quot;</code> &lt; <code>&quot;2&quot;</code>。
                  给数字排序时,永远记得传 <code>(x, y) =&gt; x - y</code>。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "TimSort: insertion sort for small pieces, merge sort to join them",
            zh: "TimSort:小段用插入排序,再用归并把它们拼起来",
          }}
        >
          <p>
            <T
              en={
                <>
                  TimSort starts from an observation about real data:{" "}
                  <b>it is often already sorted in places</b> — mostly ordered,
                  with a few values out of position. So it first scans for
                  stretches that are already sorted, called <b>runs</b>. A run
                  that is too short is extended to a minimum length with{" "}
                  <b>insertion sort</b>, which is the fastest option on short and
                  nearly sorted pieces. Then it uses <b>merge sort</b> to combine
                  the runs, which keeps the result stable. Best case O(n), worst
                  case O(n log n), stable. It combines most of the algorithms in
                  this chapter, and it is a good illustration that the practical
                  question is not which algorithm is best, but which combination
                  fits the data.
                </>
              }
              zh={
                <>
                  TimSort 的出发点是一个关于真实数据的观察:
                  <b>它往往局部已经有序</b> —— 大体排好,只有少数几个位置乱。
                  所以它先扫描出已经有序的片段,称为 <b>run</b>。
                  太短的 run 用<b>插入排序</b>补到一个最小长度 ——
                  在短片段和近乎有序的数据上,插入排序最快。
                  然后用<b>归并</b>把这些 run 拼起来,结果保持稳定。
                  最好 O(n),最坏 O(n log n),稳定。
                  它把本章几乎所有算法组合在了一起,
                  也说明了一件事:实际要问的不是哪个算法最好,而是哪种组合适合手上的数据。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 精讲 B · LC 215 ================= */}
      <Section
        id="select"
        index="07"
        title={{
          en: "Worked example B · kth largest: you do not need a full sort",
          zh: "精讲 B · 第 K 大:不必全排",
        }}
        desc={{
          en: "LC 215 — quickselect at O(n) average, compared with a heap of size K.",
          zh: "LC 215 —— Quickselect 平均 O(n),对比大小为 K 的堆",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>Problem:</b> return the kth largest element of an array. In
                  ascending order, the kth largest sits at index n−k.
                  <b> Brute force:</b> sort everything in O(n log n) and read
                  index n−k. That is accepted, but it{" "}
                  <strong>does more work than the question asks for</strong>: you
                  wanted the value at one index and you ordered all n of them.
                  <b> Why it can be improved:</b> recall that partition places its
                  pivot at its final index. After one partition, that index is
                  known.{" "}
                  <strong>
                    If it is exactly n−k, return that value. If not, the answer
                    can only be on one side, so the whole other side is discarded
                  </strong>
                  . This is called quickselect.
                </>
              }
              zh={
                <>
                  <b>题意:</b>返回数组中第 k 大的元素。按升序排列时,第 k 大位于下标 n−k。
                  <b> 暴力:</b>整个排一遍 O(n log n),取下标 n−k —— 能通过,
                  但<strong>做了题目没要求的功</strong>:
                  你只要一个下标上的值,却把全部 n 个元素都排好了。
                  <b> 为什么能优化:</b>回想 partition 会把基准放到它的最终下标上。
                  一次划分之后,这个下标就知道了。
                  <strong>
                    如果它恰好是 n−k,直接返回这个值;如果不是,答案只可能在其中一侧,
                    另一整侧全部丢弃
                  </strong>
                  。这就是快速选择(quickselect)。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The frame-by-frame partition in section 04 is the same operation
                  used here. The new part is that{" "}
                  <strong>only one side is searched after each partition</strong>.
                  If the pivot splits the range near the middle, the expected work
                  is n + n/2 + n/4 + … = 2n = <strong>O(n)</strong>:
                </>
              }
              zh={
                <>
                  §04 那段逐帧 partition 就是这里用的同一个操作。
                  新的地方在于<strong>每次划分之后只在一侧继续找</strong>。
                  如果基准大致把区间从中间切开,期望的总工作量是
                  n + n/2 + n/4 + … = 2n = <strong>O(n)</strong>:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc215_quickselect"
          java={{
            code: {
              en: `class Solution {
    public int findKthLargest(int[] nums, int k) {
        int target = nums.length - k;    // kth largest = index (n-k) when ascending
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int p = partition(nums, lo, hi);
            if (p == target) return nums[p];   // found it
            else if (p < target) lo = p + 1;   // target is on the right; drop the left
            else hi = p - 1;                    // target is on the left; drop the right
        }
        return -1;
    }
    private int partition(int[] a, int lo, int hi) {
        int r = lo + (int) (Math.random() * (hi - lo + 1)); // random pivot, required
        swap(a, r, hi);
        int pivot = a[hi], i = lo - 1;
        for (int j = lo; j < hi; j++)
            if (a[j] < pivot) swap(a, ++i, j);
        swap(a, i + 1, hi);
        return i + 1;
    }
    private void swap(int[] a, int x, int y) { int t = a[x]; a[x] = a[y]; a[y] = t; }
}`,
              zh: `class Solution {
    public int findKthLargest(int[] nums, int k) {
        int target = nums.length - k;    // 第 k 大 = 升序时的下标 (n-k)
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int p = partition(nums, lo, hi);
            if (p == target) return nums[p];   // 找到了
            else if (p < target) lo = p + 1;   // 目标在右侧,丢掉左侧
            else hi = p - 1;                    // 目标在左侧,丢掉右侧
        }
        return -1;
    }
    private int partition(int[] a, int lo, int hi) {
        int r = lo + (int) (Math.random() * (hi - lo + 1)); // 随机基准,必须有
        swap(a, r, hi);
        int pivot = a[hi], i = lo - 1;
        for (int j = lo; j < hi; j++)
            if (a[j] < pivot) swap(a, ++i, j);
        swap(a, i + 1, hi);
        return i + 1;
    }
    private void swap(int[] a, int x, int y) { int t = a[x]; a[x] = a[y]; a[y] = t; }
}`,
            },
            hl: [7, 8, 9],
            note: {
              en: (
                <>
                  Because only one side is ever searched, a <b>while loop</b>{" "}
                  replaces the recursion and the stack stays O(1). The random
                  pivot is still required: without it, sorted input drives this to
                  O(n²).
                </>
              ),
              zh: (
                <>
                  因为每次只在一侧继续找,用 <b>while 循环</b>就能代替递归,
                  栈空间保持 O(1)。随机基准仍然必须有:没有它,
                  已排序的输入会把它拖到 O(n²)。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `import random

class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        target = len(nums) - k          # kth largest = index (n-k) when ascending
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            r = random.randint(lo, hi)
            nums[r], nums[hi] = nums[hi], nums[r]
            pivot, i = nums[hi], lo - 1
            for j in range(lo, hi):
                if nums[j] < pivot:
                    i += 1
                    nums[i], nums[j] = nums[j], nums[i]
            nums[i + 1], nums[hi] = nums[hi], nums[i + 1]
            p = i + 1
            if p == target:
                return nums[p]          # found it
            elif p < target:
                lo = p + 1              # search the right side only
            else:
                hi = p - 1              # search the left side only
        return -1`,
              zh: `import random

class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        target = len(nums) - k          # 第 k 大 = 升序时的下标 (n-k)
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            r = random.randint(lo, hi)
            nums[r], nums[hi] = nums[hi], nums[r]
            pivot, i = nums[hi], lo - 1
            for j in range(lo, hi):
                if nums[j] < pivot:
                    i += 1
                    nums[i], nums[j] = nums[j], nums[i]
            nums[i + 1], nums[hi] = nums[hi], nums[i + 1]
            p = i + 1
            if p == target:
                return nums[p]          # 找到了
            elif p < target:
                lo = p + 1              # 只在右侧继续找
            else:
                hi = p - 1              # 只在左侧继续找
        return -1`,
            },
            hl: [17, 18, 19, 20, 21],
            note: {
              en: (
                <>
                  Python has one-line answers too:{" "}
                  <code>heapq.nlargest(k, nums)[-1]</code> or{" "}
                  <code>sorted(nums)[-k]</code>. An interviewer asks for the hand-
                  written version because the point being tested is the idea:{" "}
                  <b>
                    the pivot reaches its final index, so only one side has to be
                    searched
                  </b>
                  .
                </>
              ),
              zh: (
                <>
                  Python 也有一行解:<code>heapq.nlargest(k, nums)[-1]</code>{" "}
                  或 <code>sorted(nums)[-k]</code>。面试让你手写,
                  是因为要考的是那个想法:
                  <b>基准会落到最终下标上,所以只需要搜一侧</b>。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var findKthLargest = function (nums, k) {
  const target = nums.length - k;      // kth largest = index (n-k) when ascending
  const swap = (x, y) => { [nums[x], nums[y]] = [nums[y], nums[x]]; };
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const r = lo + Math.floor(Math.random() * (hi - lo + 1));
    swap(r, hi);
    const pivot = nums[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) if (nums[j] < pivot) swap(++i, j);
    swap(i + 1, hi);
    const p = i + 1;
    if (p === target) return nums[p];  // found it
    else if (p < target) lo = p + 1;   // search the right side only
    else hi = p - 1;                    // search the left side only
  }
  return -1;
};`,
              zh: `var findKthLargest = function (nums, k) {
  const target = nums.length - k;      // 第 k 大 = 升序时的下标 (n-k)
  const swap = (x, y) => { [nums[x], nums[y]] = [nums[y], nums[x]]; };
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const r = lo + Math.floor(Math.random() * (hi - lo + 1));
    swap(r, hi);
    const pivot = nums[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) if (nums[j] < pivot) swap(++i, j);
    swap(i + 1, hi);
    const p = i + 1;
    if (p === target) return nums[p];  // 找到了
    else if (p < target) lo = p + 1;   // 只在右侧继续找
    else hi = p - 1;                    // 只在左侧继续找
  }
  return -1;
};`,
            },
            hl: [13, 14, 15],
            note: {
              en: (
                <>
                  Average <b>O(n)</b>, worst <b>O(n²)</b>, auxiliary space{" "}
                  <b>O(1)</b>. A random pivot makes the sorted-input worst case
                  very unlikely, but it does <b>not</b> help against many equal
                  values. If every element is equal, this partition scheme moves
                  the boundary by one each time and the cost is O(n²) every run,
                  not just occasionally. For that input, use the three-way
                  partition from LC 75. Also note this function{" "}
                  <b>reorders the input array</b>; copy it first if the caller
                  needs the original.
                </>
              ),
              zh: (
                <>
                  平均 <b>O(n)</b>,最坏 <b>O(n²)</b>,辅助空间 <b>O(1)</b>。
                  随机基准能把「输入已排序」这种最坏情况的概率压得很低,
                  但它<b>解决不了</b>大量相等值的情况。如果所有元素都相等,
                  这种划分每次只能把边界推进一格,代价必然是 O(n²),而不是偶尔如此。
                  遇到这种输入,请改用 LC 75 的三路划分。另外这个函数会
                  <b>改变输入数组的顺序</b>;调用方还需要原数组的话,要先复制一份。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "The other approach: a heap of size K, and how to choose",
            zh: "另一条路:大小为 K 的堆,以及怎么选",
          }}
        >
          <p>
            <T
              en={
                <>
                  Keep a <b>min-heap holding K elements</b>. Walk the array; once
                  the heap is full, compare each new value with the smallest value
                  in the heap and replace it when the new value is larger. When the
                  walk ends, the top of the heap is the kth largest. Time{" "}
                  <b>O(n log K)</b>, space O(K). This approach{" "}
                  <b>
                    does not modify the input, and it works when the values arrive
                    one at a time and cannot all be held in memory
                  </b>{" "}
                  (heaps are covered in DataData · 09). The trade-off:{" "}
                  <b>
                    if the data fits in memory, may be reordered, and you want the
                    best average speed, use quickselect; if the data is a stream,
                    is read-only, or you need a worst-case guarantee, use the heap
                  </b>
                  . This comparison is the usual follow-up question for LC 215.
                </>
              }
              zh={
                <>
                  维护一个<b>大小为 K 的小顶堆</b>。遍历数组;堆满之后,
                  每来一个新值就和堆顶(堆里最小的那个)比,比它大就替换掉堆顶。
                  遍历结束时,堆顶就是第 k 大。时间 <b>O(n log K)</b>,空间 O(K)。
                  这个做法<b>不修改输入,而且在数据一个一个到达、无法全部放进内存时也能用</b>
                  (堆见 DataData · 09)。取舍是:
                  <b>
                    数据放得下内存、允许被打乱、想要最好的平均速度 → 用 quickselect;
                    数据是流、是只读的、或者需要最坏情况的保证 → 用堆
                  </b>
                  。LC 215 之后追问的通常就是这组对比。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="deep"
          title={{
            en: "Extra: median of medians gives a guaranteed O(n)",
            zh: "补充:「中位数的中位数」能给出确定的 O(n)",
          }}
        >
          <p>
            <T
              en={
                <>
                  Quickselect is O(n²) in the worst case. There is an algorithm
                  called <b>median of medians</b> (also known as BFPRT) that
                  chooses the pivot carefully enough to make the{" "}
                  <b>worst case O(n)</b> as well. Its constant factor is large, so
                  in practice randomized quickselect is faster. It is worth knowing
                  that it exists and being able to name it; for real code and for
                  contests, randomization is the practical choice.
                </>
              }
              zh={
                <>
                  Quickselect 最坏是 O(n²)。有一个叫
                  <b>中位数的中位数(median of medians,又称 BFPRT)</b>的算法,
                  通过足够谨慎地挑选基准,把<b>最坏情况也降到 O(n)</b>。
                  它的常数很大,实际跑起来不如随机化 quickselect 快。
                  知道它存在、能说出名字就够了;写真实代码和打比赛时,随机化才是实用选择。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §08 精讲 C · LC 56 ================= */}
      <Section
        id="intervals"
        index="08"
        title={{
          en: "Worked example C · merge intervals: sorting turns the problem around",
          zh: "精讲 C · 合并区间:排序把问题换了个样子",
        }}
        desc={{
          en: 'LC 56 — sorting is not the goal; it turns "overlapping" into "next to each other".',
          zh: "LC 56 —— 排序不是目的,它把「重叠」变成了「相邻」",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>Problem:</b> given a list of intervals such as
                  [[1,3],[2,6],[8,10],[15,18]], merge the ones that overlap and
                  return the resulting non-overlapping intervals.
                  <b> Brute force:</b> compare every pair, merge, and repeat —
                  O(n²), and the chain reaction (a merged interval now overlaps
                  something else) is hard to handle correctly.
                  <b> Why it can be improved:</b> in random order, two intervals
                  that can be merged may sit anywhere in the list. But{" "}
                  <strong>
                    once the intervals are sorted by left endpoint, intervals that
                    can be merged are always next to each other
                  </strong>
                  . The reason: every later interval has a left endpoint that is
                  greater than or equal to the current one. So it either overlaps
                  the current merged interval (its left endpoint is ≤ the current
                  right endpoint) or it starts strictly after it. A later interval
                  can never reach back past an interval that did not overlap.
                </>
              }
              zh={
                <>
                  <b>题意:</b>给一组区间,例如 [[1,3],[2,6],[8,10],[15,18]],
                  把重叠的合并,返回合并后互不重叠的区间。
                  <b> 暴力:</b>两两比较、合并、再来一轮 —— O(n²),
                  而且「合并出来的区间又和别的重叠」这种连锁很难处理干净。
                  <b> 为什么能优化:</b>乱序时,能合并的两个区间可能分散在列表任何位置。
                  但<strong>只要按左端点排好序,能合并的区间一定紧挨着</strong>。
                  原因是:后面每个区间的左端点都大于等于当前这个。
                  所以它要么和当前合并段重叠(左端点 ≤ 当前右端点),要么严格从它之后开始。
                  后面的区间不可能越过一个不重叠的区间再回头重叠。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  So after sorting in O(n log n), <strong>one linear scan</strong>{" "}
                  is enough: keep the right endpoint of the current merged
                  interval; if the next interval connects, extend that right
                  endpoint; if it does not, close the current interval and start a
                  new one. Step through it:
                </>
              }
              zh={
                <>
                  于是排序 O(n log n) 之后,只需<strong>一次线性扫描</strong>:
                  记住当前合并段的右端点;下一个区间接得上就把右端点扩大,
                  接不上就把当前段收尾,另起一段。逐帧看:
                </>
              }
            />
          </p>
        </div>
        <IntervalsDemo />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  Three implementations. Both do the same two things:{" "}
                  <strong>sort by left endpoint</strong> and{" "}
                  <strong>
                    compare the next left endpoint with the current right endpoint
                  </strong>
                  .
                </>
              }
              zh={
                <>
                  三种实现。做的都是同样两件事:<strong>按左端点排序</strong>,
                  以及<strong>拿下一个左端点和当前右端点比较</strong>。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc56_merge_intervals"
          java={{
            code: {
              en: `class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0])); // by left endpoint
        List<int[]> res = new ArrayList<>();
        for (int[] iv : intervals) {
            int n = res.size();
            if (n == 0 || res.get(n - 1)[1] < iv[0])   // no overlap: start a new interval
                res.add(new int[]{iv[0], iv[1]});
            else                                         // overlap: extend the right end
                res.get(n - 1)[1] = Math.max(res.get(n - 1)[1], iv[1]);
        }
        return res.toArray(new int[0][]);
    }
}`,
              zh: `class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0])); // 按左端点排序
        List<int[]> res = new ArrayList<>();
        for (int[] iv : intervals) {
            int n = res.size();
            if (n == 0 || res.get(n - 1)[1] < iv[0])   // 不重叠:另起一段
                res.add(new int[]{iv[0], iv[1]});
            else                                         // 重叠:把右端扩大
                res.get(n - 1)[1] = Math.max(res.get(n - 1)[1], iv[1]);
        }
        return res.toArray(new int[0][]);
    }
}`,
            },
            hl: [3, 7],
            note: {
              en: (
                <>
                  Write the comparator as <code>Integer.compare(a[0], b[0])</code>
                  , not <code>a[0] - b[0]</code>. The subtraction{" "}
                  <b>overflows</b> when one endpoint is near{" "}
                  <code>Integer.MAX_VALUE</code> and the other is negative, which
                  produces the wrong sign and an incorrectly sorted array. The
                  bug only appears on large inputs, so it is easy to miss.
                </>
              ),
              zh: (
                <>
                  比较器写 <code>Integer.compare(a[0], b[0])</code>,
                  不要写 <code>a[0] - b[0]</code>。当一个端点接近{" "}
                  <code>Integer.MAX_VALUE</code>、另一个是负数时,
                  这个减法会<b>溢出</b>,得到错误的符号,排出错误的顺序。
                  这个 bug 只在大数值输入上出现,很容易漏掉。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        intervals.sort(key=lambda x: x[0])          # by left endpoint
        res = []
        for lo, hi in intervals:
            if not res or res[-1][1] < lo:           # no overlap: start a new interval
                res.append([lo, hi])
            else:                                     # overlap: extend the right end
                res[-1][1] = max(res[-1][1], hi)
        return res`,
              zh: `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        intervals.sort(key=lambda x: x[0])          # 按左端点排序
        res = []
        for lo, hi in intervals:
            if not res or res[-1][1] < lo:           # 不重叠:另起一段
                res.append([lo, hi])
            else:                                     # 重叠:把右端扩大
                res[-1][1] = max(res[-1][1], hi)
        return res`,
            },
            hl: [3, 6],
            note: {
              en: (
                <>
                  Python integers do not overflow, so subtraction would be safe
                  here — but <code>key=lambda x: x[0]</code> is still the better
                  form. It states the sort key directly, and the key is computed
                  once per element instead of on every comparison.
                </>
              ),
              zh: (
                <>
                  Python 的整数不会溢出,所以这里用减法本身是安全的 ——
                  但仍推荐 <code>key=lambda x: x[0]</code>:
                  它直接写明排序键,而且每个元素只算一次键,不是每次比较都算。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var merge = function (intervals) {
  intervals.sort((a, b) => a[0] - b[0]);            // by left endpoint
  const res = [];
  for (const [lo, hi] of intervals) {
    const last = res[res.length - 1];
    if (!last || last[1] < lo) res.push([lo, hi]);   // no overlap: new interval
    else last[1] = Math.max(last[1], hi);            // overlap: extend the right end
  }
  return res;
};`,
              zh: `var merge = function (intervals) {
  intervals.sort((a, b) => a[0] - b[0]);            // 按左端点排序
  const res = [];
  for (const [lo, hi] of intervals) {
    const last = res[res.length - 1];
    if (!last || last[1] < lo) res.push([lo, hi]);   // 不重叠:另起一段
    else last[1] = Math.max(last[1], hi);            // 重叠:把右端扩大
  }
  return res;
};`,
            },
            hl: [2, 6],
            note: {
              en: (
                <>
                  Do not forget the comparator. An array of arrays with no
                  comparator is also sorted as text: each inner array becomes a
                  string such as <code>&quot;15,18&quot;</code>, and those strings
                  are compared. Total time is <b>O(n log n)</b>, set by the sort;
                  the scan itself is O(n).
                </>
              ),
              zh: (
                <>
                  别忘了传比较器。数组的数组不传比较器同样按文本排序:
                  每个内层数组会先变成 <code>&quot;15,18&quot;</code>{" "}
                  这样的字符串,再比较这些字符串。
                  总时间 <b>O(n log n)</b>,由排序决定;扫描本身只有 O(n)。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="idea"
          title={{
            en: '"Sort first, then scan once" solves a whole family of problems',
            zh: "「先排序,再扫一遍」是一整类题的通用做法",
          }}
        >
          <p>
            <T
              en={
                <>
                  Meeting rooms (LC 253), minimum number of arrows to burst
                  balloons (LC 452), non-overlapping intervals (LC 435), merge
                  intervals (LC 56) — for interval problems the first move is
                  almost always{" "}
                  <b>sort by the left endpoint or by the right endpoint</b>. That
                  turns a question about <b>any two intervals</b> into a question
                  about <b>two neighboring intervals</b>, which one pass can
                  answer. The same pattern, sorting as preparation and scanning to
                  decide, is used throughout chapter 6 on greedy algorithms, where
                  sorting is also the first step of most solutions.
                </>
              }
              zh={
                <>
                  会议室(LC 253)、用最少数量的箭引爆气球(LC 452)、
                  无重叠区间(LC 435)、合并区间(LC 56)——
                  区间题的第一步几乎总是<b>按左端点或右端点排序</b>。
                  这一步把「<b>任意两个区间</b>之间的关系」变成了
                  「<b>相邻两个区间</b>之间的关系」,一次扫描就能回答。
                  同样这套「排序做准备、扫描做决定」的模式,
                  在第 6 章贪心里会反复出现 —— 排序在那里也是大多数解法的第一步。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §09 题单 ================= */}
      <Section
        id="problems"
        index="09"
        title={{
          en: "Problem set: nine sorting problems",
          zh: "高频题单:排序 9 题",
        }}
        desc={{
          en: "Ordered by idea: counting, merging, comparators, partition variants, then merge sort. Think for 30 seconds before opening a hint.",
          zh: "按思路排列:计数 → 合并 → 比较器 → partition 变体 → 归并。先自己想 30 秒再看提示",
        }}
        badge={<span className="chip"><T en="Core set" zh="主线必做" /></span>}
      >
        <ProblemSet ch="sorting" items={PROBLEMS} />
      </Section>

      {/* ================= §10 Quiz ================= */}
      <Section
        id="quiz"
        index="10"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Answer all 8 correctly to mark this chapter as complete.",
          zh: "8 题全对,本章标记为通关",
        }}
        badge={<span className="chip">✎ <T en="Quiz" zh="通关测验" /></span>}
      >
        <Quiz ch="sorting" items={QUIZ} />
      </Section>

      <KeyPoints
        points={{
          en: [
            <>
              Sorting is often <b>not the goal but the preparation</b>. Binary
              search, removing duplicates, merging intervals, and most greedy
              algorithms only work on sorted data. When a problem gives you
              unordered input and asks about relationships between items, ask
              first what sorting would change.
            </>,
            <>
              The three O(n²) sorts differ by their <b>loop invariant</b>. Bubble
              and selection fix one element in its <b>final position</b> per
              round; insertion only keeps the first i elements{" "}
              <b>sorted among themselves</b>. Insertion sort is O(n) on nearly
              sorted data and is the best of the three for small arrays.
            </>,
            <>
              <b>Merge sort</b>: split, recurse, merge. O(n log n) in the best,
              average, and worst case, stable, O(n) auxiliary space. It is the
              choice for linked lists, for external sorting, and whenever
              stability is required.
            </>,
            <>
              <b>Quicksort</b> is built on partition:{" "}
              <b>one pass places the pivot at its final index, for good</b>.
              Fastest on average, but O(n²) in the worst case, so it needs a{" "}
              <b>random pivot</b> (sorted input with a fixed pivot is the bad
              case) and a three-way partition when there are many duplicates.
              Running the same partition but searching only one side is{" "}
              <b>quickselect</b> (LC 215).
            </>,
            <>
              The <b>Ω(n log n) lower bound applies to comparison-based sorting
              only</b>, and the decision-tree argument is the proof. Counting,
              bucket, and radix sort <b>do not compare</b>; they use the value
              range instead, which gets counting sort to O(n + k) and radix sort
              to O(d(n + k)). The condition is what matters: the keys must map to
              a bounded range of integers or to buckets.
            </>,
            <>
              <b>Stable means equal elements keep their original relative order</b>
              , which is what lets you apply sorts one after another: sort by the
              secondary key, then by the primary key with a stable sort. Merge,
              insertion, and bubble sort are stable; quicksort, heap sort, and
              selection sort are not.
            </>,
            <>
              Built-in sorts <b>combine several algorithms</b>. Java uses
              dual-pivot quicksort for primitives (not stable, but that cannot be
              observed on primitives) and TimSort for objects (stable). Python
              uses TimSort and is stable. JavaScript has been required to be
              stable since ES2019, but with no comparator it{" "}
              <b>compares elements as strings</b>, so{" "}
              <code>[1, 10, 2].sort()</code> returns <code>[1, 10, 2]</code>.
              Always pass a comparator for numbers.
            </>,
          ],
          zh: [
            <>
              排序常常<b>不是目的,而是准备工作</b>:二分查找、去重、合并区间、
              以及大多数贪心,都要求数据先有序。
              题目给的是乱序输入、问的是元素之间的关系时,先想一想排序会带来什么变化。
            </>,
            <>
              三种 O(n²) 排序的区别在<b>循环不变量</b>:冒泡和选择每轮把一个元素钉在
              <b>最终位置</b>上;插入只保证前 i 个元素<b>彼此有序</b>。
              插入排序在近乎有序的数据上是 O(n),也是三者中小数组的最佳选择。
            </>,
            <>
              <b>归并排序</b>:劈开、递归、合并。最好、平均、最坏都是 O(n log n),
              稳定,辅助空间 O(n)。链表排序、外部排序,以及任何要求稳定的场合,都选它。
            </>,
            <>
              <b>快排</b>建立在 partition 上:<b>一趟就把基准放到它的最终下标,不再移动</b>。
              平均最快,但最坏 O(n²),所以需要<b>随机基准</b>
              (固定基准遇上已排序输入就是坏情况),重复元素多时还需要三路划分。
              同样的 partition,只在一侧继续搜索,就是 <b>quickselect</b>(LC 215)。
            </>,
            <>
              <b>Ω(n log n) 这条下界只管基于比较的排序</b>,证明用的是决策树。
              计数、桶、基数排序<b>不做比较</b>,改用值域信息,
              于是计数排序是 O(n + k),基数排序是 O(d(n + k))。
              真正要记的是条件:键必须能映射到有界的整数范围或桶。
            </>,
            <>
              <b>稳定的意思是相等元素保持原有的相对顺序</b>,
              这正是排序可以叠加的原因:先按次要键排,再用稳定排序按主要键排。
              归并、插入、冒泡稳定;快排、堆排、选择不稳定。
            </>,
            <>
              内置排序都是<b>几种算法的组合</b>。Java 对基本类型用双轴快排
              (不稳定,但在基本类型上观察不到),对对象用 TimSort(稳定);
              Python 用 TimSort,稳定;JavaScript 从 ES2019 起要求稳定,
              但不传比较器时它<b>把元素当字符串比较</b>,
              所以 <code>[1, 10, 2].sort()</code> 返回 <code>[1, 10, 2]</code>。
              给数字排序一定要传比较器。
            </>,
          ],
        }}
      />

      <ChapterFooter ch="sorting" />
    </main>
  );
}
