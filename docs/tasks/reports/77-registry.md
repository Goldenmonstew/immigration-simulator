# 任务 77 · 国家注册表、路由与分国文案

## 1. 做了什么（建议提交）

| PROGRESS | 建议 commit message | 本组文件 |
|---|---|---|
| 441 | `Refactor: 按国家拆分十国双语文案` | `apps/web/i18n/{zh-CN,en}.ts`、`apps/web/i18n/countries/*.ts`（十个国家文件）、`PROGRESS.md` 第 441 项 |
| 442 | `Refactor: 用国家注册表生成首页入口` | `apps/web/lib/site-countries.ts`、`apps/web/app/home-content.tsx`、`PROGRESS.md` 第 442 项 |
| 443 | `Refactor: 从国家注册表生成离线与无障碍页面清单` | `apps/web/app/offline-pages.json/route.ts`、`apps/web/public/sw.js`、`apps/web/test/about-page.test.tsx`、`apps/e2e/tests/{site,a11y}.spec.ts`、本报告、`PROGRESS.md` 第 443 项 |

每组提交使用 `Co-Authored-By: Codex gpt-6.2-astra <noreply@openai.com>`。

原字典缺少独立国名，因此每种语言各补 11 个 `<id>.name` 键供注册表使用。首页沿用原来的链接文案、描述和标点。英国 slug 为空，十国按现有首页顺序排列。静态 JSON 清单使用站内路径，service worker 安装时根据注册作用域添加部署前缀，缓存版本升到 v3。离线测试显式保留爱尔兰为最后一页，继续填写表单并断言计算结果。

## 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓类型检查包含 e2e 的 `tsc --noEmit`。单元测试共 5,224 项通过，engine 的文案导出用例按既有条件跳过 1 项。
- 用 Node 读取 `git show HEAD:apps/web/i18n/{zh-CN,en}.ts` 对应的两个基线文件并比对合并后的字典。每种语言原有的 1,118 个键及其完整字符串逐项相同，其中按十国前缀迁移 505 个。两种语言各有 11 个新增国名键。
- 对照改动前首页源码，十个入口的顺序、网址、链接键与描述键逐项相同。用 Node 断言 11 个国家 ID 与 10 个非空 slug 生成的路径，其中 `countryPath('uk', 'result')` 为 `/result`，`countryPath('japan')` 为 `/japan`。
- `pnpm --filter e2e exec playwright test --list --project=desktop site.spec.ts a11y.spec.ts` 成功收集 22 项测试，确认 Playwright 能直接导入 web 注册表。
- Node 读取 `apps/web/out/offline-pages.json` 并与 `git show HEAD:apps/web/public/sw.js` 中的 `PAGES` 比对，16 条路径及顺序完全相同，逐条找到导出的 HTML。读取 `out/index.html` 核对十国入口网址与顺序。在 Node 中模拟根路径与 `/uk-immigration-simulator/` 两种注册作用域的安装事件，均从对应前缀读取清单，将 16 页、manifest、两个图标和 30 个页面静态资源加入缓存请求。

## 3. 没做或没验证的

浏览器 e2e 与视觉验收由 Fable 执行。按 brief 保留工作树改动，提交由 Fable 完成。

## 4. 发现与建议

后续调整离线页面清单时，同步升级 `sw.js` 的缓存版本，以便已安装的客户端在下一次 service worker 更新时预缓存新清单。
