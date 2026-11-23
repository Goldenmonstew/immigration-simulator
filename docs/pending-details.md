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
| PD-115 | 配偶路径在北爱尔兰的居住与出行 | s15A 按"爱尔兰岛"计居住，ISD 写"lived legally on the island of Ireland"；s15C(2)–(3) 按不在爱尔兰岛的日子计缺席。北爱尔兰的居住须满足什么条件、怎样证明没有写。 | SRC-091 s15A(1)(e)–(f)、s15C(2)–(3)、s16A(1)；SRC-095 Guide `Reckonable Residence for Spouses/Civil Partners` | 不输出 `UNKNOWN`。许可类型可选"在北爱尔兰合法居住"，只计入配偶路径（review68-1）。出境记录覆盖整段北爱尔兰居住的，视为岛内搬迁，这段时间不算缺席（review68-2）；住在北爱尔兰期间离开爱尔兰岛的出行照常算缺席（review68-3）；只是去北爱尔兰的短途行程也按缺席计（较严）。录入北爱尔兰居住的日子，重叠的爱尔兰许可不再算在国家居住，一般入籍与 Stamp 5 不计（review68-4）；家庭团聚配偶转 Stamp 4 的 5 年与 Stamp 4 升级的递交当天同样不计（任务 72）。结果声明此假设。 | 原文未提及 |
| PD-116 | Stamp 4 升级"满 21／57 个月"的边界 | ISD 只写"Upon completion of 21 months from commencement of employment … on the basis of"该许可，没说从月末起算到较短月份时在哪天届满；许可中断或换雇主后是否重新起算、两类"not interchangeable"的方向也没写。 | SRC-096 `Information on Stamp 4 upgrades`；SRC-094 s18(h)、附表"month" | 按日历月、开始受雇当天算第一天，只计持该许可（Stamp 1 或 1H，57 个月一类含 ICT）的日子；从填写的开始日到转为 Stamp 1 之前，凭其他合法许可（如毕业生 1G）的日子也计入，递交当天须持该许可（review68-2）。开始工作后许可有空档的，确定日期从空档后重新起算；空档前后的持有天数累加达到对应日历月天数的日期另列，仅此可达时输出 `UNKNOWN`（review68-1）。对应日不存在时，当月最后一天输出 `UNKNOWN`，次月 1 日起算满足。两类不可互换：表单把 Stamp 1 分为 CSEP 一类（CSEP、研究员、NCHD 医生）、GEP 与其他 Stamp 1（经营、打工度假等），21 个月只计 CSEP 一类、57 个月只计 GEP 与 ICT（review72-1），另一类的时间在两条路线上都不计，也不算转 Stamp 1 之前的"其他许可"（任务 72）；同一类内换雇主不计算，结果声明此假设。存档来源中 57 个月规则对 GEP 最早见于 ISD 2024-04-03 通告，对 ICT 只能确认到升级页现行文本的修改日 2026-02-25（dateModified；2024 年通告只列 GEP，datePublished 2025-07-22 不能证明当时已列 ICT，review72-1）；此前的规则未收录：早于该日满 57 个月的输出 `UNKNOWN`，摘要称该日为"按 57 个月规则满足的最早日期"（review68-5、任务 72）。 | 原文未提及 |
| PD-117 | Stamp 5 的"每年缺席不超过 4 个月" | ISD 在 Stamp 5 获批后的许可条件里写"does not exceed more than 4 months in a year"；申请资格只要求 96 个月合法居留，申请前的出境是否减少这 96 个月没写。 | SRC-097 `Eligibility`、FAQ `What are the conditions attached to my Stamp 5 permission` | 不输出 `UNKNOWN`。4 个月上限只作获批后的条件提示，不用于申请日期（review68-1）；申请前的出境不扣除，结果声明此假设。 | 原文未提及 |
| PD-118 | Stamp 1G 满 5 年与 Stamp 5 的 96 个月是否须连续 | ISD 只写"after 5 years on a Stamp 1G""completed 8 years (96 months) legal residency"，许可之间有空档时能否累加没写（长期居留页说空档不计，但没说是否重新起算）。 | SRC-096 Stamp 1G；SRC-097 `Introduction` | 连续持有达到年限的日期为确定日期；空档前后累加达到年限、递交当天仍持有的日期另列，仅此可达时输出 `UNKNOWN`（review68-1）。Stamp 1G 的 5 年只计 1G 时间：2024-05-15 起 GEP、ICT 持有人的配偶伴侣改发 1G，ISD 家庭团聚 FAQ 第 30 问写的是"5 years or more in Ireland on a family reunification permission"、满期后在下一次网上续期时申请；2024 年通告写明这些配偶伴侣的家庭团聚许可原为 Stamp 3，因此表单单列"家庭团聚的 Stamp 3"，与配偶伴侣类 1G 一起计入 5 年，其他原因的 Stamp 3 不计（任务 72）。 | 原文未提及 |
| PD-119 | 2026 年入籍修法草案 | General Scheme 拟把一般入籍改为 2 年连续居住加此前 10 年内累计 6 年，配偶改为婚姻 5 年、2 年连续加此前 5 年内累计 3 年，并扩大 s16A；仍在立法前审查，最终文本、生效日与过渡安排未定，也没有修改 s15C 的"one year's continuous residence"。 | SRC-098 Head 5、Head 6、Head 9 | 不进入计算。入籍与配偶入籍的摘要提示草案年限并注明按现行法；草案成为法律后须重新调研 s15、15A、15C、16A 与过渡条款。 | 立法进程未定 |

## 二十三、日本试点（第 19 阶段，任务 70）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-130 | "引き続き N 年"从哪天起算、满期取周年当日还是次日；递交日须在日本 | 入管法、国籍法与两版永住指南都没有计日规则；民法第140条初日不算入、第143条按历计算，严格读法下满期在周年当日终了，即次日才满 N 年；入管厅、法务局实际怎么数没有公开。帰化须本人亲自到法务局递交；永住申请是在日外国人的在留资格变更，原则上本人递交，取次者代为递交时本人是否须在日本，手续页只在在留期间更新处写明。 | SRC-112 民法第140、143条；SRC-113；SRC-114；SRC-117 Q10；SRC-119 申請提出者；SRC-110 第22条第1項 | 不输出 `UNKNOWN`。从填写的起算日（上陆日、资格取得日、结婚日等）起按周年计，周年当天算满足（2 月 29 日起算的取 3 月 1 日），结果声明可能晚一天；搜索上限同样按周年。年龄按年齢計算ニ関スル法律，生日当天满岁。在日本出生取得在留资格的"30 日以内"按初日不算入，到出生后第 30 天为止（SRC-110 第22条の2第2項、SRC-119 申請期間）；交叉核对：东广岛市外国人住民页面（二手，未存档，https://www.city.higashihiroshima.lg.jp/jpn/3/40144.html ）按含出生日计，3 月 1 日出生须在 3 月 30 日前，比试点早一天，试点保留现读法。期限落在行政机关休日（周六、周日、国民の祝日、12-29 至 01-03）的顺延到其后第一个开放日（SRC-112 行政機関の休日に関する法律第1、2条）；国民の祝日按国立天文台暦要項收录 2022–2027 年；之后的年份按祝日法第2、3条推算，春分日、秋分日只有国立天文台的计算预测，结果取决于它们时输出 `UNKNOWN`；2021 年及以前未收录，期限落在工作日、模拟日又在其后的输出 `UNKNOWN`。满足年限的日期与递交日分开：落在行政机关休日的，结果另给窗口最早可递交的平日（SRC-119 受付時間；永住不在网上申请范围内）。整天在境外的日子（出境日与返回日之间）不作为递交日，模拟日在境外时检查项标不满足。 | 原文未提及 |
| PD-131 | 2027-04-01 起永住指南出境标准的计法 | 指南写申请时起过去 10 年内，无合理理由"一回の出国で半年以上不在"或"通算して２年６月以上不在"的原则上消极评价；没有说半年、2 年 6 个月是历月还是天数、出入境当天算不算不在、开始于 10 年之前的长行程怎样算；"合理的な理由"按个案判断。 | SRC-114 第2の5(6)（p7）；SRC-115 第48号（p5） | 窗口为递交日前 10 年，出入境当天按在日本计。单次：6 个历月是 181–184 天，境外整天 184 天以上且整段在窗口内的算达到，连出入境当天也不满 181 天的算未达到，其间与开始于窗口之前的长行程待确认；合计：连出入境当天也少于 911 天算未达到 30 个月，境外整天 915 天以上算达到，其间待确认。模拟日仍在境外的行程只算到模拟日。达到或可能达到的不作为最早日期，结果输出 `UNKNOWN` 并给出候选日。 | 原文未提及 |
| PD-132 | 截至 2027-03-31（含当日）递交的永住申请怎样看出境 | 2026-02-24 版指南只写"原則として引き続き１０年以上本邦に在留"，没有出境天数标准；网上流传的天数都是实务说法。 | SRC-113 1(3)ア、2 | 计入的在留年限内有出境的，输出 `UNKNOWN` 并给出候选日；有再入国许可失效的按 PD-136 重新起算。 | 原文未提及 |
| PD-133 | 新版出境标准是否适用于 10 年特例 | 出境标准写在第2の5(6)"これらの期間"（10 年、5 年）之下；第3 的配偶者、实子等、定住者、难民、高度人才特例没有提到。 | SRC-114 第2の5(6)、第3 | 特例路径同样按 PD-131 计算，达到或可能达到的输出 `UNKNOWN`，检查项标待确认。 | 原文未提及 |
| PD-134 | 哪些在留资格算"就労資格又は居住資格"、哪些期间计入 10 年 | 两版都没有定义"居住資格"；新版注2 把技能実習、育成就労、特定技能1号、企業内転勤与部分特定活動排除在就労资格外；第5の1 规定特例性、临时性的特定活動（继续就职活动、就职内定者、难民认定等手续中等）不计入"10 年"，但没有说这些期间前后的在留能否接续；旧版没有这一条；留学、家族滞在等是否计入 10 年也没写。 | SRC-113 1(3)ア；SRC-114 第2の5(6) 注2、第5の1（p12） | 一般路径由用户填写连续持就労或居住资格的开始日，也可勾选目前还没有旧版认可的资格（如只持过特定技能1号，截至 2027-03-31 的候选日不满足）；并必须选择新版范围（不含企業内転勤等）下的起点：与前者相同、另填日期，或目前持有的资格新版不认可；2027-04-01 起的候选日按所选起点计 5 年，选"不认可"的这些候选日都不满足（摘要说明，SRC-114 注2）；并逐段填写不计入 10 年的期间。新版下按这些期间之后重新起算的日期为确定日期，只扣除这些天数的日期输出 `UNKNOWN`；旧版下按其后重新起算为确定日期，把这些期间计入的日期输出 `UNKNOWN`。 | 原文未提及 |
| PD-135 | 配偶者特例的"实体婚姻生活"从哪天起算 | 永住指南写"実体を伴った婚姻生活が３年（新版５年）以上継続"，没有说以登记日还是同居日起算、在国外的婚姻期间是否计入；国籍法第7条后段明确写"婚姻の日"。 | SRC-113 2(1)；SRC-114 第3の1（p9）；SRC-111 第7条 | 不输出 `UNKNOWN`。永住按用户填写的"开始实际婚姻生活的日期"，帰化按单独填写的结婚登记日；表单提示两者不同时填较晚的一个结果更保守。 | 原文未提及 |
| PD-136 | 再入国许可失效与连续在留 | みなし再入国许可自出国日起 1 年，在留期限更早的到在留期限为止；在留期限内申请更新或变更、届满时尚未处分的，可在留至处分或届满后 2 个月，みなし再入国也须在届满后 2 个月与出国后 1 年中较早者之前返回（Q61）；普通再入国许可也不超过现有在留期间；未在期限内返回的，在留资格消灭；官方把这种情形称为"在留が途切れた"，但没有写返回后从哪天重新起算。普通再入国许可的期限以许可上的记载为准（最长 5 年，在外延长合计不超过 6 年）。 | SRC-110 第20条第6項、第26条、第26条の2；SRC-116（含 Q&A Q61） | 不输出 `UNKNOWN`。返回日晚于用户填写的出境时在留期限的（勾选"更新申请中"的为期限届满后 2 个月，假设结果为许可），或没有勾选持再入国许可、且返回日晚于出国日 1 年后同一天的，视为在留资格消灭，连续在留从返回日重新起算；没填在留期限的假设它没有先到期，勾选的视为在许可有效期内返回；表单允许更新申请中的出境日晚于原在留期限、但不晚于届满后 2 个月。特別永住者（2 年）与新冠特例不涵盖。 | 原文未提及 |
| PD-137 | 帰化"原则在留 10 年"运用的范围 | 2026-04-01 起"帰化の審査において"原则要求在留 10 年以上，以满足国籍法 5 年住所条件为前提；没有说是否适用于第6–8条的简易帰化（含日本人配偶者）、10 年怎样计、有无资格类型要求、此前递交而届时尚未审结的申请是否适用；判断基准不予公开。 | SRC-117 Q9；SRC-118 | 一般帰化 2026-04-01 起递交的按 10 年计最早日期，摘要另列只按国籍法的日期；此前递交、只满足国籍法的日期与日本人配偶者只满足第7条的日期输出 `UNKNOWN`，摘要给出按国籍法与按 10 年的两个日期。 | 原文未提及 |
| PD-138 | 帰化"引き続き"允许多少出境 | 国籍法第5、7条只写"引き続き"，国籍Q&A、リーフレット与政府答辩都没有出境天数。 | SRC-111 第5条、第7条；SRC-117；SRC-118 | 前 10 年（10 年运用的年限）内有出境的输出 `UNKNOWN`，日本人配偶者同样；摘要给出候选日与出境次数、天数，相应的住所、第7条与 10 年检查项标待确认，摘要不写"已满足"；摘要里"若适用 10 年运用"的日期在 10 年内仍有出境时同样写作候选日。 | 原文未提及 |
| PD-139 | 帰化的"住所""居所"与在留开始日 | 国籍法第5条要求住所，第7条前段为住所或居所；国籍Q&A 说住所须合法、持正当在留资格；没有说明住所从上陆日还是其他日子起算。 | SRC-111 第5条、第7条；SRC-117 Q9 | 不输出 `UNKNOWN`。住所、居所与在留都从用户填写的本次在留开始日起算，不作区分，结果声明此假设。 | 原文未提及 |

## 二十四、德国试点（第 19 阶段，任务 69）

| ID | 事项 | 原文怎么说 | 出处 | 对引擎的影响 | 预计何时明确 |
|---|---|---|---|---|---|
| PD-120 | 持有年限、出境期限的起止日与判定时点 | 法条只写"持有满 N 年""6 个月内返回"；行政程序期限准用 BGB §§ 187–193，但居留年限是否属于这种期限、起点当天计不计（会差 1 天）没有说明。定居许可、入籍以批准或入籍日为准，欧盟长期居留以申请日为准；能否提前递交没写。 | SRC-102 BGB §§ 187、188、VwVfG § 31；SRC-108 Nr. 9a.2.1.1.1、51.1.6.6；SRC-106 Nr. 10.1.0 Rdn. 1 | 不输出 `UNKNOWN`。年限从许可生效日（在首次入境前生效的，从首次入境日）起算、到周年日（或月份对应日）满足，即起点当天计入；没有对应日的（如从 2 月 29 日、月末起算），从下月 1 日起满足；出入境当天按在德国计；出境期限到对应日当天返回仍算按时。结果声明"若起点当天不计入，晚 1 天"，并以最早满足日作为结果。这些都是试点约定（review69-1 风险项）。 | 原文未提及 |
| PD-121 | 折半与非连续期间怎么换算 | § 9 Abs. 4 Nr. 3、§ 9b Abs. 1 Nr. 4 只说学习期间"折半"；旧定居最多折算 4 年、入籍旧居住最多 3 年、§ 12b 过半规则都没有换算成天数。BGB § 191 规定不必连续计算的年按 365 天。 | SRC-100 § 9 Abs. 4、§ 9b Abs. 1；SRC-101 § 12b；SRC-102 BGB § 191 | 不输出 `UNKNOWN`。按半天精确折算：许可期间每天记 2 个半天、学习每天记 1 个，合计须达所需年限日历天数的 2 倍；4 年、3 年上限与"所需年限的一半"按每年 365 天计。 | 原文未提及 |
| PD-122 | 各类许可的计入与排除范围 | § 26 Abs. 3 明文准用 § 9 Abs. 4，§ 18c、§ 28 Abs. 2 没有引用；§ 16b Abs. 4 Satz 2 学习期间不适用 § 9，§ 16a Abs. 1 Satz 3 企业内培训期间也不适用（此前持 § 18a、§ 18b 的除外），学校职业培训（Abs. 2）没有这句，§ 16d、§ 16f、§ 20a 等也排除 § 9；第 5 节（人道）许可的定居许可另由 § 26 Abs. 3、Abs. 4 规定（联邦行政法院 BVerwG 1 C 16.24 Rn. 11–12 认为不再适用 § 9，判决未存档，只作交叉核对）；§ 9a Abs. 3 Nr. 1 排除第 5 节许可（国际保护除外），Nr. 5 的临时目的只列"insbesondere"几例；入籍时不能持有的许可见 StAG § 10 Abs. 1 Satz 1 Nr. 2 的清单（含 § 25 Abs. 3–5、§ 20，不含 § 25a、§ 25b），几份清单不一致。 | SRC-100 §§ 9a、9b、16a、16b、18c、26 Abs. 3–4、28 Abs. 2；SRC-101 § 10 Abs. 1 Satz 1 Nr. 2；SRC-108 Nr. 9.4 | 技术工人、欧盟蓝卡、德国人家属路径不计学习期间，每次出境按 § 9 Abs. 4 Nr. 2 类推最多计 6 个月（偏保守）。持学习许可时一般定居许可不满足；持职业培训许可（此前没有技术工人许可）或临时目的许可、只在这类许可下才满足的输出 `UNKNOWN`。模拟日持第 5 节许可（庇护、难民、辅助保护、其他人道）的，一般定居路径输出 `NOT_APPLICABLE`（review69-4）。持临时目的或其他人道许可的，欧盟长期居留不能申请（临时目的期间也不计）；其他人道许可（如 § 24 临时保护）的期间能否计入欧盟长期居留的 5 年，§ 9a Abs. 3 Nr. 1、§ 9b Abs. 1 都没写（指令 2003/109 Art. 3(2)(b) 把临时保护排除在适用范围外，只作交叉核对），确定日期不计、计入后的日期在摘要另列，只有计入才满足时输出 `UNKNOWN`（review69-6）；入籍只在这两类许可下才满足的输出 `UNKNOWN`。 | 原文未提及 |
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
| PD-143 | 新旧法分界当天与更早的在审申请 | LO 1/2026 公布次日（2026-05-19）施行，施行时在审的程序适用旧文本；恰在 2026-05-19 当天递交的属于哪一边没有明文。DRE 修改记录把它注为"自 5 月 18 日起生效"，与公报第 8 条不一致。旧文本（LO 1/2024）自 2024-04-01 施行（第 9 条），宪法法院也按这一日期说明"自申请居留之日起算"的适用范围。 | SRC-120 LO 第 7 条 n.º 2、第 8 条（p7）；SRC-121 LO 1/2024 第 9 条（p5）；SRC-122 D.5；SRC-127 司法部新闻 | 2024-04-01 至 2026-05-18 递交、施行时在审的按旧文本判断递交日当时的条件；2024-04-01 前递交的适用更早的文本，试点没有建模，输出 `UNKNOWN`；2026-05-19 当天递交的输出 `UNKNOWN`；网页不接受勾选"在审"却填写 2026-05-19 之后或模拟日之后的递交日。 | 原文未提及 |
| PD-144 | 缺席对入籍年限的影响 | 国籍法没有缺席天数上限；合法居留的定义写"身在此地、身份合法"的人，没有量化。 | SRC-120 art. 15 n.º 1（p14） | 计入的居留日（含递交当天，离境日与返回日按在葡萄牙计）里有出境的，入籍输出 `UNKNOWN`，模拟日的检查项同为待确认，摘要给出不计出境时的候选日期与出境次数、天数；完全落在未计入的空档里的出境不算。 | 新国籍条例公布时可能规定，原文未提及 |
| PD-145 | 居留卡到期后的 6 个月与许可之间的空档 | AIMA 说明临时居留卡到期后 6 个月内居留权仍然保留（依据条例 art. 63 n.º 14；2025-06-30 前到期的卡另延至 2026-04-15）；art. 80 写"持临时居留许可满 5 年"，没说到期后这段时间或续期空档算不算持有、算不算入籍与欧盟长期居民的合法居留。永久居留许可与欧盟长期居民身份本身没有期限，证件定期换发（art. 76 n.º 1–2、art. 130 n.º 2）。 | SRC-126 Direito de Residência；SRC-125 DR 84/2007 art. 63 n.º 14；SRC-123 art. 76 n.º 1–2、80 n.º 1 a)（p65、p67） | 永久居留卡与欧盟长期居民卡的到期日不影响身份，已持有的各自显示"已持有"。临时居留卡（含黄金签证、学习）到期后 6 个月内的期间不作为满足条件的依据；学习许可到期后的这段时间只保持连续，不算递交欧盟长期居民申请时持有的许可（art. 125 n.º 2 a）；其他许可到期后的这段时间，一旦有更新的许可生效即由新许可取代，不再作为申请时持有的许可；这段时间只填补没有任何有效许可的日子，有许可的日子按当天实际持有的许可计（如学习期间仍按一半计），计入后的日期在摘要另列；只有计入才够的（包括模拟日只在这种读法下满足）输出 `UNKNOWN`。超过 6 个月的空档即重新起算；2025-06-30 前到期的特别延长没有建模。 | 原文未提及 |
| PD-146 | 临时、永久居留的缺席注销怎么计 | 无正当理由出境达到连续 6 个月或累计 8 个月（临时）、连续 24 个月或 3 年内累计 30 个月（永久）的，许可"可以"被注销；月数没有换算成天数，也没说出入境当天；条款保留"特别规定"，黄金签证的最低停留是否排除它不明。 | SRC-123 art. 85 n.º 2、4（p69）；SRC-124 art. 65-C | 只作风险提示，不改变任何日期或状态。已持欧盟长期居民身份的丧失检查（art. 131 n.º 1 c、e）只看模拟日以前的出境，计划中的出境只在摘要里预告。按每张许可的有效期分开计，跨续期的出境只算落在该许可内的部分；单次按离境日起的日历月判断；累计按天数，介于最少与最多天数之间的提示待确认；黄金签证许可超出时也只标待确认；出入境当天按在葡萄牙计。 | 原文未提及 |
| PD-147 | 欧盟长期居民的折半与缺席换算 | 学习、无薪实习、志愿期间按一半计入 5 年，没说怎样折算与取整；缺席单次少于 6 个连续月、合计不超过 10 个月，没有换算成天数。 | SRC-123 art. 126 n.º 3–4（p101） | 学习等期间按半天精确折算：不间断许可期间内其他许可每天记 2 个半天、学习每天记 1 个，合计达到窗口天数的 2 倍即满足，不输出 `UNKNOWN`；折算后的期间超过 5 年时出境上限按整段期间检查。出境只算到递交日前一天，递交时仍在外的出境按已出境的时间判断，计划中的出境会在以后达到 6 个月的在摘要里预告。合计出境不超过 10 个月可能的最少天数算满足，超过最多天数算不满足，其间另列，模拟日只在较宽口径下满足的输出 `UNKNOWN`。 | 原文未提及 |
| PD-148 | 黄金签证最低停留的期间怎么划分 | 条例写第 1 年 7 天、此后每个 2 年期 14 天，沿用当时首张 1 年、续期 2 年的许可期限；现行首张为 2 年，两者怎么对应没写。AIMA 页面写成此后每年 14 天，比条例严。 | SRC-124 art. 65-C（p3）；SRC-126 ARI 页面 | 从第一张黄金签证卡的生效日（作为授予日）起按日历划分：第 1 年，之后按条例每 2 年、按 AIMA 每 1 年各算一遍，到当前卡到期为止。截至模拟日只算实际停留；未满的期间按之后一直在葡萄牙（已录入出境除外）推算达到的日期，最早日期取它与续期期间开始中较晚的一个；期间结束仍达不到的算不足；两种写法都要到续期期限之后才达到的，算不满足。两种都已满足才算模拟日满足；条例不足算不满足；只有 AIMA 写法不足、或模拟日只按条例写法满足的输出 `UNKNOWN`。出入境当天按在葡萄牙计。 | 原文未提及 |
| PD-149 | 续期最早何时可以申请 | 法律只规定最迟在到期前 30 天申请；"到期前 90 至 30 天"见于条例 art. 63 n.º 16，本次只取得里斯本检察院的编纂版。审核指出该款由 DR 9/2018 第 2 条加入（公报 PDF p6），DR 1/2024 未改其内容，公报原文尚未存档；逾期申请的后果不在试点范围。 | SRC-123 art. 78 n.º 1（p66）；SRC-125 DR 84/2007 art. 63 n.º 16 | 不输出 `UNKNOWN`。续期期间按到期前 90 天至 30 天计，结果声明 90 天来自编纂版；过了 30 天的期限算不满足。 | 存档 DR 9/2018 公报原文后复核 |
