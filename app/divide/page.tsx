"use client";

// 第 2 章 · 分治 Divide & Conquer。
// 结构:分治三步(分/治/合)+ 通用模板 → 递归树与主定理直觉 →
// 精讲 A 快速幂(LC 50,PowTree)→ 精讲 B 合并 K 链表(LC 23,分层合并图)→
// 精讲 C 最大子数组分治视角(LC 53,对比 07 章 Kadane)→ 逆序对 + Karatsuba →
// 题单 → 测验 → 要点。招牌可视化:TreePlayer(快速幂)、自建分层合并图。

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
import { PROBLEMS, QUIZ } from "@/lib/divide-data";
import { PowTree, MergeSortLayers, MergeKLists, CrossMidLab, InversionLab } from "./viz";

const CHIPS = [
  { id: "why", n: "01", label: "分治三步" },
  { id: "cost", n: "02", label: "递归树与复杂度" },
  { id: "pow", n: "03", label: "快速幂 · LC 50" },
  { id: "merge", n: "04", label: "归并分治 · LC 23" },
  { id: "maxsub", n: "05", label: "最大子数组 · LC 53" },
  { id: "inversion", n: "06", label: "逆序对 & Karatsuba" },
  { id: "problems", n: "07", label: "高频题单" },
  { id: "quiz", n: "08", label: "通关测验" },
];

export default function DivideChapter() {
  return (
    <main className="page" data-ch="divide">
      <Hero
        ch="divide"
        title={
          <>
            分治 <span className="grad">Divide & Conquer</span>
          </>
        }
        essence={
          <>
            分治只有一句话:<strong>把大问题切成同款的小问题,信任递归把答案带回来,
            再把子答案拼成总答案</strong>。序章教过的「递归信任」在这里第一次派上大用场 ——
            你会看到指数级的暴力,如何被「对半砍」一路压成 O(n log n) 甚至 O(log n)。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 分治三步 ================= */}
      <Section
        id="why"
        index="01"
        title="分治三步:分 / 治 / 合"
        desc="不是新魔法,是把「递归」从一种写法,升级成一种解题世界观"
      >
        <div className="prose">
          <p>
            先讲个场景。你面前有一叠 1000 张的选票要清点,一个人数到天黑。
            聪明的做法:把票<strong>分成 10 摞</strong>,发给 10 个人各数一摞
            (每个人又可以把自己那摞再分下去),最后<strong>把 10 个小计加起来</strong>。
            这就是分治(Divide &amp; Conquer,古罗马人叫它「分而治之」):
            大问题拆成同样形状的小问题,分头解决,再汇总。
          </p>
          <p>
            它和序章的递归是什么关系?递归是<strong>「函数调用自己」这个语法工具</strong>;
            分治是<strong>「用递归解题」的一种策略</strong> —— 而且是最经典的那种。
            每道分治题,都能拆成雷打不动的三步:
          </p>
        </div>
        <div className="dvd-steps">
          <div className="dvd-step">
            <div className="dvd-step-ico" aria-hidden>✂️</div>
            <h4>分<span className="en">Divide</span></h4>
            <p>
              把规模为 n 的问题,切成若干个<b>同款、更小</b>的子问题
              (通常对半,规模减到 n/2)。切法要保证子问题真的更小,否则递归停不下来。
            </p>
          </div>
          <div className="dvd-step">
            <div className="dvd-step-ico" aria-hidden>🧩</div>
            <h4>治<span className="en">Conquer</span></h4>
            <p>
              递归解决每个子问题。到了<b>基准情形</b>(小到不能再分,如单个元素)就直接返回。
              这一步用的是序章的<b>「递归信任」</b>:相信递归会把子答案正确带回来,别去展开想细节。
            </p>
          </div>
          <div className="dvd-step">
            <div className="dvd-step-ico" aria-hidden>🔗</div>
            <h4>合<span className="en">Combine</span></h4>
            <p>
              把子答案<b>拼装</b>成原问题的答案。这一步是分治的灵魂 ——
              一道题好不好做、复杂度多少,几乎全看「合」有多贵。
            </p>
          </div>
        </div>
        <div className="prose">
          <p>
            这三步落到代码里,就是一个固定骨架。下面用<strong>归并排序</strong>当模板
            (排序是分治的「首秀」,01 排序章会细讲它的稳定性与原地优化,这里只借它示范骨架):
          </p>
        </div>
        <CodeTabs
          title="merge_sort_template"
          java={{
            code: `class Solution {
    public int[] sortArray(int[] a) {
        if (a.length <= 1) return a;      // 治:单元素天然有序(基准情形)
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
            hl: [3, 4, 5, 6, 7],
            note: (
              <>
                三步一目了然:<b>分</b>(对半)→ <b>治</b>(递归左右)→ <b>合</b>(merge)。
                <code>Arrays.copyOfRange</code> 每层都新建数组,额外空间 O(n);排序章会讲带辅助数组的原地版。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def sortArray(self, a: list[int]) -> list[int]:
        if len(a) <= 1:
            return a                     # 治:基准情形
        mid = len(a) // 2                # 分:对半切
        left = self.sortArray(a[:mid])
        right = self.sortArray(a[mid:])
        return self._merge(left, right)  # 合:合并两段有序

    def _merge(self, x: list[int], y: list[int]) -> list[int]:
        out, i, j = [], 0, 0
        while i < len(x) and j < len(y):
            if x[i] <= y[j]:
                out.append(x[i]); i += 1
            else:
                out.append(y[j]); j += 1
        out.extend(x[i:]); out.extend(y[j:])
        return out`,
            hl: [5, 6, 7, 8],
            note: (
              <>
                <code>a[:mid]</code> 这类切片每次都<b>复制</b>一份,直观但有额外开销;
                竞赛里常改成传下标 <code>(lo, hi)</code> 只读不复制。
              </>
            ),
          }}
          js={{
            code: `var sortArray = function (a) {
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
            hl: [2, 3, 4, 5, 6],
            note: (
              <>
                <code>a.length &gt;&gt; 1</code> 是「整数除以 2」的位运算写法(右移一位)。
                <code>slice</code> 同样是复制,数据量大时注意开销。
              </>
            ),
          }}
        />
        <Callout tone="idea" title="为什么分治一定对?数学归纳法">
          <p>
            证明分治正确,套的是<b>归纳法</b>,和证递归同一个模子:①<b>基准情形对</b>
            —— 单个元素本身就是有序的,这一步显然成立;②<b>归纳步对</b> ——
            假设递归能把左、右两半各自排好(归纳假设),只要 merge 能把两段有序数组正确合成一段有序,
            那整段就对了。两步都成立 ⇒ 对任意规模都对。<b>你永远只需要证「合」这一步</b>,
            递归的部分交给归纳假设,这正是「递归信任」的数学底气。
          </p>
        </Callout>
        <Callout tone="warn" title="新手最容易翻的两条船">
          <p>
            ① <b>子问题没变小</b>:如果「分」之后子问题规模没真的下降(比如切出一个空段 + 原样大段),
            递归就会无限套娃、栈溢出。务必保证每次都朝基准情形靠近。
            ② <b>漏写基准情形</b>:忘了 <code>length &lt;= 1</code> 的出口,或出口条件写错,
            同样停不下来。序章说过:<b>先写出口,再写递归</b>。
          </p>
        </Callout>
        <Callout tone="deep" title="工程现场:分治是大规模计算的底层世界观">
          <p>
            Google 的 <b>MapReduce</b>、Hadoop、Spark,本质都是分治:把海量数据切片(map)分发到成千上万台机器,
            各自算局部结果,再汇总(reduce)。数据大到单机装不下时,<b>外部归并排序</b>把文件切成能进内存的小块,
            分别排好再多路归并 —— 就是本章 merge 的放大版。分治之所以重要,是因为它是「把大事拆成能并行的小事」的通用语言。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 递归树与复杂度 ================= */}
      <Section
        id="cost"
        index="02"
        title="递归树:分治的复杂度,画出来就懂"
        desc="不背主定理公式,只数「每层做多少工 × 一共几层」"
      >
        <div className="prose">
          <p>
            分治的时间复杂度,几乎都能写成一个<strong>递推式</strong>:
            <code>T(n) = a · T(n/b) + f(n)</code> —— 意思是「原问题 = a 个规模 n/b 的子问题 + 合并代价 f(n)」。
            归并排序就是 <code>T(n) = 2·T(n/2) + O(n)</code>:切成 2 个半问题,合并扫一遍是 O(n)。
            与其背公式,不如把递归<strong>画成一棵树</strong>,数两个数:
          </p>
        </div>
        <MergeSortLayers />
        <div className="prose">
          <p>
            看动画里的分层:<strong>每一层的合并工作量加起来都是 O(n)</strong>
            (第 1 层是 4 个大小 2 的合并、第 2 层是 2 个大小 4 的合并…… 元素总数不变,都是 n),
            而层数是「把 n 对半砍到 1 的次数」= <strong>log₂n</strong>。
            两个数一乘:<strong>O(n) × log n = O(n log n)</strong>。这就是主定理的直觉版 ——
            <strong>每层总工 × 层数</strong>,不需要任何公式。
          </p>
          <p>
            同一套「数两个数」的方法,能秒算一大票常见递推式:
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>递推式</th>
                <th>每层总工</th>
                <th>层数</th>
                <th>结果</th>
                <th>代表算法</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>T(n)=2T(n/2)+O(n)</code></td>
                <td>O(n)(均匀)</td>
                <td>log n</td>
                <td><BigO o="nlogn" /></td>
                <td>归并排序、LC 23</td>
              </tr>
              <tr>
                <td><code>T(n)=2T(n/2)+O(1)</code></td>
                <td>越往下越多(叶子重)</td>
                <td>log n</td>
                <td><BigO o="n" /></td>
                <td>满二叉遍历、求最大值</td>
              </tr>
              <tr>
                <td><code>T(n)=T(n/2)+O(1)</code></td>
                <td>O(1)</td>
                <td>log n</td>
                <td><BigO o="logn" /></td>
                <td>二分查找、快速幂</td>
              </tr>
              <tr>
                <td><code>T(n)=T(n/2)+O(n)</code></td>
                <td>越往上越多(根重)</td>
                <td>log n</td>
                <td><BigO o="n" /></td>
                <td>快速选择(平均)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            规律看出来了吗?主定理无非在问一句话:<strong>「工作量集中在树根、均匀分布、还是集中在叶子?」</strong>
            均匀(每层一样)就多一个 log 因子;根重(合并最贵)就随根走 O(n);
            叶子重(叶子数量爆炸)就随叶子总数走。三种情况,对应三句人话。
          </p>
        </div>
        <Callout tone="win" title="面试话术:被问复杂度,就画递归树">
          <p>
            面试官问「你这个分治多少复杂度?」,别急着报答案。就说:
            「我写出递推式 T(n) = a·T(n/b) + f(n),画成递归树:每层合并是 f(n),
            一共 log_b(n) 层,所以……」—— 当场推导比背结论稳得多,还顺手展示了你懂原理。
            这套「每层工 × 层数」是通杀分治题的复杂度分析法。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 精讲 A · 快速幂 LC 50 ================= */}
      <Section
        id="pow"
        index="03"
        title="精讲 A · LC 50 Pow(x, n):把「乘 n 次」压成 log n 次"
        desc="分治的第一个惊艳战果 —— 指数每次对半砍"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>实现 x 的 n 次幂,x^n。<b>暴力:</b>一个循环乘 n 次,O(n)。
            n = 2³¹ 时要乘二十多亿次,超时。<b>能不能更快?</b>关键观察:
            算 x⁸ 时,与其 x·x·x·…(乘 8 次),不如 x² =(x·x),x⁴ =(x²)²,x⁸ =(x⁴)² ——
            <strong>每平方一次,指数就翻倍</strong>,3 次平方就到 x⁸。指数从 8 到 1,只要 log₂8 = 3 步。
          </p>
          <p>
            这正是分治:<code>x^n =(x^(n/2))²</code>。n 是偶数直接平方;n 是奇数,就
            <code>x^n =(x^(n/2))² · x</code>(补乘一个漏掉的 x)。以 3¹³ 为例,一路砍下去再合回来:
          </p>
        </div>
        <PowTree />
        <div className="prose">
          <p>
            注意这棵「树」其实是一条<strong>链</strong> —— 每次递归只产生<strong>一个</strong>子问题
            (x^(n/2)),不是两个。所以层数 = log n,每层 O(1),总共
            <strong> O(log n)</strong>。这也是它和归并排序(每层两个子问题)复杂度不同的原因。
          </p>
        </div>
        <CodeTabs
          title="lc50_fast_pow_recursive"
          java={{
            code: `class Solution {
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
            hl: [10, 11, 12],
            note: (
              <>
                <b>两个坑:</b>① <code>n = Integer.MIN_VALUE</code> 时 <code>-n</code> 溢出 ——
                先转 <code>long</code> 再取负;② 千万别写成
                <code>fastPow(x,n/2)*fastPow(x,n/2)</code>,那会把子问题算两遍,退化成 O(n)。
              </>
            ),
          }}
          python={{
            code: `class Solution:
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
            hl: [8, 9, 10],
            note: (
              <>
                Python 的大整数天生免疫溢出坑,负指数直接取负即可。
                <code>n &amp; 1</code> 取最低位判奇偶,比 <code>n % 2</code> 更常见(位运算章会细讲)。
              </>
            ),
          }}
          js={{
            code: `var myPow = function (x, n) {
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
            hl: [6, 7, 8],
            note: (
              <>
                JS 的 <code>number</code> 是 64 位浮点,能安全表示 2³¹,不必像 Java 特意转 long;
                但 <code>Math.floor(n/2)</code> 别写成 <code>n &gt;&gt; 1</code> —— 位运算会把数截成 32 位。
              </>
            ),
          }}
        />
        <div className="prose">
          <p>
            递归清晰,但有 O(log n) 的栈开销。工程里更爱<strong>迭代版</strong>:把 n 写成二进制,
            从低位到高位扫,遇到 1 就把「当前这一档的 x」乘进结果 —— 本质是同一件事,零栈开销:
          </p>
        </div>
        <CodeTabs
          title="lc50_fast_pow_iterative"
          java={{
            code: `class Solution {
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
            hl: [7, 8, 9],
            note: (
              <>
                把「n 的二进制」拆开看:13 =(1101)₂ = 8+4+1,于是 x¹³ = x⁸·x⁴·x¹ ——
                循环里正好在这三档乘进 res。迭代版是竞赛/工程的默认写法。
              </>
            ),
          }}
          python={{
            code: `class Solution:
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
            hl: [6, 7, 8, 9],
            note: (
              <>
                <code>while n:</code> 在 Python 里等价于 <code>while n != 0</code>。
                这版没有递归,也没有栈深限制,处理超大指数最稳。
              </>
            ),
          }}
          js={{
            code: `var myPow = function (x, n) {
  let N = n, res = 1;
  if (N < 0) { x = 1 / x; N = -N; }
  while (N > 0) {
    if (N % 2 === 1) res *= x;   // 该位为 1
    x *= x;                      // x → x², x⁴, x⁸…
    N = Math.floor(N / 2);       // 注意:N 可达 2³¹,别用 >> (会截成 32 位)
  }
  return res;
};`,
            hl: [5, 6, 7],
            note: (
              <>
                这里刻意用 <code>% 2</code> 和 <code>Math.floor(N/2)</code> 而非位运算:
                N 取到 2³¹ 时超出 32 位,<code>&amp;</code> / <code>&gt;&gt;</code> 会算错。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(log n)</b>、空间 O(log n)(递归)或 <b>O(1)</b>(迭代)。高频追问:
            ①「要对大质数取模呢?」→ 每步乘完就取模,这就是<b>快速幂取模</b>,RSA 加密和很多计数题的核心
            (数学章细讲);②「算斐波那契第 10¹⁸ 项?」→ <b>矩阵快速幂</b>:把递推写成矩阵乘法,
            对矩阵做快速幂,O(log n)(爬楼梯 DP 那章埋过这个伏笔);③「为什么不能算两遍 x^(n/2)?」——
            答不上等于没懂:算两遍会让递归树重新变满,退化成 O(n)。
          </p>
        </Callout>
        <Callout tone="deep" title="工程现场:你每一次 HTTPS 握手,都在跑快速幂">
          <p>
            RSA、Diffie-Hellman 这些公钥密码,核心运算是「模幂」a^b mod m,其中 b 是几百上千位的大数。
            没有快速幂,乘 2^2048 次,宇宙热寂都算不完;有了它,只要约 2048 次模乘。
            你浏览器地址栏那把小锁,底层就站着这几行分治代码。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 精讲 B · 合并 K 链表 LC 23 ================= */}
      <Section
        id="merge"
        index="04"
        title="精讲 B · LC 23 合并 K 个升序链表:两两归并"
        desc="归并思想从「排数组」升级到「合链表」—— 分治省下一个量级"
        badge={<span className="lc-badge" data-d="hard">HARD</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>给 k 条各自升序的链表,合并成一条升序链表。设总节点数为 N。
            <b> 暴力(逐条并入):</b>拿第 1 条当底,把第 2 条合并进来,再合并第 3 条……
            问题是底链<strong>越并越长</strong>:第 i 次合并要扫过约前 i 条的全部节点,
            累加下来是 <BigO o="n2" label="O(k·N)" />。
            <b> 优化思路:</b>合并两条链表的代价,只跟这两条的总长有关 ——
            那就<strong>让合并次数尽量少</strong>。两两配对归并正好做到:
          </p>
        </div>
        <MergeKLists />
        <div className="prose">
          <p>
            对比一下:逐条并入要 k 轮,且底链持续变长;两两归并每轮把链表条数<strong>减半</strong>,
            只需 log₂k 轮,而每一轮里,所有 N 个节点<strong>各自只被比较搬运一次</strong>(每层总工 O(N))。
            两个数一乘:<strong>O(N log k)</strong>。k = 10000 时,log k ≈ 13,比 k 小了三个量级。
          </p>
        </div>
        <CodeTabs
          title="lc23_merge_k_lists"
          java={{
            code: `class Solution {
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
            hl: [9, 10, 11, 12, 13],
            note: (
              <>
                <code>mergeTwo</code> 就是 DataData 链表章的 LC 21 模板;
                <code>dummy</code> 哨兵节点免去「头节点特判」。递归深度 log k,合并次数 k−1。
              </>
            ),
          }}
          python={{
            code: `class Solution:
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
            hl: [9, 10, 11],
            note: (
              <>
                <code>tail.next = a or b</code> 利用 Python 的短路:a 非空取 a,否则取 b。
                嵌套函数直接闭包捕获 <code>lists</code>,不必层层传参。
              </>
            ),
          }}
          js={{
            code: `var mergeKLists = function (lists) {
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
            hl: [18, 19, 20, 21],
            note: (
              <>
                <code>tail.next = a || b</code> 同样是短路取非空链。
                下标区间 <code>[lo, hi]</code> 递归比「切数组」更省 —— 不复制链表,只挪指针。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 追问:归并 vs 优先队列">
          <p>
            分治法 <b>O(N log k)</b> 时间、O(log k) 递归栈。经典追问:「还有别的解法吗?」——
            有,<b>优先队列(小顶堆)</b>:把 k 条链的头节点丢进堆,每次弹出最小的接到结果、
            再把它的后继入堆,同样 <b>O(N log k)</b>。两种都是标准答案(lc.md 点名的「一题两解」),
            区别在于:堆解法额外 O(k) 空间维护堆、常数略大,但天然支持「流式」到来的数据。
            堆的用法在 DataData · 09 堆里主讲,这里从分治视角给出另一条路。
          </p>
        </Callout>
        <Callout tone="deep" title="工程现场:多路归并撑起数据库与日志系统">
          <p>
            LSM-Tree(LevelDB、RocksDB、Cassandra 的存储引擎)后台不断把多个有序小文件
            <b>多路归并</b>成大文件;分布式系统把 k 台机器返回的有序结果流合并成全局有序 ——
            都是 LC 23 的工业放大版。区别只是:节点数以亿计时,用的是 k 路堆归并,一次合并 k 条而非两条。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 精讲 C · 最大子数组 LC 53 ================= */}
      <Section
        id="maxsub"
        index="05"
        title="精讲 C · LC 53 最大子数组和:分治视角"
        desc="一道题,两种世界观 —— 分治的 O(n log n),对照第 7 章 Kadane 的 O(n)"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>给整数数组,找一段<strong>连续</strong>子数组,使它的和最大,返回这个最大和。
            <b> 暴力:</b>枚举所有区间求和,O(n²)。<b> 分治怎么想?</b>在正中间切一刀,
            最大子数组就只有<strong>三种互斥的归宿</strong>:
          </p>
          <ul>
            <li>① 完全落在<strong>左半</strong> —— 交给左半的递归;</li>
            <li>② 完全落在<strong>右半</strong> —— 交给右半的递归;</li>
            <li>③ <strong>横跨中点</strong> —— 左右两半的递归都看不到它,必须单独算。</li>
          </ul>
          <p>
            三者取最大即可。①②靠「递归信任」,难点只在③。而③有个好性质:它<strong>必然包含中点</strong>,
            所以可以从中点<strong>向左扩</strong>求最大前缀和、从中点右侧<strong>向右扩</strong>求最大后缀和,
            两段相加就是「跨中点最大和」。看这段扫描:
          </p>
        </div>
        <CrossMidLab />
        <CodeTabs
          title="lc53_max_subarray_divide"
          java={{
            code: `class Solution {
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
        for (int i = mid; i >= lo; i--) {        // 从中点向左扩,取最大前缀
            sum += a[i];
            bestL = Math.max(bestL, sum);
        }
        sum = 0;
        int bestR = Integer.MIN_VALUE;
        for (int j = mid + 1; j <= hi; j++) {    // 从中点右侧向右扩
            sum += a[j];
            bestR = Math.max(bestR, sum);
        }
        return bestL + bestR;                    // 必含中点,两段相加
    }
}`,
            hl: [9, 10, 11, 12],
            note: (
              <>
                <code>bestL / bestR</code> 用 <code>MIN_VALUE</code> 起手,保证「跨中点段」至少各取一个元素,
                不会漏算。三路取 max 是分治「合」的典型形态。
              </>
            ),
          }}
          python={{
            code: `class Solution:
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
            for i in range(mid, lo - 1, -1):     # 从中点向左扩
                s += nums[i]
                best_l = max(best_l, s)
            s, best_r = 0, float("-inf")
            for j in range(mid + 1, hi + 1):     # 从中点右侧向右扩
                s += nums[j]
                best_r = max(best_r, s)
            return best_l + best_r

        return dc(0, len(nums) - 1)`,
            hl: [7, 8, 9, 10],
            note: (
              <>
                <code>range(mid, lo - 1, -1)</code> 是「从 mid 倒着数到 lo」的写法(终点要写 lo−1)。
                <code>float(&quot;-inf&quot;)</code> 当负无穷起手,处理全负数组也不出错。
              </>
            ),
          }}
          js={{
            code: `var maxSubArray = function (nums) {
  const crossSum = (lo, mid, hi) => {
    let sum = 0, bestL = -Infinity;
    for (let i = mid; i >= lo; i--) {          // 从中点向左扩
      sum += nums[i];
      bestL = Math.max(bestL, sum);
    }
    sum = 0;
    let bestR = -Infinity;
    for (let j = mid + 1; j <= hi; j++) {      // 从中点右侧向右扩
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
            hl: [19, 20, 21, 22],
            note: (
              <>
                <code>-Infinity</code> 天然当负无穷,全负数组也稳。
                <code>(lo + hi) &gt;&gt; 1</code> 这里 lo、hi 都是数组下标(小),用位运算取中点安全。
              </>
            ),
          }}
        />
        <div className="prose">
          <p>
            复杂度 <BigO o="nlogn" />:递推式 T(n) = 2T(n/2) + O(n),和归并排序同款。
            <strong>但这道题其实有更快的解法。</strong>第 7 章动态规划会给出 Kadane 视角:
            定义 dp[i] = 以 i 结尾的最大子数组和,一次线性扫描搞定 <BigO o="n" />。两种世界观对照:
          </p>
        </div>
        <div className="dvd-duel">
          <div className="card">
            <div className="card-kicker">本章 · 分治视角</div>
            <div className="card-title">
              <b className="mono">O(n log n)</b>
            </div>
            <p>
              切两半 + 单独算跨中点段,三路取 max。思路是<b>空间上的划分</b>:
              答案要么在左、在右、或骑在切口上。稍慢,但揭示了「区间可合并」的结构。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">第 7 章 · DP / Kadane</div>
            <div className="card-title">
              <b className="mono">O(n)</b>
            </div>
            <p>
              dp[i] = max(nums[i], dp[i−1]+nums[i]),边扫边更新全局最大。思路是<b>时间上的推进</b>:
              每个位置只问「前面那段值不值得带上」。更快,是本题的最优解。
            </p>
          </div>
        </div>
        <CodeTabs
          title="lc53_kadane_for_compare"
          java={{
            code: `// 对照:第 7 章 DP / Kadane —— 一次扫描 O(n)
class Solution {
    public int maxSubArray(int[] nums) {
        int cur = nums[0], best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]); // 接上前面 or 另起炉灶
            best = Math.max(best, cur);
        }
        return best;
    }
}`,
            hl: [6],
            note: (
              <>
                <code>cur</code> 就是「以 i 结尾的最大和」;它是 dp 数组压成一个变量的结果。
                完整推导见第 7 章精讲。
              </>
            ),
          }}
          python={{
            code: `# 对照:第 7 章 DP / Kadane —— 一次扫描 O(n)
class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        cur = best = nums[0]
        for x in nums[1:]:
            cur = max(x, cur + x)      # 接上前面 or 另起炉灶
            best = max(best, cur)
        return best`,
            hl: [6],
            note: <>一行转移方程,把 O(n log n) 直接干到 O(n)。</>,
          }}
          js={{
            code: `// 对照:第 7 章 DP / Kadane —— 一次扫描 O(n)
var maxSubArray = function (nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
};`,
            hl: [5],
            note: <>同一道题,DP 视角更优;但分治视角并非无用 —— 见下方说明。</>,
          }}
        />
        <Callout tone="idea" title="那分治视角还有什么用?">
          <p>
            既然 Kadane 更快,为什么还学分治解?因为<b>分治揭示的「区间可合并」结构,是线段树的地基</b>。
            当题目变成「多次查询任意子区间 [l, r] 的最大子段和,还带修改」时,Kadane 的一次性扫描就不够用了 ——
            而分治那套「每个区间维护:区间和、最大前缀、最大后缀、区间最大子段和」的信息,恰好能挂到线段树的每个节点上,
            做到 O(log n) 单次查询。<b>同一道题的两种解法,分别通向 DP 和线段树两个方向</b> —— 这就是一题多解的价值。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 逆序对 + Karatsuba ================= */}
      <Section
        id="inversion"
        index="06"
        title="归并的隐藏技能:数逆序对 + 一个改变世界的乘法"
        desc="分治不止排序 —— 它能顺手算出「一个数组有多乱」,还能让乘法变快"
      >
        <div className="prose">
          <p>
            <strong>逆序对</strong>(LeetCode 剑指 Offer / LCR 170):数组里满足
            <code>i &lt; j</code> 但 <code>nums[i] &gt; nums[j]</code> 的数对个数 ——
            它衡量一个数组「有多乱」(完全升序 = 0 对,完全倒序 = 最多对)。
            暴力两两比较是 O(n²)。神奇的是:<strong>归并排序在合并的过程中,顺手就能把逆序对数出来</strong>,
            总代价还是 O(n log n)。
          </p>
          <p>
            诀窍在合并两段有序数组时:当你从<strong>右半</strong>取出一个较小的数,
            此刻<strong>左半还没被取走的每一个数,都比它大、且下标都在它前面</strong> ——
            它们全都和这个数构成逆序对。于是「左半剩几个,就一次性加几个」,不用逐对比较:
          </p>
        </div>
        <InversionLab />
        <div className="prose">
          <p>
            为什么这样不漏、不重?因为跨越两半的逆序对,<strong>一定</strong>在「右半元素被取出」的那一刻被结算一次,
            且只结算一次;而两半<strong>内部</strong>的逆序对,早在各自的递归里数过了。分/治/合再次各司其职 ——
            这就是把「排序」的副产品,变成「计数」的答案。
          </p>
        </div>
        <Callout tone="deep" title="逆序对不只是道题">
          <p>
            逆序对是<b>衡量两个排名有多不一致</b>的标准工具(Kendall tau 距离):推荐系统比较「你的喜好」和「算法的排序」差多少、
            体育比赛比对不同评委的排名、生物信息里比对基因序列顺序,用的都是它。
            它还等于<b>冒泡排序要交换的次数</b> —— 一个数组的「乱度」由此有了精确的数字定义。
          </p>
        </Callout>
        <Callout tone="story" title="Karatsuba:一个 23 岁学生,推翻了「乘法极限」的断言">
          <p>
            两个 n 位大数相乘,小学竖式是 O(n²):每一位都要和另一个数的每一位相乘。人们一度以为这是极限。
            1960 年,数学家柯尔莫哥洛夫在讨论班上公开猜想「O(n²) 无法突破」。台下 23 岁的学生
            <b> Karatsuba(卡拉楚巴)</b>一周后就给出了反例:把两个数各切成高低两半
            <code> x = a·10^m + b</code>、<code>y = c·10^m + d</code>,
            竖式要算 4 个子乘积(ac、ad、bc、bd),而 Karatsuba 发现<b>只需算 3 个</b> ——
            用恒等式 <code>(a+b)(c+d) = ac + ad + bc + bd</code> 把中间的 ad+bc 凑出来,省掉一次乘法。
          </p>
          <p>
            递推式从 T(n) = 4T(n/2) 变成 <b>T(n) = 3T(n/2) + O(n)</b>,复杂度从 O(n²) 降到
            O(n^log₂3) ≈ <b>O(n¹·⁵⁸)</b>。这是分治史上的里程碑:<b>「合」这一步少算一个子问题,
            整体复杂度就换了一个数量级</b>。今天的大数运算库(以及后来 O(n log n) 的 FFT 乘法)都站在它的肩上。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title="高频题单:分治 7 题"
        desc="从快速幂到多路归并,再到分治 + 二分的压轴。先想 30 秒再看提示"
        badge={<span className="chip">主线 + 复盘</span>}
      >
        <ProblemSet ch="divide" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="8 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="divide" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            分治 = <b>分 / 治 / 合</b> 三步:拆成同款子问题 → 递归解决(信任它)→
            把子答案<b>合</b>成总答案。一道题好不好做,几乎全看「合」有多贵。
          </>,
          <>
            复杂度不背公式:<b>画递归树,数「每层总工 × 层数」</b>。
            T(n)=2T(n/2)+O(n) → O(n log n);T(n)=T(n/2)+O(1) → O(log n)。
          </>,
          <>
            <b>快速幂</b>把「乘 n 次」压成 O(log n):x^n =(x^(n/2))²,奇数补乘。
            铁律:x^(n/2) <b>只算一次</b>,写两遍会退化成 O(n)。
          </>,
          <>
            <b>归并分治</b>的杠杆:合并 k 个东西时,<b>两两归并(log k 轮)</b>远胜
            逐条并入(k 轮),把 O(k·N) 压到 O(N log k)(LC 23)。
          </>,
          <>
            <b>一题多解要都会</b>:LC 53 分治 O(n log n) 对照 Kadane O(n);LC 23 归并对照优先队列 ——
            分治视角常通向线段树,DP / 堆视角常更快,面试双保险。
          </>,
          <>
            归并能顺手<b>数逆序对</b>:从右半取数时,左半剩几个就加几个 ——
            把「排序」的副产品变成「计数」的答案,仍是 O(n log n)。
          </>,
          <>
            分治 vs DP 的分水岭:<b>子问题独立 → 分治</b>(算一次即可);
            <b>子问题重叠 → DP</b>(必须记账,否则像「算两遍的快速幂」一样指数退化)。
          </>,
        ]}
      />

      <ChapterFooter ch="divide" />
    </main>
  );
}
