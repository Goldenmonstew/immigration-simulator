# Phase 15 规划（2026-11-19）：用 Codex 额度清剩余任务

## 背景与分工

用户 2026-11-19："codex 的额度要用不完了，你能开多少 codex 的会话，现在立马去做。能做哪些做哪些，把后面所有的任务都规划上。"随后补充："codex 现在还有 ultrafast 模式，直接用这个模式就行。"

- **例外范围**：本规划列出的任务 31–47，凡标"sol 实现"的都由 Codex 写代码、文档或测试，包括 33、35、37 的规则语义改动。这是 AGENTS.md"Codex 只审核"的按任务例外（同任务 17、22），依据是上面用户的原话：用户要求开 Codex 会话"立马去做""能做哪些做哪些"，即由 Codex 执行这些任务，Fable 不再另行确认；AGENTS.md 不改。规则语义改动仍须附 SRC 定位与测试。
- **模型**：ultrafast 只有 `gpt-6.2-sol` 支持（`gpt-6.2-astra` 只有 fast 档），所以实现和审核都用 `gpt-6.2-sol` + `service_tier="ultrafast"`。实现和审核分开会话，审核会话不看实现会话的过程。
- **Fable**：写 brief、复核核对结果、跑 gate 与 e2e、浏览器验收、提交、开 PR、合并、核对部署。Codex 沙箱不能写 `.git`、不能启动浏览器。
- **并行上限**：只读核对不跑构建，可以多开；写代码的会话按文件不重叠来分，同时最多 3 个。gate 和 e2e 由 Fable 串行跑。

## 剩余任务盘点来源

- Phase 14 列的七项差距：浏览器回归（14.1）、发布流程（14.2）已做；上线后可观测已做：Cloudflare Web Analytics 2026-11-04 起开启（PROGRESS 第 176 行附近"Web Analytics"条，正式站页面带 `beacon.min.js`），自动错误上报 2026-11-16 上线（第 158 项）；顾问审核、真人试玩、模型评审样本太小仍开放；可维护性审视过，原列四个大文件中三个已拆小，`apps/web/app/game/scene.ts` 仍约 1,424 行。
- 报告"发现与建议"：15-five-items（e2e 手机用例偶发失败、顾问重点看的 3 个结论）、14.1（续签、菜地、商店、英文冒烟已补；节日、菜地种收、英文深层流程仍无用例）、14.2（knip 进 CI 暂不做）、13.3（实际听感、钓鱼与厨房的手动操作没验）、13.5（旧杂货美术）。
- `docs/research/2026-11-19-ukcisa-crosscheck.md`：方案二（建模 Option E）、诺拉情景的两处简化（3C 延续待核、Student 直接转 Skilled Worker 的路径）、Graduate 许可条件与家属、费用、Appendix Student 未登记。
- `docs/research/2026-11-15-content-expansion.md` 的 E01–E12：主题都已在 Phase 12–13 交付；E04 收藏册只显示首次年季，原建议的"来源回忆"没做（任务 41）。
- `docs/pending-details.md`：PD-075（Appendix FM-SE 与 adequate maintenance 指引未登记）可登记后建模（任务 39）；PD-003、PD-004、PD-024 等改革早期开放项等官方材料（任务 32 与每周 Check sources 发现后走 37）。
- `docs/research/2026-11-16-mobile-performance.md`"没做的"一节。

## 任务

| 任务 | 内容 | 执行 | 依赖 | 状态 |
|---|---|---|---|---|
| 31 | 规则与文案逐条核对（8 个只读会话）：A1 现行法 Skilled Worker 与共用部分；A2 家庭、家属、英语；A3 其他现行路线；A4 改革的居留、基本要求、过渡；A5 改革的贡献、家属、受保护人群；A6 结果汇总、网站政策表述、顾问审阅包；A7 游戏里的政策事实（含续签简化）；A8 英文文案。Fable 逐条回原文复核，汇总为 `docs/research/2026-11-19-rules-audit.md`，并单独复核 15-five-items 列的三个顾问重点案例（G-OVERSTAY-BREACH、G-UNIVERSAL-CREDIT、G-LONG-RESIDENCE-10Y） | sol 只读 | — | 进行中 |
| 32 | 来源刷新与补登记：查 HC 584 之后的新 Statement of Changes 与 PD-076–080 相关官方文件；登记 Skilled Worker caseworker guidance（Option E 的 4 年怎么算）和 Appendix Student（打工时长、收尾期）；更新 pending-details | sol 实现 | — | 进行中 |
| 33 | 核对发现的修正：按 31 复核为"成立""部分成立"的约 60 条，拆成子任务：33a 连续居留与最早申请日（共用代码）、33b 现行法 Skilled Worker / 家庭 / 英语路线条件、33c 现行法其他路线条件、33d 改革的居留与基本要求与过渡、33e 改革的贡献与家属与受保护人群、33f 网站结果表述、33g 游戏里的政策表述。每条附 SRC 定位与回归测试 | sol 实现 | 31 | 33a、33g 进行中，其余按共享文件顺序开 |
| 34 | 英文文案修正：按 A8 复核过的问题改词典与英文文本 | sol 实现 | 31（A8）；改到诺拉文案的部分排在 35 之后 | 待开 |
| 35 | 建模 Option E：见下方"任务 35 的契约" | sol 实现 | 32、44；33a、33b、33g 合并之后 | 待开 |
| 36 | 手机 e2e 走地点改用 `walkTo`，保留打开抽屉与触屏点按，修"地点抽屉走到公园池塘"偶发失败 | sol 实现 | — | 进行中 |
| 37 | 新官方变化落地：见下方"任务 37 的触发" | sol 实现 | 32 | 暂不触发：32 查到截至 2026-11-19 HC 584 仍是最新 Statement of Changes。以后若触发且影响 Option E，在两组共享文件上都让 37 先合并，35 再按适用版本实现 |
| 38 | 拆分 `scene.ts`：按职责拆成地图与寻路、标签层、天气与光照等模块，行为不变 | sol 实现 | — | 进行中 |
| 39 | 第二批来源登记：Appendix FM-SE、adequate maintenance 指引（PD-075）、Immigration Act 1971 s3C（诺拉情景的 3C 延续）、11.4 报告建议的 Skilled Worker 担保人指引（与 32 登记的 caseworker guidance 是两份）；写明能否据此建模 | sol 实现 | 32（编号顺延） | 待开 |
| 40 | 诺拉情景补两处说明：递交与获批的先后、3C 延续；符合条件的 Student 可直接转 Skilled Worker（SW 1.5A、SW 12.2(e)） | sol 实现 | 35、39 | 待开 |
| 41 | 收藏册补"来源回忆"：每种鱼与菜记一句首次获得时的情境 | sol 实现 | 38（同在 `apps/web/app/game`，避开 `scene.ts` 冲突即可） | 待开 |
| 42 | e2e 补用例：节日当天、菜地种下到收成、英文界面走一轮签证中心与结局 | sol 实现，Fable 跑 | 36（同改 `apps/e2e`） | 待开 |
| 45 | Codex 模拟试玩：3 个会话按 `docs/playtest/kit.md` 扮演试玩者（人物卡 A1–A3，中英文、手机），看 Fable 截的正式站截图走问卷，游戏用 `packages/game` 逻辑一步步玩；Fable 汇总为 `docs/playtest/results-2026-11-19-codex.md`。不替代真人试玩 | sol（用户 2026-11-19 要求） | — | 进行中 |
| 46 | 访问统计与错误上报：用户 2026-11-19 要求接入；核实后两者都已在线（见"盘点来源"），不另开实现任务 | — | — | 已在线 |
| 47 | agy 第 5 轮设计评审：Fable 用无头 Chrome 截正式站桌面 2 倍、手机 3 倍图，agy（gemini-4-hydrogen-xhigh）评审；结论转成修正任务 | agy 评审，修正由 sol 实现 | — | 进行中 |
| 43 | Fable 实机走"出门→聊天→钓鱼→做饭→回家"（手动操作，不用简易模式与跳过），补 13.5 缺的钓鱼与做饭成功卡实景截图 | Fable | — | 待开 |
| 44 | 修来源检查脚本（32 的来源检查验收依赖它：先合并 44，再用 32 的来源变更跑完整检查后合并 32）：`check-sources.mjs` 把 SRC-033 的书面问题 JSON 当成 Hansard JSON，取备注时抛 `TypeError`，32 修改前后都退出 1，每周 Check sources 跑不到后面的来源；修好后重跑完整检查；第 2 轮去掉 GOV.UK 布局与 HTML 实体误报、补齐多快照的 URL 映射 | sol 实现 | — | 进行中 |

### 共享文件与顺序

同一时间只给一个写入会话：

- `packages/engine/src/rules/current-law/skilled-worker.ts`、`packages/policy-data/src/parameters/current-law-2026-11.ts`：33a → 33b → 35。37 若日后被触发：不影响 Option E 时排在 35 之后；影响时 37 先合并，35 再按适用版本实现。
- `packages/game/src/characters/graduate.ts`、`packages/game/src/graduate-route.ts`：33g → 35 → 40 → 34 中涉及诺拉的英文。
- `packages/engine/test/golden.test.ts` 生成的黄金快照与 `docs/review/adviser-packet.md`：任何改结论的任务都要重新生成，按合并先后依次更新，不并行改。
- `docs/SOURCES.md`、`docs/pending-details.md`、`apps/web/lib/sources.ts`、`policy-changelog.ts`：44 → 32 → 39 → 35（登记 PD）→ 37，编号顺延；33 各子任务登记的新 PD 按合并先后顺延编号。
- `packages/engine/src/aggregate.ts`、`residence.ts`、`types.ts`：33a 先合并，33b–33e 再开。
- `apps/web/i18n/en.ts`、`zh-CN.ts` 与引擎规则文件里的英文说明：33 各子任务 → 34。33g 与 41 都会往词典里加行，按合并先后解决冲突。
- `apps/e2e/tests/helpers.ts`：36 → 42。
- `PROGRESS.md`：每个 PR 自己追加一行，合并时由 Fable 解决行号冲突。

### 任务 35 的契约

- 范围只覆盖游戏里诺拉的情景（Graduate 转 Skilled Worker，SW 12.2(f)），不在网站问卷里做通用 Option E。
- 新增 Skilled Worker **申请**检查（SW 4.2 Option E 与 SW 12.2、SW 12.3），与现有定居薪资检查（SW 24.3，`CL-SW-SALARY`、`CL-SW-GOING-RATE`）分开；定居规则的语义不变。
- 输入：申请日、预计决定日、最近一次非访客许可（SW 12.2(f)：Graduate，若已到期，到期日距申请日须**不足** 2 年，恰好 2 年不成立）、CoS 起止日期、CoS 上的薪资与每周工时（going rate 按 SRC-017 Table 1 的每周 37.5 小时折算；一般年薪门槛只算可计入薪资）、SOC 代码对应的 going rate、拟授予许可期（按 CoS，SW 18.1，不用合同期）、过往 Skilled Worker / Graduate / Tier 2 许可的期间。缺个案输入时提示补资料；32 登记的 guidance 没写清的计算口径（PD-081）输出 `UNKNOWN`。
- 每个政策数字带 SRC 段落定位，走 `packages/policy-data`。
- 4 年合计：已持 Graduate / Skilled Worker / Tier 2 许可算到新许可起日（境内按决定日，SRC-050 §23.1），加上拟授予许可的全部期间（含 CoS 结束后的尾段，SW 18.1–18.1A）；不用递交日或合同期限代入。
- 验收：资格（最近许可是 Graduate 与不是、Graduate 已到期不足 2 年、恰好 2 年、超过 2 年）、薪资（低于标准档但达到新入职者档、低于新入职者档、going rate 70% 边界）、合计期限（4 年内、恰好 4 年、超过 4 年）、缺输入，都有测试；诺拉情景的结果与说明随之更新；黄金快照与审阅包重新生成。

### 任务 37 的触发

- 只有正式条文（Statement of Changes、法律）且有生效日，才改规则或参数，按 `docs/versioning.md` 全流程：新规则集与旧版本并存、生效日前后的边界测试、网站两栏对比与政策页、版本升级检查清单。
- 首次发布新规则集时，验收须包含 6.2 报告留下的一项：`principalSettlesBy` 通过固定的 `RULE_SET` 读主申请人的 `decidedBy`，要用同一家庭在新旧规则集下主路线不同的案例验证。
- 指引、提案、议会答复、预算案：只更新 `docs/SOURCES.md`、`docs/pending-details.md` 与政策变化记录，不改规则。

## 需要用户的事项（Codex 做不了）

- 持牌顾问审阅：审阅包 `docs/review/adviser-packet.md` 已备好，31、33 的结论会先修进去；需要用户找顾问。
- 真人试玩：试玩包 `docs/playtest/kit.md` 已备好，需要用户招募 5–8 人；任务 45 的 Codex 模拟试玩只是预演。
- 环境音的实际听感（43 只能看画面与操作）。

## 暂不规划（有需要再开）

- Graduate 许可条件（GR 8.2）与 Graduate 家属（GR 9.4A）建模、申请费与健康附加费进游戏：不影响现有结论，诺拉是单身。
- knip 进 CI：14.2 报告建议暂不加。
- 首页按需加载规则引擎与词典：正式站版本 b1bf394 的 Lighthouse 13.6.0 手机测量首页性能分 97（PROGRESS 第 169 项），收益小。
- 游戏页在客户端载入时重复下载已内联的样式表（约 10 KiB，不在首次绘制之前）；游戏页 HTML 比 TCP 初始窗口多 211–353 字节，压进窗口约省 150 ms（推算，未实测）。
- 旧杂货 PNG 与新 SVG 风格不完全一致（13.5 报告）。
- Graduate 发签时长判断：通用许可期已写入 SRC-034 GR 8.1（非博士 2027-01-01 前申请两年、自该日起 18 个月），引擎未实现发签时长判断，游戏只用诺拉的两年；预算拟议的大学例外等 PD-077；HPI 扩容等 PD-078。
- Student 学期内工时与课程后收尾期建模（32 报告建议，SRC-051 ST 25.2–25.3、26.1–26.6）：诺拉情景目前不涉及。
- SW 24.3 row E（PhD 级岗位过渡表）建模：PD-080 已由 SRC-050 明确，row E 仍未建模。
- SRC-049 Finance Bill 原件 PDF 补归档（下载遇 403，现存议会发布元数据）。
- SRC-010 Content API 文档改版后重新登记（44 发现）。
- 6.2 报告留下的覆盖缺口：伴侣主申请人改走 Long Residence 时 FM 子女的 para 298（31 复核判为已记录的范围缺口）。
- 新 Statement of Changes 的发现：每周 Check sources 只比较已登记来源的快照，不会发现新文件；每个阶段开工时由 Fable 或来源刷新任务查一次 gov.uk 集合页（本阶段由 32 查过）。

## 进度

- 2026-11-19：计划入库；31（8 个只读会话）、32、36、38 开工；31 的 8 个会话已出结果，7 个只读会话逐条独立复核中；32 完成（HC 584 仍是最新，补登记 SRC-049–052，PD-080 关闭、新增 PD-081），等 44 合并后提交；31 复核完，约 60 条成立或部分成立，33a、33g 开工；36（PR #19）、38（PR #20）已开 PR；41、44 第 2 轮完成待验收；用户要求的 Codex 模拟试玩（45）与 agy 第 5 轮（47）开工；访问统计与错误上报核实已在线（46）。
