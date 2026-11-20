# 任务 33a｜连续居留与最早申请日

## 1. 做了什么

前两轮可按现行法与 Earned Settlement 分组。第三、四轮各对应一次审核修正。

- **`Fix: 按现行规则计算连续居留与申请日`**。包含引擎的 `residence.ts`、`aggregate.ts` 和 `rules/current-law/` 调用处、现行法参数、契约、对应测试、快照与顾问包，以及端到端期望和试玩表。
  - **A1#7、A2#3、A3#1、A6#1**。按 SRC-008 CR 1.1(a)–(b) 从申请日及其后最多 28 天内有可计许可的参考日回溯。满期日、参考日和申请日分别计算。五年 Appendix FM 伴侣和 Appendix Settlement Protection 适用各自条文。现行法结果的双语假设说明适用路线可以提前最多 28 天递交。
  - **A1#9、A3#5、A6#2**。普通无许可空档按 CR 4.1(d) 中断。Long Residence 按出入境有效许可和缺席限额识别 CR 4.1(d)(iii) 的境外空档，按 CR 4.2 扣除。按 CR 2.1(d)、4.1(d)(v)、4.3 计入符合条件的 2020 年 8 月宽限期，包括该月中开始的空档，前提是进入宽限期前已有许可且空档期间在英国。相关扣除另核对 SRC-005 LR 11.2。月中到期的解释见 Home Office 专题指引的「Grace period」段。[Coronavirus extension concession 指引](https://www.gov.uk/government/publications/coronavirus-extension-concession-cec-and-exceptional-assurance-concession-caseworker-guidance/coronavirus-extension-concession-cec-and-exceptional-assurance-concession-caseworker-guidance-accessible#grace-period-1-august-2020-to-31-august-2020)
  - **A1#8、A3#3、A3#6、A6#3**。缺席按所选合格期裁切，现行法重叠日期取并集，CR 3.2 旧许可按实际申请日周年分窗。Long Residence 对 2024-04-11 前出境的整趟行程核对 184 天单次上限，548 天累计只取分界前且位于合格期内的天数。自分界日起出境的行程按 CR 3.1 滚动计算。
  - **A1#12、A2#2**。申报行程明确显示申请日在境外时，Skilled Worker 主申请人及随行申请人、五年 Appendix FM 伴侣的申请日检查给 `FAIL`。位置不明时给 `UNKNOWN`，例如仅知道当日出境。五年伴侣的 `CL-FAMILY-RELATIONSHIP` 按现有身份资料判断，在双语结果中披露「假设申请日你的伴侣也在英国」。依据 SRC-004 SW 19.2(d)、37.2(d) 和 SRC-024 R-ILRP.1.1(a)、E-ILRP.1.2。Long Residence 和当前持 UK Ancestry 许可的候选亦按实际递交日核对申请人位置，依据 SRC-005 LR 9.3 和 SRC-026 UKA 10.2(d)。
  - 端到端测试按栏断言日期。`G-SW-5Y-ON-DAY` 两栏都是 `2026-06-01`，`G-SW-ABSENCE-200-DAYS` 现行法为 `2028-07-01`，改革为 `2028-07-29`。已同步试玩手册第 7 节 A1–A3。
- **`Fix: 检查 Earned Settlement 缺席窗口内的峰值`**。包含 `residence.ts` 的滚动峰值计算、`rules/es-residence.ts` 调用和 **A4#1** 回归测试。按 SRC-008 CR 3.1 及 PD-054 检查行程结束日和期间的月末。复核例在 `2025-02-28` 达到 181 天，从 `2025-03-02` 重新起算。改革居留框架依据 SRC-001 第 4 章。

- **`Fix: 按已知许可、同日递交与缺席分界修正日期预测`**。第三轮修正涉及 `residence.ts`、`aggregate.ts`、`rules/current-law/` 的调用、`residence-dates.test.ts`、日期契约、生成快照与顾问包。
  1. **许可投影**。用已录入的许可核对每个参考日，包含到期、空档和转签。按 SRC-004 SW 21.2、22.1 和 SRC-008 CR 1.1(a)–(b)，已申报的 Student 转签使 2026-05-04 失去 Skilled Worker 候选，原资料在 Long Residence 预计日 2031-05-04 重算通过。转到可计的 Global Talent 时，2026-05-04 重算通过 Skilled Worker 路线。
  2. **随行日期**。在同一候选递交日核对双方，包括旧许可的申请日周年缺席窗口。工签及 Global Talent 伴侣的反例为 2026-08-01 → 2026-11-19，后者用同一份资料重算通过。BN(O) adult dependant relative 也有双方行程交错的回归例。依据 SRC-008 CR 3.2、SRC-004 SW 39.1(a)、SRC-021 GT 27.1(a)、SRC-020 HK 57.3(a)、59.1(a) 及 SRC-022 SETF 12.1(a)。
  3. **申请日位置**。BN(O)、Global Talent、Innovator Founder、Settlement Family Life、Private Life 按实际递交日判断在境外为 `FAIL`、位置无法确定为 `UNKNOWN`。未来日期跳过这两类日子。各主路线均有回归，依据 SRC-020 HK 55.2(e)、SRC-021 GT 8.2(d)、25.2(d)、SRC-027 INNF 15.2(d)、SRC-022 SETF 1.2(d)、10.2(d) 和 SRC-028 PL 11.2(d)。
  4. **Long Residence 过渡**。先按各趟出发日分旧制与滚动制，各制内再对重叠天数去重。4 月 11 日返英并再出境的反例按 4 月 11 日的新行程独立适用滚动上限。依据 SRC-008 CR 3.1、3.3 及 Home Office 连续居留指引 Example 2。[Continuous residence 指引](https://www.gov.uk/government/publications/continuous-residence-caseworker-guidance/continuous-residence-guidance-accessible-version#calculating-absences-which-started-before-11-april-2024-for-appendix-long-residence)
  5. **UK Ancestry 入口**。恢复 `origin/main` 的当前 UK Ancestry 主申请人许可入口，移除历史许可入口及其专用英语覆盖。原反例中现为 Student、国籍为 USA 的申请人不再获得 UK Ancestry 候选。当前持许可的计算继续使用 CR 1.1(a)–(b)。依据 SRC-026 UKA 10.3、12.1、13.1、14.1，历史许可的入口与完整条件留给 33c。

- **`Fix: 按实际返英日和许可延续修正递交预测`**。第四轮涉及 `residence.ts`、`aggregate.ts`、`rules/current-law/{scope,shared,long-residence,hong-kong-bno,family}.ts`、引擎与游戏回归测试、日期契约、黄金快照及顾问包。
  1. **返英与在境外的申请日**。申报返英日按抵达后递交评估，出境当日或行程资料不足仍可能为 `UNKNOWN`。现行法继续展示路线规则。BN(O) 游戏测试实际走完六个月行程，返英当天 `CL-SCOPE` 为 `PASS`，`CL-HKBNO-RESIDENCE-5Y` 仍因缺席限额为 `FAIL`。依据 SRC-020 HK 55.2(e)、63.1 和 SRC-008 CR 3.1。
  2. **`review33a-2 #1`**。Long Residence 保留每趟原始行程用于 CR 3.3(b) 单次上限和 CR 4.1(d)(iii) 出入境许可核对，累计天数按并集计算。2019-06-05 在许可空档中返英又出境的记录会中断居留，2029-05-13 重算通过。两趟各 101 天的旧制行程分别核对，保留原申请日 2026-11-04。
  3. **`review33a-2 #2`**。主申请人 2026-11-04 在境外，BN(O) 成人随行亲属仍可在同一天核对双方。最早日期是随行亲属返英的 2026-11-15，当日重算通过。另核对了 Skilled Worker、Global Talent 伴侣的同日回归，主申请人在模拟日出境期间，两条路线仍在共同预计日重算通过。依据 SRC-020 HK 55.2(e)、59.1(a)、SRC-004 SW 19.2(d)、39.1(a) 及 SRC-021 GT 8.2(d)、27.1(a)。
  4. **`review33a-2 #3`**。BN(O) 在已录入的最后一段许可到期前有效递交时，CR 1.1(b) 参考日可以有条件依赖 Immigration Act 1971 section 3C。双语说明要求申请人留在英国、有效申请到参考日仍待决定且未撤回。已知转签、许可空档和参考日前出行均有反例。黄金案例在 2026-11-03 和许可最后有效日 2026-11-30 重算均通过居留规则，并带有该假设。[BN(O) 定居指引](https://www.gov.uk/british-national-overseas-bno-visa/settle-in-the-uk#eligibility) · [Home Office 连续居留指引](https://www.gov.uk/government/publications/continuous-residence-caseworker-guidance/continuous-residence-guidance-accessible-version#time-spent-on-3c-or-3d-leave) · [Home Office section 3C 指引](https://www.gov.uk/government/publications/3c-and-3d-leave/3c-and-3d-leave-accessible#section-3c-leave-extended-when-an-in-time-application-is-made)
  5. **`review33a-2 #4`**。五年 Appendix FM 伴侣在满期后按 SRC-024 R-ILRP.1.1(a)、E-ILRP.1.2 核对候选日的申请人位置。11 月 4 日满期时身处境外，预计到 11 月 10 日返英后递交，并在当日重算通过。担保伴侣位置继续由双语假设说明。

### 黄金案例变化

与分支基线 `a13ee94` 比较，56 个黄金案例中有九个的结论或日期变化，均为现行法律栏。改革栏的滚动缺席峰值由 A4#1 回归用例覆盖。

| 案例 | 变化 | 原因 |
|---|---|---|
| `G-SW-5Y-DAY-BEFORE` | `LIKELY_NOT_ELIGIBLE` → `LIKELY_ELIGIBLE`，最早申请日 2026-06-01 → 2026-05-31 | 次日满期落在 CR 1.1(b) 参考期内 |
| `G-SW-ABSENCE-200-DAYS` | 预计日期 2028-07-29 → 2028-07-01 | 单次超限仍从返英后重新起算，预计申请日较满期日提前 28 天 |
| `G-SW-PRE-2024-SALARY-AFTER-CUTOFF` | 预计日期 2034-01-15 → 2033-12-18 | Long Residence 候选使用 CR 1.1(b) |
| `G-STUDENT-GRADUATE-SW` | 预计日期 2029-09-15 → 2029-08-18 | Long Residence 候选使用 CR 1.1(b) |
| `ES-OFFICIAL-P31-INDIVIDUAL-B-PARTNER` | 预计日期 2028-04-06 → 2028-03-09 | 现行法随行候选沿用可申请日 |
| `ES-OFFICIAL-P31-INDIVIDUAL-E` | 预计日期 2031-04-06 → 2031-03-09 | Long Residence 候选使用 CR 1.1(b) |
| `ES-OFFICIAL-P45-INDIVIDUAL-B` | 预计日期 2033-04-06 → 2033-03-09 | Long Residence 候选使用 CR 1.1(b) |
| `CL-FAMILY-FIVE-YEAR-SAVINGS-SHORT` | 预计日期 2034-06-01 → 2034-05-04 | Long Residence 候选使用 CR 1.1(b) |
| `G-HKBNO-ONE-MONTH-SHORT` | 预计日期 2026-12-01 → 2026-11-03，11 月 1 日仍为 `LIKELY_NOT_ELIGIBLE` | 在许可有效期内递交，CR 1.1(b) 的 12 月 1 日参考日有条件依赖 section 3C |

相对第四轮开始时的 `b62e54b`，仅 `G-HKBNO-ONE-MONTH-SHORT` 预计日期发生变化。核对了两条 Playwright 期望和试玩表 A1–A3，均继续适用。

第二轮相对第一轮恢复了 `G-FAMILY-5Y-LOW-INCOME`、`CL-FAMILY-PARTNER-FIVE-YEARS` 和 `CL-FAMILY-FIVE-YEAR-SAVINGS-PASS` 的 `LIKELY_ELIGIBLE`，以及 `CL-FAMILY-FIVE-YEAR-PARTNER-BENEFIT` 的 `POTENTIALLY_ELIGIBLE`。`CL-FAMILY-FIVE-YEAR-ADULT-CHILD-ENGLISH` 的子女规则恢复为 `PASS`，案例因本人英语资料不足仍为 `INSUFFICIENT_INFORMATION`。

## 2. 怎么验证的

| 命令 | 结果 |
|---|---|
| `pnpm --filter @uk-immigration/policy-data test` | 23 项通过 |
| `pnpm --filter @uk-immigration/engine test -u` | 重跑黄金案例、双语快照及顾问包生成测试。黄金 JSON 和顾问包有变动，双语快照文件无差异。Vitest 5 使用 `test -u` 传入更新参数 |
| `pnpm --filter @uk-immigration/engine test` | 2,607 项通过，1 项显式启用才运行的文案导出测试跳过，含两轮审核反例的日期测试 |
| `pnpm --filter web test` | 498 项通过 |
| `pnpm --filter @uk-immigration/game test` | 1,319 项通过，BN(O) 返英场景通过 |
| `pnpm lint`、`pnpm typecheck` | 通过 |
| `pnpm --filter @uk-immigration/engine build` | 通过 |
| `git diff --check` | 通过 |

前两轮已有 Fable 验收记录，包括全仓 gate 和 35 项 Playwright。上表为本轮在合入最新 main 后的检查。

## 3. 没做或没验证的

- 本次范围内的复核结论均采纳。A3#2 留给 33c。A1#17 留给任务 39 登记指引，计数仍按含出境及返英日的约定。A3#3、A6#3 的 CR 3.4 豁免属于复核表已披露的简化。
- 问卷缺 CR 1.1(c) 的决定日，以及确认 CR 4.1(d)(i)、(ii)、(iv) 所需的历史递交或审批资料。CR 3.2 用许可起始日代理授予日。空行程列表按无已申报缺席处理。问卷只有担保伴侣的身份，无法判断其本人位置，结果披露在英国的假设。未来日期沿用现有的其他条件推算假设，例如届时仍满足英语和薪资条件。
- section 3C 的有条件计算仅用于本轮核对的 BN(O) 居留。实际递交的有效性、待决状态和到期后的许可续接情况仍需用届时的资料核对。
- Playwright、浏览器验收、提交和 PR 由 Fable 完成，本次交付留在当前 worktree。

## 4. 发现与建议

- Long Residence 的当前路线 12 个月要求留在独立条目 A3#4，依据 SRC-005 LR 11.3–11.4。任务 39 登记 section 3C 和连续居留的官方指引时，可一并复核整日计数与跨 `2024-04-11` 的行程示例。
