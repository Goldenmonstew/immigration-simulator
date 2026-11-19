# 任务 44：修来源检查脚本（gpt-6.2-sol 实现，Fable 验收）

> 例外说明：2026-11-19 用户决定把 Phase 15 的任务交给 Codex 实现（见 `docs/tasks/phase-15-plan.md`），AGENTS.md 的"Codex 只审核"在本任务不适用；Fable 负责审核、提交、开 PR。你的沙箱不能写 `.git`：**不要 commit**。

## 背景

每周的 GitHub Actions "Check sources"（`node packages/policy-data/scripts/check-sources.mjs`）2026-11-16 那次失败了。任务 32 发现：脚本把所有 `.json` 快照都当成 Hansard 快照处理，到 `docs/SOURCES.md` 的 `### <ID> ` 备注里找 `hansard-api.parliament.uk` 的 URL；SRC-033 的快照是议会书面问题的 JSON，没有这样的 URL，取备注时抛 `TypeError`，脚本退出 1，后面的来源都没检查到。

## 要做

- 让脚本正确处理非 Hansard 的 JSON 快照（例如 SRC-033 书面问题 JSON：在登记备注里记录的官方 API URL 抓取并比较；规范化方式按该 API 的实际结构）。只改 `packages/policy-data/scripts/check-sources.mjs`；若登记备注里缺 URL，补在 `docs/SOURCES.md` 该 SRC 的备注里。
- 一个来源出错时，脚本应继续检查其余来源并在最后汇总（看现有的 `fetch failed` 计数是否已经这样做；只修让整个脚本中断的路径）。
- 不改其他来源的判定逻辑，不加新的依赖、配置或 CI job。

## 验收命令

```bash
node packages/policy-data/scripts/check-sources.mjs
pnpm --filter @uk-immigration/policy-data test
pnpm lint
```

脚本需要网络（你的沙箱有）。在报告里贴出脚本最后的汇总行，并逐条说明还标为 changed / fetch failed 的来源是什么原因（官方页面真的改了，还是抓取问题）；真的改了的不要在本任务里重新登记，列进"发现与建议"。

## 报告

写 `docs/tasks/reports/44-check-sources.md`，最终消息同内容，四段：做了什么（建议的 commit 与文件）、怎么验证的、没做或没验证的、发现与建议。

## 第 2 轮（Fable 追加）

第 1 轮修好后脚本能跑完，但汇总是 `29 unchanged / 21 changed / 5 fetch failed / 1 dynamic`，而你逐条核对的结论是：21 个 changed 里 18 个 Immigration Rules 页只是 `<main>` 内 `<div>` 布局变化、SRC-030 只是撇号改成 HTML 实体，都不是正文变化；5 个 fetch failed 是同一行多份快照取不到对应 URL（SRC-001、SRC-036、SRC-041 的 `/pdf/` 地址）或议会网页 403（SRC-040，官方 API 可取）。这样每周检查仍会报红，失去提醒作用。本轮：

- GOV.UK HTML 的比较改为只比可见文字（去掉全部标签、解码 HTML 实体、合并空白），让纯布局与实体写法的变化不算 changed；可见文字变了仍报 changed。
- 让一行里多份快照各自找到对应 URL（可以在 `docs/SOURCES.md` 该 SRC 的登记备注里写明"快照文件 → URL"，脚本按备注取），SRC-040、SRC-041 用备注里的官方 API 地址。
- SRC-010 两页是官方文档真的改版：不在本任务重新登记，保留为 changed 并写进报告"发现与建议"。
- 仍只改 `check-sources.mjs` 与 `docs/SOURCES.md` 的登记备注。验收同上，报告更新为第 2 轮的汇总行，目标是只剩 SRC-010 两个 changed、0 个 fetch failed（网络偶发失败除外，需说明）。
