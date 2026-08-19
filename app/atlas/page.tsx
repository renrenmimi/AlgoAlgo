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
import { useL } from "@/lib/i18n";
import { DecisionLab } from "./viz";

// 10 个已完工章节:直接复用各自的 PROBLEMS,保证一字不差、进度互通。
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
// 11 数学、12 字符串数据文件尚未落地,先用终章内联题单(pid 仍互通)。
import {
  MATH_PROBLEMS,
  STRING_PROBLEMS,
  WEEKS,
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
  { ch: "math", problems: MATH_PROBLEMS },
  { ch: "strings", problems: STRING_PROBLEMS },
];

const TOTAL = GROUPS.reduce((s, g) => s + g.problems.length, 0);

const CHIPS = [
  { id: "decision", n: "01", label: "选型向导" },
  { id: "problems", n: "02", label: "题单总表" },
  { id: "plan", n: "03", label: "20 周计划" },
  { id: "interview", n: "04", label: "面试指南" },
  { id: "panorama", n: "05", label: "全景图" },
  { id: "quiz", n: "06", label: "终极测验" },
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
        title={
          <>
            终章 · <span className="grad">范式地图</span>
          </>
        }
        essence={
          <>
            十二种算法都练过了,最后一课只教一件事:<strong>看到问题的那一刻,
            你脑子里应该亮起哪盏灯</strong>。选型不是玄学 —— 依次问自己
            「求什么 → 能不能贪 → 子问题重不重叠 → 答案单不单调」,灯自己会亮。
          </>
        }
        chips={CHIPS}
      />

      {/* §01 选型向导 */}
      <Section
        id="decision"
        index="01"
        title="范式选型向导"
        desc="拿到任何一道题,先陪自己走一遍这几问 —— 走多了,它会长在你脑子里"
      >
        <DecisionLab />
        <Callout tone="idea" title="向导的正确用法">
          <p>
            它不是标准答案,是<b>提问顺序</b>:先问「求什么」,再问「贪心能不能证明、
            子问题重不重叠、答案有没有单调值域」。真实题目常要<b>组合</b>
            (回溯 + 剪枝、贪心 + 堆、二分套 DP)—— 先各自定范式,再拼起来。
            走到死胡同发现子问题重叠了?那就是 DP 该出场的信号。
          </p>
        </Callout>
      </Section>

      {/* §02 全书题单总表 */}
      <Section
        id="problems"
        index="02"
        title={`全书题单总表:${TOTAL} 题`}
        desc="十二章的高频题全在这里,勾选状态与各章互通 —— 这就是你的刷题地图"
      >
        <div className="atl-banner">
          <div>
            <div className="big">
              {shown}
              <span style={{ fontSize: 20, opacity: 0.6 }}> / {TOTAL}</span>
            </div>
            <div className="sub">已完成 {pct}%</div>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="sub">
            建议节奏:每章先把 Easy 扫完建立手感,<br />
            二刷只做 Medium,三刷限时。绿灯会陪你记录这一切。
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
                    去复习 →
                  </Link>
                  <span className="atl-group-count">{g.problems.length} 题</span>
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
        title="20 周学习计划"
        desc="lc.md 的推荐顺序整理成表 —— 结构篇(DataData)与算法篇(本课)交替推进"
        badge={<span className="chip">🗓 每周 5 学 1 复 1 休</span>}
      >
        <div className="table-wrap atl-plan">
          <table className="t-table">
            <thead>
              <tr>
                <th>周次</th>
                <th>主线内容</th>
                <th>归属</th>
                <th>达标要求</th>
              </tr>
            </thead>
            <tbody>
              {WEEKS.map((w) => (
                <tr key={w.wk}>
                  <td className="atl-wk">{w.wk}</td>
                  <td>
                    {w.href ? (
                      <Link href={w.href}>
                        <b>{w.topic}</b>
                      </Link>
                    ) : (
                      w.topic
                    )}
                  </td>
                  <td>
                    <span className="atl-track" data-t={w.track}>
                      {w.track}
                    </span>
                  </td>
                  <td>{w.goal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout tone="deep" title="三门「工具 / 补漏」章,随时插进来">
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
                  {" —— "}
                  {s.note.replace(/^[^:：]+[:：]/, "")}
                </div>
              );
            })}
          </div>
        </Callout>
        <Callout tone="story" title="结构篇在哪里?">
          <p>
            表里标「结构篇」的周次(数组 / 哈希 / 链表 / 栈队列 / 树 / 堆 / 图…)
            由姊妹篇 <b>DataData · 看得见的数据结构</b>负责 —— 双指针、滑窗、单调栈、
            BFS/DFS、拓扑排序、Dijkstra 都在那门课。两门课本就是为了拼成一条完整
            20 周路线而设计的。
          </p>
        </Callout>
      </Section>

      {/* §04 模拟面试指南 */}
      <Section
        id="interview"
        index="04"
        title="模拟面试指南"
        desc="「刷完」不等于「会了」—— 面试级完成标准的六条,和把知识焊进长期记忆的复习节奏"
        badge={<span className="chip">🎯 面试级标准</span>}
      >
        <p className="sec-desc" style={{ marginTop: -4 }}>
          <b>六项标准</b>必须同时满足,才算真正「刷完」一道题:
        </p>
        <div className="atl-std">
          {STANDARDS.map((s, i) => (
            <div key={i} className="atl-std-card">
              <span className="atl-std-ico" aria-hidden>
                {s.icon}
              </span>
              <div>
                <span className="atl-std-n">标准 {String(i + 1).padStart(2, "0")}</span>
                <span className="atl-std-text">{s.text}</span>
              </div>
            </div>
          ))}
        </div>
        <Callout tone="win" title="复习节奏:对抗遗忘曲线的三个时间点">
          <p>
            学一道题不是做完就结束。按下面的节奏回访,「会」才会沉淀成「熟」:
          </p>
          <div className="atl-review">
            {REVIEW.map((r) => (
              <div key={r.tag} className="atl-review-card">
                <div className="atl-review-tag">{r.tag}</div>
                <div className="atl-review-when">{r.when}</div>
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
        title="DataData × AlgoAlgo 全景图"
        desc="数据结构是名词,算法是动词 —— 两门课拼在一起,才是完整的 DSA"
      >
        <div className="atl-pano">
          <div className="atl-pano-col" data-side={PANORAMA[0].side}>
            <div className="atl-pano-side">{PANORAMA[0].side}</div>
            <div className="atl-pano-name">{PANORAMA[0].name}</div>
            <p className="atl-pano-desc">{PANORAMA[0].desc}</p>
            <ul className="atl-pano-list">
              {PANORAMA[0].items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
          <div className="atl-pano-join" aria-hidden>
            <span className="x">×</span>
            <span className="lab">名词 × 动词 = 解题力</span>
          </div>
          <div className="atl-pano-col" data-side={PANORAMA[1].side}>
            <div className="atl-pano-side">{PANORAMA[1].side}</div>
            <div className="atl-pano-name">{PANORAMA[1].name}</div>
            <p className="atl-pano-desc">{PANORAMA[1].desc}</p>
            <ul className="atl-pano-list">
              {PANORAMA[1].items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
        </div>
        <Callout tone="idea" title="为什么要分成两门课">
          <p>
            同一套外壳、同一套设计语言,却刻意拆成「结构」与「算法」两册:
            结构决定<b>能怎么快地存取数据</b>,算法决定<b>怎么把问题拆成一串决策</b>。
            先认全名词,再练熟动词 —— 拼起来,你就有了从零到面试的完整地图。
            学完这一套,不必再去别处学算法。
          </p>
        </Callout>
      </Section>

      {/* §06 终极测验 */}
      <Section
        id="quiz"
        index="06"
        title="终极测验:8 道跨章选型题"
        desc="不考模板背诵,只考「看到题,你会亮哪盏灯」—— 这才是面试真正的样子"
        badge={<span className="chip">✎ 全书大考</span>}
      >
        <Quiz ch="atlas" items={QUIZ} />
      </Section>

      <KeyPoints
        title="全书最后一张要点卡"
        points={[
          <>
            选型四问依次走:<b>求什么 → 贪心能否证明 → 子问题重不重叠 →
            答案有无单调值域</b>。答完,该用的范式自己就浮出来了。
          </>,
          <>
            一条主线贯穿 DP 四章:<b>回溯太慢、贪心失灵 ⇒ DP 兜底</b>。
            322 硬币 [1,3,4] 是那个让你永远记住「贪心会失效」的反例。
          </>,
          <>
            难题拼积木:回溯 + 剪枝、贪心 + 堆、二分套判定、分治升级成 DP ——
            <b>先各自定范式,再组合</b>;同一题常有多种视角(53 / 122 / 322)。
          </>,
          <>
            没有「万能最快」的范式:能贪心时贪心最省,DP 是通用兜底而非更快。
            能讲清<b>「我为什么不用 X」</b>,比会用 X 更能打动面试官。
          </>,
          <>
            「刷完」= 六条面试标准全过 + D+1 口述 / D+7 重做 / D+21 限时。
            题单总表刷三遍,每章绿灯点满 —— <b>然后,去外面的世界考试吧</b>。🎓
          </>,
        ]}
      />

      <ChapterFooter ch="atlas" />
    </main>
  );
}
