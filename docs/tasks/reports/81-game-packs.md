# 任务 81 · 人生模拟游戏内容包接口

## 1. 做了什么

| PROGRESS | 建议 commit message | 本组文件 |
|---|---|---|
| 480 | `Refactor: 将游戏引擎与英国内容包拆分` | `packages/game/package.json`、`packages/game/src/{balance,calendar,content-pack,core,default-balance,game,index,model,types}.ts`、`packages/game/src/packs/uk/`、`packages/game/test/content-pack*.test.ts`、`packages/game/test/__snapshots__/content-pack-baseline.test.ts.snap`、`PROGRESS.md` 第 480 项 |
| 481 | `Refactor: 按国家加载网页游戏和存档` | `apps/web/app/game-page.tsx`、`apps/web/app/uk/game/{art,country,diary,ending,hud,life-overlays,location-menu,page,quarter-summary,scene,session,sound,welcome,wildlife}.ts(x)`、`apps/web/components/result-view.tsx`、`apps/web/lib/game-country.ts`、`apps/web/test/game-country.test.ts`、`PROGRESS.md` 第 481 项、本报告 |

两组提交均加 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。

`createGame(pack)` 使用内容包提供的角色、事件、地点、活动、评估与扩展效果。英国原创角色和事件保留在原模块，由英国包组装，角色故事继续按需加载。独立的 `@uk-immigration/game/core` 入口可直接供新国家使用。

`/uk/game` 从国家入口加载英国游戏，美术继续从 `public/game/` 提供，仍支持部署路径前缀。英国存档继续使用 `uk-immigration-life-v3:<角色 ID>`，音效和钓鱼设置也沿用原键。HUD、季度小结和结局使用英国包的评估列。共用评估列组件新增可选参数，结果页调用保留原默认列。结局的结果链接保留原表达式。

## 2. 怎么验证的

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 整链退出码 0。全仓 5,230 项测试通过，1 项按既有条件跳过。游戏包 1,341 项、网页 647 项通过，已有游戏测试文件保持原样。
- 改动前在 `838d0c2` 上，用种子 8101–8104 记录四名英国角色的季度评估、带选择的事件序列与最终存档。四局分别覆盖 40、40、26、8 个季度，每季都经过一次 JSON 保存与恢复。重构后四份快照全部一致。
- 最小内容包测试从自定义院落开场，经一次自定义节日和效果记录，保存并恢复后完成结局。测试使用自己的时间线、评估结果和规则 ID。
- 网页存储测试核对英国美术根和旧存档键，以及相同角色 ID 在不同国家产生的键。核对清单里的 88 个现有美术路径，并从构建产物读回 `apps/web/out/uk/game.html`，确认静态欢迎标题、小镇横幅、高优先级预加载及两个地图文件。
- `git diff --check` 通过。对照 `HEAD` 核对英国规则、公共美术文件和结局链接表达式。

## 3. 没做或没验证的

按 brief 由 Fable 提交，并执行 Playwright e2e 和视觉验收。英国包是当前唯一正式内容包。

## 4. 发现与建议

新国家最少提供一位可加载角色（档案、开场、起始日期、初始属性与时间线）、地点和活动列表、结局文案、把游戏状态交给该国规则引擎的 `evaluate` 与 `progress`。若剧情需要写入国家特有的时间线字段，再用 `rules.applyEffect` 处理专用效果；若需要续签、到期或旅行，由相应的评估适配器方法处理。镇民排班与对话、日常事件、节日历和道具按包提供。正式上线还需为网页国家入口登记内容加载器与美术路径，配置评估列、故事立绘和城镇场景。

## 审核修正（review81-1）

### 1. 做了什么

- 建议提交 `Fix: 修复内容包午夜归家和钓鱼种植地点`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。涉及 `packages/game/src/{content-pack,game,model}.ts`、`packages/game/src/packs/uk/index.ts`、`packages/game/test/content-pack.test.ts`、`apps/web/app/uk/game/life-overlays.tsx`、`PROGRESS.md` 第 482 项和本报告。
- 午夜先按当前位置触发事件，再把待处理事件状态的 `day.place` 设为内容包的 `home`。
- `fishingPlace` 用于校验钓鱼地点和保存首次钓获地点。自定义钓鱼点使用通用抛竿文案。`allotmentPlace` 用于校验种植、浇水和收获地点。英国包显式配置原有 ID `pond` 和 `allotment`，两者也是省略配置时的默认值。英国网页只为 `pond` 和 `home` 渲染对应的图鉴回忆文案。

### 2. 怎么验证的

- `pnpm --filter @uk-immigration/game test test/content-pack.test.ts` 在修复前复现三项失败。修复后执行 `pnpm --filter @uk-immigration/game test test/content-pack.test.ts test/content-pack-baseline.test.ts`，8 项通过。最小包以种子 3 测试广场午夜事件、河边钓获和花园租地至收获。英国四个角色的固定种子快照全部匹配。
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 整链退出码 0。全仓 5,233 项测试通过，1 项按既有条件跳过。游戏包 1,344 项、网页 647 项通过。确认 `apps/web/out/uk/game.html` 已生成，`git diff --check` 通过。

### 3. 没做或没验证的

按本次 brief 由 Fable 提交。Playwright e2e 与浏览器验收未执行。

### 4. 发现与建议

接口注释已注明 `travel-` 是内建旅行活动的保留前缀，后缀会按月数解析。自定义活动应使用其他 ID。新内容包应在 `places` 注册钓鱼点和菜地，并分别提供 `catchItem` 和菜地的 `rent-plot` 活动。

## 第二轮审核修正（review81-2）

### 1. 做了什么

- 建议提交 `Fix: 修正首次做菜回忆地点和节日日期顺序`，附 `Co-Authored-By: Codex gpt-6.2-sol <noreply@openai.com>`。涉及 `packages/game/src/game.ts`、`packages/game/test/content-pack.test.ts`、`PROGRESS.md` 第 483 项和本报告。
- 首次做菜回忆使用内容包的住处 ID。最小包从 `courtyard` 开场，做菜消耗原料并入库，存档经 JSON 往返后仍记录 `courtyard`。英国菜谱回归验证 `home`。
- 引擎沿用英国日历按整周顺延的做法，将本季度内早于或等于可玩周末的节日排到周末之后。季度外的节日跳过，第三天使用本季度最后一天。2030 年 1 月 1 日开局时，原定 1 月 6 日的节日顺延到 1 月 20 日，三天依次为 1 月 15 日、19 日、20 日。

### 2. 怎么验证的

- `pnpm --filter @uk-immigration/game test test/content-pack.test.ts` 在修复前复现 4 项失败，覆盖回忆地点、周末前节日和两个季度边界。修复后执行 `pnpm --filter @uk-immigration/game test test/content-pack.test.ts test/content-pack-baseline.test.ts test/collections.test.ts`，24 项通过。四个英国角色的固定种子快照全部匹配。
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 整链退出码为 0。全仓 5,237 项测试通过，1 项按既有条件跳过。游戏包 1,348 项、网页 647 项通过。确认 `apps/web/out/uk/game.html` 已生成，`git diff --check` 通过。

### 3. 没做或没验证的

本轮改动留在工作区，由 Fable 提交。Playwright e2e 与浏览器验收未执行。

### 4. 发现与建议

内容包的固定节日回调可返回当前季度的原始日期，由引擎处理三天的排期顺序。
