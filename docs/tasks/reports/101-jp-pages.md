# 任务 101 · 日本完整版页面

## 1. 做了什么（建议提交）

| 进度 | 建议 commit message | 文件 |
|---|---|---|
| 750 | `Feat: 共用分步问卷并按国家展示政策来源与评估明细` | `components/{questionnaire-shell,policy-page,result-page,result-view,gap-summary,whatif-lab}.tsx`，`lib/{policy,uk-module,gap-summary,whatif,site-countries}.ts`，`i18n/{zh-CN,en}.ts` 的公共标签，`test/{policy-page,country-views}.test.tsx`，`packages/engine/src/country-result.ts`。 |
| 751 | `Feat: 接入日本永住、帰化与再入国完整版页面` | `app/japan/japan-content.tsx` 与 `app/japan/{simulate,result,whatif,policy}/`，`lib/japan-{draft,fields,module,policy,policy-rules,whatif}.ts`，删除旧 `lib/japan.ts`，`i18n/countries/japan{,-form,-module}.ts`、日本卡片文案从公共字典移入日本字典，`app/{offline-pages.json/route.ts,sitemap.ts}`，`components/site-shell.tsx`，`public/sw.js`，`test/{japan,about-page}.test.tsx`。 |
| 752 | `Test: 验证日本双语问卷、分享与对比流程` | `apps/e2e/tests/{japan,a11y,site}.spec.ts`，本报告。 |

网页文件以上均相对 `apps/web/`。各组含 `PROGRESS.md` 对应行，尾注用 `Co-Authored-By: Codex gpt-6.2-astra <noreply@openai.com>`。

### 问卷与结果

按所选目标显示相应步骤。共同信息一次录入，同一人可选多条路径。以下名称对应问卷顺序，具体枚举、列表项及中英文标签分别在 `japan-fields.ts` 和 `japan-form.ts`。

| 步骤 | 字段 |
|---|---|
| 1. 日期与申请路径 | 模拟日、在留开始日、拟递交日、出生日期，多选永住、帰化和再入国路径。 |
| 2. 出境记录 | 每次离境日、返日、普通再入国许可及有效性、出境时在留期限、续期申请待决、出生取得路径的出境方式。 |
| 3. 永住路径条件 | 一般及国际保护的旧/新资格起点和排除期间，实际婚姻生活、出生及出生届、是否另有身份、定住或保护认定起点。高度人材及 J-Skip 分当前、历史基准日录入认定、持续情况、活动、报酬、学历经验与加分证据。地区再生、结构改革特区及对日贡献分别问计划、机构、指定活动、贡献类别与主管机关认可。 |
| 4. 在留身份、品行与公共义务 | 身份类别、原授予期间、到期、续期、过渡期与处分、経営・管理证据，亲属身份及关系、保护认定、素行和刑事记录、国益及长出境理由认定、活动、所属机构与住址申报、税、年金、医保、健康及上陆事由。 |
| 5. 永住的生计、语言与申请材料 | 申请人与世带成员收入、共财和受扶养关系、在审及认定、预计年金与资产、公共负担和人道情形，日语认定与豁免、教育及制度理解、子女就学，担保、提交人、照片及文件、特别许可、减额与一体卡费用。 |
| 6. 帰化 | 所选国籍法路径的特别事实、本国法成年年龄、配偶/亲子/收养、曾有国籍、出生无国籍、特别功劳与国会批准。共用证据包括住所/居所起点、能力、品行、生计、国籍丧失与例外、宪法条件、日语会话读写、认可及面谈、税和社保、住房医保材料、动机/宣誓、递交与翻译、官报及户籍日期。 |
| 7. 再入国与旅行证件 | 每种方式的离境及返日、在留状态/期限与续期待决、证件失效或遗失、重新上陆。普通许可另问递交条件、渠道、次数及有效期；みなし方式另问资格、护照与在留卡、实际出境表明；难民旅行证件另问认定、证件有效期及入国期限。普通许可和难民证件可填领事延期、地区和费用日期。 |

`evaluateJapanFull` 输出驱动完整评估。结果保留申请条件、审查因素、办理提示、不适用原因、费用与减额、来源定位、PD 待确认编号以及两个不同的日期。拟出境的みなし再入国不会自动记为已在出境时作出表明。

### 对比与旧入口

- 共同旋钮为拟递交日。永住支持日语认可、个人年收入和世带收入认定。帰化支持日语认可、面谈及生计认定。居住路径可假设期间没有出境，三种再入国方式均可单独改返日。结果中的相关条件可以跳到对应控件。改动用于对比和新分享，不覆盖问卷基线。
- 原 `/japan` 网址保留并显示新首页。旧单页用 React 状态保存输入，刷新即清空，也未生成分享串。新草稿和命名方案分别使用 `jp-immigration-draft-v1` 和 `jp-immigration-scenarios-v1`；分享地址为 `/japan/result#s=…`，信封为 `{country:"jp", v:1, draft}`。
- 日本政策页列出 26 条路径（永住 13、帰化 10、再入国 3）、88 个条件、47 个参数、3 条变更、33 项官方来源。英国及日本都从规则集、条件元数据、参数与变更的引用生成来源清单。日本沿用 SRC-110–119 和 SRC-440–462。原时间引擎仍由完整版复用。

## 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0。设置 `VITEST_MAX_WORKERS=2`。全仓 5,360 项通过，既有文案导出用例因未设置 `EXPORT_WORDING=1` 跳过 1 项。构建预渲染 32 个页面/路由。
- `pnpm --filter web test test/japan.test.tsx test/country-views.test.tsx test/policy-page.test.tsx test/about-page.test.tsx` 通过 33 项，其中日本专用 15 项。普通再入国窗口示例在周六评估、下周一可递交，改递交日旋钮后从 2027-04-05 变为 2027-04-06。永住配偶示例仅时间条件在未来满足，页面仍保留完整申请日期待确认。另测三态证据、误填未来出境声明、零费用、法定豁免、无效草稿与跨国分享隔离。
- 按路径对照引擎类型与问卷字段及枚举，覆盖 403 个字段位置（共享证据按使用位置计）。同类型的普通许可和难民旅行证件中，只有后者的引擎分支读取 `entryDeadline`、`entryDeadlineNotSpecified`，相应问题放在后者。以新旧指南日期运行所有路径对照政策目录，相应中英文页面均显示 26 条路径、88 个条件及 33 项来源。
- 读取 `apps/web/out/{offline-pages.json,sitemap.xml}` 比对全部 22 个路径并逐个找到导出的 HTML。向本地静态服务请求日本五页均返回 200。检查英国、日本两个导出政策页的 `data-source`，各有 33 项，交集为空。`git diff --check` 通过。
- `pnpm --filter e2e exec playwright test tests/japan.spec.ts --list` 收集 2 项。实际对本地静态构建运行同一测试文件时，macOS 在 Chromium 启动阶段返回 `bootstrap_check_in … MachPortRendezvousServer … Permission denied (1100)`。两项用例均未进入页面断言，命令退出码 1。内置浏览器宿主也不可用。

## 3. 没做或没验证的

当前工作树交给 Fable 提交、审核与上线。浏览器端的两项完整流程、375 px 横向溢出与截图仍待 Fable 在可启动 Chromium 的环境验收。保留原时间引擎与政策参数。日本没有游戏入口。

## 4. 发现与建议

基线的 `offline-pages.json` 只枚举非英国国家的首页，也没有导出 sitemap。本次在站点注册表中登记实际可访问的子页，两份清单直接使用同一组路径。sitemap 的绝对网址沿用部署文档中的 Cloudflare 主站与带仓库前缀的 GitHub Pages 镜像。

### 其他国家照做的要点

1. 从引擎请求类型列全路径、必填字段、可选证据和省略值的语义。先写本国 `lib/<country>-draft.ts`，区分未填、明确否、零、空列表和未确认。草稿携带版本、当前步骤及完成标记。解码允许恢复填了一半的问卷，生成结果前重新校验所有适用步骤。
2. `app/<slug>/simulate/page.tsx` 将模块、可见步骤和字段渲染函数交给 `QuestionnaireShell`。把日期与目标放在开头，共用历史只问一次，再按已选路径分开专用条件和共用证据。动态列表与各国字段留在本国目录。
3. 在 `lib/<country>-module.ts` 接入引擎、对比与政策。对比只修改草稿副本，映射表以引擎条件 ID 关联真实控件。政策元数据使用与结果一致的路径/条件 ID，给每项来源保留 SRC 和法条定位，调用 `withPolicySources` 生成本国来源清单。
4. 本国 `result/page.tsx`、`whatif/page.tsx`、`policy/page.tsx` 分别把模块传给 `ResultPage`、`WhatIfPageContent`、`PolicyPage`；首页复用 `SavedScenarios`。用 `countryPath` 组装链接，在 `pagesByCountry` 登记子页并更新离线缓存版本。
5. 单测固定日期，断言条件、时间节点、实际可递交日期、未知项及旋钮副本。e2e 从集合入口填写真实字段，刷新确认还原步骤，保存并回读方案，在独立浏览器上下文打开分享串，对照路径和条件。改旋钮后比对前后日期，在窄屏英文界面检查溢出，并核对政策来源链接和条件定位。
