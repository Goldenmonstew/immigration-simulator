# 任务 68 报告：爱尔兰试点

本分支基于 origin/main（任务 66 合入后）。只算时间，格式同希腊、西班牙、美国试点。

## 1. 做了什么（按 commit）

- `Docs: 登记爱尔兰官方来源 SRC-091～098 与 PD-110～119`：
  - 20 个快照复制进 `policy-sources/`（沿用调研文件名，sha256 与调研清单一致）；
  - SRC-091：1956 年国籍与公民法 LRC 编纂版（HTML、PDF）与 irishstatutebook 修改记录；
  - SRC-092：2023 年 Courts and Civil Law (Misc) Act s8（插入 s15C）与 S.I. 389/2023；
  - SRC-093：International Protection Act 2026 s295（s16A(1)(d)）与 S.I. 244/2026；
  - SRC-094：Interpretation Act 2005（s18(h)、"month"）；
  - SRC-095：ISD 入籍指南与居住计算器（页面、本体、脚本）；
  - SRC-096：ISD 各类 Stamp 页、Stamp 4 升级页与 2024 年 57 个月通告；
  - SRC-097：ISD Stamp 5（WCATT）页；
  - SRC-098：2026 年修法草案 General Scheme、gov.ie 发布页与新闻稿、Oireachtas 立法前审查新闻稿；
  - PDF 在各 SRC 的备注里写明快照到网址的对应；网页的 `sourceUrls` 同步；
  - `docs/pending-details.md` 新增第二十二节 PD-110～PD-119。SRC-090、SRC-099 未使用。
- `Feat: 爱尔兰试点——入籍居住、配偶入籍与 Stamp 4 的时间`：`evaluateIreland` 与参数文件 `ireland-2026-11.ts`：
  - IE-NATURALISATION（s15(1)(c)、s15C、s16A）：递交前 1 年（往回到上一年同一日，不含递交当天）每天持计入的许可、递交当天也持有；这 1 年缺席不超过 70 天，71–100 天待部长认定（PD-111），超过 100 天不符合；此前 8 年内计入许可的天数不少于 1460 天加窗口内的 2 月 29 日。学生 Stamp 2／2A、等待国际保护决定的期间不计；"其他"许可待确认（PD-114）。前 8 年的出境严格读法扣除、较宽读法不扣（PD-112），闰日同样分两种读法（PD-113）；只有较宽读法可达时输出 `UNKNOWN`，否则在摘要另列较宽读法的日期。
  - IE-SPOUSE（s15A）：结婚或登记民事伴侣满 3 年（2 月 29 日起算的取 3 月 1 日），1 年连续加此前 4 年内 730 天，70／30 规则同上；北爱尔兰的居住不计（较严，PD-115）。没填日期时不适用。
  - IE-STAMP4（ISD 政策，结果写明是行政政策）：路线选择——不计算；21 个月（CSEP、研究员、NCHD 多地点 GEP）；57 个月（GEP、ICT），从开始受雇日按日历月计，月末起算到较短月份时当月最后一天为 `UNKNOWN`、次月 1 日起满足（PD-116）；Stamp 1G 配偶连续持有满 5 年；Stamp 5 连续 96 个月（Stamp 1、1H、1G、3、4，ICT 的 Stamp 1、Stamp 0、学生不计），每年缺席不超过 4 个月按日历年与任意 12 个月两种读法分级（PD-117），空档重新起算（PD-118）。
  - 2026 年修法草案只在两条入籍路径的摘要里提示草案年限并注明按现行法（PD-119），不进入计算。
  - 引擎用例 30 项，最早日期都按条文手算后写进断言。
- `Feat: 网站 /ireland 页`：问卷（模拟日期；许可行含 10 种类型；出境记录；配偶日期；Stamp 4／Stamp 5 路线必选，21／57 个月路线另填开始工作日期）与结果，中英双语；首页列表、离线缓存、无障碍与离线 e2e 列表加入该页；网页单元测试 7 项、e2e 一项（错误摘要聚焦、填写到结果、axe、切换英文）。

- 审核修正（review68-1，Codex 结论"需要修改"，5 个问题与部分风险、建议）：
  - Stamp 4 雇佣路线（21／57 个月）只计持该许可（Stamp 1 或 1H，57 个月一类含 ICT）的日子：开始工作后许可有空档的，确定日期从空档后重新起算，空档前后累加的日期另列（PD-116）；不再按开始日期的日历时间判满足。复现输入（2024-12-01 开始、2025-12-01 至 2026-04-30 无许可）改为 FUTURE 2028-02-01，累加读法 2027-01-30。
  - Stamp 1G 拆为毕业生计划、CSEP 持有人或研究员的配偶伴侣、ICT 家属三类，配偶转 Stamp 4 只计配偶伴侣类；复现输入改为 FUTURE 2027-11-01。
  - Stamp 5 按 SRC-097 的两份清单：新增 Stamp 4D／4S（计入）、1A、4 EUFam、ICT 家属 1G（不计）等类型，"其他"只剩临时保护等；复现输入分别为 MET 与 FUTURE 2033-06-01。入籍对 ISD 未列明的这些类型仍按待确认（PD-114）。
  - Stamp 5 的"每年缺席不超过 4 个月"是获批后的条件，不再用于申请日期，只在假设里提示（PD-117）；复现输入改为 MET。
  - 配偶入籍：新增许可类型"在北爱尔兰合法居住"，只计入 s15A 的岛内居住（PD-115）；复现输入（贝尔法斯特居住后 2025-01-01 迁居都柏林）改为 MET，一般入籍仍不计。
  - 风险：模拟日本身只在较宽读法下满足时（如缺席 71 天）输出 `UNKNOWN`，确定的未来日期写在摘要，不再显示 FUTURE；Stamp 1G 与 Stamp 5 有许可空档时，累加读法的日期另列（PD-118），仅此可达时为 `UNKNOWN`。模拟日期的提示注明按 2026-11 的现行规则计算历史日期（例如 57 个月自 2024-04-03 起）。
  - 建议：离线 e2e 在 `/ireland` 断网后提交表单并断言结果标题已聚焦。
  - 引擎用例由 30 项增至 35 项（新增 7 项回归，删去 2 项旧的缺席分级用例），网页用例同一文件增加新类型的渲染断言。

## 2. 怎么验证的

- `pnpm exec tsc --noEmit -p .`：packages/engine、packages/policy-data、apps/web、apps/e2e 均通过。
- `pnpm exec vitest run test/ireland.test.ts test/index.test.ts test/rules.test.ts`（engine）：73 项通过，其中爱尔兰 30 项。
- review68-1 修正后：engine `test/ireland.test.ts` 35 项通过（审核中的每组反例都写成回归用例）；web `test/ireland.test.tsx` 7 项通过；policy-data 全部通过；engine、policy-data、web、e2e 的 `tsc --noEmit`，改动文件的 eslint 与 prettier 通过。离线提交的 e2e 断言未运行（按 brief 不跑 Playwright）。
- `pnpm exec vitest run`（policy-data，含来源登记一致性）：23 项通过。
- `pnpm exec vitest run test/ireland.test.tsx test/policy-page.test.tsx test/page.test.tsx`（web，含 `sourceUrls` 与登记表一致）：24 项通过，其中爱尔兰 7 项。
- `pnpm exec eslint`（改动的源码、测试与 e2e 文件）、`pnpm exec prettier --check`：通过。
- 按 `check-sources.mjs` 的对应规则离线核对：20 个快照都对到正确网址（PDF 走备注里的显式对应）；未联网抓取。
- 关键数字对照快照原文核过：s15(1)(c)（PDF p19）、s15A(1)(c)（p20）、(e)–(f)（p21）、s15C 70／30 天与"day"定义（p23）、s16A(1)（p26）；ISD 指南的 70 天示例、出入境当天、100 天、1,460 天；计算器 Guidelines 的 1825／1826 与 1095／1096；Stamp 4 升级的 21／57 个月；Stamp 1G 5 年；Stamp 5 的 96 个月与 4 个月；草案 Head 5（p7）、Head 6（p11）。

## 3. 没做或没验证的

- 按 brief 未跑 `pnpm build`、全量 `pnpm test` 与 Playwright；`/ireland` 页没有在浏览器里截图检查，e2e 与视觉检查留给 Fable 的门禁。
- Long Term Residency（60 个月）没有做：与 57 个月 Stamp 4 升级重叠；要区分雇佣许可类 Stamp 1／4 与投资、创业类 Stamp 4 等；有空档时不完整月份怎么累加、获批后 90 天缺席条件是否约束申请前的 60 个月都没写。
- 难民与无国籍人（s16 部长裁量、2025-12-08 起的 5 年政策）、在境内出生的未成年人（s15B）、s15A(4) 随公共服务外派的境外居住都不计算；配偶路径去北爱尔兰的行程仍按缺席计（PD-115）。
- Stamp 4 雇佣路线不区分同一类型下的不同雇佣许可（例如都选 Stamp 1 的 GEP 与 CSEP），按所选路线把 Stamp 1／1H 都当作该许可；开始工作后才登记 Stamp 1 的，登记前的日子按空档处理（较严）。
- 品格、成年、意愿、宣誓与仪式、证明材料、费用不检查；Stamp 4 升级不检查是否仍在受雇，不处理 GEP 与 CSEP 混合历史、换雇主或中断（PD-116）；IRP 到期前 12 周可先递交的做法没有写进结果。
- 修法草案只作提示；它成为法律后需重新调研 s15、15A、15C、16A 与过渡条款。
- 每周来源核对：ISD（WordPress）、LRC 与 irishstatutebook 的 HTML 页面带动态内容，可能报 changed；gov.ie 对连续请求返回人机验证，可能报 fetch failed。

## 4. 发现与建议（范围外，不实现）

- 官方计算器（SRC-095 global-new.js）与法条、指南示例不同的地方，试点按法条与指南：
  - 许可覆盖递交日时把递交当天也算 1 个居住日（试点不算，PD-110）；
  - 连续年判定为 `numContinuousDays > 364`，即覆盖递交日往前 364 天加递交当天即通过，比法条窗口宽 1 天，也不区分含 2 月 29 日的 366 天；
  - 闰日按每段许可覆盖的 2 月 29 日加天，不裁剪到 9 年窗口，重叠许可会重复计，日期表只到 2020-02-29（2024 年起的闰日不加）；
  - 只排除 Stamp 2、2A，Stamp 1A 照常计入；不处理缺席。
  - 如需"与官方计算器一致"的结果，可另做兼容模式，不建议作为默认。
- ISD 页面之间的不一致：Stamp 页的 Stamp 4 示例写 2 年／5 年，升级页写 21／57 个月（以后者为准）；长期居留页的 CSEP FAQ 仍提到 2023-11-30 已停办的 DETE 支持信。
- 出境记录只有一份，配偶路径按"爱尔兰岛"计时，去北爱尔兰的行程本应不算缺席；若要精确，可给出境行加"去北爱尔兰"勾选。
- 审核提到的 ISD 家庭团聚 FAQ（第 30 问，Stamp 1G 配偶满 5 年在下一次网上续期时申请）未存档，本次只按 SRC-096 的 Stamp 1G 原文实现；如需引用可补登。
