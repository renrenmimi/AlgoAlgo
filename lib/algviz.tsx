"use client";

// 算法专属可视化基建 —— 数据结构画「形状」,算法画「决策与状态的演进」。
// 三件套(全站复用,样式在 globals.css 的「10.5 算法可视化」段):
//
//  - DPTable:DP 表格填充器。一维/二维表逐格填充,每帧高亮「当前格」(cur)
//    与「它从哪些子问题转移来」(src)。帧 = 整表快照,和 ArrayStepper 同哲学。
//  - TreePlayer:递归/回溯决策树播放器。节点静态注册(id/label/parent),
//    帧只改各节点状态:cur(正在访问)/ path(当前递归路径)/ done(访问完)/
//    dead(死路,剪枝回退变灰)/ sol(找到解)/ memo(命中记忆化缓存)。
//  - RangeShrink:候选区间收缩器。把「答案的候选范围」画成一排数字,
//    二分答案 / 贪心排除的每一步,都表现为区间收窄 + 试探点判定。
//
// 播放控制统一复用 lib/stepper 的 useStepper + StepControls。

import { useMemo, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================================================================
   DPTable —— DP 表格填充器
   ================================================================ */

export type DPCellState = "cur" | "src" | "done" | "ghost" | "ok" | "bad";

export interface DPCell {
  v: ReactNode;
  state?: DPCellState;
}

export interface DPFrame {
  /** 整表快照:rows × cols。一维表就传一行。 */
  cells: DPCell[][];
  msg: ReactNode;
}

export function DPTable({
  title,
  frames,
  colLabels,
  rowLabels,
  cornerLabel,
  cellW = 52,
}: {
  title: string;
  frames: DPFrame[];
  /** 顶部表头(列),如物品容量 0..W 或字符串的每个字符 */
  colLabels?: ReactNode[];
  /** 左侧表头(行),如物品名或另一个字符串的字符 */
  rowLabels?: ReactNode[];
  /** 左上角标注,如 "dp" */
  cornerLabel?: ReactNode;
  cellW?: number;
}) {
  const stepper = useStepper(frames.length);
  const f = frames[stepper.step];
  const cols = Math.max(...frames.map((fr) => Math.max(...fr.cells.map((r) => r.length))));
  const hasRowLab = !!rowLabels?.length;

  return (
    <div className="viz">
      <div className="viz-title">{title}</div>
      <div className="viz-stage" style={{ overflowX: "auto" }}>
        <div
          className="dpt"
          style={{
            gridTemplateColumns: `${hasRowLab ? "auto " : ""}repeat(${cols}, ${cellW}px)`,
          }}
        >
          {colLabels && (
            <>
              {hasRowLab && <div className="dpt-corner">{cornerLabel}</div>}
              {Array.from({ length: cols }).map((_, j) => (
                <div key={`c${j}`} className="dpt-lab">
                  {colLabels[j] ?? ""}
                </div>
              ))}
            </>
          )}
          {f.cells.map((row, i) => (
            <FragmentRow
              key={i}
              row={row}
              cols={cols}
              lab={hasRowLab ? rowLabels![i] ?? "" : undefined}
              cellW={cellW}
            />
          ))}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </div>
  );
}

function FragmentRow({
  row,
  cols,
  lab,
  cellW,
}: {
  row: DPCell[];
  cols: number;
  lab?: ReactNode;
  cellW: number;
}) {
  return (
    <>
      {lab !== undefined && <div className="dpt-lab dpt-rowlab">{lab}</div>}
      {Array.from({ length: cols }).map((_, j) => {
        const c = row[j];
        if (!c)
          return <div key={j} className="dpt-cell" data-state="ghost" style={{ width: cellW, height: cellW - 10 }} />;
        return (
          <div
            key={j}
            className="dpt-cell"
            data-state={c.state ?? "done"}
            style={{ width: cellW, height: cellW - 10 }}
          >
            {c.v ?? "·"}
          </div>
        );
      })}
    </>
  );
}

/* ================================================================
   TreePlayer —— 递归 / 回溯决策树播放器
   ================================================================ */

export interface TreeNodeSpec {
  id: string;
  label: ReactNode;
  /** 不填 = 根节点 */
  parent?: string;
  /** 节点宽度覆盖(标签较长时用) */
  w?: number;
}

export type TreeNodeState = "cur" | "path" | "done" | "dead" | "sol" | "memo";

export interface TreeFrame {
  /** 只列出「非默认态」的节点;未列出的节点为幽灵态(尚未访问) */
  states: Record<string, TreeNodeState>;
  msg: ReactNode;
}

const NODE_H = 32;

export function TreePlayer({
  title,
  nodes,
  frames,
  nodeW = 46,
  gapX = 14,
  gapY = 34,
  legend = true,
}: {
  title: string;
  nodes: TreeNodeSpec[];
  frames: TreeFrame[];
  nodeW?: number;
  gapX?: number;
  gapY?: number;
  /** 是否显示状态图例 */
  legend?: boolean;
}) {
  const stepper = useStepper(frames.length, 1400);
  const f = frames[stepper.step];

  // 按标签长度自动估宽:纯字符串标签超出默认宽度时加宽,消除长标签溢出节点框
  const widthOf = (n: TreeNodeSpec): number => {
    if (n.w) return n.w;
    if (typeof n.label === "string" || typeof n.label === "number") {
      const s = String(n.label);
      // 中文按 ~13px/字、其余按 ~8px/字 粗估,两侧各留 11px 内衬
      let units = 0;
      for (const ch of s) units += /[一-鿿＀-￯]/.test(ch) ? 1.55 : 1;
      return Math.max(nodeW, Math.ceil(units * 8.2 + 22));
    }
    return nodeW;
  };

  const layout = useMemo(() => {
    const children = new Map<string, TreeNodeSpec[]>();
    const byId = new Map<string, TreeNodeSpec>();
    const roots: TreeNodeSpec[] = [];
    for (const n of nodes) {
      byId.set(n.id, n);
      if (n.parent) {
        if (!children.has(n.parent)) children.set(n.parent, []);
        children.get(n.parent)!.push(n);
      } else {
        roots.push(n);
      }
    }
    const pos = new Map<string, { x: number; y: number }>();
    let leafX = 0;
    const maxW = Math.max(nodeW, ...nodes.map(widthOf));
    const slotW = maxW + gapX;
    const place = (n: TreeNodeSpec, depth: number): number => {
      const kids = children.get(n.id) ?? [];
      let x: number;
      if (kids.length === 0) {
        x = leafX * slotW + slotW / 2;
        leafX++;
      } else {
        const xs = kids.map((k) => place(k, depth + 1));
        x = (xs[0] + xs[xs.length - 1]) / 2;
      }
      pos.set(n.id, { x, y: depth * (NODE_H + gapY) + NODE_H / 2 + 4 });
      return x;
    };
    roots.forEach((r) => place(r, 0));
    const width = Math.max(leafX * slotW, slotW);
    const maxY = Math.max(...[...pos.values()].map((p) => p.y));
    return { pos, byId, width, height: maxY + NODE_H / 2 + 8 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, nodeW, gapX, gapY]);

  return (
    <div className="viz">
      <div className="viz-title">{title}</div>
      {legend && (
        <div className="viz-legend" aria-hidden>
          <span className="viz-key"><i className="tp-sw" data-state="cur" />当前</span>
          <span className="viz-key"><i className="tp-sw" data-state="path" />当前路径</span>
          <span className="viz-key"><i className="tp-sw" data-state="dead" />死路/剪枝</span>
          <span className="viz-key"><i className="tp-sw" data-state="sol" />解</span>
          <span className="viz-key"><i className="tp-sw" data-state="memo" />查表命中</span>
        </div>
      )}
      <div className="viz-stage" style={{ overflowX: "auto" }}>
        <svg
          className="tp-svg"
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          style={{ width: "100%", maxWidth: layout.width, minWidth: Math.min(layout.width, 560) }}
          role="img"
          aria-label={title}
        >
          {/* 边:父底 → 子顶,状态跟随子节点 */}
          {nodes.map((n) => {
            if (!n.parent) return null;
            const p = layout.pos.get(n.parent)!;
            const c = layout.pos.get(n.id)!;
            const st = f.states[n.id];
            return (
              <line
                key={`e-${n.id}`}
                className="tp-edge"
                data-state={st ?? "idle"}
                x1={p.x}
                y1={p.y + NODE_H / 2}
                x2={c.x}
                y2={c.y - NODE_H / 2}
              />
            );
          })}
          {/* 节点 */}
          {nodes.map((n) => {
            const c = layout.pos.get(n.id)!;
            const st = f.states[n.id];
            const w = widthOf(n);
            return (
              <g key={n.id} className="tp-node" data-state={st ?? "idle"}>
                <rect
                  x={c.x - w / 2}
                  y={c.y - NODE_H / 2}
                  width={w}
                  height={NODE_H}
                  rx={9}
                />
                <text x={c.x} y={c.y + 4.5} textAnchor="middle">
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </div>
  );
}

/* ================================================================
   RangeShrink —— 候选区间收缩器(二分答案 / 贪心排除)
   ================================================================ */

export interface RangeFrame {
  /** 仍然存活的候选区间(闭区间,按值而非下标) */
  lo: number;
  hi: number;
  /** 本轮试探的候选值(如二分的 mid) */
  probe?: number;
  /** 试探判定:ok = 可行(答案 ≤ probe 一侧),no = 不可行 */
  verdict?: "ok" | "no";
  /** 已锁定的最终答案 */
  answer?: number;
  msg: ReactNode;
}

export function RangeShrink({
  title,
  min,
  max,
  frames,
  unit,
  cellW = 44,
}: {
  title: string;
  /** 候选值域(含端点),建议宽度 ≤ 20 保证可读 */
  min: number;
  max: number;
  frames: RangeFrame[];
  /** 数值的单位标注,如「根/小时」 */
  unit?: string;
  cellW?: number;
}) {
  const stepper = useStepper(frames.length);
  const f = frames[stepper.step];
  const n = max - min + 1;
  const values = Array.from({ length: n }, (_, i) => min + i);

  return (
    <div className="viz">
      <div className="viz-title">
        {title}
        {unit && <span className="dim" style={{ fontWeight: 400 }}>(单位:{unit})</span>}
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 4, overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${n}, ${cellW}px)`,
            gap: 4,
            minHeight: 26,
          }}
        >
          {values.map((v) => (
            <div key={v} style={{ display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
              {f.probe === v && (
                <span className="ptr">{f.verdict === "ok" ? "✓试" : f.verdict === "no" ? "✗试" : "试"}</span>
              )}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${n}, ${cellW}px)`,
            gap: 4,
            paddingBottom: 8,
          }}
        >
          {values.map((v) => {
            const alive = v >= f.lo && v <= f.hi;
            let cls = "rs-cell";
            if (f.answer === v) cls += " ans";
            else if (f.probe === v) cls += f.verdict === "no" ? " bad" : f.verdict === "ok" ? " good" : " lit";
            else if (!alive) cls += " dead";
            return (
              <div key={v} className={cls} style={{ width: cellW, height: cellW - 6 }}>
                {v}
              </div>
            );
          })}
        </div>
        <div className="rs-bar" style={{ width: n * (cellW + 4) - 4 }}>
          <div
            className="rs-bar-live"
            style={{
              left: `${((f.lo - min) / n) * 100}%`,
              width: `${((f.hi - f.lo + 1) / n) * 100}%`,
            }}
          />
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </div>
  );
}
