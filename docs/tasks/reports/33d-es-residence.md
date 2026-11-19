# 任务 33d｜Earned Settlement 居留、基本要求与过渡修正

## 1. 做了什么

建议 Fable 提交 `Fix: 修正改革居留、基本要求与过渡判断`。提交包含 `packages/engine/src/{aggregate,evaluate,types}.ts`、`packages/engine/src/rules/es-{residence,requirements,transitional}.ts`、引擎测试和快照、`apps/web/test/questionnaire.test.ts`，以及顾问包、契约、过渡摘要、待定事项和本报告。

- **A4#2–#4、A6#9**。紧接的历史 LOTR、分类未定的 Appendix FM 许可转 Private Life、Protection Work and Study 回切 Core Protection，在改革居留明细保留 `UNKNOWN`。排除争议许可得出的日期作为条件满期日。已知的普通五年伴侣许可转 Private Life 按跨组重算。依据 SRC-001 p24 注 12、p23 注 9、p25、p38、p40 案例 B。现行 Private Life 的合并规定见 SRC-028 PL 14.3。
- **A4#5、#6a–#6c、#7、A6#8、#11**。Safe and Legal 缺安置计划时，受计划影响的英语或考试适用性为 `UNKNOWN`。犯罪记录仅有日期、政府债务仅有布尔申报时，明细保留 `UNKNOWN`。犯罪短路双语说明区分英国成年犯罪、海外定罪和未成年时的酌情处理。丧偶伴侣和其他相关框架外群体依 PD-027、PD-028、PD-051 显示待定要求。成年违规和 public funds 使用影响路径时，双语结果披露计入实施前记录的 PD-004 假设。依据 SRC-001 p12–p13、p21 注 7–8、p25–p26、p34、p39、p41，及 SRC-037 第 39721 号答复第 2 段。
- **A4#8a、#8b、#9、#10**。护工许可从截止当日或之后开始、且只知道许可日期时，过渡资格为 `UNKNOWN`（PD-036）。缺 SOC 且其他已知条件容许适用时，两类过渡提示补填。二次 Health and Care 签证的引擎提示和文档摘要都写明仅限该行业真实工作。新增 PD-082 记录普通 Appendix FM 伴侣许可能否合并计算，依据 SRC-001 p42–p45 与 SRC-004 SW 21.1–21.2。
- **A6#7、#10**。已停止领取的 public funds 在所选路径满期前退出回看且可重评短路径时，分别提供 `pathwayCompletionDate` 和 `publicFundsReassessmentDate`。对 high talent permission 的主申请人独立显示 Highest Talent Group 为 `UNKNOWN`（PD-011），收入路径继续按已知门槛计算。依据 SRC-001 p18、p39、p23 注 10、p46 Table 1 注 16。

与 33a 基线 `66f1c40` 比较，56 个黄金案例中两例的改革日期字段变化，所有案例的总状态和路径年限保持一致。

| 黄金案例 | 日期变化与原因 |
|---|---|
| `G-UNIVERSAL-CREDIT` | 2026 年模拟的二十年路径条件满期日为 `2041-06-01`。停止领取后可自 `2028-11-01` 重评。回归测试用持续许可及收入复算，确认重评首日可走五年路径。 |
| `ES-OFFICIAL-INDIVIDUAL-D` | 二十年路径条件满期日为 `2035-06-01`，可自 `2028-10-01` 重评。两例原有的最早申请日期字段都已清除。 |

明细另有三例变化。`G-CRIMINAL-RECORD` 的犯罪明细从 `FAIL` 改为 `UNKNOWN`。`ES-OFFICIAL-P31-INDIVIDUAL-B` 缺 SOC，两类过渡明细改为 `UNKNOWN`。`ES-OFFICIAL-P45-INDIVIDUAL-C` 只记录转入许可的起始日，护工过渡明细改为 `UNKNOWN`，十年标准路径仍通过。另有 23 例新增人才资格待定明细。`G-OVERSTAY-BREACH` 的二十年结果增加了历史回看假设。

## 2. 怎么验证的

已逐项回查政策快照，按核对编号新增回归测试，重生成黄金案例、双语快照和顾问包。对照 `apps/e2e/tests/questionnaire.spec.ts` 和 `docs/playtest/kit.md` 第 7 节覆盖的五处案例引用，日期和总状态都与快照一致。

| 命令 | 结果 |
|---|---|
| `pnpm --filter @uk-immigration/policy-data test` | 23 项通过 |
| `pnpm --filter @uk-immigration/engine test -u` | 已重生成快照与顾问包 |
| `pnpm --filter @uk-immigration/engine test` | 2,608 项通过，1 项需显式启用的文案导出测试跳过 |
| `pnpm --filter web test` | 491 项通过 |
| `pnpm lint`、`pnpm typecheck` | 通过 |
| `pnpm --filter @uk-immigration/engine build`、`git diff --check` | 通过 |

## 3. 没做或没验证的

- 采纳本次范围内成立的复核结论。A4#1 随 33a 完成。A4#10 的合并口径无法从快照核实，按要求仅登记 PD-082，依赖合并的护工过渡日期仍可能随正式口径而变。
- 沿用现有问卷和分享字段。仅凭许可起始日无法区分明确晚于截止点的申请与跨截止点申请，截止前起始日仍作为转入日期的近似值。仅凭犯罪日期和债务申报也无法辨别犯罪地、英国对应罪名、具体债务或还款安排。
- Playwright、浏览器验收、提交和 PR 留给 Fable。33e 的规则文件与现行法路线文件留在各自任务范围。

## 4. 发现与建议

- 任务 49 可读取 `pathwayCompletionDate` 和 `publicFundsReassessmentDate` 分别显示条件满期与可重评日期。可重评日期之后仍需按新的申请日核对居留、收入和其他要求。

## 合入 33a 第 3 轮

- A4#10 的护工过渡合格期合并口径改登记为 `PD-082`，本报告的两处引用已同步。`PD-081` 对应任务 32 的新入职者期限计算口径。
- 以合并提交 `3a8df0f` 的第一父提交 `c0fb319` 为合入前基线，逐字段比较了 56 个黄金案例。仅 `G-HKBNO-ONE-MONTH-SHORT` 的现行法最早申请日由 `2026-11-03` 调整为 `2026-12-01`，结论仍为 `LIKELY_NOT_ELIGIBLE`。案例中已录入的许可于满期前一天到期，新日期依赖许可连续续接。改革栏的黄金结果一致。问卷端到端测试与试玩手册第 7 节覆盖的案例均与快照一致。
- 运行快照更新命令后，黄金案例快照、双语快照及顾问审阅包的内容均与合并提交一致。

| 命令 | 结果 |
|---|---|
| `pnpm --filter @uk-immigration/engine test -u` | 2,618 项通过，1 项文案导出测试按默认配置跳过 |
| `pnpm --filter @uk-immigration/policy-data test` | 23 项通过 |
| `pnpm --filter @uk-immigration/engine test` | 2,618 项通过，1 项文案导出测试按默认配置跳过 |
| `pnpm --filter web test` | 498 项通过 |
| `pnpm lint` | 通过 |
| `pnpm typecheck` | 通过 |

本轮只编辑工作区文件，Playwright 与正式验收由 Fable 接续。
