# 任务 22：欢迎页横幅优先级与存档状态行位移

## 1. 做了什么

建议由 Fable 分两次提交。

- **横幅预加载**（`apps/web/app/game/welcome.tsx`、`apps/e2e/tests/game.spec.ts`）。`WelcomeIntro` 对现有 CSS 背景图的同一 URL 调用 `preload(townBanner, { as: 'image', fetchPriority: 'high' })`。静态页 e2e 同时检查原始响应的 `<head>` 中对应链接的优先级，以及 `<main>` 中的标题和横幅。
- **存档状态行显示时机**（`apps/web/app/game/game-client.tsx`、`apps/web/test/game-client-harness.tsx`、`apps/web/test/game-character-loading.test.tsx`）。存档状态行和免责声明随 `ready` 一起显示。单测取出 harness 首次渲染的 HTML，并控制剧情加载完成的时机，覆盖首次加载、选角就绪、等待剧情、进入游戏四个状态。

## 2. 怎么验证的

- `pnpm --filter web exec vitest run test/game-character-loading.test.tsx -t 'save status and disclaimer'` 在旧实现上按预期失败，首次加载的 HTML 同时出现了加载提示和“已保存在此浏览器”。修改后运行 `pnpm --filter web exec vitest run test/game-character-loading.test.tsx`，4 条全部通过。
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码为 0。单测共 4,408 条通过，其中 web 490 条。引擎另有 1 条文案导出用例按既有环境开关跳过。
- 构建后用 `python3` 检查 `apps/web/out` 下全部 9 个 HTML 文件。仅 `game.html` 的 `<head>` 有一条横幅预加载，原文为 `<link rel="preload" href="/game/assets/meadow-town/town-banner.png" as="image" fetchPriority="high"/>`。`<main>` 中也查到了“移民生活”标题和引用同一图片的背景样式。首页在内的其余 8 个页面均无此预加载。

## 3. 没做或没验证的

e2e、桌面和手机宽度走查（含选角后等待剧情的画面）、本地 Lighthouse 留给 Fable 验收。模拟限速和实际限速各测 2 次，核对 `priorityHinted` 通过，以及 `layout-shifts` 不再列出存档状态行。提交由 Fable 完成。

## 4. 发现与建议

代码和旧实现单测证实了推测中的渲染顺序。静态占位只含欢迎内容和加载提示。客户端首次渲染时，`available` 默认是 `true`，原来两行文字已挂在较矮的加载区下方。读取存档后，上方区域才换成更高的角色列表，手机宽度下角色卡片排成一列。新单测验证了两行文字的出现时机，实际 CLS 数值以 Fable 的 Lighthouse 复测为准。

## Fable 验收（2026-11-18）

- **全仓检查**：`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 通过，web 单测 490 条；`pnpm e2e` 34 条通过。
- **构建产物**：9 个导出页面里只有 `game.html` 带横幅预加载，原文 `<link rel="preload" href="/game/assets/meadow-town/town-banner.png" as="image" fetchPriority="high"/>`；改动前的构建没有这一条。
- **浏览器走查**（本地静态服务器）：
  - 手机宽度 375：标题、横幅、角色列表正常，浏览器解析到的预加载带 `fetchpriority="high"`；开局进入小镇；刷新后"继续上次"回到小镇，存档状态行正常显示。
  - 桌面宽度：加载画面只有"正在加载小镇"，下方没有存档状态行和免责声明。
  - 控制台没有报错。
- **本地 Lighthouse 13.6.0**（改动前为 #8 的构建）：
  - 实际限速各 2 次：性能分 85 → 92，LCP 3.3 → 2.2 s，CLS 0.051 → 0，优先级提示由未通过变为通过。
  - 模拟限速各 5 次：CLS 0.051 → 0；LCP 前后都在 5.5–10.3 s 之间波动，看不出变化。
  - 改动后 `layout-shifts` 不再列出存档状态行，"LCP 请求发现"三项检查都通过。
  - 数字写入 `docs/research/2026-11-16-mobile-performance.md`。
- **没验证**：选角后加载剧情期间不显示这两行，只由单测覆盖；走查时剧情包已缓存，加载画面一闪而过。正式站结果待上线后测。

## 第 2 轮：按审核修正（2026-11-18）

### 1. 做了什么

建议 Fable 作为一次修复提交。`apps/web/app/game/game-client.tsx` 始终渲染同一个存档 `role="status"` 段落。首次加载和选角后等待剧情时，段落为空，`apps/web/app/game/game.module.css` 将空段落的外边距归零。就绪后在原段落填入存档结果，并在下一行显示免责声明。

`apps/web/test/game-character-loading.test.tsx` 覆盖这两个加载阶段和两个就绪阶段，最后从 `TownCanvas` 的 `state.characterId` 确认进入小镇的是所选角色。另加一条首次读取存储失败的用例，检查错误提示出现在存档播报节点内。

### 2. 怎么验证的

- 修改实现前，用 `pnpm --filter web exec vitest run test/game-character-loading.test.tsx -t 'the save status'` 运行两条回归用例，两条均因首次渲染缺少空播报节点而失败。修正后运行整个测试文件，5 条通过。
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码为 0。全仓单测 4,409 条通过，其中 web 491 条。引擎的 1 条文案导出测试按既有环境开关跳过。
- 用 `python3` 检查 9 个导出 HTML 的 `<head>`，只有 `game.html` 含横幅的高优先级图片预加载。用 `rg` 在构建 CSS 中确认空存档段落命中 `:empty{margin:0}`。

### 3. 没做或没验证的

本轮未实测读屏播报或浏览器布局。e2e、桌面及手机走查、Lighthouse 复测和 Git 提交由 Fable 完成。

### 4. 发现与建议

Fable 验收时可禁用浏览器存储，确认读屏器在首次读取失败后播报存储不可用，并在实际限速下核对存档状态行是否产生位移。

## Fable 复核第 2 轮（2026-11-18）

- **全仓检查**：`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 通过，web 单测 491 条；`pnpm e2e` 34 条通过。
- **禁用存储的浏览器检查**：用 Playwright 让 `localStorage` 读写都抛错，不提交到仓库。存档状态节点先以空内容出现，高度 0、上外边距 0；之后同一个节点填入"本机存储不可用"的提示，节点没有被替换。读屏器的实际播报没有实测。
- **本地 Lighthouse 复测**（第 2 轮构建）：
  - 实际限速 2 次：性能分 92、92，LCP 2.2 s，CLS 0；
  - 模拟限速 2 次：性能分 75、75，LCP 9.8–10.0 s，CLS 0；
  - 4 次的优先级提示都通过，`layout-shifts` 都为空。
