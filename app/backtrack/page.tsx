"use client";

// 第 5 章 · 回溯 backtrack —— 全书精讲最多(4 道)、可视化最重的一章。
// 结构:走迷宫建立决策树心智模型 → 模板三问(路径/选择/结束)+ 三部曲 →
// 精讲 A 组合 77(剪枝前后两棵树)→ 组合家族 → 分割家族 →
// 精讲 B 子集 78 → 精讲 C 排列 46(used 数组现场)→ 去重两板斧(树层 vs 树枝)→
// 精讲 D N 皇后 51(自建棋盘)+ 数独 37 提位运算 → 题单 → 测验。
// 决策树统一用 lib/algviz 的 TreePlayer;used 数组与棋盘见 ./viz。
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
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { T } from "@/lib/i18n";
import { PROBLEMS, QUIZ } from "@/lib/backtrack-data";
import {
  MazeTree,
  CombTreeFull,
  CombTreePruned,
  SubsetTree,
  PermuteLab,
  DupSubsetTree,
  DedupSubsetTree,
  NQueensBoard,
} from "./viz";

const CHIPS = [
  { id: "why", n: "01", label: { en: "Why backtracking", zh: "为什么回溯" } },
  { id: "template", n: "02", label: { en: "The template", zh: "模板三问" } },
  { id: "combine", n: "03", label: { en: "Combinations · pruning", zh: "组合 · 剪枝" } },
  { id: "family", n: "04", label: { en: "Combination family", zh: "组合家族" } },
  { id: "split", n: "05", label: { en: "Partitioning", zh: "分割" } },
  { id: "subset", n: "06", label: { en: "Subsets", zh: "子集" } },
  { id: "permute", n: "07", label: { en: "Permutations", zh: "排列" } },
  { id: "dedup", n: "08", label: { en: "Duplicate values", zh: "去重两板斧" } },
  { id: "board", n: "09", label: { en: "N-Queens", zh: "N 皇后" } },
  { id: "problems", n: "10", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "11", label: { en: "Quiz", zh: "通关测验" } },
];

export default function BacktrackChapter() {
  return (
    <main className="page" data-ch="backtrack">
      <Hero
        ch="backtrack"
        title={{
          en: (
            <>
              Backtracking <span className="grad">search</span>
            </>
          ),
          zh: (
            <>
              回溯 <span className="grad">Backtracking</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              Backtracking builds an answer one choice at a time. At each step it
              takes an allowed choice and goes deeper. When the current partial
              answer cannot be finished, or has already been recorded, it{" "}
              <strong>removes the last choice it made and tries the next one</strong>
              . That removal is the &quot;backtrack&quot;, and it is the only thing
              that separates this from ordinary recursion. This chapter turns any
              &quot;list every solution&quot; problem into three parts — the path,
              the choices available now, and the stop condition — and then uses{" "}
              <strong>pruning</strong> to cut branches that cannot lead anywhere.
            </>
          ),
          zh: (
            <>
              回溯<strong>一次做一个选择,把答案一步步拼出来</strong>。每一步从「当前还允许的选择」
              里取一个,然后往下走;一旦当前的半成品拼不下去了,或者已经收下了,就
              <strong>撤销刚才那个选择,换下一个</strong>。这个「撤销」就是「回溯」二字的由来,
              也是它和普通递归唯一的区别。本章把任何「列出所有方案」的问题拆成三件事 ——
              路径、当前可选项、结束条件,再用<strong>剪枝</strong>砍掉那些注定走不通的分支。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 为什么回溯 ================= */}
      <Section
        id="why"
        index="01"
        title={{
          en: "Why backtracking: enumeration that nested loops cannot write",
          zh: "为什么需要回溯:多重 for 循环写不出来的穷举",
        }}
        desc={{
          en: "When the number of steps and the choices at each step are decided during the search, a fixed stack of for loops no longer works.",
          zh: "当「要选几个、怎么选」由搜索过程决定,循环就失灵了 —— 递归才是穷举的正确形状",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Start with an enumeration a loop can handle: choose 2 numbers out
                  of 5. Two nested <code>for</code> loops do it. Now change the
                  problem to <b>choose k out of n</b>, where k is only known when the
                  program runs. You cannot write &quot;k nested loops&quot;, because{" "}
                  <strong>the number of loop levels is fixed when you write the code
                  </strong>
                  . The same difficulty appears in &quot;cut a string into any number
                  of pieces&quot; and &quot;place queens until the board is
                  full&quot;. These problems share one property:{" "}
                  <strong>how many choices you make, and which choices are legal at
                  each step, are decided while the search runs</strong>.
                </>
              }
              zh={
                <>
                  先看一个循环能搞定的枚举:「从 5 个数里选 2 个」,两层 <code>for</code> 就写完了。
                  可如果题目是「从 n 个数里选 k 个」,k 是运行时才知道的呢?你没法写「k 层 for 循环」——
                  <strong>循环层数在写代码时就固定了</strong>。再想想「把字符串切成任意段」
                  「在棋盘上放皇后直到放满」—— 这些问题的共同点是:
                  <strong>要做多少次选择、每一步有哪些合法选择,都得边搜索边决定</strong>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Here is the method, before it gets a name. You keep one{" "}
                  <b>partial answer</b>. At each step you list the choices that are
                  still allowed, take one, add it to the partial answer, and continue
                  from there. When the partial answer is complete you record it. When
                  it cannot be completed, or after you have recorded it,{" "}
                  <strong>you remove the last choice you added and try the next
                  choice at that same step</strong>. When a step runs out of choices,
                  you return to the step before it and do the same thing there.
                </>
              }
              zh={
                <>
                  先讲方法本身,不着急给它起名字。你手里只维护<b>一个半成品答案</b>。
                  每一步列出当前还允许的选择,取一个加进半成品,然后继续往下。
                  半成品完整了就收下它;拼不下去了、或者已经收下了,就
                  <strong>把刚加进去的那个选择去掉,换这一步的下一个选择</strong>。
                  一步的选择全试完了,就退回上一步,在那里做同样的事。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Draw every partial answer as a node and every choice as an edge, and
                  you get a tree. This method is a{" "}
                  <strong>depth-first search over that tree of partial answers</strong>
                  , and the step that removes the last choice is called{" "}
                  <strong>backtracking</strong>. That undo step is the whole
                  difference between backtracking and ordinary recursion: it restores
                  the shared partial answer to exactly what it was before this node
                  was entered, so the next branch starts from a clean state. The tree
                  is usually called a <strong>decision tree</strong>. It is never
                  built in memory — it exists only as the shape of the recursion.
                </>
              }
              zh={
                <>
                  把每个半成品画成节点、每个选择画成一条边,就得到一棵树。这个方法就是
                  <strong>在这棵「半成品树」上做深度优先搜索(DFS)</strong>,而那个「去掉上一个选择」
                  的动作就叫<strong>回溯(backtracking)</strong>。它正是回溯和普通递归的全部区别:
                  它把共享的半成品<b>恢复成进入这个节点之前的样子</b>,好让下一条分支从干净状态出发。
                  这棵树一般叫<strong>决策树(decision tree)</strong>。它从不真的建在内存里 ——
                  它只是递归本身的形状。
                </>
              }
            />
          </p>
        </div>
        <MazeTree />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  One step forward and one step back — that is the entire template:{" "}
                  <strong>choose → recurse → un-choose</strong>. Every remaining
                  problem in this chapter differs only in two things:{" "}
                  <strong>what the decision tree looks like, and which branches can be
                  cut before you enter them</strong>.
                </>
              }
              zh={
                <>
                  一进一退,模板就齐了:<strong>做选择 → 递归深入 → 撤销选择</strong>。
                  本章剩下的所有题目,区别只在两件事:
                  <strong>这棵决策树长什么样,以及哪些分支可以在进门前就砍掉</strong>。
                </>
              }
            />
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Signal 01" zh="识别信号 01" />
            </div>
            <div className="card-title">
              <T en="It asks for all solutions" zh="求「所有方案」" />
            </div>
            <p>
              <T
                en={
                  <>
                    The problem says &quot;return every combination / permutation /
                    partition / path&quot;, not &quot;return the best value&quot;.
                    That is almost always backtracking, or dynamic programming when
                    the same subproblem repeats and only a count or an optimum is
                    needed.
                  </>
                }
                zh={
                  <>
                    题目要「列出全部组合 / 排列 / 切法 / 路径」,而不是求一个最优数值 ——
                    这几乎必然是回溯;当子问题重复出现、而且只要个数或最优值时,才轮到动态规划。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Signal 02" zh="识别信号 02" />
            </div>
            <div className="card-title">
              <T en="The number of steps is not fixed" zh="选择步数不固定" />
            </div>
            <p>
              <T
                en={
                  <>
                    &quot;Choose k&quot;, &quot;cut into some number of pieces&quot;,
                    &quot;fill the board&quot; — the number of steps is a variable, so
                    you cannot write that many nested loops. Recursion supplies one
                    level per step.
                  </>
                }
                zh={
                  <>
                    「选 k 个」「切若干段」「填满棋盘」—— 步数是变量,写不出对应层数的嵌套循环,
                    只能靠递归一层对应一步。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Cost warning" zh="代价预警" />
            </div>
            <div className="card-title">
              <T en="Exponential" zh="指数级" />
            </div>
            <p>
              <T
                en={
                  <>
                    Backtracking enumerates, so the cost is the{" "}
                    <b>number of nodes in the search tree</b> times the work per node.
                    For all subsets of n elements the tree has about <BigO o="2n" />{" "}
                    nodes; for all permutations of n elements it has about n! leaves.{" "}
                    <b>Pruning</b> is not a finishing touch here — it often decides
                    whether the solution runs in time.
                  </>
                }
                zh={
                  <>
                    回溯是穷举,代价 = <b>搜索树的节点数</b> × 每个节点的工作量。
                    n 个元素的全部子集,树上约 <BigO o="2n" /> 个节点;n 个元素的全排列,
                    叶子约 n! 个。所以<b>剪枝</b>不是锦上添花 —— 它常常直接决定能不能在时限内跑完。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="story"
          title={{ en: "Where the name comes from", zh: "「回溯」这个名字是谁起的" }}
        >
          <p>
            <T
              en={
                <>
                  The word <i>backtracking</i> was introduced by the mathematician{" "}
                  <b>D. H. Lehmer</b> around 1950, but the idea is much older: the
                  eight queens puzzle was posed in 1848, and Gauss worked on it by
                  hand. Backtracking and DFS are closely related but not identical.
                  DFS is a way to traverse a graph or tree that already exists.
                  Backtracking is DFS over a tree of partial solutions that is
                  generated while you search, with an undo step at every node. Later
                  in this chapter you will see the same mechanism inside Prolog,
                  regular expression engines, and sudoku solvers.
                </>
              }
              zh={
                <>
                  <i>backtracking</i> 一词由数学家 <b>D. H. Lehmer</b> 在 1950 年前后提出,
                  但思想更古老 —— 1848 年人们就在研究「八皇后问题」,高斯也曾手算过。
                  回溯和 DFS 关系很近,但不是一回事:DFS 遍历的是一棵<b>已经存在</b>的树或图;
                  回溯是在一棵<b>边搜索边生成</b>的「半成品树」上做 DFS,而且每个节点都带一次撤销。
                  本章后面你会看到,Prolog、正则表达式引擎、数独求解器,骨子里跑的都是同一套机制。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 模板三问 ================= */}
      <Section
        id="template"
        index="02"
        title={{
          en: "The template: path, choices, stop condition",
          zh: "模板三问:路径 / 选择列表 / 结束条件",
        }}
        desc={{
          en: "Answer these three questions for any backtracking problem and the template writes itself.",
          zh: "拿到任何回溯题,先回答这三个问题,模板就自动填好了",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Backtracking problems look very different from each other, but they
                  share one skeleton. Before writing code, answer three questions:
                </>
              }
              zh={
                <>
                  回溯题看着五花八门,其实共用同一套骨架。写代码前,先回答三个问题:
                </>
              }
            />
          </p>
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Question 1" zh="问题一" />
            </div>
            <div className="card-title">
              <T en="The path" zh="路径(path)" />
            </div>
            <p>
              <T
                en={
                  <>
                    The choices you have already made, kept in one list. It is the
                    route <b>from the root to the current node</b> of the decision
                    tree. When you reach a node that counts as an answer,{" "}
                    <b>a copy of this list</b> is that answer.
                  </>
                }
                zh={
                  <>
                    已经做出的选择,记在一个列表里。它就是决策树上<b>从根到当前节点</b>的那条路 ——
                    走到一个算答案的节点时,<b>这个列表的一份拷贝</b>就是一个答案。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Question 2" zh="问题二" />
            </div>
            <div className="card-title">
              <T en="The choices available now" zh="选择列表" />
            </div>
            <p>
              <T
                en={
                  <>
                    What this step is <b>still allowed to pick</b>. Combinations and
                    subsets use a <span className="mono">startIndex</span> that only
                    moves forward; permutations use a{" "}
                    <span className="mono">used</span> array; a board uses
                    &quot;is this square attacked?&quot;.
                  </>
                }
                zh={
                  <>
                    当前这一步<b>还能选哪些</b>。组合、子集用只往后走的{" "}
                    <span className="mono">startIndex</span>;排列用{" "}
                    <span className="mono">used</span> 数组;棋盘则看「这一格会不会被攻击」。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Question 3" zh="问题三" />
            </div>
            <div className="card-title">
              <T en="The stop condition" zh="结束条件" />
            </div>
            <p>
              <T
                en={
                  <>
                    When the current path counts as a finished answer: k numbers
                    chosen, the string fully cut, n rows filled. Record it and
                    return.
                  </>
                }
                zh={
                  <>
                    什么时候当前路径算一个完整答案:选够 k 个、字符串切到末尾、放满 n 行 ——
                    到了就收集结果并 return。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  With those three answers, fill in the skeleton below. The example is
                  &quot;choose k numbers out of 1..n&quot;. Look at the three lines
                  inside the loop — <strong>choose, recurse, un-choose</strong> — and
                  note that the un-choose is the exact reverse of the choose.
                </>
              }
              zh={
                <>
                  三问答完,套进下面这个骨架就行。例子是「从 1..n 里选 k 个」。
                  注意 for 循环里那三行 —— <strong>做选择、递归、撤销选择</strong> ——
                  撤销那一步,必须精确地把做选择那一步反过来。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="backtrack_template"
          java={{
            code: {
              en: `List<List<Integer>> res = new ArrayList<>();
List<Integer> path = new ArrayList<>();

// Skeleton: choose k numbers out of 1..n
void backtrack(int n, int k, int start) {
    if (path.size() == k) {            // stop condition
        res.add(new ArrayList<>(path)); // record: must store a copy
        return;
    }
    for (int i = start; i <= n; i++) {  // choices available now
        path.add(i);                    // 1. choose
        backtrack(n, k, i + 1);         // 2. go one level deeper
        path.remove(path.size() - 1);   // 3. un-choose
    }
}`,
              zh: `List<List<Integer>> res = new ArrayList<>();
List<Integer> path = new ArrayList<>();

// 骨架:从 1..n 里选 k 个
void backtrack(int n, int k, int start) {
    if (path.size() == k) {            // 结束条件
        res.add(new ArrayList<>(path)); // 收集:必须存一份拷贝
        return;
    }
    for (int i = start; i <= n; i++) {  // 当前可选项
        path.add(i);                    // 1. 做选择
        backtrack(n, k, i + 1);         // 2. 递归下一层
        path.remove(path.size() - 1);   // 3. 撤销选择
    }
}`,
            },
            hl: [11, 12, 13],
            note: {
              en: (
                <>
                  <b>Most common mistake:</b> you must store{" "}
                  <code>new ArrayList&lt;&gt;(path)</code>. There is only one{" "}
                  <code>path</code> object for the whole search, so{" "}
                  <code>res.add(path)</code> stores a <b>reference</b> to it. Every
                  later <code>add</code> and <code>remove</code> would then change
                  the answers already inside <code>res</code>.
                </>
              ),
              zh: (
                <>
                  <b>头号坑:</b>必须存 <code>new ArrayList&lt;&gt;(path)</code>。
                  整个搜索里 <code>path</code> 自始至终是同一个对象,写{" "}
                  <code>res.add(path)</code> 存进去的是<b>引用</b>;之后每一次{" "}
                  <code>add</code> / <code>remove</code> 都会把已经收进 res 的答案一起改掉。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `res, path = [], []

# Skeleton: choose k numbers out of 1..n
def backtrack(n, k, start):
    if len(path) == k:              # stop condition
        res.append(path[:])         # record: store a copy
        return
    for i in range(start, n + 1):   # choices available now
        path.append(i)              # 1. choose
        backtrack(n, k, i + 1)      # 2. go one level deeper
        path.pop()                  # 3. un-choose`,
              zh: `res, path = [], []

# 骨架:从 1..n 里选 k 个
def backtrack(n, k, start):
    if len(path) == k:              # 结束条件
        res.append(path[:])         # 收集:存一份拷贝
        return
    for i in range(start, n + 1):   # 当前可选项
        path.append(i)              # 1. 做选择
        backtrack(n, k, i + 1)      # 2. 递归下一层
        path.pop()                  # 3. 撤销选择`,
            },
            hl: [9, 10, 11],
            note: {
              en: (
                <>
                  <b>Most common mistake:</b> record <code>path[:]</code> or{" "}
                  <code>path.copy()</code>. <code>res.append(path)</code> appends a
                  reference to the same list, and the later <code>pop</code> calls
                  empty it — that is why beginners end up with a result full of empty
                  lists.
                </>
              ),
              zh: (
                <>
                  <b>头号坑:</b>收集时写 <code>path[:]</code> 或 <code>path.copy()</code>。
                  <code>res.append(path)</code> 追加的是同一个列表的引用,后面的{" "}
                  <code>pop</code> 会把它清空 —— 新手最常见的「结果全是空列表」就是这么来的。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `const res = [], path = [];

// Skeleton: choose k numbers out of 1..n
function backtrack(n, k, start) {
  if (path.length === k) {          // stop condition
    res.push([...path]);            // record: store a copy
    return;
  }
  for (let i = start; i <= n; i++) { // choices available now
    path.push(i);                   // 1. choose
    backtrack(n, k, i + 1);         // 2. go one level deeper
    path.pop();                     // 3. un-choose
  }
}`,
              zh: `const res = [], path = [];

// 骨架:从 1..n 里选 k 个
function backtrack(n, k, start) {
  if (path.length === k) {          // 结束条件
    res.push([...path]);            // 收集:存一份拷贝
    return;
  }
  for (let i = start; i <= n; i++) { // 当前可选项
    path.push(i);                   // 1. 做选择
    backtrack(n, k, i + 1);         // 2. 递归下一层
    path.pop();                     // 3. 撤销选择
  }
}`,
            },
            hl: [10, 11, 12],
            note: {
              en: (
                <>
                  <code>[...path]</code> creates a new array with the same elements.{" "}
                  <code>res.push(path)</code> would push a reference to the one shared
                  array, and the <code>pop</code> on the way back up would empty it.
                  What goes into <code>res</code> must be a snapshot.
                </>
              ),
              zh: (
                <>
                  <code>[...path]</code> 展开成一个元素相同的新数组。写{" "}
                  <code>res.push(path)</code> 压进去的是同一个共享数组的引用,回溯时的{" "}
                  <code>pop</code> 会把它清空 —— 进 <code>res</code> 的必须是快照。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="warn"
          title={{
            en: "The un-choose must exactly reverse the choose",
            zh: "撤销必须精确地反做「选择」",
          }}
        >
          <p>
            <T
              en={
                <>
                  Many people write the choose and the recursion correctly and forget
                  the un-choose. The result is not a slow program, it is a{" "}
                  <b>wrong</b> one. All branches share the same{" "}
                  <code>path</code> object. Without the undo, a sibling branch
                  continues on top of what the previous branch left behind. The rule
                  is simple: <b>whatever the choose changed, the un-choose changes
                  back</b>. If the choose touched two pieces of state — for example{" "}
                  <code>path</code> and <code>used[i]</code> — the un-choose must
                  restore both. This is the single most common backtracking bug.
                </>
              }
              zh={
                <>
                  很多人写对了「选择」和「递归」,却忘了<b>撤销</b>。后果不是慢,是<b>错</b>:
                  所有分支共享同一个 <code>path</code> 对象,不撤销,兄弟分支就会在上一条分支
                  留下的残留上继续。规则很简单:<b>做选择改了什么,撤销就改回什么</b>。
                  如果做选择动了两处状态 —— 比如 <code>path</code> 和 <code>used[i]</code> ——
                  撤销就必须把两处都还原。这是回溯最常见的一个错。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="deep"
          title={{
            en: "Two ways to carry the path",
            zh: "带着路径走,有两种写法",
          }}
        >
          <p>
            <T
              en={
                <>
                  There is a second, also correct, way to write this: give each
                  recursive call a <b>fresh copy</b> of the path with the new element
                  already appended, and never undo anything. It is shorter and it
                  removes the whole class of bugs above. It also costs more: every
                  node copies the path, which is O(path length) extra time and memory{" "}
                  <b>per node</b>, not just per solution. The code in this chapter{" "}
                  <b>mutates one shared list and undoes the change</b>, because the
                  undo is O(1) and nothing is allocated on the way down. Copying is
                  then needed only at the moments when a solution is recorded.
                </>
              }
              zh={
                <>
                  还有第二种同样正确的写法:每次递归都传一份<b>新的路径拷贝</b>
                  (把新元素加进去后再传),从头到尾不撤销。它更短,也直接消灭了上面那类 bug。
                  代价是:每个节点都要复制一次路径,额外时间和内存是<b>每个节点</b> O(路径长度),
                  而不只是每个解一次。本章的代码用的是<b>共享一个列表 + 撤销</b>的写法 ——
                  撤销是 O(1),往下走的过程中不分配任何内存;只有在收集解的那一刻才需要拷贝。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="win"
          title={{ en: "In an interview: say the three parts out loud", zh: "面试话术:把三问说出来" }}
        >
          <p>
            <T
              en={
                <>
                  Do not start typing. Say this first: &quot;I will model it as a
                  decision tree. The <b>path</b> holds the choices made so far. The{" "}
                  <b>choices available now</b> are controlled by a startIndex here,
                  or by a used array. The <b>stop condition</b> is that the path has
                  length k. Then the loop body is choose, recurse, un-choose, and
                  finally I will look for branches I can prune.&quot; That shows a{" "}
                  <b>framework you can reuse</b>, not one memorised problem.
                </>
              }
              zh={
                <>
                  拿到回溯题,别急着写。先说:「我把它建成一棵决策树。<b>路径</b>是已做的选择,
                  <b>当前可选项</b>由 startIndex(或 used 数组)控制,<b>结束条件</b>是路径长度等于 k。
                  循环体就是做选择 - 递归 - 撤销,最后再看哪些分支能剪。」——
                  这段话让面试官确信你有<b>可迁移的框架</b>,而不是背了一道题。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 精讲 A · LC 77 组合 + 剪枝 ================= */}
      <Section
        id="combine"
        index="03"
        title={{
          en: "Featured problem A · LC 77 Combinations: draw the tree, then cut it down",
          zh: "精讲 A · LC 77 组合:把决策树画出来,再把它剪瘦",
        }}
        desc={{
          en: "Combinations are the first backtracking problem to learn, and they teach the two ideas this chapter is built on: a start index, and pruning before you enter a branch.",
          zh: "组合是回溯的第一课 —— 学会它,也就学会了本章最重要的两件事:startIndex、进门前剪枝",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>Problem:</b> given integers n and k, return every{" "}
                  <b>combination of k numbers</b> from 1..n. Order does not matter, so
                  [1,2] and [2,1] are the same combination. <b>Brute force:</b> if k
                  were a constant you could write k nested loops, but k is a
                  parameter. <b>Solution:</b> build a decision tree. Level 1 picks the
                  first number, level 2 picks the second number from those{" "}
                  <i>larger</i> than the first, and so on. Every node whose path has
                  length k is one combination.
                </>
              }
              zh={
                <>
                  <b>题意:</b>给两个整数 n 和 k,返回 1..n 中所有 <b>k 个数的组合</b>。
                  组合不讲顺序,[1,2] 和 [2,1] 算同一个。<b>暴力:</b>如果 k 是常数,
                  可以写 k 层嵌套循环 —— 但 k 是参数,层数不定。<b>正解:</b>建决策树。
                  第一层选第 1 个数,第二层在<i>比它大</i>的数里选第 2 个……
                  路径长度为 k 的节点,就是一个组合。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Here is the first key point of the combination family:{" "}
                  <strong>why can the next level only pick a larger number?</strong>{" "}
                  Because a combination is a set, not a sequence. If every level could
                  pick any number, the search would produce both [1,2] and [2,1] —
                  the same set twice. A{" "}
                  <span className="mono">startIndex</span> that only moves forward
                  forces every combination to appear exactly once, in{" "}
                  <b>increasing order</b>. First, the full tree with no pruning (n=4,
                  k=2):
                </>
              }
              zh={
                <>
                  这里藏着组合类的第一个关键:<strong>为什么下一层只能选「比当前大」的数?</strong>
                  因为组合是集合,不是序列。如果每层都能选任意数,就会同时产生 [1,2] 和 [2,1] ——
                  同一个集合出现两次。用一个只往后走的{" "}
                  <span className="mono">startIndex</span>,就让每个组合只以<b>升序</b>出现一次。
                  先看不剪枝的完整决策树(n=4, k=2):
                </>
              }
            />
          </p>
        </div>
        <CombTreeFull />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  Count the green leaves: exactly 6 = C(4,2). Now look at the branch
                  that starts by picking 4. You still need 2 numbers in total, but you
                  started at the last one, so{" "}
                  <strong>no larger number is left</strong> and that branch{" "}
                  <strong>can never produce a complete answer</strong>. The search
                  entered it anyway and only found out at the bottom. This is what{" "}
                  <strong>pruning</strong> fixes:{" "}
                  <strong>before entering a subtree, check whether it can still lead
                  to a valid answer, and skip it if it cannot</strong>.
                </>
              }
              zh={
                <>
                  数一数绿色叶子:正好 6 个 = C(4,2)。再看「选 4 起头」那条分支 ——
                  一共要凑 2 个数,起点却选了最后一个 4,后面<strong>再没有更大的数</strong>,
                  这条分支<strong>不可能产生完整答案</strong>。搜索却还是走了进去,到底部才发现。
                  这就是<strong>剪枝(pruning)</strong>要解决的事:
                  <strong>进入一棵子树之前,先判断它还有没有可能产生合法答案,没有就不进</strong>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  For LC 77: you still need{" "}
                  <span className="mono">k − path.size()</span> more numbers, so the
                  starting value i can be at most{" "}
                  <span className="mono">n − (k − path.size()) + 1</span>; beyond that
                  there are not enough numbers left. Tighten the upper bound of the
                  loop from n to that value and the dead branch is{" "}
                  <strong>never entered at all</strong>:
                </>
              }
              zh={
                <>
                  具体到 77:还需要选 <span className="mono">k − path.size()</span> 个数,
                  所以起点 i 最大只能到 <span className="mono">n − (k − path.size()) + 1</span>,
                  再往后剩下的数就不够了。把 for 的上界从 n 收紧到这个值,那条死路
                  <strong>一步都不会走</strong>:
                </>
              }
            />
          </p>
        </div>
        <CombTreePruned />
        <CodeTabs
          title="lc77_combine"
          java={{
            code: {
              en: `class Solution {
    private final List<List<Integer>> res = new ArrayList<>();
    private final List<Integer> path = new ArrayList<>();

    public List<List<Integer>> combine(int n, int k) {
        backtrack(n, k, 1);
        return res;
    }

    private void backtrack(int n, int k, int start) {
        if (path.size() == k) {
            res.add(new ArrayList<>(path));   // record one combination (a copy)
            return;
        }
        // prune: k - path.size() numbers are still needed,
        int last = n - (k - path.size()) + 1; // so i can go no further than this
        for (int i = start; i <= last; i++) {
            path.add(i);
            backtrack(n, k, i + 1);
            path.remove(path.size() - 1);
        }
    }
}`,
              zh: `class Solution {
    private final List<List<Integer>> res = new ArrayList<>();
    private final List<Integer> path = new ArrayList<>();

    public List<List<Integer>> combine(int n, int k) {
        backtrack(n, k, 1);
        return res;
    }

    private void backtrack(int n, int k, int start) {
        if (path.size() == k) {
            res.add(new ArrayList<>(path));   // 收集一个组合(存拷贝)
            return;
        }
        // 剪枝:还需要 k - path.size() 个数,
        int last = n - (k - path.size()) + 1; // 所以 i 最多只能到这里
        for (int i = start; i <= last; i++) {
            path.add(i);
            backtrack(n, k, i + 1);
            path.remove(path.size() - 1);
        }
    }
}`,
            },
            hl: [15, 16, 17],
            note: {
              en: (
                <>
                  The recursive call passes <code>i + 1</code>: each number is used at
                  most once, and only larger numbers follow. The pruning line is what
                  decides this problem in practice — without it the answer is still
                  correct, but large n and k time out.
                </>
              ),
              zh: (
                <>
                  递归传 <code>i + 1</code>:每个数最多用一次,而且后面只能选更大的。
                  剪枝那两行是本题的分水岭 —— 不剪答案也对,但 n、k 一大就会超时。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def combine(self, n: int, k: int) -> list[list[int]]:
        res, path = [], []

        def backtrack(start: int) -> None:
            if len(path) == k:
                res.append(path[:])          # store a copy
                return
            last = n - (k - len(path)) + 1   # pruning bound
            for i in range(start, last + 1):
                path.append(i)
                backtrack(i + 1)
                path.pop()

        backtrack(1)
        return res`,
              zh: `class Solution:
    def combine(self, n: int, k: int) -> list[list[int]]:
        res, path = [], []

        def backtrack(start: int) -> None:
            if len(path) == k:
                res.append(path[:])          # 存一份拷贝
                return
            last = n - (k - len(path)) + 1   # 剪枝上界
            for i in range(start, last + 1):
                path.append(i)
                backtrack(i + 1)
                path.pop()

        backtrack(1)
        return res`,
            },
            hl: [9, 10],
            note: {
              en: (
                <>
                  Do not drop the <code>+ 1</code> in{" "}
                  <code>range(start, last + 1)</code>: Python&apos;s{" "}
                  <code>range</code> excludes its upper end, so reaching{" "}
                  <code>last</code> requires <code>last + 1</code>. Derive the bound
                  once by hand: k − len(path) numbers are still missing.
                </>
              ),
              zh: (
                <>
                  <code>range(start, last + 1)</code> 的 <code>+ 1</code> 别漏 —— Python 的{" "}
                  <code>range</code> 右端开区间,要取到 <code>last</code> 必须写{" "}
                  <code>last + 1</code>。剪枝上界值得手推一遍:还差 k − len(path) 个数。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var combine = function (n, k) {
  const res = [], path = [];
  const backtrack = (start) => {
    if (path.length === k) {
      res.push([...path]);                 // store a copy
      return;
    }
    const last = n - (k - path.length) + 1; // pruning bound
    for (let i = start; i <= last; i++) {
      path.push(i);
      backtrack(i + 1);
      path.pop();
    }
  };
  backtrack(1);
  return res;
};`,
              zh: `var combine = function (n, k) {
  const res = [], path = [];
  const backtrack = (start) => {
    if (path.length === k) {
      res.push([...path]);                 // 存一份拷贝
      return;
    }
    const last = n - (k - path.length) + 1; // 剪枝上界
    for (let i = start; i <= last; i++) {
      path.push(i);
      backtrack(i + 1);
      path.pop();
    }
  };
  backtrack(1);
  return res;
};`,
            },
            hl: [8, 9],
            note: {
              en: (
                <>
                  The inner arrow function closes over <code>res</code> and{" "}
                  <code>path</code>, so they do not have to be passed as parameters.{" "}
                  <code>[...path]</code> is the required snapshot copy.
                </>
              ),
              zh: (
                <>
                  内层箭头函数闭包捕获了 <code>res</code> 和 <code>path</code>,
                  不用一路当参数传。<code>[...path]</code> 是必须的快照拷贝。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="deep"
          title={{ en: "Two kinds of pruning", zh: "剪枝有两种,别混为一谈" }}
        >
          <p>
            <T
              en={
                <>
                  <b>1. This branch cannot be valid — a constraint check.</b> You
                  prove that no complete, legal answer exists below this node, so you
                  skip it. The bound on <code>i</code> above is this kind, and so is
                  the palindrome test in LC 131 and the &quot;is this square
                  attacked?&quot; test in LC 51. It never removes a real answer.
                </>
              }
              zh={
                <>
                  <b>一、这条分支不可能合法 —— 约束检查。</b>
                  你能证明这个节点下面不存在任何完整且合法的答案,于是跳过它。
                  上面那个 <code>i</code> 的上界就属于这一类,LC 131 的回文判断、
                  LC 51 的「这一格会不会被攻击」也是。它绝不会剪掉真答案。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>2. This branch cannot be better — a bound.</b> This one only
                  applies when you want the <i>best</i> answer rather than all
                  answers. You keep the best score found so far, compute an optimistic
                  estimate of the best score still reachable below this node, and skip
                  the node when the estimate cannot beat the current best. That method
                  is called <b>branch and bound</b>. Everything in this chapter
                  enumerates all answers, so <b>every example here uses the first
                  kind</b>.
                </>
              }
              zh={
                <>
                  <b>二、这条分支不可能更好 —— 界(bound)。</b>
                  只有在求<i>最优</i>解、而不是求所有解时才用得上。你记住目前最好的成绩,
                  再对「这个节点下面最好能到多少」做一个乐观估计,估计值都赢不了当前最优就跳过。
                  这套方法叫<b>分支限界(branch and bound)</b>。本章全是「列出所有解」,
                  所以<b>这里的每一个例子用的都是第一种</b>。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="win"
          title={{ en: "Complexity and follow-up questions", zh: "复杂度 & 面试追问" }}
        >
          <p>
            <T
              en={
                <>
                  Count it as nodes in the search tree times work per node. The tree
                  has C(n,k) leaves; interior nodes are fewer, and each does O(1) work
                  per child. Each leaf copies a path of length k. So time is{" "}
                  <b>O(k · C(n,k))</b>, where n is the size of the range and k is the
                  size of one combination. Space is <b>O(k)</b> for the path and the
                  recursion, not counting the output. Pruning removes branches that
                  produce nothing, which can be a large speed-up, but it can never go
                  below the cost of writing out C(n,k) answers.
                </>
              }
              zh={
                <>
                  按「搜索树节点数 × 每节点工作量」来算。树有 C(n,k) 个叶子;内部节点更少,
                  每个子节点上的工作是 O(1);每个叶子复制一条长度为 k 的路径。
                  所以时间 <b>O(k · C(n,k))</b>,其中 n 是取值范围大小,k 是单个组合的长度;
                  空间 <b>O(k)</b>(路径 + 递归深度,不算输出)。
                  剪枝砍掉的是产不出结果的分支,能带来很大的加速,
                  但永远快不过「把 C(n,k) 个答案写出来」这个下限。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Follow-ups: (1) &quot;the numbers must also sum to a target&quot; →{" "}
                  <b>LC 216</b>, add one more constraint check on the running sum; (2)
                  &quot;the same number may be reused&quot; → <b>LC 39</b>, recurse
                  with <code>i</code> instead of <code>i + 1</code>; (3) &quot;the
                  array contains duplicates and each element is used once&quot; →{" "}
                  <b>LC 40</b>, sort first and skip duplicates at the same level
                  (§08).
                </>
              }
              zh={
                <>
                  追问:①「组合的和还要等于某个目标值?」→ <b>LC 216</b>,对累加和多加一处约束检查;
                  ②「同一个数能重复选?」→ <b>LC 39</b>,递归传 <code>i</code> 而不是{" "}
                  <code>i + 1</code>;③「数组里有重复元素、每个只用一次?」→ <b>LC 40</b>,
                  先排序,再跳过同一层的重复值(§08 讲透)。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 组合家族 ================= */}
      <Section
        id="family"
        index="04"
        title={{
          en: "The combination family: one skeleton, five variations",
          zh: "组合家族:一套骨架,五种换皮",
        }}
        desc={{
          en: "LC 17 / 216 / 39 / 40 are LC 77 plus one extra rule each. The trick is to see exactly which line changes.",
          zh: "17 / 216 / 39 / 40 —— 都是 77 加一条额外规则,关键是看清改的是哪一行",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Almost every combination problem adds a condition to the LC 77
                  skeleton. Once you see <strong>which single part changes</strong>,
                  you stop mixing them up:
                </>
              }
              zh={
                <>
                  组合类的题,几乎都是在 77 的骨架上「加一条规则」。看清每道题
                  <strong>改的是哪一处</strong>,就再也不会背混:
                </>
              }
            />
          </p>
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="LC 17 · Letter combinations" zh="LC 17 · 电话字母" />
            </div>
            <div className="card-title">
              <T en="One pick from each of several sets" zh="多个集合各选一个" />
            </div>
            <p>
              <T
                en={
                  <>
                    You do not pick from <b>one</b> set. Each level uses a different
                    set (digit 2 → &quot;abc&quot;, 3 → &quot;def&quot;, …). So there
                    is <b>no startIndex</b>; an index says which digit, and therefore
                    which set, this level uses. Stop when every digit has been used.
                  </>
                }
                zh={
                  <>
                    不是从<b>同一个</b>集合里选,而是每层换一个集合(数字 2→&quot;abc&quot;,
                    3→&quot;def&quot;……)。所以<b>没有 startIndex</b>:用一个 index 表示
                    「这一层对应第几个数字」,也就决定了用哪一组字母。结束条件是所有数字都用完。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="LC 216 · Combination Sum III" zh="LC 216 · 组合总和 III" />
            </div>
            <div className="card-title">
              <T en="Count and sum, two constraints" zh="个数 + 和,两个约束" />
            </div>
            <p>
              <T
                en={
                  <>
                    LC 77 plus a running <span className="mono">sum</span>: a path of
                    length k is recorded only if sum equals the target. Two constraint
                    checks stack up — not enough numbers left, or the sum already
                    exceeds the target. The second one is valid because 1..9 are all
                    positive, so the sum can only grow.
                  </>
                }
                zh={
                  <>
                    77 再加一个 <span className="mono">sum</span>:凑够 k 个时,
                    还要 sum 等于目标值才收。两处约束检查叠加 —— 剩下的数不够、或者和已经超标。
                    第二条成立的前提是 1..9 全是正数,和只会越加越大。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="LC 39 · Combination Sum" zh="LC 39 · 组合总和" />
            </div>
            <div className="card-title">
              <T en="The same number may be reused" zh="同一个数可重复选" />
            </div>
            <p>
              <T
                en={
                  <>
                    Elements are distinct but each may be used any number of times.
                    One change: recurse with <span className="mono">i</span> instead
                    of <span className="mono">i + 1</span>, so the next level can pick
                    the same element again. Sort first, then{" "}
                    <span className="mono">break</span> as soon as the sum would
                    exceed the target.
                  </>
                }
                zh={
                  <>
                    元素互不相同,但每个可以用任意多次。唯一改动:递归传{" "}
                    <span className="mono">i</span> 而不是 <span className="mono">i + 1</span>,
                    让下一层还能选到它自己。先排序,一旦加上当前数就会超标,直接{" "}
                    <span className="mono">break</span>。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <div className="grid-3" style={{ marginTop: 14 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="LC 40 · Combination Sum II" zh="LC 40 · 组合总和 II" />
            </div>
            <div className="card-title">
              <T en="Duplicates, each used once" zh="有重复元素、各用一次" />
            </div>
            <p>
              <T
                en={
                  <>
                    The array contains duplicate values, each element may be used
                    once, and the result must contain no duplicate combinations.{" "}
                    <b>Sort, then skip duplicates at the same level</b>:{" "}
                    <span className="mono">i &gt; start &amp;&amp; nums[i] == nums[i-1]</span>
                    . Recurse with <span className="mono">i + 1</span>. §08 explains
                    why this is correct.
                  </>
                }
                zh={
                  <>
                    数组含重复值,每个元素只能用一次,结果里还不能有重复组合。
                    <b>先排序,再跳过同一层的重复值</b>:
                    <span className="mono">i &gt; start &amp;&amp; nums[i] == nums[i-1]</span>。
                    递归传 <span className="mono">i + 1</span>。为什么这样是对的,§08 讲透。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="LC 22 · Generate Parentheses" zh="LC 22 · 括号生成" />
            </div>
            <div className="card-title">
              <T en="The constraint is the pruning" zh="用「合法性」当剪枝" />
            </div>
            <p>
              <T
                en={
                  <>
                    Each level has two choices: write &quot;(&quot; or write
                    &quot;)&quot;. The rules are the pruning: you may write
                    &quot;(&quot; while fewer than n have been written, and
                    &quot;)&quot; only while the number of &quot;)&quot; is less than
                    the number of &quot;(&quot;. Nothing else is needed.
                  </>
                }
                zh={
                  <>
                    每层二选一:写「(」或写「)」。规则本身就是剪枝:左括号还没用满 n 个才能写「(」;
                    右括号数量小于左括号数量才能写「)」。除此之外什么都不用做。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="The summary" zh="一句话总纲" />
            </div>
            <div className="card-title">
              <T en="Which line changes" zh="改哪儿,一眼看穿" />
            </div>
            <p>
              <T
                en={
                  <>
                    <b>Reuse allowed?</b> → pass i or i+1. <b>One set or several?</b>{" "}
                    → startIndex or a level index. <b>Duplicate values?</b> → sort and
                    skip at the same level. <b>Extra rule?</b> → one more constraint
                    check.
                  </>
                }
                zh={
                  <>
                    <b>能否重复选</b> → 传 i 还是 i+1;<b>一个集合还是多个</b> →
                    用 startIndex 还是层号;<b>有无重复值</b> → 要不要排序 + 同层跳过;
                    <b>额外规则</b> → 多加一处约束检查。
                  </>
                }
              />
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §05 分割家族 ================= */}
      <Section
        id="split"
        index="05"
        title={{
          en: "Partitioning: a cut is also a choice",
          zh: "分割问题:把「切一刀」也看成一次选择",
        }}
        desc={{
          en: "LC 131 / 93 — startIndex stops meaning \"which number\" and starts meaning \"where the next cut goes\".",
          zh: "131 / 93 —— startIndex 从「选哪个数」变成「下一刀切在哪」",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Cutting a string into pieces does not look like choosing numbers,
                  but it is the same tree. One sentence is enough:{" "}
                  <strong>read startIndex as &quot;the first character of the next
                  piece&quot;</strong>. At each node you try every cut point i from
                  start to the end of the string; the substring s[start..i] is the
                  piece you choose at this step. Reaching the end of the string means
                  the whole string has been cut, which is one complete answer.
                </>
              }
              zh={
                <>
                  把字符串切成若干段,看着和「选数字」不像,其实是同一棵树。一句话就够了:
                  <strong>把 startIndex 读成「下一段的第一个字符」</strong>。
                  每个节点从 start 到串尾枚举切点 i,子串 s[start..i] 就是这一步选的那一段;
                  start 走到串尾,说明整个字符串切完了,这就是一种完整切法。
                </>
              }
            />
          </p>
        </div>
        <div className="bt-duo">
          <div className="card">
            <div className="card-kicker">
              <T en="LC 131 · Palindrome Partitioning" zh="LC 131 · 分割回文串" />
            </div>
            <div className="card-title">
              <T en="Every piece must be a palindrome" zh="每段都要是回文" />
            </div>
            <p>
              <T
                en={
                  <>
                    dfs(start): try each cut point i. If s[start..i] is a palindrome,
                    push it, recurse with dfs(i+1), then pop.{" "}
                    <b>If it is not a palindrome, skip that cut point</b> — that is
                    the constraint check. start at the end of the string means one
                    complete partition. Precomputing a palindrome table makes the test
                    O(1).
                  </>
                }
                zh={
                  <>
                    dfs(start):枚举切点 i。若 s[start..i] 是回文,就加入路径、递归 dfs(i+1)、撤销;
                    <b>不是回文就跳过这个切点</b> —— 这就是约束检查。start 到达串尾 = 一种完整切法。
                    预处理一张回文表可以把判断降到 O(1)。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="LC 93 · Restore IP Addresses" zh="LC 93 · 复原 IP 地址" />
            </div>
            <div className="card-title">
              <T en="More rules means more pruning" zh="约束一大堆 = 剪枝一大堆" />
            </div>
            <p>
              <T
                en={
                  <>
                    The same partitioning skeleton with more rules: exactly{" "}
                    <b>4 pieces</b>, each piece between 0 and 255, and no leading zero
                    except the single digit &quot;0&quot;. Track the number of pieces
                    as a second dimension — four pieces is the stop condition — and
                    skip any piece that breaks a rule.
                  </>
                }
                zh={
                  <>
                    同一套切割骨架,只是规则更多:必须<b>正好切 4 段</b>、每段数值 0~255、
                    除单个「0」外不能有前导零。把「已切段数」当第二个维度(切满 4 段是结束条件),
                    任何一段违规就跳过。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "What the recursion may reuse: the organising idea",
            zh: "递归允许重用什么 —— 这才是主线",
          }}
        >
          <p>
            <T
              en={
                <>
                  Combinations, partitions, subsets, and permutations all run on the
                  same skeleton. The one thing that differs is{" "}
                  <b>what a deeper call is allowed to reuse</b>:
                </>
              }
              zh={
                <>
                  组合、分割、子集、排列跑的是同一套骨架。唯一不同的是
                  <b>更深一层的调用允许重用什么</b>:
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>Subsets, combinations, partitions</b> move a{" "}
                  <span className="mono">startIndex</span> forward, so a deeper call
                  can only use elements after the one just taken. Order is fixed, and
                  each set of elements is produced once.{" "}
                  <b>Permutations</b> may go back to any element that is not currently
                  on the path, so they track a <span className="mono">used</span> set
                  instead. Everything else — the three questions, the three steps, the
                  copy when recording — is identical.
                </>
              }
              zh={
                <>
                  <b>子集、组合、分割</b>靠 <span className="mono">startIndex</span> 只往前推,
                  更深的调用只能用刚才那个元素之后的元素:顺序固定,同一组元素只会产生一次。
                  <b>排列</b>可以回头选任何「当前不在路径上」的元素,所以它改用一个{" "}
                  <span className="mono">used</span> 集合记账。除此之外 ——
                  三个问题、三个动作、收集时的拷贝 —— 完全一样。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 精讲 B · LC 78 子集 ================= */}
      <Section
        id="subset"
        index="06"
        title={{
          en: "Featured problem B · LC 78 Subsets: record at every node",
          zh: "精讲 B · LC 78 子集:走到哪,收到哪",
        }}
        desc={{
          en: "Same tree as combinations. The only difference is when a node counts as an answer.",
          zh: "和组合共用一棵树,唯一的区别是「什么时候算一个答案」",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>Problem:</b> return <b>all subsets</b> of an array whose elements
                  are distinct, including the empty set and the array itself.{" "}
                  <b>Key idea:</b> for combinations a node counts only when the path
                  has length k. For subsets{" "}
                  <strong>the path itself is already an answer</strong> — the empty
                  set, {"{1}"}, {"{1,2}"}, all of them. So subsets and combinations{" "}
                  <strong>share the same startIndex tree</strong>, and differ in one
                  thing only: <strong>when you record</strong>.
                </>
              }
              zh={
                <>
                  <b>题意:</b>返回一个元素互不相同的数组的<b>所有子集</b>(幂集),包括空集和它自己。
                  <b>关键洞察:</b>组合只有在路径长度等于 k 时才算一个答案;子集则是
                  <strong>路径本身就是一个答案</strong> —— 空集、{"{1}"}、{"{1,2}"} 全都要。
                  所以子集和组合<strong>共用同一棵 startIndex 决策树</strong>,
                  差别只有一处:<strong>什么时候收集</strong>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Combinations record at the <b>leaves</b>. Subsets record at{" "}
                  <b>every node</b>, on entry, before the loop starts, because the
                  path that leads to any node is itself a valid subset. In the
                  animation every node turns green as it is recorded:
                </>
              }
              zh={
                <>
                  组合在<b>叶子</b>收(路径满 k 个);子集在<b>每一个节点</b>收 ——
                  刚进函数、还没进循环时就收一次,因为通向任何节点的那条路径本身就是一个合法子集。
                  看动画,每个节点都会变绿(被收进答案):
                </>
              }
            />
          </p>
        </div>
        <SubsetTree />
        <CodeTabs
          title="lc78_subsets"
          java={{
            code: {
              en: `class Solution {
    private final List<List<Integer>> res = new ArrayList<>();
    private final List<Integer> path = new ArrayList<>();

    public List<List<Integer>> subsets(int[] nums) {
        backtrack(nums, 0);
        return res;
    }

    private void backtrack(int[] nums, int start) {
        res.add(new ArrayList<>(path));   // record on entry, empty set included
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, i + 1);
            path.remove(path.size() - 1);
        }
    }
}`,
              zh: `class Solution {
    private final List<List<Integer>> res = new ArrayList<>();
    private final List<Integer> path = new ArrayList<>();

    public List<List<Integer>> subsets(int[] nums) {
        backtrack(nums, 0);
        return res;
    }

    private void backtrack(int[] nums, int start) {
        res.add(new ArrayList<>(path));   // 一进节点就收,空集也算
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, i + 1);
            path.remove(path.size() - 1);
        }
    }
}`,
            },
            hl: [11],
            note: {
              en: (
                <>
                  The recording line sits <b>before the loop and there is no return
                  </b>: each node records itself, then expands. The loop ends by
                  itself when <code>start</code> passes the end of the array, so no
                  separate stop condition is needed.
                </>
              ),
              zh: (
                <>
                  收集那行放在<b>循环之前,而且没有 return</b>:每个节点先收自己,再往下扩展。
                  <code>start</code> 越过数组末尾时循环自然停下,不需要另写结束条件。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def subsets(self, nums: list[int]) -> list[list[int]]:
        res, path = [], []

        def backtrack(start: int) -> None:
            res.append(path[:])            # record at every node
            for i in range(start, len(nums)):
                path.append(nums[i])
                backtrack(i + 1)
                path.pop()

        backtrack(0)
        return res`,
              zh: `class Solution:
    def subsets(self, nums: list[int]) -> list[list[int]]:
        res, path = [], []

        def backtrack(start: int) -> None:
            res.append(path[:])            # 每个节点都收
            for i in range(start, len(nums)):
                path.append(nums[i])
                backtrack(i + 1)
                path.pop()

        backtrack(0)
        return res`,
            },
            hl: [6],
            note: {
              en: (
                <>
                  There is no &quot;path is full&quot; return here; the first line of
                  the function records a copy of the current path. An equivalent
                  formulation is a binary &quot;take it or skip it&quot; tree, but the
                  startIndex version matches the rest of this chapter.
                </>
              ),
              zh: (
                <>
                  这里没有「凑够 k 个」的 return,函数第一行就收当前 path 的拷贝。
                  等价写法是「选 / 不选」的二叉树,但 startIndex 版和本章其余部分一致。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var subsets = function (nums) {
  const res = [], path = [];
  const backtrack = (start) => {
    res.push([...path]);                  // record at every node
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1);
      path.pop();
    }
  };
  backtrack(0);
  return res;
};`,
              zh: `var subsets = function (nums) {
  const res = [], path = [];
  const backtrack = (start) => {
    res.push([...path]);                  // 每个节点都收
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1);
      path.pop();
    }
  };
  backtrack(0);
  return res;
};`,
            },
            hl: [4],
            note: {
              en: (
                <>
                  The only code difference from LC 77 is that the recording moved from
                  &quot;if the path has k elements&quot; to the first line of the
                  function. One skeleton, two problems.
                </>
              ),
              zh: (
                <>
                  和 77 唯一的代码差别就是:收集从「if 满 k 个」挪到了函数第一行。
                  一个骨架,两道题。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{ en: "Complexity and follow-up questions", zh: "复杂度 & 面试追问" }}
        >
          <p>
            <T
              en={
                <>
                  The tree has 2ⁿ nodes, where n is the number of elements, and every
                  node copies a path of length at most n. Time is{" "}
                  <b>O(n · 2ⁿ)</b>, space is <b>O(n)</b> for the path and the
                  recursion, not counting the output, which is itself O(n · 2ⁿ).
                  Follow-ups: (1) &quot;duplicate values?&quot; → <b>LC 90</b>, sort
                  and skip at the same level (§08); (2) &quot;increasing subsequences
                  only, and sorting is not allowed?&quot; → <b>LC 491</b>, use one set
                  per level instead; (3) &quot;without recursion?&quot; → enumerate
                  the integers 0..2ⁿ−1 and read bit j as &quot;element j is
                  included&quot; (chapter 04 covers using one integer as a set).
                </>
              }
              zh={
                <>
                  树有 2ⁿ 个节点(n 是元素个数),每个节点复制一条长度不超过 n 的路径。
                  时间 <b>O(n · 2ⁿ)</b>,空间 <b>O(n)</b>(路径 + 递归深度,不算输出;
                  输出本身就是 O(n · 2ⁿ))。追问:①「数组有重复值?」→ <b>LC 90</b>,
                  排序 + 同层跳过(§08);②「只要递增子序列、而且不能排序?」→ <b>LC 491</b>,
                  改用「每层一个 set」;③「能不能不用递归?」→ 枚举整数 0..2ⁿ−1,
                  第 j 位为 1 表示选第 j 个元素(第 04 章讲过「用一个整数表示集合」)。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 精讲 C · LC 46 全排列 ================= */}
      <Section
        id="permute"
        index="07"
        title={{
          en: "Featured problem C · LC 46 Permutations: startIndex fails, use a used array",
          zh: "精讲 C · LC 46 全排列:startIndex 失灵,改用 used 数组",
        }}
        desc={{
          en: "Order matters here, so [1,2] and [2,1] are two different answers. Every level must be able to reach back.",
          zh: "排列讲顺序,[1,2] 和 [2,1] 是两个答案 —— 每一层都要能回头选前面的数",
        }}
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>Problem:</b> return <b>all permutations</b> of an array whose
                  elements are distinct. <b>The difference from combinations:</b>{" "}
                  order matters, so [1,2] and [2,1] are{" "}
                  <strong>two different answers</strong>. That makes the
                  &quot;only move forward&quot; startIndex{" "}
                  <strong>wrong here</strong>: in [2,1] the 1 comes after the 2, so a
                  forward-only search can never build it, and most of the answers go
                  missing.
                </>
              }
              zh={
                <>
                  <b>题意:</b>返回一个元素互不相同的数组的<b>所有排列</b>。
                  <b>和组合的根本区别:</b>排列<strong>讲顺序</strong>,[1,2] 和 [2,1] 是
                  <strong>两个不同的答案</strong>。这让「只往后选」的 startIndex
                  <strong>在这里直接是错的</strong> —— [2,1] 里的 1 排在 2 之后,
                  只往后选就永远建不出它,答案会漏掉一大半。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  A permutation needs every level to reach{" "}
                  <strong>every element that is not already on the path</strong>,
                  including smaller ones. How do you know which ones are on the path?
                  Keep a <strong>boolean array called used</strong>:{" "}
                  <span className="mono">used[i] = true</span> means element i is
                  currently on the path, and this level skips it. Watch used light up
                  on a choose and go dark on an un-choose:
                </>
              }
              zh={
                <>
                  排列需要的是:每一层都能选到<strong>所有还不在路径上的元素</strong>,
                  包括比当前小的。怎么知道哪些在路径上?用一个 <strong>used 布尔数组</strong>记账:
                  <span className="mono">used[i] = true</span> 表示第 i 个元素此刻在路径里,
                  这一层就跳过它。看 used 怎么随「做选择」点亮、随「撤销」熄灭:
                </>
              }
            />
          </p>
        </div>
        <PermuteLab />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  Notice that the un-choose{" "}
                  <strong>restores two pieces of state, used and path</strong>. That
                  is the extra trap permutations add on top of combinations. The loop
                  starts from <span className="mono">i = 0</span> at every level,
                  never from a start index, and used does the filtering:
                </>
              }
              zh={
                <>
                  注意撤销时<strong>要还原两处状态:used 和 path</strong> ——
                  这是排列比组合多出来的一个坑。循环每一层都从{" "}
                  <span className="mono">i = 0</span> 开始,不用 start,靠 used 过滤:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc46_permute"
          java={{
            code: {
              en: `class Solution {
    private final List<List<Integer>> res = new ArrayList<>();
    private final List<Integer> path = new ArrayList<>();

    public List<List<Integer>> permute(int[] nums) {
        boolean[] used = new boolean[nums.length];
        backtrack(nums, used);
        return res;
    }

    private void backtrack(int[] nums, boolean[] used) {
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < nums.length; i++) {  // every level starts at 0
            if (used[i]) continue;               // skip what is on the path
            used[i] = true;  path.add(nums[i]);
            backtrack(nums, used);
            used[i] = false; path.remove(path.size() - 1);
        }
    }
}`,
              zh: `class Solution {
    private final List<List<Integer>> res = new ArrayList<>();
    private final List<Integer> path = new ArrayList<>();

    public List<List<Integer>> permute(int[] nums) {
        boolean[] used = new boolean[nums.length];
        backtrack(nums, used);
        return res;
    }

    private void backtrack(int[] nums, boolean[] used) {
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < nums.length; i++) {  // 每层都从 0 开始
            if (used[i]) continue;               // 跳过已在路径上的
            used[i] = true;  path.add(nums[i]);
            backtrack(nums, used);
            used[i] = false; path.remove(path.size() - 1);
        }
    }
}`,
            },
            hl: [16, 17],
            note: {
              en: (
                <>
                  The last line undoes <b>both</b> changes:{" "}
                  <code>used[i] = false</code> and{" "}
                  <code>path.remove(...)</code>. Leaving out the first one makes later
                  branches believe that element is still taken, and answers go
                  missing.
                </>
              ),
              zh: (
                <>
                  最后一行<b>两处状态一起撤销</b>:<code>used[i] = false</code> 和{" "}
                  <code>path.remove(...)</code>。漏掉前者,后面的分支会以为这个元素还占着,导致漏解。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def permute(self, nums: list[int]) -> list[list[int]]:
        res, path = [], []
        used = [False] * len(nums)

        def backtrack() -> None:
            if len(path) == len(nums):
                res.append(path[:])
                return
            for i in range(len(nums)):     # every level starts at 0
                if used[i]:
                    continue               # skip what is on the path
                used[i] = True; path.append(nums[i])
                backtrack()
                used[i] = False; path.pop()  # undo both changes

        backtrack()
        return res`,
              zh: `class Solution:
    def permute(self, nums: list[int]) -> list[list[int]]:
        res, path = [], []
        used = [False] * len(nums)

        def backtrack() -> None:
            if len(path) == len(nums):
                res.append(path[:])
                return
            for i in range(len(nums)):     # 每层都从 0 开始
                if used[i]:
                    continue               # 跳过已在路径上的
                used[i] = True; path.append(nums[i])
                backtrack()
                used[i] = False; path.pop()  # 两处状态一起撤销

        backtrack()
        return res`,
            },
            hl: [10, 11, 12],
            note: {
              en: (
                <>
                  A shorter Python version writes{" "}
                  <code>for x in nums: if x in path: continue</code> and drops used.
                  It is correct only when the values are distinct, and{" "}
                  <code>in</code> scans the list in O(n) while{" "}
                  <code>used[i]</code> is O(1). Prefer used.
                </>
              ),
              zh: (
                <>
                  Python 里有个更短的写法:<code>for x in nums: if x in path: continue</code>,
                  省掉 used。但它只在元素互不相同时才正确,而且 <code>in</code> 是 O(n) 扫描,
                  <code>used[i]</code> 是 O(1)。优先用 used。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var permute = function (nums) {
  const res = [], path = [], used = Array(nums.length).fill(false);
  const backtrack = () => {
    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {  // every level starts at 0
      if (used[i]) continue;                 // skip what is on the path
      used[i] = true; path.push(nums[i]);
      backtrack();
      used[i] = false; path.pop();           // undo both changes
    }
  };
  backtrack();
  return res;
};`,
              zh: `var permute = function (nums) {
  const res = [], path = [], used = Array(nums.length).fill(false);
  const backtrack = () => {
    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {  // 每层都从 0 开始
      if (used[i]) continue;                 // 跳过已在路径上的
      used[i] = true; path.push(nums[i]);
      backtrack();
      used[i] = false; path.pop();           // 两处状态一起撤销
    }
  };
  backtrack();
  return res;
};`,
            },
            hl: [8, 9],
            note: {
              en: (
                <>
                  <code>Array(n).fill(false)</code> creates used. Do not write{" "}
                  <code>Array(n)</code> without <code>fill</code>: that array has
                  empty slots, <code>used[i]</code> reads as{" "}
                  <code>undefined</code>, and the code happens to work while meaning
                  something unclear.
                </>
              ),
              zh: (
                <>
                  用 <code>Array(n).fill(false)</code> 建 used。别写不带 <code>fill</code> 的{" "}
                  <code>Array(n)</code> —— 那是一个带空槽的数组,<code>used[i]</code> 读出来是{" "}
                  <code>undefined</code>,碰巧能跑,但语义不清。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="warn"
          title={{ en: "Two mistakes people make with permutations", zh: "排列最常见的两个错" }}
        >
          <p>
            <T
              en={
                <>
                  (1) <b>Copying the startIndex from combinations.</b> Then [2,1] and
                  [3,1] are never produced. That is missing answers, not slow code.
                  Every level of a permutation must scan from 0. (2){" "}
                  <b>Undoing path but forgetting used.</b> One element stays marked as
                  taken forever, and every permutation that needed it disappears.
                  Remember that the undo here has <b>two halves</b>.
                </>
              }
              zh={
                <>
                  ① <b>照抄组合的 startIndex。</b>结果 [2,1]、[3,1] 全出不来 ——
                  这是漏解,不是慢。排列每一层都必须从 0 扫。
                  ② <b>只撤销 path、忘了 used。</b>某个元素被永久标成「已占用」,
                  所有需要它的排列全丢。记住这里的撤销是<b>成对</b>的。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="win"
          title={{ en: "Complexity and follow-up questions", zh: "复杂度 & 面试追问" }}
        >
          <p>
            <T
              en={
                <>
                  The tree has n! leaves, where n is the number of elements; interior
                  nodes add a constant factor. Each leaf copies a path of length n, so
                  time is <b>O(n · n!)</b> and space is <b>O(n)</b> for the path,
                  used, and the recursion, not counting the output. Follow-ups: (1)
                  &quot;duplicate values?&quot; → <b>LC 47</b>, sort and add{" "}
                  <code>!used[i-1]</code> (§08); (2) &quot;permutations of a
                  string?&quot; → the same used array over characters; (3) &quot;can
                  you avoid the used array?&quot; → yes, by swapping elements in place
                  to generate permutations, which saves the array but is harder to
                  read and does not handle duplicates by itself.
                </>
              }
              zh={
                <>
                  树有 n! 个叶子(n 是元素个数),内部节点只多出一个常数倍。
                  每个叶子复制一条长度为 n 的路径,所以时间 <b>O(n · n!)</b>,
                  空间 <b>O(n)</b>(路径 + used + 递归深度,不算输出)。
                  追问:①「数组有重复值?」→ <b>LC 47</b>,排序 + 加上{" "}
                  <code>!used[i-1]</code>(§08);②「求字符串的排列?」→ 同一套 used,只是换成字符;
                  ③「能不能不用 used 数组?」→ 可以,用「交换法」原地生成排列,省掉数组,
                  但可读性差些,而且它自己不处理重复元素。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §08 去重两板斧 ================= */}
      <Section
        id="dedup"
        index="08"
        title={{
          en: "Duplicate values: skip at the same level, keep along the path",
          zh: "去重两板斧:树层去重 vs 树枝去重",
        }}
        desc={{
          en: "When the input contains repeated values, how do you keep the answers unique? This is the part people get wrong most often.",
          zh: "当数组里有重复元素,如何让答案不重复?这是回溯最容易出错的一处",
        }}
        badge={
          <span className="chip" data-tone="warn">
            <T en="Frequent interview topic" zh="高频考点" />
          </span>
        }
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The problems so far (77 / 78 / 46) all assumed{" "}
                  <strong>distinct elements</strong>. As soon as a value repeats — for
                  example [1,1,2] — <strong>duplicate answers</strong> appear. Look at
                  the symptom first: all subsets of [1,1,2], with no special handling:
                </>
              }
              zh={
                <>
                  前面的题(77 / 78 / 46)都假设元素<strong>互不相同</strong>。
                  一旦有重复值 —— 比如 [1,1,2] —— 就会冒出<strong>重复答案</strong>。
                  先看症状:不做任何处理,求 [1,1,2] 的所有子集会怎样?
                </>
              }
            />
          </p>
        </div>
        <DupSubsetTree />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  {"{1}"} appears twice and so does {"{1,2}"}. The cause, in one
                  sentence:{" "}
                  <strong>inside the same loop, the second 1 opened a branch identical
                  to the one the first 1 already opened</strong>. The fix is to{" "}
                  <strong>sort first</strong>, so equal values sit next to each other,
                  and then, inside the loop,{" "}
                  <strong>skip a value that equals the previous one</strong>. With
                  that rule the duplicate branch is{" "}
                  <strong>never entered</strong>:
                </>
              }
              zh={
                <>
                  {"{1}"} 出现了两次,{"{1,2}"} 也出现了两次。病根一句话:
                  <strong>在同一个循环里,第二个 1 又开了一条和第一个 1 完全相同的分支</strong>。
                  治法是<strong>先排序</strong>,让相同的值相邻,然后在循环里
                  <strong>跳过和前一个相等的值</strong>。加上这条规则,那条重复分支
                  <strong>一步都不会走</strong>:
                </>
              }
            />
          </p>
        </div>
        <DedupSubsetTree />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  For combinations and subsets, which have a startIndex, the rule is
                  written{" "}
                  <span className="mono">i &gt; start &amp;&amp; nums[i] == nums[i-1]</span>
                  . Note that it is{" "}
                  <strong>i &gt; start, not i &gt; 0</strong>:
                </>
              }
              zh={
                <>
                  组合和子集有 startIndex,规则写成
                  <span className="mono"> i &gt; start &amp;&amp; nums[i] == nums[i-1]</span>。
                  注意是 <strong>i &gt; start,不是 i &gt; 0</strong>:
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Here is why it is correct. After sorting, equal values are adjacent.
                  At one node the loop tries index start, start+1, … as{" "}
                  <b>the next element of the path</b>. Two indexes holding the same
                  value leave <b>the same remaining choices</b> below them, so they
                  generate <b>identical subtrees</b>: every answer found under the
                  second one was already found under the first.{" "}
                  <b>i &gt; start keeps the first index of each run of equal values at
                  this node and skips the rest</b>, so each distinct value is tried
                  once per node.
                </>
              }
              zh={
                <>
                  为什么这样是对的。排序之后,相等的值必然相邻。在一个节点上,
                  循环依次拿下标 start、start+1、…… 当作<b>路径的下一个元素</b>。
                  两个下标如果值相同,它们下面<b>剩下的可选项完全一样</b>,
                  于是会长出<b>一模一样的子树</b> —— 第二个下标下面找到的每个答案,
                  第一个下标下面早就找到过了。
                  <b>i &gt; start 保留这个节点上每一段相等值的第一个下标,跳过后面的</b>,
                  于是每个不同的值在每个节点上只被试一次。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  And here is why it does not remove valid answers. The condition only
                  compares an index with its <b>sibling</b> in the same loop.{" "}
                  <span className="mono">i == start</span> is the{" "}
                  <b>first</b> choice at this node and always passes. A deeper call
                  receives <span className="mono">start = i + 1</span>, so a value
                  equal to the one just taken arrives at the deeper node{" "}
                  <b>at position start</b> and passes the test there. That is exactly
                  why {"{1,1}"} survives while a second {"{1}"} branch does not.
                  Writing <span className="mono">i &gt; 0</span> instead would also
                  compare across levels and would delete {"{1,1}"}.
                </>
              }
              zh={
                <>
                  再看它为什么不会误杀合法答案。这个条件比较的只是<b>同一个循环里的兄弟下标</b>。
                  <span className="mono">i == start</span> 是这个节点的<b>第一个</b>选择,
                  永远通过。更深一层的调用收到的是 <span className="mono">start = i + 1</span>,
                  所以和刚才那个值相等的元素,在更深的节点上正好落在
                  <b>下标 start 的位置</b>,在那里照样通过。这正是 {"{1,1}"} 保得住、
                  而第二条 {"{1}"} 分支保不住的原因。若写成{" "}
                  <span className="mono">i &gt; 0</span>,比较就会跨层进行,{"{1,1}"} 会被删掉。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc90_subsets_ii_dedup"
          java={{
            code: {
              en: `// call Arrays.sort(nums) first, so equal values are adjacent
private void backtrack(int[] nums, int start) {
    res.add(new ArrayList<>(path));                 // subsets: record at every node
    for (int i = start; i < nums.length; i++) {
        if (i > start && nums[i] == nums[i - 1])    // same level, same value:
            continue;                               //   this subtree was built already
        path.add(nums[i]);
        backtrack(nums, i + 1);
        path.remove(path.size() - 1);
    }
}`,
              zh: `// 调用前先 Arrays.sort(nums),让相同的值相邻
private void backtrack(int[] nums, int start) {
    res.add(new ArrayList<>(path));                 // 子集:每个节点都收
    for (int i = start; i < nums.length; i++) {
        if (i > start && nums[i] == nums[i - 1])    // 同一层、同一个值:
            continue;                               //   这棵子树已经建过了
        path.add(nums[i]);
        backtrack(nums, i + 1);
        path.remove(path.size() - 1);
    }
}`,
            },
            hl: [5, 6],
            note: {
              en: (
                <>
                  <b>
                    It is <code>i &gt; start</code>, not <code>i &gt; 0</code>.
                  </b>{" "}
                  The first form compares siblings only. <code>i &gt; 0</code> also
                  compares an element with the one the parent took, which deletes
                  legitimate answers such as {"{1,1}"}.
                </>
              ),
              zh: (
                <>
                  <b>
                    是 <code>i &gt; start</code>,不是 <code>i &gt; 0</code>。
                  </b>
                  前者只比较兄弟下标;<code>i &gt; 0</code> 还会把当前元素和父节点取走的那个比,
                  从而删掉 {"{1,1}"} 这种合法答案。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `# call nums.sort() first, so equal values are adjacent
def backtrack(start):
    res.append(path[:])                       # subsets: record at every node
    for i in range(start, len(nums)):
        if i > start and nums[i] == nums[i - 1]:  # same level, same value
            continue                              #   skip the repeat
        path.append(nums[i])
        backtrack(i + 1)
        path.pop()`,
              zh: `# 调用前先 nums.sort(),让相同的值相邻
def backtrack(start):
    res.append(path[:])                       # 子集:每个节点都收
    for i in range(start, len(nums)):
        if i > start and nums[i] == nums[i - 1]:  # 同一层、同一个值
            continue                              #   跳过这个重复
        path.append(nums[i])
        backtrack(i + 1)
        path.pop()`,
            },
            hl: [5, 6],
            note: {
              en: (
                <>
                  <b>Sorting is a precondition.</b> Without it, equal values are not
                  adjacent and &quot;compare with the previous element&quot; proves
                  nothing. LC 491 must keep the original order, so it cannot sort and
                  uses one set per level instead.
                </>
              ),
              zh: (
                <>
                  <b>排序是前提。</b>不排序,相同的值不相邻,「和前一个比」就什么也证明不了。
                  LC 491 必须保持原顺序,不能排序,于是改用「每层一个 set」。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// call nums.sort((a, b) => a - b) first, so equal values are adjacent
function backtrack(start) {
  res.push([...path]);                        // subsets: record at every node
  for (let i = start; i < nums.length; i++) {
    if (i > start && nums[i] === nums[i - 1]) continue; // same level, same value
    path.push(nums[i]);
    backtrack(i + 1);
    path.pop();
  }
}`,
              zh: `// 调用前先 nums.sort((a, b) => a - b),让相同的值相邻
function backtrack(start) {
  res.push([...path]);                        // 子集:每个节点都收
  for (let i = start; i < nums.length; i++) {
    if (i > start && nums[i] === nums[i - 1]) continue; // 同一层、同一个值
    path.push(nums[i]);
    backtrack(i + 1);
    path.pop();
  }
}`,
            },
            hl: [5],
            note: {
              en: (
                <>
                  JavaScript sorts by string by default. Numbers need{" "}
                  <code>sort((a, b) =&gt; a - b)</code>; otherwise [10, 2, 1] becomes
                  [1, 10, 2] and equal values may not end up adjacent.
                </>
              ),
              zh: (
                <>
                  JavaScript 默认按字符串排序。数字必须写{" "}
                  <code>sort((a, b) =&gt; a - b)</code>,否则 [10, 2, 1] 会被排成 [1, 10, 2],
                  相同的值不一定相邻。
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
                  Permutations (LC 47) have no startIndex, so the rule is written{" "}
                  <span className="mono">
                    i &gt; 0 &amp;&amp; nums[i] == nums[i-1] &amp;&amp; !used[i-1]
                  </span>
                  . The value of <span className="mono">used[i-1]</span> tells you
                  which of the two situations you are in:
                </>
              }
              zh={
                <>
                  排列(LC 47)没有 startIndex,规则写成
                  <span className="mono">
                    {" "}
                    i &gt; 0 &amp;&amp; nums[i] == nums[i-1] &amp;&amp; !used[i-1]
                  </span>
                  。<span className="mono">used[i-1]</span> 的真假,正好区分两种情形:
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
                  <T en="Value of used[i-1]" zh="看 used[i-1]" />
                </th>
                <th>
                  <T en="What it means in the tree" zh="在树上的含义" />
                </th>
                <th>
                  <T en="Skip?" zh="要不要跳过" />
                </th>
                <th>
                  <T en="Why" zh="为什么" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b className="mono">!used[i-1]</b>
                  <br />
                  <T
                    en={<>(the equal element was already undone)</>}
                    zh={<>(前一个相同值<b>已撤销</b>)</>}
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <b>Same level.</b> The first 1 was tried at this node and
                        undone; now the second 1 is up.
                      </>
                    }
                    zh={
                      <>
                        <b>同一层</b>:第一个 1 在这个节点上试完并撤销了,现在轮到第二个 1。
                      </>
                    }
                  />
                </td>
                <td>
                  <span style={{ color: "var(--risk)" }}>
                    <T en="Skip" zh="✂️ 跳过" />
                  </span>
                </td>
                <td>
                  <T
                    en={
                      <>
                        Two equal values at one node build identical subtrees, so the
                        second one only repeats answers.
                      </>
                    }
                    zh={<>同一个节点上两个相同的值会长出一模一样的子树,第二个只会重复答案。</>}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b className="mono">used[i-1]</b>
                  <br />
                  <T
                    en={<>(the equal element is still on the path)</>}
                    zh={<>(前一个相同值<b>还在路径上</b>)</>}
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <b>Along the path.</b> The first 1 is an ancestor; this level
                        is appending the second 1 after it.
                      </>
                    }
                    zh={
                      <>
                        <b>沿路径方向</b>:第一个 1 是祖先节点,这一层是在它后面再接第二个 1。
                      </>
                    }
                  />
                </td>
                <td>
                  <span style={{ color: "var(--ok)" }}>
                    <T en="Keep" zh="✅ 保留" />
                  </span>
                </td>
                <td>
                  <T
                    en={<>This is the real permutation [1,1]; removing it loses answers.</>}
                    zh={<>这是 [1,1] 这种真实存在的排列,剪掉就漏解了。</>}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="deep"
          title={{ en: "Both rules chase the same goal", zh: "两块板斧,其实是同一件事" }}
        >
          <p>
            <T
              en={
                <>
                  Do not let the two names confuse you. Both express{" "}
                  <b>one rule: never pick two equal values at the same node</b>.
                  Combinations and subsets have a startIndex, so{" "}
                  <code>i &gt; start</code> already means &quot;same node&quot;.
                  Permutations have no startIndex, so{" "}
                  <code>!used[i-1]</code> is used to ask &quot;was the equal value
                  just tried and undone at this node?&quot;. Using{" "}
                  <code>used[i-1]</code> instead <b>also produces correct answers</b>{" "}
                  — it forces duplicates to be taken in the opposite index order — but
                  it discovers the repetition deeper in the tree, so it prunes later
                  and runs slower. The standard form is <code>!used[i-1]</code>.
                </>
              }
              zh={
                <>
                  别被两个名字绕晕。它们表达的是<b>同一条规则:同一个节点上不要选两个相同的值</b>。
                  组合、子集有 startIndex,所以 <code>i &gt; start</code> 本身就表示「同一个节点」;
                  排列没有 startIndex,只能用 <code>!used[i-1]</code> 去问
                  「那个相同的值是不是刚在这个节点上试完并撤销了」。
                  换成 <code>used[i-1]</code> <b>同样能得到正确答案</b> ——
                  它只是强制按相反的下标顺序取重复值 —— 但它要到更深的地方才发现重复,
                  剪得更晚、更慢。所以标准写法是 <code>!used[i-1]</code>。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §09 精讲 D · LC 51 N 皇后 ================= */}
      <Section
        id="board"
        index="09"
        title={{
          en: "Featured problem D · LC 51 N-Queens: the decision tree on a board",
          zh: "精讲 D · LC 51 N 皇后:决策树长在棋盘上",
        }}
        desc={{
          en: "Rows become the levels of the tree and columns become the choices at each level.",
          zh: "把「行」当决策树的层,把「列」当每层的选择 —— 回溯从一维走向二维",
        }}
        badge={<span className="lc-badge" data-d="hard">HARD</span>}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>Problem:</b> place n queens on an n×n board so that no two share
                  a <strong>row, a column, or a diagonal</strong>, and return every
                  arrangement. <b>Building the tree:</b> a valid board has exactly one
                  queen per row, otherwise two would share a row. So{" "}
                  <strong>the row number is the level of the tree and the column is
                  the choice at that level</strong>. dfs(row) tries every column in
                  row <i>row</i>; if the square is safe it recurses into row+1;
                  reaching row n means all rows are filled and one solution is
                  complete.
                </>
              }
              zh={
                <>
                  <b>题意:</b>在 n×n 棋盘上放 n 个皇后,使任意两个都<strong>不同行、不同列、
                  不在同一条对角线</strong>,返回所有摆法。<b>建树:</b>合法棋盘每行恰好一个皇后,
                  否则就会同行冲突。所以<strong>行号就是树的层,列号就是这一层的选择</strong>。
                  dfs(row) 在第 row 行逐列尝试,格子安全就递归到 row+1;
                  row 到达 n,说明所有行都放满了,一个解就完成了。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The work is in the <strong>safety check</strong>: before placing at
                  (row, col) you must know that no queen above attacks it — same
                  column, same &quot;\&quot; diagonal, or same &quot;/&quot; diagonal.
                  Place a 4×4 board yourself below; watch the red conflicts and the{" "}
                  <b>dead end that forces a step back</b>:
                </>
              }
              zh={
                <>
                  力气花在<strong>安全检查</strong>上:在 (row, col) 落子之前,
                  要确认上方没有皇后能攻击它 —— 同列、同「\」对角线、同「/」对角线。
                  下面亲手放一遍 4×4,注意红色的冲突,以及<b>死胡同逼着你退回上一行</b>:
                </>
              }
            />
          </p>
        </div>
        <NQueensBoard />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            <T
              en={
                <>
                  Those moments where a whole row has no safe square, so the queen in
                  the row above has to move, are backtracking on a board. The safety
                  check can be made <strong>O(1)</strong> with three sets that record
                  which columns and which diagonals already hold a queen. Why do{" "}
                  <span className="mono">row − col</span> and{" "}
                  <span className="mono">row + col</span> identify a diagonal? Along a
                  &quot;\&quot; diagonal, moving one square down-right adds 1 to both
                  row and col, so{" "}
                  <strong>
                    <span className="mono">row − col</span> stays the same
                  </strong>
                  . Along a &quot;/&quot; diagonal, moving one square down-left adds 1
                  to row and subtracts 1 from col, so{" "}
                  <strong>
                    <span className="mono">row + col</span> stays the same
                  </strong>
                  . Each value therefore names exactly one diagonal.
                </>
              }
              zh={
                <>
                  动画里那几次「整行都放不下,只好把上一行的皇后挪走」,就是回溯在棋盘上的样子。
                  安全检查可以做到 <strong>O(1)</strong>:用三个集合记住哪些列、哪些对角线上已经有皇后。
                  为什么 <span className="mono">row − col</span> 和{" "}
                  <span className="mono">row + col</span> 能标识一条对角线?
                  沿「\」对角线向右下走一格,row 和 col 各加 1,所以
                  <strong>
                    <span className="mono">row − col</span> 恒定
                  </strong>
                  ;沿「/」对角线向左下走一格,row 加 1、col 减 1,所以
                  <strong>
                    <span className="mono">row + col</span> 恒定
                  </strong>
                  。因此每一个值都唯一对应一条对角线。
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="lc51_n_queens"
          java={{
            code: {
              en: `class Solution {
    private List<List<String>> res = new ArrayList<>();
    private int n;
    private int[] queens;          // queens[r] = column of the queen in row r
    private boolean[] col, diag1, diag2;

    public List<List<String>> solveNQueens(int n) {
        this.n = n;
        queens = new int[n];
        col = new boolean[n];
        diag1 = new boolean[2 * n];  // "\\" diagonals, indexed by r - c + n
        diag2 = new boolean[2 * n];  // "/" diagonals, indexed by r + c
        backtrack(0);
        return res;
    }

    private void backtrack(int r) {
        if (r == n) { res.add(build()); return; }
        for (int c = 0; c < n; c++) {
            int d1 = r - c + n, d2 = r + c;
            if (col[c] || diag1[d1] || diag2[d2]) continue;  // attacked: skip
            queens[r] = c;
            col[c] = diag1[d1] = diag2[d2] = true;   // 1. choose
            backtrack(r + 1);                        // 2. recurse
            col[c] = diag1[d1] = diag2[d2] = false;  // 3. un-choose
        }
    }

    private List<String> build() {
        List<String> board = new ArrayList<>();
        for (int r = 0; r < n; r++) {
            char[] row = new char[n];
            Arrays.fill(row, '.');
            row[queens[r]] = 'Q';
            board.add(new String(row));
        }
        return board;
    }
}`,
              zh: `class Solution {
    private List<List<String>> res = new ArrayList<>();
    private int n;
    private int[] queens;          // queens[r] = 第 r 行皇后所在的列
    private boolean[] col, diag1, diag2;

    public List<List<String>> solveNQueens(int n) {
        this.n = n;
        queens = new int[n];
        col = new boolean[n];
        diag1 = new boolean[2 * n];  // 「\\」对角线,下标用 r - c + n
        diag2 = new boolean[2 * n];  // 「/」对角线,下标用 r + c
        backtrack(0);
        return res;
    }

    private void backtrack(int r) {
        if (r == n) { res.add(build()); return; }
        for (int c = 0; c < n; c++) {
            int d1 = r - c + n, d2 = r + c;
            if (col[c] || diag1[d1] || diag2[d2]) continue;  // 被攻击,跳过
            queens[r] = c;
            col[c] = diag1[d1] = diag2[d2] = true;   // 1. 做选择
            backtrack(r + 1);                        // 2. 递归
            col[c] = diag1[d1] = diag2[d2] = false;  // 3. 撤销选择
        }
    }

    private List<String> build() {
        List<String> board = new ArrayList<>();
        for (int r = 0; r < n; r++) {
            char[] row = new char[n];
            Arrays.fill(row, '.');
            row[queens[r]] = 'Q';
            board.add(new String(row));
        }
        return board;
    }
}`,
            },
            hl: [21],
            note: {
              en: (
                <>
                  <code>r - c</code> ranges from −(n−1) to n−1, so it cannot be an
                  array index directly; <b>adding n</b> shifts it into 1..2n−1. The
                  three boolean arrays turn the safety check from a scan over previous
                  rows, which is O(n), into <b>O(1)</b>.
                </>
              ),
              zh: (
                <>
                  <code>r - c</code> 的取值是 −(n−1) 到 n−1,不能直接当数组下标;
                  <b>加上 n</b> 把它平移到 1..2n−1。三个布尔数组把安全检查从
                  「扫一遍上面所有行」的 O(n) 降到 <b>O(1)</b>。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def solveNQueens(self, n: int) -> list[list[str]]:
        res = []
        queens = [-1] * n
        col, diag1, diag2 = set(), set(), set()   # columns / r-c / r+c

        def backtrack(r: int) -> None:
            if r == n:
                res.append(["." * c + "Q" + "." * (n - c - 1) for c in queens])
                return
            for c in range(n):
                if c in col or (r - c) in diag1 or (r + c) in diag2:
                    continue                       # attacked: skip
                queens[r] = c
                col.add(c); diag1.add(r - c); diag2.add(r + c)   # 1. choose
                backtrack(r + 1)                                 # 2. recurse
                col.discard(c); diag1.discard(r - c); diag2.discard(r + c)  # 3. undo

        backtrack(0)
        return res`,
              zh: `class Solution:
    def solveNQueens(self, n: int) -> list[list[str]]:
        res = []
        queens = [-1] * n
        col, diag1, diag2 = set(), set(), set()   # 列 / r-c / r+c

        def backtrack(r: int) -> None:
            if r == n:
                res.append(["." * c + "Q" + "." * (n - c - 1) for c in queens])
                return
            for c in range(n):
                if c in col or (r - c) in diag1 or (r + c) in diag2:
                    continue                       # 被攻击,跳过
                queens[r] = c
                col.add(c); diag1.add(r - c); diag2.add(r + c)   # 1. 做选择
                backtrack(r + 1)                                 # 2. 递归
                col.discard(c); diag1.discard(r - c); diag2.discard(r + c)  # 3. 撤销

        backtrack(0)
        return res`,
            },
            hl: [12, 13],
            note: {
              en: (
                <>
                  Python stores the diagonals in a <code>set</code>, so a negative key
                  is fine and no <code>+ n</code> shift is needed. The list
                  comprehension builds each row as{" "}
                  <code>&quot;.&quot; * c + &quot;Q&quot; + &quot;.&quot; * (n-c-1)</code>.
                </>
              ),
              zh: (
                <>
                  Python 用 <code>set</code> 存对角线,负数当 key 也没问题,不需要{" "}
                  <code>+ n</code> 平移。列表推导把每一行拼成{" "}
                  <code>&quot;.&quot; * c + &quot;Q&quot; + &quot;.&quot; * (n-c-1)</code>。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var solveNQueens = function (n) {
  const res = [], queens = new Array(n).fill(-1);
  const col = new Set(), diag1 = new Set(), diag2 = new Set();
  const backtrack = (r) => {
    if (r === n) {
      res.push(queens.map((c) => ".".repeat(c) + "Q" + ".".repeat(n - c - 1)));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (col.has(c) || diag1.has(r - c) || diag2.has(r + c)) continue; // attacked
      queens[r] = c;
      col.add(c); diag1.add(r - c); diag2.add(r + c);   // 1. choose
      backtrack(r + 1);                                 // 2. recurse
      col.delete(c); diag1.delete(r - c); diag2.delete(r + c); // 3. un-choose
    }
  };
  backtrack(0);
  return res;
};`,
              zh: `var solveNQueens = function (n) {
  const res = [], queens = new Array(n).fill(-1);
  const col = new Set(), diag1 = new Set(), diag2 = new Set();
  const backtrack = (r) => {
    if (r === n) {
      res.push(queens.map((c) => ".".repeat(c) + "Q" + ".".repeat(n - c - 1)));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (col.has(c) || diag1.has(r - c) || diag2.has(r + c)) continue; // 被攻击
      queens[r] = c;
      col.add(c); diag1.add(r - c); diag2.add(r + c);   // 1. 做选择
      backtrack(r + 1);                                 // 2. 递归
      col.delete(c); diag1.delete(r - c); diag2.delete(r + c); // 3. 撤销选择
    }
  };
  backtrack(0);
  return res;
};`,
            },
            hl: [10],
            note: {
              en: (
                <>
                  The <code>add</code> and <code>delete</code> calls on the three{" "}
                  <code>Set</code>s come in pairs — the same choose and un-choose as
                  before, except that three sets are restored instead of one path.
                </>
              ),
              zh: (
                <>
                  三个 <code>Set</code> 的 <code>add</code> / <code>delete</code> 成对出现 ——
                  还是那套「做选择 / 撤销」,只是要还原的是三个集合,而不是一条 path。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="story"
          title={{ en: "Eight queens: a 170-year-old puzzle", zh: "八皇后:一道 170 年的老题" }}
        >
          <p>
            <T
              en={
                <>
                  The eight queens puzzle was posed in 1848 by the chess player Max
                  Bezzel. <b>Gauss</b> worked on it and at one point miscounted the
                  solutions. In 1972 <b>Edsger Dijkstra</b> used it as a teaching
                  example for structured programming and backtracking. An 8×8 board
                  has exactly <b>92</b> solutions.
                </>
              }
              zh={
                <>
                  八皇后问题 1848 年由棋手 Max Bezzel 提出,<b>高斯</b>研究过它,
                  还一度数错了解的个数。1972 年,<b>Edsger Dijkstra</b>
                  用它作为结构化编程和回溯法的教学案例。8×8 棋盘恰好有 <b>92</b> 个解。
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
                  <b>Sudoku (LC 37)</b> is the two-dimensional version of the same
                  idea: find an empty cell, try the digits 1 to 9, place a digit that
                  breaks no rule and recurse on the rest of the board, and erase it if
                  the recursion fails. The row, column, and 3×3 box checks are its
                  constraint pruning. A faster version{" "}
                  <strong>packs the digits already used in each row, column, and box
                  into the bits of one integer</strong>, which turns both the check and
                  the &quot;which digits are still allowed&quot; question into bit
                  operations. See <strong>chapter 04 · bit manipulation</strong> for
                  representing a set with one integer and using <code>lowbit</code> to
                  read candidates.
                </>
              }
              zh={
                <>
                  <b>数独(LC 37)</b>是同一套思路的二维版:找一个空格,试填 1~9,
                  填一个不违反规则的数字就递归解剩下的棋盘,递归失败就擦掉重来。
                  行、列、3×3 宫的检查就是它的约束剪枝。更快的版本
                  <strong>把每行、每列、每宫「已用的数字」压进一个整数的各个二进制位</strong>,
                  于是判重和「还能填哪些数字」都变成位运算。
                  用一个整数表示集合、用 <code>lowbit</code> 取候选,见
                  <strong>第 04 章 · 位运算</strong>。
                </>
              }
            />
          </p>
        </div>
        <Callout
          tone="deep"
          title={{
            en: "Backtracking runs inside software you use every day",
            zh: "工程现场:回溯就跑在你每天用的软件里",
          }}
        >
          <p>
            <T
              en={
                <>
                  (1) <b>Regular expression engines.</b> Most languages match by
                  backtracking. A pattern such as <code>(a+)+$</code> fed a string
                  that almost matches can make the engine explore an exponential
                  number of ways to split the input. The CPU saturates, and the
                  resulting denial-of-service is called{" "}
                  <b>catastrophic backtracking</b>, or ReDoS. (2){" "}
                  <b>SAT and constraint solvers.</b> The DPLL algorithm behind
                  scheduling, sudoku, and hardware verification is backtracking with
                  strong pruning. (3) <b>Prolog.</b> Its entire execution model is
                  backtracking. Understanding this chapter tells you why these systems
                  are fast most of the time and suddenly very slow on some inputs.
                </>
              }
              zh={
                <>
                  ① <b>正则表达式引擎。</b>大多数语言用回溯做匹配。像 <code>(a+)+$</code>
                  这样的模式,配上一个「差一点就匹配」的字符串,会让引擎尝试指数级多种切分方式,
                  CPU 直接跑满 —— 由此造成的拒绝服务叫
                  <b>灾难性回溯(catastrophic backtracking)</b>,也就是 ReDoS。
                  ② <b>SAT 与约束求解器。</b>排班、数独、硬件验证背后的 DPLL 算法,
                  就是带强剪枝的回溯。③ <b>Prolog。</b>它的整个执行模型就是回溯。
                  懂了这一章,你就明白这些系统为什么大多数时候很快,却会在某些输入上突然极慢。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="win"
          title={{ en: "Complexity and follow-up questions", zh: "复杂度 & 面试追问" }}
        >
          <p>
            <T
              en={
                <>
                  Count nodes times work per node. The column rule alone leaves at
                  most n choices in row 0, n−1 in row 1, and so on, so the search
                  examines at most <b>n!</b> complete placements, where n is the board
                  size. Each solution is then written out as n strings of length n,
                  which costs O(n²). The diagonal checks remove the large majority of
                  those branches in practice, and the real number of solutions grows
                  much more slowly than n!, but{" "}
                  <b>no better worst-case bound is known</b> — pruning changes the
                  running time, not the bound. Space is <b>O(n)</b> for the recursion
                  and the three sets.
                </>
              }
              zh={
                <>
                  按「节点数 × 每节点工作量」算。只考虑同列规则,第 0 行至多 n 种选择、
                  第 1 行至多 n−1 种…… 所以搜索至多考察 <b>n!</b> 种完整摆法(n 是棋盘边长);
                  每找到一个解,还要写出 n 个长度为 n 的字符串,花 O(n²)。
                  对角线检查在实践中砍掉了其中绝大多数分支,真实解的个数增长也远慢于 n!,
                  但<b>目前并没有更好的最坏情况上界</b> —— 剪枝改变的是运行时间,不是这个界。
                  空间 <b>O(n)</b>(递归深度 + 三个集合)。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Follow-ups: (1) &quot;only the <b>number</b> of solutions?&quot; →{" "}
                  <b>LC 52</b>, skip building the board and just increment a counter;
                  (2) &quot;faster for larger n?&quot; → replace the three boolean
                  arrays with <b>bitmasks</b>, one integer per constraint, and read the
                  available columns with <code>lowbit</code> (chapter 04); (3)
                  &quot;does sudoku work the same way?&quot; → yes, LC 37 uses the
                  same structure plus the bit optimisation.
                </>
              }
              zh={
                <>
                  追问:①「只要解的<b>个数</b>?」→ <b>LC 52</b>,不构造棋盘,只把计数器加一;
                  ②「n 更大时想更快?」→ 把三个布尔数组换成<b>位掩码</b>,每个约束一个整数,
                  再用 <code>lowbit</code> 取可用的列(第 04 章);
                  ③「数独也这么做?」→ 是,LC 37 结构相同,再加位运算优化。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §10 题单 ================= */}
      <Section
        id="problems"
        index="10"
        title={{ en: "Problem set: 15 backtracking problems", zh: "高频题单:回溯 15 题" }}
        desc={{
          en: "Grouped as combinations, partitioning, subsets, permutations, and boards, from easier to harder. Think for 30 seconds before opening a hint.",
          zh: "按「组合 → 分割 → 子集 → 排列 → 棋盘」分组,由易到难。先想 30 秒再看提示",
        }}
        badge={
          <span className="chip">
            <T en="Core plus advanced" zh="主线必做 + 进阶" />
          </span>
        }
      >
        <ProblemSet ch="backtrack" items={PROBLEMS} />
      </Section>

      {/* ================= §11 Quiz ================= */}
      <Section
        id="quiz"
        index="11"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Get all 8 right to mark this chapter complete.",
          zh: "8 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="backtrack" items={QUIZ} />
      </Section>

      <KeyPoints
        points={{
          en: [
            <>
              Backtracking is a <b>depth-first search over a tree of partial
              answers</b>: choose, recurse, <b>un-choose</b>. The un-choose is what
              makes it backtracking; without it the shared path is polluted and the
              answers are wrong.
            </>,
            <>
              Answer the <b>three questions</b> first: the path (what is chosen), the
              choices available now, and the stop condition. The template then writes
              itself.
            </>,
            <>
              Recording a solution <b>must copy the path</b>: Java{" "}
              <code>new ArrayList&lt;&gt;(path)</code>, Python <code>path[:]</code>,
              JS <code>[...path]</code>. Storing the path itself stores a reference
              that later undo steps will change.
            </>,
            <>
              What a deeper call may reuse is the organising idea.{" "}
              <b>Subsets, combinations, and partitions</b> move a{" "}
              <code>startIndex</code> forward; <b>permutations</b> track a{" "}
              <code>used</code> set. Subsets record at <b>every node</b>;
              combinations and permutations record at the <b>leaves</b>.
            </>,
            <>
              <b>Pruning</b> comes in two kinds: a branch that cannot be valid (a
              constraint check, used everywhere in this chapter) and a branch that
              cannot be better (a bound, used when searching for an optimum). LC
              77&apos;s upper limit of{" "}
              <span className="mono">n−(k−chosen)+1</span> is the model case.
            </>,
            <>
              For duplicate values, <b>sort first and skip equal values at the same
              node</b>: <span className="mono">i&gt;start &amp;&amp; nums[i]==nums[i-1]</span>{" "}
              for combinations and subsets, <span className="mono">!used[i-1]</span>{" "}
              for permutations. Both express one rule.
            </>,
            <>
              For boards (51 / 37), <b>rows are levels and columns are choices</b>. A
              column set plus the two diagonal sets, indexed by{" "}
              <span className="mono">row−col</span> and{" "}
              <span className="mono">row+col</span>, make the safety check O(1).
            </>,
          ],
          zh: [
            <>
              回溯是<b>在一棵「半成品树」上做深度优先搜索</b>:做选择 → 递归 → <b>撤销选择</b>。
              撤销才让它成为「回溯」;少了它,共享的路径会被污染,答案必错。
            </>,
            <>
              先回答<b>三个问题</b>:路径(已选什么)、当前可选项、结束条件 —— 模板就自动填好了。
            </>,
            <>
              收集解<b>必须拷贝路径</b>:Java <code>new ArrayList&lt;&gt;(path)</code>、
              Python <code>path[:]</code>、JS <code>[...path]</code>。
              直接存路径存的是引用,后面的撤销会把它改掉。
            </>,
            <>
              主线是「更深一层允许重用什么」:<b>子集、组合、分割</b>靠{" "}
              <code>startIndex</code> 只往前推;<b>排列</b>用 <code>used</code> 集合记账。
              子集在<b>每个节点</b>收,组合和排列在<b>叶子</b>收。
            </>,
            <>
              <b>剪枝</b>分两种:分支不可能合法(约束检查,本章处处都是)、
              分支不可能更好(界,求最优解时才用)。LC 77 把上界收紧到{" "}
              <span className="mono">n−(k−已选)+1</span> 是范本。
            </>,
            <>
              遇到重复值,<b>先排序,再跳过同一个节点上相同的值</b>:组合、子集用{" "}
              <span className="mono">i&gt;start &amp;&amp; nums[i]==nums[i-1]</span>,
              排列用 <span className="mono">!used[i-1]</span> —— 两种写法,同一条规则。
            </>,
            <>
              棋盘类(51 / 37)把<b>行当层、列当选择</b>。一个列集合加上两个对角线集合
              (下标用 <span className="mono">row−col</span> 和{" "}
              <span className="mono">row+col</span>),把安全检查降到 O(1)。
            </>,
          ],
        }}
      />

      <ChapterFooter ch="backtrack" />
    </main>
  );
}
