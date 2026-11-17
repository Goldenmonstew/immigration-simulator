# 任务 17 · 游戏剧情按角色拆包

## 1. 做了什么

建议 Fable 按以下三组提交。

| 分组 | 改动及文件 |
| --- | --- |
| game | `packages/game/src/characters/metadata.ts` 保留四人的 id、姓名、简介和精灵图，`characters/index.ts` 按原顺序列出角色，并通过四个独立的 `import()` 加载剧情。四份角色主文件各自持有开场、事件与定居结局，三个 `characters/*-life.ts` 承接了原 `events/life-chains.ts`、`events/life.ts` 和 `events/policy.ts` 中的角色专属内容。林遥的模块引入 `skilled-worker-additions.ts`，诺拉的模块引入 `graduate-flatmate.ts` 并向 `npcs.ts` 注册梅芙。同步游戏函数通过 `characterOf(id)` 取已加载角色，缺少剧情会抛错。其余入口与类型在 `src/game.ts`、`src/index.ts`、`src/types.ts`，毕业生薪资与许可计算在 `src/graduate-route.ts`。对应的 game 测试使用 `test/helpers.ts`、`test/character-life.ts` 和新增的冷启动用例 `test/character-loading.test.ts`。 |
| web | `apps/web/app/game/character-select.tsx` 只传角色与“新开／继续”动作。`game-client.tsx` 等待选中角色，期间显示原有“加载中”。`session.ts` 在选角时检查存档结构，继续时再校验队列、待投递和当前事件的 ID，同时恢复日记与季度起始值。刷新后保留原有的“继续上次”入口。`ending.tsx` 从已加载角色读取成就。测试改动在 `apps/web/test/load-game-characters.ts` 和 `game-{art,canvas,collections,life-scene,page,scene}.test.*`。 |
| 记录 | `docs/tasks/reports/17-story-split.md`、`PROGRESS.md`。 |

game 组配套调整的现有 `packages/game/test/*.test.ts` 包括 `balance`、`cards-qa`、`characters`、`copy-review`、`day-aware-events`、`endings-and-festivals`、`expansion`、`game`、`graduate`、`life-chains`、`life-in-the-uk`、`life`、`lina-letter`、`people-and-stories`、`policy-life-events`、`review`、`time-and-economy`。

## 2. 怎么验证的

**构建与测试。** `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 退出码为 0，成功静态导出 `/game`。game 1,316 项、web 485 项、engine 2,578 项、policy-data 22 项、error-report 2 项通过。engine 原有的文案导出用例按环境变量条件跳过 1 项。冷启动测试覆盖未加载时开局抛错、加载林遥后得到正确的开场，以及毕业生仍未加载。Web 控制器测试分别验证新开和继续只调用一次所选角色的加载函数，并检查等待期间的提示。

**与旧存档对照。** 用干净的 main（`abbb0d2`）和本次代码共用一份内存 localStorage。旧版以 seed 42 为四个角色分别开局并写入 v3 存档。新版能在四个角色都未加载时识别全部存档。依次加载对应角色后，恢复的状态、开场卡以及选择 `begin` 后的状态均与旧版深比较一致。另逐字段对比原有四份角色定义，所有原字段均一致，包括按原顺序排列的 75、86、86、66 个事件。

**包大小。** 拆分前在本 worktree 构建 `abbb0d2`，拆分后取全仓验收构建。单位均为字节，原始大小用 `wc -c`，压缩大小按每个文件分别执行 `gzip -9 < 文件 | wc -c`。首屏合计的拆分前数据取自同一提交的干净 main 静态导出。Turbopack 重新划分了公共代码，最大单包与选角前合计分别列出。

| 生产构建口径 | 拆分前原始 | 拆分后原始 | 拆分前 gzip -9 | 拆分后 gzip -9 |
| --- | ---: | ---: | ---: | ---: |
| 最大非 Phaser 游戏包（`0aiqgkw6i-mfr.js` → `1nyc_lkkup4nd.js`） | 810,761 | 323,689 | 310,821 | 143,082 |
| 选角前所需 JS 合计（13 → 16 个文件） | 1,726,199 | 1,479,322 | 571,347 | 490,564 |

拆分后，包含同步游戏函数与角色加载入口的 `2_06k5p-oe6rb.js` 为 192,847 字节，gzip 后 67,971 字节。第二行统计现代浏览器冷开 `/game` 所需的页面 JS 和挂载游戏客户端时追加的 JS，每个文件只计一次，排除旧浏览器专用的 `nomodule`、其他路由预取、图片和 CSS。按此口径，选角前少加载 246,877 字节原始 JS（14.3%），逐文件 gzip 合计减少 80,783 字节（14.1%）。

**剧情归属。** 对下表每个片段分别执行 `rg -l -F '片段' apps/web/out/_next/static/chunks/*.js`。拆分前 16 个片段都命中旧主包，拆分后每个片段只命中本行文件。

| 角色 | 独立 chunk | 原始字节 | gzip -9 字节 | 搜索的四个剧情片段 |
| --- | --- | ---: | ---: | --- |
| skilled-worker · 林遥 | `00f69nqbwu9di.js` | 54,538 | 19,314 | 门边的纸箱／续签日期越来越近，你把文件夹放到茶杯旁。／周沅拆开旧画框，背板里夹着半张报纸。／读过预算新闻，HR 又来信请你核对岗位与工资材料。 |
| hong-kong-bno · 陈嘉宁 | `3nd8wo051pbj6.js` | 73,882 | 22,040 | 餐桌旁的书包／孩子把家长会通知揉成小船，你从书包底找到了它。／交换桌的空位／邻居把预算新闻和定居标题混在一起问你。 |
| family-partner · 索菲娅 | `2gugkff802jew.js` | 71,167 | 24,605 | 厨房里的早晨／经理递来全职班表，你数了数还能一起吃晚饭的日子。／厨房本子的新页／杰米把预算剪报递给你。 |
| graduate · 诺拉 | `13d67mg9-23mh.js` | 56,644 | 27,408 | 学位袍外的日子／你把硕士项目挤进一页简历，连午饭都挤没了。／收音机沙沙响，台长可能是一袋米。／旧毕业照从文件夹里滑出来。 |

再从 `apps/web/out/game.html` 追踪本次构建。页面直接引用 9 个现代浏览器脚本，其中 `3yisn671q489g.js` 挂载 GameClient 时追加 7 个脚本。四个剧情 chunk 均在这 16 个文件之外。追加脚本中的 `31e1cxhrsdadj.js` 只在对应动态加载函数被调用时请求本行的一个 chunk。由此也能核对“选林遥不会顺带下载诺拉”等路径。

## 3. 没做或没验证的

`pnpm e2e` 启动了本地服务器，32 个用例均在 Chromium 启动阶段被 macOS 沙箱拦住（`MachPortRendezvousServer: Permission denied (1100)`），没有执行到页面断言。e2e 的断言和等待都没有改。四角色浏览器开局、继续、刷新恢复、手机宽度走查及 Lighthouse 由 Fable 验收。改动留在 worktree，待 Fable 提交。

## 4. 发现与建议

首屏横幅仍由游戏客户端渲染，实际 LCP 收益要用同一手机配置复测。存档预览会先显示结构有效的旧档。如果损坏仅在于事件 ID 已不存在，点击继续时才会识别，页面回到选角并保留原存档。

## Fable 验收（2026-11-17）

- 全仓 gate：`pnpm lint && pnpm typecheck && pnpm test && pnpm build`，GATE EXIT 0（engine 2,578 + 1 跳过、game 1,316、web 485、policy-data 22、error-report 2）。
- e2e：`pnpm e2e`，32 条全部通过，断言与等待都没有改。
- 内容不变：在改动前（abbb0d2）和改动后的代码里，用同样的种子（1、7、42、99）把四个角色各完整玩到 8 年结束，共 16 局。每一步的事件 id、所选选项与最终存档逐字段相同；角色原有字段、镇民、心事件、公共事件、地点、物品、节日、成就都相同。政策新闻列表只是顺序变了（角色专属的几条改为加载角色时追加），它按角色筛选，不影响游戏。来源（SRC）注释随代码一起移动。
- 构建产物：进入 `/game` 页时加载的脚本里搜不到任何角色剧情；四个角色的开场标题各只出现在自己的 chunk 里。
- 浏览器（本地静态服务器）：
  - 欢迎页加载 16 个脚本，没有任何角色剧情；
  - 林遥、索菲娅、诺拉开新局，各只下载自己的剧情包，开场卡正确；
  - 诺拉的存档刷新后继续，日期、种子、记录与刷新前一致；
  - 用改动前版本开局生成的陈嘉宁存档（含 2 个排队事件），复制到新版本后能继续，只下载她的剧情包，状态不变；
  - 控制台没有报错。
- 本地 Lighthouse（未压缩，前后各测 2 次，结果一致）：游戏页性能分 75 → 75，LCP 11.5 → 10.7 s，TBT 30 → 10 ms，传输 1,794 → 1,595 KiB。正式站数字待合并部署后补测。
