# 任务 33b · 现行法 Skilled Worker、家庭与英语条件

## Fable：合入 33a 最终版与审核第 1 轮修正

2026-11-20 起开发由 Fable 实现，Codex（gpt-6.2-sol）只读审核。

**合并（`c73c54a`）**：33a 最终版（#26）与 33b 都改了缺席计算和英语核对，手工合并后两边行为都保留。
- `residence.ts`：33b 的出入境日不计缺席（A1#17）、计入行程与 CR 3.6；33a 的逐趟单次上限（CR 3.3）、有效许可分段、位置检查与 section 3C。
- `aggregate.ts`：33b 按预计申请日重算英语与 Life in the UK（A6#6）；33a 的出境日恢复候选、成年 BN(O) 子女核对与位置显示。
- 两条 33a 回归因出入境日不计缺席而调整日期，均在新日期当天重算通过。

**审核 `review33b-1` 的修正**：
1. 已录入后续续签时，届时须达 B2 或补 Life in the UK 不再让工签预测日期消失。只有已录入许可的薪资或 going rate 不达标才顺延；英语与考试列为届时待满足的条件（SRC-004 SW 22A.1、23.1）。随行人的共同日期同理，主申请人当日条件写入说明。
2. 出境当天位置不明时，随行人的共同日期按该日重算本人的英语与 Life in the UK，不达标则不保留（SRC-004 SW 37.2(d)、44.1）。
3. 旧规薪资资格要求从旧规获批起连续持有，一天无许可即中断（SRC-004 SW 4.2(b)(ii)）。法定例外未建模。
4. 登记 SRC-060（HC 590 Implementation：2024-04-04 前签发 CoS 的申请按旧规则审理），A1#17 的居留规则补引 SRC-057 `Count whole days`。going rate 的工时说明恢复为"每周 37.5 小时"，数值改由政策参数 `goingRateWeeklyHours`（SRC-017 Table 1 引言）提供。
5. 游戏的诺拉工签报价补 CoS 签发日与"不在 ISL"标记（SOC 2136 不在 SRC-019），恢复低报价 `FAIL` 与工时说明，游戏测试通过。
6. Long Residence 旧限额回归恢复 548／549 整天边界。

三条引擎回归（`review33b-1 #1–#3`）在修正前均失败，修正后通过。复核 `review33b-2` 指出契约仍写"主申请人 FAIL 即顺延"，已改为：薪资不达标才顺延，英语与 Life in the UK 作为届时待满足的条件；新增回归区分共同日期的预测与当日复算。黄金案例相对合并提交无变化，双语快照与顾问包更新了来源和工时说明。

**留作后续**：出境日到候选日之间满 65 岁时，汇总层仍按模拟日的 Life in the UK 状态淘汰工签日期（review33b-2 风险）；ISL 移除后的同岗续签例外与仅提供 Option D／I 的情形（SW 11.2）；模拟日之后才生效的 Appendix FM 许可与 CR 3.6；预测未按递交日核对英语等级的其余路线。


## 1. 做了什么

建议 Fable 用一笔提交 `Fix: 按担保证据、家庭许可和申请日修正现行定居评估`。纳入引擎与政策数据、相关问卷筛查和共享校验、回归测试和生成快照，以及契约、Playwright 期望、试玩手册和本报告。

| 条目 | 修正与依据 |
|---|---|
| A1#2 | ISL 按最近一次许可的担保记录判断。CoS 必须在移除日之前签发。岗位、地区或时间证据不足且会影响薪资结论时返回 `UNKNOWN`。SRC-004 SW 24.3 rows B/D、SW 11.1–11.3 与 SRC-019 表前引言和对应 SOC 行。 |
| A1#3 | Health and Care ASHE 假设涵盖担保、雇用或服务安排，定位改为 SRC-004 SW A1.1(a)–(m)。 |
| A1#4 | 按连续 Skilled Worker 许可首段使用的 CoS 核对旧规获批，保留连续持有及定居申请截止日。许可从分界日起生效且无 CoS 时，按可能适用的薪资行核对。SRC-004 SW 4.2(b)(ii)、SRC-017 Table 2。[HC 590 Implementation](https://www.gov.uk/government/publications/statement-of-changes-to-the-immigration-rules-hc-590-14-march-2024/statement-of-changes-to-the-immigration-rules-hc-590-14-march-2024-accessible-version#implementation) |
| A1#5 | Tables 1a／2aa 接受对应 Option D／I 和 Temporary Shortage List 的担保证据。SRC-004 SW 6.1–6.1A、11.3 与 SRC-017 Tables 1a／2aa 引言。 |
| A1#6 | Table 3 的 `UNKNOWN` 原因区分表中已列金额的岗位和需查 Table 4／5 的薪级。SRC-004 SW 24.3 row D、SRC-017 Tables 3–5。 |
| A1#13 | Skilled Worker 伴侣居留只计申报为伴侣的许可。明确为 child 的片段中断计期，历史家属身份缺失且可能改变结果时返回 `UNKNOWN`。SRC-004 SW 39.1、42.1、43.1。 |
| A1#16 | 主申请人引用 HC 1691 物理 p24 APP SW5，家属引用物理 p24–25 APP SW8。SRC-007、SRC-004 SW 22A.1、44.1。 |
| A1#17 | 出境与返英之间的整天才计入缺席。Long Residence 的过渡仍按实际出境日分组。同步了共享说明及 Long Residence 文件的两条中英文说明。SRC-008 CR 3.1、3.3–3.4。[整天计数](https://www.gov.uk/government/publications/continuous-residence-caseworker-guidance/continuous-residence-guidance-accessible-version#count-whole-days) [十二个月窗口](https://www.gov.uk/government/publications/continuous-residence-caseworker-guidance/continuous-residence-guidance-accessible-version#the-12-month-period) [Example 2](https://www.gov.uk/government/publications/continuous-residence-caseworker-guidance/continuous-residence-guidance-accessible-version#example-2---appendix-long-residence-qualifying-period-started-before-11-april-2024-and-was-completed-on-or-after-11-april-2024) |
| A2#4 | 十年伴侣路线依据后续可识别的 Appendix FM 伴侣或父母许可，排除符合 CR 3.6 的历史缺席。SRC-008 CR 3.6、SRC-022 SETF 4.1。 |
| A2#9 | 用申报国籍判断英语，假设申请人可提交合格的国籍证明。Long Residence 单独采用本路线的标准。SRC-014 EL 4.1、SRC-025 KoLL 2.2(a)(i)、4.8–4.10 与 SRC-005 LR 13.1–13.2。[护照国籍代码](https://design.homeoffice.gov.uk/design-system/patterns/ask-users-for/passport-details/enter-details) |
| A2#10 | 十五年例外分别按 EL／KOL 与 KoLL 核对。指定申请日的证据已确认时，适用于英语和 Life in the UK。缺证据时保留 `UNKNOWN`。SRC-014 EL 1.1(d)、SRC-015 KOL 1.1(d)、SRC-025 KoLL 3.2、4.14。 |
| A6#5 | 按 SW 39.1(b) 评估已定居主申请人的伴侣，并保留伴侣本人的 suitability 筛查。引擎和问卷均可继续计算现行法栏。SRC-004 SW 37.2(e)(ii)、38.1–38.2、39.1(b)。 |
| A6#6 | 以预计申请日重算该路线的英语、Life in the UK 及豁免，将待满足或确认的条件保留在引擎摘要。SRC-004 SW 22A.1、23.1、44.1、45.1，SRC-014 EL 1.1 与 SRC-015 KOL 1.1。 |

黄金案例变化均在现行法栏。

| 案例 | 变化及原因 |
|---|---|
| `G-SW-ABSENCE-200-DAYS` | 最早日期从 2028-07-01 提前到 2028-06-30。返英日不计作整天缺席。 |
| `G-SW-CARE-WORKER`、`ES-OFFICIAL-P45-INDIVIDUAL-A` | 从五年可能符合改为信息不足。无法据 SOC 单独确认 ISL，较低薪资门槛有待核实。 |
| `G-STUDENT-GRADUATE-SW` | 从十年 Long Residence 投影改为五年 Skilled Worker 的条件性投影，最早日期仍为 2029-08-18。首段许可旧规资格未确认，going rate 从失败改为未知。 |
| `ES-OFFICIAL-P45-INDIVIDUAL-C` | Skilled Worker 一般薪资从失败改为未知。十年 Long Residence 总评及日期照旧。 |

已同步 `apps/e2e/tests/questionnaire.spec.ts` 的缺席日期与 `docs/playtest/kit.md` 第 7 节 A2 人物卡的路径与条件。

## 2. 怎么验证的

- 按复核条目回读仓库政策快照，另查 GOV.UK 的 HC 590 Implementation、Home Office 缺席指引，并用 `pdftotext -f 24 -l 25 -layout` 核对 HC 1691 物理页序。
- `pnpm --filter @uk-immigration/engine test -u` 重新生成黄金案例、双语快照与 adviser packet。逐案例对比 33a 基线后，再用普通测试命令核验。
- `pnpm --filter @uk-immigration/policy-data test`、`pnpm --filter @uk-immigration/engine test`、`pnpm --filter web test` 分别通过 23、2,609、492 个测试。引擎的一项可选文案导出按默认配置跳过。
- `pnpm lint`、`pnpm typecheck`、`git diff --check` 通过。
- `pnpm --filter web... -r --workspace-concurrency=1 build` 通过。政策数据、引擎、游戏依赖及 Web 均完成构建，Next.js 生成静态页面。

## 3. 没做或没验证的

- 按任务约定未提交、未 push、未运行 Playwright，也未启动浏览器。Fable 负责验收、提交和开 PR。
- 指定条目均按复核表的裁定范围处理。A1#3 保留了 ASHE 担保安排假设。A1#6 保留了没有具体岗位、地区或薪级时的 `UNKNOWN`。A2#4 的 CR 3.4(g) 仍按复核表认定为已明示的简化。现有许可类型无法确认旧 paragraph 276ADE 或 276BE(2)。
- 已申报的 Skilled Worker 伴侣片段仍假设是同一主申请人。沿用现有问卷题目，CoS 日期、附加表担保依据及十五年例外证据可以通过引擎输入和共享情景提供。教师证明和国籍文件仍需实际核对。SRC-019 缺失的历史 Shortage Occupation List 担保记录也需人工核对。

## 4. 发现与建议

- 任务 39 分支已将 Continuous residence 指引登记为 SRC-057。请 Fable 在 39 合并后给 A1#17 补该来源编号，并保留 `#count-whole-days`、`#the-12-month-period` 与 Example 2 的定位。
- 任务 49 可直接使用现行法投影的语言规则结果和待确认条件，呈现条件性日期。

## 合入 33a 第 3 轮

### 冲突处理

| 文件 | 合并结果与依据 |
|---|---|
| `packages/engine/src/aggregate.ts` | 采用 33a 的候选递交日及续接假设。连续居留计算没有给出递交日时，汇总层不会再用满期周年日补出一个日期。保留 33b A2#9、A2#10、A6#6 的路线专用英语、Life in the UK 和豁免计算，按投影递交日重算并披露待满足或待确认的条件。Long Residence 单独按 LR 13.1、14.1 核对。UK Ancestry 恢复当前持该路线许可的入口，并使用该路线的常规语言判断。SRC-008 CR 1.1(a)–(b)、SRC-004 SW 22A.1、23.1、44.1、45.1、SRC-005 LR 13.1、14.1、SRC-026 UKA 10.3、12.1–14.1。 |
| `packages/engine/src/residence.ts` | 保留 33a 的已录入许可到期及转签核对、`notBefore` 和候选日境内核对。Long Residence 按每趟行程的实际出境日分组，然后在各组内剔除出境和返英日，再对重叠缺席整天去重。`countedTrips` 继续支持 CR 3.6 豁免。境内递交和 CR 4.1(d)(iii) 的有效许可核对使用原始行程日期，参考日搜索也保留实际返英日。SRC-008 CR 1.1、3.1–3.3、3.6、4.1(d)(iii)。[Home Office 整天计数指引](https://www.gov.uk/government/publications/continuous-residence-caseworker-guidance/continuous-residence-guidance-accessible-version#count-whole-days) [Long Residence 过渡示例](https://www.gov.uk/government/publications/continuous-residence-caseworker-guidance/continuous-residence-guidance-accessible-version#example-2---appendix-long-residence-qualifying-period-started-before-11-april-2024-and-was-completed-on-or-after-11-april-2024) |
| `packages/engine/src/rules/current-law/family.ts` | 十年伴侣路线同时传入 CR 3.6 筛过的缺席和 33a 的候选日约束。随行子女用 `notBefore` 在同一候选递交日核对双方。主路线继续按实际递交日判断申请人是否在英国。SRC-008 CR 3.6、SRC-022 SETF 1.2(d)、1.3、4.1、12.1(a)。 |
| `packages/engine/src/rules/current-law/skilled-worker.ts` | 主申请人尚未定居时，按 SW 39.1(a) 及 CR 3.2 在同一候选日分别重算双方。伴侣只计 SW 42.1、43.1 允许的伴侣许可。把历史身份未填的片段视作可能的伴侣许可重算后，若能得到更早的共同日期，返回 `UNKNOWN`。主申请人已定居时按 SW 39.1(b) 核对当时的许可，并继续保留伴侣本人的 SW 38.1–38.2 suitability 筛查。SRC-004 SW 37.2(d)–(e)、38.1–38.2、39.1、42.1、43.1、SRC-008 CR 3.2。 |
| `packages/engine/test/__snapshots__/bilingual.test.ts.snap` | 用 33b 版本移除冲突标记，由引擎测试重生成。 |
| `docs/review/adviser-packet.md` | 用 33b 版本移除冲突标记，由同一批引擎结果重生成。`packages/engine/test/__snapshots__/golden-cases.json` 也从 33b 基线重生成。 |

两条随行日期回归同步调整。Skilled Worker 和 Global Talent 的同一组旧许可行程按整天合计 192 天，原来含出入境日时是 196 天。结合按申请日周年分窗和 CR 1.1(b)，两条回归的共同最早申请日由 2026-11-19 提前到 2026-11-16。测试验证 2026-08-01 和 2026-11-15 仍未满足，2026-11-16 通过。

### 黄金案例变化

逐栏比较合并前 33b（`edcdca7`）、33a 第 3 轮（`b62e54b`）及本次重生成结果的 56 个案例。每一栏的结论、日期、路径和规则状态均与至少一边一致。两边有差异的 6 个案例均在现行法栏。

| 案例 | 合并结果 |
|---|---|
| `G-HKBNO-ONE-MONTH-SHORT` | 合并 33a 第 3 轮时为 2026-12-01。33a 最终版（#26）已在 main 上改为 **2026-11-03**，前提是在许可有效期内递交、留在英国且至 12-01 仍待决定（section 3C），本 PR 相对 main 无变化。 |
| `G-SW-ABSENCE-200-DAYS` | 沿用 33b 的 2028-06-30。出入境日不计缺席，实计 198 个整天，返英日重启后按 CR 1.1(b) 得出，比 33a 的日期早一天。 |
| `G-SW-CARE-WORKER`、`ES-OFFICIAL-P45-INDIVIDUAL-A` | 沿用 33b 的 `INSUFFICIENT_INFORMATION`。仍须以最近一次担保事实确认 ISL，SOC 本身无法确认适用门槛。 |
| `G-STUDENT-GRADUATE-SW` | 沿用 33b 的五年 Skilled Worker 条件性投影。首段许可的旧规资格不明，going rate 为 `UNKNOWN`。两边日期均为 2029-08-18。 |
| `ES-OFFICIAL-P45-INDIVIDUAL-C` | 沿用 33b 的 Skilled Worker 一般薪资 `UNKNOWN`，十年 Long Residence 总评及日期沿用两边的结果。 |

现有问卷端到端期望及试玩手册第 7 节与合并后的相关黄金案例一致。

### 验收结果

| 命令 | 结果 |
|---|---|
| `pnpm --filter @uk-immigration/engine test -u` | 生成顾问包、黄金案例和双语快照。首轮刷新 35 处快照，并发现上述两处随行日期旧断言。更新断言后重跑通过，2,619 项通过、1 项可选文案导出跳过。 |
| `pnpm --filter @uk-immigration/policy-data test` | 23 项通过。 |
| `pnpm --filter @uk-immigration/engine test` | 2,619 项通过、1 项可选文案导出跳过。普通模式复核了生成内容。 |
| `pnpm --filter web test` | 499 项通过。 |
| `pnpm lint` | 通过。 |
| `pnpm typecheck` | 通过。 |
| `pnpm --filter @uk-immigration/engine build` | 通过。 |

工作区文件的冲突标记已清除。Git 索引仍保留这 6 个文件的合并状态，由 Fable 验收、暂存和提交。Playwright 按 brief 由 Fable 运行。
