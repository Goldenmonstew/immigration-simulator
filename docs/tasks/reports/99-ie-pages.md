# 任务 99 · 爱尔兰完整版页面

实现者：Claude Opus 5.5（Claude Code 子 agent）。

## 1. 做了什么（按 commit 列）

| PROGRESS | Commit | 文件 |
|---|---|---|
| 693 | `Refactor: 政策页标题与参数千分位按国家通用` | `apps/web/components/policy-page.tsx`（与 `fable/93-au-pages` 同名提交逐字相同，非英国国家读 `<国家>.policy.pageTitle`，参数千分位对非英国国家开启） |
| 694 | `Feat: 引擎导出爱尔兰完整版条件表与路径名称` | `packages/engine/src/{index.ts,ireland-full/{index,conditions}.ts}`：只新增导出 `IRELAND_CONDITION_IDS`、`irelandCondition`、`IRELAND_FULL_PATHWAY_TITLES`，规则语义与参数不变 |
| 695 | `Feat: 接入爱尔兰完整版问卷、结果、对比与政策页` | `apps/web/lib/ireland-{fields,draft,module,policy,whatif}.ts`；`apps/web/app/ireland/{ireland-content.tsx,simulate/,result/,whatif/,policy/}`；`apps/web/i18n/countries/ireland{,-form}.ts`（`hub.ie.*` 从 `i18n/{zh-CN,en}.ts` 移入）；`apps/web/lib/site-countries.ts` 登记五页；删除 `apps/web/lib/ireland.ts`；重写 `apps/web/test/ireland.test.tsx` |
| 696 | `Test: 爱尔兰双语 e2e 与离线用例改用新问卷` | `apps/e2e/tests/{ireland,site}.spec.ts` |
| 697 | `Docs: 任务 99 爱尔兰完整版页面报告` | 本报告、`PROGRESS.md` |

### 国家模块

- 问卷字段由 `lib/ireland-fields.ts` 一处描述：记录的键就是引擎请求的属性名，文案键为 `ie.field.<label>`、`ie.hint.<hint>`、`ie.option.<label>.<值>`。每个分组用 `Fields<引擎类型>` 做编译期检查，缺一个属性 `tsc` 就报错，因此问卷覆盖 `evaluateIrelandFull` 读取的全部输入（唯一例外见第 4 节）。
- 草稿即引擎请求加 `version/step/completed`，存储键 `ie-immigration-draft-v1`、`ie-immigration-scenarios-v1`，分享 `/ireland/result#s=…`，信封 `{country:"ie", v:1, draft}`。
- 三态：是／否／不清楚（留空送 `undefined`，结果显示待确认）。名单类（许可、出境、居住时段、各类 periods、活动、出境、房间、证明日期、税年收入、多选）区分「未回答」（`undefined`）与「确认没有」（`[]`）；删除最后一行回到未回答。许可与出境是必答名单，必须添加记录或点「确认没有」。
- `activeAnswers` 只保留所选路径用到的答案（例如未选配偶入籍时去掉 `marriedOn` 与 `citizenship.spouse`，EU 路径去掉 WA 适用范围），评估、分享和对比都用它。
- `run`：调用 `evaluateIrelandFull`，路径按固定顺序评估（与勾选顺序无关）；条件说明与标题相同时不再重复：7 条时间条件改用政策页的短标题、原整句作说明，其他条件的说明改为「按所填资料满足／不满足／还缺资料」；`FUTURE` 路径的摘要追加「推算日期，届时确认雇主信、IRP 等仍有效并按实际递交日重算」（规则报告给任务 99 的交接）。

### 问卷步骤与每步字段

按所选路径显示步骤；第 2–7 步的分组放在可折叠小节里。

| 步骤 | 显示条件 | 字段 |
|---|---|---|
| 1. 日期与评估路径 | 总是 | 模拟（递交）日期*、出生日期、出生地、模拟日所在地；16 条路径多选（入籍 7、Stamp／LTR 7、EU／WA 2）* |
| 2. 许可、出入境与登记 | 总是 | 居留许可名单（类型*、起*、止）与出境名单（离*、返*），仅非 EU／WA 路径显示且必答；IRP 登记：登记义务、首次或续期、清单材料、IRP 到期日、有效许可、续期待决、住址、护照、登记日、费用豁免、费用 |
| 3. 入籍条件与材料 | 选了入籍路径 | 配偶入籍日期（s15A）；资格与品格（既有国籍、未满龄婚姻、刑事记录与披露、e-vetting、继续居住地、效忠声明）；身份与居住证明（身份评分证件多选、护照过期日、替代证明、出生证明、表格见证、推荐人数、逐年 150 分证明与宣誓书、实际居住时段、无 IRP 的已核实居住）；申请费用与决定（申请费、批准、发证费、证书日期、减费条件、补件、地址更新）；按路径另显示配偶／民事伴侣、未成年人、Irish associations（四类关联证据）、保护身份（类型、认定日、身份材料、豁免）、境外公共服务 |
| 4. 就业类 Stamp 4 升级 | 选了 21／57 个月路径 | 开始工作日期；现有许可与升级材料（许可类型、对应 Stamp、在境内受雇、护照／IRP／许可、工资单与 Revenue、雇主信日期、记录一致、守规、品格、撤销、ISD 批准、Hosting Agreement、医生许可）；可选的新办／续签就业许可（期限、续签、费用、类别、职业、学历、雇主、EEA 雇员比例与豁免、毕业 NFQ 与日期、邀约起止、劳动力测试、ICT 调派、工时、年薪时薪、工资法、公共薪资协议） |
| 5. 家庭居留 | 选了独立 Stamp 4 或爱尔兰公民伴侣 Stamp 4 | 关系与担保人；现有家庭许可与关系变化（下次续期日、依亲时段、分居／去世／家暴）；申请渠道与登记阶段（含返爱当天的入境或转换依据、境内配偶入口）；担保人收入与福利（各税年税前收入、净收入、子女数、福利年数、储蓄、过往担保）；材料、品格、签证与保险（含无犯罪证明日期）；住房（类型、各房间面积层高人数、卧室、租住材料） |
| 6. Stamp 5 与 LTR | 选了 Stamp 5 或 LTR | Stamp 5：非 EEA、审理期间许可、守规、品格、公帑负担、就业努力、材料、银行流水、出境例外与最长年度出境、获批、护照到期、随护照续期；LTR：逐段登记许可及依据、医学委员会注册、就业状态、守规与审查、续期许可、品格、负担、家属（主申请人与家属时段）、维持与续期、批准信与缴费 |
| 7. EU Treaty Rights 与 Withdrawal Agreement | 选了 EU 或 WA 路径 | 两条路径各自作答：身份与家庭关系；居住活动（每段依据及资金、CSI、学籍、入境日、失业登记等）、出境及原因、取得方式、提前取得、保留权利；WA 另有适用范围（含过渡截止时刻）；证件、通知、公共审查、健康检查、取得后长期离境 |

标星号为必填；分组内的星号只在开始填写该组后才必填。

### 对比旋钮

| 焦点 | 控件 id | 作用 | 结果页条件跳转 |
|---|---|---|---|
| `date` | `ie-whatif-date` | 模拟（递交）日期 | `IE-NAT-CONTINUOUS`、`IE-NAT-PRIOR`、`IE-SPOUSE-MARRIAGE`、`IE-WCATT-TIME`、`IE-FAMILY-LEGACY-TIME`、`IE-B12`、`IE-C01`、`IE-D03`、`IE-E02` |
| `trips` | `ie-whatif-trips` | 假设没有出境记录 | `IE-NAT-ABSENCES` |
| `employment` | `ie-whatif-employment` | 开始凭就业许可工作的日期（选了就业路径） | `IE-STAMP4-WORK-TIME` |
| `irp` | `ie-whatif-irp` | 现有 IRP 卡到期日 | `IE-IRP-RENEWAL-WINDOW` |
| `vetting` | `ie-whatif-vetting` | Garda e-vetting 状态（选了入籍路径） | `IE-A03` |
| `income` | `ie-whatif-income` | 担保人最近一个税年税前收入（选了家庭路径） | `IE-B17` |

旋钮只改草稿副本，用于对比和新分享，不改问卷基线。

### 政策页

16 条路径（标题取自引擎）、86 条条件（7 条时间条件加引擎条件表全部 79 条，各带 SRC 定位与登记的 PD）、`ireland2026_11` 与 `irelandFull2026_11` 的参数（嵌套组按 `naturalisation.age` 之类的点路径列出）、4 条变更（2026-06-12 家庭团聚现行版、2025-11-26 修订版、2025-09-05 IRP 登记费、2023-07-31 境内出生未成年人居住要求）。来源清单由 `withPolicySources` 按本国规则集、条件、参数和变更实际引用的 SRC 生成，共 32 项：SRC-091–098、380–394、398–402、404–406、409；任务 89 登记的 SRC-395、397、407、408 未被爱尔兰规则引用，不列；不含英国和日本来源。时间条件的来源与旧时间引擎在结果里给出的定位一致（含 SRC-094 s18(h)）。

### 旧链接与旧页面

- 原 `/ireland` 单页只用 React 状态，没有本地存储，也不生成分享链接，因此没有旧草稿或旧分享需要迁移。`/ireland` 地址保留，由新首页接管（开始模拟、政策依据、本机保存的方案）。
- 旧 `apps/web/lib/ireland.ts` 网页不再使用，已删除；引擎里的 `evaluateIreland` 保持不动，完整版仍用它计时。
- 离线清单与 sitemap 由注册表生成，登记 `ie: calculatorPages` 后五页自动进入。

## 2. 怎么验证的

- `VITEST_MAX_WORKERS=2`，`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码 0：engine 6,006 项通过、1 项既有文案导出用例默认跳过，policy-data 23 项、game 1,348 项、web 842 项、error-report 2 项通过；Next.js 导出 36 个页面／路由，`apps/web/out/offline-pages.json` 与 `sitemap.xml` 都含 `/ireland` 及四个子页，`out/ireland{,/simulate,/result,/whatif,/policy}.html` 均已生成。
- 用 `E2E_PORT=4399 node apps/e2e/serve.ts` 起本地静态服务，在内置浏览器自己开的标签页里走查（用完已关闭）：七步问卷的列表「确认没有／改回未回答」、可折叠小节、嵌套分组与 EU／WA 两套作答；375 px 宽度下把家庭步骤全部小节展开（含房间、证明日期、税年收入列表）`scrollWidth` 等于视口宽度；结果页时间条件显示短标题、路径按固定顺序；对比页从 `?focus=employment` 进入时开始工作日控件获得焦点，改为 2025-09-10 后最早日期显示 2027-02-20→2027-06-10；政策页 16 条路径、86 条条件、32 项来源（含 SRC-094）、4 条变更。
- `pnpm --filter web exec vitest run test/ireland.test.tsx`（开发中）：14 项通过。覆盖首页双语与集合入口链接；五页进入离线清单与 sitemap；全部字段、提示、选项和步骤都有中英文文案；七步都能渲染、无 `undefined`、每个校验错误 id 都对应页面上的元素；步骤校验（未选路径、名单未回答、日期顺序、无效日期、组内必填与整数）；信封往返、未回答与确认没有分开保存、跨国隔离与坏数据拒收、分享需通过全部可见步骤；未选路径的答案不进评估；`run` 的三类结果：一般入籍全部材料齐备为 `MET`（2026-11-23）、CSEP 21 个月升级为 `FUTURE` 2027-02-20 并附 IRP 到期与材料有效期说明（时间条件为短标题加整句说明）、缺资料的入籍为 `UNKNOWN` 并带 PD-320；路径按固定顺序输出；对比旋钮 `apply`：开始工作日改为 2025-09-10 后 `FUTURE` 2027-06-10、日期推到 2027-02-20 因雇主信过期变 `NOT_MET`、假设无出境、e-vetting、替换最近税年收入、校验错误与焦点映射；政策页 16 条路径、全部条件、只列爱尔兰来源，入籍与就业两份草稿下全部 16 条路径结果引用的每个 SRC（含 SRC-094）都在政策页来源清单里。
- e2e 中断言的日期、状态、标题和字段 id 都先用单测里同一份草稿的 `run` 结果和渲染出的 id 核对过（2027-02-20、2027-06-10、`IE-STAMP4-21` 标题、`#ie-permissions` 等）。
- 同时跑过 `test/{policy-page,page,japan,country-views,about-page}.test.tsx`，日本与英国页面测试不受影响。

## 3. 没做或没验证的

- 按 brief 没有运行 Playwright。`apps/e2e/tests/ireland.spec.ts` 两条用例（中文：问卷→结果路径与条件→保存方案→分享在新上下文还原→从条件跳到对比改开始工作日，日期 2027-02-20→2027-06-10；英文手机宽度：问卷→结果→对比→政策页来源与条件，逐页检查无横向滚动）和 `site.spec.ts` 的离线用例（最后打开 `/ireland/simulate` 并离线前进一步）待 Fable 运行。`a11y.spec.ts` 会自动覆盖新增的四个子页。
- 没有改规则语义和参数，没有改英国和其他国家的页面；没有推送、没有开 PR。

## 4. 发现与建议

- `IrelandFamily.grantOn` 在引擎里没有被读取（`family.ts` 只有声明），问卷不问；如本意是担保人许可的批准日，需要在规则任务里接上或删掉。
- 时间条件（`IE-NAT-*`、`IE-STAMP4-WORK-TIME` 等）在引擎里以整句作标题、说明与标题相同；页面在模块里换成短标题。若规则任务给这些条件配上短标题，页面这一层可以去掉。
- 共用组件里有几处 `country.id === 'jp'`（问卷外链编辑、结果页按片段刷新、分享按钮的完成判断），澳大利亚分支改成 `jp || au`。爱尔兰按非日本的默认行为接入，未改这些分支；十国做完后建议统一成按国家开关或全部启用。
- 离线缓存版本（`public/sw.js` 的 `CACHE_NAME`）本任务没有改。新页面在浏览时会被运行时缓存；若要老访客安装时就预缓存，十国页面合并后统一升级一次版本即可，避免各分支冲突。
- 规则报告 PD 与条件的对应关系（政策页显示的待确认编号）按任务 89 报告的「仍可能为 UNKNOWN 的条件」表手工登记在 `lib/ireland-policy.ts`；引擎若能导出每个条件的 PD 列表，可改为直接读取。

## 审核修正（review99-1）

实现者：Claude Opus 5.5（Claude Code 子 agent）。前 7 个提交是上一个 agent 做的，它因网络中断停在验收阶段。本轮逐条核对这些提交和回归测试，没有重做。核对中发现续期提示写得不准，完整验收又发现一项测试模拟被 703 弄坏，各补了一个提交；然后跑爱尔兰 e2e，最后写本节。

### 1. 做了什么（按 commit 列）

| PROGRESS | Commit | 审核项 | 修正与回归 |
|---|---|---|---|
| 698 | `8fea44a5 Fix: 爱尔兰每条路径按本路径显示的答案单独评估` | 问题 1、建议 8 | `irelandRequest(draft, id)` 逐条路径只取本路径显示的答案。`run` 逐条路径评估，再按固定顺序合并。「由获授权者代办」对 Irish associations、境外公共服务也显示，其余未成年人题只在实际读取它们的路径显示。保护身份的种类、认定、身份材料和发证费豁免对全部入籍路径显示，认定日与居住豁免只在难民路径显示。题目全部隐藏的小节不再显示。回归覆盖审核的两个输入：未成年人走 Irish associations 或境外公共服务时 A01 为 `MET`，另选未成年路径后结论不变；难民走一般入籍时 A10 为 €0、`MET`，另选 `IE-PROTECTION` 后结论不变。另用 6 份生成的整份答案逐条核对 16 条路径：去掉本路径隐藏的答案前后结果相同，单选与全选时本路径结果相同。 |
| 699 | `6b0be552 Fix: 爱尔兰首次登记或续期改在各路径步骤里选择` | 问题 2、风险 3、建议 7 | IRP 小节去掉「本次是首次登记还是续期」。就业 Stamp 4、Stamp 5、LTR、EU、WA 改在各自步骤问「本次评估的是」，留空表示新申请或升级，选项显示为「升级为 Stamp 4 的申请」「申请 Stamp 5」等。Stamp 5 和 LTR 的新申请固定送 `stage: 'first'`，「随新护照续期」和 LTR 续期答案不再把新申请改成续期；LTR 续期题并入新问题。第 1 步说明改为：一般显示为待确认，个别题目留空另有含义，以该题提示为准。第 2 步说明写明 IRP 题只核对现有许可。只选 EU／WA 时，第 2 步换用不提许可与出境记录的说明。回归：IRP 小节不再渲染 stage 题。草稿里残留的 `registration.stage: 'renewal'` 不改变升级结果。审核输入 B 仍含 `IE-WCATT-TIME`、`IE-C01`，不出现续期窗口；在本路径步骤选续期后才换成续期检查。三步都渲染对应的问题。 |
| 700 | `1c9fb8dc Fix: 爱尔兰不计入结论的检查项标为办理提示` | 问题 3、风险 1 | 爱尔兰引擎 `assessment` 的 `add`／`time` 按是否计入路径结论给每个检查项设 `kind`，计入的为 `requirement`，不计入的为 `information`。条件性计入的续期、条约检查按实际分支标注。这只是展示元数据，状态与日期不变，差距清单只列 `requirement`。`FAMILY-LEGACY-TIME` 标题加「（旧计时参考）」，说明前加「旧计时参考，不影响本路径结论。」，并去掉对比焦点映射。e-vetting 永远不改变入籍结论，所以去掉 e-vetting 对比旋钮，对比页剩 5 个旋钮；e2e 改为检查 IRP 旋钮。引擎回归：e-vetting `outstanding` 时路径仍为 `MET`，A03 为 `information`；A09–A12、`FAMILY-LEGACY-TIME` 为 `information`；C08 在首次申请时为 `information`，续期时为 `requirement`。网页回归用审核的输入：路径为 `FUTURE 2026-12-20`，`gapRules` 和渲染出的「还差什么」都不含旧计时，也没有对比入口；每个检查项都有 `kind`。 |
| 701 | `e7b2b991 Fix: 爱尔兰政策页补齐逐条件待确认编号` | 问题 4 | 按引擎实际带出的 PD 补登记：A04 的 PD-110–114、PD-323，B12 的 PD-118，B27 的 PD-117，以及 B21、B28、D08。IRP-RENEWAL-WINDOW 补 PD-321，FAMILY-RENEWAL 补 PD-329，FAMILY-FIRST-REGISTRATION 补 PD-330，配偶路径的 NAT-ABSENCES、NAT-PRIOR 补 PD-115。回归草稿包括生成答案、空资料、各路径续期、家庭续期与首次登记、配偶驻外未确认，断言结果里每个条件的每个 PD 都列在政策页的同一条件下。 |
| 702 | `3c93645c Fix: 爱尔兰多选取消到最后一项回到未回答` | 风险 2 | `toggleOption` 取消最后一个勾选时回到 `undefined`，与名单删掉最后一行一致；「确认没有」只由按钮产生。回归覆盖勾选、取消到剩一项和取消最后一项。 |
| 703 | `52e8d483 Fix: 爱尔兰问卷与结果文案按审核建议细化` | 建议 1–6 | 1：逐行日期或数字有错误时，`aria-describedby` 指向 `${id}-${i}-error`。2：`eeaStaffShare` 上限为 1，超出时提示填 0–1 的比例。3：`grossTaxYears` 提示写明 A 类须恰好填申请前的税年数，行数不符时为待确认；收入旋钮提示也写明，税年数取自参数。4：政策变更摘要和收入旋钮提示里的金额、年限从 `irelandFull2026_11`、`ireland2026_11` 插值。5：推算日期提示只对就业升级提雇主信（`ie.result.projectedWork`），其余路径用通用说法。6：选了 EU／WA 时，IRP 旋钮下加提示：永久居留卡续期已填证件到期日时按证件到期日计算，这个旋钮不起作用。回归见 `row errors, staff shares, tax years and projected dates are explained`。 |
| 704 | `7b766900 Chore: 离线缓存版本升到 2026-11-25-v6` | brief | `sw.js` 的 `CACHE_NAME` 从 main 的 `2026-11-24-v6` 升到 `2026-11-25-v6`，`about-page.test.tsx` 同步。 |
| 705 | `eaae030a Fix: 爱尔兰续期提示按路径写准留空按「是」核对的题目` | 风险 3 | 本轮对照引擎核对 699 的续期提示，发现两处不准。一是就业许可续期留空并不按「是」核对（B01、IRP-CHECKLIST 仍为待确认），提示却这样写。二是 Stamp 5、LTR、EU／WA 留空按「是」的题目各不相同，却共用一条提示。现在这三组各用一条提示，逐项列出：Stamp 5 为 IRP 有效许可、已获批、护照与 IRP 材料、遵守许可条件、就业或求职、最长出境月数；LTR 为 IRP 有效许可、护照、住址、清单材料，以及遵守许可条件、出境情况、就业或求职并在境内居住；EU／WA 为 IRP 有效许可、住址与身份变化通知、长期出境通知、公共政策与安全审查。就业续期提示删掉这一句。难民居住豁免范围的提示本来就写明留空表示两项都豁免，配合 702 后不会再有「看似未勾却当作确认没有」。回归：所列题目留空与填「是」时，路径结论和全部 `requirement` 检查项相同；就业续期留空时 B01、IRP-CHECKLIST 为 `UNKNOWN`，提示里不说按「是」。引擎没有改。 |
| 706 | `92b371f3 Test: 政策选择测试的 policy-data 模拟保留其余导出` | 建议 4 | 完整验收时发现：703 让爱尔兰文案在加载 i18n 时读取 `irelandFull2026_11`，而 `policy-selection.test.ts` 用只含 `RULE_SET_IDS`、`PARAMETERS` 的整体模拟替换 policy-data，3 项用例因此失败。模拟改为 `importOriginal` 保留其余导出，只替换规则集顺序与参数，做法与 `rule-set-columns.test.tsx` 一致。 |
| 707 | `Docs: 任务 99 审核修正报告（review99-1）` | — | 本节与 `PROGRESS.md`。 |

风险 4 涉及共用组件，按 brief 没有改，待任务 93 的共用修正合入后解决。具体包括：`page-result.ts` 分享导入覆盖本机草稿；`site-shell.tsx` 跳到主内容的链接；`PolicyPage` 缺 `country.id` 时的标题回退与年份千分位；日期标签键；按 `kind` 分组。合并后爱尔兰还要声明 `scenarioLinks`，才会用上「不覆盖本机草稿」的行为。风险 5 列出的未验证项，本轮已跑，见下一段。

本轮没有改规则语义和政策参数，也没有新增 SRC 或 PD。700 在 `packages/engine/src/ireland-full/common.ts` 加的 `kind` 只是展示元数据。

### 2. 怎么验证的

- 逐条核对：每个审核项都有对应回归，`apps/web/test/ireland.test.tsx` 与 `packages/engine/test/ireland-full.test.ts` 现在全部通过。705 先写测试，修之前失败（`stamp5Stage` 仍用共用提示，就业续期提示声称留空按「是」），修后通过。
- 完整验收：`export VITEST_MAX_WORKERS=2` 后运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`。第一次退出码 1，`policy-selection.test.ts` 有 3 项失败，原因见 706。修正后重跑，整条命令退出码 0。结果：error-report 2 项、policy-data 23 项、engine 6,007 项通过（比任务 99 初版多 1 项 `kind` 测试；1 项既有文案导出用例默认跳过）、game 1,348 项、web 851 项通过；Next.js 生成 36 个页面和路由。`out/ireland{,/simulate,/result,/whatif,/policy}.html` 都已生成，`offline-pages.json` 含爱尔兰五页，`sitemap.xml` 含 5 处爱尔兰地址，`out/sw.js` 为 `2026-11-25-v6`。
- 爱尔兰 e2e：`cd apps/e2e && E2E_PORT=4439 npx playwright test tests/ireland.spec.ts --project=desktop --reporter=line`，2 项通过。中文用例走工作签证问卷、结果、方案、分享、对比；改开始工作日后日期从 2027-02-20 变为 2027-06-10，这两个日期由单测里同一份草稿的 `run` 算出。英文用例在手机宽度下走入籍问卷、结果、对比（IRP 旋钮）、政策页，逐页检查无横向滚动。
- 另跑了审核风险 5 点名的两项：`tests/a11y.spec.ts tests/site.spec.ts -g "ireland|offline"`，爱尔兰五页 Axe 与离线用例共 6 项通过。跑完已删除 `apps/e2e/test-results`。
- 375 px 截图：用本地静态服务和 scratchpad 里的 Playwright 脚本，按草稿打开问卷第 3、5、6 步和对比页。各页 `scrollWidth` 都是 375。「本次评估的是」各题留空时分别显示「升级为 Stamp 4 的申请」「申请 Stamp 5」「申请永久居留」，选了续期的显示「已持 LTR，续期」。三组续期提示各自显示，对比页 IRP 旋钮下有 EU／WA 提示。服务用完已停。

### 3. 没做或没验证的

- 风险 4 的共用组件条目没有改，待任务 93 合入。
- 698–704 是上一个 agent 提交的，从历史看不出它是否先写了失败的测试；我只确认了每项都有回归且现在通过。
- Playwright 只跑了 desktop 项目下的爱尔兰用例，以及 a11y、离线中与爱尔兰相关的 6 项，没有跑全部 e2e 和 mobile 项目。
- Axe 只检查各页的初始状态。问卷第 3、5、6 步新加的「本次评估的是」没有在 Axe 下检查，只做了截图目测。
- 没有推送，没有开 PR。

### 4. 发现与建议

- 700 的 `kind` 加在爱尔兰引擎 `packages/engine/src/ireland-full/common.ts` 的 `assessment` 里，不在 brief 说的网页模块里。好处是 `add` 已经知道某项是否计入结论，以后新增的检查项会自动带上 `kind`。这个改动只加展示字段，状态与日期不变，但它在规则包里，请审核时确认可以接受。
- 引擎在续期时把若干留空当作「是」（`ltr.ts` 的 `?? true`、`work.ts` 的 B28、`treaty.ts` 的通知与公共审查，以及 IRP 小节留空的有效许可）。本轮按 brief 只改提示，不改引擎。若规则任务改为留空即待确认，续期提示可以删掉这几句。
- `TREATY-RESTRICTION` 在公共审查留空时显示为待确认的办理提示，同一份资料下 D07 却按「是」核对。两者口径不同，只影响展示，不影响结论；建议规则任务统一。
