# 任务 39：第二批来源登记（gpt-6.2-sol 实现，Fable 验收）

> 例外说明：2026-11-19 用户决定把 Phase 15 的任务交给 Codex 实现（见 `docs/tasks/phase-15-plan.md`），AGENTS.md 的"Codex 只审核"在本任务不适用；Fable 负责审核、提交、开 PR。你的沙箱不能写 `.git`：**不要 commit**。本分支基于任务 32 的提交（SRC-049–052、PD-081 已登记）。

## 要做

按 `docs/versioning.md` §3 与 `docs/SOURCES.md` 的现有格式，登记下面几份官方原文（快照 + sha256，编号从 SRC-053 起顺延；新 PD 从 PD-082 起），并在 `docs/research/2026-11-19-sources-batch-2.md` 写清每份能回答什么、能否据此建模：

1. **Immigration Rules Appendix FM-SE** 与 Home Office 关于 **adequate maintenance**（Appendix FM 伴侣在对方领取特定福利时的供养证明）的指引：能否让 PD-075 明确，若能，写出可建模的口径与条款号；不能就保留 PD-075 并说明缺什么。
2. **Immigration Act 1971 s3C**（legislation.gov.uk 的现行版本）：许可到期前递交申请、到期时仍待决，原许可如何延续；写出对游戏诺拉情景"递交与获批的先后"的含义（任务 40 要用）。
3. **Home Office Workers and Temporary Workers: guidance for sponsors**（Part 2 sponsor duties / sponsorship 相关部分；11.4 报告建议登记）：只登记与 CoS、薪资、going rate 相关的小节定位。
4. **Continuous residence caseworker guidance**（Home Office）：出境日与返英日是否都计入缺席（任务 31 的 A1#17 判"无法核实"）、跨过渡日行程的计数。写出结论与小节锚点；若与引擎现行做法（出境、返英两天都计入）不同，列为后续规则任务，不改代码。

`apps/web/lib/sources.ts` 与 `packages/policy-data/src/data/policy-changelog.ts` 按 §3 同步（只有确实属于政策变化的才进 changelog；单纯补登记不进）。

## 不要做

- 不改 `packages/engine`、`packages/policy-data/src/parameters`、`packages/game`、`apps/web`（除 `lib/sources.ts`）。
- 不用二手来源替代原文。不为本任务写脚本。

## 验收命令

```bash
node packages/policy-data/scripts/check-sources.mjs
pnpm --filter @uk-immigration/policy-data test
pnpm --filter web test -- sources
```

`check-sources.mjs` 在本分支上还是旧版（任务 44 的修复未合并），若在 SRC-033 处报错，改为把你新登记的几份快照逐份用 `curl` 抓取比对 sha256，在报告里写明；Fable 合并 44 后会重跑。

## 报告

写 `docs/tasks/reports/39-sources-batch-2.md`，最终消息同内容，四段：做了什么（建议的 commit 与文件）、怎么验证的、没做或没验证的、发现与建议（凡涉及规则改动，写成可直接开任务的一句话 + 代码位置 + SRC 定位）。
