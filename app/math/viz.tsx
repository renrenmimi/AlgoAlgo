"use client";

// 第 11 章 · 数学与数论的三个专属可视化:
//  - SieveGrid:埃氏筛网格动画 —— 逐个质数把倍数划掉,亲眼看「为什么从 i² 开始」。
//  - NimGame:Nim 博弈交互 —— 亲手拿石子,对手按最优策略应对,体会 n%4 必胜 / 必败态。
//  - MooreVote:摩尔投票 —— 复用 lib/stepper 的 ArrayStepper,把「抵消论证」逐帧放慢。
//
// 双语:帧旁白直接写 <T en zh />;title / 指针标签传 { en, zh }。

import { useState, type ReactNode } from "react";
import { T, useL } from "@/lib/i18n";
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
      <T
        en={
          <>
            The numbers 1 to 30 laid out in a grid. <b>1</b> is neither prime nor
            composite, so it leaves the board first (grey). The primes are among
            the rest. Instead of testing each number for divisors, the sieve works
            the other way round: it uses small primes to cross out the composites.
          </>
        }
        zh={
          <>
            1 到 30 摊在网格里。<b>1</b> 既不是质数也不是合数,先请它出局(灰)。
            质数就藏在剩下的数里 —— 我们不去逐个试除,而是反过来:
            用小质数把合数一个个划掉。
          </>
        }
      />
    ),
  });

  // ---- 质数 2 ----
  s[2] = "cur";
  frames.push({
    states: snap(),
    msg: (
      <T
        en={
          <>
            The smallest number not yet crossed out is <b>2</b>. It must be prime,
            because no smaller number above 1 divides it. Mark it as prime, then
            cross out its multiples.
          </>
        }
        zh={
          <>
            最小的、还没被划掉的数是 <b>2</b> —— 它一定是质数(除 1 以外没有更小的数能整除它)。
            标成质数,接下来去划它的倍数。
          </>
        }
      />
    ),
  });
  s[2] = "prime";
  for (let m = 4; m <= SIEVE_N; m += 2) s[m] = "hit";
  frames.push({
    states: snap(),
    msg: (
      <T
        en={
          <>
            4, 6, 8, and so on up to 30 are multiples of 2, so none of them is
            prime. Cross them out. Marking starts at <b>2×2 = 4</b>, because the
            only multiple of 2 below 4 is 2 itself.
          </>
        }
        zh={
          <>
            2 的倍数 4、6、8……30 都不是质数,划掉。注意从 <b>2×2 = 4</b> 起步 ——
            比 4 小的 2 的倍数只有 2 自己。
          </>
        }
      />
    ),
  });
  for (let m = 4; m <= SIEVE_N; m += 2) s[m] = "cross";

  // ---- 质数 3 ----
  s[3] = "cur";
  frames.push({
    states: snap(),
    msg: (
      <T
        en={
          <>
            The next survivor is <b>3</b>, so 3 is prime. Now cross out its
            multiples.
          </>
        }
        zh={
          <>
            下一个幸存者是 <b>3</b> → 质数。轮到划它的倍数。
          </>
        }
      />
    ),
  });
  s[3] = "prime";
  for (let m = 9; m <= SIEVE_N; m += 3) if (s[m] !== "cross") s[m] = "hit";
  frames.push({
    states: snap(),
    msg: (
      <T
        en={
          <>
            <b>The step to notice:</b> marking starts at 3² = 9, not at 6. Why? 6 =
            2×3 was already crossed out by the smaller prime 2. Every 3×k with k
            &lt; 3 has a prime factor smaller than 3 and was handled by that
            factor. Starting at <b>i²</b> skips all of that repeated work. This
            frame newly crosses out only 9, 15, 21, and 27.
          </>
        }
        zh={
          <>
            <b>关键一步:</b>从 3² = 9 开始划,不从 6 开始。为什么?6 = 2×3
            早就被更小的质数 2 划过了。任何 3×k(k &lt; 3)都含有比 3 小的质因子、
            已由那个质因子处理 —— 所以从 <b>i²</b> 起步,前面全是重复劳动。
            这一帧新划掉的只有 9、15、21、27。
          </>
        }
      />
    ),
  });
  for (let m = 9; m <= SIEVE_N; m += 3) if (s[m] === "hit") s[m] = "cross";

  // ---- 质数 5 ----
  s[5] = "cur";
  frames.push({
    states: snap(),
    msg: (
      <T
        en={
          <>
            Next comes <b>5</b>, so 5 is prime.
          </>
        }
        zh={
          <>
            再下一个是 <b>5</b> → 质数。
          </>
        }
      />
    ),
  });
  s[5] = "prime";
  for (let m = 25; m <= SIEVE_N; m += 5) if (s[m] !== "cross") s[m] = "hit";
  frames.push({
    states: snap(),
    msg: (
      <T
        en={
          <>
            Marking starts at 5² = 25, and the only new cross is <b>25</b> (10, 15,
            and 20 were already handled by 2 and 3). The next candidate would be 7,
            but 7² = 49 &gt; 30, so <b>stop here</b>. Nothing below 30 is left to
            cross out.
          </>
        }
        zh={
          <>
            从 5² = 25 起划,新划的只有 <b>25</b>(10、15、20 早被 2、3 处理了)。
            下一个本该轮到 7,可是 7² = 49 &gt; 30 —— <b>停</b>,30 以内已经没有可划的了。
          </>
        }
      />
    ),
  });
  for (let m = 25; m <= SIEVE_N; m += 5) if (s[m] === "hit") s[m] = "cross";

  // ---- 收尾:剩下没划掉的都是质数 ----
  for (let k = 2; k <= SIEVE_N; k++) if (s[k] !== "cross") s[k] = "prime";
  frames.push({
    states: snap(),
    msg: (
      <T
        en={
          <>
            Done. Only the primes up to √30 ≈ 5.48 were needed, that is 2, 3, and
            5. The <b>10</b> numbers never crossed out (2 3 5 7 11 13 17 19 23 29)
            are all the primes below 30. Each composite is crossed out once per
            prime factor that reaches it, and the total work is{" "}
            <b>O(n log log n)</b>, close to linear.
          </>
        }
        zh={
          <>
            收工。只需用到 √30 ≈ 5.48 以内的质数,也就是 2、3、5。
            剩下没被划掉的 <b>10 个</b>数(2 3 5 7 11 13 17 19 23 29)
            就是 30 以内的全部质数。每个合数被划的次数等于划到它的质因子个数,
            总功夫是 <b>O(n log log n)</b> —— 近乎线性。
          </>
        }
      />
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
      <div className="viz-title">
        <T
          en={<>Sieve of Eratosthenes: cross out the multiples of each prime (1..30)</>}
          zh={<>埃氏筛 —— 用质数划掉它的倍数(网格 1..30)</>}
        />
      </div>
      <div className="viz-legend" aria-hidden>
        <span className="viz-key">
          <i className="mth-sv-sw" data-s="prime" />
          <T en="Prime" zh="质数" />
        </span>
        <span className="viz-key">
          <i className="mth-sv-sw" data-s="cur" />
          <T en="Current prime" zh="正在处理" />
        </span>
        <span className="viz-key">
          <i className="mth-sv-sw" data-s="hit" />
          <T en="Crossed out now" zh="本帧新划" />
        </span>
        <span className="viz-key">
          <i className="mth-sv-sw" data-s="cross" />
          <T en="Already composite" zh="已划(合数)" />
        </span>
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
  const L = useL();
  const [start, setStart] = useState(12);
  const [n, setN] = useState(12);
  const [winner, setWinner] = useState<null | "you" | "ai">(null);
  const [msg, setMsg] = useState<ReactNode>(
    <T
      en={
        <>
          Your turn. Take 1, 2, or 3 stones. The player who takes{" "}
          <b>the last stone</b> wins.
        </>
      }
      zh={
        <>
          轮到你 —— 拿 1、2 或 3 颗石子。拿到<b>最后一颗</b>的人获胜。
        </>
      }
    />,
  );

  const reset = (v: number) => {
    setStart(v);
    setN(v);
    setWinner(null);
    setMsg(
      v % 4 === 0 ? (
        <T
          en={
            <>
              Starting with <b>{v}</b> stones. {v} is a multiple of 4, so this is a{" "}
              <b>losing position for the first player</b>. The opponent will keep
              putting you back on a multiple of 4. Try to escape.
            </>
          }
          zh={
            <>
              开局 <b>{v}</b> 颗。{v} 是 4 的倍数 —— 这是<b>先手必败态</b>,
              对手会一直把你摁回 4 的倍数上。试试看能不能逃出去。
            </>
          }
        />
      ) : (
        <T
          en={
            <>
              Starting with <b>{v}</b> stones. {v} is not a multiple of 4, so this
              is a <b>winning position for the first player</b>. Your first move
              should take {v % 4}, which leaves the opponent a multiple of 4.
            </>
          }
          zh={
            <>
              开局 <b>{v}</b> 颗。{v} 不是 4 的倍数 —— 这是<b>先手必胜态</b>,
              你的第一手应该拿 {v % 4} 颗,把 4 的倍数丢给对手。
            </>
          }
        />
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
        <T
          en={
            <>
              You took the last {k} — <b>you win.</b>
            </>
          }
          zh={
            <>
              你拿走最后 {k} 颗 —— <b>你赢了。</b>
            </>
          }
        />,
      );
      return;
    }
    // 对手最优:把局面补回 4 的倍数;若已是 4 的倍数(对手自己必败)则只能随便拿 1 颗。
    const restore = afterYou % 4 !== 0;
    const aiTake = restore ? afterYou % 4 : 1;
    const afterAi = afterYou - aiTake;
    if (afterAi === 0) {
      setN(0);
      setWinner("ai");
      setMsg(
        <T
          en={
            <>
              You took {k}, leaving {afterYou}. The opponent took the last {aiTake}{" "}
              — <b>the opponent wins.</b>{" "}
              {start % 4 === 0
                ? `Look back at the start: when ${start} is a multiple of 4, every first move leads here.`
                : `The start of ${start} was winnable: taking ${start % 4} on the first move would have left a multiple of 4.`}
            </>
          }
          zh={
            <>
              你拿 {k} 颗剩 {afterYou};对手拿走最后 {aiTake} 颗 —— <b>对手赢了。</b>
              {start % 4 === 0
                ? `回看开局:${start} 是 4 的倍数时,先手无论怎么走都会走到这一步。`
                : `开局 ${start} 本来是能赢的:第一手拿 ${start % 4} 颗就能把 4 的倍数留给对手。`}
            </>
          }
        />,
      );
      return;
    }
    setN(afterAi);
    setMsg(
      restore ? (
        <T
          en={
            <>
              You took {k}, leaving {afterYou}. The opponent immediately took{" "}
              {aiTake} to bring the pile back to <b>{afterAi}</b>, a multiple of 4.
              Every move you make is answered by restoring a multiple of 4.
            </>
          }
          zh={
            <>
              你拿 {k} 颗 → 剩 {afterYou};对手立刻拿 {aiTake} 颗补成{" "}
              <b>{afterAi}</b>(4 的倍数)。你的每一步都被「补回 4 的倍数」化解了。
            </>
          }
        />
      ) : (
        <T
          en={
            <>
              You took {k}, leaving {afterYou}, which is a multiple of 4. Now the
              opponent is the one in the losing position: it took 1, leaving{" "}
              <b>{afterAi}</b>. Keep taking {"("}4 − opponent&apos;s move{")"} to
              stay in control.
            </>
          }
          zh={
            <>
              你拿 {k} 颗 → 剩 {afterYou},正好是 4 的倍数。现在轮到对手处于必败态:
              它只能随便拿 1 颗,剩 <b>{afterAi}</b>。接下来你每手拿
              「4 − 对手刚拿的颗数」,就能一直把局面握在手里。
            </>
          }
        />
      ),
    );
  };

  const mod = n % 4;
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en={<>Nim lab: you move first, the opponent plays optimally</>}
          zh={<>Nim 博弈实验室 —— 你先手,对手按最优策略应对</>}
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 14 }}>
        <div className="mth-nim-status" data-lose={mod === 0 && !winner}>
          {winner ? (
            winner === "you" ? (
              <T en="You win" zh="你赢了" />
            ) : (
              <T en="The opponent wins" zh="对手赢了" />
            )
          ) : (
            <>
              <T
                en={
                  <>
                    <b>{n}</b> left
                  </>
                }
                zh={
                  <>
                    剩 <b>{n}</b> 颗
                  </>
                }
              />{" "}
              · {n} % 4 ={" "}
              <b>{mod}</b> ·{" "}
              {mod === 0 ? (
                <T en="your turn, losing position" zh="轮到你 → 必败态" />
              ) : (
                <T en="your turn, winning position" zh="轮到你 → 必胜态" />
              )}
            </>
          )}
        </div>
        <div className="mth-stones">
          {Array.from({ length: n }, (_, i) => (
            <span key={i} className="mth-stone" />
          ))}
          {n === 0 && (
            <span className="dim" style={{ fontSize: 13 }}>
              <T en="No stones left" zh="石子已拿光" />
            </span>
          )}
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
            {L({ en: `Take ${k}`, zh: `拿 ${k} 颗` })}
          </button>
        ))}
        <span style={{ width: 12 }} />
        {NIM_PRESETS.map((v) => (
          <button key={v} type="button" className="btn btn-sm" onClick={() => reset(v)}>
            {L({ en: `Restart ${v}`, zh: `重开 ${v}` })}
          </button>
        ))}
        <span className="mono dim mth-nim-tip">
          <T
            en={<>Winning strategy: always leave a multiple of 4</>}
            zh={<>必胜策略:每手拿到「剩余 = 4 的倍数」</>}
          />
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   MooreVote —— 摩尔投票(ArrayStepper 逐帧)
   ================================================================ */

const MOORE_NUMS = [2, 2, 1, 3, 2, 2, 2]; // 多数元素 = 2(出现 5 次 > 7/2)

function mooreFrames(nums: number[]): ArrayFrame[] {
  const frames: ArrayFrame[] = [];
  frames.push({
    cells: nums.map((v) => ({ v, state: "ghost" as const })),
    msg: {
      en: (
        <>
          Start with no candidate and a count of 0. The rules: a value equal to
          the candidate gives <b>+1</b>, a different value gives <b>−1</b>, and
          when the count reaches 0 the <b>next value becomes the candidate</b>.
        </>
      ),
      zh: (
        <>
          开局:候选为空、计数为 0。规则:与候选<b>相同 +1</b>、
          <b>不同 −1</b>,计数归零就让<b>下一个值成为新候选</b>。
        </>
      ),
    },
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
    const shown = cnt;
    let m: ArrayFrame["msg"];
    if (action === "new") {
      m = {
        en: (
          <>
            The count was 0, so <b>{v}</b> becomes the candidate and the count is
            set to <b>1</b>.
          </>
        ),
        zh: (
          <>
            计数是 0,<b>{v}</b> 成为新候选,计数记 <b>1</b>。
          </>
        ),
      };
    } else if (action === "up") {
      m = {
        en: (
          <>
            Another <b>{v}</b>, equal to the candidate, so the count goes up by 1
            to <b>{shown}</b>.
          </>
        ),
        zh: (
          <>
            又来一个 <b>{v}</b>,和候选相同 → 计数 +1 = <b>{shown}</b>。
          </>
        ),
      };
    } else {
      m = {
        en: (
          <>
            A <b>{v}</b> arrives, different from the candidate {cand}. The two
            cancel as a pair, so the count goes down by 1 to <b>{shown}</b>.
            {shown === 0 && <> The candidate is dropped; the next value takes over.</>}
          </>
        ),
        zh: (
          <>
            来了个 <b>{v}</b>,和候选 {cand} 不同 → 两者成对抵消,计数 −1 ={" "}
            <b>{shown}</b>。
            {shown === 0 && <> 候选被清空,下一个值接手。</>}
          </>
        ),
      };
    }
    frames.push({
      cells,
      ptrs: [{ i, label: { en: `cand ${cand}`, zh: `候选 ${cand}` } }],
      msg: m,
    });
  });

  frames.push({
    cells: nums.map((x) => ({
      v: x,
      state: (x === cand ? "ok" : "ghost") as "ok" | "ghost",
    })),
    msg: {
      en: (
        <>
          After one pass the candidate left standing is <b>{cand}</b>, and that is
          the majority element. Why is it always correct? Every −1 step removes
          one copy of the candidate together with one copy of a different value. A
          value that appears more than half the time cannot be removed completely,
          because all the other values together are fewer than half. So it is the
          one that survives.
        </>
      ),
      zh: (
        <>
          走完一遍,留在台上的候选是 <b>{cand}</b> —— 它就是多数元素。为什么必对?
          每次 −1 都会同时丢掉一个候选和一个异值。出现次数超过一半的元素抵消不完,
          因为其他所有元素加起来还不到一半 —— 所以它一定是最后留下的那个。
        </>
      ),
    },
  });

  return frames;
}

const MOORE_FRAMES = mooreFrames(MOORE_NUMS);

export function MooreVote() {
  return (
    <ArrayStepper
      title={{
        en: "Boyer-Moore voting: +1 for a match, −1 for a mismatch, and see what survives (nums = [2,2,1,3,2,2,2])",
        zh: "摩尔投票 —— 相同 +1、不同 −1,看谁撑到最后(nums = [2,2,1,3,2,2,2])",
      }}
      frames={MOORE_FRAMES}
      cellW={54}
    />
  );
}
