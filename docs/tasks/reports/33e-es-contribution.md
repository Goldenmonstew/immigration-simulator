# 任务 33e｜改革的贡献、家属与受保护人群

## Fable：合入 33a–33d

2026-11-20 起开发由 Fable 实现，Codex（gpt-6.2-sol）只读审核。33e 基于 33a 第 3 轮前的 main，依次合入 33d（含 33a–33c）：
- `contracts.md`：33e 的贡献规则段落保留，其后采用 main 的候选日期与缺席段落。
- `pending-details.md`：33e 的 PD-083 改为第十四节（第十二、十三节为任务 32 与 33d）。
- 33d 的 A6#10 回归按 33e 的 PD-047 更新：持许可不足 5 年时福利回看未被合格许可覆盖，三年收入路径为 `POTENTIALLY_ELIGIBLE`。

合并后黄金案例的现行法栏与 33d 一致；改革栏 16 栏与 33d 不同，其中结论变化只有 `ES-OFFICIAL-INDIVIDUAL-C`（`LIKELY_ELIGIBLE` → `POTENTIALLY_ELIGIBLE`，PD-010），与 33e 自身一致，其余为规则明细。引擎 2,685 项通过、1 项跳过；web 533；game 1,331；lint、typecheck 通过。


## 1. 做了什么

已在 `codex/33e-es-contribution` 实现 A5#1–#11。逐条复核了政策快照，采纳了 10 条成立及 1 条部分成立的复核结论。

| 条目 | 修正与原文定位 |
|---|---|
| A5#1 | 后到伴侣从连续持有 partner dependant 合格许可起算，申请日不得早于主申请人满期日。回归例自 2023-11-01 起算，2028-11-01 满期。SRC-001 p29、p31 Individual B。 |
| A5#2、#3 | 金额不足以确认合并收入资格时返回 `UNKNOWN`（PD-010）。已录入主申请人的伴侣 dependant 按 PD-056 的假设评估。税年边界上的收入归属能改变达标结果时返回 `UNKNOWN`（PD-006）。SRC-001 p16 Best years、p17 Household Income。 |
| A5#4–#6 | 福利记录原可通过、但整个回看窗口缺少连续合格许可覆盖时，返回 `UNKNOWN`（PD-047）。已申报身心状况的申领者或仅录入的家属申领时，分别保留 PD-013 或 PD-014。清出日用回看公式核对，闰日案例为 2028-03-01。SRC-001 p18 Public Funds、p19 Individual D、p39；SRC-041 p4 问题 8–9。 |
| A5#7、#8 | British connection 按当前家庭许可所依据的关系判断。满五年 Annex C 公共服务后转出，保留 PD-012。SRC-001 p18 British Connection、p50 Annex A、p16 Public Service、p46 注 17；SRC-024 E-LTRP.1.2(a)–(b)、E-LTRPT.2.2(c)。 |
| A5#9、#10 | 保护路线只使用截至申请日已发生的非法入境记录，统一用于解释、Article 31 和候选年限。Protection Work and Study 的较长兜底由已确认的违规或福利使用触发。仅贡献失败时，资格与起算待明确，登记 PD-083。SRC-001 p13、p38–39、p47–48 Table 2；SRC-038 Answer ¶2。 |
| A5#11 | 成年 child dependant 收入豁免改引 SRC-001 p29。保护路线的双语贡献说明与工作判定共用政策参数，依据 SRC-001 p38、p47 Table 2。 |

唯一改变总体结论的黄金案例是 `ES-OFFICIAL-INDIVIDUAL-C`。改革栏由 `LIKELY_ELIGIBLE` 改为 `POTENTIALLY_ELIGIBLE`，仍显示十年路径，取消原最早申请日 2026-11-04。案例录入了合计金额与伴侣身份，合并资格仍待确认（PD-010）。另外 15 个黄金案例只改变单条规则状态或待定依据。已核对问卷端到端测试引用的两例和试玩手册第 7 节 A1–A3，预期结论与日期一致。

## 2. 怎么验证的

| 命令 | 结果 |
|---|---|
| `pnpm --filter @uk-immigration/policy-data test` | 23 项通过 |
| `pnpm --filter @uk-immigration/engine test -u` | 已重生成黄金快照、双语快照和顾问审阅包 |
| `pnpm --filter @uk-immigration/engine test` | 2,618 项通过，1 项按默认配置跳过的文案导出测试。每个 A5 条目均有编号回归测试 |
| `pnpm --filter web test` | 498 项通过 |
| `pnpm lint`、`pnpm typecheck`、`pnpm --filter @uk-immigration/engine build` | 通过 |
| `git diff --check` | 通过 |

## 3. 没做或没验证的

复用了现有问卷和分享数据格式。对缺少许可类别的旧家庭记录，规则在相关关系不冲突时推定许可依据并披露假设。伴侣连续申报的 partner dependant 许可按同一主申请人处理。收入按年度汇总判断，滚动年度内的具体收入日期仍待明确。

改动留在当前 worktree，提交、PR 和 Playwright 浏览器验收由 Fable 负责。

## 4. 发现与建议

`G-FAMILY-10Y-PARTNER` 目前仍按 `FAMILY_PARTNER_OR_PARENT` 分组获得改革五年路径。SRC-001 p23 注 9 将 Article 8 案例排除在 core permission 之外，p50 Annex A 的五年家庭示例也限于未依赖 exceptional circumstances 的群体。建议在改革居留路线分组的审核中核对这个案例的许可依据与归组。
