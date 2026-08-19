"use client";

// 第 3 章 · 二分进阶的三个专属可视化:
//  - GuessLab:猜数字实验室 —— 你想一个数,机器用二分来猜,亲手体会「砍半」有多快。
//  - BoundaryStepper:LC 34 找左右边界 —— lower_bound / upper_bound 逐帧,ArrayStepper。
//  - RotatedStepper:LC 33 旋转数组搜索 —— 每一步判断「哪半有序」,ArrayStepper 自建帧。
// 二分答案(875 吃香蕉)用的是共享库 lib/algviz 的 RangeShrink,帧数据写在 page.tsx。
//
// 双语:旁白用 <T en zh />;组件的文案型 props 传 { en, zh }。
// 指针标签(lo / mid / hi)是代码标识符,两种语言相同,保持原样。

import { useState } from "react";
import { ArrayStepper, type ArrayFrame, type ArrayCell } from "@/lib/stepper";
import { T } from "@/lib/i18n";

/* ============================================================
   GuessLab —— 猜数字实验室(交互:你出数,机器二分猜)
   ============================================================ */

const GUESS_LO = 1;
const GUESS_HI = 100;
// 100 个数,最多 ⌈log2(100)⌉ = 7 次一定能猜到。
const GUESS_MAX = 7;

export function GuessLab() {
  const [lo, setLo] = useState(GUESS_LO);
  const [hi, setHi] = useState(GUESS_HI);
  const [tries, setTries] = useState(0);
  const [status, setStatus] = useState<"play" | "won" | "err">("play");

  const guess = Math.floor(lo + (hi - lo) / 2);
  const remaining = hi - lo + 1;

  const tooHigh = () => {
    if (status !== "play") return;
    setTries((t) => t + 1);
    const nh = guess - 1;
    if (nh < lo) setStatus("err");
    else setHi(nh);
  };
  const tooLow = () => {
    if (status !== "play") return;
    setTries((t) => t + 1);
    const nl = guess + 1;
    if (nl > hi) setStatus("err");
    else setLo(nl);
  };
  const correct = () => {
    if (status !== "play") return;
    setTries((t) => t + 1);
    setStatus("won");
  };
  const reset = () => {
    setLo(GUESS_LO);
    setHi(GUESS_HI);
    setTries(0);
    setStatus("play");
  };

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en={<>Guessing lab — think of a number from 1 to 100, keep it to yourself, and let the machine find it</>}
          zh={<>猜数字实验室 —— 心里想一个 1~100 的数,别说出来,让机器来猜</>}
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 6 }}>
        {status === "won" ? (
          <div className="bin-guess-big" style={{ color: "var(--ok)" }}>🎯 {guess}</div>
        ) : status === "err" ? (
          <div className="bin-guess-big" style={{ fontSize: 30 }}>
            <T en={<>🤔 hmm</>} zh={<>🤔 咦?</>} />
          </div>
        ) : (
          <div className="bin-guess-big">{guess}</div>
        )}
        <div className="bin-guess-sub">
          {status === "won" ? (
            <T
              en={
                <>
                  Found in <b>{tries}</b> questions. For 100 numbers the upper limit is{" "}
                  <b>{GUESS_MAX}</b> — each answer removes half of what is left.
                </>
              }
              zh={
                <>
                  <b>{tries}</b> 次搞定。100 个数,理论上限是 <b>{GUESS_MAX}</b> 次 ——
                  每回答一次就砍掉一半。
                </>
              }
            />
          ) : status === "err" ? (
            <T
              en={<>The interval is empty and the number was never found. Some answer must have changed. Press reset and play again.</>}
              zh={<>区间已经空了,却还没猜中 —— 中途一定有一次回答变了。点「重来」再玩一次。</>}
            />
          ) : (
            <T
              en={
                <>
                  Candidate interval [<b>{lo}</b>, <b>{hi}</b>], <b>{remaining}</b> numbers
                  left · <b>{tries}</b> asked / at most {GUESS_MAX}
                </>
              }
              zh={
                <>
                  当前候选区间 [<b>{lo}</b>, <b>{hi}</b>],还剩 <b>{remaining}</b> 个数 · 已猜{" "}
                  <b>{tries}</b> 次 / 理论最多 {GUESS_MAX} 次
                </>
              }
            />
          )}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {status === "play" ? (
          <T
            en={
              <>
                The machine guesses <b>{guess}</b>, the middle of the interval. Is your number
                higher or lower? Each answer removes <b>half</b> of the remaining candidates.
              </>
            }
            zh={
              <>
                机器猜 <b>{guess}</b>(区间正中间)。你想的数比它大还是小?
                每回答一次,候选区间就<b>少一半</b>。
              </>
            }
          />
        ) : status === "won" ? (
          <T
            en={
              <>
                The number of candidates went 100 → 50 → 25 → 12 → 6 → 3 → 1. Halving the
                range reaches a single value in at most 7 questions. That is <b>O(log n)</b>,
                and it is why binary search beats checking one value at a time (O(n)).
              </>
            }
            zh={
              <>
                候选个数依次是 100 → 50 → 25 → 12 → 6 → 3 → 1。每次减半,最多 7 问就收敛到一个数。
                这就是 <b>O(log n)</b> —— 也是二分比逐个试(O(n))快得多的原因。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                Binary search is only correct while the answer is still inside the interval.
                An empty interval means the answers contradicted each other.
              </>
            }
            zh={
              <>
                二分只在「答案确实还在区间里」时成立。区间被挤空,说明前后的回答互相矛盾。
              </>
            }
          />
        )}
      </div>
      <div className="viz-ctl">
        <button type="button" className="btn btn-sm" onClick={tooHigh} disabled={status !== "play"}>
          <T en="Too high ↓" zh="太大了 ↓" />
        </button>
        <button type="button" className="btn btn-sm" onClick={tooLow} disabled={status !== "play"}>
          <T en="Too low ↑" zh="太小了 ↑" />
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={correct}
          disabled={status !== "play"}
        >
          <T en="Correct ✓" zh="猜对了 ✓" />
        </button>
        <button type="button" className="btn btn-sm" onClick={reset} style={{ marginLeft: "auto" }}>
          <T en="Reset" zh="重来" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   BoundaryStepper —— LC 34 找左右边界(lower_bound / upper_bound)
   ============================================================ */

const BND = [5, 7, 7, 8, 8, 8, 10]; // target = 8,答案区间 [3, 5]

/** 按「存活区间 [lo,hi] + 当前 mid + 已锁定的 ok 下标」渲染一排单元格 */
function bndCells(lo: number, hi: number, mid?: number, ok?: number[]): ArrayCell[] {
  return BND.map((v, i) => {
    if (ok?.includes(i)) return { v, state: "ok" as const };
    if (i === mid) return { v, state: "lit" as const };
    if (i < lo || i > hi) return { v, state: "ghost" as const };
    return { v };
  });
}

const BND_FRAMES: ArrayFrame[] = [
  {
    cells: bndCells(0, 6),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <T
        en={
          <>
            The target 8 appears several times. Find the <b>leftmost</b> one first, with the
            &quot;first index whose value is ≥ 8&quot; template: when the test passes, record
            the index as a candidate and keep searching to the left.
          </>
        }
        zh={
          <>
            目标 8 出现了好几次。先找<b>最左</b>的那个 —— 用「第一个 ≥ 8」的模板:
            判定通过就把当前下标记成候选,再继续往左找。
          </>
        }
      />
    ),
  },
  {
    cells: bndCells(0, 6, 3),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 3, label: "mid" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <T
        en={
          <>
            mid = 3 and a[3] = 8 ≥ 8, so index <b>3</b> is recorded as the answer so far. An
            earlier 8 may still exist, so the search continues on the left: hi = mid − 1 = 2.
          </>
        }
        zh={
          <>
            mid = 3,a[3] = 8 ≥ 8 ✓,于是把 <b>3</b> 记为当前答案。
            左边可能还有 8,所以继续往左找:hi = mid − 1 = 2。
          </>
        }
      />
    ),
  },
  {
    cells: bndCells(0, 2, 1),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 1, label: "mid" },
      { i: 2, label: "hi" },
    ],
    msg: (
      <T
        en={
          <>
            New interval [0, 2]. mid = 1 and a[1] = 7 &lt; 8, so index 1 and everything to its
            left are too small. lo = mid + 1 = 2.
          </>
        }
        zh={
          <>
            新区间 [0, 2]。mid = 1,a[1] = 7 &lt; 8 —— 下标 1 及其左边全都太小,
            lo = mid + 1 = 2。
          </>
        }
      />
    ),
  },
  {
    cells: bndCells(2, 2, 2),
    ptrs: [
      { i: 2, label: "lo·mid·hi" },
    ],
    msg: (
      <T
        en={
          <>
            The interval is down to [2, 2]. mid = 2 and a[2] = 7 &lt; 8, so lo = 3. Now lo
            &gt; hi, the interval is empty, and the loop stops.
          </>
        }
        zh={
          <>
            区间只剩 [2, 2]。mid = 2,a[2] = 7 &lt; 8,所以 lo = 3。此时 lo &gt; hi,
            区间为空,循环结束。
          </>
        }
      />
    ),
  },
  {
    cells: bndCells(3, 3, undefined, [3]),
    msg: (
      <T
        en={
          <>
            The last recorded candidate is <b>3</b>. That is lower_bound(8): the leftmost 8
            sits at index 3.
          </>
        }
        zh={
          <>
            循环里最后记下的候选是 <b>3</b> —— 这就是 lower_bound(8),最左的 8 在下标 3。
          </>
        }
      />
    ),
  },
  {
    cells: bndCells(0, 6),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <T
        en={
          <>
            Now the <b>rightmost</b> 8. Search for the first index whose value is ≥ 9, then
            step back one. The values are integers, so &quot;first &gt; 8&quot; and &quot;first
            ≥ 9&quot; are the same position: upper_bound(t) = lower_bound(t + 1).
          </>
        }
        zh={
          <>
            再找<b>最右</b>的 8:先找「第一个 ≥ 9」,再退一格。因为元素是整数,
            「第一个 &gt; 8」和「第一个 ≥ 9」是同一个位置 —— upper_bound(t) = lower_bound(t + 1)。
          </>
        }
      />
    ),
  },
  {
    cells: bndCells(0, 6, 3),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 3, label: "mid" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <T
        en={
          <>
            Searching for the first index ≥ 9. mid = 3 and a[3] = 8 &lt; 9, too small, so
            lo = 4.
          </>
        }
        zh={
          <>
            开始找「第一个 ≥ 9」。mid = 3,a[3] = 8 &lt; 9,太小 → lo = 4。
          </>
        }
      />
    ),
  },
  {
    cells: bndCells(4, 6, 5),
    ptrs: [
      { i: 4, label: "lo" },
      { i: 5, label: "mid" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <T
        en={
          <>
            Interval [4, 6]. mid = 5 and a[5] = 8 &lt; 9, still too small, so lo = 6.
          </>
        }
        zh={
          <>
            区间 [4, 6]。mid = 5,a[5] = 8 &lt; 9,还是太小 → lo = 6。
          </>
        }
      />
    ),
  },
  {
    cells: bndCells(6, 6, 6),
    ptrs: [{ i: 6, label: "lo·mid·hi" }],
    msg: (
      <T
        en={
          <>
            Interval [6, 6]. mid = 6 and a[6] = 10 ≥ 9, so 6 is recorded and hi = 5. Now lo
            &gt; hi and the loop stops: lower_bound(9) = 6.
          </>
        }
        zh={
          <>
            区间 [6, 6]。mid = 6,a[6] = 10 ≥ 9 ✓,记下候选 6,hi = 5。
            此时 lo &gt; hi,循环结束:lower_bound(9) = 6。
          </>
        }
      />
    ),
  },
  {
    cells: bndCells(3, 5, undefined, [3, 4, 5]),
    msg: (
      <T
        en={
          <>
            The right end is 6 − 1 = <b>5</b>. Together: the 8s occupy <b>[3, 5]</b>.
            Subtracting the two bounds (6 − 3 = 3) also gives how many times 8 occurs.
          </>
        }
        zh={
          <>
            右边界 = 6 − 1 = <b>5</b>。合起来:8 占据区间 <b>[3, 5]</b>。
            两个边界一减(6 − 3 = 3)还顺带得到「8 出现了几次」。
          </>
        }
      />
    ),
  },
];

export function BoundaryStepper() {
  return (
    <ArrayStepper
      title={{
        en: "LC 34 · both ends of 8: lower_bound first, then upper_bound",
        zh: "LC 34 · 找 8 的左右边界(先 lower_bound,再 upper_bound)",
      }}
      frames={BND_FRAMES}
    />
  );
}

/* ============================================================
   RotatedStepper —— LC 33 旋转数组搜索(每步判断哪半有序)
   ============================================================ */

const ROT = [4, 5, 6, 7, 0, 1, 2]; // 升序数组「转了一下」,target = 0,答案下标 4

function rotCells(lo: number, hi: number, mid?: number, ok?: number): ArrayCell[] {
  return ROT.map((v, i) => {
    if (ok === i) return { v, state: "ok" as const };
    if (i === mid) return { v, state: "lit" as const };
    if (i < lo || i > hi) return { v, state: "ghost" as const };
    return { v };
  });
}

const ROT_FRAMES: ArrayFrame[] = [
  {
    cells: rotCells(0, 6),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <T
        en={
          <>
            [4,5,6,7,0,1,2] is a sorted array that was rotated: 7 is followed by 0, so there is
            exactly <b>one drop</b>. The array is not sorted as a whole, but wherever you cut
            it, at most one half can contain that drop. Target: <b>0</b>.
          </>
        }
        zh={
          <>
            [4,5,6,7,0,1,2] 是一个升序数组「转了一下」:7 后面接的是 0,
            恰好只有<b>一个下跌处</b>。整体不有序,但无论从哪里切开,
            最多只有一半会含着这个下跌。目标 <b>0</b>。
          </>
        }
      />
    ),
  },
  {
    cells: rotCells(0, 6, 3),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 3, label: "mid" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <T
        en={
          <>
            mid = 3 and a[3] = 7 ≠ 0. Check the left half [4,5,6,7]: a[lo] = 4 ≤ a[mid] = 7, so{" "}
            <b>the left half is sorted</b>. Inside a sorted half a range test is reliable: 0 is
            not in [4, 7), so the whole left half can be dropped. lo = 4.
          </>
        }
        zh={
          <>
            mid = 3,a[3] = 7 ≠ 0。看左半 [4,5,6,7]:a[lo] = 4 ≤ a[mid] = 7 → <b>左半有序</b>。
            在有序的一半里做范围判断是可靠的:0 不在 [4, 7) 内,
            所以整个有序左半都能扔掉,lo = 4。
          </>
        }
      />
    ),
  },
  {
    cells: rotCells(4, 6, 5),
    ptrs: [
      { i: 4, label: "lo" },
      { i: 5, label: "mid" },
      { i: 6, label: "hi" },
    ],
    msg: (
      <T
        en={
          <>
            Interval [4, 6]. mid = 5 and a[5] = 1 ≠ 0. Left half [0,1]: a[lo] = 0 ≤ a[mid] = 1,
            so it is sorted. This time 0 <b>is</b> inside [0, 1), so keep the left half:
            hi = mid − 1 = 4.
          </>
        }
        zh={
          <>
            区间 [4, 6]。mid = 5,a[5] = 1 ≠ 0。左半 [0,1]:a[lo] = 0 ≤ a[mid] = 1 → 有序。
            这次 0 <b>确实</b>落在 [0, 1) 里,所以保留左半:hi = mid − 1 = 4。
          </>
        }
      />
    ),
  },
  {
    cells: rotCells(4, 4, 4),
    ptrs: [{ i: 4, label: "lo·mid·hi" }],
    msg: (
      <T
        en={
          <>
            Interval [4, 4]. mid = 4 and a[4] = 0 equals the target — <b>found</b>. Return
            index 4.
          </>
        }
        zh={
          <>
            区间 [4, 4]。mid = 4,a[4] = 0 = target —— <b>命中</b>,返回下标 4。
          </>
        }
      />
    ),
  },
  {
    cells: rotCells(4, 4, undefined, 4),
    msg: (
      <T
        en={
          <>
            Three comparisons of mid were enough. Every step asked the same two questions:
            which half is sorted, and is the target inside it. The interval halves each time,
            so the time is <b>O(log n)</b>, the same as on a fully sorted array. This holds
            because LC 33 guarantees distinct values; duplicates would break the first
            question.
          </>
        }
        zh={
          <>
            三次判断就锁定了答案。每一步问的都是同样两个问题:哪半有序,目标在不在里面。
            区间每次减半,所以时间是 <b>O(log n)</b>,和完全有序的数组一样快。
            这依赖 LC 33「元素互不相同」的保证 —— 有重复时,第一个问题就答不出来了。
          </>
        }
      />
    ),
  },
];

export function RotatedStepper() {
  return (
    <ArrayStepper
      title={{
        en: "LC 33 · finding 0 in a rotated array (each step asks: which half is sorted?)",
        zh: "LC 33 · 在旋转数组里找 0(每步先问:哪半是有序的?)",
      }}
      frames={ROT_FRAMES}
    />
  );
}
