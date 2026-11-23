# 任务 90 · 德国完整版规则引擎

## 1. 做了什么（建议提交）

| PROGRESS | 建议 commit message | 文件 |
|---|---|---|
| 710 | `Docs: 登记德国完整版官方来源与待核事项` | `docs/SOURCES.md`、`docs/pending-details.md`、`apps/web/lib/sources.ts`、`policy-sources/2026-11-23-de-*` 本次新增的 53 份快照、`PROGRESS.md` 第 710 行记录 |
| 711 | `Feat: 登记德国完整版规则集与年度参数` | `packages/policy-data/src/{types,index,parameters/index,parameters/germany-2026-11}.ts`、`PROGRESS.md` 第 711 行记录 |
| 712 | `Feat: 实现德国定居、入籍与永久居住权完整版评估` | `packages/engine/src/{index,germany-full,germany-full-shared,germany-full-common,germany-settlement,germany-citizenship,germany-mobility,germany-fees}.ts`、`packages/engine/test/germany-{full,settlement,citizenship,mobility}.test.ts`、本报告、`PROGRESS.md` 第 712 行记录 |

三次提交共用署名 `Co-Authored-By: Codex gpt-6.2-astra <noreply@openai.com>`。

`evaluateGermanyFull(request)` 从引擎包导出，按 `simulationDate` 和可选 `locale` 返回 `CountryResult`。规则集为 `de.current-law-2026-11`，政策核验日为 2026-11-23。省略 `routes` 会评估 R00–R18，其中 R05 有普通和加速两个结果。传入例如 `routes: ['R01', 'R06']` 可评估选定路径。无回答时，20 个路径结果均为 `UNKNOWN`。

旧入口继续负责既有居留、出境和入籍计时。完整版保留分别核对的条件及日期，另查法定替代、除外和裁量。只有时间及缴费可以按原模型外推、其余实质条件均达标时，才把未来日期用作整条路径的 `FUTURE` 日期。没有日期依据的路线评估模拟日。费用、管辖、证书交付和初次签发提示独立列示。

### 路径、条件 ID 与来源

下表取自对 `evaluateGermanyFull` 的实际调用。路径、条件均省略开头的 `DE-`，来源数字均省略 `SRC-`。括号内列出各样本中该条件返回的来源。具体条款、页码或段落见结果的 `sources[].locator`。

| 路径 | 共用条件（来源见下表） | 本路径条件（来源） | 费用组 |
|---|---|---|---|
| R00 许可存续与出境 | — | C63-time（100、108）、C63（100）；逐证件 C63-类型、C64-settlement、C64-eu-long-term（100、108） | — |
| R01 一般定居许可 | C01–C12、C01-procedure、C06-authority、C11-deadline、C63-current | C13（100、107、108、109） | 定居 |
| R02 技术人员定居 | C01、C01-procedure、C02、C03、C04、C06、C06-authority、C07、C08、C09、C10、C11、C11-deadline、C12、C63-current | C15（100、107）；C15-time（100）；C16（100、430）；C16-initial（100、425）；C17（100、439） | 定居 |
| R03 欧盟蓝卡定居 | C01、C01-procedure、C02、C03、C04、C06、C06-authority、C07、C09、C10、C11、C11-deadline、C12、C63-current | C19、C21-job（100、107）；C19-months（100、107、109、420、425、431）；C19-time（100、107、109）；C20（100）；C21-pay（100、420、425） | 定居 |
| R04 德国公民家属定居 | C01、C01-procedure、C02、C03、C04、C06、C06-authority、C08、C11、C11-deadline、C12、C63-current | C22（100、108、427）；C22-time（100、108） | 定居 |
| R05 难民定居（普通档） | C01、C01-procedure、C02、C04、C06、C06-authority、C07、C08、C09、C10、C11、C11-deadline、C12、C63-current | C24-notice（100、438）；C24-title（100）；C25（100、423、428）；C25-time（100、108） | 定居 |
| R05-fast 难民定居（加速档） | C01、C01-procedure、C02、C04、C06、C06-authority、C07、C08、C09、C10、C11、C11-deadline、C12、C63-current | C24-notice（100、438）；C24-title（100）；C26（100、423、428）；C26-time（100、108） | 定居 |
| R06 欧盟长期居留 | C01、C01-procedure、C02、C03、C04、C06、C06-authority、C08、C09、C10、C11、C11-deadline、C12、C63-current | C27（100、437）；C28、C29-income、C29-tax、C29-work（100、108）；C30-care、C30-pension（100、429） | 欧盟长期居留 |
| R07 一般入籍 | C46–C54、C46-application、C63-current | C55（101、103、104、105、106、109） | 入籍 |
| R08 德国公民配偶或登记伴侣入籍 | C46–C54、C46-application、C63-current | C56、C57（101、106）；C56-time（101、103、105、106、109） | 入籍 |
| R09 辅助保护及其他人道定居 | C01–C12、C01-procedure、C06-authority、C11-deadline、C63-current | C32-discretion、C32-title（100、416）；C32-time（100） | 定居 |
| R10 企业经营者定居 | C01、C01-procedure、C02、C03、C04、C06、C06-authority、C11、C11-deadline、C12、C63-current | C34-initial、C34-time、C35-discretion（100）；C34-title、C35-business（100、417） | 定居 |
| R11 在德长大的家庭居留子女 | C01、C01-procedure、C02、C06、C06-authority、C11、C11-deadline、C12、C63-current | C36-language、C36-livelihood、C37-aid、C37-conduct（100）；C36-time、C36-title（100、418） | 定居 |
| R12 技术人员定居许可持有人的配偶 | C01、C01-procedure、C02、C03、C04、C06、C06-authority、C07、C08、C09、C10、C11、C11-deadline、C12、C63-current | C38-family、C38-time（100）；C38-work（100、107） | 定居 |
| R13 高资质学术人才定居 | C01、C01-procedure、C02、C03、C04、C06、C06-authority、C11、C11-deadline、C12 | C39-consent、C40（100）；C39-post（100、107、430） | 定居 |
| R14 德国公务员定居 | C01、C01-procedure、C02、C03、C04、C06、C06-authority、C07、C08、C09、C10、C11、C11-deadline、C12、C63-current | C41-appointment、C41-time（100） | 定居 |
| R15 共同生活结束后的配偶定居 | C01、C01-procedure、C02、C03、C04、C06、C06-authority、C08、C09、C10、C11、C11-deadline、C12、C63-current | C42-family、C42-maintenance（100、108）；C42-time（100、107、108、109） | 定居 |
| R16 家属随同入籍 | C46–C54、C46-application、C63-current | C58、C58-decision、C58-guidance（101、106） | 入籍 |
| R17 裁量入籍 | C46、C46-application、C52、C53、C54、C63-current | C59、C60、C62（101、106）；C61-guidance（106） | 入籍 |
| R18 自由流动永久居住权 | — | C43、C44、C45（422） | 自由流动证件 |

| 共用条件 ID | 来源 |
|---|---|
| C01、C01-procedure、C05、C06、C06-authority、C08、C12、C63-current | 100 |
| C02 | 100、410 |
| C03 | 100、415、426、435 |
| C04 | 100、415 |
| C07 | 100、107 |
| C09 | 100、412、432 |
| C10 | 100、108 |
| C11、C11-deadline | 100、413 |
| C46、C47、C48、C49、C50 | 101、106 |
| C46-application | 101 |
| C51 | 101、411、412、414 |
| C52 | 101、106、424 |
| C53 | 100、101 |
| C54 | 101、105 |

| 费用组 | 条件 ID（来源） |
|---|---|
| 定居 | C65、C65-advance、C65-paid（410、434，协定身份另有 433，保护减免另有 438）、C65-express（410、434）；C67（410、433、434、438）；C71（412、432）；C71-exemption（412、425、436） |
| 欧盟长期居留 | C66、C66-advance、C66-paid（410、434，协定身份另有 433）、C66-express（410、434）；C67（410、433、434、438）；C71（412、432）；C71-exemption（412、425、436） |
| 入籍 | C69、C69-paid、C69-review（101、411）；C70（411）；C71（412、432）；C71-exemption（412、425、436） |
| 自由流动证件 | C68、C68-paid（410、433、434） |

**按回答出现的条件**

- R00 没有逐证件记录时使用 C63，填写文书后，每份普通文书输出 C63-类型，永久文书使用 C64-类型。同类的第二份起依输入顺序加 `-2`、`-3` 等后缀。普通后缀为 `study`、`training`、`skilled`、`research`、`blue-card`、`german-family`、`other`、`temporary`、`job-seeking`、`opportunity-card`、`follow-up-card`、`protection`、`subsidiary`、`resettlement`、`integration`、`humanitarian`、`temporary-humanitarian`、`asylum`、`blue-card-family`、`ict`、`visa`。C63-time 保留原出境计时。多证各查失效事实，R00 汇总是否至少一证存续。R00 无新申请费用。
- C63-current 检查本路径所依赖的许可是否仍有效。蓝卡也可明确申报决定日持卡；其他依赖德国许可的路径，在缺少文书存续事实时保留 UNKNOWN。永久自由流动权或瑞士协定权可独立支持入籍。C16-initial、C34-initial 分别在填写首次技术人员或经营者许可资料时出现。
- Express 分项在受理加急时出现，paid 分项在填写已付款时出现。C69-review 针对拒绝／撤回等处理阶段，C71-exemption 针对填写受雇收入及子女人数的课程费用个案。费用和交付手续独立列示。

**档案中的交叉引用**

| 档案项 | 对应输出 | 引用条款 |
|---|---|---|
| C14（R01） | C03–C10，历史文件另见 C12 | SRC-100 § 9 Abs. 2–3 |
| C18（R02、R03） | C03、C04、C06、C07、C09、C10；语言分别见 C08、C20 | SRC-100 § 18c Abs. 1–2；SRC-107 Nr. 18c.1.1.4–5、18c.2.1.4–5 |
| C23（R04） | C03、C04、C06、C08；家属依据见 C22 | SRC-100 §§ 5、28 Abs. 2；SRC-427 “Voraussetzungen”；SRC-435 1 C 12.10 |
| C31（R06） | C06、C08、C09、C10；附加税务、职业、养老及护理险见 C29、C30 子项 | SRC-100 § 9a Abs. 2；SRC-437 Art. 5–7 |
| C33（R09） | C03–C10，裁量见 C32-discretion | SRC-100 §§ 9、26 Abs. 4；SRC-416 “Voraussetzungen” |

### 来源与待核事项

复用 SRC-100–109 的德国法律与原计时资料。SRC-104、105 补入公布法令原刊。新增 SRC-410–439 共 30 个编号，逐件文件名、SHA-256 与网址见 `docs/SOURCES.md` 的一级来源表和德国登记备注。柏林行政机关的生计比例只用于其明确适用的地方情形。

以下覆盖新增 PD-340–359。表中是涉及的主要条件；每个实际输出还携带本次适用的 PD。既有持证、出境与入籍时间口径继续使用 PD-120–129、PD-155。

| 待核事项 | 条件及保留 UNKNOWN 的原因 |
|---|---|
| PD-340 | C01、C02、C46 涉及证件替代、代理资格、境内申请和签证豁免。证据不足或仍待认定。 |
| PD-341、342 | C03、C23、C29、C49、C60 涉及可计家庭、暖租、保险、收入持续性、福利领取或潜在资格及可执行扶养。缺少需要档位或对应年度标准时，单凭工资无法核算。 |
| PD-343、344 | C04、C05、C17、C30 区分家庭共保、私保或外保、护理险及养老等值。只申报私人保单或申请豁免时尚缺机关认可。 |
| PD-345 | C06、C37、C52、C53 将已确认的拒发事由与待审案件、轻刑裁量和境外裁判区分。自报无已知不利事实时，机关安全核查另列。 |
| PD-346、347 | C07–C09、C15–C21、C50、C51 涉及当前岗位、执业许可、等级、考试成绩、面谈与豁免。未确认的等效证明、豁免或不合法的分数需要补证。 |
| PD-348、349 | C08–C12、C59 涉及本地住房标准、登记与过渡法；联邦面积指引只作参考。旧证文书、居住地或历史版本未核时保留待确认。 |
| PD-350、351 | C19–C21、C24–C26 按当年工资、实际就业、缴费及语言档核算蓝卡，按地区、生计、退休及 BAMF 通知核难民。未登记年度或单纯“本人没收到通知”不足以完成判定。 |
| PD-352、353 | C22、C28、C38、C42、C56、C57、C63、C64 涉及实际家庭生活、跨境期间、长期居留和每张文书的失效。准予延期可解决文书存续，出境对该路径可计天数仍需独立核实。 |
| PD-354、355、356 | C32–C42 分别涉及人道或企业授予裁量、海外就读、工时、前配偶扶养，以及高资质岗位认证、州同意与正式公务任用。客观先决条件达标后，有待作出的个案决定仍为 UNKNOWN。 |
| PD-357 | C43–C45 涉及每段自由流动权源、提前取得依据、取得后离境及机关失权决定。 |
| PD-358、359 | C46–C62、C65–C71 涉及历史工人类别、全职及扶养、缩期、免考、裁量授予、费用减免与地方报价。过去某费率的首次生效日或个案核费不明时不套用现行金额。 |

## 2. 怎么验证的

- 最终工作树运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码为 0。5,337 项测试通过，其中本任务新增 97 项。既有文案导出测试按 `EXPORT_WORDING` 条件跳过 1 项。policy-data 的 6 个测试文件、23 项测试全部通过，包含 `sources.test.ts` 的一级来源登记一致性检查。Next.js 静态导出 27 页，并回读确认 `apps/web/out/germany.html` 存在。
- 将调研档案 `sources.sha256` 中的 59 个哈希分别与归档文件、一级来源表比对，全部一致。53 个新文件均能按仓库核对脚本使用的“文件 → 网址”格式找到原网址，其中有 18 个 PDF。另 6 个沿用原文件名和哈希。
- 通过公开入口对中英文空问卷、逐证件、许可和出境历史、首次签发、加急和撤回等输入读取结果，核对上表。定向用例同时断言条件 ID、来源、待核 PD、适用档次及路径整体状态。
- 手算边界包括 R01 第五个周年日与养老 59／60 月，2026 年多成员家庭月需 €3,361 与差一分的收入，蓝卡逐年工资线及同月去重、难民柏林两档的严格小于、R11 的 16 岁生日与成年分支、R12 每周 20 小时、入籍全职 20／24 月、入籍与 LiD 证明的两条分数线，以及未满 24 岁与生日当天的证件费用。原德国时间入口与原测试文件在工作树中无差异。

## 3. 没做或没验证的

保留未提交工作树，交 Fable 提交。页面、游戏、浏览器 e2e、部署及机关个案认定均不在本次交付内。现有德国页面沿用旧计时入口。网页端本次仅扩充来源网址表，现有公共来源清单会随之列出新网址。

普通短期旅行可按文书和时长判断。复杂人道计时、旧法文书、跨国经历、已确认仍持证但出境天数折算有争议的情况，需要补充核定的期间。未来日期使用原计时模型的持续持证和缴费假设。对尚无年度标准的年份、地方商业考试与未裁定的个案减免，结果中保留 UNKNOWN。档案外的首次临时签证、境外或历史补偿入籍，以及其他独立授予路径未纳入。

## 4. 发现与建议（供页面任务 100）

- **在什么时间、依据哪份证件评估？** 分开问出生日期、首次入境、申请和模拟日期、每份许可的准确条款、存续或续期决定，以及证件是否并存。按证件记录实际离境、目的、所在国家、准返期限及例外。让用户能分别表达“没有出境”和“记不清”。
- **谁靠这份收入生活？** 先确认依法纳入的家庭成员及需求档，再问可计净收入、暖租、另付保费、特殊需要、实际福利与潜在领取资格、持续性、第三方扶养的来源和可执行性。难民另问地区、保护文书、BAMF 通知和两档收入判断。
- **哪些证明在决定日已经成立？** 问期限内的本人／配偶养老、照护折算、医保护理险及等效认定、住房的当地标准、登记、德语证书或豁免、LiD 或入籍考试的实际分数。分开问已知安全因素与机关审查，受调查、已拒绝与尚未收到通知应有不同选项。
- **工作与家庭路径具体依哪一条？** 技术人员问德国毕业与当前合格岗位；蓝卡逐段问工作月、对应年度薪资、同期养老、ISCO、BA 与语言档。家庭问本人和子女各自生日、婚姻或伴侣关系、共同生活、照护及抚养。经营者、学术人员与公务员分别问实际经营、州同意和正式任用文书。
- **是否适用另一条时间或入籍规则？** 欧盟长期居留问各国期间及其类别；自由流动问每段权源、每年缺席、提前取得、取得后离境与失权决定。入籍问当前身份、程序能力、两项声明、全职月份及家庭、刑事裁判与待审状况、历史快速申请、婚姻终结或主申请人同时入籍。裁量缩期和个案授予要能选择“已认定”“待定”“未获准”。
- **本次需要付哪笔费用？** 问申请或撤回阶段、证件类型、年龄、随同子女的个人收入、保护或协定身份、实际减免、已付款及考试渠道。结果页可分别呈现适用总费、已包含的预缴、加急和考试费用。

## 审核修正（review90-1）

### 1. 做了什么

建议提交 `Fix: 修正德国蓝卡计月、定居收费与入籍判定`，对应 PROGRESS 713。本轮回归均通过公开入口 `evaluateGermanyFull` 读取条件、整条路径和适用日期。

| 审核项 | 复现输入与修正后的结果 | 依据 |
|---|---|---|
| 1 · R03 就业空档 | B1，两段就业分别为 2025-01 至 10 月及 2025-12 至 2026-10。11 月留空与显式填写无就业、无缴费给出相同结论。是否可以合计未确认时为 `UNKNOWN`（PD-123、350）。确认不能合计时只计后段 11 个月，按原计时假设预测 2027-09-23。确认可合计时满 21 个月。 | SRC-100 § 18c Abs. 2，SRC-107 Nr. 18c.2.1.1–3 |
| 2 · R03 工资线上调 | 同一岗位自 2024-12 起年薪 €46,000，2025-05 调至 €51,000，合格就业并缴费至 2026-10，决定日仍达线。C19-months 计 23 个月，模拟日满足。恢复工资、决定日工资或岗位连续性未证实时，可能影响达标的月份保留 PD-350。 | SRC-107 Nr. 18c.2.1.2（印刷页 117–118），年度工资参数见 SRC-420、425 |
| 3 · R03 换岗确认 | 自 2025-02 在同一岗位工作 21 个月，无换岗记录时，C21-job 和路径在模拟日满足。登记了适用期内的换岗且机关状态未明时返回 `UNKNOWN`（PD-346），已拒绝时返回 `NOT_MET`。 | SRC-100 §§ 18c Abs. 2、18g Abs. 4，SRC-431「Voraussetzungen」 |
| 4 · R01 配偶养老 | 持证满五年、本人已缴 36 个月。同住配偶月数留空时，C05 和路径为 `UNKNOWN`，附 PD-344，不输出预计日期。配偶已缴 60 个月时，模拟日即满足。本人独立满足时也无需补配偶记录。 | SRC-100 § 9 Abs. 2 Satz 1 Nr. 3、Abs. 3 Satz 1 |
| 5 · R07 入籍日期 | 2022-08-01 起连续合法居住、当前持适格许可且无出境。补填同一天为惯常居住起点前后，均预测 `FUTURE 2027-08-01`。补填较晚起点时，结果不会沿用原先较早的日期。 | SRC-101 §§ 10 Abs. 1、12b |
| 6 · R07 罚金 | 近期可计的国内罚金 120 日额，无仇恨动机，即使填了个案获准忽略，C52 和路径仍为 `NOT_MET`。同时覆盖 90 日额、可裁量上限 111 日额（待决定时为 PD-345），以及刚超过上限的 112 日额。 | SRC-101 § 12a Abs. 1，SRC-106 Nr. 12a.1.3–4 Rdn. 8–10（印刷页 95） |
| 7 · R05 历史版本 | 2025-11-20，§ 25 Abs. 2 难民，BAMF 已确认无通知且适用保护减免。C24-notice、C65、C67 均满足，费用 €0。另核 2026-06-11 和 06-12 的 Entzug：修法后仅普通档将该通知列为障碍。 | SRC-100 § 26 Abs. 3，SRC-438 旧版 § 26 与 2026 I Nr. 111 Art. 2 Nr. 12、Art. 7 Nr. 2、Art. 13 Abs. 2，SRC-434 BT-Drs. 18/12050 Art. 2 Nr. 11 |
| 8 · R01 处理费与付款 | 实质审理后的协定身份成年样例按 €46 的一半收 €23，机关另核 €20 的样例保留 €20。两例的 C65 和 C65-advance 均显示对应金额，C65-paid 在付足时满足，少付 €0.01 时不满足。 | SRC-410 §§ 49 Abs. 1、52a Abs. 2，SRC-433 PAuswGebV § 1 Abs. 1 |

另修正了审核列出的三个风险。适用 § 9 Abs. 2 Satz 6 的生计医疗豁免覆盖其中的医保条件，单独作出的医保决定优先。§ 9c 的医保、护理险继续独立核验（SRC-100 §§ 2 Abs. 3、9、9c）。R00 为同类文书分别输出稳定、唯一的条件 ID 和对应语言的标题。SRC-434 的加急费直接链接 2023 年公报，SRC-104、105 的归档状态已与各自公报 PDF 对齐。

### 2. 怎么验证的

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 串行完成，退出码 0。全库共 5,355 项测试通过，包含本轮新增的 18 项。error-report 2 项、policy-data 23 项、engine 3,340 项、game 1,336 项、web 654 项。既有文案导出测试按 `EXPORT_WORDING` 条件跳过 1 项。Next.js 静态导出 27 页，德国页面产物为 `apps/web/out/germany.html`。

### 3. 没做或没验证的

按要求保留改动在工作树。旧入口 `evaluateGermany` 的计算逻辑与参数值均无改动，`germany.ts` 仅导出既有的双语许可名称供 R00 复用。本轮范围为规则引擎和来源登记，未执行浏览器 e2e、提交或发布。

### 4. 发现与建议

2023-01-01 以前的 BAMF 通知另涉旧保护身份批次，登记在 PD-351。早于已核收费版本（2017-09-01）的保护减免费保留 PD-359。该日期的 § 26 历史版本已从德国法定养老保险机构的法条库在线核对，下载代理无法取得原始 HTML，SRC-438 已标记该历史页待补快照。2026 年修正法及 2017 年收费资料的快照仍可在仓库核对。

## 第二轮审核修正（review90-2）

### 1. 做了什么

PROGRESS 714。建议提交 `Fix: 修正德国蓝卡就业计月、换岗审查与入籍预测日期（review90-2）`。以下结果均取自公开入口 `evaluateGermanyFull`。

| 审核复现 | 条件、路径和最早日期 | 官方依据 |
|---|---|---|
| R03 月中入职。B1，2025-02-24 入职，缴费记录至 2026-10 | 在 2026-11-10 及 11-23，C19-months 已满 20 个月，条件为 `NOT_MET`，路径为 `FUTURE 2026-11-24`。11-24 满 21 个月，条件和路径均为 `MET`。 | SRC-100 § 18c Abs. 2，SRC-107 Nr. 18c.2.1.1–3（第 117–118 页） |
| R03 跨年工资线。2024-12-24 以 €46,000 入职，2025-05 调至 €51,000，缴费记录至 2026-08 | 原就业起点继续有效。在 2026-09-10 及 09-23，C19-months 为 `NOT_MET`，路径为 `FUTURE 2026-09-24`。09-24 条件和路径均为 `MET`。 | SRC-100 § 18c Abs. 2，SRC-107 Nr. 18c.2.1.2–3，年度工资线见 SRC-420、425 |
| R03 已通报换岗。2025-02-01 开始就业，2025-08-01 无缝换岗 | 2026-11-23，首次就业的 12 个月已满，未收到暂停或拒绝时，C19-months、C21-job 和路径均为 `MET`，最早日期为模拟日。实际暂停且结果未明时 C21-job 为 `UNKNOWN`（PD-346），已拒绝时为 `NOT_MET`，两者均无路径日期。拒绝期从实际通知暂停之日计算。 | SRC-100 §§ 18g Abs. 4、82 Abs. 1 Satz 6，SRC-107 Nr. 18g.4.0、18g.4.2–4（第 150–151 页） |
| R07 一般入籍。许可自 2022-08-01 有效，惯常居住经核定自 2022-10-01 起算 | 2026-11-23，C55 为 `NOT_MET`，路径为 `FUTURE 2027-10-01`。另验证许可若在新届满日前一天到期且无后续许可，路径为 `NOT_MET`，无最早日期。 | SRC-101 §§ 10 Abs. 1、12b |
| R08 德国公民配偶入籍。自 2024-08-01 连续合法居住，婚姻和共同生活自 2023-11-01 持续 | 2026-11-23，C56 为 `MET`，C56-time 为 `NOT_MET`。补填相同的核定居住起点前后，路径均为 `FUTURE 2027-08-01`。 | SRC-101 §§ 9 Abs. 1、10 Abs. 1、12b，SRC-106 Nr. 9.1 |

### 2. 怎么验证的

在基线 `44cbf96` 上先运行五组审核复现，五组均失败。修正后运行 `pnpm --filter @uk-immigration/engine exec vitest run test/germany-mobility.test.ts test/germany-citizenship.test.ts test/germany-full.test.ts`，98 项通过。断言覆盖条件状态、路径状态和 `earliestDate`。

用 Node 分别载入 `git show 44cbf96:packages/engine/src/germany.ts` 和工作树实现，将上述五组样例对应的时间输入交给旧入口 `evaluateGermany`。中文和英文共 10 份完整返回值均通过 `assert.deepStrictEqual`。

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 首次完整运行退出码为 0。全库 5,359 项测试通过（error-report 2、policy-data 23、engine 3,344、game 1,336、web 654），另有 1 项文案导出测试按 `EXPORT_WORDING` 条件跳过。构建生成 27 个静态页面，已核实 `apps/web/out/germany.html` 存在且非空。

### 3. 没做或没验证的

未提交。旧入口 `evaluateGermany` 继续使用原时间参数，只有完整版向共享时间计算传入核定起点或就业届满日。本轮未改页面或运行浏览器 e2e。

### 4. 发现与建议

R05 普通档的退休生计豁免是否涵盖医保，仍待核对。审核复现中，达到法定退休年龄且无医保时，C25 为 `MET`，独立的 C04 为 `NOT_MET`，路径受阻。本轮按审核要求记录风险，沿用 PD-351。依据为 SRC-100 § 2 Abs. 3、§ 26 Abs. 3 Satz 2。[AufenthG § 2](https://www.gesetze-im-internet.de/aufenthg_2004/__2.html)、[AufenthG § 26](https://www.gesetze-im-internet.de/aufenthg_2004/__26.html)

## 第三轮审核修正（review90-3）

### 1. 做了什么

PROGRESS 715。建议提交 `Fix: 修正德国蓝卡复工计月并统一文书到期日（review90-3）`。

R03 的 B1 样例在 2024-08-01 首次就业，2025 年 1 月中断，2025-02-24 换岗复工并已通报，机关确认空档前工龄不计。公开入口 `evaluateGermanyFull` 对显式填写失业月份和直接留空两种记录给出相同结果。依据为 SRC-100 § 18c Abs. 2 Sätze 1、3 及 SRC-107 Nr. 18c.2.1.1–3（第 117–118 页）。[AufenthG § 18c](https://www.gesetze-im-internet.de/aufenthg_2004/__18c.html)

| 模拟日 | 复工后已录缴费至 | C19-months | R03 | earliestDate |
|---|---|---|---|---|
| 2026-10-24 | 2026-09 | `NOT_MET`，已满 20 个月 | `FUTURE` | 2026-11-24 |
| 2026-11-01、11-23 | 2026-10 | `NOT_MET`，已满 20 个月 | `FUTURE` | 2026-11-24 |
| 2026-11-24 | 2026-10 | `MET`，已满 21 个月 | `MET` | 2026-11-24 |

复查同一函数时，一并处理了首次就业缺少入职日、前一段不满足同期缴费条件后重新起算的情形。若仅知新段始于 2025 年 2 月，2026-11-01 可确认 20 个月、至多 21 个月，条件与路径均为 `UNKNOWN`，无最早日期。到 11-28，任何可能的 2 月起始日都已满 21 个月。若所有可能起始日计算出的月数都不足，则条件为 `NOT_MET`，缺少日级依据时不外推具体日期。已补记 PD-350。

R07 核定的五年届满日为 2027-10-01 时，同一张蓝卡无论在哪一处填写 2027-09-30 到期，结果均为 `NOT_MET`，无最早日期。两处日期不同时取较早者。若到期日恰为 2027-10-01，当天仍有效，可以预测该日。这里只对模拟日对应的当前限期许可合并日期，后续签发的许可按各自记录评估。依据为 SRC-101 § 10 Abs. 1 Satz 1 Nr. 2、SRC-100 §§ 51 Abs. 1 Nr. 1、81 Abs. 4。[StAG § 10](https://www.gesetze-im-internet.de/stag/__10.html)

### 2. 怎么验证的

在基线 `797cfdb` 上先跑公开入口回归，复现了 2026-10-24 错报 `FUTURE 2026-11-01`、11-01 提前返回 `MET`、缺少入职日仍报达标，以及 R07 两个字段结果不一致。修正后，`pnpm --filter @uk-immigration/engine exec vitest run test/germany-mobility.test.ts test/germany-citizenship.test.ts test/germany-full.test.ts` 共 111 项通过。回归断言条件状态、路径状态及 `earliestDate`，并覆盖到期当日、已确认的 § 81 延续及后续同类新证。

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 首次运行退出码为 0。全库共 5,372 项通过（error-report 2、policy-data 23、engine 3,357、game 1,336、web 654），1 项既有文案导出测试按条件跳过。构建生成 27 个静态页面，已确认 `apps/web/out/germany.html` 非空。

### 3. 没做或没验证的

按要求保留未提交工作树。旧入口 `evaluateGermany` 的实现、参数和原测试与 `797cfdb` 无差异。本轮未改页面，未运行浏览器 e2e。

### 4. 发现与建议

逐证资料若有多份同类文书，目前缺少字段区分它们分别对应哪条许可记录，页面应保留逐证对应关系。R05 普通档退休生计豁免的医保范围继续沿用 PD-351。

## 第四轮审核修正（review90-4）

### 1. 做了什么

PROGRESS 716。建议提交 `Fix: 按实际工作日期计算德国蓝卡就业月数并统一文书事实（review90-4）`。

**R03 就业计月。** 每条 `employment[]` 记录可填实际入职日 `startedOn` 与最后工作日 `endedOn`。`firstMonth`、`lastMonth` 仍表示工资和同期缴费记录覆盖的月份。分别求有证据支持的最短与最长工作区间，按日合并重叠或首尾相接的区间。前一份工作最后一天与下一份工作第一天之间的空档，即使两个月都有缴费，也不计入。新岗位的涨薪不能补足已中断的旧岗位工资。旧数据中的首次就业日或最近换岗日仅在能对应到唯一一段时补充起点。

连续工作的期限按日历月对应日计算。机关已确认可以合计中断前工龄时，累计实际可计工作日，按仓库已有的 BGB § 191 参数换算非连续月份。能否合计仍待认定，或缺少日级证据时，仅在上下限得出相同结论时确定是否达标。无法确定具体日期时保留空值。依据为 SRC-100 § 18c Abs. 2 Sätze 1、3，SRC-107 Nr. 18c.2.1.1–3（印刷页 117–118），SRC-102 BGB §§ 187、188、191；日期与跨空档认定已补记 PD-350。[AufenthG § 18c](https://www.gesetze-im-internet.de/aufenthg_2004/__18c.html)、[BGB § 191](https://www.gesetze-im-internet.de/bgb/__191.html)

`employmentMonths` 的生产调用入口共两个，都从公开的 `evaluateGermanyFull` 到达。

| 入口 | 调用链与结果 |
|---|---|
| 条件 | `mobilityChecks('R03') → blueCardChecks → employmentMonths`。用已确认、最多可计的月数评估 `DE-C19-months`。 |
| 时间线与预测 | `timeCheck('R03') → pilotReader 返回的读取函数 → blueCardTimeInputs → employmentMonths`。用同一结果提供 `blueCardEmploymentMonths` 和可确定的 `employmentDue`；时间线继续检查预测日的持证及出境条件。 |

两处都优先使用逐段记录；未提供 `employment[]` 时读取用户已核定的总数 `blueCardEmploymentMonths`。两次 `employmentBound` 分别计算上下限。`employmentAnniversary` 在 `completedMonths` 核对已满整月、在 `employmentBound` 推算连续工作的届满日，另供 `blueCardChecks` 计算首次就业的换岗审查窗口。旧公开入口 `evaluateGermany → evaluateGermanyTimeline` 仍直接读原计时输入。

**同一份文书的字段清单。** 完整版入口用 `matchDocuments` 确定对应关系，`mergeDocumentFacts` 把同一份文书的事实写回时间线和逐证评估。优先匹配 `kind` 与签发生效日 `from`；缺少起日时，只在能排除其他候选时认定。已确认同时有效或正在续期的同类证件可能构成多个候选。依据为 SRC-100 § 51 Abs. 1、2–4、7、9–10、§ 81 Abs. 4，SRC-101 § 10 Abs. 1 Satz 1 Nr. 2；歧义已补记 PD-353。[AufenthG § 51](https://www.gesetze-im-internet.de/aufenthg_2004/__51.html)、[AufenthG § 81](https://www.gesetze-im-internet.de/aufenthg_2004/__81.html)、[StAG § 10](https://www.gesetze-im-internet.de/stag/__10.html)

| 事实 | 字段及合并方式 |
|---|---|
| 身份、期限及续期 | `kind`、`from`；`to` / `validTo` 取已知较早的具体日期。`validTo: null` 可在两侧表示有效期已确认覆盖模拟日。`renewing` / `continuingUnder81` 归为同一个续期事实。 |
| 独立失效与保护 | `noOtherLossEvent`、`protectedResettlement`。 |
| 文书所涉出境与返德 | `trips[]` 按 `departed` 对应，同段合并 `returned`、`nonTemporary`、`approvedReturnBy`、`exception`、`militaryDischargedOn`、`coercionEndedOn`、`qualifiesUnder37`；段内 `outsideArea[]` 按 `from` 对应并合并 `to`。 |
| 永久居留等例外 | `lawfulYears`、`spouseHasQualifyingLongResidence`、`ageOnDeparture`、`germanSpouseLivingTogether`、`livelihoodSecured`、`noListedExpulsionInterest`、`priorBlueCardOrQualifyingFamilyTitle`。 |
| 签证事实 | `multipleEntryVisa`、`visaDurationDays`。 |

### 2. 怎么验证的

在基线 `ac73b3e` 上，R03 的跨月空档复现返回了 `MET`；单侧续期复现返回了 `UNKNOWN`。同类文书对应不清时也能得到肯定结论。修正后的公开入口回归逐项断言了条件、路径及 `earliestDate`。

| 公开入口输入 | 条件 | 路径 | earliestDate |
|---|---|---|---|
| R03，B1，2025-02-01 至 2025-12-15 就业，2026-01-15 再就业。2026-11-01 模拟，机关确认不计前段 | C19-months `NOT_MET`，复工后已满 9 个月 | `FUTURE` | 2027-10-15 |
| 同一输入，机关确认可计前段 | C19-months `NOT_MET`。两段分别 318 天、290 天，合计 608 天 | `FUTURE` | 2026-11-23；前一日仍未达标，当日为 `MET` |
| 同一输入，机关对前段的认定未知 | C19-months `NOT_MET`，两种算法在模拟日均不足 | `NOT_MET` | 无 |
| 三段就业中，前段最后工作日缺失，可能与后段相接，也可能有空档，两种结论跨越门槛 | C19-months `UNKNOWN` | `UNKNOWN` | 无 |
| R00、R07，五年已满，蓝卡于 2026-10-31 到期；只在 `permits[].renewing` 确认续期，或只在 `mobility.titles[].continuingUnder81` 确认续期 | C63-blue-card / C63-current 均为 `MET` | 均为 `MET` | 均为 2026-11-23 |
| 同一张卡确认发生其他失效事由，续期、失效事实互换填报位置 | 两个持证条件均为 `NOT_MET` | 均为 `NOT_MET` | 无 |
| 一条时间线对应两条无起日的同类逐证记录；反向为两条可能有效的同类时间线对应一份无起日逐证记录 | 两个持证条件均为 `UNKNOWN`，含 PD-353 | 均为 `UNKNOWN` | 无，亦无预测摘要 |

表中的 R03 预测沿用持续合格就业并缴费、届满时持有蓝卡的假设。回归还覆盖了同月离职和复工、重复及相互重叠的中间工作段、已知最后工作日在届满前、同月两份工作却缺前段结束日、同类并存旧证的出境记录分填两侧，以及用生效日排除同类文书歧义。涉及整段就业的旧测试夹具补齐了其断言所需的日期，并保留缺日期时的待核用例。

定向运行 `pnpm --filter @uk-immigration/engine exec vitest run test/germany-mobility.test.ts test/germany-citizenship.test.ts test/germany-full.test.ts test/germany.test.ts`，四个文件共 232 项通过，含原德国计时入口测试。

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 首次运行退出码为 0。全仓 5,388 项通过（error-report 2、policy-data 23、engine 3,373、game 1,336、web 654），1 项文案导出测试按既有条件跳过。构建生成 27 个静态页面，已核实 `apps/web/out/germany.html` 非空。`git diff --check` 通过，旧计时实现与原测试相对 `ac73b3e` 无差异。

### 3. 没做或没验证的

按要求保留未提交工作树。德国页面继续调用 `evaluateGermany`。本轮未改前端，未运行浏览器 e2e。

### 4. 发现与建议

审核中 R05 退休生计豁免是否涵盖医保的问题仍登记在 PD-351，等待官方口径。

## 第五轮审核修正（review90-5）

### 1. 做了什么

PROGRESS 717。建议提交 `Fix: 区分德国蓝卡已缴与预测月份并核对决定日就业和入籍许可（review90-5）`。

R03 同时核对实际工作日与该期间的工资、养老证据。B1 档需要 21 个月。审核样例从 2025-02-15 入职，缴费自 2025-02 至 2026-10，一共涉及 21 个工资月，但从入职到 2026-11-01 只满 20 个整月。模拟日 11-15 或 11-23 均确认 20 个月。若 11 月继续合格就业并缴费，按逐月问卷最早可在 12-01 确认第 21 个月。工资月关闭是本问卷处理证据的边界，法条要求的是同期缴费或等值保障。较早轮次表格中的逐月预测日期以本节为准。依据为 SRC-100 § 18c Abs. 2 Sätze 1、3，SRC-107 Nr. 18c.2.1.1–3（第 117–118 页），连续及非连续期间折算见 SRC-102 BGB §§ 187、188、191。[AufenthG § 18c](https://www.gesetze-im-internet.de/aufenthg_2004/__18c.html)

R07 将已录入、会导致对应许可失效的非暂时性离境放入入籍时间线。失效从离境日开始；只有后续新许可才能恢复相应的合法居留期间。机关已核定的既往可计居住起点继续按核定记录处理。逐证例外待核且影响预测时返回 `UNKNOWN`，关联 PD-353。依据为 SRC-100 § 51 Abs. 1 Nr. 6、Abs. 1a、2、4、7、9，以及 SRC-101 § 10 Abs. 1 Satz 1 Nr. 2、§ 12b Abs. 2–3。[AufenthG § 51](https://www.gesetze-im-internet.de/aufenthg_2004/__51.html) · [StAG § 12b](https://www.gesetze-im-internet.de/stag/__12b.html)

### 2. 怎么验证的

以下均从公开入口 `evaluateGermanyFull` 读取。R03 断言 `DE-C19-months`、路径状态及 `earliestDate`；R07 断言 `DE-C55`、`DE-C63-current`、路径状态及 `earliestDate`。无日期的主要离境用例也检查没有预测摘要。

| 输入 | 模拟日条件 | 路径状态 | earliestDate |
|---|---|---|---|
| R03 自 2025-02-15 持续就业，缴费填至 2026-10；或提前将记录填至 11 月、12 月 | 2026-11-15 和 11-30 均已确认 20 月，C19-months 为 `NOT_MET` | `FUTURE` | 2026-12-01 |
| 同一岗位分为两行，实际入职日均为 2025-02-15，第一行至 2025-12 为 €51,000，第二行自 2026-01 至 11 月为 €56,000 | 2026-11-23 为 20 月、`NOT_MET`。12-01 且 11 月已缴为 21 月、`MET` | 依次为 `FUTURE`、`MET`，与连续填一行相同 | 均为 2026-12-01 |
| 11 月另列一行，缴费留空 | 11-15 为 20 月、`NOT_MET`。到 12-01 仍留空时，已确认 20 月、至多 21 月，条件为 `UNKNOWN` | 依次为 `FUTURE`、`UNKNOWN` | 依次为 2026-12-01、无 |
| R03 自 2025-04-01 在职，最后工作日分别为 2026-12-31 和 2027-01-01 | 2026-11-23 已确认 19 月，C19-months 均为 `NOT_MET` | 提前一天结束为 `NOT_MET`，覆盖届满日为 `FUTURE` | 依次为无、2027-01-01 |
| R07 蓝卡及核定居住自 2022-10-01，2027-08-01 非暂时性离境，08-05 返德，无例外、无新证 | 2026-11-23 的 C63-current 仍为 `MET`，C55 为 `NOT_MET` | `NOT_MET` | 无 |
| R07 同一次离境，适用例外待核、已确认适用旅行证件例外、或旧证失效后于 08-05 获新蓝卡 | 模拟日的持证与居住条件同上 | 依次为 `UNKNOWN`、`FUTURE`、`FUTURE` | 依次为无、2027-10-01、2032-08-05 |

另外验证了按模拟日向前推进时已确认月数不会倒退、同岗缺一月缴费仍保留此前工龄、同日入职的两个岗位各自按合同结束、明确未缴的月份只排除该月。R07 覆盖离境在周年日当天或次日、逐证资料分填在未来新证及历史中断后已换证的情况。

在基线 `d6d3c17` 上，新增 R03 初始对照有 5 项失败，包含提前达标、调薪分行及固定期限合同。R07 初始对照有 4 项失败，另复现了离境记录只填在未来新证、以及既往离境返德后换证两种情况。旧入口 `evaluateGermany` 与基线分别运行五组输入，中英文共 10 份完整结果通过 `assert.deepStrictEqual`。

最终工作树运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码为 0。全仓 5,411 项测试通过（error-report 2、policy-data 23、engine 3,396、game 1,336、web 654），1 项既有文案导出测试按条件跳过。构建生成 27 个静态页面，已回读确认 `apps/web/out/germany.html` 非空。`git diff --check` 通过。

### 3. 没做或没验证的

本轮保留未提交工作树供 Fable 接手。页面任务 100 和浏览器 e2e 不在本次验收范围内。德国页面继续使用原计时入口 `evaluateGermany`。

### 4. 发现与建议（任务 100 的 R03 输入）

**逐行填写的工资与就业记录**

| 字段 | 含义与边界 |
|---|---|
| `simulationDate` | 模拟决定日，使用 ISO 日期。月初评估时上月已经结束，月末当天本月仍开放。 |
| `mobility.blueCard.employment[]`、`blueCardEmploymentMonths` | 有逐行历史时以它为准，空数组表示零段。省略整个数组才读取顶层已核定的合格就业并缴费总月数。总数模式由填报人确认截至模拟日的已获认可月数，引擎无法从单一总数反查工资单或合同终止日。 |
| `jobId`、`startedOn` | `jobId` 是同一岗位的可选标识；`startedOn` 是实际第一工作日，包含当天。同一工作调薪时两行沿用相同的标识和实际入职日。旧数据两行均无标识时，可按同一实际入职日对应；同日开始的不同工作应给不同标识。起日缺失时，仅在首次就业日或最近换岗日能唯一对应该起薪月份的一行时补齐，否则按可能起日计算上下限。 |
| `endedOn` | 实际或已知合同约定的最后工作日，包含当天。未确定结束时留空。属于同一工作的各行共用该日，在任一行填写即可；页面应在岗位层维护一个值。调薪只更新工资区间。决定日须仍有合格就业。 |
| `firstMonth`、`lastMonth` | 这一行的工资、缴费事实覆盖的首末日历月，均包含，格式为 `YYYY-MM`。逐行覆盖月与实际工作期间取交集，同月多份记录只计一次。在同一份工作中，缺某月工资记录仍保留此前已证期间；缺的月份不能作为已证缴费。 |
| 行内 `countableAnnualGross`、`payBand` | 这段工资可计的税前年薪（欧元）与已适用的 `standard` 或 `reduced` 档。跨年按每个工作年份的门槛核对，调薪后金额仅用于对应区间。已公布的门槛见 SRC-420 两份 BAnz 公告各第 1 页、SRC-425 SVBezGrV 2024 § 4 Abs. 1 Nr. 1。 |
| `qualifyingWork`、`pensionForSameMonths` | 前者表示该段属于 § 18g 合格就业，后者表示同月已缴强制或自愿养老费、或同期等值保障已获认可。已结束月份的 `true` 可进入确认数，`false` 排除，未填仅进入可能上限。开放月即使填 `true` 也只支持预测；显式填 `false` 的月份排除在预测缴费之外。 |
| `historicalPayAccepted`、`historicalPayReviewPending` | 前者记录机关对既往差额或旧法工资条件的认定，`false` 排除该差额的例外计入。后者表示工资成分、短工或育儿期仍待核。已认可的历史期间优先；其余有争议的期间仅进入上限。年度工资线上调与后续同岗恢复达线按 SRC-107 Nr. 18c.2.1.2 核对。 |
| `creditBeforeInterruption` | 只用于真实就业中断前的工龄。机关确认可计填 `true`，确认不能计填 `false`，未裁定留空。两种读法跨越门槛时，C19-months 为 `UNKNOWN`，不能确定最早日时留空。相关情形沿用 PD-350。 |

**决定日及分档字段**（下列字段均在 `mobility.blueCard` 内，另标路径者除外）。

| 字段 | 含义与边界 |
|---|---|
| `cardHeldAtDecision`、`permits[]`、`mobility.titles[]`、`firstEntry`、`trips[]` | 决定日持蓝卡的事实、许可时间线、逐证存续、首次入境与旅行记录。已提供逐证记录时从对应文书判断。预测需要时间线与就业均支持同一天。 |
| `fastTrack`、`language`、`languageWaiverAcceptedForTier`、`languageWaiverPendingForTier` | 选择较短档或普通档、已证德语级别、本档豁免已获准或仍待核。未选档时由语言推导；还可读取 `common.provenGerman`、`common.integrationCoursePassed`、`germanB1`。普通档 A1／27 月，较短档 B1／21 月，见 SRC-100 § 2 Abs. 9、11 及 § 18c Abs. 2 Sätze 1、3。 |
| 顶层蓝卡对象的 `countableAnnualGross`、`contractMonths`、`jobInGermanyMatchesQualification`、`genuineEmployment`、`requiredLicencesHeld`、`noExclusionUnder19f` | 分别为决定日可计年薪、合同期限（月）、在德岗位与资质相符、真实就业、所需执业许可齐备，以及没有 § 19f 排除事由。合同期限用于岗位门槛，固定合同的最后工作日填在 `endedOn`。 |
| `qualification`、`recognisedQualification`、`tertiaryProgrammeYears`、`tertiaryLevel` | 分别选择学位、等同高等教育或无此学历，并填学历是否认可。等同高等教育还需课程年数与资格等级。 |
| `isco`、`employmentAgencyApproved`、`relevantItYearsInLookback`、`itExperienceNeededForJob` | ISCO 职业代码、联邦就业局是否批准低档、法定回溯期内同等层次的 IT 从业年数，以及岗位是否需要该经验。 |
| `degreeOn`、`applicationOn`、`renewal`、`firstGraduateCardOn` | 学位取得日、申请日、是否续签及首次以近期毕业生低档获卡日。用来核对对应低档的时间窗。工资、资格及岗位各档依据见 SRC-100 § 18g Abs. 1–7。 |
| `employmentStartedOn`、`latestRelevantChangeOn`、`changeReported`、`jobChangeDecision` | 全局的首次就业日、最近需通报的变更日、通报情况、机关处理状态（无障碍、已暂停、已拒绝）。调薪分行沿用岗位的实际起日；这些全局字段另供首次就业后的换岗审查使用。依据为 SRC-100 §§ 18g Abs. 4、82 Abs. 1 Satz 6，SRC-107 Nr. 18g.4.2–4。 |

R05 退休生计豁免是否涵盖医保仍列 PD-351，留待官方口径确认。
