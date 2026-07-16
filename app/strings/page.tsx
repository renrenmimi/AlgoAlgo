"use client";

// 第 12 章 · 字符串算法 —— 按样板章(第 7 章 DP)的九段式质量标准展开。
// 灵魂:【把每一次失败,都变成下一次的情报】。
// 结构:暴力为什么慢 → 前缀函数直觉 → next 构建(招牌动画)→ KMP 匹配 + 精讲 28 →
//       Rabin-Karp 滚动哈希(28 第二解)→ 精讲 459 → 回文中心扩展 + 精讲 5 + Manacher 概念 →
//       解析类 205/8 → 题单 → 测验 → 要点。
// 可视化全部在 ./viz;题单与测验数据在 lib/strings-data。

import "./chapter.css";
import { Hero, Section, Callout, BigO, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { PROBLEMS, QUIZ } from "@/lib/strings-data";
import {
  BruteForceMatch,
  NextBuilder,
  KMPMatch,
  RollingHash,
  CenterExpand,
} from "./viz";

const CHIPS = [
  { id: "why", n: "01", label: "暴力为什么慢" },
  { id: "prefix", n: "02", label: "失败=情报" },
  { id: "next", n: "03", label: "next 数组构建" },
  { id: "kmp", n: "04", label: "KMP 匹配 · 28" },
  { id: "hash", n: "05", label: "滚动哈希 · 28" },
  { id: "repeat", n: "06", label: "重复子串 · 459" },
  { id: "palindrome", n: "07", label: "回文中心扩展 · 5" },
  { id: "parse", n: "08", label: "解析类 · 205/8" },
  { id: "problems", n: "09", label: "高频题单" },
  { id: "quiz", n: "10", label: "通关测验" },
];

export default function StringsChapter() {
  return (
    <main className="page" data-ch="strings">
      <Hero
        ch="strings"
        title={
          <>
            字符串算法 <span className="grad">Strings</span>
          </>
        }
        essence={
          <>
            字符串匹配的所有聪明,都浓缩成一句话:<strong>把每一次失败,都变成下一次的情报</strong>。
            本章从「暴力法为什么把成功的比较也一起扔掉」讲起,亲手建出 KMP 的 next 数组、
            看主串指针从此永不回退;再学滚动哈希用一个数指纹一段窗口,最后回到回文的中心对称。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 暴力为什么慢 ================= */}
      <Section
        id="why"
        index="01"
        title="暴力匹配:失败后,连成功都一起扔了"
        desc="先看清浪费在哪,才知道 KMP 到底省下了什么"
      >
        <div className="prose">
          <p>
            问题朴素得不能再朴素:在文本串 haystack(长 n)里,找模式串 needle(长 m)第一次出现的位置。
            最自然的想法 —— <strong>把模式串对齐到每一个起点,逐字符比过去</strong>:对上就往右走,
            对不上就换下一个起点。这就是暴力匹配(brute force)。
          </p>
          <p>
            它能过,但慢。慢在哪?看下面这场慢放:文本 <code>abaabab</code> 里找 <code>abab</code>。
            盯住指针 <b>i</b> —— 每次失配,它都被<strong>拽回到本次起点的下一格</strong>,
            之前那几次<strong>成功</strong>的比较攒下的信息,一点没留:
          </p>
        </div>
        <BruteForceMatch />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            最坏情况有多坏?文本 <code>aaaa…aab</code>、模式 <code>aaab</code>:每个起点都要比到最后一位才失败,
            总比较次数约 n×m。这就是暴力法的 <BigO o="n2" label="O(n·m)" />。
            问题的症结不是「比较太慢」,而是<strong>每次失败都从零开始 —— 明明刚才已经确认过一大段前缀是对的</strong>。
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">浪费 01</div>
            <div className="card-title">🔙 i 回退</div>
            <p>
              失配后主串指针被拉回起点 +1。<b>已经扫过的字符要重扫一遍</b> ——
              这是 O(n·m) 的直接来源。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">浪费 02</div>
            <div className="card-title">🗑️ 情报丢弃</div>
            <p>
              失配前已经匹配的那段前缀,<b>本身就藏着模式串的结构信息</b>,
              暴力法却当垃圾扔了。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">处方</div>
            <div className="card-title">📝 记住失败</div>
            <p>
              把「失败发生时,已匹配的后缀等于哪个前缀」预先算好、存成一张表 ——
              下次失配直接查表跳位。这就是 KMP。
            </p>
          </div>
        </div>
        <Callout tone="story" title="KMP:三个人,一个理论先行的算法">
          <p>
            KMP 得名于 <b>Knuth、Morris、Pratt</b> 三人 1977 年的论文。有意思的是,Morris 是在写一个
            文本编辑器时独立摸索出这个技巧的,而 Knuth 则是从理论(下推自动机)反推出同一个算法 ——
            它是少数<b>「先被理论预言、后被工程验证」</b>的算法之一。核心洞见只有一句:
            <b>模式串失配时该退到哪,只取决于模式串自己长什么样,和文本无关</b> ——
            所以可以离线预处理。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 前缀函数直觉 ================= */}
      <Section
        id="prefix"
        index="02"
        title="前缀函数:把失败变成情报的那张表"
        desc="核心概念 —— 最长相等真前后缀,以及它凭什么让 i 不回退"
      >
        <div className="prose">
          <p>
            KMP 的全部魔法压在一个数组里,叫 <strong>前缀函数(prefix function)</strong>,
            工程里常叫 <strong>next 数组</strong>或 <strong>fail 数组</strong>。它的定义只有一句,
            但要一字一字啃透:
          </p>
        </div>
        <Callout tone="idea" title="定义(本章统一约定)">
          <p>
            <b>next[i] = 子串 pattern[0..i] 的「最长相等真前后缀」的长度。</b>
            拆开看:<b>前缀</b>是从头开始的一段、<b>后缀</b>是到结尾为止的一段、
            <b>真</b>指不能等于整个子串本身、<b>相等</b>指这个前缀和这个后缀一模一样。
            规定 next[0] = 0(单个字符没有真前后缀)。
          </p>
        </Callout>
        <div className="prose">
          <p>
            举个例子:子串 <code>abab</code>。它的真前缀有 <code>a / ab / aba</code>,
            真后缀有 <code>b / ab / bab</code>。最长的<strong>相等</strong>前后缀是 <code>ab</code>,长度 2 ——
            所以对 <code>abab</code> 而言 next 末位是 2。
          </p>
          <p>
            这个数字凭什么让主串指针 i 不回退?想象匹配到某一刻:模式串的前 j 个字符已经和文本对上了,
            第 j+1 个字符却失配了。<strong>那已匹配的这 j 个字符,既是文本的一段,也正是模式串的前缀 pattern[0..j−1]</strong>。
            如果这段前缀有一个「长度 k 的相等真前后缀」,意味着:它<strong>结尾的 k 个字符</strong>,
            和它<strong>开头的 k 个字符</strong>一样。于是我们可以让模式串直接往右滑,
            用开头这 k 个字符去顶替结尾那 k 个 —— 它们本来就相等,<strong>不用重新比,更不用把 i 拉回去</strong>。
          </p>
        </div>
        <div className="str-cmp">
          <div className="card">
            <div className="card-kicker">暴力法的世界观</div>
            <div className="card-title">🐌 失败 = 从头再来</div>
            <p>
              失配 → i 退回起点 +1,j 归零。已匹配前缀里的自相似结构,<b>完全没被利用</b>。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">KMP 的世界观</div>
            <div className="card-title">🚀 失败 = 查一次表</div>
            <p>
              失配 → i 不动,j = next[j−1]。<b>「已匹配后缀里有多长的一段等于前缀」直接决定跳到哪</b>,
              一步到位。
            </p>
          </div>
        </div>
        <Callout tone="warn" title="两种 next 约定,别混用">
          <p>
            网上的 KMP 代码有两套 next 约定:一套是本章用的<b>前缀函数 π</b>(next[i] = 前后缀长度,失配时 j = next[j−1]);
            另一套是《代码随想录》流行的<b>整体前移 / 减一</b>版(next[0] = −1)。两者算出的数不同、失配回退的写法也不同。
            <b>认准一套、代码里首尾一致就行</b> —— 混着抄必错。本章从头到尾只用前缀函数 π,配套 459/214 也都基于它。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 next 数组构建(招牌) ================= */}
      <Section
        id="next"
        index="03"
        title="next 数组构建:让模式串和自己比"
        desc="本章最难也最关键的一段 —— 请把动画一帧帧走完"
        badge={<span className="chip" data-tone="info">★ 招牌动画</span>}
      >
        <div className="prose">
          <p>
            怎么求出整张 next 表?这里藏着 KMP 最精妙的一步:<strong>构建 next 数组的过程,本身就是一次 KMP 匹配 ——
            只不过是拿模式串和它自己匹配</strong>。这叫<strong>自我匹配(self-matching)</strong>。
          </p>
          <p>
            想法是<strong>增量式</strong>的:假设 next[0..i−1] 都算好了,现在要算 next[i]。我们维护一个 j,
            表示「到上一位为止,能延续多长的相等前后缀」,起跳值就是 <code>j = next[i−1]</code>。
            然后比较新字符 pattern[i] 和 pattern[j]:
          </p>
          <ul className="str-list">
            <li>
              <b>对上了</b>(pattern[i] == pattern[j]):前后缀能再长一格,<code>j++</code>,记 <code>next[i] = j</code>。
            </li>
            <li>
              <b>没对上</b>(pattern[i] ≠ pattern[j]):当前这段前缀延不下去,就<b>回退</b> <code>j = next[j−1]</code> ——
              退到「更短的、也许还能接上」的前缀继续试,直到对上或退到 0。
            </li>
          </ul>
          <p>
            下面这张双行表把它演活了:上行是模式串 <code>abababca</code>,下行是逐格长出的 next 值。
            蓝色实线格是「当前拿来比对的前缀字符 pattern[j]」,蓝色虚线段是「已经匹配上的前缀」。
            特别留意 i=6(字符 c)那一步的<strong>连续回退</strong>:
          </p>
        </div>
        <NextBuilder />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            看懂 i=6 的回退链,就看懂了 KMP 的一半:c 先和 pattern[4]=a 比,失败;j 回退到 next[3]=2,
            和 pattern[2]=a 比,又失败;再退到 next[1]=0,和 pattern[0]=a 比,还是失败 —— 于是 next[6]=0。
            <strong>j 一路沿着 next 链往回跳,每一跳都换成一个更短的候选前缀</strong>,
            这正是失配时「重用已知信息」的机制。构建代码和匹配代码几乎是同一段:
          </p>
        </div>
        <CodeTabs
          title="prefix_function"
          java={{
            code: `// next[i] = pattern[0..i] 的最长相等真前后缀长度
int[] buildNext(String p) {
    int m = p.length();
    int[] next = new int[m];              // next[0] 默认 0
    for (int i = 1, j = 0; i < m; i++) {
        while (j > 0 && p.charAt(i) != p.charAt(j))
            j = next[j - 1];              // 失配:沿 next 链回退 j
        if (p.charAt(i) == p.charAt(j))
            j++;                          // 对上:前后缀 +1
        next[i] = j;                      // 记账
    }
    return next;
}`,
            hl: [6, 7, 8, 9],
            note: (
              <>
                <b>坑:</b>取字符必须用 <code>charAt(i)</code>,别写成 <code>p[i]</code>(Java 里 String 不能下标)。
                内层是 <code>while</code> 不是 <code>if</code> —— i=6 那样的连续回退靠它。
              </>
            ),
          }}
          python={{
            code: `# next[i] = pattern[0..i] 的最长相等真前后缀长度
def build_next(p: str) -> list[int]:
    m = len(p)
    nxt = [0] * m                         # nxt[0] = 0
    j = 0
    for i in range(1, m):
        while j > 0 and p[i] != p[j]:
            j = nxt[j - 1]                # 失配:回退 j
        if p[i] == p[j]:
            j += 1                        # 对上:+1
        nxt[i] = j
    return nxt`,
            hl: [7, 8, 9, 10],
            note: (
              <>
                <b>命名坑:</b><code>next</code> 是 Python 内置函数,用它当变量名会遮蔽内置 ——
                这里用 <code>nxt</code>。字符串可直接 <code>p[i]</code> 下标取字符。
              </>
            ),
          }}
          js={{
            code: `// next[i] = pattern[0..i] 的最长相等真前后缀长度
function buildNext(p) {
  const m = p.length;
  const next = new Array(m).fill(0);      // next[0] = 0
  for (let i = 1, j = 0; i < m; i++) {
    while (j > 0 && p[i] !== p[j])
      j = next[j - 1];                    // 失配:回退 j
    if (p[i] === p[j]) j++;               // 对上:+1
    next[i] = j;                          // 记账
  }
  return next;
}`,
            hl: [6, 7, 8, 9],
            note: (
              <>
                <b>细节:</b>JS 里 <code>p[i]</code> 返回单字符字符串,用 <code>===</code> 比较完全正确。
                <code>new Array(m).fill(0)</code> 一次铺好 0,省去 next[0] 的特判。
              </>
            ),
          }}
        />
        <Callout tone="win" title="为什么构建也是 O(m)?一句摊还就说清">
          <p>
            外层 i 走 m 步,内层 while 看似可能反复回退很多次 —— 但注意:j 每次<b>最多 +1</b>(只在对上时),
            而 while 每转一圈 j <b>至少 −1</b>。j 一辈子涨的总量不超过 m,那它跌的总量也不超过 m ——
            所以内层回退的总次数被摊还到 <b>O(m)</b>。构建 + 匹配合起来就是 <BigO o="n" label="O(n + m)" />。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 KMP 匹配 + 精讲 A(28) ================= */}
      <Section
        id="kmp"
        index="04"
        title="KMP 匹配:i 永不回退"
        desc="精讲 A · LC 28 实现 strStr —— next 表建好后,匹配水到渠成"
        badge={<span className="lc-badge" data-d="easy">EASY</span>}
      >
        <div className="prose">
          <p>
            有了 next 表,匹配过程和构建过程<strong>长得几乎一模一样</strong>,只是把「模式串对自己」换成「模式串对文本」。
            维护一个 j 表示当前已匹配的模式串长度:文本字符 haystack[i] 和 pattern[j] 比,
            对上就 <code>j++</code>;失配就 <code>j = next[j−1]</code> —— <strong>而 i 从头到尾只增不减</strong>。
            当 j 涨到 m,就命中了。还是那组 <code>abaabab</code> / <code>abab</code>,这次用 KMP 走一遍,
            对比刚才暴力法的狼狈:
          </p>
        </div>
        <KMPMatch />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <b>题意(LC 28):</b>返回 needle 在 haystack 中第一次出现的下标,不存在返回 −1。
            <b> 暴力:</b>刚才演示过,<BigO o="n2" label="O(n·m)" />。
            <b> 为什么能优化:</b>失配时,已匹配的后缀里藏着「等于某前缀」的结构 ——
            next 表把它预先量好,失配就跳位而非回退。<b> 正解:</b>先 O(m) 建 next,再 O(n) 扫文本:
          </p>
        </div>
        <CodeTabs
          title="lc28_strstr_kmp"
          java={{
            code: `class Solution {
    public int strStr(String haystack, String needle) {
        int n = haystack.length(), m = needle.length();
        if (m == 0) return 0;
        int[] next = new int[m];                 // ① 建 next 表
        for (int i = 1, j = 0; i < m; i++) {
            while (j > 0 && needle.charAt(i) != needle.charAt(j))
                j = next[j - 1];
            if (needle.charAt(i) == needle.charAt(j)) j++;
            next[i] = j;
        }
        for (int i = 0, j = 0; i < n; i++) {     // ② 扫文本,i 永不回退
            while (j > 0 && haystack.charAt(i) != needle.charAt(j))
                j = next[j - 1];                 // 失配:只回退 j
            if (haystack.charAt(i) == needle.charAt(j)) j++;
            if (j == m) return i - m + 1;        // 命中:算出起点
        }
        return -1;
    }
}`,
            hl: [12, 13, 14, 15, 16],
            note: (
              <>
                <b>对称之美:</b>两段循环结构完全一样,只是比较对象从 <code>needle vs needle</code> 换成
                <code>haystack vs needle</code>。命中下标是 <code>i − m + 1</code>(i 停在末字符上)。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        n, m = len(haystack), len(needle)
        if m == 0:
            return 0
        nxt = [0] * m                            # ① 建 next 表
        j = 0
        for i in range(1, m):
            while j > 0 and needle[i] != needle[j]:
                j = nxt[j - 1]
            if needle[i] == needle[j]:
                j += 1
            nxt[i] = j
        j = 0
        for i in range(n):                       # ② 扫文本,i 永不回退
            while j > 0 and haystack[i] != needle[j]:
                j = nxt[j - 1]
            if haystack[i] == needle[j]:
                j += 1
            if j == m:
                return i - m + 1
        return -1`,
            hl: [15, 16, 17, 18, 19, 20],
            note: (
              <>
                两个 <code>j = 0</code> 分别是构建、匹配的初始化 —— 别忘了匹配前把 j 归零。
                Python 字符串切片 <code>haystack[i:i+m]</code> 也能判匹配,但那会退化成 O(nm)。
              </>
            ),
          }}
          js={{
            code: `var strStr = function (haystack, needle) {
  const n = haystack.length, m = needle.length;
  if (m === 0) return 0;
  const next = new Array(m).fill(0);             // ① 建 next 表
  for (let i = 1, j = 0; i < m; i++) {
    while (j > 0 && needle[i] !== needle[j]) j = next[j - 1];
    if (needle[i] === needle[j]) j++;
    next[i] = j;
  }
  for (let i = 0, j = 0; i < n; i++) {           // ② 扫文本,i 永不回退
    while (j > 0 && haystack[i] !== needle[j]) j = next[j - 1];
    if (haystack[i] === needle[j]) j++;
    if (j === m) return i - m + 1;               // 命中
  }
  return -1;
};`,
            hl: [10, 11, 12, 13],
            note: (
              <>
                时间 <b>O(n + m)</b>、空间 <b>O(m)</b>(next 表)。JS 用 <code>str[i]</code> 取字符即可,
                无需 charCodeAt —— 单字符串比较是安全的。
              </>
            ),
          }}
        />
        <Callout tone="deep" title="工程现场:KMP 家族在哪儿干活">
          <p>
            单模式匹配的老大哥其实是 <b>Boyer-Moore</b>(grep、编辑器的默认查找多用它的变体,从右往左比 + 坏字符跳得更远);
            而 KMP 的思想被推广成 <b>Aho-Corasick 自动机</b>,一次扫描同时匹配成千上万个模式 ——
            杀毒软件的病毒特征库、入侵检测系统(IDS)的规则引擎、敏感词过滤,背后都是它。
            <b>「预处理模式、换取匹配时不回退」</b>这个思路,是所有高效匹配算法的共同起点。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 Rabin-Karp 滚动哈希(28 第二解) ================= */}
      <Section
        id="hash"
        index="05"
        title="换个思路:用一个数指纹一段窗口"
        desc="精讲 A 续 · LC 28 第二解法 —— Rabin-Karp 滚动哈希"
        badge={<span className="chip">同题双解</span>}
      >
        <div className="prose">
          <p>
            KMP 靠「预处理模式串」提速;还有一条完全不同的路 —— <strong>Rabin-Karp</strong>:
            把长度 m 的子串<strong>哈希成一个数</strong>(像一枚指纹)。要判两段子串是否相等,
            先比它们的哈希值:哈希不同,一定不等,直接跳过;哈希相同,才逐字符复核。
          </p>
          <p>
            但如果每个窗口都重新算一遍哈希,那还是 O(n·m),白忙。关键技巧是<strong>滚动哈希(rolling hash)</strong>:
            窗口向右滑一格时,<strong>只需 O(1) 更新</strong> —— 减去移出字符的贡献、整体乘以基数、加上新进字符。
            像一个数字在十进制里「掐头接尾」。看动画:
          </p>
        </div>
        <RollingHash />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            把子串看成一个 base 进制的数:<code>hash = c₀·baseᵐ⁻¹ + c₁·baseᵐ⁻² + … + cₘ₋₁</code>。
            窗口右移时,<strong>移出最高位、其余整体左移一位(×base)、在最低位补入新字符</strong>,
            所以更新是 O(1)。为防止数值爆炸,全程对一个<strong>大质数取模</strong>:
          </p>
        </div>
        <CodeTabs
          title="lc28_strstr_rabinkarp"
          java={{
            code: `class Solution {
    public int strStr(String haystack, String needle) {
        int n = haystack.length(), m = needle.length();
        if (m == 0) return 0;
        if (m > n) return -1;
        long MOD = 1_000_000_007L, BASE = 26;
        long high = 1;                       // BASE^(m-1) % MOD:最高位权重
        for (int i = 0; i < m - 1; i++) high = high * BASE % MOD;
        long hp = 0, hh = 0;                  // 模式哈希 / 首窗口哈希
        for (int i = 0; i < m; i++) {
            hp = (hp * BASE + needle.charAt(i)) % MOD;
            hh = (hh * BASE + haystack.charAt(i)) % MOD;
        }
        for (int i = 0; ; i++) {
            if (hp == hh && haystack.substring(i, i + m).equals(needle))
                return i;                    // 哈希撞上 → 逐字符复核
            if (i + m >= n) break;
            hh = (hh - haystack.charAt(i) * high % MOD + MOD) % MOD; // 移出高位
            hh = (hh * BASE + haystack.charAt(i + m)) % MOD;         // 移入低位
        }
        return -1;
    }
}`,
            hl: [18, 19, 20],
            note: (
              <>
                <b>取模防溢出:</b>减法后可能变负,先 <code>+ MOD</code> 再取模;哈希用 <code>long</code> 存,
                别用 int(<code>char × high</code> 会溢出)。哈希相等仍要 <code>equals</code> 复核防碰撞。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        n, m = len(haystack), len(needle)
        if m == 0:
            return 0
        if m > n:
            return -1
        MOD, BASE = 10**9 + 7, 26
        high = pow(BASE, m - 1, MOD)          # 最高位权重(内置快速幂)
        hp = hh = 0
        for i in range(m):
            hp = (hp * BASE + ord(needle[i])) % MOD
            hh = (hh * BASE + ord(haystack[i])) % MOD
        for i in range(n - m + 1):
            if hp == hh and haystack[i:i + m] == needle:
                return i                      # 哈希撞上 → 复核
            if i + m < n:
                hh = (hh - ord(haystack[i]) * high) % MOD      # 移出
                hh = (hh * BASE + ord(haystack[i + m])) % MOD  # 移入
        return -1`,
            hl: [16, 17, 18, 19],
            note: (
              <>
                Python 大整数天然不溢出,但仍取模以压制碰撞、控制常数;负数取模在 Python 里<b>自动</b>落回
                <code>[0, MOD)</code>,不必手动 <code>+ MOD</code>。<code>pow(b, e, MOD)</code> 是内置快速幂。
              </>
            ),
          }}
          js={{
            code: `var strStr = function (haystack, needle) {
  const n = haystack.length, m = needle.length;
  if (m === 0) return 0;
  if (m > n) return -1;
  const MOD = 1000000007n, BASE = 26n;        // 用 BigInt 防丢精度
  let high = 1n;
  for (let i = 0; i < m - 1; i++) high = (high * BASE) % MOD;
  let hp = 0n, hh = 0n;
  for (let i = 0; i < m; i++) {
    hp = (hp * BASE + BigInt(needle.charCodeAt(i))) % MOD;
    hh = (hh * BASE + BigInt(haystack.charCodeAt(i))) % MOD;
  }
  for (let i = 0; ; i++) {
    if (hp === hh && haystack.slice(i, i + m) === needle) return i;
    if (i + m >= n) break;
    hh = (hh - BigInt(haystack.charCodeAt(i)) * high % MOD + MOD) % MOD;
    hh = (hh * BASE + BigInt(haystack.charCodeAt(i + m))) % MOD;
  }
  return -1;
};`,
            hl: [5, 15, 16, 17],
            note: (
              <>
                <b>防溢出坑:</b>JS 的 Number 超过 2⁵³ 会丢精度,哈希会算错 —— 必须用 <code>BigInt</code>(带 <code>n</code> 后缀)。
                代价是常数变大,但保证取模正确。
              </>
            ),
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>算法</th>
                <th>预处理</th>
                <th>匹配</th>
                <th>空间</th>
                <th>脾气</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>暴力</b></td>
                <td>—</td>
                <td><BigO o="n2" label="O(n·m)" /></td>
                <td><BigO o="1" /></td>
                <td>短串够用;写起来最快,最坏最慢</td>
              </tr>
              <tr>
                <td><b>KMP</b></td>
                <td><BigO o="n" label="O(m)" /></td>
                <td><BigO o="n" label="O(n)" /></td>
                <td><BigO o="n" label="O(m)" /></td>
                <td><b>最坏也稳定 O(n+m)</b>,不怕刁难数据</td>
              </tr>
              <tr>
                <td><b>Rabin-Karp</b></td>
                <td><BigO o="n" label="O(m)" /></td>
                <td><BigO o="n" label="O(n) 均摊" /></td>
                <td><BigO o="1" /></td>
                <td>易推广到多模式;有碰撞风险,需复核</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="warn" title="哈希会撒谎:碰撞与它的解药">
          <p>
            哈希把一整段字符串压成一个数,<b>必然可能碰撞</b> —— 两段不同的子串哈希相同。所以哈希相等只是「疑似匹配」,
            <b>必须逐字符复核</b>。真出现大量碰撞(比如被对抗性数据攻击),匹配会退化到 O(n·m)。
            工程上的解药是<b>双哈希</b>(两组不同的 base/mod,同时相等才算命中),把碰撞概率压到可以忽略。
          </p>
        </Callout>
        <Callout tone="deep" title="工程现场:滚动哈希比你想的更常见">
          <p>
            <b>rsync</b> 增量同步、<b>git</b> 找相同数据块、网盘的秒传去重,都用滚动哈希(Rabin fingerprint)
            把文件切成内容定界的块,只传变化的部分;论文查重、代码抄袭检测,也靠对滑动窗口哈希建指纹库。
            「一段内容 → 一个可 O(1) 滚动更新的指纹」这个想法,早已溢出了字符串匹配的范畴。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 精讲 B(459) ================= */}
      <Section
        id="repeat"
        index="06"
        title="next 数组的神来一笔"
        desc="精讲 B · LC 459 重复的子字符串 —— 一行判据,背后全是前后缀"
        badge={<span className="lc-badge" data-d="easy">EASY</span>}
      >
        <div className="prose">
          <p>
            <b>题意(LC 459):</b>判断字符串 s 是否可以由它的某个子串<strong>重复多次</strong>拼成。
            如 <code>abab</code> = <code>ab</code>×2 → true;<code>aba</code> → false。
            <b> 暴力:</b>枚举所有可能的循环节长度 d(d 必须整除 n),逐个验证,O(n²) 上下。
            <b> 为什么能优化:</b>循环结构会在 next 数组里留下清晰的指纹。
          </p>
          <p>
            设 n = s.length,<code>k = next[n−1]</code>(整串的最长相等真前后缀长度)。核心结论:
          </p>
        </div>
        <Callout tone="idea" title="判据:k > 0 且 n % (n − k) == 0">
          <p>
            循环节的候选长度就是 <b>n − k</b>。直觉:如果 s 由长度 d 的子串重复 t 次(t ≥ 2)构成,
            那么「去掉最后一个循环节」的前缀,和「去掉第一个循环节」的后缀会完全重合 ——
            这个重合长度正是 <b>n − d</b>,也就是 next[n−1]。反解出 d = n − k;
            再验证 d 能整除 n(严丝合缝铺满),且 k &gt; 0(存在非平凡的自相似),即可。
          </p>
        </Callout>
        <div className="prose">
          <p>
            拿 <code>abababca</code> 之外的例子验一下:<code>abcabcabc</code>,n=9,next 末位 k=6,
            候选循环节长 = 9 − 6 = 3,而 9 % 3 == 0 且 6 &gt; 0 → true,循环节是 <code>abc</code>。
            再看 <code>aba</code>,n=3,k=1,候选长 = 2,但 3 % 2 ≠ 0 → false。判据严丝合缝:
          </p>
        </div>
        <CodeTabs
          title="lc459_repeated_substring"
          java={{
            code: `class Solution {
    public boolean repeatedSubstringPattern(String s) {
        int n = s.length();
        int[] next = new int[n];
        for (int i = 1, j = 0; i < n; i++) {         // 建 next 表
            while (j > 0 && s.charAt(i) != s.charAt(j))
                j = next[j - 1];
            if (s.charAt(i) == s.charAt(j)) j++;
            next[i] = j;
        }
        int k = next[n - 1];                          // 最长相等真前后缀
        return k > 0 && n % (n - k) == 0;             // 循环节 n-k 整除 n
    }
}`,
            hl: [11, 12],
            note: (
              <>
                只用到 next 末位一个值,却要把整张表建出来 —— 因为 next[n−1] 依赖它前面全部。
                <code>k &gt; 0</code> 不能漏:否则会把 <code>abcd</code> 这种无自相似串误判。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def repeatedSubstringPattern(self, s: str) -> bool:
        n = len(s)
        nxt = [0] * n
        j = 0
        for i in range(1, n):                         # 建 next 表
            while j > 0 and s[i] != s[j]:
                j = nxt[j - 1]
            if s[i] == s[j]:
                j += 1
            nxt[i] = j
        k = nxt[n - 1]
        return k > 0 and n % (n - k) == 0`,
            hl: [12, 13],
            note: (
              <>
                <b>一行流备选:</b><code>return s in (s + s)[1:-1]</code> —— 把 s 接两遍、掐头去尾,
                若还能找到 s,则 s 必由重复子串构成。优雅,但判子串是 O(n²)(除非内部用 KMP)。
              </>
            ),
          }}
          js={{
            code: `var repeatedSubstringPattern = function (s) {
  const n = s.length;
  const next = new Array(n).fill(0);
  for (let i = 1, j = 0; i < n; i++) {            // 建 next 表
    while (j > 0 && s[i] !== s[j]) j = next[j - 1];
    if (s[i] === s[j]) j++;
    next[i] = j;
  }
  const k = next[n - 1];
  return k > 0 && n % (n - k) === 0;              // 循环节 n-k 整除 n
};`,
            hl: [9, 10],
            note: (
              <>
                <b>一行流备选:</b><code>return (s + s).slice(1, -1).includes(s)</code>。同样漂亮,
                但 <code>includes</code> 最坏 O(n²);想稳定 O(n) 还得走 next 数组。
              </>
            ),
          }}
        />
        <Callout tone="win" title="面试追问:两种解法都要能讲">
          <p>
            面试里 459 常和 28 连着问。稳妥的答法:「我可以用一行的 <code>(s+s)</code> 掐头去尾判子串,
            思路是任何旋转都藏在双倍串里;但它依赖库函数的子串查找,最坏 O(n²)。
            要保证 O(n),我用 next 数组:<code>k=next[n−1]</code>,判 <code>k&gt;0 且 n%(n−k)==0</code> ——
            循环节长度就是 n−k。」把「优雅解 + 复杂度稳的解」都端出来,分数最高。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 回文中心扩展 + 精讲 C(5) ================= */}
      <Section
        id="palindrome"
        index="07"
        title="回文:从中心向两边照镜子"
        desc="精讲 C · LC 5 最长回文子串(复盘)+ Manacher 概念"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            换个赛道 —— <strong>回文(palindrome)</strong>:正着读反着读一样,如 <code>aba</code>、<code>abba</code>。
            <b> 题意(LC 5):</b>找字符串里最长的回文子串。
            <b> 暴力:</b>枚举所有 O(n²) 个子串,逐个验证是否回文(每个 O(n)),总 O(n³)。
            <b> 为什么能优化:</b>回文的本质是<strong>关于中心对称</strong> ——
            与其枚举「两端」再验证,不如枚举「中心」向两侧扩张,天然保证对称。
          </p>
          <p>
            DataData(数据结构篇)的双指针章讲过中心扩展的直觉,这里作复盘并接上 Manacher。
            唯一的坑是<strong>回文分奇偶</strong>:<code>aba</code> 的中心是一个字符,<code>abba</code> 的中心
            在两个字符的缝隙里。所以要枚举 <strong>2n−1</strong> 个中心(n 个字符 + n−1 个缝隙)。看动画:
          </p>
        </div>
        <CenterExpand />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            实现上有个经典的<strong>差一错(off-by-one)</strong>:扩张循环退出时,左右指针各<strong>多走了一步</strong>
            (停在「照不上」的那一对上),所以真正的回文区间是 <code>[l+1, r−1]</code>,长度 <code>r−l−1</code>。
            记牢这一点,代码就顺了:
          </p>
        </div>
        <CodeTabs
          title="lc5_longest_palindrome"
          java={{
            code: `class Solution {
    private int lo = 0, len = 0;

    public String longestPalindrome(String s) {
        if (s.length() < 2) return s;
        for (int i = 0; i < s.length(); i++) {
            expand(s, i, i);        // 奇数长度:中心是字符 i
            expand(s, i, i + 1);    // 偶数长度:中心在 i、i+1 之间
        }
        return s.substring(lo, lo + len);
    }

    private void expand(String s, int l, int r) {
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
            l--; r++;               // 照得上,继续向两侧扩
        }
        if (r - l - 1 > len) {      // 退出时回文是 [l+1, r-1]
            len = r - l - 1;
            lo = l + 1;
        }
    }
}`,
            hl: [15, 16, 17, 18],
            note: (
              <>
                <b>差一坑:</b>while 退出时 l、r 各多走一步,回文长度是 <code>r − l − 1</code> 而非 r − l。
                奇偶两种中心都要试,漏一种就会错过一半回文。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        def expand(l: int, r: int) -> str:
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            return s[l + 1:r]          # 回文区间 [l+1, r-1]

        best = ""
        for i in range(len(s)):
            best = max(best, expand(i, i), expand(i, i + 1), key=len)
        return best`,
            hl: [3, 4, 5, 6, 7],
            note: (
              <>
                <code>expand</code> 直接返回回文子串,配合 <code>max(..., key=len)</code> 一行选最长 ——
                Python 的省心写法。切片 <code>s[l+1:r]</code> 天然对应 [l+1, r−1](右端开区间)。
              </>
            ),
          }}
          js={{
            code: `var longestPalindrome = function (s) {
  let best = "";
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      l--;
      r++;
    }
    return s.slice(l + 1, r);         // 回文区间 [l+1, r-1]
  };
  for (let i = 0; i < s.length; i++) {
    const odd = expand(i, i);         // 奇中心
    const even = expand(i, i + 1);    // 偶中心
    if (odd.length > best.length) best = odd;
    if (even.length > best.length) best = even;
  }
  return best;
};`,
            hl: [3, 8, 11, 12],
            note: (
              <>
                时间 <b>O(n²)</b>、空间 <b>O(1)</b>。<code>slice(l+1, r)</code> 右端开,正好取到 [l+1, r−1]。
                每个中心最多扩到边界,共 2n−1 个中心。
              </>
            ),
          }}
        />
        <Callout tone="deep" title="Manacher:把 O(n²) 压到 O(n)(只讲概念)">
          <p>
            中心扩展会在相邻中心间<b>重复扩同一片区域</b>。Manacher 算法的洞见:如果当前中心落在某个<b>已知大回文</b>的内部,
            那它的回文半径可以<b>借用「关于大回文中心对称的那个位置」的已知半径</b>,直接跳过一大段重复扩张 ——
            这和 KMP「用已知信息避免重复」的精神如出一辙。再配一个「把 <code>abba</code> 插成 <code>#a#b#b#a#</code>」的技巧
            统一奇偶,总复杂度 <BigO o="n" />。面试极少要求手写 Manacher,但<b>知道它存在、知道它靠对称性省重复</b>,
            就够了 —— 大多数场景 O(n²) 的中心扩展完全够用。
          </p>
        </Callout>
        <Callout tone="win" title="回文题的家族地图">
          <p>
            回文子串有两条主线:<b>连续子串</b>(本题,中心扩展 / Manacher / 区间 DP)与<b>子序列</b>
            (LC 516 最长回文子序列,那是区间 DP,在第 10 章)。此外 LC 214 最短回文串会把回文和 KMP 焊在一起 ——
            构造 <code>s + &apos;#&apos; + reverse(s)</code> 求 next 末位,就是「s 的最长回文前缀」。
            <b>回文 = 字符串与它翻转的自相似</b>,这个视角能串起本章一大半题。
          </p>
        </Callout>
      </Section>

      {/* ================= §08 解析类 205 / 8 ================= */}
      <Section
        id="parse"
        index="08"
        title="解析类:把模糊的规则翻译成确定的逻辑"
        desc="LC 205 同构字符串 · LC 8 字符串转整数 —— 不靠花招,靠严谨"
      >
        <div className="prose">
          <p>
            不是所有字符串题都关于「匹配」。另一大类是<strong>解析 / 映射</strong>:考的不是算法花招,
            而是<strong>把一堆边界规则不重不漏地翻译成代码</strong>。这类题面试官偏爱,因为它逼近真实工作 ——
            把产品经理含糊的需求变成确定的逻辑。
          </p>
          <p>
            <b>LC 205 同构字符串:</b>问 s 能否通过「字符一对一替换」变成 t(<code>egg → add</code> 行,
            <code>foo → bar</code> 不行,因为 o 想同时变成 a 和 r)。关键是<strong>双向映射</strong>:
            不仅 s→t 要一致,t→s 也要一致 —— 只查单向会放过「两个不同字符挤到同一个目标」的情况:
          </p>
        </div>
        <CodeTabs
          title="lc205_isomorphic"
          java={{
            code: `class Solution {
    public boolean isIsomorphic(String s, String t) {
        int[] m1 = new int[128], m2 = new int[128]; // 存「上次位置 + 1」,0 = 没出现过
        for (int i = 0; i < s.length(); i++) {
            char a = s.charAt(i), b = t.charAt(i);
            if (m1[a] != m2[b]) return false;   // 两个方向的指纹必须一致
            m1[a] = m2[b] = i + 1;              // 同步更新
        }
        return true;
    }
}`,
            hl: [6, 7],
            note: (
              <>
                <b>巧解:</b>不存「映射到谁」,而存「上次出现的位置」。两个字符若同构,它们在各自串里的
                「上次位置」必然同步变化 —— 一个比较搞定双向。用长度 128 的数组覆盖 ASCII。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        m1, m2 = {}, {}
        for a, b in zip(s, t):
            if m1.get(a, b) != b or m2.get(b, a) != a:
                return False          # 任一方向冲突即判否
            m1[a], m2[b] = b, a
        return True`,
            hl: [5, 6],
            note: (
              <>
                <code>zip(s, t)</code> 同步遍历两串;<code>m1.get(a, b)</code> 的默认值取 b ——
                首次出现时 <code>b != b</code> 恒假,自动放行,省掉 <code>if a in m1</code> 的分支。
              </>
            ),
          }}
          js={{
            code: `var isIsomorphic = function (s, t) {
  const m1 = new Map(), m2 = new Map();
  for (let i = 0; i < s.length; i++) {
    const a = s[i], b = t[i];
    if ((m1.has(a) && m1.get(a) !== b) ||
        (m2.has(b) && m2.get(b) !== a)) return false; // 双向都要查
    m1.set(a, b);
    m2.set(b, a);
  }
  return true;
};`,
            hl: [5, 6],
            note: (
              <>
                两张 Map 分别管 s→t、t→s。反例 <code>badc → baba</code>:只查 m1 会漏,加上 m2 才能发现
                d、c 都想映射到同一个字符。O(n) 时间。
              </>
            ),
          }}
        />
        <div className="prose" style={{ marginTop: 18 }}>
          <p>
            <b>LC 8 字符串转整数(atoi):</b>把一段可能带前导空格、正负号、非法字符的文本解析成 32 位整数。
            算法为零,全是规则。把它拆成一个<strong>状态机</strong>就清晰了:
            ①跳前导空格 → ②读一个可选符号 → ③连续吃数字 → ④遇非数字立即停 → ⑤溢出夹到 [INT_MIN, INT_MAX]:
          </p>
        </div>
        <CodeTabs
          title="lc8_atoi"
          java={{
            code: `class Solution {
    public int myAtoi(String s) {
        int i = 0, n = s.length();
        while (i < n && s.charAt(i) == ' ') i++;      // ① 跳空格
        if (i == n) return 0;
        int sign = 1;
        if (s.charAt(i) == '+' || s.charAt(i) == '-') { // ② 符号
            sign = s.charAt(i) == '-' ? -1 : 1;
            i++;
        }
        long ans = 0;                                  // ③ 吃数字(long 暂存)
        while (i < n && Character.isDigit(s.charAt(i))) {
            ans = ans * 10 + (s.charAt(i) - '0');
            if (sign == 1 && ans > Integer.MAX_VALUE) return Integer.MAX_VALUE;
            if (sign == -1 && -ans < Integer.MIN_VALUE) return Integer.MIN_VALUE;
            i++;                                       // ⑤ 边读边夹紧
        }
        return (int) (sign * ans);
    }
}`,
            hl: [14, 15],
            note: (
              <>
                <b>溢出坑:</b>用 <code>long</code> 暂存,每加一位就和 int 边界比,超了立刻返回边界值 ——
                别等算完(可能连 long 都溢出)。<code>s.charAt(i) − &apos;0&apos;</code> 把字符转成数字。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def myAtoi(self, s: str) -> int:
        i, n = 0, len(s)
        while i < n and s[i] == ' ':          # ① 跳空格
            i += 1
        if i == n:
            return 0
        sign = 1
        if s[i] in '+-':                       # ② 符号
            sign = -1 if s[i] == '-' else 1
            i += 1
        ans = 0
        while i < n and s[i].isdigit():        # ③ 吃数字
            ans = ans * 10 + int(s[i])
            i += 1
        ans *= sign
        INT_MIN, INT_MAX = -2**31, 2**31 - 1   # ⑤ 一次性夹紧
        return max(INT_MIN, min(INT_MAX, ans))`,
            hl: [17, 18],
            note: (
              <>
                Python 整数<b>无限精度</b>,可以放心先算完再夹紧,不必逐位防溢出 —— 这是 Python 解析题的省心处。
                <code>s[i].isdigit()</code> 判数字,<code>s[i] in &apos;+-&apos;</code> 判符号。
              </>
            ),
          }}
          js={{
            code: `var myAtoi = function (s) {
  let i = 0;
  const n = s.length;
  while (i < n && s[i] === ' ') i++;              // ① 跳空格
  let sign = 1;
  if (s[i] === '+' || s[i] === '-') {             // ② 符号
    if (s[i] === '-') sign = -1;
    i++;
  }
  let ans = 0;
  while (i < n && s[i] >= '0' && s[i] <= '9') {   // ③ 吃数字
    ans = ans * 10 + (s.charCodeAt(i) - 48);
    i++;
  }
  ans *= sign;
  const MIN = -(2 ** 31), MAX = 2 ** 31 - 1;      // ⑤ 夹紧
  return Math.max(MIN, Math.min(MAX, ans));
};`,
            hl: [15, 16],
            note: (
              <>
                <code>s[i] &gt;= &apos;0&apos; &amp;&amp; s[i] &lt;= &apos;9&apos;</code> 靠字符编码比较判数字。超长数字串会让 ans 丢精度,
                但反正会被夹到边界,结果仍对。<code>charCodeAt(i) − 48</code> 即 <code>− &apos;0&apos;</code>。
              </>
            ),
          }}
        />
        <Callout tone="warn" title="解析题的通病:边界不是附加题,是主考题">
          <p>
            atoi 的分数几乎全在边界上:<b>空串、纯空格、只有一个符号、符号后无数字、前导零、正负溢出、
            数字后面跟字母</b>。写之前先把这些情形列成 checklist,一条条对着测 ——
            解析题不存在「主体逻辑对了就八九不离十」,漏一个边界就是 WA。205 同样:两串长度不同要先判、空串是同构的。
          </p>
        </Callout>
      </Section>

      {/* ================= §09 题单 ================= */}
      <Section
        id="problems"
        index="09"
        title="高频题单:字符串算法 9 题"
        desc="按「KMP → next 应用 → 回文 → 解析」分层,由易到难。先想 30 秒再看提示"
        badge={<span className="chip">主线 + 进阶</span>}
      >
        <ProblemSet ch="strings" items={PROBLEMS} />
      </Section>

      {/* ================= §10 Quiz ================= */}
      <Section
        id="quiz"
        index="10"
        title="通关测验"
        desc="8 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="strings" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            本章灵魂:<b>把每一次失败,都变成下一次的情报</b>。暴力匹配的病根,是失配后把
            <b>成功比过的前缀信息一起丢掉、让主串指针回退</b>。
          </>,
          <>
            <b>next[i] = 最长相等真前后缀长度</b>。它只取决于模式串自己,可离线预处理 ——
            这是 KMP 能 O(n+m) 的根。构建时「模式串和自己比」(自我匹配),失配沿 <b>j = next[j−1]</b> 回退。
          </>,
          <>
            KMP 匹配:<b>主串指针 i 永不回退</b>,只回退 j。构建 O(m) + 匹配 O(n) = <b>O(n+m)</b>,
            最坏情况也稳定,不怕对抗性数据。
          </>,
          <>
            <b>Rabin-Karp 滚动哈希</b>:把窗口哈希成一个数,右移时 O(1) 更新(减高位·乘 base·加低位),
            取大质数模防溢出。哈希相等只是「疑似」,<b>必须逐字符复核防碰撞</b>;工程上双哈希更稳。
          </>,
          <>
            next 数组的妙用:<b>459</b> 判循环节(k=next[n−1],k&gt;0 且 n%(n−k)==0)、
            <b>1392</b> 直接取末位、<b>214</b> 在 <code>s+#+reverse(s)</code> 上求回文前缀。看到「循环 / 自相似」就想 next。
          </>,
          <>
            回文靠<b>中心对称</b>:枚举 <b>2n−1</b> 个中心(奇偶都要)向两侧扩,O(n²);退出时回文区间是
            <b> [l+1, r−1]</b>(差一坑)。Manacher 用对称性省重复到 O(n),知道思路即可。
          </>,
          <>
            解析类(205/8)不考花招,考<b>把模糊规则不重不漏地翻译成确定逻辑</b>:同构要<b>双向映射</b>,
            atoi 是<b>状态机 + 边界 checklist</b>。边界就是主考题。
          </>,
        ]}
      />

      <ChapterFooter ch="strings" />
    </main>
  );
}
