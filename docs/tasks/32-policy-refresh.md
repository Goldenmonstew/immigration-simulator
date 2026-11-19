# 任务 32：来源刷新与补登记（gpt-6.2-sol 实现，Fable 验收）

> 例外说明：2026-11-19 用户决定把这批任务交给 Codex 实现（"codex 的额度要用不完了……能做哪些做哪些"），AGENTS.md 的"Codex 只审核"在本任务不适用；Fable 负责审核、提交、开 PR。你的沙箱不能写 `.git`，**不要 commit**，在报告里按 commit 分组列出文件。

## 背景

`docs/SOURCES.md` 最新的 LAW 来源是 SRC-048（HC 584，2026-09-03）；各 Appendix 快照多为 2026-10-08 版。今天是 2026-11-19。另外：

- 游戏的诺拉情景（Graduate → Skilled Worker）只解释了 Skilled Worker 新入职者选项（SW 4.2 Option E），没有建模。建模前要知道 SW 12.3 的 4 年合计怎么算（已用的 Graduate 时间、未用完的 Graduate 时间怎么计）。见 `docs/research/2026-11-19-ukcisa-crosscheck.md`。
- 学生路线的打工时长上限、课程结束后的收尾期没有登记来源（同一报告"待核"一节）。

## 要做

1. **新的官方变化**：按 `docs/versioning.md` §2–§3 查 2026-09-03（HC 584）之后有没有新的 Statement of Changes（gov.uk 的 "Statement of changes to the Immigration Rules" 集合页 / Content API），以及 `docs/pending-details.md` 里 PD-076–PD-080 涉及的预算案、议会事项有没有新的官方文件。
   - 有新的：按 §3 登记（新 SRC、快照 + sha256、受影响 Appendix 新快照不覆盖旧文件、段号对照、`apps/web/lib/sources.ts` 与 `policy-changelog.ts` 中英各一条）。
   - 在报告里逐条写：它改了什么、生效日、会不会改变本项目的哪条规则或参数（写出代码位置）。**不要改规则、参数或游戏代码**；需要改的列为后续任务。
   - 没有新的：在报告里写明查过哪些页面、截至何时没有。
2. **补登记**（编号接在第 1 步之后顺延）：
   - Home Office 的 Skilled Worker caseworker guidance（当前版本）：找出新入职者（Option E）资格、SW 12.3 的 4 年合计如何计算，尤其 Graduate 许可时间如何计入；写出 guidance 的小节标题与锚点。
   - Immigration Rules: Appendix Student（当前版本）：学期内打工时长上限及适用条件、假期规则、课程结束后的许可收尾期；写段落号。
   - guidance 或原文没写清楚的，登记为新的 PD（编号接在现有最大号之后）。
3. `docs/pending-details.md`：若第 1、2 步的官方文件让某个 PD 明确了，更新该行的"预计何时明确"等字段并写 SRC 定位；不要删行。

## 不要做

- 不改 `packages/engine`、`packages/policy-data/src`、`packages/game`、`apps/web` 中除 `lib/sources.ts`、`policy-changelog.ts` 以外的文件。
- 不用律所、媒体、UKCISA 等二手来源替代官方原文（只能交叉验证，且要写明）。
- 不为本任务新建脚本或工具。

## 验收命令

```bash
node packages/policy-data/scripts/check-sources.mjs
pnpm --filter @uk-immigration/policy-data test
pnpm --filter web test -- sources
```

（`check-sources.mjs` 需要网络；你的沙箱有网络。若某条命令在沙箱里跑不了，写明原因，由 Fable 补跑。）

## 报告

写 `docs/tasks/reports/32-policy-refresh.md`，最终消息同内容，四段：做了什么（按建议的 commit 分组列文件）、怎么验证的（命令 + 结果）、没做或没验证的、发现与建议（范围外，不实现；凡涉及规则或参数改动，写成可直接开任务的一句话 + 代码位置 + SRC 定位）。另在 `docs/research/2026-11-19-option-e-and-student.md` 写第 2 步的结论（Option E 4 年怎么算、学生打工与收尾期），每条带 SRC 定位。
