"use client";

// Left-hand navigation: the brand + every chapter (each with a numbered dot in its own
// accent color) + learning progress.
// The chapter list comes from lib/curriculum.ts; progress comes from lib/progress.tsx.
//
// Up to 960px wide the sidebar is an off-canvas drawer. Whenever it is off screen (closed
// drawer, or collapsed on desktop) it is inert, so its links are not tab stops. While the
// drawer is open the page behind it is inert and does not scroll, focus starts in the
// drawer, and Escape or the scrim closes it and returns focus to the menu button.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CHAPTERS, chapterByPath, subLabel } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { useShell } from "./theme-provider";
import { BrandMark } from "./logo";
import { T, useL } from "@/lib/i18n";

/** True when the layout is the narrow one, where the sidebar is a drawer. */
export function useNarrowLayout() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 960px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return narrow;
}

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useShell();
  const { ready, chapterState, totalProblems, data } = useProgress();
  const L = useL();
  const narrow = useNarrowLayout();
  const asideRef = useRef<HTMLElement>(null);
  const restoreFocus = useRef(false);

  const current = chapterByPath(path);
  const doneCh = ready
    ? CHAPTERS.filter((c) => chapterState(c.id) === "done").length
    : 0;
  const progress = Math.round((doneCh / CHAPTERS.length) * 100);
  const quizCount = ready ? Object.keys(data.quiz).length : 0;

  const drawerOpen = narrow && sidebarOpen;
  const offScreen = narrow ? !sidebarOpen : sidebarCollapsed;

  // A link was followed: just close
  const close = () => setSidebarOpen(false);
  // Escape or the scrim: close and hand focus back to the menu button
  const dismiss = () => {
    restoreFocus.current = true;
    setSidebarOpen(false);
  };

  // Widening past the breakpoint leaves no drawer to keep open
  useEffect(() => {
    if (!narrow) setSidebarOpen(false);
  }, [narrow, setSidebarOpen]);

  useEffect(() => {
    if (!drawerOpen) {
      if (restoreFocus.current) {
        restoreFocus.current = false;
        document.getElementById("sidebar-toggle")?.focus();
      }
      return;
    }
    const main = document.querySelector<HTMLElement>(".shell-main");
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    main?.setAttribute("inert", "");
    html.style.overflow = "hidden";
    asideRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      main?.removeAttribute("inert");
      html.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // dismiss only touches a ref and a stable setter, so it is not a dependency
  }, [drawerOpen]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        {L({ en: "Skip to content", zh: "跳到正文" })}
      </a>
      <aside
        id="sidebar"
        ref={asideRef}
        className={`sidebar${sidebarOpen ? " open" : ""}`}
        aria-label={L({ en: "AlgoAlgo chapter navigation", zh: "AlgoAlgo 章节导航" })}
        inert={offScreen}
      >
        <Link href="/" className="brand" onClick={close} aria-label="AlgoAlgo">
          <span className="brand-mark" aria-hidden>
            <BrandMark />
          </span>
          <span>
            <span className="brand-name">AlgoAlgo</span>
            <span className="brand-tagline">
              <T en="Algorithms you can see" zh="看得见的算法" />
            </span>
          </span>
        </Link>

        <nav className="side-nav" aria-label={L({ en: "Chapters", zh: "章节" })}>
          {CHAPTERS.map((c) => {
            const active = c.id === current?.id;
            const state = ready ? chapterState(c.id) : "new";
            return (
              <Link
                key={c.id}
                href={c.href}
                className={`side-link${active ? " active" : ""}`}
                style={{ "--ch-hue": c.hue } as React.CSSProperties}
                aria-current={active ? "page" : undefined}
                onClick={close}
                // Prefetching every chapter on every page load cost 550-730 KB; fetch a
                // chapter only when the reader points at it or focuses its link
                prefetch={false}
                onMouseEnter={() => router.prefetch(c.href)}
                onFocus={() => router.prefetch(c.href)}
              >
                <span className="side-num" aria-hidden>
                  {c.num}
                </span>
                <span className="side-title">
                  {L(c.title)}
                  {L(subLabel(c)) && (
                    <span className="side-en">{L(subLabel(c))}</span>
                  )}
                </span>
                <span
                  className={`side-state ${state}`}
                  role="img"
                  aria-label={L(
                    state === "done"
                      ? { en: "Completed", zh: "已完成" }
                      : state === "doing"
                        ? { en: "In progress", zh: "进行中" }
                        : { en: "Not started", zh: "未开始" },
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="side-status">
          <div>
            <T
              en={
                <>
                  <b>{totalProblems}</b> solved · <b>{quizCount}</b> quizzes ·{" "}
                  <b>{doneCh}</b>/{CHAPTERS.length} chapters
                </>
              }
              zh={
                <>
                  已解答 <b>{totalProblems}</b> 题 · 已做 <b>{quizCount}</b> 个测验 ·
                  完成 <b>{doneCh}</b>/{CHAPTERS.length} 章
                </>
              }
            />
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label={L({ en: "Overall course progress", zh: "全书进度" })}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </aside>

      <div
        className={`scrim${sidebarOpen ? " open" : ""}`}
        aria-hidden
        onClick={dismiss}
      />
    </>
  );
}
