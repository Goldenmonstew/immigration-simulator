# 任务 33b：现行法 Skilled Worker、家庭与英语的条件修正（gpt-6.2-sol 实现，Fable 验收）

> 本分支基于任务 33a 的提交（连续居留、缺席窗口与最早申请日已改）。

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

- Skilled Worker：A1#2（ISL 按最近一次许可的担保事实判断，证据不足保留 UNKNOWN）、A1#3、A1#4、A1#5、A1#6、A1#13、A1#16（复核表的部分成立按其限定范围修）。
- 家庭与英语：A2#4、A2#9、A2#10。
- 配偶 suitability：A6#5（SW 39.1(b) 按配偶本人评估，保留配偶自己的 suitability 筛查）。
- 结果投影：A6#6 的引擎部分（`aggregate.ts` 里现行法的投影日期按投影申请日核对英语标准与豁免，摘要保留尚待满足的条件）。网站显示由任务 49 改，这里只改引擎输出。
- 缺席整天计数：A1#17。任务 39 登记了 Home Office Continuous residence caseworker guidance（`#count-whole-days`、`#the-12-month-period`、Example 2；39 的登记在另一分支，原文：https://www.gov.uk/government/publications/continuous-residence-caseworker-guidance ，可直接读该页或 SRC-008 CR 3.1、3.3–3.4）：缺席只计出境与返英之间的整天。改 `residence.ts` 的缺席计数与相关说明，SRC 定位写 SRC-008 CR 3.1，并在报告里注明 guidance 的锚点，由 Fable 在 39 合并后补上 SRC 编号。

## 范围

`packages/engine/src/rules/current-law/skilled-worker.ts`、`family.ts`、`dependants.ts`、`english.ts`、`shared.ts`，`packages/engine/src/aggregate.ts`（只改现行法投影）、`residence.ts`（只改 A1#17），`packages/engine/src/types.ts`、`packages/policy-data/src/`，必要时 `apps/web/lib/questionnaire.ts`、`share.ts` 与问卷步骤（只在原则 2 允许时），对应测试与快照，`docs/contracts.md`。不要改 `es-*.ts`（任务 33d、33e）与其他现行法路线文件（任务 33c）。

## 验收命令

```bash
pnpm --filter @uk-immigration/policy-data test
pnpm --filter @uk-immigration/engine test
pnpm --filter web test
pnpm lint
pnpm typecheck
```

快照用 `pnpm --filter @uk-immigration/engine test -u` 重新生成（不是 `test -- -u`）。若黄金案例结论变了，同步 `apps/e2e/tests/questionnaire.spec.ts` 的期望值与 `docs/playtest/kit.md` 第 7 节。

## 报告

写 `docs/tasks/reports/33b-current-law-routes.md`，最终消息同内容，四段：做了什么（按条目列，建议的 commit 与文件）、怎么验证的、没做或没验证的（含不同意复核结论的条目）、发现与建议。
