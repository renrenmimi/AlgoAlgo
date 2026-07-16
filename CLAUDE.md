# CLAUDE.md — AlgoAlgo · 看得见的算法

新会话先读完这份文件再动手。

## 这是什么

**AlgoAlgo(看得见的算法)**:面向零基础学习者的交互式算法课程网站,
**DataData(../DataData,看得见的数据结构)的姊妹篇** —— 同一套外壳与设计语言。
承诺:**学完这一套课,不需要再从任何别的渠道学算法。**
数据结构画「形状」,算法画「决策与状态的演进」:决策树逐步展开、DP 表逐格填充、
候选区间逐步收窄。内容底料是根目录 `lc.md`(两套训练营合并后的 270 题分级清单,
A 主线/B 进阶/C 选做),但学习路径按本文件「课程结构」执行。

目标受众下限:**刚会写 hello world 的完全新手**(默认已学过 DataData 的基础结构章)。
- 每个结论必须给「为什么」,不许只给结论;
- 比喻先行,再上术语;术语第一次出现时中文+英文双写;
- 递归是全书地基,序章 §03 专门教过(调用栈/基准情形/递归信任),后续章节可引用。

## 课程结构(14 页,由易到难)与排序依据

`lib/curriculum.ts` 是唯一的章节注册表(路由/编号/主题色相/难度/标签)。

序章(/)算法思维+递归+四大范式 → 01 排序 → 02 分治 → 03 二分进阶 →
04 位运算 → 05 回溯 → 06 贪心 → 07 DP 入门 → 08 背包 → 09 子序列 DP →
10 DP 进阶 → 11 数学与数论 → 12 字符串算法 → ✦ 终章 范式选型地图。

排序依据(综合 lc.md 20 周表、NeetCode Roadmap、LeetCode 官方 Study Plan、
代码随想录主线):排序/分治先立「递归+分而治之」地基;二分练「单调性砍半」;
位运算轻量工具课、为状压 DP 铺路;回溯把递归树画出来;贪心学「敢贪的证明」;
DP 四章承接「回溯太慢、贪心失灵」(322 硬币 [1,3,4] 是贯穿的贪心反例);
数学/字符串殿后查漏。**贪心紧贴在 DP 之前**是刻意设计:形成
「贪心失效 ⇒ DP 兜底」的叙事,且 53/122/322 等题两种视角都讲(lc.md 规则 2)。

**与 DataData 的边界**:双指针/滑窗(数组)、单调栈(栈)、树上 DFS/BFS(二叉树)、
堆与 Top-K(堆)、拓扑排序/Dijkstra/并查集(图)归 DataData;本课只做
「不依附特定结构的纯算法」。引用 DataData 时**只用纯文字**(如「DataData · 04 栈」),
不做超链接(两站部署地址未定)。

## 技术栈与命令

- Next.js 15(App Router)+ React 19 + TypeScript,**纯 CSS 无 Tailwind**。
- **本机默认 Node 16 跑不动**,一切命令加:
  `export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"`
- 构建验证:`npm run build`;并行写章节时**不要各自跑 build**(.next 冲突),
  用 `npx tsc --noEmit --incremental false` 做类型检查。
- 预览:`.claude/launch.json` 已配置(autoPort,基准端口 3200)。

## 文件布局与所有权

```
app/globals.css        全站设计系统(含 10.5 节 algviz 样式)—— 章节作者【禁止改】
app/layout.tsx         外壳(sidebar/toolbar/cmdk/aurora)—— 禁止改
lib/kit.tsx lib/code.tsx lib/quiz.tsx lib/problems.tsx lib/stepper.tsx
lib/highlight.tsx lib/progress.tsx lib/algviz.tsx lib/curriculum.ts  共享库 —— 禁止改
app/<ch>/page.tsx      章节主页面("use client",数据+组合)
app/<ch>/viz.tsx       本章专属可视化组件
app/<ch>/chapter.css   本章专属样式(page.tsx 里【必须】import "./chapter.css",
                       漏了会导致整章样式静默失效、SVG 塌成 0 宽 —— DataData 踩过的坑)
lib/<ch>-data.tsx      本章题单 PROBLEMS + 测验 QUIZ 数据
```

每章配色由 `<main className="page" data-ch="<章节id>">` 自动生效
(色相注册在 globals.css 的 `[data-ch=…]` 段,已全部就位,勿动)。
品牌主色为琥珀金(hue 62),区别于 DataData 的紫;localStorage 键前缀 `aa-`。

## 组件契约(共享库 API,按此使用)

### lib/kit.tsx
- `<Hero ch="dp" title={<>动态规划 <span className="grad">DP</span></>} essence={<>…</>} chips={[{id:"why",n:"01",label:"直觉"},…]} />`
- `<Section id="ops" index="03" title="…" desc="…" badge={<span className="chip">…</span>}>{children}</Section>`(自带滚动淡入)
- `<Callout tone="idea|warn|deep|story|win" title="…">{<p>…</p>}</Callout>`
- `<BigO o="1|logn|n|nlogn|n2|2n" label="可选覆盖文字" />`
- `<KeyPoints points={[<>…</>, …]} />`、`<ChapterFooter ch="dp" />`、`<Reveal delay={120}>…</Reveal>`

### lib/code.tsx
- `<CodeBlock lang="java|python|js" code={string} title? hl?={[行号]} note?={ReactNode} />`
- `<CodeTabs title="文件名不带后缀" java={{code, note?, hl?}} python={…} js={…} />`
  —— 切 tab 联动全站偏好语言(顶栏也能切),**三个语言都必须写**。

### lib/stepper.tsx(逐帧慢放)
- `ArrayFrame = { cells: {v, state?: "lit"|"ok"|"bad"|"ghost"}[], ptrs?: {i,label}[], msg }`
- `<ArrayStepper title frames cellW? />`;自由动画用 `useStepper(total, intervalMs?)` +
  `<StepControls stepper={s} step={s.step} total={n} />` + `.viz/.viz-stage/.viz-msg/.viz-ctl`。

### lib/algviz.tsx(算法三件套 —— 本课的招牌,能用就用)
- **DPTable**(DP 表格填充器):
  `DPFrame = { cells: DPCell[][], msg }`,`DPCell = { v, state?: "cur"|"src"|"done"|"ghost"|"ok"|"bad" }`
  `<DPTable title frames colLabels? rowLabels? cornerLabel? cellW? />`
  帧 = 整表快照;当前格 `cur`(紫),**转移来源格 `src`(蓝虚线)必须标**,一维表传一行。
  写帧生成函数(参考 app/dp/page.tsx 的 climbCells/pathCells),不要手抄几十个快照。
- **TreePlayer**(递归/回溯决策树播放器):
  节点静态注册 `TreeNodeSpec = { id, label, parent?, w? }`,
  帧只给状态 `TreeFrame = { states: Record<id, "cur"|"path"|"done"|"dead"|"sol"|"memo">, msg }`
  (未列出 = 幽灵未访问)。`<TreePlayer title nodes frames nodeW? gapX? gapY? legend? />`
  布局自动(先序叶子定 x)。剪枝/回退用 `dead`(灰+删除线),命中缓存用 `memo`(蓝)。
- **RangeShrink**(候选区间收缩器,二分答案/贪心排除):
  `RangeFrame = { lo, hi, probe?, verdict?: "ok"|"no", answer?, msg }`
  `<RangeShrink title min max frames unit? cellW? />`(值域宽度 ≤ 20 保证可读)。

### lib/quiz.tsx
- `<Quiz ch="dp" items={QuizItem[]} />`;题型 choice / multi / fill(契约同 DataData);
  **禁止通用文案**(「答案不正确」不合格),每个错误选项要针对性解释错在哪。

### lib/problems.tsx
- `<ProblemSet ch="dp" items={Problem[]} />`
- `Problem = { lc, title, d:"easy"|"medium"|"hard", tags, hint:一句话方向不剧透, key:一段话讲透最优解 }`

## 内容标准(每章必须全部具备)

1. **§01 为什么需要它**:痛点故事引入(暴力为什么不行)+ 直觉类比 + 规则/特性卡。
2. **§02 核心思想拆解**:配逐帧可视化(algviz 三件套或自建),让「决策过程」可见。
3. **§03 模板与正确性**:模板代码(CodeTabs 三语言)+ **为什么对**(不变量/交换论证/归纳)。
4. **§04+ 题型分类推进**:每类 = 种子题 + 变式,遵循 lc.md「种子题 + 1~3 变式」规则。
5. **LeetCode 精讲 3~4 道**,每道 = 题意 → 暴力 → 为什么能优化 → 逐帧动画 →
   三语言题解(带高亮行 hl)→ 复杂度 → 面试追问(含变式链)。
6. **同题多解**(lc.md 规则 2 点名的 23/37/122/200/215/264/322/718):在两处各讲一种
   建模,并互相引用(如 322 在 07 章讲 min-DP、08 章讲完全背包)。
7. **高频题单 8~16 题**,由易到难,tags 标套路;复盘题(在别章讲过)标 tag「复盘」。
8. **通关测验 6~8 题**,混合题型,每个错误选项针对性纠错。
9. **KeyPoints**(5~7 条,有加粗重点)+ `<ChapterFooter />`。
10. 穿插 Callout:`deep` 工程现场(该算法在真实系统里的应用)、`warn` 常见误区、
    `story` 历史/趣闻、`win` 面试话术与追问。

语气:中文为主,术语中英双写;像给聪明的朋友讲课,不端着;
每个数字/结论都要能回答「为什么」。样板章 = **app/dp/**(page 1000+ 行量级)。

## 章节 CSS 规则

所有 CSS 都是全局的!`app/<ch>/chapter.css` 里的自定义类**必须带章节前缀**
(如排序章 `.srt-*`、回溯章 `.bt-*`),或整体套在 `[data-ch="<id>"]` 选择器下。
颜色一律用 token:`var(--acc) --acc-soft --acc-border --acc-ink --acc-glow
--ok --warn --risk --info --text-2 --border` 等,深浅主题自动适配,禁止写死颜色。
滑杆排版类 `.bigo-slider` 在 home.css(章节别用,自己在 chapter.css 里写)。

## JSX 文案注意

- 正文引号直接用中文「」和"",不要转义英文引号;
- 小于/大于号必须写 `&lt; &gt;`(如 sum &lt; target);
- CodeTabs 的 code 用模板字符串,内部反引号要转义;代码中文注释没问题。

## 阶段二章节蓝图(题目分配以此为准,避免撞题)

> 通用要求见「内容标准」。「(补)」= lc.md 之外补充的经典题;「(盘)」= 别章主讲、本章复盘。

- **01 sorting 排序**:O(n²) 三兄弟(冒泡/选择/插入)→ 归并(分治首秀)→ 快排
  (partition 逐帧、随机化)→ 计数/桶/基数概念(突破比较下界)→ 稳定性 →
  三语言内置 sort 真身(Timsort/双轴快排)→ 快速选择。
  可视化:自建条形图排序 stepper + partition ArrayStepper。
  精讲:912(补,归并+快排双解)、215(Quickselect vs 堆)、56 合并区间。
  题单:912(补) 88 75(补) 56 179 215 148 1365 1356。
- **02 divide 分治**:分治三步 → 递归树算复杂度(主定理直觉版)→ 快速幂 →
  归并分治(23)→ 逆序对(LCR 170 概念)→ 53 分治视角(对比 07 章 DP)→ Karatsuba 故事。
  可视化:TreePlayer(3^13 快速幂分解树)、归并分层合并图。
  精讲:50 Pow、23 合并 K 链表(归并思路,lc.md 规则 2)、53(分治视角)。
  题单:50 23 53 169 215(盘) 148(盘) 4(选做)。
- **03 binary 二分进阶**:模板复盘(704/35)→ 找边界 34(lower/upper_bound)→
  二段性:旋转 33/81/153/154、峰值 162/852 → 矩阵 74/240 → **二分答案**
  (875(补)/410/1011(补)/69/367)—— 本章重头戏。
  可视化:RangeShrink 主场(875 吃香蕉逐帧收窄)+ ArrayStepper 旋转数组。
  精讲:34(边界)、33(旋转)、875(补,二分答案)。
  题单:704(盘) 35 34 69 367 278 852 162 33 81 153 74 240 410 1011(补) 4(选做)。
- **04 bits 位运算**:二进制与补码 → 六运算符 → 技巧表(n&(n-1)、lowbit、异或性质)→
  **位运算表示集合**(状压 DP 前置:枚举子集)→ 移位乘除。
  可视化:32 盏位灯交互实验室、XOR 消消乐 ArrayStepper。
  精讲:136(补,XOR)、191(补,n&(n-1))、137(逐位统计)。
  题单:136(补) 191(补) 231 268 461 190(补) 137 260 318 1356(盘) 67。
- **05 backtrack 回溯**:决策树心智模型 → 模板三问(路径/选择列表/结束条件)→
  组合 77/216/17/39/40 → 分割 131/93 → 子集 78/90/491 → 排列 46/47 →
  去重两板斧(树层 vs 树枝,lc.md 点名)→ 棋盘 51/37(37 位运算版进阶,规则 2)→ 剪枝。
  可视化:TreePlayer 主场(77 组合树逐帧+剪枝变灰、46 排列 used 数组)。
  精讲:77(组合+剪枝)、78(子集)、46(排列)、51(N 皇后,棋盘自建 viz)。
  题单:77 216 17 39 40 131 93 78 90 491 46 47 51 37 22(补)。
- **06 greedy 贪心**:贪心选择性质与交换论证(455 引入)→ 序列 376/53(盘)/122
  (贪心 vs DP 双视角,规则 2)→ 跳跃 55/45 → 模拟 134/135/860/406 →
  区间贪心 452/435/763/56(盘)→ 反例意识(预告 322)→ 贪心 vs DP 判据。
  可视化:自建区间时间轴(435 排序后逐个选/弃)、跳跃覆盖范围 ArrayStepper。
  精讲:455(交换论证)、45(跳跃)、435(区间)。
  题单:455 860 376 122 55 45 134 135 406 452 435 763 738(选做) 1005(选做) 402 968(选做)。
- **07 dp** ✔ 已完成(样板章,勿重写)。
- **08 knapsack 背包**:0-1 背包引入 → 二维表 → 一维滚动(**为什么倒序**,逐帧对比
  正序会怎么错)→ 装满型 416/1049 → 计数型 494(回溯 vs 背包一题两吃)→
  二维费用 474 → 完全背包(为什么正序)→ 322(盘,完全背包视角,规则 2)/279/518/139 →
  排列 vs 组合(377 vs 518 内外层)→ 多重背包概念。
  可视化:DPTable 主场(0-1 二维表 + 一维滚动正序/倒序对比动画)。
  精讲:416、494、518 vs 377(对比讲)。
  题单:416 1049 494 474 322(盘) 518 279 139 377。
- **09 dp-seq 子序列 DP**:子序列 vs 子数组 → LIS 300(n² → 贪心+二分 nlogn 概念)/673 →
  连续 718 → 双序列 LCS 1143(718 vs 1143 状态定义对比,lc.md 规则 2)→
  编辑距离 72 → 回文 647(补)/516/5 → 132 提点。
  可视化:DPTable 双序列主场(1143 表格逐格,对角线转移高亮)。
  精讲:300、1143、72。
  题单:300 673 718 1143 72 516 5 647(补) 132 392(补)。
- **10 dp-pro DP 进阶**:状态机 DP(股票族谱 121(盘)→122(盘)→123→309→714,
  画状态转移图)→ 树形 DP(337/968(盘)/543)→ 区间 DP(516(盘)→312(补,戳气球))→
  状压 DP(04 章位运算复盘 + 526(补)入门)→ 数位/概率 DP 一句话地图。
  可视化:自建状态机转移图 SVG、TreePlayer 树形 DP、DPTable 区间 DP(按长度斜着填)。
  精讲:309(状态机)、337(树形)、312(区间)。
  题单:122 123 309 714 337 543 968 516(盘) 312(补) 264 174(选做) 526(补)。
- **11 math 数学与数论**:溢出与取模(10⁹+7)→ gcd 辗转相除 → 质数与埃氏筛(204 补)→
  快速幂(盘)→ 摩尔投票 169 → 下一个排列 31 → 博弈与不变量 292/1025/319 →
  快乐数 202(循环检测)。
  可视化:埃氏筛网格动画、Nim 博弈交互。
  精讲:169(摩尔投票)、292(不变量)、204(补,筛法)。
  题单:202 7 9 50(盘) 69(盘) 169 31 292 1025 319 204(补) 43 67(盘)。
- **12 strings 字符串算法**:暴力匹配为什么慢 → 前缀函数直觉(失败=情报)→
  KMP next 数组构建逐帧 + 匹配过程 → 459(next 妙用)→ Rabin-Karp 滚动哈希
  (28 第二解法)→ 回文:5 中心扩展 → Manacher 概念(不强求实现)→ 205/8 解析类。
  可视化:KMP next 构建动画(双行 ArrayStepper)、滚动哈希窗口更新。
  精讲:28(KMP + Rabin-Karp 双解,规则 2)、459、5。
  题单:28 459 5(盘) 205 8 796(补) 214(选做)。
- **✦ atlas 终章**:范式选型决策树(交互问答式向导:看到题 → 问什么 → 哪盏灯)→
  全书题单总表(pid 沿用各章 `<ch>/<lc>`,进度互通)→ lc.md 的 20 周计划表 →
  模拟面试指南(限时/口述/D+1/D+7/D+21)→ DataData × AlgoAlgo 全景图。

## GitHub / 其他

- 无 git 仓库;提交需用户明确要求。
- 参考项目:../DataData(外壳与质量基线)、../SYSDesigner、../AgentLab —— 只读,勿改。
- lc.md 是内容底料原文,只读。
