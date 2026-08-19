"use client";

// 第 7 章 · DP 入门的三个专属可视化:
//  - FibNaiveTree:朴素递归 f(5) 的完整递归树 —— 亲眼看重复子问题有多铺张。
//  - FibMemoTree:同一棵树加上备忘录 —— 查表命中的子树根本不用长出来。
//    两者都复用 lib/algviz 的 TreePlayer,只是帧数据不同。
//  - RobLab:打家劫舍实验室 —— 亲手选房子,体会「相邻约束下的最优」有多难靠直觉。
//
// 双语:帧旁白直接写成 <T en zh />(元素只在 Provider 内渲染,写在模块级常量里没问题);
// 组件内部的 aria-label / 按钮文案用 useL() 解析。

import { useMemo, useState } from "react";
import { TreePlayer, type TreeNodeSpec, type TreeFrame, type TreeNodeState } from "@/lib/algviz";
import { T, useL } from "@/lib/i18n";

/* ---------------- 斐波那契递归树(共用结构) ---------------- */

interface FibNode {
  id: string;
  n: number;
  parent?: string;
}

function buildFib(n: number, id = "r", parent?: string, acc: FibNode[] = []): FibNode[] {
  acc.push({ id, n, parent });
  if (n >= 2) {
    buildFib(n - 1, id + "L", id, acc);
    buildFib(n - 2, id + "R", id, acc);
  }
  return acc;
}

const FIB_NODES: FibNode[] = buildFib(5);

const TREE_SPEC: TreeNodeSpec[] = FIB_NODES.map((f) => ({
  id: f.id,
  label: `f(${f.n})`,
  parent: f.parent,
}));

/** id → 祖先 id 链(不含自己) */
function ancestors(id: string): string[] {
  const out: string[] = [];
  for (let i = id.length - 1; i >= 1; i--) out.push(id.slice(0, i));
  return out;
}

/* ---------------- FibNaiveTree:朴素递归 ---------------- */

function buildNaiveFrames(): TreeFrame[] {
  const frames: TreeFrame[] = [
    {
      states: {},
      msg: (
        <T
          en={
            <>
              Goal: compute f(5) = f(4) + f(3). The player follows the order a
              plain recursion actually takes — always the left child first, all
              the way down. Watch for subproblems that appear more than once.
            </>
          }
          zh={
            <>
              目标:算 f(5) = f(4) + f(3)。下面按朴素递归真实的调用顺序播放 ——
              永远先走左孩子,一路到底。注意那些出现不止一次的子问题。
            </>
          }
        />
      ),
    },
  ];

  const seen = new Map<number, number>(); // n → 已出现次数
  const order = FIB_NODES; // buildFib 本身就是先序(DFS)顺序

  order.forEach((node, i) => {
    const states: Record<string, TreeNodeState> = {};
    // 之前进入过的节点:在当前路径上的是 path,其余算完了标 done
    const anc = new Set(ancestors(node.id));
    for (let j = 0; j < i; j++) {
      const prev = order[j];
      states[prev.id] = anc.has(prev.id) ? "path" : "done";
    }
    states[node.id] = "cur";

    const times = (seen.get(node.n) ?? 0) + 1;
    seen.set(node.n, times);

    let msg: React.ReactNode;
    if (node.n <= 1) {
      msg = (
        <T
          en={
            <>
              f({node.n}) is a <b>base case</b>. It returns {node.n} directly.
              {times > 1 && (
                <>
                  {" "}
                  This is the <b>{times}</b>
                  {times === 2 ? "nd" : times === 3 ? "rd" : "th"} time the same
                  question has been answered.
                </>
              )}
            </>
          }
          zh={
            <>
              f({node.n}) 是<b>基准情形</b>,直接返回 {node.n}。
              {times > 1 && (
                <> 这已经是第 <b>{times}</b> 次回答同一个问题了。</>
              )}
            </>
          }
        />
      );
    } else if (times > 1) {
      msg = (
        <T
          en={
            <>
              ⚠️ <b>f({node.n})</b> again. It was already computed earlier, and
              this is call number {times}. Plain recursion keeps no record of
              past results, so the whole subtree below it has to be{" "}
              <b>built again from scratch</b>.
            </>
          }
          zh={
            <>
              ⚠️ 又要算 <b>f({node.n})</b>!它刚才已经算出来过,这是第 {times} 次。
              朴素递归不保留任何结果,只能把下面整棵子树<b>从头再长一遍</b>。
            </>
          }
        />
      );
    } else {
      msg = (
        <T
          en={
            <>
              Enter <b>f({node.n})</b>. It needs f({node.n - 1}) and f(
              {node.n - 2}), and the left branch is taken first.
            </>
          }
          zh={
            <>
              进入 <b>f({node.n})</b>:它需要 f({node.n - 1}) 和 f({node.n - 2}),
              先递归左边。
            </>
          }
        />
      );
    }
    frames.push({ states, msg });
  });

  // 收尾帧:第一次出现的问题标 done,重复出现的全部标 dead
  const firstSeen = new Set<number>();
  const finale: Record<string, TreeNodeState> = {};
  for (const node of order) {
    if (firstSeen.has(node.n)) {
      finale[node.id] = "dead";
    } else {
      firstSeen.add(node.n);
      finale[node.id] = node.id === "r" ? "sol" : "done";
    }
  }
  frames.push({
    states: finale,
    msg: (
      <T
        en={
          <>
            The final count: 15 calls, but only <b>6 distinct questions</b>,
            f(0) through f(5). Every greyed-out node is repeated work — f(3) was
            computed 2 times, f(2) 3 times, and f(1) 5 times. Each time n grows
            by 1 the number of calls is multiplied by about 1.6, which is
            exponential growth; it is usually written as <b>O(2ⁿ)</b> as a loose
            upper bound. At n = 50 that is about 40 billion calls.
          </>
        }
        zh={
          <>
            算清总账:15 次调用里,<b>不同的问题只有 6 个</b>(f(0)~f(5))。
            划掉的全是重复劳动 —— f(3) 算了 2 遍、f(2) 3 遍、f(1) 5 遍。
            n 每加 1,调用量约乘 1.6,这是指数增长,习惯上写成宽松的上界{" "}
            <b>O(2ⁿ)</b>。n = 50 时约要跑 400 亿次。
          </>
        }
      />
    ),
  });

  return frames;
}

const NAIVE_FRAMES = buildNaiveFrames();

export function FibNaiveTree() {
  return (
    <TreePlayer
      title={{
        en: "Plain recursion f(5): every subproblem is recomputed from scratch",
        zh: "朴素递归 f(5):每个子问题都从头再算",
      }}
      nodes={TREE_SPEC}
      frames={NAIVE_FRAMES}
    />
  );
}

/* ---------------- FibMemoTree:记忆化 ---------------- */

// 手工脚本:备忘录版只真正展开左侧一条链,命中缓存的子树保持幽灵态。
const MEMO_FRAMES: TreeFrame[] = [
  {
    states: { r: "cur" },
    msg: (
      <T
        en={
          <>
            Same target, f(5). This time the recursion keeps a table of results
            it has already produced. Before computing anything, it looks the
            question up in that table. The table is called a <b>memo</b>.
          </>
        }
        zh={
          <>
            还是算 f(5),但这次递归随身带一张「算过的结果表」:动手之前先查表。
            这张表叫<b>备忘录(memo)</b>。
          </>
        }
      />
    ),
  },
  {
    states: { r: "path", rL: "cur" },
    msg: (
      <T
        en={<>f(5) needs f(4). The memo is empty, so it recurses.</>}
        zh={<>f(5) 需要 f(4):备忘录里没有,只能往下递归。</>}
      />
    ),
  },
  {
    states: { r: "path", rL: "path", rLL: "cur" },
    msg: (
      <T
        en={<>f(4) needs f(3). Still not in the memo, so it goes deeper.</>}
        zh={<>f(4) 需要 f(3):备忘录还是空的,继续往下。</>}
      />
    ),
  },
  {
    states: { r: "path", rL: "path", rLL: "path", rLLL: "cur" },
    msg: (
      <T
        en={
          <>
            f(3) needs f(2). Not there either. So far this behaves exactly like
            plain recursion: it descends to the bottom first.
          </>
        }
        zh={
          <>
            f(3) 需要 f(2):还是没有,继续 —— 到这里为止,它和朴素递归一模一样,
            先一头扎到底。
          </>
        }
      />
    ),
  },
  {
    states: { r: "path", rL: "path", rLL: "path", rLLL: "path", rLLLL: "cur" },
    msg: (
      <T en={<>f(1) is a base case. It returns 1.</>} zh={<>f(1) 是基准情形,返回 1。</>} />
    ),
  },
  {
    states: { r: "path", rL: "path", rLL: "path", rLLL: "path", rLLLL: "done", rLLLR: "cur" },
    msg: (
      <T
        en={
          <>
            f(0) is a base case and returns 0. So f(2) = 1, and that value goes{" "}
            <b>into the memo</b>. Anyone who asks for f(2) later reads it from
            there.
          </>
        }
        zh={
          <>
            f(0) 是基准情形,返回 0。于是 f(2) = 1 —— <b>写进备忘录</b>,
            之后谁再问 f(2),直接从表里读。
          </>
        }
      />
    ),
  },
  {
    states: { r: "path", rL: "path", rLL: "path", rLLL: "done", rLLLL: "done", rLLLR: "done", rLLR: "cur" },
    msg: (
      <T
        en={
          <>
            Back in f(3): it still needs f(1), a base case that returns 1. So
            f(3) = 1 + 1 = 2, <b>stored in the memo</b>.
          </>
        }
        zh={
          <>
            回到 f(3):还差 f(1),基准情形返回 1。于是 f(3) = 1 + 1 = 2,
            <b>记入备忘录</b>。
          </>
        }
      />
    ),
  },
  {
    states: {
      r: "path", rL: "path",
      rLL: "done", rLLL: "done", rLLLL: "done", rLLLR: "done", rLLR: "done",
      rLR: "memo",
    },
    msg: (
      <T
        en={
          <>
            Back in f(4): it needs f(2). <b>The memo has it</b>, so 1 is returned
            at once. Look carefully — the subtree under this f(2){" "}
            <b>is never built</b>. f(4) = 2 + 1 = 3, stored.
          </>
        }
        zh={
          <>
            回到 f(4):需要 f(2) —— <b>查表命中</b>,直接返回 1。
            看清楚:这个 f(2) 下面那棵子树<b>根本没有长出来</b>。f(4) = 2 + 1 = 3,记入表中。
          </>
        }
      />
    ),
  },
  {
    states: {
      r: "path",
      rL: "done", rLL: "done", rLLL: "done", rLLLL: "done", rLLLR: "done", rLLR: "done",
      rLR: "memo", rR: "memo",
    },
    msg: (
      <T
        en={
          <>
            Back in f(5): it needs f(3). <b>Another hit</b>, returning 2. The
            entire f(3) subtree on the right is skipped as well.
          </>
        }
        zh={
          <>
            回到 f(5):需要 f(3) —— <b>又命中</b>,返回 2。右边整棵 f(3) 子树也被跳过了。
          </>
        }
      />
    ),
  },
  {
    states: {
      r: "sol",
      rL: "done", rLL: "done", rLLL: "done", rLLLL: "done", rLLLR: "done", rLLR: "done",
      rLR: "memo", rR: "memo",
    },
    msg: (
      <T
        en={
          <>
            f(5) = 3 + 2 = <b>5</b>. The count: 7 nodes were actually entered and
            2 requests were answered by a table lookup, out of 15 nodes in the
            full tree. Each of f(0) … f(5) is produced once, so the work is
            proportional to the number of distinct subproblems:{" "}
            <b>O(2ⁿ) becomes O(n)</b>. Storing each answer once is the whole
            change.
          </>
        }
        zh={
          <>
            f(5) = 3 + 2 = <b>5</b>。总账:整棵树 15 个节点,真正进入的只有 7 个,
            另有 2 次直接查表返回。f(0)~f(5) 每个只被算出来一次,
            工作量正比于不同子问题的个数 —— <b>O(2ⁿ) 变成 O(n)</b>。
            改变的只有一件事:每个答案只算一次,记下来重复使用。
          </>
        }
      />
    ),
  },
];

export function FibMemoTree() {
  return (
    <TreePlayer
      title={{
        en: "Memoized recursion f(5): nothing is computed twice",
        zh: "记忆化递归 f(5):算过的,绝不算第二遍",
      }}
      nodes={TREE_SPEC}
      frames={MEMO_FRAMES}
    />
  );
}

/* ---------------- RobLab:打家劫舍实验室 ---------------- */

const HOUSES = [2, 7, 9, 3, 1];
const BEST = 12; // 2 + 9 + 1(下标 0、2、4)—— 与精讲 C 的 DP 表一致

export function RobLab() {
  const L = useL();
  const [picked, setPicked] = useState<boolean[]>(() => HOUSES.map(() => false));
  const [revealed, setRevealed] = useState(false);

  const sum = useMemo(
    () => HOUSES.reduce((s, v, i) => s + (picked[i] ? v : 0), 0),
    [picked],
  );
  const violations = useMemo(() => {
    const bad = new Set<number>();
    for (let i = 0; i + 1 < HOUSES.length; i++) {
      if (picked[i] && picked[i + 1]) {
        bad.add(i);
        bad.add(i + 1);
      }
    }
    return bad;
  }, [picked]);

  const toggle = (i: number) => {
    setRevealed(false);
    setPicked((p) => p.map((v, j) => (j === i ? !v : v)));
  };

  const legal = violations.size === 0;
  const isBest = legal && sum === BEST;

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="House robber lab — click a house to take it or leave it (two neighbours set off the alarm)"
          zh="打家劫舍实验室 —— 点房子决定偷不偷(相邻两间会触发警报)"
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", paddingBottom: 22 }}>
          {HOUSES.map((v, i) => {
            const on = picked[i];
            const bad = violations.has(i);
            return (
              <button
                key={i}
                type="button"
                className={`cell${bad ? " bad" : on ? " ok" : ""}`}
                style={{ width: 62, height: 62, cursor: "pointer", flexDirection: "column", display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}
                onClick={() => toggle(i)}
                aria-pressed={on}
                aria-label={L({
                  en: `House ${i}, holding ${v}`,
                  zh: `第 ${i} 间,金额 ${v}`,
                })}
              >
                <span style={{ fontSize: 17 }}>{on ? (bad ? "🚨" : "💰") : "🏠"}</span>
                <span style={{ fontSize: 13 }}>{v}</span>
                <span className="cell-idx">{i}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {!legal ? (
          <T
            en={
              <>
                🚨 <b>Alarm.</b> Two neighbouring houses are selected, so this
                plan is not allowed. Deselect one of them.
              </>
            }
            zh={
              <>
                🚨 <b>警报!</b>相邻两间同时被偷 —— 这套方案不合法,先取消一间。
              </>
            }
          />
        ) : isBest ? (
          <T
            en={
              <>
                🏆 <b>{sum}</b> — this is the best possible total (2 + 9 + 1).
                Notice the cost: taking 9 forces you to give up 7, the second
                largest amount. Every choice constrains its neighbours. You can
                work out 5 houses by hand. With 100 houses you cannot, and that
                global trade-off is what DP handles.
              </>
            }
            zh={
              <>
                🏆 <b>{sum}</b> —— 这是最优解(2 + 9 + 1)。注意它的代价:
                拿下 9 之后,第二大的 7 就必须整个放弃 —— 每个决定都牵连左右邻居。
                5 间房还能手点,100 间就不行了,这种全局权衡正是 DP 要处理的事。
              </>
            }
          />
        ) : revealed ? (
          <T
            en={
              <>
                Current total <b>{sum}</b>. The best is <b>{BEST}</b> (take
                houses 0, 2, and 4: 2 + 9 + 1). Try to reach it, then ask
                yourself whether you would still trust hand-picking with 100
                houses.
              </>
            }
            zh={
              <>
                当前 <b>{sum}</b>,最优是 <b>{BEST}</b>(偷下标 0、2、4:2 + 9 + 1)。
                试着凑出它 —— 然后想想:如果有 100 间房,你还敢靠手点吗?
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                Current legal total: <b>{sum}</b>. Think you have reached the
                maximum? Press &quot;Show the best&quot; to check.
              </>
            }
            zh={
              <>
                当前合法收益:<b>{sum}</b>。觉得到顶了?点「看最优」对答案。
              </>
            }
          />
        )}
      </div>
      <div className="viz-ctl">
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => {
            setPicked(HOUSES.map(() => false));
            setRevealed(false);
          }}
        >
          <T en="Clear" zh="清空重来" />
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => setRevealed(true)}>
          <T en="Show the best" zh="看最优" />
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          nums = [{HOUSES.join(", ")}] ·{" "}
          <T en={<>best {BEST}</>} zh={<>最优 {BEST}</>} />
        </span>
      </div>
    </div>
  );
}
