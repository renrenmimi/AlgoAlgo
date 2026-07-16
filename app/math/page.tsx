"use client";

// 第 11 章 · 数学与数论。
// 灵魂:数学题不考数学,考的是能不能找到那个「不变量 / 规律」。
// 结构:找不变量 + 溢出取模 → gcd → 精讲 A 埃氏筛(204)→ 快速幂(盘)→
//   精讲 B 摩尔投票(169)→ 下一个排列(31)→ 精讲 C Nim 博弈(292)→ 快乐数(202)→
//   题单 → 测验。三大自建 viz(埃氏筛网格 / Nim 交互 / 摩尔投票 ArrayStepper)在 ./viz。

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
import { ArrayStepper, type ArrayFrame, type ArrayCell } from "@/lib/stepper";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { PROBLEMS, QUIZ } from "@/lib/math-data";
import { SieveGrid, NimGame, MooreVote } from "./viz";

/* ============ §06 下一个排列:逐帧 ArrayStepper 帧 ============ */

function npRow(arr: number[], marks: Record<number, "lit" | "ok">): ArrayCell[] {
  return arr.map((v, j) => (marks[j] ? { v, state: marks[j] } : { v }));
}

const NP_FRAMES: ArrayFrame[] = [
  {
    cells: npRow([1, 3, 5, 4, 2], {}),
    msg: (
      <>
        目标:求 [1,3,5,4,2] 在字典序里的<b>下一个排列</b>(比它大、但大得最少的那个)。
        整型不参与任何算术 —— 全靠「位置的规律」。
      </>
    ),
  },
  {
    cells: npRow([1, 3, 5, 4, 2], { 1: "lit" }),
    ptrs: [{ i: 1, label: "i" }],
    msg: (
      <>
        <b>第 1 步 · 找山谷。</b>从右往左找第一个「变小的位置」:5&gt;4&gt;2 一路递减,
        直到 3 &lt; 5 —— 山谷 i = 1(值 3)。它右边那段已是最大排列,只能靠 i 来「进位」。
      </>
    ),
  },
  {
    cells: npRow([1, 3, 5, 4, 2], { 1: "lit", 3: "ok" }),
    ptrs: [{ i: 1, label: "i" }, { i: 3, label: "j" }],
    msg: (
      <>
        <b>第 2 步 · 找接班人。</b>在 i 右边的降序段里,从右往左找第一个比 3 大的数 →
        4(j = 3)。它是「刚好比 3 大一点」的那个,换上去能让增幅最小。
      </>
    ),
  },
  {
    cells: npRow([1, 4, 5, 3, 2], { 1: "ok", 3: "ok" }),
    ptrs: [{ i: 1, label: "i" }],
    msg: (
      <>
        <b>第 3 步 · 交换 i、j。</b>3 ↔ 4 → [1,<b>4</b>,5,3,2]。现在 i 位变大了,
        但它右边的 5 3 2 还是乱的(而且是<b>递减</b>,即那一段的最大排列)。
      </>
    ),
  },
  {
    cells: npRow([1, 4, 2, 3, 5], { 2: "ok", 3: "ok", 4: "ok" }),
    msg: (
      <>
        <b>第 4 步 · 反转右段。</b>把 i 右边整段反转(递减 → 递增 = 该段最小):
        5 3 2 → 2 3 5。得到 [1,4,2,3,5]。
      </>
    ),
  },
  {
    cells: npRow([1, 4, 2, 3, 5], { 0: "ok", 1: "ok", 2: "ok", 3: "ok", 4: "ok" }),
    msg: (
      <>
        完成:13542 的下一个排列是 <b>14235</b>。规律四连:找山谷 → 找刚好更大的 →
        交换 → 反转右段。O(n) 一趟半,不用任何数学公式。
      </>
    ),
  },
];

/* ============ 页面 ============ */

const CHIPS = [
  { id: "why", n: "01", label: "找不变量 · 取模" },
  { id: "gcd", n: "02", label: "gcd 辗转相除" },
  { id: "sieve", n: "03", label: "埃氏筛" },
  { id: "qpow", n: "04", label: "快速幂" },
  { id: "moore", n: "05", label: "摩尔投票" },
  { id: "perm", n: "06", label: "下一个排列" },
  { id: "nim", n: "07", label: "博弈不变量" },
  { id: "happy", n: "08", label: "快乐数" },
  { id: "problems", n: "09", label: "高频题单" },
  { id: "quiz", n: "10", label: "通关测验" },
];

export default function MathChapter() {
  return (
    <main className="page" data-ch="math">
      <Hero
        ch="math"
        title={
          <>
            数学与数论 <span className="grad">Math</span>
          </>
        }
        essence={
          <>
            这一章最容易被名字吓退,其实全书数学含量最低。
            <strong>数学题不考数学,考的是你能不能找到那个不变量、那条规律</strong> ——
            Nim 是 n%4、灯泡是完全平方数、多数元素是「抵消」。真正的工程刚需只有一件:
            <strong>别让大数溢出</strong>。本章教你把「一脸公式」的题,拆成「先手玩两把、猜个规律」。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 找不变量 + 溢出取模 ================= */}
      <Section
        id="why"
        index="01"
        title="两件事:找不变量,和别让大数溢出"
        desc="一件是解题的心法,一件是工程的底线 —— 本章围绕这两条转"
      >
        <div className="prose">
          <p>
            先说心法。数学题的可怕全在「它看起来需要数学」。但 LeetCode 的数学题几乎从不考
            微积分、线性代数,它考的是:你能不能<strong>先手玩几个小例子,从中嗅出一条规律或一个
            「不变量(invariant)」</strong> —— 某个在整个过程中<strong>恒不改变</strong>的量。
            找到它,题目瞬间坍缩成一行代码;找不到,你会陷在暴力模拟里出不来。
          </p>
          <p>
            这是本章反复上演的剧本:Nim 游戏的不变量是「剩余石子模 4」、灯泡开关的规律是
            「因子个数的奇偶」、多数元素的不变量是「抵消后仍有剩余」。所以本章的通用套路是:
          </p>
        </div>
        <div className="mth-steps">
          <div className="mth-step">
            <div>
              <h4>打表 —— 先手算几个小规模答案</h4>
              <p>
                n = 1, 2, 3, 4, 5 分别是什么结果?博弈题就手推谁赢,计数题就列出前几项。
                别嫌笨,规律往往在第 4、5 个数据上才冒头。
              </p>
            </div>
          </div>
          <div className="mth-step">
            <div>
              <h4>猜规律 / 找不变量 —— 那个不变的量是什么</h4>
              <p>
                盯着这串数:是周期出现?和奇偶有关?和完全平方 / 4 的倍数有关?
                找到那个「无论怎么操作都不变」的量,它就是钥匙。
              </p>
            </div>
          </div>
          <div className="mth-step">
            <div>
              <h4>归纳证明 —— 说清「为什么永远成立」</h4>
              <p>
                规律不是巧合。用数学归纳法或「对手总能维持不变量」的论证补上证明 ——
                面试时,能证明的规律才敢写进代码。
              </p>
            </div>
          </div>
        </div>

        <div className="prose">
          <p>
            再说底线:<strong>溢出与取模</strong>。计数类题目的答案常常大到天文数字
            (组合数、方案数),题面于是要求「结果对 <code>10⁹+7</code> 取模」。
            这不是刁难,是给你一个<strong>不溢出的安全区</strong>。但取模有个铁律:
            <strong>要边算边模,不能算完再模</strong> —— 因为中间结果早就溢出成垃圾了,
            事后取模救不回来。取模之所以能「边算边模」,靠的是它的分配律:
          </p>
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">法则 · 加</div>
            <div className="card-title">➕ 加法分配</div>
            <p>
              (a + b) % m = ((a%m) + (b%m)) % m。减法同理,但先 +m 再取模,
              免得结果为负。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">法则 · 乘</div>
            <div className="card-title">✖️ 乘法分配</div>
            <p>
              (a × b) % m = ((a%m) × (b%m)) % m。这条最要命:两个约 10⁹ 的数相乘 ≈ 10¹⁸,
              <b>必须用 64 位 long</b> 接。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">法则 · 除(陷阱)</div>
            <div className="card-title">➗ 除法不分配</div>
            <p>
              (a ÷ b) % m ≠ ((a%m) ÷ (b%m)) % m!要除得先求「模逆元」——
              见 §04 快速幂的费马小定理。
            </p>
          </div>
        </div>
        <CodeTabs
          title="mod_math"
          java={{
            code: `class ModMath {
    static final int MOD = 1_000_000_007;

    // 加法:各自取模后相加,和 < 2*MOD,不会越过 int 上限
    static int add(int a, int b) {
        return (int) (((long) a + b) % MOD);
    }

    // 乘法:两个 int 相乘最大约 10^18,必须先转 long,否则 int 静默溢出
    static long mul(long a, long b) {
        return (a % MOD) * (b % MOD) % MOD;
    }
}`,
            hl: [10, 11],
            note: (
              <>
                <b>坑:</b>Java 的 int 溢出<b>不会报错</b>,只会悄悄回绕成一个错的数。
                一旦有乘法,把参与者全提升成 <code>long</code> 是肌肉记忆;运算符 <code>%</code>{" "}
                对负数返回负值,减法记得 <code>(x % m + m) % m</code>。
              </>
            ),
          }}
          python={{
            code: `MOD = 10**9 + 7

def add(a: int, b: int) -> int:
    return (a + b) % MOD

def mul(a: int, b: int) -> int:
    return a * b % MOD   # 取模只为把数「压小」,不是防溢出`,
            hl: [6],
            note: (
              <>
                <b>爽点:</b>Python 整数<b>无限大</b>,永远不会溢出 ——
                这里取模纯粹是为了把数字压回小范围(否则大整数运算会越来越慢)。
                所以 Python 选手最容易忽视溢出,换 Java/C++ 面试时务必补课。
              </>
            ),
          }}
          js={{
            code: `const MOD = 1_000_000_007n;   // BigInt:普通 Number 超过 2^53 就丢精度

const add = (a, b) => (a + b) % MOD;
const mul = (a, b) => (a * b) % MOD;

// 若坚持用 Number:a*b 一旦超 9e15 结果就不可信 —— 计数题必上 BigInt`,
            hl: [1, 4],
            note: (
              <>
                <b>坑:</b>JS 只有一种数字类型 Number(双精度浮点),安全整数上限是
                2⁵³ ≈ 9×10¹⁵。两个 10⁹ 相乘 = 10¹⁸ 远超它,结果会<b>丢精度</b>(既不报错也不回绕,
                更隐蔽)。涉及大数取模,一律 <code>BigInt</code>(字面量带 <code>n</code>)。
              </>
            ),
          }}
        />
        <Callout tone="story" title="为什么全世界都用 10⁹+7 这个怪数?">
          <p>
            它必须满足三个条件才好用:①<b>足够大</b>,让不同答案很难在取模后「撞车」;
            ②是<b>质数</b>,这样任何数都存在模逆元(除法才能做,见 §04);
            ③平方后 (10⁹+7)² ≈ 10¹⁸ 刚好<b>塞进 64 位 long</b>(上限 ≈ 9.2×10¹⁸),
            两数相乘不溢出。10⁹+7 正好卡在这三条的甜点上 —— 它的孪生兄弟 998244353
            则因为适合快速数论变换(NTT)而在竞赛里更常见。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 gcd ================= */}
      <Section
        id="gcd"
        index="02"
        title="最大公约数:辗转相除,两千年不过时"
        desc="gcd(a, b) = gcd(b, a % b) —— 一行递归,先讲清它凭什么成立"
      >
        <div className="prose">
          <p>
            求两数的最大公约数(greatest common divisor, gcd),最笨的办法是从
            min(a,b) 往下试每个数能不能同时整除两者 —— O(min(a,b))。
            欧几里得给了一个漂亮到不像话的替代:
            <strong>gcd(a, b) = gcd(b, a % b)</strong>,一直辗转到余数为 0,
            此时的除数就是答案。这叫<strong>辗转相除法(欧几里得算法)</strong>。
          </p>
          <p>
            <strong>为什么成立?</strong>关键在一句话:<strong>a 和 b 的公约数,
            与 b 和 a%b 的公约数,是完全相同的一批数</strong>。设 d 同时整除 a、b,
            因为 a % b = a − ⌊a/b⌋ × b,而等式右边每一项都是 d 的倍数,所以 d 也整除
            a%b;反过来,若 d 整除 b 和 a%b,那 a = ⌊a/b⌋ × b + (a%b) 也是 d 的倍数。
            两组的公约数集合一模一样,最大的那个自然相等 —— 于是可以放心把问题换成更小的一对。
          </p>
        </div>
        <div className="mth-steps">
          <div className="mth-step">
            <div>
              <h4>gcd(48, 36):48 % 36 = 12 → 换成 gcd(36, 12)</h4>
              <p>大问题换成小问题,公约数集合不变。</p>
            </div>
          </div>
          <div className="mth-step">
            <div>
              <h4>gcd(36, 12):36 % 12 = 0 → 换成 gcd(12, 0)</h4>
              <p>余数变 0,意味着 12 整除 36,收敛在即。</p>
            </div>
          </div>
          <div className="mth-step">
            <div>
              <h4>gcd(12, 0) = 12 —— 余数为 0,除数即答案</h4>
              <p>任何数和 0 的 gcd 是它自己,递归到底。答案 12。</p>
            </div>
          </div>
        </div>
        <CodeTabs
          title="gcd_lcm"
          java={{
            code: `class Solution {
    // 辗转相除:余数为 0 时,除数即最大公约数
    int gcd(int a, int b) {
        return b == 0 ? a : gcd(b, a % b);
    }

    // 最小公倍数 lcm(a,b) = a / gcd * b —— 先除后乘,避免 a*b 溢出
    long lcm(int a, int b) {
        return (long) a / gcd(a, b) * b;
    }
}`,
            hl: [4, 9],
            note: (
              <>
                <b>坑:</b>lcm 千万别写成 <code>a * b / gcd</code> ——
                a×b 会先溢出。永远<b>先除后乘</b>:<code>a / gcd × b</code>(gcd 一定整除 a,不丢精度)。
              </>
            ),
          }}
          python={{
            code: `import math

def gcd(a: int, b: int) -> int:
    while b:                 # 迭代版:免递归栈,大数更稳
        a, b = b, a % b
    return a

# 标准库现成:math.gcd(a, b)、math.lcm(a, b)(3.9+),平时直接用`,
            hl: [4, 5, 6],
            note: (
              <>
                <b>省心:</b>元组解包 <code>a, b = b, a % b</code> 一行完成辗转;
                Python 3.9+ 直接 <code>math.gcd / math.lcm</code>,还支持多参数。
              </>
            ),
          }}
          js={{
            code: `// 递归版,简洁;a、b 在安全整数范围内没有溢出问题
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const lcm = (a, b) => (a / gcd(a, b)) * b;   // 先除后乘`,
            hl: [2],
            note: (
              <>
                <b>细节:</b>JS 没有整数类型,<code>a % b</code> 对整数完全精确;
                但若 a、b 可能超 2⁵³,改用 BigInt 版(<code>b === 0n</code> …)。
              </>
            ),
          }}
        />
        <Callout tone="story" title="它可能是人类还在用的最古老算法">
          <p>
            辗转相除法出现在欧几里得《几何原本》(约公元前 300 年)第七卷 ——
            两千三百年过去,你今天写的 <code>gcd</code> 一字未改。它还是现代密码学的地基:
            RSA 用<b>扩展欧几里得</b>求模逆元来生成密钥。一个古希腊人的除法游戏,
            正在保护你此刻的每一次网银登录。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 精讲 A · 204 埃氏筛 ================= */}
      <Section
        id="sieve"
        index="03"
        title="精讲 A · 埃氏筛:与其试除,不如划掉"
        desc="LC 204 计数质数 —— 换个方向想,O(n√n) 变 O(n log log n)"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>统计所有小于 n 的质数个数。<b>暴力:</b>对每个数 x,试除
            2 到 √x 看有没有因子 —— 判一个数 O(√x),总共约 <BigO o="n" label="O(n√n)" />,
            n = 10⁶ 时就吃力了。
          </p>
          <p>
            <b>换个方向的灵光:</b>判断「x 是不是质数」很慢,但<strong>「谁是合数」却很好说</strong> ——
            合数就是某个质数的倍数。所以别去逐个盘问,反过来:<strong>拿着每个质数,
            把它的倍数一网打尽地划掉</strong>,划剩下的自然全是质数。这就是
            <strong>埃拉托斯特尼筛法(Sieve of Eratosthenes,简称埃氏筛)</strong>。
            亲眼看它怎么筛 30 以内的质数:
          </p>
        </div>
        <SieveGrid />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            动画里藏着两个「为什么」,都是本题的考点。<strong>其一,为什么从 i² 开始划?</strong>
            处理质数 i 时,比 i² 小的倍数(2i、3i…)都含有一个比 i 小的质因子,
            早被那个更小的质数划过了 —— 从 i² 起步,跳过全部重复劳动。<strong>其二,
            为什么外层只筛到 √n?</strong>任何合数 x ≤ n 必有一个 ≤ √x ≤ √n 的因子,
            所以只要所有 ≤ √n 的质数都清扫过一遍,剩下的必是质数。
          </p>
        </div>
        <CodeTabs
          title="lc204_count_primes"
          java={{
            code: `class Solution {
    public int countPrimes(int n) {
        boolean[] notPrime = new boolean[n]; // notPrime[x] = x 是合数
        int count = 0;
        for (int i = 2; i < n; i++) {
            if (notPrime[i]) continue;       // 已被划掉,不是质数
            count++;                          // i 幸存 → 质数
            // 从 i*i 起划它的倍数;i*i 用 long,防 i 较大时 int 溢出
            for (long j = (long) i * i; j < n; j += i) {
                notPrime[(int) j] = true;
            }
        }
        return count;
    }
}`,
            hl: [8, 9],
            note: (
              <>
                <b>坑:</b>当 i 接近 √(2³¹) ≈ 46341 时,<code>i * i</code> 会溢出 int
                成负数,循环直接失控。把 j 声明成 <code>long</code>、或用{" "}
                <code>(long) i * i</code> 是必须的防溢出动作。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def countPrimes(self, n: int) -> int:
        if n < 3:
            return 0
        is_prime = [True] * n
        is_prime[0] = is_prime[1] = False
        for i in range(2, int(n ** 0.5) + 1):   # 只需筛到 √n
            if is_prime[i]:
                # 切片赋值:从 i*i 起一次性划掉整串倍数
                is_prime[i * i : n : i] = [False] * len(is_prime[i * i : n : i])
        return sum(is_prime)`,
            hl: [7, 10],
            note: (
              <>
                <b>地道写法:</b><code>is_prime[i*i::i] = [False]*k</code> 用切片一口气划掉
                一整串倍数,比 Python 层的 for 循环快得多 —— 把活儿交给 C 实现的切片。
              </>
            ),
          }}
          js={{
            code: `var countPrimes = function (n) {
  const notPrime = new Uint8Array(n);   // 0=质数候选,1=合数;比普通数组省内存
  let count = 0;
  for (let i = 2; i < n; i++) {
    if (notPrime[i]) continue;
    count++;
    for (let j = i * i; j < n; j += i) notPrime[j] = 1;
  }
  return count;
};`,
            hl: [7],
            note: (
              <>
                <b>细节:</b>n ≤ 5×10⁶ 时 <code>i * i</code> 不超过 2⁵³,Number 精确,无需 BigInt;
                用 <code>Uint8Array</code> 而非普通数组,内存和速度都更好。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(n log log n)</b>(每个合数只被它的几个质因子划到,调和级数求和的结果),
            空间 O(n)。高频追问:①「log log n 怎么来的?」→ Σ(n/p) 对所有质数 p 求和 ≈ n·ln ln n;
            ②「能到 O(n) 吗?」→ <b>线性筛(欧拉筛)</b>:让每个合数只被它的<b>最小质因子</b>划恰好一次,
            关键是内层遇到 <code>i % prime == 0</code> 就 break;③「只判单个大数是不是质数?」
            → 别筛了,用 Miller–Rabin 素性测试。
          </p>
        </Callout>
        <Callout tone="deep" title="工程现场:你的每一次 HTTPS 握手">
          <p>
            RSA、Diffie–Hellman 这些公钥密码,安全性建立在「找两个大质数很容易、
            把它们的乘积再分解回去却极难」之上。生成密钥时,机器就是不停地随机取大数、
            做素性测试(大范围下用概率性的 Miller–Rabin,而非埃氏筛)。
            埃氏筛的「用小质数筛掉倍数」思想,是这一切的启蒙第一课。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 快速幂(盘) ================= */}
      <Section
        id="qpow"
        index="04"
        title="快速幂(复盘):把「乘 b 次」压成「乘 log b 次」"
        desc="第 2 章分治的老朋友,这次专攻它的取模变体"
        badge={<span className="chip">复盘 · 分治</span>}
      >
        <div className="prose">
          <p>
            算 aᵇ,老实乘 b 次是 O(b);b = 10⁹ 就没法看了。分治章教过的
            <strong>快速幂(fast exponentiation / binary exponentiation)</strong>把它压到
            <strong> O(log b)</strong>:核心是 aᵇ = (a²)^(b/2),<strong>底数不断平方、
            指数不断折半</strong>。等价地看 b 的二进制 —— 哪一位是 1,就把对应的
            a^(2ᵏ) 乘进结果。这里复盘它在数论里最常见的搭档:<strong>边乘边取模</strong>。
          </p>
          <p>
            为什么要在快速幂里专门讲取模?因为 §01 留了个尾巴:<strong>取模不能做除法</strong>。
            而快速幂正是补上这个缺口的工具 —— 由<strong>费马小定理</strong>:当 m 是质数、
            a 不是 m 的倍数时,a^(m−1) ≡ 1 (mod m),于是 a 的模逆元 = a^(m−2) mod m。
            要算 (x ÷ a) % m,就改算 (x × a^(m−2)) % m —— 一个快速幂搞定。
          </p>
        </div>
        <CodeTabs
          title="qpow_mod"
          java={{
            code: `class Solution {
    static final int MOD = 1_000_000_007;

    // 求 (a^b) % MOD,时间 O(log b)
    long qpow(long a, long b) {
        long res = 1;
        a %= MOD;
        while (b > 0) {
            if ((b & 1) == 1) res = res * a % MOD; // 当前二进制位为 1,乘进结果
            a = a * a % MOD;                         // 底数平方
            b >>= 1;                                 // 指数折半
        }
        return res;
    }

    // 模逆元:m 为质数时,a 的逆元 = a^(m-2)(费马小定理)
    long inverse(long a) {
        return qpow(a, MOD - 2);
    }
}`,
            hl: [9, 10],
            note: (
              <>
                <b>坑:</b>res、a 必须是 <code>long</code> —— 两个约 10⁹ 的数相乘 ≈ 10¹⁸,
                int 直接溢出。每次乘完立刻 <code>% MOD</code>,让它们始终待在安全区。
              </>
            ),
          }}
          python={{
            code: `MOD = 10**9 + 7

def qpow(a: int, b: int, mod: int = MOD) -> int:
    res, a = 1, a % mod
    while b:
        if b & 1:
            res = res * a % mod
        a = a * a % mod
        b >>= 1
    return res

# CPython 内置的三参数 pow 就是「快速幂 + 取模」:
# pow(a, b, mod)           # = a^b % mod
# pow(a, -1, mod)          # = a 的模逆元(3.8+)`,
            hl: [12, 13],
            note: (
              <>
                <b>爽点:</b><code>pow(a, b, mod)</code> 是内置快速幂,C 实现、飞快;
                <code>pow(a, -1, mod)</code>(3.8+)直接给模逆元。手写用于面试,平时直接调。
              </>
            ),
          }}
          js={{
            code: `const MOD = 1_000_000_007n;

// 取模快速幂必须用 BigInt:a*a ≈ 10^18 远超 Number 安全整数 2^53
function qpow(a, b) {
  a = BigInt(a) % MOD;
  b = BigInt(b);
  let res = 1n;
  while (b > 0n) {
    if (b & 1n) res = (res * a) % MOD;
    a = (a * a) % MOD;
    b >>= 1n;
  }
  return res;
}

const inverse = (a) => qpow(a, MOD - 2n);   // 费马小定理求逆元`,
            hl: [4, 5],
            note: (
              <>
                <b>坑:</b>只要涉及取模乘法,JS 一律 BigInt,否则 a*a 丢精度。
                注意 BigInt 与 Number 不能混算,常量都要带 <code>n</code>(如 <code>1n</code>、
                <code>MOD - 2n</code>)。
              </>
            ),
          }}
        />
        <Callout tone="deep" title="它不只是求幂:同一个骨架能算矩阵、能跳楼梯">
          <p>
            快速幂的本质是「<b>对满足结合律的运算,用二进制拆分把 n 次操作压成 log n 次</b>」。
            把「数的乘法」换成「矩阵乘法」,就是<b>矩阵快速幂</b>:斐波那契 / 爬楼梯的
            O(log n) 解法(第 7 章 DP 埋过这个伏笔),n = 10¹⁸ 也能秒算。
            凡是线性递推,都能这么加速。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 精讲 B · 169 摩尔投票 ================= */}
      <Section
        id="moore"
        index="05"
        title="精讲 B · 摩尔投票:让多数元素自己浮出来"
        desc="LC 169 多数元素 —— O(1) 空间的魔术,靠一个「抵消不变量」"
        badge={<span className="lc-badge" data-d="easy">EASY</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>数组里有个元素出现次数<strong>超过 n/2</strong>(保证存在),找出它。
            <b> 暴力:</b>哈希表计数,O(n) 时间但 O(n) 空间;或排序后取正中间那个,
            O(n log n)。都能过,但都不够漂亮。
          </p>
          <p>
            <b>能不能 O(1) 空间、O(n) 时间?</b>能 —— 靠一个绝妙的<strong>不变量</strong>。
            想象一场擂台赛:维护一个「守擂者(candidate)」和它的「票数(count)」。
            扫过每个人:和守擂者<strong>同类就 +1 票,异类就 −1 票(同归于尽)</strong>,
            票数归零就让下一个人上台当守擂者。这叫<strong>摩尔投票(Boyer–Moore Voting)</strong>。
            逐帧慢放:
          </p>
        </div>
        <MooreVote />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <strong>为什么最后站台上的一定是多数元素?</strong>把守擂者的票数看成
            「它出现的次数 减去 所有其他元素出现的次数」。多数元素出现超过一半,
            意味着它一个人比「所有其他人加起来」还多 —— 哪怕每个异类都来和它抵消一票,
            <strong>也抵不完</strong>,票数永远归不到零、它永远不会被赶下台。
            这就是那个恒成立的不变量。
          </p>
        </div>
        <CodeTabs
          title="lc169_majority_element"
          java={{
            code: `class Solution {
    public int majorityElement(int[] nums) {
        int cand = 0, count = 0;
        for (int x : nums) {
            if (count == 0) cand = x;         // 票数归零,换守擂者
            count += (x == cand) ? 1 : -1;    // 同类 +1,异类 -1
        }
        return cand;   // 题目保证多数元素存在,cand 即答案
    }
}`,
            hl: [5, 6],
            note: (
              <>
                <b>前提:</b>这段代码<b>依赖「多数元素一定存在」</b>。若不保证,
                最后要再扫一遍数组数 cand 的真实出现次数,验证是否 &gt; n/2。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def majorityElement(self, nums: list[int]) -> int:
        cand, count = None, 0
        for x in nums:
            if count == 0:
                cand = x
            count += 1 if x == cand else -1
        return cand`,
            hl: [5, 6, 7],
            note: (
              <>
                <b>对照:</b><code>collections.Counter(nums).most_common(1)</code> 一行也能出答案,
                但那是 O(n) 空间。面试要的是摩尔投票的 O(1) 空间 —— 说得出不变量才算真懂。
              </>
            ),
          }}
          js={{
            code: `var majorityElement = function (nums) {
  let cand = 0, count = 0;
  for (const x of nums) {
    if (count === 0) cand = x;
    count += x === cand ? 1 : -1;
  }
  return cand;
};`,
            hl: [4, 5],
            note: (
              <>
                <b>一趟扫描:</b>时间 O(n)、空间 O(1),不需要任何哈希结构。
                元素是字符串 / 对象也照样能用 —— 只要能用 <code>===</code> 判相等。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 追问链">
          <p>
            时间 <b>O(n)</b>、空间 <b>O(1)</b>。经典进阶:①「找出所有出现次数 &gt; n/3 的元素」
            (LC 229)→ 超过 n/3 的最多有 2 个,<b>同时维护两个候选者和两个计数</b>,
            规则照搬,最后再验证;②「&gt; n/k 呢?」→ 维护 k−1 个候选(Misra–Gries 算法);
            ③「为什么不能直接返回、要验证?」→ 不保证存在时,摩尔投票只会吐出一个「最后的幸存者」,
            它未必真过半。
          </p>
        </Callout>
        <Callout tone="deep" title="工程现场:流式数据里的「找大户」">
          <p>
            在只能扫一遍、内存装不下全部数据的<b>流式场景</b>(网络流量里找发包最多的 IP、
            日志里找最高频的错误码),摩尔投票的推广版 <b>Misra–Gries / Space-Saving</b>
            正是「Heavy Hitters(重击者)」问题的经典解 —— 用固定几个计数槽,近似找出
            高频元素。O(1) 空间的抵消思想,在真实系统里价值千金。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 下一个排列 31 ================= */}
      <Section
        id="perm"
        index="06"
        title="下一个排列:字典序的进位规律"
        desc="LC 31 —— 没有一点数学,全是「位置」的规律"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>把数组重排成字典序里<strong>恰好比它大一位</strong>的排列
            (若已是最大,则回到最小)。<b>暴力:</b>生成全部 n! 个排列排序后找下一个 ——
            n = 10 就爆了。<b>正解:</b>把它当成「给一个数做加一进位」来想,规律只有四步。
          </p>
          <p>
            直觉:一个排列的<strong>后缀如果是递减的,它就是这段的最大排列</strong>,
            没法在原地再变大,只能向前「进位」。所以从右找到第一个「打破递减」的位置(山谷),
            把它换成右边「刚好比它大一点」的数,再把右边压到最小(升序)。逐帧看:
          </p>
        </div>
        <ArrayStepper
          title="LC 31 · 下一个排列([1,3,5,4,2] → [1,4,2,3,5])"
          frames={NP_FRAMES}
          cellW={56}
        />
        <CodeTabs
          title="lc31_next_permutation"
          java={{
            code: `class Solution {
    public void nextPermutation(int[] nums) {
        int n = nums.length, i = n - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) i--;   // 1. 从右找山谷 i
        if (i >= 0) {                                     // 存在山谷才需交换
            int j = n - 1;
            while (nums[j] <= nums[i]) j--;             // 2. 从右找首个 > nums[i]
            int t = nums[i]; nums[i] = nums[j]; nums[j] = t; // 3. 交换
        }
        // 4. 反转 i 之后的降序段 → 升序(该段最小)
        for (int l = i + 1, r = n - 1; l < r; l++, r--) {
            int t = nums[l]; nums[l] = nums[r]; nums[r] = t;
        }
    }
}`,
            hl: [4, 7, 8],
            note: (
              <>
                <b>边界:</b>若整个数组递减(已是最大排列),第 1 步的 i 会走到 −1,
                跳过交换、直接反转全体 → 回到最小排列。这正是题目要的「循环」行为。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def nextPermutation(self, nums: list[int]) -> None:
        n = len(nums)
        i = n - 2
        while i >= 0 and nums[i] >= nums[i + 1]:   # 1. 找山谷
            i -= 1
        if i >= 0:
            j = n - 1
            while nums[j] <= nums[i]:              # 2. 找首个更大的
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]    # 3. 交换
        nums[i + 1:] = reversed(nums[i + 1:])      # 4. 反转右段`,
            hl: [5, 12],
            note: (
              <>
                <b>爽点:</b><code>nums[i+1:] = reversed(nums[i+1:])</code> 一行原地反转右段。
                切片赋值直接改原列表 —— 契合本题「原地修改、不返回」的要求。
              </>
            ),
          }}
          js={{
            code: `var nextPermutation = function (nums) {
  const n = nums.length;
  let i = n - 2;
  while (i >= 0 && nums[i] >= nums[i + 1]) i--;        // 1. 找山谷
  if (i >= 0) {
    let j = n - 1;
    while (nums[j] <= nums[i]) j--;                    // 2. 找首个更大的
    [nums[i], nums[j]] = [nums[j], nums[i]];           // 3. 交换
  }
  for (let l = i + 1, r = n - 1; l < r; l++, r--) {    // 4. 反转右段
    [nums[l], nums[r]] = [nums[r], nums[l]];
  }
};`,
            hl: [4, 7, 8],
            note: (
              <>
                <b>细节:</b>解构赋值 <code>[a, b] = [b, a]</code> 是右边先整体求值,
                交换 / 反转都不会互相覆盖 —— 比临时变量清爽。整题 O(n) 时间、O(1) 空间。
              </>
            ),
          }}
        />
        <Callout tone="win" title="面试话术:先复述规律,再写代码">
          <p>
            这类「找规律」题,开口别急着敲键盘。先说:「下一个排列 = 从右找第一个能变大的位,
            用右边刚好更大的数替换,再把右边归到最小。」——
            把规律讲清楚,面试官就知道你真懂了;代码只是把这四句话翻译成循环。
            <b>规律说不清的题,代码一定写得磕磕绊绊。</b>
          </p>
        </Callout>
      </Section>

      {/* ================= §07 精讲 C · 292 Nim 博弈 ================= */}
      <Section
        id="nim"
        index="07"
        title="精讲 C · 博弈论:找到那个「必败态」"
        desc="LC 292 Nim 游戏 —— 博弈题的通法,是打表猜出一个不变量"
        badge={<span className="lc-badge" data-d="easy">EASY</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>桌上 n 颗石子,你和对手轮流拿,每次拿 1~3 颗,
            <strong>拿到最后一颗的人赢</strong>。假设两人都绝顶聪明,你先手,能赢吗?
            <b> 暴力:</b>博弈搜索(minimax)—— 递归枚举每种拿法,状态 O(n),会 TLE。
            <b> 正解:</b>本章心法登场:<strong>打表 → 猜规律 → 证明</strong>。
          </p>
          <p>
            先手玩几个小的:n=1/2/3,一把拿光,<strong>先手胜</strong>;n=4,你拿几颗
            (1~3),都会给对手留下 1~3 颗让他拿光,<strong>先手败</strong>;
            n=5/6/7,你可以拿掉 1/2/3 颗,把那个「必败的 4」丢给对手,<strong>先手胜</strong>;
            n=8,又回到「怎么拿都给对手留下 5/6/7」的必败局……规律浮出水面:
            <strong>n 是 4 的倍数时先手必败,否则必胜</strong>。这里的不变量就是
            <strong> n % 4</strong>。亲手验证 —— 你能在必败态下翻盘吗?
          </p>
        </div>
        <NimGame />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <strong>为什么这个不变量成立(归纳证明)?</strong>定义「剩余是 4 的倍数、
            且轮到你走」为<strong>必败态</strong>。①出口:剩 0 颗轮到你 = 你没得拿、上一个人拿了最后一颗,
            你输 —— 0 是 4 的倍数,符合。②归纳:若你面对 4 的倍数,你拿 k 颗(1~3),
            对手总能拿 <strong>4−k</strong> 颗,把剩余重新变回 4 的倍数丢还给你;如此循环,
            直到把 0 留给你。反之,若 n 不是 4 的倍数,你首手拿掉 <strong>n%4</strong> 颗,
            就把必败态甩给对手。所以答案一行:
          </p>
        </div>
        <CodeTabs
          title="lc292_nim_game"
          java={{
            code: `class Solution {
    public boolean canWinNim(int n) {
        return n % 4 != 0;   // 面对 4 的倍数必败,否则必胜
    }
}`,
            hl: [3],
            note: (
              <>
                <b>反差:</b>一道看似要写博弈搜索的题,答案是一行取模。这就是
                「找到不变量」的威力 —— 难的从来不是代码,是看穿 n%4。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def canWinNim(self, n: int) -> bool:
        return n % 4 != 0`,
            hl: [3],
            note: (
              <>
                <b>提醒:</b>这是「巴什博弈(Bash Game)」的特例:每次取 1~m 颗,
                必败态是 (m+1) 的倍数。这里 m=3,所以看 %4。记住通式,一类题通吃。
              </>
            ),
          }}
          js={{
            code: `var canWinNim = function (n) {
  return n % 4 !== 0;
};`,
            hl: [2],
            note: (
              <>
                <b>正牌 Nim:</b>LeetCode 292 其实是巴什博弈。真正的「Nim 游戏」有多堆石子,
                胜负由各堆异或和(Sprague–Grundy 定理)决定 —— 那是位运算章异或的高阶应用。
              </>
            ),
          }}
        />
        <div className="prose">
          <p>
            同一套「找不变量」的招式,横扫一堆博弈 / 找规律题。挑两道本章题单里的近亲:
          </p>
        </div>
        <div className="mth-duel">
          <div className="card">
            <div className="card-kicker">近亲 · LC 1025 除数博弈</div>
            <div className="card-title">
              <b className="mono">看奇偶</b>
            </div>
            <p>
              轮流把 n 减去它的一个真因子,减到 1 的人输。打表发现:
              <b>n 偶数先手胜、奇数先手败</b>。因为偶数能减 1 把奇数丢给对手,
              而奇数的因子全是奇数、减完必变偶数。不变量 = n 的奇偶。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">近亲 · LC 319 灯泡开关</div>
            <div className="card-title">
              <b className="mono">看完全平方数</b>
            </div>
            <p>
              第 i 个灯被拨的次数 = i 的因子个数。因子成对出现(d 与 i/d),
              唯有<b>完全平方数</b>有奇数个因子,最终才亮。答案 = ⌊√n⌋。
              不变量 = 因子个数的奇偶。
            </p>
          </div>
        </div>
        <Callout tone="story" title="真正的 Nim,和一个 1901 年的定理">
          <p>
            多堆石子版的 Nim 由哈佛数学家 Charles Bouton 在 1901 年彻底破解:
            把各堆数量<b>异或</b>起来,结果非 0 则先手必胜。后来
            Sprague–Grundy 定理把它推广到<b>一切</b>公平组合游戏 —— 每个局面都能算出一个
            「Grundy 数」,整场游戏的胜负就是各子游戏 Grundy 数的异或。博弈论的半壁江山,
            起点就是这个拿石子的小游戏。
          </p>
        </Callout>
      </Section>

      {/* ================= §08 快乐数 202 ================= */}
      <Section
        id="happy"
        index="08"
        title="快乐数:把数论问题,翻译成链表找环"
        desc="LC 202 —— 关键不是算,是看穿「这是一条会成环的链」"
        badge={<span className="lc-badge" data-d="easy">EASY</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>反复把一个数「各位平方求和」,若最终变成 1 就叫<strong>快乐数</strong>。
            例如 19:1²+9² = 82 → 8²+2² = 68 → 6²+8² = 100 → 1²+0²+0² = 1,快乐!
          </p>
        </div>
        <div className="mth-chain">
          <span className="mth-chain-node">19</span>
          <span className="mth-chain-arrow">→</span>
          <span className="mth-chain-node">82</span>
          <span className="mth-chain-arrow">→</span>
          <span className="mth-chain-node">68</span>
          <span className="mth-chain-arrow">→</span>
          <span className="mth-chain-node">100</span>
          <span className="mth-chain-arrow">→</span>
          <span className="mth-chain-node" data-s="ok">1 ✓</span>
        </div>
        <div className="prose">
          <p>
            麻烦在于:<strong>不快乐的数会陷入死循环,永远到不了 1</strong>。比如 2:
          </p>
        </div>
        <div className="mth-chain">
          <span className="mth-chain-node">2</span>
          <span className="mth-chain-arrow">→</span>
          <span className="mth-chain-node">4</span>
          <span className="mth-chain-arrow">→</span>
          <span className="mth-chain-node">16</span>
          <span className="mth-chain-arrow">→</span>
          <span className="mth-chain-node">37</span>
          <span className="mth-chain-arrow">→</span>
          <span className="mth-chain-node">58</span>
          <span className="mth-chain-arrow">→</span>
          <span className="mth-chain-node">89</span>
          <span className="mth-chain-arrow">→</span>
          <span className="mth-chain-node">145</span>
          <span className="mth-chain-arrow">→</span>
          <span className="mth-chain-node">42</span>
          <span className="mth-chain-arrow">→</span>
          <span className="mth-chain-node">20</span>
          <span className="mth-chain-arrow">→</span>
          <span className="mth-chain-node" data-s="loop">4 ↺</span>
          <span className="mth-chain-loop">又回到 4,成环</span>
        </div>
        <div className="prose">
          <p>
            <strong>洞察:</strong>把「下一个数」看成一根指针 —— 每个数都指向它的「各位平方和」。
            于是整个过程就是<strong>一条链表</strong>:快乐数的链终点是 1(可看成自环 1→1),
            不快乐数的链最终<strong>绕回自己走过的数,形成环</strong>。
            「判断这条链会不会到 1」= <strong>「判断链表有没有环」</strong> ——
            正是 DataData · 03 链表章讲过的<strong>快慢指针(Floyd 判圈)</strong>!
            慢指针一次走一步、快指针一次走两步:两者相遇 ⇒ 有环 ⇒ 不快乐;快指针先到 1 ⇒ 快乐。
          </p>
          <p>
            <strong>为什么一定会到 1 或成环、不会无限增大?</strong>因为各位平方和不会失控:
            一个 3 位数最大是 999,平方和 3×81 = 243;位数越多,平方和相对越小。
            所以数值很快被压进 [1, 243] 这个<strong>有限区间</strong>,由鸽巢原理,
            有限个状态里反复走,要么撞上 1,要么撞上重复值(成环)—— 必有结局。
          </p>
        </div>
        <CodeTabs
          title="lc202_happy_number"
          java={{
            code: `class Solution {
    public boolean isHappy(int n) {
        int slow = n, fast = next(n);
        while (fast != 1 && slow != fast) { // 快到 1,或快慢相遇(成环)
            slow = next(slow);              // 慢走一步
            fast = next(next(fast));        // 快走两步
        }
        return fast == 1;                   // 到 1 = 快乐;相遇 = 死循环
    }
    private int next(int x) {               // 各位平方和 = 链表的 next 指针
        int sum = 0;
        while (x > 0) { int d = x % 10; sum += d * d; x /= 10; }
        return sum;
    }
}`,
            hl: [4, 5, 6],
            note: (
              <>
                <b>两种写法:</b>快慢指针 O(1) 空间;更直观的是用 <code>HashSet</code>
                记录见过的数,重复出现即成环 —— 代价是 O(k) 空间。面试报「Floyd 判圈」更亮眼。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def isHappy(self, n: int) -> bool:
        def nxt(x: int) -> int:
            return sum(int(c) ** 2 for c in str(x))   # 各位平方和

        slow, fast = n, nxt(n)
        while fast != 1 and slow != fast:
            slow = nxt(slow)
            fast = nxt(nxt(fast))
        return fast == 1`,
            hl: [7, 8, 9],
            note: (
              <>
                <b>取巧:</b><code>str(x)</code> 拆位最省事;追求性能可换成 <code>divmod(x, 10)</code>
                循环。HashSet 版:<code>seen=set(); while n!=1 and n not in seen: ...</code>。
              </>
            ),
          }}
          js={{
            code: `var isHappy = function (n) {
  const next = (x) => {
    let s = 0;
    while (x > 0) { const d = x % 10; s += d * d; x = (x - d) / 10; }
    return s;
  };
  let slow = n, fast = next(n);
  while (fast !== 1 && slow !== fast) {
    slow = next(slow);
    fast = next(next(fast));
  }
  return fast === 1;
};`,
            hl: [7, 8, 9, 10],
            note: (
              <>
                <b>细节:</b>拆位用 <code>x = (x - d) / 10</code> 保证是整数除法
                (JS 的 <code>/</code> 是浮点除,先减掉个位再除才干净);数字全在安全范围,无需 BigInt。
              </>
            ),
          }}
        />
        <Callout tone="idea" title="举一反三:「会不会成环」是一整类问题的伪装">
          <p>
            一旦某个过程是「当前状态唯一决定下一个状态」,它就是一条隐形链表,
            «会不会陷入循环» 就能用快慢指针破解。LC 202 快乐数、LC 287 寻找重复数
            (把 nums[i] 当 next 指针)、检测函数迭代的周期……底层都是同一招
            Floyd 判圈。<b>看穿伪装,比记住算法更值钱。</b>
          </p>
        </Callout>
      </Section>

      {/* ================= §09 题单 ================= */}
      <Section
        id="problems"
        index="09"
        title="高频题单:数学与数论 13 题"
        desc="按「找规律 / 取模防溢出 / 博弈」分层,由易到难。先想 30 秒再看提示"
        badge={<span className="chip">主线 + 选做</span>}
      >
        <ProblemSet ch="math" items={PROBLEMS} />
      </Section>

      {/* ================= §10 Quiz ================= */}
      <Section
        id="quiz"
        index="10"
        title="通关测验"
        desc="8 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="math" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            本章灵魂:<b>数学题不考数学,考的是找不变量 / 规律</b>。通用套路 ——
            <b>打表(算几个小例子)→ 猜规律 / 不变量 → 归纳证明</b>。
          </>,
          <>
            取模三律:加、减、乘<b>可以边算边模</b>(分配律),<b>除法不行</b>(要用模逆元)。
            铁律是<b>边算边模</b>,绝不「算完再模」—— 中间早溢出了。
          </>,
          <>
            为什么用 10⁹+7:<b>够大、是质数(能求逆元)、平方后不爆 64 位 long</b>。
            Java 静默溢出、JS 超 2⁵³ 丢精度(上 BigInt)、Python 无限大但仍要取模压小。
          </>,
          <>
            gcd(a, b) = gcd(b, a % b)(公约数集合不变);埃氏筛<b>从 i² 起划、只筛到 √n</b>,
            O(n log log n)。快速幂 <b>O(log b)</b>,还能配费马小定理求模逆元。
          </>,
          <>
            摩尔投票:<b>抵消不变量</b>,O(1) 空间找多数元素 —— 前提是多数元素<b>确实存在</b>,
            否则要回头验证候选者。
          </>,
          <>
            博弈找必败态:Nim 看 <b>n % 4</b>、除数博弈看<b>奇偶</b>、灯泡开关看<b>完全平方数</b>。
            找到「谁面对必败态」,题目就塌成一行。
          </>,
          <>
            两个万能翻译:下一个排列 = <b>字典序进位规律</b>(找山谷→换更大→反转右段);
            快乐数 = <b>链表找环</b>(next 函数当指针,快慢指针判圈)。
          </>,
        ]}
      />

      <ChapterFooter ch="math" />
    </main>
  );
}
