> 评审者：agy（gemini-4-hydrogen-xhigh），2026-11-16 第四轮。输入：线上版（main f5174d8）桌面 2 倍、手机 3 倍无头截图 25 张，17 人立绘对照表，`meadow-town` 素材，`apps/web` 只读源码。截图未入库；文中素材链接已改成指向仓库路径。

# 英国移民路径模拟 & 「移民生活 Immigration Life」第四轮视觉与美术评审

> 评审者：agy（Gemini 4 Hydrogen），2026-11-16（第四轮评审）。  
> 输入：线上版桌面 `1280×800（2×）` 10 张（`d-*.png`）、手机 `375×812（3×）` 7 张（`m-*.png`）、专项实景截图 7 张（`124-town-0700.png`、`125-green-lunch.png`、`125-green-menu.png`、`125-home-base.png`、`125-home-bright.png`、`125-ending.png`、`125-ending-mobile.png`）、17 人对照表 `portraits-sheet.png`，以及原创像素素材库 `assets-meadow-town/`（51 张 `64×64` 立绘、9 张 `24×24` 招牌、`town-banner.png`、6 条鱼、8 道菜、3 种动物 SVG），对照 `/Users/wanruncong/Projects/web-UK/apps/web` 只读源码。
>
> **素材与对照表核查说明**：本轮比对发现 `portraits-sheet.png` 为 13.4 热修前旧拼图（图上 `ka-ning-child` 下巴带暗线、`rahman`/`lina`/`jamie`/`ka-ning-partner`/`yao-flatmate` 五人同穿紫衣），而随附的 `assets-meadow-town/portraits/*.png`（与 `apps/web/public/game/assets/meadow-town/portraits/` 完全一致）以及线上实机截图 `d-game-chat.png`、`m-game-chat.png`、`125-ending.png` 均已更新为热修后版本。另，`125-ending.png` 与 `125-ending-mobile.png` 底部重复出现的 `← 返回模拟器` 顶栏仍为长页拼图抓屏工具伪影，非页面 DOM 问题。

---

## 一、第三轮修改清单（§一.6）与下一步五件事（§四）逐条核查

### （一）第三轮 §一.6 逐项修改清单（12 项）

| 序号 | 第三轮项目 | 判定 | 核查依据（截图 + 素材 + 源码） |
| :--- | :--- | :--- | :--- |
| **1** | `portraits/graduate-*.png`、`maeve-*.png`（统一 2px 画风、消除全图色漂与嘴下杂点） | **部分解决** | **已解决主体**：两人已彻底重绘至与前 15 人完全统一的 `2px` 轮廓、头肩比例（`y=48` 宽 `34px`、`y=58` 宽 `48px`）与腮红结构；`graduate-happy`/`worried` 仅改动 `88 / 51` 像素、`maeve-happy`/`worried` 仅改动 `91 / 53` 像素，100% 锁定底图，彻底消除此前 1,641–1,909 像素全图色漂与 `graduate-happy.png` 嘴下杂点。<br>**遗留小瑕**：固定坐标 `4×2` 腮红矩形覆盖了脸颊外侧非肤色像素——`graduate-happy.png` 左颊边缘 `(21..23, 34..35)` 与右发边 `(42, 34..35)` 的黑发/轮廓被擦成肤色缺口；`maeve-happy.png` 原有的 4 颗雀斑被腮红抹掉 3 颗（仅左脸颊保留 1 颗单点）。 |
| **2** | `portraits/ka-ning-child-*.png`（收窄孩童肩宽、圆润下颌） | **已解决** | 实测 `ka-ning-child-neutral.png`：肩线真正收窄至 `32px`（`y=58` 仅占 `x=16..47`，`y=48` 颈部 `12px`），换穿暖棕黄条纹 T 恤并清除此前热修前下颌胡须暗线，反戴棒球帽童态成立。 |
| **3** | `portraits/priya-*.png`、`lina-*.png`、`yao-flatmate-*.png`（拆开红棕直发浅肤三胞胎） | **部分解决** | **主体已彻底拆开**：普里娅改南亚暖橄榄肤 `(190,151,102)` + 黑发侧高马尾橙发圈 + 青绿工牌服；周沅（`yao-flatmate`）改深咖齐肩bob头 + 金发夹 + 陶红上衣 `(163,79,72)`（`d-game-chat.png`、`m-game-chat.png` 实见）；莉娜保留栗棕斜分短发 + 耳边铅笔 + 紫毛衣。仅 `yao-flatmate-happy.png` 左颊腮红同样擦掉了 `(21..22, 34..35)` 4 颗发缘轮廓像素。 |
| **4** | `portraits/helen-*.png`、`ka-ning-partner-*.png`、`family-partner-*.png`（拆开深肤金脏辫三胞胎并同步行走图） | **部分解决** | **主体与行走图已拆开**：索菲娅（`family-partner`）保留深肤与自然波浪棕金长发（去掉生硬砖块感）+ 浅紫衣；海伦改浅暖肤 `(240,192,157)` + 棕卷短发配红发带 + 黄围巾青衣（`urban/helen.png` 已同步）；许文舒（`ka-ning-partner`）改浅东亚肤色 `(233,185,143)` + 黑发低髻 + 金耳饰 + 藏蓝翻领衫（`urban/ka-ning-partner.png` 已同步去掉安全帽改黑发蓝衣）。仅 `family-partner-happy.png` 腮红擦掉了 `(21..22, 34..35)` 与 `(42, 34..35)` 的发缘暗线。 |
| **5** | `portraits/ade-*.png`、`gareth-*.png`（拆开双灰帽、去阿德额头黑条、避开 `worried` 撞眉） | **已解决** | 阿德改深暖棕肤 `(173,117,79)` + 黄色安全帽（同步 `urban/ade.png`）+ 灰工装工牌，额前死黑横条完全消失；加雷思保留浅桃肤 + 深灰平顶邮差帽金徽 + 棕色斜挎邮袋带；两人 `*-worried.png` 下垂眉均已避开帽檐。 |
| **6** | `portraits/dave-*.png`（改光顶呼应行走图、补缺口、笑脸胡须避开白牙） | **已解决** | 已改为光滑头顶 + 两侧短棕发（与 `urban/dave.png` 光头行走图一致），右上角破洞已补齐；`dave-happy.png` 两撇八字胡位于白牙上方，留出完整上唇肤色间距。 |
| **7** | `portraits/rahman-*.png`（加深暖棕肤 + 黑发连贯短须、扩笑眼间距） | **部分解决** | 已加深为暖棕肤 `(189,140,100)` + 浓黑发 + 连贯络腮短须 + 紫马甲白领衬衫（同步 `urban/rahman.png`），`rahman-happy.png` 笑眼清晰居中于镜框内。小瑕疵：右侧耳前 `(45..47, 27..35)` 有一条垂直黑色边线贴住右耳（与左侧露耳不对称），且 `rahman-happy.png` `(41..42, 35)` 腮红误涂掉 2 颗胡须。 |
| **8** | `portraits/hong-kong-bno-*.png`、`margaret-*.png`（嘉宁换橙衣、玛格丽特银发） | **已解决** | 陈嘉宁（`hong-kong-bno`）已换穿陶橙/砖红高领毛衣 `(188,106,67)`（`d-game-start.png` 与 `urban/hong-kong-bno.png` 同步），与林遥绿衣彻底拉开；玛格丽特头发调为银灰白高髻（`125-green-lunch.png` 行走图同步银发、`125-ending.png` 笑脸清晰）+ 胸花。 |
| **9** | `portraits/helen-worried.png`、`ka-ning-partner-worried.png`（担忧眉在亮发上对比弱） | **已解决** | 两人已分别改用浅暖肤与清晰额头轮廓，`*-worried.png` 深褐担忧眉落在素净额头皮肤上，对比清晰。 |
| **10** | `town-banner.png`（下移并修圆太阳、加强地面行人、微调墙面反差） | **已解决** | 实测像素坐标：太阳由贴顶下移至 `y=48..93`（2× 像素，即逻辑 `y=24..46`）且轮廓圆润；4 个行人增加深描边与衣色区分，右侧棕墙旁行人改穿蓝灰大衣配深帽，不再融墙。 |
| **11** | `signs/college.png`、`council.png`、`visa.png` | **已解决** | `college.png` 重绘为翻开书本＋波浪线气泡，机器人脸感彻底消失；`council.png` 底色加深为深松木绿，白柱山墙对比锐利；`visa.png` 重绘为折页护照＋印章图案，一眼可辨。 |
| **12** | `art.ts` `signPosition` / `game.module.css` 整数头像 / `site.module.css` 首页横幅 | **部分解决** | ① `art.ts` L69-72 改为 `(door.x - 8, door.y - 8)` 配合 `scene.ts` L353 `.setDisplaySize(16, 16)`，对照 `town.json` 全部 9 栋建筑坐标核实均准确落在门左侧实墙瓦片 `(tx-1, ty-1)`（`decor` `16/19/21`），不再压屋瓦或二层窗；② `game.module.css` L216-232, L705-708, L1033-1037, L1431-1439 全站立绘统一为原生 `64×64`（外框 `72×72` / 手机 `68×68`），`d-game-chat.png` 与 `m-game-chat.png` 锐利无锯齿；③ `site.module.css` L216-221 首页 `.gameBanner` 已用 `aspect-ratio: 3 / 1; background-size: contain`，`d-home.png` 与 `m-home.png` 均完整露出太阳与小河木桥。<br>**未尽点**：选人页 `.townBanner`（`game.module.css` L154-162）仍用 `height: clamp(144px, 26vw, 210px); background-size: cover`，导致 `d-game-start.png` 依然把太阳顶缘与河桥切掉，且 `1280×800` 首屏按钮文字仍落在视口底缘外。 |

---

### （二）第三轮 §四 最值得做的 5 件事落实情况

| 第三轮 §四 项目 | 判定 | 核查依据 |
| :--- | :--- | :--- |
| **1. 统一 17 人立绘像素规格，消除诺拉／梅芙画风割裂与全图色漂** | **部分解决** | 17 人现已完全统一至 `2px` 轮廓与同源头肩模板，`happy`/`worried` 仅改动 46–100 像素，全图色漂零残留；仅余 5 张 `*-happy.png` 腮红越界擦除发缘/雀斑/胡须的批量脚本边界问题。 |
| **2. 拆开多组同模撞脸与设定错位，修掉表情穿模** | **已解决** | 6 组问题角色与全部 `urban/*.png` 同步拆开改造完成，阿德/加雷思 `worried` 眉与戴夫笑脸胡须均已避让干净。 |
| **3. 修复头像缩放锯齿、首页横幅裁切、选人首屏与招牌挂墙位置** | **部分解决** | `64×64` 头像、首页 `.gameBanner`、`signPosition` 与 3 块招牌已落地；选人页 `.townBanner` 在桌面端仍用 `cover` 裁掉太阳与桥，且 `210px` 高度让 `d-game-start.png` 第一排主按钮文字掉在 800px 视口以下。 |
| **4. 修好截屏验收脚本，补齐室外／结局实图并清理主站最后两处排版遗留** | **部分解决** | **已补齐并验证实图**：`d-game-town.png`（室外）、`125-green-lunch.png`、`125-home-bright.png`、`125-ending.png`、`125-ending-mobile.png` 均已真实截出并验证通过——室外两级高亮标签（`data-nearby` 亮金粗框 vs `data-highlighted` 暗木框）与边缘钳位生效（`长椅` 不再半字被切）；结局页暖木 `<AssessmentColumns>`、操作前置、未获得折叠与合照留距生效；`brighter-home` 改局部暖光后木地板饱和不泛灰。（注：9 招牌所在的镇街建筑区未落入本次绿地视口截图内。）<br>**未解决遗留**：① `d-about.png` 720→1064→720px 宽度跳变仍在（`about-content.tsx`）；② `d-home.png` 桌面右侧大片空白仍在，且 `.gameEntry` 标题 `玩一局 · Immigration Life` 恰好掉出 800px 首屏只露出图；③ 右侧 16 地点仍未把营业中前置、关门地点后置（`d-game-home-interior.png` 中间堵着 9 个关门按钮）。 |
| **5. 在已落地的静态地图上叠加轻量动态氛围细节** | **已解决** | 13.3 已上线绿头鸭、橘纹猫、知更鸟三只小动物按季节/天气/时段巡游与双帧步态（`wildlife.ts`、`scene.ts` L1446-1484，支持 `prefers-reduced-motion`），`125-green-lunch.png` 池塘已实见绿头鸭，叠加鸟鸣/水声/雨声/室内音与夜间窗光、节庆篝火烟花，活力大增（若再补上鸭子第 2 帧水波微动与池塘高光闪点会更生动）。 |

---

## 二、新增鱼、菜、动物图标（13.3）的风格统一性评价

整体而言，13.3 原创的 **6 条鱼（`fish/*.svg`）、8 道菜（`dishes/*.svg`）和 3 只小动物（`animals/*.svg`）** 与「暖木与草甸」的整体美术语言**高度统一**，是本轮最加分的亮点之一：

1. **色板与材质调性高度克制**：全部采用 `shape-rendering="crispEdges"` 低饱和暖大地色系，没有使用刺眼高饱和纯色或硬黑描边。例如 8 道菜统一盛在奶白浅卡其瓷盘（`#f4e7c6` 配 `#6a7c7c` 边影）上，炸鱼薯条的金棕（`#b98643` / `#ead29b`）、烤土豆熔化的黄油（`#efb845`）、玻璃罐草莓酱（`#bacdc1` 罐身配 `#b4514e` 果酱）与羊皮纸背包/收藏册底色 `#f4ead5` 融合得非常温润。
2. **地道英伦物种与造型辨识度**：6 条鱼均为英国常见淡水鱼且轮廓特征准确——斜斑河鲈（`perch` 带 `#dd9950` 橙鳍与竖纹）、细长尖吻狗鱼（`pike` 带 `#d6d0a1` 斑点）、银身红鳍拟鲤（`roach` 带 `#be6253` 红鳍）、金棕鲤鱼（`carp`）、深绿丁鱥（`tench`）与银鳊（`bream`）；3 只小动物分别是绿头鸭（`#427b64` 鸭头）、橘条纹猫（`#bb8d59`）与英国标志性的红胸知更鸟（`#c9744f` 胸羽），在 `125-green-lunch.png` 的蓝绿池塘中极为自然。
3. **两处细微画风/技术落差（不影响大局但可顺手提纯）**：
   - **新旧图标跨代感**：原有的外部物品图标（`items/tea.png`、`biscuits.png`、`cake.png`、`meal.png` 与 `crops/*.png`）仍保留早期粗黑 `#000` 描边与高对比阴影；在背包里与无纯黑描边的新鱼/新菜同框时，新图标明显更柔和高级，未来若有余力可为常用杂货补齐同款 SVG 替换；
   - **细节精度瑕疵**：① `dishes/summer-corn.svg` 使用了 `<path stroke="#b78037" .../>` 画玉米粒竖线，未设整数填充块而落在了 `.5` 像素网格线上（其余 16 个 SVG 均为纯 `<path fill>` 整数网格）；② `animals/duck.svg` 的第 1 帧（`translate(0 0)`）与第 2 帧（`translate(16 0)`）路径坐标**完全相同**，导致池塘里的鸭子游动时帧动画实质静止（而 `cat.svg` 会换脚、`robin.svg` 会跳跃 `1px`）。

---

## 三、新发现及未尽问题（按影响程度排序）

### 1. [高] 13.3 钓鱼与做饭成功卡 `.catchCard` 图标被内联样式锁死在 32×32 左上角
- **现象与源码**：`game.module.css` L1157-1160 为钓鱼收获与厨房出锅的庆祝卡设置了 `.catchCard > span { width: 72px; height: 72px; }`，原意是将新画的鱼或菜放大到 72px 居中展示；但 `life-overlays.tsx`（L551 `Kitchen`、L875 `Fishing`）调用的 `<ItemIcon />`（L144-152）在元素上硬编码了内联 `style={{ backgroundSize: '32px 32px', backgroundPosition: '0 0' }}`。由于内联样式优先级高于 CSS 且容器设了 `no-repeat`，实际界面中这枚 72×72 的容器里**只在左上角缩着一个 32×32 小图标**，右侧与下方大片留空、视觉重心歪斜。
- **涉及文件与改法**：
  - `apps/web/app/game/life-overlays.tsx`（`ItemIcon` L139-155）：移除写死的 `'32px 32px'`，改为百分比缩放——作物图集（6 帧横向）设 `backgroundSize: '600% 100%'`、`backgroundPosition: '100% 0'`，单图 SVG/PNG 设 `backgroundSize: 'contain'`、`backgroundPosition: 'center'`，即可在 `32×32` 背包格与 `72×72` `.catchCard` 间无损自适应。

### 2. [中高] 桌面端首页（1280×800）首屏裁掉游戏卡标题且右侧空旷；选人页横幅仍切太阳并顶出按钮
- **现象与截图**：
  - `d-home.png`：`.gameEntry` 插在 `720px` 窄栏内 `开始模拟` 下方，`240px` 高的横幅把标题 `玩一局 · Immigration Life` 刚好挤出 `800px` 首屏底线（桌面用户首屏只见一张图、不见标题文字）；同时右侧 `344px` 仍是大片空白。
  - `d-game-start.png`：`.townBanner`（`game.module.css` L154-162）仍用 `height: clamp(144px, 26vw, 210px)` + `cover`，上沿依然把太阳削平、下沿切掉河桥；且总高度使第一排主角卡片底部的 `和林遥开始` / `和陈嘉宁开始` 按钮文字再次卡在 `800px` 视口底缘之下。
- **涉及文件与改法**：
  - `apps/web/app/home-content.tsx` & `apps/web/app/site.module.css`：在桌面端（`@media (min-width: 960px)`）把首页上方主区设为双栏布局（左栏 `≤ 720px` 放标题、简介、范围与 `开始模拟`；右栏 `~340px` 放 `.gameEntry` 暖木预告卡 + 1 句副标题），既填满桌面右侧空白、明确分隔政务与游戏气质，又让 `本机保存的情景` 和游戏卡标题稳进 800px 首屏。
  - `apps/web/app/game/game.module.css`（L151-165）：选人页 `.welcome` 顶部改为左右排布（左列标题 `移民生活` / `Immigration Life` 与引导语，右列固定 `aspect-ratio: 3 / 1; width: min(480px, 100%); background-size: contain` 的 `.townBanner`），或单列时将 `.townBanner` 设为 `max-width: 510px; aspect-ratio: 3 / 1; background-size: contain;`（高 `170px`），既 100% 保住太阳与河桥，又把第一排主角按钮完整拉回 `1280×800` 首屏内。

### 3. [中高] 5 张 `*-happy.png` 立绘腮红越界擦除发缘/雀斑/胡须 + `rahman` 右耳旁黑条
- **现象与像素核查**：
  - 脚本按固定坐标 `(21..24, 34..35)` 与 `(39..42, 34..35)` 绘制笑脸腮红，覆盖了底层深色像素：`graduate-happy.png` 左颊黑发与轮廓缺口、`family-partner-happy.png` 与 `yao-flatmate-happy.png` 脸颊发缘轮廓断裂、`maeve-happy.png` 右颊与左颊 3 颗雀斑消失仅剩 1 颗、`rahman-happy.png` 右脸颊 2 颗胡须被抹成肤色；
  - `rahman-*.png` 右耳内侧 `(45..47, 27..35)` 有一条垂直黑色边线，左耳却为正常肤色，左右不对称。
- **涉及文件与改法**：
  - `apps/web/public/game/assets/meadow-town/portraits/{graduate,family-partner,yao-flatmate,maeve,rahman}-happy.png` & `rahman-{neutral,worried}.png`：调整立绘生成/修图脚本，仅当对应坐标在 `neutral` 图上为纯肤色时才叠加腮红（或避开发丝、轮廓与雀斑像素），并清理 `rahman` 右耳前 `(45..47, 27..35)` 杂黑线。

### 4. [中] 做饭步骤按钮无间隙同权重粘连；钓鱼“简易模式”开关缺少选中态视觉反馈
- **现象与源码**：
  - `life-overlays.tsx` L582-601（`Kitchen`）：正在做饭时，`当前步骤按钮`、`跳过操作，直接做好`、`返回配方` 三个按钮全部套用重色绿主按钮 `styles.button`，且直接裸放在 `.kitchen` 容器中（未包进 `.buttons` flex 容器），按钮间距缺失且没有主次层级；
  - `life-overlays.tsx` L857-864（`Fishing`）：`简易模式（2 秒）` 开关同样使用 `styles.button` 配 `aria-pressed={easy}`，而 `game.module.css` 未定义 `.button[aria-pressed='true']` 或 `.secondary[aria-pressed='true']` 样式，开启与关闭外观完全相同。
- **涉及文件与改法**：
  - `apps/web/app/game/life-overlays.tsx` & `apps/web/app/game/game.module.css`：为 `Kitchen` 操作区加上 `.buttons`（主步骤用 `styles.button`，`跳过操作` 与 `返回配方` 改用 `styles.secondary`）；为 `Fishing` 的 `简易模式` 开关改用 `styles.secondary`，并在 `game.module.css` 补充 `.theme .secondary[aria-pressed='true']`（如深松木绿/琥珀框 + `✓` 标记或高亮底色），只保留 `抛竿`/`收竿` 为实心绿主按钮。

### 5. [中] 右侧 16 地点仍未把营业中前置；`✉` / `✈` / `⌂` 仍用字符；`about` 宽度跳变与零星收尾
- **现象与依据**：
  - **地点列表未分组排序**：`d-game-home-interior.png` 与 `125-green-lunch.png`（`game-client.tsx` L447）仍按静态数组顺序列出 16 地点，07:00 时 9 个带锁关门地点全堵在 `家` 与 `火车站/菜地/池塘/绿地` 之间；
  - **零星系统字符**：`game-client.tsx` L593 与 `scene.ts` L551 的 `✉`、以及 `life-overlays.tsx` L82 `TravelCard` 中的 `✈` / `⌂` 仍使用易被移动系统渲染成彩色 Emoji 的字符；
  - **细节打磨**：① `about-content.tsx` 上下两段 `720px` 夹着中段 `1064px` `.ruleSets` 依然跳宽；② `125-ending.png` 中 `常想起的人` 的 `64×64` 头像（`.memoryPortrait`）与镇民列表 `.smallPortrait` 若补上一圈 `2px solid var(--line)` 小木框会更协调，`.achievementColumns` 第二栏 `<details>`（`▶ 未获得 (23)`）顶缘也可与左侧 `<h3>已获得 (0)</h3>` 基准对齐并加大底部间距；③ `animals/duck.svg` 第 2 帧建议微调 1px 水波/翅膀，`dishes/summer-corn.svg` 改为整数 `<path fill>`。
- **涉及文件与改法**：
  - `apps/web/app/game/game-client.tsx`（L447）：按 `isPlaceOpen(current!, p)` 将营业中地点排在前面、关门地点排在后面（保持各自相对顺序）；替换 `✉`/`✈`/`⌂` 为单色 `GameIcon` SVG；
  - `apps/web/app/about/about-content.tsx` & `apps/web/app/site.module.css`：统一度量或为中段两栏加微弱过渡容器；
  - `apps/web/public/game/assets/meadow-town/{animals/duck.svg,dishes/summer-corn.svg}` & `apps/web/app/game/game.module.css`。

---

## 四、整体观感评分与历程对比

| 评审轮次 | 综合评分 | 主站评分 | 小游戏评分 | 关键变化 |
| :--- | :---: | :---: | :---: | :--- |
| **Round 1（`main 06293e7`）** | **5.0 / 10** | 6.5 | 4.0 | GOV.UK 政务风弹窗硬糊在像素小镇上、8px 画布字极糊、手机吞半屏 |
| **Round 2（`12.8` + `12.9`）** | **7.5 / 10** | 7.5 | 7.5 | DOM 清晰标签 + 暖木与草甸全面换肤，建立起独立生活模拟气质 |
| **Round 3（`12.11` + `13.1` + `13.1b`）** | **7.9 / 10** | 8.0 | 7.8 | 扫清手机/桌面布局痛点与单行顶栏，但 17 人立绘存在两代画风割裂与多人撞脸 |
| **Round 4（`13.3` + `13.4` 线上版）** | **8.4 / 10** | **8.2** | **8.5** | **17 人立绘与行走图全面统一并恢复 `64×64` 锐度；补齐原创鱼/菜/小动物与环境音；结局页暖木收口全部落地，跨过 8.5 精品线** |

**距离 9.0 分精品线还差什么（约 0.6 分差距）**：
1. **首屏构图与横幅最后一公里（约 0.25 分）**：桌面端首页（`d-home.png`）右侧仍空 340px 且把游戏卡标题压出 800px 首屏，选人页（`d-game-start.png`）横幅仍裁太阳并把首排按钮切出首屏——这两处改完，桌面第一眼的完成度会瞬间对齐移动端水准。
2. **13.3 弹层与 13.4 立绘的细节洁癖收口（约 0.2 分）**：修掉 `.catchCard` 图标被锁 `32×32` 缩在左上角、做饭/钓鱼按钮层级混乱、5 张 `*-happy.png` 腮红擦边与 `rahman` 右耳黑条，以及 `duck.svg` 静止第 2 帧，消除“肉眼可见的脚本拼装痕”。
3. **地图生活呼吸感与街区验真（约 0.15 分）**：营业地点前置让右侧 16 地点一眼聚焦；给池塘/河流加上轻量水波高光微动（配合 `prefers-reduced-motion`），并补截一张走到**高街商业区**（咖啡馆/小店/诊所/语言学校/市政厅）的室外截图，实际验收 9 块招牌挂在墙面上的真实观感。

---

## 五、下一步最值得做的 5 件事

1. **修复 `.catchCard` 放大失效与做饭/钓鱼弹层按钮层级（纯前端小改，立刻见效）**
   - 改 `life-overlays.tsx` `ItemIcon` 为百分比 `backgroundSize: 'contain'`（作物 `'600% 100%'` + `'100% 100%'` 居中），让钓鱼/出锅庆祝卡真正显示居中的 `72×72` 高清图标；
   - 给 `Kitchen` 操作按钮加 `.buttons` 分组与主次样式区分；给 `Fishing` `简易模式` 补全 `secondary` + `[aria-pressed='true']` 状态样式。
2. **修净 5 张 `*-happy.png` 腮红越界、`rahman` 右耳黑条与 `duck.svg` 第 2 帧（美术脚本微调）**
   - 仅在皮肤像素遮罩内绘制腮红，恢复 `graduate`/`family-partner`/`yao-flatmate` 发缘轮廓、`maeve` 脸颊完整 4 颗雀斑与 `rahman` 胡须；清理 `rahman` 右耳旁黑条；给 `duck.svg` 第 2 帧加 1px 水波与轻晃，将 `summer-corn.svg` 改为整数 `fill` 像素块。
3. **收口选人页与首页桌面首屏构图（消除裁太阳与出折线）**
   - 调整 `game.module.css` `.townBanner` 为完整 `3:1` 展示（或左文字右横幅并排），保住 `d-game-start.png` 太阳与河桥并让第一排 `和林遥开始`/`和陈嘉宁开始` 完整落入 `1280×800` 首屏；
   - 桌面 `d-home.png` 将 `.gameEntry` 移至右侧边栏，使首页右侧不再留白且 `玩一局 · Immigration Life` 标题完全进入首屏。
4. **营业地点前置分组 + 清掉最后几个系统字符 + 拉齐 `about` 页宽**
   - 在 `game-client.tsx` 对 16 地点按 `isPlaceOpen` 将营业中置顶、关门置底；用 `GameIcon` 单色 SVG 替换 `✉`/`✈`/`⌂`；为 `.memoryPortrait`/`.smallPortrait` 加细边框并对齐 `.achievementColumns` 两栏顶缘；微调 `about-content.tsx` 容器宽度一致性。
5. **补充高街 9 招牌实景与钓鱼/厨房截屏验收，点缀池塘水面微波**
   - 在地图池塘/河面增加低频轻闪水波像素（遵守 `prefers-reduced-motion`），并在下轮验收截图中补上高街街区（实测 9 块店铺招牌挂墙效果）、背包/收藏册、钓鱼与厨房界面，完成全流程视觉闭环。
