> 评审者：agy（gemini-4-hydrogen-xhigh），2026-11-15 复评。输入：12.9 分支本地构建的桌面 2 倍、手机 3 倍无头截图（未入库）、上一轮评审，以及 `apps/web` 只读源码。

> 评审者：agy（Gemini 4 Hydrogen），2026-11-15（复评）。  
> 输入：新版桌面 `1280×800（2x）`、手机 `375×812（3x）` 及专项截图共 27 张，对照 `/Users/wanruncong/Projects/web-UK/.worktrees/12.9-astra/apps/web` 只读源码与上一轮评审 `previous-review.md`。  
> **截图核查说明**：本批截图中，`d-game-town.png` / `d-game-event-card.png` 与 `m-game-town.png` / `m-game-event-card.png` 实际停留在「家」菜单弹窗画面（`m-game-town.png`、`m-game-event-card.png`、`m-game-home-menu.png` 三张完全一致）；桌面端室外无弹窗状态由 `125-green-lunch.png` 覆盖，事件卡与地点抽屉内部结构已结合只读源码核实。另外，`125-ending.png` 与 `125-ending-mobile.png` 下半截重复出现顶栏 `← 返回模拟器` 属于长页滚动拼图抓屏工具伪影，非 React DOM 重复渲染（已核 `SiteShell` 与 `GameClient`）。

---

## 一、对照上一轮前 10 个问题的复评判定

| 编号 | 上一轮问题 | 判定 | 截图与源码依据 |
| :--- | :--- | :--- | :--- |
| **P1** | 游戏浮层沿用 GOV.UK 政务风样式，与像素生活模拟严重割裂 | **部分解决** | **已改部分**：`d-game-start.png`、`d-game-morning-card.png`、`d-game-home-interior.png`、`d-game-home-menu.png`、`d-game-chat.png`、`125-green-lunch.png`、`125-green-menu.png`、`m-combo.png` 均已全面切换为“暖木与草甸”色板（松木绿 `#243b32` HUD、燕麦 `#f7f1e3` 舞台、羊皮纸 `#fff9ec` + 木棕圆角框 `#5c432d`、去蓝竖条选项框，且 `SiteShell` 在 `/game` 收窄为 `← 返回模拟器` 单条顶栏）。`EventCard` 经 `game-view.tsx`（L579-612）与 `game.module.css`（L547-564）核实共用同一套暖色 `.choice`。<br>**未改部分**：`125-ending.png` 与 `125-ending-mobile.png` 中 `<Ending>` 下半段内嵌的 `<AssessmentColumns>`（`game-view.tsx` L977）仍直接套用 `result.module.css` 的冷灰 `#f3f2f1` 框、直角灰边与 `#1d70b8` 蓝链接，在羊皮纸大卡内形成局部割裂。 |
| **P2** | 程序化聚焦与 `<dialog>` 默认焦点机制导致刺眼“黄黑双层粗框” | **已解决** | `d-simulate.png` 的 `<h1>基本信息</h1>` 焦框已消失（`site.module.css` L26-30 已加 `[tabindex='-1']:focus` 去框）。`d-game-morning-card.png`、`d-game-home-menu.png`、`d-game-chat.png`、`125-green-menu.png` 及对应 `m-*` 弹窗均由 `<dialog tabIndex={-1}>` 接管初始焦点（`game-view.tsx` L1007, L1017；`game.module.css` L506-509），打开不再把黄黑框套在 `✕ 关闭` 或主按钮上。`125-green-lunch.png` 与 `d-game-home-interior.png` 画布无刺眼黑黄外框（`town-canvas.module.css` L16-20 已改为 `2px solid #ffe082` 内描边）。 |
| **P3** | 小镇画布内地点标签文字极度模糊且遮挡屋顶 | **部分解决** | **核心痛点已解决**：`d-game-home-interior.png`、`m-game-home-interior.png`、`125-green-lunch.png` 已改为 DOM 叠加层（`scene-text.ts` + `town-canvas.module.css`），`床`、`书桌`、`厨房`、`门口信箱`、`公告栏`、`社区菜地`、`邻里聚餐 · 12:00–16:00` 均清晰锐利且移至建筑底缘不再压屋顶。<br>**遗留细节**：① 桌面室内 `d-game-home-interior.png` 底部 `走出家门` 标签被 `.interactButton` 完全遮挡；② `scene.ts` L378 室外仍全量常驻显示远景标签（如 `公园池塘`、`社区菜地`、`长椅`），边缘 `长椅` 被切半；③ 室外近距 5 格（`data-highlighted`）与当前可互动（`data-nearby`）高亮样式完全相同。 |
| **P4** | 手机端（375×812）顶栏与游戏 HUD 吞噬半屏，画布截断、交互按钮全失踪 | **部分解决** | **已改部分**：`m-game-home-interior.png` 与 `m-combo.png` 证实顶栏收拢为单行（~56px）、游戏 HUD 压缩为两行紧凑状态与数值条（~86px），底部固定 3 键 Dock（`镇上地点` / `背包` / `换角色`）与地点抽屉（`game-view.tsx` `sheet`）已就位，首屏可操作性大幅改善。<br>**遗留/新暴露问题**：`m-game-home-interior.png` 中室内画布硬撑到 `560px` 导致上下各有约 `150px` 深棕空洞，同时把下方 `.progressBars`（`现行法律` / `改革后`）正好推到固定 Dock 上沿被拦腰切掉半截；底部互动按钮仍折成两行高块且仍写 `E / 空格`。 |
| **P5** | 桌面端右侧 16 地点按钮窄格强制断字（“关/门”孤字折行）+ 满屏灰色噪音 | **部分解决** | **已改部分**：`d-game-home-interior.png`、`125-green-lunch.png` 右侧栏拓宽至 `250px`（`game.module.css` L380），`.theme` 取消全局 `anywhere` 且按钮加 `word-break: keep-all`，“关/门”断字彻底消失；`· 关门` 改用 `.closedPlace` 浅亚麻底色 + `🔒` 角标。<br>**遗留问题**：16 地点仍平铺无分组、未将关门地点后置、当前所在地（如在家里时的 `家` 按钮）无高亮态；黄色 `🔒` Emoji 在 `#f4ead5` 浅底上对比度很弱（`125-green-lunch.png` 的 `公司`、`GP 诊所` 极不明显）。 |
| **P6** | 桌面端 HUD 按钮孤立折行 + 室内场景四周露出大块“户外草地绿” | **已解决** | `d-game-home-interior.png`、`124-town-0700.png`、`125-green-lunch.png` 显示桌面端 HUD 已稳定为两排：第一排 `声音关`/`快进季`/`结束当天` 单行右对齐，第二排 5 等分带图标彩色进度条；`d-game-home-interior.png` 与 `m-game-home-interior.png` 室内画布四周已切换为 `#2a1f18` 深胡桃木底色（`town-canvas.module.css` L12-14，`scene.ts` L360），完全融入室内环境。 |
| **P7** | 游戏弹窗内部间距粘连、关闭文案错位（“回到小镇”）、打字机引起按钮跳动 | **已解决** | `d-game-home-menu.png`、`m-game-home-menu.png`、`125-green-menu.png` 中 `.choices + .buttons` 已具备 `16px` 间距（`game.module.css` L542-546 也包含 `.continueFast`）；关闭按钮统一改为 `✕ 关闭`；`d-game-chat.png`、`m-game-chat.png` 对话框改用独立铭牌（`周沅 · 林遥的室友，装裱员`）与玫瑰红心（`#b83b2e`），并利用 `.lineMeasure` 与 `visibility: hidden` 固定台词占位消除了按钮跳动。 |
| **P8** | 跨页样式一致性缺失：首页按钮变蓝字、政策页丢失黄色改革标识、页面宽度跳跃 | **部分解决** | **已改部分**：`d-home.png` / `m-home.png` 次按钮 `玩一局 · Immigration Life` 已恢复黑色文字（`site.module.css` L185 `.body .secondary`）；`d-policy.png` 与 `d-about.png` 右侧 `已公布改革` 卡片均已补全黄色顶边（`#b58800`）与黄色 `已公布、未生效` 徽章。<br>**未改部分**：`d-home.png` 全宽分隔线配左侧 `720px` 内容导致右侧大片留白、小游戏入口仍无暖色预告卡片；`d-about.png` 仍存在 720px → 1064px → 720px 宽度跳跃；`m-home.png` 双 CTA 按钮仍长短不一未等宽对齐。 |
| **P9** | 选人页纯英文大标题突兀、三卡排布不对称、按钮高低不齐 | **已解决** | `d-game-start.png` 与 `m-game-start.png` 已改为中文主标题 `移民生活` + 琥珀副标 `Immigration Life`，桌面端采用 3 等分对称卡片、居中木框头像与底部 `margin-top: auto` 齐平的全宽绿按钮；手机端单列舒展易读。 |
| **P10** | 中英文混排与字体栈粗糙、顶栏硬拼双语导致手机折行、问卷缺进度反馈 | **部分解决** | **已改部分**：`site.module.css` L5 已将 `'PingFang SC', 'Microsoft YaHei'` 提前并开启 `font-variant-numeric: tabular-nums`（`game.module.css` 字体栈更完整）。<br>**未改部分**：`i18n/zh-CN.ts` L111/L188 仍写 `政策依据 · Policy`、`方法说明 · About`，导致 `m-home.png` 顶栏依然折成两行；`d-simulate.png` 仍只有文字步骤无进度条；`m-game-home-interior.png` 触屏互动按钮仍硬写 `E / 空格`。 |

---

## 二、新引入及遗留显性问题（按影响程度排序）

### 1. [高] 手机端底部 Dock 截断下方进度卡 + 室内画布上下留出大块黑边
- **现象与截图**：在 `m-game-home-interior.png`（及 `m-combo.png` 图 2）中，手机端 `.canvas` 高度按 `clamp(320px, calc(100dvh - 240px), 560px)` 拉满到 `560px`。因室内房间 `18×13` 格在 375px 屏宽下缩放比仅约 `1.24×`（房间实际高仅约 `258px`），画布上下各空出约 `150px` 的纯深棕 `#2a1f18` 空白；更严重的是，这把下方 `.progressBars`（`现行法律` / `改革后` 两张圆角卡片）正好顶到距底部 `~58px` 的固定 Dock 上沿，导致**首屏底端露出两张被拦腰截断约一半的卡片**，视觉上像溢出遮挡。
- **具体改法**：
  1. 在 `app/game/town-canvas.module.css` 的 `@media (max-width: 760px)` 中，将室内画布高度与室外解耦：`.canvas.interior { height: clamp(250px, 38dvh, 310px); }`，消除室内上下无效黑边，使 `.progressBars` 在室内首屏能够完整呈现在 Dock 之上；
  2. 室外 `.canvas:not(.interior)` 可调整为 `height: clamp(320px, calc(100dvh - 260px), 470px);`（或结合 `margin-top` 调整 `.progressBars`），确保首屏下方要么完整露出两条进度卡的摘要行，要么完全落于折叠线之外，避免半张卡片卡在 Dock 边缘。
- **涉及文件**：`app/game/town-canvas.module.css`、`app/game/game.module.css`。

### 2. [高] 桌面端室内 `走出家门` 标签被互动按钮盖住 + 手机端互动按钮折成高块且文案不适配触控
- **现象与截图**：
  - 对比 `m-game-home-interior.png` 与 `d-game-home-interior.png`（及 `124-town-0700.png`、`125-home-base.png`、`125-home-bright.png`）：桌面端室内缩放 `2.31×` 恰好纵向撑满 `480px` 画布，房门与 `走出家门` 标签位于底部正中，恰好被 `left: 50%; bottom: 16px; transform: translateX(-50%)` 的 `.interactButton`（`互动 · E / 空格 / 点按`）完全覆盖；
  - 手机端 `m-game-home-interior.png` 中，`.interactButton` 因只写了 `left: 50%` 而未设 `width: max-content` / `white-space: nowrap`，浏览器按右半屏宽度约束折行，变成厚重的两行大方框（`互动 · E / 空格 /\n点按`），且对手机用户仍显示毫无意义的 `E / 空格`，也未标明附近目标名称（例如此刻站在旁边的 `床`）。
- **具体改法**：
  1. 在 `app/game/game.module.css`（L723-739）给 `.interactButton` 增加 `width: max-content; white-space: nowrap;`，桌面端改放右下角（`left: auto; right: 16px; bottom: 16px; transform: none;`）或缩小桌面室内缩放留出底边，彻底避开正中房门；移动端适当缩小内边距（`padding: 8px 14px; font-size: 14px;`）；
  2. 在 `app/game/game-client.tsx`（L545-552）根据 `interaction` 与 `(pointer: coarse)` 渲染具体对象名与平台文案（触控端：`互动：床` / `走出家门`；桌面端：`[E] 互动：床`），并补充对应翻译键。
- **涉及文件**：`app/game/game.module.css`、`app/game/game-client.tsx`、`i18n/zh-CN.ts`、`i18n/en.ts`。

### 3. [中高] 结局页内嵌政务风评估表反差刺眼，长篇“未获得”成就掩埋核心操作按钮
- **现象与截图**：见 `125-ending.png` 与 `125-ending-mobile.png`。
  1. 结局页上半部的故事、`留在日子里的小事` 四张卡片已完成温暖羊皮纸化，但紧随其后的 `<AssessmentColumns>`（`game-view.tsx` L977）直接沿用 `result.module.css`：冷灰 `#f3f2f1` 的 `.outcome` 区块（还带着 `margin: 24px -8px` 负外边距）、`#b1b4b6` 灰线直角边框、冷蓝灰 `#e5eef5` 徽章，以及 `▶ 来源` 与手机端跳转栏上的 GOV.UK 亮蓝 `#1d70b8`，嵌在 `#fff9ec` 暖棕圆角框内十分生硬；
  2. `一路的纪念` 把 20+ 条 `未获得` 成就全量展开，排在 `[在模拟器里打开这条时间线] [再玩一次] [换角色]` 主操作按钮之前，手机端需要长距离滑动越过满屏未解锁清单才能重玩或打开时间线；
  3. 细节：`绿地上的那张合照` 中 `.memoryPhoto` 下方紧贴说明文字（`site.module.css` L35 重置了 `p { margin-top: 0 }` 而 `.memoryPhoto` 无 `margin-bottom`）。
- **具体改法**：
  1. `app/game/game-view.tsx`（L924-973）：将核心操作按钮组（`在模拟器里打开这条时间线` / `再玩一次` / `换角色`）上移到 `留在日子里的小事` 之后、`一路的纪念` 之前；将 `未获得` 成就包裹在 `<details>` 中默认折叠，标题展示数量（如 `未获得（24）`）；
  2. `app/result/result.module.css` & `app/game/game.module.css`：把 `.assessment`、`.outcome`、`.sourceDetails > summary`、手机 `.columnNavigation button` 的背景/边框/圆角/链接色抽为 CSS 变量（默认值保留主站 GOV.UK 风格），在 `game.module.css` `.theme` 内覆写为 `--choice` / `--lining` / `--line` / `--primary-hover` / `6px` 圆角并取消 `.outcome` 负外边距；
  3. `app/game/game.module.css`（L662-666）：为 `.memoryPhoto` 增加 `margin-bottom: 10px;`。
- **涉及文件**：`app/game/game-view.tsx`、`app/game/game.module.css`、`app/result/result.module.css`。

### 4. [中高] 室外 DOM 标签“5 格范围”与“当前可互动”视觉相同 + 画布边缘标签被裁半
- **现象与截图**：见 `125-green-lunch.png`。
  1. 图中 `公告栏`（5 格内但尚未选中）与 `邻里聚餐 · 12:00–16:00`（当前正前方可互动对象）同时亮着完全一样的 `14px` `#ffe082` 发光金框（原因在 `town-canvas.module.css` L62-69 把 `.label[data-highlighted='true']` 与 `[data-nearby='true']` 合并为同一条规则），玩家无法一眼确认当前按互动键会触发哪一个；
  2. `scene.ts` L378 对所有室外地点均设 `setVisible(true)`，远处标签常驻且位于画面左下角的 `长椅` 因 `scene-text.ts` L46 仅居中偏移 `-50%` 未做边界限制，被 `.textLayer`（`overflow: hidden`）直接裁掉左半边，仅剩半个 `椅` 字。
- **具体改法**：
  1. `app/game/town-canvas.module.css`（L57-69）：拆分两级视觉——`[data-highlighted='true']` 保持 `12px` + 暖木框 `#c89b54`（仅代表走近可见/悬停可见），只有 `[data-nearby='true']` 升格为 `14px; font-weight: 700; border-color: #ffe082; box-shadow: 0 0 0 2px #ffe082;`；平时远距标签可降低透明度（`opacity: 0.72`）或默认隐藏；
  2. `app/game/scene-text.ts`（L44-49 `render`）：按 `layer.clientWidth` 与 `this.element.offsetWidth` 将水平位置钳位在 `[halfW + 6, layerW - halfW - 6]` 之间（垂直方向同理），防止边缘标签被切半。
- **涉及文件**：`app/game/town-canvas.module.css`、`app/game/scene-text.ts`、`app/game/scene.ts`。

### 5. [中] 系统彩色 Emoji 破坏质感与对比度（`🔒` 看不清、手机 `⏩` 突兀）+ 暗色 HUD 焦环低对比
- **现象与截图**：
  - `125-green-lunch.png`、`d-game-home-interior.png`、`125-home-base.png`：右侧栏关门地点的 `🔒` 角标（`game-client.tsx` L433）使用 12px 黄色系统 Emoji 放在 `#f4ead5` 浅米底上，几乎与背景融为一体，远不如单色小图标清晰；且当前所在位置（如 `家`）与其余营业地点同底色无标识；
  - `m-game-home-interior.png`、`m-game-morning-card.png`：手机 HUD 快进按钮 `⏩`（`game-client.tsx` L489）渲染成亮蓝色系统 Emoji 方块，夹在两个素雅的奶白色 `♪` 与 `☾` 图标之间极其突兀；静音状态的 `♪̸` 组合斜杠在移动端字体下也几乎不可辨认；
  - 源码对比度隐患（`game.module.css` L52-56）：`.theme.theme :focus-visible` 的深棕 `outline: 3px solid var(--amber-ink)`（`#89540e`）在浅色面板上正常，但落到 `#243b32` 深松木绿 HUD 上对比度极低（约 1.5:1），键盘 Tab 聚焦时不易察觉。
- **具体改法**：
  1. `app/game/game-client.tsx`（L432-435, L474, L489, L504）与 `app/game/game.module.css`：将 `🔒`、`♪̸`/`♫`、`⏩`、`☾` 统一替换为 `14×14`–`16×16` 的 `currentColor` Inline SVG（关门小锁使用 `--muted` `#5e4f40` 提高对比度，快进/音效/月亮使用 `--panel` 奶白单色线条/填充），并为当前所在地点的按钮加上 `aria-current="location"` 与清晰选中描边；
  2. `app/game/game.module.css`：补充 `.hud :focus-visible { outline: 3px solid var(--gold); box-shadow: 0 0 0 2px var(--hud-edge); }`。
- **涉及文件**：`app/game/game-client.tsx`、`app/game/game.module.css`。

### 6. [中] 对话框铭牌宽度预留不足（长身份/英文下易与 `✕ 关闭` 重叠）+ 短台词留白偏松
- **现象与截图**：见 `d-game-chat.png`、`m-game-chat.png` 与 `app/game/game.module.css` L755-769。`.dialogueHeader .close` 绝对定位在右上角（`top: 12px; right: 12px;`），`✕ 关闭`（约 80px）或英文 `✕ Close`（约 88px）加上右偏移共占 `92–100px` 宽，但 `.theme .nameplate` 仅保留 `max-width: calc(100% - 70px)`。一旦遇到较长的 NPC 角色介绍（尤其英文版，如 `Lin Yao's flatmate, picture framer`），铭牌右侧会直接压到关闭按钮下方。此外，短台词播完后 `.dialogueLine`（`min-height: 4.5em`）加隐藏的 `.revealHint` 在按钮上方留出约 `100px` 空档。
- **具体改法**：
  1. 取消 `.dialogueHeader .close` 的绝对定位冲突，改用 `Modal` 支持传递可选 `headerContent`（或让 `.dialogueHeader` 改为 `display: flex; justify-content: space-between; align-items: start; gap: 12px` 并把铭牌放进左侧槽位），物理隔离铭牌与 `✕ 关闭`；若保留当前 DOM 结构，至少将 `.nameplate` 收窄为 `max-width: calc(100% - 108px)`；
  2. 将 `.dialogueLine` 的 `min-height` 从 `4.5em` 微调为 `3.4em`（约两行高），既防短句跳动又更紧凑。
- **涉及文件**：`app/game/game.module.css`、`app/game/game-view.tsx`、`app/game/life-overlays.tsx`。

### 7. [中] 手机端 HUD 第二行 5 项属性列宽局促，高位数字存在拥挤隐患
- **现象与截图**：见 `m-game-home-interior.png` 与 `app/game/game.module.css` L1095-1110。`375px` 宽下左置 `签证 23月` 后，右侧 `.stats` 按 `minmax(68px, 2fr) repeat(4, minmax(0, 1fr))` 分配，后面 4 项（心情、健康、英语、事业）每列净宽仅约 `38–42px`。当前两位数（`☺65`、`◆10`）已贴边；若存款升至 `£12,500` 或属性升到 `100`（`✎100`），列内极易挤压甚至溢出；且纯 `◆` 符号在手机上很难直觉看出是“事业”。
- **具体改法**：
  - 在 `app/game/game.module.css` `@media (max-width: 760px)` 中，把 `.stats` 的 `minmax(68px, 2fr)` 改为 `minmax(60px, 1.55fr)`，将 `.hudBottom` 间隙从 `6px` 缩至 `4px`、`.hudBottom .visa` 收窄为 `23月` 配小图标，为右侧 4 格多让出 ~20px；同时把 `☺ ♥ ✎ ◆` 替换为清晰度更高的简笔小图标，或考虑把 5 项数值拆成左资金+右 4 项均分并适当加大数字对比。
- **涉及文件**：`app/game/game.module.css`、`app/game/game-view.tsx`。

### 8. [低] 桌面端首屏底缘截断进度条、明亮住处泛白发灰、室内分数倍缩放绿缝
- **现象与截图**：
  1. `d-game-home-interior.png`（1280×800）：底部的 `现行法律` / `改革后` 卡片正好被 800px 视口底边腰斩一半；
  2. `125-home-bright.png`：相比 `125-home-base.png`，开启 `brighter-home` 后全屋盖了一层 `0.26` 透明度的浅黄矩形（`scene.ts` L774），虽然变亮但也让木地板与窗帘略微泛雾发白，削弱材质质感；
  3. `m-game-home-interior.png`：室内瓦片在 `1.23×` 缩放下，右上墙面与底部房门位置出现两道 `1px` 绿线（tileset 邻近纹理采样渗边）。
- **具体改法**：
  1. `app/game/town-canvas.module.css` L5 桌面 `.canvas` 上限由 `480px` 微调至 `430px`（配合 `.toolbar` `margin: 8px 0`），可让两条进度卡完整留在 `1280×800` 首屏内；
  2. `app/game/scene.ts` L774 将 `brighter-home` 白天全屏柔光透明度由 `0.26` 降为 `0.10–0.12`，改为只在窗户/台灯周围画局部暖光晕，保留木纹饱和度；
  3. 对 `public/game/assets/indoor/tiles.png` 做 1px 边缘扩边（extrude）或限制室内相机按整数/0.5 步进缩放以消除绿缝。
- **涉及文件**：`app/game/town-canvas.module.css`、`app/game/game.module.css`、`app/game/scene.ts`。

---

## 三、整体观感评分与差距分析

- **上一轮（Round 1，main 06293e7）补评**：**5.0 / 10**  
  （其中网站端 6.5 / 10，小游戏端 4.0 / 10：主站结构扎实但有蓝字按钮/丢黄标/刺眼焦框硬伤；小游戏被冷蓝政务顶栏、白框表单、糊成色块的 8px 画布字、手机吞屏与参差选人页拖至半成品感。）
- **本轮（Round 2，12.8 + 12.9）评分**：**7.5 / 10**（较上一轮提升 **+2.5 分**）  
  （其中网站端 **7.5 / 10**，小游戏端 **7.5 / 10**。）

**跃升点与剩余差距（距离 9.0 分精品线还差在哪里）**：
1. **已完成质的飞跃**：12.8 扫清了主站跨页组件 Bug 与程序化黄黑焦框，DOM 画布地名让小镇瞬间清晰易读；12.9 的“暖木与草甸”换肤极度精准地拉开了生活模拟与严肃政务工具的视觉边界——选人页（`d-game-start.png`）、清晨卡片、室内深胡桃木底座、铭牌对话框（尤其是 `m-game-chat.png` 底部气泡感）和手机紧凑 HUD + 底部 Dock，已经具备了独立小游戏应有的温柔手帐质感。
2. **剩余 1.5–2.5 分差距主要来自三层**：
   - **界面接缝与移动端收口细节（约 0.8 分）**：手机端室内大黑边把底部进度条顶成半截露头、桌面 `走出家门` 被互动按钮挡住、结局页下半截冷灰政务表没能融入暖木主题、系统彩色 Emoji（`🔒`、`⏩`）混在单色图标里。这些都是低成本可迅速补齐的收口问题。
   - **主站侧的几处收尾停滞（约 0.5 分）**：中文主站顶栏仍硬拼英文导致手机双行折行、首页桌面右侧大片留白且缺少温暖的游戏引导卡片、`/simulate` 仍无进度条。
   - **美术素材上限（约 0.7–1.2 分）**：当前 12.9 已用 CSS 木框与排版把现有素材榨出了 90% 的表现力，但 16×16 行走小人直接放大 5 倍充当选人页与对话立绘，依然缺少表情情绪与人物魅力；室外街道/店铺缺差异化招牌与轻量动态细节（微风、水面反光、小动物）。

---

## 四、下一步最值得做的 5 件事

### 【低成本 · 纯前端 / CSS / SVG / 文案即可落地】

1. **修掉首屏与画布“两处硬遮挡 + 互动提示”**（投入最小、体验立竿见影）  
   - 在 `town-canvas.module.css` 收紧手机室内画布高度（`clamp(250px, 38dvh, 310px)`）以消除上下大黑边和 Dock 上方的半截进度卡；  
   - `.interactButton` 增加 `width: max-content; white-space: nowrap;`，桌面端移至右下角避开 `走出家门` 标签，并按触控/桌面端直接显示目标名称（如 `走出家门` / `查看书桌`）。

2. **清理 DOM 地名层级、边缘裁切与系统 Emoji 污染**  
   - 区分室外 `data-highlighted`（5 格内轻框）与 `data-nearby`（唯一目标亮金框），并在 `scene-text.ts` 给文字坐标加画布左右边界 clamp 避免 `长椅` 被切半；  
   - 用 `16×16` 单色 Inline SVG 替换 `🔒`（提高关门按钮可读性）、手机 HUD 的 `⏩`/`♪̸`/`☾` 与天气符号，并为 `.hud :focus-visible` 补上亮金焦环；给当前所在地点按钮加选中标识。

3. **统一结局页下半段换肤、折叠未解锁成就并补齐主站 3 处遗留**  
   - 结局页把操作按钮提至 `留在日子里的小事` 之后、默认折叠 `未获得` 成就清单，并让内嵌 `<AssessmentColumns>` 继承暖木 CSS 变量；  
   - 对话框铭牌与 `✕ 关闭` 改用 Flex 隔离防长文案重叠；  
   - 顺手清掉主站遗留：中文导航去掉 `· Policy` / `· About` 让手机顶栏变回单行、`/simulate` 增加 9 步细进度条、首页右侧（或小游戏入口）增加带像素头像的小卡片。

### 【需要新素材 · 决定下一阶段观感天花板】

4. **补齐 48×48 / 64×64 半身带表情像素立绘（Portraits）**  
   - 为 3 位可玩主角及高频登场镇民绘制专属半身立绘（至少常规、开心、微忧 2–3 种表情），替换选人页与对话框中放大 5 倍的 16×16 行走小人，是提升角色情感连接与“星露谷式”生活感性价比最高的美术投入。

5. **绘制首页/选人页游戏横幅插画 & 城镇招牌/局部氛围贴图**  
   - 绘制一张温暖的英国小镇街景像素小横幅，用于首页 `玩一局` 推荐卡片和 `/game` 选人页页头，一眼建立主站与游戏的情感切换；  
   - 为咖啡馆、街角小店、诊所、签证中心、车站补充差异化像素小招牌，并优化 `brighter-home` 的局部暖光（替换全屏泛白遮罩）。
