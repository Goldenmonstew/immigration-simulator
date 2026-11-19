# 任务 33b · 现行法 Skilled Worker、家庭与英语条件

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
