"use client";

// 第 11 章 · 数学与数论的三个专属可视化:
//  - SieveGrid:埃氏筛网格动画 —— 逐个质数把倍数划掉,亲眼看「为什么从 i² 开始」。
//  - NimGame:Nim 博弈交互 —— 亲手拿石子,对手按最优策略应对,体会 n%4 必胜 / 必败态。
//  - MooreVote:摩尔投票 —— 复用 lib/stepper 的 ArrayStepper,把「抵消不变量」逐帧放慢。

import { useMemo, useState, type ReactNode } from "react";
import {
  useStepper,
  StepControls,
  ArrayStepper,
  type ArrayFrame,
} from "@/lib/stepper";

/* ================================================================
   SieveGrid —— 埃氏筛网格动画(1..30)
   ================================================================ */

type SvState = "one" | "prime" | "cross" | "cur" | "hit";
interface SvFrame {
  states: Record<number, SvState>;
  msg: ReactNode;
}

const SIEVE_N = 30;

function buildSieveFrames(): SvFrame[] {
  const frames: SvFrame[] = [];
  const s: Record<number, SvState> = { 1: "one" };
  const snap = () => ({ ...s });

  frames.push({
    states: snap(),
    msg: (
      <>
        1 到 30 摊在网格里。<b>1</b> 既不是质数也不是合数,先请它出局(灰)。
        质数就藏在剩下的数里 —— 我们不去逐个试除,而是反过来:用小质数把合数一个个「筛」掉。
      </>
    ),
  });

  // ---- 质数 2 ----
  s[2] = "cur";
  frames.push({
    states: snap(),
    msg: (
      <>
        最小的、还没被划掉的数是 <b>2</b> —— 它一定是质数(没有更小的数能整除它)。
        标成质数,接下来去划它的倍数。
      </>
    ),
  });
  s[2] = "prime";
  for (let m = 4; m <= SIEVE_N; m += 2) s[m] = "hit";
  frames.push({
    states: snap(),
    msg: (
      <>
        2 的倍数 4、6、8……30 统统不是质数,划掉。注意从 <b>2×2 = 4</b> 起步 ——
        比 4 小的 2 的倍数只有 2 自己。
      </>
    ),
  });
  for (let m = 4; m <= SIEVE_N; m += 2) s[m] = "cross";

  // ---- 质数 3 ----
  s[3] = "cur";
  frames.push({
    states: snap(),
    msg: (
      <>
        下一个幸存者是 <b>3</b> → 质数。轮到划它的倍数。
      </>
    ),
  });
  s[3] = "prime";
  for (let m = 9; m <= SIEVE_N; m += 3) if (s[m] !== "cross") s[m] = "hit";
  frames.push({
    states: snap(),
    msg: (
      <>
        <b>关键一步:</b>从 3² = 9 开始划,不用从 6。为什么?6 = 2×3 早就被更小的质数
        2 划过了。任何 3×k(k &lt; 3)都已被 k 的质因子处理 —— 所以从 <b>i²</b> 起步,
        前面全是重复劳动。这一帧新划掉的只有 9、15、21、27。
      </>
    ),
  });
  for (let m = 9; m <= SIEVE_N; m += 3) if (s[m] === "hit") s[m] = "cross";

  // ---- 质数 5 ----
  s[5] = "cur";
  frames.push({
    states: snap(),
    msg: (
      <>
        再下一个是 <b>5</b> → 质数。
      </>
    ),
  });
  s[5] = "prime";
  for (let m = 25; m <= SIEVE_N; m += 5) if (s[m] !== "cross") s[m] = "hit";
  frames.push({
    states: snap(),
    msg: (
      <>
        从 5² = 25 起划,新划的只有 <b>25</b>(10、15、20 早被 2、3 处理了)。
        而下一个本该轮到 7,可是 7² = 49 &gt; 30 —— <b>停!</b>剩下的不用再筛。
      </>
    ),
  });
  for (let m = 25; m <= SIEVE_N; m += 5) if (s[m] === "hit") s[m] = "cross";

  // ---- 收尾:剩下没划掉的都是质数 ----
  for (let k = 2; k <= SIEVE_N; k++) if (s[k] !== "cross") s[k] = "prime";
  frames.push({
    states: snap(),
    msg: (
      <>
        收工。只需筛到 √30 ≈ 5.48(即质数 2、3、5),剩下没被划掉的
        <b> 10 个</b>数(2 3 5 7 11 13 17 19 23 29)就是 30 以内的全部质数。
        每个合数只被它的质因子划几次,总功夫是 <b>O(n log log n)</b> —— 近乎线性。
      </>
    ),
  });

  return frames;
}

const SIEVE_FRAMES = buildSieveFrames();

export function SieveGrid() {
  const stepper = useStepper(SIEVE_FRAMES.length, 1300);
  const f = SIEVE_FRAMES[stepper.step];
  return (
    <div className="viz">
      <div className="viz-title">埃氏筛 —— 用质数划掉它的倍数(网格 1..30)</div>
      <div className="viz-legend" aria-hidden>
        <span className="viz-key"><i className="mth-sv-sw" data-s="prime" />质数</span>
        <span className="viz-key"><i className="mth-sv-sw" data-s="cur" />正在处理</span>
        <span className="viz-key"><i className="mth-sv-sw" data-s="hit" />本帧新划</span>
        <span className="viz-key"><i className="mth-sv-sw" data-s="cross" />已划(合数)</span>
      </div>
      <div className="viz-stage">
        <div className="mth-sieve">
          {Array.from({ length: SIEVE_N }, (_, k) => k + 1).map((num) => (
            <div key={num} className="mth-sv-cell" data-s={f.states[num] ?? "unknown"}>
              {num}
            </div>
          ))}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={SIEVE_FRAMES.length} />
    </div>
  );
}

/* ================================================================
   NimGame —— Nim 博弈交互(拿 1~3 颗,拿到最后一颗者胜)
   ================================================================ */

const NIM_PRESETS = [8, 12, 13, 15];

export function NimGame() {
  const [start, setStart] = useState(12);
  const [n, setN] = useState(12);
  const [winner, setWinner] = useState<null | "you" | "ai">(null);
  const [msg, setMsg] = useState<ReactNode>(
    <>轮到你 —— 拿 1、2 或 3 颗石子。拿到<b>最后一颗</b>的人获胜。</>,
  );

  const reset = (v: number) => {
    setStart(v);
    setN(v);
    setWinner(null);
    setMsg(
      v % 4 === 0 ? (
        <>
          开局 <b>{v}</b> 颗。{v} 是 4 的倍数 —— 这是<b>先手必败态</b>,
          对手会一直把你摁在 4 的倍数上。试试看能不能逃?
        </>
      ) : (
        <>
          开局 <b>{v}</b> 颗。{v} 不是 4 的倍数 —— 这是<b>先手必胜态</b>,
          你的第一手应该拿 {v % 4} 颗,把 4 的倍数丢给对手。
        </>
      ),
    );
  };

  const take = (k: number) => {
    if (winner || k > n) return;
    const afterYou = n - k;
    if (afterYou === 0) {
      setN(0);
      setWinner("you");
      setMsg(
        <>
          你拿走最后 {k} 颗 —— 🏆 <b>你赢了!</b>
        </>,
      );
      return;
    }
    // 对手最优:把局面补回 4 的倍数;若已是 4 的倍数(自己必败)则随便拿 1 颗。
    const aiTake = afterYou % 4 === 0 ? 1 : afterYou % 4;
    const afterAi = afterYou - aiTake;
    if (afterAi === 0) {
      setN(0);
      setWinner("ai");
      setMsg(
        <>
          你拿 {k} 颗剩 {afterYou};对手拿走最后 {aiTake} 颗 —— 😈 <b>对手赢了。</b>
          回看开局:{start} 是 4 的倍数时,先手无论怎么走都会走到这一步。
        </>,
      );
      return;
    }
    setN(afterAi);
    setMsg(
      <>
        你拿 {k} 颗 → 剩 {afterYou};对手立刻拿 {aiTake} 颗补成 <b>{afterAi}</b>
        (4 的倍数)。看到了吗?你的每一步都被「补回 4 的倍数」化解了。
      </>,
    );
  };

  const mod = n % 4;
  return (
    <div className="viz">
      <div className="viz-title">Nim 博弈实验室 —— 你先手,对手按最优策略应对</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 14 }}>
        <div className="mth-nim-status" data-lose={mod === 0 && !winner}>
          {winner ? (
            winner === "you" ? "🏆 你赢了" : "😈 对手赢了"
          ) : (
            <>
              剩 <b>{n}</b> 颗 · {n} % 4 = <b>{mod}</b> ·{" "}
              {mod === 0 ? "轮到你 → 必败态" : "轮到你 → 必胜态"}
            </>
          )}
        </div>
        <div className="mth-stones">
          {Array.from({ length: n }, (_, i) => (
            <span key={i} className="mth-stone" />
          ))}
          {n === 0 && <span className="dim" style={{ fontSize: 13 }}>石子已拿光</span>}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <div className="viz-ctl">
        {[1, 2, 3].map((k) => (
          <button
            key={k}
            type="button"
            className="btn btn-sm btn-primary"
            disabled={!!winner || k > n}
            onClick={() => take(k)}
          >
            拿 {k} 颗
          </button>
        ))}
        <span style={{ width: 12 }} />
        {NIM_PRESETS.map((v) => (
          <button key={v} type="button" className="btn btn-sm" onClick={() => reset(v)}>
            重开 {v}
          </button>
        ))}
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          必胜策略:每手拿到「剩余 = 4 的倍数」
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   MooreVote —— 摩尔投票(ArrayStepper 逐帧)
   ================================================================ */

const MOORE_NUMS = [2, 2, 1, 3, 2, 2, 2]; // 多数元素 = 2(出现 4 次 > 7/2)

function mooreFrames(nums: number[]): ArrayFrame[] {
  const frames: ArrayFrame[] = [];
  frames.push({
    cells: nums.map((v) => ({ v, state: "ghost" as const })),
    msg: (
      <>
        擂台空着:守擂者 = 无、票数 = 0。规则:来的人和守擂者<b>同类 +1 票</b>、
        <b>异类 −1 票</b>,票数归零就<b>换守擂者</b>。
      </>
    ),
  });

  let cand = 0;
  let cnt = 0;
  nums.forEach((v, i) => {
    let action: "new" | "up" | "down";
    if (cnt === 0) {
      cand = v;
      cnt = 1;
      action = "new";
    } else if (v === cand) {
      cnt += 1;
      action = "up";
    } else {
      cnt -= 1;
      action = "down";
    }
    const cells = nums.map((x, j) => {
      if (j > i) return { v: x, state: "ghost" as const };
      if (j === i)
        return {
          v: x,
          state: (action === "down" ? "bad" : action === "up" ? "ok" : "lit") as
            | "bad"
            | "ok"
            | "lit",
        };
      return { v: x };
    });
    let m: ReactNode;
    if (action === "new") {
      m = (
        <>
          票数是 0,<b>{v}</b> 上台当守擂者,票数记 <b>1</b>。
        </>
      );
    } else if (action === "up") {
      m = (
        <>
          又来个 <b>{v}</b>,和守擂者同类 → 票数 +1 = <b>{cnt}</b>。
        </>
      );
    } else {
      m = (
        <>
          来了个 <b>{v}</b>,和守擂者 {cand} 不同 → 同归于尽,票数 −1 = <b>{cnt}</b>。
          {cnt === 0 && <> 守擂者被赶下台,下一个人重新上台。</>}
        </>
      );
    }
    frames.push({
      cells,
      ptrs: [{ i, label: `守擂 ${cand}` }],
      msg: m,
    });
  });

  frames.push({
    cells: nums.map((x) => ({
      v: x,
      state: (x === cand ? "ok" : "ghost") as "ok" | "ghost",
    })),
    msg: (
      <>
        走完一遍,最后站在台上的是 <b>{cand}</b> —— 它就是多数元素。为什么必对?
        多数元素超过一半,和其他所有元素两两抵消也<b>抵不完</b>,一定是最后的幸存者。
      </>
    ),
  });

  return frames;
}

const MOORE_FRAMES = mooreFrames(MOORE_NUMS);

export function MooreVote() {
  return (
    <ArrayStepper
      title="摩尔投票 —— 同类 +1、异类 −1,谁撑到最后(nums = [2,2,1,3,2,2,2])"
      frames={MOORE_FRAMES}
      cellW={54}
    />
  );
}
