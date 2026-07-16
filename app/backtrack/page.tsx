"use client";

// 第 5 章 · 回溯 backtrack —— 全书精讲最多(4 道)、可视化最重的一章。
// 结构:走迷宫建立决策树心智模型 → 模板三问(路径/选择/结束)+ 三部曲 →
// 精讲 A 组合 77(剪枝前后两棵树)→ 组合家族 → 分割家族 →
// 精讲 B 子集 78 → 精讲 C 排列 46(used 数组现场)→ 去重两板斧(树层 vs 树枝)→
// 精讲 D N 皇后 51(自建棋盘)+ 数独 37 提位运算 → 题单 → 测验。
// 决策树统一用 lib/algviz 的 TreePlayer;used 数组与棋盘见 ./viz。

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
  { id: "why", n: "01", label: "为什么回溯" },
  { id: "template", n: "02", label: "模板三问" },
  { id: "combine", n: "03", label: "组合 · 剪枝" },
  { id: "family", n: "04", label: "组合家族" },
  { id: "split", n: "05", label: "分割" },
  { id: "subset", n: "06", label: "子集" },
  { id: "permute", n: "07", label: "排列" },
  { id: "dedup", n: "08", label: "去重两板斧" },
  { id: "board", n: "09", label: "N 皇后" },
  { id: "problems", n: "10", label: "高频题单" },
  { id: "quiz", n: "11", label: "通关测验" },
];

export default function BacktrackChapter() {
  return (
    <main className="page" data-ch="backtrack">
      <Hero
        ch="backtrack"
        title={
          <>
            回溯 <span className="grad">Backtracking</span>
          </>
        }
        essence={
          <>
            回溯就是<strong>穷举</strong>,但不是蛮干:把所有可能画成一棵
            <strong>决策树</strong>,沿着树枝一路往下试,<strong>走进死胡同就退一步,
            擦掉刚才的选择,换下一条路</strong>。本章从走迷宫开始,教你把任何「枚举所有方案」
            的问题拆成「路径 / 选择列表 / 结束条件」三件事,然后用剪枝让这棵树瘦下来。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 为什么回溯 ================= */}
      <Section
        id="why"
        index="01"
        title="为什么需要回溯:多重 for 循环写不出来的穷举"
        desc="当「要选几个、怎么选」由搜索过程决定,循环就失灵了 —— 递归才是穷举的正确形状"
      >
        <div className="prose">
          <p>
            先看一个循环能搞定的枚举:「从 5 个数里选 2 个」,两层 for 就写完了。
            可如果题目是「从 n 个数里选 k 个」,k 是运行时才知道的变量呢?你没法写「k 层 for 循环」——
            <strong>循环层数不能是变量</strong>。再想想「把字符串切成任意段」「在棋盘上放皇后直到放满」——
            这些问题的共同点是:<strong>要做多少次选择、每次有哪些选择,都得边搜索边决定</strong>。
          </p>
          <p>
            这正是<strong>回溯(backtracking)</strong>的主场。它的世界观特别简单,就是走迷宫:
            站在岔路口,随便挑一条路走下去;走通了就记下来,<strong>撞了墙(死胡同)就退回岔路口,
            换一条还没试过的路</strong>。把每个「岔路口」和「选择」画出来,就是一棵
            <strong>决策树(decision tree)</strong> —— 回溯 = 在这棵树上做深度优先搜索(DFS,
            depth-first search,DataData · 二叉树章讲过树的 DFS,这里把它用到「想象出来的决策树」上)。
          </p>
        </div>
        <MazeTree />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            看懂了这一进一退,回溯的三个动作就齐了:<strong>做选择 → 递归深入 → 撤销选择</strong>。
            「撤销」就是那个「退回岔路口」的动作,也是「回溯」这个名字的由来。
            剩下的所有回溯题,区别只在于:<strong>这棵决策树长什么样,以及哪些树枝可以提前砍掉(剪枝)</strong>。
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">识别信号 01</div>
            <div className="card-title">🌲 求「所有方案」</div>
            <p>
              题目要「列出全部组合 / 排列 / 切法 / 路径」,而不是求一个数值最优 ——
              这几乎必然是回溯(或它的记忆化升级 DP)。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">识别信号 02</div>
            <div className="card-title">🔢 选择步数不固定</div>
            <p>
              「选 k 个」「切若干段」「填满棋盘」—— 步数是变量,for 循环写不出层数,
              只能靠递归一层层往下。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">代价预警</div>
            <div className="card-title">💣 指数级</div>
            <p>
              回溯是穷举,复杂度通常是 <BigO o="2n" /> 或 O(n!) 起步。
              所以<b>剪枝</b>不是锦上添花,常常是「能不能过」的生死线。
            </p>
          </div>
        </div>
        <Callout tone="story" title="「回溯」这个名字是谁起的">
          <p>
            backtracking 一词由数学家 <b>D. H. Lehmer</b> 在 1950 年代提出,但思想更古老 ——
            1848 年人们就在研究「八皇后问题」,高斯(Gauss)也曾手算过。它和 DFS 是<b>同一件事的两个名字</b>:
            DFS 强调「怎么遍历一棵树」,回溯强调「遍历的是一棵<i>决策</i>树,而且走错要退回」。
            本章后面你会看到,连 Prolog 语言、正则表达式引擎、数独 App,骨子里跑的都是回溯。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 模板三问 ================= */}
      <Section
        id="template"
        index="02"
        title="模板三问:路径 / 选择列表 / 结束条件"
        desc="拿到任何回溯题,先回答这三个问题,模板就自动填好了"
      >
        <div className="prose">
          <p>
            回溯题看着五花八门,其实共用同一套骨架。写代码前,先当着面试官的面回答三个问题:
          </p>
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">问题一</div>
            <div className="card-title">🎒 路径(path)</div>
            <p>
              已经做出的选择,记在一个列表里。它就是决策树上<b>从根到当前节点</b>的那条路 ——
              到达终点时,它(的一份拷贝)就是一个答案。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">问题二</div>
            <div className="card-title">📋 选择列表</div>
            <p>
              当前这一步<b>还能选哪些</b>。组合/子集用 <span className="mono">startIndex</span>
              (只往后选),排列用 <span className="mono">used</span> 数组(排除已用),
              棋盘用「这一格会不会被攻击」。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">问题三</div>
            <div className="card-title">🏁 结束条件</div>
            <p>
              什么时候到达决策树的<b>叶子</b>。选够 k 个、切到字符串末尾、放满 n 行 ——
              到了就收集结果并 return。
            </p>
          </div>
        </div>
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            三问答完,套进下面这个骨架就行。以最经典的「从 1..n 里选 k 个」为例,
            注意 for 循环里那雷打不动的<strong>三部曲</strong>:
          </p>
        </div>
        <CodeTabs
          title="backtrack_template"
          java={{
            code: `List<List<Integer>> res = new ArrayList<>();
List<Integer> path = new ArrayList<>();

// 从 1..n 里选 k 个的通用骨架
void backtrack(int n, int k, int start) {
    if (path.size() == k) {            // 结束条件
        res.add(new ArrayList<>(path)); // 收集:必须拷贝一份
        return;
    }
    for (int i = start; i <= n; i++) {  // 选择列表
        path.add(i);                    // ① 做选择
        backtrack(n, k, i + 1);         // ② 递归下一层
        path.remove(path.size() - 1);   // ③ 撤销选择
    }
}`,
            hl: [11, 12, 13],
            note: (
              <>
                <b>头号坑:</b>收集结果一定要 <code>new ArrayList&lt;&gt;(path)</code> <b>深拷贝</b>。
                <code>path</code> 全程是同一个对象,直接 <code>res.add(path)</code> 存的是引用 ——
                后续的 <code>remove</code> 会把已经收进 res 的答案一起清空。
              </>
            ),
          }}
          python={{
            code: `res, path = [], []

# 从 1..n 里选 k 个的通用骨架
def backtrack(n, k, start):
    if len(path) == k:              # 结束条件
        res.append(path[:])         # 收集:拷贝一份
        return
    for i in range(start, n + 1):   # 选择列表
        path.append(i)              # ① 做选择
        backtrack(n, k, i + 1)      # ② 递归下一层
        path.pop()                  # ③ 撤销选择`,
            hl: [9, 10, 11],
            note: (
              <>
                <b>头号坑:</b>收集时写 <code>path[:]</code> 或 <code>path.copy()</code> 拷贝。
                <code>res.append(path)</code> 存的是同一个列表的引用,<code>pop</code> 之后
                答案会跟着被改空 —— 新手最常见的「结果全是空列表」就是这么来的。
              </>
            ),
          }}
          js={{
            code: `const res = [], path = [];

// 从 1..n 里选 k 个的通用骨架
function backtrack(n, k, start) {
  if (path.length === k) {          // 结束条件
    res.push([...path]);            // 收集:拷贝一份
    return;
  }
  for (let i = start; i <= n; i++) { // 选择列表
    path.push(i);                   // ① 做选择
    backtrack(n, k, i + 1);         // ② 递归下一层
    path.pop();                     // ③ 撤销选择
  }
}`,
            hl: [10, 11, 12],
            note: (
              <>
                <b>头号坑:</b>用 <code>[...path]</code> 展开拷贝。<code>res.push(path)</code>
                存的是同一个数组引用,回溯的 <code>pop</code> 会把它改空 —— 记住:
                <b>进 res 的必须是快照,不是本尊</b>。
              </>
            ),
          }}
        />
        <Callout tone="win" title="面试话术:把三问说出来">
          <p>
            拿到回溯题,别急着写。先说:「我把它建成一棵决策树。<b>路径</b>是已选的元素,
            <b>选择列表</b>是当前还能选的(这里用 startIndex / used 控制),<b>结束条件</b>是
            路径长度等于 k。然后是标准的『选择 - 递归 - 撤销』三部曲,最后看哪些分支能剪。」——
            这段话让面试官确信你有<b>可迁移的框架</b>,而不是背了一道题。
          </p>
        </Callout>
        <Callout tone="warn" title="三部曲缺一不可,尤其是「撤销」">
          <p>
            很多人写对了「选择」和「递归」,却忘了<b>撤销</b>。后果不是慢,是<b>错</b>:
            <code>path</code> 是所有分支<b>共享</b>的同一个列表,不撤销,兄弟分支就会在被上一条路
            污染过的现场上继续选,答案彻底乱套。撤销的作用,是把现场<b>恢复成进入这个节点之前的样子</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 精讲 A · LC 77 组合 + 剪枝 ================= */}
      <Section
        id="combine"
        index="03"
        title="精讲 A · LC 77 组合:把决策树画出来,再把它剪瘦"
        desc="组合是回溯的 hello world —— 学会它,同时也学会了本章最重要的两件事:startIndex 去重、进门前剪枝"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>给两个整数 n 和 k,返回 1..n 中所有 <b>k 个数的组合</b>(不讲顺序,
            [1,2] 和 [2,1] 算同一个)。
            <b> 暴力:</b>如果 k 固定,可以写 k 层嵌套循环 —— 但 k 是参数,层数不定,循环写不出来。
            <b> 正解:</b>建决策树。第一层选第 1 个数,第二层在「比它大的数」里选第 2 个……
            走到路径长度为 k 的叶子,就收一个组合。
          </p>
          <p>
            这里藏着组合类的第一个关键:<strong>为什么下一层只能选「比当前大」的数?</strong>
            因为组合无序,如果每层都能选全部数,就会同时生成 [1,2] 和 [2,1] —— 重复了。
            用一个 <span className="mono">startIndex</span> 卡住「只往后选」,就让每个组合只以
            <b>升序</b>出现一次。先看不剪枝的完整决策树(n=4, k=2):
          </p>
        </div>
        <CombTreeFull />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            数一数绿色叶子:正好 6 个 = C(4,2)。但注意那条「选 4 起头」的分支 ——
            手里要凑 2 个数,起点却选了最后一个 4,后面<strong>再没有更大的数</strong>可选了,
            <strong>这条路从一开始就注定失败</strong>,我们却真的走进去撞了南墙才发现。这就是<strong>剪枝
            (pruning)</strong>的用武之地:<strong>在进入一棵子树之前,先算一算「这条路还有没有可能成功」,
            没可能就干脆不进</strong>。
          </p>
          <p>
            具体到 77:还需要选 <span className="mono">k − path.size()</span> 个数,
            那么起点 i 最大只能到 <span className="mono">n − (k − path.size()) + 1</span>
            (再往后剩下的数就不够凑满了)。把 for 的上界从 n 收紧到这个值,那条死路就<strong>一步都不会走</strong>:
          </p>
        </div>
        <CombTreePruned />
        <CodeTabs
          title="lc77_combine"
          java={{
            code: `class Solution {
    private final List<List<Integer>> res = new ArrayList<>();
    private final List<Integer> path = new ArrayList<>();

    public List<List<Integer>> combine(int n, int k) {
        backtrack(n, k, 1);
        return res;
    }

    private void backtrack(int n, int k, int start) {
        if (path.size() == k) {
            res.add(new ArrayList<>(path));   // 收集一个组合(拷贝)
            return;
        }
        // 剪枝:还需 k - path.size() 个,i 最多到 n - (k - path.size()) + 1
        int last = n - (k - path.size()) + 1;
        for (int i = start; i <= last; i++) {
            path.add(i);
            backtrack(n, k, i + 1);
            path.remove(path.size() - 1);
        }
    }
}`,
            hl: [15, 16, 17],
            note: (
              <>
                递归传 <code>i + 1</code>(每个数只用一次、只往后选)。剪枝那行是本题的分水岭:
                不剪也对,但 n、k 大时会超时。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def combine(self, n: int, k: int) -> list[list[int]]:
        res, path = [], []

        def backtrack(start: int) -> None:
            if len(path) == k:
                res.append(path[:])          # 拷贝
                return
            last = n - (k - len(path)) + 1   # 剪枝上界
            for i in range(start, last + 1):
                path.append(i)
                backtrack(i + 1)
                path.pop()

        backtrack(1)
        return res`,
            hl: [9, 10],
            note: (
              <>
                <code>range(start, last + 1)</code> 的 <code>+1</code> 别漏 —— Python 的 range 右开,
                要包含 last 得写到 last+1。剪枝上界的推导值得手推一遍:还需 k−len(path) 个数。
              </>
            ),
          }}
          js={{
            code: `var combine = function (n, k) {
  const res = [], path = [];
  const backtrack = (start) => {
    if (path.length === k) {
      res.push([...path]);                 // 拷贝
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
            hl: [8, 9],
            note: (
              <>
                闭包里的 <code>res</code>、<code>path</code> 被内层箭头函数共享,不用一路当参数传。
                <code>[...path]</code> 是必须的快照拷贝。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 面试追问">
          <p>
            时间 <b>O(k · C(n,k))</b>(C(n,k) 个组合,每个复制 O(k)),空间 <b>O(k)</b>(递归深度 + 路径)。
            追问链:①「组合里的和要等于某个 target?」→ <b>LC 216 组合总和 III</b>,多加一处「和超标就剪」;
            ②「同一个数能重复选?」→ <b>LC 39 组合总和</b>,递归传 <code>i</code> 而非 <code>i+1</code>;
            ③「数组里有重复元素、每个只能用一次?」→ <b>LC 40</b>,排序 + 树层去重(§08 讲透)。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 组合家族 ================= */}
      <Section
        id="family"
        index="04"
        title="组合家族:一套骨架,五种换皮"
        desc="17 / 216 / 39 / 40 —— 都是 77 加一点约束,难点各不相同"
      >
        <div className="prose">
          <p>
            组合类的题,几乎都是在 77 的骨架上「加条件」。看清每道题<strong>改的是哪一处</strong>,
            就再也不会背混:
          </p>
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">LC 17 · 电话字母</div>
            <div className="card-title">📱 多个集合各选一个</div>
            <p>
              不是从<b>同一个</b>集合选,而是每层换一个集合(数字 2→"abc",3→"def"……)。
              所以<b>没有 startIndex</b>,用 index 定位「这一层该用哪组字母」。结束条件:选够所有数字。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">LC 216 · 组合总和 III</div>
            <div className="card-title">➕ 个数 + 和 双约束</div>
            <p>
              77 里再加一个 <span className="mono">sum</span>:凑够 k 个时还要 sum == n 才收。
              两处剪枝叠加 —— 个数不够、或和已超标,都直接停(1..9 全是正数)。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">LC 39 · 组合总和</div>
            <div className="card-title">♾️ 同一个数可重复选</div>
            <p>
              元素无重复,但每个能用无限次。唯一改动:递归传 <span className="mono">i</span>
              而不是 <span className="mono">i + 1</span>,让下一层还能选到自己。排序后「和超标 break」剪枝。
            </p>
          </div>
        </div>
        <div className="grid-3" style={{ marginTop: 14 }}>
          <div className="card hoverable">
            <div className="card-kicker">LC 40 · 组合总和 II</div>
            <div className="card-title">🚫 有重复元素、各用一次</div>
            <p>
              数组含重复,每个只用一次,还要求结果不重复。<b>排序 + 树层去重</b>:
              <span className="mono">i &gt; start &amp;&amp; nums[i] == nums[i-1]</span> 跳过同层重复。
              递归传 <span className="mono">i + 1</span>。详见 §08。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">LC 22 ·(补)括号生成</div>
            <div className="card-title">✅ 用「合法性」当剪枝</div>
            <p>
              每层二选一:放「(」或「)」。剪枝规则即约束:左括号没用满才能放「(」;
              右括号数 &lt; 左括号数才能放「)」。这道题几乎全是剪枝的艺术。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">一句话总纲</div>
            <div className="card-title">🧭 改哪儿,一眼看穿</div>
            <p>
              <b>能否重复选</b> → 传 i 还是 i+1;<b>是否多集合</b> → 有没有 startIndex;
              <b>有无重复元素</b> → 要不要排序去重;<b>额外约束</b> → 加几处剪枝。
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §05 分割家族 ================= */}
      <Section
        id="split"
        index="05"
        title="分割问题:把「切一刀」也看成一次选择"
        desc="131 / 93 —— startIndex 从「选哪个数」变成「下一刀切在哪」"
      >
        <div className="prose">
          <p>
            分割问题(把字符串切成若干段)乍看和组合不像,其实是同一棵树的变体。
            心法只有一句:<strong>把 startIndex 理解成「上一刀之后、下一段的起点」</strong>。
            在 start 到末尾之间枚举「切点 i」,取子串 s[start..i] 作为一段 ——
            这就是这一步的「选择」;切到字符串末尾,就是一种完整切法(叶子)。
          </p>
        </div>
        <div className="bt-duo">
          <div className="card">
            <div className="card-kicker">LC 131 · 分割回文串</div>
            <div className="card-title">✂️ 每段都要是回文</div>
            <p>
              dfs(start):从 start 枚举切点 i,若 s[start..i] 是回文,就加入路径、递归 dfs(i+1)、撤销;
              <b>不是回文就跳过这个切点</b>(天然剪枝)。start 到达串尾 = 收一种切法。
              判回文可预处理成一张 DP 表加速。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">LC 93 · 复原 IP 地址</div>
            <div className="card-title">🌐 约束一大堆 = 剪枝一大堆</div>
            <p>
              同一套切割骨架,只是限制多:必须<b>正好切 4 段</b>、每段数值 0~255、除「0」外不能有前导零。
              把「段数」当第二维(切满 4 段是结束条件),每段不合法就剪掉。
            </p>
          </div>
        </div>
        <Callout tone="idea" title="三类问题,同一棵树">
          <p>
            到这里你应该看出来了:<b>组合、分割、子集,骨架几乎一模一样</b>,都靠 startIndex 控制
            「只往后走」。区别只是「选择」的含义不同:组合选<b>一个数</b>、分割选<b>一个切点</b>、
            子集选<b>要不要这个数</b>。认出这一点,你就把一大批题合并成了一道题。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 精讲 B · LC 78 子集 ================= */}
      <Section
        id="subset"
        index="06"
        title="精讲 B · LC 78 子集:走到哪,收到哪"
        desc="和组合共用一棵树,唯一的区别是「收集结果的时机」"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>返回数组(元素互不相同)的<b>所有子集</b>(幂集),包括空集和它自己。
            <b> 关键洞察:</b>组合是「选够 k 个才算一个答案」,子集是「<strong>路径本身</strong>就是一个答案」——
            空集、{"{1}"}、{"{1,2}"}…… 全都要。所以子集和组合<strong>共用同一棵 startIndex 决策树</strong>,
            差别只有一个字:<strong>收集的时机</strong>。
          </p>
          <p>
            组合在<b>叶子</b>收(路径满 k 个);子集在<b>每一个节点</b>都收(刚进函数、还没进循环时就收一次)——
            因为每个节点对应的路径,本身就是一个合法子集。看动画,注意每个节点都变绿(被收进答案):
          </p>
        </div>
        <SubsetTree />
        <CodeTabs
          title="lc78_subsets"
          java={{
            code: `class Solution {
    private final List<List<Integer>> res = new ArrayList<>();
    private final List<Integer> path = new ArrayList<>();

    public List<List<Integer>> subsets(int[] nums) {
        backtrack(nums, 0);
        return res;
    }

    private void backtrack(int[] nums, int start) {
        res.add(new ArrayList<>(path));   // 每进一个节点就收一次(含空集)
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, i + 1);
            path.remove(path.size() - 1);
        }
    }
}`,
            hl: [11],
            note: (
              <>
                注意收集那行放在<b>循环之前、没有 return</b>:每个节点先收自己,再往下扩展。
                循环会在 <code>start</code> 越界时自然停下,不需要额外的结束条件。
              </>
            ),
          }}
          python={{
            code: `class Solution:
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
            hl: [6],
            note: (
              <>
                子集题没有「凑够 k 个」的 return,函数第一行就收集当前 path 的拷贝。
                另一种等价写法是「选 / 不选」二叉树,但 startIndex 版更贴合本章模板。
              </>
            ),
          }}
          js={{
            code: `var subsets = function (nums) {
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
            hl: [4],
            note: (
              <>
                和 77 唯一的代码差别就是:收集从「if 满 k 个」挪到了「进函数第一行」。
                一个骨架,两道题。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 面试追问">
          <p>
            时间 <b>O(n · 2ⁿ)</b>(2ⁿ 个子集,每个复制 O(n)),空间 <b>O(n)</b>。
            追问:①「数组有重复元素?」→ <b>LC 90 子集 II</b>,排序 + 树层去重(§08);
            ②「只要递增的子序列、且不能排序?」→ <b>LC 491</b>,改用「每层一个 set」去重;
            ③「能不能不用递归?」→ 可以用<b>位掩码</b>:枚举 0..2ⁿ−1,第 j 位为 1 表示选第 j 个元素
            (第 04 章位运算讲过「用一个 int 表示集合」)。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 精讲 C · LC 46 全排列 ================= */}
      <Section
        id="permute"
        index="07"
        title="精讲 C · LC 46 全排列:startIndex 失灵,用 used 数组"
        desc="排列讲顺序,[1,2] 和 [2,1] 是两个答案 —— 每层都要能选回前面的数"
        badge={<span className="lc-badge" data-d="medium">MEDIUM</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>返回数组(元素互不相同)的<b>所有排列</b>。
            <b> 和组合的根本区别:</b>排列<strong>讲顺序</strong>,[1,2] 和 [2,1] 是<strong>两个不同的答案</strong>。
            这意味着 startIndex「只往后选」的招数<strong>直接失灵</strong> —— 因为 [2,1] 里的 1 排在 2 后面,
            如果只往后选,就永远拿不到它,答案会漏一大半。
          </p>
          <p>
            排列需要的是:每一层都能选到<strong>所有还没被用过的数</strong>(包括比当前小的)。
            怎么知道哪些「用过了」?用一个 <strong>used 布尔数组(used array)</strong>记账:
            <span className="mono">used[i] = true</span> 表示第 i 个数已经在当前路径里,这一层就跳过它。
            亲眼看 used 数组怎么随着「选择」点亮、随着「撤销」熄灭:
          </p>
        </div>
        <PermuteLab />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            看清了吗?<strong>撤销时,used 和 path 两个状态都要还原</strong> ——
            这是排列比组合多出来的一个坑。for 循环每层都从 <span className="mono">i = 0</span> 开始
            (而不是 start),靠 used 排除已选的:
          </p>
        </div>
        <CodeTabs
          title="lc46_permute"
          java={{
            code: `class Solution {
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
            if (used[i]) continue;               // 跳过已在路径中的
            used[i] = true;  path.add(nums[i]);
            backtrack(nums, used);
            used[i] = false; path.remove(path.size() - 1);
        }
    }
}`,
            hl: [16, 17],
            note: (
              <>
                最后一行<b>两个状态一起撤销</b>:<code>used[i] = false</code> 和
                <code>path.remove(...)</code> 缺一不可。漏掉前者,后面的分支会以为这个数还占着,漏解。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def permute(self, nums: list[int]) -> list[list[int]]:
        res, path = [], []
        used = [False] * len(nums)

        def backtrack() -> None:
            if len(path) == len(nums):
                res.append(path[:])
                return
            for i in range(len(nums)):     # 每层都从 0 开始
                if used[i]:
                    continue               # 跳过已用
                used[i] = True; path.append(nums[i])
                backtrack()
                used[i] = False; path.pop()  # 撤销:两个状态都要还原

        backtrack()
        return res`,
            hl: [10, 11, 12],
            note: (
              <>
                Python 也可以偷懒:<code>for x in nums: if x in path: continue</code> 用
                「x 是否在 path 里」代替 used —— 但 <code>in</code> 是 O(n) 查找,used 数组是 O(1),
                大数据下用 used。
              </>
            ),
          }}
          js={{
            code: `var permute = function (nums) {
  const res = [], path = [], used = Array(nums.length).fill(false);
  const backtrack = () => {
    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {  // 每层都从 0 开始
      if (used[i]) continue;                 // 跳过已用
      used[i] = true; path.push(nums[i]);
      backtrack();
      used[i] = false; path.pop();           // 撤销两个状态
    }
  };
  backtrack();
  return res;
};`,
            hl: [8, 9],
            note: (
              <>
                <code>Array(n).fill(false)</code> 建 used。别用 <code>Array(n)</code> 不 fill ——
                得到的是空槽,<code>used[i]</code> 是 undefined,逻辑虽然碰巧能跑,但语义不清。
              </>
            ),
          }}
        />
        <Callout tone="warn" title="排列最常见的两个错">
          <p>
            ① <b>误用 startIndex</b>:照抄组合模板给排列加 startIndex,结果 [2,1]、[3,1] 全出不来 ——
            这是漏解,不是慢。排列每层必须从 0 扫。
            ② <b>只撤销 path、忘了 used</b>:某个数被「永久占用」,后面所有用到它的排列全丢。
            记住排列的撤销是<b>成对</b>的。
          </p>
        </Callout>
        <Callout tone="win" title="复杂度 & 面试追问">
          <p>
            时间 <b>O(n · n!)</b>(n! 个排列,每个复制 O(n)),空间 <b>O(n)</b>。
            追问:①「数组有重复元素?」→ <b>LC 47 全排列 II</b>,排序 + <code>!used[i-1]</code> 树层去重(§08);
            ②「求字符串的排列?」→ 同款 used 数组,注意字符去重;
            ③「不用额外 used 数组行不行?」→ 可以用「交换法」原地生成排列,省掉 used,但可读性差些、且天然不去重。
          </p>
        </Callout>
      </Section>

      {/* ================= §08 去重两板斧 ================= */}
      <Section
        id="dedup"
        index="08"
        title="去重两板斧:树层去重 vs 树枝去重"
        desc="当数组里有重复元素,如何让答案不重复?这是回溯最容易翻车、也是面试最爱问的一处"
        badge={<span className="chip" data-tone="warn">高频考点</span>}
      >
        <div className="prose">
          <p>
            前面的题(77 / 78 / 46)都假设元素<strong>互不相同</strong>。一旦数组里出现重复元素
            (如 [1,1,2]),就会冒出<strong>重复的答案</strong>。先看病:拿 [1,1,2] 求所有子集,
            不做任何处理会怎样?
          </p>
        </div>
        <DupSubsetTree />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            {"{1}"} 出现了两次、{"{1,2}"} 也出现了两次。病根一句话:
            <strong>在同一层里,第二个 1 又开了一遍和第一个 1 完全相同的分支</strong>。
            治法就叫<strong>树层去重(在决策树的「同一层」上去重)</strong>:先<strong>排序</strong>让相同元素相邻,
            然后在循环里,<strong>如果当前数和前一个数相同,而前一个数是「本层刚用完撤销的」,就跳过</strong>。
            同样是 [1,1,2],开启树层去重后,那条重复分支<strong>一步都不会走</strong>:
          </p>
        </div>
        <DedupSubsetTree />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            组合 / 子集因为有 startIndex,树层去重写成
            <span className="mono"> i &gt; start &amp;&amp; nums[i] == nums[i-1]</span> —— 注意是
            <strong> i &gt; start 而不是 i &gt; 0</strong>:<span className="mono">i == start</span>
            是本层的<b>第一个</b>数,必须保留;只跳过它<b>后面</b>那些重复的:
          </p>
        </div>
        <CodeTabs
          title="lc90_subsets_ii_dedup"
          java={{
            code: `// 调用前先 Arrays.sort(nums),让相同元素相邻
private void backtrack(int[] nums, int start) {
    res.add(new ArrayList<>(path));                 // 子集:每个节点都收
    for (int i = start; i < nums.length; i++) {
        if (i > start && nums[i] == nums[i - 1])    // 树层去重:
            continue;                               //   跳过同一层里第二个相同的数
        path.add(nums[i]);
        backtrack(nums, i + 1);
        path.remove(path.size() - 1);
    }
}`,
            hl: [5, 6],
            note: (
              <>
                <b>是 <code>i &gt; start</code>,不是 <code>i &gt; 0</code>!</b>
                前者只跳「同一层」的重复;写成 <code>i &gt; 0</code> 会把「树枝方向」的正常延用(如
                {" {1,1}"})也误杀,答案变少。
              </>
            ),
          }}
          python={{
            code: `# 调用前先 nums.sort(),让相同元素相邻
def backtrack(start):
    res.append(path[:])                       # 子集:每个节点都收
    for i in range(start, len(nums)):
        if i > start and nums[i] == nums[i - 1]:  # 树层去重
            continue                              #   跳过同层重复
        path.append(nums[i])
        backtrack(i + 1)
        path.pop()`,
            hl: [5, 6],
            note: (
              <>
                去重的<b>大前提是排序</b> —— 不排序,相同元素不相邻,「和前一个比」就失效了
                (LC 491 递增子序列不能排序,只能改用「每层一个 set」)。
              </>
            ),
          }}
          js={{
            code: `// 调用前先 nums.sort((a, b) => a - b),让相同元素相邻
function backtrack(start) {
  res.push([...path]);                        // 子集:每个节点都收
  for (let i = start; i < nums.length; i++) {
    if (i > start && nums[i] === nums[i - 1]) continue; // 树层去重
    path.push(nums[i]);
    backtrack(i + 1);
    path.pop();
  }
}`,
            hl: [5],
            note: (
              <>
                JS 排序默认按字符串!数字必须写 <code>sort((a, b) =&gt; a - b)</code>,
                否则 [1, 10, 2] 会被排成 [1, 10, 2],去重逻辑全乱。
              </>
            ),
          }}
        />
        <div className="prose" style={{ marginTop: 18 }}>
          <p>
            那<strong>「树枝去重」</strong>又是什么?排列题(LC 47)没有 startIndex,去重条件写成
            <span className="mono"> i &gt; 0 &amp;&amp; nums[i] == nums[i-1] &amp;&amp; !used[i-1]</span>。
            这里 <span className="mono">used[i-1]</span> 的真假,正好对应决策树上的两个方向:
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>看 used[i-1]</th>
                <th>在树上的含义</th>
                <th>要不要跳过</th>
                <th>为什么</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b className="mono">!used[i-1]</b>
                  <br />
                  (前一个相同数<b>已撤销</b>)
                </td>
                <td>
                  <b>树层</b>方向:同一层里,第一个 1 用完退回来了,现在轮到第二个 1
                </td>
                <td>
                  <span style={{ color: "var(--risk)" }}>✂️ 跳过</span>
                </td>
                <td>同一层选两个相同的数,会生成一模一样的子树 → 重复解</td>
              </tr>
              <tr>
                <td>
                  <b className="mono">used[i-1]</b>
                  <br />
                  (前一个相同数<b>还在路径上</b>)
                </td>
                <td>
                  <b>树枝</b>方向:第一个 1 还在当前路径里,现在往下再接第二个 1
                </td>
                <td>
                  <span style={{ color: "var(--ok)" }}>✅ 保留</span>
                </td>
                <td>这是 [1,1] 这种「合法地连用两个相同数」的排列,必须留</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="deep" title="两块板斧,其实是同一件事">
          <p>
            别被「树层 / 树枝」两个词绕晕 —— 它们说的是<b>同一个目标</b>:
            <b>「同一层不要选两个相同的值」</b>。组合/子集有 startIndex,所以用
            <code> i &gt; start</code> 表达「同层」;排列没有 startIndex,只能借
            <code> !used[i-1]</code> 判断「前一个相同值是不是刚在本层用完」。
            <b>用 <code>used[i-1]</code>(树枝去重)也能得到正确答案</b>,只是剪枝发生得更晚、更慢 ——
            所以标准写法都用 <code>!used[i-1]</code> 的树层去重。记住结论:<b>去重,认准「同层」。</b>
          </p>
        </Callout>
      </Section>

      {/* ================= §09 精讲 D · LC 51 N 皇后 ================= */}
      <Section
        id="board"
        index="09"
        title="精讲 D · LC 51 N 皇后:决策树长在棋盘上"
        desc="把「行」当决策树的层,把「列」当每层的选择 —— 回溯从一维走向二维"
        badge={<span className="lc-badge" data-d="hard">HARD</span>}
      >
        <div className="prose">
          <p>
            <b>题意:</b>在 n×n 棋盘上放 n 个皇后,使得任意两个都<strong>不同行、不同列、不在同一条斜线</strong>,
            返回所有摆法。
            <b> 建树:</b>皇后一定是每行恰好一个(否则同行冲突),所以<strong>把「第几行」当决策树的层,
            把「放在第几列」当这一层的选择</strong>。dfs(row) 尝试在第 row 行的每一列放皇后,
            合法就递归到 row+1,放满 n 行就是一个解。
          </p>
          <p>
            难点在<strong>冲突检测</strong>:放 (row, col) 之前,要确认它没被上方任何皇后攻击 ——
            同列、同「主对角线」(row−col 相同)、同「副对角线」(row+col 相同)。
            亲手放一遍 4×4,注意红色的冲突和「死胡同 → 回退」:
          </p>
        </div>
        <NQueensBoard />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            动画里那几次「整行都放不下 → 退回上一行挪皇后」,就是回溯的灵魂在棋盘上的样子。
            冲突检测可以做到 <strong>O(1)</strong>:用三个集合分别记住「哪些列 / 哪些主对角线 / 哪些副对角线」
            已经有皇后。主对角线用 <span className="mono">row − col</span> 标识、副对角线用
            <span className="mono">row + col</span> 标识(同一条斜线上这个值恒定):
          </p>
        </div>
        <CodeTabs
          title="lc51_n_queens"
          java={{
            code: `class Solution {
    private List<List<String>> res = new ArrayList<>();
    private int n;
    private int[] queens;          // queens[r] = 该行皇后所在列
    private boolean[] col, diag1, diag2;

    public List<List<String>> solveNQueens(int n) {
        this.n = n;
        queens = new int[n];
        col = new boolean[n];
        diag1 = new boolean[2 * n];  // 主对角线:用 r - c + n 当下标
        diag2 = new boolean[2 * n];  // 副对角线:用 r + c 当下标
        backtrack(0);
        return res;
    }

    private void backtrack(int r) {
        if (r == n) { res.add(build()); return; }
        for (int c = 0; c < n; c++) {
            int d1 = r - c + n, d2 = r + c;
            if (col[c] || diag1[d1] || diag2[d2]) continue;  // 被攻击,剪枝
            queens[r] = c;
            col[c] = diag1[d1] = diag2[d2] = true;   // ① 放下
            backtrack(r + 1);                        // ②
            col[c] = diag1[d1] = diag2[d2] = false;  // ③ 撤销
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
            hl: [21],
            note: (
              <>
                主对角线 <code>r - c</code> 可能为负,<b>+n 偏移</b>成非负下标才能存进数组。
                三个布尔数组把冲突检测从 O(n) 降到 <b>O(1)</b>。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def solveNQueens(self, n: int) -> list[list[str]]:
        res = []
        queens = [-1] * n
        col, diag1, diag2 = set(), set(), set()   # 列 / 主对角线(r-c) / 副对角线(r+c)

        def backtrack(r: int) -> None:
            if r == n:
                res.append(["." * c + "Q" + "." * (n - c - 1) for c in queens])
                return
            for c in range(n):
                if c in col or (r - c) in diag1 or (r + c) in diag2:
                    continue                       # 被攻击,剪枝
                queens[r] = c
                col.add(c); diag1.add(r - c); diag2.add(r + c)   # ① 放
                backtrack(r + 1)                                 # ②
                col.discard(c); diag1.discard(r - c); diag2.discard(r + c)  # ③ 撤销

        backtrack(0)
        return res`,
            hl: [12, 13],
            note: (
              <>
                Python 用 <code>set</code> 存对角线,负数当 key 也无所谓,不用 +n 偏移。
                构造棋盘那行列表推导:<code>"." * c + "Q" + "." * (n-c-1)</code>。
              </>
            ),
          }}
          js={{
            code: `var solveNQueens = function (n) {
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
      col.add(c); diag1.add(r - c); diag2.add(r + c);   // ① 放
      backtrack(r + 1);                                 // ②
      col.delete(c); diag1.delete(r - c); diag2.delete(r + c); // ③ 撤销
    }
  };
  backtrack(0);
  return res;
};`,
            hl: [10],
            note: (
              <>
                三个 <code>Set</code> 的 <code>add</code> / <code>delete</code> 成对出现 ——
                又一次「选择 - 撤销」三部曲,只是撤销的是三个集合而不是一个 path。
              </>
            ),
          }}
        />
        <Callout tone="story" title="八皇后:一道 170 年的老题">
          <p>
            八皇后问题 1848 年由棋手 Max Bezzel 提出,<b>高斯</b>也研究过(还一度数错了解的个数)。
            1972 年,计算机科学家 <b>Edsger Dijkstra</b> 用它作为「结构化编程」和回溯法的经典教学案例。
            8×8 恰好有 <b>92 个</b>解。今天它成了每个程序员的回溯启蒙题 —— 你正在走的,是一条很有年头的路。
          </p>
        </Callout>
        <div className="prose">
          <p>
            <b>数独(LC 37)</b>是 N 皇后的「二维加强版」:找一个空格,试填 1~9,填一个合法的就递归解剩下的,
            填不下去就擦掉重填。合法性检查(行 / 列 / 3×3 宫)就是它的剪枝。而
            <strong>进阶做法用位运算</strong>:把每行、每列、每宫「已用的数字」压进一个 int,
            判重和取候选都变成位操作 —— 这正是 lc.md 点名的「同题两解」,详见<strong>第 04 章 · 位运算</strong>
            (用一个整数表示集合、<code>lowbit</code> 取候选)。
          </p>
        </div>
        <Callout tone="deep" title="工程现场:回溯就跑在你每天用的软件里">
          <p>
            ①<b>正则表达式引擎</b>:大多数语言的正则用回溯匹配 ——
            写出 <code>(a+)+$</code> 这种模式再喂一个坏字符串,会触发<b>灾难性回溯(catastrophic backtracking)</b>,
            CPU 直接飙满,这就是著名的 ReDoS 漏洞。
            ②<b>SAT / 约束求解器</b>:排班、数独、芯片验证背后的 DPLL 算法,本质是「带剪枝的回溯」。
            ③<b>Prolog</b> 语言的整个执行模型就是回溯。
            懂回溯,你就懂了这些系统「慢起来为什么那么慢」。
          </p>
        </Callout>
        <Callout tone="win" title="复杂度 & 面试追问">
          <p>
            时间约 <b>O(n!)</b>(每行的可选列越往后越少),空间 <b>O(n)</b>。
            追问:①「只要解的<b>个数</b>,不要具体摆法?」→ <b>LC 52 N 皇后 II</b>,不 build 棋盘、只 count++;
            ②「n 很大想更快?」→ 把三个布尔数组换成<b>位掩码</b>,一个 int 表示占用,取可选位用
            <code>lowbit</code>(第 04 章);③「数独也这么做?」→ 是,LC 37 同款思路 + 位运算优化。
          </p>
        </Callout>
      </Section>

      {/* ================= §10 题单 ================= */}
      <Section
        id="problems"
        index="10"
        title="高频题单:回溯 16 题"
        desc="按「组合 → 分割 → 子集 → 排列 → 棋盘」分组,由易到难。先想 30 秒再看提示"
        badge={<span className="chip">主线必做 + 进阶</span>}
      >
        <ProblemSet ch="backtrack" items={PROBLEMS} />
      </Section>

      {/* ================= §11 Quiz ================= */}
      <Section
        id="quiz"
        index="11"
        title="通关测验"
        desc="8 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="backtrack" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            回溯 = <b>决策树上的 DFS</b>:做选择 → 递归深入 → <b>撤销选择</b>。
            「撤销」是它的命根子,少了它,共享的路径会被污染,答案必错。
          </>,
          <>
            拿到题先回答<b>三问</b>:路径(已选)、选择列表(还能选谁)、结束条件(何时到叶子)——
            模板就自动填好了。
          </>,
          <>
            收集结果<b>必须拷贝</b>:Java <code>new ArrayList&lt;&gt;(path)</code>、
            Python <code>path[:]</code>、JS <code>[...path]</code>。存引用 = 答案被回溯改空。
          </>,
          <>
            <b>组合/子集/分割</b>用 <code>startIndex</code>「只往后选」;<b>排列</b>讲顺序,
            改用 <code>used</code> 数组。子集在<b>每个节点</b>收,组合/排列在<b>叶子</b>收。
          </>,
          <>
            <b>剪枝</b>不是可选项:在进入子树前判断「这条路还有没有可能成功」。
            77 的上界从 n 收紧到 <span className="mono">n−(k−已选)+1</span> 是范本。
          </>,
          <>
            <b>去重认准「同层」</b>:先排序,组合/子集用 <span className="mono">i&gt;start &amp;&amp; nums[i]==nums[i-1]</span>,
            排列用 <span className="mono">!used[i-1]</span> —— 两种写法,同一个目标。
          </>,
          <>
            棋盘类(51/37)把<b>行当层、列当选择</b>,冲突检测用集合/位掩码做到 O(1);
            数独的位运算优化是第 04 章的复盘。
          </>,
        ]}
      />

      <ChapterFooter ch="backtrack" />
    </main>
  );
}
