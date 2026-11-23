# 任务 72 报告：爱尔兰试点审核遗留风险

基于 main（16c9d94）。处理任务 68 报告第 3、4 节里记为"未处理"的五项审核风险。没有新增 SRC 或 PD 编号：所需依据都已在 SRC-096、SRC-097 存档，改动登记在原有的 PD-115、PD-116、PD-118。

## 1. 做了什么（按 commit）

- `Fix: 爱尔兰 Stamp 4 升级区分 CSEP 一类与其他雇佣许可`（PROGRESS 390）
  - 新增许可类型"Stamp 1 或 1H（CSEP、研究员 Hosting Agreement、NCHD 医生的多地点 GEP）"；原"Stamp 1"改为 GEP 等其他雇佣许可或经营。
  - 21 个月路线只计 CSEP 一类，57 个月路线只计 GEP 与 ICT。依据是 SRC-096 升级页 `Eligibility criteria` 的"not interchangeable"。另一类的 Stamp 1 在两条路线上都不计，也不算"转 Stamp 1 之前凭其他许可工作的日子"。
  - CSEP 一类计入入籍与 Stamp 5。
  - 回归用例：
    - CSEP 一年后转 GEP，21 个月路线由 MET 改为 NOT_MET；
    - 先 GEP 后 CSEP，21 个月从 CSEP 起算（FUTURE 2027-04-01）。
  - 网页测试与 e2e 的 CSEP 输入改选新类型。PD-116 已更新。
- `Fix: 爱尔兰配偶转 Stamp 4 计入家庭团聚的 Stamp 3`（391）
  - 存档的 ISD 家庭团聚 FAQ 第 30 问写"5 years or more in Ireland on a family reunification permission"。2024-05-15 通告写明，这些配偶伴侣的家庭团聚许可原为 Stamp 3，现改发 1G。两者都在 SRC-096，所以把这段 Stamp 3 计入，作为确定日期，不是有条件的另列日期。
  - 新增许可类型"家庭团聚的 Stamp 3（雇佣许可持有人或研究员的配偶伴侣，2024 年改发 1G 之前）"，与配偶伴侣类 1G 一起计入 5 年。其他原因的 Stamp 3（志愿者、宗教人员等）不计。
  - 路线与结果措辞改为"家庭团聚的配偶或伴侣（Stamp 3／1G）"。
  - 回归用例：家庭团聚 Stamp 3 自 2020-01-01、1G 自 2024-05-15，模拟日 2026-11-22 为 MET；同样日期换成普通 Stamp 3 时为 FUTURE 2029-05-15。
  - PD-118 与 SRC-096 备注已更新。
- `Fix: 爱尔兰 Stamp 4 路线中北爱尔兰居住优先于重叠的爱尔兰许可`（392）
  - 家庭团聚配偶转 Stamp 4：FAQ 第 30 问按"in Ireland"满 5 年计，所以住在北爱尔兰的日子不计，即使爱尔兰卡尚未到期。
  - Stamp 4 升级：SRC-096 写"Employees residing in the State on a Stamp 1 or 1H permission"，递交当天住在北爱尔兰的不满足。受雇期间的累计只看许可，不看居住地，因为 ISD 写的是"commencement of employment in the State"。
  - 回归用例：两条路线在北爱尔兰与未到期的爱尔兰卡重叠时，由 MET 改为 NOT_MET。PD-115 已更新。
- `Fix: 爱尔兰 Stamp 5 回国递交日核对当天是否持有效许可`（393）
  - SRC-097 申请表 p1 不受理境外或没有居留许可者的申请。满期时人在境外、许可在回国前到期的，不再以回国日为最早递交日，改为说明须先取得有效许可。
  - 回归用例：许可到 2026-12-05，出行 2026-11-29 至 2026-12-10。SRC-097 备注已更新。
- `Fix: 爱尔兰 ICT 的 57 个月规则按升级页发布日起算`（394）
  - 2024-04-03 通告只列 GEP。升级页的页面元数据 `datePublished` 为 2025-07-22，是存档来源中最早把 (v) ICT 列入 57 个月一类的。
  - 新增参数 `ictRuleFrom`（SRC-096）：早于该日满 57 个月的 ICT 输出 `UNKNOWN`；GEP 仍取 2024-04-03。哪个日期适用，按递交当天持有的许可类型判断。
  - 两种情况下，摘要都把该日称为"按 57 个月规则满足的最早日期"，并写明此前的规则没有收录。模拟日期提示同步更新。
  - 回归用例：ICT 自 2019-03-01，模拟日 2025-01-01 为 `UNKNOWN`，2025-07-22 为 MET。
  - PD-116 与 SRC-096 备注已更新。
- `Docs: 任务 72 报告`（395）：本报告。

## 2. 怎么验证的

- engine `pnpm exec vitest run test/ireland.test.ts test/index.test.ts test/rules.test.ts`：92 项通过，其中爱尔兰 49 项（新增 7 项，每项改动至少一条回归用例；最早日期均按条文手算）。
- policy-data `pnpm exec vitest run`：23 项通过，含来源登记一致性。
- web `pnpm exec vitest run test/ireland.test.tsx test/policy-page.test.tsx test/page.test.tsx`：28 项通过，其中爱尔兰 11 项。
- `pnpm exec tsc --noEmit -p .`：packages/engine、packages/policy-data、apps/web、apps/e2e 均通过。
- `pnpm exec eslint` 与 `pnpm exec prettier --check`（改动文件）：通过。

## 3. 没做或没验证的

- 按任务要求未跑 build、全量测试与 Playwright。e2e 里 CSEP 的选项已改为新类型，没有实际运行；页面没有截图。
- 同一类内换雇主、受雇中断的计法仍按原假设处理（PD-116）。
- 2025-07-22 是页面的发布元数据，不是 ISD 写明的生效日。ICT 在 2024-04-03 至 2025-07-22 之间是否已按 57 个月计算，存档来源里没有说明，所以这段时间输出待确认。若找到 ICT 的正式生效日，可改参数。
- 原先选"Stamp 1"的 CSEP 持有人需要改选新类型。表单没有自动迁移，这个试点不保存草稿。
- 回国当天没有许可时，试点只写明须先取得许可，不推算续期后的递交日。

## 4. 发现与建议（范围外，不实现）

- 家庭团聚 FAQ 第 30 问同样适用于其他担保人的配偶（例如 Stamp 4 持有人的配偶）。试点这条路线只覆盖雇佣许可持有人与研究员的配偶伴侣；扩展到其他担保人，需要先确认这些人所持的许可类型。
- ISD 升级页没有写 ICT 被列入 57 个月一类的生效日。可留意 ISD 是否另有通告，届时更新 `ictRuleFrom`。
