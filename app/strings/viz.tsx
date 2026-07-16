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

import { useMemo, type ReactNode } from "react";
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
  title: string;
  frames: AlignFrame[];
  total: number;
  cellW?: number;
  intervalMs?: number;
}) {
  const s = useStepper(frames.length, intervalMs);
  const f = frames[s.step];
  return (
    <div className="viz">
      <div className="viz-title">{title}</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 6, overflowX: "auto" }}>
        <PtrRow ptrs={f.ti !== undefined ? [{ i: f.ti, label: "i" }] : []} total={total} cellW={cellW} />
        <div className="str-tagrow">
          <span className="str-tag">文本</span>
          <CharRow toks={f.text} total={total} cellW={cellW} />
        </div>
        <PtrRow
          ptrs={f.pj !== undefined ? [{ i: f.patOffset + f.pj, label: "j" }] : []}
          total={total}
          cellW={cellW}
        />
        <div className="str-tagrow" style={{ paddingBottom: 22 }}>
          <span className="str-tag">模式</span>
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
        <>
          在文本 <b>{t}</b> 里找模式 <b>{p}</b>。暴力法:把模式串对齐到每个起点,逐字符比 ——
          留意失配后指针 i 会怎么走。
        </>
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
          <>
            对齐起点 {a}:t[{a + j}]=<b>{t[a + j]}</b> = p[{j}]=<b>{p[j]}</b> ✓,继续往右比。
          </>
        );
      } else if (a === 0) {
        msg = (
          <>
            ❌ t[{a + j}]=<b>{t[a + j]}</b> ≠ p[{j}]=<b>{p[j]}</b>。前 <b>{j}</b> 个字符明明都对上了,
            可暴力法只能认栽:指针 <b>i 退回到起点 +1 = {a + 1}</b>,一切从头再比 ——
            那 {j} 次成功比较攒下的情报,<b>全丢了</b>。
          </>
        );
      } else {
        msg = (
          <>
            ❌ t[{a + j}]=<b>{t[a + j]}</b> ≠ p[{j}]=<b>{p[j]}</b>,又失败。i 退回到 {a + 1},换下一个对齐起点。
          </>
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
          <>
            🎉 在起点 <b>{a}</b> 完整匹配!但一路走来我们做了大量重复比较 —— 最坏情况总共 O(n·m)。
            下面看 KMP 如何把「失败的情报」存下来,不再回头。
          </>
        ),
      });
      break;
    }
  }
  return frames;
}

const BRUTE_FRAMES = buildBruteFrames(BF_TEXT, BF_PAT);

export function BruteForceMatch() {
  return <TwoRowMatch title="暴力匹配 · 失配后 i 一次次退回重来" frames={BRUTE_FRAMES} total={BF_TEXT.length} />;
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
      <>
        约定 <b>next[i] = 子串 p[0..i] 的最长相等真前后缀长度</b>。base case:单个字符没有真前后缀,
        <b> next[0] = 0</b>。接下来从 i=1 起,让模式串「和自己比」。
      </>,
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
        <>
          算 next[{i}](字符 <b>{p[i]}</b>)。起跳:j = next[{i - 1}] = <b>{j}</b> ——
          「上一格能延续多长的前后缀」就从那儿接着试。拿 p[{i}] 和前缀里的 p[{j}]=<b>{p[j]}</b> 比。
        </>,
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
          <>
            p[{i}]=<b>{p[i]}</b> ≠ p[{oldj}]=<b>{p[oldj]}</b>,当前前缀延不下去。<b>回退</b>:j = next[{oldj - 1}] = <b>{j}</b> ——
            退到「更短的、也许还能接上」的前缀,和 p[{j}]=<b>{p[j]}</b> 再比。i 不动。
          </>,
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
          <>
            对上了!p[{i}] 与前缀末字符相等,前后缀长度 +1 → <b>next[{i}] = {j}</b>。
            现在 p[0..{j - 1}] 这段前缀,正好等于以 p[{i}] 结尾的后缀。
          </>
        ) : (
          <>
            退到 j=0 仍对不上,说明 p[0..{i}] 没有非平凡的相等前后缀 → <b>next[{i}] = 0</b>。
          </>
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
      <>
        next 数组建成:<b>[{next.join(", ")}]</b>。整个过程主指针 i 从不回退,
        j 沿 next 链回退的总步数也被「i 每步最多让 j+1」摊还掉 —— 构建是 <b>O(m)</b>。
        这张表就是 KMP 匹配时的「失败地图」。
      </>,
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
      <div className="viz-title">★ next 数组构建 · 模式串「abababca」和自己比(蓝实=对比目标 p[j] · 蓝虚=已匹配前缀)</div>
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
        <>
          同一组文本 <b>{t}</b> / 模式 <b>{p}</b>,next = [{next.join(", ")}]。这次用 KMP ——
          盯住指针 <b>i:它从头到尾只会前进,绝不回退</b>。
        </>
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
          <>
            t[{i}]=<b>{t[i]}</b> ≠ p[{oldj}]=<b>{p[oldj]}</b>。<b>i 原地不动!</b>令 j = next[{oldj - 1}] = <b>{j}</b>,
            模式串向右滑 —— 已匹配的后缀里,恰有一段等于前缀 p[0..{j - 1}],直接复用,不重比。
          </>,
        ),
      );
    }
    if (t[i] === p[j]) {
      frames.push(
        frame(
          i,
          j,
          "ok",
          <>
            t[{i}]=<b>{t[i]}</b> = p[{j}]=<b>{p[j]}</b> ✓。i 与 j 一起前进。
          </>,
        ),
      );
      j++;
    } else {
      frames.push(
        frame(
          i,
          0,
          "bad",
          <>
            t[{i}]=<b>{t[i]}</b> ≠ p[0]=<b>{p[0]}</b> 且 j 已为 0:模式串整体右移一格,i 继续前进。
          </>,
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
          <>
            🎉 j 到达模式串末尾 → 在下标 <b>{start}</b> 命中!全程 i 走了 {n} 步、从不回头,
            总复杂度 <b>O(n + m)</b>。这就是「把失败变成情报」的回报。
          </>
        ),
      });
      break;
    }
  }
  return frames;
}

const KMP_FRAMES = buildKmpFrames(KMP_TEXT, KMP_PAT);

export function KMPMatch() {
  return <TwoRowMatch title="KMP 匹配 · i 永不回退,模式串沿 next 向右滑" frames={KMP_FRAMES} total={KMP_TEXT.length} />;
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
      <>
        字符取值 a=1,b=2,c=3…,基数 base=26,模 101(质数防溢出)。先把模式串 <b>cab</b> 哈希成一个数:
        ((3·26+1)·26+2) mod 101 = <b>36</b>。这就是我们要在文本里找的「指纹」。
      </>
    ),
  },
  {
    start: 0,
    hash: 24,
    msg: (
      <>
        第一个窗口 <b>abc</b> 老实按公式算(O(m)):哈希 = <b>24</b> ≠ 36,不匹配,窗口右移。
      </>
    ),
  },
  {
    start: 1,
    hash: 17,
    msg: (
      <>
        <b>关键一步:窗口右移不重算!</b>减去移出字符 a 的贡献、整体 ×base、加上新字符 a:
        ((24 − 1·70)·26 + 1) mod 101 = <b>17</b>。<b>O(1)</b> 就得到新哈希 ≠ 36。
      </>
    ),
  },
  {
    start: 2,
    hash: 36,
    msg: (
      <>
        再滑一格 → 窗口 <b>cab</b>:((17 − 2·70)·26 + 2) mod 101 = <b>36</b> = 目标!哈希撞上了 ——
        但哈希是有损压缩,<b>先别宣布胜利</b>。
      </>
    ),
  },
  {
    start: 2,
    hash: 36,
    matched: true,
    msg: (
      <>
        逐字符复核:c=c、a=a、b=b ✓ —— 真匹配,返回下标 <b>2</b>。哈希相等只是「疑似」,
        复核这一步能挡住哈希碰撞造成的假匹配。
      </>
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
      <div className="viz-title">Rabin-Karp 滚动哈希 · 在「abcab」里找「cab」(base={RH_BASE},mod={RH_MOD})</div>
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
            窗口哈希 <b>{f.start < 0 ? "—" : f.hash}</b>
          </span>
          <span className="str-hashop">{f.start < 0 ? "" : f.hash === 36 ? "=" : "≠"}</span>
          <span className="str-hashbox" data-role="target">
            模式哈希 <b>36</b>
          </span>
          {f.matched && <span className="str-hashok">✓ 复核通过</span>}
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
      <>
        求 <b>babad</b> 的最长回文子串。与其枚举两端,不如枚举<b>中心</b>再向两边扩。
        先看<b>奇数长度</b>中心:落在字符上,这里取索引 2 的 <b>b</b>。
      </>
    ),
  },
  {
    chars: "babad",
    l: 1,
    r: 3,
    kind: "expand",
    msg: (
      <>
        向两侧扩:s[1]=<b>a</b> = s[3]=<b>a</b> ✓ —— 回文长大到 <b>aba</b>(索引 1–3)。继续扩。
      </>
    ),
  },
  {
    chars: "babad",
    l: 0,
    r: 4,
    kind: "stop",
    best: [1, 3],
    msg: (
      <>
        s[0]=<b>b</b> ≠ s[4]=<b>d</b> ✗,扩不动了。以索引 2 为中心的最长回文定格为 <b>aba</b>,长度 3。
      </>
    ),
  },
  {
    chars: "cbbd",
    l: 1,
    r: 2,
    kind: "start",
    msg: (
      <>
        但 <b>abba</b> 这种<b>偶数长度</b>回文,中心在两个字符的<b>缝隙</b>里。换个串 <b>cbbd</b>,
        以索引 1、2 之间(b|b)为中心起扩。
      </>
    ),
  },
  {
    chars: "cbbd",
    l: 1,
    r: 2,
    kind: "expand",
    msg: (
      <>
        s[1]=<b>b</b> = s[2]=<b>b</b> ✓ —— 偶回文 <b>bb</b> 成立。继续向外扩。
      </>
    ),
  },
  {
    chars: "cbbd",
    l: 0,
    r: 3,
    kind: "stop",
    best: [1, 2],
    msg: (
      <>
        s[0]=<b>c</b> ≠ s[3]=<b>d</b> ✗,停。得到偶回文 <b>bb</b>。所以要枚举 <b>2n−1</b> 个中心
        (n 个字符 + n−1 个缝隙),奇偶都不漏。每个中心最多扩 O(n) → 总 O(n²)。
      </>
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
      <div className="viz-title">LC 5 中心扩展 · 从中心向两侧照镜子(绿=当前回文 · 红=照不上,停)</div>
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
