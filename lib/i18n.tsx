"use client";

// Site language layer -- English is the default, Chinese can be switched on.
//  - Loc<T>: a value that may come in two language variants. A plain value passes through as-is.
//  - langScript: runs before the first paint and sets <html data-lang> and lang. The page
//    content itself is rendered by React, so a reader who chose Chinese sees the English
//    server HTML until hydration (English is the default; this is accepted).
//  - <T en zh />: inline switching inside JSX. Safe to place in module-level constant arrays
//    (the elements are only rendered inside the Provider).
//  - useL(): resolves a Loc<T> to the T for the current language; use it for props
//    (titles, labels, aria-label, ...).
// localStorage key: aa-lang (older visits stored it under algo-lang, which is still read).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  isValidElement,
  startTransition,
  type ReactNode,
} from "react";

export type Lang = "en" | "zh";

/** A value that may be given per language. Plain values pass through unchanged. */
export type Loc<T> = T | { en: T; zh: T };

const KEY = "aa-lang";
const LEGACY_KEY = "algo-lang";

/** Sets <html data-lang> and lang before the first paint. */
export const langScript = `(function(){var d=document.documentElement;var l="en";try{var s=localStorage.getItem("${KEY}");if(s===null){s=localStorage.getItem("${LEGACY_KEY}");}if(s==="zh")l="zh";}catch(e){}d.dataset.lang=l;d.lang=l==="zh"?"zh-CN":"en";})();`;

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {} });

/** Mirrors the language onto <html>, as langScript does before the first paint. */
function applyLang(l: Lang) {
  const d = document.documentElement;
  d.dataset.lang = l;
  d.lang = l === "zh" ? "zh-CN" : "en";
}

/** The stored language, moving a value saved under the old key to the new one. */
function storedLang(): Lang {
  try {
    const s = window.localStorage.getItem(KEY);
    if (s !== null) return s === "zh" ? "zh" : "en";
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy === null) return "en";
    window.localStorage.setItem(KEY, legacy);
    window.localStorage.removeItem(LEGACY_KEY);
    return legacy === "zh" ? "zh" : "en";
  } catch {
    return "en"; // storage blocked (private mode and the like)
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, set] = useState<Lang>("en");

  // Read the stored choice, not <html data-lang>: if React gives up hydrating the root, it
  // renders it again on the client and drops the attributes langScript wrote, so they are
  // written back here.
  useEffect(() => {
    const l = storedLang();
    applyLang(l);
    set(l);
  }, []);

  const setLang = useCallback((l: Lang) => {
    // Switching re-renders every piece of copy on the page. As a transition it no longer
    // blocks the click from being painted.
    startTransition(() => set(l));
    applyLang(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* private mode */
    }
  }, []);

  return (
    <LangContext.Provider
      value={useMemo(() => ({ lang, setLang }), [lang, setLang])}
    >
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);

/** True for `{ en, zh }` pairs — never for React elements or arrays. */
function isPair<T>(v: Loc<T>): v is { en: T; zh: T } {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    !isValidElement(v) &&
    "en" in v &&
    "zh" in v
  );
}

/** Resolve outside of React (rare — prefer useL inside components). */
export function pick<T>(v: Loc<T>, lang: Lang): T {
  return isPair(v) ? v[lang] : v;
}

/** Resolver hook: `const L = useL(); L(node)` picks the current language. */
export function useL() {
  const { lang } = useLang();
  return useCallback(<T,>(v: Loc<T>): T => (isPair(v) ? v[lang] : v), [lang]);
}

/** Inline switch usable anywhere in JSX, including module-level constants. */
export function T({ en, zh }: { en: ReactNode; zh: ReactNode }) {
  const { lang } = useLang();
  return <>{lang === "zh" ? zh : en}</>;
}
