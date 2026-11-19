# 任务 32：来源刷新与补登记

## 1. 做了什么

建议一次提交 `Docs: 刷新官方政策来源与待核事项`。登记表和网站索引共用同一组 SRC 编号，由 Fable 一并提交以下文件。

| 文件 | 改动 |
|---|---|
| `docs/SOURCES.md` | 登记 SRC-049–052，记录版本、段号、锚点、快照及 SHA-256。 |
| `docs/pending-details.md` | 用指引关闭 PD-080 的过渡表截止日问题，新增 PD-081。 |
| `docs/research/2026-11-19-option-e-and-student.md` | 记录 Option E 和 Student 结论、依据及提前换签算例。 |
| `apps/web/lib/sources.ts`、`packages/policy-data/src/data/policy-changelog.ts` | 同步四个来源链接，增加 Finance Bill 的中英文变更条目。 |
| `policy-sources/2026-11-04-finance-bill-173-publications.json` | SRC-049 议会发布 API 原始元数据。 |
| `policy-sources/2026-08-03-skilled-worker-caseworker-guidance.html` | SRC-050 原始 HTML。 |
| `policy-sources/2026-10-08-immigration-rules-appendix-student.html` | SRC-051 原始 HTML。 |
| `policy-sources/2026-10-16-student-and-child-student-caseworker-guidance.html` | SRC-052 原始 HTML。 |
| `PROGRESS.md`、`docs/tasks/reports/32-policy-refresh.md` | 本次记录及验收报告。 |

**截至 2026-11-19 22:18 GMT**，GOV.UK 集合及其 Content API 的 2026 组均以 2026-09-03 的 HC 584 为最新一期。手册 2026-10-29 的更新仍标明 HC 584。按 §3 添加新修法与说明备忘录、换版及段号对照的条件尚未出现。SRC-051 是首次登记的 Appendix Student 快照。HC 584 已刊的 2026-11-30 批次调整 Student 生活费证明额，较早申请按旧规则。ST 25–26 的工时和许可收尾期不受该批调整，项目没有 Student 生活费资格参数。［SRC-048 `#implementation`、`#app-st8`–`#app-st10`；SRC-051 ST 25–26］[GOV.UK 集合](https://www.gov.uk/government/collections/immigration-rules-statement-of-changes) · [集合 Content API](https://www.gov.uk/api/content/government/collections/immigration-rules-statement-of-changes) · [手册更新](https://www.gov.uk/guidance/immigration-rules/updates)

| 范围 | 官方证据及实施状态 | 对项目的影响 |
|---|---|---|
| Finance Bill 2026–27 | 刊印版第 15 条拟豁免雇主支付 CoS 费与 Immigration Skills Charge 所产生的所得税，适用于 2026-10-28 起支付的款项。SRC-047 已确认相同范围的临时税务效力。议会最新记录仍为法案，二读排期为 2026-11-23。［SRC-049 第 15(1)–(2) 条，PDF p21；Bill 173–EN p37 ¶1–9；SRC-047 Resolution 15(1)–(2)］[法案](https://publications.parliament.uk/pa/bills/cbill/59-02/0173/260173.pdf) · [议会进度](https://bills.parliament.uk/bills/4316/stages) | 项目计玩家的申请费和 IHS。`packages/game/src/locations.ts` 及 `packages/policy-data/src/parameters/current-law-2026-11.ts` 中的 `skilledWorkerExtensionFeeInUk`、`immigrationHealthSurchargePerYear` 无需调整。 |
| PD-076 薪资与过渡 | 重读 Budget 2026、问题 40064 答复和 Appendix Skilled Worker 更新记录。已有 2027 年春季计划，确切日期、新金额及过渡仍待公布。［SRC-032 §7.9；SRC-033 Answer ¶2–6、¶10；SRC-004 SW 4.2、14.5、24.3］[书面答复](https://questions-statements.parliament.uk/written-questions/detail/2026-11-02/40064) · [Skilled Worker Content API](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-skilled-worker) | 未来须核 `packages/policy-data/src/parameters/current-law-2026-11.ts` 的 Skilled Worker 薪资参数及 `packages/engine/src/rules/current-law/skilled-worker.ts` 的 `CL-SW-SALARY`、`CL-SW-GOING-RATE`。本次没有依据重算。 |
| PD-077 Graduate 大学例外 | 预算例外的大学标准、名单和实施日仍待公布。现有非博士申请日分界继续以 GR 8.1 为准。［SRC-032 §5.6、§7.9；SRC-034 GR 4.1、8.1］[预算](https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html#access-to-talent) · [Graduate Content API](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-graduate) | `packages/game/src/characters/graduate.ts` 使用情景时间线。项目没有通用 Graduate 发签时长规则。 |
| PD-078 HPI 扩容 | HPI Appendix 与年度名单保持原版本。预算扩容的名单、新 cap 和确切日期仍待公布。［SRC-032 §5.6、§7.9；SRC-035 HPI 1.6A、5.1–5.3；SRC-036 首段与大学表］[HPI Content API](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-high-potential-individual) · [年度清单](https://www.gov.uk/government/publications/high-potential-individual-visa-global-universities-list/high-potential-individual-visa-global-universities-list-2026) | 项目无 HPI 发签 cap 或大学资格判断。`packages/engine/src/rules/current-law/long-residence.ts` 处理居留计入，无需调整。 |
| PD-079 curtailment | 已有 2027 年计划，资格、分档、起算和确切实施日仍待公布。官方取消许可指引最近一次更新涉及 adult social care 担保牌照被撤销后的安排。［SRC-032 §7.9；SRC-033 Answer ¶9–10］[现行取消许可指引](https://www.gov.uk/government/publications/immigration-status-and-enforcement-action-caseworker-guidance/cancellation-and-curtailment-of-permission-accessible#changes-from-last-version-of-this-guidance) | 项目无该人群获准找新工作的期限规则。`packages/engine/src/rules/current-law/skilled-worker.ts` 的定居规则无需调整。 |
| PD-080 row E | 指引 §13.5 明列申请日须早于 2026-12-01，包括 settlement。§22.4 确认适用过渡安排须满足 SW 14.5(c) 全部条件。关闭过渡表截止日问题，row E 的其他分支仍须按条文核对。［SRC-004 SW 14.5(c)(iii)、24.3 row E、24.4(a)；SRC-050 §13.5、§22.4］[截止日](https://www.gov.uk/government/publications/skilled-worker-visa-caseworker-guidance/skilled-worker-caseworker-guidance-accessible#transitional-arrangement-for-phd-level-roles) · [定居薪资](https://www.gov.uk/government/publications/skilled-worker-visa-caseworker-guidance/skilled-worker-caseworker-guidance-accessible#sponsorship-and-salary) | `packages/engine/src/rules/current-law/skilled-worker.ts` 的 `settlementSalaryRow` 未覆盖这一行。 |

Option E 的四年上限明确计入已持 Graduate、Skilled Worker、Tier 2 许可和拟授予的整段 Skilled Worker 许可。按条文与指引推导，提前获批时 Graduate 计至新许可生效，原许可尚余的期限不再累计。临界日和 3C 延续的具体算法列入 PD-081。Student 的普通工作按担保和课程分为学期内每周最多 20 小时、10 小时或不得受雇。有普通就业权限者在非学期可全职，完课后仍有效的许可时段也按非学期处理。ST 25.3 的课程后收尾期依次为 4 个月、2 个月、1 个月或 7 天。［SRC-004 SW 12.2–12.3、18.1–18.1A；SRC-050 §16、§16.1、§23.1；SRC-051 ST 25.2–26.6；SRC-052 `#work-conditions`、`#student-period-to-grant`］

## 2. 怎么验证的

- `node packages/policy-data/scripts/check-sources.mjs` 修改前后均退出 1。既有脚本把 SRC-033 的书面问题 JSON 当作 Hansard JSON，查找 `### SRC-033 ` 备注时抛 `TypeError`。新条目在中断点之后，完整检查待 Fable 在修复脚本后补跑。
- `pnpm --filter @uk-immigration/policy-data test` 通过，6 个文件、23 项测试。
- `pnpm --filter web test -- sources` 通过，实际运行 29 个文件、491 项测试，涵盖来源表一致性及政策页中英文内容。
- 用 `curl` 独立重取并校验四份归档的 SHA-256、三份 GOV.UK HTML 的可见正文及 14 个锚点、Finance Bill 发布 API 的 JSON 和 PDF URL。另将已存 Skilled Worker、Long Residence、Graduate、HPI 与 Skilled Occupations 的规则正文与线上版本对照，五份文字相同。`git diff --check` 通过。

## 3. 没做或没验证的

- SRC-049 的官方 PDF、HTML 及解释说明已在线回读。下载原始文件遇到议会发布域名 HTTP 403，版本库暂存官方发布元数据及其 SHA-256，原始 PDF 和说明的 SHA-256 待补。
- 英国议会书面问题列表 API 的关键词查询超时。直接回读了已登记的 40064、预算文件、各 Appendix 的版本历史和议会法案记录。本次结论以这些可复核页面为限。
- 按任务范围，本次交付来源、研究和变更记录。规则、参数、游戏及 Git 提交留给后续实现与 Fable 验收。现有的未跟踪 brief `docs/tasks/32-policy-refresh.md` 保持原样。

## 4. 发现与建议

- **建模 Option E 的入境及换签评估。** 在 `packages/game/src/graduate-route.ts` 的 `graduateSalaryChecks` 和 `packages/game/src/characters/graduate.ts` 的签证中心流程接入独立的许可评估，传入签证有效区间、境内预计决定日与 CoS 日期，复用 `packages/policy-data/src/parameters/current-law-2026-11.ts` 的新入职者参数，PD-081 的边界可改变结果时返回 `UNKNOWN`。［SRC-004 SW 4.2、12.1–12.3、18.1–18.1A；SRC-050 §16、§16.1、§23.1］
- **建模 Student 的普通工时和课程后许可。** 在 `packages/game/src/characters/graduate.ts` 的 `graduate.timeline` 录入 CAS 课程类型、起止日及担保条件，工时另用学期日历和课程完成日判断。［SRC-051 ST 25.2–25.3、26.1–26.6；SRC-052 `#work-conditions`、`#student-period-to-grant`］
- **补建 SW 24.3 row E，并测试过渡截止。** 在 `packages/engine/src/rules/current-law/skilled-worker.ts` 的 `settlementSalaryRow`、`CL-SW-SALARY`、`CL-SW-GOING-RATE` 覆盖该群体，核对 2026-12-01 前后两侧及独立的 going rate 分支。［SRC-004 SW 14.5(c)(iii)、24.3 row E、24.4(a)；SRC-050 §13.5、§22.4］
- **修复来源检查并补归档。** 在 `packages/policy-data/scripts/check-sources.mjs` 按登记的官方 URL 和文档类型核对 JSON、HTML 与 PDF，然后重新跑完整检查，并为 SRC-049 补归档 Bill 173 及 Bill 173–EN 的原始 PDF 与 SHA-256。

## Fable 验收（补记）

- 任务 44（PR #21）合并后把 main 合入本分支，本机重跑 `node packages/policy-data/scripts/check-sources.mjs`：`Summary: 58 unchanged / 0 changed / 0 fetch failed / 1 dynamic`，退出 0（含本任务新登记的 SRC-049–052）。
- 全仓 gate 通过（GATE EXIT 0：engine 2579、game 1316、web 491 等）。
