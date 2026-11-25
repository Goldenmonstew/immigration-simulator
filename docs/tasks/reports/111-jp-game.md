# 任务 111 · 日本人生模拟游戏（十国游戏试点）

## 1. 做了什么（按 commit）

| PROGRESS | commit | 内容 |
|---|---|---|
| 760 | `Refactor: 抽出国家无关的网页游戏外壳` | 英国网页游戏里与国家无关的部分移到 `apps/web/app/game-shell/`：控制器、HUD、地点菜单、事件卡、季度小结、结局、存档、日记、音效、地图加载、场景基类、Phaser 画布。各模块写成 `createX(country)` 工厂，`shell.ts` 的 `createGameShell(country)` 一次生成整套组件与存档函数。英国在 `apps/web/app/uk/game/` 保留原有文件名与导出：`shell.tsx` 放英国国家配置（评估列、签证状态、物品图标、结果页草稿、AssessmentColumns 视图、毕业生提示、改革路径标签、春节来电结果），`scene.ts` 是场景子类（聚餐、花坛、五月节、地图惊喜、篝火），其余文件重新导出英国实例。行为、存档键 `uk-immigration-life-v3:<角色>`、静音与钓鱼键、美术路径不变。 |
| 761 | `Feat: 日本人生模拟内容包与规则适配` | `packages/game/src/packs/jp/` 内容包与 `@uk-immigration/game/jp`、`jp/presentation` 入口；评估适配器把时间线交给 `evaluateJapanFull`；单测 `packages/game/test/jp-pack.test.ts`。 |
| 762 | `Feat: 接入日本人生模拟页面、地图与美术` | `/japan/game` 页面；`app/japan/game/` 的国家配置、场景子类与场景绘制、音效；港坂地图与原创横幅；美术配置加入 `banner`、`townMap`、`homeMap`；注册表 `hasGame: true`、日本首页游戏入口、离线清单与缓存版本；中英文案；网页单测 `apps/web/test/japan-game.test.tsx`。 |
| 763 | `Test: 日本人生模拟 e2e` | `apps/e2e/tests/japan-game.spec.ts`。 |
| 764 | `Docs: 任务 111 报告` | 本报告。 |

### 共用外壳的接口

国家只提供一个 `GameCountry` 配置（`app/game-shell/types.ts`）：

- `game`：内容包绑定后的引擎与列表。传模块命名空间（`import * as ukGame from '@uk-immigration/game'`），外壳一律通过 `game.xxx(...)` 调用，测试里的 `vi.spyOn(core, 'loadCharacter')` 依然生效。
- `evaluate`、`sound`（同样传命名空间）、`art`、`asset`、`storageKey`。
- 展示：`money`、`moneySymbol`、`moneyMeter`、`stats`、`ruleColumns`、`outcomeLabel`、`missingRules`、`visaStatus`、`absences`、`itemIcon`、`diaryText`。
- 评估视图：`assessment`（信息地点）、`endingAssessment`、`progressDetail` 返回节点（不是组件），这样英国结局树里仍直接有 `AssessmentColumns`，既有测试按元素类型查找照常通过。
- 可选：`placeNote`、`endingActionText`、`festivalCallResult`。
- `loadTownCanvas: () => import('./town-canvas')`，Phaser 仍按需加载。

场景基类 `TownScene<K>` 只做地图、角色、动物、灯光与天气；国家通过可选钩子（`preloadScenery`、`decorate`、`resetScenery`、`syncScenery`、`syncProps`、`placeLabel`、`blocked`、`updateScenery`、`renderScenery`）加装饰。共用文案可按 `<国家>.game.<键>` 改写（`gameKey`），日本据此把"签证""签证中心""市政厅"换成"在留期限""入管窗口""行政书士事务所"。

### 日本内容

**角色（原创）**

| ID | 名字 | 起点 | 评估路径 | 起始日期 |
|---|---|---|---|---|
| `engineer` | 陈思远 / Siyuan Chen | 2024-04-01 持「技术·人文知识·国际业务」来横滨，年收入 520 万日元 | 一般永住（`statusStart` 2024-04-01）、一般帰化 | 2026-03-01 |
| `spouse` | 安娜·佩雷拉 / Ana Pereira | 2024-06-15 与日本护士高木悠斗结婚，2025-10-01 持「日本人的配偶者等」搬来港坂，面包店打工 | 配偶永住、配偶帰化 | 2026-03-01 |

初始在留期间用参数 `longestPeriod.deemedMonths`；续签按 `longestPeriod.maximumMonths[资格]` 记录最长期间（SRC-440 別表第2）。纳税、年金、医保、品行等证据按"按时、已确认"开局，日语 B1、帰化面谈、住址申报、出境记录、年收入在游戏中变化。各有开场事件与 6 张专属事件卡。

**地点（18）**：公寓 `home`、办公楼 `work`、社区日语教室 `college`、区立图书馆 `library`、街角诊所 `gp`、居酒屋「灯笼」`pub`、喫茶店「汐见」`cafe`、商店街杂货铺 `shop`、行政书士事务所 `council`（查看评估）、区役所 `ward`、入管窗口 `visa`、法务局 `bureau`、港坂站 `station`、市民农园 `allotment`、大冈川河岸 `pond`（钓鱼）、町内会告示板 `board`、港坂神社 `green`（祭典）、河边长椅 `bench`。

**镇民（7 + 1 位家人）**：铃木芳江（町内会会长、农园老手）、高桥健司（居酒屋店主、下午钓鱼）、小林美咲（日语教室志愿老师）、阮氏兰（越南籍店员、在备考）、中村大辅（区役所窗口职员）、拉杰·梅塔（同楼的永住者工程师）、渡边翔（小学生、虾虎鱼专家）；安娜的丈夫高木悠斗只在 `spouse` 局出现。每人有工作日、周末、雨天、祭典排班，6–10 句对话（含季节、天气、心数和祭典台词）、礼物偏好与反应。

**节日（日期按惯例，不涉及政策）**：冬季节分（2 月 3 日）、春季赏樱（4 月第一个周六）、夏季商店街盆踊（8 月 8 日后的周六）、秋季神社秋祭（10 月第二个周六）。各有专属活动（撒豆、铺野餐垫、跳盆踊、扶神轿）、节日食物与结果文案。

**活动**：休息、午睡、自学日语、搬到朝南公寓/退租、上班、加班、日语课、日语水平评估、看病、居酒屋、喫茶店、买家具、请行政书士看评估、区役所申报新住址/开证明、在留期间更新、递交永住申请、法务局帰化咨询与面谈、递交帰化申请、回国探亲 1/3/6 个月、离开日本、租农园、看告示、看河、健走会、神社参拜、逛祭典；另有共用的钓鱼、种菜、做菜（6 道菜谱：芜菁味噌汤、黄油土豆、酱烤玉米、盐烤鱼定食、草莓酱、番茄黄瓜沙拉）、买东西、送礼、收信。

**日常事件（16）**：垃圾收集日、雨天换乘、交通卡余额不足、便利店打印、不在通知单、防灾训练、河岸清扫、新年参拜、年末大扫除、花粉季、梅雨、台风、确定申告、年金定期便、搬家后的住址提醒、拉杰的伴手礼；另有 4 张系统卡（评估未过、病倒、想家、账户见底）。

**规则交给引擎**：`jpRules`（`packs/jp/rules.ts`）

- `evaluate`：`evaluateJapanFull`，证据日用下一个受理日（`nextCounterFilingDay`，与问卷的递交日答案一致）。
- `progress`：`pr`、`nat` 两列取角色的永住与帰化路径；时间条件未满时显示 `FUTURE` 与时间最早日期，否则显示路径状态。
- 续签 `renewal`、语言评估 `japanese`、面谈 `interview`、搬家 `moved`、住址申报 `addressNotice`、薪资 `salary` 是日本专用效果。
- `canTravel` 要求在留期限覆盖返日，出境记为 `departure: 'deemed'`（SRC-110 第26条の2），手续费取 `fees.deemed`。
- `expired`：在留期限过了就以 `overstayed` 结束。
- 永住申请在路径为 `MET` 时开放，手续费取引擎在该递交日算出的 `jp.pr.approval-fee` 金额；帰化申请手续费取 `fees.naturalisation`。

### 地图草图

56×40 格，`public/game/japan/town.json`，全部用 `modern-city/tiles.png` 的 40 个瓦片拼成；装饰由日本场景子类绘制。

```
北  树   [公寓×2]  ‖  [办公楼]  [日语教室]  ‖   [区役所]   [法务局]
        人行道 · 红色邮筒 · 自贩机 · 路灯
════════════════════════ 东西向马路 ════════════════════════
    [杂货铺][喫茶店] ‖ [居酒屋 灯笼] [诊所] ‖ [图书馆] [行政书士]   ← 商店街：条纹遮阳篷、暖帘、幟旗、自贩机
════════════════════════ 东西向马路 ════════════════════════
    [港坂站]   ‖  [入管窗口] [神社广场：本殿/石灯笼/鸟居]  ‖  [市民农园 6 块地]
樱  樱  长椅   ‖  河岸步道 · 钓鱼点                         ‖  樱
~~~~~~~~ 大冈川（两座桥接两条南北步道，鸭子在水面游）~~~~~~~~
南岸花坛与路灯
```

公寓门在 (5,10)、出生点 (5,12)，与英国地图一致，外壳的信箱角标和出门落点无需配置。季节色：冬季灰梅色、春季樱粉、秋季红叶；夏季保留瓦片原色。祭典日在神社广场加摊位、灯笼串，并分别画野餐垫（赏樱）、木台与太鼓（盆踊）、金色神轿（秋祭）、鬼面与豆子（节分）；春天晴雨以外河面飘樱花。原创横幅 `public/game/japan/town-banner.png`：富士山、町屋、居酒屋、神社与鸟居、樱树、公寓、自贩机、红邮筒、河与红桥。

## 2. 怎么验证的

- `export VITEST_MAX_WORKERS=2` 后运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，整条命令退出码 0：error-report 2、policy-data 23、engine 6,006（既有文案导出用例按默认跳过 1 项）、game 1,356、web 846 项通过，构建生成 33 个静态页面（新增 `/japan/game`）。第一次整链在 game 包的声明构建上报 TS2883（`status` 的推断类型引用了引擎未导出的类型），补返回类型后并入第 761 项提交，再次整链通过。
- 抽外壳前后的英国网页游戏单测：拆分前基线 303 项，拆分后同一批文件（`apps/web/test/game-*` 与 `error-page`）303 项全部通过，测试文件除第 4 节说明的两处外未改。game 包原有 1,348 项不变，另加日本 8 项。
- 日本内容包单测 `packages/game/test/jp-pack.test.ts`（8 项）：两位角色的开场与起始日期 2026-03-01、首个工作日 2026-03-10；引擎列 `jp.current-law-2026-11` 与路径 `jp.pr.general`/`jp.nat.general`、`jp.pr.spouse`/`jp.nat.spouse`，工程师永住时间最早 2034-04-01、配偶 2029-06-15；续签后期限 2027-03-31 → 2032-03-31（`maximumMonths.engineer`）、剩余 72 个月；搬家后住址条件 `UNKNOWN`，到区役所申报后为 `MET`；2026-04-04 赏樱节、樱饼与到访旗标；出境一个月记为 `deemed`、季末日期 2026-06-01，存档 JSON 往返后下一季与不往返完全一致；2034-06-01 路径 `MET` 时递交永住，扣除的手续费等于引擎 `jp.pr.approval-fee` 金额（`fees.pr`），结局为 `settled`；在留期限过期以 `overstayed` 结束。
- 网页单测 `apps/web/test/japan-game.test.tsx`（6 项）：注册表与离线清单含 `/japan/game`，存档只写 `jp-immigration-life-v3:engineer`，静音写 `jp-immigration-life-muted`；结局链接 `/japan/result#s=…` 经日本模块解码为完整草稿，结果页路径与状态和游戏内一致；中英文状态栏显示日元、日语和在留期限，进度条显示「最早 2034-04-01 满足条件」，英文状态栏与进度条无中文，行政书士事务所显示日本评估列；所有物品、角色、镇民、横幅和招牌的图都存在；地图包含内容包的全部地点、镇民排班用到的全部锚点和 6 块菜地，出生点在公寓门下。
- 浏览器 e2e（本机静态构建，`E2E_PORT=4411`）：`npx playwright test tests/game.spec.ts tests/life.spec.ts tests/japan-game.spec.ts --project=desktop --reporter=line`，26 项全部通过（英国 21 项、日本 5 项）。`tests/a11y.spec.ts -g "/japan"` 6 项通过（含 `/japan/game`）；另用临时脚本对进行中的日本游戏和行政书士事务所菜单跑 axe，无严重问题（脚本未入库）。
- 视觉检查：用 Playwright 截图看过公寓、神社广场（平日与赏樱节）、河岸、市民农园、车站、商店街（居酒屋灯笼、暖帘、幟旗）、入管窗口与鸟居、河上的鸭子，并据此加了神社的日常参拜、把「出入国在留管理局窗口」缩短为「入管窗口」。内置浏览器面板处于隐藏状态，Phaser 动画被节流，所以改用无头截图。

## 3. 没做或没验证的

- 英国 e2e 的截图基线未比对：本机 Playwright 默认忽略截图（`ignoreSnapshots`），基线只在 CI 的 Linux 上生成。
- 日本没有专属立绘和行走图：两位角色和 8 位镇民借用现有 17 人的图（`jpGameArt.cast`），名字与身份都是新的，样貌与英国角色重复。日本没有专属招牌：行政书士事务所、区役所、法务局没有门牌，其余沿用通用图标。缺的素材见第 4 节。
- 没有心事件（heart scenes）、地图惊喜、成就之外的长期支线；英国内容量远大于日本，这次只做了能玩通四季与两条身份路径的规模。
- 在留期间更新：游戏不收手续费，续签窗口用游戏设定（到期前 12 个月内可办），并在活动说明里写明；仓库参数表还没有续签手续费和可提前递交的期间。
- 安娜的配偶帰化在 2026-04 起的审查运用下，引擎给出"审查运用在留年限待确认"（PD-137），所以游戏里帰化申请对她不会开放；这是规则引擎的既有结论，没有改。

## 4. 发现与建议

- `country-scenarios.test.ts` 第 135 行原本依赖联合类型推断：`draftStorage(country, first)` 里 `country` 是英国与日本模块的联合，推断出的草稿类型取决于两个模块类型谁先被创建。拆出外壳后文件加载顺序变了，HEAD 上单独检查这一测试文件也能复现同一错误。已按第 137 行的写法补 `<CountryDraft>`。
- `about-page.test.tsx` 断言的离线缓存版本随 `sw.js` 改为 `2026-11-24-v6`（新增离线页 `/japan/game`）。其他国家合并时会在这一行冲突，按最后合并的版本号处理即可。
- 共用外壳仍引用 `app/uk/game/game.module.css` 与 `town-canvas.module.css`：站点外壳和英国测试按原路径读取这两份样式，没有搬动。结局"留在日子里的小事"里的公共花坛与聚餐合照按旗标显示，日本不会触发。
- 建议在 `policy-data` 补"在留期间更新许可"手续费与受理开始时间的官方来源，游戏即可收费并改用真实窗口。
- 缺的素材：日本角色与镇民的 64×64 三表情立绘和 16px 行走图；行政书士、区役所、法务局、车站的日文招牌；乌鸦等本地动物；和风室内（榻榻米、矮桌）瓦片。

### 其他国家照做的要点

1. **文件结构**
   - 内容包：`packages/game/src/packs/<国家>/`，`index.ts` 组装 `GameContentPack` 并 `createGame` 后按英国同名导出（`newGame`、`activities` … `characters`、`places`、`npcs`、`items`、`recipes`、`festivals`、`achievements`、`characterOf`、`loadCharacter`）；`presentation.ts` 导出美术配置；`package.json` 加 `./<国家>` 与 `./<国家>/presentation`。
   - 网页：`apps/web/app/<slug>/game/` 放 `country.ts`（美术根、资源与存档键）、`sound.ts`（`createSound`，传本国镇民 ID 定音高）、`shell.tsx`（`GameCountry` 配置与 `createGameShell`）、`scene.ts`（场景子类）、`scene-art.ts`（装饰绘制）、`town-canvas.tsx`、`game-client.tsx`、`page.tsx`。
   - 注册：`lib/game-country.ts` 的 `gameArt`、`app/game-page.tsx` 的 `gameClients`、`lib/site-countries.ts` 的 `hasGame` 与 `pagesByCountry`，更新 `public/sw.js` 缓存版本；文案放 `i18n/countries/<国家>-game.ts` 并合入本国字典。
2. **内容包写法**
   - 时间线直接用本国引擎的请求类型（去掉 `simulationDate` 与 `locale`），结局时原样拼回问卷草稿，结果页就能还原同一份答案。草稿里递交日相关的答案要对上问卷的证据日（日本用下一个受理日）。
   - 适配器 `progress` 返回固定的列 ID（日本用 `pr`、`nat`，按角色取对应路径），`outcomeLabel` 能带日期。
   - 政策数字（期间、期限、手续费）从 `policy-data` 或引擎结果读取；没有参数的手续做成"游戏不收费"并写明。日期按惯例的节日写在 `calendar` 里，返回本季原始日期即可，引擎会排在可玩周末之后。
   - 地点 ID 沿用外壳约定：`home`、`visa`（在留手续）、`council`（评估信息，菜单只显示评估）、`station`（出境）、`green`（祭典与摊位，镇民用 `green-stall` 锚点）、`shop`、`pond`（钓鱼）、`allotment`（种菜）、`work`；fast-forward 日记按 `work`/`class`、`rest`、`festival` 分天。
   - 镇民排班用锚点或地点 ID，住处写 `away`；只有家人才用 `home`（会出现在玩家家里）。
3. **地图怎么拼**
   - 在 56×40 的 Tiled JSON 里放 `ground`、`decor`、`collision` 三层和 `places`、`anchors`、`plots`、`spawn`、`lamps` 五个对象层；瓦片集名为 `town`。建筑按"屋顶三行（7–9、10–12、13–15）+ 窗或遮阳篷行 + 门行"拼，门下一格放地点对象并写 `building*` 属性；水用瓦片 5（会自动加水光），窗瓦片 17/20/22 夜里自动亮灯。
   - 公寓门放在 (5,10)、出生点 (5,12)；每个地点 ID 都要有对象，镇民排班用到的锚点都要存在（日本网页单测会核对）。
   - 生成脚本、裁切和调色脚本不入仓库；季节色写在场景配置的 `landscapes` 里。
4. **e2e 怎么写**
   - 新建 `apps/e2e/tests/<国家>-game.spec.ts`，复用 `helpers.ts` 的 `dismissCards`、`walkTo`、`noHorizontalScroll`，本国的 `startGame` 写在文件里（路径和存档键前缀不同，不改英国 helper）。
   - 覆盖：静态页标题与横幅、选角色进入小镇、走到一个户外地点完成活动（读本国存档的 `day.done` 确认）、快进一季看到小结并核对下一季的季度和存档日期、英文界面不含中文、375 宽度用地点抽屉走路且无横向滚动。断言里的日期和月数先在内容包单测里用引擎算出。
5. **共用外壳的隐含约束**（review111-1 建议 2）
   - 每个属性键都要在共用的 `iconPaths`（`app/game-shell/game-ui.tsx`）里有图标。`hud.tsx` 用 `as` 取图标，缺图标时只渲染一个空 `<path>`，类型检查和测试都不会报错。
   - 菜谱做法键要带国家前缀：`<国家>.game.prepare-<菜谱 ID>`，外壳 `gameKey` 优先取用。不带前缀的 `game.prepare-<ID>` 与英国同 ID 时，按字典展开顺序英国一方胜出（日本 `salad` 曾显示「轻轻拌匀」）。
   - 信箱角标的位置写死在 `app/game-shell/scene.ts`，按家门 (5,10) 摆放，地图的公寓门必须在 (5,10)。
   - 水声环境音读地图的 `pond` 锚点，钓鱼地点也沿用 `pond`。
6. **review111-1 的通用做法**
   - 结局链接拼回的草稿要满足问卷全部必填项（日本一般永住的 `newStatusStart`）。网页单测按角色循环，至少取开局与一次出境后的状态，用结果页同一入口 `readPageResult` 回读，核对草稿、各路径状态、日期与逐项检查。
   - 递交申请的旗标在 `beforeAction` 里记：`ending` 效果在 `applyEffects` 里当场定稿结局文案，`actionFlags` 要到效果之后才写入。
   - 手续费在 `actionDetails` 里才加进效果时，`actionAvailable` 要用同一金额检查余额，否则"付得起"恒为真。
   - 时间线里的日期（出境、住址变更与申报等）用当天的 `state.day.date`；评估按季首 `state.date`，季中发生的事下一季才进入评估。一季只有一个可玩工作日，有天数期限的手续要保证当天能办，否则不要提供触发它的动作。
   - 个案裁量的结果（如续签批几年）不要预设成对玩家最有利的值：按 `policy-data` 有来源的期间记录，交给引擎判断，拿不到的显示待确认，并在活动说明写明。
   - 进度条的 `FUTURE` 标签只说时间条件的日期（日本用 `jp.game.timeFuture`），不要用"最早 X 满足条件"。
   - 共用文案里的英国语境用 `<国家>.game.<键>` 改写（如 `kitchenNoIngredients`、`fishJunk`、`collectionMemory.pond`）；结局家具名用 `GameCountry.furnishingNames`，日记抛竿地点用内容包的 `fishingSpot`。

## 审核修正（review111-1）

审核意见：独立 Claude 审核第 1 轮（`review111-1`，结论"需要修改"）。问题 1–3、风险 1–3、建议 1、3、4、5 已处理；建议 2 写进上文"其他国家照做的要点"第 5 条。共用外壳与 `game.ts` 只加了两个可选字段（`GameCountry.furnishingNames`、内容包 `fishingSpot`），没有改名或删字段；英国不设这两个字段，行为与文案不变。第 1–3 节里与本轮不符的说法以本节为准：续签现按 `deemedMonths` 记录（不是 `maximumMonths`），续签后期限 2030-03-31（不是 2032-03-31），结局链接的单测现在两位角色都测，测试数见下文。

### 1. 做了什么（按 commit）

| PROGRESS | commit | 对应审核 | 内容 |
|---|---|---|---|
| 765 | `Fix: 工程师结局链接补齐新指南起算日（review111-1 问题 1）` | 问题 1、建议 5 | 工程师一般永住路线补 `newStatusStart: '2024-04-01'`（技人国在新旧两版指南下都计入，SRC-113 1(3)ア、SRC-114 注2），问卷必填项齐全，结果页不再显示"请返回问卷"。`apps/web/test/japan-game.test.tsx` 改为按角色循环：开局与出境一个月后两个状态，用结果页同一入口 `readPageResult(japanModule, 'zh-CN', 片段, 'result')` 回读，无更正提示，草稿等于 `gameDraft(state)`，各路径的 status、earliestDate、timeEarliestDate 与逐项检查状态和游戏内一致。 |
| 766 | `Fix: 递交帰化申请后结局显示帰化文案（review111-1 问题 2）` | 问题 2、建议 5 | 参照新西兰内容包，`applied-pr`/`applied-nat` 改在 `beforeAction`（`applyEffects` 之前）记下，去掉 `actionFlags`；`endingText` 在 `ending` 效果执行时就读得到。内容包单测：2034-06-01 帰化路径 `MET` 时在法务局递交，`narrative().at(-1)` 与结局日志都是帰化文案。 |
| 767 | `Fix: 日本菜谱做法文案改用国家前缀键（review111-1 问题 3）` | 问题 3、建议 5 | 日本 6 道菜的做法键改为 `jp.game.prepare-<菜谱 ID>`，外壳 `gameKey` 优先取用；英国 `game.prepare-*` 的键与文案不变，其他国家已用的专属 ID 不受影响。网页单测按中英文检查日本菜谱做法键带前缀、文案不等于英国同 ID 文案，英国沙拉仍是「轻轻拌匀 / Toss gently」。顺带把第 765 项单测的结果参数类型改为 `CountryResult`（765 单独提交时 web typecheck 报 TS2345，本项修正）。 |
| 768 | `Fix: 永住手续费不足时不提供递交（review111-1 风险 1）` | 风险 1 | `actionAvailable` 用引擎在该递交日算出的 `jp.pr.approval-fee` 金额检查余额（手续费到 `actionDetails` 才加入效果，原检查恒为真）。单测：余额差 1 日元时入管窗口没有永住申请，恰好够时可递交、扣到 0。 |
| 769 | `Fix: 住址变更与申报按当天日期记录（review111-1 风险 2）` | 风险 2 | `moved`/`addressNotice` 改用 `state.day.date`，与出境记录口径一致。只改日期不能消除"必然逾期"：一季只有一个可玩工作日，周末、节日或傍晚搬家后，下一个区役所开门日已在下一季。所以搬家与退租只在区役所当天还能受理申报时提供（区役所开门的日子，且搬完还够一次申报的时间），搬家说明写明当天申报。单测覆盖当天记录、下一季按时为 `MET`、未申报为 `UNKNOWN`、跨季补报为 `NOT_MET`，以及 15:15 与 15:16、周末的搬家与退租可用性。 |
| 778 | `Fix: 续签不再预设最长期间，最长在留期间交给引擎判断（review111-1 风险 3）` | 风险 3 | 续签按 `policy-data` 的 `longestPeriod.deemedMonths`（36 个月，永住指南在 `transitionOn` 2027-03-31 前视为最长，SRC-114 第2の5(6) 注4）记录新期间与期限，不再按 `maximumMonths[资格]`。"最长在留期间"由引擎判断：过渡日后两位角色都是 `UNKNOWN`，不再被续签自动满足。实际批几年游戏拿不到，入管窗口的标签与说明写明"按 36 个月记录、实际由入管决定、评估显示待确认、递交永住时由入管核对"。为了不让永住结局在过渡日后变得不可达，永住申请在路径 `MET`、或只剩 `jp.pr.longest-period` 待确认时开放，标签与说明注明待入管确认；还有其他事项待确认（如未申报的住址）时不开放。单测覆盖续签后期限 2030-03-31、剩余 48 个月，过渡后只剩该项待确认时可递交，另有待确认事项时不可递交。 |
| 779 | `Refactor: 日本续签提醒改用更新窗口参数（review111-1 建议 3）` | 建议 3 | 工程师与安娜的续签提醒事件、拉杰的续签台词（`npcs.ts` 同样的裸数 12）改用 `jpBalance.renewalWindowMonths`。 |
| 780 | `Fix: 日本进度条的未来日期只说时间条件（review111-1 建议 4）` | 建议 4 | `FUTURE` 改用新键 `jp.game.timeFuture`「时间条件最早 {date} 满足 / Time requirement met from {date}」，与详情面板的「时间条件最早满足」一致；其他状态标签不变。单测检查永住条用新措辞、不含「最早 X 满足条件」，帰化条仍是「未满足条件」。 |
| 781 | `Fix: 日本补齐仍带英国语境的共用文案（review111-1 建议 1）` | 建议 1、建议 5 | 新增 `jp.game.kitchenNoIngredients`（蔬菜来自市民农园的收成，鲈鱼去大冈川钓）；`GameCountry` 加可选 `furnishingNames`，结局"一点点布置的家"按国家取名，日本用内容包导出的 `jpFurnishingNames`（和室座椅、遮光窗帘、台灯），商店标签同源、显示不变；内容包加可选 `fishingSpot`，日记与旅程的抛竿文字按它写，日本为"大冈川 / the Ōoka River"，英国原文「池塘抛竿 N 次」「在池塘抛竿」不变。补内容包与网页单测。 |
| 782 | `Docs: 任务 111 审核修正报告（review111-1）` | 建议 2 | 本节、"其他国家照做的要点"第 5、6 条与 PROGRESS。 |

### 2. 怎么验证的

- 每项先写回归测试并确认失败，再修：问题 1 工程师回读得到更正提示「请返回问卷…」；问题 2 结局文案是永住文案「材料一页页递进窗口…」；问题 3 `gameKey('jp', 'game.prepare-miso-soup')` 返回不带前缀的键；风险 1 余额差 1 日元仍列出 `settle`；风险 2 记录为 `2026-03-01`、15:16 仍可搬家；风险 3 续签说明不含待确认、过渡后没有 `settle`；建议 4 进度条找不到新措辞；建议 1 厨房提示等于英国文案、抛竿日志仍是"池塘"。修后各自通过；每个 commit 前跑了受影响包的 typecheck、ESLint 与 Prettier 检查。
- 整链（HEAD `b0ef6978`，报告提交前）：`export VITEST_MAX_WORKERS=2` 后 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码 0。error-report 2、policy-data 23、engine 6,006（既有 1 项按默认跳过）、game 1,361（日本内容包单测 8 → 13）、web 851（日本网页单测 6 → 11）项通过，英国游戏既有单测全部通过；构建生成 33 个静态页面。
- 浏览器 e2e：`cd apps/e2e && E2E_PORT=4441 npx playwright test tests/game.spec.ts tests/life.spec.ts tests/japan-game.spec.ts --project=desktop --reporter=line`，26 项全部通过（英国 21、日本 5），之后删除 `apps/e2e/test-results`。
- 视觉检查：用临时 Playwright 脚本无头截图（脚本未入库，跑完删除），看过中英文进度条（「时间条件最早 2034-04-01 满足」「Time requirement met from 2034-04-01」，帰化条仍是「未满足条件」）、入管窗口的更新标签与说明、杂货铺家具标签（与修改前一致）、空厨房提示（市民农园、大冈川）、沙拉第 3 步「切块，拌上芝麻酱」、离开日本后结局"一点点布置的家"的和室座椅、遮光窗帘、台灯。

### 3. 没做或没验证的

- 风险 3 的取舍需要统筹确认：过渡日（2027-03-31）后，游戏里的永住路径和结果页都会显示"待确认"（`UNKNOWN`），不再是"已满足"；永住申请仍可在只剩这一项待确认时递交。如果更希望保持"只有 `MET` 才能递交"，永住结局在过渡日后就到不了（两位角色的永住时间都在过渡日后，安娜的帰化又因 PD-137 不开放，她将没有可达的身份结局）。
- 续签真实获批期间、更新手续费和可提前递交的期间仍没有官方参数，游戏按 36 个月记录、不收费，已在活动说明写明；本轮没有补 `policy-data`。
- 共用 `game.ts` 的日记分组没有加 `naturalise`（见第 4 段），这一改动会同时影响新西兰、西班牙、希腊分支。
- 自动退租（季末余额不足、事件选便宜住处）由共用 `game.ts` 处理，不经过日本的 `moved` 效果，不记住址变更；本轮未改。
- 英国 e2e 截图基线仍未在本机比对（本机 Playwright 忽略截图）；没有跑 a11y e2e。

### 4. 发现与建议（范围外，未实现）

- 共用 `game.ts` 的日记分组 `['extend', 'settle']` 不含 `naturalise`，帰化申请不会出现"文件夹越装越厚"那句。新西兰、西班牙、希腊内容包都有 `naturalise`，英国没有；建议七国合并后在共用分组里加上。
- 新西兰分支（`fable/104-nz-game`）自己的 `game.prepare-salad` 也会被英国「轻轻拌匀」覆盖；合并 main 后应改成 `nz.game.prepare-salad`。加拿大（`fable/105-ca-game`）与美国（`fable/106-us-game`）都定义了不带前缀的 `game.prepare-garden-salad`（枫糖油醋汁 / ranch），两国都合并后会互相覆盖，同样应各自加国家前缀。其余菜谱 ID 与英国、彼此都不重名；各分支里 `miso-soup` 等 6 个不带前缀的日本键继承自日本旧版，合并后会随本轮改动消失。
- 自动退租时日本没有记住址变更。如要补，可给内容包一个可选的退租钩子，或在日本的 `afterQuarter` 比对 `brighter-home` 旗标后记 `moved`（同样要考虑当天能否申报）。
- `packages/game/src/model.ts` 里 `DayState.date` 的注释写"时间线效果仍用 `state.date`"，但出境（共用）与日本住址现在都按当天日期记录，注释已过时。

## 审核修正（review111-2）

审核意见：Gemini 4 Neon 只读复核第 2 轮（`review111-2`，结论"需要修改"）。本轮只处理"问题 1"；风险 1–2、建议 1–3 按范围未改，见第 3、4 段。共用外壳（`app/game-shell/*`、`GameCountry`）、共用 `game.ts` 与 `content-pack.ts`、英国游戏都没有改动。PROGRESS 行号：brief 给的 783 起，在提交时已被并行任务（98、100、102 的 worktree）用到 797，800–816 是旧行、850–861 属任务 113，所以取下一段空号 817–819。

### 1. 做了什么（按 commit）

| PROGRESS | commit | 对应审核 | 内容 |
|---|---|---|---|
| 817 | `Fix: 同季住址变更后结局链接能打开结果页（review111-2 问题 1）` | 问题 1 第一条、修复方向 1、3 | 按修复方向第 1 条里后一种做法的思路（季中的事到季末才进入评估，与出境回国后才记入一致），但不改存储：内容包新增 `timelineOn(timeline, date)`，取评估日那天的时间线视图——`eventOn` 晚于评估日的住址变更先不计入，`notifiedOn` 晚于评估日的申报先按未申报（去掉该字段，与游戏里未申报的写法相同）。`jpRules.evaluate` 与结果页草稿 `gameDraft` 都按它取时间线，所以游戏内的 `state.result` 与结果页回读的是同一份时间线，草稿里也不再有晚于模拟日期的已发生事项。时间线本身仍按当天日期记录（review111-1 风险 2 的做法不变）。行为变化：跨季补报在补报的那一季显示待确认（`UNKNOWN`），下一季起为不满足（`NOT_MET`）；原来补报当场就是不满足。 |
| 818 | `Fix: 同季搬家未申报住址时不提供永住申请（review111-2 问题 1）` | 问题 1 第二条、修复方向 2、3 | 当季的住址变更要到下一季才进入评估，评估里的住址项仍是满足，所以 `actionAvailable` 对 `settle` 加 `address-notice-due` 旗标检查（路径 `MET` 与只剩最长在留期间待确认两种情况都适用）；当天申报、旗标清除后恢复。 |
| 819 | `Docs: 任务 111 审核修正报告（review111-2）` | — | 本节与 PROGRESS。 |

### 2. 怎么验证的

- 先写回归测试并确认失败，再修：
  - 网页单测 `apps/web/test/japan-game.test.tsx`「the ending link opens after %s moves and reports mid-quarter」，工程师与安娜各三种结局：同季搬家未申报后离开、同季搬家并当天申报后离开、跨季补报后在同季离开。用结果页入口 `readPageResult(japanModule, 'zh-CN', 片段, 'result')` 回读，要求无更正提示、草稿等于 `gameDraft(state)`、各路径 status、earliestDate、timeEarliestDate 与逐项检查状态和游戏内一致。修前两位角色都得到更正提示「请在问卷的「在留身份、品行与公共义务」中核对日期。有一项已发生事项晚于模拟日期。」。
  - 只在 `gameDraft` 里对齐日期（修复方向第 1 条里前一种做法）时又跑了一次：结果页不再报错，但跨季补报那一项游戏内是 `NOT_MET`、结果页是 `UNKNOWN`，所以评估也改成按同一视图取时间线，之后两边一致。
  - 内容包单测 `packages/game/test/jp-pack.test.ts`「a move made this quarter keeps the application closed until it is reported」：2034-06-01（当天 2034-06-13，已过日语评估，只剩最长在留期间待确认）在家搬到朝南公寓，评估里的住址项仍是 `MET`、入管窗口不提供 `settle`；当天到区役所申报后提供。修前窗口仍列出 `settle`。原有住址用例补一句：跨季补报的当季住址项为 `UNKNOWN`，下一季为 `NOT_MET`。
  - 每个 commit 前跑了 game 与 web 的 typecheck、ESLint、Prettier 检查与两个日本测试文件。
- 整链（HEAD `bbcb9353`，报告提交前）：`export VITEST_MAX_WORKERS=2` 后 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，退出码 0。error-report 2、policy-data 23、engine 6,006（既有 1 项按默认跳过）、game 1,362（日本内容包单测 13 → 14）、web 878（日本网页单测 11 → 13）项通过，英国游戏既有单测全部通过；构建生成 37 个静态页面。
- 浏览器 e2e：确认 4461 端口空闲后 `cd apps/e2e && E2E_PORT=4461 npx playwright test tests/game.spec.ts tests/life.spec.ts tests/japan-game.spec.ts --project=desktop --reporter=line`，26 项全部通过（英国 `game.spec.ts` 14、`life.spec.ts` 7，日本 5），之后删除 `apps/e2e/test-results`。
- 视觉检查：本轮没有可见的界面改动（只改评估取数、结果页草稿与入管窗口是否列出永住申请），没有截图。

### 3. 没做或没验证的

- 风险 1（工作日下午搬家后步行去区役所来不及申报）与风险 2（季末余额不足自动退租不记住址变更）按范围未改；风险 2 在 review111-1 报告里已列为未做。
- 建议 1（进度条 `missingRules` 只列 `requirement`）、建议 2（日记收成句子的"菜地"措辞）、建议 3（日语熟练度判断的字面量 59/60）按范围未改。
- 同季搬家未申报时帰化申请仍开放：引擎的帰化评估不看住址申报，审核也只要求永住；是否一并限制需要统筹决定。
- 没有补"可递交季度搬家并申报后递交永住或帰化"的结局链接回读用例；`timelineOn` 与结局种类无关，离开日本的三种情形已覆盖同一路径。
- 英国 e2e 截图基线仍未在本机比对；没有跑 a11y e2e。

### 4. 发现与建议（范围外，未实现）

- 其他国家照做的要点补一条：结果页问卷不接受晚于模拟日期的已发生事项。季中按当天日期写进时间线的事实，评估与结果页草稿要用同一个"评估日视图"去掉（日本是 `timelineOn`），只在草稿里删会让结果页与游戏内不一致（跨季补报就是例子）。
- 审核风险 1 的步行余量：`reportableToday` 可以在 `paperwork` 之外再留出从公寓走到区役所的游戏时间（审核估计 30–40 分钟），这个数是游戏平衡参数，可放进 `jpBalance`。
- `packages/game/src/model.ts` 里 `DayState.date` 的注释仍写"时间线效果仍用 `state.date`"，已过时（review111-1 已提）。
