# 任务 41：收藏册补"来源回忆"（gpt-6.2-sol 实现，Fable 验收）

> 例外说明：2026-11-19 用户决定把 Phase 15 的任务交给 Codex 实现（见 `docs/tasks/phase-15-plan.md`），AGENTS.md 的"Codex 只审核"在本任务不适用；Fable 负责浏览器验收、审核、提交、开 PR。你的沙箱不能写 `.git`、不能启动浏览器：**不要 commit，不要跑 Playwright**。

## 背景

游戏的收藏册（`apps/web/app/game/life-overlays.tsx` 的收藏页）列出 6 种鱼和 8 道菜；已得的显示图标、名字和"首次：第 N 年 · 某季"（`lifeRecords`，见 `packages/game/src/types.ts`）。`docs/research/2026-11-15-content-expansion.md` 的 E04 原本还建议记"来源回忆"——第一次得到时的情境，这部分没做。

## 要做

- 第一次钓到某种鱼、第一次做成某道菜时，在该条记录里多存一点当时已有的情境（例如地点、天气、当时在场或一起吃的人；只用游戏里现成的状态，不新增系统）。
- 收藏页在"首次"那一行下面显示一句中英文短句，例如"那天下着小雨，在公园池塘"。句子由记录里的字段拼出，写在词典里（`apps/web/i18n/zh-CN.ts`、`en.ts`），语气与现有游戏文本一致（参考 `packages/game/src/style-guide.md`）。
- 旧存档里已有的记录没有这些字段：不显示这句，不报错，不迁移。
- 只改 `packages/game`（记录写入与类型）、`apps/web/app/game/life-overlays.tsx`、词典和对应测试；不要改 `apps/web/app/game/scene*.ts`（另一个任务在拆这些文件）。

## 验收命令

```bash
pnpm --filter @uk-immigration/game test
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web test
```

需要新增测试：第一次钓到 / 做成时存下情境、第二次不覆盖、旧记录没有情境字段时收藏页不显示这一句。Fable 会在浏览器里看收藏页（中英文、手机宽度）。

## 报告

写 `docs/tasks/reports/41-collection-memory.md`，最终消息同内容，四段：做了什么（建议的 commit 与文件）、怎么验证的、没做或没验证的、发现与建议。
