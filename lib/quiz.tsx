"use client";

// The quiz engine -- three question types:
//  - choice: single choice, judged on click. A wrong answer gets a correction written for
//    that specific option (one per wrong option; generic copy is not acceptable) and the
//    correct option lights up. Scoring uses the first click.
//  - multi: multiple choice, checked after the reader presses "check"; missing selections and
//    extra selections get separate hints.
//  - fill: fill in the blank, judged on Enter or the button; the reader can retry until it is
//    right (scoring uses whether they got there in the end).
// Once every question is answered -> a results panel, and the score is written to the progress
// system (the best historical score wins, and it decides the chapter's "cleared" state).

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
      /** A correction written for each individual option (leave the correct one undefined) */
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
      /** Accepted answers (compared case-insensitively and with whitespace trimmed).
       *  For a purely technical term, put both the English and Chinese spellings in the same
       *  array; only use { en, zh } when the answer itself genuinely differs by language. */
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
    // Compute the new array outside of rendering first, then commit the state and the score
    // separately.
    // (The old code passed finish into the setStates updater -- an updater must be a pure
    //  function, and calling reportQuiz inside it updates ProgressProvider while Quiz is
    //  rendering, which React warns about; under StrictMode the updater runs twice, so the
    //  score would also be reported twice.)
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
