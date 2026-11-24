# 任务 100 报告：德国完整版页面

实现者：Gemini 4 Argon（agy）写出模块、页面与测试初稿，因模型额度中断未提交；Claude Opus 5.5（Fable）接手修正、补完并在浏览器里跑通 e2e。

## 1. 做了什么

| commit | 内容 |
|---|---|
| Feat: 接入德国完整版问卷、结果、对比与政策页 | `apps/web/lib/germany-{draft,fields,module,policy,policy-rules,whatif}.ts`：国家模块（`createDraft`、`validateStep`、`decodeDraft`、`run` 调用 `evaluateGermanyFull`、`whatif`、`policy`）。`/germany` 首页与 `/germany/{simulate,result,whatif,policy}` 四页；旧的只算时间页面 `apps/web/lib/germany.ts` 删除，入口由新页面接管。中英文文案在 `apps/web/i18n/countries/germany{,-form,-module}.ts`，集合入口卡片 `hub.de.*` 改为完整版范围。政策页标题按国家通用（与任务 93 相同的 `policy-page.tsx` 改动），德国为"德国政策依据"。 |
| Test: 德国完整版页面单测与双语 e2e | `apps/web/test/germany.test.tsx` 8 项：首页链接、离线清单与 sitemap、草稿往返与旧草稿迁移、分步校验、`run` 的满足／未来日期／待确认三类结果、对比旋钮、政策页只列德国来源、问卷各步渲染。Claude 修正了初稿：样例缺技术人员资格两项、入籍路径状态写错、对比渲染断言按 HTML 结构改写。 |
| Fix: 德国逐份文书出境记录可确认为无 | 逐份文书（§ 51）下的出境记录未填时没有"确认无此项记录"按钮，用户无法表达"无出境"，文书存续条件只能停在待确认。 |
| Test: 按真实字段重写德国 e2e | 初稿用例未在浏览器跑过，字段 id 和首页标题都对不上；按单测样例逐项填写后两条用例通过。 |

### 问卷步骤与字段

| 步 | 标题 | 字段 |
|---|---|---|
| 0 | 日期与评估路径 | 模拟日期、出生日期、首次入境（按所选路径需要）；路径多选，分定居、入籍、自由流动三组（R01–R18）。 |
| 1 | 居留许可、出境记录与文书存续 | 居留许可记录（类别、起止、续签）；出境记录；逐份文书存续核查（§ 51：文书类别、有效期或"已确认覆盖模拟日"、§ 81 续期、其他失效事由、长期居留例外、配偶、年龄、生计、驱逐利益、签证等，以及每份文书下的出境记录）。 |
| 2 | 定居通用条件 | 四个折叠段：身份与程序（身份、国籍、护照、行为能力、证明与到场、入境、安全、登记地址、过渡规则）；生计（是否确认、福利、医疗豁免、2026 年家庭预算明细、医保类别）；养老与就业（本人与配偶缴费月数、照护折算、教育、就业与职业许可）；语言与住房（德语证书、整合课程、豁免、社会知识与分数、住房面积与质量）。 |
| 3 | 所选定居与自由流动路径专用条件 | 按所选路径显示：R02 技术人员、R03 蓝卡（逐段就业月份与工资）、R04–R06、R08–R18 各自的专用字段。 |
| 4 | 入籍条件 | 身份、生计、语言与品行三段，以及按入籍路径的专用字段（声明、刑事记录、考试成绩等）。 |
| 5 | 申请与考试费用 | 申请或撤回阶段、证件类型、年龄、减免与已付款、考试渠道。 |

只有规则允许留空的项可以留空；留空送出"未填"，结果里显示为待确认。

### 对比旋钮

| 焦点 | 控件 | 作用 |
|---|---|---|
| `date` | `de-whatif-date` | 模拟／拟递交日期，关联各路径的时间条件 |
| `trips` | `de-whatif-trips` | 假设没有出境记录 |
| `german` | `de-whatif-german` | 已证明的德语等级 |
| `knowledge` | `de-whatif-knowledge` | 社会知识考试分数 |
| `contributions` | `de-whatif-contributions` | 本人养老缴费月数 |
| `blueCardMonths` | `de-whatif-blue-card-months` | 蓝卡就业月数 |
| `salary` | `de-whatif-salary` | 蓝卡年薪 |
| `livelihood` | `de-whatif-livelihood` | 生计是否已确认 |

结果页条件的"去 What-if 试试"按条件 id 定位到对应旋钮。

### 旧链接的处理

- `/germany` 地址保留，由完整版首页接管。
- 旧的只算时间草稿（含 `settlementRoute` / `naturalisationRoute` 的无版本对象）由 `migrateLegacyGermanyDraft` 迁移成 `version: 1` 的新草稿。
- 分享信封为 `{country: "de", v: 1, draft}`，地址 `/germany/result#s=…`。
- 旧评估函数 `evaluateGermany` 保留在引擎中不动。

## 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。engine 6,006 项通过、1 项跳过；game 1,348 项通过；web 835 项通过。
- `pnpm --filter e2e exec playwright test tests/germany.spec.ts --project=desktop`：2 项通过。覆盖中文问卷到结果页（一般定居许可最早 2027-05-23、一般入籍未满足）、保存方案后刷新仍在、分享链接在新上下文还原同一结果、从条件跳到对比页改日期后显示 2027-05-23→2027-06-01；英文手机宽度无横向滚动、政策页只列德国来源。

## 3. 没做或没验证的

- 没改规则语义和参数，没改英国和其他国家页面。
- 问卷是否覆盖 `evaluateGermanyFull` 的全部输入，由单测的样例与 Gemini 审核核对，没有逐字段做穷举对照。

## 4. 发现与建议

- 结果页"未知／未定事项"里，几项费用条件（处理费、适用费率、考试费）在没填费用步骤时都显示为待确认，信息量偏多；可以考虑费用步骤留空时合并成一条提示。
