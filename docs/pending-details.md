# 政府未定事项登记表（Pending Details）

> 范围：Earned Settlement、相关预算提案与现行规则中，政府**明确推迟**、**尚未规定**或原文存在歧义的事项，以及明确登记的建模假设。引擎遇到已建模的这些事项时输出 `UNKNOWN`（或按本表声明假设），不得自行补全；仅登记新提案不表示引擎已实现对应判断。
>
> 基础来源：SRC-001，《A Fairer Pathway to Settlement: Government Response to the Consultation》（CP 1707，2026-11）；后续现行 Rules、议会材料与预算案分别在各行注明 SRC 与定位，完整快照及 sha256 见 `docs/SOURCES.md`。SRC-001 的 PDF 页码与其补充 HTML 锚点分开使用。
>
> 初始登记：2026-11-04；本次来源与范围说明更新：2026-11-15（任务 12.2，sol）。

## 页码约定

- 表中 `p<N>` 一律指 **PDF 页序**：封面为 p1，按 `pdftotext -layout` 输出的换页符切分计数。
- SRC-001 PDF 实际为 **62 页**（`pdfinfo` 结果）；早期任务 brief 的 60 页记法已校正：p2 为空白页，p60–p61 为空白页，p62 为封底条码。
- 文档内印刷页码 = PDF 页序 − 4（印刷第 1 页即目录页 = p5）。
- **注意**：`docs/00-project-analysis-and-plan.md` §3 与任务 brief 中引用的页码比 PDF 页序**小 1**（疑似计数时跳过了空白的 p2）。例如 brief 的 "p14 至少 3 年" 在本表为 p15，"p45 Table 1" 在本表为 p46，"p40 过渡一般原则" 在本表为 p41。本表全部按 PDF 页序重新核对。

## 字段说明

- **原文怎么说**：自己的话概括，不超过 2 句；不是引文。
- **对引擎的影响**：什么输入组合下输出 `UNKNOWN`；在不输出 `UNKNOWN` 的地方，必须在结果页声明的假设。
- **预计何时明确**：只写原文给出的时间点；原文没说写"原文未提及"。
- "原文未提及"表示该行所引文件中找不到相关表述，不代表政府不会规定。除非另列 SRC，前六节的 `p<N>` 均指 SRC-001 PDF。

## 一、明确推迟或尚未规定的事项

### A. 实施与总体

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-001 | 技术与操作指引 | 实施前政府会发布进一步指引，补充技术和操作层面的细节，并会继续与受影响群体沟通。 2026-11-04 的议会答复继续承诺发布技术与操作指引，未给完整细节。 | p10；SRC-037，39721 Answer ¶4 | 所有依赖操作细节的判断（证据形式、计算口径、豁免认定）在指引发布前都只能基于本回应文件；结果页统一声明"规则依据为政府回应文件，非已生效的 Immigration Rules"。 | 实施前（p10），具体日期原文未提及 |
| PD-002 | 完整影响评估（Impact Assessment） | SRC-001 说完整影响评估随实施发布；后续议会答复承诺在实施前发布经济、平等、儿童影响评估，另说改革对未来定居数量的影响将列入 accompanying Impact Assessment。 | SRC-001 p54、p9；SRC-037，39721 Answer ¶4；SRC-039，41453 Answer ¶4 | 不影响资格判断。影响评估、咨询结果与 Targeted Research 均未在 `SOURCES.md` 登记，引擎不得引用其中数字。 | 后续答复承诺实施前（SRC-037 Answer ¶4）；具体日期未给出 |
| PD-003 | 实施时间表 | PDF 内没有 Earned Settlement 的生效日期或分阶段时间表；文内出现的具体日期只有 2026-03-02（庇护申请分界）、2027-02-01（care worker 失去担保的宽限期）、2027-04-06（Legacy URS 分界）、2035（2024 前 Skilled Worker 续签期限）。议会陈述（2026-11-04 核实）：下议院称改动从 2026 年 12 月的那批 Immigration Rules 修改开始提交、2027 年内实施（SRC-002 col 593）；上议院称第一阶段 12 月开始、2027 年 1 月生效，2027、2028 年还有进一步修改（SRC-003 cols 1423–1424）；后续 39721 答复重申适用方向和评估／指引承诺，未补足每批条款的确切适用日。 | p26、p38、p43、p44；SRC-002 col 593；SRC-003 cols 1423–1424；SRC-037，39721 Answer ¶2、¶4 | 两院说法给出了大致时间表，但没有生效日，也没说哪些要求进入第一阶段。Earned Settlement 规则集不设 `effectiveFrom`，按"假设在申请日适用"评估；每个 Earned Settlement 结果都附上述时间表作为假设。`POLICY_NOT_YET_IN_FORCE` 在 Statement of Changes 给出生效日之前不使用。 | 首批规则修改 2026-12 起提交（SRC-002、SRC-003）；生效日以届时的 Statement of Changes 为准 |
| PD-004 | 新要求对实施前事件的追溯 | 原文只说申请按决定日有效的规则审理、在英不代表有权按旧规则定居；没有说实施前发生的 immigration breach、public funds 使用、犯罪记录是否按新标准计入。 39721 答复重申多数未定居在英者受改革影响、指定群体获一次性过渡，但没有逐项说明实施前事件的计入口径。 | p41；SRC-037，39721 Answer ¶2 | 申请人在规则生效前有 breach / public funds 使用 / 轻微犯罪记录时，"是否适用新后果"输出 `UNKNOWN`；如要给出结论，假设为"按决定日规则整体回看，含实施前事件"并声明。 | 原文未提及 |

### B. Contribution（收入、公共服务、家庭收入、public funds）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-005 | qualifying earnings 的定义 | 原文只用 "earn / earnings" 描述门槛，没有定义哪些收入计入（工资、奖金、自雇利润、股息、海外收入、多份工作合计等），也没有说是税前还是税后。 | p15、p16、p46 | 用户收入构成只有英国雇佣工资时，按"税前年收入"计算并声明假设；含自雇、股息、海外收入或奖金占比显著时，"是否达标"输出 `UNKNOWN`。 | 原文未提及（推定在 PD-001 指引中） |
| PD-006 | 收入年度口径与证据形式 | 原文说按申请前若干 "years" 计算 best years，但没有说是 tax year 还是滚动 12 个月，也没有说用何种证据（如 HMRC 记录）。 | p16 | 引擎按完整英国 tax year 录入与计数。申请日不在税年首日时，若最早一个税年或已申报的当期税年收入归属会改变是否达标，规则为 `UNKNOWN`。没有足够的年度金额时仍显示缺少输入。滚动年度的明细归属与证据形式未建模。 | 原文未提及 |
| PD-007 | 门槛变动后各年份用哪个门槛 | 门槛与所得税门槛挂钩、会随之变动，但没有说历史年份按当年门槛还是申请时门槛比较。 | p15 | 参数文件只有现行一套门槛；历史各年份统一按现行门槛比较（`ES-EARNINGS-*`），并在结果中声明假设（与 PD-005 / PD-006 合为一条）。门槛将来按 tax year 版本化后，再考虑"按该年度当年门槛"的口径。 | 原文未提及 |
| PD-008 | 苏格兰纳税人的门槛 | Annex B 把 £50,271 与 £125,141 描述为 England 的 higher / additional rate 门槛；正文与 Table 1 只给数字，未说明苏格兰税率带不同时如何处理。 | p52；p15；p46 | 统一使用 Table 1 的数字，并对苏格兰纳税人声明"按原文数字，未按苏格兰税率带调整"的假设。 | 原文未提及 |
| PD-009 | 收入要求豁免的完整范围 | 豁免"将包括"儿童、65 岁及以上、因身心状况无法满足者；用的是 "will include"，未说是否穷尽，也未说身心状况如何认定。 | p15 | 只对这三类豁免建模；用户声明其他理由（如全职照护者）时输出 `UNKNOWN`；身心状况豁免由用户自报并声明"未核实认定标准"。 | 原文未提及 |
| PD-010 | 家庭合并收入的适用条件 | 合格的伴侣可合并收入达到 £25,142，须为 genuine and subsisting 关系，且只能一方依赖另一方收入；"eligible couples" 未定义。 | p17 | 达到个人门槛即可独立通过；若结论依赖合计、且只有金额而没有足够的合并资格资料，则输出 `UNKNOWN`。已录入主申请人的伴侣 dependant 按 PD-056 的假设合并同一 tax year 的金额。 | 原文未提及 |
| PD-011 | Highest Talent Group 的范围与资格 | Table 1 把 "通过 Highest Talent Group" 列为 3 年路径的方式之一，但注 16 说该项待 MAC 报告审查；正文只在注 10 列出 "high talent permission" 路线，没说怎样凭此进入 3 年路径。 2026-11-12 补充 HTML 的 In summary 表注仍将该资格留待 MAC 审查，不能把预算案 Global Talent 扩容当作定义。 | p46 注 16；p23 注 10；SRC-001 HTML #in-summary；SRC-032 §5.6 #access-to-talent | 3 年路径只按 £125,141（4 年中 3 年）计算；凭 Highest Talent Group 走 3 年一律输出 `UNKNOWN`。注 10 中 Global Talent / Innovator Founder 须"最近一次许可即为该路线"的条件照常建模。 | MAC 报告后，日期原文未提及 |
| PD-012 | 公共服务 5 年路径的工作年限要求 | 正文说 Annex C 职业的合格人员 5 年可定居；Table 1 表述为"在合格公共服务职业工作满 5 年"。未说明中途换入 / 换出合格职业、或部分年份在非合格职业时怎样计算。 | p16；p46 注 17；p58–p59 | 当前在 Annex C 职业，连续服务满 5 年或从合格期起点一直从事该职业时，评估五年路径。中途转入、或已连续服务满 5 年后转出时，输出 `UNKNOWN`。 | 原文未提及 |
| PD-013 | specified public funds 的最终范围与弱势群体豁免 | 先沿用现行 public funds 定义；之后政府再决定哪些福利计入、哪些弱势群体可获保障或豁免，细节在实施前公布。 委员会仍追问残障者可使用而不影响定居的支持范围及豁免制定方式；问题本身不确立豁免。 | p18；SRC-041 p4，问题 8–9 | 以现行定义（SOURCES.md SRC-006）为假设判断。已申报因身心状况豁免最低收入、且在回看期内领过 public funds 时，输出 `UNKNOWN`。其他弱势身份未另行采集。 | 实施前（p18） |
| PD-014 | 伴侣使用 public funds 是否影响申请人 | 原文只说申请人本人在申请前 5 年不应使用 specified public funds；未说明家庭成员（伴侣、子女）领取的福利是否计入。 | p18 | 申请人本人使用时按 PD-013 判断。仅已录入的家庭成员（目前为 dependant 的主申请人）使用时，`ES-PUBLIC-FUNDS` 为 `UNKNOWN`。成年 dependant 的随行评估也保留该待定项。 | 原文未提及 |

### C. Character（犯罪、债务、违规）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-015 | qualifying immigration breach 的完整清单 | 清单将在 Immigration Rules 中列明，"将包括" 逾期居留、违反许可条件、申请中欺骗、妨碍移民管制；仅适用于成年后发生的违规。 | p13 | 四类已列明违规（成年后）→ 20 年路径；其他类型违规输出 `UNKNOWN`；违规发生时是否已满 18 岁不明 → `UNKNOWN`。 | 随 Immigration Rules 发布，日期原文未提及 |
| PD-016 | 违规后 20 年的起算与回看期 | 原文说成年违规会使申请人进入 20 年路径；未说 20 年从何时起算，也未说违规有无时效（多久以前的违规不再计入）。 | p13；p46 | 按 Table 1 的写法假设"在 qualifying route 上累计满 20 年"，不设时效，并声明假设。 | 原文未提及 |
| PD-017 | 犯罪记录要求中的酌情空间 | 成年人在英有任何犯罪记录即拒绝；但海外定罪在法律体系差异情形下、以及未满 18 岁时的犯罪，保留酌情处理。未提及犯罪记录有无时效（如 spent convictions）。 | p12 | 英国境内成年后犯罪记录 → 拒绝（不设时效，声明假设）；海外定罪且行为在英是否构成犯罪不明 → `UNKNOWN`；未满 18 岁时的犯罪 → `UNKNOWN`（酌情）。 | 原文未提及 |
| PD-018 | Government debt 的范围与还款计划 | 无欠政府债务是强制要求，"将包括" NHS 债务、税款与 NI 欠款、欠 Home Office 的诉讼费用；只有 asylum support 偿还明确允许"遵守还款计划"。未提及金额下限。 | p12；p8 注 1；p39 | 有未清偿的列明债务 → 拒绝；非 asylum support 债务正在按还款计划偿还 → `UNKNOWN`；其他类型政府债务 → `UNKNOWN`。 | 原文未提及 |

### D. Integration（英语、Life in the UK）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-019 | B2 英语要求的生效日期 | B2 成为定居的标准英语要求，现有豁免（儿童、65 岁及以上、身心状况）保留；文内未给生效日期。SRC-007（HC 1691）核实（2026-11-04）：现行 Rules 已规定申请日 ≥ 2027-03-26 的定居申请须 B2，覆盖 Skilled Worker（SW 22A.1）、Long Residence（LR 13.1(b)）等多条路线（EM 5.60–5.62）。 | p21；SRC-007 p24、EM 5.60–5.62；SRC-004 SW 22A.1；SRC-005 LR 13.1 | Earned Settlement 栏：按规则集的口径，B2 视为在申请日适用（`ES-ENGLISH-B2`），Earned Settlement 自身的 B2 生效日仍未知（同 PD-003）。现行法律栏（`CL-ENGLISH`）：申请日 ≥ 2027-03-26 一律 B2；之前 Long Residence 为 B1，Skilled Worker 主申请人的定居规则不另设英语要求。因 2027-03-26 起现行规则也要求 B2，此后的申请两栏结论一致。 | 现行规则：2027-03-26（已定）；Earned Settlement：原文未提及 |
| PD-020 | Life in the UK 考试改版 | 考试要求与现有豁免继续，政府正在审查考试内容使其更贴合当代英国。 现行预约页继续提供考试预约与备考说明，未据该页确认新版考试已推出。 | p21；SRC-045，Book the Life in the UK Test／#prepare-for-the-test | 不影响"是否需要考试"的判断；考试版本不建模。 | 原文未提及 |
| PD-021 | A2 版 Life in the UK 考试（UK Resettlement Scheme 难民） | URS 难民只需 A2 英语，并在出现合适的 A2 版考试前免考。 现行预约页不是 UKRS A2 版推出公告，不能据此关闭本项。 | p9 注 3；p21 注 8；p39；SRC-045，Book the Life in the UK Test | URS 难民：Life in the UK = 当前免考，结果页注明"A2 版考试推出后可能改变"；推出日期 `UNKNOWN`。 | 原文未提及 |

### E. Residence（路线计入与组合）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-022 | Leave Outside the Rules（LOTR）群体 | LOTR 被列入"不计入定居"的路线，但注 12 承认部分 LOTR 是否本意通向定居并不清楚，政府将进一步考虑并适时公布做法。 | p24 注 12 | 任何 LOTR 时间：计入与否输出 `UNKNOWN`，不按"不计入"直接给结论。 | "in due course"，日期原文未提及 |
| PD-023 | 两张路线清单之外的路线 | 原文给出"计入"与"不计入"两张清单，并在注 9、10 中定义 core / high talent permission；未声明清单是否穷尽现行 Immigration Rules 的全部路线。 | p23 注 9、10；p24 | 路线分类表只收录两张清单与注脚中点名的路线；其余路线（例如 Domestic Worker in a Private Household、Adult Dependent Relative 等原文未点名的路线）一律输出 `UNKNOWN`。 | 原文未提及 |
| PD-024 | Long Residence 关闭的时点与在途者 | Long Residence 路线将关闭，临时路线时间不再因累计满 10 年而计入；未给关闭日期，也没有为已在累计 Long Residence 的人设专门过渡。 40262 答复另强调定居合格期不等于同长度的合法停留许可；不能把拟议合格期当作已获续签。 | p23；p41；SRC-038，40262 Answer ¶2 | 关闭日期 = `UNKNOWN`（同 PD-003）；在途者按 p41 一般原则（按决定日规则）处理，并在结果页提示"原文无针对性过渡安排"。 | 原文未提及 |
| PD-025 | 路线组划分（切换即重新起算） | 保护类或人权类路线（例如难民、Article 8）的时间不能与工作或家庭路线合并，换组时新路径重新起算；未列出各路线分属哪一组。 | p25 | Family and Private Life 内部（Appendix FM 伴侣 vs Article 8 private life）之间切换是否重置，输出 `UNKNOWN`；工作 ↔ 保护的切换按重置建模。 | 原文未提及 |

### F. Dependants

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-026 | 18–24 岁 dependant 的条件 | 保留 child-dependant 身份的 18–24 岁青年可随家庭定居，满足成人强制要求但免个人收入要求；案例称其只能在"父母双方"都定居时随同定居。 | p29；p31 | "保留 child-dependant 身份"的认定不建模，由用户自报；单亲家庭或仅一方父母定居的情形输出 `UNKNOWN`。 | 原文未提及 |

### G. 弱势群体与框架外群体

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-027 | 弱势群体的详细安排 | 政府将与受影响群体及相关机构沟通，详细安排在明年的指引中公布；这些群体"在适当情况下"仍须满足强化的犯罪与英语要求。 委员会继续询问 care leavers 路径与 migrant domestic abuse 受害者的支持，尚非政府实施答复。 | p33；p34；p26；SRC-041 p2 问题 5、p4 问题 10 | 框架外弱势群体（丧偶伴侣、UASC、local authority care 儿童、在英长大的青年、家暴受害者）：短路到"现行安排"，但"是否须满足 B2 / 新犯罪要求"输出 `UNKNOWN`。 | 原文 "next year"，即 2027 年（以回应发布于 2026-11 推算） |
| PD-028 | 强化要求对 Afghan schemes 与 Windrush 的适用 | 框架外一节开头概括说这些路线上的个人须满足强化的犯罪与 B2 要求（除非有现有豁免或保障）；而 Afghan schemes 为按资格立即定居，Windrush 为确认既有身份，二者如何叠加强化要求，原文没有逐项说明。 | p25；p26 | Afghan schemes 与 Windrush：短路到现行安排；"是否须满足强化要求"输出 `UNKNOWN`。 | 原文未提及 |

### H. 难民（任务 3.4 起建模，见 `docs/contracts.md` §11）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-029 | Protection Work and Study 推出前已在英的时间 | 对于 Protection Work and Study 推出前已获保护身份的人，政府将进一步说明已在英时间是否以及如何计入。 | p38 | `ES-PROTECTION-PATHWAY` 按用户填写的片段起止日计算、照常 `PASS`，在假设中声明并列出 PD-029 / PD-034 / PD-043，不输出 `UNKNOWN`（否则 p40 案例无法复现）。（任务 3.4） | 原文未提及 |
| PD-030 | Protection Work and Study 的 contribution 口径 | 通过工作证明 contribution 的须在三个 qualifying years 内年收入达 £12,571；未定义三年的观察窗口，也未定义"sustained work, education or training"及教育 / 培训者的 contribution 标准。 | p38；p47 | `ES-PROTECTION-CONTRIBUTION`：工作者数 Protection Work and Study 合格期内完整的 tax year（起点所在 tax year 不计，4 月 6 日起算除外），按"合格期内任意 3 年"计算并在假设中声明；不足而合格期未满 → `UNKNOWN`（PD-030）；满期仍不足 → `FAIL`；教育 / 培训 → `UNKNOWN`（PD-030）。（任务 3.4） | 原文未提及 |
| PD-031 | 难民的 public funds 与偿还安排细则 | 先沿用现行 public funds 定义；难民哪些福利可不计入、偿还义务与保障措施的细节在实施前公布。须清偿 asylum support 或遵守还款计划。 | p39 | `ES-PUBLIC-FUNDS`：Protection Work and Study 照常按现行 public funds 定义判断，用过则只剩 20 年兜底，假设提 PD-031；Safe and Legal 豁免，Core Protection 不要求。asylum support 偿还由 `asylumSupportRepayment` 自报，`ES-ASYLUM-SUPPORT` 判断。（任务 3.4） | 实施前（p39） |
| PD-032 | Article 31 保障如何运作 | 受 Refugee Convention Article 31 保护者不加 10 年；保障的具体运作在实施前公布。 | p39 | 成年后非法入境且全部声称 Article 31 → `ES-PROTECTION-PATHWAY` 输出 `UNKNOWN`（PD-032），候选按基础年限（不加 10 年）投影，解释另给加 10 年的年限与日期。（任务 3.4） | 实施前（p39） |
| PD-033 | designated Safe and Legal Routes 的清单 | 用于定居目的的 designated Safe and Legal Routes 包括 UK Resettlement Scheme 及"specified"的安置与担保路线；具体清单未列出。 | p37；p47 | `resettlementScheme = OTHER_DESIGNATED` 按用户申报视为 Safe and Legal（5 年），假设说明清单未公布、Community Sponsorship 等属 Legacy；缺省 → `UNKNOWN`。（任务 3.4） | 原文未提及 |
| PD-034 | Protection Work and Study 与 Core Protection 的启用日期 | 2026-03-02 前申请庇护且非 Safe and Legal 的难民将转入 Core Protection；Protection Work and Study 的启用日期未给出。 | p38 注 14 | 启用日未知：按所填片段日期计算，在 `ES-PROTECTION-PATHWAY` 的假设中声明（同 PD-029）。（任务 3.4） | 原文未提及 |

### I. 过渡安排细节（详见 `docs/transitional-arrangements.md`）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-035 | 过渡截止点的精确日期 | 截止点为 "Immigration White Paper 于 2025 年 5 月发布"；PDF 内没有具体日期。SRC-012 已归档核实（2026-11-04）：White Paper 封面只写 "May 2025"；gov.uk 出版页的发布日为 2025-05-12（SOURCES.md），PDF 元数据修改日同为 2025-05-12。 | p42；p43；p44；SRC-012 封面 | 截止日取 2025-05-12，记为参数 `whitePaperPublished`（来源 SRC-001 p42、SRC-012）；care worker 许可起始日 < 2025-05-12 → 适用。"进入 / 转入"以哪个日期为准仍见 PD-036。 | 已按 SRC-012 确定为 2025-05-12 |
| PD-036 | care worker 群体的认定口径 | 适用于在 White Paper 发布前"进入或转入该路线"的 care worker；未定义"该路线"对应哪些职业代码，也未说"进入 / 转入"以申请日、获批日还是入境日为准。 | p42；p43 | 用户的入境 / 转入日期都明确早于截止点 → 适用；申请在截止前、获批在截止后等跨截止点情形 → `UNKNOWN`；职业是否属"care worker"由用户自报并声明。 | 原文未提及 |
| PD-037 | care worker 失去担保宽限期的适用范围 | 自 2027-02-01 起，因担保方被吊销执照而失业的 care worker 有 120 天找到工作、再加 60 天处理签证与雇佣状态；未明确是否仅限截止点前的过渡群体，也未说"担保被撤销"之外的失业是否适用。 | p43 | 宽限期作为提示信息输出，不影响定居年限；截止点后进入的 care worker 是否适用 → `UNKNOWN`。 | 原文未提及 |
| PD-038 | RQF6 以下国家薪级医疗 / 教育岗位的职业清单 | 举例为 nursing auxiliaries 与 teaching assistants，要求岗位"为 Immigration Rules 目的处于国家薪级"；Annex C 只列 RQF6 及以上职业，RQF6 以下的清单未给出。 | p44；p58–p59 | 用户职业为两个举例之一 → 适用；其他 RQF6 以下职业 → `UNKNOWN`，直到登记 Appendix Skilled Occupations（新来源，见报告）。 | 原文未提及 |
| PD-039 | RQF6 以下医疗 / 教育群体的时间条件 | 条件写作"在 White Paper 发布前来到英国"并满足签证要求；与 care worker 的"进入或转入该路线"写法不同，未说明截止前已在英、截止后才转入该职业的人是否适用。 | p44；p17 | 截止前已在该职业 → 适用；截止前在英但截止后才转入 → `UNKNOWN`。是否须满足强化最低要求，原文本节未提及，见 transitional-arrangements.md §2.2。 | 原文未提及 |
| PD-040 | 2024 年 4 月前 Skilled Worker 群体的细则 | 2024 年提高薪资门槛时的过渡安排原定 2030 年到期，现在允许该群体按现有条件续签至 2035 年；未给群体的精确界定日期、2035 年的具体日期，也未说其定居年限是否因此改变。 | p44 | 群体界定取现行规则 SW 4.2(b)(ii)（SRC-004）：2024-04-04 前按旧规则获批 Skilled Worker 并此后连续持有（参数 `preApril2024CohortBefore`、`skilledWorkerPre2024RulesBefore`），现行规则下申请日须早于 2030-04-04（`skilledWorkerPre2024ApplicationsBefore`）。现行法律栏按此判断 SW 24.3 row C / D；Earned Settlement 栏只在假设中说明"可按旧薪资条件续签至 2035（p44）"，定居年限按标准路径计算，不因此保留 5 年；2035 年具体截止日 `UNKNOWN`。 | 部分关闭：群体界定日已取自现行规则；2035 具体日期仍未定 |

## 二、原文内部不一致

以下条目在 SRC-001 内部存在两种或以上说法。引擎的处理原则：以**更具体、更晚出现的结构化表述**（Table 1 / Table 2）为主口径，并在结论受影响时输出 `UNKNOWN` 或声明假设；不在两种说法之间自行裁决。

| ID | 事项 | 原文怎么说（各处概括） | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-041 | 10 年路径的收入年数 | Contribution 一章先说须"至少 3 年"达到 £12,571，Annex B 也说"至少 3 年"；但同章 best years 段落与 Table 1 都写"申请前 7 年中 5 年"。 补充 HTML 的 Earnings／Annex B 与 How earnings will be assessed／In summary 仍保留上述分歧，不因格式更新关闭。 | p15、p52 vs p16、p46；SRC-001 HTML #earnings、#how-earnings-will-be-assessed、#in-summary、#annex-b-the-economic-case-for-change- | 按 Table 1 的"申请前 7 年中 5 年"判断（`ES-EARNINGS-10Y`，参数 `bestYears10Year`）：达标 < 5 年即 `FAIL`，不因 p15 的"至少 3 年"输出 `UNKNOWN`；结果中声明该假设并指出 p15 的另一说法。 | 原文未提及 |
| PD-042 | 收入门槛挂钩的税种 | 个人门槛 £12,571 在正文说与所得税 basic rate 挂钩，Annex B 却说与 2026/27 NICs 门槛一致；家庭门槛 £25,142 说随 National Insurance 门槛变动。 补充 HTML 仍保留正文与 Annex B 的挂钩税种差异。 | p15 vs p52；p17；SRC-001 HTML #earnings、#household-income、#annex-b-the-economic-case-for-change- | 当前两种门槛数值相同，不影响今天的判断；参数文件须为个人门槛与家庭门槛分别记录挂钩依据，两种税种门槛将来分离时输出 `UNKNOWN`。 | 原文未提及 |
| PD-043 | 难民在新路线推出前的时间是否计入 | 注 14 说 2026-03-02 前申请庇护的（非 Safe and Legal）难民转入 Core Protection，有难民身份的时间"都会计入"；正文同页又说 Core Protection 时间不计入 Protection Work and Study 的 10 年，且已在英时间如何计入"将另行说明"。 | p38 注 14 vs p38 正文 | 同 PD-029：按片段日期计算并声明。注 14 支持把 2026-03-02 前申请庇护者的现有难民许可按 `CORE_PROTECTION` 自获保护之日起填写。（任务 3.4） | 原文未提及 |
| PD-044 | 非法入境的后果：20 年 breach 路径还是加 10 年 | 第 1 章把成年时非法入境与 qualifying breach 并列，暗示进入 20 年路径，同时说第 7 章的非法入境处理适用于所有移民；第 7 章则说非法入境者无论走哪条路线都"额外加 10 年"。 | p13 vs p38；p47–p48 | 非难民路线 + 成年后非法入境：短路 `IMMIGRATION_BREACH`，不作结论。保护类路线：按 Table 2 由 `ES-PROTECTION-PATHWAY` 加 10 年，不计入 `ES-BREACH`、不短路（任务 3.4）。 | 原文未提及 |
| PD-045 | 2027-04-06 前 URS 难民的英语标准 | Legacy Safe and Legal Routes（含 2027-04-06 前抵达的 URS 难民）属框架外，框架外群体一般须满足 B2（除非有现有豁免）；第 7 章又说 URS 难民只需 A2。 | p25、p26 注 13 vs p37、p39 | 由 `resettlementScheme = UK_RESETTLEMENT_SCHEME` 与连续 Safe and Legal 段的起点推导：早于 2027-04-06 → Legacy Safe and Legal（框架外，短路 `OUTSIDE_FRAMEWORK`），`ES-ENGLISH-B2` 输出 `UNKNOWN`（PD-045）。2027-04-06 及以后抵达者按 A2。（任务 3.4） | 原文未提及 |
| PD-046 | care worker 二次 Health and Care 签证后的定居年限 | 第 8 章说未达标者可再获 5 年 Health and Care 签证，之后"再次申请定居"；Annex A 把这部分人放在 10 年路径下估算，案例 B 只说会支持其转入真实的担保工作。 | p43、p45 vs p50 | 二次签证后的定居：按"总计满 10 年"展示并声明假设；是否仍属保留的 5 年 qualifying period 规则、是否适用 £25,000 等条件，输出 `UNKNOWN`。 | 原文未提及 |
| PD-047 | public funds 回看期是否要求在 qualifying route 上 | 正文写"申请前紧接的 5 年"未使用 specified public funds；案例 D 写须在 qualifying route 上"连续 5 年"未使用。 | p18 vs p19 | 已知回看期内使用了 public funds 时按 PD-013 和 PD-014 判断。从未申报 public funds 时按 p18 直接通过。曾经领过（已在回看期外）、而已录入的合格许可没有连续覆盖整个回看期时（案例 D 的情形），输出 `UNKNOWN`。 | 原文未提及 |
| PD-048 | 3 年 / 高人才的命名 | 第 4 章注 10 使用 "high talent group / high talent permission"（含 Skilled Worker）；Table 1 使用 "Highest Talent Group" 并注明待 MAC 审查。二者是否同一概念不明。 补充 HTML 仍保留两种命名及 MAC 审查说明，未给出可统一二者的新定义。 | p23 注 10 vs p46 注 16；SRC-001 HTML Ch.4 注 10／#in-summary 表注 | 路线分类表使用 "high talent permission"（注 10）；"Highest Talent Group" 资格按 PD-011 输出 `UNKNOWN`；持 Skilled Worker 不等于可走 3 年路径。 | MAC 报告后（p46），日期原文未提及 |
| PD-049 | Protection Work and Study 的名称 | "计入定居"的路线清单写作 "Core Protection Work and Study"；第 7 章与 Table 2 均写 "Protection Work and Study"。 | p23 vs p37、p38、p47 | 视为同一路线，路线枚举使用 "Protection Work and Study"，别名记录 "Core Protection Work and Study"。 | 原文未提及 |
| PD-050 | 5 年路径是否"不受影响" | Annex B 称 5 年路径上的人不受 Earned Settlement 影响、仍为 5 年；但正文的强化最低要求（任何犯罪记录即拒绝、B2、无政府债务）适用于所有路径。 | p54 vs p12、p21、p46 | 以正文与 Table 1 为准：5 年路径仍须满足强化最低要求；Annex B 该句不作为规则依据。 | 原文未提及 |
| PD-051 | 丧偶伴侣须满足的要求 | 第 4 章概括说框架外弱势群体"在适当情况下"须满足强化的犯罪与英语要求；第 6 章对丧偶伴侣只说须满足 suitability 与 character 要求，未提英语。 | p26 vs p34 | 丧偶伴侣：英语要求输出 `UNKNOWN`；suitability / character 按须满足处理（同 PD-027）。 | 2027 年指引（p33 "next year"） |
| PD-052 | "No debt" 小标题下的内容 | 第 7 章 "No debt" 小标题下第一段讲的是 public funds，之后才讲 asylum support 偿还。属于排版 / 标题问题，不构成规则冲突。 | p39 | 无规则影响；规则作者引用时按段落内容（public funds / 债务）分别引用，不按小标题。 | — |

## 三、引擎假设（任务 1.1 新增）

原文未规定、引擎为给出结论而采用的口径。每条都会出现在结果页的 `assumptions` 中。

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-053 | qualifying residence 的连续性 | 原文只说哪些路线计入（p23）、哪些不计入（p24），以及保护 / 人权路线与工作 / 家庭路线切换时重新起算（p25）；没有说不计入路线上的时间或许可之间的空隙是"只扣除"还是"打断连续性"。 | p23–p25 | 合格期 = 截至申请日连续处于同一类计入路线的最后一段；中间夹有不计入路线（如 Student、Graduate）或许可之间空隙超过 1 天，都视为中断、从下一段起重新起算。若政府采用"只扣除"口径，日期可能提前。 | 原文未提及 |
| PD-054 | Earned Settlement 的缺席口径 | 原文没有规定 Earned Settlement 下缺席多少天会打断连续居留。 | p22–p25 | 沿用现行 Appendix Continuous Residence CR 3.1（SRC-008）：任意 12 个月缺席不超过 180 天，超过则自该次缺席结束次日重新起算；缺席天数按含出境与入境当日计（偏保守）。CR 3.4 的可豁免缺席理由不建模。 | 原文未提及 |
| PD-055 | dependant 随主申请人定居 | 同时到达的伴侣可与主申请人同时定居（须各自满足相关要求），后到的伴侣须完成同样的合格期；18 岁以下子女随父母定居并豁免收入、债务、英语、Life in the UK；18–24 岁保留 child-dependant 身份者须满足成人强制要求、不需个人收入；家庭符合资格时已满 25 岁者须独立符合资格。 | p29–p31 | **已建模**：Earned Settlement 的 `ES-DEPENDANT-PATHWAY` 见 `docs/contracts.md` §8；现行法律已注册 `CL-SW-PARTNER-5Y`、`CL-SW-CHILD`、`CL-HKBNO-DEPENDANT`、`CL-GT-DEPENDANT`、`CL-FAMILY-CHILD`（§9、§15、§16.5），Appendix Children 已登记为 SRC-018，Skilled Worker 主申请人已定居后的 SW 39.1(b)(i) 亦已支持。HK BN(O) 伴侣／成年子女按 `CL-HKBNO-RESIDENCE-5Y` 判断。缺少 `principal`／`dependantOf` 时仍可能信息不足；不递归评估主申请人本身也是 dependant 的情形。SW 39.1(b)(ii) 的英国出生子女分支仍未建模；Earned Settlement 主申请人已定居后的缺口见 PD-063，原文未定口径见 PD-056–PD-062。 | 原文规则已定；剩余为建模范围 |

## 四、家庭建模假设（任务 2.2 新增）

dependant 随主申请人定居（SRC-001 Ch.5）时，原文未规定、引擎为给出结论而采用的口径。dependant 的请求须带主申请人的时间线（`SimulationRequest.principal`，见 `docs/contracts.md` §8）。

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-056 | dependant 伴侣须满足的收入要求 | 同时到达的伴侣"满足相关要求"即可与主申请人同时定居；Table 1 说强制要求适用于所有路径；没有说伴侣须满足哪一档收入要求，也没有说能否与主申请人合并收入。 | p29；p46 | 伴侣按最低收入要求判断（`ES-EARNINGS-10Y`：7 年中 5 年个人达到 £12,571，或与伴侣合计达到 £25,142），不按主申请人的加速门槛；已录入主申请人且当前以 partner dependant 身份持证时，合计用伴侣本人申报的 `partnerEarnings`，并声明同一税年、真实持续关系及单向依赖的假设。其余合计收入适用 PD-010。 | 原文未提及 |
| PD-057 | 后到伴侣的"同样合格期"取几年 | 后到的伴侣须完成"同样的合格居留期"；p31 Individual B 只举了主申请人走 5 年、伴侣也满 5 年的例子。主申请人走 3 年或 10 / 20 年路径时是否同样取主申请人的年限，原文未说。 | p29；p31 | 后到伴侣的年限取主申请人实际所在路径的年限，最早日期 = 伴侣为同一主申请人的连续 partner dependant 合格居留起点 + 该年限（不早于主申请人的定居时点）。此前的独立许可或其他 dependant 身份不计入。现有输入将连续申报的 partner dependant 许可按同一主申请人处理，并声明假设。 | 原文未提及 |
| PD-058 | 后到的子女 | 原文只讲后到的伴侣须完成同样的合格期；对后到的子女只说 18 岁以下子女随父母定居。 | p29；p31 | 子女不论何时加入，都按主申请人的定居时点随家庭定居，不另计自己的合格期，并声明假设。 | 原文未提及 |
| PD-059 | "保留 child-dependant 身份"的认定 | 18–24 岁"保留 child-dependant 身份"者可随家庭定居；没有说怎样才算保留（是否须持续依赖父母、在学、未独立生活等）。 | p29–p30；p31 | 当前 episode 为 `DEPENDANT` 且 `dependantOf = 'PARENT'` 即视为保留，不输出 `UNKNOWN`；在 `assumptions` 声明。 | 原文未提及 |
| PD-060 | 25 岁按哪一天的年龄 | 在"家庭符合定居资格时"已满 25 岁者须独立符合资格；没有说"符合资格时"是主申请人首次满足条件之日，还是家庭实际申请之日。 | p30；p31 | 按家庭首次符合资格日计算年龄：主申请人的合格居留起点 + 其路径年限（过去或未来都按这一天），不按模拟日；在 `assumptions` 声明。若按实际申请日，已过资格日才申请的家庭中，部分子女可能已不能随家庭定居。 | 原文未提及 |
| PD-061 | "父母双方都定居"与单主申请人 | Individual C 是"父母双方都符合资格并一起申请"，Individual D 是"只有在父母双方都定居时"才能作为 dependant 定居；引擎只接收一个主申请人。 委员会追问单亲、父母进入较长路径、能否第一位父母定居即随同的安排；本次只补证据，现有假设保持。 | p31；SRC-041 p1，问题 2–3 | 子女的结论只按一位主申请人评估，假设另一位家长同时定居，或就是主申请人的随行伴侣；在 `assumptions` 声明。单亲家庭、另一位家长不在英或另有路线的情形未建模。 | 原文未提及 |
| PD-062 | 成年 dependant 本人用过 public funds 或有 breach | 原文对主申请人规定：用过 specified public funds 或成年后有 qualifying breach 进入 20 年路径；对 dependant 只说随主申请人定居，没有说 dependant 本人的 public funds 或 breach 是否让其另走 20 年。 | p13；p18；p29–p30 | 伴侣或 18 岁及以上子女本人的 `ES-PUBLIC-FUNDS` 或 `ES-BREACH` 为 `FAIL` 时，`ES-DEPENDANT-PATHWAY` 输出 `UNKNOWN`（PD-062），结论最多为 `POTENTIALLY_ELIGIBLE`。 | 原文未提及 |

## 五、现行法律补全与剩余过渡安排（任务 2.5 新增）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-063 | 主申请人已定居后其 dependant 如何定居 | Ch.5 只讲 dependant 与主申请人同时定居、后到伴侣须完成同样的合格期、18 岁以下子女随父母定居；没有说主申请人已经定居（或入籍）后，其伴侣 / 子女按什么路径与年限定居。现行规则对此有 SW 39.1(b)。 | p29–p31 | 主申请人时间线带 `settled`（且不晚于申请日）时，`ES-DEPENDANT-PATHWAY` 输出 `UNKNOWN`（PD-063），不给年限与日期；没有其他 `FAIL` 或用户漏填时结论为 `POTENTIALLY_ELIGIBLE`。现行法律栏按 SW 39.1(b) 照常判断。 | 原文未提及 |

## 六、难民路径建模（任务 3.4 新增）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-064 | 从 Protection Work and Study 回到 Core Protection | 原文只说从 Core Protection 转入 Protection Work and Study 时 10 年自转入起算、Core Protection 时间不计入；没有说失去工作等原因回到 Core Protection 后，此前的保护类时间如何计入 20 年。 | p38；p40 | 当前为 Core Protection 且紧接其前是 Protection Work and Study 时，`ES-RESIDENCE` 输出 `UNKNOWN`（PD-064）；年限仍按自回切起算的 20 年投影。 | 原文未提及 |
| PD-065 | 有其他 qualifying breach 的难民 | 第 1 章说成年后的 qualifying breach（逾期停留、违反条件、欺骗、妨碍管制）让任何申请人进入 20 年路径，Table 1 注明"所有强制要求适用于所有路径"；Table 2 只列非法入境的后果，没有提其他 breach。 | p13；p46；p47–p48 | 保护类路线上的成年后非法入境只按 Table 2 加 10 年，不算 `ES-BREACH`；其他 breach 照常让 `ES-BREACH` `FAIL`：Safe and Legal 与 Protection Work and Study 落到 20 年兜底（叠加非法入境的 10 年），Core Protection 本来就是 20 年；兜底自当前保护类路线的合格期起点起算。 | 原文未提及 |
| PD-066 | Protection Work and Study 用过 public funds 后的 20 年从何时起算 | 原文说难民须 5 年未用 public funds 才能走"短于 20 年"的路径，没有说这 20 年是否把此前的 Core Protection 时间算进去。 | p39；p38 | 按 p25 / p38 的"转入新路线重新起算"，20 年兜底自 Protection Work and Study 的合格期起点起算，假设说明。 | 原文未提及 |
| PD-067 | 难民的 dependant | 第 7 章与 Table 2 只讲获保护的本人，没有说其伴侣、子女（如 family reunion）按什么路径定居；第 5 章的 dependant 规则是否适用于保护类路线未说明。 | p36–p40；p47–p48；p28–p31 | 申请日持保护类路线 `DEPENDANT` 许可：短路 `PROTECTION`，Earned Settlement 栏 `REQUIRES_REGULATED_REVIEW`，现行法律栏照常评估。 | 原文未提及 |
| PD-068 | Safe and Legal 难民的 asylum support 偿还 | p8 注 1 与 p39 说领过 asylum support 且须偿还者须已偿还或按计划还款；Table 2 只在 Protection Work and Study 与 Core Protection 两行列出这一要求，Safe and Legal 一行没有。 | p8 注 1；p39；p47 | `ES-ASYLUM-SUPPORT` 在保护类路线里只对 Protection Work and Study 与 Core Protection 运行；Safe and Legal 不评估（不出现在 `rules[]`）。4.5 起非保护类路线按 p8 注 1 也运行（申报了才判断，缺省按未领取处理），Safe and Legal 仍不评估。 | 原文未提及 |

## 七、现行法律栏扩展（任务 4.2 新增）

以下条目的出处是现行 Immigration Rules 的 Appendix（SRC-020 Hong Kong BN(O)、SRC-021 Global Talent、SRC-022 Settlement Family Life），段号为 Rules 段落号，不是 SRC-001 的页码；"原文未提及"指该 Appendix 未作规定。

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-069 | 合并"可定居路线"的时间 | HK 62.1(b) 要求连续 5 年持"可定居路线"（a route under which a person can settle）的许可；SETF 3.2 允许 10 年路线在满足条件时补计"任何含定居规则的其他路线"的时间。两处都没有列出哪些路线属于此类。 | SRC-020 HK 62.1(b)；SRC-022 SETF 3.2 | 只计本路线（BN(O) 段；家庭伴侣 10 年路线为 SETF 3.1 列出的许可）；紧接之前有其他路线的许可时，居留规则在假设里说明"若该路线可定居，实际日期可能更早"。结论按只计本路线的年限给出，可能偏晚。 | 原文未提及（需逐条路线核对其 Appendix 是否为 route to settlement） |
| PD-070 | 5 年伴侣路线的"连续居住"如何因缺席中断 | E-ILRP.1.3 要求在英国连续居住至少 5 年（60 个月）；Appendix FM 没有引用 Appendix Continuous Residence，也没有规定多长的缺席会中断连续居住（E-ILRP.1.5 只对 FM-SE 26A 的期间免除"在英国"）。 | SRC-024 E-ILRP.1.3、E-ILRP.1.5 | `CL-FAMILY-RESIDENCE` 的 5 年路线不因缺席重新起算；填了缺席时在假设里说明（PD-070）。 | 原文未提及 |

本节的范围说明按当前规则注册表更新；以下区分已支持条件与仍保留的建模取舍，不为后者另设政府未定 PD。

- **后续已支持的 dependant**：HK BN(O) 伴侣／成年子女按 `CL-HKBNO-RESIDENCE-5Y`；未成年子女与 adult dependant relative 按 `CL-HKBNO-DEPENDANT`。Global Talent 的伴侣／子女按 `CL-GT-DEPENDANT`；家庭路线子女按 `CL-FAMILY-CHILD`，其中 10 年路线走 Appendix Settlement Family Life，5 年伴侣路线的子女走 Part 8 para 298（PD-074 已关闭）。依赖主申请人的分支须提供其时间线；各规则仍保留关系、年龄、照护与许可连续性等假设，不能概括成所有家属情形均已覆盖。
- Global Talent 的 GT 10.1（背书未被撤回）与 GT 10.2（上一段许可期间在背书或奖项领域有收入）：按满足处理，写进 `CL-GT-RESIDENCE` 的假设。
- GT 11.3(f)(h) 的 Tier 1 与 Representative of an Overseas Business：`Route` 中没有，不计入，写进假设。
- 家庭伴侣 10 年路线的 SETF 3.1(e)（基于 Article 8 的 Leave Outside the Rules）：无法与其他 Leave Outside the Rules 区分，不计入；SETF 7.2–7.3（关系真实持续、以当前关系持许可满 1 年）按满足处理。
- 家庭伴侣 5 年路线的财务要求按申请日前最近一个完整纳税年度的本人加伴侣收入判断；收入不足时可用储蓄补足（E-LTRP.3.1(b) / 3.7(b)，任务 6.4 起建模，见 `docs/contracts.md` §17），伴侣领取 E-LTRP.3.3(a) 所列福利时见 PD-075；Appendix FM-SE 证据规则、E-LTRP.3.2 的来源种类与住宿要求（E-LTRP.3.4）未建模；过渡门槛以最早一段已申报的五年伴侣许可生效日近似首次成功申请的递交日（SRC-024 E-LTRP.3.5–3.6）；同一伴侣（E-ILRP.1.4、E-LTRP.3.6）与关系真实持续（E-LTRP.1.7–1.10）按满足处理。
- HC 1691 不覆盖 Appendix Hong Kong BN(O)：已由 SRC-007 EM 5.60 确认（列出升 B2 的 Appendix 中没有它），HK 60.1 一律 B1，不是待定事项。

## 八、现行法律栏扩展二（任务 5.2 新增）

以下条目的出处是现行 Immigration Rules 的 Appendix（SRC-023 Settlement Protection），段号为 Rules 段落号；"原文未提及"指该 Appendix 未作规定。

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-071 | 难民 5 年"连续期间"如何因缺席中断 | STP 3.1 要求在英国连续至少 5 年持 refugee status 或 humanitarian protection；该 Appendix 没有引用 Appendix Continuous Residence，也没有规定多长的缺席会中断连续期间。 | SRC-023 STP 3.1 | `CL-PROTECTION-RESIDENCE-5Y` 不因缺席重新起算；填了缺席时在假设里说明（PD-071）。 | 原文未提及 |
| PD-072 | 难民定居的英语与 Life in the UK 要求 | Appendix Settlement Protection 的主申请人定居要求（STP 1.1–STP 5.3）没有英语等级、Appendix English Language、Appendix KOL UK 或 2027-03-26 起 B2 的条款。 | SRC-023 STP 1.1–STP 5.3 | 难民 5 年候选不含 `CL-ENGLISH` / `CL-KOL`；两条规则照常运行但只用于 Long Residence 10 年候选，解释写明 STP 未设要求（PD-072）。不从其他路线照搬。 | 原文未提及 |
| PD-073 | 2022-06-28 及以后申请庇护而获 humanitarian protection 者的许可类别 | STP 1.3(a) 对 2022-06-28 前的庇护申请列出 refugee 与 humanitarian protection 许可；STP 1.3(b) 对此后的申请只列 refugee permission to stay。 | SRC-023 STP 1.3 | 本工具不区分 refugee 与 humanitarian protection，`CL-PROTECTION-RESIDENCE-5Y` 按持有所列许可处理，在假设里说明（PD-073）。 | 原文未提及 |

本任务另有以下未建模的点。它们是引擎范围的取舍，不是政府未定的细节，所以不设 PD 编号；结果页通过规则的解释或假设说明。

- 难民的 dependant（STP 6.1–STP 10）：`CL-SCOPE` 输出 `UNKNOWN`，解释"只建模该路线的主申请人"（任务 5.4）。
- STP 2.1 的 suitability：与 Part Suitability 一样未建模，写进现行法律栏的建模范围说明。
- STP 4.1 持续保护身份按用户申报（`protectionStatusRevoked`，缺省按仍持有）；STP 4.2 的 safe return review 结果无法预判；STP 5.2 不满足定居时再获至少 30 个月保护许可：都写进 `CL-PROTECTION-STATUS` 的假设。
- 现行法律下不区分 Earned Settlement 的三条保护类路线：`CORE_PROTECTION`、`PROTECTION_WORK_AND_STUDY`、`SAFE_AND_LEGAL`、`LEGACY_SAFE_AND_LEGAL` 的主申请人片段连续计入 STP 3.1；作为 dependant 的时间不计。
- UK Ancestry（SRC-026）：UKA 10.3（申请日为 Commonwealth citizen）与 UKA 12.1（仍满足 UKA 4.1–6.1）按满足处理，写进 `CL-ANCESTRY-RESIDENCE-5Y` 的假设；dependant（UKA 18–UKA 36）由 `CL-SCOPE` 输出 `UNKNOWN`。
- Innovator Founder（SRC-027）：INNF 17.1(f) 各项由用户自报（`innovatorSettlementCriteria`），金额与岗位数不由引擎判断；INNF 17.1(a)–(e)、INNF 15.2(e)、INNF 17.3、INNF 17.4 写进 `CL-INNOVATOR-ENDORSEMENT` 的假设。主申请人定居没有英语要求是原文写明的（INNF 15.1–21.6；EM 5.60 涉及的是 dependant 的 INNF 39.1），不是待定事项。dependant 由 `CL-SCOPE` 输出 `UNKNOWN`。
- Private Life（SRC-028）：PL 13（英国出生的儿童）、PL 14.1A / PL 14.2(b) / PL 14.2A（2022-06-20 前的过渡安排）、PL 12.3–12.5（suitability 事由要求 10 年）未建模，PL 14.3(e) 的 Article 8 Leave Outside the Rules 不计入，都写进 `CL-PRIVATE-LIFE-RESIDENCE` 的假设；PL 14.4 的其他可定居路线归入 PD-069。dependant（PL 19–PL 33）由 `CL-SCOPE` 输出 `UNKNOWN`。

## 九、现行法律栏 dependant（任务 5.4 新增）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-074 | Appendix FM 5 年路线伴侣的子女如何定居 | D-LTRC.1.1 末句：随按 Appendix Settlement Family Life 申请的伴侣或父母定居的子女适用该 Appendix；否则适用 Immigration Rules Part 8 第 298 段。Part 8 已于任务 6.1 登记为 SRC-029。 | SRC-024 D-LTRC.1.1；SRC-029 para 298 | **已关闭（SRC-029，任务 6.2）**：按 para 298 建模（`docs/contracts.md` §16.5）。`CL-SCOPE` 对这类子女为 `PASS`；`CL-FAMILY-CHILD` 判断主申请人已定居或同时获批定居（298(i)），时点为主申请人现行法律栏的日期，子女本人没有合格期；已满 18 岁按 Appendix KoLL 核英语与 Life in the UK（298(vii)）。298(i) 的具体情形与 298(iii)–(v) 写进假设。不再输出 PD-074。 | 已明确：SRC-029（2026-08-03，HC 259） |

## 十、现行法律栏家庭财务（任务 6.4 新增）

以下条目以现行 Immigration Rules Appendix FM（SRC-024）及 Appendix FM-SE（SRC-053）为准，计算程序见 Home Office 指引（SRC-054）。

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-075 | 伴侣领取特定福利时 adequate maintenance 的口径 | 伴侣当前领取指定福利时可走供养与安置证明分支。以当期可计每周净收入加合规储蓄的每周等值，扣除每周住房成本及 Council Tax，与决定日同等英国家庭的 Income Support 比较，等于基准也满足供养金额测试。 | SRC-024 E-LTRP.3.1(c)、3.3、3.4、3.7(c)、3.9、E-ILRP.1.3(1A)；SRC-053 ¶11–12B、¶18–20；SRC-054 p6–10、p12–19、p23–26 | **口径已明确，待实现（任务 39）**。`CL-FAMILY-FINANCIAL` 目前仍输出 `UNKNOWN`（PD-075）；建模需补足家庭资料、决定日费率、当前净收入、住房成本、合规储蓄及证据状态，另核住宿条件。详见 [任务 39 研究记录](research/2026-11-19-sources-batch-2.md#1-appendix-fm-的-adequate-maintenance)。 | 2026-11-19 已确认计算方法，待后续规则任务 |

## 十一、预算提案与既有规则歧义（任务 12.2 新增）

本节仅登记待定内容，不修改引擎、参数或现有规则集的生效范围。预算案给出的方向／季节／年份不等于精确生效日；现行已明确的 Graduate 申请日分界和 HPI cap 不列为政府未定。

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-076 | 新 work visa 薪资门槛、折扣与过渡 | 预算拟调整 occupation-specific 与一般门槛、年度更新、统一 new entrant 折扣并移除 PhD 折扣；议会答复重述方向和春季窗口，但没有列出新金额、完整资格或过渡边界。 | SRC-032 §7.9，Implementing Migration Advisory Committee (MAC) recommendations on visa salary requirements；SRC-033，40064 Answer ¶2–6、¶10（Budget ¶6.94） | 新一般门槛、各 SOC going rate、折扣数值、在途适用与是否涉及 settlement 表均为 `UNKNOWN`；保留 SRC-004 SW 24.3／SRC-017 的现行数据，不把 MAC 建议或旧工资数据计算结果当新法。 | 计划 2027 年春季；确切日期与细节原文未提及（SRC-033 Answer ¶2、¶10） |
| PD-077 | Graduate 大学例外的认定与申请边界 | 预算拟让高合规且就业结果良好的大学毕业生获得两年 Graduate 许可；未定义新条件、认定大学名单或适用申请日。 | SRC-032 §5.6 #access-to-talent、§7.9 Extending the graduate visa from 18 months to two years for eligible universities；SRC-034 GR 4.1、GR 8.1 | 预算例外资格及适用日为 `UNKNOWN`，不覆盖已入法的 GR 8.1：非博士在 2027-01-01 前申请两年、自该日起申请 18 个月，博士三年（SRC-034 GR 8.1）。现引擎未实现 Graduate 发签时长判断。 | 新例外确切实施日原文未提及 |
| PD-078 | HPI 扩容后的名单、cap 与实施边界 | 预算拟扩大名单并按比例增加 cap。Home Office 书面答复明确，院校须在相关年份 THE、QS、ARWU 三个榜单中至少两个进入前 150。 | SRC-032 §5.6 #access-to-talent、§7.9 Expanding the High Potential Individual visa；SRC-058，40091 Answer ¶1 后的榜单及 ¶2；SRC-035 HPI 1.6A、5.1–5.3；SRC-036 正文首段与大学表 | 扩容名单、新申请 cap 和生效日为 `UNKNOWN`。现行 8,000 年度申请 cap（SRC-035 HPI 1.6A）和按学位授予日匹配年度名单（HPI 5.2）继续适用。现引擎不判断 HPI 入境／发签资格。 | 筛选方法已明确（SRC-058，2026-11-04）。正式扩容名单、新申请 cap 和生效日仍待公布。 |
| PD-079 | 最长六个月 curtailment 的适用与分档 | 预算和议会答复拟让 highest skilled workers 获最长六个月找新工作的 curtailment 期间，时长取决于此前高薪岗位的工作年限；未给完整 eligible cohort、起算、分档或过渡。 | SRC-032 §7.9 Extending visa curtailment to six months；SRC-033，40064 Answer ¶9–10（Budget ¶6.95） | 资格、具体时长与边界为 `UNKNOWN`；不等同所有 Skilled Worker 自动享有六个月，不与 SRC-001 的 care worker 专门安排合并，现引擎不新增该判断。 | 计划 2027 年；确切日期与细节原文未提及（SRC-033 Answer ¶9–10） |
| PD-080 | SW 24.3 row E 在 SW 14.5(c) 截止后的表格引用 | SW 24.3 row E 引用 SW 14.5(c) 的表，SW 24.4(a) 将 SW 14.1–14.5 用于定居薪资。Home Office 指引明确将 2026-12-01 前的申请日限制用于 settlement，并要求满足 SW 14.5(c) 的全部条件才能用该过渡安排。 | SRC-004 SW 14.5(c)(iii)、SW 24.3 row E、SW 24.4(a)；SRC-050 §13.5 `#transitional-arrangement-for-phd-level-roles`、§22.4 `#sponsorship-and-salary` 表后首段 | row E 未建模。将来建模时，2026-12-01 起递交的定居申请不得套用 SW 14.5(c) 过渡表，并须单独核查 row E 的其余 going rate 分支。 | 已关闭（过渡表适用截止日，SRC-050 §13.5、§22.4，2026-11-19 核对） |

## 十二、Skilled Worker 新入职者期限（任务 32 新增）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-081 | 境内提前换签时 SW 12.3 的逐日核算 | SW 12.3 看获批后的合计许可。Skilled Worker 指引把已持 Graduate 时间列入，并以境内决定日作为新许可起日。取消许可指引明确新许可获批后原许可已被替代。合读可推导原 Graduate 许可的未用时间不再累计，具体日期计入哪一段及 section 3C 延续期间在该上限下怎么计仍待核。 | SRC-004 SW 12.3、18.1–18.1A；SRC-050 §16.1 `#year-time-limit`、§23.1 `#dates-granted`；SRC-059 `#premature-end-of-employment-or-study-cancellation-process` 首个列表项 | 后续以有证据的许可有效区间、拟决定日及 CoS 起止日期核算。缺乏决定日、CoS 或关键边界足以改变判定时，保持 `UNKNOWN`。任务 35 的申请检查按此实现：section 3C 延续期计入与否会改变结论时为 `UNKNOWN`。 | 许可替代已有依据（SRC-059）。逐日边界与 section 3C 的计法待 Home Office 明确或公布算例。 |

## 十三、护工过渡的居留合并（任务 33d）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-082 | 护工过渡合格期能否合并普通 Appendix FM 伴侣许可 | 政府回应保留现有合格期，案例 A 要求符合现有路线要求，但没有列可合并的许可，也未说明过渡期是否沿用 SW 21.2。普通 Appendix FM 伴侣许可不在 SW 21.2(a)–(h) 清单中，(i) 仅有指定时期的等候例外。 | SRC-001 p42，Care workers；p45，Individual A；SRC-004 SW 21.1–21.2 | 现有改革过渡候选使用通用改革居留起点。若日期依赖合并普通伴侣许可，官方口径仍未定，待实施规则确认。任务 33d 只登记。 | 原文未提及 |

## 十四、改革贡献与保护路线（任务 33e）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-083 | Protection Work and Study 仅贡献不达标时能否按较长期限定居 | Table 2 将持续贡献列为 Protection Work and Study 的要求。书面答复只确认非 Safe and Legal 难民的一般 20 年合格期，并说明工作或学习可缩短期限。两处均未说明仅贡献不达标时能否沿用 Protection Work and Study 的许可累计 20 年、需否转回 Core Protection，或应从哪一天起算。 | SRC-001 p38、p47 Table 2；SRC-038 Answer ¶2 | 贡献未满足时，其贡献规则维持 `FAIL`，并说明较长期限的资格与起算尚待明确。已确认的成年违规或 public funds 使用仍按 PD-065／PD-066 处理。 | 原文未提及 |

## 十五、澳大利亚试点（第 17 阶段）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-084 | 入籍出境天数中出入境当天的计法 | 法条只规定出境合计上限，没有说出入境当天怎么算。内部 SOP 正文称两天都计为在澳，但同页示例的天数等于入境日减出境日，每次出境多算一天。 | SRC-061 s22(1A)–(1B)；SRC-068 p6 | 不输出 `UNKNOWN`。引擎按 SOP 正文计（两天都在澳），另按示例算法再算一次；两者最早日期不同时，摘要列出按示例算出的日期并标 PD-084。合计接近上限时，按示例须等出境记录移出窗口，日期可能晚出很多，不止一天。 | 原文未提及 |
| PD-085 | 186 TRT"合计至少 2 年"跨多段签证时的天数 | 条例只写 3 年内合计至少 2 年，官方页面也没有换算成天数。窗口内连续一段时按日历 2 年即可；分成多段时，2 年是 730 还是 731 天不明。 | SRC-062 186.226(1)、186.227(1)；SRC-064 | 不输出 `UNKNOWN`。窗口内有一段连续满 2 个日历年即满足；否则要求各段合计不少于 731 天（2 年最多的天数），门槛最多比按 730 天计多一天；但若多出的那天已不再持合格签证，可递交日期会推到下一次满足的时候，可能晚得多。结果页声明此假设。 | 原文未提及 |

## 十六、新西兰试点（第 18 阶段，任务 60）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-086 | 入籍在境天数中出入境当天的计法 | 法条只写在新西兰的天数；govt.nz 说明没有写计法。内政部依 OIA 21/22-0423 公开的在境计算器规格，示例把离境日与返回日都计为在境。 | SRC-070 s8(2)(b)；SRC-073 OIA 21/22-0423 p9–p10 | 引擎按计算器规格把出入境当天都算在境，不再另列其他计法。 | 已明确（2026-11-21，第三轮审核时补登计算器规格） |
| PD-087 | 旅行条件与首次入境期限的最后一天 | R5.66 写"自首次以居民身份在新西兰之日起 2 年""获批后 1 年内首次入境"，没有说周年当天是否还在期限内。签证上会印出具体日期。 | SRC-072 R5.66.1、R5.66.5 | 不输出 `UNKNOWN`。表单可填签证上印的旅行条件到期日，填了即按该日计；没填时按现行 R5.66.5 推算，周年前一天为最后一天（与澳洲"自批准日起 5 年"同一计法）。早年获批的签证适用当时的规则，结果提示以签证为准。 | 签证上的日期即可确认 |
| PD-088 | 居民签证因旅行条件失效之后的情况 | RV1.5 规定旅行条件到期时人在境外、或之后才离境的，居民签证失效（Visa Pak 588 示例为离境次日）。失效后能否按 RV2.5(a)(ii) 在 90 天内以前持有人身份申请永久居民签证、或按 RV4 再获居民签证，取决于个案材料。 | SRC-072 RV1.5、RV2.5(a)(ii)；SRC-073 Visa Pak 588 | 按录入的行程签证会失效、而那时还没有永久居民签证的：旅行条件一项判为无法满足；永久居民签证与入籍在失效日之前达不到的，输出 `UNKNOWN`。 | 原文未提及 |

## 十七、加拿大试点（第 18 阶段，任务 61）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-089 | 永居满 5 年后，居住义务窗口是否包含审查当天 | s28(2)(b)(ii) 写"审查前的 5 年"；PDI 以收件日为审查日，示例把两端日期都写上，没说收件当天算不算。 | SRC-075 s28(2)(b)(ii)；SRC-078 | 不输出 `UNKNOWN`。引擎按审查日（模拟日）前 5 年计、不含审查当天，结果声明此假设。差别最多一天。 | 原文未提及 |
| PD-090 | 入籍"申请日"指哪一天 | 法条写 date of application，没有定义；IRCC 公开的资格页与计算说明按签署日计，纸质申请签署日不得早于收件日 90 天以上；待核的是网上申请时账户内计算器实际取哪一天。 | SRC-074 s5(1)(c)(i)；SRC-076；SRC-077 | 不输出 `UNKNOWN`。引擎把算出的日期称为"最早签署日"，结果声明此假设；网上申请以账户内官方计算器为准。 | 原文未提及 |
| PD-091 | 审查日或申请日为 2 月 29 日时"5 年前"取哪天 | 法条与指引都没写。 | SRC-074 s5(1)(c)(i)；SRC-075 s28(2)(b)(ii) | 不输出 `UNKNOWN`。引擎取 5 年前的 2 月 28 日（窗口多一天），结果声明此假设。 | 原文未提及 |

## 十八、美国试点（第 18 阶段，任务 62）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-092 | 提前递交时，窗口里取得永居之前的日子算不算实际在美 | 法条写递交日前 5 年（3 年）内在美一半时间，没限于永居之后；N-400 说明写"递交前所需连续居住期间内"。 | SRC-079 8 U.S.C. 1427(a)、1430(a)；SRC-081 Vol 12 Part D Ch 4；SRC-082 N-400 填表说明 p18 | 不输出 `UNKNOWN`。引擎只算取得永居之后的日子（偏保守），结果声明此假设。 | 原文未提及 |
| PD-093 | "超过 6 个月""不满 1 年"按天还是按月 | PM 给出 180、365 天，同时汇总表又写"4 年 6 个月""4 年零 1 天"，按月与按天的日期差 1 至 4 天。 | SRC-080 8 CFR 316.5(c)(1)；SRC-081 Vol 12 Part D Ch 3(C) | 不输出 `UNKNOWN`。PM 正文写"超过 180 天"，示例与汇总表按日历月计（8 个月示例：2018-08-01 返美、2023-02-01 起可递交；表：返美后 4 年零 6 个月）。两种读法都不推定中断才算无须反驳；按月计更早的日期在摘要另列。"满 1 年"按 365 天计，与"4 年零 1 天"一致。 | 原文未提及 |
| PD-094 | 取消条件递交期的最后一天，以及 2 月 29 日起算的两周年 | 法条写两周年前 90 天内；两周年当天能否递交没写。USCIS 一般规则：以天数表述的递交期最后一天是周末或联邦假日的，纸质递交顺延到下一个工作日，网上递交不顺延。 | SRC-079 8 U.S.C. 1186a(d)(2)(A)；SRC-080 8 CFR 216.4(a)(1)；SRC-081 Vol 1 Part B Ch 6(E)；SRC-082 | 以两周年前一天为最后一天；最后一天是周末或联邦假日（5 U.S.C. 6103）时，I-751 到下一个工作日为止输出 `UNKNOWN`（纸质可按时、网上不行）；I-829 只能纸质递交（SRC-082），最早与最晚送达日都取工作日，顺延期间算按时；2 月 29 日起算的两周年取 3 月 1 日。 | 原文未提及 |
| PD-095 | 绿卡返美的"不满 1 年"与"超过 180 天"怎么计 | 8 CFR 211.1(a)(2) 写不满 1 年，INA 101(a)(13)(C)(ii) 写超过 180 天，都没说出入境当天。 | SRC-079 8 U.S.C. 1101(a)(13)(C)(ii)；SRC-080 8 CFR 211.1(a)(2) | 不输出 `UNKNOWN`。"不满 1 年"按返美日早于离境日的周年计；"超过 180 天"按整天在境外的天数计。满 1 年的输出 `UNKNOWN`（须回美证或 SB-1）。 | 原文未提及 |
| PD-096 | 州或辖区居住"3 个月"按日历月还是天数，提前递交时是否也须递交前住满 | 法条写 3 个月；规章允许提前递交时以面谈前 3 个月计，面谈日无法预知。 | SRC-079 8 U.S.C. 1427(a)；SRC-080 8 CFR 316.2(a)(5)、334.2(b) | 按日历月计，并要求递交前住满（偏保守；规章允许提前递交时以面谈前 3 个月计，且须落在适用的居住期内）；没填起住日的，入籍结果输出 `UNKNOWN` 并给出以此为前提的日期。 | 原文未提及 |

## 十九、西班牙试点（第 18 阶段，任务 63）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-097 | 长期居留出境上限的计法：月数怎么换算、出入境当天算不算在西班牙 | art. 183.2 只写"6 个月""10 个月"；只有免签短期停留（art. 48.2）规定入境、出境当天都算停留。 | SRC-083 art. 183.2、art. 48.2；SRC-084 art. 5.1 | 单次出境按离境日起 6 个日历月判断；合计出境按天数：不超过 10 个日历月可能的最少天数算满足，超过最多天数算不满足，其间不作为最早日期、在摘要另列；出入境当天按在西班牙计。 | 原文未提及 |
| PD-098 | 学习停留（estancia por estudios）是否算合法居留 | 国内长期居留一章没有提学习停留；条例把学习列为 estancia 而非 residencia。入籍方面，官方说明只认居留许可。 | SRC-083 art. 183.1、art. 176；SRC-085 | 长期居留与入籍都不计学习停留；长期居留把计入学习停留后的日期在摘要另列，只有计入学习停留才能满足的输出 `UNKNOWN`。 | 原文未提及 |
| PD-099 | 两张许可之间的空档 | 条例允许居留许可到期后 3 个月内补交续期（如 art. 64.1）；长期居留申请在到期后 3 个月内递交的，原许可延长至决定（art. 184.2）。续期空档是否算合法居留没写。 | SRC-083 art. 64.1、art. 184.2；SRC-090 art. 30 | 不输出 `UNKNOWN`。录入的许可之间有空档即中断，结果声明此假设；按时续期的许可请连续录入。到期后 3 个月的最后一天是周六、周日的顺延到下一个工作日（Ley 39/2015 art. 30.5）；国家与自治区节假日不建模，节假日顺延的那天仍判不满足（偏保守）。 | 原文未提及 |
| PD-100 | 入籍"连续居留"允许多少缺席 | 民法典 art. 22.3 只要求居留连续，没有缺席天数；官方说明也没有。 | SRC-084 art. 22.3；SRC-085 | 年限内有出境记录的，入籍输出 `UNKNOWN`，摘要给出不计出境时的日期与出境合计天数。 | 原文未提及 |

## 二十、希腊试点（第 18 阶段，任务 64）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-101 | 黄金签证（Β.5）期间能否计入长期居留的 5 年 | άρθ. 144 不计 άρθ. 143 παρ. 2 ε 的"临时居留身份"，法典把凭国家签证的居留（Ζ）定为临时居留（άρθ. 4 κθ、67），投资类许可没有被明文排除，也没有找到现行指引（移民部 2015 年的旧制通函允许旧制黄金签证累计，未存档）。 | SRC-086 άρθ. 4 κθ、67、143 παρ. 2；SRC-087 ν. 5307/2026 άρθ. 179 | 国家签证期间不计；黄金签证期间不作为满足条件的依据，计入后的日期在摘要另列，只有这类期间时输出 `UNKNOWN`。 | 原文未提及 |
| PD-102 | 长期居留出境上限的计法 | 法条写"短于 6 个连续月""合计不超过 10 个月"，没有换算成天数，也没说出入境当天。 | SRC-087 ν. 5307/2026 άρθ. 179（άρθ. 144 παρ. 3） | 单次按离境日起 6 个日历月判断；合计不超过 10 个日历月可能的最少天数算满足、超过最多天数算不满足，其间另列；出入境当天按在希腊计。 | 原文未提及 |
| PD-103 | 学习期间"按一半计"怎么换算 | 条文只给比例，没有说怎样折算与取整。 | SRC-087 ν. 5307/2026 άρθ. 179（άρθ. 144 παρ. 2） | 长期居留按半天精确折算：不间断许可期间内普通许可每天记 2 个半天、学习每天记 1 个，合计须达 5 年天数的 2 倍，达到即算满足；折算后的期间超过 5 年时，出境上限按整段期间检查。入籍不计学习期间：移民法典 άρθ. 123 παρ. 6（SRC-086 p82）规定学生、志愿者的居留不计入取得其他权利；职业培训未点名，也按不计处理，结果声明此假设。 | 原文未提及 |
| PD-104 | 黄金签证续期期间的边界与新许可的起算日 | 法条写到期前 2 个月、到期后 3 个月，没说当天是否包含；续期后的新许可从哪天起算没写。 | SRC-087 ν. 5275/2026 άρθ. 12 | 不输出 `UNKNOWN`。按日历月计、到期日当天仍在期间内；新许可起算日以许可卡为准。 | 原文未提及 |
| PD-105 | 新法 Β.5 是否属于入籍认可的居留身份 | 国籍法典清单（άρθ. 5 παρ. 1 ε αθ）只点名旧法投资者许可：ν. 4251/2014 άρθ. 16、20 与 ν. 3386/2005 άρθ. 36Α；内政部指引按通称列入投资者永久居留许可。 | SRC-088；SRC-089 编纂版 p9 | 不输出 `UNKNOWN`。按指引把 Β.5 期间计入入籍年限，结果声明此假设。 | 待部长决定更新清单 |
| PD-106 | 入籍"连续居留"允许多少缺席 | άρθ. 5 只写"连续"，没有缺席天数；内政部把持续居住列为社会融入的证明事项。 | SRC-088；SRC-089 | 年限内有出境记录的，入籍输出 `UNKNOWN`，摘要给出不计出境时的日期与出境合计天数。 | 原文未提及 |
| PD-109 | 国家签证（Ζ）期间能否计入希腊入籍的合法居留年限 | 国籍法典 άρθ. 5 παρ. 1 δ 只写"合法居留"；内政部通函区分历史合法居留与递交时证件，但没有逐类确认凭国家签证的停留是否计入；移民法典把凭国家签证的居留定为临时居留（άρθ. 4 κθ、67）。 | SRC-088；SRC-089；SRC-086 άρθ. 4 κθ、67 | 不计国家签证期间时有确定日期的照常给出，计入后更早的日期在摘要另列；只有计入国家签证才满足的输出 `UNKNOWN`。 | 原文未提及 |
| PD-107 | 两张许可之间的空档 | 逾期续期在宽限期内递交的，空档是否算合法、不间断居留没写；只有部分积压续期另有规定：从递交续期到新许可生效的期间计入 Μ1。 | SRC-087 ν. 5275/2026 άρθ. 12、άρθ. 52 | 不输出 `UNKNOWN`。录入的许可之间有空档即中断，结果声明此假设；属于积压续期的，请把等待新卡期间也录入为许可。 | 原文未提及 |

## 二十一、澳大利亚香港类别（第 18 阶段，任务 65）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-108 | 189、191 香港类别的"连续通常居住"允许多少出境 | 条文只写递交前 4 年（189）或 3 年（191）"usually resident in Australia for a continuous period"，没有定义，也没有出境天数。 | SRC-062 189.242、191.232 | 从首次入境起算；年限内有出境记录的输出 `UNKNOWN`，摘要给出不计出境时的候选递交日与出境次数。 | 原文未提及 |

## 二十二、爱尔兰试点（第 19 阶段，任务 68）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-110 | "递交日"指哪一天，递交当天算不算居住 | 法条写"immediately before the date of the application"，没有定义递交日（线上提交、受理还是签署法定声明）；ISD 示例 2025-11-11 递交看 2024-11-11 至 2025-11-10，官方计算器却把递交当天也算 1 天，连续年阈值写成"> 364"。 | SRC-091 s15(1)(c)、s15A(1)(e)；SRC-095 Guide `70 Days Absence Rule`、计算器脚本 | 不输出 `UNKNOWN`。按法条与指南示例：1 年窗口为递交日往回到上一年同一日、不含递交当天，递交当天须持计入的许可；计算器的差异写进报告，结果声明此假设。 | 原文未提及 |
| PD-111 | 71–100 天缺席能否获部长认可 | s15C 在 70 天外可再加不超过 30 天，须部长认定缺席出于所列"exceptional circumstances"；ISD 称超过 100 天无裁量、不合格。 | SRC-091 s15C(3)(b)、(5)；SRC-095 Guide `70 Days Absence Rule` | 连续年内缺席 71–100 天的不作为满足，该检查项待确认；模拟日本身只差部长认定时输出 `UNKNOWN`（review68-1），缺席回到 70 天以内的确定日期写在摘要；超过 100 天不满足。 | 部长个案决定 |
| PD-112 | 此前 8 年（配偶 4 年）里的出境是否减少"累计居住" | s15C 只管连续一年；前几年的"total residence"怎样对待出境，法条、ISD 指南都没写，官方计算器只数许可天数。 | SRC-091 s15(1)(c)、s15A(1)(f)；SRC-095 | 严格读法扣除境外的整日，较宽读法不扣；严格读法达标才算满足，只有较宽读法达标的日期在摘要另列；模拟日本身只在较宽读法下满足、或只有较宽读法可达时输出 `UNKNOWN`（review68-1）。 | 原文未提及 |
| PD-113 | 1460／730 天之外的闰日怎样加 | ISD 写"Leap years add an extra day""plus 1 day for years that include 29 February"，没说按窗口还是按许可期数 2 月 29 日；计算器按许可覆盖的 2 月 29 日加、表只到 2020-02-29。 | SRC-095 Guide `What is 'Reckonable Residency'`、计算器页 Guidelines 与脚本 | 严格读法按此前 8 年（配偶 4 年）窗口内的每个 2 月 29 日各加 1 天，较宽读法不加；差 1–2 天的日期按 PD-112 同样另列。 | 原文未提及 |
| PD-114 | ISD 未列明的许可是否计入 | 入籍：ISD 指南与 Stamp 页只列 Stamp 0、1（含 ICT）、1G（毕业生计划、CSEP 持有人或研究员的配偶伴侣）、1H、3、4、5；不计入的只列学生 Stamp 2／2A、无有效许可、等待保护决定（与 s16A(1) 一致）。Stamp 1A 兼有会计培训与受雇，s16A(1)(b) 的学习类排除是否适用没写；临时保护等其他身份也没写（草案拟排除临时保护）。Stamp 5：SRC-097 明列 1、1H、1G、3、4、4D、4S 计入，0、1A、4 EUFam、ICT 的 Stamp 1、ICT 家属的 1G 不计，清单注明仅为示例。 | SRC-091 s15(1)(c)、s16A(1)；SRC-095 Guide `Time That Does Not Count`；SRC-096；SRC-097；SRC-098 Head 9 | 入籍：在境内持有效许可、不属 s16A(1) 与 ISD 不计入清单的居住都计入，包括 Stamp 4 EUFam、4D、ICT 持有人配偶的 1G（review68-3）；只有 Stamp 1A 与"其他"不作为满足依据，计入后的日期在摘要另列，只有计入才能满足时输出 `UNKNOWN`。Stamp 5 按 SRC-097 的两份清单计或不计，只有"其他"按待确认处理。 | 原文未提及 |
| PD-115 | 配偶路径在北爱尔兰的居住与出行 | s15A 按"爱尔兰岛"计居住，ISD 写"lived legally on the island of Ireland"；s15C(2)–(3) 按不在爱尔兰岛的日子计缺席。北爱尔兰的居住须满足什么条件、怎样证明没有写。 | SRC-091 s15A(1)(e)–(f)、s15C(2)–(3)、s16A(1)；SRC-095 Guide `Reckonable Residence for Spouses/Civil Partners` | 不输出 `UNKNOWN`。许可类型可选"在北爱尔兰合法居住"，只计入配偶路径（review68-1）。出境记录覆盖整段北爱尔兰居住的，视为岛内搬迁，这段时间不算缺席（review68-2）；住在北爱尔兰期间离开爱尔兰岛的出行照常算缺席（review68-3）；只是去北爱尔兰的短途行程也按缺席计（较严）。录入北爱尔兰居住的日子，重叠的爱尔兰许可不再算在国家居住，一般入籍与 Stamp 5 不计（review68-4）；家庭团聚配偶转 Stamp 4 的 5 年与 Stamp 4 升级的递交当天同样不计（任务 72）；北爱尔兰居住期只覆盖重叠的日子，不会结束没填到期日的爱尔兰许可（review72-2）。结果声明此假设。 | 原文未提及 |
| PD-116 | Stamp 4 升级"满 21／57 个月"的边界 | ISD 只写"Upon completion of 21 months from commencement of employment … on the basis of"该许可，没说从月末起算到较短月份时在哪天届满；许可中断或换雇主后是否重新起算、两类"not interchangeable"的方向也没写。 | SRC-096 `Information on Stamp 4 upgrades`；SRC-094 s18(h)、附表"month" | 按日历月、开始受雇当天算第一天，只计持该许可（Stamp 1 或 1H，57 个月一类含 ICT）的日子；从填写的开始日到转为 Stamp 1 之前，凭其他合法许可（如毕业生 1G）的日子也计入，递交当天须持该许可（review68-2）。开始工作后许可有空档的，确定日期从空档后重新起算；空档前后的持有天数累加达到对应日历月天数的日期另列，仅此可达时输出 `UNKNOWN`（review68-1）。对应日不存在时，当月最后一天输出 `UNKNOWN`，次月 1 日起算满足。两类不可互换：表单把 Stamp 1 分为 CSEP 一类（CSEP、研究员、NCHD 医生）、GEP 与其他 Stamp 1（经营、打工度假等），21 个月只计 CSEP 一类、57 个月只计 GEP 与 ICT（review72-1），另一类的时间在两条路线上都不计，也不算转 Stamp 1 之前的"其他许可"（任务 72）；同一类内换雇主不计算，结果声明此假设。存档来源中 57 个月规则对 GEP 最早见于 ISD 2024-04-03 通告，对 ICT 只能确认到升级页现行文本的修改日 2026-02-25（dateModified；2024 年通告只列 GEP，datePublished 2025-07-22 不能证明当时已列 ICT，review72-1）；满 57 个月所需的最后 57 个月里含 ICT 时间的，按 ICT 的日期（review72-2）；此前的规则未收录：早于该日满 57 个月的输出 `UNKNOWN`，摘要称该日为"按 57 个月规则满足的最早日期"（review68-5、任务 72）。 | 原文未提及 |
| PD-117 | Stamp 5 的"每年缺席不超过 4 个月" | ISD 在 Stamp 5 获批后的许可条件里写"does not exceed more than 4 months in a year"；申请资格只要求 96 个月合法居留，申请前的出境是否减少这 96 个月没写。 | SRC-097 `Eligibility`、FAQ `What are the conditions attached to my Stamp 5 permission` | 不输出 `UNKNOWN`。4 个月上限只作获批后的条件提示，不用于申请日期（review68-1）；申请前的出境不扣除，结果声明此假设。 | 原文未提及 |
| PD-118 | Stamp 1G 满 5 年与 Stamp 5 的 96 个月是否须连续 | ISD 只写"after 5 years on a Stamp 1G""completed 8 years (96 months) legal residency"，许可之间有空档时能否累加没写（长期居留页说空档不计，但没说是否重新起算）。 | SRC-096 Stamp 1G；SRC-097 `Introduction` | 连续持有达到年限的日期为确定日期；空档前后累加达到年限、递交当天仍持有的日期另列，仅此可达时输出 `UNKNOWN`（review68-1）；Stamp 5 满期时在境外、回国当天许可有空档的，回国日同样作为累加读法下的递交日另列（review72-2）。家庭团聚配偶转 Stamp 4 的 5 年计家庭团聚许可的时间（配偶伴侣类 1G 与家庭团聚下所持的 Stamp 3）：2024-05-15 起 GEP、ICT 持有人的配偶伴侣改发 1G，ISD 家庭团聚 FAQ 第 30 问写的是"5 years or more in Ireland on a family reunification permission"、满期后在下一次网上续期时申请；2024 年通告写明这些配偶伴侣的家庭团聚许可原为 Stamp 3，因此表单单列"家庭团聚的 Stamp 3"，与配偶伴侣类 1G 一起计入 5 年，其他原因的 Stamp 3 不计（任务 72）。 | 原文未提及 |
| PD-119 | 2026 年入籍修法草案 | General Scheme 拟把一般入籍改为 2 年连续居住加此前 10 年内累计 6 年，配偶改为婚姻 5 年、2 年连续加此前 5 年内累计 3 年，并扩大 s16A；仍在立法前审查，最终文本、生效日与过渡安排未定，也没有修改 s15C 的"one year's continuous residence"。 | SRC-098 Head 5、Head 6、Head 9 | 不进入计算。入籍与配偶入籍的摘要提示草案年限并注明按现行法；草案成为法律后须重新调研 s15、15A、15C、16A 与过渡条款。 | 立法进程未定 |

## 二十三、日本试点（第 19 阶段，任务 70）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-130 | "引き続き N 年"从哪天起算、满期取周年当日还是次日；递交日须在日本 | 入管法、国籍法与两版永住指南都没有计日规则；民法第140条初日不算入、第143条按历计算，严格读法下满期在周年当日终了，即次日才满 N 年；入管厅、法务局实际怎么数没有公开。帰化须本人亲自到法务局递交；永住申请是在日外国人的在留资格变更，原则上本人递交，取次者代为递交时本人是否须在日本，手续页只在在留期间更新处写明。 | SRC-112 民法第140、143条；SRC-113；SRC-114；SRC-117 Q10；SRC-119 申請提出者；SRC-110 第22条第1項 | 不输出 `UNKNOWN`。从填写的起算日（上陆日、资格取得日、结婚日等）起按周年计，周年当天算满足（2 月 29 日起算的取 3 月 1 日），结果声明可能晚一天；搜索上限同样按周年。年龄按年齢計算ニ関スル法律，生日当天满岁。在日本出生取得在留资格的"30 日以内"按初日不算入，到出生后第 30 天为止（SRC-110 第22条の2第2項、SRC-119 申請期間）；交叉核对：东广岛市外国人住民页面（二手，未存档，https://www.city.higashihiroshima.lg.jp/jpn/3/40144.html ）按含出生日计，3 月 1 日出生须在 3 月 30 日前，比试点早一天；两种读法（各自按行政机关休日顺延后）给出的期限不同时，落在两者之间的日子输出 `UNKNOWN`，早于含出生日的期限算满足。期限落在行政机关休日（周六、周日、国民の祝日、12-29 至 01-03）的顺延到其后第一个开放日（SRC-112 行政機関の休日に関する法律第1、2条）；国民の祝日按国立天文台暦要項收录 2019–2027 年（含 2019–2021 年按特别法改动的休日）；之后的年份按祝日法第2、3条推算，春分日、秋分日只有国立天文台的计算预测，结果取决于它们时输出 `UNKNOWN`；2018 年及以前未收录，期限落在工作日、模拟日又在其后的输出 `UNKNOWN`。满足年限的日期与递交日分开：落在行政机关休日的，结果另给窗口最早可递交的平日（SRC-119 受付時間；永住不在网上申请范围内）。整天在境外的日子（出境日与返回日之间）不作为递交日；模拟日在境外时另列"模拟日在日本"一项标不满足，其余检查项按计划返回日计算。 | 原文未提及 |
| PD-131 | 2027-04-01 起永住指南出境标准的计法 | 指南写申请时起过去 10 年内，无合理理由"一回の出国で半年以上不在"或"通算して２年６月以上不在"的原则上消极评价；没有说半年、2 年 6 个月是历月还是天数、出入境当天算不算不在、开始于 10 年之前的长行程怎样算；"合理的な理由"按个案判断。 | SRC-114 第2の5(6)（p7）；SRC-115 第48号（p5） | 窗口为递交日前 10 年，出入境当天按在日本计。单次：6 个历月是 181–184 天，境外整天 184 天以上且整段在窗口内的算达到，连出入境当天也不满 181 天的算未达到，其间与开始于窗口之前的长行程待确认；合计：连出入境当天也少于 911 天算未达到 30 个月，境外整天 915 天以上算达到，其间待确认。模拟日仍在境外时，检查项按计划返回日计算（与最早日期的预测一致）。达到或可能达到的不作为最早日期，结果输出 `UNKNOWN` 并给出候选日。 | 原文未提及 |
| PD-132 | 截至 2027-03-31（含当日）递交的永住申请怎样看出境 | 2026-02-24 版指南只写"原則として引き続き１０年以上本邦に在留"，没有出境天数标准；网上流传的天数都是实务说法。 | SRC-113 1(3)ア、2 | 计入的在留年限内有出境的，输出 `UNKNOWN` 并给出候选日；有再入国许可失效的按 PD-136 重新起算。 | 原文未提及 |
| PD-133 | 新版出境标准是否适用于 10 年特例 | 出境标准写在第2の5(6)"これらの期間"（10 年、5 年）之下；第3 的配偶者、实子等、定住者、难民、高度人才特例没有提到。 | SRC-114 第2の5(6)、第3 | 特例路径同样按 PD-131 计算，达到或可能达到的输出 `UNKNOWN`，检查项标待确认。 | 原文未提及 |
| PD-134 | 哪些在留资格算"就労資格又は居住資格"、哪些期间计入 10 年 | 两版都没有定义"居住資格"；新版注2 把技能実習、育成就労、特定技能1号、企業内転勤与部分特定活動排除在就労资格外；第5の1 规定特例性、临时性的特定活動（继续就职活动、就职内定者、难民认定等手续中等）不计入"10 年"，但没有说这些期间前后的在留能否接续；旧版没有这一条；留学、家族滞在等是否计入 10 年也没写。 | SRC-113 1(3)ア；SRC-114 第2の5(6) 注2、第5の1（p12） | 一般路径由用户填写连续持就労或居住资格的开始日，也可勾选目前还没有旧版认可的资格（如只持过特定技能1号，截至 2027-03-31 的候选日不满足）；并必须选择新版范围（不含企業内転勤等）下的起点：与前者相同、另填日期，或目前持有的资格新版不认可；2027-04-01 起的候选日按所选起点计 5 年，选"不认可"的这些候选日都不满足（摘要说明，SRC-114 注2）；并逐段填写不计入 10 年的期间。新版下按这些期间之后重新起算的日期为确定日期，只扣除这些天数的日期输出 `UNKNOWN`；旧版下按其后重新起算为确定日期，把这些期间计入的日期输出 `UNKNOWN`。 | 原文未提及 |
| PD-135 | 配偶者特例的"实体婚姻生活"从哪天起算 | 永住指南写"実体を伴った婚姻生活が３年（新版５年）以上継続"，没有说以登记日还是同居日起算、在国外的婚姻期间是否计入；国籍法第7条后段明确写"婚姻の日"。 | SRC-113 2(1)；SRC-114 第3の1（p9）；SRC-111 第7条 | 不输出 `UNKNOWN`。永住按用户填写的"开始实际婚姻生活的日期"，帰化按单独填写的结婚登记日；表单提示两者不同时填较晚的一个结果更保守。 | 原文未提及 |
| PD-136 | 再入国许可失效与连续在留 | 未持再入国许可出境或许可失效时，原在留中断。みなし自出境起通常为 1 年，特別永住者为 2 年，含届满日。普通许可自生效起通常最长 5 年，特別永住者为 6 年。境外延长一次最多 1 年，自生效起合计分别不超过 6、7 年。有在留期限的还须核对在留期限。按期申请更新或变更且原期限届满时仍待决的，特别期间到处分日与原期限届满后 2 个月中的较早日。官方未规定重新起算的具体日期。 | SRC-110 第20条第6項、第26条第3–6項、第26条の2第1–3項，SRC-442 第23条第1–2項，SRC-116「再入国許可」第2–4段、「みなし再入国許可」、Q61及「永住者の在留資格について」p5 | 模拟器从确认失效后的返日重新起算。旧 `evaluateJapan` 缺少出境方式时，把有效普通许可标记为真的行程按普通许可处理，其余按みなし。旧记录没有特別永住身份时沿用普通期限。显式无许可直接从返日重算。旧入口省略续期答案且返日仅可能落在特别期间内时为 `UNKNOWN`。完整版按各次出境的方式、普通许可返日时效力及みなし出境当时身份判断。同一趟返日明确以新身份重新上陆时，原在留中断，按该上陆日重新起算。所填重新上陆日与返日不一致且不能另行确定中断时，两项连续性均为 `UNKNOWN`。同一趟みなし共用原在留期限、按期续期及处分日；返日在原期限之后且是否在特别期间内取决于未填的处分日时，两处均为 `UNKNOWN`。同一趟みなし在共同历史和再入国问卷间共用身份，两处身份答案冲突则待确认。按同趟みなし出境接续在留时，共用出境声明、资格和证件事实。缺少必要证件或明确未作声明即不能凭みなし接续。护照有效性等证据待核且会影响结论时为 `UNKNOWN`。另有普通许可出境记录时按该许可的效力判断。方式、许可效力、特別身份、按期续期或延期证据留空且会改变结论时为 `UNKNOWN`，返日已超过所有可能上限时判中断。共同历史未填在留期限表示返日前未届满。新冠特例另案核验。 | 原文未提及 |
| PD-137 | 帰化"原则在留 10 年"运用的范围 | 2026-04-01 起"帰化の審査において"原则要求在留 10 年以上，以满足国籍法 5 年住所条件为前提；没有说是否适用于第6–8条的简易帰化（含日本人配偶者）、10 年怎样计、有无资格类型要求、此前递交而届时尚未审结的申请是否适用；判断基准不予公开。 | SRC-117 Q9；SRC-118 | 一般帰化 2026-04-01 起递交的按 10 年计最早日期，摘要另列只按国籍法的日期；此前递交、只满足国籍法的日期与日本人配偶者只满足第7条的日期输出 `UNKNOWN`，摘要给出按国籍法与按 10 年的两个日期。 | 原文未提及 |
| PD-138 | 帰化"引き続き"允许多少出境 | 国籍法第5、7条只写"引き続き"，国籍Q&A、リーフレット与政府答辩都没有出境天数。 | SRC-111 第5条、第7条；SRC-117；SRC-118 | 前 10 年（10 年运用的年限）内有出境的输出 `UNKNOWN`，日本人配偶者同样；摘要给出候选日与出境次数、天数，相应的住所、第7条与 10 年检查项标待确认，摘要不写"已满足"；摘要里"若适用 10 年运用"的日期在 10 年内仍有出境时同样写作候选日。 | 原文未提及 |
| PD-139 | 帰化的"住所""居所"与在留开始日 | 国籍法第5条要求住所，第7条前段为住所或居所；国籍Q&A 说住所须合法、持正当在留资格；没有说明住所从上陆日还是其他日子起算。 | SRC-111 第5条、第7条；SRC-117 Q9 | 不输出 `UNKNOWN`。住所、居所与在留都从用户填写的本次在留开始日起算，不作区分，结果声明此假设。 | 原文未提及 |

## 二十四、德国试点（第 19 阶段，任务 69）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-120 | 持有年限、出境期限的起止日与判定时点 | 法条只写"持有满 N 年""6 个月内返回"；行政程序期限准用 BGB §§ 187–193，但居留年限是否属于这种期限、起点当天计不计（会差 1 天）没有说明。定居许可、入籍以批准或入籍日为准，欧盟长期居留以申请日为准；能否提前递交没写。 | SRC-102 BGB §§ 187、188、VwVfG § 31；SRC-108 Nr. 9a.2.1.1.1、51.1.6.6；SRC-106 Nr. 10.1.0 Rdn. 1 | 不输出 `UNKNOWN`。年限从许可生效日（在首次入境前生效的，从首次入境日）起算、到周年日（或月份对应日）满足，即起点当天计入；没有对应日的（如从 2 月 29 日、月末起算），从下月 1 日起满足；出入境当天按在德国计；出境期限到对应日当天返回仍算按时。结果声明"若起点当天不计入，晚 1 天"，并以最早满足日作为结果。这些都是试点约定（review69-1 风险项）。 | 原文未提及 |
| PD-121 | 折半与非连续期间怎么换算 | § 9 Abs. 4 Nr. 3、§ 9b Abs. 1 Nr. 4 只说学习期间"折半"；旧定居最多折算 4 年、入籍旧居住最多 3 年、§ 12b 过半规则都没有换算成天数。BGB § 191 规定不必连续计算的年按 365 天。 | SRC-100 § 9 Abs. 4、§ 9b Abs. 1；SRC-101 § 12b；SRC-102 BGB § 191 | 不输出 `UNKNOWN`。按半天精确折算：许可期间每天记 2 个半天、学习每天记 1 个，合计须达所需年限日历天数的 2 倍；4 年、3 年上限与"所需年限的一半"按每年 365 天计。 | 原文未提及 |
| PD-122 | 各类许可的计入与排除范围 | § 26 Abs. 3 明文准用 § 9 Abs. 4，§ 18c、§ 28 Abs. 2 没有引用；§ 16b Abs. 4 Satz 2 学习期间不适用 § 9，§ 16a Abs. 1 Satz 3 企业内培训期间也不适用（此前持 § 18a、§ 18b 的除外），学校职业培训（Abs. 2）没有这句，§ 16d、§ 16f、§ 20a 等也排除 § 9（§ 20a 只排除找工作用的机会卡，含再次签发的，后续机会卡不排除，两者期间都计入：SRC-107 Nr. 20a.5.7、20a.6.1–20a.6.2，p200–p201；review73-2、review73-3）；第 5 节（人道）许可的定居许可另由 § 26 Abs. 3、Abs. 4 规定（联邦行政法院 BVerwG 1 C 16.24 Rn. 11–12 认为不再适用 § 9，判决未存档，只作交叉核对）；§ 9a Abs. 3 Nr. 1 排除第 5 节许可（国际保护除外），Nr. 5 的临时目的只列"insbesondere"几例；入籍时不能持有的许可见 StAG § 10 Abs. 1 Satz 1 Nr. 2 的清单（含 § 25 Abs. 3–5、§ 20，不含 § 25a、§ 25b），几份清单不一致。 | SRC-100 §§ 9a、9b、16a、16b、18c、26 Abs. 3–4、28 Abs. 2；SRC-101 § 10 Abs. 1 Satz 1 Nr. 2；SRC-108 Nr. 9.4 | 技术工人、欧盟蓝卡、德国人家属路径不计学习期间，每次出境按 § 9 Abs. 4 Nr. 2 类推最多计 6 个月（偏保守）。持学习许可时一般定居许可不满足；持职业培训许可（此前没有技术工人许可）或临时目的许可、只在这类许可下才满足的输出 `UNKNOWN`。模拟日持第 5 节许可（庇护、难民、辅助保护、其他人道）的，一般定居路径输出 `NOT_APPLICABLE`（review69-4）。持临时目的或其他人道许可的，欧盟长期居留不能申请（临时目的期间也不计）；人道许可在任务 73 中按条文分为 § 23 Abs. 2、融入类（§ 23 Abs. 1、§ 25a、§ 25b）、其他（§ 22、§ 23a、§ 25 Abs. 3、Abs. 4 Satz 2、Abs. 5）与临时保护或临时停留（§ 24、§ 25 Abs. 4 Satz 1）四类，欧盟长期居留的计入见 PD-155（指令 2003/109 Art. 3(2)(b) 只作交叉核对）；入籍只在这两类许可下才满足的输出 `UNKNOWN`。 | 原文未提及 |
| PD-123 | 欧盟蓝卡 27／21 个月的计法 | § 18c Abs. 2 写"至少 27 个月从事 § 18g 的就业"并为这段期间缴费；换蓝卡前持其他许可、但已达到 § 18g 条件的就业算不算，失业或换雇主的空档前后能否合计、换发间隙怎么算，联邦条文都没写。BMI 指引只说旧法蓝卡和此前的国家签证期间计入、缴费允许补缴；柏林外国人管理局服务页明说持其他许可期间符合条件的就业也计入（https://service.berlin.de/dienstleistung/326556/ ，未存档，只作交叉核对）。 | SRC-100 § 18c Abs. 2；SRC-107 Nr. 18c.2.1.1、18c.2.1.3 | 由用户填写截至模拟日"符合 § 18g 条件就业并缴费"的月数，按柏林的读法包括换蓝卡前持其他许可期间的这类就业（review69-3）；之后只在持蓝卡期间按每月 +1 推算，模拟日后才换成蓝卡的从换卡日起算，蓝卡中断后从新一段起算（review69-2）；递交当天须持蓝卡；未填时输出 `UNKNOWN`。结果声明这些假设。 | 原文未提及 |
| PD-124 | 许可之间的空档与等待续期的期间 | § 85 允许不计不超过 1 年的合法性中断（裁量）；§ 81 Abs. 4 Satz 1 到期前申请续期或新许可的，原许可在决定前视为继续有效，但这段时间能否计入定居等所需年限取决于续期最终获批（联邦行政法院 BVerwG 1 C 34.18 Rn. 42–43）；入籍方面，这段时间算合法居留（BVerwG 1 C 9.15 Rn. 17，柏林外国人管理局 VAB 10.1.1.2 第 929 页），但入籍当天只凭这一延续效力算不算持有 StAG § 10 Abs. 1 Satz 1 Nr. 2 要求的许可有争议（柏林 VAB 认可，VG Köln 判决第 51 段不认可）；判决与 VAB 都未存档，只作交叉核对；入籍方面迟交续期最终获批的中断不计（§ 12b Abs. 3）。 | SRC-100 § 81 Abs. 4、§ 85；SRC-101 § 12b Abs. 3；SRC-108 Nr. 85.3 | 表单的"到期前已申请续期"勾选后，该许可一直延续到下一张许可生效，期间出境也按原许可判断（review69-4）。录入了下一张许可（续期已获批）的，等待期间照常计入；没有下一张许可（还在等待决定）的，定居许可和欧盟长期居留只在计入等待期间才满足时输出 `UNKNOWN`（review69-5）；入籍把等待期间按合法居留计入年限（review69-6），但入籍当天只凭等待中的续期持有许可、或要靠模拟日之后的等待才满足的，输出 `UNKNOWN`（review69-7、review69-8）。计划在模拟日之后、原许可到期之后返回且续期还在等待的，最晚返回日只是条件性的（续期获批或仍在等待时按 6 个月，欧盟蓝卡 12 个月），出境卡输出 `UNKNOWN`（review69-8）；模拟日或之前已返回、当时仍在等待的，按原许可判断（review69-9）。不勾选的，录入的许可之间有空档即中断，出境期间到期的以到期日为最晚返回日（§ 51 Abs. 1 Nr. 1）。依法律或法规整体延长的许可，表单提示填延长后的法定到期日。 | 原文未提及 |
| PD-125 | 欧盟长期居留出境合计 10 个月的计法 | § 9b Abs. 1 Satz 1 Nr. 1 b 写单次不超过 6 个连续月、"在该期间内"合计不超过 10 个月的计入；超过时是整次不计还是只扣超出部分、期间是否就是递交前 5 年，都没写；不连续的月按 BGB § 191 每月 30 天，10 个月为 300 天，而 10 个日历月可跨 303–306 天。 | SRC-100 § 9b Abs. 1；SRC-102 BGB § 191 | 计入期间内短期出境合计不超过 300 天（§ 191）时全部计入；超过时按全部不计入（计时暂停、不中断）给出确定日期；按 10 个日历月最多天数（306 天）的较宽读法才满足的日期在摘要另列，模拟日只在较宽读法下满足、或只有较宽读法才满足时输出 `UNKNOWN`（review69-2 起 301–306 天不再算满足）。 | 原文未提及 |
| PD-126 | 庇护程序从哪天起算、哪些保护身份计入 | § 26 Abs. 3 计入"此前庇护程序的期间"（只限 § 25 Abs. 1、Abs. 2 Satz 1）；§ 9b Abs. 1 Nr. 5 与 AsylG § 55 Abs. 3 对获国际保护者（含辅助保护）计入，写"申请国际保护之日"；欧盟程序条例 VO (EU) 2024/1348 区分提出、登记、正式递交三个时点，对应哪一个未核实。 | SRC-100 § 26 Abs. 3、§ 9b Abs. 1 Nr. 5；SRC-103 § 55 | 不输出 `UNKNOWN`。按用户录入的"庇护程序中"开始日计；记录里有庇护、难民或辅助保护许可时，欧盟长期居留与入籍计入庇护程序期间，难民定居路径只认庇护或难民许可。结果声明此假设。 | 原文未提及 |
| PD-127 | 入籍过半规则的期间与重新起算点 | § 12b Abs. 1 Satz 5 写境外合计超过所需年限一半时惯常居住"通常"终止；指引说回溯累加所有境外停留，从最近一次重新建立惯常居住起算；草案理由说从使合计超过一半的那次中断之后起算；回看多远没写。 | SRC-101 § 12b Abs. 1 Satz 5；SRC-105 BT-Drs. 20/9044 p40；SRC-106 Nr. 12b.1.5 Rdn. 23 | 不输出 `UNKNOWN`。在当前不中断的居住期间内，按所需年限的滑动窗口累计出境天数，超过一半（每年 365 天）时从那次出境返回日重新起算；结果声明此假设。按指引"回溯累加全部"的读法，长期反复出境的人会更早被判中断，试点未采用。 | 原文未提及 |
| PD-128 | 入籍中断前居住的酌情折算 | § 12b Abs. 2 允许把中断前的居住最多折算 3 年，属裁量；指引对德国人配偶写最多折算所需年限的三分之二（2 年），且须当时已婚并共同生活。 | SRC-101 § 12b Abs. 2；SRC-106 Nr. 9.1 Rdn. 5、Nr. 12b.2.1 Rdn. 24 | 不计入时给出确定日期；只有按上限折算才满足时输出 `UNKNOWN`，模拟日只在折算后满足时也输出 `UNKNOWN`，折算后的日期在摘要另列。配偶路径只折算结婚日之后的居住（按婚后一直共同生活处理）。 | 原文未提及 |
| PD-129 | 2025-10-30 前已递交、尚未决定的 3 年快速入籍申请 | BGBl. 2025 I Nr. 256 删除 § 10 Abs. 3、公布次日生效，没有过渡条款；StAG § 40a 只涉及生计条件；BMI 立法页未提及。 | SRC-104；SRC-101 § 40a | 试点只按现行法计算，不计算 3 年路径。模拟日在 2024-06-27 至 2025-10-29 之间时，结果注明当时还有 3 年路径、过渡处理未明；早于 2024-06-27 时只注明当时适用 StARModG 之前的旧法。 | 原文未提及 |

## 二十五、葡萄牙试点（第 19 阶段，任务 71）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-140 | 入籍年限从哪天起算；欧盟公民的居留登记怎么计 | 现行法废止了"自申请临时居留许可之日起算"，只计合法居留期间；合法居留包括持外国人法规定的任何证件、签证或许可（法条）。宪法法院的理由写"取得居留证件即开始计算"（判决理由），没有说是批准日、制卡日还是证件起始日，也没有说居留签证期间算不算。欧盟公民不持外国人法的许可，法条只说欧盟的特别居留制度不受影响（art. 15 n.º 2）。 | SRC-120 LO 第 5 条、art. 15 n.º 1–2；SRC-122 D.5；SRC-123 art. 4 n.º 2 a；SRC-127 部长会议公报 | 按录入的居留许可生效日起算（试点假设），结果把法条、判决理由与假设分开写；居留签证期间不作为满足条件的依据，计入后的日期在摘要另列；只有计入才够的（包括模拟日只在这种读法下满足）输出 `UNKNOWN`，摘要给出确定的日期。欧盟公民（7 年）与挪威、冰岛、列支敦士登、瑞士公民（10 年，入籍不算欧盟国民）单列选项，外国人法的三项路径显示不适用（art. 4 n.º 2 a；法条不点名瑞士，按"与欧盟有人员自由流动协定的国家"处理），入籍一律输出 `UNKNOWN`，摘要说明表单无法录入自由流动登记，并给出按录入证件算的候选日期。 | 新国籍条例已于 2026-10-29 由部长会议通过，公布日期原文未提及 |
| PD-141 | 区间规则（art. 15 n.º 3）怎么算 | 中断的合法居留期间可以相加，须落在 6、9 或 12 年的区间内；没有说区间是否以递交日为终点，也没有说相加时年怎么换算成天。 | SRC-120 art. 15 n.º 3（p5） | 连续居留按日历计；有空档时取递交日前的 6、9 或 12 年，把其中各段的天数相加（每段起算日不计），达到该年数可能的最多天数算满足，介于最少与最多天数之间的不作为满足条件的依据、在摘要另列日期（模拟日只在这种读法下满足的输出 `UNKNOWN`）。旧法（15 年区间）同样计。 | 原文未提及 |
| PD-142 | "满 N 年"的当天边界 | 国籍法与外国人法只写"há pelo menos N anos""紧邻的 5 年"；民法典规定期间起算的事件当天不计、按年计的期间止于对应日 24 时（没有对应日的止于该月末日），法定期间同样适用，但行政机关是否这样审查没有指引。 | SRC-125 Código Civil art. 279、296；SRC-120 art. 6；SRC-123 art. 80、126 | 不输出 `UNKNOWN`。入籍、永久居留、欧盟长期居民都按起始日当天不计：满 N 年对应日的次日起可以递交（2021-02-28 起算 7 年的，2028-02-29 起；2020-02-29 起算的止于 2 月末日，次日起）；结果声明可能早一天。 | 原文未提及 |
| PD-143 | 新旧法分界当天与更早的在审申请 | LO 1/2026 公布次日（2026-05-19）施行，施行时在审的程序适用旧文本；恰在 2026-05-19 当天递交的属于哪一边没有明文。DRE 修改记录把它注为"自 5 月 18 日起生效"，与公报第 8 条不一致。旧文本（LO 1/2024）自 2024-04-01 施行（第 9 条），宪法法院也按这一日期说明"自申请居留之日起算"的适用范围。 | SRC-120 LO 第 7 条 n.º 2、第 8 条（p7）；SRC-121 LO 1/2024 第 9 条（p5）；SRC-122 D.5；SRC-127 司法部新闻 | 2024-04-01 至 2026-05-18 递交、施行时在审的按旧文本判断递交日当时的条件；2024-04-01 前递交的适用更早的文本，试点没有建模，输出 `UNKNOWN`；2026-05-19 当天递交的输出 `UNKNOWN`；网页不接受勾选"在审"却填写 2026-05-19 之后或模拟日之后的递交日，勾选项写明当天递交的待确认。 | 原文未提及 |
| PD-144 | 缺席对入籍年限的影响 | 国籍法没有缺席天数上限；合法居留的定义写"身在此地、身份合法"的人，没有量化。 | SRC-120 art. 15 n.º 1（p14） | 计入的居留日（含递交当天，离境日与返回日按在葡萄牙计）里有出境的，入籍输出 `UNKNOWN`，模拟日的检查项同为待确认，摘要给出不计出境时的候选日期与出境次数、天数；完全落在未计入的空档里的出境不算；结果只在待确认读法（居留签证、卡到期后 6 个月、年天换算）下成立时，同样列出这一读法计入期间里的出境。 | 新国籍条例公布时可能规定，原文未提及 |
| PD-145 | 居留卡到期后的 6 个月与许可之间的空档 | AIMA 说明临时居留卡到期后 6 个月内居留权仍然保留（依据条例 art. 63 n.º 14；2025-06-30 前到期的卡另延至 2026-04-15）；art. 80 写"持临时居留许可满 5 年"，没说到期后这段时间或续期空档算不算持有、算不算入籍与欧盟长期居民的合法居留。永久居留许可与欧盟长期居民身份本身没有期限，证件定期换发（art. 76 n.º 1–2、art. 130 n.º 2）。 | SRC-126 Direito de Residência；SRC-125 DR 84/2007 art. 63 n.º 14；SRC-123 art. 76 n.º 1–2、80 n.º 1 a)（p65、p67） | 永久居留卡与欧盟长期居民卡的到期日不影响身份，已持有的各自显示"已持有"。临时居留卡（含黄金签证、学习）到期后 6 个月内的期间不作为满足条件的依据；学习许可到期后的这段时间只保持连续，不算递交欧盟长期居民申请时持有的许可（art. 125 n.º 2 a）；其他许可到期后的这段时间，一旦有更新的许可生效即由新许可取代，不再作为申请时持有的许可；这段时间只填补没有任何有效许可的日子，有许可的日子按当天实际持有的许可计（如学习期间仍按一半计），计入后的日期在摘要另列；只有计入才够的（包括模拟日只在这种读法下满足）输出 `UNKNOWN`。超过 6 个月的空档即重新起算；2025-06-30 前到期的特别延长没有建模。 | 原文未提及 |
| PD-146 | 临时、永久居留的缺席注销怎么计 | 无正当理由出境达到连续 6 个月或累计 8 个月（临时）、连续 24 个月或 3 年内累计 30 个月（永久）的，许可"可以"被注销；月数没有换算成天数，也没说出入境当天；条款保留"特别规定"，黄金签证的最低停留是否排除它不明。 | SRC-123 art. 85 n.º 2、4（p69）；SRC-124 art. 65-C | 只作风险提示，不改变任何日期或状态。投资类永久居留（由黄金签证转来）不适用 art. 85 n.º 2 b、n.º 3–4（DR 84/2007 art. 65-K，Lei 56/2023 art. 42 n.º 4，AIMA ARI 页面），不做注销检查与预告。临时、永久居留的注销检查与已持欧盟长期居民身份的丧失检查（art. 131 n.º 1 c、e）都只看模拟日以前的出境，计划中的出境在摘要里预告达到上限的日期。按每张许可的有效期分开计，跨续期的出境只算落在该许可内的部分；单次按离境日起的日历月判断；累计按天数，介于最少与最多天数之间的提示待确认；黄金签证许可超出时也只标待确认；出入境当天按在葡萄牙计。 | 原文未提及 |
| PD-147 | 欧盟长期居民的折半与缺席换算 | 学习、无薪实习、志愿期间按一半计入 5 年，没说怎样折算与取整；缺席单次少于 6 个连续月、合计不超过 10 个月，没有换算成天数。 | SRC-123 art. 126 n.º 3–4（p101） | 学习等期间按半天精确折算：不间断许可期间内其他许可每天记 2 个半天、学习每天记 1 个，合计达到窗口天数的 2 倍即满足，不输出 `UNKNOWN`；折算后的期间超过 5 年时出境上限按整段期间检查。出境只算到递交日前一天，递交时仍在外的出境按已出境的时间判断，计划中的出境会在以后达到 6 个月的在摘要里预告。合计出境不超过 10 个月可能的最少天数算满足，超过最多天数算不满足，其间另列，模拟日只在较宽口径下满足的输出 `UNKNOWN`。 | 原文未提及 |
| PD-148 | 黄金签证最低停留的期间怎么对应许可卡 | 条例写第 1 年 7 天、此后每个 2 年期 14 天，沿用当时首张 1 年、续期 2 年的许可期限；现行首张为 2 年，两者怎么对应没写。AIMA 常见问题第 24 问同样写每个 2 年期 14 天；AIMA 概览页"此后各年 14 天"只是简写。 | SRC-124 art. 65-C（p3）；SRC-126 ARI 页面、常见问题第 24 问（未存档，仅交叉核对） | 从第一张黄金签证卡的生效日（作为授予日）起按日历划分：第 1 年，之后每 2 年一期，只算在本次续期期限（到期前 30 天，art. 78 n.º 1）之前开始的期间；从期限当天或之后开始的期间（包括从卡到期日开始的期间）属于下一张卡。在期限前不久才开始的期间仍要求在期限前达到 14 天，偏保守。首张 2 年卡续期时，第二期（2 年）还没结束：截至模拟日只算实际停留，未满的按之后一直在葡萄牙（已录入出境除外）推算达到的日期，须在续期期限前达到，最早日期取它与续期期间开始中较晚的一个；期间结束或续期期限前仍达不到的算不满足。这一对应方式是试点假设，官方说明对应方式后复核。出入境当天按在葡萄牙计。 | 原文未提及 |
| PD-149 | 续期最早何时可以申请 | 法律只规定最迟在到期前 30 天申请；"到期前 90 至 30 天"见于条例 art. 63 n.º 16，本次只取得里斯本检察院的编纂版。审核指出该款由 DR 9/2018 第 2 条加入（公报 PDF p6），DR 1/2024 未改其内容，公报原文尚未存档；逾期申请的后果不在试点范围。 | SRC-123 art. 78 n.º 1（p66）；SRC-125 DR 84/2007 art. 63 n.º 16 | 不输出 `UNKNOWN`。续期期间按到期前 90 天至 30 天计，结果声明 90 天来自编纂版；过了 30 天的期限算不满足。 | 存档 DR 9/2018 公报原文后复核 |

## 二十六、日本试点后续（第 19 阶段，任务 74）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-160 | 在日本出生的孩子在出生后出境时，按出生取得永住者资格的申请怎样处理 | 第22条の2第1項：因出生等未经上陆手续在日本在留的外国人可不持在留资格在留 60 日；第2項要求超过 60 日在留的在 30 日内申请取得。入管厅 Q&A Q28：出生后 60 日内出境的（持再入国许可含みなし出境的除外）不需要申请。持再入国许可须已有在留资格；出境前没有可递交的日子却勾选了持再入国许可时，返回方式没有写明。 | SRC-110 第22条の2第1、2項；SRC-116 Q&A Q28；SRC-119 申請提出者 | 出生后 60 日内的第一次出境须选择出境方式：选"不持再入国许可"的，本路线输出 `NOT_APPLICABLE`（不需要申请，回国时重新上陆）；选再入国许可或みなし再入国许可的，递交日须在出境当天或之前、在日本的开放日（出境当天才递交可能来不及取得在留资格，结果提示），已没有这样的日子时输出 `UNKNOWN`；没有选择的输出 `UNKNOWN`。 | 原文未提及 |
| PD-161 | 2022-04-01 前递交、之后才审结的帰化申请按哪个年龄审 | 国籍Q&A Q9 的注只写 2022-04-01 起"20歳以上"改为"18歳以上"，没有说此前递交、届时尚未审结的申请适用哪一个。 | SRC-117 Q9（注）；SRC-111 第5条第1項第2号 | 2022-04-01 前的递交日按 20 岁计；那时已满 18 岁（及本国法成年年龄）但未满 20 岁的，输出 `UNKNOWN` 并说明；年龄检查项写明所描述的递交日适用的门槛，并附 2022-04-01 起的门槛。 | 原文未提及 |

## 二十七、德国试点后续（第 19 阶段，任务 73）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-155 | 哪些许可算欧盟长期居留的"临时目的" | § 9a Abs. 3 Nr. 5 只以"insbesondere"列举几例（按就业条例有最长期限的 § 19c 就业、按 § 8 Abs. 2 不得延期的许可、随临时目的者的家属），其期间按 § 9b Abs. 1 Satz 2 不计。§ 20 求职许可最长 18 个月、法律规定不得超期延长（§ 20 Abs. 2 Satz 4）；§ 24 写"zum vorübergehenden Schutz"，§ 25 Abs. 4 Satz 1 写"für einen vorübergehenden Aufenthalt"。条文没有点名它们是否属于临时目的。第 5 节的其他人道许可按 § 9a Abs. 3 Nr. 1 只是持有时不能申请（§ 23 Abs. 2 除外），§ 9b Abs. 1 Satz 2 没有把其期间排除。 | SRC-100 § 9a Abs. 3 Nr. 1、Nr. 5，§ 9b Abs. 1 Satz 2，§ 20 Abs. 2，§ 23 Abs. 2，§ 24，§ 25 Abs. 4 | § 20 求职、§ 20a 机会卡（review73-3 起分为找工作用与后续两个选项）、§ 24 临时保护与 § 25 Abs. 4 Satz 1 临时停留按临时目的处理：欧盟长期居留不计其期间，持有时不能申请；这些期间不计但不中断，此前可计入的期间照常保留（§ 9b Abs. 1 Satz 1 Nr. 4、Satz 2–4；柏林 VAB 第 105–106 页，未存档，只作交叉核对，review73-1）。§ 24 与 § 25 Abs. 4 Satz 1 的期间若计入会改变结果，计入后的日期另列，只有计入才满足模拟日时输出 `UNKNOWN`（review73-1）。§ 22、§ 23 Abs. 1、§ 23a、§ 25 Abs. 3、Abs. 4 Satz 2、Abs. 5、§ 25a、§ 25b 的期间照常计入、持有时不能申请；§ 23 Abs. 2 可以申请。结果声明此读法。定居许可与入籍按各自条文处理（入籍当天持 § 20、§ 20a、§ 22、§ 23a、§ 24、§ 25 Abs. 3–5 不满足，持 § 23、§ 25a、§ 25b 可以）。 | 原文未提及 |

## 日本完整版（第 20 阶段，任务 91）

既有时间及年龄口径继续见 PD-130–139、PD-160、PD-161。

| ID | 事项与来源 | 当前结果与解锁条件 |
|---|---|---|
| PD-360 | 国益的权重、生活本拠与意向的证明、长出境理由的认定，SRC-114 第1、第2の5(1)(6)(11)，SRC-115 第1、7–8、48号 | 缺个案决定时整体国益为 `UNKNOWN`。单次或累计出境可能达到新版指南标准、入管尚未核定合理理由时，相应出境检查为 `UNKNOWN`。海外派驻等事由由入管个案判断。 |
| PD-361 | 独立生计和收入的确切金额、更新方式、统计与税前税后、持续期间、5 人以上增量、特殊在留和亲属收入边界，SRC-114 第2の4(1)(2)，SRC-115 第17、34–36、38号 | 金额及官方每年调整口径未公开。可以展示已知家庭构成及收入口径；不把公共统计直接代替隐藏基准。 |
| PD-362 | 预计养老金和补填金融资产的阈值、年龄函数、资产类别及持续证据，SRC-114 第2の4(3)，SRC-115 第17、25–31、37号 | 可展示官方预测与用户输入；是否达到内部标尺 `UNKNOWN`。 |
| PD-363 | 公共负担项目、风险与特段事情，SRC-114 第2の5(7)，SRC-115 第39–41号 | 已知生活保護准用受领作为事实，其余给付及人道裁量待主管确认。 |
| PD-364 | 永住日语 B1 认定、豁免、制度理解指定方式、学习项目和各自费用，SRC-114 第2の5(8)(9)，SRC-115 第15、49–55、68号；帰化会读写及会话的认定、面谈/评估方法、各地豁免与意向评价，SRC-117 Q9、SRC-445、SRC-118、SRC-445 | 官方拟公布判定及指定方法。公布前自报可用于情景，材料换算、豁免边界、考试和课程本身 `UNKNOWN`。；用自报技能在实验室做情景；正式判断及统一考试/费用 `UNKNOWN`。已有 PD-137 继续处理简易帰化十年口径。 |
| PD-365 | 素行、罚金刑、交通类处分、少年处分和过往记录的期限、域外等效，SRC-113 1(1)(3)イ；SRC-114 第2の3、5(4)(5)，SRC-115 第59号 | 已知定罪等列事实或负面因素；权重、康复期与最终评价 `UNKNOWN`。 |
| PD-366 | 税、保、年金、地址和所属机构迟报等负面记录，SRC-110 第19条の7–16，SRC-114 第2の5(2)(3)，SRC-115 第19号，SRC-450 | 证明年数可逐路线显示。申报日期缺失且申报状态未确认时，按期申报为 `UNKNOWN`。较早记录、公司差错、合法免除及迟报补缴的评价依个案。 |
| PD-367 | 健康、入境拒绝、安全与特别许可的个案边界，SRC-113 1(3)オ、SRC-114 第2の5(1)(5)、第3注5，SRC-110 第5、12、50条 | 用官方决定及确切处分类型触发；单靠敏感自报或一般疾病类别时 `UNKNOWN`。 |
| PD-368 | 当前身份合规，含经管更新过渡能否用于永住、资格告示/实务差异，SRC-114 第2の5(5)注3，SRC-452、SRC-452 | 按资格返回对应官方判据。例外和过渡无明确可移用原文时 `UNKNOWN`。 |
| PD-369 | 最长期间过渡、特例适用及先后判断，SRC-113 1(3)ウ，SRC-114 第2の5(6)注4、第3注5，SRC-114 | 将原许可期间、首次申请和处分日分开。无法核实受益范围或未知处分日时 `UNKNOWN`，原在留年限继续单独显示。 |
| PD-370 | 身元保証人非惯常身份、替代或省略材料、代理确认及永住、归化和普通再入国的递交日期，SRC-440 第22、25条，SRC-116 Q53，SRC-119「受付時間」，SRC-112 行政機関の休日に関する法律第1条，SRC-117 Q10，SRC-461 再入国許可申請「申請期間」「受付時間」「オンライン申請」 | 申请局批准的省略可记录，其他材料及代理处理待主管机关确认。候选日的窗口是否开放待确认时，可递交日期留空。普通再入国未选渠道且在线资格待确认时，如果原候选日已知窗口开放且早于出境日，保留当天。其他递交条件满足时，以下情形返回 `UNKNOWN` 并留空最早递交日期。（1）未选渠道且在线资格待确认，同时原候选日窗口关闭或开放情况待确认。（2）按窗口递交时，候选日的开放情况待确认且可能仍赶得上出境。（3）候选递交日与出境日相同，无法判断当天先后。归化实际递交日由管辖法务局安排，普通再入国实际受理时段由管辖入管官署确认。 |
| PD-371 | 就学类型、特支教育、外国人学校、在家学习和特殊情事，SRC-114 第2の5(10)，SRC-115 第57、68号，SRC-454 第17条 | 记录学龄、在籍和通学。个案学校等效、通学例外与国益效力 `UNKNOWN`。 |
| PD-372 | 永住减额具体困难与适用的人道情由，SRC-110 第67条第3項，SRC-443 第25条，SRC-444、SRC-444 | 筛查法定群组，显示普通与已批准减额。指南的变更/更新示例不能保证永住减额。缺官方决定 `UNKNOWN`。 |
| PD-373 | 第22条的“子”与指南実子等边界，出生直接取得、等候期间或被拒后身份，SRC-110 第22条、第22条の2，SRC-440 第24、25条，SRC-113/SRC-114、SRC-119、SRC-450；第6条第2号本人境外出生但生父母一方在日出生的解释，SRC-111 第6条第2号，SRC-460 第6条参考译文 | 已认可亲属关系按对应豁免；普通收养、关系/父母生效时点、特殊待审衔接由官署核验。既有出生出境歧义见 PD-160。；保留当事人和生父母各自出生地。日文及参考英文均未释明该交界情形，缺主管确认时 `UNKNOWN`。 |
| PD-374 | 国际组织保护、特区/地域计划及具体贡献证明，SRC-110 第22条第2項但书，SRC-440 第22条第4項，SRC-114 第3の4・5・9、第4，SRC-453、SRC-458 | 要有上陆或项目、活动和主管机关证据。单凭职业、地区和奖项名称不完成分支确认。 |
| PD-375 | 高度人材历史积分及 J-Skip 参考日、变更雇主和收入、证据与版本，SRC-113 2(6)–(8)，SRC-114 第3の6–8，SRC-449/SRC-448/SRC-448/SRC-449/SRC-449/SRC-450/SRC-449 | 支持现时与回溯双方证据，积分未核验、跨期版本及特殊计入项用 `UNKNOWN`。 |
| PD-376 | 帰化素行、宪法遵守的认定，纳税/社保全国回溯、各险种及迟缴权重，SRC-111 第5条第1項第3・6号，SRC-117 Q9、SRC-118/SRC-118、SRC-459/SRC-459 | 本地材料年数依公开清单输出。“无记录”仅为自报，确认期和非公开裁量 `UNKNOWN`。 |
| PD-377 | 帰化生计、住房证据及公保特殊安排，SRC-111 第5条第1項第4号，SRC-117 Q9、SRC-445 印刷页3–4、19；外国法的行为能力、收养时未成年、多国籍/无国籍、国籍喪失及法定例外，SRC-111 第5条和第8条 | 看共同生计亲属及实际生活，金额和住房/保险非标准证据的认定 `UNKNOWN`。；以本国法和官署记录核定。个案无法由国名、生日、婚姻或单一护照推定；证据不足 `UNKNOWN`。 |
| PD-378 | 特別功労的类别、认定及国会承认过程，SRC-111 第9条 | 路线入口留人工确认，不按奖励名称或分数判定。 |
| PD-379 | 再入国例外文件、期限证明、境外延期及领区费用，SRC-110 第26条、第26条の2、第61条の2の15，SRC-116–SRC-461、SRC-462/SRC-462 | 依据实际证印、领馆公布与审批更新。没有对应文件、特例细节或当地费率时 `UNKNOWN`。 |

## 德国完整版（第 20 阶段，任务 90）

| PD | 待核问题 | 官方锚点及落地处理 |
|---|---|---|
| PD-340 | 身份、护照替代、签证及家属代理 | SRC-100 §§ 3、5、80；SRC-101 §§ 10、34；SRC-410 §§ 39、41。证件替代、是否有必须免补办事由及外国代理权由机关认定。未给适用条款时保留 UNKNOWN。 |
| PD-341 | 生计家庭范围与未来持续性 | SRC-100 §§ 2、5、9c、21、26、28；SRC-101 §§ 8、10；SRC-415、426、435。分清当地 Bedarfsgemeinschaft、扶养权、个人例外、可计暖租、保费及预测。未有完整输入或可信确认时 UNKNOWN。 |
| PD-342 | 公共福利、担保及扶养款的计入 | SRC-100 §§ 2 Abs. 3、68；SRC-101 § 10 Abs. 1 Nr. 3；SRC-106 Nr. 10.1.3。需按路径核定实际领取／潜在资格、款项可执行性与持续性；特殊福利组合 UNKNOWN。 |
| PD-343 | 私保、境外险及护理险等效 | SRC-100 §§ 2 Abs. 3、9c Nr. 3；SRC-429“Krankenversicherung”；SRC-108 Nr. 9c.1.3。当地未确认等效、期限或家庭风险覆盖则 UNKNOWN。适用 § 9 Abs. 2 Satz 6 的路径核对生计医疗豁免的范围，§ 9c 单独核保险。 |
| PD-344 | 等值养老、补缴及豁免 | SRC-100 §§ 9、9c、18c、26；SRC-107 Nr. 18c.2.1.3。私人／在外养老估值、照护可计月、§ 18c 独立养老门槛的疾病豁免及配偶适用按个案，未确认输出 UNKNOWN。本人缴费不足且同住配偶的记录缺失时，保留 UNKNOWN，直至任一方单独满足或其他替代条件成立。 |
| PD-345 | 安全审查、调查和轻刑例外 | SRC-100 §§ 5、9、73、79；SRC-101 §§ 11、12a、37；SRC-106 Nr. 12a.1.4 Rdn. 10（印刷页 95）；SRC-424。罚金仅在超过 90 日额且超额不多于 21 日额时可个案忽略，待决定时 UNKNOWN。分别处理多个刑种、境外和法定排除。不得用单一布尔值判定机关审查。 |
| PD-346 | 职位合格、职业资格与实际雇佣 | SRC-100 §§ 18、18c、18g；SRC-107 Nr. 18c.1.1.5；SRC-430、431。依职业规管、期限、BA 或资格决定判断，未确认 UNKNOWN。SRC-100 § 18g Abs. 4、§ 82 Abs. 1 Satz 6 及 SRC-107 Nr. 18g.4.0、18g.4.2–4：蓝卡换岗已通报，首次就业的 12 个月已满且无暂停或拒绝记录时，无需另行确认。适用窗口内尚待审查、通报事实不明或已暂停而结论未明时，保留 UNKNOWN；30 天拒绝期从实际通知暂停日起算。 |
| PD-347 | 语言／知识证明及豁免 | SRC-100 § 9 Abs. 2、§ 18c；SRC-101 § 10 Abs. 4–6；SRC-107 Nr. 18c.1.1.4–5、18c.2.3。证书可接受性、面谈、早档豁免或因果证明未知时 UNKNOWN。 |
| PD-348 | 地方住房及实际住址 | SRC-100 § 2 Abs. 4；SRC-108 Nr. 2.4.0–2.4.3；SRC-413 BMG。住房地方最低线、合住面积及未登记的其他有效证明按当地，数据不足 UNKNOWN。 |
| PD-349 | 旧居留文件和过渡条款 | SRC-100 § 104 Abs. 1、2、5、7、8。年代、旧法条或欧盟长期居留现行附表兼容性未能定位时 UNKNOWN。 |
| PD-350 | 蓝卡工资与合格就业月数 | SRC-100 § 18c Abs. 2、§ 18g，SRC-107 Nr. 18c.2.1.1–3（第 117–118 页），另见 PD-123。原工资已达线，仅因年度上调而暂时不足，后续同一就业恢复达线且决定日仍达线的，可计该段。工资构成、连续性、恢复达线或跨就业空档合并尚待核实，且影响结果时保留 UNKNOWN。每段按实际入职日和最后工作日取就业与同期缴费的交集。连续就业按对应日届满（PD-120）；机关确认可合计的非连续期间用 SRC-102 BGB § 191 的月天数折算。同月或相邻缴费月之间也可能有空档。缺日期或缺跨空档认定时分别算可确认与最多可计的月数；门槛介于两者之间时为 UNKNOWN，无法确定届满日时不预测。 同一实际工作的多条工资记录共用入职、离职日，工资与缴费分别限于各自覆盖月。逐月问卷没有到账日，只有模拟日前结束且已确认的工资月进入下限，已结束月份的待核缴费仅进入上限。当月和以后按持续合格就业、相应月份结束后缴费得到确认来预测；候选决定日仍须有合格岗位。 |
| PD-351 | 难民生计比例与保护通知 | SRC-100 § 26 Abs. 3，SRC-428“Voraussetzungen”。比例仅柏林有官方量化，另核普通和加速档医疗／退休例外、医保与分母，以及 BAMF 内部通知。全国缺口不使用柏林作默认。SRC-438 所列旧版 § 26 Abs. 3 自 2023-01-01 起适用，更早模拟日涉及旧身份批次的通知要求，保留 UNKNOWN。 |
| PD-352 | 共同生活、关系承认及特殊家庭收入范围 | SRC-100 §§ 9、28、31；SRC-101 § 9；SRC-106 Nr. 9；SRC-435 1 C 12.10。异址／间歇、伴侣承认、监护、单独算个人收入的事实未清时 UNKNOWN。 |
| PD-353 | 他国期间、许可失效及双证 | SRC-100 §§ 9b Abs. 2、51 Abs. 1、1a、2–4、7、9–10、81 Abs. 4；SRC-101 § 10 Abs. 1 Satz 1 Nr. 2；SRC-437 Art. 4、9。多国许可等效、非暂时离境、同时两种永久证及例外事实必须分别确认。逐证记录与许可时间线须能对应到同一份文书，才可合并期限、续期及失效事实。同类文书对应不明，或同一事实的确认记录相互矛盾而影响存续判断时，该文书待核；依赖它的路径保留 UNKNOWN，不预测日期。 R07 将已填报的非暂时性离境定位到对应文书。无适用例外时从离境日起失效，短期返德不能恢复旧证；例外待核且影响日期时返回 UNKNOWN。后续新证按其生效日、已核定的居住期间按核定起点分别评估（另见 SRC-101 § 12b Abs. 2–3）。 |
| PD-354 | 人道定居与企业定居裁量 | SRC-100 §§ 21 Abs. 4、26 Abs. 4；SRC-416、417。“可”授予、经营前景、企业／自由职业混合或只依部分豁免时给 UNKNOWN。 |
| PD-355 | 在读、工时与配偶扶养特殊情形 | SRC-100 §§ 9 Abs. 3a、31 Abs. 3、35 Abs. 1–4。跨境学期、资质认可、大学与青年援助并存、非固定周工时或可执行扶养未获确认则 UNKNOWN。 |
| PD-356 | 高资质、“多年”、实际公务员任用 | SRC-100 §§ 18c Abs. 3、19c Abs. 4；SRC-107 Nr. 18c.3。州同意和无全国数字的岗位门槛，普通公共就业与法定任用需审文书。 |
| PD-357 | 自由流动早档、合法性与永久权丧失 | SRC-422 §§ 2–6、12。跨国通勤、离职前类别、前后家庭权源、因重要理由离开及主管机关失权判断应有证据。 |
| PD-358 | 入籍生计豁免和语言／声明边界 | SRC-101 §§ 10、40a；SRC-106 Nr. 10.1.3–10.1.8。全职、接近门槛的中断、历史劳务个案、持续性、未成年人／行为能力及疾病适用按办案。 |
| PD-359 | 入籍裁量、缩期、收费边界及历史日期 | SRC-101 §§ 8–10、38；SRC-410 §§ 44–53；SRC-106 Nr. 8、9、10.2；SRC-411、432、434。家属缩期和个案减免不能从金额倒推，部分历史收费生效日和地方考试报价未核则 UNKNOWN。 |

## 澳大利亚完整版（第 20 阶段，任务 83）

| ID | 事项 | 出处 | 如何评估 |
|---|---|---|---|
| PD-200 | 单科重考、拼分及旧版 TOEFL iBT 口语的认可 | SRC-205 ss 6–8；SRC-206 ss 7–11、Sch 2，特别是 s 10(5)(c)；SRC-226 表 2 TOEFL iBT 行 | 旧版口语法定线为 18，内政部表 2 为 21。若其余单科达标、口语为 18–20，且仅凭该成绩证明 Competent English，输出 `UNKNOWN`。2023-07-26 至 2024-05-04（含首尾）停认的 TOEFL iBT 不作英语证明。适用性未确认的重考或拼分仍待核对。 |
| PD-201 | PIC 4007 中 undue cost / prejudice 的个案判断 | SRC-200 Sch 4 PIC 4007(2)；SRC-218、SRC-219 | 自报病史不能代替医官意见。已知费用风险也不能预测豁免决定。 |
| PD-202 | 品格测试及未通过测试后的部长裁量 | SRC-211 s 501(1)、(6)–(7A)；SRC-220 | 区分已知刑期、其他不利事项和最终决定。未决个案保留待确认。 |
| PD-203 | 关键技术转移风险认定 | SRC-200 Sch 4 PIC 4003B | 指定机关的意见无法从职业或学科推断。 |
| PD-204 | 前置签证的实质遵守，迟报变更、赴区外工作或研究 | SRC-200 189.241、191.221、191.231，Sch 8 conds 8578–8581；SRC-202 | 一般条件的轻微违规留待审查。191.221(2) 对 8579 另有明确的遵守要求；只有适用文书列明的类别才可例外。 |
| PD-205 | 入籍后身处海外时与澳洲的紧密持续联系 | SRC-061 s 21(2)(g)、(4)(e)，s 24(5) | 有海外计划但主张保持联系，或主张境外批准例外时，须核对法定分支与裁量。 |
| PD-206 | 186 TRT 高薪年龄豁免用到的 Fair Work High Income Threshold | SRC-203 ss 4–5；SRC-212 reg 2.13 | 已存档指数化公式；缺少 2026–27 年度金额的官方快照。申请高薪豁免时保留待确认。 |
| PD-207 | 186 TRT 跨雇主、无薪假及境外工作的时间归属 | SRC-200 186.226–227；SRC-064 Eligibility | 现有全程担保全职的计算可复用。混合经历需核对具体聘用及休假记录。 |
| PD-208 | 雇主提交的 annual market salary rate 证据是否获认可 | SRC-200 reg 5.19；SRC-210；SRC-214 | 使用保证年收入核对适用门槛。市场证据未确认时保留待核对。 |
| PD-209 | SkillSelect 实际竞争与获邀时间 | SRC-200 Sch 1 items 1137(4B)、1138(4)，189.224、190.214；SRC-201 | 达到法定分数不能确定下一轮书面邀请。已有邀请时另核对邀请所载分数和期限。 |
| PD-210 | 189／190 获邀后仍待职评结果 | SRC-200 189.222(1)、190.212(1)；SRC-225 General Skilled Migration (GSM) visas | 条文以获邀时为基准。内政部按 *Thapa* 接受在 60 天邀请期内取得的合格职评。已取得的按实际日期核对，仍待出具时不能预测结果。 |
| PD-211 | 各州、领地提名的动态挑选标准 | SRC-200 Sch 1 item 1138(4)，190.211、190.215 | 以实际提名及是否撤回为准。尚待州决定时不能预测提名。 |
| PD-212 | 191 最低应税收入文书、跨财年很短的持签期 | SRC-200 191.111、191.222；SRC-063 Satisfy the income requirement | 现行无最低收入额。财年须在申请前结束；仅持签部分时间也可计入。对通知或关联持签期有争议时列待核实。 |
| PD-213 | 事实伴侣年限例外与真实持续关系的证据 | SRC-200 regs 1.09A、1.15A、2.03A | 关系证据与 compelling and compassionate circumstances 的待审决定不能从月份推定。 |
| PD-214 | 境内伴侣的 Schedule 3 豁免 | SRC-200 820.211(2)(d)，Sch 3 cls 3001、3003、3004 | 迫切理由须按个案认定。 |
| PD-215 | 858 书面邀请与国际杰出成就认定 | SRC-200 Sch 1 item 1113(3A)，858.211–212 | 尚待邀请、杰出成就或特殊年龄贡献审查时，不能预测决定。 |
| PD-216 | RRV 实质联系、长期离境理由与 157 迫切同情理由 | SRC-200 155.212(3)–(4)、157.212–213；SRC-066 | 分别核对替代路径。尚无裁定的实质联系和迫切理由由审理机关判断。 |
| PD-217 | 入籍考试多次未过后的重考安排 | SRC-061 s 23A；SRC-215 Pass the test | 可判断单次分数，不能推断重考后果或将单次失败视为永久失格。 |
| PD-218 | 入籍 good character 审查 | SRC-061 s 21(2)(h)、(3)(f)、(4)(f)；SRC-067 | 与签证 s 501 分开。轻微犯罪或交通记录无统一清除年限，等待品格核查。 |
| PD-219 | 入籍居住豁免、特殊居住或国防服役替代 | SRC-061 ss 21(2)(c)、22(5A)–(11)、22A–23 | 一般居住天数可算。主张特殊规则、羁押例外或部长裁量时，须核对适用资格与决定。 |

原有 PD-084（入籍出入境日计法）、PD-085（186 TRT 分段持签与工作）和 PD-108（香港通道通常居住）继续适用。

## 西班牙完整版（第 20 阶段，任务 87）

沿用 PD-097 至 PD-100。来源编号后的字母对应来源登记备注中的具体文书。

| ID | 涉及条件／官方未明确的内容 | 引擎口径和核实触发点 |
|---|---|---|
| PD-280 | N03/N04。SRC-084 arts. 20、22，SRC-322a art. 10.2、anexo §§2.b/g。更换国籍后的居留名义、非典型原始国籍／塞法迪凭证，及旧案、外国个人法和支持措施下选择权何时真正届满。 | 证据明确时分支可算；缺官方资料时用 UNKNOWN，显示可并行评估的一般分支。接到司法部明确分类或当事人资格文书时核实。 |
| PD-281 | N06。SRC-084 art. 22.2.d 和 SRC-322a anexo §2.d 未在此明示配偶婚后归化、结婚已满一年而西籍较短的起算。 | 问两日期。距两者均满一年可按证据判断；结果仅在婚期起算成立时满足标 UNKNOWN。以司法部／Registro Civil 明确当事人规则或适用判例核实。 |
| PD-282 | N09/N13/N17。SRC-084 arts. 20–23，SRC-321 arts. 4–6，SRC-323d。年龄端点及残障现行支持文书与旧条例的 capacidad modificada 表述适用。司法部已明确未满 14 岁代表一致时无需事前民事登记授权。 | 依生日、解放及支持决定，缺证时 UNKNOWN。N13 依 SRC-322a art. 10.6、SRC-341a art. 4.2 核实义务教育学龄或适用机构登记。小学从满六岁自然年的学年开始（SRC-341b art. 5.1–2）。入学年九月递交且是否开学会左右结论时，缺当地首个授课日输出 UNKNOWN，按自治区校历核实（SRC-341c §4.1，Organisation of the school year 第 1–2 段）。所需机构证明未查清时也输出 UNKNOWN。恰满 14 周岁、个人无法声明等有版本或文书适用争议时向主管机关核。 |
| PD-283 | N10/L12/E08/R05。SRC-084 arts. 21.2、22.4，SRC-083 arts. 177.5、184.5、187.4、189.5及 Hoja 49/50/53。证书与品格或实际安全威胁之间的判断；长居指引对公共健康的列法较专条宽。 | 自报无刑事记录、证明齐备及机关实质决定分别展示。无最终决定或法源边界影响结果 UNKNOWN。以法定的理由及个案决定为准。 |
| PD-284 | N12/N17。SRC-322a art. 10.4、SRC-321 art. 12、SRC-343b pp. 2–4。CCSE 优先证书所列有效期，成绩批准日与签发日不一致时如何核验；获批后迟收到通知、公证申请停钟或 Registro Civil 预约跨期的证明。 | 有注明的证书有效期直接使用。公证申请按司法部指引暂停届满期间，等实际证明。没有可靠出证日、通知日或停钟证据时 UNKNOWN，勿把所有预约一概视为停钟。 |
| PD-285 | L01/L11/E01–03/E07。SRC-083 arts. 176.a、183.2 没写混合旅游与工作缺席的总额算法；折半累计后的五年缺席窗口、向半日或边界取整、蓝卡最近两年内的旅行如何具体处理。 | 普通离境累计月数换算为天的边界见 PD-097。月份换算、混合离境或折半的取整影响模拟日结论时保留 UNKNOWN；可单列较严格读法下能复核的居留候选日。E 的两种缺席计算窗口分开展示，保留出境原因及全部日期。完整版 L 对已明确的学习停留依 SRC-320 arts. 30 bis、32.2、33 排除。L/E 依 SRC-090 art. 30.4–6 使用适用的官方假日表；逾期递交是否有效取决于尚未提供的假日表或机关认定时为 UNKNOWN。PD-098/099 中原时间评估器的处理继续适用于原页面。 |
| PD-286 | L04/R06。SRC-083 arts. 183.3.b、187.3.a 分别要求类比给付够维生或固定定期资源，原文和 Hoja 54 未给同一具体门槛。 | 可标证据及稳定性，金额充足性 UNKNOWN，避开自动套 E05。以主管机关书面所用标准或个案决定核实。 |
| PD-287 | L05/L07。SRC-083 art. 183.3.c/e 所用达到成年时及申请前分别是哪日，对已成年一段时间的递交没有给窗口。 | 询问生日、申请日及临界日前后文书。年龄解释决定结果时 UNKNOWN，待当地书面规则。 |
| PD-288 | L13。SRC-083 art. 184.3.c、4，SRC-341a art. 4.2、341b art. 5.1–2、341c §4.1 第 1–2 段。境外学龄子女、特殊学制、特例及刚达到学龄时证明范围。 | 按孩子满六岁当年的入学届别核对，入学年九月需要当地首个授课日才能判断时为 UNKNOWN。居留候选日也要核入学证明；已到学龄、缺证明且未有补件结论时为 UNKNOWN，已过补件期限仍未入学则不满足。境外或特殊学制按个案核实。 |
| PD-289 | E01/E04。SRC-083 art. 176.a、SRC-331a arts. 3–4。具体临时／保护或特殊跨国许可归类，以及蓝卡 100% 所指「该期间」遇非典型双重身份的适用。 | 合法取得保护且有案卷起止的期间照条文。结论依赖不明确许可或双重身份时 UNKNOWN；取得许可决定、官方计入说明后核。 |
| PD-290 | E05/F03。SRC-083 arts. 67.1、176.b、180.3.d，Hoja 50/52。找不到单人统一百分比；家庭减额及 SMI 指引与 IMV 法条的关系、IMV 基准、资产可动用折算、汇率日、来自第三方的资源定期性。 | 按已发布的标准家庭额度列参照。条件仅靠边界和例外成立时标 UNKNOWN。以现行补充规章、适用欧盟判例或个案认定落定。 |
| PD-291 | E06/M03/F04/R07。SRC-083 arts. 176.c、179.3.d、180.3.e、187.3.b，Hoja 50/54。不同公共资格、境外保单、候保期和免赔能否被接受。 | 区分有公保资格、在西授权保单和实际覆盖。保险有缺项或有领馆额外要求时 UNKNOWN，核主管机构或领馆的对应指引。 |
| PD-292 | M02。SRC-083 arts. 179.3.d、61–62，SRC-345 Hoja 51。住宿证明形式及应备资金覆盖多久未按该长期居留分支统一公开。 | 有居所但适用的证明方式待确认时 UNKNOWN，明确无居所时为 NOT_MET。按月显示门槛及所选期间的金额；期数或跨币种折算影响结果时 UNKNOWN。 |
| PD-293 | M04/M07–09。SRC-083 arts. 74、84、88–89、179.3.d、179.6。跨境各从业分支采用何种当地集体协议、是否另出用工许可／另收费，以及依法免工作许可的社保生效证据。 | 已有雇佣或行业文书时按条文判该项；需要的文件、职业许可、价格或生效条件不明 UNKNOWN。 |
| PD-294 | F02/F05/T01。SRC-320 art. 17.1.b、d，SRC-083 arts. 66.1.c、179.7、180.1、180.7–8，SRC-325 anexo 4。共同监护时条文明列另一监护人同意，未说明单凭法院迁居许可是否足够。直系尊亲属恰满 65 岁当天的适用待核。F 的实际卡名、费目，及部分更新或年龄边界在发卡决定中的适用。 | 共同监护仅录有法院许可时为 UNKNOWN，须核文书效力或补充另一监护人的同意。年龄端点决定资格时为 UNKNOWN，核对主管机关的认定。原则列公开费用档位，待明确卡类后输出具体收费。区分政府许可和卡面名称。 |
| PD-295 | R01/T02。SRC-083 arts. 186、188、201–203，SRC-348。普通 EU 长居合格短返按欧盟判决中断连续不在 EU；国内长居、蓝卡特殊 **24 个月**与离开西班牙恰满 **6 年**的细节边界仍需核实。 | 保存实际入出境证据及失效决定。边界或六年例外受裁量时 UNKNOWN。 |
| PD-296 | R03/R04/R05/R08。SRC-083 arts. 187–189、38，SRC-333c。R-N 自愿返乡承诺期间访西可获准延期（art. 189.4），完整版输入无法记录批准及其期限。领馆材料有旧法编号、不同护照剩余期限、体检或费目；另一成员国居留的入境例外和领馆是否还要求签证需按本人确认。 | R03 当前按普通三个月上限判断，获准超期也可能显示 NOT_MET；按延期文书人工复核。采用现行 art. 38.a–e、h 和恢复专条；官方办事材料冲突、境外签证费用或免签未证 UNKNOWN。待对应领馆确认其现行要求。 |
| PD-297 | U01。SRC-327、SRC-328a、SRC-328b。西籍亲属行使自由流动、旧 EU 家属卡过渡及 EX24 的转换。 | 从原许可依据、真实跨境及最新决定判断；无明确依据 UNKNOWN，附独立 L/E 结果。 |
| PD-298 | U04/U05/U07–U11/U13。SRC-327 arts. 7、10–14、15.3，SRC-330 arts. 16–17、21。按 art. 16.3，普通临时离境每年合计最多六个月，欧委会指引按合法居留周年分年累计。另需核实提前取得时的卡件窗口，以及过渡期间的财力与医保凭据。[欧委会自由流动指引 §9.2](https://eur-lex.europa.eu/eli/C/2023/1392/oj/eng) | 审核用例自 2021-09-01 合法居留，唯一一次普通离境为 2023-05-01 至 2024-01-01，跨两个居留年度，各约四个月。当前 U04 按整段返回 NOT_MET，待按周年分年复核。U07、U08、U09 和 U11 的居住年限从最近一次恢复合资格居留或超限离境返西后计算。U07/U08 只填居住日与就业日时，就业前的合法居留依据仍待核。若停工日能否提前取得取决于该期间，则提前取得依据为 UNKNOWN。没有其他已证实的取得途径时，两个日期均留空。合资格依据、离境事由或累计月数折算待核，且会改变结果时为 UNKNOWN。U11 须核死亡工人本人的历史和行程，仅有工人首次居住日不足以证明连续性。跨境工作者或随工家属已提前取得永久权，但无法确定长假是否发生在取得后，维持条件为 UNKNOWN（SRC-327 arts. 10.2.c、10.3、10.7）。历史居住与证件费分开算。特殊临界、非标准医保与财力凭据未获认可时 UNKNOWN。 |
| PD-299 | U06–U08、U11。SRC-327 arts. 9、10，SRC-330 arts. 12、13、17–18。死亡前居住和独立保留、退休配偶豁免涵盖哪些工作时长。 | 国内及指令两端均满足可显示已具对应证据。只满足一端时 UNKNOWN，待个案决定或适用解释。同一死亡事件下，U06 的保留依据待核时，家属仍可依已证实的 U11 在死亡日取得永久权（SRC-327 art. 10.5，SRC-330 arts. 17.4、18）。离婚生效与启动诉讼分别记录；缺启动日且无其他可证保留事由时，三年婚期分支按待核处理（SRC-327 art. 9.4.a）。 |

## 加拿大完整版（第 20 阶段，任务 85）

沿用时间引擎 PD-089–091。表内来源数字后的字母按调研档案区分同组文件，具体快照与官方网址见来源登记备注。

| PD | 未决事项及正式来源 | 判定与何时可关闭 |
|---|---|---|
| PD-240 | IRPR ss.61–62 对派驻企业、通常同住和执法后计日需要个案证据。s.28(2)(c) 是 H&C 裁量。SRC-075、261b、265d。 | 显示实地基线。只有可计境外日、报告后计日或 H&C 会改变结论时，将整体资格标 `UNKNOWN`。收到合规认定、派驻/同住等文件才能更新。 |
| PD-241 | Crown service、借调、身份/不可计日以及 minor presence waiver 的法律事实取决于官方证明。SRC-260a ss.5, 21、260c s.2、262a。 | 保留普通时间基线。受争议期间决定过线，或以豁免/军队特别条款申请时显示 `UNKNOWN`，待 IRCC/CAF 或相关法院文件。 |
| PD-242 | 部分税年、跨境税务居民、豁免或追补报税不能用国籍/居留日数推断。SRC-074 s.5(1)(c)(iii)、262a/g。 | 只采用逐年应报/已报或依法无须报的可确认状态。涉及不明且影响 3 税年门槛时 `UNKNOWN`。 |
| PD-243 | 等效境外刑事分类、rehabilitation、记录暂停、青年处分、审查、上诉与裁量。SRC-260a ss.19–22、261a ss.33–42.1、261b ss.17–19、133。 | 无法由自述预测。只有已确认法条和裁定后才设明确状态，不录入案情细节。 |
| PD-244 | 体检复用、完成期限延期或接受补做、医疗可接受性与 mitigation 的个案认定。EE 常规体检在获邀后、递交前完成，IRCC 指南未明确获邀前已做的体检是否获接受。SRC-261b ss.20, 24, 30–34、266b（When to get your medical exam，Express Entry）、266d/f。 | 获邀前体检且无适用复用或豁免决定时为 `UNKNOWN`。缺邀请日期，或体检与获邀、递交同日且无法核实先后时，也保留 `UNKNOWN`。其他类别逾期时列出原截止日。延期、接受补做、豁免或结果待决定时输出 `UNKNOWN`，依 IRCC 通知更新。 |
| PD-245 | 未随行子女、单独监护、无法体检/警证及既有未申报家庭成员，相关类别适用可有差异。SRC-261b ss.23, 30, 117, 125、266g–k、274b/c/g、277c、279b/e。 | 有正式免检/例外证据时采纳。旧政策过渡或特殊证件仍待决定时 `UNKNOWN`。现居国警证随申请提交时按本路径联邦收件日核效期。AIP 首次递交时，SRC-266g “For the country where you currently reside” 第 1 段的六个月签发窗口与 SRC-279e “Police certificates and clearances” 第 2 段的通常一年效期如何适用，IRCC 未作说明。证书符合签发机关效期时，签发不超过六个日历月为 `MET`，超过六个月至满一年当日为 `UNKNOWN`。首次递交超过一年或已过证载末日为 `NOT_MET`。补件按 IRCC 收到该份警证的日期核对。AIP 应要求补交的现居国警证通常自签发日起有效一年，仍受签发机关效期限制（SRC-279e “Police certificates and clearances” 第 1–2 段）。补件恰满一年且证上末日不明，或超过通常一年且没有 IRCC 接受较长效期的确认时，为 `UNKNOWN`。其他路径沿用六个日历月的签发窗口（SRC-266g/k）。PNP 模式缺失且两种清单结论有别时为 `UNKNOWN`。迪拜警方仅列三个月有效期；收件恰在满三个月当天且证上末日未知时为 `UNKNOWN`。需要 IRCC 索证信时，已随申请上传说明等待发信、已获信待补、只有未来回执均为 `UNKNOWN`。香港警方直送且本人无签发日时，IRCC 对该份警证的回执可确认补件。已知补件时已过期的现居国警证为 `NOT_MET`。普通补件仍核签发日和回执。随行子女按该路径完整申请锁龄，未能确认相关阶段收件或逐人受抚养条件时为 `UNKNOWN`（SRC-261b ss.2, 25.1、274c “Definitions of dependent children”）。直接担保的主申请子女以完整收件日判断是否未满 18 岁（SRC-274c Guide 5289，Step 5 “If you’re sponsoring dependent children” 第 3 项）。直接担保及随行的未成年人如需监护同意，缺同意或准许迁居的法院文件、仅附说明待审或迁居权限不明时为 `UNKNOWN`，已有明确禁止迁居的决定则为 `NOT_MET`（SRC-274g 第 6 页第 3 项、266h/i 第 3 页第 10 项、279b 第 4 页第 18 项）。 |
| PD-246 | EE 当前及未来轮次类别、分数和生效版 MI，不能预测 ITA。SRC-261a ss.10.3, 11.2、269d/e、276a。 | 历史对比用该轮指令和已公布 cutoff/tiebreak。未来轮次为 `UNKNOWN`。R29 依据本项目 ITA 或正式更改的期限与实际电子收件日核对。缺收件日时，截止日前后均为 `UNKNOWN`（SRC-269e §6、277b 第 1、4 节）。 |
| PD-247 | 2026-11 EE 临时政策对具体 offer 的真实性/许可豁免、技术职责、付费医师与 NOC 41200 非工资款项。项目最低资格与 CRS 指令的法律依据不同，线上 profile 过渡也可能未反映变化。SRC-267a–c、269b/c/e/f、279c。 | 记录 ITA 生效分区、来源和书面结果。若依赖官员豁免或线上分数未匹配，只出条件式估计，关键项 `UNKNOWN`。FST 的职业资格证以主管机关确认为准（SRC-261b，IRPR s.87.2(3)(d)(i)）。如届满后能否继续持证不明，证书条件保留待确认，另核是否有合资格 offer。 |
| PD-248 | 资金表虽按 LICO 机制年度发布，官网 EE/AIP/IMM 1283 仍显示各自 2025 版。具体更新日、银行可用性、FSW/FST 新 offer 豁免与 AIP 有授权但无工签的情形。SRC-261b ss.76, 87.2, 87.3, 134、268a、270c、274d、277a。 | 现行表按项目参考并明确版本。未来年度无正式参数或资金/豁免证据不够则 `UNKNOWN`，以官方新表或书面意见关闭。 |
| PD-249 | IRPR s.87.1(2)(e) 用经历最多的职业。来自不同阈值的职业经验完全同量时，未找到明确的 tie-break。SRC-261b、267b、268b。 | 两阈值都过或都不过可稳健输出。只过一个则 `UNKNOWN`，待当前指令澄清。 |
| PD-250 | 真实定居意图、各省 nomination、目标省/工作地点/跨省雇佣和通知条件。SRC-261b ss.75, 86, 87–87.3、271a–f、272b、273b/m。 | 省提名与联邦分开。未来邀请、意图文件冲突或安省外地方 stream 未建模时输出 `UNKNOWN`。省方可决定是否延长提名，以实际签发的证书或延长函为据。若无法确定原证是否覆盖本次收件，或省方是否维持提名，需补联邦收件及省方记录。 |
| PD-251 | OINP 岗位、Job Bank 本地工资/集体合同覆盖、强制办理 CVOR/许可、特定 NOC 学历和工作经验例外的优先级。SRC-272a/b/d、279a。 | 记录对应申请日官方工资依据。驾驶岗如同时落入通用技工例外则以条例与省书面答复复核。缺其中决定性资料为 `UNKNOWN`。 |
| PD-252 | AIP 的 IRPR s.87.3(6)(d)(iii)、(7) 将 TEER 2 与 3 列为同级，但 IRCC 报价表只列 TEER 3、4 经验可配 TEER 3 报价。医护例外另有代码差异，s.87.3(6)(d)(ii) 列 32101，IRCC 指南列 31201，两者均列 31301。另有毕业学习方式及指定雇主审批。SRC-261b、270a–i。 | 对照法规层级和医护代码，模型在网站/法规有相反判定的输入同时显示条文结果及 `UNKNOWN` 人工复核提示。地方认定以 endorsement 等正式证据。 |
| PD-253 | PSTQ stream 3 需求页与申请页分别写从收邀和接受起算，以及受规管场景、外学历等值、伙伴 opinion、价值观家庭成员混合状态。SRC-273b/c/d/g/i/j/m、278e/f。 | 信件期限、有权机关文件、主管部门答复优先。两种起算日会改变结果且无正式期限时为 `UNKNOWN`。本人或随员 CSQ 的签发、历史效期或撤销情况无法确定时，按联邦收件与 MIFI 记录核实。 |
| PD-254 | 2026 PSTQ 自足金 PDF 成人依赖子女增量只列在双成人部分。共同条文还含加拿大公民依赖子女。SRC-273f p.1、278e art.32.1 para.3。 | 单成人+成年子女、公民子女或其他未明确组合，有适用合同/官方书面额才判，否则 `UNKNOWN`。 |
| PD-255 | 担保关系真实性、障碍、既有不合规、缺合法身份豁免及 Indian Act 登记担保人与 IRPR s.130 文字差异。SRC-261b ss.4–5, 117, 124, 130–137、274a–f、275e/g。 | 定性或例外不明 `UNKNOWN`，项目只出已证实要素。依据对应个案的受理/批准通知更新。 |
| PD-256 | 魁省配偶 undertaking 批次表末档按已发布的联邦信日期，超出范围和剩余名额不能预测。SRC-275c、276c。 | 显示目前公告的适用批次，未来截止/名额或境内收件信是否满足要求未知时显示 `UNKNOWN`，等待 MIFI 更新或直接受理。 |
| PD-257 | Québec 汇编法规 Règlement sur l’immigration au Québec 的官方 HTML/PDF 请求返回 403。当前政府业务页和 Québec Gazette 已核，可定位初始条文。未完成至基准日的汇编逐条复核，尤其 stream 1/2 魁省学历学时/个别跨境家庭口径。SRC-273b、278e/g。 | 主要求以现政府指南与 Gazette 共同找依据，具体只有旧法和新指南措辞不一且决定结果时 `UNKNOWN`。待以现行汇编逐条核销差异。 |
| PD-258 | 联邦永久居留费按 IRPR ss.294(d), 303(1.1) 定期调整。入籍费、魁省家庭担保费亦有各自的生效期。未公布的费率及联邦调价当日适用价须按正式费表核对（SRC-261、264、275）。 | 已有费表期内按付款日和家庭组成计算；未覆盖的日期或换档时点只提示补查费表与回执。 |
| PD-259 | Citizenship Act s.5(3) 的语言、知识或宣誓豁免取决于个案决定（SRC-260、263）。 | 申请豁免且尚无书面决定、该豁免又会改变结论时保留 UNKNOWN；记录准予或拒绝后重算。 |

## 爱尔兰完整版（第 20 阶段，任务 89）

| ID | 事项及官方定位 | 对结果的影响 | 明确条件 |
|---|---|---|---|
| PD-320 | `full age` 的特殊未满龄婚姻。SRC-091 s15/s15A 与 SRC-401 s2(1)–(2) 保留成年定义，SRC-095 一般写 18 岁以上。 | 未满 18 岁且主张爱尔兰法承认的特殊婚姻仅走 `UNKNOWN`，不以年龄字段代替外国婚姻承认。 | ISD 或个案法律认定。 |
| PD-321 | 旧 IRP 已到期且续期待决，或只有许可记录、没有可确认的当前 IRP 到期日。SRC-383 ss4–5、9，SRC-384 在线续期 When should I submit a Renewal Application?，SRC-096 Stamp 4 upgrades 的 Eligibility criteria，SRC-095 避免空档。 | 共和国境内线上续期在 IRP 到期前 12 周开放。优先用卡面到期日，只有一段当前居留许可且有结束日时通常可据该日计算。先统一按既有时间线推断记录中省略的结束日。EU／WA 永久证件续期须核对现卡到期日。普通就业续期和 Stamp 5 续期还核对现有 Stamp 类别。类别不能确认、到期日缺失、记录冲突或旧卡过期后的递交资格未确认时给 `UNKNOWN`。卡面日期不能覆盖明确无效的许可。预测递交日超过本次使用的到期日时，须届时持有有效许可或正式延续证明。 | 卡面到期日、新卡或正式延续证明。 |
| PD-322 | 身份和居住证据边缘。SRC-095 scorecards 的过期护照两档未涵盖正好 365 日；SRC-381 专页有时仍链旧版 PDF。官方也没有为所有 affidavit、支持住所、北爱证明公布等同规则。 | 证据分可给明示档位；刚满一天界线、无标准证明的代替安排或个案例外 `UNKNOWN`。 | 现行评分表补充说明、个案审核。 |
| PD-323 | 保护类别映射、免登记的合法居住证明、入籍旅行缺口、难民最后一年居住及豁免范围。SRC-091 ss15B、15C、16(1)、16A，SRC-095 的 EEA、瑞士及英国公民可计居住、难民专项居住、Time That Does Not Count 及 70 Days Absence Rule，SRC-405 未成年人登记及旅行，SRC-381 难民政策变更，SRC-380 reg. 13(2)、SRC-383 reg. 4，SRC-408 ss203、286。 | 明确难民身份者分开核递交前一年与更早的累计期。合并或拆段录入时，对照出入境日两侧可计居住及覆盖整个行程的可计许可或经核实的无 IRP 合法居留区间。缺席按出境整日计算。免登记或当前许可状态本身不足以证明历史行程，缺连续佐证时按适用分支给 `UNKNOWN`。一般及配偶入籍按证据实际覆盖的日期核对截至模拟日的免登记居住。证据覆盖模拟日且可计居住区间仍开放时，可以在继续合法居住的前提下预测最早递交日。届时重新核对证据。缺可计合法居住佐证时，按适用条件给 `UNKNOWN`，逐年材料分数另核。超出通常缺席额度且待认定或豁免范围未明时仍待确认。无国籍人与附属保护的通用年限及减免仍待确认。 | 连续许可或经 ISD 接受的其他合法居住证明、ISD 确认 s16 缺席口径、正式豁免范围、保护认定或新费用条例。 |
| PD-324 | s15B 与指南的 14/16 岁表述和未成年不参加典礼的办理口径。SRC-091 s15B(1)–(4)；SRC-095 “Good Character”；SRC-381 旧页。 | 法规适用年龄按 14；声明方式、部长个案豁免及儿童 vetting 操作细节 `UNKNOWN`。 | 现行未成年人流程指南或指定方式。 |
| PD-325 | s16 waiver 的证据权重、服务类别和不同酌情路径的居住口径。SRC-091 ss15–16、SRC-095 Form 9 与 SRC-400 associations 指引。 | Form 9、Irish associations 和本人境外公共服务路径单列递交前一年的居住检查。适用的正式豁免可满足这项检查。缺少居住记录或不满足常规居住且豁免待决时为 `UNKNOWN`。 | 正式决定及公开细化。 |
| PD-326 | 就业 Stamp 4 是否按提交、IRP 到期或其他日期核满月，ICT 材料及雇主更换追溯。SRC-096 升级页与 SRC-384 Stamp 4 (1)–(2)。 | 维持 PD-116 时间。单列可提早发起续期与正式资格日期；当前表缺 ICT 独立材料清单，矛盾场景 `UNKNOWN`。 | 更新后的办理清单及 ISD 对三个日期的口径。 |
| PD-327 | 就业 Stamp 4 的品格、许可合规与独立升级费用。SRC-394 CSEP 页的说明与 SRC-096 升级及 SRC-384 登记页。 | CSEP 有明示的品格与过往遵守要求；其他组复杂个案给 `UNKNOWN`。沿用登记费，未列的专项行政费用不编造。 | ISD 补充资格清单、实际通知。 |
| PD-328 | 2026 职工报酬的官方差额、边界。SRC-393 S.I. 643/2025 Schedule 8 与 SRC-394 MAR 总览给不同档。法定 CSEP €40,904 / €36,848、ICT €49,523；总览对应 €40,909 / €36,849 / €49,522；个别职业页比较字眼有出入。 | 默认取生效条例，并核 CSEP 高额档具体职业限制、小时数和现行行业例外。落在临界争议或缺少法规依据的未来费率 `UNKNOWN`，不回写升级工资硬门槛。 | eISB 修正、主管部门改正或书面答复。 |
| PD-329 | 家庭 Stamp 4 的历史版本、续时、成年及担保人变动。SRC-387 §§6.6、16、Appendix C，SRC-096 FAQ 27–30、2024 通告，SRC-384 续期清单，SRC-388 境内 de facto 的 What happens next?。 | 分开 5 年分支与入籍分支；担保人提前入籍时还要检查 3 年附注。符合年限但下次线上续期日未确认、续期时已成年、家属政策版本或子女许可未明、许可逾期及过渡证明不完整给 `UNKNOWN`。普通续期须确认申请人持有对应家庭许可，按适用清单及批准信核对。许可类别或附加条件缺材料时给 `UNKNOWN`。 | ISD 批准信或年龄、过渡、续期指引。 |
| PD-330 | 境内爱尔兰公民配偶的两种入口、配偶事务组的个案判断、de facto 境内外指引差异及首次登记清单。SRC-384 首次登记及登记 FAQ 的 Travel and Re-Entry Visas，SRC-388 的 Am I eligible?、How do I apply?，SRC-385 修订说明，SRC-387 §§3.5、5.5、7.11、9–10、16。 | 持有效 IRP 的境内配偶线上换签按本入口核对财力和共同住址等材料，并按 SRC-384 在线续期的 Introduction 和 When should I submit a Renewal Application? 计算窗口。SRC-388 的 How do I apply? 要求该入口持有现行已登记许可。许可明确无效或 IRP 已过期且无待决续期时，所选线上入口为 `NOT_MET`。续期待决且现行许可未证实，或不能确认 IRP 到期日时，为 `UNKNOWN`，无递交日（见 PD-321）。首次登记按 SRC-384 Stamp 4 (3) 的 First Time Registrations 核对保险。无有效许可等专页列明的情形走配偶事务组，过去三年 €40,000 收入不计国家福利，过度负担由 ISD 个案评估。入口、转介或个案负担无法确认时为 `UNKNOWN`。适用 June 政策的普通境外 A 类新案用 €75,000，并核对住房。B5 境外 de facto 专页的 €40,000 及既往担保 7 年与六月政策冲突未确认时为 `UNKNOWN`。境内 de facto 要求双方已合法居住。境内配偶及 de facto 转换若涉及另一段关系的既往担保获批，专门流程未说明如何处理该记录，B15 为 `UNKNOWN`，由 ISD 个案确认。§7.11 的等待期用于该政策覆盖的团聚申请。境内配偶与 de facto 均须在共和国递交。短期出境时核对返爱当日的许可或另外确认的入境及转换依据，同一行程实际返爱当天仍采信对应的日期证据。返爱依据欠缺时为 `UNKNOWN`，无递交日。获准家庭入境后按获准 Stamp 登记，未确认获准入境或适用清单时为 `UNKNOWN`。 | ISD 确认申请入口、专门流程、旧担保影响或个案负担，核实批准信、登记清单及适用返爱依据。 |
| PD-331 | 家庭团聚的 savings 计价、`mainly reliant` 和继续维持的具体口径、混合税年及收入认可。SRC-387 §§9–10、SRC-386。 | 能算标准单人税年收入及福利持续期；自报储蓄不足以通过门槛，复杂比较 `UNKNOWN`。 | ISD 公开量化规则或个案认定。 |
| PD-332 | C 类住房指导与 s63 的边缘。SRC-387 Appendix E；SRC-402 s63。政策示例与法条不同龄同卧写法，HAP 等住房支持需个案。 | 记录卧室、年龄、居住人、RTB、法条体积及正式补件时间，清楚冲突报告证据缺口；10 岁边界、较小异性儿童同卧与其他公共住房支持的认可 `UNKNOWN`。 | 官方解释、最终住址资料和户型证据。 |
| PD-333 | WCATT / LTR 的 `undue burden`。SRC-097 WCATT FAQ 未给项目表，SRC-398 LTR FAQ 只说明 PRSI、非保险福利和个案。 | 保留区别，只有福利类型和自报评估，个案 `UNKNOWN`，不以团聚金额或收入比例判。 | 方案各自清单或书面决定。 |
| PD-334 | Stamp 5 每年 4 个月及 LTR 通常 90 日的边界。SRC-097 权利条件 FAQ，SRC-398 LTR 条件 FAQ。 | Stamp 5 获批后执行 PD-117；LTR 获批后用历年 90 日的一般读法及理由。是否应应用于初次申领、跨年边界、例外认定 `UNKNOWN`，不把获批维持条件前移。 | 明确初次计时与年度边界的指引。 |
| PD-335 | LTR 特殊就业许可、Stamp 4 由 GEP/Hosting/Multi-Site 转来、旧 CSEP 流程、家属 Stamp 3/1G 及费。SRC-398 Eligibility、重叠登记示例、Hosting、医生、家属及 LTR 续期 FAQ，SRC-387 Appendix C，SRC-384 在线续期。多段登记的零头遇到不同月长或闰日时没有统一折算口径。 | 首办登记去重后先累计整月，若零头折算跨过 60 个月门槛，C01／C07 为 `UNKNOWN`。续期核申请人当前主申请人或家属 LTR 许可的有效性和上一许可期证明。无法确认现有 LTR 时给 `UNKNOWN`，普通有效许可不足以通过。家属个案所需的证明以批准信和适用续期清单为准，无法确认时为 `UNKNOWN`。旧指导与当前工作 Stamp 的冲突、家属和续期 €500、需由 LTR 主管部门另行审批的递交日继续待确认。线上 IRP 续期窗口按 SRC-384。 | ISD 确认零头折算，并更新 LTR 许可、收费、家属材料及专门续期入口。 |
| PD-336 | EU/EEA/Swiss 的具体自由流动权基础、回流爱尔兰、双重国籍或仅为求职者。SRC-390 regs. 3、6、12，SRC-389 资格页。 | 合规活动有证据才计；非常规分支可识别但 `UNKNOWN`，不由于卡名就推定有权。 | 法律适用事实或 EU Treaty Rights 认定。 |
| PD-337 | EU 永久居留的 sufficient resources/CSI、非整月旅行和重要原因。SRC-390 regs. 2(3)、6、12(5)，SRC-391 说明。 | 无公开统一资金总额，不能据领取某一待遇、拥有一张保险卡或一次航程自动判；边界给 `UNKNOWN`。 | 保单、实际活动及适用机关认定。 |
| PD-338 | EU/WA 实体权利与卡片关系、无卡历史、先办 Retention、复杂 WA 关系。SRC-390 regs. 8–15，SRC-389 网页 §Permanent Residence Card，SRC-391 EUTR3，SRC-392 WA regs. 2–3、10–12，SRC-384 Stamp 4EUFAM 与 Withdrawal Agreement Beneficiary 的 Renewals 清单。 | 永久证件续期须确认已持有相应永久证件。普通卡、明确无效或材料明确缺项为 `NOT_MET`；类别或材料无法确认则为 `UNKNOWN`，均无递交日。卡已过期的递交资格见 PD-321。无卡历史、保留权或跨过渡关系不清时按个案给 `UNKNOWN`。WA 长期离境失权后，返爱居留的 WA 适用范围未确认时给 `UNKNOWN`；仅有 CTA 权利或失权前的确认不足以重新取得永久权。 | ISD 确认实体权利、返爱后适用范围与办理入口。 |
| PD-339 | EU 证书/永久卡未公开另收的申请费、WA 特殊收费、无明文历史费率。SRC-383 reg. 4，SRC-389、391、392。 | 指定登记豁免按明文；无当前官方书面收费明细的项目报价不上数，收到额外费用时 `UNKNOWN` 待确认。 | 当前费率表或门户/使领馆文书。 |

第三轮审核保留的接口风险见 [任务 89 报告](tasks/reports/89-ie-rules.md)。成年前后依亲升级的路径状态见 PD-329。爱尔兰页面仍使用时间评估入口，英国政策页遍历共用来源表而列出本任务的 28 个爱尔兰来源，留待页面接线时处理。

## 葡萄牙完整版（第 20 阶段，任务 92）

沿用 PD-140–149。SRC-481 FAQ 24 和 SRC-472 DR 9/2018 art. 2 补足 PD-148、PD-149 的原文归档。

| ID | 事项与官方现有依据 | 产品暂行输出 | 等待依据 |
|---|---|---|---|
| PD-380 | 新入籍语言／文化／历史／象征和公民知识的证书、CEFR、考试合并或分开、分数、等效旧证、特殊适配、考试费。SRC-120 art. 6(1)(c)–(d)、(10)；SRC-127 2026-10-29 公报第 2 项。旧制语言推定另需核对出生地与国籍（SRC-470 RNP art. 25(9)，公报 p42）。 | 仅已认可的新制证明才作为相应条件证据。旧考试依旧版登记。旧制仅缺出生地且可能适用推定时输出 `UNKNOWN`。 | 已刊国籍条例、细则、主管机关考试指南及证明推定所需的个案事实。 |
| PD-381 | 新庄严声明的格式、时点、签署、代理和线上办理；新增生物识别的启动。SRC-120 art. 6(1)(e)；SRC-127 2026-10-29 公报第 2 项。 | 愿声明与已完成声明分别问，未正式核验先 `UNKNOWN`。 | IRN 表格或新条例。 |
| PD-382 | 新旧刑事裁判映射、延期执行或消除记录、多个刑期如何处置；新法检察院可反驳推定在 art. 3 路线中的移用及外国证明例外。SRC-120 art. 3(4)、6(1)(f)、(11)、(14)–(16)；SRC-121 art. 6。 | 仅运算明定刑期边界及已知终局结论；境外定性和可反驳事项留 `UNKNOWN`。 | 新条例、检察机关／法院公开口径或个人正式决定。 |
| PD-383 | 新入籍生计金额、计算期间、资产或家属担保、福利、扣除方式。SRC-120 art. 6(1)(i)；SRC-127 公报第 2 项。 | 记录来源和证明，资格 `UNKNOWN`。 | 已刊国籍条例、实施指南。 |
| PD-384 | 无国籍资格依据、未成年代表手续和各证明获取，新旧过渡期间的程序性费用。SRC-120 art. 6(3)、(12)；SRC-470 RNP arts. 6、18、44。 | 经确认的专门自然化申请显示免程序费；国籍未知与无国籍分别处理。 | IRN 新流程、官方认定文件、RERN 后续更新。 |
| PD-385 | Portaria 1563/2007 的社保净额、岛屿基数、月数和非标准家庭／担保、不同许可收入证据。SRC-473 arts. 2、5、7–9、11；SRC-475；SRC-481 FAQ 12。 | 显示适用法律明说的因子和有明示的覆盖月数。个体扣缴、保人转移、自由提款资产及给付类型未核实 `UNKNOWN`；不把工作工资和稳定资源画成同一个字段。 | AIMA 明确基数、扣缴、可接受担保和按许可目的的统一计算。 |
| PD-386 | 住房非标准证明、无房东申明、亲友提供地址或临时住宿的可接受性。SRC-471 arts. 63、64、74；SRC-126 AIMA 清单。 | 收集占用方式及现有证据，未见官方接受给 `UNKNOWN`。 | AIMA 替代材料规则或认可决定。 |
| PD-387 | B、C 葡语等效证、C “quando aplicável”具体豁免，B 国外证书在 C 是否可用。SRC-123 arts. 80(1)(e)、126(1)(e)；SRC-126 B／C 清单。 | 已列有效证据可过，特殊申请另列举证待确认。 | AIMA 2026 指引或书面确认。 |
| PD-388 | B／E 缓刑、外国刑期、最近居住期及刑期累计和 art. 81(3) 一般拒绝的交互。SRC-123 arts. 78(2)(d)、80(1)(b)；SRC-491 art. 2。 | 单列刑期与国家数据库拒绝项；两条适用结果不同时 `UNKNOWN`，保留明确法定门槛。 | AIMA 法条适用口径、判决或原案决定。 |
| PD-389 | Blue Card 的多成员国连续期、高教期折半与各许可等价；申请前葡萄牙居留证据、家属特别规则。SRC-491 art. 2 改 art. 121-I；SRC-123 arts. 125–126。 | 显示确定的特别期限，混合段需要确认时禁止按五年全计，也不把仅在另一国持卡视为葡萄牙卡。 | AIMA 或成员国机关的期限及跨境证明说明。 |
| PD-390 | C、D 可接受的 SNS 覆盖证明、保单承保、是否覆盖全家和跨境保单。SRC-123 art. 126(1)(c)；SRC-471 art. 74(1)(d)；SRC-126、SRC-481。 | 录入保障起止及证明。仅有编号或保单说明不清给 `UNKNOWN`。 | AIMA／SNS 对材料的解释或收件决定。 |
| PD-391 | ARI 有效申根签证与合法免签、首次入境的定义及 90 天触发动作。SRC-123 art. 90-A(1)(b)–(c)；SRC-126 ARI。 | 显示法律和办件口径，免签及多次入境起点待确认。 | AIMA 对免签及起止事件的明确说明。 |
| PD-392 | ARI 外国刑事证明原籍及长期居住国范围，材料时效的递件／DUC 起点，家属首办的团聚渠道和资格及续期的停留、年龄、受扶养证据。SRC-123 Lei 18/2022 附件 art. 103(1)、(3)（p81）、Lei 61/2025 art. 2 修订 arts. 98–99、103(2)（pp4–6）；SRC-126 ARI `Reagrupamento Familiar`；SRC-481 FAQ 11、23–25。 | 依境内或境外渠道核对团聚递交资格。渠道无法判定、首次主案待批、仅有历史获批记录而当前许可有效性未知，或资料欠缺时输出 `UNKNOWN`。已知主案获批后许可失效，或主案被拒且无有效许可时为 `NOT_MET`。 | 确认家属递交渠道、主案决定与当前许可状态，或取得 AIMA 阶段清单及个案认可材料。 |
| PD-393 | ARI 低密度统计期／地理单位；企业岗位维持的 3 年起点、职位属性、换工及资金转移的经济实质。SRC-123 Lei 56/2023 art. 44；SRC-471 arts. 65-A、65-D/E；SRC-490。 | 未确认折减以原门槛展示情景，岗位及其地域资格 `UNKNOWN`。 | 投资相关主管部门的书面认定。 |
| PD-394 | 旧 ARI 转创业居留的已废止交叉引用、获发投资类永久许可后何时可出售以及换项目。SRC-123 Lei 56/2023 arts. 42–43；SRC-471 art. 5(5)–(8)；SRC-486 art. 3；SRC-471 art. 65-K；SRC-481 FAQ 26–29。 | 旧路径、改投或出售后按主管机关的具体批件和有效许可判定；不从最短持有期推导。 | 歧义修法、AIMA 明确口径或个案批复。 |
| PD-395 | 普通临时居留各子类的目的维持、跨用途变更、旧许可和担保方式。SRC-123 art. 78；SRC-471 art. 63；SRC-473 arts. 5、7、12。 | 请求法律类别及其特定证据。只满足通用项时，该子类资格仍待确认。 | 相应许可法条及 AIMA 现行续期资料。 |
| PD-396 | 自由流动权的提前取得证据、无卡证明、Andorra 单独适用法源、派生居留权起点及家属合资格居留重叠的证明和普通缺席的月／天换算。其他亲属依 art. 3(2)–(3) 需个案审查。第三国家属永久权在连续离境超过两年且未超过 30 个月时，art. 10(5) 与 art. 17(4) 的效果不同。SRC-478 arts. 3、8–13、17(4)、21（缺席见 pp5719、5721）；SRC-484 永久证书与家属卡材料段；SRC-493 §§36–38、47；SRC-494 §§2.2.2.1、2.2.2.3–2.2.2.4、9.2。 | 除获认可的必要兵役外，先按居留周年累计离境。需要例外时，核对一次正当离境能否适用豁免。其他亲属缺个案准许、派生起点或受扶养事实不足以确定家属资格、合资格居留重叠未确认、同一居留年度的普通缺席累计取决于月／天换算或豁免资格时，相关检查输出 `UNKNOWN`。第三国家属触及取得后缺席重叠期时，维持条件输出 `UNKNOWN`。 | AIMA 对个案的证据认定、art. 10(5)／17(4) 的适用，以及提前取得、安道尔和认定期间的说明。 |
| PD-397 | 自由流动阶段资源参考点、各原籍国医保互惠，以及退休、永久失能停工和转至另一成员国工作时的资格证据。SRC-478 arts. 2(f)、7、10(4)、11(1)–(6)（pp5719–5720）；SRC-494 §9.2（pp45–46）；SRC-495 §§38–39、44。 | 资源与保障按填报证据处理。提前取得按退休日、永久失能停工日或在另一成员国开始工作日，核对当时适用的工作、居留年限及连续性。依 art. 11(4) 核对伴侣豁免，依 art. 11(6) 核对永久失能的工伤或职业病待遇豁免。离境换算及例外证据沿用 PD-396。触发日、视同就业和跨境计入期是否合资格、或其他必要证据不足且无法确认资格时输出 `UNKNOWN`。 | 对应年度适用社会福利和退休依据、医保互惠及主管机关对提前取得证据的认定。 |
| PD-398 | 自由流动费表正好 25 岁的字面空档、各 AIMA 现场与数字渠道落栏、CPLP 相关具体豁免及 ARI 永居收费组合。SRC-476 III、VI、XIV 及豁免段，SRC-479 art. 2。 | 按费目展示两栏；不能确认实际渠道／配套费或豁免时以 DUC 为准，金额 `UNKNOWN`。 | 费表勘误、新费表、AIMA 渠道收费及豁免说明。 |
| PD-399 | 伴侣后取得葡籍时关系年限起点、跨国婚姻登记或事实伴侣法院认可和新法对实际联系、异议的证明。SRC-120 arts. 3、9–10；SRC-470 arts. 14、56；SRC-483。 | 问伴侣取得国籍日期、法院和婚姻来源、共同子女，边界或未公开程序 `UNKNOWN`。 | 新国籍条例、IRN 或葡萄牙司法解释。 |

## 新西兰完整版（第 20 阶段，任务 84）

下表采用 2026-11-23 的档案。各项均无官方确定的解决日期。欠缺个人资料只需补答，机关个案决定以书面结果为准。预估费用、获批后的义务和购房资格分别标明适用阶段。

| 编号 | 条文与尚待明确的事项 | 引擎处理 |
|---|---|---|
| PD-220 | R2.1(b)、R2.1.10–35、R2.1.45–50、R2.40、R2.40.1、RV1.10（SRC-230），E4.1（含 E4.1.15）、E4.50、BD3.1（SRC-251）。须核对所在地及失效日、实际递交时应缴费是否已付或已作认可安排、每名随行人的关系和适用依赖资料、未满 16 岁随行子女的迁居权或同意证明、每份证书的类型及日期。 | 漏答适用事实为 UNKNOWN。空名单仅确认无人随行。普通居民类别递交须另答是否漏列已持有或正在申请关系类临时签证的伴侣或受抚养子女（SRC-230 R2.40(d)、条例第 20(2A) 条）。明确漏列为 NOT_MET，未答为 UNKNOWN。明确未支付应缴费、关系不符或未满足适用年龄或依赖条件为 NOT_MET。 居民类递交逐人核对所在地、现持签证和法定限制（SRC-071 s71(1)(a)–(c)、(3A)–(5)，SRC-230 RA5(a)–(b)、R2.40.2）。境外为赴新定居递交可无新西兰签证。境内需有合资格的临时签证或居民签证，并核清 s150。持 Interim、Limited、Transit Visa、负有驱逐责任或曾按 s75A 被取消居民签证，普通递交为 NOT_MET。管制区的 RV4 单人申请还须确认适用免签。影响结果的签证类别、所在地、法定限制或免签资格未核清时为 UNKNOWN。境内递交绿名单 Tier 2、护理或运输行业转居留时，签证只填“其他”或漏填，共用递交资格与行业持签条件均为 UNKNOWN（SRC-237 SR5.5(b)(i)，SRC-238 SR6.5(b)(i)、SR7.5(b)(i)）。 |
| PD-221 | RV3.15 未明确将 Active Investor Plus 纳入旧投资类别的旅行延期。RV3.20、RV4.1–20 的特别期限、历史资格和例外须有证据（SRC-230）。 | 遇适用范围或获准期限不明时保留 UNKNOWN；失效后的获签依再次申请结果。 |
| PD-222 | RV1.20、RV2.5.20、RV2.10（SRC-072）、RV1.25（SRC-230）、IRD 税务居民证明（SRC-247）。生活基地的随行家属条文没有单身例示，独立申请、投资条件解除及税务证据均与个案有关。 | 明确原申请无随行者时按空名单处理；家庭情况、税务证明、投资条件或独立申请资格未明时保留 UNKNOWN。同表伴侣与每名子女按本人原申请角色评估。独立获签者须核对本人记录；确认属于 RV1.20(a)(ii) 的投资者子女按随同者评估。候选递交日重查全家纳入资格及每人的永居条件。原申请角色、适用依赖或共同递交日未能确认时保留 UNKNOWN、日期留空；届时已有子女超龄或已过失效宽限则为 NOT_MET。 获签与离境同日时，须核实获签时所在地或实际首次凭居民签获准入境的日期。先离境再获签从实际首入日起算。仅有日历日期无法辨明先后时，首入条件为 UNKNOWN，永居预测日期留空（SRC-072 R5.66.5(b)、RV2.5(b)）。当前位置在境外或未填时，仅凭获签前曾抵新和一张空的已返程行程表，无法排除获签时已在境外。返新与获签同日且顺序未明时，可填实际首次凭该居民签获准入境的日期确认首入。缺少决定性资料时首入为 UNKNOWN，初始旅行路径不给最早日期。确认错过首入期限时，多次往返条件从未生效，即使后来凭其他签证抵新也为 NOT_MET（SRC-072 R5.66.1(a)、(c)，R5.66.5(b)–(c)）。 |
| PD-223 | Citizenship Act s8–9A（SRC-070、SRC-231 的能力、品格、在境、语言与意图章节）、DIA 儿童与品格说明（SRC-232）。批准日跨年龄档、近期违章或家暴、英语沟通能力、特殊在境及困难豁免均无统一分数或等待期。 | 按批准日核实年龄；待裁量、缺乏适用的警方证明、能力或跨龄资料时保留 UNKNOWN。 |
| PD-224 | DIA Citizenship test（SRC-232）、DIA 收费 CRIS（SRC-234）。拟于 2027 年底引入考试，正式开始日、收费、部分年龄边界、考点和学习资料有待最终公告。 | 模拟进入档案约定的监测期时标出 UNKNOWN；监测期起点仅用于提示。 |
| PD-225 | MBIE Stage 2 CRIS Annex 6 是历史提案（SRC-233）。INZ 1028《Fees Guide》2026 年 5 月版 pp1、3（SRC-249）分列申请费及移民征费。按 Band A/C 且无豁免合计，AIP 为 NZ$27,470，BI 工签为 NZ$12,380，BI 居民签为 NZ$14,890。Band B、豁免及汇率可改变实付金额。入籍费用另见 DIA（SRC-234）。 | 预算单列。依实际费区、国籍、适用豁免及递交时的费表核对。应缴费的实付或认可付款安排由递交条件核对。 |
| PD-226 | SR3.10.5、附录 21–23（SRC-236），SR5.15.1、附录 13（SRC-237），SR6.15、SR7.15（SRC-238）。工资修订日、护理协议未来调整、职业表变动、职业逐项资质、旧制邀请及历史期间的工资证明需核实。 | 使用适用日期和相应表格，按档案基准推算未来时声明假设。旧制或缺少适用证据时保留 UNKNOWN。 |
| PD-227 | F2.15.1 采用 2026-09-25 版，成年前的证据依该版处理（SRC-242）。父母 EOI 流程采用 2026-10-27 版 F4.5（SRC-243）。F2.30.1、F2.40、F4.25、F4.35 另有分居、此前遗漏、英语及担保收入期末规则。 | 此规则集以 2026-11-23 为基准，更早模拟日仍使用上述两版，不能据此判断当时的历史资格。分居或证据待认可、EOI 待邀请及收入资料不足时为 UNKNOWN。 |
| PD-228 | BN6.5、BN8、BN9（SRC-244），BD2、BI2、BI4（SRC-245）。外汇管制地资金跨境安排须由 INZ 核实；档案缺 BD2.5、BD2.10、BD9 中的完整行业、目标企业准入和清偿力细则。 | 未确认的合法转汇、投资分类、目标企业准入、资产和持续经营资料保留 UNKNOWN。新获批与投资期检查分开。 |
| PD-229 | RW5、RW7.5(h)、RW7.10（SRC-246）。旧法引文与现行福利项目的对应关系、特定资助或税收抵免是否构成 welfare assistance，以及部分背景英语、担保资格由机关认定。 | 已知违反条文按实际情况判断；仅报税收抵免、给付性质不明或证明待决定时保留 UNKNOWN。 |
| PD-230 | A4.10、A4.20(b)(ii)、(f)、A4.60(a)–(d)、A4.70（SRC-239），R5.96（SRC-242）。普通 F2 申请使用限定体检表，R5.96 情形使用普通表。签证官可决定采纳普通表上相当于限定表的内容。强制医疗豁免取决于其余 F2 条件。 | 对应表型或旧表复用所需资料漏答为 UNKNOWN。只提交普通表不能自动满足限定表要求。已转交签证官决定时为 UNKNOWN。尚无已批豁免、其余 F2 条件待核或不满足时，医疗豁免条件保留 UNKNOWN。 |
| PD-231 | A5.20、A5.25、A5.30、A5.35、R5.100（SRC-240）。安全审查触发标准与周期未公开，品格豁免、制裁和未决案件须分别确认。 | 未决的许可、豁免或调查为 UNKNOWN。以每位家庭成员申报的、可依法披露的记录核对。 |
| PD-232 | SR2.10.1、SR2.10.10（SRC-241）、F4.25（SRC-243）、RW5.1（SRC-246）。官员可要求背景免考者另交考试成绩；非标准背景证明的认可没有统一门槛。 | 已有明确补考要求时按该要求处理。未经认可或资料不足的证明为 UNKNOWN。 |
| PD-233 | 财政部政策分析（SRC-248）后的修法于 2026-03-06 生效。LINZ 2026-03-26 版投资者购房指引 pp1–2（SRC-250）列明 AIP、Investor 1/2 及由其取得 PRV 者可就一处符合条件的住宅申请许可。详细指引要求合资格购买价或购买加建造成本超过 NZ$5,000,000。 | 成交前须取得 LINZ 许可。标的、金额及个人许可须个案核实，购房提示不参与 AIP 居民签资格或日期。 |
| PD-234 | SRC-252 R5.125(a)–(c) 自 2026-11-12 生效。须核对任一申请人的亲生或收养受抚养子女是否在新西兰非法居留，包括未随行者。未满 16 岁时，须证明申请人无权将子女迁出监护或探视权授予国，未授予这些权利时核对居住国。 | 子女资料待核且影响结论时为 UNKNOWN；空名单确认所有申请人都没有此类子女。RV2、RV4 获豁免。R5.125(c)(iii) 适用于 R2.40.2 规定的管制区居民签申请，澳籍或澳永居人士的到埠居民签见 SRC-252 R5.30.1。所选常规居民类别仍须检查这些子女。Tier 1 依 SRC-237 SR4.5(c) 使用指定在线表格，申报在管制区递交该类别时，递交条件为 NOT_MET。 |
