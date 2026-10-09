"use client";

// The ⌘K command palette: fuzzy-search chapters (Chinese and English titles / English name /
// tags) and press Enter to jump.
// The global keyboard listener lives here; Esc closes, up/down arrows move the selection.
// Search keys from both languages are indexed, so Chinese keywords still find a chapter while
// the UI is in English.
//
// It is a modal dialog built on the combobox pattern: focus stays in the search box (Tab
// cannot leave the dialog), the results are a listbox whose active option is announced
// through aria-activedescendant and kept in view, the page behind does not scroll, and
// closing returns focus to whatever opened it.

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CHAPTERS, subLabel } from "@/lib/curriculum";
import { useShell } from "./theme-provider";
import { pick, useL, useLang } from "@/lib/i18n";

export default function CommandPalette() {
  const { cmdkOpen, setCmdkOpen } = useShell();
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const L = useL();
  const { lang } = useLang();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      } else if (e.key === "Escape") {
        setCmdkOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCmdkOpen]);

  useEffect(() => {
    if (!cmdkOpen) return;
    opener.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setSel(0);
    // Wait until the overlay has rendered before focusing
    requestAnimationFrame(() => inputRef.current?.focus());
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousOverflow;
      // Back to the button (or field) that opened the palette
      opener.current?.focus?.();
    };
  }, [cmdkOpen]);

  // Keep the option chosen with the arrow keys inside the scrolling list
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [sel, query, cmdkOpen]);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CHAPTERS;
    return CHAPTERS.filter((c) =>
      [
        pick(c.title, "en"),
        pick(c.title, "zh"),
        c.en,
        c.num,
        ...pick(c.tags, "en"),
        ...pick(c.tags, "zh"),
      ].some((s) => s.toLowerCase().includes(q)),
    );
  }, [query]);

  if (!cmdkOpen) return null;

  const go = (href: string) => {
    setCmdkOpen(false);
    router.push(href);
  };

  return (
    <div
      className="cmdk-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) setCmdkOpen(false);
      }}
    >
      <div
        className="cmdk"
        role="dialog"
        aria-modal="true"
        aria-label={L({ en: "Jump to a chapter", zh: "快速跳转" })}
        onKeyDown={(e) => {
          // Focus lives in the search box; Tab must not escape the dialog
          if (e.key === "Tab") {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}
      >
        <input
          ref={inputRef}
          className="cmdk-input"
          role="combobox"
          aria-expanded="true"
          aria-controls="cmdk-list"
          aria-autocomplete="list"
          aria-label={L({ en: "Search chapters", zh: "搜索章节" })}
          aria-activedescendant={hits[sel] ? `cmdk-opt-${hits[sel].id}` : undefined}
          placeholder={L({
            en: "Search chapters, algorithms, tags…",
            zh: "搜索章节、算法、标签…",
          })}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((s) => Math.min(s + 1, hits.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((s) => Math.max(s - 1, 0));
            } else if (e.key === "Enter" && hits[sel]) {
              go(hits[sel].href);
            }
          }}
        />
        <div
          ref={listRef}
          className="cmdk-list"
          id="cmdk-list"
          role="listbox"
          aria-label={L({ en: "Chapters", zh: "章节" })}
        >
          {hits.length === 0 && (
            <div className="cmdk-empty">
              {L({
                en: "No chapter matches. Try another keyword.",
                zh: "没有匹配的章节，请换一个关键词。",
              })}
            </div>
          )}
          {hits.map((c, i) => (
            <button
              key={c.id}
              id={`cmdk-opt-${c.id}`}
              type="button"
              role="option"
              aria-selected={i === sel}
              tabIndex={-1}
              className={`cmdk-item${i === sel ? " sel" : ""}`}
              style={{ "--ch-hue": c.hue } as React.CSSProperties}
              onMouseEnter={() => setSel(i)}
              onClick={() => go(c.href)}
            >
              <span className="side-num">{c.num}</span>
              <span style={{ flex: 1 }}>
                {L(c.title)}
                {L(subLabel(c)) && (
                    <span className="side-en">{L(subLabel(c))}</span>
                  )}
              </span>
              <span className="dim" style={{ fontSize: 11 }}>
                {pick(c.tags, lang).slice(0, 2).join(" · ")}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
