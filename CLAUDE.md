# CLAUDE.md — AlgoAlgo · Algorithms You Can See

Read this file in full before touching anything in a new session.

## Language policy

- **Repository artifacts are English**: commit messages, PR titles and bodies, branch
  names, code comments, and this file.
- **Site content is bilingual**: every user-facing string is `{ en, zh }` (see
  `lib/i18n.tsx`). English is the default language; Chinese is a toggle.
- **Conversation with the user is Chinese.** Do not let that leak into the repository.

## What this is

**AlgoAlgo** is an interactive algorithms course for complete beginners, and the sister
site of **DataData** (`../DataData`, "data structures you can see") — same shell, same
design language. The promise: **finish this course and you will not need another source
to learn algorithms.**

Data structures draw *shapes*; algorithms draw *how decisions and state evolve*: decision
trees expanding step by step, DP tables filling cell by cell, candidate ranges narrowing.
The raw source material is `lc.md` at the repo root (270 problems from two merged
bootcamps, graded A / B / C), but the learning path follows the "Course structure"
section below, not that file's ordering.

Audience floor: **someone who has just written hello world** (and is assumed to have gone
through DataData's basic-structures chapters).

- Every conclusion must come with a *why*; never state a result and move on.
- Analogy first, terminology second. Give both Chinese and English on a term's first use.
- Recursion is the foundation of the whole course. The introduction teaches it in §03
  (call stack, base case, trusting the recursion); later chapters may simply refer back.

## Course structure (14 pages, easy to hard) and the reasoning behind the order

`lib/curriculum.ts` is the single registry of chapters (route, number, theme hue,
difficulty, tags).

Introduction (`/`) algorithmic thinking + recursion + the four paradigms → 01 sorting →
02 divide and conquer → 03 binary search in depth → 04 bit manipulation → 05 backtracking
→ 06 greedy → 07 DP basics → 08 knapsack → 09 subsequence DP → 10 advanced DP →
11 maths and number theory → 12 string algorithms → ✦ finale: the paradigm atlas.

Why this order (synthesised from lc.md's 20-week table, the NeetCode roadmap, LeetCode's
official study plan, and the 代码随想录 syllabus): sorting and divide-and-conquer lay the
"recursion + split the problem" foundation; binary search drills "halve it using
monotonicity"; bit manipulation is a light toolbox chapter that also prepares bitmask DP;
backtracking makes the recursion tree visible; greedy teaches how to *prove* a greedy
choice is safe; the four DP chapters follow from "backtracking is too slow and greedy
fails" (LC 322 with coins [1,3,4] is the counterexample running through the whole course);
maths and strings close the gaps at the end.

**Greedy sits immediately before DP on purpose**: it sets up the "greedy breaks ⇒ DP
catches it" narrative, and problems such as 53 / 122 / 322 are taught from both angles
(lc.md rule 2).

**Boundary with DataData**: two pointers and sliding window (arrays), monotonic stack
(stacks), DFS/BFS on trees (binary trees), heaps and top-K (heaps), topological sort,
Dijkstra and union-find (graphs) all belong to DataData. This course covers only
algorithms that do not depend on one particular data structure. Refer to DataData in
**plain text only** (for example "DataData · 04 stacks") — no hyperlinks, since neither
site has a fixed deployment URL yet.

## Stack and commands

- Next.js 15 (App Router) + React 19 + TypeScript, **plain CSS, no Tailwind**.
- **The machine's default Node 16 cannot run this.** Prefix every command with:
  `export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"`
- Build check: `npm run build`. When several chapters are being written in parallel,
  **do not each run a build** (they fight over `.next`) — use
  `npx tsc --noEmit --incremental false` instead.
- Preview: configured in `.claude/launch.json` (autoPort, base port 3200).

## File layout and ownership

```
app/globals.css        Site-wide design system (incl. §10.5 algviz, §10.6 race styles)
                       — chapter authors MUST NOT edit
app/layout.tsx         Shell (sidebar / toolbar / cmdk / aurora) — do not edit
lib/kit.tsx lib/code.tsx lib/quiz.tsx lib/problems.tsx lib/stepper.tsx
lib/highlight.tsx lib/progress.tsx lib/algviz.tsx lib/curriculum.ts
lib/race.tsx lib/race-sorts.tsx lib/i18n.tsx           shared libraries — do not edit
app/<ch>/page.tsx      Chapter page ("use client", data + composition)
app/<ch>/viz.tsx       Visualisations specific to this chapter
app/<ch>/chapter.css   Styles specific to this chapter. page.tsx MUST
                       `import "./chapter.css"` — forgetting it silently kills the
                       chapter's styling and collapses SVGs to zero width (a trap
                       DataData already fell into)
lib/<ch>-data.tsx      This chapter's PROBLEMS list + QUIZ data
```

Each chapter's palette comes from `<main className="page" data-ch="<chapter id>">`
automatically; the hues are registered in the `[data-ch=…]` block of globals.css and are
all in place — leave them alone. The brand colour is amber-gold (hue 62), distinct from
DataData's purple. localStorage keys are prefixed `aa-`.

## Component contracts (shared library API — use exactly this)

### lib/kit.tsx
- `<Hero ch="dp" title={…} essence={…} chips={[{id:"why",n:"01",label:…},…]} />`
- `<Section id="ops" index="03" title=… desc=… badge={<span className="chip">…</span>}>`
  (scroll fade-in is built in)
- `<Callout tone="idea|warn|deep|story|win" title=…>{<p>…</p>}</Callout>`
- `<BigO o="1|logn|n|nlogn|n2|2n" label="optional override" />`
- `<KeyPoints points={[…]} />`, `<ChapterFooter ch="dp" />`, `<Reveal delay={120}>…</Reveal>`

All text-bearing props take `Loc<T>` — pass `{ en, zh }`.

### lib/code.tsx
- `<CodeBlock lang="java|python|js" code={string} title? hl?={[line numbers]} note?={ReactNode} />`
- `<CodeTabs title="filename without extension" java={{code, note?, hl?}} python={…} js={…} />`
  — switching a tab updates the site-wide language preference (the toolbar can switch it
  too). **All three languages are mandatory.**

### lib/stepper.tsx (frame-by-frame playback)
- `ArrayFrame = { cells: {v, state?: "lit"|"ok"|"bad"|"ghost"}[], ptrs?: {i,label}[], msg }`
- `<ArrayStepper title frames cellW? />`. For a custom animation use
  `useStepper(total, intervalMs?)` + `<StepControls stepper={s} step={s.step} total={n} />`
  + the `.viz` / `.viz-stage` / `.viz-msg` / `.viz-ctl` classes.
- `useEdgeFade()` fades the edge of a horizontally scrollable stage so "there is more to
  the right" is visible rather than looking like a hard cut.

### lib/algviz.tsx (the three signature players — use them whenever they fit)
- **DPTable** (DP table filler):
  `DPFrame = { cells: DPCell[][], msg }`, `DPCell = { v, state?: "cur"|"src"|"done"|"ghost"|"ok"|"bad" }`
  `<DPTable title frames colLabels? rowLabels? cornerLabel? cellW? />`
  A frame is a snapshot of the whole table. The current cell is `cur` (accent); the cell
  the value came from **must** be marked `src` (blue dashed). A 1-D table is one row.
  Write a frame generator (see `climbCells` / `pathCells` in app/dp/page.tsx) rather than
  hand-copying dozens of snapshots.
- **TreePlayer** (recursion / backtracking decision tree):
  Nodes are declared once as `TreeNodeSpec = { id, label, parent?, w? }`; a frame only
  carries state: `TreeFrame = { states: Record<id, "cur"|"path"|"done"|"dead"|"sol"|"memo">, msg }`
  (anything not listed is a ghost node, not yet visited).
  `<TreePlayer title nodes frames nodeW? gapX? gapY? legend? />`
  Layout is automatic (leaves in pre-order fix the x positions) and node width is
  estimated from the label, so long labels do not overflow their box. Use `dead` for
  pruned or abandoned branches (grey, struck through) and `memo` for a cache hit (blue).
- **RangeShrink** (candidate-range narrowing, for binary search on the answer and greedy
  elimination): `RangeFrame = { lo, hi, probe?, verdict?: "ok"|"no", answer?, msg }`
  `<RangeShrink title min max frames unit? cellW? />` (keep the value range ≤ 20 wide so
  it stays readable).

### lib/race.tsx + lib/race-sorts.tsx (algorithm race — turning Big-O into a real bill)

Feed one identical input to two or three algorithms and measure **comparisons, moves and
extra space** side by side. Bars normalise per row, the best in each row is flagged, and a
row where everyone ties turns neutral grey (so equal scores are not misread as maxed out).
A verdict line underneath explains the numbers. This is the one component on the site that
argues with data instead of intuition.

- `<AlgoRace title algos inputs sizes clone metrics? defaultInput? defaultSize? opCap? verdict? unitLabel? />`
- `RaceAlgo<I> = { id, name, note?, time (a BigO tier), space, run(input, t: Tracer) }`
- `RaceInput<I> = { id, label, make(n, seed), hint? }` — same seed gives exactly the same
  input, so results are reproducible
- `Tracer`: `t.cmp()` a comparison, `t.mov(n)` array writes (a swap counts as 2),
  `t.alloc/free(n)` auxiliary cells, `t.enter/exit()` recursion frames. `space` is the
  simultaneous peak of cells + frames.
- `verdict: (results, {size, inputId}) => Loc<ReactNode>` — **the verdict must explain the
  why using the measured numbers**, and must say plainly where the opponent wins.
- For non-sorting problems relabel the metrics via `metrics` (cmp → "function calls" or
  "multiplications"). **If a metric has no honest meaning, do not display it** — `metrics`
  is an array, two entries is fine.
- Sorting contenders and input shapes live in `lib/race-sorts.tsx`:
  `BUBBLE / SELECTION / INSERTION / MERGE / QUICK_LAST / QUICK_RANDOM`, `SHAPES`
  (random / nearly sorted / already sorted / reversed / many duplicates), `cloneArr`.
- **A newly instrumented algorithm must be verified with node before it ships** (extract
  the implementation, strip the TypeScript types, assert correctness and cross-check the
  counts against closed-form formulas). The numbers are this component's whole reason to
  exist. Implementations stay deliberately textbook-plain — no sneaky adaptive
  optimisations, because "merge sort pays full price on a sorted array" is exactly the
  lesson.
- Styles live in globals.css §10.6 under `.race-*`; the outer shell reuses `.viz`.

### lib/quiz.tsx
- `<Quiz ch="dp" items={QuizItem[]} />`; question types choice / multi / fill (same
  contract as DataData). **Generic feedback is banned** ("that is incorrect" is not
  acceptable) — every wrong option needs its own explanation of what specifically is wrong.
- A fill item's `answers` are compared ignoring case, spaces and full-width forms (NFKC),
  so 「O（n）」 typed with a Chinese input method matches O(n); 「。」 reads as "." and 「、」
  as either "," or "/". List the English and the Chinese spellings of an answer; after three
  misses the reader is shown the first one written in their language.

### lib/problems.tsx
- `<ProblemSet ch="dp" items={Problem[]} />`
- `Problem = { lc, title, d:"easy"|"medium"|"hard", tags, hint: one line pointing at the
  idea without spoiling it, key: a paragraph that fully explains the best solution }`

## Content standard (every chapter needs all of this)

1. **§01 why this exists**: a pain-point story (why brute force fails) + an intuitive
   analogy + a card of the rules or properties.
2. **§02 the core idea, taken apart**: with a frame-by-frame visualisation (one of the
   three players, or a custom one) that makes *the decision process* visible.
3. **§03 template and correctness**: template code (CodeTabs, three languages) plus **why
   it is correct** (invariant, exchange argument, induction).
4. **§04+ problem types, one at a time**: each type = a seed problem + variations,
   following lc.md's "seed problem + 1–3 variations" rule.
5. **3–4 LeetCode deep dives**, each one: what the problem asks → brute force → why it can
   be improved → frame-by-frame animation → solutions in three languages (with `hl`
   highlighted lines) → complexity → interview follow-ups (including the variation chain).
6. **Same problem, several models** (lc.md rule 2 names 23 / 37 / 122 / 200 / 215 / 264 /
   322 / 718): model it one way in one chapter and another way elsewhere, and
   cross-reference the two (322 is min-DP in chapter 07 and unbounded knapsack in 08).
7. **A problem set of 8–16 items**, easy to hard, tagged by technique; a problem already
   taught elsewhere gets the tag "review".
8. **A quiz of 6–8 questions**, mixed types, with targeted feedback on every wrong option.
9. **KeyPoints** (5–7 items, key phrases in bold) + `<ChapterFooter />`.
10. Callouts throughout: `deep` for engineering reality (where this algorithm actually
    runs in production), `warn` for common mistakes, `story` for history and anecdotes,
    `win` for interview phrasing and follow-ups.

Tone: teach it the way you would explain it to a sharp friend, without talking down or
posturing. Every number and every conclusion must be able to answer "why". The reference
chapter is **app/dp/** (page.tsx on the order of 1000+ lines).

## Chapter CSS rules

All CSS is global. Custom classes in `app/<ch>/chapter.css` **must carry a chapter prefix**
(`.srt-*` for sorting, `.bt-*` for backtracking, and so on) or be wrapped in a
`[data-ch="<id>"]` selector.

Colours must always come from tokens: `var(--acc) --acc-soft --acc-border --acc-ink
--acc-glow --ok --warn --risk --info --text-2 --border` and friends, so light and dark
themes adapt automatically. Never hard-code a colour. The slider layout class
`.bigo-slider` lives in home.css — chapters should not use it, write your own in
chapter.css.

**Design-system scales (added in the 2026-07 refinement; prefer these over hard-coded
values):**

- Radii: `--r-xs` (7) `--r-sm` (10) `--r-md` (14) `--r-lg` (18) `--r-xl` (24). Cards and
  visualisations use `--r-lg` / `--r-xl`, buttons and small controls `--r-sm`, cells and
  badges `--r-xs`–`--r-sm`.
- Shadows: `--shadow-1` (light) `--shadow-2` (card) `--shadow-3` (overlay); glows
  `--glow-sm/-md/-lg` (they follow the chapter colour). Glass top highlight `--hi`
  (strong) and `--hi-soft` (subtle); gradient stroke `--edge`; soft accent gradient base
  `--grad-soft`; very faint accent `--acc-faint`.
- Card material convention: `box-shadow: var(--hi-soft), var(--shadow-1)`; on hover swap in
  `var(--glow-lg)` or `--glow-md`.
- Give measured numbers `font-variant-numeric: tabular-nums` so columns line up.

## Prose style (important, applies site-wide)

**Register: the clear statement of a textbook or a good piece of technical writing.
Accessible does not mean chatty.** Being understandable to a beginner is the goal, but the
voice stays professional, composed and concise.

- **Banned in Chinese copy**: internet slang and memes (「翻车」「离谱」「一把梭」
  「说白了」「香」「完全体」「正确姿势」「甩锅」「手一抖」「玩完了」「没毛病」「血赚」
  「天花板」), gaming / anime / fandom vocabulary (「大招」「名场面」「官配」「装备栏」
  「段位」), cutesy particles (「啦」「呀」「嘛」「~」), vaudeville self-questioning
  (「你猜怎么着」「好问题」「其实吧」), and jokes at the reader's expense
  (「你会哭」「用户怕是要报警」).
- **Equally banned, the AI register**: 「值得注意的是」「综上所述」「让我们深入探讨」
  「赋能」, and in English "it is worth noting that", "in conclusion", "let us dive deep",
  "leverage" as a verb.
- **Keep and encourage**: plain explanations aimed at beginners and well-chosen everyday
  analogies (a stack of plates for a stack, numbered lockers for an array, ordering in a
  restaurant for an API). The analogy itself is a good thing — the problem is only ever a
  flippant delivery. Keep the metaphor grounded.
- Use exclamation marks sparingly. Emphasis comes from bold text and word choice, not
  punctuation.
- No decorative emoji in card titles or section headings. Only functional marks such as
  ✓ ✕ → ★.
- The same rules apply to code comments. No first-person anthropomorphising.
- On a term's first appearance give both Chinese and English (「哈希表(hash table)」);
  afterwards the common form is enough.
- Sentences may be short, but they must be complete and accurate.

## JSX copy notes

- In Chinese copy use the Chinese quotation marks 「」 and "" directly; do not escape
  English quotes.
- Less-than and greater-than must be written `&lt;` and `&gt;` (for example sum &lt; target).
- The `code` passed to CodeTabs is a template literal, so escape any backticks inside it.
  Chinese comments inside that teaching code are fine and expected, and the English and
  Chinese versions must keep identical executable lines and identical line counts, so `hl`
  points at the right row in both.

## Chapter blueprints (the delivered structure; problem allocation follows this so
chapters do not collide)

> General requirements are in "Content standard". "(extra)" marks a classic problem added
> beyond lc.md; "(review)" marks a problem taught mainly in another chapter.

- **01 sorting**: the three O(n²) sorts (bubble / selection / insertion) → merge sort
  (divide and conquer's first appearance) → quicksort (partition frame by frame,
  randomisation) → counting / bucket / radix (breaking the comparison bound) → stability →
  what the built-in sort really is in all three languages (Timsort, dual-pivot quicksort)
  → quickselect. Plus **§05 the algorithm race** (three races: the O(n²) siblings, across
  families, and what one line of randomisation buys).
  Visualisations: custom bar-chart sorting stepper + partition ArrayStepper + AlgoRace.
  Deep dives: 912 (extra, merge and quick), 215 (quickselect vs heap), 56 merge intervals.
  Problems: 912 (extra) 88 75 (extra) 56 179 215 148 1365 1356.
- **02 divide and conquer**: the three steps → cost via the recursion tree (the master
  theorem, intuitively) → fast power (plus an AlgoRace: naive chaining vs recursive vs
  iterative) → merging k lists (23) → inversion counting (LCR 170) → 53 from the
  divide-and-conquer angle (contrast with DP in chapter 07) → the Karatsuba story.
  Visualisations: TreePlayer (the 3^13 fast-power tree), layered merge diagram.
  Deep dives: 50 Pow, 23 merge k lists (lc.md rule 2), 53 (divide and conquer view).
  Problems: 50 23 53 169 215 (review) 148 (review) 4 (optional).
- **03 binary search in depth**: template review (704 / 35) → boundaries with 34
  (lower/upper_bound) → the two-segment property: rotated 33 / 81 / 153 / 154, peaks
  162 / 852 → matrices 74 / 240 → **binary search on the answer** (875 (extra) / 410 /
  1011 (extra) / 69 / 367), the centrepiece of the chapter. §01 also carries an AlgoRace
  of linear scan vs binary search.
  Visualisations: RangeShrink as the lead (875 narrowing frame by frame) + ArrayStepper for
  rotated arrays.
  Deep dives: 34 (boundaries), 33 (rotated), 875 (extra, search on the answer).
  Problems: 704 (review) 35 34 69 367 278 852 162 33 81 153 74 240 410 1011 (extra) 4 (optional).
- **04 bit manipulation**: binary and two's complement → the six operators → the trick
  table (n&(n-1), lowbit, XOR properties) → **using bits as a set** (the prerequisite for
  bitmask DP: enumerating subsets) → shifting for multiply and divide.
  Visualisations: an interactive lab of 32 bit lamps, XOR cancellation ArrayStepper.
  Deep dives: 136 (extra, XOR), 191 (extra, n&(n-1)), 137 (counting bit by bit).
  Problems: 136 (extra) 191 (extra) 231 268 461 190 (extra) 137 260 318 1356 (review) 67.
- **05 backtracking**: the decision-tree mental model → the three questions of the template
  (path, choice list, stopping condition) → combinations 77 / 216 / 17 / 39 / 40 →
  partitioning 131 / 93 → subsets 78 / 90 / 491 → permutations 46 / 47 → the two
  deduplication techniques (across a level vs along a branch, named in lc.md) → boards
  51 / 37 (37's bitmask version is the advanced take, rule 2) → pruning.
  Visualisations: TreePlayer as the lead (77's tree frame by frame with pruned branches
  going grey, 46's `used` array).
  Deep dives: 77 (combinations + pruning), 78 (subsets), 46 (permutations), 51 (N queens,
  custom board visualisation).
  Problems: 77 216 17 39 40 131 93 78 90 491 46 47 51 37 22 (extra).
- **06 greedy**: the greedy-choice property and the exchange argument (introduced with
  455) → sequences 376 / 53 (review) / 122 (greedy and DP side by side, rule 2) → jumping
  55 / 45 → simulation 134 / 135 / 860 / 406 → interval greedy 452 / 435 / 763 / 56
  (review) → developing a sense for counterexamples (foreshadowing 322) → how to tell
  greedy from DP.
  Visualisations: custom interval timeline (435, picking and discarding after sorting),
  jump-range ArrayStepper.
  Deep dives: 455 (exchange argument), 45 (jumping), 435 (intervals).
  Problems: 455 860 376 122 55 45 134 135 406 452 435 763 738 (optional) 1005 (optional)
  402 968 (optional).
- **07 dp** — the reference chapter, already complete; do not rewrite it. §02 also carries
  an AlgoRace of naive fib vs memoised vs tabulated.
- **08 knapsack**: 0/1 knapsack → the two-dimensional table → rolling to one dimension
  (**why the loop runs backwards**, with a frame-by-frame comparison of what goes wrong
  forwards) → "can it be filled" 416 / 1049 → counting 494 (the same problem as
  backtracking and as knapsack) → two constraints 474 → unbounded knapsack (why forwards
  this time) → 322 (review, as unbounded knapsack, rule 2) / 279 / 518 / 139 →
  permutations vs combinations (377 vs 518, which loop goes outside) → bounded knapsack.
  Visualisations: DPTable as the lead (the 2-D table plus a forwards/backwards rolling
  comparison).
  Deep dives: 416, 494, 518 vs 377 (taught as a pair).
  Problems: 416 1049 494 474 322 (review) 518 279 139 377.
- **09 subsequence DP**: subsequence vs subarray → LIS 300 (n² → the greedy + binary search
  n log n idea) / 673 → contiguous 718 → two sequences, LCS 1143 (contrast the state
  definitions of 718 and 1143, lc.md rule 2) → edit distance 72 → palindromes 647 (extra) /
  516 / 5 → a note on 132.
  Visualisations: DPTable on two sequences (1143 cell by cell, the diagonal transition
  highlighted).
  Deep dives: 300, 1143, 72.
  Problems: 300 673 718 1143 72 516 5 647 (extra) 132 392 (extra).
- **10 advanced DP**: state-machine DP (the stock family 121 (review) → 122 (review) → 123
  → 309 → 714, drawn as a transition diagram) → DP on trees (337 / 968 (review) / 543) →
  interval DP (516 (review) → 312 (extra, burst balloons)) → bitmask DP (reviewing chapter
  04, with 526 (extra) as the entry point) → a one-line map of digit DP and probability DP.
  Visualisations: custom state-machine SVG, TreePlayer for tree DP, DPTable for interval DP
  (filled diagonally, by increasing span).
  Deep dives: 309 (state machine), 337 (trees), 312 (intervals).
  Problems: 122 123 309 714 337 543 968 516 (review) 312 (extra) 264 174 (optional) 526 (extra).
- **11 maths and number theory**: overflow and modular arithmetic (10⁹+7) → gcd by the
  Euclidean algorithm → primes and the sieve of Eratosthenes (204, extra) → fast power
  (review) → Boyer-Moore majority vote 169 → next permutation 31 → games and invariants
  292 / 1025 / 319 → happy numbers 202 (cycle detection).
  Visualisations: animated sieve grid, interactive Nim.
  Deep dives: 169 (majority vote), 292 (invariants), 204 (extra, the sieve).
  Problems: 202 7 9 50 (review) 69 (review) 169 31 292 1025 319 204 (extra) 43 67 (review).
- **12 string algorithms**: why naive matching is slow → the intuition behind the prefix
  function (a failure is information) → building KMP's next array frame by frame, then
  matching → 459 (a neat use of next) → Rabin-Karp rolling hash (a second solution to 28)
  → palindromes: 5 by expanding around a centre → Manacher as a concept (no need to
  implement) → parsing problems 205 / 8.
  Visualisations: the next-array construction (two-row ArrayStepper), rolling-hash window
  updates.
  Deep dives: 28 (KMP and Rabin-Karp, rule 2), 459, 5.
  Problems: 28 459 5 (review) 205 8 796 (extra) 214 (optional).
- **✦ atlas, the finale**: a paradigm-selection decision tree (an interactive wizard: you
  see a problem → what do you ask → which light comes on) → the full problem table for the
  whole course (pids stay `<ch>/<lc>` so progress is shared) → lc.md's 20-week plan → a
  mock-interview guide (timing, thinking aloud, D+1 / D+7 / D+21 review) → the
  DataData × AlgoAlgo panorama.

## GitHub and other notes

- The repo is `renrenmimi/AlgoAlgo` on GitHub, default branch `main`. Work on a branch,
  open a PR, and merge it — do not push straight to `main`. Commit and push only when the
  user asks.
- Commit messages, PR titles and bodies are **English** (see "Language policy").
- Reference projects: `../DataData` (the shell and the quality bar), `../SYSDesigner`,
  `../AgentLab` — read only, do not modify.
- `lc.md` is the raw source material, read only. Note that it is derived from two paid
  bootcamps, so treat it as third-party material.
