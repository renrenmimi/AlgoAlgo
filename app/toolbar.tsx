"use client";

// Top toolbar: sidebar toggle + breadcrumb + UI language (English / Chinese) + preferred
// code language + ⌘K + theme switch.
// The preferred code language (Java/Python/JS) is linked across the whole site; this is the
// global entry point for changing it.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { chapterByPath, PAGE_NOT_FOUND } from "@/lib/curriculum";
import { useShell, useTheme, type CodeLang } from "./theme-provider";
import { useL, useLang, type Lang } from "@/lib/i18n";
import { useNarrowLayout } from "./sidebar";

const LANGS: { id: CodeLang; label: string }[] = [
  { id: "java", label: "Java" },
  { id: "python", label: "Python" },
  { id: "js", label: "JS" },
];

const UI_LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "zh", label: "中文" },
];

export default function Toolbar() {
  const path = usePathname();
  // Outside the course (a 404) the breadcrumb names the page instead
  const ch = chapterByPath(path) ?? PAGE_NOT_FOUND;
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
  const L = useL();
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    setCmdkOpen,
    codeLang,
    setCodeLang,
  } = useShell();
  const narrow = useNarrowLayout();

  // Show the shortcut the reader's keyboard actually has
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  return (
    <header className="toolbar">
      <button
        type="button"
        id="sidebar-toggle"
        className="tb-btn"
        aria-label={L({ en: "Toggle sidebar", zh: "切换侧栏" })}
        aria-controls="sidebar"
        aria-expanded={narrow ? sidebarOpen : !sidebarCollapsed}
        onClick={() => {
          if (window.innerWidth <= 960) setSidebarOpen((v) => !v);
          else toggleSidebarCollapsed();
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M2 4h12M2 8h12M2 12h12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="tb-crumb">
        <span>AlgoAlgo</span>
        <span className="sep">/</span>
        <b>
          {ch.num !== "✦" ? `${ch.num} · ` : ""}
          {L(ch.title)}
        </b>
      </div>

      <div
        className="seg seg-lang"
        role="group"
        aria-label={L({ en: "Interface language", zh: "界面语言" })}
      >
        {UI_LANGS.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`seg-btn${lang === l.id ? " on" : ""}`}
            aria-pressed={lang === l.id}
            onClick={() => setLang(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div
        className="seg seg-code"
        role="group"
        aria-label={L({ en: "Preferred code language", zh: "偏好代码语言" })}
      >
        {LANGS.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`seg-btn${codeLang === l.id ? " on" : ""}`}
            aria-pressed={codeLang === l.id}
            onClick={() => setCodeLang(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="tb-btn"
        onClick={() => setCmdkOpen(true)}
        aria-label={L({ en: "Open command palette", zh: "打开命令面板" })}
      >
        {L({ en: "Jump", zh: "跳转" })}{" "}
        <span className="tb-kbd">{isMac ? "⌘K" : "Ctrl K"}</span>
      </button>

      <button
        type="button"
        className="tb-btn"
        onClick={toggleTheme}
        aria-label={
          theme === "dark"
            ? L({ en: "Switch to the light theme", zh: "切换到浅色主题" })
            : L({ en: "Switch to the dark theme", zh: "切换到深色主题" })
        }
      >
        {theme === "dark" ? "☾" : "☀"}
      </button>
    </header>
  );
}
