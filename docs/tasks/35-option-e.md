# 任务 35：建模 Skilled Worker 新入职者档（Option E），用于诺拉的 Graduate 转签

由 Fable 实现（2026-11-20 起开发由 Fable 负责，Codex 只读审核）。契约见 `docs/tasks/phase-15-plan.md`"任务 35 的契约"。

## 范围

- 只覆盖游戏里诺拉的情景（Graduate 转 Skilled Worker），不在网站问卷里做通用 Option E。
- 新增 Skilled Worker 申请检查：SW 4.2 Option A 与 Option E（SW 12.1–12.3），与定居薪资检查（SW 24.3）分开，定居规则不变。
- 输入：申请日、预计决定日、最近一次非访客许可、CoS 起止日期、CoS 年薪与每周工时、SOC 代码；拟授予许可到 CoS 结束后 14 天（SW 18.1）。
- SW 12.3 合计：已持 Graduate / Skilled Worker 许可的实际有效期间（空档不计），决定日仍有效的许可在决定日截断（SRC-050 §23.1），加上拟授予许可全期。section 3C 延续期足以改变结论时输出 `UNKNOWN`（PD-081）。
- 政策数字走 `packages/policy-data`，带 SRC 定位。

## 验收

```
pnpm lint && pnpm typecheck && pnpm test && pnpm build
E2E_PORT=43xx pnpm --filter e2e e2e
```

测试覆盖：SW 12.2(f) 资格（Graduate 与否、到期不足 2 年、恰好 2 年、超过 2 年）、薪资（新入职者档两条门槛与工时折算、Option A 边界）、SW 12.3（4 年内、恰好 4 年、超过 4 年、Graduate 到期后有空档、此前的 Skilled Worker 许可、section 3C 临界 `UNKNOWN`）、缺输入；诺拉情景的结果与说明随之更新。
