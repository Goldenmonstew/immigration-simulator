# 任务 33e：改革的贡献、家属与受保护人群修正（gpt-6.2-sol 实现，Fable 验收）

> 本分支基于任务 33a 第 3 轮的提交。

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

A5 复核表里成立和部分成立的全部条目：A5#1（后到伴侣的 dependant 合格期）、#2（只填 partnerEarnings 即通过最低收入）、#3（Best years 的税年边界）、#4（公共福利回看的合格路线条件，PD-047）、#5（弱势豁免与仅家属领福利）、#6（福利清出日期）、#7（British connection 的关系依据）、#8（Annex C 公共服务转出，PD-012）、#9（申请日之后的非法入境）、#10（Protection Work and Study 兜底，登记 PD）、#11（子女收入豁免页码、保护贡献文案改读参数）。

新登记的 PD 编号从 **PD-083** 起（PD-081 已被任务 32 使用，PD-082 留给任务 33d）。

## 范围

`packages/engine/src/rules/es-contribution.ts`、`es-dependant.ts`、`es-protection.ts`，`packages/engine/src/aggregate.ts`（只改 A5 需要的部分），`packages/engine/src/types.ts`、`packages/policy-data/src/parameters/earned-settlement-2026-11.ts`，必要时问卷（只在原则 2 允许时），对应测试与快照，`docs/pending-details.md`、`docs/contracts.md`。不要改 `es-residence.ts`、`es-requirements.ts`、`es-transitional.ts`（任务 33d）与现行法路线文件。

## 验收命令

```bash
pnpm --filter @uk-immigration/policy-data test
pnpm --filter @uk-immigration/engine test
pnpm --filter web test
pnpm lint
pnpm typecheck
```

快照用 `pnpm --filter @uk-immigration/engine test -u` 重新生成。若黄金案例结论变了，同步 `apps/e2e/tests/questionnaire.spec.ts` 的期望值与 `docs/playtest/kit.md` 第 7 节。

## 报告

写 `docs/tasks/reports/33e-es-contribution.md`，最终消息同内容，四段。
