# 任务 44 · 来源检查脚本第 2 轮

## 1. 做了什么

建议 Fable 将 `packages/policy-data/scripts/check-sources.mjs`、`docs/SOURCES.md` 和本报告合为一个提交。

```text
Fix: 按快照核对政策来源并消除网页布局误报

Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>
```

- GOV.UK HTML 取 `<main>` 文字，缺少 `<main>` 时取 `<body>`。去除标签及脚本、样式等内容，解码数字实体和常用命名实体，合并空白后比较。
- 登记备注可按快照文件名指定抓取 URL。补齐 SRC-001 和 SRC-036 的 HTML 地址，SRC-040 和 SRC-041 使用议会官方 API。文档响应解码 base64 `data` 后比较原始字节的 SHA-256，SRC-040 元数据按 JSON 响应的原始字节比较。
- 保留第一轮对议会书面问题的处理，按问题号、日期、提问和答复正文比较。缺 URL、请求和解析异常计入当前快照的 `fetch failed`，检查继续。

## 2. 怎么验证的

- `node packages/policy-data/scripts/check-sources.mjs` 联网检查了全部 56 份快照。18 个 Immigration Rules 页和 SRC-030 共 19 项误报消除，原先抓取失败的 5 份均为 `unchanged`。另从委员会 API 单独抓取，确认 SRC-040 的两份快照和 SRC-041 的 PDF 哈希与登记一致。
- 临时样例验证了布局与实体写法变化报 `unchanged`、可见金额变化报 `changed`，缺 URL 报 `fetch failed` 后继续检查后续快照。
- `pnpm --filter @uk-immigration/policy-data test` 通过，6 个测试文件、23 项测试。`pnpm lint`、`node --check packages/policy-data/scripts/check-sources.mjs` 和 `git diff --check` 均通过。

```text
Summary: 53 unchanged / 2 changed / 0 fetch failed / 1 dynamic
```

脚本因 SRC-010 的两项变化按现有约定退出 `1`。

## 3. 没做或没验证的

Fable 的独立验收、提交和 PR 待执行。未重新登记 SRC-010，也未触发 GitHub Actions。HTML 提取按标签处理，CSS 显隐未经浏览器验证。字符表之外的命名实体按原字面比较。

## 4. 发现与建议

- **SRC-010 Content API 首页**确有正文改版。原来的 beta 提示已移除，入门和认证说明移到单独页面。[官方首页](https://content-api.publishing.service.gov.uk/) · [入门页](https://content-api.publishing.service.gov.uk/get-started.html)
- **SRC-010 Content API reference**确有正文改版。参考页新增 Rate limiting 小节，沿用旧首页的限流口径。[官方参考页](https://content-api.publishing.service.gov.uk/reference.html#rate-limiting)

建议另行复核并重新登记这两份官方文档。

## Fable 验收（补记）

- 本机重跑 `node packages/policy-data/scripts/check-sources.mjs`：`Summary: 53 unchanged / 2 changed / 0 fetch failed / 1 dynamic`，退出 1 只因 SRC-010 两页（官方文档改版，另行登记）。修改前 2026-11-16 的每周检查失败、本地在 SRC-033 处抛 `TypeError`。
- `pnpm --filter @uk-immigration/policy-data test` 23 项通过；`pnpm lint` 通过。
