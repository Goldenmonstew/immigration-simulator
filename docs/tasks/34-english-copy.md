# 任务 34｜英文文案修正

由 Fable 实现（2026-11-20 起开发由 Fable 负责，Codex 只读审核）。依据：A8 英文复核（任务 31，25 条）。49、40／50 已改过的条目只核对，不重复改。

## 范围

按 A8 的 25 条改网站词典、引擎英文说明与游戏英文文本；中文只在同一条含义需要同步时改。政策含义的改写须对照存档来源：

- INNF 17.1(f)(vii)（SRC：Appendix Innovator Founder 存档）
- PL 3.1、4.1、5.1（Appendix Private Life 存档）
- SRC-001 第 1 章的犯罪记录口径
- SW 21.2、SW 4.2(b)(ii)、SW 24.3（SRC-004）
- Home Office 连续居留指引的整天口径（SRC-057）

另并入试玩与走查发现的命名问题：
- 50 报告里"散步小队"与"徒步私教班"的命名统一。
- 43 走查的"背包/ 镇民"斜杠空格。
- 改革栏标题"改革后／After reform"。

## 不做

- 引擎规则逻辑与日期计算不改，只改文字。
- 福利下拉的约 50 项官方名称只改 A8 指出的两项拼写。

## 验收

```
pnpm lint && pnpm typecheck && pnpm test && pnpm build
E2E_PORT=43xx pnpm --filter e2e e2e
```
