"use client";

// 第 6 章 · 贪心 —— 承接回溯(把树画出来),预告 DP(贪心失效之地)。
// 叙事主线:贪心难的不是贪,是证明贪完不后悔。
//   §01 为什么贪心(直觉 + 快 + 危险)→ §02 交换论证 · 分发饼干(本章灵魂)→
//   §03 序列贪心(376/53盘/122 贪心 vs DP 双视角)→ §04 跳跃游戏(55/45 覆盖范围)→
//   §05 模拟贪心(860/134/135/406)→ §06 区间贪心(435/452/763/56盘,按左端还是右端)→
//   §07 贪心失效之地(322 与 0/1 背包反例 + 贪心 vs DP 判据)→ 题单 → 测验。
// 可视化在 ./viz:CookieMatch(455)、JumpReach(55)、JumpMin(45)、
// IntervalTimeline(435 自建时间轴)、CoinGreedyLab(322 交互反例)。
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
import { PROBLEMS, QUIZ } from "@/lib/greedy-data";
import {
  CookieMatch,
  JumpReach,
  JumpMin,
  IntervalTimeline,
  CoinGreedyLab,
} from "./viz";

const CHIPS = [
  { id: "why", n: "01", label: { en: "Why greedy", zh: "为什么贪心" } },
  { id: "proof", n: "02", label: { en: "Exchange argument", zh: "交换论证 · 饼干" } },
  { id: "seq", n: "03", label: { en: "Sequence greedy", zh: "序列贪心" } },
  { id: "jump", n: "04", label: { en: "Jump game", zh: "跳跃游戏" } },
  { id: "sim", n: "05", label: { en: "One local rule", zh: "模拟贪心" } },
  { id: "interval", n: "06", label: { en: "Intervals", zh: "区间贪心" } },
  { id: "fail", n: "07", label: { en: "Where greedy fails", zh: "贪心失效" } },
  { id: "problems", n: "08", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "09", label: { en: "Quiz", zh: "通关测验" } },
];

// 摆动序列小图示:1,4,7,2,5 —— 只有端点与拐点(7、2)进入摆动子序列
const WIGGLE = [
  { v: 1, h: 32, peak: true },
  { v: 4, h: 68, peak: false },
  { v: 7, h: 104, peak: true },
  { v: 2, h: 44, peak: true },
  { v: 5, h: 80, peak: true },
];

export default function GreedyChapter() {
  return (
    <main className="page" data-ch="greedy">
      <Hero
        ch="greedy"
        title={{
          en: (
            <>
              Greedy <span className="grad">algorithms</span>
            </>
          ),
          zh: (
            <>
              贪心 <span className="grad">Greedy</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A greedy algorithm <strong>makes the choice that looks best right
              now and never changes it</strong>. That makes it the fastest
              approach in this course, and it is also the reason it can silently
              return a wrong answer. This chapter covers three things: when a
              greedy choice is safe,{" "}
              <strong>how to prove it with an exchange argument</strong>, and
              what to do when the proof fails.
            </>
          ),
          zh: (
            <>
              贪心<strong>每一步都选当下看起来最好的,而且绝不回头</strong>。
              这让它成为本课程里最快的解法,也让它可能悄无声息地给出错误答案。
              本章讲三件事:什么时候可以贪、
              <strong>怎么用交换论证证明它成立</strong>、以及证不出来时该怎么办。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 为什么贪心 ================= */}
      <Section
        id="why"
        index="01"
        title={{
          en: "Fast, but it needs a proof",
          zh: "为什么会有贪心:快,但要有证据",
        }}
        desc={{
          en: "Greedy is not a data structure. It is a way of deciding: look only at the current step, and commit.",
          zh: "贪心不是新数据结构,而是一种决策方式:只看当前这一步,选了就不改",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Here is a greedy algorithm you already run every day:{" "}
                  <strong>making change</strong>. To give back 68 with notes of
                  50, 10, 5, and 1, a cashier does not solve an equation. She
                  takes a 50, then a 10, then a 5, then three 1s. Each step takes
                  the largest note that still fits. That is greedy:{" "}
                  <strong>
                    break a large problem into a sequence of small decisions,
                    take the best-looking option at each one, and never go back
                  </strong>
                  .
                </>
              }
              zh={
                <>
                  先看一个你每天都在跑的贪心算法:<strong>找零</strong>。
                  要用 50、10、5、1 四种面额找回 68 元,收银员不会去解方程,
                  而是先拿一张 50,再 10,再 5,再三个 1 ——
                  每一步都拿「还放得下的最大面额」。这就是贪心:
                  <strong>
                    把大问题拆成一连串小决策,每一步选当下看起来最好的,并且绝不回头
                  </strong>
                  。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  That example works. But it works because of{" "}
                  <strong>these particular note values</strong>, not because
                  greedy always works. Change the values to 1, 3, and 4 and ask
                  for 6: greedy takes the 4 first and needs three coins, while 3
                  + 3 needs only two. Same method, same kind of problem, wrong
                  answer. Section 07 takes that example apart.
                </>
              }
              zh={
                <>
                  这个例子是对的。但它对,是因为<strong>这几种面额本身的性质</strong>,
                  不是因为贪心总是对。把面额换成 1、3、4,金额换成 6:
                  贪心先拿 4,一共要 3 枚,而 3 + 3 只要 2 枚。
                  同样的方法、同样类型的问题,答案却错了。§07 会专门解剖这个例子。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Compare greedy with the two approaches you already know.{" "}
                  <strong>Backtracking</strong> (chapter 05) tries every choice
                  and undoes the ones that lead nowhere: always correct, but
                  exponential. <strong>Dynamic programming</strong> (next
                  chapter) also considers every choice, but stores the answer of
                  each subproblem so it is computed once: always correct, and
                  polynomial. Greedy goes further than both:{" "}
                  <strong>
                    it keeps exactly one choice per step and throws the rest away
                  </strong>
                  . That is why it usually runs in O(n) or O(n log n), and it is
                  also why it needs a proof. Dropping the other choices is only
                  safe if you can show none of them was needed.
                </>
              }
              zh={
                <>
                  和你已经学过的两种方法比一下。<strong>回溯</strong>(第 5 章)
                  把每个选择都试一遍,走不通就撤销:必对,但指数级。
                  <strong>动态规划</strong>(下一章)同样考虑所有选择,
                  但把每个子问题的答案记下来,只算一次:必对,多项式时间。
                  贪心比两者都激进:
                  <strong>每一步只保留一个选择,其余全部丢弃</strong>。
                  这就是它通常只要 O(n) 或 O(n log n) 的原因,
                  也是它必须证明的原因 ——
                  只有能说明「被丢掉的选择都用不上」,丢弃才是安全的。
                </>
              }
            />
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en={<>Property 01</>} zh={<>特征 01</>} />
            </div>
            <div className="card-title">
              <T
                en={<>Local best builds the global best</>}
                zh={<>局部最优 → 全局最优</>}
              />
            </div>
            <p>
              <T
                en={
                  <>
                    Greedy assumes one thing:{" "}
                    <b>
                      the best choice at each step belongs to some best overall
                      answer
                    </b>
                    . When that holds, the problem has the{" "}
                    <b>greedy-choice property</b>. When it does not, you need DP.
                  </>
                }
                zh={
                  <>
                    贪心押的是一件事:
                    <b>每一步当下最好的选择,都属于某个整体最优解</b>。
                    这一点成立时,问题就具备<b>贪心选择性质</b>;
                    不成立就得改用 DP。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en={<>Property 02</>} zh={<>特征 02</>} />
            </div>
            <div className="card-title">
              <T en={<>No second thoughts</>} zh={<>不反悔</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    A choice is never undone, unlike backtracking. Not going back
                    is what makes greedy fast, and it is also what makes it
                    fragile: <b>one wrong step can never be repaired</b>.
                  </>
                }
                zh={
                  <>
                    选了就不撤销,不像回溯会退回来。不回头让贪心变快,
                    也让它变脆弱:<b>只要有一步选错,就再也补不回来</b>。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en={<>Property 03</>} zh={<>特征 03</>} />
            </div>
            <div className="card-title">
              <T en={<>⚡ Sorting comes first</>} zh={<>⚡ 常常先排序</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    Many greedy solutions start by <b>sorting</b> (455, 435,
                    452), because the sort decides in which order the decisions
                    are made. So the cost of a greedy solution is often dominated
                    by the <BigO o="nlogn" /> of the sort.
                  </>
                }
                zh={
                  <>
                    大量贪心题的第一步是<b>排序</b>(455 / 435 / 452),
                    因为排序决定了「先处理谁」这个决策顺序。
                    所以贪心的复杂度常常由排序的 <BigO o="nlogn" /> 主导。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "Passing a few test cases is not a proof",
            zh: "跑过几个例子,不等于证明",
          }}
        >
          <p>
            <T
              en={
                <>
                  Greedy code is short, and short code that passes a handful of
                  examples feels finished. It is not. A classic failure: with
                  coins <code>[1, 3, 4]</code> and amount 6, greedy takes the
                  largest coin first and gets 4 + 1 + 1 = 3 coins, while the best
                  answer is 3 + 3 = <b>2 coins</b>. Greedy never looks at a plan
                  that starts with a 3, because 4 looked better at the time.
                  Section 07 opens that case up, and the next chapter builds the
                  DP solution for it.{" "}
                  <b>
                    A proof is the only thing separating a greedy algorithm from
                    a guess that happened to work.
                  </b>
                </>
              }
              zh={
                <>
                  贪心的代码很短,而短代码跑过几个例子就很像做完了 —— 其实没有。
                  经典的失败:硬币 <code>[1, 3, 4]</code> 凑 6,
                  贪心先拿最大的 4,得到 4 + 1 + 1 = 3 枚,而最优是 3 + 3 ={" "}
                  <b>2 枚</b>。贪心从不去看「以 3 开头」的方案,
                  因为在那一刻 4 看起来更好。§07 会把这个例子拆开讲,
                  下一章则会给出它的 DP 解法。
                  <b>能不能证明,是贪心算法与「碰巧对了」之间唯一的区别。</b>
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="story"
          title={{
            en: "Huffman coding: a greedy algorithm that started as homework",
            zh: "哈夫曼编码:一个从课程作业里长出来的贪心经典",
          }}
        >
          <p>
            <T
              en={
                <>
                  In 1951, David Huffman was a graduate student at MIT. His
                  professor, Robert Fano, offered a term paper problem: find the
                  optimal prefix code. Fano and Claude Shannon had only found a
                  top-down method that is not always optimal. Huffman was close
                  to giving up when he tried the opposite direction:{" "}
                  <b>
                    build the tree bottom up, repeatedly merging the two least
                    frequent nodes
                  </b>
                  . That is a greedy rule, and it is provably optimal. Huffman
                  coding is still used inside JPEG, MP3, and ZIP. Once a greedy
                  rule is proven, it is both fast and dependable.
                </>
              }
              zh={
                <>
                  1951 年,David Huffman 还是 MIT 的研究生。
                  他的老师 Robert Fano 布置了一道期末论文题:找出最优前缀编码。
                  Fano 和 Claude Shannon 此前只想出了一种自顶向下、并不总是最优的方法。
                  Huffman 几乎要放弃时换了个方向:
                  <b>自底向上建树,每次合并频率最小的两个节点</b>。
                  这是一条贪心规则,而且可以证明它最优。
                  哈夫曼编码至今仍活在 JPEG、MP3、ZIP 里。
                  一条贪心规则一旦被证明,就是又快又可靠的解法。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 交换论证 + 精讲 A ================= */}
      <Section
        id="proof"
        index="02"
        title={{
          en: "The exchange argument",
          zh: "交换论证:证明「贪完不后悔」的通用武器",
        }}
        desc={{
          en: "Featured problem A · LC 455 Assign Cookies — learn the proof first, then the code",
          zh: "精讲 A · LC 455 分发饼干 —— 先学会证明,再谈怎么贪",
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
                  <b>The problem:</b> each child i has an appetite{" "}
                  <code>g[i]</code>, and each cookie j has a size{" "}
                  <code>s[j]</code>. One cookie goes to at most one child, and
                  the child is satisfied only if <code>s[j] ≥ g[i]</code>. How
                  many children can be satisfied at most?
                </>
              }
              zh={
                <>
                  <b>题意:</b>第 i 个孩子有一个胃口值 <code>g[i]</code>,
                  第 j 块饼干有一个尺寸 <code>s[j]</code>。
                  一块饼干最多给一个孩子,而且必须 <code>s[j] ≥ g[i]</code>{" "}
                  才能让他满足。最多能满足几个孩子?
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>The greedy rule:</b> sort both arrays, then give the child
                  with the smallest appetite{" "}
                  <strong>the smallest cookie that is still large enough</strong>
                  . If the smallest remaining cookie is too small even for that
                  child, it is too small for every child, so discard it. Watch it
                  run once before reading the proof.
                </>
              }
              zh={
                <>
                  <b>贪心规则:</b>把两个数组都排序,然后给胃口最小的孩子
                  <strong>「还够用的最小饼干」</strong>。
                  如果剩下最小的那块连他都喂不动,那它对谁都不够用,直接丢掉。
                  先看它跑一遍,再看证明。
                </>
              }
            />
          </p>
        </div>
        <CookieMatch />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  The code is a sort plus one pass with two pointers. Short code
                  is not the same as correct code, so{" "}
                  <b>the important question is why this rule cannot lose.</b>
                </>
              }
              zh={
                <>
                  代码就是排序加一次双指针扫描。短不等于对,
                  <b>真正要回答的问题是:凭什么这条规则不会吃亏?</b>
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc455_assign_cookies"
          java={{
            code: {
              en: `class Solution {
    public int findContentChildren(int[] g, int[] s) {
        Arrays.sort(g);                 // appetites, ascending
        Arrays.sort(s);                 // cookie sizes, ascending
        int child = 0;                  // unsatisfied child with the smallest appetite
        for (int j = 0; j < s.length && child < g.length; j++) {
            if (s[j] >= g[child]) {     // this cookie is large enough for that child
                child++;                // feed him, move on to the next child
            }                           // too small here means too small for everyone
        }
        return child;                   // number of children satisfied
    }
}`,
              zh: `class Solution {
    public int findContentChildren(int[] g, int[] s) {
        Arrays.sort(g);                 // 孩子胃口升序
        Arrays.sort(s);                 // 饼干尺寸升序
        int child = 0;                  // 当前要满足的孩子(胃口最小的未满足者)
        for (int j = 0; j < s.length && child < g.length; j++) {
            if (s[j] >= g[child]) {     // 这块饼干喂得动当前孩子
                child++;                // 满足一个,换下一个孩子
            }                           // 喂不动他,就对谁都不够用
        }
        return child;                   // 满足的孩子数
    }
}`,
            },
            hl: [7, 8],
            note: {
              en: (
                <>
                  Both pointers only move forward, so the scan itself is O(n).
                  The total cost is dominated by the sort:{" "}
                  <b>O(n log n)</b> time, O(1) extra space beyond sorting.
                </>
              ),
              zh: (
                <>
                  两个指针都只往前走,扫描本身是 O(n)。
                  总复杂度由排序主导:时间 <b>O(n log n)</b>,
                  除排序外额外空间 O(1)。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def findContentChildren(self, g: list[int], s: list[int]) -> int:
        g.sort()                        # appetites, ascending
        s.sort()                        # cookie sizes, ascending
        child = 0
        for cookie in s:                # start from the smallest cookie
            if child < len(g) and cookie >= g[child]:
                child += 1              # large enough: satisfy the smallest appetite left
        return child`,
              zh: `class Solution:
    def findContentChildren(self, g: list[int], s: list[int]) -> int:
        g.sort()                        # 孩子胃口升序
        s.sort()                        # 饼干尺寸升序
        child = 0
        for cookie in s:                # 从最小的饼干开始试
            if child < len(g) and cookie >= g[child]:
                child += 1              # 刚好够,满足当前胃口最小的孩子
        return child`,
            },
            hl: [7, 8],
            note: {
              en: (
                <>
                  The loop walks the cookies and the pointer walks the children.
                  A cookie is handed out as soon as it satisfies{" "}
                  <b>the unsatisfied child with the smallest appetite</b>;
                  otherwise the loop simply moves to the next, larger cookie.
                </>
              ),
              zh: (
                <>
                  循环遍历饼干,指针指向孩子。
                  只要当前饼干喂得动<b>胃口最小的未满足孩子</b>就发出去,
                  否则自然进入下一块更大的饼干。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var findContentChildren = function (g, s) {
  g.sort((a, b) => a - b);           // JS sorts as text by default; numbers need a comparator
  s.sort((a, b) => a - b);
  let child = 0;
  for (let j = 0; j < s.length && child < g.length; j++) {
    if (s[j] >= g[child]) child++;   // one more child satisfied
  }
  return child;
};`,
              zh: `var findContentChildren = function (g, s) {
  g.sort((a, b) => a - b);           // JS 默认按字符串排序,数字必须传比较器
  s.sort((a, b) => a - b);
  let child = 0;
  for (let j = 0; j < s.length && child < g.length; j++) {
    if (s[j] >= g[child]) child++;   // 又满足一个孩子
  }
  return child;
};`,
            },
            hl: [2, 3],
            note: {
              en: (
                <>
                  <b>Common JavaScript mistake:</b> <code>[10, 2].sort()</code>{" "}
                  returns <code>[10, 2]</code>, because the default comparison
                  converts values to strings. Numeric sorting{" "}
                  <b>always</b> needs <code>(a, b) =&gt; a - b</code>. Without
                  it, the greedy rule is applied to the wrong order.
                </>
              ),
              zh: (
                <>
                  <b>JavaScript 常见错误:</b><code>[10, 2].sort()</code> 会得到{" "}
                  <code>[10, 2]</code>,因为默认比较会把值转成字符串。
                  数字排序<b>必须</b>写 <code>(a, b) =&gt; a - b</code>,
                  否则贪心是在错误的顺序上执行的。
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
                  Now the proof. The tool is the{" "}
                  <strong>exchange argument</strong>, and it is the template
                  behind almost every greedy correctness proof in this chapter.
                  The idea in one sentence:{" "}
                  <strong>
                    take any optimal solution that disagrees with the greedy
                    choice, and rewrite it so that it agrees, without making it
                    worse
                  </strong>
                  . If such a rewrite always exists, then some optimal solution
                  contains the greedy choice, so making that choice loses
                  nothing. Three steps:
                </>
              }
              zh={
                <>
                  下面是证明。用的工具叫<strong>交换论证</strong>,
                  它是本章几乎所有贪心正确性证明的模板。一句话概括:
                  <strong>
                    任取一个与贪心选择不同的最优解,把它改写成与贪心一致,且不让它变差
                  </strong>
                  。如果这样的改写总是存在,就说明「某个最优解包含贪心的这个选择」,
                  于是这么选不会有任何损失。三步走:
                </>
              }
            />
          </p>
        </div>
        <div className="grd-steps">
          <div className="grd-step">
            <div>
              <h4>
                <T
                  en={<>Name the greedy choice, and take any optimal solution</>}
                  zh={<>写下贪心的选择,再任取一个最优解</>}
                />
              </h4>
              <p>
                <T
                  en={
                    <>
                      Let c₀ be the child with the smallest appetite and s* the
                      smallest cookie with s* ≥ g[c₀]. Greedy pairs them. (Every
                      cookie smaller than s* satisfies no child at all, because
                      c₀ is the least demanding one.) Now take any optimal
                      assignment OPT and compare.
                    </>
                  }
                  zh={
                    <>
                      设 c₀ 是胃口最小的孩子,s* 是满足 s* ≥ g[c₀] 的最小饼干,
                      贪心把这两者配在一起。(比 s* 更小的饼干对谁都不够用,
                      因为 c₀ 已经是最好满足的那个。)
                      现在任取一个最优方案 OPT,和贪心比对。
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <div className="grd-step">
            <div>
              <h4>
                <T
                  en={<>Rewrite OPT so that it pairs c₀ with s*</>}
                  zh={<>把 OPT 改写成「c₀ 配 s*」</>}
                />
              </h4>
              <p>
                <T
                  en={
                    <>
                      If OPT satisfies c₀ with another cookie s′, then s′ ≥ g[c₀]
                      and therefore s′ ≥ s*. Give s* to c₀ instead. If s* was
                      used by another child, hand that child s′; since s′ ≥ s*,
                      he is still satisfied. If OPT leaves c₀ unsatisfied, then
                      s* cannot be idle in OPT, otherwise OPT could feed one more
                      child and would not be optimal. So s* is used by some child
                      c′; give s* to c₀ and drop c′.
                    </>
                  }
                  zh={
                    <>
                      如果 OPT 用另一块饼干 s′ 满足了 c₀,那么 s′ ≥ g[c₀],
                      因而 s′ ≥ s*。改成用 s* 喂 c₀:若 s* 原本给了别的孩子,
                      就把 s′ 转给那个孩子 —— s′ ≥ s*,他照样满足。
                      如果 OPT 根本没满足 c₀,那 s* 在 OPT 里不可能闲置,
                      否则 OPT 还能多喂一个孩子,就不是最优解了。
                      所以 s* 一定被某个孩子 c′ 用着;把 s* 转给 c₀,放弃 c′。
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <div className="grd-step">
            <div>
              <h4>
                <T
                  en={<>The count never drops, so induct on the rest</>}
                  zh={<>满足数不减少,于是对剩下的部分归纳</>}
                />
              </h4>
              <p>
                <T
                  en={
                    <>
                      In every case the number of satisfied children stays the
                      same, and the rewritten solution now makes the greedy first
                      choice. Remove c₀ and s*: what remains is the same problem
                      with one child and one cookie fewer. Repeat the argument
                      there. After all steps, greedy has matched an optimal
                      solution. <b>That completes the proof.</b>
                    </>
                  }
                  zh={
                    <>
                      每种情况下满足的孩子数都不变,而改写后的方案第一步已经和贪心一致。
                      把 c₀ 和 s* 拿掉,剩下的是少了一个孩子、一块饼干的同类问题,
                      对它重复同样的论证。走完所有步骤,
                      贪心解就和某个最优解一样好。<b>证毕。</b>
                    </>
                  }
                />
              </p>
            </div>
          </div>
        </div>
        <Callout
          tone="deep"
          title={{
            en: "An exchange argument is induction wearing a costume",
            zh: "交换论证就是穿了外衣的数学归纳法",
          }}
        >
          <p>
            <T
              en={
                <>
                  Strip away the story and you get <b>induction</b>. The
                  hypothesis is &quot;there exists an optimal solution that
                  agrees with greedy on the first k steps&quot;. The inductive
                  step is &quot;one rewrite that does not make things worse
                  extends the agreement to step k + 1&quot;. Sorting-based greedy
                  proofs (455, 435, 452, 56), activity selection, and Huffman
                  coding all share this skeleton. In an interview you do not need
                  the full write-up, but you should be able to say{" "}
                  <b>
                    &quot;I take the first place where an optimal solution differs
                    from mine and swap it, and I show the swap does not make the
                    solution worse&quot;
                  </b>
                  . That sentence is the difference between a proof and a hunch.
                </>
              }
              zh={
                <>
                  剥掉故事,剩下的就是<b>数学归纳法</b>。
                  归纳假设是「存在一个最优解,它前 k 步与贪心一致」;
                  归纳步骤是「一次不变差的改写,可以把一致延长到第 k + 1 步」。
                  排序类贪心的证明(455 / 435 / 452 / 56)、活动选择、
                  哈夫曼编码,骨架都是这一套。面试时不必写满整块白板,
                  但要能说出
                  <b>
                    「我找到最优解与我的解第一处不同的地方,把它换成我的选择,
                    并说明换完不会更差」
                  </b>
                  。这句话就是「证明」和「直觉」的分界线。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="win"
          title={{
            en: "How to state the proof out loud",
            zh: "怎么把这个证明讲出来",
          }}
        >
          <p>
            <T
              en={
                <>
                  &quot;I sort both arrays and give the child with the smallest
                  appetite the smallest cookie that satisfies him.{" "}
                  <b>For correctness I use an exchange argument</b>: if an
                  optimal assignment does not make that pairing, I can rewrite it
                  so that it does, and the number of satisfied children does not
                  drop. Repeating this on the remaining children shows my answer
                  is optimal.&quot; Two sentences, and the claim is now backed by
                  a reason instead of a feeling.
                </>
              }
              zh={
                <>
                  「我把两个数组都排序,让胃口最小的孩子拿到能满足他的最小饼干。
                  <b>正确性用交换论证</b>:如果某个最优方案没有这样配对,
                  我可以把它改写成这样,而满足的孩子数不减少;
                  对剩下的孩子重复这个论证,就说明我的答案是最优的。」
                  两句话,结论背后就有了理由,而不是感觉。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 序列贪心 ================= */}
      <Section
        id="seq"
        index="03"
        title={{
          en: "Sequence greedy: one decision per element",
          zh: "序列贪心:在一维数组上逐个做决策",
        }}
        desc={{
          en: "376 count direction changes · 53 Kadane (review) · 122 stocks, greedy and DP side by side",
          zh: "376 数方向变化 · 53 复盘 Kadane · 122 股票(贪心与 DP 对照)",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The lightest kind of greedy: one linear scan, with a small
                  decision at each element based on its relation to the previous
                  one. Start with <strong>LC 376 Wiggle Subsequence</strong>. A
                  wiggle sequence is one where consecutive differences are
                  non-zero and alternate in sign: up, down, up, down. The task is
                  to find the longest wiggle subsequence.
                </>
              }
              zh={
                <>
                  最轻量的一类贪心:一次线性扫描,
                  每个元素根据它和前一个的关系做一个小决定。
                  先看 <strong>LC 376 摆动序列</strong>。
                  摆动序列是指相邻差都不为零、且正负交替的序列(上、下、上、下),
                  题目要求最长的摆动子序列有多长。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>The greedy observation:</b> treat a stretch of equal values
                  as a single value, then cut the array into{" "}
                  <strong>maximal runs that go only up or only down</strong>.
                  Inside a run, the middle elements contribute nothing, because
                  they do not change direction. Keeping only the last element of
                  each run keeps the wiggle just as long, so{" "}
                  <strong>
                    if there are k runs, the answer is k + 1
                  </strong>{" "}
                  (the last element of each run, plus the first element of the
                  array). In{" "}
                  <code>[1, 4, 7, 2, 5]</code> the runs are 1→7, 7→2, and 2→5, so
                  k = 3 and the answer is 4. The 4 in the middle is one stop on
                  the way up (grey); the endpoints and the turning points 7 and 2
                  are what count (highlighted):
                </>
              }
              zh={
                <>
                  <b>贪心洞察:</b>先把一串相等的值当作一个值,再把数组切成
                  <strong>「只升」或「只降」的极大单调段</strong>。
                  段内的中间元素毫无贡献,因为它们没有改变方向。
                  每段只保留最后一个元素,摆动长度不会变短,所以
                  <strong>有 k 段时,答案就是 k + 1</strong>
                  (每段的最后一个元素,加上数组的第一个元素)。
                  在 <code>[1, 4, 7, 2, 5]</code> 中,三段分别是 1→7、7→2、2→5,
                  k = 3,答案为 4。中间的 4 只是上坡途中的一站(灰色),
                  真正算数的是端点和拐点 7、2(高亮):
                </>
              }
            />
          </p>
        </div>
        <div className="viz">
          <div className="viz-title">
            <T
              en={<>LC 376 · only direction changes count: 1 → 7 → 2 → 5, length 4</>}
              zh={<>LC 376 · 只有方向变化算数:1 → 7 → 2 → 5,长度 4</>}
            />
          </div>
          <div className="viz-stage">
            <div className="grd-wiggle">
              {WIGGLE.map((w, i) => (
                <div
                  key={i}
                  className="grd-wcol"
                  data-peak={w.peak ? "1" : "0"}
                  style={{ height: w.h }}
                >
                  {w.v}
                </div>
              ))}
            </div>
          </div>
          <div className="viz-msg">
            <T
              en={
                <>
                  The four highlighted values form the wiggle subsequence 1 → 7 →
                  2 → 5, with differences +6, −5, +3, which alternate in sign.
                  The grey 4 is skipped because 1 → 4 → 7 keeps going in the same
                  direction, so 4 adds no length.
                </>
              }
              zh={
                <>
                  高亮的 4 个值组成摆动子序列 1 → 7 → 2 → 5,
                  差值 +6、−5、+3,正负交替。灰色的 4 被跳过,
                  因为 1 → 4 → 7 一直是同一个方向,4 不增加长度。
                </>
              }
            />
          </div>
        </div>
        <CodeTabs
          title="lc376_wiggle_subsequence"
          java={{
            code: {
              en: `class Solution {
    public int wiggleMaxLength(int[] nums) {
        if (nums.length < 2) return nums.length;
        int up = 1, down = 1;           // longest wiggle ending with a rise / with a fall
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] > nums[i - 1]) up = down + 1;      // a rise starts a new run
            else if (nums[i] < nums[i - 1]) down = up + 1; // a fall starts a new run
            // equal neighbours: direction is unchanged, both stay as they are
        }
        return Math.max(up, down);
    }
}`,
              zh: `class Solution {
    public int wiggleMaxLength(int[] nums) {
        if (nums.length < 2) return nums.length;
        int up = 1, down = 1;           // 以上升 / 下降结尾的最长摆动长度
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] > nums[i - 1]) up = down + 1;      // 上升,开启新的一段
            else if (nums[i] < nums[i - 1]) down = up + 1; // 下降,开启新的一段
            // 相邻相等:方向没变,up 和 down 都不动
        }
        return Math.max(up, down);
    }
}`,
            },
            hl: [6, 7],
            note: {
              en: (
                <>
                  Two counters instead of an array: <code>up</code> only grows on
                  a rise and <code>down</code> only on a fall, so a run of equal
                  values counts as a single point. Time <b>O(n)</b>, space O(1).
                </>
              ),
              zh: (
                <>
                  用两个计数器代替数组:<code>up</code> 只在上升时增长,
                  <code>down</code> 只在下降时增长,
                  所以一串相等的值只算作一个点。时间 <b>O(n)</b>、空间 O(1)。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def wiggleMaxLength(self, nums: list[int]) -> int:
        if len(nums) < 2:
            return len(nums)
        up = down = 1
        for i in range(1, len(nums)):
            if nums[i] > nums[i - 1]:
                up = down + 1           # a rise starts a new run
            elif nums[i] < nums[i - 1]:
                down = up + 1           # a fall starts a new run
        return max(up, down)`,
              zh: `class Solution:
    def wiggleMaxLength(self, nums: list[int]) -> int:
        if len(nums) < 2:
            return len(nums)
        up = down = 1
        for i in range(1, len(nums)):
            if nums[i] > nums[i - 1]:
                up = down + 1           # 上升,开启新的一段
            elif nums[i] < nums[i - 1]:
                down = up + 1           # 下降,开启新的一段
        return max(up, down)`,
            },
            hl: [8, 10],
            note: {
              en: (
                <>
                  There is deliberately no branch for equal neighbours. A flat
                  stretch produces no direction change, and forgetting that is
                  the most common mistake in this problem.
                </>
              ),
              zh: (
                <>
                  这里刻意没有为「相邻相等」写分支。
                  一段平台不产生方向变化,而漏掉这一点是本题最常见的错误。
                </>
              ),
            },
          }}
          js={{
            code: `var wiggleMaxLength = function (nums) {
  if (nums.length < 2) return nums.length;
  let up = 1, down = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > nums[i - 1]) up = down + 1;
    else if (nums[i] < nums[i - 1]) down = up + 1;
  }
  return Math.max(up, down);
};`,
            hl: [5, 6],
            note: {
              en: (
                <>
                  Two rolling variables, no extra array. Each direction change
                  makes one of them the other plus one, and the answer is the
                  larger of the two.
                </>
              ),
              zh: (
                <>
                  两个滚动变量,不需要额外数组。
                  每次方向变化都让其中一个变成另一个加一,最后取两者中较大的。
                </>
              ),
            },
          }}
        />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            <T
              en={
                <>
                  <b>LC 53 Maximum Subarray (review):</b> the greedy reading of
                  Kadane&apos;s algorithm is{" "}
                  <b>
                    if the sum carried in from the left is negative, it can only
                    make the next subarray smaller, so drop it
                  </b>
                  . That is <code>cur = max(nums[i], cur + nums[i])</code>, while
                  tracking the largest <code>cur</code> seen. The same line is
                  also a one-dimensional DP where <code>cur</code> is the largest
                  sum of a subarray ending at index i. Chapter 07 teaches it in
                  full, with a cell-by-cell animation. Here it is only a
                  reminder that one problem can have two justifications.
                </>
              }
              zh={
                <>
                  <b>LC 53 最大子数组和(复盘):</b>Kadane 算法的贪心读法是
                  <b>
                    「从左边带过来的和如果是负的,只会让后面的子数组更小,那就丢掉」
                  </b>
                  ,写出来就是 <code>cur = max(nums[i], cur + nums[i])</code>,
                  同时记录见过的最大 <code>cur</code>。同一行代码也是一维 DP:
                  <code>cur</code> 表示以下标 i 结尾的最大子数组和。
                  第 7 章会完整讲它,并配逐格动画。
                  这里只是提醒:同一道题可以有两种解释。
                </>
              }
            />
          </p>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "LC 122 Best Time to Buy and Sell Stock II: greedy and DP agree",
            zh: "LC 122 买卖股票 II:贪心和 DP 给出同一个答案",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> one price per day, unlimited transactions,
                  at most one share held at a time. Maximise the profit.
                  <b> The greedy view:</b> collect every rise,{" "}
                  <code>profit += max(0, p[i] − p[i−1])</code>. Why that is
                  optimal, in two parts. First, a trade that buys on day i and
                  sells on day j earns <code>p[j] − p[i]</code>, which equals the
                  sum of <b>all</b> day-to-day differences in that range, so it
                  is at most the sum of the <b>positive</b> ones. Trades never
                  overlap, so each difference is counted at most once, making{" "}
                  <code>Σ max(0, Δ)</code> an upper bound for every possible
                  strategy. Second, buying and selling on each rising day reaches
                  that bound exactly, so the bound is achieved and the greedy
                  answer is optimal.
                  <b> The DP view:</b> two states per day, holding a share or
                  holding cash, with transitions for buy, sell, and do nothing
                  (chapter 10). Two routes, same number:
                </>
              }
              zh={
                <>
                  <b>题意:</b>每天一个价格,可以无限次交易,
                  但同一时刻最多持有一股,求最大利润。
                  <b> 贪心视角:</b>把每一次上涨都收下,
                  <code>profit += max(0, p[i] − p[i−1])</code>。
                  为什么最优,分两步。其一,第 i 天买、第 j 天卖的收益{" "}
                  <code>p[j] − p[i]</code> 等于这段区间内<b>全部</b>相邻差之和,
                  所以不超过其中<b>正</b>差之和;而多次交易的持仓区间互不重叠,
                  每个差值最多被算一次,因此 <code>Σ max(0, Δ)</code>{" "}
                  是任何策略都超不过的上界。其二,「每个上涨日都交易一次」
                  恰好取到这个上界,所以贪心解就是最优解。
                  <b> DP 视角:</b>每天两个状态 —— 持股或空仓,
                  在买入 / 卖出 / 不动之间转移(第 10 章)。两条路,同一个数:
                </>
              }
            />
          </p>
        </Callout>
        <div className="grd-duel">
          <div className="card">
            <div className="card-kicker">
              <T en={<>Greedy · collect every rise</>} zh={<>贪心 · 收下每次上涨</>} />
            </div>
            <div className="card-title">
              <b className="mono">Σ max(0, Δ)</b>
            </div>
            <p>
              <T
                en={
                  <>
                    One line, O(n) time and O(1) space. It works whenever you can
                    show a multi-day gain equals the sum of its day-to-day rises,
                    which is the sentence that carries the whole argument.
                  </>
                }
                zh={
                  <>
                    一行,时间 O(n)、空间 O(1)。
                    只要能说明「多日涨幅等于其中相邻上涨之和」,它就成立 ——
                    整个论证就压在这一句话上。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en={<>DP · hold / cash state machine</>} zh={<>DP · 持股 / 空仓状态机</>} />
            </div>
            <div className="card-title">
              <b className="mono">hold / cash</b>
            </div>
            <p>
              <T
                en={
                  <>
                    <code>hold = max(hold, cash − p)</code>;{" "}
                    <code>cash = max(cash, hold + p)</code>. With a transaction
                    fee (714) or a transaction limit (123), the greedy rule stops
                    being optimal and only the state machine still works. Heavier
                    to write, but general.
                  </>
                }
                zh={
                  <>
                    <code>hold = max(hold, cash − p)</code>;
                    <code>cash = max(cash, hold + p)</code>。
                    一旦加上手续费(714)或限制交易次数(123),
                    贪心就不再最优,只有状态机还能用。写起来重一些,但通用。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <CodeTabs
          title="lc122_best_time_to_buy_sell_stock_ii"
          java={{
            code: {
              en: `class Solution {
    public int maxProfit(int[] prices) {
        int profit = 0;
        for (int i = 1; i < prices.length; i++) {
            if (prices[i] > prices[i - 1])
                profit += prices[i] - prices[i - 1]; // take every rise
        }
        return profit;
    }
}`,
              zh: `class Solution {
    public int maxProfit(int[] prices) {
        int profit = 0;
        for (int i = 1; i < prices.length; i++) {
            if (prices[i] > prices[i - 1])
                profit += prices[i] - prices[i - 1]; // 每次上涨都收下
        }
        return profit;
    }
}`,
            },
            hl: [5, 6],
            note: {
              en: (
                <>
                  A long rise is split into one small gain per day. On a falling
                  day the difference is negative and is simply not added. O(n)
                  time, O(1) space.
                </>
              ),
              zh: (
                <>
                  一段长上涨被拆成每天一小笔收益;
                  下跌那天差值为负,直接不加。时间 O(n)、空间 O(1)。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        return sum(
            max(0, prices[i] - prices[i - 1])   # add only the positive differences
            for i in range(1, len(prices))
        )`,
              zh: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        return sum(
            max(0, prices[i] - prices[i - 1])   # 只累加正的相邻差
            for i in range(1, len(prices))
        )`,
            },
            hl: [3, 4, 5],
            note: {
              en: (
                <>
                  One expression. If the greedy rule is not obvious to you during
                  an interview, write the state machine DP first (chapter 10);
                  the two must return the same number, so each one checks the
                  other.
                </>
              ),
              zh: (
                <>
                  一个表达式解决。如果面试时一时看不出贪心,
                  可以先写状态机 DP(第 10 章);两者的答案必然相同,可以互相验算。
                </>
              ),
            },
          }}
          js={{
            code: `var maxProfit = function (prices) {
  let profit = 0;
  for (let i = 1; i < prices.length; i++) {
    profit += Math.max(0, prices[i] - prices[i - 1]);
  }
  return profit;
};`,
            hl: [4],
            note: {
              en: (
                <>
                  The equivalent DP is{" "}
                  <code>hold = Math.max(hold, cash - p)</code> and{" "}
                  <code>cash = Math.max(cash, hold + p)</code>. Presenting both
                  shows you know why the short version is allowed.
                </>
              ),
              zh: (
                <>
                  等价的 DP 写法是 <code>hold = Math.max(hold, cash - p)</code>{" "}
                  与 <code>cash = Math.max(cash, hold + p)</code>。
                  把两种都摆出来,能说明你知道短写法为什么成立。
                </>
              ),
            },
          }}
        />
      </Section>

      {/* ================= §04 跳跃游戏 + 精讲 B ================= */}
      <Section
        id="jump"
        index="04"
        title={{
          en: "Jump game: track the reachable range, not the jumps",
          zh: "跳跃游戏:盯住覆盖范围,而不是「怎么跳」",
        }}
        desc={{
          en: "Featured problem B · LC 55 can you arrive → LC 45 in how few jumps",
          zh: "精讲 B · LC 55 能否到达 → LC 45 最少几步",
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
                  <b>LC 55:</b> each number says how many steps forward you may
                  jump from that cell. Can you get from index 0 to the last
                  index? <b>Brute force</b> tries every jump length from every
                  cell, which is exponential.{" "}
                  <b>The greedy observation:</b> you never need to know{" "}
                  <strong>which</strong> jumps to make. It is enough to track{" "}
                  <strong>the farthest index reachable so far</strong>. The
                  invariant is: when the scan arrives at index i and{" "}
                  <code>i ≤ reach</code>, every index from 0 to i is reachable
                  from the start, and <code>reach</code> is the farthest index
                  reachable using cells 0 to i as launch points. So if{" "}
                  <code>i &gt; reach</code>, index i is unreachable, and because
                  movement is forward only, nothing beyond it is reachable
                  either. Here is the case where the range falls one cell short:
                </>
              }
              zh={
                <>
                  <b>LC 55:</b>每个数字表示「站在这格最多能往前跳几步」,
                  问能否从 0 号到达最后一格。<b>暴力</b>是枚举每格跳几步,
                  指数级。<b>贪心洞察:</b>你根本不需要知道
                  <strong>具体怎么跳</strong>,只要维护
                  <strong>目前最远能到的下标</strong>就够了。不变量是:
                  当扫描走到下标 i 且 <code>i ≤ reach</code> 时,
                  0 到 i 的每个下标都可从起点到达,而 <code>reach</code>{" "}
                  是「只用 0 到 i 这些格子起跳」能到的最远下标。
                  因此一旦 <code>i &gt; reach</code>,i 号不可达;
                  又因为只能往前走,它之后的格子也都不可达。
                  下面就是覆盖范围差一格的例子:
                </>
              }
            />
          </p>
        </div>
        <JumpReach />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            <T
              en={
                <>
                  LC 55 needs three lines:{" "}
                  <code>reach = max(reach, i + nums[i])</code>, return false if{" "}
                  <code>i &gt; reach</code>, and return true at the end. Turning
                  &quot;can you arrive&quot; into{" "}
                  <strong>&quot;in how few jumps&quot;</strong> gives{" "}
                  <strong>LC 45 Jump Game II</strong>.
                </>
              }
              zh={
                <>
                  LC 55 的核心只有三行:
                  <code>reach = max(reach, i + nums[i])</code>,
                  若 <code>i &gt; reach</code> 返回 false,扫完返回 true。
                  把「能不能到」升级成<strong>「最少几步到」</strong>,
                  就是 <strong>LC 45 跳跃游戏 II</strong>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>Brute force or DP:</b> let dp[i] be the fewest jumps to
                  reach i, and for each i look back at every cell that can jump
                  to it. That is O(n²).{" "}
                  <b>Why O(n) is possible:</b> group the indices into{" "}
                  <strong>layers</strong>. Layer 1 is everything reachable in one
                  jump, layer 2 everything reachable in two, and so on. The scan
                  keeps two numbers: <code>curEnd</code>, the last index of the
                  current layer, and <code>farthest</code>, the last index of the
                  next layer. While walking inside a layer it only records how
                  far the next layer could go; it counts a jump exactly when it
                  reaches the end of the current layer. The invariant is that
                  after k counted jumps, <code>curEnd</code> is exactly the
                  farthest index reachable in k jumps, so the layer that first
                  contains the last index gives the minimum. Step through it:
                </>
              }
              zh={
                <>
                  <b>暴力 / DP:</b>令 dp[i] 表示到达 i 的最少跳数,
                  对每个 i 回看所有能跳到它的格子取最小值,复杂度 O(n²)。
                  <b> 为什么能做到 O(n):</b>把下标按<strong>层</strong>分组 ——
                  第 1 层是一跳能到的全部下标,第 2 层是两跳能到的,依此类推。
                  扫描只维护两个数:<code>curEnd</code>(当前层的最后一个下标)
                  和 <code>farthest</code>(下一层的最后一个下标)。
                  在层内行走时只记录下一层能到多远,
                  走到当前层末尾时才计一次跳跃。不变量是:
                  计了 k 次之后,<code>curEnd</code> 恰好是 k 跳能到的最远下标,
                  所以第一个包含末尾下标的层数就是最少跳数。逐帧看:
                </>
              }
            />
          </p>
        </div>
        <JumpMin />
        <CodeTabs
          title="lc45_jump_game_ii"
          java={{
            code: {
              en: `class Solution {
    public int jump(int[] nums) {
        int jumps = 0, curEnd = 0, farthest = 0;
        for (int i = 0; i < nums.length - 1; i++) { // stop at n-2
            farthest = Math.max(farthest, i + nums[i]); // end of the next layer
            if (i == curEnd) {          // the current layer is used up
                jumps++;                // one more jump is needed
                curEnd = farthest;      // the next layer ends here
            }
        }
        return jumps;
    }
}`,
              zh: `class Solution {
    public int jump(int[] nums) {
        int jumps = 0, curEnd = 0, farthest = 0;
        for (int i = 0; i < nums.length - 1; i++) { // 到 n-2 即可
            farthest = Math.max(farthest, i + nums[i]); // 下一层的末尾
            if (i == curEnd) {          // 当前这一层用尽了
                jumps++;                // 必须再跳一次
                curEnd = farthest;      // 下一层到此为止
            }
        }
        return jumps;
    }
}`,
            },
            hl: [5, 6, 7, 8],
            note: {
              en: (
                <>
                  The loop stops at n−2 on purpose: standing on the last cell you
                  do not jump again, and looping to n−1 would count one jump too
                  many. <code>curEnd</code> is the range of the current jump,{" "}
                  <code>farthest</code> the range of the next one.
                </>
              ),
              zh: (
                <>
                  循环只到 n−2 是刻意的:站在最后一格不需要再起跳,
                  写到 n−1 会多数一次。<code>curEnd</code> 是这一跳的射程,
                  <code>farthest</code> 是下一跳的射程。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def jump(self, nums: list[int]) -> int:
        jumps = cur_end = farthest = 0
        for i in range(len(nums) - 1):        # stop at n-2
            farthest = max(farthest, i + nums[i])
            if i == cur_end:                  # the current layer is used up
                jumps += 1
                cur_end = farthest
        return jumps`,
              zh: `class Solution:
    def jump(self, nums: list[int]) -> int:
        jumps = cur_end = farthest = 0
        for i in range(len(nums) - 1):        # 到 n-2 即可
            farthest = max(farthest, i + nums[i])
            if i == cur_end:                  # 当前这一层用尽了
                jumps += 1
                cur_end = farthest
        return jumps`,
            },
            hl: [5, 6, 7, 8],
            note: {
              en: (
                <>
                  LC 45 guarantees the end is reachable, so no failure check is
                  needed. Without that guarantee, return −1 as soon as{" "}
                  <code>farthest == i</code> while i is not the last index.
                </>
              ),
              zh: (
                <>
                  LC 45 保证一定能到终点,所以不必判无解。
                  若没有这个保证,则在 <code>farthest == i</code>{" "}
                  且 i 还不是最后一格时返回 −1。
                </>
              ),
            },
          }}
          js={{
            code: `var jump = function (nums) {
  let jumps = 0, curEnd = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === curEnd) {
      jumps++;
      curEnd = farthest;
    }
  }
  return jumps;
};`,
            hl: [4, 5, 6, 7, 8],
            note: {
              en: (
                <>
                  LC 55 only needs <code>farthest</code> and the test{" "}
                  <code>i &gt; farthest</code>. LC 45 adds one layer of
                  bookkeeping: count a jump when the scan reaches the boundary.{" "}
                  <b>One idea, two problems.</b>
                </>
              ),
              zh: (
                <>
                  LC 55 只需要 <code>farthest</code> 和{" "}
                  <code>i &gt; farthest</code> 这个判断;
                  LC 45 多了一层记账:扫描到边界时计一次跳跃。
                  <b>一个想法,两道题。</b>
                </>
              ),
            },
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "LC 45 is breadth-first search with the queue removed",
            zh: "LC 45 就是把队列去掉的广度优先搜索",
          }}
        >
          <p>
            <T
              en={
                <>
                  Treat each index as a node and &quot;i can jump to j&quot; as
                  an edge. LC 45 then asks for the length of the shortest path,
                  which breadth-first search answers by expanding one layer at a
                  time. The greedy version stores each layer as two integers,{" "}
                  <code>curEnd</code> for the end of the current layer and{" "}
                  <code>farthest</code> for the end of the next one, so the queue
                  disappears and both time and space drop to O(n) and O(1).
                  Compressing a layered search into a single linear scan is what
                  this family of greedy solutions is about. Hop-count estimation
                  in network routing and minimum-move problems in games use the
                  same shape.
                </>
              }
              zh={
                <>
                  把每个下标看成节点,「i 能一跳到 j」看成一条边,
                  LC 45 求的就是最短路径的长度 ——
                  广度优先搜索正是一层层扩展来回答它的。
                  贪心版本把每一层压缩成两个整数:<code>curEnd</code>{" "}
                  是当前层的末尾,<code>farthest</code> 是下一层的末尾,
                  于是队列消失,时间和空间降到 O(n) 和 O(1)。
                  「把分层搜索压成一次线性扫描」正是这一类贪心的共性。
                  网络路由里的跳数估计、游戏里的最少移动步数,形状都一样。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="win"
          title={{ en: "Complexity and follow-up questions", zh: "复杂度与常见追问" }}
        >
          <p>
            <T
              en={
                <>
                  LC 55 and LC 45 both run in <b>O(n)</b> time and <b>O(1)</b>{" "}
                  space. Three questions come up often. (1) Why loop to n−2? You
                  do not jump from the last cell, and looping to n−1 would count
                  an extra jump when the last cell happens to be a layer
                  boundary. (2) What does the DP version look like? dp[i] = min
                  over all j that can reach i of dp[j] + 1, which is O(n²); it is
                  worth showing as the starting point the greedy version
                  improves. (3) What if the end is not guaranteed reachable? As
                  soon as <code>farthest == i</code> and i is not the last index,
                  nothing further is reachable, so return −1.
                </>
              }
              zh={
                <>
                  LC 55 与 LC 45 都是时间 <b>O(n)</b>、空间 <b>O(1)</b>。
                  三个常见追问。(1)为什么循环到 n−2?
                  站在最后一格不需要再起跳;写到 n−1 时,
                  若最后一格恰好是层边界,就会多数一次。
                  (2)DP 版本怎么写?dp[i] = min(dp[j]) + 1(j 能跳到 i),
                  复杂度 O(n²) —— 适合用来展示贪心是从哪里优化过来的。
                  (3)如果不保证能到终点?一旦 <code>farthest == i</code>{" "}
                  且 i 还不是最后一格,后面就都不可达,返回 −1。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 模拟贪心 ================= */}
      <Section
        id="sim"
        index="05"
        title={{
          en: "One local rule, one pass",
          zh: "模拟贪心:一条局部规则,一次遍历到底",
        }}
        desc={{
          en: "860 change · 134 gas station · 135 candy · 406 queue reconstruction",
          zh: "860 找零 · 134 加油站 · 135 分发糖果 · 406 身高重建",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  These problems have no clever sorting trick. You work out{" "}
                  <strong>one local rule</strong> and then simulate it in a
                  single pass. All of the difficulty sits in one question: why
                  does following that rule never cost you later?
                </>
              }
              zh={
                <>
                  这一类题没有精巧的排序技巧。你想清楚
                  <strong>一条局部规则</strong>,然后老老实实模拟一遍。
                  难点全在一个问题上:为什么照这条规则做,后面不会付出代价?
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>LC 860 Lemonade Change (warm-up):</b> customers pay with 5,
                  10, or 20, and you give change from the bills you have
                  received. A 5 needs no change, a 10 needs one 5, and a 20 needs
                  either 10 + 5 or 5 + 5 + 5. The rule:{" "}
                  <strong>prefer 10 + 5</strong>. Here is the exchange argument
                  in one step. Choosing 10 + 5 leaves you with two more 5s and
                  one fewer 10 than the other option. Suppose a later customer
                  forces you to use a 10 you no longer have. You can pay that 20
                  with 5 + 5 + 5 instead, which costs exactly those two extra 5s.
                  So preferring 10 + 5 never turns a case you could have served
                  into one you cannot.
                </>
              }
              zh={
                <>
                  <b>LC 860 柠檬水找零(热身):</b>顾客用 5、10、20 付款,
                  你只能用收到的钞票找零。收 5 不用找,收 10 找一张 5,
                  收 20 可以找 10 + 5 或 5 + 5 + 5。规则是
                  <strong>优先找 10 + 5</strong>。交换论证只要一步:
                  选 10 + 5 之后,你比另一种选法多两张 5、少一张 10。
                  假设后面某位顾客逼你用那张你已经没有的 10,
                  你可以改用 5 + 5 + 5 去找他,代价正好是多出来的那两张 5。
                  所以优先找 10 + 5 不会把本来能应付的情况变成应付不了。
                </>
              }
            />
          </p>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "LC 134 Gas Station: a circular route becomes one linear scan",
            zh: "LC 134 加油站:把环形路化简成一次线性扫描",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> n stations on a circular route. Station i
                  holds gas[i] litres, and driving from i to i+1 costs cost[i]
                  litres. Find a starting station from which you can complete the
                  full circle. <b>Two facts do all the work.</b> (1) If{" "}
                  Σgas &lt; Σcost there is <b>no answer</b>, because the fuel
                  over one full circle is not enough no matter where you start.
                  (2) If you start at a and the tank first goes negative at
                  station b, then <b>no station between a and b works either</b>.
                  For any c in that range, the partial sum from a to c−1 was
                  still non-negative, so the sum from c to b is at most the sum
                  from a to b, which is negative. Starting at c therefore runs
                  dry at station b at the latest. That lets you skip the whole
                  block and continue from b+1, in a single O(n) pass.
                </>
              }
              zh={
                <>
                  <b>题意:</b>环形路上 n 个加油站,站 i 有 gas[i] 升油,
                  从 i 开到 i+1 消耗 cost[i] 升,求一个能跑完整圈的出发站。
                  <b> 两个结论就够了。</b>(1)若 Σgas &lt; Σcost,
                  <b>无解</b> —— 整圈的油总量不够,从哪儿出发都一样。
                  (2)若从 a 出发、油箱在站 b 第一次变负,
                  那么 <b>a 与 b 之间的任何一站也都不行</b>:
                  对该范围内的任意 c,从 a 到 c−1 的部分和一直非负,
                  所以从 c 到 b 的和不超过从 a 到 b 的和,而后者是负的 ——
                  从 c 出发最迟到站 b 也会断油。
                  于是可以整段跳过,直接从 b+1 继续,一次 O(n) 遍历完成。
                </>
              }
            />
          </p>
        </Callout>
        <CodeTabs
          title="lc134_gas_station"
          java={{
            code: {
              en: `class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < gas.length; i++) {
            int diff = gas[i] - cost[i];
            total += diff;              // net fuel over the whole circle
            tank += diff;               // fuel since the current candidate start
            if (tank < 0) {             // ran dry on the way past station i
                start = i + 1;          // no station in between can work either
                tank = 0;               // measure again from the new candidate
            }
        }
        return total < 0 ? -1 : start;  // enough fuel overall means start completes it
    }
}`,
              zh: `class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < gas.length; i++) {
            int diff = gas[i] - cost[i];
            total += diff;              // 整圈的净油量
            tank += diff;               // 从当前候选起点到此的油箱余量
            if (tank < 0) {             // 走过站 i 时断油
                start = i + 1;          // 中间任何一站做起点也不行
                tank = 0;               // 从新的候选起点重新计量
            }
        }
        return total < 0 ? -1 : start;  // 总油量够,start 就能跑完整圈
    }
}`,
            },
            hl: [8, 9, 10, 11],
            note: {
              en: (
                <>
                  The circle is not a complication here. Because every failed
                  prefix can be discarded whole, the problem becomes an ordinary
                  left-to-right scan, and no rejected start is ever retried. O(n)
                  time, O(1) space.
                </>
              ),
              zh: (
                <>
                  「环形」在这里并不构成困难:
                  因为失败的前缀可以整段丢弃,问题就变成了普通的从左到右扫描,
                  被排除的起点一个都不用重试。时间 O(n)、空间 O(1)。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def canCompleteCircuit(self, gas: list[int], cost: list[int]) -> int:
        total = tank = 0
        start = 0
        for i in range(len(gas)):
            diff = gas[i] - cost[i]
            total += diff
            tank += diff
            if tank < 0:               # ran dry: move the candidate start past i
                start = i + 1
                tank = 0
        return -1 if total < 0 else start`,
              zh: `class Solution:
    def canCompleteCircuit(self, gas: list[int], cost: list[int]) -> int:
        total = tank = 0
        start = 0
        for i in range(len(gas)):
            diff = gas[i] - cost[i]
            total += diff
            tank += diff
            if tank < 0:               # 断油了,候选起点跳到 i 之后
                start = i + 1
                tank = 0
        return -1 if total < 0 else start`,
            },
            hl: [9, 10, 11],
            note: {
              en: (
                <>
                  The two accumulators answer two different questions:{" "}
                  <code>total</code> decides whether an answer exists, and{" "}
                  <code>tank</code> decides where it starts. One pass covers
                  both.
                </>
              ),
              zh: (
                <>
                  两个累加器回答两个不同的问题:<code>total</code> 决定有没有解,
                  <code>tank</code> 决定起点在哪。一趟扫描同时得到。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var canCompleteCircuit = function (gas, cost) {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    total += diff;
    tank += diff;
    if (tank < 0) {                  // ran dry at station i
      start = i + 1;                 // the start can only be later than i
      tank = 0;
    }
  }
  return total < 0 ? -1 : start;
};`,
              zh: `var canCompleteCircuit = function (gas, cost) {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    total += diff;
    tank += diff;
    if (tank < 0) {                  // 走到站 i 断油
      start = i + 1;                 // 起点只可能比 i 更靠后
      tank = 0;
    }
  }
  return total < 0 ? -1 : start;
};`,
            },
            hl: [7, 8, 9, 10],
            note: {
              en: (
                <>
                  The single pass is only justified by fact (2): every skipped
                  start would also run dry by the same station. Without that
                  argument, discarding the prefix would be a guess.
                </>
              ),
              zh: (
                <>
                  一次遍历的底气全部来自结论(2):
                  被跳过的每个起点也会在同一站之前断油。
                  没有这个论证,丢弃前缀就只是猜测。
                </>
              ),
            },
          }}
        />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            <T
              en={
                <>
                  <b>LC 135 Candy (hard, but the pattern is clear):</b> every
                  child has a rating, a child with a higher rating than a
                  neighbour must get more candy than that neighbour, and everyone
                  gets at least one. Minimise the total. The difficulty is that{" "}
                  <strong>
                    each child is constrained from the left and from the right at
                    the same time
                  </strong>
                  . The fix is <strong>one direction per pass</strong>: going
                  left to right, satisfy &quot;more than the left neighbour&quot;;
                  going right to left, satisfy &quot;more than the right
                  neighbour&quot;; take the maximum so both hold. Why the result
                  is minimal: each pass produces the smallest values that satisfy
                  one side, so both are lower bounds for any valid answer, and so
                  is their maximum. That maximum is itself valid, so it is the
                  smallest valid assignment at every position, and therefore has
                  the smallest total.
                </>
              }
              zh={
                <>
                  <b>LC 135 分发糖果(hard,但套路清晰):</b>
                  每个孩子有一个评分,评分比邻居高的孩子必须拿到比邻居更多的糖,
                  每人至少一颗,求最少糖数。难点在于
                  <strong>每个孩子同时受左邻和右邻两个约束</strong>。
                  解法是<strong>一次遍历只处理一个方向</strong>:
                  从左到右满足「比左邻多」,从右到左满足「比右邻多」,
                  取两者的最大值让两侧同时成立。为什么这样总和最小:
                  每一遍给出的都是「只满足一侧」的最小值,
                  因此两者都是任何合法方案的下界,取 max 之后仍是下界;
                  而这个 max 本身合法,所以它在每个位置都是最小的合法取值,
                  总和自然最小。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc135_candy"
          java={{
            code: {
              en: `class Solution {
    public int candy(int[] ratings) {
        int n = ratings.length;
        int[] candy = new int[n];
        Arrays.fill(candy, 1);                 // everyone starts with one
        for (int i = 1; i < n; i++)            // left to right: beat the left neighbour
            if (ratings[i] > ratings[i - 1]) candy[i] = candy[i - 1] + 1;
        for (int i = n - 2; i >= 0; i--)       // right to left: beat the right neighbour
            if (ratings[i] > ratings[i + 1])
                candy[i] = Math.max(candy[i], candy[i + 1] + 1);
        int sum = 0;
        for (int c : candy) sum += c;
        return sum;
    }
}`,
              zh: `class Solution {
    public int candy(int[] ratings) {
        int n = ratings.length;
        int[] candy = new int[n];
        Arrays.fill(candy, 1);                 // 每人先发一颗
        for (int i = 1; i < n; i++)            // 左到右:比左邻多
            if (ratings[i] > ratings[i - 1]) candy[i] = candy[i - 1] + 1;
        for (int i = n - 2; i >= 0; i--)       // 右到左:比右邻多
            if (ratings[i] > ratings[i + 1])
                candy[i] = Math.max(candy[i], candy[i + 1] + 1);
        int sum = 0;
        for (int c : candy) sum += c;
        return sum;
    }
}`,
            },
            hl: [6, 7, 8, 9, 10],
            note: {
              en: (
                <>
                  The second pass must use <b>max</b> and not plain assignment.
                  Assigning would overwrite a larger value that the first pass
                  had put there, breaking the left-side constraint. This is the
                  one place the problem is easy to get wrong.
                </>
              ),
              zh: (
                <>
                  第二遍必须用 <b>max</b>,不能直接赋值。
                  直接赋值会覆盖掉第一遍写入的更大值,破坏左侧约束。
                  这是本题唯一容易写错的地方。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def candy(self, ratings: list[int]) -> int:
        n = len(ratings)
        candy = [1] * n
        for i in range(1, n):                  # left to right
            if ratings[i] > ratings[i - 1]:
                candy[i] = candy[i - 1] + 1
        for i in range(n - 2, -1, -1):         # right to left
            if ratings[i] > ratings[i + 1]:
                candy[i] = max(candy[i], candy[i + 1] + 1)
        return sum(candy)`,
              zh: `class Solution:
    def candy(self, ratings: list[int]) -> int:
        n = len(ratings)
        candy = [1] * n
        for i in range(1, n):                  # 左到右
            if ratings[i] > ratings[i - 1]:
                candy[i] = candy[i - 1] + 1
        for i in range(n - 2, -1, -1):         # 右到左
            if ratings[i] > ratings[i + 1]:
                candy[i] = max(candy[i], candy[i + 1] + 1)
        return sum(candy)`,
            },
            hl: [8, 9, 10],
            note: {
              en: (
                <>
                  One direction of constraint per one-directional pass. A
                  two-sided dependency is split into two independent greedy
                  passes and then combined.
                </>
              ),
              zh: (
                <>
                  一个方向的约束就用一次单向扫描。
                  双向依赖被拆成两次独立的贪心遍历,最后合并。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var candy = function (ratings) {
  const n = ratings.length;
  const candy = new Array(n).fill(1);
  for (let i = 1; i < n; i++)                 // left to right
    if (ratings[i] > ratings[i - 1]) candy[i] = candy[i - 1] + 1;
  for (let i = n - 2; i >= 0; i--)            // right to left
    if (ratings[i] > ratings[i + 1])
      candy[i] = Math.max(candy[i], candy[i + 1] + 1);
  return candy.reduce((a, b) => a + b, 0);
};`,
              zh: `var candy = function (ratings) {
  const n = ratings.length;
  const candy = new Array(n).fill(1);
  for (let i = 1; i < n; i++)                 // 左到右
    if (ratings[i] > ratings[i - 1]) candy[i] = candy[i - 1] + 1;
  for (let i = n - 2; i >= 0; i--)            // 右到左
    if (ratings[i] > ratings[i + 1])
      candy[i] = Math.max(candy[i], candy[i + 1] + 1);
  return candy.reduce((a, b) => a + b, 0);
};`,
            },
            hl: [6, 7, 8],
            note: {
              en: (
                <>
                  Time <b>O(n)</b>, space O(n). Splitting a two-sided constraint
                  into two one-directional passes is the pattern worth
                  remembering here.
                </>
              ),
              zh: (
                <>
                  时间 <b>O(n)</b>、空间 O(n)。
                  「双向约束拆成两次单向扫描」是这里值得记住的套路。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="idea"
          title={{
            en: "LC 406 Queue Reconstruction by Height: place the tall people first",
            zh: "LC 406 根据身高重建队列:先安排高个子",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> each person is described by (h, k), meaning
                  height h with exactly k people of height ≥ h in front. Rebuild
                  the queue. <b>The greedy rule:</b> sort by{" "}
                  <b>height descending, then k ascending</b>, and insert each
                  person at index k of the result list.{" "}
                  <b>Why it is correct:</b> everyone already placed is at least
                  as tall as the person being inserted, so inserting a shorter
                  person does not change how many taller-or-equal people stand in
                  front of anyone already placed. And the new person lands with
                  exactly k such people ahead, which is what (h, k) requires.
                  Fixing the attribute with the largest effect first, then
                  arranging the secondary one, is a pattern that repeats across
                  sorting-plus-greedy problems.
                </>
              }
              zh={
                <>
                  <b>题意:</b>每个人用 (h, k) 描述 —— 身高 h,
                  前面恰好有 k 个身高不低于 h 的人,要求还原队列。
                  <b> 贪心规则:</b>按<b>身高降序、同身高时 k 升序</b>排序,
                  然后把每个人依次插入结果列表的下标 k 处。
                  <b> 为什么正确:</b>已经排好的人都不比当前这个人矮,
                  所以插入一个更矮的人不会改变任何已排好的人前面
                  「身高不低于他的人数」;而新插入的人前面恰好有 k 个这样的人,
                  正是 (h, k) 的要求。
                  「先固定影响最大的维度,再安排次要维度」
                  在排序 + 贪心的题目里反复出现。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 区间贪心 + 精讲 C ================= */}
      <Section
        id="interval"
        index="06"
        title={{
          en: "Intervals: sort by start or by end?",
          zh: "区间贪心:按左端还是右端排序?",
        }}
        desc={{
          en: "Featured problem C · LC 435 Non-overlapping Intervals, with 452 / 763 / 56 alongside",
          zh: "精讲 C · LC 435 无重叠区间 —— 附 452 / 763 / 56 对照",
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
                  Almost every interval problem starts with a sort, and{" "}
                  <strong>the choice of sort key decides whether it works</strong>
                  . The main example is{" "}
                  <strong>LC 435 Non-overlapping Intervals</strong>: given a set
                  of intervals, remove as few as possible so that the rest do not
                  overlap.
                </>
              }
              zh={
                <>
                  几乎所有区间题的第一步都是排序,而
                  <strong>排序键的选择直接决定对错</strong>。
                  主例是 <strong>LC 435 无重叠区间</strong>:
                  给一组区间,删掉尽量少的几个,让剩下的互不重叠。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>Brute force:</b> try every subset to keep, which is 2ⁿ.
                  <b> The greedy observation:</b> removing the fewest is the same
                  as{" "}
                  <strong>keeping the most non-overlapping intervals</strong>. To
                  keep many, always keep{" "}
                  <strong>the interval that ends earliest</strong>, because it
                  leaves the largest amount of time for everything after it. So
                  sort by <strong>right endpoint</strong>, scan left to right,
                  keep an interval when it does not overlap the last kept one,
                  and delete it otherwise. Step through the timeline:
                </>
              }
              zh={
                <>
                  <b>暴力:</b>枚举保留哪些子集,2ⁿ。
                  <b> 贪心洞察:</b>「删最少」等价于
                  <strong>「保留最多互不重叠的区间」</strong>。
                  要保留得多,就每次都留下
                  <strong>结束最早的那个</strong>,
                  因为它给后面留下的时间最多。所以
                  <strong>按右端点排序</strong>,从左往右扫,
                  与上一个保留区间不重叠就保留,否则删掉。逐帧看这条时间轴:
                </>
              }
            />
          </p>
        </div>
        <IntervalTimeline />
        <CodeTabs
          title="lc435_non_overlapping_intervals"
          java={{
            code: {
              en: `class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        // sort by end time: finishing earlier leaves more room for the rest
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));
        int kept = 0, lastEnd = Integer.MIN_VALUE;
        for (int[] iv : intervals) {
            if (iv[0] >= lastEnd) {     // no overlap with the last kept interval
                kept++;                 // keep it
                lastEnd = iv[1];        // raise the threshold
            }                           // otherwise it overlaps, so delete it
        }
        return intervals.length - kept; // deleted = total - kept
    }
}`,
              zh: `class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        // 按结束时间排序:结束越早,留给后面的空间越大
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));
        int kept = 0, lastEnd = Integer.MIN_VALUE;
        for (int[] iv : intervals) {
            if (iv[0] >= lastEnd) {     // 与上一个保留区间不重叠
                kept++;                 // 保留它
                lastEnd = iv[1];        // 抬高门槛
            }                           // 否则重叠,删掉
        }
        return intervals.length - kept; // 删除数 = 总数 − 保留数
    }
}`,
            },
            hl: [4, 7, 8, 9],
            note: {
              en: (
                <>
                  Use <code>Integer.compare(a[1], b[1])</code> rather than{" "}
                  <code>a[1] - b[1]</code>. With large negative and large
                  positive endpoints the subtraction can{" "}
                  <b>overflow int</b> and reverse the comparison.
                </>
              ),
              zh: (
                <>
                  要用 <code>Integer.compare(a[1], b[1])</code>,
                  不要用 <code>a[1] - b[1]</code>:
                  端点为大负数和大正数时,减法可能<b>整型溢出</b>,
                  把比较结果弄反。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def eraseOverlapIntervals(self, intervals: list[list[int]]) -> int:
        intervals.sort(key=lambda iv: iv[1])   # sort by end time
        kept, last_end = 0, float("-inf")
        for s, e in intervals:
            if s >= last_end:                  # no overlap, so keep it
                kept += 1
                last_end = e
        return len(intervals) - kept`,
              zh: `class Solution:
    def eraseOverlapIntervals(self, intervals: list[list[int]]) -> int:
        intervals.sort(key=lambda iv: iv[1])   # 按结束时间排序
        kept, last_end = 0, float("-inf")
        for s, e in intervals:
            if s >= last_end:                  # 不重叠,保留
                kept += 1
                last_end = e
        return len(intervals) - kept`,
            },
            hl: [3, 6, 7, 8],
            note: {
              en: (
                <>
                  <code>key=lambda iv: iv[1]</code> is the whole idea. Change it
                  to <code>iv[0]</code> and the answer becomes wrong: one long
                  interval that starts early can push out several short ones
                  behind it.
                </>
              ),
              zh: (
                <>
                  <code>key=lambda iv: iv[1]</code> 就是全部关键。
                  改成 <code>iv[0]</code> 答案就错了:
                  一个开始很早的长区间会挤掉后面好几个短区间。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var eraseOverlapIntervals = function (intervals) {
  intervals.sort((a, b) => a[1] - b[1]);   // sort by end time
  let kept = 0, lastEnd = -Infinity;
  for (const [s, e] of intervals) {
    if (s >= lastEnd) {                     // no overlap, so keep it
      kept++;
      lastEnd = e;
    }
  }
  return intervals.length - kept;
};`,
              zh: `var eraseOverlapIntervals = function (intervals) {
  intervals.sort((a, b) => a[1] - b[1]);   // 按结束时间排序
  let kept = 0, lastEnd = -Infinity;
  for (const [s, e] of intervals) {
    if (s >= lastEnd) {                     // 不重叠,保留
      kept++;
      lastEnd = e;
    }
  }
  return intervals.length - kept;
};`,
            },
            hl: [2, 5, 6, 7],
            note: {
              en: (
                <>
                  <b>LC 452 is nearly the same code:</b> replace &quot;keep when
                  s ≥ lastEnd&quot; with &quot;a new arrow is needed only when s
                  &gt; lastEnd&quot;. Balloon bounds are closed intervals, so a
                  balloon that merely touches (s == lastEnd) is still hit by the
                  same arrow.
                </>
              ),
              zh: (
                <>
                  <b>LC 452 几乎是同一段代码:</b>
                  把「s ≥ lastEnd 就保留」换成「只有 s &gt; lastEnd 才需要新箭」。
                  气球的边界是闭区间,所以刚好相切(s == lastEnd)的气球
                  仍会被同一支箭射中。
                </>
              ),
            },
          }}
        />
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            <T
              en={
                <>
                  <b>Why the end, and not the start?</b> The exchange argument:
                  let OPT be an optimal set of kept intervals, listed in order,
                  and let X be its first interval. G, the interval that ends
                  earliest of all, satisfies end(G) ≤ end(X). Replace X by G. The
                  remaining intervals of OPT all start at or after end(X), so
                  they start at or after end(G) as well, and the set is still
                  non-overlapping and just as large. Repeat on the rest, and
                  greedy keeps as many as any optimal solution.
                </>
              }
              zh={
                <>
                  <b>为什么按结束时间,而不是开始时间?</b>交换论证:
                  设 OPT 是一个最优的保留集合,按顺序排列,第一个区间是 X;
                  而所有区间中结束最早的那个 G 满足 end(G) ≤ end(X)。
                  把 X 换成 G:OPT 剩下的区间都在 end(X) 之后开始,
                  因而也在 end(G) 之后开始,集合依然互不重叠、大小不变。
                  对剩下的部分重复这个论证,贪心保留的数量就不少于任何最优解。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>The other two sort keys really do fail.</b> Sorting by{" "}
                  <b>start time</b> and keeping greedily: on [0,10], [1,2],
                  [3,4], you keep [0,10] and end with 1 interval, while the best
                  answer is 2. Sorting by <b>shortest length</b>: on [0,5],
                  [4,6], [5,10], the shortest is [4,6], which overlaps both
                  others, so you end with 1 interval instead of 2. Neither of
                  those rules survives an exchange argument, and each has a
                  three-interval counterexample.
                </>
              }
              zh={
                <>
                  <b>另外两种排序键确实会失败。</b>按<b>开始时间</b>排序再贪心保留:
                  在 [0,10]、[1,2]、[3,4] 上你会留下 [0,10],最终只剩 1 个,
                  而最优是 2 个。按<b>区间长度</b>从短到长排序:
                  在 [0,5]、[4,6]、[5,10] 上最短的是 [4,6],它和另外两个都重叠,
                  于是只剩 1 个,而最优是 2 个。
                  这两条规则都通不过交换论证,而且各有一个三区间的反例。
                </>
              }
            />
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 6 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en={<>Same shape · LC 452</>} zh={<>同款 · LC 452</>} />
            </div>
            <div className="card-title">
              <T en={<>Fewest arrows</>} zh={<>最少的箭</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    Sort by end. Fire an arrow at the smallest end value; every
                    balloon with <code>start ≤</code> that value is burst. When
                    one is out of range, fire a new arrow.{" "}
                    <b>The same problem in different clothes.</b>
                  </>
                }
                zh={
                  <>
                    按右端排序,把箭射在最小的右端值上,
                    凡是 <code>start ≤</code> 该值的气球都被射中;
                    遇到够不着的就换新箭。
                    <b>和 435 是同一道题换了层外衣。</b>
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en={<>Variant · LC 763</>} zh={<>变体 · LC 763</>} />
            </div>
            <div className="card-title">
              <T en={<>Partition labels</>} zh={<>划分字母区间</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    Record the <b>last index of every letter</b> first. While
                    scanning, extend the right boundary of the current part to
                    the farthest last index seen in it, and cut when the scan
                    reaches that boundary. It merges the span of each letter.
                  </>
                }
                zh={
                  <>
                    先记下<b>每个字母最后出现的下标</b>。
                    遍历时把当前段的右边界扩到段内见过的最远出现位置,
                    扫到这个边界就切一刀。本质是合并同一字母的跨度。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en={<>Contrast · LC 56 (review)</>} zh={<>对照 · LC 56(复盘)</>} />
            </div>
            <div className="card-title">
              <T en={<>Merge intervals</>} zh={<>合并区间</>} />
            </div>
            <p>
              <T
                en={
                  <>
                    The goal is to <b>merge</b>, not to select, so it sorts by{" "}
                    <b>start</b>: extend the end with <code>max</code> when the
                    next interval touches, and open a new one when it does not.
                    Taught in chapter 01; here it is the contrast case.
                  </>
                }
                zh={
                  <>
                    目标是<b>合并</b>而不是筛选,所以按<b>左端</b>排序:
                    下一个区间接得上就用 <code>max</code> 扩展终点,
                    接不上就另起一段。第 1 章主讲,这里作为对照。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en={<>What you want</>} zh={<>你的目标是……</>} />
                </th>
                <th>
                  <T en={<>Sort key</>} zh={<>排序键</>} />
                </th>
                <th>
                  <T en={<>Greedy step</>} zh={<>贪心动作</>} />
                </th>
                <th>
                  <T en={<>Problems</>} zh={<>代表题</>} />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T
                      en={<>Keep the most non-overlapping, delete the fewest, use the fewest arrows</>}
                      zh={<>选最多不重叠 / 删最少 / 用最少的箭</>}
                    />
                  </b>
                </td>
                <td>
                  <T en={<>end, ascending</>} zh={<>右端点升序</>} />
                </td>
                <td>
                  <T
                    en={<>keep the earliest ending one, leaving the most room</>}
                    zh={<>留结束最早者,给后面留最多空间</>}
                  />
                </td>
                <td>
                  <T en={<>435 · 452 · activity selection</>} zh={<>435 · 452 · 活动选择</>} />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en={<>Merge all overlapping intervals</>} zh={<>合并所有重叠区间</>} />
                  </b>
                </td>
                <td>
                  <T en={<>start, ascending</>} zh={<>左端点升序</>} />
                </td>
                <td>
                  <T
                    en={<>extend the end if it touches, otherwise open a new one</>}
                    zh={<>能接上就扩右界,接不上就新开一段</>}
                  />
                </td>
                <td>56 · 57</td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en={<>Cut a sequence into parts by content</>} zh={<>按内容切分连续段</>} />
                  </b>
                </td>
                <td>
                  <T
                    en={<>no interval sort; record each letter&apos;s last index</>}
                    zh={<>不排区间,记「最后出现位置」</>}
                  />
                </td>
                <td>
                  <T
                    en={<>cut when the scan reaches the current right boundary</>}
                    zh={<>扫到当前段右界就切</>}
                  />
                </td>
                <td>763</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="deep"
          title={{
            en: "Interval scheduling is everyday resource allocation",
            zh: "区间调度就是日常的资源分配",
          }}
        >
          <p>
            <T
              en={
                <>
                  LC 435 is also known as <b>activity selection</b>. Booking a
                  meeting room so that the most meetings fit, choosing tasks in a
                  CPU scheduler, and allocating time slices for bandwidth or
                  virtual machines are all the same problem. &quot;Sort by
                  finishing time and take the one that finishes first&quot; has
                  been a proven result in operations research for decades. When a
                  calendar tool suggests a set of meetings that do not clash, it
                  is usually running this.
                </>
              }
              zh={
                <>
                  LC 435 的另一个名字是<b>活动选择(activity selection)</b>。
                  会议室排会(同一间屋最多塞下几场不冲突的会)、
                  CPU 调度里挑选任务、带宽或虚拟机的时间片分配,都是同一个问题。
                  「按结束时间排序、优先取结束最早的」在运筹学里已被证明了几十年。
                  日历工具帮你选出一组互不冲突的会议时,背后通常就是它。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 贪心失效之地 ================= */}
      <Section
        id="fail"
        index="07"
        title={{
          en: "Where greedy fails: if you cannot prove it, use DP",
          zh: "贪心失效之地:证不出来,就退回 DP",
        }}
        desc={{
          en: "Counterexamples, and a rule for choosing between greedy and DP — the bridge to chapter 07",
          zh: "反例意识 + 贪心与 DP 的判据 —— 承上启下接第 7 章",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  You now have a fast tool, and the warning from the start of the
                  chapter still applies: <strong>greedy can fail</strong>. The
                  clearest failure is the opening example of the next chapter,{" "}
                  <strong>LC 322 Coin Change</strong>, with coins{" "}
                  <code>[1, 3, 4]</code> and amount 6. Try it yourself and watch
                  greedy miss the best answer:
                </>
              }
              zh={
                <>
                  你现在有了一把快刀,而本章开头的警告依然成立:
                  <strong>贪心会失效</strong>。最清楚的失效例子就是下一章的开场 ——
                  <strong>LC 322 零钱兑换</strong>,硬币 <code>[1, 3, 4]</code>{" "}
                  凑 6。亲手玩一下,看贪心怎样和最优解擦肩而过:
                </>
              }
            />
          </p>
        </div>
        <CoinGreedyLab />
        <div className="grd-duel" style={{ marginTop: 4 }}>
          <div className="card">
            <div className="card-kicker">
              <T en={<>Greedy · largest coin first</>} zh={<>贪心 · 每步拿最大</>} />
            </div>
            <div className="card-title">
              <b className="mono">4 + 1 + 1 = 3</b>
            </div>
            <p>
              <T
                en={
                  <>
                    Take the 4 (2 left), then 3 is too large, so 1 + 1. Every
                    step was locally best, and the branch it entered cannot be
                    undone. It <b>never sees the plan that starts with a 3</b>.
                  </>
                }
                zh={
                  <>
                    先拿 4(剩 2),3 超了,只能 1 + 1。
                    每一步都是当下最优,而它进入的分支无法回退。
                    它<b>从来看不到「以 3 开头」的方案</b>。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en={<>DP · every option recorded</>} zh={<>DP · 每种选择都记账</>} />
            </div>
            <div className="card-title">
              <b className="mono">3 + 3 = 2</b>
            </div>
            <p>
              <T
                en={
                  <>
                    dp[6] tries all three possibilities for the last coin (1, 3,
                    or 4) and takes the smallest result. It does not make a
                    choice; it evaluates every choice.{" "}
                    <b>That is the safety net DP provides.</b>
                  </>
                }
                zh={
                  <>
                    dp[6] 枚举「最后一枚硬币是 1 / 3 / 4」三种可能,取最小值。
                    它不做选择,而是把每种选择的结果都算出来。
                    <b>这就是 DP 的兜底能力。</b>
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
                  <b>Why does greedy fail here?</b> Because the coin set{" "}
                  <code>[1, 3, 4]</code> does not have the{" "}
                  <strong>greedy-choice property</strong>. Taking the 4 first is
                  the locally best move, and it destroys the structure of the
                  best answer, 3 + 3. There is no exchange argument to write,
                  because the counterexample is right there.{" "}
                  <strong>No proof, no greedy.</strong> The fallback is DP:
                  enumerate which coin is used last, and store the answer of each
                  subproblem. Chapter 07 does exactly that, with a cell-by-cell
                  animation of dp[6]. Note also that the same greedy rule{" "}
                  <i>is</i> optimal for other coin sets, such as 1, 5, 10, 25 —
                  which is why the property has to be checked per coin set, not
                  assumed.
                </>
              }
              zh={
                <>
                  <b>为什么贪心在这里失效?</b>因为面额 <code>[1, 3, 4]</code>{" "}
                  不具备<strong>贪心选择性质</strong>。
                  先拿 4 是当下最好的一步,而它恰好破坏了最优解 3 + 3 的结构。
                  这里根本写不出交换论证,因为反例就摆在眼前。
                  <strong>没有证明,就不能贪。</strong>退路是 DP:
                  枚举最后一枚硬币是谁,并把每个子问题的答案记下来。
                  第 7 章正是这么做的,还配有 dp[6] 的逐格填充动画。
                  另外要注意,同一条贪心规则在别的面额上<i>确实</i>最优,
                  比如 1、5、10、25 —— 所以这个性质要按面额逐一检查,不能默认成立。
                </>
              }
            />
          </p>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "The knapsack pair: same greedy rule, one version optimal, one not",
            zh: "背包问题的一对:同一条贪心规则,一个最优,一个不最优",
          }}
        >
          <p>
            <T
              en={
                <>
                  This is the standard example of a greedy rule that is right in
                  one setting and wrong in a very similar one. Both versions have
                  items with a weight and a value, and a capacity limit. The
                  greedy rule is the same: take items in decreasing order of{" "}
                  <b>value per unit of weight</b>.
                  <br />
                  <b>Fractional knapsack</b> (you may take a fraction of an item):
                  the rule is <b>optimal</b>, by an exchange argument. If a
                  solution contains any weight of a lower-ratio item while a
                  higher-ratio item is not fully taken, swap one unit of weight
                  between them; the total value does not go down. Repeating this
                  turns any optimal solution into the greedy one.
                  <br />
                  <b>0/1 knapsack</b> (each item is taken whole or not at all):
                  the rule is <b>not optimal</b>. Capacity 10, and three items —
                  A (weight 6, value 12), B (weight 5, value 9), C (weight 5,
                  value 9). Greedy takes A first because its ratio is 2, then
                  only 4 capacity is left and neither B nor C fits, giving 12.
                  Taking B and C gives 18. The swap that works for fractions is
                  impossible when items cannot be split, so the argument breaks
                  and the answer breaks with it. The 0/1 version is solved with DP
                  in the knapsack chapter.
                </>
              }
              zh={
                <>
                  这是「同一条贪心规则在一种设定下正确、在极其相似的另一种设定下错误」
                  的标准例子。两个版本都是:物品有重量和价值,背包有容量上限。
                  贪心规则相同 —— 按<b>单位重量的价值</b>从高到低取。
                  <br />
                  <b>分数背包</b>(可以只取物品的一部分):这条规则<b>最优</b>,
                  用交换论证即可说明。若某个方案里装了单位价值较低的物品,
                  而单位价值更高的物品还没装满,就在两者之间交换一个单位的重量,
                  总价值不会下降。反复这样交换,任何最优解都会变成贪心解。
                  <br />
                  <b>0/1 背包</b>(每件物品要么整件拿、要么不拿):这条规则
                  <b>不最优</b>。容量 10,三件物品 —— A(重 6,值 12)、
                  B(重 5,值 9)、C(重 5,值 9)。
                  贪心先取单位价值为 2 的 A,剩余容量只有 4,B 和 C 都放不下,
                  总价值 12;而取 B 和 C 是 18。
                  物品不能拆分时,分数版里那次交换根本做不到,论证断了,答案也就跟着错了。
                  0/1 版本要用 DP 解,在背包章讲。
                </>
              }
            />
          </p>
        </Callout>
        <div className="grd-steps">
          <div className="grd-step">
            <div>
              <h4>
                <T
                  en={<>Try greedy: can you state the exchange argument in one sentence?</>}
                  zh={<>先试贪心:能用一句话说出交换论证吗?</>}
                />
              </h4>
              <p>
                <T
                  en={
                    <>
                      If you can say in one sentence why the local choice cannot
                      destroy a best answer (435: ending earlier leaves more
                      room; 455: the smallest usable cookie wastes nothing), go
                      ahead and be greedy. O(n log n) and done.
                    </>
                  }
                  zh={
                    <>
                      如果能用一句话说清「当下的选择为什么不会毁掉最优解」
                      (435:结束更早留下的空间更多;455:最小的可用饼干不浪费),
                      那就放心贪,O(n log n) 收工。
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <div className="grd-step">
            <div>
              <h4>
                <T
                  en={<>Cannot prove it? Look for a counterexample</>}
                  zh={<>证不出来?去找反例</>}
                />
              </h4>
              <p>
                <T
                  en={
                    <>
                      Build small inputs designed to break the rule: coins [1, 3,
                      4] for 6, or sorting 435 by start time. One counterexample
                      settles it. Do not hope that larger inputs will behave
                      better.
                    </>
                  }
                  zh={
                    <>
                      构造专门用来打破这条规则的小例子:硬币 [1, 3, 4] 凑 6,
                      或者把 435 按起点排序。一个反例就足以定案,
                      不要指望「数据大一点也许就对了」。
                    </>
                  }
                />
              </p>
            </div>
          </div>
          <div className="grd-step">
            <div>
              <h4>
                <T
                  en={<>Fall back to DP: enumerate every decision and store the results</>}
                  zh={<>退回 DP:枚举所有决策并记账</>}
                />
              </h4>
              <p>
                <T
                  en={
                    <>
                      List the possibilities for the last step, take the min or
                      max, and store each subproblem answer so it is computed
                      once. Slower than greedy, but polynomial, and{" "}
                      <b>always correct</b>. That is the tool the next chapter
                      hands you.
                    </>
                  }
                  zh={
                    <>
                      列出最后一步的所有可能,取 min 或 max,
                      并把每个子问题的答案记下来,只算一次。
                      比贪心慢,但仍是多项式时间,而且<b>必对</b>。
                      这正是下一章要交给你的工具。
                    </>
                  }
                />
              </p>
            </div>
          </div>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "The order to think through an optimisation problem",
            zh: "拿到一道最优化题的思考顺序",
          }}
        >
          <p>
            <T
              en={
                <>
                  When you meet an optimisation problem, walk through the three
                  approaches in this order, which is also a good order to speak
                  them out loud. <b>Backtracking</b>: enumerate every choice,
                  always correct, exponential, useful only as a starting point.{" "}
                  <b>Greedy</b>: one choice per step, fastest, but{" "}
                  <b>only valid with a proof</b>, and already wrong on [1, 3, 4].{" "}
                  <b>DP</b>: enumerate every decision and store the results,
                  always correct, polynomial. The short rule:{" "}
                  <b>
                    prove the exchange argument and be greedy; fail to prove it
                    and use DP.
                  </b>{" "}
                  The next chapter follows that line from start to finish.
                </>
              }
              zh={
                <>
                  碰到最优化问题,按这个顺序把三种方法过一遍 ——
                  这也是讲给别人听的好顺序。<b>回溯</b>:枚举所有选择,必对,
                  指数级,只适合当起点。<b>贪心</b>:每步只留一个选择,最快,
                  但<b>必须有证明</b>,在 [1, 3, 4] 上已经出错。
                  <b>DP</b>:枚举所有决策并记账,必对,多项式时间。
                  一句话判据:<b>能证明交换论证就贪,证不出就用 DP。</b>
                  下一章会沿着这条线全程展开。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §08 题单 ================= */}
      <Section
        id="problems"
        index="08"
        title={{ en: "Problem set: 18 greedy problems", zh: "高频题单:贪心 18 题" }}
        desc={{
          en: "Grouped as exchange argument, sequence, jump, simulation, intervals, from easier to harder. Think for 30 seconds before opening the hint.",
          zh: "按「交换论证 → 序列 → 跳跃 → 模拟 → 区间」分层,由易到难。先想 30 秒再看提示",
        }}
        badge={
          <span className="chip">
            <T en={<>Core set</>} zh={<>主线必做</>} />
          </span>
        }
      >
        <ProblemSet ch="greedy" items={PROBLEMS} />
      </Section>

      {/* ================= §09 Quiz ================= */}
      <Section
        id="quiz"
        index="09"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Answer all 8 correctly to mark this chapter complete",
          zh: "8 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en={<>✎ Quiz</>} zh={<>✎ 通关测验</>} />
          </span>
        }
      >
        <Quiz ch="greedy" items={QUIZ} />
      </Section>

      <KeyPoints
        points={{
          en: [
            <>
              Greedy means <b>one locally best choice per step, never revisited</b>.
              It is valid only when the problem has the <b>greedy-choice property</b>{" "}
              (a locally best choice belongs to some best overall answer) and{" "}
              <b>optimal substructure</b>. Fast, but it needs a reason.
            </>,
            <>
              The <b>exchange argument</b> is the tool of this chapter: assume an
              optimal solution differs from greedy at the first step, rewrite that
              step into the greedy choice without making things worse, and induct.
              It is mathematical induction in applied form.
            </>,
            <>
              The sort key decides interval problems:{" "}
              <b>selecting, deleting the fewest, or covering with the fewest → sort by end</b>{" "}
              (ending earlier leaves more room); <b>merging → sort by start</b>.
              Sorting by start time or by length breaks LC 435, and each has a
              three-interval counterexample.
            </>,
            <>
              Jump problems track the <b>reachable range</b>, not the actual jumps.
              LC 55 keeps the farthest reachable index; LC 45 adds a layer boundary
              and counts one jump per layer, which is <b>breadth-first search with
              the queue replaced by two integers</b>.
            </>,
            <>
              Simulation greedy is <b>one local rule plus one pass</b>, and each rule
              needs its own reason: 134 discards a failed prefix because every start
              inside it fails no later; 135 splits a two-sided constraint into two
              one-directional passes; 860 keeps the most flexible bill.
            </>,
            <>
              Greedy and DP can both solve the same problem (122, 53). Greedy commits
              to one choice per step; DP keeps every choice and picks at the end. That
              is why greedy is faster and why it needs a proof.
            </>,
            <>
              <b>Where greedy fails is where DP starts</b>: coins [1, 3, 4] for 6, and
              value-per-weight on the 0/1 knapsack. Both lose the exchange argument, so
              both fall back to enumerating every decision and storing the results. The
              rule in one line: <b>prove it and be greedy, or use DP</b>. See you in
              the next chapter.
            </>,
          ],
          zh: [
            <>
              贪心 = <b>每一步取一个当下最优的选择,而且不再回头</b>。
              它成立的前提是问题具备<b>贪心选择性质</b>
              (当下最优的选择属于某个整体最优解)和<b>最优子结构</b>。快,但要有理由。
            </>,
            <>
              <b>交换论证</b>是本章的工具:假设某个最优解在第一步与贪心不同,
              把那一步改写成贪心的选择而不变差,再归纳下去。
              它是数学归纳法的应用形态。
            </>,
            <>
              区间题的排序键决定成败:
              <b>筛选 / 删最少 / 用最少的东西覆盖 → 按右端排</b>
              (结束更早,留下的空间更多);<b>合并 → 按左端排</b>。
              按起点或按长度排序都会让 LC 435 出错,而且各有一个三区间的反例。
            </>,
            <>
              跳跃类题目盯的是<b>覆盖范围</b>,而不是具体怎么跳:
              LC 55 维护最远可达下标;LC 45 加了一层边界,每层计一次跳跃 ——
              本质是<b>把队列换成两个整数的广度优先搜索</b>。
            </>,
            <>
              模拟贪心是<b>一条局部规则加一次遍历</b>,而每条规则都要有自己的理由:
              134 丢弃失败前缀,是因为其中的每个起点也不会更晚断油;
              135 把双向约束拆成两次单向扫描;860 把最灵活的面额留在手里。
            </>,
            <>
              同一道题可能贪心和 DP 都能解(122、53)。
              贪心每步只保留一个选择,DP 保留全部选择、最后再挑。
              这既是贪心更快的原因,也是它需要证明的原因。
            </>,
            <>
              <b>贪心失效之处,正是 DP 的起点</b>:硬币 [1, 3, 4] 凑 6,
              以及 0/1 背包上的「单位重量价值」贪心 ——
              两者都通不过交换论证,于是都退回「枚举所有决策 + 记账」。
              一句话判据:<b>证得出就贪,证不出就 DP</b>。下一章见。
            </>,
          ],
        }}
      />

      <ChapterFooter ch="greedy" />
    </main>
  );
}
