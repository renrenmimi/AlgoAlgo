"use client";

// 第 1 章 · 排序 —— 算法设计思想的展览馆。
// 结构:为什么学排序 → O(n²) 三兄弟(不变量) → 归并(分治首秀 + 912 归并解) →
// 快排(partition 逐帧 + 随机化 + 912 快排解) → 突破比较下界(计数/桶/基数) →
// 稳定性 + 内置 sort 真身 → 精讲 215(Quickselect vs 堆) → 精讲 56(排序+扫描) →
// 题单 → 测验 → 要点。
// 招牌可视化:自建条形图排序 stepper(SortLab)、partition ArrayStepper(PartitionDemo)。

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
  { id: "why", n: "01", label: "为什么学排序" },
  { id: "n2", n: "02", label: "O(n²) 三兄弟" },
  { id: "merge", n: "03", label: "归并 · 分治首秀" },
  { id: "quick", n: "04", label: "快排 · partition" },
  { id: "linear", n: "05", label: "突破比较下界" },
  { id: "stable", n: "06", label: "稳定性 & 内置 sort" },
  { id: "select", n: "07", label: "第 K 大" },
  { id: "intervals", n: "08", label: "合并区间" },
  { id: "problems", n: "09", label: "高频题单" },
  { id: "quiz", n: "10", label: "通关测验" },
];

export default function SortingChapter() {
  return (
    <main className="page" data-ch="sorting">
      <Hero
        ch="sorting"
        title={
          <>
            排序 <span className="grad">Sorting</span>
          </>
        }
        essence={
          <>
            排序看似只是「把数字从小排到大」,却是整门算法课的<strong>思想展览馆</strong>:
            从蛮力的两两比较,到分治的一分为二,再到「根本不比较」的数数 ——
            每一次变快,背后都是一种全新的世界观。学完这一章,你不仅会写排序,
            更会看懂「为什么它能这么快」,以及<strong>什么时候该借排序给别的问题开路</strong>。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 为什么学排序 ================= */}
      <Section
        id="why"
        index="01"
        title="为什么排序值得单开一章"
        desc="排序很少是目的,却是无数算法的地基"
      >
        <div className="prose">
          <p>
            先破除一个误会:面试里几乎没人让你「手写一个排序」当最终答案 ——
            因为每种语言都内置了 <code>sort</code>。那为什么还要学?因为<strong>排序是一种预处理的世界观</strong>:
            很多看起来杂乱无章的问题,<strong>只要先排个序,难度就塌了一半</strong>。
          </p>
          <ul>
            <li>二分查找要求数组<strong>有序</strong>(第 3 章)——「有序」从哪来?排序。</li>
            <li>合并区间(LC 56)乱序时无从下手,<strong>按左端点排完</strong>,重叠的必然相邻。</li>
            <li>找第 K 大(LC 215),partition 一步就能砍掉一半,根本不用全排。</li>
            <li>去重、找众数、判断能否拼接、贪心的「先排后选」…… 背后都站着排序。</li>
          </ul>
          <p>
            更重要的是:排序算法本身是<strong>算法思想的最佳教具</strong>。这一章我们会亲眼见到
            分治(归并)、随机化(快排)、以空间换时间(计数)、以及「稳定性」这种在工程里
            要命、教材里却常被一笔带过的概念。它们全都会在后面的章节反复登场。
          </p>
        </div>
        <Callout tone="story" title="人类排了几千年,计算机排了七十年">
          <p>
            图书馆按书号上架、扑克摸牌时理牌、Excel 点一下列头 —— 排序是人类最古老的整理本能。
            1945 年 <b>冯·诺依曼</b>为第一台存储程序计算机写下的早期程序之一,就是<b>归并排序</b>;
            1959 年 <b>Tony Hoare</b> 为了给俄英机器翻译排词典,发明了<b>快速排序</b>。
            排序的历史,几乎就是计算机算法史本身。
          </p>
        </Callout>
        <div className="prose">
          <p>
            我们从最朴素的想法开始。给你一副乱牌 [5, 2, 9, 1, 6],怎么排?最直觉的三种办法
            —— 冒泡、选择、插入 —— 都是 O(n²) 的「三兄弟」。别急着背代码,
            先<strong>亲手播放</strong>它们,感受三种不同的「笨办法」到底笨在哪、又各有什么脾气:
          </p>
        </div>
        <SortLab />
      </Section>

      {/* ================= §02 O(n²) 三兄弟 ================= */}
      <Section
        id="n2"
        index="02"
        title="O(n²) 三兄弟:各有各的不变量"
        desc="冒泡 / 选择 / 插入 —— 慢是真慢,但每一个都藏着一句「循环不变量」"
      >
        <div className="prose">
          <p>
            三兄弟都是双层循环、都是 O(n²),但它们的<strong>循环不变量(loop invariant)</strong>
            —— 也就是「每一轮结束后,数组一定满足的性质」—— 完全不同。
            看懂不变量,才算真懂一个算法,而不是背下它。
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 4 }}>
          <div className="card hoverable">
            <div className="card-kicker">兄弟 01 · 冒泡</div>
            <div className="card-title">🫧 大的往右冒</div>
            <p>
              <b>不变量:</b>第 i 轮后,<b>最右边 i 个</b>已是全局最大的 i 个、且已就位。
              相邻逆序就交换,大数像气泡上浮。唯一优点:某轮<b>零交换</b>即可提前退出,
              近乎有序时能到 O(n)。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">兄弟 02 · 选择</div>
            <div className="card-title">🎯 每轮挑最小</div>
            <p>
              <b>不变量:</b>第 i 轮后,<b>最左边 i 个</b>已是全局最小的 i 个、且已排好。
              每轮全扫一遍挑最小值换到前面。<b>交换次数最少</b>(≤ n−1 次),
              但比较次数<b>雷打不动</b> O(n²),对有序输入也不会变快。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">兄弟 03 · 插入</div>
            <div className="card-title">🃏 摸牌插进手里</div>
            <p>
              <b>不变量:</b>第 i 轮后,<b>前 i 个</b>元素<b>内部</b>已有序(但不一定是最终位置)。
              像理扑克:摸一张插到左边有序牌的正确位置。<b>近乎有序时极快</b>(O(n)),
              是小数组之王 —— 这点稍后你会在「内置 sort 真身」里再遇见它。
            </p>
          </div>
        </div>
        <Callout tone="idea" title="三个「前 i 个」,含义天差地别">
          <p>
            冒泡/选择的「已就位」是<b>全局最终位置</b>(这几个数再也不动);插入的「已有序」
            只是<b>这几个数彼此有序</b>,后面摸到更小的牌还会插进来。分清这个差别,
            就能解释为什么插入排序能中途「见缝插针」,而选择排序必须每轮从头扫。
          </p>
        </Callout>
        <div className="prose">
          <p>
            三兄弟里,<strong>插入排序</strong>最值得写进肌肉记忆:它是 TimSort 的基石,
            也是「近乎有序」数据上的最快选择。模板如下(三语言都给,注意内层循环的方向):
          </p>
        </div>
        <CodeTabs
          title="insertion_sort"
          java={{
            code: `class Solution {
    public void insertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int key = a[i];             // 摸起第 i 张新牌
            int j = i - 1;
            while (j >= 0 && a[j] > key) {  // 比 key 大的牌统统右移
                a[j + 1] = a[j];
                j--;
            }
            a[j + 1] = key;             // key 落到空出来的位置
        }
    }
}`,
            hl: [6, 7, 8],
            note: (
              <>
                <b>不变量:</b>每轮开始时 <code>a[0..i-1]</code> 已内部有序。
                内层用 <code>a[j] &gt; key</code>(严格大于)而非 <code>≥</code>,是<b>保持稳定</b>的关键 ——
                相等元素不越位。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def insertion_sort(self, a: list[int]) -> None:
        for i in range(1, len(a)):
            key = a[i]                  # 摸起新牌
            j = i - 1
            while j >= 0 and a[j] > key:  # 大的往右让位
                a[j + 1] = a[j]
                j -= 1
            a[j + 1] = key`,
            hl: [6, 7, 8],
            note: (
              <>
                <b>小陷阱:</b>循环里边比较边右移,靠的是 <code>key</code> 提前存好了原值 ——
                否则 <code>a[j+1] = a[j]</code> 会把要插入的数覆盖掉。
              </>
            ),
          }}
          js={{
            code: `var insertionSort = function (a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];               // 摸起新牌
    let j = i - 1;
    while (j >= 0 && a[j] > key) {   // 大的往右让位
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
  return a;
};`,
            hl: [5, 6, 7],
            note: (
              <>
                内层 <code>while</code> 一旦遇到 <code>a[j] ≤ key</code> 立刻停 ——
                这就是「近乎有序 → O(n)」的来源:大多数牌几乎不用往回走。
              </>
            ),
          }}
        />
        <Callout tone="warn" title="三兄弟为什么在大数据上出局">
          <p>
            n = 10⁵ 时,O(n²) 是 100 亿次操作,秒级 TLE;而 O(n log n) 只有约 170 万次。
            所以 LC 912(排序数组,n 可达 5×10⁴)提交冒泡会超时。三兄弟的价值在于<b>教学</b>和
            <b>小数组</b>(几十个元素时常数小反而更快)—— 真正上战场的,是下面两位。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 归并排序(分治首秀 + 912 归并解) ================= */}
      <Section
        id="merge"
        index="03"
        title="归并排序:这门课的分治首秀"
        desc="精讲 A · LC 912(归并解)—— 一分为二,信任递归,再合并"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意(LC 912):</b>给一个乱序数组,把它排好并返回,要求 O(n log n)。
            <b> 暴力:</b>三兄弟任选一个 —— O(n²),超时。
            <b> 为什么能优化:</b>三兄弟每次比较只「挪动一格」,信息利用率极低。
            分治换一种思路:<strong>把数组劈成两半,分别排好,再把两个有序段合并起来</strong>。
            合并两个已排好的段是廉价的线性操作 —— 这就是省时间的关键。
          </p>
          <p>
            这也是全书第一次正式用<strong>分治(divide and conquer)</strong>:
            分(劈成两半)→ 治(递归排好每半,<strong>信任它一定能排好</strong>)→ 合(合并)。
            「信任递归」是序章 §03 讲过的地基,第 2 章会把这套框架讲透 ——
            排序在这里先带你见识它的威力。归并的心脏是「合并两个有序段」,单独逐帧看清楚:
          </p>
        </div>
        <MergeDemo />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            合并看懂了,整个归并就是「劈到不能再劈(单个元素天然有序),然后一层层合并回去」。
            三语言实现(注意那一行<strong>相等取左</strong>的注释,它决定了归并的稳定性):
          </p>
        </div>
        <CodeTabs
          title="lc912_merge_sort"
          java={{
            code: `class Solution {
    public int[] sortArray(int[] nums) {
        int[] tmp = new int[nums.length];       // 复用一块辅助数组,别反复 new
        mergeSort(nums, 0, nums.length - 1, tmp);
        return nums;
    }
    private void mergeSort(int[] a, int lo, int hi, int[] tmp) {
        if (lo >= hi) return;                   // 0 或 1 个元素:天然有序
        int mid = lo + (hi - lo) / 2;           // 防溢出的取中点写法
        mergeSort(a, lo, mid, tmp);             // 治:排左半
        mergeSort(a, mid + 1, hi, tmp);         // 治:排右半
        merge(a, lo, mid, hi, tmp);             // 合:合并两段有序
    }
    private void merge(int[] a, int lo, int mid, int hi, int[] tmp) {
        for (int k = lo; k <= hi; k++) tmp[k] = a[k];
        int i = lo, j = mid + 1;
        for (int k = lo; k <= hi; k++) {
            if (i > mid)                a[k] = tmp[j++];  // 左段用尽
            else if (j > hi)            a[k] = tmp[i++];  // 右段用尽
            else if (tmp[i] <= tmp[j])  a[k] = tmp[i++];  // 相等取左 → 稳定
            else                        a[k] = tmp[j++];
        }
    }
}`,
            hl: [20],
            note: (
              <>
                <b>取中点</b>写 <code>lo + (hi - lo) / 2</code> 而非 <code>(lo + hi) / 2</code>,
                后者在大数组里可能整型溢出(二分章会再强调)。辅助数组<b>复用一块</b>,
                避免每层递归都开新数组。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def sortArray(self, nums: list[int]) -> list[int]:
        def merge_sort(lo: int, hi: int) -> None:
            if lo >= hi:
                return
            mid = (lo + hi) // 2
            merge_sort(lo, mid)
            merge_sort(mid + 1, hi)
            tmp, i, j = [], lo, mid + 1
            while i <= mid and j <= hi:
                if nums[i] <= nums[j]:          # 相等取左 → 稳定
                    tmp.append(nums[i]); i += 1
                else:
                    tmp.append(nums[j]); j += 1
            tmp.extend(nums[i:mid + 1])          # 左段剩余
            tmp.extend(nums[j:hi + 1])           # 右段剩余
            nums[lo:hi + 1] = tmp                # 写回
        merge_sort(0, len(nums) - 1)
        return nums`,
            hl: [11],
            note: (
              <>
                Python 递归深度默认 1000,n=5×10⁴ 时分治深度 ≈ log₂(5万) ≈ 16,毫无压力。
                切片 <code>nums[i:mid+1]</code> 会复制,追求极致可换成手写下标,但可读性更重要。
              </>
            ),
          }}
          js={{
            code: `var sortArray = function (nums) {
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
      else if (tmp[i] <= tmp[j]) nums[k] = tmp[i++];  // 相等取左 → 稳定
      else nums[k] = tmp[j++];
    }
  };
  mergeSort(0, nums.length - 1);
  return nums;
};`,
            hl: [13],
            note: (
              <>
                <code>(lo + hi) &gt;&gt; 1</code> 是取中点的位运算写法(第 4 章细讲)。
                排序下标远达不到 2³¹,用 <code>&gt;&gt;</code> 放心;更大的数才需担心它的 32 位截断。
              </>
            ),
          }}
        />
        <Callout tone="idea" title="为什么归并一定是 O(n log n)">
          <p>
            画一棵递归树:每层把区间劈半,一共 <b>log₂n 层</b>;每一层的所有 merge 加起来
            恰好把全部 n 个元素各扫一遍,是 <b>O(n)</b>。层数 × 每层代价 = <b>O(n log n)</b>,
            且<b>与输入顺序无关</b>(最好=最坏=平均)。这套「递归树数复杂度」的方法,
            第 2 章分治会正式讲(主定理直觉版)。代价是需要 <b>O(n) 辅助空间</b>。
          </p>
        </Callout>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>归并排序</th>
                <th>最好</th>
                <th>平均</th>
                <th>最坏</th>
                <th>空间</th>
                <th>稳定?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>时间 / 空间 / 稳定性</b></td>
                <td><BigO o="nlogn" /></td>
                <td><BigO o="nlogn" /></td>
                <td><BigO o="nlogn" /></td>
                <td><BigO o="n" /></td>
                <td>✅ 稳定</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="deep" title="工程现场:数据大到内存装不下怎么办">
          <p>
            归并是<b>外部排序(external sort)</b>的核心:要排 1TB 日志而内存只有 8GB,
            就把数据切成能装进内存的小块,各自排好写回磁盘,再<b>多路归并</b>这些有序文件 ——
            合并只需顺序读、内存里放几个指针即可。数据库的 <code>ORDER BY</code> 大结果集、
            MapReduce 的 shuffle 阶段,底层都是归并。快排在这里帮不上忙(它要随机访问),
            归并「只需顺序扫描」的特性成了杀手锏。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 快速排序(partition + 912 快排解) ================= */}
      <Section
        id="quick"
        index="04"
        title="快速排序:partition 是灵魂"
        desc="精讲 A · LC 912(快排解)—— 选个基准,一趟分成两堆,再各自快排"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            归并是「先无脑劈,合并时才干活」;快排反过来 ——「<strong>划分时就干活,合并时啥也不用做</strong>」。
            它的灵魂是一个叫 <strong>partition(划分)</strong>的操作:选一个<strong>基准(pivot)</strong>,
            扫一遍把<strong>比它小的甩到左边、比它大的留右边</strong>,基准自己落到中间的「分界缝」。
            这一趟走完,<strong>基准就到了它在最终有序数组里的正确位置,永远不用再动</strong>。
          </p>
          <p>
            这句话是快排(以及后面 215 快速选择)的全部精华。逐帧看一次 Lomuto 方案的 partition,
            盯住两个指针 <b>i</b>(小值区右边界)和 <b>j</b>(扫描),以及基准最后是怎么归位的:
          </p>
        </div>
        <PartitionDemo />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            partition 会了,快排就三行:<strong>划分 → 左段快排 → 右段快排</strong>
            (基准那一格已就位,跳过)。有一个坑必须处理 —— <strong>基准的选择</strong>:
            如果总是取最后一个,遇到<strong>已经有序</strong>的数组,每次划分都只切掉一个元素,
            递归深 n 层,退化成 O(n²) 且爆栈。解药是<strong>随机化基准</strong>:
            划分前随机挑一个元素与末位交换,让「最坏情况」的概率低到可以忽略。
          </p>
        </div>
        <CodeTabs
          title="lc912_quick_sort"
          java={{
            code: `class Solution {
    public int[] sortArray(int[] nums) {
        quickSort(nums, 0, nums.length - 1);
        return nums;
    }
    private void quickSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int p = partition(a, lo, hi);   // 基准归位,返回它的下标
        quickSort(a, lo, p - 1);        // 只排左段
        quickSort(a, p + 1, hi);        // 只排右段(a[p] 已就位)
    }
    private int partition(int[] a, int lo, int hi) {
        int r = lo + (int) (Math.random() * (hi - lo + 1)); // 随机基准!防退化
        swap(a, r, hi);                 // 把随机基准换到末位
        int pivot = a[hi], i = lo - 1;
        for (int j = lo; j < hi; j++)
            if (a[j] < pivot) swap(a, ++i, j);  // 小的换进左区
        swap(a, i + 1, hi);             // 基准落到 i+1
        return i + 1;
    }
    private void swap(int[] a, int x, int y) { int t = a[x]; a[x] = a[y]; a[y] = t; }
}`,
            hl: [14, 15],
            note: (
              <>
                <b>不随机化就会 TLE:</b>LeetCode 对 912 专门放了「已排序」和「全相等」的用例来卡朴素快排。
                随机基准(或三数取中)是必备防身术。全相等数组请另用<b>三路快排</b>(见 LC 75),
                否则仍会退化。
              </>
            ),
          }}
          python={{
            code: `import random

class Solution:
    def sortArray(self, nums: list[int]) -> list[int]:
        def quick(lo: int, hi: int) -> None:
            if lo >= hi:
                return
            r = random.randint(lo, hi)          # 随机基准!防退化
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
            hl: [8],
            note: (
              <>
                Python 递归默认限深 1000;随机化后期望深度约 O(log n),安全。
                若担心极端用例,可把「较短的一侧递归、较长的一侧改成循环」(尾递归消除)控制栈深。
              </>
            ),
          }}
          js={{
            code: `var sortArray = function (nums) {
  const swap = (x, y) => { [nums[x], nums[y]] = [nums[y], nums[x]]; };
  const quick = (lo, hi) => {
    if (lo >= hi) return;
    const r = lo + Math.floor(Math.random() * (hi - lo + 1)); // 随机基准!
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
            hl: [5],
            note: (
              <>
                解构赋值 <code>[a, b] = [b, a]</code> 交换很优雅,但在超大数组热点里比临时变量略慢;
                竞赛/极限场景可换回临时变量写法。功能上完全等价。
              </>
            ),
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>快速排序</th>
                <th>最好</th>
                <th>平均</th>
                <th>最坏</th>
                <th>空间</th>
                <th>稳定?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>时间 / 空间 / 稳定性</b></td>
                <td><BigO o="nlogn" /></td>
                <td><BigO o="nlogn" /></td>
                <td><BigO o="n2" label="O(n²) 退化" /></td>
                <td><BigO o="logn" label="O(log n) 栈" /></td>
                <td>❌ 不稳定</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="win" title="面试话术:归并 vs 快排怎么选">
          <p>
            「两者平均都是 O(n log n)。<b>快排</b>常数更小、原地(只用 O(log n) 栈),是<b>内存排序的默认选择</b>,
            但不稳定、最坏 O(n²),需随机化基准防退化;<b>归并</b>稳定、最坏也是 O(n log n),
            适合<b>要求稳定、链表、或外部排序</b>的场景,代价是 O(n) 辅助空间。」——
            能把这段权衡说清楚,比只会写一种强得多。
          </p>
        </Callout>
        <Callout tone="story" title="快排作者 Hoare 的一句大实话">
          <p>
            Tony Hoare 26 岁发明快排。他留下过一句箴言:算法的巧妙不在写出来,而在
            <b>证明它为什么对、为什么快</b>。partition 的循环不变量(扫描到某点时,i 左边全 &lt; pivot)
            正是这种「先证明再动手」的典范 —— 也是本课反复强调「每个结论都要能回答为什么」的原因。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 突破比较下界 ================= */}
      <Section
        id="linear"
        index="05"
        title="突破 O(n log n):不比较,只数数"
        desc="计数 / 桶 / 基数排序 —— 为什么它们能比「理论下界」还快?"
      >
        <div className="prose">
          <p>
            前面所有排序都靠「两两比较」。这里有一个<strong>惊人的事实</strong>:
            任何<strong>基于比较</strong>的排序,最坏情况都<strong>不可能快过 O(n log n)</strong> ——
            这是数学证明的<strong>下界</strong>,不是「还没想到更好的办法」。为什么?
          </p>
        </div>
        <div className="srt-lb">
          <div className="card">
            <div className="card-kicker">前提</div>
            <div className="card-title">🔀 n! 种可能</div>
            <p>
              n 个不同元素,可能的排列有 <b>n!</b> 种。排序算法必须能<b>区分出</b>其中每一种,
              才能保证对所有输入都排对。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">工具</div>
            <div className="card-title">🌳 一次比较 = 一个分叉</div>
            <p>
              每次「a 和 b 谁大」只有两个结果,是一棵二叉<b>决策树</b>的一个分叉。
              树高 h 的二叉树,最多只有 <b>2ʰ</b> 个叶子(结局)。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">结论</div>
            <div className="card-title">📉 h ≥ log₂(n!)</div>
            <p>
              要 2ʰ ≥ n!,就得 h ≥ log₂(n!) ≈ <b>n log₂n</b>。树高 = 最坏比较次数,
              于是<b>任何比较排序 ≥ O(n log n)</b>。铁律。
            </p>
          </div>
        </div>
        <div className="prose">
          <p>
            那计数排序凭什么能到 O(n)?因为它<strong>根本不比较</strong>。它换了一种信息来源:
            <strong>如果我知道数据的值域很小(比如都是 0~100 的整数),我可以直接开一排桶数数,
            而不是问「谁比谁大」</strong>。不比较,就不受比较下界的约束 —— 逃出生天靠的是「换赛道」。
            逐帧看计数排序怎么「数数 → 倒桶」:
          </p>
        </div>
        <CountingDemo />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            计数排序模板(注意用<strong>偏移量</strong>支持负数):
          </p>
        </div>
        <CodeTabs
          title="counting_sort"
          java={{
            code: `int[] countingSort(int[] a) {
    if (a.length == 0) return a;
    int lo = Arrays.stream(a).min().getAsInt();
    int hi = Arrays.stream(a).max().getAsInt();
    int[] cnt = new int[hi - lo + 1];       // 开 (值域) 个桶
    for (int x : a) cnt[x - lo]++;          // 数每个值出现几次(不比较!)
    int idx = 0;
    for (int v = 0; v < cnt.length; v++)    // 从小到大倒桶
        while (cnt[v]-- > 0) a[idx++] = v + lo;
    return a;
}`,
            hl: [6],
            note: (
              <>
                时间 <b>O(n + k)</b>、空间 <b>O(k)</b>,k = 值域宽度。
                若要<b>稳定</b>版(计数排序常作为基数排序的子过程),需改用「前缀和 + 倒序填回」,
                而非这里的「倒桶」——倒桶写法会丢失同值元素的原始顺序。
              </>
            ),
          }}
          python={{
            code: `def counting_sort(a: list[int]) -> list[int]:
    if not a:
        return a
    lo, hi = min(a), max(a)
    cnt = [0] * (hi - lo + 1)            # 开 (值域) 个桶
    for x in a:
        cnt[x - lo] += 1                # 数数,不比较
    out = []
    for v, c in enumerate(cnt):         # 从小到大倒桶
        out.extend([v + lo] * c)
    return out`,
            hl: [6, 7],
            note: (
              <>
                <code>[v + lo] * c</code> 一次生成 c 个相同值,简洁。
                LC 1365「有多少小于当前数字」就是计数排序 + 前缀和的直接应用。
              </>
            ),
          }}
          js={{
            code: `var countingSort = function (a) {
  if (a.length === 0) return a;
  const lo = Math.min(...a), hi = Math.max(...a);
  const cnt = new Array(hi - lo + 1).fill(0);  // 开 (值域) 个桶
  for (const x of a) cnt[x - lo]++;            // 数数,不比较
  let idx = 0;
  for (let v = 0; v < cnt.length; v++)
    while (cnt[v]-- > 0) a[idx++] = v + lo;    // 从小到大倒桶
  return a;
};`,
            hl: [5],
            note: (
              <>
                <code>Math.min(...a)</code> 在超大数组上会因展开参数过多而栈溢出,
                生产代码请用一次 for 循环求 min/max。教学写法图简洁。
              </>
            ),
          }}
        />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">计数排序</div>
            <div className="card-title">🪣 一值一桶</div>
            <p>
              适合<b>整数、值域 k 不大</b>。O(n+k)。k 一大(如任意 32 位整数)就爆内存 ——
              这时它比快排还糟。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">桶排序</div>
            <div className="card-title">🗂️ 一段一桶</div>
            <p>
              把值域切成若干区间桶,桶内再排(常用插入)。数据<b>均匀分布</b>时接近 O(n),
              分布不均则退化。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">基数排序</div>
            <div className="card-title">🔢 一位一轮</div>
            <p>
              按个位、十位、百位……<b>逐位</b>用稳定计数排序。O(d·(n+k)),d = 位数。
              排大整数 / 定长字符串的利器,<b>依赖计数排序的稳定性</b>。
            </p>
          </div>
        </div>
        <Callout tone="warn" title="别把非比较排序当银弹">
          <p>
            它们不通用:只能处理「键能映射成有限范围整数/桶」的数据。你没法用计数排序给
            任意对象按自定义规则排(比如 LC 179 按拼接大小),那种「只要能两两比较就能排」的活,
            还得交给快排/归并。<b>能非比较则线性,不能则老实 O(n log n)</b> —— 看清值域再决定。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 稳定性 + 内置 sort 真身 ================= */}
      <Section
        id="stable"
        index="06"
        title="稳定性 & 内置 sort 的真身"
        desc="工程里最要命、教材里最爱略过的一个词 —— 稳定"
      >
        <div className="prose">
          <p>
            <strong>稳定(stable)</strong>的定义:排序后,<strong>值相等的元素,相对顺序和排序前一样</strong>。
            听起来无关紧要?对纯数字确实无所谓 —— 两个 5 谁前谁后你根本看不出来。但一旦元素是
            <strong>带多个字段的对象</strong>,稳定性就是「多关键字排序」能不能成立的命根子。先动手感受:
          </p>
        </div>
        <StabilityDemo />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            为什么它要命?看一个真实场景:一张订单表,你想「<strong>先按金额排,金额相同的按下单时间排</strong>」。
            聪明的做法是<strong>先按时间排一遍,再按金额排一遍</strong> —— 只要第二次排序是<strong>稳定</strong>的,
            金额相同的订单就会<strong>保留上一轮的时间顺序</strong>,一步到位。要是第二次用了不稳定排序,
            金额相同的订单时间顺序会被打乱,前功尽弃。这就是「稳定排序 = 可叠加的排序」。
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>算法</th>
                <th>平均时间</th>
                <th>最坏时间</th>
                <th>空间</th>
                <th>稳定?</th>
                <th>一句话记忆</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><b>冒泡</b></td><td><BigO o="n2" /></td><td><BigO o="n2" /></td><td><BigO o="1" /></td><td>✅</td><td>只换相邻,天然稳定</td></tr>
              <tr><td><b>插入</b></td><td><BigO o="n2" /></td><td><BigO o="n2" /></td><td><BigO o="1" /></td><td>✅</td><td>近乎有序时 O(n),小数组之王</td></tr>
              <tr><td><b>选择</b></td><td><BigO o="n2" /></td><td><BigO o="n2" /></td><td><BigO o="1" /></td><td>❌</td><td>长距离交换毁了顺序</td></tr>
              <tr><td><b>归并</b></td><td><BigO o="nlogn" /></td><td><BigO o="nlogn" /></td><td><BigO o="n" /></td><td>✅</td><td>稳定 + 最坏保证,外部排序首选</td></tr>
              <tr><td><b>快排</b></td><td><BigO o="nlogn" /></td><td><BigO o="n2" /></td><td><BigO o="logn" /></td><td>❌</td><td>平均最快,内存排序默认</td></tr>
              <tr><td><b>堆排</b></td><td><BigO o="nlogn" /></td><td><BigO o="nlogn" /></td><td><BigO o="1" /></td><td>❌</td><td>原地 + 最坏保证(见 DataData·09 堆)</td></tr>
              <tr><td><b>计数</b></td><td><BigO o="n" label="O(n+k)" /></td><td><BigO o="n" label="O(n+k)" /></td><td><BigO o="n" label="O(k)" /></td><td>✅*</td><td>不比较,值域小才划算</td></tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            <b>*</b> 计数排序用「前缀和 + 倒序填回」实现时稳定,用「倒桶」实现时不稳定 —— 取决于写法。
          </p>
          <p>
            现在揭开谜底:你每天用的内置 <code>sort</code>,底层到底是谁?答案会让你会心一笑 ——
            <strong>它们没有押注单一算法,而是「混合排序」</strong>,把上表几位的长处拼在一起:
          </p>
        </div>
        <CodeTabs
          title="builtin_sort_真身"
          java={{
            code: `int[] a = {5, 2, 9, 1, 6};
// ① 基本类型:双轴快排 Dual-Pivot Quicksort(Yaroslavskiy)
//    不稳定,但基本类型「相等即相同」,稳不稳定无所谓,于是选最快的
Arrays.sort(a);

// ② 对象 / 装箱类型:TimSort(归并 + 插入的混血),稳定
Integer[] b = {5, 2, 9, 1, 6};
Arrays.sort(b, Comparator.reverseOrder());        // 降序

// ③ 自定义比较器(LC 179 / 1356 就靠它)
Integer[] c = {3, 30, 34, 5, 9};
Arrays.sort(c, (x, y) -> ("" + y + x).compareTo("" + x + y));`,
            hl: [4, 8],
            note: (
              <>
                <b>为什么分两套?</b>基本类型没有「身份」,稳定性无意义,于是选常数更小的双轴快排;
                对象有身份、可能要多关键字叠加排序,必须<b>稳定</b>,于是用 TimSort。
                这是「稳定性决定算法选择」的教科书案例。
              </>
            ),
          }}
          python={{
            code: `a = [5, 2, 9, 1, 6]
a.sort()                       # 原地排序,底层 TimSort,稳定
b = sorted(a, reverse=True)    # 返回新列表,不改原数据

# key= 指定排序键,每个元素只调用一次(比传两两比较的 cmp 快得多)
words = ["bb", "a", "ccc", "dd"]
words.sort(key=lambda w: (len(w), w))   # 先按长度,再按字典序

# 确实需要「两两比较」逻辑(如 LC 179)时,用 cmp_to_key 转换:
from functools import cmp_to_key
nums = [3, 30, 34, 5, 9]
nums.sort(key=cmp_to_key(lambda x, y: 1 if f"{y}{x}" > f"{x}{y}" else -1))`,
            hl: [2],
            note: (
              <>
                <b>TimSort 是 Python 人 Tim Peters 2002 年发明的</b>,后被 Java(对象排序)、
                Android、V8 等纷纷采用。<code>key=</code> 优于 <code>cmp_to_key</code>:
                前者每元素算一次键、共 O(n) 次,后者要 O(n log n) 次比较调用,慢。
              </>
            ),
          }}
          js={{
            code: `const a = [5, 2, 9, 1, 6];

// ⚠️ 头号大坑:不传比较器,默认按「字符串」排!
[1, 10, 2, 21].sort();          // → [1, 10, 2, 21] 而不是 [1, 2, 10, 21]

// 正确:数字排序必须给比较器
a.sort((x, y) => x - y);        // 升序
a.sort((x, y) => y - x);        // 降序

// V8:长度 > 10 用 TimSort,短数组用插入排序;
// ES2019 起规范强制要求 Array.prototype.sort 稳定
const arr = [{ k: 1, id: "a" }, { k: 1, id: "b" }];
arr.sort((x, y) => x.k - y.k);  // id 顺序保证不变(稳定)`,
            hl: [4, 7],
            note: (
              <>
                <b>JS 最经典的面试陷阱:</b><code>[1,10,2].sort()</code> 会得到 <code>[1,10,2]</code>,
                因为它把元素转成字符串按 UTF-16 码位比较(&quot;10&quot; &lt; &quot;2&quot;)。
                数字排序<b>永远记得传 <code>(x,y) =&gt; x-y</code></b>。
              </>
            ),
          }}
        />
        <Callout tone="deep" title="TimSort:把插入排序的「小而快」和归并的「稳而准」缝在一起">
          <p>
            TimSort 的洞察是:<b>真实世界的数据往往局部有序</b>(比如「基本排好、只有几个乱的」)。
            于是它先扫描出天然有序的片段(称为 run),太短的 run 用<b>插入排序</b>补齐到一定长度
            (插入排序在小数组和近乎有序时最快),再用<b>归并</b>把这些 run 稳定地拼起来
            (还有 galloping 等优化跳过大段)。最好情况 O(n)、最坏 O(n log n)、稳定 ——
            它是本章几乎所有算法的集大成者,也是「没有最好的算法,只有最合适的组合」的最佳注脚。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 精讲 B · LC 215 ================= */}
      <Section
        id="select"
        index="07"
        title="精讲 B · 第 K 大:不必全排"
        desc="LC 215 —— Quickselect 平均 O(n) vs 大小为 K 的堆"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>返回数组中第 K 大的元素(第 K 大 = 升序排列后的第 n−K 位)。
            <b> 暴力:</b>整个排序 O(n log n),取第 n−K 个 —— 能过,但<strong>做了多余的功</strong>:
            我们只想要一个位置的值,却把所有元素都排好了。
            <b> 为什么能优化:</b>还记得 partition 的「基准一次归位」吗?
            基准归位后,它的下标就固定了 —— <strong>如果这个下标正好是我们要的 n−K,直接返回;
            否则,目标只可能在其中一侧,另一侧整段扔掉不管</strong>。这就是快速选择(Quickselect)。
          </p>
          <p>
            partition 的逐帧动画在 §04 已经看过(快速选择用的是同一个 partition)。这里关键是
            <strong>划分后只递归一侧</strong>,期望规模每轮减半:n + n/2 + n/4 + … = 2n = <strong>O(n)</strong>:
          </p>
        </div>
        <CodeTabs
          title="lc215_quickselect"
          java={{
            code: `class Solution {
    public int findKthLargest(int[] nums, int k) {
        int target = nums.length - k;    // 第 k 大 = 升序第 (n-k) 位
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int p = partition(nums, lo, hi);
            if (p == target) return nums[p];   // 命中!
            else if (p < target) lo = p + 1;   // 目标在右侧,砍掉左侧
            else hi = p - 1;                    // 目标在左侧,砍掉右侧
        }
        return -1;
    }
    private int partition(int[] a, int lo, int hi) {
        int r = lo + (int) (Math.random() * (hi - lo + 1)); // 随机化必备
        swap(a, r, hi);
        int pivot = a[hi], i = lo - 1;
        for (int j = lo; j < hi; j++)
            if (a[j] < pivot) swap(a, ++i, j);
        swap(a, i + 1, hi);
        return i + 1;
    }
    private void swap(int[] a, int x, int y) { int t = a[x]; a[x] = a[y]; a[y] = t; }
}`,
            hl: [7, 8, 9],
            note: (
              <>
                用 <b>while 循环</b>而非递归,天然只走一侧,栈空间 O(1)。
                随机化仍是刚需:不随机,面对有序输入会退化到 O(n²)。
              </>
            ),
          }}
          python={{
            code: `import random

class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        target = len(nums) - k          # 第 k 大 = 升序第 (n-k) 位
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
                return nums[p]          # 命中!
            elif p < target:
                lo = p + 1              # 只追右侧
            else:
                hi = p - 1              # 只追左侧
        return -1`,
            hl: [17, 18, 19, 20, 21],
            note: (
              <>
                Python 也有偷懒解:<code>heapq.nlargest(k, nums)[-1]</code> 或直接
                <code>sorted(nums)[-k]</code>。但面试要你手写,考的正是「partition 归位 + 只追一侧」的理解。
              </>
            ),
          }}
          js={{
            code: `var findKthLargest = function (nums, k) {
  const target = nums.length - k;      // 第 k 大 = 升序第 (n-k) 位
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
    if (p === target) return nums[p];  // 命中!
    else if (p < target) lo = p + 1;   // 只追右侧
    else hi = p - 1;                    // 只追左侧
  }
  return -1;
};`,
            hl: [13, 14, 15],
            note: (
              <>
                时间平均 <b>O(n)</b>、最坏 <b>O(n²)</b>(随机化后概率极低)、空间 <b>O(1)</b>。
                注意它会<b>打乱原数组</b> —— 若原数组不能改,得先拷贝一份。
              </>
            ),
          }}
        />
        <Callout tone="win" title="另一条路:大小为 K 的堆(以及怎么权衡)">
          <p>
            维护一个大小为 K 的<b>小顶堆</b>:遍历数组,堆满后每来一个数就和堆顶比 ——
            比堆顶大就替换掉堆顶。扫完,堆顶就是第 K 大。时间 <b>O(n log K)</b>、空间 O(K),
            <b>不改动原数组、还能处理「数据像水流一样来、无法一次装进内存」的场景</b>(堆的细节见 DataData · 09 堆)。
            权衡:<b>能整块载入、可打乱、要平均最快 → Quickselect;数据是流 / 只读 / 要最坏保证 → 堆</b>。
            这正是本题最爱考的追问 —— 别只背一种。
          </p>
        </Callout>
        <Callout tone="deep" title="彩蛋:确定性 O(n) 的「中位数的中位数」">
          <p>
            Quickselect 最坏是 O(n²)。理论上有个「中位数的中位数(median of medians,BFPRT)」算法,
            通过精心选基准把<b>最坏也压到 O(n)</b>。但它常数极大,实战永远打不过随机化 Quickselect ——
            属于「知道它存在、面试能报出名字」即可的知识点。工程与竞赛,随机化才是王道。
          </p>
        </Callout>
      </Section>

      {/* ================= §08 精讲 C · LC 56 ================= */}
      <Section
        id="intervals"
        index="08"
        title="精讲 C · 合并区间:排序化乱为治"
        desc="LC 56 —— 排序不是目的,是让「重叠」变成「相邻」"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>给一堆区间(如 [[1,3],[2,6],[8,10],[15,18]]),把有重叠的合并,返回不重叠的区间集。
            <b> 暴力:</b>两两比较看是否重叠、反复合并 —— O(n²),而且「合并后又和别的重叠」的连锁很难处理干净。
            <b> 为什么能优化:</b>乱序时,能合并的区间可能散落在任何地方;但<strong>只要按左端点排序,
            能合并的区间一定紧挨在一起</strong> —— 因为后面的区间左端点只会更大,
            它要么和当前段重叠(左端 ≤ 当前右端),要么彻底断开,不存在「隔着一个区间又回头重叠」的情况。
          </p>
          <p>
            于是排序 O(n log n) 之后,只需<strong>一次线性扫描</strong>:维护「当前合并段」的右端点,
            新区间能接上就扩右端,接不上就收尾、另起一段。逐帧看:
          </p>
        </div>
        <IntervalsDemo />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>三语言实现,核心就两件事:<strong>按左端点排序</strong> + <strong>比较左端点与当前右端点</strong>:</p>
        </div>
        <CodeTabs
          title="lc56_merge_intervals"
          java={{
            code: `class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0])); // 按左端点排序
        List<int[]> res = new ArrayList<>();
        for (int[] iv : intervals) {
            int n = res.size();
            if (n == 0 || res.get(n - 1)[1] < iv[0])   // 断开:开新段
                res.add(new int[]{iv[0], iv[1]});
            else                                         // 重叠:扩右端
                res.get(n - 1)[1] = Math.max(res.get(n - 1)[1], iv[1]);
        }
        return res.toArray(new int[0][]);
    }
}`,
            hl: [3, 7],
            note: (
              <>
                比较器写 <code>Integer.compare(a[0], b[0])</code> 而非 <code>a[0] - b[0]</code> ——
                后者在 a[0] 极大、b[0] 极小时<b>相减会整型溢出</b>,得到错误符号。区间端点大时尤其要注意。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        intervals.sort(key=lambda x: x[0])          # 按左端点排序
        res = []
        for lo, hi in intervals:
            if not res or res[-1][1] < lo:           # 断开:开新段
                res.append([lo, hi])
            else:                                     # 重叠:扩右端
                res[-1][1] = max(res[-1][1], hi)
        return res`,
            hl: [3, 6],
            note: (
              <>
                Python 相减不溢出(大整数),但仍推荐 <code>key=lambda x: x[0]</code> ——
                语义清晰,且 key 版每元素只算一次键,比自定义 cmp 更快。
              </>
            ),
          }}
          js={{
            code: `var merge = function (intervals) {
  intervals.sort((a, b) => a[0] - b[0]);            // 按左端点排序
  const res = [];
  for (const [lo, hi] of intervals) {
    const last = res[res.length - 1];
    if (!last || last[1] < lo) res.push([lo, hi]);   // 断开:开新段
    else last[1] = Math.max(last[1], hi);            // 重叠:扩右端
  }
  return res;
};`,
            hl: [2, 6],
            note: (
              <>
                注意别忘了 <code>sort</code> 传比较器 —— 二维数组不传比较器同样会按字符串排,酿成 bug。
                时间 <b>O(n log n)</b>(排序主导),扫描只 O(n)。
              </>
            ),
          }}
        />
        <Callout tone="idea" title="「先排序,再线性扫描」是一整类题的通用套路">
          <p>
            会议室安排(LC 253)、用最少的箭引爆气球(LC 452)、无重叠区间(LC 435)、
            合并区间(56)…… 区间题的第一反应几乎都是<b>按左端点或右端点排序</b>,
            把「任意两个的关系」降维成「相邻两个的关系」。这套「排序做预处理、扫描做决策」的思路,
            会在第 6 章贪心里大规模复用 —— 排序在那里也是绝大多数贪心的第一步。
          </p>
        </Callout>
      </Section>

      {/* ================= §09 题单 ================= */}
      <Section
        id="problems"
        index="09"
        title="高频题单:排序 9 题"
        desc="按「计数 → 合并 → 比较器 → partition 变体 → 归并」分层,先想 30 秒再看提示"
        badge={<span className="chip">主线必做</span>}
      >
        <ProblemSet ch="sorting" items={PROBLEMS} />
      </Section>

      {/* ================= §10 Quiz ================= */}
      <Section
        id="quiz"
        index="10"
        title="通关测验"
        desc="8 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="sorting" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            排序常常<b>不是目的,是预处理</b>:有序之后,二分、去重、合并区间、贪心才成立 ——
            看到「乱序 + 关系判断」,先想「排一下会怎样」。
          </>,
          <>
            O(n²) 三兄弟靠<b>循环不变量</b>区分:冒泡 / 选择「每轮定死一个全局位置」,
            插入「前 i 个彼此有序」;插入排序近乎有序时 O(n),是小数组之王。
          </>,
          <>
            <b>归并</b> = 分治首秀:劈半 → 递归 → 合并,稳定、最坏仍 O(n log n),要 O(n) 空间,
            是链表 / 外部排序 / 要稳定时的选择。
          </>,
          <>
            <b>快排</b>灵魂是 partition:<b>基准一趟归位、永不再动</b>。平均最快但需
            <b>随机化基准</b>防退化(有序输入 → O(n²));同一个 partition 只追一侧,就是 <b>Quickselect</b>(215)。
          </>,
          <>
            <b>比较排序下界 O(n log n)</b> 是决策树证出来的铁律;计数 / 桶 / 基数<b>不比较、改数数</b>,
            用值域信息突破到 O(n+k) —— 但只适用于值域小、键可离散化的数据。
          </>,
          <>
            <b>稳定性 = 相等元素保序 = 可叠加排序</b>:多关键字排序靠它(先排次键、再稳定排主键)。
            归并 / 插入 / 冒泡稳定,快排 / 堆 / 选择不稳定。
          </>,
          <>
            内置 sort 都是<b>混合排序</b>:Java 基本类型用双轴快排、对象用 TimSort;Python / JS 用 TimSort。
            JS 记得 <b>sort 必须传比较器</b>,否则按字符串排(<code>[1,10,2]</code> 陷阱)。
          </>,
        ]}
      />

      <ChapterFooter ch="sorting" />
    </main>
  );
}
