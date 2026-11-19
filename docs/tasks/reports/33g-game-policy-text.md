# 33g 游戏里的政策表述修正

## 1. 做了什么

建议提交 `Fix: 修正游戏政策表述和定居结局评估`。改动及回归覆盖按 A7 复核条目列出，来源均回查了 `policy-sources/` 中的登记快照。

| 条目 | 改动与依据 | 实现文件 |
| --- | --- | --- |
| A7#1 | 通用续签入口注明本情景预设获批，所示费用用于在游戏里登记新许可。依据 SRC-004 SW 1.2、SW 4.2–4.4，SRC-020 HK 8.1，SRC-024 D-LTRP.1.1–1.3。 | `locations.ts`、`types.ts`、`location-menu.tsx` |
| A7#3 | 只有改革栏通过时，定居按钮和确认框写明「按改革假设模拟递交」。依据 SRC-001 Ch. 2「British connection」、SRC-024 E-ILRP.1.3(1A) 和 PD-003。 | `location-menu.tsx`、`i18n/{zh-CN,en}.ts` |
| A7#4 | 结局按递交时的储蓄显示两栏评估，余额与时间线继续反映扣费后的数值。存档重载及切换语言后仍显示递交时的评估。依据 SRC-024 E-LTRP.3.1(b)、E-ILRP.1.3(1A) 和 SRC-031 §9。 | `game.ts`、`types.ts`、`ending.tsx`、`i18n/{zh-CN,en}.ts` |
| A7#5 | Graduate 报价预览引用转签的 SRC-004 SW 4.2 Option A，说明 going rate 按每周 37.5 小时比较。工时依据为 SRC-017 Table 1 表前说明及 SRC-004 SW 14.4。 | `graduate-route.ts`、`game.ts` |
| A7#6 | 两张 BN(O) 卡说明游戏记录 Universal Credit 的领取事实，许可的 NRPF 条件及变更需要另行核对。依据 SRC-006「Benefits open to new claims」、SRC-020 HK 9.2(a)、HK 65.1。 | `characters/hong-kong-bno.ts` |
| A7#7 | British connection 卡把连续居留归于改革要求，并将沿用 SRC-008 CR 3.1 标为 PD-054 的模拟假设。依据 SRC-001 p9「Residence」及 Ch. 2「British connection」。 | `characters/family-partner.ts` |
| A7#8 | 通用 Life in the UK 入口注明游戏免预约、免收费并直接记为通过，引用 SRC-045「Book the Life in the UK Test」的现实预约与付费要求。 | `locations.ts`、`types.ts`、`location-menu.tsx` |
| A7#9 | 旧薪资档提醒的投递上限与中英文日期共用 `skilledWorkerPre2024ApplicationsBefore`，申请日仍须严格早于截止日。依据 SRC-004 SW 4.2(b)(ii)、SW 24.3 row C。 | `characters/skilled-worker-life.ts` |

对应测试位于 `packages/game/test/{characters,graduate,life-in-the-uk,review,time-and-economy}.test.ts` 与 `apps/web/test/game-page.test.tsx`，测试名带 A7 条号。

## 2. 怎么验证的

- `pnpm --filter @uk-immigration/game test` 通过，1318 个用例。最后一处中文卡片措辞用 `pnpm --filter @uk-immigration/game test test/time-and-economy.test.ts -t 'A7#9'` 复查通过。
- `pnpm --filter web test` 通过，496 个用例。覆盖双语续签入口、仅改革栏通过时的确认操作，以及扣费前后的财务评估、存档重载和语言切换。
- `pnpm lint` 与 `pnpm typecheck` 通过。
- `pnpm --filter web... --workspace-concurrency=1 build` 通过，确认生成了 `apps/web/out/game.html`。
- `pnpm --filter @uk-immigration/engine test -- -u` 通过，2578 个用例通过，1 个按环境变量控制的文案导出用例跳过。黄金案例、双语快照和 `docs/review/adviser-packet.md` 均无差异。本次修正作用于游戏展示，因此没有黄金案例结论变化。
- `git diff --check` 与改动源码的 Prettier 检查通过。

## 3. 没做或没验证的

- 根据任务范围，A7#2 的相接续签简化和任务 35 的新入职者档未纳入本次修改。
- 按任务要求未运行 Playwright 或做浏览器截图，界面验证采用双语 Web 组件测试及静态构建。审核、提交与 PR 由 Fable 负责。

## 4. 发现与建议

- 旧存档已结束的定居流程缺少递交时的储蓄记录，继续显示存档可重算的评估。新递交的存档可恢复递交时的展示。从结局打开模拟器时，使用的是游戏结局的实际时间线。
- A7#4 的通过到失败翻转来自游戏内扣费和储蓄联动。真实申请中扣费与 Appendix FM-SE 储蓄证据的关系仍属本项目已登记的证据范围限制。

## Fable 验收（补记）

- 全仓 gate 通过（engine 2578、game 1318、web 496 等）；e2e 全量 35/35 通过。
- 浏览器截图（本分支构建，林遥存档改到 10:00、许可快到期）：签证中心显示"续签（本情景预设获批）"与"支付所示费用，在游戏里登记新许可。"；语言学校的 Life in the UK 入口显示"游戏内免费"及跳过预约的说明。说明文字在 SRC 编号中间换行，属小毛病，未改。
