"use client";

// Code window components.
//  - CodeBlock: a single-language code window (mac traffic lights + file name + line numbers
//    + highlightable lines + a footer note).
//  - CodeTabs: a Java / Python / JS switcher; switching writes back to the site-wide
//    "preferred language", so every code window on the site switches along with it --
//    this is the core mechanism behind teaching all three languages side by side. It follows
//    the WAI-ARIA tabs pattern: one tab stop, arrow keys / Home / End move between the
//    languages and select as they go, and the code is the tabpanel.
//
// Bilingual UI: title / note are Loc<...>.
// code also accepts Loc<string>, but by default write one string with English comments and
// share it across both languages -- two copies drift apart easily, and the hl line numbers
// have to stay aligned with the code line by line. If you really do supply two copies,
// they must have exactly the same number of lines, otherwise hl will point at the wrong rows.

import { useId, useMemo, type KeyboardEvent, type ReactNode } from "react";
import { highlight, type CodeLangId } from "@/lib/highlight";
import { useShell, type CodeLang } from "@/app/theme-provider";
import { useL, type Loc } from "@/lib/i18n";

const LANG_LABEL: Record<CodeLangId, string> = {
  java: "Java",
  python: "Python",
  js: "JavaScript",
};

const LANG_FILE: Record<CodeLangId, string> = {
  java: ".java",
  python: ".py",
  js: ".js",
};

const LANGS: CodeLang[] = ["java", "python", "js"];

export function CodeLines({
  code,
  lang,
  hl,
}: {
  code: string;
  lang: CodeLangId;
  hl?: number[];
}) {
  const lines = useMemo(() => highlight(code.trimEnd(), lang), [code, lang]);
  const hlSet = useMemo(() => new Set(hl ?? []), [hl]);
  return (
    <div className="codewin-body">
      {lines.map((toks, i) => (
        <div key={i} className={`cl${hlSet.has(i + 1) ? " hl" : ""}`}>
          <span className="cl-n">{i + 1}</span>
          <span className="cl-c">
            {toks.map((tok, j) =>
              tok.t ? (
                <span key={j} className={`tk-${tok.t}`}>
                  {tok.s}
                </span>
              ) : (
                <span key={j}>{tok.s}</span>
              ),
            )}
            {toks.length === 0 && " "}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CodeBlock({
  code,
  lang,
  title,
  hl,
  note,
}: {
  code: Loc<string>;
  lang: CodeLangId;
  title?: Loc<string>;
  hl?: number[];
  note?: Loc<ReactNode>;
}) {
  const L = useL();
  return (
    <div className="codewin">
      <div className="codewin-bar">
        <span className="codewin-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="codewin-name">
          {title === undefined ? LANG_LABEL[lang] : L(title)}
        </span>
        <span className="codewin-spacer" aria-hidden />
      </div>
      <CodeLines code={L(code)} lang={lang} hl={hl} />
      {note && <div className="codewin-note">{L(note)}</div>}
    </div>
  );
}

export interface LangSnippet {
  code: Loc<string>;
  /** An optional one-line remark specific to this language, shown at the bottom of the window */
  note?: Loc<ReactNode>;
  /** Line numbers to highlight (1-based) */
  hl?: number[];
}

export function CodeTabs({
  title,
  java,
  python,
  js,
}: {
  title: Loc<string>;
  java: LangSnippet;
  python: LangSnippet;
  js: LangSnippet;
}) {
  const { codeLang, setCodeLang } = useShell();
  const L = useL();
  const snippets: Record<CodeLang, LangSnippet> = { java, python, js };
  const cur = snippets[codeLang];
  const id = useId();
  const tabId = (l: CodeLang) => `${id}-tab-${l}`;
  const panelId = `${id}-panel`;

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, from: CodeLang) => {
    const i = LANGS.indexOf(from);
    const next =
      e.key === "ArrowRight"
        ? LANGS[(i + 1) % LANGS.length]
        : e.key === "ArrowLeft"
          ? LANGS[(i + LANGS.length - 1) % LANGS.length]
          : e.key === "Home"
            ? LANGS[0]
            : e.key === "End"
              ? LANGS[LANGS.length - 1]
              : null;
    if (!next) return;
    e.preventDefault();
    setCodeLang(next);
    document.getElementById(tabId(next))?.focus();
  };

  return (
    <div className="codewin">
      <div className="codewin-bar">
        <span className="codewin-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="codewin-name">
          {L(title)}
          {LANG_FILE[codeLang]}
        </span>
        <div
          className="codewin-tabs"
          role="tablist"
          aria-label={L({ en: "Switch code language", zh: "切换语言" })}
        >
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              id={tabId(l)}
              aria-selected={codeLang === l}
              aria-controls={panelId}
              tabIndex={codeLang === l ? 0 : -1}
              className={`codewin-tab${codeLang === l ? " on" : ""}`}
              onClick={() => setCodeLang(l)}
              onKeyDown={(e) => onTabKey(e, l)}
            >
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
      </div>
      <div
        className="codewin-panel"
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(codeLang)}
        tabIndex={0}
      >
        <CodeLines code={L(cur.code)} lang={codeLang} hl={cur.hl} />
        {cur.note && <div className="codewin-note">{L(cur.note)}</div>}
      </div>
    </div>
  );
}
