# 任务 36：手机 e2e 走地点改用 walkTo（gpt-6.2-sol 实现，Fable 验收）

> 例外说明：2026-11-19 用户决定把这批任务交给 Codex 实现，AGENTS.md 的"Codex 只审核"在本任务不适用；Fable 负责跑 e2e、审核、提交、开 PR。你的沙箱不能写 `.git`，也启动不了 Chromium：**不要 commit，不要尝试跑 Playwright**。

## 背景

`apps/e2e/tests/mobile.spec.ts` 的"first screen shows the town and the dock; the place drawer walks"在本地全量运行中偶发失败：它打开"镇上地点"抽屉后直接点"公园池塘"，路上弹出的随机事件卡没有处理。桌面用例用 `helpers.ts` 的 `walkTo` 处理事件卡（选第一项后再点一次地点），手机的抽屉每次点地点后会收起，所以不能直接复用。

## 要做

- 给 `walkTo` 加一个可选参数，让调用方提供"点地点之前要做的事"（手机上是先点"镇上地点"打开抽屉，再用 tap 点地点）；不传时行为与现在完全一样。
- `mobile.spec.ts` 里所有经抽屉走到地点的地方（第 22 行起、第 33 行起）改用它。
- 只改这两个文件。不加新的辅助文件、不改其他用例、不改超时与重试配置。

## 验收命令

```bash
pnpm --filter e2e exec tsc --noEmit
pnpm lint
```

Fable 会在本机跑 `mobile.spec.ts` 多次与 e2e 全量。

## 报告

写 `docs/tasks/reports/36-e2e-drawer-walk.md`，最终消息同内容，四段：做了什么（建议的 commit 与文件）、怎么验证的、没做或没验证的、发现与建议。
