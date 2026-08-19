"use client";

// LeetCode 题单组件。
// 每道题:勾选框(写入全站进度)+ 题号 + 标题 + 难度徽章 + 标签;
// 展开后是「提示」(先自己想)和「关键思路」(一段话讲透做法)。
// pid = `${章节 id}/${题号}`,终章总表也用同一套 id,进度全站互通。

import { useState, type ReactNode } from "react";
import { useProgress } from "@/lib/progress";
import type { ChapterId } from "@/lib/curriculum";
import { useL, type Loc } from "@/lib/i18n";

export interface Problem {
  lc: number;
  /** 题名。英文界面用 LeetCode 官方英文题名,中文界面用官方中文题名。 */
  title: Loc<string>;
  d: "easy" | "medium" | "hard";
  tags: Loc<string[]>;
  /** 一句话提示 —— 不剧透完整解法 */
  hint: Loc<ReactNode>;
  /** 关键思路 —— 一段话讲透 */
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

  return (
    <div className="plist">
      {items.map((p) => {
        const pid = `${ch}/${p.lc}`;
        const done = ready && isDone(pid);
        const expanded = open === p.lc;
        return (
          <div
            key={p.lc}
            className={`prob${done ? " done" : ""}${expanded ? " open" : ""}`}
          >
            <div
              className="prob-head"
              onClick={() => setOpen(expanded ? null : p.lc)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen(expanded ? null : p.lc);
                }
              }}
              aria-expanded={expanded}
            >
              <button
                type="button"
                className="prob-check"
                aria-label={L(
                  done
                    ? { en: "Mark as not done", zh: "标记为未完成" }
                    : { en: "Mark as done", zh: "标记为已完成" },
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleProblem(pid);
                }}
              >
                ✓
              </button>
              <span className="prob-id">LC {p.lc}</span>
              <span className="prob-title">{L(p.title)}</span>
              <span className="prob-tags">
                {L(p.tags).map((t) => (
                  <span key={t} className="prob-tag">
                    {t}
                  </span>
                ))}
              </span>
              <span className="lc-badge" data-d={p.d}>
                {D_LABEL[p.d]}
              </span>
              <span className="prob-caret" aria-hidden>
                ▼
              </span>
            </div>
            {expanded && (
              <div className="prob-body">
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
