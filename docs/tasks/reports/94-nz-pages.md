# 任务 94 · 新西兰完整版页面

## 1. 做了什么

| PROGRESS | commit | 文件（网页文件相对 `apps/web/`） |
|---|---|---|
| 540 | `Feat: 接入新西兰十条路径的完整版问卷、结果、对比与政策页` | `lib/new-zealand-{fields,draft,module,policy,whatif}.ts`，`app/new-zealand/{new-zealand-content.tsx,simulate/{page,nz-fields}.tsx,result/page.tsx,whatif/{page,controls}.tsx,policy/page.tsx}`，`i18n/countries/new-zealand{,-form}.ts`，`i18n/{zh-CN,en}.ts`（新西兰卡片文案移入本国字典），`lib/site-countries.ts`，`public/sw.js`，删除 `lib/new-zealand.ts`，`test/{new-zealand,about-page}.test.tsx` |
| 541 | `Test: 新西兰双语问卷、分享、对比与政策页 e2e` | `apps/e2e/tests/new-zealand.spec.ts` |
| 542 | `Docs: 任务 94 新西兰完整版页面报告` | 本报告 |

结构照日本试点：国家模块实现 `CountryModule`，问卷交给 `QuestionnaireShell`，结果、对比、政策页分别用 `ResultPage`、`WhatIfPageContent`、`PolicyPage`，首页复用 `SavedScenarios`，链接一律经 `countryPath`。`policy-page.tsx` 按 Fable 的补充约定未改动，只在本国字典加 `nz.policy.pageTitle`（新西兰政策依据 / Policy basis for New Zealand）。

### 问卷步骤与字段

字段定义在 `lib/new-zealand-fields.ts`，每个问题的名字就是 `evaluateNewZealandFull` 请求里的键，标签和选项文案在 `i18n/countries/new-zealand-form.ts`。第一步选路径，之后只显示所选路径用到的步骤；隐藏步骤的答案不参与评估，也不进入分享链接。必填只用于引擎类型里必填的位置（出境记录的起止日、居民签证的获批日和类别、判刑记录、工作经历的类型和月数、经营经历五项、收入期、英语证明方式与考试名）；整组可留空的组在填了任一项后才要求其中的必填项。其余问题都可以选「不确定」或留空，结果里显示为待确认（UNKNOWN 及 PD 编号）。名单类问题区分「未回答」和「确认没有」。

| 步骤（显示条件） | 字段 |
|---|---|
| 1 日期与路径（总是） | 模拟日期*、十条路径多选*（按已持居民签证 / 技术与工作 / 家庭投资宗教三组）、出生日期 |
| 2 居民签证与出入境（旅行、永居、入籍） | 首次入境日、居民签证获批日与类别、PRV 获批日、旅行条件到期日、s49 条件、是否随同获批、出境记录（离境、返回）；三条路径共用的居民记录：获签地点、首次居民入境日或「尚未入境」、目前是否在境、首入类别、父母首入期限或「已完成」、父母旅行条件到期日、入境限制 |
| 3 居民签证的旅行条件（同上） | 办理事项、获签时护照期限、变更依据、澳大利亚变更、公民伴侣书面支持与同一关系、同居月数、外派确认与年数、按年变更税务、至今遵守条件、主申旅行资格、失效时的六项情况、菲律宾奶牛场例外 |
| 4 永久居民签证（同上） | 永居判定类别、失效日、原申请身份、原主申是否持永居、s49 条件、驱逐责任、补交警方证明、前居民不利记录、其他承诺途径（多选，可确认都不主张）、税务居民两项、投资额与月数、旧版商业投资、企业创办与持股、连续经营月数、核证报表、家属逐人在境天数、购房日与仍居住、合格就业月数 |
| 5 入籍（入籍） | 批准时年龄、父母公民身份、行为能力及例外、居留权确认、在境例外与例外天数、DIA 特殊认可、品格、最长刑期、短期监禁或假释结束日、非监禁定罪日、扣分、部长例外、两个窗口的海外月数、海外无犯罪证明、理解责任、免考、日常英语、居住意图、身份与见证、宣誓、费用类别 |
| 6 工作岗位（SMC、绿名单、护理运输） | 职业代码、真实邀约、雇主合规、递交与审批时的认证、保证工时、合同类型与月数、时薪、年薪、最高工时、排除睡眠工时及凭证、职责匹配、费区 |
| 7 SMC | 通道、邀请通道与日期、邀请有效、EOI 申报、经历起算日与工签日、技能等级、注册及 SR3.30 注册、ANZSCO 学历或替代、相关年数、承包人记录与月数、助产士、积分依据、注册积分、学历及认可、学士、硕士周数、24/36/48 个月合格月数、近 10 年直接经历及其中新西兰月数、额外新西兰月数与最低时薪、证明核实、技工在表、技工资格等级/相关/取得地、学分、IQA |
| 8 绿名单 | 层级、名单行要求、电信证书、承包人年数、助产士、起算日与工签日、回溯期工作经历（类型*、月数*、起算日、工签日、职业代码、工时、最低时薪、当时签证、资质核实、移出名单后同一工作、存档工资、电信证书、签证申请日、运输过渡八项）、月份与收入核实、移出名单后同一工作、存档工资 |
| 9 护理或运输 | 行业；选运输时另问运输过渡八项与海员证；工作经历同上 |
| 10 伴侣 | 目标（居民签证 / 海外伴侣直获永居）、伴侣年龄、成年后同居月数、见面、关系形式、真实稳定证据、分居、早年漏报、担保人身份/居住/次数/上次日期/驱逐与 s4/品格/警方证明、早年类别英语两项、公民伴侣逐年在境月数、是否在境外、最近返回日 |
| 11 父母 | 关系、亲生父母去世与监护三项、子女名单（年龄、单身、自有子女、经济依赖）、EOI 方式与状态、邀请日、抽选日、担保方式、担保人名单（年龄、非受抚养子女、无条件身份、年数、通常居住、逐年在境天数、R4 其他条件、资助承诺）、联合担保同居与认可、受担保父母人数、收入期（起始日*、各担保人 IRD 收入*）、本人与伴侣英语、伴侣同申、Parent Boost 保险、政府欠款 |
| 12 投资者 | 类别；AIP：档位、阶段、申报资金、已投金额、合格投资、慈善、资金来源与转入、商业品格、原则批准日、投资完成日、延期、转账证明日、联系方式、Balanced 追加、在境天数、持仓与地址、中期与最终报告日；BI：阶段、工签申请年龄与日期、主申英语、无破产年数、商业品格、储备金、经营经历（职位*、年数*、工时*、员工*、营业额*）、目标企业尽调、资本计划、持 BI 工签、收购额、经营月数、逐年在境天数、持有同一企业、企业合规、现有与新增 FTE、新岗位月数、工签材料 |
| 13 宗教工作者 | 在境递交、合格工签、守规年数、培训或工作年数、担保机构与长期需要、担保承诺、职责与聘用、聘期或「无固定期限」、福利、主申英语 |
| 14 递交方式、身份与费用（总是） | 境外递交、递交时签证（14 类）、法定限制、入境管制区、前居民免签、澳籍或澳永居首次申请、漏列关系类签证家属、非法居留受抚养子女名单（生日、能证明无权迁出）、身份文件、应缴费用、征费依据 |
| 15 健康与品格（总是） | 健康、预计医疗费用、医疗豁免、早年漏报、品格与安全、判刑记录（日期*、月数*）、特别指令、品格豁免；体检表（签发日、可沿用、限定表、普通表代替限定表）、胸片、怀孕、结核高风险国家月数、重新体检与胸片、警方证明覆盖、逐国警方证明（签发日、可沿用、国籍国、居住月数、已提供）、警方证明豁免 |
| 16 英语（技术、家庭、投资、宗教路径） | 证明方式*；考试：考试*、总分、OET 四项、日期、线下；国籍：认可国籍、六国工作学习年数；学历：等级、学士、认可国家、六国学年、评估或免评；签证官要求考试、宗教家属英语背景、SMC 注册、ESOL |
| 17 随行家属（总是） | 每人：关系、生日、伴侣关系证据、迁居权、单身/自有子女/经济依赖、递交情况、身份文件、第 15 步的健康品格与体检警方证明、第 16 步的英语四类、同表永居记录（首入日、居民签证、旅行条件到期日、s49、出境记录、第 2–3 步的居民记录与旅行资料、第 4 步的永居资料、是否随同本次主申） |

覆盖核对：用 TypeScript 编译器 API 逐层展开 `NzFullRequest` 的属性路径（含交叉类型、联合类型与数组），与问卷定义生成的路径比对。问卷共 547 个字段位置，类型侧只有三处未问：`skilled.green.currentVisa`、`skilled.green.filingFromOverseas`、`skilled.sector.currentVisa`。引擎注释说明这三项是旧请求的兼容写法，新请求用 `common.residenceFiling`，问卷只在第 14 步问一次。选项集合与类型里的字面量逐一相同（`offerYears` 的 `indefinite` 与 `parentFirstEntry` 的 `completed / { deadline }` 用「或」选项表示）。

### 对比旋钮

旋钮只改草稿副本，不覆盖问卷答案；对比后的方案可分享。结果页「去 What-if 试试」按条件 ID 定位到对应旋钮。

| 旋钮（显示条件） | 改动 | 关联条件 |
|---|---|---|
| 模拟日期（总是） | `simulationDate` | NZ-P1-1-TRAVEL、NZ-P2-1、NZ-P2-3、NZ-P2-JOINT-DATE、NZ-P3-1-STATUS、NZ-P4-1-AGE、NZ-P5-1-AGE、NZ-P6-AGE、NZ-C1-EVIDENCE、NZ-C2-POLICE |
| 假设没有出境记录（居民路径） | 清空出境记录 | NZ-P2-2、NZ-P3-1-PRESENCE |
| 最近一次出境的返回日期（居民路径、有出境记录） | 最晚离境那条记录的返回日 | 同上 |
| 入籍的日常英语（入籍） | `resident.citizenship.english` | NZ-P3-5 |
| 主申请人英语考试总分（技术类） | 有考试只改分数；没有时按模拟日线下 IELTS | NZ-C3 |
| 保证时薪（技术类） | `skilled.job.hourlyPay` | NZ-P4-2、NZ-P4-3、NZ-P5-2、NZ-P5-3-JOB、NZ-P6-1 |
| 成年后同居月数（伴侣） | `family.partner.monthsTogetherAfterBothAdult` | NZ-P7-1 |
| 已完成的投资总额（AIP） | `family.investment.active.totalInvested` | NZ-P9-1 |

### 旧链接与存储

- 原 `/new-zealand` 网址保留，现在显示新的本国首页；集合入口的链接不变。
- 旧单页只把输入放在 React 状态里，刷新即清空，没有本地草稿，也没有分享链接，所以没有需要迁移的旧数据。
- 新草稿与命名方案分别存在 `nz-immigration-draft-v1`、`nz-immigration-scenarios-v1`；分享地址为 `/new-zealand/result#s=…`，信封为 `{country:"nz", v:1, draft}`。
- 旧的只算时间评估函数 `evaluateNewZealand` 仍在引擎里，完整版评估也复用其时间部分；网页侧的旧表单 `lib/new-zealand.ts` 和旧单页组件已删除。

### 结果与政策页

- 引擎对十条路径都给出评估，结果页只显示所选路径。条件、最早日期、待确认 PD 和来源链接沿用通用 `ResultView`。
- 政策页列出 10 条路径、91 个条件、89 个参数（带 SRC）、3 条变更（2026-11-12 R5.125 筛查、2026-08-28 入籍费、2026-08-24 SMC 新规）和 26 项来源（SRC-070–073、SRC-230–252 中实际引用的）。条件的标题、来源与 PD 从引擎对五组固定请求的评估中收集，与结果页一致；同表永居逐人生成的 `NZ-P2-PARTNER-n`、`NZ-P2-CHILD-n` 不单列。来源清单由 `withPolicySources` 按本国规则、参数与变更记录的引用生成，与英国、日本的来源无交集。
- 集合入口的新西兰卡片（`hub.nz.*`）改为完整版范围，移入本国字典；全站文案未改。
- 新页面经站点注册表进入离线清单与 sitemap，离线缓存名改为 `2026-11-24-nz`。

## 2. 怎么验证的

- `export VITEST_MAX_WORKERS=2` 后运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，整条命令退出码 0。全仓 8,222 项通过（error-report 2、policy-data 23、engine 6,006、game 1,348、web 843），1 项既有文案导出测试按默认开关跳过。构建预渲染 36 个页面和路由，`apps/web/out/new-zealand{,/simulate,/result,/whatif,/policy}.html` 均已生成；`out/offline-pages.json` 与 `out/sitemap.xml` 都含这五个路径。`git diff --check` 通过。
- 开发中单跑 `pnpm --filter web exec vitest run test/new-zealand.test.tsx`（12 项）及相关的 `about-page`、`country-views`、`policy-page`、`page`、`share`、`japan` 测试。新西兰单测覆盖：首页链接、离线与 sitemap、全部问题与选项的中英文文案、信封往返与跨国隔离、结构或必填不合格的草稿被拒、未知键与隐藏联合成员被剔除、按路径显示的步骤及必填/可留空组/日期顺序/OET 四项/负数校验、未选路径的答案不评估也不分享、三种结果（2020 年获签且无出境：永居与入籍在 2026-11-23 满足；2025-11-01 获签：永居 FUTURE 2027-11-01；SMC 只填岗位外信息：UNKNOWN 且带 PD）、条件说明不以条件标题开头、旋钮 `apply`（最近返回日从 2026-10-15 改为 2026-10-01 后入籍由 2027-06-12 提前到 2027-05-29，假设无出境则当日满足，英语与时薪写入副本、原草稿不变）及校验、结果页跳转链接与对比页控件、政策页 10 条路径与引擎源码中全部 91 个条件 ID 一致、来源与英日无交集。
- e2e 预期的日期与状态都先用模块的 `run` 对同一草稿算出（见上）。`pnpm --filter e2e exec playwright test tests/new-zealand.spec.ts --list` 收集 2 项，e2e 的 tsc 与 eslint 通过。
- 字段覆盖：用 TypeScript 编译器 API 展开 `NzFullRequest` 的全部属性路径和字面量选项，与问卷定义比对，结果见上文「覆盖核对」。
- 构建后用 `apps/e2e/serve.ts` 起静态服务，在内置浏览器里人工走查：空提交时焦点落在路径选择并提示错误；草稿恢复到第 2 步；按 e2e 的答案逐步提交后结果页显示「归化入籍 · 最早 2027-06-12 满足条件」，「还差什么」里的条件标题后接说明首句，不重复标题；「去 What-if 试试」进入对比页并聚焦「假设没有任何出境记录」，把最近返回日改为 2026-10-01 后最早日期显示 `2027-06-12→2027-05-29`。375 px 英文界面下，问卷从随行家属（一位家属展开 105 个输入）倒退到第 2 步的 12 个步骤、结果页（展开全部细节）、政策页（展开全部分组）和集合入口的 `scrollWidth - innerWidth` 均为 0；政策页显示 10 条路径、91 个条件、89 个参数、3 条变更、26 项来源。

## 3. 没做或没验证的

- 按 brief 未跑 Playwright。e2e 用例只做了 `--list` 收集（2 项）与类型、lint 检查，浏览器执行、Axe、375 px 截图由 Fable 运行。
- 政策页 h1：本分支的 `policy-page.tsx` 仍按旧写法对新西兰显示通用标题「政策依据」。e2e 已按新约定断言 `Policy basis for New Zealand`，需合并含澳大利亚通用写法的 main 后才会通过；单测只断言字典值。
- 没有改规则语义、参数、英国和其他国家页面，没有游戏入口。

## 4. 发现与建议

1. 三条居民路径共用一份居民记录：永居、入籍也读取 `resident.travel` 的获签地点、首次居民入境、目前是否在境、首入类别、入境限制等，以及 `resident.prv` 的失效日与 s49 条件。因此第 3、4 步对三条居民路径都显示，第 2 步集中问这些共用事实。所有出境都已返回时，若不回答「目前在新西兰境内」，在境天数仍是 UNKNOWN；引擎是否可以由已返回的出境记录推定在境，建议规则侧另议。
2. 引擎里的三个旧兼容字段（绿名单与护理运输的 `currentVisa`、绿名单的 `filingFromOverseas`）问卷不再询问；若确认网页之外没有调用方，可在引擎侧删除。
3. 全站的 `hub.intro`、`hub.privacy` 仍写着其他国家只检查时间、刷新即重置，与新西兰完整版不符，按 brief 留待十国完成后统一修改。
4. `public/sw.js` 的缓存名与并行分支都会改，合并时请取一个新值。

## 审核修正（review94-1）

审核意见：Gemini 4 Neon 只读审核（问题 5 项、风险 5 项、建议 4 项）。每项先写回归测试（新文件 `apps/web/test/new-zealand-questionnaire.test.tsx`，12 项改前全部失败），再按类别修正。

### 1. 做了什么

| PROGRESS | commit | 对应审核编号 | 文件（网页文件相对 `apps/web/`） |
|---|---|---|---|
| 544 | `f1e24522 Fix: 新西兰问卷区分未答、清除隐藏答案并按路径只问实际读取的问题（review94-1）` | 问题 1、2、3；风险 4、5；建议 1（问卷部分）、建议 2 | `app/new-zealand/simulate/{nz-fields,page}.tsx`，`lib/new-zealand-{draft,fields}.ts`，`i18n/countries/new-zealand-form.ts`，`public/sw.js`，`test/{new-zealand,new-zealand-questionnaire,about-page}.test.tsx`，`apps/e2e/tests/new-zealand.spec.ts` |
| 545 | `47d57d81 Fix: 新西兰对比页的时薪关联、OET 分数与返回日校验（review94-1）` | 问题 4(a)(b)(c)；建议 1（对比页部分） | `lib/new-zealand-whatif.ts`，`app/new-zealand/whatif/controls.tsx`，`i18n/countries/new-zealand.ts`，`test/new-zealand-questionnaire.test.tsx` |
| 546 | `7481cca7 Fix: 新西兰结果标注办理提示并补齐政策页分支来源（review94-1）` | 风险 1（本国部分）、风险 2；建议 3 | `lib/new-zealand-{module,policy}.ts`，`test/new-zealand-questionnaire.test.tsx` |
| 547 | `Docs: 任务 94 审核修正报告（review94-1）` | — | 本节 |

逐条说明：

- **问题 1**：`createNzDraft()` 的 `answers` 改为 `{}`，出境记录与其他名单一样初始为未答，第 2 步显示「确认没有」按钮而不是「已确认没有」。2020 年获签、其余条件满足但跳过出境记录时，旅行条件、永居、入籍三条路径均为 UNKNOWN 且无最早日期；点「确认没有」后永居、入籍仍在 2026-11-23 满足。
- **问题 2**：改动或清除任一答案时，同一层被 `when` 隐藏的问题一并删除（`withoutHidden`，在 `NzFields` 里统一处理，覆盖主申英语、随行家属英语、父母/投资者/宗教的英语组，以及投资路径、运输类别等其他联合类型）。整组可留空的判断改为只看可见答案，旧草稿中残留的隐藏答案也不会再卡住。第 16 步顶层英语组前显示「这一组可以整组留空」提示（规则：路径非空且含必填项的分节）。
- **问题 3**：数值列表新增 `none` 标记，只给 `includedFamilyDaysInTwoYears` 打开，提供与名单相同的「确认没有 / 改回未回答」切换并显示「已确认没有」。其余逐年数值（担保人逐年在境天数、伴侣逐年在新月数、BI 逐年在境天数）空列表在引擎里仍是 UNKNOWN，不提供该切换。审核给的场景：`[]` 时 PRV 为 MET，留空为 UNKNOWN。
- **问题 4**：(a) `NZ-P4-2` 移出时薪旋钮，补入 `NZ-P4-4`、`NZ-P4-5`、`NZ-P6-2`（对比页「保证时薪」现关联 NZ-P4-3/4/5、NZ-P5-2、NZ-P5-3-JOB、NZ-P6-1/2）。(b) 原问卷为 OET 时旋钮初值为空，未动时结果显示「与当前情景相同」；填分数后按模拟日线下 IELTS 计算（OET 等级 C 时 NZ-C3 由 NOT_MET 变 MET），提示文案同步说明。(c) 有出境记录且未勾选「假设没有出境」时，最近返回日为空或无效报 `nz.error.date`，早于离境日才报 `nz.error.order`。
- **风险 1（本国部分）**：国家模块给 13 项办理事项设 `kind: 'information'`（NZ-P1-FEE、NZ-P2-7、NZ-P3-7-FEE、NZ-P3-7-OATH、NZ-P4-FEE、NZ-P5-4、NZ-P6-3、NZ-P7-FEE、NZ-P8-5、NZ-P9-4、NZ-P9-HOME、NZ-P10-2、NZ-C6-LEVY），其余条件不设 `kind`；已持 PRV 返回 NOT_APPLICABLE 的路径设 `travelDate: null`，结果页不再显示「最早可申请日期：尚无法确定」。
- **风险 2**：政策页的固定请求增加两组（同表永居的年幼子女，以及旧制 SMC 邀请 + 奶农品格例外 + 入境管制区递交），规则清单收入 NZ-P4-1 的 SRC-236 SR3.5.15 与 PD-226、NZ-C2 的 SRC-230 RV4.20.10 与 PD-221、NZ-FAMILY-FILING 的 SRC-230 R2.40.2(a), (b)(i)–(ii); RV1.10.10 与 SRC-252 R5.30.1(a)–(b)、NZ-P2-JOINT-DATE 的 PD-222。新请求放在最后，条件标题仍取原来的通用标题。条件、参数、来源数量不变（91 / 89 / 26）。
- **风险 4**：后一步出现与前一步矛盾的答案时在后一步报错（只比较当前显示的步骤）：第 13 步宗教工作者「递交时在新西兰境内」与第 2 步「目前在新西兰境内」不一致；第 14 步「在新西兰境外递交」与这两项之一矛盾；第 14 步「法定递交限制」与第 4 步「驱逐责任」矛盾（liable 却选了其他限制，或 none 却选了 liable-for-deportation；suspended 不比较）。完成的草稿和分享链接同样经过这项检查。
- **风险 5**：带 `required` 的数值列表（`irdIncomePerSponsor`）在校验时不能为空数组，完成的草稿与分享链接因此被拒。
- **建议 1**：必填数值列表的 `<legend>` 加 ` *`；名单 `<fieldset>` 关联填写说明（`aria-describedby`）；数值组出错时标 `aria-invalid`；对比页数字旋钮遇到 `NaN` 视为未填。
- **建议 2**：(1) 分节可按路径显示：只选入籍时不显示居民类签证递交（14 种签证、管制区、R5.125 等）、身份文件、征费、健康品格与体检警方证明、随行家属，只问申请费；入籍读取的「目前在新西兰境内」已在第 2 步问过。只选入籍共 6 步。(2) 主申第 16 步只问 `testSpecificallyRequested`，宗教家属英语背景、SMC 注册、ESOL 只在随行家属下问；商业投资者与宗教工作者的主申英语不再提供「已预付 ESOL」。(3) 文本框（职业代码）去掉首尾空格。
- **建议 3**：回归测试见上；另加一项通用检查：审核点名的分支请求和常规草稿的结果里，每个条件的来源（SRC + 定位）与 PD 都在政策页同一条件下列出，且 SRC 在来源清单中。
- `public/sw.js` 缓存名改为 `2026-11-24-nz2`，`about-page.test.tsx` 同步；e2e 入籍流程在第 6 步（申请费）后直接查看结果。

### 2. 怎么验证的

- 回归测试先行：`pnpm --filter web exec vitest run test/new-zealand-questionnaire.test.tsx` 在修正前 12 项全部失败（新草稿 `trips: []`、清除后残留隐藏答案、无「确认没有」入口、时薪映射、无矛盾提示等），修正后全部通过。每个 commit 前单跑 `test/new-zealand{,-questionnaire}.test.tsx` 及相关的 `about-page`、`whatif-focus`、`policy-page`、`country-views` 测试，并对改动文件跑 `eslint` 与 `tsc --noEmit`，均通过。
- 三个 commit 之后，`export VITEST_MAX_WORKERS=2` 再运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，整条命令退出码 0。全仓 8,234 项通过（error-report 2、policy-data 23、engine 6,006、game 1,348、web 855；web 比原报告多 12 项），1 项既有文案导出测试按默认开关跳过。日志只有 Node 的 localStorage 实验特性提示（既有）。
- 构建产物：`apps/web/out/new-zealand{,/simulate,/result,/whatif,/policy}.html` 均已生成；`out/sw.js` 含 `2026-11-24-nz2`；政策页 HTML 有 10 条路径、91 个条件、26 项来源，并含 `SR3.5.15`、`RV4.20.10`、`R5.30.1` 定位。
- e2e：`cd apps/e2e && E2E_PORT=4434 npx playwright test tests/new-zealand.spec.ts --project=desktop --reporter=line`，2 项通过（入籍问卷 6 步、结果 2027-06-12、保存、分享、对比改返回日得 2027-05-29、Axe 无 serious/critical；375 px 英文问卷与政策页）。跑完已删除 `apps/e2e/test-results`。e2e 的日期与状态先在单测中算出。
- `prettier --check` 对改动文件通过。

### 3. 没做或没验证的

- **问题 5**（`PolicyPage` 在 `country.id` 缺省时输出空 `<h1>`）：属共用组件 `components/policy-page.tsx`，按 brief 未改，待任务 93 的共用修正合入后解决。
- **风险 1 的共用部分**：共用 `ResultView` 把不在 `decidedBy` 的条件收进默认折叠、标题为「其他路径的规则」的区块，费用与获批后事项仍在那里；本国已设 `kind: 'information'`，分组与标题待任务 93 的结果页共用修正合入后解决。
- **风险 3**：分享链接覆盖本机草稿、跳链把 `#s=` 改为 `#main` 属 `lib/page-result.ts`、`lib/share.ts` 与站点外壳，待任务 93 的共用修正合入后解决。
- **建议 4**：全站 `hub.intro`、`hub.privacy` 文案按原 brief 留待十国完成后统一修改。
- e2e 只跑了 `desktop` 项目（新西兰用例都在其中）；`mobile` 项目与截图基线未跑。
- 没有改引擎、参数和其他国家页面；未在浏览器里人工走查新按钮与提示的视觉效果（由 Fable 做视觉验收）。

### 4. 发现与建议（范围外，未实现）

1. 只按已证实的范围精简了「只选入籍」。旅行条件与永居同样不读健康（品格除外）、体检警方证明与征费，初次入境与变更也不读居民类签证递交资格；若要继续精简，需逐项核对引擎读取后再分节。
2. 跨步矛盾只核对主申。随行家属的 `prvApplication.travel.currentlyInNz`、`prvApplication.prv.deportationLiability` 与其 `residenceFiling` 之间也可能矛盾，引擎在 `residenceFilingChecks` 里按家属自己的答案处理，建议另议是否提示。
3. 改动答案即清掉被隐藏的子问题，切回原选项（如投资路径 active ↔ business、运输 ↔ 护理）后需要重填；这是问题 2 要求的取舍。
4. `NZ-P5-3`、`NZ-P6-WORK` 的月数在少数旧签证例外里也读当前时薪（`qualifyingPeriod` 的 `currentPay`），但主要按各段经历的最低时薪判断，未关联时薪旋钮。
5. 主申英语去掉「已预付 ESOL」后，若本机草稿里曾选过该项，读取时整份草稿按格式不符被丢弃；本分支尚未发布，未做迁移。

## 合入 main 与共用选项接入

澳大利亚完整版页面（任务 93，#81）已合入 main。本节合入 main，并按 93 号报告“其他国家怎么接入这次的共用改动”一表接入共用选项。每项先写回归测试，确认在改动前失败，再修改。

### 1. 做了什么

| PROGRESS | commit | 内容 | 文件（网页文件相对 `apps/web/`） |
|---|---|---|---|
| — | `9eb0e7d5 Merge: 合入 main（澳大利亚完整版页面 #81）` | 冲突处理：`components/policy-page.tsx` 取 main 的版本（与本分支 `a22f2879` 的标题改动目的相同，main 另有标题回退、按语义的千分位与 `displayParameter`）；`lib/site-countries.ts` 同时登记 `au` 与 `nz`；`i18n/{zh-CN,en}.ts` 两边都把本国集合入口文案移进了本国字典，冲突块两边都删；`public/sw.js` 与 `test/about-page.test.tsx` 的缓存版本改为 `2026-11-25-nz`；`PROGRESS.md` 自动合并，两边的行都在 | 同左 |
| 548 | `d7a20c11 Fix: 新西兰分享链接带场景且不覆盖本机草稿，跳链保留场景片段` | 国家模块设 `scenarioLinks: true`；`components/site-shell.tsx` 的场景路径判断加入新西兰的问卷、结果、对比页 | `lib/new-zealand-module.ts`，`components/site-shell.tsx`，`test/new-zealand.test.tsx` |
| 549 | `1d381c37 Fix: 新西兰结果日期标为预计满足条件的日期` | 设 `earliestLabel: 'nz.result.earliest'`（预计满足条件的日期 / Projected date the conditions are met）；e2e 对比页改读该文案 | `lib/new-zealand-module.ts`，`i18n/countries/new-zealand.ts`，`test/new-zealand.test.tsx`，`apps/e2e/tests/new-zealand.spec.ts` |
| 550 | `40052895 Fix: 新西兰检查项按申请条件、时间、费用、批准后事项、可选依据与办理提示分组` | 为每个检查项设 `kind`，结果去掉 `decidedBy` | `lib/new-zealand-module.ts`，`test/new-zealand-questionnaire.test.tsx` |
| 551 | `cf727c85 Fix: 新西兰政策页按含义展示费率表、工作月数窗口与 OET 等级顺序` | 设 `displayParameter` | `lib/new-zealand-policy.ts`，`i18n/countries/new-zealand.ts`，`test/new-zealand.test.tsx` |
| 552 | `Docs: 任务 94 合入 main 与共用选项接入报告` | 本节 | 本报告、`PROGRESS.md` |

各项说明：

- **分享与跳链（548）**：打开 `/new-zealand/result#s=…` 时，本机已有草稿就不再写入；结果页的编辑、对比链接带 `#draft=` 场景片段。在新西兰的问卷、结果、对比页上，“跳到主要内容”改为按钮，只移动焦点，不把 `#s=` 改成 `#main`。
- **日期标签（549）**：旅行条件路径的日期是首次以居民身份入境的日期（`NZ-P1-1` 的 `plannedEntry`），不是可递交日；永居、入籍、技术、家庭等路径的日期才是可递交日。main 的 `earliestLabel` 只能按国家设一个键，所以全部路径统一用“预计满足条件的日期”，对两类日期都成立。按 brief 没有改共用组件；美国分支（任务 96）把 `earliestLabel` 放宽为按路径 id 的键表后，可只给 `NZ-TRAVEL` 设这个标签，其余路径恢复“最早可申请日期（推算）”。
- **检查项分组（550）**：
  - `budget`（费用预算）：`NZ-P1-FEE`、`NZ-P2-7`、`NZ-P3-7-FEE`、`NZ-P4-FEE`、`NZ-P5-4`、`NZ-P6-3`、`NZ-P7-FEE`、`NZ-P8-5`、`NZ-P9-4`、`NZ-P10-2`、`NZ-C6-LEVY`。递交时必须已缴费的 `NZ-FILING-FEE` 参与判定，仍是申请条件。
  - `afterApproval`（批准后事项）：入籍宣誓 `NZ-P3-7-OATH`；AIP 的投资期、在境与检查点 `NZ-P9-2`（选“投资条件”目标时参与判定，此时为申请条件）；Business Investor 工签阶段的居民条件 `NZ-P9-3`、`NZ-P9-3-OPERATIONS`、`NZ-P9-3-ENGLISH`（居民阶段参与判定，此时为申请条件）。
  - `alternative`（可选依据）：`NZ-P1-3` 较长及特别旅行期限。`NZ-P1-2` 要求“在新西兰境内”或“符合较长期限”之一，`NZ-P1-3` 是后一项依据。
  - `information`（办理提示）：其余不参与判定的项，即投资者购房提示 `NZ-P9-HOME`，目标不是直接获永居时的 `NZ-P7-4`，以及居民阶段作参考的 BI 工签条件 `NZ-P9-3-WORK`。
  - `time`（时间条件）：引擎据以推算路径日期的期间和日期，包括 `NZ-P1-1`、`NZ-P1-1-TRAVEL`、`NZ-P2-1`、`NZ-P2-2`、`NZ-P2-3`、`NZ-P2-JOINT-DATE` 和 `NZ-P3-1-PRESENCE`。
  - 其余参与判定的项为 `requirement`。“参与判定”沿用引擎各路径的 `decidedBy`，路径状态仍由引擎决定。
  - 设好 kind 后，模块结果去掉 `decidedBy`。共用 `ResultView` 因此不再把费用、征费、宣誓等收进默认折叠的“其他路径的条件（可看这些路径为何未被采用）”，而是在本路径下逐项标出分组。“还差什么”只列申请条件与时间条件。待定项按共用规则显示“待定细节”。
- **政策页（551）**：
  - 本国参数都只有一层，没有 AU 那种嵌套的行数组。逐个核对 89 个参数后，按含义改了三类。
  - 按起始日的时薪门槛（SMC 六档、绿名单五档、护理 `careRates`）显示为“起始日—时薪（NZD）”表；父母担保的 `parentMedianIncome` 显示为“起始日—年化中位工资（NZD）”表，数值等于各期中位时薪乘 2080；Tier 1 特定时薪 `tierOneEmployeeRates`、`tierOneContractRates` 显示为“ANZSCO 职业代码—时薪（NZD）”表。
  - `workResidenceMonths`（`{required: 24, window: 30}`）原先被共用组件当作英国的“最好年份”格式，显示成“30 年中满足 24 年”。现改为“30 个月中满足 24 个月”（SRC-237 SR5.15(a)）。
  - `englishOetGrades` 标明“由低到高”。
  - 年份千分位按 main 的规则自动生效。本国参数里没有公历年份数值（≥ 1000 的数值都是金额、天数或名额），金额与计数照常分组，例如 `significantCostNzd 81,000`。
  - 字段名式的扁平对象键（如 `travelYears` 的 `general`、`parent`）与 AU、日本、英国一样原样显示，未逐个本地化。

逐条对应原先标为“待任务 93 的共用修正合入后解决”的条目：

| 原条目 | 处理 |
|---|---|
| 问题 5：`PolicyPage` 缺 `country.id` 时输出空 `<h1>` | 合入 main 后解决。main 的 `policy-page.tsx` 在没有 `id`、或未登记 `<国家>.policy.pageTitle` 时回退到“政策依据”，由 main 的 `country-views.test.tsx` 覆盖；新西兰政策页仍显示“新西兰政策依据 / Policy basis for New Zealand”，由 e2e 断言 |
| 风险 1 的共用部分：费用与获批后事项被收进“其他路径的规则”折叠区 | 已解决（550）。main 的共用结果页没有改这个折叠逻辑，它只对带 `decidedBy` 的路径生效；新西兰在模块里设 kind 并去掉 `decidedBy`，不改共用组件 |
| 风险 3：分享链接覆盖本机草稿、跳链把 `#s=` 改为 `#main` | 已解决（548）。用 main 的 `scenarioLinks`，并在 `site-shell.tsx` 加入新西兰路径 |
| 首轮报告第 3 节：政策页 h1 需合并 main 后 e2e 才会通过 | 已解决。合入 main 后 e2e 的 `Policy basis for New Zealand` 断言通过 |

### 2. 怎么验证的

- **回归测试先失败**：
  - 548：新增测试在改动前失败于“本机草稿被分享链接覆盖”；只设 `scenarioLinks` 后，改为失败于三页的跳链仍是 `href="#main"`；改 `site-shell.tsx` 后通过。
  - 549：两项双语测试在改动前失败（`earliestLabel` 为 `undefined`）。
  - 550：一项测试在改动前失败（`NZ-P1-1` 的 kind 为 `undefined`）。
  - 551：两项双语测试在改动前失败。先登记文案、再改展示时，测试读到的实际单元格是“30 年中满足 24 年”和“24 of 30 years”。
  - 每个 commit 前单跑 `test/new-zealand{,-questionnaire}.test.tsx` 及相关的 `game-theme`、`share`、`japan`、`australia`、`policy-page`、`country-views` 测试，并对改动文件跑 `eslint`、`prettier --check` 和 `tsc --noEmit`，均通过。
- **完整验收**：`(export VITEST_MAX_WORKERS=2; pnpm lint && pnpm typecheck && pnpm test && pnpm build)`，退出码 0。
  - 测试：error-report 2 项、policy-data 23 项、engine 6,006 项通过（1 项既有文案导出测试按开关跳过）、game 1,348 项、web 886 项（47 个文件）。
  - 构建：预渲染 40 个页面和路由；`apps/web/out/new-zealand{,/simulate,/result,/whatif,/policy}.html` 都已生成；`out/offline-pages.json` 与 `out/sitemap.xml` 含这五个路径；`out/sw.js` 含 `2026-11-25-nz`。
- **浏览器 e2e**：先用 `lsof -i :4456` 确认端口空闲，再运行 `cd apps/e2e && E2E_PORT=4456 npx playwright test tests/new-zealand.spec.ts tests/australia.spec.ts tests/japan.spec.ts tests/site.spec.ts --project=desktop --reporter=line`，21 项全部通过，跑完已删除 `apps/e2e/test-results`。新西兰用例覆盖的内容：
  - 分享链接在新浏览器上下文中还原，Axe 没有 serious 或 critical 问题。
  - 对比页按 `nz.result.earliest` 读到 `2027-06-12→2027-05-29`。
  - 政策页 h1 为 `Policy basis for New Zealand`。
- **视觉验收**：用 `apps/e2e/serve.ts` 在 4457 端口起静态服务，在内置浏览器里打开构建产物，用后已关闭。
  - 结果页：用分享链接打开旅行变更、永居、入籍、AIP 四条路径。日期标签为“预计满足条件的日期”；每项条件标题后带分组，如“较长及特别旅行期限 · 可选依据（满足其一即可）”“获批后的宣誓 · 批准后事项”“投资者购房提示 · 办理提示”；页面上没有“其他路径的条件”。点“跳到主要内容”后焦点到 `#main`，地址仍是 `#s=…`，“已载入分享链接”的提示仍在。
  - 政策页：桌面宽度下时薪表按“起始日—时薪（NZD）”显示。375 px 中英文下 `workResidenceMonths`、OET 等级、Tier 1 时薪表显示正确，参数区与整页的 `scrollWidth` 都等于可视宽度。英文结果页在 375 px 下也没有横向滚动。

### 3. 没做或没验证的

- 未 push，未开 PR。
- 日期标签只能按国家设一个，暂用“预计满足条件的日期”。永居、入籍、技术与家庭路径本来可以显示“最早可申请日期（推算）”，需等美国分支（任务 96）的按路径键表合并后，再只给 `NZ-TRAVEL` 单独设标签。
- 政策页里字段名式的扁平对象键（如 `travelYears`、`health`、`businessInvestor` 的子键）沿用各国现有做法原样显示，没有逐个本地化。
- e2e 只跑了 brief 指定的四个文件、`desktop` 项目；`mobile` 项目和截图基线没有跑。
- 共用组件只按 brief 在 `site-shell.tsx` 加了新西兰路径，没有改结果页、政策页、`earliestLabel` 的共用写法，也没有改引擎和参数。

### 4. 发现与建议（范围外，未实现）

1. `site-shell.tsx` 的 `isJapanScenario` 现在按路径列出日本、澳大利亚和新西兰。每加一个设了 `scenarioLinks` 的国家都要再改这里，建议改为按国家模块的 `scenarioLinks` 判断，并改名。
2. 引擎 `packages/engine/src/new-zealand-checks.ts` 把 OET 门槛写死在代码里：主申 `C+`、家属 `C`、ESOL 中档费用 `D`。这些门槛没有放进 `packages/policy-data` 参数，不符合“不硬编码门槛”的约定，建议另开规则任务迁移并附 SRC-241 定位。
3. 共用 `ResultView` 按 `decidedBy` 拆出“其他路径的条件（可看这些路径为何未被采用）”折叠区，这套写法是给英国用的。西班牙引擎（`spain-full*.ts`）也输出 `decidedBy`，接入页面时会遇到同样的问题，可参照本节的做法：设 kind，再去掉 `decidedBy`。
4. 首页文案 `nz.intro` 仍说“查看最早可以申请的日期”。按路径设日期标签后，可以一并统一措辞。全站 `hub.intro`、`hub.privacy` 仍待十国完成后统一修改。
