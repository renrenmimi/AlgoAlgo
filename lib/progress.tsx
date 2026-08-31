"use client";

// Site-wide learning progress -- persisted to localStorage.
// Two kinds of fact: (1) problems the reader has checked off (keys like "array/283",
// i.e. `${chapter}/${LeetCode number}`); (2) the best quiz score per chapter.
// Chapter state is derived from those: new (untouched) / doing (touched) /
// done (a perfect quiz score).
// Every component (sidebar, problem sets, Quiz, the finale's master table) shares this one
// context -- do not keep a second copy of the state anywhere.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ChapterId } from "@/lib/curriculum";

const KEY = "aa-progress-v1";

export interface ProgressData {
  problems: Record<string, 1>;
  quiz: Partial<Record<ChapterId, { right: number; total: number }>>;
}

const EMPTY: ProgressData = { problems: {}, quiz: {} };

interface Ctx {
  ready: boolean;
  data: ProgressData;
  isDone: (pid: string) => boolean;
  toggleProblem: (pid: string) => void;
  reportQuiz: (ch: ChapterId, right: number, total: number) => void;
  chapterState: (ch: ChapterId) => "new" | "doing" | "done";
  problemCount: (ch: ChapterId) => number;
  totalProblems: number;
  reset: () => void;
}

const ProgressContext = createContext<Ctx>({
  ready: false,
  data: EMPTY,
  isDone: () => false,
  toggleProblem: () => {},
  reportQuiz: () => {},
  chapterState: () => "new",
  problemCount: () => 0,
  totalProblems: 0,
  reset: () => {},
});

function load(): ProgressData {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      problems: parsed.problems ?? {},
      quiz: parsed.quiz ?? {},
    };
  } catch {
    return EMPTY;
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProgressData>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(load());
    setReady(true);
  }, []);

  const persist = useCallback((next: ProgressData) => {
    setData(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* Write failed (private browsing mode and the like): stay in-memory only. */
    }
  }, []);

  const isDone = useCallback((pid: string) => !!data.problems[pid], [data]);

  const toggleProblem = useCallback(
    (pid: string) => {
      const problems = { ...data.problems };
      if (problems[pid]) delete problems[pid];
      else problems[pid] = 1;
      persist({ ...data, problems });
    },
    [data, persist],
  );

  const reportQuiz = useCallback(
    (ch: ChapterId, right: number, total: number) => {
      const prev = data.quiz[ch];
      // Keep only the best score
      if (prev && prev.right / prev.total >= right / total) return;
      persist({ ...data, quiz: { ...data.quiz, [ch]: { right, total } } });
    },
    [data, persist],
  );

  const chapterState = useCallback(
    (ch: ChapterId): "new" | "doing" | "done" => {
      const q = data.quiz[ch];
      if (q && q.total > 0 && q.right === q.total) return "done";
      if (q) return "doing";
      if (Object.keys(data.problems).some((k) => k.startsWith(ch + "/")))
        return "doing";
      return "new";
    },
    [data],
  );

  const problemCount = useCallback(
    (ch: ChapterId) =>
      Object.keys(data.problems).filter((k) => k.startsWith(ch + "/")).length,
    [data],
  );

  const reset = useCallback(() => persist(EMPTY), [persist]);

  return (
    <ProgressContext.Provider
      value={{
        ready,
        data,
        isDone,
        toggleProblem,
        reportQuiz,
        chapterState,
        problemCount,
        totalProblems: Object.keys(data.problems).length,
        reset,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => useContext(ProgressContext);
