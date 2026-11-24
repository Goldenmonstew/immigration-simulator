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
