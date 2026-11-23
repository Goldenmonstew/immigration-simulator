# 任务 80 · 国家模块接口与英国接入

## 1. 做了什么

建议 Fable 分两次提交。第 470 项提供引擎契约，第 471 项把网页端实现和依赖它的调用方一起切换。

| PROGRESS | 建议 commit message | 本组文件 |
|---|---|---|
| 470 | `Refactor: 按国家登记政策参数并统一评估结果` | `packages/policy-data/src/{types,index,parameters/index}.ts`、`packages/engine/src/{types,index,country-result}.ts`、`packages/engine/test/country-result.test.ts`、`PROGRESS.md` 第 470 项 |
| 471 | `Refactor: 将英国问卷、结果、对比、分享与政策页接入国家模块` | `apps/web/lib/{country-module,uk-module,uk-draft,uk-policy,uk-whatif,gap-summary,mock-results,policy,questionnaire,share,site-countries,storage,whatif}.ts`、`apps/web/components/{gap-summary,policy-page,policy-status,result-page,result-view,saved-scenarios,share-link,whatif-lab}.tsx`、`apps/web/app/uk/{home-content,simulate/form-kit,result/result-content,whatif/page,whatif/controls,policy/page,game/ending}.tsx`、`apps/web/i18n/{zh-CN,en}.ts`、本次 `apps/web/test/` 改动、本报告、`PROGRESS.md` 第 471 项 |

第 471 项的新增测试文件为 `test/{country-scenarios.test.ts,country-views.test.tsx,uk-result-views.tsx,uk-scenarios.ts,uk-whatif.tsx}`。原有网页测试仅调整导入，覆盖首页、关于页、结果、问卷、对比、分享、方案、语言、移动导航及游戏结局。

两组提交均使用 `Co-Authored-By: Codex gpt-6.2-astra <noreply@openai.com>`。

英国沿用两个规则集 ID、`/uk/result#s=…`、`uk-immigration-draft-v1` 和 `uk-immigration-scenarios-v1`。新分享串封装为 `{ country, v, draft }`。英国页同时接受旧裸草稿，国家和版本不匹配的信封会被拒绝。结果缓存、离线内存草稿和跳到对比页的焦点也按国家隔离。英国政策页继续列出原有的完整来源清单，各国模块可以提供自己的来源子集。

`CountryResult` 按列、路径、条件保留评估数据。英国适配器保留路径选择依据、较短路径未采用的原因、条件满期日、重新评估日期、来源、假设与筛查中止原因。两处游戏调用继续使用原评估列入口，游戏代码只调整结局页的分享函数调用及其导入。

## 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。类型检查包含 e2e 的 `tsc --noEmit`。5,239 项测试通过，既有文案导出测试因未设置 `EXPORT_WORDING=1` 跳过 1 项。构建导出 27 个静态页面。
- 新增 15 项测试。四组既有英国输入覆盖 Skilled Worker、public funds、带主申请人的家属与受监管复核，各跑中英文，逐项对照原引擎结果的字段、条件状态及顺序。网页端以独立构造的旧串和已有英国存储键检验兼容，用合成国家模块检验信封往返、数据与焦点隔离、多列多路径对比、结果和政策页所用的来源。
- 读取 `apps/web/out` 和任务 78 的导出，逐字比较 `/uk`、`/uk/simulate`、`/uk/result`、`/uk/whatif`、`/uk/policy` 的静态 `<main>`，5 页一致。结果页与对比页的静态导出是加载画面，载入评估后的内容由上述用例及原有英国组件测试覆盖。

## 3. 没做或没验证的

十国页面和政策规则均未改动。按 brief 保留工作树供 Fable 提交，尚未运行浏览器 Playwright、视觉验收或部署。

## 4. 发现与建议

后续每国可参考 `apps/web/lib/country-module.ts` 的接口和 `uk-module.ts` 的实现。

1. 在 `RULE_SET_IDS_BY_COUNTRY` 和 `PARAMETERS_BY_COUNTRY` 登记国家与带国家前缀的规则集 ID。网页模块使用站点注册表的国家 ID，声明草稿 `version`，实现 `createDraft()`、`validateStep(draft)` 和 `decodeDraft(value)`。分享层解开信封后再调用该国解码器。
2. 实现 `run(draft, locale)` 返回 `CountryResult`。为列、路径和条件分配语言切换及对比前后都稳定的 ID。保留原路径摘要、日期、未检查条件、假设和待定细节；条件的 `met` 为 true、false、缺失时分别对应 `MET`、`NOT_MET`、`UNKNOWN`。
3. 对比模块提供 `focusControls`、`focusForRule(id)`、`initial(draft, target?)`、`apply(draft, knobs)`、`validate(afterDraft, knobs)` 和 `Controls` 组件。政策页提供 `ruleSets`、`displayedRuleSets`、`parameters`、`rules`、`changelog`、`sourceUrls`。将模块传给共用的 `ResultPage`、`WhatIfPageContent`、`PolicyPage`；分享和方案存储随模块选取对应国家。
4. 本工作树基线为 `838d0c2`。任务 78 后续提交 `8077e70` 修复旧英国分享链接首次离线访问，Fable 合并时请保留该提交。

## 审核修正（review80-1）

### 1. 做了什么

建议一次提交 `Fix: 恢复英国 What-if 筛查中止时的两栏提示并隔离国家状态`。

- `apps/web/components/whatif-lab.tsx` 保留调整前的两个栏标题。调整后的评估带有 `shortCircuit` 且没有返回任何列时，每栏显示“此规则集暂无评估结果。”。正常返回的列与路径继续按 ID 对齐，保留新增或移除的路径。
- `apps/web/components/whatif-lab.tsx` 和 `apps/web/components/saved-scenarios.tsx` 按国家 ID 重新挂载读取存储的组件。切换国家后，What-if 页从本国草稿初始化控件，已保存方案列表从本国存储生成摘要。
- `apps/web/test/country-views.test.tsx` 新增英国日期控件回归，并扩展通用模块用例覆盖路径新增、移除及重排。工作记录见 `PROGRESS.md` 第 472 项及本报告。

### 2. 怎么验证的

- `pnpm --filter web test test/country-views.test.tsx` 在修正前复现“可能不符合条件 → —”。修正后 5 项通过。英国用例先验证 2026-11-23 的两栏结论，再通过日期控件预填 2024-11-23，逐栏检查提示并确认结论行消失。
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。5,240 项测试通过；既有文案导出测试按 `EXPORT_WORDING` 条件跳过 1 项。构建生成 27 个静态页面。

### 3. 没做或没验证的

按要求保留未提交的改动。沙箱阻止本机 Chromium 启动，内置浏览器连接也不可用，本轮未取得浏览器截图。

### 4. 发现与建议

`packages/engine/src/evaluate.ts` 的 `latestAsOf` 从英国 `PARAMETERS` 读取日期，缺少匹配参数时会回退到英国 `RULE_SET_IDS`。其他国家应通过各自的 `run(draft, locale)` 返回本国参数的 `policyAsOf`，不要复用英国的 `evaluate`。
