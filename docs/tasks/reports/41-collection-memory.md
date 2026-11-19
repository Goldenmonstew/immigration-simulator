# 任务 41 · 收藏册来源回忆

## 1. 做了什么

建议提交 `Feat: 收藏册记录首次获得时的地点和天气`，署名 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- `packages/game/src/game.ts` 和 `packages/game/src/types.ts` 新增首次情境记录。首次钓到某种鱼或做成某道菜时，记录公园池塘或家，以及当天的天气。重复获得保留首次记录，旧记录缺少情境时也不回填。
- `apps/web/app/game/life-overlays.tsx` 配合 `apps/web/i18n/zh-CN.ts` 和 `apps/web/i18n/en.ts`，在「首次」年季下显示一句本地化回忆，例如「那天下着雨，你在公园池塘钓到了它。」旧存档里已收录的鱼和菜仍显示首次年季，缺少情境的卡片省略回忆。
- `packages/game/test/collections.test.ts` 和 `apps/web/test/game-collections.test.tsx` 覆盖首次写入、不同天气下重复获得、JSON 存读档，以及中英文新旧记录的显示。本报告随改动交付。

## 2. 怎么验证的

- `pnpm --filter @uk-immigration/game test` 通过，31 个文件共 1317 项。
- `pnpm --filter web lint`、`pnpm --filter web typecheck` 均通过。
- `VITEST_MAX_WORKERS=2 pnpm --filter web test` 通过，29 个文件共 493 项。
- `pnpm --filter @uk-immigration/game build` 通过，确认生成 JavaScript 和类型声明。改动文件的 Prettier 检查与 `git diff --check` 均通过。

## 3. 没做或没验证的

本轮未运行浏览器或 Playwright，也未创建提交。中英文和手机宽度的浏览器验收，以及审核、提交和开 PR，由 Fable 负责。

## 4. 发现与建议

现有天气按晴、多云、雨、雪记录，回忆沿用这一粒度。手机验收可对照一条新记录和一条旧记录，检查中英文换行和回忆的位置。

## Fable 验收（补记）

- 全仓 gate 通过（game 1317、web 493 等）；e2e 全量 35/35 通过。
- 浏览器截图（本分支构建，存档写入一条带情境的河鲈、一条旧格式的鲤鱼、一条带情境的鱼配土豆）：桌面 1280 与手机 375，中英文。河鲈卡片在"首次"下显示"那天下着雨，你在公园池塘钓到了它。"/"You caught it at the park pond on a rainy day."；鲤鱼只显示首次年季；手机上回忆句换行正常。
