# 任务 44 · 来源检查脚本第 3 轮

## 1. 做了什么

建议 Fable 将 `packages/policy-data/scripts/check-sources.mjs`、`docs/SOURCES.md`、两份 `policy-sources/2026-11-19-govuk-content-api-*.html` 和本报告合为一个提交。

```text
Fix: 保留来源表格边界并更新 GOV.UK Content API 快照

Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>
```

- GOV.UK 网页比较保留 `td`、`th`、`tr` 的结束边界。正文忽略其他标签的布局差异，合并空白，对各段文本解码一次。每项缺 URL、请求或解析异常仍单独计入 `fetch failed`，然后继续检查。
- SRC-040 的 JSON 地址仅由已有的快照映射决定，删除委员会 JSON URL 推断。SRC-010 按抓取日保存官方首页和 reference 的原始 HTML，重新登记两份 SHA-256，并在备注保留 2026-11-04 旧版文件名和更新后的定位。

## 2. 怎么验证的

`node packages/policy-data/scripts/check-sources.mjs` 联网检查 56 份已登记快照，退出 **0**。两份 SRC-010 从第 2 轮 Fable 验收时的 `changed` 变为 `unchanged`，`shasum -a 256` 独立核对新快照与登记值、旧快照与原登记值均一致。

```text
Summary: 55 unchanged / 0 changed / 0 fetch failed / 1 dynamic
```

| 来源 | 实际比较分支 |
|---|---|
| SRC-033、SRC-037–039 书面问题 JSON | 官方单条 API，比较问题号、提问及回答日期、问答正文 |
| SRC-034、SRC-035 Content API JSON | 官方 `/api/content/` 响应原始 SHA-256。同一来源的 HTML 快照走 GOV.UK 网页正文分支 |
| SRC-002、SRC-003、SRC-047 Hansard | 官方 JSON 的 `Contribution` 正文。SRC-003、SRC-047 原始字节有差异，正文一致 |
| SRC-040、SRC-041 委员会文档 | 由显式 URL 抓 HTML、PDF 文档，将 API 的 base64 `data` 解码后比原始 SHA-256。SRC-040 元数据 JSON 直接比原始 SHA-256 |
| SRC-010 两页、SRC-011 | SRC-010 HTML 按原始 SHA-256 比较。SRC-011 归为 `dynamic` |

同一批临时样例用第 2 轮与第 3 轮的脚本各跑一次，使用本地快照和模拟响应，通过脚本正常入口比较。

| 样例 | 第 2 轮 | 第 3 轮 |
|---|---|---|
| 只换外层标签、类名，或加表格布局包装 | `unchanged` | `unchanged` |
| 更改金额或链接文字 | `changed` | `changed` |
| 把 SRC-031 生效后费用并入当前费用单元格，留下空列 | `unchanged` | `changed` |
| 把同一段文字从一行移到另一行 | `unchanged` | `changed` |
| `&frac12;` 与 `½`，以及 `&times;` 与 `×` | `changed` | `unchanged` |
| `&amp;frac12;` 与 `&frac12;` | `unchanged` | `changed` |
| 数字实体 `&#163;`、`&#xBD;`、`&#146;` 与对应字符 | `changed` | `unchanged` |
| 单项缺 URL，其后的快照仍被检查 | `fetch failed` 后继续 | `fetch failed` 后继续 |

`pnpm --filter @uk-immigration/policy-data test` 通过，6 个文件、23 项测试。`pnpm lint`、`node --check packages/policy-data/scripts/check-sources.mjs` 和 `git diff --check` 均通过。

## 3. 没做或没验证的

Fable 的第 3 轮独立验收、提交和 PR 待执行，GitHub Actions 本轮未触发。网页正文按 HTML 标签提取，CSS 显隐未用浏览器验证。

Node 内置没有 HTML 命名实体表。仓库已有依赖中的完整表位于 Prettier 和 Next.js 的内部打包文件，现有工作流直接运行 Node 脚本且没有安装依赖。按任务给的回退方案，用 WHATWG 数据筛出快照实际出现的 8 个命名实体，加上指定样例 `frac12`。其他命名实体按原字面比较，数字实体照常解码。脚本运行时无需下载实体表。[WHATWG 命名实体数据](https://html.spec.whatwg.org/entities.json)

## 4. 发现与建议

- **SRC-010 失效的定位**。首页的 `#beta-software` 已移除。`#quick-start` 与 `#authentication` 的内容迁到 Get started，仍无需认证。`#rate-limiting` 迁到 reference，每客户端仍最多 10 请求/秒。登记备注已更新。`docs/SOURCES.md` 的 `turn218854search7`、`turn218854search9` 两条历史核对记录仍列旧定位，查当前内容应使用新备注。[官方首页](https://content-api.publishing.service.gov.uk/) · [Get started](https://content-api.publishing.service.gov.uk/get-started.html#authentication) · [Rate limiting](https://content-api.publishing.service.gov.uk/reference.html#rate-limiting)
- **SRC-010 仍有效的引用**。站内映射的首页 URL 及首页的用途、覆盖范围锚点仍有效。三个元数据字段仍见 `#schema-contentitem`。将研究报告和 Phase 4 计划中的查询方法与 SRC-034、SRC-035 的在线 JSON 对照，`public_updated_at` 和 `details.change_history[0]` 均可读取。历史任务日志中的快照名及哈希仍对应各自核对时点。[ContentItem](https://content-api.publishing.service.gov.uk/reference.html#schema-contentitem) · [Graduate 响应](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-graduate) · [HPI 响应](https://www.gov.uk/api/content/guidance/immigration-rules/immigration-rules-appendix-high-potential-individual)

## Fable 验收（第 3 轮补记）

- 本机重跑 `node packages/policy-data/scripts/check-sources.mjs`：`Summary: 55 unchanged / 0 changed / 0 fetch failed / 1 dynamic`，退出 0。
- policy-data 23 项、lint 通过。
