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
