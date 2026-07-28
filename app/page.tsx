"use client";

// 序章 · 算法地图 —— 全书入口。
// 四件事:① 建立「算法 = 把问题变成一串决策」的第一直觉(高斯求和);
// ② 划清与姊妹篇 DataData 的分工边界;③ 递归 —— 全书的地基(调用栈实验室);
// ④ 四大范式鸟瞰 + 14 章世界地图 + 怎么用这套课。

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "./home.css";
import { CHAPTERS } from "@/lib/curriculum";
import {
  Reveal,
  Section,
  Callout,
  BigO,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { Quiz, type QuizItem } from "@/lib/quiz";
import { CodeTabs } from "@/lib/code";
import { HeroDecision, RecursionLab } from "./home-viz";

/* ---------- 与 DataData 的分工表 ---------- */

const BOUNDARY: { topic: string; where: string; note: string }[] = [
  { topic: "双指针 / 滑动窗口", where: "DataData · 01 数组", note: "依附「连续内存」的套路,数组章已逐帧讲透" },
  { topic: "单调栈 / 单调队列", where: "DataData · 04 栈 · 05 队列", note: "本质是栈和队列的高级用法" },
  { topic: "树的 DFS / BFS、层序变式", where: "DataData · 07 二叉树", note: "递归在树上的第一次实战" },
  { topic: "堆与 Top-K", where: "DataData · 09 堆", note: "第 K 大在本课排序章会以 Quickselect 重逢" },
  { topic: "拓扑排序 / Dijkstra / 并查集", where: "DataData · 11 · 12 图", note: "图上算法跟着图结构一起学最顺" },
  { topic: "排序 / 分治 / 二分答案 / 回溯 / 贪心 / DP / 位运算 / 数学 / 字符串算法", where: "本课(AlgoAlgo)", note: "不依附特定结构的「纯算法」,全在这里" },
];

/* ---------- 复杂度六档速览(完整课在 DataData 序章) ---------- */

const TIERS: { o: string; name: string; meet: string }[] = [
  { o: "1", name: "常数", meet: "高斯公式、位运算技巧 —— 不碰规模,直接算出" },
  { o: "logn", name: "对数", meet: "二分查找/二分答案:每步砍掉一半候选" },
  { o: "n", name: "线性", meet: "一次遍历:贪心、Kadane、一维 DP" },
  { o: "nlogn", name: "线性对数", meet: "归并/快排/堆排 —— 比较排序的天花板" },
  { o: "n2", name: "平方", meet: "二维 DP 表格、朴素双重循环" },
  { o: "2n", name: "指数", meet: "子集枚举、无剪枝回溯 —— DP 要拯救的就是它" },
];

/* ---------- 序章 Quiz ---------- */

const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: "「数据结构」和「算法」最贴切的关系是?",
    opts: [
      "结构是名词(数据怎么放),算法是动词(问题怎么解)—— 互相成就",
      "算法是数据结构的一部分",
      "两者是同一个东西的两种叫法",
      "数据结构比算法更重要",
    ],
    correct: 0,
    wrong: [
      undefined,
      "反了也不对 —— 二者谁也不包含谁:快排不属于任何结构,哈希表也不是算法。",
      "「怎么存」和「怎么算」是两个维度:同一个数组上可以跑一百种不同算法。",
      "没有高下:选错结构的算法会慢,没有算法的结构只是仓库。面试考的是二者的配合。",
    ],
    why: "结构决定每种操作的成本,算法负责把操作串成解法。DataData 教名词,本课教动词。",
  },
  {
    type: "choice",
    q: "一个递归函数想要不无限循环,必须具备什么?",
    opts: [
      "基准情形(base case)+ 每次递归都向它靠近",
      "调用次数不超过 1000 次",
      "在函数末尾调用自己(尾递归)",
      "用 while 循环代替 if 判断",
    ],
    correct: 0,
    wrong: [
      undefined,
      "1000 只是 Python 的默认递归深度限制,不是递归正确性的条件 —— 正确的递归可能只递归 3 层。",
      "尾递归是一种优化形态,不是必要条件 —— fact(n) = n × fact(n−1) 不是尾递归,照样正确。",
      "循环和递归是两种写法,谁也不是谁的前提。",
    ],
    why: "递归两要素:① 有一个不用递归就能直接回答的出口;② 每次调用的参数都在向出口收敛。缺一个就是栈溢出。",
  },
  {
    type: "choice",
    q: "调用 fact(3)(每层调 fact(n−1) 直到 fact(1)),调用栈里【最多】同时存在几个 fact 栈帧?",
    opts: ["3 个 —— fact(3)、fact(2)、fact(1) 同时挂在栈上", "1 个,算完一个才有下一个", "2 个", "无数个"],
    correct: 0,
    wrong: [
      undefined,
      "fact(3) 必须等 fact(2) 的结果才能继续,所以它不能退场 —— 等待者会留在栈上。",
      "fact(3) 和 fact(2) 都在等待时,fact(1) 也要压栈:3 个同时在场。",
      "有基准情形 fact(1) 兜底,栈深最多就是递归深度 n。",
    ],
    why: "递归深度 = 栈的最大高度 = 空间复杂度的来源。上面实验室的第 3 帧就是这个瞬间。",
  },
  {
    type: "choice",
    q: "计算 1+2+…+n:逐个累加是 O(n),换成高斯公式 n(n+1)/2 后是?",
    opts: ["O(1) —— 三次算术运算,与 n 无关", "O(log n)", "还是 O(n),只是常数更小", "O(n²)"],
    correct: 0,
    wrong: [
      undefined,
      "log 来自「每步砍一半」的过程,这里没有任何砍半 —— 是直接一步到位。",
      "公式里没有任何随 n 增长的循环:n 是 100 还是 10 亿,都是乘一下除一下。",
      "n² 是双重循环的形状,这里连一重循环都没有。",
    ],
    why: "更好的算法可以整档地改变增长趋势 —— 这就是「算法」这门课存在的意义:同一个问题,成本可以差出宇宙尺度。",
  },
  {
    type: "multi",
    q: "下面哪些「信号 → 范式」的直觉是对的?(多选)",
    opts: [
      "子问题会重复出现 → 动态规划(记住答案别重算)",
      "每一步的局部最优能证明不坏事 → 贪心",
      "子问题互相独立、可以拼合 → 分治",
      "数据是有序的 → 一定要用 DP",
    ],
    correct: [0, 1, 2],
    missHint: "前三条分别是 DP、贪心、分治的招牌信号 —— 再检查你漏了哪条。",
    extraHint: "「有序」的第一反应应该是二分或双指针,和 DP 没有必然关系 —— DP 的信号是「重叠子问题 + 最优子结构」。",
    why: "范式选择靠信号识别:重叠→DP,独立→分治,可证→贪心,都不沾→回溯穷举兜底。终章的选型地图会把这套雷达练到条件反射。",
  },
  {
    type: "fill",
    q: (
      <>
        对 1024 个候选答案做二分(每次砍掉一半),最坏需要大约多少次判定?(2¹⁰ = 1024,输入整数)
      </>
    ),
    placeholder: "输入一个整数…",
    answers: ["10", "10次"],
    hint: "1024 → 512 → 256 → … → 1,每一步除以 2,数一数除了几次。",
    why: "log₂1024 = 10。二分的威力全在这里:候选翻一倍,成本只加一次 —— 第 3 章「二分进阶」会把它玩出花。",
  },
  {
    type: "choice",
    q: "面试时为什么建议「先说暴力解,再谈优化」,而不是直接甩最优解?",
    opts: [
      "暴力解证明你理解了问题,优化过程展示你的思考路径 —— 这正是面试想考察的",
      "因为暴力解写起来更快,能拖延时间",
      "因为面试官通常不知道最优解",
      "没有理由,只是行业惯例",
    ],
    correct: 0,
    wrong: [
      undefined,
      "拖时间是反效果 —— 重点是暴力解给了你和面试官一个共同的讨论起点,还能兜底拿分。",
      "面试官几乎总是知道最优解 —— 他们想看的是你「怎么走到」最优解,而不是背诵结果。",
      "这是有方法论的:本课每道精讲都按「暴力 → 为什么能优化 → 最优」展开,练的就是这条路径。",
    ],
    why: "「暴力 → 优化」是能被复用的思考框架:暴力解暴露问题结构,优化点(重复计算?单调性?)指向对应范式。背最优解,换个皮就跪;会推导,题题都是老朋友。",
  },
];

/* ---------- 首屏统计 ---------- */

const STATS: { to: number; suffix?: string; label: string }[] = [
  { to: 14, label: "章节 · 由易到难" },
  { to: 150, suffix: "+", label: "LeetCode 高频题" },
  { to: 3, label: "语言对照 Java/Py/JS" },
  { to: 4, label: "大范式 分治/回溯/贪心/DP" },
];

// 进场时数字从 0 滚到目标值(easeOutCubic);尊重「减弱动态」时直接落定。
function CountStat({ to, suffix = "", label }: { to: number; suffix?: string; label: string }) {
  const [n, setN] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(to);
      return;
    }
    const dur = 900;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(eased * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);

  return (
    <div className="home-stat">
      <div className="v">
        {n}
        {suffix}
      </div>
      <div className="k">{label}</div>
    </div>
  );
}

/* ---------- 页面 ---------- */

export default function Home() {
  return (
    <main className="page" data-ch="home">
      {/* Hero */}
      <header className="home-hero">
        <div>
          <span className="home-kicker">
            <span className="pulse" />
            INTERACTIVE COURSE · DATADATA 姊妹篇
          </span>
          <h1 className="hero-title">
            把算法
            <br />
            <span className="grad">拆成慢动作</span>
          </h1>
          <p className="hero-essence">
            决策树逐帧展开、DP 表格逐格填充、候选区间一步步收窄 ——
            每一章:直觉故事 → 可视化拆解 → <strong>Java / Python / JavaScript</strong>{" "}
            三语言对照 → LeetCode 高频精讲。看见算法怎么「想」,而不是背它的代码。
          </p>
          <div className="home-cta">
            <Link href="/sorting" className="btn btn-primary cta-go">
              从第 1 章 · 排序开始 <span className="cta-arrow" aria-hidden="true">→</span>
            </Link>
            <a href="#map" className="btn">
              看世界地图
            </a>
          </div>
          <div className="home-stats">
            {STATS.map((s) => (
              <CountStat key={s.label} to={s.to} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </div>
        <Reveal delay={150}>
          <HeroDecision />
        </Reveal>
      </header>

      {/* §01 算法是什么 */}
      <Section
        id="what"
        index="01"
        title="算法到底是什么?"
        desc="一个 200 年前的小学课堂故事,讲完了这门课的全部主题"
      >
        <div className="prose">
          <p>
            1780 年代,德国一间小学教室。老师为了清静半小时,让学生把 1 加到 100。
            全班都在埋头苦算 1+2=3、3+3=6、6+4=10……只有 8 岁的高斯几秒钟就交卷了:
            他发现 1+100=101、2+99=101、3+98=101 —— 50 对,每对 101,答案
            <strong> 50 × 101 = 5050</strong>。
          </p>
          <p>
            全班同学执行的是一种算法:<strong>逐个累加,n 个数就加 n 次</strong>,
            规模翻倍,时间翻倍 —— O(n)。高斯执行的是另一种算法:
            <strong>配对求和,三次算术运算</strong>,n 是 100 还是 10 亿都一样 —— O(1)。
            同一个问题、同样正确的两个答案,成本却隔着一整个档位。
          </p>
          <p>
            这就是<strong>算法(algorithm)</strong>:解决一个问题的、
            <strong>步骤明确且必然终止</strong>的操作序列。它是菜谱,不是菜 ——
            同一道菜可以有很多份菜谱,而这门课教的就是:怎么读懂经典菜谱,
            以及怎么判断哪份菜谱更好。
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">STANDARD 01</div>
            <div className="card-title">✅ 首先要对</div>
            <p>
              对<b>所有</b>输入都对:空数组、单元素、重复值、负数、溢出边界。
              面试里挂掉的代码,九成死在边界而不是思路。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">STANDARD 02</div>
            <div className="card-title">⚡ 然后要快、要省</div>
            <p>
              用 Big-O 度量「规模变大时成本的增长趋势」:时间和空间各记一笔账。
              高斯和全班的差距,就是 O(1) 和 O(n) 的差距。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">STANDARD 03</div>
            <div className="card-title">🗣️ 最后要讲得清</div>
            <p>
              为什么对、为什么快,要能说出来 —— 贪心要给交换论证,DP 要给状态定义。
              「我背过这题」在追问面前一文不值。
            </p>
          </div>
        </div>
        <Callout tone="story" title="为什么叫 algorithm">
          <p>
            这个词来自 9 世纪波斯数学家<b>花拉子米(al-Khwārizmī)</b>的名字 ——
            他那本讲印度-阿拉伯数字运算规则的书传入欧洲后,「按花拉子米的方法算」
            渐渐变成了 algorithm。所以这个词从诞生起就是「按明确步骤办事」的意思,
            和计算机没关系 —— 计算机只是把「按步骤办事」变得极快而已。
          </p>
        </Callout>
      </Section>

      {/* §02 与 DataData 的分工 */}
      <Section
        id="boundary"
        index="02"
        title="这门课和 DataData 是什么关系?"
        desc="结构是名词,算法是动词 —— 两门课拼成完整的 DSA"
      >
        <div className="prose">
          <p>
            姊妹篇 <strong>DataData(看得见的数据结构)</strong>回答「数据怎么<strong>放</strong>」:
            数组、链表、哈希表、树、堆、图……每种结构的脾气与成本。
            本课回答「问题怎么<strong>解</strong>」:排序、二分、回溯、贪心、动态规划……
            <strong>不依附于某个特定结构的纯算法</strong>。
          </p>
          <p>
            有些套路天生长在某个结构上(双指针长在数组上、单调栈长在栈上),
            那些已经在 DataData 讲透了,本课不再重复 —— 遇到时会给出跳转指引:
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>套路</th>
                <th>在哪学</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              {BOUNDARY.map((r) => (
                <tr key={r.topic}>
                  <td><b>{r.topic}</b></td>
                  <td>{r.where}</td>
                  <td>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout tone="idea" title="推荐的学习姿势">
          <p>
            如果你还没学过数据结构,建议先完成 DataData 的前 9 章(至少到「堆」),
            再开始本课 —— 本课默认你已经知道数组/哈希/树/栈是什么。
            如果你已经会结构,直接从第 1 章「排序」出发即可,本课自成闭环。
          </p>
        </Callout>
      </Section>

      {/* §03 递归 */}
      <Section
        id="recursion"
        index="03"
        title="递归:全书的地基"
        desc="分治在递归、回溯在递归、DP 的第一步还是递归 —— 先把它焊死"
      >
        <div className="prose">
          <p>
            <strong>递归(recursion)</strong>就是函数调用自己。听起来像悖论:
            「fact(3) 的答案依赖 fact(2),fact(2) 依赖 fact(1)……」——
            但只要队伍的尽头有一个<strong>不需要问别人就知道答案的人</strong>,
            答案就能一路传回来。那个人叫<strong>基准情形(base case)</strong>。
          </p>
          <p>
            递归不是玄学,是<strong>调用栈(call stack)</strong>上实实在在的压栈与弹栈。
            亲眼看一遍 fact(3) 的一生:
          </p>
        </div>
        <RecursionLab />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">要素 01</div>
            <div className="card-title">🚪 基准情形</div>
            <p>
              不用递归就能直接回答的出口:fact(1)=1、空数组返回 0。
              <b>先写它,再写别的</b> —— 没有出口的递归是死循环。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">要素 02</div>
            <div className="card-title">🤝 递归信任</div>
            <p>
              写 fact(n) 时,<b>直接相信 fact(n−1) 会返回正确答案</b>,
              只管怎么用它拼出 fact(n)。不要在脑子里展开三层调用 —— 会疯的。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">要素 03</div>
            <div className="card-title">📉 状态收敛</div>
            <p>
              每次调用都必须<b>向基准情形靠近</b>:n−1、区间砍半、树往下走一层。
              收敛方式,就是后面每个算法的「形状」。
            </p>
          </div>
        </div>
        <CodeTabs
          title="factorial"
          java={{
            code: `// 阶乘:递归的 hello world
public long fact(int n) {
    if (n <= 1) return 1;      // ① 基准情形:出口
    return n * fact(n - 1);    // ② 信任 fact(n-1),用它拼答案
}                              // ③ n-1 在向出口收敛`,
            note: (
              <>
                <b>坑:</b>Java 默认栈约 512KB~1MB,递归几万层就会{" "}
                <code>StackOverflowError</code> —— 深递归要么改迭代,要么显式用栈模拟。
              </>
            ),
            hl: [3, 4],
          }}
          python={{
            code: `# 阶乘:递归的 hello world
def fact(n: int) -> int:
    if n <= 1:            # ① 基准情形:出口
        return 1
    return n * fact(n - 1)  # ② 信任 fact(n-1),用它拼答案
                            # ③ n-1 在向出口收敛`,
            note: (
              <>
                <b>坑:</b>Python 默认递归深度上限 <b>1000</b>(
                <code>RecursionError</code>)。刷题遇到深递归,记得{" "}
                <code>sys.setrecursionlimit(10**6)</code> 或改成迭代。
              </>
            ),
            hl: [3, 5],
          }}
          js={{
            code: `// 阶乘:递归的 hello world
function fact(n) {
  if (n <= 1) return 1;      // ① 基准情形:出口
  return n * fact(n - 1);    // ② 信任 fact(n-1),用它拼答案
}                            // ③ n-1 在向出口收敛`,
            note: (
              <>
                <b>坑:</b>JS 引擎栈深约 1 万~几万层(引擎而异),超了抛{" "}
                <code>RangeError: Maximum call stack size exceeded</code>。
                规范里的尾调用优化,主流引擎里只有 Safari 真的实现了。
              </>
            ),
            hl: [3, 4],
          }}
        />
        <Callout tone="warn" title="新手最大的坑:试图在脑内展开递归">
          <p>
            检查递归对不对,只需要三问:<b>① 出口对吗?② 假设子调用全对,这一层拼得对吗?
            ③ 参数在收敛吗?</b>三个都对,整个递归就对 —— 这叫数学归纳法,
            不是偷懒,是唯一可扩展的思考方式。想看它在树上、在决策树上怎么用,
            第 2 章分治和第 5 章回溯见。
          </p>
        </Callout>
      </Section>

      {/* §04 四大范式 */}
      <Section
        id="paradigms"
        index="04"
        title="四大范式鸟瞰:整门课的骨架"
        desc="几百道题,背后只有四种「解题世界观」+ 一盒工具"
      >
        <div className="prose">
          <p>
            LeetCode 两千多道题,套路听起来五花八门,但「不依附结构的纯算法」
            拢共只有四种世界观。先混个脸熟 —— 每一章都会回到这张图:
          </p>
        </div>
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">PARADIGM 01 · 第 5 章</div>
            <div className="card-title">🌳 穷举与回溯</div>
            <p>
              「把所有可能都试一遍」—— 但试得聪明:把可能性组织成一棵<b>决策树</b>,
              走进死胡同立刻回头(剪枝)。它最慢,却是唯一<b>永远可用</b>的兜底,
              也是理解 DP 的必经之路。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">PARADIGM 02 · 第 1–2 章</div>
            <div className="card-title">🔪 分治</div>
            <p>
              把大问题切成<b>互相独立</b>的同款小问题,递归解决再拼合:
              归并排序、快速幂、合并 K 个链表。子问题不重叠,是它和 DP 的分水岭。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">PARADIGM 03 · 第 6 章</div>
            <div className="card-title">🍀 贪心</div>
            <p>
              每一步都拿<b>当下最优</b>,永不回头。快得惊人,但必须先证明
              「局部最优不会毁掉全局最优」—— 证不出来就别贪,贪错了连错在哪都看不见。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">PARADIGM 04 · 第 7–10 章</div>
            <div className="card-title">🧠 动态规划</div>
            <p>
              穷举时发现<b>同一个子问题被算了无数遍</b>?记下来,别重算。
              「暴力递归 → 记忆化 → 递推表格」,新手最大的劝退点,
              本课用整整四章 + 逐格动画把它拆到透明。
            </p>
          </div>
        </div>
        <Callout tone="idea" title="还有一盒「工具」">
          <p>
            排序(第 1 章)、二分(第 3 章)、位运算(第 4 章)、数学(第 11 章)
            不算独立世界观,但它们是四大范式的<b>随身工具</b>:贪心几乎总以排序开场,
            二分答案的判定函数常常是贪心,状压 DP 靠位运算把集合塞进一个整数。
            工具章都很短,穿插在主线里当调剂。
          </p>
        </Callout>
      </Section>

      {/* §05 复杂度速查 */}
      <Section
        id="bigo"
        index="05"
        title="复杂度六档:本课的计价单位"
        desc="完整的 Big-O 课在 DataData 序章 —— 这里只挂一张价目表"
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>档位</th>
                <th>名字</th>
                <th>本课在哪遇到它</th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map((t) => (
                <tr key={t.o}>
                  <td><BigO o={t.o} /></td>
                  <td><b>{t.name}</b></td>
                  <td>{t.meet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout tone="deep" title="算法课的主线剧情,就是「降档」">
          <p>
            回溯把 O(2ⁿ) 剪小、DP 把 O(2ⁿ) 压成 O(n²) 甚至 O(n)、
            分治把 O(n²) 切成 O(n log n)、二分把 O(n) 砍成 O(log n)、
            数学公式把一切降到 O(1)。<b>每一章的高潮,都是一次降档的瞬间</b> ——
            而你会亲眼看着它发生。
          </p>
        </Callout>
      </Section>

      {/* §06 世界地图 */}
      <Section
        id="map"
        index="06"
        title="世界地图:14 章,由易到难"
        desc="色条 = 难度,右上 = LeetCode 出场频率 —— 点击任意一章出发"
      >
        <div className="map-grid">
          {CHAPTERS.filter((c) => c.id !== "home").map((c, i) => (
            <Reveal key={c.id} delay={Math.min(i * 40, 240)}>
              <Link
                href={c.href}
                className="map-card"
                style={{ "--ch-hue": c.hue } as React.CSSProperties}
              >
                <span className="map-watermark" aria-hidden="true">
                  {c.num}
                </span>
                <div className="map-head">
                  <span className="map-num">{c.num}</span>
                  <span className="map-title">{c.title}</span>
                  <span className="map-en" style={{ marginLeft: "auto" }}>
                    {c.en}
                  </span>
                </div>
                <p className="map-essence">{c.essence}</p>
                <div className="map-meta">
                  <span className="map-level" aria-label={`难度 ${c.level}/5`}>
                    {[1, 2, 3, 4, 5].map((l) => (
                      <i key={l} className={l <= c.level ? "on" : ""} />
                    ))}
                  </span>
                  <span className="map-freq">
                    LC 频率 <b>{"★".repeat(c.freq)}</b>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <Callout tone="idea" title="为什么是这个顺序?">
          <p>
            <b>排序、分治</b>先立「递归 + 分而治之」的地基;<b>二分</b>练熟
            「用单调性砍半」;<b>位运算</b>是轻装工具课(顺便为状压 DP 铺路);
            然后进入重头戏:<b>回溯</b>把递归树画出来 → <b>贪心</b>学会「敢贪的证明」→
            <b> DP 四章</b>接住「回溯太慢、贪心失灵」的所有场景 ——
            这条链的每一环都踩着上一环。<b>数学、字符串</b>殿后查漏,
            终章把所有范式装进一张选型地图。
          </p>
        </Callout>
      </Section>

      {/* §07 怎么用 */}
      <Section
        id="howto"
        index="07"
        title="这套课怎么用"
        desc="每章同一个节奏 —— 三步走,别跳步"
      >
        <div className="grid-3 howto">
          <div className="card">
            <div className="card-title">📖 先看懂</div>
            <p>
              直觉故事 → 为什么暴力不行 → 核心思想。每个结论都带着「为什么」,
              读不懂就退回上一节,不要硬冲。
            </p>
          </div>
          <div className="card">
            <div className="card-title">🎮 再玩透</div>
            <p>
              每章都有逐帧可视化:DP 表格亲手一格格填、决策树一步步展开。
              <b>能预测下一帧</b>,才算真看懂了。
            </p>
          </div>
          <div className="card">
            <div className="card-title">✍️ 后刷题</div>
            <p>
              精讲跟着走一遍,题单先想 30 秒再看提示。勾选进度存在本地,
              侧栏实时统计;测验全对点亮绿灯。
            </p>
          </div>
        </div>
        <Callout tone="win" title="复习节奏:D+1 / D+7 / D+21">
          <p>
            每道题做完:<b>第 2 天</b>口述思路 + 手写核心代码;<b>第 7 天</b>完整重做;
            <b>第 21 天</b>限时重做(中等题 35~45 分钟含讲解)。面试前按「范式」
            随机抽题,而不是按章节顺序回忆 —— 真实面试不会告诉你这是哪一章的题。
          </p>
        </Callout>
        <Callout tone="story" title="关于三种语言">
          <p>
            顶栏的 <b>Java / Python / JS</b> 切换全站联动:切一次,所有代码窗口一起换。
            算法逻辑在三种语言里<b>完全一致</b>,差异只在语法和标准库 ——
            每个精讲的三份题解都带针对该语言的坑点注释。
          </p>
        </Callout>
      </Section>

      {/* §08 Quiz */}
      <Section
        id="quiz"
        index="08"
        title="快问快答:序章通关测验"
        desc="7 题 —— 全对点亮侧栏第一盏绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="home" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            算法 = <b>步骤明确、必然终止的解题菜谱</b>;好算法三标准:对(含边界)、
            快且省(Big-O)、讲得清(可证明)。
          </>,
          <>
            <b>结构是名词,算法是动词</b>:依附结构的套路在 DataData,
            纯算法(排序/二分/回溯/贪心/DP/位运算/数学)在本课。
          </>,
          <>
            递归三要素:<b>基准情形、递归信任、状态收敛</b> ——
            检查递归只用三问,别在脑内展开调用树。
          </>,
          <>
            四大范式一句话:子问题独立 → <b>分治</b>;局部最优可证 → <b>贪心</b>;
            子问题重叠 → <b>DP</b>;都不沾 → <b>回溯</b>穷举兜底。
          </>,
          <>
            整门课的主线是<b>降档</b>:O(2ⁿ) → O(n²) → O(n log n) → O(n) → O(log n) → O(1),
            每一章的高潮都是一次降档的瞬间。
          </>,
          <>
            刷题节奏:先想 30 秒再看提示;<b>D+1 口述、D+7 重做、D+21 限时</b>;
            面试前按范式抽题,不按章节顺序。
          </>,
        ]}
      />

      <ChapterFooter ch="home" />
    </main>
  );
}
