# 任务 98 · 希腊完整版页面

实现者：Claude Opus 5.5。brief 分配的 PROGRESS 行号 660–669 已被任务 88 的审核修正占用（660–675），本任务顺延使用同段空着的 676–679。

## 1. 做了什么（按 commit 列）

| PROGRESS | Commit | 文件 |
|---|---|---|
| 676 | `Refactor: 政策页标题与参数千分位按国家通用（希腊）` | `apps/web/components/policy-page.tsx`，原样取自 `fable/93-au-pages`：非英国国家读 `<国家>.policy.pageTitle`，参数千分位对所有非英国国家开启。 |
| 677 | `Feat: 接入希腊八条路径的完整版问卷、结果、对比与政策页` | `apps/web/lib/greece-{draft,fields,module,policy,whatif}.ts`；`apps/web/app/greece/` 首页与 `simulate/{page,evidence-fields}.tsx`、`result`、`whatif/{page,controls}.tsx`、`policy`；删除旧的 `apps/web/lib/greece.ts` 与旧单测；`apps/web/i18n/countries/greece{,-form}.ts`，`hub.gr.*` 从公共字典移入希腊字典并改为完整版范围；`apps/web/lib/site-countries.ts` 登记五个子页；`apps/web/public/sw.js` 缓存版本改为 `2026-11-24-gr`（`about-page.test.tsx` 同步）。 |
| 678 | `Test: 验证希腊完整版模块、政策目录与双语流程` | `apps/web/test/greece.test.tsx`（15 项），`apps/e2e/tests/greece.spec.ts`（2 项，替换旧用例）。 |
| 679 | `Docs: 任务 98 希腊完整版页面报告` | 本报告。 |

各 commit 末尾为 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`。

### 国家模块

- 草稿 `GreeceDraft` 即 `GrFullRequest`（去掉 `locale`），另加 `version/step/completed`、所选路径 `pathways`、离境行程完整确认 `tripsComplete`，入籍的逐年收入以行录入（`nationality.incomeYears`），送引擎前按年份转成 `incomeByTaxYear`。
- `run` 先用 `activeGreeceAnswers` 去掉未选路径的答案，再调用 `evaluateGreeceFull`。引擎在没有专门说明时以条件标题（或“请补充或核实‘标题’所需的资料”）作说明，结果页标题下会重复一遍；模块把这类说明换成“根据所填资料，这项条件已满足／未满足”或“请补充或核实这项条件所需的资料”，带日期的只保留“最早日期为 …”。
- 存储键 `gr-immigration-draft-v1`、`gr-immigration-scenarios-v1`；分享地址 `/greece/result#s=…`，信封 `{country:"gr", v:1, draft}`。
- 政策：规则集 `gr.current-law-2026-11`（SRC-086、087、089、350），参数直接用 `greeceFull2026_11`（含时间版参数与生效日），8 条路径。条件元数据由引擎对各路径、各阶段的探测请求生成标题与来源（只用空历史，耗时几毫秒），六个时间条件（`LT-TIME-*`、`NAT-TIME-RESIDENCE`、`GV-TIME-*`）的标题带日期，改用静态标题并取对应参数的来源；只在特定分支出现的 PD 编号按引擎源码登记在 `greece-policy.ts`。共 102 个条件、78 个参数、6 条变更（移民法典施行、Β.5 分档、入籍修法、ν. 5275/2026、保护等待期、经济融入通函），来源清单经 `withPolicySources` 只列本国引用的 34 项 SRC。

### 问卷步骤与每步字段

步骤按所选路径显示：第 1–3 步总是显示，其余按路径出现。共约 365 个问题定义（希腊／欧盟家属共用“居住”与“保留居留”两组），覆盖 `evaluateGreeceFull` 读取的全部输入；只有引擎类型里的必填项（列表行内的日期、类型等）标 *，其余可留空或选“不确定”，结果里显示为待确认。分组一律可折叠，列表都能“确认无此项记录”（包括嵌套列表，例如外派期间、蓝卡跨国期间、随行家属、刑事判决），未填与确认为无分别送 `undefined` 与 `[]`。

| 步骤 | 显示条件 | 字段 |
|---|---|---|
| 1. 日期与申请路径 | 总是 | `simulationDate`*、`birthDate`、`citizenship`；八条路径多选（至少一条）。 |
| 2. 居留许可与出境记录 | 总是 | `permits[]`（类型*、起*、止、卡面签发日、事由）、`permitHistoryComplete`；`trips[]`（离境*、返回*，选了家属路径时另问 `familyAbsenceReason`）。有行程时必须勾选“我已列出评估期间所有离开希腊的行程”，否则不能继续；记不全可删掉行程，依赖离境的条件转为待确认（引擎收到 `trips: undefined`）。选了 Μ.1／Μ.2 时问 `backlogRenewals[]`（五项均必填）；`currentCardExpiresOn`、`renewalForceMajeure`。 |
| 3. 证件、品行、材料与保险 | 总是 | 身份与入境：`entry`、`passport{kind*, issuedOn, expiresOn, blankPages, expectedDeparture}`，欧盟家属另问 `euFamilyEntryEvidenceAccepted`，黄金签证另问 `overseasInvestorMandate`。品行：`publicOrder`、`character{finalSentenceMonths, repeatOffences, seriousSecurityListingYears, seriousListingRemovalRefused}`、`publicHealth`。手续：`filingDocuments{formReady, feeReceiptReady, feeExemptionDocumented}`、`biometrics`、`missedFingerprintAppointments`、`changes[]`（类型*、发生日*、申报日、护照换发时的下次换卡日）、`deferredInitialEvidence`（多选）。保险：`insurance{kind*, coversFamily}`，私保另问保险公司所在地、是否明确承保在希居住、三项保额、最高自付、免赔与除外、期限，断保另问证明与递交日公保。 |
| 4. 长期居留 Μ.1 与十年居留 Μ.2 | 选 Μ.1 或 Μ.2 | Μ.1：`longTerm`（阶段、居留类别、旅行证件页、重新取得时的丧失原因与证明、Μ.2 转换、取得日、连续离欧月数、连续离希年数、前蓝卡注记、其他丧失事由）、`grantedProtection{claimedOn*, grantedOn*, priorResidenceExcludedThrough 或“无”}`、`blueCardMobility`（长期流动、希腊蓝卡起止与在希居住起日、`priorMemberPeriods[]`、`otherMemberTrips[]`）。共用：`integration{basis*}` 按凭证类型追问等级、证书、考试日与分数、连续居留起日、行程未中断、学生期或空档（标 PD-305／PD-312）、旧制年限；`residenceIncome{netEur, dependants, regularAndDocumented}`。Μ.2：`tenYear` 全部 18 项，“经核实的合格居留起始日”“许可空档”“旅行证件全部页”三项提示 PD-312 的待确认口径。 |
| 5. 归化入籍 | 选入籍 | `route`（一般／缩短／其他非临时许可通道，可留空）。申请与身份：阶段、递交时许可、缩短通道依据、希腊籍子女出生日、在希出生并居住、待决申请递交日、上次驳回日或“无”、修法前异议例外、随配偶外派（证明、居住满规定年限的日期或“尚未满”、外派期间列表*）。刑事：`convictions[]`（终审*、罪名类别*、犯罪日*、刑期*）、驱逐或身份程序。考试：考试形式，笔试问考试日与语言／知识分数，口试问考试日与是否通过，证书或豁免文件、残障程度、学习障碍、禁考裁定、学年与大学学位。经济：`incomeYears[]`（年度*、应税收入*、受扶养人数*、福利）、税保、经济活动、生活来源、融入评估。材料与宣誓：民事身份证明、ΑΜΚΑ、完税通知、费档、公报日、宣誓日或“尚未宣誓”。 |
| 6. 黄金签证 Β.5 | 选黄金签证 | 申请与制度（阶段、境外递件及补齐日、制度、原批档位与条件、过渡区位、订金比例与日期、交割日、替换房产）；房产（投资类型、区位、岛屿人口、房产数、计入金额、取得方式、评估价值、产权或租约、旅游租约类型与 ΕΟΤ 证明、建成或许可、面积、用途变更完成与日期、行政文件日期、厂房停用年数、全额付款）；付款与登记（付款方式、付款人、公证、登记完成或回执／律师证明、首签已交登记证明、Ε9、公司股权、建筑与付款证明、续期用途声明）；用途与续期（用途、在希工作、保有投资、保护建筑修复）；随行家属 `family[]`（关系*、出生日、材料、未婚与监护、失能受扶养、原家属卡转换）与国家投资签证人数。 |
| 7. 希腊公民与欧盟公民的家属 | 选 Ο.3／Μ.3 或 Ν | 希腊公民家属：阶段、关系、婚姻登记、伴侣缔结地、希腊籍子女或兄弟姐妹出生日、受扶养、失能、关系真实；居住（共同居住起日、居住证明、原卡到期、取得永久权日、取得后最长离境、首签日期、稳定居住、原 Ο.3 签发日、到期自动转永久、兄弟姐妹延长、到期后中断、最长连续离境、单个居留年度最多离境月数、超限事由与月数）；材料；`retention`（依据、事件日、子女出生日、申请日、结婚日、婚姻存续截止、在希居住起日、生计、资源认定）。欧盟公民家属另问担保人身份、条约居留、学生担保、关系、伴侣视同婚姻、个别认定、虚假或欺诈、`primaryCare`、抵达日、是否领过卡、已取得永久权、年度普通离境最多月数、重大事由次数与最长月数（提示 PD-315）、`early`（依据*及事件、担保人信息与工作月数等）、发病日、第 59 条材料、`partnerRenewal`、`schooling`。年度汇总的提示写明“居留年度从居住起始日（填了就显示该日期）起每满一年为一个年度，不按日历年”。 |
| 8. 受雇工作与第三国家庭团聚 | 选 Ε.1／Ε.4 或 Ο.1／Ο.2 | 工作：类别、阶段、入境或转换方式、`mobility`、`switchVisa{kind*, expiresOn}`、高技能许可转换；合同与工资（期限、合同、全职、雇佣申报、现有合同、年薪、计薪方式与金额、资格、固定住址）；雇主与配额（批准、雇主类型、邀请人数、营业额、税务支持工资、岗位相符、农业用工证明、中介资本与管理、用工方证明、配额、项目证明与人数）；续期（蓝卡中断类型、持卡年数、中断月数、获认可的假期、纳税、参保申请、递交日公保）。家庭团聚：担保人（阶段、身份、合法居留年数与起日、许可期限、通往永居、目前有效、续期、同步首签、个人净收入、稳定、上年税保）；家庭与住房（关系、配偶与子女人数、父母均在希、住房凭证与适足、子女监护、成年子女失能、唯一配偶、境内组建、关系真实、证明签发日、未变声明、出生记录、家庭生活）；自主居留 Ο.2（依据、原家属卡与子女专卡、其他事由许可、公保申请、私保许可、家属居留年数、首张团聚许可日与年数、实际居住起日、蓝卡家属欧盟年数与起日、担保人去世日、婚姻年数与在希年数、特殊困难）。 |

未提问的三项是引擎为旧请求保留的合并答案：`euFamily.qualifyingNonGreekEuSponsorAndRelationship`（问卷分开问担保人与关系）、`familyTcn.jointBlueCardApplication`（用 `jointInitialApplication`）、随行家属关系 `spouse-partner`（分开问配偶与登记伴侣）。

### 对比旋钮

| 焦点 | 控件 id | 作用（只改副本，问卷基线不变） | 关联条件 |
|---|---|---|---|
| `date` | `gr-whatif-date` | 模拟／拟递交日 | 所有 `*-TIME`、`*-TIME-*`（离境两项除外）、`C-07-window`、`NAT-01`、`NAT-11`、`TY-01`、`GF-03`、`EF-02`、`FT-07` |
| `trips` | `gr-whatif-trips` | 假设没有离境：行程清空并视为已确认，已填的离境汇总（Μ.1 离欧／离希、家属年度汇总、永居后最长离境）归零 | `LT-TIME-SINGLE-ABSENCE`、`LT-TIME-TOTAL-ABSENCE`、`LT-07`、`TY-05`、`GF-08`、`EF-03`、`EF-07` |
| `language` | `gr-whatif-language` | Μ.1／Μ.2 的希腊语证书等级（改为“希腊语证书”凭证） | `LT-04`、`TY-02`、`*-INTEGRATION-DOCUMENT` |
| `exam` | `gr-whatif-exam` | 入籍考试：已获 Π.Ε.Γ.Π. 证书或未通过 | `NAT-05`、`NAT-06` |
| `income` | `gr-whatif-income` | 上一纳税年度家庭净收入 | `LT-02`、`TY-04` |
| `salary` | `gr-whatif-salary` | 受雇税前年薪 | `WK-01`、`WK-04` |
| `sponsorIncome` | `gr-whatif-sponsor-income` | 团聚担保人个人净收入 | `FT-02` |
| `investment` | `gr-whatif-investment` | 黄金签证计入金额 | `GV-01` |

后五个旋钮只在选了对应路径时显示。结果页“还差什么”里的条件按上表跳到对应控件。

### 旧链接与旧草稿

旧 `/greece` 单页只用 React 状态保存输入，没有本地存储，也不生成分享链接，因此没有需要迁移的旧草稿或旧链接。原网址保留并由新首页接管（开始模拟、政策依据、本机保存的情景）。旧的只算时间评估 `evaluateGreece` 留在引擎里不动（完整版也复用其时间计算），网页侧的 `lib/greece.ts` 已删除。

## 2. 怎么验证的

- 开发中：`VITEST_MAX_WORKERS=2 pnpm --filter web exec vitest run test/greece.test.tsx` 及共用组件相关的 12 个文件（country-views、whatif、gap-summary、policy-page、page、about-page、locale、share、scenarios、japan 等）共 273 项通过；`apps/web` 与 `apps/e2e` 的 `tsc --noEmit`、ESLint、Prettier 通过；`git diff --check` 通过。
- 单测覆盖：首页与集合入口链接；五个子页进入离线清单与 sitemap；全部问题、选项、提示有中英文；本地存储、保存情景、分享信封往返，与日本链接互不误读；畸形草稿拒绝、未完成链接回到对应步骤；各步校验（必填、日期先后、行程未确认、出生日晚于模拟日、数字与整数）；按路径显示步骤；请求只带所选路径答案并转换逐年收入；`run` 的满足（2018 年起持证，MET 2026-11-23）、未来日期（2022-06-01 起，FUTURE 2027-06-01）、待确认（缺保险）；说明不再重复标题；未确认的行程不进入计算、确认后最早日期 2030-09-01；旋钮 `apply` 与 `focusForRule`；结果与对比视图的日期；问卷各步实际渲染出 e2e 使用的字段 id；政策目录含时间条件与 PD、只列希腊来源、六条变更。
- e2e 断言的日期、状态与 id 均先在单测中由同一份草稿算出：结果为“最早 2027-06-01 满足条件”，对比页把日期改为 2027-07-01 后显示 `2027-06-01→2027-07-01`。
- 完整验收：最终工作树设置 `VITEST_MAX_WORKERS=2` 后串行运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码 0。测试 error-report 2、policy-data 23、engine 6,006（另有 1 项既有用例跳过）、game 1,348、web 848 项通过；Next.js 生成 36/36 个静态页面。`apps/web/out/greece{,/simulate,/result,/whatif,/policy}.html` 均已导出，五个路径都在 `offline-pages.json` 与 `sitemap.xml` 里；导出的政策页有 102 个条件、78 个参数、34 项来源、6 条变更，标题为“希腊政策依据”。

## 3. 没做或没验证的

- 按 brief 没有运行 Playwright；`apps/e2e/tests/greece.spec.ts` 只做了类型检查与 lint，浏览器 e2e、375 px 横向滚动与截图由 Fable 运行。
- 没有在浏览器里目视检查问卷与结果页布局。
- 没改规则语义和参数，没改英国和其他国家页面，没做游戏。

## 4. 发现与建议

- 引擎 `grContext().check` 在没有专门说明时把标题当说明（或包进“请补充或核实‘标题’…”），页面只能事后替换。建议引擎在这种情况下返回不含标题的通用说明。
- 条件元数据（尤其 PD 编号）只能从引擎分支里人工登记；引擎若导出条件 id、标题与可能的 PD，政策页可直接复用，避免两处漂移。
- 共用组件里结果页场景片段、跨日刷新等仍按 `country.id === 'jp'` 特判，希腊走默认路径；十国完成后可统一。
- `sw.js` 缓存名与新西兰、加拿大分支一样按国家加后缀（`2026-11-24-gr`），合并时需择一个新版本号。
- `hub.gr.*` 与其他国家一样从公共字典移入本国字典，合并时公共字典的删除行可能与兄弟分支相邻冲突。

## 审核修正（review98-1）

实现者：Claude Opus 5.5。PROGRESS 行号用 790–794（任务 98 原段 676–679 已满，本分支与各 `fable/*` 分支在 739 之后已占 740–764、770–777、780–783、800–816、850–853）。每项先在 `apps/web/test/greece.test.tsx` 写回归测试、确认失败后再修。共用组件（`policy-page.tsx`、`country-module.ts`、结果页分组、`share.ts`、`page-result.ts`）没有改。

### 1. 做了什么（按 commit 列）

| PROGRESS | Commit | 对应审核编号 |
|---|---|---|
| 790 | `Fix: 希腊对比旋钮按条件实际读取的答案调整（review98-1）` | 问题 1、2、3；风险 3、4；建议 4 |
| 791 | `Fix: 希腊政策目录补齐入籍时间汇总条件并核对待定细节（review98-1）` | 问题 4；建议 1 |
| 792 | `Fix: 希腊问卷剔除隐藏答案并确认各类境外期间已列全（review98-1）` | 风险 2、5；建议 2、3、5 |
| 793 | `Chore: 希腊审核修正后递增离线缓存版本（review98-1）` | brief：`sw.js` 改为 `2026-11-25-gr`，`about-page.test.tsx` 同步 |
| 794 | `Docs: 任务 98 审核修正报告（review98-1）` | 本节 |

**问题 1（条件与旋钮映射）**：逐条对照引擎读取的输入核对 `focusByCondition`。

- WK-04 改为跳到新的“税前月薪／日薪”旋钮（焦点 `pay`，id `gr-whatif-pay`），初值取问卷 `work.grossPayEur`。标签按 `payBasis` 显示月薪、日薪或“需先在问卷选择计薪方式”。旋钮只在 Ε.4 首签时显示。审核例中月薪 500 改为 920 后，WK-04 由 `NOT_MET` 变为 `MET`。
- WK-01 不再关联旋钮。模拟年不是 `workBlueSalary.lastPublishedYear`（2024）时，引擎恒给 `UNKNOWN`（PD-317），任何旋钮都改变不了它。年薪旋钮只在 Ε.1 且对比日期落在公布年度时显示。测试覆盖 2026 年不显示，以及 2024-06-01 时 20000 为 `NOT_MET`、60000 为 `MET`。
- FT-02 的焦点改为 `sponsor`（id `gr-whatif-sponsor`）。续期阶段这个 id 落在新的“担保人与家属上一年度税保凭证齐全”选择框，改为“是”后 FT-02 变为 `MET`。其他阶段仍落在担保人个人净收入输入框。续期阶段引擎不读收入，所以不再显示收入旋钮。
- 其余映射已与引擎核对，未改：离境类（`LT-TIME-*-ABSENCE`、LT-07、TY-05、GF-08、EF-03、EF-07）、日期类（`*-TIME`、C-07-window、NAT-01、NAT-11、TY-01、GF-03、EF-02、FT-07）、语言（LT-04、TY-02、`*-INTEGRATION-DOCUMENT`）、考试（NAT-05、NAT-06）、收入（LT-02、TY-04）、投资（GV-01）。只靠条件 ID 区分不了的少数阶段见第 4 段。
- 测试另外检查：各条件跳转的控件 id 确实渲染出来；旋钮不动时 `apply` 返回原草稿，比较区显示“与当前情景相同”。

**问题 2（部分离境汇总）**：“假设没有离境”把每组离境汇总整组处理，只要答了其中一项就整组置 0。欧盟家属三项（普通年度最多月数、重大事由次数、重大事由最长月数）一起置 0。希腊家属的年度最多月数置 0，并清掉超限事由及其月数。审核例只答 `maxOrdinaryAnnualAbsenceMonths:9` 或只答 `seriousAbsenceCount:1, maxSeriousAbsenceMonths:14` 时，勾选后 EF-03 都是 `MET`，与未填汇总一致。同类还补了 Ο.3 卡到期后的居留中断 `interruptionAfterExpiryYears`：答 3 年时，原先勾选后 GF-03 仍为 `NOT_MET`，现在置 0 后为 `MET`。

**问题 3（截至问卷日期的年数）**：按引擎 `residenceDue` 的读取口径，日期旋钮偏离问卷日期时，去掉没有对应起始日的年数快照：`familyTcn.sponsorLawfulYears`、`familyResidenceYears`、`yearsSinceFirstFamilyPermit`、`blueFamilyYearsInEU`，以及 `work.blueCardYears`。已填起始日时引擎本来就按日期推算，年数保留不动。丧偶依据下的 `familyResidenceYears` 是去世前的年数，不随日期变化，也保留。日期旋钮下有提示，说明年数只对应问卷日期，并请用户填写起始日。审核例改到 2029-01-01 后 FT-01 为 `UNKNOWN`。改填 `sponsorLawfulFrom:2025-11-24` 后，基线说明给出 2027-11-24，2029-01-01 时为 `MET`。FT-07 例改到 2028-12-01 后为 `UNKNOWN`，不再是与日期无关的 `NOT_MET`。

**问题 4（目录缺 `GR-NATIONALITY-TIME`）**：给三个时间汇总条件另加带许可历史的探测请求，放在探测列表末尾，不影响已有条件的来源顺序。目录新增 `GR-NATIONALITY-TIME`（PD-106、PD-109），共 103 项。它的来源与结果一致：SRC-088 三处、SRC-086 第 123(6) 条、SRC-089。`GR-LONG-TERM-TIME` 也补上了结果引用的第 144(2) 条、第 143(2) 条。六个标题带日期或年限的时间条件，探测出来的版本一律跳过，仍用静态标题。新增测试用 25 份草稿（八条路径的各阶段 × 无历史／普通许可／投资者许可加行程，再加各审核例）跑结果，断言每个条件 ID 都在目录里。

**风险**

1. 共用组件（年份千分位、分享链接覆盖本机草稿、`linkedResultDraft`／`scenarioLinks` 只对 `jp`、日期标签键与检查项 `kind` 分组）待任务 93 的共用修正合入后解决。本国模块不需要先配合改动。
2. 其他成员国居留期间的离境和随配偶外派期间，改用与主行程相同的“已列全”确认。列表定义增加 `complete`，由通用渲染与通用校验处理，主行程也迁移到同一机制，id 仍为 `gr-tripsComplete`。有记录时提交必须勾选，错误提示分列表写明后果。其他成员国离境未确认时不送引擎（蓝卡跨国时间显示待确认）。两个确认标记送引擎前去掉。
3. 对比日期早于出生日期时，`validate` 把问卷各步校验套在副本上，错误标在日期旋钮上（“出生日期不能晚于模拟日期。”），`aria-invalid` 为真。
4. 收入旋钮下说明：日期改到其他年份时，仍按该金额作为上一纳税年度的收入。
5. `activeGreeceAnswers` 在计算和分享前按各问题的 `when` 去掉隐藏答案，分组和列表行都覆盖到。例如公保时的私保金额、非普通许可的“许可事由”、非 A2 凭证的 A2 分数。

**建议**

1. 删去引擎不会附上的 PD：GF-08→PD-314、EF-02→PD-315。逐条对照引擎源码复核目录的 PD 表时，又发现 WK-09→PD-319 同属此类（引擎只把 PD-319 挂在 C-02 和 FT-01），一并删去。
2. 入籍逐年收入同一年份填两行时，第二行年份报错（“这个纳税年度已经填过……”）。
3. 无障碍：列表删除按钮的可访问名称改为“删除 · 希腊居留许可记录 2”这类形式；`date-or` 复选框改为“无 · 上次被驳回的日期”这类形式，均以可见文字开头。列表提示加 id，并由字段集的 `aria-describedby` 引用。
4. 问卷答案无法用旋钮选项表示时（考试为笔试、口试、学历免试，融入凭证为语言证书以外），旋钮显示“按问卷答案”且保持原答案，可以改选其他选项再改回来。
5. 年度汇总提示的起算日按引擎口径回退：欧盟家属回退到抵达日 `arrivedOn`，希腊家属回退到首张卡签发日 `initialCardGrantedOn`。
6. `greece-module.ts` 依赖引擎说明格式的问题需要改引擎，本轮没有做，见第 4 段。

### 2. 怎么验证的

- 先写回归测试再修：新增 8 项（问题 1–4、旋钮建议、对比日期风险、隐藏答案与列表确认、无障碍）。修之前在 `apps/web` 运行 `VITEST_MAX_WORKERS=2 npx vitest run test/greece.test.tsx`，8 项全部失败；修完后该文件 23 项全部通过。
- 各 commit 之前对改动文件运行 `npx tsc --noEmit -p .`、ESLint 和 Prettier 检查，均通过。
- PD 表复核：用脚本在引擎源码中查找每对“条件→PD”是否附在该条件上。时间条件和 TY-04 由 `pending` 数组动态附加，NAT-07 的 PD-310 在较远的行，均人工确认无误；只有上述三项是多余登记。
- 完整验收：在最终工作树设置 `VITEST_MAX_WORKERS=2` 后，串行运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，整条命令退出码为 0。测试结果为 error-report 2、policy-data 23、engine 6,006（另有 1 项既有用例跳过）、game 1,348、web 856，全部通过。Next.js 生成 36/36 个静态页面。回读导出文件：`out/greece/policy.html` 含 `GR-NATIONALITY-TIME`，列出 34 项来源；`out/sw.js` 的缓存版本为 `2026-11-25-gr`。
- 浏览器 e2e：在上述构建产物上运行 `cd apps/e2e && E2E_PORT=4438 npx playwright test tests/greece.spec.ts --project=desktop --reporter=line`，2 项通过（6.7 s），覆盖中文完整流程、分享、方案、对比跳转，以及英文窄屏和政策来源。跑完已删除 `apps/e2e/test-results`。

### 3. 没做或没验证的

- 共用组件的问题按 brief 留给任务 93，本分支未改。
- 只靠条件 ID 无法区分阶段的少数映射保持原样。共用接口 `focusForRule(id, pathwayId)` 拿不到草稿或阶段，见第 4 段。
- 没有新增 e2e 步骤。新旋钮、日期提示和列表确认项只有单测与静态渲染检查，没有在浏览器里目视检查布局，也没有截图、做 Axe 检查。

### 4. 发现与建议

- `focusForRule` 只拿得到条件 ID 和路径 ID。以下组合仍会跳到改变不了结论的旋钮，均为罕见阶段：
  - Μ.2 出生／学籍类续期的 TY-04 核的是公共秩序，不读收入。
  - 2026-02-06 改革前日期的 TY-02 核旧制融入，不读语言等级。
  - Ν 首领卡的 EF-07 只看抵达日和递交期限，不读离境。
  - Ο.1 首签的 FT-02 还需税保凭证与稳定收入，只改收入不一定能满足。

  若要处理，需要在共用接口里把条件或草稿传给 `focusForRule`，建议在十国统一时考虑。
- `work.interruptionMonths`（蓝卡失业累计月数）同样是截至问卷日期的累计值。失业仍在持续时，它会随日期增长；中断已经结束时则不变。问卷没有区分这两种情况，这次没有把它当作年数快照处理。
- `nationality.diplomaticSpouse.periods` 在引擎中既算离境，满足条件时又计入居留。“假设没有离境”没有动它，因为这些期间按法律另行计算。
- 同意原报告的建议：引擎在没有专门说明时，返回不含标题的通用说明，`greece-module.ts` 就不用再按文字格式去重。

## 合入 main 与共用选项接入

实现者：Claude Opus 5.5。澳大利亚完整版页面（任务 93，#81）合入 main 后，本分支合入 main，并接入任务 93 的共用选项。PROGRESS 行号用 795–798，提交前已确认各分支没有占用。每项改动先写回归测试，确认失败后再改。只核对、不改源码的项，在合入前的组件上确认测试失败。

### 1. 做了什么（按 commit 列）

| PROGRESS | Commit | 内容 |
|---|---|---|
| — | `Merge: 合入 main（澳大利亚完整版页面 #81）` | 由上一个 agent 完成。共用组件（`policy-page.tsx` 等）取 main 的版本，与 main 逐字相同。`site-countries.ts` 同时登记澳大利亚与希腊的五个子页，两边的 i18n 登记都保留。`sw.js` 与 `about-page.test.tsx` 的缓存版本统一为 `2026-11-25-gr`。PROGRESS 两边的行都保留。 |
| 795 | `Fix: 希腊分享链接带场景且不覆盖本机草稿，跳到主要内容保留场景` | 希腊模块设 `scenarioLinks: true`。`site-shell.tsx` 判断场景路径时加入希腊的 `result`、`simulate`、`whatif`。 |
| 796 | `Fix: 希腊检查项按时间、可选依据、费用、批准后事项与办理提示分组` | `greece-module.ts` 的 `run` 为每项检查设 `kind`。 |
| 797 | `Test: 核对希腊政策页年份不分组、参数无需改写，结果日期沿用默认标签` | 只加测试，源码不改。 |
| 798 | `Docs: 任务 98 合入 main 与共用选项接入报告` | 本节。 |

原报告标为“待任务 93 的共用修正合入后解决”的条目，逐条处理如下：

- **年份千分位**：main 的通用规则已经生效。键名以 `year`、`from` 结尾的整数年份不分组，例如 `workBlueSalary.lastPublishedYear` 显示为 2024，入籍收入表的 `firstYear`、`reducedFrom`、`restoredFrom`、`lastYear` 显示为 2009、2012、2019、2022。金额照常分组，例如 `standard 7,500`、`lastPublishedEur 31,918.83`，看起来像年份的金额 `gvFees.main` 也显示为 2,000。希腊参数里 1900–2100 之间的整数只有这五个年份和这一项金额。新测试在合入前的 `policy-page.tsx` 上失败（中英文各 1 项），在 main 的版本上通过。
- **分享链接覆盖本机草稿**：设 `scenarioLinks` 后，`page-result.ts` 在本机已有希腊草稿时不再用分享内容覆盖它。测试先存一份未完成的入籍草稿，再打开长期居留的分享链接：页面显示分享的结果，本机草稿不变。
- **`linkedResultDraft`／`scenarioLinks` 只对 `jp`**：main 已改为读 `scenarioLinks` 标记，希腊设标记后即生效。结果页的“编辑”“对比”链接带 `#draft=`，分享链接带 `#s=`，两者都能还原评估时的答案。“跳到主要内容”在希腊结果、问卷和对比页改为按钮，不再跳到 `#main`，所以不会洗掉场景片段；希腊首页和政策页仍是 `href="#main"` 链接。
- **日期标签键**：没有设 `earliestLabel`。按 88 号报告，希腊引擎的 `earliestDate` 有三种取值：`FUTURE` 时是候选递交日，引擎在这一天重新核对时间与申请资格；当前已满足时是模拟日；Β.5 续期是续期窗口的开始日。三种都是“最早可以递交的日期”，与默认的“最早可申请日期（推算）”一致。例外见第 4 段。
- **检查项 `kind` 分组**：

  | kind | 希腊检查项 | 进“还差什么” |
  |---|---|---|
  | `time` | 所有带 `-TIME` 的项（`GR-*-TIME`、`LT-TIME-*`、`NAT-TIME-RESIDENCE`），续期递交窗口 `C-07-window`，驳回后等待期 `NAT-11` | 是 |
  | `alternative` | `GV-TIME-RENEWAL`、`GV-TIME-LATE`（正常续期与逾期续期，由 `GR-GOLDEN-VISA-TIME` 汇总判断） | 否 |
  | `information` | `C-06` 住址和身份变更申报。引擎在 `evaluateFilingOnDate` 中把它排除在递交门槛之外，漏报只罚款。 | 否 |
  | `budget` | `FT-06`、`GF-06`、`GV-07`、`NAT-10`、`TY-06`、`WK-09`，项目已满足时 | 否 |
  | `afterApproval` | `NAT-12` 公报决定与宣誓，项目已满足时 | 否 |
  | `requirement` | 其余各项，以及未满足的费用项和宣誓项 | 是 |

  费用项和宣誓项未满足时，不归入费用预算或批准后事项。原因是希腊引擎把除 `C-06` 外的所有检查都当作递交门槛：`NAT-10` 读的是缴费凭证是否备妥，`GV-07`、`FT-06` 缺少家属出生日期时算不出费用、为 `UNKNOWN`，宣誓阶段除申请人国籍类别外只核对 `NAT-12`。这些项若不进“还差什么”，路径会显示待确认或未满足，却列不出原因。
  - 例 1：Β.5 逾期续期时，`GV-TIME-RENEWAL` 为 `NOT_MET`，`GV-TIME-LATE` 为 `MET`，汇总为 `MET`，前者不再列为缺口。
  - 例 2：未填变更申报的 Μ.1 草稿，缺口只剩 `LT-TIME-RESIDENCE` 与 `GR-LONG-TERM-TIME`。
  - 设了 kind 后，个案待定项（如 `GV-03` 的 PD-307）显示“待定细节”，不再显示“政府未定细节”。
- **政策页嵌套参数**：希腊 78 个参数都是单值，或一层具名的标量（如 `passport` 的 `remainingMonths 3、blankPages 2、issueYears 10`），没有裸数组、元组或多层嵌套，所以不需要 `displayParameter`。测试会在参数出现数组或多层嵌套时失败。
- **`PolicyPage` 标题回退**：不影响希腊。`gr.policy.pageTitle` 已登记，已有测试断言标题为“希腊政策依据”与“Policy basis for Greece”。
- **原报告第 4 段**：
  - 结果页场景片段已改由 `scenarioLinks` 控制，见上。
  - 跨日刷新仍只对日本生效（`storage.ts` 的 `resultDeviceDay`）。日本结果里有按设备当天计算的出境提示；希腊结果只取决于草稿里的模拟日，不需要接入。
  - 缓存版本号与 `hub.gr.*` 迁移的合并冲突已在合并提交中处理。

### 2. 怎么验证的

- **先失败后通过**：`apps/web/test/greece.test.tsx` 新增 11 项，在 `apps/web` 下运行 `VITEST_MAX_WORKERS=2 npx vitest run test/greece.test.tsx`。
  - 场景链接与跳转控件共 4 项（分享不覆盖本机草稿；`result`、`simulate`、`whatif` 三个路径的跳转控件），改动前失败，改动后通过。希腊首页与政策页的 2 项在改动前后都通过，用来确认这两页仍是普通链接。
  - kind 分组与“待定细节”2 项，改动前失败，改动后通过。
  - 年份不分组的中英文 2 项：把 `policy-page.tsx` 临时换成合入前（8801eb4c）的版本时失败，用 main 的版本通过，测试后已还原；日期标签 1 项不涉及源码改动。
  - 该文件改动后共 34 项全部通过。
- **相关单测**：`japan`、`australia`、`game-theme`、`page`、`gap-summary`、`country-views` 等共用组件的测试文件均通过。改动文件都通过了 `tsc --noEmit`、ESLint 和 Prettier。
- **完整验收**：在最终工作树设置 `VITEST_MAX_WORKERS=2`，串行运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，日志中为 `GATE EXIT 0`。
  - 测试：error-report 2 项、policy-data 23 项、engine 6,006 项（另有 1 项既有用例跳过）、game 1,348 项、web 892 项（46 个文件），全部通过。
  - 构建：Next.js 生成 40/40 个静态页面。回读导出文件，`out/greece/policy.html` 含 `lastPublishedYear 2024、lastPublishedEur 31,918.83`，`out/sw.js` 的缓存版本为 `2026-11-25-gr`。
- **浏览器 e2e**：确认 4455 端口空闲后，在上述构建产物上运行 `cd apps/e2e && E2E_PORT=4455 npx playwright test tests/greece.spec.ts tests/australia.spec.ts tests/japan.spec.ts tests/site.spec.ts --project=desktop --reporter=line`，退出码 0，21 项全部通过（20.9 s）：希腊 2 项、澳大利亚 2 项、日本 12 项、site 5 项。希腊用例覆盖：问卷到结果，保存情景，复制分享链接后在新上下文打开，从“还差什么”跳到对比页的日期旋钮，以及英文窄屏与政策来源。跑完已删除 `apps/e2e/test-results`。

### 3. 没做或没验证的

- 未 push，未开 PR，按 brief 留给 Fable。
- 没有在浏览器里目视检查新的分组标注和“跳到主要内容”按钮，也没有截图或做 Axe 检查；只有单测、静态渲染和 e2e 的覆盖。
- e2e 只跑了 brief 指定的四个文件、desktop 项目；mobile 项目和其他国家的 e2e 没有跑。
- `site-shell.tsx` 的变量名 `isJapanScenario` 沿用原名，没有改共用命名。

### 4. 发现与建议

- 入籍已递交、待决的申请（`nationality.pendingApplicationFiledOn`）满足条件时，`earliestDate` 是实际递交日。页面仍显示为“最早可申请日期（推算）”，不过路径说明会写明“以实际递交日 … 核对居留年限”。`earliestLabel` 按国家设置，为这一种情况改标签会让其他路径的标签不准确。如需区分，可以在共用接口里支持按路径设置日期标签，或让引擎对已递交的申请返回单独的日期字段。
- 希腊的费用项同时是递交门槛（缴费凭证、按年龄计费），所以 kind 要按状态决定。如果引擎把“费用金额说明”和“缴费凭证”拆成两项，就可以固定分组，不必按状态切换。
- `site-shell.tsx` 仍按路径逐国列出需要保留场景片段的页面。现在共有三国，且条件与 `scenarioLinks` 相同，建议十国统一时改为读取各国模块的 `scenarioLinks`。

## 审核修正（review98-2）

实现者：Claude Opus 5.5。第二轮审核结论为通过，本节处理风险 1（第一轮修正引入的回归）和建议 1、2，风险 2、3 记在第 3、4 段。PROGRESS 只用 799 一行：提交前核对了本地与远端各分支的 `PROGRESS.md`，800–825 和 850–871 已被其他分支占用，而且仍在增加。报告提交不另占行号，以免冲突。修之前先用审核里的复现写回归测试，确认失败后再改。

### 1. 做了什么（按 commit 列）

| PROGRESS | Commit | 对应审核编号 |
|---|---|---|
| 799 | `Fix: 希腊对比页改日期时按年数推算起始日，不回退到卡期推算（review98-2）` | 风险 1；建议 1、2 |
| — | `Docs: 任务 98 第二轮审核修正报告（review98-2）` | 本节；风险 2 记入第 4 段 |

**风险 1（改日期后 FT-07 回退到卡期推算）**：选了审核建议 1 的第一种修法，即按年数快照的起算口径随日期推进。

- 为什么不选“显示为待确认”：引擎在年数缺失时一定会用许可历史推算。`yearsSinceFirstFamilyPermit` 缺失时改用首张有卡期的家属卡（`greece-work-family.ts:900-906`），`familyResidenceFrom` 和 `familyResidenceYears` 都缺失时改用连续家属卡的起日加行程推算（第 919-935 行）。只改草稿副本，无法让 FT-07 显示待确认。要做到这一点，就得改引擎或共用的对比组件。
- `apps/web/lib/greece-whatif.ts`：日期偏离问卷日期时，四项家属年数（`sponsorLawfulYears`、`familyResidenceYears`、`yearsSinceFirstFamilyPermit`、`blueFamilyYearsInEU`）不再删除，而是换算成对应的起始日（`sponsorLawfulFrom`、`familyResidenceFrom`、`firstFamilyPermitIssuedOn`、`blueFamilyResidenceFrom`），然后去掉年数。
  - 换算公式是“问卷日期减去所填年数”，按整月计算，不足一月的部分舍去（`addMonths(问卷日期, -floor(年数 × 12))`）。这样推出的起始日不会早于答案所示，副本里的日期也就不会提前。
  - 换算后的副本与用户直接填写起始日时相同。引擎本来就优先读起始日，许可历史里的首张家属卡记录也随之改用这个日期。
  - 已填起始日的年数不换算。丧偶依据下的 `familyResidenceYears` 是去世前的年数，同样保留。
- 审核复现（家属卡 2020-01-01 至 2028-01-01，问卷日 2026-11-24 时只住了 3 年）：
  - 基线 FT-07 为 `NOT_MET`。
  - 改到 2025-06-01、2026-11-25、2028-11-23，结果都不是 `MET`。
  - 改到 2028-11-24 才是 `MET`，即从 2023-11-24 起满 5 年。
  - 行程未填，以及 `trips: []` 加“已列全”，两种都测了。
  - 同类情形：问卷填首张团聚许可以来 2 年，许可历史却显示 2019 年首卡。2029-11-23 之前都不是 `MET`，2029-11-24 起为 `MET`。
- 持蓝卡年数 `work.blueCardYears` 没有对应的起始日字段，改日期后仍删除。引擎这时只读 `atLeast(blueCardYears, …)`，不会回退到许可历史，所以“蓝卡就业中断与续期保护”在中断月数介于两档之间时显示待确认。没有让它按日期累加：中断月数是否随日期增长，问卷没有区分（见第一轮第 4 段），只累加持卡年数可能得出错误的“满足”。
- 日期提示拆成两条，各自只在有对应年数时显示，都由日期输入框的 `aria-describedby` 引用：
  - 家属年数：“问卷里按年数填写的居住、持卡或担保人合法居留年限只对应问卷日期。改到其他日期时，用问卷日期减去所填年数作为起始日推算，即假设这段时间一直持续。”
  - 持蓝卡年数：“持蓝卡年数只对应问卷日期。改到其他日期时不再使用这一年数，‘蓝卡就业中断与续期保护’可能显示为待确认。”
  - 英文版同步。`answered.yearCounts` 拆为 `familyYears` 与 `blueCardYears`。
- 第一轮问题 3 的测试按新口径改写：
  - FT-01 例在 2029-01-01 由 `UNKNOWN` 改为 `MET`。按年数换算的副本与直接填写 `sponsorLawfulFrom: 2025-11-24` 的副本，在 2025-06-01、2027-01-01、2029-01-01 三个日期结果相同；2027-01-01 的说明里给出 2027-11-24。
  - FT-07 例补 `otherResidencePermitGranted: false`，使结论确定。首张团聚许可以来的年数改为 4.99，用来检验不足一月舍去：换算出的首卡日为 2021-12-24，居留起日为 2022-11-24。2027-11-23 为 `NOT_MET`，2028-12-01 为 `MET`。

**建议 2（持蓝卡年数的判断条件）**：只有 Ε.1、续期、中断原因为失业三者同时满足时，才把持蓝卡年数当作年数快照，与引擎 `greece-work-family.ts:321-334` 的读取条件一致。其他情况下保留这一答案，也不显示蓝卡提示。测试覆盖了没有中断、Ε.4、首签三种情况。许可历史在 `blueCardYears > 0` 时会记一条其他事由许可，这次删除不影响这一条：只有续期才会删除年数，而续期时许可历史已经按 `work.stage === 'renewal'` 记了同一条。

### 2. 怎么验证的

- **先失败后通过**：在 `apps/web` 下运行 `VITEST_MAX_WORKERS=2 npx vitest run test/greece.test.tsx -t 'review98-2'`。修之前，新测试在第一个断言处失败：改到 2025-06-01 时 FT-07 为 `MET`。修完后 `test/greece.test.tsx` 共 35 项全部通过，其中包括第一轮的 8 项回归测试（问题 3 那项按新口径改写）和合入 main 后新增的各项。
- 改动文件都通过了 `tsc --noEmit -p .`、ESLint 和 Prettier。
- **完整验收**：在最终工作树设置 `VITEST_MAX_WORKERS=2`，串行运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，日志中为 `GATE EXIT 0`。
  - 测试：error-report 2 项、policy-data 23 项、engine 6,006 项（另有 1 项既有用例跳过）、game 1,348 项、web 893 项（46 个文件），全部通过。
  - 构建：Next.js 生成 40/40 个静态页面。回读导出文件，前端代码块里有新的日期提示，`out/sw.js` 的缓存版本仍为 `2026-11-25-gr`，与 main（`2026-11-24-v6`）不同，所以不用再递增。
- **浏览器 e2e**：确认 4465 端口空闲后，在上述构建产物上运行 `cd apps/e2e && E2E_PORT=4465 npx playwright test tests/greece.spec.ts --project=desktop --reporter=line`。退出码 0，2 项通过（7.7 s）。跑完已删除 `apps/e2e/test-results`。
- **目视检查**：用 `apps/e2e/serve.ts` 在 4466 端口提供构建产物，在内置浏览器里检查。本机草稿用审核复现，另加 Ε.1 续期、失业中断 4 个月、持蓝卡 1 年。
  - 对比页的两条日期提示都显示，日期输入框的 `aria-describedby` 为 `gr-whatif-date-hint gr-whatif-date-blue-card-hint`。
  - 日期改到 2026-11-25 后，FT-07 仍为“未满足”（修之前为满足），“蓝卡就业中断与续期保护”变为“未知”。
  - 375 px 宽度下，中文与英文的对比页都没有横向滚动（`scrollWidth` 为 375），提示正常换行。
  - 结果页在 375 px 宽度下也没有横向滚动。“跳到主要内容”是按钮，“为什么”下的检查项带“· 申请条件”分组标注。
  - 检查完已清空该源的 localStorage，关闭了标签页，停止了静态服务。

### 3. 没做或没验证的

- 未 push，未开 PR，按 brief 留给 Fable。
- 风险 2 没有改代码：共用接口 `focusForRule(id, pathwayId)` 拿不到草稿或阶段，本国模块区分不了。已补进第 4 段的清单。
- 风险 3 只覆盖了一部分：只在一份草稿上目视检查了对比页日期提示和结果页，没有做 Axe 检查；e2e 只跑了 desktop 项目，mobile 项目没有跑。
- 按年数推算起始日，是假设这段居住或持卡一直持续。用户如果中途离开过，对比页给出的日期可能偏早；这与直接在问卷里填写起始日时的处理相同（引擎按起始日推算时也不读离境）。

### 4. 发现与建议

- 补充第一轮第 4 段的清单。下面两种情况也会跳到改变不了结论的日期旋钮：
  - Ο.2 按离婚或特殊困难申请时的 FT-07：离婚依据只读婚姻年数，特殊困难依据只读证明（`greece-work-family.ts:1047-1057`），都与日期无关。
  - Μ.2 按出生或学籍申请时的 TY-01：只看出生地和年级数（`greece-settlement.ts:729-738`）。只有完成学业的日期晚于模拟日期时，结果才随日期变化。

  这两项同样需要在共用接口里把条件或草稿传给 `focusForRule` 才能处理，建议在十国统一时一并考虑。
- 如果以后希望改日期时年数快照显示为待确认，而不是按起始日推算，需要引擎提供“年数只在某日有效”的输入，或者让共用对比组件能在引擎结果上标注待确认。只改草稿副本做不到，因为引擎在年数缺失时会回退到许可历史。
- `work.interruptionMonths` 仍按第一轮第 4 段的处理，不作为年数快照。
- PROGRESS 行号：800–825、850–871 已被其他分支占用，而且仍在增加。建议 Fable 在分配新段时预留间隔。
