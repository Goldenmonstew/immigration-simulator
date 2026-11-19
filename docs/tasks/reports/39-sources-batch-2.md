# 任务 39 验收报告（2026-11-19）

## 1. 做了什么

建议 Fable 用一个提交 `Docs: 登记第二批官方移民政策来源`，纳入 `docs/SOURCES.md`、`policy-sources/` 下 SRC-053–057 对应的五份快照、`apps/web/lib/sources.ts`、`docs/pending-details.md`、`docs/research/2026-11-19-sources-batch-2.md`、本报告和 `PROGRESS.md`。五份来源依次是 Appendix FM-SE、adequate maintenance 指引、Immigration Act 1971 s.3C、担保人指引 Part 2、Continuous residence 指引。PD-075 的计算口径已明确，待后续实现。［[来源登记](../../SOURCES.md)、[研究记录](../../research/2026-11-19-sources-batch-2.md)］

## 2. 怎么验证的

- `node packages/policy-data/scripts/check-sources.mjs` 在 SRC-033 退出，状态为 1。旧版第 69 行查找 `### SRC-033` 的独立备注，现有议会书面问题为合并的二级标题，因而抛出 `TypeError`。按任务约定，逐份用 `curl` 重新抓取并比较。SRC-054、055、056 原始 SHA-256 相同。SRC-053、057 的原始 SHA-256 因 GOV.UK 随响应生成的页面 token 和 HTML 元素 ID 而不同，经 `diff` 核实仅这些属性和元数据变化，正文逐字一致。`shasum -a 256 -c` 验证登记表的五个原始哈希全部匹配仓库快照。
- `pnpm --filter @uk-immigration/policy-data test` 通过 23 项。`pnpm --filter web test -- sources` 通过 491 项，包含来源表与网页 URL 映射的一致性检查。本地 `/policy` 返回 HTTP 200，页面 HTML 含五个新增 SRC。
- 用 GOV.UK Content API 核对 FM-SE 版本日及变更记录。用 `pdfinfo`、`pdftotext` 和 p14 渲染图核对 SRC-054 页序及算例。对照 GOV.UK 当前页与已有快照，SRC-008 CR 3.1–3.3 及 SRC-024 E-LTRP.3.3–3.4 的相关原文一致。`git diff --check` 通过。额外运行的 Prettier 检查只标出 `sources.ts` 中已有的 SRC-041、044 折行差异。

## 3. 没做或没验证的

本批是已有法律和指引的补登记，`policy-changelog.ts` 无新增条目。引擎、参数及游戏改动留给后续任务，PD-081 仍待核对 SW 12.3 的临界日与合计口径。本批无新增 PD。工作树未提交，未推送。浏览器截图受本地 Chromium 启动权限与浏览器服务可用性限制，已核实服务端 HTML。全量来源检查待 Fable 合并任务 44 后重跑。

## 4. 发现与建议

- **家庭财务**。为五年伴侣路线实现指定福利分支，用当期可计每周净收入加合规储蓄周等值、减每周住房成本，与决定日 Income Support 基准比较，同时核查福利证据和住宿条件，关键资料不足时返回 `UNKNOWN`。位置为 `packages/engine/src/rules/current-law/family.ts` 的 `CL-FAMILY-FINANCIAL` 和 `packages/engine/src/types.ts` 的 `PersonTimeline`。依据为 SRC-024 E-LTRP.3.3–3.4、E-ILRP.1.3(1A)，SRC-053 ¶11–12B、¶18–20，SRC-054 p9–10、p12–19、p23–26。［[Appendix FM-SE](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-fm-se-family-members-specified-evidence)、[Home Office 指引](https://assets.publishing.service.gov.uk/media/6911ee0de9348ac8fb54f484/Appendix%2BFM%2Band%2BAdult%2BDependent%2BRelative%2BAdequate%2Bmaintenance%2Band%2Baccommodation.pdf#page=9)］
- **诺拉换签（任务 40）**。把境内有效递交、原许可到期与获批设为不同状态，按期递交且到期仍待决时延续原许可与条件，获批才切换路线。位置为 `packages/game/src/characters/graduate.ts` 的起始时间线、`packages/game/src/graduate-route.ts` 的 `graduateEpisode` 与 `packages/game/src/game.ts` 的 `graduate-switch` 及到期检查。依据为 SRC-055 s.3C(1)–(3)、SRC-034 GR 8.1、SRC-050 `#dates-granted`。［[Immigration Act 1971 s.3C](https://www.legislation.gov.uk/ukpga/1971/77/section/3C)］
- **连续居住**。将现行规则的缺席计算改为只计整天，排除出境与返英当日，保留 Long Residence 跨过渡日行程的旧制单次、过渡日前累计及下一趟才进入滚动窗口的区分，并加边界用例。位置为 `packages/engine/src/residence.ts` 的 `restartAfterAbsences`、`packages/engine/src/rules/current-law/{shared,long-residence}.ts` 的说明，以及共享调用方 `packages/engine/src/rules/es-residence.ts` 的 PD-054 假设。依据为 SRC-008 CR 3.1、3.3–3.4，SRC-057 `#count-whole-days`、`#the-12-month-period` 和 Long Residence Example 2。［[整天口径](https://www.gov.uk/government/publications/continuous-residence-caseworker-guidance/continuous-residence-guidance-accessible-version#count-whole-days)、[跨过渡日示例](https://www.gov.uk/government/publications/continuous-residence-caseworker-guidance/continuous-residence-guidance-accessible-version#example-2---appendix-long-residence-qualifying-period-started-before-11-april-2024-and-was-completed-on-or-after-11-april-2024)］
- **担保人指引**。本批按 brief 登记 Part 2 的 CoS、薪资与 going rate 定位。11.4 引用的路线专用指引在研究记录中附了官方小节链接。建模沿用 SRC-004 与 SRC-017 的规则和数值。［[Part 2](https://www.gov.uk/government/publications/workers-and-temporary-workers-guidance-for-sponsors-part-2-sponsor-a-worker/workers-and-temporary-workers-guidance-for-sponsors-part-2-sponsor-a-worker-accessible--2)］
