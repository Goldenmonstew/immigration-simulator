# 任务 33a｜连续居留与最早申请日

## 1. 做了什么

建议分两组提交。`residence.ts` 和 `residence-dates.test.ts` 按对应逻辑拆分。

- **`Fix: 按现行规则计算连续居留与申请日`**。包含引擎的 `residence.ts`、`aggregate.ts` 和 `rules/current-law/` 调用处、现行法参数、契约、对应测试、快照与顾问包，以及端到端期望和试玩表。
  - **A1#7、A2#3、A3#1、A6#1**。按 SRC-008 CR 1.1(a)–(b) 从申请日及其后最多 28 天内有可计许可的参考日回溯，符合条件的 UK Ancestry 候选也可按 CR 1.1(d) 回溯最近一次 UK Ancestry 许可到期日。满期日、参考日和申请日分别计算，随行候选使用主申请人的可申请日核对同时申请条件。五年 Appendix FM 伴侣和 Appendix Settlement Protection 适用各自条文。现行法结果的双语假设说明适用路线可以提前最多 28 天递交。
  - **A1#9、A3#5、A6#2**。普通无许可空档按 CR 4.1(d) 中断。Long Residence 按出入境有效许可和缺席限额识别 CR 4.1(d)(iii) 的境外空档，按 CR 4.2 扣除。按 CR 2.1(d)、4.1(d)(v)、4.3 计入符合条件的 2020 年 8 月宽限期，包括该月中开始的空档，前提是进入宽限期前已有许可且空档期间在英国。相关扣除另核对 SRC-005 LR 11.2。
  - **A1#8、A3#3、A3#6、A6#3**。缺席按所选合格期裁切，现行法重叠日期取并集，CR 3.2 旧许可按实际申请日周年分窗。Long Residence 对 2024-04-11 前出境的整趟行程核对 184 天单次上限，548 天累计只取分界前且位于合格期内的天数。自分界日起出境的行程按 CR 3.1 滚动计算。
  - **A1#12、A2#2**。申报行程明确显示申请日在境外时，Skilled Worker 主申请人及随行申请人、五年 Appendix FM 伴侣的申请日检查给 `FAIL`。行程同日出境或返英且无法确认递交时位置时给 `UNKNOWN`。五年伴侣的 `CL-FAMILY-RELATIONSHIP` 按现有身份资料判断，在双语结果中披露「假设申请日你的伴侣也在英国」。依据 SRC-004 SW 19.2(d)、37.2(d) 和 SRC-024 R-ILRP.1.1(a)、E-ILRP.1.2。Long Residence 和历史 UK Ancestry 候选亦按实际递交日核对申请人位置，依据 SRC-005 LR 9.3 和 SRC-026 UKA 10.2(d)。
  - 端到端测试按栏断言日期。`G-SW-5Y-ON-DAY` 两栏都是 `2026-06-01`，`G-SW-ABSENCE-200-DAYS` 现行法为 `2028-07-01`，改革为 `2028-07-29`。已同步试玩手册第 7 节 A1–A3。
- **`Fix: 检查 Earned Settlement 缺席窗口内的峰值`**。包含 `residence.ts` 的滚动峰值计算、`rules/es-residence.ts` 调用和 **A4#1** 回归测试。按 SRC-008 CR 3.1 及 PD-054 检查行程结束日和期间的月末。复核例在 `2025-02-28` 达到 181 天，从 `2025-03-02` 重新起算。改革居留框架依据 SRC-001 第 4 章。

### 黄金案例变化

与分支基线 `a13ee94` 比较，九个黄金案例出现结论或日期变化，均为现行法律栏。改革栏的滚动缺席峰值由 A4#1 回归用例覆盖。

| 案例 | 变化 | 原因 |
|---|---|---|
| `G-SW-5Y-DAY-BEFORE` | `LIKELY_NOT_ELIGIBLE` → `LIKELY_ELIGIBLE`，最早申请日 2026-06-01 → 2026-05-31 | 次日满期落在 CR 1.1(b) 参考期内 |
| `G-SW-ABSENCE-200-DAYS` | 预计日期 2028-07-29 → 2028-07-01 | 单次超限仍从返英后重新起算，预计申请日较满期日提前 28 天 |
| `G-SW-PRE-2024-SALARY-AFTER-CUTOFF` | 预计日期 2034-01-15 → 2033-12-18 | Long Residence 候选使用 CR 1.1(b) |
| `G-STUDENT-GRADUATE-SW` | 预计日期 2029-09-15 → 2029-08-18 | Long Residence 候选使用 CR 1.1(b) |
| `G-HKBNO-ONE-MONTH-SHORT` | 预计日期 2026-12-01 → 2026-11-03 | BN(O) 候选使用 CR 1.1(b) |
| `ES-OFFICIAL-P31-INDIVIDUAL-B-PARTNER` | 预计日期 2028-04-06 → 2028-03-09 | 现行法随行候选沿用可申请日 |
| `ES-OFFICIAL-P31-INDIVIDUAL-E` | 预计日期 2031-04-06 → 2031-03-09 | Long Residence 候选使用 CR 1.1(b) |
| `ES-OFFICIAL-P45-INDIVIDUAL-B` | 预计日期 2033-04-06 → 2033-03-09 | Long Residence 候选使用 CR 1.1(b) |
| `CL-FAMILY-FIVE-YEAR-SAVINGS-SHORT` | 预计日期 2034-06-01 → 2034-05-04 | Long Residence 候选使用 CR 1.1(b) |

第二轮相对第一轮恢复了 `G-FAMILY-5Y-LOW-INCOME`、`CL-FAMILY-PARTNER-FIVE-YEARS` 和 `CL-FAMILY-FIVE-YEAR-SAVINGS-PASS` 的 `LIKELY_ELIGIBLE`，以及 `CL-FAMILY-FIVE-YEAR-PARTNER-BENEFIT` 的 `POTENTIALLY_ELIGIBLE`。`CL-FAMILY-FIVE-YEAR-ADULT-CHILD-ENGLISH` 的子女规则恢复为 `PASS`，案例因本人英语资料不足仍为 `INSUFFICIENT_INFORMATION`。

## 2. 怎么验证的

| 命令 | 结果 |
|---|---|
| `pnpm --filter @uk-immigration/policy-data test` | 23 项通过 |
| `pnpm --filter @uk-immigration/engine test -u` | 刷新黄金案例、双语快照和顾问包。Vitest 5 的更新标志直接传入 `test -u` |
| `pnpm --filter @uk-immigration/engine test` | 2,594 项通过，1 项显式启用才运行的文案导出测试跳过。含 16 个新增回归测试和 2,000 个固定种子随机用例 |
| `pnpm --filter web test` | 491 项通过 |
| `pnpm lint`、`pnpm typecheck` | 通过 |
| `pnpm --filter @uk-immigration/policy-data build`、`pnpm --filter @uk-immigration/engine build` | 通过 |
| `git diff --check` | 通过 |

## 3. 没做或没验证的

- 本次范围内的复核结论均采纳。A1#17 留给任务 39 登记指引，计数仍按含出境及返英日的约定。A3#3、A6#3 的 CR 3.4 豁免属于复核表已披露的简化。
- 问卷缺 CR 1.1(c) 的决定日，以及确认 CR 4.1(d)(i)、(ii)、(iv) 所需的历史递交或审批资料。CR 3.2 用许可起始日代理授予日。空行程列表按无已申报缺席处理。问卷只有担保伴侣的身份，无法判断其本人位置，结果披露在英国的假设。未来日期以持续具备合格许可和届时满足其余条件推算。
- Playwright、浏览器验收、提交和 PR 由 Fable 完成，本次交付留在当前 worktree。

## 4. 发现与建议

- Long Residence 的当前路线 12 个月要求留在独立条目 A3#4，依据 SRC-005 LR 11.3–11.4。任务 39 登记官方指引后，可将跨 `2024-04-11` 的行程示例与整日计数一起复核。

## Fable 验收（补记）

- 全仓 gate 通过（GATE EXIT 0：engine 2594、game 1316、web 491 等）；e2e 全量 35/35 通过（含按新黄金结论更新期望值的问卷用例）。
- 第 1 轮把四个五年伴侣黄金案例改成"资料不足"（问卷没有担保伴侣位置这一题，用户无法补）；第 2 轮按 Fable 要求改为在结果里明示"假设申请日你的伴侣也在英国"，四个案例恢复原结论。
