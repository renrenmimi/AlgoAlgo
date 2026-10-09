"use client";

// App-level client providers.
//  - ThemeProvider: mirrors data-theme ("dark" | "light") onto <html>, persisted to
//    localStorage. It is set before the first paint by the inline script at the top of
//    <body> (themeScript), so the wrong theme never flashes.
//    The providers read their settings back from localStorage, not from the <html>
//    attributes: if React gives up hydrating the root, it renders it again on the client
//    and drops the attributes the inline script wrote, so the providers write them back
//    on mount.
//  - ShellProvider: workbench UI state (mobile drawer sidebar / desktop collapse / the ⌘K
//    palette / preferred code language).
//    The preferred code language is linked across the whole site: switch any single CodeTabs
//    to Python and every code window follows.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

export type Theme = "dark" | "light";
export type CodeLang = "java" | "python" | "js";

const THEME_KEY = "aa-theme";
const SIDEBAR_KEY = "aa-sidebar";
const CODELANG_KEY = "aa-codelang";

// The browser chrome colour on phones (<meta name="theme-color">), per theme. Dark matches
// viewport.themeColor in app/layout.tsx; light is the light theme's --bg.
export const THEME_COLOR: Record<Theme, string> = { dark: "#07080f", light: "#eef0f5" };

/** A stored setting, or null when there is none or storage is blocked. */
function stored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLOR[t]);
}

// Runs before the first paint: reads back the theme and the sidebar collapse state to avoid
// a flash, and gives the phone's browser chrome the matching colour. Defaults to dark +
// expanded.
export const themeScript = `(function(){var d=document.documentElement;var t="dark";try{if(localStorage.getItem("${THEME_KEY}")==="light"){t="light";}}catch(e){}d.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute("content",t==="light"?"${THEME_COLOR.light}":"${THEME_COLOR.dark}");}try{d.dataset.sidebar=localStorage.getItem("${SIDEBAR_KEY}")==="collapsed"?"collapsed":"expanded";}catch(e){d.dataset.sidebar="expanded";}})();`;

type ThemeCtx = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeCtx>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, set] = useState<Theme>("dark");

  useEffect(() => {
    const current: Theme = stored(THEME_KEY) === "light" ? "light" : "dark";
    applyTheme(current);
    set(current);
  }, []);

  const toggleTheme = useCallback(() => {
    set((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      applyTheme(next);
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// ---------- Shell UI state ----------

type ShellUiCtx = {
  sidebarOpen: boolean; // Mobile drawer (slides in over a scrim at <=960px)
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  sidebarCollapsed: boolean; // Collapsed state on desktop
  toggleSidebarCollapsed: () => void;
  cmdkOpen: boolean;
  setCmdkOpen: Dispatch<SetStateAction<boolean>>;
};

type CodeLangCtx = {
  codeLang: CodeLang; // Site-wide preferred code language
  setCodeLang: (l: CodeLang) => void;
};

type ShellCtx = ShellUiCtx & CodeLangCtx;

const ShellUiContext = createContext<ShellUiCtx>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  sidebarCollapsed: false,
  toggleSidebarCollapsed: () => {},
  cmdkOpen: false,
  setCmdkOpen: () => {},
});

// Kept apart from the drawer and palette state so that opening either one does not
// re-render every code window on the page.
const CodeLangContext = createContext<CodeLangCtx>({
  codeLang: "python",
  setCodeLang: () => {},
});

export function ShellProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [codeLang, setCodeLangState] = useState<CodeLang>("python");

  useEffect(() => {
    const collapsed = stored(SIDEBAR_KEY) === "collapsed";
    document.documentElement.dataset.sidebar = collapsed ? "collapsed" : "expanded";
    setSidebarCollapsed(collapsed);
    const l = stored(CODELANG_KEY);
    if (l === "java" || l === "python" || l === "js") setCodeLangState(l);
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      document.documentElement.dataset.sidebar = next ? "collapsed" : "expanded";
      try {
        window.localStorage.setItem(SIDEBAR_KEY, next ? "collapsed" : "expanded");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const setCodeLang = useCallback((l: CodeLang) => {
    setCodeLangState(l);
    try {
      window.localStorage.setItem(CODELANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const ui = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      sidebarCollapsed,
      toggleSidebarCollapsed,
      cmdkOpen,
      setCmdkOpen,
    }),
    [sidebarOpen, sidebarCollapsed, toggleSidebarCollapsed, cmdkOpen],
  );
  const code = useMemo(() => ({ codeLang, setCodeLang }), [codeLang, setCodeLang]);

  return (
    <CodeLangContext.Provider value={code}>
      <ShellUiContext.Provider value={ui}>{children}</ShellUiContext.Provider>
    </CodeLangContext.Provider>
  );
}

/** All shell state: the drawer, the collapse state, the palette and the code language. */
export const useShell = (): ShellCtx => ({
  ...useContext(ShellUiContext),
  ...useContext(CodeLangContext),
});

/** Only the preferred code language; for components that do not care about the drawer. */
export const useCodeLang = () => useContext(CodeLangContext);
