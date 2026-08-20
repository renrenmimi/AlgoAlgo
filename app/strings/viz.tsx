"use client";

// 第 12 章 · 字符串算法的专属可视化。全章招牌是「把失败变成情报」,所以:
//   - BruteForceMatch:暴力匹配双行对齐 —— 亲眼看主串指针一次次被拽回去重来。
//   - NextBuilder:★本章招牌★ next 数组构建(双行:上行 pattern 字符、下行 next 值),
//     逐帧展示「模式串自我匹配」,含 while 回退链。
//   - KMPMatch:KMP 匹配双行对齐 —— 主串指针 i 永不回退,模式串沿 next 向右滑。
//   - RollingHash:Rabin-Karp 滚动哈希,窗口右移时 O(1) 更新哈希值。
//   - CenterExpand:LC 5 回文中心扩展(奇/偶两种中心)。
//
// 约定:next[i] = 子串 s[0..i] 的「最长相等真前后缀」长度,next[0]=0。
// 自定义单元格状态 pref / src 的配色写在 chapter.css([data-ch="strings"] 下)。
//
// 双语:帧旁白直接写 <T en zh />;组件的文案型 props 传 { en, zh }。
// 指针标签 i / j / l / r 是代码里的变量名,两种语言都不翻译。

import { type ReactNode } from "react";
import { T, useL, type Loc } from "@/lib/i18n";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================================================================
   通用小工具:字符行 / 指针行
   ================================================================ */

interface Tok {
  v: string;
  state?: string;
  /** 索引标签覆盖(模式行用模式相对下标) */
  idx?: number;
}

function CharRow({
  toks,
  total,
  cellW,
  showIdx = true,
}: {
  toks: (Tok | null)[];
  total: number;
  cellW: number;
  showIdx?: boolean;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${total}, ${cellW}px)`, gap: 4 }}>
      {Array.from({ length: total }).map((_, i) => {
        const c = toks[i];
        if (!c) return <div key={i} style={{ width: cellW - 4, height: cellW - 4 }} aria-hidden />;
        return (
          <div
            key={i}
            className={`cell${c.state ? " " + c.state : ""}`}
            style={{ width: cellW - 4, height: cellW - 4, fontSize: 15 }}
          >
            {c.v}
            {showIdx && <span className="cell-idx">{c.idx ?? i}</span>}
          </div>
        );
      })}
    </div>
  );
}

function PtrRow({
  ptrs,
  total,
  cellW,
}: {
  ptrs: { i: number; label: string }[];
  total: number;
  cellW: number;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${total}, ${cellW}px)`,
        gap: 4,
        minHeight: 24,
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const here = ptrs.filter((p) => p.i === i);
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
            {here.map((p) => (
              <span key={p.label} className="ptr">
                {p.label}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/** 行首的「文本 / 模式」标签 —— 两种语言都短,52px 的槽位放得下。 */
const TAG_TEXT = <T en="text" zh="文本" />;
const TAG_PATTERN = <T en="pattern" zh="模式" />;

/* ================================================================
   双行对齐播放器(暴力 / KMP 共用)
   ================================================================ */

interface AlignFrame {
  text: (Tok | null)[];
  pat: (Tok | null)[];
  patOffset: number;
  ti?: number;
  pj?: number;
  msg: ReactNode;
}

function shift(toks: Tok[], offset: number): (Tok | null)[] {
  const out: (Tok | null)[] = [];
  for (let i = 0; i < offset; i++) out.push(null);
  return out.concat(toks);
}

function TwoRowMatch({
  title,
  frames,
  total,
  cellW = 46,
  intervalMs = 1200,
}: {
  title: Loc<ReactNode>;
  frames: AlignFrame[];
  total: number;
  cellW?: number;
  intervalMs?: number;
}) {
  const s = useStepper(frames.length, intervalMs);
  const L = useL();
  const f = frames[s.step];
  return (
    <div className="viz">
      <div className="viz-title">{L(title)}</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 6, overflowX: "auto" }}>
        <PtrRow ptrs={f.ti !== undefined ? [{ i: f.ti, label: "i" }] : []} total={total} cellW={cellW} />
        <div className="str-tagrow">
          <span className="str-tag">{TAG_TEXT}</span>
          <CharRow toks={f.text} total={total} cellW={cellW} />
        </div>
        <PtrRow
          ptrs={f.pj !== undefined ? [{ i: f.patOffset + f.pj, label: "j" }] : []}
          total={total}
          cellW={cellW}
        />
        <div className="str-tagrow" style={{ paddingBottom: 22 }}>
          <span className="str-tag">{TAG_PATTERN}</span>
          <CharRow toks={shift(f.pat as Tok[], f.patOffset)} total={total} cellW={cellW} />
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={frames.length} />
    </div>
  );
}

/* ---- 前缀函数(全章统一实现) ---- */

function prefixFunction(p: string): number[] {
  const n = p.length;
  const next = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    let j = next[i - 1];
    while (j > 0 && p[i] !== p[j]) j = next[j - 1];
    if (p[i] === p[j]) j++;
    next[i] = j;
  }
  return next;
}

/* ================================================================
   BruteForceMatch —— 暴力匹配:失败就把 i 拽回去
   ================================================================ */

const BF_TEXT = "abaabab";
const BF_PAT = "abab";

function buildBruteFrames(t: string, p: string): AlignFrame[] {
  const n = t.length,
    m = p.length;
  const frames: AlignFrame[] = [
    {
      text: t.split("").map((ch) => ({ v: ch })),
      pat: p.split("").map((ch, k) => ({ v: ch, idx: k })),
      patOffset: 0,
      msg: (
        <T
          en={
            <>
              Find the pattern <b>{p}</b> inside the text <b>{t}</b>. Naive matching lines the
              pattern up with every start position and compares character by character. Watch
              what the pointer i does after a mismatch.
            </>
          }
          zh={
            <>
              在文本 <b>{t}</b> 里找模式 <b>{p}</b>。暴力法把模式串对齐到每个起点,逐字符比较 ——
              留意失配后指针 i 会怎么走。
            </>
          }
        />
      ),
    },
  ];
  for (let a = 0; a + m <= n; a++) {
    let j = 0;
    for (; j < m; j++) {
      const ok = t[a + j] === p[j];
      const text: Tok[] = t.split("").map((ch, k) => {
        let st: string | undefined;
        if (k >= a && k < a + j) st = "ok";
        else if (k === a + j) st = ok ? "lit" : "bad";
        return { v: ch, state: st };
      });
      const pat: Tok[] = p.split("").map((ch, k) => {
        let st: string | undefined;
        if (k < j) st = "ok";
        else if (k === j) st = ok ? "lit" : "bad";
        return { v: ch, state: st, idx: k };
      });
      let msg: ReactNode;
      if (ok) {
        msg = (
          <T
            en={
              <>
                Start position {a}: t[{a + j}]=<b>{t[a + j]}</b> equals p[{j}]=<b>{p[j]}</b> ✓,
                so move one step right.
              </>
            }
            zh={
              <>
                对齐起点 {a}:t[{a + j}]=<b>{t[a + j]}</b> = p[{j}]=<b>{p[j]}</b> ✓,继续往右比。
              </>
            }
          />
        );
      } else if (a === 0) {
        msg = (
          <T
            en={
              <>
                ❌ t[{a + j}]=<b>{t[a + j]}</b> is not p[{j}]=<b>{p[j]}</b>. The first{" "}
                <b>{j}</b> characters did match, but naive matching cannot use that: the
                pointer <b>i goes back to the start position plus one, {a + 1}</b>, and the
                comparison begins again from the first character of the pattern. The{" "}
                {j} successful comparisons are <b>discarded</b>.
              </>
            }
            zh={
              <>
                ❌ t[{a + j}]=<b>{t[a + j]}</b> ≠ p[{j}]=<b>{p[j]}</b>。前 <b>{j}</b> 个字符明明都对上了,
                可暴力法用不上这个信息:指针 <b>i 退回到起点 +1 = {a + 1}</b>,
                从模式串第一个字符重新比 —— 那 {j} 次成功的比较,<b>全丢了</b>。
              </>
            }
          />
        );
      } else {
        msg = (
          <T
            en={
              <>
                ❌ t[{a + j}]=<b>{t[a + j]}</b> is not p[{j}]=<b>{p[j]}</b>, another failure. i
                goes back to {a + 1} and the next start position is tried.
              </>
            }
            zh={
              <>
                ❌ t[{a + j}]=<b>{t[a + j]}</b> ≠ p[{j}]=<b>{p[j]}</b>,又失败。i 退回到 {a + 1},
                换下一个对齐起点。
              </>
            }
          />
        );
      }
      frames.push({ text, pat, patOffset: a, ti: a + j, pj: j, msg });
      if (!ok) break;
    }
    if (j === m) {
      const text: Tok[] = t.split("").map((ch, k) => ({ v: ch, state: k >= a && k < a + m ? "ok" : undefined }));
      const pat: Tok[] = p.split("").map((ch, k) => ({ v: ch, state: "ok", idx: k }));
      frames.push({
        text,
        pat,
        patOffset: a,
        msg: (
          <T
            en={
              <>
                🎉 Full match at start position <b>{a}</b>. Getting here took many repeated
                comparisons: in the worst case the total is O(n·m). Next, see how KMP stores
                what each failure taught it and never moves i back.
              </>
            }
            zh={
              <>
                🎉 在起点 <b>{a}</b> 完整匹配!但一路走来做了大量重复比较 —— 最坏情况总共 O(n·m)。
                下面看 KMP 如何把「失败带来的信息」存下来,不再让 i 回退。
              </>
            }
          />
        ),
      });
      break;
    }
  }
  return frames;
}

const BRUTE_FRAMES = buildBruteFrames(BF_TEXT, BF_PAT);

export function BruteForceMatch() {
  return (
    <TwoRowMatch
      title={{
        en: "Naive matching — i is pulled back after every mismatch",
        zh: "暴力匹配 · 失配后 i 一次次退回重来",
      }}
      frames={BRUTE_FRAMES}
      total={BF_TEXT.length}
    />
  );
}

/* ================================================================
   NextBuilder —— ★招牌★ next 数组构建(双行:pattern / next)
   ================================================================ */

const NB_PAT = "abababca";

interface NextFrame {
  chars: Tok[]; // pattern 行(带 state)
  next: (Tok | null)[]; // next 值行
  ptrs: { i: number; label: string }[];
  msg: ReactNode;
}

function buildNextFrames(p: string): NextFrame[] {
  const n = p.length;
  const next = new Array(n).fill(-1); // -1 = 未算
  next[0] = 0;

  const frames: NextFrame[] = [];

  // 渲染工具:根据当前 i / j / 高亮意图产出一帧
  const snap = (
    i: number,
    j: number,
    curChar: string | undefined, // 'cur' 当前算的位置着 lit
    cmpAgainst: number | undefined, // p[j],标 src
    msg: ReactNode,
    fillIdx?: number, // 本帧刚写入的 next 下标(标 cur)
  ): NextFrame => {
    const chars: Tok[] = p.split("").map((ch, k) => {
      let st: string | undefined;
      if (curChar !== undefined && k === i) st = "lit";
      else if (cmpAgainst !== undefined && k === cmpAgainst) st = "src";
      else if (j > 0 && k < j) st = "pref"; // 当前匹配上的前缀段
      return { v: ch, state: st, idx: k };
    });
    const nextRow: (Tok | null)[] = p.split("").map((_, k) => {
      if (next[k] < 0) return { v: "?", state: "ghost" };
      let st: string | undefined;
      if (fillIdx !== undefined && k === fillIdx) st = "lit";
      return { v: String(next[k]), state: st };
    });
    const ptrs: { i: number; label: string }[] = [];
    if (i >= 0) ptrs.push({ i, label: "i" });
    if (cmpAgainst !== undefined) ptrs.push({ i: cmpAgainst, label: "j" });
    return { chars, next: nextRow, ptrs, msg };
  };

  frames.push(
    snap(
      0,
      0,
      undefined,
      undefined,
      <T
        en={
          <>
            The definition used here: <b>next[i] = the length of the longest equal proper
            prefix and suffix of the substring p[0..i]</b>. Proper means it cannot be the whole
            substring. Base case: a single character has no proper prefix, so{" "}
            <b>next[0] = 0</b>. From i=1 on, the pattern is matched against itself.
          </>
        }
        zh={
          <>
            本章约定 <b>next[i] = 子串 p[0..i] 的最长相等真前后缀长度</b>。
            「真」的意思是它不能等于整个子串。base case:单个字符没有真前缀,
            所以 <b>next[0] = 0</b>。接下来从 i=1 起,让模式串「和自己比」。
          </>
        }
      />,
      0,
    ),
  );

  for (let i = 1; i < n; i++) {
    let j = next[i - 1];
    frames.push(
      snap(
        i,
        j,
        p[i],
        j, // 比较目标 p[j]
        <T
          en={
            <>
              Computing next[{i}] (character <b>{p[i]}</b>). Starting point: j = next[{i - 1}] ={" "}
              <b>{j}</b> — the length the equal prefix and suffix reached at the previous
              position. Compare p[{i}] with p[{j}]=<b>{p[j]}</b>, the next character of that
              prefix.
            </>
          }
          zh={
            <>
              算 next[{i}](字符 <b>{p[i]}</b>)。起跳:j = next[{i - 1}] = <b>{j}</b> ——
              上一格的相等前后缀延伸到了这个长度。拿 p[{i}] 和前缀的下一个字符 p[{j}]=
              <b>{p[j]}</b> 比。
            </>
          }
        />,
      ),
    );
    while (j > 0 && p[i] !== p[j]) {
      const oldj = j;
      j = next[j - 1];
      frames.push(
        snap(
          i,
          j,
          p[i],
          j,
          <T
            en={
              <>
                p[{i}]=<b>{p[i]}</b> is not p[{oldj}]=<b>{p[oldj]}</b>, so this prefix cannot be
                extended. <b>Fall back</b>: j = next[{oldj - 1}] = <b>{j}</b> — move to the
                next shorter prefix that may still continue, and compare with p[{j}]=
                <b>{p[j]}</b>. i does not move.
              </>
            }
            zh={
              <>
                p[{i}]=<b>{p[i]}</b> ≠ p[{oldj}]=<b>{p[oldj]}</b>,当前这段前缀延不下去。
                <b>回退</b>:j = next[{oldj - 1}] = <b>{j}</b> —— 退到更短的、也许还能接上的前缀,
                和 p[{j}]=<b>{p[j]}</b> 再比。i 不动。
              </>
            }
          />,
        ),
      );
    }
    if (p[i] === p[j]) {
      j++;
    }
    next[i] = j;
    frames.push(
      snap(
        i,
        j,
        p[i],
        undefined,
        j > 0 ? (
          <T
            en={
              <>
                Match. p[{i}] equals the next character of the prefix, so the equal prefix and
                suffix both grow by one → <b>next[{i}] = {j}</b>. The prefix p[0..{j - 1}] is
                now exactly equal to the suffix ending at p[{i}].
              </>
            }
            zh={
              <>
                对上了!p[{i}] 等于前缀的下一个字符,相等前后缀各长一格 → <b>next[{i}] = {j}</b>。
                现在前缀 p[0..{j - 1}] 正好等于以 p[{i}] 结尾的后缀。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                j fell back to 0 and still does not match, so p[0..{i}] has no equal proper
                prefix and suffix other than the empty one → <b>next[{i}] = 0</b>.
              </>
            }
            zh={
              <>
                退到 j=0 仍对不上,说明 p[0..{i}] 除空串外没有相等的真前后缀 →{" "}
                <b>next[{i}] = 0</b>。
              </>
            }
          />
        ),
        i,
      ),
    );
  }

  frames.push(
    snap(
      -1,
      0,
      undefined,
      undefined,
      <T
        en={
          <>
            The next array is complete: <b>[{next.join(", ")}]</b>. i never moved backwards.
            The fallbacks of j are also bounded: each outer step raises j by at most 1, and
            each fallback lowers it by at least 1, so the total number of fallbacks is at most
            m. Building the table is <b>O(m)</b>. This table is the map KMP reads whenever a
            comparison fails.
          </>
        }
        zh={
          <>
            next 数组建成:<b>[{next.join(", ")}]</b>。整个过程 i 从不回退。
            j 的回退次数也有上界:外层每走一步 j 最多 +1,而每次回退 j 至少 −1,
            所以回退总次数不超过 m。构建是 <b>O(m)</b>。这张表就是 KMP 失配时要查的地图。
          </>
        }
      />,
    ),
  );

  return frames;
}

const NEXT_FRAMES = buildNextFrames(NB_PAT);

export function NextBuilder() {
  const s = useStepper(NEXT_FRAMES.length, 1400);
  const f = NEXT_FRAMES[s.step];
  const cellW = 52;
  const total = NB_PAT.length;
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="★ Building the next array — the pattern &quot;abababca&quot; matched against itself (solid blue = p[j], the prefix character being compared; dashed blue = the prefix matched so far)"
          zh="★ next 数组构建 · 模式串「abababca」和自己比(蓝实线 = 正在对比的前缀字符 p[j] · 蓝虚线 = 已匹配的前缀)"
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 6, overflowX: "auto" }}>
        <PtrRow ptrs={f.ptrs} total={total} cellW={cellW} />
        <div className="str-tagrow">
          <span className="str-tag">pattern</span>
          <CharRow toks={f.chars} total={total} cellW={cellW} />
        </div>
        <div className="str-tagrow" style={{ paddingBottom: 22 }}>
          <span className="str-tag">next</span>
          <CharRow toks={f.next} total={total} cellW={cellW} showIdx={false} />
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={NEXT_FRAMES.length} />
    </div>
  );
}

/* ================================================================
   KMPMatch —— 匹配时主串指针 i 永不回退
   ================================================================ */

const KMP_TEXT = "abaabab";
const KMP_PAT = "abab";

function buildKmpFrames(t: string, p: string): AlignFrame[] {
  const n = t.length,
    m = p.length;
  const next = prefixFunction(p);
  const frames: AlignFrame[] = [
    {
      text: t.split("").map((ch) => ({ v: ch })),
      pat: p.split("").map((ch, k) => ({ v: ch, idx: k })),
      patOffset: 0,
      msg: (
        <T
          en={
            <>
              The same text <b>{t}</b> and pattern <b>{p}</b>, with next = [{next.join(", ")}].
              This time KMP runs. Watch the pointer <b>i: it only moves forward, never back</b>.
            </>
          }
          zh={
            <>
              同一组文本 <b>{t}</b> / 模式 <b>{p}</b>,next = [{next.join(", ")}]。这次用 KMP ——
              盯住指针 <b>i:它只前进,绝不回退</b>。
            </>
          }
        />
      ),
    },
  ];

  const frame = (i: number, j: number, kind: "ok" | "bad" | "slide", msg: ReactNode): AlignFrame => {
    const offset = i - j; // pattern[0] 对齐到的文本位置
    const text: Tok[] = t.split("").map((ch, k) => {
      let st: string | undefined;
      if (k >= offset && k < i) st = "ok";
      else if (k === i) st = kind === "bad" ? "bad" : "lit";
      return { v: ch, state: st };
    });
    const pat: Tok[] = p.split("").map((ch, k) => {
      let st: string | undefined;
      if (k < j) st = "ok";
      else if (k === j) st = kind === "bad" ? "bad" : "lit";
      return { v: ch, state: st, idx: k };
    });
    return { text, pat, patOffset: offset, ti: i, pj: j, msg };
  };

  let j = 0;
  for (let i = 0; i < n; i++) {
    while (j > 0 && t[i] !== p[j]) {
      const oldj = j;
      j = next[j - 1];
      frames.push(
        frame(
          i,
          j,
          "slide",
          j > 0 ? (
            <T
              en={
                <>
                  t[{i}]=<b>{t[i]}</b> is not p[{oldj}]=<b>{p[oldj]}</b>. <b>i stays where it
                  is.</b> Set j = next[{oldj - 1}] = <b>{j}</b> and the pattern slides right:
                  inside the part that already matched, the last {j} characters are equal to
                  the prefix p[0..{j - 1}], so those {j} characters are reused instead of
                  compared again.
                </>
              }
              zh={
                <>
                  t[{i}]=<b>{t[i]}</b> ≠ p[{oldj}]=<b>{p[oldj]}</b>。<b>i 原地不动!</b>
                  令 j = next[{oldj - 1}] = <b>{j}</b>,模式串向右滑 ——
                  已匹配的那段里,末尾 {j} 个字符正好等于前缀 p[0..{j - 1}],这 {j} 个字符直接复用,
                  不用重比。
                </>
              }
            />
          ) : (
            <T
              en={
                <>
                  t[{i}]=<b>{t[i]}</b> is not p[{oldj}]=<b>{p[oldj]}</b>, and next[{oldj - 1}] ={" "}
                  <b>0</b>: nothing in the matched part can be reused. The pattern slides so
                  that p[0] lines up with position {i}, and j restarts at 0.{" "}
                  <b>i still does not move back.</b>
                </>
              }
              zh={
                <>
                  t[{i}]=<b>{t[i]}</b> ≠ p[{oldj}]=<b>{p[oldj]}</b>,而 next[{oldj - 1}] ={" "}
                  <b>0</b>:已匹配的那段里没有可复用的部分。模式串滑到 p[0] 对齐位置 {i},
                  j 从 0 重新开始。<b>i 依然没有回退。</b>
                </>
              }
            />
          ),
        ),
      );
    }
    if (t[i] === p[j]) {
      frames.push(
        frame(
          i,
          j,
          "ok",
          <T
            en={
              <>
                t[{i}]=<b>{t[i]}</b> equals p[{j}]=<b>{p[j]}</b> ✓. i and j both advance by one.
              </>
            }
            zh={
              <>
                t[{i}]=<b>{t[i]}</b> = p[{j}]=<b>{p[j]}</b> ✓。i 与 j 一起前进一格。
              </>
            }
          />,
        ),
      );
      j++;
    } else {
      frames.push(
        frame(
          i,
          0,
          "bad",
          <T
            en={
              <>
                t[{i}]=<b>{t[i]}</b> is not p[0]=<b>{p[0]}</b> and j is already 0, so there is
                nothing to fall back to. The pattern moves one position right and i advances.
              </>
            }
            zh={
              <>
                t[{i}]=<b>{t[i]}</b> ≠ p[0]=<b>{p[0]}</b>,而 j 已经是 0,没有可回退的余地。
                模式串整体右移一格,i 继续前进。
              </>
            }
          />,
        ),
      );
    }
    if (j === m) {
      const start = i - m + 1;
      const text: Tok[] = t.split("").map((ch, k) => ({ v: ch, state: k >= start && k <= i ? "ok" : undefined }));
      const pat: Tok[] = p.split("").map((ch, k) => ({ v: ch, state: "ok", idx: k }));
      frames.push({
        text,
        pat,
        patOffset: start,
        ti: i,
        pj: m - 1,
        msg: (
          <T
            en={
              <>
                🎉 j reached the end of the pattern, so the match starts at index <b>{start}</b>
                . i visited each of the {n} text positions once and never went back. Building
                the table plus this scan is <b>O(n + m)</b>. That is what storing the
                information from each failure buys you.
              </>
            }
            zh={
              <>
                🎉 j 到达模式串末尾 → 在下标 <b>{start}</b> 命中!全程 i 只把 {n} 个文本位置
                各走了一遍,从不回头。建表加这次扫描合计 <b>O(n + m)</b>。
                这就是把每次失败的信息存下来的回报。
              </>
            }
          />
        ),
      });
      break;
    }
  }
  return frames;
}

const KMP_FRAMES = buildKmpFrames(KMP_TEXT, KMP_PAT);

export function KMPMatch() {
  return (
    <TwoRowMatch
      title={{
        en: "KMP matching — i never moves back; the pattern slides right along next",
        zh: "KMP 匹配 · i 永不回退,模式串沿 next 向右滑",
      }}
      frames={KMP_FRAMES}
      total={KMP_TEXT.length}
    />
  );
}

/* ================================================================
   RollingHash —— Rabin-Karp 滚动哈希:窗口右移 O(1) 更新
   ================================================================ */

const RH_TEXT = "abcab";
const RH_PAT = "cab";
const RH_MOD = 101;
const RH_BASE = 26;
// a=1,b=2,c=3,…;target("cab")=36;base^(m-1) mod 101 = 70

interface HashFrame {
  start: number; // 窗口左端;-1 = 仅展示模式哈希
  hash: number;
  matched?: boolean;
  msg: ReactNode;
}

const HASH_FRAMES: HashFrame[] = [
  {
    start: -1,
    hash: 36,
    msg: (
      <T
        en={
          <>
            Each letter takes a value: a=1, b=2, c=3, and so on. The base is 26 and the
            modulus is the prime 101, which keeps the numbers small. First hash the pattern{" "}
            <b>cab</b> into one number: ((3·26+1)·26+2) mod 101 = <b>36</b>. That is the value
            to look for in the text.
          </>
        }
        zh={
          <>
            字符取值 a=1、b=2、c=3……,基数 base=26,模数取质数 101 把数值压在小范围里。
            先把模式串 <b>cab</b> 哈希成一个数:((3·26+1)·26+2) mod 101 = <b>36</b>。
            这就是要在文本里找的值。
          </>
        }
      />
    ),
  },
  {
    start: 0,
    hash: 24,
    msg: (
      <T
        en={
          <>
            The first window <b>abc</b> is computed with the full formula, which costs O(m):
            the hash is <b>24</b>, not 36, so this is not a match and the window moves right.
          </>
        }
        zh={
          <>
            第一个窗口 <b>abc</b> 按完整公式算(O(m)):哈希 = <b>24</b> ≠ 36,不匹配,窗口右移。
          </>
        }
      />
    ),
  },
  {
    start: 1,
    hash: 17,
    msg: (
      <T
        en={
          <>
            <b>The key step: moving the window does not recompute the hash.</b> Subtract the
            contribution of the character that leaves (a), multiply by the base, add the new
            character (a): ((24 − 1·70)·26 + 1) mod 101 = <b>17</b>. One <b>O(1)</b> update,
            and 17 is still not 36.
          </>
        }
        zh={
          <>
            <b>关键一步:窗口右移不重算。</b>减去移出字符 a 的贡献、整体乘以基数、加上新字符 a:
            ((24 − 1·70)·26 + 1) mod 101 = <b>17</b>。一次 <b>O(1)</b> 更新,17 仍然不是 36。
          </>
        }
      />
    ),
  },
  {
    start: 2,
    hash: 36,
    msg: (
      <T
        en={
          <>
            One more slide gives the window <b>cab</b>: ((17 − 2·70)·26 + 2) mod 101 ={" "}
            <b>36</b>, the value being looked for. The hashes are equal, but a hash throws
            information away, so <b>this is only a candidate</b>.
          </>
        }
        zh={
          <>
            再滑一格 → 窗口 <b>cab</b>:((17 − 2·70)·26 + 2) mod 101 = <b>36</b>,正是目标值。
            哈希相等了,但哈希丢弃了信息,所以<b>这只是一个候选</b>。
          </>
        }
      />
    ),
  },
  {
    start: 2,
    hash: 36,
    matched: true,
    msg: (
      <T
        en={
          <>
            Compare the characters: c=c, a=a, b=b ✓ — a real match, so return index <b>2</b>.
            Equal hashes only mean a candidate. This check is what rejects a false match caused
            by a hash collision.
          </>
        }
        zh={
          <>
            逐字符复核:c=c、a=a、b=b ✓ —— 真匹配,返回下标 <b>2</b>。哈希相等只说明是候选,
            这一步复核挡住的正是哈希碰撞造成的假匹配。
          </>
        }
      />
    ),
  },
];

export function RollingHash() {
  const s = useStepper(HASH_FRAMES.length, 1400);
  const f = HASH_FRAMES[s.step];
  const m = RH_PAT.length;
  const cellW = 50;
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en={<>Rabin-Karp rolling hash — searching for &quot;cab&quot; in &quot;abcab&quot; (base={RH_BASE}, mod={RH_MOD})</>}
          zh={<>Rabin-Karp 滚动哈希 · 在「abcab」里找「cab」(base={RH_BASE},mod={RH_MOD})</>}
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${RH_TEXT.length}, ${cellW}px)`, gap: 4, paddingBottom: 22 }}>
          {RH_TEXT.split("").map((ch, k) => {
            const inWin = f.start >= 0 && k >= f.start && k < f.start + m;
            let st: string | undefined;
            if (inWin) st = f.matched ? "ok" : "lit";
            return (
              <div key={k} className={`cell${st ? " " + st : ""}`} style={{ width: cellW - 4, height: cellW - 4, fontSize: 15 }}>
                {ch}
                <span className="cell-idx">{k}</span>
              </div>
            );
          })}
        </div>
        <div className="str-hashbar">
          <span className="str-hashbox">
            <T en="window hash" zh="窗口哈希" /> <b>{f.start < 0 ? "—" : f.hash}</b>
          </span>
          <span className="str-hashop">{f.start < 0 ? "" : f.hash === 36 ? "=" : "≠"}</span>
          <span className="str-hashbox" data-role="target">
            <T en="pattern hash" zh="模式哈希" /> <b>36</b>
          </span>
          {f.matched && (
            <span className="str-hashok">
              <T en="✓ characters verified" zh="✓ 复核通过" />
            </span>
          )}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={HASH_FRAMES.length} />
    </div>
  );
}

/* ================================================================
   CenterExpand —— LC 5 回文中心扩展(奇 / 偶两种中心)
   ================================================================ */

interface CEFrame {
  chars: string;
  l: number;
  r: number;
  kind: "expand" | "stop" | "found" | "start";
  best?: [number, number];
  msg: ReactNode;
}

const CE_FRAMES: CEFrame[] = [
  {
    chars: "babad",
    l: 2,
    r: 2,
    kind: "start",
    msg: (
      <T
        en={
          <>
            Find the longest palindromic substring of <b>babad</b>. Instead of enumerating the
            two ends, enumerate the <b>center</b> and expand outwards. Start with an{" "}
            <b>odd length</b> center, which sits on a character: index 2, the <b>b</b>.
          </>
        }
        zh={
          <>
            求 <b>babad</b> 的最长回文子串。与其枚举两端,不如枚举<b>中心</b>再向两边扩。
            先看<b>奇数长度</b>的中心:它落在字符上,这里取索引 2 的 <b>b</b>。
          </>
        }
      />
    ),
  },
  {
    chars: "babad",
    l: 1,
    r: 3,
    kind: "expand",
    msg: (
      <T
        en={
          <>
            Expand to both sides: s[1]=<b>a</b> equals s[3]=<b>a</b> ✓, so the palindrome grows
            to <b>aba</b> (indices 1–3). Keep expanding.
          </>
        }
        zh={
          <>
            向两侧扩:s[1]=<b>a</b> = s[3]=<b>a</b> ✓ —— 回文长到 <b>aba</b>(索引 1–3)。继续扩。
          </>
        }
      />
    ),
  },
  {
    chars: "babad",
    l: 0,
    r: 4,
    kind: "stop",
    best: [1, 3],
    msg: (
      <T
        en={
          <>
            s[0]=<b>b</b> is not s[4]=<b>d</b> ✗, so expansion stops. The longest palindrome
            centered at index 2 is <b>aba</b>, length 3. Note that l and r have each moved one
            step too far, so the palindrome is the range [l+1, r−1].
          </>
        }
        zh={
          <>
            s[0]=<b>b</b> ≠ s[4]=<b>d</b> ✗,扩不动了。以索引 2 为中心的最长回文是 <b>aba</b>,
            长度 3。注意 l、r 各多走了一步,所以回文区间是 [l+1, r−1]。
          </>
        }
      />
    ),
  },
  {
    chars: "cbbd",
    l: 1,
    r: 2,
    kind: "start",
    msg: (
      <T
        en={
          <>
            But an <b>even length</b> palindrome such as <b>abba</b> has its center in the{" "}
            <b>gap</b> between two characters. Switch to the string <b>cbbd</b> and start from
            the gap between index 1 and index 2 (b|b).
          </>
        }
        zh={
          <>
            但 <b>abba</b> 这类<b>偶数长度</b>的回文,中心在两个字符的<b>缝隙</b>里。
            换个串 <b>cbbd</b>,从索引 1 和 2 之间的缝隙(b|b)起扩。
          </>
        }
      />
    ),
  },
  {
    chars: "cbbd",
    l: 1,
    r: 2,
    kind: "expand",
    msg: (
      <T
        en={
          <>
            s[1]=<b>b</b> equals s[2]=<b>b</b> ✓, so the even-length palindrome <b>bb</b>
            holds. Keep expanding outwards.
          </>
        }
        zh={
          <>
            s[1]=<b>b</b> = s[2]=<b>b</b> ✓ —— 偶数长度的回文 <b>bb</b> 成立。继续向外扩。
          </>
        }
      />
    ),
  },
  {
    chars: "cbbd",
    l: 0,
    r: 3,
    kind: "stop",
    best: [1, 2],
    msg: (
      <T
        en={
          <>
            s[0]=<b>c</b> is not s[3]=<b>d</b> ✗, so it stops with the even palindrome{" "}
            <b>bb</b>. This is why there are <b>2n−1</b> centers: n characters plus n−1 gaps,
            so no palindrome of either length is missed. Each center expands at most O(n)
            times, giving O(n²) in total.
          </>
        }
        zh={
          <>
            s[0]=<b>c</b> ≠ s[3]=<b>d</b> ✗,停,得到偶回文 <b>bb</b>。这就是要枚举 <b>2n−1</b>{" "}
            个中心的原因:n 个字符加 n−1 个缝隙,奇偶两种长度都不漏。
            每个中心最多扩 O(n) 次,总计 O(n²)。
          </>
        }
      />
    ),
  },
];

export function CenterExpand() {
  const s = useStepper(CE_FRAMES.length, 1300);
  const f = CE_FRAMES[s.step];
  const cellW = 50;
  const chars = f.chars.split("");
  const okPair = f.kind === "expand" || f.kind === "found";
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="LC 5 expand from center — mirror outwards from the center (green = current palindrome, red = characters that differ, so it stops)"
          zh="LC 5 中心扩展 · 从中心向两侧照镜子(绿 = 当前回文 · 红 = 字符不等,停)"
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 6 }}>
        <PtrRow
          ptrs={f.l === f.r ? [{ i: f.l, label: "l=r" }] : [{ i: f.l, label: "l" }, { i: f.r, label: "r" }]}
          total={chars.length}
          cellW={cellW}
        />
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${chars.length}, ${cellW}px)`, gap: 4, paddingBottom: 22 }}>
          {chars.map((ch, k) => {
            const inRange = k >= f.l && k <= f.r;
            const inBest = f.best && k >= f.best[0] && k <= f.best[1];
            let st: string | undefined;
            if (f.kind === "stop") {
              if (k === f.l || k === f.r) st = "bad";
              else if (inBest) st = "ok";
            } else if (inRange) {
              st = okPair ? "ok" : "lit";
            }
            return (
              <div key={k} className={`cell${st ? " " + st : ""}`} style={{ width: cellW - 4, height: cellW - 4, fontSize: 15 }}>
                {ch}
                <span className="cell-idx">{k}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={CE_FRAMES.length} />
    </div>
  );
}
