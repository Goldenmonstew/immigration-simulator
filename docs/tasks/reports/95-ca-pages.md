# 任务 95 · 加拿大完整版页面

## 1. 做了什么（按 commit）

| 进度 | commit message | 文件 |
|---|---|---|
| 574 | `Feat: 接入加拿大完整版问卷、结果、对比与政策页` | `app/canada/{canada-content.tsx,simulate/{page,fields}.tsx,result/page.tsx,whatif/{page,controls}.tsx,policy/page.tsx}`，`lib/canada-{fields,draft,module,policy,whatif}.ts`，删除旧 `lib/canada.ts`，`i18n/countries/canada{,-form}.ts`（`hub.ca.*` 从 `i18n/{zh-CN,en}.ts` 移入），`lib/site-countries.ts`，`public/sw.js`，`test/{canada,about-page}.test.tsx`。 |
| 575 | `Test: 验证加拿大问卷、分享、对比与手机英文流程` | `apps/e2e/tests/canada.spec.ts` |
| 576 | `Docs: 任务 95 报告` | 本报告 |

网页文件均相对 `apps/web/`。每个 commit 带 `PROGRESS.md` 对应行。brief 分配的 570–573 已被任务 85 第八至十一轮审核占用，本任务使用 574–576。

### 结构

照日本试点：`canada-fields.ts` 按引擎请求键声明问卷（步骤 → 分组 → 字段），`canada-draft.ts` 负责草稿、逐步校验与分享解码，`canada-module.ts` 调用 `evaluateCanadaFull` 并只显示用户选择的路径。问卷、结果、对比、政策页分别使用共用的 `QuestionnaireShell`、`ResultPage`、`WhatIfPageContent`、`PolicyPage`。共用组件只有 commit `c7a64514` 改过 `components/policy-page.tsx`（标题按国家读 `<国家>.policy.pageTitle`，与任务 93 相同改动）。

- 草稿：`{ version: 1, step, completed, simulationDate, goals, answers }`，`answers` 按引擎请求键保存（去掉 `simulationDate` 与 `locale`）。评估、逐步校验与分享只取可见步骤、可见分组和已选路径的答案（`activeCanadaAnswers`），本机草稿保留隐藏答案；PNP 持股比例按百分数保存，送入引擎时换算为小数。存储键 `ca-immigration-draft-v1`、`ca-immigration-scenarios-v1`；分享为 `/canada/result#s=…`，信封 `{country:"ca", v:1, draft}`。
- 解码按问卷声明逐项核对类型：未知键丢弃，类型、枚举、路径键不对或已完成草稿未通过可见步骤的校验，整个草稿作废。
- 留空即“未答”：引擎据此给出 `UNKNOWN`，结果列为待确认。清单区分未答（不填）、确认没有（“确认没有记录”，存 `[]`）和逐行填写。只有模拟日期、至少一条路径，以及填写某组或某行时引擎类型要求的项目（如出境的离境与返回日、工作经历的起止日/NOC/TEER、邀请的日期与项目）必填。
- 结果：只列所选路径；引擎的 `advisory` 条件（实地天数基线、PR card、PRTD、费用、宣誓、魁省甄选费等）标为“办理提示”，不进入“还差什么”。居住义务与普通入籍的时间基线与路径结论不同时（例如其他条件待确认），另显示“时间条件”，基线推算出未来日期时再显示“仅按时间条件推算的日期”；路径已满足或不适用时都不显示。只有这两条路径显示“最早可申请日期（推算）”行。条件说明直接用引擎文本，不在前面重复条件标题。
- 政策页：规则集 `ca.current-law-2026-11`，10 条路径、80 项条件（CA-R01–R80，标题、来源与 PD 编号由引擎各分支的实际输出汇总）、`canadaFull2026_11` 全部参数、3 条变更（入籍权利费 2026-03-31、联邦费表 2026-04-30、EE 类别职业清单 2026-11-17），来源清单只有本国引用的 24 项（SRC-074、075、077、078、260–279）。

### 问卷步骤与字段

按所选路径显示步骤；同一人可多选。共同信息只问一次。

| 步骤 | 显示条件 | 字段 |
|---|---|---|
| 1. 日期、路径与身份 | 总是 | 模拟日期、路径（10 条，分“已是永久居民”“申请永久居民”两组）、公民身份、出生日期、成为 PR 的日期、当前 PR 身份、PR 附带条件。 |
| 2. 居住天数与出入境 | 居住义务或普通入籍 | 出境记录（离境、返回）；入籍另问成为 PR 前的临时身份期间与入籍计入/排除期间；居住义务另问计入/排除期间（起止、证据状态）、执法认定（认定日、其后认定合规）和人道裁量。 |
| 3. PR card 与旅行证件 | 居住义务 | PR card：类型、在境内、加拿大地址、首卡资料递交日、照片签名、身份及旧卡材料、无阻碍发卡的执法令、生物识别、缴费。PRTD：在境外、无有效卡、最后在加日期、上诉期限或待决、证明材料、缴费。 |
| 4. 入籍条件 | 普通或未成年人入籍 | 签署日、授予日、父母身份、亲子关系、成人签署、代办人签署、未成年人共同签署、两项豁免；逐税年报税（签署日前计算期间的日历年，签署日不是 1 月 1 日时含签署当年）；语言证明（类型、说、听、豁免）与公民考试（结果、答对题数、次数、豁免）；移除令、安全宣告、返加授权、服刑、国内及境外刑事程序与豁免、战争罪、已确认的定罪/虚报/撤籍日期及三项确认；身份声明、指纹法庭文件、成年后境外连续停留与警证、宣誓与豁免、授予时资格、入籍费用；CAF 服役（情形、确认、对应签署日、年数、服役状态，仅普通入籍）。 |
| 5. 联邦 PR 申请与费用 | 任一初次 PR 路径 | 每条所选路径各一组：收件日、签署、家属申报、变化报告、证件、材料、处理费、付款日、新费表确认、生物识别人数、家庭上限、永久居留权费豁免、IRCC 核定总额、已付金额。 |
| 6. 准入审查与家庭成员 | 任一初次 PR 路径 | 主申请人与每位家庭成员：安全/人权/制裁/有组织犯罪、犯罪结论、已分类犯罪（发生地、最高刑、实判、一般事由、未获救济、康复起算）、公共健康、公共安全、excessive demand 与家庭类别豁免、体检（日期、指示、完成、状态、复用、延期或逾期、有效期延长）、最终清单、境外停留与警证（起止、现居国、签发机关、签发与有效期、各路径请求信进度与补件收件日、缺失、豁免）、未完成警证要求、生物识别。家庭成员另问关系、出生日期、随行、关系破裂、监护权、其他准入、家庭成员及体检审查范围、受抚养子女五项。另问生计安排、虚报认定与起算日、保护与合规。 |
| 7. 省提名 | 省提名 | 类别、base/enhanced、提名状态、定居意图、提名签发/完整申请收件/到期、联邦收件、PR Portal、EE 项目、电子提名；投资六项。选安省 Workforce Priority 时另有四组：EOI/邀请/撤销/雇主与本人递交/雇主门户/证明/身份/意图/申请费；雇主地区、经营年数、场所、工作地、CVOR、两年营收、本地员工、劳动法令、招聘；岗位 NOC、长期、紧急需要、劳资纠纷、主管批准、条件保持、周/年工时、报价/中位/低位/现时薪、家庭持股、股权来源、执照；在安省连续与累计月数、五年工作（NOC、月数）、近期毕业（不适用或院校、毕业日、学历、年数）、学历、学习年数、认定、ECA 日期与撤回、语言（日期、四项成绩、撤销）；自雇医生、CPSO、执照、OHIP。 |
| 8. Express Entry | FSW、CEC、FST，或省提名选 enhanced | profile 日期与更新、邀请（日期、项目、截止日、撤销）、PR 收件日、电子申请、资格保持；轮次（日期、最低分、CRS、两个时间戳、类别、职业类别、近三年各职业经验、军队招募八项、该轮附加要求、其他类别确认）；第一、第二官方语言、法语及建档时的测试（测试、成绩日、撤销、四项等级）；学历与建档时的评估（层级、取得地、ECA 日期、撤回、适用机构）、外国学历积分；工作经历（起止、NOC、TEER、周日至周六工时、职责、报酬、加拿大实体支付、在加、加拿大雇主、远程、临时身份授权、全日制学生、自雇、医生政策、独立执业日）、主要 NOC、FSW 选拔工作年数；适应力七项（含配偶语言）；工作报价十五项、技工证、技工就业要求、在加工作授权；资金豁免、安家资金（人数、申请时与发签时金额、核实、发签阶段）、魁省以外定居。 |
| 9. 魁北克技术移民甄选 | PSTQ | 类别、FEER、定居意图、胜任、不控制雇主、行业、奖学金义务；EOI、邀请、撤销、接受、递交、完整收件、获邀依据、同职业类别、接受时的认可、书面期限、甄选费；伴侣、未成年子女与成年受抚养人人数、加籍子女、合同、资金、MIFI 金额；本人及随行成年人的价值观证明（豁免、签发、请求、课程、线上结果、拒绝、撤销）；本人及伴侣法语（证明类型、日期、撤销、四项）；执业许可、学历九项、六类工作与实习月数；受规管名单、认可状态与日期、卓越人才三项；本人 CSQ 状态与日期、随员 CSQ（整体确认或逐份状态、日期）、联邦收件日。 |
| 10. 大西洋移民项目 | AIP | 联邦收件、省方完整收件、目的省、工作省、安家计划、指定雇主、endorsement（省、签发、到期、撤销）；报价十项；工作经历（同 EE）、当地毕业豁免十项；学历评估、ECA 机构、语言测试；安家资金、在加工作、资金豁免授权。 |
| 11. 配偶、伴侣及子女担保 | 家庭担保 | 关系、魁省、申请类别、递交日、完整收件、PR 日期、TRP 起算、境外/同住/临时身份、无身份公共政策、跨代受抚养人；担保人出生日期与身份、已登记印第安人、在加、返加、重复担保、已递交、曾被担保、连续身份起始、伴侣承诺、十项禁项（含指定罪行定罪五项）；关系真实、婚姻有效、同居起始、视同同居、伴侣起始、障碍、被担保子女七项；联邦承诺与收入（人数、NOA、近十二个月）。担保人住在魁省时另有魁省阶段：资格信、信件与递交日、居住、禁项、监护同意、承诺声明、融入计划、其他被担保人出生日期、MIFI 决定、自身家庭人数、现有及本次新增的担保群组、收入与资产、资源可持续、收件豁免与名额、申请数、额外人数、魁省费用。 |

逐项核对引擎各 `*Answers` 类型的属性名均出现在问卷声明中。唯一没有单独问的是 `federal.principal.dateOfBirth`：引擎在它缺省时使用第 1 步的出生日期，重复询问会出现两个可能冲突的出生日期。

### 对比旋钮

| 旋钮 | 显示条件 | 改动 | 结果页跳转来源 |
|---|---|---|---|
| 模拟日期 | 总是 | `simulationDate` | CA-R03、CA-R08 |
| 再加一次出境（离开、回来） | 居住义务或普通入籍 | 在出境记录末尾追加一趟 | — |
| 入籍语言听说等级 | 普通入籍 | 语言证明改为认可等级，说、听同为该值 | CA-R10 |
| 公民考试结果 | 普通入籍 | `test.outcome` | CA-R11 |
| EE 第一官方语言四项等级 | 显示 EE 步骤时 | `primary.levels` 四项同值 | CA-R34、R41、R44 |
| 该轮 CRS | 已填邀请轮次 | `round.confirmedCrs` | CA-R30 |
| EE 申请时安家资金 | 显示 EE 步骤时 | `funds.availableAtApplication` | CA-R38 |
| AIP 申请时安家资金 | AIP | 同上（大西洋） | CA-R59 |
| 魁省可用资金 | PSTQ | `availableFunds` | CA-R62 |
| 魁省本人法语四项 | PSTQ | `french` 四项同值（未填证明类型时按认可考试） | CA-R64 |
| 担保人 NOA 收入 | 家庭担保 | `federalIncome.eligibleNoaIncome` | CA-R76 |

旋钮只改动离开问卷原值的项目，未动时对比草稿与原草稿相同；清空旋钮即清除对应答案；改动只用于对比和新分享，不覆盖问卷草稿。数值旋钮按对应问题校验（等级为不超过 CLB/NCLC 量表上限的整数，CRS 为整数），通过校验的对比都能分享并重新打开。问卷未填出境记录时不追加单趟，未填邀请轮次时 CRS 位置显示说明。

### 旧入口

旧 `/canada` 是只算时间的单页，输入只在 React 状态里，刷新即清空，也没有分享串或本机存储，所以没有旧链接或旧草稿需要迁移。`/canada` 网址保留并显示新首页，问卷、结果、对比、政策四个子页加入站点注册表，离线清单与 sitemap 随之生成；`sw.js` 缓存版本改为 `2026-11-24-ca`（review95-1 再递增为 `2026-11-24-ca2`）。旧 `lib/canada.ts` 与旧单页删除，引擎里的 `evaluateCanada` 未动（完整版仍用它算时间基线）。

## 2. 怎么验证的

- `export VITEST_MAX_WORKERS=2; pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0：error-report 2、policy-data 23、engine 6,006（1 项既有文案导出用例按默认设置跳过）、game 1,348、web 845 项通过，构建生成 36 个静态页面及路由。之后只改了 `lib/canada-module.ts`（时间基线与结论相同时不重复显示）和对应单测，再跑 `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web test && pnpm --filter web build` 退出码 0（web 845 项）。`pnpm --filter e2e lint`、`typecheck` 通过，`playwright test tests/canada.spec.ts --list` 收集 2 项。`git diff --check` 通过。
- 回读 `apps/web/out/{offline-pages.json,sitemap.xml}`，加拿大五页都在，五个 HTML 均已导出。用 `apps/e2e/serve.ts` 在本地起静态服务，在内置浏览器 375 px 宽度下注入同一居住义务草稿，查看问卷第 2 步、结果、对比和政策页：`scrollWidth - innerWidth` 均为 0；结果显示“最早 2027-06-01 满足条件”、还差什么与 What-if 链接，政策页 80 项条件、24 项来源。
- 开发中运行 `pnpm --filter web exec vitest run test/canada.test.tsx test/country-views.test.tsx test/policy-page.test.tsx test/about-page.test.tsx test/page.test.tsx test/country-scenarios.test.ts test/japan.test.tsx`，7 个文件 153 项通过。加拿大专用 12 项：首页与集合卡片双语渲染；五页在离线清单与 sitemap；问卷全部字段、选项、分组、步骤、路径都有中英文文案；全选路径时 11 步英文渲染无中文残留；逐步校验（路径与日期必填、行内必填与日期先后、组内必填、整数与范围、周工时须填全）；分享编解码往返（含按路径的申请、体检延期、近期毕业“不适用”、四项成绩），以及九类坏草稿被拒；`run` 只列所选路径，2026-11-24 的居住义务示例为 `FUTURE / 2027-06-01`，改到 2027-12-31 为 `MET`，删去人道裁量答案为 `UNKNOWN` 并带 PD-240，已是公民时短路；旋钮未动时草稿不变，加一趟 2026-12-01 至 2027-03-01 的出境后最早日期变为 2027-08-29，语言、资金、收入旋钮写入对应字段，旋钮校验与条件跳转映射；结果页与对比页双语渲染条件、来源链接和 `/canada/whatif?focus=date`；政策页列出 10 条路径、80 项条件、3 条变更，来源清单与模块来源一致且不含英国、日本来源。
- e2e 中的日期与状态均取自上面单测对同一草稿的实际计算。`apps/e2e/tests/canada.spec.ts` 的 eslint 与 `tsc --noEmit` 通过。

## 3. 没做或没验证的

- 按 brief 没有运行 Playwright，两条 e2e 的实际执行与截图基线外的视觉验收由 Fable 进行。上面的内置浏览器检查只看了四页的手机布局，没有逐步点完问卷，也没有跑 Axe。
- e2e 断言政策页 h1 为 “Policy basis for Canada”。最初按 Fable 的约定没有改 `components/policy-page.tsx`；之后 commit `c7a64514` 已改为按国家读标题，这一条断言在本分支即可通过。该改动在 `country.id` 缺省时的标题回退问题见 review95-1 问题 7。
- 没有改规则语义、参数、英国和其他国家页面；没有游戏入口。

## 4. 发现与建议

- `QuestionnaireShell`、`ResultPage`、`readPageResult`、`linkedResultDraft` 中“结果带草稿编辑”“跨标签页刷新”“按设备日期缓存”等逻辑只对日本开启。加拿大走通用路径：从结果页“修改输入”回到本机草稿，不带结果串。十国完成后可统一成模块选项。
- 已持 PR 时，七条初次 PR 路径为 `NOT_APPLICABLE`，但引擎仍附全部条件（均为待确认）。结果页因此会列出这些条件，建议引擎在不适用时省略条件或页面折叠。
- `CA-R08` 在缺少时间基线时说明以空格开头（引擎拼接 `'' + ' ' + …`），显示无影响，可在引擎侧去掉。
- 居住义务路径的日期行沿用共用标签“最早可申请日期（推算）”，对居住义务而言是“最早满足日期”；可在共用组件支持按路径改标签。
- 政策页条件的 PD 编号取自引擎各分支实际输出。（review95-1 已把条件时间基线的 PD-089–091 与费表年度的 PD-258 收进政策页。）

## 审核修正（review95-1）

审核意见：Gemini 4 Neon 只读审核（问题 7 项、风险 5 项、建议 3 项）。每类先写失败的回归测试（均在 `apps/web/test/canada.test.tsx`），确认失败后再修。

### 1. 做了什么（按 commit）

| 进度 | commit message | 对应审核 | 文件 |
|---|---|---|---|
| 578 | `Fix: 加拿大只评估、校验与分享可见路径和分组的答案` | 问题 2、建议 1 | `lib/canada-{draft,module}.ts` |
| 579 | `Fix: 加拿大 PNP 持股比例按引擎小数口径换算` | 问题 1 | `lib/canada-draft.ts` |
| 580 | `Fix: 加拿大问卷必填元组、日期先后与文本输入的校验` | 问题 5、风险 2、风险 5、建议 3（延长日期必填） | `lib/canada-{draft,fields}.ts`、`app/canada/simulate/fields.tsx` |
| 581 | `Fix: 加拿大魁省担保群组与申请类别、报税年份文案` | 问题 3、建议 3（文案） | `i18n/countries/canada{,-form}.ts` |
| 582 | `Fix: 加拿大已满足、不适用或不推算日期的路径不显示时间行与“尚无法确定”` | 问题 4、建议 2 | `lib/canada-module.ts` |
| 583 | `Fix: 加拿大对比旋钮的校验、清空、考试结果、出境与条件跳转` | 问题 6 | `lib/canada-{whatif,fields}.ts`、`app/canada/whatif/controls.tsx`、`i18n/countries/canada.ts` |
| 584 | `Fix: 加拿大政策页条件收齐费表年度与时间基线的待定细节` | 风险 1 | `lib/canada-policy.ts` |
| 585 | `Chore: 加拿大审核修正后递增离线缓存版本` | brief | `public/sw.js`、`test/about-page.test.tsx` |
| 586 | `Docs: 任务 95 审核修正报告（review95-1）` | 建议 3（报告） | 本报告 |

网页文件均相对 `apps/web/`，每个 commit 含 `PROGRESS.md` 对应行，回归测试都在 `test/canada.test.tsx`。

- 问题 1：问卷与分享仍保存用户填写的百分数（标签写“%”），`canadaRequest` 送入引擎时除以 100，与 `pnpInvestment.minEquityShare`（三分之一，SRC-261 IRPR s87(5)–(6)）同口径。边界：1%、33.33% 的 CA-R45 为 `NOT_MET`，33.34%、100% 为 `MET`；分享往返保留百分数。
- 问题 2、建议 1：新增 `activeCanadaAnswers`，按可见步骤、可见分组逐字段复制，按路径键的答案（含警证请求信等嵌套项）只保留已选路径。`canadaRequest`、`validateCanadaStep` 和模块的 `activeAnswers`（分享编码与解码后）都用它；本机草稿仍保留隐藏答案，重新选回路径时还在。回归覆盖审核列出的三种崩溃（魁省分组隐藏后的空行、取消路径后的空出境行、半填安省语言与 EE 邀请）和第 5 步死锁：引擎不再抛错，分享串只含可见答案，取消的 `CA-EE-FSW` 申请不再报 `ca.error.integer`，重新选回后照常报错。
- 问题 3：`sponsoredGroups` 改为“担保群组（现有承诺及本次新增，每组一行）/ Sponsored groups: existing undertakings and this new one (one row each)”。
- 问题 4、建议 2：路径为 `MET` 或 `NOT_APPLICABLE` 时不附时间基线；时间基线只在 `FUTURE` 时给“仅按时间条件推算的日期”。居住义务与普通入籍以外的路径，以及已满足或不适用的路径，设 `travelDate: null`，结果页与对比页都不再显示“最早可申请日期（推算）：尚无法确定”。审核的两个复现（2027-12-31 的 `MET`、`prStatus: 'never'` 的 `NOT_APPLICABLE`）和家庭担保路径在结果页、对比页都没有这三行，对比页显示“与当前情景相同”；`FUTURE` 示例仍显示 2027-06-01。
- 问题 5：元组 `<fieldset>` 带 `id`、`tabIndex={-1}`、`aria-invalid`、`aria-describedby` 和报错段落，提交时 `QuestionnaireShell` 能把焦点移到这一题。全 `null` 元组在校验与分享解码中都按未答处理：必填的四项成绩报 `ca.error.required`，已完成草稿解码作废；未完成草稿与非必填的 `dailyHours` 解码后去掉该项。
- 问题 6：数值旋钮按对应问题校验（三项语言等级为不超过 `maxLevel` 的整数，CRS 为整数），输入框同步 `max`、`step`；回归确认通过校验的对比草稿分享后能解码。旋钮清空即删除对应答案，未动的旋钮保持草稿不变。改公民考试结果时删除旧的答对题数（`finally-failed` → CA-R11 `NOT_MET`，`not-taken` 与清空 → `UNKNOWN`）。问卷未填出境记录时不追加单趟，对比页在原位置提示先补记录（保留 `ca-whatif-trip-from` 焦点目标）。`CA-R31` 不再跳到语言等级；未填邀请轮次时 `ca-whatif-crs` 是一段可聚焦的说明。
- 风险 1：政策页采样分支可带自己的模拟日。`federalFees.nextAdjustment`（含魁省担保）覆盖费表与魁省收入表不再适用时的 PD-258（CA-R27、R28、R80）；2028-02-29 且 PR 早于一个 `prWindowYears` 的分支覆盖滚动窗口与闰日；条件同时收集 `timeBaseline.pendingDetails`，CA-R02 列出 PD-089、PD-091，CA-R08 列出 PD-090、PD-091。
- 风险 2：起止日期检查改为对所有记录统一生效（分组、列表行、分组内字段，两项都在同一组字段里才查）：from/to、from/until、departed/returned、issued/expires，以及提名、警证、主申请人 CSQ 的签发与到期；同一天允许。魁省价值观线上答对题数上限取 `quebecSelection.valuesQuestions`（SRC-273 Values and Online assessment）。
- 风险 5：文本答案（NOC、UTC ISO 时间戳）输入时去除首尾空格，与英国、德国问卷做法一致；ISO 时间与 NOC 内部没有空格。
- 建议 3：申请类别 `family` 改为“家庭类（Family Class）/ Family class”；“已延长至某日”的日期框标 `*` 并设 `required`；报税年份提示写明签署日不是 1 月 1 日时也列出签署当年；本报告第 15、75 行按 `c7a64514` 已改 `components/policy-page.tsx` 更新，并同步问卷说明、旋钮表与旧入口里的版本号。

### 2. 怎么验证的

- 每类改动先写回归测试，确认按审核描述失败（例如引擎抛出 `TypeError: Cannot read properties of undefined (reading 'split')`、持股 1 被当作 `1 >= 1/3`、`MET` 仍带 `timeStatus`、改考试结果后仍保留旧的答对题数、CA-R27 的待定细节为空），修后通过。每个 commit 前运行 `pnpm --filter web typecheck`、改动文件的 eslint 与 prettier，以及 `pnpm --filter web exec vitest run test/canada.test.tsx`（最终 26 项通过，原 12 项加新增 14 项）。
- 最后完整验收：`export VITEST_MAX_WORKERS=2; pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0：error-report 2、policy-data 23、engine 6,006（1 项既有用例跳过）、game 1,348、web 859 项通过，构建生成 36 个静态页面。
- `cd apps/e2e && E2E_PORT=4435 npx playwright test tests/canada.spec.ts --project=desktop --reporter=line`：2 项通过（7.9 s），跑完删除 `apps/e2e/test-results`。现有 e2e 的日期与状态（2027-06-01、2027-08-29、2027-12-31 为 `MET`）不受本轮修改影响，没有新增 e2e 断言。
- `git diff --check` 通过。

### 3. 没做或没验证的

- 问题 7（`PolicyPage` 在 `country.id` 缺省时标题回退为空）：只能改共用组件 `components/policy-page.tsx`，待任务 93 的共用修正合入后解决。
- 风险 3（加拿大分享打开覆盖本机草稿、跨标签页读到别的情景）：属共用的 `share.ts`、`page-result.ts`、`result-page.tsx` 逻辑，待任务 93 的共用修正合入后解决。本分支只让加拿大模块提供 `activeAnswers`，分享串已不含隐藏答案。
- 建议 2 的另一半（结果说明里 `CAD 144390` 等金额加千分位）：brief 对建议 2 只要求日期行，没有做；见“发现与建议”。
- 没有在浏览器里逐屏做视觉检查；对比页新增的两段说明与必填元组的报错只在单测里核对了标记与文案。
- 没有改规则语义、参数、其他国家页面与共用组件。

### 4. 发现与建议

- 风险 4（任务 85 规则引擎遗留）：分支免除项（未成年人入籍的 CA-R08–R11、非魁省担保的 CA-R77–R80、非 18–54 岁的语言与考试）输出 `MET`（说明“此分支免除此项”）而未标 `applicable: false`，结果页归入“已满足”；已持 PR 时初次 PR 路径为 `NOT_APPLICABLE`，引擎仍附全部待确认条件；CA-R36 对 FSW 获邀后因生日从 67 分降至 66 分的公共政策豁免仍返回 `NOT_MET`（同 `85-ca-rules.md` 既留风险）。需在引擎侧处理。
- 结果说明里的加拿大元金额没有千分位（如 `CAD 144390`、`1000000 CAD`）。引擎文本中金额写法不一（`CAD x`、`x CAD`、斜杠分隔的营收/人数），若要格式化，建议引擎输出时直接本地化，或参照日本按条件写替换规则。
- 持股比例按百分数填写，恰好三分之一无法精确输入（33.33% 判未满足，需填 33.34% 或以上）。可考虑在该题加提示，或改为“是否至少三分之一”的选择题。
- 魁省担保群组列表仍提供“确认没有记录”，但新担保至少有本次新增一组；可考虑对该列表隐藏这个按钮。
- 日期先后检查只覆盖期间与证件效期；`signingDate`/`grantDate`、`eoi`/`invited` 等流程先后没有检查。
- `travelDate: null` 借用了“旅行日期”字段来隐藏日期行；任务 93 若提供按路径的日期标签或隐藏选项，可改用它。居住义务 `NOT_MET` 时仍显示“最早可申请日期：尚无法确定”。
