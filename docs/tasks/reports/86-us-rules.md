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
- `C32` 的受养人赠与和分类／排期属 PD-266。`C33` 的未来 Visa Bulletin 与 CSPA 见 PD-272。`C35–C42` 的裁量、公共负担、医学、刑事、安全与人道豁免按个案审定，见 PD-261、269–270、273–275。
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
