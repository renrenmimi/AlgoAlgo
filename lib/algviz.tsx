"use client";

// Visualization infrastructure specific to algorithms. Data structures draw shapes;
// algorithms draw how decisions and state evolve.
// Three components, reused site-wide (styles live in the "10.5 algorithm visualization"
// section of globals.css):
//
//  - DPTable: a DP table filler. Fills a one- or two-dimensional table cell by cell; each
//    frame highlights the current cell (cur) and the subproblems it transitions from (src).
//    A frame is a snapshot of the whole table -- the same philosophy as ArrayStepper.
//  - TreePlayer: a player for recursion / backtracking decision trees. Nodes are registered
//    statically (id/label/parent) and a frame only changes node states: cur (being visited) /
//    path (on the current recursion path) / done (finished) / dead (a dead end, grayed out on
//    a pruned backtrack) / sol (a solution was found) / memo (a memoization cache hit).
//  - RangeShrink: a candidate-interval shrinker. It draws the range of candidate answers as a
//    row of numbers, so every step of binary search on the answer -- or of greedy elimination
//    -- shows up as the interval narrowing plus a verdict on the probe.
//
// Playback control is shared: useStepper + StepControls from lib/stepper.

import { useMemo, type ReactNode } from "react";
import { useStepper, StepControls, useEdgeFade } from "@/lib/stepper";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================================================================
   DPTable -- the DP table filler
   ================================================================ */

export type DPCellState = "cur" | "src" | "done" | "ghost" | "ok" | "bad";

export interface DPCell {
  v: ReactNode;
  state?: DPCellState;
}

export interface DPFrame {
  /** A snapshot of the whole table: rows x cols. For a one-dimensional table, pass one row. */
  cells: DPCell[][];
  /** Narration for this frame -- write JSX and use <T en zh /> inside it, or pass { en, zh } */
  msg: Loc<ReactNode>;
}

export function DPTable({
  title,
  frames,
  colLabels,
  rowLabels,
  cornerLabel,
  cellW = 52,
}: {
  title: Loc<ReactNode>;
  frames: DPFrame[];
  /** Header row (columns), e.g. capacities 0..W or each character of a string */
  colLabels?: Loc<ReactNode[]>;
  /** Header column (rows), e.g. item names or the characters of the other string */
  rowLabels?: Loc<ReactNode[]>;
  /** The label in the top-left corner, e.g. "dp" */
  cornerLabel?: Loc<ReactNode>;
  cellW?: number;
}) {
  const L = useL();
  const stepper = useStepper(frames.length);
  const f = frames[stepper.step];
  const cols = Math.max(...frames.map((fr) => Math.max(...fr.cells.map((r) => r.length))));
  const cLabs = colLabels === undefined ? undefined : L(colLabels);
  const rLabs = rowLabels === undefined ? undefined : L(rowLabels);
  const hasRowLab = !!rLabs?.length;
  const edge = useEdgeFade<HTMLDivElement>();

  return (
    <div className="viz">
      <div className="viz-title">{L(title)}</div>
      <div ref={edge.ref} data-fade={edge.fade} className="viz-stage" style={{ overflowX: "auto" }}>
        <div
          className="dpt"
          style={{
            gridTemplateColumns: `${hasRowLab ? "auto " : ""}repeat(${cols}, ${cellW}px)`,
          }}
        >
          {cLabs && (
            <>
              {hasRowLab && (
                <div className="dpt-corner">
                  {cornerLabel === undefined ? null : L(cornerLabel)}
                </div>
              )}
              {Array.from({ length: cols }).map((_, j) => (
                <div key={`c${j}`} className="dpt-lab">
                  {cLabs[j] ?? ""}
                </div>
              ))}
            </>
          )}
          {f.cells.map((row, i) => (
            <FragmentRow
              key={i}
              row={row}
              cols={cols}
              lab={hasRowLab ? rLabs![i] ?? "" : undefined}
              cellW={cellW}
            />
          ))}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {L(f.msg)}
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
   TreePlayer -- the recursion / backtracking decision-tree player
   ================================================================ */

export interface TreeNodeSpec {
  id: string;
  /** Node label. Text labels do not wrap inside SVG, and English runs longer than Chinese,
   *  so widen the node with w when necessary. */
  label: Loc<ReactNode>;
  /** Omit for the root node */
  parent?: string;
  /** Overrides the node width (use it for longer labels) */
  w?: number;
}

export type TreeNodeState = "cur" | "path" | "done" | "dead" | "sol" | "memo";

/** A node after language resolution (internal): label is already the ReactNode for the
 *  current language. */
type ResolvedNode = Omit<TreeNodeSpec, "label"> & { label: ReactNode };

export interface TreeFrame {
  /** Only list nodes in a non-default state; any node not listed is a ghost (not yet visited) */
  states: Record<string, TreeNodeState>;
  /** Narration for this frame -- write JSX and use <T en zh /> inside it, or pass { en, zh } */
  msg: Loc<ReactNode>;
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
  title: Loc<ReactNode>;
  nodes: TreeNodeSpec[];
  frames: TreeFrame[];
  nodeW?: number;
  gapX?: number;
  gapY?: number;
  /** Whether to show the state legend */
  legend?: boolean;
}) {
  const L = useL();
  const stepper = useStepper(frames.length, 1400);
  const f = frames[stepper.step];
  const edge = useEdgeFade<HTMLDivElement>();
  const rtitle = L(title);

  // Resolve the labels to the current language before laying out -- Chinese and English
  // labels have different widths, so switching language must re-run the layout.
  const rnodes = useMemo<ResolvedNode[]>(
    () => nodes.map((n) => ({ ...n, label: L(n.label) })),
    [nodes, L],
  );

  // Estimate the width from the label length: widen plain-string labels that exceed the
  // default width, so long labels no longer overflow the node box.
  const widthOf = (n: ResolvedNode): number => {
    if (n.w) return n.w;
    if (typeof n.label === "string" || typeof n.label === "number") {
      const s = String(n.label);
      // Rough estimate: ~13px per Chinese character, ~8px otherwise, plus 11px of padding
      // on each side.
      let units = 0;
      for (const ch of s) units += /[一-鿿＀-￯]/.test(ch) ? 1.55 : 1;
      return Math.max(nodeW, Math.ceil(units * 8.2 + 22));
    }
    return nodeW;
  };

  const layout = useMemo(() => {
    const children = new Map<string, ResolvedNode[]>();
    const byId = new Map<string, ResolvedNode>();
    const roots: ResolvedNode[] = [];
    for (const n of rnodes) {
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
    const maxW = Math.max(nodeW, ...rnodes.map(widthOf));
    const slotW = maxW + gapX;
    const place = (n: ResolvedNode, depth: number): number => {
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
  }, [rnodes, nodeW, gapX, gapY]);

  return (
    <div className="viz">
      <div className="viz-title">{rtitle}</div>
      {legend && (
        <div className="viz-legend" aria-hidden>
          <span className="viz-key">
            <i className="tp-sw" data-state="cur" />
            <T en="Current node" zh="当前" />
          </span>
          <span className="viz-key">
            <i className="tp-sw" data-state="path" />
            <T en="Current path" zh="当前路径" />
          </span>
          <span className="viz-key">
            <i className="tp-sw" data-state="dead" />
            <T en="Dead end / pruned" zh="死路 / 剪枝" />
          </span>
          <span className="viz-key">
            <i className="tp-sw" data-state="sol" />
            <T en="Solution" zh="解" />
          </span>
          <span className="viz-key">
            <i className="tp-sw" data-state="memo" />
            <T en="Cache hit" zh="查表命中" />
          </span>
        </div>
      )}
      <div ref={edge.ref} data-fade={edge.fade} className="viz-stage" style={{ overflowX: "auto" }}>
        <svg
          className="tp-svg"
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          style={{ width: "100%", maxWidth: layout.width, minWidth: Math.min(layout.width, 560) }}
          role="img"
          aria-label={typeof rtitle === "string" ? rtitle : undefined}
        >
          {/* Edges: parent bottom -> child top; the edge state follows the child node */}
          {rnodes.map((n) => {
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
          {/* Nodes */}
          {rnodes.map((n) => {
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
        {L(f.msg)}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </div>
  );
}

/* ================================================================
   RangeShrink -- the candidate-interval shrinker
   (binary search on the answer / greedy elimination)
   ================================================================ */

export interface RangeFrame {
  /** The candidate interval that is still alive (the closed interval [lo, hi], by value
   *  rather than by index) */
  lo: number;
  hi: number;
  /** The candidate value probed this round (e.g. binary search's mid) */
  probe?: number;
  /** The verdict on the probe: ok = feasible, no = infeasible */
  verdict?: "ok" | "no";
  /** The final answer, once it is locked in */
  answer?: number;
  /** Narration for this frame -- write JSX and use <T en zh /> inside it, or pass { en, zh } */
  msg: Loc<ReactNode>;
}

export function RangeShrink({
  title,
  min,
  max,
  frames,
  unit,
  cellW = 44,
}: {
  title: Loc<ReactNode>;
  /** The candidate value range (inclusive of both endpoints); keep the width at 20 or fewer
   *  to stay readable */
  min: number;
  max: number;
  frames: RangeFrame[];
  /** The unit label for the values, e.g. "bananas per hour" */
  unit?: Loc<string>;
  cellW?: number;
}) {
  const L = useL();
  const stepper = useStepper(frames.length);
  const f = frames[stepper.step];
  const n = max - min + 1;
  const values = Array.from({ length: n }, (_, i) => min + i);
  const edge = useEdgeFade<HTMLDivElement>();

  return (
    <div className="viz">
      <div className="viz-title">
        {L(title)}
        {unit && (
          <span className="dim" style={{ fontWeight: 400 }}>
            <T en={<>&nbsp;(unit: {L(unit)})</>} zh={<>(单位:{L(unit)})</>} />
          </span>
        )}
      </div>
      <div ref={edge.ref} data-fade={edge.fade} className="viz-stage" style={{ flexDirection: "column", gap: 4, overflowX: "auto" }}>
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
                <span className="ptr">
                  {f.verdict === "ok"
                    ? L({ en: "✓ try", zh: "✓试" })
                    : f.verdict === "no"
                      ? L({ en: "✗ try", zh: "✗试" })
                      : L({ en: "try", zh: "试" })}
                </span>
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
        {L(f.msg)}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </div>
  );
}
