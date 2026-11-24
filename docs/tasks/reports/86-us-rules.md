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
