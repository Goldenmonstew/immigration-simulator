# 任务 91 · 日本完整版规则引擎

## 1. 做了什么

| PROGRESS | 建议 commit message | 交付文件 |
|---|---|---|
| 740 | `Docs: 登记日本完整版官方来源与待定细节` | `docs/SOURCES.md`、`docs/pending-details.md`、`policy-sources/` 本次新增快照、`apps/web/lib/sources.ts`、`PROGRESS.md` 第 740 项 |
| 741 | `Feat: 加入日本永住归化与再入国政策参数` | `packages/policy-data/src/{index.ts,parameters/japan-2026-11.ts}`、`PROGRESS.md` 第 741 项 |
| 742 | `Feat: 实现日本永久居留归化与再入国逐项评估` | `packages/engine/src/{index,japan-full,japan-full-pr,japan-full-naturalisation,japan-full-reentry,japan-full-shared,japan-full-talent}.ts`、`packages/engine/test/japan-full.test.ts`、本报告、`PROGRESS.md` 第 742 项 |

各提交尾注为 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

`evaluateJapanFull(request)` 返回符合 `CountryResult` 的 `JpFullResult`。列 ID 为 `jp.current-law-2026-11`，一份请求可针对同一申请人评估多个所选入口。中英文共用路径和条件 ID。结果里 `kind` 区分适用要求、审查因素和提示，`applicable: false` 标明不适用及原因。费用附可直接显示的币种和金额。在有确定不满足的适用要求时，路径为 `NOT_MET`，否则有待确认要求则为 `UNKNOWN`，全部适用要求满足才为 `MET`。综合国益与融和仍依官方认定。旧入口的时间状态及最早时间单列为 `timeStatus` / `timeEarliestDate`，`earliestDate` 只在完整评估满足时给出当前递交日。

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
