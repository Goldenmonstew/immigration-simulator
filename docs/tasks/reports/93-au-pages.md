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
