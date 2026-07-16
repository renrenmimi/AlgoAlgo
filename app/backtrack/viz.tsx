"use client";

// 第 5 章 · 回溯的专属可视化。回溯的灵魂是「决策树上的 DFS」,所以本章
// 主力是 lib/algviz 的 TreePlayer(决策树播放器),外加两个自建组件:
//   - PermuteLab:全排列的 used 数组现场(绿=已用 / 黄=刚选 / 红=撞用过)。
//   - NQueensBoard:N 皇后棋盘,逐行放置、冲突检测、走进死胡同就回退。
//
// TreePlayer 用法回顾:节点静态注册(id/label/parent),帧只给「非默认态」;
// 未列出的节点是幽灵态(尚未访问)。cur=当前 / path=当前路径 / done=访问完 /
// dead=剪枝或死路(灰+删除线) / sol=解 / memo=命中缓存。

import { useMemo, type ReactNode } from "react";
import {
  TreePlayer,
  type TreeNodeSpec,
  type TreeFrame,
  type TreeNodeState,
} from "@/lib/algviz";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================================================================
   通用:决策树 DFS 帧生成器
   ================================================================ */

function treeParent(nodes: TreeNodeSpec[]) {
  const parent = new Map<string, string | undefined>();
  for (const n of nodes) parent.set(n.id, n.parent);
  return parent;
}

function ancestorsOf(parent: Map<string, string | undefined>, id: string): string[] {
  const out: string[] = [];
  let p = parent.get(id);
  while (p) {
    out.push(p);
    p = parent.get(p);
  }
  return out;
}

/** 按给定的 DFS 访问顺序 order,逐帧点亮决策树。
 *  solutions:哪些节点是「解」(收集点),历史帧里标绿(sol)。
 *  dead:全程灰掉的节点(剪掉的分支),每一帧都保持 dead。 */
function walkFrames(
  nodes: TreeNodeSpec[],
  order: string[],
  solutions: Set<string>,
  dead: Set<string>,
  msgs: ReactNode[],
  final: { states: Record<string, TreeNodeState>; msg: ReactNode },
): TreeFrame[] {
  const parent = treeParent(nodes);
  const frames: TreeFrame[] = [];
  for (let i = 0; i < order.length; i++) {
    const cur = order[i];
    const anc = new Set(ancestorsOf(parent, cur));
    const states: Record<string, TreeNodeState> = {};
    for (const d of dead) states[d] = "dead";
    for (let j = 0; j < i; j++) {
      const id = order[j];
      states[id] = solutions.has(id) ? "sol" : anc.has(id) ? "path" : "done";
    }
    for (const a of anc) states[a] = "path";
    states[cur] = "cur";
    frames.push({ states, msg: msgs[i] });
  }
  frames.push(final);
  return frames;
}

/* ================================================================
   §01 MazeTree —— 走迷宫,死路就退回
   ================================================================ */

const MAZE_NODES: TreeNodeSpec[] = [
  { id: "r", label: "起点", w: 52 },
  { id: "A", label: "左", parent: "r" },
  { id: "A1", label: "墙", parent: "A" },
  { id: "B", label: "右", parent: "r" },
  { id: "B1", label: "出口", parent: "B", w: 52 },
];

const MAZE_FRAMES: TreeFrame[] = [
  {
    states: { r: "cur" },
    msg: <>站在起点,眼前两条岔路。回溯的做法很朴素:<b>随便挑一条先试</b> —— 先走左边。</>,
  },
  {
    states: { r: "path", A: "cur" },
    msg: <>沿着左边这条路往前走。</>,
  },
  {
    states: { r: "path", A: "path", A1: "cur" },
    msg: <>前面是一堵墙 —— <b>死胡同</b>。这条路走不通了。</>,
  },
  {
    states: { r: "cur", A: "dead", A1: "dead" },
    msg: <>退回起点,把「左」这一段从脚下<b>撤销</b>(灰色划掉)—— 就当没走过。</>,
  },
  {
    states: { r: "path", A: "dead", A1: "dead", B: "cur" },
    msg: <>换另一条没试过的路:走右边。</>,
  },
  {
    states: { r: "path", A: "dead", A1: "dead", B: "path", B1: "sol" },
    msg: (
      <>
        找到出口!回溯的全部动作就这三下:<b>选一个 → 走下去 → 不行就撤销,换下一个</b>。
        把「岔路口」画成树,你就得到了本章所有题目的心智模型。
      </>
    ),
  },
];

export function MazeTree() {
  return (
    <TreePlayer
      title="走迷宫:回溯 = 试一条路,撞墙就退回来换一条"
      nodes={MAZE_NODES}
      frames={MAZE_FRAMES}
      nodeW={46}
      gapX={26}
      gapY={40}
      legend={false}
    />
  );
}

/* ================================================================
   §03 精讲 A · LC 77 组合(n=4, k=2)
   —— 全展开 vs 剪枝,两棵树对照
   ================================================================ */

// 组合树:startIndex 保证「只往后选」,避免 [1,2] 和 [2,1] 重复。
const COMB_NODES: TreeNodeSpec[] = [
  { id: "r", label: "∅" },
  { id: "n1", label: "1", parent: "r" },
  { id: "n2", label: "2", parent: "r" },
  { id: "n3", label: "3", parent: "r" },
  { id: "n4", label: "4", parent: "r" },
  { id: "n12", label: "2", parent: "n1" },
  { id: "n13", label: "3", parent: "n1" },
  { id: "n14", label: "4", parent: "n1" },
  { id: "n23", label: "3", parent: "n2" },
  { id: "n24", label: "4", parent: "n2" },
  { id: "n34", label: "4", parent: "n3" },
];

const COMB_SOL = new Set(["n12", "n13", "n14", "n23", "n24", "n34"]);

const COMB_FULL_ORDER = [
  "r", "n1", "n12", "n13", "n14", "n2", "n23", "n24", "n3", "n34", "n4",
];

const COMB_FULL_MSGS: ReactNode[] = [
  <>目标:从 {"{1,2,3,4}"} 里选 <b>2</b> 个数。路径为空,从 1 开始。</>,
  <>路径选 1 → [1]。关键规矩:<b>下一步只能选比 1 大的数</b>(用 startIndex 卡住),否则 [1,2] 和 [2,1] 会重复。</>,
  <>[1] 再选 2 → [1,2]:凑够 2 个,<b>记下组合 [1,2]</b> ✓,然后撤销 2 回到 [1]。</>,
  <>[1] 换选 3 → [1,3] ✓。</>,
  <>[1] 换选 4 → [1,4] ✓。[1] 这一支走完,撤销 1,回到空。</>,
  <>路径选 2 → [2],下一步只能选比 2 大的。</>,
  <>[2,3] ✓。</>,
  <>[2,4] ✓,撤销 2。</>,
  <>路径选 3 → [3]。</>,
  <>[3,4] ✓,撤销 3。</>,
  <>路径选 4 → [4]。可是后面<b>没有更大的数</b>了,永远凑不满 2 个 —— 这一整支是白跑的。</>,
];

const COMB_FULL_FINAL = {
  states: {
    r: "done",
    n1: "done", n2: "done", n3: "done",
    n4: "dead",
    n12: "sol", n13: "sol", n14: "sol", n23: "sol", n24: "sol", n34: "sol",
  } as Record<string, TreeNodeState>,
  msg: (
    <>
      一共 6 个解 = C(4,2)。但「选 4 」那次(灰色划掉)从一开始就注定失败 ——
      我们却真的走进去才发现。<b>下一张图,教你在进门前就把它砍掉。</b>
    </>
  ),
};

const COMB_FULL_FRAMES = walkFrames(
  COMB_NODES, COMB_FULL_ORDER, COMB_SOL, new Set(), COMB_FULL_MSGS, COMB_FULL_FINAL,
);

export function CombTreeFull() {
  return (
    <TreePlayer
      title="LC 77 组合 · 不剪枝:连注定失败的「选 4」也走了一遍"
      nodes={COMB_NODES}
      frames={COMB_FULL_FRAMES}
      nodeW={44}
      gapX={12}
    />
  );
}

// 剪枝版:进入循环前就判断「剩下的数够不够凑满 k 个」,不够直接不进。
const COMB_PRUNED_ORDER = [
  "r", "n1", "n12", "n13", "n14", "n2", "n23", "n24", "n3", "n34",
];

const COMB_PRUNED_MSGS: ReactNode[] = [
  <>同样从空路径出发,但这次带着剪枝的算盘:还要选 2 个,手里 4 个数 —— <b>起点最多到第 3 个</b>(选到 4 就没有后续了)。</>,
  <>选 1 → [1]。</>,
  <>[1,2] ✓。</>,
  <>[1,3] ✓。</>,
  <>[1,4] ✓,撤销 1。</>,
  <>选 2 → [2]。</>,
  <>[2,3] ✓。</>,
  <>[2,4] ✓,撤销 2。</>,
  <>选 3 → [3]。此时还剩一个 4,刚好够凑第 2 个。</>,
  <>[3,4] ✓。全部分支走完。</>,
];

const COMB_PRUNED_FINAL = {
  states: {
    r: "done",
    n1: "done", n2: "done", n3: "done",
    n4: "dead",
    n12: "sol", n13: "sol", n14: "sol", n23: "sol", n24: "sol", n34: "sol",
  } as Record<string, TreeNodeState>,
  msg: (
    <>
      同样拿到 6 个解,却<b>压根没进入「选 4」那条死路</b>(始终灰着)。
      剪枝的本质:<b>在进入子树之前,先算一算「这条路还有没有可能成功」</b> ——
      循环上界从 n 收紧成 <span className="mono">n − (k − 已选) + 1</span>。
    </>
  ),
};

const COMB_PRUNED_FRAMES = walkFrames(
  COMB_NODES, COMB_PRUNED_ORDER, COMB_SOL, new Set(["n4"]), COMB_PRUNED_MSGS, COMB_PRUNED_FINAL,
);

export function CombTreePruned() {
  return (
    <TreePlayer
      title="LC 77 组合 · 剪枝后:「选 4」一步都没走(灰色)"
      nodes={COMB_NODES}
      frames={COMB_PRUNED_FRAMES}
      nodeW={44}
      gapX={12}
    />
  );
}

/* ================================================================
   §06 精讲 B · LC 78 子集([1,2,3])
   —— 每个节点都是一个解(不只叶子)
   ================================================================ */

const SUBSET_NODES: TreeNodeSpec[] = [
  { id: "r", label: "∅" },
  { id: "a1", label: "1", parent: "r" },
  { id: "a12", label: "2", parent: "a1" },
  { id: "a123", label: "3", parent: "a12" },
  { id: "a13", label: "3", parent: "a1" },
  { id: "a2", label: "2", parent: "r" },
  { id: "a23", label: "3", parent: "a2" },
  { id: "a3", label: "3", parent: "r" },
];

const SUBSET_ORDER = ["r", "a1", "a12", "a123", "a13", "a2", "a23", "a3"];
const SUBSET_SOL = new Set(SUBSET_ORDER); // 每个节点都收

const SUBSET_MSGS: ReactNode[] = [
  <>空集 {"{}"} 也是一个合法子集 —— <b>先把它收进答案</b>,再从 1 往后选。</>,
  <>选 1 → {"{1}"},收下。注意:子集<b>不要求凑够个数</b>,所以走到哪个节点,那个节点就是一个答案。</>,
  <>{"{1}"} 再选 2 → {"{1,2}"},收下。</>,
  <>{"{1,2}"} 再选 3 → {"{1,2,3}"},收下;没有更大的数了,撤销回 {"{1}"}。</>,
  <>{"{1}"} 换选 3 → {"{1,3}"},收下;{"{1}"} 这一支结束,撤销 1。</>,
  <>选 2 → {"{2}"},收下。</>,
  <>{"{2,3}"},收下,撤销。</>,
  <>选 3 → {"{3}"},收下。</>,
];

const SUBSET_FINAL = {
  states: Object.fromEntries(SUBSET_ORDER.map((id) => [id, "sol"])) as Record<string, TreeNodeState>,
  msg: (
    <>
      8 个子集 = 2³,一个不漏。和组合唯一的结构差别就一句话:
      <b>组合/排列在叶子收结果,子集在每一个节点都收</b> —— 因为「路径本身」就是子集。
    </>
  ),
};

const SUBSET_FRAMES = walkFrames(
  SUBSET_NODES, SUBSET_ORDER, SUBSET_SOL, new Set(), SUBSET_MSGS, SUBSET_FINAL,
);

export function SubsetTree() {
  return (
    <TreePlayer
      title="LC 78 子集 · 每到一个节点就收一次(绿=已收进答案)"
      nodes={SUBSET_NODES}
      frames={SUBSET_FRAMES}
      nodeW={44}
      gapX={14}
    />
  );
}

/* ================================================================
   §08 去重两板斧 · 子集 II [1,1,2]
   —— 不去重(冒出重复)vs 树层去重(剪掉重复分支)
   ================================================================ */

// [1(下标0), 1(下标1), 2(下标2)]
const DUP_NODES: TreeNodeSpec[] = [
  { id: "r", label: "∅" },
  { id: "a", label: "1", parent: "r" },
  { id: "aa", label: "1", parent: "a" },
  { id: "aab", label: "2", parent: "aa" },
  { id: "ab", label: "2", parent: "a" },
  { id: "b", label: "1", parent: "r" },
  { id: "bb", label: "2", parent: "b" },
  { id: "c", label: "2", parent: "r" },
];

const DUP_ORDER = ["r", "a", "aa", "aab", "ab", "b", "bb", "c"];
const DUP_SOL = new Set(DUP_ORDER);

const DUP_MSGS: ReactNode[] = [
  <>数组 [1, 1, 2] 里有两个 1。先不做任何处理,老实枚举每个下标。空集收下。</>,
  <>选下标 0 的 1 → {"{1}"},收下。</>,
  <>再选下标 1 的 1 → {"{1,1}"},收下。</>,
  <>再选 2 → {"{1,1,2}"},收下。</>,
  <>回到 {"{1}"},换选 2 → {"{1,2}"},收下。</>,
  <>回到根,选下标 1 的 1 → 又得到 {"{1}"} —— <b>和第 1 步一模一样,重复了!</b></>,
  <>它下面再选 2 → {"{1,2}"} —— <b>又撞车。</b></>,
  <>选下标 2 的 2 → {"{2}"},这个不重复。</>,
];

const DUP_FINAL = {
  states: {
    ...Object.fromEntries(DUP_ORDER.map((id) => [id, "sol"])),
    b: "dead", bb: "dead",
  } as Record<string, TreeNodeState>,
  msg: (
    <>
      8 个结果里混进了 2 个<b>重复解</b>({"{1}"} 和 {"{1,2}"} 各出现两次,灰色划掉)。
      病根:<b>在同一层里,第二个 1 又开了一遍和第一个 1 完全相同的分支</b>。
    </>
  ),
};

const DUP_FRAMES = walkFrames(
  DUP_NODES, DUP_ORDER, DUP_SOL, new Set(), DUP_MSGS, DUP_FINAL,
);

export function DupSubsetTree() {
  return (
    <TreePlayer
      title="子集 II · 不去重:{1} 和 {1,2} 各冒出两次"
      nodes={DUP_NODES}
      frames={DUP_FRAMES}
      nodeW={44}
      gapX={14}
    />
  );
}

// 树层去重:排序后,同一层遇到 nums[i]==nums[i-1] 且 i>start 就跳过。
const DEDUP_ORDER = ["r", "a", "aa", "aab", "ab", "c"];
const DEDUP_SOL = new Set(DEDUP_ORDER);

const DEDUP_MSGS: ReactNode[] = [
  <>先排序(这里本就有序)。规则一句话:<b>同一层里,若当前数和前一个数相同,就跳过</b>。空集收下。</>,
  <>同层第一个 1(下标 0)→ {"{1}"},收下,正常展开。</>,
  <>往下走一层。这里的「前一个 1」在<b>路径上(树枝方向)</b>,<b>允许</b>接着用 → {"{1,1}"}。</>,
  <>{"{1,1,2}"},收下。</>,
  <>{"{1,2}"},收下。</>,
  <>回到根这一层,选下标 2 的 2 → {"{2}"}。</>,
];

const DEDUP_FINAL = {
  states: {
    ...Object.fromEntries(DEDUP_ORDER.map((id) => [id, "sol"])),
    b: "dead", bb: "dead",
  } as Record<string, TreeNodeState>,
  msg: (
    <>
      回到根这一层时,下标 1 的 1 和下标 0 的 1 相同、而下标 0 的 1 <b>已经用完撤销</b>
      (同层重复)→ 整条分支<b>提前剪掉</b>(灰色)。6 个子集,不重不漏。这就是<b>树层去重</b>。
    </>
  ),
};

const DEDUP_FRAMES = walkFrames(
  DUP_NODES, DEDUP_ORDER, DEDUP_SOL, new Set(["b", "bb"]), DEDUP_MSGS, DEDUP_FINAL,
);

export function DedupSubsetTree() {
  return (
    <TreePlayer
      title="子集 II · 树层去重:重复的那条分支一步没走(灰色)"
      nodes={DUP_NODES}
      frames={DEDUP_FRAMES}
      nodeW={44}
      gapX={14}
    />
  );
}

/* ================================================================
   §07 精讲 C · LC 46 全排列 —— used 数组现场
   ================================================================ */

type PermAction = "choose" | "skip" | "complete" | "back";

interface PermFrame {
  path: number[];
  used: boolean[];
  trying?: number;
  action: PermAction;
  msg: ReactNode;
}

function buildPermFrames(nums: number[]): PermFrame[] {
  const frames: PermFrame[] = [];
  const used = nums.map(() => false);
  const path: number[] = [];
  const snap = () => ({ path: [...path], used: [...used] });

  const dfs = () => {
    if (path.length === nums.length) {
      frames.push({ ...snap(), action: "complete", msg: (
        <>路径满了 → 收下一个排列 <b>[{path.join(", ")}]</b>,然后开始回溯。</>
      ) });
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) {
        frames.push({ ...snap(), trying: i, action: "skip", msg: (
          <><b>{nums[i]}</b> 的 used 是 true(已经在路径里)—— <b>跳过</b>,排列不能重复用同一个位置。</>
        ) });
        continue;
      }
      frames.push({ ...snap(), trying: i, action: "choose", msg: (
        <>选 <b>{nums[i]}</b>:加入路径、把 used[{i}] 标成 true。</>
      ) });
      used[i] = true;
      path.push(nums[i]);
      dfs();
      used[i] = false;
      path.pop();
      frames.push({ ...snap(), trying: i, action: "back", msg: (
        <><b>撤销 {nums[i]}</b>:弹出路径、used[{i}] 改回 false —— 「加入 → 递归 → 撤销」三部曲的最后一步。</>
      ) });
    }
  };
  dfs();
  frames.push({ path: [], used: nums.map(() => false), action: "complete", msg: (
    <>全部走完:{nums.length}! = 6 个排列。<b>used 数组是排列的命根子</b> —— 它记住「哪些数已经在路径里」,防止一个数被用两次。</>
  ) });
  return frames;
}

const PERM_NUMS = [1, 2, 3];
const PERM_FRAMES = buildPermFrames(PERM_NUMS);

export function PermuteLab() {
  const s = useStepper(PERM_FRAMES.length, 1200);
  const f = PERM_FRAMES[s.step];
  return (
    <div className="viz">
      <div className="viz-title">
        LC 46 全排列 [1,2,3] · used 数组现场(绿=已用 · 黄=刚选 · 红=撞用过)
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 20 }}>
        <div className="bt-perm-row">
          <span className="bt-perm-lab">路径 path</span>
          <div className="bt-perm-cells">
            {Array.from({ length: PERM_NUMS.length }).map((_, k) => {
              const v = f.path[k];
              return (
                <div
                  key={k}
                  className={`cell ${v !== undefined ? "ok" : "ghost"}`}
                  style={{ width: 50, height: 50 }}
                >
                  {v ?? ""}
                </div>
              );
            })}
          </div>
        </div>
        <div className="bt-perm-row">
          <span className="bt-perm-lab">候选 / used</span>
          <div className="bt-perm-cells">
            {PERM_NUMS.map((v, i) => {
              let cls = "cell";
              if (f.trying === i) cls += f.action === "skip" ? " bad" : " lit";
              else if (f.used[i]) cls += " ok";
              return (
                <div key={i} className={cls} style={{ width: 50, height: 50 }}>
                  {v}
                  <span className="cell-idx">{f.used[i] ? "T" : "F"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">{f.msg}</div>
      <StepControls stepper={s} step={s.step} total={PERM_FRAMES.length} />
    </div>
  );
}

/* ================================================================
   §09 精讲 D · LC 51 N 皇后 —— 自建棋盘
   逐行放置、冲突检测、走进死胡同就回退
   ================================================================ */

interface QFrame {
  placed: number[]; // placed[r] = col
  placedCount: number;
  trying?: [number, number];
  bad?: boolean;
  attackers?: [number, number][];
  solved?: boolean;
  msg: ReactNode;
}

function buildQueenFrames(n: number): QFrame[] {
  const frames: QFrame[] = [];
  const cols: number[] = [];
  let done = false;

  const attackers = (r: number, c: number): [number, number][] => {
    const out: [number, number][] = [];
    for (let pr = 0; pr < r; pr++) {
      const pc = cols[pr];
      if (pc === c || Math.abs(pr - r) === Math.abs(pc - c)) out.push([pr, pc]);
    }
    return out;
  };

  frames.push({
    placed: [],
    placedCount: 0,
    msg: (
      <>
        {n}×{n} 棋盘。规则:任意两个皇后不能<b>同行、同列、同一条斜线</b>。
        我们<b>逐行</b>放,每行挑一个不被上方皇后攻击的格子。
      </>
    ),
  });

  const dfs = (r: number) => {
    if (done) return;
    if (r === n) {
      done = true;
      frames.push({
        placed: cols.slice(),
        placedCount: n,
        solved: true,
        msg: (
          <>
            第 {r} 行也放好了 —— <b>找到一个解!</b>四个皇后互不攻击,
            列坐标 [{cols.join(", ")}]。
          </>
        ),
      });
      return;
    }
    for (let c = 0; c < n && !done; c++) {
      const atk = attackers(r, c);
      if (atk.length > 0) {
        const [ar, ac] = atk[0];
        const why = ac === c ? "同列" : "同斜线";
        frames.push({
          placed: cols.slice(0, r),
          placedCount: r,
          trying: [r, c],
          bad: true,
          attackers: atk,
          msg: (
            <>
              第 {r} 行试第 <b>{c}</b> 列:和第 {ar} 行(第 {ac} 列)的皇后{why},
              <b>不行</b>,换下一列。
            </>
          ),
        });
        continue;
      }
      cols[r] = c;
      frames.push({
        placed: cols.slice(0, r + 1),
        placedCount: r + 1,
        trying: [r, c],
        msg: (
          <>
            第 {r} 行第 <b>{c}</b> 列没人攻击 —— <b>放下 ♛</b>,进入第 {r + 1} 行。
          </>
        ),
      });
      dfs(r + 1);
      if (done) return;
      cols.length = r;
      frames.push({
        placed: cols.slice(0, r),
        placedCount: r,
        trying: [r, c],
        msg: (
          <>
            <b>回退</b>:第 {r} 行放在第 {c} 列这条路走不通,把这颗 ♛ 挪走,试更靠右的列。
          </>
        ),
      });
    }
    if (!done && r > 0) {
      frames.push({
        placed: cols.slice(0, r),
        placedCount: r,
        msg: (
          <>第 {r} 行的每一种放法都走不通 —— <b>死胡同</b>,退回第 {r - 1} 行。</>
        ),
      });
    }
  };

  dfs(0);
  return frames;
}

const QUEEN_N = 4;
const QUEEN_FRAMES = buildQueenFrames(QUEEN_N);

export function NQueensBoard() {
  const s = useStepper(QUEEN_FRAMES.length, 1200);
  const f = QUEEN_FRAMES[s.step];
  const n = QUEEN_N;

  const cells = useMemo(() => Array.from({ length: n * n }, (_, idx) => idx), [n]);

  return (
    <div className="viz">
      <div className="viz-title">
        LC 51 N 皇后 · 4×4 逐行放置(♛=皇后 · 红=冲突 · 环=正在攻击的皇后)
      </div>
      <div className="viz-stage">
        <div className="bt-board" style={{ gridTemplateColumns: `repeat(${n}, 50px)` }}>
          {cells.map((idx) => {
            const r = Math.floor(idx / n);
            const c = idx % n;
            const isQueen = r < f.placedCount && f.placed[r] === c;
            const isTry = !!f.trying && f.trying[0] === r && f.trying[1] === c;
            const isAtk = (f.attackers ?? []).some(([ar, ac]) => ar === r && ac === c);
            let state = "empty";
            if (isQueen) state = f.solved ? "win" : isAtk ? "atk" : "queen";
            else if (isTry) state = f.bad ? "bad" : "try";
            const dark = (r + c) % 2 === 1;
            return (
              <div
                key={idx}
                className={`bt-sq${dark ? " dark" : ""}`}
                data-state={state}
              >
                {isQueen ? "♛" : isTry ? (f.bad ? "✕" : "?") : ""}
              </div>
            );
          })}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">{f.msg}</div>
      <StepControls stepper={s} step={s.step} total={QUEEN_FRAMES.length} />
    </div>
  );
}
