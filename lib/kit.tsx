"use client";

// Shared primitives for chapter pages:
//  - Reveal: fades and slides content in when it scrolls into the viewport
//    (IntersectionObserver).
//  - Hero: the chapter opening (eyebrow / large gradient title / one-sentence essence /
//    giant number watermark / jump-to-section chips).
//  - Section: a numbered section (§01 · title + description + a badge on the right),
//    with Reveal built in.
//  - Callout: a callout box (five tones: idea/warn/deep/story/win).
//  - BigO: a complexity badge. KeyPoints: the end-of-chapter takeaways card.
//    ChapterFooter: previous/next chapter.
//
// Bilingual: every copy-carrying prop is a Loc<...>, so you can pass { en, zh } directly;
// you can also pass a chunk of JSX and use <T en zh /> inside it. Both work -- pick whichever
// reads better.

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { CHAPTERS, prevNext, type ChapterId } from "@/lib/curriculum";
import { useL, type Loc } from "@/lib/i18n";

/* ---------- Reveal ---------- */

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If the element is already in (or above) the viewport at mount time, show it right away --
    // otherwise content can get stuck hidden on the first screen or after a fast jump.
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.top < vh * 0.95) {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    io.observe(el);

    // Safety net: whether or not the observer ever fires, force the content visible after
    // 2.5s so it can never stay invisible.
    const fallback = window.setTimeout(() => setInView(true), 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${inView ? " in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ---------- Hero ---------- */

export interface HeroChip {
  id: string;
  label: Loc<string>;
  n: string;
}

export function Hero({
  ch,
  title,
  essence,
  chips,
  children,
}: {
  ch: ChapterId;
  /** Gradient title, e.g. <>Sorting <span className="grad">algorithms</span></> */
  title: Loc<ReactNode>;
  essence: Loc<ReactNode>;
  chips?: HeroChip[];
  /** The custom visual to the right of (or below) the hero -- each chapter's own animation */
  children?: ReactNode;
}) {
  const meta = CHAPTERS.find((c) => c.id === ch)!;
  const L = useL();
  return (
    <header className="hero">
      <div className="hero-watermark" aria-hidden>
        {meta.num}
      </div>
      <div className="hero-eyebrow">
        CHAPTER {meta.num} · {meta.en}
      </div>
      <h1 className="hero-title">{L(title)}</h1>
      <p className="hero-essence">{L(essence)}</p>
      {children}
      {chips && chips.length > 0 && (
        <nav
          className="hero-nav"
          aria-label={L({ en: "Sections in this chapter", zh: "本章段落" })}
        >
          {chips.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="hero-chip">
              <span className="n">§{c.n}</span>
              {L(c.label)}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

/* ---------- Section ---------- */

export function Section({
  id,
  index,
  title,
  desc,
  badge,
  children,
}: {
  id?: string;
  index: string;
  title: Loc<ReactNode>;
  desc?: Loc<ReactNode>;
  badge?: Loc<ReactNode>;
  children: ReactNode;
}) {
  const L = useL();
  return (
    <Reveal>
      <section className="sec" id={id}>
        <div className="sec-head">
          <span className="sec-index">§{index}</span>
          <h2 className="sec-title">{L(title)}</h2>
          {badge && <span className="sec-badge">{L(badge)}</span>}
        </div>
        {desc && <p className="sec-desc">{L(desc)}</p>}
        {children}
      </section>
    </Reveal>
  );
}

/* ---------- Callout ---------- */

const TONE_ICO: Record<string, string> = {
  idea: "💡",
  warn: "⚠️",
  deep: "🔬",
  story: "📖",
  win: "🏆",
};

export function Callout({
  tone = "idea",
  ico,
  title,
  children,
}: {
  tone?: "idea" | "warn" | "deep" | "story" | "win";
  ico?: string;
  title?: Loc<ReactNode>;
  children: ReactNode;
}) {
  const L = useL();
  return (
    <div className="callout" data-tone={tone}>
      <span className="ico" aria-hidden>
        {ico ?? TONE_ICO[tone]}
      </span>
      <div>
        {title && (
          <p>
            <b>{L(title)}</b>
          </p>
        )}
        {typeof children === "string" ? <p>{children}</p> : children}
      </div>
    </div>
  );
}

/* ---------- BigO ---------- */

/** o is one of: 1 | logn | n | nlogn | n2 | 2n. When label is omitted it is derived from o. */
export function BigO({ o, label }: { o: string; label?: Loc<string> }) {
  const L = useL();
  const text =
    (label === undefined ? undefined : L(label)) ??
    {
      "1": "O(1)",
      logn: "O(log n)",
      n: "O(n)",
      nlogn: "O(n log n)",
      n2: "O(n²)",
      "2n": "O(2ⁿ)",
    }[o] ??
    o;
  return (
    <span className="big-o" data-o={o}>
      {text}
    </span>
  );
}

/* ---------- KeyPoints ---------- */

export function KeyPoints({
  title = {
    en: "What to take away from this chapter",
    zh: "这一章,真正要带走的",
  },
  points,
}: {
  title?: Loc<ReactNode>;
  points: Loc<ReactNode[]>;
}) {
  const L = useL();
  return (
    <Reveal>
      <div className="kp">
        <div className="kp-title">
          <span aria-hidden>✦</span>
          {L(title)}
        </div>
        <ul>
          {L(points).map((p, i) => (
            <li key={i}>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

/* ---------- ChapterFooter ---------- */

export function ChapterFooter({ ch }: { ch: ChapterId }) {
  const { prev, next } = prevNext(ch);
  const L = useL();
  return (
    <nav
      className="ch-footer"
      aria-label={L({ en: "Chapter navigation", zh: "章节导航" })}
    >
      {prev ? (
        <Link
          href={prev.href}
          className="ch-footer-link"
          style={{ "--ch-hue": prev.hue } as CSSProperties}
        >
          <span className="lab">{L({ en: "← Previous", zh: "← 上一章" })}</span>
          <span className="name">
            <span className="n">{prev.num}</span>
            {L(prev.title)}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.href}
          className="ch-footer-link next"
          style={{ "--ch-hue": next.hue } as CSSProperties}
        >
          <span className="lab">{L({ en: "Next →", zh: "下一章 →" })}</span>
          <span className="name">
            <span className="n">{next.num}</span>
            {L(next.title)}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
