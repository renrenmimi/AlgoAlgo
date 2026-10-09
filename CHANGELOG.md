# Changelog

## 2026-10-08 to 2026-10-09 — audit fixes

An audit of the site covered bugs, UI and UX, accessibility, performance and the teaching
content in both languages. Each fix below is its own pull request, and all are merged into
`main`.

### Bugs

- Theme, language and sidebar settings come back from storage after React gives up
  hydrating the root, and the pre-paint scripts moved from `<head>` to the top of `<body>`,
  which removed what made hydration fail on about one cold load in twenty: 0 failures in
  240 cold loads on production afterwards ([#15]).
- Keyboard users can mark problems as done; the checkbox has a larger target and long
  titles wrap to two lines ([#12]).
- Tabs no longer overwrite each other's progress ([#13]).
- The race marks every contender that ties for the lowest value, disables a reroll that
  cannot change any count, and an interrupted roll-up no longer jumps back ([#20]).
- The bit-lamp lab wraps like a 32-bit integer at the overflow boundary ([#34]).
- Builds no longer fail at random on Google Fonts: the three typefaces are self-hosted
  ([#43]).

### Teaching content

- Every chapter's corrections, cross-references and register: prologue ([#16]), sorting
  ([#25]), divide and conquer ([#28]), binary search ([#32]), bit manipulation ([#34]),
  backtracking ([#36]), greedy ([#37]), DP basics ([#18]), knapsack ([#21]), subsequence DP
  ([#24]), advanced DP ([#26]), math ([#30]), strings ([#33]) and the atlas ([#38]).
- Among them:
  - the bubble-sort animation no longer declares the array sorted after one round ([#25]);
  - LC 231 no longer claims that every negative number passes `n & (n-1) == 0` ([#34]);
  - LC 9's key rules out non-zero numbers that end in 0 ([#30]);
  - LC 718's one-row note says a mismatched cell must be reset ([#24]);
  - the race verdicts follow the measured numbers for every shape and size ([#25], [#28]).
- Shared copy: the quicksort race notes, chapter tags and the sorting essence ([#35]), and
  the remaining race notes ([#42]).
- Chinese copy no longer shows the stray spaces JSX made from line breaks (1,440 on the 14
  Chinese pages); a unit test guards the rule ([#39]).
- The quiz sections are called 「本章测验」 instead of 「通关测验」, and their English
  titles all say "Chapter quiz" ([#41]).

### Interaction and accessibility

- The drawer, the collapsed sidebar and the command palette are keyboard-safe, with a skip
  link, `aria-expanded`, a modal palette that keeps the chosen option in view, and focus
  returned on close ([#14]).
- The quiz keeps keyboard focus, announces verdicts, accepts IME input and shows the best
  score ([#17]).
- Text, controls and the focus ring meet WCAG AA contrast in both themes ([#19]).
- Code renders as typed (no ligatures), keeps its file name on phones, keeps a highlighted
  line's band when scrolled, and has real tab semantics ([#22]).
- The home page's decision tree can be paused, stops when it cannot be seen and starts
  paused under reduced motion ([#27]).
- Each page has its own title in the reader's language, and unknown paths get a real 404
  page ([#29]).
- The race controls, the toolbar's code-language buttons and the bit-lamp buttons expose
  their state or names to screen readers ([#20], [#14], [#42]); the home map's difficulty
  bar is read ([#35]).

### Layout

- Phone layouts stay inside the screen: chapter titles and section badges no longer get
  clipped; an overflow test now checks every element on every page in both languages, and
  text fields are 16px on phones ([#23]).
- Content stays visible without JavaScript, and the home statistics are real numbers in the
  HTML ([#31]).

### Performance

- Pages no longer prefetch every other chapter after loading: 29–73 KB instead of
  541–710 KB after the load event ([#14]).
- Idle pages no longer restyle every frame: a chapter page idles at 0.02 s of main-thread
  time per 10 s instead of 0.54 s ([#27]).
- The atlas loads the chapters' problems without their quizzes: its first-load JS goes
  from 313 kB to 235 kB ([#44]).

### Project

- CLAUDE.md's content ranges describe the delivered chapters; a stale comment and the test
  setup are tidied ([#40]).

### Not changed

- English is the default language and readers switch to Chinese by hand; a reader who chose
  Chinese briefly sees the English server HTML before hydration.
- The bit-lamp stage scrolls sideways on phones (with an edge fade) instead of folding into
  four rows of eight.
- Progress has a `reset()` in code but no button for it.

[#12]: https://github.com/renrenmimi/AlgoAlgo/pull/12
[#13]: https://github.com/renrenmimi/AlgoAlgo/pull/13
[#14]: https://github.com/renrenmimi/AlgoAlgo/pull/14
[#15]: https://github.com/renrenmimi/AlgoAlgo/pull/15
[#16]: https://github.com/renrenmimi/AlgoAlgo/pull/16
[#17]: https://github.com/renrenmimi/AlgoAlgo/pull/17
[#18]: https://github.com/renrenmimi/AlgoAlgo/pull/18
[#19]: https://github.com/renrenmimi/AlgoAlgo/pull/19
[#20]: https://github.com/renrenmimi/AlgoAlgo/pull/20
[#21]: https://github.com/renrenmimi/AlgoAlgo/pull/21
[#22]: https://github.com/renrenmimi/AlgoAlgo/pull/22
[#23]: https://github.com/renrenmimi/AlgoAlgo/pull/23
[#24]: https://github.com/renrenmimi/AlgoAlgo/pull/24
[#25]: https://github.com/renrenmimi/AlgoAlgo/pull/25
[#26]: https://github.com/renrenmimi/AlgoAlgo/pull/26
[#27]: https://github.com/renrenmimi/AlgoAlgo/pull/27
[#28]: https://github.com/renrenmimi/AlgoAlgo/pull/28
[#29]: https://github.com/renrenmimi/AlgoAlgo/pull/29
[#30]: https://github.com/renrenmimi/AlgoAlgo/pull/30
[#31]: https://github.com/renrenmimi/AlgoAlgo/pull/31
[#32]: https://github.com/renrenmimi/AlgoAlgo/pull/32
[#33]: https://github.com/renrenmimi/AlgoAlgo/pull/33
[#34]: https://github.com/renrenmimi/AlgoAlgo/pull/34
[#35]: https://github.com/renrenmimi/AlgoAlgo/pull/35
[#36]: https://github.com/renrenmimi/AlgoAlgo/pull/36
[#37]: https://github.com/renrenmimi/AlgoAlgo/pull/37
[#38]: https://github.com/renrenmimi/AlgoAlgo/pull/38
[#39]: https://github.com/renrenmimi/AlgoAlgo/pull/39
[#40]: https://github.com/renrenmimi/AlgoAlgo/pull/40
[#41]: https://github.com/renrenmimi/AlgoAlgo/pull/41
[#42]: https://github.com/renrenmimi/AlgoAlgo/pull/42
[#43]: https://github.com/renrenmimi/AlgoAlgo/pull/43
[#44]: https://github.com/renrenmimi/AlgoAlgo/pull/44
