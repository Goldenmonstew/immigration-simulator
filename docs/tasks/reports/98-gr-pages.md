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
