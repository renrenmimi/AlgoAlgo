import type { Metadata, Viewport } from "next";
import { Syne, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import {
  ThemeProvider,
  ShellProvider,
  themeScript,
} from "@/app/theme-provider";
import { ProgressProvider } from "@/lib/progress";
import Sidebar from "@/app/sidebar";
import Toolbar from "@/app/toolbar";
import CommandPalette from "@/app/command-palette";
import { LangProvider, langScript } from "@/lib/i18n";

// Three typefaces: Syne (oversized display type, strongly geometric), Space Grotesk (UI and
// headings) and JetBrains Mono (code and numbers). Chinese falls back to PingFang SC;
// the font stacks are assembled in globals.css.
const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jb",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AlgoAlgo · Algorithms You Can See",
    template: "%s · AlgoAlgo",
  },
  description:
    "Learn algorithms in slow motion. Decision trees expand frame by frame, DP tables fill cell by cell, and every solution is shown in Java, Python, and JavaScript, with detailed walkthroughs of common LeetCode problems. Sister course to DataData (Data Structures You Can See). Available in English and Chinese.",
};

export const viewport: Viewport = {
  themeColor: "#07080f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${grotesk.variable} ${jetbrains.variable}`}
    >
      <body>
        {/* These run before the first paint. They sit at the top of <body>, not in <head>:
            during hydration the webpack runtime removes the chunk <script> tags it has
            finished loading from <head>, and when that happens while React is still
            matching hand-written nodes there, hydration fails (React error #418) and the
            whole root is rendered again on the client. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
        <LangProvider>
          <ThemeProvider>
            <ShellProvider>
              <ProgressProvider>
                <div className="aurora" aria-hidden>
                  <div className="aurora-a" />
                  <div className="aurora-b" />
                  <div className="aurora-grid" />
                </div>
                <div className="shell">
                  <Sidebar />
                  <div className="shell-main">
                    <Toolbar />
                    {/* Target of the sidebar's "Skip to content" link */}
                    <div className="shell-content" id="main-content" tabIndex={-1}>
                      {children}
                    </div>
                  </div>
                </div>
                <CommandPalette />
              </ProgressProvider>
            </ShellProvider>
          </ThemeProvider>
        </LangProvider>
      </body>
    </html>
  );
}
