# 任务 91 · 日本完整版规则引擎

## 1. 做了什么

| PROGRESS | 建议 commit message | 交付文件 |
|---|---|---|
| 740 | `Docs: 登记日本完整版官方来源与待定细节` | `docs/SOURCES.md`、`docs/pending-details.md`、`policy-sources/` 本次新增快照、`apps/web/lib/sources.ts`、`PROGRESS.md` 第 740 项 |
| 741 | `Feat: 加入日本永住归化与再入国政策参数` | `packages/policy-data/src/{index.ts,parameters/japan-2026-11.ts}`、`PROGRESS.md` 第 741 项 |
| 742 | `Feat: 实现日本永久居留归化与再入国逐项评估` | `packages/engine/src/{index,japan-full,japan-full-pr,japan-full-naturalisation,japan-full-reentry,japan-full-shared,japan-full-talent}.ts`、`packages/engine/test/japan-full.test.ts`、本报告、`PROGRESS.md` 第 742 项 |

各提交尾注为 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

`evaluateJapanFull(request)` 返回符合 `CountryResult` 的 `JpFullResult`。列 ID 为 `jp.current-law-2026-11`，一份请求可针对同一申请人评估多个所选入口。中英文共用路径和条件 ID。结果里 `kind` 区分适用要求、审查因素和提示，`applicable: false` 标明不适用及原因。费用附可直接显示的币种和金额。在有确定不满足的适用要求时，路径为 `NOT_MET`，否则有待确认要求则为 `UNKNOWN`，全部适用要求满足才为 `MET`。综合国益与融和仍依官方认定。旧入口的时间状态及最早时间单列为 `timeStatus` / `timeEarliestDate`。完整评估确认可递交时才提供 `earliestDate`，永住日期按窗口日历调整。

### 永住许可

表中每个条件 ID 以 `jp.pr.` 开头。每条永住路径包含下表的共同检查，路径、日期与法定豁免决定适用性。

| 条件 ID | 主要来源定位 |
|---|---|
| `filing-in-japan`、`lawful-filing-status` | SRC-110 第20条第6項、第22条及第22条の2；SRC-119「申請期間」「申請提出者」。出生用专门时限。 |
| `longest-period` | SRC-440 別表第2；SRC-114 第2の5(6) 注4 p7。按原授予期间与过渡的持证日、首次递交和处分日期。 |
| `good-conduct`、`criminal-record` | SRC-110 / 441 第22条第2項第1号；SRC-113 1(1)(3)；SRC-114 第2の3 p3–4、5(4) p6。 |
| `national-interest` | SRC-110 / 441 第22条第2項；SRC-114 第1の1 p2、第2の5(1)(11) p5–6、p9。 |
| `immigration-duties`、`address-registration` | SRC-110 第19条、第19条の7–16、第23条第5項；SRC-114 第2の5(2) p6。 |
| `tax`、`pension-payments`、`public-health-insurance` | SRC-113 1(3)イ；SRC-114 第2の5(3) p6；SRC-450 两概要表第7–17行与各路径资料；SRC-449 5-(2)。 |
| `independent-livelihood` | SRC-110 第22条第2項第2号、第61条の2の14；SRC-441 第22条；SRC-113 1(2)；SRC-114 第2の4(1) p4。 |
| `household-income`、`public-burden` | SRC-114 第2の4(2)、第2の5(7)、第6 p4–5、p7–8、p13及适用告知；SRC-115 第69号 p8。 |
| `projected-pension` | SRC-114 第2の4(3) p5。 |
| `public-health`、`landing-and-security` | SRC-110 第5条第1項各号；SRC-113 1(3)オ；SRC-114 第2の5(1)(5) p6–7。 |
| `status-criteria` | SRC-113 1(3)エ；SRC-114 第2の5(5) 注3 p7；SRC-452 上陆基准及経営・管理；SRC-458 特定活動告示。 |
| `guarantor` | SRC-440 第22条第1項第3号、但书及第24条第4項；SRC-116 Q53；SRC-119「必要書類」。 |
| `japanese-language`、`life-rules`、`school-attendance` | SRC-114 第2の5(8)–(10) p8–9；SRC-454 学校教育法第17条、SRC-112 年龄计法；SRC-456《生活・就労ガイドブック》。 |
| `filing-documents` | SRC-119「申請提出者」「必要書類」；SRC-440 第22条第2項、第25条；SRC-450 家族路线「写真」。 |
| `approval-fee`、`fee-reduction`、`integrated-card-fee` | SRC-110 第67条；SRC-443 第3条の3、第25条及附则；SRC-444 价目单、Q11、减额；SRC-119「手数料」注4–5；SRC-457「手数料」。 |
| `special-permission` | SRC-110 第12、50条；SRC-114 第3注5 p10。新版捷径须核对排除，符合排除的申请人核对获准后的通常年限。 |
| `old-guideline-absences` 或 `single-absence`、`total-absence` | SRC-113 1(3)ア、2；SRC-114 第2の5(6) p7；SRC-115 第48号。出生取得用专门检查。 |

路径 ID 也以 `jp.pr.` 开头。下表列各路径在共同项以外的条件。

| 路径 ID 后缀 | 专有条件 ID 后缀 | 主要来源定位 |
|---|---|---|
| `general` | `continuous-stay`、`qualifying-status-stay` | SRC-113 1(3)ア；SRC-114 第2の5(6) p7、第5 p12。 |
| `spouse` | `married-life`、`continuous-stay`、`qualifying-family` | SRC-110 第22条第2項但书；SRC-113 2(1)；SRC-114 第3の1 p9；SRC-450 配偶者。 |
| `child` | `continuous-stay`、`qualifying-family` | 同上，SRC-450 実子等。 |
| `child-birth` | `birth-filing-window`、`birth-acquisition`、`birth-registration` | SRC-110 第22条の2–3；SRC-111 第2条；SRC-112 休日及计日；SRC-116 Q28；SRC-119「申請期間」；SRC-447 第49条；SRC-451 新生儿手续。 |
| `teijusha` | `continuous-stay`、`long-term-resident` | SRC-113 2(2)；SRC-114 第3の2 p9。 |
| `refugee` | `continuous-stay`、`recognised-protection` | SRC-110 第61条の2、第61条の2の14；SRC-113 2(3)；SRC-114 第3の3 p9。 |
| `hsp70`、`hsp80` | `continuous-stay`、`hsp-current-points`、`hsp-history` | SRC-113 2(6)–(7)；SRC-114 第3の6–7 p10；SRC-448 省令第1条第1項各表；SRC-450 永住申请 4。各有认定与历史举证模式。 |
| `j-skip` | `continuous-stay`、`j-skip-current`、`j-skip-history` | SRC-449 省令本则及附则、永住申请 5-(1)–(2)；SRC-114 第3の8 p10。 |
| `international-protection` | `continuous-stay`、`qualifying-status-stay`、`international-protection` | SRC-110 第22条第2項但书；SRC-440 第22条第4項；SRC-113 1(3)ア；SRC-114 第2の2 p3、第2の5(6) p7。 |
| `regional-regeneration` | `continuous-stay`、`regional-regeneration` | SRC-113 2(5)；SRC-114 第3の5 p9–10；SRC-458 第36、37号、別表第6–8。 |
| `structural-zone` | `continuous-stay`、`structural-zone` | SRC-114 第3の4 p9。 |
| `japan-contribution` | `continuous-stay`、`recognised-contribution` | SRC-113 2(4)；SRC-453 正文第1–8节 p1–3；SRC-114 第3の9、第4 p10–11。 |

### 帰化

路径和条件均以 `jp.nat.` 开头。下表为所有归化入口使用的共同检查，特别条款可放宽相应项。

| 条件 ID 后缀 | 主要来源定位 |
|---|---|
| `foreign-national`、`lawful-domicile`、`filing-in-japan` | SRC-111 第2–8、17、18条；SRC-117 Q9–10。 |
| `age-and-capacity` | SRC-111 第5条第1項第2号；SRC-117 Q9 及注；SRC-112 年龄计算。 |
| `good-conduct`、`livelihood` | SRC-111 第5条第1項第3–4号；SRC-117 Q9；SRC-445 手引「運転記録証明書」「生計」「事業」。 |
| `nationality-loss`、`nationality-loss-exception` | SRC-111 第5条第1項第5号及第2項；SRC-117 Q9；SRC-445 手引「国籍喪失等」。 |
| `constitutional-condition` | SRC-111 第5条第1項第6号；SRC-117 Q9。 |
| `residence-practice`、`integration` | SRC-117 Q9；SRC-118 记者会见、国会答复及政府参考人发言 No.120。 |
| `japanese-language`、`interview-and-assessment` | SRC-117 Q9；SRC-118 答弁書「三について」；SRC-445 东京及静冈办理说明、手引的日语评估。 |
| `tax`、`pension-payments`、`public-health-insurance`、`housing-and-health-evidence` | SRC-111 第5条；SRC-117 Q9；SRC-118 发言 No.120；SRC-445 手引；SRC-459 东京及广岛材料清单。 |
| `motivation-and-oath`、`filing-and-documents` | SRC-111 第18条；SRC-446 第2条；SRC-445 手引「動機書」「宣誓」、法务省「提出方法」「提出先」。 |
| `application-fee`、`gazette-and-family-registration` | SRC-445「手数料」；SRC-111 第10条；SRC-447 第102条の2。 |

| 路径 ID 后缀 | 专有条件 ID 后缀 | 主要来源定位 |
|---|---|---|
| `general` | `domicile-years` | SRC-111 第5条第1項第1号；SRC-117 Q9。 |
| `spouse` | `spouse-article-7` | SRC-111 第7条前段、后段。 |
| `article-6-former-national-child` | `former-national-child` | SRC-111 第6条第1号。 |
| `article-6-japan-birth` | `japan-birth` | SRC-111 第6条第2号；SRC-460 p3 官方参考译文。 |
| `article-6-long-residence` | `long-residence` | SRC-111 第6条第3号。 |
| `article-8-japanese-child` | `japanese-child` | SRC-111 第8条第1号。 |
| `article-8-adopted-child` | `adopted-child` | SRC-111 第8条第2号。 |
| `article-8-former-national` | `former-national` | SRC-111 第8条第3号。 |
| `article-8-stateless-from-birth` | `stateless-from-birth` | SRC-111 第8条第4号。 |
| `article-9-special-merit` | `special-merit` | SRC-111 第9条。 |

### 再入国及旅行衔接

路径和条件以 `jp.reentry.` 开头。三种情形均包含 `return-continuity`（SRC-110 第26、26条の2及第61条の2の15、SRC-116 再入国失效及继续在留）和 `travel-fee`（SRC-443 第25条各施行版、SRC-455 在线支付、SRC-461 手数料）。有境外延期时列 `consular-extension-fee`（SRC-462 政令第1条第1項第5–6号、省令別表第5–6行）。

| 路径 ID 后缀 | 专有条件 ID 后缀 | 主要来源定位 |
|---|---|---|
| `ordinary` | `ordinary-eligibility`、`ordinary-validity`、`online-application` | SRC-110 第26条；SRC-442 第23条第1項；SRC-116 普通说明；SRC-461 办理手续；SRC-455 在线范围。 |
| `deemed` | `deemed-eligibility`、`deemed-validity` | SRC-110 第19条の3、第20条第6項、第26条の2；SRC-440 第29条の4；SRC-442 第23条第2項；SRC-116 Q57–61。 |
| `refugee-travel-document` | `refugee-document`、`refugee-document-validity` | SRC-110 第61条の2の15；SRC-461 难民旅行证件。 |

### 来源与待确认事项

新增 **SRC-440–462** 和 **PD-360–379**。沿用 SRC-110–119 的日本法条、指南、手续及适用说明。新增登记涉及 64 份快照，其中在线范围 PDF 复用仓库同哈希文件；每份快照的原网址已在登记备注列明。新增网址按既有全站 `sourceUrls` 索引登记，英国政策页的全站来源清单相应显示 23 条新增链接。各条按递交日适用的现行或已公布规则判断。

| PD | 何时仍为 `UNKNOWN` |
|---|---|
| 360 | 日本国利益及生活本拠的个案权重，未见主管判断。 |
| 361–363 | 独立生计和世带收入基准、改定日前申请的在审情况、年金与资产公式、公共负担范围及人道评估缺少证据或公开标准。 |
| 364 | 永住日语等效、生活规则指定评估、帰化日语和面谈的统一认定、个案例外及费用未公布。 |
| 365–368 | 刑事及少年或境外记录分类、迟缴迟报后果、健康与上陸拒否、经管过渡或其他资格实体条件须主管核定。 |
| 369–373 | 最长期间过渡处分日不明、保证及替代文件未认可、就学等效未知、减额或附加费无决定、出生或收养例外、国籍法第6条第2号境外出生分支不明。 |
| 374–375 | 保护身份、指定计划或地区贡献未核；人才历史证据缺失、未确认持续达标、早于已存积分表版本、合格报酬或等效资格待确认。 |
| 376–378 | 帰化个案的刑事和安全、外国法能力、住房生计、旧籍保留例外或特别功劳与国会承认，证据缺失。 |
| 379 | 再入国的有效期证明、延期或归属领区的费率须核对。 |
| 130–139、160–161 | 继续保留原时间歧义，包括计日、出境、生日附近改法、新生儿离境、在籍年限与简易帰化运用范围。 |

## 2. 怎么验证的

- `pnpm --filter @uk-immigration/engine test test/japan-full.test.ts` 覆盖接受、明确不满足与待确认结果，含旧引擎八条永住时间路径的跨版本逐项比较，以及帰化配偶者在境外时的原时间状态及最早日期比较。
- `pnpm --filter @uk-immigration/policy-data test test/sources.test.ts` 核对导出参数的来源 ID 和定位。另按调研的 `sources.sha256` 校验 64 项新增登记和 17 个本仓库复用快照，校验文件、档案、登记表的哈希及网址映射。
- `git diff --check`，并检查旧日本引擎及其测试的 diff、网页改动范围。
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0，使用 `VITEST_MAX_WORKERS=2` 控制本机测试并发。共 5,320 项测试通过，既有文案导出测试跳过 1 项。日本新增 80 项，新旧日本引擎合计 167 项通过。构建导出 27 个静态页面。回读英国政策页静态产物核对 23 条新增来源链接。

## 3. 没做或没验证的

页面接入、页面交互与部署属于后续任务。当前工作树留给 Fable 分组提交，验证基线为 `f82a0d6`。核对到 `origin/main` 的任务 79 已改动旧日本引擎和断言的两处用语，合入时保留该改动。主管部门尚未公布的基准及认可方法保留上述待确认状态。高度人材的早期历史日期需要该日的官方确认积分，当前参数表用于收录版本之后的原始条件计算。在旅客的在留历史里，重新上陆的日期仍由请求方输入，与原日期引擎现有的出入境数据契约衔接。

## 4. 发现与建议

任务 101 的表单需要以下新问题，未知或跳答应保留空值。

1. **申请及在留。** 选择申请目标、递交日及申请时在日或境外。问当前在留资格细类、原授予期间、到期日、是否已及时申请续期、旧三年许可与 2027 年切换日的关系、是否首次递交与处分日期。区分改定日前在审、审批日期和费率收件日期。问居住或资格区段、在留活动、担保人和可出具材料。
2. **共同家庭及公共义务。** 问实际婚姻起点、结婚登记、配偶或父母在相应日期的国籍和在留身份、亲生或收养情况。问同住共财、境外受扶养亲属、每项合格收入、预计年金和长期资产。纳税、年金、医保分别问是否依法豁免、按期、迟缴后缴清或仍欠缴。问入住和申报日期、在留卡或变动申报、官方品格和健康结论、生活保護及人道减额。一体卡可能有两项费用，分开采集。
3. **语言与就学。** 询问永住 B1 的入管认可、学年与教育期间、人才和照护豁免，制度理解确认另问。帰化分别问会话、阅读、写作，再问法务局认可与面谈状态。询问适龄的本人及受养育子女的通学和替代安排。
4. **路径专用。** 高度人材问当前日与回溯基准日的制度类型和证据、认定日期、维持、报酬、活动、年龄、学历、经验和加分材料；J-Skip 另用学历或经验与合同报酬。问保护认定与正式推荐、机构和告示活动、贡献类别及主管认可。出生路径问出生时国籍、父母身份、出生届、是否经上陆或已有身份、拟停留及出境许可。归化问住所和居所的不同起点、外国法行为能力或收养时是否未成年、外国国籍丧失与次序、申请人或代理、曾失日本籍、出生无国籍、特别功劳及国会批准。
5. **出入境和费用。** 问是否属特別永住者、原许可与延期的实际日期、单次或多次及曾使用次数、证件与出境表明、普通再入国的法定限制、现有在留的到期或续期决定、证件遗失与新上陆、领区及收费日。结果页可同时展示各条件、原时间结果、费用和 `applicable`，作为对比页稳定的数据入口。

## 审核修正（review91-1）

### 1. 做了什么

第 743 项建议提交为 `Fix: 修正日本完整版永住、归化与再入国判断（review91-1）`，尾注为 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

| 复现输入 | 修正结果与来源 |
|---|---|
| 2012-04-01 起连续在留，2022-04-01 起持企業内転勤，2027-04-01 评估，省略 `newStatusStart` | 连续在留为 `MET`，合资格在留及完整路径为 `NOT_MET`，递交日期留空。旧版仍可计入企業内転勤。SRC-113 1(3)ア，SRC-114 第2の4(2) 注2 p5、第2の5(6) p7。 |
| 2027-04-03 周六评估一般永住，省略 `applicationDate` | 路径为 `MET`，`timeEarliestDate` 为 2027-04-03，`earliestDate` 为 2027-04-05。顺延后复核开放当天的递交条件。条件或窗口开放日无法确认时，递交日期留空，窗口日期待确认记入 PD-370。SRC-112 行政機関の休日に関する法律第1条，SRC-119「受付時間」。 |
| 普通永住者 2026-11-23 出境、2027-01-04 返回，证件及申明齐备，省略原授予月数 | `deemed-eligibility`、`return-continuity` 及路径均为 `MET`。SRC-440 別表第2「永住者」，SRC-116「みなし再入国許可」。 |
| 2027-03-01 发生搬家或所属机构变更，2027-04-01 评估时未提供申报日 | 两类条件各自为 `UNKNOWN`，见 PD-366。填入逾期日期或明确未申报且超过期限时为 `NOT_MET`。SRC-110 第19条の7–16，SRC-114 第2の5(2) p6。 |
| 2027-04-01 评估日本出生、现持 `prFamily` 的永住者子女，养育方达到 B1，本人未达 B1 | `child` 接受 `bornInJapan`，日语因素标记 `applicable: false`。SRC-114 第2の5(8) p8。 |
| 簡易帰化第6条第2号的申请人在境外出生、在日本有合法住所，生父母出生地未填 | `jp.nat.japan-birth` 为 `UNKNOWN`，继续引用 PD-373。SRC-111 第6条第2号，SRC-460 p3。 |

PD-370 的保证人问答改为 SRC-116 Q53。

### 2. 怎么验证的

- `pnpm --filter @uk-immigration/engine test test/japan-full.test.ts` 先在修正前复现审核中的错误。新增 8 项回归测试，并在既有归化测试中补充生父母出生地留空的断言。覆盖条件状态、完整路径、窗口日期及待确认事项。
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码为 0。全量测试 5,328 项通过，既有文案导出测试跳过 1 项，构建生成 27 个静态页面。
- `git diff --check` 通过。旧版 `evaluateJapan` 的日历判断提为共用函数，逐项核对其余代码并通过旧版日本时间引擎测试，计算输出保持原有口径。

### 3. 没做或没验证的

改动留在当前工作树，交由 Fable 提交。页面接入及线上验证属于后续任务。

### 4. 发现与建议

- 直接把 `CountryCheck.status` 加入 `NOT_APPLICABLE` 会使英国 What-if 的状态映射与测试无法通过 TypeScript 检查。页面任务应先按 `applicable: false` 显示“不适用”，并从已满足及待确认的计数中排除。若要扩展通用状态，由页面任务一并更新结果与对比视图的映射。
- 表单为 `child` 采集 `bornInJapan`；为地址和所属机构申报区分已申报的日期、明确未申报（`notifiedOn: null`）和情况未知（省略 `notifiedOn`）。普通永住者填 `stayIndefinite: true` 即可表达无限期在留。

## 第二轮审核修正（review91-2）

### 1. 做了什么

第 744 项建议提交为 `Fix: 修正日本归化递交日及永住顺延和长出境判断（review91-2）`，尾注为 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

| 复现输入 | 修正结果与来源 |
|---|---|
| 一般归化正例于 2027-04-03 周六模拟，省略 `applicationDate` | `domicile-years`、`filing-in-japan` 及路径为 `MET`。`timeEarliestDate` 保留 2027-04-03，`earliestDate` 为 2027-04-05，实际递交日由管辖法务局安排。完整版归化与永住共用窗口日历。窗口开放情况待确认时留空递交日期，见 PD-370。SRC-112 行政機関の休日に関する法律第1条第1項，SRC-117 Q10。 |
| 一般永住正例于 2012-04-01 开始在留，2021-05-01 至 2021-12-01 持有效普通再入国许可出境，2027-04-01 评估时国益及出境理由认定留空 | 连续在留、合资格在留和累计出境为 `MET`。单次出境及路径为 `UNKNOWN`，递交日期留空。入管明确认定无合理理由时，这两项可为 `NOT_MET`。入管认可理由时，单次出境项为 `MET`，综合国益仍须单独确认。待确认项登记在 PD-360。SRC-114 第2の5(6) p7，SRC-115 第48号 p5，SRC-116「再入国許可」。 |
| 一般永住在 2027-04-03 周六评估，在留于 2027-04-04 届满且未申请续期 | 用 2027-04-05 检查到期和合法在留。`lawful-filing-status` 及路径均为 `NOT_MET`，递交日期留空，时间达标日仍为 2027-04-03。同时覆盖原日填 `status.valid: true` 和省略该项的情况。已知顺延日人在境外时，`filing-in-japan` 和 `lawful-filing-status` 也为 `NOT_MET`。SRC-110 第20条第6項，SRC-119「申請期間」「受付時間」。 |

### 2. 怎么验证的

- 新增或加强的回归先复现 6 项断言失败。修正后运行 `pnpm --filter @uk-immigration/engine test test/japan-full.test.ts test/japan.test.ts`，日本完整版及旧时间入口合计 181 项通过。
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全量测试 5,334 项通过，既有文案导出测试跳过 1 项，构建生成 27 个静态页面。全量引擎测试结束后移除了重复的出境来源引用，随后重跑上述 181 项日本测试及 engine 的 lint、typecheck，最终代码纳入全量构建。
- `git diff --check` 通过。核对 `japan.ts`、旧日本时间测试和 Web 没有差异。

### 3. 没做或没验证的

改动留在当前工作树，由 Fable 提交。页面接入及线上验证留给后续任务。

### 4. 发现与建议

- 交给页面任务 101。普通永住者于 2027-04-05 模拟、计划 2027-04-19 出境和 2027-04-26 返回时，若把出境时的返日表明预填为已完成，当前 `jp.reentry.deemed` 会给出模拟日 2027-04-05 作为 `earliestDate`。表单应区分计划行程和已发生的出境事实，只在当事人确认已在出境时表明返日意图后传入已完成证据。计划场景的结果文案应按拟出境日展示，并提示届时办理。SRC-110 第26条の2第1項，SRC-116「みなし再入国許可」。
- 永住表单可记录长出境的理由和入管的判断。`absenceReasonsConfirmedReasonable` 在入管认可时为 `true`，明确不认可时为 `false`，尚未核定时留空。录入海外派驻等理由时，继续等待个案判断。

## 第三轮审核修正（review91-3）

### 1. 做了什么

第 745 项建议提交为 `Fix: 修正普通再入国许可窗口递交日期（review91-3）`，尾注为 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

普通再入国许可窗口渠道与永住、归化共用窗口日历。候选日确定后，用该日检查是否赶得上出境，并按候选递交日核对手续费用。符合条件的在线渠道按原申请日评估。来源为 SRC-461 再入国許可申請「申請期間」「受付時間」「オンライン申請」及 SRC-112 行政機関の休日に関する法律第1条第1項。窗口开放情况待确认时见 PD-370，实际受理时段由管辖入管官署确认。

| 模拟输入 | `ordinary-eligibility` | 路径状态 | `earliestDate` |
|---|---|---|---|
| 2027-04-03 周六走窗口，2027-04-12 出境 | `MET` | `MET` | `2027-04-05` |
| 2027-04-03 周六走窗口，2027-04-04 出境 | `NOT_MET` | `NOT_MET` | 留空 |
| 2027-04-03 周六在线随符合条件的在留申请递交，2027-04-04 出境 | `MET` | `MET` | `2027-04-03` |
| 2028-03-18 周六走窗口，候选平日是否闭厅待确认，2028-03-24 出境 | `UNKNOWN` | `UNKNOWN` | 留空 |

逐项核对了完整版递交入口。永住和归化已有窗口顺延。みなし再入国是在出境时表明返日意图，难民旅行证件路径评估持已签发证件往来，两者均无本次所涉窗口递交。SRC-116「みなし再入国許可」，SRC-461「難民旅行証明書（入管法第61条の2の15）」。

### 2. 怎么验证的

- `pnpm --filter @uk-immigration/engine test test/japan-full.test.ts -t 'checks ordinary'` 在修正前复现三种窗口断言失败，在线用例通过。
- `pnpm --filter @uk-immigration/engine test test/japan-full.test.ts test/japan.test.ts` 合计 185 项通过，包含旧时间入口的回归。
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码为 0。全量测试 5,338 项通过，1 项既有测试跳过。构建生成 27 个静态页面。
- `git diff --check` 通过。`packages/engine/src/japan.ts`、旧时间入口测试及 Web 源码无差异。

### 3. 没做或没验证的

改动留在当前工作树，由 Fable 提交。页面接入及线上验证归后续任务。

### 4. 发现与建议

- 高度人材永住使用与日期绑定的积分证据。审核例中，`hsp70` 的 80 分证据对应 `2027-04-03`。窗口顺延到 `2027-04-05` 后，缺少当天积分证据时，积分条件和路径为 `UNKNOWN`，`earliestDate` 留空。用周一有效证据直接评估时为 `MET`。
- 交给页面任务 101。在 `2027-04-05` 模拟 `2027-04-19` 出境时，如果把 `declaredIntentAtDeparture` 预填为 `true`，みなし再入国会返回模拟日 `2027-04-05`。页面应区分拟出境与已在出境时表明返日意图，仅在确认已完成表明后传入该事实。SRC-116「みなし再入国許可」。

## 第四轮审核修正（review91-4）

### 1. 做了什么

第 746 项建议提交为 `Fix: 按可用渠道确认普通再入国递交日（review91-4）`，尾注为 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

普通再入国未选渠道时，已确认在线资格则可按在线渠道确定最早递交日，明确不符合在线资格时则按窗口日历顺延。其余条件满足而在线资格待确认时，路径为 `UNKNOWN`，`earliestDate` 留空。采用这一口径是因为若后来确认可以同时在线申请，可能有比窗口受理日更早的日期。最早可考虑的递交日与出境日相同时，日级输入无法判断当天能否先递交，递交条件同样为 `UNKNOWN`，`earliestDate` 留空。候选日晚于出境日时，递交条件为 `NOT_MET`。待确认情形记入 PD-370。依据为 SRC-461 再入国許可申請「申請期間」「受付時間」「オンライン申請」、SRC-455 在线范围 PDF p1 和 SRC-112 行政機関の休日に関する法律第1条第1項。 [出入国在留管理庁办理说明](https://www.moj.go.jp/isa/immigration/procedures/16-5.html)

逐项复核三处窗口日历入口。永住和归化均按窗口日历处理，在线资格判断只用于普通再入国。永住依据 SRC-119「受付時間」及在线范围 PDF p1，归化依据 SRC-117 Q10 和 SRC-112 行政機関の休日に関する法律第1条第1項。 [永住申請手续](https://www.moj.go.jp/isa/applications/procedures/16-4.html) · [国籍 Q&A](https://www.moj.go.jp/MINJI/minji78)

### 2. 怎么验证的

- `pnpm --filter @uk-immigration/engine test test/japan-full.test.ts -t 'checks ordinary'` 在修正前复现三项失败，分别为未选渠道且在线资格明确不满足、在线资格未知、窗口顺延至出境当天。
- `pnpm --filter @uk-immigration/engine test test/japan-full.test.ts test/japan.test.ts` 共 189 项通过。回归覆盖留空渠道的在线资格三态、出境当日，且保留显式在线申请的周六用例和永住、归化的窗口顺延用例。
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码为 0。全量测试 5,342 项通过，1 项既有测试跳过。构建生成 27 个静态页面。
- `git diff --check` 通过。核对旧时间入口 `evaluateJapan` 及其测试、永住与归化窗口逻辑、Web 源码均无差异。

### 3. 没做或没验证的

改动留在当前工作树，交由 Fable 提交。页面接入和线上验证由后续任务处理。

### 4. 发现与建议

- 交给页面任务 101。高度人材永住的积分证据与日期绑定。窗口顺延后，界面应提示用户补充对应候选递交日的证据。审核例中的 `hsp70` 证据只对应周六，周一候选日的条件为 `UNKNOWN`，递交日期留空。使用周一有效证据直接评估时为 `MET`。SRC-114 第3の6–8，PD-375。
- 交给页面任务 101。みなし再入国应区分拟出境行程和实际出境。仅在当事人确认出境时已表明返日意图后传入 `declaredIntentAtDeparture: true`，避免预填将拟出境情景显示为已满足。SRC-116「みなし再入国許可」。 [出入国在留管理庁みなし再入国说明](https://www.moj.go.jp/isa/immigration/procedures/minashisainyukoku_00001.html)

## 第五轮审核修正（review91-5）

### 1. 做了什么

第 747 项建议提交为 `Fix: 恢复普通再入国窗口开放日的递交判断（review91-5）`，尾注为 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

普通再入国的渠道和在线资格留空时，先查原候选日的窗口日历。候选日已知开放、早于出境日且其余要求满足时，`ordinary-eligibility` 和路径均为 `MET`，`earliestDate` 保留当天，`online-application` 单独显示为 `UNKNOWN`。窗口已关闭或开放情况待确认时，在线资格未知仍可能影响最早递交日，按 PD-370 留空日期。显式选择窗口或明确不符合在线资格时，继续按窗口日历顺延。候选递交日与出境日相同时，仍需确认当天能否先递交。依据为 SRC-461「申請期間」「受付時間」「オンライン申請」及 SRC-112 行政機関の休日に関する法律第1条第1項。 [出入国在留管理庁办理说明](https://www.moj.go.jp/isa/immigration/procedures/16-5.html)

### 2. 怎么验证的

- `pnpm --filter @uk-immigration/engine test test/japan-full.test.ts -t 'checks ordinary'` 在修正前复现周一用例的 `UNKNOWN`，原有 8 个用例通过。
- `pnpm --filter @uk-immigration/engine test test/japan-full.test.ts test/japan.test.ts` 共 190 项通过。周一用例确认 `ordinary-eligibility` 和路径均为 `MET`，最早递交日为 `2027-04-05`，在线资格为 `UNKNOWN`。现有周六、窗口顺延及出境当天用例均通过。
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全量测试 5,343 项通过，1 项既有测试跳过，构建生成 27 个静态页面。
- `git diff --check` 通过。旧时间入口 `evaluateJapan`、共用窗口日历、旧时间测试及 Web 源码均无差异。

### 3. 没做或没验证的

改动留在当前工作树，由 Fable 提交。页面接入和线上验证由后续任务处理。

### 4. 发现与建议

- 高度人材积分证据与窗口顺延叠加时，结果偏保守。第五轮审核中，`hsp70` 的 80 分证据只对应 `2027-04-03`，窗口顺延到 `2027-04-05` 后返回 `UNKNOWN`，日期留空。提供周一有效的同等证据时，返回 `MET` 和 `2027-04-05`。页面任务 101 可提示补充候选递交日的证据。SRC-114 第3の6–8，PD-375。
- みなし再入国仍受未来行程预填影响。第五轮审核中，`2027-04-05` 模拟、拟于 `2027-04-19` 出境，预填 `declaredIntentAtDeparture: true` 会返回 `MET` 和模拟日，省略该字段则返回 `UNKNOWN`。任务 101 接入时，应在确认申请人已于出境时表明返日意图后传入 `true`。SRC-116「みなし再入国許可」。 [出入国在留管理庁みなし再入国说明](https://www.moj.go.jp/isa/immigration/procedures/minashisainyukoku_00001.html)
