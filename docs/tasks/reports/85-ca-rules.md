# 任务 85 · 加拿大完整版规则引擎

## 1. 做了什么（按建议提交分组）

| PROGRESS | 建议 commit message | 文件 |
|---|---|---|
| 560 | `Docs: 登记加拿大法定条件来源与待定事项` | `policy-sources/2026-11-23-ca-*`、`docs/{SOURCES,pending-details}.md`、`apps/web/lib/sources.ts`、PROGRESS 第 560 行记录 |
| 561 | `Feat: 登记加拿大完整版政策参数` | `packages/policy-data/src/{index,types,parameters/index,parameters/canada-2026-11}.ts`、PROGRESS 第 561 行记录 |
| 562 | `Feat: 实现加拿大十条路径的完整资格评估` | `packages/engine/src/index.ts`、`packages/engine/src/canada-full/*.ts`、七份 `packages/engine/test/canada-*-full.test.ts`、本报告、PROGRESS 第 562 行记录 |

三组均由 Fable 提交，署名尾行为 `Co-Authored-By: Codex gpt-6.2-astra <noreply@openai.com>`。

`evaluateCanadaFull(req)` 返回兼容 `CountryResult` 的 `CaFullResult`。列 ID 为 `ca.current-law-2026-11`，政策基准日为 2026-11-23。实质条件全部满足时为 `MET`。如只差居住时间且能确认达标日，路径返回 `FUTURE` 与 `earliestDate`。其他实质条件明确不满足时为 `NOT_MET`，有待确认的条件时为 `UNKNOWN`。已持 PR 的人会看到初次取得 PR 路径为 `NOT_APPLICABLE`。已是公民或可能按血统取得公民身份时，先提示核验身份（SRC-260，Citizenship Act s.3）。

`CA-R02`、`CA-R08` 的 `timeBaseline` 保留旧引擎的结论、摘要、日期及窗口假设编号。未达到的时间门槛与可能改变结果的法定例外各有说明。证件分支及单纯报价等参考项带 `advisory` 标记。R17 根据实付状态参与入籍路径汇总，金额只在说明中展示。R18 说明入籍没有独立的住房、收入、医保或地址登记门槛，作为恒定说明展示。联邦签名和费用回执按路径记录，省级批准、联邦核查、获得 PR 以及入籍授予可分别查看。

### 路径与条件

下表取各分支出现过的条件并集。Rxx 对应稳定 ID `CA-Rxx`。条件正文可由 `locale` 选择中文或英文；每个输出附来源编号和条款、表格或段落定位。

| 路径 ID | 条件 | 适用范围 |
|---|---|---|
| `CA-RESIDENCY` | R01–R05 | 含 PR card 首发、换补及 PRTD。R02 保留实地基线，R03 计入可确认的法定调整。 |
| `CA-CITIZENSHIP` | R06–R19 | 普通成人或未成年人 s.5(1)，含 CAF 特别条款。 |
| `CA-CIT-MINOR-52` | R06–R18 | 须有符合条件的父母和代办人。R08–R11 等在法定豁免时说明不适用。 |
| `CA-EE-FSW` | R20–R27、R29–R39 | Federal Skilled Worker，六因素可得分区间与实际轮次分别核对。 |
| `CA-EE-CEC` | R20–R27、R29–R32、R39–R41 | Canadian Experience Class，合资格经历最多的职业决定语言档。 |
| `CA-EE-FST` | R20–R27、R29–R32、R37–R39、R42–R44 | Federal Skilled Trades，证书与合资格 offer 可择一满足。 |
| `CA-PNP` | R20–R27、R29–R32、R45–R54 | R29–32 仅 enhanced。R45–46 核联邦阶段；安省 Workforce Priority 使用 R47、54，受雇岗位加 R48–49，高技能加 R50–51、较低技能加 R52，自雇医师加 R53。 |
| `CA-QC-PSTQ` | R20–R27、R60–R70 | R60–64、69–70 共用。高技能、中级、受规管和卓越人才分别使用 R65、66、67、68。 |
| `CA-AIP` | R20–R27、R55–R59 | Atlantic Immigration Program，含指定雇主、工作或本地毕业豁免及签发省 endorsement。 |
| `CA-FAMILY` | R20–R26、R28、R71–R80 | 配偶、common-law、conjugal partner、受抚养子女，含境内类别及魁省承诺。 |

### 每个条件使用的来源

下列编号引用 [来源登记表](../../SOURCES.md)。每组可包含多份官方快照，具体小节保存在该条件的 `sources[].locator`。页面接入可按本报告的 SRC 编号读取 `sourceUrls`；同组其他官方链接逐份列在登记备注。

| 条件 ID | 核对内容 | 来源编号 |
|---|---|---|
| `CA-R01` | 当前永久居民身份及附带条件 | SRC-261 |
| `CA-R02` | 实地居住天数 | SRC-075、SRC-078 |
| `CA-R03` | 认可的境外日、执法截点及人道裁量 | SRC-075、SRC-261 |
| `CA-R04` | PR card 办理 | SRC-261、SRC-265 |
| `CA-R05` | 永久居民旅行证件 | SRC-261、SRC-265 |
| `CA-R06` | 申请类别、父母身份及签署 | SRC-260、SRC-262 |
| `CA-R07` | 永久居民身份及条件 | SRC-074、SRC-260、SRC-262 |
| `CA-R08` | 实际居住及例外 | SRC-074、SRC-077、SRC-260 |
| `CA-R09` | 逐年报税义务 | SRC-074、SRC-260、SRC-262 |
| `CA-R10` | 听说能力与证明 | SRC-074、SRC-260、SRC-263 |
| `CA-R11` | 公民知识考试 | SRC-074、SRC-260、SRC-263 |
| `CA-R12` | 移除令、安全宣告及返加授权 | SRC-260、SRC-262 |
| `CA-R13` | 现行服刑、刑事程序及战争罪禁项 | SRC-260 |
| `CA-R14` | 定罪、虚报、撤籍及特别禁项 | SRC-260 |
| `CA-R15` | 身份、警证及指纹材料 | SRC-260、SRC-262 |
| `CA-R16` | 宣誓与授予时资格 | SRC-260、SRC-262 |
| `CA-R17` | 入籍费用 | SRC-260、SRC-264 |
| `CA-R18` | 收入、住房、保险及地址登记 | SRC-260、SRC-262 |
| `CA-R19` | 军队服役特别条款 | SRC-260 |
| `CA-R20` | 身份、家庭申报与申请材料 | SRC-261 |
| `CA-R21` | 安全、人权、制裁和有组织犯罪 | SRC-261、SRC-266 |
| `CA-R22` | 犯罪及严重犯罪的准入审查 | SRC-261 |
| `CA-R23` | 公共健康、安全及 excessive demand | SRC-261、SRC-266 |
| `CA-R24` | 移民体检及复用决定 | SRC-261、SRC-266 |
| `CA-R25` | 生计、虚报、不合规与家属范围，含随行子女 | SRC-261、SRC-266、SRC-274、SRC-279 |
| `CA-R26` | 警证与 PR 生物识别 | SRC-261、SRC-266、SRC-274、SRC-277、SRC-279 |
| `CA-R27` | 联邦费用与付款 | SRC-261、SRC-264 |
| `CA-R28` | 联邦费用与付款 | SRC-261、SRC-264 |
| `CA-R29` | EE 建档、邀请与正式递交 | SRC-261、SRC-269、SRC-277 |
| `CA-R30` | 该轮 CRS 排名与同分顺序 | SRC-269 |
| `CA-R31` | 语言测试与适用学历评估的效期 | SRC-261、SRC-268 |
| `CA-R32` | 邀请类别附加要求 | SRC-269、SRC-276 |
| `CA-R33` | FSW 连续技术工作 | SRC-261、SRC-267 |
| `CA-R34` | FSW 第一官方语言 | SRC-261、SRC-268 |
| `CA-R35` | FSW 中学以上学历及等值 | SRC-261、SRC-267、SRC-268 |
| `CA-R36` | FSW 六项选拔分 | SRC-261、SRC-267 |
| `CA-R37` | 安排就业与适用豁免 | SRC-261、SRC-269、SRC-277、SRC-279 |
| `CA-R38` | 联邦安家资金 | SRC-261、SRC-268 |
| `CA-R39` | 在魁北克以外定居 | SRC-261、SRC-267 |
| `CA-R40` | CEC 在加合资格工作 | SRC-261、SRC-267、SRC-269、SRC-279 |
| `CA-R41` | CEC 主要经验对应的语言 | SRC-261、SRC-267、SRC-268 |
| `CA-R42` | FST 指定技工及合资格经验 | SRC-261、SRC-267 |
| `CA-R43` | 技工资格证或合资格报价 | SRC-261、SRC-267 |
| `CA-R44` | FST 口语与书面语言 | SRC-261、SRC-267、SRC-268 |
| `CA-R45` | 省提名与定居意图 | SRC-261、SRC-271、SRC-279 |
| `CA-R46` | 提名后的联邦递交 | SRC-261、SRC-269、SRC-271 |
| `CA-R47` | 安省 EOI、邀请与递交 | SRC-272 |
| `CA-R48` | 安省雇主与工作地点 | SRC-272、SRC-279 |
| `CA-R49` | 安省岗位、工资与股权 | SRC-272、SRC-279 |
| `CA-R50` | 安省高技能岗位经验与执照 | SRC-272 |
| `CA-R51` | 安省高技能岗位语言与学历 | SRC-272 |
| `CA-R52` | 安省 TEER 4–5 经验、执照、语言与学历 | SRC-272 |
| `CA-R53` | 安省自雇医生 | SRC-272 |
| `CA-R54` | 安省申请费 | SRC-272 |
| `CA-R55` | 安家计划、目的省与 endorsement | SRC-261、SRC-270、SRC-271 |
| `CA-R56` | AIP 工作报价 | SRC-261、SRC-270 |
| `CA-R57` | 大西洋工作经验或当地毕业豁免 | SRC-261、SRC-270 |
| `CA-R58` | AIP 学历、评估与语言 | SRC-261、SRC-270 |
| `CA-R59` | 大西洋安家资金 | SRC-261、SRC-270 |
| `CA-R60` | 魁省技术甄选基本条件 | SRC-273、SRC-278 |
| `CA-R61` | Arrima 邀请与递交期限 | SRC-273、SRC-278 |
| `CA-R62` | 魁省财政自足合同与资金 | SRC-273、SRC-278 |
| `CA-R63` | 魁省价值观证明 | SRC-273 |
| `CA-R64` | 魁省法语证明 | SRC-273、SRC-278 |
| `CA-R65` | PSTQ 高资质与专门技能 | SRC-273、SRC-278 |
| `CA-R66` | PSTQ 中级与手工技能 | SRC-273、SRC-278 |
| `CA-R67` | PSTQ 受规管职业认可 | SRC-273、SRC-278 |
| `CA-R68` | PSTQ 卓越人才 | SRC-273、SRC-278 |
| `CA-R69` | CSQ 与魁省技术移民联邦递交 | SRC-261、SRC-273 |
| `CA-R70` | 魁省 PSTQ 甄选费 | SRC-273 |
| `CA-R71` | 担保人身份、居住与既有担保 | SRC-261、SRC-274 |
| `CA-R72` | 持续担保资格、债务及禁项 | SRC-261、SRC-274 |
| `CA-R73` | 伴侣关系、年龄及真实性 | SRC-261、SRC-274 |
| `CA-R74` | 受抚养子女、随行未成年人监护同意与先前申报 | SRC-261、SRC-266、SRC-274、SRC-279 |
| `CA-R75` | 担保类别与境内身份 | SRC-261、SRC-274 |
| `CA-R76` | 联邦担保承诺与收入 | SRC-261、SRC-274 |
| `CA-R77` | 魁省担保资格与承诺 | SRC-261、SRC-275 |
| `CA-R78` | 魁省收入与在加资产 | SRC-261、SRC-275 |
| `CA-R79` | 魁省排期、限额及例外 | SRC-275、SRC-276 |
| `CA-R80` | 魁省家庭担保费用 | SRC-275 |

### 来源与待定条件

沿用 SRC-074–078。新增 SRC-260–279，按主题登记 103 份新快照；八份原有快照继续使用原哈希。PDF 在登记备注逐份列出官方 URL。SRC-278 的 PSTQ Gazette 印刷页 4959–4961 对应 PDF 第 3–5 页。首卡材料期限定位到 SRC-261，IRPR s.58(1)–(2)。

| 待定编号 | 会保留 UNKNOWN 的情况 |
|---|---|
| PD-089–091（沿用） | 居住义务审查日、网上签署日和闰日沿用原计算假设。时间基线保留涉及的编号。 |
| PD-240–242 | 境外派驻、同住、执法截点、H&C、Crown service、CAF、未成年人豁免或税年认定未明。如果争议天数或税年无法改变门槛结果，仍可给出确定结论。 |
| PD-243–245 | 境外犯罪等效、rehabilitation、上诉、医疗复用及准入、涉及监护的家属范围或证件例外，需依书面决定。 |
| PD-246–249 | EE 未发生的轮次、缺少该轮官方 CRS 或同分时点、offer 或医师公共政策待核、未来安家资金表、CEC 同量职业采用不同语言门槛且结果受影响。 |
| PD-250–252 | 定居意图、提名、工资和执照缺决定性证据，或 AIP 法规与网页的 TEER、医护 NOC 口径会给出不同判断。安省以外地方甄选由该省确认。 |
| PD-253–254、257 | 魁省邀请信期限、职业认可、家庭价值观证明或学历等值待核；自足金表未列明的家庭构成，缺 MIFI 确认金额。Québec 汇编法规抓取受限，保留 Gazette 与现行指南间影响判定的差异。 |
| PD-255–256 | 担保关系、境内无身份豁免、既有违约、监护、魁省收件信或可用名额尚未获确认。 |
| PD-258–259 | 联邦或省费用尚未公布、调价时点无法确定，或入籍语言、知识、宣誓豁免仍待裁定。 |

新登记编号为 PD-240–259。输入缺失且法律明确时，条件说明列出需补的事实或材料；`RuleResult.pendingDetails` 依原契约用于有对应待定事项的结果。档案列出的个案裁量不会由模拟器代批。

## 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 在最终代码上退出码 0。全仓 5,332 项测试通过，1 项既有文案导出测试按原条件跳过。policy-data 的 23 项测试含来源一致性检查；Next.js 构建生成 27 个静态页面。

- `pnpm --filter @uk-immigration/engine test test/canada` 通过 107 项，其中原有 15 项、新增 92 项。
- `pnpm --filter web test test/policy-page.test.tsx` 通过 5 项。该测试要求全站 `sourceUrls` 与所有已登记 SRC 完全一致。按此契约加入 20 个条目。
- 以档案 `sources.sha256` 逐份重算仓库内快照，核对全部 111 个文件；同时检查 8 个 PDF 在登记备注中有可供现有来源检查脚本读取的逐文件网址。
- 用中英文分别评估空请求，并覆盖 Ontario 三类、PSTQ 四类、base/enhanced PNP 及家庭分支。输出共 10 条路径，出现的独立条件恰为 CA-R01–CA-R80。核对稳定 ID、来源定位、同一路径没有重复条件、空资料不会得出整体满足。
- 用例含 729/730 天、1,094.5/1,095 天、未成年人转档、入籍税年、语言及考试；FSW 66/67 分、CEC 同量经历、AIP 资金与 TEER 冲突；安省邀请双期限、PSTQ 自足金与受规管职业期限、联邦与魁省家庭担保。
- 联邦边界包括实际判刑 6/7 个月、最高刑 9/10 年、警证连续停留及签发满 6 个月、指纹年龄 13/14 与 79/80、体检期限、五年虚报禁期与按家庭人数计费。省提名、联邦待审、最终不准入、单纯费用提示分别进入组合用例。
- 复核缺失与否定答案、官方豁免与待裁量、旧时间引擎与完整评估的日期及政策版本。原 `evaluateCanada` 源码及原测试无差异。将 `apps/web/lib/sources.ts` 与分支基线实际导出的字典逐项比较，原有 126 条网址及顺序一致，末尾增加 20 条。英国政策页自动列出全站来源，网址登记后其目录同步增加 20 个链接。

## 3. 没做或没验证的

本次交付到规则引擎、参数、来源和测试。现有加拿大问卷仍调用旧引擎。后续页面接入、分享、游戏、浏览器 e2e、PR、部署和独立代码审核由其各自任务承接。按 brief 保留本地未提交改动。

其他省的各自 PNP stream 只评估已知提名后的联邦阶段。对实际 EE 轮次，R30 接收该轮规则口径下的 IRCC CRS 总分、cutoff 与 tie-break；FSW 的六因素分由引擎核算。比较尚未公布的轮次、尚未认定的特殊雇佣或尚未获准的豁免时，结果会保留 UNKNOWN。

## 4. 发现与建议（页面任务 95）

- 首页先问目标、现有身份、出生日期与意向省。若可能已有公民身份，先展示身份证明分流。用户可跳过问题；行程、家属或工作经历的空清单需与尚未填写区分。
- 保持 PR 或入籍时，问 PR 生效日、行程、派驻或陪同的法律依据、不可计日与执法日期。分开记录已认可、待审的期间；区分签署日及宣誓日。入籍再问逐税年报税义务、听说证明、知识考试／豁免、父母身份、签字权限、CAF 服役及有效裁定。
- 首次 PR 时，分别问每位家属是否随行、监护或分居、准入及体检结果、警证所涉连续停留和签发日、生物识别及各申请回执。可只记录日期与通知状态，无需证件号码、病名或案情叙述。费用展示金额、费表日期及家庭人数，保留省费和第三方费用说明。
- EE 问 profile、ITA、所属项目、轮次与收件日期、同轮官方 CRS、四项成绩和有效期、ECA、职业代码、职责、工段日期与逐日工时、许可、报酬方式、offer 及资金家庭人数。若待核证据会改变分数或资格，应展示待补项目。
- 安省问雇主与本人各自的递交日、地点、收入、员工数、岗位、工资与执照；其他省问有效提名及 base/enhanced。AIP 问指定雇主、目的／工作／签发省、安家计划、endorsement 有效期、当地毕业豁免和 offer 条件。
- Québec PSTQ 问 Arrima 邀请、接受、书面期限、FEER、实际工作与实习、学历、逐项法语、各成员价值观证明、CSQ 和家庭构成。家庭担保另问关系、年龄、以往担保、债务、联邦和省两阶段承诺、适用收入、收件批次和名额。

## 审核修正（review85-1）

### 1. 做了什么

建议提交 `Fix: 修正加拿大资格判定与最早日期汇总`。对应 PROGRESS 第 563 条。

- R56 按 IRPR s.87.3(6)(d)(ii)–(iii)、(7) 与 IRCC 报价表核对。TEER 3 经验配 TEER 1 报价为 `MET`，TEER 1 经验配普通 TEER 3 报价为 `NOT_MET`。PD-252 改引 (7)，保留法规与表格在 TEER 2/3 和医护 NOC 上会改变结果的差异（SRC-261b、270）。
- R17 把缴费状态计入路径。其余条件满足时，已缴、未缴、未填分别返回 `MET`、`NOT_MET`、`UNKNOWN`。费表未覆盖申请日时，仍可记录已缴清。缴费凭证依据 SRC-260c，Citizenship Regulations (No. 2) ss.2(1)(i)、2(2)(i)、2(3)(e)、4(c)。[IRCC 缴费及回执说明](https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/adult-minor/how.html)
- R31 分别核对 EE 建档与递交时的语言成绩。新成绩签发晚于建档日、旧成绩未填时返回 `UNKNOWN`。CEC/FST 申请人提供了已过期的外国学历 ECA，但未说明是否用它申报积分时也返回 `UNKNOWN`（SRC-268，语言成绩和 ECA 的有效期小节）。
- R24 按实际体检日核对收到指示后的 30 天期限。逾期时列出原截止日。延期或接受补做待确认时为 `UNKNOWN`，明确未获准为 `NOT_MET`，获准的期限覆盖完成日或 IRCC 已接受补做时可为 `MET`。`instructionExtension` 记录完成期限延期或接受补做的决定，`extendedUntil` 记录体检结果有效期的延长（SRC-266b，When to get your medical exam，PD-244）。
- R25 分别核对递交日和模拟日。即使模拟日禁期已满，禁期内递交的申请仍为 `NOT_MET`（SRC-261a，IRPA s.40(2)(a)、(3)）。
- PR 居住义务和普通入籍只差居住天数时，外层路径返回可确认的 `FUTURE` 和 `earliestDate`。另有未满足或待确认的实质条件时，外层不带预测日期。R05 双语说明均涵盖上诉期未满和上诉待决，R30 双语说明均写明适用的加拿大工作经验分与高薪工作邀请分取较高值（SRC-261a，IRPA s.31(3)(c)；SRC-269，EE 部长指令 ss.15–15.2）。

### 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 最终退出码为 0。全仓 5,338 项测试通过，1 项既有测试按原配置跳过，Next.js 生成 27 个静态页面。英国随机时间线的固定种子 1455489211 曾触发 5 秒超时，单独重跑通过，随后以 `VITEST_MAX_WORKERS=2` 重跑完整验收。测试超时设置保持原值。
- `pnpm --filter @uk-immigration/engine test test/canada` 通过 8 个文件、113 项测试。新增断言先复现了 AIP、EE、入籍缴费及外层日期的原判定。入籍复现为 2024-01-01 取得 PR、无出境、其他适用条件满足，在 2026-11-23 评估时外层返回 `FUTURE`，最早签署日为 2026-12-31。
- 非 EE 体检用例在 2026-09-01 收到指示，分别验证 10-01 当日完成、10-16 逾期且延期结果待确认、明确无延期、批准至 10-15 或 10-16，以及 IRCC 已接受补做。虚报禁期用例覆盖起始当天、届满前递交后再评估及届满当天递交。

### 3. 没做或没验证的

改动留在工作区，未提交。现有加拿大页面继续使用原时间引擎；本轮验证完整版引擎对外返回的字段，未运行浏览器 e2e 或部署。

### 4. 发现与建议

任务 95 接入完整版时可直接读路径的 `status` 和 `earliestDate`。境外抵扣可能使日期提前，或排除日、执法截点使基线日期无法成立时，`timeBaseline` 只供查看原计算。魁省法规汇编的逐条核验仍按 PD-257 跟进。

## 第二轮审核修正（review85-2）

### 1. 做了什么

建议提交 `Fix: 修正加拿大 EE 凭证时点与入籍跨龄预测（review85-2）`。对应 PROGRESS 第 564 条。

- R31 分别核对建档和递交时适用的 ECA。递交所用报告签发晚于建档日，且未提供建档所用报告时，建档时点保留 `UNKNOWN`。依据 SRC-268c 的 “How long your ECA is valid for”。[IRCC 学历认证效期](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessment.html#valid)
- R24 按本项目实际 ITA 与递交日期核对指定医师体检。提前体检且无适用的复用或豁免决定时返回 `UNKNOWN`，在 PD-244 登记。输入仅精确到日，若体检与邀请或递交同日，也无法确定当天先后。依据 SRC-266b 的 “When to get your medical exam”，Express Entry 小节。[IRCC 永久居民体检时点](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams/requirements-permanent-residents.html#when)
- 普通入籍原本只差居住天数时，再以住满当天为签署日复核实质条件。模拟日的逐项结果保留，路径摘要列出预计签署日仍未满足或待确认的条件。R10 和 R11 的年龄以申请日为准，依据 SRC-074、SRC-260a，Citizenship Act s.5(1)(d)–(e)。[Citizenship Act 第 5 条](https://laws-lois.justice.gc.ca/eng/acts/c-29/section-5.html)

### 2. 怎么验证的

三组新增回归在修改规则前分别复现了 R31 的 `NOT_MET`、R24 的 `MET` 和普通入籍路径的 `FUTURE`。修正后，`pnpm --filter @uk-immigration/engine test test/canada` 通过 8 个文件、116 项测试，包括原时间引擎。下表中每个 EE 结果都同时断言了对应条件和 FSW 路径汇总。

| 复现输入 | 修正后结果 |
|---|---|
| FSW 于 2026-01-01 建档、2026-11-20 递交。语言成绩在两日有效，外国硕士 ECA 于 2026-10-15 换发。 | 缺建档报告为 `UNKNOWN`。补 2021-11-10 的合资格报告为 `MET`，补建档时已过期的报告为 `NOT_MET`。 |
| 境外 FSW 于 2026-11-03 获邀、2026-11-20 递交，无复用或豁免决定。 | 2026-10-01 体检为 `UNKNOWN`，关联 PD-244。11-04 体检为 `MET`，11-21 为 `NOT_MET`。同日顺序不明和未提供 ITA 时均为 `UNKNOWN`。 |
| 2008-12-10 出生，2024-01-01 获 PR，无出境，缺语言和考试资料，其他适用条件满足。 | 2026-11-23 模拟日的 R10、R11 均为 `MET`。2026-12-31 住满时已成年，这两项在预计签署日均为 `UNKNOWN`，路径为 `UNKNOWN` 且不返回最早签署日。补齐两项后恢复 `FUTURE / 2026-12-31`。 |

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 首次运行退出码为 0。全仓 5,341 项测试通过，1 项既有测试按原配置跳过，构建生成 27 个静态页面。

### 3. 没做或没验证的

按要求未提交。原时间引擎 `evaluateCanada` 与加拿大页面调用点均无改动。未运行浏览器 e2e 或部署。

### 4. 发现与建议

- R36 仍按递交日计算 FSW 年龄分。审核用例在获邀时达到 67 分，获邀后过生日，递交时为 66 分。IRCC 公共政策允许官员对符合条件的个案豁免年龄扣分，现有判定未纳入该决定。选拔分与年龄分依据 SRC-267a 的 “Selection factors” 和 SRC-261b，IRPR ss.76、81。[IRCC 获邀后年龄变化公共政策及适用条件](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/age-based-requirements.html)
- 魁省 PSTQ Stream 1/2 本地学历学时仍待按现行汇编法规逐条核实，继续由 PD-257 跟踪（SRC-273b、SRC-278e/g）。

## 第三轮审核修正（review85-3）

### 1. 做了什么

建议提交 `Fix: 统一加拿大联邦收件日并修正入籍跨龄预测（review85-3）`，对应 PROGRESS 第 565 条。

- FSW 和 enhanced PNP 的 R29 按本次申请的实际收件日核对 ITA 期限。沿用联邦规则的取值顺序，优先使用本路径的 `federal.applications[id].filedOn`，其次使用 `express.applicationDate`，enhanced PNP 也接受 `pnp.federalFiled`。PNP 的 R45、R46 用同一天核对提名有效期与递交情况，只有实际填了日期才能确认已收件。依据 SRC-277b 第 1 节和 SRC-271 的 Express Entry process。[IRCC 递交说明](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/apply-permanent-residence.html#form)
- AIP 的 R55 优先使用本路径的联邦收件日，其次使用 `atlantic.applicationDate`。背书须在递交日有效，之后若被撤销，仍不满足。依据 SRC-261b，IRPR s.87.3(2)(a)。[IRPR 第 87.3 条](https://laws-lois.justice.gc.ca/eng/regulations/SOR-2002-227/section-87.3.html)
- 一并修正审核列出的入籍反向跨龄风险。普通入籍一旦算出住满日，就以该日为预计签署日复核实质条件。模拟日仍显示当日的逐项结论，所有实质条件在预计签署日满足时才给出 `FUTURE` 和日期。语言和考试的适用年龄依据 SRC-074、SRC-260a，Citizenship Act s.5(1)(d)–(e)。[Citizenship Act 第 5 条](https://laws-lois.justice.gc.ca/eng/acts/c-29/section-5.html)

### 2. 怎么验证的

五个新增回归用例在改动前均失败。改动后，`pnpm --filter @uk-immigration/engine test test/canada` 通过 8 个文件、121 项测试，含原时间引擎及前两轮回归。以下用例的模拟日均为 2026-11-23。

| 复现 | 单项与路径断言 |
|---|---|
| FSW 于 04-29 获邀、06-10 递交，只填本路径 `filedOn`。 | R24、R29、FSW 路径均为 `MET`。 |
| Enhanced PNP 于 06-22 获邀、07-10 递交。分别只填 `pnp.federalFiled` 或只填本路径 `filedOn`。 | 两种输入的 R24、R29、R46 和 PNP 路径均为 `MET`。 |
| AIP 于 06-10 递交，只填本路径 `filedOn`，背书于 07-01 到期且未撤销。 | R24、R55、AIP 路径均为 `MET`。 |
| 1971-12-10 出生，2024-01-01 获 PR，无出境，语言证明被拒、尚未考试。 | 模拟日 R10 为 `NOT_MET`、R11 为 `UNKNOWN`，路径为 `FUTURE / 2026-12-31`。明确填写该日签署时，R10、R11 和路径均为 `MET`。 |

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 首次运行退出码为 0。全仓 5,346 项测试通过，1 项既有测试跳过，构建生成 27 个静态页面。

### 3. 没做或没验证的

按要求保留未提交改动。旧 `evaluateCanada` 源码与测试无改动。未运行浏览器 e2e 或部署。

### 4. 发现与建议

FSW 的 R36 仍按递交日年龄计分。审核个案获邀时 67 分，因生日至递交时降为 66 分，现有规则会返回 `NOT_MET`。IRCC 公共政策的 Conditions 小节允许官员对符合条件的个案给予豁免，个案能否获准须核对决定。本轮仅记录该风险。选拔分和年龄分见 SRC-267a 的 Selection factors 及 SRC-261b，IRPR ss.76(1)(a)、81。[IRCC 获邀后年龄变化公共政策](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/age-based-requirements.html)

## 第四轮审核修正（review85-4）

### 1. 做了什么

建议提交 `Fix: 按路径隔离加拿大申请收件日并修正家庭担保与魁省判定（review85-4）`。对应 PROGRESS 第 566 条。

十条路径的规则统一从 `filingDatesForRoute(req, id)` 读取本路径的申请日期。函数分别返回联邦收件、省级递交、雇主递交、家庭完整收件、首次 PR 卡材料递交或入籍签署日期。只有明确提供的日期才会从函数返回。需要评估准备中申请的规则仍可按模拟日估算，R46 和 R69 确认实际递交则必须有本路径的收件记录。[取值函数](../../../packages/engine/src/canada-full/shared.ts)

初次 PR 的联邦收件日优先取 `federal.applications[id].filedOn`。FSW、CEC、FST 只有在 `express.invitation.program` 匹配时才接受 `express.applicationDate`。PNP 其次取 `pnp.federalFiled`，仅 enhanced 且邀请属于 PNP 时还可取 EE 日期。AIP、魁省和家庭担保的后备字段分别为 `atlantic.applicationDate`、`quebec.federalReceived`、`family.filingDate`。家庭只录了完整收件日时也可据此确认联邦收件。EE 递交与提名依据 SRC-277b “Fill out the application form”、SRC-271c “Express Entry process”。[IRCC 省提名](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees/express-entry.html)

家庭担保 R73 按本申请递交日计算同居期限。R74 使用明确的完整申请收件日。只有本路径的签名、家属申报、身份证件、申请材料和手续费均已确认，普通收件日才可用于子女锁龄。魁省 R69 用同一联邦收件日核对 CSQ 签发、到期及实际递交。依据 SRC-274c Guide 5289 的 “Sponsoring your spouse, common-law partner or conjugal partner”、“Definitions of dependent children” 和 Step 5，以及 SRC-273e “Who can apply / Eligibility”。[IRCC 家庭担保指南](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5289-sponsor-your-spouse-common-law-partner-conjugal-partner-dependent-child-complete-guide.html) · [IRCC 魁省技术移民资格](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/quebec-skilled-workers/eligibility.html)

#### 完整版中使用递交日、收件日或签署日的规则清单

下表包括由日期计算出的年龄、经验、学历和适用费表。每行的日期均来自上述函数，规则编号可与本报告开头相同编号的 SRC 登记对照。

| 路径或阶段 | 规则 | 日期用于什么 |
|---|---|---|
| 七条初次 PR 路径的联邦审查 | R24、R25、R26 | R24 核体检复用或 EE 邀请、体检与递交的顺序。R25 核递交时的虚报禁期。R26 核警证覆盖期间、签发日和生物识别适用年龄。 |
| 初次 PR 联邦费用 | R27（经济类）、R28（家庭） | 有付款日时按付款日选费表，缺付款日时用本申请递交日估价。担保子女按递交日年龄确定费用类别。 |
| FSW、CEC、FST、enhanced PNP | R29、R31 | R29 比对本项目 ITA 和正式递交期限。R31 核递交时语言及适用 ECA 的有效期，另保留建档时点。 |
| FSW | R33、R35、R36、R38 | 工作窗口、学历认证、六因素计分（含年龄、凭证及经验）和申请时资金表。 |
| CEC | R40、R41 | 工作窗口及窗口内经验最多的职业，后者决定语言门槛。 |
| FST | R38、R42 | 申请时资金表、取得独立执业资格后的工作窗口。 |
| PNP 联邦阶段（base 与 enhanced） | R45、R46 | 提名在联邦递交时有效，R46 还核对截至模拟日是否已收件。 |
| PNP 安省阶段 | R47、R49、R50、R51、R52、R54 | R47 用 `pnp.ontario.employerFiled` 和 `pnp.ontario.filed` 查两次递交的顺序和期限。其余按申请人省级递交日核近期毕业例外、岗位工资或经验、语言和学历效期、适用费表。 |
| AIP | R55、R56、R57、R58、R59 | R55 核背书效期，R56、R57 按递交前经历或毕业豁免判断报价匹配和经验，R58 核语言与学历，R59 选资金表。 |
| 魁省 PSTQ 省级甄选 | R60、R61、R62、R63、R64、R65、R66、R67、R70 | 用 `quebec.filed` 核年龄、Arrima 期限、自足金表、价值观和法语证明、学历取得日、受规管职业认可效期和省费。R68 使用已按期间统计的职业月数。 |
| 魁省 PSTQ 联邦阶段 | R69 | 用联邦收件日核 CSQ 的有效区间和递交事实，省级甄选可以更早完成。 |
| 家庭担保联邦阶段 | R71、R72、R73、R76 | 递交时的担保人年龄及既往受担保期限、定罪例外的等待期、伴侣年龄及关系期限、收入表年度。 |
| 家庭担保子女锁龄 | R74 | 优先取 `family.completeApplicationReceived`。缺该日时，仅完整性已确认的本次联邦收件可锁龄。 |
| 家庭担保魁省承诺 | R77、R78、R79、R80 | 按 `family.province.submissionDate` 核融入计划的适用年龄、收入表、收件批次和省费。R79 另核联邦通知的签发日。 |
| PR 居住义务 | R04 | 按 `residence.card.firstCardDetailsDate` 核对首次 PR 卡材料的递交期限。 |
| 普通入籍 | R06、R07、R08、R09、R10、R11、R14、R15、R17、R19 | 按 `residence.signingDate` 核签署年龄、PR、居住和税年窗口、语言与考试适用年龄、禁项回溯、警证、入籍费及 CAF 证明对应日。预计住满日的签署复核走同一函数。 |
| 未成年人入籍 s.5(2) | R06、R07、R14、R17 | 按入籍签署日核签署人与未成年身份、PR、禁项回溯及入籍费。两条入籍路径沿用同一拟签署日，分别评估各自条件。此分支豁免居住、税年、语言和考试要求。 |

其余已核规则为 R01–R03、R05、R12–R13、R16、R18、R20–R23、R30、R32、R34、R37、R39、R43–R44、R48、R53、R68、R75。这些规则使用独立事实、已汇总的资料，或其他事件日期，例如 R16 用授予日，R30、R32 用邀请轮次日。逐字段检索确认，完整版对上述原始递交、收件及签署日期的直接读取均位于 `shared.ts` 的取值函数内。

### 2. 怎么验证的

在 `00c2819` 上先运行新增回归，复现了审核的三项问题，也复现了 CEC 误用 FSW 递交日和已确认完整的家庭收件无法锁龄。修正后，`pnpm --filter @uk-immigration/engine test test/canada --reporter=dot` 通过 8 个文件的 127 项测试，含原时间引擎。下表的模拟日均为 2026-11-23。

| 复现 | 单项与路径断言 |
|---|---|
| 家庭担保自 2025-11-01 同居，无视同例外，仅填本路径联邦收件日 2026-10-20。 | R24 为 `MET`，R73 与路径均为 `NOT_MET`。将收件日移到同居满一年的 2026-11-01，R73 与路径均为 `MET`。 |
| 魁省 CSQ 于 2026-11-02 签发，仅填本路径联邦收件日 11-05。 | R24、R69、路径均为 `MET`。CSQ 在收件后、模拟前到期也通过。收件早于签发或迟于到期时，R69 与路径均为 `NOT_MET`。只有省级递交、CSQ 仍有效时，两者均为 `UNKNOWN`。 |
| FSW 于 04-29 获邀、05-20 递交。Enhanced PNP 于 06-01 获提名，`pnp.federalFiled` 为 07-10。 | FSW 的 R29 和路径均为 `MET`。PNP 的 R45、R46 均为 `MET`，但提供的 ITA 属于 FSW，PNP 的 R29 和路径均为 `NOT_MET`。仅去掉 PNP 收件日，R46 为 `UNKNOWN`。另给 PNP 匹配的邀请、收件及其他证据，路径可为 `MET`。 |
| 担保子女在普通收件日与补交后确认完整的收件日之间满 22 岁（SRC-274c，Definitions of dependent children）。 | 子女材料完整时 R74 与路径均为 `MET`，完整性缺失时均为 `UNKNOWN`，明确完整收件日在生日后时均为 `NOT_MET`。 |
| 同一 EE 递交日落在虚报禁期内，分别标为 FSW、CEC、FST、PNP 或无邀请。 | 只有匹配邀请的路径 R25 为 `NOT_MET`。无邀请时，四条路径均按各自截至模拟日的事实评估。 |

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 首次完整运行退出码为 0。全仓 5,352 项测试通过，1 项既有测试跳过，Next.js 生成 27 个静态页面。

### 3. 没做或没验证的

依本轮要求，改动保留在工作区供 Fable 提交。旧 `evaluateCanada` 的实现和原测试文件与 `00c2819` 相同。未运行浏览器 e2e 或部署。

### 4. 发现与建议

风险 2 仍存在。FSW 的 R36 在获邀时刚好 67 分、递交前仅因生日降到 66 分的个案会返回 `NOT_MET`。选拔门槛及年龄分依据 SRC-267a “Selection factors” 与 SRC-261b，IRPR ss.76(1)(a)(iv)、81。IRCC 公共政策 “Conditions” 明确由获授权官员决定是否豁免，其他适用条件仍须满足。本轮按要求记录该风险，未改 R36。[IRCC 获邀后年龄变化公共政策](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/age-based-requirements.html)

## 第五轮审核修正（review85-5）

### 1. 做了什么

建议提交 `Fix: 按实际收件日核对加拿大递交期限并区分文书到期与撤销（review85-5）`。对应 PROGRESS 第 567 条。

只有截至模拟日已经发生的本路径、本阶段收件才能证明按期递交。期限内准备好了全套材料，或期限已过但漏填收件日，递交时间均为 `UNKNOWN`。同一路径有多处可记录联邦收件时，优先采用已发生的日期。另有明确的失败条件，例如邀请项目不符或提名已撤回，仍可判定该项不满足。

提名与 CSQ 按实际联邦收件日核对签发及到期，再看截至模拟日是否撤销。已填写的 `expired` 表示自然到期，`withdrawn`（提名）和 `revoked`（CSQ）表示主管机关撤回或撤销。收件早于模拟日、只有“目前有效”而没有可核的签发日时，历史效力为 `UNKNOWN`。随员可逐份录入 CSQ，也可确认所有适用随员的证书在收件时有效且至今未撤销。EE、安省及 Arrima 邀请通过到期日和单独的撤销标记区分两种事件，AIP 沿用背书的签发日、到期日和撤销字段。

#### 十条路径的逐类排查清单

第二列为逐项排查的全部规则。七条初次 PR 路径共用 R20–R26，经济类另有 R27，家庭担保另有 R28。R20 核申请材料，R24 核体检完成、指示和复用决定，R26 核警证与生物识别。体检有独立的结果有效期和补做决定。R21–R23、R25 为准入及禁项，R27、R28 核费用。其余各项的逐条名称和 SRC 见本报告开头的条件表。

| 路径 | 已排查的规则 | 按期递交 | 文书有效及适用时点 |
|---|---|---|---|
| PR 居住义务 | R01–R05 | R04 首卡地址及材料按本人的实际递交日核期限，缺日期或只填未来日期为 `UNKNOWN`。该项为办卡提示，居住义务单独汇总。 | R01–R03 核身份、居住天数和例外，R05 核旅行证申请条件。PR 卡到期不终止 PR 身份。首卡期限见 SRC-261b，IRPR s.58(1)–(2)。PR 身份丧失见 SRC-261a，IRPA s.46。 |
| 普通入籍 s.5(1) | R06–R19 | 依签署日核资格，R09 核各税年的申报义务。无按邀请期限递交的规则。 | R10、R11 核能力、考试或已认可豁免，R15 核身份及警证，R16 核授予及宣誓条件。其余核身份、法定期间、禁项、费用或 CAF 特例。 |
| 未成年人入籍 s.5(2) | R06–R18 | R06 核代办和签署，无申请收件截止日。 | 核父母身份、PR、适用禁项及材料；法定豁免按未成年人分支处理。 |
| EE 联邦技术工人 FSW | R20–R27、R29–R39 | R29 核本项目正式电子收件，邀请签发次日开始，截止日当天可递交。依据 SRC-269e §6、SRC-277b 第 1、4 节。 | R29 核 ITA 撤销。R31 分别核建档与递交时的语言、ECA；R35、R36 在学历与计分中使用相应凭证。书面作废、自然到期可分别录入。R30、R32 的判断时点为邀请轮次。 |
| EE 加拿大经验类 CEC | R20–R27、R29–R32、R39–R41 | R29 只认 CEC 收件。 | R29、R31 同 EE 共用规则。R41 根据主要职业及成绩判断语言等级，成绩效期由 R31 核对。 |
| EE 联邦技工 FST | R20–R27、R29–R32、R37–R39、R42–R44 | R29 只认 FST 收件。 | R29、R31 同 EE 共用规则。R43 核是否持有适用的职业资格证或合资格 offer。届满后能否继续持证须向发证机关核实（PD-247）。R37 的工签或安排就业条件依项目和签证阶段另核。依据 SRC-261b，IRPR s.87.2(3)(d)。 |
| 省提名 PNP | R20–R27、R29–R32（enhanced）、R45–R54 | R46 核本次联邦收件。R47 分别核安省雇主和申请人实际递交的期限及先后；自雇医师适用本人期限。Enhanced 的 R29 同时核 PNP 的 ITA 期限。 | R45、R46 核省提名收件时有效且其后未撤回。R47 核安省邀请撤销。R51、R52 核省级收件时语言及适用 ECA 的效期、是否被作废。R49、R50、R52、R53 中适用的持续岗位或执照要求按省方规则处理。依据 SRC-271d–f、SRC-272b/d。 |
| 魁省技术移民 PSTQ | R20–R27、R60–R70 | R61 核实际接受邀请及省级递交，优先用信上期限；R69 另核本人这次联邦申请收件。 | R61 核 Arrima 邀请有无取消。R69 核本人和适用随员的 CSQ。R63 的价值观证明可应请求在递交后取得，R64 的法语考试及 R67 的等值认可按省级递交时点核效期，正式作废有独立输入。依据 SRC-273b–e/g/i/j/m、278e。 |
| 大西洋移民 AIP | R20–R27、R55–R59 | R55 核联邦实际收件是否落在背书有效期内。 | R55 另核背书是否撤销；R58 核联邦收件时的语言、适用 ECA 及其是否作废。R56、R57、R59 分别核报价、经历或毕业豁免及资金。依据 SRC-261b，IRPR s.87.3(2)(a)、(f)，及 SRC-270、271e。 |
| 家庭担保 | R20–R26、R28、R71–R80 | R79 对受批次限制的魁省承诺，按实际省收件、准入批次及当时名额判断，保留已确认豁免。R74 用完整联邦收件锁定子女年龄。 | R77 核省收件时已取得合格的联邦资格信或适用的境内 AOR；公告按信件签发日期分批，没有列出该信的统一失效日。R72 单独核担保是否撤回。依据 SRC-275c/e、276c。 |

新增四份带 SHA-256 的官方快照。SRC-271d 是 BC 的提名后指南；SRC-271e 明确全国 Base PNP 与 AIP 可于到期日当天收件，在审期间自然到期无需延证；SRC-271f 说明 enhanced PNP 申请后撤回提名的后果。SRC-273m 说明已递交申请的 CSQ 在裁定前继续有效。沿用 PD-246、247、250、253，其中受规管职业的两个官方起算口径确会改变结果、又无正式截止日时，R61 输出 `UNKNOWN`。[加拿大来源登记](../../SOURCES.md) · [联邦收件指南](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/economic-classes/procedures-centralized-intake-office-paper-based-non-applications.html) · [IRCC 魁省递交指南](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/quebec-skilled-workers/apply.html)

### 2. 怎么验证的

以下回归均通过公开入口 `evaluateCanadaFull`，其余实质条件配齐，同时断言列出的单项及整条路径。日期为复现输入。

| 单项及路径 | 输入及预期 |
|---|---|
| R29、FSW | 2026-11-03 获邀，截至 11-23 材料已齐但两处收件日均空，两者均为 `UNKNOWN`。04-29 获邀、漏填实际收件日，在相同模拟日也均为 `UNKNOWN`；补入 06-10 收件后均为 `MET`。06-29 才收件，或按期收件后邀请撤销，均为 `NOT_MET`。 |
| R69、魁省 PSTQ | CSQ 于 2026-11-02 签发、2028-11-02 到期，模拟日为 2028-11-23。填 `expired`，10-15 收件或到期日当天收件均为 `MET`；11-03 才收件为 `NOT_MET`；10-15 收件后改为 `revoked` 也为 `NOT_MET`。随员另测相同三种情形。 |
| R45、R46、Base PNP | BC 提名于 2026-05-21 签发、11-21 到期，模拟日为 11-23。填 `expired`，11-20 收件或 11-21 当天收件，三者均为 `MET`；11-22 才收件，或 11-20 收件后提名被撤回，三者均为 `NOT_MET`。缺收件或只填未来日期，三者均为 `UNKNOWN`。 |
| R55、AIP | 背书于 2026-06-10 签发、07-01 到期。签发日或到期日收件且未撤销为 `MET`；07-02 才收件或按期收件后撤销为 `NOT_MET`；缺收件及只填未来日期为 `UNKNOWN`。 |

另有安省雇主与申请人分别漏填、省级邀请取消、魁省正式期限与接受日、家庭担保资格信晚于省收件、首卡期限边界，以及语言成绩和 ECA 在收件后到期或被作废的回归。R04 同时断言办卡提示与居住主路径的独立结果。加拿大定向命令 `pnpm --filter @uk-immigration/engine test test/canada --reporter=dot` 通过 8 个文件的 174 项测试，含原时间引擎用例。

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 首次运行退出码为 0。全仓 5,399 项测试通过，1 项既有测试跳过，Next.js 生成 27 个静态页面。四份新增快照的 SHA-256 与 `docs/SOURCES.md` 的登记值逐份匹配。`git diff --check` 通过。

### 3. 没做或没验证的

按本轮要求保留工作区改动，未提交、推送或部署。与 `a6a2883` 比对，原 `evaluateCanada`、其测试、加拿大参数文件和加拿大页面调用点均无差异。页面仍调用原时间引擎。

### 4. 发现与建议

#### 风险

FSW 在获邀时恰好 67 分、仅因递交前生日降到 66 分时，R36 仍可能给出 `NOT_MET`。选拔门槛和年龄分见 SRC-267a “Selection factors” 及 SRC-261b，IRPR ss.76(1)(a)(iv)、81。IRCC 公共政策的 “Conditions” 允许获授权官员在其他条件满足时给予豁免，结果取决于个案决定。本轮仅记录这一风险。[IRCC 获邀后年龄变化公共政策](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/age-based-requirements.html)

## 第六轮审核修正（review85-6）

### 1. 做了什么

建议提交 `Fix: 按联邦收件日核对加拿大警证效期和补件回执，修正 EE 邀请截止日（review85-6）`。对应 PROGRESS 第 568 条。

R26 按每名申请人、每份所需的境外警证核对。本路径联邦收到申请时，现居国警证须在此前六个日历月内签发，恰满六个月可用。原居国警证须覆盖最后一次符合条件的连续居住。收件后的模拟日仅用于核实签发和补件回执是否已经发生。三份新增快照、原文定位和 SHA-256 登记在 SRC-266g–i。[IRCC 警证有效期](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates/when.html)

| R26 适用路径 | 对应清单及审查范围 |
|---|---|
| EE 的 FSW、CEC、FST，以及 Enhanced PNP | SRC-277c 的 “Who needs police certificates” 和 “When the certificate must be issued”。按成年后、递交前十年内的合资格境外停留核对。额外索证按 IRCC 实际要求处理。 |
| Base PNP、魁省技术移民联邦阶段 | SRC-266h、266i 的 IMM 0199、IMM 5690（2026-05）第 3 页第 11 项分别列出现居国及原居国的签发要求。两类申请均可凭居住记录、签发日期和适用的补件回执逐份判定。 |
| 家庭担保 | SRC-274c，Guide 5289 “Police certificates”，结合 SRC-266g 核对成年人符合条件的连续境外居住和警证效期。 |
| AIP | SRC-279b，IMM 0155 第 4 页第 19 项允许先递交，再应要求补交警证。随申请提供的警证按 SRC-266g 核有效期。 |

补件回执保存在对应停留的 `supplementReceipts[路径 ID]`。签发日、申请收件日及该份补件的回执日期须相符。仅有收件后签发的警证、仅填未来日期、或仍有待补要求时，警证材料为 `UNKNOWN`，登记于 PD-245。`outstandingPoliceRequest: false` 表示目前没有未结要求，确认某份补件仍需其回执。其他申请的回执不能证明本申请已收到该份材料。生物识别继续单独核对，并与警证共同决定 R26。

R29 优先采用邀请信列明的截止日。没有信上期限时，依 SRC-269e 第 6 条从签发次日起算，至该起算日之后第 60 天结束，含截止日。此计算修正了第五轮报告中 2026-06-29 收件的预期。[部长指令第 6 条](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-application-management-system/current.html)

### 2. 怎么验证的

在 `7552c21` 上先跑新回归。家庭担保的两份超期警证、AIP 待补和补件已收、两例 R29 备用期限边界共六例失败。修正后的下列回归从 `evaluateCanadaFull` 进入，分别断言单项和整条路径。

| 单项及路径 | 复现输入与结果 |
|---|---|
| R26 与家庭担保 | 成年配偶持续居住境外，2026-10-20 联邦收件，2026-11-23 模拟。09-01、04-20 签发均为 `MET`，04-19、02-01 签发均为 `NOT_MET`。未填总括清单。 |
| R26 与 AIP | 2026-06-10 收件。原居国警证待补为 `UNKNOWN`；07-01 签发、07-02 补件获确认，两者均为 `MET`。仅填 07-01 签发、补件回执早于签发或晚于模拟日、只填未来签发日，均为 `UNKNOWN`。未填总括清单。 |
| R29 与 FSW | 2026-04-29 签发，备用期限从 04-30 起算，06-29 收件为 `MET`，06-30 为 `NOT_MET`。信上若写 06-28，则 06-28 为 `MET`，06-29 为 `NOT_MET`。 |

R26 另覆盖所有七条初次 PR 路径及 PNP 的两种模式，包括总括勾选与已知超期冲突、一份超期而另一份待补、原居国停留尚未结束就签发、仅填未来申请日，以及另一条路径的补件回执。

加拿大定向命令 `pnpm --filter @uk-immigration/engine test test/canada --reporter=dot` 通过 8 个文件、195 项测试，含原时间引擎。首次完整验收发现跨路径参数表的行长度不一致，已统一测试参数。最终代码运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码为 0，全仓 5,420 项测试通过，1 项既有测试跳过，生成 27 个静态页面。三份新快照均与来源登记中的 SHA-256 匹配，两个 PDF 第 3 页的条目已回读。`git diff --check` 通过。

### 3. 没做或没验证的

工作区改动按要求留给 Fable 提交。原时间引擎 `evaluateCanada` 及其参数和网页调用未改。本轮未运行浏览器 e2e 或部署。

### 4. 发现与建议

审核风险第 2 项已记录。FSW 获邀时恰好 67 分，在递交前仅因生日降到 66 分时，R36 仍可能显示 `NOT_MET`。计分依据为 SRC-267a “Selection factors” 和 SRC-261b，IRPR ss.76(1)(a)(iv)、81。符合公共政策其他条件时，获授权官员可决定给予年龄豁免。本轮保留 R36 原判定。[IRCC 年龄豁免公共政策 “Conditions”](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/age-based-requirements.html)

## 第七轮审核修正（review85-7）

### 1. 做了什么

建议提交 `Fix: 统一七条加拿大初次 PR 路径的警证效期与索证信判定（review85-7）`。对应 PROGRESS 第 569 条。

FSW、CEC、FST、PNP（含 Base 与 Enhanced）、魁省技术移民、AIP 和家庭担保的 R26 共用 `policeDocuments`。PNP 未填模式时也按 Base 和 Enhanced 分别核对，两种模式结论一致即可判定，有分歧则为 `UNKNOWN`（PD-245）。以本路径实际联邦收件日核对现居国警证的六个日历月签发窗口和证上有效末日。迪拜警方规定警证自签发起有效三个月，证上末日缺失时按该期限判断；恰逢满三个月当天能否使用，官方说明没有界定，输出 `UNKNOWN`，登记在 PD-245。原居国警证只要在最后一段合资格停留结束后签发，即使在递交前已过期仍可使用。依据 SRC-266g、277c 的现居国及原居国小节、SRC-266k 的服务说明首段末句。[IRCC 警证有效期](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates/when.html) · [迪拜警方证书说明](https://sps.dubaipolice.gov.ae/wps/wcm/connect/DubaiPolice_en/DubaiPolice/Our-Services/Good-Conduct-Certificate?presentationtemplate=DubaiPolice_Design_2_0/details)

按国家或地区指引需要索证信时，每份警证分别记录本次申请的办理阶段。随申请上传说明后等待 IRCC 发信、获信后等待补件，均为 `UNKNOWN`（PD-245）。香港警方按索证信将警证直送 IRCC，IRCC 确认已收到本申请的该份警证即可满足这一材料要求，申请人可以没有签发日。其他尚未办结的索证及本次 PR 生物识别仍独立核对。依据 SRC-266g、277c 的 “If you need a request letter” 及 SRC-266j 香港指引的 “Police certificates and IRCC requirements” 第 1–3 项。[IRCC 香港警证指引](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates/how/hong-kong.html)

### 2. 怎么验证的

两组回归均从 `evaluateCanadaFull` 进入。成年 FSW 申请人的其余实质条件齐全，总括清单留空，2026-10-20 收件，模拟日为 2026-11-23。表中每行分别断言 R26 和 FSW 整条路径。

| 输入 | R26 | FSW |
|---|---|---|
| 现居迪拜，2026-07-01 签发，收件时已超过签发机关的三个月效期 | `NOT_MET` | `NOT_MET` |
| 同一份警证，2026-06-30 已结束最后一段合资格停留，迪拜为原居地 | `MET` | `MET` |
| 现居香港，已随申请上传说明，IRCC 尚未发索证信 | `UNKNOWN` | `UNKNOWN` |
| 已收到索证信，IRCC 仍在等警证 | `UNKNOWN` | `UNKNOWN` |
| 香港警方直送，IRCC 于 2026-11-20 确认收件，本人没有签发日 | `MET` | `MET` |

先在 `de9764c` 运行上述五例，三例失败。修正后五例均通过。FSW 另测递交后才到期、递交时恰满三个月且缺证上末日、证上末日恰为收件日。七条路径的共用测试另核证上末日前后、原居国已过期警证、等信、本路径回执、其他路径回执及未来回执。SRC-266j/k 两份新增官方快照的 SHA-256 均与登记值一致。

加拿大定向命令 `pnpm --filter @uk-immigration/engine test test/canada --reporter=dot` 通过 8 个文件的 204 项测试，含原时间引擎和 PNP 模式缺失回归。

最终代码执行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码为 0。全仓 5,429 项测试通过，1 项既有测试跳过，生成 27 个静态页面。`git diff --check` 通过。

### 3. 没做或没验证的

未提交、推送、部署或运行浏览器 E2E。原时间引擎 `evaluateCanada`、原测试及加拿大页面调用点与 `de9764c` 一致。新增参数仅在完整版使用。

### 4. 发现与建议

后续页面可按每份警证收集签发机关、证上有效末日、按国家指引随本申请上传说明或收到索证信的阶段，以及 IRCC 确认收到该份警证的日期。

## 风险

FSW 申请人获邀时恰好 67 分，若仅因递交前生日降到 66 分，R36 仍可能输出 `NOT_MET`。选拔分及年龄分依据 SRC-267a “Selection factors” 和 SRC-261b，IRPR ss.76(1)(a)(iv)、81。IRCC 公共政策 “Conditions” 允许获授权官员在其他条件满足时给予豁免，本轮仅记录这项风险。[IRCC 获邀后年龄豁免政策](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/age-based-requirements.html)

## 第八轮审核修正（review85-8）

### 1. 做了什么

建议提交 `Fix: 修正补交警证效期与随行子女资格（review85-8）`。

**R26** 以 IRCC 收到该份现居国警证的日期核对两项效期。随申请递交时用本路径的联邦收件日，应要求补交时用同一申请、同一份警证的补件收件日。签发超过六个日历月或证上有效末日已过，均为 `NOT_MET`。迪拜警证未注明末日，且收件恰逢签发满三个月当天，仍为 `UNKNOWN`（PD-245）。六个月窗口见 SRC-266g “How long your police certificate is valid”，迪拜期限见 SRC-266k 服务说明首段末句。AIP 补件依据 SRC-279b IMM 0155 第 4 页第 19 项及 IRCC AIP 指引 “Police certificates and clearances”。通用指引把六个月写在申请提交日，本轮按任务约定将同一窗口用于首次补交该份证书的收件日。[IRCC 警证效期](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates/when.html) · [IRCC AIP 申请指引](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate/permanent-residence.html)

**随行子女**由六条经济类路径的 R25 和家庭担保的 R74 逐人核对。锁龄日未满 22 岁，须自该日起持续无配偶或 common-law partner。审理期间结婚或形成 common-law 关系，即使已如实申报，该子女也失去随行资格。锁龄日已满 22 岁者依另一法定条件核对，须自满 22 岁前持续经济依赖父母，且因身心状况无法经济自立。门槛沿用 `familyChildAge`。依据 SRC-261b，IRPR s.1(3)、s.2 “dependent child” (a)、(b)(i)–(ii)、s.25.1(1)、(3)–(5)，以及 SRC-274c Guide 5289 “Definitions of dependent children”。[IRPR 第 2 条](https://laws-lois.justice.gc.ca/eng/regulations/SOR-2002-227/section-2.html) · [IRCC 家庭担保指南](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5289-sponsor-your-spouse-common-law-partner-conjugal-partner-dependent-child-complete-guide.html)

**十条路径排查清单**

七条初次 PR 路径的 R20 核家属及变更申报，R21–R26 核适用成员的准入、体检、警证及生物识别，R27/R28 按家庭组成估费。申报变更或通过检查后，当前申请仍须逐人满足下表所列的子女资格条件。各路径的法定锁龄时点见 SRC-261b，IRPR s.25.1 对应款及 IRCC 的分项目说明。[IRPR 第 25.1 条](https://laws-lois.justice.gc.ca/eng/regulations/SOR-2002-227/section-25.1.html) · [IRCC 年龄锁定指引及配偶担保、省提名示例](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/age-limit-requirements-dependent-children.html)

| 路径 | 随行子女资格与锁龄日 | 核对过的其他家属事项 |
|---|---|---|
| `CA-EE-FSW` | R25，本项目完整联邦 PR 申请收件日 | R36 的配偶及亲属适应性分数、R38 的家庭人数与资金 |
| `CA-EE-CEC` | R25，本项目完整联邦 PR 申请收件日 | 项目经验和语言条件针对主申请人 |
| `CA-EE-FST` | R25，本项目完整联邦 PR 申请收件日 | R38 的家庭人数与资金 |
| `CA-PNP` | R25，省或地区收到完整提名申请之日，Base、Enhanced 相同 | R45–R47 的省提名、联邦递交及安省邀请，R49 的家属持股 |
| `CA-QC-PSTQ` | R25，魁省收到完整永久甄选申请之日 | R62 家庭资金、R63 随员价值观证明、R64 配偶法语、R69 各随员 CSQ、R70 省费 |
| `CA-AIP` | R25，省收到完整 endorsement 申请之日 | R55 背书、R56 申请人及伴侣的雇主持股、R59 家庭资金 |
| `CA-FAMILY` | R74，完整联邦申请收件日。核直接担保子女，也核配偶或伴侣所带的随行子女，包括境内和魁省担保 | R71–R73、R75 的担保人、伴侣与申请类别，R76–R80 的联邦及魁省承诺、监护、收入、批次及费用 |
| `CA-RESIDENCY` | 已取得 PR，按本人居住义务评估 | R03 可按证据计入境外陪同家属日数 |
| `CA-CITIZENSHIP` | 个人普通入籍，无初次 PR 随行子女资格项 | R06 核签署和未成年代办，R08 核本人可计居住日及例外 |
| `CA-CIT-MINOR-52` | 未成年人本人申请入籍，无初次 PR 随行子女资格项 | R06 核父母身份、亲子关系与签署 |

随行子女及孙辈的资料取自 `federal.members`。伴侣担保只有一名随行子女时，也支持审核复现使用的 `family.child.unmarriedAndUnpartnered`。有多名子女时分别读取各人的答案。缺适用阶段的完整收件日、仅有未来日期或缺决定资格的个人资料时返回 `UNKNOWN`（PD-245）。PNP、AIP 和魁省技术移民分别用 `completeNominationApplicationReceived`、`completeEndorsementApplicationReceived` 和 `completeSelectionApplicationReceived` 记录完整申请的收件日期。

### 2. 怎么验证的

在基线 `4b8b4dd` 上先运行新增的两组公开入口回归，观察到 5 个失败用例。修正后，每种情形均通过 `evaluateCanadaFull` 断言单项及整条路径。

| 公开入口输入 | 单项与整条路径的实际结果 |
|---|---|
| AIP 于 6 月 10 日递交。现居迪拜的同一份警证于 7 月 1 日签发，证上末日为 10 月 1 日 | IRCC 于 9 月 20 日或 10 月 1 日收到时，R26 与 AIP 均为 `MET`。10 月 20 日才收到，两者均为 `NOT_MET` |
| 同一份迪拜警证，未注明证上末日 | 10 月 1 日收到，两者均为 `UNKNOWN`。10 月 20 日收到，两者均为 `NOT_MET` |
| 现居国警证于 4 月 20 日签发，证上末日为次年 4 月 20 日 | 10 月 20 日收到，两者均为 `MET`。10 月 21 日收到，两者均为 `NOT_MET` |
| 魁省外配偶担保于 10 月 20 日完整收件。随行子女出生于 2005 年 1 月 1 日 | 11 月 5 日仍未婚且无 common-law partner，R74 与家庭担保均为 `MET`。11 月 23 日已结婚且已申报，R20 仍为 `MET`，R74 与家庭担保均为 `NOT_MET`。婚姻及伴侣状态缺失时，后两者均为 `UNKNOWN` |

另覆盖多名随行子女答案不同、锁龄后过生日、各经济路径取各自阶段的收件日，以及达到年龄上限后的持续依赖条件。`pnpm --filter @uk-immigration/engine test test/canada --reporter=dot` 通过 8 个文件、221 项测试，包含原时间引擎回归。

全仓验收 `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 首次运行退出码为 0。5,446 项测试通过，1 项既有测试跳过，构建生成 27 个静态页面。`git diff --check` 通过。

### 3. 没做或没验证的

按任务要求，改动保留在工作区，未提交或推送。与 `4b8b4dd` 比对，时间引擎 `evaluateCanada`、原时间测试和加拿大页面均无差异。本轮没有运行浏览器 E2E 或部署。

### 4. 发现与建议

问卷接入完整版时，可在每名随行子女名下询问自锁龄日起是否曾结婚或形成 common-law 关系，以便家庭成员分别作答。

## 风险

R36 仍可能将 FSW 获邀时恰好 67 分、递交前仅因生日降至 66 分的个案判为 `NOT_MET`。分数依据 SRC-267a “Selection factors” 及 SRC-261b，IRPR ss.76(1)(a)(iv)、81。IRCC 公共政策 “Conditions” 允许获授权官员对符合条件的个案给予豁免。本轮按审核意见记录该风险，R36 保持原判定。[IRCC 获邀后年龄豁免政策](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/age-based-requirements.html)

## 第九轮审核修正（review85-9）

### 1. 做了什么

建议提交 `Fix: 逐名核对随行未成年子女监护同意并修正 AIP 补交警证效期（review85-9）`。对应 PROGRESS 第 571 条。

家庭担保 R74 与六条经济类路径的 R25 共用逐名子女检查。受抚养资格沿用各项目锁龄日，监护文件按联邦申请收件时是否未满 18 岁核对，准备申请时按模拟日核对。每名需要另一位法定家长同意的随行子女，有同意或准许迁居的法院文件时为 `MET`。仅附说明待审、缺件或权限不明为 `UNKNOWN`（PD-245）。已明确禁止迁居为 `NOT_MET`。已有证据确认可单独决定迁居、另一位法定家长是担保人或双方均随行时，满足此项。依据 SRC-274g，IMM 5533 **第 6 页第 3 项**，以及 SRC-266h/i 第 3 页第 10 项和 SRC-279b 第 4 页第 18 项。[IRCC 配偶担保清单](https://www.canada.ca/content/dam/ircc/documents/pdf/english/kits/forms/imm5533/01-09-2022/imm5533e.pdf)

逐人答案放在 `federal.members`。只有一名随行子女的伴侣担保也可读取原有的 `family.child.custodyAndConsentReady`。多名子女不能共用这个答案。`false` 表示缺件，明确禁止迁居用 `relocationAuthority: 'prohibited'`。

AIP 的 R26 对应要求补交的现居国警证采用本申请的逐份补件回执。警证通常自签发日起一年有效，同时核对签发机关的较短效期。已知收件时过期为 `NOT_MET`。恰满一年而证上末日不明，或超过通常一年且 IRCC 是否接受仍不明时，为 `UNKNOWN`，已登记 PD-245。AIP 随初次申请提交的警证及其他路径仍按上一轮口径核对。依据 SRC-279e “Police certificates and clearances” 第 1–2 段、SRC-279b 第 4 页第 19 项及 SRC-266g/k。[IRCC AIP 申请指引](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate/permanent-residence.html)

### 2. 怎么验证的

在 `34e709f` 上先运行家庭担保及 AIP 的新回归，观察到 12 项失败，其中包括审核的两个复现输入。修正后的回归从公开入口 `evaluateCanadaFull` 分别断言单项及路径。

| 复现条件 | 单项与路径结果 |
|---|---|
| 魁省外配偶担保，2026-10-20 收件，随行子女出生于 2016-01-01 | 文件齐备时，R74 与家庭担保均为 `MET`。缺件待审或答案缺失时，均为 `UNKNOWN`。明确无权迁居时，均为 `NOT_MET`。 |
| 两名随行未成年子女，第一名材料齐备 | 第二名材料齐备、缺件、明确禁止迁居时，R74 与家庭担保依次为 `MET`、`UNKNOWN`、`NOT_MET`。 |
| AIP 于 2026-06-10 递交，现居国警证 2026-02-01 签发、2027-02-01 到期，IRCC 于 2026-10-20 收到补件 | R26 与 AIP 均为 `MET`。迪拜警证在证上末日收件两者均为 `MET`，末日后收件两者均为 `NOT_MET`。 |

经济类 R25 另覆盖 FSW、CEC、FST、PNP（Base 和 Enhanced）、魁省技术移民及 AIP 的三种监护材料状态。R26 跨路径测试使用同一签发日及补件日，确认六个月以上、通常一年以内的现居国警证仅在 AIP 补件分支适用一年口径。

设置 `VITEST_MAX_WORKERS=2` 后执行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码为 0。全仓 5,463 项测试通过，1 项既有测试跳过，构建生成 27 个静态页面。两份新增官方快照的 SHA-256 与 SRC-274g、SRC-279e 的登记值一致。`git diff --check` 通过。

### 3. 没做或没验证的

按要求留在工作区，未提交。与 `34e709f` 比对，原时间入口 `evaluateCanada`、旧版参数、原时间测试和加拿大页面调用均无差异。

### 4. 发现与建议

审核风险第 2 项仍在。FSW 获邀时恰好 67 分，若在递交前仅因生日降至 66 分，R36 仍可能输出 `NOT_MET`。选拔分依据 SRC-267a “Selection factors” 及 SRC-261b，IRPR ss.76(1)(a)(iv)、81。获授权官员可依公共政策 “Conditions” 审查符合条件的个案并给予年龄豁免。本轮仅记录该风险。[IRCC 获邀后年龄豁免公共政策](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/age-based-requirements.html)

## 第十轮审核修正（review85-10）

### 1. 做了什么

建议提交 `Fix: 修正直接担保子女监护判断与 AIP 首次递交警证效期（review85-10）`。对应 PROGRESS 第 572 条。

R74 复用逐名监护判断，以完整申请收件日锁龄。直接担保的主申请子女在锁龄日已满 18 岁，免核监护文件。未成年人缺件待审为 `UNKNOWN`，已有单独迁居权限为 `MET`，明确禁止迁居为 `NOT_MET`。移民官审查缺件说明的依据见 SRC-274c，Guide 5289 Step 5 “If you’re sponsoring dependent children” 第 3 项。[IRCC 家庭担保指南](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5289-sponsor-your-spouse-common-law-partner-conjugal-partner-dependent-child-complete-guide.html) · [IMM 5534 第 2 页第 6 项](https://www.canada.ca/content/dam/ircc/documents/pdf/english/kits/forms/imm5534/01-09-2022/imm5534e.pdf#page=2)

R26 以 AIP 首次申请收件日核对随附的现居国警证。符合签发机关效期时，签发不超过六个月为 `MET`，超过六个月至满一年当日为 `UNKNOWN`。收件时已过证载末日或签发已超过一年为 `NOT_MET`。通用窗口与 AIP 通常效期在首次递交时如何适用，已登记 PD-245。依据为 SRC-266g “For the country where you currently reside” 第 1 段及 SRC-279e “Police certificates and clearances” 第 2 段。[IRCC 通用警证指引](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates/when.html) · [IRCC AIP 申请指引](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate/permanent-residence.html)

### 2. 怎么验证的

在基线 `c7a6200` 上，新增的 14 个公开入口用例有 9 个失败。另复现了只填证载末日且首次收件时已经过期，结果仍返回 `UNKNOWN` 的情形。修正后，即使缺少签发日，也可凭已过的证载末日判为 `NOT_MET`。最终的 15 个新增用例均通过。`VITEST_MAX_WORKERS=2 pnpm --filter @uk-immigration/engine test test/canada --reporter=dot` 通过 8 个文件、253 项测试。每个新增用例通过 `evaluateCanadaFull` 同时断言 R74 与 `CA-FAMILY` 或 R26 与 `CA-AIP`。其中，2026-10-20 完整收件时当天满 18 岁的子女免核，次日才满 18 岁且缺件的子女仍为 `UNKNOWN`。同日随申请递交 2026-02-01 签发、2027-02-01 到期的现居国警证为 `UNKNOWN`，已有回归验证同一份警证应要求在同日补交为 `MET`。

设置 `VITEST_MAX_WORKERS=2` 后运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码为 0。全仓 5,478 项测试通过、1 项既有测试跳过，构建生成 27 个静态页面。`git diff --check` 通过。

### 3. 没做或没验证的

按要求保留在工作区，未提交。原时间入口 `evaluateCanada`、原时间测试及加拿大页面调用与 `c7a6200` 无差异，原时间测试已通过。

### 4. 发现与建议

审核风险第 2 项留待单独处理。FSW 申请人获邀后因生日失分时，R36 仍可能漏判可由官员审查的年龄豁免，详见本报告第九轮第 4 节。
