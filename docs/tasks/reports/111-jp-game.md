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
