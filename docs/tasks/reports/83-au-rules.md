# 任务 83 · 澳大利亚完整版规则引擎

## 1. 做了什么

新增 `evaluateAustraliaFull(request): CountryResult`。默认返回全部 11 条路径，传入 `pathway` 可只评估其中一条。规则集为 `au.current-law-2026-11`，政策核对日为 2026-11-23。条件 ID 在中英文和不同情景间保持一致。现有澳大利亚页面与时间引擎继续使用原入口。

| PROGRESS | 建议 commit message | 文件 |
|---|---|---|
| 500 | `Docs: 登记澳大利亚完整版官方来源与待定细节` | `policy-sources/` 下本次新增的 29 份澳洲快照、`docs/SOURCES.md`、`docs/pending-details.md`、`apps/web/lib/sources.ts`、`PROGRESS.md` 第 500 项 |
| 501 | `Feat: 登记澳大利亚完整版规则集与可追溯参数` | `packages/policy-data/src/{types,index}.ts`、`packages/policy-data/src/parameters/{index,australia-2026-11}.ts`、`PROGRESS.md` 第 501 项 |
| 502 | `Feat: 实现澳大利亚十一条路径的完整评估与边界测试` | `packages/engine/src/index.ts`、`packages/engine/src/australia-{check,common,family,fees,full,skilled}.ts`、`packages/engine/test/australia-{common,family,full,skilled}.test.ts`、本报告、`PROGRESS.md` 第 502 项 |

三组提交均由 Fable 代办，末尾使用 `Co-Authored-By: Codex gpt-6.2-astra <noreply@openai.com>`。

### 路径与判定方式

| 路径 | 本次评估的主要问题 |
|---|---|
| 186 TRT、186 Direct Entry | 原担保工作年限或直接申请的相关经验、年龄豁免、职业匹配、职评或牌照、英语、提名有效性、保证年薪、市场薪资及雇主承担的费用。 |
| 189 Points-tested、190 | 分别按获邀日核对年龄、英语、职业清单、职评和 Schedule 6D 分数，同时核对实际邀请的分数与期限。190 另核对州提名及是否撤回。 |
| 191 Regional Provisional | 前置签证、居住工作学习地点、地址变更、资料请求、签证履约及各已结束财年的 ATO 通知。收入金额不参与现行计算。 |
| 189 Hong Kong、191 Hong Kong (Regional) | 香港特区或 BN(O) 护照、主签证批文、持续持签、通常居住、前签合规、Functional English 或第二期费用。191 香港类别另检查地区限制。 |
| Partner 820→801、309→100 | 原合并递交的地点、婚姻或事实伴侣、担保资格与历史、境内签证障碍、临时阶段、永久阶段等候及关系终止后的法定例外。 |
| 858 National Innovation | 书面邀请、成就及领域一致、Form 1000 提名、特定年龄额外贡献，或法定安全协助替代依据。 |
| 155/157 Resident Return | 先核对当前或前永居、前公民身份，再按居住天数、实质联系、家庭或 157 短期返程等替代依据判断。 |
| Citizenship by conferral | s 21(2)–(5) 分支、SCV 身份、居住、考试及价值观分项、身份、品格、安全、刑事禁令、决定时所在地、定居意图和批准后的宣誓。 |

每项资格条件均有本地化说明和可回查的 SRC 定位。预算不完整不会阻断资格；适用的第二期费用是否已缴另作判断。RRV 的替代依据按“满足其中一项”合并。宣誓属于入籍获批后的阶段。仅剩时间条件时，引擎复核预计满期日当天的条件，以免今天有效的提名或语言成绩在届时已经失效。

### 条件 ID 与来源

以下按路径列出条件 ID。同一 ID 可以出现在多条路径；申请类别、所在地和家庭情况决定哪些条件适用。每个条件在引擎输出的 `sources[].locator` 中给出进一步的条款或官方页面小节。

#### AU-186-TRT · 雇主担保永久居留（186 临时居留过渡）

| 来源 | 该路径的条件 ID |
|---|---|
| SRC-062、SRC-064、SRC-069、SRC-200 | `AU-186-TRT-time-held` |
| SRC-062、SRC-064、SRC-200 | `AU-186-TRT-time-work` |
| SRC-064、SRC-200 | `AU-186-TRT-time-current` |
| SRC-200 | `AU-lodgement-location`、`AU-grant-location`、`AU-186-TRT-nomination`、`AU-186-TRT-position`、`AU-186-TRT-licence`、`AU-186-TRT-sponsor-conduct`、`AU-186-TRT-occupation`、`AU-186-TRT-skills-demonstration`、`AU-additional-english`、`AU-PIC-PASSPORT`、`AU-RETURN-5001`、`AU-RETURN-5002`、`AU-PIC-SECURITY`、`AU-PIC-DEBT`、`AU-PIC-TECHNOLOGY`、`AU-PIC-VALUES`、`AU-PIC-INTEGRITY`、`AU-PIC-ESTABLISHMENT`、`AU-PIC-CHILDREN`、`AU-RETURN-5010`、`AU-FEES-APPLICATION` |
| SRC-203 | `AU-186-TRT-age` |
| SRC-200、SRC-206 | `AU-186-TRT-english` |
| SRC-214 | `AU-186-TRT-salary` |
| SRC-210 | `AU-186-TRT-market-salary` |
| SRC-064 | `AU-186-TRT-primary-visa` |
| SRC-200、SRC-211 | `AU-PIC-CHARACTER` |
| SRC-200、SRC-218、SRC-219 | `AU-PIC-HEALTH` |
| SRC-200、SRC-220 | `AU-PIC-POLICE` |
| SRC-200、SRC-204 | `AU-FEES-EMPLOYER` |

#### AU-186-DE · 雇主担保永久居留（186 直接申请）

| 来源 | 该路径的条件 ID |
|---|---|
| SRC-200 | `AU-lodgement-location`、`AU-grant-location`、`AU-regional-lock`、`AU-186-DE-nomination`、`AU-186-DE-position`、`AU-186-DE-licence`、`AU-186-DE-sponsor-conduct`、`AU-186-DE-assessment`、`AU-186-DE-experience`、`AU-additional-english`、`AU-PIC-PASSPORT`、`AU-RETURN-5001`、`AU-RETURN-5002`、`AU-PIC-SECURITY`、`AU-PIC-DEBT`、`AU-PIC-TECHNOLOGY`、`AU-PIC-VALUES`、`AU-PIC-INTEGRITY`、`AU-PIC-ESTABLISHMENT`、`AU-PIC-CHILDREN`、`AU-RETURN-5010`、`AU-FEES-APPLICATION` |
| SRC-203 | `AU-186-DE-age` |
| SRC-200、SRC-206 | `AU-186-DE-english` |
| SRC-214 | `AU-186-DE-salary` |
| SRC-210 | `AU-186-DE-market-salary` |
| SRC-208 | `AU-186-DE-occupation` |
| SRC-200、SRC-211 | `AU-PIC-CHARACTER` |
| SRC-200、SRC-218 | `AU-PIC-HEALTH` |
| SRC-200、SRC-220 | `AU-PIC-POLICE` |
| SRC-200、SRC-204 | `AU-FEES-EMPLOYER` |

#### AU-189-PT · 独立技术移民（189 打分类）

| 来源 | 该路径的条件 ID |
|---|---|
| SRC-200 | `AU-lodgement-location`、`AU-grant-location`、`AU-regional-lock`、`AU-189-PT-invitation`、`AU-189-PT-age`、`AU-189-PT-assessment`、`AU-189-PT-invited-score`、`AU-additional-english`、`AU-PIC-PASSPORT`、`AU-RETURN-5001`、`AU-RETURN-5002`、`AU-PIC-SECURITY`、`AU-PIC-DEBT`、`AU-PIC-TECHNOLOGY`、`AU-PIC-VALUES`、`AU-PIC-INTEGRITY`、`AU-PIC-ESTABLISHMENT`、`AU-PIC-CHILDREN`、`AU-RETURN-5010`、`AU-FEES-APPLICATION` |
| SRC-207 | `AU-189-PT-occupation` |
| SRC-200、SRC-206 | `AU-189-PT-english` |
| SRC-200、SRC-201 | `AU-189-PT-points` |
| SRC-200、SRC-211 | `AU-PIC-CHARACTER` |
| SRC-200、SRC-218 | `AU-PIC-HEALTH` |
| SRC-200、SRC-220 | `AU-PIC-POLICE` |

#### AU-190 · 州或领地提名技术移民（190）

| 来源 | 该路径的条件 ID |
|---|---|
| SRC-200 | `AU-lodgement-location`、`AU-grant-location`、`AU-regional-lock`、`AU-190-invitation`、`AU-190-age`、`AU-190-assessment`、`AU-190-invited-score`、`AU-190-nomination`、`AU-additional-english`、`AU-PIC-PASSPORT`、`AU-RETURN-5001`、`AU-RETURN-5002`、`AU-PIC-SECURITY`、`AU-PIC-DEBT`、`AU-PIC-VALUES`、`AU-PIC-INTEGRITY`、`AU-PIC-ESTABLISHMENT`、`AU-PIC-CHILDREN`、`AU-RETURN-5010`、`AU-FEES-APPLICATION` |
| SRC-207 | `AU-190-occupation` |
| SRC-200、SRC-206 | `AU-190-english` |
| SRC-200、SRC-201 | `AU-190-points` |
| SRC-200、SRC-211 | `AU-PIC-CHARACTER` |
| SRC-200、SRC-218 | `AU-PIC-HEALTH` |
| SRC-200、SRC-220 | `AU-PIC-POLICE` |

#### AU-191 · 偏远地区永久居留（191 临时签证转永居）

| 来源 | 该路径的条件 ID |
|---|---|
| SRC-062、SRC-063、SRC-200 | `AU-191-time-held` |
| SRC-200 | `AU-lodgement-location`、`AU-grant-location`、`AU-prior-visa-compliance`、`AU-stream-open`、`AU-191-change-notice`、`AU-191-evidence`、`AU-PIC-PASSPORT`、`AU-RETURN-5001`、`AU-RETURN-5002`、`AU-PIC-SECURITY`、`AU-PIC-DEBT`、`AU-PIC-TECHNOLOGY`、`AU-PIC-VALUES`、`AU-PIC-INTEGRITY`、`AU-PIC-ESTABLISHMENT`、`AU-PIC-CHILDREN`、`AU-RETURN-5010`、`AU-FEES-APPLICATION` |
| SRC-200、SRC-202 | `AU-191-regional-activity` |
| SRC-063、SRC-200 | `AU-191-tax-notices` |
| SRC-200、SRC-211 | `AU-PIC-CHARACTER` |
| SRC-200、SRC-218、SRC-219 | `AU-PIC-HEALTH` |
| SRC-200、SRC-220 | `AU-PIC-POLICE` |

#### AU-189-HK · 独立技术移民（189 香港类别）

| 来源 | 该路径的条件 ID |
|---|---|
| SRC-062、SRC-200 | `AU-189-HK-time-held`、`AU-189-HK-time-residence` |
| SRC-200 | `AU-lodgement-location`、`AU-grant-location`、`AU-prior-visa-compliance`、`AU-stream-open`、`AU-HK-passport`、`AU-HK-primary-visa`、`AU-additional-english`、`AU-PIC-PASSPORT`、`AU-RETURN-5001`、`AU-RETURN-5002`、`AU-PIC-SECURITY`、`AU-PIC-DEBT`、`AU-PIC-TECHNOLOGY`、`AU-PIC-VALUES`、`AU-PIC-INTEGRITY`、`AU-PIC-ESTABLISHMENT`、`AU-PIC-CHILDREN`、`AU-FEES-APPLICATION` |
| SRC-200、SRC-205 | `AU-189-HK-functional-english` |
| SRC-200、SRC-211 | `AU-PIC-CHARACTER` |
| SRC-200、SRC-218、SRC-219 | `AU-PIC-HEALTH` |
| SRC-200、SRC-220 | `AU-PIC-POLICE` |

#### AU-191-HK · 偏远地区永久居留（191 香港类别）

| 来源 | 该路径的条件 ID |
|---|---|
| SRC-062、SRC-200 | `AU-191-HK-time-held`、`AU-191-HK-time-residence`、`AU-191-HK-time-regional` |
| SRC-200 | `AU-lodgement-location`、`AU-grant-location`、`AU-prior-visa-compliance`、`AU-stream-open`、`AU-HK-passport`、`AU-HK-primary-visa`、`AU-additional-english`、`AU-PIC-PASSPORT`、`AU-RETURN-5001`、`AU-RETURN-5002`、`AU-PIC-SECURITY`、`AU-PIC-DEBT`、`AU-PIC-TECHNOLOGY`、`AU-PIC-VALUES`、`AU-PIC-INTEGRITY`、`AU-PIC-ESTABLISHMENT`、`AU-PIC-CHILDREN`、`AU-RETURN-5010`、`AU-FEES-APPLICATION` |
| SRC-200、SRC-205 | `AU-191-HK-functional-english` |
| SRC-200、SRC-211 | `AU-PIC-CHARACTER` |
| SRC-200、SRC-218、SRC-219 | `AU-PIC-HEALTH` |
| SRC-200、SRC-220 | `AU-PIC-POLICE` |

#### AU-PARTNER · 配偶移民（820 → 801 或 309 → 100）

| 来源 | 该路径的条件 ID |
|---|---|
| SRC-200 | `AU-grant-location`、`AU-regional-lock`、`AU-PARTNER-relationship`、`AU-PARTNER-evidence`、`AU-PARTNER-sponsor-status`、`AU-PARTNER-sponsorship-history`、`AU-PARTNER-parent-visa`、`AU-PARTNER-humanitarian-bar`、`AU-PARTNER-sponsor-offences`、`AU-PARTNER-disclosure`、`AU-PARTNER-sponsorship`、`AU-PARTNER-location`、`AU-PARTNER-onshore-status`、`AU-PARTNER-temporary-stage`、`AU-PARTNER-continuity`、`AU-PARTNER-time`、`AU-PIC-PASSPORT`、`AU-RETURN-5001`、`AU-RETURN-5002`、`AU-PIC-SECURITY`、`AU-PIC-DEBT`、`AU-PIC-VALUES`、`AU-PIC-INTEGRITY`、`AU-PIC-SETTLEMENT`、`AU-PIC-CHILDREN`、`AU-FEES-APPLICATION` |
| SRC-200、SRC-211 | `AU-PIC-CHARACTER` |
| SRC-200、SRC-218、SRC-219 | `AU-PIC-HEALTH` |
| SRC-200、SRC-220 | `AU-PIC-POLICE` |

#### AU-858 · 国家创新签证（858）

| 来源 | 该路径的条件 ID |
|---|---|
| SRC-200 | `AU-lodgement-location`、`AU-grant-location`、`AU-regional-lock`、`AU-858-invitation`、`AU-858-achievement`、`AU-858-invited-field`、`AU-858-nominator`、`AU-858-age-benefit`、`AU-additional-english`、`AU-PIC-PASSPORT`、`AU-RETURN-5001`、`AU-RETURN-5002`、`AU-PIC-SECURITY`、`AU-PIC-DEBT`、`AU-PIC-TECHNOLOGY`、`AU-PIC-VALUES`、`AU-PIC-INTEGRITY`、`AU-PIC-SETTLEMENT`、`AU-PIC-ESTABLISHMENT`、`AU-PIC-CHILDREN`、`AU-RETURN-5010`、`AU-FEES-APPLICATION` |
| SRC-200、SRC-205 | `AU-858-functional-english` |
| SRC-200、SRC-211 | `AU-PIC-CHARACTER` |
| SRC-200、SRC-218、SRC-219 | `AU-PIC-HEALTH` |
| SRC-200、SRC-220 | `AU-PIC-POLICE` |

#### AU-RRV · 居民返程签证（155 或 157）

| 来源 | 该路径的条件 ID |
|---|---|
| SRC-200 | `AU-RRV-status`、`AU-RRV-valid-application`、`AU-RRV-clearance`、`AU-RRV-option-residence`、`AU-RRV-option-ties`、`AU-RRV-option-family`、`AU-RRV-option-short`、`AU-RRV-basis`、`AU-PIC-PASSPORT`、`AU-RETURN-5001` |
| SRC-066、SRC-211 | `AU-PIC-CHARACTER` |
| SRC-066、SRC-200 | `AU-FEES-APPLICATION` |

#### AU-CITIZENSHIP · 授予澳大利亚公民身份

| 来源 | 该路径的条件 ID |
|---|---|
| SRC-061 | `AU-CIT-branch`、`AU-CIT-pr`、`AU-CIT-confinement`、`AU-CIT-understanding`、`AU-CIT-minor-evidence`、`AU-CIT-character`、`AU-CIT-identity`、`AU-CIT-security`、`AU-CIT-criminal-bars`、`AU-CIT-prior-cessation`、`AU-CIT-intention`、`AU-CIT-at-approval`、`AU-CIT-pledge` |
| SRC-061、SRC-068、SRC-216 | `AU-CIT-time-arrival`、`AU-CIT-time-absences` |
| SRC-061、SRC-216 | `AU-CIT-time-lawful`、`AU-CIT-time-recent-absences` |
| SRC-061、SRC-069、SRC-216 | `AU-CIT-time-permanent` |
| SRC-215 | `AU-CIT-test` |
| SRC-067 | `AU-CIT-police` |
| SRC-061、SRC-209、SRC-215、SRC-217 | `AU-FEES-APPLICATION` |

### 新增来源与待定事项

- SRC-200 为 Migration Regulations 1994 Compilation 292 卷 1–3。SRC-201–208 为及格线、地区、雇主豁免、SAF 税、英语及职业清单文书。SRC-209–213 为入籍条例、市场薪资文书、Migration Act 卷 2、Fair Work Regulations 与 Health Insurance Act。SRC-214–221 为内政部薪资、考试、SCV、收费表、健康、品格及签证费率资料。Form 1298i 的文件到网址对应见 SRC-217 备注。
- SRC-061–069 继续支持既有时间规则。SRC-061、068、069 的同版快照与档案哈希一致。SRC-063–067 各复用原编号登记新抓取，SRC-062 的历史汇编继续支持时间算法。
- PD-200–218 对应档案 PD-AU-01–19。PD-219 单列入籍特殊居住及服役替代依据。PD-084 是入籍出入境当天计法，PD-085 是 TRT 跨段持签与工作日数，PD-108 是香港通道通常居住。各条原文与引擎处理见 `docs/pending-details.md`。

### 哪些情况仍为 UNKNOWN

| 范围 | 何时仍须确认 |
|---|---|
| 问卷资料 | 没有日期、签证、旅行史、家庭人数、考试或评估证据时，相关检查指出需要的资料。单纯漏填不会新建政策 PD。缺少某项费用资料只影响预算。 |
| 英语、雇主与技术路径 | 考试重考或拼分（PD-200）、高薪年龄豁免的年度 FWHIT（PD-206）、不规则 TRT 工作记录（PD-207）、AMSR 证据（PD-208）。186 的 CSIT 使用提名递交日期对应的已核实财年。 |
| 打分与邀请 | 实际邀请轮次（PD-209）、获邀后才补职评（PD-210）、州提名未定（PD-211）；858 尚待邀请、成就或额外贡献的实质认定（PD-215）。 |
| 健康、品格与材料 | 自报病史不能代替医官评估。PIC 4007 豁免待裁量（PD-201），品格个案（PD-202）、关键技术风险（PD-203）、警方证明或豁免尚待审理。|
| 地区与香港 | 一般签证条件轻微违反或迟报（PD-204）、地区例外类别待核实、有争议的 ATO 通知（PD-212）、香港类别离境后的通常居住（PD-108）。 |
| 配偶与返澳 | 关系或同情理由证据（PD-213）、境内 Schedule 3 豁免（PD-214）、RRV 实质联系及离境理由（PD-216）。 |
| 入籍 | 赴海外后的持续联系（PD-205）、重考后果（PD-217）、good character（PD-218）、羁押或特殊居住裁量（PD-219），以及身份、安全或其他决定尚无结果。 |

## 2. 怎么验证的

最终工作树执行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码 0。5,384 项测试通过，既有文案导出用例因未设置 `EXPORT_WORDING=1` 跳过 1 项。policy-data 的 23 项测试通过，包含来源一致性测试。引擎 3,364 项通过，其中任务 83 新增 139 项。构建生成 27 个静态页面，并确认 `apps/web/out/australia.html` 存在。

边界用例包括以下结果。

- 191 申请人于 2023-06-30 开始持签，已持有截至 2023、2024、2026 年的评税通知。2026-06-30 递交只计两个已结束财年，次日递交计三个，重复通知不增加计数（SRC-200 191.111、191.222）。
- 190 的 EOI 已有 60 分且仍等提名和邀请时，显示待核实的 5 分；取得适用的提名和邀请后再核对 65 分及邀请信分数（SRC-200 Sch 6D Part 6D.12、190.214–215，SRC-201 s 6）。
- 186 TRT 的年龄豁免已确认，持签与工作还差一天时，若提名在次日仍有效，返回该满期日；提名届时已超期，则不输出整条路径的最早日期（SRC-200 186.221、186.223(5)、186.226–227，SRC-203 s 5）。
- 先逐项检查 RRV 的替代依据，再用合并条件判定；入籍按考试总正确数和价值观分项分别断言，未成年分支、SCV 连续身份和刑事禁令期限都有边界用例（SRC-200 155.212、157.212–213，SRC-061 ss 21–24，SRC-215、SRC-216）。

独立读取调研档案的 `sources.sha256`，逐份比对 29 份新增文件及复用的 3 份同版快照，并核对登记表的文件、哈希、SRC 与链接。检查 `git diff` 确认 `apps/web` 下只有来源网址表有改动，原 `evaluateAustralia` 及其测试无改动。

## 3. 没做或没验证的

工作树保留给 Fable 提交。澳大利亚问卷、结果、对比、分享、政策页接线属于任务 93。本次未运行浏览器 e2e，也未部署。覆盖范围为调研档案的 11 条主路径，未将 186 Labour Agreement、已关闭的新申请通道或其他签证扩为独立路径。

## 4. 发现与建议

原文比调研摘要更具体。191.221(1) 对一般签证条件使用「实质遵守」，191.221(2) 则单独要求遵守 8579 或属于文书指定例外。境内 820 的 Sch 1 item 1214C(3)(h) 没有其他技术通道的文书例外。858.227 将 PIC 4020 纳入通常的创新路径。香港通道的双护照家庭也可能适用太平洋费率，现持或曾持 300 者的配偶费率见 item 1124B(2) 各分项。代码与测试按存档法规处理。

任务 93 建议按所选路径展开以下问题，并为未收到官方决定保留单独选项。

1. 申请哪条路径？递交与决定时各在哪里？当前和最后一份实质签证何时生效、何时终止？境内持哪类过桥签？香港通道另问护照和前置主签证的停留权限。
2. 哪天收到本路径邀请？信上截止日及分数是多少？职评由哪个机构针对哪个职业作出、何时出具和到期？英语护照、考种、日期、四科分数、重考及全英语授课经历分别是什么？
3. 技术打分问年龄、各地合资格工作月数、学历、澳洲学习、配偶、专业年、社区语言与州提名。雇主通道另问提名递交及批准日、保证年薪、市场薪资证据、牌照、全职岗位、担保时间及豁免类别。
4. 191 问已备齐原始及修订 ATO 通知的具体财年、地区邮编及生效日、变更和通知间隔、资料或面谈要求的履行情况。香港地区通道另问只在指定地区居住、工作及学习的起始日。
5. 配偶问原合并递交日期及地点、关系起点、注册、共同受抚养子女、既往担保与相关申请日期、担保人记录、临时阶段及关系终止原因。RRV 问前永居或公民身份、取消情况、合资格天数、实质联系、亲属返程签证及离境理由。
6. 哪些家人随行、哪些虽不随行仍须体检？是否已有医官、品格、安全或豁免结论？哪些警方或身份证明已被要求、哪些尚未取得？请分别核对联邦欠款、虚假材料、返澳限制、前签医保和价值观声明。
7. 入籍问 SCV 历史与连续性、申请及决定两时点的 PR、考试总正确数及价值观正确数、申请类别、羁押和刑事程序、海外计划与宣誓。费用另问太平洋护照、成年及未成年副申、需缴第二期费用的人数及缴费情况、300 签证类别、营业额、入籍优惠卡和免收费资格。

页面应分别显示时间满期、申请条件、预算与批准后事项。澳洲参数含 Schedule 6D 分段表、分科考试表及家庭费率，应按其含义展示，避免把嵌套表直接转换成文本。
