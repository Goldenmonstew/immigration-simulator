> 评审者：agy（gemini-4-hydrogen-xhigh），2026-11-15。输入：线上版（main 06293e7）桌面 2 倍、手机 3 倍无头 Chrome 截图 19 张（未入库），以及 `apps/web` 只读源码。Fable 抽查了其中 4 条具体问题，均属实：政策页漏了黄色的已公布标记；`.body a` 盖掉了次按钮文字色；全局 `overflow-wrap: anywhere`；问卷页挂载时就聚焦标题。

# 英国移民路径模拟 & 「移民生活 Immigration Life」视觉与交互设计评审

> **评审范围与核查说明**：基于桌面端 `1280×800（2x）`（`d-*.png`）与移动端 `375×812（3x）`（`m-*.png`）共 19 张截图，并对照 `/Users/wanruncong/Projects/web-UK/apps/web` 只读源码完成评审。注：项目实际全局样式位于 `app/site.module.css`（不存在 `app/globals.css`），游戏样式位于 `app/game/game.module.css` 与 `app/game/town-canvas.module.css`。

---

## 一、总体诊断与核心结论

1. **产品处于“两条腿走路但穿同一双工装靴”的割裂状态**：
   - **政策模拟网站部分（`/`, `/simulate`, `/policy`, `/about`, `/result`, `/whatif`）**：采用 GOV.UK 风格骨架，严肃、克制、信息透明度高，结构符合政策工具预期；但在跨页组件一致性（如首页次按钮文字变蓝、政策页丢失“已公布、未生效”黄色语义标记）、程序化聚焦导致的大黄黑框、及中英文混排细节上存在明显瑕疵。
   - **「移民生活」小游戏部分（`/game`）**：虽然引入了 Phaser 3 像素风小镇、四季调色和生活系统，但 React 浮层与 HUD 仍大量直接复用网站端“冷蓝深海顶栏 + 纯白政务直角边框 + 蓝条表单选项”样式（`app/game/game.module.css` 第 467 行注释甚至直接写明：`Daily life overlays share the existing assessment and ending surfaces`）。结果导致整个游戏界面像**“把政府办理指南的表单弹窗直接糊在星露谷风像素小镇上”**，完全削弱了温暖、生动的生活模拟感。
2. **移动端（375×812）存在严重的“首屏吞噬”问题**：
   - 在 `/game` 手机端，网站双行导航栏（约 100px）叠加超高的游戏深蓝 HUD（约 250px），占掉接近半屏垂直空间；画布被压在视口下沿，右侧 16 个地点按钮、背包/镇民按钮和法律进度条全部掉出首屏，玩家初见极易迷失。
3. **焦点样式与按钮文案打断沉浸感**：
   - 多张截图（`d-simulate.png` 整条 `<h1>` 标题、`d/m-game-town.png` 整个画布、以及全部 8 张弹窗截图中的“回到小镇”或首选按钮）在刚加载/弹出时直接带有刺眼的 `#ffdd00` + `#0b0c0c` 双层焦点框；同时在家里书桌和聊天框中，关闭按钮文案却写着“回到小镇”，造成空间认知错乱。

---

## 二、已知问题推荐修法：小镇画布地点标签文字模糊

**原因简述**：`app/game/scene.ts`（L268-277）中以 `8px` 创建 `Phaser.GameObjects.Text`，随后被相机放大 `2.5x`（手机 `2x`）并以 `pixelArt: true`（最近邻采样）渲染，导致中文笔画粘连糊成色块。

### 推荐方案 A（主推，低成本、最高清）：HTML/CSS 坐标映射叠加层
不要把中文字体画在被 `pixelArt: true` 邻近放大的 WebGL/Canvas 纹理里，而是将地点标签交给浏览器的 HTML 层渲染，享受 Retina 2x/3x 原生矢量抗锯齿：

1. **在 `app/game/town-canvas.tsx` 中**：在 `.map` 或 `.canvas` 容器内新增一个绝对定位、不可选中且穿透指针的层 `<div className={styles.labelsOverlay} aria-hidden="true">`（或可点击标签按钮层）。
2. **在 `TownScene`（`app/game/scene.ts`）中**：
   - 移除画布内 `spot.label` 的 `this.add.text(...)` 绘制（或仅保留调试占位），改为每帧或相机滚动/缩放变化时计算每个 `Spot` 的屏幕坐标：
     ```ts
     const cam = this.cameras.main;
     const screenX = (worldX - cam.worldView.x) * cam.zoom;
     const screenY = (worldY - cam.worldView.y) * cam.zoom;
     ```
   - 通过轻量回调（直接操作 DOM ref 的 `transform: translate3d(x, y, 0)`，避免触发 React 重渲染）同步位置。
3. **标签样式与降噪规则**：
   - **视觉样式**：温暖木牌风小胶囊（背景 `rgba(43, 33, 24, 0.88)`、文字 `#FFF8E7`、`font-size: 12px`、圆角 `4px`、边框 `1px solid #C89B54`、`padding: 2px 7px`）。
   - **防遮挡机制（关键）**：室外地图不要 16 个标签全时常亮挡住建筑。改为**三级展示**：
     - 常驻只展示轻量小门牌/状态圆点，或仅在距离玩家 5 格以内的地点显示清晰完整地名；
     - 当前最近的可互动点（`nearby`）高亮成暖金边框标签；
     - 鼠标悬停在建筑上时临时显示该建筑名称。
   - **家里室内**：家具少（5 个点位），可常驻显示清晰 `12px` 小木牌标签（`床`、`书桌`、`厨房`、`门口信箱`、`走出家门`）。

### 备选方案 B（若坚持纯 Canvas 渲染）：高倍率采样 + 线性过滤
如果必须留在 Phaser 场景内绘制：
1. 将文字 `resolution` 设为 `Math.ceil((window.devicePixelRatio || 1) * zoom)`（约 `5`～`8`），`fontSize` 设为 `'12px'`，再通过 `.setScale(1 / zoom)` 缩回世界尺寸；
2. 关键一步：因 `TownCanvas` 全局开启了 `pixelArt: true`（强制所有新纹理使用 `NEAREST` 过滤），必须对每个文本对象单独覆盖过滤模式：`label.texture.setFilter(Phaser.Textures.FilterMode.LINEAR)`，并对坐标做整数像素对齐，避免最近邻抽样再次撕裂笔画。
3. 缺点：仍比 DOM 层更占显存，且无法利用 CSS 过渡、动态状态点与无障碍读屏友好性。**强烈建议采用方案 A。**

---

## 三、逐屏设计点评

### A. 政策模拟器网站端

#### 1. 首页（`d-home.png` / `m-home.png` · `/`）
- **视觉层级**：信息路径清晰（核对日期与规则状态 → 标题与引导 → 折叠范围 → 双按钮 → 本机情景 → 注意事项与免责）。但桌面端 `.policy` 的 1px 底分隔线拉满 `1064px`，下方 `.narrow` 内容却只有 `720px` 居左，导致画面右半边约 340px 彻底空旷，视觉重心偏左且略显单薄。此外，“本机保存的情景”在空状态时依然使用醒目的 `<h2>`（22px–24px）占了 4 行，抢了首页核心介绍与“开始前”准备事项的权重。
- **排版与混排**：`font-family` 把 `Arial` 排在 `'PingFang SC'` 之前，英数字偏粗硬。英文单词（`Immigration Life`、`Policy`、`About`）与中文间用 `·` 分隔，但长段说明中英文术语（如 `Skilled Worker`、`tax year`）直接与汉字贴在一起，可优化字体栈并保持稳重行高（`1.65` 阅读感不错）。
- **色彩与对比度**：深蓝 `#16324f` 顶栏 + 亮蓝 `#1d70b8` 描边 + 绿色 `#00703c` 主按钮对比度极佳。但**存在明显的色彩 Bug**：次要按钮 `玩一局 · Immigration Life`（`app/home-content.tsx` L26）使用了 `<Link className={styles.secondary}>`，结果被 `app/site.module.css` L13 `.body a { color: #1d70b8; }` 覆盖了 `.secondary` 的 `#0b0c0c`，导致首页灰色按钮上显示蓝色文字（与弹窗内黑字灰底按钮不一致）。
- **间距与对齐**：顶栏导航（`政策依据 · Policy`、`方法说明 · About`）在桌面端靠中间悬浮（`justify-content: space-between` 均分三个区块），既不贴合左标题，也不靠近右语言切换，归属感弱。
- **气质协调**：小游戏入口仅作为一个灰色方框按钮放在“开始模拟”旁，没有任何温暖色彩、像素小图标或一句话说明，用户不知道这是一个完全不同气质的生活模拟游戏。
- **手机端（`m-home.png`）**：顶栏因为导航项中英双语硬拼，被迫折成两行（顶栏高约 100px）。下方两个 CTA 按钮（`开始模拟` 和 `玩一局 · Immigration Life`）宽度各自自适应文字，一短一长上下叠放显得散乱，手机端更适合通栏或等宽对齐。

#### 2. 问卷页（`d-simulate.png` · `/simulate`）
- **视觉层级**：步骤 1/9 的单页问题极少（仅出生日期、国籍），下方大片留白接灰色 footer。进度仅有一行灰字 `步骤 1 / 9 — 填写你的时间线`，缺少可视进度条，长流程容易让用户缺乏进度掌控感。
- **刺眼瑕疵（重点）**：`<h1>基本信息</h1>` **一进页面就套着全宽 `720px` 的黄黑双层 `:focus-visible` 粗框**。原因是 `app/simulate/page.tsx` L130 在挂载和切步时执行 `heading.current?.focus()`，且 `<h1 tabIndex={-1}>` 未抑制初始程序焦框。
- **排版与表单**：出生日期输入框（`type="date"`）在中文页面显示英文浏览器占位 `dd/mm/yyyy`，但提示说明里未写日期格式习惯；下方操作区主按钮 `继续` 旁边是一个纯文本链接 `首页`，若处于第 2～9 步还需更清晰的“上一步 / 返回首页”层级区分。

#### 3. 政策依据页（`d-policy.png` · `/policy`）
- **组件一致性严重失调（重点）**：规则集双栏卡片中，左边“现行法律”和右边“已公布改革”视觉上几乎完全一样——**右边卡片里的 `已公布、未生效` badge 本应是黄色（`#fff2cc` / `#594500`，如首页 `d-home.png` 与关于页 `d-about.png` 所示），在此处却变成了与现行法律相同的灰蓝 `#e5eef5`！** 且两张卡片顶部描边都是蓝条 `#1d70b8`（对照结果页 `result.module.css` L15 应为琥珀黄 `#b58800`）。原因在 `app/policy/page.tsx` L67-73 漏传了 `site.announced` 与卡片区分样式。
- **视觉层级与间距**：卡片内四段 `<p>` 间距均匀且偏松，等宽 ID（`current-law-2026-11`）像普通段落一样摆在中央。下方折叠项 `▶ 现行法律 (52)` 折叠图标与加粗标题贴得较紧，行间缺乏细微呼吸感。

#### 4. 方法说明页（`d-about.png` · `/about`）
- **视觉层级**：整体可读性较好，左蓝条 `.notice` 声明框很稳重。但“如何理解结果的两栏”右侧卡片虽然里面的 badge 恢复了黄色，卡片顶边却依然引用 `policy.module.css` `.card` 的蓝色 `4px solid #1d70b8`，与黄色语义不统一。
- **排版与栅格**：页面上半段和下半段使用 `720px` 窄栏（`.narrow`），中段“两栏”却跳出 `.narrow` 变成全宽 `1064px`，视觉左对齐不变但右侧宽度来回突变；此外大段内嵌英文术语（`Appendix FM`、`Earned Settlement`、`dependant`、`Adult Dependant Relative`）密布中文句子中，阅读节奏偏重。

#### 5. 其他网站页面（源码核对：`/result`、`/whatif`）
- `/result`（`app/result/result.module.css`）：双栏评估用蓝色/琥珀黄顶边明确区分；`.outcome` 块用了 `margin: 24px -8px` 略微负外边距凸出内边距；760px 以下出现顶部双按钮快速跳转。同样存在 `<h2 tabIndex={-1}>` 跳转聚焦时出现黄黑大框的风险。
- `/whatif`（`app/whatif/whatif.module.css`）：280px 边栏控件 + 双栏对比结果，样式规范与主页统一，整体克制合理。

---

### B. 「移民生活 Immigration Life」小游戏（`/game`）

#### 6. 选人开始页（`d-game-start.png` / `m-game-start.png`）
- **气质协调**：仍停留在全站纯白背景 `#fff` 与深蓝政务顶栏之下。大标题直接用孤立纯英文 `Immigration Life`，中文用户进来缺乏中文游戏名与进入“温暖小镇生活”的沉浸感转场。
- **间距与对齐**：
  - **2 列 3 卡的半行空洞**：桌面端 `grid-template-columns: repeat(auto-fit, minmax(360px, 1fr))` 放 3 个角色，导致第二行左边只有索菲娅，右边空出整整半行。
  - **按钮参差不齐**：林遥简介 4 行、陈嘉宁简介 5 行，卡片内没有底部对齐按钮（缺 `flex: 1` / `margin-top: auto`），导致两张并排卡片里的绿色按钮一高一低。
- **组件与像素表现**：卡片是浅灰绿 `#f1f6f4` 配硬阴影，里面却嵌了 GOV.UK 深绿硬直按钮 `和林遥开始`。16×16 角色小人放大到 80×80 裸贴在空白左侧，没有像素/木框相框衬托，四周略显孤零。
- **手机端（`m-game-start.png`）**：左头像 64px 占去固定宽度，右列正文被挤压至每行仅约 10 个汉字，竖向拉得很长，仅第一张卡和半张第二张卡占满一屏。

#### 7. 早上好卡片（`d-game-morning-card.png` / `m-game-morning-card.png`）
- **气质与组件**：纯白方盒 + 蓝灰粗框 `#426583` + 顶部左对齐蓝色标题 `早上好` + 一条细灰线 + 居中大号系统符号 `☂`/`☀` + 居中正文 + 带**黄黑粗焦框**的 GOV.UK 绿按钮 `起床，开始今天`。完全不像星露谷“清晨醒来”的暖心日报，更像一个网页系统通知确认框。
- **视觉层级**：标题左对齐而正文全居中，版式重心割裂；`信箱里有 0 封信` 即使无信也占据整行；`平常的一天，也有小小的盼头。` 与按钮紧邻，缺少层次。
- **桌面端遮罩**：半透明深色遮罩后方的 HUD 按钮边缘杂乱，若改为游戏暖色调半透明遮罩并收窄或美化晨报卡片结构，氛围会提升很多。

#### 8. 家里室内主屏（`d-game-home-interior.png` / `m-game-home-interior.png`）
- **双顶栏与气质打架**：网站全局深蓝顶栏（`#16324f`）下方紧接一个同样 `#16324f` 的游戏深蓝 HUD，视觉上像“两个政府官网头顶叠罗汉”。
- **桌面端 HUD 折行错位**：`StatusBar` 把姓名、年季、日期、时间、天气、天数、签证剩余、声音关、快进这一季、今天到此为止共 10 个元素塞进同一行 `.hudTop`（`gap: 6px 20px`），导致第 10 项 **`今天到此为止` 孤零零掉到第二行最左**，白白撑高 HUD 且右侧空出大片。
- **室内场景“悬浮草海”错觉**：家里地图只有 `18×13` 格（288×208px），居中放在较大视口后，周围直接露出画布默认背景色 `#a8c580`（户外草坪亮绿）！室内房间像一个没有外墙和地面衔接的积木盒漂在草坪上（手机端 `m-game-home-interior.png` 尤为明显，上方几乎有 1/3 都是纯亮草绿空背景）。
- **底部交互按钮**：`互动 · E / 空格 / 点按` 在全平台写死键盘按键，未像下方提示文字一样区分触控端（手机端显示 `E / 空格` 没意义），且不提示将要互动的具体对象名称（如“打开厨房”）。
- **右侧地点网格“单字孤悬折行”**：桌面右侧 `200px` 宽分 2 列（每按钮内宽约 87px），加之 `.body` 全局设了 `overflow-wrap: anywhere`，导致 `语言学校 · 关\n门`、`GP 诊所 · 关\n门`、`街角小店 · 关\n门`、`签证中心 · 关\n门` 全部在“关”和“门”之间强行断行！16 个按钮中超过一半写着灰色“关门”，形成密集沉闷的灰砖墙。
- **手机端半屏危机（`m-game-home-interior.png`）**：网站 Header（~100px）+ 游戏 HUD（~250px，3 个功能按钮被迫撑成两行通栏）吃掉了约 350px 高度，留给画布的空间被挤压，下方的 16 个地点按钮、背包/镇民按钮、进度条全部落到视口之外。

#### 9. 在家菜单弹窗（`d-game-home-menu.png` / `m-game-home-menu.png`）
- **组件拼贴与间距 bug**：
  1. 标题写 `家`，右上角关闭按钮写着 **`回到小镇`**（带蓝下划线 + **刺眼黄黑焦框**）——玩家明明只是在家里看书桌菜单，点“回到小镇”实际上是退回客厅，文案误导性极强。
  2. 中间活动列表（`休息`、`午睡`、`自学英语`）沿用政策评估风 `.choice`（浅蓝灰底 + 4px 亮蓝左竖条），像在做政务问卷选择题。
  3. **硬核间距缺失**：第三个选项框 `自学英语` 的底边框**零间距紧贴**着下面三个灰色小按钮（`厨房`、`门口信箱`、`睡觉`），因为在 `game-view.tsx` 中 `.choices` 与子节点 `.buttons` 之间没有设置任何 `margin-top`（`m-game-home-menu.png` 里甚至像粘连在了一起）。
  4. `在这里的人` 只摆了一个干巴巴的灰按钮 `周沅 · 聊天`，既无头像也无关系提示。

#### 10. 小镇室外主屏（`d-game-town.png` / `m-game-town.png`）
- **刺眼的画布黄黑大框**：点击右侧任何地点按钮后，`town-canvas.tsx` L120 调用 `host.current?.focus({ preventScroll: true })`，触发整个 `748×480`（桌面）/全宽（手机）画布外框套上一圈粗黄+粗黑的 `:focus-visible` 边框，极其抢戏。
- **画布质感与文本模糊**：路砖、草地、水池有一定像素雏形，但所有建筑标签（`公告栏`、`村绿地`、`公园池塘`、`社区菜地`）文字糊成一团；冬季/雨天整体色调偏灰暗，且桌面端 800px 视口下，操作提示、背包按钮、两条法律进度条全部被画布与右侧长按钮栏压到了首屏折叠线下方。
- **手机端（`m-game-town.png`）**：同室内屏幕一样，顶部两层 Header/HUD 占去半屏，画布下边缘直接被手机屏幕底部截断，快速前往地点列表完全看不见。

#### 11. NPC 对话框（`d-game-chat.png` / `m-game-chat.png`）
- **半成品暖色风格**：`.dialogueModal` 是全游戏唯一换上暖米色底 `#fff9ec` 和绿色边框 `#4d6e59` 的弹窗，方向很好，但外壳仍被标准 `.modalHeader` 破坏——左上角标题竟然写着通用动词 **`聊天`**（而不是把“周沅”当成对话主角铭牌），右上角依然是带下划线和**黄黑焦框**的 **`回到小镇`**。
- **细节与抖动问题**：
  - 10 颗爱心 `♡♡♡♡♡♡♡♡♡♡` 在 `Dialogue` 中没有独立着色，沿用深蓝字色，看起来像黑色空心轮廓，不如 `friendList` 中的玫瑰红；
  - 打字机效果播放期间插入一个蓝色小字按钮 `显示整句`，文字播完后该按钮突然消失，会导致下方 `送礼` 和 `待会儿见` 按钮向上跳动；
  - 手机端（`m-game-chat.png`）弹窗下方文字区与按钮区空出较大一片素色底，按钮靠左排列，`送礼` 是 GOV.UK 灰方框，`待会儿见` 是 GOV.UK 深绿方框。

#### 12. 事件卡片（`d-game-event-card.png` / `m-game-event-card.png`）
- **最脱离生活感的一屏**：明明是极富人情味的日常故事（“伴侣寄来的信附着一张菜谱……” / “旧书里的纸条”），呈现出来却是冷白底 `#fff` + 左蓝竖条大选项框 + 首选框套黄黑粗焦框，视觉语言 100% 等同于法律条款测验题。
- **底部紧贴**：`处理完事件后继续快进` 直接贴着第二个选项的底边框（`margin-top: 0`）。

#### 13. 游戏其他弹窗（源码核对：`QuarterSummary`、`Inventory`、`Shop`、`Ending`）
- `QuarterSummary`（季度小结）把净收支、属性变化、签证提醒、三天逐条日记以及年末两栏双进度条全塞进 580px 宽的普通弹窗，移动端滚动极长；
- `Inventory`（背包/镇民）与 `Shop` 已经拥有不错的两列 `.itemCard` 和像素物品图标（`32×32`），但受限于冷灰绿色扁平边框与 `site.secondary` 按钮，整体仍偏网页列表而非游戏背包格。

---

## 四、最影响观感的前 10 个问题（按影响程度排序）

### 1. [P1 · 影响最大] 游戏浮层沿用 GOV.UK 政务风样式，与像素生活模拟严重割裂
- **问题定位**：游戏顶栏与网站顶栏同色（`#16324f`）形成“双层蓝条”；游戏内所有弹窗（晨报、菜单、事件、季度总结）直接套用网站白底蓝边方框、`.choice` 蓝竖条选项与 `site.button`/`site.secondary`。
- **具体改法**：
  1. 在 `app/game/game.module.css` 建立游戏专属主题 CSS 变量（详见第五节“暖木与草甸”色板）：HUD 改为深松木绿 `#243B32`（边线 `#192B24`）；游戏外围背景改为暖燕麦 `#F7F1E3`；所有弹窗统一为羊皮纸奶油色 `#FFF9EC` + 2px 圆角木棕框 `#5C432D`（`border-radius: 8px`）；选项按钮改为暖白卡片 `#FFFDF7` + `#C8B79F` 边框（去除 4px 政务蓝左竖条）；
  2. 为 `/game` 路由提供精简版顶栏或顶部返回条（在保留返回模拟器入口与语言切换的前提下，弱化严肃蓝色通栏压迫感）。
- **修改文件**：`app/game/game.module.css`、`app/game/game-view.tsx`、`app/game/game-client.tsx`、`app/game/life-overlays.tsx`、`components/site-shell.tsx`（按路由判断精简游戏顶栏）。

### 2. [P2] 程序化聚焦与 `<dialog>` 默认焦点机制导致满屏刺眼“黄黑双层粗框”
- **问题定位**：`d-simulate.png` 整行 `<h1>` 被框住；`d/m-game-town.png` 整个画布被框住；全部 8 张游戏弹窗打开即框住 `回到小镇` 或首个按钮。原因是 `.body :focus-visible` 的 `outline: 3px solid #ffdd00; box-shadow: 0 0 0 5px #0b0c0c;` 与程序性 `.focus()` / `<dialog>.showModal()` 自动落焦冲突。
- **具体改法**：
  1. **非交互标题去焦框**（保留读屏器聚焦能力）：给程序化聚焦的 `<h1>`/`<h2>` 添加样式 `[tabIndex="-1"]:focus { outline: none; box-shadow: none; }`（GOV.UK 标准做法）。
  2. **`<dialog>` 焦点落容器自身**：在 `Modal`（`app/game/game-view.tsx` L860-889）中给 `<dialog tabIndex={-1}>` 并在 `useEffect` 内调用 `dialog.focus({ preventScroll: true })`，同时设置 `.modal:focus { outline: none; box-shadow: 6px 6px 0 rgb(43 33 24 / 22%); }`。这样打开弹窗时焦距落在带 `aria-labelledby` 的对话框整体上，不把黄黑框硬套在 `回到小镇` 上；键盘用户按 `Tab` 仍可正常亮起按钮焦环。
  3. **画布聚焦降噪**：`app/game/town-canvas.tsx` L120 点击地点按钮后不要直接把显性焦框套满整个画布；可将 `.canvas:focus-visible` 改为低调内描边 `outline: 2px solid #ffe082; outline-offset: -2px; box-shadow: none;`，且鼠标/触控点击（`onPointerDown`）时不要让容器匹配显性重框。
- **修改文件**：`app/site.module.css`、`app/game/game.module.css`、`app/game/game-view.tsx`、`app/game/town-canvas.tsx`、`app/game/town-canvas.module.css`。

### 3. [P3] 小镇画布内地点标签文字极度模糊且遮挡屋顶
- **问题定位**：8px Canvas 文字被镜头 2.5x 放大且采用 `pixelArt: true` 邻近取样，室内外标签笔画全部粘连失真。
- **具体改法**：采用**第二节所述方案 A（HTML/CSS 坐标映射叠加层）**，以 `12px` 清晰矢量字体在深棕木牌胶囊（`rgba(43,33,24,0.88)` + `#FFF8E7`）中渲染；室外仅显示靠近玩家（5 格内）或悬停对象的地名牌，平时不遮挡建筑屋顶。
- **修改文件**：`app/game/scene.ts`、`app/game/town-canvas.tsx`、`app/game/town-canvas.module.css`。

### 4. [P4] 手机端（375×812）顶栏与游戏 HUD 吞噬半屏，画布截断、交互按钮全失踪
- **问题定位**：`m-game-home-interior.png` / `m-game-town.png` 中网站 Header（~100px）+ 展开成 5 层的游戏 HUD（~250px）占掉近 350px 垂直空间；`game.module.css` 中还存在两段前后互相覆盖的 `@media (max-width: 600px) .hudTop` 冲突规则（L431 与 L670）。
- **具体改法**：
  1. 清理 `game.module.css` 冲突的手机 HUD 媒体查询，重新设计手机端紧凑布局（总高度压缩至 `≤ 110px`）：
     ```
     +---------------------------------------------+
     | ← 首页  [林遥 · Y1冬 D1]  07:00 ☀   [🔊][⏩][🌙] |  <- 44px 单行紧缩状态栏
     | 签证:23月 | £9,000 | 😊65 ❤75 📖45 💼10       |  <- 48px 紧凑数值胶囊行
     +---------------------------------------------+
     |                                             |
     |               Phaser 小镇画布                |  <- 占屏 ≥ 55% (约 440px)
     |             [ 互动：查看书桌 ]               |
     +---------------------------------------------+
     | [ 🗺 镇上地点 ]   [ 🎒 背包/镇民 ]   [ 🔄 换人 ] |  <- 56px 底部固定 Dock 栏
     +---------------------------------------------+
     ```
  2. 在 `/game` 游戏进行时，将全站深蓝 Header 折叠为一条 `36px` 细顶条或合并进游戏 HUD 左侧的 `← 返回模拟器` + 语言切换小胶囊；
  3. 16 个地点按钮在手机端不再平铺占页底，而是点击底部 Dock 按钮 `[ 🗺 镇上地点 ]` 呼出底部半屏抽屉（Bottom Sheet），单手即可触达所有地点；
  4. 调整 `.canvas` 高度公式：`height: clamp(320px, calc(100dvh - 280px), 520px)`，保证画布完整居中不截断。
- **修改文件**：`app/game/game.module.css`、`app/game/town-canvas.module.css`、`app/game/game-view.tsx`、`app/game/game-client.tsx`、`components/site-shell.tsx`。

### 5. [P5] 桌面端右侧 16 地点按钮窄格强制断字（“关/门”孤字折行）+ 满屏灰色噪音
- **问题定位**：右侧栏仅 `200px` 宽分成 2 列（按钮净宽约 `87px`），加上 `.body` 全局的 `overflow-wrap: anywhere`（`site.module.css` L8），把 `语言学校 · 关门` 等硬生生切成了 `语言学校 · 关` + 孤零零的 `门`；且满屏灰底 `关门` 淹没了当前真正可去的地方。
- **具体改法**：
  1. 将桌面端 `.townLayout` 右侧栏由 `200px` 拓宽至 `250px`（`game.module.css` L765），或改用**顶部快捷筛选 + 紧凑单列/宽双列（每列 ≥ 120px）**；
  2. 移除 `.destinations button` 的文本硬断字（设置 `overflow-wrap: normal; word-break: keep-all;`），同时用**右侧小圆点或极简角标**替代“· 关门”文字（营业中：暖米白底 + 右侧 8px 绿点 `#3E8E5A`；关门：微淡底 + 灰标“闭店”，且将关门地点默认收拢或排在营业地点之后）；
  3. 对 16 个地点做简单分组（`日常去处` / `办理与学习` / `户外散步`），并在最上方固定显示`走出家门 / 回家`。
- **修改文件**：`app/game/game.module.css`、`app/game/game-client.tsx`、`i18n/zh-CN.ts`、`i18n/en.ts`。

### 6. [P6] 桌面端 HUD 按钮孤立折行 + 室内场景四周露出大块“户外草地绿”
- **问题定位**：`d-game-home-interior.png` / `d-game-town.png` 中 `今天到此为止` 孤立折行到 HUD 第二行最左；而室内 `18×13` 房间周围露出大圈 `#a8c580` 户外草坪绿（`town-canvas.module.css` L7 与 `town-canvas.tsx` L83），像房盒子飘在草海里。
- **具体改法**：
  1. 桌面端 `.hud` 改为标准两行分责制：
     - **第一行（Flex 两端对齐）**：左侧放 `林遥 · 第1年 第1季 冬 · 1月28日 周二 · 07:00 ☀晴 · 第1天/3`；右侧放 `签证剩余 23个月` 胶囊 + 3 个紧凑图标/短文字按钮（`音效`、`快进季`、`结束当天`），保证单行不折行（`gap: 10px` 替代 `20px`）。
     - **第二行**：5 项属性条（加图标与颜色区分）。
  2. `TownCanvas` 与 `TownScene` 根据 `props.interior` 动态切换背景色：室内时 `this.cameras.main.setBackgroundColor('#2A1F18')` 且外层 `.canvas` 加上 `interior` 修饰类（`background: #2A1F18`），将房屋边缘柔和融入暗木室内环境，彻底消除“室内房飘在草坪上”的违和感。
- **修改文件**：`app/game/game.module.css`、`app/game/game-view.tsx`、`app/game/town-canvas.tsx`、`app/game/town-canvas.module.css`、`app/game/scene.ts`。

### 7. [P7] 游戏弹窗内部间距粘连、关闭文案错位（“回到小镇”）、打字机引起按钮跳动
- **问题定位**：
  - `d/m-game-home-menu.png` 中 `.choices` 与下方 `.buttons`（厨房/门口信箱/睡觉）零间距紧贴；
  - `d/m-game-event-card.png` 中 `处理完事件后继续快进` 紧贴选项边框；
  - 在家用菜单和聊天窗右上角写着 `回到小镇`，空间逻辑矛盾；
  - `Dialogue` 打字机播放时显示 `显示整句` 按钮，播放完消失导致底部按钮突然上跳；且 `Dialogue` 中的爱心无色、`HeartProgress` 未统一上色。
- **具体改法**：
  1. 在 `.choices + .buttons`、`.choices + .people` 及快进提示上补充 `margin-top: 16px`；
  2. 将通用右上角关闭链接文案从 `回到小镇` 改为上下文明确的小图标按钮 `✕`（`aria-label="关闭"` 或文字 `收起`），`Dialogue` 的弹窗标题不要写“聊天”，改为直接用 NPC 名字或移除冗余 `.modalHeader`；
  3. 打字机跳过改为点击对话框文本框即可瞬显整句（提示小字 `点按继续` 固定占位，不再将按钮插入文档流引起抖动）；统一给 `HeartProgress` 增加 `.hearts { color: #b83b2e; }`。
- **修改文件**：`app/game/game.module.css`、`app/game/game-client.tsx`、`app/game/game-view.tsx`、`app/game/life-overlays.tsx`、`i18n/zh-CN.ts`、`i18n/en.ts`。

### 8. [P8] 跨页样式一致性缺失：首页按钮变蓝字、政策页丢失黄色改革标识、页面宽度跳跃
- **问题定位**：
  1. `app/site.module.css` L13 `.body a` 权重高于 L179 `.secondary`，导致首页 `<Link className={styles.secondary}>`（`玩一局 · Immigration Life`）误呈蓝色字体；
  2. `app/policy/page.tsx` L67-73 和 `app/about/about-content.tsx` L25 未同步结果页的 `ANNOUNCED` 黄色卡片顶边（`#b58800`）与黄色 badge（`site.announced`），政策页两条规则集真伪徽章同色；
  3. `d-home.png` 横线全宽而下方内容右半部大空、`d-about.png` 720px→1064px→720px 宽窄来回跳。
- **具体改法**：
  1. 将 `app/site.module.css` L179 改为 `.body .secondary`（匹配 `.body .button` 权重）并给 `.button, .secondary` 加上 `display: inline-flex; align-items: center; justify-content: center;`；
  2. 为 `app/policy/policy.module.css` 增加 `.announcedCard { border-top-color: #b58800; }`，并在 `policy/page.tsx` 与 `about-content.tsx` 中补全 `site.announced` 与 `.announcedCard`；
  3. 为首页 `Home` 调整结构：小游戏入口改版为右侧（或下方）带暖色边条的轻量引导卡片（含 1 个像素头像预览 + 简短副标题），既填充桌面右侧空余又优雅衔接两种气质。
- **修改文件**：`app/site.module.css`、`app/policy/page.tsx`、`app/policy/policy.module.css`、`app/about/about-content.tsx`、`app/home-content.tsx`。

### 9. [P9] 选人页纯英文大标题突兀、三卡排布不对称、按钮高低不齐
- **问题定位**：`d-game-start.png` 中全中文网页里突兀挂着大黑体 `Immigration Life`；2 列排 3 张卡导致第二行右侧留出整块白洞；各人物简介长度不同致使下方绿色按钮不在同一水平线；且 `m-game-start.png` 头像挤窄右栏文本。
- **具体改法**：
  1. 中文界面展示 `移民生活` 主标题 + 小号暖金色英文副标 `Immigration Life`，外加一段欢迎语与简洁的暖色背景框；
  2. 桌面端 `.characters` 改为 3 等分卡片（`max-width: 1040px; grid-template-columns: repeat(3, minmax(0, 1fr))`），卡片内部由“左右分栏”改为**“上头像居中（带 `88×88` 圆角暖木相框）+ 中简介 + 下 `margin-top: auto` 对齐全宽按钮”**。既消除第二行空洞，又让三枚按钮完美齐平，手机端单列也能舒展阅读；
  3. 清理 `game.module.css` 中遗留被覆写的死 `.portrait` `background-size` 声明（L36 与 L341）。
- **修改文件**：`app/game/game.module.css`、`app/game/game-view.tsx`、`i18n/zh-CN.ts`。

### 10. [P10] 中英文混排与字体栈粗糙、顶栏硬拼双语导致手机折行、问卷缺进度反馈
- **问题定位**：
  - `site.module.css` L5 `font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;` 让西文和数字用偏粗的 Arial；
  - 顶栏在中文下写死 `政策依据 · Policy`、`方法说明 · About`，导致手机端（`m-home.png`）换行占用空间；
  - `/simulate` 仅写 `步骤 1 / 9`，缺可视化进度条；游戏触控浮层按钮写死 `互动 · E / 空格 / 点按`。
- **具体改法**：
  1. 更新全站字体栈为：`font-family: 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`（中文优先，西文用现代系统字体，数值区域加 `font-variant-numeric: tabular-nums;`）；
  2. `i18n/zh-CN.ts` 顶栏文案简化为纯中文 `政策依据`、`方法说明`、`反馈`（右侧已有明确的 `中文 / English` 切换，无需在每个菜单项后硬拼英文），使手机端 Header 收回简洁一行；
  3. `/simulate` 顶部增加 4px 细进度条；游戏底部浮动按钮区分触控与键鼠（触控显示 `互动：书桌` / `和周沅聊天`，键鼠显示 `[E] 互动：书桌`）。
- **修改文件**：`app/site.module.css`、`i18n/zh-CN.ts`、`app/simulate/page.tsx`、`app/simulate/form.module.css`、`app/game/game-client.tsx`。

---

## 五、「移民生活」统一视觉方向：暖木与草甸（Warm Timber & Meadow）

为契合像素风小镇与星露谷/动森般的温暖日常体验，建议将游戏界面从网站政务蓝中独立出来，建立如下统一视觉规范（所有配色均经对比度测算，符合 **WCAG 2.1 AA ≥ 4.5:1** 标准，所有交互控件保持 **≥ 44×44px** 触控热区）：

### 1. 字体与排版系统
- **原则**：**不在大段中文 UI 中强制使用点阵像素字**（小号像素中文字体在 3x 高分屏极易疲劳和模糊），而是用“圆润温和的无衬线中文 + 等宽清晰数字”搭配“像素风边框与阴影”来达成和谐。
- **字栈**：`'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **数值对齐**：时钟、存款、倒计时、属性条数值统一启用 `font-variant-numeric: tabular-nums;`。
- **字号层级**：
  - 弹窗/页面标题：`20px–22px`，`font-weight: 700`，`line-height: 1.35`
  - 正文/对话台词：`16px–17px`，`line-height: 1.7`（手机端保持 `16px`，不缩小至 14px 以下）
  - 辅助提示/标签/HUD 标签：`13px–14px`，`line-height: 1.45`（全站不出现低于 `12px` 的可读文字）

### 2. 暖色协调色板（Tokens）

| 用途 | Token 建议值 | 视觉角色与说明 | 对比度参考 |
| :--- | :--- | :--- | :--- |
| 游戏背景舞台 | `#F7F1E3` | 暖燕麦米纸色，替代刺眼纯白 `#fff` | — |
| 弹窗主底色 | `#FFF9EC` | 羊皮纸奶油色，所有对话/菜单/事件统一底色 | — |
| 次级卡/选项底 | `#F4EAD5` / `#FFFDF7` | 暖亚麻内衬与高亮交互卡底色 | — |
| 室内画布底色 | `#2A1F18` | 深胡桃木底，包裹室内房间（替代草绿） | — |
| 深色 HUD 底色 | `#243B32` | 深松木绿，呼应城镇主色调，告别政务蓝 | — |
| 面板主边框 | `#5C432D` | 暖橡木棕 `2px` 边框（内加 `1px #FFF` 高光） | — |
| 主文字（Ink） | `#2B2118` | 深浓缩咖啡棕，温和但极清晰 | 在 `#FFF9EC` 上 **14.5:1** |
| 次文字（Muted） | `#5E4F40` | 暖栗灰，用于副标题、营业时间、效果提示 | 在 `#FFF9EC` 上 **7.2:1** |
| 主按钮（苔藓绿）| `#2F6F4E`（底边 `#1B422E`）| 开始、起床、确认、收获等主动作 | 配 `#FFF` 文字 **6.1:1** |
| 暖琥珀/蜂蜜金 | `#FFD97D`（深底）/ `#B87314`（浅底）| 时钟数字、成就、日出/节日高亮 | 深底 **9.2:1** / 浅底 `#FCE8B2` 配 `#2B2118` **10:1** |
| 陶土红/红心 | `#B83B2E` | 好感红心、签证紧迫警示、扣减提示 | 在 `#FFF9EC` 上 **5.2:1** |
| 属性条 5 色 | 金 `#E9B44C` / 橙 `#E88D67` / 绿 `#6AB583` / 蓝 `#5BA4CF` / 紫 `#A584D6` | 分别对应存款、心情、健康、英语、事业 | 槽底 `#182922` |

### 3. 面板与容器样式（轻像素双层木框）
- 告别直角 `0px` 与政务蓝边框，采用 **轻圆角硬边微阴影**：
  ```css
  .cozyPanel {
    background: #fff9ec;
    color: #2b2118;
    border: 2px solid #5c432d;
    border-radius: 8px;
    box-shadow: inset 0 2px 0 #ffffff, 4px 4px 0 rgba(78, 57, 40, 0.22);
  }
  ```
- 晨报卡片、事件卡片、在家菜单共用这一套羊皮纸木框语言，让每次弹窗都像在游戏世界内翻开一本小镇手帐。

### 4. 按钮家族（触控高度全员 `min-height: 44px`）
- **主按钮（Primary）**：苔藓绿 `#2F6F4E`，`border: 2px solid #1B422E`，`border-bottom-width: 4px`，`border-radius: 6px`，悬停 `#265C40`，按下 `transform: translateY(2px)` + `border-bottom-width: 2px`（模拟像素手柄实体按钮微按感）。
- **次按钮（Secondary）**：暖白亚麻 `#FAF3E3`，`border: 2px solid #9E866B`，`border-bottom-width: 3px`，文字 `#2B2118`。
- **行动/选择卡片（Choice）**：暖米白 `#FFFDF7`，`border: 2px solid #C8B79F`，`border-radius: 6px`，内部用左右排版或底部横向小胶囊展示时间与属性变化（如 `[⏱ 60 分钟]` `[心情 +2]` `[健康 +2]`），彻底取消左蓝条。
- **关闭按钮**：弹窗右上角统一为 `36×36px`（内含扩展热区至 `44×44px`）圆角小木扣 `✕`，不放误导性的“回到小镇”文字。

### 5. 对话框设计草图（Dialogue Box）
模仿动物森友会/星露谷底部铭牌对话框，不显示冗余的“聊天”模态标题栏：
```
      ┌─ 周沅 · 室友（装裱员）─────────────┐  <-- 凸起圆角小铭牌（贴于框顶左上）
┌─────┴────────────────────────────────────┴──────────────┬───┐
│ ┌──────────┐  ♥♥♥♥♥♥♥♡♡♡  下一颗心 32 / 100             │ ✕ │
│ │          │                                            └───┤
│ │ 像素头像 │  “周沅，做装裱的。合租先分清使用范围，         │
│ │ (暖框底) │   纸屑我扫。”                                  │
│ └──────────┘                                                │
│                             [ 🎁 送礼 ]    [ 待会儿见 ▸ ]    │
└─────────────────────────────────────────────────────────────┘
```
- **交互细节**：文字打字机阶段点击对话框文本区即可瞬间展示整句；好感度红心固定为暖红 `#B83B2E`；底部只留清晰的两个实体游戏按钮。

### 6. HUD 设计草图（顶栏状态与属性条）
- **桌面端 HUD（深松木绿 `#243B32`，总高控制在 96px 内，永不折行）**：
  - 上排：`林遥` | `第1年 第1季·冬` | `1月28日 周二` | `07:00 ☀晴` | `第1/3天` ── 右对齐 ── `[签证 23月]` `[🔊 音效]` `[⏩ 快进]` `[🌙 结束当天]`
  - 下排（5 等分网格）：每个属性前面加一个简洁小图标，名称左对齐、数值右对齐，进度条 `8px` 高、圆角 `4px`、分色明确。
- **手机端 HUD + 底部 Dock**：上排缩为 1 行核心时间与快捷按钮，中层 1 行紧凑数字属性胶囊，释放最大面积给中央像素画布，操作集结到底部 3 枚大触控 Dock 按钮。

---

## 六、改造成本评估与落地优先级

### 第一档：低成本高回报（纯 CSS / 文案 / 轻量 React 调整，无需任何新素材，预计 1–2 天内可落地）
1. **修复全局 CSS 与跨页 Bug**：补回首页次按钮黑字权重（`.body .secondary`）、政策页与关于页补全 `ANNOUNCED` 黄色标记与琥珀顶边、清理 `game.module.css` 冗余与冲突媒体查询、去除 `.destinations button` 的“关/门”断字与 `overflow-wrap: anywhere` 继承。
2. **清除程序化聚焦黄黑大框**：给 `tabIndex="-1"` 标题去焦框、让 `<dialog>` 默认接管初始焦点、降低鼠标点击后 Canvas 焦点边框入侵。
3. **游戏换肤（Theme Tokens）**：使用 CSS 变量把游戏 HUD、背景、弹窗、选项按钮全部切换至“暖木与草甸”配色（`#243B32` / `#FFF9EC` / `#2F6F4E` / `#5C432D`），修复室内外露底色为 `#2A1F18`。
4. **修复弹窗内边距与语义**：增加 `.choices + .buttons` 间距与快进提示上边距；优化关闭按钮为 `✕` 并修正“回到小镇”错位文案；去除打字机 `显示整句` 引起的按钮跳动；统一红心颜色。
5. **实施 DOM/HTML 地点标签层**：彻底解决画布地名模糊问题，并实现“近距/悬停亮牌”。
6. **选人页 3 列对齐 & 手机端紧凑 HUD + 底部 Dock**：直接改用 Grid/Flex 布局，显著救回 375×812 手机首屏空间。
7. **字体栈与精简中文顶栏**：把西文 Arial 后置，中文顶栏去掉硬拼英文，让手机导航回到单行。

### 第二档：中低成本（轻量代码绘制或复用仓库既有图标，无需找新美术）
1. **复用已有 `public/game/assets` 素材**：仓库中已经预加载或存放了 `hud/heart.png`、`items/*.png`、`crops/*.png`（详见 `ATTRIBUTION.md`），可直接用作对话框像素红心、道具/送礼按钮前小图标、以及种子商店卡片装饰。
2. **轻量 Inline SVG 图标替换粗陋 Unicode**：用 16×16 像素感（或圆润描边）SVG 替换系统原生 `☂`/`☀`/`✉`/`⌂`/`✈` 字符，消除不同系统（macOS/Windows/Android）下符号渲染差异，提升晨报卡和状态栏精致度。
3. **问卷页轻量分段进度条**：用纯 CSS 实现 `/simulate` 顶部 9 步进度条。

### 第三档：需要新素材（长期品质打磨，可按版本迭代）
1. **专用半身对话头像立绘（Portraits）**：目前选人页和对话框把 16×16 像素行走小人硬放大 5 倍到 80×80，长期来看缺少面部表情变化（开心/害羞/烦恼）与星露谷式的情感魅力；为 3 位主角与常驻镇民制作 48×48 或 64×64 带表情半身立绘，是提升生活模拟沉浸感的最大抓手。
2. **游戏首页/选人页像素风景横幅**：为 `/game` 欢迎页及首页小游戏推荐位绘制一张温暖的小镇街道/四季一角插画横幅，建立第一眼的情感吸引力。
3. **城镇建筑差异化招牌图标**：为咖啡馆、书店、诊所、签证中心、车站绘制独立像素小招牌贴图，进一步减少地图上对文字标签的依赖。
4. **环境氛围细节（与 `ATTRIBUTION.md` L90 备注呼应）**：补充可合法商用的 CC0 池塘小鸭/猫咪动画、门前花盆微风摇曳及雨天地面水花，让小镇真正“活起来”。
