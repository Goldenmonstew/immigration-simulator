# 任务 49：网站可用性

由 Fable 实现（2026-11-20 起开发由 Fable 负责，Codex 只读审核）。范围见 `docs/tasks/phase-15-plan.md` 任务 49：Codex 试玩 #1–3、#11–15、#18，并入 33f 的结果页表述修正（任务 31 A6#6、#7、#12）。只改网站与试玩包，不改规则引擎。

## 验收

```
pnpm lint && pnpm typecheck && pnpm test && pnpm build
E2E_PORT=43xx pnpm --filter e2e e2e
```

问卷第 1 步截图基准在 CI 上重新生成（`e2e-baselines.yml`）；结果页、What-if 与国籍框在浏览器中截图核对。
