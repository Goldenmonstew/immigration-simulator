# 任务 108 · 希腊人生模拟游戏

实现者：Claude Opus 5.5。brief 分配的 PROGRESS 行号 670–679 已被任务 88 审核修正（670–675）和任务 98（676–679）占用；查过全部本地分支后改用空着的 735–738；合入 main 时 735 与任务 100 同号，依次改为 1070–1073。

## 1. 做了什么（按 commit）

| PROGRESS | commit | 内容 |
|---|---|---|
| 1070 | `Feat: 希腊人生模拟内容包与规则适配` | `packages/game/src/packs/gr/` 内容包与 `@uk-immigration/game/gr`、`gr/presentation` 入口；评估适配器把时间线交给 `evaluateGreeceFull`；单测 `packages/game/test/gr-pack.test.ts`（12 项）。 |
| 1071 | `Feat: 接入希腊人生模拟页面、地图与美术` | `/greece/game` 页面；`app/greece/game/` 的国家配置、场景子类与场景绘制、音效；利马纳基地图、按希腊配色重新着色的瓦片、原创横幅；注册表 `hasGame: true`、希腊首页游戏入口、离线清单与缓存版本；中英文案；网页单测 `apps/web/test/greece-game.test.tsx`。 |
| 1071 | `Feat: 希腊移民局办事处显示居留卡期限与续期窗口` | 移民局办事处的地点说明：蓝卡到期日、续期窗口与逾期截止日；配偶显示 Ο.3 到期日与 Μ.3 最早日期（并入 1071 行的说明）。 |
| 1070 | `Fix: 希腊长期居留申请与蓝卡续期按含费用的金额判断能否办理` | Μ.1/Μ.3 申请费与蓝卡续期的许可费、制卡费、逾期罚款计入能否办理的判断，避免把存款扣成负数（并入 1070 行的说明）。 |
| 1072 | `Test: 希腊人生模拟 e2e` | `apps/e2e/tests/greece-game.spec.ts`（5 项）。 |
| 1073 | `Docs: 任务 108 报告` | 本报告。 |

### 共用外壳的改动（逐条）

1. `apps/web/app/game-shell/game-ui.tsx`：`iconPaths` 加一行 `greek`（与 `english`、`japanese` 同一个书本图标），状态栏的希腊语属性才有图标。

其余全部在希腊自己的文件里完成。外壳固定从 `/assets/modern-city/tiles.png` 加载小镇瓦片；希腊场景子类在 `preloadScenery` 另载 `public/game/greece/tiles.png`，第一次 `decorate` 时用 Phaser 的 `textures.renameTexture` 把它换成 `town-tiles`，外壳按季节着色的代码照常读取，英国和日本不受影响。

### 角色（原创）

| ID | 名字 | 起点 | 评估路径 | 起始日期 |
|---|---|---|---|---|
| `bluecard` | 卡里姆·哈达德 / Karim Haddad | 黎巴嫩人，2024-09-15 起持欧盟蓝卡在港口船舶管理公司写航行软件，年薪 5.6 万欧元；改革前签发的蓝卡按 `workValidity.blueBeforeReformYears` 有效到 2026-09-14 | Μ.1 欧盟长期居民（`GR-LONG-TERM`）、一般入籍（`GR-NATIONALITY`） | 2026-03-01 |
| `spouse` | 林晓雯 / Xiaowen Lin | 福建人，与希腊轮机工程师扬尼斯结婚，2023-05-02 起在希腊共同居住；Ο.3 卡 2023-06-20 签发，按 `gfPeriods.residenceYears` 有效到 2028-06-19；港口船代公司的三语翻译 | 希腊公民家属 Ο.3→Μ.3（`GR-GREEK-FAMILY-PR`）、一般入籍 | 2026-03-01 |

两人都有到期日明确的居留卡，共用外壳的居留卡栏（剩余月数、季初提醒、快进警告）照常工作。纳税、社保、品行、材料按"已备齐"开局；希腊语、A2 证书、Π.Ε.Γ.Π.、每年的报税记录、住址申报、出境记录、收入在游戏中变化。各有开场事件与 5–6 张专属事件卡。

开局评估（引擎实算）：卡里姆的 Μ.1 因 LT-04（希腊语及历史文化融入）未满足，考过游戏里的 A2 后变为 `FUTURE 2029-09-15`；入籍差 Π.Ε.Γ.Π. 与五个税年的记录，时间条件 2031-09-15。晓雯的 Μ.3 为 `FUTURE 2028-05-02`；入籍时间条件 2030-06-20。

### 地点（19）

海景公寓楼 `home`、港口航运大楼 `work`、社区希腊语班 `college`（上课、A2 希腊语与历史文化考试、Π.Ε.Γ.Π. 考试）、市立图书馆 `library`、社区卫生中心 `gp`、海浪小酒馆 `pub`、梧桐咖啡馆 `cafe`（冰咖啡、双陆棋）、阿尔迪特超市 `shop`、会计师事务所 `council`（查看评估、每年报税）、KEP 服务中心 `kep`（认证签名）、移民局办事处 `visa`（蓝卡续期、住址申报、Μ.1/Μ.3 申请）、国籍司 `bureau`（入籍申请）、海滨电车站 `station`（探亲与离开）、周六露天菜市 `market`（只在周六上午开，卖当季蔬果）、市立菜园 `allotment`、港口防波堤 `pond`（钓鱼）、报亭告示板 `board`、圣尼古拉广场 `green`（点蜡烛、节日）、海滨长椅 `bench`。

### 镇民（7 + 1 位家人）

埃莱妮·弗拉胡（退休小学老师、菜园老手、喂猫）、斯塔夫罗斯·卡洛耶拉基斯（小酒馆老板，天亮前出海）、卡捷琳娜·季穆（希腊语班老师）、阿尔迪特·乔尼（阿尔巴尼亚来的超市老板，去年入籍）、黛丝皮娜·安德烈乌（KEP 窗口职员）、萨纳西斯·兰布鲁（街角会计师）、涅斐莉（斯塔夫罗斯的十岁孙女，章鱼与海玻璃专家）；扬尼斯·马尔库（晓雯的丈夫，跑海岛航线的渡轮轮机工程师）只在 `spouse` 局出现。每人有工作日、周末、雨天、节日排班，6–10 句对话（含季节、天气、心数和节日台词）、礼物偏好与反应。

### 节日（日期按惯例，不涉及政策）

| 季 | 节日 | 日期 | 专属活动 | 节日食物 |
|---|---|---|---|---|
| 冬 | 主显节祝圣海水 | 1 月 6 日 | 在码头为跳海抢十字架的人鼓掌 | 新年蛋糕 vasilopita |
| 春 | 东正教复活节 | 复活节星期日（儒略历推算后加 13 天；单测核对 2026–2030） | 和邻居碰红蛋 | 复活节甜面包 tsoureki |
| 夏 | 八月十五圣母节庙会 | 8 月 15 日（19:00 开始） | 跟着布祖基琴跳圆圈舞 | 烤肉串 souvlaki |
| 秋 | 十月二十八日学生游行 | 10 月 28 日 | 在海滨路为学生游行鼓掌 | 蜂蜜小炸球 loukoumades |

### 活动与收集

休息、午睡、自学希腊语、搬到海景公寓/退租、上班、加班、希腊语课、A2 考试、Π.Ε.Γ.Π. 考试、看病、炸小鱼配茴香酒、冰咖啡、双陆棋、买家具（阳台藤椅、木百叶窗、台灯）、逛菜市、请会计师看评估、报税（E1）、认证签名、蓝卡续期、申报新住址、递交 Μ.1/Μ.3 申请、递交入籍申请、回国探亲 1/3/6 个月、离开希腊、租菜园、看告示、看海、海滨健走会、进教堂点蜡烛、逛节日摊位；另有共用的钓鱼（沙丁鱼、红鲻鱼、金头鲷、鲭鱼）、种菜（番茄、黄瓜、土豆、草莓、玉米、芜菁）、做菜（7 道：希腊农夫沙拉、番茄酿饭、柠檬烤土豆、炭烤沙丁鱼、渔夫鱼汤、草莓蜜饯、炭烤玉米，ID 都是希腊专用，只给这 7 个写了 `game.prepare-*`）、买东西、送礼、收信。成就 7 个（复活节、四季节日、A2、Π.Ε.Γ.Π.、续期、金头鲷、小酒馆常客）。

**日常事件（16）**：菜市的吆喝、罢工日、热浪、北风吹走床单、阳台上的猫、报亭充值、楼下奶奶的菠菜派、邻居的命名日、洁净星期一、橄榄采收、第一场秋雨、myAADE 报税通知、午休时间的敲门、清晨游泳、KEP 取号、圣诞礼金；另有 4 张系统卡（考试未过、病倒、想家、账户见底）。

### 规则交给引擎

`grRules`（`packs/gr/rules.ts`）：

- `evaluate`：`evaluateGreeceFull`，时间线就是去掉 `simulationDate`、`locale` 的请求；`pathways` 固定为"长期路径 + 入籍"。
- `progress`：`pr`、`nat` 两列取引擎的路径状态；`FUTURE` 带引擎的最早日期。进度百分比用引擎的最早日期，没有时按 policy-data 的年限（`longTermYears`、`gfPeriods.residenceYears`、`nationalityYears`）从居住起点算。
- 蓝卡续期：续期窗口与逾期期限读 `renewalWindowMonths`、`lateRenewalMonths`；游戏按季度计时，这一季碰到窗口就能提前递交；逾期月数与逾期补交截止按办理当天计算，到期后补交按逾期月数收 `lateFinePerMonthEur`，不足一个月按一个月（PD-150，review108g-1 修正）；费用 `workFees.permit + print`；续期年限 `workValidity.blueRenewalYears`。`expired`：过了逾期补交期限才以 `overstayed` 结束。
- A2：`integration = { basis: 'a2', a2Certificate: true }`，报名费 `settlementIntegration.fullFee`；Π.Ε.Γ.Π.：`exam: 'certificate'` 与 `knowledgeDocumentReady`，报名费 `naturalisationExam.fee`。
- 报税：在会计师处把上一年度的应税收入写入 `nationality.incomeByTaxYear`（起薪按游戏设定，每次晋升乘 `promotionMultiplier`）；入籍要五个税年的记录才会从 UNKNOWN 变为 MET。
- 住址：搬家写入 `changes`，在移民局申报写 `reportedOn`；超过 `changeReporting.months` 补报收 `changeReporting.firstFine`。
- 出境：记入 `trips`（配偶的行程标为普通离境）；回程日期须在居留卡有效期内。
- 申请：Μ.1 收 `longTermCard.initialFee + cardFee`，Μ.3 收 `gfPeriods.applicationFee` 与 `cardFormalities.printFee`，入籍收 `naturalisationFees.initial`；只在引擎给出 `MET` 时开放。结局文案在 `beforeAction` 先记下 `applied-pr` / `applied-nat`，入籍结局显示入籍文案（单测核对）。
- 结局链接 `/greece/result#s=…`：时间线转成希腊问卷草稿（税年收入转成 `incomeYears` 行、`tripsComplete: true`、停在最后一步），经 `decodeDraft(…, true)` 校验为完整草稿，结果页的路径、状态、最早日期与游戏内一致。

### 地图草图

56×40 格，`public/game/greece/town.json`，全部用 `modern-city/tiles.png` 的瓦片拼成；`public/game/greece/tiles.png` 是同一张图的重新着色（墙 16→白墙蓝饰带、19→赭黄、21→浅杏，窗 17/22→蓝、20→绿，门框蓝，遮阳篷 23–25/40→蓝白，邮筒 37→希腊邮政黄），其余瓦片不变。装饰由希腊场景子类绘制。

```
北  柏  [海景公寓楼：5 层阳台花盆]  ‖ [港口航运大楼] [社区希腊语班] ‖ [KEP 服务中心] [国籍司 + 国旗]
       人行道 · 黄色邮筒 · 公交站牌 · 路灯
════════════════════════ 东西向马路 ════════════════════════
 [超市][梧桐咖啡馆：桌椅] ‖ [海浪小酒馆：蓝白遮阳篷、露台、灯串、三角梅] [卫生中心] ‖ [图书馆] [会计师]
════════════════════════ 东西向马路 ════════════════════════
 [海滨电车站：三角梅] ‖ [移民局办事处 + 国旗] [圣尼古拉教堂：蓝顶、钟楼] [报亭] ‖周六菜市街‖ [市立菜园 6 块地]
 ─────────── 海滨步道 · 长椅 · 路灯 · 猫 ───────────
 ~~~~~~ 港口（渔船）~~~~~ 防波堤 ┃ 灯标 ~~~~~~~~~~~~~~~~~~~~~~~
```

公寓门在 (5,10)、出生点 (5,12)，与英国、日本地图一致。季节色：冬季深绿、春季鲜绿、秋季干金；夏季保留瓦片原色。周六上午菜市街两侧出现蓝白、红白遮阳篷的摊位；节日在广场加摊位与灯串，并分别画码头上的十字架与水花（主显节）、烤全羊炭火、红蛋与蜡烛（复活节）、白布长桌与乐手台（八月十五）、一排国旗（学生游行）。原创横幅 `public/game/greece/town-banner.png`：远山上的帕特农神庙、白墙蓝窗公寓楼、蓝白遮阳篷小酒馆与三角梅、柏树、蓝顶教堂与钟楼、赭黄新古典建筑和国旗、橄榄树、黄色邮筒与报亭、海与渔船。

## 2. 怎么验证的

- 完整验收：`export VITEST_MAX_WORKERS=2` 后在本 worktree 运行 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，整条命令退出码 0。测试 error-report 2、policy-data 23、engine 6,006（既有文案导出用例按配置跳过 1 项）、game 1,368（原 1,356 + 希腊 12）、web 862 项通过；Next.js 生成 38/38 个静态页面，`apps/web/out/greece/game.html` 已导出。
- 希腊内容包单测 `packages/game/test/gr-pack.test.ts`（12 项）：两位角色开场、起始日期 2026-03-01、首个工作日 2026-03-10、初始属性；蓝卡到期日 2026-09-14（`blueBeforeReformYears` = 2）、剩余 6 个月；引擎列 `gr.current-law-2026-11` 与路径 `GR-LONG-TERM`/`GR-NATIONALITY`、`GR-GREEK-FAMILY-PR`/`GR-NATIONALITY`；卡里姆开局 Μ.1 为 `NOT_MET`（LT-04），考过 A2 后 `FUTURE 2029-09-15`，扣除 `settlementIntegration.fullFee`；晓雯 Μ.3 `FUTURE 2028-05-02`；春季移民局不能续期，2026-06-01 那一季可以续期，扣 `workFees.permit + print`，新到期日 2029-09-14、剩余 39 个月；到期后补交按逾期 2 个月收罚款，过了逾期期限在 2026-09-01 以 `overstayed` 结束；东正教复活节 2026–2030 的日期，2026-04-12 的节日是复活节，碰红蛋得到甜面包与到访旗标；周六菜市卖当季的土豆和草莓；搬家后 C-06 为 `NOT_MET`、按时申报后为 `MET` 且不罚款；出境一个月记为普通离境、季末 2026-06-01，存档 JSON 往返后下一季完全一致；2027 年报 2026 年度税；2028-06-01 Μ.3 为 `MET`，扣 `applicationFee + printFee` 后结局 `settled` 并显示配偶的结局文案；2031-12-01 两条路径都为 `MET` 时递交入籍，扣 `naturalisationFees.initial`，结局显示入籍文案。
- 网页单测 `apps/web/test/greece-game.test.tsx`（8 项）：注册表与离线清单含 `/greece/game`，存档只写 `gr-immigration-life-v3:bluecard`，静音写 `gr-immigration-life-muted`；两位角色带出境和新税年时，结局链接 `/greece/result#s=…` 经希腊模块以完整模式解码通过问卷校验，结果页路径、状态和最早日期与游戏内一致，草稿停在最后一步（4 与 6）；中英文状态栏显示欧元、希腊语和居留卡剩余月数，进度条显示「最早 2028-05-02 满足条件」，英文状态栏与进度条无中文，会计师事务所显示希腊评估列；蓝卡角色只列出融入条件，配偶的 `FUTURE` 路径不列"还差"，移民局说明显示续期窗口；所有物品、角色、镇民、横幅、瓦片和招牌的图都存在；地图包含内容包的全部地点、镇民排班用到的全部锚点和 6 块菜地，出生点在公寓门下。
- 浏览器 e2e（完整验收后的静态构建，`E2E_PORT=4429`）：`cd apps/e2e && npx playwright test tests/game.spec.ts tests/life.spec.ts tests/japan-game.spec.ts tests/greece-game.spec.ts --project=desktop --reporter=line`，31 项全部通过（英国 21、日本 5、希腊 5），退出码 0；之后删除了 `apps/e2e/test-results`。希腊用例里的日期与状态（剩余 6 个月、最早 2028-05-02、下一季 2026-06-01）都先在内容包单测里由引擎算出。
- 视觉检查：用 Playwright 无头截图（未用内置浏览器）看过公寓内部、港口航运大楼与希腊语班一带、小酒馆一条街（白天雨天与夜间灯串）、圣尼古拉广场与报亭、防波堤与灯标、周六菜市、四个节日的广场装饰、英文桌面版与 375 宽度手机版。据此把过长的中英文地点名缩短（地点按钮会折行或被截断）、把三角梅从屋顶移到墙角、配偶这类只剩等待日期的路径不再列"还差"、移民局补上续期窗口说明。截图脚本放在 scratchpad，未入库。

## 3. 没做或没验证的

- 晓雯没有 Ο.3 续卡：引擎与 policy-data 都没有 Ο.3 续卡期限，游戏只让她在满足条件后转 Μ.3。共居条件因长时间出境等原因不满足时，她会在旧卡逾期补交期结束后以 `overstayed` 收场（正常游玩在 2028 年夏秋两季都能递交 Μ.3）。
- 蓝卡续期按季度计时：一季里只有三个可玩日，游戏把"这一季碰到法定窗口"视为按时递交，并在活动说明里写明；逾期补交按到期日到办理当天的月数收罚款，不足一个月按一个月计（PD-150；原写"到季初的整月数"与代码不符，review108g-1 改正，逾期判断也改为按办理当天）。
- `passport.expectedDeparture`：Μ.1 的证件核对在没有预计离境日时返回 PD-300 的 UNKNOWN，游戏把当前居留卡到期日记作离境基准，续期时同步更新。这是游戏的假设，不是引擎或官方的解释。
- 引擎对入籍的连续居住：只要有一次出境就按 PD-106 返回待确认，所以探亲后入籍一栏会变成"无法确定"；这是引擎的既有结论，没有改。入籍还需要五个税年的报税记录，开局分别只有 2 年（卡里姆）和 3 年（晓雯）。
- 没有专属立绘和行走图：两位角色和 8 位镇民借用现有 17 人的图（`grGameArt.cast`），名字与身份都是新的。会计师事务所、KEP、国籍司没有专属招牌（共用的 council 图标是柱廊建筑，不适合会计师，所以没挂）。
- 没有心事件、地图惊喜、长期支线；考试没有按真实考期安排。
- 截图基线未比对（本机默认忽略截图）；没有跑 a11y spec 和 mobile project。

## 4. 发现与建议

- 建议在 policy-data 补 Ο.3 普通续卡的期限（引擎 GF-08 只核资格与材料），游戏和问卷都能用上。
- 希腊完整版路径没有 `timeStatus`/`timeEarliestDate`（日本有），其他条件未满足时只有 `NOT_MET`，看不到时间条件本身的日期；游戏的进度百分比因此改用 policy-data 的年限从居住起点推算。若引擎补上这两个字段，游戏和结果页都能显示"时间条件最早满足日"。
- Μ.1 的 C-01 缺预计离境日时一律待确认（PD-300）；问卷用户会遇到同样的问题，建议明确长期居留申请的离境基准。
- 共用外壳从固定路径加载小镇瓦片；希腊在场景子类里用 `renameTexture` 换成重新着色的版本。若其他国家也要换色，可以在 `GameArt` 加一个可选的 `tiles` 字段，由外壳统一加载。
- `sw.js` 缓存版本改成 `2026-11-24-v7-gr`（`about-page.test.tsx` 同步），与其他国家的分支合并时这一行会冲突，按最后合并的版本号处理。
- `pnpm lint` 只跑 ESLint；`apps/web` 里 `app/hub-content.tsx`、`test/japan-questionnaire.test.tsx`、`test/page.test.tsx` 三个既有文件不符合 Prettier，本任务没碰它们。
- 中途我用 `pkill -f "node serve.ts"` 停掉自己在 4429 端口起的静态服务器；按名字匹配，若当时别的 agent 的 Playwright 也用同一命令起了服务器，可能被一并停掉（之后检查时没有看到其他同名进程）。以后应按 PID 停止。

## 合入 main 与试点修正跟进

brief：`brief-108c`。本分支原先建在日本试点（任务 111）与希腊页面（任务 98）的早期版本上；两者合入 main 后，本节把 main 合进来，再按试点四轮审核修正（报告 `docs/tasks/reports/111-jp-game.md` 的 review111-1 至 review111-3 与"其他国家照做的要点"）逐项核对希腊游戏。实现者：Claude Opus 5.5。PROGRESS 行号按 brief 用 942 起（提交前查过全部本地与远端分支和其他 worktree，900 以上最大到 936，942–948 未被占用）。第 1–4 节里与本节不符的说法以本节为准：住址变更与申报现按当天日期记录；结局链接改用结果页入口回读；配偶的 Ο.3 失效后不再以 `overstayed` 收场。

### 1. 做了什么（按 commit）

| PROGRESS | commit | 对应试点修正 | 内容 |
|---|---|---|---|
| — | `Merge: 合入 main`（`109e0164`） | — | 合入当时的 main（日本游戏与共用外壳的审核修正、希腊页面多轮修正、德国/美国/澳大利亚页面等）。冲突只在 `site-countries.ts`（希腊保留带 `'game'` 的一行）、`sw.js` 与 `about-page.test.tsx`（缓存版本改为 `2026-11-25-grgame`）、`PROGRESS.md`（取并集）。共用外壳、`game.ts`、`content-pack.ts` 自动取 main 的写法；本分支对外壳唯一的改动 `iconPaths.greek` 原样保留；`game-page.tsx`、`lib/game-country.ts`、`packages/game/package.json` 的国家登记自动合并为日本与希腊并存。 |
| 942 | `Fix: 希腊菜谱做法文案改用国家前缀键` | review111-1 问题 3 | 7 道希腊菜的做法键改为 `gr.game.prepare-<菜谱 ID>`，外壳 `gameKey` 优先取用，不会被英国或别国同 ID 的 `game.prepare-*` 覆盖。 |
| 943 | `Test: 希腊入籍与长期居留结局文案按递交的申请种类` | review111-1 问题 2 | 核对：原分支已在 `beforeAction` 记下 `applied-pr` / `applied-nat`，结局文案按它选，无需改代码。补结局日志断言：配偶递交 Μ.3 的叙事与结局日志是她的定居文案；蓝卡工程师递交入籍的叙事与结局日志是入籍文案、不是定居文案。 |
| 944 | `Fix: 希腊结局链接按问卷当前作答范围拼草稿，单测按角色回读结果页` | review111-1 问题 1 | 网页单测改为按角色、按开局 / 出境一个月后 / 带新税年的下一年三个状态，用结果页同一入口 `readPageResult(greeceModule, 'zh-CN', 片段, 'result')` 回读。配偶失败：问卷经多轮修正后（review98-1 剔除隐藏答案）在"希腊公民家属 + 入籍"下不再保留 `residenceIncome`，回读的草稿少了这一项。`gameDraft` 改为经 `activeGreeceAnswers` 拼草稿（`residenceIncome` 只给游戏算收入，引擎这两条路径不读它）。 |
| 945 | `Fix: 希腊住址变更按当天日期记录，评估与结局链接草稿用评估日时间线` | review111-1 风险 2、review111-2 问题 1 | 搬家与申报改记 `state.day.date`（原来记季首日期），逾期补报的罚款按当天判断。新增 `timelineOn(timeline, date)`：评估日之后的住址变更先不计入，评估日之后的申报先按未申报；`grRules.evaluate` 与 `gameDraft` 都按它取时间线，结果页草稿里没有晚于模拟日期的已发生事项。行为变化：同季的搬家与申报下一季才进入评估；跨季补报在补报当季与之后都是不满足（希腊的申报期限是两个月，下一季首日已过期限，所以当季也是不满足，不像日本那样先显示待确认）。 |
| 946 | `Fix: 希腊居留卡过期结局反映身份失效` | review111-3 | 希腊时间线里许可"没有到期日 = 按时续期"。过了逾期补交期时，`grRules.expired` 把当前许可的 `to` 写为卡到期日，即身份不再有效、也没有按时续期；季末结局评估与结局链接打开的结果页不再把之后的时间算作合法居留。蓝卡 2029-09-14 到期未续：修前 2030-03-01 的 `overstayed` 结局里 Μ.1 仍为满足，修后 `LT-TIME-RESIDENCE`、`NAT-TIME-RESIDENCE` 与两条路径都为未满足。 |
| 947 | `Fix: 希腊配偶 Ο.3 失效后仍可递交 Μ.3，不以过期收场` | review111-3（配偶） | 引擎判断希腊公民家属 Μ.3 不看 Ο.3 卡是否有效（SRC-087 arts. 28、93Α：卡到期后实际居留中断不超过 `gfPeriods.interruptionYears` 仍保留转换权，卡到期满 `gfPeriods.lateFeeAfterYears` 后递交加收 `gfPeriods.lateFee`）。原来配偶过了逾期补交期就以 `overstayed` 收场，结局评估却显示 Μ.3 满足，许可写为失效也改变不了这一点。改为：配偶的许可同样在卡到期日截止（入籍不再计入之后的时间），但游戏不因卡失效结束，仍可在移民局递交 Μ.3；卡到期满一年后递交按引擎加收逾期费，标签写明。 |
| — | `Merge: 合入 main`（`69b4760d`） | — | 合入期间 main 又进了新西兰与葡萄牙完整版页面；冲突同样只在 `site-countries.ts`（每国一行，希腊带 `'game'`）、`sw.js` 与 `about-page.test.tsx`（保留 `2026-11-25-grgame`）。 |
| 948 | `Docs: 任务 108 合入 main 与试点修正跟进报告` | — | 本节与 PROGRESS。 |

### 2. 怎么验证的

- 每项先写回归测试并确认失败，再改：
  - 942：网页单测「Greek recipes keep their own cooking steps」，修前 `gameKey('gr', 'game.prepare-horiatiki')` 返回不带前缀的键。
  - 943：内容包单测补结局日志断言；把 `beforeAction` 临时换回 `actionFlags` 写法时，入籍用例失败（结局文案是蓝卡的定居文案），换回后通过。
  - 944：网页单测「the ending link opens the same %s timeline」，修前配偶回读的草稿缺 `residenceIncome`、不等于 `gameDraft(state)`。
  - 945：内容包单测「address changes carry the day and join the assessment next quarter」，修前记为 `2026-03-01`；网页单测「the ending link opens after %s moves and reports mid-quarter」（两位角色，同季搬家未申报、同季搬家并申报、跨季补报后各自离开），修前草稿里有晚于模拟日期的变更与申报。
  - 946：内容包单测「a lapsed Blue Card ends the story with both routes unmet」，修前许可没有截止日、Μ.1 为满足；网页单测「a lapsed Blue Card ending shows both routes unmet」，修前结局为 `['MET', 'NOT_MET']`（临时撤回 `rules.ts` 改动复现）。
  - 947：内容包单测「the spouse keeps the Μ.3 right after her Ο.3 card lapses」，修前 2028-12-01 已以 `overstayed` 结束；网页单测「the spouse plays on after her Ο.3 lapses」。
  - 每个 commit 前跑了 game 与 web 的 typecheck、受影响文件的 ESLint 与 Prettier 检查、两个希腊测试文件。
- 完整验收（HEAD `69b4760d`，即第二次合入 main 后、报告提交前）：`export VITEST_MAX_WORKERS=2` 后 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，整条命令退出码 0。error-report 2、policy-data 23、engine 6,006（既有 1 项按默认跳过）、game 1,376（希腊内容包单测 12 → 14）、web 1,034（希腊网页单测 8 → 14）项通过；构建生成 58 个静态页面，`apps/web/out/greece/game.html` 已导出。（第一次合入后跑的整链在 engine 测试阶段因 main 又有新提交被我中止，没有失败用例；之后重新合入并整链重跑。）
- 浏览器 e2e（上述静态构建）：确认 4482 端口空闲后 `cd apps/e2e && E2E_PORT=4482 npx playwright test tests/game.spec.ts tests/life.spec.ts tests/japan-game.spec.ts tests/greece-game.spec.ts --project=desktop --reporter=line`，31 项全部通过（英国 21、日本 5、希腊 5），退出码 0；服务由 Playwright 自行起停，跑完端口已释放，删除了 `apps/e2e/test-results`。
- 视觉检查：用临时 Playwright 脚本无头截图（脚本放 scratchpad，跑时临时复制进 `apps/e2e/tests`，跑完删除，未入库）。厨房里拌希腊农夫沙拉，第 3 步显示「切番茄黄瓜，放一大块菲达奶酪」（前缀键生效）；配偶存档改到 2029-09-01、许可截止 2028-06-19 后，移民局的 Μ.3 标签为「申请费 €0、制卡 €16、逾期 €50」，费用 −€66，顶栏「居留卡剩余 0 个月」标红，长期居留条「已满足条件」、入籍条「未满足条件」。

### 3. 没做或没验证的

- 947 是规则语义上的取舍，需要统筹确认：配偶不再有 `overstayed` 结局。依据是引擎对希腊公民家属 Μ.3 的判断（卡到期后的保留与逾期费），游戏没有另加规则；如果更希望保留"卡失效即结束"，结局评估里 Μ.3 会与结局矛盾（引擎仍判满足）。配偶卡失效后顶栏剩余月数为 0、快进前仍有到期提醒，不能出境（出境须在卡有效期内），只能递交 Μ.3、离开或等到时间结束。
- 日本 review111-1 风险 2 的另一半没有照做：希腊的申报期限是两个月，周末或节日搬家后，若下一季首个工作日已过期限，补报必然收罚款。游戏没有像日本那样只在"当天还能申报"时提供搬家（原分支同样如此，日期改为当天后结果不变）。
- 试点其他修正（review111-1 建议 1 的厨房提示、结局家具名、抛竿地点，建议 4 的进度条措辞）不在本 brief 的五项里，没有改，见第 4 段。
- 英国 e2e 截图基线未在本机比对（本机 Playwright 忽略截图）；没有跑 a11y spec 和 mobile project。
- 第二次合入后 main 又合入了西班牙完整版页面（`3f9dae44`），本分支没有再合。`git merge-tree` 试合只在 `sw.js` 与 `about-page.test.tsx` 的缓存版本一行冲突，开 PR 前合入时按最后合并的版本号处理即可。

### 4. 发现与建议（范围外，未实现）

- 希腊仍用共用的英国语境文案：没有设 `GameCountry.furnishingNames`，离开或结局时"一点点布置的家"会显示英国家具名，而希腊商店卖的是阳台藤椅、木百叶窗、台灯；没有 `gr.game.kitchenNoIngredients`（空厨房提示仍说池塘与河鲈）；内容包没有 `fishingSpot`（日记写"池塘抛竿"，希腊是防波堤）。照日本 review111-1 建议 1 各加一项即可。
- 希腊进度条 `FUTURE` 用的是 `country.status.FUTURE`「最早 X 满足条件」。希腊路径的 `FUTURE` 是整条路径的状态（其他条件都满足、只差日期），这句话是准确的；日本改措辞是因为日本用的是时间条件的 `timeStatus`。可以保留，但审核时可能会被问到。
- 周末或节日搬家必然逾期的问题（第 3 段）：可在 `actionAvailable` 里只在移民局当天开门、或下一个可玩工作日仍在期限内时提供搬家与退租。

## 审核修正（review108g-1）

审核意见：独立 Claude 只读审核第 1 轮（`review108g-1`，HEAD `6da0e2dd`，结论"需要修改"）；brief：`brief-108d`；实现者：Claude Opus 5.5。问题 1、风险 1–6、建议 1–4 全部处理。共用外壳（`app/game-shell/*`、`GameCountry`）、共用 `game.ts` 与 `content-pack.ts`、英国与日本游戏都没有改动：风险 4 用的是共用外壳已有的可选钩子 `afterQuarter`，建议 1 用的是日本试点加的可选字段 `furnishingNames`、`fishingSpot`。PROGRESS 行号 1060–1069：提交前查过 `origin/main`、全部远端与本地分支和各 worktree 的 `PROGRESS.md`，1000 以上只用了 1000–1007、1040–1047。第 1 与第 3 节里罚款口径的措辞已直接改正；其余与本节不符的说法以本节为准：搬家与退租只在移民局当天能受理申报时提供，再次逾期申报收 `repeatFine`，两位角色的护照有效期覆盖整局。

### 1. 做了什么（按 commit）

| PROGRESS | commit | 对应审核 | 内容 |
|---|---|---|---|
| 1060 | `c1b462eb` `Fix: 希腊蓝卡续期按办理当天判断逾期罚款与补交截止` | 问题 1、建议 4 | `renewalFees` 的逾期月数与 `extend` 的逾期补交截止改按当天 `state.day.date` 判断，与住址申报同一口径。提前递交保留"本季碰到窗口"的季度口径：2026 年 6 月季的工作日 06-09 早于法定窗口起点 07-14，若也按当天判断，2026 年没有一季能按时续期。默认 2026 日历下：2026-09-15（到期日次日）续期收 1 个月逾期罚款，合计 `workFees.permit + print + lateFinePerMonthEur`；2026-12-15 已过逾期补交截止 2026-12-14，移民局不再提供续期，2027-03-01 按 `grRules.expired` 以 `overstayed` 结束、许可截止写为 2026-09-14。续期说明写明"逾期月数与补交截止按办理当天计算，不足一个月按一个月计（PD-150）"，`docs/pending-details.md` 希腊完整版一节登记 PD-150（编号说明见第 4 段）。 |
| 1061 | `6545c3e4` `Fix: 希腊搬家与退租只在移民局当天能受理申报时提供` | 风险 1 | 照日本 review111-1 风险 2：`rent-brighter-home` 与 `leave-brighter-home` 只在移民局开门的工作日、且搬完还够一次申报在 14:30 关门前办完时提供（搬家与申报各 60 分钟，最晚 12:30 搬）；余额条件照旧。两项说明写明"只在移民局当天还能受理时提供，搬完当天就去申报"。 |
| 1062 | `63a568c6` `Fix: 希腊再次逾期申报住址收 repeatFine` | 风险 5 | 罚款由 `lateReport` 算出：今天要报的变更已逾期时，若时间线里已有逾期申报过的变更，收 `changeReporting.repeatFine`，否则收 `firstFine`（SRC-086 第 19(1)、20(1) 条）；标签写"再次逾期"。一次申报同时补报多项逾期变更只罚一次。搬家说明补上再犯金额。 |
| 1063 | `8f319c36` `Fix: 希腊逾期申报住址的罚款计入能否办理` | 风险 6 | `actionAvailable` 对 `report-change` 用当天应缴的罚款（首次或再犯）检查余额；按时申报不收费，照常提供（本条当时余额为负时也不提供按时申报，review108g-2 风险 1 修正后才成立，见下文 1074）。 |
| 1064 | `8f8a5ebc` `Fix: 希腊季末余额不足自动退租时记下住址变更` | 风险 4 | 希腊内容包新增 `afterQuarter`：共用外壳季末自动退租时会写入本季的 `brighter-home-return` 日志，内容包识别后在时间线记一次住址变更，发生日取新一季首日（该季首个工作日在两个月期限内，可按时申报），设 `change-report-due`，再按新时间线重算 `state.result`（外壳在调用 `afterQuarter` 前已评估过一次）。系统事件"搬到更便宜的公寓"本来就带 `moved` 效果，不用改。没有动共用外壳，所以不需要 brief 里的退路。 |
| 1065 | `9e2833bf` `Fix: 希腊角色的虚构护照覆盖整局，长期游玩不因 C-01 卡住` | 风险 3 | 游戏没有换护照的动作，两本虚构护照改为覆盖整局（游戏结束 2036-03-01）。卡里姆的 Μ.1 是完整证件核对：签发须在评估日前 `passport.issueYears` 年内，到期须晚于预计离境日加 `passport.remainingMonths`（SRC-086 第 8(a) 条）；游戏把预计离境日记作当前卡到期日，2035 年续期后为 2038-09-14。所以签发日取开局日 2026-03-01（2036-03-01 的结局评估仍在年限内），到期日取 2039-02-28。晓雯的 Μ.3 与入籍只核对证件有效，到期日改为 2036-04-30。这两组日期是游戏设定，不代表任何国家护照的真实有效期。 |
| 1066 | `54ab2681` `Fix: 希腊补齐家具名、空厨房提示与抛竿地点` | 建议 1 | 照日本 review111-1 建议 1：内容包导出 `grFurnishingNames`（阳台藤椅、木百叶窗、台灯），超市家具标签同源、显示不变，`grCountry.furnishingNames` 让结局"一点点布置的家"用这组名字；新增 `gr.game.kitchenNoIngredients`（蔬菜来自市立菜园的收成或周六菜市，沙丁鱼和金头鲷去港口防波堤钓）；内容包 `fishingSpot` 为"港口防波堤 / the harbour breakwater"，日记写"港口防波堤抛竿 N 次"，旅程写"在港口防波堤抛竿"。 |
| 1067 | `ff0122fe` `Fix: 希腊居留卡提醒如实说明 Ο.3 在游戏里不能续期` | 风险 2、建议 2 | 配偶 Ο.3 失效后游戏继续（与引擎一致，保留，见第 3 段）。季初提醒与快进警告是两位角色共用的一条文案（共用外壳按国家取键，不分角色），改为分别说明：蓝卡在续期期限内可到移民局续期，条件满足后可申请 Μ.1；Ο.3 卡在游戏里不能续期，条件满足后到移民局申请 Μ.3。快进警告去掉"跨过这一天"（卡已失效时到期日早已过去）。中英文同改。 |
| 1068 | `ebb15976` `Fix: 希腊进度条不把不阻止递交的住址申报列为还差` | 建议 3 | `missingRules` 排除 C-06（引擎 `greece-full.ts` 的路径判断排除它），路径为 `MET` 时也不列未满足项。 |
| 1069 | `Docs: 任务 108 审核修正报告（review108g-1）` | 建议 4 | 本节、第 1 与第 3 节罚款口径的措辞改正、PROGRESS。 |

逐条对应：问题 1 → 1060；风险 1 → 1061；风险 2 → 1067（结局行为保留）；风险 3 → 1065；风险 4 → 1064；风险 5 → 1062；风险 6 → 1063；建议 1 → 1066；建议 2 → 1067；建议 3 → 1068；建议 4 → 1060（活动说明与 PD-150）与 1069（报告措辞）。

### 2. 怎么验证的

- 每项先写回归测试并确认失败，再改：
  - 1060：内容包单测「on the 2026 calendar the late fine and late deadline follow the day of filing」，按默认 2026 日历从开局快进到 9 月季与 12 月季。修前 2026-09-15 的标签是不带罚款的"续期欧盟蓝卡"；只撤回补交截止那一行时，2026-12-15 仍列出 `extend`。原有用例「a late renewal pays the monthly fine」（手设到期日 2026-01-14、03-10 办理）按当天计仍是 2 个月，未改。
  - 1061：「moving is offered only while the migration office can take the report」，修前周六仍列出搬家；修后工作日 12:30 可搬、12:31 不可，退租同样，周末都不提供，12:30 搬家后当天移民局仍列出申报。
  - 1062：「a second late address report pays the repeat fine」：第一季搬家、下一季补报收首次罚款，当天退租、再下一季补报。修前第二次的标签仍是 €100。
  - 1063：「a late address report needs the money for its fine」，修前余额差 1 欧元仍列出申报；修后不列，恰好够时可申报、扣到 0。
  - 1064：「a lease that ends on a low balance is a move to report」，修前时间线只有原来那次变更；修后记下 2026-06-01 的变更，`state.result` 等于按新时间线重算的结果，当季申报不收费、下一季 C-06 满足，不申报则下一季不满足。网页单测「the ending link opens after a low balance ends the lease」：自动退租后离开，结局链接经 `readPageResult` 回读无更正提示，草稿、路径与逐项检查和游戏内一致。
  - 1065：「the passports outlast the game, so long play never stalls on C-01」：两位角色从开局到 2036-03-01 每个季首的全部 C-01 都满足（卡里姆按 2035 年续期后的离境日 2038-09-14），2035-12-01 长期居留路径仍为 `MET`。修前卡里姆开局即不满足。
  - 1066：内容包单测「the diary casts a line off the harbour breakwater, not at a pond」，修前日志是"在池塘抛竿"；网页单测「the kitchen hint and ending furniture use Greek wording in %s」（中英文），修前厨房提示等于共用文案、结局家具名是英国的。
  - 1067：网页单测「the card reminders say the Ο.3 cannot be renewed in this game, in %s」（中英文），修前提醒不含 Ο.3；并核对晓雯 2027-12-01（剩 6 个月）时移民局没有可办事项。
  - 1068：网页单测「a late address report does not show as missing, as it does not bar filing」，修前考过 A2、路径 `MET` 时仍列出"Address and identity change notifications"。
  - 每个 commit 前跑了 game（改到网页时加 web）的 typecheck、受影响文件的 ESLint 与 Prettier 检查、对应的希腊测试文件。希腊内容包单测 14 → 21 项，希腊网页单测 14 → 20 项。
- 完整验收（HEAD `ebb15976`，报告提交前）：`export VITEST_MAX_WORKERS=2` 后 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`，整条命令退出码 0（日志末行 `GATE EXIT 0`）。error-report 2、policy-data 23、engine 6,006（既有 1 项按默认跳过）、game 1,383、web 1,076 项通过；构建生成 62 个静态页面，`apps/web/out/greece/game.html` 已导出。
- 浏览器 e2e（上述静态构建）：确认 4488 端口空闲后 `cd apps/e2e && E2E_PORT=4488 npx playwright test tests/game.spec.ts tests/life.spec.ts tests/japan-game.spec.ts tests/greece-game.spec.ts --project=desktop --reporter=line`，31 项全部通过，退出码 0；服务由 Playwright 自行起停，跑完端口已释放，删除了 `apps/e2e/test-results`。
- 视觉检查：临时 Playwright 脚本（放 scratchpad，跑时复制进 `apps/e2e/tests`，跑完删除，未入库）无头截图。配偶存档改到 2028-09-01（Ο.3 已于 2028-06-19 失效）后的快进确认框显示「居留卡有效期到 2028-06-19，快进会直接过完这一季。蓝卡在续期期限内可以先去移民局办事处续期；Ο.3 卡在游戏里不能续期，条件满足后可以在那里申请 Μ.3。」，红框内两行排版正常；蓝卡角色补上三件家具后离开希腊，结局"一点点布置的家"显示阳台藤椅、木百叶窗、台灯。英文快进框的截图脚本没走通（继续存档后还有一张卡片未关），英文文案由网页单测核对。

### 3. 没做或没验证的

- 风险 2 的结局取舍仍需统筹确认（同上一节第 3 段 947）：配偶 Ο.3 失效后游戏继续、没有 `overstayed` 结局。本轮只改提醒文案，没有改规则。
- 搬家与退租的"当天能申报"没有算从家走到移民局的时间（与日本做法相同）。浏览器里户外每 2 秒走 10 分钟游戏时间，接近 12:30 才搬家的玩家走到时可能已来不及申报；单测里是直接进门。
- 季末自动退租若发生在 3 个月或 6 个月探亲途中，记下的变更（新一季首日）对应的工作日玩家还在国外，回来后已过两个月期限，只能逾期补报。没有为这一组合另做处理。
- Μ.3 的逾期费（Ο.3 到期满一年后递交）仍按季首日期判断，与引擎 GF-06 按评估日的说明一致；晓雯的卡到期日固定为 2028-06-19，2029 年 6 月季的工作日 06-12 早于 06-19，季首与当天的判断在可玩日期里不会分歧，所以没有改。
- 圣诞礼金事件的选项"存起来，留给续卡和考试"对配偶也写"续卡"，是泛指存钱用途，没有改。
- 本轮没有合入 main：main 在 `3f9dae44` 之后又合入了加拿大完整版页面（`e84896a8`），开 PR 前需要再合一次，冲突预计仍只在 `sw.js` 与 `about-page.test.tsx` 的缓存版本一行。
- 英国 e2e 截图基线未在本机比对（本机 Playwright 忽略截图）；没有跑 a11y spec 和 mobile project；英文快进框没有截图。

### 4. 发现与建议（范围外，未实现）

- PD 编号：brief 要求"接着希腊已有的编"，但希腊试点用 PD-101–107、109，完整版用满了 PD-300–319，PD-320 起属于爱尔兰等其他国家（马来西亚分支用到 PD-431）。查过 `origin/main`、全部分支与 worktree，PD-150–154 从未使用，所以取 PD-150，放在希腊完整版一节末尾。若统筹另有编号约定，改号只涉及 `pending-details.md`、`hooks.ts` 注释与 `town.ts` 续期说明三处。
- 卡里姆的护照现在是约 13 年有效期的虚构证件。更贴近现实的做法是加一个换护照动作，按引擎的 `passport-renewed` 变更处理（可在下次换卡时申报），或在 policy-data 明确长期居留申请的离境基准（PD-300），游戏就不必把预计离境日记作卡到期日。
- 日本与希腊的"当天能申报"都没有步行余量；如需要，可以在各国 balance 里加一个游戏设定的步行分钟数（日本 review111-2 已提）。
- 共用外壳的居留卡提醒与快进警告按国家取文案，同一国家的两位角色只能共用一句；若以后角色之间的续卡方式差别更大，可以让 `visaStatus` 带一个可选的文案键。
