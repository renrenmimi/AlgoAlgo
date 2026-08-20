"use client";

// 第 11 章 · 数学与数论。
// 灵魂:数学题不考数学,考的是能不能找到那个「不变量 / 规律」。
// 结构:找不变量 + 溢出取模 → gcd → 精讲 A 埃氏筛(204)→ 快速幂(盘)→
//   精讲 B 摩尔投票(169)→ 下一个排列(31)→ 精讲 C Nim 博弈(292)→ 快乐数(202)→
//   题单 → 测验。三大自建 viz(埃氏筛网格 / Nim 交互 / 摩尔投票 ArrayStepper)在 ./viz。
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
import { ArrayStepper, type ArrayFrame, type ArrayCell } from "@/lib/stepper";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { T } from "@/lib/i18n";
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
      <T
        en={
          <>
            The goal: the <b>next permutation</b> of [1,3,5,4,2] in lexicographic
            order — larger than it, but larger by as little as possible. No
            arithmetic is done on the values. The whole solution is a pattern about
            positions.
          </>
        }
        zh={
          <>
            目标:求 [1,3,5,4,2] 在字典序里的<b>下一个排列</b>(比它大、但大得最少的那个)。
            数值不参与任何运算 —— 全靠「位置的规律」。
          </>
        }
      />
    ),
  },
  {
    cells: npRow([1, 3, 5, 4, 2], { 1: "lit" }),
    ptrs: [{ i: 1, label: "i" }],
    msg: (
      <T
        en={
          <>
            <b>Step 1 · find the break.</b> Scan from the right for the first
            position whose value is smaller than the next one: 5 &gt; 4 &gt; 2 keeps
            decreasing, until 3 &lt; 5. So i = 1, holding the value 3. Everything to
            the right of i is already the largest arrangement of those values, so the
            increase has to come from i.
          </>
        }
        zh={
          <>
            <b>第 1 步 · 找断点。</b>从右往左找第一个「比后一位小」的位置:
            5 &gt; 4 &gt; 2 一路递减,直到 3 &lt; 5 —— 断点 i = 1(值 3)。
            它右边那段已是这些数的最大排列,只能靠 i 来「进位」。
          </>
        }
      />
    ),
  },
  {
    cells: npRow([1, 3, 5, 4, 2], { 1: "lit", 3: "ok" }),
    ptrs: [{ i: 1, label: "i" }, { i: 3, label: "j" }],
    msg: (
      <T
        en={
          <>
            <b>Step 2 · find the replacement.</b> Inside the decreasing part to the
            right of i, scan from the right for the first value greater than 3: it is
            4, at j = 3. Because that part is decreasing, the first one found from
            the right is the <b>smallest</b> value still larger than 3, so swapping
            it in makes the increase as small as possible.
          </>
        }
        zh={
          <>
            <b>第 2 步 · 找接班人。</b>在 i 右边的降序段里,从右往左找第一个比 3 大的数 →
            4(j = 3)。因为那段是降序,从右边先遇到的就是<b>最小</b>的那个「仍比 3 大」的数,
            换上去能让增幅最小。
          </>
        }
      />
    ),
  },
  {
    cells: npRow([1, 4, 5, 3, 2], { 1: "ok", 3: "ok" }),
    ptrs: [{ i: 1, label: "i" }],
    msg: (
      <T
        en={
          <>
            <b>Step 3 · swap i and j.</b> 3 ↔ 4 gives [1,<b>4</b>,5,3,2]. Position i
            is now larger, but 5 3 2 to its right is still <b>decreasing</b>, which
            means it is the largest arrangement of those three values.
          </>
        }
        zh={
          <>
            <b>第 3 步 · 交换 i、j。</b>3 ↔ 4 → [1,<b>4</b>,5,3,2]。现在 i 位变大了,
            但它右边的 5 3 2 仍是<b>递减</b>的,也就是那三个数的最大排列。
          </>
        }
      />
    ),
  },
  {
    cells: npRow([1, 4, 2, 3, 5], { 2: "ok", 3: "ok", 4: "ok" }),
    msg: (
      <T
        en={
          <>
            <b>Step 4 · reverse the right part.</b> Reversing a decreasing run makes
            it increasing, which is the smallest arrangement of those values: 5 3 2
            becomes 2 3 5. The result is [1,4,2,3,5].
          </>
        }
        zh={
          <>
            <b>第 4 步 · 反转右段。</b>把 i 右边整段反转(递减 → 递增,即该段的最小排列):
            5 3 2 → 2 3 5。得到 [1,4,2,3,5]。
          </>
        }
      />
    ),
  },
  {
    cells: npRow([1, 4, 2, 3, 5], { 0: "ok", 1: "ok", 2: "ok", 3: "ok", 4: "ok" }),
    msg: (
      <T
        en={
          <>
            Done: the next permutation of 13542 is <b>14235</b>. Four steps: find the
            break, find the smallest larger value, swap, reverse the right part. O(n)
            time and O(1) space, with no formula anywhere.
          </>
        }
        zh={
          <>
            完成:13542 的下一个排列是 <b>14235</b>。规律四连:找断点 → 找刚好更大的 →
            交换 → 反转右段。O(n) 时间、O(1) 空间,不用任何数学公式。
          </>
        }
      />
    ),
  },
];

/* ============ 页面 ============ */

const CHIPS = [
  { id: "why", n: "01", label: { en: "Invariants & modulo", zh: "找不变量 · 取模" } },
  { id: "gcd", n: "02", label: { en: "gcd · Euclid", zh: "gcd 辗转相除" } },
  { id: "sieve", n: "03", label: { en: "Sieve of Eratosthenes", zh: "埃氏筛" } },
  { id: "qpow", n: "04", label: { en: "Fast power", zh: "快速幂" } },
  { id: "moore", n: "05", label: { en: "Boyer-Moore voting", zh: "摩尔投票" } },
  { id: "perm", n: "06", label: { en: "Next permutation", zh: "下一个排列" } },
  { id: "nim", n: "07", label: { en: "Game invariants", zh: "博弈不变量" } },
  { id: "happy", n: "08", label: { en: "Happy number", zh: "快乐数" } },
  { id: "problems", n: "09", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "10", label: { en: "Quiz", zh: "通关测验" } },
];

export default function MathChapter() {
  return (
    <main className="page" data-ch="math">
      <Hero
        ch="math"
        title={{
          en: (
            <>
              Math and <span className="grad">number theory</span>
            </>
          ),
          zh: (
            <>
              数学与数论 <span className="grad">Math</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              The name of this chapter scares people, and yet it contains the least
              mathematics in the book.{" "}
              <strong>
                Interview maths problems rarely test mathematics. They test whether
                you can find the pattern, or the quantity that never changes
              </strong>{" "}
              — Nim is n % 4, the bulb problem is perfect squares, the majority
              element is cancellation. Only one engineering rule really matters:{" "}
              <strong>do not let a large number overflow</strong>. This chapter shows
              how to turn a problem that looks like a wall of formulas into &quot;try
              two small cases and read off the pattern&quot;.
            </>
          ),
          zh: (
            <>
              这一章最容易被名字吓退,其实全书数学含量最低。
              <strong>数学题不考数学,考的是你能不能找到那个规律、那个不变量</strong> ——
              Nim 是 n % 4、灯泡是完全平方数、多数元素是「抵消」。真正的工程刚需只有一件:
              <strong>别让大数溢出</strong>。本章教你把「一脸公式」的题,拆成
              「先手玩两把、读出一条规律」。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 找不变量 + 溢出取模 ================= */}
      <Section
        id="why"
        index="01"
        title={{
          en: "Two things: find the invariant, and do not overflow",
          zh: "两件事:找不变量,和别让大数溢出",
        }}
        desc={{
          en: "One is how to attack the problem. The other is a rule the code cannot break.",
          zh: "一件是解题的心法,一件是工程的底线 —— 本章围绕这两条转",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  First, how to attack these problems. They look frightening because
                  they look like they need mathematics. But interview maths problems
                  almost never use calculus or linear algebra. They ask something
                  else:{" "}
                  <strong>
                    can you work through a few small cases by hand and notice a
                    pattern, or an <b>invariant</b> — a quantity that stays the same
                    through every step
                  </strong>
                  ? Find it and the problem often collapses into one line. Miss it and
                  you are stuck writing a brute-force simulation.
                </>
              }
              zh={
                <>
                  先说心法。数学题的可怕全在「它看起来需要数学」。但面试里的数学题几乎从不考
                  微积分、线性代数,它考的是:你能不能
                  <strong>
                    先手算几个小例子,从中读出一条规律或一个
                    <b>不变量(invariant)</b> —— 某个在整个过程中恒不改变的量
                  </strong>
                  。找到它,题目瞬间坍缩成一行代码;找不到,你会陷在暴力模拟里出不来。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  That is the pattern this chapter repeats. In the Nim game the
                  invariant is the number of stones modulo 4. In the bulb problem it
                  is whether the number of divisors is odd. For the majority element
                  it is that the cancellation cannot finish. So the general routine
                  is:
                </>
              }
              zh={
                <>
                  这是本章反复上演的剧本:Nim 游戏的不变量是「剩余石子模 4」、
                  灯泡开关的规律是「因子个数的奇偶」、多数元素的不变量是「抵消不完」。
                  所以本章的通用套路是:
                </>
              }
            />
          </p>
        </div>
        <div className="mth-steps">
          <div className="mth-step">
            <div>
              <h4>
                <T
                  en="Build a table — compute a few small answers by hand"
                  zh="打表 —— 先手算几个小规模答案"
                />
              </h4>
              <p>
                <T
                  en={
                    <>
                      What is the answer for n = 1, 2, 3, 4, 5? For a game problem,
                      work out who wins. For a counting problem, list the first few
                      terms. It feels slow, but the pattern often only shows up at the
                      fourth or fifth value.
                    </>
                  }
                  zh={
                    <>
                      n = 1, 2, 3, 4, 5 分别是什么结果?博弈题就手推谁赢,
                      计数题就列出前几项。别嫌笨,规律往往在第 4、5 个数据上才冒头。
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <div className="mth-step">
            <div>
              <h4>
                <T
                  en="Guess the pattern, or name the invariant"
                  zh="猜规律 / 找不变量 —— 那个不变的量是什么"
                />
              </h4>
              <p>
                <T
                  en={
                    <>
                      Look at the sequence you wrote down. Does it repeat with a
                      period? Does it depend on parity? On perfect squares, or on
                      multiples of 4? The quantity that no move can change is the key.
                    </>
                  }
                  zh={
                    <>
                      盯着这串数:是周期出现?和奇偶有关?和完全平方数 / 4 的倍数有关?
                      找到那个「无论怎么操作都不变」的量,它就是钥匙。
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <div className="mth-step">
            <div>
              <h4>
                <T
                  en="Prove it by induction — say why it always holds"
                  zh="归纳证明 —— 说清「为什么永远成立」"
                />
              </h4>
              <p>
                <T
                  en={
                    <>
                      A pattern is not a coincidence. Finish the argument with
                      induction, or by showing that the opponent can always restore
                      the invariant. In an interview, only a pattern you can justify is
                      safe to write as code.
                    </>
                  }
                  zh={
                    <>
                      规律不是巧合。用数学归纳法,或者「对手总能把不变量补回来」的论证
                      补上证明 —— 面试时,能证明的规律才敢写进代码。
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
                  Now the rule the code cannot break: <strong>overflow and the
                  modulus</strong>. Counting problems often have answers that are
                  astronomically large (a number of combinations, a number of ways),
                  so the statement asks for the result modulo <code>10⁹+7</code>. That
                  is not there to annoy you. It gives you{" "}
                  <strong>a range where nothing overflows</strong>. But there is one
                  rule: <strong>reduce as you compute, never only at the end</strong>.
                  If you wait, the intermediate value has already overflowed into a
                  wrong number, and a modulus applied afterwards cannot recover it.
                  Reducing as you go is allowed because the modulus distributes over
                  addition and multiplication:
                </>
              }
              zh={
                <>
                  再说底线:<strong>溢出与取模</strong>。计数类题目的答案常常大到天文数字
                  (组合数、方案数),题面于是要求「结果对 <code>10⁹+7</code> 取模」。
                  这不是刁难,是给你一个<strong>不溢出的安全区</strong>。但取模有个铁律:
                  <strong>要边算边模,不能算完再模</strong> —— 因为中间结果早就溢出成了错的数,
                  事后取模救不回来。取模之所以能「边算边模」,靠的是它对加法和乘法的分配律:
                </>
              }
            />
          </p>
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Rule · addition" zh="法则 · 加" />
            </div>
            <div className="card-title">
              <T en="➕ Addition distributes" zh="➕ 加法分配" />
            </div>
            <p>
              <T
                en={
                  <>
                    (a + b) % m = ((a%m) + (b%m)) % m. Subtraction works the same way,
                    but add m before the last reduction so the result is not negative.
                  </>
                }
                zh={
                  <>
                    (a + b) % m = ((a%m) + (b%m)) % m。减法同理,但最后取模前先 +m,
                    免得结果为负。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Rule · multiplication" zh="法则 · 乘" />
            </div>
            <div className="card-title">
              <T en="✖️ Multiplication distributes" zh="✖️ 乘法分配" />
            </div>
            <p>
              <T
                en={
                  <>
                    (a × b) % m = ((a%m) × (b%m)) % m. This is the dangerous one: two
                    values near 10⁹ multiply to about 10¹⁸, so{" "}
                    <b>the product must be held in a 64-bit long</b>.
                  </>
                }
                zh={
                  <>
                    (a × b) % m = ((a%m) × (b%m)) % m。这条最要命:两个约 10⁹ 的数相乘
                    ≈ 10¹⁸,<b>乘积必须用 64 位 long 接</b>。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Rule · division (trap)" zh="法则 · 除(陷阱)" />
            </div>
            <div className="card-title">
              <T en="➗ Division does not distribute" zh="➗ 除法不分配" />
            </div>
            <p>
              <T
                en={
                  <>
                    (a ÷ b) % m ≠ ((a%m) ÷ (b%m)) % m. To divide you need a{" "}
                    <b>modular inverse</b>, which exists only when b and m share no
                    factor above 1. Computing C(n, k) mod p is where you meet this. See
                    Fermat&apos;s little theorem in §04.
                  </>
                }
                zh={
                  <>
                    (a ÷ b) % m ≠ ((a%m) ÷ (b%m)) % m。要除得先求<b>模逆元</b>,
                    而逆元只在 b 与 m 互质时存在。算 C(n, k) mod p 就会撞上这一点 ——
                    见 §04 快速幂的费马小定理。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <CodeTabs
          title="mod_math"
          java={{
            code: {
              en: `class ModMath {
    static final int MOD = 1_000_000_007;

    // Add in 64-bit, then reduce once: int + int can overflow, long cannot here
    static int add(int a, int b) {
        return (int) (((long) a + b) % MOD);
    }

    // Two values below MOD multiply to about 10^18: cast to long or int overflows
    static long mul(long a, long b) {
        return (a % MOD) * (b % MOD) % MOD;
    }
}`,
              zh: `class ModMath {
    static final int MOD = 1_000_000_007;

    // 先在 64 位里相加,再取一次模:int + int 会溢出,long 在这个量级不会
    static int add(int a, int b) {
        return (int) (((long) a + b) % MOD);
    }

    // 两个小于 MOD 的数相乘约 10^18:必须转 long,否则 int 溢出
    static long mul(long a, long b) {
        return (a % MOD) * (b % MOD) % MOD;
    }
}`,
            },
            hl: [10, 11],
            note: {
              en: (
                <>
                  <b>Trap:</b> an int overflow in Java <b>does not raise an error</b>.
                  It quietly wraps around to a wrong value. Whenever multiplication is
                  involved, promote every operand to <code>long</code> first. Also,
                  Java&apos;s <code>%</code> follows the sign of the dividend, so{" "}
                  <code>-7 % 3</code> is <code>-1</code>. After a subtraction, write{" "}
                  <code>(x % m + m) % m</code>.
                </>
              ),
              zh: (
                <>
                  <b>坑:</b>Java 的 int 溢出<b>不会报错</b>,只会悄悄回绕成一个错的数。
                  一旦有乘法,把参与者全提升成 <code>long</code> 是肌肉记忆。另外 Java 的{" "}
                  <code>%</code> 取被除数的符号,<code>-7 % 3</code> 等于{" "}
                  <code>-1</code>,所以减法记得写 <code>(x % m + m) % m</code>。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `MOD = 10**9 + 7

def add(a: int, b: int) -> int:
    return (a + b) % MOD

def mul(a: int, b: int) -> int:
    return a * b % MOD   # the modulus only keeps the value small, it is not overflow protection`,
              zh: `MOD = 10**9 + 7

def add(a: int, b: int) -> int:
    return (a + b) % MOD

def mul(a: int, b: int) -> int:
    return a * b % MOD   # 取模只为把数压小,不是防溢出`,
            },
            hl: [6, 7],
            note: {
              en: (
                <>
                  <b>Difference:</b> Python integers have <b>no upper limit</b> and
                  never overflow. Here the modulus only keeps the values small, because
                  arithmetic on very large integers gets slower. Python&apos;s{" "}
                  <code>%</code> follows the sign of the divisor, so{" "}
                  <code>-7 % 3</code> is <code>2</code> and the result is never
                  negative — the <code>(x % m + m) % m</code> correction is not needed.
                  Both differences will surprise you if you switch to Java or C++ for an
                  interview.
                </>
              ),
              zh: (
                <>
                  <b>差异:</b>Python 整数<b>无上限</b>,永远不会溢出 ——
                  这里取模纯粹是把数字压回小范围(否则大整数运算会越来越慢)。
                  Python 的 <code>%</code> 取除数的符号,<code>-7 % 3</code> 等于{" "}
                  <code>2</code>,结果永不为负,所以不需要{" "}
                  <code>(x % m + m) % m</code> 这类修正。这两点在换到 Java / C++
                  面试时都会绊人。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `const MOD = 1_000_000_007n;   // BigInt: a plain Number loses precision above 2^53

const add = (a, b) => (a + b) % MOD;
const mul = (a, b) => (a * b) % MOD;

// With plain Number, once a*b passes 9e15 the result is not trustworthy; counting problems need BigInt`,
              zh: `const MOD = 1_000_000_007n;   // BigInt:普通 Number 超过 2^53 就丢精度

const add = (a, b) => (a + b) % MOD;
const mul = (a, b) => (a * b) % MOD;

// 若坚持用 Number:a*b 一旦超过 9e15 结果就不可信,计数题必须上 BigInt`,
            },
            hl: [1, 4],
            note: {
              en: (
                <>
                  <b>Trap:</b> JavaScript has one number type, Number (a
                  double-precision float), and its safe integer limit is 2⁵³ ≈ 9×10¹⁵.
                  Two values near 10⁹ multiply to 10¹⁸, far above that, so the result{" "}
                  <b>loses precision</b>. It does not raise an error and does not wrap
                  around, which makes it harder to notice. For modular arithmetic on
                  large numbers, use <code>BigInt</code> (literals end with{" "}
                  <code>n</code>). Its <code>%</code> follows the sign of the dividend,
                  like Java: <code>-7 % 3</code> is <code>-1</code>.
                </>
              ),
              zh: (
                <>
                  <b>坑:</b>JS 只有一种数字类型 Number(双精度浮点),安全整数上限是
                  2⁵³ ≈ 9×10¹⁵。两个 10⁹ 相乘 = 10¹⁸ 远超它,结果会<b>丢精度</b>
                  (既不报错也不回绕,更隐蔽)。涉及大数取模,一律用{" "}
                  <code>BigInt</code>(字面量带 <code>n</code>)。它的 <code>%</code>{" "}
                  和 Java 一样取被除数的符号:<code>-7 % 3</code> 等于{" "}
                  <code>-1</code>。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="story"
          title={{
            en: "Why does everyone use 10⁹+7?",
            zh: "为什么全世界都用 10⁹+7 这个怪数?",
          }}
        >
          <p>
            <T
              en={
                <>
                  It has to meet three conditions. First, it is{" "}
                  <b>large enough</b> that two different answers rarely collide after
                  the reduction. Second, it is <b>prime</b>, so every value that is not
                  a multiple of it has a modular inverse and division becomes possible
                  (see §04). Third, its square (10⁹+7)² ≈ 10¹⁸{" "}
                  <b>still fits in a 64-bit long</b> (limit ≈ 9.2×10¹⁸), so a product
                  of two reduced values does not overflow. 10⁹+7 sits exactly where all
                  three hold. Its relative 998244353 is also prime and is more common in
                  competitive programming, because it works with the number theoretic
                  transform (NTT).
                </>
              }
              zh={
                <>
                  它必须满足三个条件才好用:①<b>足够大</b>,让不同答案很难在取模后撞车;
                  ②是<b>质数</b>,这样任何不是它倍数的数都存在模逆元,除法才能做(见 §04);
                  ③平方后 (10⁹+7)² ≈ 10¹⁸ 仍<b>塞进 64 位 long</b>(上限 ≈ 9.2×10¹⁸),
                  两个已取模的数相乘不溢出。10⁹+7 正好卡在这三条同时成立的位置 ——
                  它的兄弟 998244353 也是质数,因为适合快速数论变换(NTT)而在竞赛里更常见。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 gcd ================= */}
      <Section
        id="gcd"
        index="02"
        title={{
          en: "Greatest common divisor: the Euclidean algorithm",
          zh: "最大公约数:辗转相除,两千年不过时",
        }}
        desc={{
          en: "gcd(a, b) = gcd(b, a % b) — one line of recursion, and here is why it is valid",
          zh: "gcd(a, b) = gcd(b, a % b) —— 一行递归,先讲清它凭什么成立",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The greatest common divisor (gcd) of two numbers is the largest
                  number that divides both. The slowest method tries every value from
                  min(a, b) downwards, which is O(min(a, b)). Euclid gave a much
                  shorter route: <strong>gcd(a, b) = gcd(b, a % b)</strong>. Repeat
                  until the remainder is 0, and the divisor at that moment is the
                  answer. This is the <strong>Euclidean algorithm</strong>.
                </>
              }
              zh={
                <>
                  两个数的最大公约数(greatest common divisor, gcd)是能同时整除它们的最大的数。
                  最笨的办法是从 min(a, b) 往下试每个数,O(min(a, b))。
                  欧几里得给了一条短得多的路:<strong>gcd(a, b) = gcd(b, a % b)</strong>,
                  一直辗转到余数为 0,此时的除数就是答案。这叫
                  <strong>辗转相除法(欧几里得算法)</strong>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <strong>Why is it valid?</strong> In one sentence:{" "}
                  <strong>
                    a and b have exactly the same common divisors as b and a % b
                  </strong>
                  . Suppose d divides both a and b. Because a % b = a − ⌊a/b⌋ × b, and
                  every term on the right is a multiple of d, d also divides a % b. In
                  the other direction, if d divides b and a % b, then a = ⌊a/b⌋ × b +
                  (a % b) is a multiple of d as well. The two sets of common divisors
                  are identical, so their largest members are equal — which is why
                  replacing the pair with a smaller pair is safe.
                </>
              }
              zh={
                <>
                  <strong>为什么成立?</strong>关键在一句话:
                  <strong>a 和 b 的公约数,与 b 和 a % b 的公约数,是完全相同的一批数</strong>。
                  设 d 同时整除 a、b,因为 a % b = a − ⌊a/b⌋ × b,而等式右边每一项都是
                  d 的倍数,所以 d 也整除 a % b;反过来,若 d 整除 b 和 a % b,
                  那 a = ⌊a/b⌋ × b + (a % b) 也是 d 的倍数。
                  两组的公约数集合一模一样,最大的那个自然相等 ——
                  于是可以放心把问题换成更小的一对。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <strong>How many steps?</strong> The remainder shrinks fast: after
                  every two steps the larger value is at least halved. So the algorithm
                  finishes in <strong>O(log min(a, b))</strong> steps, and the gcd of
                  two 64-bit numbers takes only a few dozen divisions.
                </>
              }
              zh={
                <>
                  <strong>要走多少步?</strong>余数缩得很快:每两步,较大的那个数
                  至少减半。所以整个过程是 <strong>O(log min(a, b))</strong> 步,
                  两个 64 位数求 gcd 也只要几十次除法。
                </>
              }
            />
          </p>
        </div>
        <div className="mth-steps">
          <div className="mth-step">
            <div>
              <h4>
                <T
                  en="gcd(48, 36): 48 % 36 = 12, so it becomes gcd(36, 12)"
                  zh="gcd(48, 36):48 % 36 = 12 → 换成 gcd(36, 12)"
                />
              </h4>
              <p>
                <T
                  en="A large problem becomes a smaller one, and the set of common divisors does not change."
                  zh="大问题换成小问题,公约数集合不变。"
                />
              </p>
            </div>
          </div>
          <div className="mth-step">
            <div>
              <h4>
                <T
                  en="gcd(36, 12): 36 % 12 = 0, so it becomes gcd(12, 0)"
                  zh="gcd(36, 12):36 % 12 = 0 → 换成 gcd(12, 0)"
                />
              </h4>
              <p>
                <T
                  en="A remainder of 0 means 12 divides 36, so the recursion is about to stop."
                  zh="余数变 0,意味着 12 整除 36,收敛在即。"
                />
              </p>
            </div>
          </div>
          <div className="mth-step">
            <div>
              <h4>
                <T
                  en="gcd(12, 0) = 12 — the remainder is 0, so the divisor is the answer"
                  zh="gcd(12, 0) = 12 —— 余数为 0,除数即答案"
                />
              </h4>
              <p>
                <T
                  en="The gcd of any number and 0 is that number itself. The answer is 12."
                  zh="任何数和 0 的 gcd 是它自己,递归到底。答案 12。"
                />
              </p>
            </div>
          </div>
        </div>
        <CodeTabs
          title="gcd_lcm"
          java={{
            code: {
              en: `class Solution {
    // Euclid: when the remainder is 0, the divisor is the gcd
    int gcd(int a, int b) {
        return b == 0 ? a : gcd(b, a % b);
    }

    // lcm(a, b) = a / gcd * b, dividing first so a * b never overflows
    long lcm(int a, int b) {
        return (long) a / gcd(a, b) * b;
    }
}`,
              zh: `class Solution {
    // 辗转相除:余数为 0 时,除数即最大公约数
    int gcd(int a, int b) {
        return b == 0 ? a : gcd(b, a % b);
    }

    // 最小公倍数 lcm(a, b) = a / gcd * b,先除后乘,避免 a * b 溢出
    long lcm(int a, int b) {
        return (long) a / gcd(a, b) * b;
    }
}`,
            },
            hl: [4, 9],
            note: {
              en: (
                <>
                  <b>Trap:</b> never write <code>a * b / gcd</code> — the product a×b
                  overflows before the division happens. Always{" "}
                  <b>divide first, then multiply</b>: <code>a / gcd × b</code>. The gcd
                  divides a exactly, so nothing is lost. Note the cast position:{" "}
                  <code>(long) a</code> is applied before the division, so the whole
                  expression is evaluated in 64-bit.
                </>
              ),
              zh: (
                <>
                  <b>坑:</b>lcm 千万别写成 <code>a * b / gcd</code> —— a×b
                  会先溢出。永远<b>先除后乘</b>:<code>a / gcd × b</code>
                  (gcd 一定整除 a,不丢精度)。注意强转的位置:
                  <code>(long) a</code> 在除法之前,整个表达式都在 64 位里算。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `import math

def gcd(a: int, b: int) -> int:
    while b:                 # iterative: no recursion stack, safer for large inputs
        a, b = b, a % b
    return a

# The standard library has both: math.gcd(a, b) and math.lcm(a, b) (3.9+)`,
              zh: `import math

def gcd(a: int, b: int) -> int:
    while b:                 # 迭代版:免递归栈,大数更稳
        a, b = b, a % b
    return a

# 标准库现成:math.gcd(a, b)、math.lcm(a, b)(3.9+),平时直接用`,
            },
            hl: [4, 5, 6],
            note: {
              en: (
                <>
                  <b>Convenience:</b> tuple unpacking{" "}
                  <code>a, b = b, a % b</code> performs the whole step in one line,
                  because the right side is evaluated before either assignment. From
                  Python 3.9 you can call <code>math.gcd</code> and{" "}
                  <code>math.lcm</code> directly, and both accept more than two
                  arguments.
                </>
              ),
              zh: (
                <>
                  <b>省心:</b>元组解包 <code>a, b = b, a % b</code>{" "}
                  一行完成辗转 —— 右侧先整体求值,再一起赋值。Python 3.9+ 直接调{" "}
                  <code>math.gcd</code> / <code>math.lcm</code>,还支持多参数。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// Recursive and short; inside the safe integer range there is no precision problem
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const lcm = (a, b) => (a / gcd(a, b)) * b;   // divide first, then multiply`,
              zh: `// 递归版,简洁;a、b 在安全整数范围内没有精度问题
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const lcm = (a, b) => (a / gcd(a, b)) * b;   // 先除后乘`,
            },
            hl: [2],
            note: {
              en: (
                <>
                  <b>Detail:</b> JavaScript has no integer type, but{" "}
                  <code>a % b</code> is exact for integers inside the safe range. If a
                  or b can exceed 2⁵³, switch to a BigInt version (
                  <code>b === 0n</code>, and so on).
                </>
              ),
              zh: (
                <>
                  <b>细节:</b>JS 没有整数类型,但 <code>a % b</code>{" "}
                  对安全范围内的整数完全精确;若 a、b 可能超 2⁵³,改用 BigInt 版(
                  <code>b === 0n</code> …)。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="story"
          title={{
            en: "Possibly the oldest algorithm still in daily use",
            zh: "它可能是人类还在用的最古老算法",
          }}
        >
          <p>
            <T
              en={
                <>
                  The Euclidean algorithm appears in Book VII of Euclid&apos;s
                  Elements, written around 300 BC. Twenty-three centuries later, the{" "}
                  <code>gcd</code> you write today is the same procedure. It is also
                  part of the base of modern cryptography: RSA key generation uses the{" "}
                  <b>extended Euclidean algorithm</b> to find modular inverses. The
                  extended version returns x and y with{" "}
                  <b>ax + by = gcd(a, b)</b>, and when gcd(a, b) = 1 that x is the
                  modular inverse of a modulo b — which is how you invert a value when
                  the modulus is not prime.
                </>
              }
              zh={
                <>
                  辗转相除法出现在欧几里得《几何原本》(约公元前 300 年)第七卷 ——
                  两千三百年过去,你今天写的 <code>gcd</code> 一字未改。
                  它还是现代密码学的地基:RSA 用<b>扩展欧几里得</b>求模逆元来生成密钥。
                  扩展版会给出满足 <b>ax + by = gcd(a, b)</b> 的 x、y;
                  当 gcd(a, b) = 1 时,这个 x 就是 a 在模 b 下的逆元 ——
                  模数不是质数时,就靠它求逆。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 精讲 A · 204 埃氏筛 ================= */}
      <Section
        id="sieve"
        index="03"
        title={{
          en: "Worked example A · The sieve: cross out instead of testing",
          zh: "精讲 A · 埃氏筛:与其试除,不如划掉",
        }}
        desc={{
          en: "LC 204 Count Primes — turning the question round takes O(n√n) down to O(n log log n)",
          zh: "LC 204 计数质数 —— 换个方向想,O(n√n) 变 O(n log log n)",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> count the primes below n. <b>Brute force:</b> for
                  each x, try dividing by every value from 2 to √x. One number costs
                  O(√x), so the total is about <BigO o="n" label="O(n√n)" />, which is
                  already slow at n = 10⁶.
                </>
              }
              zh={
                <>
                  <b>题意:</b>统计所有小于 n 的质数个数。<b>暴力:</b>对每个数 x,
                  试除 2 到 √x 看有没有因子 —— 判一个数 O(√x),总共约{" "}
                  <BigO o="n" label="O(n√n)" />,n = 10⁶ 时就吃力了。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>Why is √x enough?</b> If x = a × b and both factors were larger
                  than √x, then a × b would be larger than x, which is impossible. So
                  at least one of the two factors is at most √x. Any divisor above √x
                  always comes with a partner below it, and testing up to √x finds that
                  partner.
                </>
              }
              zh={
                <>
                  <b>为什么试除到 √x 就够?</b>若 x = a × b 且两个因子都大于 √x,
                  那么 a × b 就会大于 x,不可能。所以两个因子里至少有一个 ≤ √x。
                  大于 √x 的因子必然有一个小于 √x 的搭档,试除到 √x 就一定能撞到那个搭档。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>Turning it round:</b> deciding whether a single x is prime is slow,
                  but <strong>saying which numbers are composite is easy</strong> — a
                  composite is a multiple of some prime. So stop testing numbers one by
                  one. Instead,{" "}
                  <strong>take each prime and cross out all of its multiples</strong>,
                  and whatever is left is prime. This is the{" "}
                  <strong>sieve of Eratosthenes</strong>. Watch it find the primes below
                  30:
                </>
              }
              zh={
                <>
                  <b>换个方向:</b>判断「x 是不是质数」很慢,但
                  <strong>「谁是合数」却很好说</strong> —— 合数就是某个质数的倍数。
                  所以别去逐个盘问,反过来:
                  <strong>拿着每个质数,把它的倍数全划掉</strong>,划剩下的自然全是质数。
                  这就是<strong>埃拉托斯特尼筛法(Sieve of Eratosthenes,简称埃氏筛)</strong>。
                  亲眼看它怎么筛 30 以内的质数:
                </>
              }
            />
          </p>
        </div>
        <SieveGrid />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  The animation contains the two questions this problem is really
                  about. <strong>First, why does the marking start at i²?</strong> When
                  the sieve reaches the prime i, every multiple of i below i² has a
                  prime factor smaller than i, and that smaller prime already crossed
                  it out. Starting at i² skips all the repeated work.{" "}
                  <strong>Second, why does the outer loop only need to reach √n?</strong>{" "}
                  Every composite x ≤ n has a factor no larger than √x ≤ √n, so once
                  all the primes up to √n have swept the board, everything still
                  standing is prime.
                </>
              }
              zh={
                <>
                  动画里藏着两个「为什么」,都是本题的考点。
                  <strong>其一,为什么从 i² 开始划?</strong>处理质数 i 时,
                  比 i² 小的倍数(2i、3i…)都含有一个比 i 小的质因子,
                  早被那个更小的质数划过了 —— 从 i² 起步,跳过全部重复劳动。
                  <strong>其二,为什么外层只筛到 √n?</strong>任何合数 x ≤ n 必有一个
                  ≤ √x ≤ √n 的因子,所以只要所有 ≤ √n 的质数都清扫过一遍,
                  剩下的必是质数。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc204_count_primes"
          java={{
            code: {
              en: `class Solution {
    public int countPrimes(int n) {
        boolean[] notPrime = new boolean[n]; // notPrime[x] = x is composite
        int count = 0;
        for (int i = 2; i < n; i++) {        // runs to n because it also counts survivors
            if (notPrime[i]) continue;       // already crossed out, not prime
            count++;                          // i survived, so i is prime
            // Cross out multiples from i*i; use long so i*i cannot overflow int
            for (long j = (long) i * i; j < n; j += i) {
                notPrime[(int) j] = true;
            }
        }
        return count;
    }
}`,
              zh: `class Solution {
    public int countPrimes(int n) {
        boolean[] notPrime = new boolean[n]; // notPrime[x] = x 是合数
        int count = 0;
        for (int i = 2; i < n; i++) {        // 枚举到 n,是因为还要顺便计数
            if (notPrime[i]) continue;       // 已被划掉,不是质数
            count++;                          // i 幸存 → 质数
            // 从 i*i 起划它的倍数;用 long 保证 i*i 不溢出 int
            for (long j = (long) i * i; j < n; j += i) {
                notPrime[(int) j] = true;
            }
        }
        return count;
    }
}`,
            },
            hl: [9, 10],
            note: {
              en: (
                <>
                  <b>Trap:</b> when i approaches √(2³¹) ≈ 46341, <code>i * i</code>{" "}
                  overflows int and becomes negative, and the loop goes wrong.
                  Declaring j as <code>long</code>, or writing{" "}
                  <code>(long) i * i</code>, is the required guard. The outer loop runs
                  all the way to n only because it also counts the survivors; for i
                  above √n the inner loop body never executes.
                </>
              ),
              zh: (
                <>
                  <b>坑:</b>当 i 接近 √(2³¹) ≈ 46341 时,<code>i * i</code> 会溢出 int
                  成负数,循环直接失控。把 j 声明成 <code>long</code>、或写{" "}
                  <code>(long) i * i</code>,是必须的防溢出动作。外层之所以枚举到 n,
                  只是因为它还要顺手计数;i 超过 √n 后,内层循环体一次也不会执行。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def countPrimes(self, n: int) -> int:
        if n < 3:
            return 0
        is_prime = [True] * n
        is_prime[0] = is_prime[1] = False
        for i in range(2, int(n ** 0.5) + 1):   # only the primes up to sqrt(n) are needed
            if is_prime[i]:
                # slice assignment: cross out the whole run of multiples from i*i at once
                is_prime[i * i : n : i] = [False] * len(is_prime[i * i : n : i])
        return sum(is_prime)`,
              zh: `class Solution:
    def countPrimes(self, n: int) -> int:
        if n < 3:
            return 0
        is_prime = [True] * n
        is_prime[0] = is_prime[1] = False
        for i in range(2, int(n ** 0.5) + 1):   # 只需筛到 sqrt(n)
            if is_prime[i]:
                # 切片赋值:从 i*i 起一次性划掉整串倍数
                is_prime[i * i : n : i] = [False] * len(is_prime[i * i : n : i])
        return sum(is_prime)`,
            },
            hl: [7, 10],
            note: {
              en: (
                <>
                  <b>Idiomatic form:</b> the slice assignment{" "}
                  <code>is_prime[i*i : n : i] = [False] * k</code> crosses out a whole
                  run of multiples in one operation. It is much faster than a
                  Python-level for loop, because the slice is implemented in C.{" "}
                  <code>sum</code> over a list of booleans then counts the survivors.
                </>
              ),
              zh: (
                <>
                  <b>地道写法:</b>切片赋值{" "}
                  <code>is_prime[i*i : n : i] = [False] * k</code>{" "}
                  一口气划掉一整串倍数,比 Python 层的 for 循环快得多 ——
                  切片是 C 实现的。最后 <code>sum</code> 一个布尔列表就是统计幸存者。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var countPrimes = function (n) {
  const notPrime = new Uint8Array(n);   // 0 = still a candidate, 1 = composite; one byte each
  let count = 0;
  for (let i = 2; i < n; i++) {
    if (notPrime[i]) continue;
    count++;
    for (let j = i * i; j < n; j += i) notPrime[j] = 1;
  }
  return count;
};`,
              zh: `var countPrimes = function (n) {
  const notPrime = new Uint8Array(n);   // 0=质数候选,1=合数;每项只占一字节
  let count = 0;
  for (let i = 2; i < n; i++) {
    if (notPrime[i]) continue;
    count++;
    for (let j = i * i; j < n; j += i) notPrime[j] = 1;
  }
  return count;
};`,
            },
            hl: [7],
            note: {
              en: (
                <>
                  <b>Detail:</b> for n up to 5×10⁶, <code>i * i</code> stays below 2⁵³,
                  so Number is exact and BigInt is not needed.{" "}
                  <code>Uint8Array</code> stores one byte per entry instead of a full
                  JavaScript value, so it uses less memory and runs faster than a plain
                  array.
                </>
              ),
              zh: (
                <>
                  <b>细节:</b>n ≤ 5×10⁶ 时 <code>i * i</code> 不超过 2⁵³,
                  Number 精确,无需 BigInt。用 <code>Uint8Array</code>{" "}
                  而非普通数组:每项只占一字节,内存和速度都更好。
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
                  Time <b>O(n log log n)</b>, space O(n). Three common follow-ups. (1)
                  Where does log log n come from? Summing n/p over the primes p below n
                  gives about n·ln ln n. A frequent wrong answer here is O(n log n);
                  the real bound is smaller than that. (2) Can it be O(n)? Yes, with the{" "}
                  <b>linear sieve</b> (Euler&apos;s sieve): keep a list of primes and an
                  array of <b>smallest prime factors</b>, so every composite is crossed
                  out exactly once, by its smallest prime factor. The key line is to
                  break out of the inner loop as soon as{" "}
                  <code>i % prime == 0</code>. (3) What if you only need to test one
                  large number? Do not sieve — use the Miller-Rabin primality test.
                </>
              }
              zh={
                <>
                  时间 <b>O(n log log n)</b>,空间 O(n)。三个高频追问:①「log log n
                  怎么来的?」→ 把 n/p 对所有小于 n 的质数 p 求和 ≈ n·ln ln n;
                  常见的错答是 O(n log n),真实的界比它小。②「能到 O(n) 吗?」→{" "}
                  <b>线性筛(欧拉筛)</b>:维护质数表和<b>最小质因子</b>数组,
                  让每个合数只被它的最小质因子划恰好一次,关键是内层遇到{" "}
                  <code>i % prime == 0</code> 就 break。③「只判单个大数是不是质数?」→
                  别筛了,用 Miller-Rabin 素性测试。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="deep"
          title={{
            en: "In production: every HTTPS handshake",
            zh: "工程现场:你的每一次 HTTPS 握手",
          }}
        >
          <p>
            <T
              en={
                <>
                  Public-key systems such as RSA and Diffie-Hellman rest on one
                  asymmetry: finding two large primes is easy, and factoring their
                  product back is very hard. When a key is generated, the machine keeps
                  picking a large random number and running a primality test. At that
                  size the test is the probabilistic Miller-Rabin, not a sieve — you
                  cannot sieve numbers around 2²⁰⁴⁸. Trial division by small primes is
                  still used as a cheap pre-filter, and that is the sieve&apos;s idea of
                  removing multiples of small primes, applied to one number at a time.
                </>
              }
              zh={
                <>
                  RSA、Diffie-Hellman 这些公钥密码,安全性建立在一个不对称上:
                  找两个大质数很容易,把它们的乘积再分解回去却极难。生成密钥时,
                  机器就是不停地随机取大数、做素性测试。那个量级用的是概率性的
                  Miller-Rabin,而不是筛法 —— 2²⁰⁴⁸ 附近的数根本没法筛。
                  但「先用小质数试除」仍然是廉价的预筛步骤,
                  那正是埃氏筛「划掉小质数的倍数」的思想,只作用在一个数上。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 快速幂(盘) ================= */}
      <Section
        id="qpow"
        index="04"
        title={{
          en: "Fast power (review): from b multiplications down to log b",
          zh: "快速幂(复盘):把「乘 b 次」压成「乘 log b 次」",
        }}
        desc={{
          en: "The divide and conquer tool from chapter 02, this time with the modulus",
          zh: "第 2 章分治的老朋友,这次专攻它的取模变体",
        }}
        badge={{
          en: <span className="chip">Review · divide and conquer</span>,
          zh: <span className="chip">复盘 · 分治</span>,
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Computing a^b by multiplying b times is O(b), which is hopeless at b
                  = 10⁹. <strong>Fast exponentiation</strong> (also called binary
                  exponentiation), covered in the divide and conquer chapter, brings it
                  down to <strong>O(log b)</strong>. The identity is a^b = (a²)^(b/2):{" "}
                  <strong>square the base and halve the exponent</strong>.
                  Equivalently, read the binary digits of b, and for every digit that is
                  1, multiply the matching a^(2ᵏ) into the result. b has only log b
                  digits, so there are only log b squarings. Here we review the
                  companion it always has in number theory:{" "}
                  <strong>take the modulus after every multiplication</strong>.
                </>
              }
              zh={
                <>
                  算 a^b,老实乘 b 次是 O(b);b = 10⁹ 就没法看了。分治章教过的
                  <strong>快速幂(fast exponentiation / binary exponentiation)</strong>
                  把它压到 <strong>O(log b)</strong>:核心是 a^b = (a²)^(b/2),
                  <strong>底数不断平方、指数不断折半</strong>。等价地看 b 的二进制 ——
                  哪一位是 1,就把对应的 a^(2ᵏ) 乘进结果。b 只有 log b 位,
                  所以只需 log b 次平方。这里复盘它在数论里最常见的搭档:
                  <strong>边乘边取模</strong>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Why discuss the modulus here? Because §01 left one gap:{" "}
                  <strong>you cannot divide under a modulus</strong>, and fast power is
                  the tool that closes it. <strong>Fermat&apos;s little theorem</strong>{" "}
                  says that when m is <b>prime</b> and a is <b>not a multiple of m</b>,
                  a^(m−1) ≡ 1 (mod m). Multiply both sides by the inverse of a and you
                  get that the modular inverse of a is a^(m−2) mod m. So to compute (x ÷
                  a) % m, compute (x × a^(m−2)) % m instead — one call to fast power.
                  Both conditions matter. If m is not prime, this formula is wrong, and
                  you need the extended Euclidean algorithm from §02 instead.
                </>
              }
              zh={
                <>
                  为什么要在快速幂里专门讲取模?因为 §01 留了个尾巴:
                  <strong>取模不能做除法</strong>,而快速幂正是补上这个缺口的工具。
                  <strong>费马小定理</strong>说:当 m 是<b>质数</b>、a{" "}
                  <b>不是 m 的倍数</b>时,a^(m−1) ≡ 1 (mod m)。两边乘上 a 的逆元,
                  就得到 a 的模逆元 = a^(m−2) mod m。要算 (x ÷ a) % m,
                  就改算 (x × a^(m−2)) % m —— 一个快速幂搞定。
                  两个条件都不能省:m 不是质数时这条公式就是错的,
                  那时要用 §02 的扩展欧几里得。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="qpow_mod"
          java={{
            code: {
              en: `class Solution {
    static final int MOD = 1_000_000_007;

    // (a^b) % MOD in O(log b)
    long qpow(long a, long b) {
        long res = 1;
        a %= MOD;
        while (b > 0) {
            if ((b & 1) == 1) res = res * a % MOD; // this binary digit is 1: multiply it in
            a = a * a % MOD;                         // square the base
            b >>= 1;                                 // halve the exponent
        }
        return res;
    }

    // Modular inverse, valid only when MOD is prime and a is not a multiple of it
    long inverse(long a) {
        return qpow(a, MOD - 2);
    }
}`,
              zh: `class Solution {
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

    // 模逆元:仅当 MOD 为质数、且 a 不是它的倍数时成立(费马小定理)
    long inverse(long a) {
        return qpow(a, MOD - 2);
    }
}`,
            },
            hl: [9, 10],
            note: {
              en: (
                <>
                  <b>Trap:</b> res and a must be <code>long</code>. Two values near 10⁹
                  multiply to about 10¹⁸, which overflows int. Reduce immediately after
                  every multiplication so both stay inside the safe range. Note that{" "}
                  <code>res * a % MOD</code> means <code>(res * a) % MOD</code> — the
                  modulus applies to the product, not to one operand.
                </>
              ),
              zh: (
                <>
                  <b>坑:</b>res、a 必须是 <code>long</code> —— 两个约 10⁹ 的数相乘
                  ≈ 10¹⁸,int 直接溢出。每次乘完立刻取模,让它们始终待在安全区。
                  注意 <code>res * a % MOD</code> 的含义是{" "}
                  <code>(res * a) % MOD</code>,模作用在乘积上,不是某个操作数上。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `MOD = 10**9 + 7

def qpow(a: int, b: int, mod: int = MOD) -> int:
    res, a = 1, a % mod
    while b:
        if b & 1:
            res = res * a % mod
        a = a * a % mod
        b >>= 1
    return res

# The built-in three-argument pow is exactly "fast power with a modulus":
# pow(a, b, mod)           # = a^b % mod
# pow(a, -1, mod)          # = the modular inverse of a (3.8+, needs gcd(a, mod) == 1)`,
              zh: `MOD = 10**9 + 7

def qpow(a: int, b: int, mod: int = MOD) -> int:
    res, a = 1, a % mod
    while b:
        if b & 1:
            res = res * a % mod
        a = a * a % mod
        b >>= 1
    return res

# 内置的三参数 pow 就是「快速幂 + 取模」:
# pow(a, b, mod)           # = a^b % mod
# pow(a, -1, mod)          # = a 的模逆元(3.8+,要求 gcd(a, mod) == 1)`,
            },
            hl: [13, 14],
            note: {
              en: (
                <>
                  <b>Convenience:</b> <code>pow(a, b, mod)</code> is the built-in fast
                  power, implemented in C and much faster than a hand-written loop.{" "}
                  <code>pow(a, -1, mod)</code> (Python 3.8 and later) returns the
                  modular inverse directly, and it works for any modulus that is coprime
                  to a, not only for a prime one. Write the loop by hand in an
                  interview; call the built-in everywhere else.
                </>
              ),
              zh: (
                <>
                  <b>省心:</b><code>pow(a, b, mod)</code> 是内置快速幂,
                  C 实现、远快于手写循环;<code>pow(a, -1, mod)</code>(3.8+)
                  直接给模逆元,而且只要 a 与模数互质就行,不必是质数。
                  手写用于面试,平时直接调。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `const MOD = 1_000_000_007n;

// Modular fast power needs BigInt: a*a is about 10^18, far above the safe integer 2^53
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

const inverse = (a) => qpow(a, MOD - 2n);   // Fermat: MOD must be prime`,
              zh: `const MOD = 1_000_000_007n;

// 取模快速幂必须用 BigInt:a*a ≈ 10^18,远超安全整数 2^53
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

const inverse = (a) => qpow(a, MOD - 2n);   // 费马小定理:MOD 必须是质数`,
            },
            hl: [9, 10],
            note: {
              en: (
                <>
                  <b>Trap:</b> whenever modular multiplication is involved, use BigInt,
                  or a*a loses precision. BigInt and Number cannot appear in the same
                  arithmetic expression, so every constant needs the <code>n</code>{" "}
                  suffix (<code>1n</code>, <code>MOD - 2n</code>). BigInt division
                  truncates, which is another reason the inverse has to go through fast
                  power.
                </>
              ),
              zh: (
                <>
                  <b>坑:</b>只要涉及取模乘法,JS 一律用 BigInt,否则 a*a 丢精度。
                  BigInt 和 Number 不能出现在同一个算式里,常量都要带{" "}
                  <code>n</code>(如 <code>1n</code>、<code>MOD - 2n</code>)。
                  BigInt 的除法是截断除,这也是求逆元必须走快速幂的原因之一。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "The same skeleton computes matrices, not only numbers",
            zh: "它不只是求幂:同一个骨架能算矩阵",
          }}
        >
          <p>
            <T
              en={
                <>
                  Fast power is really this: for{" "}
                  <b>
                    any operation that is associative, split the count in binary and
                    turn n operations into log n
                  </b>
                  . Replace multiplication of numbers with multiplication of matrices
                  and you get <b>matrix fast power</b>, which gives an O(log n) solution
                  for Fibonacci and stair climbing (chapter 07 on DP sets this up) and
                  is fast enough for n = 10¹⁸. Any linear recurrence can be accelerated
                  the same way.
                </>
              }
              zh={
                <>
                  快速幂的本质是「
                  <b>对满足结合律的运算,用二进制拆分把 n 次操作压成 log n 次</b>」。
                  把「数的乘法」换成「矩阵乘法」,就是<b>矩阵快速幂</b>:
                  斐波那契 / 爬楼梯的 O(log n) 解法(第 7 章 DP 埋过这个伏笔),
                  n = 10¹⁸ 也能秒算。凡是线性递推,都能这么加速。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 精讲 B · 169 摩尔投票 ================= */}
      <Section
        id="moore"
        index="05"
        title={{
          en: "Worked example B · Boyer-Moore voting: let the majority appear on its own",
          zh: "精讲 B · 摩尔投票:让多数元素自己浮出来",
        }}
        desc={{
          en: "LC 169 Majority Element — O(1) space, from a single cancellation argument",
          zh: "LC 169 多数元素 —— O(1) 空间,靠一条「抵消论证」",
        }}
        badge={<span className="lc-badge" data-d="easy">EASY</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> one element appears{" "}
                  <strong>more than n/2 times</strong> (the statement guarantees it
                  exists); find it. <b>Brute force:</b> count with a hash map, O(n) time
                  but O(n) space; or sort and take the middle element, O(n log n). Both
                  are accepted. Neither is the best answer.
                </>
              }
              zh={
                <>
                  <b>题意:</b>数组里有个元素出现次数<strong>超过 n/2</strong>
                  (题目保证存在),找出它。<b>暴力:</b>哈希表计数,O(n) 时间但 O(n)
                  空间;或排序后取正中间那个,O(n log n)。都能过,但都不是最优答案。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>Can it be O(n) time and O(1) space?</b> Yes, with one{" "}
                  <strong>invariant</strong>. Keep a single{" "}
                  <strong>candidate</strong> and a single <strong>count</strong>. For
                  each value in turn: if it equals the candidate,{" "}
                  <strong>add 1</strong>; if it differs, <strong>subtract 1</strong>;
                  and when the count reaches 0, the next value becomes the candidate.
                  This is <strong>Boyer-Moore voting</strong>. Step through it:
                </>
              }
              zh={
                <>
                  <b>能不能 O(n) 时间、O(1) 空间?</b>能 —— 靠一个
                  <strong>不变量</strong>。只维护一个<strong>候选(candidate)</strong>
                  和一个<strong>计数(count)</strong>:逐个看每个值,
                  与候选<strong>相同就 +1</strong>、<strong>不同就 −1</strong>,
                  计数归零就让下一个值成为新候选。这叫
                  <strong>摩尔投票(Boyer-Moore Voting)</strong>。逐帧慢放:
                </>
              }
            />
          </p>
        </div>
        <MooreVote />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  <strong>Why is the value left at the end always the majority?</strong>{" "}
                  Read every −1 step as discarding a pair: one copy of the current
                  candidate and one copy of a different value are thrown away together.
                  So each −1 removes two values that are not equal. Now suppose one
                  value appears more than n/2 times. All the other values together
                  number fewer than n/2, so they run out before its copies do.{" "}
                  <strong>It cannot be paired away completely</strong>, so it is the
                  value that survives. That is the invariant that always holds.
                </>
              }
              zh={
                <>
                  <strong>为什么最后留下的一定是多数元素?</strong>
                  把每次 −1 读成「丢掉一对」:一个当前候选,加上一个与它不同的值,
                  一起被丢掉。所以每次 −1 都成对消掉两个不相等的值。
                  现在设某个值出现次数超过 n/2:其他所有值加起来不到 n/2,
                  会先被消光。<strong>它抵消不完</strong>,所以它一定是最后留下的那个。
                  这就是那个恒成立的不变量。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc169_majority_element"
          java={{
            code: {
              en: `class Solution {
    public int majorityElement(int[] nums) {
        int cand = 0, count = 0;
        for (int x : nums) {
            if (count == 0) cand = x;         // count is 0: take a new candidate
            count += (x == cand) ? 1 : -1;    // same value +1, different value -1
        }
        return cand;   // the statement guarantees a majority exists, so cand is the answer
    }
}`,
              zh: `class Solution {
    public int majorityElement(int[] nums) {
        int cand = 0, count = 0;
        for (int x : nums) {
            if (count == 0) cand = x;         // 计数归零,换候选
            count += (x == cand) ? 1 : -1;    // 同值 +1,异值 -1
        }
        return cand;   // 题目保证多数元素存在,cand 即答案
    }
}`,
            },
            hl: [5, 6],
            note: {
              en: (
                <>
                  <b>Requirement:</b> this code{" "}
                  <b>depends on the guarantee that a majority element exists</b>.
                  Without it, scan the array a second time, count how often cand really
                  appears, and check that the count is greater than n/2.
                </>
              ),
              zh: (
                <>
                  <b>前提:</b>这段代码<b>依赖「多数元素一定存在」</b>。若不保证,
                  最后要再扫一遍数组,数出 cand 的真实出现次数,验证它是否 &gt; n/2。
                </>
              ),
            },
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
            note: {
              en: (
                <>
                  <b>Compare:</b>{" "}
                  <code>collections.Counter(nums).most_common(1)</code> also gives the
                  answer in one line, but it uses O(n) space. The interview wants the
                  O(1) space version, and it wants you to state the invariant out loud.
                </>
              ),
              zh: (
                <>
                  <b>对照:</b><code>collections.Counter(nums).most_common(1)</code>{" "}
                  一行也能出答案,但那是 O(n) 空间。面试要的是摩尔投票的 O(1) 空间 ——
                  说得出不变量才算真懂。
                </>
              ),
            },
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
            note: {
              en: (
                <>
                  <b>One pass:</b> O(n) time and O(1) space, with no hash structure. It
                  also works for strings, and for objects as long as{" "}
                  <code>===</code> is the equality you want — for objects that compares
                  references, not contents.
                </>
              ),
              zh: (
                <>
                  <b>一趟扫描:</b>时间 O(n)、空间 O(1),不需要任何哈希结构。
                  元素是字符串也照样能用;是对象则要注意 <code>===</code>{" "}
                  比的是引用,不是内容。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and follow-up questions",
            zh: "复杂度 & 追问链",
          }}
        >
          <p>
            <T
              en={
                <>
                  Time <b>O(n)</b>, space <b>O(1)</b>. The classic extensions. (1) Find
                  all elements appearing more than n/3 times (LC 229). At most two
                  elements can, so <b>keep two candidates and two counts</b>, apply the
                  same rules, and verify both at the end. (2) More than n/k? Keep k−1
                  candidates; this is the Misra-Gries algorithm. (3) Why verify instead
                  of returning directly? When existence is not guaranteed, the scan
                  still returns some surviving candidate, and that candidate need not
                  appear more than n/2 times.
                </>
              }
              zh={
                <>
                  时间 <b>O(n)</b>、空间 <b>O(1)</b>。经典进阶:①「找出所有出现次数
                  &gt; n/3 的元素」(LC 229)→ 超过 n/3 的最多有 2 个,
                  <b>同时维护两个候选和两个计数</b>,规则照搬,最后再逐个验证;
                  ②「&gt; n/k 呢?」→ 维护 k−1 个候选(Misra-Gries 算法);
                  ③「为什么不能直接返回、要验证?」→ 不保证存在时,
                  摩尔投票仍会吐出一个幸存候选,它未必真过半。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="deep"
          title={{
            en: "In production: heavy hitters in a data stream",
            zh: "工程现场:流式数据里的「找大户」",
          }}
        >
          <p>
            <T
              en={
                <>
                  When you can read the data only once and cannot hold all of it in
                  memory — finding the IP address sending the most packets, or the most
                  frequent error code in a log — the generalisation of Boyer-Moore
                  voting is the standard answer. <b>Misra-Gries and Space-Saving</b>{" "}
                  keep a fixed number of counters and report the approximately most
                  frequent elements. This is the classic solution to the{" "}
                  <b>heavy hitters</b> problem. The cancellation idea, in O(1) space, is
                  what makes it possible.
                </>
              }
              zh={
                <>
                  在只能扫一遍、内存装不下全部数据的<b>流式场景</b>
                  (网络流量里找发包最多的 IP、日志里找最高频的错误码),
                  摩尔投票的推广版 <b>Misra-Gries / Space-Saving</b> 就是标准答案:
                  用固定几个计数槽,近似找出高频元素 —— 这正是
                  <b>Heavy Hitters(重击者)</b>问题的经典解。O(1)
                  空间的抵消思想,在真实系统里价值千金。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 下一个排列 31 ================= */}
      <Section
        id="perm"
        index="06"
        title={{
          en: "Next permutation: carrying in lexicographic order",
          zh: "下一个排列:字典序的进位规律",
        }}
        desc={{
          en: "LC 31 — no arithmetic at all, only a pattern about positions",
          zh: "LC 31 —— 没有一点数学,全是「位置」的规律",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> rearrange the array into the{" "}
                  <strong>next permutation in lexicographic order</strong>, that is,
                  the smallest arrangement that is still larger than the current one. If
                  it is already the largest, return the smallest.{" "}
                  <b>Brute force:</b> generate all n! permutations, sort them, and look
                  up the next one — already impossible at n = 10.{" "}
                  <b>The solution:</b> think of it as adding one to a number and
                  carrying. The pattern has four steps.
                </>
              }
              zh={
                <>
                  <b>题意:</b>把数组重排成<strong>字典序里的下一个排列</strong>,
                  也就是「比它大、且大得最少」的那个排列(若已是最大,则回到最小)。
                  <b>暴力:</b>生成全部 n! 个排列排序后找下一个 —— n = 10 就爆了。
                  <b>正解:</b>把它当成「给一个数做加一进位」来想,规律只有四步。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The intuition: if the{" "}
                  <strong>
                    suffix of a permutation is decreasing, that suffix is already its
                    own largest arrangement
                  </strong>
                  , so nothing inside it can grow and the increase has to come from the
                  position in front of it. So scan from the right for the first position
                  that breaks the decreasing run, replace its value with the smallest
                  value to its right that is still larger, and then make the right part
                  as small as possible by putting it in increasing order. Frame by
                  frame:
                </>
              }
              zh={
                <>
                  直觉:一个排列的
                  <strong>后缀如果是递减的,它就已经是那些数的最大排列</strong>,
                  内部没法再变大,只能靠它前面那一位「进位」。所以从右找到第一个
                  「打破递减」的位置,把它换成右边「仍比它大」的最小的数,
                  再把右边整段变成升序(该段的最小)。逐帧看:
                </>
              }
            />
          </p>
        </div>
        <ArrayStepper
          title={{
            en: "LC 31 · Next permutation ([1,3,5,4,2] → [1,4,2,3,5])",
            zh: "LC 31 · 下一个排列([1,3,5,4,2] → [1,4,2,3,5])",
          }}
          frames={NP_FRAMES}
          cellW={56}
        />
        <CodeTabs
          title="lc31_next_permutation"
          java={{
            code: {
              en: `class Solution {
    public void nextPermutation(int[] nums) {
        int n = nums.length, i = n - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) i--;   // 1. find the break i from the right
        if (i >= 0) {                                     // swap only if a break exists
            int j = n - 1;
            while (nums[j] <= nums[i]) j--;             // 2. first value > nums[i] from the right
            int t = nums[i]; nums[i] = nums[j]; nums[j] = t; // 3. swap
        }
        // 4. reverse the decreasing run after i, making it the smallest arrangement
        for (int l = i + 1, r = n - 1; l < r; l++, r--) {
            int t = nums[l]; nums[l] = nums[r]; nums[r] = t;
        }
    }
}`,
              zh: `class Solution {
    public void nextPermutation(int[] nums) {
        int n = nums.length, i = n - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) i--;   // 1. 从右找断点 i
        if (i >= 0) {                                     // 存在断点才需交换
            int j = n - 1;
            while (nums[j] <= nums[i]) j--;             // 2. 从右找首个 > nums[i]
            int t = nums[i]; nums[i] = nums[j]; nums[j] = t; // 3. 交换
        }
        // 4. 反转 i 之后的降序段,使它变成该段的最小排列
        for (int l = i + 1, r = n - 1; l < r; l++, r--) {
            int t = nums[l]; nums[l] = nums[r]; nums[r] = t;
        }
    }
}`,
            },
            hl: [4, 7, 8],
            note: {
              en: (
                <>
                  <b>Edge case:</b> if the whole array is decreasing, it is already the
                  largest permutation, and step 1 walks i down to −1. The swap is
                  skipped and the entire array is reversed, giving the smallest
                  permutation. That is exactly the wrap-around behavior the problem
                  asks for.
                </>
              ),
              zh: (
                <>
                  <b>边界:</b>若整个数组递减(已是最大排列),第 1 步的 i 会走到 −1,
                  跳过交换、直接反转全体 → 回到最小排列。这正是题目要的「循环」行为。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def nextPermutation(self, nums: list[int]) -> None:
        n = len(nums)
        i = n - 2
        while i >= 0 and nums[i] >= nums[i + 1]:   # 1. find the break
            i -= 1
        if i >= 0:
            j = n - 1
            while nums[j] <= nums[i]:              # 2. first larger value
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]    # 3. swap
        nums[i + 1:] = reversed(nums[i + 1:])      # 4. reverse the right part`,
              zh: `class Solution:
    def nextPermutation(self, nums: list[int]) -> None:
        n = len(nums)
        i = n - 2
        while i >= 0 and nums[i] >= nums[i + 1]:   # 1. 找断点
            i -= 1
        if i >= 0:
            j = n - 1
            while nums[j] <= nums[i]:              # 2. 找首个更大的
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]    # 3. 交换
        nums[i + 1:] = reversed(nums[i + 1:])      # 4. 反转右段`,
            },
            hl: [5, 12],
            note: {
              en: (
                <>
                  <b>Convenience:</b>{" "}
                  <code>nums[i+1:] = reversed(nums[i+1:])</code> reverses the right part
                  in one line. Slice assignment modifies the original list, which
                  matches the requirement to change the array in place and return
                  nothing.
                </>
              ),
              zh: (
                <>
                  <b>省心:</b><code>nums[i+1:] = reversed(nums[i+1:])</code>{" "}
                  一行原地反转右段。切片赋值直接改原列表 ——
                  契合本题「原地修改、不返回」的要求。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var nextPermutation = function (nums) {
  const n = nums.length;
  let i = n - 2;
  while (i >= 0 && nums[i] >= nums[i + 1]) i--;        // 1. find the break
  if (i >= 0) {
    let j = n - 1;
    while (nums[j] <= nums[i]) j--;                    // 2. first larger value
    [nums[i], nums[j]] = [nums[j], nums[i]];           // 3. swap
  }
  for (let l = i + 1, r = n - 1; l < r; l++, r--) {    // 4. reverse the right part
    [nums[l], nums[r]] = [nums[r], nums[l]];
  }
};`,
              zh: `var nextPermutation = function (nums) {
  const n = nums.length;
  let i = n - 2;
  while (i >= 0 && nums[i] >= nums[i + 1]) i--;        // 1. 找断点
  if (i >= 0) {
    let j = n - 1;
    while (nums[j] <= nums[i]) j--;                    // 2. 找首个更大的
    [nums[i], nums[j]] = [nums[j], nums[i]];           // 3. 交换
  }
  for (let l = i + 1, r = n - 1; l < r; l++, r--) {    // 4. 反转右段
    [nums[l], nums[r]] = [nums[r], nums[l]];
  }
};`,
            },
            hl: [4, 7, 8],
            note: {
              en: (
                <>
                  <b>Detail:</b> destructuring assignment{" "}
                  <code>[a, b] = [b, a]</code> evaluates the whole right side first, so
                  the swap and the reversal never overwrite each other. The whole
                  problem is O(n) time and O(1) space.
                </>
              ),
              zh: (
                <>
                  <b>细节:</b>解构赋值 <code>[a, b] = [b, a]</code>{" "}
                  是右边先整体求值,交换 / 反转都不会互相覆盖 —— 比临时变量清爽。
                  整题 O(n) 时间、O(1) 空间。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "In an interview, state the pattern before you write code",
            zh: "面试话术:先复述规律,再写代码",
          }}
        >
          <p>
            <T
              en={
                <>
                  For a pattern-finding problem, describe the rule first: &quot;The next
                  permutation: from the right, find the first position that can grow,
                  replace it with the smallest larger value from its right, then make
                  the right part as small as possible.&quot; Once the rule is clear, the
                  interviewer knows you understand it, and the code is only those
                  sentences turned into loops.{" "}
                  <b>
                    If you cannot state the rule, the code will not come out cleanly
                    either.
                  </b>
                </>
              }
              zh={
                <>
                  这类「找规律」题,开口别急着敲键盘。先说:「下一个排列 =
                  从右找第一个能变大的位,用右边仍比它大的最小的数替换,
                  再把右边归到最小。」—— 把规律讲清楚,面试官就知道你真懂了;
                  代码只是把这几句话翻译成循环。
                  <b>规律说不清的题,代码一定写得磕磕绊绊。</b>
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 精讲 C · 292 Nim 博弈 ================= */}
      <Section
        id="nim"
        index="07"
        title={{
          en: "Worked example C · Game theory: find the losing position",
          zh: "精讲 C · 博弈论:找到那个「必败态」",
        }}
        desc={{
          en: "LC 292 Nim Game — the general method is to build a table and read off an invariant",
          zh: "LC 292 Nim 游戏 —— 博弈题的通法,是打表猜出一个不变量",
        }}
        badge={<span className="lc-badge" data-d="easy">EASY</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> n stones on the table. You and your opponent take
                  turns removing 1 to 3 stones, and{" "}
                  <strong>the player who takes the last stone wins</strong>. Both play
                  perfectly and you move first. Can you win? <b>Brute force:</b> a game
                  search (minimax) over every possible move; the state space is O(n) and
                  it times out. <b>The solution:</b> the routine from §01 —{" "}
                  <strong>build a table, guess the pattern, prove it</strong>.
                </>
              }
              zh={
                <>
                  <b>题意:</b>桌上 n 颗石子,你和对手轮流拿,每次拿 1~3 颗,
                  <strong>拿到最后一颗的人赢</strong>。假设两人都绝顶聪明,你先手,能赢吗?
                  <b>暴力:</b>博弈搜索(minimax)—— 递归枚举每种拿法,状态 O(n),会 TLE。
                  <b>正解:</b>§01 的心法登场:
                  <strong>打表 → 猜规律 → 证明</strong>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Play the small cases. n = 1, 2, or 3: take them all, so{" "}
                  <strong>the first player wins</strong>. n = 4: whatever you take (1 to
                  3), you leave 1 to 3 stones for your opponent, who takes them all, so{" "}
                  <strong>the first player loses</strong>. n = 5, 6, or 7: take 1, 2, or
                  3 to leave exactly 4 — the losing position — for your opponent, so{" "}
                  <strong>the first player wins</strong>. n = 8: every move leaves 5, 6,
                  or 7, all winning positions for your opponent, so the first player
                  loses again. The pattern appears:{" "}
                  <strong>
                    the first player loses when n is a multiple of 4 and wins otherwise
                  </strong>
                  . The invariant is <strong>n % 4</strong>. Try it yourself — can you
                  escape from a losing position?
                </>
              }
              zh={
                <>
                  先手玩几个小的:n = 1/2/3,一把拿光,<strong>先手胜</strong>;
                  n = 4,你拿几颗(1~3)都会给对手留下 1~3 颗让他拿光,
                  <strong>先手败</strong>;n = 5/6/7,你可以拿掉 1/2/3 颗,
                  把那个「必败的 4」丢给对手,<strong>先手胜</strong>;
                  n = 8,又回到「怎么拿都给对手留下 5/6/7(对他都是必胜态)」的必败局……
                  规律浮出水面:<strong>n 是 4 的倍数时先手必败,否则必胜</strong>。
                  这里的不变量就是 <strong>n % 4</strong>。亲手验证 ——
                  你能在必败态下翻盘吗?
                </>
              }
            />
          </p>
        </div>
        <NimGame />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  <strong>Why does the invariant hold (proof by induction)?</strong>{" "}
                  Call a position <strong>losing</strong> when the number of stones left
                  is a multiple of 4 and it is your turn. (1) Base case: 0 stones and
                  your turn means the previous player took the last stone and you have
                  no move, so you lose — and 0 is a multiple of 4, which fits. (2)
                  Induction: if you face a multiple of 4 and take k stones (1 to 3), your
                  opponent takes <strong>4−k</strong> and the pile is a multiple of 4
                  again, handed back to you. Repeating this leaves you 0. In the other
                  direction, if n is not a multiple of 4, take{" "}
                  <strong>n % 4</strong> on the first move and your opponent faces a
                  losing position. So the answer is one line:
                </>
              }
              zh={
                <>
                  <strong>为什么这个不变量成立(归纳证明)?</strong>
                  定义「剩余是 4 的倍数、且轮到你走」为<strong>必败态</strong>。
                  ①出口:剩 0 颗轮到你 = 上一个人拿了最后一颗、你没得拿,你输 ——
                  而 0 是 4 的倍数,符合。②归纳:若你面对 4 的倍数,你拿 k 颗(1~3),
                  对手总能拿 <strong>4−k</strong> 颗,把剩余重新变回 4 的倍数丢还给你;
                  如此循环,直到把 0 留给你。反之,若 n 不是 4 的倍数,你首手拿掉{" "}
                  <strong>n % 4</strong> 颗,就把必败态甩给对手。所以答案一行:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc292_nim_game"
          java={{
            code: {
              en: `class Solution {
    public boolean canWinNim(int n) {
        return n % 4 != 0;   // facing a multiple of 4 loses, anything else wins
    }
}`,
              zh: `class Solution {
    public boolean canWinNim(int n) {
        return n % 4 != 0;   // 面对 4 的倍数必败,否则必胜
    }
}`,
            },
            hl: [3],
            note: {
              en: (
                <>
                  <b>The contrast:</b> a problem that looks like it needs a game search
                  comes down to one modulo. That is what finding the invariant buys you
                  — the hard part was never the code, it was seeing n % 4.
                </>
              ),
              zh: (
                <>
                  <b>反差:</b>一道看似要写博弈搜索的题,答案是一行取模。这就是
                  「找到不变量」的威力 —— 难的从来不是代码,是看穿 n % 4。
                </>
              ),
            },
          }}
          python={{
            code: `class Solution:
    def canWinNim(self, n: int) -> bool:
        return n % 4 != 0`,
            hl: [3],
            note: {
              en: (
                <>
                  <b>Generalisation:</b> this is a special case of the subtraction game
                  sometimes called Bash&apos;s game: when each move takes 1 to m stones,
                  the losing positions are the multiples of m+1. Here m = 3, which is
                  why the test is % 4. Remember the general form and a whole family of
                  problems follows.
                </>
              ),
              zh: (
                <>
                  <b>提醒:</b>这是「巴什博弈(Bash Game)」的特例:每次取 1~m 颗,
                  必败态是 (m+1) 的倍数。这里 m = 3,所以看 % 4。记住通式,一类题通吃。
                </>
              ),
            },
          }}
          js={{
            code: `var canWinNim = function (n) {
  return n % 4 !== 0;
};`,
            hl: [2],
            note: {
              en: (
                <>
                  <b>The real Nim:</b> LeetCode 292 is this subtraction game, not
                  classical Nim. Classical Nim has several piles, and the winner is
                  decided by the XOR of the pile sizes (the Sprague-Grundy theorem).
                  That is an advanced use of XOR from the bit-manipulation chapter.
                </>
              ),
              zh: (
                <>
                  <b>正牌 Nim:</b>LeetCode 292 其实是巴什博弈。真正的「Nim 游戏」
                  有多堆石子,胜负由各堆异或和(Sprague-Grundy 定理)决定 ——
                  那是位运算章异或的高阶应用。
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
                  The same &quot;find the invariant&quot; move clears a whole group of
                  game and pattern problems. Two relatives from this chapter&apos;s
                  problem set:
                </>
              }
              zh={
                <>
                  同一套「找不变量」的招式,横扫一堆博弈 / 找规律题。
                  挑两道本章题单里的近亲:
                </>
              }
            />
          </p>
        </div>
        <div className="mth-duel">
          <div className="card">
            <div className="card-kicker">
              <T
                en="Relative · LC 1025 Divisor Game"
                zh="近亲 · LC 1025 除数博弈"
              />
            </div>
            <div className="card-title">
              <b className="mono">
                <T en="Look at parity" zh="看奇偶" />
              </b>
            </div>
            <p>
              <T
                en={
                  <>
                    Players take turns replacing n by n − x, where x is a proper divisor
                    (<code>0 &lt; x &lt; n</code> and <code>n % x == 0</code>). A player
                    with no legal move <b>loses</b>. Building the table shows:{" "}
                    <b>the first player wins for even n and loses for odd n</b>. An even
                    n lets you subtract 1 and hand over an odd number, while every
                    divisor of an odd number is odd, so subtracting always produces an
                    even number. The invariant is the parity of n.
                  </>
                }
                zh={
                  <>
                    轮流把 n 减去它的一个真因子(<code>0 &lt; x &lt; n</code> 且{" "}
                    <code>n % x == 0</code>),轮到自己时<b>无法操作的人输</b>。
                    打表发现:<b>n 偶数先手胜、奇数先手败</b>。
                    因为偶数能减 1 把奇数丢给对手,而奇数的因子全是奇数、减完必变偶数。
                    不变量 = n 的奇偶。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T
                en="Relative · LC 319 Bulb Switcher"
                zh="近亲 · LC 319 灯泡开关"
              />
            </div>
            <div className="card-title">
              <b className="mono">
                <T en="Look at perfect squares" zh="看完全平方数" />
              </b>
            </div>
            <p>
              <T
                en={
                  <>
                    Bulb i is toggled once for each divisor of i. Divisors come in pairs,
                    d and i/d, so the count is even unless d = i/d, which happens only
                    for a <b>perfect square</b>. Only those bulbs are left on, and the
                    answer is ⌊√n⌋. The invariant is the parity of the number of
                    divisors.
                  </>
                }
                zh={
                  <>
                    第 i 个灯被拨的次数 = i 的因子个数。因子成对出现(d 与 i/d),
                    个数本该是偶数,除非 d = i/d —— 而这只在
                    <b>完全平方数</b>时发生。所以只有它们最终亮着,答案 = ⌊√n⌋。
                    不变量 = 因子个数的奇偶。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="story"
          title={{
            en: "The real Nim, and a theorem from 1901",
            zh: "真正的 Nim,和一个 1901 年的定理",
          }}
        >
          <p>
            <T
              en={
                <>
                  The multi-pile version of Nim was fully solved by the Harvard
                  mathematician Charles Bouton in 1901: take the <b>XOR</b> of the pile
                  sizes, and the first player wins exactly when the result is not 0. The
                  Sprague-Grundy theorem later extended this to{" "}
                  <b>every</b> impartial combinatorial game — each position gets a
                  Grundy number, and the outcome of the whole game is the XOR of the
                  Grundy numbers of its independent parts. A large part of combinatorial
                  game theory starts from this small game with stones.
                </>
              }
              zh={
                <>
                  多堆石子版的 Nim 由哈佛数学家 Charles Bouton 在 1901 年彻底破解:
                  把各堆数量<b>异或</b>起来,结果非 0 则先手必胜。后来
                  Sprague-Grundy 定理把它推广到<b>一切</b>公平组合游戏 ——
                  每个局面都能算出一个「Grundy 数」,整场游戏的胜负就是各独立子游戏
                  Grundy 数的异或。博弈论的半壁江山,起点就是这个拿石子的小游戏。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §08 快乐数 202 ================= */}
      <Section
        id="happy"
        index="08"
        title={{
          en: "Happy number: restating a number problem as cycle detection",
          zh: "快乐数:把数论问题,翻译成链表找环",
        }}
        desc={{
          en: "LC 202 — the useful step is seeing that this is a chain that can loop",
          zh: "LC 202 —— 关键不是算,是看穿「这是一条会成环的链」",
        }}
        badge={<span className="lc-badge" data-d="easy">EASY</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> repeatedly replace a number by the{" "}
                  <strong>sum of the squares of its digits</strong>. If it reaches 1,
                  the number is called <strong>happy</strong>. For example 19: 1²+9² =
                  82, then 8²+2² = 68, then 6²+8² = 100, then 1²+0²+0² = 1. Happy.
                </>
              }
              zh={
                <>
                  <b>题意:</b>反复把一个数换成它的<strong>各位平方和</strong>,
                  若最终变成 1 就叫<strong>快乐数</strong>。例如 19:1²+9² = 82 →
                  8²+2² = 68 → 6²+8² = 100 → 1²+0²+0² = 1,快乐。
                </>
              }
            />
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
            <T
              en={
                <>
                  The difficulty:{" "}
                  <strong>
                    a number that is not happy repeats forever and never reaches 1
                  </strong>
                  . Take 2:
                </>
              }
              zh={
                <>
                  麻烦在于:<strong>不快乐的数会陷入死循环,永远到不了 1</strong>。比如 2:
                </>
              }
            />
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
          <span className="mth-chain-loop">
            <T en="back at 4, so it is a cycle" zh="又回到 4,成环" />
          </span>
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <strong>The observation:</strong> treat &quot;the next number&quot; as
                  a pointer — every number points at the sum of the squares of its
                  digits. The whole process is then <strong>a linked list</strong>. For a
                  happy number the chain ends at 1, which you can read as 1 pointing to
                  itself. For an unhappy number the chain{" "}
                  <strong>comes back to a value it has already visited</strong>, forming
                  a cycle. So &quot;does this chain reach 1&quot; is the same question as{" "}
                  <strong>&quot;does this linked list contain a cycle&quot;</strong> —
                  which is the <strong>fast and slow pointer method (Floyd&apos;s cycle
                  detection)</strong> from DataData · 03. Move the slow pointer one step
                  and the fast pointer two steps: if they meet there is a cycle and the
                  number is not happy; if the fast pointer reaches 1 first, the number is
                  happy.
                </>
              }
              zh={
                <>
                  <strong>洞察:</strong>把「下一个数」看成一根指针 ——
                  每个数都指向它的「各位平方和」。于是整个过程就是
                  <strong>一条链表</strong>:快乐数的链终点是 1(可看成自环 1→1),
                  不快乐数的链最终<strong>绕回自己走过的数,形成环</strong>。
                  「判断这条链会不会到 1」= <strong>「判断链表有没有环」</strong> ——
                  正是 DataData · 03 链表章讲过的
                  <strong>快慢指针(Floyd 判圈)</strong>。慢指针一次走一步、
                  快指针一次走两步:两者相遇 ⇒ 有环 ⇒ 不快乐;快指针先到 1 ⇒ 快乐。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <strong>
                    Why must it either reach 1 or repeat, instead of growing forever?
                  </strong>{" "}
                  Because the sum of squared digits cannot run away. The largest
                  three-digit number is 999, and its sum of squares is 3 × 9² = 243,
                  which is smaller than 999. The more digits a number has, the further
                  the sum of squares falls behind it. So the value is quickly pushed into
                  the <strong>finite range [1, 243]</strong>. A walk that keeps moving
                  inside a finite set of states must, by the pigeonhole principle, either
                  hit 1 or repeat a value — and a repeat is a cycle. There is always an
                  outcome.
                </>
              }
              zh={
                <>
                  <strong>为什么一定会到 1 或成环、不会无限增大?</strong>
                  因为各位平方和不会失控:一个 3 位数最大是 999,平方和 3 × 9² = 243,
                  已经比 999 小;位数越多,平方和落后得越远。所以数值很快被压进{" "}
                  <strong>[1, 243] 这个有限区间</strong>。在有限个状态里一直走,
                  由鸽巢原理,要么撞上 1,要么撞上一个重复值(成环)—— 必有结局。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc202_happy_number"
          java={{
            code: {
              en: `class Solution {
    public boolean isHappy(int n) {
        int slow = n, fast = next(n);
        while (fast != 1 && slow != fast) { // stop at 1, or when the two meet (a cycle)
            slow = next(slow);              // one step
            fast = next(next(fast));        // two steps
        }
        return fast == 1;                   // reached 1 = happy; met = repeats forever
    }
    private int next(int x) {               // sum of squared digits = the next pointer
        int sum = 0;
        while (x > 0) { int d = x % 10; sum += d * d; x /= 10; }
        return sum;
    }
}`,
              zh: `class Solution {
    public boolean isHappy(int n) {
        int slow = n, fast = next(n);
        while (fast != 1 && slow != fast) { // 快到 1,或快慢相遇(成环)就停
            slow = next(slow);              // 慢走一步
            fast = next(next(fast));        // 快走两步
        }
        return fast == 1;                   // 到 1 = 快乐;相遇 = 永远循环
    }
    private int next(int x) {               // 各位平方和 = 链表的 next 指针
        int sum = 0;
        while (x > 0) { int d = x % 10; sum += d * d; x /= 10; }
        return sum;
    }
}`,
            },
            hl: [4, 5, 6],
            note: {
              en: (
                <>
                  <b>Two versions:</b> the two-pointer version uses O(1) extra space. A
                  more direct version stores every value seen in a{" "}
                  <code>HashSet</code>, where a repeat means a cycle, at the cost of
                  O(k) space. Naming Floyd&apos;s cycle detection in an interview is the
                  stronger answer.
                </>
              ),
              zh: (
                <>
                  <b>两种写法:</b>快慢指针 O(1) 空间;更直观的是用{" "}
                  <code>HashSet</code> 记录见过的数,重复出现即成环 —— 代价是 O(k)
                  空间。面试报「Floyd 判圈」更亮眼。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def isHappy(self, n: int) -> bool:
        def nxt(x: int) -> int:
            return sum(int(c) ** 2 for c in str(x))   # sum of squared digits

        slow, fast = n, nxt(n)
        while fast != 1 and slow != fast:
            slow = nxt(slow)
            fast = nxt(nxt(fast))
        return fast == 1`,
              zh: `class Solution:
    def isHappy(self, n: int) -> bool:
        def nxt(x: int) -> int:
            return sum(int(c) ** 2 for c in str(x))   # 各位平方和

        slow, fast = n, nxt(n)
        while fast != 1 and slow != fast:
            slow = nxt(slow)
            fast = nxt(nxt(fast))
        return fast == 1`,
            },
            hl: [7, 8, 9],
            note: {
              en: (
                <>
                  <b>Shortcut:</b> <code>str(x)</code> is the shortest way to split the
                  digits. For speed, use a <code>divmod(x, 10)</code> loop instead. The
                  hash-set version is{" "}
                  <code>seen = set()</code> then{" "}
                  <code>while n != 1 and n not in seen: ...</code>.
                </>
              ),
              zh: (
                <>
                  <b>取巧:</b><code>str(x)</code> 拆位最省事;追求性能可换成{" "}
                  <code>divmod(x, 10)</code> 循环。哈希集合版:
                  <code>seen = set()</code>,然后{" "}
                  <code>while n != 1 and n not in seen: ...</code>。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var isHappy = function (n) {
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
              zh: `var isHappy = function (n) {
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
            },
            hl: [7, 8, 9, 10],
            note: {
              en: (
                <>
                  <b>Detail:</b> the digit split uses{" "}
                  <code>x = (x - d) / 10</code> to stay on whole numbers, because{" "}
                  <code>/</code> in JavaScript is floating-point division; subtracting
                  the last digit first keeps the result exact. All the values stay small,
                  so BigInt is not needed.
                </>
              ),
              zh: (
                <>
                  <b>细节:</b>拆位用 <code>x = (x - d) / 10</code> 保证结果是整数
                  (JS 的 <code>/</code> 是浮点除,先减掉个位再除才干净);
                  数字全在安全范围,无需 BigInt。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="idea"
          title={{
            en: "The same trick: “can this loop” is a whole family of problems in disguise",
            zh: "举一反三:「会不会成环」是一整类问题的伪装",
          }}
        >
          <p>
            <T
              en={
                <>
                  Whenever a process has the property that the current state alone
                  decides the next state, it is a hidden linked list, and the question
                  &quot;does it enter a loop&quot; can be answered with two pointers at
                  different speeds. LC 202 Happy Number, LC 287 Find the Duplicate Number
                  (where nums[i] is read as the next pointer), and detecting the period
                  of an iterated function are all the same Floyd cycle detection.{" "}
                  <b>Recognising the disguise is worth more than memorising the
                  algorithm.</b>
                </>
              }
              zh={
                <>
                  一旦某个过程是「当前状态唯一决定下一个状态」,它就是一条隐形链表,
                  「会不会陷入循环」就能用快慢指针破解。LC 202 快乐数、LC 287 寻找重复数
                  (把 nums[i] 当 next 指针)、检测函数迭代的周期……底层都是同一招
                  Floyd 判圈。<b>看穿伪装,比记住算法更值钱。</b>
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
          en: "Problem set: 13 problems on maths and number theory",
          zh: "高频题单:数学与数论 13 题",
        }}
        desc={{
          en: "Grouped by pattern finding, modular arithmetic, and game theory, easy to hard. Think for 30 seconds before opening the hint.",
          zh: "按「找规律 / 取模防溢出 / 博弈」分层,由易到难。先想 30 秒再看提示",
        }}
        badge={{
          en: <span className="chip">Core + optional</span>,
          zh: <span className="chip">主线 + 选做</span>,
        }}
      >
        <ProblemSet ch="math" items={PROBLEMS} />
      </Section>

      {/* ================= §10 Quiz ================= */}
      <Section
        id="quiz"
        index="10"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Get all 8 right to mark this chapter complete.",
          zh: "8 题全对,点亮本章绿灯",
        }}
        badge={{
          en: <span className="chip">✎ Quiz</span>,
          zh: <span className="chip">✎ 通关测验</span>,
        }}
      >
        <Quiz ch="math" items={QUIZ} />
      </Section>

      <KeyPoints
        points={{
          en: [
            <>
              The core of this chapter:{" "}
              <b>
                interview maths problems test whether you can find an invariant or a
                pattern
              </b>
              . The routine is <b>build a table (compute a few small cases) → guess the
              pattern or invariant → prove it by induction</b>.
            </>,
            <>
              Modulus rules: addition, subtraction, and multiplication{" "}
              <b>can all be reduced as you compute</b>, because the modulus distributes
              over them. <b>Division cannot</b> — it needs a modular inverse. The rule
              is <b>reduce at every step</b>, never only at the end, because by then the
              intermediate value has already overflowed.
            </>,
            <>
              Why 10⁹+7: <b>large enough, prime (so inverses exist), and its square
              still fits in a 64-bit long</b>. Java overflows silently, JavaScript loses
              precision above 2⁵³ (use BigInt), Python has unbounded integers but still
              reduces to keep values small. Negative <code>%</code> also differs: Java
              and JavaScript follow the sign of the dividend, Python follows the divisor.
            </>,
            <>
              gcd(a, b) = gcd(b, a % b), because both pairs have exactly the same common
              divisors, and it finishes in <b>O(log min(a, b))</b> steps. lcm(a, b) = a /
              gcd × b, <b>dividing first</b> to avoid overflow. The sieve marks multiples{" "}
              <b>from i² and only needs i up to √n</b>, giving O(n log log n). Fast power
              is <b>O(log b)</b> and, with Fermat&apos;s little theorem, gives modular
              inverses <b>when the modulus is prime</b>.
            </>,
            <>
              Boyer-Moore voting: the <b>cancellation argument</b> finds the majority
              element in O(1) space — provided a majority element{" "}
              <b>really exists</b>. If that is not guaranteed, verify the candidate with
              a second pass.
            </>,
            <>
              Game problems: find the losing position. Nim uses <b>n % 4</b>, the divisor
              game uses <b>parity</b>, the bulb problem uses{" "}
              <b>perfect squares</b>. Once you know who faces the losing position, the
              problem collapses into one line.
            </>,
            <>
              Two useful restatements: next permutation is{" "}
              <b>carrying in lexicographic order</b> (find the break → swap in the
              smallest larger value → reverse the right part); happy number is{" "}
              <b>cycle detection in a linked list</b> (the next function is the pointer,
              and two pointers at different speeds find the cycle).
            </>,
          ],
          zh: [
            <>
              本章灵魂:<b>数学题不考数学,考的是找不变量 / 规律</b>。通用套路 ——
              <b>打表(算几个小例子)→ 猜规律 / 不变量 → 归纳证明</b>。
            </>,
            <>
              取模三律:加、减、乘<b>都可以边算边模</b>(分配律),<b>除法不行</b>
              (要用模逆元)。铁律是<b>边算边模</b>,绝不「算完再模」——
              那时中间结果早溢出了。
            </>,
            <>
              为什么用 10⁹+7:<b>够大、是质数(能求逆元)、平方后不爆 64 位 long</b>。
              Java 静默溢出、JS 超 2⁵³ 丢精度(上 BigInt)、Python 无上限但仍要取模压小。
              负数取模也不同:Java / JS 取被除数符号,Python 取除数符号。
            </>,
            <>
              gcd(a, b) = gcd(b, a % b)(两组的公约数集合完全相同),步数{" "}
              <b>O(log min(a, b))</b>;lcm(a, b) = a / gcd × b,<b>先除后乘</b>防溢出。
              埃氏筛<b>从 i² 起划、i 只需到 √n</b>,O(n log log n)。快速幂{" "}
              <b>O(log b)</b>,配费马小定理可求模逆元 —— 但<b>要求模数是质数</b>。
            </>,
            <>
              摩尔投票:<b>抵消论证</b>,O(1) 空间找多数元素 —— 前提是多数元素
              <b>确实存在</b>,否则要回头验证候选。
            </>,
            <>
              博弈找必败态:Nim 看 <b>n % 4</b>、除数博弈看<b>奇偶</b>、
              灯泡开关看<b>完全平方数</b>。找到「谁面对必败态」,题目就塌成一行。
            </>,
            <>
              两个万能改述:下一个排列 = <b>字典序进位规律</b>
              (找断点 → 换上仍更大的最小数 → 反转右段);快乐数 ={" "}
              <b>链表找环</b>(next 函数当指针,快慢指针判圈)。
            </>,
          ],
        }}
      />

      <ChapterFooter ch="math" />
    </main>
  );
}
