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
