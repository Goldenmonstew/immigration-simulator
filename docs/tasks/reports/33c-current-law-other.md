# 任务 33c · 现行法其他路线的条件修正

## 1. 做了什么

建议提交 `Fix: 修正现行法其他定居路线的条件`，由 Fable 审核和提交。

- **A3#2 · UK Ancestry**。复用 33a 已接通的转路线候选，按最近一次 UK Ancestry 主申请人许可的到期日倒算。双语结果注明 CR 1.1(d) 和倒算日期。境内递交与英语按实际申请日核对，Commonwealth 国籍和工作等沿用现有假设。覆盖转 Skilled Worker、到期前差一天以及申请日英语门槛。涉及 `ancestry.ts`、`shared.ts`。SRC-008 CR 1.1(d)，SRC-026 UKA 10.2(d)–10.3、12.1–16.1。
- **A3#7 · Private Life**。双语说明补上儿童和 young adult 许可持有人的非法入境例外，并注明在实际申请日核对所列许可是否满一年。涉及 `private-life.ts` 和 `current-law-2026-11.ts`。SRC-028 PL 14.4(a)–(b)。
- **A3#8 · Global Talent 奖项**。续签留空时读取首个主申请人片段里申报的奖项。首签明确按背书获批时，续签片段的奖项不能触发奖项分支。涉及 `global-talent.ts`。SRC-021 GT 10.1–10.2、11.1(c)。
- **A3#10 · Global Talent 子女**。家长已按 Global Talent 定居且子女当时持其 dependent child 许可时，使用已发生的定居判断关系条件。结果可显示申请日，子女的独立居留要求为零年。涉及 `global-talent.ts`。SRC-021 GT 27.1(b)(i)、27.2–27.3。
- **A3#12 · BN(O) adult dependant relative**。复用既有许可时间线，检查亲属定居前最后一次许可。只有所列主申请人或伴侣许可可通过 HK 59.1(b)。结果单独说明英国公民分支，无法确认时返回 `UNKNOWN`。涉及 `hong-kong-bno.ts`、`shared.ts`。SRC-020 HK 59.1(b)–(c)。[GOV.UK 原文](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-hong-kong-british-national-overseas)
- **A3#13 · Innovator Founder**。一般 Endorsing Body 或支持上次获批的同一家 Legacy Endorsing Body 满足机构条件，另一家 Legacy Endorsing Body 判 `FAIL`，缺少资料判 `UNKNOWN`。增加一个可选申报字段，同步中英文问卷、草稿更新和分享校验。涉及 `innovator.ts`、`types.ts`、`episodes.tsx`、`questionnaire.ts`、`share.ts` 和双语字典。SRC-027 INNF 17.5。[GOV.UK 原文](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-innovator-founder)
- **A3#14 · Settlement Protection**。最后获批的主申请人保护许可即使到期，仍可进入评估。分别检查许可类别、连续保护期间和保护身份。问卷复用相同判断显示既有的身份撤销复选框。涉及 `protection.ts`、`shared.ts`、`scope.ts`、引擎 `index.ts` 和 `form-kit.tsx`。SRC-023 STP 1.3、3.1、4.1–4.2。[GOV.UK 原文](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-settlement-protection)

56 个黄金案例及 fixture 中，只有 `CL-INNOVATOR-FOUNDER-THREE-YEARS` 的现行法结论变化。保留样例的原始输入，因背书机构未申报，结果从 `LIKELY_ELIGIBLE` 改为 `INSUFFICIENT_INFORMATION`，移除原来的三年路径和申请日。已同步对应 fixture、黄金快照、双语快照和 `docs/review/adviser-packet.md`。该案例没有对应的问卷 e2e 或试玩人物卡。

## 2. 怎么验证的

- 动手前对照 `policy-sources/` 和 A3 复核表核对七条条款。带 `A3#` 的九个引擎断言在 33a 基线上均失败，修正后全部通过。A3#2 在基线上已能通过居留条件，失败的是缺少 CR 1.1(d) 和倒算日的解释。
- `pnpm --filter @uk-immigration/engine test -u` 通过并重生成快照。逐项比较前后 56 个案例的结论、日期、路径和规则状态。
- `pnpm --filter @uk-immigration/policy-data test` 通过 23 项。`pnpm --filter @uk-immigration/engine test` 通过 2,602 项、跳过 1 项。`pnpm --filter web test` 通过 495 项，覆盖新字段的双语渲染、草稿、分享链接，以及已到期保护许可的撤销复选框。
- `pnpm lint`、`pnpm typecheck` 和 `git diff --check` 均通过。分别用 `pnpm --filter @uk-immigration/policy-data build`、`pnpm --filter @uk-immigration/engine build` 和 `pnpm --filter web build` 构建受影响目标，均通过。

## 3. 没做或没验证的

- 七个修正项均有快照原文支持。A3#1、#3、#5、#6 由 33a 处理。A3#4、#9、#11、#15、PD-069 的跨路线计时以及 GT 27.1(b)(ii) 的英国出生例外均留在各自的范围内。
- 未运行 Playwright 或浏览器视觉检查。双语问卷通过服务端渲染测试检查。未提交、未推送。

## 4. 发现与建议

- 问卷只有许可生效日和到期日，历史获批顺序按许可生效日推定。BN(O) 亲属的英国公民身份仍需要独立证据。
- STP 1.2(c) 另有申请日须在英国的有效性条件，建议作为独立条目核对。[GOV.UK 原文](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-settlement-protection)

## 合入 33a 第 3 轮

### 冲突处理

- `packages/engine/src/rules/current-law/ancestry.ts`。33a 撤回历史许可入口是为了把 A3#2 留给 33c。合并后，当前持 UK Ancestry 主申请人许可时按 CR 1.1(a)–(b) 使用已录入的许可和行程。转签后按 CR 1.1(d) 从最近一次 UK Ancestry 主申请人许可到期日倒算，到期时须已完成合格期。恢复 `residence.ts` 的到期参考日、`scope.ts` 的历史候选入口和 `aggregate.ts` 的申请日英语核对。境内要求也按实际申请日核对。回归测试覆盖转 Student 前提前递交、转签后合格、到期时差一天及递交日在境外。Commonwealth citizen 和 UKA 12.1 仍按既有模型假设披露。依据 SRC-008 CR 1.1(a)–(b)、(d) 与 SRC-026 UKA 10.2(d)、10.3、12.1–15.1。[Appendix Continuous Residence](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-continuous-residence#calculating-the-qualifying-period) · [Appendix UK Ancestry](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-uk-ancestry#validity-requirements-for-settlement-on-the-uk-ancestry-route)
- `packages/engine/src/rules/current-law/hong-kong-bno.ts`。按 HK 59.1(b) 核对亲属已定居且定居前最后一次许可属于指定的 BN(O) 类别，移除对定居路线字段的额外限制。HK 59.1(c) 的英国公民分支仍需资料确认。亲属许可符合时，再按 HK 62.1(b) 核对本人的居留日期。已录入的到期或转签导致无可申请日时，输出 `FAIL`。亲属尚未定居时，沿用 33a 的同日核对。依据 SRC-020 HK 55.2(e)、59.1(a)–(c)、62.1(b)。[Appendix Hong Kong British National (Overseas)](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-hong-kong-british-national-overseas)
- `packages/engine/test/__snapshots__/bilingual.test.ts.snap`。取 33a 一侧清除标记，再运行 `pnpm --filter @uk-immigration/engine test -u` 重生成。
- `docs/review/adviser-packet.md`。取 33a 一侧清除标记，由同一条命令重生成并核对 `golden-cases.json`。

保留 33a 的已录入许可投影、随行同日核对、境内递交及 Long Residence 跨分界行程处理。33a 的 Innovator Founder 位置回归测试补填符合 INNF 17.5 的 `NON_LEGACY` 背书机构，以便分别验证位置和投影。黄金案例继续使用原始输入。

### 黄金案例变化

逐项比较两侧提交及合并后生成的 56 个案例的结论、日期、路径、判定依据和规则状态。两项差异均来自已有分支修正，变动仅在现行法栏。

| 案例 | 对照结果 | 原因 |
|---|---|---|
| `G-HKBNO-ONE-MONTH-SHORT` | 相对 33c，最早申请日由 2026-11-03 改为 2026-12-01，结论仍为 `LIKELY_NOT_ELIGIBLE`。与 33a 第 3 轮一致。 | 已录入许可于 2026-11-30 到期。满期落在许可期外，后续申请日依赖合格许可连续续接。 |
| `CL-INNOVATOR-FOUNDER-THREE-YEARS` | 相对 33a 第 3 轮，`LIKELY_ELIGIBLE` 改为 `INSUFFICIENT_INFORMATION`，移除三年路径、2026-05-01 和对应判定依据。与 33c 一致。 | 原始输入缺少 INNF 17.5 的机构资料，`CL-INNOVATOR-ENDORSEMENT` 为 `UNKNOWN`。 |

其余 54 个案例与两侧一致。合并没有产生与两侧均不同的黄金结论。本次两处变化未涉及问卷 Playwright 期望值或试玩手册第 7 节参考答案。

### 验收结果

| 命令 | 结果 |
|---|---|
| `pnpm --filter @uk-immigration/engine test -u` | 产物已刷新，补齐位置测试的背书资料后重跑通过 |
| `pnpm --filter @uk-immigration/policy-data test` | 23 项通过 |
| `pnpm --filter @uk-immigration/engine test` | 2,613 项通过，1 项按配置跳过 |
| `pnpm --filter web test` | 502 项通过 |
| `pnpm lint` | 通过 |
| `pnpm typecheck` | 通过 |
| `pnpm --filter @uk-immigration/engine build` | 通过 |

冲突标记已从四个工作区文件清除。Git 索引仍记录这四个冲突，由 Fable 暂存并完成合并提交。Playwright 留给 Fable 验收。
