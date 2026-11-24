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
| SRC-200 | `AU-186-primary-instalment` |
| SRC-203 | `AU-186-TRT-age` |
| SRC-200、SRC-206、SRC-226（旧版 TOEFL） | `AU-186-TRT-english` |
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
| SRC-200 | `AU-186-primary-instalment` |
| SRC-203 | `AU-186-DE-age` |
| SRC-200、SRC-206、SRC-226（旧版 TOEFL） | `AU-186-DE-english` |
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
| SRC-200 | `AU-lodgement-location`、`AU-grant-location`、`AU-regional-lock`、`AU-189-PT-invitation`、`AU-189-PT-age`、`AU-189-PT-invited-score`、`AU-additional-english`、`AU-PIC-PASSPORT`、`AU-RETURN-5001`、`AU-RETURN-5002`、`AU-PIC-SECURITY`、`AU-PIC-DEBT`、`AU-PIC-TECHNOLOGY`、`AU-PIC-VALUES`、`AU-PIC-INTEGRITY`、`AU-PIC-ESTABLISHMENT`、`AU-PIC-CHILDREN`、`AU-RETURN-5010`、`AU-FEES-APPLICATION` |
| SRC-200、SRC-225 | `AU-189-PT-assessment` |
| SRC-207 | `AU-189-PT-occupation` |
| SRC-200、SRC-206、SRC-226（旧版 TOEFL） | `AU-189-PT-english` |
| SRC-200、SRC-201 | `AU-189-PT-points` |
| SRC-200、SRC-211 | `AU-PIC-CHARACTER` |
| SRC-200、SRC-218 | `AU-PIC-HEALTH` |
| SRC-200、SRC-220 | `AU-PIC-POLICE` |

#### AU-190 · 州或领地提名技术移民（190）

| 来源 | 该路径的条件 ID |
|---|---|
| SRC-200 | `AU-lodgement-location`、`AU-grant-location`、`AU-regional-lock`、`AU-190-invitation`、`AU-190-age`、`AU-190-invited-score`、`AU-190-nomination`、`AU-additional-english`、`AU-PIC-PASSPORT`、`AU-RETURN-5001`、`AU-RETURN-5002`、`AU-PIC-SECURITY`、`AU-PIC-DEBT`、`AU-PIC-VALUES`、`AU-PIC-INTEGRITY`、`AU-PIC-ESTABLISHMENT`、`AU-PIC-CHILDREN`、`AU-RETURN-5010`、`AU-FEES-APPLICATION` |
| SRC-200、SRC-225 | `AU-190-assessment` |
| SRC-207 | `AU-190-occupation` |
| SRC-200、SRC-206、SRC-226（旧版 TOEFL） | `AU-190-english` |
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
| SRC-200、SRC-205、SRC-229（IELTS 总分） | `AU-189-HK-functional-english` |
| SRC-200、SRC-211 | `AU-PIC-CHARACTER` |
| SRC-200、SRC-218、SRC-219 | `AU-PIC-HEALTH` |
| SRC-200、SRC-220 | `AU-PIC-POLICE` |

#### AU-191-HK · 偏远地区永久居留（191 香港类别）

| 来源 | 该路径的条件 ID |
|---|---|
| SRC-062、SRC-200 | `AU-191-HK-time-held`、`AU-191-HK-time-residence`、`AU-191-HK-time-regional` |
| SRC-200 | `AU-lodgement-location`、`AU-grant-location`、`AU-prior-visa-compliance`、`AU-stream-open`、`AU-HK-passport`、`AU-HK-primary-visa`、`AU-additional-english`、`AU-PIC-PASSPORT`、`AU-RETURN-5001`、`AU-RETURN-5002`、`AU-PIC-SECURITY`、`AU-PIC-DEBT`、`AU-PIC-TECHNOLOGY`、`AU-PIC-VALUES`、`AU-PIC-INTEGRITY`、`AU-PIC-ESTABLISHMENT`、`AU-PIC-CHILDREN`、`AU-RETURN-5010`、`AU-FEES-APPLICATION` |
| SRC-200、SRC-205、SRC-229（IELTS 总分） | `AU-191-HK-functional-english` |
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
| SRC-200、SRC-205、SRC-229（IELTS 总分） | `AU-858-functional-english` |
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
| 英语、雇主与技术路径 | 重考、拼分或旧版 TOEFL iBT 口语门槛有分歧（PD-200）、高薪年龄豁免的年度 FWHIT（PD-206）、不规则 TRT 工作记录（PD-207）、AMSR 证据（PD-208）。186 的 CSIT 使用提名递交日期对应的已核实财年。 |
| 打分与邀请 | 实际邀请轮次（PD-209）、获邀后仍待取得职评（PD-210）、州提名未定（PD-211）；858 尚待邀请、成就或额外贡献的实质认定（PD-215）。 |
| 健康、品格与材料 | 自报病史不能代替医官评估。PIC 4007 豁免待裁量（PD-201），品格个案（PD-202）、关键技术风险（PD-203）、警方证明或豁免尚待审理。|
| 地区与香港 | 一般签证条件轻微违反或迟报（PD-204）、地区例外类别待核实、有争议的 ATO 通知（PD-212）、香港类别离境后的通常居住（PD-108）。 |
| 配偶与返澳 | 关系或同情理由证据（PD-213）、境内 Schedule 3 豁免（PD-214）、RRV 实质联系及离境理由（PD-216）。 |
| 入籍 | 赴海外后的持续联系（PD-205）、重考后果（PD-217）、good character（PD-218）、羁押或特殊居住裁量（PD-219），以及身份、安全或其他决定尚无结果。 |

## 2. 怎么验证的

初次交付时执行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码 0。5,384 项测试通过，既有文案导出用例因未设置 `EXPORT_WORDING=1` 跳过 1 项。policy-data 的 23 项测试通过，包含来源一致性测试。引擎 3,364 项通过，其中任务 83 新增 139 项。构建生成 27 个静态页面，并确认 `apps/web/out/australia.html` 存在。

边界用例包括以下结果。

- 191 申请人于 2023-06-30 开始持签，已持有截至 2023、2024、2026 年的评税通知。2026-06-30 递交只计两个已结束财年，次日递交计三个，重复通知不增加计数（SRC-200 191.111、191.222）。
- 190 的 EOI 已有 60 分且仍等提名和邀请时，显示待核实的 5 分；取得适用的提名和邀请后再核对 65 分及邀请信分数（SRC-200 Sch 6D Part 6D.12、190.214–215，SRC-201 s 6）。
- 186 TRT 的年龄豁免已确认，持签与工作还差一天时，若提名在次日仍有效，返回该满期日；提名届时已超期，则不输出整条路径的最早日期（SRC-200 186.221、186.223(5)、186.226–227，SRC-203 s 5）。
- 先逐项检查 RRV 的替代依据，再用合并条件判定；入籍按考试总正确数和价值观分项分别断言，未成年分支、SCV 连续身份和刑事禁令期限都有边界用例（SRC-200 155.212、157.212–213，SRC-061 ss 21–24，SRC-215、SRC-216）。

独立读取调研档案的 `sources.sha256`，逐份比对 29 份新增文件及复用的 3 份同版快照，并核对登记表的文件、哈希、SRC 与链接。初次交付时检查 `git diff` 确认 `apps/web` 下只有来源网址表有改动，原 `evaluateAustralia` 及其测试无改动。

## 3. 没做或没验证的

工作树保留给 Fable 提交。澳大利亚问卷、结果、对比、分享、政策页接线属于任务 93。本次未运行浏览器 e2e，也未部署。覆盖范围为调研档案的 11 条主路径，未将 186 Labour Agreement、已关闭的新申请通道或其他签证扩为独立路径。

## 4. 发现与建议

原文比调研摘要更具体。191.221(1) 对一般签证条件使用「实质遵守」，191.221(2) 则单独要求遵守 8579 或属于文书指定例外。境内 820 的 Sch 1 item 1214C(3)(h) 没有其他技术通道的文书例外。858.227 将 PIC 4020 纳入通常的创新路径。香港通道的双护照家庭也可能适用太平洋费率，现持或曾持 300 者的配偶费率见 item 1124B(2) 各分项。代码与测试按存档法规处理。

任务 93 建议按所选路径展开以下问题，并为未收到官方决定保留单独选项。

1. 申请哪条路径？递交与决定时各在哪里？当前和最后一份实质签证何时生效、何时终止？境内持哪类过桥签？香港通道另问护照和前置主签证的停留权限。
2. 哪天收到本路径邀请？信上截止日及分数是多少？职评由哪个机构针对哪个职业作出、何时出具和到期？英语护照、考种、日期、四科分数、重考及全英语授课经历分别是什么？
3. 技术打分问年龄、各地合资格工作月数、学历、澳洲学习、配偶、专业年、社区语言与州提名。雇主通道先核对提名书上所列的 TRT 或 Direct Entry 分支，每份提名分别问递交及批准日、保证年薪、市场薪资证据、牌照及全职岗位，再问申请人的担保时间及豁免类别。
4. 191 问已备齐原始及修订 ATO 通知的具体财年、地区邮编及生效日、变更和通知间隔、资料或面谈要求的履行情况。香港地区通道另问只在指定地区居住、工作及学习的起始日。
5. 配偶问原合并递交日期及地点、关系起点、注册、共同受抚养子女、既往担保与相关申请日期、担保人记录、临时阶段及关系终止原因。RRV 问前永居或公民身份、取消情况、合资格天数、实质联系、亲属返程签证及离境理由。
6. 哪些家人随行、哪些虽不随行仍须体检？是否已有医官、品格、安全或豁免结论？哪些警方或身份证明已被要求、哪些尚未取得？请分别核对联邦欠款、虚假材料、返澳限制、前签医保和价值观声明。
7. 入籍问 SCV 历史与连续性、时间线仍无法确定的申请日 PR、决定时 PR、考试总正确数及价值观正确数、申请类别、羁押和刑事程序、海外计划与宣誓。费用另问太平洋护照、成年及未成年副申、186 主申是否已获应缴认定、应缴第二期费用的成年副申人数及各自缴费情况、300 签证类别、营业额、入籍优惠卡和免收费资格。

页面应分别显示时间满期、申请条件、预算与批准后事项。澳洲参数含 Schedule 6D 分段表、分科考试表及家庭费率，应按其含义展示，避免把嵌套表直接转换成文本。

## 审核修正（review83-1）

### 1. 做了什么

PROGRESS 第 503 项，建议提交 `Fix: 修正澳洲永居满期日、技术移民打分与职评（review83-1）`。

| 审核输入（模拟日 2026-11-23） | 当日条件 | 整条路径及日期 |
|---|---|---|
| 入籍。2020-01-01 入境持 482，2026-01-01 转 189，无离境，决定时永居已确认 | 时间线确认申请日已是永居，`AU-CIT-pr` 为 `MET`。此前持永居尚不足 12 个月，`AU-CIT-time-permanent` 为 `NOT_MET`。见 SRC-061 ss 21(2)(b)、22(1)(c)。 | `FUTURE`，2027-01-01。满期日两项均为 `MET`。 |
| 190。2023-12-01 起持续持 491，2026-11-15 获邀，邀请截止 2027-01-13 | `AU-regional-lock` 为 `NOT_MET`。见 SRC-200 190.215A。 | `FUTURE`，2026-12-01。满期日重算为 `MET`。若邀请已在前一天失效，整条路径为 `NOT_MET`，无日期。 |
| 155。2025-01-01 起持永居并持续在澳，无其他返程依据 | 五年窗口内已有 691 个合资格日，居住途径和返程依据当前均为 `NOT_MET`。见 SRC-200 155.212(2)、SRC-066 Eligibility。 | `FUTURE`，2027-01-01。当日积满 730 天，两项及路径均为 `MET`。 |
| 189 打分类。获邀时 36 岁、海外合资格工作 8 年、本科、单身，有有效英国护照，未填英语考试 | 已确认 25 + 15 + 15 + 10 = 65 分。英语、法定及格线、邀请信 65 分均为 `MET`。若邀请要求 70 分，法定及格线仍为 `MET`，邀请分数为 `UNKNOWN`。见 SRC-200 reg 1.15C、Sch 6D 及 189.224，SRC-201 s 6。 | 65 分邀请为 `MET`，2026-11-23。70 分邀请仍待英语加分证据，无日期。 |
| 189／190。2026-10-01 获邀，10-15 已取得指定机构对受邀职业的有效正面职评，11-23 递交 | 两条路径的职评项均为 `MET`。法规以获邀时为基准，内政部按 *Thapa* 接受邀请期内取得的合格职评。见 SRC-200 189.222(1)、190.212(1)，SRC-225 的 General Skilled Migration (GSM) visas 小节。 | 两条路径均为 `MET`，2026-11-23。仍等待职评时为 `UNKNOWN`，无日期；已超出适用窗口的职评为 `NOT_MET`。 |

186 的家庭预算区分主申与成年副申。审核案例的单人标准第一期为 AUD 6,140。仅有已超出 Functional English 有效期的 IELTS 时，主申第二期金额待定。内政部正式评定应缴后再计入 AUD 9,800，总额为 AUD 15,940。成年副申应缴费率为每人 AUD 4,890。`fees.chargeablePrimaryApplicant` 记录正式应缴结论，`secondInstalmentPaid` 记录主申是否已缴，供批签前条件 `AU-186-primary-instalment` 使用。见 SRC-200 Sch 1 item 1114B(2)(a)–(b) 第 1–4 行、reg 2.12C(1)。

旧版 TOEFL iBT 在 2023-07-26 至 2024-05-04（含首尾）停认。停认期外，若其他分项均达标、口语为 18–20 分且须靠这次考试证明 Competent English，返回 `UNKNOWN` 并附 PD-200。法规的口语最低分为 18，内政部表 2 为 21。若有效护照已确认满足该项，仍返回 `MET`。见 SRC-206 s 10(5)(c)、SRC-226 表 2。

### 2. 怎么验证的

各复现通过完整版入口断言相应条件、整条路径状态和日期。时间用例在模拟日及满期日分别运行，还检验了邀请提前失效、职评出具及到期边界、申请日永居已失效但此前 12 个月合格等情况。将 `evaluateAustralia` 与修正前的 `54240d2` 逐字段比对，入籍、491、155 和含出境的时间线在中英文下返回一致。

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 首次运行退出码为 0。共 5,392 项测试通过（engine 3,372、game 1,336、web 659、policy-data 23、error-report 2）。原有的文案导出测试按开关跳过 1 项。构建生成 27 个静态页面，已确认 `apps/web/out/australia.html` 非空。SRC-225、SRC-226 的快照正文、SHA-256 及登记网址均已核对。

### 3. 没做或没验证的

186 TRT 高薪年龄豁免继续保留 PD-206。Fair Work Commission 年度公告及门槛页面直接下载均返回 HTTP 403，网页读取年度公告返回 HTTP 429，未取得可归档的官方页面。未登记年度金额 SRC 或加入引擎参数；适用门槛仍应按两个合资格工作年度各自结束时确定（SRC-203 ss 4–5、SRC-212 reg 2.13）。本次未提交、未部署。

### 4. 页面如何使用 `earliestDate`

页面可将该字段标作**预计满足本路径评估条件的日期**。`MET` 给出模拟日，`FUTURE` 给出按录入时间线推算、并在当天重新核对决定性条件后通过的日期；`UNKNOWN` 和 `NOT_MET` 没有该字段。条件列表始终描述原模拟日，所以路径为 `FUTURE` 时仍可看到当天尚未满足的条件。

该日期把申请时和决定时的条件一并纳入模拟，不能据此断言当天才允许递交，也不能预测正式批准日。以 191 为例，合资格财年必须在递交前结束，相应 ATO 原始及修订通知要在审理决定前提供（SRC-200 191.111、191.222）。适用的第二期费用在批签前缴纳（SRC-200 reg 2.12C(1)）。页面应分开标注这几个时点。仅预算缺资料或入籍尚待批准后宣誓，不会推迟该日期。

## 第二轮审核修正（review83-2）

### 1. 做了什么

PROGRESS 第 504 项，建议提交 `Fix: 按分支核对 186 雇主提名并修正 IELTS 总分舍入（review83-2）`。

186 的 `employer.nominations` 按提名书上的 `AU-186-TRT` 或 `AU-186-DE` 分别记录状态、递交日、批准日及岗位条件。每个分支只用本条记录核对岗位、薪资和提名有效期。提供完整清单时，缺少某分支表示该分支没有提名。清单未填或旧数据只有未标类别的提名时，提名项为 `UNKNOWN`，选择展示某条路径也不能补足该材料。法定类别见 SRC-200 卷 2 第 186.223(1)(a)(ii)、186.233(1)(a)(ii) 条。

审核用例省略 `pathway`，模拟日为 2026-11-23。申请人自 2023-11-23 持 482 并全职受雇，有有效职评及四年相关经验，其余条件均满足。单份提名在 2026-07-01 递交、07-10 获批。

| 提名记录 | TRT 提名项 / 路径 | Direct Entry 提名项 / 路径 | 最早日期 |
|---|---|---|---|
| 仅 TRT | `MET` / `MET` | `NOT_MET` / `NOT_MET` | 仅 TRT 为 2026-11-23 |
| 仅 Direct Entry | `NOT_MET` / `NOT_MET` | `MET` / `MET` | 仅 Direct Entry 为 2026-11-23 |
| TRT 已批准，另一份 Direct Entry 已撤回 | `MET` / `MET` | `NOT_MET` / `NOT_MET` | 仅 TRT 为 2026-11-23 |
| 两份分别获批且有效 | `MET` / `MET` | `MET` / `MET` | 均为 2026-11-23 |
| 确认没有提名（空清单） | `NOT_MET` / `NOT_MET` | `NOT_MET` / `NOT_MET` | 均无日期 |
| 旧记录只有状态和日期，类别未知 | `UNKNOWN` / `UNKNOWN` | `UNKNOWN` / `UNKNOWN` | 均无日期 |

858 成年主申请人尚未缴第二期费用时，IELTS 四科 `4 / 4 / 4 / 5` 的均值 4.25 按官方计分规则记作 4.5。只填成绩单总分、只填四科、或同时填两者，Functional English 项和整条路径均为 `MET`。对照组 `4 / 4 / 4 / 4.5` 的均值 4.125 记作 4.0，两项均为 `NOT_MET`。门槛依据是 SRC-205 s 4、s 6(c)、Sch 1 第 2、3 行及旧成绩 s 7(2)。新登记的 SRC-229「Overall band score」提供舍入规则，已保存官方快照并核对 SHA-256。[IELTS 官方计分说明](https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail)

### 2. 怎么验证的

`pnpm --filter @uk-immigration/engine exec vitest run test/australia-full.test.ts -t 'one approved 186|858 functional English uses'` 在修改引擎前复现两处失败。单份 TRT 提名使 Direct Entry 提名项也为 `MET`，补齐 IELTS 四科反使 Functional English 从 `MET` 变为 `NOT_MET`。修正后通过 `evaluateAustraliaFull` 检查各条件、总状态及最早日期。

完整验收 `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 首次运行退出码为 0。共 5,394 项测试通过（engine 3,374、game 1,336、web 659、policy-data 23、error-report 2），原有的文案导出测试按开关跳过 1 项。构建生成 27 个静态页面，已确认 `apps/web/out/australia.html` 非空。

与 `e760774` 对照，只算时间的 `evaluateAustralia`、日期计算依赖、原时间参数 `australia2026_11` 和其测试均无改动。

### 3. 没做或没验证的

186 TRT 高薪年龄豁免保留 `UNKNOWN` 和 PD-206。Fair Work Commission 年度公告及门槛页下载返回 HTTP 403，网页读取公告返回 HTTP 429，官方 benchbook PDF 请求也只收到 HTML 验证页，未取得可归档的官方快照。年度金额未写入参数。后续应按 SRC-203 s 5「Subclass 457/482 worker」(a)–(c)，将两个合资格工作年度的实际收入分别与该工作年度结束时适用的 FWHIT 比较，指数化公式见 SRC-212 reg 2.13。[FWC 年度公告](https://www.fwc.gov.au/about-us/news-and-media/news/increase-application-fee-2026-27)

按本轮要求保留工作树供 Fable 提交。

### 4. 发现与建议

- **189／190 及 858 的邀请各自独立。** 同一份请求中，189 邀请为 11-01 至 11-15，190 邀请为 11-20 至 12-01，共用 11-03 的 IELTS 和 11-16 出具的职评。在 2026-11-23 模拟，189 的邀请、职评、英语、及格线、邀请分数五项均为 `NOT_MET`，190 五项均为 `MET`。移除 190 邀请后，其五项均为 `UNKNOWN`；已确认的 190 州提名项仍为 `MET`。858 只读自己的书面邀请。491 在现有完整版中是已持有的前置签证，用于 191 和地区签证限制，没有独立的获邀、州提名或加分评估。见 `australia-skilled.ts` 的 `pointsChecks`、`innovationChecks` 和 `australia-full.ts` 的 `AU_FULL_PATHWAYS`。
- **职评的职业和获邀时的积分资料仍有共用字段。** 189／190 会按各自邀请核对职评日期和有效期，但 `skills.assessment` 只能表达一个职业的职评。实测 190 的职业与邀请不符时，职业项为 `NOT_MET`，有效的公共职评项仍可为 `MET`，总路径被职业项阻断。工作月数、职业年、学历和配偶等加分也只接收一份预汇总资料。两份邀请涉及不同职业，或两次获邀之间这些事实发生变化时，须按各自申请分别录入才能比较。见 SRC-200 189.222–224、190.212–214、Sch 6D 及 SRC-225 的 General Skilled Migration 小节。
- **缴费和个案健康豁免也可能跨申请计入。** 同时比较时，全局 `secondInstalmentPaid=true` 可满足两个 186 分支的主申缴费项，以及 189-HK、191-HK、858 的 Functional English 或缴费项；成年副申的缴费也共用 `fees.additionalInstalmentsPaid`。`publicInterest.health='waiver-granted'` 可满足多条允许豁免的路径。若缴费收据或决定只属于其中一份申请，其他路径的对应条件会被高估。本轮仅记录这些输入限制。见 SRC-200 reg 2.12C、Sch 1、Sch 4 PIC 4007(2)，以及 `australia-fees.ts` 的 `instalmentChecks` 和 `australia-common.ts` 的健康检查。
- **入籍申请日仍有同日先后顺序风险。** 2020-01-01 获 189，旅行便利期届满后于 2026-11-23 离境并在境外递交，11-25 获 155，12-01 返澳且决定时具永居。实测 `AU-CIT-pr` 和整条路径仍为 `MET`，最早日期为 2026-11-23。显式录入 `citizenship.permanentAtApplication=false` 后，两项均为 `NOT_MET` 且无日期。现有时间线在离境日采用离境前身份，尚未结合明确的境外递交地点区分当天先后。按本轮要求记录该边界。见 SRC-061 ss 5(1)、21(2)(b) 及 SRC-069 s 82(6)。

## 第三轮审核修正（review83-3）

### 1. 做了什么

PROGRESS 第 505 项，建议提交 `Fix: 核对澳洲配偶签永久阶段担保与境内递交限制（review83-3）`。

**永久阶段。** 已排查两条合并申请路径。309→100 的普通路径从合并递交满两年起，须有担保伴侣对 100 的提名。820→801 的普通路径须继续获担保。两者用 `partner.continuingSponsorship` 记录永久阶段所需的证据，首阶段担保获批单独核对。100 因递交时已有长期关系或符合人道条款而提前决定时，未满两年的申请仍可通过。死亡、家庭暴力、子女监护等例外按对应法定证据判断。见 SRC-200 卷 2 第 100.221(2)–(7)、100.226(a)–(b)、801.221(2)(b)–(d)、(5)–(7) 条。

其余从临时签证转永居的路径也已核对。186 TRT 与 Direct Entry 各有本分支的雇主提名检查，190 核对州或领地提名，858 核对 Form 1000。189 打分类核对自己的邀请；491／494→191、189 香港类别和 191 香港类别各自核对前置签证及适用条件。对应法源见上文各路径的条件 ID 与来源。

**境内递交。** 已逐条检查 186 TRT、186 Direct Entry、189 打分类、190、191 普通类别、189 香港类别、191 香港类别、858、820→801 和 155／157 返程签证。每条都核对最近一次入境以来所持签证上限制本次申请的条件。境外递交（包括 309→100）及入籍不适用这项限制。签证类型、移民查验区和 Schedule 3 等要求独立判断。见 SRC-069 ss 41(2)(a)、41(2A)、46(1A)(a)–(d)，SRC-200 卷 1 reg 2.05(4)、(4AA)、(5A) 和卷 3 Sch 8 conditions 8503、8534、8535、8540。[Migration Act 1958 第 46 条](https://www.legislation.gov.au/C1958A00062/2026-10-08/2026-10-08/text/original/epub/OEBPS/document_1/document_1.html)

`noFurtherStay` 记录拟递交时的情况。境内其他条件齐备时，`clear` 或已获豁免的 `waived` 得到 `MET`，`barred` 或豁免仍在审理的 `waiver-pending` 得到 `NOT_MET`，缺少签证条件或豁免资料得到 `UNKNOWN`。同一递交日兼容旧字段 `partner.noFurtherStay`。若配偶合并申请在另一日递交，用该旧字段记录原递交日情况，两个日期的豁免证据各自核对。法规已明确递交效力，漏填个案材料无需新增 PD。

### 2. 怎么验证的

修正前通过 `evaluateAustraliaFull` 复现了两项审核问题。修正后运行 `pnpm --filter @uk-immigration/engine exec vitest run test/australia-{full,family}.test.ts`，99 项通过。

完整验收 `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 首次运行退出码为 0。共 5,400 项测试通过（engine 3,380、game 1,336、web 659、policy-data 23、error-report 2），既有文案导出测试按开关跳过 1 项。构建生成 27 个静态页面，已确认 `apps/web/out/australia.html` 非空。

配偶回归以 2024-11-01 合并递交、2025-06-01 取得 309 或 820、婚姻持续且首阶段担保已批准为共同输入。两条普通路径均得到以下结果。

| 永久阶段提名或担保 | 周年前一天（2026-10-31） | 周年当天（2026-11-01） | 周年后一天（2026-11-02） |
|---|---|---|---|
| 已确认 | `FUTURE`，最早 11-01 | `MET`，最早 11-01 | `MET`，最早 11-02 |
| 明确没有 | `NOT_MET`，无日期 | `NOT_MET`，无日期 | `NOT_MET`，无日期 |
| 未填 | `UNKNOWN`，无日期 | `UNKNOWN`，无日期 | `UNKNOWN`，无日期 |

186 Direct Entry 回归固定模拟日 2026-11-23、同一张境内有效的 600 Sponsored Family 签证（时间线记为 `other-temporary`）、`permissibleOnshoreVisa=true` 和其余资格。该签证须附 8503，见 SRC-200 卷 2 第 600.612 条。未豁免和豁免待批时，`AU-lodgement-location` 及整条路径均为 `NOT_MET`，无日期。豁免情况未填时两者均为 `UNKNOWN`，无日期。已获豁免时两者均为 `MET`，最早日期为当天。另用同一组状态逐条断言境内与境外递交，并检查当前豁免与历史配偶递交记录不会跨日期计入。

### 3. 没做或没验证的

本轮只改完整版引擎。与 `8a5c503` 的文件对照确认，`evaluateAustralia`、其日期依赖、澳洲时间参数及原时间测试均无改动。现有页面仍调用该旧入口。按要求保留工作树，未提交。

### 4. 发现与建议（审核所列风险）

- **入籍申请日与离境日重合。** 永居旅行便利期满后，当天离境并在境外递交、随后持 155 返澳时，时间线仍可能采用离境前的永居身份。已确认递交时失去永居的个案可填 `citizenship.permanentAtApplication=false`。见 SRC-061 ss 5(1)、21(2)(b) 和 SRC-069 s 82(6)。
- **不同申请仍可能共用证据。** 189／190 的邀请分别核对，但职评及积分资料共用。第二期缴费和个案健康豁免也可能跨申请计入。比较不同申请时须分别核实相应证据。186 TRT 高薪年龄豁免仍为 `UNKNOWN`，两个工作年度的门槛留在 PD-206（SRC-203 ss 4–5、SRC-212 reg 2.13）。

## 第四轮审核修正（review83-4）

### 1. 做了什么

PROGRESS 第 506 项。建议提交 `Fix: 按签证类别核对澳洲境内递交限制与配偶签特批等待期（review83-4）`。

完整版新增独立条件 `AU-lodgement-s48`。递交时人在澳洲境内、没有实质签证，且最近一次入境后发生 s 48 所指拒签或撤签时，按申请的签证类别查 reg 2.12。下表逐条列出这三个条件均满足时的结论。各类对应 SRC-200 卷 1 Schedule 1，递交效力见 SRC-069 ss 46(1)(d)(i)、48(1)–(4)。

| 路径 | 签证类别与 Schedule 1 定位 | s 48／reg 2.12 的结果 |
|---|---|---|
| 186 TRT | EN，item 1114B | 未列入，境内递交被阻断。 |
| 186 Direct Entry | EN，item 1114B | 未列入，境内递交被阻断。 |
| 189 Points-tested | SI，item 1137 | 未列入，境内递交被阻断。 |
| 189 香港类别 | SI，item 1137 | 同属 SI，境内递交被阻断。 |
| 190 | SN，item 1138 | reg 2.12(s) 允许。继续核对州提名、邀请及其他条件。 |
| 191 Regional Provisional | PR，item 1139 | 未列入，境内递交被阻断。reg 2.12(t)、(u) 列出的是前置临时签证 PS、PE。 |
| 191 香港地区类别 | PR，item 1139 | 同属 PR，境内递交被阻断。 |
| 858 National Innovation | BX，item 1113 | 未列入，境内递交被阻断。 |
| 820→801 境内配偶 | UK + BS，items 1214C、1124B | 两类分别列在 reg 2.12(a)、(b)。另按原合并递交日核对 item 1124B(3)(e)、(3A) 的申请要求和原有 Schedule 3 条件。 |
| 155／157 Resident Return | BB，item 1128 | 两个子类同属 BB，境内递交均被阻断。 |
| 309→100 境外配偶 | UF + BC，items 1220A、1129 | 在境外合并递交，s 48 不适用。 |
| 入籍 | Citizenship Act 2007 s 21（SRC-061） | 入籍申请无需核对这项签证递交限制。 |

`section48History` 区分没有相关记录、法定拒签、法定撤签。包括复审中的普通拒签。过桥签拒签、品格条款拒签、指定撤签条款及持过桥签出入境的认定见 SRC-069 的 s 48 定位。实质签证身份取递交日的有效签证记录，允许持 Bridging A／B／C 递交和 8503 豁免各自单独核对。对未列入的类别，决定结果所需的拒签、撤签或持签记录缺失时，该项为 `UNKNOWN`。境内配偶已有历史递交日时，`partner.section48History` 与 `partner.onshoreStatus` 记录当时情况。

境内配偶的 `partner.section48LodgementRequirementsMet` 指适用 s 48 时，最近入境后无指定配偶拒签、递交时已交伴侣签署的指定表格及两份六周内作出的合资格法定声明，或符合受抚养子女条款。明确缺件为 `NOT_MET`，尚未核实为 `UNKNOWN`。见 SRC-200 卷 1 Sch 1 item 1124B(3)(e)(i)–(iii)、(3A)。

309→100 和 820→801 用 `partner.temporaryGrant.basis` 区分普通授签（`ordinary`）和部长特批（`ministerial`）。普通等待期从合并递交日起算，特批从 `decisionDate` 起算。未填授签依据或特批决定日，等待项为 `UNKNOWN`。模拟会在相应周年日复核其余条件。长期关系、人道与关系终止例外仍按各自条款判断。(2A) 要求与担保伴侣保持关系；普通分支的 100 提名和 801 持续担保仍分别核对。见 SRC-200 卷 2 第 100.221(2)、(2A)、(3)–(7)、100.226(a)–(b)、801.221(2)、(2A)、(5)–(7) 条。

### 2. 怎么验证的

修正前通过完整版入口复现了境内 186 DE 误判为 `MET`，以及 309、820 特批均提前在原递交周年显示满期。修正后用同一申请人、同一时间线和同一套申请材料做了以下对照。

| 模拟输入 | 实际结果 |
|---|---|
| 2026-11-23 境内。实质签证于 10-31 到期，11-01 起只持 Bridging A，普通学生签拒签仍在复审，8503 已排除，分别备齐 186 DE 和 190 其他材料 | 186 DE 仅 s 48 一项为 `NOT_MET`，整条路径无日期。190 为 `MET`，日期为 11-23。只撤回州提名后，190 的 s 48 项仍为 `MET`，整条路径为 `NOT_MET` 且无日期。 |
| 同一份时间线改为法定撤签，并同时评估全部路径 | EN、SI、PR、BX、BB 的 s 48 项均为 `NOT_MET`。SN、境内 UK／BS 为 `MET`。入籍结果没有该项。 |
| 普通 309／820 合并递交于 2024-11-01，其他条件齐备 | 2026-10-31 为 `FUTURE`，最早为 11-01。周年当天为 `MET`。 |
| 相同合并递交日，改为部长在 2025-05-15 决定授签，签证时间线从 06-01 生效 | 两条路径在 2026-11-01 和 2027-05-14 均为 `FUTURE`，最早为 2027-05-15。05-15 当天及次日均为 `MET`。省略授签依据或特批决定日，两条路径均为 `UNKNOWN`，无日期。 |

针对性测试 `pnpm --filter @uk-immigration/engine exec vitest run test/australia-{family,full}.test.ts` 通过 105 项。用 `git show 1f82fe5:packages/engine/src/australia.ts` 取出基线，对普通 309、普通 820、拒签后持过桥签、永居旅行便利期满同日离境四组时间线，分别比较中英文输出。`evaluateAustralia` 的八组完整结果逐字段一致。SRC-069 卷 1、SRC-200 卷 1 与卷 2 的归档 SHA-256 均与登记值一致。

最终工作树运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码为 0。测试共 5,406 项通过（engine 3,386、game 1,336、web 659、policy-data 23、error-report 2），既有文案导出测试按开关跳过 1 项。构建生成 27 个静态页面，已确认 `apps/web/out/australia.html` 非空。早期验收发现并修正了两处测试夹具类型错误；最终验收使用默认 worker 数。

### 3. 没做或没验证的

本轮仅修改完整版规则。缺少个案材料时保留 `UNKNOWN`。本轮涉及的法律条件和等待期均有明确官方条款，无需新增 PD。工作树留给 Fable 提交。

### 4. 发现与建议

- 永居旅行便利期满后，同日离境并在境外递交入籍，现有时间线仍可能沿用离境前身份。已知递交时失去永居时，可填 `citizenship.permanentAtApplication=false`。见 SRC-061 ss 5(1)、21(2)(b) 和 SRC-069 s 82(6)。
- 同时比较不同申请时，职评、获邀时的积分资料、第二期缴费和个案健康豁免仍可能共用证据。须按各申请分别核实。186 TRT 高薪年龄豁免所用的年度门槛仍列于 PD-206。
