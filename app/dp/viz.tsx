"use client";

// 第 7 章 · DP 入门的三个专属可视化:
//  - FibNaiveTree:朴素递归 f(5) 的完整递归树 —— 亲眼看重复子问题有多铺张。
//  - FibMemoTree:同一棵树加上备忘录 —— 查表命中的子树根本不用长出来。
//    两者都复用 lib/algviz 的 TreePlayer,只是帧数据不同。
//  - RobLab:打家劫舍实验室 —— 亲手选房子,体会「相邻约束下的最优」有多难靠直觉。

import { useMemo, useState } from "react";
import { TreePlayer, type TreeNodeSpec, type TreeFrame, type TreeNodeState } from "@/lib/algviz";

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
        <>
          目标:算 f(5) = f(4) + f(3)。下面按「一头扎到底」的递归顺序,
          看这棵树怎么被完整走一遍 —— 留意重复出现的子问题。
        </>
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
        <>
          f({node.n}) 是<b>基准情形</b>,直接返回 {node.n}。
          {times > 1 && <> —— 这已经是第 <b>{times}</b> 次回答同一个问题了。</>}
        </>
      );
    } else if (times > 1) {
      msg = (
        <>
          ⚠️ 又要算 <b>f({node.n})</b>!它刚才明明已经算出来过(第 {times} 次),
          但朴素递归没有任何记忆 —— 只能把整棵子树<b>从头再长一遍</b>。
        </>
      );
    } else {
      msg = (
        <>
          进入 <b>f({node.n})</b>:它需要 f({node.n - 1}) 和 f({node.n - 2}),先递归左边。
        </>
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
      <>
        算清总账:15 次调用里,<b>不同的问题只有 6 个</b>(f(0)~f(5))。
        划掉的全是重复劳动 —— f(3) 算了 2 遍、f(2) 算了 3 遍、f(1) 算了 5 遍。
        n 每加 1,调用量约乘 1.6:这就是 <b>O(2ⁿ)</b> 的由来,n=50 时要跑上万亿次。
      </>
    ),
  });

  return frames;
}

const NAIVE_FRAMES = buildNaiveFrames();

export function FibNaiveTree() {
  return (
    <TreePlayer
      title="朴素递归 f(5):每个子问题都从头再算"
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
    msg: <>还是算 f(5),但这次随身带一本<b>备忘录(memo)</b>:算过的答案记下来,再遇到先查表。</>,
  },
  {
    states: { r: "path", rL: "cur" },
    msg: <>f(5) 需要 f(4):备忘录里没有,老老实实往下递归。</>,
  },
  {
    states: { r: "path", rL: "path", rLL: "cur" },
    msg: <>f(4) 需要 f(3):备忘录还是空的,继续。</>,
  },
  {
    states: { r: "path", rL: "path", rLL: "path", rLLL: "cur" },
    msg: <>f(3) 需要 f(2):没有,继续 —— 目前和朴素递归一模一样,先一头扎到底。</>,
  },
  {
    states: { r: "path", rL: "path", rLL: "path", rLLL: "path", rLLLL: "cur" },
    msg: <>f(1) 基准情形,返回 1。</>,
  },
  {
    states: { r: "path", rL: "path", rLL: "path", rLLL: "path", rLLLL: "done", rLLLR: "cur" },
    msg: (
      <>
        f(0) 基准情形,返回 0。于是 f(2) = 1 —— <b>写进备忘录📝</b>,以后谁再问 f(2),直接翻本子。
      </>
    ),
  },
  {
    states: { r: "path", rL: "path", rLL: "path", rLLL: "done", rLLLL: "done", rLLLR: "done", rLLR: "cur" },
    msg: (
      <>
        回到 f(3):还差 f(1),基准情形返回 1。f(3) = 2,<b>记入备忘录📝</b>。
      </>
    ),
  },
  {
    states: {
      r: "path", rL: "path",
      rLL: "done", rLLL: "done", rLLLL: "done", rLLLR: "done", rLLR: "done",
      rLR: "memo",
    },
    msg: (
      <>
        回到 f(4):需要 f(2) —— <b>查表命中!</b>直接返回 1。
        看清楚:f(2) 下面那棵子树<b>根本没有长出来</b>。f(4) = 3📝。
      </>
    ),
  },
  {
    states: {
      r: "path",
      rL: "done", rLL: "done", rLLL: "done", rLLLL: "done", rLLLR: "done", rLLR: "done",
      rLR: "memo", rR: "memo",
    },
    msg: (
      <>
        回到 f(5):需要 f(3) —— <b>又命中!</b>返回 2。右边整棵 f(3) 子树也省下了。
      </>
    ),
  },
  {
    states: {
      r: "sol",
      rL: "done", rLL: "done", rLLL: "done", rLLLL: "done", rLLLR: "done", rLLR: "done",
      rLR: "memo", rR: "memo",
    },
    msg: (
      <>
        f(5) = 3 + 2 = <b>5</b>。总账:<b>6 次真实计算 + 2 次查表</b>,
        幽灵节点全是省下的功夫。每个子问题最多算一次 —— <b>O(2ⁿ) 塌缩成 O(n)</b>。
        这一下「记账」,就是动态规划的全部秘密。
      </>
    ),
  },
];

export function FibMemoTree() {
  return (
    <TreePlayer
      title="记忆化递归 f(5):算过的,绝不算第二遍"
      nodes={TREE_SPEC}
      frames={MEMO_FRAMES}
    />
  );
}

/* ---------------- RobLab:打家劫舍实验室 ---------------- */

const HOUSES = [2, 7, 9, 3, 1];
const BEST = 12; // 2 + 9 + 1(下标 0、2、4)—— 与精讲 C 的 DP 表一致

export function RobLab() {
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
      <div className="viz-title">打家劫舍实验室 —— 点房子决定偷不偷(相邻两间会触发警报)</div>
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
                aria-label={`第 ${i} 间,金额 ${v}`}
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
          <>
            🚨 <b>警报!</b>相邻两间同时被偷 —— 这套方案作废,先取消一间。
          </>
        ) : isBest ? (
          <>
            🏆 <b>{sum}</b> —— 最优解(2 + 9 + 1)!注意代价:拿下 ¥9 之后,
            第二大的 ¥7 就必须整个放弃 —— 每个决定都牵连左右。
            5 间房你能手点出来,100 间呢?这种全局权衡正是 DP 的主场。
          </>
        ) : revealed ? (
          <>
            当前 <b>{sum}</b>,最优是 <b>{BEST}</b>(偷下标 0、2、4:2 + 9 + 1)。
            试试凑出它 —— 然后想想:如果有 100 间房,你还敢靠手点吗?
          </>
        ) : (
          <>
            当前合法收益:<b>{sum}</b>。觉得到顶了?点「看最优」对答案。
          </>
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
          清空重来
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => setRevealed(true)}>
          看最优
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          nums = [{HOUSES.join(", ")}] · 最优 {BEST}
        </span>
      </div>
    </div>
  );
}
