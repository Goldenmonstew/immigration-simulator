# 任务 38：拆分小镇场景文件（gpt-6.2-sol 实现，Fable 验收）

> 例外说明：2026-11-19 用户决定把 Phase 15 的任务交给 Codex 实现（见 `docs/tasks/phase-15-plan.md`），AGENTS.md 的"Codex 只审核"在本任务不适用；Fable 负责浏览器验收、审核、提交、开 PR。你的沙箱不能写 `.git`，也启动不了浏览器：**不要 commit，不要尝试跑 Playwright**。

## 背景

`apps/web/app/game/scene.ts` 约 1,424 行，是一个 Phaser 场景类 `TownScene`。之前已拆出 `scene-art.ts`、`scene-life.ts`、`scene-text.ts`、`pathfinding.ts`、`wildlife.ts`。14.2 报告建议继续按职责拆：地图与寻路、标签层、天气与光照。

## 要做

- 把 `TownScene` 里可以独立出来的大段逻辑移成普通函数，放进现有的 `scene-*.ts` 或按职责新建的 `scene-*.ts`：
  - 建地图（`loadWorld` 里铺地块、建筑、装饰、碰撞格的部分）；
  - 天气、光照与节日效果（`weather`、`paintLight`、`festivalEffects`、`updateWater` 等）；
  - 生活场景与午餐、节日布置（`syncLifeScenery`、`decorateLunch`、`syncLunch`、`decorateFestival`）。
- 目标：`scene.ts` 只留场景生命周期（`preload`、`create`、`update`）、与 React 的接口（`sync`、`walkToLocation`、`walkToNpc`、`interact`、`halt`）和移动、交互；降到约 900 行以内。
- **行为完全不变**：同样的绘制顺序、深度、时间、随机数调用顺序；对外导出的类型与方法签名不变。
- 移出的函数直接接收需要的参数（场景实例或具体对象），不要新建基类、管理器、事件总线或配置层。
- 现有测试（`apps/web/test/game-scene.test.ts`、`game-life-scene.test.ts` 等）只允许改 import 路径，不改断言。

## 验收命令

```bash
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web test
```

（如 `typecheck` 脚本名不同，以 `apps/web/package.json` 为准。）Fable 会再跑全仓 gate、e2e，并在浏览器里看小镇（地图、标签、天气、夜晚灯光、节日、午餐）是否与改前一致。

## 报告

写 `docs/tasks/reports/38-scene-split.md`，最终消息同内容，四段：做了什么（建议的 commit 与文件、拆分后各文件行数）、怎么验证的、没做或没验证的、发现与建议。
