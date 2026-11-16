# AGENTS.md — 本仓库所有 agent 的工作约定

适用于在本仓库工作的所有 agent：Codex CLI（astra / sol 等）与 Claude Code。Claude Code 通过 `CLAUDE.md` 引入本文件。

2026-11-16 起（用户决定）：Fable（Claude）直接实现；Codex 模型（astra / sol）只做代码审核，不再写代码；agy（Gemini 模型）只做页面设计、布局与风格的评审。（2026-11-15 至 11-16 曾由 Codex 写代码、Fable 只统筹。）

main 受分支保护：所有改动走 PR。CI 的 `check` 与 `e2e` 通过、Codex 审核意见处理完后才合并；合并后自动走预发、冒烟、正式发布。

## 角色与边界

- Fable（Claude）：实现、提交、开 PR、合并、更新 `PROGRESS.md`。规则语义改动须附 SRC 定位与测试。
- Codex（astra / sol）：只读审核 PR 的 diff，按"问题 / 风险 / 建议"列出意见，不改文件、不提交。
- agy（Gemini）：只评审页面设计、布局与风格。
- 每个任务只做约定的范围。范围外的问题写进报告的"发现与建议"，不要擅自实现。
- 审核者不要修改 `PROGRESS.md`、`AGENTS.md`、`CLAUDE.md`。

## 语言

- 与人沟通、commit message、文档：中文。
- 代码、注释、标识符、文件名：英文。法律术语保留英文原文（如 Skilled Worker、public funds、settlement）。

## 政策内容的硬规则

- 任何政策数字（门槛、年限、日期）必须能追溯到 `docs/SOURCES.md` 的 `SRC-xxx` + 页码或段落号；没有来源的数字不要写进代码、数据或文档。
- 规则语义改动由 Fable 实现，须附 SRC 定位与测试，并经 Codex 只读审核；审核者发现规则问题只报告。
- 政府未定的细节输出 `UNKNOWN`，并登记到 `docs/pending-details.md`；不要猜。
- 不要在代码里硬编码裸数字门槛，一律走 `packages/policy-data` 的参数文件。
- 不要用律所、媒体页面替代官方来源；二手来源只能用于交叉验证。

## Git

- 在自己的 worktree / 分支上工作；改动推到分支并开 PR，不直接推 main；不要改 git 配置；不要 rebase 或改写已推送的历史。
- 一个逻辑改动一次 commit。格式：`Type: 简短描述`，Type 取 `Feat` / `Fix` / `Refactor` / `Test` / `Chore` / `Docs`；正文可写要点；末尾一行 `Co-Authored-By: <agent 名> <noreply@...>`，例如：
  - `Co-Authored-By: Codex gpt-6.1-sol <noreply@openai.com>`
  - `Co-Authored-By: Codex gpt-6-astra <noreply@openai.com>`
  - `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- 只 `git add` 本次改动相关的文件；不要提交 `node_modules`、构建产物、`.env`。
- commit 前必须通过 brief 里的验收命令。
- Codex 只审核：不改文件、不提交；审核意见写进它的最终消息，由 Fable 处理并附在 PR 说明里。

## 验证

- 改了会影响编译或行为的代码：改完就跑 build、typecheck、test；失败立即修，不要留着做别的。
- 不要同时启动多个重型进程（并行 build、多个 dev server）。
- 不信任"成功提示"：验证实际结果（文件真的存在、测试真的运行、命令退出码为 0）。

## 不要过度工程化（用户明确要求）

- 只实现 brief 要求的东西，用最直接的写法。不要为了"健壮"加额外的校验、防御性分支、抽象层、配置项或工具链。
- 除非 brief 明确要求，不要加：husky / lint-staged / commitlint 等提交钩子；自定义校验脚本；对内部调用的参数防御检查；为"将来可能需要"预留的接口或泛化；多余的 try/catch；把简单函数拆成多个文件；额外的 CI job（安全扫描、依赖审计等）。
- 判断标准：删掉这段代码，brief 的验收命令会不会失败？不会就别写。
- 校验只在系统边界做一次（用户输入、外部数据文件），内部信任类型系统。
- 配置文件保持最小：ESLint 用 recommended 规则集，tsconfig 只开 strict 与必要选项，不复制模板里用不到的字段。

## 完成时的报告

最后一条消息按下面四段写，并把同样内容写入 brief 指定的 `docs/tasks/reports/<task-id>.md` 一并提交：

1. 做了什么（按 commit 列）
2. 怎么验证的（命令 + 结果）
3. 没做或没验证的
4. 发现与建议（范围外，不实现）
