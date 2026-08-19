"use client";

// 第 5 章 · 回溯的专属可视化。回溯的灵魂是「决策树上的 DFS」,所以本章
// 主力是 lib/algviz 的 TreePlayer(决策树播放器),外加两个自建组件:
//   - PermuteLab:全排列的 used 数组现场(绿=已用 / 黄=刚选 / 红=撞用过)。
//   - NQueensBoard:N 皇后棋盘,逐行放置、冲突检测、走进死胡同就回退。
//
// TreePlayer 用法回顾:节点静态注册(id/label/parent),帧只给「非默认态」;
// 未列出的节点是幽灵态(尚未访问)。cur=当前 / path=当前路径 / done=访问完 /
// dead=剪枝或死路(灰+删除线) / sol=解 / memo=命中缓存。
//
// 双语:节点标签、播放器标题传 { en, zh };每帧旁白直接写 <T en zh />。
// 节点标签不要写死 w —— TreePlayer 会按解析后的标签长度自动估宽,
// 写死 w 反而会让较长的英文标签被切掉。

import { useMemo, type ReactNode } from "react";
import {
  TreePlayer,
  type TreeNodeSpec,
  type TreeFrame,
  type TreeNodeState,
} from "@/lib/algviz";
import { useStepper, StepControls } from "@/lib/stepper";
import { T, useL } from "@/lib/i18n";

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
 *  dead:全程灰掉的节点(一步都没走的分支),每一帧都保持 dead。 */
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
  { id: "r", label: { en: "Start", zh: "起点" } },
  { id: "A", label: { en: "Left", zh: "左" }, parent: "r" },
  { id: "A1", label: { en: "Wall", zh: "墙" }, parent: "A" },
  { id: "B", label: { en: "Right", zh: "右" }, parent: "r" },
  { id: "B1", label: { en: "Exit", zh: "出口" }, parent: "B" },
];

const MAZE_FRAMES: TreeFrame[] = [
  {
    states: { r: "cur" },
    msg: (
      <T
        en={
          <>
            You are standing at the start, and two paths lead away from it.
            Backtracking does the plain thing: <b>pick one and try it</b>. Go left
            first.
          </>
        }
        zh={
          <>
            站在起点,眼前两条岔路。回溯的做法很朴素:<b>随便挑一条先试</b> —— 先走左边。
          </>
        }
      />
    ),
  },
  {
    states: { r: "path", A: "cur" },
    msg: <T en={<>Walk along the left path.</>} zh={<>沿着左边这条路往前走。</>} />,
  },
  {
    states: { r: "path", A: "path", A1: "cur" },
    msg: (
      <T
        en={
          <>
            The path ends at a wall — a <b>dead end</b>. Nothing below this point can
            be an answer.
          </>
        }
        zh={
          <>
            前面是一堵墙 —— <b>死胡同</b>。这条路下面不可能有答案了。
          </>
        }
      />
    ),
  },
  {
    states: { r: "cur", A: "dead", A1: "dead" },
    msg: (
      <T
        en={
          <>
            Step back to the start and <b>undo</b> the &quot;left&quot; choice (greyed
            out). The state is now exactly what it was before that choice was made.
          </>
        }
        zh={
          <>
            退回起点,把「左」这一段<b>撤销</b>(灰色划掉)—— 现场恢复成做这个选择之前的样子。
          </>
        }
      />
    ),
  },
  {
    states: { r: "path", A: "dead", A1: "dead", B: "cur" },
    msg: (
      <T
        en={<>Take a path that has not been tried yet: go right.</>}
        zh={<>换另一条没试过的路:走右边。</>}
      />
    ),
  },
  {
    states: { r: "path", A: "dead", A1: "dead", B: "path", B1: "sol" },
    msg: (
      <T
        en={
          <>
            The exit is found. Backtracking is only these three moves:{" "}
            <b>take a choice → go deeper → if it fails, undo it and take the next
            one</b>. Draw the forks as a tree and you have the model for every problem
            in this chapter.
          </>
        }
        zh={
          <>
            找到出口!回溯的全部动作就这三下:<b>选一个 → 走下去 → 不行就撤销,换下一个</b>。
            把「岔路口」画成树,你就得到了本章所有题目的心智模型。
          </>
        }
      />
    ),
  },
];

export function MazeTree() {
  return (
    <TreePlayer
      title={{
        en: "Walking a maze: try one path, and when it hits a wall step back and take another",
        zh: "走迷宫:回溯 = 试一条路,撞墙就退回来换一条",
      }}
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
  <T
    key="f0"
    en={<>Goal: choose <b>2</b> numbers from {"{1,2,3,4}"}. The path is empty and the loop starts at 1.</>}
    zh={<>目标:从 {"{1,2,3,4}"} 里选 <b>2</b> 个数。路径为空,从 1 开始。</>}
  />,
  <T
    key="f1"
    en={
      <>
        Take 1, so the path is [1]. The rule that matters:{" "}
        <b>the next pick may only be a number after 1</b> (that is what startIndex
        does). Without it the search would produce both [1,2] and [2,1].
      </>
    }
    zh={
      <>
        路径选 1 → [1]。关键规矩:<b>下一步只能选比 1 大的数</b>(用 startIndex 卡住),
        否则 [1,2] 和 [2,1] 会同时被生成。
      </>
    }
  />,
  <T
    key="f2"
    en={<>[1] takes 2 → [1,2]. The path holds 2 numbers, so <b>record a copy of it</b> ✓, then undo 2 and return to [1].</>}
    zh={<>[1] 再选 2 → [1,2]:凑够 2 个,<b>把路径的一份拷贝收进答案</b> ✓,然后撤销 2 回到 [1]。</>}
  />,
  <T key="f3" en={<>[1] takes 3 instead → [1,3] ✓.</>} zh={<>[1] 换选 3 → [1,3] ✓。</>} />,
  <T
    key="f4"
    en={<>[1] takes 4 → [1,4] ✓. Branch [1] is finished, so undo 1 and return to the empty path.</>}
    zh={<>[1] 换选 4 → [1,4] ✓。[1] 这一支走完,撤销 1,回到空路径。</>}
  />,
  <T key="f5" en={<>Take 2 → [2]. The next pick may only be a number after 2.</>} zh={<>路径选 2 → [2],下一步只能选比 2 大的。</>} />,
  <T key="f6" en={<>[2,3] ✓.</>} zh={<>[2,3] ✓。</>} />,
  <T key="f7" en={<>[2,4] ✓, then undo 2.</>} zh={<>[2,4] ✓,撤销 2。</>} />,
  <T key="f8" en={<>Take 3 → [3].</>} zh={<>路径选 3 → [3]。</>} />,
  <T key="f9" en={<>[3,4] ✓, then undo 3.</>} zh={<>[3,4] ✓,撤销 3。</>} />,
  <T
    key="f10"
    en={
      <>
        Take 4 → [4]. But <b>no number comes after 4</b>, so this branch can never
        reach 2 elements. The visit was wasted work.
      </>
    }
    zh={
      <>
        路径选 4 → [4]。可是后面<b>没有更大的数</b>了,永远凑不满 2 个 —— 这一趟是白跑的。
      </>
    }
  />,
];

const COMB_FULL_FINAL = {
  states: {
    r: "done",
    n1: "done", n2: "done", n3: "done", n4: "done",
    n12: "sol", n13: "sol", n14: "sol", n23: "sol", n24: "sol", n34: "sol",
  } as Record<string, TreeNodeState>,
  msg: (
    <T
      en={
        <>
          6 solutions, which is C(4,2). Note the branch starting with 4: it was
          entered, it produced nothing, and it was <b>doomed before it was entered</b>{" "}
          — the search only found that out after stepping in.{" "}
          <b>The next tree cuts that branch before entering it.</b>
        </>
      }
      zh={
        <>
          一共 6 个解 = C(4,2)。注意「选 4」那一支:进去了、什么也没带回来,
          而它<b>在进门之前就注定失败</b> —— 我们却真的走进去才发现。
          <b>下一张图,教你在进门前就把它砍掉。</b>
        </>
      }
    />
  ),
};

const COMB_FULL_FRAMES = walkFrames(
  COMB_NODES, COMB_FULL_ORDER, COMB_SOL, new Set(), COMB_FULL_MSGS, COMB_FULL_FINAL,
);

export function CombTreeFull() {
  return (
    <TreePlayer
      title={{
        en: "LC 77 Combinations · no pruning: even the hopeless branch starting with 4 is visited",
        zh: "LC 77 组合 · 不剪枝:连注定失败的「选 4」也走了一遍",
      }}
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
  <T
    key="p0"
    en={
      <>
        The same empty path, but now the loop limit is computed first: 2 more numbers
        are needed and 4 are available, so <b>the first pick can go no further than 3</b>.
        Starting at 4 would leave nothing after it, so that node stays grey the whole
        way: the search never enters it.
      </>
    }
    zh={
      <>
        同样从空路径出发,但这次先算循环上界:还要选 2 个,手里 4 个数 ——
        <b>起点最多到 3</b>。从 4 起头后面就没有数了,所以那个节点全程灰着:搜索一次都不进去。
      </>
    }
  />,
  <T key="p1" en={<>Take 1 → [1].</>} zh={<>选 1 → [1]。</>} />,
  <T key="p2" en={<>[1,2] ✓.</>} zh={<>[1,2] ✓。</>} />,
  <T key="p3" en={<>[1,3] ✓.</>} zh={<>[1,3] ✓。</>} />,
  <T key="p4" en={<>[1,4] ✓, then undo 1.</>} zh={<>[1,4] ✓,撤销 1。</>} />,
  <T key="p5" en={<>Take 2 → [2].</>} zh={<>选 2 → [2]。</>} />,
  <T key="p6" en={<>[2,3] ✓.</>} zh={<>[2,3] ✓。</>} />,
  <T key="p7" en={<>[2,4] ✓, then undo 2.</>} zh={<>[2,4] ✓,撤销 2。</>} />,
  <T
    key="p8"
    en={<>Take 3 → [3]. One number, 4, is still left, which is exactly enough for the second pick.</>}
    zh={<>选 3 → [3]。此时还剩一个 4,刚好够凑第 2 个。</>}
  />,
  <T key="p9" en={<>[3,4] ✓. Every branch is finished.</>} zh={<>[3,4] ✓。全部分支走完。</>} />,
];

const COMB_PRUNED_FINAL = {
  states: {
    r: "done",
    n1: "done", n2: "done", n3: "done",
    n4: "dead",
    n12: "sol", n13: "sol", n14: "sol", n23: "sol", n24: "sol", n34: "sol",
  } as Record<string, TreeNodeState>,
  msg: (
    <T
      en={
        <>
          The same 6 solutions, but the branch starting with 4 was{" "}
          <b>never entered</b> (grey). That is what pruning does:{" "}
          <b>before entering a subtree, check whether it can still produce a full
          answer</b>. Here the loop&apos;s upper limit tightens from n to{" "}
          <span className="mono">n − (k − chosen) + 1</span>. This is a{" "}
          <b>constraint check</b>: the branch cannot be valid, not merely worse.
        </>
      }
      zh={
        <>
          同样拿到 6 个解,却<b>一步都没走进「选 4」那条路</b>(始终灰着)。
          剪枝的本质:<b>进入子树之前,先判断它还能不能凑出完整答案</b> ——
          循环上界从 n 收紧成 <span className="mono">n − (k − 已选) + 1</span>。
          这属于<b>约束剪枝</b>:那条分支不可能合法,而不是「可能更差」。
        </>
      }
    />
  ),
};

const COMB_PRUNED_FRAMES = walkFrames(
  COMB_NODES, COMB_PRUNED_ORDER, COMB_SOL, new Set(["n4"]), COMB_PRUNED_MSGS, COMB_PRUNED_FINAL,
);

export function CombTreePruned() {
  return (
    <TreePlayer
      title={{
        en: "LC 77 Combinations · with pruning: the branch starting with 4 is never entered (grey)",
        zh: "LC 77 组合 · 剪枝后:「选 4」一步都没走(灰色)",
      }}
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
  <T
    key="s0"
    en={<>The empty set {"{}"} is a valid subset, so <b>record it first</b>, then start picking from 1.</>}
    zh={<>空集 {"{}"} 也是一个合法子集 —— <b>先把它收进答案</b>,再从 1 往后选。</>}
  />,
  <T
    key="s1"
    en={
      <>
        Take 1 → {"{1}"}, recorded. Subsets have <b>no required length</b>, so every
        node the search reaches is itself an answer.
      </>
    }
    zh={
      <>
        选 1 → {"{1}"},收下。注意:子集<b>不要求凑够个数</b>,所以走到哪个节点,那个节点就是一个答案。
      </>
    }
  />,
  <T key="s2" en={<>{"{1}"} takes 2 → {"{1,2}"}, recorded.</>} zh={<>{"{1}"} 再选 2 → {"{1,2}"},收下。</>} />,
  <T
    key="s3"
    en={<>{"{1,2}"} takes 3 → {"{1,2,3}"}, recorded. Nothing larger is left, so undo 3, then undo 2, and return to {"{1}"}.</>}
    zh={<>{"{1,2}"} 再选 3 → {"{1,2,3}"},收下;没有更大的数了,撤销 3、再撤销 2,回到 {"{1}"}。</>}
  />,
  <T
    key="s4"
    en={<>{"{1}"} takes 3 instead → {"{1,3}"}, recorded. Branch {"{1}"} is finished, so undo 1.</>}
    zh={<>{"{1}"} 换选 3 → {"{1,3}"},收下;{"{1}"} 这一支结束,撤销 1。</>}
  />,
  <T key="s5" en={<>Take 2 → {"{2}"}, recorded.</>} zh={<>选 2 → {"{2}"},收下。</>} />,
  <T key="s6" en={<>{"{2,3}"}, recorded, then undo.</>} zh={<>{"{2,3}"},收下,撤销。</>} />,
  <T key="s7" en={<>Take 3 → {"{3}"}, recorded.</>} zh={<>选 3 → {"{3}"},收下。</>} />,
];

const SUBSET_FINAL = {
  states: Object.fromEntries(SUBSET_ORDER.map((id) => [id, "sol"])) as Record<string, TreeNodeState>,
  msg: (
    <T
      en={
        <>
          8 subsets = 2³, none missing. Against combinations there is exactly one
          structural difference:{" "}
          <b>combinations and permutations record at the leaves, subsets record at
          every node</b> — because the path itself is already a subset.
        </>
      }
      zh={
        <>
          8 个子集 = 2³,一个不漏。和组合唯一的结构差别就一句话:
          <b>组合和排列在叶子收结果,子集在每一个节点都收</b> —— 因为「路径本身」就是一个子集。
        </>
      }
    />
  ),
};

const SUBSET_FRAMES = walkFrames(
  SUBSET_NODES, SUBSET_ORDER, SUBSET_SOL, new Set(), SUBSET_MSGS, SUBSET_FINAL,
);

export function SubsetTree() {
  return (
    <TreePlayer
      title={{
        en: "LC 78 Subsets · one answer is recorded at every node (green = already recorded)",
        zh: "LC 78 子集 · 每到一个节点就收一次(绿=已收进答案)",
      }}
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
  <T
    key="d0"
    en={<>The array [1, 1, 2] holds two 1s. Do nothing special at first and enumerate every index. The empty set is recorded.</>}
    zh={<>数组 [1, 1, 2] 里有两个 1。先不做任何处理,老实枚举每个下标。空集收下。</>}
  />,
  <T key="d1" en={<>Take the 1 at index 0 → {"{1}"}, recorded.</>} zh={<>选下标 0 的 1 → {"{1}"},收下。</>} />,
  <T key="d2" en={<>Take the 1 at index 1 → {"{1,1}"}, recorded.</>} zh={<>再选下标 1 的 1 → {"{1,1}"},收下。</>} />,
  <T key="d3" en={<>Take 2 → {"{1,1,2}"}, recorded.</>} zh={<>再选 2 → {"{1,1,2}"},收下。</>} />,
  <T key="d4" en={<>Back at {"{1}"}, take 2 instead → {"{1,2}"}, recorded.</>} zh={<>回到 {"{1}"},换选 2 → {"{1,2}"},收下。</>} />,
  <T
    key="d5"
    en={<>Back at the root, take the 1 at index 1 → {"{1}"} again. <b>This is the same answer as step 2.</b></>}
    zh={<>回到根,选下标 1 的 1 → 又得到 {"{1}"} —— <b>和第 2 步一模一样,重复了!</b></>}
  />,
  <T key="d6" en={<>Below it, take 2 → {"{1,2}"} — <b>the same answer again.</b></>} zh={<>它下面再选 2 → {"{1,2}"} —— <b>又撞车。</b></>} />,
  <T key="d7" en={<>Take the 2 at index 2 → {"{2}"}. This one is new.</>} zh={<>选下标 2 的 2 → {"{2}"},这个不重复。</>} />,
];

const DUP_FINAL = {
  states: {
    ...Object.fromEntries(DUP_ORDER.map((id) => [id, "sol"])),
    b: "dead", bb: "dead",
  } as Record<string, TreeNodeState>,
  msg: (
    <T
      en={
        <>
          8 results, of which 2 are <b>duplicates</b>: {"{1}"} and {"{1,2}"} each
          appear twice (greyed out here). The cause:{" "}
          <b>inside the same loop, the second 1 opened a branch identical to the one
          the first 1 had already opened</b>.
        </>
      }
      zh={
        <>
          8 个结果里混进了 2 个<b>重复解</b>({"{1}"} 和 {"{1,2}"} 各出现两次,灰色标出)。
          病根:<b>在同一个循环里,第二个 1 又开了一条和第一个 1 完全相同的分支</b>。
        </>
      }
    />
  ),
};

const DUP_FRAMES = walkFrames(
  DUP_NODES, DUP_ORDER, DUP_SOL, new Set(), DUP_MSGS, DUP_FINAL,
);

export function DupSubsetTree() {
  return (
    <TreePlayer
      title={{
        en: "Subsets II · no deduplication: {1} and {1,2} are each produced twice",
        zh: "子集 II · 不去重:{1} 和 {1,2} 各冒出两次",
      }}
      nodes={DUP_NODES}
      frames={DUP_FRAMES}
      nodeW={44}
      gapX={14}
    />
  );
}

// 树层去重:排序后,同一个循环里遇到 i > start && nums[i] == nums[i-1] 就跳过。
const DEDUP_ORDER = ["r", "a", "aa", "aab", "ab", "c"];
const DEDUP_SOL = new Set(DEDUP_ORDER);

const DEDUP_MSGS: ReactNode[] = [
  <T
    key="e0"
    en={
      <>
        Sort first (this array is already sorted). The rule in one line:{" "}
        <b>inside one loop, skip a value equal to the previous one</b> —{" "}
        <span className="mono">i &gt; start &amp;&amp; nums[i] == nums[i-1]</span>. The
        empty set is recorded. The two grey nodes are the branch that rule will skip.
      </>
    }
    zh={
      <>
        先排序(这里本就有序)。规则一句话:<b>同一个循环里,若当前值和前一个值相同,就跳过</b> ——
        <span className="mono"> i &gt; start &amp;&amp; nums[i] == nums[i-1]</span>。空集收下。
        灰色的那两个节点,就是这条规则会跳过的分支。
      </>
    }
  />,
  <T
    key="e1"
    en={
      <>
        At the root <span className="mono">start = 0</span> and{" "}
        <span className="mono">i = 0</span>, so <span className="mono">i &gt; start</span>{" "}
        is false: take the first 1 → {"{1}"} and expand it normally.
      </>
    }
    zh={
      <>
        根节点 <span className="mono">start = 0</span>、<span className="mono">i = 0</span>,
        <span className="mono">i &gt; start</span> 不成立:选第一个 1 → {"{1}"},正常展开。
      </>
    }
  />,
  <T
    key="e2"
    en={
      <>
        One level deeper the call received <span className="mono">start = 1</span>, so
        at <span className="mono">i = 1</span> the test{" "}
        <span className="mono">i &gt; start</span> is again false. The equal value is
        being appended <b>after</b> the first 1, along the path, which is allowed →{" "}
        {"{1,1}"}.
      </>
    }
    zh={
      <>
        往下走一层,这次调用收到的是 <span className="mono">start = 1</span>,
        所以 <span className="mono">i = 1</span> 时 <span className="mono">i &gt; start</span>{" "}
        仍不成立。这里的相同值是<b>接在</b>第一个 1 后面(沿路径方向),<b>允许</b>使用 → {"{1,1}"}。
      </>
    }
  />,
  <T key="e3" en={<>{"{1,1,2}"}, recorded.</>} zh={<>{"{1,1,2}"},收下。</>} />,
  <T key="e4" en={<>{"{1,2}"}, recorded.</>} zh={<>{"{1,2}"},收下。</>} />,
  <T
    key="e5"
    en={
      <>
        Back at the root loop, <span className="mono">i = 1</span> is the second 1:{" "}
        <span className="mono">i &gt; start</span> holds and{" "}
        <span className="mono">nums[1] == nums[0]</span>, so that whole branch is{" "}
        <b>skipped without being entered</b> (grey). Move on to{" "}
        <span className="mono">i = 2</span> → {"{2}"}.
      </>
    }
    zh={
      <>
        回到根这一层的循环,<span className="mono">i = 1</span> 就是第二个 1:
        <span className="mono">i &gt; start</span> 成立、
        <span className="mono">nums[1] == nums[0]</span>,整条分支
        <b>一步都不进,直接跳过</b>(灰色)。继续到 <span className="mono">i = 2</span> → {"{2}"}。
      </>
    }
  />,
];

const DEDUP_FINAL = {
  states: {
    ...Object.fromEntries(DEDUP_ORDER.map((id) => [id, "sol"])),
    b: "dead", bb: "dead",
  } as Record<string, TreeNodeState>,
  msg: (
    <T
      en={
        <>
          6 subsets, no duplicates and nothing missing. The skipped branch (grey) would
          only have rebuilt what index 0 already built at this node. And{" "}
          {"{1,1}"} still survived, because there the equal value arrived{" "}
          <b>at position start</b>, not after it. That is why the test is{" "}
          <span className="mono">i &gt; start</span> and not{" "}
          <span className="mono">i &gt; 0</span>.
        </>
      }
      zh={
        <>
          6 个子集,不重不漏。被跳过的那条分支(灰色)只会重建下标 0 在这个节点上已经建过的东西。
          而 {"{1,1}"} 保住了 —— 因为在那里,相同值落在<b>下标 start 的位置</b>,不是在它后面。
          这正是条件写 <span className="mono">i &gt; start</span> 而不是{" "}
          <span className="mono">i &gt; 0</span> 的原因。
        </>
      }
    />
  ),
};

const DEDUP_FRAMES = walkFrames(
  DUP_NODES, DEDUP_ORDER, DEDUP_SOL, new Set(["b", "bb"]), DEDUP_MSGS, DEDUP_FINAL,
);

export function DedupSubsetTree() {
  return (
    <TreePlayer
      title={{
        en: "Subsets II · skip at the same level: the duplicate branch is never entered (grey)",
        zh: "子集 II · 树层去重:重复的那条分支一步没走(灰色)",
      }}
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

function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

function buildPermFrames(nums: number[]): PermFrame[] {
  const frames: PermFrame[] = [];
  const used = nums.map(() => false);
  const path: number[] = [];
  const snap = () => ({ path: [...path], used: [...used] });

  const dfs = () => {
    if (path.length === nums.length) {
      const shown = path.join(", ");
      frames.push({ ...snap(), action: "complete", msg: (
        <T
          en={<>The path is full. Record a <b>copy</b> of it — <b>[{shown}]</b> — then start undoing. Storing the path itself would store a reference that the undo steps change.</>}
          zh={<>路径满了 → 收下这个排列的<b>一份拷贝</b> <b>[{shown}]</b>,然后开始回溯。直接存路径存的是引用,后面的撤销会把它改掉。</>}
        />
      ) });
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) {
        frames.push({ ...snap(), trying: i, action: "skip", msg: (
          <T
            en={<><span className="mono">used[{i}]</span> is true, so <b>{nums[i]}</b> is already on the path — <b>skip it</b>. A permutation may not use one position twice.</>}
            zh={<><span className="mono">used[{i}]</span> 是 true,<b>{nums[i]}</b> 已经在路径里 —— <b>跳过</b>,排列不能重复用同一个位置。</>}
          />
        ) });
        continue;
      }
      frames.push({ ...snap(), trying: i, action: "choose", msg: (
        <T
          en={<>Take <b>{nums[i]}</b>: append it to the path and set <span className="mono">used[{i}]</span> to true.</>}
          zh={<>选 <b>{nums[i]}</b>:加入路径,把 <span className="mono">used[{i}]</span> 标成 true。</>}
        />
      ) });
      used[i] = true;
      path.push(nums[i]);
      dfs();
      used[i] = false;
      path.pop();
      frames.push({ ...snap(), trying: i, action: "back", msg: (
        <T
          en={<><b>Undo {nums[i]}</b>: pop it from the path and set <span className="mono">used[{i}]</span> back to false. Both pieces of state are restored — that is the third step of choose, recurse, un-choose.</>}
          zh={<><b>撤销 {nums[i]}</b>:弹出路径,把 <span className="mono">used[{i}]</span> 改回 false。两处状态都还原 —— 这是「做选择 → 递归 → 撤销」的最后一步。</>}
        />
      ) });
    }
  };
  dfs();
  frames.push({ path: [], used: nums.map(() => false), action: "complete", msg: (
    <T
      en={<>Done: {nums.length}! = {factorial(nums.length)} permutations. <b>The used array is what makes permutations work</b> — it records which positions are already on the path, so no position is used twice.</>}
      zh={<>全部走完:{nums.length}! = {factorial(nums.length)} 个排列。<b>used 数组是排列的关键</b> —— 它记住哪些位置已经在路径里,防止一个位置被用两次。</>}
    />
  ) });
  return frames;
}

const PERM_NUMS = [1, 2, 3];
const PERM_FRAMES = buildPermFrames(PERM_NUMS);

export function PermuteLab() {
  const L = useL();
  const s = useStepper(PERM_FRAMES.length, 1200);
  const f = PERM_FRAMES[s.step];
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en={<>LC 46 Permutations of [1,2,3] · the used array, step by step (green = on the path · yellow = just picked · red = already used)</>}
          zh={<>LC 46 全排列 [1,2,3] · used 数组现场(绿=已用 · 黄=刚选 · 红=撞用过)</>}
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 20 }}>
        <div className="bt-perm-row">
          <span className="bt-perm-lab">{L({ en: "path", zh: "路径 path" })}</span>
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
          <span className="bt-perm-lab">{L({ en: "nums / used", zh: "候选 / used" })}</span>
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
      <T
        en={
          <>
            An {n}×{n} board. No two queens may share a{" "}
            <b>row, a column, or a diagonal</b>. Queens go down{" "}
            <b>one row at a time</b>, and each row picks a square that no queen above
            it attacks.
          </>
        }
        zh={
          <>
            {n}×{n} 棋盘。规则:任意两个皇后不能<b>同行、同列、同一条斜线</b>。
            我们<b>逐行</b>放,每行挑一个不被上方皇后攻击的格子。
          </>
        }
      />
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
          <T
            en={
              <>
                All {n} rows are filled — <b>a solution</b>. The {n} queens do not
                attack each other; their columns, row by row, are [{cols.join(", ")}].
              </>
            }
            zh={
              <>
                {n} 行全部放满 —— <b>找到一个解!</b>这 {n} 个皇后互不攻击,
                自上而下的列坐标是 [{cols.join(", ")}]。
              </>
            }
          />
        ),
      });
      return;
    }
    for (let c = 0; c < n && !done; c++) {
      const atk = attackers(r, c);
      if (atk.length > 0) {
        const more = c + 1 < n;
        // 旁白要和棋盘上被圈出的皇后一一对应 —— 有几个攻击者就报几个。
        const listEn = atk.map(([ar, ac], k) => (
          <span key={k}>
            {k > 0 ? ", " : ""}row {ar} column {ac} (
            {ac === c ? "same column" : "same diagonal"})
          </span>
        ));
        const listZh = atk.map(([ar, ac], k) => (
          <span key={k}>
            {k > 0 ? "、" : ""}第 {ar} 行第 {ac} 列({ac === c ? "同列" : "同斜线"})
          </span>
        ));
        frames.push({
          placed: cols.slice(0, r),
          placedCount: r,
          trying: [r, c],
          bad: true,
          attackers: atk,
          msg: (
            <T
              en={
                <>
                  Row {r}, column <b>{c}</b> is attacked by the{" "}
                  {atk.length > 1 ? "queens at " : "queen at "}
                  {listEn}. <b>Not allowed</b> —{" "}
                  {more
                    ? "try the next column."
                    : `row ${r} has no column left to try.`}
                </>
              }
              zh={
                <>
                  第 {r} 行第 <b>{c}</b> 列会被{listZh}的皇后攻击,<b>不行</b>,
                  {more ? "换下一列。" : `第 ${r} 行也没有下一列可试了。`}
                </>
              }
            />
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
          <T
            en={
              <>
                Row {r}, column <b>{c}</b> is attacked by nobody — <b>place a queen ♛</b>{" "}
                and move on to row {r + 1}.
              </>
            }
            zh={
              <>
                第 {r} 行第 <b>{c}</b> 列没人攻击 —— <b>放下 ♛</b>,进入第 {r + 1} 行。
              </>
            }
          />
        ),
      });
      dfs(r + 1);
      if (done) return;
      cols.length = r;
      const hasMore = c + 1 < n;
      frames.push({
        placed: cols.slice(0, r),
        placedCount: r,
        trying: [r, c],
        msg: (
          <T
            en={
              <>
                <b>Undo</b>: putting the queen of row {r} in column {c} led nowhere.
                Remove it{" "}
                {hasMore
                  ? "and try a column further right."
                  : `— and row ${r} has no column left to try.`}
              </>
            }
            zh={
              <>
                <b>回退</b>:第 {r} 行放在第 {c} 列这条路走不通,把这颗 ♛ 挪走
                {hasMore ? ",试更靠右的列。" : ` —— 第 ${r} 行也没有更靠右的列可试了。`}
              </>
            }
          />
        ),
      });
    }
    if (!done && r > 0) {
      frames.push({
        placed: cols.slice(0, r),
        placedCount: r,
        msg: (
          <T
            en={
              <>
                Every column in row {r} fails — a <b>dead end</b>. Step back to row{" "}
                {r - 1} and move the queen there.
              </>
            }
            zh={
              <>
                第 {r} 行的每一种放法都走不通 —— <b>死胡同</b>,退回第 {r - 1} 行,把那里的皇后挪走。
              </>
            }
          />
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
        <T
          en={<>LC 51 N-Queens · placing row by row on a 4×4 board (♛ = queen · red = conflict · outlined = the queen doing the attacking)</>}
          zh={<>LC 51 N 皇后 · 4×4 逐行放置(♛=皇后 · 红=冲突 · 环=正在攻击的皇后)</>}
        />
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
