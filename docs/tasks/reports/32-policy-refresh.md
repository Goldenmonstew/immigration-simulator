# 任务 32：来源刷新与补登记

## 1. 做了什么

### 第一轮已提交

`9ddc58f` 登记以下来源，`9ad2486` 补入 Fable 的验收记录。

| 文件 | 改动 |
|---|---|
| `docs/SOURCES.md` | 登记 SRC-049–052，记录版本、段号和锚点。SRC-050–052 有原文快照和 SHA-256。 |
| `docs/pending-details.md` | 用指引关闭 PD-080 的过渡表截止日问题，新增 PD-081。 |
| `docs/research/2026-11-19-option-e-and-student.md` | 记录 Option E 和 Student 结论、依据及提前换签算例。 |
| `apps/web/lib/sources.ts`、`packages/policy-data/src/data/policy-changelog.ts` | 同步四个来源链接，增加 Finance Bill 的中英文变更条目。 |
| `policy-sources/2026-11-04-finance-bill-173-publications.json` | SRC-049 议会发布 API 原始元数据。 |
| `policy-sources/2026-08-03-skilled-worker-caseworker-guidance.html` | SRC-050 原始 HTML。 |
| `policy-sources/2026-10-08-immigration-rules-appendix-student.html` | SRC-051 原始 HTML。 |
| `policy-sources/2026-10-16-student-and-child-student-caseworker-guidance.html` | SRC-052 原始 HTML。 |
| `PROGRESS.md`、`docs/tasks/reports/32-policy-refresh.md` | 进度和验收记录。 |

### 第二轮建议提交 `Docs: 补登记 HPI 扩容答复和换签指引`

| 文件 | 改动 |
|---|---|
| `docs/SOURCES.md` | 登记 SRC-058、SRC-059 和原文快照 SHA-256。SRC-049 标明无原文快照，状态为 `todo`。 |
| `policy-sources/2026-11-04-written-question-40091.json`、`policy-sources/2026-09-14-cancellation-and-curtailment-of-permission.html` | 分别为 40091 单条议会 API 原始 JSON 和 Home Office 指引 v12.0 原始 HTML。 |
| `docs/pending-details.md`、`docs/research/2026-11-19-option-e-and-student.md` | 更新 PD-078 和 PD-081，给提前换签的推导及算例补上原许可被替代的证据。 |
| `apps/web/lib/sources.ts`、`packages/policy-data/src/data/policy-changelog.ts` | 同步两个来源链接。将 HPI 扩容的筛选方法加入中英文变更记录，明确实施仍待公布。 |
| `PROGRESS.md`、`docs/tasks/reports/32-policy-refresh.md` | 补记本轮结果，纠正 SRC-049 的检查覆盖范围。 |

**2026-11-19 23:05 GMT 复查**，GOV.UK 集合及其 Content API 的 2026 组均以 2026-09-03 的 HC 584 为最新一期。手册 2026-10-29 的更新仍标明 HC 584。按 §3 添加新修法与说明备忘录、换版及段号对照的条件尚未出现。SRC-051 是首次登记的 Appendix Student 快照。HC 584 已刊的 2026-11-30 批次调整 Student 生活费证明额，较早申请按旧规则。ST 25–26 的工时和许可收尾期不受该批调整，项目没有 Student 生活费资格参数。［SRC-048 `#implementation`、`#app-st8`–`#app-st10`；SRC-051 ST 25–26］[GOV.UK 集合](https://www.gov.uk/government/collections/immigration-rules-statement-of-changes) · [集合 Content API](https://www.gov.uk/api/content/government/collections/immigration-rules-statement-of-changes) · [手册更新](https://www.gov.uk/guidance/immigration-rules/updates)

| 范围 | 官方证据及实施状态 | 对项目的影响 |
|---|---|---|
| Finance Bill 2026–27 | 刊印版第 15 条拟豁免雇主支付 CoS 费与 Immigration Skills Charge 所产生的所得税，适用于 2026-10-28 起支付的款项。SRC-047 已确认相同范围的临时税务效力。议会最新记录仍为法案，二读排期为 2026-11-23。［SRC-049 第 15(1)–(2) 条，PDF p21；Bill 173–EN p37 ¶1–9；SRC-047 Resolution 15(1)–(2)］[法案](https://publications.parliament.uk/pa/bills/cbill/59-02/0173/260173.pdf) · [议会进度](https://bills.parliament.uk/bills/4316/stages) | 项目计玩家的申请费和 IHS。`packages/game/src/locations.ts` 及 `packages/policy-data/src/parameters/current-law-2026-11.ts` 中的 `skilledWorkerExtensionFeeInUk`、`immigrationHealthSurchargePerYear` 无需调整。 |
| PD-076 薪资与过渡 | 重读 Budget 2026、问题 40064 答复和 Appendix Skilled Worker 更新记录。已有 2027 年春季计划，确切日期、新金额及过渡仍待公布。［SRC-032 §7.9；SRC-033 Answer ¶2–6、¶10；SRC-004 SW 4.2、14.5、24.3］[书面答复](https://questions-statements.parliament.uk/written-questions/detail/2026-11-02/40064) · [Skilled Worker Content API](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-skilled-worker) | 未来须核 `packages/policy-data/src/parameters/current-law-2026-11.ts` 的 Skilled Worker 薪资参数及 `packages/engine/src/rules/current-law/skilled-worker.ts` 的 `CL-SW-SALARY`、`CL-SW-GOING-RATE`。本次没有依据重算。 |
| PD-077 Graduate 大学例外 | 预算例外的大学标准、名单和实施日仍待公布。现有非博士申请日分界继续以 GR 8.1 为准。［SRC-032 §5.6、§7.9；SRC-034 GR 4.1、8.1］[预算](https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html#access-to-talent) · [Graduate Content API](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-graduate) | `packages/game/src/characters/graduate.ts` 使用情景时间线。项目没有通用 Graduate 发签时长规则。 |
| PD-078 HPI 扩容 | 2026-11-04 的 40091 答复明确，院校须在相关年份的 THE、QS、ARWU 三个榜单中至少两个进入前 150。正式名单、新申请 cap 和生效日仍待公布。答复提及的第 6.2 段与现行 Appendix 的编号不符，现行按学位授予日匹配名单的依据是 HPI 5.2。［SRC-058 Answer ¶1 后的榜单及 ¶2；SRC-032 §5.6、§7.9；SRC-035 HPI 1.6A、5.2、6.2；SRC-036 首段与大学表］[议会书面答复](https://questions-statements.parliament.uk/written-questions/detail/2026-11-02/40091) · [现行 HPI Appendix](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-high-potential-individual#global-universities-list-degree-requirement) · [年度名单](https://www.gov.uk/government/publications/high-potential-individual-visa-global-universities-list/high-potential-individual-visa-global-universities-list-2026) | 项目无 HPI 申请 cap 或大学资格判断。`packages/engine/src/rules/current-law/long-residence.ts` 的 `longResidenceStart` 处理居留计入，无需调整。 |
| PD-079 curtailment | 已有 2027 年计划，资格、分档、起算和确切实施日仍待公布。官方取消许可指引最近一次更新涉及 adult social care 担保牌照被撤销后的安排。［SRC-032 §7.9；SRC-033 Answer ¶9–10］[现行取消许可指引](https://www.gov.uk/government/publications/immigration-status-and-enforcement-action-caseworker-guidance/cancellation-and-curtailment-of-permission-accessible#changes-from-last-version-of-this-guidance) | 项目无该人群获准找新工作的期限规则。`packages/engine/src/rules/current-law/skilled-worker.ts` 的定居规则无需调整。 |
| PD-080 row E | 指引 §13.5 明列申请日须早于 2026-12-01，包括 settlement。§22.4 确认适用过渡安排须满足 SW 14.5(c) 全部条件。关闭过渡表截止日问题，row E 的其他分支仍须按条文核对。［SRC-004 SW 14.5(c)(iii)、24.3 row E、24.4(a)；SRC-050 §13.5、§22.4］[截止日](https://www.gov.uk/government/publications/skilled-worker-visa-caseworker-guidance/skilled-worker-caseworker-guidance-accessible#transitional-arrangement-for-phd-level-roles) · [定居薪资](https://www.gov.uk/government/publications/skilled-worker-visa-caseworker-guidance/skilled-worker-caseworker-guidance-accessible#sponsorship-and-salary) | `packages/engine/src/rules/current-law/skilled-worker.ts` 的 `settlementSalaryRow` 未覆盖这一行。 |

Option E 的四年上限计入已持 Graduate、Skilled Worker、Tier 2 许可和拟授予的整段 Skilled Worker 许可。取消许可指引明确，进一步许可获批后原许可已被替代。与境内新许可从决定日起算的指引合读，支持提前获批时原 Graduate 许可未使用的时间停止累计。逐日边界和 section 3C 在 SW 12.3 下的计法仍留在 PD-081。［SRC-004 SW 12.2–12.3、18.1–18.1A；SRC-050 §16、§16.1、§23.1；SRC-059 `#premature-end-of-employment-or-study-cancellation-process` 首个列表项］[取消许可指引](https://www.gov.uk/government/publications/immigration-status-and-enforcement-action-caseworker-guidance/cancellation-and-curtailment-of-permission-accessible#premature-end-of-employment-or-study-cancellation-process)

Student 的普通工作按担保和课程分为学期内每周最多 20 小时、10 小时或不得受雇。有普通就业权限者在非学期可全职，完课后仍有效的许可时段也按非学期处理。ST 25.3 按课程类型和长度给 4 个月、2 个月、1 个月或 7 天的收尾期。［SRC-051 ST 25.2–26.6、SRC-052 `#work-conditions`、`#student-period-to-grant`］

## 2. 怎么验证的

- `node packages/policy-data/scripts/check-sources.mjs` 本轮修改前后均退出 0，结果从 `58 unchanged / 0 changed / 0 fetch failed / 1 dynamic` 到 `60 unchanged / 0 changed / 0 fetch failed / 1 dynamic`。SRC-058 原始 SHA-256 与正文一致。SRC-059 重新抓取的原始 SHA-256 有变化，归一化正文一致。独立复算的本地 SHA-256 与登记值一致。
- 第一轮旧脚本在 SRC-033 抛出 `TypeError`。任务 44（PR #21）合入后，Fable 重跑脚本退出 0，结果为 `58 unchanged / 0 changed / 0 fetch failed / 1 dynamic`。其中本任务仅覆盖 SRC-050–052，因为 SRC-049 的快照列没有文件，备注中的元数据也不在该脚本的检查范围内。Fable 当时的全仓 gate 通过（engine 2579、game 1316、web 491 等）。
- `pnpm --filter @uk-immigration/policy-data test` 通过，6 个文件、23 项测试。
- `pnpm --filter web test -- sources` 通过，实际运行 29 个文件、491 项测试，涵盖来源表一致性及政策页中英文内容。
- 核对 40091 网页与单条 API 的问答、指引 v12.0 快照的版本日期和小节锚点、Bill 173 官方 PDF 物理 p21（印刷第 8 页）的第 15(1)–(2) 条及付款日。复取 Bills API 的发布元数据，字节和本地副本一致。第一轮另核对了三个 GOV.UK 快照的 14 个锚点及五份既有 Appendix 的线上正文。
- 排除 `policy-sources/` 的 `git diff --check` 通过。第一轮三个 HTML 和本轮新增指引 HTML 含官方文件原有的行尾空白，已保留原始字节和 SHA-256。

## 3. 没做或没验证的

- SRC-049 为 `todo`。官方 PDF、HTML 在线可读，但从发布 API 指向的原件 URL 下载均返回 HTTP 403，常规 PDF、HTML、XML、大字版 PDF 和 Bill 173–EN 都未取得原始字节。版本库已有发布元数据及 SHA-256，法案和说明原件待归档。[法案 PDF 第 21 页](https://publications.parliament.uk/pa/bills/cbill/59-02/0173/260173.pdf#page=21) · [议会发布 API](https://bills-api.parliament.uk/api/v1/Bills/4316/Publications)
- PD-078 的正式扩容名单、新申请 cap 和生效日，以及 PD-081 的逐日边界、section 3C 计法仍待官方明确。第一轮书面问题列表 API 的关键词查询超时。本轮按指定问题号取得了 40091 的完整答复。
- 本轮无新 PD。规则、参数及游戏代码未改。第二轮改动留在工作区，由 Fable 验收、提交和开 PR。

## 4. 发现与建议

- **建模 Option E 的入境及换签评估。** 在 `packages/game/src/graduate-route.ts` 的 `graduateSalaryChecks` 和 `packages/game/src/characters/graduate.ts` 的签证中心流程接入独立的许可评估，传入签证有效区间、境内预计决定日与 CoS 日期，复用 `packages/policy-data/src/parameters/current-law-2026-11.ts` 的新入职者参数，PD-081 的边界可改变结果时返回 `UNKNOWN`。［SRC-004 SW 4.2、12.1–12.3、18.1–18.1A；SRC-050 §16、§16.1、§23.1；SRC-059 `#premature-end-of-employment-or-study-cancellation-process` 首个列表项］
- **建模 Student 的普通工时和课程后许可。** 在 `packages/game/src/characters/graduate.ts` 的 `graduate.timeline` 录入 CAS 课程类型、起止日及担保条件，工时另用学期日历和课程完成日判断。［SRC-051 ST 25.2–25.3、26.1–26.6；SRC-052 `#work-conditions`、`#student-period-to-grant`］
- **补建 SW 24.3 row E，并测试过渡截止。** 在 `packages/engine/src/rules/current-law/skilled-worker.ts` 的 `settlementSalaryRow`、`CL-SW-SALARY`、`CL-SW-GOING-RATE` 覆盖该群体，核对 2026-12-01 前后两侧及独立的 going rate 分支。［SRC-004 SW 14.5(c)(iii)、24.3 row E、24.4(a)；SRC-050 §13.5、§22.4］
- **补归档 SRC-049 原件。** 取得官方原件后，在 `docs/SOURCES.md` 的 SRC-049 快照列登记 Bill 173 及 Bill 173–EN 的 SHA-256 与原件 URL，再运行来源检查。［SRC-049 第 15(1)–(2) 条，物理 p21，及 Bill 173–EN 物理 p37］
