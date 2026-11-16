> 评审者：agy（gemini-4-hydrogen-xhigh），2026-11-16 第三轮。输入：phase-13 本地构建的截图、`apps/web/public/game/assets/meadow-town` 素材、`apps/web` 只读源码。文中链接指向评审时的临时副本；对应的仓库文件在 `apps/web/public/game/assets/meadow-town/`。

> 评审者：agy（Gemini 4 Hydrogen），2026-11-16（第三轮评审）。  
> 输入：新版桌面 `1280×800（2×，2560×1600）` 11 张与手机 `375×812（3×，1125×2436）` 8 张截图、原创像素素材目录 `assets-meadow-town/`（51 张 `64×64` 立绘、1 张 `960×320` 横幅、9 张 `24×24` 招牌及 `LICENSE.txt`），对照 `/Users/wanruncong/Projects/web-UK/apps/web`、`/Users/wanruncong/Projects/web-UK/packages/game` 只读源码及上一轮复评 [2026-11-15-design-review-2.md](file:///Users/wanruncong/Projects/web-UK/docs/research/2026-11-15-design-review-2.md)。

> **截图核查说明**：本批截图中，`d-game-town.png`、`d-game-event-card.png` 与 `d-game-home-menu.png` 完全一致（均为“家”菜单弹窗）；`m-game-town.png`、`m-game-event-card.png` 与 `m-game-home-menu.png` 也完全一致；`d-game-start.png` 停留在 800px 首屏上半截（未滚动到第二行角色卡）；本批无结局页、室外镇上地图、事件卡与 `brighter-home` 截图。因此，室外招牌挂墙效果、诺拉选人卡排版、结局页换肤与折叠、室外两级高亮标签等项目，均明确区分“截图直接观察”与“素材文件 / 只读源码与 `town.json` 坐标核实”。

---

## 一、新美术评价（13.1 + 13.1b 诺拉与梅芙）

总体而言，本轮终于结束了“把 `16×16` 行走小人放大到 `80×80` 当立绘”的权宜时代，建立起完整的 `64×64` 三表情立绘库、`960×320` 暖色小镇横幅和 `24×24` 店铺招牌体系，且所有素材均清理为 CC0 1.0。但在深入逐像素与跨角色比对后，也暴露出**“两代画风混用”“多人模板撞脸/设定违和”“非整数倍容器缩放”**三类显著问题。

### 1. 风格统一性

1. **最严重问题：前 15 人“脚本粗像素积木风”与诺拉／梅芙“1px 精细 imagegen 风”明显割裂**
   - **现象**（对比 [skilled-worker-neutral.png](../../apps/web/public/game/assets/meadow-town/portraits/skilled-worker-neutral.png)、[hong-kong-bno-neutral.png](../../apps/web/public/game/assets/meadow-town/portraits/hong-kong-bno-neutral.png) 与 [graduate-neutral.png](../../apps/web/public/game/assets/meadow-town/portraits/graduate-neutral.png)、[maeve-neutral.png](../../apps/web/public/game/assets/meadow-town/portraits/maeve-neutral.png)）：
     - 前 15 人由脚本绘制，呈**粗颗粒块面风格**（`2px` 轮廓、粗直角 L 形鼻、矩形腮红、厚黑颈底横条、肩宽达 `48px` 且肩线在 `y=42` 处就水平拉满）；
     - 13.1b 补绘的诺拉（`graduate-*`）与梅芙（`maeve-*`）采用 imagegen 后缩放，呈**原生 `64×64` 1px 精细像素风格**（`1px` 细线轮廓、单像素点鼻、纤细脖颈、窄肩 `42–44px` 且肩线低至 `y=55` 以下、无矩形腮红、带雀斑或细背带结构）。两人放在选人页与林遥／嘉宁同框时，像素密度和人物比例完全不在同一个世代。
2. **诺拉与梅芙三表情切换出现全图色漂与杂散像素**
   - 前 15 人的 `happy` / `worried` 与 `neutral` 仅变动 **46–100 个眼眉嘴颊像素**，底图 100% 锁定。
   - `graduate` 与 `maeve` 因用生成式编辑重出表情，`neutral` 与 `happy`/`worried` **全图变动高达 1,641–1,909 个像素，仅共享 3 个背景色**（头发、肤色、衣物 RGB 全盘轻微飘移，例如 `maeve` 外套与肤色、`graduate` 发色在三表情间肉眼有轻微明暗跳变），且 [graduate-happy.png](../../apps/web/public/game/assets/meadow-town/portraits/graduate-happy.png) 下嘴唇下方（`y=41..42`）残留 1–2 颗杂散亮米色像素。
3. **色板与 UI 融合度（优点）**
   - 51 张立绘共用米白／浅卡其双段底色，`town-banner.png` 与 9 块招牌共用暖木与草甸低饱和色板，与 `12.9` 舞台色（`#f7f1e3` / `#fff9ec` / `#5c432d`）的整体气氛非常和谐。
4. **前端容器非整数倍缩放损伤像素锐度（截图实见）**
   - 在 [game.module.css](file:///Users/wanruncong/Projects/web-UK/apps/web/app/game/game.module.css#L226-L232) 中，桌面头像为 `80×80`（`64×64` 的 `1.25×`），手机对话框 `.dialogueBody .portrait` 为 `60×60`（`64×64` 的 `0.9375×` 缩小，L1293-1296）。在 `m-game-chat.png` 的周沅立绘里，因被缩掉 4 行/4 列像素，能直接看出**左眼比右眼宽、发夹和口袋画笔轻微发糊**。

### 2. 与小镇行走图和地图图块的协调

1. **立绘与 Kenney 行走图之间的对应错位**（对照 `/Users/wanruncong/Projects/web-UK/apps/web/public/game/assets/urban/*.png`）：
   - **戴夫（`dave`）**：行走图 [dave.png](file:///Users/wanruncong/Projects/web-UK/apps/web/public/game/assets/urban/dave.png) 是**全光头**，立绘却画成满头浓密棕发偏分（仅额角略高），且头发右上角（`x=42..44, y=10..12`）还破出一个肤色缺口，看起来像轮廓漏色；
   - **安全帽三人组（`ade`、`family-partner`、`ka-ning-partner`）**：原 Kenney 行走图三人全戴着黄色/橙色安全帽，立绘里索菲娅和许文舒去掉安全帽改画金色长发完全合理，但阿德把安全帽画成了深灰鸭舌帽，行走与对话时的头饰轮廓仍脱节；
   - **陈嘉宁（`hong-kong-bno`）**：行走图穿亮橙上衣、绿裤，立绘却穿**松木绿上衣**——不仅与行走图反了过来，还在选人页与穿绿衬衫的林遥正面撞色；
   - **拉赫曼（`rahman`）**：行走图与戴夫几乎完全同模，立绘虽然加了眼镜和紫背心，但仍用浅桃肤色、红棕偏分头与下巴两点棕色（疑似胡茬），缺乏角色特征；
   - **诺拉（`graduate`）与梅芙（`maeve`）**：`13.1b` 为两人精确调色了 [graduate.png](file:///Users/wanruncong/Projects/web-UK/apps/web/public/game/assets/urban/graduate.png)（黑发黄衣）与 [maeve.png](file:///Users/wanruncong/Projects/web-UK/apps/web/public/game/assets/urban/maeve.png)（铜红发深蓝衣），与各自立绘颜色高度一致，但在行走图与立绘的同步程度上反而好于上述几位老角色。
2. **横幅与地图图块的协调**
   - [town-banner.png](../../apps/web/public/game/assets/meadow-town/town-banner.png) 为 `480×160` 整数 `2×` 放大至 `960×320`，砖墙、绿/红屋顶、遮阳棚、邮筒与长椅都能与游戏镇街风格无缝衔接，且 `m-home.png`、`m-game-start.png` 中央的咖啡馆与河桥裁切构图舒适。
   - **问题在于首页桌面裁切**：`d-home.png` 使用 `height: clamp(120px, 24vw, 190px)`（`site.module.css` L218）+ `cover` 居中裁切，将**右上角黄色太阳顶缘直接削平**，同时把底部小河和木桥裁得几乎不可见。
3. **店铺招牌挂放位置与地图瓦片冲突（源码 + `town.json` 坐标核实）**
   - [art.ts](file:///Users/wanruncong/Projects/web-UK/apps/web/app/game/art.ts#L69-L72) 将 `24×24` 招牌锚在 `(door.x + 8, door.y - 36)`，垂直覆盖 `door.y - 48` 到 `door.y - 24`。
   - 对照 `town.json` 与 `modern-city/tiles.png` 核实：`door.y - 48 .. -32` 一整行在全部 9 栋建筑上都是**赤陶斜屋顶下沿（`gid 14`）**，`door.y - 32 .. -16` 一行则是**咖啡馆／小店的绿白遮阳棚（`gid 24`）**或**其余建筑二层正中窗户（`gid 17/20/22`）**。因此，带顶部挂杆的牌匾会“贴在斜屋瓦上”并盖住半扇二层窗或雨棚上沿。

### 3. 人物辨识度（同模撞脸与体型违和）

原 15 人共用了同一套下颌、耳朵、眼鼻嘴与宽肩模板，导致多组角色高度雷同：

1. **红棕直发女三胞胎（最易混淆）**：[lina-neutral.png](../../apps/web/public/game/assets/meadow-town/portraits/lina-neutral.png)、[priya-neutral.png](../../apps/web/public/game/assets/meadow-town/portraits/priya-neutral.png)、[yao-flatmate-neutral.png](../../apps/web/public/game/assets/meadow-town/portraits/yao-flatmate-neutral.png) 三人共享**同款浅桃肤色、同款同色（红棕）偏分垂肩长发与方脸轮廓**，只靠耳边铅笔／工牌／发夹硬区分；其中普里娅（GP 诊所前台）未体现南亚裔深黑发或偏深肤色特征，与室友周沅、莉娜缩成 `48×48` 后极易认混。
2. **深肤金脏辫女三胞胎**：[family-partner-neutral.png](../../apps/web/public/game/assets/meadow-town/portraits/family-partner-neutral.png)（索菲娅）、[helen-neutral.png](../../apps/web/public/game/assets/meadow-town/portraits/helen-neutral.png)（海伦）、[ka-ning-partner-neutral.png](../../apps/web/public/game/assets/meadow-town/portraits/ka-ning-partner-neutral.png)（许文舒）共享完全相同的深棕肤色 `(164,105,64)` 和方块金色脏辫；其中海伦（ESOL 老师）与许文舒（陈嘉宁的香港伴侣）沿用旧 Kenney 占位行走图配色，导致视觉与设定、角色之间都缺少区隔。
3. **小学生沿用成年男宽肩方颌**：[ka-ning-child-neutral.png](../../apps/web/public/game/assets/meadow-town/portraits/ka-ning-child-neutral.png)（陈乐言）虽在报告中称“较低肩线”，但像素实测其肩线高度（`x=10` 处 `y=42`）与底边宽度（`48px`）与 `skilled-worker`、`jamie` **完全一致**，仅反戴棒球帽，像成年男子而非孩童。
4. **灰帽双胞胎与额头死黑杠**：[ade-neutral.png](../../apps/web/public/game/assets/meadow-town/portraits/ade-neutral.png) 与 [gareth-neutral.png](../../apps/web/public/game/assets/meadow-town/portraits/gareth-neutral.png) 同戴深灰帽＋橙色帽带、同浅桃肤色与灰衬衫；且阿德额头 `y=25..26` 有一条横跨全宽的死黑帽檐条，几乎压在眼睛上方，远看像戴了一半黑框。
5. **灰紫发眼镜两人组**：[hong-kong-bno-neutral.png](../../apps/web/public/game/assets/meadow-town/portraits/hong-kong-bno-neutral.png) 与 [margaret-neutral.png](../../apps/web/public/game/assets/meadow-town/portraits/margaret-neutral.png) 均为同色灰紫分发＋同款黑框眼镜＋青绿色系衣服，区分度偏弱。

### 4. 表情可读性

- **优点**：前 15 人 `happy` 的 `^^` 弯月眼 + 露白齿笑脸（如 `d-game-chat.png` 周沅与各类 `*-happy.png`）情绪直白可爱；诺拉与梅芙的 `happy`、`worried` 神态也很有生气。
- **具体缺陷**：
  1. [dave-happy.png](../../apps/web/public/game/assets/meadow-town/portraits/dave-happy.png)：两撇八字胡直接压在露齿微笑的白牙上缘，胡嘴粘连；
  2. [ade-worried.png](../../apps/web/public/game/assets/meadow-town/portraits/ade-worried.png) 与 [gareth-worried.png](../../apps/web/public/game/assets/meadow-town/portraits/gareth-worried.png)：下垂八字眉末端直接插进黑色帽檐线内，破坏眉形；
  3. [helen-worried.png](../../apps/web/public/game/assets/meadow-town/portraits/helen-worried.png) 与 [ka-ning-partner-worried.png](../../apps/web/public/game/assets/meadow-town/portraits/ka-ning-partner-worried.png)：棕色担忧眉压在金色额前发块上，颜色相近导致左眉几乎隐没；
  4. **眼镜三人组（`hong-kong-bno`、`margaret`、`rahman`）**：`happy` 的弯眼紧贴窄镜框内沿，小尺寸下略显挤；
  5. **诺拉／梅芙**：`graduate-worried.png` 嘴部仅 `1px` 细横线，在手机 `60×60` 缩小容器里易发虚。

### 5. 横幅与招牌质量

- **`town-banner.png`**：架构节奏好（左林荫街屋 → 中央咖啡馆与钟楼 → 右街区，前景花坛与河桥呼应小镇）。需改点：右上角黄太阳太贴顶、轮廓呈略生硬的八边形；地面 4 个 `4px` 高小人过于抽象，右侧棕衣行人几乎融进后方墙壁与长椅。
- **9 块店铺招牌 `signs/*.png`**：
  - `cafe.png`、`pub.png`、`gp.png`、`library.png`、`shop.png`、`station.png` 造型利落、7–8 色控色克制、一眼能认出功能，质量优秀；
  - [signs/college.png](../../apps/web/public/game/assets/meadow-town/signs/college.png)（语言学校）：上方米白方气泡里放了两颗棕色短横，在 `24×24` 尺寸下非常像**机器人脸／幽灵双眼**；
  - [signs/council.png](../../apps/web/public/game/assets/meadow-town/signs/council.png)（市政厅）：灰绿底与石墙色彩拉不开反差，柱廊略粗糊；
  - [signs/visa.png](../../apps/web/public/game/assets/meadow-town/signs/visa.png)（签证中心）：紫底上的带框方页加一点，远看更像拍立得照片或软盘，不够像签证页／护照章。

### 6. 逐项修改清单（具体文件与改法）

| 素材 / 位置 | 问题 | 具体改法 |
| :--- | :--- | :--- |
| `portraits/graduate-{neutral,happy,worried}.png`<br>`portraits/maeve-{neutral,happy,worried}.png` | 与前 15 人 2px 风格不统一；`happy`/`worried` 全图色偏 1,641–1,909 像素；`graduate-happy.png` 嘴下有杂点 | 统一轮廓线粗细、头肩比例（若全员往 2px 清晰块面靠拢，同步微调两人比例与腮红；若走精细风则需批量提精老立绘）。锁定 `neutral` 底图只逐像素改眉眼嘴，消除全图色漂；清除 `graduate-happy.png` `y=41..42` 嘴下亮像素与背景杂点 |
| `portraits/ka-ning-child-*.png` | 沿用成年男 `y=42` 高宽肩线，毫无孩童体态 | 肩线真下移至 `y=50..52`、底边肩宽收窄至 `34–36px`、下颌改圆润窄下巴并微放大双眼比例 |
| `portraits/priya-*.png`<br>`portraits/lina-*.png`<br>`portraits/yao-flatmate-*.png` | 红棕直发浅肤三胞胎高度撞脸 | 普里娅改深黑高马尾/低盘发＋暖橄榄南亚肤色；周沅改深茶色短发或低马尾＋黄色发夹；莉娜保留棕栗偏分短发/斜刘海，彻底拉开发色与轮廓 |
| `portraits/helen-*.png`<br>`portraits/ka-ning-partner-*.png`<br>`portraits/family-partner-*.png` | 深肤金色方块脏辫三胞胎撞脸，且海伦/许文舒与设定违和 | 仅索菲娅（`family-partner`）保留深肤与自然波浪卷发（去排砖方格）；海伦改浅暖肤短卷发＋红发带（同步 `urban/helen.png`）；许文舒（`ka-ning-partner`）改黑发低髻＋东亚肤色＋紫衣（并同步去掉 `urban/ka-ning-partner.png` 的安全帽改为黑发紫衣） |
| `portraits/ade-*.png`<br>`portraits/gareth-*.png` | 双灰帽橙带撞脸；阿德额头 `y=25..26` 死黑横条压眼；`worried` 眉毛扎进帽檐 | 去掉阿德额前跨脸黑条，改卡其/藏青工装帽或对应 `urban/ade.png` 的橙黄安全帽＋深暖肤；加雷思保留深灰平顶邮差帽＋斜挎邮袋带；两人 `worried` 眉毛整体下移 1–2px 避开帽檐 |
| `portraits/dave-*.png` | 与光头行走图不符；头发右上 `x=42..44, y=10..12` 缺口；`dave-happy` 胡子压白牙 | 补齐右上角轮廓缺口；建议改地中海光顶＋两侧短棕发呼应 `urban/dave.png`；`dave-happy.png` 八字胡上移 1–2px 露出上唇留白 |
| `portraits/rahman-*.png` | 与戴夫/林遥趋同，下巴两点胡茬生硬 | 加深一档暖棕肤色、加浓黑发与连贯短须；微扩眼镜框高度让笑眼留出 1px 呼吸 |
| `portraits/hong-kong-bno-*.png`<br>`portraits/margaret-*.png` | 同为灰紫分发＋方眼镜＋绿/青衣，嘉宁还与林遥撞绿 | 嘉宁上衣改为暖橙/砖红色高领衣呼应 `urban/hong-kong-bno.png`；玛格丽特头发调为银白并加深胸花/眼尾刻画 |
| `portraits/helen-worried.png`<br>`portraits/ka-ning-partner-worried.png` | 担忧眉压在浅金发块上对比度极低 | 改用深褐描边色绘制 `worried` 眉毛并略下移避开额发 |
| `town-banner.png` | 太阳贴顶、八边形偏硬；地面行人偏简陋、右侧棕人融墙 | 将太阳逻辑坐标下移 4–5px 并修圆；给 4 个行人加肩袖高光与更深轮廓；微调背景暗墙反差 |
| `signs/college.png`<br>`signs/council.png`<br>`signs/visa.png` | `college` 气泡两点像机器人脸；`council` 底色偏灰对比弱；`visa` 像拍立得照片 | `college` 去两点改斜横波纹或“书＋单气泡”；`council` 加深底色至深松木绿提高白柱对比；`visa` 改为带折角护照本／印章线条 |
| `apps/web/app/game/art.ts`（`signPosition`）<br>`apps/web/app/game/game.module.css`<br>`apps/web/app/site.module.css` | 招牌压屋瓦与二层窗；头像 `80`/`60` 非整数缩放；首页横幅切太阳与小河 | 招牌锚点下调或侧移至门侧实墙（或缩 `16×16` 挂门楣），避开屋瓦；对话框与选人头像固定 `64×64` 或 `96×96`（手机必改 `64×64`）；`.gameBanner` 设 `background-position: center 75%` 或略增高至 `210px` |

---

## 二、12.11 收尾项落实逐条核查

| 复评来源与事项 | 判定 | 截图与源码依据 |
| :--- | :--- | :--- |
| **§二 1**：手机室内去大黑边、Dock 不再拦腰截断进度卡 | **已落实** | **截图实见** `m-game-home-interior.png`：室内 `.canvas.interior` 已按 `18 / 13` 比例限高 `310px`（`town-canvas.module.css` L103-107），上下无效黑边消失，`现行法律` / `改革后` 两张卡片与免责说明完整位于 4 键 Dock 之上（室外高度待补室外截图确认） |
| **§二 2**：桌面 `走出家门` 不被遮挡；互动按钮不折行、触屏去键盘提示、显示对象名 | **已落实** | **截图实见** `d-game-home-interior.png` / `m-game-home-interior.png`：互动按钮移至画布下方独立 `.interactionBar`（`game-client.tsx` L576-584），房门与 `走出家门` 完全露出；单行显示 `[E] 互动：床`（桌面）与 `互动：床`（手机），无折行。（注：非互动状态如 `m-game-chat.png` 背景可见 `.interactionBar` 留出一整条 `60px` 空米色底） |
| **§二 3**：结局页评估表换肤、操作前置、未解锁成就折叠、合照留距 | **源码已落实（待补截图）** | **源码核实**：`game-view.tsx` L1045-1112 已把核心操作组前移并把未获得成就收入 `<details>` 计数折叠；`game.module.css` L27-44 已通过 `--assessment-*` / `--badge-*` 变量覆写 `result.module.css` 冷灰样式；`.memoryPhoto` 已补 `margin-bottom: 10px`（L714）。因无新版结局页截图，视觉效果待后续补截验收 |
| **§二 4**：室外标签“附近”与“当前可互动”两级区分、边缘裁切钳位 | **代码与室内截图落实（室外待补截）** | **截图实见** `d-game-home-interior.png` / `m-game-home-interior.png`：当前目标 `床` 亮金粗框，`书桌` / `厨房` 等保持暗木细框；**源码核实**：`town-canvas.module.css` L64-76 已拆分 `data-highlighted` 与 `data-nearby`，`scene-text.ts` L47-66 已加四边 6px 钳位并隐藏离屏标签（待室外截图验收） |
| **§二 5**：彩色 Emoji 改单色内联 SVG、当前所在地点选中态、HUD 焦环 | **已落实** | **截图实见** `d-game-home-interior.png` / `m-game-home-interior.png` / `m-game-morning-card.png`：锁、音量、快进、月亮与天气全换为 `currentColor` 单色 SVG（`game-view.tsx` L55-90），`m-*` 顶栏亮蓝 `⏩` 已消失；右侧栏 `家` 已带绿底金框选中态（`aria-current='location'`）；`game.module.css` L78-81 已补 `--gold` 焦环。（轻微细节：`postBadge`/`mailBadge` 仍沿用字符 `✉`） |
| **§二 6**：对话框铭牌防与 `✕ 关闭` 重叠、缩短句留白 | **已落实** | **截图实见** `d-game-chat.png` / `m-game-chat.png`：`周沅 · 林遥的室友，装裱员` 铭牌预留了 `108px`（`game.module.css` L824）且允许换行，与关闭按钮分离；`.dialogueLine` `min-height` 降为 `1.7em`（L872），按钮上方不再留大段空白 |
| **§二 7**：手机 HUD 第二行五项列宽与事业图标 | **已落实** | **截图实见** `m-game-home-interior.png`：`[证件SVG] 23月`、`£9,000`、`☺ 65`、`♥ 75`、`[书SVG] 45`、`[公文包SVG] 10` 间距匀称，事业公文包图标清晰可辨，列宽足以容纳五位数存款与三位数属性 |
| **§二 8**：桌面 800px 首屏截断、明亮住处泛白、室内绿缝 | **已落实（局部暖光据源码核实）** | **截图实见** `d-game-home-interior.png`：桌面画布限高 `360px` 后，1280×800 首屏完整包进两条进度卡与底部 3 按钮；`m-game-home-interior.png` 经像素检查已无 `#a8c580` 绿缝；**源码核实** `scene.ts` L1115-1125 已将 `brighter-home` 改为窗户／台灯局部暖光（待亮屋对比图确认） |
| **§一 P8/P10**：主站手机顶栏单行、首页手机按钮等宽、`/simulate` 进度条 | **已落实** | **截图实见** `m-home.png`：顶栏已变单行（`移民模拟` `政策依据 方法说明` `中` `EN`），`开始模拟` 与横幅入口卡片等宽单列；**截图实见** `d-simulate.png`：步骤标题上方已新增 `6px` 细蓝步骤进度条。（注：未在 12.11 范围内的 `d-about.png` 720→1064→720 宽度跳变与 `d-home.png` 右侧留白仍存在） |

---

## 三、整体观感评分与对比

- **Round 1（main `06293e7`）**：**5.0 / 10**（网站 6.5 / 小游戏 4.0）
- **Round 2（`12.8` + `12.9`）**：**7.5 / 10**（网站 7.5 / 小游戏 7.5）
- **本轮（Round 3，`12.11` + `13.1` + `13.1b`）**：**7.9 / 10**（较上一轮提升 **+0.4 分**；其中主站 **8.0 / 10**，小游戏 **7.8 / 10**）

**为什么是 +0.4 而不是直接冲上 8.5–9.0？**
1. **布局与界面工程已接近完成线（8.5 水准）**：12.11 把第二轮列出的手机黑边、Dock 截卡、桌面挡标签、彩色 Emoji、800px 截断与主站单行顶栏几乎全数扫清，主站靠首页 `town-banner.png` 小游戏卡片自然串联起工具与游戏两端；
2. **新美术补上了“有脸有表情有招牌”的空白，却也引入了最拖分的新短板**：诺拉与梅芙（imagegen 1px 精细风＋三表情全图色偏）和前 15 人（脚本 2px 粗像素＋多人撞脸、小学生成年肩、光头变浓密发）放在一起时，**统一性与辨识度反而不及预期**；再叠加手机 `60×60` 缩小头像造成压像素、桌面选人页被 `280px` 横幅顶出首屏按钮，以及本轮缺少室外与结局实景截屏验证，综合止步于 **7.9**。一旦把画风统一、撞脸拆开并恢复像素整数容器，整体极易跨过 **8.5 精品线**。

---

## 四、下一步最值得做的 5 件事

1. **统一 17 人立绘像素规格，消除诺拉／梅芙画风割裂与全图色漂**
   - 选定唯一轮廓与头肩比例规范（建议全套立绘向统一的 `32×32` 逻辑网格→`2×` 导出 `64×64` 或同线条粗细靠拢，停用直接让生图模型重出全图的流程），重修 `graduate-*.png` 与 `maeve-*.png` 并在 `happy`/`worried` 中严格锁定底层发肤衣背景像素，清掉 `graduate-happy.png` 嘴角杂点。
2. **拆开多组同模撞脸与设定错位，修掉表情穿模**
   - 集中改造最显眼的 6 组文件：`ka-ning-child-*.png` 真正收窄至孩童肩宽；拆开 `priya` / `lina` / `yao-flatmate` 三胞胎发色与肤色；拆开 `helen` / `ka-ning-partner` / `family-partner` 的同款深肤金脏辫（并同步调整 `urban/ka-ning-partner.png` 去掉安全帽）；修掉 `ade` 额前黑横杠并拆开 `ade` / `gareth` 的同款鸭舌帽与 `worried` 撞眉；修 `dave` 头发缺口、改光顶并上移笑脸胡须；把 `hong-kong-bno` 衣服从绿改橙以避开与林遥撞色。
3. **修复头像缩放锯齿、首页横幅裁切、选人首屏与招牌挂墙位置（纯前端小改即可立效）**
   - 将 [game.module.css](file:///Users/wanruncong/Projects/web-UK/apps/web/app/game/game.module.css) 手机对话头像由 `60×60` 改为 `64×64`（frame `68×68`），桌面与选人头像定为 `64×64` 或 `96×96`；将选人页 `.townBanner` 上限由 `280px` 收窄到 `200–220px`，让 `1280×800` 首屏能露出第一排两位主角卡片与按钮；
   - 微调 [town-banner.png](../../apps/web/public/game/assets/meadow-town/town-banner.png) 太阳高度与 [site.module.css](file:///Users/wanruncong/Projects/web-UK/apps/web/app/site.module.css) `.gameBanner` 垂直锚点，保住太阳与小河桥；把 `art.ts` 中 `signPosition` 避开屋瓦（改放门侧墙面或缩为 `16×16` 门楣挂牌），并重绘 `signs/college.png`（去机器人脸感）、微调 `council.png` / `visa.png`。
4. **修好截屏验收脚本，补齐室外／结局实图并清理主站最后两处排版遗留**
   - 修复脚本停在“家菜单”的问题，补齐**室外小镇地图（实测 9 块招牌、两级高亮标签、边缘钳位）、事件卡、结局页（暖木评估表与折叠成就）、明亮住处**的桌面/手机截图；顺手拉齐 `d-about.png` 720/1064px 容器宽度与 `d-home.png` 右侧留白，并将右侧 16 地点把营业中前置、关门地点后置分组。
5. **在已落地的静态地图上叠加轻量动态氛围细节**
   - 在保证文字标签稳定与支持 `prefers-reduced-motion` 的前提下，为池塘／河面水波、树梢微风或小动物点缀低频轻量帧动画，打破静止画布感，把小镇整体观感推向 8.5–9.0 精品水准。
