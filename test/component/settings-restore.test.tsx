// If React gives up hydrating the root, it renders it again on the client and drops the
// <html> attributes that the inline scripts wrote before the first paint. The providers must
// then restore the reader's settings from storage, not from those attributes, and write the
// attributes back.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { LangProvider, useLang } from "@/lib/i18n";
import {
  ShellProvider,
  THEME_COLOR,
  ThemeProvider,
  useShell,
  useTheme,
} from "@/app/theme-provider";

function Probe() {
  const { lang } = useLang();
  const { theme } = useTheme();
  const { sidebarCollapsed, codeLang } = useShell();
  return <p>{`${lang} ${theme} ${sidebarCollapsed ? "collapsed" : "expanded"} ${codeLang}`}</p>;
}

function ThemeToggle() {
  const { toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>toggle</button>;
}

function renderProviders() {
  render(
    <LangProvider>
      <ThemeProvider>
        <ShellProvider>
          <Probe />
          <ThemeToggle />
        </ShellProvider>
      </ThemeProvider>
    </LangProvider>,
  );
}

const html = document.documentElement;

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  // The state after React has rendered the root again: only what it declares itself.
  for (const key of ["lang", "theme", "sidebar"]) delete html.dataset[key];
  html.lang = "en";
  document.head.innerHTML = `<meta name="theme-color" content="${THEME_COLOR.dark}">`;
});

const themeColor = () =>
  document.querySelector('meta[name="theme-color"]')?.getAttribute("content");

describe("settings after the root is rendered again on the client", () => {
  it("come back from storage and are written back onto <html>", () => {
    localStorage.setItem("aa-lang", "zh");
    localStorage.setItem("aa-theme", "light");
    localStorage.setItem("aa-sidebar", "collapsed");
    localStorage.setItem("aa-codelang", "java");
    renderProviders();

    expect(screen.getByText("zh light collapsed java")).toBeInTheDocument();
    expect(html.dataset.lang).toBe("zh");
    expect(html.lang).toBe("zh-CN");
    expect(html.dataset.theme).toBe("light");
    expect(html.dataset.sidebar).toBe("collapsed");
    expect(themeColor()).toBe(THEME_COLOR.light);
  });

  it("fall back to the defaults when nothing is stored", () => {
    renderProviders();

    expect(screen.getByText("en dark expanded python")).toBeInTheDocument();
    expect(html.dataset.lang).toBe("en");
    expect(html.dataset.theme).toBe("dark");
    expect(html.dataset.sidebar).toBe("expanded");
    expect(themeColor()).toBe(THEME_COLOR.dark);
  });

  it("fall back to the defaults when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage is blocked");
    });
    renderProviders();

    expect(screen.getByText("en dark expanded python")).toBeInTheDocument();
    expect(html.dataset.theme).toBe("dark");
  });
});

describe("the language key", () => {
  it("reads a choice saved under the old key and moves it to the new one", () => {
    localStorage.setItem("algo-lang", "zh");
    renderProviders();

    expect(screen.getByText("zh dark expanded python")).toBeInTheDocument();
    expect(localStorage.getItem("aa-lang")).toBe("zh");
    expect(localStorage.getItem("algo-lang")).toBeNull();
  });

  it("prefers the new key when both are present", () => {
    localStorage.setItem("aa-lang", "en");
    localStorage.setItem("algo-lang", "zh");
    renderProviders();

    expect(screen.getByText("en dark expanded python")).toBeInTheDocument();
  });
});

describe("switching the theme", () => {
  it("updates data-theme, the stored value and the browser chrome colour", () => {
    renderProviders();
    act(() => screen.getByText("toggle").click());

    expect(html.dataset.theme).toBe("light");
    expect(localStorage.getItem("aa-theme")).toBe("light");
    expect(themeColor()).toBe(THEME_COLOR.light);
  });
});
