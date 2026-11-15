# 《移民生活》内容盘点与扩展调研

调研日期：2026-11-15。任务：12.0b。基线：`codex/12.0b-astra`，`97b1255a428ef6b9d1088ab9a53eedd45bfee560`。本报告只提出后续任务，不修改玩法、政策、素材或现有文案。

**建议先把已有生活变得可见、可参与、能留下痕迹，再增加内容总量。** 当前并非只有卡片和空地图：有十二位 NPC、分角色的家庭、五阶好感剧情、菜地、钓鱼、厨房、节日和日记。最明显的断层是：生活消费和剧情已经记录在状态里，但家与小镇很少因此改变；许多活动仍是选择后读一句结果。

本次复算的完整十年模拟中，勤快策略平均听到约 584–590 句不同台词、看到约 36–37 段好感剧情；快进策略没有主动聊天，因而没有这部分体验。两者不能用一个“每局字数”概括。普通卡片的单局曝光远小于库容量，新增卡片也未必能被玩家遇到。

## 1. 现状盘点

### 1.1 范围、方法与口径

读取四份指定阶段计划（Phase 8、9、10.5、11），补读 Phase 10、12；检索 Phase 7–11 的 29 份任务报告，按现行源码核对其中的发现与建议。计数覆盖 `packages/game/src/` 的 22 个文件（21 个 TS、1 个风格指南）、`apps/web/app/game/` 的 11 个文件和 `apps/web/public/game/` 的 48 个文件。

- **内容计数**：临时 Vitest 文件导入运行时数组，统计展开、追加后的对象，避免把 `.map()`、`push()` 或数组组合漏掉。普通事件 ID、好感事件 ID 等按实际 ID 去重，并断言跨库事件 ID 无重复。不是按源码中 `id:` 出现次数计数。
- **角色口径**：角色专属卡与公共卡分开；NPC 用 `characters` 过滤；剧情用 `heart.npc` 对应可用 NPC。潜在库容量不是单局可达保证，前置、互斥、时段、人物离开和玩家路线都会限制曝光。
- **实际曝光**：原样提取 `packages/game/test/balance.test.ts` 的 `median`、`play()` 及其 imports，增加只读汇总。三角色 × 三策略 × 种子 1–20，共 180 局；一份测试文件、一个 worker 串行执行。没有改测试策略或游戏随机数。
- **覆盖性质**：这是完整内容数组的结构盘点及相关机制阅读，**不是全部双语句子的逐句文学审稿**。源码能证明素材接线与动画实现，不能证明实际画面质量、流畅度或听感。本任务没有启动浏览器、截图、试听或人工试玩。
- 下文天数、好感、物品数量及建议规模都是**游戏设定或研发规模**，不是政策数字。政策金额、门槛、实施日期不在本任务复核或新增；交 12.0a。

主要复算命令：

```sh
pnpm --filter @uk-immigration/game exec vitest run test/content-audit.tmp.test.ts --maxWorkers=1
```

结果：1 个文件、10 个统计检查通过，退出码 0；180 局全部结束，耗时 120.40 秒。临时文件在统计后删除。附录 A 保留可重建的统计代码与提取方法，不要求接手者取得 `/tmp` 中间结果。

### 1.2 三角色的内容库

| 口径 | 林遥 `skilled-worker` | 陈嘉宁 `hong-kong-bno` | 索菲娅 `family-partner` |
|---|---:|---:|---:|
| 角色专属普通卡 | 70 | 80 | 80 |
| 公共普通卡 | 190 | 190 | 190 |
| 莉娜离开后的来信（公共、非 heart） | 1 | 1 | 1 |
| 普通随机池小计 | **261** | **271** | **271** |
| 上述池中一次性 / 可重复卡 | 241 / 20 | 251 / 20 | 251 / 20 |
| 上述池的选择总数 | 522 | 542 | 542 |
| 定时政策故事（另计） | 4 | 3 | 3 |
| 开局卡 / 系统压力卡（另计） | 1 / 4 | 1 / 4 | 1 / 4 |
| 非好感卡潜在合计 | **270** | **279** | **279** |
| NPC：常驻 + 家庭 | 8 + 周沅 = 9 | 8 + 文舒、乐言 = 10 | 8 + 杰米 = 9 |
| NPC 台词对象（中英各有对应文本） | **988** | **1,061** | **987** |
| 好感剧情 | **45** | **50** | **45** |
| 地点 / 静态地点行动 | 16 / 37 | 16 / 37 | 16 / 37 |
| 物品 / 食谱 | 39 / 8 | 39 / 8 | 39 / 8 |
| 节日种类 / 节庆行动 ID | 5 / 8 | 5 / 8 | 5 / 8 |
| 公告 / 成就 | 30 / 23 | 30 / 23 | 30 / 23 |
| 玩家结局类别 / 本角色定居结尾 | 5 / 1 | 5 / 1 | 5 / 1 |

全库有 **492 个不同事件对象**：190 公共 + 230 角色专属 + 1 莉娜来信 + 4 政策故事 + 3 开局 + 4 系统 + 60 好感。不能把三角色表逐行相加来报全库总量。每个角色的专属普通卡目前均为一次性、每卡两个选择。

来源：`game.ts:258` 的池组合；`events/common.ts` 及其导入的 additions / town / places / days；三份角色导出；`npcs.ts` 追加家庭剧情后的 `heartEvents`；`events/policy.ts`。林遥 **70** 张专属卡是当前值，不沿用早期计划的“每人 80 条”目标。

### 1.3 渠道、季节与触发条件

以下三张表都只统计 **261 / 271 / 271 普通随机池**，不混入好感、系统、开局和定时政策故事。

| 渠道 | 林遥 | 陈嘉宁 | 索菲娅 | 对曝光的含义 |
|---|---:|---:|---:|---|
| 早晨 `morning` | 46 | 66 | 54 | 易由逐日／快进触达 |
| 来信 `letter` | 26 | 29 | 27 | 与读信、睡前送达有关 |
| 电话 `phone` | 21 | 13 | 13 | 受时段与当天推进影响 |
| NPC 对话 `npc:*` | 24 | 30 | 50 | 要主动找到并与该人聊天 |
| 地点 `place:*` | 144 | 133 | 127 | 要到相应地点且满足营业、时段等条件 |

索菲娅有 36 张专属卡走 `npc:jamie`，林遥有 10 张走 `npc:yao-flatmate`，嘉宁有 16 张走两位家人。家人不在家或玩家只快进，会影响角色故事曝光。地点卡不是“到了任何地方都会出现”；例如三角色 `place:home` 分别为 32 / 36 / 32，`place:work` 为 27 / 13 / 13，`place:green` 为 23 / 21 / 23。

| `season` 限定 | 林遥 | 陈嘉宁 | 索菲娅 |
|---|---:|---:|---:|
| 冬（1） | 19 | 24 | 22 |
| 春（2） | 18 | 19 | 21 |
| 夏（3） | 16 | 19 | 20 |
| 秋（4） | 25 | 29 | 26 |
| 不限季节 | 183 | 180 | 182 |

| 显式触发条件（同卡可属多行，不能求和） | 林遥 | 陈嘉宁 | 索菲娅 |
|---|---:|---:|---:|
| `requires` 前事旗标 | 70 | 66 | 77 |
| `forbids` 互斥旗标 | 31 | 30 | 34 |
| 属性区间 | 3 | 3 | 8 |
| 游戏年份区间 | 40 | 56 | 47 |
| 许可剩余时间 | 1 | 0 | 1 |
| 工作日／周末等日子类型 | 11 | 1 | 1 |
| 天气 | 5 | 3 | 3 |
| 节日 | 15 | 15 | 15 |
| NPC 好感条件 | 11 | 11 | 11 |
| 时钟区间 | 25 | 12 | 12 |
| `when.route` / `when.flag` / `when.item` | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| 无显式 season / requires / forbids / when | 65 | 67 | 58 |

“无显式条件”仍受渠道、抽取权重和一次性限制；`when.flag = 0` 不代表没有旗标剧情，因为前事主要写在 `requires` / `forbids`。好感阈值也不包含在上述 NPC 条件行。送达逻辑见 `game.ts:331–479,1613–1726`：当前已按实际日子和地点检查，不能继续沿用 Phase 9 初版“所有漏掉的地点卡都在睡前弹出”的描述。

### 1.4 人物、台词与关系结构

| NPC | 所属 | 台词对象 | 好感剧情 | 送礼回应 |
|---|---|---:|---:|---:|
| 玛格丽特、阿德、海伦、普里娅、戴夫、拉赫曼、加雷思 | 三角色共用，每人 | 114 | 5 | 4 |
| 莉娜 | 三角色共用 | 115 | 5 | 4 |
| 周沅 | 林遥 | 75 | 5 | 4 |
| 杰米 | 索菲娅 | 74 | 5 | 4 |
| 许文舒、陈乐言 | 陈嘉宁，每人 | 74 | 5 | 4 |
| **全库合计** | 12 人 | **1,210** | **60** | **48** |

台词对象按 ID 计数，一条中英对照算一条；送礼回应和好感正文另列，不重复塞进 1,210。常驻八人的台词合计 913，家庭四人合计 297。其中节日台词共 72 条（玛格丽特、阿德、海伦各 9，其余每人 5）；每人已有 9 条 `recent-*` 近况回应；八镇民和周沅共 9 条初见介绍，三位家人没有陌生人式自我介绍。

好感剧情沿 2 / 4 / 6 / 8 / 10 心推进，前阶先完成、非节日聊天触发、一天最多一段；部分还限制时钟或工作日／周末。已存在选择旗标和分支回访，不应再把“给 NPC 一条完整弧线”当作从零建设。莉娜有留下／离开两条结果：留下可继续十心剧情，离开后通过 `letter-lina-10` 回信，后者是普通来信而非 heart 对象，不能当作某个单局能同时读到的两段十心剧情。

当前风格指南要求具体生活处境、双语同步、旁白“你”、选择有眼前代价、人物声音有区别，且不把职业和国籍写成每句话的标签。下一批内容应继续遵守这些现成标准，重点补**共同做事与后续可见变化**，无需再整批重写人物声音。

### 1.5 地点与行动：有菜单不等于有独立玩法

| 地点 | 静态行动数 | 当前内容；另行调用的生活功能 |
|---|---:|---|
| 家 | 5 | 明亮住处租／退、休息、午睡、自学；另有睡觉、读信、做饭、吃东西及家人聊天 |
| 公司 | 2 | 上班、加班 |
| 语言学校 | 3 | 上课、英语考试、Life in the UK |
| 图书馆 | 1 | 自学；人物、地点卡和公告关联事件 |
| GP | 1 | 看病；前台 NPC 和地点卡 |
| 酒吧 | 2 | 放松、公告限定的 pub quiz |
| 咖啡馆 | 1 | 咖啡；人物和地点卡 |
| 小店 | 3 | 阅读椅、厚窗帘、台灯；另有按季购物 |
| 市政厅 | 1 | 查看两栏评估 |
| 签证中心 | 2 | 续签、申请定居 |
| 车站 | 4 | 三种出国时长、离开英国 |
| 菜地 | 1 | 租地；另有种、浇、收 |
| 池塘 | 0 | 钓鱼经独立 API 与客户端反应小游戏，**不是没有玩法** |
| 公告栏 | 1 | 读本季公告 |
| 村绿地 | 8 | 通用逛节日、三种节日专属动作、四种作物参赛 ID |
| 长椅 | 2 | 坐一会儿、报名当季徒步私教班 |
| **合计** | **37** | 三角色共用的定义数，不是某一天全部可选 |

`activities()` 还按钱、时间、当前旗标、物品与引擎结果筛选。没有“当前角色独占的地点／静态行动表”，但家庭、事件、起始状态不同，实际可用集合会不同。聊天、送礼、购物、种植、浇水、收获、钓鱼、料理、进食、读信、睡觉、快进都不属于 37 条 `locationActions`，不混算成同一指标。

| 子系统 | 当前容量与结构 | 最薄处 |
|---|---|---|
| 物品 | 39：8 作物、8 种子、6 鱼、2 垃圾、14 食物、1 礼物；可食／可送功能互有交叉 | 家具是 flags，不是物品；没有发现／纪念品展示闭环 |
| 菜地 | 6 格；8 种作物，季节种子、成长、浇水／雨水、过季枯萎；收成用于吃、做饭、送礼、参赛 | 有生产循环，缺公共菜园持续变化；不应自动扩为赚钱经营 |
| 钓鱼 | 6 鱼 + 2 垃圾；天气、季节、时段影响鱼池；客户端咬钩反应 | 没有鱼类收藏展示；鱼种共图，缺挥竿／收竿表现 |
| 厨房 | 8 食谱：饺子、烤甜玉米、芜菁汤、玉米汤、烤土豆、沙拉、鱼配土豆、草莓酱 | 选择配方后直接结算；缺共餐、人物偏好与家中成品表现 |
| 节日 | 5 种；每季一个特别日，秋季两种按年交替，不能说每年都有 5 个节日 | 当天有活动，但事前准备、次日生活和跨年记忆薄 |
| 节庆操作 | 8 个行动 ID 实际为：1 通用动作 + 3 专属活动 + 同一菜地评比的 4 种作物入口；夏日评比有 3 档结果 | **不是 8 个小游戏**；包饺子、彩带、灯笼仍是菜单动作 |
| 节庆文案 | 每节 3 条通用结果轮换；彩带、灯笼各 3 条；另有节庆卡和 NPC 节日台词 | 文本轮换已做，不能当无结果变化；可扩展行动而非再换措辞 |
| 公告 | 30 条＝不限季 10 + 每季 5；每季抽 2–3 条；已有捡垃圾、寻猫、合唱、交换、散步、缝补的关联卡 | 多数活动还缺可主动完成并看见结果的持续过程 |
| 结局／成就 | 5 个 EndingId；定居结尾每角色 1 段 + 其余 4 段共用＝全库 7 段固定结尾；23 成就，其中 `lifeAchievements` 8 项 | `narrative()` 拼接朋友、收成、节日、行为与事件回忆，组合数不宜虚报成独立结局数；结局尚未回收家具和公共项目 |

`balance.ts` 已有聊天加好感、未见面衰减、生活支出、属性舒适区磨损、住房／家具／徒步持续效果。经济不是“没有消费”，问题在消费回报的生活表达。当前时间结构为游戏十年、四十季、每季三个代表日；并非模拟现实每一天。扩展应沿这一结构，不把每日打卡或真实等待加入必经流程。

### 1.6 一局实际能见多少：180 局复算

**策略含义**：`fast-forward` 按默认作息快进，必要时尝试续签；`active` 每天随机三四项行动，加最多五次聊天、购物／种菜／料理等；`casual` 每天随机访四至六处，只和遇到的人聊天、少量送礼。三者均避开选择中直接犯罪或主动结束的选项，政策新闻选第一项，未主动申请定居。模拟会调用核心 API，**没有地图步行耗时和真实点击摩擦**；active 更可直接与可用 NPC 交谈，不能当作真实玩家留存或行为分布。

**指标定义**：非好感卡包括普通随机卡、开局、系统和政策卡，按已解决日志 ID 去重；好感按 heart ID 去重；台词按 `heard` 中的 line ID 去重。卡重复率为每局 `1 − 不同非好感卡数 / 非好感卡出现次数`，台词同理，下表取每局比率的均值，非“均值再相除”。选同卡的另一选项仍算同卡，不能据此判断语义／句式重复。

先列**全部运行**，防止只选择活到最后的样本。每行 N=20，未满四十季的运行全部为 `overstayed`；满四十季全部为 `timeout`，是这些策略不申请定居的结果，不是现实获批结论。

| 角色／策略 | 完整十年 N/20 | 结束季数范围 | 不同非好感卡均值 | 好感剧情均值 | 不同台词均值 | 卡重复率 | 台词重复率 |
|---|---:|---|---:|---:|---:|---:|---:|
| 林遥／快进 | 20 | 40–40 | 62.90 | 0 | 0 | 0.08% | 无聊天 |
| 林遥／勤快 | 20 | 40–40 | 45.30 | 35.85 | 590.25 | 0.31% | 1.38% |
| 林遥／随意 | 19 | 32–40 | 37.60 | 36.00 | 366.15 | 7.95% | 0.00% |
| 嘉宁／快进 | 16 | 36–40 | 73.05 | 0 | 0 | 0.99% | 无聊天 |
| 嘉宁／勤快 | 19 | 36–40 | 44.45 | 37.30 | 582.10 | 1.75% | 2.00% |
| 嘉宁／随意 | 7 | 26–40 | 38.95 | 35.30 | 365.30 | 5.37% | 0.00% |
| 索菲娅／快进 | 14 | 26–40 | 63.10 | 0 | 0 | 3.59% | 无聊天 |
| 索菲娅／勤快 | 11 | 26–40 | 44.00 | 36.00 | 538.25 | 5.75% | 1.69% |
| 索菲娅／随意 | 14 | 26–40 | 41.30 | 35.25 | 354.20 | 6.06% | 0.01% |

再看**完整十年子集，共 140 局**。括号为该子集最小–最大值；均值保留两位，避免把早退者算成完整十年体验。

| 角色／策略 | 不同非好感卡 | 好感剧情 | 不同台词 | 卡重复率 | 台词重复率 | 去重中文汉字均值 |
|---|---|---|---|---:|---:|---:|
| 林遥／快进 | 62.90（55–70） | 0 | 0 | 0.08% | — | 2,024 |
| 林遥／勤快 | 45.30（38–51） | 35.85（32–37） | 590.25（582–599） | 0.31% | 1.38% | 21,554 |
| 林遥／随意 | 38.21（29–45） | 36.26（33–40） | 368.53（317–420） | 8.36% | 0.00% | 16,039 |
| 嘉宁／快进 | 73.75（69–82） | 0 | 0 | 0.46% | — | 2,184 |
| 嘉宁／勤快 | 44.58（34–56） | 37.37（36–41） | 584.42（561–600） | 1.49% | 2.08% | 21,361 |
| 嘉宁／随意 | 41.00（33–49） | 37.14（33–41） | 416.29（337–487） | 5.08% | 0.00% | 17,097 |
| 索菲娅／快进 | 67.00（59–71） | 0 | 0 | 0.82% | — | 2,034 |
| 索菲娅／勤快 | 46.64（40–49） | 36.00（36–36） | 584.09（573–597） | 2.21% | 2.13% | 21,173 |
| 索菲娅／随意 | 42.71（38–49） | 36.50（33–41） | 377.57（315–433） | 4.59% | 0.02% | 16,206 |

汉字统计沿用现有测试：只计实际听过的台词、看过的事件标题／正文、好感标题／正文、读过的公告中的 `Script=Han`，按文本去重；**不含选项、note、重复阅读、菜单、行动结果与结局，不是总阅读字数或游玩分钟**。快进和随意脚本未执行读公告行动，其公告计数为零；这不证明界面把公告藏住了。勤快三角色完整十年平均读到不同公告 20.25 / 19.58 / 20.64 条。

可支持的判断：

1. **文字库尚未成为单局瓶颈。** 勤快策略完整十年只见约 45 张不同非好感卡，相对于潜在 270 / 279 / 279 张库约六分之一；台词重复约 1–2%。这是脚本路径下的曝光，不是全条件可达性证明。应先改善内容与地点／人物行动的联系。
2. **快进与日常玩法是不同体验。** 快进已有每年约六七张不同卡，达到上一轮密度方向，但不主动交谈，零好感场景是策略结果。可以让玩家理解逐日玩法的收获，不应未经决定把快进强制改成聊天队列。
3. **后半程还会见新卡，但缺少世界成长的可见承接。** 完整十年勤快策略前五年／后五年新增不同非好感卡均值依次为：林遥 25.85 / 19.45，嘉宁 25.53 / 19.05，索菲娅 24.36 / 22.27。不能声称后五年“完全没内容”；应给现有经历一个持续目标和场景变化。
4. **提前结束不可忽略。** 40/180 局未完成十年，嘉宁随意策略尤其明显。这里没有进一步归因到经济、提醒或操作设计，也不能据此宣称真实玩家逾期率；若后续扩大开支，先复用相同策略检查早退与负债，避免以花钱更多掩盖体验恶化。
5. **数量去重不能替代内容评审。** 不同 ID 仍可能有类似处境和两选一结构；已有风格指南与最终盲测证明做过声音修订，本轮不重新宣告整体通过或失败。

### 1.7 美术、地图、界面与声音

资产存在性由递归文件计数、PNG 尺寸、地图 JSON 和 `scene.ts` / `session.ts` / `sound.ts` 的接线核对。没有根据文件存在推断视觉验收通过。

| 类别 | 当前实物 | 实现与限制 |
|---|---|---|
| 总目录 | 48 文件：34 PNG、10 OGG、2 JSON、1 MD、1 TXT | 未发现另存的整包候选目录 |
| 地图 | town 56×40、home 18×13；tile 16×16 | town 有 16 地点、16 锚点、6 地块、11 灯、1 出生点；home 有床／厨房／书桌／信箱／出口五触发点 |
| 人物 | 15 PNG＝3 玩家 + 8 镇民 + 4 家庭，均 64×48 | 六套原始造型重排／调色；四向行走，头像复用 sprite，没有独立表情立绘 |
| 作物 | 8 PNG | 每张五个生长阶段加物品图一格，实际用于菜地 |
| 物品 | 6 分类 PNG：茶、饼干、花、蛋糕、鱼、菜品 | 已非全部共图；鱼种共图、熟食共图，垃圾等走通用兜底 |
| 其他 PNG | 外景 tiles、室内 tiles、通用 item、heart、spark，各 1 | 通用图有接线，但并非每局必定出现 |
| BGM | 5 OGG | 四季各一首，另有一首共同节日曲 |
| SFX | 5 OGG | 脚步、说话、菜单、金币、成就；人物说话使用同音源调速，不是配音 |

素材来源以仓库 [`assets/ATTRIBUTION.md`](../../apps/web/public/game/assets/ATTRIBUTION.md) 和 `LICENSE.txt` 登记为准，均标为 CC0 1.0；本轮没有重新做上游许可证审计：

| 素材包 | 作者／当前用途 | 登记的上游出处 |
|---|---|---|
| Roguelike Modern City | Kenney；外景 | [OpenGameArt](https://opengameart.org/content/roguelike-modern-city-pack) |
| Roguelike Indoor | Kenney；室内与通用图 | [OpenGameArt](https://opengameart.org/content/roguelike-indoor-pack) |
| RPG Urban Pack | Kenney；人物 | [OpenGameArt](https://opengameart.org/content/rpg-urban-pack) |
| Farming crops 16x16 | josehzz；作物、花 | [OpenGameArt](https://opengameart.org/content/farming-crops-16x16) |
| ninja-adventure | Pixel-boy／Sparklin Labs；音乐、SFX、特效、鱼和菜品 | [GitHub](https://github.com/sparklinlabs/superpowers-asset-packs/tree/master/ninja-adventure) |
| Infusions Icons | Fleurman；茶杯 | [OpenGameArt](https://opengameart.org/node/77729) |
| Almost Weapons Icons | Fleurman；饼干 | [OpenGameArt](https://opengameart.org/node/77730) |
| Foodies | maruki；蛋糕 | [OpenGameArt](https://opengameart.org/content/foodies) |

不是旧版忍者村图块；Phase 8 的 Zelda-like 计划素材不能当作当前实际素材。只有家有室内地图，其余建筑已有外观，进去打开 React 菜单，这是既定取舍，不是十一个空白占位框。

具体表现缺口与已有能力：

- **最明确的缺口：家中消费不可见。** 核心设置 `furnished-*`、`brighter-home` 并结算持续效果；当前 `scene.ts` 没有读取这些旗标，`home.json` 固定。购买前后没有对应家具或光照变化。见 `locations.ts:112`、`game.ts:943–953`。
- **户外并非都只有标签。** 公告栏在 decor 的 `(33,29)` 有 GID 36、触发格是 `(33,30)`；长椅有图块、池塘有水面、菜地有成长 sprite。普通日村绿地中心附近 decor 为空，节日才绘制摊位。辨识度仍应由 Fable 看画面判断。
- **动画已经存在。** 人物四向动作、NPC 按作息寻路、雨雪粒子、昼夜遮罩／窗光／路灯、节日摊位与彩灯、篝火／烟花、飘字／心形／收获火花均有实现（`scene.ts:126–135,514–586,623–653,828–853,954–1002`）。没有小动物。
- **四季景观仍薄。** 当前同一城镇地图没有按 quarter 更换树叶／地形颜色；变化主要来自天气、节日、作物和音乐。不能将旧计划“四季换色”当成当前已实现效果。
- **有音乐与操作声，没有独立环境音。** 未发现雨声、鸟鸣、水声、风声或室内人群声文件／调用。默认静音，用户手势解锁，记忆开关，页面隐藏暂停；这些是代码事实，未试听音量与循环。
- **钓鱼不是空菜单。** 已有 CSS 浮标和咬钩窗口；缺的是挥竿／收竿、鱼种等表现。pub quiz 等没有独立题目交互。不要把这些与尚未实现的小游戏混成一个数量。
- **结局不是空白页。** 已有叙事、成就和两栏评估；尚无与家、朋友、纪念物对应的视觉回忆构图（`game-view.tsx:771–842`）。

## 2. 同类游戏对照

大型长线生活模拟、人物驱动的 Spiritfarer 与小体量的 A Short Hike／Unpacking 应分开看。目标不是复制它们的总内容量，而是借鉴它们如何让有限动作产生记忆。以下为官方文字／开发者说明支持的机制；本轮没有亲自试玩这些游戏，建议列为设计推论。

| 方面 | 它们怎么做 | 我们已有／缺什么 | 本项目可采用的最小做法 |
|---|---|---|---|
| 日常循环 | Stardew Valley 把耕种、技能与社区连起来；Animal Crossing 将采集、交谈、装饰放在日夜季节中；Spiritfarer 的劳动服务于乘客的具体需要。[星露谷官方](https://www.stardewvalley.net/about/)、[任天堂 Explore](https://animalcrossing.nintendo.com/new-horizons/explore/)、[Spiritfarer 开发者文章](https://blog.playstation.com/2020/08/18/spiritfarer-the-cozy-management-game-about-dying-sets-sail-today/) | 已有时钟与多个生活循环，缺“我今天为何出门、做完后谁会记得”的联结 | 做一条短生活链：下班取物→顺路帮邻居→晚间共餐，允许跨代表日完成 |
| 收集与长期目标 | Animal Crossing 用图鉴、博物馆和 Nook Miles 让发现可记录、可展示；Stardew Valley 的社区中心给公共目标。[任天堂 Explore](https://animalcrossing.nintendo.com/new-horizons/explore/)、[Play Nintendo 指南](https://play.nintendo.com/news-tips/tips-tricks/animal-crossing-new-horizons-discover-tips/)、[星露谷官方](https://www.stardewvalley.net/about/) | 39 物品、23 成就已有；缺收藏展示与共同建成的地方 | 先用现有鱼、菜谱做小型生活记录册；一个公共棚屋／花坛项目改变场景，不另开大经济系统 |
| 人物关系深度 | Stardew Valley 有作息与关系场景；Spiritfarer 用偏好、请求和照顾动作承载关系；The Sims 4 用性格与 aspiration 区分角色。[星露谷官方](https://www.stardewvalley.net/about/)、[开发者文章](https://blog.playstation.com/2020/08/18/spiritfarer-the-cozy-management-game-about-dying-sets-sail-today/)、[The Sims 4 Features](https://www.ea.com/games/the-sims/the-sims-4/features) | 五阶剧情、分支回访已做；缺更多两人实际共同活动、NPC 自己的后续变化 | 在两位现有 NPC 上试做共同活动与可见纪念物；先修当前状态与历史旗标混淆，不加恋爱系统 |
| 季节与节日 | Animal Crossing 的可捕获内容随季节和时段变；The Sims 4 **Seasons 扩展包**把天气、家庭日程与节日传统相连。[任天堂 Explore](https://animalcrossing.nintendo.com/new-horizons/explore/)、[EA Seasons 官方说明](https://www.ea.com/ea-studios/motive/news/seasons-fall-winter) | 已有五节、专属食品、事件、对白与结果轮换；准备和散场以后薄，场地日常变化少 | 先把一个节日做成准备→共同活动→下次见面的回访；雨天有室内替代，不全靠属性惩罚 |
| 家与装饰 | The Sims 4 可建造与布置家；Animal Crossing 允许室内外摆放；Unpacking 用搬家时带来、留下、放置的物件讲人生。[EA Features](https://www.ea.com/games/the-sims/the-sims-4/features)、[任天堂 Explore](https://animalcrossing.nintendo.com/new-horizons/explore/)、[Unpacking 官方](https://www.unpackinggame.com/) | 有家和三种家具消费，却无购买后的场景变化 | 固定位置显示已有家具，再加少量有来历的物件；暂不需要自由建造或家具旋转编辑器 |
| 小游戏 | Spiritfarer 的工作站小游戏承担加工和照料；A Short Hike 在登山途中允许钓鱼、游泳和停下来探索。[开发者文章](https://blog.playstation.com/2020/08/18/spiritfarer-the-cozy-management-game-about-dying-sets-sail-today/)、[A Short Hike 官方 press kit](https://www.ashorthike.com/press/index.html) | 钓鱼已有反应操作；厨房、quiz、包饺子主要是按钮结算 | 只深化一个已有活动，产物能送人或带回家；保留简单完成方式，不用反应失败阻断剧情 |
| 惊喜事件 | Stardew Valley 的部分夜间事件会留下物件或引出后续；A Short Hike 通过绕路遇人、寻宝和互助提供发现。[社区 wiki：Random Events](https://stardewvalleywiki.com/Random_Events)、[官方 press kit](https://www.ashorthike.com/press/index.html) | 普通事件多，少有先看见地图变化再参与的惊喜 | 先从已有寻猫／缝补公告做场景状态与回访；新事件少而具体，不全部弹窗抢断移动 |
| 结局与成就 | Spiritfarer 把照料推进到人物告别；Unpacking 用阶段搬家和物件回收人生；The Sims 4 用自选 aspiration／技能奖励引导生活。[Thunder Lotus 官方](https://thunderlotusgames.com/games/spiritfarer/)、[Unpacking 官方](https://www.unpackinggame.com/)、[EA Help Skills](https://help.ea.com/en/articles/the-sims/the-sims-4/skills/) | 已有动态日记和成就，但结尾侧重文字拼接；许多家中／社区经历无视觉落点 | 结局回收实际朋友、活动与纪念物，允许“离开也有完整的一段生活”，不把定居等同人生总分 |

用户提到的《寒霜启示录》官方商店说明有岗位分配、居民健康与心情管理，也包含联盟竞争。可以借鉴**设施与人的状态之间可见的因果**，例如工作时有人在忙、病后确实休息；没有理由因此引入战力、联盟或付费等待。[Whiteout Survival 官方 Google Play 页](https://play.google.com/store/apps/details?hl=en-US&id=com.gof.global)

来源核验说明：均于调研日读取正文；Nintendo Explore 的文本工具超时后用 HTTP 文本读取成功。Spiritfarer 的 PlayStation Blog 文章作者为创意总监 Nicolas Guérin，定位是动机、工作站与人物写作；Unpacking 用官方 features；A Short Hike 用 Description／Features；Sims 的季节示例明确属于扩展包，不混称基础版；随机夜间事件用社区 wiki，仅借机制、不采用概率。宣传页能支持功能存在，不能证明后期体验质量。

## 3. 真实生活素材库

下面“素材事实”由链接来源支持，“可落地形式”是原创设计提案，不声称代表所有移民经历。来源核验日不等于游戏故事发生日。**先确定小镇所在司法辖区与人物当时处境**：尤其 Right to Rent 只适用于 England；不能因为现实用户住在 Cardiff 就推定虚构小镇在 Wales，也不能把 England 的 GP／学校说明泛化为全英国。

本库不引入政策金额、年限、年龄门槛或生效日期；流程若进入正式内容，由 12.0a／后续 sol 任务确认时间版本与必要 SRC 定位。本轮只写本报告，不修改 `SOURCES.md` 或 `pending-details.md`。这里的行政服务差异是已知地域边界，不是新发现的政府未定政策。

| ID | 一句素材与来源／定位 | 可落地形式、与现有内容的衔接 |
|---|---|---|
| L01 | 不同银行／账户的开户材料要求不同，身份和地址资料是常见准备内容。England 指南：[Citizens Advice，How to open an account](https://www.citizensadvice.org.uk/debt-and-money/banking/getting-a-bank-account/) | **事件／人物**：整理第一封地址信或换账户，与熟人核对资料；已有 `common-duplicate-payment` 可作后续。不能强加“缺某张账单永远无法开户”，也不让已在英工作角色突然没有任何银行账户 |
| L02 | Joint account 可用于同住者或伴侣管理家庭账单。同页 `Joint accounts`。[Citizens Advice](https://www.citizensadvice.org.uk/debt-and-money/banking/getting-a-bank-account/) | **家庭处境**：共同账本与各自预算，两种合理安排对应不同后续对白；不将联名账户设为关系进度必经项 |
| L03 | England 的 GP 注册不要求身份证明、住址证明或 immigration status 证明；诊所仍有接收范围等条件。[NHS，What you need to register／Who can register](https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/) | **地点／事件**：认识普里娅、填注册表、收到确认，澄清“必须等账单”的误会；与现有 GP 接待场景接续，不把材料不足写成健康惩罚 |
| L04 | 药剂师可以提供小病和用药咨询，需要时转介医护。England 服务页：[NHS，Advice from a pharmacist](https://www.nhs.uk/nhs-services/pharmacies/how-pharmacies-can-help/) | **地点／人物候选**：邻里药房与熟悉的药剂师；先做现有地点中的情节或说明，再决定是否新增建筑，不做诊断题或药物疗效计算 |
| L05 | NI number 与 right to work 不同；能证明工作权利者可在号码收到前开始工作。UK：[GOV.UK，Who can apply](https://www.gov.uk/apply-national-insurance-number) | **职场事件**：HR 来信、翻旧资料、回复同事；具体角色资格交 12.0a，不用“没号码”直接禁止工作 |
| L06 | 入住和搬家要与当地 council 联系 Council Tax 账户与账单。England/Wales：[GOV.UK，Start paying Council Tax 正文](https://www.gov.uk/guidance/start-paying-council-tax) | **家中物件／事件**：把门口信封整理到账本；已有 `family-council-tax` 与公共账单卡，优先接为处理后的回访，避免重复写另一张棕色信封 |
| L07 | Right to Rent 的这套核验只在 England；官方明确 Wales、Scotland、Northern Ireland 不要求这项证明。[GOV.UK，Overview](https://www.gov.uk/prove-right-to-rent) | **租房人物处境**：看房后准备核验，先确认小镇地域；若在 Wales，整条不能照搬。不是新增资格判定小游戏 |
| L08 | UKVI account 要及时更新护照、联系方式等信息，信息不符可能影响旅行。UK：[GOV.UK，What you need to update](https://www.gov.uk/evisa/update-ukvi-account) | **临行前事件**：换手机／证件后整理账户；与探亲准备联动，不以点击按钮保证入境或获批 |
| L09 | 搬家留能源表读数并联系供应商，有助核对首尾账单。England 指南：[Citizens Advice，Before／After you move](https://www.citizensadvice.org.uk/consumer/energy/energy-supply/moving-home-your-energy-supply/moving-home-dealing-with-your-energy-supply/) | **活动／物件**：找电表、借手电、保留照片；扩展已有 `common-meter-photo`，让后续记得是否拍过，不加真实 tariff 系统 |
| L10 | 垃圾收集与分类应查所在地 council，入口覆盖 England/Wales。[GOV.UK，Recycling collections](https://www.gov.uk/recycling-collections) | **邻里活动**：互相收桶、提醒收集日；已有 `common-bin-calendar`，可做可见门前物件与邻居回访。桶色、日程作为小镇设定，不称全国统一 |
| L11 | 入职介绍可包括团队、设备、出入和厨房等细节，也可安排 buddy。Great Britain 指引：[Acas，Making an induction plan／Meeting the team](https://www.acas.org.uk/inductions/planning-an-induction-programme) | **人物／活动**：阿德带路找厨房、共享午餐、忘门卡；新工作时触发，写具体团队习惯，不概括“英国人都这样” |
| L12 | 工资单区分扣除前后收入，显示税与 NI 等扣项。[GOV.UK，What should be on your payslip](https://www.gov.uk/payslips)；若写 NI 地区规则须另核 | **职场／家庭事件**：看工资单，再商量如何庆祝或安排账单；不要把到账净额直接写成引擎的薪资字段 |
| L13 | 宗教节日请假需要兼顾工作安排和公平处理，并非任何请求必定获批。Great Britain：[Acas，Time off for religious festivals and services](https://www.acas.org.uk/religion-or-belief-discrimination/preventing-religion-or-belief-discrimination) | **人物／事件**：同事商量换班，让节日进入日常人情；不按族裔推断信仰，不写申请获准保证 |
| L14 | 新迁入或学年中入学要联系当地 council 了解申请安排。England：[GOV.UK，Moving to another area／Applying after the start of the school year](https://www.gov.uk/schools-admissions/how-to-apply) | **地点／家庭链**：走通学路线、校门口等待、初识家长；接已有家长会与乐言作息，不把孩子重新入学当每年固定任务 |
| L15 | 学校可通过二手销售、交换或家长组织提供旧校服渠道。England：[DfE，Making second-hand uniform accessible](https://www.gov.uk/government/publications/cost-of-school-uniforms/cost-of-school-uniforms) | **物品／活动**：已有 `bno-school-shoes` 的二手校服选项，深化为交换桌、缝名字、次年交给新家庭；不是再写一张鞋变小的卡 |
| L16 | 亲友资助访问行程时，应说明支持内容与关系，材料不保证获批。UK：[GOV.UK，If you have a sponsor](https://www.gov.uk/government/publications/visitor-visa-guide-to-supporting-documents/guide-to-supporting-documents-visiting-the-uk) | **人物／活动链**：准备客房、安排做饭、接站送别；角色卡已有父母来访／团聚，先让这些生活在场景里发生。资格和实际批准不由该链判断 |
| L17 | 秋季日照缩短、转凉，风雨机会增加，同时仍会有暖和天气。UK：[Met Office，Autumn: a season of transition](https://www.metoffice.gov.uk/blog/2026/when-does-autumn-start) | **环境／活动**：下班已黑、散步转入咖啡馆，偶尔晴天下午晾被或野餐；不把英国天气写成永远下雨 |
| L18 | 孤独是主观体验，身在人群中也可能感到孤独。一般生活素材，NHS England 页：[Every Mind Matters，What is loneliness?](https://www.nhs.uk/every-mind-matters/lifes-challenges/loneliness/) | **人物处境**：聚会后仍想家，允许 NPC 不想说话；不把参加一次节日写成治好孤独 |
| L19 | 与家人朋友保持联系、分享感受，是 NHS 列出的可尝试做法。[同页，Keep in touch／Share your feelings](https://www.nhs.uk/every-mind-matters/lifes-challenges/loneliness/) | **家中活动**：跨时区视频、拍晚饭给家人、错过来电后的补聊；已有视频与探亲卡可衔接，具体时差与反应是创作，不伪称调查结论 |
| L20 | 感兴趣的小组能提供接触机会，紧张时可以先旁观。一般生活素材：[NHS，Things you can try](https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/feeling-lonely/) | **活动弧线**：第一次坐边上、后来带食物、最后愿意布置；不要求所有选择都表现外向，不将其设计成治疗承诺 |
| L21 | 图书馆 English conversation groups 和文化咖啡活动可提供练习和交友。地方实例：Cheshire West and Chester，England：[Council，English Conversation Groups／Language and Culture Cafe](https://www.cheshirewestandchester.gov.uk/residents/libraries/support-for-speakers-of-other-languages/improving-your-english) | **地点／活动**：海伦主持聊天桌，邻居轮流带话题；区分生活口语信心与移民语言证明，不能直接给考试资格 |
| L22 | 一位社区聚餐组织者记述从担心被拒，到请邻居带食物并逐渐熟络。**机构刊载的个人经历，只作氛围**：[Eden Project Communities，How I organised my first Big Lunch](https://www.edenprojectcommunities.com/community-stories/how-i-organised-my-first-big-lunch) | **活动链**：邀请→借桌椅／做菜→聚餐→归还餐具；允许小规模成功，不能推断所有社区都如此热络 |
| L23 | 社区种植也涉及欢迎新人、成员组织与志愿者协作。UK-wide：[Social Farms & Gardens，Community Growing Resource Pack 的公开 Pack contents](https://www.farmgarden.org.uk/services-and-support/publications-and-resources/community-growing-resource-pack) | **人物／公共项目**：玛格丽特和玩家约浇水、交换种苗、布置公共花坛；已有菜地机制可承接。只读公开目录，未读取会员手册 |
| L24 | 社区修理活动由物主与志愿者共同排查，有的物件需另找零件或专业修理。UK／London 项目实例：[The Restart Project，Who fixes…／What does repairable mean?](https://therestartproject.org/faq/) | **活动／物品**：已有公告缝补桌可深化；电子维修参考此来源，缝衣／修自行车是另外的原创扩展，不能声称 FAQ 全都覆盖；失败后能带零件再来 |
| L25 | Visit My Mosque 开放日欢迎不同信仰及无信仰邻居。UK 参与场所实例：[Muslim Council of Britain，Open days, open doors](https://vmm.mcb.org.uk/) | **社区活动／地点候选**：熟人邀请参观喝茶、后来在别的场景继续来往；不把宗教活动等同某个人的全部身份，不编造全国统一日期 |

优先素材链：**搬家与邻里（L01、06、09、10）→ 入职与共同午餐（L05、11、12）→ 学校与家长网络（L14、15）→ 从参加活动到共同组织（L20–24）**。GP、eVisa、探亲手续作为人物生活的背景与有限动作；不要把材料库变成行政知识问答大全。现有角色未必是刚落地，应由自己的搬家、换工作或家庭处境触发，避免重置既有背景。

来源限制：Big Lunch 总览打开超时后改用上表已读取的亲历文章；Refugee Week 页面受 robots 限制，未作为事实依据；社区种植手册只采用公开目录。没有引用未经核实的活动日期、论坛经历或统计占比。

## 4. 可直接拆成 brief 的扩展清单

P0 是下一波最值得先做的窄任务；P1 是形成持续生活体验；P2 需先试验或另行决定。规模为内容／实现范围，**不是已批准排期或工时承诺**。game 只由 sol 写，web／美术只由 astra 写；跨包项目在表中明确拆为先后子 brief，不让一个 writer 越界。

| ID／优先级 | 要交付的具体改变与粗略规模 | 负责 package | 依赖与主要风险 | 最小充分验收 |
|---|---|---|---|---|
| E01／P0 | 修两处既有残留：杰米复工后的六句工作日台词、阿德两句受保护的旧会议腔回访；只改相关条目与中英对照 | `packages/game`：sol | Fable 明确解除两句保护；保留历史旗标与选择意义，不能为清理词语删掉历史事实 | 失业前→失业→复工状态转换无矛盾；两条回访仍对应原选择；相关台词／人物测试通过，不重做全体声音 |
| E02／P0 | 让已买的阅读椅／窗帘／台灯、明亮住处在家里可见；固定位置显示，购买前后有差别；不新增家具经济 | `apps/web`、既有素材：astra | 直接用现有 `furnished-*`／`brighter-home`；home 动线、遮挡、旧存档；素材须可核验许可 | 三件购买前→购买→回家→刷新后仍在；租／退状态切换可见；两种语言与受影响手机画面截图；相关 web 检查 |
| E03／P0 | 选一个**已有公告活动**（优先缝补或邻里聚餐）做“看见邀请→到场共同做事→下次回访”；约 3 段、2 条合理分支、1 件纪念物／可见结果，先在一位现有 NPC 上试点 | E03a `game`：sol；E03b `web`：astra | a 先定最小状态契约，b 再显示活动物件；复用公告，不新增通用任务系统；代表日间隔与原角色前事须成立 | 不看攻略也能由公告找到场所；错过可在合理窗口再来；选择后场景／人物回应改变，存读档保持；禁止重复领结果；Fable 实走一条短路径 |
| E04／P1 | 小型生活收藏册：先覆盖现有 6 鱼与 8 食谱两类；记录首次发现／做成、来源回忆，显示已见与未见，不刷出售收益 | E04a `game`：sol；E04b `web`：astra | 已有日志／旗标够用则复用；若缺发现记录才补最小字段；不能只看当前背包导致吃掉后“失忆” | 获得→吃／送出→刷新仍被记录；未获得者不误亮；核心和 UI 的集合一致；不改收入与政策时间线 |
| E05／P1 | 一条跨季度公共项目：社区菜地公共花坛／棚屋，3 个阶段、约 4–6 场互动、2 位现有 NPC，各阶段有画面变化 | E05a `game`：sol；E05b `web`：astra | 用既有作物与物件；不靠必须高额捐钱；先验 E03 的活动表达；避免工程化为任意任务图引擎 | 两种参与路径都能完成；缺钱仍可参与；跨季度与快进不会错认完成；最后场景、对话、日记都回收贡献 |
| E06／P1 | 先深化 1 个现有节日：准备、当天参与、散场后回访；约 6–8 条新增／替换短场景，加 1 个小操作；成功后再覆盖其余节日 | `game`：sol；对应 `web` 子 brief：astra | 现有五节与年间轮换不改；雨天替代、代表日语义；不要重写已存在的三结果轮换 | 三角色触发窗口正确；至少两年体验不完全相同；准备选择在当天／之后出现；没参加不阻断主线 |
| E07／P1 | 三角色各 1 条生活链，每条约 3–4 场：林遥新工作午餐／邻里搬家，嘉宁校服交换／家长网络，索菲娅共同账本／亲友来访；从 L 库取材并复用现有卡 | `packages/game`：sol；如要新场景另开 astra brief | 12.0a 确定辖区、故事时间和政策边界；原人物未必新移民；避免重复已有电表／鞋子／账单卡 | 每链有前事与回访、两种不道德化的选择；不强迫选择高支出；双语与角色声音抽读；相同种子下记录新增实际曝光，不只统计库增长 |
| E08／P1 | 把生活经历带进结局：固定 3–5 个回忆位，优先朋友、做过的菜、家具、公共项目；仍保留原结局和评估信息 | `apps/web`：astra；仅缺数据时先给 sol 小契约 | 不能从未发生事件生成美好回忆；不能把离开／未递交写成道德失败；日志当前无精确日信息 | 空经历不编造；至少两种不同生活形成不同画面；三角色结尾无错人；375px 与桌面截图；复用现有日志的测试 |
| E09／P1 | 为普通日村绿地和一处高频生活点增加活动实物，另将四季树木／地面差异做成小范围变化；约 2 地点、4 季状态 | `apps/web`／美术：astra | 公告栏已有图块，先由 Fable 确认辨识问题；新 decor 不挡寻路与 NPC | 前后截图说明新增可见内容；行走／点击／夜间可用；普通日与节日不叠冲突；不把地图堆满不交互装饰 |
| E10／P2 | 深化 1 个小游戏，优先现有钓鱼表现或厨房共餐操作；补 1 条人物回馈，提供简易完成方式 | `apps/web`：astra；必要纯逻辑 `game`：sol | 先实机验证现钓鱼窗口与触屏；不以反应能力作为签证／关系门槛；无需同时造三种小游戏 | 键盘、触屏、简易路径均能得到正确结果；失败不丢存档／卡死时间；结果能进入物品／人物生活 |
| E11／P2 | 少量环境音与小动物：先一组雨／水环境层或一种小动物，复用静音／隐藏暂停／reduced motion 约定 | `apps/web`／资源：astra | 旧计划明确延期；素材许可和实际设备混音先核实；不得遮挡角色或阻塞寻路 | 可关闭、刷新记忆、切页不叠播；实听循环与音量；截图／短录屏确认动线。没有适合素材可继续延期 |
| E12／P2 | 地图上的小惊喜试点，约 3 个：先从已有寻猫、二手交换、遗落物件主题改编，留 1 次回访或场景痕迹 | `game`：sol；场景 `web`：astra | 不把已存在的寻猫卡称新题材；触发频率、过期和存档语义；不以大量随机弹窗代替发现 | 玩家先看见异常再参与；未见不误记完成；两种结果均有合理收尾；固定种子复现，刷新不重领 |

建议波次：**E01 与 E02 可各自推进；E03 做一个完整试点**。随后依据试点的可玩性与当前素材选择 E04／E05／E06，E07 在 12.0a 明确内容边界后开展。E08 利用前面真实产生的经历，E09 按 Fable 视觉证据定范围；P2 不作为前几项验收的前置。

每个新增生活任务都应说明“玩家在地图／家里做什么、状态如何留存、下一次见面哪里改变”，再确定需要几张卡。新增规则数字、资格判断、付费副业、自由售卖不属于这些 brief 的隐含授权。

## 5. 未处理的试玩问题与既定边界

### 5.1 仍开放或需要复核

| 项目／类别 | 历史来源 → 当前证据 | 处理建议 |
|---|---|---|
| 杰米复工后六句工作日台词仍被挡／已确认 | `reports/11.1-people-and-stories.md:68` → `family.ts:598–679` 的 `daily-31..36` 仍 forbids 历史失业；`family-partner.ts:397,410` 再就业只追加旗标 | E01，区分过去发生过与现在仍处于的状态 |
| 阿德两条十心回访保留旧会议腔／明确保留 | `reports/11.2b-voice-focus.md:91–97` → `npcs.ts:3196–3203` | E01，brief 明确允许修两句，保留分支事实；不称整体盲测失败 |
| 户外实物与结局视觉／部分未做 | `phase-10.5-plan.md:87` → 当前公告栏已有瓦片、普通日绿地较空；结局仍以文字／评估为主 | E08／E09；“公告栏只有标签”需重新看截图，不沿用旧判断 |
| 家具与住房消费不改变家中画面／本次代码发现 | Phase 11 增加持续消费 → `scene.ts` 不读取对应 flags | E02；优先于再增加同类消费项 |
| 游戏续签沿用扣费后许可续接简化／模型边界 | `reports/8.3-game-content-2.md:121`、`reports/10.5c-going-rate-check.md:169–172` → `game.ts` 的 `extend` | 交 12.0a／sol；已补截止来信不能视作已补资格核验。本报告不判断应采用哪些薪资门槛 |
| 日记缺精确日信息／接口依赖 | `reports/9.4-game-client-integration-v3.md:59` → `types.ts:122–130` 只有 year／quarter；`diary.ts:30–35` 按快进行动推断日序 | E03／E06 若改变作息须验证日记归日；没有实际错日证据前不单独开通用日志重构 |
| 步行流畅、声音、手机钓鱼／体验验证缺口 | `phase-10.5-plan.md:12` 明确限帧试玩未评估走路／动画／声音；9.4 报告未提供实听／FPS 证据 | Fable 实机走“出门→聊天→钓鱼→回家”一条路径，必要时再开修复；本任务没有验证它们 |
| 截止来信、徒步班和家具持续效果／仅缺浏览器观察 | `PROGRESS.md:139` 明确 11.3 未走这些浏览器路径；11.2 报告有逻辑验证 | 不列作未实现；后续受影响画面验收顺带验证，不重跑全项目审计 |
| 小动物、环境音／候选 | Phase 10／11 延后小动物；当前无动物、无环境音文件 | E11，小规模、按许可和体验决定 |
| 早退运行／本次统计发现 | 本次 40/180 局未满十年，均为 `overstayed`；不是之前验收失败复活 | 新消费或作息 brief 把它列为回归观察；未查明具体原因，不在本任务调参 |

### 5.2 已关闭，不能重新当欠账

- `partner-arrived` 历史旗标仍保留，但周沅 `daily-31/32` 当前均已有 `forbids: ['partner-separated']`（`family.ts:1587–1603`）；新增 SW 卡也有分手排除条件。报告 10.2 的这两句现况问题不再列作未修，保留历史到达事实本身不是 bug。

- `common-keys` 的“室友搬走但周沅仍在”：当前 `events/common.ts:1728–1761` 已写隔壁邻居，不再是同一问题。
- 家人学校／工作 `away` 作息与客户端隐藏已在 Phase 10 做；不能沿用 Phase 9 的“家人全时在家”评价。
- Phase 10.5 的 G1–G8、W1–W17 已有 Fable 集成复测记录（计划进度），包括季节错位、主动 Life in the UK 入口、初见介绍、一天好感剧情上限、结局零收成、到期提醒、节日重叠、门口误入、聊天返回菜单、物品分类图标等。源码也能找到对应实现；本轮没有逐项重新浏览器验收，不宣称全部当前视觉已复验。
- Phase 11 已处理人物声音、好感剧情、随意玩家解锁速度、快进卡密度、消费和属性、人称、政策截止提示。最新仓库合并记录的声音盲测为 110/120、91.7%，不能拿较早的失败轮次覆盖它；本轮未重做盲测，当前数量另见 §1.6。
- “192 句补充台词未经独立审阅”是 Phase 10 的历史限制；Phase 11 后有重写与多轮盲测，不能说现在仍有同一批 192 句原样未审。若要做全文双语编辑，应给当前批次另定范围。
- 嘉宁／索菲娅旧负余额基线不适用百分比降幅，已在 Phase 11 验收中说明；不把该统计口径再次列为未通过任务。

### 5.3 刻意不做的系统，不自动升级为缺陷

Phase 9 的不做项包括体力值、自由售卖／打零工、恋爱结婚、通用制作、战斗、家以外室内地图、定制美术；Phase 8 另排除账号、排行榜、服务端、3D 与自制音乐。当前小店**可以买东西**，旧文档“不做买卖”在生活层实际指不扩展出售与赚钱经营。E02 只使用已有购买结果，E04 不开出售市场，E05 的公共项目也不应自动变成有偿劳动。

年化收入、家庭分摊、许可续接仍有游戏模型简化。新的家庭、工作、探亲情节要识别这些边界，政策规则交 12.0a；不要为了内容扩展顺手更改引擎。当前最需要的交付是让一小段生活从行动走到可见结果，再由 Fable 决定扩展到哪些人和地方。

## 附录 A：复算方法

下面补充临时统计文件与清理方式。运行环境使用仓库现有 pnpm／Vitest，不增加依赖，不需 build。先取原测试首个 `describe` 前的 imports、`median` 和 `play()`，再接附录代码；这样不会再执行原文件中整套平衡断言，也不改变其策略。

```python
from pathlib import Path
original = Path('packages/game/test/balance.test.ts').read_text()
prefix = original[:original.index("describe('v3 seeded strategies'")]
# 将下一个 TypeScript 代码块保存为 /tmp/12.0b-audit-tail.ts 后：
tail = Path('/tmp/12.0b-audit-tail.ts').read_text()
Path('packages/game/test/content-audit.tmp.test.ts').write_text(prefix + tail)
```

```ts
import { writeFileSync } from 'node:fs';
import { commonEvents, systemEvents } from '../src/events/common';
import { policyStories } from '../src/events/policy';
import { townHeartLetters } from '../src/npcs';
import { places, locationActions } from '../src/locations';
import { items } from '../src/items';
import { festivals, festivalActivities } from '../src/festivals';
import { achievements, lifeAchievements } from '../src/achievements';
const countBy = (rows: any[], key: (r: any) => string) => rows.reduce((o,r) => {const k=key(r);o[k]=(o[k]??0)+1;return o;}, {} as Record<string,number>);
const sum = (a: number[]) => a.reduce((s,v)=>s+v,0);
const mean = (a: number[]) => a.length ? sum(a)/a.length : null;
const poolStats = (events: GameEvent[]) => ({
  total: events.length, choices: sum(events.map(e=>e.choices.length)),
  once: events.filter(e=>e.once).length,
  channel: countBy(events,e=>e.channel??'default:morning'),
  season: countBy(events,e=>String(e.season??'any')),
  gates: Object.fromEntries(['requires','forbids','stat','year','route','flag','visaMonthsLeftMax','dayKind','weather','festival','npc','item','minute'].map(k=>[k,events.filter(e=>k==='requires'||k==='forbids'?!!e[k]?.length:e.when?.some(c=>k==='year'?'yearMin' in c || 'yearMax' in c:k==='minute'?'minuteMin' in c || 'minuteMax' in c:k in c)).length])),
  noExplicitGates: events.filter(e=>!e.season&&!e.requires?.length&&!e.forbids?.length&&!e.when?.length).length,
  routeGates: countBy(events.flatMap(e=>(e.when??[]).filter(c=>'route' in c)), c=>c.route),
});
test('inventory current runtime exports',()=>{
 const data = {
  common: poolStats(commonEvents), systems: poolStats(systemEvents), policy: policyStories.map(s=>({id:s.event.id,character:s.character,channel:s.event.channel})), letters: poolStats(townHeartLetters),
  characters: characters.map(c=>{
    const people=npcs.filter(n=>!n.characters||n.characters.includes(c.id));
    const cards=[...commonEvents,...c.events,...townHeartLetters];
    return {id:c.id,name:c.name.zhCN, own:poolStats(c.events), regular:poolStats(cards),
      regularIds:cards.map(e=>e.id), routeExclusions:cards.filter(e=>e.when?.some(w=>'route' in w && w.route!==c.timeline.episodes[0].route)).map(e=>e.id),
      people:people.map(n=>n.id), lines:sum(people.map(n=>n.lines.length)),
      hearts:heartEvents.filter(e=>people.some(n=>n.id===e.heart?.npc)).length,
      achievements:(c.achievements??[]).map(a=>a.id),
      policy:policyStories.filter(s=>!s.character||s.character===c.id).length};
  }),
  npcs:npcs.map(n=>({id:n.id,name:n.name.zhCN,characters:n.characters,lines:n.lines.length,
    seasons:countBy(n.lines,l=>String(l.season??'any')),festival: n.lines.filter(l=>l.festival).length,
    intro:n.lines.filter(l=>l.id.endsWith('-intro')).length,recent:n.lines.filter(l=>l.id.includes('-recent-')).length,
    once:n.lines.filter(l=>l.once).length,when:n.lines.filter(l=>l.when?.length).length,
    requires:n.lines.filter(l=>l.requires?.length).length, hearts:heartEvents.filter(e=>e.heart?.npc===n.id).length,
    reactionCount:Object.keys(n.reactions).length})),
  heartStats:poolStats(heartEvents),
  places:places.map(p=>({id:p.id,kind:p.kind,actions:locationActions.filter(a=>a.place===p.id).map(a=>a.id)})),
  actions:locationActions.length, items:countBy(items,i=>i.kind),recipes:recipes.map(r=>r.id),
  festivals:festivals.map(f=>({id:f.id,season:f.season,action:festivalActivities[f.id]?.id})),
  festivalActions:locationActions.filter(a=>a.id==='festival'||a.when?.some(w=>'festival' in w)).map(a=>({id:a.id,when:a.when})),
  notices:{count:notices.length,seasons:countBy(notices,n=>String(n.season??'any'))},
  achievements:achievements.length,lifeAchievements:lifeAchievements.length,
 };
 expect(new Set([...commonEvents,...characters.flatMap(c=>c.events),...systemEvents,...heartEvents,...townHeartLetters,...policyStories.map(s=>s.event)].map(e=>e.id)).size).toBe(commonEvents.length+sum(characters.map(c=>c.events.length))+systemEvents.length+heartEvents.length+townHeartLetters.length+policyStories.length);
 writeFileSync('/tmp/12.0b-inventory.json',JSON.stringify(data,null,2));
 console.log('INVENTORY_READY');
});
const heartIds=new Set(heartEvents.map(e=>e.id));
const simulations:any[]=[];
for(const character of characters) for(const strategy of ['fast-forward','active','casual'] as const) {
 test(`audit ${character.id} ${strategy}`,()=>{
  const runs=Array.from({length:20},(_,i)=>{
    const r=play(character.id,i+1,strategy);
    const events=r.state.log.filter(e=>e.kind==='event');
    const regular=events.filter(e=>!heartIds.has(e.id));
    const uniqueRegular=new Set(regular.map(e=>e.id));
    const hearts=events.filter(e=>heartIds.has(e.id));
    const uniqueHearts=new Set(hearts.map(e=>e.id));
    const early=new Set(regular.filter(e=>e.year<=5).map(e=>e.id));
    const late=new Set(regular.filter(e=>e.year>5).map(e=>e.id));
    const heardLineIds=r.state.heard;
    const lines=npcs.flatMap(n=>n.lines).filter(l=>heardLineIds.includes(l.id));
    return {seed:i+1,quarters:r.quarterSamples.length,ending:r.state.ending,
      events:regular.length,uniqueEvents:uniqueRegular.size,eventRepeat:1-uniqueRegular.size/regular.length,
      heartScenes:uniqueHearts.size,heard:r.heard,uniqueLines:r.uniqueLines,lineRepeat:r.heard?1-r.uniqueLines/r.heard:null,
      notices:r.noticeCount,totalHan:r.totalContent,content:r.content,
      uniqueRegularFirst5:early.size,newRegularLast5:[...late].filter(id=>!early.has(id)).length,
      heardIds:heardLineIds,eventIds:[...uniqueRegular],heartIds:[...uniqueHearts],
      uniqueDialogueText:new Set(lines.map(l=>l.text.zhCN)).size,
      actions:[...new Set(r.state.log.filter(e=>e.kind==='action').map(e=>e.id))],
      achievements:r.state.achievements,
      years:Array.from({length:10},(_,i)=>({year:i+1,events:regular.filter(e=>e.year===i+1).length,unique:new Set(regular.filter(e=>e.year===i+1).map(e=>e.id)).size})),
    };
  });
  expect(runs.every(r=>!!r.ending)).toBe(true);
  const fields=['quarters','events','uniqueEvents','eventRepeat','heartScenes','heard','uniqueLines','lineRepeat','notices','totalHan','uniqueRegularFirst5','newRegularLast5'];
  const stat=(rr:any[])=>Object.fromEntries(fields.map(f=>[f,{mean:mean(rr.filter(r=>r[f]!==null).map(r=>r[f])),min:Math.min(...rr.map(r=>r[f]??Infinity)),max:Math.max(...rr.map(r=>r[f]??-Infinity))}]));
  const summary={character:character.id,strategy,n:20,fullN:runs.filter(r=>r.quarters===40).length,endings:countBy(runs,r=>r.ending),all:stat(runs),full:stat(runs.filter(r=>r.quarters===40)),unionEvents:new Set(runs.flatMap(r=>r.eventIds)).size,unionHearts:new Set(runs.flatMap(r=>r.heartIds)).size,unionLines:new Set(runs.flatMap(r=>r.heardIds)).size};
  simulations.push({summary,runs});
  writeFileSync('/tmp/12.0b-simulations.json',JSON.stringify(simulations,null,2));
  console.log('AUDIT_SUMMARY',JSON.stringify(summary));
 },180000);
}
```

执行上面的 Vitest 命令后，结果写至 `/tmp/12.0b-inventory.json`、`/tmp/12.0b-simulations.json`。每个模拟组保留全部 20 种子的结果；`all` 为全样本，`full` 仅筛四十季，`min/max/mean` 都从相同组计算。表格重复率乘 100 后显示百分数，汉字均值四舍五入至整数。

```sh
rm packages/game/test/content-audit.tmp.test.ts
git status --short
```

开局三卡与结局七段固定正文是 `game.ts` 内部常量，手工按 key 核对；不会为了导出它们修改业务代码。资产统计可独立用 `Path.rglob` 按后缀计数、`json.load` 读地图对象层，再对照场景加载路径。可达性的更严格证明、完整 UI 自动化与全文质量评审均不属于本次统计结论。
