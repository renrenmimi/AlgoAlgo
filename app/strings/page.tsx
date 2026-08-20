"use client";

// 第 12 章 · 字符串算法 —— 按样板章(第 7 章 DP)的九段式质量标准展开。
// 灵魂:【把每一次失败,都变成下一次的情报】。
// 结构:暴力为什么慢 → 前缀函数直觉 → next 构建(招牌动画)→ KMP 匹配 + 精讲 28 →
//       Rabin-Karp 滚动哈希(28 第二解)→ 精讲 459 → 回文中心扩展 + 精讲 5 + Manacher 概念 →
//       解析类 205/8 → 题单 → 测验 → 要点。
// 可视化全部在 ./viz;题单与测验数据在 lib/strings-data。
//
// 双语:正文用 <T en zh />;组件的文案型 props 传 { en, zh }。
// CodeTabs 的 code 也给两份 —— 两份之间只有注释不同,可执行代码逐行一致(hl 行号才对得上)。

import "./chapter.css";
import { Hero, Section, Callout, BigO, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { T } from "@/lib/i18n";
import { PROBLEMS, QUIZ } from "@/lib/strings-data";
import {
  BruteForceMatch,
  NextBuilder,
  KMPMatch,
  RollingHash,
  CenterExpand,
} from "./viz";

const CHIPS = [
  { id: "why", n: "01", label: { en: "Why naive is slow", zh: "暴力为什么慢" } },
  { id: "prefix", n: "02", label: { en: "Prefix function", zh: "前缀函数" } },
  { id: "next", n: "03", label: { en: "Building next", zh: "next 数组构建" } },
  { id: "kmp", n: "04", label: { en: "KMP · LC 28", zh: "KMP 匹配 · 28" } },
  { id: "hash", n: "05", label: { en: "Rolling hash · LC 28", zh: "滚动哈希 · 28" } },
  { id: "repeat", n: "06", label: { en: "Repeated substring · LC 459", zh: "重复子串 · 459" } },
  { id: "palindrome", n: "07", label: { en: "Palindromes · LC 5", zh: "回文中心扩展 · 5" } },
  { id: "parse", n: "08", label: { en: "Parsing · LC 205/8", zh: "解析类 · 205/8" } },
  { id: "problems", n: "09", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "10", label: { en: "Quiz", zh: "通关测验" } },
];

export default function StringsChapter() {
  return (
    <main className="page" data-ch="strings">
      <Hero
        ch="strings"
        title={{
          en: (
            <>
              String <span className="grad">algorithms</span>
            </>
          ),
          zh: (
            <>
              字符串算法 <span className="grad">Strings</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              Every fast string matching algorithm rests on one idea:{" "}
              <strong>keep what each failed comparison told you, and use it next time</strong>.
              This chapter starts with the waste in naive matching, which throws away even the
              comparisons that succeeded. You then build the KMP prefix function by hand and
              watch the text pointer stop moving backwards. After that comes the rolling hash,
              which turns a whole window into one number, and finally palindromes, which are
              built on symmetry around a center instead.
            </>
          ),
          zh: (
            <>
              所有快速字符串匹配算法都建立在一句话上:
              <strong>把每一次失败带来的信息留住,下一次直接用上</strong>。
              本章先看清暴力匹配的浪费 —— 它连比对成功的那部分也一起丢掉;
              然后亲手建出 KMP 的前缀函数,看主串指针从此不再回退;
              再学滚动哈希,把一整个窗口压成一个数;最后转向回文,它靠的是另一种结构 —— 中心对称。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 暴力为什么慢 ================= */}
      <Section
        id="why"
        index="01"
        title={{
          en: "Naive matching: a failure throws away the successes too",
          zh: "暴力匹配:失败后,连成功都一起扔了",
        }}
        desc={{
          en: "See where the work is wasted first, then it is clear what KMP saves",
          zh: "先看清浪费在哪,才知道 KMP 到底省下了什么",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The problem is as plain as it gets: in a text haystack of length n, find the
                  first position where a pattern needle of length m occurs. The most natural
                  idea is to <strong>line the pattern up with every start position and compare
                  character by character</strong>. If the characters match, move one step
                  right. If they do not, move to the next start position. That is naive
                  matching, also called brute force.
                </>
              }
              zh={
                <>
                  问题朴素得不能再朴素:在长度为 n 的文本串 haystack 里,找长度为 m 的模式串
                  needle 第一次出现的位置。最自然的想法是
                  <strong>把模式串对齐到每一个起点,逐字符比过去</strong>:对上就往右走一格,
                  对不上就换下一个起点。这就是暴力匹配(brute force)。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  It is correct, but slow. Where does the time go? Watch this run in slow
                  motion: find <code>abab</code> inside <code>abaabab</code>. Keep your eye on
                  the pointer <b>i</b>. On every mismatch it is{" "}
                  <strong>pulled back to the position right after the current start</strong>,
                  and everything the earlier <strong>successful</strong> comparisons
                  established is lost.
                </>
              }
              zh={
                <>
                  它是对的,但慢。时间花在哪?看下面这场慢放:文本 <code>abaabab</code> 里找{" "}
                  <code>abab</code>。盯住指针 <b>i</b> —— 每次失配,它都被
                  <strong>拽回到本次起点的下一格</strong>,
                  之前那几次<strong>成功</strong>的比较所确认的信息,一点没留下。
                </>
              }
            />
          </p>
        </div>
        <BruteForceMatch />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  How bad can the worst case get? Take the text{" "}
                  <code>aaaa…aab</code> and the pattern <code>aaab</code>. Every start position
                  has to be compared all the way to the last character before it fails, so the
                  number of comparisons is about n×m. That is the{" "}
                  <BigO o="n2" label="O(n·m)" /> of naive matching. The problem is not that
                  comparing characters is slow. The problem is that{" "}
                  <strong>every failure starts over from nothing, even though a long prefix
                  was just confirmed to match</strong>.
                </>
              }
              zh={
                <>
                  最坏情况有多坏?文本 <code>aaaa…aab</code>、模式 <code>aaab</code>:
                  每个起点都要比到最后一位才失败,总比较次数约 n×m。这就是暴力法的{" "}
                  <BigO o="n2" label="O(n·m)" />。问题不在于「比较字符太慢」,而在于
                  <strong>每次失败都从零开始 —— 明明刚才已经确认过一大段前缀是对的</strong>。
                </>
              }
            />
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Waste 01" zh="浪费 01" />
            </div>
            <div className="card-title">
              <T en="i moves back" zh="i 回退" />
            </div>
            <p>
              <T
                en={
                  <>
                    After a mismatch the text pointer returns to the start position plus one.{" "}
                    <b>Characters that were already read are read again.</b> This is the direct
                    source of the O(n·m) cost.
                  </>
                }
                zh={
                  <>
                    失配后主串指针被拉回起点 +1,<b>已经扫过的字符要重扫一遍</b> ——
                    这是 O(n·m) 的直接来源。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Waste 02" zh="浪费 02" />
            </div>
            <div className="card-title">
              <T en="Information discarded" zh="情报丢弃" />
            </div>
            <p>
              <T
                en={
                  <>
                    The prefix that matched before the mismatch{" "}
                    <b>describes the structure of the pattern itself</b>, but naive matching
                    throws it away.
                  </>
                }
                zh={
                  <>
                    失配前已经匹配的那段前缀,<b>本身就描述了模式串的结构</b>,
                    暴力法却把它扔了。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="The fix" zh="处方" />
            </div>
            <div className="card-title">
              <T en="Remember the failures" zh="记住失败" />
            </div>
            <p>
              <T
                en={
                  <>
                    Precompute, for every possible failure point,{" "}
                    <b>which prefix the matched suffix is equal to</b>, and store it in a
                    table. Then a mismatch is one table lookup and one jump. That is KMP.
                  </>
                }
                zh={
                  <>
                    对每一个可能的失配点,预先算出<b>「已匹配的后缀等于哪个前缀」</b>,
                    存成一张表。这样失配就是一次查表加一次跳位。这就是 KMP。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="story"
          title={{
            en: "KMP: three authors, and two routes to the same algorithm",
            zh: "KMP:三个人,两条路走到同一个算法",
          }}
        >
          <p>
            <T
              en={
                <>
                  KMP is named after <b>Knuth, Morris, and Pratt</b>, who published it together
                  in 1977. Morris found the technique while writing a text editor, where
                  scanning backwards over input was awkward. Knuth reached the same algorithm
                  from theory, while studying what two-way deterministic pushdown automata can
                  recognize. The central insight is one sentence:{" "}
                  <b>where the pattern should fall back to after a mismatch depends only on the
                  pattern, not on the text</b>. That is why the whole table can be computed
                  before the search starts.
                </>
              }
              zh={
                <>
                  KMP 得名于 <b>Knuth、Morris、Pratt</b> 三人 1977 年的联合论文。Morris
                  是在写文本编辑器时摸索出这个技巧的 —— 编辑器里让输入指针往回退很不方便;
                  Knuth 则是在研究「双向确定型下推自动机能识别什么语言」时,从理论走到同一个算法。
                  核心洞见只有一句:<b>失配后模式串该退到哪,只取决于模式串自己,和文本无关</b> ——
                  所以整张表都可以在开始搜索之前算好。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 前缀函数直觉 ================= */}
      <Section
        id="prefix"
        index="02"
        title={{
          en: "The prefix function: the table that turns failure into information",
          zh: "前缀函数:把失败变成信息的那张表",
        }}
        desc={{
          en: "The core idea — the longest equal proper prefix and suffix, and why it lets i stay put",
          zh: "核心概念 —— 最长相等真前后缀,以及它凭什么让 i 不回退",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  All of KMP fits into one array, called the{" "}
                  <strong>prefix function</strong>. In code it is usually named{" "}
                  <strong>next</strong> or <strong>fail</strong>, and in papers it is written
                  π. Its definition is one sentence, but every word in it matters.
                </>
              }
              zh={
                <>
                  KMP 的全部内容压在一个数组里,叫 <strong>前缀函数(prefix function)</strong>,
                  代码里常写作 <strong>next</strong> 或 <strong>fail</strong>,论文里记作 π。
                  它的定义只有一句,但每个词都要啃清楚。
                </>
              }
            />
          </p>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "Definition (used everywhere in this chapter)",
            zh: "定义(本章统一约定)",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>next[i] = the length of the longest equal proper prefix and suffix of the
                  substring pattern[0..i].</b> Word by word: a <b>prefix</b> starts at the
                  first character; a <b>suffix</b> ends at the last character; <b>proper</b>
                  {" "}means it is not allowed to be the whole substring; and <b>equal</b> means
                  this prefix and this suffix are the same string. Without &quot;proper&quot;
                  the answer would always be the whole substring, which carries no information.
                  next[0] = 0, because a single character has no proper prefix.
                </>
              }
              zh={
                <>
                  <b>next[i] = 子串 pattern[0..i] 的「最长相等真前后缀」的长度。</b>
                  逐字拆开:<b>前缀</b>是从第一个字符开始的一段;<b>后缀</b>是到最后一个字符为止的一段;
                  <b>真</b>指它不能等于整个子串;<b>相等</b>指这个前缀和这个后缀是同一个串。
                  如果去掉「真」,答案永远是整个子串,毫无信息量。规定 next[0] = 0,
                  因为单个字符没有真前缀。
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
                  An example: the substring <code>abab</code>. Its proper prefixes are{" "}
                  <code>a / ab / aba</code>, and its proper suffixes are{" "}
                  <code>b / ab / bab</code>. The longest one that appears in both lists is{" "}
                  <code>ab</code>, length 2, so the last entry of next for <code>abab</code> is
                  2.
                </>
              }
              zh={
                <>
                  举个例子:子串 <code>abab</code>。它的真前缀有 <code>a / ab / aba</code>,
                  真后缀有 <code>b / ab / bab</code>。两边都出现的最长的那个是 <code>ab</code>,
                  长度 2 —— 所以 <code>abab</code> 的 next 末位是 2。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Why does this number let the text pointer i stay where it is? Picture the
                  moment of failure: the first j characters of the pattern have matched the
                  text, and character j + 1 does not.{" "}
                  <strong>Those j matched characters are both a part of the text and exactly
                  the pattern prefix pattern[0..j−1]</strong>. Suppose that prefix has an equal
                  proper prefix and suffix of length k. Then its <strong>last k
                  characters</strong> are the same as its <strong>first k characters</strong>.
                  So the pattern can slide right until its first k characters sit where those
                  last k characters were. They are equal by construction, so{" "}
                  <strong>there is nothing to compare again, and i does not have to move
                  back</strong>.
                </>
              }
              zh={
                <>
                  这个数字凭什么让主串指针 i 不回退?想象失配的那一刻:模式串的前 j 个字符已经和
                  文本对上了,第 j+1 个字符却失配了。
                  <strong>那已匹配的 j 个字符,既是文本的一段,也正是模式串的前缀
                  pattern[0..j−1]</strong>。假设这段前缀有一个长度为 k 的相等真前后缀,
                  意味着它<strong>末尾的 k 个字符</strong>和它<strong>开头的 k 个字符</strong>相同。
                  于是模式串可以向右滑,让它开头这 k 个字符落到刚才末尾那 k 个字符的位置上 ——
                  它们本来就相等,所以<strong>不用重新比较,也不必把 i 拉回去</strong>。
                </>
              }
            />
          </p>
        </div>
        <div className="str-cmp">
          <div className="card">
            <div className="card-kicker">
              <T en="Naive matching" zh="暴力法的做法" />
            </div>
            <div className="card-title">
              <T en="Failure = start over" zh="失败 = 从头再来" />
            </div>
            <p>
              <T
                en={
                  <>
                    Mismatch → i returns to the start plus one, j returns to 0. The
                    self-similarity inside the matched prefix is <b>never used</b>.
                  </>
                }
                zh={
                  <>
                    失配 → i 退回起点 +1,j 归零。已匹配前缀里的自相似结构,<b>完全没被利用</b>。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="KMP" zh="KMP 的做法" />
            </div>
            <div className="card-title">
              <T en="Failure = one table lookup" zh="失败 = 查一次表" />
            </div>
            <p>
              <T
                en={
                  <>
                    Mismatch → i does not move, j = next[j−1].{" "}
                    <b>How much of the matched suffix equals a prefix decides where j
                    lands</b>, in one step.
                  </>
                }
                zh={
                  <>
                    失配 → i 不动,j = next[j−1]。
                    <b>已匹配后缀里有多长的一段等于前缀,直接决定 j 跳到哪</b>,一步到位。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "Two conventions for next — do not mix them",
            zh: "两种 next 约定,别混用",
          }}
        >
          <p>
            <T
              en={
                <>
                  KMP code on the internet uses two different conventions. One is the{" "}
                  <b>prefix function π</b> used here: next[i] is a length, and a mismatch sets
                  j = next[j−1]. The other <b>shifts the array by one</b> and starts with
                  next[0] = −1, so the numbers and the fallback line both look different. Pick
                  one convention and keep the whole file consistent with it. Copying half of
                  one and half of the other will not work. This chapter uses the prefix
                  function π from start to finish, and the solutions to LC 459 and LC 214 are
                  based on it.
                </>
              }
              zh={
                <>
                  网上的 KMP 代码有两套约定。一套是本章用的<b>前缀函数 π</b>:next[i] 是长度,
                  失配时 j = next[j−1]。另一套把数组<b>整体前移一格</b>、以 next[0] = −1 起头
                  (《代码随想录》流行的写法),算出的数和回退那一行的写法都不同。
                  <b>认准一套,整份代码首尾一致</b> —— 两套混着抄必错。
                  本章从头到尾只用前缀函数 π,459 / 214 的解法也都基于它。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 next 数组构建(招牌) ================= */}
      <Section
        id="next"
        index="03"
        title={{
          en: "Building next: match the pattern against itself",
          zh: "next 数组构建:让模式串和自己比",
        }}
        desc={{
          en: "The hardest and most important part of the chapter — step through every frame",
          zh: "本章最难也最关键的一段 —— 请把动画一帧帧走完",
        }}
        badge={
          <span className="chip" data-tone="info">
            <T en="★ Key animation" zh="★ 招牌动画" />
          </span>
        }
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  How is the whole table computed? Here is the neatest step in KMP:{" "}
                  <strong>building the next array is itself a KMP search, with the pattern
                  searched inside the pattern</strong>. This is called{" "}
                  <strong>self-matching</strong>.
                </>
              }
              zh={
                <>
                  怎么求出整张 next 表?这里藏着 KMP 最精妙的一步:
                  <strong>构建 next 数组的过程,本身就是一次 KMP 匹配 ——
                  只不过是拿模式串在模式串里找</strong>。这叫<strong>自我匹配(self-matching)</strong>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The method is <strong>incremental</strong>. Assume next[0..i−1] is already
                  known and compute next[i]. Keep a value j meaning &quot;how long the equal
                  prefix and suffix reached at the previous position&quot;, which starts at{" "}
                  <code>j = next[i−1]</code>. Then compare the new character pattern[i] with
                  pattern[j]:
                </>
              }
              zh={
                <>
                  方法是<strong>增量式</strong>的:假设 next[0..i−1] 都已算好,现在算 next[i]。
                  维护一个 j,含义是「到上一位为止,相等前后缀延伸到了多长」,起跳值就是{" "}
                  <code>j = next[i−1]</code>。然后比较新字符 pattern[i] 和 pattern[j]:
                </>
              }
            />
          </p>
          <ul className="str-list">
            <li>
              <T
                en={
                  <>
                    <b>They match</b> (pattern[i] == pattern[j]): the equal prefix and suffix
                    both grow by one, so <code>j++</code> and <code>next[i] = j</code>.
                  </>
                }
                zh={
                  <>
                    <b>对上了</b>(pattern[i] == pattern[j]):相等前后缀各长一格,
                    <code>j++</code>,记 <code>next[i] = j</code>。
                  </>
                }
              />
            </li>
            <li>
              <T
                en={
                  <>
                    <b>They do not match</b> (pattern[i] ≠ pattern[j]): the current prefix
                    cannot be extended, so <b>fall back</b> with{" "}
                    <code>j = next[j−1]</code> — move to a shorter prefix that may still
                    continue, and try again, until it matches or j reaches 0.
                  </>
                }
                zh={
                  <>
                    <b>没对上</b>(pattern[i] ≠ pattern[j]):当前这段前缀延不下去,就<b>回退</b>{" "}
                    <code>j = next[j−1]</code> —— 退到更短的、也许还能接上的前缀继续试,
                    直到对上或退到 0。
                  </>
                }
              />
            </li>
          </ul>
          <p>
            <T
              en={
                <>
                  The two-row table below animates it. The top row is the pattern{" "}
                  <code>abababca</code> and the bottom row is the next value filled in cell by
                  cell. The solid blue cell is the prefix character pattern[j] being compared,
                  and the dashed blue cells are the prefix matched so far. Pay special
                  attention to i=6, the character <code>c</code>, where the{" "}
                  <strong>fallback happens several times in a row</strong>:
                </>
              }
              zh={
                <>
                  下面这张双行表把它演活了:上行是模式串 <code>abababca</code>,
                  下行是逐格填出的 next 值。蓝实线格是「当前拿来比对的前缀字符 pattern[j]」,
                  蓝虚线格是「已经匹配上的前缀」。特别留意 i=6(字符 <code>c</code>)那一步的
                  <strong>连续回退</strong>:
                </>
              }
            />
          </p>
        </div>
        <NextBuilder />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  Understanding the fallback chain at i=6 is half of understanding KMP. c is
                  compared with pattern[4]=a and fails; j falls back to next[3]=2 and c is
                  compared with pattern[2]=a, which fails; j falls back to next[1]=0 and c is
                  compared with pattern[0]=a, which fails again, so next[6]=0.{" "}
                  <strong>Each jump along the next chain replaces the candidate prefix with a
                  shorter one</strong>, and that is exactly how known information is reused
                  instead of recomputed. The construction code and the matching code are almost
                  the same:
                </>
              }
              zh={
                <>
                  看懂 i=6 的回退链,就看懂了 KMP 的一半:c 先和 pattern[4]=a 比,失败;
                  j 回退到 next[3]=2,和 pattern[2]=a 比,又失败;再退到 next[1]=0,
                  和 pattern[0]=a 比,还是失败 —— 于是 next[6]=0。
                  <strong>沿 next 链每跳一次,候选前缀就换成一个更短的</strong>,
                  这正是「复用已知信息而不是重算」的机制。构建代码和匹配代码几乎是同一段:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="prefix_function"
          java={{
            code: {
              en: `// next[i] = length of the longest equal proper prefix and suffix of p[0..i]
int[] buildNext(String p) {
    int m = p.length();
    int[] next = new int[m];              // next[0] is already 0
    for (int i = 1, j = 0; i < m; i++) {
        while (j > 0 && p.charAt(i) != p.charAt(j))
            j = next[j - 1];              // mismatch: fall back along the next chain
        if (p.charAt(i) == p.charAt(j))
            j++;                          // match: prefix and suffix grow by one
        next[i] = j;                      // record the length
    }
    return next;
}`,
              zh: `// next[i] = 子串 p[0..i] 的最长相等真前后缀长度
int[] buildNext(String p) {
    int m = p.length();
    int[] next = new int[m];              // next[0] 默认就是 0
    for (int i = 1, j = 0; i < m; i++) {
        while (j > 0 && p.charAt(i) != p.charAt(j))
            j = next[j - 1];              // 失配:沿 next 链回退 j
        if (p.charAt(i) == p.charAt(j))
            j++;                          // 对上:前后缀各长一格
        next[i] = j;                      // 记下长度
    }
    return next;
}`,
            },
            hl: [6, 7, 8, 9],
            note: {
              en: (
                <>
                  <b>Common mistake:</b> in Java a String cannot be indexed, so read characters
                  with <code>charAt(i)</code>, not <code>p[i]</code>. The inner statement is a{" "}
                  <code>while</code>, not an <code>if</code> — that is what allows the repeated
                  fallback seen at i=6.
                </>
              ),
              zh: (
                <>
                  <b>坑:</b>Java 的 String 不能下标,取字符必须用 <code>charAt(i)</code>,
                  不能写 <code>p[i]</code>。内层是 <code>while</code> 不是 <code>if</code> ——
                  i=6 那样的连续回退靠它。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `# next[i] = length of the longest equal proper prefix and suffix of p[0..i]
def build_next(p: str) -> list[int]:
    m = len(p)
    nxt = [0] * m                         # nxt[0] = 0
    j = 0
    for i in range(1, m):
        while j > 0 and p[i] != p[j]:
            j = nxt[j - 1]                # mismatch: fall back
        if p[i] == p[j]:
            j += 1                        # match: one longer
        nxt[i] = j
    return nxt`,
              zh: `# next[i] = 子串 p[0..i] 的最长相等真前后缀长度
def build_next(p: str) -> list[int]:
    m = len(p)
    nxt = [0] * m                         # nxt[0] = 0
    j = 0
    for i in range(1, m):
        while j > 0 and p[i] != p[j]:
            j = nxt[j - 1]                # 失配:回退 j
        if p[i] == p[j]:
            j += 1                        # 对上:长一格
        nxt[i] = j
    return nxt`,
            },
            hl: [7, 8, 9, 10],
            note: {
              en: (
                <>
                  <b>Naming:</b> <code>next</code> is a Python built-in function, so using it as
                  a variable name shadows the built-in. This code uses <code>nxt</code>. Python
                  strings can be indexed directly with <code>p[i]</code>.
                </>
              ),
              zh: (
                <>
                  <b>命名坑:</b><code>next</code> 是 Python 内置函数,拿它当变量名会遮蔽内置 ——
                  这里改用 <code>nxt</code>。Python 字符串可以直接 <code>p[i]</code> 下标取字符。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// next[i] = length of the longest equal proper prefix and suffix of p[0..i]
function buildNext(p) {
  const m = p.length;
  const next = new Array(m).fill(0);      // next[0] = 0
  for (let i = 1, j = 0; i < m; i++) {
    while (j > 0 && p[i] !== p[j])
      j = next[j - 1];                    // mismatch: fall back
    if (p[i] === p[j]) j++;               // match: one longer
    next[i] = j;                          // record
  }
  return next;
}`,
              zh: `// next[i] = 子串 p[0..i] 的最长相等真前后缀长度
function buildNext(p) {
  const m = p.length;
  const next = new Array(m).fill(0);      // next[0] = 0
  for (let i = 1, j = 0; i < m; i++) {
    while (j > 0 && p[i] !== p[j])
      j = next[j - 1];                    // 失配:回退 j
    if (p[i] === p[j]) j++;               // 对上:长一格
    next[i] = j;                          // 记账
  }
  return next;
}`,
            },
            hl: [6, 7, 8, 9],
            note: {
              en: (
                <>
                  <b>Detail:</b> in JavaScript <code>p[i]</code> returns a one-character string,
                  so comparing with <code>===</code> is correct.{" "}
                  <code>new Array(m).fill(0)</code> fills the array with zeros in one call, so
                  next[0] needs no special case.
                </>
              ),
              zh: (
                <>
                  <b>细节:</b>JS 里 <code>p[i]</code> 返回单字符字符串,用 <code>===</code>{" "}
                  比较是正确的。<code>new Array(m).fill(0)</code> 一次铺好 0,
                  省去 next[0] 的特判。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Why is the construction O(m)? An amortized argument",
            zh: "为什么构建是 O(m)?一段摊还分析",
          }}
        >
          <p>
            <T
              en={
                <>
                  The outer loop runs m−1 times. The inner while loop looks like it could fall
                  back many times, so count the fallbacks over the whole run instead of per
                  step. j <b>increases by at most 1</b> in each outer step, and only when the
                  characters match. Each turn of the while loop <b>decreases j by at least
                  1</b>, because next[j−1] &lt; j always holds. So the total increase of j over
                  the whole run is at most m, and therefore the total decrease is also at most
                  m. The number of inner iterations is bounded by that total, so the whole
                  construction is <b>O(m)</b>. The same argument applies to the matching loop,
                  so construction plus matching is <BigO o="n" label="O(n + m)" />.
                </>
              }
              zh={
                <>
                  外层循环走 m−1 步。内层 while 看似可能反复回退很多次,所以不要按单步算,
                  要把整轮的回退次数加起来看:j 在每个外层步骤里<b>最多 +1</b>,
                  而且只在字符对上时才 +1;while 每转一圈,j <b>至少 −1</b> ——
                  因为 next[j−1] &lt; j 恒成立。所以整轮里 j 上涨的总量不超过 m,
                  它下跌的总量也就不超过 m。内层迭代次数被这个总量兜住,
                  于是整个构建是 <b>O(m)</b>。同样的论证对匹配循环也成立,
                  所以构建加匹配合计 <BigO o="n" label="O(n + m)" />。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 KMP 匹配 + 精讲 A(28) ================= */}
      <Section
        id="kmp"
        index="04"
        title={{ en: "KMP matching: i never moves back", zh: "KMP 匹配:i 永不回退" }}
        desc={{
          en: "Worked example A · LC 28 strStr — once the next table exists, matching follows",
          zh: "精讲 A · LC 28 实现 strStr —— next 表建好后,匹配水到渠成",
        }}
        badge={
          <span className="lc-badge" data-d="easy">
            EASY
          </span>
        }
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  With the next table in hand, the matching loop looks{" "}
                  <strong>almost identical</strong> to the construction loop. Only the
                  comparison changes, from pattern against pattern to pattern against text.
                  Keep a value j meaning how many pattern characters currently match: compare
                  haystack[i] with pattern[j], and on a match do <code>j++</code>, on a mismatch
                  do <code>j = next[j−1]</code>. <strong>i only ever increases</strong>. When j
                  reaches m, the pattern has been found. Here is the same pair{" "}
                  <code>abaabab</code> and <code>abab</code> again, this time with KMP:
                </>
              }
              zh={
                <>
                  有了 next 表,匹配循环和构建循环<strong>长得几乎一模一样</strong>,
                  只是把「模式串对自己」换成「模式串对文本」。维护一个 j 表示当前已匹配的模式串长度:
                  拿文本字符 haystack[i] 和 pattern[j] 比,对上就 <code>j++</code>,
                  失配就 <code>j = next[j−1]</code> —— <strong>而 i 只增不减</strong>。
                  当 j 涨到 m,就找到了。还是那组 <code>abaabab</code> / <code>abab</code>,
                  这次用 KMP 走一遍:
                </>
              }
            />
          </p>
        </div>
        <KMPMatch />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  <b>The problem (LC 28):</b> return the index of the first occurrence of
                  needle in haystack, or −1 if there is none.
                  <b> Naive:</b> shown above, <BigO o="n2" label="O(n·m)" />.
                  <b> Why it can be improved:</b> on a mismatch, the suffix that already
                  matched contains a part that is equal to a prefix. The next table measures
                  that in advance, so a mismatch becomes a jump instead of a restart.
                  <b> Solution:</b> build next in O(m), then scan the text in O(n):
                </>
              }
              zh={
                <>
                  <b>题意(LC 28):</b>返回 needle 在 haystack 中第一次出现的下标,不存在返回 −1。
                  <b> 暴力:</b>刚才演示过,<BigO o="n2" label="O(n·m)" />。
                  <b> 为什么能优化:</b>失配时,已匹配的后缀里有一段等于某个前缀 ——
                  next 表把它预先量好,于是失配变成跳位而不是重来。
                  <b> 正解:</b>先 O(m) 建 next,再 O(n) 扫文本:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc28_strstr_kmp"
          java={{
            code: {
              en: `class Solution {
    public int strStr(String haystack, String needle) {
        int n = haystack.length(), m = needle.length();
        if (m == 0) return 0;
        int[] next = new int[m];                 // (1) build the next table
        for (int i = 1, j = 0; i < m; i++) {
            while (j > 0 && needle.charAt(i) != needle.charAt(j))
                j = next[j - 1];
            if (needle.charAt(i) == needle.charAt(j)) j++;
            next[i] = j;
        }
        for (int i = 0, j = 0; i < n; i++) {     // (2) scan the text, i never moves back
            while (j > 0 && haystack.charAt(i) != needle.charAt(j))
                j = next[j - 1];                 // mismatch: only j falls back
            if (haystack.charAt(i) == needle.charAt(j)) j++;
            if (j == m) return i - m + 1;        // found: compute the start index
        }
        return -1;
    }
}`,
              zh: `class Solution {
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
            },
            hl: [12, 13, 14, 15, 16],
            note: {
              en: (
                <>
                  <b>The two loops are the same shape.</b> Only the comparison changes, from{" "}
                  <code>needle vs needle</code> to <code>haystack vs needle</code>. The match
                  starts at <code>i − m + 1</code>, because i is standing on the last character
                  of the match.
                </>
              ),
              zh: (
                <>
                  <b>两段循环结构完全一样</b>,只是比较对象从 <code>needle vs needle</code>{" "}
                  换成 <code>haystack vs needle</code>。命中下标是 <code>i − m + 1</code> ——
                  因为 i 此刻停在匹配段的最后一个字符上。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        n, m = len(haystack), len(needle)
        if m == 0:
            return 0
        nxt = [0] * m                            # (1) build the next table
        j = 0
        for i in range(1, m):
            while j > 0 and needle[i] != needle[j]:
                j = nxt[j - 1]
            if needle[i] == needle[j]:
                j += 1
            nxt[i] = j
        j = 0
        for i in range(n):                       # (2) scan the text, i never moves back
            while j > 0 and haystack[i] != needle[j]:
                j = nxt[j - 1]
            if haystack[i] == needle[j]:
                j += 1
            if j == m:
                return i - m + 1
        return -1`,
              zh: `class Solution:
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
            },
            hl: [15, 16, 17, 18, 19, 20],
            note: {
              en: (
                <>
                  The two <code>j = 0</code> lines initialize the construction and the matching
                  separately; do not forget to reset j before matching. A slice comparison{" "}
                  <code>haystack[i:i+m] == needle</code> also works, but it copies m characters
                  each time and degrades to O(n·m).
                </>
              ),
              zh: (
                <>
                  两处 <code>j = 0</code> 分别是构建和匹配的初始化 —— 别忘了匹配前把 j 归零。
                  用切片 <code>haystack[i:i+m] == needle</code> 也能判匹配,
                  但每次都要复制 m 个字符,会退化成 O(n·m)。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var strStr = function (haystack, needle) {
  const n = haystack.length, m = needle.length;
  if (m === 0) return 0;
  const next = new Array(m).fill(0);             // (1) build the next table
  for (let i = 1, j = 0; i < m; i++) {
    while (j > 0 && needle[i] !== needle[j]) j = next[j - 1];
    if (needle[i] === needle[j]) j++;
    next[i] = j;
  }
  for (let i = 0, j = 0; i < n; i++) {           // (2) scan the text, i never moves back
    while (j > 0 && haystack[i] !== needle[j]) j = next[j - 1];
    if (haystack[i] === needle[j]) j++;
    if (j === m) return i - m + 1;               // found
  }
  return -1;
};`,
              zh: `var strStr = function (haystack, needle) {
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
            },
            hl: [10, 11, 12, 13],
            note: {
              en: (
                <>
                  Time <b>O(n + m)</b>, space <b>O(m)</b> for the next table.{" "}
                  <code>str[i]</code> is enough to read a character; charCodeAt is not needed,
                  because comparing two one-character strings is exact.
                </>
              ),
              zh: (
                <>
                  时间 <b>O(n + m)</b>,空间 <b>O(m)</b>(next 表)。取字符用{" "}
                  <code>str[i]</code> 就够,不必 charCodeAt —— 两个单字符字符串的比较是精确的。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "In practice: where the KMP family is used",
            zh: "工程现场:KMP 家族在哪儿干活",
          }}
        >
          <p>
            <T
              en={
                <>
                  For a single pattern, <b>Boyer-Moore</b> and its variants are the usual
                  choice in tools such as grep and editor search: they compare from the right
                  and can skip further ahead on a bad character. The idea behind KMP is
                  generalised by the <b>Aho-Corasick automaton</b>, which is a trie of all the
                  patterns plus failure links, so one scan of the text matches thousands of
                  patterns at once; its cost is O(total pattern length + text length + number
                  of matches). Antivirus signature databases, intrusion detection rule engines,
                  and word filters are built on it. The shared starting point of all these
                  algorithms is the same: <b>preprocess the pattern so that the scan of the
                  text never moves backwards</b>.
                </>
              }
              zh={
                <>
                  单模式匹配在工程上更常用 <b>Boyer-Moore</b> 及其变体(grep、编辑器查找多用它):
                  从右往左比,遇到坏字符能跳得更远。而 KMP 的思想被推广成
                  <b>Aho-Corasick 自动机</b> —— 把所有模式建成一棵 trie 再加失配链接,
                  一次扫描同时匹配成千上万个模式,复杂度是
                  O(模式串总长 + 文本长 + 匹配次数)。杀毒软件的病毒特征库、
                  入侵检测系统的规则引擎、敏感词过滤,背后都是它。
                  这些算法的共同起点是同一句话:<b>预处理模式串,换取扫描文本时不回退</b>。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 Rabin-Karp 滚动哈希(28 第二解) ================= */}
      <Section
        id="hash"
        index="05"
        title={{
          en: "A different route: one number as the fingerprint of a window",
          zh: "换个思路:用一个数指纹一段窗口",
        }}
        desc={{
          en: "Worked example A continued · a second solution to LC 28 — the Rabin-Karp rolling hash",
          zh: "精讲 A 续 · LC 28 第二解法 —— Rabin-Karp 滚动哈希",
        }}
        badge={
          <span className="chip">
            <T en="Two solutions" zh="同题双解" />
          </span>
        }
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  KMP gets its speed from preprocessing the pattern. There is a completely
                  different route: <strong>Rabin-Karp</strong>, which{" "}
                  <strong>hashes a substring of length m into a single number</strong>, like a
                  fingerprint. To test whether two substrings are equal, compare their hashes
                  first. Different hashes mean the substrings are definitely different, so that
                  position can be skipped. Equal hashes mean the characters have to be
                  compared.
                </>
              }
              zh={
                <>
                  KMP 靠「预处理模式串」提速;还有一条完全不同的路 ——{" "}
                  <strong>Rabin-Karp</strong>:把长度 m 的子串
                  <strong>哈希成一个数</strong>,像一枚指纹。要判两段子串是否相等,先比哈希值:
                  哈希不同,子串一定不同,这个位置直接跳过;哈希相同,才去逐字符比较。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  If each window&apos;s hash were computed from scratch, the total would still
                  be O(n·m) and nothing would be gained. The point is the{" "}
                  <strong>rolling hash</strong>: when the window moves one step right, the hash{" "}
                  <strong>updates in O(1)</strong> — subtract the contribution of the character
                  that leaves, multiply the rest by the base, and add the character that
                  enters. Watch it:
                </>
              }
              zh={
                <>
                  如果每个窗口都从头重算哈希,总量还是 O(n·m),白忙。关键在
                  <strong>滚动哈希(rolling hash)</strong>:窗口向右滑一格时,
                  哈希<strong>只需 O(1) 更新</strong> —— 减去移出字符的贡献、
                  其余整体乘以基数、加上新进来的字符。看动画:
                </>
              }
            />
          </p>
        </div>
        <RollingHash />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  Treat the substring as a <b>polynomial</b> in the base (a polynomial rolling
                  hash): <code>hash = c₀·baseᵐ⁻¹ + c₁·baseᵐ⁻² + … + cₘ₋₁</code>. Here cᵢ is the
                  character code, which may be larger than the base. That is allowed, because
                  this is a hash function and not a positional number system. When the window
                  moves right, <strong>drop the highest term, shift the rest up by one power
                  (multiply by the base), and add the new character in the lowest
                  position</strong>, so the update is O(1). Everything is taken{" "}
                  <strong>modulo a large prime</strong> to keep the numbers in range. A base at
                  least as large as the alphabet is normal: 26 or 31 for 26 lowercase letters,
                  and something larger such as 131 when the text can contain any ASCII
                  character.
                </>
              }
              zh={
                <>
                  把子串看成一个以 base 为底的<b>多项式</b>(polynomial rolling hash):
                  <code>hash = c₀·baseᵐ⁻¹ + c₁·baseᵐ⁻² + … + cₘ₋₁</code>。
                  这里 cᵢ 取字符编码,可以大于 base —— 这没问题,因为它是哈希函数,
                  不需要构成标准的进制表示。窗口右移时,
                  <strong>去掉最高次项、其余整体升一次幂(乘 base)、在最低位补入新字符</strong>,
                  所以更新是 O(1)。全程对一个<strong>大质数取模</strong>,把数值控制在范围内。
                  base 一般取不小于字符集大小的数:26 个小写字母常用 26 或 31,
                  文本可能含任意 ASCII 字符时则用更大的数,比如 131。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc28_strstr_rabinkarp"
          java={{
            code: {
              en: `class Solution {
    public int strStr(String haystack, String needle) {
        int n = haystack.length(), m = needle.length();
        if (m == 0) return 0;
        if (m > n) return -1;
        long MOD = 1_000_000_007L, BASE = 26;
        long high = 1;                       // BASE^(m-1) % MOD: weight of the top position
        for (int i = 0; i < m - 1; i++) high = high * BASE % MOD;
        long hp = 0, hh = 0;                  // pattern hash / first window hash
        for (int i = 0; i < m; i++) {
            hp = (hp * BASE + needle.charAt(i)) % MOD;
            hh = (hh * BASE + haystack.charAt(i)) % MOD;
        }
        for (int i = 0; ; i++) {
            if (hp == hh && haystack.substring(i, i + m).equals(needle))
                return i;                    // hashes agree -> compare the characters
            if (i + m >= n) break;
            hh = (hh - haystack.charAt(i) * high % MOD + MOD) % MOD; // drop the top
            hh = (hh * BASE + haystack.charAt(i + m)) % MOD;         // add the new character
        }
        return -1;
    }
}`,
              zh: `class Solution {
    public int strStr(String haystack, String needle) {
        int n = haystack.length(), m = needle.length();
        if (m == 0) return 0;
        if (m > n) return -1;
        long MOD = 1_000_000_007L, BASE = 26;
        long high = 1;                       // BASE^(m-1) % MOD:最高位的权重
        for (int i = 0; i < m - 1; i++) high = high * BASE % MOD;
        long hp = 0, hh = 0;                  // 模式哈希 / 首窗口哈希
        for (int i = 0; i < m; i++) {
            hp = (hp * BASE + needle.charAt(i)) % MOD;
            hh = (hh * BASE + haystack.charAt(i)) % MOD;
        }
        for (int i = 0; ; i++) {
            if (hp == hh && haystack.substring(i, i + m).equals(needle))
                return i;                    // 哈希相等 → 逐字符复核
            if (i + m >= n) break;
            hh = (hh - haystack.charAt(i) * high % MOD + MOD) % MOD; // 移出最高位
            hh = (hh * BASE + haystack.charAt(i + m)) % MOD;         // 补入新字符
        }
        return -1;
    }
}`,
            },
            hl: [18, 19],
            note: {
              en: (
                <>
                  <b>Keeping the numbers valid:</b> the subtraction can produce a negative
                  value, so add <code>MOD</code> before taking the modulus again. Store hashes
                  in a <code>long</code>, not an <code>int</code>, because{" "}
                  <code>char × high</code> overflows an int. Equal hashes still require the{" "}
                  <code>equals</code> check, because two different substrings can hash to the
                  same value.
                </>
              ),
              zh: (
                <>
                  <b>让数值保持正确:</b>减法可能得到负数,所以先 <code>+ MOD</code> 再取模。
                  哈希要用 <code>long</code> 存,不能用 <code>int</code> ——
                  <code>char × high</code> 会溢出 int。哈希相等仍要 <code>equals</code> 复核,
                  因为两段不同的子串可能哈希相同。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        n, m = len(haystack), len(needle)
        if m == 0:
            return 0
        if m > n:
            return -1
        MOD, BASE = 10**9 + 7, 26
        high = pow(BASE, m - 1, MOD)          # weight of the top position
        hp = hh = 0
        for i in range(m):
            hp = (hp * BASE + ord(needle[i])) % MOD
            hh = (hh * BASE + ord(haystack[i])) % MOD
        for i in range(n - m + 1):
            if hp == hh and haystack[i:i + m] == needle:
                return i                      # hashes agree -> compare
            if i + m < n:
                hh = (hh - ord(haystack[i]) * high) % MOD      # drop the top
                hh = (hh * BASE + ord(haystack[i + m])) % MOD  # add the new character
        return -1`,
              zh: `class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        n, m = len(haystack), len(needle)
        if m == 0:
            return 0
        if m > n:
            return -1
        MOD, BASE = 10**9 + 7, 26
        high = pow(BASE, m - 1, MOD)          # 最高位的权重
        hp = hh = 0
        for i in range(m):
            hp = (hp * BASE + ord(needle[i])) % MOD
            hh = (hh * BASE + ord(haystack[i])) % MOD
        for i in range(n - m + 1):
            if hp == hh and haystack[i:i + m] == needle:
                return i                      # 哈希相等 → 复核
            if i + m < n:
                hh = (hh - ord(haystack[i]) * high) % MOD      # 移出最高位
                hh = (hh * BASE + ord(haystack[i + m])) % MOD  # 补入新字符
        return -1`,
            },
            hl: [18, 19],
            note: {
              en: (
                <>
                  Python integers have unlimited precision, so nothing overflows, but the
                  modulus is still used to lower the collision rate and keep the numbers small.
                  A negative value modulo MOD lands in <code>[0, MOD)</code>{" "}
                  <b>automatically</b> in Python, so no manual <code>+ MOD</code> is needed.{" "}
                  <code>pow(b, e, MOD)</code> is modular exponentiation built in.
                </>
              ),
              zh: (
                <>
                  Python 整数是无限精度的,不会溢出,但仍然取模 —— 为的是降低碰撞率、
                  把数值压小。负数取模在 Python 里<b>自动</b>落回 <code>[0, MOD)</code>,
                  不必手动 <code>+ MOD</code>。<code>pow(b, e, MOD)</code> 是内置的模幂运算。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var strStr = function (haystack, needle) {
  const n = haystack.length, m = needle.length;
  if (m === 0) return 0;
  if (m > n) return -1;
  const MOD = 1000000007n, BASE = 26n;        // BigInt keeps every digit exact
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
              zh: `var strStr = function (haystack, needle) {
  const n = haystack.length, m = needle.length;
  if (m === 0) return 0;
  if (m > n) return -1;
  const MOD = 1000000007n, BASE = 26n;        // BigInt 保证每一位都精确
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
            },
            hl: [5, 16, 17],
            note: {
              en: (
                <>
                  <b>Precision:</b> a JavaScript Number loses precision above 2⁵³, which makes
                  the hash wrong, so <code>BigInt</code> is required (the <code>n</code>{" "}
                  suffix). BigInt arithmetic is slower, but the modulus is computed exactly.
                </>
              ),
              zh: (
                <>
                  <b>精度坑:</b>JS 的 Number 超过 2⁵³ 就丢精度,哈希会算错 ——
                  必须用 <code>BigInt</code>(带 <code>n</code> 后缀)。
                  BigInt 运算慢一些,但取模的结果是精确的。
                </>
              ),
            },
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Algorithm" zh="算法" />
                </th>
                <th>
                  <T en="Preprocessing" zh="预处理" />
                </th>
                <th>
                  <T en="Matching" zh="匹配" />
                </th>
                <th>
                  <T en="Space" zh="空间" />
                </th>
                <th>
                  <T en="Notes" zh="特点" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T en="Naive" zh="暴力" />
                  </b>
                </td>
                <td>—</td>
                <td>
                  <BigO o="n2" label="O(n·m)" />
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T
                    en="Fine for short strings. Fastest to write, slowest in the worst case."
                    zh="短串够用;写起来最快,最坏情况最慢。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>KMP</b>
                </td>
                <td>
                  <BigO o="n" label="O(m)" />
                </td>
                <td>
                  <BigO o="n" label="O(n)" />
                </td>
                <td>
                  <BigO o="n" label="O(m)" />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <b>O(n + m) even in the worst case.</b> Adversarial input does not hurt
                        it.
                      </>
                    }
                    zh={
                      <>
                        <b>最坏情况也是 O(n + m)</b>,不怕刁难数据。
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>Rabin-Karp</b>
                </td>
                <td>
                  <BigO o="n" label="O(m)" />
                </td>
                <td>
                  <BigO o="n" label={{ en: "O(n) expected", zh: "O(n) 期望" }} />
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T
                    en={
                      <>
                        Extends to many patterns easily. Collisions must be verified, and the
                        worst case is <b>O(n·m)</b>.
                      </>
                    }
                    zh={
                      <>
                        容易推广到多模式。碰撞必须复核,最坏情况是 <b>O(n·m)</b>。
                      </>
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "A hash can lie: collisions and the fix",
            zh: "哈希会撒谎:碰撞与它的解药",
          }}
        >
          <p>
            <T
              en={
                <>
                  A hash compresses a whole substring into one number, so{" "}
                  <b>collisions are always possible</b>: two different substrings can produce
                  the same value. Equal hashes are therefore only a candidate, and{" "}
                  <b>the characters must be compared</b>. This is why Rabin-Karp is expected
                  O(n + m) rather than guaranteed O(n + m): if many hashes collide — for
                  example on input built specifically to attack a fixed base and modulus — the
                  verification runs often and the total degrades to O(n·m). In practice{" "}
                  <b>double hashing</b> is used: two independent base and modulus pairs, and
                  only a position where both agree is treated as a candidate. That makes a
                  collision unlikely enough to ignore, but the character comparison is still
                  what makes the result correct.
                </>
              }
              zh={
                <>
                  哈希把一整段子串压成一个数,所以<b>碰撞永远可能发生</b>:
                  两段不同的子串可能得到同一个值。因此哈希相等只是候选,
                  <b>必须逐字符复核</b>。这也是 Rabin-Karp 只能说「期望 O(n + m)」而不是
                  「保证 O(n + m)」的原因:一旦碰撞频繁(例如针对固定 base 和模数构造的对抗数据),
                  复核就会频繁触发,总体退化到 O(n·m)。工程上常用<b>双哈希</b>:
                  两组独立的 base 和模数,只有两组都相等才算候选,把碰撞概率压到可以忽略;
                  但保证结果正确的,始终是那一步逐字符比较。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="deep"
          title={{
            en: "In practice: rolling hashes are everywhere",
            zh: "工程现场:滚动哈希比你想的更常见",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>rsync</b> incremental sync, <b>git</b> finding identical blocks, and cloud
                  storage deduplication all use a rolling hash (the Rabin fingerprint) to cut a
                  file into content-defined blocks, so only the blocks that changed are sent.
                  Plagiarism detection for text and code builds a fingerprint index from hashes
                  of sliding windows. The idea of turning a stretch of content into a
                  fingerprint that can be updated in O(1) reaches well beyond string matching.
                </>
              }
              zh={
                <>
                  <b>rsync</b> 增量同步、<b>git</b> 找相同数据块、网盘去重,
                  都用滚动哈希(Rabin fingerprint)把文件切成「按内容定界」的块,
                  只传变化的那些块;论文查重和代码抄袭检测,也靠对滑动窗口的哈希建指纹库。
                  「把一段内容变成一个可 O(1) 更新的指纹」这个想法,早已超出了字符串匹配的范围。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 精讲 B(459) ================= */}
      <Section
        id="repeat"
        index="06"
        title={{ en: "One more use for the next array", zh: "next 数组的又一种用法" }}
        desc={{
          en: "Worked example B · LC 459 repeated substring pattern — one line of test, all prefix and suffix underneath",
          zh: "精讲 B · LC 459 重复的子字符串 —— 一行判据,背后全是前后缀",
        }}
        badge={
          <span className="lc-badge" data-d="easy">
            EASY
          </span>
        }
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem (LC 459):</b> decide whether a string s can be built by{" "}
                  <strong>repeating one of its substrings</strong> two or more times. For
                  example <code>abab</code> = <code>ab</code>×2 → true, and <code>aba</code> →
                  false.
                  <b> Naive:</b> try every candidate period length d that divides n and verify
                  each one, which is about O(n²).
                  <b> Why it can be improved:</b> a repeating structure leaves a clear mark in
                  the next array.
                </>
              }
              zh={
                <>
                  <b>题意(LC 459):</b>判断字符串 s 是否可以由它的某个子串
                  <strong>重复两次以上</strong>拼成。如 <code>abab</code> = <code>ab</code>×2 →
                  true;<code>aba</code> → false。
                  <b> 暴力:</b>枚举所有能整除 n 的候选循环节长度 d,逐个验证,大约 O(n²)。
                  <b> 为什么能优化:</b>循环结构会在 next 数组里留下清晰的痕迹。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Let n = s.length and <code>k = next[n−1]</code>, the length of the longest
                  equal proper prefix and suffix of the whole string. The conclusion:
                </>
              }
              zh={
                <>
                  设 n = s.length,<code>k = next[n−1]</code>(整串的最长相等真前后缀长度)。
                  核心结论:
                </>
              }
            />
          </p>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "Test: k > 0 and n % (n − k) == 0",
            zh: "判据:k > 0 且 n % (n − k) == 0",
          }}
        >
          <p>
            <T
              en={
                <>
                  The candidate period length is <b>n − k</b>. Why: if s is a substring of
                  length d repeated t times with t ≥ 2, then the prefix that drops the last
                  copy and the suffix that drops the first copy are the same string, and their
                  length is <b>n − d</b>. That is exactly next[n−1], so d = n − k. It remains
                  to check that d divides n, so the period tiles the string exactly, and that
                  k &gt; 0, so the string really does repeat itself.
                </>
              }
              zh={
                <>
                  循环节的候选长度就是 <b>n − k</b>。原因:若 s 由长度 d 的子串重复 t 次
                  (t ≥ 2)构成,那么「去掉最后一份」的前缀和「去掉第一份」的后缀是同一个串,
                  长度都是 <b>n − d</b> —— 这正是 next[n−1],所以 d = n − k。
                  剩下只需验证 d 能整除 n(循环节严丝合缝铺满),且 k &gt; 0(串确实存在自相似)。
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
                  Check it on two more examples. <code>abcabcabc</code>: n=9, the last next
                  value is k=6, the candidate period length is 9 − 6 = 3, and 9 % 3 == 0 with
                  6 &gt; 0 → true, with period <code>abc</code>. Now <code>aba</code>: n=3,
                  k=1, the candidate length is 2, but 3 % 2 ≠ 0 → false. The test is exact:
                </>
              }
              zh={
                <>
                  再验两个例子。<code>abcabcabc</code>:n=9,next 末位 k=6,
                  候选循环节长 = 9 − 6 = 3,而 9 % 3 == 0 且 6 &gt; 0 → true,循环节是{" "}
                  <code>abc</code>。再看 <code>aba</code>:n=3,k=1,候选长 = 2,
                  但 3 % 2 ≠ 0 → false。判据严丝合缝:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc459_repeated_substring"
          java={{
            code: {
              en: `class Solution {
    public boolean repeatedSubstringPattern(String s) {
        int n = s.length();
        int[] next = new int[n];
        for (int i = 1, j = 0; i < n; i++) {         // build the next table
            while (j > 0 && s.charAt(i) != s.charAt(j))
                j = next[j - 1];
            if (s.charAt(i) == s.charAt(j)) j++;
            next[i] = j;
        }
        int k = next[n - 1];                          // longest equal proper prefix/suffix
        return k > 0 && n % (n - k) == 0;             // period n-k must divide n
    }
}`,
              zh: `class Solution {
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
        return k > 0 && n % (n - k) == 0;             // 循环节 n-k 要整除 n
    }
}`,
            },
            hl: [11, 12],
            note: {
              en: (
                <>
                  Only the last value of next is used, but the whole table has to be built,
                  because next[n−1] depends on every entry before it. Do not drop{" "}
                  <code>k &gt; 0</code>: without it a string with no self-similarity such as{" "}
                  <code>abcd</code> would be accepted, since n − 0 = n divides n.
                </>
              ),
              zh: (
                <>
                  只用到 next 的末位一个值,却必须把整张表建出来 ——
                  因为 next[n−1] 依赖它前面的每一格。<code>k &gt; 0</code> 不能漏:
                  否则像 <code>abcd</code> 这种没有自相似的串也会被判真,
                  因为 n − 0 = n 本身整除 n。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def repeatedSubstringPattern(self, s: str) -> bool:
        n = len(s)
        nxt = [0] * n
        j = 0
        for i in range(1, n):                         # build the next table
            while j > 0 and s[i] != s[j]:
                j = nxt[j - 1]
            if s[i] == s[j]:
                j += 1
            nxt[i] = j
        k = nxt[n - 1]
        return k > 0 and n % (n - k) == 0`,
              zh: `class Solution:
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
            },
            hl: [12, 13],
            note: {
              en: (
                <>
                  <b>One-line alternative:</b> <code>return s in (s + s)[1:-1]</code> — join two
                  copies of s and remove the first and last character; if s can still be found,
                  it is built from a repeated substring. It is elegant, but the substring search
                  is O(n²) in the worst case unless the runtime uses a linear algorithm
                  internally.
                </>
              ),
              zh: (
                <>
                  <b>一行流备选:</b><code>return s in (s + s)[1:-1]</code> ——
                  把 s 接两遍、掐头去尾,若还能找到 s,则 s 由重复子串构成。写法优雅,
                  但除非运行时内部用了线性算法,子串查找最坏是 O(n²)。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var repeatedSubstringPattern = function (s) {
  const n = s.length;
  const next = new Array(n).fill(0);
  for (let i = 1, j = 0; i < n; i++) {            // build the next table
    while (j > 0 && s[i] !== s[j]) j = next[j - 1];
    if (s[i] === s[j]) j++;
    next[i] = j;
  }
  const k = next[n - 1];
  return k > 0 && n % (n - k) === 0;              // period n-k must divide n
};`,
              zh: `var repeatedSubstringPattern = function (s) {
  const n = s.length;
  const next = new Array(n).fill(0);
  for (let i = 1, j = 0; i < n; i++) {            // 建 next 表
    while (j > 0 && s[i] !== s[j]) j = next[j - 1];
    if (s[i] === s[j]) j++;
    next[i] = j;
  }
  const k = next[n - 1];
  return k > 0 && n % (n - k) === 0;              // 循环节 n-k 要整除 n
};`,
            },
            hl: [9, 10],
            note: {
              en: (
                <>
                  <b>One-line alternative:</b>{" "}
                  <code>return (s + s).slice(1, -1).includes(s)</code>. Just as short, but{" "}
                  <code>includes</code> is O(n²) in the worst case. For a guaranteed O(n), use
                  the next array.
                </>
              ),
              zh: (
                <>
                  <b>一行流备选:</b><code>return (s + s).slice(1, -1).includes(s)</code>。
                  同样简短,但 <code>includes</code> 最坏是 O(n²);想要保证 O(n),
                  还得走 next 数组。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Interview follow-up: be able to explain both solutions",
            zh: "面试追问:两种解法都要能讲",
          }}
        >
          <p>
            <T
              en={
                <>
                  In interviews LC 459 often follows LC 28. A safe answer:{" "}
                  &quot;I can use the one-line <code>(s+s)</code> version with the first and
                  last character removed; it works because every rotation of s lives inside the
                  doubled string. But it relies on the library substring search, which is
                  O(n²) in the worst case. For a guaranteed O(n) I use the next array:{" "}
                  <code>k = next[n−1]</code>, and the test is{" "}
                  <code>k &gt; 0 and n % (n−k) == 0</code>, where n − k is the period
                  length.&quot; Presenting both the short solution and the one with a
                  guaranteed bound scores best.
                </>
              }
              zh={
                <>
                  面试里 459 常接在 28 后面问。稳妥的答法:「我可以用一行的 <code>(s+s)</code>{" "}
                  掐头去尾判子串,原理是 s 的任何旋转都藏在双倍串里;
                  但它依赖库函数的子串查找,最坏 O(n²)。要保证 O(n),我用 next 数组:
                  <code>k = next[n−1]</code>,判 <code>k &gt; 0 且 n % (n−k) == 0</code>,
                  循环节长度就是 n − k。」把「简短解」和「复杂度有保证的解」都端出来,分数最高。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 回文中心扩展 + 精讲 C(5) ================= */}
      <Section
        id="palindrome"
        index="07"
        title={{
          en: "Palindromes: mirror outwards from the center",
          zh: "回文:从中心向两边照镜子",
        }}
        desc={{
          en: "Worked example C · LC 5 longest palindromic substring (review) plus the idea of Manacher",
          zh: "精讲 C · LC 5 最长回文子串(复盘)+ Manacher 概念",
        }}
        badge={
          <span className="lc-badge" data-d="medium">
            MEDIUM
          </span>
        }
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  A different kind of structure: a <strong>palindrome</strong> reads the same
                  forwards and backwards, such as <code>aba</code> or <code>abba</code>.
                  <b> The problem (LC 5):</b> find the longest palindromic substring of a
                  string.
                  <b> Naive:</b> take all O(n²) substrings and check each one, at O(n) per
                  check, for O(n³) in total.
                  <b> Why it can be improved:</b> a palindrome is{" "}
                  <strong>symmetric around its center</strong>. Instead of choosing the two
                  ends and then checking, choose the center and expand outwards, which keeps
                  the symmetry true by construction.
                </>
              }
              zh={
                <>
                  换一种结构 —— <strong>回文(palindrome)</strong>:正着读反着读一样,
                  如 <code>aba</code>、<code>abba</code>。
                  <b> 题意(LC 5):</b>找字符串里最长的回文子串。
                  <b> 暴力:</b>枚举所有 O(n²) 个子串,逐个验证是否回文(每个 O(n)),总 O(n³)。
                  <b> 为什么能优化:</b>回文的本质是<strong>关于中心对称</strong> ——
                  与其先选两端再验证,不如选中心向两侧扩,对称性天然成立。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The DataData two-pointer chapter introduced the intuition for expanding from
                  a center; this is a review that then connects to Manacher. The one thing to
                  watch is that <strong>palindromes have odd and even lengths</strong>: the
                  center of <code>aba</code> is a character, while the center of{" "}
                  <code>abba</code> is the gap between two characters. So there are{" "}
                  <strong>2n−1</strong> centers to try: n characters and n−1 gaps. Watch:
                </>
              }
              zh={
                <>
                  DataData(数据结构篇)的双指针章讲过中心扩展的直觉,这里作复盘并接上 Manacher。
                  唯一要留意的是<strong>回文分奇偶</strong>:<code>aba</code> 的中心是一个字符,
                  <code>abba</code> 的中心在两个字符的缝隙里。所以要枚举{" "}
                  <strong>2n−1</strong> 个中心(n 个字符 + n−1 个缝隙)。看动画:
                </>
              }
            />
          </p>
        </div>
        <CenterExpand />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  There is a classic <strong>off-by-one</strong> in the implementation. When the
                  expansion loop exits, the left and right pointers have each{" "}
                  <strong>moved one step too far</strong> and stand on the pair that did not
                  match. So the palindrome is the range <code>[l+1, r−1]</code> and its length
                  is <code>r−l−1</code>. Keep that in mind and the code follows:
                </>
              }
              zh={
                <>
                  实现上有个经典的<strong>差一错(off-by-one)</strong>:扩张循环退出时,
                  左右指针各<strong>多走了一步</strong>,停在「照不上」的那一对上。
                  所以真正的回文区间是 <code>[l+1, r−1]</code>,长度 <code>r−l−1</code>。
                  记牢这一点,代码就顺了:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc5_longest_palindrome"
          java={{
            code: {
              en: `class Solution {
    private int lo = 0, len = 0;

    public String longestPalindrome(String s) {
        if (s.length() < 2) return s;
        for (int i = 0; i < s.length(); i++) {
            expand(s, i, i);        // odd length: the center is character i
            expand(s, i, i + 1);    // even length: the center is between i and i+1
        }
        return s.substring(lo, lo + len);
    }

    private void expand(String s, int l, int r) {
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
            l--; r++;               // still a mirror, so keep expanding
        }
        if (r - l - 1 > len) {      // on exit the palindrome is [l+1, r-1]
            len = r - l - 1;
            lo = l + 1;
        }
    }
}`,
              zh: `class Solution {
    private int lo = 0, len = 0;

    public String longestPalindrome(String s) {
        if (s.length() < 2) return s;
        for (int i = 0; i < s.length(); i++) {
            expand(s, i, i);        // 奇数长度:中心是字符 i
            expand(s, i, i + 1);    // 偶数长度:中心在 i 和 i+1 之间
        }
        return s.substring(lo, lo + len);
    }

    private void expand(String s, int l, int r) {
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
            l--; r++;               // 还能对上,继续向两侧扩
        }
        if (r - l - 1 > len) {      // 退出时回文是 [l+1, r-1]
            len = r - l - 1;
            lo = l + 1;
        }
    }
}`,
            },
            hl: [14, 17, 18],
            note: {
              en: (
                <>
                  <b>Off-by-one:</b> when the while loop exits, l and r have each moved one step
                  too far, so the length is <code>r − l − 1</code>, not r − l. Both kinds of
                  center must be tried; skipping one loses half of all palindromes.
                </>
              ),
              zh: (
                <>
                  <b>差一坑:</b>while 退出时 l、r 各多走一步,所以长度是 <code>r − l − 1</code>{" "}
                  而不是 r − l。奇偶两种中心都要试,漏一种就会错过一半回文。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        def expand(l: int, r: int) -> str:
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            return s[l + 1:r]          # the palindrome is [l+1, r-1]

        best = ""
        for i in range(len(s)):
            best = max(best, expand(i, i), expand(i, i + 1), key=len)
        return best`,
              zh: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        def expand(l: int, r: int) -> str:
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            return s[l + 1:r]          # 回文区间是 [l+1, r-1]

        best = ""
        for i in range(len(s)):
            best = max(best, expand(i, i), expand(i, i + 1), key=len)
        return best`,
            },
            hl: [3, 4, 5, 6, 7],
            note: {
              en: (
                <>
                  <code>expand</code> returns the palindrome itself, so{" "}
                  <code>max(..., key=len)</code> picks the longest of the three candidates in
                  one line. The slice <code>s[l+1:r]</code> matches [l+1, r−1] exactly, because
                  the right end of a Python slice is excluded.
                </>
              ),
              zh: (
                <>
                  <code>expand</code> 直接返回回文子串,配合 <code>max(..., key=len)</code>{" "}
                  一行就能在三个候选里选最长的。切片 <code>s[l+1:r]</code> 正好对应
                  [l+1, r−1] —— Python 切片右端是开区间。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var longestPalindrome = function (s) {
  let best = "";
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      l--;
      r++;
    }
    return s.slice(l + 1, r);         // the palindrome is [l+1, r-1]
  };
  for (let i = 0; i < s.length; i++) {
    const odd = expand(i, i);         // center on a character
    const even = expand(i, i + 1);    // center in a gap
    if (odd.length > best.length) best = odd;
    if (even.length > best.length) best = even;
  }
  return best;
};`,
              zh: `var longestPalindrome = function (s) {
  let best = "";
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      l--;
      r++;
    }
    return s.slice(l + 1, r);         // 回文区间是 [l+1, r-1]
  };
  for (let i = 0; i < s.length; i++) {
    const odd = expand(i, i);         // 中心落在字符上
    const even = expand(i, i + 1);    // 中心落在缝隙里
    if (odd.length > best.length) best = odd;
    if (even.length > best.length) best = even;
  }
  return best;
};`,
            },
            hl: [3, 8, 11, 12],
            note: {
              en: (
                <>
                  Time <b>O(n²)</b>, space <b>O(1)</b> apart from the returned string.{" "}
                  <code>slice(l+1, r)</code> excludes the right end, so it returns exactly
                  [l+1, r−1]. Each center expands to the boundary at most, over 2n−1 centers.
                </>
              ),
              zh: (
                <>
                  时间 <b>O(n²)</b>,除返回值外空间 <b>O(1)</b>。
                  <code>slice(l+1, r)</code> 右端开,正好取到 [l+1, r−1]。
                  每个中心最多扩到边界,共 2n−1 个中心。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "Manacher: from O(n²) to O(n) (the idea only)",
            zh: "Manacher:把 O(n²) 压到 O(n)(只讲概念)",
          }}
        >
          <p>
            <T
              en={
                <>
                  Expanding from neighboring centers re-examines the same region many times.
                  The insight in Manacher is this: if the current center lies inside a{" "}
                  <b>palindrome that is already known</b>, then its radius can be{" "}
                  <b>read off from the mirror position on the other side of that
                  palindrome&apos;s center</b>, which skips a large amount of repeated
                  expansion. This is the same spirit as KMP, where known information replaces
                  recomputation. The algorithm also needs the{" "}
                  <b>interleaved separator trick</b> — rewriting <code>abba</code> as{" "}
                  <code>#a#b#b#a#</code> — so that every palindrome in the new string has odd
                  length and the odd and even cases become one case. Without that step the
                  implementation has to handle two kinds of center and the linear bound is
                  harder to state. With it, the total is <BigO o="n" />. Interviews almost never
                  ask for a written Manacher, but knowing that it exists and that it saves work
                  through symmetry is worth having. For most inputs the O(n²) expansion is
                  fast enough.
                </>
              }
              zh={
                <>
                  相邻中心的扩张会把同一片区域反复检查。Manacher 的洞见是:
                  如果当前中心落在某个<b>已知回文</b>的内部,
                  那它的回文半径可以<b>从「关于那个大回文中心对称的位置」直接读出来</b>,
                  从而跳过一大段重复扩张 —— 这和 KMP「用已知信息代替重算」是同一种精神。
                  它还需要<b>插入分隔符</b>的技巧:把 <code>abba</code> 改写成{" "}
                  <code>#a#b#b#a#</code>,使新串里的每个回文都是奇长度,奇偶两种情况合成一种。
                  没有这一步,实现就要分别处理两种中心,线性上界也更难讲清。有了它,
                  总复杂度是 <BigO o="n" />。面试极少要求手写 Manacher,
                  但知道它存在、知道它靠对称性省重复,是值得的;
                  大多数输入下 O(n²) 的中心扩展已经够快。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="win"
          title={{ en: "The family of palindrome problems", zh: "回文题的家族地图" }}
        >
          <p>
            <T
              en={
                <>
                  Palindrome problems split into two lines. One is the{" "}
                  <b>contiguous substring</b>, which is this problem: expand from center,
                  Manacher, or interval DP. The other is the <b>subsequence</b>, such as LC 516
                  longest palindromic subsequence, which chapter 9 solved as the LCS of s and
                  reverse(s) and chapter 10 revisited with interval DP. LC 214 shortest
                  palindrome joins palindromes to KMP directly: build{" "}
                  <code>s + &apos;#&apos; + reverse(s)</code> and read the last value of its
                  next array, which is the length of the longest palindromic prefix of s.{" "}
                  <b>A palindrome is a string that is self-similar with its own reverse</b>, and
                  that view connects most of this chapter.
                </>
              }
              zh={
                <>
                  回文题分两条主线。一条是<b>连续子串</b>,也就是本题:
                  中心扩展、Manacher 或区间 DP。另一条是<b>子序列</b>,
                  如 LC 516 最长回文子序列 —— 第 9 章从 LCS 视角解过(s 与 reverse(s) 求 LCS),
                  第 10 章用区间 DP 又复盘了一次。LC 214 最短回文串则把回文直接接到 KMP 上:
                  构造 <code>s + &apos;#&apos; + reverse(s)</code>,取它 next 数组的末位,
                  就是 s 的最长回文前缀长度。<b>回文 = 字符串与它自己的翻转相似</b>,
                  这个视角能串起本章一大半题。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §08 解析类 205 / 8 ================= */}
      <Section
        id="parse"
        index="08"
        title={{
          en: "Parsing: turn vague rules into exact logic",
          zh: "解析类:把模糊的规则翻译成确定的逻辑",
        }}
        desc={{
          en: "LC 205 isomorphic strings · LC 8 string to integer — no tricks, only care",
          zh: "LC 205 同构字符串 · LC 8 字符串转整数 —— 不靠花招,靠严谨",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Not every string problem is about matching. The other large group is{" "}
                  <strong>parsing and mapping</strong>, where the test is not an algorithmic
                  trick but <strong>translating a set of boundary rules into code without
                  missing any and without duplicating any</strong>. Interviewers like these
                  problems because they are close to real work: turning an unclear requirement
                  into exact logic.
                </>
              }
              zh={
                <>
                  不是所有字符串题都关于「匹配」。另一大类是<strong>解析 / 映射</strong>:
                  考的不是算法花招,而是
                  <strong>把一堆边界规则不重不漏地翻译成代码</strong>。这类题面试官偏爱,
                  因为它贴近真实工作 —— 把不清晰的需求变成确定的逻辑。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>LC 205 isomorphic strings:</b> can s become t by replacing characters one
                  for one? <code>egg → add</code> works; <code>foo → bar</code> does not,
                  because o would have to become both a and r. The key is a{" "}
                  <strong>mapping in both directions</strong>: s → t must be consistent and
                  t → s must be consistent too. Checking only one direction accepts the case
                  where two different characters land on the same target:
                </>
              }
              zh={
                <>
                  <b>LC 205 同构字符串:</b>s 能否通过「字符一对一替换」变成 t?
                  <code>egg → add</code> 行;<code>foo → bar</code> 不行,
                  因为 o 要同时变成 a 和 r。关键是<strong>双向映射</strong>:
                  s → t 要一致,t → s 也要一致 ——
                  只查单向会放过「两个不同字符落到同一个目标」的情况:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc205_isomorphic"
          java={{
            code: {
              en: `class Solution {
    public boolean isIsomorphic(String s, String t) {
        int[] m1 = new int[128], m2 = new int[128]; // last position + 1; 0 = not seen yet
        for (int i = 0; i < s.length(); i++) {
            char a = s.charAt(i), b = t.charAt(i);
            if (m1[a] != m2[b]) return false;   // both directions must agree
            m1[a] = m2[b] = i + 1;              // update them together
        }
        return true;
    }
}`,
              zh: `class Solution {
    public boolean isIsomorphic(String s, String t) {
        int[] m1 = new int[128], m2 = new int[128]; // 存「上次位置 + 1」,0 = 还没出现过
        for (int i = 0; i < s.length(); i++) {
            char a = s.charAt(i), b = t.charAt(i);
            if (m1[a] != m2[b]) return false;   // 两个方向必须一致
            m1[a] = m2[b] = i + 1;              // 同步更新
        }
        return true;
    }
}`,
            },
            hl: [6, 7],
            note: {
              en: (
                <>
                  <b>The trick:</b> instead of storing what each character maps to, store where
                  it last appeared. If two characters correspond, their &quot;last
                  position&quot; values move together, so one comparison covers both directions.
                  The arrays have 128 slots, which covers ASCII; a wider character set needs a
                  hash map instead.
                </>
              ),
              zh: (
                <>
                  <b>巧解:</b>不存「映射到谁」,而存「上次出现的位置」。
                  若两个字符互相对应,它们的「上次位置」必然同步变化,一次比较就覆盖了两个方向。
                  数组长度 128 覆盖 ASCII;字符集更大时要换成哈希表。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        m1, m2 = {}, {}
        for a, b in zip(s, t):
            if m1.get(a, b) != b or m2.get(b, a) != a:
                return False          # a conflict in either direction rejects
            m1[a], m2[b] = b, a
        return True`,
              zh: `class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        m1, m2 = {}, {}
        for a, b in zip(s, t):
            if m1.get(a, b) != b or m2.get(b, a) != a:
                return False          # 任一方向冲突即判否
            m1[a], m2[b] = b, a
        return True`,
            },
            hl: [5, 6],
            note: {
              en: (
                <>
                  <code>zip(s, t)</code> walks both strings together. The default in{" "}
                  <code>m1.get(a, b)</code> is b, so on the first appearance the test is{" "}
                  <code>b != b</code>, which is always false and lets the character through.
                  That removes the need for an <code>if a in m1</code> branch.
                </>
              ),
              zh: (
                <>
                  <code>zip(s, t)</code> 同步遍历两串。<code>m1.get(a, b)</code> 的默认值取 b ——
                  首次出现时判断变成 <code>b != b</code>,恒为假,自动放行,
                  省掉 <code>if a in m1</code> 这个分支。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var isIsomorphic = function (s, t) {
  const m1 = new Map(), m2 = new Map();
  for (let i = 0; i < s.length; i++) {
    const a = s[i], b = t[i];
    if ((m1.has(a) && m1.get(a) !== b) ||
        (m2.has(b) && m2.get(b) !== a)) return false; // check both directions
    m1.set(a, b);
    m2.set(b, a);
  }
  return true;
};`,
              zh: `var isIsomorphic = function (s, t) {
  const m1 = new Map(), m2 = new Map();
  for (let i = 0; i < s.length; i++) {
    const a = s[i], b = t[i];
    if ((m1.has(a) && m1.get(a) !== b) ||
        (m2.has(b) && m2.get(b) !== a)) return false; // 两个方向都要查
    m1.set(a, b);
    m2.set(b, a);
  }
  return true;
};`,
            },
            hl: [5, 6],
            note: {
              en: (
                <>
                  The two maps hold s → t and t → s. Counterexample{" "}
                  <code>badc → baba</code>: m1 alone accepts it, and only m2 reveals that{" "}
                  <b>b and d</b> both map to <code>b</code> (and a and c both map to{" "}
                  <code>a</code>). O(n) time.
                </>
              ),
              zh: (
                <>
                  两张 Map 分别管 s → t 和 t → s。反例 <code>badc → baba</code>:
                  只查 m1 会放过它,加上 m2 才能发现 <b>b 和 d</b> 都映射到 <code>b</code>
                  (a 和 c 同理都映射到 <code>a</code>)。O(n) 时间。
                </>
              ),
            },
          }}
        />
        <div className="prose" style={{ marginTop: 18 }}>
          <p>
            <T
              en={
                <>
                  <b>LC 8 string to integer (atoi):</b> parse text that may contain leading
                  spaces, a sign, and invalid characters into a 32-bit integer. There is no
                  algorithm here, only rules. Writing them as a{" "}
                  <strong>state machine</strong> makes it clear: (1) skip leading spaces, (2)
                  read one optional sign, (3) read digits, (4) stop at the first non-digit, (5)
                  clamp to [INT_MIN, INT_MAX] on overflow:
                </>
              }
              zh={
                <>
                  <b>LC 8 字符串转换整数(atoi):</b>
                  把一段可能带前导空格、正负号和非法字符的文本解析成 32 位整数。
                  这里没有算法,全是规则。把它写成一个<strong>状态机</strong>就清晰了:
                  ①跳前导空格 → ②读一个可选符号 → ③连续读数字 → ④遇第一个非数字停 →
                  ⑤溢出夹到 [INT_MIN, INT_MAX]:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc8_atoi"
          java={{
            code: {
              en: `class Solution {
    public int myAtoi(String s) {
        int i = 0, n = s.length();
        while (i < n && s.charAt(i) == ' ') i++;      // (1) skip spaces
        if (i == n) return 0;
        int sign = 1;
        if (s.charAt(i) == '+' || s.charAt(i) == '-') { // (2) sign
            sign = s.charAt(i) == '-' ? -1 : 1;
            i++;
        }
        long ans = 0;                                  // (3) digits, held in a long
        while (i < n && Character.isDigit(s.charAt(i))) {
            ans = ans * 10 + (s.charAt(i) - '0');
            if (sign == 1 && ans > Integer.MAX_VALUE) return Integer.MAX_VALUE;
            if (sign == -1 && -ans < Integer.MIN_VALUE) return Integer.MIN_VALUE;
            i++;                                       // (5) clamp while reading
        }
        return (int) (sign * ans);
    }
}`,
              zh: `class Solution {
    public int myAtoi(String s) {
        int i = 0, n = s.length();
        while (i < n && s.charAt(i) == ' ') i++;      // ① 跳空格
        if (i == n) return 0;
        int sign = 1;
        if (s.charAt(i) == '+' || s.charAt(i) == '-') { // ② 符号
            sign = s.charAt(i) == '-' ? -1 : 1;
            i++;
        }
        long ans = 0;                                  // ③ 读数字,用 long 暂存
        while (i < n && Character.isDigit(s.charAt(i))) {
            ans = ans * 10 + (s.charAt(i) - '0');
            if (sign == 1 && ans > Integer.MAX_VALUE) return Integer.MAX_VALUE;
            if (sign == -1 && -ans < Integer.MIN_VALUE) return Integer.MIN_VALUE;
            i++;                                       // ⑤ 边读边夹紧
        }
        return (int) (sign * ans);
    }
}`,
            },
            hl: [14, 15],
            note: {
              en: (
                <>
                  <b>Overflow:</b> hold the value in a <code>long</code> and compare with the
                  int boundaries after every digit, returning the boundary immediately when it
                  is passed. Do not wait until the end, because a long can overflow too on a
                  very long digit string. <code>s.charAt(i) − &apos;0&apos;</code> converts a
                  digit character to its value.
                </>
              ),
              zh: (
                <>
                  <b>溢出坑:</b>用 <code>long</code> 暂存,每读一位就和 int 边界比,
                  超了立刻返回边界值。别等算完再判 —— 数字串很长时连 long 也会溢出。
                  <code>s.charAt(i) − &apos;0&apos;</code> 把数字字符转成它的数值。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def myAtoi(self, s: str) -> int:
        i, n = 0, len(s)
        while i < n and s[i] == ' ':          # (1) skip spaces
            i += 1
        if i == n:
            return 0
        sign = 1
        if s[i] in '+-':                       # (2) sign
            sign = -1 if s[i] == '-' else 1
            i += 1
        ans = 0
        while i < n and s[i].isdigit():        # (3) digits
            ans = ans * 10 + int(s[i])
            i += 1
        ans *= sign
        INT_MIN, INT_MAX = -2**31, 2**31 - 1   # (5) clamp once at the end
        return max(INT_MIN, min(INT_MAX, ans))`,
              zh: `class Solution:
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
        while i < n and s[i].isdigit():        # ③ 读数字
            ans = ans * 10 + int(s[i])
            i += 1
        ans *= sign
        INT_MIN, INT_MAX = -2**31, 2**31 - 1   # ⑤ 最后一次性夹紧
        return max(INT_MIN, min(INT_MAX, ans))`,
            },
            hl: [17, 18],
            note: {
              en: (
                <>
                  Python integers have <b>unlimited precision</b>, so the whole value can be
                  computed first and clamped at the end; no per-digit overflow check is needed.{" "}
                  <code>s[i].isdigit()</code> tests for a digit and{" "}
                  <code>s[i] in &apos;+-&apos;</code> tests for a sign. Note that{" "}
                  <code>isdigit()</code> is also true for some non-ASCII digit characters, which
                  does not matter for this problem&apos;s input but does matter in real parsing
                  code.
                </>
              ),
              zh: (
                <>
                  Python 整数是<b>无限精度</b>的,所以可以先算完再夹紧,不必逐位防溢出。
                  <code>s[i].isdigit()</code> 判数字,<code>s[i] in &apos;+-&apos;</code>{" "}
                  判符号。注意 <code>isdigit()</code> 对一些非 ASCII 的数字字符也返回真 ——
                  本题的输入范围里无所谓,但写真实的解析代码时要当心。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var myAtoi = function (s) {
  let i = 0;
  const n = s.length;
  while (i < n && s[i] === ' ') i++;              // (1) skip spaces
  let sign = 1;
  if (s[i] === '+' || s[i] === '-') {             // (2) sign
    if (s[i] === '-') sign = -1;
    i++;
  }
  let ans = 0;
  while (i < n && s[i] >= '0' && s[i] <= '9') {   // (3) digits
    ans = ans * 10 + (s.charCodeAt(i) - 48);
    i++;
  }
  ans *= sign;
  const MIN = -(2 ** 31), MAX = 2 ** 31 - 1;      // (5) clamp
  return Math.max(MIN, Math.min(MAX, ans));
};`,
              zh: `var myAtoi = function (s) {
  let i = 0;
  const n = s.length;
  while (i < n && s[i] === ' ') i++;              // ① 跳空格
  let sign = 1;
  if (s[i] === '+' || s[i] === '-') {             // ② 符号
    if (s[i] === '-') sign = -1;
    i++;
  }
  let ans = 0;
  while (i < n && s[i] >= '0' && s[i] <= '9') {   // ③ 读数字
    ans = ans * 10 + (s.charCodeAt(i) - 48);
    i++;
  }
  ans *= sign;
  const MIN = -(2 ** 31), MAX = 2 ** 31 - 1;      // ⑤ 夹紧
  return Math.max(MIN, Math.min(MAX, ans));
};`,
            },
            hl: [16, 17],
            note: {
              en: (
                <>
                  <code>s[i] &gt;= &apos;0&apos; &amp;&amp; s[i] &lt;= &apos;9&apos;</code>{" "}
                  compares character codes to test for a digit. A very long digit string makes
                  ans lose precision, but it is clamped to a boundary anyway, so the answer is
                  still correct. <code>charCodeAt(i) − 48</code> is the same as subtracting{" "}
                  <code>&apos;0&apos;</code>.
                </>
              ),
              zh: (
                <>
                  <code>s[i] &gt;= &apos;0&apos; &amp;&amp; s[i] &lt;= &apos;9&apos;</code>{" "}
                  靠字符编码比较来判数字。超长数字串会让 ans 丢精度,
                  但它反正会被夹到边界,结果仍然正确。<code>charCodeAt(i) − 48</code> 就是减去{" "}
                  <code>&apos;0&apos;</code>。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="warn"
          title={{
            en: "The recurring problem with parsing: the edge cases are the exam",
            zh: "解析题的通病:边界不是附加题,是主考题",
          }}
        >
          <p>
            <T
              en={
                <>
                  Almost all the credit in atoi is in the edge cases: <b>empty string, only
                  spaces, a sign with no digits after it, leading zeros, overflow in both
                  directions, and letters after the digits</b>. List them as a checklist before
                  writing and test them one by one. In a parsing problem, getting the main path
                  right is not close to enough; a single missed edge case is a wrong answer.
                  LC 205 is the same: reject different lengths first, and note that two empty
                  strings are isomorphic.
                </>
              }
              zh={
                <>
                  atoi 的分数几乎全在边界上:<b>空串、全是空格、只有符号而后面没有数字、
                  前导零、正负两侧溢出、数字后面跟字母</b>。写之前先把它们列成 checklist,
                  一条条测过去。解析题不存在「主体逻辑对了就八九不离十」,漏一个边界就是错答案。
                  205 同样:两串长度不同要先判否;另外两个空串是同构的。
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
          en: "Problem set: 9 string algorithm problems",
          zh: "高频题单:字符串算法 9 题",
        }}
        desc={{
          en: "Grouped as KMP, uses of next, palindromes, and parsing, from easier to harder. Think for 30 seconds before opening the hint",
          zh: "按「KMP → next 应用 → 回文 → 解析」分层,由易到难。先想 30 秒再看提示",
        }}
        badge={
          <span className="chip">
            <T en="Core + extra" zh="主线 + 进阶" />
          </span>
        }
      >
        <ProblemSet ch="strings" items={PROBLEMS} />
      </Section>

      {/* ================= §10 Quiz ================= */}
      <Section
        id="quiz"
        index="10"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Answer all 8 correctly to mark this chapter complete",
          zh: "8 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Chapter quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="strings" items={QUIZ} />
      </Section>

      <KeyPoints
        points={{
          en: [
            <>
              The idea behind the whole chapter:{" "}
              <b>keep what each failure told you and use it next time</b>. The flaw in naive
              matching is that a mismatch <b>discards the information from the prefix that did
              match, and moves the text pointer back</b>.
            </>,
            <>
              <b>next[i] = the length of the longest equal proper prefix and suffix of
              pattern[0..i]</b>. Proper means it cannot be the whole substring. This value
              depends only on the pattern, so it can be computed before the search starts, and
              that is why KMP reaches O(n + m). It is built by matching the pattern against
              itself, falling back with <b>j = next[j−1]</b> on a mismatch.
            </>,
            <>
              KMP matching: <b>the text pointer i never moves back</b>, only j does. Build in
              O(m) plus scan in O(n) gives <b>O(n + m)</b>, and the bound is amortized: j rises
              by at most 1 per outer step and each fallback lowers it by at least 1. This holds
              in the worst case, so adversarial input does not hurt it.
            </>,
            <>
              <b>Rabin-Karp rolling hash</b>: hash the window into one number and update it in
              O(1) when the window moves (drop the top term, multiply by the base, add the new
              character), all modulo a large prime. Equal hashes are only a candidate, so{" "}
              <b>the characters must be compared</b>. That makes it <b>expected</b> O(n + m);
              with many collisions the worst case is O(n·m). Double hashing lowers the
              collision rate in practice.
            </>,
            <>
              Uses of the next array: <b>LC 459</b> tests for a period (k = next[n−1], then
              k &gt; 0 and n % (n−k) == 0), <b>LC 1392</b> just reads the last value, and{" "}
              <b>LC 214</b> finds the longest palindromic prefix on{" "}
              <code>s + # + reverse(s)</code>. When a problem mentions repetition or
              self-similarity, think of next.
            </>,
            <>
              Palindromes rest on <b>symmetry around a center</b>: try all <b>2n−1</b> centers,
              both the n characters and the n−1 gaps, and expand outwards, for O(n²). When the
              expansion stops, the palindrome is <b>[l+1, r−1]</b> — the off-by-one to
              remember. Manacher reaches O(n) by reusing symmetry, together with the separator
              trick that makes every palindrome odd-length; knowing the idea is enough.
            </>,
            <>
              Parsing problems such as LC 205 and LC 8 test no trick. They test{" "}
              <b>translating vague rules into exact logic with nothing missed and nothing
              duplicated</b>: isomorphic strings need a <b>mapping in both directions</b>, and
              atoi is a <b>state machine plus an edge-case checklist</b>. The edge cases are the
              exam.
            </>,
          ],
          zh: [
            <>
              本章灵魂:<b>把每一次失败带来的信息留住,下一次直接用上</b>。暴力匹配的病根,
              是失配后<b>把已经比对成功的前缀信息一起丢掉,还让主串指针回退</b>。
            </>,
            <>
              <b>next[i] = 子串 pattern[0..i] 的最长相等真前后缀长度</b>,
              「真」指它不能等于整个子串。这个值只取决于模式串,所以可以在搜索开始前算好 ——
              这是 KMP 能 O(n + m) 的根。构建时「模式串和自己比」,失配沿{" "}
              <b>j = next[j−1]</b> 回退。
            </>,
            <>
              KMP 匹配:<b>主串指针 i 永不回退</b>,只回退 j。构建 O(m) + 扫描 O(n) ={" "}
              <b>O(n + m)</b>,这个上界靠摊还得到:外层每步 j 最多 +1,而每次回退 j 至少 −1。
              它在最坏情况下也成立,所以不怕对抗性数据。
            </>,
            <>
              <b>Rabin-Karp 滚动哈希</b>:把窗口哈希成一个数,窗口移动时 O(1) 更新
              (去掉最高次项、乘 base、补入新字符),全程对大质数取模。
              哈希相等只是候选,<b>必须逐字符复核</b>。所以它是<b>期望</b> O(n + m);
              碰撞频繁时最坏是 O(n·m)。工程上用双哈希降低碰撞率。
            </>,
            <>
              next 数组的用法:<b>459</b> 判循环节(k = next[n−1],再判 k &gt; 0 且
              n % (n−k) == 0)、<b>1392</b> 直接取末位、<b>214</b> 在{" "}
              <code>s + # + reverse(s)</code> 上求最长回文前缀。
              题面提到「重复 / 自相似」就想到 next。
            </>,
            <>
              回文靠<b>中心对称</b>:枚举 <b>2n−1</b> 个中心(n 个字符加 n−1 个缝隙)向两侧扩,
              O(n²);扩张停下时回文区间是 <b>[l+1, r−1]</b>,这是要记住的差一坑。
              Manacher 靠复用对称性做到 O(n),还要配上「让每个回文都是奇长度」的插分隔符技巧 ——
              知道思路即可。
            </>,
            <>
              解析类(205 / 8)不考花招,考的是
              <b>把模糊规则不重不漏地翻译成确定逻辑</b>:同构要<b>双向映射</b>,
              atoi 是<b>状态机 + 边界 checklist</b>。边界就是主考题。
            </>,
          ],
        }}
      />

      <ChapterFooter ch="strings" />
    </main>
  );
}
