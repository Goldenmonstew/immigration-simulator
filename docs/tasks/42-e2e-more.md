# 任务 42：e2e 补用例（gpt-6.2-sol 实现，Fable 跑与验收）

> 例外说明：2026-11-19 用户决定把 Phase 15 的任务交给 Codex 实现（见 `docs/tasks/phase-15-plan.md`），AGENTS.md 的"Codex 只审核"在本任务不适用。你的沙箱不能写 `.git`，也启动不了 Chromium：**不要 commit，不要尝试跑 Playwright**；写完后 Fable 在本机跑并把失败信息发给你修。

## 背景

`apps/e2e/tests/` 已覆盖续签、商店、菜地租用、收藏册、英文冒烟、钓鱼简易模式、做饭、结局。14.1 报告建议另补：节日、菜地种下到收成、英文界面的深层流程。

## 要做

在现有 spec 里各加一条（不新建辅助文件，复用 `helpers.ts` 的 `startGame`、`patchSave`、`quietMorning`、`walkTo`、`dismissCards`）：

1. **节日当天**：用 `patchSave` 把日期与 `day.festival` 设到一个现有节日（看 `packages/game/src/festivals.ts`），走到节日地点，参加一项节日活动，断言结果卡出现、相应状态或物品变化。
2. **菜地种下到收成**：租地后播种、浇水，用 `patchSave` 推进到可收成的状态（看 `packages/game` 的作物生长字段），收成后断言背包里多了作物、收藏页收成统计增加。
3. **英文界面深层流程**：英文界面下走到 Visa centre 续签一次（复用 `life.spec.ts` 续签用例的存档改法），再去 Station 离开英国到结局页，断言结局页英文标题与"在模拟器里打开"的英文链接。

只改 `apps/e2e/tests/*.spec.ts`（必要时 `helpers.ts` 加最少的东西）。不改超时、重试、截图基准与配置。

## 验收命令

```bash
pnpm --filter e2e typecheck
pnpm lint
```

## 报告

写 `docs/tasks/reports/42-e2e-more.md`，最终消息同内容，四段。
