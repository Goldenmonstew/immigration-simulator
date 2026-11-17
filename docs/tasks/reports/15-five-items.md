# 15 五项补强报告（2026-11-16）

用户："1到5, 都去做"。Fable 实现，Codex 只读审核。

## 1. 做了什么（按 commit）

- `Docs: 记录 11-16 政策核对（无变化）`：`docs/research/2026-11-16-policy-check.md`。Statement of Changes 最新仍是 HC 584；各附录版本与 SOURCES 一致；Earned Settlement 仍无 Statement of Changes。不改规则与数据。
- `Test: 典型案例标准答案快照与持牌顾问审阅包`：23 个手写典型案例（`packages/engine/test/golden/cases.ts`），加上 33 个已有 fixture，共 56 个。两套规则下的结论、年限、最早日期和每条规则的状态写进 `golden-cases.json` 快照。同一份结果渲染成英文审阅包 `docs/review/adviser-packet.md`，并和快照一样由测试比对（`-u` 一起更新，不会悄悄过期）。每个案例包含：全部输入、两栏结论、决定性规则；结论不是"可能符合"时，还列出每条未满足或未知的检查及来源段落；另有假设和勾选栏。
- `Test: 问卷从首页逐步点击到结果页的中英文回归`：`apps/e2e/tests/questionnaire.spec.ts`，中文走 G-SW-5Y-ON-DAY，英文走 G-SW-ABSENCE-200-DAYS。界面文字取自 i18n 词典。
- `Docs: 真人试玩包`：`docs/playtest/kit.md`，内容包括招募、开场说明、4 个任务和 3 张虚构人物卡、SUS 与理解题、观察表、严重度标准，以及人物卡参考答案（取自快照）。
- `Fix: 游戏页欢迎画面不再预先加载 Phaser…`：Phaser 改为在小镇出现时才加载；游戏页最小高度设为 100vh；补上 icon 声明。记录见 `docs/research/2026-11-16-mobile-performance.md`。
- `Docs: 更新 AGENTS 规则语义条款并写报告`：AGENTS.md 里"规则语义只由 sol 改"已不符合 11-16 起的分工，改为由 Fable 实现、附 SRC 与测试、经 Codex 审核。

## 2. 怎么验证的

- 全仓 gate：`pnpm lint && pnpm typecheck && pnpm test && pnpm build`，结果 GATE EXIT 0。各包测试数：engine 2,578（含 golden 1 条）、game 1,315、web 484、Worker 2、e2e lint/types 通过。
- e2e：`pnpm e2e`，32 条全部通过（原 30 条，加问卷 2 条）。问卷测试故意改错预期后，2 条都失败，说明断言确实生效。
- 黄金案例：第一版有 3 个案例输入不全，已改正：难民许可在申请日前已到期；Global Talent 缺背书机构；旧薪资案例 £38,000 低于 Table 2 的 going rate £40,000，改为 £41,000，使"窗口内 / 窗口关闭当天"真正落在不同结论上。另给 SW 伴侣案例补了收入。改正后逐条看过结论。
- 性能：用 Lighthouse 13.6.0 手机配置测了正式站基线；本地改动前后各测两次，结果一致；手机截图确认欢迎页与进入小镇正常。

- Codex（gpt-6.1-sol）只读审核第 1 轮：4 项必须改，已全部修正。
  1. 长居案例的 Graduate 起点早于该路线开放（2021-07-01），已改为 2021–2023。
  2. 审阅包对否定结论只列规则 id，不给理由和来源，已改为全文列出。
  3. 审阅包遗漏部分输入字段（Global Talent 背书等），已改为输出全部字段。
  4. 室内画布的占位尺寸与实际不同，已按室内 / 室外取对应尺寸。
  风险与建议中采纳的：快照加入 `decidedBy`；审阅包改由测试比对；导读改为准确的结论与日期定义；来源索引纳入假设中引用的来源；B1 案例拆成 2027-03-25 与 03-26 两天；政策核对文档区分"提交"与"生效"，并注明官方预期。

## 3. 没做或没验证的

- 正式站的改动后 Lighthouse 数字要等合并部署后补测（本地服务器不压缩，绝对值不可比）。
- 审阅包还没有交给持牌顾问，需要用户安排。
- 试玩包还没有实际组织试玩。

## 4. 发现与建议（范围外，不实现）

- 以下几个结论值得请顾问重点看（审阅包里都有）：
  - G-OVERSTAY-BREACH、G-UNIVERSAL-CREDIT：现行法律下判为"可能符合"，引擎没有对 Part 9 的过往违规、Skilled Worker 领取 public funds 做裁量判断。
  - G-LONG-RESIDENCE-10Y：改革栏判为不符合（Student / Graduate 时间不计入），与现行法律的结论不同。
- 游戏的角色剧情文本全部打在一个约 790 KB 的包里，可以按角色拆分。
- 首页会加载规则引擎与两套词典。网站页性能分已在 96 以上，收益有限。
- e2e `mobile.spec.ts` 的"地点抽屉走到公园池塘"在本地全量运行中偶发失败 1 次（之后全量连跑 2 次、单条重复 8 次都通过）。它直接点地点按钮，没有用 `walkTo` 处理路上弹出的随机事件卡，和 PR #2 修过的那类偶发失败同源。CI 有 1 次重试，暂不处理；可让 `walkTo` 接受打开抽屉的回调后复用。
