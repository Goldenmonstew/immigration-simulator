# 任务 22：欢迎页横幅加高优先级，存档状态行不再位移（负责：Codex gpt-6.2-astra；Fable 验收）

## 背景

- 用户 2026-11-18 指定本任务由 Codex 实现。这是 `AGENTS.md`"Codex 只审核"的例外，只限本任务。你的沙箱不能写 `.git`：不要 `git add` / `commit` / `push`，改完由 Fable 提交。
- 见 `docs/research/2026-11-16-mobile-performance.md` 最后两节。正式站游戏页手机 Lighthouse（13.6.0）默认测法已到 98–99 分，还剩两处：
  1. **横幅优先级。** LCP 是欢迎页的小镇横幅：`apps/web/app/game/welcome.tsx` 里的 `townBanner` div，CSS 背景图 `/game/assets/meadow-town/town-banner.png`（8 KB）。
     - `lcp-discovery-insight` 里"请求在初始文档里"已通过，"fetchpriority=high"没通过。
     - 背景图不能直接加 `fetchpriority`。Lighthouse 也认 preload 请求上的这个提示：trace_engine 的 `LCPDiscovery.js` 看 LCP 请求的 `fetchPriorityHint`，请求来自 preload 时，提示文字是"fetchpriority=high should be applied to the image preload request"。
  2. **存档状态行位移。** 实际限速（`--throttling-method=devtools`）下 CLS 是 0.051。Lighthouse 列出的唯一位移元素是 `game-client.tsx` 末尾的存档状态行 `p.saveStatus`，它最终在 top 1984 px，在手机首屏（823 px 高）之外。
     - 推测的原因：`GameClient` 在 `!ready` 时只渲染较矮的 `WelcomeLoading`，存档状态行和免责声明紧跟在后面，落在首屏内。`ready` 后换成更高的 `CharacterSelect`，这两行被推到首屏外，就算一次位移。
     - 静态 HTML（`page.tsx` 的 `GameLoading`）里本来就没有这两行。
     - `!ready` 时 `available` 还是初始值 `true`，所以状态行会提前显示"已保存在此浏览器"。

## 目标

1. 横幅图片的请求带 `fetchpriority=high`，并且仍能在初始 HTML 里发现。
2. 游戏页加载过程中，存档状态行不再在首屏内被推开。

## 必读

- `AGENTS.md`；
- `apps/web/app/game/` 下的 `welcome.tsx`、`page.tsx`、`game-client.tsx`、`character-select.tsx`、`art.ts`、`game.module.css`；
- `apps/e2e/tests/game.spec.ts` 里的 "the static page already has the welcome banner"；
- `apps/web/test/` 下与游戏客户端相关的测试和 `game-client-harness.tsx`。

## 要做

1. **横幅预加载。**
   - 在 `WelcomeIntro` 里用 React 19 的 `preload()`（从 `react-dom` 导入）预加载横幅，参数为 `as: 'image'`、`fetchPriority: 'high'`。目标是导出的 `/game` 静态 HTML 的 `<head>` 里带上对应的 `<link rel="preload">`。
   - 横幅仍用现有的 CSS 背景图，样子不变。
   - 如果你判断这条路走不通，换成别的最简单做法，并在报告里说明理由。
2. **存档状态行。**
   - 先读代码，确认上面推测的原因是否成立。不成立就在报告里写清实际原因，再按实际原因改。
   - 建议改法：`!ready` 期间（包括首次加载，和选角后加载剧情时）不渲染存档状态行和免责声明，就绪后再显示。也可以用同样简单、能消除这次位移的其他做法。
   - 就绪后这两行的内容、顺序和样式都不变。
3. **测试。**
   - 扩展 e2e "the static page already has the welcome banner"：断言 `<head>` 里有横幅的 preload，并带高优先级。属性名的大小写按实际导出的 HTML 写。
   - 加一条 web 单测：`!ready` 时不渲染存档状态行，就绪后渲染。用现有 harness，写法越简单越好。
   - 现有测试全部通过。

## 不做

- 不改横幅图片、CSS 和尺寸，不改其他页面。
- 不加依赖，不改构建配置，不加校验脚本。
- 不改性能文档和 `PROGRESS.md`：Fable 测完 Lighthouse 后再写。
- 不碰性能文档里写为"未验证"的两项：本地与正式站 LCP 降幅的差别，以及 LCP 审计缺 DOM 节点详情。

## 验收

Fable 会逐项复核。

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 通过。
- 构建后，`apps/web/out/game.html` 的 `<head>` 里有横幅的 preload，并带高优先级；其他页面（例如 `apps/web/out/index.html`）没有。
- 你的沙箱没有可用的浏览器：不跑 e2e，不截图。以下由 Fable 做：
  - e2e；
  - 桌面和手机宽度走查，包括选角后加载剧情期间的画面；
  - 本地 Lighthouse，模拟限速和实际限速各测 2 次。要求 `priorityHinted` 通过，`layout-shifts` 里不再出现存档状态行。

## 报告

按 `AGENTS.md` 四段写入 `docs/tasks/reports/22-banner-priority-cls.md`。"做了什么"里按你建议的 commit 分组列出文件，例如横幅预加载一组、存档状态行一组。

## 第 2 轮：按审核修正（2026-11-18）

gpt-6.2-sol 只读审核了 PR #10，审核全文见 `/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t22/review.md`。预加载部分可以保留。下面两项请修正，其余约束同上（不加依赖，不改构建配置，不过度工程化，不碰 `.git`，不改性能文档和 `PROGRESS.md`）。

1. **必须改：存档状态的播报节点要一直在。**
   - 现状：`ready` 变为 `true` 时，`role="status"` 节点和文案在同一次渲染中插入。读屏器可能漏播这次更新，例如首次读取存档失败时的"存储不可用"（`game.storageUnavailable`）。
   - 改法：`GameClient` 始终渲染同一个 `role="status"` 节点；未就绪时内容为空、不占布局空间，就绪后再填入文案。免责声明仍只在 `ready` 后渲染。
   - 让空节点不占空间，用最简单的做法，例如 CSS `.saveStatus:empty { margin: 0; }`。不能因此恢复原来的位移：未就绪时这个节点的高度和外边距都应为 0。
2. **补测试。**
   - 扩展本轮新加的单测：未就绪时 HTML 里有空的 `role="status"` 节点、没有存档文案；就绪后同一节点里有文案。
   - 最后一步改用现有的 `TownCanvas` props 断言，确认所选角色确实进入了游戏，而不只是两行文字重新出现。
   - 加一条：存储不可用时，就绪后状态节点里是 `game.storageUnavailable` 的文案。复用 `game-page.test.tsx` 里已有的存储不可用写法。

验收同上：`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 通过。在 `docs/tasks/reports/22-banner-priority-cls.md` 末尾追加"第 2 轮"一节，写明改了哪些文件、怎么验证的；Fable 写的验收一节不要改。
