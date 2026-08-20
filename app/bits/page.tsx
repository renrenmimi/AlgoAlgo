"use client";

// 第 4 章 · 位运算 —— 二进制/补码 → 六运算符 → 技巧表(n&(n-1)/lowbit/异或性质)
// → 位运算表示集合(状压 DP 前置)→ 移位乘除。
// 三个交互实验室在 ./viz(BitLamps 32 盏位灯 / OpLab 运算符 / SubsetLab 集合);
// 异或抵消用 ArrayStepper,逐位统计用 DPTable,帧数据写在本文件顶部。
//
// 双语:正文用 <T en zh />;组件的文案型 props 传 { en, zh }。
// CodeTabs 的 code 也给两份 —— 两份之间只有注释不同,可执行代码逐行一致(hl 行号才对得上)。

import "./chapter.css";
import type { ReactNode } from "react";
import { Hero, Section, Callout, BigO, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { ArrayStepper, type ArrayFrame, type ArrayCell } from "@/lib/stepper";
import { DPTable, type DPFrame, type DPCell } from "@/lib/algviz";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { T } from "@/lib/i18n";
import { PROBLEMS, QUIZ } from "@/lib/bits-data";
import { BitLamps, OpLab, SubsetLab } from "./viz";

/* ================= 精讲 A · LC 136 全体异或(ArrayStepper) ================= */

type ACellState = "lit" | "ok" | "bad" | "ghost";
function ac(v: ReactNode, state?: ACellState): ArrayCell {
  return { v, state };
}

const F_XOR: ArrayFrame[] = [
  {
    cells: [ac(4), ac(1), ac(2), ac(1), ac(2)],
    msg: (
      <T
        en={
          <>
            The array is [4, 1, 2, 1, 2]. Every value appears twice except 4. The
            plan is to make each pair cancel itself. The running XOR value{" "}
            <code>acc</code> starts at <b>0</b>.
          </>
        }
        zh={
          <>
            数组 [4, 1, 2, 1, 2]:除了 4,其它都出现两次。目标是让每一对数自己抵消掉。
            异或累加器 <code>acc</code> 从 <b>0</b> 出发。
          </>
        }
      />
    ),
  },
  {
    cells: [ac(4, "lit"), ac(1), ac(2), ac(1), ac(2)],
    ptrs: [{ i: 0, label: "acc" }],
    msg: (
      <T
        en={
          <>
            acc = 000 ^ <b>100</b> = <b>100</b> = 4. Because a ^ 0 = a, the first
            value goes in unchanged.
          </>
        }
        zh={
          <>
            acc = 000 ^ <b>100</b> = <b>100</b> = 4。因为 a ^ 0 = a,
            第一个数原样装了进来。
          </>
        }
      />
    ),
  },
  {
    cells: [ac(4, "ok"), ac(1, "lit"), ac(2), ac(1), ac(2)],
    ptrs: [{ i: 1, label: "acc" }],
    msg: (
      <T
        en={
          <>
            acc = 100 ^ <b>001</b> = <b>101</b> = 5. Bit 0 differed, so it flipped
            to 1.
          </>
        }
        zh={
          <>
            acc = 100 ^ <b>001</b> = <b>101</b> = 5。第 0 位两边不同,翻成了 1。
          </>
        }
      />
    ),
  },
  {
    cells: [ac(4, "ok"), ac(1, "ok"), ac(2, "lit"), ac(1), ac(2)],
    ptrs: [{ i: 2, label: "acc" }],
    msg: (
      <T
        en={
          <>
            acc = 101 ^ <b>010</b> = <b>111</b> = 7. Bit 1 differed, so it flipped
            to 1.
          </>
        }
        zh={
          <>
            acc = 101 ^ <b>010</b> = <b>111</b> = 7。第 1 位两边不同,翻成了 1。
          </>
        }
      />
    ),
  },
  {
    cells: [ac(4, "ok"), ac(1, "ghost"), ac(2, "ok"), ac(1, "lit"), ac(2)],
    ptrs: [{ i: 3, label: "acc" }],
    msg: (
      <T
        en={
          <>
            acc = 111 ^ <b>001</b> = <b>110</b> = 6. This is the second 1. Bit 0
            was set by the first 1, and XORing 1 into it again turns it back to 0.
            The two 1s have <b>cancelled</b>.
          </>
        }
        zh={
          <>
            acc = 111 ^ <b>001</b> = <b>110</b> = 6。这是第二个 1:
            第 0 位本来被第一个 1 置成了 1,再异或一次 1 又变回 0 ——
            两个 1 就此<b>抵消</b>。
          </>
        }
      />
    ),
  },
  {
    cells: [ac(4, "ok"), ac(1, "ghost"), ac(2, "ghost"), ac(1, "ghost"), ac(2, "lit")],
    ptrs: [{ i: 4, label: "acc" }],
    msg: (
      <T
        en={
          <>
            acc = 110 ^ <b>010</b> = <b>100</b> = 4. The two 2s cancel the same
            way, on bit 1.
          </>
        }
        zh={
          <>
            acc = 110 ^ <b>010</b> = <b>100</b> = 4。两个 2 在第 1 位上同样抵消了。
          </>
        }
      />
    ),
  },
  {
    cells: [ac(4, "ok"), ac(1, "ghost"), ac(2, "ghost"), ac(1, "ghost"), ac(2, "ghost")],
    msg: (
      <T
        en={
          <>
            Both pairs are gone and acc = <b>100 = 4</b>, the value that appears
            once. One pass and one variable: <b>O(n) time and O(1) space</b>.
          </>
        }
        zh={
          <>
            两对数都归零了,只剩 acc = <b>100 = 4</b> —— 正是那个只出现一次的数。
            一趟遍历、一个变量:<b>O(n) 时间、O(1) 空间</b>。
          </>
        }
      />
    ),
  },
];

/* ================= 精讲 B · LC 191 n&(n-1) 消 1(ArrayStepper) ================= */
// 左起为第 0 位(LSB 在左),cell 下方的下标正好是位号。

const P13 = [1, 0, 1, 1, 0, 0, 0, 0]; // 13 = 1101
const P12 = [0, 0, 1, 1, 0, 0, 0, 0]; // 12 = 1100
const P8 = [0, 0, 0, 1, 0, 0, 0, 0]; //  8 = 1000
const P0 = [0, 0, 0, 0, 0, 0, 0, 0];

function popCells(bits: number[], hot?: number): ArrayCell[] {
  return bits.map((b, i): ArrayCell => ({
    v: b,
    state: i === hot ? "bad" : b ? "lit" : "ghost",
  }));
}

const F_POP: ArrayFrame[] = [
  {
    cells: popCells(P13),
    msg: (
      <T
        en={
          <>
            n = 13, which is <b>1101</b> in the usual notation. The lamps below run
            the other way round: <b>bit 0 is on the left</b> and the number under
            each lamp is its bit position. Count how many 1 bits there are.
            count = 0.
          </>
        }
        zh={
          <>
            n = 13,按通常写法是 <b>1101</b>。下面这排灯的方向相反:
            <b>第 0 位在最左边</b>,每盏灯下面的数字就是它的位号。
            现在要数它有几个 1。count = 0。
          </>
        }
      />
    ),
  },
  {
    cells: popCells(P13, 0),
    ptrs: [{ i: 0, label: "lowbit" }],
    msg: (
      <T
        en={
          <>
            The lowest 1 bit sits at <b>bit 0</b>. One step of n = n &amp; (n−1)
            clears it, so n becomes 12 and count = <b>1</b>.
          </>
        }
        zh={
          <>
            最低位的 1 在<b>第 0 位</b>。做一次 n = n &amp; (n−1) 把它清零,
            n 变成 12,count = <b>1</b>。
          </>
        }
      />
    ),
  },
  {
    cells: popCells(P12, 2),
    ptrs: [{ i: 2, label: "lowbit" }],
    msg: (
      <T
        en={
          <>
            n is now 12, which is 1100. Bit 0 went out and the higher bits did not
            move. The lowest 1 bit is now at <b>bit 2</b>. Another n &amp; (n−1)
            gives n = 8 and count = <b>2</b>.
          </>
        }
        zh={
          <>
            n 变成 12,也就是 1100:第 0 位被清掉,更高位一动没动。
            现在最低位的 1 在<b>第 2 位</b>。再做一次 n &amp; (n−1),
            n = 8,count = <b>2</b>。
          </>
        }
      />
    ),
  },
  {
    cells: popCells(P8, 3),
    ptrs: [{ i: 3, label: "lowbit" }],
    msg: (
      <T
        en={
          <>
            n is now 8, which is 1000. Only one lamp is left, at <b>bit 3</b>.
            Clearing it gives n = 0 and count = <b>3</b>.
          </>
        }
        zh={
          <>
            n 变成 8,也就是 1000,只剩<b>第 3 位</b>一盏灯。
            清掉它,n = 0,count = <b>3</b>。
          </>
        }
      />
    ),
  },
  {
    cells: popCells(P0),
    msg: (
      <T
        en={
          <>
            n reached 0 and the loop stops. It ran <b>3</b> times, and 13 has
            exactly <b>3</b> one bits. The number of iterations equals the number
            of 1 bits, <b>not a fixed 32</b>. A number with few 1 bits empties in
            a few steps.
          </>
        }
        zh={
          <>
            n 归 0,循环停止。一共做了 <b>3</b> 次,而 13 里正好有 <b>3</b> 个 1。
            循环次数等于 1 的个数,<b>而不是固定 32 次</b> —— 1 很少的数几步就清空了。
          </>
        }
      />
    ),
  },
];

/* ================= 精讲 C · LC 137 逐位统计(DPTable) ================= */
// nums = [2, 2, 2, 7],每列一位,统计 1 的总数 % 3 = 落单数在该位的值。

const N137 = [
  { lab: "2", bits: [0, 1, 0] },
  { lab: "2", bits: [0, 1, 0] },
  { lab: "2", bits: [0, 1, 0] },
  { lab: "7", bits: [1, 1, 1] },
];
const SUM137 = [1, 4, 1]; // 每位 1 的总数
const MOD137 = [1, 1, 1]; // % 3 → 111 = 7

function cells137(upto: number, cur?: number, final = false): DPCell[][] {
  const rows: DPCell[][] = N137.map((r) =>
    r.bits.map((b, c): DPCell => ({ v: b, state: cur === c ? "src" : "done" })),
  );
  const sumRow: DPCell[] = SUM137.map((v, c): DPCell =>
    c < upto ? { v, state: "done" } : c === cur ? { v, state: "cur" } : { v: "?", state: "ghost" },
  );
  const modRow: DPCell[] = MOD137.map((v, c): DPCell =>
    c < upto
      ? { v, state: final ? "ok" : "done" }
      : c === cur
        ? { v, state: "cur" }
        : { v: "?", state: "ghost" },
  );
  return [...rows, sumRow, modRow];
}

const F_137: DPFrame[] = [
  {
    cells: cells137(0),
    msg: (
      <T
        en={
          <>
            nums = [2, 2, 2, 7]. Each number is written in binary as one row, so
            each column is one bit position. The plan is to work{" "}
            <b>column by column and count the 1 bits in that column</b>. The Σ and
            %3 rows are still unknown.
          </>
        }
        zh={
          <>
            nums = [2, 2, 2, 7]:每个数按二进制写成一行,于是每一列就是一个二进制位。
            做法是<b>逐列统计该位上 1 的总数</b>。Σ 与 %3 两行还是问号。
          </>
        }
      />
    ),
  },
  {
    cells: cells137(0, 0),
    msg: (
      <T
        en={
          <>
            Bit 2: the three 2s all have 0 here and 7 has 1, so Σ = <b>1</b> and
            1 % 3 = <b>1</b>. A number that appears three times contributes either
            0 or 3 to a column, and both are multiples of 3, so it{" "}
            <b>disappears</b> after % 3.
          </>
        }
        zh={
          <>
            第 2 位:三个 2 在这里都是 0,7 是 1,所以 Σ = <b>1</b>,1 % 3 = <b>1</b>。
            出现 3 次的数在一列里要么贡献 0、要么贡献 3,都是 3 的倍数,
            取模后<b>自动消失</b>。
          </>
        }
      />
    ),
  },
  {
    cells: cells137(1, 1),
    msg: (
      <T
        en={
          <>
            Bit 1: each of the three 2s has 1 here (3 in total) and 7 has 1, so
            Σ = <b>4</b> and 4 % 3 = <b>1</b>. The 3 contributed by the 2s divides
            out exactly, and only the 1 contributed by 7 is left.
          </>
        }
        zh={
          <>
            第 1 位:三个 2 在这里各是 1(共 3),7 也是 1,所以 Σ = <b>4</b>,
            4 % 3 = <b>1</b>。三个 2 贡献的 3 被整除干净,只剩 7 贡献的那个 1。
          </>
        }
      />
    ),
  },
  {
    cells: cells137(2, 2),
    msg: (
      <T
        en={
          <>
            Bit 0: the three 2s all have 0 here and 7 has 1, so Σ = <b>1</b> and
            %3 = <b>1</b>.
          </>
        }
        zh={
          <>
            第 0 位:三个 2 都是 0,7 是 1,所以 Σ = <b>1</b>,%3 = <b>1</b>。
          </>
        }
      />
    ),
  },
  {
    cells: cells137(3, undefined, true),
    msg: (
      <T
        en={
          <>
            Read the %3 row from the highest bit to the lowest: <b>111 = 7</b>,
            the value that appears once. The same &quot;count per bit, then take
            the remainder modulo k&quot; method solves every variant where the
            other numbers appear <b>k</b> times.
          </>
        }
        zh={
          <>
            把 %3 行从高位到低位读出来:<b>111 = 7</b>,正是那个只出现一次的数。
            同一套「逐位统计后对 k 取模」能解「其它数都出现 <b>k</b> 次」的所有变体。
          </>
        }
      />
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "why", n: "01", label: { en: "Binary & two's complement", zh: "二进制与补码" } },
  { id: "ops", n: "02", label: { en: "Six operators", zh: "六大运算符" } },
  { id: "xor", n: "03", label: { en: "XOR · LC 136", zh: "异或 · LC 136" } },
  { id: "tricks", n: "04", label: { en: "Bit tricks · LC 191", zh: "技巧表 · LC 191" } },
  { id: "count", n: "05", label: { en: "Count per bit · LC 137", zh: "逐位统计 · LC 137" } },
  { id: "set", n: "06", label: { en: "An integer as a set", zh: "位表示集合" } },
  { id: "shift", n: "07", label: { en: "Shifting", zh: "移位乘除" } },
  { id: "problems", n: "08", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "09", label: { en: "Quiz", zh: "通关测验" } },
];

export default function BitsChapter() {
  return (
    <main className="page" data-ch="bits">
      <Hero
        ch="bits"
        title={{
          en: (
            <>
              Bit <span className="grad">manipulation</span>
            </>
          ),
          zh: (
            <>
              位运算 <span className="grad">Bit Manipulation</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A 32-bit integer is <strong>32 switches</strong>, each one either 0
              or 1. AND, OR, NOT and XOR change those switches directly, one
              position at a time. This chapter lays an integer out as a row of
              lamps so you can see how the value is stored, including negative
              values. It then covers the few bit patterns that appear in almost
              every interview problem, and sets up the state compression DP of
              chapter 10.
            </>
          ),
          zh: (
            <>
              一个 32 位整数就是 <strong>32 个开关</strong>,每个非 0 即 1。
              与、或、非、异或直接改这些开关,而且每一位各改各的。
              本章把整数摊平成一排灯,让你看清数值(包括负数)到底是怎么存的,
              再讲透几乎每道面试题都会用到的那几个位运算套路,
              并为第 10 章的状压 DP 打好地基。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 二进制与补码 ================= */}
      <Section
        id="why"
        index="01"
        title={{
          en: "One int is 32 lamps: binary and two's complement",
          zh: "一个 int = 32 盏灯:二进制与补码",
        }}
        desc={{
          en: "Lay an integer out as a row of switches, then see how negative values fit in",
          zh: "先把整数摊平成一排开关,再搞懂负数是怎么塞进去的",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The <code>42</code> you normally write is decimal: each position
                  carries when it reaches ten. A computer stores only two states
                  per position, so it uses <strong>binary</strong>: each position
                  holds 0 or 1 and carries when it reaches two. A 32-bit integer
                  is <strong>a row of 32 lamps</strong>. Each lamp is on (1) or off
                  (0), and lamp i is worth 2<sup>i</sup>. The value is the sum of
                  the lamps that are on. 42 = 32 + 8 + 2 = 2<sup>5</sup> +{" "}
                  2<sup>3</sup> + 2<sup>1</sup>, so lamps 5, 3 and 1 are on. Try it
                  yourself below.
                </>
              }
              zh={
                <>
                  平时写的 <code>42</code> 是十进制:每一位逢十进一。
                  计算机每一位只有两种状态,所以用<strong>二进制</strong>:
                  每一位只有 0 或 1,逢二进一。一个 32 位整数就是
                  <strong>一排 32 盏灯</strong>:每盏亮(1)或灭(0),
                  第 i 盏的权值是 2<sup>i</sup>,数值等于所有亮着的灯之和。
                  42 = 32 + 8 + 2 = 2<sup>5</sup> + 2<sup>3</sup> + 2<sup>1</sup>,
                  所以第 5、3、1 盏亮。下面亲手拨一拨:
                </>
              }
            />
          </p>
        </div>
        <BitLamps />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  While clicking you probably noticed something odd: turning on
                  the leftmost lamp (bit 31) makes the value{" "}
                  <strong>negative</strong>. That raises the first question of this
                  chapter.{" "}
                  <strong>
                    How is a negative number stored in lamps that hold only 0 and
                    1?
                  </strong>
                </>
              }
              zh={
                <>
                  拨到这里你可能发现了个怪事:点亮最左边那盏(第 31 位),
                  数字会变成<strong>负数</strong>。这就引出本章第一个问题:
                  <strong>负数是怎么存进只有 0 和 1 的灯里的?</strong>
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The simple idea is to use the top bit as a minus sign and the
                  rest as the magnitude. That representation is called sign and
                  magnitude, and it has two problems: it has two zeros (+0 and
                  −0), and addition has to check the signs first. Real hardware
                  uses <strong>two&apos;s complement</strong> instead. The rule is{" "}
                  <strong>the pattern for −n is (~n) + 1</strong>: flip every bit,
                  then add one. With this rule, positive and negative values{" "}
                  <strong>go through the same adder</strong>. The addition never
                  looks at the sign, and a result that goes past the top of the
                  range wraps around to the other end.
                </>
              }
              zh={
                <>
                  最直接的想法是「最高位当负号,其余位存绝对值」,这叫原码。
                  它有两个毛病:存在两个 0(+0 和 −0),而且做加法前必须先分符号讨论。
                  真实硬件用的是<strong>补码(two&apos;s complement)</strong>:
                  规定 <strong>−n 的位模式 = (~n) + 1</strong>(按位取反再加一)。
                  这样正数和负数<strong>走同一个加法器</strong>,加法完全不看符号,
                  越界的结果会自然绕回另一端。
                </>
              }
            />
          </p>
        </div>
        <div className="bit-twoc">
          <div className="card">
            <div className="card-kicker">
              <T en={<>Start</>} zh={<>起点</>} />
            </div>
            <div className="card-title">+5</div>
            <p className="mono">…0000 0101</p>
            <p>
              <T
                en={<>A positive value is its plain binary form. The top bit is 0.</>}
                zh={<>正数就是它本来的二进制,最高位是 0。</>}
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en={<>Flip every bit: ~5</>} zh={<>按位取反 ~5</>} />
            </div>
            <div className="card-title">= −6</div>
            <p className="mono">…1111 1010</p>
            <p>
              <T
                en={
                  <>
                    Every lamp swaps on and off. In two&apos;s complement this
                    pattern means −6, so ~x always equals −x−1.
                  </>
                }
                zh={
                  <>
                    每盏灯亮灭对调。在补码下这个模式代表 −6,
                    所以 ~x 恒等于 −x−1。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">~5 + 1</div>
            <div className="card-title">= −5</div>
            <p className="mono">…1111 1011</p>
            <p>
              <T
                en={
                  <>
                    Flip, then add one, and you have the pattern for −5. A top bit
                    of 1 means the value is negative.
                  </>
                }
                zh={
                  <>
                    取反再加一,就得到 −5 的位模式。最高位是 1 就表示这是个负数。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "Why is −1 all 1 bits?",
            zh: "为什么 −1 是「全 1」?",
          }}
        >
          <p>
            <T
              en={
                <>
                  Apply the rule: −1 = ~1 + 1 = 1111…1110 + 1 = <b>all bits set</b>
                  . Check it by adding 1 to all ones. Every position carries, the
                  final carry falls off the top and is discarded, and the result is{" "}
                  <b>0</b>, which is exactly what −1 + 1 should give. Two&apos;s
                  complement is chosen for this reason: ordinary binary addition
                  makes x + (−x) = 0 come out right with no special case for the
                  sign. Two anchors are worth remembering:{" "}
                  <b>0 is all 0 bits and −1 is all 1 bits</b>. Every other negative
                  value lies between them.
                </>
              }
              zh={
                <>
                  按规则算:−1 = ~1 + 1 = 1111…1110 + 1 = <b>全 1</b>。
                  验证一下:全 1 再 +1,每一位都进位,最高位的进位越界被丢弃,
                  结果变回 <b>0</b>,正好对应 −1 + 1 = 0。
                  补码就是为此而选:普通的二进制加法不用为符号开任何特例,
                  x + (−x) = 0 自动成立。记住两个锚点:
                  <b>0 = 全 0,−1 = 全 1</b>,其余负数都在两者之间。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="story"
          title={{
            en: "Where the word bit comes from",
            zh: "「bit」这个词是怎么来的",
          }}
        >
          <p>
            <T
              en={
                <>
                  In 1948 Claude Shannon used <b>bit</b>, short for binary digit,
                  in his paper <i>A Mathematical Theory of Communication</i>, and
                  credited his colleague John Tukey with coining it. Before that
                  the smallest unit of information was simply called a binary
                  digit. One bit is one lamp deciding between on and off, which is
                  the smallest yes-or-no answer information can carry.
                </>
              }
              zh={
                <>
                  1948 年,香农(Claude Shannon)在论文《通信的数学理论》里使用了
                  <b>bit</b>(binary digit 的缩写),并说这个词是同事约翰·图基
                  (John Tukey)造的。在那之前,信息的最小单位就叫「binary digit」。
                  一个 bit 就是一盏灯在「亮 / 灭」之间做的一次抉择 ——
                  信息能承载的最小的一次「是 / 否」。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 六大运算符 ================= */}
      <Section
        id="ops"
        index="02"
        title={{
          en: "Six operators: six ways to change the switches",
          zh: "六大运算符:拨开关的六种方式",
        }}
        desc={{
          en: "AND & · OR | · XOR ^ · NOT ~ · shift left << · shift right >>",
          zh: "与 & · 或 | · 异或 ^ · 非 ~ · 左移 << · 右移 >>",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Unlike + − × ÷, the bitwise operators never carry from one
                  position to the next. Except for the shifts,{" "}
                  <strong>each bit position is computed on its own</strong>, using
                  only the bits at that position. That is why they are fast: one
                  CPU instruction handles all 32 lamps at once. In the playground
                  below you can click the lamps of A and B, then switch the
                  operator and watch the result.
                </>
              }
              zh={
                <>
                  位运算不像 + − × ÷ 那样跨位进位。除移位外,
                  <strong>每个二进制位都是独立计算的</strong>,只用到该位上的输入。
                  这也是它快的原因:一条 CPU 指令同时处理 32 盏灯。
                  下面这台游乐场里,A、B 两排灯都能点,换个运算符看结果怎么变:
                </>
              }
            />
          </p>
        </div>
        <OpLab />
        <div className="table-wrap" style={{ marginTop: 18 }}>
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en={<>Operator</>} zh={<>运算符</>} />
                </th>
                <th>
                  <T en={<>Name</>} zh={<>名字</>} />
                </th>
                <th>
                  <T en={<>Rule for one bit position</>} zh={<>规则(单看一位)</>} />
                </th>
                <th>
                  <T en={<>Common use</>} zh={<>典型用途</>} />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="mono"><b>&amp;</b></td>
                <td>
                  <T en={<>AND</>} zh={<>与 AND</>} />
                </td>
                <td>
                  <T en={<>1 only when both bits are 1</>} zh={<>两个都是 1 才得 1</>} />
                </td>
                <td>
                  <T
                    en={<>Keep or test selected bits (a mask)</>}
                    zh={<>保留 / 检测某些位(掩码)</>}
                  />
                </td>
              </tr>
              <tr>
                <td className="mono"><b>|</b></td>
                <td>
                  <T en={<>OR</>} zh={<>或 OR</>} />
                </td>
                <td>
                  <T en={<>1 when either bit is 1</>} zh={<>任意一个是 1 就得 1</>} />
                </td>
                <td>
                  <T en={<>Turn selected bits on</>} zh={<>打开(置 1)某些位</>} />
                </td>
              </tr>
              <tr>
                <td className="mono"><b>^</b></td>
                <td>
                  <T en={<>XOR</>} zh={<>异或 XOR</>} />
                </td>
                <td>
                  <T en={<>1 only when the two bits differ</>} zh={<>两个不同才得 1</>} />
                </td>
                <td>
                  <T
                    en={<>Flip selected bits, cancel pairs</>}
                    zh={<>翻转某些位 / 成对抵消</>}
                  />
                </td>
              </tr>
              <tr>
                <td className="mono"><b>~</b></td>
                <td>
                  <T en={<>NOT</>} zh={<>非 NOT</>} />
                </td>
                <td>
                  <T
                    en={<>0 becomes 1 and 1 becomes 0 (one operand)</>}
                    zh={<>0 变 1、1 变 0(单目)</>}
                  />
                </td>
                <td>
                  <T
                    en={<>Invert; with +1 it gives the negative</>}
                    zh={<>取反,配 +1 得相反数</>}
                  />
                </td>
              </tr>
              <tr>
                <td className="mono"><b>&lt;&lt;</b></td>
                <td>
                  <T en={<>Shift left</>} zh={<>左移 SHL</>} />
                </td>
                <td>
                  <T
                    en={<>All bits move left, 0 fills in on the right</>}
                    zh={<>整体左移,右边补 0</>}
                  />
                </td>
                <td>
                  <T
                    en={<>× 2<sup>k</sup>, build a mask 1&lt;&lt;i</>}
                    zh={<>× 2<sup>k</sup>、造掩码 1&lt;&lt;i</>}
                  />
                </td>
              </tr>
              <tr>
                <td className="mono"><b>&gt;&gt;</b></td>
                <td>
                  <T en={<>Shift right</>} zh={<>右移 SHR</>} />
                </td>
                <td>
                  <T
                    en={<>All bits move right (arithmetic: the sign bit fills in)</>}
                    zh={<>整体右移(算术右移:高位补符号位)</>}
                  />
                </td>
                <td>
                  <T
                    en={<>÷ 2<sup>k</sup> rounded down, read one bit</>}
                    zh={<>÷ 2<sup>k</sup>(向下取整)、取某一位</>}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "The same expression behaves differently in the three languages",
            zh: "同一个表达式,在三种语言里行为不同",
          }}
        >
          <p>
            <T
              en={
                <>
                  Integer width and signedness are part of what a bitwise operator
                  does, and the three languages do not agree. This is the most
                  important table in the chapter.
                </>
              }
              zh={
                <>
                  整数的位宽与符号性本身就是位运算语义的一部分,而三种语言并不一致。
                  这是本章最重要的一张表。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  1. <b>Java</b>: <code>int</code> is exactly 32-bit two&apos;s
                  complement, and <code>long</code> is 64-bit. There are two right
                  shifts: <code>&gt;&gt;</code> is arithmetic and copies the sign
                  bit, <code>&gt;&gt;&gt;</code> is logical and shifts in 0. When
                  you treat an integer as a plain bit pattern rather than a number,
                  use <code>&gt;&gt;&gt;</code>, otherwise a negative value keeps
                  filling with 1 bits. The shift distance is taken modulo 32 for{" "}
                  <code>int</code>, so <code>1 &lt;&lt; 32</code> is 1, not 0.
                </>
              }
              zh={
                <>
                  1. <b>Java</b>:<code>int</code> 就是 32 位补码,<code>long</code>
                  是 64 位。右移有两种:<code>&gt;&gt;</code> 是算术右移,补符号位;
                  <code>&gt;&gt;&gt;</code> 是逻辑右移,补 0。
                  把整数当纯位模式而非数值处理时要用 <code>&gt;&gt;&gt;</code>,
                  否则负数会不断补 1。另外 <code>int</code> 的移位量按 32 取模,
                  所以 <code>1 &lt;&lt; 32</code> 等于 1,不是 0。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  2. <b>Python</b>: integers have <b>no fixed width</b>. They grow
                  as needed, so there is no overflow and no sign bit to shift.
                  There is <b>no</b> <code>&gt;&gt;&gt;</code> operator. Negative
                  values behave like two&apos;s complement extended infinitely to
                  the left, which is why <code>~5</code> is −6. To imitate a 32-bit
                  unsigned value, mask with <code>&amp; 0xFFFFFFFF</code> yourself.
                  If the result should be negative, check bit 31 and subtract{" "}
                  <code>1 &lt;&lt; 32</code> to convert it back.
                </>
              }
              zh={
                <>
                  2. <b>Python</b>:整数<b>没有固定位宽</b>,按需增长,
                  因此既不会溢出,也没有可移动的符号位,更<b>没有</b>
                  <code>&gt;&gt;&gt;</code>。负数相当于「向左无限延伸的补码」,
                  所以 <code>~5</code> 就是 −6。要模拟 32 位无符号值,
                  得自己 <code>&amp; 0xFFFFFFFF</code>;若结果本该是负数,
                  还要检查第 31 位并减去 <code>1 &lt;&lt; 32</code> 转回去。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  3. <b>JavaScript</b>: a Number is a 64-bit float, but every
                  bitwise operator first <b>converts it to a 32-bit signed
                  integer</b> and returns one. So <code>1 &lt;&lt; 31</code> is
                  negative, and the shift distance is taken modulo 32, which makes{" "}
                  <code>1 &lt;&lt; 32</code> equal 1. <code>&gt;&gt;&gt;</code>{" "}
                  exists and is the only operator that returns an unsigned value,
                  in the range 0 to 2<sup>32</sup>−1. For bitwise work on values
                  above 2<sup>31</sup>, use <code>BigInt</code>.
                </>
              }
              zh={
                <>
                  3. <b>JavaScript</b>:Number 本身是 64 位浮点,
                  但每个位运算符都会先把它<b>转成 32 位有符号整数</b>,结果也是 32 位。
                  所以 <code>1 &lt;&lt; 31</code> 是负数;移位量同样按 32 取模,
                  <code>1 &lt;&lt; 32</code> 等于 1。<code>&gt;&gt;&gt;</code> 存在,
                  而且是唯一返回无符号值(0 到 2<sup>32</sup>−1)的运算符。
                  要对超过 2<sup>31</sup> 的数做位运算,请用 <code>BigInt</code>。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 异或找单身 + 精讲 A ================= */}
      <Section
        id="xor"
        index="03"
        title={{
          en: "Three properties of XOR find the unpaired value",
          zh: "异或的三条性质:落单的数无处可藏",
        }}
        desc={{
          en: "Worked example A · LC 136 Single Number",
          zh: "精讲 A · LC 136 只出现一次的数字",
        }}
        badge={<span className="lc-badge" data-d="easy">EASY</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  XOR (<code>^</code>) gives 1 at a bit position when the two input
                  bits differ, and 0 when they are the same. Three properties
                  follow from that, and together they solve a whole family of
                  problems.
                </>
              }
              zh={
                <>
                  异或(XOR,<code>^</code>)在某一位上的规则是:两个输入位不同得 1,
                  相同得 0。由此得出三条性质,组合起来能解一整族题目。
                </>
              }
            />
          </p>
          <div className="grid-3" style={{ margin: "14px 0" }}>
            <div className="card hoverable">
              <div className="card-kicker">
                <T en={<>Property 01</>} zh={<>性质 01</>} />
              </div>
              <div className="card-title mono">a ^ a = 0</div>
              <p>
                <T
                  en={
                    <>
                      A value XORed with itself agrees at every position, so every
                      bit becomes 0. <b>A pair cancels.</b>
                    </>
                  }
                  zh={
                    <>
                      一个数和自己异或,每一位都相同,于是全部归零 ——
                      <b>成对的数彼此抵消</b>。
                    </>
                  }
                />
              </p>
            </div>
            <div className="card hoverable">
              <div className="card-kicker">
                <T en={<>Property 02</>} zh={<>性质 02</>} />
              </div>
              <div className="card-title mono">a ^ 0 = a</div>
              <p>
                <T
                  en={
                    <>
                      XOR with 0 leaves every bit as it was.{" "}
                      <b>The unpaired value passes through unchanged.</b>
                    </>
                  }
                  zh={
                    <>
                      和 0 异或,每一位都保持原样 ——
                      <b>落单的那个数原封不动地留下来</b>。
                    </>
                  }
                />
              </p>
            </div>
            <div className="card hoverable">
              <div className="card-kicker">
                <T en={<>Property 03</>} zh={<>性质 03</>} />
              </div>
              <div className="card-title mono">
                <T en={<>Commutative · associative</>} zh={<>可交换 · 可结合</>} />
              </div>
              <p>
                <T
                  en={
                    <>
                      The order does not matter: a^b^a = a^a^b = b.{" "}
                      <b>You may group the pairs together and cancel them.</b>
                    </>
                  }
                  zh={
                    <>
                      顺序随便换:a^b^a = a^a^b = b。
                      <b>可以把成对的数凑到一起再消掉。</b>
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <p>
            <T
              en={
                <>
                  <b>The problem (LC 136):</b> in an array every value appears
                  twice except one, which appears once. Return that value.{" "}
                  <b>Direct approach:</b> count with a hash map, which is O(n) time
                  but O(n) extra space; sorting first and scanning for the odd one
                  out costs O(n log n). <b>Why XOR does better:</b> combine the
                  three properties. XOR the whole array into one variable. Each
                  pair cancels because a^a = 0, and the remaining value survives
                  because a^0 = a. One variable, so O(1) space. The animation walks
                  through it step by step.
                </>
              }
              zh={
                <>
                  <b>题意(LC 136):</b>数组里每个数都出现两次,只有一个出现一次,
                  把它找出来。<b>直接做法:</b>用哈希表计数,O(n) 时间但要 O(n) 额外空间;
                  先排序再扫也要 O(n log n)。<b>异或为什么更好:</b>把三条性质拼起来 ——
                  全体异或进同一个变量,成对的因 a^a = 0 而抵消,
                  剩下的那个因 a^0 = a 而保留。只用一个变量,O(1) 空间。
                  下面逐帧看这个过程:
                </>
              }
            />
          </p>
        </div>
        <ArrayStepper
          title={{
            en: "LC 136 · XOR everything: pairs cancel and the unpaired value is left",
            zh: "LC 136 · 全体异或:成对抵消,只剩落单的数",
          }}
          frames={F_XOR}
        />
        <CodeTabs
          title="lc136_single_number"
          java={{
            code: {
              en: `class Solution {
    public int singleNumber(int[] nums) {
        int ans = 0;            // a ^ 0 = a, so 0 is the right start
        for (int x : nums) {
            ans ^= x;           // each pair cancels, since a ^ a = 0
        }
        return ans;
    }
}`,
              zh: `class Solution {
    public int singleNumber(int[] nums) {
        int ans = 0;            // a ^ 0 = a,所以从 0 起手
        for (int x : nums) {
            ans ^= x;           // 成对的数彼此抵消(a ^ a = 0)
        }
        return ans;
    }
}`,
            },
            hl: [5],
            note: {
              en: (
                <>
                  In Java <code>^</code> is XOR. Java has <b>no</b> exponent
                  operator, so <code>^</code> never means &quot;to the power
                  of&quot;. XOR cannot overflow, because each result bit depends
                  only on the two bits at that position.
                </>
              ),
              zh: (
                <>
                  Java 里 <code>^</code> 就是异或。Java <b>没有</b>乘方运算符,
                  所以 <code>^</code> 绝不表示次方。异或不会溢出 ——
                  结果的每一位只取决于该位上的两个输入位。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        ans = 0
        for x in nums:
            ans ^= x          # a ^ a = 0 and a ^ 0 = a
        return ans
        # one-liner: from functools import reduce; from operator import xor
        #            return reduce(xor, nums)`,
              zh: `class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        ans = 0
        for x in nums:
            ans ^= x          # a ^ a = 0,a ^ 0 = a
        return ans
        # 一行版:from functools import reduce; from operator import xor
        #        return reduce(xor, nums)`,
            },
            hl: [5],
            note: {
              en: (
                <>
                  In Python the exponent operator is <code>**</code> and{" "}
                  <code>^</code> is XOR. Beginners often confuse the two. This
                  problem needs no fixed width: XOR works bit by bit, so
                  Python&apos;s unbounded integers give the same answer.
                </>
              ),
              zh: (
                <>
                  Python 的乘方是 <code>**</code>,<code>^</code> 才是异或,
                  新手最容易写错。本题不需要固定位宽:异或逐位进行,
                  Python 的无限位整数给出的结果一样。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var singleNumber = function (nums) {
  let ans = 0;
  for (const x of nums) {
    ans ^= x;               // pairs cancel, the lone value stays
  }
  return ans;
};`,
              zh: `var singleNumber = function (nums) {
  let ans = 0;
  for (const x of nums) {
    ans ^= x;               // 成对抵消,只剩落单的
  }
  return ans;
};`,
            },
            hl: [4],
            note: {
              en: (
                <>
                  A JavaScript bitwise operator converts both sides to a 32-bit
                  signed integer first. The values here fit in that range, so{" "}
                  <code>^</code> is safe. The exponent operator is <code>**</code>{" "}
                  or <code>Math.pow</code>, not <code>^</code>.
                </>
              ),
              zh: (
                <>
                  JavaScript 的位运算会先把两边转成 32 位有符号整数;
                  本题数值在这个范围内,<code>^</code> 是安全的。
                  乘方是 <code>**</code> 或 <code>Math.pow</code>,不是 <code>^</code>。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and the follow-up questions",
            zh: "复杂度与常见追问",
          }}
        >
          <p>
            <T
              en={
                <>
                  Time <BigO o="n" />, space <BigO o="1" />. Interviewers usually
                  continue from here. 1. &quot;What if two values each appear
                  once?&quot; That is <b>LC 260</b>: XOR everything to get a^b,
                  then use the lowest set bit to split the array into two groups
                  and XOR each group (the lowest set bit is covered in §04).
                  2. &quot;What if the other values appear <b>three</b> times?&quot;
                  That is <b>LC 137</b>: XOR only cancels pairs, so switch to{" "}
                  <b>counting the 1 bits per position and taking the remainder
                  modulo 3</b> (§05). 3. &quot;Find the missing number (LC
                  268)?&quot; XOR every index together with every value; each
                  present value cancels its index, and the missing one is left.
                </>
              }
              zh={
                <>
                  时间 <BigO o="n" />、空间 <BigO o="1" />。面试官通常会顺着往下问:
                  ①「有两个数各出现一次呢?」→ <b>LC 260</b>:全体异或得 a^b,
                  再用最低位的 1 把数组分成两组,每组各异或一次(最低位的 1 见 §04);
                  ②「其它数都出现<b>三</b>次呢?」→ <b>LC 137</b>:异或只能消成对的,
                  改用<b>逐位统计 1 的个数再对 3 取模</b>(§05);
                  ③「求缺失的数(LC 268)?」→ 把每个下标和每个数值一起异或,
                  出现过的数与自己的下标抵消,剩下的就是缺失的那个。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="deep"
          title={{
            en: "Where XOR is used outside interviews",
            zh: "工程现场:异或的三个用法",
          }}
        >
          <p>
            <T
              en={
                <>
                  1. <b>Recovering lost data.</b> RAID disk arrays store the XOR of
                  the data disks on a parity disk. If one disk fails, XORing all
                  the remaining disks reproduces the missing block, because in
                  a ^ b ^ c any two values determine the third. 2.{" "}
                  <b>Encryption.</b> A one-time pad is plaintext ^ key, and XORing
                  with the same key again returns the plaintext. 3.{" "}
                  <b>Swapping without a temporary variable:</b>{" "}
                  <code>a^=b; b^=a; a^=b;</code>. It is fine as an interview
                  answer, but do not use it in real code: it is hard to read, and
                  if a and b are the same location it sets both to 0.
                </>
              }
              zh={
                <>
                  ① <b>恢复丢失的数据</b>:RAID 磁盘阵列把各数据盘的异或值存在校验盘上。
                  坏掉一块盘时,把其余盘异或起来就能还原丢失的数据块 ——
                  因为 a ^ b ^ c 中已知任意两个就能求出第三个;
                  ② <b>加密</b>:一次性密码本就是明文 ^ 密钥,再异或一次同样的密钥即还原;
                  ③ <b>不用临时变量交换两数</b>:<code>a^=b; b^=a; a^=b;</code> ——
                  面试答一下可以,生产别用:可读性差,而且 a、b 指向同一处时会双双清零。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 技巧表 + 精讲 B ================= */}
      <Section
        id="tricks"
        index="04"
        title={{
          en: "The bit expressions worth knowing by heart",
          zh: "位运算技巧表:值得记住的几个表达式",
        }}
        desc={{
          en: "Worked example B · LC 191 Number of 1 Bits, the main use of n & (n-1)",
          zh: "精讲 B · LC 191 位 1 的个数 —— n & (n-1) 的招牌用法",
        }}
        badge={<span className="lc-badge" data-d="easy">EASY</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The table below lists the bit expressions that appear in almost
                  every bit manipulation problem. Read the third column rather than
                  memorising the second: each expression is short because of what
                  the operator does to a single position. Here <code>i</code> is a
                  bit position, counted from 0 at the lowest bit.
                </>
              }
              zh={
                <>
                  下面这张表列出几乎每道位运算题都会用到的表达式。
                  比起背第二列,更值得读的是第三列:每个表达式之所以这么短,
                  是因为运算符在单个位上的行为本就如此。表中 <code>i</code> 表示位号,
                  从最低位的 0 开始数。
                </>
              }
            />
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en={<>Goal</>} zh={<>目的</>} />
                </th>
                <th>
                  <T en={<>Expression</>} zh={<>表达式</>} />
                </th>
                <th>
                  <T en={<>Why it works, and where it is used</>} zh={<>为什么成立 / 用在哪</>} />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <T en={<>Test odd or even</>} zh={<>判断奇偶</>} />
                </td>
                <td className="mono">n &amp; 1</td>
                <td>
                  <T
                    en={
                      <>
                        The lowest bit is 1 for odd values and 0 for even ones,
                        negative values included. Prefer it over n % 2, which is −1
                        for a negative odd n in Java and JavaScript.
                      </>
                    }
                    zh={
                      <>
                        最低位为 1 即奇数、为 0 即偶数,负数同样成立。
                        比 n % 2 更稳:Java 和 JavaScript 里负奇数的 n % 2 是 −1。
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en={<>Clear the lowest 1 bit</>} zh={<>消掉最低位的 1</>} />
                </td>
                <td className="mono">n &amp; (n − 1)</td>
                <td>
                  <T
                    en={<>The core of counting 1 bits (191) and testing a power of two (231)</>}
                    zh={<>数 1 的个数(191)、判 2 的幂(231)的核心</>}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en={<>Keep only the lowest 1 bit</>} zh={<>取出最低位的 1(lowbit)</>} />
                </td>
                <td className="mono">n &amp; (−n)</td>
                <td>
                  <T
                    en={
                      <>
                        In two&apos;s complement −n agrees with n only at that one
                        position. Used for splitting into groups (260) and in
                        Fenwick trees
                      </>
                    }
                    zh={
                      <>
                        补码下 −n 只在这一位上与 n 相同。
                        用于分组(260)和树状数组
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en={<>Set bit i to 1</>} zh={<>把第 i 位置 1</>} />
                </td>
                <td className="mono">n | (1 &lt;&lt; i)</td>
                <td>
                  <T en={<>Add element i to a set (§06)</>} zh={<>集合「加入元素 i」(§06)</>} />
                </td>
              </tr>
              <tr>
                <td>
                  <T en={<>Clear bit i to 0</>} zh={<>把第 i 位清 0</>} />
                </td>
                <td className="mono">n &amp; ~(1 &lt;&lt; i)</td>
                <td>
                  <T en={<>Remove element i from a set</>} zh={<>集合「删除元素 i」</>} />
                </td>
              </tr>
              <tr>
                <td>
                  <T en={<>Flip bit i</>} zh={<>把第 i 位翻转</>} />
                </td>
                <td className="mono">n ^ (1 &lt;&lt; i)</td>
                <td>
                  <T en={<>Toggle one switch</>} zh={<>翻灯 / 切换开关</>} />
                </td>
              </tr>
              <tr>
                <td>
                  <T en={<>Read bit i</>} zh={<>取出第 i 位</>} />
                </td>
                <td className="mono">(n &gt;&gt; i) &amp; 1</td>
                <td>
                  <T
                    en={<>Test whether element i is in a set, count per bit (137)</>}
                    zh={<>集合「查询元素 i」、逐位统计(137)</>}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en={<>Multiply or divide by 2<sup>k</sup></>} zh={<>乘 / 除 2<sup>k</sup></>} />
                </td>
                <td className="mono">n &lt;&lt; k / n &gt;&gt; k</td>
                <td>
                  <T
                    en={
                      <>
                        Exact as long as no bit is pushed off the top. For a
                        negative n, &gt;&gt; rounds down while Java&apos;s int
                        division rounds toward zero: −7 &gt;&gt; 1 is −4 but −7 / 2
                        is −3 (§07)
                      </>
                    }
                    zh={
                      <>
                        只要没有位被顶出去就精确。负数上 &gt;&gt; 向下取整,
                        而 Java 的整数除法向 0 取整:−7 &gt;&gt; 1 = −4,
                        但 −7 / 2 = −3(§07)
                      </>
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  The most frequently tested of these is{" "}
                  <code>n &amp; (n − 1)</code>. <b>The problem (LC 191):</b> given
                  an integer, count how many 1 bits it has. That count is called
                  the population count, or the Hamming weight.{" "}
                  <b>Direct approach:</b> loop a <b>fixed 32 times</b> and read one
                  bit each round with <code>(n &gt;&gt; i) &amp; 1</code>. Can the
                  work be spent only where a 1 actually is?{" "}
                  <b>The key observation:</b> subtracting 1 borrows, so the lowest
                  1 bit of n becomes 0 and every 0 to its right becomes 1. ANDing
                  that with n <b>clears the lowest 1 bit and everything to its
                  right, and leaves the higher bits unchanged</b>. So the loop{" "}
                  <code>n = n &amp; (n − 1)</code> until n is 0 runs{" "}
                  <b>exactly once per 1 bit</b>.
                </>
              }
              zh={
                <>
                  其中考得最多的是 <code>n &amp; (n − 1)</code>。
                  <b>题意(LC 191):</b>给一个整数,数它二进制里有多少个 1,
                  这个个数叫 popcount(汉明重量)。<b>直接做法:</b>
                  <b>固定循环 32 次</b>,每次用 <code>(n &gt;&gt; i) &amp; 1</code> 看一位。
                  能不能只在真的有 1 的地方花力气?<b>关键观察:</b>
                  减 1 会借位,于是 n 最低位的那个 1 变成 0、它右边的 0 全变成 1;
                  再和 n 相与,<b>最低位的 1 连同右侧一起被清掉,更高位一动不动</b>。
                  所以「<code>n = n &amp; (n − 1)</code> 直到 n 为 0」的循环
                  <b>每个 1 恰好跑一次</b>。
                </>
              }
            />
          </p>
        </div>
        <ArrayStepper
          title={{
            en: "LC 191 · n & (n−1) clears the lowest 1 bit each round (n = 13)",
            zh: "LC 191 · n & (n−1) 逐次消掉最低位的 1(n = 13)",
          }}
          frames={F_POP}
          cellW={52}
        />
        <CodeTabs
          title="lc191_number_of_1_bits"
          java={{
            code: {
              en: `public class Solution {
    public int hammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            n &= (n - 1);       // clear the lowest 1 bit
            count++;
        }
        return count;
    }
    // built-in: return Integer.bitCount(n);
}`,
              zh: `public class Solution {
    public int hammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            n &= (n - 1);       // 清掉最低位的 1
            count++;
        }
        return count;
    }
    // 内置写法:return Integer.bitCount(n);
}`,
            },
            hl: [5, 6],
            note: {
              en: (
                <>
                  Java has a built-in, <code>Integer.bitCount</code>. If you write
                  the shifting version instead, you <b>must</b> use{" "}
                  <code>n &gt;&gt;&gt;= 1</code>. With <code>&gt;&gt;</code> a
                  negative n keeps having 1 shifted in from the sign bit, so the
                  loop never ends. The <code>n &amp; (n−1)</code> version never
                  touches the sign bit and does not have this problem.
                </>
              ),
              zh: (
                <>
                  Java 有内置函数 <code>Integer.bitCount</code>。若改写成移位版本,
                  <b>必须</b>用 <code>n &gt;&gt;&gt;= 1</code>:用 <code>&gt;&gt;</code>
                  时,负数会不断从符号位补进 1,循环永远停不下来。
                  <code>n &amp; (n−1)</code> 版本根本不碰符号位,没有这个问题。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            n &= n - 1          # clear the lowest 1 bit
            count += 1
        return count
        # shortest: return bin(n).count("1")`,
              zh: `class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            n &= n - 1          # 清掉最低位的 1
            count += 1
        return count
        # 最短写法:return bin(n).count("1")`,
            },
            hl: [5, 6],
            note: {
              en: (
                <>
                  For a non-negative n, <code>while n</code> is enough, because n
                  strictly decreases to 0. Python also has{" "}
                  <code>bin(n).count(&quot;1&quot;)</code>, and{" "}
                  <code>n.bit_count()</code> from version 3.10. Note that this loop
                  does not terminate for a negative n: a Python negative integer
                  has infinitely many leading 1 bits, so mask with{" "}
                  <code>&amp; 0xFFFFFFFF</code> first if the input can be negative.
                </>
              ),
              zh: (
                <>
                  n 非负时 <code>while n</code> 就够了,因为 n 严格递减到 0。
                  Python 还可以写 <code>bin(n).count(&quot;1&quot;)</code>,
                  3.10 起有 <code>n.bit_count()</code>。注意这个循环对负数不会终止:
                  Python 的负整数前面有无限多个 1,所以输入可能为负时要先
                  <code>&amp; 0xFFFFFFFF</code>。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var hammingWeight = function (n) {
  let count = 0;
  while (n !== 0) {
    n &= n - 1;             // clear the lowest 1 bit
    count++;
  }
  return count;
};`,
              zh: `var hammingWeight = function (n) {
  let count = 0;
  while (n !== 0) {
    n &= n - 1;             // 清掉最低位的 1
    count++;
  }
  return count;
};`,
            },
            hl: [4, 5],
            note: {
              en: (
                <>
                  JavaScript has <b>no</b> built-in population count, so this loop
                  is the answer. As in Java, a shifting version needs{" "}
                  <code>n &gt;&gt;&gt;= 1</code>; with <code>&gt;&gt;</code> a
                  negative n loops forever, because the sign bit is copied in. The{" "}
                  <code>n &amp; (n−1)</code> version also terminates for a negative
                  n: every step clears one more bit of the 32-bit pattern, so
                  after at most 32 steps nothing is left.
                </>
              ),
              zh: (
                <>
                  JavaScript <b>没有</b>内置的 popcount,只能自己写这个循环。
                  和 Java 一样,移位版本要写 <code>n &gt;&gt;&gt;= 1</code>;
                  用 <code>&gt;&gt;</code> 时负数会因为不断补符号位而死循环。
                  <code>n &amp; (n−1)</code> 版本对负数也会停:每一步清掉 32 位模式里的一个 1,
                  最多 32 步就清空了。
                </>
              ),
            },
          }}
        />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en={<>Follow-up 01 · LC 231</>} zh={<>衍生 01 · LC 231</>} />
            </div>
            <div className="card-title">
              <T en={<>Power of two</>} zh={<>判断 2 的幂</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    A power of two has <b>exactly one 1 bit</b>, so{" "}
                    <code>n &gt; 0 &amp;&amp; (n &amp; (n−1)) == 0</code>. Clearing
                    the only 1 bit leaves 0. The <code>n &gt; 0</code> test is
                    required: 0 and negative values pass the second test for a
                    different reason.
                  </>
                }
                zh={
                  <>
                    2 的幂在二进制里<b>只有一个 1</b>,所以
                    <code>n &gt; 0 &amp;&amp; (n &amp; (n−1)) == 0</code>:
                    清掉唯一的 1 后得 0。<code>n &gt; 0</code> 不能省 ——
                    0 和负数也能通过后半个条件,但理由完全不同。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en={<>Follow-up 02 · LC 461</>} zh={<>衍生 02 · LC 461</>} />
            </div>
            <div className="card-title">
              <T en={<>Hamming distance</>} zh={<>汉明距离</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    The number of positions where x and y differ is{" "}
                    <code>popcount(x ^ y)</code>. XOR marks the differing
                    positions with a 1, and LC 191 counts them.
                  </>
                }
                zh={
                  <>
                    x 和 y 有几位不同 = <code>popcount(x ^ y)</code>:
                    异或把不同的位标成 1,再用 191 的方法数出来。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en={<>Follow-up 03 · LC 260</>} zh={<>衍生 03 · LC 260</>} />
            </div>
            <div className="card-title">
              <T en={<>Two unpaired values</>} zh={<>两个落单的数</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    XOR everything to get a^b, take one differing position with{" "}
                    <code>x &amp; (−x)</code>, split the array into two groups by
                    that bit, and apply LC 136 to each group.
                  </>
                }
                zh={
                  <>
                    全体异或得 a^b,用 <code>x &amp; (−x)</code> 取出其中一个不同的位,
                    按该位把数组分成两组,每组各做一次 136。
                  </>
                }
              />
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §05 逐位统计 + 精讲 C ================= */}
      <Section
        id="count"
        index="05"
        title={{
          en: "Counting per bit: the method that works when XOR does not",
          zh: "逐位统计:异或失灵时的通法",
        }}
        desc={{
          en: "Worked example C · LC 137 Single Number II, where the other values appear three times",
          zh: "精讲 C · LC 137 只出现一次的数字 II —— 其它数都出现 3 次",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem (LC 137):</b> every value in the array appears{" "}
                  <b>three times</b> except one, which appears once. Return that
                  value. <b>Why the XOR from LC 136 fails:</b> XOR removes values
                  that appear an even number of times. With three copies,
                  a^a^a = a, so nothing cancels.
                </>
              }
              zh={
                <>
                  <b>题意(LC 137):</b>数组里每个数都出现<b>三次</b>,
                  只有一个出现一次,把它找出来。<b>为什么 136 的异或失灵:</b>
                  异或只能消掉出现偶数次的数;出现三次时 a^a^a = a,消不掉。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>Change what you look at:</b> stop looking at whole numbers and
                  look at <b>one bit position at a time</b>. At a given position, a
                  value that appears three times contributes either 0 (its bit is
                  0) or 3 (its bit is 1). <b>Both are multiples of 3.</b> So add up
                  all the 1 bits at that position and <b>take the remainder modulo
                  3</b>: the multiples of 3 divide out, and what is left is{" "}
                  <b>the bit of the value that appears once</b>. Do that for all 32
                  positions and rebuild the answer.
                </>
              }
              zh={
                <>
                  <b>换个视角:</b>不再盯着整个数,而是<b>一次只看一个二进制位</b>。
                  在某一位上,出现三次的数要么贡献 0(该位是 0),
                  要么贡献 3(该位是 1),<b>两种都是 3 的倍数</b>。
                  所以把所有数在该位上的 1 加起来再<b>对 3 取模</b>:
                  3 的倍数被整除干净,剩下的正是<b>那个只出现一次的数在这一位上的值</b>。
                  32 位逐位还原,答案就出来了。
                </>
              }
            />
          </p>
        </div>
        <DPTable
          title={{
            en: "LC 137 · count each column, then take it modulo 3 (nums = [2, 2, 2, 7])",
            zh: "LC 137 · 逐位统计:每列求和后对 3 取模(nums = [2, 2, 2, 7])",
          }}
          frames={F_137}
          colLabels={{
            en: ["bit 2", "bit 1", "bit 0"],
            zh: ["第 2 位", "第 1 位", "第 0 位"],
          }}
          rowLabels={{
            en: ["2", "2", "2", "7", "Σ sum", "%3"],
            zh: ["2", "2", "2", "7", "Σ 求和", "%3"],
          }}
          cornerLabel={{ en: "bit", zh: "位" }}
          cellW={72}
        />
        <CodeTabs
          title="lc137_single_number_ii"
          java={{
            code: {
              en: `class Solution {
    public int singleNumber(int[] nums) {
        int ans = 0;
        for (int i = 0; i < 32; i++) {
            int sum = 0;
            for (int x : nums) sum += (x >> i) & 1; // count the 1 bits at position i
            if (sum % 3 != 0) ans |= (1 << i);      // the lone value has a 1 here
        }
        return ans;
    }
}`,
              zh: `class Solution {
    public int singleNumber(int[] nums) {
        int ans = 0;
        for (int i = 0; i < 32; i++) {
            int sum = 0;
            for (int x : nums) sum += (x >> i) & 1; // 统计第 i 位上 1 的个数
            if (sum % 3 != 0) ans |= (1 << i);      // 落单的数在这一位是 1
        }
        return ans;
    }
}`,
            },
            hl: [6, 7],
            note: {
              en: (
                <>
                  A Java <code>int</code> is already 32-bit two&apos;s complement,
                  so <code>(x &gt;&gt; i) &amp; 1</code> reads the correct bit for
                  a negative x as well. If bit 31 ends up set, <code>ans</code> is
                  negative on its own and <b>needs no conversion</b>.
                </>
              ),
              zh: (
                <>
                  Java 的 <code>int</code> 本身就是 32 位补码,所以
                  <code>(x &gt;&gt; i) &amp; 1</code> 对负数也读到正确的位。
                  若第 31 位被置 1,<code>ans</code> 自动就是负数,
                  <b>不需要任何转换</b>。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        ans = 0
        for i in range(32):
            s = sum((x >> i) & 1 for x in nums)
            if s % 3:
                ans |= 1 << i
        # Python integers have no fixed width: convert bit 31 back to a sign
        if ans >= (1 << 31):
            ans -= (1 << 32)
        return ans`,
              zh: `class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        ans = 0
        for i in range(32):
            s = sum((x >> i) & 1 for x in nums)
            if s % 3:
                ans |= 1 << i
        # Python 整数没有固定位宽:把第 31 位还原成符号
        if ans >= (1 << 31):
            ans -= (1 << 32)
        return ans`,
            },
            hl: [9, 10],
            note: {
              en: (
                <>
                  <b>The Python trap of this chapter.</b> Python integers have no
                  fixed width, so nothing turns bit 31 into a sign automatically.
                  An <code>ans</code> built bit by bit with bit 31 set is still a{" "}
                  <b>large positive number</b>, so subtract{" "}
                  <code>1 &lt;&lt; 32</code> to get the negative value back. Note
                  that <code>(x &gt;&gt; i) &amp; 1</code> is still correct for a
                  negative x, because Python treats negatives as two&apos;s
                  complement extended to the left without limit.
                </>
              ),
              zh: (
                <>
                  <b>本章最大的 Python 坑。</b>Python 整数没有固定位宽,
                  第 31 位不会自动变成符号。逐位拼出来的 <code>ans</code> 若第 31 位是 1,
                  在 Python 里仍是个<b>很大的正数</b>,必须减去
                  <code>1 &lt;&lt; 32</code> 才能还原成负数。顺带一提,
                  <code>(x &gt;&gt; i) &amp; 1</code> 对负数依然正确 ——
                  Python 把负数当作向左无限延伸的补码。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var singleNumber = function (nums) {
  let ans = 0;
  for (let i = 0; i < 32; i++) {
    let sum = 0;
    for (const x of nums) sum += (x >> i) & 1;
    if (sum % 3 !== 0) ans |= 1 << i;   // |= returns a 32-bit signed value
  }
  return ans;                            // setting bit 31 makes it negative
};`,
              zh: `var singleNumber = function (nums) {
  let ans = 0;
  for (let i = 0; i < 32; i++) {
    let sum = 0;
    for (const x of nums) sum += (x >> i) & 1;
    if (sum % 3 !== 0) ans |= 1 << i;   // |= 的结果就是 32 位有符号值
  }
  return ans;                            // 第 31 位被置 1 时它自己就变负
};`,
            },
            hl: [5, 6],
            note: {
              en: (
                <>
                  JavaScript bitwise operators already work on 32-bit signed
                  values, so <code>ans |= 1 &lt;&lt; 31</code> makes{" "}
                  <code>ans</code> negative by itself, exactly as in Java.{" "}
                  <b>Only Python needs the extra conversion.</b> This problem shows
                  the difference between the three languages clearly.
                </>
              ),
              zh: (
                <>
                  JavaScript 的位运算本来就在 32 位有符号下进行,
                  <code>ans |= 1 &lt;&lt; 31</code> 会让 <code>ans</code> 自己变负,
                  和 Java 一样。<b>只有 Python 需要额外转换。</b>
                  三种语言的差异在这题上体现得最清楚。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="idea"
          title={{
            en: "The same method solves the appears-k-times variants",
            zh: "举一反三:这是「出现 k 次」的通法",
          }}
        >
          <p>
            <T
              en={
                <>
                  Replace <code>% 3</code> with <code>% k</code> and you can solve{" "}
                  <b>every</b> variant where the other values appear <b>k</b> times
                  and one value appears once. That is the point of counting per
                  bit. XOR only removes values that appear an even number of times.
                  When that is not enough, fall back to the plainer but more
                  general method: count the 1 bits at each position, then take the
                  remainder. LC 137 also has an O(n) time, O(1) space version that
                  keeps two variables, <code>ones</code> and <code>twos</code>, as
                  a small state machine. Counting per bit is easier to derive
                  during an interview and fast enough.
                </>
              }
              zh={
                <>
                  把 <code>% 3</code> 换成 <code>% k</code>,就能解
                  「其它数都出现 <b>k</b> 次、一个数出现一次」的<b>所有</b>变体。
                  这正是逐位统计的价值:异或只能消掉出现偶数次的数,不够用时,
                  就退回这个更朴素也更普适的办法 —— 逐位数 1,再取模。
                  LC 137 另有一个 O(n) 时间、O(1) 空间的写法,用
                  <code>ones</code> 和 <code>twos</code> 两个变量做小状态机;
                  但逐位统计在面试现场更容易推出来,也够快。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="win"
          title={{ en: "Follow-up questions", zh: "面试追问" }}
        >
          <p>
            <T
              en={
                <>
                  1. &quot;Can you avoid the 32 iterations and still use O(1)
                  space?&quot; Use the state machine{" "}
                  <code>
                    ones = (ones ^ x) &amp; ~twos; twos = (twos ^ x) &amp; ~ones;
                  </code>
                  . Remember it if you can, but explaining the per-bit counting
                  idea is an accepted answer too. 2. &quot;What if the values are
                  64-bit?&quot; Run the loop over 64 positions instead. 3.
                  &quot;What if the others appear five times?&quot; Use{" "}
                  <code>% 5</code>. The idea does not change at all.
                </>
              }
              zh={
                <>
                  ①「能不能不循环 32 次,还保持 O(1) 额外空间?」→ 用状态机
                  <code>
                    ones = (ones ^ x) &amp; ~twos; twos = (twos ^ x) &amp; ~ones;
                  </code>
                  ,能背下来最好,背不出就讲逐位统计的思路,同样是被认可的答案;
                  ②「如果是 64 位的数呢?」→ 循环开到 64 位;
                  ③「其它数出现 5 次呢?」→ 改成 <code>% 5</code>,思路一个字不用改。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 位运算表示集合 ================= */}
      <Section
        id="set"
        index="06"
        title={{
          en: "An integer as a set: the basis of state compression DP",
          zh: "位运算表示集合:状压 DP 的地基",
        }}
        desc={{
          en: "One integer is one set, and bit i says whether element i is in it",
          zh: "一个整数 = 一个集合,第 i 位 = 元素 i 在不在",
        }}
        badge={
          <span className="chip" data-tone="info">
            <T en={<>Prerequisite for chapter 10</>} zh={<>第 10 章前置</>} />
          </span>
        }
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  This section is what chapter 10, state compression DP, is built
                  on. The idea is short:{" "}
                  <strong>treat one integer as one set</strong>. If lamp i is on,
                  element i is in the set. A set of up to 32 possible elements then
                  fits in a single <code>int</code>. Adding, removing and testing
                  an element each become one bitwise operation, and because the set
                  is now just a number you can compare two sets with{" "}
                  <code>==</code>, use a set as an array index, or store it in a
                  hash map. Try the lab first, then read the code.
                </>
              }
              zh={
                <>
                  这一节是第 10 章「状态压缩 DP」的地基。想法很短:
                  <strong>把一个整数当成一个集合</strong> —— 第 i 盏灯亮,
                  就表示元素 i 在集合里。于是最多 32 个候选元素的集合,
                  正好装进一个 <code>int</code>。加入、删除、查询各变成一次位运算;
                  而且集合现在就是个数字,可以直接用 <code>==</code> 比较、
                  当数组下标、或者塞进哈希表。先玩一玩,再看代码:
                </>
              }
            />
          </p>
        </div>
        <SubsetLab />
        <CodeTabs
          title="bitset_as_set"
          java={{
            code: {
              en: `int s = 0;                        // the empty set
s |= (1 << i);                    // add element i
s &= ~(1 << i);                   // remove element i
boolean in = ((s >> i) & 1) == 1; // is element i in the set?
int size = Integer.bitCount(s);   // number of elements

// enumerate all 2^n subsets of {0..n-1}
for (int sub = 0; sub < (1 << n); sub++) {
    // sub is one subset, and sub = 0 is the empty set
}

// enumerate the subsets of one set mask (the loop used in state compression DP)
for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
    // sub visits every non-empty subset of mask, largest first
}`,
              zh: `int s = 0;                        // 空集
s |= (1 << i);                    // 加入元素 i
s &= ~(1 << i);                   // 删除元素 i
boolean in = ((s >> i) & 1) == 1; // 元素 i 在集合里吗?
int size = Integer.bitCount(s);   // 元素个数

// 枚举全集 {0..n-1} 的全部 2^n 个子集
for (int sub = 0; sub < (1 << n); sub++) {
    // sub 就是一个子集,sub = 0 是空集
}

// 枚举某个集合 mask 的子集(状压 DP 的招牌循环)
for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
    // sub 从大到小遍历 mask 的每个非空子集
}`,
            },
            hl: [7, 8, 9, 13],
            note: {
              en: (
                <>
                  <code>(sub − 1) &amp; mask</code> produces the next smaller
                  subset of mask. The loop stops at <code>sub &gt; 0</code>, so it{" "}
                  <b>skips the empty set</b>; handle that case separately if you
                  need it. Run this loop for every mask and the total number of
                  (mask, subset) pairs is <b>3<sup>n</sup></b>, not
                  4<sup>n</sup>, because each element is in the subset, in mask
                  only, or in neither. That bound is why the pattern is usable at
                  all. Watch the width: <code>1 &lt;&lt; n</code> overflows an{" "}
                  <code>int</code> once n reaches 31, so write{" "}
                  <code>1L &lt;&lt; n</code> for a larger n.
                </>
              ),
              zh: (
                <>
                  <code>(sub − 1) &amp; mask</code> 直接给出 mask 的下一个更小子集。
                  循环条件是 <code>sub &gt; 0</code>,所以它<b>跳过空集</b>,
                  需要空集时要单独处理。对每个 mask 都跑一遍这个循环,
                  (mask, 子集) 对的总数是 <b>3<sup>n</sup></b> 而不是 4<sup>n</sup> ——
                  因为每个元素只有三种归属:在子集里、只在 mask 里、都不在。
                  正是这个上界让这套写法可用。注意位宽:n 到 31 时
                  <code>1 &lt;&lt; n</code> 会溢出 <code>int</code>,n 更大要写
                  <code>1L &lt;&lt; n</code>。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `s = 0                       # the empty set
s |= 1 << i                 # add element i
s &= ~(1 << i)              # remove element i
inside = (s >> i) & 1       # 1 if element i is in the set, else 0
size = bin(s).count("1")    # number of elements

# enumerate all subsets of {0..n-1}
for sub in range(1 << n):
    ...                     # sub is one subset

# enumerate the non-empty subsets of mask
sub = mask
while sub:
    ...                     # handle sub
    sub = (sub - 1) & mask`,
              zh: `s = 0                       # 空集
s |= 1 << i                 # 加入元素 i
s &= ~(1 << i)              # 删除元素 i
inside = (s >> i) & 1       # 元素 i 在集合里则为 1,否则为 0
size = bin(s).count("1")    # 元素个数

# 枚举全集 {0..n-1} 的全部子集
for sub in range(1 << n):
    ...                     # sub 就是一个子集

# 枚举 mask 的全部非空子集
sub = mask
while sub:
    ...                     # 处理 sub
    sub = (sub - 1) & mask`,
            },
            hl: [7, 8, 9, 12, 13, 15],
            note: {
              en: (
                <>
                  Python integers have no fixed width, so <code>1 &lt;&lt; i</code>{" "}
                  never overflows. In practice state compression stays around
                  n ≤ 20, because 2<sup>n</sup> states have to fit in memory and
                  time. <code>~(1 &lt;&lt; i)</code> is a negative number in
                  Python, but ANDing it with a non-negative <code>s</code> still
                  clears exactly bit i, so it is safe. From version 3.10 you can
                  write <code>s.bit_count()</code> instead of{" "}
                  <code>bin(s).count(&quot;1&quot;)</code>. Like the Java version,
                  the <code>while sub</code> loop <b>never yields the empty
                  set</b>.
                </>
              ),
              zh: (
                <>
                  Python 整数没有固定位宽,<code>1 &lt;&lt; i</code> 不会溢出。
                  实际做状压时 n 一般不超过 20 左右,因为 2<sup>n</sup> 个状态
                  还要放得进内存和时间。<code>~(1 &lt;&lt; i)</code> 在 Python 里是负数,
                  但和非负的 <code>s</code> 相与仍然只清掉第 i 位,可以放心用。
                  3.10 起可以写 <code>s.bit_count()</code> 代替
                  <code>bin(s).count(&quot;1&quot;)</code>。和 Java 版一样,
                  <code>while sub</code> 循环<b>不会给出空集</b>。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `let s = 0;                    // the empty set
s |= 1 << i;                  // add element i
s &= ~(1 << i);               // remove element i
const inside = (s >> i) & 1;  // is element i in the set?

// enumerate all subsets of {0..n-1}
for (let sub = 0; sub < (1 << n); sub++) {
  // sub is one subset
}

// enumerate the non-empty subsets of mask
for (let sub = mask; sub > 0; sub = (sub - 1) & mask) {
  // ...
}`,
              zh: `let s = 0;                    // 空集
s |= 1 << i;                  // 加入元素 i
s &= ~(1 << i);               // 删除元素 i
const inside = (s >> i) & 1;  // 元素 i 在集合里吗?

// 枚举全集 {0..n-1} 的全部子集
for (let sub = 0; sub < (1 << n); sub++) {
  // sub 就是一个子集
}

// 枚举 mask 的全部非空子集
for (let sub = mask; sub > 0; sub = (sub - 1) & mask) {
  // ...
}`,
            },
            hl: [6, 7, 8, 12],
            note: {
              en: (
                <>
                  JavaScript has no <code>Integer.bitCount</code>, so count the
                  elements with the <code>n &amp; (n−1)</code> loop from §04. Keep
                  the element count <b>at 30 or below</b>: bitwise operators work
                  on 32-bit signed values, so <code>1 &lt;&lt; 31</code> is
                  negative and the loop condition <code>sub &lt; (1 &lt;&lt; n)</code>{" "}
                  fails immediately. The shift distance is also taken modulo 32, so{" "}
                  <code>1 &lt;&lt; 32</code> is 1 rather than 2<sup>32</sup>.
                </>
              ),
              zh: (
                <>
                  JavaScript 没有 <code>Integer.bitCount</code>,
                  元素个数要用 §04 的 <code>n &amp; (n−1)</code> 循环来数。
                  元素个数<b>务必 ≤ 30</b>:位运算在 32 位有符号下进行,
                  <code>1 &lt;&lt; 31</code> 是负数,循环条件
                  <code>sub &lt; (1 &lt;&lt; n)</code> 会当场不成立。
                  另外移位量按 32 取模,所以 <code>1 &lt;&lt; 32</code> 等于 1,
                  而不是 2<sup>32</sup>。
                </>
              ),
            },
          }}
        />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  <b>A short example · LC 318 Maximum Product of Word Lengths:</b>{" "}
                  find two words that share no letter and maximise the product of
                  their lengths. Comparing two words character by character is
                  slow, but a word only matters here through{" "}
                  <b>which of the 26 letters it uses</b>, and that is a set.
                  Compress each word into a 26-bit mask: if the word contains
                  letter c, set bit c. Two words share no letter{" "}
                  <b>exactly when mask1 &amp; mask2 == 0</b>, that is, when the
                  intersection is empty. Testing the intersection drops from a
                  scan over characters to <b>one AND</b>.
                </>
              }
              zh={
                <>
                  <b>小例子 · LC 318 最大单词长度乘积:</b>
                  要找两个没有公共字母的单词,使长度乘积最大。
                  逐字符比对太慢,但在这题里,一个单词只通过
                  <b>「用了 a~z 里哪些字母」</b>起作用 —— 那就是一个集合。
                  把每个单词压成一个 26 位掩码:含字母 c 就把第 c 位置 1。
                  两个单词无公共字母 <b>等价于 mask1 &amp; mask2 == 0</b>,即交集为空。
                  于是求交集从遍历字符降成了<b>一次位与</b>。
                </>
              }
            />
          </p>
        </div>
        <Callout
          tone="deep"
          title={{
            en: "Where an integer is used as a set in real systems",
            zh: "工程现场:整数当集合的常见场景",
          }}
        >
          <p>
            <T
              en={
                <>
                  1. <b>Linux file permissions.</b> In <code>chmod 755</code> each
                  octal digit is 3 bits standing for read, write and execute, so
                  one number encodes a group of switches. 2.{" "}
                  <b>Feature flags.</b> One integer can hold dozens of boolean
                  settings, which saves memory and makes two configurations easy to
                  compare. 3. <b>Board games.</b> Chess engines represent the whole
                  board as a 64-bit <b>bitboard</b>, one bit per square, and
                  generate moves with bitwise operations. 4.{" "}
                  <b>State compression DP.</b> Chapter 10 uses a mask to record
                  which tasks are finished or which cities have been visited, which
                  turns an exponential set of states into an array index.
                </>
              }
              zh={
                <>
                  ① <b>Linux 文件权限</b>:<code>chmod 755</code> 里每个八进制位就是
                  3 个 bit,分别表示读、写、执行 —— 一个数字编码一组开关;
                  ② <b>特性开关(feature flags)</b>:一个整数能存几十个布尔配置,
                  既省内存,两份配置也好比较;③ <b>棋类游戏</b>:
                  国际象棋引擎用 64 位 <b>bitboard</b> 表示整个棋盘,一格一位,
                  走子生成全靠位运算;④ <b>状压 DP</b>:第 10 章用一个 mask 记录
                  「哪些任务已完成」或「哪些城市已访问」,
                  把指数级的集合状态变成一个数组下标。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 移位乘除 ================= */}
      <Section
        id="shift"
        index="07"
        title={{
          en: "Shifting: multiplying and dividing by powers of two",
          zh: "移位乘除:用移位代替乘除 2 的幂",
        }}
        desc={{
          en: "Left shift multiplies by 2ᵏ, right shift divides by 2ᵏ, and three traps you have to know",
          zh: "左移 = 乘 2ᵏ,右移 = 除 2ᵏ,以及三个必须知道的坑",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  In decimal, adding a 0 to the end of <code>35</code> gives{" "}
                  <code>350</code>, which multiplies by 10. Binary works the same
                  way: move every lamp <strong>one position left</strong> and fill
                  the right with 0, and the value is <strong>doubled</strong>. So{" "}
                  <code>n &lt;&lt; k</code> is n × 2<sup>k</sup>, and for a
                  non-negative n, <code>n &gt;&gt; k</code> is n ÷ 2<sup>k</sup>{" "}
                  rounded down. Shifts are among the cheapest CPU instructions, and
                  compilers have long replaced <code>× 8</code> with{" "}
                  <code>&lt;&lt; 3</code> on their own. Go back to the playground
                  in §02, choose <code>&lt;&lt;</code> or <code>&gt;&gt;</code>,
                  and watch the whole row of lamps move.
                </>
              }
              zh={
                <>
                  十进制里给 <code>35</code> 末尾添个 0 变成 <code>350</code>,
                  就是 ×10;二进制同理:把所有灯<strong>整体左移一位</strong>、
                  右边补 0,数值正好<strong>翻倍</strong>。所以
                  <code>n &lt;&lt; k</code> = n × 2<sup>k</sup>;n 非负时
                  <code>n &gt;&gt; k</code> = n ÷ 2<sup>k</sup>(向下取整)。
                  移位是 CPU 最便宜的指令之一,编译器早就会自己把 <code>× 8</code>
                  换成 <code>&lt;&lt; 3</code>。回到 §02 的游乐场选
                  <code>&lt;&lt;</code> 或 <code>&gt;&gt;</code>,能看到整排灯平移。
                </>
              }
            />
          </p>
          <p>
            <T
              en={<>Shifting has three traps you have to know about.</>}
              zh={<>但移位有三个必须知道的坑。</>}
            />
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 4 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en={<>Trap 01 · overflow</>} zh={<>坑 01 · 溢出</>} />
            </div>
            <div className="card-title">
              <T en={<>Bits fall off the top</>} zh={<>左移会把 1 顶出去</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    In 32 bits, <code>1 &lt;&lt; 31</code> sets the sign bit, so the
                    value is negative; shifting once more pushes the 1 out and
                    leaves 0. In Java and JavaScript the shift distance is taken
                    modulo 32, so <code>1 &lt;&lt; 32</code> is 1, not 0. Python has
                    no width limit, so there <code>1 &lt;&lt; 32</code> really is
                    2<sup>32</sup>.
                  </>
                }
                zh={
                  <>
                    32 位下 <code>1 &lt;&lt; 31</code> 点亮的是符号位,值为负;
                    再左移一位,这个 1 就被顶出边界,只剩 0。
                    Java 和 JavaScript 的移位量按 32 取模,所以
                    <code>1 &lt;&lt; 32</code> 等于 1,不是 0。
                    Python 没有位宽限制,那里的 <code>1 &lt;&lt; 32</code> 就是
                    2<sup>32</sup>。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en={<>Trap 02 · negative values</>} zh={<>坑 02 · 负数右移</>} />
            </div>
            <div className="card-title">
              <T en={<>Arithmetic vs logical</>} zh={<>算术右移 vs 逻辑右移</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    <code>&gt;&gt;</code> copies the sign bit, so −8 &gt;&gt; 1 is
                    −4. <code>&gt;&gt;&gt;</code> shifts in 0 and turns a negative
                    into a large positive value. Use <code>&gt;&gt;&gt;</code> when
                    the integer is a bit pattern rather than a quantity. Python has
                    only the arithmetic shift.
                  </>
                }
                zh={
                  <>
                    <code>&gt;&gt;</code> 补符号位,所以 −8 &gt;&gt; 1 = −4;
                    <code>&gt;&gt;&gt;</code> 补 0,会把负数变成一个大正数。
                    当整数表示的是位模式而非数量时,用 <code>&gt;&gt;&gt;</code>。
                    Python 只有算术右移。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en={<>Trap 03 · precedence</>} zh={<>坑 03 · 优先级</>} />
            </div>
            <div className="card-title">
              <T en={<>Add the parentheses</>} zh={<>老老实实加括号</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    In Java and JavaScript, <code>==</code> binds tighter than{" "}
                    <code>&amp;</code>, so <code>a &amp; 1 == 0</code> means{" "}
                    <code>a &amp; (1 == 0)</code>. In Python the comparison binds
                    more loosely, so the same line means{" "}
                    <code>(a &amp; 1) == 0</code>. The rule differs by language, so
                    always write <code>(a &amp; 1) == 0</code>.
                  </>
                }
                zh={
                  <>
                    Java 和 JavaScript 里 <code>==</code> 比 <code>&amp;</code> 优先级高,
                    所以 <code>a &amp; 1 == 0</code> 会被解析成
                    <code>a &amp; (1 == 0)</code>;Python 的比较运算符优先级更低,
                    同一行的含义是 <code>(a &amp; 1) == 0</code>。
                    规则随语言而变,所以永远写成 <code>(a &amp; 1) == 0</code>。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <CodeTabs
          title="shift_arithmetic"
          java={{
            code: {
              en: `int a = 5;
int mul8  = a << 3;   // 5 × 8  = 40
int div2  = a >> 1;   // 5 ÷ 2  = 2 (rounded down)
int neg   = -8 >> 1;  // arithmetic shift = -4
int uneg  = -8 >>> 1; // logical shift    = 2147483644
int mid   = (lo + hi) >>> 1; // midpoint that survives lo + hi overflowing`,
              zh: `int a = 5;
int mul8  = a << 3;   // 5 × 8  = 40
int div2  = a >> 1;   // 5 ÷ 2  = 2(向下取整)
int neg   = -8 >> 1;  // 算术右移 = -4
int uneg  = -8 >>> 1; // 逻辑右移 = 2147483644
int mid   = (lo + hi) >>> 1; // lo + hi 溢出也能得到正确中点`,
            },
            hl: [5, 6],
            note: {
              en: (
                <>
                  Binary search takes the midpoint with{" "}
                  <code>(lo + hi) &gt;&gt;&gt; 1</code>. If <code>lo + hi</code>{" "}
                  overflows into a negative <code>int</code>, the logical shift
                  still reads the 32 bits as an unsigned value and gives the
                  correct midpoint. The JDK writes{" "}
                  <code>Arrays.binarySearch</code> this way. Also note that{" "}
                  <code>&gt;&gt;</code> is not the same as division for negative
                  values: <code>-7 &gt;&gt; 1</code> is −4, while{" "}
                  <code>-7 / 2</code> is −3, because division rounds toward zero
                  and the shift rounds down.
                </>
              ),
              zh: (
                <>
                  二分求中点写 <code>(lo + hi) &gt;&gt;&gt; 1</code>:即使
                  <code>lo + hi</code> 溢出成负 <code>int</code>,
                  逻辑右移仍把这 32 位当无符号值看待,给出正确的中点 ——
                  JDK 的 <code>Arrays.binarySearch</code> 就是这么写的。
                  另外注意负数上 <code>&gt;&gt;</code> 不等于除法:
                  <code>-7 &gt;&gt; 1</code> 是 −4,而 <code>-7 / 2</code> 是 −3 ——
                  除法向 0 取整,移位向下取整。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `a = 5
mul8 = a << 3     # 40
div2 = a >> 1     # 2
neg  = -8 >> 1    # -4 (Python's >> is arithmetic and rounds down)
# Python has no >>>; to imitate a 32-bit unsigned shift:
u = (-8 & 0xFFFFFFFF) >> 1   # mask to unsigned first, then shift`,
              zh: `a = 5
mul8 = a << 3     # 40
div2 = a >> 1     # 2
neg  = -8 >> 1    # -4(Python 的 >> 是算术右移,向下取整)
# Python 没有 >>>;要模拟 32 位无符号右移:
u = (-8 & 0xFFFFFFFF) >> 1   # 先掩成无符号,再移位`,
            },
            hl: [5, 6],
            note: {
              en: (
                <>
                  Python&apos;s <code>&gt;&gt;</code> rounds toward negative
                  infinity, and so does <code>//</code>, so the two agree:{" "}
                  <code>−7 &gt;&gt; 1</code> and <code>−7 // 2</code> are both −4,
                  not −3. There is no unsigned shift, so mask with{" "}
                  <code>&amp; 0xFFFFFFFF</code> first when you need one.
                </>
              ),
              zh: (
                <>
                  Python 的 <code>&gt;&gt;</code> 向负无穷取整,<code>//</code>
                  也是,所以两者一致:<code>−7 &gt;&gt; 1</code> 和
                  <code>−7 // 2</code> 都是 −4,不是 −3。
                  它没有无符号右移,需要时先 <code>&amp; 0xFFFFFFFF</code>。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `let a = 5;
let mul8 = a << 3;    // 40
let div2 = a >> 1;    // 2
let neg  = -8 >> 1;   // -4
let uneg = -8 >>> 1;  // 2147483644
let mid  = (lo + hi) >>> 1;  // midpoint, and a fast floor division`,
              zh: `let a = 5;
let mul8 = a << 3;    // 40
let div2 = a >> 1;    // 2
let neg  = -8 >> 1;   // -4
let uneg = -8 >>> 1;  // 2147483644
let mid  = (lo + hi) >>> 1;  // 求中点,同时也是快速的向下取整除法`,
            },
            hl: [5, 6],
            note: {
              en: (
                <>
                  Every bitwise operator converts its operands to a 32-bit signed
                  integer first, so <code>&lt;&lt;</code> and{" "}
                  <code>&gt;&gt;</code> give wrong results for values at or above
                  2<sup>31</sup>. Unlike Java, a JavaScript{" "}
                  <code>lo + hi</code> is float arithmetic and does not overflow, so{" "}
                  <code>&gt;&gt;&gt; 1</code> here is only a fast floor division. If
                  the sum can reach 2<sup>32</sup>, write{" "}
                  <code>Math.floor((lo + hi) / 2)</code>. For bitwise work on large
                  values use <code>BigInt</code>, which supports{" "}
                  <code>&amp;</code>, <code>|</code>, <code>^</code>,{" "}
                  <code>&lt;&lt;</code> and <code>&gt;&gt;</code> but{" "}
                  <b>not</b> <code>&gt;&gt;&gt;</code>.
                </>
              ),
              zh: (
                <>
                  每个位运算符都会先把操作数转成 32 位有符号整数,
                  所以对 ≥ 2<sup>31</sup> 的值做 <code>&lt;&lt;</code>、
                  <code>&gt;&gt;</code> 会得到错误结果。与 Java 不同,
                  JavaScript 的 <code>lo + hi</code> 是浮点运算,不会溢出,
                  所以这里的 <code>&gt;&gt;&gt; 1</code> 只是快速的向下取整除法;
                  如果和可能达到 2<sup>32</sup>,请写
                  <code>Math.floor((lo + hi) / 2)</code>。
                  要对大整数做位运算就用 <code>BigInt</code>,它支持
                  <code>&amp;</code>、<code>|</code>、<code>^</code>、
                  <code>&lt;&lt;</code>、<code>&gt;&gt;</code>,但<b>不支持</b>
                  <code>&gt;&gt;&gt;</code>。
                </>
              ),
            },
          }}
        />
      </Section>

      {/* ================= §08 题单 ================= */}
      <Section
        id="problems"
        index="08"
        title={{
          en: "Problem set: 11 bit manipulation problems",
          zh: "高频题单:位运算 11 题",
        }}
        desc={{
          en: "Grouped as XOR, counting 1 bits, an integer as a set, and simulation, easiest first",
          zh: "按「异或 → 数 1 → 位表示集合 → 模拟」分组,由易到难",
        }}
        badge={
          <span className="chip">
            <T en={<>Core set</>} zh={<>主线必做</>} />
          </span>
        }
      >
        <ProblemSet ch="bits" items={PROBLEMS} />
      </Section>

      {/* ================= §09 Quiz ================= */}
      <Section
        id="quiz"
        index="09"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Answer all 8 questions correctly to mark this chapter complete",
          zh: "8 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en={<>✎ Quiz</>} zh={<>✎ 通关测验</>} />
          </span>
        }
      >
        <Quiz ch="bits" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <T
            key="k1"
            en={
              <>
                One int is <b>32 lamps</b>, and lamp i is worth 2<sup>i</sup>.
                Negative values are stored in <b>two&apos;s complement</b>:
                −n = (~n) + 1. Two anchors: <b>0 is all 0 bits, −1 is all 1
                bits</b>.
              </>
            }
            zh={
              <>
                一个 int = <b>32 盏灯</b>,第 i 盏权值 2<sup>i</sup>;
                负数用<b>补码</b>存:−n = (~n) + 1。两个锚点:
                <b>0 = 全 0,−1 = 全 1</b>。
              </>
            }
          />,
          <T
            key="k2"
            en={
              <>
                The six operators work <b>one position at a time</b>: &amp; keeps
                bits, | turns them on, ^ flips them and cancels pairs, ~ inverts
                all of them, &lt;&lt; doubles, &gt;&gt; halves. One instruction
                handles all 32 positions, which is why they are fast.
              </>
            }
            zh={
              <>
                六个运算符都<b>逐位独立</b>:&amp; 保留、| 置 1、^ 翻转并成对抵消、
                ~ 全部取反、&lt;&lt; 翻倍、&gt;&gt; 折半。
                一条指令处理全部 32 位,所以快。
              </>
            }
          />,
          <T
            key="k3"
            en={
              <>
                The three XOR properties, <b>a^a=0, a^0=a, and reordering is
                allowed</b>, solve a whole family: the unpaired value (136), the
                differing bits (461), and the missing value (268).
              </>
            }
            zh={
              <>
                异或的三条性质 <b>a^a=0、a^0=a、可任意重排</b> 能解一整族题:
                找落单的数(136)、找不同的位(461)、找缺失的数(268)。
              </>
            }
          />,
          <T
            key="k4"
            en={
              <>
                Two expressions to remember: <b>n &amp; (n−1)</b> clears the lowest
                1 bit (counting 1 bits, testing a power of two), and{" "}
                <b>n &amp; (−n)</b> keeps only the lowest 1 bit (splitting into
                groups).
              </>
            }
            zh={
              <>
                两个必记表达式:<b>n &amp; (n−1)</b> 清掉最低位的 1(数 1、判 2 的幂);
                <b>n &amp; (−n)</b> 只留下最低位的 1(用于分组)。
              </>
            }
          />,
          <T
            key="k5"
            en={
              <>
                When XOR does not help, because values appear three or more times,
                fall back to <b>counting the 1 bits per position and taking the
                remainder modulo k</b> (137). It is plainer but more general:
                change k and it solves the other variants.
              </>
            }
            zh={
              <>
                出现三次以上、异或失灵时,退回
                <b>逐位统计 1 的个数再对 k 取模</b>(137)——
                更朴素但更普适,换个 k 就能解其它变体。
              </>
            }
          />,
          <T
            key="k6"
            en={
              <>
                <b>An integer as a set:</b> bit i says whether element i is present.
                Add with <code>|(1&lt;&lt;i)</code>, remove with{" "}
                <code>&amp;~(1&lt;&lt;i)</code>, test with{" "}
                <code>(s&gt;&gt;i)&amp;1</code>. Enumerating the non-empty subsets
                of a mask with <code>sub = (sub−1) &amp; mask</code> costs
                3<sup>n</sup> in total, and this is the basis of{" "}
                <b>state compression DP</b> in chapter 10.
              </>
            }
            zh={
              <>
                <b>整数当集合:</b>第 i 位表示元素 i 在不在。加入
                <code>|(1&lt;&lt;i)</code>、删除 <code>&amp;~(1&lt;&lt;i)</code>、
                查询 <code>(s&gt;&gt;i)&amp;1</code>。用
                <code>sub = (sub−1) &amp; mask</code> 枚举 mask 的非空子集,
                总代价是 3<sup>n</sup> —— 这是第 10 章<b>状压 DP</b> 的地基。
              </>
            }
          />,
          <T
            key="k7"
            en={
              <>
                The three languages differ, and it matters:{" "}
                <b>Java and JavaScript have &gt;&gt;&gt;</b>, the logical right
                shift. <b>Python integers have no fixed width, there is no
                &gt;&gt;&gt;</b>, and you mask with &amp; 0xFFFFFFFF yourself.{" "}
                <b>JavaScript converts to 32-bit signed</b> before every bitwise
                operator, so 1&lt;&lt;31 is negative and 1&lt;&lt;32 is 1.
              </>
            }
            zh={
              <>
                三种语言的差异必须记住:<b>Java 和 JavaScript 有 &gt;&gt;&gt;</b>
                (逻辑右移);<b>Python 整数没有固定位宽,也没有 &gt;&gt;&gt;</b>,
                要自己 &amp; 0xFFFFFFFF;<b>JavaScript 每次位运算前转成 32 位有符号</b>,
                所以 1&lt;&lt;31 是负数、1&lt;&lt;32 等于 1。
              </>
            }
          />,
        ]}
      />

      <ChapterFooter ch="bits" />
    </main>
  );
}
