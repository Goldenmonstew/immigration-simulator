# 任务 78 · 英国页面迁到 /uk，兼容旧网址

## 1. 做了什么（建议提交）

| PROGRESS | 建议 commit message | 本组文件 |
|---|---|---|
| 450 | `Refactor: 将英国七个页面和站内链接迁到 /uk` | `apps/web/app/uk/` 及对应旧位置、`app/{page,error}.tsx`、`app/offline-pages.json/route.ts`、`components/{site-shell,share-link,saved-scenarios,result-view,whatif-lab,gap-summary}.tsx`、`lib/{site-countries,mock-results}.ts`、`public/sw.js`、受影响的 `apps/web/test/`、`apps/e2e/tests/{a11y,game,life,mobile,questionnaire,site}.spec.ts` 与 `helpers.ts`、`PROGRESS.md` 第 450 项 |
| 451 | `Fix: 保留旧英国网址的查询串和分享片段` | `apps/web/app/[legacyPage]/page.tsx`、`apps/web/public/_redirects`、`apps/e2e/tests/legacy-urls.spec.ts`、本报告、`PROGRESS.md` 第 451 项 |

两组提交都使用 `Co-Authored-By: Codex gpt-6.2-astra <noreply@openai.com>`。

根路径和 `/uk` 复用同一个首页组件。分享链接指向 `/uk/result#s=…`。离线清单包含 PWA 启动页 `/`、七个英国页面和十国入口，缓存版本升到 v4。草稿、方案、语言与游戏存档沿用原有 localStorage 键。

六个旧入口各有静态 HTML。内联脚本在页面载入时将原查询串与片段追加到带部署前缀的后备链接，再调用 `location.replace`。Cloudflare 使用六条精确匹配的 301 规则，游戏资源继续从 `/game/` 下加载。

## 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,224 项单元测试通过，1 项文案导出测试按原有环境变量条件跳过。类型检查包含 e2e 的 `tsc --noEmit`。
- `BASE_PATH=/immigration-simulator pnpm --filter web build` 退出码 0。用 Node 读取两种构建的 `apps/web/out/`，核对七个英国页面、六个旧页面、十国入口，以及含 18 个路径的离线清单。两次导出的 `/` 与 `/uk` 首页主体均逐字相同，各站内链接和跳转后备链接均指向当前部署前缀。
- 从两种导出的六个旧页面分别取出内联脚本，用含百分号编码的查询串和有效草稿的 `#s=` 片段执行。每次仅调用一次 `location.replace`，目标路径、查询串与片段逐字符合预期。另核对六个页面的 `noindex` 和导出的六条 301 规则。
- `pnpm --filter e2e exec playwright test --list --project=desktop legacy-urls.spec.ts` 成功收集 3 项。旧分享链接用例对照新旧入口的两栏评估及分享载入提示，另外两项覆盖问卷和游戏入口。
- 最后运行 `pnpm --filter web build` 并重复导出检查，退出码 0，`apps/web/out/` 已恢复为无 base path 版本。

## 3. 没做或没验证的

按 brief 留给 Fable 提交。浏览器 e2e、视觉验收及部署后的 HTTP 301 响应仍待 Fable 验证。

## 4. 发现与建议

预发时可直接请求 `/result` 检查 301 状态和 `Location`，再用浏览器打开带 `#s=` 的旧链接检查实际结果。片段由浏览器处理，HTTP 请求只包含路径和查询串。[Cloudflare Pages 跳转规则](https://developers.cloudflare.com/pages/configuration/redirects/)
