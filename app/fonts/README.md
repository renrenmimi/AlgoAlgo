# Fonts

The site's three typefaces are self-hosted from this directory, so `next build` never
downloads fonts. Fetching them from Google Fonts at build time made builds fail at random:
`next/font/google` crashes (`loader.js`, "Cannot read properties of null (reading '1')")
when a font URL in Google's CSS has no file extension. It happened to CI twice in the
2026-10 audit round.

| File | Family | Coverage | Used for |
|---|---|---|---|
| `syne-latin.woff2` | Syne, weights 600–800 | Google Fonts latin subset | Display headings |
| `space-grotesk-latin.woff2` | Space Grotesk, weights 400–700 | Google Fonts latin subset | Interface text |
| `jetbrains-mono-latin.woff2` | JetBrains Mono, weights 400–700 | Google Fonts latin subset | Code and numbers |

The files are the variable fonts as Google Fonts serves them (the same files DataData
self-hosts), loaded with `next/font/local` in `app/layout.tsx`. Characters outside the latin
subset, such as the ā and ī in "al-Khwārizmī" on the home page, fall back to the next font
in the stack.

All three families are licensed under the SIL Open Font License 1.1, which permits
redistributing them with this site. Each file carries its copyright notice and license in its
metadata; the license is published at https://openfontlicense.org.
