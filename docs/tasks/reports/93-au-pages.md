# 任务 93 · 澳大利亚完整版页面

## 1. 做了什么（按 commit 列）

| PROGRESS | Commit | 文件 |
|---|---|---|
| 510 | `Feat: 接入澳大利亚十一条路径的完整版问卷、结果、对比与政策页` | `apps/web/app/australia/australia-content.tsx`、`apps/web/app/australia/{simulate,result,whatif,policy}/`、`apps/web/lib/australia-{draft,fields,module,policy,policy-rules,whatif}.ts`、删除旧 `apps/web/lib/australia.ts`、`apps/web/lib/{share,site-countries}.ts`、`apps/web/components/{policy-page,questionnaire-shell,result-page,share-link,site-shell,whatif-lab}.tsx`、`apps/web/i18n/{zh-CN,en}.ts`、`apps/web/i18n/countries/australia{,-form,-module}.ts`、`PROGRESS.md` 第 510 项 |
| 511 | `Test: 验证澳大利亚完整版模块、政策目录与双语流程` | `apps/web/test/{australia,policy-page}.test.tsx`、`apps/e2e/tests/australia.spec.ts`、本报告、`PROGRESS.md` 第 511 项 |

两次提交末尾均附 `Co-Authored-By: Gemini 4 Argon <noreply@google.com>`。

### 问卷步骤与每步字段

问卷由 `QuestionnaireShell` 承载，共 7 步。第 1 步可选择“同时评估全部 11 条路径”（默认，展开全部 7 步）或单选某一条路径（仅展示该路径涉及的步骤）。除 `simulationDate` 与动态列表中已添加行的起止日期等结构必填项外，其余证据留空或选“未填 / 不确定”时在结果中输出为 `UNKNOWN`（待确认）。

| 步骤 | 标题 | 覆盖字段（对应 `AuFullRequest`） |
|---|---|---|
| 1（step 0） | 基本信息、递交条件与出入境签证记录 | `simulationDate`、`pathway`、`dateOfBirth`、`firstArrival`、`locationAtApplication`、`locationAtDecision`、`permissibleOnshoreVisa`、`noFurtherStay`、`section48History`、`regionalLockException`、`visaCompliance`、`sponsoredFullTime`、`hongKongPassport`、`hongKongPrimaryVisaTerms`、`visas[]`（`subclass`、`from`、`to`，支持确认无记录 `[]` 或未确认 `undefined`）、`trips[]`（`departed`、`returned`）。 |
| 2（step 1） | 英语能力与申请费用 | `english.passport`、`english.functionalDeterminedAtInterview`、`english.functionalApplicationDate`、`english.education`（`'none'` 或 `allPrimaryInEnglish`、`secondaryYearsInEnglish`、`australianTertiaryYearsInEnglish`、`completedAwardYearsInEnglish`）、`english.test`（`'none'`、`'not-yet'` 或 `name`、`date`、`format`、听读写说四科分数 `components`、`overall`、`legacyOetLowestGrade`）、`secondInstalmentPaid`；`fees.pacificRegionalPassport`、`fees.additionalAdults`、`fees.additionalMinors`、`fees.chargeablePrimaryApplicant`、`fees.chargeableAdditionalAdults`、`fees.additionalInstalmentsPaid`、`fees.religiousNominationExemption`、`fees.employerAnnualTurnover`、`fees.regionalPosition`、`fees.paperReturnApplication`、`fees.partnerCategory`、`fees.citizenship`（`concessionCard`、`includedWithResponsibleParent`、`qualifyingPermanentForcesDays`、`otherExemption`、`previousApplicationWithTest`）。 |
| 3（step 2） | 雇主担保（186 TRT 与直接申请） | `employer.exemption`、`employer.sponsorshipConduct`、`employer.trtPrimaryVisa`、`employer.trtOccupationMatches`、`employer.trtSkillsDemonstration`、`employer.csolOccupation`、`employer.assessment`（`kind`、`issued`、`expires`）、`employer.fullTimeExperienceYears`；`employer.nominations['AU-186-TRT']` 与 `employer.nominations['AU-186-DE']`（各自含 `status`、`lodged`、`approved`、`positionAvailable`、`fullTimeRenewable`、`offeredYears`、`annualSalary`、`acceptedMarketRate`、`licensing`，支持确认无提名 `{}` 或未确认 `undefined`）。 |
| 4（step 3） | 技术打分（189 / 190）与国家创新（858） | `skills.invitations['AU-189-PT']` 与 `skills.invitations['AU-190']`（`'awaiting'` 或 `issued`、`deadline`、`score`）、`skills.occupationList`、`skills.occupationInInvitation['AU-189-PT' \| 'AU-190']`、`skills.assessment`（`kind`、`issued`、`expires`）、`skills.nomination`、`skills.points`（`overseasMonths`、`australianMonths`、`professionalMonths`、`education`、`specialistStudyYears`、`australianStudy.{qualifying,academicYears,calendarMonths}`、`regionalCampusAndResidenceNoDistanceStudy`、`communityLanguageCredential`、`partner`）；`innovation.invitation`（`'awaiting'` 或 `issued`、`deadline`）、`innovation.achievement`、`innovation.achievementsMatchInvitation`、`innovation.form1000`、`innovation.exceptionalBenefit`、`innovation.securityAssistance`。 |
| 5（step 4） | 偏远地区（191）与香港通道（189-HK / 191-HK） | `regional.assessmentYears`（已结束合资格财年年份列表，支持确认空列表 `[]` 或未确认 `undefined`）、`regional.disputedAssessment`、`regional.regionalCondition`、`regional.changeNotice`、`regional.evidenceAndInterview`、`regional.hongKongOnlySince`（日期、确认不符合 `null` 或未确认 `undefined`）、`regional.hongKongRegionalException`。 |
| 6（step 5） | 配偶移民（820→801 / 309→100）与居民返程签证（155 / 157） | `partnerApplication`（`lodged`、`stream`、`longTermRelationship`）及 `partner`（`stream`、`relationship`、`marriedByDecision`、`relationshipFrom`、`sharedDependentChildAtLodgement`、`partnerAgeAtLodgement`、`registeredAtLodgement`、`humanitarianDeFactoException`、`compassionateDeFactoClaim`、`relationshipEvidenceAtLodgement`、`eligiblePartnerStatus`、`eligibleAdultGuardianSponsor`、`priorSponsoredPeople`、`lastRelevantPartnerApplication`、`historyException`、`parentVisaGrant`、`parentVisaException`、`subclass204RestrictedAtLodgement`、`childOffenceBarApplies`、`relevantSentenceMonths`、`sponsorOffenceException`、`consentToDisclosure`、`sponsorPoliceCheckIfRequested`、`sponsorshipApprovedInForce`、`onshoreStatus`、`noFurtherStay`、`section48History`、`section48LodgementRequirementsMet`、`temporaryStageGranted`、`temporaryGrant.{basis,decisionDate}`、`continuingSponsorship`、`relationshipAtDecision`、`exceptionEvidence`、`enteredAfterApplication`、`offshoreHumanitarianRelationshipDisclosed`）；`rrv`（`status`、`qualifyingDays`、`ties`、`tiesDepartureRequirements`、`continuousAbsenceYears`、`longAbsenceReasons`、`familyBasis`、`compassionateDeparture`、`absentSince`、`compassionateAbsence`、`returnApplicationBar`）。 |
| 7（step 6） | 授予澳大利亚公民身份与公共利益条件（PIC） | `citizenship`（`medicalBranch`、`understandsApplication`、`scv.{firstGrant,continuousEligible}`、`permanentAtApplication`、`permanentAtDecision`、`otherResidenceBasis`、`confinementEnded`、`confinementDiscretion`、`test`、`character`、`policeCertificatesIfRequired`、`identity`、`securityBar`、`currentCriminalBar`、`lastPrisonSentence`、`mostRecentCessation`、`intention`、`inAustraliaAtApproval`、`approvalAbroadException`、`willingToPledge`、`minorEvidence`）；`publicInterest`（`officialPassport`、`passportException`、`health`、`character`、`prisonSentenceMonths`、`policeDocuments`、`securityAndForeignPolicy`、`criticalTechnology`、`commonwealthDebt`、`valuesSigned`、`noOtherApplicantOfValuesAge`、`childInterestsSatisfied`、`settlementWithoutUndueDifficulty`、`permanentSettlementAndSupport`、`integrity.{identityEstablished,accurateDocuments,lastIdentityRefusal,lastDocumentRefusal,documentWaiver}`、`returnBan5001`、`removedOn`、`removalWaiver`、`sponsoredStudy.{applies,courseMonths,yearsOutsideSinceCeasing,support}`、`temporaryInsurance`）。 |

### 对比旋钮清单（What-if）

| 焦点键（`focus`） | 控件 ID | 作用与关联条件 |
|---|---|---|
| `date` | `au-whatif-date` | 修改模拟 / 拟递交日期（`simulationDate`）。关联各路径持签、工作、通常居住、地区居住、491/494 锁定期、配偶永久阶段等待期、155 居住天数、入籍居住时间及年龄条件。 |
| `trips` | `au-whatif-trips` | 假设在澳期间没有离境记录（`noTrips`）。关联 `AU-CIT-time-absences` 与 `AU-CIT-time-recent-absences`。 |
| `english` | `au-whatif-english` | 假设获认可的 IELTS 四科同分及总分（4.5 / 6.0 / 7.0 / 8.0，或保持问卷基线）。关联 186 / 189 / 190 的 Competent English、香港与 858 的 Functional English 及 189 / 190 的打分与受邀分数条件。 |
| `salary` | `au-whatif-salary` | 调整 186 雇主提名的保证货币年薪与认可市场薪资（AUD）。关联 `AU-186-TRT-salary`、`AU-186-TRT-market-salary`、`AU-186-DE-salary`、`AU-186-DE-market-salary`。 |
| `taxYears` | `au-whatif-tax-years` | 调整 191 已备齐 ATO 评税通知的已结束合资格财年数（0–3）。关联 `AU-191-tax-notices`。 |
| `citizenshipTest` | `au-whatif-cit-test` | 调整入籍考试通过状态（答对总题数与价值观题是否达标）。关联 `AU-CIT-test`。 |
| `health` | `au-whatif-health` | 调整移民体检结论（PIC 4005 / 4007 各状态）。关联 `AU-PIC-HEALTH`。 |

### 旧链接与旧草稿的处理方式

- 原 `/australia` 地址保留，由新的澳大利亚完整版首页接管，提供开始模拟（`/australia/simulate`）、政策依据（`/australia/policy`）与本机已保存方案列表。
- 旧单页只使用 React 组件内存状态（`useState<AuForm>`），未写入 `localStorage` 也未生成分享链接。
- 为兼容任何按旧 `AuForm` 结构传入的草稿或未封装的旧分享串，`decodeAustraliaDraft` 与 `share.ts` 实现了 `migrateLegacyAuForm`：当检测到无 `version` 字段的旧 `AuForm`（含布尔型 `partner`、`hongKong` 及 `visas`、`trips` 数组）时，自动迁移为 `version: 1` 的 `AustraliaDraft`（映射 `partnerApplication`、`hongKongPassport`、`hongKongPrimaryVisaTerms`、`regional.hongKongOnlySince` 并过滤空到期日）。
- 新版草稿和命名方案分别使用 `au-immigration-draft-v1` 和 `au-immigration-scenarios-v1`；分享地址为 `/australia/result#s=…`，信封为 `{country: "au", v: 1, draft}`。旧时间评估函数 `evaluateAustralia` 保留在 `packages/engine` 中不动。

## 2. 怎么验证的

- 执行 `VITEST_MAX_WORKERS=2 pnpm lint && pnpm typecheck && VITEST_MAX_WORKERS=2 pnpm test && pnpm build`，退出码为 0：
  - `pnpm lint` 与 `pnpm typecheck`（含 `apps/e2e` 与 `next typegen`）全部通过，退出码 0。
  - 单元测试全部通过：`error-report` 2 项、`policy-data` 23 项、`engine` 6,006 项通过（1 项既有文案导出用例按默认配置跳过）、`game` 1,348 项、`web` 841 项（45 个测试文件全部通过）。
  - `apps/web/test/australia.test.tsx` 覆盖首页与集合入口链接、离线清单与 sitemap 五页导出、信封编解码与跨国隔离、旧 `AuForm` 自动迁移、分步校验（日期顺序、首次入境早于出生日、出境早于首次入境、雇主提名日期顺序、191 财年格式）、`run` 的典型输入（同时断言 `MET`、`FUTURE`、`UNKNOWN` 三种路径状态）、What-if 全部 7 个旋钮的 `apply` 与 `focusForRule` 映射、双语渲染。
  - `apps/web/test/policy-page.test.tsx` 新增澳大利亚政策页目录测试：核对全部 11 条路径渲染结果中引用的每一个 `SRC-xxx` 均在 `/australia/policy` 的 `data-source` 清单中，且不包含英国（`SRC-001`）或日本（`SRC-110`）来源。
  - `pnpm build` 静态导出 36 个页面/路由，确认 `apps/web/out/australia.html` 及 `apps/web/out/australia/{simulate,result,whatif,policy}.html` 均已生成，且 `/australia` 五个页面均已进入 `apps/web/out/offline-pages.json` 与 `apps/web/out/sitemap.xml`。
  - `pnpm --filter e2e exec playwright test tests/australia.spec.ts --list` 成功识别 2 条 E2E 用例（覆盖中文问卷填写、刷新还原步骤、结果页路径与条件、保存方案、分享链接在新上下文还原、条件跳转 What-if 改旋钮后日期与状态变化，以及英文 375px 手机宽度无横向滚动、Axe 无障碍扫描与政策页来源核对）。

## 3. 没做或没验证的

- 按 brief 要求（“不要跑 Playwright”），未在本地启动 Chromium 执行 Playwright 浏览器端 E2E 测试，交由 Fable 运行浏览器 E2E 与视觉验收。
- 未改动澳大利亚规则引擎语义和政策参数，未删除旧 `evaluateAustralia` 入口，也未改动英国或其他国家页面。

## 4. 发现与建议

- 无范围外问题。

## 审核修正（review93-1）

### 1. 做了什么

| PROGRESS | Commit | 对应审核编号 |
|---|---|---|
| 514 | `Fix: 澳大利亚问卷直接读写引擎结构并区分未答与确认没有（review93-1）` | 问题 1、2、3，建议 1，风险 3 第 4 点 |
| 515 | `Fix: 澳大利亚未完成草稿刷新不再丢弃，并补齐表单分组与报错关联（review93-1）` | 风险 2，风险 3 第 1–3 点，建议 2 |
| 516 | `Fix: 澳大利亚对比页保持基线不变并按实际路径生成假设（review93-1）` | 问题 4、5，风险 4 |
| 517 | `Fix: 澳大利亚结果按评估条件标注日期并分开时间、条件、预算与批准后事项（review93-1）` | 问题 6（日期标签、检查项分组、待定细节） |
| 518 | `Fix: 政策页按含义展示澳大利亚嵌套参数，标题与千分位按国家通用（review93-1）` | 问题 6（政策页嵌套参数）、问题 8、建议 3，Fable 补充的千分位要求 |
| 519 | `Fix: 分享链接按国家通用标记还原场景，不覆盖本机草稿并拒收英国旧裸链接（review93-1）` | 问题 7，风险 1 |
| 520 | `Fix: 四科分数报错可聚焦，政策页嵌套表格在窄屏不溢出（review93-1）` | 浏览器验收发现的问题，属问题 6、风险 3 |
| 521 | `Test: 澳大利亚 e2e 跟随审核修正并补审核报告（review93-1）` | 建议 4 的 e2e 部分，本节报告 |

每项修正先写回归测试。做法是保存改动，把被测源文件临时恢复为上一提交，确认同一组测试失败，再还原并确认通过。逐条说明如下。

- **问题 1**：`createAustraliaDraft()` 不再预设 `trips: []`。新问卷的出境记录为“未确认”，点“确认无记录”后才送 `trips: []`。审核给出的时间线在未确认时，`AU-CIT-time-absences`、`AU-CIT-time-recent-absences` 为 `UNKNOWN`；确认后为 `MET`。
- **问题 2、建议 1**：问卷字段直接对应引擎结构，取消全部平铺临时键。`skills.invitations` 和 `skills.occupationInInvitation` 各为一个分组，下设 `AU-189-PT`、`AU-190`。已递交的合并申请是独立分组 `partnerApplication`，`lodged`、`stream` 必填，`longTermRelationship` 可选；`partner.stream` 只表示尚未递交时拟递交的通道。四科分数是 `english.test.components` 一个字段，按引擎顺序排列听、读、写、说，未填的一科暂存 `null`。`activeAustraliaAnswers` 不再回读旧的嵌套值，渲染时也不再原地改写 `record`。
- **问题 3、风险 3 第 4 点**：删除“整组删除”或“补写 `null`”的归一化，改为组内标星项在提交时必填。涉及 PIC 4020 的两个拒签日期（填日期或勾“确认无此记录”）、入籍考试的答对总数与价值观题数、刑期月数，以及合并申请的递交日与通道。只填一部分时提交报错，不会静默变成 `UNKNOWN`，也不会伪造“确认没有拒签”。已填的 10 年内身份拒签照常得到 `NOT_MET`。`activeAustraliaAnswers` 现在只去掉所选路径隐藏步骤的答案，评估与分享都不带这些答案，与日本试点一致。
- **问题 4**：薪资旋钮的数值与初始值不同时，才改写提名。不动旋钮时，TRT 与 DE 两份提名的薪资和市场薪资原样保留，11 条路径均显示“与当前情景相同”。
- **问题 5**：
  - 英语旋钮：一次考试要满足所有被评估的路径。189/190 以各自的邀请日为基准，186 以递交日为基准，都要在 Skilled 有效期内；858 与香港通道要在递交前的 Functional 期限内；旧版成绩还须在递交日前的有效期内。依次试“各基准日的前一天”，取满足路径最多的最晚日期。审核案例为 189 邀请 2023-01-01、190 邀请 2026-11-15，得到 2026-11-14，`AU-190-english` 与 `AU-858-functional-english` 均为 `MET`。年限取自 `australiaSkilledParameters.english`（SRC-206 ss 7–10，SRC-205 ss 6–8）。
  - 191 财年旋钮：只取递交前已结束、且实际持有 491/494 的财年，规则与引擎的 `noticeCount` 相同，后续实质签证会终止开放式的前一份签证。审核案例中 491 为 2022-07-01 至 2025-06-30，生成 `[2023, 2024, 2025]`，`AU-191-tax-notices` 为 `MET`。
  - 无离境：草稿带有 `noTrips` 时，问卷第 1 步显示“按没有离境记录评估（来自对比页的假设）”复选框，可以取消；取消后按所填记录评估。做法同日本的 `tripsForReentryOnly`。
  - 模拟日期：对比页除检查日期格式外，还按问卷各可见步骤校验调整后的草稿。早于出生日期等情况会报错，也不生成分享链接。
- **问题 6**：
  - 共用的 `CountryModule` 新增可选 `earliestLabel`，结果页、缺口摘要和对比页都读它；未设置的国家仍显示“最早可申请日期（推算）”。澳大利亚设为“预计满足评估条件的日期”，并在结果页与对比页加一条说明：该日期同时核对递交时与决定时的条件，不是允许递交日，也不是批准日；191 财年须在递交前结束，ATO 通知在决定前提供；第二期费用在批签前缴纳；费用预算和入籍宣誓分开列出，不影响该日期。依据是 83 号报告第 4 节。
  - 共用的 `CountryCheck.kind` 增加 `time`、`budget`、`afterApproval`、`alternative`。澳大利亚在模块的 `run` 里为每项设 kind：时间条件（`*-time-*`、`AU-PARTNER-time`、`AU-regional-lock`）、申请条件、费用预算（`AU-FEES-*`）、批准后事项（`AU-CIT-pledge`）、RRV 可选依据（`AU-RRV-option-*`，满足其一即可）。结果页在每项标题后标出分组；“还差什么”只列申请条件与时间条件。RRV 为 `FUTURE` 时，缺口只剩 `AU-RRV-basis`。
  - 设了 kind 之后，个案审查类待定项（如 `PD-213`、`PD-218`）按日本的做法显示“待定细节”，不再显示“政府未定细节”或“待政府明确”。
  - 政策页：共用的 `CountryPolicy` 新增可选 `displayParameter`，同字段的行数组显示为带列名的小表格。澳大利亚据此把 Schedule 6D 的年龄和工作月数分段显示为“年龄下限／月数下限—分数”；各考试分数表显示为“等级—听力、阅读、写作、口语”，旧版 OET 显示“各科最低等级”；9 类家庭费率按“标准／太平洋地区护照”分行，按“主申请人／成年副申请人（每人）／未成年副申请人（每人）”分列，金额带 AUD，并列出第二期金额。返程签证费和 186 主申第二期也带 AUD。Functional English 总分按文本显示，不加千分位。
- **问题 7**：共用的 `CountryModule` 新增可选 `scenarioLinks`，日本与澳大利亚设为 `true`。`share.ts`、`page-result.ts` 以及结果、问卷、对比、分享组件都改读这个标记，不再写死 `'jp' || 'au'`，`page-result.ts` 漏掉的澳大利亚因此补上：本机已有草稿时，打开分享链接不覆盖它。裸分享对象对澳大利亚只接受没有 `version`、且字段全属于旧 `AuForm` 的对象，带 `version` 的英国旧裸草稿被拒收。
- **问题 8**：`PolicyPage` 在没有 `country.id`、或该国未登记 `<国家>.policy.pageTitle` 时，回退到 `policyPage.title`。
- **风险 1**：`sw.js` 的 `CACHE_NAME` 改为 `2026-11-24-v6`，`about-page.test.tsx` 同步。
- **风险 2**：日期先后、签证类别必填和财年范围只在提交时校验，做法同日本试点。未完成的草稿刷新后照常还原；已完成的结果仍须通过全部可见步骤。
- **风险 3**：191 财年清空输入时保留空行（`null`），逐行报错，并带 `aria-invalid` 与 `aria-describedby`。`null-date`、`status-date` 的日期框与“无此记录”等复选框放进以字段名为图例的分组。“小学全部学业”一项不再混写中学年数。第 4 点见问题 3。
- **风险 4**：对比页没有 186 提名时，薪资输入下方说明调整不会生效，并提示先在问卷的雇主担保一步填写提名。
- **建议 2**：含标星项的可留空分组显示“本组可留空。如果填写了组内资料，请同时完成标星号的项目。”单选 189 香港类别时，不再显示偏远地区一步，因为该路径不读 `regional`。第 1 步放入 `section`。
- **建议 3**：政策目录中 `AU-PIC-HEALTH` 标为“移民体检（PIC 4005 / 4007）”，`AU-FEES-APPLICATION` 标为“申请费用预算（签证、居民返程签证或入籍）”。共用命名未改。
- **Fable 补充的千分位要求**：政策页不再按“是否英国”决定千分位，改按字段语义。键名以 `year`、`from`、`cohort` 结尾、且为 1900–2100 之间整数的数值视为公历年份，不分组，例如西班牙 `ipremYear` 显示 2026。其余金额与计数照常分组。没有采用“只给金额分组”的正向规则，因为英国 `familyPartnerTransitionalFirstChild`、日本 `hsp.age` 表、加拿大 `quebecSelection2026` 等金额的键名里没有金额字样，会失去分组。各国参数中超过 1000 的分数只有澳大利亚 OET 的 Functional 总分，已由澳大利亚的 `displayParameter` 按文本显示。

#### 其他国家怎么接入这次的共用改动

| 需求 | 做法 | 不设置时 |
|---|---|---|
| `earliestDate` 不是“可申请日” | 在国家模块设 `earliestLabel: '<国家>.result.earliest'`，并登记中英文文案 | 显示 `result.earliest`“最早可申请日期（推算）” |
| 结果、编辑、对比链接带场景片段，打开分享不覆盖本机草稿 | 在国家模块设 `scenarioLinks: true` | 沿用英国做法：分享链接写入本机草稿，链接不带片段 |
| 检查项分组 | 在引擎或模块的 `run` 里为检查项设 `kind`。`requirement` 与 `time` 进“还差什么”；`budget`、`afterApproval`、`alternative`、`factor`、`information` 不进。设了 kind 的待定项显示“待定细节” | 没有 kind 的检查都进缺口，待定项显示“政府未定细节” |
| 政策页标题 | 登记 `<国家>.policy.pageTitle` 的中英文文案 | 显示通用的“政策依据” |
| 政策页嵌套参数 | 在 `CountryPolicy` 上提供 `displayParameter(name, locale)`，返回带本地化列名的行数组或对象；行数组自动显示为表格 | 原样显示参数值 |
| 政策页年份 | 年份参数的键名以 `year`、`from` 或 `cohort` 结尾即可不分组 | 其余数字按语言分组 |
| 结果页时点说明 | 用既有的 `resultNotes` 返回本国文案键 | 不显示说明 |

“跳到主要内容”时是否保留场景片段，仍由 `components/site-shell.tsx` 的 `isJapanScenario` 按路径列出日本与澳大利亚判断。brief 要求不改共用命名，所以这里没动；新国家如需同样行为，要在那里加本国路径。

### 2. 怎么验证的

- **回归测试（建议 4）**：新增 `apps/web/test/australia-questionnaire.test.tsx`。它借鉴日本问卷测试，拦截 `Field` 取得各控件的 `onChange`，覆盖以下情形：新草稿出境记录未答；邀请、职业匹配和合并申请的修改与清空；四科分数写入引擎元组、渲染时不改写冻结草稿；部分填写的分组须补全，且不伪造 `null`；隐藏步骤答案不进分享；未完成草稿刷新后还原；财年逐行空值与报错；确认复选框的分组；可留空分组提示；189 香港步骤。`apps/web/test/australia.test.tsx` 新增：未动旋钮时 11 条路径全部不变、两份提名原样保留；IELTS 测试日；191 财年；对比日期校验；无提名说明；无离境假设的显示与撤销；日期标签（双语）；kind 分组与缺口；待定细节文案；政策页分段、分数和费率表（双语）；英国裸草稿拒收；分享不覆盖本机草稿。`country-views.test.tsx` 新增：标题回退、年份不分组、行数组成表。`about-page.test.tsx` 同步缓存版本。
- **先失败后通过**：每组新测试在对应修正前的源文件上运行，均失败（问题 1–3 及建议 1 为 5 项，风险 2–3 及建议 2 为 4 项，问题 4–5 及风险 4 为 5 项，问题 6 结果部分为 4 项，政策页为 3 项，问题 7 及风险 1 为 3 项），修正后全部通过。
- **完整验收**：`(export VITEST_MAX_WORKERS=2; pnpm lint && pnpm typecheck && pnpm test && pnpm build)`，退出码 0。其中 error-report 2 项、policy-data 23 项、engine 6,006 项通过（1 项按开关跳过），game 1,348 项通过，web 863 项通过（46 个文件）。构建导出 36 个页面。浏览器验收后改了 CSS 与分数分组，随后重跑 `pnpm --filter web build`（退出码 0），并重跑受影响的 4 个 web 测试文件（49 项通过）及 lint。
- **浏览器 e2e**：`cd apps/e2e && E2E_PORT=4431 npx playwright test tests/australia.spec.ts tests/japan.spec.ts tests/site.spec.ts --project=desktop --reporter=line`，19 项全部通过。浏览器验收后的改动又单独跑了 `tests/australia.spec.ts`，2 项通过。两次都已删除 `apps/e2e/test-results`。e2e 的改动：出境记录先点“确认无记录”；复选框按字段分组定位，不再用 `.first()`；对比页日期标签改读 `au.result.earliest`。断言的 2030-01-01、2027-01-01 两个日期及状态，在单测里先用同样的输入算出。
- **视觉验收**：在内置浏览器中打开导出的静态站，查看以下页面：问卷第 1 步的“按没有离境记录评估”复选框、第 2 步四科分数的报错、第 7 步日期与复选框的分组、RRV 结果页的日期标签、时点说明、“还差什么”和分组标注、对比页的“与当前情景相同”和薪资说明，以及政策页的分段表、分数表和费率表（宽屏和 375px）。验收发现两处问题，已在第 520 项修正：嵌套表格把金额拆成“AU D 1,95 5”；375px 下费率表超出参数区。修正后 375px 下参数区的 `scrollWidth` 等于 `clientWidth`，页面无横向滚动。日本政策页在 375px 下也无溢出。

### 3. 没做或没验证的

- 未 push，未开 PR，按 brief 留给 Fable。
- `components/site-shell.tsx` 的 `isJapanScenario` 仍按路径写死日本与澳大利亚，按 brief 不改共用命名；新国家要在那里加路径。
- 建议 3 中“更新主站首页介绍文案的旧表述”不在 brief 范围，未改。
- e2e 只跑了 brief 指定的三个文件、desktop 项目；mobile 项目和其他国家的 e2e 未跑。其他国家页面靠单测和完整构建覆盖。
- 一个分享链接里带的“未完成”四科分数（含 `null`）只出现在本机草稿中，不会出现在完成后的结果里，所以没有为它单独做引擎层面的兜底。

### 4. 发现与建议

- 旧 `AuForm` 单页在 main 上只存在内存里，没有写本机存储，也没有生成过分享链接（main 的 `share.ts` 注释是“只有英国问卷产生过分享链接”）。按 brief 保留了严格的旧表单迁移；如果确认不需要兼容，可以删除 `migrateLegacyAuForm` 和 `share.ts` 里的澳大利亚分支。
- 对比页的 191 财年旋钮复用了引擎 `noticeCount` 的判断。引擎若导出这个函数，页面可以直接调用，避免两处规则漂移。
- 日本政策页也有裸数组，如 `hsp.experience` 显示为“7、15”。日本可以用新的 `displayParameter` 加列名。
- 英语旋钮只能给所有路径设同一次考试。如果同时比较的两份邀请相隔超过有效期，只能满足其中一边。页面按“满足的路径最多、日期最晚”选择，没有逐路径另设考试。
