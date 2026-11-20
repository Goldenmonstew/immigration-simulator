# 任务 33a：连续居留与最早申请日的修正（gpt-6.2-sol 实现，Fable 验收）

> 例外说明：2026-11-19 用户决定把 Phase 15 的任务交给 Codex 实现（见 `docs/tasks/phase-15-plan.md` 的例外范围，含规则语义改动），AGENTS.md 的"Codex 只审核"在本任务不适用；Fable 负责审核、提交、开 PR。你的沙箱不能写 `.git`、不能启动浏览器：**不要 commit，不要跑 Playwright**。

## 背景

任务 31 由 gpt-6.2-sol 分 8 块逐条核对规则与原文，另由 7 个独立会话逐条复核。原始核对报告与复核表（只读，绝对路径）：

- A1 核对：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/audit-a1.md`
- A2 核对：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/audit-a2.md`
- A3 核对：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/audit-a3.md`
- A4 核对：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/audit-a4.md`
- A5 核对：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/audit-a5.md`
- A6 核对：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/audit-a6.md`
- A7 核对：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/audit-a7.md`
- A8 核对：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/audit-a8.md`
- A1 复核：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/verify-a1.md`
- A2 复核：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/verify-a2.md`
- A3 复核：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/verify-a3.md`
- A4 复核：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/verify-a4.md`
- A5 复核：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/verify-a5.md`
- A6 复核：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/verify-a6.md`
- A7 复核：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/verify-a7.md`

复核表里判"成立""部分成立"的才修；判"不成立（明示简化）""已登记 PD"的不修。下面"要修的条目"按"核对块#编号"引用复核表的行。

## 修正原则（每条都适用）

1. 动手前自己回原文快照（`policy-sources/`）再核一遍；你不同意复核结论的，不改，在报告里写理由与原文位置。
2. 最小改动：缺信息时优先输出 `UNKNOWN`（必要时在 `docs/pending-details.md` 新登记 PD，编号接在现有最大号之后）或在结果里明示假设，**不要为此新增问卷题目**；只有不加输入就会给出错误的"通过"、且用户能答得上来时，才加输入，并同步问卷界面、`apps/web/lib/share.ts` 校验和中英文案。
3. 每条改动的规则带 SRC 段落定位；政策数字走 `packages/policy-data`，不写裸数字。
4. 每条至少一个回归测试，用复核表给的最小输入例子；测试名写核对块与编号（如 `A1#7`）。
5. 输出变化后重新生成快照：`pnpm --filter @uk-immigration/engine test -- -u`（黄金案例 `packages/engine/test/golden/`、双语快照、`docs/review/adviser-packet.md` 由测试生成）。在报告里列出哪些黄金案例的结论变了、为什么。
6. 不改范围外的文件；发现范围外的问题写进"发现与建议"。不要过度工程化（见 AGENTS.md）。

## 要修的条目

都与连续居留计算、缺席窗口和"最早申请日"有关，集中在共用代码：

- 最早申请日按 CR 1.1 倒算，而不是把满期周年日当作最早申请日：A1#7、A2#3、A3#1、A6#1。
- 无许可空档与 CR 4.1–4.3 的例外（中断、扣除、计入分开处理）：A1#9、A3#5、A6#2。
- 缺席窗口：合格期以外的缺席不应拖后窗口（A1#8）；Long Residence 按所选合格期计 548 天并守 2024-04-11 过渡边界（A3#6）；旧许可缺席窗口与重叠录入（A3#3、A6#3）；改革的滚动缺席峰值（A4#1）。
- 申请日人在英国境外仍判通过：A1#12、A2#2（只在问卷已有的出入境资料能判断时给 FAIL；资料不明时 `UNKNOWN`）。

A1#17（出境与返英两天都计入缺席）原文未登记、无法核实，不改，留给任务 39 登记指引。

## 范围

`packages/engine/src/residence.ts`、`aggregate.ts`、`dates.ts`、`rules/current-law/shared.ts`、`scope.ts`，以及为接上新结果必须改的路线规则调用处（只改调用，不改路线自身条件——那是任务 33b、33c）；`rules/es-residence.ts` 只改 A4#1；`packages/policy-data/src/parameters/`；对应测试与生成快照；`docs/contracts.md` 中定义候选日期的段落。

## 验收命令

```bash
pnpm --filter @uk-immigration/policy-data test
pnpm --filter @uk-immigration/engine test
pnpm --filter web test
pnpm lint
pnpm typecheck
```

## 报告

写 `docs/tasks/reports/33a-residence-dates.md`，最终消息同内容，四段：做了什么（按条目列，建议的 commit 分组与文件）、怎么验证的、没做或没验证的（含不同意复核结论的条目）、发现与建议。

## 第 2 轮（Fable 追加）

1. **担保伴侣的位置不要判 `UNKNOWN`。** 问卷没有这一题，用户无法补；现在 4 个五年伴侣黄金案例（G-FAMILY-5Y-LOW-INCOME、CL-FAMILY-PARTNER-FIVE-YEARS、CL-FAMILY-FIVE-YEAR-SAVINGS-PASS、CL-FAMILY-FIVE-YEAR-PARTNER-BENEFIT）都变成了"资料不足"，等于所有五年伴侣用户都拿不到结论。改为在结果里明示假设（中英文："假设申请日你的伴侣也在英国"一类，附原文条款），`CL-FAMILY-RELATIONSHIP` 恢复按已有资料判断；只有已有资料能看出担保伴侣不在英国时才另作处理。申请人本人的申请日位置维持本轮的 FAIL / UNKNOWN 处理。
2. **结果页要讲清提前 28 天。** 现在多个案例的最早申请日按 CR 1.1 提前了 28 天。核对结果页与规则说明里是否有中英文的一句话讲明"可在满期前最多 28 天递交（CR 1.1）"，没有就加在该规则的说明或假设里（不要新加页面组件）。
3. **同步依赖黄金结论的地方**：`apps/e2e/tests/questionnaire.spec.ts` 里两个场景的 `earliest` 期望值（G-SW-ABSENCE-200-DAYS 现为 2028-07-01，G-SW-5Y-ON-DAY 核对一下）；`docs/playtest/kit.md` 第 7 节参考答案表（A1–A3 对应的黄金案例）。你跑不了 Playwright，只改期望值，Fable 会跑。
4. 重新生成快照，报告里更新"哪些黄金案例结论变了"的清单。

## 第 3 轮（Fable 追加，按 gpt-6.2-sol 只读审核）

审核意见全文：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/review33a-1.md`。5 条都要处理，每条用审核给的实测反例加回归测试：

1. 最早申请日投影先按已录入的许可核对参考日（已录入的转签、到期要算进去），只对未知的未来期间作"持续持有可计许可"的假设（SRC-004 SW 21.2、22.1；SRC-008 CR 1.1）。
2. 随行申请（Skilled Worker 伴侣、Global Talent 伴侣、BN(O) adult dependant relative 等）不要取双方日期的较晚值：在同一个候选递交日分别核对双方，找出双方都满足的最早日期。
3. CR 1.1 提前递交的候选日，也要核对该日申请人是否在英国（BN(O) HK 55.2(e) 等有境内要求的路线：Global Talent、Innovator Founder、Settlement Family Life、Private Life 的调用点）；行程明确在境外的候选日不能算可申请。
4. 缺席去重前先按每趟行程的出发日确定适用的旧制或新制（2024-04-11 分界），再对缺席天数去重；不要把分界日后出发的行程合并进分界前的那趟。
5. 撤回 UK Ancestry 的入口扩展（A3#2 属于任务 33c，不在 33a 范围）：`ancestry.ts` 恢复到 origin/main 的入口条件，只保留 CR 1.1 计算本身的调用改动。

重新生成快照，报告更新黄金案例变化清单。

## 第 4 轮（Fable 追加）

1. **全仓 gate 失败**（合入最新 main 后）：`packages/game/test/characters.test.ts` 的 "BN(O) keeps B1 on the five-year route while reform exclusion retains criminal checks" 在第 70 行报 `rule(trip, 'CL-HKBNO-RESIDENCE-5Y')` 为 undefined——游戏里出境 6 个月、回到英国的当天，BN(O) 五年居留规则不再出现。疑似返英当天被判为"申请人在境外"，`CL-SCOPE` FAIL 后路线规则被跳过。返英当天人已在英国，不应判为境外；路线居留规则在申请人位置有问题时也应照常给出（FAIL/UNKNOWN），而不是消失。修好后跑 `pnpm --filter @uk-immigration/game test` 全量。
2. **第 2 轮审核的 4 条**（全文 `/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/review33a-2.md`）：
   - 去重不能把两趟行程合成一趟：保留每趟行程用于单次上限与出入境时的许可核对，只对累计天数取并集。
   - 主申请人在模拟日境外时，随行申请仍要在未来同一递交日核对双方（不要因模拟日 `CL-SCOPE` FAIL 就跳过同日搜索）。
   - `G-HKBNO-ONE-MONTH-SHORT`：许可到期前 28 天内有效递交、参考日依赖 s3C 延续的情形，按"有条件"结果处理（披露假设），不要把预计申请日推到许可到期之后；已知转签与实际空档的检查保留。
   - 五年 Appendix FM 伴侣的未来候选日也按 R-ILRP.1.1(a) 核对申请人位置。
3. 两轮审核给出的**每个实测反例**都写成回归测试（测试名注明"review33a-1 #n"或"review33a-2 #n"）；改完后逐个重算这些反例，确认推荐日期在该日重算时确实通过。
4. 改完跑 brief 的全部验收命令外加 `pnpm --filter @uk-immigration/game test`，重新生成快照，报告更新。

## 第 5 轮（Fable 追加；本轮起由 gpt-6.2-astra 实现，标准档）

审核第 3 轮意见全文：`/private/tmp/claude-501/-Users-wanruncong-Projects-web-UK/93b55f23-36e5-4089-9342-14ec7d1f53f1/scratchpad/t30/review33a-3.md`。5 条都处理，每条用审核给的实测反例写回归测试（测试名注明 "review33a-3 #n"），并在推荐日期当天重算确认：

1. 免本人居留年限的随行子女，同日搜索不要套用连续居留缺席上限；只核对候选日的位置、适用许可与随行条件。
2. 模拟日是主申请人出境当天时，当天位置可保留 `UNKNOWN`，但汇总层不要丢掉同日搜索的入口，已知返英日要继续用于寻找共同递交日。
3. 随行结果选中的共同日期依赖主申请人的 s.3C 延续时，把这一前提一并写进随行人的双语结果。
4. 许可记录有重叠时，按引擎"重叠时取最近生效许可"的同一口径回溯连续期，不要跳过中间已录入的 Student 等转签。
5. 五年 Appendix FM 伴侣首个返英日落在许可空档时，继续按已录入的新许可核对满期与位置，不要过早停止搜索。

跑全部验收命令外加 `pnpm --filter @uk-immigration/game test`，重新生成快照，报告更新。
