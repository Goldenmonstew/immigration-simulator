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

## 合入 main 与共用选项接入

实现者：Claude Opus 5.5（Claude Code 子 agent）。对应 brief `brief-99c`：合入澳大利亚完整版页面（任务 93，#81）带来的共用修正，并接入 `scenarioLinks`、`kind`、`displayParameter`，核对 `earliestLabel` 与年份千分位。每项先在测试里写回归，确认失败后再改。

### 1. 做了什么（按 commit 列）

| PROGRESS | Commit | 对应 | 文件 |
|---|---|---|---|
| — | `d93dcbd8 Merge: 合入 main（澳大利亚完整版页面 #81）` | brief 第 1 节 | 冲突四处。`apps/web/components/policy-page.tsx` 取 main：本分支 693 的标题与千分位改动被 main 的写法取代（标题回退、按字段语义的千分位、`displayParameter`），本分支对该文件没有别的改动。`apps/web/lib/site-countries.ts` 同时登记澳大利亚与爱尔兰五页。`apps/web/public/sw.js` 与 `apps/web/test/about-page.test.tsx` 的缓存版本改为 `2026-11-25-ie`。`apps/web/i18n/{zh-CN,en}.ts`、`packages/engine/src/index.ts`、`PROGRESS.md` 自动合并，两边的登记和行都在。 |
| 708 | `00a28d15 Fix: 爱尔兰分享链接不覆盖本机草稿，跳到正文不洗掉场景片段` | 风险 4（分享覆盖本机草稿、跳到主内容、声明 `scenarioLinks`） | `apps/web/lib/ireland-module.ts`、`apps/web/components/site-shell.tsx`、`apps/web/test/ireland.test.tsx` |
| 709 | `592811ac Fix: 爱尔兰检查项按时间条件、费用预算与批准后事项分组` | 风险 4（按 `kind` 分组）、brief 第 2 节 kind | `packages/engine/src/ireland-full/common.ts`、`packages/engine/test/ireland-full.test.ts`、`apps/web/test/ireland.test.tsx` |
| 709.1 | `b0b721b9 Fix: 爱尔兰政策页按含义展示关联证据满分与子女净收入门槛` | brief 第 2 节 displayParameter、年份核对 | `apps/web/lib/ireland-policy.ts`、`apps/web/i18n/countries/ireland.ts`、`apps/web/test/ireland.test.tsx` |
| 709.2 | `Docs: 任务 99 合入 main 与共用选项接入报告` | — | 本节、`PROGRESS.md` |

PROGRESS 的 710–717 已被任务 90（德国规则）占用，所以 708、709 之后用 709.1、709.2。提交前在本分支和所有本地／远端分支的 `PROGRESS.md` 里查过，这几个号都没有重复。

原报告“审核修正（review99-1）”里标为“待任务 93 的共用修正合入后解决”的条目，逐条处理如下：

- **`page-result.ts` 分享导入覆盖本机草稿**：爱尔兰模块设 `scenarioLinks: true`（708）。本机已有草稿时打开分享链接，只显示分享的结果，`ie-immigration-draft-v1` 不变；结果页的编辑、对比链接带 `#draft=`／`#s=` 场景片段。回归：本机草稿为另一份未完成问卷时，打开工作签证草稿的分享链接，结果为 `IE-STAMP4-21` `FUTURE 2027-02-20`，存储原样不变。
- **合并后爱尔兰要声明 `scenarioLinks`**：同上。
- **`site-shell.tsx` 跳到主内容的链接**：场景路径判断加入 `/ireland/{result,simulate,whatif}`（708）。这三页的“跳到主要内容”是移焦按钮，不再是 `href="#main"`，点它不触发 `hashchange`，不会把分享场景切回本机草稿；政策页等其他页面仍是普通锚点。回归用 `usePathname` 的模拟逐页渲染 `SiteShell` 核对。
- **`PolicyPage` 缺 `country.id` 时的标题回退**：合入 main 后解决。main 的 `PolicyPage` 在没有 `country.id` 或未登记 `<国家>.policy.pageTitle` 时回退“政策依据”，`test/country-views.test.tsx` 已有用例；爱尔兰政策页仍显示“爱尔兰政策依据”／“Policy basis for Ireland”（原有用例）。
- **年份千分位**：按 main 的规则（键名以 `year`／`from`／`cohort` 结尾、1900–2100 的整数不分组）自动生效。逐项核对爱尔兰参数：年份都以字符串或日期出现（`childrenTableYear` 为 `'2026'`，`feeFrom`、`naturalisation.minor.from` 等为日期），没有落在 1900–2100 的整数年份；数值里只有天数、金额与计数（如 `priorResidenceDays` 1,460、`categoryA` 75,000），照常分组。渲染出的中英文政策页里没有 `1,9xx`／`2,0xx` 形式的数字。
- **日期标签键（`earliestLabel`）**：没有设置。爱尔兰引擎各路径的 `earliestDate` 都是最早可递交日：`MET` 时为模拟（递交）日，`FUTURE` 时取计时满足日、IRP 续期开放日、预计返爱日或下次续期日中最晚的一天，规则报告 89 也一律称“最早递交日”。共用的“最早可申请日期（推算）”／“Earliest projected application date”已经准确，main 的单键用法给整国一个标签，没有需要另标的路径。
- **按 `kind` 分组**：与 main 的新类别对齐（709）。`kind` 仍在引擎 `assessment` 里设置，只是展示元数据，路径状态与日期不变：
  - `time`：计入结论的计时检查，即 `time()` 产生的 `IE-NAT-CONTINUOUS`、`IE-NAT-PRIOR`、`IE-NAT-ABSENCES`、`IE-SPOUSE-MARRIAGE`、`IE-STAMP4-WORK-TIME`、`IE-WCATT-TIME`。政策页的时间条件另列 `FAMILY-LEGACY-TIME`，它不计入结论，标 `information`（review99-2 建议 3 更正）。
  - `budget`：不计入结论的费用，A09 入籍申请费、A10 发证费、B02 IRP 登记费、B10 就业许可费、C09 LTR 批准费、`FAMILY-ENTRY-FEE` 家庭签证或预审费。
  - `afterApproval`：不计入结论时的 B28（Stamp 5 获批后登记、护照期限与续期）、C08（LTR 获批后居住与续期）、D08（EU 永久权维持、续证及收费）。续期或失权等情形下它们计入结论，仍标 `requirement`。
  - `information`：其余不计入结论的检查，如 A03 e-vetting、A11、A12、B06、C02、C10、D02、`FAMILY-LEGACY-TIME`，以及续期时不再复核的取得条件（D01、D03、E01、E02 等）。D04、D05 在 EU 首次申请且未持有永久权时计入结论，标 `requirement`（如 `eu: { acquisition: 'retained', retention: { event: 'death' } }` 的 D05）；在 WA、已持有或续期时才是 `information`（review99-2 建议 3 更正）。
  - `requirement`：其余计入结论的检查。B12、C01、D03、E02 虽含年限，但同时核对许可类别、关系或活动依据，仍按申请条件标注。
  - 没有用 `alternative`：爱尔兰引擎没有“几项依据满足其一即可”的分列检查。可选的取得方式（如 EU 提前取得、保留权利）由问卷选定后只评估所选的一项，Irish associations 的四类证据在 A19 一项里合算。
  - “还差什么”只列 `requirement` 与 `time`。回归：入籍草稿未备申请费时路径仍为 `MET`，A09 标为费用预算且不进缺口；结果页显示“费用预算”“时间条件”“申请条件”“办理提示”；工作签证草稿里未满足的受雇时间仍在缺口。
- **政策页嵌套参数**：按 main 的约定（与澳大利亚、美国分支一致），只把位置含义的裸数组改为带列名的表格，对象里的其他字段名与参数名一样按代码标识显示（709.1）：
  - `naturalisation.association.maxByCategory` `[50, 60, 60, 60]` 显示为“类别／满分”：经历关联 50、家庭关联 60、文化关联 60、在境内立足 60。类别名与顺序取自 SRC-400 December 2025 指引 Table 1（p3），与引擎 A19 的计分顺序一致。
  - `family.income.categoryCWithChildren` 显示为“子女数／最低年净收入（2026）”：1 至 7 名与 8+，金额带 €。依据 SRC-386 Financial Thresholds 的 Table 1（“8+ Children”）；年份取自参数 `childrenTableYear`，引擎对 8 名以上子女也取最后一档。
  - 爱尔兰参数里没有行数组，因此没有“表头是原始键”的行表。

### 2. 怎么验证的

- **先失败后通过**：三项修正都先写回归。708：本机草稿在打开分享链接后被覆盖（存储断言失败）；只设 `scenarioLinks` 后，`/ireland/result` 上仍渲染 `href="#main"`（失败）；加上场景路径后通过。709：引擎用例在 `IE-NAT-CONTINUOUS` 期望 `time`、实际 `requirement` 处失败，网页用例在 A09 期望 `budget`、实际 `information` 处失败；改后通过。709.1：政策页仍含裸列表 `50、60、60、60`（失败），改后中英文的表头、类别顺序、€ 金额与 8+ 档都通过。
- **完整验收**：`(export VITEST_MAX_WORKERS=2; pnpm lint && pnpm typecheck && pnpm test && pnpm build)`，日志末行 `GATE EXIT 0`。error-report 2 项、policy-data 23 项、engine 6,007 项通过（1 项按开关跳过）、game 1,348 项、web 879 项（46 个文件）通过；Next.js 导出成功，`out/ireland{,/simulate,/result,/whatif,/policy}.html` 都在，`out/sw.js` 为 `2026-11-25-ie`，`offline-pages.json` 与 `sitemap.xml` 含爱尔兰五页。
- **浏览器 e2e**：先确认 4458 端口空闲，再运行 `cd apps/e2e && E2E_PORT=4458 npx playwright test tests/ireland.spec.ts tests/australia.spec.ts tests/japan.spec.ts tests/site.spec.ts --project=desktop --reporter=line`，21 项全部通过（退出码 0）。跑完已删除 `apps/e2e/test-results`。
- **视觉验收**：用 `E2E_PORT=4459 node apps/e2e/serve.ts` 起静态服务，在 scratchpad 里用 Playwright 脚本截图，用完已停止服务。政策页在 375 px（中文）和 1280 px（英文）下，两张新表格的表头、类别、€ 金额与 8+ 档显示正确，`scrollWidth` 等于视口宽度，参数区 `scrollWidth`／`clientWidth` 为 335／335 和 1064／1064。结果页（375 px，入籍草稿未备申请费）显示“入籍申请费 · 费用预算”，路径仍为满足，“还差什么”为空。在 `/ireland/result#draft=…` 上按“跳到主要内容”（按钮）后，网址不变，焦点移到 `main`。

### 3. 没做或没验证的

- 未 push，未开 PR。
- 没有设 `earliestLabel`，理由见上；美国分支把它放宽成按路径的键表，本分支按 brief 不改共用组件。
- 政策页对象里的字段名（如 `naturalisation.age` 的 `adult`、`work.permit.csep` 的 `annual`／`hourly`）仍按代码标识显示，金额除新表格外没有加 €；只处理了位置含义的裸数组。
- e2e 只跑了 brief 指定的四个文件、desktop 项目；mobile 项目、a11y 与其他国家的 e2e 未跑。
- 未改规则语义与政策参数，也没有新增 SRC 或 PD。709 改的是引擎里的展示分组。

### 4. 发现与建议

- `site-shell.tsx` 的 `isJapanScenario` 仍按路径逐国列出（现为日本、澳大利亚、爱尔兰；美国分支也在加）。它与模块的 `scenarioLinks` 是同一件事，十国合并后可以改为按当前国家的 `scenarioLinks` 判断，名称也可以改成通用的。
- 政策页对象字段名按代码显示，对爱尔兰这种参数全部是嵌套组的国家，中文页可读性有限（如 `naturalisation.fee` 显示为“from 2011-11-10、apply 175、adult 950…”，没有币种）。若要逐项译名与单位，建议另立任务按国家统一处理。
- 引擎的 `kind` 表（`outsideStatusKind`）按条件编号列出费用与获批后事项。以后规则任务新增不计入结论的费用检查时，需要同时登记到这张表，否则会显示为办理提示（不影响结论与缺口）。

## 审核修正（review99-2）

实现者：Claude Opus 5.5（Claude Code 子 agent）。先合入 main 上的美国完整版页面（任务 96，#86），再按 review99-2 修正。问题 1、2 与两条建议都先写回归，确认失败后再改。

### 1. 做了什么（按 commit 列）

| PROGRESS | Commit | 审核项 | 修正与回归 |
|---|---|---|---|
| — | `dade1492 Merge: 合入 main（美国完整版页面 #86）` | brief 第 1 步 | 冲突三处。`site-shell.tsx` 用 main 的写法，国家名单取两边并集：`['jp', 'au', 'us', 'ie']`。`public/sw.js` 与 `test/about-page.test.tsx` 的缓存版本改为 `2026-11-25-ie2`。`site-countries.ts`、`i18n/{zh-CN,en}.ts`、`PROGRESS.md` 自动合并，结果是两边的并集：美国与爱尔兰各自登记五页；`hub.us.*` 由 main 移到 `countries/united-states.ts`，`hub.ie.*` 仍在 `countries/ireland.ts`。共用组件（`gap-summary`、`whatif-lab`、`country-module` 的 `earliestLabelFor`）没有冲突，直接用 main 的版本。爱尔兰仍不设 `earliestLabel`，理由见上一节。 |
| 709.3 | `9001871d Fix: 爱尔兰家庭路径的评估阶段改在家庭步骤单独选择` | 问题 1、风险 1 | 做法与 699 对其他五组一致。家庭申请小节里的「首次登记还是续期」移出，家庭步骤最前面改问「家庭路径：本次评估的是」（`familyStage`）。留空表示「申请家庭许可或转独立 Stamp 4」，提示写明家庭许可续期时一并转独立也选这一项。「续期」选项为「现有家庭许可普通续期（不评估转独立）」，「首次登记」选项为「已获准入境，评估首次登记」。`irelandRequest` 只对两条家庭路径把它写回 `family.application.registrationStage`。引擎只给普通家庭团聚、境外 de facto 和爱尔兰公民配偶直接登记三种渠道评估首次登记，其他渠道会悄悄改评申请，所以选「首次登记」而渠道不符时，步骤报错，错误显示在这道题下面。草稿里残留的旧答案 `family.application.registrationStage` 会被裁掉。裁掉后申请分组若已没有答案，就整组去掉：原先会留下空对象 `{}`，引擎据此给转独立路径加上整套申请检查。问卷保存时本来就不存空分组。风险 1：第 5 步说明写明，只评估转独立时四个申请小节请留空，以及填写后的影响。原小节标题「申请渠道与登记阶段」改为「申请日期与渠道」。回归用审核的输入：转独立路径为 `FUTURE 2026-12-20`，含 B11、B12；残留 `registrationStage: 'renewal'` 时结果完全不变；爱尔兰公民伴侣路径同样不变。另外核对：家庭步骤先渲染 `ie-familyStage`，留空选项写明含义；选续期后标题为「现有家庭许可续期」，选首次登记加普通团聚渠道后标题为「首次登记」；渠道留空、境内配偶申请、境内 de facto 时都报 `ie.error.familyFirstChannel`。修之前，残留答案的用例失败：路径被换成续期检查。 |
| 709.4 | `122187ca Fix: 爱尔兰续期提示逐项列出留空按满足核对的题目` | 问题 2 | Stamp 5、LTR、EU／WA 的续期提示改为在冒号后用分号逐项列出，补上 Stamp 5 与 LTR 漏列的「品格（刑事记录与披露）」「公帑负担」，措辞由按「是」改为按满足。新回归从引擎读取的字段核对提示列表，取代 705 只核对已列题目的用例。做法如下。每种情形先用一份全部按满足作答的草稿（结果都是 `MET 2026-11-23`），共 11 种：Stamp 5 续办；LTR 主申与家属续期；EU、WA 续期；就业续期与首次登记；两条家庭路径各自的续期与首次登记。然后逐题遍历本路径显示的题目：换一个答案会改变结论、日期或未满足的检查项，就算引擎读取；读取且留空时结果与满足时相同，就是「留空按满足」。每个这样的题都必须在该阶段提示的列表里；列表里的每项也必须留空时与满足相同、且确实被读取。中英文提示冒号后的列表与之逐项相等。两种情形不算留空按满足：留空选项已写明含义的选择题（各阶段题、EU 取得方式）；EU／WA 的「模拟日所在地」，它留空时取证件小节的在境内答案。修之前，用例在 Stamp 5 提示列表处失败。遍历还发现一项：家庭团聚转独立的首次登记，若关系留空，按非 de facto 核对，不查共同住址。已写进家庭阶段提示，提示列表只有这一项；就业续期、就业首次登记和家庭续期都没有这类题。 |
| 709.5 | `af72271b Fix: 爱尔兰就业续期的推算日期提示与 EU 取得方式留空说明` | 建议 1、2 | 就业路径选了首次登记或续期时，`FUTURE` 摘要改为通用的推算日期提示；只有升级申请才提雇主信。「取得永久居留的方式」的留空选项改为「未选时按通常方式（连续居住期满）核对」。回归用审核的输入：现有许可续期为 `FUTURE 2027-04-07`，摘要不含雇主信；升级草稿仍含雇主信。第 7 步渲染出新的留空选项。修之前，摘要断言失败。 |
| 709.6 | `Docs: 任务 99 审核修正报告（review99-2）` | 建议 3 | 更正上一节两处表述：`time` 组与政策页时间条件的关系（政策页另列不计入结论的 `FAMILY-LEGACY-TIME`）；D05 并非总是 `information`（D04、D05 在 EU 首次申请且未持有永久权时为 `requirement`）。本节与 `PROGRESS.md`。 |

风险 2 列出的未验证项，本轮已运行：构建、两份 e2e，以及新问题在 375 px 下的布局和 Axe。见下一段。

本轮没有改引擎、规则语义或政策参数，也没有新增 SRC 或 PD。

### 2. 怎么验证的

- **先失败后通过**：先写三项新用例。家庭阶段用例：残留答案把转独立换成续期，`toEqual` 失败。提示遍历用例：Stamp 5 提示列表不符，失败。建议用例：续期摘要含雇主信，失败。修正后都通过。家庭阶段加入后，遍历用例又报出一项（转独立首次登记的家庭关系），写进提示后通过。
- **回放第一轮回归**：`apps/web/test/ireland.test.tsx` 共 28 项，全部通过。其中包括 review99-1 的用例：未成年人与难民发证费的路径独立性；残留 `registration.stage` 不改变升级；`FAMILY-LEGACY-TIME` 不进缺口；政策页 PD 覆盖，草稿改用 `familyStage` 表示家庭续期与首次登记；多选取消；逐行错误等。随机填充的「每条路径只读本路径显示的答案」用例也通过，未裁剪的对照请求同样写入家庭阶段。每次提交前，都在该提交的状态下单独运行这个文件、`tsc --noEmit` 与 `eslint`。
- **完整验收**：`(export VITEST_MAX_WORKERS=2; pnpm lint && pnpm typecheck && pnpm test && pnpm build)`，日志末行 `GATE EXIT 0`。结果：error-report 2 项、policy-data 23 项、engine 6,007 项通过（1 项按开关跳过）、game 1,348 项、web 933 项（46 个文件）通过。Next.js 生成 44 个页面和路由；`out/sw.js` 为 `2026-11-25-ie2`；`out/ireland{,/simulate,/result,/whatif,/policy}.html` 与美国五页都在。
- **e2e**：先确认 4468 端口空闲，再运行 `cd apps/e2e && E2E_PORT=4468 npx playwright test tests/ireland.spec.ts tests/united-states.spec.ts --project=desktop --reporter=line`。4 项通过，退出码 0。跑完已删除 `apps/e2e/test-results`。
- **375 px 与 Axe**：用 `E2E_PORT=4469 node apps/e2e/serve.ts` 起静态服务，在 scratchpad 里用 Playwright 脚本按草稿打开三个步骤，用完已停止服务。
  - 家庭步骤：同选两条家庭路径，选首次登记、渠道为境内配偶申请后提交。题目、提示、留空选项、渠道错误与第 5 步说明都正确显示。
  - Stamp 5／LTR 步骤：两条续期提示按分号逐项列出。
  - EU 步骤。
  - 三页的 `scrollWidth` 都是 375；在 `main` 上运行 Axe，没有违规。

### 3. 没做或没验证的

- 风险 1 的规则语义没有改。转独立 Stamp 4 何时应核对担保人收入、住房（规则报告“适用时”的条件）需要规则任务确认；页面只加了说明。
- 引擎在续期时把若干留空当作满足，这是规则任务的取舍，本轮没有改。页面只让提示与引擎逐项一致。
- 提示遍历用例的范围有限：
  - 只改动基准草稿里已作答分组内的题目（新开的分组要先填带星号的题）。家庭申请里的住房、保险、无犯罪证明等没有作答的分组没有逐题核对。
  - 两题一起留空才按满足的情形（如 LTR 的「出境情况」），只有列在提示里的才核对；遍历本身只逐题检查。
- 用户本机保存过、在家庭申请里选过「首次登记／续期」的旧草稿，这个答案会被裁掉，需要在家庭步骤重新选择。699 对 IRP 阶段题也是这样处理的。
- e2e 只跑了 brief 指定的两个文件和 desktop 项目，没有运行 `a11y.spec.ts`、`site.spec.ts` 和 mobile 项目。Axe 只用脚本检查了上面三个步骤。
- 未 push，未开 PR。

### 4. 发现与建议

- 遍历用例发现，家庭团聚转独立的首次登记里，「与担保人的关系」留空时按非 de facto 核对，不查共同住址。本轮只写进提示。若规则任务改为留空即待确认，这一项可以从提示里删掉，遍历用例会提醒。
- `pastBreachUnderReview`、`examRequested`、`extraFeeRequested`、`renewalInsuranceRequired` 这类“有才填是”的题，留空按「否」核对，同样不会显示为待确认。这与第 1 步说明里“一般显示为待确认”的说法不完全一致，但符合这类题的含义，本轮没有改。如要统一，可以在第 1 步说明里补一句，或给这些题加提示。
- `site-shell.tsx` 的场景路径名单现为四国。与上一节的建议相同：可以改为按当前国家模块的 `scenarioLinks` 判断，避免每个国家分支都要改这一行、合并时冲突。

## 审核修正（review99-3）

实现者：Claude Opus 5.5（Claude Code 子 agent）。先合入 main 上的日本人生模拟游戏（任务 111，#90），再按 review99-3 修正。这是第三次出现“一个常见操作悄悄替换了评估对象”（问卷阶段题、家庭阶段题、对比页旋钮），本轮按类别处理：把问卷每一题和对比页每个旋钮按写入的分组列表，逐项核对引擎会不会因此换评估对象；会换的一律改成不写入，或只写入不改变评估对象的字段。新回归都先写，确认失败后再改。

### 1. 做了什么（按 commit 列）

| PROGRESS | Commit | 审核项 | 修正与回归 |
|---|---|---|---|
| — | `784524c7 Merge: 合入 main（日本人生模拟游戏 #90）` | brief 第 1 步 | 冲突三处。`site-countries.ts` 每个国家一行，日本保留 main 带 `'game'` 的写法，爱尔兰仍为 `calculatorPages`。`public/sw.js` 与 `test/about-page.test.tsx` 的缓存版本改为 `2026-11-25-ie3`，比两边（`ie2`、`jpgame2`）都新。`site-shell.tsx` 自动合并，结果是 main 的写法加 `ie`：`['jp', 'au', 'us', 'ie']`。`PROGRESS.md` 自动合并，两边的行都在。 |
| 709.7 | `2925d6c2 Fix: 爱尔兰家庭路径的评估对象只由「本次评估的是」决定` | 问题 1 | 核对结果见下文“评估对象核对表”。「家庭路径：本次评估的是」新增「申请家庭团聚许可（核对担保人收入、住房与材料）」。保持默认时，家庭团聚转独立 Stamp 4 只评估转独立，家庭申请分组对这条路径不显示，也不送入引擎；同时选了爱尔兰公民伴侣时，这四节只用于该路径。选「申请家庭团聚许可」时，转独立路径即使四节一题未填也核对家庭申请。实现上，`shownField` 让 `family.application` 在没有家庭阶段时只对爱尔兰公民伴侣显示，问卷、剪枝、校验和逐路径请求都用这一个判断；问卷页的小节改为逐层检查所在分组是否显示。`irelandRequest` 在「申请家庭团聚许可」时送出申请分组（可为空），在首次登记、续期时照旧写入 `registrationStage`。对比页的收入旋钮只在核对家庭许可申请时显示：家庭阶段为默认且选了爱尔兰公民伴侣，或家庭阶段为「申请家庭团聚许可」。这时写入申请分组不会改变任何路径的评估对象，因为转独立路径读不读这个分组只由家庭阶段决定。第 5 步说明、家庭阶段提示、留空选项和收入旋钮提示同步改写。回归有两项。一是旋钮遍历：16 份草稿覆盖全部 16 条路径，包括就业升级与续期、Stamp 5 与 LTR 的申请和续期、EU／WA，家庭的默认、申请、首次登记、续期，两条家庭路径同选（有无申请答案），以及两份生成的整份答案。对每份草稿在对比页上显示的每个旋钮取两个改动值，比较改动前后每条路径的标题和检查项编号集合。修之前报出 4 处，都是收入旋钮（只选转独立、两条家庭路径同选）；修之后为空。审核输入下收入旋钮不显示，填 60000 后转独立路径结果完全相同，仍为 `FUTURE 2026-12-20`。二是问卷：转独立草稿残留 `application: { date }` 时结果不变，第 5 步不显示申请小节；两条家庭路径同选时，申请答案只让爱尔兰公民伴侣路径出现 B14；选「申请家庭团聚许可」后同一路径出现 B11、B12、B14、B17，标题不变，再填申请答案时检查项编号不变。逐路径独立性用例的对照请求也按同样的家庭阶段含义构造。 |
| 709.8 | `5bac4e22 Fix: 爱尔兰公民配偶直接登记渠道须选首次登记或续期，渠道错误展开所在小节` | 问题 1（渠道项）、建议 1、2 | 引擎对「爱尔兰公民配偶直接登记」渠道一律按首次登记核对（`isFirstFamilyRegistration`）。在默认或「申请家庭团聚许可」下选这个渠道，申请就会被换成首次登记。现在这种组合在家庭步骤报错（`ie.error.familySpouseRegistration`），请用户改选「首次登记」或「续期」，或改选渠道。评估对象因此只由「本次评估的是」决定，建议 2 说的“留空选项文字不准”也不再出现：家庭阶段提示删去“后者不改选也按首次登记核对”，改为说明该渠道只能评估首次登记或续期。建议 1：家庭阶段与渠道不配的两种错误同时挂在 `ie-familyStage` 和 `ie-family-application-channel` 上，「申请日期与渠道」一节随之展开。只选转独立且家庭阶段为默认时，渠道题不显示，也不校验。回归：三种不能首次登记的渠道都在两处报错；渲染第 5 步时该小节带 `open`；直接登记渠道在默认（爱尔兰公民伴侣）和「申请家庭团聚许可」（转独立）下报错，首次登记、续期下不报，只选转独立且为默认时也不报。 |
| 709.9 | `f1ee728c Fix: 爱尔兰留空按「否」核对的是非题加提示并纳入遍历回归` | 风险 1 | 先扩展 review99-2 的提示遍历回归，再改提示。新增一类检查：本路径读取的是非题，留空与填「否」结果相同、与填「是」不同，就是“留空按否”；这类题必须列在阶段提示里，或在本题提示里写明“未填时按「否」核对”。修之前，在 11 种阶段情形中报出 5 题：家庭续期与首次登记的「担保人是爱尔兰公民」（即风险 1）和「许可附有续期保险条件」，LTR 续期的「有违反条件正在审查」，EU／WA 续期的「要求健康检查」「要求额外费用」。修之后，「担保人是爱尔兰公民」的提示写明：包括已入籍的选「是」；留空按「否」时，家庭续期与首次登记可能少查共同住址或保险。其余四题共用一条提示：只在有这种情况时选「是」，未填时按「否」核对。中英文一致。 |
| 709.10 | `Docs: 任务 99 审核修正报告（review99-3）` | — | 本节与 `PROGRESS.md`。 |

本轮没有改引擎、规则语义或政策参数，也没有新增 SRC 或 PD。

#### 评估对象核对表

问卷共 448 道作答题（含名单行内的题），每题写入下表中的一个分组。“换评估对象”指答案让引擎改评另一件事：标题改变（续期、首次登记），或在所选路径上追加另一项申请的整套条件。只改变条件结果的事实（年龄、日期、是否满足）不算换对象。

| 写入的分组 | 题数 | 引擎会不会因此换评估对象 | 处理 |
|---|---|---|---|
| 顶层：模拟日、出生日期、出生地、所在地、婚姻日期、开始工作日 | 6 | 不会，都是事实。 | 不改。 |
| 顶层：许可、出境名单 | 5 | 不会。 | 不改。 |
| 六道「本次评估的是」（就业、家庭、Stamp 5、LTR、EU、WA） | 6 | 会，这就是选择评估对象的题。引擎读 `registration.stage` 与 `family.application.registrationStage`。 | 作为唯一的选择入口。家庭阶段加「申请家庭团聚许可」（709.7）。 |
| `registration` | 10 | 不会。阶段题已移出（699），分组存在与否不改变分支。 | 不改。 |
| `citizenship` 及其子组（未成年、保护、配偶、关联、公共服务等） | 89 | 不会。入籍路径由所选路径决定，子组只影响本路径的条件结果。 | 不改。 |
| `work` 的升级材料 | 15 | 不会。 | 不改。 |
| `work.permitApplication` | 26 | 会追加就业许可的检查（B07、B08、B10）。 | 不改。这一节标题为「新办或续签就业许可（可选）」，提示写明只在同时核对新办或续签许可时填写；题目只供这一项评估，没有旋钮写入。填这一节本身就是明示的选择，不会因为别的操作被带上。 |
| `family` 关系与担保人 | 15 | 不会。其中「担保人是爱尔兰公民」留空按「否」，见 709.9。 | 加提示（709.9）。 |
| `family` 现有许可与关系变化（含 `change`） | 11 | 不会。`change` 走转独立内部的关系变化分支（B13），`nextRenewalOn` 是转独立的续期日。 | 不改。 |
| `family.application` 四节 | 61 | 会。家庭阶段为默认时，填任何一题都让转独立路径追加整套家庭申请（`family.ts` 的 `if (data.application)`）；同选爱尔兰公民伴侣时，为该路径填的答案也会带进转独立。 | 709.7：默认时对转独立不显示、不送入，改由「申请家庭团聚许可」明示选择。 |
| 其中渠道选「爱尔兰公民配偶直接登记」 | （含在上行） | 会。不选阶段也按首次登记核对。 | 709.8：须选首次登记或续期。 |
| 其中渠道选「爱尔兰公民配偶境内申请」 | （含在上行） | 不会。仍是境内配偶申请；是否走现有许可线上转换，由许可有效期和返回日决定，只增减续期窗口一项。 | 不改，见“发现与建议”。 |
| `stamp5` | 16 | 「随新护照续期」在阶段未定时会被引擎当作续办。 | 已由 699 处理：新申请固定送 `stage: 'first'`。 |
| `ltr`（含 `maintenance`、`family`） | 30 | `maintenance.renewal` 在阶段未定时会被当作续期，这道题不问，新申请固定送 `first`（699）。`maintenance` 有答案时多出不计入结论的 C08。 | 不改。 |
| `eu`／`wa` | 各 79 | 「取得永久居留的方式」选择取得方式，留空选项已写明按通常方式（709.5）；其余为事实。 | 不改。 |

| 对比页旋钮 | 写入 | 会不会换评估对象 | 处理 |
|---|---|---|---|
| 模拟（递交）日期 | 顶层 `simulationDate` | 不会。 | 不改。 |
| 假设没有出境 | 顶层 `trips: []`，只在问卷答过出境时显示 | 不会。 | 不改。 |
| 开始工作日 | 顶层 `employmentStart`，只在就业路径显示 | 不会。 | 不改。 |
| IRP 到期日 | `registration.irpExpiresOn`；没有该分组时会新建，但分组存在与否不改变分支 | 不会。 | 不改。 |
| 担保人收入 | `family.application.grossTaxYears`；原先没有申请分组时会新建，转独立路径因此追加整套家庭申请 | 会（问题 1）。 | 709.7：只在核对家庭许可申请时显示；它写入的分组不再决定转独立的评估对象。 |

### 2. 怎么验证的

- **先失败后通过**：旋钮遍历用例修之前报出收入旋钮 4 处；问卷用例在残留申请答案处失败（转独立多出 B14 等）；家庭步骤用例在渠道错误处失败（只有 `ie-familyStage` 一处）；提示遍历用例报出 5 道留空按「否」的题。修正后都通过。
- **回放前三轮回归**：`apps/web/test/ireland.test.tsx` 共 30 项（比上一轮多 2 项），全部通过。包括 review99-1 的路径独立性、未成年人与难民发证费、残留 `registration.stage`、旧计时不进缺口、政策页 PD 覆盖、多选取消、逐行错误；review99-2 的家庭阶段、续期提示遍历、就业续期摘要与 EU 取得方式。每次提交前都在该提交的状态下单独运行这个文件、`tsc --noEmit` 和改动文件的 `eslint`。
- **完整验收**：`(export VITEST_MAX_WORKERS=2; pnpm lint && pnpm typecheck && pnpm test && pnpm build)`，日志末行 `GATE EXIT 0`。结果：error-report 2 项、policy-data 23 项、engine 6,007 项通过（1 项按开关跳过）、game 1,362 项、web 948 项（47 个文件）通过。Next.js 生成 45 个页面和路由；`out/ireland{,/simulate,/result,/whatif,/policy}.html` 都在，`out/sw.js` 为 `2026-11-25-ie3`。
- **e2e**：先确认 4471 端口空闲，再运行 `cd apps/e2e && E2E_PORT=4471 npx playwright test tests/ireland.spec.ts --project=desktop --reporter=line`，2 项通过，退出码 0。跑完已删除 `apps/e2e/test-results`。
- **375 px 目测**：用 `E2E_PORT=4472 node apps/e2e/serve.ts` 起静态服务，在 scratchpad 里用 Playwright 脚本按草稿打开页面，用完已停止服务。
  - 只选转独立的家庭步骤：只有「关系与担保人」「现有家庭许可与关系变化」两节；家庭阶段有四个选项。
  - 同选两条家庭路径、渠道为直接登记、家庭阶段为默认时提交：家庭阶段题和渠道题下各显示一条错误，「申请日期与渠道」展开。
  - 对比页：只选转独立时没有收入旋钮；同选两条路径时有，填 60000 后转独立路径显示“与当前情景相同”，仍为 2026-12-20。
  - 四页的 `scrollWidth` 都是 375。

### 3. 没做或没验证的

- 旋钮遍历用 16 份草稿和每个旋钮两个改动值来验证，不能覆盖所有答案组合。“爱尔兰公民配偶境内申请且模拟日当天回国”一类组合里，日期、出境和 IRP 旋钮会让续期窗口一项出现或消失；草稿里没有这种组合，理由见“发现与建议”。
- 留空按「否」的检查只覆盖 review99-2 建立的 11 种阶段情形（续期与首次登记）。新申请里的同类题没有逐题遍历，见“发现与建议”。
- 用户本机保存过的旧草稿受影响的有两类。一是只选转独立、家庭阶段为默认、又填过申请小节的：现在只评估转独立，要核对申请须改选「申请家庭团聚许可」。二是选过「爱尔兰公民配偶直接登记」渠道而家庭阶段为默认的：会回到家庭步骤，须改选首次登记或续期。
- 375 px 下，家庭阶段下拉框的默认选项文字较长，收起时会被截断为“转独立 Stamp 4，或爱尔兰公民伴侣…”，展开后完整显示。没有改。
- `work.permitApplication` 保持原样，理由见核对表。
- 没有运行 mobile 项目、`a11y.spec.ts` 和 `site.spec.ts`，也没有在 Axe 下检查新的错误状态。
- 未 push，未开 PR。

### 4. 发现与建议

- 境内配偶申请是否走“现有许可线上转换”，由许可有效期、IRP 到期日和返回日决定（`index.ts` 的 `inStateSpouseEntry`）。因此日期、出境和 IRP 旋钮会让续期窗口一项出现或消失。这是事实变化，不是换对象，所以没有改。如果希望对比页在这种情况下给出说明，可以另开任务。
- 新申请里还有几道“有才填是”的题留空按「否」核对，没有纳入遍历，也没有加提示：`protectionRelationshipFormedAfterEntry`（留空时不加等待期，结果偏宽）、`compelledSeparation`、`verifiedSavingsMaySupplement`（留空时结果偏严）。如果要统一，可以把遍历扩展到家庭申请等新申请情形，再按结果补提示。
- 就业许可申请一节和家庭申请原先的问题一样，都是“追加另一项申请”，现在靠小节标题与提示明示。如果希望与家庭路径一致，也可以在「就业类 Stamp 4：本次评估的是」里加一项“同时核对新办或续签就业许可”，由阶段题决定是否送入。
