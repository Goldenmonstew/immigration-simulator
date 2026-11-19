# 任务 38：拆分小镇场景

## 1. 做了什么

`scene.ts` 从 1,424 行降到 874 行，保留生命周期、React 接口、移动和交互。建议由 Fable 提交 `Refactor: 按职责拆分小镇场景`，包含下表的 5 个变更文件及本报告 `docs/tasks/reports/38-scene-split.md`。

| `apps/web/app/game/` 下的文件 | 行数 | 职责 |
| --- | ---: | --- |
| `scene.ts` | 874 | 场景生命周期、同步、移动与交互 |
| `scene-map.ts` | 281 | 室内和室外建图、碰撞层、季节贴图和镜头尺寸 |
| `scene-effects.ts` | 107 | 雨雪、室内外光照、篝火与水面闪光 |
| `scene-decor.ts` | 263 | 节日与午餐布置、花坛、偶遇和作物刷新 |
| `scene-text.ts` | 242 | DOM 标签、邮筒角标与交互反馈 |

原有绘图函数位于 `scene-art.ts`（235 行），生活场景的状态判断位于 `scene-life.ts`（81 行）。

## 2. 怎么验证的

- `pnpm --filter web lint` 通过。
- `pnpm --filter web typecheck` 通过，包括 `next typegen` 和 `tsc --noEmit`。
- `pnpm --filter web test` 在拆分前后均通过，各 29 个测试文件、491 条测试。测试文件原样保留。
- 对照 `HEAD` 核对了公开类型、方法签名、移动与交互代码，以及建图的深度值和绘制调用顺序。`update` 仍按天气、节日效果、水面的顺序更新，三项都在暂停判断之前执行。原绘图函数与随机数调用一致。

## 3. 没做或没验证的

全仓 gate、Playwright e2e、浏览器视觉验收、提交和 PR 由 Fable 接手。

## 4. 发现与建议

现有测试通过反射调用 `loadWorld`、`renderText`、`resizeCamera` 和 `syncLifeScenery`，因此保留了这四处私有入口。浏览器验收可用同一存档进出室内并跨天，对比地图、标签、雨雪、夜灯、篝火和午餐摆设，顺手确认午餐桌与花坛出现后对应格子仍会挡路。

## Fable 验收（补记）

- 全仓 gate 通过（GATE EXIT 0：engine 2578、game 1316、web 491 等）；e2e 全量 35/35 通过。
- 画面对比：同一存档改成多种状态，分别在正式站（a13ee94）和本分支构建上截画布（1440 宽，reduced motion），用 ImageMagick `compare -metric AE` 比较：
  - 家里早晨、家里夜晚、火车站中午、火车站夜晚：逐像素相同。
  - 先走到村绿地再截：邻里聚餐（第 3 季周末、`quarter-board-community-lunch`，桌椅与"邻里聚餐 · 12:00–16:00"牌子可见）、篝火夜、五月节：逐像素相同。走到社区菜地截花坛第三阶段（`flowerbed-open`）：逐像素相同。
  - 火车站雨天、雪天：差 418 与 846 像素（0.14%、0.27%）。`drawPrecipitation` 不调用随机数，位置由粒子序号、帧时间和视口决定；两边截图的帧时间没有记录，差异原因未核实，推测是截图时帧时间不同。
  - 几种状态之间互相差 5%–39%，说明状态确实切换了。
