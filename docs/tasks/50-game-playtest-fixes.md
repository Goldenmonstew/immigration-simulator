# 任务 50：游戏试玩修正（gpt-6.2-sol 实现，Fable 验收）

> 例外说明：2026-11-19 用户决定把 Phase 15 的任务交给 Codex 实现（见 `docs/tasks/phase-15-plan.md`），AGENTS.md 的"Codex 只审核"在本任务不适用。你的沙箱不能写 `.git`、不能启动浏览器：**不要 commit，不要跑 Playwright**。

## 背景

Codex 模拟试玩（`docs/playtest/results-2026-11-19-codex.md`，原始记录 `codex-P1..P3.md`）发现的游戏问题。本任务修其中**不涉及诺拉**的部分；诺拉的 #7–#9 排在任务 35（Option E 建模）之后另做。

## 要修

- **#4** 续签后季度小结的"签证剩余"与顶栏不一致（林遥季末小结 5 个月、顶栏 41 个月；索菲娅 5 与 35）。小结与顶栏用同一口径，该季续签过时写出已续签及新的有效期。
- **#5** 换季清空作物没有提示。播种时显示离成熟还差几天、本季还剩几天；换季会清掉未收作物时，在季末小结或清除前提示。
- **#6** 语言学校考试：考前显示目标等级与备考程度（用游戏已有的英语属性），考后当场给出通过与否及等级。
- **#10** 年末回望的触发时点与角色的游戏年切换对齐（秋末才过两季就触发）。
- **#16** 季度小结列出对心情、健康影响最大的一两项结算来源。
- **#17**（林遥部分）`sw-soup` 只在刚加过班后触发或改成通用晚归台词；逛节日摊位与包饺子各给不同反馈；需要特定鱼种的菜在菜名或配方说明里写明鱼种。

不改政策判定，不改诺拉相关文件（`characters/graduate*.ts`、`graduate-route.ts`）。不要改 `apps/web/app/game/scene*.ts`（另一个设计任务会碰画面）。文本中英文都改，语气按 `packages/game/src/style-guide.md`。每条加回归测试。

## 验收命令

```bash
pnpm --filter @uk-immigration/game test
pnpm --filter web test
pnpm lint
pnpm typecheck
```

## 报告

写 `docs/tasks/reports/50-game-playtest-fixes.md`，最终消息同内容，四段。
