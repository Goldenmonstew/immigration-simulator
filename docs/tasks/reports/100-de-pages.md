# 任务 100 报告：德国完整版页面

实现者：Gemini 4 Argon（agy）写出模块、页面与测试初稿，因模型额度中断未提交；Claude Opus 5.5（Fable）接手修正、补完并在浏览器里跑通 e2e。

## 1. 做了什么

| commit | 内容 |
|---|---|
| Feat: 接入德国完整版问卷、结果、对比与政策页 | `apps/web/lib/germany-{draft,fields,module,policy,policy-rules,whatif}.ts`：国家模块（`createDraft`、`validateStep`、`decodeDraft`、`run` 调用 `evaluateGermanyFull`、`whatif`、`policy`）。`/germany` 首页与 `/germany/{simulate,result,whatif,policy}` 四页；旧的只算时间页面 `apps/web/lib/germany.ts` 删除，入口由新页面接管。中英文文案在 `apps/web/i18n/countries/germany{,-form,-module}.ts`，集合入口卡片 `hub.de.*` 改为完整版范围。政策页标题按国家通用（与任务 93 相同的 `policy-page.tsx` 改动），德国为"德国政策依据"。 |
| Test: 德国完整版页面单测与双语 e2e | `apps/web/test/germany.test.tsx` 8 项：首页链接、离线清单与 sitemap、草稿往返与旧草稿迁移、分步校验、`run` 的满足／未来日期／待确认三类结果、对比旋钮、政策页只列德国来源、问卷各步渲染。Claude 修正了初稿：样例缺技术人员资格两项、入籍路径状态写错、对比渲染断言按 HTML 结构改写。 |
| Fix: 德国逐份文书出境记录可确认为无 | 逐份文书（§ 51）下的出境记录未填时没有"确认无此项记录"按钮，用户无法表达"无出境"，文书存续条件只能停在待确认。 |
| Test: 按真实字段重写德国 e2e | 初稿用例未在浏览器跑过，字段 id 和首页标题都对不上；按单测样例逐项填写后两条用例通过。 |

### 问卷步骤与字段

| 步 | 标题 | 字段 |
|---|---|---|
| 0 | 日期与评估路径 | 模拟日期、出生日期、首次入境（按所选路径需要）；路径多选，分定居、入籍、自由流动三组（R01–R18）。 |
| 1 | 居留许可、出境记录与文书存续 | 居留许可记录（类别、起止、续签）；出境记录；逐份文书存续核查（§ 51：文书类别、有效期或"已确认覆盖模拟日"、§ 81 续期、其他失效事由、长期居留例外、配偶、年龄、生计、驱逐利益、签证等，以及每份文书下的出境记录）。 |
| 2 | 定居通用条件 | 四个折叠段：身份与程序（身份、国籍、护照、行为能力、证明与到场、入境、安全、登记地址、过渡规则）；生计（是否确认、福利、医疗豁免、2026 年家庭预算明细、医保类别）；养老与就业（本人与配偶缴费月数、照护折算、教育、就业与职业许可）；语言与住房（德语证书、整合课程、豁免、社会知识与分数、住房面积与质量）。 |
| 3 | 所选定居与自由流动路径专用条件 | 按所选路径显示：R02 技术人员、R03 蓝卡（逐段就业月份与工资）、R04–R06、R08–R18 各自的专用字段。 |
| 4 | 入籍条件 | 身份、生计、语言与品行三段，以及按入籍路径的专用字段（声明、刑事记录、考试成绩等）。 |
| 5 | 申请与考试费用 | 申请或撤回阶段、证件类型、年龄、减免与已付款、考试渠道。 |

只有规则允许留空的项可以留空；留空送出"未填"，结果里显示为待确认。

### 对比旋钮

| 焦点 | 控件 | 作用 |
|---|---|---|
| `date` | `de-whatif-date` | 模拟／拟递交日期，关联各路径的时间条件 |
| `trips` | `de-whatif-trips` | 假设没有出境记录 |
| `german` | `de-whatif-german` | 已证明的德语等级 |
| `knowledge` | `de-whatif-knowledge` | 社会知识考试分数 |
| `contributions` | `de-whatif-contributions` | 本人养老缴费月数 |
| `blueCardMonths` | `de-whatif-blue-card-months` | 蓝卡就业月数 |
| `salary` | `de-whatif-salary` | 蓝卡年薪 |
| `livelihood` | `de-whatif-livelihood` | 生计是否已确认 |

结果页条件的"去 What-if 试试"按条件 id 定位到对应旋钮。

### 旧链接的处理

- `/germany` 地址保留，由完整版首页接管。
- 旧的只算时间草稿（含 `settlementRoute` / `naturalisationRoute` 的无版本对象）由 `migrateLegacyGermanyDraft` 迁移成 `version: 1` 的新草稿。
- 分享信封为 `{country: "de", v: 1, draft}`，地址 `/germany/result#s=…`。
- 旧评估函数 `evaluateGermany` 保留在引擎中不动。

## 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。engine 6,006 项通过、1 项跳过；game 1,348 项通过；web 835 项通过。
- `pnpm --filter e2e exec playwright test tests/germany.spec.ts --project=desktop`：2 项通过。覆盖中文问卷到结果页（一般定居许可最早 2027-05-23、一般入籍未满足）、保存方案后刷新仍在、分享链接在新上下文还原同一结果、从条件跳到对比页改日期后显示 2027-05-23→2027-06-01；英文手机宽度无横向滚动、政策页只列德国来源。

## 3. 没做或没验证的

- 没改规则语义和参数，没改英国和其他国家页面。
- 问卷是否覆盖 `evaluateGermanyFull` 的全部输入，由单测的样例与 Gemini 审核核对，没有逐字段做穷举对照。

## 4. 发现与建议

- 结果页"未知／未定事项"里，几项费用条件（处理费、适用费率、考试费）在没填费用步骤时都显示为待确认，信息量偏多；可以考虑费用步骤留空时合并成一条提示。

## 审核修正（review100-1）

修正者：Claude Opus 5.5。审核意见来自 Gemini 4 Neon 的只读审核。每项先写失败的回归测试再修，新增测试都在 `apps/web/test/germany.test.tsx`，e2e 在 `apps/e2e/tests/germany.spec.ts`。

### 1. 做了什么

| commit | PROGRESS | 对应审核编号 | 内容 |
|---|---|---|---|
| `7482eb5a` Fix: 德国刑事记录日额必填、历史劳工无须身份、旧草稿迁移后校验 | 725 | 问题 1、7、8 | 刑事记录选 `fines` / `mixed-sentences` 时日额列表必填（可「确认无此项记录」，引擎按待确认处理），漏填时校验拦在第 4 步，已完成的草稿回到第 4 步而不运行引擎。`historicalWorker.kind = 'none'` 时不再显示和校验申请人身份、入境日，配偶随行只在申请人是配偶时询问。旧版草稿迁移后经 `restoreStoredGermanyDraft` 逐步校验，缺首次入境等必填项时回到出错步骤，`completed: false`。 |
| `27ab6671` Fix: 德国出境与许可记录区分未填和确认没有 | 726 | 问题 2 | 新草稿与评估不再把 `permits` / `trips` 默认成 `[]`。所有记录列表（含逐份文书下的出境记录）都有「确认无此项记录」，确认后显示「已确认为无记录。」并可「恢复为待确认」；删除最后一行回到未填。单测按审核复现：R01 未填出境时 DE-C13 为 `UNKNOWN`、确认无出境为 `MET`；R00 的 DE-C63-time、R03 的 DE-C19 未填时为 `UNKNOWN`。 |
| `f0473994` Fix: 德国问卷字段与选项按问题使用各自文案 | 727 | 问题 4、建议 3 | `GermanyField` 增加独立标签键（`labelled`）和按问题的选项文案键（`worded` / `optionKey`）。逐项修正见下表。依赖前置选择的字段按条件显示：全职／伴侣全职、伴侣同住、例外预测随 `incomeException`；历史劳工随两种 `legacy-worker`；R08 关系终结日、共同子女、监护随关系已终结；费用的核定金额、州考试报价、机构报价和整合课四项随相应选择。 |
| `c259d8c5` Fix: 德国政策页入籍全职例外按月显示 | 728 | 问题 3（单位部分） | 德国政策目录把 `citizenshipFullTime` 展示为 `requiredMonths 20、windowMonths 24`（取自参数值，来源仍为 SRC-101 § 10 Abs. 1 Satz 1 Nr. 3b–c），不再套用英国「最佳年份」。未改 `policy-page.tsx`。 |
| `dee6d964` Fix: 德国隐藏答案不参与评估与分享，存储只写各自字段 | 729 | 问题 6、建议 3（存储） | `activeGermanyAnswers` 按可见步骤、所选路径和字段条件只保留问题本身拥有的答案：`germanB1` 只随 R03、`germanC1` 只随 R05；只选入籍时不送定居通用条件（含家庭预算）；`settlement` 只留所选路径字段；未选的 R08／R16／R17 分组和不满足条件的字段都不送。`storeGermanyAnswers` 只给已有内容的对象写待定空值、不展开未答分组，`settlement` 不再混入蓝卡与自由流动分组。审核的最小 R01 草稿 JSON 由 4,028 字节降到 274，分享串由 5,412 字符降到 407。入籍生计标签改为「同时评估定居路径时，可留空并按定居通用条件中的家庭预算核算」。 |
| `2b6a9268` Fix: 德国对比页校验、旋钮拆分与按路径显示 | 730 | 问题 5、风险 1、风险 5、建议 2 | 见下方「对比页」。 |
| `f66cfea2` Fix: 德国问卷样式、列表错误聚焦与数字列表空行 | 731 | 问题 9、风险 4 | `questionnaire.module.css` 改为实际引用的 `steps`、`section`、`evidence`，嵌套记录里的输入框限宽 100%。分组与列表级错误显示在带 `id`、`tabIndex=-1`、`aria-invalid`、`aria-describedby` 的 fieldset 上，提交失败时焦点落到该列表；行内输入关联同一条错误，错误文字只出现一次。数字列表新增或清空的行保持空白，不再写回 0；未填完的空行不保存。 |
| `9b09eb7f` Chore: 递增离线缓存版本以缓存德国新页面 | 732 | 风险 3 | `sw.js` 的 `CACHE_NAME` 改为 `2026-11-24-v6`，`about-page.test.tsx` 同步。 |
| `ff066442` Fix: 德国对比页日期提示只举首次入境 | 733 | 问题 5 | 视觉检查时发现提示里的「许可起始日」不按已发生事实校验，删去。 |
| `f75489e9` Test: 德国 e2e 补对比旋钮、日期校验与窄屏嵌套记录 | 734 | 建议 4 | 见「怎么验证的」。 |
| 本节 Docs commit | 735 | — | 本报告。 |

问题 4 逐项核对（单测渲染问卷后按控件 `id` 取标签或选项文字，中文断言全文，英文断言不再是原来串用的文案）：

| 审核所列 | 位置 | 修正后中文 |
|---|---|---|
| `endedOn` | R08 `spouse.endedOn` | 婚姻或登记伴侣关系依法终结之日，或德国籍配偶去世之日 |
| `school` | R11 `childEducation` | 在读普通学校，目标为认可的学校毕业文凭 |
| `family` | R11 `childPermitBasis` / R18 `periods[].basis` | 家庭原因居留许可（AufenthG 第 2 章第 6 节）／作为欧盟／EEA 公民的家庭成员 |
| `other`、`child` | R16 `family.relation` | 其他亲属关系（不适用随同入籍）／主申请人的未成年子女 |
| `other`（同类串用） | R05 `protectionTitle`、R10 `businessPermit`、R11 `childPermitBasis`、R15 `formerSpousePermanentTitle` | 各自的「其他」措辞 |
| `unverified` | 入籍 `currentTitle` | 居留头衔或适用条文尚待核实 |
| `insufficient` | R15 `formerSpouseMaintenance` | 扶养款与本人收入合计不足以维持生计 |
| `under-review`、`inadequate` | R06、R11、R15 | 通用措辞「主管机关仍在审核中」「保障不足或尚未建立」；R06 `euCareCover` 的 `statutory` 另为「德国法定医疗及护理保险」 |
| `not-required` | R13 `stateConsent` | 依法无需州主管机关同意 |
| `ordinary` | R11 `childSchoolCredit`、费用 `reduction`、`courseExemption` | 各自措辞（境外上学天数不计入并顺延／无减免／未获免除） |
| `partner`、`worker`、`spouse` | 入籍 `incomeException`、`historicalWorker.applicant` | 伴侣全职例外（§ 10 Abs. 1 Nr. 3c）／申请人本人即该历史劳工／申请人为该劳工的配偶；语言例外的 `legacy-worker` 引 § 10 Abs. 4 Satz 3 |
| `humanitarian`、`ineligible` | R11 `childPermitBasis`、R06 `periods[].kind` | 含 § 25 Abs. 1–2 保护身份的第 5 节人道许可／不可按 § 9b 计入的居留期间 |
| 字段 `periods`、`kind` | R18 `freedom.periods`；R06 期间、R11 裁判、历史劳工、知识证明、刑事记录 | 自由流动居住期间及每段的权利依据；该期间的居留类别（§ 9b）、裁判类型、历史劳工类别、知识证明方式、刑事记录情形 |

另外一并分开的同名字段：R18 离德的「非暂时性原因」改引 § 4a Abs. 7 FreizügG/EU（原文案引 § 51 AufenthG），R18 提前取得的 `basis` 改为「适用的提前取得情形」。

对比页（`2b6a9268`）：

- 问题 5 校验：旋钮自身校验通过后，按新日期逐步复核问卷；早于首次入境等已发生事项时日期控件报错，不再出现无字段错误的「请先修正」。
- 问题 5 知识分数：调分数时删除 `common.knowledgeEvidence`，待定或学校证明不再压过分数。
- 问题 5 多路径：德语、知识分数、生计拆成定居（`de-whatif-german` / `knowledge` / `livelihood`）与入籍（`de-whatif-nat-german` / `nat-knowledge` / `nat-livelihood`）两组，DE-C49、C60 指向入籍生计，DE-C50 指向入籍德语，DE-C51、C61-guidance 指向入籍分数。R01+R07 样例中只调入籍生计即可使 R07 的 DE-C49 满足。
- 问题 5 生计清空：选回「未填」时同时清除 `common.benefits`。
- 问题 5 蓝卡月数：不再删除逐段就业记录；有逐段记录时该处改为说明（保留控件 id 以便跳转），月数请回问卷修改。审核复现中 DE-C21-job 保持 `NOT_MET`。
- 风险 1：改模拟日期后，文书「有效期覆盖模拟日」（`validTo: null`）、`continuingUnder81: true`、蓝卡 `cardHeldAtDecision: true` 改为未填，日期控件下有说明。
- 风险 5：定居生计初值按所选路径读取 R05／R05-fast 决定、R06 固定收入、R11 子女生计、R15 扶养；入籍生计读取 R17 裁量。各路径答案不一致（或由家庭预算明细决定）时，下拉框显示「保持问卷中的原答案」，不改写任何字段；改为具体值时统一写入。R01 与 R03 德语等级不同同样如此。「假设没有出境」另把 R11 境外上学天数记为 0，R06 的离欧区间按前一段居留类别计入，旋钮下列出这些含义。
- 建议 2：定居组只在有定居通用条件步骤时显示，蓝卡月数与年薪只随 R03，入籍组只随入籍路径；不再把年薪旋钮联到 R02 首次许可（DE-C16-initial 是程序提示），取消其跳转。

### 2. 怎么验证的

- 每项修正前先跑新增单测确认失败（问题 1、7、8、2、4、3、6、5、9／风险 4、风险 3 各自的断言），修后通过。
- `cd apps/web && npx vitest run test/germany.test.tsx`：18 项通过（原 8 项 + 新增 10 项）。
- `cd apps/e2e && E2E_PORT=4433 npx playwright test tests/germany.spec.ts --project=desktop --reporter=line`：2 项通过。新增覆盖：顶层出境记录确认无、撤销、再确认；逐份文书下添加再删除出境回到未填后确认无；文书有效期改填具体日期（避免改日期时被风险 1 清空）；对比页无年薪旋钮、入籍生计选「是」后 DE-C49 显示已满足、日期改到 2022-01-01 时日期控件显示提示；375px 下三层嵌套记录（文书→出境→离开适用地域区间）和展开的定居通用条件均不横向滚动。断言的状态先在单测里算出（R01 2027-05-23→2027-06-01、DE-C49 满足）。跑完已删除 `apps/e2e/test-results`。
- 用 Playwright 截图人工检查：375px 下第 1 步三层嵌套和错误提示、第 2 步四个折叠段的样式、第 4 步罚金日额列表错误（提交后焦点落在 `de-nat-criminalRecord-dayRates`）、第 5 步选整合课后出现的条件字段；1280px 下对比页 R01+R07 的旋钮（定居、入籍两组，无蓝卡旋钮）与日期错误。均无溢出或错位。
- `VITEST_MAX_WORKERS=2 pnpm lint && pnpm typecheck && pnpm test && pnpm build` 在全部提交后串行跑完，退出码 0：error-report 2、policy-data 23、engine 6,006（跳过 1）、game 1,348、web 845 项通过；构建产出 `apps/web/out/germany.html` 与 `apps/web/out/germany/` 子页。构建后重跑上述 e2e，2 项通过。

### 3. 没做或没验证的

- 共用组件按 brief 未改，待任务 93 的共用修正合入后解决：问题 3 的标题回退（`PolicyPage` 省略 `country.id` 时空标题）、风险 2（多标签页与分享链接覆盖本机德国草稿，涉及 `page-result.ts`、`share.ts`、`result-page.tsx`、`whatif-lab.tsx`）、建议 1（政策页年份不加千分位），以及建议 2 后半「把德国纳入 `ResultPage` / `WhatIfLab` 的片段情景隔离」。
- 没改规则引擎与参数；全职例外只改德国目录的展示形态。
- R06 离欧区间在「假设没有出境」下按前一段居留类别计入，是对比假设而非规则语义；如审核认为应改为别的口径再调整。
- 入籍 `benefitsNotAttributable` 仍无条件显示：它同时用于历史劳工例外和 2023-08-23 前递交的旧申请，按条件隐藏会漏问。
- 没在真机浏览器上做多标签页验证（属共用组件范围）。

### 4. 发现与建议

- 进行中的德国草稿只要有一个格式错误（例如数字填了负数、年月格式未写完），重新打开问卷时 `decodeGermanyDraft` 会返回 `undefined`，问卷回到空白草稿，已填内容丢失。本轮只避免了数字列表空行触发这一情况；建议在共用读取流程里对未完成草稿保留内容并回到出错步骤（日本草稿可能有相同模式，未核对）。
- 结果页「去 What-if 试试」只按条件 ID 选旋钮；若以后某个条件在不同路径下需要不同旋钮，`focusForRule` 可以利用已传入的 `pathwayId`。

## 合入 main 与共用选项接入

修正者：Claude Opus 5.5。澳大利亚完整版页面（任务 93，#81）合入 main 后，按其报告"其他国家怎么接入这次的共用改动"一表接入德国。上一位 agent 完成了合并与四项接入后因网络中断停在验收阶段；本节由接手者核对已有 commit、提交剩余的 e2e、完成验收并补写。每项接入都带回归测试，接手后另行确认这些测试在接入前的源文件上失败（见第 2 段）。

### 1. 做了什么

| commit | PROGRESS | 内容 |
|---|---|---|
| `28aa4b1c` Merge: 合入 main（澳大利亚完整版页面 #81） | — | `policy-page.tsx` 等共用组件取 main 的版本；`site-countries.ts`、`i18n/{zh-CN,en}.ts` 两边登记取并集；`sw.js` 的 `CACHE_NAME` 与 `about-page.test.tsx` 统一为 `2026-11-25-de`；`PROGRESS.md` 两边的行都保留。合并后本分支对共用组件的改动只剩下一行 `site-shell.tsx`（见下）。 |
| `5dbabc1c` Fix: 德国分享链接不覆盖本机草稿，结果、编辑与对比之间带场景 | 739 | `germanyModule` 设 `scenarioLinks: true`；`site-shell.tsx` 的场景路径判断加上 `countryPath('de', …)`，德国结果、问卷、对比三页的"跳到主要内容"渲染为按钮，不洗掉 `#s=` / `#draft=`。 |
| `06020c39` Fix: 德国结果日期标注为预计满足评估条件的日期 | 784 | 德国路径的 `earliestDate` 是按记录推算时间条件、其余条件按模拟日评估得出的日期，不是允许递交日。模块设 `earliestLabel: 'de.result.earliest'`，中文"预计满足评估条件的日期"、英文"Projected date the assessed requirements are met"；结果页、缺口摘要与对比页统一改读。 |
| `9a6d1492` Fix: 德国检查项分组，费用、批准后事项与办理提示不进"还差什么" | 785 | 模块的 `run` 为每项设 `kind`：费用 DE-C65–C71（含 `-advance`、`-express`、`-paid`、`-review`、`-exemption`）为 `budget`；DE-C54 庄严声明及证书交付为 `afterApproval`；引擎不计入路径状态的程序项（`DE-C01-procedure`、`DE-C06-authority`、`DE-C11`、`DE-C11-deadline`、`DE-C16-initial`、`DE-C34-initial`、`DE-C46-application`、`DE-C58-guidance`、`DE-C61-guidance`）为 `information`；`*-time` 与 DE-C13、C28、C44、C55 为 `time`；其余为 `requirement`。程序项集合由引擎导出为 `DE_PROCEDURE_CHECKS`，页面不另抄一份。设了 kind 之后待定项显示"待定细节"。 |
| `ba3fdc04` Fix: 德国政策页按含义展示嵌套参数，金额带币种、年份不加千分位 | 786 | `germanyPolicy` 提供 `displayParameter`：嵌套参数显示为"项目／数值"表格，带中英文标签与单位；蓝卡年薪按年份、退休年龄增加月数按出生年份列表；蓝卡德语档按就业月数标注；ISCO 代码列表标明 ISCO-08；单列金额带 €。删去 `c259d8c5` 改写 `citizenshipFullTime` 参数值的做法，改由展示层显示"所需全职月数 20 个月／最近核算期间 24 个月"。 |
| `04f7fed6` Test: 德国 e2e 补分享链接不覆盖本机草稿与跳到主要内容保留场景 | 787 | 接收方先在问卷选 R18 产生本机草稿，再打开分享链接：结果与发送方一致，`de-immigration-draft-v1` 原样不变；按"跳到主要内容"后焦点落到 `main`，地址仍带 `#s=`。这是上一位 agent 留在工作区的未提交改动，核对选择器（`#de-route-R18`、存储键、`site.skip` 按钮）与单测一致、e2e 通过后提交。 |
| 本节 Docs commit | 788 | 本报告。 |

原来标为"待任务 93 的共用修正合入后解决"的条目：

| 条目 | 处理 |
|---|---|
| 问题 3 标题回退（`PolicyPage` 省略 `country.id` 时空标题） | main 的 `PolicyPage` 在没有 `country.id` 或该国未登记标题时回退到 `policyPage.title`，由 `country-views.test.tsx` 覆盖；本分支合并时取 main 版本，未另改。德国登记了 `de.policy.pageTitle`，`germany.test.tsx` 断言 `<h1>德国政策依据</h1>`。问题 3 的单位部分改由 `displayParameter` 显示（`ba3fdc04`），不再改写参数。 |
| 风险 2（多标签页与分享链接覆盖本机德国草稿） | `scenarioLinks: true`（`5dbabc1c`）。打开分享链接不写本机草稿；结果、编辑、对比之间的链接带场景片段，各标签页按自己的片段读场景。单测与 e2e（787）各覆盖一次。 |
| 建议 1（政策页年份不加千分位） | main 按键名（以 `year`、`from`、`cohort` 结尾、1900–2100 的整数）判断年份，德国的 `displayParameter` 另把年份按文本显示。逐个列出德国参数中 1900–2100 的整数：`retirementAge.firstRaisedCohort` 1947、`retirementAge.firstStandardCohort` 1964、`initialSkilledSalary.year` 2026；以年份为键的 `blueCardStandardPay`（2024–2026）、`retirementAdditionalMonths`（1947 起逐年）。中英文都显示为不分组的四位数，单测断言页面不含 `1,947`、`1,959`、`1,964`、`2,024`、`2,026`。 |
| 建议 2 后半（把德国纳入 `ResultPage` / `WhatIfLab` 的片段情景隔离） | 同风险 2，由 `scenarioLinks` 打开。德国三页本来就用共用的 `ResultPage`、`QuestionnaireShell`、`WhatIfPageContent`，合并后共用组件与 main 一致，无需本国另写。 |

brief 里的其余接入项："可选替代依据不进还差什么"——德国引擎没有"满足其一即可"的独立可选依据检查项（`skilledAlternativePension` 等替代依据在 DE-C17 等条件内部合并判断），因此没有标 `alternative` 的项。R00 逐份文书的存续结果虽是"任一份满足即可"，但引擎没有汇总条件，若标为 `alternative`，R00 为 `NOT_MET` 时缺口会是空的，所以仍标为申请条件。

### 2. 怎么验证的

- 回归先失败后通过：接手后把四项接入涉及的源文件（`lib/germany-module.ts`、`i18n/countries/germany-module.ts`、`lib/germany-policy.ts`、`components/site-shell.tsx`、引擎 `germany-full.ts`、`index.ts`）临时恢复为合并提交 `28aa4b1c` 的版本，保留当前测试，`npx vitest run test/germany.test.tsx` 中 8 项失败、17 项通过；失败的正是新增与改写的 8 项（分享不覆盖草稿与 `#draft=` 还原、跳转按钮、双语日期标签、kind 分组与缺口、双语嵌套参数、全职例外按月）。还原后 25 项全部通过。`test/germany.test.tsx`、`test/country-views.test.tsx`、`test/about-page.test.tsx` 合计 43 项通过。
- 年份核对：临时脚本遍历 `germanyFull2026_11.values`，列出 1900–2100 的整数只有上表三项（脚本已删除，不提交）；单测按两种语言断言页面不出现分组后的年份。
- 完整验收：`(export VITEST_MAX_WORKERS=2; pnpm lint && pnpm typecheck && pnpm test && pnpm build)`，退出码 0。error-report 2、policy-data 23、engine 6,006（跳过 1）、game 1,348、web 877 项通过（46 个文件）；构建生成 40 个静态页面，`apps/web/out/germany.html` 与 `apps/web/out/germany/{policy,result,simulate,whatif}.html` 均存在。
- 浏览器 e2e：`cd apps/e2e && E2E_PORT=4453 npx playwright test tests/germany.spec.ts tests/australia.spec.ts tests/japan.spec.ts tests/site.spec.ts --project=desktop --reporter=line`。第一次 20 项通过、1 项失败：`japan.spec.ts:594`（另一标签页保存草稿后分享结果保留场景），在页面隐藏、时钟拨过午夜后过早显示了"请确认实际出境"。当时本机负载约 25–30，日本相关代码与 main 相同（本分支对共用组件只改了 `site-shell.tsx` 的德国路径）。单独重跑该项 `--repeat-each=3`，3 项通过；随后整组重跑，21 项全部通过（含德国 2 项）。跑完已删除 `apps/e2e/test-results`。
- 视觉检查：用 `apps/e2e/serve.ts` 起导出站，Playwright 在 1280px 与 375px（2 倍像素）下截图。政策页中英文标题分别为"德国政策依据""Policy basis for Germany"；`retirementAge`（年份 1947、1964 不分组）、`blueCardStandardPay`（2024–2026，€45,300 等）、`settlementFees`（€113 等，比例 50%）、`citizenshipFullTime`（20 个月／24 个月）均为带列名的表；两种宽度下 `scrollWidth - innerWidth` 为 0。分享结果页（截图时界面为英文）的日期标签为"Projected date the assessed requirements are met"，检查项标题后显示"· Requirement""· Fee budget"等分组，待定项显示"Pending details"，页面无横向滚动；中文文案由单测断言。

### 3. 没做或没验证的

- 未 push，未开 PR。
- 只在 desktop 项目跑了 brief 指定的四个 e2e 文件；mobile 项目与其他国家 e2e 未跑。
- 分享不覆盖草稿的 e2e 用的是另一个浏览器上下文（与发送方不共享本机存储）。同一上下文多标签页互不覆盖的行为由共用组件提供，德国未单独做双标签页 e2e，依赖日本 e2e 已有的双标签页覆盖。
- 德国结果页没有像澳大利亚那样加 `resultNotes` 时点说明，brief 未要求；日期标签本身已说明含义。

### 4. 发现与建议

- 上一节记下的问题仍在：进行中的德国草稿只要有一个格式错误，`decodeGermanyDraft` 返回 `undefined`，问卷回到空白草稿。澳大利亚在本国模块里修了同类问题（review93-1 风险 2），德国可照做，不在本次范围。
- `site-shell.tsx` 的场景路径仍按国家逐个列出（日本、澳大利亚、德国）。既然 `CountryModule` 已有 `scenarioLinks`，可以在 `site-countries.ts` 的国家登记里加一个轻量标记，由 `site-shell.tsx` 读取（不必把各国模块引入页头），新国家就不必再改共用组件；brief 要求只加本国路径，这里没动。

## 审核修正（review100-2）

修正者：Claude Opus 5.5。第二轮审核（独立 Claude 审核者，只读）列出问题 1 项、风险 4 项、建议 4 项；brief 要求处理问题 1、风险 1–4、建议 1–3。每项先写回归测试，确认在修正前的源文件上失败后再改。

### 1. 做了什么

| commit | PROGRESS | 审核编号 | 内容 |
|---|---|---|---|
| `2832abf7` Fix: 德国 R00 填了逐份文书时 DE-C63-time 只作基线说明，不进"还差什么" | 820 | 问题 1、建议 3 | 见下 |
| `45622e62` Fix: 德国对比页假设没有出境时最早一段离欧区间保持不变 | 821 | 风险 1、建议 3 | 见下 |
| `b4589b9f` Fix: 德国逐份文书存续核查不再提供"确认无此项记录" | 822 | 风险 2 | 见下 |
| `ed47e4c6` Fix: 德国对比页改晚日期时缴费与蓝卡月数按结果页口径推算 | 823 | 风险 3 | 见下 |
| `835e1595` Fix: 德国进行中的草稿有未改正的格式错误时重开问卷保留内容 | 824 | 风险 4 | 见下 |
| `d0329c28` Fix: 德国同名字段与 § 9b 期间选项按问题使用各自文案 | 825 | 建议 1、2 | 见下 |
| 本节 Docs commit | 826 | — | 本报告 |

- **问题 1**：引擎在 R00 有逐份文书时（`germany-full.ts` 的 `detailedTravel`：`route === 'R00' && req.mobility?.titles !== undefined`）只按各文书存续定状态，通用出境期限只是基线说明。页面模块的 `run` 在同一条件下把 R00 的 `DE-C63-time` 标为 `information`（办理提示），不进"还差什么"；没有逐份文书时仍为 `time`。页面用 `activeGermanyAnswers` 送出的 `mobility.titles` 判断：问卷的许可行没有 `noOtherLossEvent`、`trips` 字段，引擎的 `matchDocuments` 不会从许可记录生成文书，两边条件一致。审核复现：外管局批准延至 2025-10-01、按期返回时 `DE-R00` 为 `MET`，缺口为空；文书有效期留空时 `DE-R00` 为 `UNKNOWN`，缺口只剩 `DE-C63-skilled`；去掉逐份文书后 `DE-R00` 为 `NOT_MET`，`DE-C63-time` 仍是时间条件并列在缺口里。
- **风险 1**：`withoutAbsences` 只让离欧区间沿用前一段居留类别，不再在没有前一段时借用后一段。审核复现（最早 8 个月尚未到欧盟）勾"假设没有出境"后各段仍为 `outside-eu`、`other-eu-blue`、`german-blue`，`DE-R06` 与 `DE-C28` 仍为 `NOT_MET`。旋钮说明补上"最早一段离欧区间前面没有居留类别，保持不变"。
- **风险 2**：按引擎口径核对：`titles: []` 时 `matchDocuments` 没有可核对的文书，`retainedTitle` 对空集合返回否，依赖许可的路径 `DE-C63-current` 都是 `NOT_MET`（审核复现中 `DE-R02` 由 `UNKNOWN` 变 `NOT_MET`）；`titles` 未填时为 `UNKNOWN`。引擎这样读是对的（确认不持有任何文书），问题在问卷：用户很可能把按钮理解为"没有需要额外核查的事项"。字段定义加 `noEmptyAnswer`，"逐份文书存续核查"一节不再显示"确认无此项记录"；旧草稿里已确认为空的仍显示"已确认为无记录"和"恢复为待确认"。说明文字补："留空时，「本路径所依赖的许可仍有效」通常为待确认（蓝卡定居另看决定日是否持有蓝卡）；要得到确定结论，请为当前许可填写一份。"文书下的出境记录等其他列表照旧可以确认无记录。
- **风险 3**：引擎预测时，缴费月数按"截至模拟日的数字，之后每月都缴费"推算，蓝卡月数只在持有蓝卡期间增加、蓝卡晚于模拟日开始的从其生效日起算（`germany.ts` 的 `countedBy`：`addMonths(from, need - entered)`）。对比页的 `apply` 在日期改晚时按同一口径给旋钮值加上满月数：缴费从原模拟日起算；蓝卡从原模拟日与"新日期所在连续蓝卡段的起点"中较晚者起算，新日期不在蓝卡上时不加（连续段按许可行判断，到期未续且与下一张有空档即断开）；有逐段就业记录时不改，由引擎按记录计算。月数用引擎的 `addMonths` 逐月数，与预测的到期判断一致。审核复现 R01（缴费 50 个月）结果页 `FUTURE` 2027-09-23，对比页改到 2027-09-23 得 `MET`，前一天为 `FUTURE` 且 `DE-C05` 仍 `NOT_MET`；R03（已填 15 个月，样例德语为 B1 档）改到 2027-05-23 时 `DE-C19-months` 满足、前一天不满足；2027-01-10 才开始的蓝卡从该日起算，2028-10-10 满足。按原日期确认的「有效期覆盖模拟日」、§ 81 续期效力和决定日持有蓝卡仍按第一轮风险 1 的处理改为待确认（不沿用到新日期），日期旋钮旁的说明改为同时写明月数口径和这一点："依赖它们的路径显示待确认，而结果页的预计日期沿用这些确认；要按新日期核对，请回到问卷改模拟日期并重新确认。"
- **风险 4**：照澳大利亚第一轮在本国模块的做法（`checkAustraliaStep` 的 `submitting`）：`checkFields` 与 `checkStep` 对类型不符（非数字、非字符串、非列表、选项不在列表内等）照旧拒收；负数与非整数、知识题数超过 33、未写完的年月（如 `'2023-0'`）、日期先后颠倒和晚于模拟日的已发生事项只在点"下一步"（`validateGermanyStep`）时报告。进行中的草稿因此能通过 `decodeGermanyDraft`，问卷保留所填内容、停在保存时所在的步骤（审核复现中即出错的步骤），点"下一步"时在原控件报错；最后一步提交时照旧逐步复核全部步骤。已完成的结果与分享仍须通过全部校验，分享链接的更正模式回到出错步骤。
- **建议 1**：用 `labelled` 分开同名字段：R03 的 `applicationOn` 为"本次蓝卡申请（首发或续签）的递交日期（用于核对应届毕业生低薪资档）"，入籍的为"入籍申请递交日期"；R18 重大原因离德的 `months` 为"该次离德月数"，刑事记录的为"各项自由刑判决的刑期合计（月）"（引擎 `custody.months` 为合计刑期，按 `citizenshipConvictions` 参数折算，来源 StAG § 12a Abs. 1、SRC-106 Nr. 12a.1.3–4）。中英文都改。
- **建议 2**：R06 § 9b 期间的 `research`、`study`、`protection` 用 `worded` 改为"其他欧盟成员国签发的研究目的／学习目的居留许可期间""在其他欧盟成员国享有国际保护身份的期间"，分别引 § 9b Abs. 2 Satz 1 Nr. 2 Buchst. b、c（学习注明按一半计入，Satz 2）、d，措辞据本地存档 `policy-sources/2026-11-22-de-aufenthg-full.html` 中 § 9b Abs. 2 原文。核对原文时发现 `higher-employment` 引的"§ 9b Abs. 2 Nr. 1"有误（Nr. 1 是其他成员国签发的蓝卡），更正为 Satz 1 Nr. 2 Buchst. a；该选项只在这一处使用。
- **建议 3**：问题 1 与风险 1 的回归见上；其余每项也各有回归。

### 2. 怎么验证的

- 回归先失败后通过：每项回归都在对应修正前的源文件上运行过并失败——问题 1 断言 `DE-C63-time` 为 `information` 时实际为 `time`；风险 1 最早一段被改成 `other-eu-blue`；风险 2 未填时"确认无此项记录"有 3 个（应为 2 个，不含逐份文书一节）；风险 3 对比页改到 2027-09-23 时 R01 为 `NOT_MET`；风险 4 `decodeGermanyDraft` 返回 `undefined`；建议 1–2 的回归在提交前用 `git stash` 暂时退回两个源文件重跑，蓝卡申请日标签仍为"本次申请日期"。修正后均通过。
- 回放第一轮回归：`cd apps/web && npx vitest run test/germany.test.tsx`，31 项通过（原 25 项 + 本轮 6 项），其中包括标注 review100-1 的 10 项回归（问题 1–9、风险 1、4、5、建议 2）和合入 main 后的共用选项回归，这些测试本轮未改动，全部通过；第一轮风险 3 的缓存版本由 `about-page.test.tsx` 覆盖，在完整验收中通过。
- 完整验收：`(export VITEST_MAX_WORKERS=2; pnpm lint && pnpm typecheck && pnpm test && pnpm build)` 在全部修正提交后串行跑完，退出码 0：error-report 2、policy-data 23、engine 6,006（跳过 1）、game 1,348、web 883 项通过（46 个文件）；构建生成 40 个静态页面，`apps/web/out/germany.html` 与 `apps/web/out/germany/{policy,result,simulate,whatif}.html` 均存在。
- 浏览器 e2e：确认 4464 端口空闲后，`cd apps/e2e && E2E_PORT=4464 npx playwright test tests/germany.spec.ts --project=desktop --reporter=line`，2 项通过，退出码 0（含第一轮补的出境记录确认无／撤销、逐份文书下出境添加删除、对比页日期与入籍生计旋钮、375px 嵌套记录不横向滚动，以及分享链接不覆盖本机草稿）。跑完已删除 `apps/e2e/test-results`。
- 视觉检查：用 `apps/e2e/serve.ts` 在 4465 端口起导出站，Playwright 在 375px 与 1280px（2 倍像素）下截图第 1 步"逐份文书存续核查"一节（未填时只有"添加"按钮，说明文字含留空的后果）和对比页日期旋钮及说明；两种宽度下 `scrollWidth - innerWidth` 均为 0，文字无溢出或错位。截图后已停掉服务。

### 3. 没做或没验证的

- 建议 4 未做（brief 只要求建议 1–3）：R00 有逐份文书时，`DE-C63-time` 的说明文字仍由引擎给出，仍写"所持许可在期限届满后失效……回德须重新取得许可"。页面改为办理提示后它不进缺口，但在"为什么"里仍显示在"未满足"组下（带"办理提示"标注）。改说明属规则文案，需附 SRC 定位，留给规则任务。
- 对比页改日期时，按原日期确认的事项（有效期覆盖模拟日、§ 81 续期效力、决定日持有蓝卡）仍改为待确认，没有沿用到新日期；依赖它们的路径（如审核复现中文书有效期勾"覆盖模拟日"的 R01、R02，以及未填逐份文书、靠"决定日持有蓝卡"的 R03）在结果页的预计日期仍显示待确认，旋钮旁已写明。
- 月数推算只在日期改晚时做；改早时月数保持问卷中的数字（原有行为，未改）。月数按整月计，在两个整月之间改日期时，对比页新推算的日期可能比结果页晚不到一个月（偏保守）；改到结果页的预计日期本身时结论一致。蓝卡连续段只按许可行判断，没有复现引擎按导致失效的出境断开连续段的逻辑。
- 第 0 步把模拟日期清空后刷新，草稿仍会丢失（顶层要求 `simulationDate` 为字符串），属于"未填"而非格式错误，未改。
- 未 push，未开 PR；e2e 只跑了 desktop 项目的 `germany.spec.ts`。

### 4. 发现与建议

- PROGRESS 编号冲突：本轮第一行 820 提交（`2832abf7`）后，任务 111 的分支（`fable/111-jp-game`，`3534f0bb`）也提交了 820。合并时需要其中一方改号；本分支 820–826 都在提交前核对过当时各 worktree 与远端分支未被占用。
- 字段 `de.field.applicationOn`、`de.field.months` 两个通用文案现在不再显示（类型上仍需要这两个键作为字段名），以后新增同名字段时应直接用 `labelled` 指定文案。
- 对比页改早日期时月数不减，可能比实际偏多（偏乐观）；可按同一"每月缴费"口径倒减，或在旋钮旁说明，未做。
