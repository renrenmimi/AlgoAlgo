"use client";

// 第 4 章 · 位运算 —— 二进制/补码 → 六运算符 → 技巧表(n&(n-1)/lowbit/异或性质)
// → 位运算表示集合(状压 DP 前置)→ 移位乘除。
// 三个交互实验室在 ./viz(BitLamps 32 盏位灯 / OpLab 运算符 / SubsetLab 集合);
// XOR 消消乐用 ArrayStepper,逐位统计用 DPTable,帧数据写在本文件顶部。

import "./chapter.css";
import type { ReactNode } from "react";
import { Hero, Section, Callout, BigO, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { ArrayStepper, type ArrayFrame, type ArrayCell } from "@/lib/stepper";
import { DPTable, type DPFrame, type DPCell } from "@/lib/algviz";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { PROBLEMS, QUIZ } from "@/lib/bits-data";
import { BitLamps, OpLab, SubsetLab } from "./viz";

/* ================= 精讲 A · LC 136 XOR 消消乐(ArrayStepper) ================= */

type ACellState = "lit" | "ok" | "bad" | "ghost";
function ac(v: ReactNode, state?: ACellState): ArrayCell {
  return { v, state };
}

const F_XOR: ArrayFrame[] = [
  {
    cells: [ac(4), ac(1), ac(2), ac(1), ac(2)],
    msg: (
      <>
        数组 [4, 1, 2, 1, 2]:除了 4,其它都出现两次。目标是让成对的数
        「自己和自己抵消」。异或累加器 acc 从 <b>0</b> 出发。
      </>
    ),
  },
  {
    cells: [ac(4, "lit"), ac(1), ac(2), ac(1), ac(2)],
    ptrs: [{ i: 0, label: "acc" }],
    msg: (
      <>
        acc = 000 ^ <b>100</b> = <b>100</b> = 4(a ^ 0 = a,直接把 4 装进来)。
      </>
    ),
  },
  {
    cells: [ac(4, "ok"), ac(1, "lit"), ac(2), ac(1), ac(2)],
    ptrs: [{ i: 1, label: "acc" }],
    msg: (
      <>
        acc = 100 ^ <b>001</b> = <b>101</b> = 5。
      </>
    ),
  },
  {
    cells: [ac(4, "ok"), ac(1, "ok"), ac(2, "lit"), ac(1), ac(2)],
    ptrs: [{ i: 2, label: "acc" }],
    msg: (
      <>
        acc = 101 ^ <b>010</b> = <b>111</b> = 7。
      </>
    ),
  },
  {
    cells: [ac(4, "ok"), ac(1, "ghost"), ac(2, "ok"), ac(1, "lit"), ac(2)],
    ptrs: [{ i: 3, label: "acc" }],
    msg: (
      <>
        acc = 111 ^ <b>001</b> = <b>110</b> = 6。第二个 1 到了 —— 它和第一个 1
        <b>悄悄抵消</b>(那一位被异或回 0)。
      </>
    ),
  },
  {
    cells: [ac(4, "ok"), ac(1, "ghost"), ac(2, "ghost"), ac(1, "ghost"), ac(2, "lit")],
    ptrs: [{ i: 4, label: "acc" }],
    msg: (
      <>
        acc = 110 ^ <b>010</b> = <b>100</b> = 4。两个 2 也抵消了。
      </>
    ),
  },
  {
    cells: [ac(4, "ok"), ac(1, "ghost"), ac(2, "ghost"), ac(1, "ghost"), ac(2, "ghost")],
    msg: (
      <>
        成对的 1、2 全部两两归零,只剩 acc = <b>100 = 4</b> —— 就是那个只出现一次的数。
        一趟遍历、一个变量,<b>O(n) 时间、O(1) 空间</b>。
      </>
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
      <>
        n = 13 = 二进制 <b>1101</b>(这里左起是第 0 位)。要数它有几个 1。count = 0。
      </>
    ),
  },
  {
    cells: popCells(P13, 0),
    ptrs: [{ i: 0, label: "lowbit" }],
    msg: (
      <>
        最低位的 1 在<b>第 0 位</b>。做一次 n = n &amp; (n−1),把它清零 → count = <b>1</b>。
      </>
    ),
  },
  {
    cells: popCells(P12, 2),
    ptrs: [{ i: 2, label: "lowbit" }],
    msg: (
      <>
        n 变成 1100。现在最低位的 1 在<b>第 2 位</b>。再 n &amp; (n−1) → count = <b>2</b>。
      </>
    ),
  },
  {
    cells: popCells(P8, 3),
    ptrs: [{ i: 3, label: "lowbit" }],
    msg: (
      <>
        n 变成 1000。最低位的 1 在<b>第 3 位</b>。清零 → count = <b>3</b>。
      </>
    ),
  },
  {
    cells: popCells(P0),
    msg: (
      <>
        n 归 0,循环停止。一共做了 <b>3</b> 次 → 13 里有 <b>3</b> 个 1。
        循环次数 = 1 的个数,<b>而不是固定 32 次</b> —— 稀疏的数几步就清空。
      </>
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
      <>
        nums = [2, 2, 2, 7],每个数写成二进制排成一列。状态:
        <b>逐列(逐位)统计所有数在该位上 1 的总数</b>。Σ 与 %3 两行还是问号。
      </>
    ),
  },
  {
    cells: cells137(0, 0),
    msg: (
      <>
        第 2 位:三个 2 都是 0、7 是 1 → Σ = <b>1</b>。1 % 3 = <b>1</b> ——
        出现 3 次的数在这一位要么全 0、要么凑成 3 的倍数,%3 后<b>自动消失</b>。
      </>
    ),
  },
  {
    cells: cells137(1, 1),
    msg: (
      <>
        第 1 位:三个 2 各是 1(共 3)、7 是 1 → Σ = <b>4</b>。4 % 3 = <b>1</b> ——
        三个 2 贡献的 3 被整除干净,只剩 7 贡献的那个 1。
      </>
    ),
  },
  {
    cells: cells137(2, 2),
    msg: (
      <>
        第 0 位:三个 2 都是 0、7 是 1 → Σ = <b>1</b>,%3 = <b>1</b>。
      </>
    ),
  },
  {
    cells: cells137(3, undefined, true),
    msg: (
      <>
        %3 行从高位到低位读出 <b>111 = 7</b> —— 正是那个只出现一次的数。
        这套「逐位统计 % k」能处理「其它数都出现 <b>k</b> 次」的<b>所有</b>变体。
      </>
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "why", n: "01", label: "二进制与补码" },
  { id: "ops", n: "02", label: "六大运算符" },
  { id: "xor", n: "03", label: "异或找单身" },
  { id: "tricks", n: "04", label: "技巧表 · 数 1" },
  { id: "count", n: "05", label: "逐位统计" },
  { id: "set", n: "06", label: "位表示集合" },
  { id: "shift", n: "07", label: "移位乘除" },
  { id: "problems", n: "08", label: "高频题单" },
  { id: "quiz", n: "09", label: "通关测验" },
];

export default function BitsChapter() {
  return (
    <main className="page" data-ch="bits">
      <Hero
        ch="bits"
        title={
          <>
            位运算 <span className="grad">Bit Manipulation</span>
          </>
        }
        essence={
          <>
            一个 int 就是 <strong>32 盏灯</strong> —— 与、或、非、异或,拨的都是开关。
            这一章把整数摊平成一排灯,让你亲眼看清计算机<strong>最底层</strong>怎么算数;
            顺手学会几个「一步顶十步」的位技巧,并为第 10 章的状压 DP 埋下地基。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 二进制与补码 ================= */}
      <Section
        id="why"
        index="01"
        title="一个 int = 32 盏灯:二进制与补码"
        desc="先把整数摊平成一排开关,再搞懂负数是怎么塞进去的"
      >
        <div className="prose">
          <p>
            我们平时写的 <code>42</code> 是十进制:每一位逢十进一。但计算机只有
            <strong>「通电 / 断电」</strong>两种状态,所以它用<strong>二进制</strong>
            (binary):每一位只有 0 或 1,逢二进一。一个 32 位整数(int),就是
            <strong>一排 32 盏灯</strong> —— 每盏亮(1)或灭(0),第 i 盏的「面值」是
            2<sup>i</sup>。42 = 32 + 8 + 2 = 2<sup>5</sup> + 2<sup>3</sup> + 2<sup>1</sup>,
            所以第 5、3、1 盏亮。别光看文字 —— <strong>亲手拨</strong>:
          </p>
        </div>
        <BitLamps />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            拨到这里你可能发现了个怪事:点最左边那盏(第 31 位),数字突然变成
            <strong>负数</strong>。这就是全章第一个「为什么」——
            <strong>负数是怎么存进只有 0 和 1 的灯里的?</strong>
          </p>
          <p>
            天真的想法是「拿最高位当负号」(叫原码),但它有两个 0(+0 和 −0),
            而且加减法要分符号讨论,硬件实现很丑。真实世界用的是
            <strong>补码(two&apos;s complement)</strong>:规定
            <strong> −n 的存法 = (~n) + 1</strong>(按位取反再加一)。好处是:
            正数负数<strong>共用同一个加法器</strong>,不用管符号,溢出还会自然「绕回」。
          </p>
        </div>
        <div className="bit-twoc">
          <div className="card">
            <div className="card-kicker">起点</div>
            <div className="card-title">+5</div>
            <p className="mono">…0000 0101</p>
            <p>正数就是它本来的二进制,最高位是 0。</p>
          </div>
          <div className="card">
            <div className="card-kicker">按位取反 ~5</div>
            <div className="card-title">= −6</div>
            <p className="mono">…1111 1010</p>
            <p>每盏灯亮灭对调。补码下这个模式代表 −6(而不是 250)。</p>
          </div>
          <div className="card">
            <div className="card-kicker">~5 + 1</div>
            <div className="card-title">= −5</div>
            <p className="mono">…1111 1011</p>
            <p>取反再加一,就得到 −5 的补码。最高位 1 = 负。</p>
          </div>
        </div>
        <Callout tone="idea" title="为什么 −1 是「全 1」?一句话记住补码">
          <p>
            按规则 −1 = ~1 + 1 = 1111…1110 + 1 = <b>全 1</b>。检验一下:全 1 再 +1,
            每一位进位,最后溢出丢掉最高进位 → 变回 <b>0</b>,正好对应 −1 + 1 = 0。
            所以<b>补码不是约定俗成的花招,而是「让 x + (−x) = 0 自动成立」的唯一自洽方案</b>。
            记住两个锚点:<b>0 = 全 0,−1 = 全 1</b>,其余负数在两者之间。
          </p>
        </Callout>
        <Callout tone="story" title="「bit」这个词,是一次投票选出来的">
          <p>
            1948 年,香农(Claude Shannon)在划时代的《通信的数学理论》里首次正式使用
            <b>bit</b>(binary digit 的缩写),并说这个词是同事约翰·图基(John Tukey)
            造的。在那之前人们管信息的最小单位叫「binary digit」,又长又拗口。
            一个 bit 就是一盏灯的一次「亮 / 灭」抉择 —— 信息世界最小的一次「是 / 否」。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 六大运算符 ================= */}
      <Section
        id="ops"
        index="02"
        title="六大运算符:拨开关的六种手势"
        desc="与 & · 或 | · 异或 ^ · 非 ~ · 左移 << · 右移 >>"
      >
        <div className="prose">
          <p>
            位运算不像 + − × ÷ 那样「跨位进位」,而是<strong>每一位各算各的</strong>
            (移位除外)—— 这也是它快的原因:一条 CPU 指令同时处理 32 盏灯。
            下面这台游乐场,A、B 两排灯都能点,换个运算符,看结果灯怎么亮:
          </p>
        </div>
        <OpLab />
        <div className="table-wrap" style={{ marginTop: 18 }}>
          <table className="t-table">
            <thead>
              <tr>
                <th>运算符</th>
                <th>名字</th>
                <th>规则(单看一位)</th>
                <th>典型用途</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="mono"><b>&amp;</b></td>
                <td>与 AND</td>
                <td>两个都是 1 才得 1</td>
                <td>保留 / 检测某些位(掩码)</td>
              </tr>
              <tr>
                <td className="mono"><b>|</b></td>
                <td>或 OR</td>
                <td>任意一个是 1 就得 1</td>
                <td>打开(置 1)某些位</td>
              </tr>
              <tr>
                <td className="mono"><b>^</b></td>
                <td>异或 XOR</td>
                <td>两个不同才得 1</td>
                <td>翻转某些位 / 成对抵消</td>
              </tr>
              <tr>
                <td className="mono"><b>~</b></td>
                <td>非 NOT</td>
                <td>0 变 1、1 变 0(单目)</td>
                <td>取反,配 +1 得相反数</td>
              </tr>
              <tr>
                <td className="mono"><b>&lt;&lt;</b></td>
                <td>左移 SHL</td>
                <td>整体左移,右边补 0</td>
                <td>× 2<sup>k</sup>、造掩码 1&lt;&lt;i</td>
              </tr>
              <tr>
                <td className="mono"><b>&gt;&gt;</b></td>
                <td>右移 SHR</td>
                <td>整体右移(算术:补符号位)</td>
                <td>÷ 2<sup>k</sup>、取某一位</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="warn" title="三语言的位运算,坑各不相同(全章最重要的一张表)">
          <p>
            同一段位运算代码,搬到三种语言可能行为不同,踩过一次记一辈子:
          </p>
          <p>
            ① <b>Java</b>:<code>int</code> 就是 32 位补码;有
            <code>&gt;&gt;</code>(算术右移,补符号位)和 <code>&gt;&gt;&gt;</code>
            (无符号右移,补 0)两种右移 —— 处理「把整数当无符号位模式」时必须用
            <code>&gt;&gt;&gt;</code>,否则负数会补 1 出错。
          </p>
          <p>
            ② <b>Python</b>:整数是<b>无限位</b>、没有固定宽度,也<b>没有</b>
            <code>&gt;&gt;&gt;</code>。负数按「无限长的补码」处理,<code>~5</code>
            直接就是 −6。要模拟 32 位无符号,得手动 <code>&amp; 0xFFFFFFFF</code>;
            若结果该是负数,还要判断最高位再 <code>- (1&lt;&lt;32)</code> 转回去。
          </p>
          <p>
            ③ <b>JavaScript</b>:做位运算时会把数字<b>强制截成 32 位有符号整数</b>
            (即使 Number 本是 64 位浮点)。<code>1 &lt;&lt; 31</code> 会变成负数;
            也有 <code>&gt;&gt;&gt;</code>。超过 2<sup>31</sup> 的位操作要格外小心,
            必要时用 <code>BigInt</code>。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 异或找单身 + 精讲 A ================= */}
      <Section
        id="xor"
        index="03"
        title="异或的三条性质:落单的数无处可藏"
        desc="精讲 A · LC 136 只出现一次的数字 —— XOR 消消乐"
        badge={<span className="lc-badge" data-d="easy">EASY</span>}
      >
        <div className="prose">
          <p>
            异或(XOR,<code>^</code>)是位运算里最有「魔法感」的一个,因为它有三条
            一眼就能记住、组合起来却威力惊人的性质:
          </p>
          <div className="grid-3" style={{ margin: "14px 0" }}>
            <div className="card hoverable">
              <div className="card-kicker">性质 01</div>
              <div className="card-title mono">a ^ a = 0</div>
              <p>自己和自己异或,每一位都「相同」,全部归零 —— <b>成对消失</b>。</p>
            </div>
            <div className="card hoverable">
              <div className="card-kicker">性质 02</div>
              <div className="card-title mono">a ^ 0 = a</div>
              <p>和 0 异或,每一位都「保持原样」—— <b>落单的数原封不动</b>。</p>
            </div>
            <div className="card hoverable">
              <div className="card-kicker">性质 03</div>
              <div className="card-title mono">可交换 · 可结合</div>
              <p>顺序随便换:a^b^a = a^a^b = b。<b>能把成对的凑到一起消掉</b>。</p>
            </div>
          </div>
          <p>
            <b>题意(LC 136):</b>一个数组里,只有一个数出现一次,其余每个都出现两次,
            找出那个「单身」。<b>暴力:</b>用哈希表计数,O(n) 时间但要 O(n) 额外空间;
            排序后找落单也要 O(n log n)。<b>为什么能更优:</b>把三条性质拼起来 ——
            全体异或,成对的两两抵消(a^a=0),剩下的那个和一堆 0 异或还是它自己(a^0=a)。
            一个变量搞定,O(1) 空间。逐帧看这场「消消乐」:
          </p>
        </div>
        <ArrayStepper title="LC 136 · 全体异或,成对抵消,只剩单身" frames={F_XOR} />
        <CodeTabs
          title="lc136_single_number"
          java={{
            code: `class Solution {
    public int singleNumber(int[] nums) {
        int ans = 0;            // a ^ 0 = a,从 0 起手
        for (int x : nums) {
            ans ^= x;           // 成对的数彼此抵消(a ^ a = 0)
        }
        return ans;
    }
}`,
            hl: [5],
            note: (
              <>
                Java 里 <code>^</code> 就是异或(它<b>没有</b>乘方运算符,别把它当次方)。
                异或对溢出免疫,int 范围内绝对安全。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        ans = 0
        for x in nums:
            ans ^= x          # a ^ a = 0,a ^ 0 = a
        return ans
        # 一行版:from functools import reduce; from operator import xor
        #        return reduce(xor, nums)`,
            hl: [5],
            note: (
              <>
                Python 的乘方是 <code>**</code>,<code>^</code> 才是异或 —— 新手最爱写错。
                本题不涉及负数补码,整数无限位也不影响异或。
              </>
            ),
          }}
          js={{
            code: `var singleNumber = function (nums) {
  let ans = 0;
  for (const x of nums) {
    ans ^= x;               // 成对抵消,只剩落单的
  }
  return ans;
};`,
            hl: [4],
            note: (
              <>
                JS 位运算会把两边转成 32 位有符号整数;本题数值在 int 范围内,
                <code>^</code> 安全。乘方是 <code>**</code> 或 <code>Math.pow</code>,不是 <code>^</code>。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 面试追问链">
          <p>
            时间 <BigO o="n" />、空间 <BigO o="1" />。顺着这题往下问:
            ①「有两个数各出现一次呢?」→ <b>LC 260</b>:全体异或得 a^b,用 lowbit
            取出一位把数组分两组,各组再异或(§04 讲 lowbit);
            ②「其它数都出现<b>三</b>次呢?」→ <b>LC 137</b>:异或消不掉三个,改用
            <b>逐位统计 %3</b>(§05 精讲 C);③「求缺失的数(LC 268)?」→
            把下标和数值一起异或,成对抵消,剩下缺的那个。<b>异或是这一整族题的钥匙。</b>
          </p>
        </Callout>
        <Callout tone="deep" title="工程现场:异或的三个真身">
          <p>
            ① <b>校验</b>:最古老的 RAID 磁盘阵列用异或做奇偶校验 —— 坏掉一块盘,
            拿其余所有盘异或就能<b>还原</b>丢失的数据(a^b^c 已知任意两个可解第三个);
            ② <b>加密</b>:一次性密码本(one-time pad)就是明文 ^ 密钥,再 ^ 一次密钥即还原;
            ③ <b>不用临时变量交换两数</b>:<code>a^=b; b^=a; a^=b;</code> ——
            面试炫技可以,生产别用(可读性差,且 a、b 同地址会清零)。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 技巧表 + 精讲 B ================= */}
      <Section
        id="tricks"
        index="04"
        title="位运算技巧表:一步顶十步的手筋"
        desc="精讲 B · LC 191 位 1 的个数 —— n & (n-1) 的招牌用法"
        badge={<span className="lc-badge" data-d="easy">EASY</span>}
      >
        <div className="prose">
          <p>
            下面这张表是位运算的「常用手筋」清单,建议直接背下来 ——
            它们几乎出现在每一道位运算题里(<code>i</code> 表示第几位):
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>目的</th>
                <th>表达式</th>
                <th>为什么成立 / 用在哪</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>判断奇偶</td>
                <td className="mono">n &amp; 1</td>
                <td>最低位就是「除以 2 的余数」:1 奇、0 偶</td>
              </tr>
              <tr>
                <td>消掉最低位的 1</td>
                <td className="mono">n &amp; (n − 1)</td>
                <td>数 1 的个数(191)、判 2 的幂(231)的核心</td>
              </tr>
              <tr>
                <td>取出最低位的 1(lowbit)</td>
                <td className="mono">n &amp; (−n)</td>
                <td>补码下 −n 让最低位 1 独存 → 分组(260)、树状数组</td>
              </tr>
              <tr>
                <td>把第 i 位置 1</td>
                <td className="mono">n | (1 &lt;&lt; i)</td>
                <td>集合「加入元素 i」(§06)</td>
              </tr>
              <tr>
                <td>把第 i 位清 0</td>
                <td className="mono">n &amp; ~(1 &lt;&lt; i)</td>
                <td>集合「删除元素 i」</td>
              </tr>
              <tr>
                <td>把第 i 位翻转</td>
                <td className="mono">n ^ (1 &lt;&lt; i)</td>
                <td>翻灯 / 切换开关</td>
              </tr>
              <tr>
                <td>取出第 i 位</td>
                <td className="mono">(n &gt;&gt; i) &amp; 1</td>
                <td>集合「查询元素 i」、逐位统计(137)</td>
              </tr>
              <tr>
                <td>乘 / 除 2<sup>k</sup></td>
                <td className="mono">n &lt;&lt; k / n &gt;&gt; k</td>
                <td>移位比乘除法快(§07)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            重点讲透最常考的 <code>n &amp; (n − 1)</code>。<b>题意(LC 191):</b>
            给一个整数,数它二进制里有多少个 1(popcount,也叫汉明重量)。
            <b>暴力:</b>循环<b>固定 32 次</b>,每次 <code>(n &gt;&gt; i) &amp; 1</code>
            看一位。能不能只在「有 1」的地方花力气?<b>关键观察:</b>
            <code>n − 1</code> 会把最低位的 1 借位变 0、其右边的 0 全变 1;再和 n
            相与,<b>最低位那个 1 连同右侧一起被抹掉,更高位不动</b>。于是
            「<code>n = n &amp; (n − 1)</code> 直到 0」的循环次数,<b>正好等于 1 的个数</b>:
          </p>
        </div>
        <ArrayStepper
          title="LC 191 · n & (n−1) 逐次消掉最低位的 1(n = 13)"
          frames={F_POP}
          cellW={52}
        />
        <CodeTabs
          title="lc191_number_of_1_bits"
          java={{
            code: `public class Solution {
    public int hammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            n &= (n - 1);       // 抹掉最低位的 1
            count++;
        }
        return count;
    }
    // 内置一行:return Integer.bitCount(n);
}`,
            hl: [5, 6],
            note: (
              <>
                若改用逐位法,右移<b>必须</b>用 <code>n &gt;&gt;&gt;= 1</code>(无符号)——
                用 <code>&gt;&gt;</code> 时若最高位是 1 会一直补 1,<b>死循环</b>。
                <code>n &amp; (n−1)</code> 法不碰符号位,天然免疫。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            n &= n - 1          # 消掉最低位的 1
            count += 1
        return count
        # 最短写法:return bin(n).count("1")`,
            hl: [5, 6],
            note: (
              <>
                Python 整数无限位、无符号困扰:<code>while n</code> 减到 0 即可。
                <code>bin(n).count(&quot;1&quot;)</code> 是面试可接受的「一行流」。
              </>
            ),
          }}
          js={{
            code: `var hammingWeight = function (n) {
  let count = 0;
  while (n !== 0) {
    n &= n - 1;             // 抹掉最低位的 1
    count++;
  }
  return count;
};`,
            hl: [4, 5],
            note: (
              <>
                同样,逐位法要写 <code>n &gt;&gt;&gt;= 1</code>(无符号右移),
                否则 n 为负(最高位 1)时 <code>&gt;&gt;</code> 补符号位会无限循环。
                <code>n &amp; (n−1)</code> 版没有这个坑。
              </>
            ),
          }}
        />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">衍生 01 · LC 231</div>
            <div className="card-title">判断 2 的幂</div>
            <p>
              2 的幂二进制里<b>只有一个 1</b>。<code>n &gt; 0 &amp;&amp; (n &amp; (n−1)) == 0</code>
              —— 清掉唯一的 1 后得 0 即是。必须先判 <code>n &gt; 0</code>。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">衍生 02 · LC 461</div>
            <div className="card-title">汉明距离</div>
            <p>
              两数「有几位不同」= <code>popcount(x ^ y)</code>。异或标出不同的位,
              再用 191 数 1 —— 两招组合拳。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">衍生 03 · LC 260</div>
            <div className="card-title">两个单身</div>
            <p>
              全体异或得 a^b,用 <code>lowbit = x &amp; (−x)</code> 取一位分两组,
              每组各套一次 136。lowbit 是「分组」的利器。
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §05 逐位统计 + 精讲 C ================= */}
      <Section
        id="count"
        index="05"
        title="逐位统计:异或失灵时的通法"
        desc="精讲 C · LC 137 只出现一次的数字 II —— 其它数都出现 3 次"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意(LC 137):</b>数组里只有一个数出现一次,其余每个都出现
            <b>三次</b>,找出那个单身。<b>为什么 136 的异或失灵:</b>异或靠
            「成对(出现 2 次)抵消」,可现在每个数出现 3 次 —— a^a^a = a,消不干净。
          </p>
          <p>
            <b>换个视角想:</b>把注意力从「整个数」挪到<b>每一个二进制位</b>上。
            对某一位,出现 3 次的数要么在这位贡献 0(它是 0)、要么贡献 3(它是 1)——
            <b>不管哪种,都是 3 的倍数</b>。所以把所有数在该位上的 1 加起来、
            <b>对 3 取模</b>,3 的倍数全被整除清零,只剩<b>那个单身在这一位的值</b>。
            32 位逐位还原,答案就出来了:
          </p>
        </div>
        <DPTable
          title="LC 137 · 逐位统计:每列求和 %3(nums = [2, 2, 2, 7])"
          frames={F_137}
          colLabels={["第 2 位", "第 1 位", "第 0 位"]}
          rowLabels={["2", "2", "2", "7", "Σ 求和", "%3"]}
          cornerLabel="位"
          cellW={72}
        />
        <CodeTabs
          title="lc137_single_number_ii"
          java={{
            code: `class Solution {
    public int singleNumber(int[] nums) {
        int ans = 0;
        for (int i = 0; i < 32; i++) {
            int sum = 0;
            for (int x : nums) sum += (x >> i) & 1; // 统计第 i 位的 1
            if (sum % 3 != 0) ans |= (1 << i);      // 单身在这位是 1
        }
        return ans;
    }
}`,
            hl: [6, 7],
            note: (
              <>
                Java 的 <code>int</code> 本就是 32 位补码,<code>(x &gt;&gt; i) &amp; 1</code>
                对负数也取到正确的补码位;第 31 位若置 1,<code>ans</code>
                自动就是负数,<b>无需任何额外处理</b>。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        ans = 0
        for i in range(32):
            s = sum((x >> i) & 1 for x in nums)
            if s % 3:
                ans |= 1 << i
        # ★ 关键:Python 整数无限位,若第 31 位为 1 要手动转回负数
        if ans >= (1 << 31):
            ans -= (1 << 32)
        return ans`,
            hl: [9, 10],
            note: (
              <>
                <b>本章最大的 Python 坑:</b>整数是无限位,负数不是 32 位补码。
                逐位拼出的 <code>ans</code> 若第 31 位为 1,在 Python 里仍是个<b>大正数</b>,
                必须 <code>ans -= (1 &lt;&lt; 32)</code> 手动还原成负数。
              </>
            ),
          }}
          js={{
            code: `var singleNumber = function (nums) {
  let ans = 0;
  for (let i = 0; i < 32; i++) {
    let sum = 0;
    for (const x of nums) sum += (x >> i) & 1;
    if (sum % 3 !== 0) ans |= 1 << i;   // 结果自动是 32 位有符号
  }
  return ans;                            // 第 31 位置 1 时它自己就变负
};`,
            hl: [6, 7],
            note: (
              <>
                JS 位运算天然在 32 位有符号下进行:<code>ans |= 1 &lt;&lt; 31</code>
                会让 <code>ans</code> 直接变负,和 Java 一样无需还原 ——
                <b>反倒是 Python 需要收尾</b>。三语言差异在这题体现得淋漓尽致。
              </>
            ),
          }}
        />
        <Callout tone="idea" title="举一反三:这是「出现 k 次」的通法">
          <p>
            把 <code>% 3</code> 换成 <code>% k</code>,就能解「其它数都出现 <b>k</b> 次、
            一个数出现一次」的<b>所有</b>变体。这就是<b>逐位统计</b>的威力:
            当异或(只会消 2 的倍数)不够用时,退回「一位一位数 1、按次数取模」这个更朴素、
            却更普适的办法。137 还有个用两个变量 <code>ones / twos</code> 做状态机的
            O(n)/O(1) 炫技版,但逐位统计更好懂、更好记、也够用。
          </p>
        </Callout>
        <Callout tone="win" title="面试追问">
          <p>
            ①「不用 32 次循环、O(1) 额外空间?」→ 位运算状态机
            <code>ones = (ones ^ x) &amp; ~twos; twos = (twos ^ x) &amp; ~ones;</code>
            (能背最好,背不出就讲逐位统计的思路,面试官一样认);
            ②「数会很大 / 是 64 位?」→ 循环开到 64 位;
            ③「其它出现 5 次呢?」→ <code>% 5</code>,一个字不用改思路。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 位运算表示集合 ================= */}
      <Section
        id="set"
        index="06"
        title="位运算表示集合:状压 DP 的地基"
        desc="一个整数 = 一个集合,第 i 位 = 元素 i 在不在"
        badge={<span className="chip" data-tone="info">第 10 章前置</span>}
      >
        <div className="prose">
          <p>
            这一节是本章<strong>为第 10 章「状态压缩 DP」埋的伏笔</strong>,请务必吃透。
            核心想法极其简单:<strong>把一个整数当成一个集合</strong> ——
            第 i 盏灯亮,就表示「元素 i 在集合里」。于是「集合」这个抽象概念,
            被压缩成了一个 int,增删查改全变成一步位运算,还能整体比较、当数组下标、
            塞进哈希表。先玩一玩,再看代码:
          </p>
        </div>
        <SubsetLab />
        <CodeTabs
          title="bitset_as_set"
          java={{
            code: `int s = 0;                        // 空集
s |= (1 << i);                    // 加入元素 i
s &= ~(1 << i);                   // 删除元素 i
boolean in = ((s >> i) & 1) == 1; // 查询 i 是否在集合
int size = Integer.bitCount(s);   // 集合大小(元素个数)

// 枚举全集 {0..n-1} 的所有 2^n 个子集
for (int sub = 0; sub < (1 << n); sub++) {
    // sub 就是一个子集
}

// 枚举「某个集合 mask」的所有子集(状压 DP 的招牌循环)
for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
    // sub 遍历 mask 的每个非空子集
}`,
            hl: [7, 8, 9, 13],
            note: (
              <>
                <code>(sub − 1) &amp; mask</code> 是「求 mask 的下一个更小子集」的经典写法 ——
                第 10 章分配问题、旅行商(TSP)会反复用到。
              </>
            ),
          }}
          python={{
            code: `s = 0                       # 空集
s |= 1 << i                 # 加入元素 i
s &= ~(1 << i)              # 删除元素 i
inside = (s >> i) & 1       # 查询 i(1 在 / 0 不在)
size = bin(s).count("1")    # 集合大小

# 枚举全集 {0..n-1} 的所有子集
for sub in range(1 << n):
    ...                     # sub 是一个子集

# 枚举 mask 的所有非空子集
sub = mask
while sub:
    ...                     # 处理 sub
    sub = (sub - 1) & mask`,
            hl: [7, 8, 9, 12, 13, 15],
            note: (
              <>
                Python 没有固定位宽,<code>1 &lt;&lt; i</code> 想开多大开多大,
                状压里 n ≤ 20 左右完全够用;<code>~(1 &lt;&lt; i)</code> 在 Python 是负数,
                但和正的 <code>s</code> 相与结果正确,可放心用。
              </>
            ),
          }}
          js={{
            code: `let s = 0;                    // 空集
s |= 1 << i;                  // 加入元素 i
s &= ~(1 << i);               // 删除元素 i
const inside = (s >> i) & 1;  // 查询 i

// 枚举全集 {0..n-1} 的所有子集
for (let sub = 0; sub < (1 << n); sub++) {
  // sub 是一个子集
}

// 枚举 mask 的所有子集
for (let sub = mask; sub > 0; sub = (sub - 1) & mask) {
  // ...
}`,
            hl: [6, 7, 8, 12],
            note: (
              <>
                注意 JS 里 <code>1 &lt;&lt; 31</code> 会变负 —— 状压元素数
                <b>务必 ≤ 30</b>,否则 <code>1 &lt;&lt; n</code> 溢出 32 位有符号出错。
              </>
            ),
          }}
        />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <b>精讲小样 · LC 318 最大单词长度乘积:</b>要找两个「没有公共字母」的单词,
            使长度乘积最大。逐个字符比对太慢,但一个单词只关心「用了 a~z 里哪些字母」——
            这正是一个<b>集合</b>!把每个单词压成一个 26 位掩码(含字母 c 就点亮第 c 位),
            两个单词无公共字母 <b>⟺ mask1 &amp; mask2 == 0</b>(交集为空)。
            集合求交,从「遍历字符」降成了<b>一次位与</b>。
          </p>
        </div>
        <Callout tone="deep" title="工程现场:整数当集合无处不在">
          <p>
            ① <b>Linux 文件权限</b> <code>chmod 755</code>:每 3 个 bit 表示
            读/写/执行,一个数字编码一组开关;② <b>特性开关(feature flags)</b>:
            一个 int 存几十个布尔配置,省内存又好比较;③ <b>棋盘类游戏</b>:
            国际象棋引擎用 64 位 <b>bitboard</b> 表示整个棋盘,走子生成全靠位运算;
            ④ <b>状压 DP</b>:第 10 章会用一个 mask 记录「哪些任务已完成 / 哪些城市已访问」,
            把指数级的「集合状态」塞进一个整数下标里。<b>今天这一节,就是那一章的入场券。</b>
          </p>
        </Callout>
      </Section>

      {/* ================= §07 移位乘除 ================= */}
      <Section
        id="shift"
        index="07"
        title="移位乘除:比乘法还快的算术"
        desc="左移 = 乘 2ⁿ,右移 = 除 2ⁿ,以及那些绕不过的坑"
      >
        <div className="prose">
          <p>
            十进制里,把 <code>35</code> 末尾添个 0 变 <code>350</code>,就是 ×10;
            二进制同理:把所有灯<strong>整体左移一位</strong>、右边补 0,数值正好
            <strong>×2</strong>。所以 <code>n &lt;&lt; k</code> = n × 2<sup>k</sup>,
            <code>n &gt;&gt; k</code> = n ÷ 2<sup>k</sup>(向下取整)。移位是 CPU 最快的
            指令之一,早年编译器就靠它把 <code>×8</code> 悄悄换成 <code>&lt;&lt; 3</code>。
            回到 §02 的运算符游乐场选 <code>&lt;&lt;</code> / <code>&gt;&gt;</code>,
            能亲眼看到灯排整体平移、末位补 0。
          </p>
          <p>但移位有三个必须记住的坑:</p>
        </div>
        <div className="grid-3" style={{ marginTop: 4 }}>
          <div className="card hoverable">
            <div className="card-kicker">坑 01 · 溢出</div>
            <div className="card-title">左移会「顶出去」</div>
            <p>
              <code>1 &lt;&lt; 31</code> 在 32 位里已经点亮符号位 → 变成负数;
              再左移就把 1 顶出边界丢失。造大掩码时留神位宽。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">坑 02 · 负数右移</div>
            <div className="card-title">算术 vs 逻辑</div>
            <p>
              <code>&gt;&gt;</code> 补符号位(−8&gt;&gt;1 = −4),<code>&gt;&gt;&gt;</code>
              补 0(变大正数)。把整数当「位模式」处理时用 <code>&gt;&gt;&gt;</code>。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">坑 03 · 优先级</div>
            <div className="card-title">位运算优先级很低</div>
            <p>
              <code>a &amp; 1 == 0</code> 会被解析成 <code>a &amp; (1 == 0)</code>!
              位运算符优先级低于比较符 —— <b>老老实实加括号</b>。
            </p>
          </div>
        </div>
        <CodeTabs
          title="shift_arithmetic"
          java={{
            code: `int a = 5;
int mul8  = a << 3;   // 5 × 8  = 40
int div2  = a >> 1;   // 5 ÷ 2  = 2(向下取整)
int neg   = -8 >> 1;  // 算术右移 = -4
int uneg  = -8 >>> 1; // 无符号右移 = 2147483644
int mid   = (lo + hi) >>> 1; // 求中点,防 lo+hi 溢出的经典写法`,
            hl: [5, 6],
            note: (
              <>
                二分求中点用 <code>(lo + hi) &gt;&gt;&gt; 1</code>:即使
                <code>lo + hi</code> 溢出成负数,无符号右移也能给出正确中点 ——
                Java 官方 <code>Arrays.binarySearch</code> 就这么写。
              </>
            ),
          }}
          python={{
            code: `a = 5
mul8 = a << 3     # 40
div2 = a >> 1     # 2
neg  = -8 >> 1    # -4(Python 右移是算术右移,向下取整)
# Python 没有 >>>;要模拟 32 位无符号右移:
u = (-8 & 0xFFFFFFFF) >> 1   # 先掩成无符号再移`,
            hl: [5, 6],
            note: (
              <>
                Python 的 <code>&gt;&gt;</code> 对负数是「向下取整」除法
                (<code>−8 &gt;&gt; 1 == −4</code>,但 <code>−7 &gt;&gt; 1 == −4</code> 而非 −3)。
                没有无符号右移,必须先 <code>&amp; 0xFFFFFFFF</code>。
              </>
            ),
          }}
          js={{
            code: `let a = 5;
let mul8 = a << 3;    // 40
let div2 = a >> 1;    // 2
let neg  = -8 >> 1;   // -4
let uneg = -8 >>> 1;  // 2147483644
let mid  = (lo + hi) >>> 1; // 二分中点(也是防习惯性溢出 bug 的写法)`,
            hl: [5, 6],
            note: (
              <>
                JS 位运算前先截成 32 位有符号,所以 <code>2 ** 31</code> 以上的数做
                <code>&lt;&lt;</code>/<code>&gt;&gt;</code> 会出错;需要大整数位运算时用
                <code>BigInt</code>(但 BigInt 不支持 <code>&gt;&gt;&gt;</code>)。
              </>
            ),
          }}
        />
      </Section>

      {/* ================= §08 题单 ================= */}
      <Section
        id="problems"
        index="08"
        title="高频题单:位运算 11 题"
        desc="按「异或族 → 数 1 族 → 位表示集合 → 模拟」分层,由易到难"
        badge={<span className="chip">主线必做</span>}
      >
        <ProblemSet ch="bits" items={PROBLEMS} />
      </Section>

      {/* ================= §09 Quiz ================= */}
      <Section
        id="quiz"
        index="09"
        title="通关测验"
        desc="8 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="bits" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            一个 int = <b>32 盏灯</b>,第 i 盏面值 2<sup>i</sup>;负数用<b>补码</b>存:
            −n = (~n) + 1,记住锚点 <b>0 = 全 0、−1 = 全 1</b>。
          </>,
          <>
            六运算符<b>逐位独立</b>:&amp; 保留、| 打开、^ 翻转/抵消、~ 取反、
            &lt;&lt; ×2、&gt;&gt; ÷2 —— 一条指令拨 32 盏灯,所以快。
          </>,
          <>
            异或三性质 <b>a^a=0、a^0=a、可交换结合</b>:是「找单身」(136)、
            「找不同」(461)、「找缺失」(268)一整族题的钥匙。
          </>,
          <>
            两大手筋:<b>n &amp; (n−1)</b> 消掉最低位的 1(数 1、判 2 的幂);
            <b>n &amp; (−n)</b> 取出最低位的 1(lowbit,分组)。
          </>,
          <>
            异或失灵(出现 3 次以上)就退回<b>逐位统计 % k</b>(137)——
            更朴素但普适;<b>k</b> 换几就解「其它数出现几次」的变体。
          </>,
          <>
            <b>整数当集合</b>:第 i 位表示元素在/不在,加入 <code>|(1&lt;&lt;i)</code>、
            删除 <code>&amp;~(1&lt;&lt;i)</code>、查询 <code>(s&gt;&gt;i)&amp;1</code> ——
            这是第 10 章<b>状压 DP</b> 的地基。
          </>,
          <>
            三语言差异必背:<b>Java/JS 有 &gt;&gt;&gt;(无符号右移)</b>;
            <b>Python 整数无限位、无 &gt;&gt;&gt;,负数要 &amp; 0xFFFFFFFF</b>;
            <b>JS 位运算强制转 32 位有符号</b>(1&lt;&lt;31 变负)。
          </>,
        ]}
      />

      <ChapterFooter ch="bits" />
    </main>
  );
}
