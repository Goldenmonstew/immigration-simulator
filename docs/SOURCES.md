# 来源登记表（Sources Register）

每周一 06:00 UTC 自动核对来源，结果见 GitHub Actions 的 **Check sources** 工作流日志，也可手动运行该工作流。
若运行失败，人工核对日志中的 changed / fetch failed 来源，并按 [docs/versioning.md §2–§3](versioning.md#2-触发与发现) 确认变更、登记新来源或新快照。

> 规则引擎里每条规则都必须引用本表中的一个 `SRC-` 编号 + 页码/段落。
> 状态：`archived` = 快照已入 `policy-sources/`；`todo` = 只有 URL 或线索，待抓取与登记；`verify` = 只有二手来源，待对照原文。
> 权威等级：LAW（Immigration Rules / Statement of Changes / legislation）> GUIDANCE（Home Office 指引）> POLICY（命令文件、咨询回应）> PARLIAMENT（Hansard）> SECONDARY（律所、媒体，只能用于交叉验证）。
>
> 定位约定（任务 0.3，2026-11-04）：
> - PDF 的 `p<N>` 一律指 **PDF 物理页序**（封面为 p1，与 `pdftotext -f N -l N` 一致），不是页脚印刷页码；各文件的换算关系写在下方"登记备注"。
> - Immigration Rules 用段落号（如 `SW 24.3`）；gov.uk 无编号的 guidance 用小节标题及其 HTML 锚点；Hansard 用卷号 + 栏号（col）+ contribution 锚点。
> - 快照文件名 `YYYY-MM-DD-<slug>.<ext>`：日期取文件的发布日或版本日（Rules 各 Appendix 取 gov.uk `public_updated_at`）；无固定版本日的动态页面取抓取日。
> - Rules 各 Appendix 的"版本日"取该页 gov.uk 变更记录的最近一条（同时记录对应 Statement of Changes 编号）；页面头部的 "Updated" 日期是整个 Immigration Rules 手册的更新日，不代表该 Appendix 本身有改动。

## 一级来源

| ID | 等级 | 标题 | URL | 发布日 | 抓取日 | 本地快照 | 状态 |
|---|---|---|---|---|---|---|---|
| SRC-001 | POLICY | A Fairer Pathway to Settlement: Government Response to the Consultation (CP 1707, 62 页) | https://assets.publishing.service.gov.uk/media/6ae90b0e5b14ba0182a272a4/A_Fairer_Pathway_to_Settlement_-_Government_response_to_the_consultation.pdf | PDF 2026-11-02；HTML 2026-11-12 | PDF 2026-11-04；HTML／集合页 2026-11-15 | `policy-sources/2026-11-02-cp1707-a-fairer-pathway-to-settlement-government-response.pdf`（sha256 `f2ce80103dd331cce70a1e2043ba58d4f791b9650ce1a3ed17a219f7d5f3253c`）；`policy-sources/2026-11-12-cp1707-government-response-accessible.html`（sha256 `157ab17a4bd56aafd66af6d8a68c85363f457f9cd2dfd677c8bdf3b249e76e7b`）；`policy-sources/2026-11-12-earned-settlement-consultation.html`（sha256 `7734758c3fe3229b1755b058fa4f6e5cb8bbe87d1a8f025adf53f05d53ab594b`） | archived |
| SRC-002 | PARLIAMENT | HC Deb 2 November 2026 vol 792 cols 583 起，"Immigration: Earned Settlement"（内政大臣口头陈述及问答）；时间表句在 col 593 | https://hansard.parliament.uk/Commons/2026-11-02/debates/09F388D2-539E-4B0A-ABE2-D3195B14AF0E/ImmigrationEarnedSettlement | 2026-11-02 | 2026-11-04 | `policy-sources/2026-11-02-hansard-commons-immigration-earned-settlement.json`（sha256 `01a9899bc8013613a240080450710f87b9451187794d77f62ba34bc3fcb18d23`） | archived |
| SRC-003 | PARLIAMENT | HL Deb 2 November 2026 vol 860 cols 1415 起，"Immigration: Earned Settlement"（Lord Collins of Highbury 复述陈述及问答）；时间表句在 cols 1423–1424 | https://hansard.parliament.uk/Lords/2026-11-02/debates/5D3D04DB-0971-4B22-B841-6414AAFAA8C9/ImmigrationEarnedSettlement | 2026-11-02 | 2026-11-04 | `policy-sources/2026-11-02-hansard-lords-immigration-earned-settlement.json`（sha256 `c517d2c8fd6530262cbaf7d02d3d78694aeb7bc8ec4a9a51df3431d149f016e0`） | archived |
| SRC-004 | LAW | Immigration Rules: Appendix Skilled Worker（版本 2026-10-08，HC 584；£41,700 + going rate 见 SW 4.2 Option A、SW 8.1；settlement 见 SW 21.1–SW 24.4；dependent partner / child settlement 见 SW 37.1–SW 46.2） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-worker | 2026-10-08 | 2026-11-04 | `policy-sources/2026-10-08-immigration-rules-appendix-skilled-worker.html`（sha256 `93459890183de25a83c59b6825581e92a9d89fa2b1f96aa6190c7b6560514e36`） | archived |
| SRC-005 | LAW | Immigration Rules: Appendix Long Residence（版本 2026-10-08，HC 584；settlement 合格期 LR 11.1–11.2，B2 自 2027-03-26 见 LR 13.1） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-long-residence | 2026-10-08 | 2026-11-04 | `policy-sources/2026-10-08-immigration-rules-appendix-long-residence.html`（sha256 `6373e989543310ed9a0bd07ba257575fa5b9fed415521a8f9b07f06424dd8d44`） | archived |
| SRC-006 | GUIDANCE | Public funds（Home Office guidance，HTML 版；SRC-001 p18 注 6 指向此页） | https://www.gov.uk/government/publications/public-funds--2/public-funds | 2025-04-09 | 2026-11-04 | `policy-sources/2025-04-09-public-funds-guidance.html`（sha256 `30d3fe6a60d2e2aa84503944d0bd1b2cb06dcf30ec7577027bbf46455b295d55`） | archived |
| SRC-007 | LAW | Statement of Changes in Immigration Rules HC 1691（2026-03-05 提交议会）及其 Explanatory Memorandum：**已证实** 2027-03-26 起多条路线 settlement 英语要求升至 B2（Skilled Worker 见 APP SW5 插入的 SW 22A.1；EM 5.60–5.62） | https://www.gov.uk/government/publications/statement-of-changes-to-the-immigration-rules-hc-1619-5-march-2026 （正文 PDF：https://assets.publishing.service.gov.uk/media/69a9a1f58fd807b03bbe92e5/E03553349_-_HC_1691_-_Immigration_Rules_Changes__Web_Accessible_.pdf ；EM PDF：https://assets.publishing.service.gov.uk/media/69a9a2b8ac93547152b9b1eb/E03553349_-__HC_1691__-_EXPLANATORY_MEMORANDUM__Web_Accessible_.pdf ） | 2026-03-05 | 2026-11-04 | `policy-sources/2026-03-05-hc1691-statement-of-changes-immigration-rules.pdf`（sha256 `6192eb13f84577806c1c4766a45014704cf24a1deef859a66c2eb766c13083cb`）；`policy-sources/2026-03-05-hc1691-explanatory-memorandum.pdf`（sha256 `d4046133ae0f8ce429b20b9e3e81cac5688f6dd2e2474ca6f062ecc7e7271503`） | archived |
| SRC-008 | LAW | Immigration Rules: Appendix Continuous Residence（版本 2025-11-11，HC 1333；180 天缺席规则 CR 3.1，连续居住中断 CR 4.1） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-continuous-residence | 2025-11-11 | 2026-11-04 | `policy-sources/2025-11-11-immigration-rules-appendix-continuous-residence.html`（sha256 `c277440028e7e31662248f9d5d8ac8c755fbc958c9f98151d0c1e1c2850f29c6`） | archived（任务 0.3 时其余 Appendix 未登记；后续 Settlement Family Life / Global Talent / UK Ancestry / Innovator Founder / Graduate 分见 SRC-022 / 021 / 026 / 027 / 034） |
| SRC-009 | GUIDANCE | IAA registration explained（Immigration Advice Authority；§1.1 immigration advice / services 的法定定义，§1.3 未经资格提供属犯罪） | https://www.gov.uk/government/publications/iaa-adviser-registration-explained/iaa-adviser-registration-explained | 2026-10-05 | 2026-11-04 | `policy-sources/2026-10-05-iaa-registration-explained.html`（sha256 `980725d32782c7c4ab04ceb65b2a924736a57cbd23fbb45f0413817c0d8e6fa7`） | archived |
| SRC-010 | REFERENCE | GOV.UK Content API 文档：首页（用途、覆盖范围）与 API reference（字段、每客户端 10 req/s 限流） | https://content-api.publishing.service.gov.uk/ ；https://content-api.publishing.service.gov.uk/reference.html | —（页面无日期） | 2026-11-19 | `policy-sources/2026-11-19-govuk-content-api-docs.html`（sha256 `2eadf25194934d6796829e58e1ce1779cfba7148528bd72a13093f81c4ea8eb4`）；`policy-sources/2026-11-19-govuk-content-api-reference.html`（sha256 `ddc9550eeed71c3307f8fd0e5ab6a206bdad8f681acb5bc42baac8d0e2e9c3d3`） | archived（第二阶段才用） |
| SRC-011 | REFERENCE | legislation.gov.uk "New Legislation" 页：Atom 订阅 feed 说明，及"与印刷版同步或至少 24 小时内上线"的目标 | https://www.legislation.gov.uk/new （feed：https://www.legislation.gov.uk/new/data.feed ，2026-11-04 实测返回 `application/atom+xml`） | —（动态页面） | 2026-11-04 | `policy-sources/2026-11-04-legislation-gov-uk-new-legislation.html`（sha256 `8878c1d2a2931bcf5c6eb96e03ad1facb62378a0338b3b44b186f2ef0359406d`） | archived（第二阶段才用） |
| SRC-012 | POLICY | Restoring control over the immigration system: White Paper（CP 1326，80 页；发布日是 SRC-001 过渡安排的截止点；settlement B2 见 ¶257，10 年基准见 ¶264） | https://www.gov.uk/government/publications/restoring-control-over-the-immigration-system-white-paper （PDF：https://assets.publishing.service.gov.uk/media/6821f334ced319d02c906103/restoring-control-over-the-immigration-system-web-optimised.pdf ） | 2025-05-12 | 2026-11-04 | `policy-sources/2025-05-12-cp1326-restoring-control-white-paper.pdf`（sha256 `c5ff95a61effb96aff7ad83806cd6892e60c5fe9a2e949a9822b778fd22ad775`） | archived |
| SRC-013 | POLICY | A Fairer Pathway to Settlement: statement and accompanying consultation on earned settlement（CP 1448，60 页；咨询期 2025-11-20 至 2026-02-13；RQF 6 以下 15 年等方案已被 SRC-001 取代，仅作历史对照） | https://www.gov.uk/government/consultations/earned-settlement （PDF：https://assets.publishing.service.gov.uk/media/691edda450b16caf978153d8/Command_Paper_final_-_reviewed7.pdf ） | 2025-11-20 | 2026-11-04 | `policy-sources/2025-11-20-cp1448-earned-settlement-consultation.pdf`（sha256 `0e56c34796ed482282aacdf2a50e40728fb0d603dd738019168ddab24c3bab07`） | archived |
| SRC-014 | LAW | Immigration Rules: Appendix English Language（版本 2026-03-26，HC 1691；settlement 英语豁免 EL 1.1） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-english-language | 2026-03-26 | 2026-11-04 | `policy-sources/2026-03-26-immigration-rules-appendix-english-language.html`（sha256 `a1d9f8bf81841a7481439f4ea8d0db77cabaccd5c888d3fc1f49d1dd62fa795f`） | archived |
| SRC-015 | LAW | Immigration Rules: Appendix KOL UK（版本 2025-04-09，HC 733；Life in the UK 豁免 KOL 1.1，满足方式 KOL 2.1） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-kol-uk | 2025-04-09 | 2026-11-04 | `policy-sources/2025-04-09-immigration-rules-appendix-kol-uk.html`（sha256 `11cf0a7ac3b7077a3d9dadff97f2b36c71d96f6c57f1a27d84b9473bb9add1d6`） | archived |
| SRC-016 | GUIDANCE | About us - Immigration Advice Authority（IAA 的调查、执法与起诉权） | https://www.gov.uk/government/organisations/immigration-advice-authority/about | 2025-01-16 | 2026-11-04 | `policy-sources/2025-01-16-iaa-about-us.html`（sha256 `4f8fa4114e9b593c7d197574d7144eed1f72adc1130d55f03ade9fb21f827212`） | archived |
| SRC-017 | LAW | Immigration Rules: Appendix Skilled Occupations（版本 2025-11-11，HC 1333；SOC 2020 职业及 going rates） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-occupations | 2025-11-11 | 2026-11-04 | `policy-sources/2025-11-11-immigration-rules-appendix-skilled-occupations.html`（sha256 `80e31318ea53831fff90635abc64a4d8ca5eaef574bef66421045410b12818c7`） | archived |
| SRC-018 | LAW | Immigration Rules: Appendix Children（版本 2025-11-11，HC 1333；dependent child 的 age CHI 1.1–1.2、independent life CHI 1A.1、care CHI 2.1、settlement 关系要求 CHI 4.1–4.3；SW 39.4、SW 41A.1 引用） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-children | 2025-11-11 | 2026-11-04 | `policy-sources/2025-11-11-immigration-rules-appendix-children.html`（sha256 `51c9aece25bec6a58af8149dd4ab8292a0e87f10538c092e9a89bedad749338f`） | archived |
| SRC-019 | LAW | Immigration Rules: Appendix Immigration Salary List（版本 2025-11-11，HC 1333；SOC 2020 职业、进一步条件、适用国家与 removal date） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-immigration-salary-list | 2025-11-11 | 2026-11-04 | `policy-sources/2025-11-11-immigration-rules-appendix-immigration-salary-list.html`（sha256 `eae72b67984b14187821976ca618e81008755e6cab99266bec8dbf002b8c883a`） | archived |
| SRC-020 | LAW | Immigration Rules: Appendix Hong Kong British National (Overseas)（版本 2026-10-08，HC 584；settlement 见 HK 55.1–HK 64.2） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-hong-kong-british-national-overseas | 2026-10-08 | 2026-11-04 | `policy-sources/2026-10-08-immigration-rules-appendix-hong-kong-british-national-overseas.html`（sha256 `1dce2a9adfeb1b87d449df1e0ec47ff4578c0e29eae579649366bd94bf67381e`） | archived |
| SRC-021 | LAW | Immigration Rules: Appendix Global Talent（版本 2026-08-03，HC 259；主申请人 settlement 见 GT 8.1–GT 15.2） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-global-talent | 2026-08-03 | 2026-11-04 | `policy-sources/2026-08-03-immigration-rules-appendix-global-talent.html`（sha256 `680309baff0dc7e8e6f46eb2e0b6cd042e07f65fa3d0e7f13af8d99c24a6c08d`） | archived |
| SRC-022 | LAW | Immigration Rules: Appendix Settlement Family Life（版本 2026-08-03，HC 259；partner / parent 的 10 年 settlement 见 SETF 1.1–SETF 9.5） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-settlement-family-life | 2026-08-03 | 2026-11-04 | `policy-sources/2026-08-03-immigration-rules-appendix-settlement-family-life.html`（sha256 `c0d43e0daca75e7ce0fae936f3559e44858dfd2ae25049719fda5718dbbebddf`） | archived |
| SRC-023 | LAW | Immigration Rules: Appendix Settlement Protection（版本 2026-04-08，HC 1691；主申请人 settlement 见 STP 1.1–STP 5.3） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-settlement-protection | 2026-04-08 | 2026-11-04 | `policy-sources/2026-04-08-immigration-rules-appendix-settlement-protection.html`（sha256 `3ce467778ba7539b5fc59bb1e4e9aabeb5b7505db5a194ceabd74cb6bd965482`） | archived |
| SRC-024 | LAW | Immigration Rules: Appendix FM: family members（版本 2026-10-08，HC 584；伴侣 5 年 settlement 见 E-ILRP.1.1–E-ILRP.1.6，财务要求见其引用的 E-LTRP.3.1–E-LTRP.3.9） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-fm-family-members | 2026-10-08 | 2026-11-04 | `policy-sources/2026-10-08-immigration-rules-appendix-fm-family-members.html`（sha256 `14adc4b2b406b28b4eb5a46e111db870e2edd85101c4c79cccc417f655d576eb`） | archived |
| SRC-025 | LAW | Immigration Rules: Appendix KoLL（版本 2026-03-26，HC 1691；E-ILRP.1.6 引用的英语与 Life in the UK 要求，见 KoLL 2.1–KoLL 2.3，豁免见 Part 3；不同于 SRC-015 Appendix KOL UK） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-koll | 2026-03-26 | 2026-11-04 | `policy-sources/2026-03-26-immigration-rules-appendix-koll.html`（sha256 `d3003c6b5b99eacc50e4ac094e8b15c4128d4c11a60400bb5a1b111ed382de38`） | archived |
| SRC-026 | LAW | Immigration Rules: Appendix UK Ancestry（版本 2026-08-03，HC 259；主申请人 settlement 见 UKA 10.1–UKA 17.2） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-uk-ancestry | 2026-08-03 | 2026-11-04 | `policy-sources/2026-08-03-immigration-rules-appendix-uk-ancestry.html`（sha256 `82ead664bd3a11260db4bb5e8b1656c9b01cb73a1b1ba3f3ff147feb130d780b`） | archived |
| SRC-027 | LAW | Immigration Rules: Appendix Innovator Founder（版本 2026-08-03，HC 259；主申请人 settlement 见 INNF 15.1–INNF 21.6，业务条件见 INNF 17.1–INNF 17.5） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-innovator-founder | 2026-08-03 | 2026-11-04 | `policy-sources/2026-08-03-immigration-rules-appendix-innovator-founder.html`（sha256 `1853949fb4447bd0a0c8d76c79678aaf50947d02336e33f0c0867dbf55894418`） | archived |
| SRC-028 | LAW | Immigration Rules: Appendix Private Life（版本 2026-10-08，HC 584；主申请人 settlement 见 PL 11.1–PL 18.5，合格期分流见 PL 13.1–PL 14.4） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-private-life | 2026-10-08 | 2026-11-04 | `policy-sources/2026-10-08-immigration-rules-appendix-private-life.html`（sha256 `43a13c41406b8d7131d7f1e98addcd4afb597b04ea8dded55897ca3d4003e3ad`） | archived |
| SRC-029 | LAW | Immigration Rules Part 8: family members（版本 2026-08-03，HC 259；child settlement 见 para 298–298A） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-part-8-family-members | 2026-08-03 | 2026-11-05 | `policy-sources/2026-08-03-immigration-rules-part-8-family-members.html`（sha256 `66c523cc6f5d9c6370277ab972b9ab07c247090476b5e5c8009d78a88feb8d9f`） | archived |
| SRC-030 | GUIDANCE | Skilled Worker visa: How much it costs（境内标准申请 ≤3 年 £943、IHS 通常每年 £1,035；动态 guide 子页） | https://www.gov.uk/skilled-worker-visa/how-much-it-costs | —（guide 元数据 public_updated_at 为 2024-10-31，非费用生效日） | 2026-11-05 | `policy-sources/2026-11-05-skilled-worker-visa-how-much-it-costs.html`（sha256 `55313dadb207b2caae7c5f77a5487791e61b4faf748b09b740b08b11511594ca`） | archived |
| SRC-031 | GUIDANCE | Home Office immigration and nationality fees, 8 October 2026（ILR 申请费 £3,226） | https://www.gov.uk/government/publications/visa-regulations-revised-table/home-office-immigration-and-nationality-fees-8-october-2026 | 2026-09-10（表内费率自 2026-10-08） | 2026-11-05 | `policy-sources/2026-10-08-home-office-immigration-and-nationality-fees.html`（sha256 `3b4fbb59134f418352ed61e6744bdccbfd341c7467f3e5e0c327b22ab25d2d33`） | archived |
| SRC-032 | POLICY | Budget 2026 (HTML)，HC 726；方向、实施窗口与税务措施见登记备注 | https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html | 2026-10-28 | 2026-11-15 | `policy-sources/2026-10-28-budget-2026.html`（sha256 `200771cdef71c7922e842b94cfbd9ba108778dd2e1965631ed527a920fc0193e`） | archived |
| SRC-033 | PARLIAMENT | Written question 40064：工作签证薪资与 curtailment | https://questions-statements.parliament.uk/written-questions/detail/2026-11-02/40064 | 提问 2026-11-02；回答 2026-11-04 | 2026-11-15 | `policy-sources/2026-11-04-written-question-40064.json`（sha256 `a858b23f4568d18803b17de1ab68c6d5739941b898c9ffb20778eae15d432313`） | archived |
| SRC-034 | LAW | Immigration Rules Appendix Graduate（Appendix 版本 2026-08-03，HC 259；GR 8.1） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-graduate | 2026-08-03（页头手册 Updated 2026-10-29） | 2026-11-15 | `policy-sources/2026-08-03-immigration-rules-appendix-graduate.html`（sha256 `d98b79a8f5c36f6828e3a20864067da645cf594508222624f9019e33d2752984`）；`policy-sources/2026-08-03-immigration-rules-appendix-graduate-content-api.json`（sha256 `1278b1bec4b9343da47340a5eb6131eefe91b52df4fe7a47c64b6624d0097972`） | archived |
| SRC-035 | LAW | Immigration Rules Appendix High Potential Individual（版本 2026-08-03，HC 259；HPI 1.6A、5.1–5.3） | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-high-potential-individual | 2026-08-03（页头手册 Updated 2026-10-29） | 2026-11-15 | `policy-sources/2026-08-03-immigration-rules-appendix-high-potential-individual.html`（sha256 `09988260da18eb0d8941a6d68904b0d7bb5dba65566b0f19ff6b027779928b00`）；`policy-sources/2026-08-03-immigration-rules-appendix-high-potential-individual-content-api.json`（sha256 `a1e8b7ca0aceefcca6bc9f799a4e4d4df7d71d6fb0a0c8a85d33be04a8f54334`） | archived |
| SRC-036 | GUIDANCE | High Potential Individual visa: global universities list 2026（含发布集合页） | https://www.gov.uk/government/publications/high-potential-individual-visa-global-universities-list/high-potential-individual-visa-global-universities-list-2026 | 首发 2026-11-01；更新 2026-11-04 | 2026-11-15 | `policy-sources/2026-11-04-high-potential-individual-global-universities-list-2026.html`（sha256 `7fd240cf29a78651ee91121081af6a56422bdcd0615b80d66c85ec3375d872a6`）；`policy-sources/2026-11-04-high-potential-individual-global-universities-list-index.html`（sha256 `80783082315d8ed9ecafd5ecf848b04704af0a4c396a5adb04c834ae6f2c9281`） | archived |
| SRC-037 | PARLIAMENT | Written question 39721：现有在英者、过渡与影响评估 | https://questions-statements.parliament.uk/written-questions/detail/2026-11-02/39721 | 提问 2026-11-02；回答 2026-11-04 | 2026-11-15 | `policy-sources/2026-11-04-written-question-39721.json`（sha256 `bf4e7e36fdae6f3ff1dd2ee23915ce963de6090d8e1ed6ea339be8177d25f25c`） | archived |
| SRC-038 | PARLIAMENT | Written question 40262：定居合格期不授予同长度停留许可 | https://questions-statements.parliament.uk/written-questions/detail/2026-11-03/40262 | 提问 2026-11-03；回答 2026-11-10 | 2026-11-15 | `policy-sources/2026-11-10-written-question-40262.json`（sha256 `8715dfaabd69d1de9fec59c5a3b9ec29b056bab0b4f578af2dd394e23cf383b6`） | archived |
| SRC-039 | PARLIAMENT | Written question 41453：无改革基线预测与影响评估 | https://questions-statements.parliament.uk/written-questions/detail/2026-11-10/41453 | 提问 2026-11-10；回答 2026-11-13 | 2026-11-15 | `policy-sources/2026-11-13-written-question-41453.json`（sha256 `5bccb509152700b099d6a8027ae4aafc8cf725824c17cc22904fb15b9bc75622`） | archived |
| SRC-040 | PARLIAMENT | Women and Equalities Committee oral evidence，HC 760（Q1–Q26；含官方元数据） | https://committees.parliament.uk/oralevidence/18236/html | 取证／命令刊印 2026-11-04；API publicationDate 2026-11-05 | 2026-11-15 | `policy-sources/2026-11-05-wec-earned-settlement-oral-evidence-hc760.html`（sha256 `80f2ba6774f345baf89219a7ea1c96d2fde494669cb262abf441a50936b4a83e`）；`policy-sources/2026-11-05-wec-earned-settlement-oral-evidence-hc760-metadata.json`（sha256 `fc353df69a41a41fa114c0a3bdffcbbd182e219cb56edde216344108c1c04ffb`） | archived |
| SRC-041 | PARLIAMENT | Women and Equalities Committee 致内政大臣函（5 页） | https://committees.parliament.uk/publications/55734/standard/pdf/ | 信件／发布 2026-11-05 | 2026-11-15 | `policy-sources/2026-11-05-wec-earned-settlement-letter.pdf`（sha256 `3a4e79f3767c789b4bea982f4ad2f8ad62b3d3ba3100f947e3e9272037c9e003`） | archived |
| SRC-042 | GUIDANCE | eVisas: access and use your online immigration status — Travel with your eVisa | https://www.gov.uk/evisa/travel-with-evisa | —（动态 guide 子页；不以旧元数据当政策版本日） | 2026-11-15 | `policy-sources/2026-11-15-evisa-travel-with-evisa.html`（sha256 `de8004ce72037dd75e06bea9f95d0fa6c8e82a28d78959a1c220c2cf43efa48f`） | archived |
| SRC-043 | GUIDANCE | Get an electronic travel authorisation (ETA) to visit the UK: Overview | https://www.gov.uk/eta | —（动态 guide 子页） | 2026-11-15 | `policy-sources/2026-11-15-electronic-travel-authorisation-overview.html`（sha256 `13216b5dceaff98b12f4d02e5a2d15c31315bd2138e81f7f9549ba6332ba8347`） | archived |
| SRC-044 | GUIDANCE | Pay for UK healthcare as part of your immigration application: How much you have to pay | https://www.gov.uk/healthcare-immigration-application/how-much-pay | —（动态 guide 子页） | 2026-11-15 | `policy-sources/2026-11-15-immigration-health-surcharge-cost.html`（sha256 `941b0fcf1251cfccadffe12a794426692bb21a2fd05f9fdbdf8b0e2c824a0b1a`） | archived |
| SRC-045 | GUIDANCE | Life in the UK Test: Book the Life in the UK Test | https://www.gov.uk/life-in-the-uk-test | —（动态 guide 子页） | 2026-11-15 | `policy-sources/2026-11-15-life-in-the-uk-test-booking.html`（sha256 `9ab64fddb4909fdbd0cab8e67f135d8353cbcf3744dbd39444524bb81ff022ba`） | archived |
| SRC-046 | POLICY | HMRC：Income Tax: immigration skills charge and certificate of sponsorship fees | https://www.gov.uk/government/publications/income-tax-treatment-of-immigration-skills-charge-and-certificate-of-sponsorship-fees/income-tax-immigration-skills-charge-and-certificate-of-sponsorship-fees | 2026-10-28 | 2026-11-15 | `policy-sources/2026-10-28-income-tax-immigration-skills-charge-and-cos-fees.html`（sha256 `708daf276a1f1e8369dfb466679e4838017801799722ff646b6b077e6e225085`） | archived |
| SRC-047 | PARLIAMENT | HC Deb vol 792，Budget Resolutions，Resolution 15（临时税收决议） | https://hansard.parliament.uk/Commons/2026-11-03/debates/31AB917B-C6F4-41D2-B256-BAB5D978DA92/BudgetResolutions | 2026-11-03 | 2026-11-15 | `policy-sources/2026-11-03-hansard-commons-budget-resolutions.json`（sha256 `f918f906f9c470cbc1e5f5e1099e1f6b92b8cfce42d4fa3c4a345a46b63fef3e`） | archived |
| SRC-048 | LAW | Statement of Changes to the Immigration Rules HC 584，accessible HTML | https://www.gov.uk/government/publications/statement-of-changes-to-the-immigration-rules-hc-584-3-september-2026/statement-of-changes-to-the-immigration-rules-hc-584-3-september-2026-accessible | 2026-09-03 | 2026-11-15 | `policy-sources/2026-09-03-hc584-statement-of-changes-accessible.html`（sha256 `db5275cd2da6a6b7ed45f4bbfbd67e59e6ace78b808ad267c8295cb73acedd1b`） | archived |
| SRC-049 | PARLIAMENT | Finance Bill 2026–27，Bill 173 as introduced，第 15 条 | https://publications.parliament.uk/pa/bills/cbill/59-02/0173/260173.pdf | 一读 2026-11-03；刊印 2026-11-04 | 2026-11-19（在线核对及元数据） | 无原文快照（议会发布元数据及 SHA-256 见登记备注） | todo |
| SRC-050 | GUIDANCE | Home Office Skilled Worker caseworker guidance，v20.0 | https://www.gov.uk/government/publications/skilled-worker-visa-caseworker-guidance/skilled-worker-caseworker-guidance-accessible | 2026-08-03 | 2026-11-19 | `policy-sources/2026-08-03-skilled-worker-caseworker-guidance.html`（sha256 `c663d22e881510bb4c107e66227395ef7e670430ec7f3d4bcbf4a00966e30f03`） | archived |
| SRC-051 | LAW | Immigration Rules Appendix Student，HC 584 | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-student | 2026-10-08（页头手册 Updated 2026-10-29） | 2026-11-19 | `policy-sources/2026-10-08-immigration-rules-appendix-student.html`（sha256 `5e05c64b16e288e988bfd970a1eb68d6b80a18d36f454aab5b245e471906b598`） | archived |
| SRC-052 | GUIDANCE | Home Office Student and Child Student caseworker guidance，v15.0 | https://www.gov.uk/government/publications/student-route-caseworker-guidance/student-and-child-student | 员工版 2026-10-09；网页更新 2026-10-16 | 2026-11-19 | `policy-sources/2026-10-16-student-and-child-student-caseworker-guidance.html`（sha256 `87f800b0fd8ad5abfd5222094978ea73d3674bc1156686bbc56fcf7230d35aa1`） | archived |
| SRC-053 | LAW | Immigration Rules Appendix FM-SE: family members specified evidence，HC 1691 | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-fm-se-family-members-specified-evidence | 2026-03-26（页头手册 Updated 2026-10-29） | 2026-11-19 | `policy-sources/2026-03-26-immigration-rules-appendix-fm-se.html`（sha256 `363d511587597e56df6cc78ad46b987e70bd350a3d0d670f10448413b484cc5d`） | archived |
| SRC-054 | GUIDANCE | Family Migration: Appendix FM and Adult Dependent Relative – adequate maintenance and accommodation，v13.0 | https://assets.publishing.service.gov.uk/media/6911ee0de9348ac8fb54f484/Appendix%2BFM%2Band%2BAdult%2BDependent%2BRelative%2BAdequate%2Bmaintenance%2Band%2Baccommodation.pdf | 2025-11-11 | 2026-11-19 | `policy-sources/2025-11-11-appendix-fm-adequate-maintenance-and-accommodation.pdf`（sha256 `624d2aaa8678c84045a31df6fed30d568cac8a2d3d01efa51ce427ad75a88226`） | archived |
| SRC-055 | LAW | Immigration Act 1971 s.3C: Continuation of leave pending variation decision（现行修订文本） | https://www.legislation.gov.uk/ukpga/1971/77/section/3C | 现行合订文本，按抓取日命名 | 2026-11-19 | `policy-sources/2026-11-19-immigration-act-1971-section-3c.html`（sha256 `e57a1c15ca7f584d247ce76212e2151a8ac6ce44b533358e610916bbaa84ed46`） | archived |
| SRC-056 | GUIDANCE | Workers and Temporary Workers: guidance for sponsors Part 2 – Sponsor a worker，v10/26 | https://www.gov.uk/government/publications/workers-and-temporary-workers-guidance-for-sponsors-part-2-sponsor-a-worker/workers-and-temporary-workers-guidance-for-sponsors-part-2-sponsor-a-worker-accessible--2 | 2026-10-08 | 2026-11-19 | `policy-sources/2026-10-08-sponsor-a-worker-part-2.html`（sha256 `871a45962e40c4954a9a650afdd8f6c775f56fc37eaaa8f54528d08f777ede04`） | archived |
| SRC-057 | GUIDANCE | Home Office Continuous residence caseworker guidance，v10.0 | https://www.gov.uk/government/publications/continuous-residence-caseworker-guidance/continuous-residence-guidance-accessible-version | 2026-10-08 | 2026-11-19 | `policy-sources/2026-10-08-continuous-residence-caseworker-guidance.html`（sha256 `fe80d4c8c759eb21c4c1ebef69b312483414723f1f0dacc2ab9470daa5f465dc`） | archived |
| SRC-058 | PARLIAMENT | Written question 40091：HPI 扩容的大学排名筛选 | https://questions-statements.parliament.uk/written-questions/detail/2026-11-02/40091 | 提问 2026-11-02；回答 2026-11-04 | 2026-11-19 | `policy-sources/2026-11-04-written-question-40091.json`（sha256 `04df2bb18720e55d2f8f62d380750d7a6333a05dbbe8d496d1390b357d2ed8f2`） | archived |
| SRC-059 | GUIDANCE | Home Office Cancellation and curtailment of permission，v12.0 | https://www.gov.uk/government/publications/immigration-status-and-enforcement-action-caseworker-guidance/cancellation-and-curtailment-of-permission-accessible | 员工版 2026-09-11；网页更新 2026-09-14 | 2026-11-19 | `policy-sources/2026-09-14-cancellation-and-curtailment-of-permission.html`（sha256 `1957b79a1d9a074d98c7722f9db134a8349bd5c3ec1284dafda6dc5eee11c96a`） | archived |
| SRC-060 | LAW | Statement of Changes in Immigration Rules HC 590（2024-03-14）Implementation：2024-04-04 前签发 CoS 的 Skilled Worker 申请按 2024-04-03 的规则审理 | https://www.gov.uk/government/publications/statement-of-changes-to-the-immigration-rules-hc-590-14-march-2024/statement-of-changes-to-the-immigration-rules-hc-590-14-march-2024-accessible-version | 2024-03-14 | 2026-11-20 | `policy-sources/2024-03-14-hc590-statement-of-changes-accessible.html`（sha256 `c538acdbce21a3f9cd49c99689efd8134c4f6b9bdbfca6646a01017826ce5ef8`） | archived |
| SRC-061 | LAW | Australian Citizenship Act 2007（Compilation No. 37，2026-06-04；一般资格 s21(2)，一般居住要求 s22） | https://www.legislation.gov.au/C2007A00020/2026-06-04/2026-06-04/text/original/epub/OEBPS/document_1/document_1.html （登记版本：https://www.legislation.gov.au/C2007A00020/2026-06-04/2026-06-04/text ；现行版入口：https://www.legislation.gov.au/C2007A00020/latest/text ） | 2026-06-04 | 2026-11-21 | `policy-sources/2026-06-04-au-australian-citizenship-act-2007-compilation-37.html`（sha256 `75fe3d5ae7abb63837f9348123cfe94baa0cbbda13693d0779da17e4d6aeacab`） | archived |
| SRC-062 | LAW | Migration Regulations 1994（Compilation No. 291，2026-11-03）Volume 1（reg 1.03 定义；Schedule 1 item 1139）与 Volume 2（Schedule 2：100、155、186、189、190、191、801） | https://www.legislation.gov.au/F1996B03551/2026-11-03/2026-11-03/text/original/epub/OEBPS/document_1/document_1.html ；https://www.legislation.gov.au/F1996B03551/2026-11-03/2026-11-03/text/original/epub/OEBPS/document_2/document_2.html （登记版本：https://www.legislation.gov.au/F1996B03551/2026-11-03/2026-11-03/text ；现行版入口：https://www.legislation.gov.au/F1996B03551/latest/text ） | 2026-11-03 | 2026-11-21 | `policy-sources/2026-11-03-au-migration-regulations-1994-compilation-291-vol1.html`（sha256 `fc8ed8facbe2ac35cc28385f014ec15d4b9ebf122f4534ac6e3c01c48e3192f3`）；`policy-sources/2026-11-03-au-migration-regulations-1994-compilation-291-vol2.html`（sha256 `cb7187a13efa7a73f20da21c1e2743e94aff950abe8250d8e6af01c0ac00e0a8`） | archived |
| SRC-063 | GUIDANCE | Department of Home Affairs：Skilled Regional visa（subclass 191）Regional Provisional Visas stream | https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-regional-191/regional-provisional | —（动态页面） | 2026-11-23 | `policy-sources/2026-11-23-au-immi-191-regional-provisional.html`（sha256 `612bd2717774a52da492e7aa491a4474ffc2077a18d2ca2724fe05679e89bde2`） | archived |
| SRC-064 | GUIDANCE | Department of Home Affairs：Employer Nomination Scheme visa（subclass 186）Temporary Residence Transition stream | https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/employer-nomination-scheme-186/temporary-residence-transition-stream | —（动态页面） | 2026-11-23 | `policy-sources/2026-11-23-au-immi-186-trt.html`（sha256 `fd07d36cea2163df7356a0e791233b3bfe912f0c815073d0640fa8fbaa0a394d`） | archived |
| SRC-065 | GUIDANCE | Department of Home Affairs：Partner visa（subclass 801）永久阶段 | https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/partner-onshore/permanent-801 | —（动态页面） | 2026-11-23 | `policy-sources/2026-11-23-au-immi-801-partner-perm.html`（sha256 `3a3c032788ef353b5954bf9dc63a3a426769c6152e4fe1099fb75a6de827b451`） | archived |
| SRC-066 | GUIDANCE | Department of Home Affairs：Resident Return visa（subclasses 155 和 157） | https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/resident-return-visa-155-157 | —（动态页面） | 2026-11-23 | `policy-sources/2026-11-23-au-immi-155-157-rrv.html`（sha256 `f3c72b157f077a55ec72b056ba8cc4b925f36b4a0365b9e9c68602992138f0de`） | archived |
| SRC-067 | GUIDANCE | Department of Home Affairs：Become an Australian citizen（by conferral）——永久居民 | https://immi.homeaffairs.gov.au/citizenship/become-a-citizen/permanent-resident | —（动态页面） | 2026-11-23 | `policy-sources/2026-11-23-au-immi-citizenship-permanent-resident.html`（sha256 `2037bbd1680192ef6c460f0732e861fb3357ed0793046e3970655d63b5ee41c7`） | archived |
| SRC-068 | GUIDANCE | Department of Home Affairs Standard Operating Procedure：General residence requirement and permanent resident status（依 FOI 申请 FA 25/08/01434 公开，部分删节，23 页） | https://www.homeaffairs.gov.au/foi/files/2025/fa-250801434-document-released.PDF | PDF 2025-09-15 | 2026-11-21 | `policy-sources/2025-09-15-au-sop-general-residence-requirement-foi.pdf`（sha256 `4fce927e1b93f2b296f899ffd096b9ec44659b083906d60112f67ad6d22be8b0`） | archived |
| SRC-069 | LAW | Migration Act 1958（Compilation No. 172，2026-10-08）Volume 1：境内递交限制与豁免（ss 41、46、48）、签证终止（s 82） | https://www.legislation.gov.au/C1958A00062/2026-10-08/2026-10-08/text/original/epub/OEBPS/document_1/document_1.html （登记版本：https://www.legislation.gov.au/C1958A00062/2026-10-08/2026-10-08/text ；现行版入口：https://www.legislation.gov.au/C1958A00062/latest/text ） | 2026-10-08 | 2026-11-21 | `policy-sources/2026-10-08-au-migration-act-1958-compilation-172-vol1.html`（sha256 `52a074ece7fdf107db0802e2079a71870d33f75aeabb91b2ecb842537330d29b`） | archived |
| SRC-070 | LAW | Citizenship Act 1977（新西兰，Version as at 2026-06-06；s8 citizenship by grant） | https://www.legislation.govt.nz/act/public/1977/61/en/latest/ （登记版本 PDF：https://www.legislation.govt.nz/act/public/1977/61/en/2026-06-06.pdf ） | 2026-06-06 | 2026-11-21 | `policy-sources/2026-06-06-nz-citizenship-act-1977-s8.html`（sha256 `f9a43233fabbbbedf29b4b9e56d2c49d2d66f99fd1ae12a865e954132db3be2c`） | archived |
| SRC-071 | LAW | Immigration Act 2009（新西兰，Version as at 2026-07-10；s71 居民类签证申请资格、s73 永久居民签证、s74 居民签证与旅行条件） | https://www.legislation.govt.nz/act/public/2009/51/en/latest/ | 2026-07-10 | 2026-11-21；2026-11-24 补核 s71 | `policy-sources/2026-07-10-nz-immigration-act-2009-ss73-74.html`（sha256 `850fa60bc0927ba64dcdf43f7cf9541a193b5760e7bc9f9eba2ba6fbffaec649`） | archived |
| SRC-072 | LAW | Immigration New Zealand Operational Manual（Immigration Instructions）：RV2.5 永久居民签证（2024-06-23 生效）、RV2.10 有投资条件的居民签证转永居（2022-09-19）、RV1.15 证据（2012-11-26）、R5.66 居民签证的旅行条件（2026-08-12）、RV1.5 居民签证何时失效（2011-11-07）、RV1.20 随同申请人（2026-08-12） | https://www.immigration.govt.nz/opsmanual/30505.htm ；https://www.immigration.govt.nz/opsmanual/46181.htm ；https://www.immigration.govt.nz/opsmanual/45649.htm ；https://www.immigration.govt.nz/opsmanual/44894.htm ；https://www.immigration.govt.nz/opsmanual/42631.htm ；https://www.immigration.govt.nz/opsmanual/45650.htm | 见标题 | 2026-11-21；2026-11-23 补档 | `policy-sources/2024-06-23-nz-immigration-instructions-rv2-5.html`（sha256 `ae9c55ff6541067f080a52716d7dad82d4658d8b450f510ca04d9e523dc15bed`）；`policy-sources/2022-09-19-nz-immigration-instructions-rv2-10.html`（sha256 `72afede60ccfa7ec2fd75848103442ec444f955878cebf6c3d0487427b483afb`）；`policy-sources/2012-11-26-nz-immigration-instructions-rv1-15.html`（sha256 `c622973856d8b9998ed1b98df1c66a5d8e7c781ec5061292607580f7ea67faa5`）；`policy-sources/2026-08-12-nz-immigration-instructions-r5-66.html`（sha256 `654a93b52da6eba0121832b884735104c17b889b75cb2fd3636d5cffcb096d1d`）；`policy-sources/2011-11-07-nz-immigration-instructions-rv1-5.html`（sha256 `4666d0fbedbf0c4661fc2b0a71e25d3fa8deedec53b9f1e3326d296ea022d3f4`）；`policy-sources/2026-08-12-nz-immigration-instructions-rv1-20.html`（sha256 `4a93ba2c2a08e3f38073616f7ad42060eebb76d26efeecc98f58bb2e4ccb3505`）；`policy-sources/2026-08-12-nz-ops-r5-66.html`（sha256 `a091c1cc85ac2b4b6a3b0b094c56c93be686d4df04134826338c41c09d8002ec`） | archived |
| SRC-073 | GUIDANCE | 新西兰官方说明：govt.nz（Department of Internal Affairs）Presence in NZ requirements；Immigration New Zealand Visa Pak 588（2024-07-18，永久居民签证的 12、24 个月按天计）；Religious Worker Resident Visa 页面（节选）；Department of Internal Affairs 依 OIA 21/22-0423 公开的在境计算器规格（2021-12-15） | https://www.govt.nz/browse/passports-citizenship-and-identity/nz-citizenship/requirements-for-nz-citizenship/presence-requirements/ ；https://www.immigration.govt.nz/assets/inz/documents/visa-paks/visa-pak-588.pdf ；https://www.immigration.govt.nz/visas/religious-worker-resident-visa/ ；https://www.dia.govt.nz/diawebsite.nsf/Files/OIA-releases/$file/OIA-2122-0423.pdf | 见标题（网页为动态页面） | 2026-11-21；2026-11-23 补档 | `policy-sources/2026-11-21-nz-citizenship-presence-requirements.html`（sha256 `92d4b3ef1b812709db0fff649e84d9d236d316757a080b37c6eb74afc475947c`）；`policy-sources/2024-07-18-nz-visa-pak-588-prv-periods.pdf`（sha256 `38319ee3e7429c5240024effc666c1b76d4f4be0ed8dea91cf45415590704f3d`）；`policy-sources/2026-11-21-nz-religious-worker-resident-visa.html`（sha256 `234df2062b623f618797781f4e65153ce45658cc45a24773acd4575ba4ad15aa`）；`policy-sources/2021-12-15-nz-dia-oia-2122-0423-presence-calculator.pdf`（sha256 `8ec44efdae4ab842f4267b7cf8891df4018390ab650a4e6c2464b7ae7797a2c6`）；`policy-sources/2026-11-23-nz-govt-citizenship-presence.html`（sha256 `0d1e99c54d2d4cabff880a2448f492eb9fd0884030684a7813ef7d26207f1f3b`） | archived |
| SRC-074 | LAW | Citizenship Act（加拿大，R.S.C. 1985, c. C-29；current to 2026-10-29，last amended 2025-12-15）：s5 入籍条件与实际居住计算、s21 不计入的期间 | https://laws-lois.justice.gc.ca/eng/acts/c-29/section-5.html ；https://laws-lois.justice.gc.ca/eng/acts/c-29/section-21.html | 2026-10-29 | 2026-11-21 | `policy-sources/2026-10-29-ca-citizenship-act-s5.html`（sha256 `d9ea9293336985dcbd87c593d2c6d51e755410fde96dd2e0e76eb694319b5414`）；`policy-sources/2026-10-29-ca-citizenship-act-s21.html`（sha256 `bb415894daae5d87e593d1216105607395966265b6cacda799eac7c14e09c7d0`） | archived |
| SRC-075 | LAW | Immigration and Refugee Protection Act（加拿大，S.C. 2001, c. 27；current to 2026-10-29，last amended 2026-03-26）：s28 永久居民的居住义务 | https://laws-lois.justice.gc.ca/eng/acts/i-2.5/section-28.html | 2026-10-29 | 2026-11-21 | `policy-sources/2026-10-29-ca-irpa-s28.html`（sha256 `f54ac86d952f67f55b8f5e2bb42c44def60c7c61aef663304704c0b34a798072`） | archived |
| SRC-076 | GUIDANCE | IRCC：Apply for Canadian citizenship: adults and minor children — eligibility（Date modified 2026-04-21） | https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility.html | 2026-04-21 | 2026-11-21 | `policy-sources/2026-11-21-ca-ircc-citizenship-eligibility.html`（sha256 `531efa815cc1e6934f9c974bac024687f995009803fbc7776b2a7b54f1103dd6`） | archived |
| SRC-077 | GUIDANCE | IRCC 入籍实际居住的计算：Program delivery instructions "How residence/physical presence is calculated"（Date modified 2021-01-04）；Physical Presence Calculator FAQ（2026-07-17） | https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/canadian-citizenship/grant/residence/calculate-physical-presence.html ；https://eservices.cic.gc.ca/rescalc/redir.do?redir=faq | 见标题 | 2026-11-21 | `policy-sources/2026-11-21-ca-ircc-pdi-citizenship-how-physical-presence-calculated.html`（sha256 `c38e37954d4a3f9c6520b41fe4d453baa46ca4cc2aa8c2402922cc185cbe8f05`）；`policy-sources/2026-11-21-ca-ircc-physical-presence-calculator-faq.html`（sha256 `1cfcc5a1d27281e75cfd29521f82b979ab734c90309c420ea920d17da1d1d9f8`） | archived |
| SRC-078 | GUIDANCE | IRCC 永久居民居住义务：Program delivery instructions "Permanent resident status determination"（Date modified 2023-09-01）与 "Terms and definitions related to permanent residence"（2026-08-12） | https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/card/permanent-resident-determination.html ；https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/terms-definitions-related-permanent-residence.html | 见标题 | 2026-11-21 | `policy-sources/2026-11-21-ca-ircc-pdi-pr-status-determination.html`（sha256 `e5e8fc1961f8ae2f73d877b64f8a9eb640a56cb555777b46fee48450eba38d69`）；`policy-sources/2026-11-21-ca-ircc-pdi-pr-terms-definitions.html`（sha256 `1c9d19a684d64dcc0e51a66dd938878610057046a22cc5b33bdb74788161955e`） | archived |
| SRC-079 | LAW | United States Code Title 8（Immigration and Nationality Act，current through Public Law 119-142，2026-11-10）：8 U.S.C. 1427（INA 316 入籍）、1430（INA 319 配偶）、1186a（INA 216 婚姻条件绿卡）、1186b（INA 216A 投资条件绿卡）、1101（INA 101 定义）；另含 5 U.S.C. 6103 联邦法定假日 | https://uscode.house.gov/us/usc/t8/s1427/ ；https://uscode.house.gov/us/usc/t8/s1430/ ；https://uscode.house.gov/us/usc/t8/s1186a/ ；https://uscode.house.gov/us/usc/t8/s1186b/ ；https://uscode.house.gov/us/usc/t8/s1101/ ；https://uscode.house.gov/us/usc/t5/s6103/ | 2026-11-10 | 2026-11-21 | `policy-sources/2026-11-10-us-usc-8usc1427.html`（sha256 `a80667517c06f44ada647b5be878223bc6a675e562969312d1fd2c82e1661c67`）；`policy-sources/2026-11-10-us-usc-8usc1430.html`（sha256 `d69114cb8eacab83722144b4fd6990d09e9bdaf14cc18033814ba5ad9cadca8e`）；`policy-sources/2026-11-10-us-usc-8usc1186a.html`（sha256 `d6aee2dae98df8f7e709beddf33c066fbedd3fb1f4e73eb5e5ee329b983bcf77`）；`policy-sources/2026-11-10-us-usc-8usc1186b.html`（sha256 `b505273692361cc0047ff876574901ee1225cd284f8ac688138a02f0dcb67188`）；`policy-sources/2026-11-10-us-usc-8usc1101.html`（sha256 `5c679adcc3acf6582f35ea0b698327a4b37ee633dc43d23ca89c0dd46097bcfc`）；`policy-sources/2026-11-10-us-usc-5usc6103.html`（sha256 `0d88ab5e99179ce620d29c3791e80321a6784b4f70215e2070a325472e07070c`） | archived |
| SRC-080 | LAW | Code of Federal Regulations Title 8（eCFR 2026-11-19 时点版）：part 316（入籍要求、连续居住）、part 334（提前递交）、part 216（取消条件）、part 211（绿卡作入境证件） | https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=316 ；https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=334 ；https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=216 ；https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=211 | 2026-11-19 | 2026-11-21 | `policy-sources/2026-11-19-us-ecfr-8cfr-part316.xml`（sha256 `87e1a639dbd492df48556e915ddd05850726ff6081ba26a8487213f97d6c742b`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part334.xml`（sha256 `49f7f25e00de47dddfb1de7cfe36d7c88708263b26b420c1cf224d7314633748`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part216.xml`（sha256 `470715beb512773993f6a6cd14deda5fe8eb0895d51358990addc232bd52d608`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part211.xml`（sha256 `fada3dff46436e63d0530869ef9f8f492328c41d3dd456b9678cdd3d665c8eb4`） | archived |
| SRC-081 | GUIDANCE | USCIS Policy Manual（Current as of November 20, 2026）：Vol 12 Part D Ch 3 连续居住、Ch 4 实际居住、Ch 6 提前递交；Part G Ch 3 公民配偶；Vol 1 Part B Ch 6 递交日与周末、假日 | https://www.uscis.gov/policy-manual/volume-12-part-d-chapter-3 ；https://www.uscis.gov/policy-manual/volume-12-part-d-chapter-4 ；https://www.uscis.gov/policy-manual/volume-12-part-d-chapter-6 ；https://www.uscis.gov/policy-manual/volume-12-part-g-chapter-3 ；https://www.uscis.gov/policy-manual/volume-1-part-b-chapter-6 | 见各章 Updates | 2026-11-21 | `policy-sources/2026-11-21-us-pm-v12-d-ch3.html`（sha256 `6778f6ebcbda9a43d6f2c370b81cde336b82421fd238711a18427a79879951d8`）；`policy-sources/2026-11-21-us-pm-v12-d-ch4.html`（sha256 `fc8b930646e981bbf0ad386f8bf4dedd7ecf3e0a7b2b3552ac92ebd61011afad`）；`policy-sources/2026-11-21-us-pm-v12-d-ch6.html`（sha256 `d1c66af462331a91bea31b575df5680fec3c8e898f35793e39b0d60bbb7377a2`）；`policy-sources/2026-11-21-us-pm-v12-g-ch3.html`（sha256 `26ce9bcf9d966132e7b5bc04f64ed9a3bc1a12b139322a7a3a1a77158563b89a`）；`policy-sources/2026-11-21-us-pm-v1-b-ch6.html`（sha256 `192eeb2d279c8e023fffe31fa44a8c340918cd5571e87202e301e0919624b06f`） | archived |
| SRC-082 | GUIDANCE | USCIS：When to File Your Petition to Remove Conditions（Last Reviewed 2023-09-14）；International Travel as a Permanent Resident（Last Reviewed 2025-09-12）；Form N-400 填表说明（edition 01/20/25）；I-829 表格页（Last Reviewed 2026-06-01）；Forms Available to File Online（Last Reviewed 2026-10-07）；Fact Sheet: Family-Based Conditional Permanent Resident Joint Filing（2024-09-12） | https://www.uscis.gov/forms/when-to-file-your-petition-to-remove-conditions ；https://www.uscis.gov/green-card/after-we-grant-your-green-card/international-travel-as-a-permanent-resident ；https://www.uscis.gov/sites/default/files/document/forms/n-400instr.pdf ；https://www.uscis.gov/i-829 ；https://www.uscis.gov/file-online/forms-available-to-file-online ；https://www.uscis.gov/sites/default/files/document/fact-sheets/OP%26S_Family-BasedCPR_JointFiling.pdf | 见标题 | 2026-11-21 | `policy-sources/2026-11-21-us-i751-when-to-file.html`（sha256 `f0e0facd9492ecc635c8c24b2c803cae3dfc6f94decf4fed7745547aee721862`）；`policy-sources/2026-11-21-us-lpr-international-travel.html`（sha256 `ab1c0dfd36d9f12e287dc0f863ac0075c129fb06e54c2a01b25edf2281024220`）；`policy-sources/2026-11-21-us-n400instr.pdf`（sha256 `26fd4c556eb7c75b13cbc3e864f18773ab390c9827b0a1a34d23090cd00089d2`）；`policy-sources/2026-11-21-us-i829.html`（sha256 `47c43ed42e38ad449911a984744e9d45a65caff4e1135d43f61fa6f94b769dff`）；`policy-sources/2026-11-21-us-forms-file-online.html`（sha256 `1bf0c520ff939f93e908be8cbe1d0bc4ebd66f063c1f2ba03d75a9f36c284f3e`）；`policy-sources/2024-09-12-us-cpr-joint-filing-fact-sheet.pdf`（sha256 `21df8203ac6aca2f2466a293381f7ca2eaff830285f35171661763bb4abf9540`） | archived |
| SRC-083 | LAW | Real Decreto 1155/2024（Reglamento de la Ley Orgánica 4/2000，外国人法实施条例），BOE 合并文本 PDF（Última modificación 2026-09-22，187 页；含 RD 316/2026 的修订）：art. 183–184 国内长期居留、art. 176 长期居留-欧盟、art. 48 停留计日、art. 201 长期居留的丧失 | https://www.boe.es/buscar/pdf/2024/BOE-A-2024-24099-consolidado.pdf （合并文本入口：https://www.boe.es/buscar/act.php?id=BOE-A-2024-24099 ） | 2026-09-22 | 2026-11-21 | `policy-sources/2026-09-22-es-rd1155-2024-reglamento-extranjeria.pdf`（sha256 `5e253284d7a0dcd891453c2a791416c703da692a432941d5834815fb08478d0c`） | archived |
| SRC-084 | LAW | Código Civil（西班牙民法典），BOE 合并文本 PDF（最后更新 2025-01-03，282 页）：art. 5.1 期间计算、art. 21–23 按居住入籍 | https://www.boe.es/buscar/pdf/1889/BOE-A-1889-4763-consolidado.pdf （合并文本入口：https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763 ） | 2025-01-03 | 2026-11-21 | `policy-sources/2025-01-03-es-codigo-civil.pdf`（sha256 `98720d8eca8470bd9a92e3c254baa83ce25c8310ec5031c688a96b34bb645f1a`） | archived |
| SRC-085 | GUIDANCE | 西班牙官方说明：administracion.gob.es "Adquisición de la nacionalidad"（Última actualización 2026-04-13）；Ministerio de Inclusión Hoja informativa 49 国内长期居留（mayo de 2025） | https://administracion.gob.es/pag_Home/Tu-espacio-europeo/derechos-obligaciones/ciudadanos/residencia/obtencion-nacionalidad ；https://inclusion.gob.es/web/migraciones/w/49.-autorizacion-de-residencia-de-larga-duracion-nacional | 见标题 | 2026-11-21 | `policy-sources/2026-11-21-es-administracion-gob-adquisicion-nacionalidad.html`（sha256 `fc348525268a788963423c762b103cb95b2db2275c82ab2c2b7b4d42986ec84b`）；`policy-sources/2026-11-21-es-hoja49-larga-duracion-nacional.html`（sha256 `060cd5ec7b4f2b17d4b9782d4204146d64fae6973a2a525e8d4b93226b5bb32c`） | archived |
| SRC-086 | LAW | ν. 5038/2023 Κώδικας Μετανάστευσης（希腊移民法典），ΦΕΚ Α' 81/01.04.2023 原文（2024-03-31 起施行）：άρθ. 11 续期、95 投资类许可、100 不动产投资者许可（Β.5）、143–148 长期居留 | https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2023/20230100081.pdf ；https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2023/20230100215.pdf | 见各公报 | 2026-11-24 | `policy-sources/2023-04-01-gr-fek-a81-2023-n5038.pdf`（sha256 `826446ab38961ce1a697c9795609e51298ccfc6989db097af061eefc7037e0d3`）；`policy-sources/2023-12-22-gr-fek-a215-2023-n5079.pdf`（sha256 `e10a5687796f2ba07481dc63484f79b1113b2ca15894f555eca4ecc401a191e3`） | archived |
| SRC-087 | LAW | 希腊移民法典的修订：ν. 5100/2024（ΦΕΚ Α' 49/05.04.2024，άρθ. 64 重述 άρθ. 100）、ν. 5275/2026（ΦΕΚ Α' 17/06.02.2026，άρθ. 12 改 άρθ. 11 续期期限）、ν. 5307/2026（ΦΕΚ Α' 90/11.06.2026，άρθ. 179 重述 άρθ. 144） | https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2024/20240100049.pdf ；https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2026/20260100017.pdf ；https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2026/20260100090.pdf | 见标题 | 2026-11-21 | `policy-sources/2024-04-05-gr-fek-a49-2024-n5100.pdf`（sha256 `0cc59defe70fdc725028ec4520e68182dff84bd343ff3a07ecf8cf1ebf861d75`）；`policy-sources/2026-02-06-gr-fek-a17-2026-n5275.pdf`（sha256 `eff39df99fb9d8e66c335852b0f0e3906c988ddbef0e8e84c5d6e38d6997f3c5`）；`policy-sources/2026-06-11-gr-fek-a90-2026-n5307.pdf`（sha256 `27b3c693ae0db6cd43fcb308a06ba390c52e20adf4e64f957477ed3945b06f9a`） | archived |
| SRC-088 | LAW | Κώδικας Ελληνικής Ιθαγένειας（希腊国籍法典）άρθ. 5 的现行文本来源：ν. 3838/2010（ΦΕΚ Α' 49/24.03.2010，άρθ. 2 替换 άρθ. 5）、ν. 4531/2018（ΦΕΚ Α' 62/05.04.2018，άρθ. 31 παρ. 3 加入 12 年路径）、ν. 4674/2020（ΦΕΚ Α' 53/11.03.2020，άρθ. 94 重写 3 年类别） | https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2010/20100100049.pdf ；https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2018/20180100062.pdf ；https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2020/20200100053.pdf | 见标题 | 2026-11-21 | `policy-sources/2010-03-24-gr-fek-a49-2010-n3838.pdf`（sha256 `8c9c6f08c55ba50bc059695f1926d244f347134a82c78f4eed8bb58bea38a3fc`）；`policy-sources/2018-04-05-gr-fek-a62-2018-n4531.pdf`（sha256 `cdc3384ecce232839580139e3615e2afd9ff59767faf6a81a2e4f64f62e747d0`）；`policy-sources/2020-03-11-gr-fek-a53-2020-n4674.pdf`（sha256 `d1da943f93121e8308e6d1994b4915fbc689f66a954d36c5c45344145adfff33`） | archived |
| SRC-089 | GUIDANCE | 希腊内政部（ΥΠΕΣ）：国籍法典编纂版（截至 2025-09-17，卷首注明仅供参考、以 ΦΕΚ 为准）；《归化的形式与实质条件》（最后更新 2026-01-30） | https://www.ypes.gr/wp-content/uploads/2025/09/20250917-KEI-NOMOS.pdf ；https://www.ypes.gr/wp-content/uploads/2026/02/Proypotheseis20260130.pdf | 见标题 | 2026-11-21 | `policy-sources/2025-09-17-gr-ypes-kei-codified.pdf`（sha256 `a3545245db1a0da28df1947df945be3b6111dd3c74715fe7679e2e6a52b9fa23`）；`policy-sources/2026-01-30-gr-ypes-naturalisation-requirements.pdf`（sha256 `631f06cbd885f72599ae2886d878b50464c3c09126fbcf66d73f3ed655c8b9a0`） | archived |
| SRC-090 | LAW | Ley 39/2015（Procedimiento Administrativo Común，行政程序法），BOE 合并文本 PDF（Última actualización 2024-11-06，73 页）：art. 30 期间计算 | https://www.boe.es/buscar/pdf/2015/BOE-A-2015-10565-consolidado.pdf | 2024-11-06 | 2026-11-22 | `policy-sources/2024-11-06-es-boe-ley39-2015.pdf`（sha256 `f92d4402b820d2af2dcf115832706210e984a5946218bae4a66650a52271417c`） | archived |
| SRC-091 | LAW | Irish Nationality and Citizenship Act 1956（爱尔兰国籍与公民法）法律改革委员会（LRC）编纂版（Updated to 12 June 2026，页首注明截至 2026-11-11 已收录全部已知生效的修改；PDF 40 页）：s15 入籍条件、s15A 配偶与民事伴侣、s15C 连续居住期内的缺席、s16A 不计入的居住；irishstatutebook 立法目录（Updated to 11 November 2026）中该法的修改与生效记录 | https://revisedacts.lawreform.ie/eli/1956/act/26/revised/en/html ；https://revisedacts.lawreform.ie/eli/1956/act/26/revised/en/pdf?annotations=true ；https://www.irishstatutebook.ie/eli/isbc/1956_26.html | 2026-06-12 | 2026-11-22 | `policy-sources/2026-06-12-ie-ina-1956-revised.html`（sha256 `0b9d90ed1067671f54804440754fd6e796624c88ea1e712be4282938fcc17e6a`）；`policy-sources/2026-06-12-ie-ina-1956-revised.pdf`（sha256 `5380d1783acc3b4f4b4e5a6ad2f012038eb2f198edb57fb95ba363b807218000`）；`policy-sources/2026-11-22-ie-isb-directory-ina-1956.html`（sha256 `d536636453bf293892e4cf6fc31eb122c5178a930386bde57ee3d5d34541db60`） | archived |
| SRC-092 | LAW | Courts and Civil Law (Miscellaneous Provisions) Act 2023（No. 18 of 2023）s8：在 1956 年法插入 s15B–15E（含 s15C 缺席规则）；S.I. No. 389/2023 生效令（Part 2 自 2023-07-31 施行） | https://www.irishstatutebook.ie/eli/2023/act/18/section/8/enacted/en/html ；https://www.irishstatutebook.ie/eli/2023/si/389/made/en/pdf | 2023-07-05（法）；2023-07-28（生效令） | 2026-11-22 | `policy-sources/2023-07-05-ie-ccl-misc-act-2023-18-s8.html`（sha256 `fa288a81edeb8c75fe40279fb1a23d658faca205b7056e77ca19700727104fe0`）；`policy-sources/2023-07-28-ie-si-389-2023-commencement.pdf`（sha256 `28f3aea40387c5dd81c3c6c5b0afb380148c35836133ad8089f279237533494e`） | archived |
| SRC-093 | LAW | International Protection Act 2026（No. 9 of 2026）s295：给 1956 年法 s16A(1) 增加第 (d) 项不计入的期间；S.I. No. 244/2026 生效令（自 2026-06-12 施行） | https://www.irishstatutebook.ie/eli/2026/act/9/section/295/enacted/en/html ；https://www.irishstatutebook.ie/eli/2026/si/244/made/en/pdf | 2026-04-22（法）；2026-06-10（生效令） | 2026-11-22 | `policy-sources/2026-04-22-ie-ipa-2026-s295.html`（sha256 `82d8e5701d97683a5d87abe02bc13f3d51eab448dabb41c1e9bd1ed2187097bb`）；`policy-sources/2026-06-10-ie-si-244-2026-ipa-commencement.pdf`（sha256 `c7dc4a301c01ca57189778a5a78d404c674224964ef74b326ba26e00302cf751`） | archived |
| SRC-094 | LAW | Interpretation Act 2005（爱尔兰，No. 23 of 2005）原文 PDF（15 页）：s18(h) 期间的起止日、附表 Part 1 "month" 与 "year" 的定义 | https://www.irishstatutebook.ie/eli/2005/act/23/enacted/en/pdf | 2005-10-17 | 2026-11-22 | `policy-sources/2005-10-17-ie-interpretation-act-2005.pdf`（sha256 `f34058f992fc18b7c5ca9d0752140502717ee39884530caacc4adaef2a22bab9`） | archived |
| SRC-095 | GUIDANCE | 爱尔兰司法部移民服务署（ISD）：How to Become an Irish Citizen Guide（dateModified 2026-11-09）；Naturalisation Residency Calculator 页面（含 Guidelines，dateModified 2024-08-22）、计算器本体与逻辑脚本 global-new.js | https://www.irishimmigration.ie/how-to-become-an-irish-citizen-guide/ ；https://www.irishimmigration.ie/naturalisation-residency-calculator/ ；https://irishimmigration.ie/residency-calculator ；https://www.irishimmigration.ie/wp-content/calculator/global-new.js?OpenFileResource | 见标题 | 2026-11-22 | `policy-sources/2026-11-22-ie-isd-citizen-guide.html`（sha256 `813a65ad5e775b94decd7f2e5efc1910fe183250d59cf588f3fc893927693787`）；`policy-sources/2026-11-22-ie-isd-residency-calculator-page.html`（sha256 `70bb479a4623c1d66ed8f9c61d01a296fb254881c6aecf4041d6c041c10592a3`）；`policy-sources/2026-11-22-ie-isd-residency-calculator-app.html`（sha256 `fabc9b8410d927268d74d0fb1971752aa20128cfb47894b8b7312a416107d974`）；`policy-sources/2026-11-22-ie-isd-residency-calculator-global-new.js`（sha256 `a34215cd58255f5285b9d2c1f4f48ee85f6d1d84d0e237b4363d99ae54b070fb`） | archived |
| SRC-096 | GUIDANCE | ISD：Immigration permission/stamps（各类 Stamp 的条件与是否计入入籍，dateModified 2026-06-05）；Information on Stamp 4 upgrades for Employment Permit and Hosting Agreement holders（dateModified 2026-02-25）；Update to eligibility requirements for Stamp 4 upgrades（2024-04-03）；Attention eligible spouses and partners of General Employment Permit and Intra-Corporate Transferee Irish Employment Permit holders（2024-05-15）；Frequently asked questions for joining family（dateModified 2026-06-29）第 30 问 | https://www.irishimmigration.ie/registering-your-immigration-permission/information-on-registering/immigration-permission-stamps/ ；https://www.irishimmigration.ie/registering-your-immigration-permission/how-to-renew-your-current-permission/information-on-stamp-4-upgrades/ ；https://www.irishimmigration.ie/update-to-eligibility-requirements-for-stamp-4-upgrades/ ；https://www.irishimmigration.ie/attention-eligible-spouses-and-partners-of-general-employment-permit-and-intra-corporate-transferee-irish-employment-permit-holders/ ；https://www.irishimmigration.ie/coming-to-join-family-in-ireland/frequently-asked-questions-for-joining-family/ | 见标题 | 2026-11-22；通告与家庭团聚 FAQ 2026-11-23 | `policy-sources/2026-11-22-ie-isd-permission-stamps.html`（sha256 `eb3491c71ffe1a60c542b2459704f1ba8a3dba29ab26433649a1088860dd9ec5`）；`policy-sources/2026-11-22-ie-isd-stamp4-upgrades.html`（sha256 `d87a1b39526dd1e329f7d89558288355cb70aa6998f003508ec44bf5a8f77fcc`）；`policy-sources/2026-11-22-ie-isd-stamp4-upgrades-update-2024.html`（sha256 `da0ca662d70bfac8d19a1e2951411fb7518f399bc102d78c836b72697721d663`）；`policy-sources/2026-11-23-ie-isd-stamp1g-gep-ict-spouses-notice-2024.html`（sha256 `b798052e69f6552a634343aba3cbfde197a010d54b009d4d83761e949d6c2d77`）；`policy-sources/2026-11-23-ie-isd-joining-family-faq.html`（sha256 `e610bcd46ef33965f855a6b8414e8ed200e1b1efaa9de3fe791675b0343822c3`） | archived |
| SRC-097 | GUIDANCE | ISD：Without condition as to time（Stamp 5，dateModified 2026-07-27）；Stamp 5 申请表（editable，2026-02-23 版，PDF 12 页） | https://www.irishimmigration.ie/my-situation-has-changed-since-i-arrived-in-ireland/without-condition-as-to-time/ ；https://www.irishimmigration.ie/wp-content/uploads/2026/02/Without-Conditions-as-to-Time-Stamp-5-editable-23-02-2026.pdf | 2026-07-27；申请表 2026-02-23 | 2026-11-22；申请表 2026-11-23 | `policy-sources/2026-11-22-ie-isd-wcatt-stamp5.html`（sha256 `1b9d482396accddd7b67c5e7afe353f0e741a548c087368e4163286f9b2da4ca`）；`policy-sources/2026-02-23-ie-isd-wcatt-application-form.pdf`（sha256 `62fe594ff799e57c4cc4ba4052e6cc3f045be71cb204a66eace0a3adc3c6d58b`） | archived |
| SRC-098 | POLICY | General Scheme of the Irish Nationality and Citizenship (Amendment) Bill 2026（修法草案，22 页，2026-09-21 公布）与 gov.ie 发布页；政府批准优先起草的新闻稿（2026-09-09）；Oireachtas 新闻稿（2026-11-19 Joint Committee 开始立法前审查）。尚未作为 Bill 提交，不是现行法 | https://assets.gov.ie/static/documents/cadca21c/General_Scheme_of_the_Irish_Nationality_and_Citizenship_Amendment_Bill_2026.pdf ；https://www.gov.ie/en/department-of-justice-home-affairs-and-migration/publications/general-scheme-of-the-irish-nationality-and-citizenship-amendment-bill-2026/ ；https://www.gov.ie/en/department-of-justice-home-affairs-and-migration/press-releases/government-approval-secured-for-the-priority-drafting-of-the-irish-nationality-and-citizenship-amendment-bill-2026/ ；https://www.oireachtas.ie/en/press-centre/press-releases/20261119-joint-committee-on-justice-home-affairs-and-migration-to-meet-for-pre-legislative-scrutiny-of-the-general-scheme-of-the-irish-nationality-and-citizenship-amendment-bill-2026/ | 见标题 | 2026-11-22 | `policy-sources/2026-09-21-ie-general-scheme-ina-amendment-bill-2026.pdf`（sha256 `b70f57644046313290dabcc64651132d99c216c0726caf4c25f8601f0d9dd9ea`）；`policy-sources/2026-11-22-ie-govie-general-scheme-page.html`（sha256 `730d3d8fa72f4da717293137542c68ae810e4468704ba68385a4dae436c1547b`）；`policy-sources/2026-11-22-ie-govie-pr-ina-amendment-bill-2026.html`（sha256 `36c32ab741c7917a46bb1575462fac6955c32bd12bd45f240b5510c5f88acb67`）；`policy-sources/2026-11-22-ie-oireachtas-pls-ina-bill-2026.html`（sha256 `2aefb942eaf4974f02c5f5d047a65e27d9d54bd4516d1c74c055de2bb23b9e86`） | archived |
| SRC-100 | LAW | Aufenthaltsgesetz（AufenthG，德国居留法），gesetze-im-internet 现行汇编（BMJ 与 juris 发布，非约束性文本；Stand：zuletzt geändert durch Art. 5 G v. 22.10.2026, BGBl. 2026 I Nr. 318）：§ 9 定居许可、§§ 9a、9b 欧盟长期居留、§ 18c 技术工人与欧盟蓝卡定居、§ 26 Abs. 3 难民定居、§ 28 Abs. 2 德国人家属定居、§ 51 居留失效 | https://www.gesetze-im-internet.de/aufenthg_2004/BJNR195010004.html | 2026-10-22（最近修改法签署日） | 2026-11-22 | `policy-sources/2026-11-22-de-aufenthg-full.html`（sha256 `6f09b146a5c55050af4751504572e4397c5a041efc2435c8302242036533d92a`） | archived |
| SRC-101 | LAW | Staatsangehörigkeitsgesetz（StAG，德国国籍法），gesetze-im-internet 现行汇编（Stand：Zuletzt geändert durch Art. 3 G v. 21.7.2026, BGBl. 2026 I Nr. 221）：§ 9 德国人配偶入籍、§ 10 一般入籍（Abs. 3 已删除）、§ 12b 居住中断、§ 40a 过渡规定 | https://www.gesetze-im-internet.de/stag/BJNR005830913.html | 2026-07-21（最近修改法签署日） | 2026-11-22 | `policy-sources/2026-11-22-de-stag-full.html`（sha256 `5539ac4ccb8cac6ac615d677c492c5d98a0e4edd6d0c98e27d40ce184bf31156`） | archived |
| SRC-102 | LAW | 德国期间计算：BGB § 187 Fristbeginn、§ 188 Fristende、§ 191 Berechnung von Zeiträumen；VwVfG § 31 Fristen und Termine（gesetze-im-internet 单条页面） | https://www.gesetze-im-internet.de/bgb/__187.html ；https://www.gesetze-im-internet.de/bgb/__188.html ；https://www.gesetze-im-internet.de/bgb/__191.html ；https://www.gesetze-im-internet.de/vwvfg/__31.html | —（单条页面无版本日） | 2026-11-22 | `policy-sources/2026-11-22-de-bgb-187.html`（sha256 `8a1f3c70ceb349b44b3f995bf7d3ffc26d7a2b512ea77c384eb87c44cd961369`）；`policy-sources/2026-11-22-de-bgb-188.html`（sha256 `b80b9e0feb801a7e7b984b5294e37bba247080a1122b7af59d4dab21ebbd807e`）；`policy-sources/2026-11-22-de-bgb-191.html`（sha256 `30e5ed07deb62753f108e27c6a5bfecc90f01c3bc28704b833c9c15a38fb0538`）；`policy-sources/2026-11-22-de-vwvfg-31.html`（sha256 `80c85b5876c22e6aa1a19ecfa943a00a281f05336e148fe95a4201ff4e278345`） | archived |
| SRC-103 | LAW | Asylgesetz § 55 Aufenthaltsgestattung（gesetze-im-internet 单条页面，GEAS 改造后的现行文本）：Abs. 3 庇护程序期间只在获承认或获国际保护后计入 | https://www.gesetze-im-internet.de/asylvfg_1992/__55.html | —（单条页面无版本日） | 2026-11-22 | `policy-sources/2026-11-22-de-asylg-55.html`（sha256 `88da857fd21bb069fbf953d6b2d48c828a43ab8e89589ac5e15641dd3d0286fc`） | archived |
| SRC-104 | LAW | 取消 3 年快速入籍：已公布法令 BGBl. 2025 I Nr. 256（Gesetz zur Änderung des Staatsangehörigkeitsgesetzes sowie weiterer Vorschriften，2025-10-27 签署、2025-10-29 公布，本次已补入公报原文）；议会草案 BT-Drs. 21/537（政府草案及理由）；BMI 立法程序页（进度与公布日）；部长讲话 Bulletin Nr. 89-5（内政部长 2025-10-08 在联邦议院，只作背景） | https://dserver.bundestag.de/btd/21/005/2100537.pdf ；https://www.bmi.bund.de/SharedDocs/gesetzgebungsverfahren/DE/VII5/gesetz-6-aenderung-des-staatsangehoerigkeitsrechts.html ；https://www.bundesregierung.de/resource/blob/975954/2388128/f26afadd67ac33455496c4e532b4afcc/89-5-bmi-aenderung-staatsangehoerigeitsrecht-bt-data.pdf?download=1 ；https://www.recht.bund.de/bgbl/1/2025/256/VO.html （入口页未单独存档） ；https://www.recht.bund.de/bgbl/1/2025/256/regelungstext.pdf?__blob=publicationFile&v=3 | 2025-06-23；2025-10-08；公布 2025-10-29 | 2026-11-22；公报原文 2026-11-23 | `policy-sources/2025-06-23-de-bt-drs-21-537-stag-entwurf.pdf`（sha256 `98fa18c46c5ef381e7178af5f54ab8350b4302315edbbdb0d864fe6d8808af54`）；`policy-sources/2026-11-22-de-bmi-gesetzgebung-stag-2025.html`（sha256 `45022a73049f34c6f906dd0cfe0a3909dda6db58de0e6fc2e64a02eae99364dd`）；`policy-sources/2025-10-08-de-breg-bulletin-89-5-stag.pdf`（sha256 `69e1db0aad2a36560df46040295f11ca8dcea0ca3242a7af276e6c3cd4e73ba4`）；`policy-sources/2026-11-23-de-bundesgesetzblatt-2025-256.pdf`（sha256 `4cc6e0230eb43983978d74f57dd246aaca97fcdb778d84d6219961b464c4d00c`） | archived |
| SRC-105 | LAW | 国籍法现代化法（StARModG）：已公布法令 BGBl. 2024 I Nr. 104（2024-06-27 施行，本次已补入公报原文）；议会草案 BT-Drs. 20/9044（政府草案，含 § 12b 修改理由） | https://dserver.bundestag.de/btd/20/090/2009044.pdf ；https://www.recht.bund.de/bgbl/1/2024/104/VO.html （入口页未单独存档） ；https://www.recht.bund.de/bgbl/1/2024/104/regelungstext.pdf?__blob=publicationFile | 2023-11-01 | 2026-11-22；公报原文 2026-11-23 | `policy-sources/2023-11-01-de-bt-drs-20-9044-starmodg-entwurf.pdf`（sha256 `db7fdf4bd2a95fe83473a9668b508f72232c0dc838c3401fec8b5c5b4315a30d`）；`policy-sources/2026-11-23-de-bundesgesetzblatt-2024-104.pdf`（sha256 `f83b710a968ef811c12aa65355094377f0e18d77d816ac1e4ef187a1caffe050`） | archived |
| SRC-106 | GUIDANCE | BMI《Anwendungshinweise zum Staatsangehörigkeitsgesetz》（AH-StAG 2025，Stand 1. Mai 2025，146 页；早于 § 10 Abs. 3 删除） | https://www.bmi.bund.de/SharedDocs/downloads/DE/veroeffentlichungen/themen/verfassung/staatsangehoerigkeit/2505_anwendungshinweise-staatsangehoerigkeit.pdf?__blob=publicationFile&v=6 | 2025-05-01 | 2026-11-22 | `policy-sources/2025-05-01-de-bmi-anwendungshinweise-stag.pdf`（sha256 `95dc87965f3c604f1e00c18bb3d531fef4d293e366ca1096a486a6f227a4ecd6`） | archived |
| SRC-107 | GUIDANCE | BMI《Anwendungshinweise zum Fachkräfteeinwanderungsgesetz》更新版（按 2024-06-01 起的法律状态，277 页） | https://www.bmi.bund.de/SharedDocs/downloads/DE/veroeffentlichungen/themen/migration/anwendungshinweise-fachkraefteeinwanderungsgesetz.pdf?__blob=publicationFile&v=5 | 2024-05-28（PDF 生成日） | 2026-11-22 | `policy-sources/2024-05-28-de-bmi-anwendungshinweise-feg.pdf`（sha256 `c5ae086f09bab3d3972f53cc3fc70ad1c30f868dfbeb6dd6a86e96e90b7d49df`） | archived |
| SRC-108 | GUIDANCE | Allgemeine Verwaltungsvorschrift zum Aufenthaltsgesetz（AVwV-AufenthG，2009-10-26，GMBl 2009 Nr. 42–61，390 页；条文编号按 2009 年版，部分过时） | https://www.verwaltungsvorschriften-im-internet.de/pdf/BMI-MI3-20091026-SF-A001.pdf | 2009-10-26 | 2026-11-22 | `policy-sources/2009-10-26-de-avwv-aufenthg.pdf`（sha256 `c6e02d7c930e6a2492370f2a1a367bb6fddfb9104eec6af426fd9baf730b2777`） | archived |
| SRC-109 | GUIDANCE | BAMF 页面：In Deutschland niederlassen；Einbürgerung；Die Blaue Karte EU（页面标注 18.11.2023） | https://www.bamf.de/DE/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/Migrathek/Niederlassen/niederlassen-node.html ；https://www.bamf.de/DE/Themen/Integration/ZugewanderteTeilnehmende/Einbuergerung/einbuergerung-node.html ；https://www.bamf.de/DE/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/Migrathek/BlaueKarteEU/blauekarteeu-node.html | 见标题 | 2026-11-22 | `policy-sources/2026-11-22-de-bamf-niederlassen.html`（sha256 `0dc72a37a100de4377dc15cfbdf19f4377be67b9734c6806d8b5372c708f187c`）；`policy-sources/2026-11-22-de-bamf-einbuergerung.html`（sha256 `d00ce9603e516dd06cf981979829aedb65273a1c2f8bf0356b445cc568edb2b9`）；`policy-sources/2026-11-22-de-bamf-blaue-karte.html`（sha256 `f635302a87360ca10bed7ac6ee72a67df142d54a470bffe41efa7b8d33cafe83`） | archived |
| SRC-110 | LAW | 出入国管理及び難民認定法（昭和26年政令第319号，入管法），e-Gov 法令 API 现行版（2026-10-01 施行，revision 326CO0000000319_20261001_508AC0000000032）：第22条 永住許可、第26条 再入国許可、第26条の2 みなし再入国許可 | https://laws.e-gov.go.jp/api/2/law_data/326CO0000000319?response_format=xml&law_full_text_format=xml （法令页面：https://laws.e-gov.go.jp/law/326CO0000000319 ） | 2026-10-01 | 2026-11-22 | `policy-sources/2026-10-01-jp-egov-nyukanho-current.xml`（sha256 `2991b8708d37e94ea579352dcc61c30619bc272a3b2790916cfb942331379d98`） | archived |
| SRC-111 | LAW | 国籍法（昭和25年法律第147号），e-Gov 法令 API 现行版（2025-06-01 施行，revision 325AC0000000147_20250601_504AC0000000068，无未施行修订）：第5条 一般帰化、第7条 日本国民の配偶者、第10条 効力 | https://laws.e-gov.go.jp/api/2/law_data/325AC0000000147?response_format=xml&law_full_text_format=xml （法令页面：https://laws.e-gov.go.jp/law/325AC0000000147 ） | 2025-06-01 | 2026-11-22 | `policy-sources/2025-06-01-jp-egov-kokusekiho-current.xml`（sha256 `8352a646463941948557fbaf3078826c532733546d35d014070f136bcd67e9ee`） | archived |
| SRC-112 | LAW | 日本的期间、年龄与行政机关休日：民法（明治29年法律第89号）现行版（2026-06-24 施行，revision 129AC0000000089_20260624_508AC0000000045）第138–143条 期間の計算；年齢計算ニ関スル法律（明治35年法律第50号）；行政機関の休日に関する法律（昭和63年法律第91号）第1–2条；国民の祝日に関する法律（昭和23年法律第178号）第2–3条；国立天文台暦計算室 暦要項「国民の祝日」2019–2027 年（各年前一年 2 月发表，2019–2021 年按特别法改订）；国立天文台 FAQ「何年後かの春分の日・秋分の日はわかるの？」（2020–2050 年春分日、秋分日的计算预测） | https://laws.e-gov.go.jp/api/2/law_data/129AC0000000089?response_format=xml&law_full_text_format=xml ；https://laws.e-gov.go.jp/api/2/law_data/135AC1000000050?response_format=xml&law_full_text_format=xml ；https://laws.e-gov.go.jp/api/2/law_data/363AC0000000091?response_format=xml&law_full_text_format=xml ；https://laws.e-gov.go.jp/api/2/law_data/323AC1000000178?response_format=xml&law_full_text_format=xml ；https://eco.mtk.nao.ac.jp/koyomi/yoko/2025/rekiyou251.html ；https://eco.mtk.nao.ac.jp/koyomi/yoko/2026/rekiyou261.html ；https://eco.mtk.nao.ac.jp/koyomi/yoko/2027/rekiyou271.html ；https://eco.mtk.nao.ac.jp/koyomi/yoko/2022/rekiyou221.html ；https://eco.mtk.nao.ac.jp/koyomi/yoko/2023/rekiyou231.html ；https://eco.mtk.nao.ac.jp/koyomi/yoko/2024/rekiyou241.html ；https://www.nao.ac.jp/faq/a0301.html ；https://eco.mtk.nao.ac.jp/koyomi/yoko/2019/rekiyou191.html ；https://eco.mtk.nao.ac.jp/koyomi/yoko/2020/rekiyou201.html ；https://eco.mtk.nao.ac.jp/koyomi/yoko/2021/rekiyou211.html （法令页面：https://laws.e-gov.go.jp/law/129AC0000000089 ；https://laws.e-gov.go.jp/law/135AC1000000050 ；https://laws.e-gov.go.jp/law/363AC0000000091 ；https://laws.e-gov.go.jp/law/323AC1000000178 ） | 民法 2026-06-24；年齢計算 1902-12-22；休日法 1992-05-01；祝日法 2020-01-01；暦要項 2021-02-01、2022-02-01、2023-02-01、2024-02-01、2025-02-03、2026-02-02；FAQ 无日期；暦要項 2019、2020 改订 2019-04-01，2021 改订 2020-12-04 | 2026-11-22（休日法、祝日法、暦要項、FAQ 2026-11-23） | `policy-sources/2026-06-24-jp-egov-minpo-current.xml`（sha256 `3592e3eee095f23d9e7ea8b9c2cb6fc29bb3c8fad6f9e785a92d170cc8f2c9ce`）；`policy-sources/1902-12-22-jp-egov-nenrei-keisan-ho.xml`（sha256 `60b074357e0090bdb586affe1287dffafe94f0bf2c5ab07bd20992c07cae79b6`）；`policy-sources/1992-05-01-jp-egov-gyosei-kyujitsu-ho.xml`（sha256 `13ece711a44096fe2f5b3dfa0030482d9a224e5193bed02ba74f095a71f13f5f`）；`policy-sources/2020-01-01-jp-egov-shukujitsu-ho.xml`（sha256 `d640adc9123c00b4d7029c901892cd4a3dc316474a3e4a15d900f8d39f62a69f`）；`policy-sources/2024-02-01-jp-naoj-rekiyou-2025.html`（sha256 `9a581f3df83e346b3fde114225acd10205d41493ce10835c24459f8a28390012`）；`policy-sources/2025-02-03-jp-naoj-rekiyou-2026.html`（sha256 `c68075b1fbaa14e5e0c97d253bc692e7d7739c8cbf57ec710d8f697d48d8c19d`）；`policy-sources/2026-02-02-jp-naoj-rekiyou-2027.html`（sha256 `37e0a0a1dc54e32b926c7a9f07c96a9804d2406a96613f992bb247c86ee93e35`）；`policy-sources/2021-02-01-jp-naoj-rekiyou-2022.html`（sha256 `5810219a6cf7c1da82ff40addb38657559505f688b88d70423921ce1f24052c8`）；`policy-sources/2022-02-01-jp-naoj-rekiyou-2023.html`（sha256 `f6c2ab031542f74fa78be1160657395c25bf871e2ead2327de8a0e4a6861b0ea`）；`policy-sources/2023-02-01-jp-naoj-rekiyou-2024.html`（sha256 `90ab3724734e8da2ccf152b12e81c223ba39cb286e1cd2371e46c44d83993d4d`）；`policy-sources/2026-11-23-jp-naoj-future-equinox.html`（sha256 `078ceb9a5e11c0501aae9563e2914626efbb629f52fe4b9a5cc878583819a703`）；`policy-sources/2019-04-01-jp-naoj-rekiyou-2019.html`（sha256 `624049bd685885d91b0236d5299c07d59f44612556a677545404bccfbc8cf648`）；`policy-sources/2019-04-01-jp-naoj-rekiyou-2020.html`（sha256 `8f7b547c32711058fd39ab634606b9b05dfc09188e8bdc7c443787e82563a110`）；`policy-sources/2020-12-04-jp-naoj-rekiyou-2021.html`（sha256 `97d56fe1984179314db70077347578b6b5f16f013255169bdbaee9eba323f328`） | archived |
| SRC-113 | GUIDANCE | 出入国在留管理庁「永住許可に関するガイドライン（令和８年２月２４日改訂）」：2027-03-31 前递交的永住申请适用 | https://www.moj.go.jp/isa/applications/resources/nyukan_nyukan50.html | 2026-02-24 | 2026-11-22 | `policy-sources/2026-02-24-jp-isa-pr-guideline-r8-02-24.html`（sha256 `dc651b474cd821ff7698540c89ede0fcf2e0cc8d340535e6becae081a873f198`） | archived |
| SRC-114 | GUIDANCE | 出入国在留管理庁「永住許可に関するガイドライン（令和８年１０月１日改定）」HTML 与 PDF（13 页），2027-04-01 起递交的申请适用；「永住許可（入管法第22条）」页的【お知らせ】ガイドラインの適用について（令和８年１０月１日掲載） | https://www.moj.go.jp/isa/10_00279.html ；https://www.moj.go.jp/isa/content/001471577.pdf ；https://www.moj.go.jp/isa/applications/procedures/eizyuu_00001.html | 2026-10-01 | 2026-11-22 | `policy-sources/2026-10-01-jp-isa-pr-guideline-r8-10-01.html`（sha256 `46b260c118336e4c87430923455d86e0af1d42d0437816bfebafbe8afa41f3bf`）；`policy-sources/2026-10-01-jp-isa-pr-guideline-r8-10-01.pdf`（sha256 `709e0683c827dfd973f368765e81e2d4018699761b9e831effc53e5de84411c1`）；`policy-sources/2026-10-01-jp-isa-pr-guideline-application-notice.html`（sha256 `d03f3c6b433e020258abea81ed69cc2d9d6babe3e306831fb34fcb6bb79917f9`） | archived |
| SRC-115 | GUIDANCE | e-Gov パブリック・コメント「永住許可に関するガイドライン案改定に係る意見募集の結果」（案件番号 315000140）別紙：意見の概要と出入国在留管理庁の考え方（PDF 8 页） | https://public-comment.e-gov.go.jp/pcm/download?seqNo=0000321729 （案件页面：https://public-comment.e-gov.go.jp/pcm/1040?CLASSNAME=PCM1040&id=315000140&Mode=1 ） | 2026-10-01 | 2026-11-22 | `policy-sources/2026-10-01-jp-egov-pcm-pr-guideline-annex.pdf`（sha256 `63b0cba5f38bf04f9979fb3bee382d004b55243c529c4bff3de2c1b41537edf5`） | archived |
| SRC-116 | GUIDANCE | 出入国在留管理庁：「再入国許可（入管法第26条）」与「みなし再入国許可（入管法第26条の2）」说明页；「『永住許可に関するガイドライン』における『継続在留要件』の取扱いについて」（令和2年8月5日，令和4年10月7日更新）；法務省入国管理局「永住者の在留資格について」（平成30年9月，7 页）；出入国在留管理庁「出入国審査・在留審査Q&A」（Q61 更新申请中的再入国） | https://www.moj.go.jp/isa/immigration/procedures/sainyukoku_00002.html ；https://www.moj.go.jp/isa/immigration/procedures/minashisainyukoku_00001.html ；https://www.moj.go.jp/isa/content/930006016.pdf ；https://www.moj.go.jp/isa/content/930003741.pdf ；https://www.moj.go.jp/isa/immigration/faq/kanri_qa.html | 说明页与 Q&A 无日期；继续在留 2022-10-07；永住者 2018-09 | 2026-11-22（Q&A 2026-11-23） | `policy-sources/2026-11-22-jp-isa-reentry.html`（sha256 `b7df131165226b0ed09d3c13e5695269705df909907a421e85d323a0ce3d016b`）；`policy-sources/2026-11-22-jp-isa-minashi-reentry.html`（sha256 `4662997bea8003b5a79ef9dc5be0f80a9243efd2deb9b5ef0ce9541d56dc96f9`）；`policy-sources/2022-10-07-jp-isa-pr-continuity-covid-notice.pdf`（sha256 `90af7dd784b23a3c4e6be04f0d6280fc5871e6f200670c370881198ad1a7dd84`）；`policy-sources/2018-09-14-jp-moj-pr-status-overview.pdf`（sha256 `3c014419995f91f47e407c43d8f6bb9e8b6e1602f95e5133545aed2026f148b3`）；`policy-sources/2026-11-23-jp-isa-immigration-qa.html`（sha256 `d6691467c7467fe4c477dcec15e38fbd74706011a2f95c92120436c6030b9810`） | archived |
| SRC-117 | GUIDANCE | 法務省民事局「国籍Q&A」（Q9 帰化の条件）；法務省リーフレット「帰化による日本国籍の取得」（2 页，无日期） | https://www.moj.go.jp/MINJI/minji78.html ；https://www.moj.go.jp/content/001459013.pdf | Q&A 页无日期；リーフレット无日期 | 2026-11-22 | `policy-sources/2026-11-22-jp-moj-nationality-qa.html`（sha256 `fb224a19a5cfec24f22efe59adc22efbf33d5eaf4662f544b7cff15d86b43af0`）；`policy-sources/2026-11-22-jp-moj-kika-leaflet.pdf`（sha256 `2ba4e6e1236c908db8ee58d234b44d720717335549a1b4b36d25d313fb76fb78`） | archived |
| SRC-118 | POLICY | 帰化审查运用的变更（2026-04-01 起原则 10 年在留）：法務大臣閣議後記者会見の概要（令和8年3月27日）；参議院 答弁書（内閣参質二二一第九一号，2026-07-28）；参議院法務委員会第4号（2026-04-14）政府参考人发言 No.120（国会会議録検索システム API） | https://www.moj.go.jp/hisho/kouhou/hisho08_00706.html ；https://www.sangiin.go.jp/japanese/joho1/kousei/syuisyo/221/touh/t221091.htm ；https://kokkai.ndl.go.jp/api/speech?issueID=122115206X00420260414&speechNumber=120&recordPacking=json | 2026-03-27；2026-07-28；2026-04-14 | 2026-11-22 | `policy-sources/2026-03-27-jp-moj-minister-press-kika.html`（sha256 `75c35583e267513f6f4a163374645767b5db3705ed0688316724c04b96bbb21f`）；`policy-sources/2026-07-28-jp-sangiin-answer-221-91-kika.htm`（sha256 `1e594bd61ee39aee6a92daa3f288c9c4cbf56807ef797676f1ca79c079331318`）；`policy-sources/2026-04-14-jp-ndl-sangiin-homu-speech120.json`（sha256 `1770a0a52210ccb542e84e210c6c4f705928ffcc73c2c422cf8e1c923f9f054c`） | archived |
| SRC-119 | GUIDANCE | 出入国在留管理庁「永住許可申請」手续页（手続根拠、申請期間、申請提出者、受付時間、手数料、標準処理期間）；在留申請オンラインシステム「オンラインで申請可能な申請種別及び在留資格（対象範囲）」（2026-01-05 時点，3 页） | https://www.moj.go.jp/isa/applications/procedures/16-4.html ；https://www.moj.go.jp/isa/content/001351658.pdf | 页面无日期；对象范围 2026-01-05 | 2026-11-22（对象范围 2026-11-23） | `policy-sources/2026-11-22-jp-isa-pr-application-page.html`（sha256 `bb207e27e84ea3b6c0d596516d3e9c73d258b4a054a38f6de6b60de662e0b7ff`）；`policy-sources/2026-01-05-jp-isa-online-scope.pdf`（sha256 `b5e5d38f577f0eec672e75454727c3fb3057187d4ea7b4a6af67cdac2416c1b1`） | archived |
| SRC-120 | LAW | Lei Orgânica n.º 1/2026（2026-05-18 公布、05-19 施行，修改 Lei 37/81 国籍法并在附件全文重新公布；DR 1.ª série n.º 95/2026，19 页）；同日 Declaração de Retificação n.º 17/2026/1（只更正第 6 条第 11 款）：art. 6 入籍年限、art. 15 合法居留与区间、LO 第 5 条废止旧 art. 15 n.º 4、第 7 条在审程序适用旧法、第 8 条施行日 | https://files.diariodarepublica.pt/1s/2026/05/09500/0000200020.pdf ；https://files.diariodarepublica.pt/1s/2026/05/09500/0002100021.pdf | 2026-05-18 | 2026-11-22 | `policy-sources/2026-05-18-pt-lo-1-2026-dr95.pdf`（sha256 `888ab695663747cedf12b6fba5f3203893339a1288910862b5c22fcebbba5edb`）；`policy-sources/2026-05-18-pt-dr-retificacao-17-2026.pdf`（sha256 `bc938042d022cdbdf8f7df7e31bfe23ce0ecfa35a8601ad99bcfd1df9704057a`） | archived |
| SRC-121 | LAW | Lei Orgânica n.º 1/2024（2024-04-01 施行，第 10 次修改 Lei 37/81 并全文重新公布；DR 1.ª série n.º 46/2024，18 页）：2026-05-19 仍在审理的入籍申请适用的旧法文本（5 年、15 年区间、自申请居留许可之日起算） | https://files.diariodarepublica.pt/1s/2024/03/04600/0000200019.pdf | 2024-03-05 | 2026-11-22 | `policy-sources/2024-03-05-pt-lo-1-2024-dr46.pdf`（sha256 `480af017a03ea63f00b085864ed111f4cb2abd9e035c6aabd045ae6a120a4786`） | archived |
| SRC-122 | LAW | 宪法法院 Acórdão n.º 1133/2025（对国籍法修改法令 Decreto 17/XVII 的预防性审查）：废止旧 art. 15 n.º 4 合宪，取得居留证件即开始计算 | https://www.tribunalconstitucional.pt/tc/acordaos/20251133.html | 2025-12-15 | 2026-11-22 | `policy-sources/2025-12-15-pt-tc-acordao-1133-2025.html`（sha256 `64790a2c7d695a93ebe722dce22f2f13bbe7551aff888a47f37f5dee9f8a037b`） | archived |
| SRC-123 | LAW | Lei n.º 23/2007（外国人入境、居留法）：Lei n.º 18/2022 附件全文重新公布（DR 164/2022，136 页）及其后修改 Lei n.º 56/2023、Lei n.º 9/2025、Lei n.º 61/2025、Lei n.º 62/2026（2026-09-11 施行）：art. 3 定义、74–80 居留许可与永久居留、85 注销、90-A 黄金签证（ARI）、125–126、131 欧盟长期居民 | https://files.diariodarepublica.pt/1s/2022/08/16400/0000200137.pdf ；https://files.diariodarepublica.pt/1s/2023/10/19400/0000200050.pdf ；https://files.diariodarepublica.pt/1s/2025/02/03100/0000600014.pdf ；https://files.diariodarepublica.pt/1s/2025/10/20400/0000900017.pdf ；https://files.diariodarepublica.pt/1s/2026/09/17600/0006000111.pdf | 见标题 | 2026-11-22 | `policy-sources/2022-08-25-pt-lei-18-2022-dr164.pdf`（sha256 `9ebf2755905e9bef5a438edc8e69660189b064c53ee177129796a83b4e63ca2a`）；`policy-sources/2023-10-06-pt-lei-56-2023-dr194.pdf`（sha256 `c96d87415f71fce5e8ab29bfd246928c63824932b584656dd43c83582b30c4d3`）；`policy-sources/2025-02-13-pt-lei-9-2025-dr31.pdf`（sha256 `6e88f32f41e8c1bc7cdaae3189487b7d3965de0a4df00f60b5c023f903223e0a`）；`policy-sources/2025-10-22-pt-lei-61-2025-dr204.pdf`（sha256 `58297d7ff24defc529a9e754c732aa0373660f031a6aa8376e1fe6882300fdd5`）；`policy-sources/2026-09-10-pt-lei-62-2026-dr176.pdf`（sha256 `3fe455addb53dbe742e0d92ad08db0f7752fc84c3ea004f222cea41c21337a28`） | archived |
| SRC-124 | LAW | Decreto Regulamentar n.º 15-A/2015（向 Decreto Regulamentar 84/2007 增设第 65-A 至 65-J 条并全文重新公布；DR 171/2015 1.º suplemento，37 页）：art. 65-B 投资维持期起算、art. 65-C 黄金签证最低停留 | https://files.diariodarepublica.pt/1s/2015/09/17101/0000200038.pdf | 2015-09-02 | 2026-11-22 | `policy-sources/2015-09-02-pt-dr-15-a-2015-dr171.pdf`（sha256 `4587bbe827ea10af5a9b44b46ab21416834e57f2616bfd759da6160af99f1118`） | archived |
| SRC-125 | GUIDANCE | 里斯本检察院（PGD Lisboa）编纂版（非官方公报文本，仅交叉核对）：Decreto Regulamentar 84/2007（列至 DR 1/2024）art. 63 续期；Código Civil art. 279、296 期间计算 | https://www.pgdlisboa.pt/leis/lei_print_articulado.php?nid=940&tabela=leis ；https://www.pgdlisboa.pt/leis/lei_print_articulado.php?nid=775&tabela=leis | 见标题 | 2026-11-22 | `policy-sources/2026-11-22-pt-pgdlisboa-dr-84-2007-consolidado.html`（sha256 `8c0509aba4b9cf5f98fcb0f0f39742d91917e6500626ddd2302cd4a5f6a1f49f`）；`policy-sources/2026-11-22-pt-pgdlisboa-codigo-civil.html`（sha256 `1134e2bc2feb5ca33aaafd4e7f6c34d55b847ec3f389d8ea9cc1c7613eeaf538`） | archived |
| SRC-126 | GUIDANCE | AIMA（移民与庇护署）页面：投资居留许可 ARI（art. 90-A）、永久居留（art. 80）、欧盟长期居民 ERLD（art. 125）；《Esclarecimento: Direito de Residência》（2025-10-17） | https://aima.gov.pt/pt/viver/autorizacao-de-residencia-para-investimento-art-90-o-a ；https://aima.gov.pt/pt/viver/autorizacao-de-residencia-permanente-art-80-o ；https://aima.gov.pt/pt/viver/aquisicao-do-estatuto-de-residente-de-longa-duracao-erld-art-125-o ；https://aima.gov.pt/pt/noticias/direito-de-residencia | 见标题 | 2026-11-22 | `policy-sources/2026-11-22-pt-aima-ari-art-90-a.html`（sha256 `759f939a21c33b9a228b1f85146c37b65db06127d8f3c6378474fd9465197d37`）；`policy-sources/2026-11-22-pt-aima-ar-permanente-art-80.html`（sha256 `739864b9a7789f04abe2502b87d991cd6b89bee22b381518a73a0aa6a8ad04ef`）；`policy-sources/2026-11-22-pt-aima-erld-art-125.html`（sha256 `188f74257278bb429fe5977e8ee73c6fddeb3c7fc966f0ab1756ad553c4f9f5e`）；`policy-sources/2025-10-17-pt-aima-direito-de-residencia.html`（sha256 `93937c52620f1a21cf5acce152f5850131b5483b073ef67ed4d9dd07785cb036`） | archived |
| SRC-127 | GUIDANCE | 葡萄牙政府关于新国籍法的说明：司法部新闻《Lei da Nacionalidade: novas regras entram em vigor a 19 de maio》（2026-05-19）；司法部入籍指南《Reside legalmente em Portugal há pelo menos 5 anos》（2026-11-22 抓取，仍按旧法写 5 年，已过时）；部长会议公报（2026-10-29，第 2 项通过国籍条例 Decreto-Lei） | https://justica.gov.pt/Noticias/Lei-da-Nacionalidade-novas-regras-entram-em-vigor-a-19-de-maio ；https://justica.gov.pt/Como-obter-nacionalidade-portuguesa/Reside-legalmente-em-Portugal-ha-pelo-menos-5-anos ；https://www.portugal.gov.pt/pt/gc25/governo/comunicados-do-conselho-de-ministros/comunicado-do-conselho-de-ministros-de-29-de-outubro-de-2026 | 见标题 | 2026-11-22 | `policy-sources/2026-05-19-pt-justica-noticia-lei-nacionalidade.html`（sha256 `667814f2bcfdc424689f8bd24dcf4378abfdd7124d8f2402a30116a395183c4a`）；`policy-sources/2026-11-22-pt-justica-guia-reside-5-anos.html`（sha256 `1eb2c2027170a3a4f7d5f4458e08e7ac42096c08fb12b3220d3e4708cfc702d4`）；`policy-sources/2026-10-29-pt-gov-comunicado-cm.html`（sha256 `7e5d433eed2dba88a608d27a9712b2966e14637a3f0601e31e50ddd8fffd2f1e`） | archived |
| SRC-410 | LAW | Aufenthaltsverordnung（签发、处理、证件收费及境内申请） | https://www.gesetze-im-internet.de/aufenthv/BJNR294510004.html | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-aufenthv.html`（sha256 `f59699a4f234c135525b15508d7a738fbd2b96ce203f04f4dde6aff3b43c9368`） | archived |
| SRC-411 | LAW | Einbürgerungstestverordnung 与联邦政府入籍收费答复 | https://dserver.bundestag.de/btd/20/085/2008575.pdf ；https://www.gesetze-im-internet.de/einbtestv/__5.html ；https://www.gesetze-im-internet.de/einbtestv/BJNR164900008.html | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-bt-20-8575.pdf`（sha256 `2bd51091715fa45310d04d7b2ae0c1b8bc9d1ba891d3262f96a60788c8b415c0`）；`policy-sources/2026-11-23-de-einbtestv-5.html`（sha256 `a4a2765e8c04f1f06c1953a4f16f99530044d87b82b4be8258e48b9979a2e701`）；`policy-sources/2026-11-23-de-einbtestv.html`（sha256 `2d4c0751f052c46beb5de29ae17f700018b88c7bae46de921693da5ee2852e09`） | archived |
| SRC-412 | LAW | Integrationskursverordnung（整合课程、考试与费用） | https://www.gesetze-im-internet.de/intv/BJNR337000004.html | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-intv.html`（sha256 `0a4d351ab1acb276752581d1ff3cc26cbe85f57f21668aab9a83ca4207a1f9d0`） | archived |
| SRC-413 | LAW | Bundesmeldegesetz（入住登记和住所证明） | https://www.gesetze-im-internet.de/bmg/BJNR108410013.html | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-bmg.html`（sha256 `c24fd8d1160ed6197957677d9d0bffeea6e25122006107b87b66eb045fef3d91`） | archived |
| SRC-414 | GUIDANCE | 柏林 LEA：Einbürgerung | https://service.berlin.de/dienstleistung/318998/ | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-berlin-einbuergerung.html`（sha256 `dccfc4f442e727dedab5660711fcb40e585335ee87972ba558568349f74b45ad`） | archived |
| SRC-415 | GUIDANCE | 柏林 LEA：生计审查与家庭需要 | https://service.berlin.de/dienstleistung/354205/ | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-berlin-lebensunterhalt.html`（sha256 `3a5c8b256f6631687754c14e0a9990a8c63c6861aee8d1ba29fe2e8cae048d26`） | archived |
| SRC-416 | GUIDANCE | 柏林 LEA：辅助保护者定居 | https://service.berlin.de/dienstleistung/352770/ | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-berlin-subsidiaer.html`（sha256 `f6c88636c399898ff16397a3534c5fa2b10f19e1c9d37bde412045cb8e65f37d`） | archived |
| SRC-417 | GUIDANCE | 柏林 LEA：企业经营者定居 | https://service.berlin.de/dienstleistung/326564/ | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-berlin-selbstaendige.html`（sha256 `80847281493629b3919fd352082c4f38eb60067ddf9342f1d79d57477fc1a8e0`） | archived |
| SRC-418 | GUIDANCE | 柏林 LEA：子女定居 | https://service.berlin.de/dienstleistung/324863/ | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-berlin-kinder.html`（sha256 `2a6956a55229243868c941321fada34e143527282f3477876fc0548e17d987ed`） | archived |
| SRC-419 | GUIDANCE | 柏林 LEA：一般定居 | https://service.berlin.de/dienstleistung/121864/ | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-berlin-allgemein.html`（sha256 `affbc74703ad239268048fa150557ac141b8402c7ec29f080599146561f87dc2`） | archived |
| SRC-420 | LAW | 欧盟蓝卡年度公告与联邦政府蓝卡指南 | https://www.bundesanzeiger.de/pub/publication/6yuuiNCa7LgGKapMrQK/content/6yuuiNCa7LgGKapMrQK/BAnz%20AT%2004.12.2024%20B2.pdf ；https://www.bundesanzeiger.de/pub/publication/REViP4bN6jVdpGxPaiQ/content/REViP4bN6jVdpGxPaiQ/BAnz%20AT%2018.12.2025%20B3.pdf?inline= ；https://www.make-it-in-germany.com/en/visa-recognition/visa-types/eu-blue-card ；https://www.make-it-in-germany.com/fileadmin/1_Rebrush_2022/a_Fachkraefte/PDF-Dateien/3_Visum_u_Aufenthalt/Visagrafik_DE/Visum_Blaue_Karte_DE.pdf | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-banz-2025-b2-blaue-karte.pdf`（sha256 `94d6acc095c1552c24f312f46f08c39e20b08614cf760234dcf63b8962ac8035`）；`policy-sources/2026-11-23-de-banz-2026-b3-blaue-karte.pdf`（sha256 `8524b487983b3169780d7a6a43b0a252d2fc894f85873b79e461782788443359`）；`policy-sources/2026-11-23-de-mig-blue-card.html`（sha256 `5d3acfb4f47ca1398d1bf816fc529c3ee3dafad077141925dd1df93405e12db0`）；`policy-sources/2026-11-23-de-mig-blue-card.pdf`（sha256 `db66bcc9c89139a14aaf2df1784f24bff3bb6f12453118f5b5dad4a3e8e4c53e`） | archived |
| SRC-421 | GUIDANCE | 联邦政府 Make it in Germany：Niederlassungserlaubnis | https://www.make-it-in-germany.com/de/ankommen-bleiben/dauerhaft-in-deutschland/niederlassungserlaubnis | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-mig-niederlassung.html`（sha256 `5911fc677405996f74d6c9a78781abf64041c0d853ac81d68b3d14cc10a1d32b`） | archived |
| SRC-422 | LAW | FreizügG/EU（自由流动及永久居住权） | https://www.gesetze-im-internet.de/freiz_gg_eu_2004/BJNR198600004.html | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-freizuegg.html`（sha256 `4010331cd271bc0fd567da66800308e3ada3bb44151364b48d7882e2f79fb95c`） | archived |
| SRC-423 | LAW | SGB VI §§ 35、235（法定退休年龄） | https://www.gesetze-im-internet.de/sgb_6/__235.html ；https://www.gesetze-im-internet.de/sgb_6/__35.html | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-sgb-vi-235.html`（sha256 `7e28241d059e66b768e49e975d76c7eff5f653e651c7377d2fc1ea904434837d`）；`policy-sources/2026-11-23-de-sgb-vi-35.html`（sha256 `a052a5b5df1022621ea30ee4037a49df4aa1e5866b958f2d7bceb5222102b76b`） | archived |
| SRC-424 | LAW | BZRG §§ 46、51、52（前科消除与使用限制） | https://www.gesetze-im-internet.de/bzrg/__46.html ；https://www.gesetze-im-internet.de/bzrg/__51.html ；https://www.gesetze-im-internet.de/bzrg/__52.html | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-bzrg-46.html`（sha256 `9d2a3ca683d8e74681292904a93aa51855b2d8b5876ce473369417f1c866581b`）；`policy-sources/2026-11-23-de-bzrg-51.html`（sha256 `a3b0a67578dcd312767f41a843782aa0324ba9e6cb8a8c30b65dedf71e81e1f7`）；`policy-sources/2026-11-23-de-bzrg-52.html`（sha256 `2bdc30d4afbc8f2a6ece95b8d569ce2713577cb529b46ea1b7f97d77f37c0d70`） | archived |
| SRC-425 | LAW | SVBezGrV 2024、2026 与 2026 年 Fachkräfte 工资公告 | https://www.bundesanzeiger.de/pub/publication/qiidOUvOxBc4NVmtxPl/content/qiidOUvOxBc4NVmtxPl/BAnz%20AT%2018.12.2025%20B2.pdf ；https://www.gesetze-im-internet.de/svbezgrv_2024/BJNR1420A0023.html ；https://www.gesetze-im-internet.de/svbezgrv_2026/BJNR1160A0025.html | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-banz-2026-b2-fachkraft.pdf`（sha256 `6e7110e6782b737c3de7c977886829d02b138acd31bb94dfdbe0ea84dbefc88d`）；`policy-sources/2026-11-23-de-svbezgrv-2024.html`（sha256 `e7218d20be250401d80f3bc2caed41c4051dbfc8625238662d7958a8212ad4c2`）；`policy-sources/2026-11-23-de-svbezgrv-2026.html`（sha256 `42648823e666322dc826642665bf6c46ab6682e7e7e1a3dff6b03c08bc71f9fb`） | archived |
| SRC-426 | LAW | BMAS、RBSFV 2026、SGB XII § 28a（家庭需求标准） | https://www.bmas.de/DE/Arbeit/Grundsicherung-fuer-Arbeitsuchende/Leistungen-und-Bedarfe-in-der-Grundsicherung-fuer-Arbeitsuchende/leistungen-und-bedarfe-in-der-grundsicherung-fuer-arbeitsuchende-art.html ；https://www.gesetze-im-internet.de/rbsfv_2026/RBSFV_2026.pdf ；https://www.gesetze-im-internet.de/sgb_12/__28a.html | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-bmas-regelbedarf.html`（sha256 `9961824dd1a9bfb89dd08067db65120af6b3799105623587d5ee895a70f55c1c`）；`policy-sources/2026-11-23-de-rbsfv-2026.pdf`（sha256 `570caca83a1ad1ee255c3c6967c49edfd5172f154f3abb834c181a01190c2c07`）；`policy-sources/2026-11-23-de-sgb-28a.html`（sha256 `dd753f9581a3d31c6c9101215ba676239ba698888a16ca899e0cab577a4c42a5`） | archived |
| SRC-427 | GUIDANCE | 柏林 LEA：德国公民家属定居 | https://service.berlin.de/dienstleistung/327012/ | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-berlin-de-familie.html`（sha256 `3f1538e561ce8fae5cc14a9a45a8d3fc35c13f79e8382712925f318ebb6e6b20`） | archived |
| SRC-428 | GUIDANCE | 柏林 LEA：难民定居与两档生计 | https://service.berlin.de/dienstleistung/326554/ | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-berlin-fluechtlinge.html`（sha256 `0fd3b333d8642f2a155a37f3f123e91dc37e0faa53ea405b0db4dbc59f7837b1`） | archived |
| SRC-429 | GUIDANCE | 柏林 LEA：Daueraufenthalt–EU | https://service.berlin.de/dienstleistung/324281/ | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-berlin-daueraufenthalt-eu.html`（sha256 `a5d1af9fa2db3c3717bf861df56c5532f7882dc56f2703721a23dbdb607cee45`） | archived |
| SRC-430 | GUIDANCE | 柏林 LEA：Fachkräfte 定居 | https://service.berlin.de/dienstleistung/326558/ | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-berlin-fachkraefte.html`（sha256 `c9e81c580e7a3d2b0fa5a261d31e9466260a527a0624271f654ae31b76841b87`） | archived |
| SRC-431 | GUIDANCE | 柏林 LEA：蓝卡定居 | https://service.berlin.de/dienstleistung/326556/ | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-berlin-blaue-karte.html`（sha256 `8085c5495222ef591f9974ee1c1a9169d265e5257263dd0fe6a030fb15c97b82`） | archived |
| SRC-432 | GUIDANCE | BAMF：LiD 实施说明及整合课程结业标准 | https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Integrationskurse/Lehrkraefte/konzeption-fuer-die-zusatzqualifizierung-von-lehrkraeften-neu-pdf.pdf?__blob=publicationFile&v=6 ；https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Integrationskurse/Kurstraeger/Traegerrundschreiben/Anlagen/2023/traegerrundschreiben-20230425-03-anlage2.pdf?__blob=publicationFile&v=3 | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-bamf-daz-abschluss.pdf`（sha256 `cbe90c2b7b72106e7ecd74b422fb2e6f06f1707303a647b4fe50c787b11abbec`）；`policy-sources/2026-11-23-de-bamf-lid.pdf`（sha256 `a88d4672c0a7a25855bc9ae15a4032786818301aae94927700c5f09da774d929`） | archived |
| SRC-433 | LAW | PAuswGebV 与 2026 年身份证收费修正 | https://www.recht.bund.de/bgbl/1/2026/31/regelungstext.pdf?__blob=publicationFile ；https://www.gesetze-im-internet.de/pauswgebv/__1.html | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-bgbl-ausweis-2026-31.pdf`（sha256 `534eb11e7d599dd95408f2921669866c0275ea5baeb08a3ee06b9920e607e11e`）；`policy-sources/2026-11-23-de-pauswgebv.html`（sha256 `bf93f5f60aac7f5af5aef8611dd780292dc0b24aecde5e1aedd48fccc199b6b0`） | archived |
| SRC-434 | LAW | 2017 年居留收费调整的议会资料与公报索引、2023 年加急收费公报 | https://www.bgbl.de/xaver/bgbl/start.xav?start=%2F%2F%2A%5B%40attr_id%3D%27I_2017_47_inhaltsverz%27%5D ；https://dserver.bundestag.de/btd/18/120/1812050.pdf ；https://dserver.bundestag.de/btd/18/124/1812402.pdf ；https://www.recht.bund.de/bgbl/1/2023/290/regelungstext.pdf?__blob=publicationFile&v=2 | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-bgbl-gebuehren-2017-index.html`（sha256 `a41c791aa5da3b433bf50f15b738655b4e8a8c19f68acdc9fc7b374816e33079`）；`policy-sources/2026-11-23-de-bt-18-12050.pdf`（sha256 `af2d3347907aff18effc5c956a6a311940625fd32550b4da2ec60fe9bbf0a587`）；`policy-sources/2026-11-23-de-gebuehren-2017-beschluss.pdf`（sha256 `95f583794218a8e430ab5315338b1976627c91ce2667b6d2e6ab52f5ca3a9044`）；`policy-sources/2026-11-23-de-bundesgesetzblatt-2023-290.pdf`（sha256 `e37326bf049797cf32211cc64149f5f4295ff6ae5147c422b8a02fd6cf5d8f1f`） | archived |
| SRC-435 | LAW | BVerwG 1 C 12.10、1 C 21.09（家庭生计） | https://www.bverwg.de/160811U1C12.10.0 ；https://www.bverwg.de/161110U1C21.09.0 | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-bverwg-1c12-10.html`（sha256 `3f730ce90292ca27194791124e4dd12955d0b11f5ca9d9e69f93bcc8a5ea4cd2`）；`policy-sources/2026-11-23-de-bverwg-1c21-09.html`（sha256 `92cb8f3189a6aebc14204206e6f5e9c2bbd89a48f59e1f568a8c08cedef7a6b5`） | archived |
| SRC-436 | LAW | SGB VI §§ 159、160（年度养老计费上限） | https://www.gesetze-im-internet.de/sgb_6/__159.html ；https://www.gesetze-im-internet.de/sgb_6/__160.html | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-sgb-vi-159.html`（sha256 `2bfe5d624e0ecf4bf433bcaa18115c8b5ae0b2ffdc6862aac9c2fa507a75856e`）；`policy-sources/2026-11-23-de-sgb-vi-160.html`（sha256 `890e35ad160afed9b4b6c188758e5f19814e6b8473aa86ccffe64797a1cdaebe`） | archived |
| SRC-437 | LAW | 指令 2003/109/EG（欧盟长期居民，合并文本） | https://publications.europa.eu/resource/cellar/9d5fe9f4-69bd-11f1-ae88-01aa75ed71a1.0005.02/DOC_1 | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-eu-2003-109-de.html`（sha256 `47037d0a9ad615ecc937ba192ab93b2c6aecf110e7fbb342335fa171991e410c`） | archived |
| SRC-438 | LAW | BGBl. 2022 I S. 2817 及 2026 I Nr. 111、221、318（移民法修正及生效） | https://www.recht.bund.de/bgbl/1/2026/111/regelungstext.pdf?__blob=publicationFile ；https://www.recht.bund.de/bgbl/1/2026/221/regelungstext.pdf?__blob=publicationFile ；https://www.recht.bund.de/bgbl/1/2026/318/regelungstext.pdf?__blob=publicationFile ；https://rvrecht.deutsche-rentenversicherung.de/SharedDocs/rvRecht/05_Normen_und_Vertraege/02_A-B/AufenthG/0026/0026_2023_01_01.html | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-bundesgesetzblatt-2026-111.pdf`（sha256 `6ad22e70448c22a448a47c7a778b131a7ac662f99780c5fd982c6b63b930cb29`）；`policy-sources/2026-11-23-de-bundesgesetzblatt-2026-221.pdf`（sha256 `be483ae5386c79ef3257a0e5fce30e6ee2466947818987ba69f37c0eef308ee9`）；`policy-sources/2026-11-23-de-bundesgesetzblatt-2026-318.pdf`（sha256 `3a84d8721375b4aef2943b099535afb7c61d14db6209049725f3ef18ca140beb`） | archived（2026 年公报）／todo（旧版 § 26 网页快照，原文已在线核对） |
| SRC-439 | LAW | BGBl. 2023 I Nr. 217（技术移民法改革与生效） | https://www.recht.bund.de/bgbl/1/2023/217/regelungstext.pdf?__blob=publicationFile | 见法令版本或页面 | 2026-11-23 | `policy-sources/2026-11-23-de-bundesgesetzblatt-2023-217.pdf`（sha256 `f48f96a825e5c059b06ed9db7ead791860e00f6f4ff88d6bdfd2ee9ad4e937c0`） | archived |
| SRC-440 | LAW | 入管法施行规则 | https://laws.e-gov.go.jp/api/2/law_data/356M50000010054_20261001_508M60000010047?response_format=xml&law_full_text_format=xml（法令页面：https://laws.e-gov.go.jp/law/356M50000010054） | 见快照 | 2026-11-23 | `policy-sources/2026-10-01-jp-egov-nyukanho-sekokisoku-current.xml`（sha256 `af8add5f029901391c4b954dc7034812138b2996bf84d4eb26e084058ab0b0fd`） | archived |
| SRC-441 | LAW | 入管法 2027-04-01 施行版 | https://laws.e-gov.go.jp/api/2/law_data/326CO0000000319_20270401_506AC0000000060?response_format=xml&law_full_text_format=xml | 见快照 | 2026-11-23 | `policy-sources/2027-04-01-jp-egov-nyukanho-unenforced-r6-60.xml`（sha256 `dc9e71f60bb5a357c14d65ff1d90813f443459fbc4c4b53aca289aabed8001f2`） | archived |
| SRC-442 | LAW | 入管特例法 | https://laws.e-gov.go.jp/api/2/law_data/403AC0000000071_20260614_507AC0000000039?response_format=xml&law_full_text_format=xml（法令页面：https://laws.e-gov.go.jp/law/403AC0000000071） | 见快照 | 2026-11-23 | `policy-sources/2026-06-14-jp-egov-tokureiho-current.xml`（sha256 `a9b6197ff993e90b1e8640c67a4ece0e341817aa5f63d31bbab02a7f8ccdf5a5`） | archived |
| SRC-443 | LAW | 入管法施行令与手续费版本 | https://laws.e-gov.go.jp/api/2/law_data/410CO0000000178?response_format=xml&law_full_text_format=xml；https://laws.e-gov.go.jp/api/2/law_revisions/410CO0000000178；https://laws.e-gov.go.jp/api/2/law_data/410CO0000000178_20240610_506CO0000000197?response_format=xml&law_full_text_format=xml；https://laws.e-gov.go.jp/api/2/law_data/410CO0000000178_20250401_507CO0000000027?response_format=xml&law_full_text_format=xml；https://laws.e-gov.go.jp/api/2/law_data/410CO0000000178_20260701_508CO0000000177?response_format=xml&law_full_text_format=xml；https://laws.e-gov.go.jp/api/2/law_data/410CO0000000178_20270401_507CO0000000341?response_format=xml&law_full_text_format=xml（法令页面：https://laws.e-gov.go.jp/law/410CO0000000178） | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-egov-nyukanho-sekorei.xml`（sha256 `7e5b02bc067d900e4f01308ce27edcc9527ddb07eacb64d5350dcf6d28db3377`）；`policy-sources/2026-11-23-jp-egov-nyukanho-sekorei-revisions.json`（sha256 `dcb5c5254d338608fb09da4a9fe2d01616b9b90c4006f3152db9d913ed8d11c4`）；`policy-sources/2024-06-10-jp-egov-nyukanho-sekorei-fees.xml`（sha256 `d824c8fa6f4318b1c0df92996ad58008b3eceb6a623636d1c467e39beb0271c5`）；`policy-sources/2025-04-01-jp-egov-nyukanho-sekorei-fees.xml`（sha256 `b109d101e776fac24d995917e43c7b1b790c3bfec2464464a681ceb903a60fff`）；`policy-sources/2026-07-01-jp-egov-nyukanho-sekorei-fees.xml`（sha256 `8da5503d1eefbbc286a05d49243e55efdcb99dd48cea189445af3d5e0a711332`）；`policy-sources/2027-04-01-jp-egov-nyukanho-sekorei-fees.xml`（sha256 `0c42bdf09b45dad0c8aff2d01f61e14a58d6976a3bf71150f02e025552ac632a`） | archived |
| SRC-444 | GUIDANCE | 入管厅手续费改定及减额 | https://www.moj.go.jp/isa/01_00644.html；https://www.moj.go.jp/isa/10_00273.html；https://www.moj.go.jp/isa/applications/faq/01_00650.html；https://www.moj.go.jp/isa/content/001469198.pdf；https://www.moj.go.jp/isa/content/001469270.pdf；https://www.moj.go.jp/isa/11_00053.html | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-isa-fees-reform.html`（sha256 `e16a58a93cb5051552a28f808d34018533437dcb6dd88b7e7cd41af19d6f3e86`）；`policy-sources/2026-11-23-jp-isa-fees-waivers.html`（sha256 `78a3d5f3a9e9005ff9abfdb8481c5d8584ab5d5c3e810679371bd9a57c8bc4a5`）；`policy-sources/2026-11-23-jp-isa-fees-qa.html`（sha256 `ebddf702055c527883610b4b2f9d6099efab040920fc52f08ee3fff17a7d1c3e`）；`policy-sources/2026-10-01-jp-isa-fees-flyer.pdf`（sha256 `0b42be3a289914476c4135850c5be99456f728d790d740b569279c7ef02b511b`）；`policy-sources/2026-11-23-jp-isa-fee-reduction-guidelines.pdf`（sha256 `2bcc9a7213882ea156c046480bd50db314f81128ecee87d2ac64b103fa131625`）；`policy-sources/2026-11-23-jp-isa-fees-2025.html`（sha256 `f003400b74364324176614bc588d7fa16f45960d0a40163d98973475a4ea1d12`） | archived |
| SRC-445 | GUIDANCE | 法务省帰化許可申請与法务局手引 | https://www.moj.go.jp/ONLINE/NATIONALITY/6-2.html；https://houmukyoku.moj.go.jp/kofu/page000001_00305.pdf；https://houmukyoku.moj.go.jp/tokyo/page000001_00885.html；https://houmukyoku.moj.go.jp/shizuoka/content/000135122.pdf | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-moj-kika-application.html`（sha256 `1dac47475fa318b6cabea21baa60c4730804bd128a9cb1c57dfdaa646549de9a`）；`policy-sources/2026-11-22-jp-moj-kika-tebiki-r8-4.pdf`（sha256 `f55c0b8ba570e7c772786fbcf4a0ba927ce05dd487681278458c0baff599d0ab`）；`policy-sources/2026-11-23-jp-tokyo-kika.html`（sha256 `4d3beb1caa3739deff95f57ef5bd27fca6efb183b1a08ba1fba8b634eac307cf`）；`policy-sources/2026-11-23-jp-shizuoka-kika-interview.pdf`（sha256 `a5a1b510bad670636a38267fe1e5b7dc4d1cd294466c44a53f3c7696b15a40ad`） | archived |
| SRC-446 | LAW | 国籍法施行规则 | https://laws.e-gov.go.jp/api/2/law_data/359M50000010039?response_format=xml&law_full_text_format=xml（法令页面：https://laws.e-gov.go.jp/law/359M50000010039） | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-egov-kokusekiho-sekokisoku.xml`（sha256 `19629c5df6571a0473b8807182ccf7259ed5b94324a257a6eeb743924bf509d9`） | archived |
| SRC-447 | LAW | 戸籍法 | https://laws.e-gov.go.jp/api/2/law_data/322AC0000000224?response_format=xml&law_full_text_format=xml（法令页面：https://laws.e-gov.go.jp/law/322AC0000000224） | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-egov-kosekiho.xml`（sha256 `fe556fe18dfb32b280e2bf84b3c9d83e015dfc13bfbb631772ca59f43aed588d`） | archived |
| SRC-448 | LAW | 高度専門職省令与积分表 | https://laws.e-gov.go.jp/api/2/law_data/426M60000010037?response_format=xml&law_full_text_format=xml；https://www.moj.go.jp/isa/content/001447348.pdf；https://www.moj.go.jp/isa/applications/resources/newimmiact_3_qa.html（法令页面：https://laws.e-gov.go.jp/law/426M60000010037） | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-egov-hsp-ordinance.xml`（sha256 `1334eda824310ff7d24c4b5f2d62f3e327f3d99be6de61ca6b171dd6b2298721`）；`policy-sources/2026-11-23-jp-isa-hsp-points.pdf`（sha256 `02159933596a25097f4749e94cbb2dc67b06a3c56fadef4010af879b64661f3a`）；`policy-sources/2026-11-23-jp-isa-hsp-qa.html`（sha256 `0d18fc0216069bd4ec6cdad9648cf47c264a2aa70b2f384d52f2afb3159c5149`） | archived |
| SRC-449 | LAW | 特別高度人材省令与 J-Skip 手续 | https://laws.e-gov.go.jp/api/2/law_data/505M60000010025?response_format=xml&law_full_text_format=xml；https://www.moj.go.jp/isa/applications/resources/nyuukokukanri01_00009.html；https://www.moj.go.jp/isa/10_00226.html；https://www.moj.go.jp/isa/10_00227.html；https://www.moj.go.jp/isa/10_00228.html（法令页面：https://laws.e-gov.go.jp/law/505M60000010025） | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-egov-j-skip-ordinance.xml`（sha256 `bbddab4873b4cd3a19a892ca3677918ff60022983102f9f0e36eca83b8085490`）；`policy-sources/2026-11-23-jp-isa-j-skip.html`（sha256 `1a5ba12bfc065a98cfb7f19da12067b5e3af1f2fee9930b5eb7dc7452099b5b1`）；`policy-sources/2026-11-23-jp-isa-pr-j-skip-menu.html`（sha256 `0520b2dc94cc243409f7e6382de84ce214fc7e50bf3580d9bad0de12af81d882`）；`policy-sources/2026-11-23-jp-isa-pr-j-skip-recognized.html`（sha256 `0aca9b4d7d38272799c92293c69088e85d54f07b5223a32a9749ed0dad02893f`）；`policy-sources/2026-11-23-jp-isa-pr-j-skip-retro.html`（sha256 `8f31a02c7ac766776dd2a54472468478af3569fcea4e3f65f967d5f0981dfa0b`） | archived |
| SRC-450 | GUIDANCE | 永住工作及家族材料清单 | https://www.moj.go.jp/isa/content/001436512.pdf；https://www.moj.go.jp/isa/content/001422055.pdf；https://www.moj.go.jp/isa/applications/procedures/zairyu_eijyu01.html；https://www.moj.go.jp/isa/applications/procedures/zairyu_eijyu02.html；https://www.moj.go.jp/isa/applications/procedures/zairyu_eijyu03.html；https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri07_00131.html；https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri07_00132.html | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-isa-pr-work-evidence.pdf`（sha256 `55c97d0d711593051cd4210583d15d338354167b749e1099487a4a4727540298`）；`policy-sources/2026-11-23-jp-isa-pr-family-evidence.pdf`（sha256 `15b2d3d3ab29825ed7eec4cff35f86f3786783b809ff66498b4ac989b0474f7d`）；`policy-sources/2026-11-23-jp-isa-pr-family.html`（sha256 `c890c3cace34023d5abfa6fa798e947dc9217a25bd0074c97f0d11855ffa1b64`）；`policy-sources/2026-11-23-jp-isa-pr-teijusha.html`（sha256 `8afeab12ae2d67ef1ba18b6e6cb0310906de603df241d4170764f5a4e1641759`）；`policy-sources/2026-11-23-jp-isa-pr-regular.html`（sha256 `4be64690278b192a925051cd28a62f1826f8bc1a1613ba2142c7771c04456a72`）；`policy-sources/2026-11-23-jp-isa-pr-hsp-menu.html`（sha256 `1b7808c1466f6e1e36858c3366d57abb2f9503f38b7bf1b973954a71f868aa36`）；`policy-sources/2026-11-23-jp-isa-pr-hsp80-other.html`（sha256 `dd48bfbc512edf117db1510c52fa365c2a03e051ff74219972e643d63c6513ef`） | archived |
| SRC-451 | GUIDANCE | 在留资格取得与新生儿 | https://www.moj.go.jp/isa/applications/procedures/16-10.html；https://www.moj.go.jp/isa/publications/faq/newimmiact_4_q-and-a_page3.html；https://www.moj.go.jp/isa/applications/status/spouseorchildofpermanentresident.html | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-isa-status-acquisition.html`（sha256 `e9de07d5716fa409ddda052a0a69fce5c6e29a9ba7045231f6472c2de99f36bd`）；`policy-sources/2026-11-23-jp-isa-resident-card-qa.html`（sha256 `c51ccb59114cb8d56abc050fc4fde90cc99c87ecbc5780c073beea88316db911`）；`policy-sources/2026-11-23-jp-isa-pr-spouse-status.html`（sha256 `3a14e39c33c3069b1471dec3e3b290e437c8fd990df1b1ee8166d602ccac8a23`） | archived |
| SRC-452 | LAW | 上陆许可基准省令与経営・管理改定 | https://laws.e-gov.go.jp/api/2/law_data/402M50000010016?response_format=xml&law_full_text_format=xml；https://www.moj.go.jp/isa/applications/resources/10_00237.html（法令页面：https://laws.e-gov.go.jp/law/402M50000010016） | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-egov-landing-criteria.xml`（sha256 `e1365027b82aa3cf329ec14619036a2d589be42acf27de1e91569465c75181aa`）；`policy-sources/2026-11-23-jp-isa-business-manager.html`（sha256 `1087c4e6965bd9f0c852fe572a5946c01bf93b5b4f4add79f75fa4887828bede`） | archived |
| SRC-453 | GUIDANCE | 対日貢献旧指南 | https://www.moj.go.jp/isa/applications/resources/nyukan_nyukan36.html；https://www.moj.go.jp/isa/content/930002484.pdf | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-isa-pr-contribution.html`（sha256 `bd4395efb73b938f161c06abbcfe7cc35f18dee4dd22861dd43c073ec3aab5cd`）；`policy-sources/2026-11-23-jp-isa-pr-contribution-old.pdf`（sha256 `f9d89bcc192c837840e33a21fb5a01e011d1d1ee9b22f9bf4fc5cea4b2c29147`） | archived |
| SRC-454 | LAW | 学校教育法与外国儿童就学 | https://laws.e-gov.go.jp/api/2/law_data/322AC0000000026?response_format=xml&law_full_text_format=xml；https://www.mext.go.jp/a_menu/shotou/clarinet/004/1415154_00003.htm（法令页面：https://laws.e-gov.go.jp/law/322AC0000000026） | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-egov-school-education.xml`（sha256 `3d8ee77a18ba5208a8f6ef924a82d666649bb32f255add96dbe48c050c835c30`）；`policy-sources/2026-11-23-jp-mext-foreign-children-school.html`（sha256 `cfc25a1397ab74906e91ba57fe4b7261c9b25be49271908cf0780592840a4175`） | archived |
| SRC-455 | GUIDANCE | 在留申請在线范围与支付 | https://www.moj.go.jp/isa/content/001351658.pdf；https://www.moj.go.jp/isa/11_00107.html | 见快照 | 2026-11-23 | `policy-sources/2026-01-05-jp-isa-online-scope.pdf`（sha256 `b5e5d38f577f0eec672e75454727c3fb3057187d4ea7b4a6af67cdac2416c1b1`）；`policy-sources/2026-11-23-jp-isa-online-fees.html`（sha256 `91b47c821cc7b16baaa3bd3da00509fcc8cc25801cde19508d2af85be52b2161`） | archived |
| SRC-456 | GUIDANCE | 生活・就労ガイドブック | https://www.moj.go.jp/isa/support/portal/guidebook_all.html；https://www.moj.go.jp/isa/content/930004717.pdf | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-isa-kikin-japanese-guide.html`（sha256 `12ce5adc7f13a43176f910a201515101be19654ffb942e1311e76a5ba9ccc1fa`）；`policy-sources/2026-11-23-jp-isa-guidebook-entry.pdf`（sha256 `0f0c1aeb1e7f4b4a55ff5e90a9a1397386cdb1763f8598a0fa937362b184e407`） | archived |
| SRC-457 | GUIDANCE | 特定在留カード | https://www.moj.go.jp/isa/tokutei.html | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-isa-integrated-card.html`（sha256 `20899c13634a6ac1e78f96671e160817668bcfcb262a32cfbb9195c7c3512a0e`） | archived |
| SRC-458 | LAW | 特定活動告示与就労资格资料 | https://www.moj.go.jp/isa/policies/bill/nyukan_hourei_h02.html；https://www.moj.go.jp/isa/content/001360125.pdf；https://www.moj.go.jp/isa/content/001436513.pdf；https://www.moj.go.jp/isa/content/001389017.pdf；https://www.moj.go.jp/isa/applications/status/designatedactivities07.html；https://www.moj.go.jp/isa/applications/status/designatedactivities08.html | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-isa-designated-activities-notice.html`（sha256 `a3aeed02a8d91c2d478476187c28e1ba1fbd05838856e5bfdae87aa267f26127`）；`policy-sources/2026-11-23-jp-isa-designated-activities-notice.pdf`（sha256 `469bfb3a883ecf35b1839a16f36f42e5731a419b981730f380901edcd6de3fe3`）；`policy-sources/2026-11-23-jp-isa-designated-work.pdf`（sha256 `6c79d7c145e07dc5ec7f08e23cf639ec188355d076b687e81b51d5b6eb2907b9`）；`policy-sources/2026-11-23-jp-isa-designated-activities-list.pdf`（sha256 `af12f5689945ea7a1d14074474d0197c6c824bffbc5d630436fbd411b0a0adb8`）；`policy-sources/2026-11-23-jp-isa-designated-research.html`（sha256 `9e4a0efd8dd5ba26fd3dd03b730562e2feb8bf78e9bc49d0af45951c10da591d`）；`policy-sources/2026-11-23-jp-isa-designated-information-processing.html`（sha256 `6295193bb424b6338e9659256d062fc7e2efc5a134aa0f69dfd804f365221218`） | archived |
| SRC-459 | GUIDANCE | 東京・広島法務局帰化证据清单 | https://houmukyoku.moj.go.jp/tokyo/page000001_00891.html；https://houmukyoku.moj.go.jp/hiroshima/page000001_01045.html | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-tokyo-kika-evidence.html`（sha256 `15f04d088ea9df3147e7a91105dbfc198675471dcccaf19ac3fe090d7f413e32`）；`policy-sources/2026-11-23-jp-hiroshima-kika-china-evidence.html`（sha256 `df0b98c9475e7f6b58992ba158bdb50f8f14945ee31c27410bee550379503d52`） | archived |
| SRC-460 | GUIDANCE | 国籍法官方参考英译 | https://www.japaneselawtranslation.go.jp/ja/laws/download/4713/14/s25Aa001470504je16.0_r4A102.pdf | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-moj-nationality-translation.pdf`（sha256 `e46ba90d41e379e07dda8aea025bfa5e404c5e3be0ba138066237647bd418a80`） | archived |
| SRC-461 | GUIDANCE | 普通再入国与難民旅行証明書手续 | https://www.moj.go.jp/isa/immigration/procedures/16-5.html；https://www.moj.go.jp/isa/refugee/procedures/16-7.html；https://www.moj.go.jp/isa/refugee/procedures/ryokou_00001.html | 见快照 | 2026-11-23 | `policy-sources/2026-11-22-jp-isa-reentry-application.html`（sha256 `efa1298369ebf91eca0fd8608def5948474a0fadc47bd2f16d0f71f6b96e2319`）；`policy-sources/2026-11-23-jp-isa-refugee-travel-application.html`（sha256 `1ef3e798ca2d99df68372c7d955691517d35a1b2e537506e292fe08b0184b3c2`）；`policy-sources/2026-11-23-jp-isa-refugee-travel.html`（sha256 `a7b2f2e22116e420bcbc16309ee8d151cd374ee57a28ba41e5bc72a47e437baf`） | archived |
| SRC-462 | LAW | 驻外领事费用 | https://laws.e-gov.go.jp/api/2/law_data/327CO0000000074?response_format=xml&law_full_text_format=xml；https://laws.e-gov.go.jp/api/2/law_data/327M50000020004?response_format=xml&law_full_text_format=xml（法令页面：https://laws.e-gov.go.jp/law/327CO0000000074） | 见快照 | 2026-11-23 | `policy-sources/2026-11-23-jp-egov-consular-fees-order.xml`（sha256 `763b555edbae194526b78fcd9afe1214cfb94f1dbcd236eef6ae41058399d956`）；`policy-sources/2026-11-23-jp-egov-consular-fees-regulation.xml`（sha256 `fb6cc2334119170f9f4d89cd54dfcf83aab987b04a83dc57af0e145632df8a45`） | archived |

| SRC-200 | LAW | Migration Regulations 1994（Compilation 292，卷 1–3） | https://www.legislation.gov.au/F1996B03551/2026-11-12/2026-11-12/text （正文分卷：https://www.legislation.gov.au/F1996B03551/2026-11-12/2026-11-12/text/original/epub/OEBPS/document_1/document_1.html https://www.legislation.gov.au/F1996B03551/2026-11-12/2026-11-12/text/original/epub/OEBPS/document_2/document_2.html https://www.legislation.gov.au/F1996B03551/2026-11-12/2026-11-12/text/original/epub/OEBPS/document_3/document_3.html） | 2026-11-12 | 2026-11-23 | `policy-sources/2026-11-12-au-migration-regulations-1994-vol1.html`（sha256 `8bd51e1c4db77f7fabeae91e722504253851b701950dafc6a7ee2cf4bcd883c6`）、`policy-sources/2026-11-12-au-migration-regulations-1994-vol2.html`（sha256 `895af717db009d1b024983727620f02361b7df9f0cf4ab66a134acf87f0d316a`）、`policy-sources/2026-11-12-au-migration-regulations-1994-vol3.html`（sha256 `4b40e5acf24e31ea8774505041010eeb9ac07a99866751cfd30125d0634b103e`） | archived |
| SRC-201 | LAW | LIN 19/210 技术签证及格线 | https://www.legislation.gov.au/F2019L01400/2019-10-31/2019-10-31/text/original/epub/OEBPS/document_1/document_1.html | 2019-10-31 | 2026-11-23 | `policy-sources/2019-10-31-au-lin-19-210-pool-pass-marks.html`（sha256 `972c72c93c43f657ad14efd8eb5e7332ef98a76990d8dc63f20535a0527580c6`） | archived |
| SRC-202 | LAW | LIN 22/022 指定偏远地区 | https://www.legislation.gov.au/F2022L00231/2022-03-02/2022-03-02/text/original/epub/OEBPS/document_1/document_1.html | 2022-03-02 | 2026-11-23 | `policy-sources/2022-03-02-au-lin-22-022-designated-regional-areas.html`（sha256 `86d620e57c6f3e938062a9ebae517b3dd5591084100cb3e97dd0ac12159179a0`） | archived |
| SRC-203 | LAW | LIN 19/216 雇主提名类别豁免 | https://www.legislation.gov.au/F2019L01404/2024-12-07/2024-12-07/text/original/epub/OEBPS/document_1/document_1.html | 2024-12-07 | 2026-11-23 | `policy-sources/2024-12-07-au-lin-19-216-186-exemptions.html`（sha256 `c9888cd702725fca145d1573f97e8d605a34953a4d68a612d3bfe23adebdfdde`） | archived |
| SRC-204 | LAW | Migration (Skilling Australians Fund) Charges Regulations 2018 | https://www.legislation.gov.au/F2018L01092/2024-12-07/2024-12-07/text/original/epub/OEBPS/document_1/document_1.html | 2024-12-07 | 2026-11-23 | `policy-sources/2024-12-07-au-saf-charges-regulations-2018.html`（sha256 `6ab40dcc0bc214a542357a7db126fbaa10622fafdd6b81fc27b41c3d1d726d1f`） | archived |
| SRC-205 | LAW | LIN 25/014 Functional English | https://www.legislation.gov.au/F2025L00904/2025-08-06/2025-08-06/text/original/epub/OEBPS/document_1/document_1.html | 2025-08-06 | 2026-11-23 | `policy-sources/2025-08-06-au-lin-25-014-functional-english.html`（sha256 `3b7bab57ffeb4aa8c7138b909e519fe822a651c05dce6d1ee4df60c390823e9a`） | archived |
| SRC-206 | LAW | LIN 25/016 英语考试、成绩与护照 | https://www.legislation.gov.au/F2025L00905/2025-08-06/2025-08-06/text/original/epub/OEBPS/document_1/document_1.html | 2025-08-06 | 2026-11-23 | `policy-sources/2025-08-06-au-lin-25-016-language-tests-scores-passports.html`（sha256 `ddf1bd3e693591a6b876c44302a2d47ec7dd232af76683f9054067914047fd89`） | archived |
| SRC-207 | LAW | LIN 19/051 技术职业与评估机构 | https://www.legislation.gov.au/F2019L00278/2026-03-28/2026-03-28/text/original/epub/OEBPS/document_1/document_1.html | 2026-03-28 | 2026-11-23 | `policy-sources/2026-03-28-au-lin-19-051-skilled-occupations.html`（sha256 `be0a63a30b3e2d5b0b60654f9e8c101ddf5230d8604317ff122b6701d24cb4d5`） | archived |
| SRC-208 | LAW | LIN 24/089 雇主提名职业清单 | https://www.legislation.gov.au/F2024L01618/2026-03-28/2026-03-28/text/original/epub/OEBPS/document_1/document_1.html | 2026-03-28 | 2026-11-23 | `policy-sources/2026-03-28-au-lin-24-089-186-csol-occupations.html`（sha256 `ad71f913ab0aeb6a157aa4f215e2f9e90c0d2cbde65ac497becbd8c83ca2922c`） | archived |
| SRC-209 | LAW | Australian Citizenship Regulation 2016 | https://www.legislation.gov.au/F2016L01916/2026-07-01/2026-07-01/text/original/epub/OEBPS/document_1/document_1.html | 2026-07-01 | 2026-11-23 | `policy-sources/2026-07-01-au-citizenship-regulation-2016.html`（sha256 `a321c5d59388fa3294996dc4aa3cbb44f4943e7ab89b01921f59222cd44271cf`） | archived |
| SRC-210 | LAW | IMMI 18/033 市场年薪 | https://www.legislation.gov.au/F2018L00284/2026-07-01/2026-07-01/text/original/epub/OEBPS/document_1/document_1.html | 2026-07-01 | 2026-11-23 | `policy-sources/2026-07-01-au-immi-18-033-amsr-annual-earnings.html`（sha256 `84cb1092d5fb0eb4864f04d141f9245ee96b285154924b72b5193ffa657790bc`） | archived |
| SRC-211 | LAW | Migration Act 1958（Compilation 172，卷 2） | https://www.legislation.gov.au/C1958A00062/2026-10-08/2026-10-08/text/original/epub/OEBPS/document_2/document_2.html | 2026-10-08 | 2026-11-23 | `policy-sources/2026-10-08-au-migration-act-1958-vol2.html`（sha256 `85cfa9c63bfebe5a85e2c2e84f7f69e66f38bcf77a522072a29c0f7796f6875c`） | archived |
| SRC-212 | LAW | Fair Work Regulations 2009 | https://www.legislation.gov.au/F2009L02356/2026-11-01/2026-11-01/text/original/epub/OEBPS/document_1/document_1.html | 2026-11-01 | 2026-11-23 | `policy-sources/2026-11-01-au-fair-work-regulations-2009.html`（sha256 `175e98d98e660b54732442fc45a206ec5946a3873d9101587c8fd40e927f760b`） | archived |
| SRC-213 | LAW | Health Insurance Act 1973 | https://www.legislation.gov.au/C2004A00101/2026-11-04/2026-11-04/text/original/epub/OEBPS/document_1/document_1.html | 2026-11-04 | 2026-11-23 | `policy-sources/2026-11-04-au-health-insurance-act-1973-vol1.html`（sha256 `a76febada28d2ccddca89e373a526074a2f21389cb599030f797c7f4c10e5713`） | archived |
| SRC-214 | GUIDANCE | 内政部雇主提名薪资要求 | https://immi.homeaffairs.gov.au/visas/employing-and-sponsoring-someone/sponsoring-workers/nominating-a-position/salary-requirements | —（动态页面） | 2026-11-23 | `policy-sources/2026-11-23-au-immi-salary-requirements.html`（sha256 `8866e256c8c38dda8ddebd68f6f37ee98503a63941873cf0a252bad7495d501f`） | archived |
| SRC-215 | GUIDANCE | 内政部入籍面试与考试 | https://immi.homeaffairs.gov.au/citizenship/test-and-interview/learn-about-citizenship-interview-and-test | —（动态页面） | 2026-11-23 | `policy-sources/2026-11-23-au-immi-citizenship-test.html`（sha256 `77e0f6b06bc8c0b177f6967638699585dc59a37d57055327f6c11456279d363a`） | archived |
| SRC-216 | GUIDANCE | 内政部新西兰公民直接入籍指引 | https://immi.homeaffairs.gov.au/entering-and-leaving-australia/new-zealand-citizens/pathway-to-permanent-resident-and-citizenship | —（动态页面） | 2026-11-23 | `policy-sources/2026-11-23-au-immi-citizenship-nz-direct.html`（sha256 `729192a53dabb7f10f030aaed001d58ac1fbe90e890da75d806d45079876b853`） | archived |
| SRC-217 | GUIDANCE | 内政部 Form 1298i（07/26） | https://immi.homeaffairs.gov.au/form-listing/forms/1298i.pdf | 07/26 | 2026-11-23 | `policy-sources/2026-11-23-au-immi-citizenship-form1298i.pdf`（sha256 `41a646d8f048ef930a0c6920381c90de1b049e05ca3ace637b8de259aaede0c6`） | archived |
| SRC-218 | GUIDANCE | 内政部 Significant Cost Threshold | https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/health/protecting-health-care-and-community-services | —（动态页面） | 2026-11-23 | `policy-sources/2026-11-23-au-immi-health-sct.html`（sha256 `04d980fecff773faf2f5d4d4b9244ca243035f861bb188ac4e74bae882377a79`） | archived |
| SRC-219 | GUIDANCE | 内政部 Health waiver | https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/health/health-waiver | —（动态页面） | 2026-11-23 | `policy-sources/2026-11-23-au-immi-health-waiver.html`（sha256 `5da24d2679f3183ab87327e83a55fe5daf135c8755621d0ef159642489ab32a7`） | archived |
| SRC-220 | GUIDANCE | 内政部签证品格审查 | https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/character | —（动态页面） | 2026-11-23 | `policy-sources/2026-11-23-au-immi-character.html`（sha256 `436634c6fc24670761e86baef17c7d82040d22c9452908f692fe1570cc97772d`） | archived |
| SRC-221 | GUIDANCE | 内政部签证费率 | https://immi.homeaffairs.gov.au/visas/getting-a-visa/fees-and-charges/current-visa-pricing | —（动态页面） | 2026-11-23 | `policy-sources/2026-11-23-au-immi-visa-fees-pricing.html`（sha256 `c2a74843b61c5da7a6f5ecfcc341b45e8d2ab8da5ab5151f3879496706ae8f34`） | archived |
| SRC-225 | GUIDANCE | 内政部技术移民职业评估 | https://immi.homeaffairs.gov.au/visas/working-in-australia/skills-assessment | —（动态页面） | 2026-11-23 | `policy-sources/2026-11-23-au-immi-skills-assessment.html`（sha256 `42c9875accba8edc3898927f8aed6cd5b4fcf20d5bbcfb93ea470aa876b3cb5c`） | archived |
| SRC-226 | GUIDANCE | 内政部 Competent English 考试和成绩 | https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language/competent-english | —（动态页面） | 2026-11-23 | `policy-sources/2026-11-23-au-immi-english-competent.html`（sha256 `89b69eaa9ef88fdc05222fcbe936179595350d833076d856578e479e5a077cb5`） | archived |
| SRC-229 | GUIDANCE | IELTS 官方成绩说明（Overall band score） | https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail | —（动态页面） | 2026-11-23 | `policy-sources/2026-11-23-au-ielts-scoring-in-detail.html`（sha256 `0b611e3fd51650e8e3e675075bf2e5deebc815c55ff961001c385568763554e4`） | archived |
| SRC-230 | LAW | 新西兰：居民身份、旅行、变更、再发与通用递交条件 | https://www.immigration.govt.nz/opsmanual/43640.htm ；https://www.immigration.govt.nz/opsmanual/46504.htm ；https://www.immigration.govt.nz/opsmanual/44893.htm ；https://www.immigration.govt.nz/opsmanual/30976.htm ；https://www.immigration.govt.nz/opsmanual/30990.htm ；https://www.immigration.govt.nz/opsmanual/31004.htm ；https://www.immigration.govt.nz/opsmanual/30942.htm ；https://www.immigration.govt.nz/opsmanual/30943.htm ；https://www.immigration.govt.nz/opsmanual/31105.htm ；https://www.immigration.govt.nz/opsmanual/48291.htm ；https://www.immigration.govt.nz/opsmanual/44897.htm ；https://www.immigration.govt.nz/opsmanual/30496.htm ；https://www.immigration.govt.nz/opsmanual/30497.htm ；https://www.immigration.govt.nz/opsmanual/30498.htm ；https://www.immigration.govt.nz/opsmanual/30495.htm ；https://www.immigration.govt.nz/opsmanual/30500.htm ；https://www.immigration.govt.nz/opsmanual/42632.htm ；https://www.immigration.govt.nz/opsmanual/42633.htm ；https://www.immigration.govt.nz/opsmanual/33732.htm ；https://www.immigration.govt.nz/opsmanual/30501.htm ；https://www.immigration.govt.nz/opsmanual/30489.htm ；https://www.immigration.govt.nz/opsmanual/46518.htm | 见各快照版本日 | 2026-11-23；2026-11-24 补档 | `policy-sources/2016-08-22-nz-ops-rv3-1.html`（sha256 `fdd5cf4bf373d9a0985d9cfda5435d518ba0335e50af1bf076ac29fca82fd41c`）；`policy-sources/2026-09-25-nz-ops-r2-1.html`（sha256 `8752fffc21c418fdf8783df3e2e1e691137df2ff8406905cc21c296d1fe34166`）；`policy-sources/2022-04-12-nz-ops-r2-40.html`（sha256 `40f7d70da3708c8882512bf99218f7a2c7182782d05432e264682f54350ac286`）；`policy-sources/2010-11-29-nz-ops-r2-65.html`（sha256 `0d2a3b37be823a971a160d83ae8686af806b30c23c79dbf9ef92625ffa08f032`）；`policy-sources/2010-11-29-nz-ops-r5-6.html`（sha256 `447c26a740117467c4c594ff2c1c60e2461b44adf11f4ac427341452d4f84165`）；`policy-sources/2010-11-29-nz-ops-r5-75.html`（sha256 `0105326d76df259ce1d9e5a02c34189e59d5641bf3c77bec55cae46086914021`）；`policy-sources/2010-11-29-nz-ops-ra1-1.html`（sha256 `d19ca175da317d331eea8b3c24e0065019e13877c61929611c5fd1b37c5a6b37`）；`policy-sources/2010-11-29-nz-ops-ra1-5.html`（sha256 `b6d21ff6d5e6caa5193db042a007cdb0bbb392ba870155cfd030a912d8111866`）；`policy-sources/2017-08-28-nz-ops-ra5-1.html`（sha256 `bd5ed5c711a1b7811183d16a37f9977ab7790e691b8b9f73a2c7e162f632f76f`）；`policy-sources/2020-09-07-nz-ops-rv1-25.html`（sha256 `f889532634de6bcaaf3040224d9a7ab3957a256d8b12f2256822e203d3ee211d`）；`policy-sources/2020-09-07-nz-ops-rv2-1.html`（sha256 `afb664b77dc473b39df32ebfc528c37bb867638adfafddf1c687354e70ef3e9c`）；`policy-sources/2015-03-30-nz-ops-rv3-10.html`（sha256 `878430ab0a3436629d2c230037c5ca66b3a42b32cd4d04622e947ecd1efd43dd`）；`policy-sources/2010-11-29-nz-ops-rv3-15.html`（sha256 `a4157fe658f1b09529225a233c78f5a415845dba3d7a7db88066485c58f7b5d1`）；`policy-sources/2016-08-22-nz-ops-rv3-20.html`（sha256 `86dd9c44dc30aae6cb732c6a95d2e88d149194c9c9410e8838097469ca4307d2`）；`policy-sources/2010-11-29-nz-ops-rv3-5.html`（sha256 `12b56a6bc0ae14be678c18b24266de65a1a35103b543d71f52c5a11eec1de40f`）；`policy-sources/2016-04-11-nz-ops-rv4-1.html`（sha256 `ef64654c1ca73863ae261199011450d5f39def444ed4b52a0a194e76464eb311`）；`policy-sources/2016-04-11-nz-ops-rv4-10.html`（sha256 `6407ad57984c1be8f02fbad276a95102edc85964bf27bd6e88beab928aa13455`）；`policy-sources/2016-04-11-nz-ops-rv4-15.html`（sha256 `72fd08050e94613d4cc87bbb7335dc8d8467af11d621b8b52455bc72778d5c27`）；`policy-sources/2019-05-13-nz-ops-rv4-20.html`（sha256 `e66a5777eff46f5a46daea39309288f69c71d1025021f03b2281c7bb25261d4e`）；`policy-sources/2010-11-29-nz-ops-rv4-5.html`（sha256 `cc3d38d32ea3995d7c897215a634fa7900a2fec280cab26d85cc38cad3febfee`）；`policy-sources/2024-01-29-nz-ops-rv1-10.html`（sha256 `66618235a27eb38aec08084abfe052ddb291c057446df95ed090b505dd571e2a`）；`policy-sources/2023-08-27-nz-ops-ra5.html`（sha256 `d1ba794caec9a9fc21d13f25bd981ea9ec25cec83fac24e648c0676e99f66343`） | archived |
| SRC-231 | GUIDANCE | 新西兰：DIA Citizenship Guidance Document（2026 年 10 月） | https://www.dia.govt.nz/diawebsite.nsf/Files/Citizenship-2026/$file/Citizenship-Guidance-Document-October-2026.pdf ；https://www.dia.govt.nz/diawebsite.nsf/wpg_URL/Services-Citizenship-Citizenship-policy?OpenDocument | 见各快照版本日 | 2026-11-23 | `policy-sources/2026-10-14-nz-dia-citizenship-guidance.pdf`（sha256 `d9f651659de06f7eed805a8fd18959e34cd71225a539e5c862c74fc4110e223b`）；`policy-sources/2026-11-23-nz-dia-citizenship-policy.html`（sha256 `79858fa4cd956ecbbda5a71294684c014b25547b3fe4552dbd36504300181196`） | archived |
| SRC-232 | GUIDANCE | 新西兰：govt.nz 入籍资格、申请、儿童、宣誓与拟实施考试 | https://www.govt.nz/browse/passports-citizenship-and-identity/nz-citizenship/requirements-for-nz-citizenship/ ；https://www.govt.nz/browse/passports-citizenship-and-identity/nz-citizenship/how-to-apply-for-nz-citizenship/citizenship-ceremonies/ ；https://www.govt.nz/browse/passports-citizenship-and-identity/nz-citizenship/requirements-for-nz-citizenship/character-requirements/ ；https://www.govt.nz/browse/passports-citizenship-and-identity/nz-citizenship/requirements-for-nz-citizenship/requirements-if-youre-a-child/ ；https://www.govt.nz/browse/passports-citizenship-and-identity/nz-citizenship/how-to-apply-for-nz-citizenship/ ；https://www.govt.nz/browse/passports-citizenship-and-identity/nz-citizenship/requirements-for-nz-citizenship/language-requirements/ ；https://www.govt.nz/browse/passports-citizenship-and-identity/nz-citizenship/privileges-and-responsibilities-of-a-citizen/ ；https://www.govt.nz/browse/passports-citizenship-and-identity/nz-citizenship/requirements-for-nz-citizenship/if-you-dont-meet-a-requirement-but-feel-your-situation-is-special/ ；https://www.govt.nz/browse/passports-citizenship-and-identity/nz-citizenship/citizenship-test/ | 见各快照版本日 | 2026-11-23 | `policy-sources/2026-11-23-nz-govt-citizenship-requirements.html`（sha256 `77b95c2d6076d4e90a06224e9d28be649f4dd0c2a783d1c01718d9ad069746ed`）；`policy-sources/2026-11-23-nz-govt-citizenship-ceremonies.html`（sha256 `f3e3d4be7fff6cacc3b64ae8c9afe896f50185d90fb6fe62102cf7eb4a175121`）；`policy-sources/2026-11-23-nz-govt-citizenship-character.html`（sha256 `a6a5910776c9c4622076b7b8392f70f4c4a92927b92459753b4428149c7223a8`）；`policy-sources/2026-11-23-nz-govt-citizenship-child.html`（sha256 `18cd8c255965284bac8d51ff7dcb4d40e246c90b7a4e57b304b7f50bae116e00`）；`policy-sources/2026-11-23-nz-govt-citizenship-how-to-apply.html`（sha256 `0c36c25792c72ed4106e68e124b8c0194dfbe9f2fb0b06832f87639d17e46826`）；`policy-sources/2026-11-23-nz-govt-citizenship-language.html`（sha256 `1d34907d6eaee2b519394e2da7a2af6d449724b095aeb38608afc59ddda7004d`）；`policy-sources/2026-11-23-nz-govt-citizenship-privileges.html`（sha256 `5b1c24853094797008b0c4d76f7b5558aad80e9bc35759e2e4ad3e8e651d0c61`）；`policy-sources/2026-11-23-nz-govt-citizenship-special.html`（sha256 `abd08a377caba1b6d0c717114c305fc65f9780cdb154878aafd8aac1b6e31a8d`）；`policy-sources/2026-11-23-nz-govt-citizenship-test.html`（sha256 `080626c18e412c88491f0e453f8e675f71ecd7a2dd52ab5a50f2b95a37146d6e`） | archived |
| SRC-233 | POLICY | 新西兰：MBIE 移民费用和征费检讨，历史费率提案及 A6 地区和豁免口径 | https://www.regulation.govt.nz/assets/RIS-Documents/cris2-mbie-ifalr-jun24-v2.pdf ；https://www.immigration.govt.nz/opsmanual/41440.htm ；https://www.immigration.govt.nz/opsmanual/59391.htm ；https://www.regulation.govt.nz/publications-and-resources/regulatory-analysis-summaries/stage-2-cost-recovery-impact-statement-immigration-fee-and-levy-review/ | 见各快照版本日 | 2026-11-23 | `policy-sources/2024-06-01-nz-mbie-cris-immigration-fees.pdf`（sha256 `8117c07e5d0bc2ae79684935309f6bd4371401fd6d5524191b03912f12a6730a`）；`policy-sources/2017-08-28-nz-ops-a6-10.html`（sha256 `649bdde29b6e5b9048a961c2d04582684174ea237f7cfd7d9294d1f62a256336`）；`policy-sources/2023-02-28-nz-ops-a6-11.html`（sha256 `b1f7683d4fcc781e6f1dee20ecd726089f067a17b7d287dd8953cc213fcc7fdd`）；`policy-sources/2024-09-19-nz-mfr-cris-immigration-fees.html`（sha256 `101190fb02669924a33a31a37616c5a52ff7fbb68b09b16096c68dbcccb36086`） | archived |
| SRC-234 | GUIDANCE | 新西兰：DIA 入籍收费与调整公告 | https://www.govt.nz/browse/passports-citizenship-and-identity/nz-citizenship/citizenship-fees/ ；https://www.dia.govt.nz/press.nsf/d77da9b523f12931cc256ac5000d19b6/3af634c887fcd7dfcc258e600013912c!OpenDocument ；https://www.regulation.govt.nz/assets/RIS-Documents/Cost-Recovery-Impact-Statement-Citizenship-Fees-Amendment-Regulations-2026.pdf ；https://www.regulation.govt.nz/publications-and-resources/regulatory-analysis-summaries/cost-recovery-impact-statement-citizenship-fees-amendment-regulations-2026/ | 见各快照版本日 | 2026-11-23 | `policy-sources/2026-11-23-nz-govt-citizenship-fees.html`（sha256 `b43e2b195e2fc7eca398d62263c6e7cd796246235b801aef8ee86a7a4c577336`）；`policy-sources/2026-08-28-nz-dia-citizenship-fees-release.html`（sha256 `942a7d94bb318d792b22437448bd7918813e1073ddb9da91c015aa9ea4e0d863`）；`policy-sources/2026-06-17-nz-dia-cris-citizenship-fees-2026.pdf`（sha256 `fc26cc2f0e239772a7f57937f23e870849cc50e7b174d7bfc78c76a0aabddfa5`）；`policy-sources/2026-06-17-nz-mfr-cris-citizenship-fees-2026.html`（sha256 `f97b3bdc426a33abe8c19443c9698d8e111f3953a6ab3430dcb34681e2a40bfe`） | archived |
| SRC-235 | LAW | 新西兰：Skilled Residence 就业、雇主与工资核算 | https://www.immigration.govt.nz/opsmanual/77806.htm ；https://www.immigration.govt.nz/opsmanual/64549.htm ；https://www.immigration.govt.nz/opsmanual/77803.htm ；https://www.immigration.govt.nz/opsmanual/91283.htm ；https://www.immigration.govt.nz/opsmanual/77807.htm | 见各快照版本日 | 2026-11-23 | `policy-sources/2026-08-24-nz-ops-sr2-1.html`（sha256 `483b53969ec1a20d4f2175d41ce4197f783a836c8daf4391d0ecf27fd67bf33f`）；`policy-sources/2024-04-11-nz-ops-r5-110.html`（sha256 `a9d16ef8d5528b2cca88f704d463d7a60b54ae6d819ab676a7a16a71b9db271b`）；`policy-sources/2023-10-09-nz-ops-sr1-1.html`（sha256 `9d65213acfa050d26b2e093165fa859429f3286e5131b1be2ec23ae7ee224413`）；`policy-sources/2026-10-20-nz-ops-sr2-15.html`（sha256 `a1c04962b1512792377b67936471bb2f7133446b849806b88b306e7d1eb3c4ef`）；`policy-sources/2023-10-09-nz-ops-sr2-5.html`（sha256 `454f7f3b2ee37905060b976b83d8688f440da0a0204b218417dd424ab7a29822`） | archived |
| SRC-236 | LAW | 新西兰：Skilled Migrant Category 与附录 21–23 | https://www.immigration.govt.nz/opsmanual/77811.htm ；https://www.immigration.govt.nz/opsmanual/90266.htm ；https://www.immigration.govt.nz/opsmanual/90267.htm ；https://www.immigration.govt.nz/opsmanual/90268.htm ；https://www.immigration.govt.nz/opsmanual/77812.htm ；https://www.immigration.govt.nz/opsmanual/79840.htm ；https://www.immigration.govt.nz/opsmanual/80476.htm ；https://www.immigration.govt.nz/opsmanual/80474.htm ；https://www.immigration.govt.nz/opsmanual/80475.htm ；https://www.immigration.govt.nz/opsmanual/90257.htm ；https://www.immigration.govt.nz/opsmanual/90261.htm | 见各快照版本日 | 2026-11-23 | `policy-sources/2026-08-24-nz-ops-sr3-5.html`（sha256 `d64352bd3cbf3d141cffd036cb5d4c835aba5728513fb10fa2868f9b647446d8`）；`policy-sources/2026-08-24-nz-ops-app21-amber.html`（sha256 `5a3e46493e6d218d30c796ba889b4240fd6cdd8fd3f777f70a72aab4f0564bcf`）；`policy-sources/2026-08-24-nz-ops-app22-red.html`（sha256 `368a0c4aa94b2a9447c8cd0adb70db5794a5b77b253df483170f0660ebc2d3b9`）；`policy-sources/2026-08-24-nz-ops-app23-trades.html`（sha256 `21c0997f865aacc94b2a7b0485bbc44b9ddec639cb30cb79b8fa7fca831c1543`）；`policy-sources/2026-08-24-nz-ops-sr3-10.html`（sha256 `92a269ed0c55015ead5d31187dfb96c27980da8c78aff97fa9455b69e6056086`）；`policy-sources/2026-08-24-nz-ops-sr3-15.html`（sha256 `83c958031376c05999a478e6393a3f540da45740892f5fe98381bb315812e2bd`）；`policy-sources/2026-08-24-nz-ops-sr3-20.html`（sha256 `8c6988115fb3ef49be38968947d84b48f8e9914fdc978fb50503f5a6c3f84bfe`）；`policy-sources/2026-08-24-nz-ops-sr3-25.html`（sha256 `29bcab0c1e365a341867267558df3ec12f49844a582cb0e856d1d3c7d87c034a`）；`policy-sources/2026-08-24-nz-ops-sr3-30.html`（sha256 `576d973938349074e584af8ea49cbefa3faa40dd653de56d90f736a664d87264`）；`policy-sources/2026-08-24-nz-ops-sr3-35.html`（sha256 `598bf60473cf1df59ba807c827fd2d2d1bf2fd4d90242cdfadd4a484e1ff6d45`）；`policy-sources/2026-08-24-nz-ops-sr3-40.html`（sha256 `562ef246e06055fce44961068dba50a403f0a2be5586713fe17fa59eedd89628`） | archived |
| SRC-237 | LAW | 新西兰：Green List Tier 1、Tier 2 与附录 13 | https://www.immigration.govt.nz/opsmanual/77204.htm ；https://www.immigration.govt.nz/opsmanual/77817.htm ；https://www.immigration.govt.nz/opsmanual/77816.htm ；https://www.immigration.govt.nz/opsmanual/77822.htm ；https://www.immigration.govt.nz/opsmanual/77823.htm ；https://www.immigration.govt.nz/opsmanual/80485.htm ；https://www.immigration.govt.nz/opsmanual/77820.htm | 见各快照版本日 | 2026-11-23 | `policy-sources/2026-11-23-nz-ops-app13-greenlist.html`（sha256 `9bd6425a598876b52a86cd498a6f1048163d49b0edb73e12b9ed4bdcf2ceeb03`）；`policy-sources/2026-03-09-nz-ops-sr4-10.html`（sha256 `e8e9d2988d72e3043033fcdbeefc20d848773e07141fd5fa2fa9c78a6e6e97e6`）；`policy-sources/2024-02-28-nz-ops-sr4-5.html`（sha256 `63b3ae3a930e5191d78fc22b7aa81e8f7079f435999a2c65629db5a3facfc5cb`）；`policy-sources/2026-08-24-nz-ops-sr5-10.html`（sha256 `601878192fb40c2d1f8917d329f5d0815d8b63aa489245d7cf23b7111e1ff289`）；`policy-sources/2026-10-05-nz-ops-sr5-15.html`（sha256 `ad82e9954a74df0305cb279b62116e275ba1d981b4239b1c043640f1edf762db`）；`policy-sources/2026-08-24-nz-ops-sr5-20.html`（sha256 `94fa6b39994f622646bdbde09347809d67e19c88f1e483a5093acf161359380e`）；`policy-sources/2026-10-05-nz-ops-sr5-5.html`（sha256 `f73591af77fe36088fad897e03d9311af8adea42d8a6a99c048e1055a59a5733`） | archived |
| SRC-238 | LAW | 新西兰：Care Workforce、Transport Sector 与附录 14 | https://www.immigration.govt.nz/opsmanual/78790.htm ；https://www.immigration.govt.nz/opsmanual/77205.htm ；https://www.immigration.govt.nz/opsmanual/78791.htm ；https://www.immigration.govt.nz/opsmanual/78792.htm ；https://www.immigration.govt.nz/opsmanual/87143.htm ；https://www.immigration.govt.nz/opsmanual/79670.htm ；https://www.immigration.govt.nz/opsmanual/79666.htm | 见各快照版本日 | 2026-11-23 | `policy-sources/2026-08-24-nz-ops-sr6-5.html`（sha256 `098ebdfd72f02d24ed883ef265c7e9d6a2c1256788891c0aadf8f78bdbb919df`）；`policy-sources/2025-03-10-nz-ops-app14-care.html`（sha256 `296d5a0b8e6a1726bf265ab16b927813f076a842ef9fc0175becdab9b5173829`）；`policy-sources/2026-08-24-nz-ops-sr6-10.html`（sha256 `d853c4efb936cdbc40941fbf087f2fdc058a86aa3afc3756fbc197d8f7f96bbe`）；`policy-sources/2026-08-24-nz-ops-sr6-15.html`（sha256 `c2529f2f9e48bf3f226d4a01ed3c3f766beb29df957bead713a7e2c9b2a7732b`）；`policy-sources/2026-08-24-nz-ops-sr7-10.html`（sha256 `215bf0f5bedc57dc333f6a69babdf11237e8a2124cf049f523154c6be6f402df`）；`policy-sources/2026-08-24-nz-ops-sr7-15.html`（sha256 `fd2319d8e45a9d229bfc1e0ac1e0b17291cd781e916cf5794c5e13214f096349`）；`policy-sources/2026-08-24-nz-ops-sr7-5.html`（sha256 `cd723a37fbb44068e1077d9425c4dd6ddcacbfb003463e69666cff7760d7f120`） | archived |
| SRC-239 | LAW | 新西兰：A4 居民健康标准、医疗证明与豁免，含公共医疗资格说明 | https://www.immigration.govt.nz/opsmanual/46506.htm ；https://www.immigration.govt.nz/opsmanual/46161.htm ；https://www.immigration.govt.nz/opsmanual/46507.htm ；https://www.immigration.govt.nz/opsmanual/44860.htm ；https://www.immigration.govt.nz/opsmanual/45636.htm ；https://www.immigration.govt.nz/opsmanual/44864.htm ；https://www.govt.nz/browse/health/public-health-services/getting-publicly-funded-health-services/ | 见各快照版本日 | 2026-11-23 | `policy-sources/2026-08-03-nz-ops-a4-10.html`（sha256 `b2b3fa908c9a1486eb6dd1e3fb835a5441e567169f5b309d9bc3fbf1eb55904a`）；`policy-sources/2026-11-16-nz-ops-a4-20.html`（sha256 `f6ae4e5b9b0d5f46bcb0319dc893f846e0fcf90d44cd239de9484e79dd175291`）；`policy-sources/2026-11-16-nz-ops-a4-25.html`（sha256 `09f21fb0591865ce6ac68e7d45521ce1739685abd1bd20dddcb4858710949ff4`）；`policy-sources/2026-11-16-nz-ops-a4-5.html`（sha256 `85f93200c9469e7f69669093898df6d7609d9a28dbbf24140d546aba74bfe23a`）；`policy-sources/2026-11-16-nz-ops-a4-60.html`（sha256 `07d8597a3ff0eb49c142772507f32452ce800a337af89f3e385418f0e304de95`）；`policy-sources/2026-11-16-nz-ops-a4-70.html`（sha256 `45d0f489ccfc3aa70f2ad617960450f43411619719c6d8e8c780fc61339eef10`）；`policy-sources/2026-11-23-nz-govt-health-eligibility.html`（sha256 `23cf5b730aef7fbd86cef686335433a59f66bc7f7dd2cb3c5d481430ed283e93`） | archived |
| SRC-240 | LAW | 新西兰：A5 品格、无犯罪证明、延期与 R5.100 制裁 | https://www.immigration.govt.nz/opsmanual/35057.htm ；https://www.immigration.govt.nz/opsmanual/35053.htm ；https://www.immigration.govt.nz/opsmanual/41439.htm ；https://www.immigration.govt.nz/opsmanual/35058.htm ；https://www.immigration.govt.nz/opsmanual/35059.htm ；https://www.immigration.govt.nz/opsmanual/35060.htm ；https://www.immigration.govt.nz/opsmanual/45181.htm ；https://www.immigration.govt.nz/opsmanual/44449.htm | 见各快照版本日 | 2026-11-23 | `policy-sources/2023-09-25-nz-ops-a5-20.html`（sha256 `01a67262399adc7f38d047c7ece1f89f5c60a24c505b12489e12de645c47e618`）；`policy-sources/2023-09-25-nz-ops-a5-1.html`（sha256 `d31cfbce10448c9e6a71d134fd0d1080b606009b8f516982cac6e2b21430c359`）；`policy-sources/2015-07-06-nz-ops-a5-10.html`（sha256 `e0b678db17d9082f547bf6990b13ce6d504c1d361aa193803a264c7ba92a4877`）；`policy-sources/2023-09-25-nz-ops-a5-25.html`（sha256 `27bbbb1eba73fa2e9f3e505e3cbfc5a1109372f689a750dc812a812d6ae87afd`）；`policy-sources/2021-07-02-nz-ops-a5-30.html`（sha256 `2f1686c1098cf68e91c53f95f167bd108747b5a3e2bb75f4b01b9eadc5bdc90e`）；`policy-sources/2026-11-16-nz-ops-a5-35.html`（sha256 `659594af77e98d92bc18053cc460f917ee3d28a45c85c9c71c63afaae0b715b3`）；`policy-sources/2025-12-08-nz-ops-a5-5.html`（sha256 `7441921a5d15d847d3616acf29a5801e05cfd7f6313915713620b136f019dfaf`）；`policy-sources/2026-03-16-nz-ops-r5-100.html`（sha256 `a6b479838cc0cca89344cb952c3fd1082739fa01a55f3b4101feb3e83a3330b3`） | archived |
| SRC-241 | LAW | 新西兰：SR2.10、BF 英语证明及 ESOL；R5.65 预付条件 | https://www.immigration.govt.nz/opsmanual/77808.htm ；https://www.immigration.govt.nz/opsmanual/30752.htm ；https://www.immigration.govt.nz/opsmanual/30753.htm ；https://www.immigration.govt.nz/opsmanual/30754.htm ；https://www.immigration.govt.nz/opsmanual/30755.htm ；https://www.immigration.govt.nz/opsmanual/64036.htm ；https://www.immigration.govt.nz/opsmanual/30759.htm ；https://www.immigration.govt.nz/opsmanual/45637.htm ；https://www.immigration.govt.nz/opsmanual/31002.htm | 见各快照版本日 | 2026-11-23 | `policy-sources/2026-08-24-nz-ops-sr2-10.html`（sha256 `f5490f120d82c8c2bc4797128547aee71ed4f9735c2f7ac496123c9b13047ef0`）；`policy-sources/2025-08-17-nz-ops-bf1.html`（sha256 `f401c5b34422b54841bf98133076d88bbfd2ef6accee753a90cdfa761706065a`）；`policy-sources/2023-08-27-nz-ops-bf1-1.html`（sha256 `cad66f06fea30834ea97d678dc503b26adaaad00ecf16c59e900feb411e731dc`）；`policy-sources/2024-06-26-nz-ops-bf2.html`（sha256 `2f0c0783a51c33519384f54772dbe991c1af599e3107867a145ad732c257516b`）；`policy-sources/2015-07-06-nz-ops-bf2-1.html`（sha256 `339e1aa302b77cac2f36e6860c705c0ff7f0c2df55b2c70a8eb85a9dca881ce5`）；`policy-sources/2018-05-21-nz-ops-bf2-20.html`（sha256 `463369257bc3fa8339b95543a659eaa12f70cc40139dcac3dea1a230bf21f479`）；`policy-sources/2010-11-29-nz-ops-bf3.html`（sha256 `3ae4870e0903b9f9ab03a133aba4e656230412b8b54fb6ae66ed73219ef8a008`）；`policy-sources/2018-05-21-nz-ops-bf3-15.html`（sha256 `f60a851c8d7ff4e100a1c84f2c52dfe897047accc1b908404c7014bfc252f4e0`）；`policy-sources/2025-12-14-nz-ops-r5-65.html`（sha256 `e8399c2701b9d8a94e3dc8c3b39e8c63e5e116fc44a36f94a18012aa709eef7b`） | archived |
| SRC-242 | LAW | 新西兰：F2 伴侣类、担保与既往未纳入申请的家属 | https://www.immigration.govt.nz/opsmanual/46503.htm ；https://www.immigration.govt.nz/opsmanual/46176.htm ；https://www.immigration.govt.nz/opsmanual/46502.htm ；https://www.immigration.govt.nz/opsmanual/30880.htm ；https://www.immigration.govt.nz/opsmanual/30882.htm ；https://www.immigration.govt.nz/opsmanual/46515.htm ；https://www.immigration.govt.nz/opsmanual/66589.htm ；https://www.immigration.govt.nz/opsmanual/44896.htm | 见各快照版本日 | 2026-11-23 | `policy-sources/2026-11-16-nz-ops-f2-5.html`（sha256 `96dda2ad3a9ca4ade08ef4067a74260f93c268abe3d12040f59446f4c23ee703`）；`policy-sources/2019-12-23-nz-ops-f2-10.html`（sha256 `4c3a7769c5a235b3b610211e8f4d747210764a4d6fd6326dd15de9f3c6ce5c84`）；`policy-sources/2026-09-25-nz-ops-f2-15.html`（sha256 `715ad058b8dcaa6627a71cd7576fcd126366355dc72290c08e0cfd7aca30cb52`）；`policy-sources/2018-05-07-nz-ops-f2-20.html`（sha256 `5ef8c10933000abd01291c10695d435c74c59039dd32aac02385e0a8345f4384`）；`policy-sources/2010-11-29-nz-ops-f2-30.html`（sha256 `042b9e8c4f324d220cf37e15dc07a7bf8e89d7b5aa6a06d2f3b228d378f734ff`）；`policy-sources/2026-11-16-nz-ops-f2-40.html`（sha256 `529b38eaab6e21aa2a25864e00f4c5da8719a1cae7bfb8b5cf8c755b9c6c301d`）；`policy-sources/2026-11-16-nz-ops-r5-95.html`（sha256 `c114c23d77f569edd6b1f9a74aa405c71bdcac033bbc28a16122264f65492822`）；`policy-sources/2026-11-16-nz-ops-r5-96.html`（sha256 `515208b3ecfab0bec325892774dadcdf01a9f6eacccdb53f680fc606cb72d8e2`） | archived |
| SRC-243 | LAW | 新西兰：F4 父母类、R4 担保条件与收入表 | https://www.immigration.govt.nz/opsmanual/73244.htm ；https://www.immigration.govt.nz/opsmanual/44878.htm ；https://www.immigration.govt.nz/opsmanual/73238.htm ；https://www.immigration.govt.nz/opsmanual/73239.htm ；https://www.immigration.govt.nz/opsmanual/73241.htm ；https://www.immigration.govt.nz/opsmanual/73242.htm ；https://www.immigration.govt.nz/opsmanual/73243.htm ；https://www.immigration.govt.nz/opsmanual/73246.htm ；https://www.immigration.govt.nz/opsmanual/73236.htm ；https://www.immigration.govt.nz/opsmanual/30983.htm ；https://www.immigration.govt.nz/opsmanual/30985.htm ；https://www.immigration.govt.nz/opsmanual/46713.htm | 见各快照版本日 | 2026-11-23 | `policy-sources/2026-04-30-nz-ops-f4-35.html`（sha256 `4cbbeec08f996ed793bb323d1a44b8bb321ded51242bb6a1e62ae5f066ad9254`）；`policy-sources/2026-10-05-nz-ops-f4-1.html`（sha256 `a9e33d9b9b1675f1eda0755dc73fe0564ef9c679a68b840e5d53240766c4598a`）；`policy-sources/2022-10-12-nz-ops-f4-10.html`（sha256 `53de999a0d8e50431e8a4ec3e77b8c75577c93a3f9f30aaf96a059d8460f9c81`）；`policy-sources/2025-09-29-nz-ops-f4-15.html`（sha256 `ab98c0eea5ffd0ebe9390c505d02638272f3f96286689935aaf752d3c6998e80`）；`policy-sources/2025-09-29-nz-ops-f4-20.html`（sha256 `9687d41c35382e26aa9c1c50d44a695a69e60113cb5d3632d1b8622ef87cb530`）；`policy-sources/2024-06-26-nz-ops-f4-25.html`（sha256 `f8bc6eb1850ce505e3960f15a02e6cf8bee06ac297da33bf006394b326a5e9a0`）；`policy-sources/2022-10-12-nz-ops-f4-30.html`（sha256 `ef199b699d618d011f556a0049f3b47c824edb61f52201ffe56f3bd51ba894cc`）；`policy-sources/2022-10-12-nz-ops-f4-45.html`（sha256 `5f5a7c4ea7121b668ce8c9ee828ad5408756217d5554c6bfaf2d5ced3b6d8924`）；`policy-sources/2026-10-27-nz-ops-f4-5.html`（sha256 `fe9141de64b8943313e824b74437af7eac30e74352360995bb887b02e1d985f9`）；`policy-sources/2010-11-29-nz-ops-r4-10.html`（sha256 `e47585e951e9125cc457aeebb8eaf35a470997bbc57bc5a30aa70239f2e2cf61`）；`policy-sources/2022-07-01-nz-ops-r4-20.html`（sha256 `1448e0813035be685ffd47a44046abbac053e00f9a873dedfe41b28915d9b5ec`）；`policy-sources/2017-05-29-nz-ops-r4-5.html`（sha256 `1ca46aef7268de1747a75bd343d70679075064ce5bc509cfda3e6e0e84974207`） | archived |
| SRC-244 | LAW | 新西兰：BN 积极投资者及 BM 商业品格 | https://www.immigration.govt.nz/opsmanual/78330.htm ；https://www.immigration.govt.nz/opsmanual/63834.htm ；https://www.immigration.govt.nz/opsmanual/63832.htm ；https://www.immigration.govt.nz/opsmanual/78360.htm ；https://www.immigration.govt.nz/opsmanual/78361.htm ；https://www.immigration.govt.nz/opsmanual/78329.htm ；https://www.immigration.govt.nz/opsmanual/78331.htm ；https://www.immigration.govt.nz/opsmanual/78333.htm ；https://www.immigration.govt.nz/opsmanual/90550.htm ；https://www.immigration.govt.nz/opsmanual/78345.htm ；https://www.immigration.govt.nz/opsmanual/90551.htm ；https://www.immigration.govt.nz/opsmanual/78351.htm ；https://www.immigration.govt.nz/opsmanual/78353.htm ；https://www.immigration.govt.nz/opsmanual/78349.htm ；https://www.immigration.govt.nz/opsmanual/78356.htm | 见各快照版本日 | 2026-11-23 | `policy-sources/2025-04-01-nz-ops-bn3.html`（sha256 `3f236de7514c65a51d041406f0b7eea5f9ccf20a7d790f5bf7cb5e0e1aacdf77`）；`policy-sources/2025-11-24-nz-ops-bm1.html`（sha256 `05c1f60a6c38f6f8d73da24796363278ad8731d436a8c4ca8fe1f54a1e95b72e`）；`policy-sources/2017-05-08-nz-ops-bm2.html`（sha256 `d23ce01f5c78567ff47f1646948b6c1dc8fe7dd36df6392d9ab3dcdf6b4aded0`）；`policy-sources/2025-04-01-nz-ops-bn10-10.html`（sha256 `6abf3204b89e0f51952434165cc717c217748ccf03766aec435322196690693b`）；`policy-sources/2025-08-17-nz-ops-bn10-15.html`（sha256 `dfee39f7290f4eec507d200e42f7b7a747ff38544243049f0ca9c71eed88fb98`）；`policy-sources/2022-09-19-nz-ops-bn2.html`（sha256 `900c4b1f66b61b096f0096785e7e07395a272530f153b51d190c977accbf4eae`）；`policy-sources/2022-09-19-nz-ops-bn4.html`（sha256 `9dcfdd5f42fb2892775178bc9250edf5dc3c28fae7b64374029823442cd3e53e`）；`policy-sources/2025-04-01-nz-ops-bn6.html`（sha256 `40c3180299058b993f3dee9e6ce3e4177c28ef0af0fbc4271800cdfcf64c1dfd`）；`policy-sources/2026-08-12-nz-ops-bn6-5.html`（sha256 `b4a9d1b4b011740e6ca26b45c849dc8b8c9c19f0c64db7bf8b61725623ee9c73`）；`policy-sources/2026-06-01-nz-ops-bn7-1.html`（sha256 `a55a8210b933187fa763303425ac8bbaa0d5d94def4c0297d7c6cf4cd4f40dfa`）；`policy-sources/2026-08-12-nz-ops-bn7-10.html`（sha256 `f6cb62e6ef967776f9606e35b023becc004240304cfbe38988cd40bdba769d39`）；`policy-sources/2025-04-01-nz-ops-bn8-15.html`（sha256 `a9f8785185509c5124cb934ed7d7b19cd82e946c1413faff6a1f69a9c24f1251`）；`policy-sources/2025-04-01-nz-ops-bn8-25.html`（sha256 `cad1f3aa55f5bf7e2ee1b27f52d9be6420180a8dde498b225bf50761996990c5`）；`policy-sources/2026-06-01-nz-ops-bn8-5.html`（sha256 `3abff637334c71a9d7a93a8ddaaddb58f5f2906105fbd29104607d7d84f03d11`）；`policy-sources/2025-04-01-nz-ops-bn9-1.html`（sha256 `a8b74b77421d42f290cd7a58417fff7bc784b3b06c14373228f8f7047030721e`） | archived |
| SRC-245 | LAW | 新西兰：BD2 商业投资者工签及 BI 居民签证 | https://www.immigration.govt.nz/opsmanual/88421.htm ；https://www.immigration.govt.nz/opsmanual/88541.htm ；https://www.immigration.govt.nz/opsmanual/88545.htm ；https://www.immigration.govt.nz/opsmanual/88546.htm ；https://www.immigration.govt.nz/opsmanual/88547.htm ；https://www.immigration.govt.nz/opsmanual/88423.htm ；https://www.immigration.govt.nz/opsmanual/88422.htm ；https://www.immigration.govt.nz/opsmanual/88429.htm | 见各快照版本日 | 2026-11-23 | `policy-sources/2025-11-24-nz-ops-bi2-1.html`（sha256 `50fd6b3445656a415fe771045250a19833b1bc84c61c0688bb18338989b4dda5`）；`policy-sources/2025-11-24-nz-ops-bd2-1.html`（sha256 `989f72919701e9a06b22336e96e970e9ad5375e21a3dd4843f7df63b70d281e3`）；`policy-sources/2025-11-24-nz-ops-bd2-20.html`（sha256 `b97df1ccbd97151a2fa7b3362c57f97f1845da1b65bd30cc5fc1cd1d5db2c61d`）；`policy-sources/2025-11-24-nz-ops-bd2-25.html`（sha256 `546297a7f4158f4589386028c762bf0f712c779b7f924ba3ea5bfbb66f96e868`）；`policy-sources/2025-11-24-nz-ops-bd2-30.html`（sha256 `5dd84b5c96baf3782138e494144788dfbb47bb78a614c6b8acfbe24fe4117234`）；`policy-sources/2025-11-24-nz-ops-bi2-10.html`（sha256 `1ce7060e3e21cf4f93a528763a6bbc187a357efea4872bcf236af3a18eec8df6`）；`policy-sources/2025-11-24-nz-ops-bi2-5.html`（sha256 `1d576434395aae100b24ffefbfbb3323024911d8c13447aa18e701af8d299a58`）；`policy-sources/2025-11-24-nz-ops-bi4-1.html`（sha256 `1c2f69ef06d1d9d742671cb931b33bc943b7d37e0bf86ac959de72a7483f9a14`） | archived |
| SRC-246 | LAW | 新西兰：RW5 英语及 RW7 宗教工作者居留 | https://www.immigration.govt.nz/opsmanual/42677.htm ；https://www.immigration.govt.nz/opsmanual/42669.htm ；https://www.immigration.govt.nz/opsmanual/45652.htm ；https://www.immigration.govt.nz/opsmanual/42672.htm ；https://www.immigration.govt.nz/opsmanual/42676.htm | 见各快照版本日 | 2026-11-23 | `policy-sources/2015-07-06-nz-ops-rw7-5.html`（sha256 `40711660ea25439d4d6642842b0085c88db2c2ccc6fac78c42b7c76f51ff162d`）；`policy-sources/2024-06-26-nz-ops-rw5-1.html`（sha256 `38cb1c7241e6f2d84270ead57dfe064d6c3a403af067d4a7ef13f28f57b8e060`）；`policy-sources/2018-05-21-nz-ops-rw5-40.html`（sha256 `13e03688193365070dd414f5e0bd46e11ff6275101412f319427d15da4c756c2`）；`policy-sources/2024-04-11-nz-ops-rw7-10.html`（sha256 `4e1d15af21d7f5b1a5642246501555c958cef9bcaa572401610f4d71e643d42f`）；`policy-sources/2011-11-07-nz-ops-rw7-20.html`（sha256 `0e6e0e8de7c53d661f00ad4a49e52d2297d289d445f57925211999bd72aafdf8`） | archived |
| SRC-247 | GUIDANCE | 新西兰：IRD 个人税务居民身份 | https://www.ird.govt.nz/international-tax/individuals/tax-residency-status-for-individuals | 见各快照版本日 | 2026-11-23 | `policy-sources/2026-11-23-nz-ird-tax-residency.html`（sha256 `cea73394601eac5317370415b7c03dfda735c620a9b79d9bc6be6ffb84e3daa5`） | archived |
| SRC-248 | POLICY | 新西兰：财政部投资移民购房政策分析，非签证资格门槛 | https://www.regulation.govt.nz/assets/RIS-Documents/Supplementary-Analysis-Report-Enabling-investor-visa-holders-to-purchase-or-build-a-home-in-New-Zealand.pdf | 见各快照版本日 | 2026-11-23 | `policy-sources/2025-11-06-nz-treasury-sar-investor-home.pdf`（sha256 `756d6f20ca4f6bfeb2db3ee131562a9ef32bf8b407fafc4fce36a1143aca4060`） | archived |
| SRC-249 | GUIDANCE | 新西兰 INZ 1028《Fees Guide》，申请费、费区和征费 | https://www.immigration.govt.nz/assets/inz/documents/forms-and-guides/Fees-Guide-INZ-1028.pdf | 2026-05 | 2026-11-23 | 已在线核对 PDF 原文，待归档原件 | todo |
| SRC-250 | GUIDANCE | 新西兰 LINZ 投资者签证持有人购房指引与修法沿革 | https://www.linz.govt.nz/sites/default/files/doc/guidance-investor-visa-holders-long-form-march2026-v3.pdf ；https://www.linz.govt.nz/our-work/overseas-investment-regulation/history-overseas-investment-regime | 2026-03-26；沿革页为动态页面 | 2026-11-23 | `policy-sources/2026-03-26-nz-linz-investor-housing.pdf`（sha256 `94111f35ca02668986e3555e221efabab06ed1b77454cd5c4ccce51e7200a047`）；`policy-sources/2026-11-23-nz-linz-investment-history.html`（sha256 `262a67bf6dc4ef6f3978eaf160eb1866b5a74c975fabe672481e79272f866a33`） | archived |
| SRC-251 | LAW | 新西兰 Business Investor 工签家属、临时签证纳入与递交条件 | https://www.immigration.govt.nz/opsmanual/88409.htm ；https://www.immigration.govt.nz/opsmanual/46501.htm ；https://www.immigration.govt.nz/opsmanual/45639.htm | 见各快照版本日 | 2026-11-23 | `policy-sources/2026-04-20-nz-ops-bd3-1.html`（sha256 `afb18eff525cdaeee5b93947dc2e14e026aa015914c2cb9fca93829088b13725`）；`policy-sources/2024-10-01-nz-ops-e4-1.html`（sha256 `a1a54f362ef3d2179f77fd00a14cd094a49c00ac0ade336557c4dd1afb0e2614`）；`policy-sources/2025-04-04-nz-ops-e4-50.html`（sha256 `b11323d05c55c2460e0a5f38b98bc45bf87ca348d47f1bcb6a896ec73bf04f5b`） | archived |
| SRC-252 | LAW | 新西兰居民签证申请人有在新西兰非法居留的受抚养子女 | https://www.immigration.govt.nz/opsmanual/91747.htm ；https://www.immigration.govt.nz/opsmanual/30996.htm | R5.125：2026-11-12；R5.30：2025-12-14 | 2026-11-23；2026-11-24 补档 | `policy-sources/2026-11-12-nz-ops-r5-125.html`（sha256 `e7699e1567ae21752e9e724c54a425cc79287477277296232db69d2ccd81e56b`）；`policy-sources/2025-12-14-nz-ops-r5-30.html`（sha256 `80d56de73119847abf8195df7bbe0c2e970dabff42fe25dcaaf18b595d043a4f`） | archived |
| SRC-260 | LAW | Citizenship Act 与两部 Citizenship Regulations | https://laws-lois.justice.gc.ca/eng/XML/C-29.xml ；https://laws-lois.justice.gc.ca/eng/XML/SOR-93-246.xml ；https://laws-lois.justice.gc.ca/eng/XML/SOR-2015-124.xml | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-citizenship-act.xml`（sha256 `306f0834876ab02efb3fa2ab5be29a891a2ae7d2efd7d1c6c313ece0f16d28bb`）；`policy-sources/2026-11-23-ca-citizenship-regulations.xml`（sha256 `c6762435bd6b77fa22a4420b797f448ed007dcc67c0c538fb53eaf031ae19211`）；`policy-sources/2026-11-23-ca-citizenship-regulations-no2.xml`（sha256 `cda6dd032ed150905bced2968bba6f736f19b2a50dd2c0b20148da67f2fca8b7`） | archived |
| SRC-261 | LAW | Immigration and Refugee Protection Act 与 Regulations | https://laws-lois.justice.gc.ca/eng/XML/I-2.5.xml ；https://laws-lois.justice.gc.ca/eng/XML/SOR-2002-227.xml | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-irpa.xml`（sha256 `4594fdd6ae51858bc5f37334acef0296e0b3bcf0fdd966c2bcc8e4769b385cbc`）；`policy-sources/2026-11-23-ca-irpr.xml`（sha256 `5d4b6f6189e93b669fcf9e8fdc5f78dd57c5a34fdecb5bf80500cf33b29afde1`） | archived |
| SRC-262 | GUIDANCE | IRCC 成人及未成年人入籍指南、CRA 税务指引 | https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/adult-minor/who.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/cit0002.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/cit0403.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/adult-minor/who/minor-types.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/situtations-prevent-citizenship.html ；https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/individuals-leaving-entering-canada-non-residents/newcomers-canada-immigrants.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/cit0003.html | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-citizenship-eligibility.html`（sha256 `2c33aa3ab351dc3da721e6f2b64d09549487a1057c9a9e448501d611bbb69a04`）；`policy-sources/2026-11-23-ca-citizenship-adult-guide.html`（sha256 `58dfa55f211a1f61550bbbfe8cb97a7013291db49ddb26d26c5e2cd192098171`）；`policy-sources/2026-11-23-ca-citizenship-minor-51-guide.html`（sha256 `d2fd27f67161de90acf468a70af59571eb79bd254ceeedc805707fb491007414`）；`policy-sources/2026-11-23-ca-citizenship-minor-52-details.html`（sha256 `6c78d552992a27c5ec959f421ba1863263ef058f2ae87a8c0aa3aa5fa4711a28`）；`policy-sources/2026-11-23-ca-citizenship-prohibitions.html`（sha256 `6b46892272cf0878ec0341fe8da672dcbb6beff147ddf26b280985fcf29186c6`）；`policy-sources/2026-11-23-ca-cra-newcomers.html`（sha256 `3046628369b3975bb6409a9efe59cb548dfdfe7a92c8e8b183c10a472921d5be`）；`policy-sources/2026-11-23-ca-citizenship-minor-52-form.html`（sha256 `e146f590c905fecbe04d82ef6d8a58e67ab7cf0fccd6e0c92ac70ca96b71b995`） | archived |
| SRC-263 | GUIDANCE | IRCC 入籍语言、考试及豁免 | https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/language-proof.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/test/study.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/waiver/who.html | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-citizenship-language.html`（sha256 `b573e07309da32ca4bffdb874bc7ffaa27be8e00176029c5c61c61c568669791`）；`policy-sources/2026-11-23-ca-citizenship-test.html`（sha256 `cb6ae1c985290d92e29f0f13c81b5582d63b0867629c49d46a35a70c04ff5c3c`）；`policy-sources/2026-11-23-ca-citizenship-waiver.html`（sha256 `970571d9876a0c5bd681978de3dab53ecb4c9f52d9dce011f670d026e271f872`） | archived |
| SRC-264 | GUIDANCE | IRCC 费用表与生效日期 | https://ircc.canada.ca/english/information/fees/fees.asp ；https://ircc.canada.ca/english/information/fees/fee-changes.asp ；https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/right-citizenship-fee-increasing.html | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-fee-list.html`（sha256 `f2351ddd43a0f4e260fbe14e1542e1be3ab860c2873b70f1f2350bff330b3c94`）；`policy-sources/2026-11-23-ca-fee-changes.html`（sha256 `f5415e1d51f131233e1e9fa3e5d00d000e135e48e87938182d83e363160773ce`）；`policy-sources/2026-11-23-ca-citizenship-fee.html`（sha256 `22d02c5b82a7a89ba46be6682f14c455bfa960814743cea946ebf2206e042c3c`） | archived |
| SRC-265 | GUIDANCE | IRCC 永居身份、PR card 与 PRTD | https://www.canada.ca/en/immigration-refugees-citizenship/services/permanent-residents/status.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5445-applying-permanent-resident-card-card-first-application-replacement-renewal-change-gender-identifier.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5529-applying-permanent-resident-travel-document.html ；https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/card/permanent-resident-determination.html | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-pr-status.html`（sha256 `f0d702a6014068a337e462453379f4558ed2c85a6edcbb25a9a4d2cc4091d371`）；`policy-sources/2026-11-23-ca-pr-card-guide.html`（sha256 `dcc3f606af5ce028d4dc0c6e066aa2b38d71699873f581b7c50db0ceacff1622`）；`policy-sources/2026-11-23-ca-prtd-guide.html`（sha256 `63bbfd29b0db52538353a687e120aa555d7b8926145aada92e87661c50158952`）；`policy-sources/2026-11-23-ca-pr-residency-pdi.html`（sha256 `56d681bd6e1733ab79137c2ca46e12fd09e86d488a916fb2fcd6006445d72727`） | archived |
| SRC-266 | GUIDANCE | IRCC 准入、体检、警证与生物识别 | https://www.canada.ca/en/immigration-refugees-citizenship/services/admissibility-enforcement/inadmissibility/reasons.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams/requirements-permanent-residents.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/admissibility-enforcement/inadmissibility/medical.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/biometrics/who-needs-to-give.html ；https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/public-policies/excempt-ime-2024.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates/when.html ；https://www.canada.ca/content/dam/ircc/documents/pdf/english/kits/forms/imm0199/01-05-2026/imm0199e.pdf ；https://www.canada.ca/content/dam/ircc/documents/pdf/english/kits/forms/imm5690/01-05-2026/imm5690e.pdf ；https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates/how/hong-kong.html ；https://sps.dubaipolice.gov.ae/wps/wcm/connect/DubaiPolice_en/DubaiPolice/Our-Services/Good-Conduct-Certificate?presentationtemplate=DubaiPolice_Design_2_0/details | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-inadmissibility.html`（sha256 `203cd668a3c19028141cee12b105dba5310ad42f2004e13490e9a054fb24032d`）；`policy-sources/2026-11-23-ca-medical-pr.html`（sha256 `063acbc962a42d825beede55898ff31ef07414d252b89d6ff15f62788643ad0d`）；`policy-sources/2026-11-23-ca-police.html`（sha256 `3b731ea4b4c85be9868faebdca4862cad1a0d270608209f7a35c6f0b93b76b5a`）；`policy-sources/2026-11-23-ca-medical-excessive-demand.html`（sha256 `f1fdb6dc13ecd0eb47dc77c6c23d76f5ed63d7e79cb08bbdfcb5cc0d94687d2f`）；`policy-sources/2026-11-23-ca-biometrics.html`（sha256 `07ef16eb3ba8368a0abb01e06bea83d0069a86b89bc26c9f819b12608f4a46fa`）；`policy-sources/2026-11-23-ca-medical-public-policy.html`（sha256 `18173f26c0b9a4503eba8e278724ce47904561732a89d87416985274cf1d57e4`）；`policy-sources/2026-11-23-ca-police-validity.html`（sha256 `133fbcdd075ac9436122bb71b55beff30c5c5d5ce6822fdcf6506b9303133205`）；`policy-sources/2026-11-23-ca-pnp-checklist.pdf`（sha256 `5b596dbe69f00160d34384682009ee9165bca3862245626a290501b5a086e292`）；`policy-sources/2026-11-23-ca-quebec-checklist.pdf`（sha256 `5a54dbf45acdcc5b107e25464cc3fdf6bb635418839f6c1dfff1efe5e4fbc81e`）；`policy-sources/2026-11-23-ca-police-hong-kong.html`（sha256 `6c990637d6d05e019b511279895492e0e7a25c6ec54274d23480106783901d84`）；`policy-sources/2026-11-23-ca-police-dubai.html`（sha256 `affb21a8f166a9c9317f676f1a12709b6bb0593c6f88e6cb00b82f7afd77efeb`） | archived |
| SRC-267 | GUIDANCE | IRCC 三类 Express Entry 项目的资格 | https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/canadian-experience-class.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-trades.html | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-ee-fsw.html`（sha256 `5b873b077ada7785a065310d52fb6ef1d8e9815bae8d0b5cf15ad3954b56ee94`）；`policy-sources/2026-11-23-ca-ee-cec.html`（sha256 `502f067e7eb0d7b938de43fbe178c203e979a793d3ee0f0c7db2260b23f47516`）；`policy-sources/2026-11-23-ca-ee-fst.html`（sha256 `2aa310e5781f74bc861b7402c67b6318cc403209c405a634c92cb7b90533b58d`） | archived |
| SRC-268 | GUIDANCE | IRCC Express Entry 资金、语言与学历认证 | https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessment.html | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-ee-funds.html`（sha256 `818578d55c3627325415a7ec8653b52f11ccb1f48ecb6424ff2a119ddcb2b9ea`）；`policy-sources/2026-11-23-ca-ee-language.html`（sha256 `2181213f1542c8f218a08dd620d0ab54471cf893d86818ddd52829718bc72ff0`）；`policy-sources/2026-11-23-ca-ee-eca.html`（sha256 `cb79ba01b6426b91b531f0288964c1ce31d52958fde1b8c3d7625ae2d81a6ed7`） | archived |
| SRC-269 | LAW | IRCC Express Entry 部长指令、临时政策、排名与邀请 | https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-application-management-system.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/changes.html ；https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/public-policies/exempt-lmia-express-entry.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html ；https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-application-management-system/current.html ；https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-application-management-system/amendment-2026-2.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html ；https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-application-management-system/amendment-2026-1.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/high-wage.html | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-ee-mi-index.html`（sha256 `dc57e784ad3437392ba43b4f867bacc6943ad084058b995a699deac9e151975e`）；`policy-sources/2026-11-23-ca-ee-changes.html`（sha256 `f39f094650c8a7ba71e87710eee465be0f808a2a66e936e10b3ef7d4d25ae00d`）；`policy-sources/2026-11-23-ca-ee-lmia-policy.html`（sha256 `e6b5051f225634a106cd3323a448176bcdf25c0640e31f339aa871beedbac517`）；`policy-sources/2026-11-23-ca-ee-rounds.html`（sha256 `6aa70fcd85a9f019cbd8d909e7aecfa793d27a99fc9f42658999f6595e00e351`）；`policy-sources/2026-11-23-ca-ee-mi.html`（sha256 `0156006c211d943d0edbd3c530f56f5b2cc158c5b56407afdd5dc872dadf0259`）；`policy-sources/2026-11-23-ca-ee-amendment-2.html`（sha256 `0be51e782f0147537483f647b529e6ae84303e452620cbb05bac97f44a6ee0e7`）；`policy-sources/2026-11-23-ca-ee-crs.html`（sha256 `fc5c2625a6ca10a6077064739fd587aae5b3286406d1876dbad7ea8a427df9b0`）；`policy-sources/2026-11-23-ca-ee-amendment-1.html`（sha256 `41ee6391da096668f8dbfb22ac9ab290afeb4b2442b6888b25268b807797e98e`）；`policy-sources/2026-11-23-ca-ee-high-wage.html`（sha256 `b56ccd0853e7740955e873c06a3192e7f77417b6b8336c5ee323ebf8c21cfc82`） | archived |
| SRC-270 | GUIDANCE | IRCC Atlantic Immigration Program | https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate/eligibility.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate/job-offer.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/proof-funds.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/language-testing.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate/work-experience.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/education-assessment.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/settlement-service-provider-organizations.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/post-secondary-institutions.html | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-aip-eligibility.html`（sha256 `b8d52a00e250de70f02147a1e45acc86f190e99bff9e6fc80df430caf081ad9a`）；`policy-sources/2026-11-23-ca-aip-job.html`（sha256 `90ff8b6241c633259c98d65fe70a4c1e5e8094fd7416823344d2b75d9a80fa69`）；`policy-sources/2026-11-23-ca-aip-funds.html`（sha256 `8f8d429e523347cca7d1820719cf480769084ff0f7e9a7e261c0d3a7378e49de`）；`policy-sources/2026-11-23-ca-aip-program.html`（sha256 `aa765ba6b9be6f0b29a448489fb88908a8443a1cf03f7a3f84f829c35b4cd561`）；`policy-sources/2026-11-23-ca-aip-language.html`（sha256 `6c80f4146236e8d3f2f2937cea8045b6d878dcb3220e12bcee65c52b1857d743`）；`policy-sources/2026-11-23-ca-aip-work.html`（sha256 `dfd90132ca0e1a206ec589528b3489f626aa3ebfb2a662efb951f6623cde91cc`）；`policy-sources/2026-11-23-ca-aip-education.html`（sha256 `b7566a7d532ef67d39379eb98ec2a394324c00cb1ecef462563eda3fd8f7437b`）；`policy-sources/2026-11-23-ca-aip-settlement.html`（sha256 `83859aa154f15f281f2798504fa94765b688bc68ed41996b48bde0f424d1f086`）；`policy-sources/2026-11-23-ca-aip-institutions.html`（sha256 `419f2106f937669a46ba06e9c4cbda22bbb90617fe0f47b92bfc8c1222066503`） | archived |
| SRC-271 | GUIDANCE | IRCC 省提名联邦阶段、递交通道及 BC 提名后指引 | https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees/non-express-entry.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees/express-entry.html ；https://www.welcomebc.ca/immigrate-to-b-c/for-nominees ；https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/economic-classes/procedures-centralized-intake-office-paper-based-non-applications.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees/express-entry/get-confirm-nomination.html | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-pnp.html`（sha256 `b25198a8cea2ebd776d36ed81da2da13a02cc9bd43c915ec62641ca8c43514d1`）；`policy-sources/2026-11-23-ca-pnp-base.html`（sha256 `d7fc0bade071f9df29533c344c76e5c9ffc42d6aff17fd8135dd0396228a9f57`）；`policy-sources/2026-11-23-ca-pnp-ee.html`（sha256 `bfa00e9a06e6aa48649889c2fa3b339db6865d029e657d6f61643e207e25ce2a`）；`policy-sources/2026-11-23-ca-bc-nominees.html`（sha256 `eb61268641ed4d76c19966fd80503cc7961f9446ec0bc798605d24611cae01a7`）；`policy-sources/2026-11-23-ca-pnp-federal-intake.html`（sha256 `26065714b3ea0e37c06b1920739c3a223c4ebbeea8e3a0a5a28f00351f5dd304`）；`policy-sources/2026-11-23-ca-pnp-ee-nomination.html`（sha256 `531b515b3c5606243cc398c49b89daee9885352566ab9a54c408e69f04d9a713`） | archived |
| SRC-272 | LAW | Ontario Workforce Priority 法规、资格及程序 | https://www.ontario.ca/laws/regulation/170422 ；https://www.ontario.ca/page/ontario-workforce-priority-stream ；https://www.ontario.ca/page/2026-ontario-immigrant-nominee-program-updates ；https://www.ontario.ca/page/oinp-application-process | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-ontario-reg.html`（sha256 `47789958fa957cbd83751da8151ca94a4a5e350819ba8239df8e365527b5e934`）；`policy-sources/2026-11-23-ca-ontario-workforce.html`（sha256 `4eed36d9ecabe8670113a714628bf04fb4d6d21347d7bb3b90f0289de867e815`）；`policy-sources/2026-11-23-ca-ontario-updates.html`（sha256 `1788b951b4b9db8d70f988b4629a17788ca8c07079f0b40670682360a9f548fd`）；`policy-sources/2026-11-23-ca-ontario-application.html`（sha256 `c9e44b2ed8b18aa2027a4981d6b71e1953d70b301a83c8f0b86cc21d6ab2bd74`） | archived |
| SRC-273 | GUIDANCE | Québec PSTQ、CSQ、自足金、法语及价值观 | https://www.quebec.ca/en/immigration/permanent/skilled-workers/skilled-worker-selection-program/requirements ；https://www.quebec.ca/en/immigration/permanent/skilled-workers/skilled-worker-selection-program/invitation ；https://www.quebec.ca/en/immigration/permanent/skilled-workers/skilled-worker-selection-program/applying ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/quebec-skilled-workers/eligibility.html ；https://cdn-contenu.quebec.ca/cdn-contenu/immigration/formulaires/fr/bareme_autonomie_financiere_programmes_immigration.pdf ；https://www.quebec.ca/en/immigration/receiving-attestation-values ；https://www.quebec.ca/en/immigration/receiving-attestation-values/online-assessment-attestation-values ；https://www.quebec.ca/en/immigration/permanent/skilled-workers/skilled-worker-selection-program/examination ；https://www.quebec.ca/en/immigration/permanent/skilled-workers/skilled-worker-selection-program/requirements/knowledge-french ；https://cdn-contenu.quebec.ca/cdn-contenu/immigration/formulaires/fr/PSTQ/LIS_PSTQ_PTA_Professions_reglementees.pdf ；https://cdn-contenu.quebec.ca/cdn-contenu/immigration/formulaires/fr/PSTQ/LIS_PSTQ_Accomplissements_exceptionnels.pdf ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/quebec-skilled-workers/apply.html | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-quebec-requirements.html`（sha256 `8f35f5b4daeaaf6099cc62a0d33ab3dd25b56bdc9580991f8508eee68c31e7f3`）；`policy-sources/2026-11-23-ca-quebec-invitations.html`（sha256 `700daee74610ce7323a95b0194d06f896abe42e04f4dcdd6f0f309b991f02bc4`）；`policy-sources/2026-11-23-ca-quebec-apply.html`（sha256 `6069e69c714b9d10dd0e83983a6bc350be527d74e941f24b2dcaf57b1b6ddcf3`）；`policy-sources/2026-11-23-ca-quebec-federal.html`（sha256 `5dc8cd3ebf0cb55f9bc0372d23f3471ebb67a023ebb44c744d5edf650997c33a`）；`policy-sources/2026-11-23-ca-quebec-funds.pdf`（sha256 `fd6a995aba5d61b4e502b55ff68f168d8b4872ee556d5c7e72ba8b37d9544c14`）；`policy-sources/2026-11-23-ca-quebec-values.html`（sha256 `c710dd7d733a86fd71ea6c9f26722efc8d8b61a8f976e95abea8de81219211c1`）；`policy-sources/2026-11-23-ca-quebec-values-test.html`（sha256 `56e40df114c3c229b6d2eee018d35b2b869f3d0a308b91c92aed33b201687b86`）；`policy-sources/2026-11-23-ca-quebec-examination.html`（sha256 `55549720f635dce653a19f7dd3676742e3eb31d8078d09e60c1b7aa5edac72cf`）；`policy-sources/2026-11-23-ca-quebec-french.html`（sha256 `47d81fa23d32469555af7d8cb586c1981bdb7c35fab8c04d4a18299f47a4e7b0`）；`policy-sources/2026-11-23-ca-quebec-regulated.pdf`（sha256 `14cd2faed24c375a93844da7e77a53b662120a4813239ee397bc9c46966d4f22`）；`policy-sources/2026-11-23-ca-quebec-achievements.pdf`（sha256 `78afe65d94fcb36a74266fec4b1723a12587c6b2c08bd0b1f419c607628f78db`）；`policy-sources/2026-11-23-ca-quebec-federal-apply.html`（sha256 `b8c5511c7f6ff0f049c9967bf16c08e788d8f2e8b3ab357d5aa609959842a30b`） | archived |
| SRC-274 | GUIDANCE | IRCC 配偶、伴侣与子女担保 | https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/eligibility.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/who-you-can-sponsor.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5289-sponsor-your-spouse-common-law-partner-conjugal-partner-dependent-child-complete-guide.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm1283.html ；https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/non-economic-classes/family-class-spouse.html ；https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/immigration-refugee-protection-act-spousal-policy.html ；https://www.canada.ca/content/dam/ircc/documents/pdf/english/kits/forms/imm5533/01-09-2022/imm5533e.pdf | 见登记备注 | 2026-11-23、2026-11-24 | `policy-sources/2026-11-23-ca-family-sponsor.html`（sha256 `656ba9c8210a14891f9935387dc1a94b2ccafdddfcfaa48188d11fece7475b06`）；`policy-sources/2026-11-23-ca-family-sponsored.html`（sha256 `f46b56a5358384776de23cc7bd49be45c5c6889c3a5e82269330128ca750e6b7`）；`policy-sources/2026-11-23-ca-family-guide.html`（sha256 `fb05937b357ca52f3b03619a78b7e87d0efe405b58068d697409da84cc7b77c7`）；`policy-sources/2026-11-23-ca-family-income.html`（sha256 `a4c7ee55769eb0d11ef5ff662513c779c13ca6687c236bac2e03bcbb975e3a13`）；`policy-sources/2026-11-23-ca-family-status-policy.html`（sha256 `bb4bfdebec194e672c68c35fae8f5426055a20f09f65a4a527cc82d666020877`）；`policy-sources/2026-11-23-ca-family-lack-status-policy.html`（sha256 `c178fcc3d65e911a302c3a5f21f266af321b3a5d9c9615e401a1c5ed9456b69e`）；`policy-sources/2022-09-01-ca-family-spouse-checklist.pdf`（sha256 `dbefe411b48b4ad10368788d37a5cf0e6dcef1a8d11fd15daf114e0fc31b85d8`） | archived |
| SRC-275 | GUIDANCE | Québec 家庭担保承诺、收入、限额与费用 | https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-spouse-conjugal-partner ；https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-dependent-child ；https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/rules-reception-applications ；https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/calculating-income ；https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-spouse-conjugal-partner/verifying-your-eligibility ；https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-spouse-conjugal-partner/submitting-undertaking-application ；https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-dependent-child/verifying-your-eligibility ；https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-dependent-child/undertaking-application ；https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-spouse-conjugal-partner/responsibilities-undertaking ；https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-spouse-conjugal-partner/verifying-eligibility-spouse-conjugal-partner ；https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-dependent-child/verifying-eligibility-child ；https://cdn-contenu.quebec.ca/cdn-contenu/immigration/formulaires/fr/Regroupement_familial/FO_engagement_regroupement_familial_A0546GF.pdf?1649339295= | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-quebec-family.html`（sha256 `7bcbf5bbcdc833974cd82cac4c471ceb88bad7d9d59e45047aab6c8107a156e9`）；`policy-sources/2026-11-23-ca-quebec-child.html`（sha256 `019c8fa3592c981e1eecae8603eb495548614adc90d23a772cd8ccbeac1ed4ea`）；`policy-sources/2026-11-23-ca-quebec-sponsor-cap.html`（sha256 `163ca213123b229afd839c3334c6dc000d9e209392ae5c1a71bfceeb32b1efed`）；`policy-sources/2026-11-23-ca-quebec-family-income.html`（sha256 `7dde6e197b7f1c64e55a90456130969c2ed8e8b2c67100ef7050db0024332e7b`）；`policy-sources/2026-11-23-ca-quebec-family-eligibility.html`（sha256 `4ab9635294c58748256b863794b89cddd12a3779ae232980ecfba035755d307c`）；`policy-sources/2026-11-23-ca-quebec-family-undertaking.html`（sha256 `b3f7a9683b1b51e5bf181ae985dc1a8c4f18ecff05affc475d99fbb22ff52644`）；`policy-sources/2026-11-23-ca-quebec-child-eligibility.html`（sha256 `d3bcf1a702837e514ba31fc8626a8b7e735f0cdc61742826e5736e7d83a92ccc`）；`policy-sources/2026-11-23-ca-quebec-child-undertaking.html`（sha256 `723a15a838b86e82f09c9c0156c3fc0ee788b68995dd18d22c1f5edebd64ba54`）；`policy-sources/2026-11-23-ca-quebec-family-duration.html`（sha256 `f922a57bab4376b19bdd2f6d83841155071729109b06a0d1eef1b78a6f4e302e`）；`policy-sources/2026-11-23-ca-quebec-family-relationship.html`（sha256 `f34bdeab9cfbd765b7e626976fc153590991ac9ad741d55a61a6e899064ae398`）；`policy-sources/2026-11-23-ca-quebec-child-relationship.html`（sha256 `97fe8dbb3a2177a39227665ac913fcccad94a254d06d2168d960c312574b4ca7`）；`policy-sources/2026-11-23-ca-quebec-family-undertaking-form.pdf`（sha256 `6fe52a1c8bcd6d442678f2af46fa63231fd5aa7488af967c10c78ac64f3010cb`） | archived |
| SRC-276 | GUIDANCE | IRCC 类别抽选与其他项目受理公告、MIFI 受理规则 | https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/sponsor-parents-grandparents.html ；https://www.quebec.ca/en/immigration/permanent/rules-procedures | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-category-rounds.html`（sha256 `047224af9096ae69ea0601311eb1c718e914dc0c82895210495347f8fffed5e8`）；`policy-sources/2026-11-23-ca-parents-grandparents.html`（sha256 `4238454193c1e8d84c2021fb8fe8e4d45250fe10e249ccd2684fa9959116d5bc`）；`policy-sources/2026-11-23-ca-quebec-reception.html`（sha256 `833e024cb4ac7558f39f782a9adbf0384e7a83ffc692a9d35c62efc196dbf758`） | archived |
| SRC-277 | GUIDANCE | StatCan LICO、IRCC 递交、警证与 offer | https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1110024101 ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/apply-permanent-residence.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/police-certificates.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/job-offer.html | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-statcan-lico.html`（sha256 `a99311387bcdf23dd46c984e538e0fe0e76d460ea69d449959bc5b21d63a9745`）；`policy-sources/2026-11-23-ca-ee-apply.html`（sha256 `7c4feffe0b94c550d9977f36cc9f2b701a9929f0af89defe7fced076d4bb725f`）；`policy-sources/2026-11-23-ca-ee-police.html`（sha256 `3594bedcb6aeb337a5b60bdff813a7ed2ac71bfa7b1d70225ab9920b831f3b37`）；`policy-sources/2026-11-23-ca-ee-job-offers.html`（sha256 `956b48c4270a07c3fb102eab094a96707085c5d7ef51e10a6299a53d0b9626c3`） | archived |
| SRC-278 | LAW | Québec Gazette 魁省移民法规及 MIFI 法文要求 | https://www.publicationsduquebec.gouv.qc.ca/fileadmin/gazette/pdf_encrypte/lois_reglements/2026F/88289.pdf ；https://www.publicationsduquebec.gouv.qc.ca/fileadmin/gazette/pdf_encrypte/lois_reglements/2023F/80921.pdf ；https://www.publicationsduquebec.gouv.qc.ca/fileadmin/gazette/pdf_encrypte/lois_reglements/2024F/84053.pdf ；https://www.quebec.ca/immigration/permanente/travailleurs-qualifies/programme-selection-travailleurs-qualifies/exigences | 见登记备注 | 2026-11-23 | `policy-sources/2026-11-23-ca-quebec-gazette.pdf`（sha256 `5f1de6ab7848e70585aa6a6c832076821a2a135254578c2f679022e3b50f47bd`）；`policy-sources/2026-11-23-ca-quebec-pstq-gazette.pdf`（sha256 `2be483980917c019ab4642fe04fa937e66a40fadd048f92a6f2eb2541f3a9cb3`）；`policy-sources/2026-11-23-ca-quebec-procedure-gazette.pdf`（sha256 `48a9755e2af0dd56e365ec6bd6e0bb03e18d126545a8adfef10603991090480a`）；`policy-sources/2026-11-23-ca-quebec-req-fr.html`（sha256 `87d9add9162d701acbb87330a1aa112fb624df0d8b1b294efb5c7111754e5086`） | archived |
| SRC-279 | GUIDANCE | OINP 雇主、AIP 清单、IRCC 医师政策及 Canada Gazette PNP 修订 | https://www.ontario.ca/page/oinp-employer-guide?redirect_id=page%2Fontario-immigrant-nominee-program-oinp-employer-guide&redirect_year=2026?redirect_id=page%2Foinp-employer-job-offer-streams-employer-guide&redirect_year=2026 ；https://www.canada.ca/content/dam/ircc/documents/pdf/english/kits/forms/imm0155/01-01-2025/imm0155e.pdf ；https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/public-policies/physicians-4-2023.html ；https://gazette.gc.ca/rp-pr/p2/2026/2026-04-08/html/sor-dors63-eng.html ；https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate/permanent-residence.html | 见登记备注 | 2026-11-23、2026-11-24 | `policy-sources/2026-11-23-ca-ontario-employer-guide.html`（sha256 `7a327281ebb14cafbd7d5190f128dc9a4606aec861c07b0f0ce85fa6a80b441b`）；`policy-sources/2026-11-23-ca-aip-checklist.pdf`（sha256 `46d2b3382608340ac4e720d9d4e0e6f03b94ac89c562d21722d48da10a79726f`）；`policy-sources/2026-11-23-ca-ee-doctors.html`（sha256 `65d69065ca547193b7a8a8ec6d14491e42811d3f81bacb2d133c66a4e13d4659`）；`policy-sources/2026-11-23-ca-pnp-gazette.html`（sha256 `79feee7fbe0e76969c7ff66f10f53f0be0c3d4f7fd5b88655da44280b5c1c12d`）；`policy-sources/2026-05-28-ca-aip-pr-application.html`（sha256 `a5387d051f00c547d53d63aa7eacdf94fe8a8880309b10b670c1222f0cbd8d25`） | archived |
| SRC-290 | LAW | 入籍年龄、合法取得永居及归化撤销 | https://uscode.house.gov/us/usc/t8/s1445/ | 见各快照 | 2026-11-23 | `policy-sources/2026-11-10-us-usc-8usc1445.html`（sha256 `812bfb329c81b15dcfc5d90996be0e6f1b6226974dafeb9bd9de67e45498c3cf`）；`policy-sources/2026-11-10-us-usc-8usc1429.html`（sha256 `ed99af9c919475e4c7848626d02266b8745be436dd0d8dd54de95b738f52cd7e`）；`policy-sources/2026-11-10-us-usc-8usc1451.html`（sha256 `f68f393b8e7ce48fefcb205b09f21833c339db2417d92fc0101453adb3ad5196`）；`policy-sources/2026-11-21-us-pm-v12-g-ch2.html`（sha256 `2ca4af382f59969a32662291c54236eb7651523f8c45086247156888b671f577`） | archived |
| SRC-291 | LAW | 英语、公民知识及医学例外 | https://uscode.house.gov/us/usc/t8/s1423/ | 见各快照 | 2026-11-23 | `policy-sources/2026-11-23-us-usc-8usc1423.html`（sha256 `48f4fcb1ff4ac6807537b67410f7aa5973434419355b2c7cde915dcd5bc8bb47`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part312.xml`（sha256 `769a5406055d33e6645b82cc342587a57515abd961946db52af6805ea1f3ad65`） | archived |
| SRC-292 | GUIDANCE | USCIS 入籍考试、N-648 与新题库 | https://www.uscis.gov/policy-manual/volume-12-part-e-chapter-2 | 见各快照 | 2026-11-23 | `policy-sources/2026-11-23-us-pm-v12-e-ch2.html`（sha256 `f2f36e7645ec37677311d781d9ae635f59b8318dd311d42d79599ea2fab501ca`）；`policy-sources/2026-11-23-us-pm-v12-e-ch3.html`（sha256 `3d9711d265eb01289bb5da7e5e7610bb082e9e93a1aa5eb37f327b08b1ee0429`）；`policy-sources/2025-10-20-us-pa-civics-test.pdf`（sha256 `f6637683b416c59230c926832bf1d4c7a82aff98dd01467c62ffb9ef0a1ecb65`） | archived |
| SRC-293 | GUIDANCE | USCIS 良好品格、整体审查及公共福利备忘录 | https://www.uscis.gov/policy-manual/volume-12-part-f-chapter-2 | 见各快照 | 2026-11-23 | `policy-sources/2026-11-23-us-pm-v12-f-ch2.html`（sha256 `073798278a2c8a5b740cc7030731baf4ffe9e497cc2716087ed1e0dd3ab866d5`）；`policy-sources/2026-11-23-us-pm-v12-f-ch4.html`（sha256 `863a9ee9d707edfc2fc199ba10adeca2d1aeaabf76e77e989388b276e4a276b0`）；`policy-sources/2026-11-23-us-pm-v12-f-ch5.html`（sha256 `6a8a5171072dcaffb39d0dd1d6e49f7bc3ae97278261c0581665b940d6acc47c`）；`policy-sources/2025-08-15-us-pm-602-0188-gmc.pdf`（sha256 `ef541130d34b923dde90d365e9a14fed32672212d5dcbe1d0721ec10b62f0551`）；`policy-sources/2026-11-04-us-pm-602-0201-gmc-benefits.pdf`（sha256 `5f34559ce5cf120ba08b9811fbf08379438319d287857a16cc9bbe10d808ff9d`） | archived |
| SRC-294 | LAW | 宪法依附、党籍与兵役豁免禁令 | https://uscode.house.gov/us/usc/t8/s1424/ | 见各快照 | 2026-11-23 | `policy-sources/2026-11-23-us-usc-8usc1424.html`（sha256 `374a4c8dd7539fca68f9e6ef018d13a45a8928b65abbefbb4cafd3db36903f6f`）；`policy-sources/2026-11-23-us-usc-8usc1425.html`（sha256 `53d0c9146dc3a4bfa08a5435b17b788570a017c2bdde31d5de2c83a7f3277c6f`）；`policy-sources/2026-11-23-us-usc-8usc1426.html`（sha256 `ea2f44f507072c3d934ea78464d051066a6dd8a4372c1568b54c2a0b69c153e6`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part313.xml`（sha256 `98f920ebc91bf18fd8e81ee08e079cd14293377edf2df8b9fecead0a1666d4be`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part315.xml`（sha256 `5df6edbeb2efd7dd4b63d2f060b3996d0d2f3cf82857e1fbc08adf6e7d55e98e`） | archived |
| SRC-295 | GUIDANCE | Selective Service 登记与入籍 | https://www.sss.gov/register/who-needs-to-register/ | 见各快照 | 2026-11-23 | `policy-sources/2026-11-23-us-sss-who-must-register.html`（sha256 `94f7f6d6318f9e1b956d6a899d83cce2f7d44bad4497ff4a39d6aa54748ccd7c`）；`policy-sources/2026-11-23-us-pm-v12-d-ch7.html`（sha256 `017ecdded969314bda67bd1cdbce9057ddca678ba49f7eb10b4dcfc6f5a8b5f1`）；`policy-sources/2026-11-23-us-usc-50usc3802.html`（sha256 `da35a0d174dc68d2ce22c99b0f4b87010c913c9dc317a31d47ded84ab5fc95f8`） | archived |
| SRC-296 | LAW | 入籍宣誓及修正 | https://uscode.house.gov/us/usc/t8/s1448/ | 见各快照 | 2026-11-23 | `policy-sources/2026-11-23-us-usc-8usc1448.html`（sha256 `3e74e05a70f488c15f1e1586b30cdddd41ead21b4790210015c8be8a34d3f805`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part337.xml`（sha256 `ce47cbc011966780b9a05f37817aaeba973641ea1faf375a0e493dc68d58f874`）；`policy-sources/2026-11-23-us-pm-v12-j-ch2.html`（sha256 `ab8cb74fb2559f09ba5df79eb2efbd8d54968545e4d07ce99b81e531ca57aee3`）；`policy-sources/2026-11-23-us-pm-v12-j-ch3.html`（sha256 `2279a1c224a364b6aafeeb71999b0ac84ebb487cd8c9cf0cad944def43fd11dd`） | archived |
| SRC-297 | GUIDANCE | 婚姻取消条件、联名与豁免 | https://www.uscis.gov/sites/default/files/document/forms/i-751instr.pdf | 见各快照 | 2026-11-23 | `policy-sources/2026-11-21-us-i751instr.pdf`（sha256 `eb5ecf1ef00c5a65d8455267010bd9808f358a028c86f15bbbdbd5da74cd11db`）；`policy-sources/2026-11-21-us-pm-v6-i-ch2.html`（sha256 `8ab95426a738d01cb35a3644b18d6054c0a97f0e0b1b19cc6addae655ecb097c`）；`policy-sources/2026-11-21-us-pm-v6-i-ch3.html`（sha256 `6e64cf29a5b29cb9647bd32d22dcd5bc0e700b331324c769456409935036ddb7`） | archived |
| SRC-298 | GUIDANCE | EB-5 条件移除、持续投资与就业 | https://www.uscis.gov/policy-manual/volume-6-part-g-chapter-7 | 见各快照 | 2026-11-23 | `policy-sources/2026-11-21-us-pm-v6-g-ch7.html`（sha256 `a4c15c551c4e9aca1618f9569ea6192d5eb39b9651cfffdbb9937d2a317e837d`）；`policy-sources/2026-11-23-us-i829instr.pdf`（sha256 `9579d5c925995bc050244c67c99eec4962d8bbd27c3f55c312ba056af497565f`） | archived |
| SRC-299 | LAW | 外国人登记、随身携证、换卡与地址申报 | https://uscode.house.gov/us/usc/t8/s1304/ | 见各快照 | 2026-11-23 | `policy-sources/2026-11-23-us-usc-8usc1304.html`（sha256 `234b45be0f556dbaf99dc24e7930a2d9be8bccdd06f241c0f8ce5ff54873e13a`）；`policy-sources/2026-11-23-us-usc-8usc1305.html`（sha256 `735f0fcddc3127c88d0aebfffcbc02f32e4d43d8b7fadb8e0f3dcd79281e83b6`）；`policy-sources/2026-11-23-us-usc-8usc1306.html`（sha256 `28a78d3fd681ceb28940da1d7242f71742bbd1245f4dc4e7b4ff4c4355b53352`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part264.xml`（sha256 `c1385db84c998b0a9dd7fd00e29aebf3109b53a7e64c48b04b4883fb6e7d86ef`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part265.xml`（sha256 `8808c90603732642ae87b826d0e862e02619f09433e4819a0e15fb42701152ed`）；`policy-sources/2026-11-23-us-alienregistration.html`（sha256 `a510f7542eb52e66d9a459dbef2d0bc27eb6590b82d79147b4e533826e2f5d3e`） | archived |
| SRC-300 | LAW | 返美、回美证及 SB-1 | https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=223 | 见各快照 | 2026-11-23 | `policy-sources/2026-11-19-us-ecfr-8cfr-part223.xml`（sha256 `4ea74fe7da03719d5c92f9f1487d86db506c90188cf85ca57cea10b19e695fc0`）；`policy-sources/2026-11-19-us-ecfr-22cfr42.22.xml`（sha256 `6f12bbbacd1e23c5a72ef0334b2af5e2b1b3c5679f154ec43839b7ba89a5763f`）；`policy-sources/2026-11-21-us-9fam502.7.html`（sha256 `c69a119ccb3e947e4eb7f0d0e6a092af1c88b2c957c27f1de30329ac50d417fb`）；`policy-sources/2026-11-23-us-i131instr.pdf`（sha256 `e1ea4fb3b6db9640abb9eea09d8ee681339ace46e84ed2d189c5c4b5fc110393`） | archived |
| SRC-301 | LAW | 境内递解事由 | https://uscode.house.gov/us/usc/t8/s1227/ | 见各快照 | 2026-11-23 | `policy-sources/2026-11-10-us-usc-8usc1227.html`（sha256 `f4977abf48f750a0cc27ef47c013235bde023f3b2a5c63e5c37da154a700a61d`） | archived |
| SRC-302 | LAW | 亲属资格、CSPA、签证分类及申请禁令 | https://uscode.house.gov/us/usc/t8/s1151/ | 见各快照 | 2026-11-23 | `policy-sources/2026-11-23-us-usc-8usc1151.html`（sha256 `ff01cb85fce6aa2d59bace7e113038e56ee10212abbc6a5cb2ac7e549bff2605`）；`policy-sources/2026-11-23-us-usc-8usc1153.html`（sha256 `e7562f70a23a5a078f22118746d2a63e2905f74f399354d71d833b8cb30b0fc9`）；`policy-sources/2026-11-23-us-usc-8usc1154.html`（sha256 `9103d4a5f017745017a3eed76e5401d3a3d4d332d07c3d548b342051fd02557e`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part204.xml`（sha256 `d7253eb4e3c24e59d15da61a568636543c93c9cda6f4aeb13a9e10bc321c1532`）；`policy-sources/2026-11-23-us-pm-v6-b-ch7.html`（sha256 `9ed3a01f598b89712fb9a715c5c937ffecea3568d215b42c5cc1c69ac86682aa`）；`policy-sources/2026-11-24-us-9fam502.1.html`（sha256 `750fe9820d2056a60fb5f508f48196ce43013fe88853dfa4ac0cb8eccb730ddc`） | archived |
| SRC-303 | LAW | I-864 担保、替代资产及豁免 | https://uscode.house.gov/us/usc/t8/s1183a/ | 见各快照 | 2026-11-23 | `policy-sources/2026-11-23-us-usc-8usc1183a.html`（sha256 `c9e7af152bb89f0d02e46c14e6fb097ec0ceabe60d7f17d1157d73efd93bf8e6`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part213a.xml`（sha256 `9755cca107669634e18785be6086f4f2421b623801d22fcb4da74ca775a2dff7`）；`policy-sources/2026-11-23-us-i864instr.pdf`（sha256 `be54e93f712da6422ad740cf34d6e0f2640377792cf47c2f30dc347b6d0f0e08`） | archived |
| SRC-304 | GUIDANCE | HHS 贫困指引及 USCIS 地区表 | https://www.federalregister.gov/documents/full_text/text/2026/01/15/2026-00755.txt | 见各快照 | 2026-11-23 | `policy-sources/2026-01-15-us-fr-2026-00755-hhs-poverty.txt`（sha256 `fbddaefee61048aace09f738186dc3b4350cbdf885053e6b61bd0a9230214614`）；`policy-sources/2026-11-23-us-i864p.html`（sha256 `144b4ad33dc35a101d4fe9ddcc3200ce8cd96f538cee981250ccfa6ed3b6650e`） | archived |
| SRC-305 | LAW | PERM 工作及招聘、工资、支付能力 | https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-20.xml?part=656 | 见各快照 | 2026-11-23 | `policy-sources/2026-11-19-us-ecfr-20cfr-part656.xml`（sha256 `7286a291ac21bb6cfcc26a176bc548997981c731c875e98968b129411f55a56e`）；`policy-sources/2026-11-23-us-pm-v6-e-ch4.html`（sha256 `384b425ae24592d0f97ac31cb02c2489bd59db52999960eee0815c4280d2f086`）；`policy-sources/2026-11-23-us-pm-v6-e-ch6.html`（sha256 `94b0699c6bf275923a0d9c5fbdb38b769fc852c1509270efc46e5ff10f5d8a48`） | archived |
| SRC-306 | GUIDANCE | 职业分类与 EB-1A、EB-2 NIW 证据 | https://www.uscis.gov/policy-manual/volume-6-part-f-chapter-2 | 见各快照 | 2026-11-23 | `policy-sources/2026-11-23-us-pm-v6-f-ch2.html`（sha256 `31c61c1d3d540a9a328efd1a4acddbe9f3affdf7c57f603f28bdeb787f2fbc0f`）；`policy-sources/2026-11-23-us-pm-v6-f-ch5.html`（sha256 `7f4e88707fdd65a469f324849bd68b7bc5d1a0a9f2ac3c48ddc703d2a7d54c06`） | archived |
| SRC-307 | GUIDANCE | EB-5 投资、就业、资金来源及项目 | https://www.uscis.gov/policy-manual/volume-6-part-g-chapter-2 | 见各快照 | 2026-11-23 | `policy-sources/2026-11-23-us-pm-v6-g-ch2.html`（sha256 `f8c193cc259c8446c5b4bbed90948a3c52b2b674f198eb0b93ac14983ee65787`）；`policy-sources/2026-11-23-us-pm-v6-g-ch4.html`（sha256 `456ae747e7419c8ab6587c7496a36d50c90e13fb2032d27274d94cf181b93490`）；`policy-sources/2026-11-23-us-i526instr.pdf`（sha256 `caba62ddaa234cd9860bd13fc5d1b1d5d86ec7186469cdfba46149d6004ca3cf`）；`policy-sources/2026-11-23-us-i526einstr.pdf`（sha256 `060abc212ed8d8926544afcedc2a696a4e31e2207ce7aac124eda588d5774bfa`） | archived |
| SRC-308 | POLICY | Gold Card 行政令与 I-140G | https://www.federalregister.gov/documents/full_text/html/2025/09/24/2025-18602.html | 见各快照 | 2026-11-23 | `policy-sources/2025-09-24-us-fr-eo14351-gold-card.html`（sha256 `ae1e9df53c0a5cd5d8b391fa7379b605f8c8ef415336125317841e9c81ff267d`）；`policy-sources/2026-11-23-us-i140g.html`（sha256 `6c033d8aeb0800365ceb306a1f5e44c1dbdb9ea37ab701c9637c7876560e3810`）；`policy-sources/2026-11-23-us-i140ginstr.pdf`（sha256 `99ad461d4ead1a06447fab47d62939beea0c85400e13c395c64e6776a0185d05`） | archived |
| SRC-309 | LAW | 境内调整身份、签证名额、例外与基础转换 | https://uscode.house.gov/us/usc/t8/s1255/ | 见各快照 | 2026-11-24 | `policy-sources/2026-11-23-us-usc-8usc1255.html`（sha256 `90299c46d8d5774a900b46e9b124fe65cf97036b37e013e2b040347bbf774aec`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part245.xml`（sha256 `5e9dfd8efa0ceef2977745ac8b2202d807afbd8b6bbc30e710910fbca71dfe59`）；`policy-sources/2026-11-23-us-pm-v7-a-ch6.html`（sha256 `3de0704893e8b5bff8597095c8fd65d7af0c5d8ebe869926a999cf90b53d2d87`）；`policy-sources/2026-11-23-us-visa-availability.html`（sha256 `fb55a8388c2779da33742bf4d5e99221bee8afcccb8e8b7e6ca1808f338fba1e`）；`policy-sources/2026-11-23-us-i485instr.pdf`（sha256 `ed6a97aa2924bacebf443be6382bd506c24bd79e7c431f17d4eea7d9553e0daf`）；`policy-sources/2026-11-24-us-pm-v7-a-ch8.html`（sha256 `baac2549c781fb9886c7221cce67560a696a629a02a6a1035564dfaba2c29c55`） | archived |
| SRC-310 | GUIDANCE | 境内调整身份的裁量 | https://www.uscis.gov/sites/default/files/document/policy-alerts/05.21.2026_Discretionary_Adjudication_of_Adjustment_of_Status_Applications_PM-602-0199.pdf | 见各快照 | 2026-11-23 | `policy-sources/2026-05-21-us-pm-602-0199-aos-discretion.pdf`（sha256 `7e3c112420141d80255431d91f4bfc17af502325ac574eb38b432d9484b95692`）；`policy-sources/2026-11-23-us-pm-v7-a-ch10.html`（sha256 `9e7d1d3f4e3d564156ce2d677484b0b34d66184d6423dd32dd81e938166663e6`） | archived |
| SRC-311 | LAW | 不予入境、非法居留、犯罪与安全 | https://uscode.house.gov/us/usc/t8/s1182/ | 见各快照 | 2026-11-23 | `policy-sources/2026-11-23-us-usc-8usc1182.html`（sha256 `0f8020a4e1c6c9f4f6fd24a0dd2307e5fe65d810137ba0d69db49e52f1cce99e`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part212.xml`（sha256 `1f465506a0fd171e8ca31663365b8f09c2c1714be29727c424ca79718d1b635f`）；`policy-sources/2026-09-23-us-pa-criminal-inadmissibility.pdf`（sha256 `f0db075adf1628801122143770c5439feec7786b1c18d3b1f79f6f1b7a84d0d7`）；`policy-sources/2026-11-24-us-9fam504.8.html`（sha256 `ea56b5fc301a90e6870349a82be0aab92f0a4ab3a01d9860d55521a19a7fb444`） | archived |
| SRC-312 | LAW | 体检、疫苗与 I-693 有效性 | https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-42.xml?part=34 | 见各快照 | 2026-11-24 | `policy-sources/2026-11-19-us-ecfr-42cfr-part34.xml`（sha256 `2442f2bd9704951715570a8b63c06d8c5012840376cd00209577e8f470def27f`）；`policy-sources/2025-06-11-us-pa-i693-validity.pdf`（sha256 `19c2e2ebd3a942439fa27ec9dd95b3fe82dbbc737e7169c60fbc16a08ff83aad`）；`policy-sources/2026-11-23-us-pm-v8-b-ch9.html`（sha256 `bef7681daa0eed0e9433c837cb9b21c5b9168110e90d9b6fb3b79c3d87237211`）；`policy-sources/2026-11-23-us-i693instr.pdf`（sha256 `734f0b3070596d3f706e0da32f66feb3c60dee21d353e8ad3e151be6a40767cf`）；`policy-sources/2026-11-23-us-9fam302.2.html`（sha256 `2e232490a4bb30f03b1e119c6106af17f691323bda7fd1560dd1ca8888e105dc`）；`policy-sources/2026-11-24-us-i693.html`（sha256 `41e3d1f141f8f4e59e4806ce18fd1df6b864b2ec094128f72193ff0831e43cff`） | archived |
| SRC-313 | LAW | DHS 公共负担与领馆 FAM 对照 | https://www.federalregister.gov/documents/full_text/html/2026/07/20/2026-14539.html | 见各快照 | 2026-11-23 | `policy-sources/2026-07-20-us-fr-2026-14539-public-charge.html`（sha256 `e718bcbdbdf577c2beabd7457310e7336777ee7ecdb0c3450fcf0ddb72bbfd46`）；`policy-sources/2026-08-18-us-pa-public-charge.pdf`（sha256 `f420be8cfa76bf2ce1a510939c5db622480f8719942be9e8f4590f171103ea63`）；`policy-sources/2026-11-23-us-pm-v8-g-ch11.html`（sha256 `0360c83fae97695e0d019d455efb320795ba7efe421e91bb4ac268fcf239647d`）；`policy-sources/2026-11-23-us-9fam302.8.html`（sha256 `c09b8b71637f755a521f246ff0be22ecac8c277ce7ccf60111889f45afc1de15`）；`policy-sources/2026-11-24-us-i485.pdf`（sha256 `796eefb646ae1be6a6bd4c3eb52d0798fb06a209a7ee5317b14cdfcaf10dce18`） | archived |
| SRC-314 | LAW | 难民、庇护调整身份与 INA 209(c) | https://uscode.house.gov/us/usc/t8/s1159/ | 见各快照 | 2026-11-23 | `policy-sources/2026-11-10-us-usc-8usc1159.html`（sha256 `1c42430977f7af86d7f94e5068c43dca227f87e131a5b002f016f03749dc636c`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part209.xml`（sha256 `216c32c0eb65cde6c5dd1ab74b9d6d6396e226deb9b0049b77af427b355e706f`）；`policy-sources/2026-11-23-us-pm-v7-l-ch2.html`（sha256 `41ab74a66b31ce6edcd67c6b8341db1876555293875a80ca076f6a18d17ce14c`）；`policy-sources/2026-11-23-us-pm-v7-l-ch3.html`（sha256 `00402355d551e9a779af52405a8fefa7ed6b559321aaf0487a3fdd39d88ce420`）；`policy-sources/2026-11-23-us-pm-v7-m-ch2.html`（sha256 `36db6bb567384d28e61dfb1ec48885fda719aadfe2d97b80e56a95360747504f`）；`policy-sources/2026-11-23-us-pm-v7-m-ch3.html`（sha256 `a2776c945242abd9be22e038ac703d1b536c1203a0f136bf4ff77da26f7f488a`） | archived |
| SRC-315 | LAW | 军人入籍 INA 328、329 | https://uscode.house.gov/us/usc/t8/s1439/ | 见各快照 | 2026-11-23 | `policy-sources/2026-11-10-us-usc-8usc1439.html`（sha256 `db551f1270f7b87956d3963b7d38641a98ffabc0d300a88d1999c96187f5a1e9`）；`policy-sources/2026-11-23-us-usc-8usc1440.html`（sha256 `1b572cee7d7532857e34429098d5cdfee4c1c1f6f1c26d82eb00007ba0247ef2`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part328.xml`（sha256 `9fce72e00780051222ee9f225f83745446a0d8a631bd05da66734cea38d3c2c5`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part329.xml`（sha256 `8347744e7da91d2172450c323aa213b4f0e36f9ad217f8117c10595a69d724aa`）；`policy-sources/2026-11-23-us-pm-v12-i-ch2.html`（sha256 `166e6c38b0a3a48c4d89903129376ffb0093e5761e4354c380c704817763c1d7`）；`policy-sources/2026-11-23-us-pm-v12-i-ch3.html`（sha256 `7160846917dd69fe3828aa898a45656f5785a82d615d40865a83abff6c70ce2c`） | archived |
| SRC-316 | GUIDANCE | USCIS 费用与减免表 | https://www.uscis.gov/sites/default/files/document/forms/g-1055.pdf | 见各快照 | 2026-11-23 | `policy-sources/2026-11-23-us-g1055.pdf`（sha256 `62fc594c543f1023fef4ade756e936d8c50fb6c4102997dbb3a86f67ebf45623`）；`policy-sources/2026-11-23-us-i912instr.pdf`（sha256 `d1cb9f27aedd1102666cfd58c9e1b28cfbbf8277376422f193ab6cfa43274de3`）；`policy-sources/2026-11-19-us-ecfr-8cfr-part106.xml`（sha256 `1fa7114a39364197e234ed909dd6870cb535a5dc88a3062a1a69d8fb9a719df2`） | archived |
| SRC-317 | LAW | 领馆办理费用 | https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-22.xml?section=22.1 | 见各快照 | 2026-11-23 | `policy-sources/2026-11-19-us-ecfr-22cfr22.1.xml`（sha256 `e92313c52e721dac29b32ad4c78ccbcf699ffdbc650a2048249fecd351fb7eea`） | archived |
| SRC-318 | LAW | EB-5 费用生效调整 | https://www.federalregister.gov/documents/full_text/text/2026/09/30/2026-20016.txt | 见各快照 | 2026-11-23 | `policy-sources/2026-09-30-us-fr-2026-20016-eb5-fee-rule.txt`（sha256 `73ff337ef7f191dd493189a2e10cbc8f616944a43cac6fe1c154cd5de79b823c`） | archived |
| SRC-319 | LAW | H.R. 1 基准费率与 FY2027 调整 | https://www.federalregister.gov/documents/full_text/html/2026/04/29/2026-08333.html | 见各快照 | 2026-11-23 | `policy-sources/2026-04-29-us-fr-2026-08333-hr1-fees.html`（sha256 `aa3d9488dd2a18e8be0a744ce76ca70018aa6e83dfcff7f4a6cd3312e1b7c4d1`）；`policy-sources/2026-10-01-us-fr-2026-20187-hr1-fees-fy2027.html`（sha256 `6343c4f3d3e4fb214b699481522ca489b84e896b91c395a829d8acc30195d4dd`） | archived |
| SRC-320 | LAW | BOE · LO 4/2000，外国人组织法 | https://www.boe.es/buscar/act.php?id=BOE-A-2000-544 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-lo4-2000.html`（sha256 `f19cbf7f1ceb94fe9ec699240b41afe1ee65f7ff90382c6eece43feaee1e99b2`） | archived |
| SRC-321 | LAW | BOE · RD 1004/2015，入籍程序条例 | https://www.boe.es/eli/es/rd/2015/11/06/1004/con | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-rd1004.html`（sha256 `71ab38547fa498590082790162795e46dc329181dda57081525390f843d591ab`） | archived |
| SRC-322 | LAW | BOE · Orden JUS/1625/2016，入籍办理及附件；BOE · Resolución 7/11/2022，考试豁免表 | https://www.boe.es/eli/es/o/2016/09/30/jus1625/con ；https://www.boe.es/diario_boe/txt.php?id=BOE-A-2022-19664 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-orden-jus1625.html`（sha256 `7270a7e8f679393e94d90734bbb0677ddf871284089c378b2bfb4fa9ebcf03f1`）；`policy-sources/2026-11-23-es-orden-dispensa.html`（sha256 `a41530c0371f394314885c367e367b56d3732c03e25d9985e71726c0d4818edd`） | archived |
| SRC-323 | GUIDANCE | 司法部 · Información Nacionalidad；司法部 · Nueva tasa desde el 1 de enero de 2022；司法部 · Residencia，入籍费及宣誓说明；司法部 · 2021-09-03 未满 14 岁的代表申请说明；司法部电子政务 · Nacionalidad española por residencia | https://www.mjusticia.gob.es/es/ciudadania/nacionalidad/informacion-nacionalidad ；https://www.mjusticia.gob.es/es/atencion-ciudadano/avisos-centro-atencion/nueva-tasa-desde-enero-2015 ；https://www.mjusticia.gob.es/es/ciudadania/nacionalidad/que-es-nacionalidad/como-adquiere-nacionalidad/residencia ；https://www.mjusticia.gob.es/es/Ciudadano/Nacionalidad/Documents/Nota%20entrada%20en%20vigor%20Ley%208-2021.pdf ；https://sede.mjusticia.gob.es/es/tramites/nacionalidad-espanola | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-justicia-nacionalidad.html`（sha256 `7678cb8e332c1faf720e58e79ef0c23323fac1657c5811bbc533c0eaad5c3ca3`）；`policy-sources/2026-11-23-es-justicia-tasa-aviso.html`（sha256 `d6963ddab3b76462667db3cd7627c2427e721bfaf965b149252d05c3e902a4af`）；`policy-sources/2026-11-23-es-justicia-residencia.html`（sha256 `05a545c08a15be9a0b5ff596cfa4c1d63752680ece9882ba82f0fc1cbf0a8c28`）；`policy-sources/2026-11-23-es-justicia-menores.pdf`（sha256 `fcdcf3eda47377306010ceb168e275df5a7d027b3b047d45f6f1ca97d0fdcef8`）；`policy-sources/2026-11-23-es-justicia-sede-nacionalidad.html`（sha256 `ee79be39c62841d8f7cb6a03e9d7280416740716c176b23f20f4c7a9aff1d6d4`） | archived |
| SRC-324 | GUIDANCE | 移民部 · Hoja 50，欧盟长期居留 | https://www.inclusion.gob.es/web/migraciones/w/50.-autorizacion-de-residencia-de-larga-duracion-ue | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-hoja50.html`（sha256 `0976e49357ac4bb6303cf7a64c852a8a69a0e355955f7d6959d0c9953febd5fd`） | archived |
| SRC-325 | LAW | BOE · Orden PJC/617/2025，居留和证件费 | https://www.boe.es/buscar/act.php?id=BOE-A-2025-12056 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-orden-pjc617.html`（sha256 `efe4a431bcada17d2eef95f29eb62cb55cdf317fde2ad870b77dbeea55a3186b`） | archived |
| SRC-326 | LAW | BOE · Ley 31/2022，国家预算；SEPE · Cuantías anuales，现行 IPREM／SMI 表 | https://www.boe.es/buscar/act.php?id=BOE-A-2022-22128 ；https://www.sepe.es/HomeSepe/prestaciones-desempleo/Cuantias-anuales.html | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-ley31-2022.html`（sha256 `bd9f42aad5d09415e003f2d30678154a97025834c1440f546dc5043dd04551b2`）；`policy-sources/2026-11-23-es-sepe-cuantias.html`（sha256 `342c4a3257a01609e55f6d92b011fc07efcc268b7ab61c0b708c15ac712cbb29`） | archived |
| SRC-327 | LAW | BOE · RD 240/2007，EU／EEA／瑞士自由流动制度 | https://www.boe.es/buscar/act.php?id=BOE-A-2007-4184 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-rd240.html`（sha256 `5c35757b2af475438751311d331def3356fce4da8f1aee0e4423ca98497bc12b`） | archived |
| SRC-328 | GUIDANCE | 移民部 · Hoja 63，永久家属卡；移民部 · Instrucciones SEM 2/2025，西籍家属和长居衔接 | https://www.inclusion.gob.es/web/migraciones/w/63.-tarjeta-de-residencia-permanente-de-familiar-de-ciudadano-de-la-union-europea ；https://www.inclusion.gob.es/documents/d/migraciones/instrucciones-sem-2-2025-sobre-la-residencia-temporal-de-familiares-de-personas-con-nacionalidad-espanola | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-hoja63.html`（sha256 `460d130c86e5994260dc3492f5a69d120c007f522518303d1bbdb8508ccbc46e`）；`policy-sources/2026-11-23-es-sem2-2025.pdf`（sha256 `1c7ea39e4b707559e090b01342311c86b18c9e5b10a60f61ff3f30789926bec8`） | archived |
| SRC-329 | LAW | BOE · Orden PRE/1490/2012，自由流动居留证明 | https://www.boe.es/eli/es/o/2012/07/09/pre1490 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-orden-pre1490.html`（sha256 `a7e22079f3efea61cdf2ecf77a0febb47ea6358f05253865d516fa938bae5571`） | archived |
| SRC-330 | LAW | DOUE／BOE · Directiva 2004/38/CE 校正重刊 PDF | https://www.boe.es/doue/2004/229/L00035-00048.pdf | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-directiva2004-38.pdf`（sha256 `5cfe07546dd2d88b638803a24d741f890e1063aeca8de51415e92706f4eef80b`） | archived |
| SRC-331 | LAW | EUR-Lex · Directiva 2003/109/CE 合并文本；DOUE／BOE · Directiva 2003/109/CE 原始公布 | https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:02003L0109-20110520 ；https://www.boe.es/buscar/doc.php?id=DOUE-L-2004-80112 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-directiva2003-109.html`（sha256 `3ef25bd66ee9a1551bbb9ea887a4ceccf72d5f0355ea6cce0c1d987e4b7c971b`）；`policy-sources/2026-11-23-es-directiva2003-109-boe.html`（sha256 `7aaff36d3f38eca7a277a5049866758cf3507d54238c0c32961e26c0419be56c`） | archived |
| SRC-332 | LAW | BOE · Ley 14/2013，蓝卡及流动 | https://www.boe.es/buscar/act.php?id=BOE-A-2013-10074 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-ley14-2013.html`（sha256 `aa9a513a35bd9128a70a08216643f6e59dc76960d6ecf742fe7d7979ca7347ee`） | archived |
| SRC-333 | GUIDANCE | 移民部 · Hoja 53，恢复国内长居；移民部 · Hoja 54，恢复欧盟长居；西班牙驻河内使馆 · 恢复长居办事表，有旧版条目，仅用于标明冲突 | https://www.inclusion.gob.es/web/migraciones/w/51.-residencia-de-larga-duracion-en-espana-del-residente-de-larga-duracion-ue-en-otro-eemm-de-la-ue-duplicar-0-1 ；https://www.inclusion.gob.es/web/migraciones/w/51.-residencia-de-larga-duracion-en-espana-del-residente-de-larga-duracion-ue-en-otro-eemm-de-la-ue-duplicar-0-2 ；https://www.exteriores.gob.es/DocumentosAuxiliaresSC/Vietnam/HANOI%20%28E%29/27a.%20Nacionales.RLD%20%28ES%29.pdf | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-hoja53.html`（sha256 `83bb61f480187a68b1448891e559cbe8dc8317945cc49273edeffb79d2f5d69b`）；`policy-sources/2026-11-23-es-hoja54.html`（sha256 `54ae75827a344f7bb5cf83a5bceedd8763da9994599dc315f3d203ac14a949b3`）；`policy-sources/2026-11-23-es-recuperacion-consulado-hanoi.pdf`（sha256 `af8c1bbf81adcaf74d848b7687a07e2e3e8cd2342915f96efce264cd112734ad`） | archived |
| SRC-334 | LAW | BOE · Ley 19/2015，入籍费用法源 | https://www.boe.es/buscar/act.php?id=BOE-A-2015-7851 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-ley19-2015.html`（sha256 `01b26e707f5c28dfe7149f8bdd698fa1b6e4b7861354bae1c023a752a929bd46`） | archived |
| SRC-335 | GUIDANCE | Instituto Cervantes 布鲁塞尔 · CCSE 考试与费用；Instituto Cervantes · Guía para la prueba CCSE；Instituto Cervantes · Términos y condiciones，报名条款；Instituto Cervantes · Precio de la prueba CCSE | https://bruselas.cervantes.es/es/examenes_espanol/ccse/ccse.htm?cadena_busqueda=2026 ；https://examenes.cervantes.es/sites/default/files/guia_prueba_ccse.pdf ；https://examenes.cervantes.es/es/node/1142109 ；https://examenes.cervantes.es/es/ccse/cuanto | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-ccse-bruselas.html`（sha256 `4ac109bdfdb9560ebab37246bdae354b0ba63237f1c4aa13929d808bffe37bbe`）；`policy-sources/2026-11-23-es-ccse-guia.pdf`（sha256 `cc9cf2cbde6e9c65902190beb377a9ccb9b3277356ebf52c5e094d5551f8b2cc`）；`policy-sources/2026-11-23-es-ccse-terminos.html`（sha256 `67197c4423508a73a33651a577134ce8942f426c2797a7546cd7c615815e8827`）；`policy-sources/2026-11-23-es-ccse-precio.html`（sha256 `e26fbf57b5a53e5adb10e63da80cb465a58f700b62a0643010077226a96bf5c9`） | archived |
| SRC-336 | GUIDANCE | Instituto Cervantes · DELE 2026 各国考试费表 | https://examenes.cervantes.es/sites/default/files/ic-tabla-precios-dele-2026.pdf | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-dele-2026.pdf`（sha256 `dc9a9f33ff66b4f060ca3c988198abb7368d812996a356e7aa5e578dc5996aeb`） | archived |
| SRC-337 | LAW | BOE · Ley 19/2021，IMV；BOE · RDL 3/2026，2026 非缴费型养老金金额 | https://www.boe.es/buscar/act.php?id=BOE-A-2021-21007 ；https://www.boe.es/buscar/act.php?id=BOE-A-2026-2548 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-ley19-2021.html`（sha256 `7238ec6c68a25a54511c9174244bcafb17f1ee4fd554f6cb9c2c33f1db84da22`）；`policy-sources/2026-11-23-es-rdl3-2026.html`（sha256 `8fad364805dcb60875504e90bc17c86b6fdd9d0ebebcf9767c369dbdeb2da2b6`） | archived |
| SRC-338 | LAW | BOE · RD 1155/2024 原始公报；BOE · RD 316/2026 修订原文；BOE · 最高法院 2026-07-08 判决及更正 | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-24099 ；https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-8284 ；https://www.boe.es/buscar/doc.php?id=BOE-A-2026-19632 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-publicacion-reglamento.html`（sha256 `758517103d2e302548291155305e3258e2a9fe16f9f84fd04694367ae3fb4bad`）；`policy-sources/2026-11-23-es-rd316.html`（sha256 `bdbc814ab04e8000e152b4c46d343446d317ecd88991063c1edc31d56769dcdc`）；`policy-sources/2026-11-23-es-ts-reglamento.html`（sha256 `8809055e6784e5f58c77769513a27d2f01b68cec1ab51795b3f5dfb5d029b8eb`） | archived |
| SRC-339 | GUIDANCE | CGPJ · Audiencia Nacional，学习停留的按居住入籍判决摘要 | https://www.poderjudicial.es/cgpj/es/Poder-Judicial/Audiencia-Nacional/Jurisprudencia/Actualidad-Jurisprudencial/ci.AN-C-A--Estima-el-recurso-contra-resolucion-de-la-DGRN---que-acuerda-conceder-la-nacionalidad-espanola-por-residencia--Anula-la-misma-por-su-disconformidad-a-Derecho--La-permanencia-en-Espana-amparada-en-la-tarjeta-de-estudiante-o-en-autorizacion-de-estancia-para-cursar-estudios-no-puede-considerarse-que-reuna-las-notas-exigidas-de-residencia-legal--continuada-e-inmediatamente-anterior-a-la-peticion-previsto-en-el-art--22-3-del-CC-para-la-adquisicion-de-la-nacionalidad-.formato3 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-cgpj-estudios.html`（sha256 `3a8584fb16b913e4d1f958bc468b8aad28a70434a0ca4ade8e21b5e603ad5144`） | archived |
| SRC-340 | LAW | BOE · RD 126/2026，2026 SMI；BOE · RDL 2/2015，劳动者法典 | https://www.boe.es/buscar/act.php?id=BOE-A-2026-3815 ；https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-smi2026.html`（sha256 `d3c8ead4ea540ff39439f4e4849225493e5aa3bdc03c859b6e1dd1c4fcf0774e`）；`policy-sources/2026-11-23-es-estatuto-trabajadores.html`（sha256 `b3dd19df24b8bfefe65370cf7bbee78a5030a9a691687f878cf54796c32e3286`） | archived |
| SRC-341 | LAW / GUIDANCE | BOE · LO 2/2006 教育法、RD 157/2022 小学教育规定，Eurydice España · 小学学年安排 | https://www.boe.es/buscar/act.php?id=BOE-A-2006-7899 、https://www.boe.es/eli/es/rd/2022/03/01/157/con/20220302#a5 、https://eurydice.eacea.ec.europa.eu/eurypedia/spain/organisation-primary-education | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-educacion.html`（sha256 `4fcf4ea5940cde0f089a41d53e32fdf8bba056bcac5fdaae1bfd6411dd6ef502`）、`policy-sources/2026-11-23-es-primary-art5.xml`（sha256 `65cad7f5d85609804c41b2917af0d088e356744f777135f2390e91b300ef12cb`）、`policy-sources/2026-11-23-es-primary-calendar.html`（sha256 `1b7782041ca61b3de20261e74f3b876272d8f03043d7089b6c04f9a979302816`） | archived |
| SRC-342 | LAW | BOE · 最高法院 2024-07-15 判决，入籍 art. 12.1；BOE · Ley 8/2021，支持措施及民法修订 | https://www.boe.es/buscar/doc.php?id=BOE-A-2024-18114 ；https://www.boe.es/buscar/act.php?id=BOE-A-2021-9233 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-ts-nacionalidad.html`（sha256 `5c9f14a03ad9011a81ad30ba5177ede419273d7627c90a040a8b0e8394874285`）；`policy-sources/2026-11-23-es-ley8-2021.html`（sha256 `d3f06be9de1a579da85529900e380d3e24990d6720407a4ecb2a2cd2ab304df9`） | archived |
| SRC-343 | LAW | BOE · Ley 20/2011，Registro Civil；司法部 · 2021-12-22 公证宣誓声明指令；BOE · Ley 18/2014，民事登记公共服务费用 | https://www.boe.es/buscar/act.php?id=BOE-A-2011-12628 ；https://www.mjusticia.gob.es/es/Ciudadano/Nacionalidad/Documents/Instruccion%20DGSJFP%20Notarias%20declaraciones%20nacionalidad%20residencia.pdf ；https://www.boe.es/buscar/act.php?id=BOE-A-2014-10517 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-ley20-2011.html`（sha256 `dfc8f51ba806a571b0f98e798e5cbb8e42383fa7669764e98d3eca11c3a81d12`）；`policy-sources/2026-11-23-es-justicia-jura-notaria.pdf`（sha256 `90709937b593f674b9f8ff1a0a1e87cf6d1bc64b29c61ff37b33a419b68a56a9`）；`policy-sources/2026-11-23-es-registro-civil-gratuidad.html`（sha256 `2012e04d093a1cac35f249b6248e11dae0eb554e3bcd886b486e41ec01f4ae65`） | archived |
| SRC-344 | GUIDANCE | Seguridad Social · Jubilación ordinaria，法定退休年龄 | https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10963/28393/28396/28472?changeLanguage=es | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-edad-jubilacion.html`（sha256 `59cb47a400d0b1adb9e17be428285646df4d0c4f3d7852cce34ab6ad67b51add`） | archived |
| SRC-345 | GUIDANCE | 移民部 · Hoja 51，其他成员国长居者迁西；移民部 · Hoja 52，上述持有人家属 | https://www.inclusion.gob.es/web/migraciones/w/51.-residencia-de-larga-duracion-en-espana-del-residente-de-larga-duracion-ue-en-otro-eemm-de-la-ue ；https://www.inclusion.gob.es/web/migraciones/w/51.-residencia-de-larga-duracion-en-espana-del-residente-de-larga-duracion-ue-en-otro-eemm-de-la-ue-duplicar-0 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-hoja51.html`（sha256 `3a570fcd592f329761d7b8278f1df503af9e88ce19a5a42a330a6ac491efdb10`）；`policy-sources/2026-11-23-es-hoja52.html`（sha256 `436f406c0fa6a3192cbcabe162ac6caf6094a99d34d68261329fd2adf615fce7`） | archived |
| SRC-346 | LAW | BOE · 西班牙—法国国籍协定；BOE · 司法部西法协定适用指令 | https://www.boe.es/buscar/doc.php?id=BOE-A-2022-4916 ；https://www.boe.es/eli/es/ins/2022/03/31/%281%29/con | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-convenio-francia.html`（sha256 `b949582e7f093eeed9535d1eea09ed66af4c9814d01b0be87a22116418a87b1f`）；`policy-sources/2026-11-23-es-convenio-francia-instruccion.html`（sha256 `66e355fb48e355397084dd2c66ea760da3069e475b0148034903ca9ca0ee4a2e`） | archived |
| SRC-347 | LAW | BOE · Ley 9/2011，领事收费 | https://www.boe.es/buscar/act.php?id=BOE-A-2011-8222 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-visa-tasas-consulares.html`（sha256 `d7fccaf0dabceb9814b1b79ce642a40f1b5e7f09914502c4339826ea0d9f4833`） | archived |
| SRC-348 | GUIDANCE | TJUE · C-432/20 判决官方公报摘要 | https://curia.europa.eu/jcms/upload/docs/application/pdf/2022-01/cp220010es.pdf | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-tjue-ltr-ausencias.pdf`（sha256 `ed464a5c124d4efd127aad177e2345a9f7ff2045f4da2c9dafa61520c0a4865e`） | archived |
| SRC-349 | LAW | BOE · RDL 3/2004，IPREM 制定机制 | https://www.boe.es/buscar/act.php?id=BOE-A-2004-12010 | 各文书版本见原件 | 2026-11-23 | `policy-sources/2026-11-23-es-iprem-ley-base.html`（sha256 `81b9fa9060ee47b2b08dd0f1a6303cb9cd97ef8ad6f749b977234ddafdbe641e`） | archived |
| SRC-350 | LAW | Π.Δ. 106/2007 欧盟公民及家属在希腊自由流动与永久居留（含第 13–17、21、26 条），ΦΕΚ Α' 135 | https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2007/20070100135.pdf ；https://api.et.gr/apiFEK/1/2012/85/pdf | 2007-06-21；修法 2012-04-11 | 2026-11-24 | `policy-sources/2007-06-21-gr-fek-a135-2007-pd106.pdf`（sha256 `8c862624cde63ecc3ab6eb7d76f64ab45484d822ff42c3aec856974f5cfc9b8d`）；`policy-sources/2012-04-11-gr-fek-a85-2012-n4071.pdf`（sha256 `3d0f3290a544da047ff477b3e4258a799648af149d8b0948353e75a26fe33b0f`） | archived |
| SRC-351 | LAW | Π.Δ. 16/2014 领事收费标准（D 签 €180/€90、同胞归化等），ΦΕΚ Α' 24 | https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2014/20140100024.pdf | 2014-01-31 | 2026-11-23 | `policy-sources/2014-01-31-gr-fek-a24-2014-pd16.pdf`（sha256 `09dcbea2f6a9b49a3a85f2b3526d4b6a3c8ff5f8a7270985baff4d796d642792`） | archived |
| SRC-352 | LAW | ΚΥΑ 53821/2014 居留许可私人医疗保险最低保额与自付上限标准，ΦΕΚ Β' 2962 | https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2014/20140202962.pdf | 2014-11-04 | 2026-11-23 | `policy-sources/2014-11-04-gr-fek-b2962-2014-kya53821.pdf`（sha256 `4306ad1e6d3d93d0ff3b1637cafc8f0a452f9784f456880c901dc0610705fd79`） | archived |
| SRC-353 | LAW | ΥΑ 29845/2021 归化入籍经济与社会融入判定标准，ΦΕΚ Β' 1652 | https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2021/20210201652.pdf | 2021-04-22 | 2026-11-23 | `policy-sources/2021-04-22-gr-fek-b1652-2021-ya29845.pdf`（sha256 `6e3aa98110fb7d7af27acad0dd25aecde2ca0319ebc06d0a2e33568fcb3a181e`） | archived |
| SRC-354 | LAW | ΥΑ 58050/2021 修订 29845/2021（配偶收入、KFE 受抚养人、3/5/7 年收入回溯期、税单清单），ΦΕΚ Β' 3967 | https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2021/20210203967.pdf | 2021-08-27 | 2026-11-23 | `policy-sources/2021-08-27-gr-fek-b3967-2021-ya58050.pdf`（sha256 `49d10d27589f63722024e74d40ddf2a7bf8c2dc4c121e9a24ccd71c3de6b6741`） | archived |
| SRC-355 | LAW | ΚΥΑ 140304/Κ1/2021 长期居民（Μ.1）希腊语 Α2 及历史文化认证考试程序与 €50/€20 费用，ΦΕΚ Β' 5125 | https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2021/20210205125.pdf | 2021-11-05 | 2026-11-23 | `policy-sources/2021-11-05-gr-fek-b5125-2021-kya140304.pdf`（sha256 `4c31f1bb7f1a098d9be67c6b963caee0cb91ce8324dd3144b52019ef18419838`） | archived |
| SRC-356 | LAW | ΚΥΑ 95391/2024 各类居留许可所需证明材料及 €16 印制费规则，ΦΕΚ Β' 1807 | https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240201807.pdf | 2024-03-22 | 2026-11-23 | `policy-sources/2024-03-22-gr-fek-b1807-2024-kya95391.pdf`（sha256 `a319cfc53034089160ebad3312526c00c5d5a185840177e7313d8a685741336f`） | archived |
| SRC-357 | LAW | ΥΑ 25058/2024 2024 年法定最低工资（€830/月，2024-04-01 起），ΦΕΚ Β' 1974 | https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240201974.pdf | 2024-03-29 | 2026-11-23 | `policy-sources/2024-03-29-gr-fek-b1974-2024-ya25058.pdf`（sha256 `35ba44e5ee31565c31d296d533a6a59163c4b2802093df2cbf453f2feab6f019`） | archived |
| SRC-358 | LAW | ΚΥΑ 133226/2024 雇主雇用第三国工人财务能力门槛（Ε.1 €60k；Ε.4 €22k/€60k），ΦΕΚ Β' 2626 | https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240202626.pdf | 2024-05-02 | 2026-11-23 | `policy-sources/2024-05-02-gr-fek-b2626-2024-kya133226.pdf`（sha256 `12baa179d2f02db1365d72c47aaca90b1a882dc4f7ff3634b407f41845927f5f`） | archived |
| SRC-359 | LAW | ΚΥΑ 225679/2024 充足稳定生计收入标准（FIP €3,500；Ο.1 & Μ.1 最低工资净额×14），ΦΕΚ Β' 5223 | https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240205223.pdf | 2024-09-17 | 2026-11-23 | `policy-sources/2024-09-17-gr-fek-b5223-2024-kya225679.pdf`（sha256 `fb2fca6834a5ff3a78d348ca07b5fe0d1144e5100cf722272a838b5eb71bca40`） | archived |
| SRC-360 | LAW | Π.Ε.Γ.Π. 考试部令 21536/2026 第 8 条及历版 10802/2025、384/2024、15478/2024 第 7 条；按考试日核笔试与口试 | https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2026/20260202319.pdf ；https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2025/20250201093.pdf ；https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240204555.pdf ；https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240201368.pdf | 见各公报 | 2026-11-24 | `policy-sources/2026-04-24-gr-fek-b2319-2026-21536.pdf`（sha256 `d90246c1d5aadc7f0220645537959ddacb6f2215ac4487c77ad31989f8ad1ee8`）；`policy-sources/2025-03-10-gr-fek-b1093-2025-ya10802.pdf`（sha256 `3a2177ec5cc644968159dc6195b9a7c57b357c80264253281c3a5ab0e9c70d74`）；`policy-sources/2024-08-05-gr-fek-b4555-2024-384.pdf`（sha256 `9a670f96528ff9393d67e2806740f352e9a7d2da0c11d5c2a11e255c5c413cc4`）；`policy-sources/2024-03-04-gr-fek-b1368-2024-ya15478.pdf`（sha256 `1bfd81c464768efb6bcd17a6cd2f86f4c305fb89a9f9039db36d23ac54619a02`） | archived |
| SRC-361 | LAW | ΥΑ 8233/2025 2025 年法定最低工资（€880/月，2025-04-01 起），ΦΕΚ Β' 1476 | https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2025/20250201476.pdf | 2025-03-27 | 2026-11-23 | `policy-sources/2025-03-27-gr-fek-b1476-2025-ya8233.pdf`（sha256 `3f9aefe4d75d24eb9935300adaba189be4f72b4b09c125f95b1f1beb832177e8`） | archived |
| SRC-362 | LAW | ν. 5225/2025（第 95–98 条改 ΚΕΙ 第 1Β、7、8(3)、9 条：含 67% 残障、宣誓与冷却期例外），ΦΕΚ Α' 152 | https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2025/20250100152.pdf | 2025-09-02 | 2026-11-23 | `policy-sources/2025-09-02-gr-fek-a152-2025-n5225.pdf`（sha256 `d9fcb78db2641b003ba7a851764a6569def9064c153a0a640040bc0b7001cd89`） | archived |
| SRC-363 | LAW | ΥΑ 8934/2026 现行法定最低工资（€920/月，2026-04-01 起生效），ΦΕΚ Β' 1759 | https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2026/20260201759.pdf | 2026-03-27 | 2026-11-23 | `policy-sources/2026-03-27-gr-fek-b1759-2026-ya8934.pdf`（sha256 `c0f55d9a6a552e52c5adbc08cd9c5229240efee137fe3d34e0f087a31d69aa6e`） | archived |
| SRC-364 | GUIDANCE | 欧盟移民门户 "EU Blue Card - Greece"（含 2024 年薪门槛 €31,918.83 及收费；注意有效期仍写旧 2 年） | https://home-affairs.ec.europa.eu/policies/migration-and-asylum/eu-immigration-portal/eu-blue-card/eu-blue-card-greece_en | 2026-11-23 | 2026-11-23 | `policy-sources/2026-11-23-gr-eu-blue-card-greece.html`（sha256 `034c33dfa4870fcff604f955fee36d83d570e2a34e6a1ffc2d5d0e093b59f729`） | archived |
| SRC-365 | GUIDANCE | ΜΙΤΟΣ «Μ.1» Α2 语言与历史文化考试官方程序页（e-Παράβολο 162 €50 / 181 €20） | https://mitos.gov.gr/index.php/%CE%94%CE%94:%CE%94%CE%B9%CE%BF%CF%81%CE%B3%CE%AC%CE%BD%CF%89%CF%83%CE%B7_%CE%B5%CE%BE%CE%B5%CF%84%CE%AC%CF%83%CE%B5%CF%89%CE%BD_%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%BF%CE%BC%CE%AC%CE%B8%CE%B5%CE%B9%CE%B1%CF%82_%CE%B3%CE%B9%CE%B1_%CF%80%CE%BF%CE%BB%CE%AF%CF%84%CE%B5%CF%82_%CF%84%CF%81%CE%AF%CF%84%CF%89%CE%BD_%CF%87%CF%89%CF%81%CF%8E%CE%BD,_%CF%80%CF%81%CE%BF%CE%BA%CE%B5%CE%B9%CE%BC%CE%AD%CE%BD%CE%BF%CF%85_%CE%BD%CE%B1_%CF%85%CF%80%CE%B1%CF%87%CE%B8%CE%BF%CF%8D%CE%BD_%CF%83%CF%84%CE%BF_%CE%BA%CE%B1%CE%B8%CE%B5%CF%83%CF%84%CF%8E%CF%82_%CF%84%CE%BF%CF%85_%CE%B5%CF%80%CE%AF_%CE%BC%CE%B1%CE%BA%CF%81%CF%8C%CE%BD_%CE%B4%CE%B9%CE%B1%CE%BC%CE%AD%CE%BD%CE%BF%CE%BD%CF%84%CE%BF%CF%82 | 2026-11-23 | 2026-11-23 | `policy-sources/2026-11-23-gr-mitos-a2-exam.html`（sha256 `b3cacbef0122b6cd3d8b7e79656546ad8f8ebd20efe09ea2bd41a17f0d01e130`） | archived |
| SRC-366 | GUIDANCE | ΜΙΤΟΣ «Ε.1» 欧盟蓝卡雇主申请与首次核发程序（2107 €150 / 2119 €16 / 90 天法定期限） | https://mitos.gov.gr/index.php/%CE%94%CE%94:%CE%86%CE%B4%CE%B5%CE%B9%CE%B1_%CE%B4%CE%B9%CE%B1%CE%BC%CE%BF%CE%BD%CE%AE%CF%82_%CF%85%CF%88%CE%B7%CE%BB%CE%AE%CF%82_%CE%B5%CE%B9%CE%B4%CE%AF%CE%BA%CE%B5%CF%85%CF%83%CE%B7%CF%82_(%C2%AB%CE%95.1%C2%BB)_%CE%BA%CE%B1%CF%84%CF%8C%CF%80%CE%B9%CE%BD_%CE%AD%CE%B3%CE%BA%CF%81%CE%B9%CF%83%CE%B7%CF%82_%CE%B1%CE%B9%CF%84%CE%AE%CE%BC%CE%B1%CF%84%CE%BF%CF%82_%CF%84%CE%BF%CF%85_%CE%B5%CF%81%CE%B3%CE%BF%CE%B4%CF%8C%CF%84%CE%B7_%E2%80%93_%CE%91%CF%81%CF%87%CE%B9%CE%BA%CE%AE_%CF%87%CE%BF%CF%81%CE%AE%CE%B3%CE%B7%CF%83%CE%B7 | 2026-11-23 | 2026-11-23 | `policy-sources/2026-11-23-gr-mitos-e1-bluecard.html`（sha256 `2c403733f171e59c37a630779b2f4b2e29bb3f6b08a3fe8c96e7702452034923`） | archived |
| SRC-367 | GUIDANCE | ΜΙΤΟΣ «Ε.4» 普通工作邀请程序（含 €150/€16，但仍载旧法"1 年合同"） | https://mitos.gov.gr/index.php/%CE%94%CE%94:%CE%86%CE%B4%CE%B5%CE%B9%CE%B1_%CE%B4%CE%B9%CE%B1%CE%BC%CE%BF%CE%BD%CE%AE%CF%82_%CE%BA%CE%B1%CF%84%CF%8C%CF%80%CE%B9%CE%BD_%CE%AD%CE%B3%CE%BA%CF%81%CE%B9%CF%83%CE%B7%CF%82_%CE%BC%CE%B5%CF%84%CE%AC%CE%BA%CE%BB%CE%B7%CF%83%CE%B7%CF%82_%CE%B3%CE%B9%CE%B1_%CE%B5%CE%BE%CE%B1%CF%81%CF%84%CE%B7%CE%BC%CE%AD%CE%BD%CE%B7_%CE%B5%CF%81%CE%B3%CE%B1%CF%83%CE%AF%CE%B1_%E2%80%93_%CE%91%CF%81%CF%87%CE%B9%CE%BA%CE%AE_%CF%87%CE%BF%CF%81%CE%AE%CE%B3%CE%B7%CF%83%CE%B7_(%C2%AB%CE%95.4%C2%BB) | 2026-11-23 | 2026-11-23 | `policy-sources/2026-11-23-gr-mitos-e4-work.html`（sha256 `2c321f1b81e9eed20c66d8228b7cfb3b919c99ac20194d951d04912db8446df4`） | archived |
| SRC-368 | GUIDANCE | ΜΙΤΟΣ «Β.5»（不动产用途变更）手续页与费用代码 | https://mitos.gov.gr/index.php/ΔΔ:Μόνιμη_άδεια_διαμονής_επενδυτή_(αλλαγή_χρήσης)_–_Αρχική_χορήγηση | 2026-11-12 | 2026-11-23 | `policy-sources/2026-11-12-gr-mitos-b5-change-of-use.html`（sha256 `a774f79c561d48f171245933fcec8c83171a2f1d49cf8e0ad97586ee27b35b1d`） | archived |
| SRC-369 | GUIDANCE | ΜΙΤΟΣ Π.Ε.Γ.Π. 考试官方登记与收费代码页（e-Παράβολο 2590/259001） | https://mitos.gov.gr/index.php/%CE%94%CE%94:%CE%95%CE%BE%CE%B5%CF%84%CE%AC%CF%83%CE%B5%CE%B9%CF%82_%CE%B1%CF%80%CF%8C%CE%BA%CF%84%CE%B7%CF%83%CE%B7%CF%82_%CE%A0%CE%B9%CF%83%CF%84%CE%BF%CF%80%CE%BF%CE%B9%CE%B7%CF%84%CE%B9%CE%BA%CE%BF%CF%8D_%CE%95%CF%80%CE%AC%CF%81%CE%BA%CE%B5%CE%B9%CE%B1%CF%82_%CE%93%CE%BD%CF%8E%CF%83%CE%B5%CF%89%CE%BD_%CE%B3%CE%B9%CE%B1_%CE%A0%CE%BF%CE%BB%CE%B9%CF%84%CE%BF%CE%B3%CF%81%CE%AC%CF%86%CE%B7%CF%83%CE%B7 | 2026-11-23 | 2026-11-23 | `policy-sources/2026-11-23-gr-mitos-pegp.html`（sha256 `4ff80fb434f19cb4c117b31f50b98dcb0a264e7f90b00c2e667cae12b441b144`） | archived |
| SRC-370 | LAW | ν. 5167/2024 第 37(1) 条，Β.5 过渡期交割期限延长 | https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2024/20240100207.pdf | 2024-12-20 | 2026-11-23 | `policy-sources/2024-12-20-gr-fek-a207-2024-n5167.pdf`（sha256 `78207949e9ab130b5c4e0856a8280db708a762e80a1e01b02627fdfc57e5a89e`） | archived |
| SRC-371 | GUIDANCE | 移民部第 9 号通函，第 I.Δ(β)、II(δ) 节，旧制房产及符合过渡条款者的短租豁免与原投资金额 | https://migration.gov.gr/wp-content/uploads/2024/10/9%CE%95%CE%B3%CE%BA%CF%8D%CE%BA%CE%BB%CE%B9%CE%BF%CF%82-Golden-24.9.2024-FINAL.pdf | 2024-09-25 | 2026-11-23 | `policy-sources/2024-09-25-gr-migration-circular9-golden.pdf`（sha256 `79afa26e1a02ebb4432191523f9a9ca6fc8d522d9de8b62820bf464a4f9fb883`） | archived |
| SRC-372 | GUIDANCE | 希腊内政部 52779/24.09.2026 通函，执行国务委员会 715/2026、717/2026 关于入籍经济融入的判决 | https://www.ypes.gr/wp-content/uploads/2026/09/eggr52779-20260924.pdf | 2026-09-24 | 2026-11-23 | `policy-sources/2026-09-24-gr-ypes-economic-integration-52779.txt`（sha256 `972a9478f049daccbb86d92d14bc9a15389e756ebdbee60146966cfc23009436`） | archived (text) |
| SRC-373 | GUIDANCE | 移民部就 Ε.4 普通续期答复议会质询 4355/16.04.2024（ΑΠ 138490） | https://www.hellenicparliament.gr/UserFiles/67715b2c-ec81-4f0c-ad6a-476a34d732bd/12574231.pdf | 2024-05-08 | 2026-11-24 | `policy-sources/2024-05-08-gr-ministry-e4-renewal-reply.pdf`（sha256 `dfc4f0e3ed7b208674394ae2751afbd74736470bcd5f37fd45b90cad3dc4751f`） | archived |
| SRC-374 | GUIDANCE | Μίτος «Ε.4» 普通受雇许可续期，程序 686364 | https://mitos.gov.gr/index.php/ΔΔ:Άδεια_διαμονής_κατόπιν_έγκρισης_μετάκλησης_για_εξαρτημένη_εργασία_–_Ανανέωση_(«Ε.4») | 2026-11-03 | 2026-11-24 | `policy-sources/2026-11-03-gr-mitos-e4-renewal.html`（sha256 `bb2cef91a57fe617305d3a7fd90ccc0926c9c863c6e1aac2045aa7b68f3fc605`） | archived |
| SRC-375 | LAW | ΚΥΑ 214926/2025，Β.5 房产投资及用途变更证明，ΦΕΚ Β΄ 6014 | https://api.et.gr/apiFEK/2/2025/6014/pdf | 2025-11-11 | 2026-11-24 | `policy-sources/2025-11-11-gr-fek-b6014-2025-kya214926.pdf`（sha256 `e7fc06df068b5109d991114d1136a7ef6bff1591d9053e50bad827a27d1cef6b`） | archived |
| SRC-376 | GUIDANCE | ΜΙΤΟΣ 手续 517141，Ε.1 蓝卡持有人家属的首张居留卡 | https://en.mitos.gov.gr/index.php/%CE%94%CE%94%3AResidence_permit_for_family_members_of_a_highly_qualified_residence_permit_holder_%28%E2%80%98E.1%E2%80%99%29_%E2%80%93_Initial_granting | 2026-11-05 | 2026-11-24 | `policy-sources/2026-11-05-gr-mitos-blue-card-family-initial.html`（sha256 `76b939f8d0825752a0754333110b40c6560ca0a85974a191281a44c9f0af9367`） | archived |
| SRC-377 | GUIDANCE | 欧委会 C/2023/1392，欧盟公民与家属自由流动指引，第 2.2.2.4–5、2.2.3、5.2.4、9 节 | https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:C_202301392 | 2023-12-22 | 2026-11-24 | `policy-sources/2023-12-22-gr-eu-free-movement-guidance.pdf`（sha256 `fc3c76bbfc117d29c6f8f6061d3c51a181b759b2ce7eeb366ff55cce37390430`） | archived |
| SRC-378 | LAW | ν. 4800/2021 第 7(1) 条，民法典第 1510 条的未成年子女亲权 | https://api.et.gr/apiFEK/1/2021/81/pdf | 2021-05-21 | 2026-11-24 | `policy-sources/2021-05-21-gr-fek-a81-2021-n4800.pdf`（sha256 `421bd3f569b03749a24b2a58822cdd657f699308553612bd04a2bee51731192b`） | archived |
| SRC-379 | LAW | ν. 1329/1983 第 3 条，民法典第 127 条的成年年龄 | https://api.et.gr/apiFEK/1/1983/25/pdf | 1983-02-18 | 2026-11-24 | `policy-sources/1983-02-18-gr-fek-a25-1983-n1329.pdf`（sha256 `f52c190dbcfe738383136edd1ea27bb5c7ff8a7af00007a4985a441e69f1cefa`） | archived |
| SRC-380 | LAW | S.I. 569/2011 与 S.I. 498/2023：入籍申请表及费用 | https://www.irishstatutebook.ie/eli/isbc/si2011_551-600.html ；https://www.irishstatutebook.ie/eli/2011/si/569/made/en/print ；https://www.irishstatutebook.ie/eli/2023/si/498/made/en/print | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-nat-fees-index.html`（sha256 `adb363cb99a867a06fcbc19695d2cec857e75f7fa8d3ecde0d4a99329626acd6`）；`policy-sources/2026-11-23-ie-nat-fees.html`（sha256 `64648be4f43007fd31a68136b6d2643b1a7c9f5e2e08d0f39e0ad129f32806df`）；`policy-sources/2026-11-23-ie-nat-forms-2023.html`（sha256 `0b0677929726b254f32cd5ba0f680ffb79e824754b7e81d20ecbf9125a3a91e9`） | archived |
| SRC-381 | GUIDANCE | ISD：入籍身份证明、居住证明与保护身份政策 | https://www.irishimmigration.ie/changes-to-citizenship-for-people-granted-international-protection/ ；https://www.irishimmigration.ie/wp-content/uploads/citizenship/residency-affidavit-proof-form-citizenship-0092026.pdf ；https://www.irishimmigration.ie/how-to-become-a-citizen/become-an-irish-citizen-by%20-naturalisation/ ；https://www.irishimmigration.ie/how-to-become-a-citizen/become-an-irish-citizen-by-naturalisation/proofs-of-identity-and-residence/ | 见原文 | 2026-11-23 | `policy-sources/2026-11-22-ie-isd-ip-citizenship-5-years.html`（sha256 `c51b7e529b04961c3b4c923c362ff07e5e7a0444cbedc5928b8ef9678a4b427a`）；`policy-sources/2026-11-23-ie-citizen-affidavit.pdf`（sha256 `2d249b01fc6aa2e07cc61997e6d5767becb5167f20f9e1a074fdb915696a21a0`）；`policy-sources/2026-11-23-ie-citizen-legacy.html`（sha256 `ba3c2bb429b564fb79a7ea3741fb7b0c2b621d9651282b2e60f3977f77baacf0`）；`policy-sources/2026-11-23-ie-citizen-proofs.html`（sha256 `f623712d60fa365c039a4994dcac6b6f4ba8aec6f8770542c4dfb0ffd8a262fa`） | archived |
| SRC-382 | GUIDANCE | ISD：入籍申请人的 Garda e-vetting 指南 | https://www.irishimmigration.ie/how-to-become-a-citizen/become-an-irish-citizen-by-naturalisation/citizenship-applicants-guide-to-an-garda-siochana-national-vetting-bureau-e-vetting/ | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-vetting.html`（sha256 `6216a9f503e164d7a76ae22d66674d074695c0daf00bf391fa35aa37fe37541d`） | archived |
| SRC-383 | LAW | Immigration Act 2004 编纂版及 S.I. 421/2025 登记收费 | https://revisedacts.lawreform.ie/eli/2004/act/1/revised/en/html ；https://www.irishstatutebook.ie/eli/2025/si/421/made/en/print | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-immigration-act.html`（sha256 `3c38d1a662265cbd8f19826e8cba77917569994817feb65944a4aeaf4797a212`）；`policy-sources/2026-11-23-ie-registration-fees.html`（sha256 `e822c34fcfc176407721a62b38f3af297867e9814f46d0deadff63f0d8bf8986`） | archived |
| SRC-384 | GUIDANCE | ISD：首次登记、续期与登记常见问题 | https://www.irishimmigration.ie/registering-your-immigration-permission/frequently-asked-questions-for-registration/ ；https://www.irishimmigration.ie/registering-your-immigration-permission/how-to-register-your-immigration-permission-for-the-first-time/required-documents/ ；https://www.irishimmigration.ie/registering-your-immigration-permission/how-to-renew-your-current-permission/renewing-your-registration-permission-if-you-live-in-the-republic-of-ireland/ | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-registration-faq.html`（sha256 `98c21aa574c8cc38fd05221b13711f3902af42ee8508a987a2fcd413c8533ac4`）；`policy-sources/2026-11-23-ie-registration-first.html`（sha256 `f24b2711c264a39d254bdc271f5b7d7cdda763fd89833ef66ec4f4795e1a58f1`）；`policy-sources/2026-11-23-ie-registration-renew.html`（sha256 `8f3552c96d025358fc78ed2c5ded771787523f4c7d43f8c3670a8377183b48fa`） | archived |
| SRC-385 | GUIDANCE | ISD：非 EEA 家庭团聚政策修订说明与版本档案 | https://www.irishimmigration.ie/amendments-to-policy-on-non-eea-family-reunification/ ；https://www.irishimmigration.ie/coming-to-join-family-in-ireland/policy-document-archive/ | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-family-amendments.html`（sha256 `f1b587c1d93aa9b2ffbe422b138f167fbe5106dff63230cf2e86534c462a321f`）；`policy-sources/2026-11-23-ie-family-archive.html`（sha256 `9a486555b7502233a0ffb19f0d89ca26a4b2befcbddf0538e4070477ad84186f`） | archived |
| SRC-386 | GUIDANCE | ISD：家庭团聚收入门槛 | https://www.irishimmigration.ie/coming-to-join-family-in-ireland/financial-thresholds/ | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-family-income.html`（sha256 `a38ceb2fe1cec26fa6c107861ed438d9ed3146ec0992c2e33589e35c31673eda`） | archived |
| SRC-387 | POLICY | 非 EEA 家庭团聚政策 2016、2025 年 11 月、2026 年 6 月版 | https://www.irishimmigration.ie/wp-content/uploads/2021/04/Policy-document-on-Non-EEA-family-reunification.pdf ；https://www.irishimmigration.ie/wp-content/uploads/2026/11/FINAL-PDF-Revised-Family-Reunification-Policy.pdf ；https://www.irishimmigration.ie/wp-content/uploads/2026/06/Family-Reunification-Policy-12-June-2026.pdf | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-family-2016.pdf`（sha256 `e0294f68dbc8f865e5f9ecb202ca7edf811eadd5c9f4b8111330c91d92fa4562`）；`policy-sources/2026-11-23-ie-family-2025.pdf`（sha256 `9a9e80c0b346eb9a476b2dcfa43a5e7403ff83ce6cad11c2db4669a340d9dcb9`）；`policy-sources/2026-11-23-ie-family-2026.pdf`（sha256 `c1a98231465522d7f0bd3c8ad51301f7fb95234a870b83dfe2f2134b6e3be8f8`） | archived |
| SRC-388 | GUIDANCE | ISD：爱尔兰公民配偶及 de facto 伴侣的境内外入口 | https://www.irishimmigration.ie/coming-to-join-family-in-ireland/joining-an-irish-national/de-facto-partner-of-an-irish-national/ ；https://www.irishimmigration.ie/my-situation-has-changed-since-i-arrived-in-ireland/de-facto-partner-of-an-irish-or-non-eea-national/ ；https://www.irishimmigration.ie/my-situation-has-changed-since-i-arrived-in-ireland/spouse-civil-partner-of-irish-national-scheme/ | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-family-de-facto-entry.html`（sha256 `8cf6ded7c0686523dd01731361c5ede0820fb2de5007d9a452b4b9c508d4ec6d`）；`policy-sources/2026-11-23-ie-family-de-facto.html`（sha256 `dc85b5878120391d1874b9f28abe234f0914f2454142e32e37c5c145d8167967`）；`policy-sources/2026-11-23-ie-family-irish-spouse.html`（sha256 `127592c685320e8ec310094c5be19e13103521b850d4ebe151c9256ac42566d0`） | archived |
| SRC-389 | GUIDANCE | ISD：EU Treaty Rights 原则与永久居留证明 | https://www.irishimmigration.ie/coming-to-join-family-in-ireland/joining-an-eea-or-swiss-national/eu-treaty-rights/ | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-eu-rights.html`（sha256 `3b69e107bc9247345296c722f0aa0811a745c99b97d8f5392c86c84dcbebc79c`） | archived |
| SRC-390 | LAW | S.I. 548/2015：European Communities (Free Movement of Persons) Regulations 2015 | https://www.irishstatutebook.ie/eli/isbc/si2015_501-550.html ；https://www.irishstatutebook.ie/eli/2015/si/548/made/en/print | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-eu-548-index.html`（sha256 `a533d2cd4e6d9c17afbcd16f2a72792dcf937a8e0e8dc4b873b82a928776033a`）；`policy-sources/2026-11-23-ie-eu-548.html`（sha256 `e0e93bc022695bb82f88965ca4d6ab797361709e8d650694da2c8da7b3519f7d`） | archived |
| SRC-391 | GUIDANCE | ISD：EUTR2、EUTR3、EUTR5 表格与说明 | https://www.irishimmigration.ie/wp-content/uploads/2026/05/Explanatory-leaflet-for-Form-EUTR2.pdf ；https://www.irishimmigration.ie/wp-content/uploads/2026/05/Form-EUTR2.pdf ；https://www.irishimmigration.ie/wp-content/uploads/2026/09/Explanatory-leaflet-for-Form-EUTR3-updated-August-2026.pdf ；https://www.irishimmigration.ie/wp-content/uploads/2026/05/Explanatory-leaflet-for-Form-EUTR5.pdf | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-eu-eutr2-leaflet.pdf`（sha256 `f14a227584e268a52cd31b0cac50f51d9dcd32ed2ee381b0c9a58c2a6902a46f`）；`policy-sources/2026-11-23-ie-eu-eutr2.pdf`（sha256 `27c3569b021cd79fbbe816e2573d2e2ad29d5c0b696e26f0c44d082acfa6f2f4`）；`policy-sources/2026-11-23-ie-eu-eutr3-2026.pdf`（sha256 `ce0ce03d72664d22aaef5a808af5536dd5c9bb81ba47549921ce8fa7a81dc28d`）；`policy-sources/2026-11-23-ie-eu-eutr5-leaflet.pdf`（sha256 `0046f1751b7027beef0fe4d64d1cd4703446935168243f5344652b79968a52ed`） | archived |
| SRC-392 | LAW | S.I. 728/2020、Withdrawal Agreement 与 ISD Brexit FAQ | https://www.irishstatutebook.ie/eli/2020/si/728/made/en/print ；https://assets.publishing.service.gov.uk/media/5daaab7fed915d42a05eea12/Agreement_on_the_withdrawal_of_the_United_Kingdom_of_Great_Britain_and_Northern_Ireland_from_the_European_Union_and_the_European_Atomic_Energy_Community.pdf ；https://www.irishimmigration.ie/wp-content/uploads/2022/03/Impact-of-Brexit-on-UK-Nationals-in-Ireland-and-their-non-EEA-national-family-members-March-2022.pdf | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-wa-728.html`（sha256 `67d57d373a2dba00a56a7c684a0232d8b6aef976a69a3ab079bf6c847f43ed1a`）；`policy-sources/2026-11-23-ie-wa-agreement.pdf`（sha256 `dc369c02edf9ce570562b69e7b5b2808477e508289e8490b8aefe6a898eee617`）；`policy-sources/2026-11-23-ie-wa-brexit-faq.pdf`（sha256 `887f6fa3964a0fd94d8121b430412db32a5304f3df37da64dce89a66d770b507`） | archived |
| SRC-393 | LAW | Employment Permits Act 2024、S.I. 444/2024、S.I. 643/2025 | https://www.irishstatutebook.ie/eli/2024/act/17/enacted/en/print ；https://www.irishstatutebook.ie/eli/2025/si/643/made/en/pdf ；https://www.irishstatutebook.ie/eli/2024/si/444/made/en/print | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-permit-act.html`（sha256 `9540e0c315289bf21f168ee9db0ec625995d02aebf4263bc4d74220c7921e5f3`）；`policy-sources/2026-11-23-ie-permit-mar-regs.pdf`（sha256 `8544f65f66f0bb066b15380a2447265f977921058f8cf3000d383e03ceb6b6a4`）；`policy-sources/2026-11-23-ie-permit-regs.html`（sha256 `b536344ea3213d34a968eba9e6eddc364089963ed534f705a0c0a0174b13d889`） | archived |
| SRC-394 | GUIDANCE | DETE：CSEP、GEP、ICT 及最低报酬 | https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/critical-skills-employment-permit/ ；https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/general-employment-permit/ ；https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/intra-company-transfer-employment-permit/ ；https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/economic-migration-policy/minimum-annual-remuneration/ | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-permit-csep.html`（sha256 `0e3a14f1a17637aade6a5ad8a8f4a8c9593a8ca48b93fe973216993a82ecd40e`）；`policy-sources/2026-11-23-ie-permit-gep.html`（sha256 `461db66bc33092a0015af6b54c4217c359dbf59d9b003a77e0472f2f325da006`）；`policy-sources/2026-11-23-ie-permit-ict.html`（sha256 `85c8e7b23829b076f22e14ecb89e8ad87a5ae1913dd2e67d8a36ff2739f59279`）；`policy-sources/2026-11-23-ie-permit-mar.html`（sha256 `04234a9ffab9f237d9c7ae7987880cc06266c7f153f10e8379abfccf54875d72`） | archived |
| SRC-395 | GUIDANCE | 欧盟长期居民政策与 EMN 爱尔兰联络点答复 | https://ec.europa.eu/commission/presscorner/api/files/attachment/872342/COM_2022_650_1_EN_ACT_part1_v5.pdf ；https://home-affairs.ec.europa.eu/system/files/2022-06/20221_directive_2003109ec_duration_of_absence_and_loss_of_the_long-term_resident_status%20%281%29.pdf | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-eu-commission-ltr.pdf`（sha256 `906fc8b2e52a852019dc19aea3abb5025f91373b25981f9fc933141c13aac34b`）；`policy-sources/2026-11-23-ie-eu-emn-query-ltr.pdf`（sha256 `54b409829bad44d8af812c899b6e8d2bbd2b3f625094e4bea3bf057e88c04a8c`） | archived |
| SRC-397 | GUIDANCE | DETE：就业许可最新公告 | https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/latest-updates/ | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-permit-latest.html`（sha256 `b7f8e6c8a02a437ae7641d4015630da6ebd40afd6c327443ea009567701b4646`） | archived |
| SRC-398 | GUIDANCE | ISD：Long Term Residency、申请表与非 EEA 医师说明 | https://www.irishimmigration.ie/my-situation-has-changed-since-i-arrived-in-ireland/long-term-residency/ ；https://www.irishimmigration.ie/wp-content/uploads/2021/05/SHOs-and-registrars-with-5-years-work.pdf ；https://www.irishimmigration.ie/wp-content/uploads/2023/07/Long-Term-Residency-Application-Form.pdf | 见原文 | 2026-11-23 | `policy-sources/2026-11-22-ie-isd-long-term-residency.html`（sha256 `883f996747fe15f42b3f448a3795c7d376d57cc48fed21e7562b65c690b819e5`）；`policy-sources/2026-11-23-ie-ltr-doctors.pdf`（sha256 `e7082294607a2c85a67fbd4a31a0010fc729a10f806f5b5e14382ffe312c843e`）；`policy-sources/2026-11-23-ie-ltr-form.pdf`（sha256 `ce7e176856b6c99534dbacd3c1624c7606a81424ecaa2b9c908c8c857ba16ea2`） | archived |
| SRC-399 | GUIDANCE | ISD：家暴受害者独立居留指引 | https://www.irishimmigration.ie/my-situation-has-changed-since-i-arrived-in-ireland/immigration-guidelines-for-victims-of-domestic-abuse/ ；https://www.irishimmigration.ie/wp-content/uploads/2024/01/Victims-of-Domestic-Abuse-Immigration-Guidelines-Dec-2023.pdf | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-domestic-abuse-canonical.html`（sha256 `3611433ff6ed6e597ad7304747b4fb36469b0f59588e25424fba9fa2dc91c02a`）；`policy-sources/2026-11-23-ie-domestic-abuse.pdf`（sha256 `7f6fd9cd49f27fef5b17f72aa357f321028d0622297d275b9109803c26830f4a`） | archived |
| SRC-400 | GUIDANCE | ISD：Irish Descent / Irish Associations 办理页与评审指引 | https://www.irishimmigration.ie/wp-content/uploads/2025/12/IA-Guidance-footnote-updated-03-12-2025.pdf ；https://www.irishimmigration.ie/how-to-become-a-citizen/applications-based-on-irish-descent-or-irish-associations/ ；https://www.irishimmigration.ie/apply-for-irish-citizenship-by-irish-descent-or-irish-associations/ | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-irish-assoc-dec-2025.pdf`（sha256 `b84bc516ed3370431b5fac2bb0e6190b84604e4d91484ea67e84d1a568524347`）；`policy-sources/2026-11-23-ie-irish-assoc-legacy.html`（sha256 `9da66ba31d0e69ef73e6a03e2426f2c43d927854c1d9c6c1188d32cb4f1a63ce`）；`policy-sources/2026-11-23-ie-irish-associations.html`（sha256 `9cde265c7a5766b312526f485f6abf36089876738ba659abfaa683cdab6b34fb`） | archived |
| SRC-401 | LAW | Age of Majority Act 1985 | https://www.irishstatutebook.ie/eli/1985/act/2/enacted/en/print | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-age-majority.html`（sha256 `6025cb540b66919eb88d345c195cf364dbb2a7ab6a174ed9f6ba76c67bb7b9ce`） | archived |
| SRC-402 | LAW | Housing Act 1966 编纂版与原始条文 | https://revisedacts.lawreform.ie/eli/1966/act/21/revised/en/html ；https://www.irishstatutebook.ie/eli/1966/act/21/section/63/enacted/en/html | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-housing-revised.html`（sha256 `1b9884c8441c38fe73e0ba5370009d0114ed77dbd45bb6d8a79c29dc60fdf092`）；`policy-sources/2026-11-23-ie-housing-s63.html`（sha256 `d5eabb001d7d1661ff74620d92b91499c813e60cf0e56498137cc040dc8ce4de`） | archived |
| SRC-404 | POLICY | DETE：Employment Permits Minimum Annual Remuneration Roadmap | https://enterprise.gov.ie/en/publications/publication-files/employment-permits-minimum-annual-remuneration-outcome-of-the-roadmap-review-2025.pdf | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-permit-roadmap.pdf`（sha256 `573817d6079e60fee2824072406db4e94d0cbe07442fd49dfbc30e92e4c3ff5e`） | archived |
| SRC-405 | GUIDANCE | ISD：未成年人登记 | https://www.irishimmigration.ie/registering-your-immigration-permission/how-to-register-your-immigration-permission-for-the-first-time/registration-requirements-for-minors/ | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-minor-registration.html`（sha256 `87aac14beccd3302edcc856d8b1b87a95e7bc1ac81fb805f276e7658e9e38cf0`） | archived |
| SRC-406 | GUIDANCE | ISD：Preclearance and Entry Visa Fees | https://www.irishimmigration.ie/preclearance-and-entry-visas-fees/ | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-entry-fees.html`（sha256 `db2e1d9195cf34500fd6254caf78f67bc5b525b51936da39fd795e53cfaccc79`） | archived |
| SRC-407 | LAW | eISB 就业许可法与条例索引 | https://www.irishstatutebook.ie/eli/isbc/2024_17.html ；https://www.irishstatutebook.ie/eli/isbc/si2024_401-450.html | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-permit-act-index.html`（sha256 `bb2d0d0c379f7724e621c48b3494db89c846839f6c7def145721771fdd928c76`）；`policy-sources/2026-11-23-ie-permit-regs-index.html`（sha256 `79991bc3e8b63040abeda6e08d9b7103f773114a915032a6e1c8afbe4f6d5045`） | archived |
| SRC-408 | LAW | International Protection Act 2026 | https://www.irishstatutebook.ie/eli/2026/act/9/enacted/en/print.html | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-ip-act-2026.html`（sha256 `82a1d50c8daf56e20a6a5baeaadf917468a6caa702eb0c1bbb02ee0950734e97`） | archived |
| SRC-409 | GUIDANCE | ISD：Family Dependents 与 Join non-EEA Family Member | https://www.irishimmigration.ie/my-situation-has-changed-since-i-arrived-in-ireland/family-dependents/ ；https://www.irishimmigration.ie/coming-to-join-family-in-ireland/joining-a-non-eea-non-swiss-national/join-non-eea-family-member/ | 见原文 | 2026-11-23 | `policy-sources/2026-11-23-ie-family-dependants.html`（sha256 `0475e24f8fd9522b43cc3179f4118a38a16a616cf0a63a6cd6359ac373fc81bc`）；`policy-sources/2026-11-23-ie-family-non-eea-entry.html`（sha256 `612f3514ccecca582be08970de264da7f2e2d121d5b40a9d4109abf91bf7b6a6`） | archived |
| SRC-470 | LAW | 葡萄牙 · Regulamento da Nacionalidade Portuguesa（DL 26/2022 重刊） | https://files.diariodarepublica.pt/1s/2022/03/05500/0000200059.pdf | 2022-03-18 | 2026-11-23 | `policy-sources/2022-03-18-pt-dl-26-2022.pdf`（sha256 `8dd5480d6cc38cf67d2f2058b921de0c0482f5b2cef0ec5451a45af53d7f8115`） | archived |
| SRC-471 | LAW | 葡萄牙 · DR 1/2024，外国人法实施条例修订 | https://files.diariodarepublica.pt/1s/2024/01/01200/0000600050.pdf | 2024-01-17 | 2026-11-23 | `policy-sources/2024-01-17-pt-dr-1-2024.pdf`（sha256 `b94db50993f10b2d2d6fdbe67e3e9ae9812c58be2e4c215dbe028627439ca846`） | archived |
| SRC-472 | LAW | 葡萄牙 · DR 4/2022 与 DR 9/2018，外国人法实施条例 | https://files.diariodarepublica.pt/1s/2022/09/19000/0002800097.pdf ；https://files.diariodarepublica.pt/1s/2018/09/17500/0471804757.pdf | 2022-09-30；2018-09-11 | 2026-11-23 | `policy-sources/2022-09-30-pt-dr-4-2022.pdf`（sha256 `82bc888263b162fbc4c96549a5725eaba5a84bbaaf6398918708ae9123777118`）；`policy-sources/2018-09-11-pt-dr-9-2018.pdf`（sha256 `87218db7207ff00347c22b4db3fca0a8ef03b0531df00fcbf54e2fd0f622dbb2`） | archived |
| SRC-473 | LAW | 葡萄牙 · Portaria 1563/2007，居留生计标准 | https://files.diariodarepublica.pt/gratuitos/1s/2007/12/23800.pdf | 2007-12-11 | 2026-11-23 | `policy-sources/2007-12-11-pt-portaria-1563-2007.pdf`（sha256 `551884e7cce2b2b75ea5192eb46e6e715286fbcb7b913e76a10b8e4d4559f17b`） | archived |
| SRC-474 | LAW | 葡萄牙 · 本土与自治区最低工资参考及普通雇员社保份额 | https://files.diariodarepublica.pt/1s/2025/12/24900/0001400016.pdf ；https://files.diariodarepublica.pt/1s/2026/02/02300/0001400015.pdf ；https://files.diariodarepublica.pt/gratuitos/1s/2026/07/14600.pdf ；https://files.diariodarepublica.pt/gratuitos/1s/2009/09/18000.pdf | 2025-12-29；2026-02-03；2026-07-30；2009-09-16 | 2026-11-23 | `policy-sources/2025-12-29-pt-dl-139-2025.pdf`（sha256 `e9e6da9ad45ffb70cb0a19a755fd31e4da9934174a3885edaacf7523c842c64f`）；`policy-sources/2026-02-03-pt-dlr-madeira-1-2026.pdf`（sha256 `0ddf54d909d290b94defc993f5d0f2d74701d10d39488065ad22ff2bed9fe805`）；`policy-sources/2026-07-30-pt-resolucao-madeira-26-2026.pdf`（sha256 `d4d259cc976d570d14f7ce93db69046cca8c295023de2741ff32d8e7695052cb`）；`policy-sources/2009-09-16-pt-lei-110-2009.pdf`（sha256 `3af99421b96092a6803922106324d4cbabb3762c510b5ff4293196984493d991`） | archived |
| SRC-475 | GUIDANCE | 葡萄牙 · AIMA 生计资源与证据说明 | https://aima.gov.pt/pt/temas-transversais/meios-de-subsistencia | 网页见抓取日 | 2026-11-23 | `policy-sources/2026-11-23-pt-aima-meios.html`（sha256 `ebf83ea468a2761988b3071b55a2bdf4e6953315ad7d4d376bc5be9ad6609deb`） | archived |
| SRC-476 | GUIDANCE | 葡萄牙 · AIMA 2026 年收费表与生效公告 | https://aima.gov.pt/media/pages/documents/dc677d0005-1772305205/tabela-de-taxas-e-demais-encargos-a-cobrar-pelos-procedimentos-administrativos.pdf ；https://aima.gov.pt/pt/noticias/atualizacao-da-tabela-de-taxas | 2026-03-01；网页见抓取日 | 2026-11-23 | `policy-sources/2026-03-01-pt-aima-tabela-taxas.pdf`（sha256 `ed59e0ad90923f0a6a1cf68e5352b0195047b17fcf441dfb7834dbf150362fb3`）；`policy-sources/2026-02-28-pt-aima-atualizacao-taxas.html`（sha256 `922fe5e18d5926313cd262c788529011a9b8f75c45b7adc955cfabb13a162fe6`） | archived |
| SRC-477 | LAW | 葡萄牙 · Portaria 307/2023，AIMA 收费及年度调整 | https://aima.gov.pt/media/pages/documents/fa233e86c7-1750429842/portaria-307.pdf | 2023-10-13 | 2026-11-23 | `policy-sources/2023-10-13-pt-portaria-307-2023.pdf`（sha256 `c2b0dcb6ca35655aae1a4a79ae60ea584cc8e8c494c23f6886691eae0b0753c0`） | archived |
| SRC-478 | LAW | 葡萄牙 · Lei 37/2006，自由流动居留权 | https://files.diariodarepublica.pt/1s/2006/08/15300/57175724.pdf | 2006-08-09 | 2026-11-23 | `policy-sources/2006-08-09-pt-lei-37-2006.pdf`（sha256 `e327ca4c5974dbb5151a4af4b51ac760fa2bc948be65f03eed6f5c845b79884d`） | archived |
| SRC-479 | LAW | 葡萄牙 · Portaria 13/2024、勘误、原费表及前次修订，自由流动收费 | https://files.diariodarepublica.pt/1s/2024/01/01500/0001300017.pdf ；https://files.diariodarepublica.pt/1s/2024/01/02200/0001000010.pdf ；https://files.diariodarepublica.pt/gratuitos/1s/2017/05/09600.pdf ；https://files.diariodarepublica.pt/gratuitos/1s/2010/12/25302.pdf | 2024-01-22；2024-01-31；2017-05-18；2010-12-31 | 2026-11-23 | `policy-sources/2024-01-22-pt-portaria-13-2024.pdf`（sha256 `1210fb420d1af28d150ad272543f613d3b7d11dcf4f5fa732fc5bdda4ba1078a`）；`policy-sources/2024-01-31-pt-portaria-32-2024.pdf`（sha256 `1c84a24a32036bd38d8bb67029c9cc364acf557bdf198eb3ffcd6d7e1ff2340a`）；`policy-sources/2017-05-18-pt-portaria-164-2017.pdf`（sha256 `ab6e4dd4e6a00b090bad41f029c23c03616ddb0814b435ffecb57e47dcc19700`）；`policy-sources/2010-12-31-pt-portaria-1334-d-2010.pdf`（sha256 `2a6dcfca2d39eac571edd223c56e31d40140f786e8077ebe9a03625b66e6728d`） | archived |
| SRC-480 | LAW | 葡萄牙 · PLA 与旧制语言证明法规 | https://files.diariodarepublica.pt/gratuitos/1s/2020/08/15100.pdf ；https://files.diariodarepublica.pt/1s/2022/07/14000/0000200004.pdf ；https://files.diariodarepublica.pt/1s/2014/09/17500/0488804889.pdf | 2020-08-05；2022-07-21；2014-09-11 | 2026-11-23 | `policy-sources/2020-08-05-pt-portaria-183-2020.pdf`（sha256 `383c32370d3c573ae06c0cf958aa0bdf5802212c66d27b1b50f0252bc04b3b4d`）；`policy-sources/2022-07-21-pt-portaria-184-2022.pdf`（sha256 `7568e9696daeb9c9b322d6b2b0f27898f3c2275122a1f0133da60484c8425142`）；`policy-sources/2014-09-11-pt-portaria-176-2014.pdf`（sha256 `3adf947175d09e306dbdd1fb3913a008ebc338920dde685403cfa473a6ee91e7`） | archived |
| SRC-481 | GUIDANCE | 葡萄牙 · AIMA ARI 常见问题 | https://aima.gov.pt/pt/a-aima/perguntas-frequentes-faqs/autorizacao-de-residencia-para-investimento-ari | 网页见抓取日 | 2026-11-23 | `policy-sources/2026-11-23-pt-aima-ari-faq.html`（sha256 `24f4be9067da60c223999fc1e25d2ea41195dc690fb148be43da9a50dcc4abbd`） | archived |
| SRC-482 | GUIDANCE | 葡萄牙 · 里斯本大学 CAPLE · CIPLE | https://caple.letras.ulisboa.pt/exame/2/ciple | 网页见抓取日 | 2026-11-23 | `policy-sources/2026-11-23-pt-caple-ciple.html`（sha256 `d3355211533d7b80813f18db313edd5ccdfaa69ef246630fc830d804023acb4f`） | archived |
| SRC-483 | GUIDANCE | 葡萄牙 · 司法部 · 婚姻与事实伴侣声明取得国籍旧指南 | https://justica.gov.pt/Como-obter-nacionalidade-portuguesa/E-casado-ou-vive-em-uniao-de-facto-com-um-portugues-ha-mais-de-3-anos | 网页见抓取日 | 2026-11-23 | `policy-sources/2026-11-23-pt-justica-casamento.html`（sha256 `34bbec87ad30780e05e610a5894a1d7d6db21f9619428dad282e098363e4617c`） | archived |
| SRC-484 | GUIDANCE | 葡萄牙 · AIMA 自由流动永久证书、家属卡与线上入口 | https://aima.gov.pt/pt/nacionais-ue-e-familiares/nacionais-ue/certificado-de-residencia-permanente-para-nacionais-ue ；https://aima.gov.pt/pt/nacionais-ue-e-familiares/familiares-de-nacionais-ue/cartao-de-residencia-permanente-para-familiares-de-nacionais-da-ue ；https://aima.gov.pt/pt/noticias/portal-de-renovacoes-atualizado-para-nacionais-da-uniao-europeia-ue-e-familiares | 网页见抓取日 | 2026-11-23 | `policy-sources/2026-11-23-pt-aima-ue-certificado.html`（sha256 `c8c81a409b859c565d828049cc70456ea5eeeeb71999536be7987393eaef0928`）；`policy-sources/2026-11-23-pt-aima-ue-cartao.html`（sha256 `0832ab12e60559bd2e7c5febfb4fdc393eaa1347ef506372553c4402db459d28`）；`policy-sources/2026-11-23-pt-aima-ue-portal.html`（sha256 `31aae90a55c114d19fe15eff2595de226bba08cdac78f49308151bc28554c9fb`） | archived |
| SRC-485 | LAW | 葡萄牙 · DL 41/2023，AIMA 职权移转 | https://files.diariodarepublica.pt/gratuitos/1s/2023/06/10700.pdf | 2023-06-02 | 2026-11-23 | `policy-sources/2023-06-02-pt-dl-41-2023.pdf`（sha256 `0ab6a0be57b5aba56c9af835e9c96bbb2da481524abacef2dfcd414492001c34`） | archived |
| SRC-486 | LAW | 葡萄牙 · DL 37-A/2024，废止部分无居留签证手续 | https://files.diariodarepublica.pt/1s/2024/06/10601/0000200003.pdf | 2024-06-03 | 2026-11-23 | `policy-sources/2024-06-03-pt-dl-37-a-2024.pdf`（sha256 `334a3bb9095248170af42a89e24b7cfa96ac0aed054d866edeb411e5c7fd80cb`） | archived |
| SRC-487 | LAW | 葡萄牙 · Lei 39/2025 与 DL 496/1977，婚龄改革及民法成年 | https://files.diariodarepublica.pt/1s/2025/04/06400/0000300012.pdf ；https://files.diariodarepublica.pt/1s/1977/11/27301/00010050.pdf | 2025-04-01；1977-11-25 | 2026-11-23 | `policy-sources/2025-04-01-pt-lei-39-2025.pdf`（sha256 `1fa52a537f7a9546b37a1d25d668a77b05811fd86967e9176d997bafa2dba429`）；`policy-sources/1977-11-25-pt-dl-496-1977.pdf`（sha256 `1beec94d6c2893387a2b4fc6214aeff6f3d408e802e8946b364792f58b758441`） | archived |
| SRC-488 | LAW | 葡萄牙 · DL 209/2012，国籍程序费用 | https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/diplomas_legislativos/Documents/Decreto_Lei_209_2012.pdf | 2012-09-19 | 2026-11-23 | `policy-sources/2012-09-19-pt-dl-209-2012.pdf`（sha256 `5ad83eddc1434ee2daa1b41514e02ae590463c46140c667809e18fc5cb892fe7`） | archived |
| SRC-489 | LAW | 葡萄牙 · Despacho 12941/2014，旧 PaN 测试费 | https://files.diariodarepublica.pt/2s/2014/10/205000000/2681226813.pdf | 2014-10-23 | 2026-11-23 | `policy-sources/2014-10-23-pt-despacho-12941-2014.pdf`（sha256 `81f88a0eba86d95466f8458f5c3c70caf6d9af5cc4d603598e24164eed854f63`） | archived |
| SRC-490 | LAW | 葡萄牙 · Portaria 208/2017，投资低密度地区 | https://files.diariodarepublica.pt/1s/2017/07/13400/0373103734.pdf | 2017-07-13 | 2026-11-23 | `policy-sources/2017-07-13-pt-portaria-208-2017.pdf`（sha256 `198e8b1b26f3d543baca4379d8d9e0503ea8cea23ca0c2fa7c0e75890be867ce`） | archived |
| SRC-491 | LAW | 葡萄牙 · Lei 53/2023，通用拒绝与 EU Blue Card | https://files.diariodarepublica.pt/1s/2023/08/16900/0000700024.pdf | 2023-08-31 | 2026-11-23 | `policy-sources/2023-08-31-pt-lei-53-2023.pdf`（sha256 `ccecec4830450cfa9ce34909aa4a5836df78cffd2368162f18d1b47a99bc318b`） | archived |
| SRC-492 | LAW | 葡萄牙 · Lei 69/2026，总体规划 | https://files.diariodarepublica.pt/1s/2026/11/22400/0000200050.pdf | 2026-11-18 | 2026-11-23 | `policy-sources/2026-11-18-pt-lei-69-2026.pdf`（sha256 `50c387cb53ba61c4d263bafc9a9c6c0b45d79f23eb97a4c630953d42984801f9`） | archived |
| SRC-493 | LAW | 欧盟法院 · Ogieriakhi，C-244/13，第三国配偶的永久居留权 | https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:62013CJ0244 | 2014-07-10 | 2026-11-24 | `policy-sources/2014-07-10-pt-cjeu-c-244-13.pdf`（sha256 `5d818b90c74050a290d259aca87b753900b8b66a7719aacc9be8ad28adae14cd`） | archived |
| SRC-494 | GUIDANCE | 欧委会 · C/2023/1392，欧盟公民及其家属自由流动指引 | https://eur-lex.europa.eu/eli/C/2023/1392/oj/eng | 2023-12-22 | 2026-11-24 | `policy-sources/2023-12-22-pt-eu-free-movement-guidance.pdf`（sha256 `fc3c76bbfc117d29c6f8f6061d3c51a181b759b2ce7eeb366ff55cce37390430`） | archived |
| SRC-495 | LAW | 欧盟法院 · AT v Pensionsversicherungsanstalt，C-32/19，退休工作者提前取得永久权 | https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:62019CJ0032 | 2020-01-22 | 2026-11-24 | `policy-sources/2020-01-22-pt-cjeu-c-32-19.pdf`（sha256 `7522f78f46fb90b96b478e62c06984a75e48a9b2df7115dece6c49a62d5525ba`） | archived |

## 登记备注（按 SRC）

### SRC-001 CP 1707

- PDF 共 62 页（`pdfinfo`）。PDF 物理页 = 页脚印刷页码 + 4（例：Table 1 在物理 p46，页脚印 42）。p2 为空白页。
- 常用定位（物理页）：Introduction 与最低要求 p8–p9；"实施前发布技术与操作指引" p10；Ch.1 Character p11–p12；Ch.2 Contribution p14–p19（收入门槛与税档联动、收入豁免 p15，"best years" p16，家庭合并收入 p17，British connection 与 public funds p18，案例 Individual A–D p19）；Ch.3 Integration p20–p21（B2 及豁免 p21）；Ch.4 Residence p22–p24（core / high talent permission 定义在 p23 注 9、10，不计入路线清单 p24）；Ch.5 Dependants p28–p31（伴侣同时 / 后到 p29，案例 p31）；Ch.7 难民 p36–p40（Safe and Legal p37，Core Protection / Protection Work and Study 与非法入境 +10 p38（注 14 为 2026-03-02 前申请庇护者），Article 31、英语、public funds 与 asylum support 偿还 p39，案例 Individual A–D p40）；Ch.8 过渡安排 p41–p45（案例 p45）；Table 1 p46；Table 2（难民路径）p47–p48；完整影响评估 p54。

- 2026-11-15 补存 [accessible HTML](https://www.gov.uk/government/consultations/earned-settlement/outcome/a-fairer-pathway-to-settlement-government-response-to-the-consultation) 与[咨询集合页](https://www.gov.uk/government/consultations/earned-settlement)。HTML 自身 `first-published-at`／`public-updated-at` 和集合页 `Updates to this page` 均为 2026-11-12；这是补充格式的日期，政策回应仍首发于 2026-11-02。内部 `updated-at` 不作为政策版本日；不另建等权政策编号，不覆盖原 PDF。
- `policy-sources/2026-11-12-cp1707-government-response-accessible.html` → <https://www.gov.uk/government/consultations/earned-settlement/outcome/a-fairer-pathway-to-settlement-government-response-to-the-consultation>
- `policy-sources/2026-11-12-earned-settlement-consultation.html` → <https://www.gov.uk/government/consultations/earned-settlement>
- HTML 定位：`#earnings`、`#how-earnings-will-be-assessed`、`#household-income`、`#public-funds`、`#chapter-6-vulnerable-groups---how-will-vulnerable-groups-be-treated`、`#chapter-8-transitional-arrangements-and-existing-care-workers`、`#in-summary`、`#annex-b-the-economic-case-for-change-`。HTML 小节锚点与 PDF 页序分开引用；收入年数与挂钩税种的分歧仍在，不能据格式更新关闭 PD-041／042。

### SRC-002 下议院（HC Deb vol 792）

- 快照为 Hansard 官方 API（`https://hansard-api.parliament.uk/debates/debate/09F388D2-539E-4B0A-ABE2-D3195B14AF0E.json`）返回的 JSON，内容与网页版一致：hansard.parliament.uk 网页对脚本请求返回 403，网页已于 2026-11-04 在浏览器中打开并核对过下列句子。
- 陈述 15:47 开始（col 583）。**内政大臣的开场陈述本身没有给出实施时间表**；时间表出现在她回答 Home Affairs Committee 主席 Dame Karen Bradley 的提问时（col 593，contribution 锚点 `#contribution-912FA19F-4360-4FC7-A496-1DA8CA1436FE`，约 16:29）。
- 概括：已公布的改动将从 2026 年 12 月的那一批 Immigration Rules 修改开始提交（laid），并在 2027 年内陆续实施；影响评估和其他详细指引会随改动推出时提供。同一场问答中她另说影响评估将"大约在规则提交时"按常规发布（col 604）。

### SRC-003 上议院（HL Deb vol 860）

- 快照为 Hansard 官方 API（`https://hansard-api.parliament.uk/debates/debate/5D3D04DB-0971-4B22-B841-6414AAFAA8C9.json`）返回的 JSON；网页已于 2026-11-04 在浏览器中打开核对。
- 19:31 由 Lord Collins of Highbury 复述下议院陈述（cols 1415–1418）。时间表句**不在复述文本内**，而在他回答 Baroness Lister of Burtersett 的提问时（cols 1423–1424，锚点 `#contribution-0681E679-F8C2-48A1-9C1E-54A4705E8C2E`，20:04 时间戳之后）。
- 概括：实施的第一阶段——修改 Immigration Rules——12 月开始，2027 年 1 月生效；2027、2028 年还会有进一步的规则修改；实施前将发布更多技术细节和完整影响评估。
- 与 SRC-002 的关系：两院说法相容但精度不同（下议院"12 月开始提交、2027 年内实施"；上议院"12 月开始、2027-01 生效，后续 2027–2028 继续"）。生效日以届时提交的 Statement of Changes 为准，在它出现前引擎应把具体生效日视为 `UNKNOWN`。

### SRC-004 Appendix Skilled Worker

- 版本：gov.uk 变更记录最近一条 2026-10-08 "Changes made with reference to Statement of Changes HC 584"；此前 2026-08-03（HC 259）、2026-04-08（HC 1691）。页面头部 "Updated: 29 October 2026" 是整个 Immigration Rules 手册的更新日（当日改的是 Appendix T2 Minister of Religion 等，HC 584），不是本 Appendix。
- **£41,700 一般门槛 + going rate（入境 / 续签）**：SW 4.2 的积分表 Option A——薪资须同时不低于 £41,700/年和该 SOC 2020 代码的 going rate；going rate 取值规则见 SW 8.1（Option A 用 Appendix Skilled Occupations Table 1 或 1a）。其他选项（B–K）对应 PhD、Immigration Salary List、新入职、过渡群体等较低数字（£37,500 / £33,400 / £31,300 / £28,200 / £25,000，配合 going rate 的 70%、80%、90% 或 100%），由 SW 4.2(a)–(d) 限定适用。薪资计算方式见 SW 14.1–SW 14.5。
- **settlement**：SW 21.1（连续 5 年）、SW 21.2（可计入路线）、SW 22.1（Appendix Continuous Residence）、SW 22A.1–22A.2（2027-03-26 起 B2，HC 1691 插入）、SW 23.1（Appendix KOL UK）、SW 24.3 表 row A（£41,700 + Table 1/1a going rate；rows B–E 为 £33,400 / £31,300 / £25,000 等例外）、SW 24.4（薪资计算与缺勤）。
- **dependent partner / child settlement**：SW 38.1–SW 38.2（suitability）；SW 39.1（P 同时作为 Skilled Worker 获批定居，或已定居 / 入籍且当时持 Skilled Worker 许可）、SW 39.2–SW 39.4（最近一次许可为 P 的 dependant、Appendix Relationship with Partner、子女的关系要求在 Appendix Children）；SW 40.1、SW 41.1–SW 41.2 已 DELETED，子女的照护与年龄 / 独立生活要求改由 SW 41A.1 引用 Appendix Children；SW 42.1（伴侣连续 5 年持 P 的 dependent partner 许可，无薪资要求）；SW 43.1（Appendix Continuous Residence）；SW 44.1（2027-03-26 前 B1、此后 B2，除非豁免）、SW 44.2；SW 45.1（18 岁及以上须 Appendix KOL UK）；SW 46.1–SW 46.2（决定与 Administrative Review）。
- 入境英语积分 SW 4.1 / SW 7.1：现行为 B2（最近一次 Skilled Worker 许可按 B1 授予者可继续用 B1）。

### SRC-005 Appendix Long Residence

- 版本：2026-10-08（HC 584）；此前 2026-08-03（HC 259）、2026-03-26（HC 1691）。
- 现行规则下 Student / Graduate 时间可计入 10 年：LR 11.1(a) 只排除 Appendix Ukraine Scheme、Visitor、Short-term Student (English language)、Seasonal Worker 的许可（permission to stay 阶段同理见 LR 3.1）。不计入的期间见 LR 11.2。
- LR 13.1：2027-03-26 之前申请为 B1，之后为 B2（HC 1691 APP LR1）。

### SRC-006 Public funds

- 版本：gov.uk `public_updated_at` 2025-04-09（该 HTML publication 无变更记录列表）。页面无段落编号，按小节锚点引用：
  - `#benefits-open-to-new-claims`：属于 immigration public funds 的福利（含 Universal Credit、State Pension Credit、Personal Independence Payment、Carer's Allowance、Housing Benefit 等）。
  - `#contributory-benefits-and-statutory-payments`：**不**属于 public funds 的缴费型福利和法定支付（New Style JSA、New Style ESA、Maternity Allowance、Statutory Sick Pay、Statutory Maternity Pay 等法定育儿支付）。
- Earned Settlement 的"specified public funds"范围尚未确定：SRC-001 p18 说先沿用此定义，纳入范围与豁免在实施前另行公布。

### SRC-007 HC 1691

- 结论：**属实**。二手来源的说法与原文一致，但需要两点精确化：(1) 相关条款本身 2026-03-26 已写入 Rules，只是条文按"申请日是否在 2027-03-26 及以后"区分 B1 / B2，所以对引擎而言生效日是 **申请日 ≥ 2027-03-26**；(2) 适用于多条路线，不只 Skilled Worker。
- 正文 PDF 48 页，物理页 = 页脚印刷页 + 4。Implementation 一节在物理 p6–p8：APP SW5、APP LR1、APP EL1、APP KOLL2–7、APP ROB1–2、APP UKA1–2、APP GT6–7、APP SCU1–2、APP INNF1、APP ISP1–2、APP CRP1、APP BP1、APP PL1–2、APP SF1–2 等列在"2026-03-26 生效，此前提交的申请按 2026-03-25 的 Rules 审理"一组（p7）。
- Skilled Worker：物理 p24（印刷页 20）APP SW5 在 SW 22.1 后插入 SW 22A.1（申请日 ≥ 2027-03-26 须口语和听力达到 CEFR B2，除非豁免）与 SW 22A.2。现行 Appendix Skilled Worker 快照（SRC-004）中已有该条文，核对一致。
- Explanatory Memorandum（22 页，物理页 = 印刷页）：5.60 列出受影响路线（Appendix KoLL、Skilled Worker、T2 Minister of Religion、Representative of an Overseas Business、UK Ancestry、Global Talent、Scale Up、Innovator Founder、International Sportsperson、Child Relative (Sponsors with Protection)、Long Residence、Bereaved Partner、Private Life、Settlement Family Life）；5.61 说明这是落实 2025-05 White Paper（SRC-012）的承诺；5.62 说明改动 2027-03-26 生效、适用于已在 settlement 路径上的人、推迟一年是为了给申请人准备时间（物理 p13–p14）。
- gov.uk 出版页 URL 的 slug 写成 "hc-1619"，是 gov.uk 的笔误，页面标题与 PDF 均为 HC 1691。

### SRC-008 Appendix Continuous Residence

- 版本：2025-11-11（HC 1333）；此前 2025-07-29（HC 836）。
- 计算起点 CR 1.1；不算合法在场的期间 CR 2.1；任意 12 个月不超过 180 天 CR 3.1（2018-01-11 前许可的旧口径 CR 3.2，Long Residence 专用口径 CR 3.3，可豁免的缺席原因 CR 3.4）；连续居住中断 CR 4.1–4.4；随行家属缺席 CR 5.1。

### SRC-009 / SRC-016 IAA

- SRC-009 是 gov.uk HTML publication（首发 2026-07-14，最近更新 2026-10-05）。§1.1 引用 Immigration and Asylum Act 1999 的定义：immigration advice 是就相关移民事项向个人提供、且提供者知道与该个人相关的意见；immigration services 是代表个人向法院 / 审裁庭或政府部门作陈述。§1.1 还说明这些活动在"in the course of business"中进行即受监管，不论是否营利，包括偶尔的帮助。§1.3：依该法 s.84(2)，非 qualified person 提供 immigration advice / services 属犯罪。
- SRC-016（IAA 机构介绍页，2025-01-16）：IAA 调查投诉、对非法提供移民意见者调查并起诉。
- 对产品的含义（不属本任务，只记录）：针对具体个人情况给出移民结论可能落入受监管的 immigration advice，产品文案与免责声明需要法律评估。

### SRC-010 / SRC-011 监控类参考

- SRC-010 首页小节 `#what-you-can-do-with-this-api` 说明如何引用 GOV.UK 内容并保持更新。`#what-you-can-39-t-do-with-this-api` 说明覆盖范围限于 www.gov.uk 页面，附件和图片无法直接获取，搜索等动态生成内容不可用。
- SRC-010 的旧首页 `#quick-start` 和 `#authentication` 改见 [Get started](https://content-api.publishing.service.gov.uk/get-started.html) 和该页的 `#authentication`，使用 API 仍无需认证。旧首页 `#rate-limiting` 改见 [API reference 的 Rate limiting](https://content-api.publishing.service.gov.uk/reference.html#rate-limiting)，每客户端仍最多 10 请求/秒。旧首页 `#beta-software` 已移除。
- SRC-010 的字段 `content_id`、`public_updated_at`、`first_published_at` 仍见 [API reference 的 ContentItem](https://content-api.publishing.service.gov.uk/reference.html#schema-contentitem)。Appendix 响应中的 `details.change_history` 按实际 JSON 核对，样例见 SRC-034、SRC-035。
- SRC-010 旧版（抓取日 2026-11-04）保留 `policy-sources/2026-11-04-govuk-content-api-docs.html` 和 `policy-sources/2026-11-04-govuk-content-api-reference.html`。新页面未注明发布日期，快照以抓取日 2026-11-19 命名。
- 本任务实际用 Content API（`https://www.gov.uk/api/content/<path>`）读取了各 Appendix 的 `public_updated_at` 与 `change_history`，可作为第二阶段变更检测的可行性证据。
- SRC-011：`/new` 页面是动态的，快照只证明 2026-11-04 时的说明文字；feed 本身未入库（内容每天变）。

### SRC-012 / SRC-013 政策文件

- SRC-012 White Paper PDF（web-optimised 版）80 页，物理页 = 页脚印刷页 + 3。¶257（物理 p71）：settlement 英语要求在多数路线从 B1 升至 B2；¶264（物理 p72）：settlement 标准合格期升至 10 年；¶265：British citizen 的非英籍家属保留 5 年；¶266–267：将就缩短合格期的积分方案另行咨询（即 SRC-013）。gov.uk 出版页另有 print-ready PDF（82 页）、可访问 HTML 版和 2026-01-20 追加的威尔士语版，未入库。
- SRC-013 咨询文件 PDF 60 页，物理页 = 页脚印刷页 + 4。物理 p10：咨询的选项包括基准合格期 10 年、Skilled Worker 中 RQF 6 以下岗位 15 年等；物理 p8：对经 Health and Care 签证入境的低技能、低薪群体另设 15 年基准的方案。gov.uk 咨询页的 `closing_date` 为 2026-02-13，2026-11-02 在同一页面追加了政府回应（SRC-001）。

### SRC-014 / SRC-015

- Appendix English Language 版本 2026-03-26（HC 1691），settlement 英语豁免 EL 1.1（65 岁及以上、未满 18、残障；EL 1.1(d)(iii)/(iv) 以 2027-03-26 为界）。
- Appendix KOL UK 版本 2025-04-09（HC 733），豁免 KOL 1.1，满足方式 KOL 2.1。注意 HC 1691 修改的 "Appendix KoLL" 是另一个 Appendix（Knowledge of Language and Life），不是 KOL UK。

## 二手来源（仅交叉验证，2026-11-04 用于核对 SRC-001 要点与时间表）

| 标题 | URL |
|---|---|
| Mishcon de Reya: UK earned settlement reforms | https://www.mishcon.com/news/uk-earned-settlement-reforms |
| Lewis Silkin: Home Office sets out revised earned settlement framework | https://www.lewissilkin.com/insights/2026/11/03/home-office-sets-out-revised-earned-settlement-framework-102o7co |
| Fox Williams: Earned Settlement — what the new ILR rules mean | https://www.foxwilliams.com/2026/11/03/earned-settlement-what-the-home-secretarys-new-ilr-rules-mean-for-workers-and-families/ |
| EIN: Earned settlement — policy announced, law not yet changed | https://www.ein.org.uk/blog/earned-settlement-government-has-announced-its-policy-law-has-not-yet-changed |
| Paragon Law: A Fairer Pathway to Settlement explained | https://www.paragonlaw.co.uk/resources/earned-settlement-uk-fairer-pathway-to-ilr |
| DavidsonMorris: Skilled Worker minimum salary 2026 | https://www.davidsonmorris.com/skilled-worker-visa-minimum-salary |

## 二手来源（仅交叉验证，2026-11-19 用于核对学生、毕业生路线）

UKCISA 是英国国际学生事务委员会。下列页面抓取于 2026-11-19，核对结果见 [docs/research/2026-11-19-ukcisa-crosscheck.md](research/2026-11-19-ukcisa-crosscheck.md)。页面内各段更新日期不一，数字一律以一级来源为准。

| 标题 | URL |
|---|---|
| UKCISA: Graduate route | https://www.ukcisa.org.uk/student-advice/working/graduate-route/ |
| UKCISA: Skilled Worker route | https://www.ukcisa.org.uk/student-advice/working/skilled-worker-route/ |
| UKCISA: Working after studies | https://www.ukcisa.org.uk/student-advice/working/working-after-studies/ |
| UKCISA: Student work | https://www.ukcisa.org.uk/student-advice/working/student-work/ |
| UKCISA: Student route eligibility and requirements | https://www.ukcisa.org.uk/student-advice/visas-and-immigration/student-route-eligibility-and-requirements/ |
| UKCISA: Student route applying in the UK | https://www.ukcisa.org.uk/student-advice/visas-and-immigration/student-route-applying-in-the-uk/ |
| UKCISA: Student route bringing your family | https://www.ukcisa.org.uk/student-advice/visas-and-immigration/student-route-bringing-your-family/ |
| UKCISA: Student immigration the basics | https://www.ukcisa.org.uk/student-advice/visas-and-immigration/student-immigration-the-basics/ |

## 研究报告引用标记 → 来源映射（任务 0.3 已逐条核对，2026-11-04）

报告 `docs/research/2026-11-03-deep-research-report.md` 的 57 处引用共用 30 个研究工具内部 ID，报告里没有给出任何 URL，工具当时实际打开的页面已无法还原。因此本表的方法是：**逐条找出引用该 ID 的句子，把句子里的论点与本表登记的快照原文核对，填入能支撑该论点的确定位置**。"报告行"指该文件的行号。SRC-001 的 `p<N>` 是 PDF 物理页（见上方定位约定）。

| 报告引用 ID | 报告行 | 被引用的论点（概括） | 确定来源与位置 | 核对说明 |
|---|---|---|---|---|
| turn380943view0 | 7, 17, 584, 614 | 2026-11-02 发布政府回应；默认 10 年、3/5/10/20 年路径；实施前另发技术指引与完整影响评估 | SRC-001 p1、p3（2026-11 / CP 1707）；p8–p9（最低要求、10 年起点、四原则）；p10（实施前发布技术与操作指引）；p46 Table 1；p54（完整影响评估随实施准备） | 一致。发布日 2026-11-02 另见 gov.uk 咨询页变更记录（SRC-013 页面） |
| turn218854search0 | 7 | 下议院同日陈述：首批修改 2026-12 起提交、2027 年内实施 | SRC-002 HC Deb vol 792 col 593，`#contribution-912FA19F-4360-4FC7-A496-1DA8CA1436FE` | 内容一致；但出处是内政大臣回答 Home Affairs Committee 主席的问答，不在开场陈述中 |
| turn218854search1 | 7 | 上议院陈述：首批规则预计 2027-01 生效，2027–2028 继续修改 | SRC-003 HL Deb vol 860 cols 1423–1424，`#contribution-0681E679-F8C2-48A1-9C1E-54A4705E8C2E` | 内容一致；出处是 Lord Collins 回答 Baroness Lister，不在复述的陈述文本中 |
| turn377160view0 | 19, 95, 132, 535 | Long Residence 关闭；临时路线时间不再计入；core / high talent 路线归类；以个人时间线建模 | SRC-001 p23（Long Residence 关闭、可计入路线、注 9 core permission、注 10 high talent permission）、p24（不计入路线清单） | 一致 |
| turn377160view1 | 61, 76, 126, 227, 516, 531, 614 | "best years" 是为照顾产假、照护、疾病；收入要求豁免；门槛随税档变化；settlement 收入判断与签证薪资判断不同 | SRC-001 p15（门槛与所得税档联动、儿童 / 65 岁及以上 / 身心状况豁免、收入波动的理由）、p16（best years 三种计法） | 一致 |
| turn377160view2 | 126 | B2 英语一般规则也有年龄、健康豁免 | SRC-001 p21 | 一致（儿童、65 岁及以上、身心状况） |
| turn377160view3 | 95 | 路线归类（core permission、high talent、排除路线） | SRC-001 p23 注 9、注 10；p24 | 一致 |
| turn444181view0 | 31, 128 | 四个维度与不可被收入抵消的最低要求；成年人在英犯罪记录即拒绝，含判刑、罚款、社区刑、部分庭外处置；海外定罪 | SRC-001 p8–p9（最低要求、四原则）；p11–p12（Ch.1 Character，"no criminality" 在 p12） | 一致 |
| turn991133view0 | 42 | 3/5/10/20 年路径的收入数字与"best years"（"总结表和正文"） | SRC-001 p46 Table 1；p15–p16 | 一致。注意 p15 写 £12,571 "至少三年"，p16 与 Table 1 写"7 年中 5 年"，原文自相矛盾，已在分析文档 §3.2 记录 |
| turn991133view1 | 42 | 同上 | SRC-001 p15–p16；p46 Table 1 | 同上 |
| turn868569view0 | 42 | 门槛与税档挂钩，应作动态参数 | SRC-001 p15 | 一致 |
| turn868569view2 | 19 | Long Residence 关闭，Student / Graduate 不再自动累积 | SRC-001 p23–p24 | 一致 |
| turn648176search3 | 65, 76, 531, 584 | Skilled Worker 现行一般门槛 £41,700 且须达 going rate，部分类别数字不同；签证与 settlement 用不同薪资判断；Immigration Rules 2026-10-29 有更新 | SRC-004 SW 4.2 Option A 与 SW 8.1（£41,700 + going rate），SW 4.2 Options B–K（其他数字）；页面头部 "Updated: 29 October 2026" | 门槛与段落一致。2026-10-29 是整个 Rules 手册的更新日；Appendix Skilled Worker 本身最近一次修改是 2026-10-08（HC 584） |
| turn673303search15 | 65 | 现行 Skilled Worker 是 settlement 路线，通常要求 5 年连续合资格居留 | SRC-004 SW 21.1–SW 21.2（settlement 薪资 SW 24.3） | 一致 |
| turn673303search0 | 95 | 路线归类"来自现行各 Appendix" | 无法确认 | 原指向可能是 Scale-up / Global Talent / Innovator Founder 等 Appendix，这些不属 MVP-0，未登记快照，无法核对其中段落。该句论点本身由 SRC-001 p23 注 9–10、p24 支撑 |
| turn673303search1 | 95 | 同上 | 无法确认 | 同上 |
| turn673303search3 | 95 | 同上 | 无法确认 | 同上 |
| turn673303search2 | 535 | 现行 Long Residence 下多数合法 Student / Graduate 时间可计入 10 年 | SRC-005 LR 11.1(a)（settlement；permission to stay 阶段为 LR 3.1）；SRC-001 p23 对现行规则的描述 | 一致：LR 11.1(a) 只排除 Ukraine Scheme、Visitor、Short-term Student (English language)、Seasonal Worker |
| turn648176search4 | 99, 549 | 属于 / 不属于 immigration public funds 的福利清单 | SRC-006 `#benefits-open-to-new-claims`、`#contributory-benefits-and-statutory-payments` | 一致（原文为 State Pension Credit） |
| turn648176search5 | 99 | 同上 | SRC-006 同上两个小节 | 一致 |
| turn991133view2 | 120, 516, 549 | 3/5/10 年路径要求申请前 5 年未用 specified public funds，否则 20 年；纳入范围与豁免实施前另定 | SRC-001 p18（另见 p46 Table 1） | 一致 |
| turn997970view3 | 120, 516 | 同上（实施前进一步规定） | SRC-001 p18 | 一致。旧版映射写成 Ch.8 / p40–44，有误 |
| turn997970view0 | 124, 466 | 家庭合并收入 £25,142，只能一方依赖另一方；官方示例中的合并收入家庭 | SRC-001 p17；p19 Individual C | 一致 |
| turn997970view2 | 124, 132, 466, 614 | 伴侣同时入境可同时 settlement，后到者须自己完成合格期；官方示例中的后到伴侣 | SRC-001 p29；p31（Dependants: In Practice，Individual A、B） | 一致 |
| turn991133view4 | 466 | 官方示例：social worker、British citizen 配偶、公共资金使用者、care worker 过渡案例 | SRC-001 p19（Contribution: In Practice，Individual A–D）；p45（Transitional Arrangements: In Practice，Individual A–C） | 一致 |
| turn218854search7 | 363, 608 | Content API 无需认证、返回 JSON、有 `public_updated_at` / `content_id`、可用于保持同步；只覆盖 www.gov.uk、不含附件和搜索结果；beta；10 req/s | SRC-010 首页 `#what-you-can-do-with-this-api`、`#what-you-can-39-t-do-with-this-api`、`#beta-software`、`#authentication`、`#rate-limiting`；reference.html content item schema | 一致 |
| turn218854search9 | 363 | 同上 | SRC-010 同上 | 一致 |
| turn218854search10 | 377, 608 | legislation.gov.uk 提供新立法 Atom feeds，目标与出版同步 | SRC-011 `/new` 页（"simultaneously, or at least within 24 hours"；Legislation feeds） | 一致 |
| turn648176search6 | 409 | immigration advice 指针对具体个人的意见；在经营过程中提供即受监管，不论是否营利 | SRC-009 §1.1、§1.3 | 论点一致。报告把原文 "in the course of business" 误译为"在 business course 中" |
| turn648176search7 | 409 | IAA 有调查、执法、起诉权 | SRC-016（About us） | 一致 |

## SRC-017 常用定位

- 版本：该 Appendix 的 [GOV.UK Content API 变更记录](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-skilled-occupations) 最近一条为 2025-11-11，说明为 “Updated to reflect Statement of Changes HC 1333”；此前为 2025-07-22（HC 997）。快照的 `govuk:public-updated-at` 同为 `2025-11-11T12:41:03+00:00`。页面头部 “Updated: 29 October 2026” 是整本手册的更新日，不作为此 Appendix 版本日。
- 各表锚点均从 `#table-<编号>-` 开始；数据行按表编号 + SOC 2020 代码定位，不使用 Equivalent SOC 2010 列。
- **Table 1**：基于 ASHE 中位数的 eligible SOC 2020 职业与 going rate；**Table 1a**：2025-07-22 前按旧规则获批、此后持续持有 Skilled Worker 许可者的附加职业（适用例外见该表引言）。两表取 `Going rate (SW – options A and D)` 列。
- **Table 2**：基于 ASHE 第 25 百分位的职业与 going rate；**Table 2aa**：2025-07-22 前获批者的附加职业（资格限制见引言）。两表取 `Going rate (SW – options F and I, GBM and SCU)` 列。
- **Table 2a**：2024-04-04 前获批的 Skilled Worker 附加职业，限制见该表引言；取 `Going rate (SW – option F)` 列。**Table 2b**：2024-04-04 前获批的 Global Business Mobility 附加职业，限制见该表引言；取 `Going rate (GBM – minimum rate)` 列。这些数据不表示所有职业都能用于 Skilled Worker。
- **Tables 1 / 1a / 2 / 2aa / 2a / 2b**：金额均为英镑年薪，基于每周 37.5 小时；首个金额为年薪，括号内是时薪。提取完整 going rate，不提取 70% / 80% / 90% 折扣列；Table 1 / 2 引言明确 settlement 仅适用完整 going rate 列。职业名称不包含同单元格内的后续 eligibility / Note 说明，限制仍以原表为准。
- **Table 3**：按国家薪级确定 going rate 的医疗 / 教育职业；本次仅提取 SOC 2020 代码与职业名。`Going rate (annual)` 中既有医生、牙医等按地区 / 职级列出的金额，也有指向 Table 4 / 5 的行，不能一律当作单一年薪。**Table 3a** 是国家薪级职业的附加清单（含 2025-07-22 前获批者及其他例外），本次未提取。
- **Table 4**：医疗职业按地区与 band 的国家薪级明细；**Table 5**：教育职业按地区与角色的国家薪级明细。本次不解析两表金额。
- **Table 6**：不合资格职业清单；附加清单职业的例外仍须查看各表引言。本次不提取 Table 6。
- **Table 3 行数口径**：保留原表全部 39 行与地区名称；其中 2211、2253、2312 各按 England / Scotland / Wales / Northern Ireland 列四行，因此共有 30 个唯一 SOC。该表按「SOC + 职业名」唯一；六张金额表则各自按 SOC 唯一，不能为满足去重而丢掉国家薪级职业的地区行。

## SRC-018 常用定位

- 版本：[GOV.UK Content API 变更记录](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-children) 最近一条为 2025-11-11，说明为 “Changes made with reference to Statement of Changes HC 1333”；此前为 2025-04-09（HC 733）。快照的 `govuk:public-updated-at` 同为 `2025-11-11T08:10:22+00:00`。页面头部 “Updated: 29 October 2026” 是整本手册的更新日。
- 适用范围：“Applicant applying as a dependent child” 一节列出的路线包含 Appendix Skilled Worker。
- **Age requirement**：CHI 1.1（申请日未满 18 岁，除非 CHI 1.2）；CHI 1.2（18 岁及以上也可，若最近一次获批的是父 / 母的 dependent child 许可，且 (a) 申请日仍有效或过期不超过 14 天，或 (b) Bereaved Partner / Victim of Domestic Abuse）。
- **Independent life requirement**：CHI 1A.1（不得 leading an independent life；本 Appendix 未给定义）。
- **Care requirement**：CHI 2.1（未满 18 岁时须有符合英国法律的照护与住宿安排）。
- **Relationship requirement: settlement**：CHI 4.1（P 同时获批同一路线定居，或已定居 / 入籍且此前持同一路线许可）；CHI 4.2（最近一次许可为 P 的 dependent child，或在英出生等）；CHI 4.3（另一位家长须同时获批、已定居或为英国公民，除非 P 是唯一在世家长或负唯一抚养责任，或有严重而紧迫的理由）。
- SW 41A.1 只引用其中的 care requirement 与 age and independent life requirement；关系要求经 SW 39.4 引用。

## SRC-019 常用定位

- 版本：[GOV.UK Content API 变更记录](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-immigration-salary-list) 最近一条为 2025-11-11，说明为 “Updated to reflect Statement of Changes HC 1333”；此前为 2025-07-22（HC 997）。`public_updated_at` 与快照的 `govuk:public-updated-at` 同为 `2025-11-11T12:42:52+00:00`。页面头部 “Updated: 29 October 2026” 是整本手册的更新日。
- **段落定位**：该页没有 `ISL 1.1` 等编号；引用未编号的表前引言（以 “An occupation is only included on the list” 开始）及唯一职业表的 SOC 2020 行，不虚构 ISL 段落号。引言规定须使用 removal date 之前由 sponsor 向申请人签发的 certificate of sponsorship。
- **表格列**：`SOC 2020 occupation code and any further criteria` 同单元格包含四位代码、职业名及 “–” 后的 further criteria；`Included on the Immigration Salary List in:` 实际跨 England / Scotland / Wales / Northern Ireland 四个国家列，单元格原文为 `Yes` 或 `-`；末列为 `Removal date`。本任务数据中的 `nations` 按原表顺序组合值为 `Yes` 的国家名；`criteria` 保留原文措辞（包括 “all jobs”、Note 与后续段落），仅归一化 HTML 换行与空白，不解释条件。
- **行数口径**：唯一表格的 `<tbody>` 共 26 行，其中第 1 行是国家子表头，实际为 25 条职业。按原顺序保留职业行，不按 SOC 去重。1212、2111、5235 仅 Scotland，其余行列四国；removal date 原文为 `31 December 2026`，6135 / 6136 为 `22 July 2028`。这些日期与国家范围均见对应 SOC 行。
- **SRC-017 Table 3a 补充（任务 3.1）**：上文任务 2.6 的“本次未提取”是历史范围；现已从 SRC-017 同一快照脚本提取 8 行国家薪级职业的 SOC 2020 代码与职业名，保留原 `sources` / `occupations` 结构；不提取薪级金额。Table 3a 引言标为 RQF 3–5，适用限制仍以原表引言为准。

## SRC-020 常用定位

- 版本：[GOV.UK Content API 变更记录](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-hong-kong-british-national-overseas) 最近一条为 2026-10-08（Statement of Changes HC 584），与[手册变更记录](https://www.gov.uk/guidance/immigration-rules/updates) 中该 Appendix 的最近一条一致；`public_updated_at` 与快照的 `govuk:public-updated-at` 同为 `2026-10-08T07:31:23+01:00`，不取手册头部的 2026-10-29。
- **最近一次许可**：HK 55.2(d)（持有或最近持有 Hong Kong BN(O) route 许可）；HK 62.1(a)（最近一次获批许可须为 Hong Kong BN(O) route）。
- **Suitability**：HK 56.1–HK 56.2（Part Suitability、移民法违规与 immigration bail 及其例外）。
- **合格期 / 家庭成员**：HK 62.1(b)（Hong Kong BN(O) route 的 settlement 共用连续 5 年可定居路线许可要求，申请日未满 18 岁除外）；未编号引言区分 BN(O) Status Holder 与 BN(O) Adult Child，BN(O) Household Child 的关系及 household 定义见 HK 15.1–HK 15.3，未另列家庭成员的不同 settlement 合格期。
- **连续居留**：HK 63.1（HK 62.1 的期间须符合 Appendix Continuous Residence）。
- **英语**：HK 60.1（除非豁免，口语与听力至少 CEFR B1）；HK 60.2（引用 Appendix English Language）；本 Appendix 快照未列 2027-03-26 起改 B2 的条款。
- **KOL**：HK 61.1（申请日已满 18 岁且未满 65 岁须符合 Appendix KOL UK）。

## SRC-021 常用定位

- 版本：[GOV.UK Content API 变更记录](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-global-talent) 最近一条为 2026-08-03（Statement of Changes HC 259），与[手册变更记录](https://www.gov.uk/guidance/immigration-rules/updates) 中该 Appendix 的最近一条一致；`public_updated_at` 与快照的 `govuk:public-updated-at` 同为 `2026-08-03T09:59:24+01:00`，不取手册头部的 2026-10-29。
- **最近一次许可 / Suitability**：GT 8.3（持有或最近获批 Global Talent route 许可）；GT 9.1–GT 9.2（Part Suitability、移民法违规与 immigration bail 及其例外）。
- **3 年合格期**：GT 11.1(a)（Royal Society、British Academy、Royal Academy of Engineering 或 UKRI 背书）；GT 11.1(b)（Arts Council England 或 Tech Nation 的 exceptional talent 背书）；GT 11.1(c)（首次申请使用 Appendix Global Talent: Prestigious Prizes 所列奖项）。
- **5 年合格期**：GT 11.2（Arts Council England 或 Tech Nation 的 exceptional promise 背书）。
- **可计入路线 / 连续居留**：GT 11.3(a)–(h)（列明可组合计入的非 dependant 许可路线）；GT 12.1（引用 Appendix Continuous Residence）。
- **背书 / 收入**：GT 10.1（首次申请使用的背书不得被撤回）；GT 10.2(a)–(b)（最近一次许可期间在英国取得与奖项或背书领域相关的收入）。
- **英语**：GT 13.1(a)–(b)（除非豁免，申请日早于 2027-03-26 为口语与听力至少 CEFR B1，自该日起为 B2）；GT 13.2（引用 Appendix English Language）。
- **KOL**：GT 14.1（引用 Appendix KOL UK）。

## SRC-022 常用定位

- 版本：[GOV.UK Content API 变更记录](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-settlement-family-life) 最近一条为 2026-08-03（Statement of Changes HC 259），与[手册变更记录](https://www.gov.uk/guidance/immigration-rules/updates) 中该 Appendix 的最近一条一致；`public_updated_at` 与快照的 `govuk:public-updated-at` 同为 `2026-08-03T11:06:52+01:00`，不取手册头部的 2026-10-29。
- **最近一次许可**：SETF 1.3（持有或最近获批 Appendix FM 的 partner / parent 许可）。
- **Suitability**：SETF 2.1–SETF 2.7（Part Suitability、特定事由后的居留要求、移民法违规与 immigration bail）。
- **10 年合格期**：SETF 3.1(a)–(e)（连续 10 年及可组合计入的 family / private life 许可）；SETF 3.2(a)–(b)（补计其他可定居路线期间的条件，包括至少 1 年 Appendix FM 的 partner / parent 许可）。
- **5 年 / 10 年路线与财务定位边界**：未编号引言及 SETF 3.1–SETF 3.2 仅列本 Appendix 的 10 年路线；SETF 2.3–SETF 2.4 所列 5 年为 suitability 事由后的期间，本快照没有独立 5 年 settlement 路线或 financial requirement 段，不能据此定位另一条路线或财务门槛。
- **连续居留**：SETF 4.1（合格期须符合 Appendix Continuous Residence）。
- **英语**：SETF 5.1(a)–(b)（除非豁免，申请日早于 2027-03-26 为口语与听力至少 CEFR B1，自该日起为 B2）；SETF 5.2（引用 Appendix English Language）；dependent child 对应 SETF 15.1–SETF 15.2。
- **KOL**：SETF 6.1（除非豁免，引用 Appendix KOL UK）；dependent child 对应 SETF 16.1。
- **Partner 关系**：SETF 7.1(a)–(c)（伴侣为在英 British citizen、已定居者或同时申请 settlement 者）；SETF 7.2（Appendix Relationship with Partner）；SETF 7.3（以与当前伴侣的关系获批许可至少 1 年）。

## SRC-023 常用定位

- 版本：[GOV.UK Content API 变更记录](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-settlement-protection) 最近一条为 2026-04-08（Statement of Changes HC 1691），与[手册变更记录](https://www.gov.uk/guidance/immigration-rules/updates) 中该 Appendix 的最近一条一致；`public_updated_at` 与快照的 `govuk:public-updated-at` 同为 `2026-04-08T08:02:26+01:00`，不取手册头部的 2026-10-29。
- **最近一次保护许可**：STP 1.3(a)–(b)（按 asylum application 日期列明持有或最近获批的 refugee / humanitarian protection 许可类别）。
- **Suitability**：STP 2.1(a)–(g)（本 Appendix 自列的 criminality、conduct 与 public good 拒绝事由）。
- **合格期 / 连续期间**：STP 3.1(a)–(b)（在英国连续至少 5 年持 refugee status 或 humanitarian protection）；本 Appendix 未引用 Appendix Continuous Residence。
- **持续保护身份**：STP 4.1（保护身份未被撤销或放弃）；STP 4.2（safe return review 及其指向的撤销 / 不续期条款）。
- **保护许可与 settlement 的衔接**：STP 5.1（满足 suitability 与 eligibility 则授予 settlement）；STP 5.2（未满足 settlement 但仍有权享有保护身份时，继续给予至少 30 个月许可）；本 Appendix 未列首次保护许可的授予年限。
- **英语 / KOL**：本 Appendix 快照未列英语等级、Appendix English Language、Appendix KOL UK 或 2027-03-26 起 B2 的条款，无相应段号可登记。
- **Partner / child settlement — validity**：STP 6.1–STP 6.4（申请表、身份 / 生物信息、境内申请、最近许可及英国出生子女例外、无效申请）。
- **Partner / child settlement — suitability**：STP 7.1(a)–(g)（本 Appendix 自列的 criminality、conduct 与 public good 拒绝事由）。
- **Partner 关系**：STP 8.1(a)–(b)（P 同时在 protection route 获批 settlement，或 P 已在该路线定居且申请人在 P 定居时持其 partner 许可）；STP 8.2（Appendix Relationship with Partner）；STP 8.3 已 DELETED。
- **Child 要求**：STP 8A.1(a)–(c)（引用 Appendix Children 的年龄、照护及 settlement 关系要求）；STP 9.1–STP 9.2、STP 10.1 已 DELETED。
- **Partner / child 合格期 / 英语 / KOL**：快照的 partner / child settlement 部分 STP 6.1–STP 11.3 未列合格期、英语或 KOL 段。
- **Partner / child decision**：STP 11.1–STP 11.3（授予 settlement、仍符合 partner / child 许可资格时给予至少 30 个月 permission to stay，或拒绝申请）。

## SRC-024 常用定位

- 版本：[GOV.UK Content API 变更记录](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-fm-family-members) 最近一条为 2026-10-08（Statement of Changes HC 584），与[手册变更记录](https://www.gov.uk/guidance/immigration-rules/updates) 中该 Appendix 的最近一条一致；`public_updated_at` 与快照的 `govuk:public-updated-at` 同为 `2026-10-08T07:53:21+01:00`，不取手册头部的 2026-10-29。
- **来源地址**：任务单的 `/immigration-rules-appendix-family-members` 返回 HTTP 404，本表采用官方手册链接中的 `/immigration-rules-appendix-fm-family-members`。
- **Settlement 入口 / suitability**：R-ILRP.1.1(a)–(c)、(e)（双方在英国、有效申请、通过 S-ILR 并满足 E-ILRP，(d) 已 deleted）；S-ILR.1.1（不得因 Part Suitability 被拒）。
- **最近一次许可**：E-ILRP.1.2（申请人须在英国持有效 Appendix FM partner 许可，并列 overstayer 例外）。
- **5 年合格期 / 可计入许可**：E-ILRP.1.1、E-ILRP.1.3(1)(a)–(c)、(2)（连续至少 5 年 / 60 个月，计入 D-ECP.1.1 的 partner 入境许可、D-LTRP.1.1 的 partner 居留许可或其组合，排除 fiancé(e) / proposed civil partner 期间）。
- **关系要求**：E-ILRP.1.3(1A) 引用 E-LTRP 并排除 E-LTRP.1.2(c)–(f)，故伴侣身份按 E-LTRP.1.2(a)–(b) 为 British Citizen / settled；E-LTRP.1.7–E-LTRP.1.10（真实持续关系、有效婚姻 / civil partnership、此前关系结束、永久共同生活及同居证据）。
- **期间计算**：E-ILRP.1.4（只计同一伴侣的期间）；E-ILRP.1.5（Appendix FM-SE paragraph 26A 证据对应期间的境内要求例外）；E-ILRP.1.5A（特定 overstaying 期间可忽略）。
- **财务引用与储蓄倍数**：E-ILRP.1.3(1A)（须满足 Section E-LTRP，适用 E-LTRP.3.1(b)(ii) / E-LTRP.3.7(b)(ii) 时去掉 “2.5 times”）。
- **一般收入 / 储蓄**：E-LTRP.3.1(a)–(c)（指定年毛收入至少 £29,000，储蓄项列 £16,000 及收入缺口，或满足 E-LTRP.3.3）；E-LTRP.3.2(a)–(g)（允许的申请人 / 伴侣等收入与储蓄来源）。
- **财务过渡适用**：E-LTRP.3.5–E-LTRP.3.6（2024-04-11 前首次成功申请且仍持同一伴侣的指定许可者适用 E-LTRP.3.7，更换伴侣适用一般要求）。
- **过渡收入 / 储蓄**：E-LTRP.3.7(a)–(c)（£18,600，首名符合定义的 child 加 £3,800，其后每名加 £2,400，储蓄项列 £16,000 及收入缺口，或满足 E-LTRP.3.3）；E-LTRP.3.8（因子女数计算超过 £29,000 时只需 £29,000）。
- **财务替代 / 住宿**：E-LTRP.3.3(a)–(b)（伴侣领取列明福利时须证明 adequate maintenance and accommodation）；E-LTRP.3.4、E-LTRP.3.9（足够且不拥挤、不违反公共卫生规定的住宿）。
- **英语 / KOL**：E-ILRP.1.6（引用 Appendix KoLL，即 SRC-025；本段不直接列 B1 / B2，分段日期与等级见 KoLL 2.2(b)、(ba)、(c)(i)–(ii)，Life in the UK 见 KoLL 2.3）。
- **10 年路线与 SETF**：GEN.1.17（10 年合格期的 partner / parent 及其 dependent child settlement 必须依 Appendix Settlement Family Life 申请，不在 Appendix FM 审理）；R-ILRP.1.1(d) 已 deleted，不能从该项补造 10 年路线要求。

## SRC-025 常用定位

- 版本：[GOV.UK Content API 变更记录](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-koll) 最近一条为 2026-03-26（Statement of Changes HC 1691），与[手册变更记录](https://www.gov.uk/guidance/immigration-rules/updates) 中该 Appendix 的最近一条一致；`public_updated_at` 与快照的 `govuk:public-updated-at` 同为 `2026-03-26T09:33:27+00:00`。
- **适用与组合要求**：KoLL 1.1、KoLL 2.1（规定 indefinite leave 的英语与英国生活知识要求，通常须同时满足 KoLL 2.2 与 KoLL 2.3，Part 3 有例外）；本 Appendix 为 Appendix KoLL，不是 SRC-015 的 Appendix KOL UK。
- **英语证明途径**：KoLL 2.2(a)(i)、(iii)–(iv)（列明国籍或学历的指定证明）。
- **已有英语资格**：KoLL 2.2(b)(i)–(iii)、(ba)(i)–(iii)（以此前连续许可所依据的认可英语资格证明时，申请日早于 2027-03-26 至少 B1，自该日起至少 B2，且提供者在申请日仍获认可）。
- **英语考试**：KoLL 2.2(c)(i)–(ii)（认可中心的口语与听力考试，申请日前不超过 2 年，申请日早于 2027-03-26 至少 B1，自该日起至少 B2）。
- **Life in the UK**：KoLL 2.3(a)–(c)（通过获认可的 Life in the UK test，另列 Isle of Man / Guernsey / Jersey 的认可测试）。
- **一般豁免**：KoLL 3.1(a)–(c)（申请日未满 18 岁、至少 65 岁，或因身心状况由决策者认定不宜要求满足其中一项或两项）。
- **长期居留特定例外**：KoLL 3.2(a)(xi)–(xii)、(b)–(d)（包括 Appendix FM partner / parent 连续至少 15 年者，须同时满足 A2 等英语证明、努力学习仍未达 B1 / B2 的教师证明及国籍等限定，不是自动豁免）。
- **后续满足要求**：KoLL 3.3(i)–(iii)（paragraph 39C(c) 适用时，按所欠英语 / Life in the UK 项补足，英语等级亦以 2027-03-26 分 B1 / B2）。

## SRC-026 常用定位

- 版本：[GOV.UK Content API 变更记录](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-uk-ancestry) 最近一条为 2026-08-03（Statement of Changes HC 259），与[手册变更记录](https://www.gov.uk/guidance/immigration-rules/updates)中该 Appendix 的最近一条一致；`public_updated_at` 与快照的 `govuk:public-updated-at` 同为 `2026-08-03T09:50:43+01:00`，不取手册头部的 2026-10-29。
- **当前 / 最近一次许可**：UKA 10.1（申请 settlement 的人为 UK Ancestry route 上的人）；UKA 10.3（申请日须为 Commonwealth citizen）。本 Appendix 主申请人 settlement 部分未另列 “have, or have last been granted” 的最近一次许可段，不从 dependant 条款补造。
- **Suitability**：UKA 11.1–UKA 11.2（Part Suitability、移民法违规与 immigration bail 及其例外）。
- **仍须满足的资格条件**：UKA 12.1（继续满足 UKA 4.1 至 UKA 6.1）；UKA 4.1（祖父母或外祖父母之一出生于 UK 或 Islands）、UKA 5.1–UKA 5.3（本人及 dependants 的 adequate maintenance and accommodation、不得依赖 public funds、Appendix Finance 证据及可信第三方资助）、UKA 6.1（有能力工作且打算在英国寻找并从事工作）。
- **5 年合格期 / 可计入许可**：UKA 13.1（在英国持 UK Ancestry route 的主申请人许可满 5 年）；本段未列其他路线可组合计入，也未另列月数。
- **连续居留**：UKA 14.1（UKA 13.1 的期间须符合 Appendix Continuous Residence）。
- **英语**：UKA 15.1(a)–(b)（除非豁免，申请日早于 2027-03-26 为口语与听力至少 CEFR B1，自该日起为 B2）；UKA 15.2（引用 Appendix English Language）。
- **KOL**：UKA 16.1（引用 Appendix KOL UK）。
- **Partner / child settlement — validity**：UKA 28.1–UKA 28.4（申请表、费用 / 生物信息 / 身份、境内申请、P 的申请或定居身份、最近许可限制及无效申请）；其中 UKA 28.3A 列最近持 Student 许可者的额外条件。
- **Partner / child settlement — suitability**：UKA 29.1–UKA 29.2（Part Suitability、移民法违规与 immigration bail 及其例外）。
- **Partner / child 关系**：UKA 30.1–UKA 30.2、UKA 30.5（P 同时在 UK Ancestry route 获批 settlement，或已定居 / 入籍且定居时持该路线许可，partner 引用 Appendix Relationship with Partner，child 引用 Appendix Children 的 settlement 关系要求）；UKA 30.3–UKA 30.4 已 DELETED。
- **Partner / child 合格期定位边界**：UKA 31–32 已 DELETED（UKA 31.1、UKA 32.1–UKA 32.2），快照未列合格期。
- **Child 照护 / 年龄 / 独立生活**：UKA 32A.1(a)–(b)（引用 Appendix Children 的照护、年龄及独立生活要求）。
- **Partner / child maintenance**：UKA 33.1–UKA 33.3（本人、UK Ancestry 主申请人及其他 dependants 的足够生活费与住宿，不依赖 public funds；Appendix Finance 证据及可信第三方资助）。
- **Partner / child 英语 / KOL**：UKA 34.1(a)–(b)、UKA 34.2（除非豁免，口语与听力在申请日早于 2027-03-26 为至少 B1，自该日起至少 B2，并引用 Appendix English Language）；UKA 35.1（申请日 18 岁及以上须满足 Appendix KOL UK）。
- **Partner / child decision**：UKA 36.1–UKA 36.2（授予 settlement 或拒绝申请，拒绝后可按 Appendix AR 申请 Administrative Review）。

## SRC-027 常用定位

- 版本：[GOV.UK Content API 变更记录](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-innovator-founder) 最近一条为 2026-08-03（Statement of Changes HC 259），与[手册变更记录](https://www.gov.uk/guidance/immigration-rules/updates)中该 Appendix 的最近一条一致；`public_updated_at` 与快照的 `govuk:public-updated-at` 同为 `2026-08-03T10:23:50+01:00`，不取手册头部的 2026-10-29。
- **最近一次许可 / 背书有效性**：INNF 15.3（持有或最近获批 Innovator Founder 许可）；INNF 15.2(e)（Endorsing Body 或 Legacy Endorsing Body 的背书信须在申请日前不超过 3 个月签发且未撤回）；INNF 17.5（Legacy Endorsing Body 须与支持最近一次许可的机构相同）。
- **Suitability**：INNF 16.1–INNF 16.2（Part Suitability、移民法违规与 immigration bail 及其例外）。
- **3 年合格期 / 可计入许可**：INNF 18.1（在英国持 Innovator Founder 许可至少 3 年）；本段未列其他路线可组合计入，也未另列月数。
- **连续居留**：INNF 19.1（INNF 18.1 的期间须符合 Appendix Continuous Residence）。
- **业务持续性与申请人参与**：INNF 17.1(a)–(e)（对照此前背书的 business plan 有显著成果、Companies House 注册且申请人列为 director 或 member、active and trading、按资产 / 预期收入与支出判断未来至少 12 个月可持续、申请人在日常管理与发展中发挥 active key role）。
- **业务 / 投资条件，至少满足两项**：INNF 17.1(f)(i)（至少 £50,000 已投资并实际用于推进业务）；(ii)（最近 3 年客户数至少翻倍且高于提供可比主要产品或服务的其他英国企业平均客户数）；(iii)（显著研发活动且已申请英国知识产权保护）；(iv)（最近完整会计年度年毛收入至少 £1 million）；(v)（同一年度年毛收入至少 £500,000，其中海外出口至少 £100,000）；(vi)（为 settled workers 创造相当于至少 10 个全职岗位）；(vii)（相当于至少 5 个全职岗位，每个岗位平均年薪至少 £25,000，毛薪且不含 allowances）。
- **条件不可重复 / 团队与岗位限制**：INNF 17.2（同一 criterion 不能重复计为两项）；INNF 17.3（同时申请或已获 settlement 的团队成员不能共用同一达标成果）；INNF 17.4(a)–(c)（岗位至少存在 12 个月且合规、平均每周至少 30 小时有薪工作，符合条件的不同员工兼职可合并、settled worker 按入职时定义并持续任职整个所申报的 12 个月）。
- **英语定位边界**：主申请人 settlement 部分 INNF 15.1–INNF 21.6 未另列英语要求或 2027-03-26 分段；入境 / 续签的 INNF 5.1 积分表及 INNF 11.1–INNF 11.2 列的是四项能力均至少 CEFR B2（除非豁免，并引用 Appendix English Language）。本 Appendix 中按申请日早于 / 自 2027-03-26 分 B1 / B2 的 INNF 39.1–INNF 39.2 属 partner / child settlement，不是主申请人条款。
- **KOL**：INNF 20.1（引用 Appendix KOL UK）。
- **Partner / child settlement — validity**：INNF 32.1–INNF 32.3（申请表、费用 / 生物信息 / 身份、境内申请、P 的 settlement 申请或已定居 / 入籍身份及申请人的许可 / 出生条件、无效申请）。
- **Partner / child settlement — suitability**：INNF 33.1–INNF 33.2（Part Suitability、移民法违规与 immigration bail 及其例外）。
- **Partner / child 关系 / 最近许可**：INNF 34.1–INNF 34.4（P 同时作为 Innovator Founder 获批 settlement 或已定居 / 入籍时的条件、申请人最近 dependant 许可或英国出生 child 分支，child 引用 Appendix Children 的 settlement 关系要求，partner 引用 Appendix Relationship with Partner）。
- **Child 年龄 / 照护 / 独立生活**：INNF 35.1–INNF 35.2、INNF 36.1 已 DELETED；INNF 36A.1(a)–(b)（引用 Appendix Children 的照护、年龄及独立生活要求）。
- **Partner 合格期 / 连续居留**：INNF 37.1（在英国连续 5 年持 P 的 partner 许可）；INNF 38.1（该期间须符合 Appendix Continuous Residence）。
- **Partner / child 英语 / KOL**：INNF 39.1(a)–(b)、INNF 39.2（上述 B1 / B2 申请日分段及 Appendix English Language 的具体段号）；INNF 40.1（除非豁免，引用 Appendix KOL UK）。
- **Partner / child decision**：INNF 41.1–INNF 41.5（授予 settlement、转作 permission to stay 申请及其费用 / Immigration Health Charge、许可长度与条件、拒绝申请及 Administrative Review）。

## SRC-028 常用定位

- 版本：[GOV.UK Content API 变更记录](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-private-life) 最近一条为 2026-10-08（Statement of Changes HC 584），与[手册变更记录](https://www.gov.uk/guidance/immigration-rules/updates)中该 Appendix 的最近一条一致；`public_updated_at` 与快照的 `govuk:public-updated-at` 同为 `2026-10-08T07:41:18+01:00`，不取手册头部的 2026-10-29。
- **最近一次许可**：PL 11.3（持有或最近获批 Private Life 许可）；(a)（在英国出生的 child 例外）；(b)（2022-06-20 前获 Appendix FM 或规则外 dependent child 许可，且当时本可满足 PL 3.1(a) 的连续居留要求）；(c)（超过 18 岁、满足或曾满足 half-life test，且在 2022-06-20 前持有或最近获批 Appendix FM 或规则外 family / private life 许可）。
- **Suitability**：PL 12.1、PL 12.3–PL 12.7（Part Suitability；特定事由触发连续 10 年指定许可及刑期结束 / 事由被发现后首次许可起 5 年要求；非法入境的 10 年要求及 child / young adult 例外；可计入许可见 PL 12.6；移民法违规与 immigration bail 及其例外）。PL 12.2 已 DELETED。
- **未满 18 岁 7 年 / 18–24 岁 half-life 的许可入口**：PL 3.1(a)–(b)（申请日未满 18 岁、连续居留至少 7 年且不宜要求离境）；PL 4.1（申请日已满 18 岁且未满 25 岁、18 岁前抵英、在英国连续居留至少半生）。两段属于 permission to stay 的资格要求，不是通用的 settlement 合格期；PL 10.1–PL 10.3 的 30 / 60 个月是授予许可长度，不是 settlement 合格期。
- **英国出生 child 的直接 settlement**：PL 13.1–PL 13.3（英国出生并提供完整出生证明、自出生起连续在英国至少 7 年、不宜要求离境）；未另设先持许可 5 年的要求。
- **5 年合格期**：PL 14.1（持有或最近持有 child 或符合 PL 4.1 half-life test 的 young adult Private Life 许可，连续 5 年持 PL 14.3 或 PL 14.4 指定许可）。
- **其他 5 年过渡情形**：PL 14.1A(a)–(b)、PL 14.1B（2022-06-20 前持有或最近持有 Appendix FM / 规则外 dependent child 许可且当时本可满足 Private Life 规则的 child，申请时或此前申请时满足 PL 3.1(a)，另须连续 5 年持 PL 14.3 许可，两个期间不得重叠）；PL 14.2(b)、PL 14.2A(a)–(c)（2022-06-20 前的指定 family / private life 许可，连续 5 年持 PL 14.3 许可，并须满足或曾满足 half-life test，或最初获批为 child、此后已满 25 岁且在英国连续居留至少半生）。不能简化为所有其他申请人均可走 5 年路线。
- **10 年合格期**：PL 14.2(a)（申请日已满 18 岁且不满足 PL 14.1 者，连续 10 年持 PL 14.3 或 PL 14.4 指定许可；另见上述 PL 14.2(b) / PL 14.2A 的过渡分支）。合格期段以年数表述，未另列 60 / 120 个月。
- **可组合计入路线**：PL 14.3(a)–(e)（Appendix FM partner / parent，排除 fiancé(e) / proposed civil partner；grant letter 称为 family permission 的 partner / parent；2022-06-20 前 paragraph 276ADE / 276BE(2) 或 Appendix Private Life；Appendix FM partner / parent 的 child；依据 Article 8 在规则外授予的 partner / parent / child / private life 许可，及这些许可的组合）；PL 14.4(a)–(b)（PL 14.1 / PL 14.2 可另计其他可定居路线，须未非法入境，Private Life child / young adult 例外，且申请日已有至少 1 年指定 Private Life 许可；该段未列 PL 14.2A）。
- **连续居留**：PL 15.1（settlement 合格期引用 Appendix Continuous Residence，但在英国出生的 child 除外）；英国出生 child 的 PL 13.2 期间按 PL 15A.1–PL 15A.3（可含有 / 无许可期间、监禁 / 特定拘留不计、单次缺席超过 6 个月或累计至少 550 天等中断事由）。不要把许可入口 PL 7.1–PL 7.3 与 settlement 合格期的计算依据混为一谈。
- **英语 / KOL**：PL 16.1(a)–(b)（除非豁免，申请日早于 2027-03-26 为口语与听力至少 CEFR B1，自该日起为 B2）；PL 16.2（引用 Appendix English Language）；PL 17.1（除非豁免，例如未满 18 岁，引用 Appendix KOL UK；快照原文段号写作 `PL17.1`）。
- **与 Appendix Settlement Family Life 的衔接**：本 Appendix 快照未直接引用 Appendix Settlement Family Life；交叉定位 SRC-022 的 SETF 1.3（最近许可为 Appendix FM partner / parent）、SETF 3.1(c)（其 10 年组合可计 Private Life 许可）及 SETF 3.2（计入其他可定居路线的条件）。反向计入 Appendix FM family 许可的依据为本页 PL 14.3(a)–(b)、(d)–(e)，不能把两套 settlement 的最近许可入口互换。
- **英国出生 dependent child settlement — validity**：PL 26.1–PL 26.3（申请表、费用 / 生物信息 / 身份、境内申请、P 的 Private Life settlement 申请或已定居 / 入籍身份及子女出生时间、无效申请）。
- **英国出生 dependent child settlement — suitability**：PL 27.1、PL 27.3–PL 27.6（Part Suitability、特定事由对应的 10 年指定许可与刑期结束 / 事由被发现后首次许可起 5 年要求、可计入许可、移民法违规与 immigration bail 及其例外）；PL 27.2 已 DELETED。
- **英国出生 dependent child 要求**：PL 28.1–PL 28.2 已 DELETED；PL 28A.1(a)–(d)（Appendix Children 的年龄、独立生活、照护及 settlement 关系要求）、PL 28A.2（在英国出生）；PL 29.1–PL 29.2、PL 30.1 已 DELETED。
- **英国出生 dependent child 英语 / KOL**：PL 31.1(a)–(b)、PL 31.2（除非豁免，口语与听力在申请日早于 2027-03-26 为至少 B1，自该日起至少 B2，并引用 Appendix English Language；快照原文写作 `PL31.1`）；PL 32.1（除非豁免，例如未满 18 岁，引用 Appendix KOL UK）。
- **英国出生 dependent child decision**：PL 33.1–PL 33.5（授予 settlement、转作 permission to stay 申请及其费用 / Immigration Health Charge、许可长度与条件，或拒绝申请）。

## SRC-029 常用定位

- 版本：[GOV.UK Content API 变更记录](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-part-8-family-members) 最近一条为 2026-08-03（Statement of Changes HC 259），与[手册变更记录](https://www.gov.uk/guidance/immigration-rules/updates)中 Part 8 的最近一条一致；`public_updated_at` 与快照的 `govuk:public-updated-at` 同为 `2026-08-03T08:17:40+01:00`，不取手册头部的 2026-10-29。
- **Child settlement 小节**：para 298 前的标题为 “Requirements for indefinite leave to remain in the United Kingdom as the child of a parent, parents or a close relative present and settled or being admitted for settlement in the United Kingdom”。
- **父母 / 近亲情形**：para 298(i)(a)（父母双方在英国已定居）；(b)（一方在英国已定居、另一方去世）；(c)（一方在英国已定居且独自承担抚养责任，或子女通常与其同住而非另一方）；(d)（一方在英国已定居或同时获准入境定居、另一方没有且未获批英国限期许可，并列 serious and compelling reasons 例外）；(e)（近亲在英国已定居，子女在英国没有其他可合理期待提供支持或照料的家人）。
- **既往许可 / 年龄分支**：para 298(ii)（持有或曾持有英国限期入境或居留许可）及 (a)（未满 18 岁）；(b)（以定居为目的获批 para 302 或 Appendix FM 许可）；(c)（按 para 319R 入境并作为难民或 humanitarian protection 受益人的子女完成 2 年限期许可，父母现已定居或原保护身份父母现为 British Citizen）；(d)（按 para 319X 持限期许可，其难民或 humanitarian protection 受益人近亲现已定居）；(e)（最近按 para 298A 获批限期居留）；(f)（最近按 Appendix Adoption 或本 Part 的 adopted children rules 获批入境或居留许可）。
- **独立生活 / 住宿 / 生活费**：para 298(iii)（未独立生活、未婚、未另组独立家庭）；(iv)（由入境时投靠的父母 / 近亲提供其独占拥有或使用的足够住宿，不依赖 public funds）；(v)（由该父母 / 近亲提供足够生活费，不依赖 public funds）。
- **Suitability / 英语与 Life in the UK**：para 298(vi)（不得因 Part Suitability 被拒）；(vii)（18 岁及以上且按 para 302、Appendix FM、para 319R 或 para 319X 入境者，按 Appendix KoLL 满足英语与英国生活知识要求；KoLL 见 SRC-025）。
- **未满足 settlement 后的限期许可**：para 298A(a)–(c)（仅因 298(vi) 的 SUI 5.3 所述刑罚 / 处置、18 岁及以上未满足 298(vii)，或原会因 SUI 5.3 被拒时，可给予不超过 30 个月的 limited leave to remain，并附 no recourse to public funds 条件）。
- **Para 302 所在小节**：标题为 “Limited leave to enter or remain in the United Kingdom with a view to settlement as the child of a parent or parents given limited leave to enter or remain in the United Kingdom with a view to settlement”；para 302 为此类子女的限期许可条款，由 para 298(ii)(b) 引用。
- **Appendix FM 交叉引用**：para A277、A277B(a)–(c)、A277C、A277D、A278、A280(a)–(b)、A280(d)(v)、A280(g)、A280B、277、298(ii)(b)、298(vii)（分别见过渡与相互适用条款、partner 定义及上述 child settlement 许可 / KoLL 入口；Appendix FM 见 SRC-024）。
- **Appendix Settlement Family Life 交叉引用**：para A277B(c)（在该段指定情形下，将 Part 8 连续许可期间计入后续 indefinite leave to remain 的连续许可期间；该 Appendix 见 SRC-022）。

## SRC-030 常用定位

- **版本边界**：2026-11-05 抓取整页原始 HTML；GOV.UK Content API `/api/content/skilled-worker-visa` 的 `public_updated_at` 为 `2024-10-31T17:00:39+00:00`，guide 子页 API 同值且未列费用变更记录，不能将该日期当作费用生效日；本次费率使用抓取时正文，并与 SRC-031 的 2026-10-08 费用表 §7 交叉核对。
- **境内标准申请费**：`Application fees` 小节中 “If you’re applying from inside the UK to extend, switch or update your visa” 后的列表：up to 3 years £943，more than 3 years £1,865；不是境外 £819 档。本页小节没有 HTML id，以标题与句子定位。
- **IHS**：`How much it costs` 开头列表中 healthcare surcharge “usually £1,035 per year”；本游戏虚构的续签长度为 3 年，按标准成人 IHS 计，不模拟减免或附加服务。
- **例外范围**：`If your job is on the immigration salary list` 为另一费率；游戏当前仅为林遥的普通 Skilled Worker 主申请人开放续签。本页无 ILR 费用，另见 SRC-031。

## SRC-031 常用定位

- **版本**：标题 “Home Office immigration and nationality fees, 8 October 2026”；页面 Updated 10 September 2026，API `public_updated_at` 为 `2026-09-10T16:15:37+01:00`；使用表格 “Fee from 8 October 2026” 列，而非旧版本表。`/visa-fees` 只提供费用查询入口，因此归档其对应的 GOV.UK 完整费用表。
- **ILR**：§9 `Other applications made in the UK`（`#other-applications-made-in-the-uk`），行 “Indefinite leave to remain - main applicant and dependants”：£3,226（新旧列同值），不是境外 Route to Settlement 行。
- **交叉核对境内 Skilled Worker**：§7 `Work – applications made in the UK`（`#work--applications-made-in-the-uk`），非 Immigration Salary List、非 Health and Care 的 three years or less 行 £943，over three years 行 £1,865。
- **境内 BN(O) 续签**：§9 `Other applications made in the UK`（`#other-applications-made-in-the-uk`），行 “Hong Kong British National (In-Country) for 30 months - main applicant and dependants”，`Fee from 8 October 2026` 列 £206；勿误用 §1 境外行或同节五年档 £285。参数 `hongKongBnoExtensionFee` 按单个申请人收取。
- **境内伴侣续签**：同节行 “Leave to remain - Other”，同列 £1,407；表中没有单列 partner，勿误用 §1 的境外 “Route to Settlement” £2,064。2026-11-05 交叉核对 [Family visas: apply, extend or switch — Fees](https://www.gov.uk/uk-family-visa#fees)，`Cost if joining your partner, parent or child` 的 `Apply in the UK` 列也是 £1,407。参数 `familyPartnerExtensionFee` 采用归档费用表 §9 定位；IHS 复用 SRC-030 的成人年费参数。

## SRC-032 Budget 2026（HTML）

- 首发与 `public_updated_at` 为 2026-10-28；不把预算发布日期当作各措施的生效日。
- 人才方向的主要叙述在 **§5.6 `Backing British business` → `Access to talent`（`#access-to-talent`）**：HPI 拟覆盖 top 150 of the world's best institutions，cap 按比例增加；Graduate 拟对高合规、就业结果良好的大学毕业生给予两年许可。同段将 Global Talent endorsed funder pathway 的扩大描述为已经完成，不是所有 Global Talent 资格的新变更。
- **§7.9 `Backing business and British Industry`（`#backing-business-and-british-industry`）**还列有 `Expanding the High Potential Individual visa`、`Extending the graduate visa from 18 months to two years for eligible universities` 两个措施条目。因此 §5.6 是完整背景定位，§7.9 可作措施清单的补充定位，不能把二者混作同一段。
- 同节 `Implementing Migration Advisory Committee (MAC) recommendations on visa salary requirements` 给出 **2027 年春季**窗口，包括 occupation-specific 门槛改至工资第 25 百分位、更新一般门槛、年度更新、统一 new entrant 折扣、移除 PhD 折扣；`Extending visa curtailment to six months` 给出 **2027 年**窗口。未给确切生效日、金额和完整资格；预算 ¶6.94／6.95 的段号由 SRC-033 答复明确引用，不冒充本 HTML 的段号。
- **§7.4 `Public spending`（`#public-spending-2`）**的 `A change to the tax treatment of the Immigration Skills Charge and Certificate of Sponsorship fees`：针对雇主支付的税务处理，不是玩家申请费或 IHS 减免；临时法定效力另见 SRC-047，解释范围见 SRC-046。

## SRC-033／037／038／039 议会书面问题

- 2026-11-15 四个网页的 `curl` 抓取均返回 **HTTP 403**；在线网页可经阅读服务回读，实际快照采用议会官方 API 的完整单条 JSON（不是列表接口的截短 `answerText`），未保存拒绝页。
- `value.uin`／`value.dateTabled`／`value.dateAnswered` 可核身份与日期。定位为问题号 + 回答日 + `value.answerText` 内**非空 `<p>`** 顺序，不把自动换行或空白段计作一段。

### SRC-033 书面问题 40064

- [官方 API](https://questions-statements-api.parliament.uk/api/writtenquestions/questions/2026-11-02/40064?expandMember=true)
- **SRC-033，40064，回答 2026-11-04**：Answer ¶2–6 对应 Budget ¶6.94（薪资措施和春季窗口），¶8 是引用 MAC 的判断，¶9 对应 ¶6.95（最长六个月与 2027 年），¶10 说细节后续发布。未回答新一般门槛的具体金额。

### SRC-037 书面问题 39721

- [官方 API](https://questions-statements-api.parliament.uk/api/writtenquestions/questions/2026-11-02/39721?expandMember=true)
- **SRC-037，39721，回答 2026-11-04**：Answer ¶2（多数尚未定居的在英者、指定 care／public-sector 过渡不是普遍豁免），¶4（实施前发布经济、平等、儿童影响评估及进一步技术／操作指引）。不能据此补造在途者完整适用边界。

### SRC-038 书面问题 40262

- [官方 API](https://questions-statements-api.parliament.uk/api/writtenquestions/questions/2026-11-03/40262?expandMember=true)
- **SRC-038，40262，回答 2026-11-10**：Answer ¶1（未做所问威慑效果估算），¶2（较长的定居合格期本身不授予同长度停留许可），¶3（无合法停留依据时的处理）。不是新授予许可规则。

### SRC-039 书面问题 41453

- [官方 API](https://questions-statements-api.parliament.uk/api/writtenquestions/questions/2026-11-10/41453?expandMember=true)
- **SRC-039，41453，回答 2026-11-13**：Answer ¶2–3 的预测是无改革基线、有显著不确定性且不含 EUSS；¶4 说改革影响另列 accompanying Impact Assessment。不可换算为角色的获批概率。

## SRC-034 Appendix Graduate

- 页头确实显示 **Updated 29 October 2026**，但属于 Immigration Rules 手册。所附[单页 Content API](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-graduate) 的 `public_updated_at` 为 `2026-08-03T09:10:18+01:00`，`details.change_history[0]` 同日、HC 259；HTML `govuk:public-updated-at` 一致。按本登记既定约定，Appendix 版本日仍记 **2026-08-03**，同时保留页头日期供复核。
- GR 8.1（`#period-of-grant-for-a-graduate`）：博士三年；其他合格学历在 **2027-01-01 前申请为两年，自该日起申请为 18 个月**，许可长度从决定日计算。GR 4.1 为现有 sponsor 合规要求，不是预算案所提就业结果条件；预算案大学例外见 SRC-032、PD-077，不能提前写入 GR 8.1。引言明确该路线本身不通向 settlement；不据此否定现行 Long Residence 的可计入时间。

## SRC-035 Appendix High Potential Individual

- 所附[单页 Content API](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-high-potential-individual) 的 `public_updated_at` 为 `2026-08-03T10:10:39+01:00`，最近变更记录为 HC 259；HTML 同值。页头 2026-10-29 仍是手册日期。
- HPI 1.6A：现行年度 cap **8,000**，年度从 **11 月 1 日至翌年 10 月 31 日**；HPI 5.1–5.3（`#global-universities-list-degree-requirement`）：学历及名单按**学位授予日**核对，不能拿今天名单替代。引言明确不是直接 settlement 路线。预算扩容的新 cap 和实施边界仍未确定（PD-078）。

## SRC-036 HPI 大学清单 2026

- `policy-sources/2026-11-04-high-potential-individual-global-universities-list-index.html` → <https://www.gov.uk/government/publications/high-potential-individual-visa-global-universities-list>
- 子页 `first-published-at` 为 2026-11-01，`public-updated-at`／可见 Updated 为 2026-11-04；所附[集合页](https://www.gov.uk/government/publications/high-potential-individual-visa-global-universities-list) `Updates to this page` 分别记载加入 2026 名单和移除旧名单。文件名取子页版本日，不取名单标题的年份或授予期起点。
- 子页正文首段（无独立锚点）将适用学历授予期间定为 **2026-11-01 至 2027-10-31**，随后表头为 `Alphabetical rankings lists 2026`／`Country`。这是现行年度清单，不能作为预算 top 150 新方案已实施的证据。

## SRC-040 Women and Equalities Committee 取证

- `policy-sources/2026-11-05-wec-earned-settlement-oral-evidence-hc760.html` → <https://committees-api.parliament.uk/api/OralEvidence/18236/Document/Html>
- `policy-sources/2026-11-05-wec-earned-settlement-oral-evidence-hc760-metadata.json` → <https://committees-api.parliament.uk/api/OralEvidence/18236>
- 网页直接抓取 403；快照来自上述官方文档 API 返回的 base64 `data`，解码后保留原 HTML。官方元数据的 `meetingDate` 为 2026-11-04，`publicationDate` 为 **2026-11-05**；HTML 卷首的取证与命令刊印日期均为 2026-11-04。二者区分登记，不能只把取证日当网上发布日。
- 定位 **HC 760，Q1–Q26**，引用时保留对应证人及问题号。该材料是证人意见与委员会审查，适合家庭处境素材，不是政府已接受的豁免或新的 Immigration Rules。

## SRC-041 Women and Equalities Committee 信函

- `policy-sources/2026-11-05-wec-earned-settlement-letter.pdf` → <https://committees-api.parliament.uk/api/Publications/55734/Document/309954/OriginalFormat>
- 原 PDF URL 直接抓取 403；从上述官方 API 的 base64 `data` 解码得到原 PDF（126,591 字节）。信件日期与官方发布元数据均为 2026-11-05。
- `pdfinfo`：**5 页**；`pdftotext -f N -l N -layout` 核对：物理 **p1 问题 1–3**（儿童影响评估、单亲／父母不同进度），**p2 问题 4–5**（儿童入籍与 care leavers），**p4 问题 8–10**（残障支持、豁免咨询、家暴支持），**p5 问题 11**（平等影响评估）。本 PDF 页脚恰与物理页相同；这些是问题，不是政府答复；不采用转引的第三方统计。

## SRC-042–045 动态生活指引

- 四页均于 2026-11-15 存整页 HTML，以抓取日命名；没有可确认的独立子页政策版本日。快照 `govuk:public-updated-at` 分别为 2025-07-15、2025-05-28、2024-11-28、2024-12-04，只供技术核对，不当作正文现行要求或费用的生效日。
- **SRC-042 eVisa**：`Travel with your eVisa` 正文开头无独立 `Before you travel` 小节；用该标题后的核对清单（账户护照／个人资料、eVisa 状态、承运人资料）定位。另有 `#when-you-travel`、`#if-youre-asked-to-show-additional-proof-of-your-immigration-status`、`#if-your-passport-or-personal-details-change-when-youre-outside-the-uk`。账户更新不等于续签或延长许可。
- **SRC-043 ETA**：`Overview` 正文开头的 **£20**，`#who-needs-an-eta` 的国籍／目的判断及已有在英生活、工作或学习许可者无需 ETA 的例子。该授权不保证入境；不为现有角色每次返英重复收费。
- **SRC-044 IHS**：`#cost-for-a-year`：一般 **£1,035／年**；学生及其 dependants、Youth Mobility Scheme、申请时未满 18 岁者 **£776／年**；`#cost-for-part-of-a-year`、`#months-or-less`、`#more-than-6-months-but-less-than-one-year`、`#cost-for-more-than-one-year` 给不足整年的计费分档。不能把成人费率直接用于所有儿童／学生。
- **SRC-045 Life in the UK**：`Book the Life in the UK Test` 正文开头 **至少提前三天、£50**；`#prepare-for-the-test` **45 分钟、24 题**；`#book-the-test` 与 `#accepted-forms-of-id` 核预约姓名和证件。未据此确认新版考试或 UKRS A2 版已经推出。

## SRC-046–047 雇主 ISC／CoS 税务

- **SRC-046** 于 2026-10-28 发布；`#general-description-of-the-measure`、`#operative-date`、`#proposed-revisions`：针对雇主支付 ISC／CoS 的 benefit-in-kind 所得税豁免，适用付款日自 **2026-10-28** 起；不扩及 sponsor licence、visa application fee 或 IHS。该政策说明不独自证明法定效力。

### SRC-047 下议院 Budget Resolutions

- **SRC-047** 网页直接抓取 403，存档为[Hansard 官方 API](https://hansard-api.parliament.uk/debates/debate/31AB917B-C6F4-41D2-B256-BAB5D978DA92.json) 完整 JSON。定位 **HC Deb 2026-11-03 vol 792，Resolution 15 `Charges in connection with employment visas`，(1)–(2)**；标题 contribution `26110366000014`，付款日 `56bffe4a-fa6e-450d-8d67-e480fbe11be6`，法定效力声明 `891e7ed4-9876-42cd-a96c-84d71f3576ed`，通过结果 division `21AF684D-09F7-4DDF-A757-F344EFC811B1`。API 没有可用的数字栏号，故采用决议号和精确锚点，不补造 col。
- 决议明确依据 Provisional Collection of Taxes Act 1968 具有临时法定效力，并有通过结果；不把随后 Finance Bill 的草案身份当作永久成法。其作用是税务处理，不是退还玩家移民费用。

## SRC-048 HC 584 accessible

- HTML `first-published-at`／`public-updated-at` 为 2026-09-03；用 HTML 段号／锚点，不附未经核对的 PDF 页码。
- `#implementation`：APP SW1–SW2 自 **2026-10-08**；APP ST8–ST10 自 **2026-11-30**，此前申请按旧规则；APP EU16 自 **2026-12-09**。后两批不是 Earned Settlement 首批规则。
- `#app-sw1`／`#app-sw2`（资格评估机构称谓、特定 modern slavery 个案工作条件）；`#app-st8`／`#app-st9`／`#app-st10`（Student 生活费证明额）；`#app-eu16`（境内非 EEA 申请人身份证明）。与已登记 Appendix 的修法链对应，不据此更改本任务外的参数。

## SRC-049 Finance Bill 2026–27（Bill 173）

- Bill 173 as introduced，第 15 条（PDF 物理 p21、印刷第 8 页）拟在 ITEPA 2003 插入 s326C，豁免缴付 CoS 费和 Immigration Skills Charge 所产生的所得税，第 15(2) 条适用于 **2026-10-28 起支付**的款项。临时法定效力来自 SRC-047 Resolution 15。议会 Bill 4316 截至 2026-11-19 尚未成法，下议院二读排期为 2026-11-23。可对照[官方 PDF p21](https://publications.parliament.uk/pa/bills/cbill/59-02/0173/260173.pdf#page=21)、[官方 HTML](https://publications.parliament.uk/pa/bills/cbill/59-02/0173/260173.html)及[议会进度 API](https://bills-api.parliament.uk/api/v1/Bills/4316)。
- [议会发布 API](https://bills-api.parliament.uk/api/v1/Bills/4316/Publications)的原始响应已存为 `policy-sources/2026-11-04-finance-bill-173-publications.json`（sha256 `83f243758675a15b0b5e44e6f3095e4106b1542f99b09d87e8fc82b2056fb56b`）。发布记录 68588、68590 分别指向上述 PDF 和 HTML，68592 指向 [Bill 173–EN](https://publications.parliament.uk/pa/bills/cbill/59-02/0173/en/260173en.pdf)（物理 p37，Clause 15 ¶1–9）。第 15 条已通过官方 PDF 与 HTML 在线回读。命令行复取这些原件链接均返回 HTTP 403，发布 API 对应记录的 `files` 为空。目前仅存发布元数据，快照列无原文文件。

## SRC-050 Skilled Worker caseworker guidance

- `§1.2 Publication`（`#publication`）标明 v20.0 于 2026-08-03 向 Home Office 工作人员发布，页头及[发布集合](https://www.gov.uk/government/publications/skilled-worker-visa-caseworker-guidance)同日。
- `§11 Tradeable points requirement`（`#tradeable-points`）和 `§12.2 Occupations in Tables 1, 1a, 2, 2aa and 2a`（`#occupations-in-tables-1-1a-2-2aa-and-2a`）用于定位 Option E 及对应 going rate 表。`§16 New entrants`（`#new-entrants`）列六项备选资格，表第 6 项是 Graduate 分支，法律依据为 SRC-004 SW 4.2、12.1–12.3。
- `§16.1 4-year time limit`（`#year-time-limit`）首段明确 Graduate、Skilled Worker、Tier 2 时间均计入，非连续也计入。指引说明整个申请期都须满足上限，担保人可同意修订 CoS，且没有提前换签的计算示例。`§23.1 Dates of permission granted`（`#dates-granted`）给境内获批起日及 CoS 结束后许可尾段。提前换签的未届尾段和逐日核算见 PD-081。
- `§13.5 The going rate → Transitional arrangement for PhD-level roles`（`#transitional-arrangement-for-phd-level-roles`）明列 settlement 的申请截止日。`§22.4 Sponsorship and salary`（`#sponsorship-and-salary`）表后首段要求满足 SW 14.5(c) 的全部条件才能在 settlement 使用过渡安排（PD-080）。

## SRC-051 Appendix Student

- [单页 Content API](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-student)的 `public_updated_at` 为 `2026-10-08T08:54:41+01:00`，最近 `details.change_history` 为 HC 584，快照元数据同值。页头 2026-10-29 为手册日期。HC 584 已公布的后续生活费变动及过渡见 SRC-048 `#implementation`、`#app-st8`–`#app-st10`。
- `#period-and-conditions-of-grant-for-a-student`：ST 25.1(b)（工作条件）、ST 25.2–25.3 及附表（按 CAS 课程期及课程类型计算许可收尾期）。
- `#work-conditions-for-a-student`：ST 26.1（快照写作 `ST26.1.`）及表格（担保人及课程决定学期工时和非学期工作条件），ST 26.2–26.3（实习及特定选举职位）、ST 26.5–26.6、26.8（禁止工作及例外）。

## SRC-052 Student and Child Student caseworker guidance

- `Publication`（`#publication`）给出 v15.0 的员工版发布日期 2026-10-09，[发布集合](https://www.gov.uk/government/publications/student-route-caseworker-guidance)与 HTML 元数据给出网页更新时间 2026-10-16。`Work conditions`（`#work-conditions`）明确课程完成后仍有效的 Student 许可时间按非学期处理。`Student and Child Student: Prohibited work`（`#student-and-child-student-prohibited-work`）回指 ST 26.6、26.8。
- `Student: period to grant`（`#student-period-to-grant`）回指 ST 25.3，另列境内延长许可在课程已经结束后才获批时的起算和短课例外。

## SRC-053 Appendix FM-SE

- [单页 Content API](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-fm-se-family-members-specified-evidence)的 `public_updated_at` 为 `2026-03-26T09:03:14+00:00`，最新 `details.change_history` 为 HC 1691，快照元数据同值。2026-10-29 是 Immigration Rules 手册页头日期。
- 常用定位为 ¶12(a)–(n) 与段末 (i)–(ii)（指定福利与当前领取证明），¶12A(a)–(f)（收入、储蓄、住宿和 Council Tax 证据），¶11–11A 与 ¶12B（储蓄可计范围及按周折算），¶18–20（各类收入口径）。适用入口为 SRC-024 E-LTRP.3.3 与 E-ILRP.1.3(1A)，计算方法见 SRC-054。

## SRC-054 Adequate maintenance and accommodation caseworker guidance

- [Home Office 发布集合](https://www.gov.uk/government/publications/chapter-8-appendix-fm-family-members)的 2025-11-11 更新指向 v13.0 原件。PDF 共 33 页，物理页序与印刷页码一致。
- 常用定位为 p6–8（定义与适用群体），p9–10（`A − B ≥ C`、决定日费率、按周折算和舍入），p12–15（现金储蓄及可计收入），p17–19（福利、收入、储蓄和住房成本凭证），p23–26（住房权属／使用、拥挤和公共卫生）。p14 算例的 `C` 表格合计与正文比较行不同，实际基准按 p9 用决定日费率。

## SRC-055 Immigration Act 1971 s.3C

- 快照是 [legislation.gov.uk 现行修订条文](https://www.legislation.gov.uk/ukpga/1971/77/section/3C)的原始 HTML。s.3C(1)(a)–(c) 规定触发条件，s.3C(2)(a) 规定待决／未撤回期间，s.3C(2)(b)–(d) 另列符合条件的上诉或 administrative review 窗口及待决期间。s.3C(3) 规定离境失效，s.3C(3A) 规定可取消的事由，s.3C(4)–(5) 区分另提申请与变更原申请。

## SRC-056 Workers and Temporary Workers: Part 2 – Sponsor a worker

- `#version-number-and-publication` 标明 v10/26，2026-10-08 发布。CoS 定位：S2.1–S2.7 `#What_is_a`、S2.8–S2.11 `#Types_of_CoS`、S3.8 `#Information_you_must`（工作起止日、薪资、工时和 occupation code）。
- 薪资及 going rate 定位：S3.29–S3.32 `#Standard_occupational_classificatio`（SOC code 与去 SRC-017 查表）；S4.1–S4.5 `#Minimum_pay_rates`（路线薪资要求及合规）；S4.14–S4.16 `#Salary_information_you`、`#period-the-salary-must-cover`（工资申报）；S4.29–S4.31 `#Salary_otherwise_reduced`、`#salary-reductions-exceptions`（降薪、going rate 与报告）。具体 Skilled Worker 条件和费率引用 SRC-004、SRC-017。

## SRC-057 Continuous residence caseworker guidance

- `#publication` 标明 v10.0，2026-10-08 向 Home Office 工作人员发布。`#count-whole-days` 只计整天。`#calculating-the-length-of-absences` → `#the-12-month-period` 末段说明 Long Residence 跨过渡日行程何时开始适用滚动窗口。
- `#calculating-absences-which-started-before-11-april-2024-for-appendix-long-residence` 与其 Example 2 分别定位单次和累计旧限额、跨日行程在旧限额的计数范围，法源为 SRC-008 CR 3.1、CR 3.3(a)–(b)，并受 CR 3.4 所列例外约束。`#time-spent-on-3c-or-3d-leave` 说明此类法定延续在 continuous residence 中按相关路线的许可时间计算。

## SRC-058 书面问题 40091

- 快照取自[议会官方单条 API](https://questions-statements-api.parliament.uk/api/writtenquestions/questions/2026-11-02/40091?expandMember=true)。
- **40091，2026-11-04，Answer ¶1 后的榜单及 ¶2**：拟扩容的大学须在相关年份的 Times Higher Education World University Rankings、QS World University Rankings、Academic Ranking of World Universities（ARWU）中至少两个进入前 150。正式名单、新申请 cap 及生效日仍待公布（PD-078）。答复提到的 `Paragraph 6.2` 与现行 Appendix 的段号不符，现行 HPI 6.2 是英语要求，名单按学位授予日匹配的要求见 SRC-035 HPI 5.2。扩容筛选方法引本答复。

## SRC-059 Cancellation and curtailment of permission

- `Publication`（`#publication`）注明 v12.0 于 2026-09-11 向 Home Office 员工发布，网页更新于 2026-09-14。
- `Cancellation in points-based system (PBS) cases → Premature end of employment or study: cancellation process`（`#premature-end-of-employment-or-study-cancellation-process`）首个列表项明确，进一步许可获批后，新许可已替代原许可，无需另行取消原许可。上一小节的 `Individual granted permission in another category`（`#individual-granted-permission-in-another-category`）也给出改获其他类别许可时的办案操作。与 SRC-050 §23.1 合读可支持境内提前换签的许可期间推导，SW 12.3 逐日及 section 3C 的计法见 PD-081。

## SRC-060 HC 590 Implementation

- `Implementation`（`#implementation`）第三段：列明的条款于 2024-04-04 生效；以 2024-04-04 前由 sponsor 签发的 certificate of sponsorship 提出的入境或居留申请（及其伴侣、子女的随行申请），按 2024-04-03 有效的移民规则审理。所列条款含 APP SW1 至 APP SW28 与 APP SO1。与 SRC-004 SW 4.2(b)(ii) 合读，用于判断连续 Skilled Worker 许可的首段是否按旧规则获批。

## SRC-061 Australian Citizenship Act 2007

- 快照取 legislation.gov.au 该版本的 EPUB 正文页，版本 Compilation No. 37（Compilation date 2026-06-04，含 Act No. 75, 2025）。澳洲条文用 section 号定位，如 `s22(1)(a)`。
- `s5(1)`：permanent resident 指在澳并持永久签证的人；在境外时，须此前在澳且上次离境前已持永久签证（离境后在境外另获的永久签证，如 RRV，不改变这一点）。因此在境外获发的第一份永久签证，要持该签证入境后才算永久居民；只有日期时，引擎把出境当天生效的永久签证视为离境后才获发。
- `s21(2)`：一般资格，(a) 申请时满 18 岁，(b) 申请时和决定时都是 permanent resident，(c) 申请时满足一般居住要求（s22）。
- `s22(1)`：申请日前 4 年在澳（a）、其间不曾是 unlawful non-citizen（b）、申请日前 12 个月以永久居民身份在澳（c）。`s22(1A)`：4 年内出境合计不超过 12 个月视为在澳。`s22(1B)`：最后 12 个月出境合计不超过 90 天且出境期间一直是永久居民，视为以永久居民身份在澳。`s22(1C)` 规定 4 年内曾被监禁或依法院命令收治的不满足 (1)(a)。`s22(2)` 起为豁免与部长裁量，试点不建模。

## SRC-062 Migration Regulations 1994

- 快照取 legislation.gov.au 该版本 EPUB 的第 1、2 个正文文件，版本 Compilation No. 291（Compilation date 2026-11-03，含 F2026L01466）。条款号直接定位，如 `155.212(2)`、`Sch 1 item 1139(3)(c)`。
- Volume 1：`reg 1.03` 定义 regional provisional visa（491、494）与 long-term partner relationship（两人以配偶或事实伴侣身份持续满 3 年；有双方共同的受抚养子女、且不是继子女时满 2 年）。`Sch 1 item 1139(3)(c)`：191 的 Regional Provisional 主申请人须持有 regional provisional visa 且已持有满 3 年。
- Volume 2：`155.212(2)` RRV 5 年内以永久签证持有人或公民身份在澳合计不少于 2 年，`155.511(b)` 符合者获 5 年旅行便利。`186.221` 申请时未满 45 岁（文书列明的类别除外）；`186.226(1)` 申请前 3 年内持 457／482（含其后的 bridging visa）合计至少 2 年；`186.227(1)` 同期为 approved work sponsor 全职工作合计至少 2 年（不含无薪假）。`191.111` relevant income year 的定义，`191.222` 须交 3 个 relevant income year 的税务评估通知。`801.221(2)(d)`、`100.221(2)(c)`：伴侣签递交满 2 年；`801.221(6A)`、`100.221(5)`：递交时已是 long-term partner relationship 的不受 2 年限制。`100.221(6)`：担保人持有或曾持有永久人道签证、获签前双方已是配偶或事实伴侣并已告知移民局的，也不受限制。`100.511`、`186.511`、`189.511`、`190.511`、`191.511`、`801.511`：永久签证的旅行便利为批准日起 5 年。

- 香港类别（任务 65）：Volume 1 `Sch 1 item 1137(4L)(e)` 189 香港类别主申请人须持香港或 BN(O) 护照、持 `(4M)` 所列 457／482／485 签证满 4 年；`item 1139(3)(ca)` 191 香港地区类别同上、满 3 年（`(3A)`：须作为主申请人获批，2020-07-09 起获批的须可停留 5 年）。Volume 2 `189.242`、`191.232` 递交前 4 年／3 年连续通常居住在澳洲；`191.231(2)` 递交前 3 年只在指定地区居住、工作和学习。

## SRC-063 191 Regional Provisional Visas stream

任务 83 重新抓取同一官方页面。2026-11-21 历史快照为 `policy-sources/2026-11-21-au-191-regional-provisional-stream.html`（sha256 `07d09a632a0d95bef34e23f755e31f7aafc088be9b62ee615633cce239bfc02d`）。

- `Eligibility → Have an eligible visa`：申请时须持 491 或 494，且已持有满 3 年。`Satisfy the income requirement`：没有最低收入要求，须提供合格签证 5 年中 3 个财年的 ATO 评估通知。页面内容以 JSON 嵌在 HTML 中，按小节标题定位。

## SRC-064 186 Temporary Residence Transition stream

任务 83 重新抓取同一官方页面。2026-11-21 历史快照为 `policy-sources/2026-11-21-au-186-temporary-residence-transition-stream.html`（sha256 `391aca298eb2a556682e583e43d2d9de1d32ce223bd2ece8ef4ecb5db5b9b4d9`）。

- `Eligibility → Have 2 years eligible sponsored employment in the 3 years prior to your application`：全职、在澳、持 457／482 或合格 bridging visa 期间、在获批职业内。年龄小节写明通常须未满 45 岁，并列出豁免类别。`Have this visa`：申请时须是 457 或 482 的主签证持有人，或持因 457、482、186、187 申请获发的 bridging visa，且上一份实质签证是 457／482。

## SRC-065 801 Partner（permanent）

任务 83 重新抓取同一官方页面。2026-11-21 历史快照为 `policy-sources/2026-11-21-au-801-partner-permanent.html`（sha256 `31b63e4b5bc7a2153a76a4bb845c22760253a39a377e45fd1cdea57821aff706`）。

- `Eligibility → Visa requirements`：须持 820（或 445），自递交 820 与 801 申请起满 2 年才进入永久阶段评估；部分情形可不满 2 年获批。

## SRC-066 Resident Return visa 155／157

任务 83 重新抓取同一官方页面。2026-11-21 历史快照为 `policy-sources/2026-11-21-au-resident-return-visa-155-157.html`（sha256 `af071d452dd84af5dbcbd3672dd41f8745da6021476e0c4af5ba024b35e7bfb3`）。

- `Eligibility → Meet our residence, substantial ties, or member of the family unit requirements` 中的 `Option 1: Present in Australia for 2 of the last 5 years`：2 年按 730 个累计在澳日计算，5 年从 RRV 递交日倒数；入境日与出境日都计为在澳，同日出入境只计一天，在澳的部分日按整日计。符合者获 5 年旅行便利。

## SRC-067 入籍（永久居民）

任务 83 重新抓取同一官方页面。2026-11-21 历史快照为 `policy-sources/2026-11-21-au-citizenship-permanent-resident.html`（sha256 `312c97ec6555e1007a3557412cf96fde445f1e57915cfb7e73418e3e4cbb049d`）。

- `Residence requirement → Meet the general residence requirement`：申请前 4 年持有效签证在澳，最后 12 个月持永久签证，4 年内出境合计不超过 12 个月，其中最后 12 个月不超过 90 天。符合条件的 SCV 444 持有人与部分新西兰 189 签证持有人另有起算方式，试点不建模。官方 Residence Calculator（https://immi.homeaffairs.gov.au/help-support/tools/residence-calculator ）只作估算参考。

## SRC-068 入籍一般居住要求 SOP（FOI 公开）

- `policy-sources/2025-09-15-au-sop-general-residence-requirement-foi.pdf` → <https://www.homeaffairs.gov.au/foi/files/2025/fa-250801434-document-released.PDF>
- 内部操作程序经 FOI 公开，部分内容按 s. 47E(d) 删节，版本记录页未公开。`p<N>` 指 PDF 页序。
- `p5 §3.3`：出境须以此前曾在澳为前提，首次入境未满 4 年不能满足居住要求。`p6` 情景（Mr Barnaby）以 365 天作为"12 个月"的出境上限，两次出境分别记 296 天和 67 天，即入境日减出境日。同页正文称入境日与出境日都计为在澳，按此两次出境应为 295 天和 66 天，两者相差每次一天。引擎按正文计，并另列按示例算出的日期，见 PD-084。

## SRC-069 Migration Act 1958

- 快照取 legislation.gov.au 该版本 EPUB 的第 1 个正文文件，版本 Compilation No. 172（Compilation date 2026-10-08）。
- ss 41(2)(a)、41(2A)、46(1A)(a)–(d) 规定，申请人自最近一次入境以来所持签证若附有禁止取得拟申请签证的条件，境内递交时须已获豁免。SRC-200 卷 3 Sch 8 列出条件 8503、8534、8535、8540 各自限制的签证，卷 2 第 600.612 条要求 Sponsored Family 类 600 签证附加 8503。
- ss 5(1)、46(1)(d)(i)、48(1)、(1A) 规定，在 migration zone 内没有实质签证，最近一次入境后本人或他人代为申请的签证遭法定拒签，或其签证按列明条款被撤销时，只能申请 reg 2.12 列明的类别。拒签尚在复审也计入。拒发过桥签或依据 ss 501、501A、501B 作出的拒签不计入此项。撤签限 ss 109、116、133A、133C、134、137J、137Q。ss 48(1B)–(3) 规定视为连续在境内的情形，包括持过桥签离境并再入境。
- `s82(2)`：另一份实质签证（特殊目的签证除外）生效时，原实质签证终止；`s82(2AA)` 另有船员签证的例外。`s82(3)`：其他签证（特殊目的签证、船员签证除外）生效时，bridging visa 终止。引擎据此让每份签证在下一份（实质签证，或对 bridging visa 而言任何签证）生效前一天结束，同日生效的按录入顺序；问卷不收特殊目的签证、船员签证和 ETA。`s68(4)` 下部分 bridging visa 可恢复生效，试点不建模。
- `s82(5)`–`(6)`：带有效期旅行便利的签证，期满时不在澳，或期满后离境，即终止。引擎对旅行便利为 5 年的永久签证（100.511、186.511、189.511、190.511、191.511、801.511），按完整出入境记录判断：期满当天结束时不在澳（包括尚未入境）即在当天终止，否则在期满后第一次出境当天终止。

## SRC-070 Citizenship Act 1977（新西兰）

- 任务 84 的普通、特殊在境判断引用本快照 s8；s9、s9A 及宣誓程序另见 SRC-231 的 DIA 指引与 SRC-232 的申请说明。
- `policy-sources/2026-06-06-nz-citizenship-act-1977-s8.html` → <https://www.legislation.govt.nz/act/public/1977/61/en/latest/>
- legislation.govt.nz 对脚本请求返回 AWS WAF 质询（HTTP 202、空正文），快照是在浏览器中打开现行版（Version as at 6 June 2026）后只保存的 s8 节选（元素 `DLM443855`）。每周核对对这条会报 changed 或 fetch failed，需在浏览器里人工核对版本日。
- `s8(1)(a)`：年满 16 岁。`s8(2)(a)`：申请时依 Immigration Act 2009 可无限期留在新西兰。`s8(2)(b)`：申请日前 5 年内在新西兰合计不少于 1,350 天（i），且其中每一年不少于 240 天（ii），只算可无限期留在新西兰的日子。`s8(3)`：居留附加条件未满足或未取消的，不算可无限期留下。`s8(5)`、`s8(7)`：Crown service 视同在境、特殊情况下 20 个月内 450 天，试点不建模。法条没有规定出入境当天怎么算，见 PD-086。

## SRC-071 Immigration Act 2009（新西兰）

- s71(1)(a) 允许在境外且拟赴新西兰定居的人申请。s71(1)(b) 允许在境内持 temporary visa 或 resident visa 且不受 s150 约束的人申请。s71(1)(c) 对在管制区等指定地点申请的人规定了适用免签和法定类别要求。s71(2)–(3) 要求邀请制类别按期凭邀请递交。s71(3A) 禁止曾按 s75A 被取消居民签证的人申请。s71(4) 禁止 Interim Visa、limited visa、transit visa 持有人及依法可被遣返者申请居民类签证。s71(5) 保留部长对 s71(4) 所列人士的酌情授签权。第 71 条已核对现行法条，本站另存的 INZ RA5(a)–(b) 明载同一禁令及酌情权限（SRC-230）。[Immigration Act 2009 s71](https://www.legislation.govt.nz/act/public/2009/51/en/latest/sections/DLM1440686/)
- 任务 84 衔接居民签与永久居民签的身份和旅行权利；签发及失效后的具体路径由 SRC-072、230 的 INZ 条文规定。
- `policy-sources/2026-07-10-nz-immigration-act-2009-ss73-74.html` → <https://www.legislation.govt.nz/act/public/2009/51/en/latest/>
- 同 SRC-070，快照是浏览器中现行版（Version as at 10 July 2026）的 s73–s74 节选（元素 `DLM1440688`、`DLM1440689`），每周核对需人工处理。
- `s73`：永久居民签证持有人可随时前往新西兰、获准入境并无限期居留。`s74(1)`：居民签证持有人可前往新西兰并申请入境许可，获准入境后可按签证条件无限期居留；`s74(2)`：前往新西兰须符合签证的旅行条件。法条没有写旅行条件到期时人在境外，居民签证是否随之失效，见 PD-088。

## SRC-072 Immigration Instructions（新西兰移民局操作手册）

- 任务 84 复用本编号的 RV 条文与 R5.66，并登记本次 R5.66 快照。两个 R5.66 版本的条文相同，手册导航有更新。RV3、RV4 与 RV1.25 的补充原文见 SRC-230。
- `policy-sources/2026-08-12-nz-ops-r5-66.html` → <https://www.immigration.govt.nz/opsmanual/44894.htm>
- 新西兰的 Immigration Instructions 相当于英国的 Immigration Rules，按段落号定位，如 `RV2.5.1`。各页底部的 `Effective` 日期即快照文件名中的日期。
- `RV2.5`：(a) 申请时持居民签证且已连续持有满 24 个月（或申请前 90 天内曾持有、到期前已连续持有满 24 个月）；(b) 首次以居民身份在新西兰之日（R5.66.1）在申请前至少 24 个月；(c) 以 RV2.5.1–RV2.5.20 任一方式表明对新西兰的承诺；(d) 满足 s49(1)、s50 条件；(e) 品格。`RV2.5.1`：申请前 24 个月的两个 12 个月里，各以居民身份在新西兰合计不少于 184 天。`RV2.5.5`：两个 12 个月里各不少于 41 天，且申请前 24 个月具有税务居民身份（RV1.15.10）。`RV2.5.10`–`RV2.5.20`（投资、经营、在新西兰安家）试点不建模。
- R5.66.5(b)(i)–(ii) 以获签时所在地确定首个居民日。境内获签取获签日，境外获签取首次凭该居民签获准入境之日。RV2.5(b) 从该日计算永居首入条件。[INZ R5.66](https://www.immigration.govt.nz/opsmanual/44894.htm)
- `RV2.10`：Migrant Investment、Parent Retirement、Active Investor Plus 类别的居民签证转永居，看是否已满足投资条件，不看在境天数。
- `RV1.15.5` 注：以居民身份在新西兰的期间，入境日与出境日都计入。
- `RV1.5`：居民签证持有人离开新西兰时签证已没有有效的旅行条件，或旅行条件在其身处境外时到期，居民签证即失效（法条依据为 Immigration Act s63(2)，试点未存档该条）。失效后可在 90 天内以前持有人身份申请永久居民签证（RV2.5(a)(ii)），或按 RV4 另行申请居民签证。`RV3.1` 另规定只有签证仍有效时才能变更旅行条件（试点未存档该页）。
- `RV1.20`：随同居民签证获批的伴侣、子女（non-principal applicants），主申请人持永久居民签证是唯一条件，例外是 RV2.1 排除、须单独评估（RV1.20.1–RV1.20.20）、从未以居民身份到过新西兰（RV1.5(d)）或不符合品格要求。
- RV1.20(a)–(b)、RV1.20.5 区分原主申与原随同者。其 Andrea 示例另按 R2.1 判断子女能否同表。后来独立获居民签的家属按本人记录评估。RV1.20(a)(ii) 将特定投资类原主申获签后出生、其后获 Dependent Child Resident Visa 的子女列为随同者，须已持该签入境。[INZ 永居说明，Including family in your application](https://www.immigration.govt.nz/visas/permanent-resident-visa/)
- `R5.66.1`：境外获批的，首次入境须在获批后 1 年内（萨摩亚配额、太平洋准入类别为 3 个月，试点不建模）。`R5.66.5`：多次入境的旅行条件自首次以居民身份在新西兰之日起 2 年；父母类 10 年、宗教工作者 5 年、Active Investor Plus 的 Growth 类 4 年、Balanced 类 6 年。首次以居民身份在新西兰之日，是在新西兰境内获批的获批日，或境外获批后首次凭该签证获准入境之日。超出旅行条件再前往新西兰、又不符合永久居民签证的，可申请变更旅行条件（RV3）。旅行条件的最后一天按哪天算，见 PD-087。

## SRC-073 新西兰官方说明

- 任务 84 复用 Visa Pak 588 与 DIA 的逐日在境规格，并补存档本次 govt.nz 在境与附加条件说明。
- `policy-sources/2026-11-23-nz-govt-citizenship-presence.html` → <https://www.govt.nz/browse/passports-citizenship-and-identity/nz-citizenship/requirements-for-nz-citizenship/presence-requirements/>
- `policy-sources/2026-11-21-nz-religious-worker-resident-visa.html` → <https://www.immigration.govt.nz/visas/religious-worker-resident-visa/>
- `policy-sources/2024-07-18-nz-visa-pak-588-prv-periods.pdf` → <https://www.immigration.govt.nz/assets/inz/documents/visa-paks/visa-pak-588.pdf>
- `policy-sources/2021-12-15-nz-dia-oia-2122-0423-presence-calculator.pdf` → <https://www.dia.govt.nz/diawebsite.nsf/Files/OIA-releases/$file/OIA-2122-0423.pdf>
- govt.nz `What are the presence requirements?` 第 2 条：5 年从申请当天往回数；每个 12 个月不少于 240 天、5 年合计 1,350 天；任一 12 个月出境超过 4 个月、或 5 年内出境合计超过 15 个月，就可能不满足。第 1 条（"至少过去 5 年以新西兰居民身份生活"）是对 s8(2) 的概括，引擎按法条的天数计算；同条写明父母类居民签证的条件可能为 5 年或 10 年，须满足或取消后才能申请入籍。页面附有官方 Presence calculator（https://dia.services.govt.nz/presence-calculator/ ），它调取移民局出入境记录计算；页面本身没写计法，2021 年的计算器规格已依 OIA 公开（见下）。
- Visa Pak 588（PDF 2 页）：永久居民签证的 12 个月按 365 天、24 个月按 730 天计；两个 12 个月从递交日往回各数 365 天，不含递交当天（例：2024-05-19 递交，两段为 2023-05-20 至 2024-05-18、2022-05-20 至 2023-05-19）。同页示例：没有有效旅行条件时离境，居民签证于离境次日失效（法条写的是离境时；模拟日期没有时刻，引擎按示例取次日）。
- OIA 21/22-0423（PDF 12 页，内政部依信息公开申请发布的在境计算器规格）：p9–p10 示例中离境日与返回日都不计入在境外的天数（2015-05-01 离境、2015-06-20 返回记 49 天），5 年窗口取申请日之前、不含申请日（1,826 天），每一年按申请日往回划分；Step 4c 每一年须在境不少于 240 天。p8–p9 的五年合计示例有一处算术出入（1,826 − 124 应为 1,702，文中写 1,703），不影响计法。PD-086 据此确定。
- Religious Worker Resident Visa 页面（immigration.govt.nz 拒绝脚本请求，快照为浏览器中保存的节选）：`Staying longer → Getting a Permanent Resident Visa` 自成为居民起满 5 年可申请永久居民签证，并须先满足、取消 s49 条件；`While you are in New Zealand → Travel` 旅行条件 5 年，到期时人在境外签证随之失效。每周核对对该页会报 fetch failed。

## SRC-074 Citizenship Act（加拿大）

- 快照取 laws-lois.justice.gc.ca 的 section 页面（Act current to 2026-10-29，last amended 2025-12-15）。2025-12-15 的修订（S.C. 2025, c. 5）改的是 citizenship by descent（s3 等），s5 只改了 (5)(a) 的措辞，s5(1)(c)、(1.001)、s21 不变。
- `s5(1)(c)(i)`：申请日前 5 年内实际在加拿大至少 1,095 天；`s5(1)(c)` 还要求是永久居民、无未履行的永居条件；`(iii)` 5 年内 3 个税年按要求报税。`s5(1)(b)` 的年龄要求已于 2017 年废止。`s5(1)(d)`–`(e)`：申请日 18 岁以上、未满 55 岁的须有语言能力与公民知识。`s5(1.001)`：(a) 成为永久居民前以临时居民或受保护人身份在加拿大的每一天计半天，最多 365 天；(b) 成为永久居民后每天计 1 天。`s5(1.01)`–`(1.03)`：随军人、公务员在境外视同在加拿大。`s21`：缓刑、假释、服刑期间不计。

## SRC-075 Immigration and Refugee Protection Act（加拿大）

- 快照取 laws-lois.justice.gc.ca 的 section 页面（Act current to 2026-10-29）。s28 自 2005 年以来未改。
- `s28(1)`：每个 five-year period 都须满足居住义务。`s28(2)(a)`：该 5 年内至少 730 天 (i) 实际在加拿大，或 (ii)–(iv) 在境外陪同公民配偶或父母、受雇于加拿大企业或公共部门、陪同这样的永久居民。`s28(2)(b)`：(i) 成为永久居民不满 5 年的，看成为永久居民后的首个 5 年能否满足；(ii) 满 5 年的，看审查前的 5 年是否已满足。`s28(2)(c)`：人道理由的裁量。

## SRC-076 入籍资格（IRCC）

- `Have enough physical presence`：资格期是签署申请日前 5 年，其中须至少 730 天为永久居民；坐牢、假释、缓刑、等待难民申请决定的时间不计；受保护人自申请获批起算。语言与考试按签署日年龄 18 至 54 岁判断。canada.ca 对 Node 的请求返回 HTTP/2 流错误，每周核对会报 fetch failed，需人工核对。

## SRC-077 入籍实际居住的计算（IRCC）

- PDI `Calculating physical presence for applications received on or after October 11, 2017`：离开与返回加拿大的日子不算缺席；2 月 29 日按普通日计；示例保留 0.5 天（365.5）。同页 `Returning applications`：须在签署前一天满足，签署当天不计。旧规则（2015-06-11 前）只算出入境中的一天，现行不适用。
- 计算器 FAQ：A2 资格期示例（2018-04-01 申请，期间为 2013-04-01 至 2018-03-31）；A3 出入境当天不算缺席（7 月 1 日至 15 日缺席 13 天，当天往返或次日返回 0 天）。eservices.cic.gc.ca 对 Node 的请求报证书错误，每周核对需人工处理。

## SRC-078 永久居民居住义务（IRCC）

- `Permanent resident status determination`：审查日取申请正式收件日；满 5 年的只看收件日之前的 5 年；不满 5 年的从成为永久居民之日起算；当天往返不算缺席；示例注明离开与返回当天计入在加拿大。
- `Terms and definitions related to permanent residence` → `Day of physical presence`：在加拿大的任何部分日都算一整天。

## SRC-079 United States Code Title 8

- 快照取 uscode.house.gov 新路径 `/us/usc/t8/s<N>/`（旧的 view.xhtml 链接返回 404），版本为 current through Public Law 119-142（2026-11-10）。按 U.S.C. 条款定位，并注明对应的 INA 条号。
- `8 U.S.C. 1427(a)`（INA 316(a)）：取得永居后连续居住至少 5 年，递交前 5 年内实际在美合计至少一半，在递交地所在州或辖区住满 3 个月。`1427(b)`：离境超过 6 个月不满 1 年推定中断，可反驳；连续 1 年以上即中断。`1430(a)`（INA 319(a)）：公民配偶 3 年、一半时间在美、递交前 3 年婚姻同住且配偶一直是公民。`1186a(d)(2)(A)`、`1186b(d)(2)(A)(i)`：取消条件的申请在取得永居两周年前 90 天内递交；`1186a(c)(2)(A)` 未递交的在两周年当天终止。`1101(a)(13)(C)(ii)`：连续离境超过 180 天的永久居民返美时视为寻求入境。`5 U.S.C. 6103(a)`：法定公共假日（1 月 1 日、1 月第三个周一、2 月第三个周一、5 月最后一个周一、6 月 19 日、7 月 4 日、9 月第一个周一、10 月第二个周一、11 月 11 日、11 月第四个周四、12 月 25 日）；`(b)` 落在周六的以前一个周五、落在周日的以后一个周一为假日。

## SRC-080 Code of Federal Regulations Title 8

- 快照取 eCFR versioner API 的 2026-11-19 时点全文（XML）。
- `8 CFR 316.2(a)`：(1) 18 岁以上，(3) 连续居住 5 年，(4) 实际在美 30 个月，(5) 州或辖区居住 3 个月。`316.5(c)(1)`：(i) 离境 6 个月至 1 年推定中断、可反驳；(ii) 1 年以上中断，返美后 4 年零 1 天（3 年类为 2 年零 1 天）可再递交。`334.2(b)`：可在居住期满前 90 天递交。`216.4(a)(1)`、`216.6(a)(1)(i)`：取消条件的申请在两周年前 90 天内递交。`211.1(a)(2)`：绿卡用于离境不满 1 年后的返美。

## SRC-081 USCIS Policy Manual

- `Vol 12 Part D Ch 3(C)(1)`：离境超过 180 天、不满 365 天推定中断；`(C)(2)`：365 天以上自动中断，示例 2010-01-01 离境、2011-01-02 返美，最早 2015-01-03（须反驳推定），无推定的最早 2015-07-06；注 24：离境日与返美日不算在境外。`Ch 4(A)`：30 个月即 913 天，离境日与返美日都算实际在美。`Ch 6(D)`：提前递交期从首次满足连续居住之日的前一天往回数 90 天，示例 2010-06-10 → 2010-03-12。`Vol 1 Part B Ch 6(E)`：以"天"表述的递交期，最后一天是周六、周日或联邦假日的，纸质递交在下一个工作日结束前送达仍算按时；网上递交不顺延；不以天数表述的资格期限不顺延。`Part G Ch 3`：(A)–(B) 3 年连续居住、婚姻同住到递交日（法规写到面谈日，USCIS 按法条），(D) 18 个月即 548 天，(E) 提前递交只放宽连续居住，结婚满 3 年等其他条件须在递交时满足。
- `Vol 12 Part D Ch 6(D)` 与 SRC-080 `8 CFR 316.2(a)(5)`、`316.5(b)(1)(i)`、`334.2(b)` 规定，符合提前递交且三个月辖区居住期落在法定居住期内时，改按面谈前的辖区居住核对。一般及配偶路径分别适用 INA 316(a) 和 319(a)。

## SRC-082 USCIS 页面

- `When to File Your Petition to Remove Conditions`：联名的 I-751 在条件居住到期前 90 天内递交；I-829 在绿卡到期前 90 天内递交；页面计算器示例：到期 2023-06-30 → 最早 2023-04-01。
- `policy-sources/2026-11-21-us-n400instr.pdf` → <https://www.uscis.gov/sites/default/files/document/forms/n-400instr.pdf>
- `policy-sources/2024-09-12-us-cpr-joint-filing-fact-sheet.pdf` → <https://www.uscis.gov/sites/default/files/document/fact-sheets/OP%26S_Family-BasedCPR_JointFiling.pdf>
- 联名递交事实单（PDF 4 页，2024-09-12）：p2 条件居民子女在父母取得身份当天或之后 90 天内取得的，可纳入父母的 I-751；须单独递交的子女（如晚于父母 90 天以上取得）可随时递交，不必等到两周年前 90 天，前提是没有最终递解令。
- N-400 填表说明（PDF 29 页）：p3 提前 90 天递交；p8「Naturalization Testing and Exceptions」按 N-400 收件日核对英语豁免的 50 岁／累计在美 LPR 居住 20 年、55 岁／累计在美 LPR 居住 15 年；p18 实际居住表写"递交前所需连续居住期间内"在美的天数（913／548 天），与 PD-092 的保守计法相关。
- I-829 表格页：Where to File 只列邮寄地址（Dallas Lockbox）；`Forms Available to File Online` 列有 I-751、没有 I-829，即 I-829 只能纸质递交，USCIS 只在工作日收纸质件（SRC-081 Vol 1 Part B Ch 6(E)）。
- [Forms Available to File Online，Upload Completed PDF Online，Form I-485](https://www.uscis.gov/file-online/forms-available-to-file-online) 分列可单独网申的亲属、职业和 VAWA 类别，以及可同包网申的 I-130、I-140。I-130 同包需律师或获认可的代表，I-140 同包另允许符合条件的自请人。VAWA 可在 I-360 已递交后单独网申 I-485。清单未列难民／庇护、SIJ 或 EB-5 类 I-485。Form N-400 栏规定申请减费或免缴费的用纸申。I-751 栏列 PDF 网申，I-912 栏亦列可与 I-751 一并上传。
- `International Travel as a Permanent Resident`：离境超过 1 年须有回美证，回美证有效期 2 年；在外超过 2 年可考虑申请返美居民签证 SB-1。

## SRC-083 Real Decreto 1155/2024（外国人法实施条例）

SRC-083 BOE · RD 1155/2024 合并 PDF，仓库第 18 阶段同版。

- `policy-sources/2026-09-22-es-rd1155-2024-reglamento-extranjeria.pdf` → <https://www.boe.es/buscar/pdf/2024/BOE-A-2024-24099-consolidado.pdf>

- BOE 合并文本自注仅供参考、无法律效力，有效力的是公报原文；条例 2025-05-20 生效，RD 316/2026 修订了其他章节，没有改第 X 编（长期居留，art. 175–189）与 art. 201。`p<N>` 指 PDF 物理页序。
- `art. 183.1`（p133）：申请前 5 年在西班牙合法、连续居留，可取得国内长期居留。`art. 183.2`（p133–p134）：单次不超过 6 个月、5 年内合计不超过 10 个月的出境不影响连续性，非正常出境除外；因工作出境合计上限 18 个月；不可抗力与 NGO 合作者另有例外。`art. 183.3` 列出可直接取得的情形。`art. 176` 为长期居留-欧盟，学习停留按一半计入（国内版没有这一句）。`art. 48.2`（p39）只就免签短期停留规定入境日为第一天、出境日为最后一天。`art. 201` 规定取得后离开欧盟连续 12 个月可被宣告失效。

## SRC-084 Código Civil（民法典）

SRC-084 BOE · Código Civil 合并 PDF，仓库第 18 阶段同版。

- `policy-sources/2025-01-03-es-codigo-civil.pdf` → <https://www.boe.es/buscar/pdf/1889/BOE-A-1889-4763-consolidado.pdf>

- BOE 合并文本，`p<N>` 指 PDF 物理页序。
- `art. 5.1`（p14）：按月或年计的期间"de fecha a fecha"（从某日到对应日），到期月没有对应日的，以该月最后一天为准。引擎的年、月加减即按此计（2 月 29 日加年数取 2 月 28 日）。
- `art. 22.1`（p21）：按居住入籍一般 10 年；难民 5 年；伊比利亚美洲国家、安道尔、菲律宾、赤道几内亚、葡萄牙原始国籍公民及塞法迪人 2 年。`art. 22.2`：在西班牙出生、与西班牙公民结婚满 1 年且未分居等情形 1 年。`art. 22.3`：居留须合法、连续、紧接申请之前，没有规定缺席天数。`art. 23.b`：须声明放弃原国籍（art. 24.1 所列国家的原住民与原籍西班牙的塞法迪人除外，范围比 art. 22.1 的两年路线窄）。`art. 25.1.a`：入籍后 3 年只使用已放弃的国籍会丧失西班牙国籍。

## SRC-085 西班牙官方说明

SRC-085a Administración General del Estado · Adquisición de la nacionalidad。

- `policy-sources/2026-11-21-es-administracion-gob-adquisicion-nacionalidad.html` → <https://administracion.gob.es/pag_Home/Tu-espacio-europeo/derechos-obligaciones/ciudadanos/residencia/obtencion-nacionalidad>

SRC-085b 移民部 · Hoja 49，国内长居。

- `policy-sources/2026-11-21-es-hoja49-larga-duracion-nacional.html` → <https://www.inclusion.gob.es/web/migraciones/w/49.-autorizacion-de-residencia-de-larga-duracion-nacional>

- administracion.gob.es：只有外国人法规定的居留许可才算入籍所需的合法居留（"Los únicos títulos válidos…"）；原路径 301 跳转，快照为跳转后的页面。
- Hoja informativa 49：国内长期居留须 5 年连续合法居留，出境单次不超过 6 个月、合计不超过 10 个月，因工作合计不超过 18 个月；页面自注仅供参考。

## SRC-086 希腊移民法典 ν. 5038/2023

- ν. 5079/2023 第 97(3) 条修订第 179 条，法典一般自 2024-03-31 施行，另列提前生效的条款。`policy-sources/2023-12-22-gr-fek-a215-2023-n5079.pdf`（SHA-256 `e10a5687796f2ba07481dc63484f79b1113b2ca15894f555eca4ecc401a191e3`）。[官方公报](https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2023/20230100215.pdf)

- 快照为国家印刷局官方存储的 ΦΕΚ 原文（search.et.gr 检索结果直接链接；www.et.gr 跳转到证书不符的地址，无法直接下载）。`p<N>` 指 PDF 物理页序，印刷页码 = 4102 + 物理页。移民法典没有官方现行汇编，现行条文由原文加 SRC-087 的修订拼出。
- 第 93(1) 条（p61，公报第 4163 页）允许符合入境规定的希腊公民家属申请 Ο.3 首卡，同时要求申请人在希腊稳定居住（σταθερής διαμονής τους στη χώρα）。[官方公报](https://api.et.gr/apiFEK/1/2023/81/pdf#page=61)
- `άρθ. 143 παρ. 2`（p91）：长期居留一章不适用于持学习许可、临时或其他形式保护、庇护申请未决、"临时居留身份"、外交领事身份者；法典没有定义"临时居留身份"，只在 άρθ. 4、67 把凭国家签证的居留（Ζ）称为临时居留。`άρθ. 95 παρ. 1`（p64）：投资类许可首次 5 年、可按同样年限续期，离境不妨碍续期。`άρθ. 148`（p93）：离开欧盟连续 12 个月及以上、或离开希腊超过 6 年，失去长期居民身份。

## SRC-087 希腊移民法典的修订

- `ν. 5100/2024 άρθ. 64`（άρθ. 100 παρ. 1 在 p48、παρ. 4 在 p49）重述 `άρθ. 100`：Β.5 许可 5 年、可续期；续期年限相同，须仍持有房产，离境不妨碍续期；投资门槛不在试点范围。
- 同法第 64(1) 条重述的第 100(6) 条末句要求经产权转让取得房产者在首签时提供投资者的 Ε9 副本（p49，公报第 1199 页）。第 69(1) 条规定自公布日 2024-04-05 起施行。此前 SRC-086 原第 100(6) 条（p69，公报第 4171 页）及 SRC-356 第 31 条第 2.1 项列出了公证和登记等材料，均未列 Ε9。[官方公报](https://www.aade.gr/sites/default/files/2024-04/%CE%9D%20_5100_2024_A_49.pdf#page=49)
- `ν. 5275/2026 άρθ. 12`（p18，印刷页 450）改 `άρθ. 11 παρ. 1`：续期在到期前 2 个月内递交；逾期最迟到期后 3 个月，每逾期一个月罚款 100 欧元。同法 άρθ. 52（p51–p52）规定部分积压续期从递交到新许可生效的期间同时计入 Μ.1 和 Μ.2。同法 άρθ. 29 改 άρθ. 95 παρ. 2（家属许可与主申请人同日到期，子女满 21 岁另发许可），άρθ. 37 新增 άρθ. 160 παρ. 1 η（连续 12 年合法居留可证明融入）。
- ν. 5275/2026 第 38 条重述第 161(5)、(7) 条。普通 Μ.2 到期转 Μ.1 须核离境与长期居民收入，出生／学籍类可按本类别续期。第 45(18) 条明确，依 ν. 4251/2014 获发的十年卡申请续期及转长期居民，适用递件时的第 161 条。第 69 条规定自 2026-02-06 公布日起生效。[第 38 条，p40](https://api.et.gr/apiFEK/1/2026/17/pdf#page=40) · [第 45(18) 条，p46](https://api.et.gr/apiFEK/1/2026/17/pdf#page=46) · [第 69 条，p63](https://api.et.gr/apiFEK/1/2026/17/pdf#page=63)
- `ν. 5307/2026 άρθ. 179`（p93，印刷页 4217）重述 `άρθ. 144`：παρ. 1 申请前紧邻的 5 年合法且不间断居留；παρ. 2 άρθ. 143 παρ. 2 ε、στ 所列期间不计，学习或职业培训期间只按一半计；παρ. 3 单次短于 6 个连续月、5 年内合计不超过 10 个月的缺席计入 5 年。
- 国家印刷局存储可直接下载，每周核对可自动比对。

## SRC-088 希腊国籍法典 άρθ. 5

- `ν. 3838/2010 άρθ. 2`（p2）：άρθ. 5 παρ. 1 α 递交时已成年；δ 申请前连续 7 年合法居留；ε 申请时须持清单内的居留身份。`ν. 4674/2020 άρθ. 94`（p51）：3 年类别为欧盟成员国公民、与希腊人结婚并有子女者、对在希腊出生的希腊籍子女有亲权者、无国籍人。`ν. 4531/2018 άρθ. 31 παρ. 3`（p119）：持其他非临时居留许可的，连续 12 年合法居留。法典没有规定"连续"允许多少缺席。

## SRC-089 希腊内政部说明

- 编纂版（p8–p10）与上列 ΦΕΚ 一致，用于核对现行 άρθ. 5 全文。《归化的形式与实质条件》（p1–p2）：可接受的身份含"投资活动许可、房产所有人许可或投资者永久居留许可"；临时居留身份不能用于申请归化。ypes.gr 对脚本请求返回 403，每周核对需人工处理。清单（άρθ. 5 παρ. 1 ε αθ）只点名旧法（ν. 4251/2014）下的投资者许可，新法 Β.5 是否同样认可没有部长决定，见 PD-105。

## SRC-090 西班牙行政程序法 Ley 39/2015

SRC-090 BOE · Ley 39/2015 行政程序法 PDF。

- `policy-sources/2024-11-06-es-boe-ley39-2015.pdf` → <https://www.boe.es/buscar/pdf/2015/BOE-A-2015-10565-consolidado.pdf>

- `policy-sources/2024-11-06-es-boe-ley39-2015.pdf` → <https://www.boe.es/buscar/pdf/2015/BOE-A-2015-10565-consolidado.pdf>
- art. 30（p29–p30）：期间按日计时为工作日，周六、周日与法定节假日不计（30.2）；按月计的期间到起算日在届满月的同一日结束（30.4）；最后一天不是工作日的，顺延到下一个工作日（30.5）。节假日由国家与各自治区每年公布（30.7）。

## SRC-091 Irish Nationality and Citizenship Act 1956（编纂版）

- `policy-sources/2026-06-12-ie-ina-1956-revised.pdf` → <https://revisedacts.lawreform.ie/eli/1956/act/26/revised/en/pdf?annotations=true>
- LRC 编纂版（Revised Acts）是行政汇编，页首注明截至 2026-11-11 已收录全部已知生效的修改；irishstatutebook 目录显示 s15A 最后一次修改为 18/2023，s15B–15E 由 18/2023 插入，s16A 最后一次修改为 9/2026 s295(b)，此后没有新条目。`p<N>` 指 PDF 物理页序（物理页 = 页脚印刷页码 + 1）。
- `s15(1)(c)`（p19）：申请日前 1 年在国家（the State）连续居住，此前 8 年内累计居住 4 年；(a) 成年、(b) 品格、(d) 意愿、(e) 效忠声明不在试点范围。`s15A(1)(c)`（p20）：与爱尔兰公民结婚或缔结民事伴侣满 3 年并同住；`s15A(1)(e)–(f)`（p21）：申请日前 1 年在爱尔兰岛连续居住，此前 4 年内累计 2 年。`s15C`（p23）：计算 1 年连续居住时，不在境内累计不超过 70 天的期间算居住，部长认定例外情况（(5) 列六类）时可再加不超过 30 天；(2) 同样适用于 s15A；(5) "day" 不含不足一日。`s16A(1)`（p26）：无有效许可的居留、为学习给予的许可、仅凭 IPA 2015 s16(1) 留在境内的国际保护申请人，以及 (d) 项所列期间，均不计入。
- LRC 与 irishstatutebook 的 HTML 页面带"截至某日"的动态说明，每周核对可能报 changed，需人工核对正文。

## SRC-092 Courts and Civil Law (Miscellaneous Provisions) Act 2023 s8

- `policy-sources/2023-07-28-ie-si-389-2023-commencement.pdf` → <https://www.irishstatutebook.ie/eli/2023/si/389/made/en/pdf>
- s8 在 1956 年法插入 s15B–15E，s15C 即 70 天加 30 天的缺席规则；s15E(1)：生效前已提交未决的 s15、s15A 申请按修改后的条文处理。S.I. No. 389/2023 第 3 条（p2）：Part 2 自 2023-07-31 施行。

## SRC-093 International Protection Act 2026 s295

- `policy-sources/2026-06-10-ie-si-244-2026-ipa-commencement.pdf` → <https://www.irishstatutebook.ie/eli/2026/si/244/made/en/pdf>
- s295(b) 给 s16A(1) 加 (d) 项：Regulation (EU) 2024/1348 意义下的申请人、IPA 2026 Part 11 遣返决定对象、保护身份被撤销且已生效者、依 s236(1)(e) 获准留下者，这些期间不计入。没有改动年限。S.I. No. 244/2026 第 2 条（p2）：自 2026-06-12 施行（第 303 条 (f) 项除外）。

## SRC-094 Interpretation Act 2005（爱尔兰）

- `policy-sources/2005-10-17-ie-interpretation-act-2005.pdf` → <https://www.irishstatutebook.ie/eli/2005/act/23/enacted/en/pdf>
- `s18(h)`（p10）：期间从某日起算时含该日，截止于某日时也含该日。附表 Part 1：`"month"`（p14）指日历月；无限定的 `"year"`（p15）指 1 月 1 日起的 12 个月。s15 的"one year's … immediately before"有限定语，试点按滚动年读，与 ISD 示例一致。试点据此计算 Stamp 4 升级的"满 21／57 个月"。

## SRC-095 ISD 入籍指南与居住计算器

- Guide `70 Days Absence Rule`：递交日前 12 个月内在境外不超过 70 天，示例 2025-11-11 递交看 2024-11-11 至 2025-11-10；出境与回来当天不算缺席；另 30 天按个案由部长决定；超过 100 天"no discretion whatsoever"，不合格。`What is 'Reckonable Residency'`：1 年连续加此前 8 年内 4 年（1,460 天），"Leap years add an extra day"；许可到期形成的空档（"even short gaps"）不计。`70 Days Absence Rule` 节下的 `Time That Does Not Count` 只列 Stamp 2 或 2A、无有效许可的期间、等待保护决定的期间（与 s16A(1) 一致），试点据此把其他有效许可（如 Stamp 4 EUFam、4D）的居住计入。`Time that Counts Towards Citizenship` 与 `Permissions that do not count as reckonable residence`：Stamp 0、1（含 CSEP、ICT、研究员）、1G、3、4、5、6 与获批后的保护身份计入；Stamp 2、2A、无许可期间、等待保护决定的期间不计。`Reckonable Residence for Spouses/Civil Partners of Irish Citizens`：岛内连续 1 年、70/30 规则、5 年内共 3 年、婚姻同住 3 年。
- 计算器页 Guidelines：1825 或 1826 天，即递交前 365 天（含 2 月 29 日时 366 天）加此前 8 年内 1460 天（含 2 月 29 日的年份各加 1 天）。计算器本体：配偶路径"Your target is 1095 or 1096 days over 5 years"，并提示计算结果不构成决定。
- 计算器脚本 global-new.js 与法条、指南示例不同的实现细节（试点不照搬）：许可天数两端都计，许可覆盖递交日时把递交当天也算 1 天；连续年判定为 `numContinuousDays > 364`；闰日按每段许可覆盖的 2 月 29 日统计，不裁剪到窗口，表只到 2020-02-29；只排除 Stamp 2、2A。
- ISD 页面为 WordPress 动态页面，每周核对可能报 changed，需人工核对正文。

## SRC-096 ISD：各类 Stamp 与 Stamp 4 升级

- `Immigration permission/stamps`：Stamp 1、1H、1G、3、4、5 计入入籍，Stamp 2、2A 不计入；`Stamp 1G` 第 2 类（CSEP 持有人或 Hosting Agreement 研究员的配偶、事实伴侣）每年续期，"after 5 years on a Stamp 1G, you may apply for a Stamp 4"。`Stamp 4` 的示例写"2 years""5 years"，比升级页粗略，以升级页为准。
- `Information on Stamp 4 upgrades` → `Eligibility criteria`：自在境内开始受雇满 21 个月（(i) CSEP、(ii) Hosting Agreement 研究员、(iii) NCHD 医生的多地点 GEP）或满 57 个月（(iv) GEP、(v) ICT）可续为 Stamp 4；21 个月时 (iv)(v) 与 (i)–(iii) 不可互换；开始受雇日按 Revenue 的 Employment Detail Summary，先持其他许可后转 Stamp 1 的按该雇佣许可的有效期；升级后的 Stamp 4 每 2 年（i–iii）或每年（iv–v）续期。
- `Update to eligibility requirements for Stamp 4 upgrades`（2024-04-03）：GEP 改为满 57 个月，没有提到 ICT。升级页列有 (v) ICT，其页面元数据 `datePublished` 为 2025-07-22、`dateModified` 为 2026-02-25；发布日不能证明当时已列 ICT，存档文本只能确认到 2026-02-25。试点把 2024-04-03 与 2026-02-25 分别作为该规则对 GEP、ICT 可确定适用的最早日期（PD-116，任务 72，review72-1）。
- `Attention eligible spouses and partners of General Employment Permit and Intra-Corporate Transferee Irish Employment Permit holders`（2024-05-15，2026-11-23 抓取）：GEP、ICT 许可持有人经家庭团聚获批的配偶、伴侣改发 Stamp 1G（原为 Stamp 3），已持 Stamp 3 的自 2024-05-15 起按 1G 条件；`Summary of immigration conditions attached to a Stamp 1G permission`：每年续期，"After 5 years on a Stamp 1G, you may be eligible for a Stamp 4 permission"。通告没有说此前的 Stamp 3 时间是否计入这 5 年。
- `Frequently asked questions for joining family` 第 30 问 `When can I get a Stamp 4 permission?`（2026-11-23 抓取）：配偶、民事伴侣、事实伴侣或未成年子女"may apply for a Stamp 4 permission after you have spent 5 years or more in Ireland on a family reunification permission"，并"at your next online renewal date after becoming eligible"。试点据此只给满 5 年的时间节点，递交在其后的下一次网上续期；结合 2024-05-15 通告（这些配偶伴侣此前持 Stamp 3），试点把家庭团聚的 Stamp 3 与配偶伴侣类 1G 一起计入 5 年（PD-118，任务 72）。
- ISD 页面为 WordPress 动态页面，每周核对可能报 changed，需人工核对正文。

## SRC-097 ISD：Without condition as to time（Stamp 5）

- `policy-sources/2026-02-23-ie-isd-wcatt-application-form.pdf` → <https://www.irishimmigration.ie/wp-content/uploads/2026/02/Without-Conditions-as-to-Time-Stamp-5-editable-23-02-2026.pdf>
- 申请表（PDF 元数据修改日 2026-02-25，文件名注 23-02-2026）p1：适用于在境内合法居留满 8 年（96 个月）的非 EEA 国民；"Applications will not be accepted from persons outside the State"，也不受理当前没有居留许可者的申请。试点据此在满期那天按已录入出行在境外时，把最早递交日顺延到回国当天，并核对当天是否持有效许可（任务 72）。
- `Introduction`、`Eligibility`：合法居留满 8 年（96 个月）可申请 Stamp 5，只按护照印章或过期 IRP 卡计算；计入 Stamp 1、1H、1G、3、4、4D、4S，不计 Stamp 4 EuFam、0、2、2A、1A、ICT 的 Stamp 1、ICT 配偶或家属的 1G、口岸临时许可、已注销许可（页面注明清单仅为示例）。FAQ `What are the conditions attached to my Stamp 5 permission`：连续居住允许合理的缺席，"for Without Condition As To Time endorsement, does not exceed more than 4 months in a year"。
- ISD 页面为 WordPress 动态页面，每周核对可能报 changed，需人工核对正文。

## SRC-098 爱尔兰入籍修法草案（General Scheme 2026）

- `policy-sources/2026-09-21-ie-general-scheme-ina-amendment-bill-2026.pdf` → <https://assets.gov.ie/static/documents/cadca21c/General_Scheme_of_the_Irish_Nationality_and_Citizenship_Amendment_Bill_2026.pdf>
- Head 5（p7）拟把 s15(1)(c) 改为递交前 2 年连续居住、此前 10 年内累计 6 年；Head 6（p11）拟把 s15A 的婚姻年限改为 5 年、连续居住改为 2 年、此前 5 年内累计 3 年；Head 9（p18–p20）拟扩大 s16A 不计入的范围（含 temporary protection），其过渡条款（p20）只针对 s16A。草案没有修改 s15C，也没有为年限变化写过渡安排。
- 政府新闻稿（2026-09-09）："Increase the qualifying periods of reckonable residence from 5 to 8 years for most applicants"。Oireachtas 新闻稿（2026-11-19）：Joint Committee 当天开始立法前审查。截至 2026-11-22 尚未作为 Bill 提交，没有生效日。试点只在结果里提示，不进入计算（PD-119）。
- gov.ie 对连续请求会返回人机验证页（HTTP 405），每周核对可能报 fetch failed，需人工处理。

## SRC-100 Aufenthaltsgesetz（AufenthG）

- gesetze-im-internet 是联邦司法部与 juris 发布的现行汇编，页面自注非官方约束文本；有效力的是联邦法律公报（BGBl.）。最近两部修改法（BGBl. 2026 I Nr. 318 联邦警察法现代化、2026 I Nr. 221 防止滥用认领父子关系）按元数据不涉及本试点的时间规则，修改法正文未逐条读；recht.bund.de 对脚本请求返回 403，未存档：<https://www.recht.bund.de/bgbl/1/2026/318/VO.html>、<https://www.recht.bund.de/bgbl/1/2026/221/VO.html>、<https://www.recht.bund.de/bgbl/1/2026/111/VO.html>（GEAS 改造，改了 § 9b、§ 25、§ 26）。
- 定位按条、款、句、项（如 `§ 9 Abs. 2 Satz 1 Nr. 1`），并链接到单条页面 `https://www.gesetze-im-internet.de/aufenthg_2004/__<条>.html`。
- `§ 9 Abs. 2 Satz 1`：Nr. 1 持 Aufenthaltserlaubnis 满 5 年，Nr. 3 养老保险缴费至少 60 个月。`§ 16b Abs. 4 Satz 2`（及 Abs. 7）：学习期间不适用 § 9；`§ 16a Abs. 1 Satz 3`：企业内职业培训期间不适用 § 9，此前持 § 18a、§ 18b 许可的除外；§ 16d、§ 16f、§ 20a 也有"§ 9 findet keine Anwendung"。`§ 9 Abs. 4`：Nr. 1 出境时持定居许可而失效的，此前持许可的时间最多计 4 年；Nr. 2 未导致失效的每次境外停留最多计 6 个月；Nr. 3 学习或职业培训期间折半。`§ 4 Abs. 1 Satz 3`：适用于 Aufenthaltserlaubnis 的规定也适用于欧盟蓝卡。`§ 6 Abs. 3 Satz 3`：国家签证期间计入。`§ 85`：合法性中断不超过 1 年的可不计（裁量）。
- `§ 18c Abs. 1`：持 §§ 18a、18b、18d、18g 许可满 3 年，缴费 36 个月（Satz 1 Nr. 1、3）；在德完成职业培训或学业的为 2 年、24 个月（Satz 2）。`§ 18c Abs. 2`：按 § 18g 就业满 27 个月并在同一期间缴费（Satz 1）；有 B1 德语的为 21 个月（Satz 3）。§ 18c 没有引用 § 9 Abs. 4（见 PD-122）。
- `§ 26 Abs. 3`：持 § 25 Abs. 1 或 Abs. 2 Satz 1 许可满 5 年，此前庇护程序的时间计入（Satz 1 Nr. 1）；§ 9 Abs. 4 准用（Satz 2）；有 C1 德语的为 3 年（Satz 3 Nr. 1、3）。`§ 28 Abs. 2 Satz 1`：持家属许可满 3 年，家庭共同生活在德持续。
- `§ 9a Abs. 2 Satz 1 Nr. 1`：持居留许可在德居住满 5 年；`Abs. 3 Nr. 4`：持 § 16a、§ 16b 许可者不能申请；`Nr. 5`：临时目的的居留（"insbesondere"列出按就业条例有最长期限的 § 19c 就业、按 § 8 Abs. 2 不得延期的许可、随临时目的者的家属）不能申请，其期间也不计（§ 9b Abs. 1 Satz 2）。`§ 9b Abs. 1`：Satz 1 Nr. 1 Buchst. b 单次不超过 6 个连续月、合计不超过 10 个月的境外期间计入；Nr. 4 学习折半；Nr. 5 获国际保护的，从申请保护到获发许可的期间计入；Satz 3 其他未导致失效的出境不中断但不计入；Satz 4 其余情形出境中断。
- `§ 9 Abs. 1 Satz 1`、`§ 9a Abs. 1 Satz 1`：定居许可与欧盟长期居留是无期限的居留许可（卡上的日期只是证件有效期）。`§ 26 Abs. 4 Satz 1`：其余持第 5 节许可者"Im Übrigen"可获定居许可（裁量）。`§ 81 Abs. 4 Satz 1`：到期前申请续期或其他许可的，原许可在决定前视为继续有效。`§ 20 Abs. 2 Satz 4`：求职许可不得超出规定期限延长；`§ 20a Abs. 6`：持找工作用的机会卡（Such-Chancenkarte）期间不适用 § 9，后续机会卡不在此列。`§ 23 Abs. 2 Satz 3`：按接收承诺发居留许可或定居许可；`§ 24`（临时保护）、`§ 25 Abs. 4 Satz 1`（临时停留）均写明"vorübergehend"。`§ 9a Abs. 3 Nr. 1`：持第 5 节许可（§ 23 Abs. 2 除外）且未获国际保护者不能取得欧盟长期居留。`§ 51 Abs. 1`：Nr. 1 有效期届满即失效；Nr. 6 出于非临时原因出境即失效；Nr. 7 6 个月内（或外国人管理局定的更长期限）未返回即失效；多次入境或超过 90 天的签证不按 Nr. 6、7 失效。`Abs. 1a Satz 2`：§ 16b 学习许可、§ 18d 研究许可按指令 2016/801 在其他成员国完成部分学习或研究的，不按 Nr. 6、7 失效。`Abs. 2` 合法居留满 15 年的定居许可持有人、与德国人共同生活的配偶的例外；`Abs. 9 Satz 1` 欧盟长期居留：Nr. 3 离开欧盟连续 12 个月（之前持欧盟蓝卡的 24 个月），Nr. 4 离开德国 6 年；`Abs. 10 Satz 1` 欧盟蓝卡及其家属 12 个月。

## SRC-101 Staatsangehörigkeitsgesetz（StAG）

- gesetze-im-internet 现行汇编，定位与链接方式同 SRC-100（单条页面 `https://www.gesetze-im-internet.de/stag/__<条>.html`）。
- `§ 10 Abs. 1 Satz 1`：合法惯常居住满 5 年；Nr. 2 入籍时须持无期限居留权、欧盟蓝卡或不属所列临时目的（§§ 16a、16b 等）的许可。`§ 10 Abs. 3`：(weggefallen)，即 3 年快速入籍已删除（见 SRC-104）。`§ 40a`：过渡规定只涉及 § 10 Abs. 1 Satz 1 Nr. 3（生计），与居住年限无关。
- `§ 9 Abs. 1 Satz 1`：德国人的配偶或登记伴侣，居住满 3 年、婚姻或伴侣关系满 2 年；Satz 2 婚姻满 3 年时可因公共利益缩短居住年限（裁量）。
- `§ 12b Abs. 1`：Satz 1 不超过 6 个月的出境不中断；Satz 2 在外国人管理局定的期限内返回的不中断；Satz 3 服兵役；Satz 5 境外合计超过所需年限的一半时惯常居住"通常"终止。`Abs. 2`：中断前的居住最多可折算 3 年（裁量）。`Abs. 3`：迟交续期申请造成的合法性中断不计。

## SRC-102 期间计算（BGB、VwVfG）

- `VwVfG § 31 Abs. 1`：行政程序的期限准用 BGB §§ 187–193。`BGB § 187 Abs. 1`：以事件为起点的，事件当天不计；`Abs. 2`：以某日开始为起点的，当天计入。`§ 188 Abs. 2`：按月、年计的期限在对应日届满；`Abs. 3`：最后一个月没有对应日的，在该月最后一天届满。`§ 191`：不必连续计算的期间，每月按 30 天、每年按 365 天。
- 居留年限算不算 VwVfG 意义上的"期限"、起点当天计不计，官方文本没有说（PD-120、PD-121）。

## SRC-103 Asylgesetz § 55

- `Abs. 3`：取决于居留时长的权利，庇护程序中的居留只在获承认为庇护权人或获国际保护后才计入。§ 26 Abs. 3 Satz 1 Nr. 1 明文"abweichend von § 55 Absatz 3"计入此前的庇护程序。

## SRC-104 取消 3 年快速入籍

- `policy-sources/2026-11-23-de-bundesgesetzblatt-2025-256.pdf` → <https://www.recht.bund.de/bgbl/1/2025/256/regelungstext.pdf?__blob=publicationFile&v=3>
- BGBl. 2025 I Nr. 256 原文（<https://www.recht.bund.de/bgbl/1/2025/256/VO.html>）在第 19 阶段对脚本请求返回 403；任务 90 已补存上列原刊。此前调研时在浏览器中读了第 1 条（"§ 10 Absatz 3 wird gestrichen."）和第 6 条第 1 款（公布次日生效），公布日 2025-10-29，即 2025-10-30 生效。该法没有关于已递交申请的过渡条款（PD-129）。
- `policy-sources/2025-06-23-de-bt-drs-21-537-stag-entwurf.pdf` → <https://dserver.bundestag.de/btd/21/005/2100537.pdf>
- `policy-sources/2025-10-08-de-breg-bulletin-89-5-stag.pdf` → <https://www.bundesregierung.de/resource/blob/975954/2388128/f26afadd67ac33455496c4e532b4afcc/89-5-bmi-aenderung-staatsangehoerigeitsrecht-bt-data.pdf?download=1>
- BT-Drs. 21/537（PDF 12 页，`p<N>` 为物理页序）：p5 第 1 条只删除 § 10 Abs. 3；p6 立法理由回顾 StARModG 2024-06-27 施行前的规定；草案第 2 条（p5）与理由（p10）写"公布次日生效"。
- BMI 立法程序页：取消后一般须满 5 年；进度栏"Gesetz ist verkündet 29.10.2025"。bmi.bund.de 的 HTML 页面有 cookie 检查跳转，每周核对可能报 fetch failed 或 changed，需人工核对。
- Bulletin Nr. 89-5（PDF 3 页）p1：3 年路径"无替代地"取消。

## SRC-105 国籍法现代化法（StARModG）

- `policy-sources/2026-11-23-de-bundesgesetzblatt-2024-104.pdf` → <https://www.recht.bund.de/bgbl/1/2024/104/regelungstext.pdf?__blob=publicationFile>
- BGBl. 2024 I Nr. 104 原文（<https://www.recht.bund.de/bgbl/1/2024/104/VO.html>，更正见 BGBl. 2025 I Nr. 98）在第 19 阶段对脚本请求返回 403；任务 90 已补存上列原刊。施行日 2024-06-27 取自 SRC-106 封面与 SRC-104 BT-Drs. 21/537 p6。
- `policy-sources/2023-11-01-de-bt-drs-20-9044-starmodg-entwurf.pdf` → <https://dserver.bundestag.de/btd/20/090/2009044.pdf>
- BT-Drs. 20/9044（PDF 80 页）p40（Zu Nummer 10）：§ 12b Abs. 1 Satz 5 过半规则的理由——从使境外合计超过一半的那次中断之后重新起算；§ 12b Abs. 2 中断前居住的折算由 5 年降为 3 年，过半情形同样适用。§ 12b 的修改内容与现行汇编（SRC-101）一致，未与 BGBl. 正式文本逐字比对。

## SRC-106 BMI Anwendungshinweise zum StAG（AH-StAG 2025）

- `policy-sources/2025-05-01-de-bmi-anwendungshinweise-stag.pdf` → <https://www.bmi.bund.de/SharedDocs/downloads/DE/veroeffentlichungen/themen/verfassung/staatsangehoerigkeit/2505_anwendungshinweise-staatsangehoerigkeit.pdf?__blob=publicationFile&v=6>
- PDF 146 页，`p<N>` 为物理页序；定位用小节号加边码（Rdn.）。封面（p1）：StARModG 于 2024-06-27 施行。发布早于 § 10 Abs. 3 删除，涉及 3 年路径的段落已过时。
- `Nr. 10.1.0 Rdn. 1`（p44）：入籍前 5 年原则上不间断，入籍时也须有合法惯常居住。`Nr. 4 Rdn. 6–7`（p11–p12）：可计入的合法居留身份；Duldung 不计。`Nr. 9.1 Rdn. 4–6`（p42）：分居时年限相应延长；中断后旧居住最多折算所需年限的三分之二（即 2 年）；入籍时婚姻须满 2 年。`Nr. 12b.1.1 Rdn. 18`（p97）：各次不超过 6 个月的出境不相加。`Nr. 12b.1.5 Rdn. 23`（p98）：过半规则回溯累加，超过后从最近一次重新建立惯常居住起算。`Nr. 12b.2.1 Rdn. 24`（p98）：中断前居住的折算属裁量，最多 3 年。`Nr. 12b.3.1`（p99）：迟交续期须最终获发许可才可忽略中断。

## SRC-107 BMI Anwendungshinweise zum Fachkräfteeinwanderungsgesetz

- `policy-sources/2024-05-28-de-bmi-anwendungshinweise-feg.pdf` → <https://www.bmi.bund.de/SharedDocs/downloads/DE/veroeffentlichungen/themen/migration/anwendungshinweise-fachkraefteeinwanderungsgesetz.pdf?__blob=publicationFile&v=5>
- PDF 277 页，`p<N>` 为物理页序；法律状态为 2024-06-01 起。`Nr. 18c.2.1.1`（p117）：欧盟蓝卡就业 27 个月（B1 为 21 个月），旧法蓝卡与此前的国家签证期间计入。`Nr. 18c.2.1.3`：缴费看效果，允许补缴。`Nr. 20a.5.7`（p200–p201）：找工作用的机会卡可以再次签发，连续签发的几张较短的卡合并看待。`Nr. 20a.6.1–20a.6.2`（p201）：§ 20a Abs. 6 只排除找工作用的机会卡（Such-Chancenkarte）转定居许可，后续机会卡（Abs. 5 Satz 2）不排除；两种机会卡的期间都计入定居许可的年限。

## SRC-108 AVwV zum Aufenthaltsgesetz（2009）

- `policy-sources/2009-10-26-de-avwv-aufenthg.pdf` → <https://www.verwaltungsvorschriften-im-internet.de/pdf/BMI-MI3-20091026-SF-A001.pdf>
- PDF 390 页，`p<N>` 为物理页序。2009 年的行政规则，条文编号按当时版本（如"§ 6 Absatz 4 Satz 3"即现行 § 6 Abs. 3 Satz 3），只作解释口径参考。
- `Nr. 9.2.1.1`（p66）：国家签证期间计入 5 年。`Nr. 9.4.1.3`（p69）：旧定居折算先从此前持许可的时间里减去导致失效的境外时间，再按 4 年封顶（例：10 年减 3 年得 7 年，计 4 年）。`Nr. 9.4.2`（p69–p70）：境外期间只在持许可时可折算，最多 6 个月。`Nr. 9a.2.1.1.1`（p71）：欧盟长期居留的条件以申请时为准。`Nr. 28.2.3`（p165）：3 年从首次获发与德国人团聚的许可起算。`Nr. 51.1.6.6`（p236）：Nr. 7 的失效在期满时发生，不在出境当天；`Nr. 51.1.6.7`：延长期限不得超过许可有效期。`Nr. 85.3`（p339–p340）：中断期间本身不计入。

## SRC-109 BAMF 页面

- 《In Deutschland niederlassen》：定居许可一般须不间断持居留许可 5 年；难民含此前庇护程序 5 年。《Einbürgerung》：一般须在德惯常居住 5 年。《Die Blaue Karte EU》（标注 18.11.2023）：27 个月，B1 为 21 个月。

## SRC-110 出入国管理及び難民認定法（入管法）

- 快照为 e-Gov 法令 API v2 返回的 XML，按条、項、号定位；内容与法令页面相同。SRC-110～112 的 API 地址按法令 ID 取现行版（2026-11-22 核对，与标题所列 revision 的输出逐字节相同），法令修订后每周核对会报 changed。
- `第22条第2項`：永住许可须素行善良、有独立生计且其永住合于日本国利益；法律本身没有年数，年数都来自指南（SRC-113、SRC-114）。日本人、永住者、特別永住者的配偶者或子免除第1、2号。`第22条第4項`：许可自交付在留卡时生效。
- `第22条の2`：因出生等未经上陆手续在日本在留的外国人，第2項须自出生等之日起 30 日以内申请取得在留资格，第4項把永住者资格的取得准用第22条。
- `第26条第3項`：再入国许可的有效期自生效日起不超过 5 年；`第26条第5項`：在外延长每次不超过 1 年，且自生效日起不超过 6 年。
- `第26条の2第2項`：みなし再入国许可的有效期为出国日起 1 年，在留期限早于此的到在留期限为止；`第3項`：不能延长。特別永住者为 2 年（入管特例法第23条第2項，SRC-442）。
- 令和6年法律第60号（2027-04-01 施行）改写第22条第2項措辞并新增永住取消事由，令和8年法律第32号只改第26条第1項的引用条号；新版条文见 SRC-441。

## SRC-111 国籍法

- 快照为 e-Gov 法令 API v2 返回的 XML。
- `第5条第1項第1号`：引き続き五年以上日本に住所を有すること；`第2号`：十八歳以上で本国法によつて行為能力を有すること。
- `第7条`（日本国民の配偶者，免除第5条第1項第1、2号）：前段为连续 3 年以上在日本有住所或居所、且现在日本有住所；后段为婚姻之日起满 3 年、且连续 1 年以上在日本有住所。
- `第10条第2項`：帰化自官报告示之日生效。e-Gov 修订历史显示国籍法没有未施行修订。

- 第5条第1項第3–6号与第2項、第6–9条、第18条：完整版的品格、生计、失籍、宪法遵守、简易及特别功劳归化与申报。

## SRC-112 民法与年龄计算

- 民法 `第140条`：以日、周、月、年定期间的，初日不算入（午前零时起算的除外）；`第143条`：按历计算，在最后一年与起算日对应之日的前一日满了，没有对应日的以该月末日满了；`第138条`：法令另有规定的从其规定。入管法与永住指南没有自己的计日规则。
- 年齢計算ニ関スル法律：年龄自出生日起算，准用民法第143条，即 18 岁生日当天起满 18 岁。
- 入管厅、法务局审查"引き続き N 年"时取周年当日还是次日没有公开（PD-130）。
- 行政機関の休日に関する法律 `第1条第1項`：行政机关的休日为周六、周日，祝日法规定的休日，以及 12 月 29 日至翌年 1 月 3 日；`第2条`：向国家行政厅的申请等的期限由法律规定的期间确定、而落在行政机关休日的，以休日的次日为期限（法律另有规定的除外）。入管法第22条の2第2項的 30 日适用此条（PD-130）。
- 国民の祝日に関する法律 `第2条` 列出祝日，春分日、秋分日不在法律中固定；`第3条第2項` 祝日落在周日时其后最近的非祝日为休日，`第3条第3項` 前后两天都是祝日的日子为休日。
- 国立天文台暦要項「国民の祝日」按上述规则列出各年的祝日与休日（2023 年另有 1-2；2024 年 2-12、5-6、8-12、9-23、11-4；2025 年 2-24、5-6、11-24；2026 年 5-6、9-22；2027 年 3-22），2019–2021 年的页面已按特别法改订（2019 年即位之日 5-1、即位礼正殿之仪 10-22 及因此成为休日的 4-30、5-2；2020、2021 年奥运会改动的海の日、スポーツの日、山の日及 2021-08-09 振替休日），试点据此收录 2019–2027 年；暦要項每年 2 月发表次年。之后的年份按祝日法第2、3条推算（按上列规则推算 2022–2027 年与暦要項完全一致），春分日、秋分日取 FAQ 表1 的计算预测，页面注明只供参考、以前一年 2 月官报为准；2018 年及以前未收录（PD-130）。页面为 Shift_JIS 编码，按原始字节比较。

## SRC-113 永住許可に関するガイドライン（2026-02-24 改订）

- 页面没有锚点，按指南条目号定位。
- `1(3)ア`：原则连续在留 10 年以上，其中以就労資格（不含技能実習、特定技能1号）或居住資格连续在留 5 年以上。
- `2(1)`：日本人、永住者、特別永住者的配偶者，实体婚姻生活 3 年以上且连续在留 1 年以上；其实子等连续在留 1 年以上。`2(2)`：定住者 5 年。`2(3)`：难民或补完的保护对象者认定后 5 年。`2(6)`：高度人才 70 点维持 3 年；`2(7)`：80 点维持 1 年；`2(8)`：特別高度人材 1 年。`注1`：2027-03-31 前在留期间"3年"视同最长。
- 该版没有出境天数的标准（PD-132）。

## SRC-114 永住許可に関するガイドライン（2026-10-01 改定）及适用说明

- HTML 锚点：`#midashi02` 第2、`#midashi03` 第3、`#midashi06` 第6；PDF 的 `p<N>` 指物理页。
- `第2の5(6)`（PDF p7）：原则连续在留 10 年以上，其中以就労資格或居住資格连续 5 年以上；申请时起过去 10 年内，无合理理由单次出国半年以上不在、或通算 2 年 6 个月以上不在的，原则上消极评价。`注2`（PDF p5）：就労資格不含技能実習、育成就労、特定技能1号、企業内転勤与部分特定活動；哪些特定活動算就労资格见 `第5の2`（PDF p12）。
- `第3の1`（PDF p9）：配偶者实体婚姻生活 5 年以上且连续在留 3 年以上；实子等连续在留 3 年以上。`第3の2`、`第3の3`：定住者 5 年、难民认定后 5 年。`第3の6`、`第3の7`、`第3の8`：高度人才 70 点 3 年、80 点 1 年、特別高度人材 1 年。
- `第5の1`（PDF p12，锚点 `#midashi05`）：特定活動中"特例的、かつ、一時的"的在留不计入"10 年"，例子有继续就职活动、就职内定者、本邦大学毕业后起业活动的留学生、难民认定等手续中、因本国情势不安获准在留者；没有说这些期间前后的在留能否接续（PD-134）。2026-02-24 版没有这一条。
- `第6`（PDF p13）：本次改定适用于令和9年（2027 年）4 月 1 日以后的申请。2026-04-01 至 2026-09-30 递交的收入及公共负担两项，以 2026-10-01 仍在审为新版适用条件（同条、SRC-115 第69号）。
- 适用说明（【お知らせ】）：2026-03-31 前申请的适用 2026-02-24 版；2026-04-01 至 2027-03-31 申请的仍适用 2026-02-24 版（收入部分另按新版第2の4(2)、第2の5(7)）；2027-04-01 起申请的适用新版。
- `第2の3–5`（PDF p3–9）：品格、生计、国益、最长在留期间三年过渡（p7 注4）、日语与规则、就学。第3注5（PDF p10）列特别许可的捷径排除，第4（PDF p11）列贡献类别。
- `policy-sources/2026-10-01-jp-isa-pr-guideline-r8-10-01.pdf` → <https://www.moj.go.jp/isa/content/001471577.pdf>

## SRC-115 永住指南公众意见答复

- 别纸 PDF 8 页，`p<N>` 指物理页。`第48号`（p5）：缺席标准限于"没有合理理由的情形"，具体内容按个案判断，没有列举。`第63号`（p7）：配偶者特例延长为婚姻 5 年、在留 3 年。
- `policy-sources/2026-10-01-jp-egov-pcm-pr-guideline-annex.pdf` → <https://public-comment.e-gov.go.jp/pcm/download?seqNo=0000321729>

## SRC-116 再入国許可与连续在留

- 再入国許可页：未取得再入国许可（含みなし）出国的，原有在留資格与在留期间消灭；持再入国许可返回的，视为原在留資格与在留期间继续；普通再入国许可在现有在留期间内最长 5 年（特別永住者 6 年）。
- みなし再入国許可页：有效期为出国日起 1 年，在留期限早于此的到在留期限为止；特別永住者 2 年；在留资格取消手续中等五类人不适用。
- 继续在留通知（1 页）：因新冠未能在再入国许可或みなし再入国许可有效期内再入国、"一度在留が途切れた"的，有效期满日在 2020-01-01 至 2023-04-30 之间并在 2023-04-30 前申请的签证有效期内入境的，视为继续在留。官方据此把许可失效视为在留中断。
- 「永住者の在留資格について」p5「永住許可が失われる場合」：持再入国许可出国、未在许可期限内返回；持みなし再入国许可出国、出国后 1 年内未返回。2018 年资料，与现行第26条、第26条の2 一致。
- 出入国審査・在留審査Q&A 锚点 `#q62`（页面锚点比题号大 1，Q61 在 `#q62`）：在留期间更新（或在留资格变更）申请中，也可以持再入国许可或みなし再入国许可出国；みなし再入国的，须在原在留期间届满日起 2 个月经过之日与出国日起 1 年两者中较早者之前再入国，再入国后在 2 个月内领取结果。与入管法第20条第6項（申请中可在留至处分或届满后 2 个月）、第26条第4項（再入国许可可延至该期间）一致（PD-136）。
- `policy-sources/2022-10-07-jp-isa-pr-continuity-covid-notice.pdf` → <https://www.moj.go.jp/isa/content/930006016.pdf>
- `policy-sources/2018-09-14-jp-moj-pr-status-overview.pdf` → <https://www.moj.go.jp/isa/content/930003741.pdf>

## SRC-117 国籍Q&A 与帰化リーフレット

- Q&A 锚点 `#a09`（Q9 帰化の条件）：住所条件为申请时为止连续 5 年以上，住所须合法、持正当在留资格；能力条件 18 岁；末段要求"10年以上在留していることなど、日本社会に融和していること"。同段先说明第6–8条对日本人配偶者等放宽条件，但没有说 10 年是否同样适用（PD-137）。
- Q&A 锚点 `#a10`（Q10 帰化の手続）：本人（15 岁未满由法定代理人）须亲自到申请地的法务局递交书面申请。
- リーフレット p1 同样要求本人亲自到法务局递交；p2 同样写"１０年以上在留していることなど"。
- `policy-sources/2026-11-22-jp-moj-kika-leaflet.pdf` → <https://www.moj.go.jp/content/001459013.pdf>

## SRC-118 帰化审查运用的变更

- 法务大臣记者会见（2026-03-27）：自本年 4 月 1 日起，帰化审查的"日本社会に融和していること"要件原则上要求在留 10 年以上，以满足国籍法 5 年住所条件为前提。
- 参議院答弁書（2026-07-28）"一及び二について"：维持国籍法第5条第1項第1号的 5 年条件，运用上原则要求在留 10 年以上；"三について"：判断基准与调查事项不予公开。
- 参議院法務委員会（2026-04-14）政府参考人（法務省民事局長）发言 No.120：本年 4 月 1 日起帰化审查一般运用的变更点。
- 三份文件都只说"帰化の審査において"，没有区分第5条与第6–8条的简易帰化（PD-137）。
- `policy-sources/2026-04-14-jp-ndl-sangiin-homu-speech120.json` → <https://kokkai.ndl.go.jp/api/speech?issueID=122115206X00420260414&speechNumber=120&recordPacking=json>

## SRC-119 永住許可申請 手续页

- 按栏目名与锚点定位（`#midashi04` 为申請期間）。`手続根拠`：入管法第22条、第22条の2；永住申请是"在留資格の変更"（在日本的外国人申请变更为永住者）。`申請期間`：变更的在留期间届满日之前，申请中在留期间届满的须另行申请更新；因出生等取得的，事由发生后 30 日以内。`申請提出者`：申请人本人（日本での滞在を希望している外国人本人），或法定代理人、经批准的取次者；18 岁以上本人须自行申请（取次者除外）。页面没有直接写取次者代为申请时本人须在日本，只在在留期间更新处写明须在日本（PD-130）。
- `申請先・受付時間・相談窓口`（锚点 `#midashi09`）：受付時間为平日 9–12 时、13–16 时。
- 网上申请对象范围（PDF p1）：可网上申请的种别为在留资格认定证明书、在留资格变更、在留期间更新、在留资格取得等七种，永住许可申请不在其中；可网上申请的在留资格清单也没有"永住者"。永住申请与出生后取得永住者资格只能到窗口递交（PD-130）。
- `policy-sources/2026-01-05-jp-isa-online-scope.pdf` → <https://www.moj.go.jp/isa/content/001351658.pdf>

## SRC-120 Lei Orgânica n.º 1/2026（现行国籍法）

- 任务 92：附件 art. 3（p9）为婚姻及事实伴侣声明路径；art. 6（pp9–11／修改条文 pp2–4）列入籍实体条件、无国籍免程序费、犯罪证明及可反驳推定；art. 9–10（p12）为实际联系、公职与军役、异议例外及期限。第 11 款证明主体按同日勘误（p1）。

- `policy-sources/2026-05-18-pt-lo-1-2026-dr95.pdf` → <https://files.diariodarepublica.pt/1s/2026/05/09500/0000200020.pdf>
- `policy-sources/2026-05-18-pt-dr-retificacao-17-2026.pdf` → <https://files.diariodarepublica.pt/1s/2026/05/09500/0002100021.pdf>
- 官方公报 PDF（DRE 详情页由前端渲染，curl 只得空壳，地址取自详情页的"Descarregar PDF"）。`p<N>` 指 PDF 物理页序，与页脚"N/19"一致；附件为 Lei 37/81 的全文重新公布。
- LO 第 2 条修改的 `art. 6 n.º 1 b)`（p2）：葡语国家国民与欧盟成员国公民居住满 7 年，其他国家国民 10 年，判断时点为"no momento do pedido"；`n.º 3`（p3）：无国籍人 4 年。`art. 15 n.º 3`（p5）：合法居留期间"seguidos ou interpolados"可以相加，须落在 6、9、12 年的区间内（依次为无国籍人、葡语国家与欧盟公民、其他国家国民）；`n.º 4`（p6）"[Revogado.]"。附件重新公布的 `art. 15 n.º 1`（p14）：持外国人法规定的任何证件、签证或许可在葡萄牙的人为合法居留。
- LO 第 5 条（p7）废止 `art. 15 n.º 4`（自申请临时居留许可之日起算）；第 7 条 n.º 2（p7）：施行时仍在审理的行政程序适用修改前的文本；第 8 条（p7）：公布次日施行，即 2026-05-19。第 4 条（p7）要求 90 天内修改国籍条例。
- 更正声明只改 art. 6 n.º 11 的刑期表述，与时间规则无关。DRE 修改记录页把 LO 1/2026 注为"com efeitos a partir de 18 de maio"，与第 8 条不一致，以公报原文为准（PD-143）。

## SRC-121 Lei Orgânica n.º 1/2024（旧国籍法文本）

- 任务 92：附件 arts. 3、6、9、10、13（pp7–10）为旧制关系、成年或 emancipação、葡语、刑事、安全、异议及程序中止条件。

- `policy-sources/2024-03-05-pt-lo-1-2024-dr46.pdf` → <https://files.diariodarepublica.pt/1s/2024/03/04600/0000200019.pdf>
- 第 9 条（p5）：公布次月首日施行，即 2024-04-01。附件重新公布的 `art. 6 n.º 1 b)`（p8）：居住满 5 年；`art. 15 n.º 1`（p12）：合法居留指持外国人法规定的证件、签证或许可在葡萄牙的人；`art. 15 n.º 3`（p13）：15 年区间；`n.º 4`（p13）：自申请临时居留许可之日起算，以获批为前提。第 6 条（p4–p5）只涉及塞法迪后裔的在审申请；2024-04-01 前递交的普通入籍申请适用更早的文本，试点没有建模（PD-143）。

## SRC-122 宪法法院 Acórdão 1133/2025

- 判决 `III - Decisão` d 项宣告草案第 7 条第 3、4 款（按递交日旧法审查并定为解释性规定）违宪，最终法律删去了这两款。理由 `D.5`（第五个问题）认定废止旧 art. 15 n.º 4 合宪："com a obtenção do título de residência, inicia-se a contagem do prazo"；同节记述 2024 年前自批准临时居留许可之日起算。判决理由不是法条，起算锚点见 PD-140。

## SRC-123 Lei n.º 23/2007（外国人法）

- ARI 境外家属由担保人提出入境及居留申请，见 Lei 18/2022 附件 art. 103(1)、(3)（p81）。境内申请适用 Lei 61/2025 art. 2 修订的 art. 103(2)（p5），担保人的许可有效性及 ARI 等待期豁免见同法修订的 art. 98(1)、(3)(c)（p4）。
- 任务 92：Lei 18/2022 附件 arts. 77–82（pp65–68）、90-A（p72）、121-I、125–131（pp100–104）分别用于授予、续期、永久居留、ARI、蓝卡与 ERLD。ERLD 因缺席丧失后的恢复条件与决定期限见 art. 131(4)–(5)（p104）。投资选五项与历史过渡查 Lei 56/2023 arts. 42–44、55，蓝卡与通用拒绝的中间修订查 SRC-491。ARI 家庭团聚的资格及等待期例外见 Lei 61/2025 art. 2 对 arts. 98(1)、98(3)(c)、99、103(2) 的修订（pp4–6）。Lei 62/2026 arts. 2、4 为后续修订。

- `policy-sources/2022-08-25-pt-lei-18-2022-dr164.pdf` → <https://files.diariodarepublica.pt/1s/2022/08/16400/0000200137.pdf>
- `policy-sources/2023-10-06-pt-lei-56-2023-dr194.pdf` → <https://files.diariodarepublica.pt/1s/2023/10/19400/0000200050.pdf>
- `policy-sources/2025-02-13-pt-lei-9-2025-dr31.pdf` → <https://files.diariodarepublica.pt/1s/2025/02/03100/0000600014.pdf>
- `policy-sources/2025-10-22-pt-lei-61-2025-dr204.pdf` → <https://files.diariodarepublica.pt/1s/2025/10/20400/0000900017.pdf>
- `policy-sources/2026-09-10-pt-lei-62-2026-dr176.pdf` → <https://files.diariodarepublica.pt/1s/2026/09/17600/0006000111.pdf>
- 不另注明时，定位指 Lei 18/2022 PDF 的物理页序（p1 印"Pág. 2"），条号为附件重新公布的 Lei 23/2007。`art. 4 n.º 2 a)`（p31）：本法不适用于欧盟、欧洲经济区成员国及与欧盟有人员自由流动协定国家的国民（条文不点名瑞士，试点按此类国家处理）。`art. 3 n.º 1 v)`（p29）：合法居民指持有效期 1 年以上居留证件的外国人。`art. 3 n.º 1 d)`（p27）：投资活动须维持至少 5 年。`art. 74 n.º 1`（p65）：居留许可只分临时与永久两类；`art. 75 n.º 1`（p65）：临时居留首次 2 年、续期 3 年；`art. 76 n.º 1`（p65）：永久居留没有期限，证件定期换发。`art. 78 n.º 1`（p66）：续期最迟在到期前 30 天申请。`art. 80 n.º 1 a)`（p67）：持临时居留许可满 5 年可取得永久居留。`art. 85 n.º 2`（p69）：无正当理由出境，临时居留在许可有效期内连续 6 个月或累计 8 个月、永久居留连续 24 个月或 3 年内累计 30 个月的，许可"pode"被注销；n.º 4 在境外从事职业等活动的不注销。`art. 90-A n.º 2`（p72）：黄金签证每次续期 2 年。`art. 125 n.º 2`（p100–p101）：持学习、无薪实习、志愿许可者，临时保护、季节工、派遣与外交身份者不能取得欧盟长期居民身份。`art. 126`（p101）：n.º 1 a) 申请前紧邻的 5 年合法、不间断居留；n.º 3 学习等期间按一半计；n.º 4 单次少于 6 个连续月、合计不超过 10 个月的缺席计入；n.º 5 工作派遣的缺席照计。`art. 129 n.º 9`（p102）：欧盟长期居民身份是永久的，凭可续期的证件。`art. 130 n.º 2`（p102）：欧盟长期居民卡至少 5 年、到期自动续期。`art. 131 n.º 6`（p103）：证件过期不导致丧失身份。`art. 131 n.º 1`（p103）：离开欧盟连续 12 个月或离开葡萄牙连续 6 年失去身份。
- 其后修改只核对到与试点相关的条款：Lei 56/2023 第 42 条（p38–p39）自施行起停收房产等类黄金签证新申请，n.º 4 规定符合 art. 80 的黄金签证持有人可申请投资类永久居留，不适用 art. 85 n.º 2 b、n.º 3–4，第 44 条只废止 art. 3 n.º 1 d) 的部分目；Lei 9/2025（p4）、Lei 61/2025（p3）的 art. 75 只改第 2 款；Lei 62/2026 第 4 条改 art. 78（p7，只废第 6 款、改第 8 款）与 art. 85（p8，只改第 5 款），没有改 art. 74–76、80、90-A、125–126、131。

## SRC-124 Decreto Regulamentar n.º 15-A/2015

- `policy-sources/2015-09-02-pt-dr-15-a-2015-dr171.pdf` → <https://files.diariodarepublica.pt/1s/2015/09/17101/0000200038.pdf>
- `art. 65-B`（p3）：5 年投资维持期自居留许可授予日起算。`art. 65-C`（p3）：为续期，黄金签证持有人第 1 年至少停留 7 天，此后每个 2 年期至少 14 天，连续或分段均可。条文的期间划分沿用当时首张 1 年、续期 2 年的许可期限（PD-148）。

## SRC-125 PGD Lisboa 编纂版

- 里斯本检察院网站的编纂文本，不是官方公报；快照为 ISO-8859-1 编码的打印页。只在公报原文未取得时使用，结果里注明。
- Decreto Regulamentar 84/2007 `art. 63.º`（编纂版列出经 DR 2/2013、15-A/2015、9/2018、1/2024 修改）：n.º 14 证件到期后 6 个月内居留权不失效（AIMA 在 SRC-126 中按此条复述）；n.º 16 由 DR 9/2018 第 2 条加入，原公报见 SRC-472；DR 1/2024 未改此款，原公报见 SRC-471。
- Decreto Regulamentar 84/2007 `art. 65.º-K`（编纂版列出初版为 DR 9/2018、经 DR 1/2024 修改）：符合 Lei 23/2007 art. 80 的黄金签证持有人申请永久居留时，发给投资类永久居留，不适用 art. 85 n.º 2 b、n.º 3–4（因出境注销）。
- Código Civil `art. 279.º` b）期间起算的事件当天不计，c）按年计的期间止于对应日 24 时，没有对应日的止于该月末日；`art. 296.º` 法定期间同样适用。

## SRC-126 AIMA 页面

- ARI 页 `Reagrupamento Familiar` 段明确允许家属与投资人同时递交，家属的授予取决于投资人主案获批。同名材料小节分列 `fora de Território Nacional` 与 `familiar em Território Nacional` 两条渠道。
- ARI 页面：第 1 年停留不少于 7 天，"nos anos subsequentes"（此后各年）不少于 14 天；这是简写，AIMA 常见问题第 24 问与 SRC-124 art. 65-C 都写每个 2 年期 14 天，试点按 2 年期计（PD-148）；同页写明符合 art. 80 的持有人获发投资类永久居留（Autorização de Residência para Atividade de Investimento Permanente），不适用因出境注销的规定（引 DR 84/2007 art. 65-K）；另写 ARI 自证件签发日起有效 2 年。永久居留页面：持临时居留许可至少 5 年，证件 5 年换发。ERLD 页面：申请前紧邻 5 年合法、不间断居留。《Direito de Residência》：非欧盟国民的居留权在居留卡到期后 6 个月内仍然保留（引 DR 84/2007 art. 63 n.º 14）；2025-06-30 前到期的卡另延至 2026-04-15（PD-145）。
- AIMA《Perguntas frequentes – Autorização de Residência para Investimento (ARI)》已在 SRC-481 归档。第 24 问列第 1 年 7 天、此后每个 2 年期 14 天，与 art. 65-C 一致。

## SRC-127 葡萄牙政府关于新国籍法的说明

- 司法部新闻（2026-05-19）："Regulamentação complementar"一节写明新规定 2026-05-19 施行，在审程序继续适用旧文本，新规定只适用于施行后递交的申请；正文列出 7 年、10 年。
- 司法部入籍指南页（2026-11-22 抓取）标题与正文仍写居住满 5 年，是旧法内容，不作为现行规则的依据。
- 部长会议公报（2026-10-29）第 2 项：通过实施新国籍法的 Decree-Law；截至 2026-11-22 未见公布，新法下居留起算的证明方式待条例明确（PD-140）。

## SRC-200 Migration Regulations 1994（Compilation 292，卷 1–3）

任务 83 复用 SRC-061、SRC-068、SRC-069 同版本快照及 SRC-062 的原时间算法定位。SRC-063–067 的一级来源表列最新抓取，各条备注保留早期快照。

卷 1 收录 regs 1.03、1.20J–KC、2.03A、5.19 和 Schedule 1 的递交条件与费用。卷 2 收录 100、155、157、186、189、190、191、309、801。卷 3 收录 820、858 及 Schedules 3–6D、8。

卷 1 reg 2.12(a)、(b)、(s) 分别列出境内配偶 UK、BS 及州提名 SN。Sch 1 items 1113、1114B、1124B、1128、1137–1139、1214C 界定本引擎涉及的境内签证类别。s 48 适用时，境内配偶合并递交另按 item 1124B(3)(e)、(3A) 核对既往指定拒签、随件表格及声明。

卷 2 第 100.221(2)(c)、801.221(2)(d) 条从普通合并递交日计算两年。两类的 (2A)(a)–(c) 均从部长依 s 351、501J 或已废止 s 417 作出临时签证决定之日计算两年。等待期例外见 100.221(5)–(7)、801.221(6A)–(7)，永久阶段提名或持续担保见 100.226(a)–(b)、801.221(2)(b)、(2A)。

- `policy-sources/2026-11-12-au-migration-regulations-1994-vol1.html` → <https://www.legislation.gov.au/F1996B03551/2026-11-12/2026-11-12/text/original/epub/OEBPS/document_1/document_1.html>
- `policy-sources/2026-11-12-au-migration-regulations-1994-vol2.html` → <https://www.legislation.gov.au/F1996B03551/2026-11-12/2026-11-12/text/original/epub/OEBPS/document_2/document_2.html>
- `policy-sources/2026-11-12-au-migration-regulations-1994-vol3.html` → <https://www.legislation.gov.au/F1996B03551/2026-11-12/2026-11-12/text/original/epub/OEBPS/document_3/document_3.html>

## SRC-201 LIN 19/210 技术签证及格线

s 6 规定打分签证的 pool mark 与 pass mark。

## SRC-202 LIN 22/022 指定偏远地区

Schedules 1–2 按州与邮编界定地区。491 按获签时的地区，494 按相关提名时的地区判断（SRC-200 Sch 8 cond 8579）。

## SRC-203 LIN 19/216 雇主提名类别豁免

ss 4–7 按通道分别规定年龄、技能评估及工作经验的例外。

## SRC-204 Migration (Skilling Australians Fund) Charges Regulations 2018

s 6 规定雇主提名培训税的营业额分界与费率。

## SRC-205 LIN 25/014 Functional English

s 6 与 Schedule 1 规定可选的护照、教育经历及考试证明。

## SRC-206 LIN 25/016 英语考试、成绩与护照

ss 7–10、Schedules 1–3 按考试日期、考种和等级给出各单科门槛。

## SRC-207 LIN 19/051 技术职业与评估机构

职业及评估机构按签证类别核对 MLTSSL 与 STSOL。

## SRC-208 LIN 24/089 雇主提名职业清单

职业表与附加限制用于 186 Direct Entry。

## SRC-209 Australian Citizenship Regulation 2016

Schedule 3 按申请类别、优惠资格与费用豁免区分入籍收费。

## SRC-210 IMMI 18/033 市场年薪

指定年收入金额见 Part 2，annual market salary rate 的举证方法见 Part 3 s 7。

## SRC-211 Migration Act 1958（Compilation 172，卷 2）

s 501(6)–(7A) 区分品格测试、刑罚与裁量，信息变更及签证终止见已登记的卷 1（SRC-069）。

## SRC-212 Fair Work Regulations 2009

reg 2.13 给出 high income threshold 调整公式。当前年度澳元公告尚待核实，见 PD-206。

## SRC-213 Health Insurance Act 1973

s 3(1) 定义 Australian resident，Medicare 资格与健康 PIC 分别判断。

## SRC-214 内政部雇主提名薪资要求

Salary requirements 小节列出适用财年的 CSIT、AMSR 与保证年收入的关系。

## SRC-215 内政部入籍面试与考试

About the test 与 Pass the test 小节列出考试题数、价值观题和及格要求。

## SRC-216 内政部新西兰公民直接入籍指引

Direct pathway to Australian citizenship 小节解释 SCV 持有人的永久居留起算。

## SRC-217 内政部 Form 1298i（07/26）

p1–2 列出入籍费用、优惠卡与豁免，页码按 PDF 物理页序。

- `policy-sources/2026-11-23-au-immi-citizenship-form1298i.pdf` → <https://immi.homeaffairs.gov.au/form-listing/forms/1298i.pdf>

## SRC-218 内政部 Significant Cost Threshold

Significant healthcare and community service costs 小节解释 MOC 的评估期限及费用门槛。

## SRC-219 内政部 Health waiver

Health waiver 小节说明 PIC 4007 的个案审查和不可豁免的健康条件。

## SRC-220 内政部签证品格审查

Police certificates 与 Character requirements 小节说明刑事记录、警方证明和审查程序。

## SRC-221 内政部签证费率

Current visa pricing 提供费用入口，法定费率按 SRC-200 Schedule 1 和 reg 2.12C 核对。

## SRC-225 内政部技术移民职业评估

Visas 下的 General Skilled Migration (GSM) visas 小节说明，按 *Thapa* [2021] FCCA 686 的现行办理口径，指定职业的合格职评可在 60 天邀请期内取得。递交时提供职评。条文的获邀时点见 SRC-200 189.222(1)、190.212(1)。

## SRC-226 内政部 Competent English 考试和成绩

表 2 的 TOEFL iBT 行列出 2023-07-26 至 2024-05-04（含首尾）对澳大利亚签证停认，并列出旧版口语最低 21 分。SRC-206 s 10(5)(c) 的对应分数是 18。两者影响结果的区间见 PD-200。

## SRC-229 IELTS 官方成绩说明

Understanding IELTS test scores 下的 Overall band score 小节说明，成绩单总分取听、说、读、写四科均值，舍入到最近的 0.5 分，恰在中点时向上舍入。澳大利亚 Functional English 的 IELTS 门槛见 SRC-205 s 4、s 6(c)、Sch 1 第 2、3 行，旧成绩见 s 7(1)–(2)。

## SRC-290 入籍年龄、合法取得永居及归化撤销

- `policy-sources/2026-11-10-us-usc-8usc1445.html` → <https://uscode.house.gov/us/usc/t8/s1445/>
- `policy-sources/2026-11-10-us-usc-8usc1429.html` → <https://uscode.house.gov/us/usc/t8/s1429/>
- `policy-sources/2026-11-10-us-usc-8usc1451.html` → <https://uscode.house.gov/us/usc/t8/s1451/>
- `policy-sources/2026-11-21-us-pm-v12-g-ch2.html` → <https://www.uscis.gov/policy-manual/volume-12-part-g-chapter-2>，(A)–(C) 区分配偶入籍的递交条件与持续至宣誓的条件。

## SRC-291 英语、公民知识及医学例外

- `policy-sources/2026-11-23-us-usc-8usc1423.html` → <https://uscode.house.gov/us/usc/t8/s1423/>
- `policy-sources/2026-11-19-us-ecfr-8cfr-part312.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=312>

## SRC-292 USCIS 入籍考试、N-648 与新题库

- `policy-sources/2026-11-23-us-pm-v12-e-ch2.html` → <https://www.uscis.gov/policy-manual/volume-12-part-e-chapter-2>
- `policy-sources/2026-11-23-us-pm-v12-e-ch3.html` → <https://www.uscis.gov/policy-manual/volume-12-part-e-chapter-3>
- `policy-sources/2025-10-20-us-pa-civics-test.pdf` → <https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20251020-CivicsTest.pdf>
- PA-2025-24 p2，*Policy Highlights*：USCIS 对 2025-10-20 起递交的 N-400 应用新版题库，普通考生须答对 12 题，更早递交适用旧题库的 6 题门槛。收件日依据见 SRC-081 1 USCIS-PM B.6(E)。
- 12 USCIS-PM E.2(A)(2)、(C)(2) 的 *Special Consideration* 规定，年满 65 岁及在美累计至少 20 年 LPR 居住两项均须在 N-400 递交时满足。收件日同样采用 SRC-081 1 USCIS-PM B.6(E)。
- 12 USCIS-PM E.3(I)(1) 的 *Passing the English and Civics Requirements* 说明 N-648 不充分后通过两项考试的处理。

## SRC-293 USCIS 良好品格、整体审查及公共福利备忘录

- `policy-sources/2026-11-23-us-pm-v12-f-ch2.html` → <https://www.uscis.gov/policy-manual/volume-12-part-f-chapter-2>
- `policy-sources/2026-11-23-us-pm-v12-f-ch4.html` → <https://www.uscis.gov/policy-manual/volume-12-part-f-chapter-4>
- `policy-sources/2026-11-23-us-pm-v12-f-ch5.html` → <https://www.uscis.gov/policy-manual/volume-12-part-f-chapter-5>
- `policy-sources/2025-08-15-us-pm-602-0188-gmc.pdf` → <https://www.uscis.gov/sites/default/files/document/policy-alerts/08.15.2025-Restoring_a_Rigorous_Holistic_and_Comprehensive_Good_Moral_Character_Evaluation_Standard-PM-602-0188.pdf>
- `policy-sources/2026-11-04-us-pm-602-0201-gmc-benefits.pdf` → <https://www.uscis.gov/sites/default/files/document/policy-alerts/11.04.2026-GMC_PublicBenefits_PM-602-0201.pdf>，pp2–5。

## SRC-294 宪法依附、党籍与兵役豁免禁令

- `policy-sources/2026-11-23-us-usc-8usc1424.html` → <https://uscode.house.gov/us/usc/t8/s1424/>
- `policy-sources/2026-11-23-us-usc-8usc1425.html` → <https://uscode.house.gov/us/usc/t8/s1425/>
- `policy-sources/2026-11-23-us-usc-8usc1426.html` → <https://uscode.house.gov/us/usc/t8/s1426/>
- `policy-sources/2026-11-19-us-ecfr-8cfr-part313.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=313>
- `policy-sources/2026-11-19-us-ecfr-8cfr-part315.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=315>

## SRC-295 Selective Service 登记与入籍

- `policy-sources/2026-11-23-us-sss-who-must-register.html` → <https://www.sss.gov/register/who-needs-to-register/>
- `policy-sources/2026-11-23-us-pm-v12-d-ch7.html` → <https://www.uscis.gov/policy-manual/volume-12-part-d-chapter-7>
- `policy-sources/2026-11-23-us-usc-50usc3802.html` → <https://uscode.house.gov/us/usc/t50/s3802/>

## SRC-296 入籍宣誓及修正

- `policy-sources/2026-11-23-us-usc-8usc1448.html` → <https://uscode.house.gov/us/usc/t8/s1448/>
- `policy-sources/2026-11-19-us-ecfr-8cfr-part337.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=337>
- `policy-sources/2026-11-23-us-pm-v12-j-ch2.html` → <https://www.uscis.gov/policy-manual/volume-12-part-j-chapter-2>
- `policy-sources/2026-11-23-us-pm-v12-j-ch3.html` → <https://www.uscis.gov/policy-manual/volume-12-part-j-chapter-3>

## SRC-297 婚姻取消条件、联名与豁免

- `policy-sources/2026-11-21-us-i751instr.pdf` → <https://www.uscis.gov/sites/default/files/document/forms/i-751instr.pdf>
- `policy-sources/2026-11-21-us-pm-v6-i-ch2.html` → <https://www.uscis.gov/policy-manual/volume-6-part-i-chapter-2>
- `policy-sources/2026-11-21-us-pm-v6-i-ch3.html` → <https://www.uscis.gov/policy-manual/volume-6-part-i-chapter-3>

## SRC-298 EB-5 条件移除、持续投资与就业

- `policy-sources/2026-11-21-us-pm-v6-g-ch7.html` → <https://www.uscis.gov/policy-manual/volume-6-part-g-chapter-7>
- `policy-sources/2026-11-23-us-i829instr.pdf` → <https://www.uscis.gov/sites/default/files/document/forms/i-829instr.pdf>

## SRC-299 外国人登记、随身携证、换卡与地址申报

- `policy-sources/2026-11-23-us-usc-8usc1304.html` → <https://uscode.house.gov/us/usc/t8/s1304/>
- `policy-sources/2026-11-23-us-usc-8usc1305.html` → <https://uscode.house.gov/us/usc/t8/s1305/>
- `policy-sources/2026-11-23-us-usc-8usc1306.html` → <https://uscode.house.gov/us/usc/t8/s1306/>
- `policy-sources/2026-11-19-us-ecfr-8cfr-part264.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=264>
- `policy-sources/2026-11-19-us-ecfr-8cfr-part265.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=265>
- `policy-sources/2026-11-23-us-alienregistration.html` → <https://www.uscis.gov/alienregistration>
- 地址申报期限从搬家日起算。达到规定年龄后的重新登记及换卡分别按生日和现有卡的到期日核对。见 [8 U.S.C. §1305(a)](https://uscode.house.gov/us/usc/t8/s1305/)、[8 U.S.C. §1302(b)](https://uscode.house.gov/us/usc/t8/s1302/) 和 [8 CFR §264.5(b)(8)](https://www.ecfr.gov/current/title-8/section-264.5#p-264.5(b)(8))。

## SRC-300 返美、回美证及 SB-1

- `policy-sources/2026-11-19-us-ecfr-8cfr-part223.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=223>
- `policy-sources/2026-11-19-us-ecfr-22cfr42.22.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-22.xml?section=42.22>
- `policy-sources/2026-11-21-us-9fam502.7.html` → <https://fam.state.gov/FAM/09FAM/09FAM050207.html>
- `policy-sources/2026-11-23-us-i131instr.pdf` → <https://www.uscis.gov/sites/default/files/document/forms/i-131instr.pdf>
- 8 CFR §223.2(b)(1) 和 I-131 Instructions p4「Reentry Permit」要求在美国递交回美证申请。§223.2(b)(2)(i)–(ii) 另列难民旅行证通常在美国递交及可裁量接受的境外递交情形。见 [8 CFR §223.2](https://www.ecfr.gov/current/title-8/section-223.2#p-223.2(b))。
- 8 CFR §§223.1(a)、223.3(a)(1) 以返美时的回美证有效期为准。核对同一回美证的 I-131 收件、签发和返美日期。收件日与签发或返美日期冲突时，须核对个案证件与收据。见 [8 CFR §223.3(a)](https://www.ecfr.gov/current/title-8/section-223.3#p-223.3(a))。
- I-131A 在 USCIS 网上付费，表格须在使领馆当面递交。DS-117 向办理该案的使领馆提交，SB-1 的后续 DS-260 按使领馆通知办理。见 [I-131A Payment，Before You Start The Payment Process](https://my.uscis.gov/accounts/travel-document/start/overview)、[Returning Resident Visas，Required Documentation 与 Step 2](https://travel.state.gov/content/travel/en/us-visas/immigrate/returning-resident.html)。

## SRC-301 境内递解事由

- `policy-sources/2026-11-10-us-usc-8usc1227.html` → <https://uscode.house.gov/us/usc/t8/s1227/>

## SRC-302 亲属资格、CSPA、签证分类及申请禁令

- `policy-sources/2026-11-23-us-usc-8usc1151.html` → <https://uscode.house.gov/us/usc/t8/s1151/>
- `policy-sources/2026-11-23-us-usc-8usc1153.html` → <https://uscode.house.gov/us/usc/t8/s1153/>
- `policy-sources/2026-11-23-us-usc-8usc1154.html` → <https://uscode.house.gov/us/usc/t8/s1154/>
- `policy-sources/2026-11-19-us-ecfr-8cfr-part204.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=204>
- `policy-sources/2026-11-23-us-pm-v6-b-ch7.html` → <https://www.uscis.gov/policy-manual/volume-6-part-b-chapter-7>
- 8 U.S.C. §1151(f)(1) 以 I-130 收件日核对公民子女年龄，§1151(f)(2) 以父母入籍日核对由 F2A 转即时亲属的年龄。领馆对特定巡回区的个案例外及 timely seek-to-acquire 处理见 [9 FAM 502.1-1(D)(7)(1)–(2)](https://fam.state.gov/FAM/09FAM/09FAM050201.html#M502_1_1_D_7)，快照 `policy-sources/2026-11-24-us-9fam502.1.html`。
- 8 U.S.C. §1154(b) 规定 USCIS 调查并认定请愿所述事实及分类资格后批准请愿。前婚、婚姻欺诈、递解程序中结婚和 Adam Walsh 的请愿限制见 §1154(a)(1)、(c)、(g) 及 8 CFR §204.2(a)(1)。EB-1B、EB-1C 的 I-140 分类证据见 8 CFR §204.5(i)(3)、(j)(2)–(3)、(5)。SIJ 的原裁定及 DHS 同意见 8 CFR §204.11(b)–(d)，请愿获批后的自动撤销情形见 §204.11(j)。[8 U.S.C. §1154](https://uscode.house.gov/us/usc/t8/s1154/) · [8 CFR §204.11](https://www.ecfr.gov/current/title-8/section-204.11)

## SRC-303 I-864 担保、替代资产及豁免

- `policy-sources/2026-11-23-us-usc-8usc1183a.html` → <https://uscode.house.gov/us/usc/t8/s1183a/>
- `policy-sources/2026-11-19-us-ecfr-8cfr-part213a.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=213a>
- `policy-sources/2026-11-23-us-i864instr.pdf` → <https://www.uscis.gov/sites/default/files/document/forms/i-864instr.pdf>
- I-864 Instructions p3 的 Other Applicants Not Required to Submit Form I-864 items 1–2 列出无适用亲属申请人／持股人、自行递交 I-140 及 I-526／I-526E 的不适用情形。pp8、14 的服役收入门槛只适用担保人请愿的配偶或未婚未满 21 岁子女（INA §101(b)(1)，8 U.S.C. §1183a(f)(3)）。p16 载资产补足倍数。

- 8 CFR §213a.2(a)(1)(v)(A) 的通常收入规则使用正式提出移民签证或调整申请时适用的 Poverty Guidelines 及当年预计收入。另见 §213a.2(a)(1)(v)(B) 个案补证后重核收入的规则、§213a.2(c)(1) 的主担保人资格。 [8 CFR §213a.2(a)(1)(v)](https://www.ecfr.gov/current/title-8/section-213a.2#p-213a.2(a)(1)(v))

## SRC-304 HHS 贫困指引及 USCIS 地区表

- `policy-sources/2026-01-15-us-fr-2026-00755-hhs-poverty.txt` → <https://www.federalregister.gov/documents/full_text/text/2026/01/15/2026-00755.txt>
- `policy-sources/2026-11-23-us-i864p.html` → <https://www.uscis.gov/i-864p>

## SRC-305 PERM 工作及招聘、工资、支付能力

- `policy-sources/2026-11-19-us-ecfr-20cfr-part656.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-20.xml?part=656>
- `policy-sources/2026-11-23-us-pm-v6-e-ch4.html` → <https://www.uscis.gov/policy-manual/volume-6-part-e-chapter-4>
- `policy-sources/2026-11-23-us-pm-v6-e-ch6.html` → <https://www.uscis.gov/policy-manual/volume-6-part-e-chapter-6>
- 20 CFR §656.30(b)(1) 和 6 USCIS-PM E.6(B)(1) 按用于 I-140 的收件日计算 PERM 有效期。
- 20 CFR §656.10(d)(1)(i)–(ii)、(2)(ii)、(3)(iv)、(6) 和 §656.15(b)(2) 规定通知有管辖权的工会代表。无该代表时，须在递交前 30–180 天的窗口内连续张贴至少 10 个工作日。工会通知也适用该窗口。Schedule A 按 USCIS 的 I-140 收件日核对，§656.15(e) 规定 DHS 对原通知与职业资格的认定为最终决定。工资认定见 §656.15(b)，雇主承担的相关费用见 §656.12(b)。[DOL PERM FAQ，Posting Timeframe，p1](https://www.dol.gov/sites/dolgov/files/ETA/oflc/pdfs/perm_faqs_2-21-06.pdf#page=1)
- 普通 PERM 的招聘及通知窗口按 DOL 的 ETA-9089 递交日核对。州就业订单的 30 天刊登期及强制广告见 20 CFR §656.17(e)(1)(i)(A)–(B)、(e)(2)(i)–(ii)，等待期用订单结束日计算。DOL 认证涵盖招聘及其结果，见 §§656.17(g)、656.24(b)–(d)。[DOL BALCA PERM Digest，Recruitment，Timing of Recruitment](https://www.dol.gov/agencies/oalj/PUBLIC/INA/REFERENCES/REFERENCE_WORKS/BALCA_PERM_DIGEST)
- 20 CFR §656.12(b) 禁止雇主向员工索取或收取取得 PERM 的雇主应付费用。(c) 规定相关证据可触发调查，并可能导致驳回、撤销或禁止申办。认证最终效力须按个案决定确认。[20 CFR §656.12(b)–(c)](https://www.ecfr.gov/current/title-20/section-656.12#p-656.12(b))
- 普通 PERM 认证也核对认证职位的工资与劳动条件，见 20 CFR §§656.10(c)(1)、656.24(b)(3)。雇员职业分类与雇主实际支付能力由 USCIS 在 I-140 审查，见 SRC-302，8 CFR §204.5(g)(2)、(k)、(l)。I-140 待决时符合职业转换的支付能力证明期间从优先日到 I-140 递交日，见存档的 6 USCIS-PM E.4(D)(5)。[USCIS PA-2024-01，pp1–2](https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20240105-AbilityToPay.pdf)
- 8 CFR §204.5(g)(2) 和 6 USCIS-PM E.4(A)–(B) 按适用期间核对工资支付、年度报告、联邦纳税申报及审计财务报表。历史阶段使用对应年度及截至该阶段的金额。后出具的文件可证明已发生的历史事实，所载较晚期间的付款或短缺归入相应阶段。见 [8 CFR §204.5(g)(2)](https://www.ecfr.gov/current/title-8/section-204.5#p-204.5(g)(2))、[6 USCIS-PM E.4](https://www.uscis.gov/policy-manual/volume-6-part-e-chapter-4)。
- 8 CFR §204.5(d) 以 DOL 收件日确定普通 PERM 的优先日，Schedule A 和无需 DOL 劳工认证的请愿用 USCIS 的 I-140 合规收件日。6 USCIS-PM E.4(A)(4) 核对雇用至少 100 名工人时经接受的财务主管声明。(C)(1)–(3) 分别核对实付工资、净收入或净流动资产及全貌证据。(D)(1) 与注 24 说明首年可按比例核算，实付工资和净收入须有优先日后适用期间的证明，年度末净流动资产按其余额核对。[8 CFR §204.5(d)](https://www.ecfr.gov/current/title-8/section-204.5#p-204.5(d)) · [6 USCIS-PM E.4](https://www.uscis.gov/policy-manual/volume-6-part-e-chapter-4)
- 20 CFR §656.17(a)、(c) 的 ETA-9089 允许电子或邮寄。电子递交使用 [DOL FLAG，PERM Filing Process](https://flag.dol.gov/programs/PERM)。

## SRC-306 职业分类与 EB-1A、EB-2 NIW 证据

- `policy-sources/2026-11-23-us-pm-v6-f-ch2.html` → <https://www.uscis.gov/policy-manual/volume-6-part-f-chapter-2>
- `policy-sources/2026-11-23-us-pm-v6-f-ch5.html` → <https://www.uscis.gov/policy-manual/volume-6-part-f-chapter-5>

## SRC-307 EB-5 投资、就业、资金来源及项目

- `policy-sources/2026-11-23-us-pm-v6-g-ch2.html` → <https://www.uscis.gov/policy-manual/volume-6-part-g-chapter-2>
- `policy-sources/2026-11-23-us-pm-v6-g-ch4.html` → <https://www.uscis.gov/policy-manual/volume-6-part-g-chapter-4>
- `policy-sources/2026-11-23-us-i526instr.pdf` → <https://www.uscis.gov/sites/default/files/document/forms/i-526instr.pdf>
- `policy-sources/2026-11-23-us-i526einstr.pdf` → <https://www.uscis.gov/sites/default/files/document/forms/i-526einstr.pdf>
- I-526 Instructions p9 Item 5 允许以有依据的商业计划证明将创造合资格岗位。INA §203(b)(5)(A)(i) 规定预计持续投资期。
- [I-526](https://www.uscis.gov/i-526) 与 [I-526E](https://www.uscis.gov/i-526e) 的 *Where to File* 指向邮寄地址，SRC-082 网申清单未列两表。

## SRC-308 Gold Card 行政令与 I-140G

- `policy-sources/2025-09-24-us-fr-eo14351-gold-card.html` → <https://www.federalregister.gov/documents/full_text/html/2025/09/24/2025-18602.html>
- `policy-sources/2026-11-23-us-i140g.html` → <https://www.uscis.gov/i-140g>
- `policy-sources/2026-11-23-us-i140ginstr.pdf` → <https://www.uscis.gov/sites/default/files/document/forms/i-140ginstr.pdf>
- I-140G Instructions p3 Items 1–3 规定个人或企业主申请的赠与额，以及每位随行配偶或子女各加 USD 1,000,000。
- I-140G Instructions pp1–2 分列原请愿资金证据、处理费、领馆面谈后的实际汇款及签发前的汇款凭证。请愿批准可沿用原资金认定，实际足额转账由领馆流程核对。
- I-140G 的 *Where to File* 与 *When to File* 规定，登记获接纳并收到 USCIS 通知后，只能通过 USCIS 账户递交。

## SRC-309 境内调整身份、签证名额与例外

- `policy-sources/2026-11-23-us-usc-8usc1255.html` → <https://uscode.house.gov/us/usc/t8/s1255/>
- `policy-sources/2026-11-19-us-ecfr-8cfr-part245.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=245>
- `policy-sources/2026-11-23-us-pm-v7-a-ch6.html` → <https://www.uscis.gov/policy-manual/volume-7-part-a-chapter-6>
- `policy-sources/2026-11-24-us-pm-v7-a-ch8.html` → <https://www.uscis.gov/policy-manual/volume-7-part-a-chapter-8>
- `policy-sources/2026-11-23-us-visa-availability.html` → <https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-and-priority-dates>
- `policy-sources/2026-11-23-us-i485instr.pdf` → <https://www.uscis.gov/sites/default/files/document/forms/i-485instr.pdf>
- 8 U.S.C. §1255(h)(1) 在适用 §1255(a) 时，将获批的 SIJ 视为已获准假释入境。I-485 Instructions p21「Special Immigrant Juvenile (Form I-360)」允许名额可用时与 I-360 同时递交 I-485，或在 I-360 待决时递交。核准仍须取得 SIJ 分类。
- 8 U.S.C. §1255(h)(2)(A) 对 SIJ 调整排除 §1182(a)(4)、(5)(A)、(6)(A)、(6)(C)、(6)(D)、(7)(A) 和 (9)(B)。(6)(C) 包含移民欺诈／虚假陈述及虚称美国公民。(9)(C) 的非法再入境仍属适用事由，按 §1255(h)(2)(B) 核对个案豁免。见 [8 U.S.C. §1255(h)](https://uscode.house.gov/us/usc/t8/s1255/#h)。
- 8 CFR §245.1(b)(4)–(6)、(10) 中的 SIJ 例外适用于身份中断和相关就业违规，其他禁令仍须核对。8 U.S.C. §1255(k)(1)–(2) 对指定职业类别核对递交时的合法入境条件和该次合法入境后的累计违规。见 [8 U.S.C. §1255(k)](https://uscode.house.gov/us/usc/t8/s1255/#k)。
- 8 U.S.C. §1255(c)(7) 与 8 CFR §245.1(b)(9) 要求职业调整申请人在 I-485 递交时具有合法非移民身份，适用 §1255(k) 或其他法定例外的个案按其依据判定。单有 parole 可以满足 §1255(a) 的入境条件。8 CFR §245.1(d)(1)(ii)、(v) 分列非移民身份与有效 parole，其中 §245.1(d)(1) 定义用于 §245(c)(2)。见 [8 U.S.C. §1255(a)、(c)(7)](https://uscode.house.gov/us/usc/t8/s1255/)。
- 8 CFR §245.2(a)(2)(i)(A)–(C)、8 U.S.C. §1255(n) 及 I-485 Instructions pp3、17–21 规定适用即时亲属、亲属优先、I-140、EB-5、VAWA 和 SIJ 等类别的同时递交。7 USCIS-PM A.6(A)、(C)(4)–(5) 要求核对基础请愿案及递交月、裁决月两阶段的名额。I-485 Instructions p11 Item 9 要求按适用情形随件递交 I-693 或疫苗记录。
- 7 USCIS-PM A.6(C)(4)–(5) 分别以原 I-485 递交和最终裁决的日期判断名额。已按适用排期表适当递交后，名额倒退时 USCIS 暂缓核准至名额重新可用。[7 USCIS-PM A.6(C)](https://www.uscis.gov/policy-manual/volume-7-part-a-chapter-6)
- 7 USCIS-PM A.8(A)(1)–(4)、(C)、(E) 分别规定原资格与待决申请须保持连续、新基础在请求转换时须有可用名额，以及获准后由替换请愿支持 I-485。模型核对已获准的转换，并用原请愿及原收件月的指定表核对首次递交，用替换请愿及裁决月名额核对核准。见 [7 USCIS-PM A.8](https://www.uscis.gov/policy-manual/volume-7-part-a-chapter-8)。
- 7 USCIS-PM A.8(C) 要求用替换类别的文件证明新基础资格。(D) 规定以新 I-140 转到不同职业类别时，INA §204(j) 的 180 天从换基请求起重计。原 I-485 收件日与替换 I-140 适用的职业转换起日须分别记录。见 [7 USCIS-PM A.8(C)–(D)](https://www.uscis.gov/policy-manual/volume-7-part-a-chapter-8)。
- 7 USCIS-PM A.6(A)「Verify Underlying Basis to Adjust Status」要求裁决前调取并核验基础请愿案。I-485 Instructions p3「When Should I File Form I-485?」区分基础请愿已获批与可同时递交的类别。基础请愿获批依据缺失时，境内按同时递交规则核对递交，核准待确认请愿决定。
- 7 USCIS-PM A.6(B)「Determine Ongoing Eligibility」及 8 CFR §245.25(a) 要求以获批的雇主职业请愿为依据递交 I-485 和裁决时，确认获批请愿及工作邀约仍有效、申请人拟接受该邀约。持续工资支付能力见 SRC-302，8 CFR §204.5(g)(2)。[8 CFR §245.25(a)](https://www.ecfr.gov/current/title-8/section-245.25#p-245.25(a))
- INA §204(j)（SRC-302，8 U.S.C. §1154(j)）、8 CFR §245.25(a)(2)–(3)、(b) 与 I-485 Instructions pp10、19 规定 I-485 待决满 180 天可凭同类或相似的真实新邀约提交 Supplement J，裁决时请愿须获批且有效。I-140 待决时的支付能力审查见 SRC-305，6 USCIS-PM E.4(D)(5)。[8 CFR §245.25(a)(2)](https://www.ecfr.gov/current/title-8/section-245.25#p-245.25(a)(2))
- I-485 Instructions p10 Item 8 的说明要求 EB-1A 和 NIW 的适用申请人在调整时确认拟继续请愿所述领域，并按递交方式提供签署声明。NIW 医师服务与相应证明见 p19。I-526／I-526E 与 I-485 的衔接见 p20，适用 7 USCIS-PM A.6(A)–(B) 的基础有效性与持续资格检查。[I-485 Instructions p10](https://www.uscis.gov/sites/default/files/document/forms/i-485instr.pdf#page=10)
- I-485 Instructions p10 Item 8 要求依赖工作邀约的职业移民主申请人在 I-140 已获批后首次递交 I-485 时随件提交 Supplement J。I-140 与 I-485 同时递交或 I-140 仍待决时可先递交 I-485，USCIS 可在裁决中要求补交。[I-485 Instructions p10 Item 8](https://www.uscis.gov/sites/default/files/document/forms/i-485instr.pdf#page=10)
- I-485 Instructions p2「Who May File Form I-485?」要求递交时实际身处美国，各移民类别另有适用条件。该递交时点也适用于使用 I-485 的 INA 209 难民与庇护调整。累计在美要求仍于裁决时核对，见 SRC-314。见 [I-485 Instructions p2](https://www.uscis.gov/sites/default/files/document/forms/i-485instr.pdf#page=2)。
- 8 U.S.C. §1255(a)(2) 要求境内调整申请人具备准入资格。一般规则要求在 I-485 递交时符合资格并持续至裁决。I-485 Instructions pp11–12 Item 10 列明需随件提交的适用法院及警方文件。见 [8 CFR §103.2(b)(1)，Demonstrating eligibility](https://www.ecfr.gov/current/title-8/section-103.2#p-103.2(b)(1))、[I-485 Instructions](https://www.uscis.gov/sites/default/files/document/forms/i-485instr.pdf#page=11)。
- 8 CFR §245.2(a)(4)(ii)(A)–(D) 与 I-485 Instructions p14「If You Leave the United States While Your Application Is Pending」规定待决期间的离境后果。无适用例外时，INA §245 申请视为放弃。例外包括事先获批的 Advance Parole 和符合规定的查验返美、维持适用 H/L/K/V 非移民身份并满足返美条件，以及按 INA §244(f)(3) 获准旅行并以 TPS 查验入境。递解程序中离境须按 §245.2(a)(4)(ii)(A) 核对。INA §209 适用难民旅行证件，Registry 适用不同的待决旅行规则，均见 p14。参见 SRC-300，8 CFR §§223.1(b)、223.2(b)(2)。[8 CFR §245.2(a)(4)(ii)](https://www.ecfr.gov/current/title-8/section-245.2#p-245.2(a)(4)(ii)) · [I-485 Instructions p14](https://www.uscis.gov/sites/default/files/document/forms/i-485instr.pdf#page=14)
- 7 USCIS-PM B.4(B)、B.6(B)–(C)、B.8(E) 分别说明合法身份维持的截止点、待决期间未经授权就业与 §245(k) 的核对口径。普通非移民身份在正确递交后到期本身不构成调整禁令。适用 §245(c)(8) 的待决申请人仍须确认就业授权。职业例外核对 §245(k) 的累计期间。法条对照 8 U.S.C. §1255(c)(2)、(7)–(8)、(k)，8 CFR §§245.1(b)(10)、274a.12(c)(9)。[7 USCIS-PM B.4](https://www.uscis.gov/policy-manual/volume-7-part-b-chapter-4) · [7 USCIS-PM B.6](https://www.uscis.gov/policy-manual/volume-7-part-b-chapter-6) · [7 USCIS-PM B.8](https://www.uscis.gov/policy-manual/volume-7-part-b-chapter-8)
- §1255(k)(1)–(2) 的适用期间从同一次相关合法入境起算。较晚截止日的合资格累计可作较早裁决日的上界。若较晚总数超过法定上限，而案卷无法确认何时越线，应核对裁决日的实际累计。见 [8 U.S.C. §1255(k)](https://uscode.house.gov/us/usc/t8/s1255/)、[7 USCIS-PM B.8(E)](https://www.uscis.gov/policy-manual/volume-7-part-b-chapter-8)。
- 8 CFR §103.2(b)(1) 分别要求递交时和裁决时满足相应条件。§245.2(a)(4)(ii)(A)–(D) 限于待决期间的离境。引擎只有日期时，按已确定的时间顺序判定。同日记录的先后若会改变结论，待核案卷。7 USCIS-PM B.8(E) 按适用合法入境后的违规日合计，递交后符合条件的未经授权就业仍计入。历史累计只能建立已覆盖期间的事实，核准所需的额外期间依记录确认。见 [8 CFR §103.2(b)(1)](https://www.ecfr.gov/current/title-8/section-103.2#p-103.2(b)(1))、[§245.2(a)(4)(ii)](https://www.ecfr.gov/current/title-8/section-245.2#p-245.2(a)(4)(ii)) 与 [7 USCIS-PM B.8(E)](https://www.uscis.gov/policy-manual/volume-7-part-b-chapter-8)。
- 8 CFR §103.2(b)(6)、(13) 涉及撤回申请、逾期不答复及缺席通知所致的程序后果。7 USCIS-PM A.6(B) 检查主申请人与衍生申请人的持续资格。亲属分类变化及合法例外见 SRC-302，8 U.S.C. §§1151(b)、(f)、1153(d)、(h)、1154(a)、(l)，及 8 CFR §205.1(a)(3)。K-1 申请的原婚姻已结束时，依 INA §245(d) 及 *Matter of Sesay*, 25 I&N Dec. 431, 439–40，核对是否已和原请愿人及时缔结善意婚姻。[8 CFR §103.2(b)](https://www.ecfr.gov/current/title-8/section-103.2#p-103.2(b)) · [8 CFR §205.1](https://www.ecfr.gov/current/title-8/section-205.1) · [EOIR，Matter of Sesay](https://www.justice.gov/sites/default/files/eoir/legacy/2014/07/25/3707.pdf)
- 其他 I-485 类别的持续条件按专门依据认定。T、U 类见 8 U.S.C. §1255(l)–(m)，8 CFR §§245.23、245.24。Diversity Visa 的签发与调整截止见 SRC-302，8 U.S.C. §1154(a)(1)(I)(ii)(II) 及 I-485 Instructions「Diversity Visa Program」。其他特别法与衍生资格参见 I-485 Instructions「Additional Instructions」。[8 CFR §245.23](https://www.ecfr.gov/current/title-8/section-245.23) · [8 CFR §245.24](https://www.ecfr.gov/current/title-8/section-245.24)
- 国务院说明 NVC 在请愿案获批后通知申请人付款和递件，即时亲属同样由 NVC 发出通知。受排期限制的申请人按适用的 Dates for Filing 和收到的 NVC 说明递件，核准用 Final Action Dates。见 [National Visa Center，What happens after USCIS sends my petition to the NVC?](https://travel.state.gov/content/travel/en/us-visas/immigrate/national-visa-center.html)、[Visa Bulletin，Dates for Filing](https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-september-2026.html)。
- 国务院的请愿类移民签证流程先由 USCIS 核准请愿，再移交 NVC 建档并发出欢迎信。C28、C31、C33、C37 与 C40 共用这一证据口径，将同一领馆案的 NVC 递件授权和 CEAC 的 DS-260 提交记录合用，确认基础请愿已获批。见 [NVC Processing，Step 2](https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-1-submit-a-petition/step-2-begin-nvc-processing.html)、[Online Application，Step 6](https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-5-collect-financial-evidence-and-other-supporting-documents/step-6-complete-online-visa-application.html)。
- NVC 处理适用费用后，CEAC 才开放 DS-260。提交本案各申请人的 DS-260 后才可上传其民事文件。见 [Pay Fees，Step 3](https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-1-submit-a-petition/step-3-pay-fees.html)、[Online Application，Step 6](https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-5-collect-financial-evidence-and-other-supporting-documents/step-6-complete-online-visa-application.html)、[CEAC FAQs，IV Application 与 Civil Documents 栏](https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-1-submit-a-petition/step-2-begin-nvc-processing/ceac-faqs.html)。
- DS-260 在领事面谈时经宣誓或确认和生物识别签名后正式提出。行政审查可能使核准裁决晚于面谈日。见 [22 CFR §42.67(a)(3)，Oath and signature on Form DS-260](https://www.ecfr.gov/current/title-22/section-42.67#p-42.67(a)(3))、[Online Application，Step 6](https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-5-collect-financial-evidence-and-other-supporting-documents/step-6-complete-online-visa-application.html)、[After the Interview，Administrative Processing](https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-10-prepare-for-the-interview/step-12-after-the-interview.html)。
- NVC 审完签证申请、适用的 I-864 和支持文件，才发 documentarily complete 通知。适用的法庭、监狱及警方记录在递件阶段收集。见 [Submit Documents，Documentarily Complete](https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-8-scan-collected-documents/step-9-upload-and-submit-scanned-documents.html)、[Civil Documents，Court and Prison Records、Police Certificates](https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-5-collect-financial-evidence-and-other-supporting-documents/step-7-collect-civil-documents.html)。
- CEAC 的必需民事文件有缺件时无法递交。适用国家互惠表的不可取得例外，或按要求补交书面缺件说明后，仍由领馆判断能否签发。见 [Submit Documents，Step 9](https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-8-scan-collected-documents/step-9-upload-and-submit-scanned-documents.html)、[Civil Documents FAQs，I can’t get one of the required civil documents、The “Submit” button isn’t working](https://travel.state.gov/content/travel/en/us-visas/immigrate/civil-documents-faq.html)。

## SRC-310 境内调整身份的裁量

- `policy-sources/2026-05-21-us-pm-602-0199-aos-discretion.pdf` → <https://www.uscis.gov/sites/default/files/document/policy-alerts/05.21.2026_Discretionary_Adjudication_of_Adjustment_of_Status_Applications_PM-602-0199.pdf>
- `policy-sources/2026-11-23-us-pm-v7-a-ch10.html` → <https://www.uscis.gov/policy-manual/volume-7-part-a-chapter-10>

## SRC-311 不予入境、非法居留、犯罪与安全

- `policy-sources/2026-11-23-us-usc-8usc1182.html` → <https://uscode.house.gov/us/usc/t8/s1182/>
- `policy-sources/2026-11-19-us-ecfr-8cfr-part212.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=212>
- `policy-sources/2026-09-23-us-pa-criminal-inadmissibility.pdf` → <https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20260923-CriminalInadmissibility.pdf>
- 8 U.S.C. §1182(a) 规定签证及准入资格。§1182(a)(9)(B)(i)(I)–(II) 的非法居留禁令按离境后再次寻求入境的时点核对。领馆路径按裁决日核对是否届满，NVC 材料递交条件见 SRC-309 Submit Documents Step 9。
- C40 其他事由清单对应 8 U.S.C. §1182(a)(5)(A)–(C)、(6)(A)(i)、(6)(B)、(6)(D)–(G)、(7)(A)、(8)(A)–(B)、(9)(A) 及 (10)(A)–(E)。虚假陈述、虚称美国公民、非法居留及非法再入境由独立答案核对。逐项结论可按整条条款提供，单一子条款结论仅覆盖该子条款。
- §1182(a)(4)(E)(i) 排除 VAWA 自请人的公共负担事由。USCIS 对已获批 VAWA 自请人的境内调整按已免除 (6)(A)(i) 的未经查验入境事由处理。(9)(B)(iii)(IV) 的非法居留例外要求证实虐待或极端残酷与违反非移民签证条件之间有实质联系。(9)(C)(iii) 的非法再入境豁免须单独获准，欺诈／虚假陈述可按 §1182(i) 申请个案豁免。见 [Form I-601 Instructions pp14–15，Approved VAWA Self-Petitioners](https://www.uscis.gov/sites/default/files/document/forms/i-601instr.pdf#page=14)。
- 8 U.S.C. §1182(a)(2)(A)(ii)(I) 的未成年 CIMT 例外在领馆审查中以正式签证申请日核对，从犯罪或获释（取较晚者）起须超过法定期限。§1182(a)(3)(D)(iii)(I)–(II) 的原党籍例外以正式申请日核对期限，并要求没有安全威胁。境内调整的原党籍期限以 I-485 收件日核对。见 [8 U.S.C. §1182](https://uscode.house.gov/us/usc/t8/s1182/)、[9 FAM 302.3-2(B)(7)，Minor Exception](https://fam.state.gov/FAM/09FAM/09FAM030203.html)、[8 USCIS-PM F.3，Past Membership 与注 63](https://www.uscis.gov/policy-manual/volume-8-part-f-chapter-3)。
- `policy-sources/2026-11-24-us-9fam504.8.html`。签证裁决官完成确定签发资格所需的安全核查。见 [9 FAM 504.8-3，Clearing Immigrant Visa Applicants](https://fam.state.gov/FAM/09FAM/09FAM050408.html#M504_8_3)。

## SRC-312 体检、疫苗与 I-693 有效性

- `policy-sources/2026-11-19-us-ecfr-42cfr-part34.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-42.xml?part=34>
- `policy-sources/2025-06-11-us-pa-i693-validity.pdf` → <https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20250611-I-693Validity.pdf>
- `policy-sources/2026-11-24-us-i693.html` → <https://www.uscis.gov/i-693>
- Form I-693 页首明确规定 2024-12-02 起将所需 I-693 或部分疫苗记录随 I-485 递交。PA-2025-08 p2 记载 2024-12-10 发布含该要求的 I-485 改版，并说明此前曾在递交后以 RFE 补取材料。两日期分别用于随件要求生效和改版发布。PA-2025-08 对个案绑定有效性的更新自 2025-06-11 起适用于待决或新递交的案件。
- PA-2025-08 pp1–2 说明 USCIS 可在裁决时要求新的 I-693，即使已随件递交的原件仍有效。原件按适用的 I-485 收件要求核对，补交版本按裁决时的个案有效性核对。见 [PA-2025-08](https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20250611-I-693Validity.pdf)。
- 旧版 I-485 Instructions 的 Item 10 允许随 I-485 交体检报告或在递交后补交。按该时点，待确认的体检报告、Class A 健康结论和疫苗记录均在核准时核对。见 [2022 年版 I-485 Instructions，Item 10](https://www.uscis.gov/sites/default/files/document/forms/Version_Preliminar_Edicion_12-23-22_USCIS_RECHAZARA_EL_FORMULARIO_SI_SE_PRESENTA_ANTES_DEL_12-23-22_Instrucciones_del_Formulario_I-485.pdf)。
- `policy-sources/2026-11-23-us-pm-v8-b-ch9.html` → <https://www.uscis.gov/policy-manual/volume-8-part-b-chapter-9>
- `policy-sources/2026-11-23-us-i693instr.pdf` → <https://www.uscis.gov/sites/default/files/document/forms/i-693instr.pdf>
- I-693 Instructions pp7–8，FAQ Items 1–5 分别说明一般完整体检和难民、特定庇护衍生申请人、K 签证持有人以及符合条件的 Operation Allies Welcome 入境者可沿用境外体检的情形。适用时，部分 I-693 含 Parts 1–5、7、10。是否仍需部分表取决于适用类别和境外记录。见 [I-693 Instructions FAQ](https://www.uscis.gov/sites/default/files/document/forms/i-693instr.pdf#page=7)。
- `policy-sources/2026-11-23-us-9fam302.2.html` → <https://fam.state.gov/FAM/09FAM/09FAM030202.html>
- 国务院要求在 NVC 发出面谈通知后安排指定医生体检。面谈阶段带照片和已递交的民事文件正本或认证副本。见 [Appointment，Medical Examination、What Do I Need to Bring to the Interview](https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-10-prepare-for-the-interview/appointment.html)、[Prepare for the Interview，Step 10](https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-10-prepare-for-the-interview.html)。
- 领事官员在面谈后决定是否符合签证资格。NVC 确认所需资料齐备后再安排面谈，具体安排取决于签证名额及领馆提供的档期。见 [Applicant Interview，Step 11](https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-10-prepare-for-the-interview/step-11-applicant-interview.html)、[Submit Documents，Documentarily Complete](https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-8-scan-collected-documents/step-9-upload-and-submit-scanned-documents.html)。

## SRC-313 DHS 公共负担与领馆 FAM 对照

- `policy-sources/2026-07-20-us-fr-2026-14539-public-charge.html` → <https://www.federalregister.gov/documents/full_text/html/2026/07/20/2026-14539.html>
- `policy-sources/2026-08-18-us-pa-public-charge.pdf` → <https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20260818-PublicCharge.pdf>
- `policy-sources/2026-11-23-us-pm-v8-g-ch11.html` → <https://www.uscis.gov/policy-manual/volume-8-part-g-chapter-11>
- `policy-sources/2026-11-23-us-9fam302.8.html` → <https://fam.state.gov/FAM/09FAM/09FAM030208.html>
- 境内调整适用的 DHS 公共负担规则按 I-485 邮戳或电子递交日期确定。跨生效日待决的案件按适用的递交日期口径裁决。见 [91 FR 45324，DATES 与 § I.D，Implementation](https://www.govinfo.gov/content/pkg/FR-2026-07-20/pdf/2026-14539.pdf)。
- `policy-sources/2026-11-24-us-i485.pdf`。91 FR 45408 第 M 节确认法定豁免继续适用，并以 USCIS Policy Manual 和表单提供豁免清单。领馆适用 9 FAM 302.8-2(B)(6) 的豁免及其中的 I-864 例外。见 [Form I-485 p18，Part 9 Item 56](https://www.uscis.gov/sites/default/files/document/forms/i-485.pdf#page=18)、[9 FAM 302.8-2(B)(6)](https://fam.state.gov/FAM/09FAM/09FAM030208.html#M302_8_2_B_6)。

Form I-485 Part 9 Item 56 列出的境内调整公共负担豁免类别如下。

- VAWA 自请人、SIJ、符合条件的阿富汗或伊拉克国民、庇护者、难民。
- INA §245(m) 的 U 类调整。按其他依据调整的申请人须在递交和裁决时均持有效 U 身份。
- INA §245(l) 的 T 类调整。按其他依据调整的申请人须在递交和裁决时持有效 T 身份，或有仍待决且已具备初步资格的 I-914。
- Cuban Adjustment Act、该法下遭虐待的配偶或子女、Haitian Refugee Immigration Fairness Act 的衍生身份、该法下遭虐待的衍生配偶或子女、IRCA §202 的古巴和海地入境者。
- Lautenberg 假释入境者、Foreign Operations, Export Financing, and Related Programs 法案下符合条件的越南／柬埔寨／老挝国民、INA §249 下自 1972 年 1 月 1 日前持续居住的 Registry 申请人、Amerasian Homecoming Act、符合条件的波兰或匈牙利假释入境者。
- NACARA §203 的尼加拉瓜及其他中美洲申请人、INA §289 下出生于加拿大的美国印第安人或法定 Texas Band of Kickapoo Indians 成员、FY2020 NDAA §7611 的 Liberian Refugee Immigration Fairness 申请人。

## SRC-314 难民、庇护调整身份与 INA 209(c)

- `policy-sources/2026-11-10-us-usc-8usc1159.html` → <https://uscode.house.gov/us/usc/t8/s1159/>
- `policy-sources/2026-11-19-us-ecfr-8cfr-part209.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=209>
- `policy-sources/2026-11-23-us-pm-v7-l-ch2.html` → <https://www.uscis.gov/policy-manual/volume-7-part-l-chapter-2>
- `policy-sources/2026-11-23-us-pm-v7-l-ch3.html` → <https://www.uscis.gov/policy-manual/volume-7-part-l-chapter-3>
- `policy-sources/2026-11-23-us-pm-v7-m-ch2.html` → <https://www.uscis.gov/policy-manual/volume-7-part-m-chapter-2>
- `policy-sources/2026-11-23-us-pm-v7-m-ch3.html` → <https://www.uscis.gov/policy-manual/volume-7-part-m-chapter-3>
- 8 U.S.C. §1159(c) 及 7 USCIS-PM L.3(A)、M.3(A) 对难民和庇护调整排除 §1182(a)(4)、(5)、(7)(A)。同法允许对其他适用事由作个案豁免，其中毒品贩运 (2)(C) 及指定安全事由 (3)(A)、(B)、(C)、(E) 除外。
- 难民调整要求难民身份未被终止。庇护调整在裁决时核对是否仍符合难民定义，或仍具备主庇护人的合资格配偶／子女关系，以及是否已在外国稳定安置。另核对累计在美时间与相应例外。SRC-314，8 U.S.C. §1159(a)–(b)、7 USCIS-PM L.2(B)–(E)、M.2(A)–(E)。[7 USCIS-PM L.2](https://www.uscis.gov/policy-manual/volume-7-part-l-chapter-2) · [7 USCIS-PM M.2](https://www.uscis.gov/policy-manual/volume-7-part-m-chapter-2)
- [Form I-602，Where to File](https://www.uscis.gov/i-602) 规定与 I-485 同件时邮寄，I-485 已递交时送相应审理办公室。

## SRC-315 军人入籍 INA 328、329

- `policy-sources/2026-11-10-us-usc-8usc1439.html` → <https://uscode.house.gov/us/usc/t8/s1439/>
- `policy-sources/2026-11-23-us-usc-8usc1440.html` → <https://uscode.house.gov/us/usc/t8/s1440/>
- `policy-sources/2026-11-19-us-ecfr-8cfr-part328.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=328>
- `policy-sources/2026-11-19-us-ecfr-8cfr-part329.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=329>
- `policy-sources/2026-11-23-us-pm-v12-i-ch2.html` → <https://www.uscis.gov/policy-manual/volume-12-part-i-chapter-2>
- `policy-sources/2026-11-23-us-pm-v12-i-ch3.html` → <https://www.uscis.gov/policy-manual/volume-12-part-i-chapter-3>
- [Naturalization Through Military Service，Application Process](https://www.uscis.gov/military/naturalization-through-military-service) 允许军人纸交或网申 N-400，并说明在役 N-426 与离役 DD-214／NGB-22 的证明方式。

## SRC-316 USCIS 费用与减免表

- `policy-sources/2026-11-23-us-g1055.pdf` → <https://www.uscis.gov/sites/default/files/document/forms/g-1055.pdf>
- `policy-sources/2026-11-23-us-i912instr.pdf` → <https://www.uscis.gov/sites/default/files/document/forms/i-912instr.pdf>
- `policy-sources/2026-11-19-us-ecfr-8cfr-part106.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=106>
- G-1055 p30 的 N-336 行列明适格 I-912 豁免为 USD 0。

## SRC-317 领馆办理费用

- `policy-sources/2026-11-19-us-ecfr-22cfr22.1.xml` → <https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-22.xml?section=22.1>
- 22 CFR §22.1 第 35(a) 项 *Determining Returning Resident Status* 对应 DS-117，费用 USD 180。第 32–34 项对应其他移民签证服务。

## SRC-318 EB-5 费用生效调整

- `policy-sources/2026-09-30-us-fr-2026-20016-eb5-fee-rule.txt` → <https://www.federalregister.gov/documents/full_text/text/2026/09/30/2026-20016.txt>

## SRC-319 H.R. 1 基准费率与 FY2027 调整

- `policy-sources/2026-04-29-us-fr-2026-08333-hr1-fees.html` → <https://www.federalregister.gov/documents/full_text/html/2026/04/29/2026-08333.html>
- `policy-sources/2026-10-01-us-fr-2026-20187-hr1-fees-fy2027.html` → <https://www.federalregister.gov/documents/full_text/html/2026/10/01/2026-20187.html>

### 任务 86 交叉核对

- SRC-079 复用 INA 101(a)(13)(C)、101(f)、216、216A、316、319(a)。SRC-080 复用 8 CFR 211.1、211.3、216、316、319、334。SRC-290 卷 12 G.2(A)–(C) 区分递交日前同住及持续到宣誓的有效婚姻与配偶公民身份。SRC-082 复用原 N-400 与 I-751 时间来源。
- SRC-298 的取消条件手册为卷 6 G.7，G.5 是区域中心项目表。旧投资期规则与 RIA 后投资规则分别按原始移民申请递交日使用。
- SRC-304 使用 HHS 地区指引与 USCIS 地区表。I-864P 同页首个未标地区表的旧值未采用。
- SRC-312 使用 USCIS 与联邦法规快照确认体检和疫苗要求。CDC 技术指引的独立原始抓取受阻，个别年龄／剂量交医师核对。
- SRC-314 的 7 USCIS-PM L.2(B) 与 M.2(A) 在裁决时核对一年实际在美。SRC-315 的 12 USCIS-PM I.3 表将二战指定期列至 1946-12-31。
- SRC-316 的 G-1055（11/19/26，物理页码）：p2 USCIS Immigrant Fee，p4 G-325R，p5 I-90，p9 I-130 / I-131A，p10 I-140，pp15–16 I-485，p17 I-526 / I-526E，p22 I-751，p26 I-829，pp27–28 I-907，p30 N-336 / N-400，Appendix B 为 I-131 与口岸假释费。N-336 明列纸申及网申两种金额。SRC-318 最终规则将 EB-5 新费应用于生效日及之后邮戳件。SRC-319 91 FR 62541–62542 区分庇护续期工卡加收费与假释／TPS 续期加收费，二者在该次调整均未上涨。

## SRC-320 BOE · LO 4/2000，外国人组织法

SRC-320 BOE · LO 4/2000，外国人组织法。

- `policy-sources/2026-11-23-es-lo4-2000.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2000-544>

## SRC-321 BOE · RD 1004/2015，入籍程序条例

SRC-321 BOE · RD 1004/2015，入籍程序条例。

- `policy-sources/2026-11-23-es-rd1004.html` → <https://www.boe.es/eli/es/rd/2015/11/06/1004/con>

## SRC-322 西班牙完整版关联文书

SRC-322a BOE · Orden JUS/1625/2016，入籍办理及附件。

- `policy-sources/2026-11-23-es-orden-jus1625.html` → <https://www.boe.es/eli/es/o/2016/09/30/jus1625/con>

SRC-322b BOE · Resolución 7/11/2022，考试豁免表。

- `policy-sources/2026-11-23-es-orden-dispensa.html` → <https://www.boe.es/diario_boe/txt.php?id=BOE-A-2022-19664>

## SRC-323 西班牙完整版关联文书

SRC-323a 司法部 · Información Nacionalidad。

- `policy-sources/2026-11-23-es-justicia-nacionalidad.html` → <https://www.mjusticia.gob.es/es/ciudadania/nacionalidad/informacion-nacionalidad>

SRC-323b 司法部 · Nueva tasa desde el 1 de enero de 2022。

- `policy-sources/2026-11-23-es-justicia-tasa-aviso.html` → <https://www.mjusticia.gob.es/es/atencion-ciudadano/avisos-centro-atencion/nueva-tasa-desde-enero-2015>

SRC-323c 司法部 · Residencia，入籍费及宣誓说明。

- `policy-sources/2026-11-23-es-justicia-residencia.html` → <https://www.mjusticia.gob.es/es/ciudadania/nacionalidad/que-es-nacionalidad/como-adquiere-nacionalidad/residencia>

SRC-323d 司法部 · 2021-09-03 未满 14 岁的代表申请说明。

- `policy-sources/2026-11-23-es-justicia-menores.pdf` → <https://www.mjusticia.gob.es/es/Ciudadano/Nacionalidad/Documents/Nota%20entrada%20en%20vigor%20Ley%208-2021.pdf>

SRC-323e 司法部电子政务 · Nacionalidad española por residencia。

- `policy-sources/2026-11-23-es-justicia-sede-nacionalidad.html` → <https://sede.mjusticia.gob.es/es/tramites/nacionalidad-espanola>

## SRC-324 移民部 · Hoja 50，欧盟长期居留

SRC-324 移民部 · Hoja 50，欧盟长期居留。

- `policy-sources/2026-11-23-es-hoja50.html` → <https://www.inclusion.gob.es/web/migraciones/w/50.-autorizacion-de-residencia-de-larga-duracion-ue>

## SRC-325 BOE · Orden PJC/617/2025，居留和证件费

SRC-325 BOE · Orden PJC/617/2025，居留和证件费。

- `policy-sources/2026-11-23-es-orden-pjc617.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2025-12056>

## SRC-326 西班牙完整版关联文书

SRC-326a BOE · Ley 31/2022，国家预算。

- `policy-sources/2026-11-23-es-ley31-2022.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2022-22128>

SRC-326b SEPE · Cuantías anuales，现行 IPREM／SMI 表。

- `policy-sources/2026-11-23-es-sepe-cuantias.html` → <https://www.sepe.es/HomeSepe/prestaciones-desempleo/Cuantias-anuales.html>

## SRC-327 BOE · RD 240/2007，EU／EEA／瑞士自由流动制度

SRC-327 BOE · RD 240/2007，EU／EEA／瑞士自由流动制度。

- `policy-sources/2026-11-23-es-rd240.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2007-4184>

## SRC-328 西班牙完整版关联文书

SRC-328a 移民部 · Hoja 63，永久家属卡。[官方原件的历史响应](https://web.archive.org/web/20260716204307id_/https://www.inclusion.gob.es/web/migraciones/w/63.-tarjeta-de-residencia-permanente-de-familiar-de-ciudadano-de-la-union-europea)

- `policy-sources/2026-11-23-es-hoja63.html` → <https://www.inclusion.gob.es/web/migraciones/w/63.-tarjeta-de-residencia-permanente-de-familiar-de-ciudadano-de-la-union-europea>

SRC-328b 移民部 · Instrucciones SEM 2/2025，西籍家属和长居衔接。[官方原件的历史响应](https://web.archive.org/web/20250714054618id_/https://www.inclusion.gob.es/documents/d/migraciones/instrucciones-sem-2-2025-sobre-la-residencia-temporal-de-familiares-de-personas-con-nacionalidad-espanola)

- `policy-sources/2026-11-23-es-sem2-2025.pdf` → <https://www.inclusion.gob.es/documents/d/migraciones/instrucciones-sem-2-2025-sobre-la-residencia-temporal-de-familiares-de-personas-con-nacionalidad-espanola>

## SRC-329 BOE · Orden PRE/1490/2012，自由流动居留证明

SRC-329 BOE · Orden PRE/1490/2012，自由流动居留证明。

- `policy-sources/2026-11-23-es-orden-pre1490.html` → <https://www.boe.es/eli/es/o/2012/07/09/pre1490>

## SRC-330 DOUE／BOE · Directiva 2004/38/CE 校正重刊 PDF

SRC-330 DOUE／BOE · Directiva 2004/38/CE 校正重刊 PDF。

- `policy-sources/2026-11-23-es-directiva2004-38.pdf` → <https://www.boe.es/doue/2004/229/L00035-00048.pdf>

## SRC-331 西班牙完整版关联文书

SRC-331a EUR-Lex · Directiva 2003/109/CE 合并文本。

- `policy-sources/2026-11-23-es-directiva2003-109.html` → <https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:02003L0109-20110520>

SRC-331b DOUE／BOE · Directiva 2003/109/CE 原始公布。

- `policy-sources/2026-11-23-es-directiva2003-109-boe.html` → <https://www.boe.es/buscar/doc.php?id=DOUE-L-2004-80112>

## SRC-332 BOE · Ley 14/2013，蓝卡及流动

SRC-332 BOE · Ley 14/2013，蓝卡及流动。

- `policy-sources/2026-11-23-es-ley14-2013.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2013-10074>

## SRC-333 西班牙完整版关联文书

SRC-333a 移民部 · Hoja 53，恢复国内长居。

- `policy-sources/2026-11-23-es-hoja53.html` → <https://www.inclusion.gob.es/web/migraciones/w/51.-residencia-de-larga-duracion-en-espana-del-residente-de-larga-duracion-ue-en-otro-eemm-de-la-ue-duplicar-0-1>

SRC-333b 移民部 · Hoja 54，恢复欧盟长居。

- `policy-sources/2026-11-23-es-hoja54.html` → <https://www.inclusion.gob.es/web/migraciones/w/51.-residencia-de-larga-duracion-en-espana-del-residente-de-larga-duracion-ue-en-otro-eemm-de-la-ue-duplicar-0-2>

SRC-333c 西班牙驻河内使馆 · 恢复长居办事表，有旧版条目，仅用于标明冲突。

- `policy-sources/2026-11-23-es-recuperacion-consulado-hanoi.pdf` → <https://www.exteriores.gob.es/DocumentosAuxiliaresSC/Vietnam/HANOI%20%28E%29/27a.%20Nacionales.RLD%20%28ES%29.pdf>

## SRC-334 BOE · Ley 19/2015，入籍费用法源

SRC-334 BOE · Ley 19/2015，入籍费用法源。

- `policy-sources/2026-11-23-es-ley19-2015.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2015-7851>

## SRC-335 西班牙完整版关联文书

SRC-335a Instituto Cervantes 布鲁塞尔 · CCSE 考试与费用。

- `policy-sources/2026-11-23-es-ccse-bruselas.html` → <https://bruselas.cervantes.es/es/examenes_espanol/ccse/ccse.htm?cadena_busqueda=2026>

SRC-335b Instituto Cervantes · Guía para la prueba CCSE。[官方原件的历史响应](https://web.archive.org/web/20260916054911id_/https://examenes.cervantes.es/sites/default/files/guia_prueba_ccse.pdf)

- `policy-sources/2026-11-23-es-ccse-guia.pdf` → <https://examenes.cervantes.es/sites/default/files/guia_prueba_ccse.pdf>

SRC-335c Instituto Cervantes · Términos y condiciones，报名条款。[官方原件的历史响应](https://web.archive.org/web/20260721214938id_/https://examenes.cervantes.es/es/node/1142109)，解开 HTTP gzip

- `policy-sources/2026-11-23-es-ccse-terminos.html` → <https://examenes.cervantes.es/es/node/1142109>

SRC-335d Instituto Cervantes · Precio de la prueba CCSE。[官方原件的历史响应](https://web.archive.org/web/20261004065910id_/https://examenes.cervantes.es/es/ccse/cuanto)，解开 HTTP gzip

- `policy-sources/2026-11-23-es-ccse-precio.html` → <https://examenes.cervantes.es/es/ccse/cuanto>

## SRC-336 Instituto Cervantes · DELE 2026 各国考试费表

SRC-336 Instituto Cervantes · DELE 2026 各国考试费表。[官方原件的历史响应](https://web.archive.org/web/20260521205136id_/https://examenes.cervantes.es/sites/default/files/ic-tabla-precios-dele-2026.pdf)

- `policy-sources/2026-11-23-es-dele-2026.pdf` → <https://examenes.cervantes.es/sites/default/files/ic-tabla-precios-dele-2026.pdf>

## SRC-337 西班牙完整版关联文书

SRC-337a BOE · Ley 19/2021，IMV。

- `policy-sources/2026-11-23-es-ley19-2021.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2021-21007>

SRC-337b BOE · RDL 3/2026，2026 非缴费型养老金金额。

- `policy-sources/2026-11-23-es-rdl3-2026.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2026-2548>

## SRC-338 西班牙完整版关联文书

SRC-338a BOE · RD 1155/2024 原始公报。

- `policy-sources/2026-11-23-es-publicacion-reglamento.html` → <https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-24099>

SRC-338b BOE · RD 316/2026 修订原文。

- `policy-sources/2026-11-23-es-rd316.html` → <https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-8284>

SRC-338c BOE · 最高法院 2026-07-08 判决及更正。

- `policy-sources/2026-11-23-es-ts-reglamento.html` → <https://www.boe.es/buscar/doc.php?id=BOE-A-2026-19632>

## SRC-339 CGPJ · Audiencia Nacional，学习停留的按居住入籍判决摘要

SRC-339 CGPJ · Audiencia Nacional，学习停留的按居住入籍判决摘要。

- `policy-sources/2026-11-23-es-cgpj-estudios.html` → <https://www.poderjudicial.es/cgpj/es/Poder-Judicial/Audiencia-Nacional/Jurisprudencia/Actualidad-Jurisprudencial/ci.AN-C-A--Estima-el-recurso-contra-resolucion-de-la-DGRN---que-acuerda-conceder-la-nacionalidad-espanola-por-residencia--Anula-la-misma-por-su-disconformidad-a-Derecho--La-permanencia-en-Espana-amparada-en-la-tarjeta-de-estudiante-o-en-autorizacion-de-estancia-para-cursar-estudios-no-puede-considerarse-que-reuna-las-notas-exigidas-de-residencia-legal--continuada-e-inmediatamente-anterior-a-la-peticion-previsto-en-el-art--22-3-del-CC-para-la-adquisicion-de-la-nacionalidad-.formato3>

## SRC-340 西班牙完整版关联文书

SRC-340a BOE · RD 126/2026，2026 SMI。

- `policy-sources/2026-11-23-es-smi2026.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2026-3815>

SRC-340b BOE · RDL 2/2015，劳动者法典。

- `policy-sources/2026-11-23-es-estatuto-trabajadores.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430>

## SRC-341 西班牙义务教育学龄与小学学年

SRC-341a BOE · LO 2/2006 art. 4.2 规定通常的义务教育年龄范围。

- `policy-sources/2026-11-23-es-educacion.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2006-7899>

SRC-341b BOE · RD 157/2022 art. 5.1–2 规定小学为义务教育，通常在满六岁的自然年进入一年级。

- `policy-sources/2026-11-23-es-primary-art5.xml` → <https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2022-3296/texto/bloque/a5>

SRC-341c 西班牙教育部 Eurydice España §4.1「Organisation of the school year」第 1–2 段说明，小学学生于九月开始上课，具体日期由各自治区教育当局确定。

- `policy-sources/2026-11-23-es-primary-calendar.html` → <https://eurydice.eacea.ec.europa.eu/eurypedia/spain/organisation-primary-education>

## SRC-342 西班牙完整版关联文书

SRC-342a BOE · 最高法院 2024-07-15 判决，入籍 art. 12.1。

- `policy-sources/2026-11-23-es-ts-nacionalidad.html` → <https://www.boe.es/buscar/doc.php?id=BOE-A-2024-18114>

SRC-342b BOE · Ley 8/2021，支持措施及民法修订。

- `policy-sources/2026-11-23-es-ley8-2021.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2021-9233>

## SRC-343 西班牙完整版关联文书

SRC-343a BOE · Ley 20/2011，Registro Civil。

- `policy-sources/2026-11-23-es-ley20-2011.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2011-12628>

SRC-343b 司法部 · 2021-12-22 公证宣誓声明指令。

- `policy-sources/2026-11-23-es-justicia-jura-notaria.pdf` → <https://www.mjusticia.gob.es/es/Ciudadano/Nacionalidad/Documents/Instruccion%20DGSJFP%20Notarias%20declaraciones%20nacionalidad%20residencia.pdf>

SRC-343c BOE · Ley 18/2014，民事登记公共服务费用。

- `policy-sources/2026-11-23-es-registro-civil-gratuidad.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2014-10517>

## SRC-344 Seguridad Social · Jubilación ordinaria，法定退休年龄

SRC-344 Seguridad Social · Jubilación ordinaria，法定退休年龄。

- `policy-sources/2026-11-23-es-edad-jubilacion.html` → <https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10963/28393/28396/28472?changeLanguage=es>

## SRC-345 西班牙完整版关联文书

SRC-345a 移民部 · Hoja 51，其他成员国长居者迁西。[官方原件的历史响应](https://web.archive.org/web/20260715201606id_/https://www.inclusion.gob.es/web/migraciones/w/51.-residencia-de-larga-duracion-en-espana-del-residente-de-larga-duracion-ue-en-otro-eemm-de-la-ue)

- `policy-sources/2026-11-23-es-hoja51.html` → <https://www.inclusion.gob.es/web/migraciones/w/51.-residencia-de-larga-duracion-en-espana-del-residente-de-larga-duracion-ue-en-otro-eemm-de-la-ue>

SRC-345b 移民部 · Hoja 52，上述持有人家属。[官方原件的历史响应](https://web.archive.org/web/20260715194414id_/https://www.inclusion.gob.es/web/migraciones/w/51.-residencia-de-larga-duracion-en-espana-del-residente-de-larga-duracion-ue-en-otro-eemm-de-la-ue-duplicar-0)

- `policy-sources/2026-11-23-es-hoja52.html` → <https://www.inclusion.gob.es/web/migraciones/w/51.-residencia-de-larga-duracion-en-espana-del-residente-de-larga-duracion-ue-en-otro-eemm-de-la-ue-duplicar-0>

## SRC-346 西班牙完整版关联文书

SRC-346a BOE · 西班牙—法国国籍协定。

- `policy-sources/2026-11-23-es-convenio-francia.html` → <https://www.boe.es/buscar/doc.php?id=BOE-A-2022-4916>

SRC-346b BOE · 司法部西法协定适用指令。

- `policy-sources/2026-11-23-es-convenio-francia-instruccion.html` → <https://www.boe.es/eli/es/ins/2022/03/31/%281%29/con>

## SRC-347 BOE · Ley 9/2011，领事收费

SRC-347 BOE · Ley 9/2011，领事收费。

- `policy-sources/2026-11-23-es-visa-tasas-consulares.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2011-8222>

## SRC-348 TJUE · C-432/20 判决官方公报摘要

SRC-348 TJUE · C-432/20 判决官方公报摘要。

- `policy-sources/2026-11-23-es-tjue-ltr-ausencias.pdf` → <https://curia.europa.eu/jcms/upload/docs/application/pdf/2022-01/cp220010es.pdf>

## SRC-349 BOE · RDL 3/2004，IPREM 制定机制

SRC-349 BOE · RDL 3/2004，IPREM 制定机制。

- `policy-sources/2026-11-23-es-iprem-ley-base.html` → <https://www.boe.es/buscar/act.php?id=BOE-A-2004-12010>

## SRC-440 入管法施行规则

- 第22、24、25、29条の4、別表第2。
- `policy-sources/2026-10-01-jp-egov-nyukanho-sekokisoku-current.xml` → <https://laws.e-gov.go.jp/api/2/law_data/356M50000010054_20261001_508M60000010047?response_format=xml&law_full_text_format=xml>

## SRC-441 入管法 2027-04-01 施行版

- 第22条第2項，永住义务；第22条の4、第22条の6，许可后的取消及变更。
- `policy-sources/2027-04-01-jp-egov-nyukanho-unenforced-r6-60.xml` → <https://laws.e-gov.go.jp/api/2/law_data/326CO0000000319_20270401_506AC0000000060?response_format=xml&law_full_text_format=xml>

## SRC-442 入管特例法

- 第4条及第23条，特別永住取得分流及再入国。
- `policy-sources/2026-06-14-jp-egov-tokureiho-current.xml` → <https://laws.e-gov.go.jp/api/2/law_data/403AC0000000071_20260614_507AC0000000039?response_format=xml&law_full_text_format=xml>

## SRC-443 入管法施行令与手续费版本

- 第25条及附则；历史及未来版本按收件日核对。
- `policy-sources/2026-11-23-jp-egov-nyukanho-sekorei.xml` → <https://laws.e-gov.go.jp/api/2/law_data/410CO0000000178?response_format=xml&law_full_text_format=xml>
- `policy-sources/2026-11-23-jp-egov-nyukanho-sekorei-revisions.json` → <https://laws.e-gov.go.jp/api/2/law_revisions/410CO0000000178>
- `policy-sources/2024-06-10-jp-egov-nyukanho-sekorei-fees.xml` → <https://laws.e-gov.go.jp/api/2/law_data/410CO0000000178_20240610_506CO0000000197?response_format=xml&law_full_text_format=xml>
- `policy-sources/2025-04-01-jp-egov-nyukanho-sekorei-fees.xml` → <https://laws.e-gov.go.jp/api/2/law_data/410CO0000000178_20250401_507CO0000000027?response_format=xml&law_full_text_format=xml>
- `policy-sources/2026-07-01-jp-egov-nyukanho-sekorei-fees.xml` → <https://laws.e-gov.go.jp/api/2/law_data/410CO0000000178_20260701_508CO0000000177?response_format=xml&law_full_text_format=xml>
- `policy-sources/2027-04-01-jp-egov-nyukanho-sekorei-fees.xml` → <https://laws.e-gov.go.jp/api/2/law_data/410CO0000000178_20270401_507CO0000000341?response_format=xml&law_full_text_format=xml>

## SRC-444 入管厅手续费改定及减额

- 收费告知、减免与困难人道资料、Q&A Q11、价目单与旧版变更。
- `policy-sources/2026-11-23-jp-isa-fees-reform.html` → <https://www.moj.go.jp/isa/01_00644.html>
- `policy-sources/2026-11-23-jp-isa-fees-waivers.html` → <https://www.moj.go.jp/isa/10_00273.html>
- `policy-sources/2026-11-23-jp-isa-fees-qa.html` → <https://www.moj.go.jp/isa/applications/faq/01_00650.html>
- `policy-sources/2026-10-01-jp-isa-fees-flyer.pdf` → <https://www.moj.go.jp/isa/content/001469198.pdf>
- `policy-sources/2026-11-23-jp-isa-fee-reduction-guidelines.pdf` → <https://www.moj.go.jp/isa/content/001469270.pdf>
- `policy-sources/2026-11-23-jp-isa-fees-2025.html` → <https://www.moj.go.jp/isa/11_00053.html>

## SRC-445 法务省帰化許可申請与法务局手引

- 提出方法、收费、动机书、语言、面谈与附件。法务局手引页码以 PDF 物理页为准。
- `policy-sources/2026-11-23-jp-moj-kika-application.html` → <https://www.moj.go.jp/ONLINE/NATIONALITY/6-2.html>
- `policy-sources/2026-11-22-jp-moj-kika-tebiki-r8-4.pdf` → <https://houmukyoku.moj.go.jp/kofu/page000001_00305.pdf>
- `policy-sources/2026-11-23-jp-tokyo-kika.html` → <https://houmukyoku.moj.go.jp/tokyo/page000001_00885.html>
- `policy-sources/2026-11-23-jp-shizuoka-kika-interview.pdf` → <https://houmukyoku.moj.go.jp/shizuoka/content/000135122.pdf>

## SRC-446 国籍法施行规则

- 第2条，递交、证明与宣誓。
- `policy-sources/2026-11-23-jp-egov-kokusekiho-sekokisoku.xml` → <https://laws.e-gov.go.jp/api/2/law_data/359M50000010039?response_format=xml&law_full_text_format=xml>

## SRC-447 戸籍法

- 第49条出生届；第102条の2帰化届。
- `policy-sources/2026-11-23-jp-egov-kosekiho.xml` → <https://laws.e-gov.go.jp/api/2/law_data/322AC0000000224?response_format=xml&law_full_text_format=xml>

## SRC-448 高度専門職省令与积分表

- 第1条第1項第1–3号各表、积分表 PDF p3（印刷 p2）及注、Q&A Q4–9、49。
- `policy-sources/2026-11-23-jp-egov-hsp-ordinance.xml` → <https://laws.e-gov.go.jp/api/2/law_data/426M60000010037?response_format=xml&law_full_text_format=xml>
- `policy-sources/2026-11-23-jp-isa-hsp-points.pdf` → <https://www.moj.go.jp/isa/content/001447348.pdf>
- `policy-sources/2026-11-23-jp-isa-hsp-qa.html` → <https://www.moj.go.jp/isa/applications/resources/newimmiact_3_qa.html>

## SRC-449 特別高度人材省令与 J-Skip 手续

- 省令本则、附则及官方说明和永住认定与回溯两分支。
- `policy-sources/2026-11-23-jp-egov-j-skip-ordinance.xml` → <https://laws.e-gov.go.jp/api/2/law_data/505M60000010025?response_format=xml&law_full_text_format=xml>
- `policy-sources/2026-11-23-jp-isa-j-skip.html` → <https://www.moj.go.jp/isa/applications/resources/nyuukokukanri01_00009.html>
- `policy-sources/2026-11-23-jp-isa-pr-j-skip-menu.html` → <https://www.moj.go.jp/isa/10_00226.html>
- `policy-sources/2026-11-23-jp-isa-pr-j-skip-recognized.html` → <https://www.moj.go.jp/isa/10_00227.html>
- `policy-sources/2026-11-23-jp-isa-pr-j-skip-retro.html` → <https://www.moj.go.jp/isa/10_00228.html>

## SRC-450 永住工作及家族材料清单

- 概要税务、年金、医疗、第18–21行；常见分支的材料窗口。
- `policy-sources/2026-11-23-jp-isa-pr-work-evidence.pdf` → <https://www.moj.go.jp/isa/content/001436512.pdf>
- `policy-sources/2026-11-23-jp-isa-pr-family-evidence.pdf` → <https://www.moj.go.jp/isa/content/001422055.pdf>
- `policy-sources/2026-11-23-jp-isa-pr-family.html` → <https://www.moj.go.jp/isa/applications/procedures/zairyu_eijyu01.html>
- `policy-sources/2026-11-23-jp-isa-pr-teijusha.html` → <https://www.moj.go.jp/isa/applications/procedures/zairyu_eijyu02.html>
- `policy-sources/2026-11-23-jp-isa-pr-regular.html` → <https://www.moj.go.jp/isa/applications/procedures/zairyu_eijyu03.html>
- `policy-sources/2026-11-23-jp-isa-pr-hsp-menu.html` → <https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri07_00131.html>
- `policy-sources/2026-11-23-jp-isa-pr-hsp80-other.html` → <https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri07_00132.html>

## SRC-451 在留资格取得与新生儿

- 在留資格取得「必要書類」、居民管理 Q&A 及永住者亲属资格。
- `policy-sources/2026-11-23-jp-isa-status-acquisition.html` → <https://www.moj.go.jp/isa/applications/procedures/16-10.html>
- `policy-sources/2026-11-23-jp-isa-resident-card-qa.html` → <https://www.moj.go.jp/isa/publications/faq/newimmiact_4_q-and-a_page3.html>
- `policy-sources/2026-11-23-jp-isa-pr-spouse-status.html` → <https://www.moj.go.jp/isa/applications/status/spouseorchildofpermanentresident.html>

## SRC-452 上陆许可基准省令与経営・管理改定

- 省令各资格表，経営・管理改定后的基准与更新过渡。
- `policy-sources/2026-11-23-jp-egov-landing-criteria.xml` → <https://laws.e-gov.go.jp/api/2/law_data/402M50000010016?response_format=xml&law_full_text_format=xml>
- `policy-sources/2026-11-23-jp-isa-business-manager.html` → <https://www.moj.go.jp/isa/applications/resources/10_00237.html>

## SRC-453 対日貢献旧指南

- 附 PDF 逐类别条件；旧指南适用至 SRC-114 的完整新版切换日。
- `policy-sources/2026-11-23-jp-isa-pr-contribution.html` → <https://www.moj.go.jp/isa/applications/resources/nyukan_nyukan36.html>
- `policy-sources/2026-11-23-jp-isa-pr-contribution-old.pdf` → <https://www.moj.go.jp/isa/content/930002484.pdf>

## SRC-454 学校教育法与外国儿童就学

- 学校教育法第17条及就学指引「基本的な考え方」。
- `policy-sources/2026-11-23-jp-egov-school-education.xml` → <https://laws.e-gov.go.jp/api/2/law_data/322AC0000000026?response_format=xml&law_full_text_format=xml>
- `policy-sources/2026-11-23-jp-mext-foreign-children-school.html` → <https://www.mext.go.jp/a_menu/shotou/clarinet/004/1415154_00003.htm>

## SRC-455 在留申請在线范围与支付

- 在线申请的适用范围、再入国在线手续和指定支付处理费用。
- `policy-sources/2026-01-05-jp-isa-online-scope.pdf` → <https://www.moj.go.jp/isa/content/001351658.pdf>
- `policy-sources/2026-11-23-jp-isa-online-fees.html` → <https://www.moj.go.jp/isa/11_00107.html>

## SRC-456 生活・就労ガイドブック

- 目录及第1章入国・在留手続；新版永住制度理解的内容参考。
- `policy-sources/2026-11-23-jp-isa-kikin-japanese-guide.html` → <https://www.moj.go.jp/isa/support/portal/guidebook_all.html>
- `policy-sources/2026-11-23-jp-isa-guidebook-entry.pdf` → <https://www.moj.go.jp/isa/content/930004717.pdf>

## SRC-457 特定在留カード

- 「手数料」；功能、电子证书及附加费。
- `policy-sources/2026-11-23-jp-isa-integrated-card.html` → <https://www.moj.go.jp/isa/tokutei.html>

## SRC-458 特定活動告示与就労资格资料

- 第36・37号及别表第6–8；以及可计入就労资格的资料和指定研究、信息处理说明。
- `policy-sources/2026-11-23-jp-isa-designated-activities-notice.html` → <https://www.moj.go.jp/isa/policies/bill/nyukan_hourei_h02.html>
- `policy-sources/2026-11-23-jp-isa-designated-activities-notice.pdf` → <https://www.moj.go.jp/isa/content/001360125.pdf>
- `policy-sources/2026-11-23-jp-isa-designated-work.pdf` → <https://www.moj.go.jp/isa/content/001436513.pdf>
- `policy-sources/2026-11-23-jp-isa-designated-activities-list.pdf` → <https://www.moj.go.jp/isa/content/001389017.pdf>
- `policy-sources/2026-11-23-jp-isa-designated-research.html` → <https://www.moj.go.jp/isa/applications/status/designatedactivities07.html>
- `policy-sources/2026-11-23-jp-isa-designated-information-processing.html` → <https://www.moj.go.jp/isa/applications/status/designatedactivities08.html>

## SRC-459 東京・広島法務局帰化证据清单

- 分国籍及办理局的纳税、社会保险、居住等证据窗口。
- `policy-sources/2026-11-23-jp-tokyo-kika-evidence.html` → <https://houmukyoku.moj.go.jp/tokyo/page000001_00891.html>
- `policy-sources/2026-11-23-jp-hiroshima-kika-china-evidence.html` → <https://houmukyoku.moj.go.jp/hiroshima/page000001_01045.html>

## SRC-460 国籍法官方参考英译

- 第6条 p3；以 SRC-111 日文为准。
- `policy-sources/2026-11-23-jp-moj-nationality-translation.pdf` → <https://www.japaneselawtranslation.go.jp/ja/laws/download/4713/14/s25Aa001470504je16.0_r4A102.pdf>

## SRC-461 普通再入国与難民旅行証明書手续

- 審査基準、手数料、オンライン申請及旅行证件的适用。
- 再入国許可申請「申請期間」「受付時間」「オンライン申請」分别说明出境前递交、平日窗口受理和在线合并申请条件。
- `policy-sources/2026-11-22-jp-isa-reentry-application.html` → <https://www.moj.go.jp/isa/immigration/procedures/16-5.html>
- `policy-sources/2026-11-23-jp-isa-refugee-travel-application.html` → <https://www.moj.go.jp/isa/refugee/procedures/16-7.html>
- `policy-sources/2026-11-23-jp-isa-refugee-travel.html` → <https://www.moj.go.jp/isa/refugee/procedures/ryokou_00001.html>

## SRC-462 驻外领事费用

- 领事费政令第1条第1項第5・6号，及省令本则与别表。
- `policy-sources/2026-11-23-jp-egov-consular-fees-order.xml` → <https://laws.e-gov.go.jp/api/2/law_data/327CO0000000074?response_format=xml&law_full_text_format=xml>
- `policy-sources/2026-11-23-jp-egov-consular-fees-regulation.xml` → <https://laws.e-gov.go.jp/api/2/law_data/327M50000020004?response_format=xml&law_full_text_format=xml>

## 德国完整版登记备注（第 20 阶段，任务 90）

SRC-100、101、103、106–108 复用已有快照。SRC-104、105 的议会材料继续保留，本次补入已公布的法令正文。柏林 LEA 的办事标准按当地范围使用。以下逐项列出快照对应的网址。

### SRC-410 Aufenthaltsverordnung（签发、处理、证件收费及境内申请）

对应 AufenthV §§ 39、41 的境内申请条件，以及 §§ 44–53 的费率、预缴、未成年人及减免。

- `policy-sources/2026-11-23-de-aufenthv.html` → <https://www.gesetze-im-internet.de/aufenthv/BJNR294510004.html>

### SRC-411 Einbürgerungstestverordnung 与联邦政府入籍收费答复

EinbTestV §§ 1–5 规定入籍考试构成、联邦考点费用和生效。BT-Drs. 20/8575 对问题 34 的答复载明欧元收费的起算期间。

- `policy-sources/2026-11-23-de-bt-20-8575.pdf` → <https://dserver.bundestag.de/btd/20/085/2008575.pdf>
- `policy-sources/2026-11-23-de-einbtestv-5.html` → <https://www.gesetze-im-internet.de/einbtestv/__5.html>
- `policy-sources/2026-11-23-de-einbtestv.html` → <https://www.gesetze-im-internet.de/einbtestv/BJNR164900008.html>

### SRC-412 Integrationskursverordnung（整合课程、考试与费用）

IntV §§ 9、17、20 涵盖课程分担、减免和结业考试。

- `policy-sources/2026-11-23-de-intv.html` → <https://www.gesetze-im-internet.de/intv/BJNR337000004.html>

### SRC-413 Bundesmeldegesetz（入住登记和住所证明）

BMG §§ 17、19、27 涵盖通常登记期限、住房提供者的证明及例外。

- `policy-sources/2026-11-23-de-bmg.html` → <https://www.gesetze-im-internet.de/bmg/BJNR108410013.html>

### SRC-414 柏林 LEA：Einbürgerung

使用 Voraussetzungen 和 Nachweis der staatsbürgerlichen Kenntnisse 两节，限当地受理和证明材料。

- `policy-sources/2026-11-23-de-berlin-einbuergerung.html` → <https://service.berlin.de/dienstleistung/318998/>

### SRC-415 柏林 LEA：生计审查与家庭需要

使用 Voraussetzungen、Krankenversicherung 和 Erforderliche Unterlagen，结合家庭成员与可计净收入评估需要。

- `policy-sources/2026-11-23-de-berlin-lebensunterhalt.html` → <https://service.berlin.de/dienstleistung/354205/>

### SRC-416 柏林 LEA：辅助保护者定居

使用 Voraussetzungen，区分辅助保护的裁量定居与 § 26 Abs. 3 请求权。

- `policy-sources/2026-11-23-de-berlin-subsidiaer.html` → <https://service.berlin.de/dienstleistung/352770/>

### SRC-417 柏林 LEA：企业经营者定居

使用 Voraussetzungen，核对实际企业经营、持续性及证明。

- `policy-sources/2026-11-23-de-berlin-selbstaendige.html` → <https://service.berlin.de/dienstleistung/326564/>

### SRC-418 柏林 LEA：子女定居

使用 Voraussetzungen 中 16 岁生日和成年家庭居留分支。

- `policy-sources/2026-11-23-de-berlin-kinder.html` → <https://service.berlin.de/dienstleistung/324863/>

### SRC-419 柏林 LEA：一般定居

使用 Voraussetzungen 交叉核对 § 9 的语言、知识、住房、养老与许可。

- `policy-sources/2026-11-23-de-berlin-allgemein.html` → <https://service.berlin.de/dienstleistung/121864/>

### SRC-420 欧盟蓝卡年度公告与联邦政府蓝卡指南

两份 BAnz 公告的 p1 分别覆盖 2025 和 2026 年；联邦指南用于岗位、认可、合同和低工资档。2024 年按 SRC-425 的当年计费上限核算。

- `policy-sources/2026-11-23-de-banz-2025-b2-blaue-karte.pdf` → <https://www.bundesanzeiger.de/pub/publication/6yuuiNCa7LgGKapMrQK/content/6yuuiNCa7LgGKapMrQK/BAnz%20AT%2004.12.2024%20B2.pdf>
- `policy-sources/2026-11-23-de-banz-2026-b3-blaue-karte.pdf` → <https://www.bundesanzeiger.de/pub/publication/REViP4bN6jVdpGxPaiQ/content/REViP4bN6jVdpGxPaiQ/BAnz%20AT%2018.12.2025%20B3.pdf?inline=>
- `policy-sources/2026-11-23-de-mig-blue-card.html` → <https://www.make-it-in-germany.com/en/visa-recognition/visa-types/eu-blue-card>
- `policy-sources/2026-11-23-de-mig-blue-card.pdf` → <https://www.make-it-in-germany.com/fileadmin/1_Rebrush_2022/a_Fachkraefte/PDF-Dateien/3_Visum_u_Aufenthalt/Visagrafik_DE/Visum_Blaue_Karte_DE.pdf>

### SRC-421 联邦政府 Make it in Germany：Niederlassungserlaubnis

使用联邦政府定居指南各路径的小节交叉核对一般、技术人员和蓝卡定居。

- `policy-sources/2026-11-23-de-mig-niederlassung.html` → <https://www.make-it-in-germany.com/de/ankommen-bleiben/dauerhaft-in-deutschland/niederlassungserlaubnis>

### SRC-422 FreizügG/EU（自由流动及永久居住权）

FreizügG/EU §§ 2–6、12 区分自由流动权源、通常及提前取得、永久居住权证明与失权。

- `policy-sources/2026-11-23-de-freizuegg.html` → <https://www.gesetze-im-internet.de/freiz_gg_eu_2004/BJNR198600004.html>

### SRC-423 SGB VI §§ 35、235（法定退休年龄）

§ 35 Satz 2 与 § 235 Abs. 2 的出生年表确定普通难民档的退休节点。

- `policy-sources/2026-11-23-de-sgb-vi-235.html` → <https://www.gesetze-im-internet.de/sgb_6/__235.html>
- `policy-sources/2026-11-23-de-sgb-vi-35.html` → <https://www.gesetze-im-internet.de/sgb_6/__35.html>

### SRC-424 BZRG §§ 46、51、52（前科消除与使用限制）

BZRG §§ 46、51、52 适用于是否已到消除期以及能否使用境外或既有裁判，结合 StAG § 12a 核对。

- `policy-sources/2026-11-23-de-bzrg-46.html` → <https://www.gesetze-im-internet.de/bzrg/__46.html>
- `policy-sources/2026-11-23-de-bzrg-51.html` → <https://www.gesetze-im-internet.de/bzrg/__51.html>
- `policy-sources/2026-11-23-de-bzrg-52.html` → <https://www.gesetze-im-internet.de/bzrg/__52.html>

### SRC-425 SVBezGrV 2024、2026 与 2026 年 Fachkräfte 工资公告

SVBezGrV § 4 与生效条款规定年度计费基数，2026 年 BAnz B2 的 p1 为首次技术人员许可的金额。

- `policy-sources/2026-11-23-de-banz-2026-b2-fachkraft.pdf` → <https://www.bundesanzeiger.de/pub/publication/qiidOUvOxBc4NVmtxPl/content/qiidOUvOxBc4NVmtxPl/BAnz%20AT%2018.12.2025%20B2.pdf>
- `policy-sources/2026-11-23-de-svbezgrv-2024.html` → <https://www.gesetze-im-internet.de/svbezgrv_2024/BJNR1420A0023.html>
- `policy-sources/2026-11-23-de-svbezgrv-2026.html` → <https://www.gesetze-im-internet.de/svbezgrv_2026/BJNR1160A0025.html>

### SRC-426 BMAS、RBSFV 2026、SGB XII § 28a（家庭需求标准）

RBSFV 2026 §§ 1–2、BMAS 的 2026 Regelbedarf 表与 SGB XII § 28a 为基本需求定档和按年调整依据。

- `policy-sources/2026-11-23-de-bmas-regelbedarf.html` → <https://www.bmas.de/DE/Arbeit/Grundsicherung-fuer-Arbeitsuchende/Leistungen-und-Bedarfe-in-der-Grundsicherung-fuer-Arbeitsuchende/leistungen-und-bedarfe-in-der-grundsicherung-fuer-arbeitsuchende-art.html>
- `policy-sources/2026-11-23-de-rbsfv-2026.pdf` → <https://www.gesetze-im-internet.de/rbsfv_2026/RBSFV_2026.pdf>
- `policy-sources/2026-11-23-de-sgb-28a.html` → <https://www.gesetze-im-internet.de/sgb_12/__28a.html>

### SRC-427 柏林 LEA：德国公民家属定居

使用 Voraussetzungen、Krankenversicherung，结合 SRC-435 的家庭收入判例。

- `policy-sources/2026-11-23-de-berlin-de-familie.html` → <https://service.berlin.de/dienstleistung/327012/>

### SRC-428 柏林 LEA：难民定居与两档生计

使用 Gesicherter Lebensunterhalt durch eigenes Einkommen 的两档定义，仅适用于柏林资料所述情形。

- `policy-sources/2026-11-23-de-berlin-fluechtlinge.html` → <https://service.berlin.de/dienstleistung/326554/>

### SRC-429 柏林 LEA：Daueraufenthalt–EU

使用 Voraussetzungen 下的 Altersversorgung、Krankenversicherung 等小节及 Gebühren。

- `policy-sources/2026-11-23-de-berlin-daueraufenthalt-eu.html` → <https://service.berlin.de/dienstleistung/324281/>

### SRC-430 柏林 LEA：Fachkräfte 定居

使用 Voraussetzungen 中的 Arbeitsplatz、Altersversorgung 和语言条件。

- `policy-sources/2026-11-23-de-berlin-fachkraefte.html` → <https://service.berlin.de/dienstleistung/326558/>

### SRC-431 柏林 LEA：蓝卡定居

使用 Voraussetzungen，核对持卡、合格就业、缴费和德语档。

- `policy-sources/2026-11-23-de-berlin-blaue-karte.html` → <https://service.berlin.de/dienstleistung/326556/>

### SRC-432 BAMF：LiD 实施说明及整合课程结业标准

ZQ DaZ 的章节 Abschluss des Integrationskurses（印刷页 180）说明 LiD 结业成绩；Durchführungshinweise Nr. 4、12 说明外部考生费用。

- `policy-sources/2026-11-23-de-bamf-daz-abschluss.pdf` → <https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Integrationskurse/Lehrkraefte/konzeption-fuer-die-zusatzqualifizierung-von-lehrkraeften-neu-pdf.pdf?__blob=publicationFile&v=6>
- `policy-sources/2026-11-23-de-bamf-lid.pdf` → <https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Integrationskurse/Kurstraeger/Traegerrundschreiben/Anlagen/2023/traegerrundschreiben-20230425-03-anlage2.pdf?__blob=publicationFile&v=3>

### SRC-433 PAuswGebV 与 2026 年身份证收费修正

PAuswGebV § 1 Abs. 1 与 2026 I Nr. 31 Art. 4、10 共同确定身份证两档费率和生效日。

- `policy-sources/2026-11-23-de-bgbl-ausweis-2026-31.pdf` → <https://www.recht.bund.de/bgbl/1/2026/31/regelungstext.pdf?__blob=publicationFile>
- `policy-sources/2026-11-23-de-pauswgebv.html` → <https://www.gesetze-im-internet.de/pauswgebv/__1.html>

### SRC-434 2017 年居留收费调整的议会资料与公报索引、2023 年加急收费公报

2017 年原刊正文未取得，使用公报目录及 BT-Drs. 18/12050 Art. 2–3 与委员会报告。加急附加费以 2023 I Nr. 290 Art. 3、13 为据。§ 35 未成年特例的历史起算仍列 PD-359。

- `policy-sources/2026-11-23-de-bgbl-gebuehren-2017-index.html` → <https://www.bgbl.de/xaver/bgbl/start.xav?start=%2F%2F%2A%5B%40attr_id%3D%27I_2017_47_inhaltsverz%27%5D>
- `policy-sources/2026-11-23-de-bt-18-12050.pdf` → <https://dserver.bundestag.de/btd/18/120/1812050.pdf>
- `policy-sources/2026-11-23-de-gebuehren-2017-beschluss.pdf` → <https://dserver.bundestag.de/btd/18/124/1812402.pdf>
- `policy-sources/2026-11-23-de-bundesgesetzblatt-2023-290.pdf` → <https://www.recht.bund.de/bgbl/1/2023/290/regelungstext.pdf?__blob=publicationFile&v=2>

### SRC-435 BVerwG 1 C 12.10、1 C 21.09（家庭生计）

1 C 12.10、1 C 21.09 的 Leitsätze 和 Entscheidungsgründe 涵盖特定德国家属的家庭缺口及供养范围。

- `policy-sources/2026-11-23-de-bverwg-1c12-10.html` → <https://www.bverwg.de/160811U1C12.10.0>
- `policy-sources/2026-11-23-de-bverwg-1c21-09.html` → <https://www.bverwg.de/161110U1C21.09.0>

### SRC-436 SGB VI §§ 159、160（年度养老计费上限）

SGB VI §§ 159、160 规定养老计费上限的调整和年度条例。

- `policy-sources/2026-11-23-de-sgb-vi-159.html` → <https://www.gesetze-im-internet.de/sgb_6/__159.html>
- `policy-sources/2026-11-23-de-sgb-vi-160.html` → <https://www.gesetze-im-internet.de/sgb_6/__160.html>

### SRC-437 指令 2003/109/EG（欧盟长期居民，合并文本）

欧盟出版局合并文本 Art. 3–7、9 涵盖适用范围和长期居民资格。跨成员国折算须同时满足德国转置条文。

- `policy-sources/2026-11-23-de-eu-2003-109-de.html` → <https://publications.europa.eu/resource/cellar/9d5fe9f4-69bd-11f1-ae88-01aa75ed71a1.0005.02/DOC_1>

### SRC-438 BGBl. 2022 I S. 2817 及 2026 I Nr. 111、221、318（移民法修正及生效）

2022 I S. 2817 Art. 2 Nr. 1、Art. 4 修改 § 26 Abs. 3。自 2023-01-01 起，两档均核对 BAMF 的 Widerruf／Rücknahme 通知。普通档自 2026-06-12 起增加 Entzug，§ 52 的辅助保护引文同步更新。见 2026 I Nr. 111 Art. 2 Nr. 12、Art. 7 Nr. 2、Art. 13 Abs. 2。Nr. 221、318 保留档案的后续修法版本。

- `policy-sources/2026-11-23-de-bundesgesetzblatt-2026-111.pdf` → <https://www.recht.bund.de/bgbl/1/2026/111/regelungstext.pdf?__blob=publicationFile>
- `policy-sources/2026-11-23-de-bundesgesetzblatt-2026-221.pdf` → <https://www.recht.bund.de/bgbl/1/2026/221/regelungstext.pdf?__blob=publicationFile>
- `policy-sources/2026-11-23-de-bundesgesetzblatt-2026-318.pdf` → <https://www.recht.bund.de/bgbl/1/2026/318/regelungstext.pdf?__blob=publicationFile>

### SRC-439 BGBl. 2023 I Nr. 217（技术移民法改革与生效）

2023 I Nr. 217 Art. 1 Nr. 7、Art. 2 Nr. 12、Art. 12 规定蓝卡和技术人员定居改革的分段施行。

- `policy-sources/2026-11-23-de-bundesgesetzblatt-2023-217.pdf` → <https://www.recht.bund.de/bgbl/1/2023/217/regelungstext.pdf?__blob=publicationFile>

## 加拿大完整版（第 20 阶段，任务 85）

SRC-074–078 的八份时间计算快照沿用原登记。下列编号按主题成组；组内法律、部长指令、临时政策和办理指南的效力分别按文件及其生效日判读。PDF 定位使用物理页序。

### SRC-260 Citizenship Act 与两部 Citizenship Regulations

- a · `2026-11-23-ca-citizenship-act.xml`（XML current 2025-12-29 / last amended 2025-12-15）。[官方原文](https://laws-lois.justice.gc.ca/eng/XML/C-29.xml)
- b · `2026-11-23-ca-citizenship-regulations.xml`（XML current 2026-10-29 / last amended 2026-10-23）。[官方原文](https://laws-lois.justice.gc.ca/eng/XML/SOR-93-246.xml)
- c · `2026-11-23-ca-citizenship-regulations-no2.xml`（XML current 2026-07-21 / last amended 2026-07-15）。[官方原文](https://laws-lois.justice.gc.ca/eng/XML/SOR-2015-124.xml)

### SRC-261 Immigration and Refugee Protection Act 与 Regulations

- a · `2026-11-23-ca-irpa.xml`（XML current 2026-09-30 / last amended 2026-03-26）。[官方原文](https://laws-lois.justice.gc.ca/eng/XML/I-2.5.xml)
- b · `2026-11-23-ca-irpr.xml`（XML current 2026-10-29 / last amended 2026-10-23）。[官方原文](https://laws-lois.justice.gc.ca/eng/XML/SOR-2002-227.xml)

### SRC-262 IRCC 成人及未成年人入籍指南、CRA 税务指引

- a · `2026-11-23-ca-citizenship-eligibility.html`（2026-04-21）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/adult-minor/who.html)
- b · `2026-11-23-ca-citizenship-adult-guide.html`（2026-06-23）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/cit0002.html)
- d · `2026-11-23-ca-citizenship-minor-51-guide.html`（2026-03-24）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/cit0403.html)
- e · `2026-11-23-ca-citizenship-minor-52-details.html`（2025-09-11）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/adult-minor/who/minor-types.html)
- f · `2026-11-23-ca-citizenship-prohibitions.html`（2025-09-04）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/situtations-prevent-citizenship.html)
- g · `2026-11-23-ca-cra-newcomers.html`（2026-08-03）。[官方原文](https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/individuals-leaving-entering-canada-non-residents/newcomers-canada-immigrants.html)
- h · `2026-11-23-ca-citizenship-minor-52-form.html`（2026-02-24）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/cit0003.html)

### SRC-263 IRCC 入籍语言、考试及豁免

- a · `2026-11-23-ca-citizenship-language.html`（2025-09-11）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/language-proof.html)
- b · `2026-11-23-ca-citizenship-test.html`（2026-03-31）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/test/study.html)
- c · `2026-11-23-ca-citizenship-waiver.html`（2026-03-05）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/waiver/who.html)

### SRC-264 IRCC 费用表与生效日期

- a · `2026-11-23-ca-fee-list.html`（2026-11-10）。[官方原文](https://ircc.canada.ca/english/information/fees/fees.asp)
- b · `2026-11-23-ca-fee-changes.html`（2026-09-21）。[官方原文](https://ircc.canada.ca/english/information/fees/fee-changes.asp)
- c · `2026-11-23-ca-citizenship-fee.html`（2026-03-27）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/right-citizenship-fee-increasing.html)

### SRC-265 IRCC 永居身份、PR card 与 PRTD

- a · `2026-11-23-ca-pr-status.html`（2026-04-09）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/permanent-residents/status.html)
- b · `2026-11-23-ca-pr-card-guide.html`（2026-10-16）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5445-applying-permanent-resident-card-card-first-application-replacement-renewal-change-gender-identifier.html)
- c · `2026-11-23-ca-prtd-guide.html`（2025-07-30）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5529-applying-permanent-resident-travel-document.html)
- d · `2026-11-23-ca-pr-residency-pdi.html`（2023-09-01）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/card/permanent-resident-determination.html)

### SRC-266 IRCC 准入、体检、警证与生物识别

- a · `2026-11-23-ca-inadmissibility.html`（2026-07-23）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/admissibility-enforcement/inadmissibility/reasons.html)
- b · `2026-11-23-ca-medical-pr.html`（2026-08-04）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams/requirements-permanent-residents.html)
- c · `2026-11-23-ca-police.html`（2026-02-19）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates.html)
- d · `2026-11-23-ca-medical-excessive-demand.html`（2026-07-23）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/admissibility-enforcement/inadmissibility/medical.html)
- e · `2026-11-23-ca-biometrics.html`（2026-11-19）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/biometrics/who-needs-to-give.html)
- f · `2026-11-23-ca-medical-public-policy.html`（2024-10-04）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/public-policies/excempt-ime-2024.html)
- g · `2026-11-23-ca-police-validity.html`。2026-02-19。“How long your police certificate is valid” 分别说明现居国的六个月效期和原居国的签发时点。“If you need a request letter” 说明可应 IRCC 要求补交。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates/when.html)
- h · `2026-11-23-ca-pnp-checklist.pdf`。IMM 0199（2026-05），第 3 页第 11 项，Base PNP 的警证签发时点。
- `policy-sources/2026-11-23-ca-pnp-checklist.pdf` → <https://www.canada.ca/content/dam/ircc/documents/pdf/english/kits/forms/imm0199/01-05-2026/imm0199e.pdf>
- i · `2026-11-23-ca-quebec-checklist.pdf`。IMM 5690（2026-05），第 3 页第 11 项，魁省技术移民的联邦警证签发时点。
- `policy-sources/2026-11-23-ca-quebec-checklist.pdf` → <https://www.canada.ca/content/dam/ircc/documents/pdf/english/kits/forms/imm5690/01-05-2026/imm5690e.pdf>
- j · `2026-11-23-ca-police-hong-kong.html`。IRCC 香港指引（2026-03-10）“Police certificates and IRCC requirements” 第 1–3 项。IRCC 收到申请后按需发信，香港警方收到该信后办理，并将警证直送 IRCC。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates/how/hong-kong.html)
- k · `2026-11-23-ca-police-dubai.html`。Dubai Police “Police Clearance Certificate” 服务说明首段末句，证书自签发起有效三个月。[官方原文](https://sps.dubaipolice.gov.ae/wps/wcm/connect/DubaiPolice_en/DubaiPolice/Our-Services/Good-Conduct-Certificate?presentationtemplate=DubaiPolice_Design_2_0/details)

### SRC-267 IRCC 三类 Express Entry 项目的资格

- a · `2026-11-23-ca-ee-fsw.html`（2026-11-18）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html)
- b · `2026-11-23-ca-ee-cec.html`（2026-11-18）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/canadian-experience-class.html)
- c · `2026-11-23-ca-ee-fst.html`（2026-11-18）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-trades.html)

### SRC-268 IRCC Express Entry 资金、语言与学历认证

- a · `2026-11-23-ca-ee-funds.html`（2026-11-18）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html)
- b · `2026-11-23-ca-ee-language.html`（2026-10-16）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test.html)
- c · `2026-11-23-ca-ee-eca.html`（2026-10-16）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessment.html)

### SRC-269 IRCC Express Entry 部长指令、临时政策、排名与邀请

- a · `2026-11-23-ca-ee-mi-index.html`（2026-11-18）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-application-management-system.html)
- b · `2026-11-23-ca-ee-changes.html`（2026-11-18）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/changes.html)
- c · `2026-11-23-ca-ee-lmia-policy.html`（2026-11-03）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/public-policies/exempt-lmia-express-entry.html)
- d · `2026-11-23-ca-ee-rounds.html`（2026-10-16）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html)
- e · `2026-11-23-ca-ee-mi.html`（2026-11-18）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-application-management-system/current.html)
- f · `2026-11-23-ca-ee-amendment-2.html`（2026-11-18）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-application-management-system/amendment-2026-2.html)
- g · `2026-11-23-ca-ee-crs.html`（2026-11-03）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html)
- h · `2026-11-23-ca-ee-amendment-1.html`（2026-11-03）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-application-management-system/amendment-2026-1.html)
- i · `2026-11-23-ca-ee-high-wage.html`（2026-11-23）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/high-wage.html)

### SRC-270 IRCC Atlantic Immigration Program

- a · `2026-11-23-ca-aip-eligibility.html`（2026-05-28）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate/eligibility.html)
- b · `2026-11-23-ca-aip-job.html`（2026-09-22）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate/job-offer.html)
- c · `2026-11-23-ca-aip-funds.html`（2026-05-28）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/proof-funds.html)
- d · `2026-11-23-ca-aip-program.html`（2026-06-22）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate.html)
- e · `2026-11-23-ca-aip-language.html`（2026-05-28）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/language-testing.html)
- f · `2026-11-23-ca-aip-work.html`（2026-05-28）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate/work-experience.html)
- g · `2026-11-23-ca-aip-education.html`（2026-06-22）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/education-assessment.html)
- h · `2026-11-23-ca-aip-settlement.html`（2026-05-28）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/settlement-service-provider-organizations.html)
- i · `2026-11-23-ca-aip-institutions.html`（2025-02-27）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/post-secondary-institutions.html)

### SRC-271 IRCC 省提名联邦阶段、递交通道及 BC 提名后指引

- a · `2026-11-23-ca-pnp.html`（2026-09-14）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html)
- b · `2026-11-23-ca-pnp-base.html`（2026-06-05）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees/non-express-entry.html)
- c · `2026-11-23-ca-pnp-ee.html`（2026-04-17）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees/express-entry.html)
- d · `2026-11-23-ca-bc-nominees.html`（2025-09-10）。“Post-nomination support for workers” 首段及 “Conditions of nomination” 首段，核对证书上的联邦递交期限和在审期间的提名条件。[官方原文](https://www.welcomebc.ca/immigrate-to-b-c/for-nominees)
- e · `2026-11-23-ca-pnp-federal-intake.html`（2026-03-23）。“Confirmation of provincial nomination” 的有效期段及 “Atlantic Immigration Program (AIP)” 的背书有效期段，完整申请在到期日当天收件仍有效。审理期间自然到期无须延证。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/economic-classes/procedures-centralized-intake-office-paper-based-non-applications.html)
- f · `2026-11-23-ca-pnp-ee-nomination.html`（2026-03-24）。“If the province or territory withdraws your nomination” 的 Situation 2 末段，递交前被撤回须拒绝邀请，递交后撤回则 IRCC 拒绝该申请。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees/express-entry/get-confirm-nomination.html)

### SRC-272 Ontario Workforce Priority 法规、资格及程序

- a · `2026-11-23-ca-ontario-reg.html`（见快照页内版本）。[官方原文](https://www.ontario.ca/laws/regulation/170422)
- b · `2026-11-23-ca-ontario-workforce.html`（见快照页内版本）。[官方原文](https://www.ontario.ca/page/ontario-workforce-priority-stream)
- c · `2026-11-23-ca-ontario-updates.html`（见快照页内版本）。[官方原文](https://www.ontario.ca/page/2026-ontario-immigrant-nominee-program-updates)
- d · `2026-11-23-ca-ontario-application.html`（见快照页内版本）。[官方原文](https://www.ontario.ca/page/oinp-application-process)

### SRC-273 Québec PSTQ、CSQ、自足金、法语及价值观

- b · `2026-11-23-ca-quebec-requirements.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/skilled-workers/skilled-worker-selection-program/requirements)
- c · `2026-11-23-ca-quebec-invitations.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/skilled-workers/skilled-worker-selection-program/invitation)
- d · `2026-11-23-ca-quebec-apply.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/skilled-workers/skilled-worker-selection-program/applying)
- e · `2026-11-23-ca-quebec-federal.html`（2025-06-12）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/quebec-skilled-workers/eligibility.html)
- f · `2026-11-23-ca-quebec-funds.pdf`（见快照页内版本）。
- `policy-sources/2026-11-23-ca-quebec-funds.pdf` → <https://cdn-contenu.quebec.ca/cdn-contenu/immigration/formulaires/fr/bareme_autonomie_financiere_programmes_immigration.pdf>
- g · `2026-11-23-ca-quebec-values.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/receiving-attestation-values)
- h · `2026-11-23-ca-quebec-values-test.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/receiving-attestation-values/online-assessment-attestation-values)
- i · `2026-11-23-ca-quebec-examination.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/skilled-workers/skilled-worker-selection-program/examination)
- j · `2026-11-23-ca-quebec-french.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/skilled-workers/skilled-worker-selection-program/requirements/knowledge-french)
- k · `2026-11-23-ca-quebec-regulated.pdf`（见快照页内版本）。
- `policy-sources/2026-11-23-ca-quebec-regulated.pdf` → <https://cdn-contenu.quebec.ca/cdn-contenu/immigration/formulaires/fr/PSTQ/LIS_PSTQ_PTA_Professions_reglementees.pdf>
- l · `2026-11-23-ca-quebec-achievements.pdf`（见快照页内版本）。
- `policy-sources/2026-11-23-ca-quebec-achievements.pdf` → <https://cdn-contenu.quebec.ca/cdn-contenu/immigration/formulaires/fr/PSTQ/LIS_PSTQ_Accomplissements_exceptionnels.pdf>
- m · `2026-11-23-ca-quebec-federal-apply.html`（2026-08-04）。“You must now apply online” 下的 CSQ 第一项，确认已递交申请的 CSQ 在 IRCC 作出决定前继续有效。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/quebec-skilled-workers/apply.html)

### SRC-274 IRCC 配偶、伴侣与子女担保

- a · `2026-11-23-ca-family-sponsor.html`（2026-06-23）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/eligibility.html)
- b · `2026-11-23-ca-family-sponsored.html`（2026-09-11）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/who-you-can-sponsor.html)
- c · `2026-11-23-ca-family-guide.html`（2026-04-23）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5289-sponsor-your-spouse-common-law-partner-conjugal-partner-dependent-child-complete-guide.html)
- d · `2026-11-23-ca-family-income.html`（2025-07-29）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm1283.html)
- e · `2026-11-23-ca-family-status-policy.html`（2025-11-26）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/non-economic-classes/family-class-spouse.html)
- f · `2026-11-23-ca-family-lack-status-policy.html`（2018-03-12）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/immigration-refugee-protection-act-spousal-policy.html)
- g · `2022-09-01-ca-family-spouse-checklist.pdf`。IMM 5533（2022-09），第 6 页第 3 项 “For Minor Child(ren)”。担保人非另一法定家长时，按每名随行未成年人核对同意、监护安排或缺件说明。[官方原文](https://www.canada.ca/content/dam/ircc/documents/pdf/english/kits/forms/imm5533/01-09-2022/imm5533e.pdf)
- `policy-sources/2022-09-01-ca-family-spouse-checklist.pdf` → <https://www.canada.ca/content/dam/ircc/documents/pdf/english/kits/forms/imm5533/01-09-2022/imm5533e.pdf>

### SRC-275 Québec 家庭担保承诺、收入、限额与费用

- a · `2026-11-23-ca-quebec-family.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-spouse-conjugal-partner)
- b · `2026-11-23-ca-quebec-child.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-dependent-child)
- c · `2026-11-23-ca-quebec-sponsor-cap.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/rules-reception-applications)
- d · `2026-11-23-ca-quebec-family-income.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/calculating-income)
- e · `2026-11-23-ca-quebec-family-eligibility.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-spouse-conjugal-partner/verifying-your-eligibility)
- f · `2026-11-23-ca-quebec-family-undertaking.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-spouse-conjugal-partner/submitting-undertaking-application)
- g · `2026-11-23-ca-quebec-child-eligibility.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-dependent-child/verifying-your-eligibility)
- h · `2026-11-23-ca-quebec-child-undertaking.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-dependent-child/undertaking-application)
- i · `2026-11-23-ca-quebec-family-duration.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-spouse-conjugal-partner/responsibilities-undertaking)
- j · `2026-11-23-ca-quebec-family-relationship.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-spouse-conjugal-partner/verifying-eligibility-spouse-conjugal-partner)
- k · `2026-11-23-ca-quebec-child-relationship.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/sponsor-family-member/sponsoring-dependent-child/verifying-eligibility-child)
- l · `2026-11-23-ca-quebec-family-undertaking-form.pdf`（见快照页内版本）。
- `policy-sources/2026-11-23-ca-quebec-family-undertaking-form.pdf` → <https://cdn-contenu.quebec.ca/cdn-contenu/immigration/formulaires/fr/Regroupement_familial/FO_engagement_regroupement_familial_A0546GF.pdf?1649339295=>

### SRC-276 IRCC 类别抽选与其他项目受理公告、MIFI 受理规则

- a · `2026-11-23-ca-category-rounds.html`（2026-11-18）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html)
- b · `2026-11-23-ca-parents-grandparents.html`（2026-08-18）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/sponsor-parents-grandparents.html)
- c · `2026-11-23-ca-quebec-reception.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/en/immigration/permanent/rules-procedures)

### SRC-277 StatCan LICO、IRCC 递交、警证与 offer

- a · `2026-11-23-ca-statcan-lico.html`（2026-04-29）。[官方原文](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1110024101)
- b · `2026-11-23-ca-ee-apply.html`（2026-11-18）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/apply-permanent-residence.html)
- c · `2026-11-23-ca-ee-police.html`（2026-10-16）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/police-certificates.html)
- d · `2026-11-23-ca-ee-job-offers.html`（2026-11-18）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/job-offer.html)

### SRC-278 Québec Gazette 魁省移民法规及 MIFI 法文要求

- b · `2026-11-23-ca-quebec-gazette.pdf`（见快照页内版本）。
- `policy-sources/2026-11-23-ca-quebec-gazette.pdf` → <https://www.publicationsduquebec.gouv.qc.ca/fileadmin/gazette/pdf_encrypte/lois_reglements/2026F/88289.pdf>
- e · `2026-11-23-ca-quebec-pstq-gazette.pdf`。印刷页 4959–4961 对应 PDF 第 3–5 页，印刷页 4972 对应 PDF 第 16 页。
- `policy-sources/2026-11-23-ca-quebec-pstq-gazette.pdf` → <https://www.publicationsduquebec.gouv.qc.ca/fileadmin/gazette/pdf_encrypte/lois_reglements/2023F/80921.pdf>
- f · `2026-11-23-ca-quebec-procedure-gazette.pdf`（见快照页内版本）。
- `policy-sources/2026-11-23-ca-quebec-procedure-gazette.pdf` → <https://www.publicationsduquebec.gouv.qc.ca/fileadmin/gazette/pdf_encrypte/lois_reglements/2024F/84053.pdf>
- g · `2026-11-23-ca-quebec-req-fr.html`（见快照页内版本）。[官方原文](https://www.quebec.ca/immigration/permanente/travailleurs-qualifies/programme-selection-travailleurs-qualifies/exigences)

### SRC-279 OINP 雇主、AIP 清单、IRCC 医师政策及 Canada Gazette PNP 修订

- a · `2026-11-23-ca-ontario-employer-guide.html`（见快照页内版本）。[官方原文](https://www.ontario.ca/page/oinp-employer-guide?redirect_id=page%2Fontario-immigrant-nominee-program-oinp-employer-guide&redirect_year=2026?redirect_id=page%2Foinp-employer-job-offer-streams-employer-guide&redirect_year=2026)
- b · `2026-11-23-ca-aip-checklist.pdf`（见快照页内版本）。
- `policy-sources/2026-11-23-ca-aip-checklist.pdf` → <https://www.canada.ca/content/dam/ircc/documents/pdf/english/kits/forms/imm0155/01-01-2025/imm0155e.pdf>
- c · `2026-11-23-ca-ee-doctors.html`（2023-05-02）。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/public-policies/physicians-4-2023.html)
- d · `2026-11-23-ca-pnp-gazette.html`（2026-03-31）。[官方原文](https://gazette.gc.ca/rp-pr/p2/2026/2026-04-08/html/sor-dors63-eng.html)
- e · `2026-05-28-ca-aip-pr-application.html`。IRCC AIP 申请指引（2026-05-28）“Police certificates and clearances” 第 1–2 段，允许应要求补交，警证通常自签发日起有效一年。“If a minor (child) is immigrating without both parents or guardians (IMM 5604)” 列出同意或替代证明。[官方原文](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate/permanent-residence.html)

## 爱尔兰完整版来源定位（任务 89）

沿用 SRC-091 的编纂版 ss14–18、29A（PDF pp19–28、35–36）、SRC-095 的 ISD 身份与居住评分、签发及补件指引、SRC-096 的升级与家庭团聚 FAQ，以及 SRC-097 的申请表与维持条件。以下 PDF 页码按物理页序。

- **SRC-380** regs. 9–10、13；Forms 8–11；替换 Form 8 §§8、11–12 与 Form 11 §5。
- **SRC-381** Proof of identity、Proof of residence；Residency Affidavit；Changes to citizenship for people granted International Protection。
  - `2026-11-23-ie-citizen-affidavit.pdf` 对应 [官方 PDF](https://www.irishimmigration.ie/wp-content/uploads/citizenship/residency-affidavit-proof-form-citizenship-0092026.pdf)。
- **SRC-382** Eligibility；What is e-Vetting?。
- **SRC-383** Act ss4–5、9、19；S.I. 421/2025 regs. 1–5。
- **SRC-095** Guide 的 Reckonable Residence for Refugees or people with international protection、70 Days Absence Rule 及 Document requirements for minors。难民专项区分递交前一年与此前累计期，并说明部长可按个案豁免。
- **SRC-095** Guide 的 Reckonable Residence for Citizens of an EEA country, Switzerland or the UK 说明可用历史居住文件证明居住。一般和配偶的居住期分别见 SRC-091 ss15(1)(c)、15A(1)(e)–(f)，配偶的婚姻或民事伴侣关系年限见 s15A(1)(c)，缺席见 s15C。
- **SRC-097** Eligibility、If your application is successful（许可可能被撤销）、How do I renew my Without Condition As To Time permission? 及 What are the conditions attached to my Stamp 5 permission。Stamp 5 线上 IRP 续期材料另见 SRC-384 的 Stamp 5 Renewals 清单。
- **SRC-384** Stamp 1、Stamp 1G (1)、Stamp 3 (3)、Stamp 4 (1)–(4)、(7)–(8)、(12)、Stamp 5、Stamp 4 EUFam 与 WA 的登记及续期清单。在线续期 When should I submit a Renewal Application? 载明在共和国境内递交、IRP 到期前 12 周开放。Introduction 包含线上更换 Stamp 类别。登记 FAQ 的 Travel and Re-Entry Visas 区分持有效 IRP 返爱与紧急返爱签证，并要求后者的许可覆盖到计划返爱日。
- **SRC-384** Stamp 4 (3) 的 First Time Registrations 第 6 项列医疗或旅行保险，有效期为 12 个月或覆盖全部较短停留期。同一表的 Renewals 列现有 IRP 和相应文件。已登记许可的配偶线上换签见 SRC-388 的 How do I apply? → Resident in the State on an existing permission，以及 SRC-387 June 2026 §5.5 注 20 所链接的 ISD 换签页，Criteria to change immigration permission → Change of Immigration Status from Stamp 1 → Stamp 4。[ISD 换签页](https://www.irishimmigration.ie/registering-your-immigration-permission/changing-your-immigration-permission/)
- **SRC-385** Policy Document Archive；main changes。
- **SRC-386** Financial Thresholds for Spouses, Civil Partners and De Facto Partners；Table 1。
- **SRC-387** June 2026 §§2–10、12–17 和 Appendices C–E，其中 §6.2 为居住或拟居住在爱尔兰的爱尔兰公民担保人；November 2025 §§7、10、16；2016 §§16–17。
  - June 2026 §5.5 将已在爱尔兰居住的申请人转介至各境内专门流程。§7.11 规定本政策下另一段关系的担保等待期。境内流程如何处理旧担保见 PD-330。
  - `2026-11-23-ie-family-2016.pdf` 对应 [官方 PDF](https://www.irishimmigration.ie/wp-content/uploads/2021/04/Policy-document-on-Non-EEA-family-reunification.pdf)。
  - `2026-11-23-ie-family-2025.pdf` 对应 [官方 PDF](https://www.irishimmigration.ie/wp-content/uploads/2026/11/FINAL-PDF-Revised-Family-Reunification-Policy.pdf)。
  - `2026-11-23-ie-family-2026.pdf` 对应 [官方 PDF](https://www.irishimmigration.ie/wp-content/uploads/2026/06/Family-Reunification-Policy-12-June-2026.pdf)。
- **SRC-388** 境内 de facto 的 Am I eligible? 要求双方已合法居住。爱尔兰公民配偶的 Am I eligible?、Where you have permission to be in Ireland 载明境内转换须核对申请人在境内及适用的许可或入境依据。境外 de facto 的 Who can sponsor me?、Police clearance、Medical insurance 与 What happens when I arrive in Ireland? 覆盖担保、申请与入境后的登记。爱尔兰公民配偶的 Recently entered the State on a D (Join Family) Visa or were given a Join family stamp by border control 指向首次登记清单。
- **SRC-388** 配偶专页 Am I eligible? 下，Where you have permission to be in Ireland 列出财力和共同住址证明。Where you do not have permission to be in Ireland 列出配偶事务组的适用情形、过去三年 €40,000 且不含国家福利，以及不得成为国家过度负担。How do I apply? 指向专门申请表和材料清单。境内转换的政策范围见 SRC-387 June 2026 §5.5，普通境外团聚的住房和财务要求见 §§9–10。
- **SRC-389** Irish citizens；What is a qualifying family member?；Permanent Residence Card/Certificate。
- **SRC-390** regs. 2–6、8–20，其中 reg. 8 为普通家属居留证件，reg. 12(1)(b) 为非欧盟家属与 EU 公民合规居留，reg. 12(4) 为保留权利后的居留，reg. 15(1)–(3)、(8)–(9) 分别涉及家属首次申请永久居留卡及其续期与失效；Schedules 1、5–8。
- **SRC-391** EUTR2 证书、EUTR3 永久卡、EUTR5 权利保留；EUTR3 pp2–3。
  - `2026-11-23-ie-eu-eutr2-leaflet.pdf` 对应 [官方 PDF](https://www.irishimmigration.ie/wp-content/uploads/2026/05/Explanatory-leaflet-for-Form-EUTR2.pdf)。
  - `2026-11-23-ie-eu-eutr2.pdf` 对应 [官方 PDF](https://www.irishimmigration.ie/wp-content/uploads/2026/05/Form-EUTR2.pdf)。
  - `2026-11-23-ie-eu-eutr3-2026.pdf` 对应 [官方 PDF](https://www.irishimmigration.ie/wp-content/uploads/2026/09/Explanatory-leaflet-for-Form-EUTR3-updated-August-2026.pdf)。
  - `2026-11-23-ie-eu-eutr5-leaflet.pdf` 对应 [官方 PDF](https://www.irishimmigration.ie/wp-content/uploads/2026/05/Explanatory-leaflet-for-Form-EUTR5.pdf)。
- **SRC-392** S.I. regs. 2–7、10–12、14–23，其中 reg. 10(3)–(4) 为非欧盟非英国籍家属及过渡前后的可计居留和失权，regs. 11–12 涉及永久居留证件的首次签发与续期；Agreement Arts. 9–10、13、15–17。
  - `2026-11-23-ie-wa-agreement.pdf` 对应 [官方 PDF](https://assets.publishing.service.gov.uk/media/5daaab7fed915d42a05eea12/Agreement_on_the_withdrawal_of_the_United_Kingdom_of_Great_Britain_and_Northern_Ireland_from_the_European_Union_and_the_European_Atomic_Energy_Community.pdf)。
  - `2026-11-23-ie-wa-brexit-faq.pdf` 对应 [官方 PDF](https://www.irishimmigration.ie/wp-content/uploads/2022/03/Impact-of-Brexit-on-UK-Nationals-in-Ireland-and-their-non-EEA-national-family-members-March-2022.pdf)。
- **SRC-393** Act ss2–4、9、18、21–24、36(2)(a)、47–48、55；S.I. 444/2024 reg. 7、Parts 6–8、Schedule 1；S.I. 643/2025 Schedule 8。
  - `2026-11-23-ie-permit-mar-regs.pdf` 对应 [官方 PDF](https://www.irishstatutebook.ie/eli/2025/si/643/made/en/pdf)。
- **SRC-394** Eligibility criteria；Remuneration criteria；Fees；Labour Market Needs Test；What’s next?。
- **SRC-395** EMN NCP Ireland 问题 1；爱尔兰未参加 Directive 2003/109/EC。
  - `2026-11-23-ie-eu-commission-ltr.pdf` 对应 [官方 PDF](https://ec.europa.eu/commission/presscorner/api/files/attachment/872342/COM_2022_650_1_EN_ACT_part1_v5.pdf)。
  - `2026-11-23-ie-eu-emn-query-ltr.pdf` 对应 [官方 PDF](https://home-affairs.ec.europa.eu/system/files/2022-06/20221_directive_2003109ec_duration_of_absence_and_loss_of_the_long-term_resident_status%20%281%29.pdf)。
- **SRC-397** Minimum Annual Remuneration updates。
- **SRC-398** Eligibility、Conditions、FAQ；申请表 p1 与 §§3–6；医师说明 Permission to Change Immigration Status。How do I renew my Long Term Residency permission? 核对持有 LTR 期间的居住及工作证明，并单列领取经收入评估福利者的续期渠道。家属首办材料见 Can my spouse/dependent apply for Long Term Residence?。
  - `2026-11-23-ie-ltr-doctors.pdf` 对应 [官方 PDF](https://www.irishimmigration.ie/wp-content/uploads/2021/05/SHOs-and-registrars-with-5-years-work.pdf)。
  - `2026-11-23-ie-ltr-form.pdf` 对应 [官方 PDF](https://www.irishimmigration.ie/wp-content/uploads/2023/07/Long-Term-Residency-Application-Form.pdf)。
- **SRC-399** Independent immigration permission。
  - `2026-11-23-ie-domestic-abuse.pdf` 对应 [官方 PDF](https://www.irishimmigration.ie/wp-content/uploads/2024/01/Victims-of-Domestic-Abuse-Immigration-Guidelines-Dec-2023.pdf)。
- **SRC-400** What Irish associations means；December 2025 指引 Steps 1–4 及 Table 1（p3）。
  - `2026-11-23-ie-irish-assoc-dec-2025.pdf` 对应 [官方 PDF](https://www.irishimmigration.ie/wp-content/uploads/2025/12/IA-Guidance-footnote-updated-03-12-2025.pdf)。
- **SRC-401** s2(1)–(2)。
- **SRC-402** s63：overcrowding。
- **SRC-404** Indexation。
  - `2026-11-23-ie-permit-roadmap.pdf` 对应 [官方 PDF](https://enterprise.gov.ie/en/publications/publication-files/employment-permits-minimum-annual-remuneration-outcome-of-the-roadmap-review-2025.pdf)。
- **SRC-405** Registration requirements for minors；Registering for the first time at 16 years of age 与 Minors (under 16 years) travelling to and from Ireland。免登记情形的入籍连续居住仍按 SRC-091 ss15B–15C 核对。
- **SRC-406** Visa Fees；Visa fee exemptions。
- **SRC-407** Employment Permits Act 2024；S.I. 444/2024 legislative history。
- **SRC-408** ss203、286、295。
- **SRC-409** Eligibility；Join non-EEA Family Member §9 及 Type of immigration permission。

## SRC-470 葡萄牙 · Regulamento da Nacionalidade Portuguesa（DL 26/2022 重刊）

arts. 6、14、18–19、25、27、37、44、56：无国籍旧程序、婚姻与同居声明、材料、葡语证明、费用与异议。旧制葡语的出生地与国籍推定见 art. 25(9)（公报 p42）。

- `policy-sources/2022-03-18-pt-dl-26-2022.pdf` → <https://files.diariodarepublica.pt/1s/2022/03/05500/0000200059.pdf>

## SRC-471 葡萄牙 · DR 1/2024，外国人法实施条例修订

arts. 63–65、65-A、65-D/E/K、74（DR 84/2007）：续期、永居、ARI 与 ERLD。第 5 条第 5–8 款处理旧 ARI 项目过渡。

- `policy-sources/2024-01-17-pt-dr-1-2024.pdf` → <https://files.diariodarepublica.pt/1s/2024/01/01200/0000600050.pdf>

## SRC-472 葡萄牙 · DR 4/2022 与 DR 9/2018，外国人法实施条例

DR 4/2022 重刊 arts. 5、63、65-A–E、74：担保、续期和 ARI 的证明。DR 9/2018 art. 2 修改 DR 84/2007 art. 63(16)：续期可在到期前 90 天内提出。

- `policy-sources/2022-09-30-pt-dr-4-2022.pdf` → <https://files.diariodarepublica.pt/1s/2022/09/19000/0002800097.pdf>
- `policy-sources/2018-09-11-pt-dr-9-2018.pdf` → <https://files.diariodarepublica.pt/1s/2018/09/17500/0471804757.pdf>

## SRC-473 葡萄牙 · Portaria 1563/2007，居留生计标准

arts. 2、5、7–9、11–13（公报 pp8866–8868）：家庭权重、按许可目的核对、合资格减免、永居与 ERLD 至少保障 12 个月。

- `policy-sources/2007-12-11-pt-portaria-1563-2007.pdf` → <https://files.diariodarepublica.pt/gratuitos/1s/2007/12/23800.pdf>

## SRC-474 葡萄牙 · 本土与自治区最低工资参考及普通雇员社保份额

DL 139/2025 arts. 2–3、7（本土 2026 EUR 920）；DLR 1/2026/M arts. 2、4（马德拉 EUR 980）；Resolução 26/2026 公报 p64（交叉记载亚速尔 EUR 966）；Lei 110/2009 附件 art. 53（普通雇员个人社保份额 11%）。

- `policy-sources/2025-12-29-pt-dl-139-2025.pdf` → <https://files.diariodarepublica.pt/1s/2025/12/24900/0001400016.pdf>
- `policy-sources/2026-02-03-pt-dlr-madeira-1-2026.pdf` → <https://files.diariodarepublica.pt/1s/2026/02/02300/0001400015.pdf>
- `policy-sources/2026-07-30-pt-resolucao-madeira-26-2026.pdf` → <https://files.diariodarepublica.pt/gratuitos/1s/2026/07/14600.pdf>
- `policy-sources/2009-09-16-pt-lei-110-2009.pdf` → <https://files.diariodarepublica.pt/gratuitos/1s/2009/09/18000.pdf>

## SRC-475 葡萄牙 · AIMA 生计资源与证据说明

“Montante / Forma de comprovar”：受养成年子女、工资单和服务收据、担保和其他收入证据。

- `policy-sources/2026-11-23-pt-aima-meios.html` → <https://aima.gov.pt/pt/temas-transversais/meios-de-subsistencia>

## SRC-476 葡萄牙 · AIMA 2026 年收费表与生效公告

2026-03-01 生效。III.1–3、VI、XIV（pp2–4、费表末节）：续期、永居、ARI、ERLD 和渠道。

- `policy-sources/2026-03-01-pt-aima-tabela-taxas.pdf` → <https://aima.gov.pt/media/pages/documents/dc677d0005-1772305205/tabela-de-taxas-e-demais-encargos-a-cobrar-pelos-procedimentos-administrativos.pdf>
- `policy-sources/2026-02-28-pt-aima-atualizacao-taxas.html` → <https://aima.gov.pt/pt/noticias/atualizacao-da-tabela-de-taxas>

## SRC-477 葡萄牙 · Portaria 307/2023，AIMA 收费及年度调整

art. 3：每年 3 月 1 日按规定指数更新费用。

- `policy-sources/2023-10-13-pt-portaria-307-2023.pdf` → <https://aima.gov.pt/media/pages/documents/fa233e86c7-1750429842/portaria-307.pdf>

## SRC-478 葡萄牙 · Lei 37/2006，自由流动居留权

arts. 2–3、6–13、14–17、21–24、29（公报 pp5717–5724）：适用身份、家庭、永久居留、文件与限制。
其他亲属的个案审查见 art. 3(2)–(3)（p5717）。永久权取得与维持分别见 art. 10(1)–(5)（p5719）；第三国家属永久卡的缺席专条见 art. 17(4)（p5721），适用重叠记入 PD-396。

- `policy-sources/2006-08-09-pt-lei-37-2006.pdf` → <https://files.diariodarepublica.pt/1s/2006/08/15300/57175724.pdf>

## SRC-479 葡萄牙 · Portaria 13/2024、勘误、原费表及前次修订，自由流动收费

Portaria 13/2024 art. 2（公报 pp14–15）：改 Portaria 1334-D/2010 art. 3；勘误修正生效条，2024-02-21 生效。

- `policy-sources/2024-01-22-pt-portaria-13-2024.pdf` → <https://files.diariodarepublica.pt/1s/2024/01/01500/0001300017.pdf>
- `policy-sources/2024-01-31-pt-portaria-32-2024.pdf` → <https://files.diariodarepublica.pt/1s/2024/01/02200/0001000010.pdf>
- `policy-sources/2017-05-18-pt-portaria-164-2017.pdf` → <https://files.diariodarepublica.pt/gratuitos/1s/2017/05/09600.pdf>
- `policy-sources/2010-12-31-pt-portaria-1334-d-2010.pdf` → <https://files.diariodarepublica.pt/gratuitos/1s/2010/12/25302.pdf>

## SRC-480 葡萄牙 · PLA 与旧制语言证明法规

Portaria 183/2020 art. 9 与 Portaria 184/2022：PLA 证书；Portaria 176/2014 arts. 2、4：旧国籍法律语言证明与测试。

- `policy-sources/2020-08-05-pt-portaria-183-2020.pdf` → <https://files.diariodarepublica.pt/gratuitos/1s/2020/08/15100.pdf>
- `policy-sources/2022-07-21-pt-portaria-184-2022.pdf` → <https://files.diariodarepublica.pt/1s/2022/07/14000/0000200004.pdf>
- `policy-sources/2014-09-11-pt-portaria-176-2014.pdf` → <https://files.diariodarepublica.pt/1s/2014/09/17500/0488804889.pdf>

## SRC-481 葡萄牙 · AIMA ARI 常见问题

FAQ 11–13、23–29：健康、生计、材料、续期和投资类永居。第 24 问按每两年一期核对最低停留。

- `policy-sources/2026-11-23-pt-aima-ari-faq.html` → <https://aima.gov.pt/pt/a-aima/perguntas-frequentes-faqs/autorizacao-de-residencia-para-investimento-ari>

## SRC-482 葡萄牙 · 里斯本大学 CAPLE · CIPLE

“Detalhes do Exame”：A2 考试及抓取时的 EUR 95 价格。

- `policy-sources/2026-11-23-pt-caple-ciple.html` → <https://caple.letras.ulisboa.pt/exame/2/ciple>

## SRC-483 葡萄牙 · 司法部 · 婚姻与事实伴侣声明取得国籍旧指南

“Documentos necessários / Quanto custa”：司法认定、声明材料与 EUR 250 费目。实体门槛以适用版国籍法为准。

- `policy-sources/2026-11-23-pt-justica-casamento.html` → <https://justica.gov.pt/Como-obter-nacionalidade-portuguesa/E-casado-ou-vive-em-uniao-de-facto-com-um-portugues-ha-mais-de-3-anos>

## SRC-484 葡萄牙 · AIMA 自由流动永久证书、家属卡与线上入口

“Quem pode requerer / Documentos”及门户公告：证书、家属卡、地址证据与旧预约衔接。

- `policy-sources/2026-11-23-pt-aima-ue-certificado.html` → <https://aima.gov.pt/pt/nacionais-ue-e-familiares/nacionais-ue/certificado-de-residencia-permanente-para-nacionais-ue>
- `policy-sources/2026-11-23-pt-aima-ue-cartao.html` → <https://aima.gov.pt/pt/nacionais-ue-e-familiares/familiares-de-nacionais-ue/cartao-de-residencia-permanente-para-familiares-de-nacionais-da-ue>
- `policy-sources/2026-11-23-pt-aima-ue-portal.html` → <https://aima.gov.pt/pt/noticias/portal-de-renovacoes-atualizado-para-nacionais-da-uniao-europeia-ue-e-familiares>

## SRC-485 葡萄牙 · DL 41/2023，AIMA 职权移转

arts. 25–26：居留文件与国籍程序相关职权移转。

- `policy-sources/2023-06-02-pt-dl-41-2023.pdf` → <https://files.diariodarepublica.pt/gratuitos/1s/2023/06/10700.pdf>

## SRC-486 葡萄牙 · DL 37-A/2024，废止部分无居留签证手续

art. 3 及过渡条：旧 ARI 转创业居留的交叉条款已废止。

- `policy-sources/2024-06-03-pt-dl-37-a-2024.pdf` → <https://files.diariodarepublica.pt/1s/2024/06/10601/0000200003.pdf>

## SRC-487 葡萄牙 · Lei 39/2025 与 DL 496/1977，婚龄改革及民法成年

Lei 39/2025 arts. 6–8：废止未成年人解放制度及过渡；DL 496/1977 art. 1 修改 Código Civil art. 130：满 18 周岁。

- `policy-sources/2025-04-01-pt-lei-39-2025.pdf` → <https://files.diariodarepublica.pt/1s/2025/04/06400/0000300012.pdf>
- `policy-sources/1977-11-25-pt-dl-496-1977.pdf` → <https://files.diariodarepublica.pt/1s/1977/11/27301/00010050.pdf>

## SRC-488 葡萄牙 · DL 209/2012，国籍程序费用

arts. 2、19：RERN art. 18(2.2.1) 成人程序 EUR 250，2012-10-01 生效。

- `policy-sources/2012-09-19-pt-dl-209-2012.pdf` → <https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/diplomas_legislativos/Documents/Decreto_Lei_209_2012.pdf>

## SRC-489 葡萄牙 · Despacho 12941/2014，旧 PaN 测试费

第 1–5 点：报名、查阅及复核；旧制预算，开放情况需核实。

- `policy-sources/2014-10-23-pt-despacho-12941-2014.pdf` → <https://files.diariodarepublica.pt/2s/2014/10/205000000/2681226813.pdf>

## SRC-490 葡萄牙 · Portaria 208/2017，投资低密度地区

arts. 1–2、附件：认定地域清单。

- `policy-sources/2017-07-13-pt-portaria-208-2017.pdf` → <https://files.diariodarepublica.pt/1s/2017/07/13400/0373103734.pdf>

## SRC-491 葡萄牙 · Lei 53/2023，通用拒绝与 EU Blue Card

art. 2 修改外国人法 arts. 77、81、121-I、121-J，扩展蓝卡欧盟累计居留规则。art. 10（公报 p24）规定 2023-10-29 生效。

- `policy-sources/2023-08-31-pt-lei-53-2023.pdf` → <https://files.diariodarepublica.pt/1s/2023/08/16900/0000700024.pdf>

## SRC-492 葡萄牙 · Lei 69/2026，总体规划

附件“国籍”段为政策规划，未发布国籍考试、生计或宣誓参数。

- `policy-sources/2026-11-18-pt-lei-69-2026.pdf` → <https://files.diariodarepublica.pt/1s/2026/11/22400/0000200050.pdf>

## SRC-493 欧盟法院 · Ogieriakhi（C-244/13）

§§36–38、47 与主文第 1 点说明，配偶婚姻存续且双方在同一东道国满足适用居留条件时，分址居住不影响第三国配偶取得永久居留权。

- `policy-sources/2014-07-10-pt-cjeu-c-244-13.pdf` → <https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:62013CJ0244>

## SRC-494 欧委会 · 自由流动指引（C/2023/1392）

§2.2.2.1（p12）说明配偶可在同一东道国分址居住。§§2.2.2.3–2.2.2.4（pp13–15）说明首次随行或团聚时核对受扶养事实，未满 21 岁取得派生居留权的直系后代满龄后仍受覆盖。§9.2 与注 236（p46）分别列普通缺席、必要兵役及一次不超过 12 个连续月的正当缺席。普通缺席在每个合法居留年度内累计，以合法居留起始日的周年为起点，正当缺席例外没有最低时长。

- `policy-sources/2023-12-22-pt-eu-free-movement-guidance.pdf` → <https://eur-lex.europa.eu/eli/C/2023/1392/oj/eng/pdf>

## SRC-495 欧盟法院 · AT v Pensionsversicherungsanstalt（C-32/19）

§§38–39、44 及主文将退休提前取得的工作和居留条件锚定在停止工作时。葡萄牙对应条文见 SRC-478 art. 11(1)(a)、(2)–(5)。

- `policy-sources/2020-01-22-pt-cjeu-c-32-19.pdf` → <https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:62019CJ0032>
### SRC-230 居民身份、旅行、变更、再发与通用递交条件

RV2.5、RV2.10、RV1.5、RV1.15、RV1.20、R5.66 复用 SRC-072。入籍在境日算法继续使用 SRC-070、073。

快照与网址按登记行中的相同顺序对应；定位以条文号或页面小节为准。

R2.40(d) 及其所引条例第 20(2A)(a)–(b) 条要求在入境管制区外的 residence class visa 申请中列入所有基于与主申的关系持有或正在申请 temporary entry class visa 的伴侣及受抚养子女。R2.40.2(a)、(b)(ii) 限定管制区递交人群，且每份申请只涉及一人。澳籍或澳永居人士到埠申请的居民签按 R5.30.1 审批（SRC-252）。曾持新西兰居民签者另按再次申请核对。[条例第 20 条](https://www.legislation.govt.nz/secondary-legislation/pco-drafted/2010/241/en/latest/sections/DLM3148143/) · [INZ R2.40](https://www.immigration.govt.nz/opsmanual/44893.htm)

### SRC-231 DIA Citizenship Guidance Document（2026 年 10 月）

- `policy-sources/2026-10-14-nz-dia-citizenship-guidance.pdf` → <https://www.dia.govt.nz/diawebsite.nsf/Files/Citizenship-2026/$file/Citizenship-Guidance-Document-October-2026.pdf>

### SRC-232 govt.nz 入籍资格、申请、儿童、宣誓与拟实施考试

快照与网址按登记行中的相同顺序对应；定位以条文号或页面小节为准。

### SRC-233 MBIE 移民费用和征费检讨，历史费率提案及 A6 地区和豁免口径

Annex 6 的金额是 MBIE 提案；费区、豁免与当前应缴总额需依实际递交情况核实（PD-225）。

- `policy-sources/2024-06-01-nz-mbie-cris-immigration-fees.pdf` → <https://www.regulation.govt.nz/assets/RIS-Documents/cris2-mbie-ifalr-jun24-v2.pdf>

### SRC-234 DIA 入籍收费与调整公告

- `policy-sources/2026-06-17-nz-dia-cris-citizenship-fees-2026.pdf` → <https://www.regulation.govt.nz/assets/RIS-Documents/Cost-Recovery-Impact-Statement-Citizenship-Fees-Amendment-Regulations-2026.pdf>

### SRC-235 Skilled Residence 就业、雇主与工资核算

快照与网址按登记行中的相同顺序对应；定位以条文号或页面小节为准。

### SRC-236 Skilled Migrant Category 与附录 21–23

快照与网址按登记行中的相同顺序对应；定位以条文号或页面小节为准。

### SRC-237 Green List Tier 1、Tier 2 与附录 13

快照与网址按登记行中的相同顺序对应；定位以条文号或页面小节为准。

SR4.5(c) 要求 Straight to Residence 申请使用 INZ 的指定在线表格。即使申请人另有资格在入境管制区获发到埠居民签，递交 Tier 1 时仍须使用该表，并接受 R5.125 的普通筛查。[INZ SR4.5](https://www.immigration.govt.nz/opsmanual/77816.htm)

### SRC-238 Care Workforce、Transport Sector 与附录 14

快照与网址按登记行中的相同顺序对应；定位以条文号或页面小节为准。

### SRC-239 A4 居民健康标准、医疗证明与豁免，含公共医疗资格说明

快照与网址按登记行中的相同顺序对应；定位以条文号或页面小节为准。

### SRC-240 A5 品格、无犯罪证明、延期与 R5.100 制裁

快照与网址按登记行中的相同顺序对应；定位以条文号或页面小节为准。

### SRC-241 SR2.10、BF 英语证明及 ESOL；R5.65 预付条件

快照与网址按登记行中的相同顺序对应；定位以条文号或页面小节为准。

### SRC-242 F2 伴侣类、担保与既往未纳入申请的家属

快照与网址按登记行中的相同顺序对应；定位以条文号或页面小节为准。

### SRC-243 F4 父母类、R4 担保条件与收入表

快照与网址按登记行中的相同顺序对应；定位以条文号或页面小节为准。

### SRC-244 BN 积极投资者及 BM 商业品格

快照与网址按登记行中的相同顺序对应；定位以条文号或页面小节为准。

### SRC-245 BD2 商业投资者工签及 BI 居民签证

快照与网址按登记行中的相同顺序对应；定位以条文号或页面小节为准。

### SRC-246 RW5 英语及 RW7 宗教工作者居留

快照与网址按登记行中的相同顺序对应；定位以条文号或页面小节为准。

### SRC-247 IRD 个人税务居民身份

快照与网址按登记行中的相同顺序对应；定位以条文号或页面小节为准。

### SRC-248 财政部投资移民购房政策分析，非签证资格门槛

本来源记录修法前的政策分析。修法生效及许可手续见 SRC-250、PD-233。

- `policy-sources/2025-11-06-nz-treasury-sar-investor-home.pdf` → <https://www.regulation.govt.nz/assets/RIS-Documents/Supplementary-Analysis-Report-Enabling-investor-visa-holders-to-purchase-or-build-a-home-in-New-Zealand.pdf>

### SRC-249 INZ 1028 收费表（2026 年 5 月版）

p1 的 Application Fees 与 Immigration Levy 说明费区及豁免，p3 的 Residence class visa 与 Temporary visa 两栏列出 Active Investor Plus、Business Investor Category 和 Business Investor Work Visa 的申请费及征费。PD-225 列出 Band A/C 的普通总额。在线核对原版 PDF 四页。本机下载返回网站验证页，未将该响应归档为 PDF。

### SRC-250 LINZ 投资者购房指引

沿革页的 2026 年改革一节给出生效日。2026-03-26 版指引 pp1–2 列出适用签证、许可、购买价或购买加建造成本的严格门槛。沿革页概述以「500 万或以上」简写，详细指引的许可条件要求超过 500 万，PD-233 引用详细条件。自用住宅与签证认可投资的区分见该指引的 “Ways a house can be used” 一节。

### SRC-251 商业投资者工签家属及缴费

BD3.1(a)–(e) 转引 E4.1.10 与 E4.1.20，按临时签证规定核对随行伴侣与子女。E4.50.1(a)–(c) 规定纸质申请的身份、表格与费用。快照与网址按登记行中的相同顺序对应。

### SRC-252 受抚养子女在新西兰非法居留

R5.125(a) 涵盖任一申请人的亲生或收养受抚养子女。(b) 规定未满 16 岁子女的迁出权例外。(c)(i)–(ii) 排除 RV2、RV4。(c)(iii) 的管制区例外明引 R2.40.2（SRC-230）及 R5.30.1；后者按澳大利亚护照、澳永居或居民返程签证核对到埠居民签。申请人的澳籍或澳永居身份本身不能使其选择的普通居留类别免于筛查。[INZ R5.125](https://www.immigration.govt.nz/opsmanual/91747.htm) · [INZ R5.30.1(a)–(b)](https://www.immigration.govt.nz/opsmanual/30996.htm)

## 希腊完整版来源登记（任务 88）

复用 SRC-086（移民法典）、SRC-087（三份修法对应的 ΦΕΚ）、SRC-088（国籍年限）与 SRC-089（国籍法典编纂版、内政部指南）。同号多文件沿用各自的官方链接。

- 普通 Ο.2 的本人医保据 SRC-086 第 8(ε)、10(9)、90(6)–(7) 条及 SRC-356 第 2(δ)、24(1.1)–(1.3) 条。首签可交全额公保申请凭证，私保须依法可用。第 90(1) 条另要求五年转换申请人未获发团聚以外的居留许可。普通子女续自主卡及投资者子女专卡的原卡材料分别见第 90(5) 条和 SRC-087 第 29 条所订第 95(2) 条末段。[一般医保](https://api.et.gr/apiFEK/1/2023/81/pdf#page=15) · [首次递件补证](https://api.et.gr/apiFEK/1/2023/81/pdf#page=18) · [自主居留](https://api.et.gr/apiFEK/1/2023/81/pdf#page=61) · [通用材料](https://api.et.gr/apiFEK/2/2024/1807/pdf#page=2) · [Ο.2 专门材料](https://api.et.gr/apiFEK/2/2024/1807/pdf#page=17) · [投资者子女](https://api.et.gr/apiFEK/1/2026/17/pdf#page=34)
- Ν 的旧卡递交期限见 SRC-350 第 17(2)、(4) 条。第 18 条允许使用法律认可的其他证据证明连续居留。SRC-377 第 9、12.3 节分别说明永久权的取得及居留证件的证明作用。[希腊总统令第 17–18 条](https://api.et.gr/apiFEK/1/2007/135/pdf#page=8) · [欧委会自由流动指引](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:C_202301392)
- SRC-086 第 8(d) 条规定一般公共卫生条件及首次发卡后新发疾病的保护。对 Ε.1，另见第 31(1)(στ)、35(1)(γ) 条。ΜΙΤΟΣ 的 Ε.1 境内转换手续条件 1 接受合资格的有效居留许可，条件 5 单列公共卫生。短停首签为条件 3，雇主邀请首签为 SRC-366 条件 5。Ε.4 受雇首签见 SRC-367 条件 7。Β.5 用途变更首签见 SRC-368 条件 2、11。Ο.1 首签见第 88(1)(β) 条及 SRC-376 条件 5。Ο.3 首卡的第 93(5)、(8) 条列公共秩序及安全，SRC-356 第 25 条列相应医保证明。[移民法典第 8 条](https://api.et.gr/apiFEK/1/2023/81/pdf#page=14) · [Ε.1 境内转换](https://en.mitos.gov.gr/index.php/ΔΔ:Highly_qualified_residence_permit_(‘E.1’)_in_the_context_of_a_change_of_purpose_procedure_pursuant_to_Article_12_of_Law_5038/2023_–_Initial_granting) · [Ε.1 短停首签](https://en.mitos.gov.gr/index.php/ΔΔ:Residence_permit_of_a_highly_qualified_employee_(‘E.1’)_following_admission_with_a_uniform_visa_or_visa-free_regime_–_Initial_granting)
- SRC-087 的 ν. 5275/2026 第 38 条改写法典第 161(1)(a) 条，Μ.2 普通首签的融入要求改依长期居民的第 144(1)(γ) 条，举证方式见第 160 条。第 69 条规定自公布日 2026-02-06 生效。[修订条文](https://api.et.gr/apiFEK/1/2026/17/pdf#page=40) · [生效条款](https://api.et.gr/apiFEK/1/2026/17/pdf#page=63)

- SRC-086 · Ο.1 家属与主申请人同步首签。蓝卡两份完整申请同时决定并通知，企业内部调动的两份申请同时审查，研究人员与家属申请同时审查而家属须待研究人员获准后发卡。第 60(2)、95(2) 条分别规定特殊就业和投资者家属随行及许可同日到期。[第 42(3) 条](https://api.et.gr/apiFEK/1/2023/81/pdf#page=35) · [第 56(5)(β) 条](https://api.et.gr/apiFEK/1/2023/81/pdf#page=44) · [第 112(2) 条](https://api.et.gr/apiFEK/1/2023/81/pdf#page=75)

- SRC-350 · `2007-06-21-gr-fek-a135-2007-pd106.pdf`。总统令第 7、10–17、21 条，欧盟家属保留权、永居、缺席与比例审查。 [官方原件](https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2007/20070100135.pdf)
  - 修订原件 `policy-sources/2012-04-11-gr-fek-a85-2012-n4071.pdf`（sha256 `3d0f3290a544da047ff477b3e4258a799648af149d8b0948353e75a26fe33b0f`）。ν. 4071/2012 第 42(8)、(10) 条分别替换 Π.Δ. 106/2007 第 9(5)、17(4) 条。普通卡自入境、首次永久卡自旧卡到期满一年后仍未申请的罚款为 €50。第 47 条规定自 2012-04-11 公布生效。[公报第 2302 页](https://api.et.gr/apiFEK/1/2012/85/pdf#page=32)
- SRC-351 · `2014-01-31-gr-fek-a24-2014-pd16.pdf`。第 1 条表 A4，国家签证领事收费。 [官方原件](https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2014/20140100024.pdf)
- SRC-352 · `2014-11-04-gr-fek-b2962-2014-kya53821.pdf`。第 1 条 B–D，私保三项年度保障、自付比例、除外与期限。 [官方原件](https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2014/20140202962.pdf)
- SRC-353 · `2021-04-22-gr-fek-b1652-2021-ya29845.pdf`。第 1、2 条，入籍经济与社会融入。 [官方原件](https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2021/20210201652.pdf)
- SRC-354 · `2021-08-27-gr-fek-b3967-2021-ya58050.pdf`。第 1 条，修订收入年度、家庭贡献及税务凭证。 [官方原件](https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2021/20210203967.pdf)
- SRC-355 · `2021-11-05-gr-fek-b5125-2021-kya140304.pdf`。第 2–4 条，长期居民考试程序与考试费。 [官方原件](https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2021/20210205125.pdf)
- SRC-356 · `2024-03-22-gr-fek-b1807-2024-kya95391.pdf`。第 2、23、24、25、31、57–59 条，通用文件、发卡与分路径材料。 [官方原件](https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240201807.pdf)
  - 第 31 条第 2.2(ε) 项列明分时租约首签须附 ΕΟΤ 知悉该具体合同的证明（公报第 16504 页）。SRC-375 第 2 条第 2.2(ε) 项将分时租约与综合旅游住宿长期租约并列（公报第 75065 页）。两版续期清单分别见 SRC-356 第 31 条第 3 项、SRC-375 第 2 条第 3 项。[旧部令](https://api.et.gr/apiFEK/2/2024/1807/pdf#page=22) · [现行部令](https://api.et.gr/apiFEK/2/2025/6014/pdf#page=3)
- SRC-357 · `2024-03-29-gr-fek-b1974-2024-ya25058.pdf`。决定第 1 条，2024-04-01 起最低工资。 [官方原件](https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240201974.pdf)
- SRC-358 · `2024-05-02-gr-fek-b2626-2024-kya133226.pdf`。第 1–2 条，雇主财力与受邀人数。 [官方原件](https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240202626.pdf)
- SRC-359 · `2024-09-17-gr-fek-b5223-2024-kya225679.pdf`。第 2、3 条，Ο.1 与 Μ.1 的最低工资净额、生计及家庭加计。 [官方原件](https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240205223.pdf)
- SRC-360 · 决定 21536/2026 第 8(1)–(2) 条、末段废止 10802/2025，2026-04-24 起适用。`policy-sources/2026-04-24-gr-fek-b2319-2026-21536.pdf`（SHA-256 `d90246c1d5aadc7f0220645537959ddacb6f2215ac4487c77ad31989f8ad1ee8`）。[官方公报](https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2026/20260202319.pdf)
- SRC-360 · 决定 384/2024 第 7 条及末段，2024-08-05 起替代 15478/2024。`policy-sources/2024-08-05-gr-fek-b4555-2024-384.pdf`（SHA-256 `9a670f96528ff9393d67e2806740f352e9a7d2da0c11d5c2a11e255c5c413cc4`）。[官方公报](https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240204555.pdf)
- SRC-360 · 决定 15478/2024 第 7 条及末段，2024-03-04 起适用。`policy-sources/2024-03-04-gr-fek-b1368-2024-ya15478.pdf`（SHA-256 `1bfd81c464768efb6bcd17a6cd2f86f4c305fb89a9f9039db36d23ac54619a02`）。[官方公报](https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240201368.pdf)
- SRC-360 · `2025-03-10-gr-fek-b1093-2025-ya10802.pdf`。2025 年版第 7(1)–(2) 条分别规定笔试和口试。 [官方原件](https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2025/20250201093.pdf)
- SRC-361 · `2025-03-27-gr-fek-b1476-2025-ya8233.pdf`。决定第 1 条，2025-04-01 起最低工资。 [官方原件](https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2025/20250201476.pdf)
- SRC-362 · `2025-09-02-gr-fek-a152-2025-n5225.pdf`。第 95–98 条，残障口试、再次申请及宣誓例外。 [官方原件](https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2025/20250100152.pdf)
- SRC-363 · `2026-03-27-gr-fek-b1759-2026-ya8934.pdf`。决定第 1 条，2026-04-01 起最低工资。 [官方原件](https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2026/20260201759.pdf)
- SRC-364 · `2026-11-23-gr-eu-blue-card-greece.html`。薪资门槛段给出 2024 年的金额；有效期与合同期限以 SRC-087 新法为准。 [官方原件](https://home-affairs.ec.europa.eu/policies/migration-and-asylum/eu-immigration-portal/eu-blue-card/eu-blue-card-greece_en)
- SRC-365 · `2026-11-23-gr-mitos-a2-exam.html`。成本与参与条件栏，Α2 考试和补考。 [官方原件](https://mitos.gov.gr/index.php/%CE%94%CE%94:%CE%94%CE%B9%CE%BF%CF%81%CE%B3%CE%AC%CE%BD%CF%89%CF%83%CE%B7_%CE%B5%CE%BE%CE%B5%CF%84%CE%AC%CF%83%CE%B5%CF%89%CE%BD_%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%BF%CE%BC%CE%AC%CE%B8%CE%B5%CE%B9%CE%B1%CF%82_%CE%B3%CE%B9%CE%B1_%CF%80%CE%BF%CE%BB%CE%AF%CF%84%CE%B5%CF%82_%CF%84%CF%81%CE%AF%CF%84%CF%89%CE%BD_%CF%87%CF%89%CF%81%CF%8E%CE%BD,_%CF%80%CF%81%CE%BF%CE%BA%CE%B5%CE%B9%CE%BC%CE%AD%CE%BD%CE%BF%CF%85_%CE%BD%CE%B1_%CF%85%CF%80%CE%B1%CF%87%CE%B8%CE%BF%CF%8D%CE%BD_%CF%83%CF%84%CE%BF_%CE%BA%CE%B1%CE%B8%CE%B5%CF%83%CF%84%CF%8E%CF%82_%CF%84%CE%BF%CF%85_%CE%B5%CF%80%CE%AF_%CE%BC%CE%B1%CE%BA%CF%81%CF%8C%CE%BD_%CE%B4%CE%B9%CE%B1%CE%BC%CE%AD%CE%BD%CE%BF%CE%BD%CF%84%CE%BF%CF%82)
- SRC-366 · `2026-11-23-gr-mitos-e1-bluecard.html`。申请条件、费用与办理期限。 [官方原件](https://mitos.gov.gr/index.php/%CE%94%CE%94:%CE%86%CE%B4%CE%B5%CE%B9%CE%B1_%CE%B4%CE%B9%CE%B1%CE%BC%CE%BF%CE%BD%CE%AE%CF%82_%CF%85%CF%88%CE%B7%CE%BB%CE%AE%CF%82_%CE%B5%CE%B9%CE%B4%CE%AF%CE%BA%CE%B5%CF%85%CF%83%CE%B7%CF%82_(%C2%AB%CE%95.1%C2%BB)_%CE%BA%CE%B1%CF%84%CF%8C%CF%80%CE%B9%CE%BD_%CE%AD%CE%B3%CE%BA%CF%81%CE%B9%CF%83%CE%B7%CF%82_%CE%B1%CE%B9%CF%84%CE%AE%CE%BC%CE%B1%CF%84%CE%BF%CF%82_%CF%84%CE%BF%CF%85_%CE%B5%CF%81%CE%B3%CE%BF%CE%B4%CF%8C%CF%84%CE%B7_%E2%80%93_%CE%91%CF%81%CF%87%CE%B9%CE%BA%CE%AE_%CF%87%CE%BF%CF%81%CE%AE%CE%B3%CE%B7%CF%83%CE%B7)
- SRC-367 · `2026-11-23-gr-mitos-e4-work.html`。费用栏；旧合同期限用 SRC-087 现行条文更新。 [官方原件](https://mitos.gov.gr/index.php/%CE%94%CE%94:%CE%86%CE%B4%CE%B5%CE%B9%CE%B1_%CE%B4%CE%B9%CE%B1%CE%BC%CE%BF%CE%BD%CE%AE%CF%82_%CE%BA%CE%B1%CF%84%CF%8C%CF%80%CE%B9%CE%BD_%CE%AD%CE%B3%CE%BA%CF%81%CE%B9%CF%83%CE%B7%CF%82_%CE%BC%CE%B5%CF%84%CE%AC%CE%BA%CE%BB%CE%B7%CF%83%CE%B7%CF%82_%CE%B3%CE%B9%CE%B1_%CE%B5%CE%BE%CE%B1%CF%81%CF%84%CE%B7%CE%BC%CE%AD%CE%BD%CE%B7_%CE%B5%CF%81%CE%B3%CE%B1%CF%83%CE%AF%CE%B1_%E2%80%93_%CE%91%CF%81%CF%87%CE%B9%CE%BA%CE%AE_%CF%87%CE%BF%CF%81%CE%AE%CE%B3%CE%B7%CF%83%CE%B7_(%C2%AB%CE%95.4%C2%BB))
- SRC-368 · `2026-11-12-gr-mitos-b5-change-of-use.html`。费用、条件和证明文件栏，用途变更类别的首次申请。 [官方原件](https://mitos.gov.gr/index.php/ΔΔ:Μόνιμη_άδεια_διαμονής_επενδυτή_(αλλαγή_χρήσης)_–_Αρχική_χορήγηση)
- SRC-369 · `2026-11-23-gr-mitos-pegp.html`。成本和成功条件栏，Π.Ε.Γ.Π. 考试。 [官方原件](https://mitos.gov.gr/index.php/%CE%94%CE%94:%CE%95%CE%BE%CE%B5%CF%84%CE%AC%CF%83%CE%B5%CE%B9%CF%82_%CE%B1%CF%80%CF%8C%CE%BA%CF%84%CE%B7%CF%83%CE%B7%CF%82_%CE%A0%CE%B9%CF%83%CF%84%CE%BF%CF%80%CE%BF%CE%B9%CE%B7%CF%84%CE%B9%CE%BA%CE%BF%CF%8D_%CE%95%CF%80%CE%AC%CF%81%CE%BA%CE%B5%CE%B9%CE%B1%CF%82_%CE%93%CE%BD%CF%8E%CF%83%CE%B5%CF%89%CE%BD_%CE%B3%CE%B9%CE%B1_%CE%A0%CE%BF%CE%BB%CE%B9%CF%84%CE%BF%CE%B3%CF%81%CE%AC%CF%86%CE%B7%CF%83%CE%B7)
- SRC-370 · `2024-12-20-gr-fek-a207-2024-n5167.pdf`。实施时补查，ν. 5167/2024 第 37(1) 条，Β.5 过渡期交割期限延长。[官方原件](https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2024/20240100207.pdf)
- SRC-371 · `2024-09-25-gr-migration-circular9-golden.pdf`。实施时补查，移民部第 9 号通函，第 I.Δ(β)、II(δ) 节，旧制房产及符合过渡条款者的短租豁免与原投资金额。[官方原件](https://migration.gov.gr/wp-content/uploads/2024/10/9%CE%95%CE%B3%CE%BA%CF%8D%CE%BA%CE%BB%CE%B9%CE%BF%CF%82-Golden-24.9.2024-FINAL.pdf)
- SRC-372 · `2026-09-24-gr-ypes-economic-integration-52779.txt` 为官方七页 PDF 的正文提取快照。第 2–5 页列举持续经济活动、税保及家庭经济资料，第 5–6 页规定待决与新申请的适用方式。本机直接下载返回 HTTP 403，通过官方 PDF 的网页阅读结果归档全文，哈希对应文本。[官方 PDF](https://www.ypes.gr/wp-content/uploads/2026/09/eggr52779-20260924.pdf)
- SRC-373 · `2024-05-08-gr-ministry-e4-renewal-reply.pdf`。第 1 页答复正文第 2–3 段。原材料清单误列劳动合同。自移民法典施行起，普通续期查原卡期间的纳税义务、当前有效参保资格及 €150 规费。[官方原件](https://www.hellenicparliament.gr/UserFiles/67715b2c-ec81-4f0c-ad6a-476a34d732bd/12574231.pdf)
- SRC-374 · `2026-11-03-gr-mitos-e4-renewal.html`。条件 2–3 和材料 2–3 列明有效参保及原卡期间税务证明。费用 1–2 为许可 €150、制卡 €16。[官方原件](https://mitos.gov.gr/index.php/ΔΔ:Άδεια_διαμονής_κατόπιν_έγκρισης_μετάκλησης_για_εξαρτημένη_εργασία_–_Ανανέωση_(«Ε.4»))
- SRC-375 · `2025-11-11-gr-fek-b6014-2025-kya214926.pdf`。第 2 条第 2.1、2.6(ε) 项（公报第 75064–75065、75067–75068 页）。标准购房按区位金额及适用的面积要求核验。用途变更特例按行政文件签发日核验，原许可可凭 2024-04-05 当日或之后的更新或修订满足日期条件。第 2.1(γ)、2.6(γ)、2.2(δ) 项允许普通购房、改住宅及旅游租约首签提供登记凭证、登记申请回执或律师相应证明。第 3(ε) 项规定，首签未交已完成登记证明者，续期须补交登记凭证或律师对已完成登记的证明。普通购房及改住宅首签分别依第 2.1(ζ)、2.6(η) 项交 Ε9 副本，旅游租约的第 2.2 项无此材料。第 3(δ) 项要求续期提交 Ε9，明确豁免两类旅游租约。第 3(ζ) 项要求按用途变更档获批者续期时声明房产仍作住宅且未用作企业总部或分支机构。第 3、4 条规定本令自公布日起生效，此前已递交的首签申请也可按新例外提交登记申请回执或律师相应证明。[官方原件](https://api.et.gr/apiFEK/2/2025/6014/pdf)
- SRC-376 · `2026-11-05-gr-mitos-blue-card-family-initial.html`。条件 2 与材料 1–3 列明蓝卡家属可以持团聚 D 签、统一短期签证，或凭免签入境章证明合法入境。条件 4、5 对上述入境方式均要求核对公共秩序与安全、公共卫生。条件 3 要求担保人已持蓝卡。SRC-086 第 42(3) 条允许完整申请同步审理，主卡待批时家属能否凭合法短停同步递件仍待确认（PD-319）。第 86(1) 条要求持签证入境者在签证到期前递交。[ΜΙΤΟΣ 手续 517141](https://en.mitos.gov.gr/index.php/%CE%94%CE%94%3AResidence_permit_for_family_members_of_a_highly_qualified_residence_permit_holder_%28%E2%80%98E.1%E2%80%99%29_%E2%80%93_Initial_granting)
- SRC-377 · 欧委会 C/2023/1392 第 2.2.2.4 节（第 15 页）说明以未满 21 岁或受养为依据取得的家属居留。第 2.2.2.5 节（第 16 页）确认行使自由流动权的欧盟未成年子女所依赖的非欧盟主要照护人享有派生居留权。第 5.2.4 节（第 36 页）要求子女在以自给自足为依据的居留期间具备供养双方的资源和覆盖双方的全面医保，资源与保险可来自任一方，子女取得永久权后免核这两项。第 2.2.3 节（第 17 页）说明获认可的扩展成员可以援用指令。第 9.1–9.2 节（第 44–45 页）说明合格居留要求及永久权自连续五年完成时取得。[欧盟公报原件](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:C_202301392)
- SRC-378 · ν. 4800/2021 第 7(1) 条（第 3 页）重述民法典第 1510 条首句，父母对子女的亲权以子女未成年为前提。与 SRC-089 国籍法典第 5(1)(δ) 条合读，用于以在希出生的希腊籍子女亲权申请归化的分支。[希腊公报原件](https://api.et.gr/apiFEK/1/2021/81/pdf#page=3)
- SRC-379 · ν. 1329/1983 第 3 条重述民法典第 127 条，满 18 岁成年。见 PDF 第 2 页左栏（公报第 430 页）。[希腊公报原件](https://api.et.gr/apiFEK/1/1983/25/pdf#page=2)
