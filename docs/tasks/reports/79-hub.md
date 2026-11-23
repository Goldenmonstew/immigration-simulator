# 任务 79 · 多国集合入口、去掉“试点”、站名改为多国

## 1. 做了什么（按 commit 列）

| PROGRESS | Commit | 主要内容与涉及文件 |
|---|---|---|
| 460 | `Refactor: 去掉十国与首页文案中的试点字样` | 按设计稿第六节替换表更新 `apps/web/i18n/{zh-CN,en}.ts` 与 `apps/web/i18n/countries/*.ts`（共 32 个双语键），去掉所有“试点 / pilot”称呼，保留十国页面“只检查时间条件”的事实说明。 |
| 461 | `Feat: 站名与 manifest 改为多国移民路径模拟` | 将 `site.name` 更新为“移民路径模拟 / Immigration Path Simulator”，`site.shortName` 更新为“移民模拟 / Path Sim”，同步更新 `apps/web/public/manifest.webmanifest` 的 `name` 与 `short_name`。 |
| 462 | `Feat: 全站外壳增加所有国家入口并将站名链回根路径` | 更新 `apps/web/components/site-shell.tsx`：非游戏页左上站名链接回根路径 `/`，顶栏导航首项新增“所有国家 / All countries”（`site.allCountries`）指向 `/`；游戏页按当前国家路由返回对应模拟器主页（如 `/uk/game` 返回 `/uk`）；微调手机端顶栏水平内边距与间距以保证 375 px 宽度下单行不折行；同步更新 `apps/web/test/game-theme.test.tsx`。 |
| 463 | `Feat: 根路径改为多国集合入口页面` | 在 `apps/web/lib/site-countries.ts` 为各国补充 `hasGame` 字段（目前仅英国 `hasGame: true`）；新增 `apps/web/app/hub-content.tsx` 并更新 `apps/web/app/page.tsx`、`apps/web/app/layout.tsx`、`apps/web/app/site.module.css`，按设计稿实现根路径 `/` 的多国集合入口（标题区与 5 项能力徽章、桌面 3 列 / 平板 2 列 / 手机 1 列的 11 张国家卡片、开始前与免责声明区），无国旗与地图图形，仅在 `hasGame` 为真时显示“人生模拟”入口以避免死链；从英国独立首页 `apps/web/app/uk/home-content.tsx` 移除已升格至 `/` 的十国列表。 |
| 464 | `Test: 补充多国集合入口单测并更新十国与无障碍 e2e` | 在 `apps/web/test/page.test.tsx` 新增集合入口中英双语单测（校验 11 张国家卡片、缩写色块、路径标签、描述、计算与游戏链接、无“试点/pilot”字样、英文无中文字符、根布局 metadata 与 manifest 名称）；更新十国单测名称与十国 e2e（`apps/e2e/tests/{australia,new-zealand,canada,united-states,spain,greece,ireland,portugal,japan,germany}.spec.ts` 从 `/` 点击“`<国名>：开始计算`”进入）；将根路径 `/` 加入 `apps/e2e/tests/a11y.spec.ts` 无障碍检查列表。 |

每笔提交均附 `Co-Authored-By: Gemini 4 Argon <noreply@google.com>`。

## 2. 怎么验证的（命令 + 结果）

- 运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码 `0`：
  - `pnpm lint`：6 个 workspace 包全部通过。
  - `pnpm typecheck`：6 个 workspace 包（含 `apps/e2e` 的 `tsc --noEmit` 与 `apps/web` 的 `next typegen && tsc --noEmit`）全部通过。
  - `pnpm test`：
    - `apps/error-report`：1 个文件，2 项测试通过。
    - `packages/policy-data`：6 个文件，23 项测试通过。
    - `packages/engine`：33 个文件（1 项按环境变量条件跳过），3,217 项测试通过。
    - `packages/game`：33 个文件，1,336 项测试通过。
    - `apps/web`：41 个文件，649 项测试通过（含新增的集合入口双语单测与 metadata/manifest 单测）。
    - 全仓共 **5,227 项测试通过**。
  - `pnpm build`：`packages/policy-data`、`packages/engine`、`packages/game` 编译通过，`apps/web` 静态导出 27 个路由（含 `/`、`/uk` 及子页、十国页面与旧网址跳转页）全部成功。
- 运行 `rg -n "试点|pilot\b" apps/web/i18n`，确认 `apps/web/i18n` 及 `apps/web/i18n/countries/*.ts` 的所有中英文展示文字列均已无“试点”或“pilot”字样。

## 3. 没做或没验证的

- 按 brief 约定未运行 Playwright 浏览器 e2e 与视觉截图对比（由 Fable 串行执行与做视觉验收）。
- 未修改规则引擎、十国页面的计算功能、国家模块接口（任务 80）或各国游戏内容包（任务 81）。

## 4. 发现与建议（范围外，不实现）

- `apps/e2e/tests/site.spec.ts` 中的 `home.png` 视觉快照对应 `/uk` 页面；由于本次顶栏站名改为“移民路径模拟”、顶栏导航增加了“所有国家”且 `/uk` 移除了底部的十国列表，Fable 在跑 e2e 视觉验收时可核对并更新相关快照，或为根路径 `/` 补充集合入口截图。
- 后续各国游戏在任务 103–112 落地时，只需在 `apps/web/lib/site-countries.ts` 中将对应国家的 `hasGame` 设为 `true`，集合入口卡片即会自动并排展示该国的“人生模拟”入口按钮。

## 审核修正（review79-1，Codex gpt-6.2-sol 接手）

### 1. 做了什么（按拟提交分组）

| PROGRESS | 建议 commit message | 改动与涉及文件 |
|---|---|---|
| 465 | `Fix: 移除十国计算结果中的试点称呼` | 核对十国引擎和网页双语文案，替换澳大利亚、德国、爱尔兰、日本、新西兰、葡萄牙和美国的结果称呼。改动在 `packages/engine/src/{australia,germany,ireland,japan,new-zealand,portugal,united-states}.ts`。同步更新 `packages/engine/test/{ireland,japan}.test.ts` 的文案断言，并在 `apps/web/test/new-zealand.test.tsx` 增加随同申请人留空 PRV 获批日期的双语回归。 |
| 466 | `Fix: 说明各国计算器的检查范围` | `apps/web/i18n/{zh-CN,en}.ts` 的 `hub.intro` 和 `hub.badge.rules` 写明英国所涵盖定居路径的法定条件核对范围，以及其他十国目前只检查时间条件。 |
| 467 | `Fix: 更正集合入口的本机存储说明` | `apps/web/i18n/{zh-CN,en}.ts` 的 `hub.privacy` 说明问卷在浏览器本地计算，英国问卷草稿、已保存的方案和游戏进度保存在本机，其他十国问卷在刷新后重置。 |
| 468 | `Fix: 避免窄屏顶栏链接重叠` | `apps/web/app/site.module.css` 在最多 375 px 的屏幕上将站名与导航分行，保留全部导航链接和语言按钮。 |
| 469 | `Docs: 记录任务 79 审核修正与验收` | `PROGRESS.md` 与本报告。 |

建议提交时附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

### 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码为 `0`。共 5,229 项测试通过，1 项按配置跳过。静态构建生成 27 个路由。
- 使用 `rg -in --hidden '试点|\bpilots?\b'` 全仓检查，并逐项核对应用与引擎的匹配结果。七个引擎文件的 diff 仅涉及称呼替换。新西兰随同申请人回归用例在原版中英文结果上均失败，修正后均通过。
- 使用 Chromium 检查静态导出的 `/uk`。原版在 320 px 下中英文站名均与「所有国家」链接重叠。修正后逐个检查 320–376 px 的两种语言，全部顶栏控件均可见且无重叠。复查了 320、375 px 截图，1280 px 顶栏各项的位置和尺寸与原版一致。
- 在 Chromium 中切换 `/` 的语言，核对两种语言的检查范围和存储说明。进入 `/new-zealand`，勾选随同申请人并留空 PRV 获批日期，`NZ-PRV` 的中英文状态均为 `UNKNOWN`，摘要使用新称呼。刷新页面后，勾选项和填写的出生日期均重置。

### 3. 没做或没验证的

- 按交接要求保留工作树改动，未创建 Git 提交。
- 完整 Playwright e2e 与 CI 截图比对留给 Fable。

### 4. 发现与建议

- Fable 在 CI 截图验收时更新 `apps/e2e/tests/site.spec.ts` 使用的 `/uk` 首页和问卷截图基线。

## 第二轮审核修正（review79-2）

### 1. 做了什么（按拟提交分组）

| 建议 commit message | 改动与涉及文件 |
|---|---|
| `Fix: 明确各国集合卡片的时间检查范围` | `apps/web/i18n/{zh-CN,en}.ts`。澳大利亚列出持签、受雇、居住、年龄与等待时间，新西兰列出旅行条件到期日、转永居的持签时长和在境天数及入籍的在境天数，加拿大列出永居居住义务和入籍在境天数。其余七张非英国卡片逐张核对后也明确了所检查的时间条件。 |
| `Fix: 修复国家卡片按钮在网格断点的文字溢出` | `apps/web/app/site.module.css`。允许卡片按钮文字折行并缩小水平内边距，保留一列、两列和三列断点及英国双按钮并排布局。 |
| `Fix: 隐藏集合首页指向自身的导航链接` | `apps/web/components/site-shell.tsx`、`apps/web/test/{page,game-theme}.test.tsx`。集合首页省略「所有国家」，国家页保留，更新双语导航断言。 |
| `Docs: 记录任务 79 第二轮审核修正与验收` | `docs/tasks/reports/79-hub.md`。 |

建议提交时附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

### 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码为 `0`。共 5,229 项测试通过，1 项跳过。静态构建生成 27 个路由。
- 修正前用 Chromium 复现 601 和 960 px 的英文按钮溢出。修正后对静态导出的集合首页检查 320–1120 px 的每个整数宽度，以及 1280、1440 px。两种语言的全部 12 个按钮均位于各自卡片内，文字均位于按钮内。复查了 601 和 960 px 的英文截图，`Start calculator` 完整显示为两行。1280 px 下卡片为三列，英国两个按钮并排，标签为单行。
- 在 Chromium 中分别用中英文打开集合首页、英国页和澳大利亚页，确认集合首页没有「所有国家」导航链接，并从澳大利亚页点该链接返回集合首页。
- `git diff --check` 通过。

### 3. 没做或没验证的

- 按本轮交接要求保留工作树改动，未提交，未修改 `PROGRESS.md` 第 469 行。
- 浏览器验证覆盖本轮涉及的集合首页和导航，完整 Playwright e2e 留给合并验收。

### 4. 发现与建议

无范围外事项。
