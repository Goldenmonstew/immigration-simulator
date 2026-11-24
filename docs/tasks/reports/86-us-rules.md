# 任务 86 · 美国完整版规则引擎

## 1. 做了什么

| PROGRESS | 建议 commit message | 文件 |
|---|---|---|
| 590 | `Docs: 登记美国完整版官方来源与待定细节` | `docs/SOURCES.md`、`docs/pending-details.md`、`policy-sources/` 本次 100 份美国快照、`apps/web/lib/sources.ts`、`PROGRESS.md` 第 590 项 |
| 591 | `Feat: 增加美国完整版政策门槛与费率参数` | `packages/policy-data/src/index.ts`、`packages/policy-data/src/parameters/united-states-2026-11.ts`、`PROGRESS.md` 第 591 项 |
| 592 | `Feat: 实现美国九条路径的全条件评估` | `packages/engine/src/index.ts`、`packages/engine/src/united-states-full/`、`packages/engine/test/united-states-full.test.ts`、本报告、`PROGRESS.md` 第 592 项 |

三组提交均使用 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。同一份 `PROGRESS.md` 按对应行分组提交。

`evaluateUnitedStatesFull(request: UsFullRequest): CountryResult` 输出一个 `us.current-law-2026-11` 列和请求选中的路径。检查项按 `locale` 输出标题和解释，附 SRC 定位；待确认时返回 `UNKNOWN` 与 PD。资格状态优先反映确定的不满足。仅时间未满且其余适用资格已确认时，才给出 `FUTURE` 和日期。费用是独立提示，即使有费额或减免待确认也可呈现资格结果。

一般入籍、公民配偶入籍、常规取消条件和绿卡离境时限沿用 `evaluateUnitedStates`。原时间检查及日期依据保留在结果中。完整版另核对 I-751 单独／豁免递交、纸质顺延及获准逾期等例外，并且独立核对有效回美证、SB-1 与入境审查。结果中的旧时间摘要可供用户回看各自的计数假设。

### 路径与稳定检查 ID

下表所有检查 ID 统一带 `US-` 前缀。每个路径另外附该案适用的费用与减免检查。具体出处定位见结果的 `checks[].sources` 和 `unitedStatesFullSources`。

| 路径 | 检查 ID 与来源 |
|---|---|
| P1 一般入籍 `US-NATURALIZATION` | `TIME-LPR`、`TIME-CONTINUOUS-RESIDENCE`、`TIME-PHYSICAL-PRESENCE`（SRC-079–081）；`C01-AGE`、`C02-LAWFUL-LPR`（SRC-290、081）；`C03-ENGLISH`、`C04-CIVICS`、`C05-N648`（SRC-291–292）；`C06-GMC`、`C07-PERMANENT-GMC-BARS`、`C08-STATUTORY-GMC-BARS`（SRC-079、293）；`C09-ATTACHMENT`、`C10-SELECTIVE-SERVICE`、`C11-MILITARY-BARS`、`C12-OATH`（SRC-294–296）；`C14-DISTRICT`、`C14-TRUTHFULNESS`、`C14-RESIDENCE-THROUGH-OATH`（SRC-079–081、290、293）。 |
| P2 公民配偶入籍 `US-SPOUSE` | P1 通用条件；`TIME-MARRIAGE`、`TIME-SPOUSE-CITIZENSHIP`、`C13-MARITAL-UNION`（SRC-079、081）。实际共同生活核对至递交。婚姻和配偶美国公民身份持续至宣誓。 |
| P3 取消条件 `US-CONDITIONS` | `TIME-CONDITIONS-FILING`（SRC-079–082）；`CONDITIONS-TYPE`、`CONDITIONS-SPECIAL-TIMING`（SRC-079、297–298）；婚姻 `C15-BONA-FIDE-MARRIAGE`、`C16-I751-FILING`（SRC-079、297）；投资 `C17-CAPITAL`、`C17-I829-PAPER`、`C17-JOBS`（SRC-079、298、302、307）。 |
| P4 绿卡维持与返美 `US-TRAVEL` | `TIME-TRAVEL`（SRC-079–080）；`C18-REGISTRATION`、`C19-ADDRESS`、`C19-REPLACEMENT`（SRC-299）；`C20-SEEKING-ADMISSION`（SRC-079）；`C21-DEPORTABILITY`（SRC-301）；`C22-RETURN-DOCUMENT`、`C22-RESIDENCE-INTENT`（SRC-080、300）；若触发寻求入境，附 `C36` 至 `C40`，按本次返美日评估。 |
| P5 亲属移民 `US-FAMILY` | `C23-RELATIONSHIP`、`C24-PETITION-BARS`（SRC-079、302）；`C25-SUPPORT-INCOME`、`C26-SPONSOR`、`C27-SUPPORT-EXEMPTION`（SRC-303–304）；同列核对 P7 适用的程序及准入条件。 |
| P6 职业投资 `US-EMPLOYMENT` | `EMPLOYMENT-CATEGORY`、`EMPLOYMENT-MARRIAGE-FRAUD`（SRC-302、306）；常规 EB-2/EB-3 `C28-OFFER-PERM`、`C29-ABILITY-TO-PAY`（SRC-302、305）；EB-1A/EB-2 NIW `C30-SELF-PETITION-EVIDENCE`、`C30-SELF-PETITION-MERITS`（SRC-302、306）；EB-5 `C31-INVESTMENT-AMOUNT`、`C31-INVESTMENT-PROJECT`、`C31-INVESTMENT-JOBS`（SRC-302、307）；Gold Card `C32-GOLD-PROCESS`、`C32-GOLD-GIFT`、`C32-GOLD-ALLOCATION`（SRC-308）；同列核对 I-864 适用性及 P7 条件。 |
| P7 境内调整或领馆 `US-ADJUSTMENT` | `C33-VISA-AND-ENTRY`、`C34-ADJUSTMENT-BARS`、`C35-DISCRETION`（SRC-309–310；C34–35 为境内）；`C36-HEALTH`（SRC-311–312）；`C37-PUBLIC-CHARGE`（SRC-311、313）；`C38-CRIMINAL-INADMISSIBILITY`、`C39-SECURITY`、`C40-IMMIGRATION-HISTORY`（SRC-311）；另列 `C25` 至 `C27`（SRC-303–304）。 |
| P8 难民或受庇护者转永居 `US-HUMANITARIAN` | `C41-HUMANITARIAN-PRESENCE`、`C41-HUMANITARIAN-STATUS`、`C42-HUMANITARIAN-WAIVER`（SRC-314）；另列 `C36` 至 `C40`，处理公共负担法定免除及可用和不可用的豁免。 |
| P9 军人入籍 `US-MILITARY` | `C43-SERVICE`、`C43-LPR-OR-ENLISTMENT`、`C43-CERTIFICATION`、`C43-FILING-BASIS`、适用时 `C43-LATE-RESIDENCE`（SRC-315）；通用入籍条件按和平期 INA 328 或敌对期 INA 329 调整年龄、居住与 GMC 期间。 |

| 费用用途 | 检查 ID | 来源 |
|---|---|---|
| 入籍 | `C44-N400`、`C44-N336` | SRC-316 |
| 取消条件 | `C44-I751`、`C44-I829` | SRC-316、318 |
| 登记、换卡、出境和返美 | `C44-TRAVEL-FORM`、`C44-I90`、`C44-I131`、`C44-I131A`、`C44-DS117`、`C44-SB1-IV`、`C44-AR11`、`C44-G325R`、`C44-ADVANCE-PAROLE`、`C44-REFUGEE-TRAVEL` | SRC-299、316–317 |
| 亲属担保与职业／投资申请 | `C44-I130`、`C44-I864`、`C44-I140`、`C44-I907`、`C44-EB5-PETITION`、`C44-I140G` | SRC-308、316–318 |
| 境内／领馆手续与减免 | `C44-I485`、`C44-I485A`、`C44-IMMIGRANT-VISA`、`C44-IMMIGRANT-FEE`、`C44-HR1`、`C45-FEE-RELIEF` | SRC-316–319 |

### 新来源、待定细节及 UNKNOWN

新增 SRC-290–319，网址加入全站共用的 `sourceUrls`。英国政策页底部沿用全站来源目录，因此显示新增美国链接。英国与美国计算器的现有规则及接线沿用原实现。沿用 SRC-079–082 的法典、法规、Policy Manual 与 USCIS 表单、事实单和时间依据。新增 PD-260–279，档案的 PD-US-01–14 依次对应 PD-260–273。既有 PD-092–096 继续用于已有日期算法。

- `C01–C16`、`C18–C24`、`C34`、`C40–C43` 的未填日期、身份、关系或法律结论按相关 PD 返回 `UNKNOWN`。包括连续居住至宣誓、原始获卡／递解案卷、Selective Service 及军人入籍的军方证明。
- `C03–C12` 的考试、N-648、品格全貌、法定罪名、福利与扶养、未登记的主观原因、宣誓修正等须用相应考试、专业证据或主管机关结论。重考通知日、DUI 推定及福利审查见 PD-262–263、269、271、275。
- `C17`、`C25–C31` 的合理就业时间与区域中心模型、收入或豁免证据、招聘、支付能力、EB-1A 终局审查及 NIW 国家利益可由相应证据确认。EB-5 调整日后的实际最低投资额仍待公报确认。见 PD-260、264、276–278。
- `C32` 的分类／排期属 PD-266。随行配偶或子女赠与的确定金额见下方审核修正。`C33` 的未来 Visa Bulletin 与 CSPA 见 PD-272。`C35–C42` 的裁量、公共负担、医学、刑事、安全与人道豁免按个案审定，见 PD-261、269–270、273–275。
- `C44–C45` 的表单、付费渠道、I-485 网申开放和实际减免证据取决于申请资料。EB-5 已公布的费率按生效日切换。见 PD-265、267、276。

## 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。5,356 项测试通过，既有文案导出用例按环境变量条件跳过 1 项。policy-data 的 23 项测试通过，包含来源一致性测试。构建导出 27 个静态页面。首轮既有随机时间线测试超时，后续完整运行通过。
- 美国新旧专项共 122 项通过。新增测试覆盖两种语言的条件、路径组合判定以及手算门槛。包括提前递交、兵役审查、题库版本、I-751 窗口和豁免、全日在境外、担保与资产、PERM 有效期、245(k)、非法居留离境禁令及各费率切换。
- 逐份核对入库快照的 SHA-256 与调研清单，100 份一致。校对 17 份 PDF 的直达网址映射、新 SRC 和 PD 无重号、`apps/web` 改动仅为来源网址。
- 静态产物逐字对比：`/united-states` 的 `<main>` 一致，`/uk/policy` 的 `<main>` 仅新增共用目录的 30 条美国链接。
- `git diff --check` 通过。核对旧 `packages/engine/src/united-states.ts` 和原测试的 diff 为空。

## 3. 没做或没验证的

- 工作树交 Fable 提交。未运行浏览器 e2e、视觉验收、开 PR 或发布。
- 签证排期与个案证据采用调用方输入。页面须提供适用月份及口径所需的信息。CDC 技术指引原始抓取受阻，年龄和剂量采用医生的适用疫苗评估结果。
- 法规和说明书使用档案指定的 2026 年 11 月快照。域外判例、具体州罪名、律师或主管机关裁量及将来公告无法由现有参数推算。

## 4. 发现与建议

页面任务 96 可按以下顺序提问，并为条件提供明确的「否／不适用／还未确认」选项。

1. **路径与时间**。选择九条路径之一，并选择版本细分（I-751/I-829、亲属或职业类别、境内/领馆、难民/庇护、和平/敌对期服役）。收集拟递交日、出生日期、取得身份日、州／USCIS 辖区起住日、出境与返美日。返美个案证件及准入资料适用于最后一次返美。
2. **入籍与军人例外**。问卷要问在美累计 LPR 年数，英语及公民考试结果，年龄例外和 N-648 是否获批免除哪项，婚姻与公民身份持续情况，居住与 GMC 至宣誓，Selective Service 登记和豁免，宪法依附与党籍，效忠宣誓和修正。军人另问认证的荣誉服役时段、退役日、N-426／DD-214／NGB-22、入伍地点、面谈 LPR 及适用的居住抵算。
3. **身份维持与取消条件**。确认婚姻成立日、善意婚姻证据和递交方式，具体豁免或正当逾期理由、子女单独递交、最终递解令、投资法版本及持续在险和就业。问登记凭证、地址报备日期、绿卡有效／换卡、口岸触发因素、DHS 境内递解及保留美国住所意图。回美证另问在美提交与录指模、签发／有效日。SB-1 另问非自愿滞留证据。
4. **家庭、雇主和资金**。问亲属身份与关系、收养／继亲年龄、CSPA 结论、前婚记录和 Adam Walsh；I-864 的担保人身份、年龄、美国 domicile、人口、资格收入、净资产、社保季度或法定豁免、共同担保。职业问永久全职邀约、PERM 或 Schedule A、逐年工资差额及税务或净流动资产、EB-1A 认可证据、NIW 三项、EB-5 合资格本金与资金来源、区域中心与就业，或 Gold Card 登记、赠与方、人数、资金及领馆计划。
5. **准入和体检**。问最近查验入境／假释、调整禁令与按最近一次合法入境计算的累计违规天数、排期交件和核准状态、GMC 与刑事罪名分类、公共福利时间点、Class A 及疫苗记录、I-693 当前有效性、国家安全、非法居留离境或再入境。缺乏法律分类或个案结论时先显示 `UNKNOWN`。
6. **费用**。问表格、纸申／网申、交件或邮戳日、I-485 网申类别及随父母递交、费率和减免的适格证明、I-140 雇主规模和加急、EB-5 初始／修改、必要的领馆费用与适用 H.R. 1 附加费。费用解释与资格状态分别展示。

法律依据对照了正式快照，采用配偶递交日前同住规则、难民／庇护裁决时满足在美时间规则、EB-5 手册卷 6 G.7 的 I-829 章节，以及指定敌对期表。页面应分别展示担保人 domicile、地址变更、登记及准入体检；这些规则未形成独立的通用住房面积或医疗保险保单门槛。

## 审核修正（review86-1）

### 1. 做了什么

PROGRESS 593 建议统一提交为 `Fix: 修正美国九条路径的递交与核准规则（review86-1）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

完整版路径 `status` 和 `earliestDate` 表示递交评估，返美路径仍表示返美评估。`approvalStatus` 表示按所填事实评估的核准条件。混合条件通过 `checks[].filingStatus` 显示递交状态，`NOT_APPLICABLE` 表示该条件只在核准时使用。`C05-N648` 单列免试判断，能否满足考试要求由 C03 和 C04 各自评估。费用保持独立。

| 路径 | (a) 递交与裁决 | (b) 纸质收件 | (c) 缺少结论／(d) 门槛 |
|---|---|---|---|
| P1 一般入籍 | C02 区分待决的移除条件申请与入籍核准，C03、C04、C12、C14 的考试、宣誓与持续居住按核准阶段评估，C05 单列。 | N-400 纸质收件取工作日，N-336 费用按渠道独立估算。 | 待决 I-751／I-829 挂 PD-274。合资格 N-336 的 I-912 豁免为 USD 0（SRC-316 p30）。 |
| P2 公民配偶入籍 | 沿用 P1。C13 将递交前同住与婚姻及公民身份持续至宣誓分别评估（SRC-290，12 USCIS-PM G.2）。 | N-400 纸质收件取工作日。 | C02 与 C13 缺少结论挂 PD-274。 |
| P3 取消条件 | I-751 面谈结论归核准阶段。I-829 核对实际持续投资、合资格就业及例外（SRC-298）。 | 联名、单独、豁免、获准逾期 I-751 与 I-829 共用收件日历。窗口截止日纸申可顺延，网申采用当日截止（SRC-081）。 | 逾期理由留空或待决时为 `UNKNOWN`，挂 PD-094、PD-274。 |
| P4 绿卡维持与返美 | 证件及口岸准入以返美时的事实评估。 | 返美日期按行程。换卡、回美证等表单费用单列。 | DS-117 的 USD 180 单独引用 SRC-317，22 CFR §22.1 第 35(a) 项。 |
| P5 亲属移民 | C33 区分递交和裁决的签证可用性。 | USCIS 纸质件取工作日。领馆按 NVC 通知提交材料。 | 美国公民未婚子女的锁龄缺失并可能改变排期结论时为 `UNKNOWN`，挂 PD-272。I-864 现役收入优惠按配偶或未婚未满 21 岁子女适用（SRC-303）。 |
| P6 职业投资 | C28 按 I-140 收件日核对 PERM。C30 区分递交事实和自申终审。C33 检查两阶段排期。C32 的法定分类和排期归核准阶段。 | USCIS 纸质件取工作日。I-140G 采用网申。 | 确认已批准的 I-140 后，缺历史收件日的 C28 挂 PD-277。初次 EB-5 使用预计在险期和有据招聘计划，缺依据挂 PD-278。Gold Card 的随行赠与按每人 USD 1,000,000 计算，分类／排期疑问挂 PD-266（SRC-308 p3 Items 1–3）。 |
| P7 境内调整或领馆 | C33 区分两阶段排期，C35 裁量和 C37 公共负担结论归核准阶段。C34 应用 SIJ 身份中断及相关就业违规例外，并分别检查其他禁令（SRC-309）。 | 境内纸质 I-485 取工作日。领馆材料按 NVC 流程提交。 | 家庭案沿用 P5 的 CSPA 与 I-864 判断。 |
| P8 难民或受庇护者转永居 | C41 的实际在美天数、庇护裁量及 C42 豁免结论按裁决阶段评估（SRC-314）。 | 纸质 I-485 取工作日。 | 缺少裁决事实挂 PD-274、PD-275。 |
| P9 军人入籍 | 沿用通用入籍阶段判定。C43 区分提交军方证明、面谈时的 LPR 条件和背景调查。 | 纸质 N-400 取工作日。 | 待核军方、身份及背景结论挂 PD-279。 |

补入 PM-602-0201（SRC-293）及 12 USCIS-PM G.2（SRC-290）快照。更新 SRC-292 的 N-648 定位及 SRC-305、307、308、309、316、317 的具体章节、表项或页码。PD 的更新沿用 PD-260–279 段。

### 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。5,369 项测试通过，1 项既有条件用例跳过。policy-data 来源一致性测试通过，构建生成 27 个静态页面。补充双表待定边界后重启过验收，最终一轮使用默认 worker 数。
- 美国新旧专项 135 项，覆盖审核中的七个复现及风险项，检查条件状态、递交／核准状态、最早递交日和待定项。纸质案例覆盖周末、联邦假日、截止日顺延以及单独／豁免渠道。
- 两份补入快照的 SHA-256 与调研清单一致。`git diff --check` 对源代码与文档通过。官方 HTML 快照含原始尾随空白，按调研清单的哈希保留原文件。

### 3. 没做或没验证的

- 按本轮交接要求，改动留在 `fable/86-us-rules` 工作树。页面接线、浏览器 e2e、PR 和部署由后续交接处理。
- `approvalStatus` 使用调用方提供的裁决阶段资料。具体面谈、核准日期及未来排期由主管机构决定。旧 `evaluateUnitedStates` 的日历算法仅提取为共用函数，旧入口的行为由原测试验证。

### 4. 发现与建议

接入问卷时按实际收件日询问适用的递交排期，并独立询问预计裁决时的 Final Action Dates 和在美天数。条件居民要区分待决且身份有效、已移除及查不到状态。已递交的职业案要记录 I-140 收件日及状态。EB-5 初次申请要收集预计持续在险总年限及招聘计划证据，I-829 问卷继续收集实际记录。

## 第二轮审核修正（review86-2）

### 1. 做了什么

PROGRESS 594 对应建议提交 `Fix: 修正美国九路径的核准日期、收件与豁免判定（review86-2）`。

完整版的 `status` 和 `earliestDate` 仍描述递交或返美。`approvalStatus` 以模拟日评估核准条件。仅缺可计算的时间时返回 `FUTURE`，`approvalEarliestDate` 取最早收件日与所有适用核准时间条件的最晚日期。个案结论缺失时为 `UNKNOWN`，明确阻却条件未通过时为 `NOT_MET`。两种情况均省略最早核准条件满足日。

| 路径 | 第二轮核对 |
|---|---|
| P1 一般入籍 | N-400 在提前递交窗口可递交，`TIME-LPR-APPROVAL` 等到完整法定居住期周年日。考试、宣誓、条件绿卡移除等核准结论继续独立评估。SRC-079 §1427(a)，SRC-081 12 USCIS-PM D.6(D)。 |
| P2 公民配偶入籍 | 同样核对完整 LPR 居住期，婚姻及配偶公民身份的递交条件仍单独评估。SRC-079 §1430(a)，SRC-081 12 USCIS-PM G.3、D.6(D)。 |
| P3 取消条件 | I-751 的面谈结论与收件窗口各自评估。I-829 已默认纸申，RIA 前的投资案在递交窗口内可提交持续投资证据，核准须等条件居留的持续投资期届满。合资格就业继续按实际资料及主管机关的例外结论评估。SRC-081 1 USCIS-PM B.6(E)，SRC-297，SRC-298 6 USCIS-PM G.7(A) 注 4。 |
| P4 维持身份与返美 | C18 登记及携证、C19 地址申报及换卡用 `informational` 标记。有效绿卡返美仍核对 C22，C20 触发的准入检查和 C21 的实际递解事由继续评估。SRC-299 §264.5(b)(2)，SRC-080 §211.1(a)(2)，SRC-079 §1101(a)(13)(C)，SRC-301 §1227。 |
| P5 亲属移民 | 受排期限制的境内 I-485 按顺延后收件月份取排期。即时亲属仍独立确认分类。SRC-309 7 USCIS-PM A.6(C)，SRC-302 §§1151、1153。 |
| P6 职业投资 | 境内 I-485 使用同一收件月份规则。EB-5 调整在渠道留空时默认纸申。I-140 历史收件日和 Gold Card 分类／排期各自保留。SRC-082 网申清单，SRC-305 PERM，SRC-308 I-140G，SRC-309 7 USCIS-PM A.6(C)。 |
| P7 境内调整或领馆 | C33 以 `visaAtFilingByMonth[YYYY-MM]` 读取境内收件月份。跨月缺该月资料时挂 PD-272。SIJ 和已确认网申关闭的类别在渠道留空时默认纸申。领馆用 NVC 通知，裁决排期独立采集。SRC-082 网申清单，SRC-309 7 USCIS-PM A.6(C)(4)–(5)。 |
| P8 难民或受庇护者转永居 | 未选渠道时采用纸件收件日。C41 在美时间以模拟日为准，累计不足时按此后持续在美推算。C36、C38、C39、C40 分别核对可豁免事由的材料和裁决，C42 记录豁免结论。毒品贩运、指定安全事由及所需医学证据仍单独核对。SRC-081 1 USCIS-PM B.6(E)，SRC-082 网申清单，SRC-314 7 USCIS-PM L.2(B)、L.3(C)–(D)、M.2(A)、M.3。 |
| P9 军人入籍 | 服役类别决定适用居住规则。已有面谈 LPR 和背景核查阶段区分，日期依据仍来自军方服务记录或个案居住抵算。SRC-315 12 USCIS-PM I.2–I.3。 |

按网申清单默认纸申的情形也包括明确申请 N-400 费减免的普通及配偶入籍。仍需确认网申资格的类别保留原渠道行为。PD-267、272、275、278 补记本轮待定项。

### 2. 怎么验证的

- 设置 `VITEST_MAX_WORKERS=2` 后，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,380 项测试通过，1 项既有条件用例跳过，policy-data 来源一致性检查通过，构建生成 27 个静态页面。
- 新旧美国引擎专项 146 项全部通过。回归断言递交状态、核准状态及日期，覆盖一般与配偶提前递交、RIA 前 I-829 的投资期、纸件周末收件、三个调整路径的跨月排期、返美义务和人道豁免。
- 修改前新增或更新的断言中，10 项复现原行为，另 1 项确认既有不可豁免事由仍阻却路径。
- `git diff --check` 通过。旧 `evaluateUnitedStates`、原测试和网页文件的 diff 为空。

### 3. 没做或没验证的

- 改动留在 `fable/86-us-rules` 工作树，交 Fable 提交。本次未跑浏览器 e2e，现有页面继续使用原时间入口。
- 可计算的核准条件满足日采用已填事实，具体审理和核准日取决于主管机关。RIA 后 I-829 的实际投资时间及就业例外按个案记录确认。

### 4. 发现与建议

页面接入时按 `YYYY-MM` 提供境内实际收件月的排期。旧 `visaAtFiling` 可用于模拟月或 NVC 通知。人道路径以模拟日累计在美天数，并分别采集 `waiverFiling` 和 `waiver`。已进入待决的豁免可作为已提交材料的证据。返美义务和最早满足核准条件的日期可独立展示。

## 第三轮审核修正（review86-3）

### 1. 做了什么

PROGRESS 595 对应建议提交 `Fix: 修正美国递交渠道、同时递交与裁决时点（review86-3）`。

| 路径 | 缺失值与默认行为核对 |
|---|---|
| P1 一般入籍 | C02 的准入与递解记录、C05 的残障申请资料、C06–C12 的品格和宣誓、C14 的辖区起住或面谈资料保留 `UNKNOWN`。C03／C04 遇未确认的适用豁免时保留 `UNKNOWN`。SRC-080 §§316.2(a)(5)、316.5(b)(1)(i)、334.2(b)，SRC-081 12 USCIS-PM D.6(D)，PD-096、PD-274、PD-275。 |
| P2 公民配偶入籍 | 同 P1 的辖区规则。C13 的同住和持续婚姻资料独立确认，提前递交仍检查配偶类本身的要求。SRC-079 §1430(a)，SRC-290 12 USCIS-PM G.2，PD-274。 |
| P3 取消条件 | C16 单独递交的子女缺父母和自身起算日且未确认单独递交资格时为 `UNKNOWN`，逾期原因及面谈待决仍各自核对。C17 的纸申只依据 I-829 的官方渠道。SRC-080 §216.4，SRC-082 联名递交事实单 p2、I-829 表格页，PD-274、PD-278。 |
| P4 维持身份与返美 | C18–C20、C22 保留证件与触发事实的缺失状态。C22 可使用明确的回美证有效性结论或可核算的起止日。C21 缺单项 CIMT 的事实或缺会改变期限的 S witness 例外资料时为 `UNKNOWN`。SRC-301 §1227(a)(2)(A)(i)，SRC-300 8 CFR 223.2、223.3，PD-269、PD-274。 |
| P5 亲属移民 | C23–C24 缺关系时均保留 `UNKNOWN`。C25–C27 按独立的担保证据判断。即时亲属和有名额的亲属优先 I-130 可进入同时递交判断。SRC-302–304，SRC-309 §245.2(a)(2)(i)、I-485 Instructions p17，PD-272、PD-274、PD-276。 |
| P6 职业与投资移民 | C27 只有低持股比例且未确认是否有亲属申请人时为 `UNKNOWN`。C28–C32 的 PERM、支付工资、自申和投资证据保留各自的待确认状态。I-140、EB-5 I-526／I-526E 按适用规则进入同时递交判断。Gold Card 分类及排期继续按 PD-266 核对。SRC-303、305–308，SRC-309 §1255(n)、§245.2(a)(2)(i)、I-485 Instructions pp19–20，PD-276–278。 |
| P7 境内调整或领馆 | C33 将基础请愿状态与排期分开。C36 缺适用的 I-693 或疫苗记录及 C38 缺贩运禁令结论时为 `UNKNOWN`。C36、C38–C40 的豁免仅作用于已确认需要豁免的事由，独立待确认资料继续待核。SRC-309 I-485 Instructions pp3、11、17–21，SRC-311–312，PD-272、PD-275。 |
| P8 难民或庇护转永居 | C36 的医学材料、C38 的贩运事由、C39 的安全类别、C41 的在美事实均独立核对。C42 已待决表示已提交豁免材料，核准待定，且仍须核对其他独立事由。SRC-314 8 U.S.C. §1159(c)、7 USCIS-PM L.3(C)–(D)、M.3，PD-274、PD-275。 |
| P9 军人入籍 | C43 缺荣誉服役、军种、退役、证明或背景结果时保留 `UNKNOWN`。法定免除仅由已确认适用的服役类别触发。SRC-315 12 USCIS-PM I.2–I.3，PD-279。 |

- **网申渠道。** 已明确选择但不可用的渠道返回 `NOT_MET`，省略两阶段日期。SRC-082 列出 I-485 开放类别与提交方式，故按用户所选渠道评估。渠道留空时仍可对确定只有纸申的类别使用纸件收件日历，周六模拟的最早纸件收件日为下一个工作日。明确选择 I-485 网申但缺少类别及提交方式确认时为 `UNKNOWN`。依据另见 SRC-081 1 USCIS-PM B.6(E) 和 PD-267。
- **同时递交与裁决排期。** 在 I-140 已及时递交、其他递交条件通过的案例里，`qualifyingBasis` 为 `cleared` 或 `pending` 都可得到递交 `MET`，基础请愿待决时核准为 `UNKNOWN`，省略核准日。另核对即时亲属、亲属优先、EB-1A／NIW 等职业类、EB-5、VAWA、SIJ。领馆按 NVC 流程，未知分类按个案核实。`visaAtDecisionByMonth` 以裁决月为键，候选裁决日至少为实际收件日，也可填更晚的 `decisionOn`。旧 `visaAtDecision` 仅用于模拟月。跨月缺表为 `UNKNOWN`，有明确倒退时为 `NOT_MET`，递交结果仍由收件月决定。即时亲属仍按分类确认名额适用性。依据为 SRC-309 7 USCIS-PM A.6(A)、(C)(4)–(5)，待确认项记在 PD-272。
- **N-400 辖区。** 完整法定居住期和辖区条件分别评估。辖区居住期可在适用法定居住期内完成时，合资格的提前递交按面谈日前的辖区居住核对。面谈日缺失时可得递交 `MET` 和核准 `UNKNOWN`。已知面谈日早于住满日时，核准条件为 `NOT_MET`。面谈日达标后取面谈日与完整居住期周年日中较晚的一日。SRC-080 §§316.2(a)(5)、316.5(b)(1)(i)、334.2(b)，SRC-081 12 USCIS-PM D.6(D)，PD-096。

### 2. 怎么验证的

- 设置 `VITEST_MAX_WORKERS=2` 后，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,398 项测试通过，1 项既有用例跳过。政策数据来源一致性检查通过。静态构建生成 27 个页面，已确认美国页面产物存在。
- `VITEST_MAX_WORKERS=2 pnpm exec vitest run packages/engine/test/united-states-full.test.ts packages/engine/test/united-states.test.ts --maxWorkers=2` 共 164 项通过。回归覆盖审核复现和九路径证据缺失，分别断言递交状态、核准状态和日期。旧时间入口的原有测试继续执行，并用一般及配偶入籍的提前递交案例核对旧结果。
- `git diff --check` 通过。工作树改动对应 PROGRESS 595，分支 HEAD 为 `474d076`。

### 3. 没做或没验证的

- 改动交 Fable 提交。本轮验收范围为 lint、类型检查、测试和构建，浏览器 e2e 及页面接线留给后续任务。
- I-485 的未来排期和 N-400 的面谈日使用已填资料，缺月表或通知时保留相应阶段的 `UNKNOWN`。通用 `other` 类别需要逐案确认，寡偶及 G-4／NATO-6 等独立类别尚无本任务的专用输入。

### 4. 发现与建议

后续问卷分别采集选定的 I-485 网申方式及适用性、基础请愿案状态、实际收件月、预计裁决月和适用的 Final Action Dates。近期搬入新辖区的提前入籍申请应采集辖区起住日及已知面谈日。基础请愿待决或缺裁决资料时可展示已确认的递交日期。

## 第四轮审核修正（review86-4）

### 1. 做了什么

PROGRESS 596 对应建议提交 `Fix: 修正美国领馆递件、公共负担豁免及 I-140 时点（review86-4）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- **C33 领馆递件。** 即时亲属也须确认 NVC 递件授权。未填授权为 `UNKNOWN`，明确未授权且无已确认开放日为 `NOT_MET`，均无递交日期。通过可选的 `nvcFilingOpensOn` 提供已确认的未来开放日时，可返回 `FUTURE` 和该日期。受排期限制的签证仍单独使用裁决月的 Final Action Dates。依据为 SRC-309 国务院 National Visa Center 和 Visa Bulletin 的 Dates for Filing，缺资料登记 PD-272。
- **C36、C39 领馆面谈与核准。** NVC 发出面谈通知后安排体检，领馆裁决前进行安全审查。审查复现中待体检时，递交保留 `MET` 和 `2026-11-23`，核准为 `UNKNOWN` 且无日期。待安全审查采用同样的阶段划分。照片和民事文件正本供面谈查验，现有模型未单独采集。适用的 I-864 与 NVC 所需民事文件仍属递件材料。依据为 SRC-309 Submit Documents 和 Civil Documents、SRC-311 9 FAM 504.8-3、SRC-312 Appointment 及 Prepare for the Interview，待定沿用 PD-275。
- **C37 公共负担。** 已获批的境内 VAWA／SIJ 依据及领馆 VAWA 依据自动判为 `applicable: false`，不产生待定项。难民／庇护路径和已确认的 `publicChargeExempt` 同样标记为不适用。SRC-313 已列出 Form I-485 p18 Part 9 Item 56 的全部豁免类别，并登记 FAM 中的适用例外。其他类别继续以本案已核实的 `publicChargeExempt` 输入评估。
- **I-140 收件时点。** C33 在待决、获批或未填请愿状态时均核对已填的实际收件日是否晚于模拟日。时点矛盾时为 `UNKNOWN`，省略两阶段日期。C28 的 PERM 有效期也等待正确收件日。沿用 PD-272、PD-277。

### 2. 怎么验证的

- 设置 `VITEST_MAX_WORKERS=2` 后，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,412 项测试通过，1 项既有用例跳过。静态构建生成 27 个页面，包含 `/united-states`。
- `VITEST_MAX_WORKERS=2 pnpm --filter @uk-immigration/engine exec vitest run test/united-states-full.test.ts test/united-states.test.ts` 共 178 项通过。新增回归分别断言递交与核准状态和日期，并保留上一轮的同时递交、跨月排期、网申、境内 I-693、贩运禁令与 N-400 辖区规则的测试。
- `git diff --check` 通过。核对旧 `evaluateUnitedStates`、旧专项测试及网页文件无本轮差异，核对新增两份官方来源快照的 SHA-256。

### 3. 没做或没验证的

- 改动留在 `fable/86-us-rules` 工作树，由 Fable 提交。本轮范围为引擎、政策出处与测试，未跑浏览器 e2e。
- 国务院 National Visa Center 和 Appointment 两页已在线核对并登记官方链接，命令行下载返回 403。随工作树保存了 I-485 表格及 9 FAM 504.8 两份可下载的快照。

### 4. 发现与建议

后续问卷可将 NVC 递件通知、文件齐备通知（DQ）与面谈通知分别采集。`visaAtFiling` 表示第一个时点。DQ 由 NVC 在审核已递交资料后确认，依据为 SRC-309 Submit Documents 的 Documentarily Complete 段。

## 第五轮审核修正（review86-5）

### 1. 做了什么

PROGRESS 597 对应建议提交 `Fix: 修正美国返美日期、I-140 与领馆裁决条件（review86-5）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- **P4 计划返美。** 按所填未来返美日核对证件和准入并汇总，条件齐备时返回 `FUTURE` 和该日。审核复现为 `2026-12-01`。条件不满足或资料不足时省略日期。核对了其他行程用途，P1、P2 继续按候选递交日之前的实际在美与离境窗口计算。依据为 SRC-080 的 8 CFR §§211.1(a)、211.3，SRC-300 的回美证及 SB-1 规则，以及 SRC-079 的 8 U.S.C. §1101(a)(13)(C)。
- **C28／C33 职业请愿。** 请愿状态统一用 `admission.petitionStatus`，实际收件日用 `employment.i140FiledOn`。已获批的 I-140 按实际收件日核对 PERM。缺少历史收件日时 C28 核准项为 `UNKNOWN`，已确认满足的职业递交条件仍可为 `MET`。晚于模拟日的实际收件日继续让两阶段待核。依据为 SRC-305 的 20 CFR §656.30(b)(1) 和 6 USCIS-PM E.6(B)(1)，见 PD-272、PD-277。
- **C33 SIJ。** 已获批 SIJ 的境内调整按法定假释满足入境条件，包含未查验入境和未填入境方式的复现。依据为 SRC-309 的 8 U.S.C. §1255(h)(1)。
- **NVC 民事文件。** `admission.nvcCivilDocuments` 独立核对必需民事文件。必需文件缺失且无说明时为 `NOT_MET`，未填为 `UNKNOWN`，均省略递交日期。适用的缺件说明可用于递件，核准仍待领事官员确认。文件齐备后，待体检或安全审查仍只影响核准。依据为 SRC-309 的 Submit Documents Step 9 和 Civil Documents FAQs，见 PD-272、PD-275。
- **C33／C40 领馆裁决。** 未来 NVC 开放日用于递件。核准须提供更晚的面谈后 `admission.decisionOn`，受排期限制的案件再取裁决月的 Final Action Dates。C40 的非法居留禁令在递交、核准阶段分别按各自日期计算。审核复现中，递交仍为 `NOT_MET`，禁令于 `2026-12-01` 届满，核准在 `2026-12-10` 为 `FUTURE`。依据为 SRC-312 的 Applicant Interview Step 11 和 SRC-311 的 8 U.S.C. §1182(a)(9)(B)(i)，见 PD-272、PD-274。

### 2. 怎么验证的

- 设置 `VITEST_MAX_WORKERS=2` 后，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,423 项测试通过，1 项既有用例跳过。静态构建生成 27 个页面，包含 `/united-states`。
- `VITEST_MAX_WORKERS=2 pnpm --filter @uk-immigration/engine test test/united-states-full.test.ts test/united-states.test.ts`，189 项通过。覆盖四项审核复现、两项时点风险和旧时间入口。
- `git diff --check` 通过。对照 `af44b0c` 核实旧 `evaluateUnitedStates` 的源码、专项测试和网页入口没有本轮差异。

### 3. 没做或没验证的

- 改动留在 `fable/86-us-rules` 工作树供 Fable 提交。本轮未跑浏览器 e2e。

### 4. 发现与建议

后续问卷可分别采集 NVC 授权、民事文件状态与面谈后的裁决日。现有 `decisionOn` 即为裁决时点输入。NVC 安排面谈的时间取决于个案和领馆档期，缺日期时按 PD-272 待确认。

## 第六轮审核修正（review86-6）

### 1. 做了什么

PROGRESS 598 对应建议提交 `Fix: 修正美国领馆递件与裁决及 SIJ 同时递交（review86-6）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

| 领馆阶段 | 国务院流程与条件 | 引擎判定与来源 |
|---|---|---|
| NVC 递件 | NVC 授权后支付适用的移民签证和担保审查费用。在 CEAC 提交各申请人的 DS-260，再提交所需民事文件及适用的 I-864 和财务证据。 | C33 核对 NVC 授权或确认的未来开放日。`nvcDs260: 'submitted'` 同时提供适用费用已处理的依据，因为 CEAC 在处理费用后才开放 DS-260。`'not-submitted'` 为 `NOT_MET`，未填为 `UNKNOWN`，两者均省略递件日期。民事文件及适用的 I-864 独立核对。见 SRC-309 Pay Fees Step 3、Online Application Step 6、CEAC FAQs 的 IV Application 与 Civil Documents 栏、Submit Documents Step 9，PD-272。 |
| 面谈 | NVC 审核材料齐备后，按领馆档期及适用名额安排面谈。申请人完成指定医生体检，携带 DS-260 确认页、照片、民事文件正本或认证副本，在领事官员面谈时正式提出签证申请。 | C36 的体检和疫苗结论用于核准。面谈档期及到场材料由个案通知确认。见 SRC-309 Online Application Step 6 和 Submit Documents 的 Documentarily Complete 段、SRC-312 Prepare for the Interview Step 10 与 Applicant Interview Step 11，PD-272、PD-275。 |
| 签证裁决 | 领事官员在面谈后判断签发资格，按适用的 Final Action Dates 核对名额，并核对准入事由及安全审查。 | C33 使用明确的 `decisionOn` 和适用的裁决月排期。缺裁决日且其余条件没有明确阻碍时，核准为 `UNKNOWN`，省略核准日。未来 NVC 开放日仍须早于裁决日。C40 仅在核准阶段按裁决日核对非法居留禁令，NVC 递件可在禁令届满前完成。见 SRC-309 Visa Bulletin、SRC-311 8 U.S.C. §1182(a)、§1182(a)(9)(B)(i) 及 9 FAM 504.8-3、SRC-312 Applicant Interview Step 11，PD-272、PD-274、PD-275。 |

- **SIJ 境内调整。** 在排期可用且其他递交条件齐备时，未查验入境者可与 I-360 同时递交 I-485，也可在 I-360 待决时递交。两个状态均为递交 `MET`、核准 `UNKNOWN`，省略核准日期。I-360 获批后按法定假释处理入境条件，再检查其余核准条件。见 SRC-309 8 U.S.C. §1255(h)(1) 与 I-485 Instructions p21，PD-272。
- **跨阶段禁令回归。** 模拟日 `2026-11-23` 的 NVC 递件为 `MET`。有明确裁决日时，禁令届满前核准为 `NOT_MET`，届满当日和之后为 `FUTURE`。未填裁决日时，递件仍为 `MET`，核准为 `UNKNOWN`。

### 2. 怎么验证的

- 设置 `VITEST_MAX_WORKERS=2` 后，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,432 项测试通过，1 项既有用例跳过。静态构建生成 27 个页面，包含 `/united-states`。
- 修正前跑美国完整版测试，新增断言复现缺裁决日、SIJ 同时递交和领馆 C40 的错误判定。
- 验收覆盖美国新旧入口及上一轮的计划返美、缺历史 I-140 收件日、已获批 SIJ、缺必需民事文件，以及未来 NVC 开放日与裁决日分离。
- `git diff --check` 通过。对照 `e289d09` 核实旧 `evaluateUnitedStates`、旧专项测试和美国页面入口无差异。I-485 Instructions 快照的 SHA-256 与 SRC-309 登记一致。

### 3. 没做或没验证的

- 改动留在 `fable/86-us-rules` 工作树供 Fable 提交。本轮未跑浏览器 e2e。面谈日期、到场文件及 NVC 的资料齐备通知由个案确认，引擎未新增独立输入。

### 4. 发现与建议

页面接入时可按上表采集 CEAC 的 DS-260 提交状态和面谈后的裁决日，并分别展示 NVC 递件与签证核准结果。NVC 已安排面谈时，面谈通知上的日期用于赴约，`decisionOn` 用于核准评估。

## 第七轮审核修正（review86-7）

### 1. 做了什么

PROGRESS 599 对应建议提交 `Fix: 修正美国准入审查阶段及日期（review86-7）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

| 准入事由 | NVC 递件 | 领馆面谈 | 领馆裁决 | I-485 递交 | I-485 核准 | 官方定位 |
|---|---|---|---|---|---|---|
| C36 健康、疫苗及体检证据 | 等待面谈通知后安排体检。 | 完成指定医生体检，按通知提交疫苗记录或体检报告。 | 使用适用于签发时的健康、疫苗、体检记录和豁免结论。证据未确认时为 `UNKNOWN`。 | 所需 I-693 或疫苗记录须随件递交。按 USCIS 收件日检查所填 I-693 的签署日期和有效性。 | 按核准日复核同一份 I-693 的有效性及健康结论。 | SRC-309 I-485 Instructions p11 Item 9；SRC-311 §1182(a)(1)、(g)；SRC-312 8 USCIS-PM B.9 与 DOS Appointment，Medical Examination；PD-275。 |
| C37 公共负担及豁免 | 独立核对适用的 I-864 和财务证据。 | 领事官员核对豁免及个案证据。 | 按 DOS FAM 使用领馆个案结论。 | 适用的 I-864 与材料随件核对。DHS 规则版本按 I-485 邮戳或电子递交日选择。 | 使用按递交日期适用的 DHS 规则，以及主管机关对豁免或全貌的判断。 | SRC-309 Submit Documents，Documentarily Complete；SRC-311 §1182(a)(4)；SRC-313 91 FR 45324，DATES 与 § I.D、Form I-485 p18 Part 9 Item 56、9 FAM 302.8-2(B)(6)；PD-261、PD-273。 |
| C38 犯罪、毒品、贩运及洗钱 | `NVC-CIVIL-DOCUMENTS` 核对适用法院、监狱和警方文件或缺件说明。 | 核对所需正本或认证副本。正式申请日用于未成年 CIMT 例外。 | 核对 CIMT、轻罪及未成年例外、多项定罪及刑期、受控物质、贩运、洗钱和豁免。待审或缺个案证据时为 `UNKNOWN`。 | 适用的法院和警方记录须随件提交。未成年 CIMT 例外按 I-485 收件日计算。 | 复核刑事分类和独立事由及豁免。未成年 CIMT 例外沿用该 I-485 的收件日。 | SRC-309 Civil Documents、22 CFR §42.67(a)(3)、I-485 Instructions pp11–12 Item 10；SRC-311 §1182(a)(2)(A)(ii)(I)、(a)(2)(B)–(I)、(h) 及 9 FAM 302.3-2(B)(7)；SRC-312 Applicant Interview Step 11；PD-269。 |
| C39 安全、出口管制及极权党籍 | DS-260 提交由 NVC 独立核对。 | 申报党籍。正式申请日用于原党籍例外。 | 核对安全及适用的党籍例外。原党籍期限按正式申请日计算。当面谈和裁决同日，使用 `decisionOn`。两日不同时，使用 `interviewOn`。 | 按 I-485 收件日计算原党籍期限。 | 复核安全结论及党籍例外或豁免。原党籍期限沿用该 I-485 的收件日。 | SRC-309 Online Application Step 6、22 CFR §42.67(a)(3)；SRC-311 §1182(a)(3)(D)(ii)–(iv)、9 FAM 504.8-3、8 USCIS-PM F.3 Past Membership 注 63；PD-275。 |
| C40 欺诈、虚称公民、非法居留及再入境 | 核对适用材料。 | 核对申报及证据。 | 按 `decisionOn` 核对非法居留禁令届满，另核对其他移民史事由和豁免。 | 按 I-485 收件日核对非法居留禁令和独立事由。 | 按裁决日复核禁令和其他准入条件，同时保留同一申请在递交日的资格检查。 | SRC-309 8 U.S.C. §1255(a)(2)、8 CFR §103.2(b)(1)；SRC-311 §1182(a)(6)、(a)(9)、(i)；PD-274。 |

两条 C38 对照用例均以刑事准入待审为前提。文件齐备时，NVC 递件为 `MET`，保留 `2026-11-23`，签证核准为 `UNKNOWN`。缺必需文件且无缺件说明时，`NVC-CIVIL-DOCUMENTS` 为 `NOT_MET`，递件和核准均省略日期。C39 的审核用例在 `2026-12-10` 同日面谈和裁决时通过原党籍年限检查。

同日面谈和裁决是省略 `interviewOn` 时的输入约定。对于预计递交的 I-485，未填 `fees.filingOn` 时以模拟日作为预计的邮戳或电子递交日。

### 2. 怎么验证的

- 设置 `VITEST_MAX_WORKERS=2` 后，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 完整退出码为 0。全仓 5,448 项测试通过，1 项既有用例跳过。静态构建生成 27 个页面，包含 `/united-states`。
- 修正前运行新增回归，复现了 C38 参与 NVC 递件及 C39 使用模拟日的错误。专项测试覆盖第六轮四项回归，包括缺裁决日、DS-260 未提交或未填、SIJ 同时递交或 I-360 待决，以及 C40 按裁决日核对。新增用例覆盖正式申请与裁决分日、I-485 收件日、I-693 有效性及公共负担邮戳口径。
- `git diff --check` 通过。对照 `3afaf67d` 核实旧 `evaluateUnitedStates`、旧政策参数、旧专项测试和美国页面入口均一致。

### 3. 没做或没验证的

- 改动留在 `fable/86-us-rules` 工作树，未提交。未运行浏览器 e2e。领馆体检仍依赖个案证据结论，I-485 适用法院和警方记录的逐件清单仍由申请人按表格说明核实。

### 4. 发现与建议

独立接入完整版时，裁决延至面谈之后的案件可填写 `interviewOn`，同时用 `decisionOn` 表示裁决日。C38、C39 与 C40 因此可以在同一案件使用各自的法定时点。

## 第八轮审核修正（review86-8）

### 1. 做了什么

PROGRESS 600 建议统一提交为 `Fix: 统一美国收件渠道并按收件日适用政策（review86-8）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- **USCIS 收件渠道。** 渠道留空时，已知只收纸件的路径按工作日收件，网申可用性待确认时为 `UNKNOWN`，已确认可网申的路径可保留周末收件日。USCIS 要求 I-130 与 I-485 同包网申由律师或获认可的代表提交。审核复现中，无渠道或只填网申待确认，均按自行纸件于 2026-11-23 最早送达，递交为 `FUTURE`，基础请愿尚未核准时核准为 `UNKNOWN`。已确认同包网申可用时可于 2026-11-21 递交。见 SRC-082 的 Form I-485 栏、SRC-081 1 USCIS-PM B.6(E)、PD-267。
- **C38／C39 领馆正式申请。** 已知有效面谈日即可核对依赖正式申请日的未成年 CIMT 和原党籍期限，C33 核准仍等裁决日。审核复现中，2026-12-01 面谈当日达到非执政党退党期限，C39 为 `MET`，核准为 `UNKNOWN`，无核准日。面谈和裁决矛盾时继续待确认。NVC 的民事文件仍独立检查。见 SRC-309 22 CFR §42.67(a)(3) 与 Online Application Step 6、SRC-311 8 U.S.C. §1182(a)(2)(A)(ii)(I)、(a)(3)(D)(iii)，PD-269、PD-272、PD-275。
- **C04 公民题库。** 采用最早适用收件日选择版本。审核复现中，2025-10-19 的纸质 N-400 最早在 2025-10-20 收件，普通考生答对 6 题为 `NOT_MET`。2025-10-19 网申仍适用旧题库。纸件和网申两种日期跨越切换点且渠道待确认时，题库待确认。见 SRC-292 PA-2025-24 p2、SRC-081 1 USCIS-PM B.6(E)、PD-271。
- **C36 I-693 随件。** 普通境内调整及难民／庇护调整从 2024-12-02 收件起核对适用的随件材料。审核复现中，2024-10-15 可以先递交 I-485，未完成体检材料时递交为 `MET`、核准为 `UNKNOWN`。2024-12-01 拟交纸件顺延至 2024-12-02，应随件递交。USCIS Form I-693 页首明确生效日，PA-2025-08 p2 记载 2024-12-10 的 I-485 改版发布。见 SRC-312、SRC-309 I-485 Instructions p11 Item 9、PD-275。

#### 附表：九条路径的表格与渠道

网申范围按官方快照。表中「留空」指未指定递交渠道时适用的日历或办理方式。主表决定路径的最早递交日。随件跟随主表，单独请愿、费率、上诉、证件或证据有各自的适用条件。

| 路径 | 表格 | 官方网申可用性及定位 | 渠道留空时的处理 |
|---|---|---|---|
| P1 一般入籍 | N-400、适用的 I-912 | 常规可网申。申请 reduced fee 或 fee waiver 用纸件，I-912 随免缴费申请寄交。SRC-082，Fill Out Form Online，N-400；SRC-316，I-912 Instructions。 | 常规保留周末。减费或免缴费申请按纸件工作日。网申可用性填为待确认时为 `UNKNOWN`。 |
| P1、P2、P9 | N-336 | 常规可网申。合资格 I-912 豁免须按纸件办理。SRC-082，Fill Out Form Online，N-336 与 Upload Completed PDF Online，I-912；SRC-316，G-1055 p30。 | 属另行听证申请。常规可走电子渠道，带 I-912 的 N-336 走纸件。N-400 的收件日按该表自身渠道判定。 |
| P1、P2、P9 | N-648 | 医师签署的例外证明，随 N-400 提交或依 USCIS 要求补交。SRC-292，12 USCIS-PM E.3(B)–(E)；SRC-082，N-400 Instructions p8。 | 作为 N-400 证据，采用相应递交方式。 |
| P2 公民配偶入籍 | N-400 | 与 P1 同口径。SRC-082，Fill Out Form Online，N-400。 | 与 P1 同口径。 |
| P3 取消条件 | I-751、I-912 | I-751 可用 PDF 网申，I-912 可随适用的 I-751 上传。SRC-082，Upload Completed PDF Online，I-751、I-912；SRC-316，G-1055 p22。 | 网申可用且仍可按时递交时保留周末。仅纸件能在周末或假日截止后按时送达，且渠道未选定时，结果待确认。明确仅纸件时按纸件。I-912 随 I-751。 |
| P3 取消条件 | I-829 | 纸件邮寄。SRC-082，I-829 *Where to File* 与网申清单；SRC-298，I-829 Instructions。 | 按纸件工作日，适用的截止日顺延另算。 |
| P4 身份维持与返美 | AR-11、G-325R、I-90 | AR-11 可在线改地址，部分情形另按地址变更说明。G-325R 用 USCIS 在线账户登记。I-90 可用在线流程或 PDF，合资格 I-912 可随 I-90 上传。SRC-082，AR-11、G-325R、I-90、I-912 栏；SRC-299，Alien Registration Requirement。 | 可走相应电子渠道。登记、地址申报和换卡各自判断，返美日按计划日。 |
| P4、P7、P8 | I-131 | 回美证和 Refugee Travel Document 用纸件。Advance Parole 仅列出的类别可用 PDF，基于待决 I-485 的单独网申要求 IOE 收件号，也可随适用的 I-485 同包上传。SRC-082，I-131 PDF 栏 Part 1 及 I-485 同包清单；SRC-300，I-131 Instructions，*Reentry Permits*、*Refugee Travel Documents*。 | 回美证和 Refugee Travel Document 用纸件。单独 Advance Parole 按类别和收件号确认，未知时待确认。该表的办理日独立于返美或 I-485 收件日。 |
| P4 身份维持与返美 | I-131A、DS-117、SB-1 的 DS-260 | I-131A 线上付费后向使领馆当面交表，DS-117 向使领馆提交，后续 DS-260 按使领馆指示办理。SRC-300，I-131A Payment、Returning Resident Visas；SRC-317，22 CFR §22.1 第 35(a) 项。 | 依使领馆指示办理。返美日按计划日。 |
| P5 亲属移民 | I-130 | 可单独网申。与 I-485 同包网申时由律师或获认可的代表提交。SRC-082，I-130 栏及 I-485 *Filing concurrently*。 | 单独请愿可走电子渠道。I-130／I-485 同包未确认代表可网申时，按自行纸件工作日。确认同包可网申后可保留周末。其余境内与领馆表见 P7。 |
| P5、P6、P7 | I-864 | 境内可随获准网申的 I-485 上传，领馆流程经 CEAC 交担保材料。SRC-082，I-485 同包清单；SRC-303，I-864 Instructions；SRC-309，Submit Documents Step 9。I-864P 是收入对照表，见 SRC-304。 | 跟随 I-485 或 CEAC。 |
| P6 职业、投资、Gold Card | ETA-9089、I-140、I-907 | ETA-9089 可经 DOL FLAG 或邮寄。I-140 可用 PDF；与 I-485 同包网申须由代表或符合条件的 I-140 自请人提交。I-907 可与符合条件的 I-140 同包，或用于具备 IOE 号的待决 I-140。SRC-305，20 CFR §656.17(a)、(c)；SRC-082，I-140、I-485、I-907 PDF 栏。 | ETA-9089 用 DOL 渠道。职业类境内调整按 I-485 个案确认，待定为 `UNKNOWN`。单独请愿和加急各自确认。 |
| P6 职业、投资、Gold Card | I-526、I-526E、I-140G | I-526／I-526E 用纸件。I-140G 只能在登记获接纳、收到 USCIS 通知后网申。SRC-307，I-526／I-526E *Where to File*；SRC-308，I-140G *Where to File*、*When to File*；SRC-082 网申清单。 | I-526／I-526E 和 EB-5 类 I-485 用纸件工作日。I-140G 依 USCIS 通知走电子渠道。若走领馆，适用 P7 的 NVC 时点。 |
| P7 境内调整或领馆签证 | I-485、I-360 | 已交 I-130、I-140 或 VAWA I-360 后，合资格 I-485 可单独上传。I-130／I-140 同包受上述代表或自请限制。I-360 的 PDF 网申向 VAWA 自请开放，须先单交才能用其依据网申 I-485。SRC-082，I-485 与 I-360 PDF 栏；SRC-309，I-485 Instructions pp17–21。 | 已确认可网申可保留周末。所列自行 I-130 同包、VAWA 同包、SIJ、EB-5 等纸件组合按工作日，其他可用性待定时为 `UNKNOWN`。 |
| P7 境内调整或领馆签证 | I-485 Supplement A／J、G-28、I-693、I-765 | 适用的补表、代理表、体检、工卡可随可网申 I-485 一并上传。Supplement A／J 另可对符合条件的 IOE 待决案单独上传。I-765 单独网申限官方列出的类别及收费情形。SRC-082，I-485 同包清单，Supplement A、Supplement J、I-765 PDF 栏；SRC-312，Form I-693。 | 随件采用主表渠道，单独递交须先核实相应选项。I-693 随件要求按 I-485 收件日。 |
| P5、P6、P7 领馆 | DS-260、USCIS Immigrant Fee | DS-260 在 CEAC 递交，核对 NVC 授权。适用的 USCIS Immigrant Fee 在线缴费。SRC-309，Online Application Step 6；SRC-082，网申清单导言；SRC-316，G-1055 p2。 | NVC 递件按 CEAC 授权与所需文件判断，签证正式申请按面谈日；移民费另付。 |
| P8 难民或庇护转永居 | I-485、I-693、I-602、适用的 I-912 | 此类 I-485 用纸件。所需 I-693 或部分疫苗记录按适用要求随件。I-602 随 I-485 邮寄，或送正在审理的办公室。适用的 I-912 用纸件。SRC-082，I-485 与 I-912 PDF 栏；SRC-312，Form I-693；SRC-314，I-602 *Where to File*；SRC-316，I-912 Instructions。 | 主表按纸件工作日，随件采用同一渠道。 |
| P9 军人入籍 | N-400、N-426、DD-214／NGB-22 | 军人可纸交或网申 N-400。在役用 N-426，离役提交适用军方档案。SRC-315，Naturalization Through Military Service，*Application Process* 与 12 USCIS-PM I.2–I.3。 | N-400 可保留周末。服役证明随主表提交，N-336、N-648 的渠道见共用行。 |

### 2. 怎么验证的

- 使用 `VITEST_MAX_WORKERS=2` 运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码 0。5,457 项测试通过，1 项跳过。静态构建生成 27 个页面。
- 新回归首先复现审核提出的四处问题。修正后覆盖留空、待确认、显式纸申与确认网申，确认有效面谈日与待决核准可并存，并验证两处版本生效边界及难民／庇护纸件。
- 原有 I-751 顺延截止日、C38 与 NVC 民事文件分离、C39 正式申请与裁决分日，以及旧 `evaluateUnitedStates` 的回归继续运行。上一轮中把未确认 I-485 当成可网申的断言改为用已确认网申的输入。
- `git diff --check` 通过。复核了 SRC-312 新快照 SHA-256、附表 P1–P9 和 PROGRESS 600。旧引擎入口、原专项测试及美国页面相对 `77cdb6ba` 的文件 diff 为空。

### 3. 没做或没验证的

- 改动留在 `fable/86-us-rules` 工作树，供 Fable 提交。美国页面继续使用旧的时间评估入口。本轮未跑浏览器端到端。

### 4. 发现与建议

- USCIS 清单按表格、类别和提交方式开通网申。后续问卷可对 I-485 单独确认类别和提交者资格，以便准确填写 `onlineCategoryAvailable`，并独立收集 NVC 面谈日与裁决日。

## 第九轮审核修正（review86-9）

### 1. 做了什么

PROGRESS 601 建议统一提交为 `Fix: 修正美国体检递交、入籍年龄和准入豁免（review86-9）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- **C36 体检。** 2024-12-02 以前收件的普通境内调整及难民／庇护调整，体检报告、Class A 健康结论和疫苗结论待定只影响核准。用相同证据在生效日前后回归，2024-11-29 收件时递交为 `MET`，最早可于当日递交。2024-12-02 起所需随件材料待确认时递交为 `UNKNOWN`，无日期。两种情况下核准均为 `UNKNOWN`。依据为 SRC-312 Form I-693 页首、PA-2025-08 p2、旧版 I-485 Instructions Item 10 及 PD-275。
- **C04 65/20。** 简版考试年龄按 N-400 收件日核对，和题库版本采用同一收件日。审核复现中，纸件最早于 2026-11-23 收件，申请人当日年满 65 岁，累计在美 LPR 居住满足门槛，答对 6 题时为 `MET`。在此前一天网申则为 `NOT_MET`。两种收件日跨生日且渠道待确认时，影响考试结果的年龄资格为 `UNKNOWN`。依据为 SRC-081 1 USCIS-PM B.6(E)、SRC-292 12 USCIS-PM E.2(A)(2)、(C)(2)、PA-2025-24 p2 及 PD-271。
- **C37／C40 准入豁免。** SIJ、VAWA、难民及庇护按各自 SRC 清单筛选准入事由。已获批 SIJ 的境内调整排除公共负担、劳工证、未经查验入境、欺诈或虚称公民、偷乘、移民文件及非法居留禁令，继续核对适用的非法再入境和其他事由。已获批 VAWA 在境内按 USCIS 指引处理未经查验入境，公共负担例外同时适用于境内与领馆，非法居留例外依赖个案证据。难民及庇护调整排除公共负担、劳工资格及移民文件事由，适用的其余事由依 INA 209(c) 核对。依据为 SRC-309 8 U.S.C. §1255(h)(2)、SRC-311 §1182(a)(4)(E)(i)、(6)(A)(ii)、(9)(B)(iii)(IV)、I-601 Instructions pp14–15、SRC-314 8 U.S.C. §1159(c) 及 PD-274。

### 2. 怎么验证的

- 设置 `VITEST_MAX_WORKERS=2` 后运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码 0。5,463 项测试通过，1 项既有用例跳过。静态构建生成 27 个页面，包含 `/united-states`。
- 美国专项回归断言生效日前后的递交与核准状态、生日跨纸申与网申的考试结果，以及各类别免除和仍适用的准入事由。
- `git diff --check` 通过。对照 `61e6c7e9`，旧 `evaluateUnitedStates` 的实现、时间参数、原专项测试及美国页面入口均一致。

### 3. 没做或没验证的

- 改动保留在 `fable/86-us-rules` 工作树，供 Fable 提交。浏览器端到端留待 PR 验收。

### 4. 发现与建议

- 已知其他准入事由的法律分类时，调用方可用可选的 `otherInadmissibilityByGround` 逐项提供结论并让规则筛选不适用的条款。只有综合审查结论时继续填 `otherInadmissibility`。VAWA 的非法居留例外可填 `vawaUnlawfulPresenceException`，缺少所需个案证据时登记 PD-274。

## 第十轮审核修正（review86-10）

### 1. 做了什么

PROGRESS 602 建议统一提交为 `Fix: 修正美国准入审查、请愿核准与英语豁免（review86-10）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- **C40 分项准入审查。** 综合审查待定时，空表及部分分项均返回 `UNKNOWN`。适用事由已全部逐项排除或已获适用豁免时可通过。综合审查已经明确时继续用该结论覆盖未填的分项，明确填报的各项照常核对。依据为 SRC-311 8 U.S.C. §1182(a)(5)–(10) 及 PD-274。
- **C33 基础请愿。** 已知收件日、获批状态留空或待决时，按同时递交规则判断递交。符合递交条件的案件核准为 `UNKNOWN`，省略核准日期。I-140 使用 `employment.i140FiledOn`，其他基础请愿可使用 `admission.petitionFiledOn`。依据为 SRC-309 8 CFR §245.2(a)(2)(i)(A)–(C)、7 USCIS-PM A.6(A)、I-485 Instructions p3 及 PD-272。
- **C03 英语豁免。** 55/15、50/20 的年龄按 N-400 收件日判断。渠道待定且纸件与网申跨过生日、影响豁免结论时为 `UNKNOWN`。依据为 SRC-081 1 USCIS-PM B.6(E)、SRC-082 N-400 Instructions p8、SRC-291 8 U.S.C. §1423(b)(2)、SRC-292 12 USCIS-PM E.2(B)(1) 及 PD-271。
- **SIJ 同件递交。** 名额可用且满足其余 C33 条件时，可在 I-360 待决期间递交 I-485。官方未明确说明待决分类如何确认个案准入例外，因此依赖法定例外的 C40 递交和核准审查均为 `UNKNOWN`，依赖例外的 C37 公共负担核准审查亦待确认。分类获批后适用例外。已确认的非法再入境等独立事由仍可判 `NOT_MET`。依据为 SRC-309 8 U.S.C. §1255(h)(1)–(2)、I-485 Instructions p21 及 PD-274。

### 2. 怎么验证的

- 设置 `VITEST_MAX_WORKERS=2` 后运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码 0。全仓 5,471 项测试通过，其中 Engine 3,438 项，1 项既有测试跳过。静态构建生成 27 个页面，包含 `/united-states`。
- 新增回归覆盖综合审查待定下的空表、部分分项和完整清单，I-140 及 I-130 仅有收件日时的递交和核准，英语豁免的纸件及网申跨生日，以及 SIJ 同件递交、分类待决、获批和独立障碍。
- `git diff --check` 通过。对照 `73f9eb9c`，旧 `evaluateUnitedStates` 的实现、时间参数、专项测试及美国网页入口一致。

### 3. 没做或没验证的

- 改动保留在 `fable/86-us-rules` 工作树，供 Fable 提交。浏览器端到端留待 PR 验收。

### 4. 发现与建议

- 已有综合审查结论时仍可填写 `otherInadmissibility`。使用分项时，上级法条的明确结论可覆盖其子条款，单独核对一条子条款只能覆盖该条款。

## 第十一轮审核修正（review86-11）

### 1. 做了什么

PROGRESS 603 建议提交为 `Fix: 修正美国基础请愿核准与 SIJ 准入判定（review86-11）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- **C33 基础请愿。** 依赖基础请愿的境内案按同时递交规则独立判断。所填请愿待决、与 I-485 同件递交或状态留空时，缺获批证据即保留核准为 `UNKNOWN`，无核准日期。符合同时递交规则且其他递交条件齐备时，可给递交日期。依据为 SRC-309 8 CFR §245.2(a)(2)(i)(A)–(C)、7 USCIS-PM A.6(A)、I-485 Instructions p3 及 PD-272。
- **C33 领馆证据。** 同一领馆案已有 NVC 递件授权和 CEAC 的 DS-260 提交记录时，C33 据国务院流程确认基础请愿已获批。两项记录齐备时，以该流程证据处理留空、待决或同件递交状态，补录历史收件日两阶段结论一致。若只报告请愿待决或与 I-485 同件递交，且无完整 NVC 证据，领馆递交的请愿前置条件为 `NOT_MET`。依据为 SRC-309 DOS NVC Processing Step 2、Online Application Step 6 及 PD-272。
- **C40 SIJ 待决。** 综合结果为不准入时，完整且能解释该结论的分项按适用法定例外判定。如果综合结论可能还包含独立障碍，未解释部分为 `UNKNOWN`。已明确的独立障碍仍使两阶段为 `NOT_MET`。若完整分项把障碍定位为偷乘，分类待决时两阶段为 `UNKNOWN`，分类获批后可适用该例外。依据为 SRC-309 8 U.S.C. §1255(h)(2)(A)、SRC-311 8 U.S.C. §1182(a)(6)(D) 及 PD-274。

#### C33 基础请愿输入组合

各格为 **C33 递交／核准**。假定类别依赖基础请愿，类别本身的证据齐备，境内允许同件递交且名额与入境条件满足，领馆裁决时点有效且裁决月名额可用。收件日「有」指不晚于模拟日的实际收件日。授权留空列适用于缺当前授权及未获确认的未来开放日。

| 类别来源（显式／推断／无法推断） | 请愿状态 | 历史收件日 | 境内 | 领馆已授权／DS-260 已提交 | 领馆已授权／DS-260 留空或未提交 | 领馆授权留空／DS-260 已提交 | 领馆授权留空／DS-260 留空或未提交 | 领馆明确未授权／任意 DS-260 状态 |
|---|---|---|---|---|---|---|---|---|
| 显式／推断 | 获批 | 无 | MET／MET | MET／MET | MET／MET | UNKNOWN／UNKNOWN | UNKNOWN／UNKNOWN | NOT_MET／NOT_MET |
| 显式／推断 | 获批 | 有 | MET／MET | MET／MET | MET／MET | UNKNOWN／UNKNOWN | UNKNOWN／UNKNOWN | NOT_MET／NOT_MET |
| 显式／推断 | 待决 | 无 | MET／UNKNOWN | MET／MET | NOT_MET／NOT_MET | NOT_MET／NOT_MET | NOT_MET／NOT_MET | NOT_MET／NOT_MET |
| 显式／推断 | 待决 | 有 | MET／UNKNOWN | MET／MET | NOT_MET／NOT_MET | NOT_MET／NOT_MET | NOT_MET／NOT_MET | NOT_MET／NOT_MET |
| 显式／推断 | 同件递交 | 无 | MET／UNKNOWN | MET／MET | NOT_MET／NOT_MET | NOT_MET／NOT_MET | NOT_MET／NOT_MET | NOT_MET／NOT_MET |
| 显式／推断 | 同件递交 | 有 | MET／UNKNOWN | MET／MET | NOT_MET／NOT_MET | NOT_MET／NOT_MET | NOT_MET／NOT_MET | NOT_MET／NOT_MET |
| 显式／推断 | 留空 | 无 | MET／UNKNOWN | MET／MET | UNKNOWN／UNKNOWN | UNKNOWN／UNKNOWN | UNKNOWN／UNKNOWN | NOT_MET／NOT_MET |
| 显式／推断 | 留空 | 有 | MET／UNKNOWN | MET／MET | UNKNOWN／UNKNOWN | UNKNOWN／UNKNOWN | UNKNOWN／UNKNOWN | NOT_MET／NOT_MET |
| 无法推断 | 留空 | 无 | MET／UNKNOWN | MET／MET（可确认获批） | MET／UNKNOWN | UNKNOWN／UNKNOWN | UNKNOWN／UNKNOWN | NOT_MET／NOT_MET |

- 类别可由专用路径或所填类别明确给出。通用路径可从亲属请愿人或关系、职业分类或 I-140 收件日推断。显式和推断的请愿类适用相同的递交及核准判定。矛盾类别资料仍须核对，暂不据此确认即时亲属或可同件递交。
- 「无法推断」行对应显式类别、分类依据和基础请愿证据均缺失，但已提供其余适用的递交资料。仅填合资格结论时，核准为 `UNKNOWN`。NVC 授权与 DS-260 提交齐备时，可以确认本案有已获批的基础请愿，按获批证据行处理。依据见 SRC-302、SRC-309、PD-272。
- 境内栏按已在美国的实际或推算收件日评估。确认将在境外行程后返美时，另按返美日、所选渠道及收件月份推算。
- 路径汇总还要核对独立的 DS-260 检查。提交状态留空时，该检查两阶段为 `UNKNOWN`。明确未提交时，两阶段为 `NOT_MET`。汇总中已知的不满足优先，任一阶段为 `UNKNOWN` 或 `NOT_MET` 时省略该阶段日期。其余条件已确认且裁决日在未来时，领馆核准汇总为 `FUTURE`，给裁决日期。
- 明确未授权列假定无已确认的未来 NVC 开放日。已确认的未来开放日仍可作为递交候选日。晚于模拟日的实际请愿收件日属于时点冲突，两阶段 C33 为 `UNKNOWN`。境内无法确认可同件递交且缺获批证据时，递交亦待确认。依据见 PD-272。

### 2. 怎么验证的

- 使用 `VITEST_MAX_WORKERS=2` 运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码 0。全仓 5,559 项测试通过，其中 Engine 3,526 项，1 项既有用例跳过。构建生成 27 个静态页面，包含 `/united-states`。
- 先在修改引擎前复现两项 C33 和 SIJ 综合结论问题。表中 48 格展开为 80 种实际输入，逐一断言 C33 的两阶段、路径汇总及日期，覆盖授权及 DS-260 的明确否定与留空。另核对 EB-2 PERM 无请愿状态和收件日，以及 SIJ 分项不全、含潜在例外的上级条款、完整分项、独立障碍和分类获批。
- `git diff --check` 通过。对照 `56ee463a`，旧 `evaluateUnitedStates` 实现、旧时间参数、专项测试、共用结果结构及网页一致。

### 3. 没做或没验证的

- 改动保留在 `fable/86-us-rules` 工作树，供 Fable 提交。本轮未运行浏览器端到端。

### 4. 发现与建议

- 领馆证据须来自同一请愿案。只知道历史收件日或只掌握一项 NVC 记录时，仍需核对请愿决定。

## 第十二轮审核修正（review86-12）

### 1. 做了什么

PROGRESS 604 建议提交为 `Fix: 修正美国调整身份类别、境内收件与 VAWA 获批判定（review86-12）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- **C33 类别识别。** 通用调整路径在类别留空时，从亲属请愿人或关系、职业分类或 I-140 收件日识别基础请愿，沿用上节组合表和可同时递交规则。识别为美国公民配偶且缺获批证据时，递交为 `MET`，核准为 `UNKNOWN`，无核准日期。只有合资格结论、无法确认具体依据时，核准同样待确认。上节组合表已补类别来源和无法推断的情形。见 SRC-302 8 U.S.C. §§1151(b)(2)(A)(i)、1153(a)–(b)，SRC-309 8 CFR §245.2(a)(2)(i)、7 USCIS-PM A.6(A)，PD-272。
- **C33 境内收件。** 已填行程显示模拟日或原定收件日在境外时，按返美日期和递交渠道重算。审核复现中，2026-11-23 的在美递交条件为 `NOT_MET`，以 2026-12-01 为收件候选日时，路径递交和核准均为 `FUTURE`，两项日期均为 2026-12-01。受排期限制的案件按新的收件月和裁决月核对。行程缺资料时，境内收件条件为 `UNKNOWN`。见 SRC-309 I-485 Instructions p2、7 USCIS-PM A.6(C)(4)–(5)，SRC-081 1 USCIS-PM B.6(E)，PD-272。
- **C37 领馆 VAWA。** C33 与 C37 共用获批证据判断。明确获批，或同案同时有 NVC 递件授权与 DS-260 提交记录时，C37 公共负担豁免生效。审核复现的两种填法均在 2026-11-23 可递件，核准为 `FUTURE`，日期为 2026-12-10。见 SRC-309 DOS NVC Processing Step 2、Online Application Step 6，SRC-311 8 U.S.C. §1182(a)(4)(E)(i)。

#### 其他递交地点条件

| 路径或表格 | 核对结果 | 出处 |
|---|---|---|
| P8 难民／庇护 I-485 | 按返美日和纸质收件日核对在美递交。累计实际在美时间归裁决阶段，预测时跳过已填离境行程。 | SRC-309 I-485 Instructions p2，SRC-314 7 USCIS-PM L.2(B)、M.2(A)，PD-274。 |
| P1／P2 普通及公民配偶 N-400 | 核对递交前累计实际在美、连续居住及适用辖区居住。短期出境的回归继续按这些条件评估。 | SRC-079 8 U.S.C. §§1427(a)、1430(a)，SRC-080 8 CFR §316.2(a)(3)–(5)，SRC-081 12 USCIS-PM D.3–D.4，SRC-082 N-400 Instructions。 |
| P9 军人 N-400 | 按服役路径核对荣誉服役、入伍地点、身份及适用居住抵算。服役路径设有境外办理条款。 | SRC-315 8 U.S.C. §§1439、1440 及 12 USCIS-PM I.2–I.3。 |
| P3 I-751／I-829 | 法规允许在境外递交。按适用要求返美参加面谈。 | SRC-080 8 CFR §216.4(a)(4)、§216.6(a)(3)。 |
| P4 I-131 回美证 | 递交时须在美国。C22 可用新增的美国专用输入 `permitFiledOn` 与已填行程核对历史收件地点，并继续接受原有在美递交及境内生物识别证据。P4 汇总日期仍为返美日期。 | SRC-300 8 CFR §223.2(b)(1)、I-131 Instructions p4，PD-274。 |
| P4 I-90 换卡 | C19 核对换卡义务与已递交记录。I-90 说明另列申请人在境外时的生物识别安排。 | SRC-299 8 CFR §264.5，另核对 [I-90 Instructions p2](https://www.uscis.gov/sites/default/files/document/forms/i-90instr.pdf#page=2)。 |
| DS-260、DS-117、I-131A | 领馆相关表格各按 NVC 或使领馆流程递交。 | SRC-309 DOS Online Application Step 6，SRC-300 22 CFR §42.22(a) 及 I-131A Payment 递交说明。 |
| I-131 Advance Parole 与难民旅行证 | 基于待决 I-485 的 Advance Parole 核对境内申请类别。难民旅行证原则上在美国递交，法规可裁量接受境外申请。引擎现有辅助费用项用于估费。 | SRC-300 I-131 Instructions p7、8 CFR §223.2(b)(2)。 |
| I-601A 临时非法居留豁免 | 须在美国递交及提供所需生物识别。C40 使用个案豁免证据评估准入，I-601A 是独立申请流程。 | SRC-311 [8 CFR §212.7(e)(3)(i)、(6)](https://www.ecfr.gov/current/title-8/section-212.7#p-212.7(e))。 |

### 2. 怎么验证的

- 设置 `VITEST_MAX_WORKERS=2` 后运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码 0。全仓 5,656 项测试通过，其中 Engine 3,623 项，1 项既有用例跳过。构建生成 27 个静态页面，包含 `/united-states`。
- 专项回归断言两条审核复现的阶段状态及日期。组合表按显式类别和亲属事实推断分别运行，并覆盖 I-140 推断、类别不明、跨月／纸质收件、行程留空、难民调整、回美证收件证据和 VAWA 的两种获批证据。
- `git diff --check` 通过。对照 `09d3cb50`，旧 `evaluateUnitedStates` 实现、时间参数、专项测试、共用结果结构及网页一致。待定事项仅更新 PD-272、PD-274。

### 3. 没做或没验证的

- 改动留在 `fable/86-us-rules` 工作树供 Fable 提交。浏览器端到端留待 PR 验收。

### 4. 发现与建议

- 行程只有日期精度。推算时从出境日到返美前一日按境外处理，返美当日须在实际入境后递交。调用方可用空行程列表明确确认无相关行程。

## 第十三轮审核修正（review86-13）

### 1. 做了什么

PROGRESS 605 建议提交为 `Fix: 统一美国调整身份类别与获批证据，重核顺延收件条件（review86-13）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

| 共用判断 | 使用的检查 |
|---|---|
| 调整身份类别 | C25–C27 的 I-864 适用与豁免、C33 的基础请愿／排期／入境及同时递交、C34 的 §245(k) 和即时亲属例外、C37 与 C40 的 SIJ／VAWA 等类别例外、`FILING-CHANNEL`、C44 的 I-864 费用适用及领馆费分类。亲属／职业专用路径给出大类，通用路径采用明确类别或按亲属与职业资料推断。提供职业子类的通用路径同样运行适用的 C28–C32。见 SRC-302 8 U.S.C. §§1151(b)(2)(A)(i)、1153(a)–(b)，SRC-303 8 CFR §213a.2(a)(2)，SRC-309 8 U.S.C. §1255(a)、(c)、(k)，SRC-311 8 U.S.C. §1182(a)(4)(D)–(E)、(9)(B)(iii)(IV)，SRC-082 网申清单与 SRC-317 22 CFR §22.1 items 32–34。 |
| 基础请愿获批 | C28／C31 判断职业请愿是否已经递交，C33 核对递交及核准前置条件，C37 适用公共负担豁免，C40 适用移民史法定例外及 VAWA 非法居留例外。明确获批，或有同案 NVC 递件授权与 DS-260 提交记录，均可确认获批。VAWA 例外仍核对所需的个案证据。见 SRC-309 7 USCIS-PM A.6(A)、DOS NVC Processing Step 2 及 Online Application Step 6，SRC-311 8 U.S.C. §1182(a)(4)(E)(i)、(9)(B)(iii)(IV)。 |

引擎先按返美行程、递交渠道及纸件收件日历确定候选日，再检查适用条件和汇总路径。裁决时点单独判断，历史请愿按实际收件日核对。候选日有适用条件为 `NOT_MET` 或 `UNKNOWN` 时，省略相应阶段的日期。已明确待定的情况沿用 PD-260、264、272、274–277。见 SRC-081 1 USCIS-PM B.6(E)，SRC-309 I-485 Instructions p2 及 7 USCIS-PM A.6(C)(4)–(5)。

| 日期条件 | 使用的时点 |
|---|---|
| C23／C24／C33 的亲属年龄、前婚担保及 CSPA | 已知的历史 I-130 收件日或首次同时递交的候选收件日。已确认的 CSPA 年龄仍有效，缺资料的年龄边界待核。见 SRC-302 8 U.S.C. §§1151(f)、1154(a)(2)、1153(h)，8 CFR §204.2(a)(1)(i)。 |
| C25／C26 的 I-864 年度收入表、受益人及担保人年龄 | 按适用的递交日核对。生日或适用年度表不足时，使用已有证据判断，无法确认的条件为 `UNKNOWN`。见 SRC-303 8 U.S.C. §1183a(f)(1)、I-864 Instructions pp8、14、16，SRC-304 91 FR 1797–1798 与 I-864P 地区表。 |
| C28 的 PERM 和 C31 的 EB-5 金额 | 首次同件递交按顺延后的 USCIS 收件日重算。已有 I-140 用历史收件日。已提供的历史 EB-5 请愿收件日保留。新的 EB-5 门槛缺公告资料时返回 `UNKNOWN`。见 SRC-305 20 CFR §656.30(b)(1)、6 USCIS-PM E.6(B)(1)，SRC-302 8 U.S.C. §1153(b)(5)(C)(iii)。 |
| C33 的两张排期表和 C36 的 I-693 | 分别使用收件月和裁决月。按收件日核对体检随件要求及适用的有效期，并在裁决日复核。难民／庇护的预计裁决日还考虑在美累计期限。见 SRC-309 7 USCIS-PM A.6(C)(4)–(5)、I-485 Instructions p11 Item 9，SRC-312 8 USCIS-PM B.9、PA-2025-08 pp1–2，SRC-314 7 USCIS-PM L.2(B)、M.2(A)。 |
| C37–C40 的政策或准入期限 | C37 采用已提供且与安排相符的邮戳，缺邮戳时用候选收件日估算。C38、C39 的申请日期限按 I-485 收件或领馆正式面谈日核对。C40 分别按适用的递交、裁决日期核对非法居留禁令。见 SRC-313 91 FR 45324 §I.D，SRC-311 8 U.S.C. §1182(a)(2)(A)(ii)(I)、(3)(D)、(9)(B)，SRC-309 22 CFR §42.67(a)(3)。 |
| 入籍与费用 | C01、C03–C04、C08–C10 与 C43 使用候选 N-400 收件日核对相应的年龄、考试、品格口径和军人递交时限。C44 的 I-485 儿童费使用收件日年龄，适用邮戳的费用表及 C45 用所填邮戳或候选日估算。费用仍作提示。见 SRC-080 8 CFR §316.2(a)(2)，SRC-291–295，SRC-315 8 U.S.C. §§1439–1440，SRC-316 Form G-1055 I-485 栏及 SRC-318 91 FR 61940。 |

### 2. 怎么验证的

- 设置 `VITEST_MAX_WORKERS=2` 后运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码 0。全仓 5,667 项测试通过，其中 Engine 3,634 项，1 项既有用例跳过。构建导出 27 个静态页面，包含 `/united-states`。
- 先在修改引擎前复现审核的五项失败断言。专项测试以相同输入比较显式与推断类别的两阶段和日期。VAWA 领馆案在请愿状态留空和填获批时，C37 与 C40 一致，核准均为 `FUTURE`，日期为 `2026-12-10`。
- PERM 回归覆盖职业和通用调整。模拟日有效的 PERM 在 `2026-12-01` 返美收件时已过期，C28 为 `NOT_MET`，两阶段均无日期。及时递交的历史 I-140 仍可显示该返美日。另验证跨月排期、年龄与 CSPA、I-693 到期、EB-5 门槛跨期、N-400 最低年龄和 I-485 儿童费。
- 美国新旧专项测试通过 433 项。`git diff --check` 通过。对照 `7ac0b6c0`，旧 `evaluateUnitedStates`、旧时间参数、原专项测试、共用结果结构及 Web 文件的 diff 为空。待定事项更新限于 PD-272、274、276、277。

### 3. 没做或没验证的

- 改动留在 `fable/86-us-rules` 工作树供 Fable 提交。浏览器端到端待 PR 验收。

### 4. 发现与建议

- 行程只有出入境日期。§245(k) 的违法或违规累计仍依赖用户提供的记录。年龄跨界涉及缺失生日或类别转换时，相关检查有赖个案证据。

## 第十四轮审核修正（review86-14）

### 1. 做了什么

PROGRESS 606 建议提交为 `Fix: 按美国移民类别筛选检查并按请愿时点推导年龄（review86-14）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- **I-864。** EB-5 的 I-526／I-526E、已确认自递交的 I-140、VAWA、SIJ 以及可排除两项亲属触发条件的雇主请愿，直接跳过 C25–C27 的担保资料。亲属雇主案分别核对适格亲属是否递交 I-140、是否达到企业持股门槛。若无法排除遗漏的一项，则适用性为 `UNKNOWN`。普通亲属案可从本案请愿人推导主担保人的身份和年龄。已提交 I-864 可进入普通担保核对，无需同时声明未申请豁免。如果按普通及现役优惠门槛评估所得结果一致，无须再填现役状态。EB-5 回归在两个入口均为两阶段 `MET`，日期均为 `2026-11-23`。见 SRC-303，8 CFR §213a.2(a)(2)(i)–(ii)、8 U.S.C. §1183a(f)(3)、I-864 Instructions pp3、8、14、16，PD-276。
- **亲属年龄和排期。** 公民父母递交 I-130 的成年未婚子女，用出生日期和实际收件日核对，无需单填 CSPA 年龄。F1 审核复现中，两张表关闭时 C33 及两阶段均为 `NOT_MET`，没有递交或核准日期。F2A 的请愿人后来入籍时可填写 `family.petitionerNaturalizedOn`。已知 I-130 收件日和入籍日可推导递交时身份。也可用 `family.petitionerAtFiling` 提供历史身份，例如已知当年是永久居民而入籍日期未确认。通常以入籍日年龄判断能否转即时亲属。当时未达到年龄上限则适用即时亲属，达到上限则继续核对优先排期。入籍日缺失且能改变结果时为 `UNKNOWN`。有适用的巡回区例外时接受已确认的转类 CSPA 年龄，例外待核可填 `cspaAge: 'pending'`。见 SRC-302，8 U.S.C. §§1151(f)(1)–(2)、1153(h) 和归档的 9 FAM 502.1-1(D)(7)(1)–(2)，PD-272。

下表省略检查 ID 的 `US-` 前缀。“推导与取值”同时记录本轮新增的推导和复核过的既有逻辑。P1 一般入籍，P2 公民配偶入籍，P3 取消条件，P4 维持永居与返美，P5 亲属移民，P6 职业与投资移民，P7 通用境内调整或领馆，P8 难民或庇护调整，P9 军人入籍。领馆的 NVC 递件与签证核准分别检查。

| 检查 | 适用类别 | 推导与取值 |
|---|---|---|
| `TIME-LPR`、`TIME-CONTINUOUS-RESIDENCE`、`TIME-PHYSICAL-PRESENCE`、`TIME-LPR-APPROVAL` | P1、P2。完整永居年限周年日用于核准。 | 从永久居民起算日、行程、收件日和适用路径推导。 |
| `TIME-MARRIAGE`、`TIME-SPOUSE-CITIZENSHIP` | P2 | 从结婚日和配偶公民身份起算日推导。未填后者可用已确认的配偶公民身份期间。 |
| `TIME-CONDITIONS-FILING`、`CONDITIONS-SPECIAL-TIMING`、`CONDITIONS-TYPE` | P3。特别时点限单独、豁免或逾期递交。类型留空时提示确认。 | 从条件居留起算日、主副申请关系、例外及渠道确定窗口和收件日。 |
| `TIME-TRAVEL` | P4，绿卡单证返美时限提示 | 由行程日期计算。使用回美证、SB-1 等另看 C22。 |
| `TIME-I485-PRESENCE` | P5–P7 的境内调整及 P8 | 从行程和渠道推导预计返美收件日。明确无相关旅行可核对在境内。 |
| `TIME-PAPER-RECEIPT`、`FILING-CHANNEL` | USCIS 办理阶段。时点提示限实际顺延的纸件，渠道检查限已选或可能影响结果的网申。 | 从渠道、类别、同时递交和 USCIS 工作日历确定。领馆采用 NVC 开放日。 |
| C01-AGE、C02-LAWFUL-LPR | P1、P2、P9。敌对期入籍免最低年龄，适用地点入伍者免 LPR 条件。 | 生日和收件日确定最低年龄。普通永久居民跳过解除条件资料，合资格入伍地点可代替永居依据。合法性和递解记录仍分别核对。 |
| C03-ENGLISH、C04-CIVICS、C05-N648 | P1、P2、P9 核准。C05 仅在提出 N-648 时评估，属于提示。 | 收件日、生日及累计在美 LPR 年限用于考试版本、英语豁免和简版公民考试。通过考试无需依赖豁免，有效医学证据按实际请求的考试项适用。 |
| C06-GMC、C07-PERMANENT-GMC-BARS、C08-STATUTORY-GMC-BARS | P1、P2、P9 | 路径和服役类别确定品格期间。定罪日、刑期、次数及物质分类用于法定子项。CIMT 为零时不要求轻罪例外资料。全貌审查等独立结论保留。 |
| C09-ATTACHMENT、C10-SELECTIVE-SERVICE、C11-MILITARY-BARS、C12-OATH | P1、P2、P9。宣誓只影响核准。 | 原党籍的终止年龄可由生日和退党日期确定。登记适用年龄从生日、收件日和品格期确定。明确不适用或已登记时跳过补登事实。改誓和免誓按个案决定。 |
| C13-MARITAL-UNION | P2 | 从配偶公民身份起算日和收件日核对公民身份期间，无需另填等效判断。同住和至宣誓仍持续的情况独立确认。 |
| C14-DISTRICT、C14-RESIDENCE-THROUGH-OATH、C14-TRUTHFULNESS | 辖区限 P1、P2。持续居住用于 P1、P2 及需要通常居住条件的迟交和平期 P9。披露适用 P1、P2、P9。 | 辖区从起住日、候选收件日及适用的面谈日计算。和平期军人迟交从退役日及收件日计算。持续居住与披露待事实确认。 |
| C15-BONA-FIDE-MARRIAGE、C16-I751-FILING | P3 的婚姻条件居留，包括符合条件的随行子女 | 结婚日与条件居留起算日确定时间范围。主副申请人的起算日可确定子女单独递交资格。联名、单独及各类豁免分支各取所需事实。极端困难分支跳过善意婚姻证明。 |
| C17-CAPITAL、C17-I829-PAPER、C17-JOBS | P3 的投资条件居留 | 首次投资请愿收件日确定是否适用 RIA 前规则，条件居留起算日用于旧法持续投资周年日。渠道固定为纸件。非区域中心跳过间接岗位比例，必要时使用已确认的就业例外。 |
| C18-REGISTRATION、C19-ADDRESS、C19-REPLACEMENT | P4 在美义务提示 | 生日判断携证及年龄换卡。尚未到相应生日或取得永居时已超过该换卡年龄的情况跳过年龄换卡所需的到期日。搬家日与申报日确定时限，无搬家则跳过。条件卡续期走取消条件。 |
| C20-SEEKING-ADMISSION、C21-DEPORTABILITY | P4。C20 用于返美，C21 用于境内递解审查。 | 行程可确定离境天数触发条件。只有触发新入境审查时再运行 C36–C40。递解分项用违法日期、合法入境日、刑期及已确认的独立事由。 |
| C22-RETURN-DOCUMENT、C22-RESIDENCE-INTENT | P4，有实际返美行程时核对证件及居留意图 | 确认无相关行程时跳过返美证和返美意图证据。历史 I-131 收件日加行程可推导递交地点。签发日和适用期限可推导回美证到期日。其余证件按实际种类取值。 |
| C23-RELATIONSHIP、C24-PETITION-BARS | P5 的 I-130。P7 使用 C33 核对类别及请愿状态。 | 当前身份可由已发生的入籍推导。亲属类型决定是否核对请愿人年龄、前婚取得居留或递解中结婚。亲生子女跳过继养资料，未达到普通收养年龄上限时无需确认较宽的兄弟姐妹例外。婚姻欺诈与 Adam Walsh 单独核对。 |
| C25-SUPPORT-INCOME、C26-SPONSOR、C27-SUPPORT-EXEMPTION | P5–P7 有 I-864 义务或适用性未定的类别。P8 法免。 | 按请愿表格和亲属触发条件先筛选。确认个人豁免则跳过 C25、C26。使用家庭人口、地区、收入、已确认身份及适用的年龄／费率推导能否达标。 |
| `EMPLOYMENT-CATEGORY`、`EMPLOYMENT-MARRIAGE-FRAUD` | P6 及 P7 已提供的职业分类。职业专用入口缺子类时提示确认。 | 职业类别从已填子类或 I-140 收件证据确认大类。婚姻欺诈仍需独立资料。 |
| C28-OFFER-PERM、C29-ABILITY-TO-PAY | P6／P7 的 EB-2 PERM 与 EB-3 | 按 I-140 实际或候选收件日推导 PERM 有效性。Schedule A 用所需通知、工资、费用或合规确认，跳过普通 PERM 招聘步骤。工资差额用已付工资和合资格财务证据核对。 |
| C30-SELF-PETITION-EVIDENCE、C30-SELF-PETITION-MERITS | P6／P7 的 EB-1A 或 EB-2 NIW | EB-1A 走奖项、常规或可比证据，NIW 走学位、经验或杰出能力及三个审查条件。各自只使用对应证据。个案终局审查独立。 |
| C31-INVESTMENT-AMOUNT、C31-INVESTMENT-PROJECT、C31-INVESTMENT-JOBS | P6／P7 的 EB-5 | 按 I-526／I-526E 收件日和项目类别确定金额。从已知或预计在险期限、已创造就业或合资格招聘计划核对。独立投资者不要求区域中心项目或间接就业证据。 |
| C32-GOLD-PROCESS、C32-GOLD-GIFT、C32-GOLD-ALLOCATION | P6／P7 的 Gold Card，分类和排期用于核准 | 按赠与方与人数推导赠与额和处理费。最终分类与排期缺案卷时待确认。 |
| C33-VISA-AND-ENTRY | P5–P7 | 亲属即时类别按关系、身份、对应收件／入籍日推导。确认的即时亲属跳过排期表，领馆仍需 NVC 授权。通用路径以明确类别或亲属／职业事实确认请愿类型。境内按返美后的收件月份核对，领馆按授权开放日。核准另用裁决月份。NVC 授权加已提交 DS-260 可确认基础请愿获批。 |
| `NVC-DS-260`、`NVC-CIVIL-DOCUMENTS` | P5–P7 领馆 | DS-260 已提交可确认适用费用已处理。民事文件缺失说明可用于递件，是否可签发由领馆裁决。 |
| C34-ADJUSTMENT-BARS、C35-DISCRETION | P5–P7 境内调整。裁量用于核准。 | 即时亲属、VAWA 和 SIJ 跳过相应的身份违规及 §245(k) 字段，零违规天数也无需依赖 §245(k)。§245(i) 使用该例外。各类独立禁令或裁量仍须核对。 |
| C36-HEALTH | P5–P7 的办案方式已知时、P8、P4 触发寻求入境时。领馆只影响核准。 | 由收件日和 I-693 签署日判断随件要求与有效期。适用的难民部分疫苗记录及领馆指定医生体检分流。健康和疫苗结论分别核对。 |
| C37-PUBLIC-CHARGE | 同 C36。确认免审的类别跳过个案字段。 | 由方式、邮戳或实际收件日及法定类别决定所用口径。获批 VAWA／SIJ 或适用 INA 209(c) 可确定相应法定豁免。 |
| C38-CRIMINAL-INADMISSIBILITY、C39-SECURITY | 同 C36。返美 C39 跳过移民签证类党籍子项。 | 犯罪例外用罪名、次数、刑期、年龄及适用申请日。原党籍用生日与退党日期推导终止年龄，用申请日判断期限。安全及其他独立犯罪事由依案卷。 |
| C40-IMMIGRATION-HISTORY | 同 C36 | 适用时以离境日、非法居留天数、收件／裁决日确定期限。法定类别排除相应字段，仍核对独立的欺诈、再入境或其他准入事由。 |
| C41-HUMANITARIAN-PRESENCE、C41-HUMANITARIAN-STATUS、C42-HUMANITARIAN-WAIVER | P8。累计在美时间、庇护裁量和豁免决定用于核准。难民跳过庇护专用事实。 | 现有累计天数和已知行程可推算达到日期。适用的准入项全部通过且无豁免案件记录时，可判断无需另报 INA 209(c) 豁免。独立待审事由仍待审。 |
| C43-SERVICE、C43-LPR-OR-ENLISTMENT、C43-CERTIFICATION、C43-FILING-BASIS、C43-LATE-RESIDENCE | P9。和平期核对面谈时 LPR。迟交抵算仅和平期迟交适用。 | 服役日期与敌对期重叠时段可判断对应服役期。退役状态决定证明类别和是否迟交。住地、认证、背景及抵算分别核对。 |
| C44-N400、C44-N336、C44-I751、C44-I829 | P1、P2、P9 的入籍或复核费用，以及 P3 对应取消条件表格 | 从军人类别或已确认的 I-751 家暴豁免识别免缴，其他按渠道、费率和减免证据。 |
| C44-I90、C44-I131、C44-DS117、C44-SB1-IV、C44-I131A、C44-AR11、C44-G325R、C44-TRAVEL-FORM | P4 所选表格。表格未选时仅显示选项提示。 | 表格决定费率和渠道。I-90 的年龄换卡费由生日、卡到期日与递交日核对。I-131 回美证按纸件处理。 |
| C44-I130、C44-I864、C44-I140、C44-I907、C44-EB5-PETITION、C44-I140G | P5 初始 I-130，P5–P7 适用 I-864，P6 对应职业或投资表格及选加急 | C44-I864 复用 C27，法免类别跳过。由独立投资或区域中心、修正类型、雇主规模、是否自递交及申请人数推导其他费用。可用渠道费率相同则无需单填渠道来确定金额。 |
| C44-I485、C44-I485A、C44-IMMIGRANT-VISA、C44-IMMIGRANT-FEE | P5–P7 对应境内或领馆流程，P8 的 I-485。Supplement A 按选用情况。 | 由实际收件年龄、是否与父母同交、渠道、费用豁免和类别推导。难民 I-485 免缴。领馆签证费按类别查表。 |
| C44-ADVANCE-PAROLE、C44-REFUGEE-TRAVEL、C44-HR1、C45-FEE-RELIEF | 另选旅行证件或适用 H.R. 1 附加项目。C45 只提示适用的减免和法定费用。 | 按所选表格、年龄、难民类别、已知 I-485 情况和生效日计算。表格没有减免且未选申请时无需填写减免资格。 |

### 2. 怎么验证的

- 专项回归先复现原结论。EB-5 在职业和通用路径误报 `UNKNOWN`；普通成年 F1 在亲属和通用路径误报 `UNKNOWN`；F2A 的父母在受益人达到年龄上限后入籍和缺入籍日两组原先都错误放行。
- 新回归比较两阶段结果、日期和适用标记。另覆盖有真实亲属持股的职业案、已知自递交、现役字段留空、Schedule A、无返美行程、配偶公民身份期间、党籍年龄及无须 INA 209(c) 豁免。
- 设置 `VITEST_MAX_WORKERS=2` 后，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,683 项测试通过，Engine 通过 3,650 项并跳过 1 项既有用例。构建生成 27 个静态页面，包括 `/united-states`。
- 对照报告覆盖全部 102 个检查 ID。代码和文档的 `git diff --check` 通过。新增 9 FAM 快照保留官网原始行尾与空白，SHA-256 与 SRC-302 登记一致。

### 3. 没做或没验证的

- 改动留在 `fable/86-us-rules` 工作树供 Fable 提交。浏览器端到端和线上核对待 PR 验收。
- 既有 `evaluateUnitedStates`、旧时间参数与测试、共用结果结构及网页文件对照 `612572ff` 一致。

### 4. 发现与建议

- 后续问卷可只在亲属请愿人身份发生变化或历史身份待核时询问 `petitionerAtFiling`，并在永久居民递交后入籍的案件收集 `petitionerNaturalizedOn`。旧请求只填请愿人身份、没有身份变更记录时，普通 I-130 沿用已填身份核对。
- 如主张归档 FAM 所载的巡回区例外，还须核实适用管辖、请愿待决期间、签证可用日期及是否及时寻求取得身份。引擎接受本案已核实的 CSPA 年龄或待定状态，依据见 SRC-302、PD-272。

## 第十五轮审核修正（review86-15）

### 1. 做了什么

PROGRESS 607 建议提交为 `Fix: 修正美国 Schedule A 通知、F2A 转类及职业调整禁令（review86-15）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- **C28，Schedule A。** 核对递交前 30–180 天的通知窗口、张贴及雇主费用，保留普通 PERM 招聘步骤的跳过逻辑。通知晚于或早于窗口、合规结论明确为否时为 `NOT_MET`。缺通知时间时为 `UNKNOWN`。首次与 I-485 同时递交且资料有效时可给递交日，核准仍取决于基础请愿获批。见 SRC-305，20 CFR §§656.10(d)(1)、(2)(ii)、(3)(iv)、(6)、656.15(b)(2) 和 PD-277。
- **C33，F2A 转类。** 已知 I-130 历史收件日且结论取决于当年请愿人身份时，用明确的递交时身份或入籍日判断。两项都缺失且两张排期表关闭时，审核复现的递交、核准均为 `UNKNOWN`，不返回日期。达到年龄上限后才递交的成年 F1 仍按优先排期判断。见 SRC-302，8 U.S.C. §1151(f)(1)–(2) 和 PD-272。
- **C34，职业调整。** 单独核对 INA §245(c)(7)。仅有 parole、未确认另有合法非移民身份且已知不符合 §245(k) 的 EB-2 审核复现，即使累计违规为零或 `otherAdjustmentBar` 留空，两阶段也为 `NOT_MET`。缺少可能适用的 §245(k) 证据时为 `UNKNOWN`。可用 `lawfulNonimmigrantStatusAtFiling` 填报独立确认的递交时身份。C33 仍按 §245(a) 认可 parole 入境。见 SRC-309，8 U.S.C. §1255(a)、(c)(7)、(k)，8 CFR §245.1(b)(9) 和 PD-274。

### 2. 怎么验证的

- 确认修改前 `HEAD` 为 `cf2019ba` 且工作树干净。修改前后分别运行 Engine 的两个美国专项文件及 Web 的美国专项文件。用 Vitest JSON 按用例全名比对，449 项既有 Engine 回归（含历轮审核用例）和 8 项 Web 回归前后都通过。另有 18 项新 Engine 回归覆盖三个审核事项。临时审核用例在两次运行中使用相同的输入，覆盖 18 组复现与对照，未写入仓库。
- 按用例、入口和输入匹配每次评估。43 次旧版 `evaluateUnitedStates` 输出逐字段一致。1,365 次完整版评估中，1,351 次的输出结论一致。其余 14 次调用的变化限于 C28、C33、C34，以及对应的递交状态、核准状态、日期或待确认提示。此次比较保留适用标记，排除两项有更新的解释文字和来源定位。同一输入可能被多条断言调用。
- 逐项核查审核复现。Schedule A 的合规窗口内仍可先递交。通知超出窗口或明确合规否定阻止递交，缺时间时待核。原 F2A 缺历史身份的两个入口从两阶段 `MET` 改为 `UNKNOWN`。原 parole 的 EB-2 复现从两阶段 `MET` 改为 `NOT_MET`。普通 EB-5 的 I-864 适用性、普通成年 F1 双表关闭以及已有历史资料的 F2A 转类回归继续通过。
- `pnpm --filter e2e exec playwright test united-states.spec.ts --project=desktop --workers=1` 加临时配置，分别在修改前已有的静态产物和本轮新构建产物上各通过 1 项。默认 Chromium 启动触发 macOS Mach port 权限错误，临时配置以单进程和进程内 GPU 启动，沿用同一套浏览器断言。
- 设置 `VITEST_MAX_WORKERS=2` 后，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,701 项测试通过，跳过 1 项既有用例。构建生成 27 个静态页面，包括 `/united-states`。`git diff --check` 通过。

### 3. 没做或没验证的

- 改动留在 `fable/86-us-rules` 工作树。旧时间入口、网页组件及共用结果结构与 `cf2019ba` 一致。
- 未核对线上部署。

### 4. 发现与建议

- 后续问卷可在历史身份会影响转类时收集 `petitionerAtFiling` 或 `petitionerNaturalizedOn`，并在职业调整中收集收件时的合法非移民身份及 §245(k) 所需证据。

## 第十六轮审核修正（review86-16）

### 1. 做了什么

PROGRESS 608 建议提交为 `Fix: 沿用美国请愿获批认定并统一调整资格检查（review86-16）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

有效的同案 EB-2 PERM／EB-3 I-140 批准支持 C28 的以下历史认定。审批待决或拟递交时，仍按对应规则检查。明确填报晚于模拟日的历史收件日，仍须核对请愿状态与收件日。

| 获批即视为满足的 C28 条件 | 官方依据 |
| --- | --- |
| Schedule A 原通知及时间、适用劳工认证与职业资格 | SRC-305，20 CFR §§656.15(b)、(e)，其中通知见 §656.10(d)(1)(i)–(ii)、(3)(iv)、(6)。 |
| 普通 PERM 的州就业订单、广告、其他适用招聘步骤、可用美国工人及原通知 | SRC-305，20 CFR §§656.10(d)、656.17(e)、(g)、656.24(b)–(d)。 |
| 普通 PERM 已在有效期内用于该 I-140 | SRC-305，20 CFR §656.30(b)(1) 及 6 USCIS-PM E.6(B)(1)。 |
| 历史雇主费用、原职位的工资标准及受益人的职业分类资格 | SRC-305，20 CFR §§656.12(b)、656.15(b)、656.40。SRC-302，8 CFR §204.5(k)(3)–(4)、(l)(3)。 |

- **现行条件。** C28 继续核对获批职位的有效邀约与接受意向。C29 继续核对雇主支付能力。工作邀约明确失效时为 `NOT_MET`，缺现行证据时对应条件为 `UNKNOWN`。两阶段继续核对当前基础、排期、准入和其他调整条件。见 SRC-309，8 CFR §245.25(a) 和 7 USCIS-PM A.6(B)，SRC-302，8 CFR §204.5(g)(2)，PD-277。
- **通知与实际日期。** 有管辖权的工会代表时提交实际通知日，否则提交同一次连续张贴所覆盖的实际工作日。引擎按实际或候选 I-140 收件日检查 Schedule A 通知窗口，纸件顺延及返美调整计入候选收件日。普通 PERM 按实际或候选 ETA-9089 收件日检查订单、广告与通知，按 I-140 收件日检查认证有效期。缺少适用方式或必要日期时为 `UNKNOWN`。见 SRC-305，20 CFR §§656.10(d)(1)(i)–(ii)、(3)(iv)、656.15(b)(2)、656.17(e)、656.30(b)(1)，PD-277。
- **入口一致性。** `US-ADJUSTMENT` 推断为亲属时复用 C23、C24，识别职业子类后沿用专门入口的对应职业检查。匹配类别的两个入口共用担保、准入及调整检查。继亲关系须在受益人满 18 岁前成立。见 SRC-079，8 U.S.C. §1101(b)(1)(B)，SRC-302，8 U.S.C. §§1151、1153–1154，PD-272、PD-274。

### 2. 怎么验证的

- 修改前 `HEAD` 为 `6db1f68c`，工作树干净。修改前后分别运行 Engine 的两个美国测试文件和 Web 的美国测试文件。既有 467 项 Engine 测试（含历轮审核回归）和 8 项 Web 测试均通过。新增 66 项 Engine 测试，其中 55 组用同一夹具对照通用和专门入口的资格检查、共有费用检查、两阶段结论与日期。更新的历史断言覆盖本轮明确改变的获批行为，既有通知边界用等价实际日期重跑。
- 从逐项记录中取出 365 组可推断为同一专门类别的独立亲属及职业输入。只替换入口重跑后，共有资格检查、两阶段结论与日期均一致。
- 从 `6db1f68` 独立取出基线代码，与当前工作树逐项记录评估结果。另复跑上轮 18 组复现与对照，以及本轮 8 组审核复现。43 次旧 `evaluateUnitedStates` 输出逐字段一致。1,448 次可比完整版评估中，1,427 次的共有检查和两阶段结论一致，21 次变化限于 C28 或新纳入的 C23／C24 及相关日期。比较时忽略检查顺序、解释文字及来源定位，保留状态、适用性、阶段日期和待确认条目。一次旧断言重复读取了同一结果，修正后合并为一次读取。

| 审核复现 | `6db1f68` | 本轮 |
| --- | --- | --- |
| 已获批 Schedule A，缺原通知，两入口 | 两阶段 `UNKNOWN`，无日期 | 两阶段 `MET`，均为 `2026-11-23` |
| 已通知工会的 Schedule A 同时递交，两入口 | 两阶段 `NOT_MET` | 递交 `MET`，日期 `2026-11-23`。核准 `UNKNOWN`，等 I-140 获批 |
| 纸件顺延后通知距收件 181 天，两入口，SRC-305 §656.10(d)(3)(iv) | 按周日填报的相对值放行周一收件 | 两阶段 `NOT_MET`，无日期 |
| 继亲关系在受益人 19 岁时成立，通用入口 | 递交 `MET`，日期 `2026-11-23` | C23 和两阶段 `NOT_MET`，无日期，与亲属入口一致 |

- 设置 `VITEST_MAX_WORKERS=2` 后，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码为 0。全仓 5,767 项测试通过，跳过 1 项既有用例。构建生成 27 个静态页面，包括 `/united-states`。
- `pnpm --filter e2e exec playwright test united-states.spec.ts --project=desktop --workers=1` 使用临时 Chromium 单进程配置，分别在修改前的静态产物和最终构建产物上各通过 1 项。`git diff --check` 通过。

### 3. 没做或没验证的

- 改动留在 `fable/86-us-rules` 工作树，未提交或部署。网页继续调用原时间入口，共用结果结构沿用现有定义。

### 4. 发现与建议

- 完整版调用方可分别采集 ETA-9089 与 I-140 的收件日，并按适用通知方式采集工会通知日或张贴记录。采用张贴时，提供同一次连续张贴内已确认的工作日，缺资料时按 PD-277 待确认。

## 第十七轮审核修正（review86-17）

### 1. 做了什么

PROGRESS 609。建议提交为 `Fix: 统一美国前置审批事实并支持职业转换（review86-17）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

完整版在入口按本案类别解析审批事实表。获批行提供已认定的历史事实。C23、C24、C28–C32、C33、C37 和 C40 使用适用的认定或法定例外。领馆案继续使用同案 NVC 递件授权与 DS-260 提交记录确认基础请愿。已填实际请愿收件日却晚于模拟日的案件，将请愿时点交 C33 待核。当前基础仍由 `qualifyingBasis` 确认。两阶段继续分别核对适用排期、境内资格、裁量、准入及担保。见 SRC-309，7 USCIS-PM A.6(A)–(E)。

统一适用规则（review86-18）。对表中每一行，有效的同案前置审批可覆盖留空的历史证据。明确填写的不利事实继续按相应条文核对，汇总与明细中的明确违规均可使对应条件为 `NOT_MET`。PERM 是否仍有效待主管机关确认时，用 `permCertificationValidity: 'pending'` 将 C28 留在 `UNKNOWN`。请愿作为当前基础的效力仍用 C33 的 `qualifyingBasis` 核对。已证实的独立违规仍保留其判断。见 SRC-305，20 CFR §656.12(b)–(c)，SRC-309，7 USCIS-PM A.6(A)–(B)，PD-272、PD-277。

| 同案前置审批 | 已覆盖的原审查事实 | I-485 或领馆阶段仍须核对 |
| --- | --- | --- |
| DOL 普通 PERM 认证 | 原通知、州就业订单及广告、适用的额外招聘步骤和结果、雇主费用、认证职位的工资与劳动条件。SRC-305，20 CFR §§656.10(c)(1)、(d)、656.12(b)、656.17(e)、(g)、656.24(b)–(d)。 | 认证及时用于该 I-140、职业分类资格、同案工作邀约及支付能力。仅有认证而 I-140 待决时，可按同时递交规则评估递交，核准仍等请愿获批。SRC-305，20 CFR §656.30(b)(1)、6 USCIS-PM E.6(B)(1)。SRC-302，8 CFR §204.5(g)(2)、(k)、(l)。 |
| I-130 批准 | 匹配关系的历史资格材料，包括继亲／收养成立时年龄、适用的收养监护和共同生活、父母／兄弟姐妹请愿的年龄门槛，以及原前婚、欺诈、递解程序中结婚、Adam Walsh 的请愿限制。SRC-079，8 U.S.C. §1101(b)(1)。SRC-302，8 U.S.C. §§1151(b)(2)(A)(i)、1154(a)(1)、(b)、(c)、(g)，8 CFR §204.2(a)(1)。 | 当前关系有效、身份和分类、适用 CSPA、I-864 及新出现的不利事实。C23 继续核对当前关系，C24 继续处理明确报告的冲突。SRC-302，8 U.S.C. §§1151(f)、1153(h)。SRC-303，8 CFR §213a.2。SRC-309，I-485 Instructions p9。 |
| I-140 EB-1A 批准 | 奖项、证据项数／同等证据及 final merits，含原请愿对赴美预期贡献的认定。SRC-302，8 U.S.C. §1153(b)(1)(A)，8 CFR §204.5(h)(3)–(5)。SRC-306，6 USCIS-PM F.2(B)。 | 拟继续在原领域工作及适用的意向证明。SRC-309，I-485 Instructions p10。 |
| I-140 EB-1B 批准 | 教授或研究员的国际认可、教学或研究经历、原聘方及永久职位资格。SRC-302，8 CFR §204.5(i)(2)–(3)。 | 有效永久职位和适用的支付能力。符合 INA §204(j) 时可凭新邀约。SRC-302，8 CFR §204.5(g)(2)。SRC-309，8 CFR §245.25(a)，I-485 Instructions pp10、19。 |
| I-140 EB-1C 批准 | 跨国企业关系、原境外管理或高管任职、美国请愿企业及管理或高管职位资格。SRC-302，8 CFR §204.5(j)(2)–(3)、(5)。 | 按雇主类核对现行邀约及适用的支付能力。SRC-302，8 CFR §204.5(g)(2)。SRC-309，8 CFR §245.25(a)。 |
| I-140 EB-2 PERM 批准 | 同案 PERM 及时使用、原认证工资、原通知与招聘、费用以及高级学位或特殊能力等分类资格。SRC-305，20 CFR §§656.12(b)、656.24(b)–(d)、656.30(b)(1)。SRC-302，8 CFR §204.5(k)(3)–(4)。 | 持续有效的原邀约或合格新邀约。用原邀约时继续核对支付能力。SRC-302，8 CFR §204.5(g)(2)。SRC-309，8 CFR §245.25(a)。 |
| I-140 EB-3 批准 | 同案 PERM 的原招聘、通知、费用、工资和及时使用，以及技术工人、专业人员或其他工人的原资格。SRC-305，20 CFR §§656.12(b)、656.24(b)–(d)、656.30(b)(1)。SRC-302，8 CFR §204.5(l)(3)。 | 现行邀约及适用支付能力。SRC-302，8 CFR §204.5(g)(2)。SRC-309，8 CFR §245.25(a)。 |
| I-140 批准，适用 Schedule A | USCIS 已审查适用职业资格、分类、Schedule A 劳工认证、原通知方式与时间、费用及工资。SRC-305，20 CFR §§656.10(d)、656.12(b)、656.15(b)、(e)。 | 现行邀约及适用支付能力。待决时仍按实际 I-140 收件日核对原通知。SRC-305，20 CFR §656.15(b)(2)。SRC-309，8 CFR §245.25(a)。 |
| I-140 EB-2 NIW 批准 | 原高级学位／特殊能力资格、三项 NIW 认定和工作邀约／PERM 豁免。SRC-302，8 U.S.C. §1153(b)(2)(B)，8 CFR §204.5(k)(3)–(4)。SRC-306，6 USCIS-PM F.5(D)。 | 拟继续原领域或工作计划并具备适用证明。NIW 医师等个案另核对服务及完成证据，由 C33 接收当前法律结论。SRC-309，I-485 Instructions pp10、19。 |
| I-526 批准 | 独立投资的原本金、原资金来源与在险证据、企业／地区资格和初始就业证据或就业计划。SRC-302，8 U.S.C. §1153(b)(5)(A)–(D)。SRC-307，6 USCIS-PM G.2、I-526 Instructions p9 Item 5。 | C33 核对投资基础继续有效及重大变化。适用的实际持续投资和就业证据另在 I-829 审查。SRC-309，7 USCIS-PM A.6(A)–(B)、I-485 Instructions p20。SRC-298，6 USCIS-PM G.7。 |
| I-526E 批准 | 同案区域中心投资的原本金、资金来源、项目与在险证据，以及就业计划和适用的间接就业依据。SRC-302，8 U.S.C. §1153(b)(5)(A)–(D)、(F)。SRC-307，6 USCIS-PM G.2、G.4 及 I-526E Instructions。 | C33 核对投资基础继续有效及项目重大变化。I-829 按适用投资规则和项目证据另审。SRC-309，7 USCIS-PM A.6(A)–(B)、I-485 Instructions p20。SRC-298，6 USCIS-PM G.7。 |
| I-360 VAWA 批准 | 原适用关系、虐待或极端残酷、同住及品格等自请愿分类认定。SRC-302，8 U.S.C. §1154(a)(1)(A)(iii)–(iv)、(vii)、(B)(ii)–(iii)。 | 自请愿仍构成有效基础、适用排期与独立准入。按调整或领馆路径核对法定豁免及非法居留个案例外。SRC-309，8 U.S.C. §1255(a)、I-485 Instructions 的 VAWA 项。SRC-311，8 U.S.C. §1182(a)(4)、(9)(B)(iii)(IV)。 |
| I-360 SIJ 批准 | 原递件年龄、婚姻状态、在美、州少年法庭的监护／团聚／最佳利益裁定及 DHS 同意。SRC-079，8 U.S.C. §1101(a)(27)(J)。SRC-302，8 CFR §204.11(b)–(d)。 | SIJ 分类仍有效、适用 EB-4 排期、独立准入。获批后适用法定假释与准入例外。法院后续团聚或最佳利益裁定变化可能触发撤销，仍核对个案。SRC-302，8 CFR §204.11(j)。SRC-309，8 U.S.C. §1255(h)、I-485 Instructions p21。 |
| I-140G 批准 | 原登记、处理费以及申报资金充足、合法来源和拟依法转账。SRC-308，I-140G Instructions pp1–2。 | 适用领馆流程、面谈、签发前以 `giftTransferred` 核对足额转账凭证，分类和排期按 PD-266 继续待核。SRC-308，I-140G Instructions pp1–3。 |

- 对适用 INA §204(c) 的职业请愿，已获批覆盖原禁令审查。明确申报的既往婚姻欺诈仍影响结论。亲属或职业专门入口明确选择 VAWA／SIJ 时，沿用通用入口的 I-360 检查，并省略原入口不适用的 I-130／I-140 报价。见 SRC-302，8 U.S.C. §1154(b)–(c)，SRC-309，I-485 Instructions 的 VAWA 与 SIJ 项。
- `jobPortability` 分别记录本案 I-485 实际待决起日、原邀约在递交时有效、新邀约与双方意向、职业相似性认定、Supplement J 实际递交日。待决满 180 天且及时提出的合格新邀约可满足 C28 核准。仍待决的 I-140 由 C33 继续等待批准，C29 核对优先日至 I-140 递交日的支付能力。原邀约失效后，资料不全时核准为 `UNKNOWN`。当前状态仍用 `employmentOffer` 表示原请愿职位。见 SRC-302，8 U.S.C. §1154(j)，SRC-305，6 USCIS-PM E.4(D)(5)，SRC-309，8 CFR §245.25(a)(2)–(3)、(b) 与 I-485 Instructions pp10、19。
- 待确认沿用 PD-266、274、276–278。表格只对当前引擎建模的请愿类别实施历史事实抵用。移民类别或审批有效性无法确认时保留相应待确认结论。

### 2. 怎么验证的

- 从干净的 `1622257` 工作树开始，前后分别运行 Engine 两个美国专项文件及 Web 美国专项文件。533 项既有 Engine 测试和 8 项 Web 测试均通过，另有 26 项新 Engine 测试通过。历史分类门槛测试用待决请愿检查原证据要求。两阶段结果、日期和证据缺失边界分别断言。
- 用同一份 `1622257` 测试输入逐次回放，包含测试内的历轮审核复现和额外的第十五至十七轮原输入。43 次旧 `evaluateUnitedStates` 调用逐字段一致。1,620 次完整版调用里，1,561 次的检查结论、适用性、待确认条目和两阶段日期一致。59 次变化限于本轮覆盖的 C24、C28、C30、C31 和 C32，其中 29 次的两阶段状态或日期有变化。比较保留检查状态和递交状态，忽略解释文字和来源数组。同一输入可被不同断言重复调用。
- 第十六轮的已批准 Schedule A 缺原通知、提前 45 天通知工会、纸件顺延后通知距收件 181 天、以及继亲关系在 19 岁时成立的两入口复现维持基线结论。通知和继亲阈值见 SRC-305，20 CFR §§656.10(d)(3)(iv)、656.15(b)(2)，SRC-079，8 U.S.C. §1101(b)(1)(B)。
- 设置 `VITEST_MAX_WORKERS=2` 后，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,793 项测试通过，跳过 1 项既有测试。构建生成 27 个静态页面，包括 `/united-states`。
- `pnpm --filter e2e exec playwright test united-states.spec.ts --project=desktop --workers=1` 使用临时 Chromium 单进程配置，基线和本轮构建各通过 1 项。`git diff --check` 通过。

| 第十七轮原复现，两入口 | `1622257` | 本轮 |
| --- | --- | --- |
| 公民配偶的 I-130 有效，缺原 C24 材料 | 两阶段 `UNKNOWN`，无日期 | 两阶段 `MET`，最早日期均为 `2026-11-23` |
| 普通 PERM 已认证，I-140 待决，缺原招聘资料 | 两阶段 `UNKNOWN`，无日期 | 递交 `MET`，最早 `2026-11-23`。核准 `UNKNOWN`，无日期 |
| EB-1A I-140 有效，缺原奖项、证据项数与终审 | 两阶段 `UNKNOWN`，无日期 | 两阶段 `MET`，最早日期均为 `2026-11-23` |

### 3. 没做或没验证的

- 工作树保留改动供 Fable 提交。共用结果结构和网页组件未更改。浏览器测试覆盖旧美国页面，完整版尚由引擎测试验证。未核对线上部署。

### 4. 发现与建议

- 调用方需用 `qualifyingBasis` 传入当前基础及重大变化的核对结果。对换雇主案件，`i485PendingSince` 和 `supplementJFiledOn` 分别来自本案实际记录。两阶段输出的模拟日期沿用现有结果语义，原 I-485 收件日用于计算职业转换资格。

## 第十八轮审核修正（review86-18）

### 1. 做了什么

PROGRESS 610。建议提交为 `Fix: 保留美国不利事实并核对首次随件与历史排期（review86-18）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- **前置审批事实。** 缺原件或历史输入时沿用有效的同案审批。C28 同时检查 PERM 汇总和明细，明确报告的费用违规、通知、工资或分类问题继续判定。确认雇主追收其应付费用时，C28 为 `NOT_MET`。认证效力待核时用 `employment.permCertificationValidity: 'pending'`，C28 为 `UNKNOWN`，包括 I-140 仍待决的申请。表中 14 行均有明确不利事实的双入口回归，含 I-130、两类 I-360、各 I-140 与 Schedule A、两类 EB-5 请愿及 I-140G。见各行的 SRC 定位，另见 SRC-305，20 CFR §656.12(b)–(c)，PD-272、PD-277。
- **首次 I-485 的 Supplement J。** 雇主担保 I-140 已获批且依赖工作邀约时，主申请人首次 I-485 随件用 `employment.initialSupplementJIncluded` 核对。明确未随附为 `NOT_MET`，留空为 `UNKNOWN`。保留 I-140 同件或待决时的例外。可用 `admission.i485ApplicantRole` 标明随行身份。原邀约和职业转换分别继续用 `employmentOffer` 和 `jobPortability`。见 SRC-309，I-485 Instructions p10 Item 8，PD-277。
- **原收件月排期。** C33 用 `admission.i485FiledOn` 或职业转换记录的 `i485PendingSince` 识别已合法递交的 I-485，按实际收件月的 USCIS 指定排期表核对递交。缺原月份表时为 `UNKNOWN`。最终名额用裁决月的 Final Action Dates，排期倒退只阻止核准。已收件的案件无需顺延至下一个纸件工作日。见 SRC-309，7 USCIS-PM A.6(C)(4)–(5)，PD-272。

### 2. 怎么验证的

- 在 `828cca3` 归档和本轮代码对照回放美国 Engine 专项用例及历轮审核复现，包括第十五至十七轮保留的原输入。旧 `evaluateUnitedStates` 的 43 次完整输出逐字段一致。1,900 次既有完整版调用中，1,661 次检查结论、适用性、待确认条目和两阶段状态及日期一致。197 次差异来自新增随件检查，42 次来自缺原月份表而重新核对 C33，其中两阶段状态或日期共变动 153 次。按既有用例已经假定的条件补报随件已齐或原月份表可用后，1,900 次原有检查结论和两阶段结果全部相同。比较排除说明文字和来源数组。
- 本轮新增 27 项 Engine 回归。新增用例的 168 次调用继续与 `828cca3` 对照，两阶段状态、日期和检查差异均限于本轮范围。第十七轮的三项缺历史材料复现保持通过，职业转换缺 Supplement J 时核准继续为 `UNKNOWN`。
- 设置 `VITEST_MAX_WORKERS=2` 后，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,820 项测试通过，跳过 1 项既有测试。构建生成 27 个静态页面，已核对 `/united-states` 导出文件。美国专项 Engine 从 559 项增至 586 项，Web 的 8 项既有测试均通过。`git diff --check` 通过。
- `pnpm --filter e2e exec playwright test united-states.spec.ts --project=desktop --workers=1` 使用临时 Chromium 单进程配置，在 `828cca3` 的归档构建和本轮构建各通过 1 项。

| 第十八轮复现，两入口 | `828cca3` | 本轮 |
| --- | --- | --- |
| 普通 PERM 已认证，仅招聘明细明确雇主追收费用，I-140 待决 | 递交 `MET`，最早 `2026-11-23`。核准 `UNKNOWN`，无日期 | 两阶段 `NOT_MET`，均无日期 |
| 雇主 I-140 已获批，首次 I-485 明确缺 Supplement J | 两阶段 `MET`，最早均为 `2026-11-23` | 两阶段 `NOT_MET`，均无日期。随附件留空时两阶段 `UNKNOWN` |
| 职业转换案已于五月收件，原表可用，十一月倒退 | 两阶段 `NOT_MET`，均无日期 | 递交 `MET`，模拟日 `2026-11-23`。核准 `NOT_MET`，无日期 |

### 3. 没做或没验证的

- 未提交。共用结果结构和网页组件沿用现有实现，未核对线上部署。

### 4. 发现与建议

- 首次递交调用方应单独采集签妥的随附表。已收件案件应从当月 USCIS 公告核实指定表并明确传入；输出日期继续表示本次模拟结果。

## 第十九轮审核修正（review86-19）

### 1. 做了什么

PROGRESS 611。建议提交为 `Fix: 统一美国检查时点并处理明确否定与缺失子类（review86-19）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- 已收件的 I-485 按原收件日核对随件、排期和境内递交条件。仍可规划的案件用按渠道和返美日调整后的候选收件日。明确提供且顺序有效的裁决日用于核准检查，包括回溯裁决。历史申请的 `earliestDate` 继续表示本次模拟的可递交结论，原收件日作为证据时点使用。
- 每项检查先用对应阶段判断适用性，再合并必需条件。明确否定适用且独立的条件即为 `NOT_MET`。已获批记录、待决程序和缺少其他答案均保留该判断。法定例外、获准豁免和可替代证据仍按条文核对。待决 NIW 可后补签署声明，明确不拟继续原领域或工作计划时，C30 在递交和核准均为 `NOT_MET`。待决或缺资料本身依适用规则呈现 `UNKNOWN`。见 SRC-309，I-485 Instructions p10 Item 8。
- `US-ADJUSTMENT` 识别为职业大类时，无论职业子类是否已填，都与 `US-EMPLOYMENT` 调用同一检查。子类留空时 `EMPLOYMENT-CATEGORY` 为 `UNKNOWN`，须先确认是雇主担保、职业自申还是其他职业分类，才能核对首次 Supplement J 等子类条件。已明确的独立条件继续按案判断。见 SRC-302，8 CFR §204.5(h)–(l)，SRC-309，I-485 Instructions p10 Item 8。

#### 检查与取用日期

| 检查 | 递交、申报或原始证据日期 | 核准或复核日期与依据 |
| --- | --- | --- |
| `FILING-CHANNEL`、`TIME-PAPER-RECEIPT`、`TIME-I485-PRESENCE` | 实际收件，或按渠道及返美日顺延的候选收件。NVC 用获授权的递件日。 | 递交日期供后续裁决核验。SRC-081，1 USCIS-PM B.6(E)，SRC-082 网申清单，SRC-309 I-485 Instructions p2、NVC Processing Step 2。 |
| `TIME-LPR`、`TIME-CONTINUOUS-RESIDENCE`、`TIME-PHYSICAL-PRESENCE`、`TIME-MARRIAGE`、`TIME-SPOUSE-CITIZENSHIP`、`C01`、`C14-DISTRICT` | N-400 候选收件日。适用提前递交且辖区居住期尚未届满时，按面谈日核对该条件。 | `TIME-LPR-APPROVAL` 最早到完整居住期周年日。已知提前递交面谈日时，按该日核对辖区居住。SRC-079，8 U.S.C. §§1427(a)、1430(a)、1445(a)，SRC-080，8 CFR §§316.5(b)(1)(i)、334.2(b)，SRC-081，12 USCIS-PM D.6(D)。 |
| `C02–C05` | C02 用原永居准入和递解记录判断。C03 及 C04 的豁免、简版资格和题库用 N-400 收件日。 | C02 复核移除条件的处理结果。C03 至 C05 按面谈、重考或医学例外结论核对。SRC-290，12 USCIS-PM D.2，SRC-291–292，8 CFR §312.5(a)、12 USCIS-PM E.2–E.3、PA-2025-24 pp1–2。 |
| `C06–C13`、`C14-TRUTHFULNESS`、`C14-RESIDENCE-THROUGH-OATH` | GMC 期间、党籍期限和 Selective Service 适用期从法定事件及 N-400 收件日核对。永久性禁令用相应行为或定罪日。共同生活截至收件，披露按申请事实。 | GMC、持续居住、配偶资格及誓词按适用情形延续至宣誓。SRC-079，8 U.S.C. §§1101(f)、1427(a)、1430(a)，SRC-293–296，12 USCIS-PM F.2、D.7(B)、J.3，8 U.S.C. §§1424–1426、1448。 |
| `TIME-CONDITIONS-FILING`、`CONDITIONS-*`、`C15–C17` | I-751／I-829 用条件居留起日、窗口和候选收件日，婚姻条件另用结婚日。投资适用规则用原 I-526／I-526E 收件日。 | I-751 的面谈及豁免结论用于裁决。RIA 前 I-829 持续投资核对至条件居留周年日，其他持续投资和就业按裁决阶段的个案证据。SRC-079，8 U.S.C. §§1186a(c)–(d)、1186b(d)，SRC-297，6 USCIS-PM I.2–I.3，SRC-298，6 USCIS-PM G.7(A) 注 4。 |
| `TIME-TRAVEL`、`C18–C22`、触发入境审查时的 `C36–C40` | C18–C19 以模拟日查当前义务，按生日、迁居、证件到期或实际申报计期限。C21 刑事条款用原准入日和行为日等个案事实。 | C20、C22、准入审查用实际或计划返美日、离境起止和证件有效期。回美证申请地点用原 I-131 收件日。SRC-079，8 U.S.C. §1101(a)(13)(C)，SRC-080，8 CFR §§211.1、211.3，SRC-299–301，8 U.S.C. §§1227(a)、1304(e)、1305(a)，8 CFR §§223.2(b)、223.3(a)、264.5(b)、265.1。 |
| `C23–C24`、`EMPLOYMENT-MARRIAGE-FRAUD`、亲属 C33 | 原关系成立、I-130 实际或同件候选收件、请愿人入籍和适用 CSPA 锁龄日。对基础请愿的历史禁令用其自身事实。 | 以递交日和裁决日分别确认有效分类及适用排期。SRC-079，8 U.S.C. §1101(b)(1)，SRC-302，8 U.S.C. §§1151(f)、1153(h)、1154(c)、(g)，8 CFR §204.2(a)(1)。 |
| `C25–C27` | I-864 递件使用收件或 NVC 材料阶段的证据。收入年度及关联年龄通常按 I-485 实际／候选收件或正式签证申请日。 | 裁决沿用该收入年度及适用证据。依法要求更新收入资料时按个案通知核对。SRC-303，8 CFR §213a.2(a)(1)(v)、(c)(1)–(2)，SRC-304，I-864P 地区表，PD-276。 |
| `EMPLOYMENT-CATEGORY`、`C28`、`I485-INITIAL-SUPPLEMENT-J`、`C29` | 类别用本案资料。普通 PERM 招聘用 ETA-9089；PERM 有效期及 Schedule A 通知用 I-140 实际或同件候选收件。原邀约及首次所需 Supplement J 用 I-485 收件日。 | 裁决时复核原邀约或新邀约。须同时满足裁决日已达待决期限、Supplement J 提交时已达该期限且提交不晚于裁决。支付能力通常查优先日至获永居，适用待决转换时查至 I-140 收件。SRC-302，8 U.S.C. §1154(j)、8 CFR §204.5(g)(2)，SRC-305，20 CFR §§656.10(d)、656.15(b)、656.30(b)(1)，6 USCIS-PM E.4(D)(5)，SRC-309，8 CFR §245.25(a)、I-485 Instructions p10。 |
| `C30–C32` | 自申证据和 EB-5 投资适用原请愿时点；I-526／I-526E 本金用实际或候选请愿收件。Gold Card 按 I-140G 登记及处理费阶段。 | 自申意向及基础仍有效性按阶段核对；赠与汇款凭证在签发前核对。SRC-302，8 U.S.C. §1153(b)(5)(C)，SRC-306，6 USCIS-PM F.2(B)、F.5(D)，SRC-307，I-526 Instructions p9，SRC-308，I-140G Instructions pp1–3，SRC-309，I-485 Instructions p10。 |
| `C33–C35`、`NVC-DS-260`、`NVC-CIVIL-DOCUMENTS` | 境内用实际或候选收件日核对当月指定表、在美、查验及调整禁令。领馆按 NVC 授权和递件记录。 | 基础有效性、Final Action Dates、境内裁量和领馆缺件说明按裁决核对。违法天数及非移民身份用原 I-485 递交事实。SRC-309，7 USCIS-PM A.6(A)–(C)，8 U.S.C. §1255(c)、(k)，DOS Submit Documents Step 9，SRC-310，7 USCIS-PM A.10。 |
| `C36` | 用实际或候选 I-485 收件日确定当时是否须随附 I-693 或部分疫苗记录。按需要复核已提供的签署日。 | 在裁决日复核有效性、个案绑定、健康与疫苗结论。领馆在面谈通知后安排指定医生体检，签发前核对。SRC-309，I-485 Instructions p11 Item 9，SRC-312，Form I-693 页首、旧 I-485 Instructions Item 10、PA-2025-08 pp1–2。 |
| `C37–C40` | 境内公共负担规则以邮戳或电子递交日为准，缺邮戳时用收件日估算。未成年 CIMT、原党籍等法定申请期限，境内用收件，领馆用正式申请面谈日。 | 公共负担和其他实质准入结论在适用的裁决或返美阶段核对。境内 C40 用收件及裁决时点，领馆非法居留禁令用裁决日。SRC-311，8 U.S.C. §1182(a)(2)(A)(ii)、(3)(D)(iii)、(9)(B)(i)，SRC-313，91 FR 45324 DATES、I.D，SRC-309，22 CFR §42.67(a)(3)。 |
| `C41–C42` | I-485 收件日核对实际在美、适用身份及豁免材料。 | INA 209 裁决日核对累计在美、庇护裁量和豁免。历史天数资料仅在可确定时给出结论。SRC-314，8 U.S.C. §1159(a)–(c)，7 USCIS-PM L.2(B)、L.3、M.2(A)、M.3。 |
| `C43` | N-400 收件日核对适用服役期、入伍资格、在役或退役及证明。 | 和平期按面谈核对 LPR，核准时核对背景。SRC-315，8 U.S.C. §§1439、1440，12 USCIS-PM I.2–I.3。 |
| `C44–C45` | 费用提示优先使用所报表单的付费递交或邮戳日，缺资料时按该次收件作估算。I-485 儿童费率看收件年龄。 | 费用与减免仍是独立提示。SRC-316，G-1055 pp15–17、I-912 Instructions，SRC-317，22 CFR §22.1，SRC-318、319 生效条款。 |

`simulationDate` 仍是模拟的起点、相对年龄及人道在美日数的观察日期，以及按时间判断 `MET` 或 `FUTURE` 的参照。缺少可回溯的历史日期、适用排期或会改变判定的证据时，沿用 PD-264、272、274–277。

### 2. 怎么验证的

- 从干净的 `c695cf4` Git 归档运行新旧美国 Engine 和 Web 专项，前后分别为 586 和 621 项 Engine 用例。Web 前后各通过 8 项。新增 35 项 Engine 用例，包括第十六轮矩阵的 24 个职业子类留空变体。
- 用基线夹具和保留的审核原输入回放第 1–18 轮。旧 `evaluateUnitedStates` 的 43 次完整输出逐字段一致。2,068 次既有完整版调用中，2,043 次检查结论、递交与核准状态、日期及待确认项一致。25 次差异来自本轮的职业子类待确认（8 次）、EB-5 缺原请愿收件日（14 次）和 N-400 使用候选收件日（3 次），其中 9 次改变路径状态或日期。比较排除说明文字和来源数组。同一用例的多项断言可重复调用引擎。
- 既有 EB-5 回归补录本来假定已在同一政策期间递交的请愿收件日，继续检验原本金、在险和就业条件。第十二轮原输入只在大类已识别、职业子类仍留空时改为两阶段待确认。第十八轮的 168 次既有调用，两阶段状态和日期全部一致，包括 PERM 明细费用违规、已知雇主类别缺首次 Supplement J，以及原月可递交但裁决月排期倒退。
- 本轮专项及入口矩阵共 237 次同输入调用也与基线逐项对照。71 次变化均由本轮修正引起。包含 11 月历史体检递交、体检随件生效日、待决 NIW 的否定／留空／肯定回答，以及职业转换截止日和 Supplement J 的先后顺序。
- 设置 `VITEST_MAX_WORKERS=2`，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,855 项测试通过，跳过 1 项既有测试。构建生成 27 个静态页面，已核对美国导出页。
- `pnpm --filter e2e exec playwright test united-states.spec.ts --project=desktop --workers=1` 使用临时 Chromium 单进程配置，对基线和本轮的静态产物各通过 1 项。相关官方快照 SHA-256 与来源表一致，`git diff --check` 通过。

| 第十九轮原输入 | `c695cf4` | 本轮 |
| --- | --- | --- |
| 职业大类明确，职业子类留空且未附首次 Supplement J | 通用入口两阶段 `MET`，专门入口两阶段 `UNKNOWN` | 两入口两阶段均为 `UNKNOWN`，无日期 |
| EB-3 于 2024-11-29 收件，2024-12-03 模拟时体检待补 | 两入口两阶段 `UNKNOWN` | 两入口递交 `MET`，展示模拟日 2024-12-03。核准 `UNKNOWN`，无日期 |
| NIW 待决，明确不拟继续原领域或工作计划 | 两入口递交 `MET`，核准 `UNKNOWN` | 两入口两阶段均为 `NOT_MET`，无日期 |
| 五月 I-485 已收件，6 月 5 日裁决早于待决门槛及 11 月 Supplement J | 两入口递交、核准均为 `MET`，核准日显示 2026-06-05 | 两入口递交 `MET`，核准 `NOT_MET`，无核准日 |

### 3. 没做或没验证的

- 工作树改动留给 Fable 提交。共用结果结构、网页组件和只算时间的入口保持原实现。未核对部署环境。

### 4. 发现与建议

- 对历史案，调用方应分别提供 I-485 原收件、适用的基础请愿记录、裁决日和裁决时有效的证据。只填当前合计天数无法可靠还原临界日的人道在美天数时，C41 等待历史记录。

## 第二十轮审核修正（review86-20）

### 1. 做了什么

PROGRESS 612。建议提交为 `Fix: 修正美国已收件案件的规划门禁及两阶段证据核对（review86-20）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- C29 将 `wagePeriodComplete: false` 作为年度范围不完整。工资金额缺失时，有足额独立财务证据的年度仍可确认。已确定一年度短缺且其他证明途径也明确不成立时为 `NOT_MET`。见 SRC-302，8 CFR §204.5(g)(2)，SRC-305，6 USCIS-PM E.4(A)–(B)。
- C36 新增 `i693AtFiling` 与 `i693AtDecision`，分别核对首次随件与裁决时使用的新版。仍可用既有单份记录评估适用时点。仅报原收件后签署的旧字段记录时，首次随附件待确认。更早可补交的历史案件沿用原收件时的要求。见 SRC-312，Form I-693 页首、PA-2025-08 pp1–2，以及 SRC-309，I-485 Instructions p11 Item 9。
- C33 新增 `i485BasisTransfer`。原请愿用 `originalPetition` 提供原请愿收件、原 I-485 收件时的资格及适用排期。USCIS 准予转换且在所评估的裁决日已生效时，用现有请愿字段和裁决月 Final Action Dates 核对替换请愿。转换缺正式确认时，仍可评估原递交，核准留待确认。见 SRC-309，7 USCIS-PM A.6(C)、A.8(A)、(C)、(E)。

#### 缺失、默认值与字段替用核查

| 位置与检查 | 核查结果 |
| --- | --- |
| `check.ts`、`types.ts`，共用三值逻辑、默认参数和字段定义 | 核对 `all`、`any`、`not`、`reviewed`、数值比较、段落与来源默认值。明确否定可决定必需条件。独立替代途径仍可成立时，按替代证据合并。 |
| `index.ts`，全部 `TIME-*`、`FILING-CHANNEL`、`CONDITIONS-*`、候选收件与汇总 | 核对旧时间调用的必填参数、纸件默认、是否实际收件、行程、月度排期、候选日和阶段状态。I-751 方式缺失且单独或豁免递交仍有可能时，即使联名逾期理由被拒，时点仍为 `UNKNOWN`。见 SRC-082 When to File、SRC-297，6 USCIS-PM I.2–I.3。 |
| `naturalization.ts`，C01–C14、C43 | 核对考试分数与题库、年龄与身份、党籍例外、品格和定罪、誓词、军人申请依据和服役期间的留空处理。服役、考试或案件事实无法确认时保留现有待确认规则。 |
| `maintenance.ts`，C15–C22 | 核对当事人与主申请人的条件居留日期、婚姻、申报和更换义务、离境触发、回美证计算和官方个案认定。已确认的证件结论可支撑相应检查。 |
| `petition.ts`、`immigration.ts`，C23–C32、`EMPLOYMENT-*`、`I485-INITIAL-SUPPLEMENT-J` | 核对请愿获批证据、亲属身份和年龄锁定、I-864 人口与资产、PERM 招聘、工资支付、自申、投资和 Gold Card。C29 按上述规则保留资料不全。C28 职业转换的原邀约须用收件时的原邀约事实。见 SRC-309，8 CFR §245.25(a)。 |
| `admission.ts`，C33–C42、`NVC-*` | 核对收件和裁决月份、查验与合法非移民身份、历史请愿和医检、法定例外与豁免、领馆文件及人道在美证据。C34 在职业案已有查验入境但未确认合法非移民身份或例外时为 `UNKNOWN`。见 SRC-309，8 U.S.C. §1255(c)(7)、(k)、8 CFR §245.1(b)(9)。 |
| `fees.ts`，全部 C44、C45 | 核对渠道、年龄、费用和减免、身份附带费及不同费用时点。费用估算继续作为提示，按下表收起已正式完成的 I-485 初次递交费用。 |

#### 仅用于规划递交的检查

| 检查 | 规划适用条件及已收件处理 |
| --- | --- |
| `FILING-CHANNEL`、`TIME-PAPER-RECEIPT` | 仅用来选择可用渠道并计算候选纸件收件日。已有 `i485FiledOn` 或已识别为职业调整的 `jobPortability.i485PendingSince` 时，保留实际收件日。见 SRC-081，1 USCIS-PM B.6(E)，SRC-082 网申清单，SRC-309，I-485 Instructions p2。 |
| `TIME-I485-PRESENCE` | 仅用于候选收件日的返美顺延。C33／C41 仍核对历史收件日在美事实。见 SRC-309，I-485 Instructions p2。 |
| `C44-I485`、`C44-I485A`、I-485 对应的 `C45-FEE-RELIEF` | 仅显示待递交 I-485 的费用及减免规划。独立的签证费用、旅行表格和 H.R. 1 项目仍按其适用事实判断。见 SRC-316，G-1055 I-485 栏及 I-912 Instructions。 |
| `I485-INITIAL-SUPPLEMENT-J` | 保留已在使用的首次递交门禁。已收件案的原邀约与职业转换 Supplement J 仍按适用事实检查。见 SRC-309，I-485 Instructions p10 Item 8，8 CFR §245.25(a)。 |
| `C32-GOLD-PROCESS` 的网申分项 | 只在 I-140G 尚未有合规收件事实时核对计划网申渠道。I-140G 已实际收件或其批准证据成立时，该分项有确定依据。原登记和领馆核准条件继续独立核对。见 SRC-308，Form I-140G「Where to File」「When to File」。 |
| `TIME-CONDITIONS-FILING`、`CONDITIONS-SPECIAL-TIMING`、`C17-I829-PAPER`、N-400 的候选收件规则 | 分别对应 I-751、I-829 或 N-400 的递交规划。美国输入没有相应已收件日期，I-485 收件证据也与这些表格无关。见 SRC-081、SRC-082、SRC-297–298。 |

### 2. 怎么验证的

- 从干净的 `ce975c9` 保存基线，由同一批输入重放。全部 2,384 次既有完整版调用的路径递交与核准状态以及日期一致，覆盖美国专项套件和第 1–19 轮复现（含保留的原始输入）。2,191 次的检查状态、适用性和待确认项也一致。193 次差异只涉及 154 次已收件 I-485 的两项费用提示及 39 次 C34 对独立合法非移民身份的待确认。比较排除说明文字与来源数组。旧 `evaluateUnitedStates` 的 43 次输出逐字段一致。同一测试可多次调用引擎。
- 新增 31 项回归，共捕获 110 次调用并在 `ce975c9` 归档上重放。覆盖真实收件与尚在规划、缺原件与有效补件、原请愿和替换请愿、缺年度与明确年度短缺，并核对历史 I-693 裁决、原工作邀约及独立身份等边界。
- 设置 `VITEST_MAX_WORKERS=2`，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,886 项测试通过，1 项既有测试跳过。构建生成 27 个静态页面，已核对美国导出页。
- `pnpm --filter e2e exec playwright test united-states.spec.ts --project=desktop --workers=1` 对 `ce975c9` 和本轮的美国静态页面各通过 1 项，使用临时 Chromium 单进程配置。基线归档的依赖通过符号链接复用，基线用 `next build --webpack` 构建。新存档的官方来源 SHA-256 与 SRC-309 登记一致。`git diff --check` 通过。

| 本轮复现 | `ce975c9` 两阶段 | 本轮两阶段 |
| --- | --- | --- |
| 8 月正式收件，只填 11 月签署的 I-693 | `NOT_MET`／`NOT_MET` | `UNKNOWN`／`UNKNOWN` |
| 同案补足首次随件的 I-693 资料 | `NOT_MET`／`NOT_MET` | `MET`／`MET` |
| 已正式收件，递交渠道留空 | `UNKNOWN`／`UNKNOWN` | `MET`／`MET` |
| 已填年度达标，其他年度的资料不完整 | `NOT_MET`／`NOT_MET` | `UNKNOWN`／`UNKNOWN` |
| 5 月凭原请愿收件，后获准转换到 7 月收件的新 I-140 | `UNKNOWN`／`UNKNOWN` | `MET`／`MET` |

### 3. 没做或没验证的

- 工作树交 Fable 提交。共用结果结构、美国页面和只算时间入口的实现保持原样。未验证部署环境。

### 4. 发现与建议

- 申请转换的个案在 USCIS 准予之前，供引擎确认的是原递交结果。转换是否满足资格连续、申请待决与转换请求时名额等条件，以 USCIS 个案确认和 SRC-309 为依据。需要独立评估请求成功可能性时，应另提供这些事实。

## 第二十一轮审核修正（review86-21）

### 1. 做了什么

PROGRESS 613。建议提交为 `Fix: 统一美国 I-693 两阶段核对并拆分换基请愿证据（review86-21）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- C36 的完整与部分 I-693 共用收件、裁决两阶段核对。首次随件使用原收件日及原件。已收件后才签署的旧格式输入可用于裁决，单凭这份材料无法确认首次随件。裁决所用补件独立核对签署日和个案绑定。仅凭所属类别无法确认所需部分或报告有效性时，按相应阶段输出 `UNKNOWN`，见 PD-275。
- 换基案件在 C33 核对原 I-485 收件、原请愿及原收件月排期。C28 和 C29 可分别接收 `originalPetition.employmentOfferAtFiling` 和 `originalPetition.abilityToPayAtFiling`。缺分项时可沿用明确确认的原请愿资格和支持证据汇总。分项的明确否定或待确认结论优先。替换请愿的证据用于核准，换基尚待确认时 C33 的核准结论为 `UNKNOWN`。见 SRC-309，7 USCIS-PM A.8(A)、(C)、(E)，PD-272、PD-277。

#### 调整身份所需的 I-693 范围

| 类别 | 适用材料 | SRC 定位 |
| --- | --- | --- |
| 即时亲属与亲属优先 | 通常为完整体检和疫苗记录。已做合格境外体检的 K 类另见下行。 | SRC-309，I-485 Instructions p11 Item 9；SRC-312，I-693 Instructions p7 FAQ Item 1。 |
| 职业调整，包括雇主担保、EB-1A、NIW 和 EB-5 | 通常为完整体检和疫苗记录。 | SRC-309，I-485 Instructions p11 Item 9；SRC-312，I-693 Instructions p7 FAQ Item 1。 |
| 难民 | 适用境外体检且无 Class A 发现时，交部分 I-693（Parts 1–5、7、10）。境外曾有 Class A 时须重做完整体检。 | SRC-312，I-693 Instructions p7 FAQ Item 2；SRC-314，7 USCIS-PM L.3(B)。 |
| 庇护 | 通常为完整体检和疫苗记录。符合境外体检、无 Class A、及时递交条件的庇护衍生申请人交部分 I-693（Parts 1–5、7、10）。 | SRC-312，I-693 Instructions pp7–8 FAQ Items 1、4；SRC-314，7 USCIS-PM M.3(B)。 |
| VAWA、SIJ、INA §245(i) 及其他境内调整 | 一般提交完整体检和疫苗记录。适用的个案例外按表单说明核对。 | SRC-309，I-485 Instructions p11 Item 9；SRC-312，I-693 Instructions p7 FAQ Item 1。 |
| 符合境外体检复用条件的 K 类 | 符合条件时可沿用境外体检及妥善归档的 DS-3025。缺合格疫苗记录时补部分 I-693（Parts 1–5、7、10）。 | SRC-312，I-693 Instructions pp7–8 FAQ Item 3。 |
| 符合条件的 Operation Allies Welcome 入境者 | 档案含符合时限的境外体检、未发现 Class A 且无入境后新发 Class A 的证据时，可适用免重做 I-693 的说明。 | SRC-312，I-693 Instructions p8 FAQ Item 5。 |

各类实际需交的完整表或部分表均适用 SRC-309，I-485 Instructions p11 Item 9，以及 SRC-312，Form I-693 页首生效说明和 PA-2025-08 pp1–2。`medicalEvidence` 接收对该案所需材料的确认。

#### 换基时按请愿取值的检查

| 检查 | 两阶段处理及依据 |
| --- | --- |
| C23–24 亲属关系与请愿禁令 | 核准用替换 I-130 的关系和请愿证据。原依据及支持证据在 C33 核对。SRC-302，8 U.S.C. §1154(a)–(c)、(g) 和 8 CFR §204.2(a)(1)；SRC-309，7 USCIS-PM A.8(C)、(E)。 |
| C25–27 I-864 | 适用性、请愿担保人及财务证据取对应依据。替换担保材料用于核准，原担保材料归入 C33 原依据确认。SRC-303，8 CFR §213a.2(a)(1)、(c)(1)，I-864 Instructions p3；SRC-309，7 USCIS-PM A.8(C)。 |
| C28 邀约、职业资格及 PERM 工资 | 原递交用原邀约和原请愿资格认定。职业分类、认证、招聘及 prevailing/proffered wage 按各自请愿的职位核对。替换 I-140 的职业转换用该基础适用的待决起日，缺起日则替代途径为 `UNKNOWN`。SRC-305，20 CFR §§656.10(c)(1)、656.15(b)、656.24(b)(3)；SRC-309，8 CFR §245.25(a)、7 USCIS-PM A.8(C)–(E)。 |
| C29 支付能力 | 原递交核对原雇主对原承诺工资的支付能力。核准用替换雇主及其承诺工资、年度记录和适用替代证据。SRC-302，8 CFR §204.5(g)(2)；SRC-305，6 USCIS-PM E.4(A)–(B)、(D)(5)。 |
| C30–32、职业请愿的婚姻欺诈禁令与首次 Supplement J | 自申、投资和其他请愿的证据依所属请愿核对。首次 Supplement J 对应原 I-485，替换依据及职业转换所需的证据在核准阶段核对。已建模的 Gold Card 走领馆流程。SRC-302，8 U.S.C. §1154(c)；SRC-306–308；SRC-309，7 USCIS-PM A.8(C)–(E)、I-485 Instructions p10 Item 8。 |
| C33–34 名额、入境和调整禁令 | 首次递交用原查验入境、分类、适用禁令及排期。核准按替换基础核对。SRC-309，8 U.S.C. §1255(a)、(c)、(k)、7 USCIS-PM A.6、A.8。 |
| C37、C40 分类相关的准入豁免 | C37 在核准阶段核对。C40 核对申请人的移民史。跨 VAWA／SIJ 换基所涉豁免应分别确认原案与替换案的适用资格，属于独立的准入证据。SRC-309，8 U.S.C. §1255(h)(2)，SRC-311，8 U.S.C. §1182(a)。 |

### 2. 怎么验证的

- 从 `fb62c5b` 运行美国 Engine 的 652 项和 Web 的 8 项既有专测，均通过。使用同一份输入在基线归档及本轮工作树回放美国专项套件和第 1–20 轮审核复现。旧 `evaluateUnitedStates` 的 43 次完整输出逐字段一致。完整版 2,494 次调用的路径递交和核准状态及日期全部一致。2,462 次检查结论、适用性和待确认项一致。32 次差异全属换基用例，仅改变 C25–29、C34 与职业请愿禁令的阶段标记或其关联待确认条目。比较检查时排除说明文字和来源数组。
- 本轮新增 19 项 Engine 回归。从同一批新增断言捕获 53 次调用，分别用 `fb62c5b` 和本轮引擎回放。14 次状态和日期一致，39 次差异均属于下表的 I-693 或换基证据问题及其边界。
- 设置 `VITEST_MAX_WORKERS=2` 后，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,905 项测试通过，1 项既有测试跳过。构建生成 27 个静态页面，已核对美国导出页。`git diff --check` 通过。
- `pnpm --filter e2e exec playwright test united-states.spec.ts --project=desktop --workers=1` 用临时 Chromium 单进程配置，对 `fb62c5b` 归档构建和本轮静态构建各通过 1 项。

| 第二十一轮复现 | `fb62c5b` 路径递交／核准 | 本轮路径递交／核准 |
| --- | --- | --- |
| 难民仅填原收件后签署的部分 I-693 | `MET`／`MET` | `UNKNOWN`／`UNKNOWN` |
| 难民首次随件有效，裁决补件绑定另一个已结案个案 | `MET`／`MET` | `MET`／`NOT_MET` |
| 难民首次随件、裁决补件各自有效 | `MET`／`MET` | `MET`／`MET` |
| 换基待确认，原邀约有效，替换邀约失效 | `NOT_MET`／`NOT_MET` | `MET`／`NOT_MET`。C33 仍为 `MET`／`UNKNOWN` |
| 换基待确认，替换职位工资或替换雇主支付能力未达标 | `NOT_MET`／`NOT_MET` | `MET`／`NOT_MET` |

### 3. 没做或没验证的

- 工作树交 Fable 提交。本轮验证覆盖本地及静态构建。
- 跨 VAWA／SIJ 换基时，C40 分类豁免的分阶段证据仍待单独核对。

### 4. 发现与建议

- 换基后，调用方分别从原案收件记录和替换请愿材料填值。当 SRC-309 的职业转换待决期间需要重计时，`admission.i485FiledOn` 保留原 I-485 收件日，`employment.jobPortability.i485PendingSince` 记录替换基础适用的起日。
- 医疗材料范围取决于原体检、疫苗记录和个案例外。引擎用 `medicalEvidence` 接收所需材料的个案确认，特殊境外体检复用或免表资格由案卷确定。见 PD-275。

## 第二十二轮审核修正（review86-22）

### 1. 做了什么

PROGRESS 614 建议提交为 `Fix: 核对美国调整待决事件并分阶段适用换基准入豁免（review86-22）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- `US-I485-PENDING-TRAVEL` 和 `US-I485-PENDING-ELIGIBILITY` 在美国境内调整入口共用同一收件至裁决窗口。逐次读取 `trips[].i485Travel`，并核对 `admission.i485PendingEvents` 中的基础资格、准入、程序、一般非移民身份到期和未经授权就业。仅在窗口内有相应记录时增加检查。两项都只参与核准汇总，`UNKNOWN` 或 `NOT_MET` 均省略核准日期。出入境采用日粒度，收件日或裁决日当天的离境也核对。见 SRC-309，8 CFR §§103.2(b)(1)、245.2(a)(4)(ii) 及 7 USCIS-PM A.6(B)。
- C40 分别按原基础和替换基础检查法定豁免。原 SIJ 分类已确认时，虚称美国公民按 INA §245(h)(2)(A) 排除。替换职业类仍须独立满足准入条件，原适用的 §1182(a)(9)(C) 等独立事由仍须核对。原基础的 VAWA 非法居留例外及 C36、C38、C40 个案豁免可在原请愿记录中单独提供。C37 公共负担仍属核准检查，使用核准类别。见 SRC-309，8 U.S.C. §1255(h)(2)，SRC-311，8 U.S.C. §1182(a)(1)–(2)、(4)、(6)(C)、(9)、(g)–(i)，SRC-313，Form I-485 Part 9 Item 56。
- 增补 SRC-309、SRC-314 定位说明和 PD-274。核准仍待确认的情形包括每次旅行的适用依据、程序发生后的个案效力、适用就业例外所需的累计天数、原案分类或豁免。沿用已登记的官方法规与 I-485 快照。

#### 从递交到裁决的条件

| 范围 | 持续资格、事件和适用时点 | 来源定位 |
| --- | --- | --- |
| 共用资格和请愿 | 适用的基础请愿须有效、待决 I-485 须未被撤回或视为放弃。撤回、撤销、拒绝、构成失格的重大变化、未答复 RFE／NOID 或缺席须到相应时点核对。已获准换基需原资格连续至提出换基请求，申请持续待决，再由替换依据支持核准。衍生换基还需原主申请资格及关系连续。 | SRC-302，8 U.S.C. §§1154、1155；SRC-309，8 CFR §§103.2(b)(1)、(6)、(13)、205.1，7 USCIS-PM A.6(A)–(B)、A.8(A)、(C)、(E)–(F)，I-485 Instructions p14。 |
| 共用准入和签证 | 适用准入条件贯穿个案。新增健康、刑事、安全、移民史或适用担保变化依准入条款和例外评估，采用有效的支持文件和个案豁免。名额按适用递交月及核准月分别核对。已妥善收件后的排期倒退会暂缓名额核准。裁量在适用的类别按裁决时全案处理。 | SRC-303，8 CFR §213a.2(a)(1)、(c)(1)；SRC-309，8 U.S.C. §1255(a)、8 CFR §103.2(b)(1)、7 USCIS-PM A.6(B)、(C)(4)–(5)；SRC-310–313，8 U.S.C. §1182(a)、(g)–(i)、PA-2025-08 pp1–2、91 FR 45324 DATES 与 §I.D。 |
| INA §245 家庭、职业、投资、SIJ、VAWA 和 §245(i) 的旅行 | 每次待决离境核对适用的 Advance Parole 和口岸查验返美，或相应例外。H-1/L-1 核对合法身份、继续具备资格、恢复为同一雇主工作及所需有效签证。H-4/L-2 核对主身份、衍生资格及所需有效签证。K-3/K-4 核对资格与有效签证，V 核对合法身份和以 V 准入，TPS 核对旅行授权及以 TPS 查验入境。递解程序中离境适用专门规则。 | SRC-309，8 CFR §245.2(a)(4)(ii)(A)–(D)、I-485 Instructions p14，INA §244(f)(3)。 |
| 非移民身份和就业 | 普通非移民身份的维持一般核对至正确递交。待决期间的身份到期、停工和未经授权就业须分开判断。若适用 §245(c)(8)，继续工作须有有效授权。职业 §245(k) 例外按适用合法入境后的累计违规天数核对，计入待决期间符合条文的未经授权就业。按即时亲属、VAWA、SIJ、§245(i) 等法定依据核对就业禁令是否适用。旅行例外或 T/U 等个案豁免所需的有效身份另核对。 | SRC-309，8 U.S.C. §1255(c)(2)、(7)–(8)、(i)、(k)，8 CFR §§245.1(b)(10)、274a.12(c)(9)，7 USCIS-PM B.4(B)、B.6(B)–(C)、B.8(E)；SRC-313，I-485 Part 9 Item 56。 |
| 即时亲属、家庭优先和衍生 | 核对适用关系、请愿人身份与分类的持续有效性。离婚、结婚、入籍、死亡、年龄变化均按适用分类、CSPA、自动转换、§204(l) 或遗孀／遗夫例外处理。§204(l) 适用时还核对死亡时及其后的美国居住。跟随移民的合资格关系须从主申请人成为 LPR 时延续至衍生裁决。K-1 依原请愿人及时缔结善意婚姻的裁决规则单列。 | SRC-302，8 U.S.C. §§1151(b)、(f)、1153(d)、(h)、1154(a)、(l)；SRC-309，7 USCIS-PM A.6(B)、8 CFR §205.1(a)(3)、8 U.S.C. §1255(d)、*Matter of Sesay*, 25 I&N Dec. 431, 439–40。 |
| 雇主职业类 EB-1B、EB-1C、EB-2 PERM、EB-3／Schedule A | 核对有效 I-140、适用的认证或分类、真实且仍有效的职位、双方意向和适用的持续支付能力。合法的同类或相似职业转换可用新邀约及 Supplement J。核对待决时长、原请愿以及变更后仍有效的依据，包括换基后的法定重新起算。衍生案核对主案及关系。 | SRC-302，8 U.S.C. §§1153(d)、1154(j)，8 CFR §204.5(g)(2)；SRC-305，6 USCIS-PM E.4(A)–(B)、(D)(5)；SRC-309，8 CFR §245.25、7 USCIS-PM A.8(D)、I-485 Instructions pp10、19。 |
| EB-1A、EB-2 NIW | 确认仍拟在原 EB-1A 领域工作或继续符合 NIW 的原事业计划。使用适用意向证明和重大变更记录。医师 NIW 另核对合资格服务、进度和完成证据，适用的地理或机构要求，以及转雇主处理。 | SRC-302，8 CFR §§204.5(h)、(k)、204.12；SRC-306，6 USCIS-PM F.2(B)、F.5(D)；SRC-309，8 CFR §245.18、7 USCIS-PM A.8 中 NIW 医师条目、I-485 Instructions pp10、19。 |
| EB-5 | 保持可支持调整的 I-526／I-526E 基础。适用的投资持续期、重大变更、区域中心或企业终止后的法定救济、就业或合资格计划按法版本与个案核对。衍生关系按共用规则。 | SRC-302，8 U.S.C. §1153(b)(5)(A)、(D)、(M)；SRC-307，6 USCIS-PM G.2、G.4，I-526 Instructions p9；SRC-309，7 USCIS-PM A.6(A)–(B)，I-485 Instructions p20。 |
| VAWA、SIJ 和 §245(i) | VAWA 保持有效自请分类，按特则处理关系、身份变化和再婚。SIJ 需有效分类，按规定核对法院裁定、重新团聚或最佳利益裁定等撤销事件。§245(i) 分别核对 grandfathering 和当前可用于调整的移民依据。 | SRC-302，8 U.S.C. §1154(a)(1)，8 CFR §§204.2(c)、204.11(d)、(j)；SRC-309，8 CFR §245.10(a)–(b)、8 U.S.C. §1255(h)、(i)，I-485 Instructions pp21–23。 |
| INA §209 难民 | 难民身份未终止、未已取得 LPR，裁决时达到适用的累计在美时间。出境按难民旅行证件及合资格返美记录核对。 | SRC-314，8 U.S.C. §1159(a)、(c)，7 USCIS-PM L.2(B)–(E)、L.3；SRC-300，8 CFR §§223.1(b)、223.2(b)(2)；SRC-309，I-485 Instructions p14。 |
| INA §209 庇护 | 核对庇护状态、难民定义或合资格衍生关系、未在外国稳定安置、累计在美时间及裁量。核对旅行证件、返美及可能影响庇护资格的重新求助原籍国事件。 | SRC-314，8 U.S.C. §1159(b)–(c)、7 USCIS-PM M.2(A)–(E)、M.3；SRC-300，8 CFR §§223.1(b)、223.2(b)(2)；SRC-309，I-485 Instructions p14。 |
| 其他专门 I-485 依据 | T/U 依专门法规核对连续在美及离境例外并复核适用身份、协助或豁免。T 主申请人另有适用的 GMC 持续期。DV 核对选中财年末前及名额可用时完成裁决、选择与衍生资格。Registry 核对持续居住，旅行的待决效力按其专门规则。CAA、HRIFA、NACARA、Lautenberg、Section 13 与其他特殊分类依各自法定时点检查在美、居住或衍生条件，按个案确认。 | SRC-302，8 U.S.C. §1154(a)(1)(I)(ii)(II)；SRC-309，8 U.S.C. §1255(l)–(m) 及法条注记，8 CFR §§245.2(a)(4)(iii)、245.3、245.7、245.23–245.24，I-485 Instructions p14 及 pp25–38 各专门类别。 |
| 领馆移民签证、Gold Card | 领馆流程核对当前请愿、资格、准入和裁决名额。已建模的 Gold Card 在领馆核对足额赠与及签发。 | SRC-308，I-140G Instructions pp1–3；SRC-309，DOS NVC 与 Final Action Dates；SRC-312，DOS Applicant Interview Step 11。 |

### 2. 怎么验证的

- 在 `46ec68c` 的干净工作树运行美国 Engine 两个测试文件，671 项通过，Web 美国测试 8 项通过。修改后 Engine 美国测试 696 项通过，含本轮新增 25 项。Web 美国测试同样 8 项通过。
- 用同一批输入分别在 `46ec68c` 归档与修正后引擎回放美国专项和第 1–21 轮审核复现。2,547 次完整版调用及 43 次旧 `evaluateUnitedStates` 调用的完整结果逐字段一致，包括检查结论、待确认项及两阶段日期。本轮 25 项测试另采集了 62 次调用。39 次的两阶段结论或日期有变化，16 次只增加或调整本轮检查与来源，7 次完整输出一致。所有差异集中在待决旅行、待决资格事件与换基准入证据。
- 设置 `VITEST_MAX_WORKERS=2` 后，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,930 项测试通过，1 项既有测试跳过。构建生成 27 个静态页面。
- `pnpm --filter e2e exec playwright test united-states.spec.ts --project=desktop --workers=1` 对 `46ec68c` 与本轮的静态产物各通过 1 项。基线归档链接工作树的依赖，使用 `next build --webpack` 生成基线产物。两次浏览器测试都使用临时 Chromium 单进程配置。`git diff --check` 通过。

| 第 22 轮复现 | `46ec68c` 递交／核准 | 本轮递交／核准 |
| --- | --- | --- |
| 无待决离境 | `MET`／`MET` | `MET`／`MET` |
| 待决离境，许可缺失或待确认 | `MET`／`MET` | `MET`／`UNKNOWN`，无核准日期 |
| 待决离境，确认适用身份例外或合资格 Advance Parole／TPS 返美 | `MET`／`MET` | `MET`／`MET` |
| 待决离境，确认无适用依据 | `MET`／`MET` | `MET`／`NOT_MET`，无核准日期 |
| 换基待确认或已获准，原 SIJ，替换职业类且有虚称公民事由 | `NOT_MET`／`NOT_MET` | `MET`／`NOT_MET`，无核准日期。C33 原递交仍为 `MET` |
| 原调整基础缺失，替换职业类有同一准入事由 | `NOT_MET`／`NOT_MET` | `UNKNOWN`／`NOT_MET`，原分类可能适用豁免 |
| 反向从职业类转 SIJ，同一准入事由 | `MET`／`MET` | `NOT_MET`／`NOT_MET`，原案的独立限制仍生效 |

### 3. 没做或没验证的

- 改动留在 `fable/86-us-rules` 工作树供 Fable 提交。全仓浏览器 E2E 留待 PR 验收。
- 日期窗口内的分类、大幅变更、撤销、失格及程序后果可录入已核定的个案结果。未能确认的结果归 PD-274。T/U、DV、Registry 和特别法类别在上表列出规则依据，尚未建模为各自的独立路径或专门计算。页端仍调用旧时间入口。

### 4. 发现与建议

- 问卷应逐次收集待决离境日期、出入境凭证、适用许可和口岸结果，以及递解程序状态。INA §209 案用难民旅行证件或确认的其他返美依据。§245 案只有排除适用例外后才记录无适用依据。
- 分阶段保留原 I-485 的资格与豁免记录，并询问换基请求期间的持续资格、替换依据的裁决状态及独立准入豁免。对未经授权就业，收集合资格的累计违规天数以及核对截止日。

## 第二十三轮审核修正（review86-23）

### 1. 做了什么

PROGRESS 615 建议提交为 `Fix: 按阶段核对美国调整的行程、累计证据与准入事件（review86-23）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- 已收件 I-485 未提供待决行程时，核准为 `UNKNOWN` 并省略核准日期。明确提供空行程时，其他适用条件满足即可判核准为 `MET`。逐次检查已报告的待决离境及返美。
- 违规和在美累计按证据截止日及目标时点的可能范围判断。只有整个范围都在同一侧时才确定是否达到法定门槛。工资记录分别覆盖对应的递交及核准时点。若个案确认适用待决 I-140 的职业转换，替换前雇主的支付能力记录按 SRC-305 适用的 I-140 收件截止。
- 在历史收件及裁决时，缺少同日的事件先后且可能改变结论时返回 `UNKNOWN`。C40 按原收件和裁决分别评估已经发生的事由。单一未标注的准入不利事件只在有唯一可匹配的明示事由时与该事由对应。复合案卷可用 `ground` 关联欺诈、虚称美国公民或非法再入境，未关联的独立不利证据继续核对。
- 在 PD-274 和 PD-277 登记缺少时期覆盖、同日顺序或个案证据的情形。沿用现有政策参数、来源快照、结果结构及页面入口。

#### 列表审计

| 位置 | 省略与明确空列表的判断 |
| --- | --- |
| `pendency.ts` 的 `trips` | 省略时待决旅行待确认。明确空列表或没有窗口内的离境时，无额外待决旅行障碍。 |
| `check.ts`、`index.ts`、`admission.ts` 的递交地点和 INA §209 在美推算 | 境内递交规划缺行程时待确认。已收件记录支持历史递交，已知行程的明确冲突或同日先后仍要核对。仅在已输入行程且无指定裁决日时根据当前累计推算未来在美时间。 |
| `index.ts` 的 `legacyPathway`、`timeChecks` 及取消条件路径 | 入籍和返美在调用旧计算器前已经要求行程。必填参数的 `trips: trips ?? []` 仅用于所选结果不使用行程的取消条件计算。 |
| `maintenance.ts` 的返美和历史 I-131 | 省略行程无法确认无旅行，明确空列表可确认无相关旅行。I-131 历史收件地点可另用已核实的地点，已知收件日在境外仍为不满足。 |
| `pendency.ts`、`admission.ts` 的 `i485PendingEvents` | 该列表补充已报告的待决事件。省略时不产生事件清除结论，仍执行各阶段的基础资格和准入检查。明确空列表表示没有额外报告的事件，有记录但缺个案结论时待确认。 |
| `immigration.ts` 的 `advertisementDates`、`notice.businessDates` | 省略时招聘或通知资料待确认。明确空列表达不到适用的广告或工作日要求。 |
| `immigration.ts` 的 `wageYears` | 缺失或明确空表均无法证明逐年支付能力。按所填年度证据、期间是否完整及可独立成立的证明判断。 |
| `naturalization.ts` 的 `military.service` | 敌对期服役记录缺失时待确认。明确空列表没有符合的服役期间。 |
| `index.ts`、`check.ts`、`admission.ts` 的其余列表 | 旧入口待确认项、说明、分类豁免的来源数组及检查器待确认编号都是结果元数据。C40 的分项准入映射缺项由覆盖范围和独立案卷结论决定。 |

#### 按日期核对的证据

| 字段 | 日期口径及依据 |
| --- | --- |
| `admission.qualifyingViolationsDays`、`i485PendingEvents[].qualifyingViolationsDays` | 前者是原收件时的调整禁令证据。后者按 `qualifyingViolationsThrough` 或事件日期记录同一相关合法入境后的非重叠累计。已超过上限仍可判不满足。未覆盖裁决日且可能跨越上限时待确认。裁决同日只填事件日期时考虑日内先后。SRC-309，INA §245(c)(8)、(k)、7 USCIS-PM B.8(E)。 |
| `humanitarian.presenceDays` | 以 `presenceThrough` 或模拟日为起点，根据裁决日用累计范围判断。已有充分累计的结论可延续。未满足的现有累计和未覆盖期间可使指定裁决日待确认。SRC-314，7 USCIS-PM L.2(B)、M.2(A)。 |
| `employment.wageYears`、`wagePeriodComplete` | 逐年合格和期间完整共同成立时，再按 `wagePeriodThrough` 或模拟日核对阶段覆盖。已确定的历史短缺、经接受的财务主管证明和综合认定按适用规则保留。SRC-302，8 CFR §204.5(g)(2)，SRC-305，6 USCIS-PM E.4(A)–(B)、(D)(5)。 |
| 排期、非法居留及其他阶段证据 | 月度排期继续以收件月、裁决月各自的记录为准。非法居留累计绑定触发禁令的离境，按具体阶段日期和法定期间复核。N-400 的 LPR 居住年限输入对应 N-400 收件，实际在美和连续居住从行程计算。服役记录按期间及收件核对，法定期内监禁及已认证服役年限按对应的个案范围填报。I-864 以适用递交日的年度指引及该阶段的担保材料核对。SRC-290–293、SRC-303–304、SRC-309、SRC-311、SRC-315。 |

### 2. 怎么验证的

- 在干净的 `dd0f05e` 上跑美国 Engine 和 Web 专测，分别为 696 和 8 项通过。在临时归档与修改后的引擎中，对同一批美国专项及第 1–22 轮审核输入逐字段比较。旧 `evaluateUnitedStates` 的 43 次输出完全一致。完整版 2,609 次调用中 2,559 次完全一致。其余 44 次仅涉及 C29 工资未覆盖目标时点，6 次仅涉及待决事件同日顺序或 §245(k) 覆盖期。50 次变化中 26 次影响路径状态或日期，24 次只改变检查或待确认项。
- 21 项新增测试采集了 43 次完整版调用来比较本轮修正前后。28 次改变阶段状态或日期，15 次输出一致。对先前日期回归补充明确的工资证据截止日，并在第 22 轮分别保留裁决前已发生的资格变化和旧累计值不足以确认裁决结果的断言。
- 设置 `VITEST_MAX_WORKERS=2` 后，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,951 项测试通过，1 项既有测试跳过。构建生成 27 个静态页面，包括美国页面。
- `pnpm --filter e2e exec playwright test united-states.spec.ts --project=desktop --workers=1` 对 `dd0f05e` 和本轮静态产物各通过 1 项。基线归档用 `next build --webpack` 构建，两次使用临时 Chromium 单进程配置。确认美国页面仍调用时间入口，`git diff --check` 通过。

| 第 23 轮复现 | `dd0f05e` 递交／核准 | 本轮递交／核准 |
| --- | --- | --- |
| 已收件，省略行程 | `MET`／`MET` | `MET`／`UNKNOWN`，无核准日期 |
| 明确无待决行程 | `MET`／`MET` | `MET`／`MET` |
| §245(k) 只填事件日累计 1 天 | `MET`／`MET` | `MET`／`UNKNOWN`，无核准日期 |
| 同案补录裁决日 237 天 | `MET`／`NOT_MET` | `MET`／`NOT_MET` |
| 裁决日当天离境且无适用依据 | `MET`／`NOT_MET` | `MET`／`UNKNOWN`，无核准日期 |
| 原即时亲属案换为职业类，换基后才发生移民欺诈 | `NOT_MET`／`NOT_MET` | `MET`／`NOT_MET` |

### 3. 没做或没验证的

- 改动留在 `fable/86-us-rules` 工作树供 Fable 提交。全仓浏览器 E2E 留待 PR 验收。

### 4. 发现与建议

- 待决就业证据若只能确认事件日，保留该日期。能从工资、停工或恢复授权记录核对后续期间时，填实际覆盖截止日。所填总数须对应同一相关合法入境。
- 有多项准入事由时，分别保存各事由的首次发生日及原案、裁决时的证据。日期粒度不足以区分递交或裁决当天的先后时，保留待核状态。

## 第二十四轮审核修正（review86-24）

### 1. 做了什么

PROGRESS 616 建议提交为 `Fix: 按阶段核对美国年度与日期证据（review86-24）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- C29 逐阶段核对雇主的年度工资、税表和财务金额。每行可填日历年 `year` 及该行金额覆盖截止日 `through`。较晚年度从较早阶段排除。同年截至较晚日期的金额无法分拆时为 `UNKNOWN`。保留旧单行汇总的解释。多行旧数据无法定位到历史阶段时为 `UNKNOWN`。按案采用覆盖该阶段的财务主管证明、综合认定、原雇主或职业转换证据。
- §245(k) 核准按同一次相关合法入境后的不重叠总数核对。较晚累计已在上限以内时，可确认较早的裁决也未超限。只有较晚的超限记录时，早期裁决仍为 `UNKNOWN`。原递交及同日先后仍按各自证据核对。
- 审计其余日期字段。修正了回溯裁决时补件 I-693 覆盖原件、返美后 I-131 收件被用于较早返美、离役日被用于较早的在役证明，以及晚于评估的定罪、I-829 原请愿、地址报告和换卡记录。证据或案卷顺序待核的情形登记于 PD-269、PD-274–275、PD-277–279。

#### 日期证据与使用检查

| 证据 | 检查及适用时点 | SRC 定位 |
| --- | --- | --- |
| 逐年工资、工资单、税表、年度报告及审计财务的金额与覆盖日 | C29 按实际或适用的候选递交日和裁决日核对；待决 I-140 适格职业转换按 I-140 收件日截止。单行金额覆盖日包含当天。日历年资料可用同年总表截止日或已结束的年度末日，财政年度可直接填写金额截止日。纳税在本模型中还作为 I-864 收入支持证据，C25 使用对应申请年度的汇总收入和适用指引。 | SRC-302，8 CFR §204.5(d)、(g)(2)；SRC-305，6 USCIS-PM E.4(A)–(B)、(D)(5)；SRC-303，8 CFR §213a.2(a)(1)(v)(A)–(B)，I-864 Instructions Part 6；SRC-304，2026 HHS 地区表。 |
| 雇佣、认证、招聘、公告、工作邀约及 Supplement J | C28 的普通 PERM 招聘、就业订单、广告和张贴按 ETA-9089 的递交窗口核对。PERM 有效期及 Schedule A 通知按 I-140 收件日。原邀约按 I-485 收件，替换邀约及 Supplement J 的实际收件和待决期限按裁决。换基使用原请愿在原收件日的证据，替换请愿另核。 | SRC-305，20 CFR §§656.10(d)、656.15(b)、656.17(e)、656.30(b)(1)，6 USCIS-PM E.6(B)(1)；SRC-302，8 U.S.C. §1154(j)；SRC-309，8 CFR §245.25(a)–(b)，7 USCIS-PM A.8(C)–(E)。 |
| 身份及未经授权就业累计、待决资格和程序事件 | C34 用原 I-485 收件时的身份及累计。`I485-PENDING-ELIGIBILITY` 仅在收件至裁决的适用事件中确定阶段效力。§245(k) 的累计截止日期独立核对。C40 按事由发生日、触发非法居留禁令的离境及各阶段适用豁免判断。同日先后可能改变结果时保留待核。 | SRC-309，8 U.S.C. §1255(c)(2)、(7)–(8)、(k)，8 CFR §103.2(b)(1)、(6)、(13)，7 USCIS-PM A.6(B)、B.8(E)；SRC-311，8 U.S.C. §1182(a)(6)、(9)。 |
| 州或 USCIS 辖区居住、在美居住、永久居民起始日、婚姻和公民身份日期、出入境行程 | 入籍时间与 C01、C03–04、C13–14 按适用 N-400 收件或面谈日核对，行程按每个法定回看窗口计算，持续居住和婚姻证据按宣誓要求申报。C33、C41 用实际或候选 I-485 收件日核对在美地点。C41 的难民或庇护累计在美按裁决日及其累计区间。`I485-PENDING-TRAVEL` 只核适用窗口内的离境和裁决前的返美，同日先后不明时待核。 | SRC-079，8 U.S.C. §§1427、1430；SRC-081，12 USCIS-PM D.3–D.4、D.6(D)；SRC-290，12 USCIS-PM G.2(A)–(C)；SRC-291–292，12 USCIS-PM E.2；SRC-309，8 CFR §245.2(a)(4)(ii)，I-485 Instructions pp2、14；SRC-314，7 USCIS-PM L.2(B)、M.2(A)。 |
| 亲属请愿、入籍或转换分类日期，月度排期，NVC 授权、面谈和裁决日期 | C23–24、C26 和 C33 按事项分别用请愿收件、请愿人入籍、实际或候选申请日及裁决日。原递交用指定月份的递交表，核准用裁决月 Final Action Dates。I-864 正常口径用正式申请年度，NVC 阶段可作预估。费用和公共负担政策版本另按实际邮戳或适用收件日。 | SRC-302，8 U.S.C. §§1151(f)、1153(h)、1154；SRC-303，8 CFR §213a.2(a)(1)(v)；SRC-309，7 USCIS-PM A.6(C)、A.8、DOS NVC；SRC-312，Applicant Interview；SRC-313，91 FR 45324 DATES；SRC-316–319，各适用表项与生效说明。 |
| I-693 原件、补件签字和适用有效期，刑事事由和党籍日期 | C36 要求随件时核对收件版本，再核裁决日可用报告和个案绑定。C38 的 CIMT 未成年例外用法规所定的申请日期及所填犯罪／释放基准日，C39 的过去党籍例外按正式申请日。C07 核对 N-400 收件日前已定罪的记录，晚于收件的定罪在缺宣誓时点证据时使核准待确认。 | SRC-293，12 USCIS-PM F.2、F.4(B)；SRC-309，I-485 Instructions p11；SRC-311，8 U.S.C. §1182(a)(2)(A)(ii)(I)、(a)(3)(D)；SRC-312，PA-2025-08 pp1–2。 |
| 条件居民身份、原婚姻、投资请愿及 I-829 期间 | C15–17 按条件居留起点、适用递交窗口和投资规则核对。I-829 须使用取得条件居留前的同案请愿收件日。C31 初次 EB-5 使用适用 I-526／I-526E 收件日选取金额版本。 | SRC-297，8 CFR §216.4(a)；SRC-298，I-829 Instructions「Who May File Form I-829?」、6 USCIS-PM G.7(A)；SRC-302，8 U.S.C. §1153(b)(5)；SRC-079，8 U.S.C. §1186b。 |
| 搬家及报备、换卡日期、国内定罪事件、返美与 I-131 | C19、C21 用模拟日核对境内义务与已发生事由。C22 的回美证须在相关返美日有效，I-131 收件地点按该次实际收件日的行程核对。`US-TRAVEL` 的返美证件评估可以使用所选行程的计划返美日。 | SRC-299，8 U.S.C. §§1302(b)、1305(a)，8 CFR §264.5(b)(8)；SRC-300，8 CFR §§223.1(a)、223.2(b)(1)、223.3(a)(1)；SRC-301，8 U.S.C. §1227(a)(2)(A)(i)。 |
| 服役区间、离役日与认证 | C43 以 N-400 收件日判断是否已有合资格服役、在役证明或离役证明。离役后的附加居住要求以离役日期核对，面谈时 LPR 状态单独评估。 | SRC-315，8 U.S.C. §§1439、1440，12 USCIS-PM I.2–I.3，Naturalization Through Military Service「Application Process」。 |

引擎对无日期的汇总结论使用其定义的阶段，例如 I-864 收入、统计期监禁及税务合规的 GMC 结果、已认证服役年数及案卷豁免。目前输入没有独立的逐年个人报税、逐次工作或居住变更表。需用这类资料证明某阶段时，以对应案卷的已确认结论或阶段覆盖记录填报。证据不足按相关 PD 保留待核。

### 2. 怎么验证的

- 在 `ad907ef` 归档与本轮代码对照回放。基线美国 Engine 两个测试文件 717 项通过，本轮 736 项通过，新加 19 项。基线两个文件捕获的 2,434 次完整版及 43 次旧时间入口输出逐字段一致。历轮保留的第 1–23 轮复现和美国专项输入另作同样对照，2,652 次完整版及 43 次旧时间入口输出也全部一致。两批含重复输入，分别计数。
- 本轮新用例的 28 次完整版调用中，21 次完整输出有差异。其中 19 次改变阶段状态或日期，2 次仅改变检查或待确认项。7 次完整输出一致。所有差异属于本轮的阶段证据修正。
- 设 `VITEST_MAX_WORKERS=2`，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,970 项通过，1 项既有测试跳过，构建生成 27 个静态页面，包含美国页面。美国 Web 单测在 `ad907ef` 与本轮各通过 8 项。`git diff --check` 通过。
- `pnpm --filter e2e exec playwright test united-states.spec.ts --project=desktop --workers=1` 对 `ad907ef` 和本轮静态产物各通过 1 项。基线归档用 `next build --webpack`，两次浏览器测试均用临时 Chromium 单进程配置。

| 代表性复现 | `ad907ef` | 本轮 |
| --- | --- | --- |
| 2025 年至收件日已付足，2026 年出现工资缺口 | 原递交 `NOT_MET`，核准 `NOT_MET` | 原递交 `MET`，核准 `NOT_MET` |
| 2025 年合格数据只覆盖到较晚日期，无法拆分收件日金额 | 原递交 `NOT_MET`，核准 `NOT_MET` | 原递交 `UNKNOWN`，核准 `NOT_MET` |
| §245(k) 较晚累计为 30 天或恰在上限 | 原递交 `MET`，核准 `UNKNOWN` | 原递交 `MET`，核准 `MET` |
| §245(k) 只有较晚累计且已超限 | 原递交 `MET`，核准 `UNKNOWN` | 原递交 `MET`，核准 `UNKNOWN` |
| 签在历史裁决之后的补件 I-693 关联另一已结案申请，原件有效 | C36 核准 `NOT_MET` | C36 核准 `MET` |

### 3. 没做或没验证的

- 改动留在 `fable/86-us-rules` 工作树供 Fable 提交。T/U、DV、Registry 及特别法类别沿用第 22 轮报告所列覆盖边界。页面仍调用旧时间入口，共用结果结构和网页组件无改动。浏览器验证覆盖美国桌面用例。

### 4. 发现与建议

- 工资、税表与财务资料合并为年度记录时，记录实际金额截止日。同年有较早阶段需要判断时，保留该日期已确立的工资或财务证明。§245(k) 较晚总数超限的个案须补裁决时点的累计。

## 第二十五轮审核修正（review86-25）

### 1. 做了什么

PROGRESS 617 建议提交为 `Fix: 逐年核对美国雇主支付能力并修正 §245(k) 历史下界（review86-25）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

- C29 分别从优先日所在年度核对至原递交和核准所涉年度。普通 PERM 用 DOL 的 ETA-9089 收件日，Schedule A 和无需 DOL 劳工认证的请愿用 I-140 收件日，缺相应收件记录时也可填本请愿的 `employment.priorityDate`。普通 PERM 的认证日或 I-140 收件日只能确定最晚可能的优先年度。带日期的记录须证实覆盖实际所需年度。已有明确跨年证据时，未标日期的汇总不能填补年度空缺。缺任一必需年度且无独立通过依据时为 `UNKNOWN`，省略该阶段日期。缺年度、缺优先日或个案首年核算待确认登记在 PD-277。原请愿与换基请愿、以及 AC21 职业转换的证据时点沿用各阶段口径。
- §245(k) 用同一次相关合法入境后的较晚累计同时约束历史上界和下界。较晚累计减去两日间隔天数，再以零为下限，得到较早日期至少已有的累计天数。下界严格超过法定上限时为 `NOT_MET`，上界在上限内时为 `MET`，结果仍可能落在上限两侧或不同记录矛盾时为 `UNKNOWN`。沿用 SRC-309，INA §245(k)、7 USCIS-PM B.8(E)，更新 PD-274。

| C29 通过依据 | 判断口径 | SRC 定位 |
| --- | --- | --- |
| 实付工资 | 对应年度内发给该受益人的工资达到承诺工资。用 W-2、1099-MISC 或州工资记录等证明，另确认各适用年度的初始财务材料。 | SRC-302，8 CFR §204.5(g)(2)；SRC-305，6 USCIS-PM E.4(A)(1)–(3)、(C)(1)。 |
| 净收入 | 年度净收入独立达到承诺工资，或补足已知实付工资的差额。 | SRC-305，6 USCIS-PM E.4(C)(2)「Net Income and Net Current Assets」。 |
| 净流动资产 | 流动资产减流动负债后的金额独立达到承诺工资，或补足已知实付工资的差额。净收入与净流动资产各自比较。 | SRC-305，6 USCIS-PM E.4(C)(2)。 |
| 优先日首年按比例 | USCIS 个案确认接受后，使用从优先日起的实付工资或同期净收入。年末净流动资产可单独补足差额，使用其年末余额。整月按当年剩余月份计算，手册例示从 7 月 1 日起为年薪的一半。月中起算用个案确认的金额。 | SRC-305，6 USCIS-PM E.4(D)(1) 的示例与注 24。 |
| 大雇主财务主管声明 | 雇用至少 100 名工人的美国雇主可提交财务主管声明。由 USCIS 确认接受并认定其证明力后，可替代年度财务材料。 | SRC-302，8 CFR §204.5(g)(2)；SRC-305，6 USCIS-PM E.4(A)(4)、(D)(2)。 |
| 综合证据 | 已确认的全貌认定可独立通过，例如在适用初始证据基础上纳入补充损益、银行与人员档案。上一年度材料在优先日当年的初始文件尚不可用时可供全貌评估。多受益人、雇主承继或机构特殊财务证据需要个案审查。 | SRC-305，6 USCIS-PM E.4(A) 注 5、(B)、(C)(3)、(D)(2)–(4)。 |
| 适格职业转换的历史支付能力 | 已获批且适格的职业转换沿用有效历史 I-140 认定。符合待决 I-140 职业转换时，原雇主年度证明核对至 I-140 收件日。 | SRC-302，8 U.S.C. §1154(j)；SRC-305，6 USCIS-PM E.4(D)(5) 与注 31–32；SRC-309，8 CFR §245.25(a)(2)–(3)。 |

[SRC-302 优先日及支付能力](https://www.ecfr.gov/current/title-8/section-204.5) · [SRC-305 USCIS 支付能力手册](https://www.uscis.gov/policy-manual/volume-6-part-e-chapter-4) · [SRC-309 USCIS §245(k) 累计口径](https://www.uscis.gov/policy-manual/volume-7-part-b-chapter-8)

### 2. 怎么验证的

- 在 `80e71d1` 归档与修正后对照回放同一批输入。基线美国 Engine 两个测试文件 736 项通过，修正后 755 项通过。基线测试捕获的 2,462 次完整版调用及第 1–24 轮保留的美国专项和审核复现的 2,680 次完整版调用中，3,548 次完整输出一致，1,515 次仅新增 C29 来源定位，79 次修改了 C29 或待决 §245(k) 检查。其中 57 次改变阶段状态或日期。其余检查和不受这些检查影响的结论保持一致。两批输入均包含 43 次旧 `evaluateUnitedStates` 调用，全部逐字段一致。两批之间包含重复案例。
- 对本轮新增及调整的测试另捕获 79 次调用，同样在两版回放。25 次改变阶段状态或日期，2 次只改变检查，52 次只新增来源定位。原有 PERM、领馆排期和 §245(k) 回归补充独立支付能力依据，以继续验证原先所测的条件。原递交年已付足、次年出现缺口的回归补明优先日，仍为递交 `MET`、核准 `NOT_MET`。后于收件日的同年付款记录仍使递交待确认。
- 设置 `VITEST_MAX_WORKERS=2`，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 5,989 项测试通过，1 项既有测试跳过。构建生成 27 个静态页面，包含美国页面。
- 美国 Web 单测在 `80e71d1` 与本轮各通过 8 项。`pnpm --filter e2e exec playwright test united-states.spec.ts --project=desktop --workers=1` 对基线与本轮静态产物各通过 1 项。基线归档用 `next build --webpack` 构建，两个浏览器用例均使用临时 Chromium 单进程配置。
- `git diff --check` 通过，SRC-305 的 USCIS 手册快照 SHA-256 与登记吻合。USCIS 网站本轮返回 HTTP 403，手册章节以仓库已登记的官方快照核对，法规用 eCFR 核对。

| 代表性复现 | `80e71d1` 递交／核准 | 本轮递交／核准 |
| --- | --- | --- |
| 2025 年优先年度无明细，仅有 2026 年足额工资 | `UNKNOWN`／`MET`，有核准日 | `UNKNOWN`／`UNKNOWN`，省略核准日 |
| 2025 年 7 月 1 日优先日，承诺年薪 60,000 美元，当年优先日后实付 45,000 美元，次年实付足额，按比例待确认 | `NOT_MET`／`NOT_MET` | `UNKNOWN`／`UNKNOWN` |
| 同一工资案例，已确认接受按比例核算 | `NOT_MET`／`NOT_MET` | `MET`／`MET`，首年按 30,000 美元核对 |
| §245(k) 较晚累计为 30 天或 180 天，支付能力已另证 | `MET`／`MET` | `MET`／`MET` |
| §245(k) 较晚 24 天的累计为 204 天，历史范围包含 180 天 | `MET`／`UNKNOWN` | `MET`／`UNKNOWN` |
| §245(k) 较晚 24 天的累计为 205 天或 237 天，历史下界为 181 天或 213 天 | `MET`／`UNKNOWN` | `MET`／`NOT_MET` |

### 3. 没做或没验证的

- 改动留在 `fable/86-us-rules` 工作树，待 Fable 提交。美国页面沿用旧时间入口，共用结果结构及网页组件保持原样。T/U、DV、Registry 和特别法类别沿用第 22 轮报告所列的覆盖边界。

### 4. 发现与建议

- 后续问卷可收集本请愿优先日、各年度金额和金额截止日，以及首年工资与净收入的起算日期。个案按比例获接受时，月中起算可另填确认后的承诺工资；期间和裁量资料缺失时按 PD-277 待核。

## 第二十六轮审核修正（review86-26）

### 1. 做了什么

PROGRESS 618 建议提交为 `Fix: 统一美国优先日并按期间核对雇主支付能力（review86-26）`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

`employmentPetitionDates` 集中确定普通 PERM 的 DOL 收件日、其它 I-140 的实际或候选收件日及适用优先日。已收件案件缺相应日期时可填本请愿的优先日。普通 PERM 的认证日与 I-140 收件日可约束最晚可能的优先日。来源为 SRC-302，8 CFR §204.5(d)。[8 CFR §204.5(d)](https://www.ecfr.gov/current/title-8/section-204.5#p-204.5(d))

| 调用点 | 共用日期的用途 |
| --- | --- |
| `immigration.ts` → `employmentChecks` → C28 | 用普通 PERM 的 DOL 收件日核对招聘。以实际或候选 I-140 收件日核对 Schedule A 通知及适用的 PERM 有效期。见 SRC-305，20 CFR §§656.10(d)、656.15(b)(2)、656.30(b)(1)。 |
| `immigration.ts` → `employmentChecks` → `abilityToPay` → C29 | 递交和核准共用优先日起点。首次同时递交的 Schedule A、EB-1B、EB-1C 采用同一个候选 I-140 收件日。适格待决职业转换以实际 I-140 收件日截止。见 SRC-302，8 CFR §204.5(d)、(g)(2)，SRC-305，6 USCIS-PM E.4(D)(5)。 |
| `admission.ts` → `adjustmentChecks` → C33 | 按同一 I-140 收件日口径核对基础请愿时序。名额沿用对应阶段的排期证据，核准仍须确认基础请愿获批。见 SRC-309，8 CFR §245.2(a)(2)(i)(A)–(C) 与 7 USCIS-PM A.6(A)、(C)(4)–(5)。 |

C29 对每个适用期间分别核对已付工资、净收入和净流动资产。已证实的工资可独立达到承诺工资，也可用完整适用期的净收入或期末净流动资产补足差额。同年资料分开填写时按实际期间合并，重叠的金额只计一次。首年按比例时检查优先日至当年末的工资或净收入覆盖，净流动资产按同年年末余额核对。缺适用期证据且没有其他足够依据时输出 `UNKNOWN` 并省略相应日期，已补入 PD-277。见 SRC-302，8 CFR §204.5(g)(2)，SRC-305，6 USCIS-PM E.4(A)、(C)(1)–(2)、(D)(1) 与注 24。[USCIS 支付能力手册](https://www.uscis.gov/policy-manual/volume-6-part-e-chapter-4)

### 2. 怎么验证的

- 用 `git archive 62b7c25` 建立基线，在两版回放同一批输入。美国 Engine 两个测试文件基线 755 项通过，修正后 767 项通过。基线测试捕获的 2,495 次完整版调用，以及前 25 轮留存的美国专项和审核复现中的 2,759 次完整版调用，完整结果逐字段一致。两批各含 43 次旧 `evaluateUnitedStates` 调用，结果也逐字段一致。两批包含重复输入。
- 新增测试在基线出现 10 项预期失败及 2 项通过，修正后 12 项均通过。另在两版对照新增测试捕获的 58 次调用，50 次仅 C29 检查及相应阶段结果变化，其余 8 次完整一致。第 25 轮缺优先年度、足额按比例工资及 §245(k) 历史累计复现均保留基线结论。
- 美国 Web 单测 `vitest run test/united-states.test.tsx` 在基线和本轮各通过 8 项。两组美国 Engine 单测和 Web 单测均以 Vitest JSON 报告检查逐用例耗时，均低于 1.5 秒。
- 设置 `VITEST_MAX_WORKERS=2`，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。全仓 6,001 项测试通过，1 项既有测试跳过。构建生成 27 个静态页面，包含美国页面。
- `pnpm --filter e2e exec playwright test united-states.spec.ts --project=desktop --workers=1` 对基线与本轮静态产物各通过 1 项。基线归档用 `next build --webpack` 构建，两次 E2E 均用临时 Chromium 单进程配置。
- `git diff --check` 通过。USCIS 手册公开页面返回 HTTP 403，已用 SHA-256 与 SRC-305 登记一致的官方存档核对各节及注 24，并用 eCFR 实时核对 SRC-302 法规。

| 代表性复现 | `62b7c25` 递交／核准 | 本轮递交／核准 |
| --- | --- | --- |
| 首年按比例证据只有第三季度净收入 | `MET`／`MET`，有日期 | `UNKNOWN`／`UNKNOWN`，省略日期 |
| 首年第三、四季度净收入合计足额且连续覆盖 | `UNKNOWN`／`UNKNOWN` | `MET`／`MET` |
| 同年已付足工资，之后追加独立财报 | `UNKNOWN`／`UNKNOWN` | `MET`／`MET` |
| Schedule A、EB-1B、EB-1C 首次同缴并提供足额工资证据 | `UNKNOWN`／`UNKNOWN` | `MET`／`UNKNOWN`，递交日为 `2026-11-23`，核准日待基础请愿获批 |

### 3. 没做或没验证的

- 按要求保留工作树改动，交由 Fable 提交。

### 4. 发现与建议

- 同年度分别填报工资、净收入与净流动资产时，保留各自的金额起止日或余额日期，便于确认期间覆盖和区分累计记录。
