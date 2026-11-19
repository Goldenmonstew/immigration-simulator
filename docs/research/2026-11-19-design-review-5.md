# 英国移民路径模拟 & 「移民生活 Immigration Life」第 5 轮页面设计与风格评审
> Fable 注（2026-11-19）：本评审由 agy（gemini-4-hydrogen-xhigh）只读完成。截图来自正式站（版本 a13ee94），由 Fable 用无头 Chromium 截取：桌面 1440×900 @2x，手机按 Pixel 7 模拟 375×812 @3x；游戏只截了林遥一局的开头几屏。文中"实机截图""实见"均指这些无头浏览器截图，不是真机。第 10 条"4–5 字角色名必然截断"是 agy 按林遥的截图推断，其他角色未截图验证，待任务 48 验收时确认。


> 评审者：agy（Gemini 4 Hydrogen）  
> 评审日期：2026-11-19（对应线上版本 `a13ee94`）  
> 评审依据：正式站桌面端 `1440×900 @2x`（`d-*.png` 12 张）与移动端 `375×812 @3x`（`m-*.png` 12 张）无头浏览器截图及可见文本（`*.txt`），对照 `previous-review-4.md` 与 `apps/web` 只读源码及像素/SVG 素材核查。

---

## 一、上一轮建议的落实情况

先说明截图覆盖范围：本轮提供的 24 张截图完整覆盖了主站全部 6 个页面（首页、问卷、结果、What-if、政策依据、方法说明）以及小游戏的选人页、室内 `07:00` 主界面、晨间卡、房间菜单、周沅对话；**未包含室外绿地/高街街区（9 块店铺招牌与池塘）、钓鱼/做饭成功卡、背包/收藏册及结局页的实机截图**。以下逐条结合截图与源码/素材核实落实结果：

| 上一轮建议项（Round 4） | 落实判定 | 无头浏览器截图与源码核查依据 |
| :--- | :---: | :--- |
| **1. 首页桌面游戏卡移到右栏** | **已改好** | `d-home.png` 截图可见：`home-content.tsx` 与 `site.module.css`（`.homeHero`）已在桌面端（`>=960px`）改为 `minmax(0, 1fr) 340px` 双栏布局，`.gameEntry` 暖木卡放进右栏，横幅与 `玩一局 · Immigration Life` 完整落入首屏，右侧空白消除，移动端（`m-home.png`）自然折回单栏。 |
| **2. 选人页左文字右横幅 + 完整显示太阳与河桥** | **基本改好（带 1 处边框小瑕）** | `d-game-select.png` 截图可见：`.welcomeIntro` 改为左文右图并排，`.townBanner` 完整露出太阳与河桥，首排主角卡及 `和林遥开始` / `和陈嘉宁开始` 按钮完整进入首屏；`m-game-select.png` 首屏亦完整包含横幅与林遥整卡。<br>**遗留小瑕**：`.townBanner` 因 `border-box` 算入 `2px` 边框，内部画幅呈 `3.05:1`，左右边缘露出约 `2–3px` 淡米色竖缝（详见 §二.5）。 |
| **3. `about` 页面宽度统一，消除 720→1064→720px 跳变** | **已改好** | `d-about.png` 截图可见：`about-content.tsx` 将整页内容收入 `site.narrow`（`720px`），包括中段两栏对比卡（`.ruleSets`），全页左右边距从头到底对齐一致。 |
| **4. 右侧 16 地点“营业中前置、关门置底”** | **已改好** | `d-game-town.png` 截图可见：`game-client.tsx` L506–510 按 `isPlaceOpen` 排序后，`07:00` 开放的 7 个地点（`家`、`火车站`、`社区菜地`、`公园池塘`、`公告栏`、`村绿地`、`长椅`）全部排在前 4 行，9 个带锁关门地点（`公司`..`签证中心`）整齐归拢在下方，不再堵在中间。 |
| **5. 清掉零星系统字符 `✉` / `✈` / `⌂`** | **已改好** | `d-game-town.png`、`game-client.tsx`、`town-canvas.module.css`、与 `life-overlays.tsx` 核实：`✉`（信箱角标与画布徽章）、`✈` / `⌂`（`TravelCard`）已全部替换为单色 SVG（`<GameIcon>` 或 CSS `mask`）。 |
| **6. 修复 `.catchCard` 图标放大失效 + 厨房按钮分组 + 钓鱼“简易模式”选中态** | **代码已改（本轮未截图）** | **源码核实已改**：`life-overlays.tsx` `ItemIcon`（L144–152）已去掉硬编码 `32px 32px`，改用 `backgroundSize: 'contain'`（作物用 `'600% 100%'`）+ `'center'`；`Kitchen`（L584–606）补上 `.buttons` 容器与 `button` / `secondary` 主次层级；`Fishing`（L863–871）开关改 `secondary` 并配合 `game.module.css` L1193–1201 的 `[aria-pressed='true']` 深绿高光金边与对勾图标。<br>**未闭环**：本轮无钓鱼/做饭截图，暂无法目视确认，且核源码时发现 `ending.tsx` 的菜肴缩略图仍残留 `32px 32px` 变形写法（见 §二.9）。 |
| **7. 修净 5 张 `*-happy.png` 腮红越界 + `rahman` 右耳黑条** | **素材已改（仅部分入镜）** | **像素级核实已改**：对比 `9e26c7c7` 提交前后，`graduate`、`family-partner`、`yao-flatmate`、`maeve`、`rahman` 的 `happy` 图已恢复发缘/轮廓/4 颗雀斑/胡须像素，只在纯皮肤上着腮红；`rahman-{neutral,happy,worried}.png` 右耳内侧 `(44..47, 27..33)` 黑条已彻底清回肤色。<br>（`d-game-chat.png` 与 `m-game-chat.png` 仅测到 `yao-flatmate-neutral`。） |
| **8. `duck.svg` 第 2 帧、`summer-corn.svg` 整数像素、池塘水波** | **素材/代码已改（本轮未截室外）** | **文件核实已改**：`duck.svg` 第 2 帧翅膀下移 1px 且水波拆成两段；`summer-corn.svg` 已改成纯整数 `<path fill>` 玉米粒；`scene.ts` L1253–1272 已加上池塘水波高光微动（`waterTiles`）并遵守 `prefers-reduced-motion`。<br>**未闭环**：本轮 `d-game-town.png` / `m-game-town.png` 停在 `07:00` 室内，室外池塘与高街 9 块招牌挂墙效果仍缺实图验收。 |
| **9. 结局页头像边框与成就双栏对齐** | **代码已改（本轮未截图）** | **源码核实已改**：`game.module.css` L719–724（`.memoryPortrait`）与 L1053–1059（`.smallPortrait`）已加 `2px solid var(--line)` 细框；L777–782 已拉齐 `.achievementColumns summary` 与左栏 `h3` 的字号行高及底距。 |

> 顺便一提：本轮截图中 `d-game-welcome.png` 与 `d-game-select.png`、`m-game-welcome.png` 与 `m-game-select.png` 文件内容完全相同（均落在加载完成后的选人界面），属于抓屏时机问题，非页面缺陷。

---

## 二、本轮新发现

### 【主站】

#### 1. 短页面灰底页脚下方悬空露白，缺乏贴底锚定
- **截图**：`d-simulate.png`、`d-whatif.png`、`m-whatif.png`
- **问题**：在内容少于一屏的页面上，灰底页脚（`.footer`）停在画面偏上位置，页脚下方却又露出一整条刺眼的白色 `body` 背景——`d-whatif.png` 下方露白约 **`55px`**（2× 截图 `110px`），`d-simulate.png` 露白约 **`36px`**（2× 截图 `72px`），`m-whatif.png` 露白约 **`34px`**（3× 截图 `102px`）。
- **为什么影响体验**：GOV.UK 风格的灰底页脚在视觉上承担“页面结束与兜底”的作用；页脚下面又多出一块白底，会让页面像没渲染完或高度计算出错。原因在于 `site.module.css` L128 仅设 `.main { min-height: 70vh; }`，外层容器未用纵向 Flex 撑满视口。
- **具体改法**：
  - `apps/web/app/site.module.css`：新增 `.shell { min-height: 100dvh; display: flex; flex-direction: column; }`；将 `.main` 的 `min-height: 70vh;` 改为 `flex: 1 0 auto; width: 100%; min-height: 0;`。
  - `apps/web/components/site-shell.tsx` L43：非游戏页外层 `<div>` 加上 `className={isGame ? game.theme : styles.shell}`。

#### 2. 问卷第 1 步“国籍” 3 字母输入框过宽，与上方日期框右缘不齐
- **截图**：`d-simulate.png`、`m-simulate.png`
- **问题**：`d-simulate.png` 中“出生日期”输入框宽 `240px`，正下方的“国籍（输入三位英文字母国家代码，例如 CHN）”输入框却宽达 `480px`（`m-simulate.png` 上也撑满 `335px`），是上方日期框的两倍宽。
- **为什么影响体验**：表单输入框的宽度本身是输入长度的视觉线索（affordance）。一个仅填 `CHN` 三个大写字母的框拉到 `480px`，不仅显得空荡、破坏两个单行字段的纵向对齐，还会让人误以为要输入国家全称。
- **具体改法**：
  - `apps/web/app/simulate/form.module.css` L46–51 后补充：`.field input[maxlength='3'] { width: 240px; }`（在 `apps/web/app/simulate/steps/basic.tsx` L35 已有 `maxLength={3}`）。`240px` 既能与上方 `input[type='date']` 右缘严格对齐，又足够容纳 `<datalist>` 的国家中文提示与下拉箭头。

#### 3. 桌面首页右侧游戏入口卡内容略显单薄，与左栏高度落差较大
- **截图**：`d-home.png`
- **问题**：`d-home.png` 已把 `.gameEntry` 挪进右栏（`340px` 宽），但卡片在 `3:1` 横幅下只放了一句粗体标题 `玩一局 · Immigration Life`，总高约 `160px`，而左栏英雄区（主标题 + 导语 + 建模范围 + 绿主按钮）高约 `285px`，导致右栏紧挨着 `开始模拟` 按钮右侧留出一块约 `125px` 的悬空区域。
- **为什么影响体验**：第一次来网站的访客看到右上角这张像素图卡时，光看 `玩一局 · Immigration Life` 不知道点进去能做什么、和左侧模拟器有什么关系；补一句 1 行副标题既能解释“用四季生活体验规则影响”，又能把卡片和左栏在高度上配平。
- **具体改法**：
  - `apps/web/app/home-content.tsx` L30–37：在 `.gameEntryTitle` 下方加一行 `<span className={styles.gameEntryDesc}>…</span>`（如“像素小镇生活模拟 · 在工作、社交与四季里看清时间线 →”）。
  - `apps/web/app/site.module.css` L222–226：`.gameEntryTitle` 改为 `padding: 12px 16px 4px;`，新增 `.gameEntryDesc { display: block; padding: 0 16px 14px; font-size: 0.95rem; line-height: 1.5; color: #5e4f40; }`。

#### 4. 政策页 `来源清单` 纵向过长与变更日志超宽行距；结果页 `PD-xxx` 徽章混用现行法律蓝底
- **截图**：`d-policy.png`、`d-result.png`
- **问题**：
  1. `d-policy.png`（全图高 `15,856px`）的下半部 `来源清单`（`SRC-001`..`SRC-048`）每项上下排布编号与长 URL 且有 `24px` 上下内边距，拉出数千像素重复列表；上方的 `政策变更日志` 文本也直接撑满 `1064px` 全宽（每行约 55–65 个汉字，长句扫读吃力）。
  2. `d-result.png` 右栏 `已公布改革` → `未知 / 未定事项 (1)` 里的 `政府未定细节：PD-012、PD-013` 徽章直接套用 `site.badge`（冷蓝 `#e5eef5` / `#16324f`），与左栏顶部 `现行法律` 徽章颜色完全相同，而它实际位于琥珀预警语境下。
- **为什么影响体验**：前者让政策页显得冗长难定位，后者在视觉编码上把“政府未定待明确”混同于“现行法律”。
- **具体改法**：
  - `apps/web/app/policy/policy.module.css`：在 `.entries p { max-width: 720px; }` 限制日志正文行宽；为 `apps/web/app/policy/page.tsx` L192 `来源清单` 列表加独立类名 `.sourceList`（桌面端 `display: grid; grid-template-columns: 88px minmax(0, 1fr); gap: 4px 16px; padding: 14px 0;`、去掉 `<br />`），列表高度可缩短近半且一目了然。
  - `apps/web/components/result-view.tsx` L290：将 `<p className={site.badge}>` 改为 `<p className={`${site.badge} ${site.announced}`}>`，统一“未生效/待定”的暖琥珀色系。

---

### 【小游戏】

#### 5. 选人页横幅 `.townBanner` 因 `border-box` 算出 `3.05:1`，左右两侧露出淡米色竖缝
- **截图**：`d-game-select.png`、`m-game-select.png`
- **问题**：放大查看 `d-game-select.png` 和 `m-game-select.png` 的小镇横幅，深木边框（`2px solid var(--wood)`）内侧的**最左与最右各有一条 `2–3px` 宽的淡米色（`#f4ead5`）竖缝**，圆角处像素也未完全贴边。
- **为什么影响体验**：对比首页 `d-home.png` 严丝合缝的横幅，选人页作为小游戏门面，边框内露白缝显得图片“没对齐裁歪了”。原因在于 `site.module.css` 注入了 `box-sizing: border-box`，`game.module.css` L166–173 给 `.townBanner` 设 `width: min(480px, 100%); aspect-ratio: 3 / 1; border: 2px solid var(--wood);` 时，边框占用了外盒尺寸，使内部渲染区变成 `476×156`（`3.051:1`），`contain` 自然在左右留下空隙。
- **具体改法**：
  - `apps/web/app/game/game.module.css` L166–173：将 `.townBanner` 改为 `box-sizing: content-box; width: min(476px, calc(100% - 4px)); aspect-ratio: 3 / 1; overflow: hidden; background: var(--lining) no-repeat center / contain;`，让内容区自身严格保持 `3:1`，消除左右竖缝。

#### 6. 室内画面缩放过小造成过半黑褐空框，且家具脚下残留 5 条孤立黄短线
- **截图**：`d-game-town.png`、`m-game-town.png`
- **问题**：
  1. `d-game-town.png` 左侧地图容器为 `858×360px`，但室内地图（`home.json` `18×13` 格 = `288×208px`）被 `scene.ts` 按 `0.5` 步进向下取整成 **`1.5×`（`432×312px`）**，四周超过 **56% 的画布面积是死暗 `#2a1f18` 空背景**。
  2. 手机端 `m-game-town.png` 更严重：`town-canvas.module.css` L114–117 已把 `.canvas.interior` 设成贴合房间的 `aspect-ratio: 18 / 13`（`355×256px`），但 `scene.ts` 同样向下取整成 **`1.0×`（`288×208px`）**，硬生生在四周留出一圈 `~34px` 黑边，家具与角色缩到原尺寸 `16px`，导致 `14px` 字号的 DOM 标签 `[床]` 比整张床还大，直接盖住枕头和两位角色。
  3. 房间木地板上（床边、书桌椅下、厨房下、尤其是门口信箱斜下方空地上）漂浮着 5 条 `9×2px` 的亮黄色小短线，看起来像贴图杂点。
- **为什么影响体验**：玩家一进游戏第一眼就是这个室内房间，四周大片黑框与盖住人物的巨型标签严重削弱像素空间的沉浸感。
- **具体改法**：
  - `apps/web/app/game/scene.ts` L503–511：`resizeCamera()` 在 `this.view.interior` 分支去掉 `Math.floor(... * 2) / 2` 的 `0.5` 取整，直接用 `Math.min(3, this.scale.width / this.map.widthInPixels, this.scale.height / this.map.heightInPixels)` 紧贴容器（配合 `image-rendering: pixelated` 与 `roundPixels: true`），手机端立刻放大 23% 填满整个 `18/13` 画框；同时在 `apps/web/app/game/town-canvas.module.css` 为桌面端补充 `.canvas.interior { height: max(208px, min(416px, calc(100dvh - 400px))); }`，让 `1440×900` 桌面端稳定运行在整数 **`2.0×`（`576×416px`）** 放大倍上。
  - `apps/web/app/game/scene.ts` L376–380：绘制 `9×2` 门垫黄条前加判断 `if (!this.view.interior || obj.name === 'exit')`，只保留门口提示条，清掉室内家具脚下的杂线。

#### 7. 飘字提示 `+1 心情` 与场景静态标签 `床` 直接叠撞遮挡
- **截图**：`d-game-chat.png`、`m-game-chat.png`
- **问题**：在对话弹窗上方的房间画面中，交互产生的深青绿飘字 `[+1 心情]` 直接压在静态标签 `[床]` 的上沿与文字上，在 `m-game-chat.png` 里甚至盖住了大半个 `床` 字框。
- **为什么影响体验**：由于对话弹窗刻意沉底让出上方画布视野，玩家视线正好落在这块区域；两枚深色边框胶囊直接叠在一起会显得像 UI 错位。原因在于 `scene.ts` L1070–1077 `startFloats()` 只检测飘字彼此之间的碰撞，不避让静态 `spot.label`。
- **具体改法**：
  - `apps/web/app/game/scene.ts` `startFloats()`（L1070–1077）：将当前可见且与玩家邻近的 `spot.label` 边界框也加入避让检测，若重叠则把 `feedback`（L992 `this.player.y - 20`）上移至避开标签顶部 `6px` 之外（或当打开 `Dialogue` 时直接暂停/淡出旧 `feedback`）。
  - `apps/web/app/game/town-canvas.module.css` L94–98：为 `.feedback` 补充 `z-index: 2;`（高于 `.label[data-nearby='true']` 的 `z-index: 1`），保证即使路过其它标签也不会被底边压住。

#### 8. 右栏 16 地点 4 字关门按钮右上角锁图标贴近文字，开放与关门行交界略显突兀
- **截图**：`d-game-town.png`
- **问题**：`d-game-town.png` 右栏现已将 7 个开放地点置顶、9 个关门地点置底，但奇偶行导致第 4 行左边是可去的 `[长椅]`、右边是带锁的 `[公司 🔒]`；而且 `.closedMarker` 绝对定位在 `top: 2px; right: 2px;`，`语言学校`、`街角小店`、`签证中心` 四个字居中后，最右一个汉字与锁图标仅隔数像素（切到英文 `Language school` / `Corner shop` 两行换行时更易压到锁图标）。
- **具体改法**：
  - `apps/web/app/game/game.module.css` L475–492：为 `.theme .destinations .closedPlace` 增加右侧留白与虚线弱化：`padding-right: 24px; padding-left: 10px; border-style: dashed; opacity: 0.78;`，让开放/关门两档按钮不用费力看小锁就能一秒区分，且文字与锁图标永不碰车。

#### 9. 结局页回忆卡“做过的菜”缩略图仍硬编码 `32×32` 拉伸变形（源码核查发现）
- **截图**：无（本轮未截取结局页；定位自 `apps/web/app/game/ending.tsx`）
- **问题**：Round 4 已修好 `life-overlays.tsx` 的 `ItemIcon`，但 `apps/web/app/game/ending.tsx` L118–124 渲染 `dishes` 回忆列表时仍写死 `backgroundSize: '32px 32px'`。实测 `public/game/assets/meadow-town/dishes/*.svg` 全套 8 张图标 `viewBox` 均为 **`32×24`（4:3 比例）**，写死 `32px 32px` 会把瓷盘和菜肴纵向硬拉高 33%。
- **具体改法**：
  - `apps/web/app/game/ending.tsx` L118–124：直接复用 `<ItemIcon id={item.id} />`（或将内联样式改为 `backgroundSize: 'contain', backgroundPosition: 'center'`）。

---

### 【手机】

#### 10. 手机端 HUD 顶栏遇 4–5 字角色名可能截断（其他角色待验证）；底栏 12px 线框图标发虚且缺金钱图标
- **截图**：`m-game-town.png`、`m-game-chat.png`
- **问题**：
  1. 看 `m-game-town.png` 顶栏（`375px` 宽）：右侧 `07:00` + 天气图标 + 3 个 `44×44` 方形操作钮占去 `~222px`，左侧 `.hudContext` 只剩约 **`117px`**。2 个字的 `林遥 · Y1 冬 D1` 已接近极限，一旦选择 `索菲娅·莫拉`、`诺拉·阿齐兹`、`陈嘉宁` 等角色，按宽度推算可能触发 `text-overflow: ellipsis` 截断成 `索菲娅·莫...`（本轮只截了林遥，其他角色待验证）。
  2. 看底栏 5 项数值：`[🪪 23月]` 内的护照图标和右侧 4 项数值的 `.statIcon .icon` 全被缩到 **`12×12px`**（`game.module.css` L1362）。原图标基于 `24×24` viewBox + `strokeWidth="1.8"`，缩半后线宽不足 `1px`，在 `3×` 屏上 `事业` 公文包与 `签证` 图标仍显局促糊团；同时 `£9,000` 缺少独立图标，视觉节律与右侧 4 项不统一。
- **为什么影响体验**：HUD 是玩家全程停留时间最长的界面，角色名被截断与小图标看不清“是什么属性”会直接影响移动端可读性。
- **具体改法**：
  - `apps/web/app/game/hud.tsx` L125–126：手机端去掉中点两侧空格并精简，例如 `{localText(name, locale)}·Y{state.year}{t(\`game.season\${state.quarter}\`)}D{state.day.index + 1}`，并配合 `game.module.css` `@media (max-width: 760px)` 下将 `.clock` 从 `18px` 调到 `16px`、`.hudContext` 字号设为 `12.5px`，可省出约 `25px` 宽度确保 5 字全名不截断。
  - `apps/web/app/game/game.module.css` L1361–1365 & L1381–1388：将 `.statIcon .icon, .hudBottom .icon` 从 `12px` 提到 `14px`，并在 `hud.tsx` 为 `visa` 与 `statIcon` 传略粗一点的 `strokeWidth={2.2}`，让 14px 图标清晰挺拔。

#### 11. 手机端结果页底部三个操作按钮呈参差左对齐堆叠，缺少与首页一致的通栏收口
- **截图**：`m-result.png`
- **问题**：看 `m-result.png` 底部：`[打印或保存为 PDF]`、`[情景实验室 · What-if]`、`[修改输入]` 三个按钮各自按文字宽度左对齐换行堆叠，右边锯齿状差出百余像素，底部显得散乱；相比之下 `m-home.png` 的主按钮 `[开始模拟]` 通栏拉满就干脆得多。
- **为什么影响体验**：结果页阅读很长，底部收尾动作区域本应是最明确的操作出口，当前参差堆叠降低了主次感与完成度（原因在于 `site.module.css` L369–374 只对 `.homeActions` 做了手机单列拉满，未覆盖结果页 `.actions`）。
- **具体改法**：
  - `apps/web/app/result/result-content.tsx` L107：给底部按钮区加上专属类名 `styles.resultActions`（如 `${styles.actions} ${styles.resultActions} ${styles.noPrint}`）。
  - `apps/web/app/site.module.css` `@media (max-width: 600px)` 内增加：`.resultActions { display: grid; grid-template-columns: minmax(0, 1fr); align-items: stretch; gap: 12px; }`（避免误伤 `/simulate` 第 1 步里带纯文本链接 `首页` 的 `.actions`）。

---

## 三、综合评分与前四轮对比

| 评审轮次 | 综合评分 | 主站评分 | 小游戏评分 | 核心变化与本轮定位 |
| :--- | :---: | :---: | :---: | :--- |
| **Round 1（`main 06293e7`）** | **5.0 / 10** | 6.5 | 4.0 | 政务风弹层硬贴在像素地图上、8px 画布字发糊、手机吞半屏 |
| **Round 2（`12.8` + `12.9`）** | **7.5 / 10** | 7.5 | 7.5 | 暖木与草甸全面换肤、DOM 清晰标签，建立起生活模拟独立气质 |
| **Round 3（`12.11` + `13.1` + `13.1b`）** | **7.9 / 10** | 8.0 | 7.8 | 解决手机/桌面布局与单行顶栏，暴露 17 人立绘两代画风割裂与撞脸 |
| **Round 4（`13.3` + `13.4` `f5174d8`）** | **8.4 / 10** | 8.2 | 8.5 | 17 人立绘与行走图统一并恢复 `64×64` 锐度；补齐原创鱼/菜/动物与结局页收口 |
| **Round 5（`a13ee94`，本轮）** | **8.7 / 10** | **8.6** | **8.8** | **首页右栏游戏卡与 `about` 等宽落地；选人页横幅与营业前置修妥；腮红/耳线/鸭帧/成功卡/厨房钓鱼交互收口，整体进入精细打磨期** |

**距 9.0 分还差最后约 0.3 分**：主站只差短页贴底页脚与表单输入框对齐等细节；小游戏则差室内镜头放大（消除四周黑框与巨型标签压床）、横幅 `3:1` 边框去缝、飘字避让，以及下轮补齐高街室外（9 招牌）+ 钓鱼/厨房 + 结局页全流程截屏验收。

---

## 四、下一步最值得做的 5 件事（按投入产出排序）

1. **放开室内画布缩放至紧贴画框（桌面 `2.0×` / 手机 `1.23×`）并去掉家具脚下 stray 黄线**（投入极小，桌面与手机小游戏首屏观感立刻翻倍）
   - 改 `apps/web/app/game/scene.ts` `resizeCamera()` 室内分支去掉 `0.5` 向下取整，搭配 `town-canvas.module.css` 桌面端 `.canvas.interior` `min(416px, ...)`；同时 L376–380 仅在室外或 `exit` 处画门垫黄条。
2. **修复短页面页脚下悬空露白 + 对齐问卷第 1 步输入框 + 拉齐手机结果页底部按钮**（纯 CSS 几行改动，一举抹平主站最后几处桌面/手机毛刺）
   - `site-shell.tsx` + `site.module.css` 加 `.shell` 纵向 Flex 粘底页脚；`form.module.css` 加 `input[maxlength='3'] { width: 240px; }`；`result-content.tsx` + `site.module.css` 给手机结果页按钮区加通栏单列网格。
3. **修净选人页 `.townBanner` 边框 `3:1` 左右露缝，顺手加 `closedPlace` 锁槽留白与 `ending.tsx` 菜肴图标 `contain`**（低成本微调，消掉放大可见的拼装痕）
   - `game.module.css` `.townBanner` 改 `box-sizing: content-box`；`.closedPlace` 改 `padding-right: 24px; border-style: dashed; opacity: 0.78;`；`ending.tsx` 菜肴改复用 `<ItemIcon />`。
4. **解决 `+1 心情` 飘字叠撞 `[床]` 标签 + 手机 HUD 长名防截断与 14px 线框加粗**（明显提升操作与对话时的可读性）
   - `scene.ts` `startFloats()` 避让可见 `spot.label` 边界并给 `.feedback` 加 `z-index: 2`；`hud.tsx` 紧凑化手机上下文分隔符与 `.clock` 字号，将底栏 `statIcon` 提至 `14px`、`strokeWidth={2.2}`。
5. **收紧政策页 `来源清单` 双列与首页右栏卡片副标题，并在下轮补齐高街室外（9 招牌）、钓鱼/厨房、结局页截图闭环**（完成全站 9.0 分收官验收）
   - `policy.module.css` 双列紧凑化 `来源清单` 并限日志行宽 `720px`；`home-content.tsx` 为 `.gameEntry` 补 1 句副标题；下轮抓屏脚本新增走到高街商业区、进入钓鱼/厨房、触发结局页 3 组镜头，彻底验真。
