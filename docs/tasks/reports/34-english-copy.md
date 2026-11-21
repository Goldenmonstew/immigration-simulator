# 任务 34｜英文文案修正

## 1. 做了什么

按 A8 英文复核（任务 31）的 25 条逐条处理。#2（ISL 提示）已在 49 改过，#5（犯罪记录）、#9（BN(O) public funds）与 #11（旧薪资档截止）已在 33 系列改过，本任务只核对。

| 提交 | 内容 |
|---|---|
| 网站文案 | 见下方"网站文案"列表 |
| 引擎说明 | 见下方"引擎说明"列表 |
| 游戏文本 | 见下方"游戏文本"列表 |
| permission 收尾 | 问卷其余 visa 标签与游戏到期提示改称 permission |

网站文案：
- #3 Innovator Founder 按 INNF 17.1(f)(vii) 写"每个岗位"、税前、不含津贴。
- #4 Private Life 三项按 PL 3.1、4.1、5.1 补"至少 7 年""连续居住至少一半人生""须前往生活的国家"。
- #6 结论说明按"至少一条路径"表述；"最早可能日期"改为"最早可申请日期（推算）"。
- #8 主申请人提示。
- #10 签证中心空状态改为通用说法；关门来不及时优先显示关门原因。
- #12 季末"更新"不再叫 settlement；游戏改革栏改为"已公布改革／Announced reforms"。
- #13 错误页不再保证不丢失。
- #14 两份开发预览示例结果中英文分开。
- #18 英文单复数，新增 `withCount`。
- #19 首页与说明页的范围断句。
- #21 问卷时间线与游戏顶栏的 visa 改称 permission。
- 50 与 43 的发现："徒步私教班／hiking coaching"命名统一；"背包 / 镇民"斜杠两侧空格。

引擎说明：
- #1 改革栏缺席口径写成模拟假设，注明 Home Office 对现行规则只计境外整天（SRC-057、PD-054）。现行法已在 33a 改为整天。
- #7 Skilled Worker 居留标题按 SW 21.2 写"定居的连续合格居留"。
- #8 子女可申请定居写明主语。
- #24 家属"同时获批"说明。
- #20 Life in the UK 未填写、"10-year or 20-year"。
- #18 未填写收入年数单复数。
- #23 福利名：Income-based Jobseeker’s Allowance、Carer Support Payment。

游戏文本：
- #15 父母来英小住、与 Jamie 的视角、回执压在钥匙上、回家找原文。
- #16 第二人称动词词尾，并补回长椅和金粉洒落。
- #17 Lina 台词句首大写。
- #18 收成、抛竿、钓鱼、季度、出国月数单复数。
- #22 CoS 首次写全称，HR 分配后发参考号。
- #25 "还差什么"写明是你需要满足的条件；B2 证明与成就说明。

所有政策含义的改写都对照了存档原文：
- `policy-sources/2026-08-03-immigration-rules-appendix-innovator-founder.html` INNF 17.1(f)(vii)
- `policy-sources/2026-10-08-immigration-rules-appendix-private-life.html` PL 3.1、4.1、5.1
- `policy-sources/2026-11-12-cp1707-government-response-accessible.html` 第 1 章犯罪记录

**审核 `review34-1` 的修正**：
1. Private Life 成人选项补"申请时已满 18 岁""在英国""若被要求离开英国"（PL 5.1）。
2. Skilled Worker、Global Talent 伴侣与 BN(O) 成年受养亲属的结果写明申请人；中文子女结果补"子女可申请定居"。
3. 诺拉转签成功句补回 and。
4. What-if 整天数随数量变单复数；成就说明改为"最早日期前一天"。
5. 补固定英文期望的单复数测试。
6. 第二轮（`review34-2`）：英文 Private Life 成人选项补 on the date of application；成就中文改为"正好在最早可申请日期的前一天"。

## 2. 怎么验证的

| 命令 | 结果 |
|---|---|
| `pnpm lint && pnpm typecheck && pnpm test && pnpm build` | 通过：engine 2,696、game 1,334、web 545 |
| `pnpm --filter e2e e2e` | 38 项通过；英文顶栏断言改为 `Permission: N month(s) left` |
| 引擎快照 | `bilingual.test.ts.snap` 只有 Skilled Worker 居留标题变化；`docs/review/adviser-packet.md` 由黄金案例测试重新生成，只有措辞变化 |

## 3. 没做或没验证的

- 中文只在含义需要同步时修改（结论说明、Innovator Founder、Private Life、错误页、提示），其余中文未动。
- Skilled Worker 随行伴侣的居留标题（SW 39.1）未改，A8 只指出主申请人标题。
- 福利下拉的其余官方名称保持 GOV.UK 汇总页原样。
- 未在浏览器逐页查看英文界面，靠测试与快照覆盖。

## 4. 发现与建议

- `withCount` 只处理英文 `s` 结尾，若以后出现不规则复数需另写。
- 签证中心等地点在部分行动来不及、部分仍可做时，不显示"来不及在关门前做完"（例如诺拉已拿到 CoS、19:01 后只能核对不能转签）。现有文案表示"都做不完"，要提示需另写文案（`review34-2` 风险）。
