"use client";

// 终章 · 范式地图 —— 全书的收束:
// ① 范式选型向导(交互决策树);② 全书题单总表(进度全站互通);
// ③ 20 周学习计划;④ 模拟面试指南(六标准 + D+1/D+7/D+21);
// ⑤ DataData × AlgoAlgo 全景图;⑥ 终极测验(跨章选型)。

import Link from "next/link";
import type { CSSProperties } from "react";
import "./chapter.css";
import {
  Hero,
  Section,
  Callout,
  KeyPoints,
  ChapterFooter,
  Reveal,
} from "@/lib/kit";
import { Quiz } from "@/lib/quiz";
import { ProblemSet, type Problem } from "@/lib/problems";
import { useProgress } from "@/lib/progress";
import { CHAPTERS, type ChapterId } from "@/lib/curriculum";
import { T, useL } from "@/lib/i18n";
import { DecisionLab } from "./viz";

// 12 章各自的 PROBLEMS 直接复用,保证与各章一字不差、进度互通。
import { PROBLEMS as P_SORTING } from "@/lib/sorting-data";
import { PROBLEMS as P_DIVIDE } from "@/lib/divide-data";
import { PROBLEMS as P_BINARY } from "@/lib/binary-data";
import { PROBLEMS as P_BITS } from "@/lib/bits-data";
import { PROBLEMS as P_BACKTRACK } from "@/lib/backtrack-data";
import { PROBLEMS as P_GREEDY } from "@/lib/greedy-data";
import { PROBLEMS as P_DP } from "@/lib/dp-data";
import { PROBLEMS as P_KNAPSACK } from "@/lib/knapsack-data";
import { PROBLEMS as P_DPSEQ } from "@/lib/dp-seq-data";
import { PROBLEMS as P_DPPRO } from "@/lib/dp-pro-data";
import { PROBLEMS as P_MATH } from "@/lib/math-data";
import { PROBLEMS as P_STRINGS } from "@/lib/strings-data";
import {
  WEEKS,
  TRACK_LABEL,
  SIDE_CHAPTERS,
  STANDARDS,
  REVIEW,
  PANORAMA,
  QUIZ,
} from "@/lib/atlas-data";

/* ---------- 全书题单分组(pid = `<ch>/<lc>`,与各章一致) ---------- */

const GROUPS: { ch: ChapterId; problems: Problem[] }[] = [
  { ch: "sorting", problems: P_SORTING },
  { ch: "divide", problems: P_DIVIDE },
  { ch: "binary", problems: P_BINARY },
  { ch: "bits", problems: P_BITS },
  { ch: "backtrack", problems: P_BACKTRACK },
  { ch: "greedy", problems: P_GREEDY },
  { ch: "dp", problems: P_DP },
  { ch: "knapsack", problems: P_KNAPSACK },
  { ch: "dp-seq", problems: P_DPSEQ },
  { ch: "dp-pro", problems: P_DPPRO },
  { ch: "math", problems: P_MATH },
  { ch: "strings", problems: P_STRINGS },
];

const TOTAL = GROUPS.reduce((s, g) => s + g.problems.length, 0);

const CHIPS = [
  {
    id: "decision",
    n: "01",
    label: { en: "Choosing a paradigm", zh: "选型向导" },
  },
  { id: "problems", n: "02", label: { en: "All problems", zh: "题单总表" } },
  { id: "plan", n: "03", label: { en: "20-week plan", zh: "20 周计划" } },
  { id: "interview", n: "04", label: { en: "Interview guide", zh: "面试指南" } },
  { id: "panorama", n: "05", label: { en: "Both courses", zh: "全景图" } },
  { id: "quiz", n: "06", label: { en: "Final quiz", zh: "终极测验" } },
];

export default function AtlasChapter() {
  const { data, ready } = useProgress();
  const L = useL();

  // 只统计「本课 12 章」范围内已勾选的题,避免受其他键干扰。
  const chSet = new Set<string>(GROUPS.map((g) => g.ch));
  const done = ready
    ? Object.keys(data.problems).filter((k) => chSet.has(k.split("/")[0]))
        .length
    : 0;
  const shown = Math.min(done, TOTAL);
  const pct = TOTAL > 0 ? Math.round((shown / TOTAL) * 100) : 0;

  return (
    <main className="page" data-ch="atlas">
      <Hero
        ch="atlas"
        title={{
          en: (
            <>
              Finale · <span className="grad">Paradigm atlas</span>
            </>
          ),
          zh: (
            <>
              终章 · <span className="grad">范式地图</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              You have practiced twelve chapters of algorithms. This last one
              teaches a single skill: <strong>reading a problem statement and
              deciding which approach to try first</strong>. There is nothing
              mysterious about it. Ask four questions in order — what is being
              asked, can a greedy choice be proved safe, do the subproblems
              repeat, and is there a monotonic test on the answer — and the
              approach follows.
            </>
          ),
          zh: (
            <>
              十二种算法都练过了,最后一课只教一件事:<strong>看到问题的那一刻,
              你脑子里应该亮起哪盏灯</strong>。选型不是玄学 —— 依次问自己
              「求什么 → 贪心能不能证明 → 子问题重不重叠 → 答案有没有单调判定」,
              灯自己会亮。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* §01 选型向导 */}
      <Section
        id="decision"
        index="01"
        title={{ en: "Choosing a paradigm", zh: "范式选型向导" }}
        desc={{
          en: "Take any problem and walk through these questions. After enough repetitions you will ask them without the page.",
          zh: "拿到任何一道题,先陪自己走一遍这几问 —— 走多了,它会长在你脑子里",
        }}
      >
        <DecisionLab />
        <Callout
          tone="idea"
          title={{
            en: "How to use the guide",
            zh: "向导的正确用法",
          }}
        >
          <p>
            <T
              en={
                <>
                  It is not a lookup table of correct answers. It is an{" "}
                  <b>order of questions</b>: first what the problem asks for,
                  then whether a greedy choice can be proved safe, whether the
                  subproblems repeat, and whether a candidate answer can be
                  tested. Real problems often need a <b>combination</b>:
                  backtracking with pruning, greedy with a heap, binary search
                  wrapped around a DP check. Decide each part separately, then
                  put them together. If you reach a dead end and notice the
                  subproblems repeating, that is the signal for DP.
                </>
              }
              zh={
                <>
                  它不是标准答案,是<b>提问顺序</b>:先问「求什么」,再问「贪心能不能证明、
                  子问题重不重叠、猜一个答案能不能验证」。真实题目常要<b>组合</b>
                  (回溯 + 剪枝、贪心 + 堆、二分套 DP 判定)—— 先各自定范式,再拼起来。
                  走到死胡同却发现子问题重叠了?那就是 DP 该出场的信号。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* §02 全书题单总表 */}
      <Section
        id="problems"
        index="02"
        title={{
          en: `Every problem in the course: ${TOTAL}`,
          zh: `全书题单总表:${TOTAL} 题`,
        }}
        desc={{
          en: "The high-frequency problems from all twelve chapters. Your checkmarks are shared with each chapter page, so this is one single list.",
          zh: "十二章的高频题全在这里,勾选状态与各章互通 —— 这就是你的刷题地图",
        }}
      >
        <div className="atl-banner">
          <div>
            <div className="big">
              {shown}
              <span style={{ fontSize: 20, opacity: 0.6 }}> / {TOTAL}</span>
            </div>
            <div className="sub">
              <T en={<>{pct}% done</>} zh={<>已完成 {pct}%</>} />
            </div>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label={L({
              en: "Problems completed across the course",
              zh: "全书题单完成进度",
            })}
          >
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="sub">
            <T
              en={
                <>
                  A suggested rhythm: on the first pass through a chapter, do
                  the easy problems to get used to the pattern.
                  <br />
                  On the second pass, only the medium ones. On the third pass,
                  work against a timer.
                </>
              }
              zh={
                <>
                  建议节奏:每章先把 Easy 扫完建立手感,
                  <br />
                  二刷只做 Medium,三刷限时。绿灯会陪你记录这一切。
                </>
              }
            />
          </div>
        </div>
        {GROUPS.map((g) => {
          const meta = CHAPTERS.find((c) => c.id === g.ch)!;
          return (
            <Reveal key={g.ch}>
              <div className="atl-group">
                <div
                  className="atl-group-head"
                  style={{ "--gh": meta.hue } as CSSProperties}
                >
                  <span className="atl-group-num">{meta.num}</span>
                  <span className="atl-group-title">{L(meta.title)}</span>
                  <Link href={meta.href} className="chip">
                    <T en="Review →" zh="去复习 →" />
                  </Link>
                  <span className="atl-group-count">
                    <T
                      en={<>{g.problems.length} problems</>}
                      zh={<>{g.problems.length} 题</>}
                    />
                  </span>
                </div>
                <ProblemSet ch={g.ch} items={g.problems} />
              </div>
            </Reveal>
          );
        })}
      </Section>

      {/* §03 20 周学习计划 */}
      <Section
        id="plan"
        index="03"
        title={{ en: "A 20-week plan", zh: "20 周学习计划" }}
        desc={{
          en: "The recommended order as a table. The structures track (DataData) and the algorithms track (this course) alternate.",
          zh: "推荐顺序整理成表 —— 结构篇(DataData)与算法篇(本课)交替推进",
        }}
        badge={{
          en: "🗓 5 study days, 1 review day, 1 rest day",
          zh: "🗓 每周 5 学 1 复 1 休",
        }}
      >
        <div className="table-wrap atl-plan">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Week" zh="周次" />
                </th>
                <th>
                  <T en="Main topic" zh="主线内容" />
                </th>
                <th>
                  <T en="Track" zh="归属" />
                </th>
                <th>
                  <T en="What you should be able to do" zh="达标要求" />
                </th>
              </tr>
            </thead>
            <tbody>
              {WEEKS.map((w) => (
                <tr key={w.id}>
                  <td className="atl-wk">{L(w.wk)}</td>
                  <td>
                    {w.href ? (
                      <Link href={w.href}>
                        <b>{L(w.topic)}</b>
                      </Link>
                    ) : (
                      L(w.topic)
                    )}
                  </td>
                  <td>
                    <span className="atl-track" data-t={w.track}>
                      {L(TRACK_LABEL[w.track])}
                    </span>
                  </td>
                  <td>{L(w.goal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout
          tone="deep"
          title={{
            en: "Five optional chapters you can insert at any point",
            zh: "五门「工具 / 补漏」章,随时插进来",
          }}
        >
          <div className="atl-plan-note">
            {SIDE_CHAPTERS.map((s) => {
              const meta = CHAPTERS.find((c) => c.id === s.ch)!;
              return (
                <div key={s.ch} className="atl-plan-note-item">
                  <Link href={s.href}>
                    <b>
                      {meta.num} {L(meta.title)}
                    </b>
                  </Link>
                  <T en=" — " zh=" —— " />
                  {L(s.note)}
                </div>
              );
            })}
          </div>
        </Callout>
        <Callout
          tone="story"
          title={{
            en: "Where is the structures track?",
            zh: "结构篇在哪里?",
          }}
        >
          <p>
            <T
              en={
                <>
                  The weeks marked <b>Structures</b> (arrays, hash tables,
                  linked lists, stacks and queues, trees, heaps, graphs) belong
                  to the companion course <b>DataData · Data structures you can
                  see</b>. Two pointers, the sliding window, the monotonic
                  stack, BFS and DFS, topological sort, and Dijkstra are taught
                  there. The two courses were written to fit together into one
                  20-week route.
                </>
              }
              zh={
                <>
                  表里标「结构篇」的周次(数组 / 哈希 / 链表 / 栈队列 / 树 / 堆 / 图…)
                  由姊妹篇 <b>DataData · 看得见的数据结构</b>负责 —— 双指针、滑窗、单调栈、
                  BFS/DFS、拓扑排序、Dijkstra 都在那门课。两门课本就是为了拼成一条完整的
                  20 周路线而设计的。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* §04 模拟面试指南 */}
      <Section
        id="interview"
        index="04"
        title={{ en: "Mock interview guide", zh: "模拟面试指南" }}
        desc={{
          en: "Having solved a problem is not the same as knowing it. Here are six things an interview expects, and a review schedule that keeps what you learned.",
          zh: "「刷完」不等于「会了」—— 面试级完成标准的六条,和把知识焊进长期记忆的复习节奏",
        }}
        badge={{ en: "🎯 Interview standard", zh: "🎯 面试级标准" }}
      >
        <p className="sec-desc" style={{ marginTop: -4 }}>
          <T
            en={
              <>
                A problem counts as finished only when all <b>six standards</b>{" "}
                hold at the same time:
              </>
            }
            zh={
              <>
                <b>六项标准</b>必须同时满足,才算真正「刷完」一道题:
              </>
            }
          />
        </p>
        <div className="atl-std">
          {STANDARDS.map((s, i) => (
            <div key={i} className="atl-std-card">
              <span className="atl-std-ico" aria-hidden>
                {s.icon}
              </span>
              <div>
                <span className="atl-std-n">
                  <T
                    en={<>Standard {String(i + 1).padStart(2, "0")}</>}
                    zh={<>标准 {String(i + 1).padStart(2, "0")}</>}
                  />
                </span>
                <span className="atl-std-text">{s.text}</span>
              </div>
            </div>
          ))}
        </div>
        <Callout
          tone="win"
          title={{
            en: "Review schedule: three points that work against forgetting",
            zh: "复习节奏:对抗遗忘曲线的三个时间点",
          }}
        >
          <p>
            <T
              en="Solving a problem once is not the end of it. Come back on this schedule, and being able to solve it turns into being fluent at it."
              zh="学一道题不是做完就结束。按下面的节奏回访,「会」才会沉淀成「熟」:"
            />
          </p>
          <div className="atl-review">
            {REVIEW.map((r) => (
              <div key={r.id} className="atl-review-card">
                <div className="atl-review-tag">{L(r.tag)}</div>
                <div className="atl-review-when">{L(r.when)}</div>
                <div className="atl-review-how">{r.how}</div>
              </div>
            ))}
          </div>
        </Callout>
      </Section>

      {/* §05 全景图 */}
      <Section
        id="panorama"
        index="05"
        title={{
          en: "DataData × AlgoAlgo",
          zh: "DataData × AlgoAlgo 全景图",
        }}
        desc={{
          en: "Data structures are the nouns, algorithms are the verbs. Together the two courses cover data structures and algorithms as a whole.",
          zh: "数据结构是名词,算法是动词 —— 两门课拼在一起,才是完整的 DSA",
        }}
      >
        <div className="atl-pano">
          <div className="atl-pano-col" data-side={PANORAMA[0].side}>
            <div className="atl-pano-side">{L(PANORAMA[0].sideLabel)}</div>
            <div className="atl-pano-name">{L(PANORAMA[0].name)}</div>
            <p className="atl-pano-desc">{PANORAMA[0].desc}</p>
            <ul className="atl-pano-list">
              {PANORAMA[0].items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </div>
          <div className="atl-pano-join" aria-hidden>
            <span className="x">×</span>
            <span className="lab">
              <T
                en="Nouns × verbs = solving problems"
                zh="名词 × 动词 = 解题力"
              />
            </span>
          </div>
          <div className="atl-pano-col" data-side={PANORAMA[1].side}>
            <div className="atl-pano-side">{L(PANORAMA[1].sideLabel)}</div>
            <div className="atl-pano-name">{L(PANORAMA[1].name)}</div>
            <p className="atl-pano-desc">{PANORAMA[1].desc}</p>
            <ul className="atl-pano-list">
              {PANORAMA[1].items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </div>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "Why the material is split into two courses",
            zh: "为什么要分成两门课",
          }}
        >
          <p>
            <T
              en={
                <>
                  Both courses share one shell and one design language, but the
                  split is deliberate. A structure decides <b>how fast you can
                  read and write the data</b>. An algorithm decides <b>how a
                  problem is turned into a sequence of decisions</b>. Learn the
                  nouns first, then practice the verbs. Put them together and
                  you have a complete route from the beginning to an interview.
                </>
              }
              zh={
                <>
                  同一套外壳、同一套设计语言,却刻意拆成「结构」与「算法」两册:
                  结构决定<b>能怎么快地存取数据</b>,算法决定<b>怎么把问题拆成一串决策</b>。
                  先认全名词,再练熟动词 —— 拼起来,你就有了从零到面试的完整地图。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* §06 终极测验 */}
      <Section
        id="quiz"
        index="06"
        title={{
          en: "Final quiz: 8 questions on choosing a paradigm",
          zh: "终极测验:8 道跨章选型题",
        }}
        desc={{
          en: "No template recall. Every question gives you a problem statement and asks which approach you would reach for, which is what an interview actually does.",
          zh: "不考模板背诵,只考「看到题,你会亮哪盏灯」—— 这才是面试真正的样子",
        }}
        badge={{ en: "✎ Whole-course quiz", zh: "✎ 全书大考" }}
      >
        <Quiz ch="atlas" items={QUIZ} />
      </Section>

      <KeyPoints
        title={{ en: "The last summary card", zh: "全书最后一张要点卡" }}
        points={[
          <T
            key="k1"
            en={
              <>
                Ask the four questions in order: <b>what is being asked → can a
                greedy choice be proved safe → do the subproblems repeat → is
                there a monotonic test on the answer</b>. By the end of them the
                paradigm has usually chosen itself.
              </>
            }
            zh={
              <>
                选型四问依次走:<b>求什么 → 贪心能否证明 → 子问题重不重叠 →
                答案有无单调判定</b>。答完,该用的范式自己就浮出来了。
              </>
            }
          />,
          <T
            key="k2"
            en={
              <>
                One line runs through the four DP chapters:{" "}
                <b>backtracking is too slow and greedy cannot be proved, so DP
                is the fallback</b>. Coin Change (LC 322) with coins [1, 3, 4]
                is the counterexample that makes &quot;greedy can fail&quot; concrete.
              </>
            }
            zh={
              <>
                一条主线贯穿 DP 四章:<b>回溯太慢、贪心失灵 ⇒ DP 兜底</b>。
                322 硬币 [1,3,4] 是那个让你永远记住「贪心会失效」的反例。
              </>
            }
          />,
          <T
            key="k3"
            en={
              <>
                Hard problems combine paradigms: backtracking with pruning,
                greedy with a heap, binary search around a feasibility check,
                divide and conquer upgraded to DP. <b>Decide each part
                separately, then combine</b>. The same problem often has more
                than one valid view (53, 122, 322).
              </>
            }
            zh={
              <>
                难题拼积木:回溯 + 剪枝、贪心 + 堆、二分套判定、分治升级成 DP ——
                <b>先各自定范式,再组合</b>;同一题常有多种视角(53 / 122 / 322)。
              </>
            }
          />,
          <T
            key="k4"
            en={
              <>
                No paradigm is fastest everywhere. When greedy applies it uses
                the least time and memory; DP is the general fallback, not the
                faster choice. Being able to explain{" "}
                <b>why you did not use X</b> counts for more than being able to
                use X.
              </>
            }
            zh={
              <>
                没有「万能最快」的范式:能贪心时贪心最省,DP 是通用兜底而非更快。
                能讲清<b>「我为什么不用 X」</b>,比会用 X 更能打动面试官。
              </>
            }
          />,
          <T
            key="k5"
            en={
              <>
                &quot;Finished&quot; means all six interview standards hold, plus D+1
                explaining it out loud, D+7 redoing it, and D+21 redoing it
                against a timer. Work through the full problem list three times
                and fill in every chapter. <b>Then go and take the real
                test.</b> 🎓
              </>
            }
            zh={
              <>
                「刷完」= 六条面试标准全过 + D+1 口述 / D+7 重做 / D+21 限时。
                题单总表刷三遍,每章绿灯点满 —— <b>然后,去外面的世界考试吧</b>。🎓
              </>
            }
          />,
        ]}
      />

      <ChapterFooter ch="atlas" />
    </main>
  );
}
