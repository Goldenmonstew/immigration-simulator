# 任务 97 · 西班牙完整版页面——问卷、结果、对比、分享、政策页

## 1. 做了什么

按 commit 分组列出本次改动（行号使用分配的 `PROGRESS.md` 630–639 段，尾注 `Co-Authored-By: Gemini 4 Argon <noreply@google.com>`）：

| PROGRESS | Commit message | 涉及文件 |
|---|---|---|
| 630 | `Feat: 实现西班牙完整版国家模块、政策目录与对比旋钮` | `apps/web/lib/spain-{draft,fields,module,policy,policy-rules,whatif}.ts`（替换旧 `apps/web/lib/spain.ts`）、`apps/web/lib/site-countries.ts`、`apps/web/i18n/countries/spain{,-form,-module}.ts`、`apps/web/i18n/{zh-CN,en}.ts`、`PROGRESS.md` |
| 631 | `Feat: 接入西班牙完整版首页、分步问卷、结果、对比与政策页` | `apps/web/app/spain/spain-content.tsx`、`apps/web/app/spain/simulate/{page,evidence-fields}.tsx`、`apps/web/app/spain/{result,policy}/page.tsx`、`apps/web/app/spain/whatif/{page,controls}.tsx`、`PROGRESS.md` |
| 632 | `Test: 补充西班牙完整版页面单测、e2e 用例与任务报告` | `apps/web/test/spain.test.tsx`、`apps/e2e/tests/spain.spec.ts`、`docs/tasks/reports/97-es-pages.md`、`PROGRESS.md` |

### 问卷步骤与每步字段

问卷由 `QuestionnaireShell` 驱动，按第一步所选目标动态显示对应步骤，覆盖 `evaluateSpainFull`（`EsFullInput`）读取的全部输入；只有规则允许留空的证据可留空（在结果中显示为 `UNKNOWN` 待确认），必填字段与日期先后顺序在每步推进和完成时校验：

| 步骤 | 显示条件 | 涵盖字段 |
|---|---|---|
| 1. 模拟日期与评估路径（`step 0`） | 始终显示 | `simulationDate`（必填日期）、`targets`（多选：`N` 按居住入籍、`L` 国内长期居留、`E` 西班牙欧盟长期居留、`M` 其他成员国欧盟长期居民迁入西班牙、`F` 跨境欧盟长期居民的随迁家属、`R-N` 恢复国内长期居留、`R-E` 恢复欧盟长期居留、`U` 欧盟自由流动永久居留；至少选一条）。 |
| 2. 居留许可与出入境记录（`step 1`） | 选了 `N`、`L`、`E` 或 `U` | `timeRecordsComplete`（居留与出入境记录是否完整）、`permits`（各段西班牙居留许可：`from` 必填、`to`、`study`，支持“确认没有此类记录”空数组或“待确认”）、`trips`（离开西班牙的出境记录：`departed` 必填、`returned` 必填，支持空数组或待确认）。 |
| 3. 按居住入籍条件与材料（`step 2`） | 选了 `N` | 顶层字段：`route`（`general` / `refugee` / `ibero` / `marriage` / `one-year`）、`marriedToSpaniard`（`route === 'marriage'` 时显示）。四组折叠证据（`nationality`）：<br>① **缩短年限与分支特定事由**（`natRoute`）：`refugeeStatus`、`refugeeEvidenceIssued`、`originalNationalityForPermit`、`sephardicEvidenceAccepted`、`spouseSpanishFrom`、`unseparatedAndCohabitationDocumented`、`diplomaticPosting`（`from`、`to`）、`oneYearGround`、`spanishCivilBirthRecord`、`optionBasis`、`optionUnexercisedAndDocumented`、`optionEventDate`、`qualifyingGuardianshipDocumented`、`guardianshipFrom`、`guardianshipTo`、`widowSpanishSpouseDied`、`widowUnseparatedAtDeath`、`widowCertificatesAndCohabitation`、`bornOutsideSpain`、`spanishByOriginAncestor`、`descentChainDocumented`；<br>② **申请人年龄、签署代表与公民品格**（`natCapacity`）：`birthDate`、`emancipated`、`applicantSignature`、`representationDocumented`、`necessarySupportProvided`、`continuityDecision`、`criminalRecords`（`spanishRecordOrQuery`、`originRecordOrLawfulAlternative`、`militaryProcedureIfApplicable`）、`conductAndSecurityDecision`；<br>③ **DELE 语言、CCSE 公民知识、免试与融合**（`natExams`）：`deleEvidence`、`deleLevel`、`documentedNationalities`（20 个官方西语免试国代码及 `OTHER`）、`ccse`（`correct`、`verifiedPass`、`issued`、`validThrough`）、`examRelief`、`dispensaRequestedOn`、`registeredWithSchoolOrCareCentre`、`primarySchoolStartsOn`、`schoolOrCareCertificateIfRequired`、`integrationDecision`、`examBooking`（`date`、`deleCountry`、`deleLevel`、`ccseRetakeFrom`）；<br>④ **申请文件、费用与获批后宣誓登记**（`natFiling`）：`documents`（`applicationForm`、`identity`、`birthRecord`、`residence`、`address`、`foreignDocumentFormalities`、`previousPassportsIfRequired`）、`feePaid`、`feePaidOn`、`followUpDate`、`grantNotifiedOn`、`declarationOn`、`declarationCompleted`、`confirmedDeclarationDeadline`、`notarialSuspensionAwaitingConfirmation`、`canDeclareInPerson`、`oathOrMilitaryEvidence`、`renunciationBasis`、`declaredRenunciation`、`civilNeighbourhoodChosen`、`competentRegistryOrNotary`、`registeredOn`、`registrationCompleted`。 |
| 4. 国内与欧盟长期居留（`step 3`） | 选了 `L` 或 `E` | 三组折叠证据（`residence`）：<br>① **适用制度、身份、递交窗口与治安审查**（`resCommon`）：`thirdCountryRegime`、`entryRestrictionsClear`、`noReturnCommitmentClear`、`inSpain`、`residentInSpain`、`validIdentityDocument`、`competentOfficeAndApplication`、`permitExpiry`、`filingWindowAccepted`、`officeHolidays`、`criminalCertificatesWhereRequired`、`securityDecision`、`fee`（`exemptPublicGuardian`、`paid`、`amount`、`workingDaysAfterAdmission`）；<br>② **国内长居直接取得事由与学龄子女入学**（`resNational`）：`nationalAlternatives`（多选 7 项 art. 183.3 直接事由，或确认仅主张普通 5 年居留 `[]`）、`spanishContributoryRetirement`、`disabilityBenefit`、`analogousLifelongNonCapitalisable`、`analogousSufficiencyAccepted`、`birthDate`、`bornInSpainDocumented`、`birthRouteContinuityAccepted`、`atMajorityAccepted`、`lostSpanishNationalityOfOriginDocumented`、`spanishPublicGuardianship`（`from`、`to`）、`validRecognizedProtectionInEu`、`contributionDecision`、`schooling`（`children` 列表含 `birthDate`、`standardSpanishSchooling`、`primarySchoolStartsOn`、`enrolledWithProof`，支持确认无学龄受扶养子女 `[]`；及 `noticeDate`、`cureDeadline`）；<br>③ **欧盟长居详细居留段、出境原因、蓝卡流动、资源与医保**（`resEu`）：`periods`（`from`、`to`、`territory`、`kind`、`protectionGranted`、`protectionDecisionDate`）、`tripDetails`（`departed`、`returned`、`reason`、`exceptionDocumented`、`irregularExit`、`outsideEu`）、`blueMobility`（`exercisedLawfully`、`firstCardFrom`、`moveDate`、`movedPreviously`、`priorPeriodsDocumented`）、`resources`（`familySize`、`eligibleMonthlyIncome`、`income` 分项列表、`stable`、`reduction`、`additionalAssetsUnderReview`、`sixMonthAverageAssets`、`sufficiencyDecision`）、`insurance`（`kind`、`entitledOrAuthorized`、`equivalentCoverage`、`validFrom`、`validTo`、`proof`）。 |
| 5. 欧盟长居者迁入西班牙及随迁家属（`step 4`） | 选了 `M` 或 `F` | 三组折叠证据（`mobility`）：<br>① **原成员国欧盟长居身份与迁居目的**（`mobCommon`）：`otherMemberStatus`、`purpose`；<br>② **主申请人递交、居留目的证据、安全审查与获批后手续**（`mobHolder`）：`holder`（`filedOn`、`beforeEntry`、`enteredOn`、`officeHolidays`、`thirdCountryNational`、`validPassportOrTravelDocument`、`signedEx11`、`competentOffice`、`statusDocument`、`noRefusalAlert`、`noReturnBar`、`securityDecision`、`nonWorking`、`employment` 含 `employer`、`selfEmployment`、`exemptWork`、`healthCover` 含 `coversFamilyMember`、`fee`、`separateWorkFeeRequired`、`separateWorkFeePaid`、`spanishEuLongTermGranted`、`grant`）；<br>③ **随迁家属递交、亲属关系与监护许可、家庭资源与发卡**（`mobFamily`）：`family`（递交公共字段、`priorFamilyUnitAndResidenceProved`、`noRefusalAlert`、`principalFiledOn`、`principalDecision`、`relationship` 含 `custodyArrangement` 与 `relocationPermission` 等、`resources`、`healthCover`、`fee`、`grant`）。 |
| 6. 恢复长期居留与长居卡件维持（`step 5`） | 选了 `R-N`、`R-E`、`L`、`E` 或 `M` | 选了 `R-N` 或 `R-E` 时显示恢复长居两组（`recovery`）：<br>① **原长居身份、丧失原因与自愿返乡承诺**（`recStatus`）：`previousStatus`、`ground`、`lossDecision`、`outsideSpainSince`、`derivedFromReunification`、`birthDate`、`returnCommitmentFrom`、`visitsDuringCommitment`（`enteredSpain`、`leftSpain`）、`visitsLawful`；<br>② **申请地、护照、刑事安全、R-E 资源医保与签证申卡**（`recFiling`）：`place`、`correctOfficeAndSignedForm`、`lawfulStay`、`noEntryAlert`、`recognizedTravelDocument`、`passportExpires`、`subjectToCriminalRecordRequirement`、`clearRecordsInAllCountries`、`publicOrderAndSecurityCleared`、`publicHealthCleared`、`consularRequirementsConflict`、`regularResourcesDocumented`、`resourcesAcceptedAsSufficient`、`insurance`、`fee`、`consularVisa`、`lawfulEntry`、`grantNotification`、`cardApplied`、`officeHolidays`。<br>选了 `L`、`E` 或 `M` 时显示长居 TIE 卡件与维持组（`longTermCard`）：`operation`、`triggerDate`、`expiry`、`applied`、`validIdAndPhoto`、`cardFeePaid`、`publicWard`、`nationalConditionsRetained`、`birthDate`、`validityConfirmedAtAgeBoundary`、`decision`、`otherLossGround`、`absences`（`departed`、`returned`、`area`）、`outsideSpainPeriods`（`departed`、`returned`）、`formerBlueCardOrQualifyingFamily`、`qualifyingCooperation`、`shortReturnDisputed`、`officeHolidays`。 |
| 7. 欧盟自由流动永久居留（`step 6`） | 选了 `U` | 四组折叠证据（`freeMovement`）：<br>① **适用制度、主申请人关系与共同居住**（`fmIdentity`）：`person`、`sponsor`、`spanishFreeMovementConfirmed`、`transitionalEuRegimeConfirmed`、`accompanyingOrJoining`、`relationship`、`relationshipDocumented`、`studentSponsor`、`dependent`、`incapacitated`、`birthDate`、`previouslyCohabitedFrom`、`previouslyCohabitedUntil`、`personalCareNecessary`、`commonChildAndStableCohabitation`、`extendedFamilyRecognized`、`residenceFrom`、`jointResidenceFrom`；<br>② **合资格居留期间、出境记录与连续性**（`fmHistory`）：`history`（`from`、`to`、`basis`、`documented`、`allRiskInsurance`、`sufficientMeansAccepted`、`singleHousehold`、`annualMeans`、`recognizedCourse`、`resourceDeclaration`、`employmentStarted`、`involuntaryAndRegistered`、`fixedTermUnderOneYear`、`continuedWorkerStatusRecognized`、`trainingRelatedOrInvoluntaryUnemployment`）、`trips`（`departed`、`returned`、`reason`）、`noExecutedExpulsion`、`continuityAccepted`；<br>③ **家属独立保留居留权与提前取得**（`fmRetentionEarly`）：`retainedEvent`、`eventDate`、`divorceProceedingsStartedOn`、`eventReported`、`priorFamilyResidenceFrom`、`continuingChildEducationAndCustody`、`relationshipFrom`、`custodyOrAccessInSpain`、`exceptionalHardshipProved`、`retainedStatusAccepted`、`earlyBasis`、`workStopped`、`employmentFrom`、`qualifiedWorker`、`workerResidenceFrom`、`workerResidenceEvidence`（`history`、`trips`、`noExecutedExpulsion`、`continuityAccepted`）、`pensionContributionsQualified`、`pensionEligibilityDecided`、`contributionMonths`、`earlyEmployeeRetirement`、`spanishSpouseExemption`、`permanentIncapacity`、`occupationalSpanishBenefit`、`workingInAnotherMemberState`、`retainedSpanishHome`、`returnsAtLeastWeekly`、`coResidentWithWorker`、`workerAcquiredEarly`、`diedDuringWorkBeforePermanent`、`occupationalDeath`、`spouseLostSpanishNationalityThroughMarriage`；<br>④ **取得后维持、安全限制与永久证明／EX-19 家属卡**（`fmPostCard`）：`acquiredOn`、`longestPostAcquisitionAbsence`（`departed`、`returned`）、`postAcquisitionTravelComplete`、`noOfficialRestriction`、`document`（`validIdOrRenewal`、`entitlementDocuments`、`ex19`、`photos`、`feePaid`、`priorCardExpiry`、`applied`、`officeHolidays`）。 |

### 对比旋钮清单（`/spain/whatif`）

对比页使用 `WhatIfPageContent`，修改只作用在对比草稿副本，不覆盖问卷基线，并支持从结果页条件（`GapSummary`）直接跳转到对应旋钮：

| 旋钮 ID | 控件 DOM ID | 作用与关联条件 |
|---|---|---|
| `date` | `#es-whatif-date` | 修改模拟／拟递交日期（关联 `ES-N01`、`ES-N02`、`ES-N04`–`ES-N07`、`ES-N09`、`ES-L-BASIS`、`ES-L01`、`ES-L01-PERMIT`、`ES-L05`、`ES-L07`、`ES-L11`、`ES-E-TIME`、`ES-E01`–`ES-E04`、`ES-E07`、`ES-M01`、`ES-F01`、`ES-R01`、`ES-R03`、`ES-R04`、`ES-T01`、`ES-U04`、`ES-U04-basis`、`ES-U06`–`ES-U09`、`ES-U11`、`ES-U13`、`ES-TRANSITION`）。 |
| `trips` | `#es-whatif-trips` | 假设居留期间没有出境记录，清空对比副本中的 `trips`、`residence.tripDetails`、`freeMovement.trips` 及长居离境记录（关联 `ES-L01-SINGLE`、`ES-L01-TOTAL`、`ES-L02`、`ES-T02`、`ES-U04-retention`）。 |
| `natRoute` | `#es-whatif-nat-route` | 切换入籍居住年限类别 `general` / `refugee` / `ibero` / `marriage` / `one-year`（关联 `ES-N03`、`ES-N08`、`ES-N-ONE-YEAR`）。 |
| `dele` | `#es-whatif-dele` | 假设 DELE A2+ 西班牙语证书或法定等效／免试已核实或未通过（关联 `ES-N11`）。 |
| `ccse` | `#es-whatif-ccse` | 假设 CCSE 公民知识考试合格且在有效期内或未通过（关联 `ES-N12`、`ES-N13`、`ES-N16`）。 |
| `familySize` | `#es-whatif-family-size` | 修改家庭人数（含申请人），用于对比不同家户规模下的 IPREM 月收入门槛（如 2 人 €900/月 vs 3 人 €1,200/月）。 |
| `income` | `#es-whatif-income` | 修改可计入的固定家庭月收入（EUR/月，关联 `ES-E05`、`ES-F03`、`ES-M02`、`ES-R06`、`ES-U05`）。 |
| `salary` | `#es-whatif-salary` | 修改跨境迁居受雇年薪（EUR/年，用于对比 SMI 全时年薪门槛 €17,094，关联 `ES-M04`、`ES-M05`）。 |
| `insurance` | `#es-whatif-insurance` | 假设递交时在西班牙有效的公共或合规私人医疗保险已备凭证或缺失（关联 `ES-E06`、`ES-M03`、`ES-F04`、`ES-R07`）。 |
| `conduct` | `#es-whatif-conduct` | 假设公民品格、无犯罪记录及公共秩序与安全审查通过或未通过（关联 `ES-N10`、`ES-N10-RECORDS`、`ES-L12`、`ES-L12-CERT`、`ES-E08`、`ES-E08-CERT`、`ES-M08`、`ES-R05`、`ES-U12`）。 |

### 旧页面与旧链接的处理方式

- 原 `/spain` 网址保留并由完整版西班牙首页接管，展示政策核对状态、建模范围、开始前准备、本机已保存情景（`SavedScenarios`）与免责说明，点击「开始模拟」进入 `/spain/simulate`，点击「政策依据」进入 `/spain/policy`。
- 旧单页仅用 React `useState` 保存临时表单状态，刷新即清空，未写入 `localStorage` 也未生成分享链接。完整版沿用框架存储键 `es-immigration-draft-v1` 与 `es-immigration-scenarios-v1`，分享链接格式为 `/spain/result#s=…`，信封为 `{country: "es", v: 1, draft}`。
- `decodeSpainDraft` 同时支持向后兼容迁移：若传入旧版无 `version` 字段的 `EsForm` / `EsRequest` 结构（`{ simulationDate, permits, trips, route, marriedOn }`），会自动迁移为 `version: 1` 的已完成 `SpainDraft`（默认选中 `['L', 'N']` 两条路径并保留居留许可、出入境记录、入籍类别与结婚日期）。
- 引擎中的旧时间评估函数 `evaluateSpain` 保持不动（`evaluateSpainFull` 内部继续复用其时间计算）。

## 2. 怎么验证的

- 设置 `VITEST_MAX_WORKERS=2` 运行全仓门禁命令：
  `VITEST_MAX_WORKERS=2 pnpm lint && VITEST_MAX_WORKERS=2 pnpm typecheck && VITEST_MAX_WORKERS=2 pnpm test && pnpm build`
  退出码为 `0`：
  - `pnpm lint`：6 个工作区包全部通过。
  - `pnpm typecheck`：6 个工作区包（含 `next typegen && tsc --noEmit`）全部通过。
  - `pnpm test`：全仓 **8,219 项测试全部通过**（`error-report` 2 项、`policy-data` 23 项、`engine` 6,006 项通过 + 1 项默认跳过、`game` 1,348 项、`web` 842 项）。
  - `pnpm build`：Next.js 静态构建成功导出 36 个页面／路由，包含 `/spain`、`/spain/simulate`、`/spain/result`、`/spain/whatif`、`/spain/policy`。
- 单独运行西班牙与关联页面单元测试：
  `VITEST_MAX_WORKERS=2 pnpm --filter web test test/spain.test.tsx test/page.test.tsx test/policy-page.test.tsx test/country-views.test.tsx`
  4 个测试文件共 41 项全部通过。覆盖：
  - 中英文首页与集合页西班牙卡片链接渲染；
  - 五个西班牙页面在 `offline-pages.json` 与 `sitemap.xml` 中的导出；
  - `SpainDraft` 的信封编解码（`{country: "es", v: 1, draft}`）、跨国信封隔离、旧版 `EsForm` 自动迁移与非法草稿拒绝；
  - 分步校验（未选目标报错、无效日期报错、许可及出境起止日期倒序报错）；
  - `spainModule.run` 典型输入（`ES-LONG-TERM` 与 `ES-LONG-TERM-EU` 为 `MET`、`ES-NATIONALITY` 为 `FUTURE / 2027-01-01`、缺省安全审查结论时为 `UNKNOWN` 且保留 `pathwayCompletionDate`）；
  - 对比旋钮 `spainWhatIf.apply`（修改家庭人数 2→3 触发 IPREM 门槛翻转 `ES-E05` 为 `NOT_MET`、提高月收入恢复 `MET`、推进模拟日期到满 10 年翻转 `ES-NATIONALITY` 为 `MET`、跨过 CCSE 4 年有效期翻转为 `NOT_MET`、勾选 `noTrips` 消除超限离境）；
  - 西班牙政策页列出 8 条路径、101 项条件、49 项参数、3 条变更记录与 33 项西班牙官方来源（`SRC-083`、`SRC-084`、`SRC-085`、`SRC-090`、`SRC-320`–`SRC-348`），不含英国（`SRC-001`）或日本（`SRC-110`）来源，且八条路径渲染结果引用的全部 `SRC-xxx` 均在政策页来源清单中。
- 检查静态导出产物 `apps/web/out/spain{,/simulate,/result,/whatif,/policy}.html`、`apps/web/out/offline-pages.json` 与 `apps/web/out/sitemap.xml` 均存在且内容正确；`git diff --check` 退出码 `0`。

## 3. 没做或没验证的

- 按任务分工与 brief 要求（「不要跑 Playwright，不要同时开多个构建」「浏览器 e2e 与截图由 Fable 运行」），未在本地启动 Chromium 运行 Playwright 浏览器 e2e；`apps/e2e/tests/spain.spec.ts` 已编写完成并通过 ESLint 与 TypeScript 类型检查，留待 Fable 在浏览器环境中验收与截图。
- 未改动规则引擎语义和政策参数，未改动英国及其他国家的页面，未新增截图基线比较。

## 4. 发现与建议

- `packages/engine/src/spain-nationality.ts` 中 `ES-N13`（社会融合与学龄／机构证明）在判断成年人是否属于“获司法豁免并在适用机构登记”时，使用了 `any(exams.minor, n.examRelief === undefined ? undefined : n.examRelief === 'judicial-exemption-confirmed')`。因此成年申请人若未显式选择 `examRelief`（例如选 `none`）且未填 `registeredWithSchoolOrCareCentre: false`，即使已满 18 岁并通过了 DELE 与 CCSE，`ES-N13` 仍会保持 `UNKNOWN`。问卷中已提供 `examRelief`（「无／不适用」）与 `registeredWithSchoolOrCareCentre` 选项，建议后续若优化引擎，可在成年人已通过 DELE 和 CCSE 考试时默认视为无需司法免试机构证明。

## 审核修正（review97-1）

修正者：Claude Opus 5.5。PROGRESS 634–643，尾注 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`。每项先写失败的回归测试再修。brief 列出的共用文件 `policy-page.tsx`、`country-module.ts`、`share.ts`、`page-result.ts` 未改。

### 1. 做了什么

| PROGRESS | Commit | 审核项 | 改动 |
|---|---|---|---|
| 634 | `bbd9fbd0` Fix: 西班牙问卷可清回待确认并区分未填与确定值 | 问题 1、5、6 | 第 1、2 步顶层字段直接写入 `{ [key]: value }`，显式 `undefined` 覆盖旧值：记录完整性、入籍类别、结婚日可改回待确认，最后一条许可或出境记录可删除，空列表可从「已确认没有」改回待确认。居留许可「是否学习」改为必答（「请选择」→ 是／否），旧版表单迁移时写入 `study: false`。官方假日列表的空白行在填写中可保存，刷新不丢草稿；提交时按行报 `<id>-<i>`，错误只显示在该行，输入框带 `aria-invalid` 与 `aria-describedby`，提交后焦点落在该输入框。 |
| 635 | `6ed71162` Fix: 西班牙学龄子女清单待确认时按待确认评估 | 问题 2 | 新增 `spainEngineInput`：`schooling` 只有通知日或补件截止日、`children` 未确认时，送引擎前略去该组，`ES-L13` 为待确认。本机结果与分享链接都不再抛 `TypeError`，草稿保留用户填的日期。 |
| 636 | `5c30a97d` Fix: 西班牙对比页只改写用户移动的旋钮 | 问题 3、4；建议 3 的年薪旋钮 | 是／否旋钮（DELE、CCSE、医保、品格审查）的起始值取基线结果中对应条件的状态：全部满足为「是」，全部不满足为「否」，其余为待确认，`pending` 不再算作「否」。数字旋钮取各所选路径一致的值。`apply` 只改写与起始值不同的旋钮，未改动时副本等于 `activeSpainAnswers(draft)`，每条路径显示「与当前情景相同」。旋钮可改回待确认或清空，相应字段改为未答。DELE、CCSE 选「否」同时排除免试国籍与免试决定，`ES-N11`、`ES-N12` 为不满足；DELE 选「是」时等级取 `nationalityDeleMinimum`。医保按 E、R-E、M（非营利）、F 各自的递交日写入，选「否」时取消主申请人保单对随迁家属的覆盖。家庭人数同步 M 非营利的受扶养人数。「无出境」同时清除 U 的取得后最长离境和死亡工人记录中的出境。控件只为读取它的路径显示：R-E、U 不显示月收入，M 显示出境，年薪仅在 M 受雇目的显示，只选 F 时不显示品格审查。移除误指控件的 `ES-M05`、`ES-N13`、`ES-R06`、`ES-U05` 跳转。问卷的家庭人数与自然人雇主家庭人数下限改为 1，与对比页一致。 |
| 637 | `45e87300` Fix: 西班牙草稿解码只核对所选路径并补日期先后校验 | 风险 3 | 解码只检查当前可见步骤的格式，取消勾选路径中的残留答案不再丢弃整份草稿，重新勾选后照常校验。CCSE 答对题数以 `nationalityCcseQuestions` 为上限。CCSE 签发／有效期、入学通知／补件截止、蓝卡起算／迁入日期补先后校验。旧版表单入籍类别无效时拒绝导入，不再改为 `general`。 |
| 638 | `650c08a8` Fix: 西班牙记录完整性与获批后公证停钟改为必答 | 风险 4 | `timeRecordsComplete` 改为必答。填了获批通知日后，`notarialSuspensionAwaitingConfirmation` 须答是或否，标星号并在提交时校验（字段定义新增 `requiredWith`）。 |
| 639 | `f6abed43` Fix: 西班牙结果页标明费用与后续手续，注明永久居留取得日 | 风险 5 | 不在 `decidedBy` 的条目，西班牙改用「费用、办卡、获批后手续与分支明细（不决定本路径结论）」折叠标题（`result-view.tsx` 按国家选标题，其他国家不变）。`ES-U` 已满足且取得日早于评估日时，结论下写「已于 YYYY-MM-DD 取得永久居留权。」 |
| 640 | `91644440` Fix: 递增离线缓存版本以缓存西班牙子页 | 风险 2 | `sw.js` 缓存版本改为 `2026-11-24-es`，`about-page.test.tsx` 同步。 |
| 641 | `11d9919f` Fix: 西班牙问卷文案与共用标签按位置拆分 | 建议 1 | 修正「散星」与英文多余空格。自由流动关系改用「与欧盟或西班牙公民主申请人的家庭关系（U02／U03）」。医保、雇主、收入、居留阶段、亲属关系的 `kind` 各用专属标签，删除通用的 `es.field.kind`。`choice` 可为个别取值换用本处措辞：普通离境、提前退休、境外考点、受扶养直系尊亲属；原共用选项去掉另一处的含义。 |
| 642 | `73c17f8b` Fix: 西班牙问卷按所选路径精简字段 | 建议 3 | 出境原因与连续性例外独立成组，L、E 共用。国内长居直接事由组仅选 L 时显示，欧盟长居详细记录组仅选 E 时显示，隐藏组的答案不送引擎。主申请人获批后只问 M 读取的社保 alta，随迁家属只问 F 读取的许可到期、卡类与制卡费。只选 U 时第 1 步不问西班牙居留许可。直接事由的空选择按钮改为「仅按普通居留年限申请，不主张直接取得事由」。 |
| 643 | 本节 `Docs` 提交 | — | 报告。 |

建议 4 的回归测试分散在以上提交中：

| 建议 4 | 覆盖位置 |
|---|---|
| ① 未改旋钮显示「与当前情景相同」 | `test/spain-whatif.test.tsx`：L+N 仅 L 已审查；L、M 安全审查 `pending`；E/M/F/R-E 过期或未确认的保单；只缺签发日的 CCSE 与登记等效 DELE；E、F 资源不同且 E 缺 `stable`。断言副本与基线一致、结果相同，渲染对比页数出每条路径的「与当前情景相同」。e2e 第一个用例从结果页跳到对比页后断言两条路径都显示该提示。 |
| ② 删除最后一条、改回待确认、假日空白行刷新 | `test/spain-questionnaire.test.tsx`；e2e 第一个用例在第 1 步添加再删除出境记录、确认没有再改回待确认，在第 4 步添加空白假日后刷新，确认已填答案与空白行仍在。 |
| ③ `schooling` 缺 `children` | `test/spain-questionnaire.test.tsx`，同时打开分享链接。 |
| ④ 对比页分享回读 | `test/spain-whatif.test.tsx`：改动后的副本编码再解码相等，分享结果与副本结果相同。 |
| ⑤ `PolicyPage` 无 `country.id` 保留默认标题 | 未做，见第 3 段。 |

### 2. 怎么验证的

- 在 `73c17f8b` 上运行 `export VITEST_MAX_WORKERS=2; pnpm lint && pnpm typecheck && pnpm test && pnpm build`，整条命令退出码 0：6 个包 lint、typecheck 通过；测试 error-report 2 项、policy-data 23 项、engine 6,006 项通过（1 项既有测试跳过）、game 1,348 项、web 862 项全部通过；静态构建导出 36 个页面，含西班牙五页。
- 西班牙相关单测：`VITEST_MAX_WORKERS=2 pnpm --filter web exec vitest run test/spain.test.tsx test/spain-questionnaire.test.tsx test/spain-whatif.test.tsx test/about-page.test.tsx`，4 个文件 37 项通过。新增的 `spain-questionnaire.test.tsx`（10 项）与 `spain-whatif.test.tsx`（8 项）中，各审核项的用例在修正前均先运行失败（`spain-whatif` 的分享回读用例在修正前已通过，作为回归保留）。
- 浏览器 e2e：`cd apps/e2e && E2E_PORT=4432 npx playwright test tests/spain.spec.ts --project=desktop --reporter=line`，2 项通过，退出码 0；随后删除 `apps/e2e/test-results`。

### 3. 没做或没验证的

- 问题 7（`PolicyPage` 缺 `country.id` 时标题为空）、风险 1 中分享链接覆盖本机草稿的部分、建议 2 的年份千分位：只能在共用的 `policy-page.tsx`、`page-result.ts`、`share.ts`、`result-page.tsx` 中修，待任务 93 的共用修正合入后解决；建议 4 ⑤ 的回归测试随之补。
- 风险 1 中「跳到主要内容」洗掉 `#s=`：链接由共用的 `site-shell.tsx` 渲染。日本的处理是在该文件按国家把链接换成按钮，并配合 `result-page.tsx` 的场景哈希跟踪，只改西班牙页面无法修。待任务 93 把这些国家判断统一后，把西班牙加入同一名单即可。
- 建议 2 的 `SRC-345` Hoja 52 链接：brief 只要求做建议 1、3、4，未改，见第 4 段。
- 未做截图视觉验收；本轮页面改动是问卷字段分组、按钮文字、对比页控件显隐与结果页折叠标题。

### 4. 发现与建议

- DELE 或 CCSE 选「否」会把已批准或待决的免试决定改为「无」。ESO 学历、全部免试与司法免试同时覆盖两项考试，所以只把 DELE 设为「否」时，原本靠免试满足的 `ES-N12` 也会随之变化。对比页没有为此另加说明。
- `spainFull2026_11.values.nationalityDeleExemptCountries` 已有免试国家清单，`spain-fields.ts` 另写了一份相同的代码列表，可改为从参数生成。
- 问卷文案里仍有政策数字直接写在翻译中（如「上限 10 个工作日」「€16.08」「459 个月」），没有经参数文件生成，参数更新时容易不一致。
- `spain-policy-rules.ts` 中 `ES-F01`–`ES-F04` 的 `SRC-345` 没有带引擎里 Hoja 52 的专属 URL，政策页会链到 Hoja 51。
- 本轮只处理审核点名的两处「留空被当作确定值」，其他布尔证据未逐项排查。

## 合入 main 与共用选项接入

修正者：Claude Opus 5.5。PROGRESS 644–647（650 起已被任务 88 占用），尾注 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`。澳大利亚完整版页面（任务 93，#81）合入 main 后，按其报告“其他国家怎么接入这次的共用改动”一表接入西班牙。每项先写失败的回归测试再改。

### 1. 做了什么

| PROGRESS | Commit | 内容 |
|---|---|---|
| — | `3edb2bdb` Merge: 合入 main（澳大利亚完整版页面 #81） | `policy-page.tsx` 取 main 的版本：本分支对它的两处改动（标题按国家、非英国分组）已被 main 的写法覆盖，即标题缺国家或未登记文案时回退、千分位按字段语义。`site-countries.ts` 同时登记 `es` 与 `au`。`sw.js` 与 `about-page.test.tsx` 缓存版本改为 `2026-11-25-es`。`i18n/{zh-CN,en}.ts`、`PROGRESS.md`、`result-view.tsx` 自动合并，本分支的西班牙折叠标题保留。 |
| 644 | `56e1b7cc` Fix: 西班牙分享链接不覆盖本机草稿，跳到主要内容保留场景片段 | 西班牙模块设 `scenarioLinks: true`：本机已有草稿时打开分享链接不覆盖它；结果、编辑与对比链接带 `#s=` 或 `#draft=`。`site-shell.tsx` 的场景路径判断加入西班牙结果、问卷、对比三页，“跳到主要内容”在这三页是按钮，不改地址栏片段。 |
| 645 | `8e313e3c` Fix: 西班牙检查项按时间、条件、费用、获批后事项与可选依据分组 | `spain-module.ts` 的 `run` 为每项检查设 `kind`，见下表。 |
| 646 | `7fd5821a` Fix: 西班牙政策页嵌套参数按含义展示，年份不加千分位 | `spain-policy.ts` 提供 `displayParameter`：20 项嵌套参数的原始字段名换为带单位的中英文名称（如“单次离境上限（月） 6”），DELE 免试国家代码显示为“阿根廷 (AR)”等。`country-views.test.tsx` 原以 `es` 代表“未登记标题的国家”，合入后西班牙已有标题，改用 `gr`。 |
| 647 | 本节 `Docs` 提交 | 报告，补记最终验收与 e2e。工作区里上一位修正者已写好的第 1 段经核对后保留，没有丢弃。 |

检查项分组（`kind`）：

| 分组 | 条件 |
|---|---|
| 时间条件 `time` | `ES-N01`、`ES-L01`、`ES-L01-PERMIT`、`ES-L01-SINGLE`、`ES-L01-TOTAL`、`ES-L02`、`ES-E-TIME`、`ES-E01`–`ES-E04`、决定路径时的 `ES-U04` |
| 费用预算 `budget` | `ES-N16`、`ES-L14`、`ES-E09`、`ES-M10`、`ES-M10-work-fee`、`ES-F05`、`ES-F05-card-fee`、`ES-R08` |
| 批准后事项 `afterApproval` | `ES-N17`、`ES-N18`、`ES-M09`、`ES-M09-card`、`ES-F05-effective`、`ES-F05-effective-card`、`ES-R08-visa`、`ES-R09`、`ES-T01`、`ES-T02`、`ES-U13` |
| 办理提示 `information` | `ES-M11`（后续转换）、`ES-F01-grant`（获批顺序） |
| 可选依据 `alternative` | 国内长居直接事由 `ES-L03`–`ES-L09`；自由流动的提前取得途径 `ES-U07`–`ES-U11`；另一依据决定路径时列出的 `ES-U04`、`ES-U05`、`ES-U06` |
| 申请条件 `requirement` | 其余各项 |

西班牙各路径本来就有 `decidedBy`，不在其中的条目早已不进“还差什么”。设 kind 后的变化是：结果页在每项标题后标出分组；设了 kind 的待定项按日本、澳大利亚的做法显示“待定细节”。入籍申请费 `ES-N15` 要求递交前缴付，引擎把它算进 `decidedBy` 并参与推算日期，所以仍标为申请条件，未缴时照常列在“还差什么”。

原报告中标为“待任务 93 的共用修正合入后解决”的条目：

| 条目 | 处理 |
|---|---|
| 问题 7：`PolicyPage` 缺 `country.id` 时标题为空 | 合入 main 后解决。`policy-page.tsx` 取 main 的版本，无 `id` 或未登记 `<国家>.policy.pageTitle` 时回退 `policyPage.title`。 |
| 风险 1：打开分享链接覆盖本机草稿 | 644，`scenarioLinks: true`。 |
| 风险 1：“跳到主要内容”洗掉 `#s=` | 644，`site-shell.tsx` 加入西班牙三页。 |
| 建议 2：年份千分位 | main 按键名判断年份（以 `year`、`from`、`cohort` 结尾的 1900–2100 整数），自动生效。核对结果：`ipremYear`、`smiYear` 显示 2026；`retirementTable` 的年度在 646 改用中文字段名后按文本显示，仍为 2026；`nationalityExamPriceYear` 本身是字符串。政策页不再出现 `2,026`。 |
| 建议 4 ⑤：`PolicyPage` 无 `country.id` 保留默认标题的回归测试 | main 的 `country-views.test.tsx` 已覆盖无 `id` 和未登记标题两种情形（后者合入后改用 `gr`）；西班牙标题由 `spain.test.tsx` 覆盖。 |

brief 第 2 项“结果日期不是最早可申请日期的路径设 `earliestLabel`”：未设置。西班牙八条路径的日期都来自引擎的 `projectFilingDate(s)`：在候选递交日重跑全部决定条件，首个全部满足的日期即为 `earliestDate`；已满足时取模拟日。日期只随递交时的事实移动，如居留年限、CCSE 签发日、申请费缴付日、免试决定等待期、医保起保日、禁返承诺期满；机关认定类条件只按用户所答的是或否计入，不改变日期。获批后宣誓登记、入境生效、申卡和费用都不在 `decidedBy` 中，不影响该日期。自由流动永久居留（U）依法自动取得，日期是取得永久权、可申请永久证明的日子；已取得时结论下另注明取得日（review97-1 风险 5）。所以通用文案“最早可申请日期（推算）”符合各路径的含义，没有改动。

### 2. 怎么验证的

- **先失败后通过**：把对应提交前的源文件放回工作区，用 HEAD 的测试运行，再还原。644：`spain-module.ts` 与 `site-shell.tsx` 取 `56e1b7cc^`，`test/spain-links.test.tsx` 4 项全部失败。645：`spain-module.ts` 取 `8e313e3c^`，`test/spain.test.tsx` 的 kind 分组 3 项失败（含中英文两项）。646：`spain-policy.ts` 取 `7fd5821a^`，政策页参数 2 项失败（中英文）。还原后全部通过。
- **西班牙及关联单测**：`VITEST_MAX_WORKERS=2 pnpm --filter web exec vitest run test/spain.test.tsx test/spain-links.test.tsx test/spain-questionnaire.test.tsx test/spain-whatif.test.tsx test/country-views.test.tsx test/policy-page.test.tsx test/about-page.test.tsx`，7 个文件 64 项通过。
- **完整验收**：`(export VITEST_MAX_WORKERS=2; pnpm lint && pnpm typecheck && pnpm test && pnpm build)`，退出码 0。6 个包 lint、typecheck 通过；测试 error-report 2 项、policy-data 23 项、engine 6,006 项通过（1 项既有测试跳过）、game 1,348 项、web 896 项（49 个文件）全部通过；构建生成 40 个静态页面，含西班牙五页。
- **年份千分位**：在导出的 `apps/web/out/spain/policy.html` 中查找 `2,026`，0 处；页面上唯一带千分位的数是 `smiMonthly` 的 1,221 欧元，属金额。
- **浏览器 e2e**：`cd apps/e2e && E2E_PORT=4452 npx playwright test tests/spain.spec.ts tests/australia.spec.ts tests/japan.spec.ts tests/site.spec.ts --project=desktop --reporter=line`，21 项全部通过，退出码 0；已删除 `apps/e2e/test-results`。西班牙两项用例在 `scenarioLinks` 打开后无需改动：结果页地址仍为 `/spain/result`，复制的分享链接带 `#s=`，接收方结果与原页一致，从“还差什么”跳到对比页聚焦 DELE 旋钮、两条路径显示“与当前情景相同”。
- **视觉核对**：用 Playwright 打开导出静态站的 `/spain/policy`，展开全部折叠后截取 1280px 与 375px 两种宽度。`nationalityYears`、`retirementTable`、`earlyPermanent`、`euDocument` 等行显示中文字段名与单位，DELE 免试国家显示“阿根廷 (AR)”等；两种宽度下 `scrollWidth` 与 `clientWidth` 相等，无横向滚动。

### 3. 没做或没验证的

- 未 push，未开 PR，按 brief 留给 Fable。
- 没有设 `earliestLabel`，理由见第 1 段末尾：西班牙八条路径的日期都是推算的递交或取得日，通用文案“最早可申请日期（推算）”与之相符。
- e2e 只跑了 brief 指定的四个文件、desktop 项目；mobile 项目和其他国家的 e2e 未跑。
- 视觉核对只看了政策页的嵌套参数。结果页的分组标注和“跳到主要内容”按钮只经单测与 e2e 验证，没有另截图。

### 4. 发现与建议

- `site-shell.tsx` 里判断场景路径的变量仍叫 `isJapanScenario`，现在已列出日本、澳大利亚、西班牙三国。它其实可以直接读国家模块的 `scenarioLinks`，以后新国家就不必再改这个共用文件。brief 没要求改共用命名，这里没动。
- 西班牙的嵌套参数是对象，政策页把它显示成一行“名称 值、名称 值”。`retirementTable`、`euDocument` 这类字段多的参数在窄屏上偏长。改成行数组就能自动显示为表格。
- 原报告第 4 段的两条（`SRC-345` Hoja 52 链接、问卷文案里直接写的政策数字）本次未处理，仍然有效。
