# 小镇 v3 素材署名

首批取用日期：2026-11-06；后续新增日期见各节。以下图像与音频全部采用 **CC0 1.0 Universal**；许可原文保留于 `LICENSE.txt`。下载、裁切、拼接及调色脚本不入仓库。

## 13.1 人物立绘、横幅与招牌（2026-11-16）

- 作者：本项目 / Codex gpt-6-astra；来源：本仓库 `apps/web/public/game/assets/meadow-town/`，本轮原创，未下载第三方候选图像。
- 许可：**CC0 1.0 Universal**，完整原文保留于 `meadow-town/LICENSE.txt`，许可链接：https://creativecommons.org/publicdomain/zero/1.0/ 。该声明覆盖下列 55 张 PNG。
- 制作方式：离线用整数坐标逐像素绘制；没有外部字体、嵌入图片、品牌标志或其他游戏角色。人物仅参考本仓库已有 Kenney CC0 行走图的发色、肤色与衣服主色，重新设计半身构图、五官、发型、服饰细节和表情，没有放大、描摹或拼贴原图。行走图原文件不变。
- 45 张头像均为 64×64：下列每个 ID 分别有 `portraits/<id>-neutral.png`、`portraits/<id>-happy.png`、`portraits/<id>-worried.png`。平常、开心、担心三表情各 15 张。
  - 主角：`skilled-worker`、`hong-kong-bno`、`family-partner`。
  - 镇民：`margaret`、`priya`、`ade`、`helen`、`dave`、`rahman`、`lina`、`gareth`。
  - 家人及室友：`jamie`、`ka-ning-partner`、`ka-ning-child`、`yao-flatmate`。
- `town-banner.png`：960×320；从原创 480×160 像素场景按最近邻放大两倍，包含砖房、咖啡馆、钟楼、树木、行人、花坛与河桥；中心保留手机裁切主体。
- 9 张招牌均为 24×24：`signs/cafe.png`（茶杯）、`shop.png`（篮子）、`pub.png`（杯子）、`gp.png`（听诊器）、`library.png`（打开的书）、`college.png`（对话气泡）、`council.png`（柱廊）、`visa.png`（文件）、`station.png`（列车）。不使用医疗机构或铁路品牌标志。
- PNG 合计 **56,791 bytes（55.46 KiB）**：头像 46,719 bytes、横幅 7,769 bytes、招牌 2,303 bytes；完整许可文件另为 6,555 bytes。

本轮先检索 OpenGameArt、itch.io、GitHub，并打开下列候选的许可页或文件核实 CC0；均未采用。规格判断依据作者发布页，不表示下载后做过完整图包审阅。

| 候选            | 作者、来源 URL 与许可证据                                                                                                                                                | 未采用原因                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| RPG portraits   | Buch；https://opengameart.org/content/rpg-portraits ，发布页 CC0 及其链接的 CC0 1.0 许可页                                                                               | 9 位、32×32，每人三种配色，并非三种表情；不足以对应本轮 15 人 |
| EverFace        | Efilheim；https://efilheim.itch.io/everface ，License 明确 CC0，并链接 CC0 1.0                                                                                           | 18 张、24×24、奇幻风；未声明每人三表情，无法直接匹配现有人物  |
| Town Tiles      | surt；https://opengameart.org/content/town-tiles ，License(s) 标明 CC0，链接 CC0 1.0                                                                                     | 16×16 奇幻小镇瓦片，没有现成现代英国小镇横幅                  |
| CC0 Sign Icons  | AntumDeluge 整理；https://opengameart.org/content/cc0-sign-icons ，License(s) 与 Licensing 均明确 CC0，链接 CC0 1.0                                                      | 通用路牌集合，未提供本轮九类设施的统一对应图标                |
| Pixel Buildings | HoangLong256；https://github.com/HoangLong256/pixel-buildings ，README 明确 CC0；已读取 https://raw.githubusercontent.com/HoangLong256/pixel-buildings/main/LICENSE 全文 | 八方向、30° 等角建筑，与当前地图及横幅构图不直接匹配          |

## Kenney — Roguelike Modern City

- 作者：Kenney；来源：https://opengameart.org/content/roguelike-modern-city-pack
- 下载：https://opengameart.org/sites/default/files/Roguelike%20Modern%20City%20pack.zip
- 许可：CC0，包内 `License.txt` 与来源页。
- 本地：`modern-city/tiles.png`。从 `Spritesheet/roguelikeCity_transparent.png` 按 16×16、间隔 1 像素取下面的格子，依次横排；邮筒调成红色。坐标从 0 开始，格式为列、行。

grass (1,26)；path (3,20)；road (10,19)；roadline (10,20)；water (30,5)；soil (13,26)；roofTL (0,0)；roofT (2,0)；roofTR (1,0)；roofL (0,3)；roof (4,1)；roofR (1,3)；roofBL (0,1)；roofB (2,2)；roofBR (1,1)；wall (2,6)；window (25,16)；door (22,8)；greywall (6,6)；greywindow (26,16)；creamwall (10,6)；creamwindow (25,17)；awningL (24,10)；awning (25,10)；awningR (26,10)；treeT (31,10)；treeM (31,11)；treeB (31,12)；lampT (6,16)；lampB (6,17)；benchL (17,15)；benchR (18,15)；flowers (11,18)；fence (19,16)；bin (16,17)；board (10,18)；postbox (26,26)；bus (10,14)；sign (32,4)；bridge (24,13)。

## Kenney — Roguelike Indoor

- 作者：Kenney；来源：https://opengameart.org/content/roguelike-indoor-pack
- 下载：https://opengameart.org/sites/default/files/Roguelike%20Indoor%20pack.zip
- 许可：CC0，包内 `License.txt` 与来源页。
- 本地：`indoor/tiles.png`，同样取 16×16 格并横排；`indoor/item.png` 取 (18,12)，作为其余及未知物品的通用图标。

floor (24,2)；rug (24,5)；wall (24,14)；bedT (14,6)；bedB (14,7)；kitchen (8,14)；stove (14,14)；desk (1,0)；chair (1,2)；plant (17,0)；door (23,17)；mail (18,12)；sofaL (8,10)；sofaR (9,10)；shelf (4,13)。

## Kenney — RPG Urban Pack

- 作者：Kenney；来源：https://opengameart.org/content/rpg-urban-pack
- 下载：https://opengameart.org/sites/default/files/kenney_RPGurbanPack.zip
- 许可：CC0，包内 `License.txt` 与来源页。
- 取 `Tilemap/tilemap_packed.png` 六个人物（列 23–26，每人连续三行），重排为下、左、右、上四方向，每方向三帧。本地每张 64×48。
- 3 位玩家保留原配色；8 位常驻镇民及 4 位家人（含林遥室友）对衣服离线调色，保留面部、肤色与头发。没有使用 ninja-adventure 备选人物。
- `yao-flatmate.png` 从同包派生的 `skilled-worker.png` 逐像素替换衣服色板：上衣 `#42a379 → #ae67a2`、`#369069 → #915087`，裤装 `#d6d4aa → #555779`、`#c5b993 → #424462`。紫色上衣与靛色裤装区别于林遥的绿色上衣与浅色裤装；保留 64×48、四方向三帧及全部透明像素。
- 文件清单：

- `urban/ade.png`
- `urban/dave.png`
- `urban/family-partner.png`
- `urban/gareth.png`
- `urban/helen.png`
- `urban/hong-kong-bno.png`
- `urban/jamie.png`
- `urban/ka-ning-child.png`
- `urban/ka-ning-partner.png`
- `urban/lina.png`
- `urban/margaret.png`
- `urban/priya.png`
- `urban/rahman.png`
- `urban/skilled-worker.png`
- `urban/yao-flatmate.png`

## josehzz — Farming crops 16x16

- 作者：josehzz；来源：https://opengameart.org/content/farming-crops-16x16
- 下载：https://opengameart.org/sites/default/files/FarmingCrops16x16.zip
- 许可：CC0，包内 `README.txt` 与来源页。
- 从 `Crop_Spritesheet.png` 取八种作物，每张横排五个生长阶段（从种子到成熟）及第六格物品图标。源文件内生长顺序反向；已离线重排。
- 文件：`crops/potato.png`、`strawberry.png`、`tomato.png`、`cucumber.png`、`turnip.png`、`corn.png`、`sunflower.png`、`tulip.png`（均在 `crops/`）。

## Pixel-boy / Sparklin Labs — ninja-adventure

- 作者：Pixel-boy（Sparklin Labs）；来源：https://github.com/sparklinlabs/superpowers-asset-packs/tree/master/ninja-adventure
- 作者声明：https://github.com/sparklinlabs/superpowers-asset-packs/blob/master/README.md
- 许可：CC0；https://github.com/sparklinlabs/superpowers-asset-packs/blob/master/LICENSE.txt
- 原样文件均从 `https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/ninja-adventure/` 加以下相对路径取得，本地置于 `ninja-adventure/`：

- `fx/1.png`
- `hud/heart.png`
- `musics/theme-2.ogg`
- `musics/theme-3.ogg`
- `musics/theme-4.ogg`
- `musics/theme-5.ogg`
- `musics/theme-9.ogg`
- `sounds/1.ogg`
- `sounds/gold-1.ogg`
- `sounds/menu-1.ogg`
- `sounds/succes.ogg`
- `sounds/voice-1.ogg`

`theme-9/2/3/4.ogg` 分别为冬、春、夏、秋背景音乐，`theme-5.ogg` 为节日。`1/voice-1/menu-1/gold-1/succes.ogg` 分别用于脚步、说话、菜单、金币与成就；说话播放速率按镇民区别。`hud/heart.png` 为表情，`fx/1.png` 为收获反馈。

`town.json` 与 `home.json` 为项目编排；不包含素材包中未使用的图块、旧忍者村瓦片或旧角色。

## 12.3 家具与季节（2026-11-15）

- 阅读椅复用 `indoor/tiles.png` 的 chair：Tiled GID 9，Kenney 原图 `(1, 2)`，CC0。
- `indoor/home-details.svg` 是本项目原创的 48×16 像素矢量图，按 **CC0 1.0 Universal** 发布（许可见 `LICENSE.txt`）。从左至右三个 16×16 图块：厚窗帘与窗户的左半、右半、台灯；在 `home.json` 中分别是 GID 16、17、18。无外部图片、字体或嵌入资源。
- 村绿地长椅和花坛复用 `modern-city/tiles.png` 的 benchL / benchR / flowers：GID 31 / 32 / 33，Kenney 原图 `(17, 15)` / `(18, 15)` / `(11, 18)`，CC0。
- 四季在场景中从现有图集派生并缓存 640×16 的春、秋、冬图集，只替换草地（GID 1）和树木（GID 26–28）的绿色像素，保留透明度、明暗纹理与中性树干；夏季使用原图。未增加外部素材，派生图集沿用 Kenney 的 CC0 许可。明亮住处用 Phaser 暖色半透明遮罩绘制。

## 12.5 聚餐与合照（2026-11-15）

- 聚餐长桌与椅子复用 `indoor/tiles.png` 的 desk / chair（0 起算帧 7 / 8），Kenney CC0；桌布、餐盘与餐具由 Phaser 几何图形绘制。贡献食物复用 `items/meal.png` 或 `items/biscuits.png`，许可与来源见下方 10.5b。
- `items/community-lunch-photo.svg` 是本项目原创的 24×24 像素风矢量图，按 **CC0 1.0 Universal** 发布（许可见 `LICENSE.txt`），供背包及结局回忆共用；无外部图片、字体或嵌入资源。图标是邻里合照的符号示意，不指定实际出席名单。
- 结局人物、家具及作物小图复用上文已列 CC0 图集，没有新增外部素材。

## 12.7 生活场景（2026-11-16）

- 公共花坛的绳线、苗盘、植株与小牌，五月节的工作台、彩带束、箭头牌、彩带柱与花环，以及条纹猫、交换箱、手套和六种收尾痕迹，均是本项目在 `apps/web/app/game/scene.ts` 中用 Phaser 几何图形原创绘制，按 **CC0 1.0 Universal** 发布（许可见 `LICENSE.txt`）。没有新增下载素材、外部图片或字体；花坛没有承诺四季开花，节日没有添加虚构在场的镇民。

## 9.4 客户端布置

节日摊位、彩旗、灯笼、彩灯、篝火、烟花、窗灯与路灯光晕由 Phaser 几何图形绘制，未引入外部图像。现有可核验 CC0 素材未找到合适的鸭、猫或鸽子，因此本轮未加入小动物。

重新导出 `town.json` / `home.json` 时，**每个图层**必须保留 Tiled 的 `x: 0`、`y: 0`、`opacity: 1` 与 `visible` 字段；`collision` 的 `visible` 为 `false`。缺失坐标会使 Phaser 算出 NaN 而不渲染图块。组件测试覆盖这项地图格式约束。

## 10.5b 物品图标（2026-11-10）

以下均为 CC0。鱼、菜品、花优先复用上面已列来源的包；茶杯、饼干、蛋糕补充两位作者的素材。仅裁切并保留透明度，没有调色或绘制新内容。像素坐标均从左上角 `(0, 0)` 起，裁切范围写作 `x, y, width, height`；网页按 32×32 显示。

| 本地文件 | 作者、来源与许可证据 | 下载与原图坐标 |
| --- | --- | --- |
| `items/tea.png` | Fleurman，[Infusions Icons](https://opengameart.org/node/77729)，作者发布页标明 CC0 | [Infusions Icons.png](https://opengameart.org/sites/default/files/Infusions%20Icons.png)，`(96, 24, 24, 24)`，第 4 列、第 1 行的茶杯 |
| `items/biscuits.png` | Fleurman，[Almost Weapons Icons](https://opengameart.org/node/77730)，作者发布页标明 CC0 | [Almost Weapons Icons.png](https://opengameart.org/sites/default/files/Almost%20Weapons%20Icons.png)，`(96, 72, 24, 24)`，第 4 列、第 3 行的饼干 |
| `items/flowers.png` | josehzz，[Farming crops 16x16](https://opengameart.org/content/farming-crops-16x16)，包内 `README.txt` 标明 CC0 | [FarmingCrops16x16.zip](https://opengameart.org/sites/default/files/FarmingCrops16x16.zip) 内 `Crop_Spritesheet.png`，`(96, 0, 16, 16)`，第 6 列、第 0 行的玫瑰物品图 |
| `items/cake.png` | maruki，[Foodies](https://opengameart.org/content/foodies)，作者发布页标明 CC0 / public domain | [Foodies.zip](https://opengameart.org/sites/default/files/Foodies.zip) 内 `foodies_sheet_borderless.png`，`(80, 0, 16, 16)`，第 5 列、第 0 行的草莓蛋糕 |
| `items/fish.png` | Pixel-boy / Sparklin Labs，[ninja-adventure](https://github.com/sparklinlabs/superpowers-asset-packs/tree/master/ninja-adventure)，使用上面已列 CC0 许可 | [items/food/fish.png](https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/ninja-adventure/items/food/fish.png)，完整原图 `(0, 0, 16, 16)`，所有鱼类共用 |
| `items/meal.png` | Pixel-boy / Sparklin Labs，[ninja-adventure](https://github.com/sparklinlabs/superpowers-asset-packs/tree/master/ninja-adventure)，使用上面已列 CC0 许可 | [items/food/noodle.png](https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/ninja-adventure/items/food/noodle.png)，完整原图 `(0, 0, 16, 16)`，菜品共用碗装食物图 |
