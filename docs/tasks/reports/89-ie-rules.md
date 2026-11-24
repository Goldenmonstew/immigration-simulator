# 任务 89 · 爱尔兰完整版规则引擎

## 1. 做了什么

| PROGRESS | 建议 commit message | 文件 |
|---|---|---|
| 680 | `Docs: 登记爱尔兰完整版官方来源与待定细节` | `docs/SOURCES.md`、`docs/pending-details.md`、`policy-sources/` 本次 61 份文件、`apps/web/lib/sources.ts`、`PROGRESS.md` 第 680 项 |
| 681 | `Feat: 添加爱尔兰完整版规则参数` | `packages/policy-data/src/parameters/ireland-2026-11.ts`、`packages/policy-data/src/index.ts`、`PROGRESS.md` 第 681 项 |
| 682 | `Feat: 实现爱尔兰完整版条件评估与边界测试` | `packages/engine/src/ireland-full/`、`packages/engine/src/index.ts`、`packages/engine/test/ireland-full.test.ts`、本报告、`PROGRESS.md` 第 682 项 |

均使用 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

`evaluateIrelandFull` 返回 `CountryResult`，列 ID 为 `ie.current-law-2026-11`。可通过 `pathways` 指定要核对的路径。条件可依据申请渠道、办理进度或例外状态出现，比较时用路径和条件 ID 对齐。评估已有许可时，就业工资门槛只在另行提供基础许可申请资料时出现。费用、批准后的手续及 EU／WA 文书检查单独列出。各路径的 `MET` 表示录入事实满足已核对的门槛，最终入籍、居留及文件签发由主管机关决定。裁量路径需要核对豁免或认定时保留 `UNKNOWN`。

新增 SRC-380–395、397–402、404–409，共 28 个登记号。复用 SRC-091–098。新增 PD-320–339。新增网址进入共用 `sourceUrls`，英国政策页的参考链接清单因此增加这些官方来源。任务 99 可按爱尔兰使用的 SRC 取用。

### 路径及条件

下表省略每个条件 ID 的 `IE-` 前缀。适用分支才返回相关条件，来源定位见下一表。

| 路径 ID | 路径 | 条件 ID |
|---|---|---|
| `IE-NATURALISATION` | 一般入籍 s15 | A01–A12；NAT-CONTINUOUS、NAT-ABSENCES、NAT-PRIOR |
| `IE-SPOUSE` | 爱尔兰公民配偶／民事伴侣 s15A | A01–A14；SPOUSE-MARRIAGE、NAT-CONTINUOUS、NAT-ABSENCES、NAT-PRIOR |
| `IE-MINOR-BORN-IN-STATE` | 境内出生未成年人 s15B | A01–A04、A06–A12、A15–A16 |
| `IE-MINOR-NATURALISED-PARENT` | 已入籍父母 Form 9 | A01–A04、A06–A12、A17 |
| `IE-IRISH-ASSOCIATIONS` | Irish descent／Irish associations | A01–A03、A06–A12、A18–A19 |
| `IE-PROTECTION` | 难民／无国籍申请人 | A01–A03、A06–A12、A20 |
| `IE-PUBLIC-SERVICE` | 本人在境外从事爱尔兰公共服务 | A01–A03、A06–A12、A21 |
| `IE-STAMP4-21` | CSEP、研究员、NCHD 多地点 GEP | B01–B07、B09–B10；多地点 GEP 另核 B08；STAMP4-WORK-TIME |
| `IE-STAMP4-57` | GEP、ICT | B01–B06、B08–B10；STAMP4-WORK-TIME |
| `IE-STAMP4-INDEPENDENT-FAMILY` | 家庭团聚转独立 Stamp 4 或现有家庭许可续期 | 转独立 Stamp 4 使用 B01–B02、B11–B23（适用时）、FAMILY-LEGACY-TIME、FAMILY-INDEPENDENCE、FAMILY-ENTRY-FEE。普通续期使用 B01–B02 和 B21 或 FAMILY-RENEWAL。 |
| `IE-STAMP5` | Without Condition As To Time | B01–B02、B24–B28、WCATT-TIME |
| `IE-STAMP4-IRISH-FAMILY` | 爱尔兰公民伴侣的直接家庭 Stamp 4 | B01–B02、FAMILY-IRISH-SPONSOR。首办另核对 B14–B17、B19–B23（依渠道）、FAMILY-CHANNEL、FAMILY-ENTRY-FEE。普通续期使用 B21 或 FAMILY-RENEWAL。 |
| `IE-LTR-PRINCIPAL` | Long Term Residency 主申请人 | B01–B02、C01–C06、C08–C10 |
| `IE-LTR-FAMILY` | Long Term Residency 家属 | B01–B02、C04–C10 |
| `IE-EU-PERMANENT` | EU Treaty Rights 永久居留 | D01–D08、TREATY-RESTRICTION |
| `IE-WA-PERMANENT` | Withdrawal Agreement 永久居留 | E01–E03、D02、D04 或 D05（适用时）、TREATY-RESTRICTION |

### 条件来源

| 条件 ID（省略 IE-） | 条件 | 官方定位 |
|---|---|---|
| `A01` | 成年与国籍 | SRC-091 ss14, 15(1)(a), 15A(1)(a)；SRC-401 s2 |
| `A02` | 良好品格与如实披露 | SRC-091 ss15(1)(b), 15A(1)(b), 29A；SRC-095 Good Character |
| `A03` | Garda e-vetting 与背景核查 | SRC-382 What is e-Vetting? and eligibility；SRC-380 Form 8 §8 |
| `A04` | 递交时居住与合法身份 | SRC-091 ss15(1)(c), 15A(1)(e)–(f), 15B(1)(c), 15C, 16A；SRC-093 s295；SRC-095 Time That Does Not Count |
| `A05` | 善意继续居住 | SRC-091 ss15(1)(d), 15A(1)(g), 15A(4) |
| `A06` | 效忠声明、守法与民主价值承诺 | SRC-091 ss15(1)(e), 15A(1)(h), 15B(1)(d)；SRC-380 S.I. 569/2011 reg. 9 |
| `A07` | 身份与申请材料 | SRC-091 s17；SRC-095 Citizenship Identity Scorecard、If You Are a Refugee；SRC-380 Forms 8–11；SRC-381 Proof of identity |
| `A08` | 逐年居住证明 | SRC-095 The 150-Point Rule；SRC-381 Proof of residence and Residency Affidavit |
| `A09` | 入籍申请费 | SRC-380 S.I. 569/2011 reg. 13(1)(a) |
| `A10` | 发证费与取得国籍 | SRC-091 s18；SRC-380 S.I. 569/2011 reg. 13(1)(b), (2) |
| `A11` | 其他入籍门槛的适用性 | SRC-091 ss15(1), 15A(1), 15B(1)；SRC-095 Who can apply |
| `A12` | 补件、地址更新及部长决定 | SRC-091 ss15–18；SRC-095 Deadlines for Additional Documents；SRC-381 Change of address form |
| `A13` | 有效关系、同住及配偶声明 | SRC-091 s15A(1)(c)–(d)；SRC-095 Statutory Declaration for Spouses or Civil Partners |
| `A14` | 公共服务外派与特别豁免 | SRC-091 ss15A(2)–(4), 15C(4) |
| `A15` | 在境内出生、未成年及代申请 | SRC-091 ss6–7, 15B(1), (5)；SRC-092 s8 and S.I. 389/2023；SRC-095 Document requirements for minors |
| `A16` | 未成年人品格与声明规则 | SRC-091 s15B(1)–(4)；SRC-380 Form 11 §5 |
| `A17` | 已入籍父母与 Form 9 | SRC-091 s16(1)(c)；SRC-095 Application by a parent with Irish Citizenship |
| `A18` | Irish descent 或 Irish associations | SRC-091 s16(1)(a)–(b), (2)；SRC-400 What Irish associations means |
| `A19` | 关联证据与豁免裁量 | SRC-400 December 2025 guidance Steps 1–4 and Table 1 (p3)；SRC-091 s16(1) |
| `A20` | 保护类别、认可日期与入籍居住政策 | SRC-091 ss16(1)(g), 16A；SRC-381 Changes to citizenship for people granted International Protection；SRC-095 Applicants granted refugee status |
| `A21` | 本人在境外从事爱尔兰公共服务 | SRC-091 ss2(1), 16(1)(f) |
| `B01` | 登记、现行许可及住址 | SRC-383 Immigration Act 2004 ss4–5, 9；SRC-384 Renewing your registration permission；SRC-405 Registration requirements for minors |
| `B02` | 登记费及法定豁免 | SRC-383 Immigration Act s19 and S.I. 421/2025 regs. 1, 3–5 |
| `B03` | 在境内实际受雇与合格许可 | SRC-096 Stamp 4 upgrades: Eligibility criteria；SRC-384 Stamp 4 Registrations and Renewals (1)–(2) |
| `B04` | 起算与在职材料 | SRC-096 Determining the commencement of employment；SRC-384 Stamp 4 Registrations and Renewals (1)–(2) |
| `B05` | 就业升级的合规、品格及审查 | SRC-394 CSEP: What is next?；SRC-383 Immigration Act s4(6)；SRC-096 Online renewal |
| `B06` | 就业升级与续期手续 | SRC-096 Information on Stamp 4 upgrades；SRC-384 Stamp 4 Registrations and Renewals |
| `B07` | 基础 CSEP 的职业、雇主及工资 | SRC-393 Act ss4,18,21,47 and S.I. 643/2025 Schedule 8 Part 1；SRC-394 CSEP: Eligibility and fees |
| `B08` | 基础 GEP 的职业、雇主及工资 | SRC-393 Act ss18,22–23,47–48 and S.I. 643/2025 Schedule 8 Part 3；SRC-394 GEP: Eligibility and Labour Market Needs Test |
| `B09` | 基础 ICT、研究员及医师条件 | SRC-393 Act ss9,22(1)(c),22(2),24,47–48 and S.I. 444/2024 regs. 42–46；SRC-394 ICT: Eligibility；SRC-096 Stamp 4 upgrades: Eligibility criteria |
| `B10` | 基础就业许可签发和续期费用 | SRC-393 Act ss36(2)(a),55 and S.I. 444/2024 reg. 7, Schedule 1；SRC-404 Indexation |
| `B11` | 家属身份和担保资格 | SRC-387 June 2026 §§6.5–6.6, 16 and Appendix C；SRC-096 Joining family FAQ 30 |
| `B12` | 依亲年限、担保人入籍及独立资格 | SRC-387 June 2026 §16.2, footnote 41 and Appendix C；SRC-096 Joining family FAQ 30 |
| `B13` | 分居、死亡或家暴后的居留 | SRC-387 June 2026 §§16.3–17.2；SRC-399 Independent immigration permission |
| `B14` | 团聚入口、担保人及等待期 | SRC-387 June 2026 §§2–6（返爱担保人为 §6.2）；SRC-409 Eligibility；SRC-388 Am I eligible?、Who can sponsor me? |
| `B15` | 合格关系、年龄、照护授权与同住 | SRC-387 June 2026 §§7.2–7.16, 7.21–7.27 |
| `B16` | 担保义务、福利及储蓄 | SRC-387 June 2026 §§9.1–9.7, 10.2–10.6；SRC-386 Introduction |
| `B17` | 担保人税前收入 | SRC-387 June 2026 §§10.7–10.14 and November 2025 §10；SRC-386 Financial thresholds |
| `B18` | C 类家庭子女净收入门槛 | SRC-387 June 2026 §§10.13–10.14 and Appendix D；SRC-386 Table 1 |
| `B19` | 住房适格与居住空间 | SRC-387 June 2026 §9.3–9.5 and Appendix E；SRC-402 s63 |
| `B20` | 团聚材料、安全、医疗与签证办理 | SRC-387 June 2026 §§2–3, 12–15；SRC-409 Join non-EEA family member §9；SRC-406 Visa Fees |
| `B21` | 爱尔兰公民配偶／民事伴侣境内登记与续期 | SRC-388 Irish spouse and civil partner scheme: Am I eligible?；SRC-384 Stamp 4 (3)、在线续期 When should I submit a Renewal Application? |
| `FAMILY-RENEWAL` | 其他现有家庭许可普通续期 | SRC-384 Stamp 1G (1)、Stamp 3 (3)、Stamp 4 (4)、(7)–(8)、(12) 的续期清单及在线续期地点；SRC-388 境内 de facto 的 What happens next? |
| `B22` | 境内 de facto 办理 | SRC-388 De facto: Am I eligible?, Police clearance, What happens next? |
| `B23` | 境外 de facto 办理 | SRC-388 Overseas de facto: How do I apply?, Medical insurance, Police clearance；SRC-387 June 2026 §§7.16, 10.7 |
| `B24` | Stamp 5 合格许可及递交地点 | SRC-097 Eligibility and form p1；SRC-383 Immigration Act s5 |
| `B25` | Stamp 5 品格、刑事程序与合规 | SRC-097 Eligibility and criminal proceedings FAQ |
| `B26` | Stamp 5 公帑负担及就业努力 | SRC-097 Eligibility and conditions of permission |
| `B27` | Stamp 5 居住、材料及获批后出境 | SRC-097 Required documents, conditions of permission and form p1 |
| `B28` | Stamp 5 登记、护照期限与续期 | SRC-097 Introduction；SRC-384 Stamp 5 Registrations and Renewals |
| `C01` | LTR 合格就业许可和登记期间 | SRC-398 Conditions, Eligibility and Which stamps count |
| `C02` | LTR 研究员与医生特殊计时 | SRC-398 Hosting Agreement and medical doctor FAQs; medical doctor guidance |
| `C03` | LTR 主申请人在境内持续受雇 | SRC-398 Eligibility and application form p1 |
| `C04` | LTR 许可合规及居住材料 | SRC-398 Eligibility, required documents and form §§3–6 |
| `C05` | LTR 福利与公帑负担 | SRC-398 FAQ: What does an undue burden on the State mean? |
| `C06` | LTR 品格、案情及披露 | SRC-398 Eligibility and conviction or pending trial FAQs |
| `C07` | LTR 家属身份及同期居住 | SRC-398 Conditions and spouse or dependent FAQ |
| `C08` | LTR 获批后居住和续期 | SRC-398 Conditions of permission and renewal FAQ |
| `C09` | LTR 批准费和付款期限 | SRC-398 What happens if my application is approved?；SRC-383 S.I. 421/2025 regs. 3–4 |
| `C10` | LTR 其他条件适用性 | SRC-398 Eligibility and application checklist；SRC-383 Immigration Act s9 |
| `D01` | 自由流动本人或合格家属 | SRC-390 regs. 2–6；SRC-389 Irish citizens and qualifying family members |
| `D02` | 欧盟居留基础、资源和医疗保险 | SRC-390 regs. 2(3), 6, 11(1) |
| `D03` | 通常取得永久居留的连续期间 | SRC-390 reg. 12(1)–(7) |
| `D04` | 提前取得永久居留 | SRC-390 reg. 13(1)–(7) |
| `D05` | 家庭状态变化后的保留权利 | SRC-390 regs. 9–12；SRC-391 EUTR5 and EUTR3 pp2–3 |
| `D06` | 永久居留证明、地址与通知 | SRC-390 regs. 11(2), 14–15 and Schedules 5–8；SRC-391 EUTR2 and EUTR3 |
| `D07` | 公共政策、安全和公共卫生 | SRC-390 regs. 14(4), 15(4), 18–20 and Schedule 1 |
| `D08` | 永久权维持、续证及收费 | SRC-390 regs. 12(6), 14(8), 15(8)–(9)；SRC-383 S.I. 421/2025 reg. 4(a)(iv)–(v)；SRC-389 Permanent Residence |
| `E01` | Withdrawal Agreement 保护范围 | SRC-392 Agreement Arts. 9–10; S.I. 728/2020 regs. 1–4, 23 |
| `E02` | WA 连续合法居住及永久权 | SRC-392 Agreement Arts. 13,15–17 and S.I. 728/2020 regs. 5–7, 10, 22–23 |
| `E03` | WA 文件、公共审查、费用和续期 | SRC-392 S.I. 728/2020 regs. 11–12, 14–21 and Brexit FAQ；SRC-383 S.I. 421/2025 reg. 4(a)(vi)–(vii) |
| `NAT-CONTINUOUS` | 递交前连续居住和许可 | SRC-091 ss15(1)(c)、15A(1)(e)、16A；SRC-093 s295；SRC-095 Time That Does Not Count |
| `NAT-ABSENCES` | 最后一年的缺席 | SRC-091 s15C；SRC-095 70 Days Absence Rule |
| `NAT-PRIOR` | 回溯期间累计居住 | SRC-091 ss15(1)(c)、15A(1)(f)；SRC-095 居住计算器 |
| `SPOUSE-MARRIAGE` | 婚姻或民事伴侣满年限 | SRC-091 s15A(1)(c) |
| `STAMP4-WORK-TIME` | 就业 Stamp 4 升级时间 | SRC-096 Eligibility criteria；SRC-094 s18(h) 及 Schedule Part 1 |
| `FAMILY-LEGACY-TIME` | 原 Stamp 1G／Stamp 3 家庭团聚时间 | SRC-096 家庭团聚 FAQ 30、Stamp 1G |
| `WCATT-TIME` | Stamp 5 合格许可时间 | SRC-097 Eligibility、申请表 p1 |
| `FAMILY-INDEPENDENCE` | 是否独立于担保人 | SRC-387 June 2026 §16.2 及脚注 41 |
| `FAMILY-IRISH-SPONSOR` | 爱尔兰公民伴侣担保入口 | SRC-388 Am I eligible?；SRC-387 June 2026 §6.2 |
| `FAMILY-CHANNEL` | 当前家庭办理渠道 | SRC-388 Am I eligible?；SRC-387 June 2026 §§5–7 |
| `FAMILY-ENTRY-FEE` | 家庭签证或预审费用 | SRC-406 Visa Fees、Visa fee exemptions；SRC-388 Overseas de facto: Fees |
| `TREATY-RESTRICTION` | 已作出的居留权限制决定 | SRC-390 regs. 18–20；SRC-392 regs. 14–21 |

## 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码为 0。全仓 5,274 项测试通过，既有文案导出用例按 `EXPORT_WORDING` 条件跳过 1 项。构建导出 26 份 HTML 和 `offline-pages.json`，回读爱尔兰页面和英国政策页中的新增官方链接。
- `pnpm --filter web test test/policy-page.test.tsx test/ireland.test.tsx` 通过 17 项。policy-data 的来源一致性测试随全仓门禁通过，现有 126 个网址与基线一致，增加的 28 个网址均与登记表一致。
- `pnpm --filter @uk-immigration/engine lint && pnpm --filter @uk-immigration/engine typecheck && pnpm --filter @uk-immigration/engine test` 复查最终引擎，3,254 项通过，原文案导出用例跳过 1 项。29 项新增测试涵盖 73 个有正反或待确认判定的新增条件，A11 与 C10 覆盖法定适用性说明。获准替代声明方式时，分别核对已完成、愿意、拒绝和未回答。

- 爱尔兰定向测试逐项对照六条现有路径的时间检查文案、来源及状态，并核对新规则的年龄、最后一日、财政、保险、登记和居留边界。
- 原 `packages/engine/src/ireland.ts` 和 `packages/engine/test/ireland.test.ts` 与当前分支基线一致。`apps/web/lib/sources.ts` 只增加爱尔兰网址条目。快照回读按调研 SHA-256 对照，编号和定位与来源登记表一致。

## 3. 没做或没验证的

页面接线由任务 99 完成。当前工作树供 Fable 提交，未运行浏览器 E2E、视觉验收或部署。按 2026-11-23 调研档案评估。早于已收录法规或超出已知年度表的历史和未来金额，仅在有可定位的费率或阈值时输出金额。既有计时口径及 PD-110–119 随相应路径保留。新路径通过模拟日核对，裁量、续期及证据准备通常由领到的书面决定或下一步资料推进。LTR 多段登记先合并重叠和相接的区间，再累计整月。不同月长会改变零头折算结论时按 PD-335 留待确认。EU／WA 的多次短期出境若落在非整月边界，按 PD-337 留待确认。

### 仍可能为 UNKNOWN 的条件

| PD | 主要条件 | 原因 |
|---|---|---|
| PD-320 | A01 | 需确认未满龄婚姻是否获承认以及 full age。 |
| PD-321 | A04、B01、B24、C04 | 过期 IRP 与续期待决需正式延续和有效居留证明。 |
| PD-322 | A07、A08 | 恰过期 365 日的档位、替代／北爱证明及宣誓书需 ISD 确认。 |
| PD-323 | A10、A20、B02 | Stateless／附属保护年限、费用及新保护分类映射。 |
| PD-324 | A03、A06、A16 | 未成年 vetting、声明完成方式及豁免。 |
| PD-325 | A04（Form 9）、A19、A21 | 居住或其他条件的豁免及 Irish associations／公共服务裁量。 |
| PD-326 | STAMP4-WORK-TIME、B03、B04、B06 | 满月核验时点、ICT 文件、雇主变化或记录冲突。 |
| PD-327 | B05 | 不同就业子类品格判断、行政附加条件及专项收费。 |
| PD-328 | B07–B09 | SOC、薪级、条例与网页边界、未收录费率。 |
| PD-329 | B11–B14、B17–B18、FAMILY-INDEPENDENCE | 依亲历史、成年子女、续期政策、关系或担保人变化。 |
| PD-330 | B14–B17、B20–B23 | 专门境内办理与通用政策之间的财务和资格差异，境外 de facto 专页差异。 |
| PD-331 | B16–B18、B22 | 福利与可承担性、储蓄、混合税年和未公布的净收入年度表。 |
| PD-332 | B19 | 公共住房支持及房间布局、同卧规定和补件的个案确认。 |
| PD-333 | B26、C05 | 两个行政方案不同的 undue burden 个案认定。 |
| PD-334 | B27、C08 | 获批后出境跨年、用途和例外。不把获批后的一般上限用于初次申请时间检查。 |
| PD-335 | C01、C02、C04、C07–C09 | 特殊许可、医生及家属身份组合、家属和续期收费、多段登记零头月折算。 |
| PD-336 | D01、D02、D04、D05 | 回流、双重国籍、仅求职、特殊家庭和活动基础。 |
| PD-337 | D02、D03、E02 | 无统一资金或保险金额。跨月合计与例外理由需证据。 |
| PD-338 | D04–D06、E01–E03 | 保留权、证件与实体权利、复杂 WA 关系及跨过渡证据。 |
| PD-339 | A09、A10、B02、B10、FAMILY-ENTRY-FEE、D08、E03 | 历史收费或额外书面收费未能确认。 |

A02、A13、A14、B20、B25、C06、D07 或 E03 也可因缺少个人事实或审查尚未结束而为 `UNKNOWN`。录入缺项时不会为一般问题新增 PD 编号。A11 和 C10 是法律适用性说明，表示相应类别没有独立的语言、考试等门槛。

## 4. 发现与建议

任务 99 按路径呈现问卷，给每项保留「不清楚／暂不回答」。对必要资料可问到下列粒度。

1. **申请人和日期**。问递交日、生日、出生地、国籍及出生、血统或 FBR 权利，当前人在共和国、北爱或岛外、是否免登记及合法依据、现行许可和续期。区分实际居住时段、许可时段、IRP 登记时段、境外服务和出境。同一段时间有不同法律用途，保留原计时所需的许可类型。
2. **入籍**。问继续居住地点与声明意愿、民事关系有效性、配偶公民身份、同址证明及配偶声明、确认的外派时段或豁免；未成年补问代办、出生或既得国籍、列举严重事项和表格分流；Form 9 问父母入籍证书日期。另问保护种类与认定日、在外公共服务任命、关联人的资格日期、四类关联证据。把出生证、身份评分、逐年证明、补件及缴费按阶段展示。
3. **就业及登记**。问实际开始工作日期、目前同组许可、实际受雇、雇主信日期、合同与工资单。只有模拟就业许可新办或续签时问职业／毕业类别、法定计入工资和工时、雇主条件、劳动力测试或豁免、转派期间及费用。另问注册日期、豁免依据、护照有效期和许可持续状态。
4. **家庭**。问关系类型、同居及关系结束、家庭团聚许可及原申请日、担保人类别和入籍日、当时的依亲跨度、下次续期。分开显示获准申请与是否独立于担保人。新团聚或专项转换再问历史担保、按财年税前／净收入、福利或存款，适用时问子女数、住房类别、卧室、体积、同卧和租赁材料。分开境内与境外的警察证明、公私保险、入境或境内转换、预审和费用。涉及家庭暴力只问是否适用及已有许可或认定。
5. **Stamp 5 与 LTR**。问履行许可、目前境内与持续受雇、福利来源、现有申请和批准阶段。LTR 主申问 IRP 上每期许可的基础。家属填两人的同期合法居住区间及主申 LTR；获批后再问年度出境、续期材料与批准信付费。
6. **EU／WA**。问本人和担保人的国籍、活动及相应法定基础，家庭关系和受扶养，工作、自给／学生资金与 CSI、经登记的失业、出境及允许例外。长期缺席、退休／永久失能／跨境工作／在职死亡和权利保留各按相应分支提问。WA 另问过渡截止时点的确证与关系是否延续。分别显示实体资格、现有卡到期、文件和正式限制。
7. **前端接线**。中英文都使用评估返回的条件文案；对比按列、路径、条件 ID 对齐。先区分 `UNKNOWN` 来自未答、个案认定还是未公开的规则细节。出境或就业变动可改同一草稿中的对应日期。品格、健康、家暴和儿童，只收类别、日期和文件状态；无需案情、病情、证件号或任何上传文件。

主要法规和政策入口见 [爱尔兰国籍法编纂版](https://revisedacts.lawreform.ie/eli/1956/act/26/revised/en/html)、[ISD 家庭政策档案](https://www.irishimmigration.ie/coming-to-join-family-in-ireland/policy-document-archive/)、[ISD Long Term Residency](https://www.irishimmigration.ie/my-situation-has-changed-since-i-arrived-in-ireland/long-term-residency/)、[EU 自由流动条例](https://www.irishstatutebook.ie/eli/2015/si/548/made/en/print)及 [Withdrawal Agreement 实施条例](https://www.irishstatutebook.ie/eli/2020/si/728/made/en/print)。

## 审核修正（review89-1）

### 1. 做了什么

PROGRESS 683 建议提交为 `Fix: 修正爱尔兰完整版资格与续期判定（review89-1）`。

| 检查 | 修正与回归 |
|---|---|
| B11／B12 | 普通五年分支按已确认的依亲居留期间核对。审核的 Stamp 1G 输入在模拟日为 `FUTURE`，最早日为 `2027-04-01`。同期依亲 Stamp 4 到续期日时为 `MET`。符合年限但续期日未确认时为 `UNKNOWN`（PD-329）。SRC-387 §16.2、脚注 41 和附录 C。 |
| B14／B21 | 普通境外团聚接受拟共同迁回的爱尔兰公民担保。配偶 Stamp 4 登记区分首次和续期，普通续期按续期清单核对，许可附加保险条款按个案材料判定。SRC-387 §6.2、SRC-384 Stamp 4 (3)。 |
| B09／B10／B20 | 新 ICT 许可核对关联实体的 EEA、瑞士及英国籍雇员比例和法定豁免。CSEP 续期费用不适用。B10 定位到 SRC-393 Act s36(2)(a)、S.I. 444/2024 reg. 7、Schedule 1，B20 补上 SRC-387 §12。 |
| D03／D06 | 初期可计居留从实际入境日起算。记录完整的合规短期离境可保持两段活动之间的连续性。EU 公民本人申请文件时无须填写非欧盟家属通知项。SRC-390 regs. 6(1)、11(2)、12(5)。 |
| D08／E02 | 以 `absences` 核对已取得权利后的连续离境，兼容现有的 `document.postGrantAbsence`。审核的离境在 EU 下导致失权，在 WA 下仍保留。新增 EU 回国后重新满五年的回归。SRC-390 reg. 12(6)、SRC-392 reg. 10(4)。 |
| A07／A20 | 可分别确认无法取得本国护照、经认证的爱尔兰旅行证件、难民认定信和见证后的护照宣誓书。三项文件组合齐备时 A07 为 `MET`，A20 继续独立核对居住。SRC-095 If You Are a Refugee。 |
| C01／C07 | 多段登记去重后累计整月，零头折算方式会改变是否达标时返回 `UNKNOWN`。在 PD-335 登记不同月长及闰日问题。SRC-398 重叠登记示例。 |

### 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码为 0。engine 3,266 项通过、文案导出 1 项按默认配置跳过，policy-data 23 项、game 1,336 项、web 659 项、error-report 2 项通过。Next.js 生成了 27 个静态页面。
- 爱尔兰完整版新增 12 项回归，合计 41 项。断言覆盖检查项、路径状态及最早日期，并保留六条 `evaluateIreland` 旧计时路径的逐项对照。
- `git diff --check` 通过。旧 `evaluateIreland` 的实现、测试与页面入口无改动。

### 3. 没做或没验证的

提交交由 Fable。页面接线、浏览器 E2E 和部署沿用后续任务安排。

### 4. 发现与建议

任务 99 接线时应明确采集依亲居留区间、满足资格后的下次线上续期日、首次登记或续期阶段，以及难民身份材料的分别确认。ICT 问卷中的雇员比例覆盖 EEA、瑞士和英国籍雇员。普通居留和永久权维持可共用同一份出入境记录。

## 第二轮审核修正（review89-2）

### 1. 做了什么

PROGRESS 684 对应建议提交 `Fix: 修正爱尔兰家庭续期、担保资格与条约居留计时（review89-2）`。

- 普通续期按现行许可的清单核对材料及批准信附加条件，并要求在线递交时身处爱尔兰共和国。爱尔兰公民的配偶／民事伴侣用 `B21`，其他家庭许可用 `FAMILY-RENEWAL`。符合清单的配偶在 `2026-11-23` 为 `MET`，最早日为当天。短期出境为 `NOT_MET`，地点缺失为 `UNKNOWN`，后两者均无最早日。见 SRC-384 Stamp 4 (3)、(7)–(8)、在线续期 When should I submit a Renewal Application? 及 SRC-388 境内 de facto 的 What happens next?。
- `B14` 统一接受已在境内合法居住的担保人，或拟与申请人一起迁回爱尔兰的爱尔兰公民。审核的境外 de facto 输入同时得到 `B14=MET`、`B23=MET`，路径可在模拟日递交。见 SRC-387 June 2026 §6.2 及 SRC-388 境外 de facto 的 Who can sponsor me?。
- EU 和 WA 家属的累计期按核实的家庭居留依据计算。审核用例的普通 GEP 期间不计，开始以 EU 公民配偶身份合规居留后的第五个周年日 `2030-06-01` 得到 `D03=MET`、`D08=MET`。WA 过渡前后合规家属居留可以相接。见 SRC-390 regs. 12(1)(b)、12(4)–(6) 及 SRC-392 S.I. 728/2020 reg. 10(2)–(4)、Agreement Art. 15。
- WA 长期离境失去永久权后，在符合累计期的情况下，返爱后的 WA 适用范围未重新确认时 `E01`、`E02` 为 `UNKNOWN`（PD-338）。明确仅凭 CTA 返爱时为 `NOT_MET`。见 SRC-392 S.I. 728/2020 reg. 10(4) 及 Agreement Arts. 10、11、15(3)。

#### 渠道及路径排查清单

| 渠道或路径 | 核对结果 | 回归覆盖 |
|---|---|---|
| `ordinary` | 首办 `B14` 接受拟返爱的爱尔兰公民。已持许可时按适用续期清单走 `B21` 或 `FAMILY-RENEWAL`。 | 境外配偶担保、家庭 Stamp 4 续期、依亲 Stamp 1G 续期。 |
| `spouse-registration`、`spouse-in-state` | 首办核各渠道入口和材料。续期按 SRC-384 Stamp 4 (3) 核对共同住址、关系证明、护照、IRP 及适用的许可附加条件。 | 两渠道的拟返爱担保，以及普通续期、首办保险、续期附加保险、材料缺失及境外递交。 |
| `de-facto-in-state`、`de-facto-overseas` | 首办核各渠道的同住、警方证明、保险及适用的境外递交流程。普通续期按 Stamp 4 (7) 核对。 | 两渠道的拟返爱担保及普通续期，涵盖境外渠道 `B23`、续期地点和最早日。 |
| `IE-STAMP4-INDEPENDENT-FAMILY` | `registrationStage: 'renewal'` 评估当前许可续期。依亲转独立 Stamp 4 通过 `nextRenewalOn` 评估 `B11/B12`。关系变化按 `B13`，续期时成年按 PD-329。 | 依亲 Stamp 1G 普通续期、依亲 Stamp 4 转独立、担保人入籍、推演至成年后的升级申请。 |
| `IE-EU-PERMANENT`、`IE-WA-PERMANENT` | 家属合规段用 `family`，权利保留决定后的合规段用 `retained-family`。本人按其合规活动累计，提前取得按对应事件核对，已取得后的失权及重新累计按各自规则核对。 | EU 婚前 GEP、五年分界、保留权利后的居留，以及 WA 跨过渡和失权后仅凭 CTA 返爱。已有回归涵盖本人计时、出境及证件检查。 |
| `IE-LTR-FAMILY` | 通过 `C07/C08` 核对 LTR 家属同期居住、续期与维持，使用 SRC-398 的专门流程。 | 现有 LTR 家属回归。 |

### 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。engine 3,279 项通过、文案导出 1 项按默认配置跳过，policy-data 23 项、game 1,336 项、web 659 项、error-report 2 项通过。Next.js 生成 27 个静态页面。
- 第二轮新增 13 项 engine 回归，爱尔兰完整版共 54 项。三个审核复现均断言检查项、路径状态和最早日期，续期样例以官方续期清单单独构造。
- `git diff --check` 通过。旧 `evaluateIreland` 的六条时间路径仍逐项比对，原评估实现、参数和页面入口保留。

### 3. 没做或没验证的

提交交由 Fable。页面接线、浏览器 E2E 和部署属于后续任务。

### 4. 发现与建议

任务 99 接线时，按当前许可问续期材料，按日收集 EU／WA 家属合规居留依据。WA 失权后应单独采集 `wa.postLossScopeConfirmed`。在展示升级路径时将 `FAMILY-LEGACY-TIME` 标为旧计时参考。

## 第三轮审核修正（review89-3）

### 1. 做了什么

PROGRESS 685 对应建议提交 `Fix: 修正爱尔兰续期窗口、入籍居住与首次登记（review89-3）`。

| 路径或阶段 | 修正与回归 |
|---|---|
| 家庭、Stamp 1／1G／4 普通续期和就业 Stamp 4 升级 | `IRP-RENEWAL-WINDOW` 按当前 IRP 到期前 12 周开放，须在爱尔兰共和国递交。到期日为 `2027-08-01` 时，材料齐备的审核用例在 `2027-05-08` 为 `FUTURE`，最早是 `2027-05-09`，开放当天为 `MET`。升级另外核对达到就业或依亲资格的日期。到期日无法确认或旧卡已过期时按 PD-321 给 `UNKNOWN`。SRC-384 在线续期 Introduction、When should I submit a Renewal Application? 和 SRC-096 Online Renewal。 |
| Stamp 5、LTR 主申及家属、EU／WA 卡 | Stamp 5 换护照续办、LTR 续期及明确选择的 EU／WA IRP 续期共用线上窗口。首次申领、EUTR2／EUTR3 的永久居留申请及实体权利依各自流程。LTR 需要另行审批的日期见 PD-335，条约卡的个案所需文件见 PD-338。SRC-384 对应的 Renewals 清单、SRC-398 How do I renew my Long Term Residency permission?、SRC-390 regs. 12–15 与 SRC-392 S.I. 728/2020 regs. 10–12。 |
| 入籍 | 普通及配偶使用原连续居住计时，配偶保留外派计入及逐项豁免。境内出生未成年人继续独立核最后一年及此前累计期。Form 9、Irish associations 及境外公共服务在 A04 检查最后一年或适用的正式豁免（PD-325）。难民 A20 独立检查认定后的最后一年和此前累计期。审核用例超过一般缺席范围，缺少连续居住豁免时为 `NOT_MET`，最早日期为空。正式豁免覆盖最后一年且此前累计满足时为 `MET`，最早为模拟日。豁免待决时为 `UNKNOWN`（PD-323）。SRC-091 ss15–16A、SRC-095 难民专项与 SRC-381 保护身份政策。 |
| 家庭及受雇人员首次登记 | 已持 Join Family D 签或相应边境准许的爱尔兰公民配偶，B21 按双方护照、关系、共同住址、保险及适用的批准信核对。材料齐全即得到 `MET` 与模拟日。其他获准家庭入境的伴侣和家属按对应 Stamp 首次清单核对，包括持 D 签或预审批准的境外 de facto。受雇者获准入境后可以选对应 Stamp 首次登记清单。SRC-384 Stamp 1、Stamp 1G (1)、Stamp 3 (3)、Stamp 4 (3)、(7)–(8)、(12)，SRC-388 入境后的登记，SRC-409 Type of immigration permission。 |
| 境内 de facto | B14、B22 均核对双方已在爱尔兰合法居住和申请人的境内渠道。拟返爱担保人资格继续适用于境外团聚。审核的境外双方输入返回 `NOT_MET`，最早日期为空。SRC-388 境内 Am I eligible? 和境外 Who can sponsor me?，SRC-387 §6.2。 |

### 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。engine 3,293 项通过，文案导出 1 项按默认配置跳过；policy-data 23 项、game 1,336 项、web 659 项、error-report 2 项通过。Next.js 生成 27 个静态页面。
- 回归覆盖续期开放前一天和当天、窗口与升级资格的先后、获准入境后的首次登记、境内 de facto 担保人身份、最后一年居住不足及正式豁免范围。回归断言路径状态和最早日期。
- `git diff --check` 通过。旧 `evaluateIreland` 六条计时路径的对照通过，并检查了现有计时实现、测试和爱尔兰页面入口的 Git 差异。

### 3. 没做或没验证的

本轮交付工作树改动，提交交由 Fable。爱尔兰页面仍通过旧时间入口评估。浏览器 E2E、页面接线与部署待后续任务。

### 4. 发现与建议

- 未成年家属可能在预计的独立 Stamp 4 升级日前成年。模拟到续期日后可能从 `FUTURE` 变为 `UNKNOWN`，沿用 PD-329 和现有边界回归。
- 英国政策页遍历共用来源表，仍会列出本任务的 28 个爱尔兰来源。页面任务接线时核对国家来源范围。
- 页面问卷可采集当前 IRP 卡面到期日、申请人是否已获准入境和正在办理的阶段。难民居住按实际区间、出入境记录、认定日和正式决定所载的豁免项目采集。

## 第四轮审核修正（review89-4）

### 1. 做了什么

PROGRESS 686 对应建议提交 `Fix: 修正爱尔兰续期条件汇总与入籍旅行区间（review89-4）`。

- 16 条路径经同一汇总函数给出结论。适用条件存在 `NOT_MET` 时路径不合格。没有明确失败但存在适用条件待确认时给 `UNKNOWN`。两种情况均不给递交日。其余适用条件都满足且存在已知等待期时给 `FUTURE`，日期取满足计时与开放窗口的较晚一天。费用提示、获批后的程序、被当前分支取代的条件及独立显示的诊断仍各按自己的用途展示。
- LTR 续期的 C08 纳入汇总。主申请人须确认上一许可期在爱尔兰居住和工作的证明。家属仍按适用的居住材料核对。完整材料可按 IRP 开放日递交，材料缺项或待确认时不给日期。旧状态与专门审批仍见 PD-321、PD-335。来源为 SRC-398 的 “How do I renew my Long Term Residency permission?” 及 SRC-384 在线续期段落。
- EU／WA 永久权及证件的评估继续支持实体权利。明确选择续卡时，D06／E03 成为申请条件，开放窗口单独核对卡片到期日。缺身份或居住材料为 `NOT_MET`，资料待确认时为 `UNKNOWN`。来源为 SRC-384 的 Stamp 4EUFAM 和 Withdrawal Agreement Beneficiary 两项 Renewals 清单，见 PD-338。
- 入籍按实际居住、许可有效期和旅行记录共同核对。旅行解释实际居住记录的缺口，两侧属可计居住且许可连续时，最后一年连续性与累计结果和合并录入一致。按 SRC-091 s15C 与 SRC-095 “70 Days Absence Rule” 计算离境整日，严格累计口径仍扣除相应离境天数。没有连续许可佐证时按 PD-323 留待确认。一般及配偶入籍继续按原许可计时，境内出生未成年人、Form 9、Irish associations、难民与境外公共服务使用同一套旅行缺口处理。

### 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。engine 3,308 项通过，文案导出 1 项默认跳过。game 1,336 项、web 659 项、policy-data 23 项、error-report 2 项通过。Next.js 生成 27 个静态页面。
- 用 16 条路径的合格资料分别把一个适用条件改为不满足与未填，逐项断言检查项、路径状态和最早日期。LTR、EU 和 WA 另核窗口开放前一天和当天。
- 比对七条入籍路径将同一行程合并或拆段的完整输出。难民及境内出生未成年人另核累计期旅行边界，并核对无连续许可佐证的缺口。
- 旧爱尔兰计时测试与六条旧计时对照随全仓测试通过。`git diff --check` 通过。

### 3. 没做或没验证的

工作树交 Fable 提交。未做页面接线、浏览器 E2E 或部署。旧 `evaluateIreland` 继续使用相同的许可有效期与计时逻辑。

### 4. 发现与建议

- **交接页面任务 99**。预测日的材料可能已经过期。GEP 升级用例在 `2026-11-23` 以当天签发的雇主信评估，B04 为 `MET`，路径为 `FUTURE`，最早为 `2027-05-09`。推进模拟日到该日并沿用旧信，B04 和路径转为 `NOT_MET`，最早日为空。依据 SRC-384 Stamp 4 (1)–(2) 的雇主信清单及引擎 B04。页面显示预测日时，提示查看材料有效期、有需要就在到期前更新，并在递交前用更新的材料和实际日期重算。未成年家属在预计续期前成年时也需重算，见 PD-329。

## 第五轮审核修正（review89-5）

### 1. 做了什么

PROGRESS 687 对应建议提交 `Fix: 修正爱尔兰续期条件与免登记旅行佐证（review89-5）`。

| 路径或阶段 | 修正和来源 |
|---|---|
| LTR 主申请人和家属 | C01–C03 的首次申领检查按阶段适用。主申请人续期用 C04 核现有 LTR，用 C08 核上一许可期居住及工作证明。家属 C07 核当前依亲关系与主申请人的许可，C08 核上一许可期居住证明。已申报的福利、品格及许可合规问题仍按适用规则评估。续期窗口和材料适用疑问见 SRC-398 的续期、依亲、品格和福利 FAQ，SRC-384 在线续期及 PD-321、PD-333–335。 |
| 就业和家庭许可 | 核对普通续期的入口和现有回归。就业许可续期走 IRP 清单，家庭许可续期走 B21 或 FAMILY-RENEWAL。就业和依亲转 Stamp 4 仍检查达到升级资格的日期。见 SRC-096 升级条件、SRC-384 Stamp 1、1G、3、4 续期清单和 SRC-387 Appendix C。 |
| Stamp 5、EU／WA 卡 | Stamp 5 的 IRP 续期以 B28 核对现有 Stamp 5 的续期清单，首办居留累计和银行记录仅用于申领。EU／WA 续卡按 D06／E03 核对现有证件材料，首次取得永久权的条件仍可单列；遇到已知失权、待审事项或正式限制时继续检查。见 SRC-097 的 Stamp 5 条件及续期 FAQ、SRC-384 的 Stamp 5／Stamp 4EUFam／WA 续期清单、SRC-390 regs. 12–15 及 SRC-392 S.I. 728/2020 regs. 10–12。 |
| 入籍旅行 | `citizenship.unregisteredResidenceEvidence` 收集经核实的无 IRP 可计合法居留起止日。按出入境两侧的居住记录和覆盖整趟旅行的法律依据核对连续性，缺席仍按出境整日计算。无连续佐证时合并或拆段均可报告 `UNKNOWN`。来源为 SRC-091 ss15B–15C、SRC-095 70 Days Absence Rule 和 SRC-405 未成年人登记及旅行说明。其他可接受的证明由 ISD 核对，见 PD-323。 |

### 2. 怎么验证的

- `pnpm lint && pnpm typecheck && VITEST_MAX_WORKERS=2 pnpm test && pnpm build` 退出码 0。默认并发下英国随机用例 seed `1455489211` 超过 5 秒限制，限并发重跑通过。engine 3,314 项通过、文案导出 1 项默认跳过，game 1,336 项、web 659 项、policy-data 23 项、error-report 2 项通过。Next.js 生成 27 个静态页面。
- `pnpm --filter @uk-immigration/engine exec vitest run test/ireland-full.test.ts test/ireland.test.ts` 通过，144 项。只提供现有 LTR 和上一许可期证明时，主申请人及提供当前依亲资料的家属在模拟日为 `MET`，最早日为当天。欠缺现有许可、上一许可期材料或特殊审批资料时不给递交日。
- 无 IRP 儿童同一行程的合并／拆段结果逐字段比对。整趟有佐证时，A04 和路径为 `MET`，最早日为模拟日。只证明行程内部日期或缺少佐证时，两种录法均为 `UNKNOWN`，无递交日。另核 Stamp 5、EU／WA 续卡的最简材料、正式限制和失权情况。
- `git diff --check` 通过。六条旧 `evaluateIreland` 时间路径的状态、文案和来源对照通过。

### 3. 没做或没验证的

改动留在工作树，由 Fable 提交。浏览器 E2E、页面接线和部署属后续任务。

### 4. 发现与建议

任务 99 在预测递交日旁显示相关材料有效期。若材料在预测日前失效，提示更新材料，并用实际递交日及更新后的资料重算。无 IRP 的入籍问卷应允许填写经核实的合法居留区间，说明所填区间须覆盖出境日、境外行程和返爱日。

## 第六轮审核修正（review89-6）

### 1. 做了什么

PROGRESS 688 对应建议提交 `Fix: 核对爱尔兰续期证件类别及境内转换返爱日（review89-6）`。

| 路径 | 判定与来源 |
|---|---|
| EU／WA 永久证件续期 | `eu.document.currentCardCategory` 和 `wa.document.currentCardCategory` 确认现卡类别。D06／E03 对普通卡和明确无效的许可给 `NOT_MET`，类别待确认为 `UNKNOWN`，均无递交日。有效永久证件可按续期清单办理，卡面到期日进入续期窗口，已知失权及正式限制仍核对。见 SRC-390 regs. 8、12(6)、15(1)–(3)、15(8)–(9)，SRC-392 S.I. 728/2020 regs. 10–12，SRC-384 对应续期清单及 PD-321、PD-338。 |
| Stamp 5 与 LTR 续期 | Stamp 5 的 B28 核当前许可记录确有 Stamp 5，明确无效的许可即使卡面仍在窗口内也无法通过。LTR 的 C04 核申请人当前主申请人或家属 LTR 许可，C08 核上一许可期证明，两条 LTR 路径均核对已知的 IRP 失效。到期后续期待决且正式延续待证时按 PD-321 处理。见 SRC-097 的许可撤销段落及续期 FAQ、SRC-384 Stamp 5 续期清单、SRC-398 的 LTR 续期及家属 FAQ，另见 PD-335。 |
| 普通就业与家庭续期 | 普通就业续期用当前许可中的 Stamp 1、毕业生 Stamp 1G 或 Stamp 4 核适用清单。家庭续期用 `family.establishedFamilyPermission` 核对申请人当前是否持有对应的家庭许可。两者通过 B01 核对许可有效性。见 SRC-384 适用 Stamp 的 Renewals 清单、PD-321 和 PD-329。 |
| 境内配偶及 de facto 转换 | B14、B21／B22 核递交时人在爱尔兰共和国。合格输入在境内为 `MET`，短期出境且有返爱日为 `FUTURE`，最早为返爱日。境外但返爱日不明时为 `UNKNOWN`，不给递交日。境内 de facto 的警察证明按拟递交日核有效期。见 SRC-388 两条境内路径的 Am I eligible?、Police clearance，另见 PD-330。 |

### 2. 怎么验证的

- 新增六组回归在 `2ab5d9d` 的实现上均复现问题。覆盖普通卡、永久卡、类别未知及许可无效，Stamp 5 被撤销或类别不符，以及同一份有效 Stamp 1 在爱尔兰境内、短期出境且返爱日已知、返爱日未知及实际返爱后的状态和最早日期。LTR 主申请人及家属、普通家庭续期也核对缺失或不适用的许可。
- `pnpm --filter @uk-immigration/engine exec vitest run test/ireland-full.test.ts test/ireland.test.ts` 通过 150 项，包含六条旧 `evaluateIreland` 时间路径对照。
- `pnpm lint && pnpm typecheck && VITEST_MAX_WORKERS=2 pnpm test && pnpm build` 退出码 0。默认并发下英国随机测试 seed `1455489211` 超过 5 秒限制，限并发重跑通过。engine 3,320 项通过、文案导出 1 项默认跳过，game 1,336 项、web 659 项、policy-data 23 项、error-report 2 项通过。Next.js 生成 27 个静态页面。
- `git diff --check` 通过。

### 3. 没做或没验证的

改动留在工作树，由 Fable 提交。页面接线、浏览器 E2E 和部署属于后续任务。

### 4. 发现与建议

**交接页面任务 99**。第六轮审核中，CSEP 申请人自 `2025-05-20` 受雇，许可区间未填结束日，IRP 于 `2027-01-31` 到期。就业升级预测的最早递交日为 `2027-02-20`。推进模拟日并沿用旧卡后，续期窗口和路径成为 `UNKNOWN`。当预测日跨过 IRP 到期日时，页面应在日期旁显示这一前提，提示届时需要有效许可或正式延续证明，再用更新的许可和实际递交日重算。见 SRC-096 的 Stamp 4 升级、SRC-384 的线上续期窗口及 PD-321。

## 第七轮审核修正（review89-7）

### 1. 做了什么

PROGRESS 689 对应建议提交 `Fix: 统一爱尔兰续期许可时间线并核对返爱资格（review89-7）`。

| 路径 | 判定与来源 |
|---|---|
| 各续期路径 | 统一调用既有许可时间线。省略的旧许可结束日按后一段开始的前一日推断，再筛选模拟日有效的境内许可。普通就业与 Stamp 5 共用该结果核对现有 Stamp；续期窗口也使用同一结果，在缺少卡面日期时沿用单一当前许可结束日的回退规则。EU／WA 永久证件仍由现卡到期日确定窗口。见 SRC-384 对应 Stamp 的 Renewals 清单、线上续期 When should I submit a Renewal Application? 及 PD-321、PD-338。许可区间推断沿用输入约定。 |
| 境内配偶／民事伴侣及 de facto 转换 | 返爱日在当前许可与已填 IRP 的覆盖期内时，可沿用已确认的转换资格。许可或 IRP 在返爱前到期时，B14、B21／B22 核对返爱当天是否有有效入境及境内转换依据。缺证则为 `UNKNOWN`，无最早递交日；确认适用依据后，可在其余条件满足时以返爱日为最早递交日。见 SRC-388 两条境内路径的 Am I eligible?，SRC-384 登记 FAQ 的 Travel and Re-Entry Visas 及 PD-330。 |
| 预测递交日超过到期日 | 完整版结果的双语 `summary` 显示本次计算使用的到期日，说明届时须持有有效许可或正式延续证明。见 SRC-096 Stamp 4 upgrades 的 Eligibility criteria、SRC-384 线上续期及 PD-321。 |

### 2. 怎么验证的

- 在 `8e24193` 的实现上复现就业、Stamp 5 续期，配偶及 de facto 返爱预测，以及跨 IRP 到期缺少结果说明，共五项回归。
- 续期对照省略或填写旧许可结束日的完整结果，同时覆盖有卡面日期及回退到许可结束日。返爱用例覆盖许可和 IRP 分别到期、被后段替换、到期当日返爱、可确认的返爱依据及其日期不匹配。CSEP 用例覆盖跨到期日时的中英文说明和到期当天的边界。
- `pnpm lint && pnpm typecheck && VITEST_MAX_WORKERS=2 pnpm test && pnpm build` 退出码 0。engine 3,323 项通过、文案导出 1 项默认跳过，game 1,336 项、web 659 项、policy-data 23 项、error-report 2 项通过。Next.js 生成 27 个静态页面。
- `git diff --check` 通过。原 `evaluateIreland` 源文件与 `8e24193` 一致，六条旧时间路径的结果对照通过。

### 3. 没做或没验证的

改动留在工作树，由 Fable 提交。任务 99 的页面接线、浏览器 E2E 和部署留待后续。

### 4. 发现与建议

**交接页面任务 99**。显示完整版 `summary` 中跨到期日的说明，提醒用户用届时持有的许可或正式延续证明更新资料并按实际递交日重算。境内转换问卷采集可核对的返爱日，以及必要时按该日期确认的入境及转换依据 `family.application.entryOrConversionOnReturn`。该字段的日期须对应本次行程。共用来源表在英国政策页的展示见任务 89 总结。

## 第八轮审核修正（review89-8）

### 1. 做了什么

PROGRESS 690 对应建议提交 `Fix: 修正爱尔兰免登记入籍计时、境内配偶入口及返爱日重算（review89-8）`。

| 路径 | 判定与来源 |
|---|---|
| 免登记入籍居住 | 一般及配偶入籍将 `unregisteredResidenceEvidence` 覆盖的已核实居住日期用于 `NAT-CONTINUOUS` 和 `NAT-PRIOR`，同时按原口径计算 `NAT-ABSENCES`。有实际居住记录时对照其范围。居住已申报但合法可计范围缺证时，按 PD-323 给 `UNKNOWN`。其他入籍分支也可用该证明建立居住时间线。逐年证明评分 A08 独立核对。见 SRC-091 ss15(1)(c)、15A(1)(e)–(f)、15C 及 SRC-095 Guide 的 Reckonable Residence for Citizens of an EEA country, Switzerland or the UK。 |
| 境内配偶／民事伴侣 | B14／B21 按选定入口核对资格和材料。持有效许可的入口核对财力及共同住址证明。配偶事务组以 B17 核对过去三年合计 €40,000 的收入，排除国家福利，以 B16 核对个案过度负担。入口或个案条件未确认时按 PD-330 处理。普通境外团聚继续按政策版本核对收入及适用住房要求。见 SRC-388 Am I eligible? 的两个小节、SRC-384 首次登记清单及 SRC-387 June 2026 §§5.5、9–10。 |
| 配偶及 de facto 返爱日 | 返爱前预测和实际返爱当天重算均读取本次行程日期对应的 `entryOrConversionOnReturn`。确认有效的输入可从 `FUTURE` 转为 `MET`，明确无效的输入为 `NOT_MET`，日期不符且无其他已确认依据时为 `UNKNOWN`。见 SRC-388 两条境内路径的 Am I eligible?、SRC-384 登记 FAQ 的 Travel and Re-Entry Visas 及 PD-330。 |

### 2. 怎么验证的

- `VITEST_MAX_WORKERS=2 pnpm --filter @uk-immigration/engine exec vitest run test/ireland-full.test.ts test/ireland.test.ts` 通过 161 项。覆盖无 Stamp 的七条入籍分支、居住佐证截止日、境内配偶两种入口与普通境外团聚的对照、两条境内伴侣路径返爱前及当天的状态和日期，以及旧计时引擎的回归。
- 从 `ed7f009` 读取旧 `evaluateIreland`，对六组居住时间线、五个 Stamp 选项及中英文逐项比对。60 个输入的完整结果一致。
- 设置 `VITEST_MAX_WORKERS=2` 后运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码为 0。engine 3,331 项通过、文案导出 1 项默认跳过。game 1,336 项、web 659 项、policy-data 23 项、error-report 2 项通过。Next.js 生成 27 个静态页面。
- `git diff --check` 通过。

### 3. 没做或没验证的

改动留在 `fable/89-ie-rules` 工作树，供 Fable 提交。任务 99 的页面接线、浏览器 E2E 和部署留待后续。

### 4. 发现与建议

任务 99 采集已核实的免登记合法居住起止日，并区分两种境内配偶入口。短期 C 签、申请庇护或登记被拒等情况可用 `family.application.spouseInStateEntry: 'spouse-unit'` 明确选择入口。`grossTaxYears` 在该入口填写剔除国家福利后的收入，`spouseUnitUndueBurdenCleared` 用于已确认的个案负担条件。申请人返爱当天重算时保留对应本次行程的日期证据。参见 PD-323、PD-330。
