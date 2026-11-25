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
| 1. 日期、国籍与路径 | 模拟日期（递交日，必填）；国籍（ISO 3166-1 代码下拉，按页面语言显示国名，另有"无国籍"，不含马来西亚）；出生日期（不得晚于模拟日期）；护照到期日（PR 五类、RP、DE Rantau）；十五条路径分三组多选：永久居留、公民身份、长期准证 |
| 2. 准证与出境记录 | 准证名单：种类（12 种）、开始日、最后有效日（PR 妻、夫、子女、WAS，RP，归化，公民之妻登记，RP-T）；出境名单：离开、回来、原因（归化、公民之妻登记） |
| 3. 家庭关系与担保人 | 与公民或永久居民的关系（PR 五类、RP、公民之妻、子女登记、公民配偶 LTSVP）；关系为配偶时：结婚日期（PR 妻、夫、REP）、婚姻登记（PR 妻、夫、公民之妻登记、LTSVP）、是否已分居、是否已离婚（PR 妻、夫、REP、RP、公民之妻登记、LTSVP）；关系为子女时：亲子关系（PR 子女、REP、RP）。担保人：公民配偶或父母担保并到场（PR 妻、夫、子女、LTSVP）、Residence Pass 担保人（RP） |
| 4. 记录、证明与语言 | 移民记录（PR 五类）、刑事判决（PR 五类、归化、公民之妻登记）——都可留空；曾被拒绝永久居留申请及被拒决定日期（PR 妻、夫、子女、WAS）；公民推荐人人数（PR 妻、夫、WAS）；本人收入、担保人收入、马来西亚纳税记录（PR 四类、LTSVP）；马来语自评（PR 四类、归化）、英语自评（PR 四类） |
| 5. 永久居留类别条件 | WAS：监管机构认可、关键职业、公民担保人；REP：与参与者的关系、参与者已获 SATK、批准信有效期、递交 REP 前已结婚（配偶时）、参与者担保、推荐人人数 |
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
| 分居与离婚 | 分开问两题；送引擎时任一答"是"为 `separatedOrDivorced: true`，两题都答"否"为 `false`，其余留空。引擎仍只有一个字段，所以答"已离婚"时公民之妻登记等仍为待确认（PD-405）。 |
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

- `earliestLabel` 按路径：年限日期是"自某日起满足"的九条路径（PR 五类、RP、归化、公民之妻登记、RP-T）用本国标签"满足所评估条件的申请日"／"Application date on which the assessed requirements are met"；其余六条（公民子女登记、LTSVP、MM2H、PVIP、DE Rantau、就业准证）用共用的"最早可申请日期（推算）"。公民子女登记的年限日期就是申请日，不属"自某日起"。
- `resultNotes` 在结果页与对比页加一条说明：条件按模拟日期核对；"仅按时间条件推算的日期"在年限已满足时是当前连续满足的起点，未满足时是最早满足日；永久居留与公民身份仍由主管机关裁量。

### 对比旋钮

改动只作用于草稿副本；未改动的旋钮不改写基线，全部未动时各路径显示"与当前情景相同"。任何旋钮都不改路径、家庭关系、出生日期与国籍（单测逐个旋钮核对）。

| 旋钮 | 控件 id | 改写 | 显示条件 | 关联条件 |
|---|---|---|---|---|
| 模拟日期（递交日） | `my-whatif-date` | `simulationDate` | 总是 | 结婚年数、配偶准证、合资格准证、各类年龄、护照效期、被拒等待期、REP 批准信、RP 长期准证、归化与登记居住、RP-T 工作年数与就业准证剩余效期 |
| 假设没有出境记录 | `my-whatif-trips` | `trips` 改为 `[]` | 问卷有出境名单时 | —（居住条件链到日期） |
| 假设 MyPR 签发日 | `my-whatif-pr-since` | `citizenship.permanentResidentSince`，填日期时 `prHeld` 改为是 | 选了归化或公民之妻登记 | — |
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
- 引擎的 `separatedOrDivorced` 仍是一个字段：问卷分开问分居与离婚，但答"已离婚"时公民之妻登记、REP 配偶等仍为待确认（PD-405），页面没有另作判断。

## 4. 发现与建议（范围外，未实现）

- 引擎把摘要各句用空格连接，中文出现"。 即使…"；页面只在马来西亚的中文结果里去掉。建议引擎按语言连接。
- 问卷已分开问分居与离婚，引擎可改收两个字段：离婚使婚姻终止，可直接判公民之妻登记等类别不满足，而不必待确认。
- 共用组件的"仅按时间条件推算的日期"标签对所有路径相同；马来西亚满足时是"自某日起"，现在靠摘要句与结果说明解释。若要逐路径改标签，需要共用组件支持类似 `earliestLabel` 的时间日期标签。
- 对比页"仍未满足"一组用共用的 `diffPathways`，会列出费用、批准后事项等不进缺口的条件；建议与 `gapRules` 一样按 `kind` 过滤。
- `site-shell.tsx` 的场景国家名单现为八国，建议改为读当前国家模块的 `scenarioLinks`（葡萄牙报告已提）。
