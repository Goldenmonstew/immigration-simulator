# 任务 114 · 马来西亚完整版页面

## 1. 做了什么（按 commit）

| PROGRESS | commit message | 文件 |
|---|---|---|
| 960 | `Feat: 接入马来西亚十五条路径的完整版问卷、结果、对比与政策页` | `apps/web/lib/malaysia-{fields,draft,module,whatif,policy}.ts`，`apps/web/app/malaysia/{page.tsx,malaysia-content.tsx,simulate/,result/,whatif/,policy/}`，`apps/web/i18n/countries/malaysia{,-form}.ts`，`apps/web/i18n/{zh-CN,en}.ts`，`apps/web/lib/site-countries.ts`，`apps/web/components/site-shell.tsx`，`apps/web/public/sw.js`，`apps/web/test/{malaysia,about-page}.test.tsx` |
| 961 | `Test: 验证马来西亚双语问卷、分享、对比与政策页 e2e` | `apps/e2e/tests/malaysia.spec.ts` |
| 962 | `Docs: 任务 114 马来西亚完整版页面报告` | 本报告 |

各 commit 含 `PROGRESS.md` 对应行，尾注 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`。没有改引擎和参数；共用组件只在 `site-shell.tsx` 的场景国家名单加了 `my`。

### 结构

照葡萄牙页面：`malaysia-fields.ts` 定义路径、七个步骤、各步分组与字段；`malaysia-draft.ts` 负责草稿（`version: 1`）、可见步骤、校验、解码、"只取仍显示的答案"和草稿到 `MyFullRequest` 的转换；`malaysia-module.ts` 实现 `CountryModule`，`run` 调用 `evaluateMalaysiaFull`，只评估所选路径（请求带 `pathways`）。

- 注册：`site-countries.ts` 登记 `{ id: 'my', slug: 'malaysia', hasGame: false }`，`pagesByCountry.my` 为五页，离线清单与 sitemap 由此生成。集合入口卡片文案 `hub.my.*` 在 `i18n/countries/malaysia.ts`；`hub.intro` 等全站文案未改。
- 存储与分享沿用框架：`my-immigration-draft-v1`、`my-immigration-scenarios-v1`，`/malaysia/result#s=…`，信封 `{country:"my", v:1, draft}`。`scenarioLinks: true`，结果、修改、对比之间带场景片段，打开分享链接不覆盖本机草稿；`site-shell.tsx` 的场景国家名单加 `my`。没有信封的裸对象和别国信封一律拒收。
- 字段除了按同一记录里另一答案显示（`when`），还按路径显示（`for`：只在读取它的路径被选中时出现）。一步里没有任何字段被所选路径读取时，整步不显示。隐藏的答案不参与评估、校验和分享；改答案时清掉随之隐藏（`when`）的子答案，其他路径的答案保留到路径重新选回。
- 名单（准证、出境记录）区分未答与确认没有：新草稿为未答；"没有记录"按钮才产生 `[]`；删除最后一行回到未答。显示时两者都必填（加记录或点"没有记录"）。
- 日期先后、负数、整数、"不得晚于模拟日期"只在提交该步时校验；解码只核对类型与选项（国籍须为列表中的 ISO 代码或 `stateless`）。进行中的草稿有这类错误时重开问卷原样保留、停在原步骤，不覆盖本机存储；已完成的结果有错时退回出错步骤。
- 只有模拟日期、至少一条路径、准证与出境名单（显示时）、各行的种类与起止日、"曾被拒"答是时的拒绝日、"持有永久居留"答是时的签发日为必填，其余留空即在结果里显示为待确认，不当作确定值送进引擎。
- 不问 `applicationDate`：模拟日期即递交日（与葡萄牙相同），对比页改日期时两者一起变。

### 问卷步骤与字段

字段 id 为 `my-` 加记录路径与字段名，例如 `my-family-tie`、`my-passes-0-kind`、`my-citizenship-permanentResidentSince`。路径简称：PR 为永久居留五类（妻、夫、子女、WAS、REP），CIT 为公民身份三类，RP 为 Residence Pass。

| 步骤 | 字段（括号内为读取它、使其显示的路径） |
|---|---|
| 1. 日期、国籍与路径 | 模拟日期（递交日，必填）；国籍（ISO 3166-1 代码下拉，按页面语言显示国名，另有"无国籍"，不含马来西亚；WAS、REP、LTSVP、DE Rantau）；出生日期（不得晚于模拟日期；PR 子女、REP、RP、三类公民身份、MM2H、DE Rantau）；护照到期日（PR 五类、RP、DE Rantau）；十五条路径分三组多选：永久居留、公民身份、长期准证。国籍与出生日期按路径显示是 review114-1 建议 2 的修正 |
| 2. 准证与出境记录 | 准证名单：种类（12 种）、开始日、最后有效日（PR 妻、夫、子女、WAS，RP，归化，公民之妻登记，RP-T）；出境名单：离开、回来、原因（归化、公民之妻登记） |
| 3. 家庭关系与担保人 | 与 REP 参与者的关系（REP）；与公民或永久居民的关系（PR 妻、夫、子女、WAS，RP、公民之妻、子女登记、公民配偶 LTSVP）；关系为配偶时：结婚日期（PR 妻、夫）、婚姻登记（PR 妻、夫、公民之妻登记、LTSVP）、是否已分居、是否已离婚（PR 妻、夫、RP、公民之妻登记、LTSVP）；关系为子女时：亲子关系（PR 子女、RP）。REP 关系为妻或夫时另显示结婚日期、是否已分居、是否已离婚，为子女时另显示亲子关系，不看上一题（review114-1 问题 1）。担保人：公民配偶或父母担保并到场（PR 妻、夫、子女、LTSVP）、Residence Pass 担保人（RP） |
| 4. 记录、证明与语言 | 移民记录（PR 五类）、刑事判决（PR 五类、归化、公民之妻登记）——都可留空；曾被拒绝永久居留申请及被拒决定日期（PR 妻、夫、子女、WAS）；公民推荐人人数（PR 妻、夫、WAS）；本人收入、担保人收入、马来西亚纳税记录（PR 四类、LTSVP）；马来语自评（PR 四类、归化）、英语自评（PR 四类） |
| 5. 永久居留类别条件 | WAS：监管机构认可、关键职业、公民担保人；REP：参与者已获 SATK、批准信有效期、递交 REP 前已结婚（配偶时）、参与者担保、推荐人人数 |
| 6. 公民身份 | 持有永久居留及 MyPR 上的签发日（归化、公民之妻登记）；永久居住意向（同上）；符合条件的推荐人人数（归化）；愿意宣誓并放弃原国籍（三类）；能交齐护照、有所得税或 BE 表、默迪卡日在联邦（归化） |
| 7. 长期准证条件 | MM2H：类别、外交关系、持牌业者、定存、住宅价值、每年在马天数、良民证、健康保险、受养人人数、需要工作；薪资：基本月薪（RP-T、就业准证）；RP-T：已纳税年数、学历或专业资格、总工作经验；DE Rantau：人才类别、年收入、工作方式、雇主在马注册（远程雇员）、境外客户（自由职业者）、合同开始日、受养人人数 |

PVIP 不读取任何答案（`my.pass.pvip-terms` 恒为待确认），只选 PVIP 时问卷只有第 1 步。

### 对规则报告"给页面任务的问题"的默认处理

| 规则报告的问题或建议 | 本任务的处理 |
|---|---|
| 问题 1：A1752 生效后是否另列一栏 | 不在本 brief 范围，未做。结果中 `my.cit.constitution-amendment` 照引擎说明；政策页变更记录列"2025 年宪法修正案刊宪（尚未生效）"。 |
| 问题 2：先问目标还是列出 15 条路径 | 第 1 步按"永久居留 / 公民身份 / 长期准证"三组列出 15 条路径，可多选；之后只显示所选路径读取的步骤与字段。 |
| 问题 3：国籍用 ISO 代码下拉 | 采用。选项为 CLDR 地区代码（`lib/countries.ts`）去掉 `MY`，加"无国籍"；国名用 `Intl.DisplayNames` 按页面语言显示；解码时不在列表里的代码视为无效草稿。 |
| 问题 4：敏感问题是否保留 | 保留为可留空的单选，提示"可留空，留空时结果显示待确认；不收集名单或案件细节"。留空不送引擎。 |
| 问题 5：官方说法不一的费用 | 引擎说明已写明冲突：`my.pr.fee`（REP 指南"每年 RM120"与一般指南一次性写法不同，PD-404）、`my.pass.security-bond`（移民局表与 MDEC 表冲突，PD-411）。页面原样显示说明并以徽标显示 PD，单测核对这两处说明含冲突内容。`my.pass.term`（PD-422）、`my.pass.fee`（PD-425、PD-427）是"原文未写"，说明照引擎。 |
| 分居与离婚 | 分开问两题，原样送引擎的 `family.separated`、`family.divorced`（review114-1 风险 2 后引擎改收两个字段，见审核修正一节）。 |
| 永久居留日期 | 先问是否持有 Permit Masuk，答"是"再问"MyPR 上的签发日"，提示不是批准信日期。答"否"送 `null`，答"是"未填日期为必填错误。 |
| 担保人按路径分开问 | 四处分开：`citizenSponsor`（PR 妻、夫、子女、LTSVP，"所称的公民配偶或父母"）、`was.citizenSponsor`、`rep.participantSponsor`、`residencePassSponsor`，各在读取它的路径下显示。 |
| 此前被拒日期 | 问"是否曾被拒"（否送 `null`）与决定日期（是时必填、不得晚于模拟日期）。按"留空显示待确认"的约定，整题可留空，未设为必答。 |
| 满足时的日期写成"自某日起满足" | 年限状态为满足且日期早于模拟日期时，摘要后加"按已录入资料，年限条件自某日起满足。"，结果页与对比页另有一条说明讲清两种日期含义（见下"日期标签"）。 |

### 检查项分组

引擎给出 `requirement`、`factor`、`information` 三类，`information` 不决定路径状态。模块的 `run` 在此基础上细分，只有申请条件与时间条件进"还差什么"：

| kind | 条件 |
|---|---|
| `budget` 费用预算 | 引擎为 `information` 的 `my.pr.fee`、`my.pr.deposit`、`my.pr.rep-ltsvp-fee`、`my.rp.fee`、`my.cit.application-fee`、`my.cit.certificate-fee`、`my.pass.fee`、`my.pass.fees`、`my.pass.security-bond`、`my.pass.participation-fee`、`my.pass.pass-fees`、`my.pass.annual-fee`、`my.pass.system-fee` |
| `afterApproval` 批准后事项 | `my.pr.after-approval`、`my.cit.after-grant`、`my.rp.rights`、`my.pass.duration`、`my.pass.work`、`my.pass.term`、`my.pass.benefits`、`my.pass.terms` |
| `information` 办理提示 | 其余引擎为 `information` 的条件（受理时间、有效地区、健康、特殊情形、修正案、与永久居留的关系等），以及不适用的条件 |
| `time` 时间条件 | 引擎为 `requirement` 的 `my.pr.marriage-duration`、`my.pr.spouse-pass`、`my.pr.qualifying-pass`、`my.rp.long-term-pass`、`my.cit.residence`、`my.pass.work-years` |
| `factor` 审查因素 | 引擎原样 |
| `requirement` 申请条件 | 其余 |

说明中 4 位以上的 RM、USD 金额按语言加千分位（RM1500 → RM1,500）；中文摘要去掉引擎在句号后加的空格。引擎说明没有原样重复条件标题的通用句，页面不改写说明。

### 日期标签

马来西亚引擎只在路径状态为"满足"时给 `earliestDate`，值是模拟日期（递交日）；年限另给 `timeStatus`、`timeEarliestDate`，满足时取当前连续满足段的起点，尚未满足时为最早满足日。

- `earliestLabel` 按路径：年限日期是"自某日起满足"的七条路径（PR 五类、RP、RP-T）用本国标签"满足所评估条件的申请日"／"Application date on which the assessed requirements are met"；其余八条（三类公民身份、LTSVP、MM2H、PVIP、DE Rantau、就业准证）用共用的"最早可申请日期（推算）"。三类公民身份在年限满足时给出的就是申请日（引擎从申请日起找第一个满足日），不属"自某日起"（review114-1 问题 3 修正：初版把归化与公民之妻登记也算作"自某日起"）。REP 路径的日期标签保留本国标签：配偶的年限日期是起点，子女的年限日期是申请日，两种情况下该标签所指的满足日都是申请日（review114-2 问题 2）。
- `resultNotes` 在结果页与对比页加一条说明：条件按模拟日期核对；年限已满足时，永久居留之妻、之夫、子女与完全外国人类、REP 配偶、Residence Pass 与 RP-T 的"仅按时间条件推算的日期"是当前连续满足的起点，REP 子女与三类公民身份显示模拟日期本身；未满足时是最早满足日；永久居留与公民身份仍由主管机关裁量（review114-2 问题 2 改正：此前把 REP 子女归入"起点"一组）。

### 对比旋钮

改动只作用于草稿副本；未改动的旋钮不改写基线，全部未动时各路径显示"与当前情景相同"。任何旋钮都不改路径、家庭关系、出生日期与国籍（单测逐个旋钮核对）。

| 旋钮 | 控件 id | 改写 | 显示条件 | 关联条件 |
|---|---|---|---|---|
| 模拟日期（递交日） | `my-whatif-date` | `simulationDate` | 总是 | 结婚年数、配偶准证、合资格准证、各类年龄、护照效期、被拒等待期、REP 批准信、RP 长期准证、RP-T 工作年数与就业准证剩余效期 |
| 假设没有出境记录 | `my-whatif-trips` | `trips` 改为 `[]` | 问卷有出境名单时 | — |
| 假设 MyPR 签发日 | `my-whatif-pr-since` | `citizenship.permanentResidentSince`，填日期时 `prHeld` 改为是；留空则按问卷所填（review114-1 问题 2） | 选了归化或公民之妻登记 | `my.cit.residence`（review114-1 建议 3，初版链到日期） |
| 基本月薪（马币） | `my-whatif-salary` | `work.basicMonthlySalaryRm` | 选了 RP-T 或就业准证 | `my.pass.salary`、`my.pass.salary-category` |
| DE Rantau 年收入（美元） | `my-whatif-de-rantau-income` | `deRantau.annualIncomeUsd` | 选了 DE Rantau | `my.pass.income` |
| MM2H 定期存款（美元） | `my-whatif-mm2h-deposit` | `mm2h.fixedDepositUsd` | 选了 MM2H | `my.pass.fixed-deposit` |

日期旋钮的提示写明：年龄、准证、居住与护照效期按新日期重算；已纳税年数、工作经验年数与每年在马天数按问卷所填，不随日期推进。改日期后仍按问卷各可见步骤校验（例如早于出生日期时报错、不生成分享链接）。

### 政策页

- 规则集 `my.current-law-2026-11`，标题"马来西亚现行规则"，页面标题 `my.policy.pageTitle`（"马来西亚政策依据"／"Policy basis for Malaysia"）；15 条路径、92 个条件、40 个参数、4 条变更（就业准证薪资门槛修订、DE Rantau 科技类门槛提高、MM2H 系统处理费、2025 年宪法修正案刊宪但未生效，金额与日期取自参数）、28 项来源（SRC-500–510、512–528；SRC-511 无引用，不显示）。
- 条件目录照美国、新西兰的做法在加载时用 7 组答案跑引擎（两种语言）取得标题、来源与 PD；同一条件在不同路径标题不同时列出全部标题（如"公民之妻／公民的子女"）。Node 中约 35–60 ms。单测用 4000 组固定序列的随机答案加两个随机难以命中的边界请求，核对目录与引擎引用逐条件完全一致。
- `displayParameter`：31 个嵌套参数全部换成中英文字段名，金额带 RM 或 USD（与数字之间不断行），比例显示为百分比；押金与担保金按国籍列成"国籍—金额"表（国名按页面语言），就业准证按"类别—修订后—修订前"列表；顶层 `prFeeRm` 显示为 RM 120。

## 2. 怎么验证的

- 完整验收：`(export VITEST_MAX_WORKERS=2; pnpm lint && pnpm typecheck && pnpm test && pnpm build)`，退出码 0。error-report 2、policy-data 23、engine 6,130（1 项既有跳过）、game 1,362、web 1,046 项（49 个文件）通过；构建生成 62/62 个静态页面，含 `/malaysia` 五页，`out/offline-pages.json` 与 sitemap 由注册表生成。
- e2e：先用 `lsof -nP -iTCP:4490 -sTCP:LISTEN` 确认端口空闲，在上面的构建上运行 `cd apps/e2e && E2E_PORT=4490 npx playwright test tests/malaysia.spec.ts tests/australia.spec.ts tests/site.spec.ts --project=desktop --reporter=line`，9 项通过，退出码 0；跑完删除 `apps/e2e/test-results`。完整验收前的一次构建上单独跑 `tests/malaysia.spec.ts` 也是 2 项通过。
  - 中文：首页→集合入口卡片→问卷；未选路径时报错并聚焦路径；加一行准证后删除，名单回到未答；进行中的颠倒出境记录刷新后保留、提交时报先后错误；"没有记录"才显示已确认；永久居留答"否"时签发日消失、改回"是"时为空；结果页归化"未满足条件"、年限最早 2027-03-01、就业准证"已满足条件"、PD-414；axe 无 serious/critical；保存情景、复制分享链接在新上下文还原同样文字；缺口里"去 What-if"聚焦日期控件。
  - 英文 375 宽：各步与结果页无横向滚动；对比页把 MyPR 签发日改为 2016-03-01 后，"Date based on time requirements alone"由 2027-03-01→2027-03-01 变为 2027-03-01→2026-11-25；政策页标题、SRC-500 链接、无 SRC-001、条件 `my.cit.residence` 可展开。
  - e2e 断言的日期、状态、标题、字段 id 都先在单测里算出或渲染核对（"the result page shows the end-to-end scenario…""changing the MyPR date moves…""the questionnaire renders the fields…"）。
- `apps/web/test/malaysia.test.tsx` 26 项：集合入口与首页双语；五页在离线清单与 sitemap；字段、选项、分组、步骤、路径都有中英文；步骤随路径；必填、名单未答与确认没有（引擎对未答与 `[]` 给出不同结论）、行内先后、不得晚于模拟日期、整数与非负；问卷渲染 e2e 用到的 id、按路径与按答案隐藏的字段；分居离婚、永久居留与被拒答案到请求的转换，留空不送确定值；离开路径或分支的答案不评估、不分享；改答案清掉随之隐藏的子答案、保留其他路径答案；进行中草稿带值错误原样重开、已完成草稿退回出错步骤；信封往返、拒收英国与葡萄牙信封和裸对象、拒收无效国籍代码；分享不覆盖本机草稿、场景片段；结果只含所选路径、年限日期与"自某日起"摘要、说明不重复标题、金额千分位；kind 分组与缺口、冲突费用说明；按路径的日期标签（双语渲染）；对比旋钮初值、未动不变、逐个旋钮不换路径与人、MyPR 旋钮改日期、只在读取它的路径下显示且链接的条件都能找到控件；政策目录与引擎逐条件一致（92 个条件）、只含马来西亚来源；嵌套参数全部带字段名、按国籍表与政策页双语渲染。
- 视觉：用 Playwright 无头截图（`serve.ts` 起在 4491 端口，用完按 PID 停止）查看中文 1280 宽问卷七步、结果、对比，英文 375 宽第 1 步、结果和展开全部分组的政策页，`scrollWidth` 均等于 `clientWidth`。截图发现中文摘要句号后多一个空格（引擎按空格连接），已在模块里去掉并加断言。另用 axe-core 扫描首页、七步、第 1 步报错状态、结果、对比、政策页，中英文共 24 页，无 serious/critical 问题，375 宽无横向溢出。
- `git diff --check` 通过；新文件经 Prettier 与 ESLint 检查。

## 3. 没做或没验证的

- 未 push，未开 PR。
- A1752 生效后的另一栏未做（规则报告问题 1，不在 brief 范围）。
- 不问 `applicationDate`，模拟日期即递交日。
- "删除最后一行回到未答""没有记录才产生空名单"由 e2e 在浏览器里核对；web 单测没有 DOM 环境，只核对新草稿为未答、`[]` 与未答在引擎里的不同结论。
- e2e 只跑了 brief 指定的三个文件、desktop 项目；mobile 项目与其他国家 e2e 未跑。
- 初版时引擎的 `separatedOrDivorced` 仍是一个字段；review114-1 风险 2 已改为两个字段，见审核修正一节。

## 4. 发现与建议（范围外，未实现）

- 引擎把摘要各句用空格连接，中文出现"。 即使…"；页面只在马来西亚的中文结果里去掉。建议引擎按语言连接。
- 问卷已分开问分居与离婚，引擎可改收两个字段：离婚使婚姻终止，可直接判公民之妻登记等类别不满足，而不必待确认。（review114-1 风险 2 已实现。）
- 共用组件的"仅按时间条件推算的日期"标签对所有路径相同；马来西亚满足时是"自某日起"，现在靠摘要句与结果说明解释。若要逐路径改标签，需要共用组件支持类似 `earliestLabel` 的时间日期标签。
- 对比页"仍未满足"一组用共用的 `diffPathways`，会列出费用、批准后事项等不进缺口的条件；建议与 `gapRules` 一样按 `kind` 过滤。（review114-1 建议 1 已对马来西亚实现。）
- `site-shell.tsx` 的场景国家名单现为八国，建议改为读当前国家模块的 `scenarioLinks`（葡萄牙报告已提）。

## 审核修正（review114-1）

### 1. 做了什么（按 commit）

| PROGRESS | commit | 审核项 |
|---|---|---|
| — | `Merge: 合入 main（马来西亚规则 #91 等）` | 风险 1：合入 main（规则 #91、加拿大、爱尔兰、西班牙页面）。四处冲突：`site-shell.tsx` 场景国家名单取并集（jp、au、us、gr、de、nz、pt、es、ca、ie、my）；`sw.js` 与 `about-page.test.tsx` 缓存版本改为 `2026-11-25-my2`；`PROGRESS.md` 取并集，960–962 与 main 不重号。`site-countries.ts` 与中英文字典自动合并，每国一行 |
| 963 | `Fix: 马来西亚 REP 家属的婚姻与亲子问题按 REP 关系显示` | 问题 1、风险 3 |
| 964 | `Fix: 马来西亚对比页清空 MyPR 签发日时回到问卷答案` | 问题 2 |
| 965 | `Fix: 马来西亚结果说明按路径区分年限日期的含义` | 问题 3 |
| 966 | `Fix: 马来西亚引擎分开读取已分居与已离婚，离婚判婚姻不存续` | 风险 2（规则语义） |
| 967 | `Fix: 马来西亚对比页的分组只列申请与时间条件` | 建议 1 |
| 968 | `Fix: 马来西亚出生日期与国籍只在读取它们的路径下显示` | 建议 2 |
| 969 | `Fix: 马来西亚公民身份居住年限缺口链到 MyPR 签发日控件` | 建议 3 |
| 970 | `Fix: 马来西亚"曾被拒绝永久居留"提示写明留空的影响` | 建议 4 |
| 971 | `Docs: 任务 114 报告补审核修正（review114-1）` | 本节；正文中已过时的说明同步改正 |

建议 5（场景国家名单改读 `scenarioLinks`）按统筹安排未做。各 commit 含 `PROGRESS.md` 对应行，尾注 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`。

逐条处理：

- **问题 1、风险 3**：字段定义加 `rep`：在 REP 路径被选中、且 REP 关系是所列值时也显示，不看"与公民或永久居民的关系"。结婚日期、是否已分居、是否已离婚对应参与者之妻或之夫，亲子关系对应参与者的子女；原来按关系显示的条件保留给其他路径。可见性判断改为带上 REP 关系（`MyScope`），评估、分享、校验与"改答案清掉隐藏子答案"用同一口径，所以改动关系不会清掉 REP 仍需要的字段。REP 关系从第 5 步移到第 3 步（家庭关系）开头，答完即在同一步显示要补的问题；只选 REP 时不再问 REP 不读的"与公民或永久居民的关系"。回归测试覆盖关系留空、"没有上述关系"、与 REP 关系矛盾（关系为公民的子女而 REP 为之妻；关系为公民之妻而 REP 为子女）的组合，REP 类别与结婚年数都为满足。
- **问题 2**：对比页 MyPR 控件清空时按问卷所填（持有时为问卷的签发日，未持有时仍为未持有），不再写入空日期；提示改为"留空则按问卷所填。填写日期即假设永久居留（MyPR）在该日签发"。该控件的无效日期错误只显示在它自己的输入框上（`aria-invalid="true"`，`aria-describedby` 指向提示与错误），模拟日期控件不受影响。
- **问题 3**：结果与对比页的说明分开写：永久居留各类（REP 子女除外，见 review114-2 问题 2）、Residence Pass 与 RP-T 满足时是当前连续满足的起点；归化、公民之妻登记与公民子女登记显示模拟日期本身（引擎 `earliestResidence` 从申请日起找第一个满足日）。本国日期标签只留七条路径，归化与公民之妻登记改用共用标签；模块注释与本报告正文同步。回归测试用审核的情景：签发日 2016-03-01，模拟日期 2026-06-01 时两条公民身份路径的年限日期都是 2026-06-01，且不加"自某日起满足"句。
- **风险 2（规则语义）**：引擎 `MyFullRequest.family` 以 `separated`、`divorced` 取代 `separatedOrDivorced`，页面原样送出。
  - 离婚：婚姻不再存续。公民之妻登记（SRC-500 Art. 15(1) p39"jika perkahwinan itu masih wujud"，已按快照物理页 39 核对；SRC-513 "That the marriage is still subsisting"）、公民配偶 LTSVP（SRC-509 清单要求婚姻仍存续的宣誓书）、REP 配偶（SRC-506 §4(a) p16）与 Residence Pass 第 4 类配偶的类别判不满足，路径为不适用，不挂 PD。
  - Residence Pass 第 3 类另列"Divorcee/widow/widower to citizens with a biological child who is a Malaysian citizen"（SRC-508 Residence Pass Categories），问卷不问有无公民子女，所以公民的离婚配偶在 Residence Pass 为待确认、不挂 PD，说明写明这一情形；永久居民的离婚配偶判不满足。
  - 只分居未离婚：婚姻在法律上仍存续，但分居是否影响这些类别未写明，仍为待确认并挂 PD-405。
  - 永久居留之妻、之夫：指南写"tanpa berpisah atau bercerai"（SRC-505 §5.1(c) p18、§5.2(c) p19），任一为是即结婚年数不满足，说明分别写"所填已离婚""所填已分居"。
  - "已离婚"答是时不论"已分居"如何都按离婚处理；"已分居"答是而"已离婚"未答、只答一项且答否、或都未答时为待确认、不挂 PD（第二轮审核前，"已分居"答是而"已离婚"未答时误挂 PD-405，见 review114-2 一节）。`docs/pending-details.md` 的 PD-405 处理说明同步改写。
- **建议 1**：共用 `CountryWhatIf` 加可选的 `compared`，`diffPathways` 只把它返回真的条件放进"翻转为满足""翻转为未满足／未知""仍未满足"；不适用一组不变。马来西亚设为申请条件与时间条件，与"还差什么"同口径。其他国家不设置，行为不变。
- **建议 2**：出生日期只在 PR 子女、REP、Residence Pass、三类公民身份、MM2H、DE Rantau 下显示；国籍只在 WAS、REP（押金）、公民配偶 LTSVP（担保金）、DE Rantau 下显示（按引擎读取 `dateOfBirth`、`nationality` 的位置核对）。
- **建议 3**：`my.cit.residence` 的"去 What-if"链到"假设 MyPR 签发日"（只出现在归化与公民之妻登记，两者都显示该控件）。
- **建议 4**：保持可留空，提示写明"留空时「此前被拒后的等待期」显示待确认，年限日期也不会计入被拒后的等待期"。

### 2. 怎么验证的

- 先失败后通过：每项先改或加测试，在改源码前运行并确认失败——问题 1（REP 之妻的 active family 为 `{}`）、问题 2（清空后 citizenship 不等于问卷答案）、问题 3（标签与说明两项）、风险 2（`malaysia-full.test.ts` 20 余项因新字段失败）、建议 1（对比页含 `my.pr.fee ·`）、建议 2（只选 PVIP 时出现国籍）、建议 3（两项仍为 `date`）、建议 4（无提示的 `aria-describedby`）；改后全部通过。
- 引擎：`packages/engine` 的 `tsc --noEmit`、ESLint、Prettier 通过；`test/malaysia-full.test.ts` 124 项通过（改写了用到 `separatedOrDivorced` 的各测试，新增离婚、只答其一与 Residence Pass 离婚配偶的断言）。
- 合入 main 后：web 52 个文件 1,132 项通过；构建后首页 12 张国家卡片，马来西亚卡片 7 个 `<li>`，`offline-pages.json` 与 sitemap 各含马来西亚五页、排在德国之后。
- 完整验收：`(export VITEST_MAX_WORKERS=2; pnpm lint && pnpm typecheck && pnpm test && pnpm build)` 在 970 之后运行，退出码 0。error-report 2、policy-data 23、engine 6,131（1 项既有跳过）、game 1,362、web 1,137 项通过；构建生成 74/74 个静态页面。
- e2e：确认 4490 端口空闲后运行 `cd apps/e2e && E2E_PORT=4490 npx playwright test tests/malaysia.spec.ts tests/site.spec.ts --project=desktop --reporter=line`（仓库没有 `offline.spec.ts`，离线清单由 `site.spec.ts` 覆盖），7 项通过；跑完删除 `apps/e2e/test-results`。e2e 改为先选路径再填出生日期并核对国籍不显示，缺口链接改为聚焦 MyPR 控件；新断言的值都在单测里先核对。

### 3. 没做或没验证的

- 建议 5 未做（统筹另做）。未 push，未开 PR。
- 公民的离婚配偶是否有马来西亚公民亲生子女（Residence Pass 第 3 类的另一情形）问卷没有问，该情形为待确认。
- 没有重新截图走查；可见变化（第 3 步多一题 REP 关系、对比页提示与分组、结果说明文字）由单测渲染与 e2e 覆盖。
- e2e 只跑了 desktop 项目的两个文件。

### 4. 发现与建议

- `compared` 目前只有马来西亚设置；其他已设 `kind` 的国家（澳大利亚、葡萄牙、新西兰等）的对比页仍列出费用与提示，可按同一做法统一。
- 引擎摘要中文句间空格仍由页面去掉（初版第 4 段已提）。

## 审核修正（review114-2）

### 1. 做了什么（按 commit）

| PROGRESS | commit | 审核项 |
|---|---|---|
| 972 | `2decc8df Fix: 马来西亚只在答"未离婚"时把分居列为 PD-405 待确认` | 问题 1、建议 3 |
| 973 | `7a5d4aaf Fix: 马来西亚结果说明把 REP 子女的年限日期列为申请日` | 问题 2 |
| 974 | `0f4ec705 Fix: 马来西亚家庭关系一步说明与 REP 共用的婚姻答案并提示矛盾` | 风险 1 |
| 975 | `2b2cf6f9 Fix: 马来西亚 Residence Pass 离婚配偶说明补法院监护权条件` | 风险 2 |
| 976 | `9dd513ef Fix: 马来西亚问卷不显示空的分节标题，路径列表移到第 1 步最前面` | 建议 1、2 |
| 977 | `Docs: 任务 114 报告补第二轮审核修正（review114-2）` | 本节 |

建议 4（共用 `compared` 推广到其他国家）按统筹决定保持不变。分叉点已是最新 main，本轮未再合并。

- **问题 1（采用第一种做法）**：`marriageSubsists` 只在"已分居"答是且"已离婚"明确答否时写"所填已分居但未离婚"并挂 PD-405。"已分居"答是而"已离婚"未答时写"所填已分居，未填是否已离婚。无法确认婚姻仍存续。"，待确认、不挂 PD。"已离婚"答是即不满足（Residence Pass 公民配偶为待确认，见风险 2）。PD-405 处理说明与上一节报告措辞同步改准。引擎测试补齐五种组合：分居是／离婚未答、分居未答／离婚是、分居否／离婚未答、分居未答／离婚否、分居是／离婚否。
- **建议 3**：新增 `apartMissing`。婚姻存续与永久居留配偶类结婚年数的说明分别写"未填是否已离婚""未填是否已分居""未填是否已分居或离婚"。
- **问题 2**：REP 子女满足年限时给出的是申请日（`malaysia-full-pr.ts` 未满年龄时 `earliest = date`）。结果说明改为：
  - 永久居留之妻、之夫、子女与完全外国人类、REP 配偶、Residence Pass 与 RP-T：当前连续满足的起点；
  - REP 子女、归化、公民之妻登记与公民子女登记：模拟日期本身。

  模块注释与报告同步。新单测对 11 种有年限的情形（REP 分配偶与子女）在 2026-11-25 与 2027-02-01 两个模拟日期核对：
  - "起点"组两次日期相同且早于模拟日期；
  - "申请日"组两次都等于模拟日期；
  - 另 5 条没有年限的路径不给日期；
  - 说明的两组与此一致。
- **风险 1**：家庭关系一步加 `familyNote`，评估不变。
  - 两题都显示且已作答、且对应同一关系时，说明"下面的婚姻与亲子答案同时用于两类路径"。只有另一路径也读这些答案时才显示，例如只选公民子女登记与 REP 时不显示。
  - REP 关系与"与公民或永久居民的关系"不一致时提示核对，例如永久居民的配偶与参与者之妻、公民的子女与参与者之夫、公民之妻与参与者的子女、公民之夫与参与者之妻。依据是 REP 参与者为马来西亚公民。
- **风险 2**：Residence Pass 公民离婚配偶的说明补上 SRC-508 "For Category 3(iii), divorcee / widow / widower to a Malaysian citizen who has been granted a full or joint custody of the biological child by the relevant court of law"：须经法院判给公民亲生子女的完全或共同监护权。状态仍为待确认，PD-405 说明同步。
- **建议 1**：某节按当前答案没有可见问题时整节不渲染。例如只选 REP、REP 关系未答或答"不是参与者的配偶或子女"时，不再出现空的"家庭关系"标题。
- **建议 2**：第 1 步顺序改为说明、路径列表、模拟日期，以及选了路径后才出现的国籍、出生日期、护照到期日。路径未选的错误先于其他字段写入，提交时最先聚焦。

### 2. 怎么验证的

- 每项先写测试并在改源码前确认失败，改后通过：
  - 问题 1：分居是、离婚未答时仍挂 PD-405；建议 3：说明仍写"未填是否已分居或离婚"。
  - 问题 2：说明里没有 REP 子女一组。
  - 风险 1：没有说明文字。
  - 风险 2：说明缺监护权。
  - 建议 1、2：出现空标题，路径列表在字段之后。
- 引擎 `test/malaysia-full.test.ts` 124 项通过；`tsc --noEmit`、ESLint、Prettier 通过。
- 完整验收：`(export VITEST_MAX_WORKERS=2; pnpm lint && pnpm typecheck && pnpm test && pnpm build)` 在 976 之后运行，退出码 0。error-report 2、policy-data 23、engine 6,131（1 项既有跳过）、game 1,362、web 1,140 项通过；构建 74/74 页。
- e2e：确认 4490 端口空闲后运行 `cd apps/e2e && E2E_PORT=4490 npx playwright test tests/malaysia.spec.ts tests/site.spec.ts --project=desktop --reporter=line`，7 项通过；跑完删除 `apps/e2e/test-results`。
- 截图走查：`serve.ts` 起在 4491，用完按 PID 停止，端口已释放。脚本跑完删除，截图留在 scratchpad `p20/my114/shots2/`。
  - 范围：中英文各在 1280 与 375 宽，截第 1 步（未选与已选路径）、只选 REP 的第 3 步、共用说明与矛盾提示两种第 3 步、第 4 步、结果、对比、展开全部分组的政策页，共 36 张。
  - 结果：全部无横向溢出（`scrollWidth` 等于 `clientWidth`），问卷中没有无输入的分节；目视核对了中文 1280 矛盾提示与英文 375 第 1 步。

### 3. 没做或没验证的

- 建议 4 按统筹决定未做；未 push，未开 PR。
- 共用说明与矛盾提示只是文字提示，不阻止提交，也不改评估。
- e2e 只跑了 desktop 项目的两个文件；本轮没有重跑 axe，可见变化（新提示段落、分节顺序）由单测渲染与截图覆盖。

### 4. 发现与建议

- 同一份 `family` 记录被两组关系共用，是问卷结构的限制。若以后要支持"永久居民的配偶"与"REP 参与者之妻"指向不同婚姻的情形，需要把 REP 的婚姻答案单独存放，并相应改引擎请求。
