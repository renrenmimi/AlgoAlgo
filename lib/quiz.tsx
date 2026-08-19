"use client";

// Quiz 引擎 —— 三种题型:
//  - choice:单选,点击即判,答错给「针对性纠错」(每个错误选项一条,禁止通用文案),
//    同时点亮正确项;计分按第一次点击。
//  - multi:多选,勾选后「检查」;漏选/错选分别提示。
//  - fill:填空,回车或按钮判定;可反复尝试,答对为止(计分按最终是否答对)。
// 全部答完 → 结算面板,成绩写入进度系统(取历史最好成绩,决定章节「通关」状态)。

import { useMemo, useState, type ReactNode } from "react";
import { useProgress } from "@/lib/progress";
import type { ChapterId } from "@/lib/curriculum";
import { T, useL, type Loc } from "@/lib/i18n";

export type QuizItem =
  | {
      type: "choice";
      q: Loc<ReactNode>;
      opts: Loc<ReactNode[]>;
      correct: number;
      /** 每个选项的针对性纠错(正确项可留 undefined) */
      wrong?: Loc<(ReactNode | undefined)[]>;
      why: Loc<ReactNode>;
    }
  | {
      type: "multi";
      q: Loc<ReactNode>;
      opts: Loc<ReactNode[]>;
      correct: number[];
      missHint: Loc<ReactNode>;
      extraHint: Loc<ReactNode>;
      why: Loc<ReactNode>;
    }
  | {
      type: "fill";
      q: Loc<ReactNode>;
      placeholder?: Loc<string>;
      /** 允许的答案(不区分大小写、去空格后比较)。
       *  纯技术词就把中英两种写法都放进同一个数组;只有当答案本身按语言不同时才用 { en, zh }。 */
      answers: Loc<string[]>;
      hint: Loc<ReactNode>;
      why: Loc<ReactNode>;
    };

type ItemState =
  | { phase: "idle" }
  | { phase: "right"; first: boolean }
  | { phase: "wrong"; picked: number | null; tries: number };

const KEYS = "ABCDEFGH";

function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

export function Quiz({ ch, items }: { ch: ChapterId; items: QuizItem[] }) {
  const { reportQuiz } = useProgress();
  const L = useL();
  const [states, setStates] = useState<ItemState[]>(() =>
    items.map(() => ({ phase: "idle" })),
  );
  const [multiPicks, setMultiPicks] = useState<Record<number, number[]>>({});
  const [fillText, setFillText] = useState<Record<number, string>>({});
  const [reported, setReported] = useState(false);

  const answered = states.filter((s) => s.phase !== "idle").length;
  const firstRight = states.filter(
    (s) => s.phase === "right" && s.first,
  ).length;
  const allDone = answered === items.length;

  const finish = useMemo(
    () => (nextStates: ItemState[]) => {
      const done = nextStates.every((s) => s.phase !== "idle");
      if (done && !reported) {
        const right = nextStates.filter(
          (s) => s.phase === "right" && s.first,
        ).length;
        reportQuiz(ch, right, items.length);
        setReported(true);
      }
    },
    [ch, items.length, reported, reportQuiz],
  );

  const setState = (i: number, st: ItemState) => {
    // 先在渲染外算好新数组,再分别提交状态与结算。
    // (旧写法把 finish 塞进 setStates 的 updater 里 —— updater 必须是纯函数,
    //  在里面调用 reportQuiz 会在 Quiz 渲染期间更新 ProgressProvider,
    //  React 会告警,且 StrictMode 下 updater 被调两次会重复上报。)
    const next = [...states];
    next[i] = st;
    setStates(next);
    finish(next);
  };

  const reset = () => {
    setStates(items.map(() => ({ phase: "idle" })));
    setMultiPicks({});
    setFillText({});
    setReported(false);
  };

  return (
    <div className="quiz">
      {items.map((item, i) => {
        const st = states[i];
        const dataState =
          st.phase === "right" ? "right" : st.phase === "wrong" ? "wrong" : "";
        return (
          <div className="q-item" key={i} data-state={dataState}>
            <div className="q-num">
              QUESTION {String(i + 1).padStart(2, "0")} / {items.length}
            </div>
            <p className="q-text">{L(item.q)}</p>

            {item.type === "choice" && (
              <ChoiceBody
                item={item}
                st={st}
                onPick={(k) => {
                  if (st.phase !== "idle") return;
                  if (k === item.correct)
                    setState(i, { phase: "right", first: true });
                  else setState(i, { phase: "wrong", picked: k, tries: 1 });
                }}
              />
            )}

            {item.type === "multi" && (
              <MultiBody
                item={item}
                st={st}
                picks={multiPicks[i] ?? []}
                onToggle={(k) => {
                  if (st.phase !== "idle") return;
                  setMultiPicks((p) => {
                    const cur = p[i] ?? [];
                    return {
                      ...p,
                      [i]: cur.includes(k)
                        ? cur.filter((x) => x !== k)
                        : [...cur, k],
                    };
                  });
                }}
                onCheck={() => {
                  if (st.phase !== "idle") return;
                  const picks = (multiPicks[i] ?? []).slice().sort();
                  const target = item.correct.slice().sort();
                  const ok =
                    picks.length === target.length &&
                    picks.every((v, j) => v === target[j]);
                  if (ok) setState(i, { phase: "right", first: true });
                  else setState(i, { phase: "wrong", picked: null, tries: 1 });
                }}
              />
            )}

            {item.type === "fill" && (
              <FillBody
                item={item}
                st={st}
                text={fillText[i] ?? ""}
                setText={(v) => setFillText((p) => ({ ...p, [i]: v }))}
                onSubmit={() => {
                  if (st.phase === "right") return;
                  const val = norm(fillText[i] ?? "");
                  if (!val) return;
                  const ok = L(item.answers).some((a) => norm(a) === val);
                  if (ok)
                    setState(i, {
                      phase: "right",
                      first: st.phase === "idle",
                    });
                  else
                    setState(i, {
                      phase: "wrong",
                      picked: null,
                      tries: st.phase === "wrong" ? st.tries + 1 : 1,
                    });
                }}
              />
            )}
          </div>
        );
      })}

      {allDone && (
        <div className="quiz-score">
          <span className="big">
            {firstRight}/{items.length}
          </span>
          <span>
            {firstRight === items.length ? (
              <T
                en={
                  <>
                    <b>All correct. Chapter cleared.</b> The green dot in the
                    sidebar is now lit.
                  </>
                }
                zh={
                  <>
                    <b>全对!本章正式通关</b> —— 侧栏的小绿灯已经为你点亮。
                  </>
                }
              />
            ) : (
              <T
                en={
                  <>
                    You answered {firstRight} correctly on the first try. Read
                    the explanations for the ones you missed, then{" "}
                    <b>retake the quiz and get them all right</b> to clear this
                    chapter.
                  </>
                }
                zh={
                  <>
                    第一次尝试答对 {firstRight} 题。回头看看错题的解释,然后
                    <b>重做一遍拿全对</b>,才算真正拿下这一章。
                  </>
                }
              />
            )}
          </span>
          <button
            type="button"
            className="btn btn-sm"
            style={{ marginLeft: "auto" }}
            onClick={reset}
          >
            {L({ en: "Retake quiz", zh: "重做测验" })}
          </button>
        </div>
      )}
    </div>
  );
}

function ChoiceBody({
  item,
  st,
  onPick,
}: {
  item: Extract<QuizItem, { type: "choice" }>;
  st: ItemState;
  onPick: (k: number) => void;
}) {
  const L = useL();
  const locked = st.phase !== "idle";
  return (
    <>
      <div className="q-opts" role="group">
        {L(item.opts).map((opt, k) => {
          let cls = "q-opt";
          if (locked) {
            if (k === item.correct) cls += " right";
            else if (st.phase === "wrong" && st.picked === k) cls += " wrong";
          }
          return (
            <button
              key={k}
              type="button"
              className={cls}
              disabled={locked}
              onClick={() => onPick(k)}
            >
              <span className="key">{KEYS[k]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {st.phase === "right" && (
        <div className="q-feedback ok">✓ {L(item.why)}</div>
      )}
      {st.phase === "wrong" && st.picked !== null && (
        <div className="q-feedback no">
          ✕{" "}
          {(item.wrong === undefined ? undefined : L(item.wrong)[st.picked]) ??
            L(item.why)}
          <p style={{ marginTop: 6, marginBottom: 0 }}>
            <b>
              <T
                en={<>The correct answer is {KEYS[item.correct]}: </>}
                zh={<>正确答案是 {KEYS[item.correct]}:</>}
              />
            </b>
            {L(item.why)}
          </p>
        </div>
      )}
    </>
  );
}

function MultiBody({
  item,
  st,
  picks,
  onToggle,
  onCheck,
}: {
  item: Extract<QuizItem, { type: "multi" }>;
  st: ItemState;
  picks: number[];
  onToggle: (k: number) => void;
  onCheck: () => void;
}) {
  const L = useL();
  const locked = st.phase !== "idle";
  const missed = item.correct.some((c) => !picks.includes(c));
  const extra = picks.some((p) => !item.correct.includes(p));
  return (
    <>
      <div
        className="q-opts"
        role="group"
        aria-label={L({ en: "Select all that apply", zh: "多选" })}
      >
        {L(item.opts).map((opt, k) => {
          let cls = "q-opt";
          if (!locked && picks.includes(k)) cls += " picked";
          if (locked) {
            if (item.correct.includes(k)) cls += " right";
            else if (picks.includes(k)) cls += " wrong";
          }
          return (
            <button
              key={k}
              type="button"
              className={cls}
              disabled={locked}
              onClick={() => onToggle(k)}
            >
              <span className="key">{picks.includes(k) ? "✓" : KEYS[k]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {!locked && (
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            className="btn btn-sm"
            disabled={picks.length === 0}
            onClick={onCheck}
          >
            {L({ en: "Check answer", zh: "检查(多选)" })}
          </button>
        </div>
      )}
      {st.phase === "right" && (
        <div className="q-feedback ok">✓ {L(item.why)}</div>
      )}
      {st.phase === "wrong" && (
        <div className="q-feedback no">
          ✕{" "}
          {extra
            ? L(item.extraHint)
            : missed
              ? L(item.missHint)
              : L(item.why)}
          <p style={{ marginTop: 6, marginBottom: 0 }}>
            <b>{L({ en: "Correct combination: ", zh: "正确组合:" })}</b>
            {item.correct.map((c) => KEYS[c]).join(" + ")} —— {L(item.why)}
          </p>
        </div>
      )}
    </>
  );
}

function FillBody({
  item,
  st,
  text,
  setText,
  onSubmit,
}: {
  item: Extract<QuizItem, { type: "fill" }>;
  st: ItemState;
  text: string;
  setText: (v: string) => void;
  onSubmit: () => void;
}) {
  const L = useL();
  const solved = st.phase === "right";
  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          className="q-input"
          placeholder={
            item.placeholder === undefined
              ? L({ en: "Type your answer…", zh: "输入答案…" })
              : L(item.placeholder)
          }
          value={text}
          disabled={solved}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
        />
        <button
          type="button"
          className="btn btn-sm"
          disabled={solved || !text.trim()}
          onClick={onSubmit}
        >
          {L({ en: "Submit", zh: "确认" })}
        </button>
      </div>
      {solved && <div className="q-feedback ok">✓ {L(item.why)}</div>}
      {st.phase === "wrong" && (
        <div className="q-feedback no">
          ✕ {L({ en: "Not quite", zh: "还不对" })} —— {L(item.hint)}
          {st.tries >= 3 && (
            <p style={{ marginTop: 6, marginBottom: 0 }}>
              <b>{L({ en: "Answer: ", zh: "参考答案:" })}</b>
              <code>{L(item.answers)[0]}</code>
            </p>
          )}
        </div>
      )}
    </>
  );
}
