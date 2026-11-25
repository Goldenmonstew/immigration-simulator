# 任务 113 · 马来西亚完整版规则引擎

## 1. 做了什么

| PROGRESS | commit | 交付文件 |
|---|---|---|
| 850 | `Docs: 登记马来西亚完整版官方来源与待定细节` | `policy-sources/` 39 份 `*-my-*` 快照、`docs/SOURCES.md`（SRC-500–528 表格行与"马来西亚完整版来源登记"备注）、`docs/pending-details.md`（PD-400–429）、`apps/web/lib/sources.ts` |
| 851 | `Feat: 加入马来西亚永久居留、公民身份与长期准证参数` | `packages/policy-data/src/parameters/malaysia-2026-11.ts`，登记进 `PARAMETERS_BY_COUNTRY.my` 与 `RULE_SET_IDS_BY_COUNTRY.my = ['my.current-law-2026-11']`，从包入口导出 |
| 852 | `Feat: 实现马来西亚永久居留、公民身份与长期准证逐项评估` | `packages/engine/src/malaysia-full{,-shared,-pr,-citizenship,-passes}.ts`、`packages/engine/src/index.ts`、`packages/engine/test/malaysia-full.test.ts`，参数文件补文中数字，修正 PD-403、406、415 定位 |
| 853 | `Docs: 马来西亚完整版规则报告` | 本报告；PD-419 补 Citizenship Rules 1964 未取得的说明 |

各 commit 尾注 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`，未 push。网页只改了 `apps/web/lib/sources.ts`；登记 `my` 规则集后网页类型检查通过，无须补项。

### 结果结构

`evaluateMalaysiaFull(request): CountryResult` 返回一列 `my.current-law-2026-11`（`policyAsOf` 为 2026-11-24），列内按 `MY_FULL_PATHWAYS` 的顺序给出路径；`pathways` 留空时评估全部 15 条。年龄、准证与居住按 `applicationDate`（缺省为模拟日）判断。

- 条件 `kind`：`requirement` 决定路径状态；`factor` 为审查因素；`information` 为费用、获批后事项和说明，费用带 `fee: { currency: 'MYR', amount }`。不适用的条件为 `applicable: false`。
- 路径状态：类别条件（`*.category`）不满足时为 `NOT_APPLICABLE`；否则任一 requirement `NOT_MET` 为 `NOT_MET`，有 `UNKNOWN` 为 `UNKNOWN`，全部满足为 `MET` 并以申请日为 `earliestDate`。
- 永久居留、归化与子女登记为裁量授予：门槛照常给 `MET`／`NOT_MET`，另有一项批准条件恒为 `UNKNOWN`，摘要说明"门槛满足后仍由主管机关裁量"。公民之妻登记是"berhak"（有权），不设裁量项。
- 年限可算的路径另给 `timeStatus`／`timeEarliestDate`（`MET`、`FUTURE`、`NOT_MET`、`UNKNOWN`）。
- 请求按调研档案各条"问"设计：身份关系、婚姻、各段准证（种类与起止）、出境（起止与原因）、担保人与推荐人、记录（只问有无）、语言自评、各准证的数值。没填一律 `UNKNOWN`，不问护照号、病名或犯罪细节。

### 路径清单与条件

永久居留共同条件（四个 Permit Masuk 类别）：`my.pr.passport`、`sponsor`、`referees`、`prohibited-classes`、`previous-refusal`、`interview-security`（factor）、`means`（factor）、`language`（factor）、`health`、`discretion`、`processing`、`fee`、`after-approval`、`region`。

| 条件 ID（`my.pr.` 后缀） | 主要来源 |
|---|---|
| `passport` | SRC-505 §5.1(a) p18、§5.2(a) p19、§5.3(b) p20、§5.4(a) p21、§10.1 p28；REP 为 SRC-506 §5.6 p17 |
| `sponsor` | SRC-505 §5.1(f)、§5.2(f)、§5.3(e)、§5.4、§2.6 p12、§3.10 p14；REP 为 SRC-506 §5.5 p17 |
| `referees` | SRC-505 附录 C1 第 10 项 p59、C3 第 6 项 p61；REP 为 SRC-506 §5.7 p17（子女类不适用） |
| `prohibited-classes` | SRC-505 §5.1(e)、§5.2(e)、§5.4(d)；SRC-503 s.8(3) p12–14 |
| `previous-refusal` | SRC-503 s.10(3) p18；SRC-505 §8.1、§8.4 p25 |
| `interview-security` | SRC-505 §6.3–6.5 p22 |
| `means`、`language`、`health` | SRC-505 附录 C1、C3、A2 p44；SRC-503 s.8(3)(a)–(c) p12–13 |
| `discretion` | SRC-503 s.10(2) p18；SRC-507；REP 加 SRC-526 |
| `processing`、`fee`、`after-approval`、`region` | SRC-505 §6.4、§7、§9.1、§10、§11、§§13–15、免责声明 p15；SRC-506 §11.1 p25；REP 地区为 SRC-526 |

| 路径 ID | 专有条件（`my.pr.` 后缀） | 主要来源 |
|---|---|---|
| `my.pr.wife` | `category`、`marriage-registration`、`marriage-duration`（3 年）、`spouse-pass`（超过 12 个月且有效）、`barred-pass` | SRC-505 §4 p17、§5.1 p18、§2.4 p12 |
| `my.pr.husband` | 同上，婚姻 5 年、准证连续 5 年且中断不超过 6 个月 | SRC-505 §5.2 p19、§2.4 p12 |
| `my.pr.child` | `category`（亲生子女；继子女不满足、养子女待确认）、`child-age`（未满 18 岁）、`qualifying-pass`（超过 12 个月） | SRC-505 §5.3 p20、附录 C2 p60 |
| `my.pr.was` | `category`、`qualifying-pass`（就业、学生、专业访问、Residence Pass 连续 5 年）、`barred-pass`、`field-recognition`、`deposit`、`dependants` | SRC-505 §3.11 p14、§5.4 p21、§2.5 p12、附录 B1–B3 p53–57、§9.2–9.3 p26 |
| `my.pr.rep-family` | `category`（REP 参与者家属且已获 SATK）、`child-age` 或 `marriage-duration` 与 `rep-marriage-timing`、`rep-approval-letter`、`rep-ltsvp-fee`、`deposit`；不含面谈、收入、语言、处理时间等一般指南条目 | SRC-506 §4–5 p16–17、§11 p25、Lampiran 9 p36；SRC-526 |
| `my.rp.family` | `my.rp.category`（第 3–5 类）、`child-age`（18 岁及以下）、`passport`（6 个月）、`long-term-pass`（第 3 类 3 年、第 4 类 5 年）、`sponsor`、`fee`、`rights`、`pr-link`（公民之妻、之夫） | SRC-508 |

公民身份（`my.cit.` 后缀）：

| 路径 ID | 条件 | 主要来源 |
|---|---|---|
| `my.cit.naturalisation` | `age`（21 岁）、`residence`（12 年内 10 年，含最后 12 个月）、`intent`、`character`、`malay-language`、`referees`、`renunciation-oath`、`documents`（factor）、`discretion`、`special-circumstances`、`application-fee`、`certificate-fee`、`after-grant`、`constitution-amendment` | SRC-500 Art. 19(1)–(3)、(9) p44、p46，Art. 24(1) p49，Art. 25 p52、p54，附表一 p359，附表二第三部分 s.20 p372–373；SRC-512；SRC-515；SRC-516 p2–4；SRC-501；SRC-502 |
| `my.cit.wife-registration` | `category`、`marriage-registration`（Art. 15(5)）、`residence`（申请前 2 年一直居住）、`intent`、`character`、`renunciation-oath`、`entitlement`、两项费用、`after-grant`（Art. 26(2)、24(4)）、`constitution-amendment` | SRC-500 Art. 15(1)、(5) p39–40，Art. 24(4) p51，Art. 26(2) p54；SRC-513 |
| `my.cit.child-registration` | `category`、`age`（未满 21 岁）、`renunciation-oath`（18–20 岁，Art. 18(1)）、`applicant`、`discretion`、`special-circumstances`（Art. 15A）、两项费用、`constitution-amendment` | SRC-500 Art. 15(2) p39、15A p40；SRC-514；SRC-515 |

居住按附表二第三部分 s.20 计算：永久居留期间自 Permit Masuk 签发日起计入；少于 6 个月的出境（按历月）、因健康或为联邦或州服务的出境计入；凭准证居留的期间（s.20(2)(c)）与为教育或其他原因的长期出境（s.20(1)(b)、(e)）须部长同意、批准或指定，只有计入它们才满足时为 `UNKNOWN`；未填出境记录、或未持永久居留而未填准证时也为 `UNKNOWN`（review113-1 修正）。"10 年"按申请日前 10 个历年的日数比较。

长期准证（`my.pass.` 后缀）：

| 路径 ID | 条件 | 主要来源 |
|---|---|---|
| `my.pass.spouse-ltsvp` | `category`、`marriage-registration`、`sponsor`、`income-evidence`（factor）、`duration`、`work`、`fee`、`security-bond`、`pr-link` | SRC-509；SRC-506 §11.1 p25；SRC-510 |
| `my.pass.mm2h` | `diplomatic-relations`、`age`、`licensed-operator`、`fixed-deposit`、`property`、`minimum-stay`、`good-conduct`、`security-screening`（factor）、`medical-insurance`、`work`、`term`、`participation-fee`、`pass-fees`（签发处理费）、`annual-fee`、`system-fee`、`dependants`、`pr-link` | SRC-517 p1–16；SRC-518 p1–5；SRC-519；SRC-520 p12、p26；SRC-521；SRC-522；SRC-523；SRC-524；SRC-504 p5–6；SRC-505 §2.5、§3.14 |
| `my.pass.rpt` | `work-years`（连续 3 年）、`ep-validity`（超过 3 个月）、`tax`（2 年）、`salary`（RM15,000）、`qualification`、`experience`（5 年）、`benefits`、`fee`、`pr-link` | SRC-525；SRC-505 §5.4(b) p21 |
| `my.pass.pvip` | `pvip-terms`、`pr-link` | SRC-505 §2.5 p12、§3.15 p14 |
| `my.pass.de-rantau` | `nationality`、`age`（18 岁）、`income`（2026-11-01 起科技类 USD36,000，此前 USD24,000；非科技类 USD60,000）、`remote-employer`、`passport`（超过 14 个月）、`term`、`fees`、`security-bond`、`pr-link` | SRC-528 v11 Section A–D、v10 Section A Q3 |
| `my.pass.employment` | `salary-category`（按递交日分新旧门槛）、`terms`、`pr-link` | SRC-527 p3–6 |

### 新增 SRC 与 PD

- SRC-500–528（29 个，编号段 500–549 内）。马来西亚未用的快照（P.U. (A) 49/2018、移民局所需文件页与 MM2H 贴纸页、MOTAC 计划页、MM2H 各类别分页、ESD 新薪资 FAQ）没有登记。
- 登记备注写明来源链问题：Permit Masuk 指南托管在 Google Drive，由移民局两个官方页面链接其文件夹（SRC-505、SRC-507）；LOM 修订表是 AES-256-GCM 加密的 POST 响应，用页面密钥解密，任务 113 复核 A1752 仍为"NOT YET IN FORCE"（SRC-502）；moha.gov.my 证书链缺中间证书，调研时补 GlobalSign 中间证书下载（SRC-500、SRC-511）。
- PD-400–428 对应调研档案 PD-MY-01–29，PD-429 为计日口径，PD-430、PD-431 为审核 review113-1 新增。

### 仍为 `UNKNOWN` 的条件及原因

| 条件 | 原因 | PD |
|---|---|---|
| `my.pr.discretion`、`my.cit.discretion` | 批准为裁量，标准未公开 | PD-400、PD-416 |
| `my.pr.prohibited-classes` | 除已知被列入名单外，须经移民局与警方审查 | PD-415 |
| `my.cit.character` | "品格良好"无定义 | PD-415 |
| `my.cit.malay-language` | UPBM 形式与及格线未公开 | PD-414 |
| `my.pr.language`、`my.pr.means`、`my.pr.interview-security` | 无门槛的审查因素 | PD-402、PD-401 |
| `my.pr.field-recognition` | 认可证明形式未公开（有证明时为 `MET`） | PD-408 |
| `my.pr.fee`、`my.pr.region`、`my.pr.after-approval`、`my.pr.health` | 官方文件前后不一致或未写 | PD-404、PD-413、PD-412、PD-403 |
| `my.cit.residence` 计入准证或教育、其他原因的长期出境时；`my.cit.special-circumstances` | 须部长同意，一般同意与 Art. 19(2) 准则未公开 | PD-413、PD-418、PD-429 |
| `my.cit.renunciation-oath`（答"不确定"） | 放弃原国籍的期限与证明未公布 | PD-418 |
| `my.cit.constitution-amendment` | A1752 生效日未定 | PD-417 |
| `my.cit.certificate-fee`（未答默迪卡日） | 证书费分档；Citizenship Rules 1964 未取得原文 | PD-419 |
| `my.pass.pvip-terms` | PVIP 官网无法连接，无官方快照 | PD-424 |
| `my.pass.fee`（RP-T） | 无官方收费原文 | PD-425 |
| `my.pass.property`（SEZ/SFZ） | 底价由柔佛州政策决定 | PD-423 |
| `my.pass.duration`、`my.pass.fee`（公民配偶） | 获批期限规则与 RM90 适用范围 | PD-427 |
| `my.pass.security-bond`（公民配偶 LTSVP：日本、韩国、澳门、香港与孟加拉等七国） | 移民局表与 MDEC 表冲突 | PD-411 |
| `my.pass.pass-fees`、`my.pass.annual-fee`、`my.pass.dependants`（MM2H） | 叠加关系与保额；子女上限不一致 | PD-422、PD-421 |
| 婚姻只在外国登记、公民之妻登记与 REP 配偶所填分居或离婚、准证只累计满足、须把 6 个月以内的中断算作持有才满 5 年、公民配偶改持 Residence Pass、养子女 | 指南未写或所填未区分 | PD-405–407、PD-428、PD-409 |
| `my.pass.minimum-stay`（MM2H 50 岁及以上未达 90 天） | 只有官网写豁免 | PD-420 |
| `my.pass.age`、`my.pass.income`（DE Rantau 18 岁生日当天、收入恰为门槛） | FAQ 前后写法不一 | PD-430 |
| `my.pass.work-years`（RP-T 连同其他准证满 3 年） | 未限定准证种类 | PD-431 |

## 2. 怎么验证的

- 快照：39 份文件复制到 `policy-sources/` 后逐一与调研档案 `sources.sha256` 比对一致；关键条文按物理页重新核读（`pdftotext -f N -l N`；无文字层的 Permit Masuk 附录、REP 指南、内政部上诉文件渲染成图片目读），并用 LOM 页面密钥解密修订表核对 A1752 状态。
- `packages/policy-data`：`eslint .`、`tsc --noEmit`、`vitest run` 通过（来源一致性测试覆盖新参数的全部 SRC 引用）。
- `apps/web`：`tsc --noEmit` 通过；`vitest run test/policy-page.test.tsx` 7 项通过（`sourceUrls` 与 SOURCES.md 表格行一一对应）。
- `packages/engine`：`eslint .`、`tsc --noEmit` 通过；`test/malaysia-full.test.ts` 64 项通过，覆盖规则集登记、15 条路径中英文结构一致且英文无中文字符、只引用已登记的 SRC 与 PD-400–429、各条件的满足与不满足或待确认，以及手算的日期边界（结婚与准证周年日、"超过 12 个月"、6 个月中断、未满 18／21 岁、10/12 年在 2 年出境时恰好满足与差 1 天并推算最早日 2028-01-02、正好 6 个月的出境、护照 12／14 个月、MM2H、RP-T、DE Rantau 与 EP 门槛）。
- 完整验收 `VITEST_MAX_WORKERS=2 pnpm lint && pnpm typecheck && pnpm test && pnpm build` 在 commit 852 之后运行，退出码 0：engine 6070 项通过（1 项按既有条件跳过），policy-data 23 项、网页 1348 项、游戏 840 项及其余包全部通过，构建生成 32 个静态页面。
- 之后只改了 `malaysia-full-citizenship.ts` 中关于长期出境原因的说明文字（教育须部长批准、其他原因不计入），复跑 engine 的 `eslint`、`tsc --noEmit` 与 `test/malaysia-full.test.ts`（64 项）通过。

## 3. 没做或没验证的

- 按 brief 未做页面、问卷、对比、分享与游戏；未 push、未开 PR。
- 修正案生效后的另一栏没有实现，只在相关路径给出说明（待用户决定）。
- 未取得官方原文的事项没有写数字：PVIP 全部参数、RP-T 费用、UPBM、PR 积分制、Citizenship Rules 1964、Immigration Regulations 1963 合并文本。
- Act 155 只核对到 2006 年重印本；宪法以 2020 年马来文译本为准，2020 年后的 A1663 未核对内容。
- 沙巴、砂拉越的州政府政策与其 MM2H 不在范围内；Residence Pass 第 3 类中离婚或丧偶者、公婆两种情形只在说明里列出，问卷关系里没有单独选项。

## 4. 发现与建议（范围外，不实现）

与调研档案不同的处理，供审核留意：

1. 档案写子女类"免面谈与审查"；指南 §6.3 只免面谈，§6.5 写每宗申请都经警方安全审查（SRC-505 p22），引擎按后者处理。
2. 永久居住意向答"是"给 `MET`（档案写其余 `UNKNOWN`）：政府是否认可已由批准项表达。
3. JPN 两份清单把 MyPR 标为"mandatori"，但注 5 定义为"曾持有者须交"（SRC-512、SRC-513），不等于必须先有永久居留；引擎不单列永久居留条件，而按宪法 s.20(2)(c) 只把永久居留期间直接计入。
4. 档案未区分长期出境的原因：教育出境须部长批准，按待确认；其他原因原按整段不计，审核 review113-1 后按 s.20(1)(e) 与教育同样待确认。
5. 永久居民的配偶、子女与前公民与公民没有亲属关系，按完全外国人类别处理。

页面任务（114）要问用户的问题：

1. A1752 生效后是否像英国那样另列"修正案生效后"一栏（年龄 21→18、公民之妻须马来语、褫夺起算点变化）？
2. 问卷入口先问目标（永久居留、公民身份、长期准证）再显示相关路径，还是 15 条路径全部列出？
3. 国籍用 ISO 代码下拉（押金、担保金、DE Rantau 排除以色列都依赖它）是否可接受？
4. "是否被移民局列入名单""有无刑事判决"等敏感问题是否保留为可跳过的问题？
5. 费用相关的提示状态为 `UNKNOWN`（如 RM120 一次性还是每年）时，页面是否单独标注"官方说法不一"？

其他：

- 每周来源核对中，SRC-502 的加密 JSON 需 POST 才能复现，会报"变"或抓取失败；MM2H 官网页面含访客计数，原始哈希每次都会变，需人工复核正文。
- 对 `packages/policy-data/src` 运行 prettier 时发现 `parameters/ireland-2026-11.ts` 本身未按 prettier 格式化，已还原，本任务未改动该文件。
- 建议以后重试 PVIP 官网、国会网站与 LOM 英文宪法重印本，取得快照后替换 PD-424、PD-417 的说明。

## 审核修正（review113-1）

独立 Claude 审核第 1 轮（问题 10、风险 6、建议 11）全部处理。每项先写回归测试并确认失败，再修代码；边界日期与金额按条文手算写进断言注释。

### 1. 做了什么

| PROGRESS | commit | 审核编号 |
|---|---|---|
| 854 | `Fix: 马来西亚公民身份居住计算区分未填与没有，永久居留自签发日起算，其他原因长期出境按部长指定处理（review113-1）` | 问题 2、3、4、5 |
| 855 | `Fix: 马来西亚准证 6 个月以内中断不重新起算，公民配偶改持 Residence Pass 同口径（review113-1）` | 问题 1，风险 2 |
| 856 | `Fix: 马来西亚 2 月 29 日出生者的最早日期与截止日按足岁口径（review113-1）` | 问题 10 |
| 857 | `Fix: 马来西亚担保金冲突档位待确认，REP 家属补押金，DE Rantau 补担保金（review113-1）` | 问题 6、7，建议 10、11 |
| 858 | `Fix: 马来西亚公民之妻登记看分居离婚，子女类要求亲生，REP 结婚年限不加分居条件（review113-1）` | 问题 8、9，建议 4、5 |
| 859 | `Fix: 马来西亚 RP-T、担保人、MM2H 停留与 DE Rantau 边界按原文处理（review113-1）` | 风险 1、3、4、5、6 |
| 860 | `Fix: 马来西亚宣誓、担保人与 MM2H 费用的引用和措辞按原文（review113-1）` | 建议 1、2、3、6、7、8、9 |
| 861 | `Docs: 马来西亚完整版规则审核修正报告（review113-1）` | 本节；正文中已过时的说明同步改正 |

逐条处理：

- **问题 1**：`heldRun` 另给出桥接的中断日数。公民之夫与 WAS 类不计中断的持有日数不少于申请日前 5 年的日数时为 `MET`（审核例 2019-01-01–2021-12-31 共 1096 日、2022-04-01–2024-03-31 共 731 日，合 1827 日，等于 2019-04-01 至 2024-04-01 的日数）；须把中断算作持有才满时 `UNKNOWN`（PD-407）；最早日期按不计中断推算，不再在 6 个月以内的中断处重新起算（原测试例最早日由 2029-07-01 改为 2026-11-30）。SRC-505 §5.2(d) p19、§5.4(b) p21。
- **问题 2**：出境记录未填时居住为 `UNKNOWN`，不推算最早日期；不计出境仍不满足时照判 `NOT_MET`。
- **问题 3**：未持永久居留而准证未填时为 `UNKNOWN`（s.20(2)(c) p373 准证期间经部长同意可计入）；明确填无准证才判 `NOT_MET`。
- **问题 4**：`permanentResidentSince` 改为 Permit Masuk 签发日（MyPR／permit 上的日期），说明写"获批至签发之间仍属凭准证居留"。依据 SRC-503 s.10(2) p18、SRC-505 §9.3 p26（押金退还"dari tarikh dikeluarkan"）、§10.1–10.5 p28。审核例按签发日 2025-05-01 输入时为 `UNKNOWN`，最早 2027-05-01。
- **问题 5**：其他原因（含未填原因）的长期出境按 s.20(1)(e) p373 与教育同样处理：部长批准或指定才计入，只有计入才满足时 `UNKNOWN`（PD-413、PD-429）；说明、PD-413 与正文同步。
- **问题 6**：担保金参数拆为两表一致的档位与 MDEC 表独有的档位。公民配偶 LTSVP 对日本、韩国、澳门、香港与孟加拉、印度、巴基斯坦、菲律宾、缅甸、斯里兰卡、尼泊尔不给金额、`UNKNOWN`，说明写明两表冲突。SRC-510 费率表；SRC-528 v11 Section D Q2 p15。PD-411 补对照，并记下押金表 B3 与 Lampiran 9 也把这七国列为 RM750。
- **问题 7**：REP 家属加 `my.pr.deposit`，按国籍取 Lampiran 9（与 B3 同表），满 2 年可退。SRC-506 §11.3–11.4 p25、Lampiran 9 p36。参数 `wasDepositRm` 改名 `prDepositRm`，来源加 REP 指南。
- **问题 8**：公民之妻登记所填已分居或离婚时 `my.cit.category` 为 `UNKNOWN`（PD-405），说明写离婚后不再适用、只分居未另设条件、此项未区分两者。SRC-500 Art. 15(1) p39；SRC-513 Description。
- **问题 9**：REP 子女须亲生：继子女 `NOT_MET`、养子女 `UNKNOWN`（PD-409）。SRC-506 §4(b) p16。
- **问题 10**：新增 `birthday()`，`addYears` 落到 2 月 28 日而足岁未到时顺延到 3 月 1 日；归化最早日期、永久居留子女类与公民子女登记的截止说明都用它。2004-02-29 出生者 21 岁最早日为 2025-03-01；2008-02-29 出生者截止说明为"2026-03-01 之前"。
- **风险 1**：RP-T 就业准证效期只在就业准证中找，重叠的受养人准证不再导致 `NOT_MET`。
- **风险 2**：公民之妻改持 Residence Pass 后与公民之夫同为 `UNKNOWN`（妻看近 12 个月、夫看近 5 年，PD-428）；Residence Pass 路径对妻也给出 `my.rp.pr-link`。SRC-505 §5.1(d) p18、§5.2(d) p19。
- **风险 3**：RP-T 连续工作 3 年：就业准证满 3 年为 `MET`；连同其他准证连续在马满 3 年为 `UNKNOWN`（新登记 PD-431，SRC-525 原文未限定准证）；不足 3 年为 `NOT_MET`。
- **风险 4**：担保人按路径分开问：`citizenSponsor` 只指类别所称的公民配偶或父母（永久居留妻、夫、子女类与公民配偶 LTSVP），WAS 用 `was.citizenSponsor`，REP 用 `rep.participantSponsor`，Residence Pass 用 `residencePassSponsor`。
- **风险 5**：MM2H 50 岁及以上每年达 90 天为 `MET`，未达或未填为 `UNKNOWN` 并挂 PD-420（只有官网 SRC-524 写豁免，SRC-517 p3 未写）。
- **风险 6**：DE Rantau 18 岁生日当天、收入恰为门槛（含第 10 版 USD24,000）为 `UNKNOWN`，新登记 PD-430（SRC-528 v11 Section A Q3 p1、Q8 p2，Section B Q3 p4、Q4 p5；v10 Section A Q3 p1、Section B Q3 p4）；生日之后与高于门槛为 `MET`。
- **建议 1**：登记的宣誓引 SRC-500 Art. 18(1) p42（新参数 `registrationOathAge`），归化仍引 Art. 19(9) p46；公民子女登记加宣誓项，18–20 岁须宣誓，未满 18 岁为不适用。
- **建议 2**：WAS 担保人改引附录 C3 第 4–5 项 p61（MyKad Penaja、Surat Akuan Penaja，渲染核对）及 §2.6 p12、§3.10 p14。
- **建议 3**：`my.pass.pass-fees` 改名"签发处理费"，只含每次签发的 RM5,000 + 每名受养人 RM2,500；另列 `my.pass.annual-fee`（每人每年 RM500）。依据 SRC-504 附表三 V(vii)–(viia) p5–6；PD-422 写明各项不相加、同一项按人数相加。
- **建议 4**：永久居留子女类继子女 `NOT_MET`，养子女 `UNKNOWN`；PD-409 改写理由：子女类清单（附录 C2 p60）没有收养或继亲文件，WAS 清单（附录 C3 辅助文件第 16 项 p61）列有 JPN 收养证明。
- **建议 5**：REP 结婚年限只看年数（SRC-506 §5.3 p16），说明不再写未分居；所填已分居或离婚改在 REP 配偶类别为 `UNKNOWN`（离婚即不再是参与者配偶，PD-405）。
- **建议 6**：MM2H 受养人子女照原文写"21 至 34 岁且 tidak bekerja atau tidak berkahwin di Malaysia"。
- **建议 7**：公民之妻登记的居住说明补清单注 5 对"mandatori"的定义（曾持有者须交）。
- **建议 8**：A1752 定位补 s.5 p4，子女登记说明写明满 18 岁后 48 个月内宣誓、否则丧失公民身份（新参数值 `oathMonths`）。
- **建议 9**：Art. 25(2) 说明补"期间从未为联邦或其参加的国际组织服务"。
- **建议 10**：冲突档位的英文说明写明"the amount needs confirmation"。
- **建议 11**：DE Rantau 加 `my.pass.security-bond`，MDEC 作担保机构时按 SRC-528 v11 Section D Q2 p15 的档位给金额，准证到期全额退还；`deRantau` 参数的 Section D 定位改为 Q1 p14。

### 2. 怎么验证的

- 每组修正先写回归测试，运行 `VITEST_MAX_WORKERS=2 npx vitest run test/malaysia-full.test.ts` 确认新测试失败（居住 5 项、中断与 Residence Pass 5 项、2 月 29 日 1 项、费率 3 项、类别 4 项、风险 8 项、建议 5 项），修正后全部通过；`test/malaysia-full.test.ts` 由 64 项增至 86 项。
- 原测试按新口径改期望：无原因或其他原因的长期出境四处由 `NOT_MET` 改为 `UNKNOWN`（问题 5）；永久居留子女类继子女由 `UNKNOWN` 改为不适用（建议 4）；Residence Pass 担保人改读 `residencePassSponsor`（风险 4）；MM2H 50 岁及以上 0 天由 `MET` 改为 `UNKNOWN`（风险 5）；DE Rantau 示例收入改为 USD36,001、第 10 版示例改为 USD24,001、18 岁生日当天改为 `UNKNOWN`（风险 6）。
- `packages/policy-data`：`vitest run` 23 项通过（来源一致性测试覆盖新增的 SRC-506、SRC-528 定位与 `registrationOathAge`），`tsc --noEmit`、`eslint .` 通过。
- 新定位逐条按快照核读：SRC-500 Art. 18(1) p42、s.20(1)(e) p373；SRC-503 s.10(2) p18；SRC-505 §9.3 p26、§10.1–10.5 p28、附录 C2 p60、C3 p61（图片渲染）；SRC-506 §4(b)、§5.3 p16、§11.3–11.4 p25、Lampiran 9 p36（图片渲染）；SRC-510 费率表；SRC-528 v11 p1、p2、p4、p5、p15 与 v10 p1、p4；SRC-501 s.5 p4；SRC-504 p5–6；SRC-513 清单注 5；SRC-517 p3–4。
- 完整验收 `VITEST_MAX_WORKERS=2 pnpm lint && pnpm typecheck && pnpm test && pnpm build` 在 commit 860 之后运行，退出码 0：engine 6092 项通过（1 项按既有条件跳过，比修正前多 22 项）、policy-data 23 项、error-report 2 项、game 1348 项、web 840 项通过，构建生成 32 个静态页面。之后只改本报告与 `PROGRESS.md`。

### 3. 没做或没验证的

- 未做页面与问卷；问题 4 的"签发日"措辞与风险 4 的分开问担保人留给页面任务 114。
- `separatedOrDivorced` 仍是一个字段：永久居留配偶类照旧 `NOT_MET`，公民之妻登记与 REP 配偶为 `UNKNOWN`；没有拆成"分居""离婚"两个字段。
- 风险 6 的年龄只把 18 岁生日当天列为待确认，没有采用"满 19 岁才算 over eighteen"的读法。
- 风险 3 中"其他准证"包括全部准证种类，没有逐类判断哪些准证允许工作。
- 未 push、未开 PR。

### 4. 发现与建议

- WAS 清单（SRC-505 附录 C3 辅助文件第 16–17 项 p61）列有收养证明（anak angkat）与继子女的父母离婚证明（anak tiri），而 §5.4(e) p21 只写"anak kandung"；WAS 受养人说明仍按 §5.4(e)，未改。
- REP 指南 Lampiran 9 的标题是"长期社交访问准证与 Permit Masuk"的押金表，REP 家属申请长期社交访问准证时可能也须押金；本次只按 §11.3 给出 Permit Masuk 押金。
- 页面任务 114 宜把"已分居或离婚"拆成两个选项，并把永久居留日期问成 MyPR 上的签发日；担保人按路径分开问四次。
