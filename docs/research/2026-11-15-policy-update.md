# 12.0a：英国移民政策、新闻与解析更新

调研截止：2026-11-15（Europe/London）。比较基线：本 worktree 的 `97b1255`，来源登记主要截至 2026-11-04；SRC-029–031 实际另有 11 月 5 日抓取。本报告仅提出后续任务，不修改规则、参数、来源登记或待定事项。

## 1. 结论与证据边界

**本次未发现 Earned Settlement 首批 Statement of Changes 已提交的官方证据，也未发现足以立即替换仓库现行定居门槛的变化。** 官方修改声明目录最新仍为 HC 584；所查 Appendix 的独立变更记录均早于比较窗口；咨询页面仍说下一步才把框架转成详细规则。[修改声明目录][src032] 的年度清单、[咨询页][consultation] 的 `Next steps` 支持这个有范围的检索结论。它不是对所有政府网页、法院判决或未公开文件的穷尽证明。

这次真正需要修正的是政策扫描的精度：

- **11 月 12 日新增的是回应文件的无障碍 HTML 版本**，更新记录没有宣布一轮新政策。不能只看到 `Updated` 就给引擎换版本。[咨询页][consultation]，`Updates to this page` 的 2026-11-12 条目。
- **预算案有官方文件，也有部分时间窗口**。薪资改革指向 2027 年春季，高技能失业后的许可缩短宽限改革指向 2027 年；但具体金额、资格、过渡边界仍未公布。[候选 SRC-034][src034] §7.9 对应条目、[候选 SRC-035][src035] 回答正文。
- **Graduate 的已入法时长分界与预算案中的新例外必须分开**。前者已有 GR 8.1；后者尚无落入该条的大学条件。[候选 SRC-036][src036] GR 8.1、[候选 SRC-034][src034] §7.9 的 Graduate 条目。
- **不能把所有预算案移民措施一概写成“未生效”**。ISC／CoS 的雇主支付税务豁免已有通过的临时税收决议，另有 Finance Bill 条款；它不是降低申请费或 IHS。[候选 SRC-051][src051] Resolution 15、[候选 SRC-050][src050] clause 15、[候选 SRC-049][src049] `General description of the measure`。

报告中“候选 SRC-032”等仅为后续登记草案，**尚未成为 `docs/SOURCES.md` 的有效编号**，不能直接用于业务代码。所有来源本次均在线读取，未下载归档。PDF 页码按物理页序；HTML 用小节标题／锚点，议会问题用问题号、回答日期及 Answer 段落定位。规模与优先级是工程估计，不是政策数字。

## 2. 时间线

### 2.1 本窗口内的更新和澄清

“提议中”包含政府已定政策方向、但尚未转成生效规则的框架；委员会提出的问题也属于讨论，不能当作政府接受了建议。

| 日期 | 事件与对项目的含义 | 状态 | 官方 URL 与定位 |
|---|---|---|---|
| 2026-11-04 | 问题 40064：重述预算案薪资改革方向及春季实施窗口，仍未回答新一般门槛的金额。不能用旧 ASHE 数据自行算出新门槛入库。 | 提议中；金额 `UNKNOWN` | [候选 SRC-035][src035]，Answer 第 1–末段；引用 Budget ¶6.94–6.95。 |
| 2026-11-04 | 问题 39721：改革拟适用于多数已在英但尚未定居者；指定 care／public-sector 群体的过渡不是所有在途者的普遍豁免；承诺在实施前发布经济、平等和儿童影响评估。 | 提议中；政策适用方向获重申 | [候选 SRC-039][src039]，Answer 第 2、4 段。 |
| 2026-11-04 | HPI 大学清单页面移除已过适用范围的旧年度清单；新年度清单实际于 11 月 1 日加入。不能把年度名单维护当作预算案“扩至 top 150”已经落实。 | 已生效框架下的名单维护 | [候选 SRC-038][src038] 首段；[名单集合页][hpi-lists] `Updates` 的 2026-11-04、2026-11-01 条目。 |
| 2026-11-04 | Women and Equalities Committee 取证，讨论女性、儿童和其他平等影响；证人意见不等于新增签证条件。 | 提议中／审议 | [候选 SRC-042][src042]，HC 760，日期、Q1–Q26。 |
| 2026-11-05 | 委员会致内政大臣：追问单亲家庭、父母分别定居、儿童保障、残障者使用 public funds 及女性安全。 | 提议中／要求澄清；不是修法 | [候选 SRC-043][src043]，物理 p1 问题 1–3、p2 问题 4–5、p4 问题 8–10。 |
| 2026-11-10 | 问题 40262：政府未估算所问的相对威慑效果；更长定居合格期本身不授予同样长的合法停留许可。 | 提议中框架的解释 | [候选 SRC-040][src040]，Answer 第 1–3 段。 |
| 2026-11-12 | 咨询页新增回应的 accessible HTML；现有收入年数矛盾仍在，不足以关闭 PD-041／042。 | 已公布；文件形式更新，非新规则生效 | [咨询页][consultation] `Updates`；[候选 SRC-033][src033] `Earnings`、`How earnings will be assessed`、`Annex B`。 |
| 2026-11-13 | 问题 41453：再次说明无改革基线的定居预测存在较大不确定性、不含 EUSS；改革影响留待 accompanying Impact Assessment。 | 提议中框架的证据说明；评估待发布 | [候选 SRC-041][src041]，Answer 第 2–4 段。 |
| 截止 2026-11-15 的查询状态 | 问题 40937（具体生效日、已累计时间如何承认）和 42238（受影响在英人数）页面仍显示 Awaiting response。逾期日期不等于已有答案。 | 提议中；相关具体答案 `UNKNOWN` | [40937][q40937]、[42238][q42238]，各页面 `Awaiting response`。 |

### 2.2 窗口前背景及已安排的未来边界

这些不是本窗口新颁布的规则，列出是为了避免遗漏未来边界或把提案误认为现行法。

| 公布／边界日期 | 事件 | 状态（截至调研日） | 官方 URL 与定位 |
|---|---|---|---|
| 2026-10-28 | 预算案拟将 occupation-specific 门槛从工资中位数改为第 25 百分位、按新工资资料调整一般门槛、年度更新、统一 new entrant 折扣并取消 PhD 折扣；计划从 2027 年春季实施。 | 提议中；尚无具体生效日与金额 | [候选 SRC-034][src034] §7.9 `Implementing Migration Advisory Committee (MAC) recommendations on visa salary requirements`；[候选 SRC-035][src035] 引用 ¶6.94。 |
| 2026-10-28 | HPI 拟覆盖 top 150 的大学、名额相应增加；Graduate 拟对符合合规及就业结果条件的大学毕业生设两年时长。 | 提议中；大学认定、名单／新 cap、申请日分界 `UNKNOWN` | [候选 SRC-034][src034] §7.9 `Expanding the High Potential Individual visa`、`Extending the graduate visa from 18 months to two years for eligible universities`。 |
| 2026-10-28 | 高技能人员拟获得最长六个月找新工作的许可缩短宽限，具体时长与原高薪岗位工作年限有关，计划 2027 年实施。 | 提议中；不是所有 Skilled Worker 均自动六个月 | [候选 SRC-034][src034] §7.9 `Extending visa curtailment to six months`；[候选 SRC-035][src035] 引用 ¶6.95。 |
| 2026-10-28／2026-11-03 | ISC／CoS 雇主支付税务豁免针对 10 月 28 日起付款；11 月 3 日通过的 Resolution 15 明示依 Provisional Collection of Taxes Act 1968 产生临时法定效力；Finance Bill clause 15 作相应立法。 | 已生效（临时税收决议层面）；Bill 本身仍须与成法区分 | [候选 SRC-051][src051] Resolution 15(1)–(2)、法定效力声明及通过结果；[候选 SRC-050][src050] 物理 p21，clause 15(1)–(2)；[候选 SRC-049][src049] `Operative date`。 |
| 2026-11-02 | Earned Settlement 回应及两院陈述；首批修改拟自 12 月开始提交，下议院说 2027 年内实施，上议院说首阶段 2027 年 1 月生效、后续继续。 | 提议中；具体条款生效日 `UNKNOWN` | 已登记 [SRC-002][commons-es] vol 792 col 593，contribution `912FA19F-4360-4FC7-A496-1DA8CA1436FE`；[SRC-003][lords-es] vol 860 cols 1423–1424，contribution `0681E679-F8C2-48A1-9C1E-54A4705E8C2E`。 |
| 2026-11-30／2026-12-09 | HC 584 另有分批生效条款，分别为 Student 生活费证明额调整 APP ST8–ST10 和 Appendix EU 的 APP EU16；不能把任何 12 月规则变化都称为 Earned Settlement。 | 已公布待生效 | [候选 SRC-052][src052] `Implementation`、APP ST8–ST10、APP EU16；[候选 SRC-053][src053] 最末实施段。 |
| 2026-12-01 | 原 Tier 2 (General) 群体 SW 14.5 的特定过渡截止。已有 11.4 核对，不能扩成所有工签 going rate 普遍调整。 | 已公布待边界到达；存量条文 | 已登记 [SRC-004][sw-rules] SW 14.5(a)、(c)(iii)、SW 24.3 row E、SW 24.4(a)。 |
| 2027-01-01 | Graduate 非博士申请从两年改为 18 个月，以申请日为界；博士保持三年。 | 已公布待适用；已在 Rules 中 | [候选 SRC-036][src036] GR 8.1；[Graduate guide][graduate-guide] `How long you can stay`。 |
| 2027-03-26 | 多条路线 settlement 的 B2 申请日分界，与 Earned Settlement 是否整体开始实施分开。 | 已公布待适用；已在 Rules 中 | 已登记 [SRC-004][sw-rules] SW 22A.1、[SRC-005][lr-rules] LR 13.1、[SRC-021][gt-rules] GT 13.1；SRC-007 EM 5.60–5.62。 |
| 2030-04-04／2035 | 现行旧薪资过渡仍要求申请早于前一日期；回应提出的续签延至后一年度，不能直接替换现行 settlement 截止，也没有精确到日。 | 前者为现行法未来边界；后者为提议中 | 已登记 SRC-004 SW 4.2(b)(ii)、SRC-001 物理 p44；[候选 SRC-033][src033] Ch.8 `Pre-April 2024 cohort`。 |

## 3. 各主题核查结果

### 3.1 Immigration Rules 与已建模参数

在线 Content API 按各 Appendix 独立查询，不能采用手册首页统一的 Updated 日期：

| Appendix | 本次 `public_updated_at` 的日期 | 与仓库对照 |
|---|---|---|
| Skilled Worker／Long Residence／Hong Kong BN(O)／FM | 2026-10-08 | 与 SRC-004／005／020／024 版本一致。 |
| Skilled Occupations／Continuous Residence | 2025-11-11 | 与 SRC-017／008 一致。 |
| Global Talent／Settlement Family Life | 2026-08-03 | 与 SRC-021／022 一致。 |
| English Language／KoLL | 2026-03-26 | 与 SRC-014／025 一致。 |
| KOL UK | 2025-04-09 | 与 SRC-015 一致。 |
| Graduate／High Potential Individual | 2026-08-03 | 仓库未登记这两份 Appendix；是来源覆盖缺口，不能称为本窗口新修法。 |

核查接口为 `https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-<slug>`，读取 `public_updated_at` 及 `details.change_history[0]`（SRC-010 的已有方法）。元数据一致不代表做过逐字节比对；本次另对核心条款做正文回读。

- **Skilled Worker**：SW 24.3 row A 仍为 £41,700 且满足 going rate；row B／C／D 仍为 £33,400／£31,300／£25,000。仓库同名参数没有发现数字过时。预算案调整不能先行替换 settlement 的这张表，也不能认为一般门槛与 occupation rate 必然同方向变动。[SRC-004][sw-rules] SW 24.3–24.4；[候选 SRC-035][src035] Answer 引用 MAC 的末段。
- **Long Residence**：LR 11.1–11.2 仍保留现行合法居留累计规则；Student／Graduate 的现行计入与拟议改革后的不计入是两套口径。不要提前删除 `CL-LR-RESIDENCE-10Y`。[SRC-005][lr-rules] LR 11.1–11.4；SRC-001 p23–24。
- **Global Talent**：主申请人仍按背书类别分三年／五年；预算案回顾已经扩大的 endorsed funder pathway，不能据此把所有 Global Talent 改成一个新定居年限。`Highest Talent Group` 资格仍待明确。[SRC-021][gt-rules] GT 11.1–11.2；[候选 SRC-034][src034] §5.6 `Backing British business`；SRC-001 p46 注16、PD-011／048。另核查的 [UKRI funders 集合页][ukri-funders] 最新更新为 2026-09-04（`Updates`），未见本窗口更新。
- **Hong Kong BN(O)**：现行五年与 B1 保持，不能套用其他路线的 B2 分界；[官方 guide][src048] `Eligibility`、`Knowledge of language and life in the UK` 与 SRC-020 HK 60.1、62.1 相符。嘉宁不因 Earned Settlement 基准变化自动变成更长路线。
- **family**：现行一般伴侣最低收入仍为 £29,000，且存在旧申请过渡及指定福利例外；不应以拟议的家庭 contribution 门槛替换。索菲娅的英国公民伴侣身份是虚构已知事实，不能推广成所有 family sponsor 都获相同改革待遇。[Family financial guide][family-income] `Financial requirements`；SRC-024 E-LTRP.3.1–3.8；SRC-001 p18、p46。

### 3.2 Graduate、HPI：已有条件与预算提议分开

GR 8.1 已包含申请日边界，预算案提出的大学例外尚不在该表中；不要向玩家承诺“某大学一定仍可获两年”。HPI 当前年度 cap 为 8,000，学位需匹配**授予当日**对应的 Global Universities List，而不是只看今天的学校名单；目前没有核实到预算案扩容后的新 cap／实施日期。[候选 SRC-037][src037] 引言、HPI 1.6A、5.1–5.3；[候选 SRC-038][src038] 首段。HPI／Graduate 本身不是直接定居路线，这不等于它们的全部历史时间在现行 Long Residence 下一概不计入（LR 11.1）。

### 3.3 English language、Life in the UK

已回读 [Skilled Worker English guide][sw-english]：入境／续签英语与定居英语分别处理，不能从一个页面的概述推导所有路线。仓库已保存各路线的 settlement 英语分界与 BN(O) 例外，本次没有找到应改数字的证据。

Life in the UK 预约页仍列 £50、45 分钟、24 题，至少提前三天预约；未看到新版考试或 UKRS 的 A2 版考试已上线的官方公告。[候选 SRC-047][src047] `Book the Life in the UK Test`、`Prepare for the test`；费用另见已登记 SRC-031 §9 `Life in the UK test` 行。PD-020／021 保留，不能把“正在审查考试内容”写成已经换题库。

### 3.4 eVisa、ETA、费用与 IHS

| 主题 | 当前直接证据 | 入库／内容建议 |
|---|---|---|
| eVisa | [候选 SRC-044][src044] `Before you travel`、`When you travel`：核对 UKVI 账户中的护照、身份状态及承运人资料；[eVisa overview][evisa-overview] `Access your eVisa`：访问账户无需付费。 | 可做换护照、出行前核对、生成 share code 的生活事件；不能把更新账户写成获批新许可或延长停留。没有证据证明这些说明是在本窗口新引入。 |
| ETA | [候选 SRC-045][src045] `Overview`、`Who needs an ETA`：£20；已有在英生活、工作或学习许可者列为无需 ETA 的例子。费用与 SRC-031 §1 ETA 行一致。 | 为来访亲属设计情节时先按国籍／旅行目的区分 ETA 与 visa；现有三个角色不是每次返英都交 ETA。未发现本窗口新费率。 |
| 当前费用 | [SRC-030][sw-fees] `Application fees` 境内标准工签不超过三年 £943；[SRC-031][fee-table] §9 BN(O) 30个月 £206、Leave to remain—Other £1,407、ILR £3,226。 | 与 `current-law-2026-11.ts` 的四个申请费参数逐项一致；无需改成预算案数字。 |
| IHS | [候选 SRC-046][src046] `Cost for a year`：一般申请 £1,035；学生及相应家属、YMS、未满18岁申请有 £776 费率；不足一年有另行计费规则。 | 当前游戏按成人场景使用一般费率合理；扩展学生／儿童时须另建参数及取整逻辑，不能直接复用成人乘年数。未发现本窗口新 IHS 费率。 |
| ISC／CoS 税务豁免 | [候选 SRC-049][src049] `General description` 限定两类雇主支付，不扩到其他移民费用；[候选 SRC-051][src051] Resolution 15 已通过。 | 只可成为雇主／HR 来信素材；不从玩家续签费、IHS 或 ILR 费里扣除。 |

预算案还有 asylum accommodation 的资本开支安排（候选 SRC-034 §7.4 `Asylum accommodation`）；它不是定居合格期或许可条件，不能直接加入资格参数。另有旧政策的立法进展：Finance Bill Part 6 拟对高校征收 international student levy，clause 211(1)–(2) 写明向 provider 征收、每名国际学生 £925，clause 219(1) 指向自 2028-08-01 开始的学年（候选 SRC-050，物理 p193、p196）。这是已提出的 Bill 条文，不是本窗口新的学生个人签证收费；不把它自动加到玩家学费或 IHS 上。

### 3.5 议会、委员会与证据状态

Hansard 的实施口头时间表已由 SRC-002／003 收录，本次实时回读相同实施句。另核查 Written Statements 的 HCWS311：它对应 HC 584，不是 Earned Settlement 新声明。委员会方面，回读 Home Affairs Committee [报告发布页][hac-report]，该报告发表于 2026-03-13；[问题 37687 的 11 月 2 日回答][q37687] 说对两委员会报告的正式回应将随后提供，本次检索未找到窗口内发布的新正式回应，不能把咨询回应自动称为对委员会建议逐条作答。

Women and Equalities Committee 的取证与信函是本窗口新增议会材料（候选 SRC-042／043）。它们适合扩展照护、收入中断、父母不同进度、残障福利和家庭安全的人物处境；不构成已经确定的豁免。13 日回答的预测是**无改革的反事实基线**，不是改革后批准人数，更不能转成某个角色的获批概率（候选 SRC-041，Answer 第2–4段）。

## 4. 拟新增来源登记草案

沿用现有八列格式；下列编号连续暂拟，后续登记者应先核对是否已被其他任务占用。`todo` 表示未存档，不表示本文只看过二手消息。动态 guide 没有可靠的子页版本日时明确留空，不以旧 guide 元数据冒充本次政策发布日期。

| ID（拟） | 等级 | 标题 | URL | 发布日／版本日 | 抓取日 | 本地快照 | 状态 |
|---|---|---|---|---|---|---|---|
| SRC-032 | REFERENCE | Immigration Rules: statement of changes | [官方原文][src032] | 首发 2014-01-22；当前目录更新 2026-09-03 | —（在线核查 2026-11-15） | — | todo |
| SRC-033 | POLICY | CP 1707 government response，accessible HTML（SRC-001 补充版本） | [官方原文][src033] | HTML 于 2026-11-12 加入；政策回应首发见 SRC-001 | —（在线核查 2026-11-15） | — | todo |
| SRC-034 | POLICY | Budget 2026 (HTML)，HC 726 | [官方原文][src034] | 2026-10-28 | —（在线核查 2026-11-15） | — | todo |
| SRC-035 | PARLIAMENT | Written question 40064：工作签证薪资门槛 | [官方原文][src035] | 提问 2026-11-02；回答 2026-11-04 | —（在线核查 2026-11-15） | — | todo |
| SRC-036 | LAW | Immigration Rules Appendix Graduate | [官方原文][src036] | Appendix 版本 2026-08-03（HC 259） | —（在线核查 2026-11-15） | — | todo |
| SRC-037 | LAW | Immigration Rules Appendix High Potential Individual | [官方原文][src037] | Appendix 版本 2026-08-03（HC 259） | —（在线核查 2026-11-15） | — | todo |
| SRC-038 | GUIDANCE | High Potential Individual visa: global universities list 2026 | [官方原文][src038] | 集合页记录 2026-11-01 加入；本子页显示 Updated 2026-11-04 | —（在线核查 2026-11-15） | — | todo |
| SRC-039 | PARLIAMENT | Written question 39721：现有在英者与过渡安排 | [官方原文][src039] | 提问 2026-11-02；回答 2026-11-04 | —（在线核查 2026-11-15） | — | todo |
| SRC-040 | PARLIAMENT | Written question 40262：延迟定居不等于停留许可 | [官方原文][src040] | 提问 2026-11-03；回答 2026-11-10 | —（在线核查 2026-11-15） | — | todo |
| SRC-041 | PARLIAMENT | Written question 41453：定居预测与影响评估 | [官方原文][src041] | 提问 2026-11-10；回答 2026-11-13 | —（在线核查 2026-11-15） | — | todo |
| SRC-042 | PARLIAMENT | Women and Equalities Committee oral evidence，HC 760 | [官方原文][src042] | 2026-11-04 | —（在线核查 2026-11-15） | — | todo |
| SRC-043 | PARLIAMENT | Women and Equalities Committee 致内政大臣函 | [官方原文][src043] | 信件日期 2026-11-05 | —（在线核查 2026-11-15） | — | todo |
| SRC-044 | GUIDANCE | eVisas: Travel with your eVisa | [官方原文][src044] | —（动态 guide 子页；本次未确认独立版本日） | —（在线核查 2026-11-15） | — | todo |
| SRC-045 | GUIDANCE | Get an electronic travel authorisation (ETA): Overview | [官方原文][src045] | —（动态 guide 子页） | —（在线核查 2026-11-15） | — | todo |
| SRC-046 | GUIDANCE | Pay for UK healthcare: How much you have to pay | [官方原文][src046] | —（动态 guide 子页） | —（在线核查 2026-11-15） | — | todo |
| SRC-047 | GUIDANCE | Life in the UK Test: Book the Life in the UK Test | [官方原文][src047] | —（动态 guide 子页） | —（在线核查 2026-11-15） | — | todo |
| SRC-048 | GUIDANCE | British National (Overseas) visa: Settle in the UK | [官方原文][src048] | —（动态 guide 子页） | —（在线核查 2026-11-15） | — | todo |
| SRC-049 | POLICY | HMRC：Income Tax: immigration skills charge and certificate of sponsorship fees | [官方原文][src049] | 2026-10-28 | —（在线核查 2026-11-15） | — | todo |
| SRC-050 | LAW（Bill 草案） | Finance Bill 173，as introduced；不是已获 Royal Assent 的 Act | [官方原文][src050] | 提交 2026-11-03（Bill 173—EN 卷首说明） | —（在线核查 2026-11-15） | — | todo |
| SRC-051 | PARLIAMENT（具有临时法定效力的税收决议） | Budget Resolutions，Resolution 15 | [官方原文][src051] | 2026-11-03 | —（在线核查 2026-11-15） | — | todo |
| SRC-052 | LAW | Statement of Changes HC 584，accessible；补足现有 Appendix 快照的修法链 | [官方原文][src052] | 2026-09-03 | —（在线核查 2026-11-15） | — | todo |
| SRC-053 | PARLIAMENT | HCWS311：Statement of Changes in Immigration Rules | [官方原文][src053] | 2026-09-03 | —（在线核查 2026-11-15） | — | todo |

登记定位备注草稿：

- **SRC-032**：`#statement-of-changes-to-the-immigration-rules:-2026` 年度清单。属于发现入口，不能单独替代具体 LAW 条款。
- **SRC-033**：`#earnings`、`#how-earnings-will-be-assessed`、`#in-summary`、`#chapter-8-transitional-arrangements-and-existing-care-workers`。建议先补到 SRC-001 的关联版本，不必永久新增一个等权政策编号；HTML 与 PDF 页码不能混用。
- **SRC-034**：HTML §7.9 `Backing business and British Industry`（`#backing-business-and-british-industry`）下四条移民措施；§7.4 `Public spending`（`#public-spending-2`）的 ISC／CoS 税务及 asylum accommodation 条目；§5.6 `Backing British business`（`#backing-british-business`）的 Global Talent 回顾。HTML 不显示原 PDF 的全部段号，使用完整条目标题定位；¶6.94／6.95 另由 SRC-035 官方回答明确引用。
- **SRC-035／039／040／041**：定位为问题号 + `Answered on` + Answer 第几段；提问日不是答复日，也不是生效日。
- **SRC-036**：GR 8.1 时长表；GR 4.1 现有大学条件与预算新条件勿混用。**SRC-037**：HPI 1.6A、5.1–5.3；引言的 route not to settlement。**SRC-038**：首段学位授予期间与大学表；集合页 `Updates` 用于解释发布时间。
- **SRC-042**：Q1–Q26，保留证人姓名，证词不能当政府承诺。**SRC-043**：物理 p1–p5；本报告只采用问题与请求，不采用信中转引的外部统计。
- **SRC-044–048**：分别按 §3.3–3.4 列出的原样小节标题定位；后续归档时记录真实抓取日，并保留 URL 的子页路径，不能引用 guide 首页代替子页。
- **SRC-049**：`#general-description-of-the-measure`、`#detailed-proposal` 下 `Operative date`／`Proposed revisions`。**SRC-050**：物理 p21（印刷 p8），clause 15(1)–(2)；物理 p193（印刷 p180）clause 211、p196（印刷 p183）clause 219；[Bill 173—EN][finance-en] 的 Clause 15 第1–9段解释可作为关联文件。
- **SRC-051**：Resolution 15 全文及紧随其后的 statutory-effect 声明、通过结果；永久成法、临时决议、生效付款日期分栏记录。**SRC-052**：`#implementation`、APP SW1–SW2、APP ST8–ST10、APP EU16；**SRC-053**：`Changes to Appendix Skilled Worker to support victims of modern slavery` 与末尾实施段。

## 5. 仓库差异清单

文件定位使用本次 checkout 的行号／标识符；本节区分事实过时、范围限制与新素材，不把未建模事项自动判为 bug。

| 编号 | 文件位置 | 发现／判断 | 建议与来源 |
|---|---|---|---|
| D1 | `docs/tasks/phase-11-plan.md:12` 政策扫描、预算案两条 | “没有生效日期”过于笼统；官方有实施季节／年份，且已有预算文件；Global Talent 的部分扩容被预算案描述为已完成。 | 后续刷新该节，区分方向、实施窗口、确切生效日；候选 SRC-034／035。当前不改文件。 |
| D2 | `packages/policy-data/src/parameters/current-law-2026-11.ts:123` 起；`packages/policy-data/src/data/skilled-occupations.ts` | 工签一般门槛、settlement 分行门槛与所核条文一致；没有证据说表格整体过时。 | 保留；新 SoC 若修改 SW 24.3 或 Appendix Skilled Occupations 再按适用日替换；SRC-004 SW 24.3、候选 SRC-035。 |
| D3 | `packages/engine/src/rules/current-law.ts:1852` `CL-SW-SALARY`、`:1944` `CL-SW-GOING-RATE`；`docs/tasks/reports/11.4-going-rate-transition.md` | row E／SW 14.5 不建模是已审范围限制；12 月边界并非这次发现的新 bug。原 Tier 2 群体与普通工签不能混用。 | 保留原审查结论；如将来补建模，须先澄清 SW 24.3 row E 对 SW 14.5(c) 截止后的引用。不要据此扩大当前任务。 |
| D4 | `packages/policy-data/src/parameters/earned-settlement-2026-11.ts:92` `bestYears10Year`；`docs/pending-details.md` PD-041／042 | HTML 仍同时保留“至少三年”与结构化 best-years 要求；不是新版本已修复矛盾。 | 保留当前按 Table 1 的明确假设；候选 SRC-033 `Earnings`／`How earnings will be assessed`／Annex B。 |
| D5 | `packages/engine/src/rules/current-law.ts:3465` `CL-LR-RESIDENCE-10Y`；`packages/policy-data/src/routes.ts` | 临时路线在改革栏不计入、现行 LR 可计入的区别仍有效。把“将关闭”写成“已关闭”会制造错误。 | 保留两栏；新规则公布后才处理在途／关闭边界；SRC-005 LR 11.1、PD-024。 |
| D6 | `packages/policy-data/src/parameters/current-law-2026-11.ts` 的 BN(O)／GT／family 参数；`packages/engine/src/rules/index.ts` | 已有定居规则及英语分界；本次无数值替换依据。`routes.ts` 的 HPI／Graduate 枚举不表示引擎已评估入境或发签时长。 | 如扩展 Graduate/HPI 许可时长，另写契约，不塞进现有 settlement 结果；候选 SRC-036／037。 |
| D7 | `packages/game/src/events/policy.ts:12` `policyStories`；`packages/policy-data/src/data/policy-changelog.ts:16` | 游戏有白皮书、咨询、回应及旧薪资窗口来信，缺少预算方向与本窗口议会追问；现有回应卡没有写“新规已生效”，无需修错。 | 可新增带“待规则细节”措辞的新闻／后续来信；不能编造已获批或新门槛；候选 SRC-034／039／043。 |
| D8 | `packages/game/src/characters/skilled-worker.ts:2227` 林遥；`packages/game/src/events/policy.ts` `sw-settlement-window-letter` | 林遥是改革前既有工签人物，但不是原 Tier 2；现有到期提醒对应现行截止，不能被回应中的续签延长方向覆盖。 | 补 HR 核实岗位／工资材料、读到改革但仍等正式规则的处境；SRC-004 SW 4.2(b)(ii)、SRC-001 p44。 |
| D9 | `packages/game/src/characters/hong-kong-bno.ts:2640` 嘉宁；`family-partner.ts:2620` 索菲娅 | 嘉宁路线在框架外；索菲娅是 British citizen 的伴侣。二人不能都套用“所有人定居翻倍”的新闻句子。 | 各自给出与同事不同的焦虑与资料核对情节，仍由引擎评估；SRC-020、SRC-024、SRC-001 p18、p25–26。 |
| D10 | `packages/game/src/locations.ts:85` `extensionCost`／`extensionFor`；参数文件费用块 | 当前三种成人续签费用取现有参数，没有发现应因预算案减费的证据。 | 不把雇主 ISC／CoS 税务减免扣到玩家身上；儿童／学生扩展再处理 IHS 例外；SRC-030／031、候选 SRC-046／049／051。 |
| D11 | `packages/game/src/locations.ts` `life-in-the-uk`；`packages/game/src/events/common.ts` 考试事件 | 现实考试资料可扩展为预约、复习、证件核对；游戏动作时长属于平衡设定，不能仅因不同于现实考试时长判为政策错误。 | 费用若展示为现实收费，走来源参数；虚构备考耗时继续留在 balance；候选 SRC-047。 |
| D12 | `docs/pending-details.md` PD-055、§七未建模清单；对照 `current-law.ts` 的 `CL-SW-CHILD`／`CL-HKBNO-DEPENDANT`／`CL-GT-DEPENDANT`／`CL-FAMILY-CHILD` | 部分旧说明还称子女／家属未建模，但当前注册表已有相应规则；是文档历史残留，不是本窗口政府改法。 | 后续仅按实际支持条件更新相关句子，保留仍未建模的例外；不重新打开已关闭的 PD-074。 |

### 应继续保留或拟登记的 UNKNOWN

以下是登记建议，未改 `pending-details.md`，也未预占新 PD 编号。

| 条目 | 官方证据／现有 PD | 处理建议 |
|---|---|---|
| Earned Settlement 各批具体生效日、申请／决定日适用口径、在途累计时间 | SRC-002／003；PD-001／003／004／024；问题 40937 尚待答 | 保留 `UNKNOWN`。下议院与上议院的月度时间表不自动生成某一天的 `effectiveFrom`。 |
| 收入证据、年度归属、public funds 范围及弱势豁免、子女及单亲家庭细节 | PD-005–014／026–028／056–062；候选 SRC-043 问题1–3、8–10 | 不因委员会追问而宣布问题已解决；收入年数与税种冲突亦继续保留。 |
| 新 work visa 门槛、各 SOC going rate、new entrant 统一折扣、PhD 折扣移除的过渡与 settlement 适用范围 | 候选 SRC-034 §7.9、SRC-035 Answer | 拟登记一项参数／语义联动待定；不把 MAC 建议或旧工资资料当新法金额。 |
| Graduate 大学例外的资格定义、名单、适用申请日，HPI 扩容的新名单与 cap | 候选 SRC-034 §7.9；现行 GR 8.1、HPI 1.6A／5.2 | 拟登记两项；现行已明确的日期和 cap 不标成政府未定，只有新方案细节是 `UNKNOWN`。 |
| 最长六个月 curtailment 的 eligible cohort、起算、分档与过渡 | 候选 SRC-035 引用 ¶6.95 | 拟登记；不要与 care worker 的专门安排合并为通用失业保护。 |
| Highest Talent Group／弱势群体细则／UKRS A2 版考试 | PD-011／020／021／027／048，候选 SRC-033 相应小节 | 本次未发现可以关闭这些条目的官方实施文本。 |
| SW 24.3 row E 在 SW 14.5(c) 截止后的表格引用 | SRC-004 对应条款；11.4 报告已提出 | 如未来纳入此群体，按原建议登记；当前不扩建规则。 |

## 6. 后续扩展建议

S＝单一小改或少量事件；M＝一个独立任务，含契约／翻译／相关测试；L＝需拆 brief 的跨层工作。优先级表示先做什么，不代表本任务已经授权实现。

| 优先级／项 | 类别与负责 package | 规模 | 具体内容 | 依赖与风险 | 验收方式 |
|---|---|---|---|---|---|
| P0／E1 来源与政策扫描校准 | 参数（`policy-data` 来源基础；`docs` 配套） | S–M | 登记必要候选，先补预算案、Graduate/HPI LAW、议会澄清；修正 D1 的时间窗口与状态说明。 | 来源正式登记／归档后才能引用；临时编号不得直接进入代码。 | 抽查每项数字与 locator；日期分清公布／适用／抓取；不改现行阈值。 |
| P0／E2 正式规则公布后的触发任务 | 规则语义（`engine`）；配套参数（`policy-data`） | L，条件触发 | 依既有 `docs/tasks/phase-6-plan.md` 的流程，先做 SoC 差异／过渡契约，再改受影响规则。 | 只有官方 SoC 和适用日期足够明确才启动；需防止把提案和历史条款混用。 | 受影响日期前／当日／之后、存量／新申请及过渡群体测试；相关 typecheck/test/build。 |
| P1／E3 预算与“还在等细则”的新闻链 | 游戏内容（`game`） | S–M | 一张预算新闻、随后 HR／学校来信；玩家可读原文、整理材料、讨论不同处境。 | 候选 SRC-034／035／039 登记；不代算未来薪资、不声称选择已改变获批结果。 | 时间窗口外不出现、只出现一次；中英状态措辞一致；选择前后只改变设计允许的游戏事实。 |
| P1／E4 eVisa 与来访家人生活事件 | 游戏内容（`game`）；现实费用参数（`policy-data`） | M | 换护照、核对账户、返英资料、按亲属国籍区分 ETA／visa。 | 候选 SRC-044／045；不得把账户更新模拟为续签，不给所有来访者同一旅行许可。 | 前置身份／时间条件；已有许可者不重复收费；保存载入后事件状态保持；受影响画面截图。 |
| P1／E5 收入中断与家庭不同步 | 游戏内容（`game`） | M | 照护、病假、伴侣轮班、成年子女等待；复用现有收入／家庭事实。 | 候选 SRC-042／043 只作处境依据；政策后果用已有引擎，未定豁免不得虚构成承诺。 | 选择前后的 incomeYears／relationship 与引擎输出对照；不把使用合法支持写成道德惩罚。 |
| P1／E6 旧文档范围说明同步 | 规则语义说明（`engine` 契约对应 `docs`） | S | 清理 D12 已由后续任务实现但仍写“未建模”的句子。 | 以当前注册规则与既有验收为依据；不扩大未覆盖例外。 | 文档逐条对应规则 ID；只改文字时按低风险 diff 检查。 |
| P2／E7 Graduate／HPI 新人物或许可场景 | 游戏内容（`game`）；参数（`policy-data`）；若评估许可条件则另属规则语义（`engine`） | M；完整发签模型为 L | 毕业后找工作／转工签故事；只实现已明确的 GR 8.1 或 HPI 授予日名单条件。 | 候选 SRC-036–038；目前引擎是定居模型，不能伪装成已完成签证 eligibility；预算大学例外等细则。 | Graduate 申请日边界及博士分支；HPI 用学位授予日匹配名单；临时路线与现行 LR 保持区别。 |
| P2／E8 考试预约与费用细节 | 游戏内容（`game`）；现实收费参数（`policy-data`） | S–M | 预约、复习、证件与考试结果的叙事；如计真实费用，另加有来源参数。 | 候选 SRC-047／SRC-031；英语考试按具体认可供应商，不编造统一收费。 | 不用游戏答题直接宣称现实考试已通过；收费与状态转换明确；既有豁免不受影响。 |
| P2／E9 新群体费用与 HR 税务素材 | 参数（`policy-data`）；游戏内容（`game`） | M | 学生／儿童 IHS 分档只在相关人物启用；ISC／CoS 豁免限雇主来信。 | 候选 SRC-046／049–051；税务豁免不等于申请费免除，也不能计入 qualifying earnings。 | 成人现有费用回归；新费率与半年规则用实例核对；玩家余额无错误减免。 |

当前优先建议是 E1、E3、E4、E5：能增加真实生活密度，同时不必猜测尚未公布的法律细节。E2 等正式文件触发；E7 不应为了一个新闻标题先开发完整许可引擎。

## 7. 二手来源与解析阅读记录

本表全部**仅交叉验证**；正文政策结论均回到前述官方材料。窗口之前的文章只作背景，不能假装是本窗口新信息。

| 来源／阅读范围 | 日期 | 用途与限制 |
|---|---|---|
| [Guardian：Mahmood 的方案调整报道][guardian]，已打开正文 | 2026-11-02 | 仅交叉验证；识别过渡争议。 |
| [AP：Britain says many migrants will have to wait longer][ap]，检索提供的报道摘录；直开失败 | 2026-11-02 | 仅交叉验证；新闻使用约数，不能替代精确门槛；未声称通读全文。 |
| [Kingsley Napley：Earned Settlement FAQs][kn]，读取资格、强制要求及 Long Residence 问答 | 动态 FAQ；本次不认定独立首发日 | 仅交叉验证；检查公众常见混淆，具体路线英语／例外回查 Rules。 |
| [Chambers／Alexander Finch：consultation response 与 employers][chambers]，正文 | 2026-11-06 | 仅交叉验证；取得雇主持续担保及分批规则实施线索，回查 SRC-002／003。 |
| [Migration Observatory：Settlement reforms mark a shift…][mo]，全文 | 2026-11-02 | 仅交叉验证；用于贫困、临时身份、雇主依赖的处境线索；不把其影响判断当个人结论。 |
| [IPPR：Earned settlement: Decision time][ippr]，正文与方法说明 | 2026-11-02；内容为公告前讨论 | 仅交叉验证；显示溯及适用与照护职业争议；其财政模型没有导入参数，也不用于证明最终规则。 |
| [Commons Library：CBP-10267][library]，网页摘要 | 2026-11-03 | 仅交叉验证（官方研究简报仍是规则摘要）；网页把特定大学 Graduate 未来时长写成 36 个月，与预算原文“两年”不一致，本报告采用财政部原文，不沿用该句。 |

对 Institute for Government 的针对性检索没有取得可确认的本窗口专题原文；尝试的解释页不可访问，未列为已读材料。没有用 Reddit／搜索摘要替代法律依据。二手来源发现争议，只能转成核查线索或明确标为角色意见的虚构反应。

## 8. 验证与限制

- 本地读取 SOURCES、pending-details、Phase 11 政策扫描、两份参数文件、路线分类、规则注册表与相关实现、政策卡及三位人物初始处境；核查范围不等于逐字审阅整个游戏或整个引擎。
- 对上述 13 个 Appendix 查询 Content API 的独立更新时间与最新变更；对 SW 24.3、SW 22A.1、LR 11.1、GT 11.1–11.2、GR 8.1、HPI 1.6A／5.2、BN(O) guidance、费用与 IHS 做正文回读。guide 的旧 `public_updated_at` 不用于证明子页内容没有变化。
- 核对议会回答的提问日／回答日，直接读取委员会记录、临时税收决议与 Finance Bill clause 15；不把待答问题、证词、Bill 文本或部长计划混同为已生效 Immigration Rules。
- 未归档来源、未修改其他文档、未实施扩展。没有复跑历史实验／测试或应用构建；本次只新增文档，按 brief 与 AGENTS 的低风险等级检查文件范围、空白错误和引用定位。
- 未全面审阅 Immigration and Asylum Bill、所有 SI／法院判决或所有政策路线；其执法与庇护制度条款不能被本次“未发现定居参数更新”结论覆盖。未来时点的实际法律状态仍须重新查询。

[src032]: https://www.gov.uk/government/collections/immigration-rules-statement-of-changes
[src033]: https://www.gov.uk/government/consultations/earned-settlement/outcome/a-fairer-pathway-to-settlement-government-response-to-the-consultation
[src034]: https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html
[src035]: https://questions-statements.parliament.uk/written-questions/detail/2026-11-02/40064
[src036]: https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-graduate
[src037]: https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-high-potential-individual
[src038]: https://www.gov.uk/government/publications/high-potential-individual-visa-global-universities-list/high-potential-individual-visa-global-universities-list-2026
[src039]: https://questions-statements.parliament.uk/written-questions/detail/2026-11-02/39721
[src040]: https://questions-statements.parliament.uk/written-questions/detail/2026-11-03/40262
[src041]: https://questions-statements.parliament.uk/written-questions/detail/2026-11-10/41453
[src042]: https://committees.parliament.uk/oralevidence/18236/html
[src043]: https://committees.parliament.uk/publications/55734/standard/pdf/
[src044]: https://www.gov.uk/evisa/travel-with-evisa
[src045]: https://www.gov.uk/eta
[src046]: https://www.gov.uk/healthcare-immigration-application/how-much-pay
[src047]: https://www.gov.uk/life-in-the-uk-test
[src048]: https://www.gov.uk/british-national-overseas-bno-visa/settle-in-the-uk
[src049]: https://www.gov.uk/government/publications/income-tax-treatment-of-immigration-skills-charge-and-certificate-of-sponsorship-fees/income-tax-immigration-skills-charge-and-certificate-of-sponsorship-fees
[src050]: https://publications.parliament.uk/pa/bills/cbill/59-02/0173/260173.pdf
[src051]: https://hansard.parliament.uk/Commons/2026-11-03/debates/31AB917B-C6F4-41D2-B256-BAB5D978DA92/BudgetResolutions
[src052]: https://www.gov.uk/government/publications/statement-of-changes-to-the-immigration-rules-hc-584-3-september-2026/statement-of-changes-to-the-immigration-rules-hc-584-3-september-2026-accessible
[src053]: https://questions-statements.parliament.uk/written-statements/detail/2026-09-03/hcws311
[consultation]: https://www.gov.uk/government/consultations/earned-settlement
[commons-es]: https://hansard.parliament.uk/Commons/2026-11-02/debates/09F388D2-539E-4B0A-ABE2-D3195B14AF0E/ImmigrationEarnedSettlement
[lords-es]: https://hansard.parliament.uk/Lords/2026-11-02/debates/5D3D04DB-0971-4B22-B841-6414AAFAA8C9/ImmigrationEarnedSettlement
[sw-rules]: https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-worker
[lr-rules]: https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-long-residence
[gt-rules]: https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-global-talent
[hpi-lists]: https://www.gov.uk/government/publications/high-potential-individual-visa-global-universities-list
[graduate-guide]: https://www.gov.uk/graduate-visa
[sw-english]: https://www.gov.uk/skilled-worker-visa/knowledge-of-english
[family-income]: https://www.gov.uk/uk-family-visa/proof-income-partner
[sw-fees]: https://www.gov.uk/skilled-worker-visa/how-much-it-costs
[fee-table]: https://www.gov.uk/government/publications/visa-regulations-revised-table/home-office-immigration-and-nationality-fees-8-october-2026
[evisa-overview]: https://www.gov.uk/evisa
[ukri-funders]: https://www.gov.uk/government/publications/ukri-endorsement-endorsed-funders-global-talent-visa
[finance-en]: https://publications.parliament.uk/pa/bills/cbill/59-02/0173/en/260173en.pdf
[q40937]: https://questions-statements.parliament.uk/written-questions/detail/2026-11-04/40937/
[q42238]: https://questions-statements.parliament.uk/written-questions/detail/2026-11-11/42238
[q37687]: https://questions-statements.parliament.uk/written-questions/detail/2026-10-23/37687
[hac-report]: https://committees.parliament.uk/committee/83/home-affairs-committee/news/212667/report-publication-earned-settlement-examining-the-governments-proposed-reforms/
[guardian]: https://www.theguardian.com/uk-news/2026/nov/02/shabana-mahmood-softens-immigration-plans-cabinet-backlash-leave-to-remain
[ap]: https://apnews.com/article/6f066b43dc0f24a29c0771f7941f847d
[kn]: https://www.kingsleynapley.co.uk/services/expertise/immigration/earned-settlement-faqs-the-governments-proposals-for-indefinite-leave-to-remain/
[chambers]: https://chambers.com/articles/government-response-to-earned-settlement-consultation-key-changes-and-what-employers-need-to-do
[mo]: https://migrationobservatory.ox.ac.uk/press/settlement-reforms-more-restrictive-system/
[ippr]: https://www.ippr.org/articles/earned-settlement-decision-time
[library]: https://commonslibrary.parliament.uk/research-briefings/cbp-10267/
