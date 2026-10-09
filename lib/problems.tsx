"use client";

// LeetCode problem-set component.
// Each problem shows: a checkbox (writes to the site-wide progress) + problem number +
// title + difficulty badge + tags; expanding it reveals the "hint" (think about it yourself
// first) and the "key idea" (one paragraph that fully explains the approach).
// pid = `${chapter id}/${problem number}`. The finale's master table uses the same ids,
// so progress is shared across the whole site.
//
// The row holds two sibling controls: the completion checkbox and the button that expands
// the problem. They must not be nested: a checkbox inside a clickable row has its Enter and
// Space presses taken over by the row, so keyboard users could never record a problem.

import { useId, useState, type ReactNode } from "react";
import { useProgress } from "@/lib/progress";
import type { ChapterId } from "@/lib/curriculum";
import { useL, type Loc } from "@/lib/i18n";

export interface Problem {
  lc: number;
  /** Problem title. The English UI uses LeetCode's official English title, the Chinese UI
   *  its official Chinese title. */
  title: Loc<string>;
  d: "easy" | "medium" | "hard";
  tags: Loc<string[]>;
  /** A one-sentence hint -- points at a direction without giving away the full solution */
  hint: Loc<ReactNode>;
  /** The key idea -- one paragraph that explains the approach completely */
  key: Loc<ReactNode>;
}

const D_LABEL = { easy: "EASY", medium: "MEDIUM", hard: "HARD" } as const;

export function ProblemSet({
  ch,
  items,
}: {
  ch: ChapterId;
  items: Problem[];
}) {
  const { isDone, toggleProblem, ready } = useProgress();
  const [open, setOpen] = useState<number | null>(null);
  const L = useL();
  const listId = useId();

  return (
    <div className="plist">
      {items.map((p) => {
        const pid = `${ch}/${p.lc}`;
        const done = ready && isDone(pid);
        const expanded = open === p.lc;
        const bodyId = `${listId}-${p.lc}`;
        return (
          <div
            key={p.lc}
            className={`prob${done ? " done" : ""}${expanded ? " open" : ""}`}
          >
            <div className="prob-head">
              <button
                type="button"
                role="checkbox"
                className="prob-check"
                aria-checked={done}
                aria-label={L({
                  en: `Mark LC ${p.lc} as done`,
                  zh: `将 LC ${p.lc} 标记为已完成`,
                })}
                onClick={() => toggleProblem(pid)}
              >
                ✓
              </button>
              {/* Named by number, title and difficulty; the tags would only lengthen what a
                  screen reader says */}
              <button
                type="button"
                className="prob-toggle"
                aria-expanded={expanded}
                aria-controls={expanded ? bodyId : undefined}
                aria-labelledby={`${bodyId}-n ${bodyId}-t ${bodyId}-d`}
                onClick={() => setOpen(expanded ? null : p.lc)}
              >
                <span className="prob-id" id={`${bodyId}-n`}>
                  LC {p.lc}
                </span>
                <span className="prob-title" id={`${bodyId}-t`}>
                  {L(p.title)}
                </span>
                <span className="prob-tags">
                  {L(p.tags).map((t) => (
                    <span key={t} className="prob-tag">
                      {t}
                    </span>
                  ))}
                </span>
                <span className="lc-badge" data-d={p.d} id={`${bodyId}-d`}>
                  {D_LABEL[p.d]}
                </span>
                <span className="prob-caret" aria-hidden>
                  ▼
                </span>
              </button>
            </div>
            {expanded && (
              <div id={bodyId} className="prob-body">
                <div className="prob-hint-label">
                  {L({
                    en: "Hint · think for 30 seconds first",
                    zh: "提示 · 先自己想 30 秒",
                  })}
                </div>
                <p>{L(p.hint)}</p>
                <div className="prob-hint-label">
                  {L({ en: "Key idea", zh: "关键思路" })}
                </div>
                <p>{L(p.key)}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
