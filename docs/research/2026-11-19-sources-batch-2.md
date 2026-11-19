# 第二批官方来源核对（任务 39，2026-11-19）

## 1. Appendix FM 的 adequate maintenance

**PD-075 的计算口径已明确，可以建模。** 五年伴侣路线的申请人可按 E-LTRP.3.1(c) 或过渡分支 E-LTRP.3.7(c) 满足财务要求。申请人须证明伴侣在申请时领取 E-LTRP.3.3(a) 指定福利，且能够在不依赖 public funds 的情况下在英国充分供养和安置自己、申请人及 dependants。五年路线定居经 E-ILRP.1.3(1A) 适用 Section E-LTRP。福利名单以 E-LTRP.3.3(a) 和 FM-SE ¶12 为准，两处均列有 Police Injury Pension，SRC-054 p7 的清单漏列。［SRC-024、SRC-053；[Appendix FM](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-fm-family-members#section-e-ltrp-eligibility-for-limited-leave-to-remain-as-a-partner)、[Appendix FM-SE](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-fm-se-family-members-specified-evidence)］

**能回答什么。** SRC-053 明定凭证和可计款项。¶12 段末 (i)–(ii) 要求相关机构证明当前福利资格和实领金额，并提供申请日前 12 个月内至少一份显示已入账的个人银行账单。¶12A(a)–(f)、¶18–20 定位工资、自雇、非就业收入、储蓄和住房成本的取证与处理。SRC-054 p9–10 将 Immigration Rules Introduction ¶6.2 的定义写成每周金额比较 `A − B ≥ C`。［[Immigration Rules Introduction](https://www.gov.uk/guidance/immigration-rules/immigration-rules-introduction)、[SRC-054 p9–10](https://assets.publishing.service.gov.uk/media/6911ee0de9348ac8fb54f484/Appendix%2BFM%2Band%2BAdult%2BDependent%2BRelative%2BAdequate%2Bmaintenance%2Band%2Baccommodation.pdf#page=9)］

| 项 | 可建模口径 | 依据 |
|---|---|---|
| `A` | 担保伴侣和申请人可计的当前每周净收入，扣 income tax 与 National Insurance。申请人在英国且所持许可允许工作时，可计其工作收入。可计已经实领且有资格领取的福利，变动收入按周求平均。合规现金储蓄以可证明的金额计入，限期许可除以拟授予周数，定居除以 52，再加到周净收入。 | SRC-053 ¶11–11A、¶12A(a)–(e)、¶12B、¶18–20；SRC-054 p9–10、p12–15 |
| `B` | 每周住房成本，包括适用的租金或按揭及 Council Tax。按日历月给出的金额可乘 12 再除以 52。指引要求收入和住房成本周等值有不足一便士的部分时向下舍入。个人债务从扣减项中排除。 | SRC-053 ¶12A(f)；SRC-054 p9–10、p19、p28 |
| `C` | 同等英国家庭按决定日适用费率可领取的 Income Support 周金额，按家庭成员情况确定。只有决定日和对应家庭档均有依据时才能计算。p14 的例表合计为 £246.36，比较行却写 £263.81，两者均只用于理解示例。现有年度的费率表可供后续另行登记。 | SRC-054 p6、p9、p14；[DWP Income Support 费率表](https://www.gov.uk/government/publications/benefit-and-pension-rates-2026-to-2027/proposed-benefit-and-pension-rates-2026-to-2027#income-support) |

合规储蓄按 FM-SE ¶11–11A 核对账户控制、可动用性与持有证明，通常使用申请前六个月内可证明的最低余额。应按 ¶11A 处理获准的资金转换等情形。这个分支可以使用全部合规金额，一般最低收入分支的储蓄起算额不适用。住房本身还须满足权属或专用空间、不过度拥挤及公共卫生规定。金额通过只解决供养测试。［SRC-024 E-LTRP.3.3(b)、3.4、3.9；SRC-053 ¶11–12B；SRC-054 p12–15、p19、p23–26］

**现有输入不足以直接判定。** `partnerSpecifiedBenefit` 只记录申报。年收入和普通 `cashSavings` 也不足以推得 `A` 或证明符合 FM-SE。后续应先补齐当前可计周净收入及福利凭证、合规储蓄、每周住房成本、家庭构成及决定日适用的费率。资料缺失而会影响结论时继续输出 `UNKNOWN`。未实现前，`packages/engine/src/rules/current-law/family.ts` 的 `CL-FAMILY-FINANCIAL` 继续沿用现有分支。［[PD-075](../pending-details.md#十现行法律栏家庭财务任务-64-新增)］

## 2. Immigration Act 1971 s.3C 与诺拉

**可以建模有效、按期申请的待决阶段。** 持有限期许可的人在英国境内提出有效的变更申请，原许可到期时仍待决，s.3C 自该许可届满时依法延续原许可。待决分支在决定或撤回时结束，原许可条件继续适用，除非被变更。决定先于原许可到期时，s.3C(1)(c) 的触发条件不成立。逾期递交或始终无效的申请亦不触发。符合条件的上诉和 administrative review 可另延续，离开英国时法定延续失效。［SRC-055 s.3C(1)–(3)；[现行修订条文](https://www.legislation.gov.uk/ukpga/1971/77/section/3C)、[Home Office 有效申请指引](https://www.gov.uk/government/publications/3c-and-3d-leave/3c-and-3d-leave-accessible#section-3c-leave-extended-when-an-in-time-application-is-made)、[许可条件](https://www.gov.uk/government/publications/3c-and-3d-leave/3c-and-3d-leave-accessible#conditions-of-immigration-leave-where-3c-applies)］

诺拉的既有故事设定为 `2026-09-01` 递交 Graduate，Student 许可有效至 `2026-09-14`，`2026-09-15` 获批并从决定日起取得 Graduate 许可。假定她在境内有效递交、原许可到期时仍待决，并且期间始终留在英国，Student 许可在届满至获批之间按 s.3C 延续。现有按日时间线的两个 episode 首尾相接，没有单独可显示的整天待决区间。任务 40 若把决定设在更晚，届满后的待决日仍应显示原路线条件，获批才切换。若决定在届满前作出，从新许可生效日切换；逾期后才递交的等待不能用 s.3C 补空档。Graduate 转 Skilled Worker 也应把递交、原许可届满和决定分别建模。按现行 Long Residence 的连续居住口径，3C 延续期间作为相关路线的许可时间。SW 12.3 的合计年限仍按 PD-081 单独核对。［SRC-055 s.3C(1)–(3)、SRC-034 GR 8.1、SRC-050 `#dates-granted`、SRC-057 `#time-spent-on-3c-or-3d-leave`；[连续居住指引](https://www.gov.uk/government/publications/continuous-residence-caseworker-guidance/continuous-residence-guidance-accessible-version#time-spent-on-3c-or-3d-leave)］

**工作权限与许可路线要分开判断。** 待决期间按 s.3C 延续的是原 Student 许可及其条件；Student 一般不能填补永久全职岗位（SRC-051 ST 26.5(d)），但 ST 26.6 规定：在学位或以上全日制课程、合规记录良好的高校就读的 Student，有效递交 Graduate 申请后，自成功完成课程起可以在获批前开始永久全职岗位（Skilled Worker 申请则最早在课程结束前 3 个月），条件见 ST 26.6(a) 起各项。任务 40 应分别写清"许可路线仍是 Student（s.3C 延续）"与"这期间可以做什么工作（ST 26.5–26.6）"。

## 3. Workers and Temporary Workers 指引 Part 2

| 主题 | SRC-056 定位 |
|---|---|
| CoS | S2.1–S2.7 [`#What_is_a`](https://www.gov.uk/government/publications/workers-and-temporary-workers-guidance-for-sponsors-part-2-sponsor-a-worker/workers-and-temporary-workers-guidance-for-sponsors-part-2-sponsor-a-worker-accessible--2#What_is_a)，S2.8–S2.11 `#Types_of_CoS`，S3.8 `#Information_you_must` |
| 薪资 | S4.1–S4.5 `#Minimum_pay_rates`，S4.14–S4.16 `#Salary_information_you`、`#period-the-salary-must-cover` |
| Going rate | S3.29–S3.32 `#Standard_occupational_classificatio` 指向 Appendix Skilled Occupations，S4.29–S4.31 `#Salary_otherwise_reduced`、`#salary-reductions-exceptions` 定位降薪后的担保义务 |

这份 Part 2 指引可用于定位 CoS 所需字段和担保人应核查的事项。引擎的 Skilled Worker 资格与数字仍以 SRC-004 SW 4.2、SW 14、SW 24.3–24.4 及 SRC-017 的相应 SOC 表为准。11.4 报告实际指向另一份路线专用指引，其 SK6.30、SK6.48–SK6.49 和 SK7.4–SK7.5 分别定位 going rate 与津贴过渡安排。该文档供交叉核对，本批存档范围为 Part 2。［[路线专用指引 SK6](https://www.gov.uk/government/publications/sponsor-a-skilled-worker/workers-and-temporary-workers-sponsor-a-skilled-worker-accessible#transitional_arrangement_for_going_rates)、[SK7](https://www.gov.uk/government/publications/sponsor-a-skilled-worker/workers-and-temporary-workers-sponsor-a-skilled-worker-accessible#transitional_provision_allowances)］

## 4. Continuous residence 的缺席计数

**任务 31 A1#17 的整天口径可以核实。** SRC-057 `#count-whole-days` 只计人在英国境外的整天，指引示例明确返英当天不计。按这个口径推导到仅有日期的行程，出境与返英两个日期均排除，取严格位于其间的日历日。同日或相邻日期往返计零天。以周一出境、周三返英为例，只计周二。`packages/engine/src/residence.ts` 的 `restartAfterAbsences` 目前按包含两端的区间计算，现行规则中引用该函数的路径需要统一修正。［SRC-008 CR 3.1–3.4；[SRC-057 Count whole days](https://www.gov.uk/government/publications/continuous-residence-caseworker-guidance/continuous-residence-guidance-accessible-version#count-whole-days)］

**Long Residence 跨 2024-04-11 的同一趟行程分三个量处理。** 依据 SRC-008 CR 3.3(a)–(b) 和 SRC-057 的 Example 2：

- 出境早于过渡日，整趟行程的整天数计入旧制单次 **184 天**上限，包括过渡日起仍在境外的整天。
- 同一行程中仅过渡日前的整天计入旧制累计 **548 天**上限。
- 该行程的过渡日后尾段不进入新制的滚动 **12 个月／180 天**计算。该例最早的滚动窗口从下一趟缺席的出境日开始。过渡日当天或之后新开始的行程按滚动限额核对。

用指引 Example 2 的日期演算，`2024-04-01` 出境、`2024-07-01` 返英，旧制单次计 90 天（`04-02` 至 `06-30`），旧制累计只加 9 天（`04-02` 至 `04-10`）。180 天滚动窗口由下一趟 `2024-08-01` 出境触发。这里的 90 与 9 是将整天口径应用到官方日期所得，指引未逐日列数。`restartAfterAbsences` 已区分旧制单次、过渡前累计与新制滚动窗口，后续应保留此区分并覆盖临界用例。Earned Settlement 如何计仍见 PD-054，SRC-057 只确认现行口径。［SRC-008 CR 3.1、3.3–3.4；[SRC-057 跨过渡日示例](https://www.gov.uk/government/publications/continuous-residence-caseworker-guidance/continuous-residence-guidance-accessible-version#example-2---appendix-long-residence-qualifying-period-started-before-11-april-2024-and-was-completed-on-or-after-11-april-2024)、[滚动窗口](https://www.gov.uk/government/publications/continuous-residence-caseworker-guidance/continuous-residence-guidance-accessible-version#the-12-month-period)］
