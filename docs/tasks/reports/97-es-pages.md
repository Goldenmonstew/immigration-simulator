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
