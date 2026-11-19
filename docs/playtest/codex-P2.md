# P2 模拟试玩记录

- **日期与版本** 2026-11-19，正式站截图页脚显示 `a13ee94`，本地游戏逻辑来自同一提交。
- **角色与材料** 我扮演第一次来、对英国移民规则只懂一点、只读英文的玩家。A–C 使用桌面 A2 英文截图和同名文字。D 选 Nora Aziz，用 `graduate`、`en`、固定种子 `23` 开局。
- **观察范围** 模拟试玩是正式真人试玩的预演。A 的截图已经填好，带有答案提示效应。A–C 没有实点或计时。D 实际调用游戏包推进时间、选事件和执行动作，截图仅供定位界面。桌面游戏截图除选角外展示的是另一角色的中文局，Nora 的英文卡片和状态以本次逻辑运行输出为准。

## 任务 A · 按 A2 填问卷

**结果** 从九张已填截图走到结果。第一步的国籍代码需要看已填值才确定，签证历史也有几处要靠人物卡判断。

| 位置 | 我看到什么、会怎么填 |
|---|---|
| 首页 `d-home.png` | 右上角的 `English` 是我先找的入口。有一个绿色主按钮，右边另有 `Immigration Life` 图片卡。我会先换语言，再找开始评估的主按钮。现有首页截图是中文，切换后主按钮的英文和跳转没有观察到。 |
| 01 · `A2-en-d-step01.png` | `About you`。生日填 1998-07-01，对照截图的 `01/07/1998`。国籍我自然会想写 `Malaysia`，但提示要 `ISO 3166-1 alpha-3`，只举了 `CHN`。我不知道马来西亚这格该打什么，也看不到国家名选择器。从已填截图才确定是 `MYS`。 |
| 02 · `A2-en-d-step02.png` | `Check if you need professional advice`。按卡片对犯罪记录、移民违规、政府欠款都选 `No`。`non-protection route` 我不懂，前面列的 `overstaying` 等例子足以让我判断这张卡。 |
| 03 · `A2-en-d-step03.png` | 用 `Add a visa period` 填三段，Student 2019-09-15 至 2022-09-14、Graduate 2022-09-15 至 2024-09-14、Skilled Worker 2024-09-15 至 2027-09-14，均选 `Main applicant`。我能从卡片抄下 `SOC 2020 occupation code` 的 2134 和 `Sponsored annual salary` 的 45000。题卡没说岗位是否在 `Immigration Salary List`，我也不知道这张表是什么，于是选 `Not provided / unsure`。提示告诉我网站会按未列入处理，但没告诉我去哪确认。 |
| 04 · `A2-en-d-step04.png` | `Time outside the UK` 要离开与返回的日期。A2 没有要填的离境记录，保留 `No absences added` 后继续。我记下了 `Add an absence`，后面的假设题可能要回来。 |
| 05 · `A2-en-d-step05.png` | `Earnings by tax year` 说明税年是 6 April 到次年 5 April。2025–26 和 2024–25 的个人收入各填 45000。其余五年未知，留白。伴侣收入也留白。`Leave unknown amounts blank. Enter 0 for no earnings.` 让我知道不用猜，也没有把未知当成零。 |
| 06 · `A2-en-d-step06.png` | `Benefits and statutory payments`。我认识 `benefits`，对 `statutory payments` 包括哪些支付没有把握。卡片说其他都没有，看到 `No payment records added` 就继续。 |
| 07 · `A2-en-d-step07.png` | `Family relationships` 只填和情景相关的伴侣、父母或子女。我保留空白。页面直接说明不用姓名和证件，这步容易判断。 |
| 08 · `A2-en-d-step08.png` | `English and Life in the UK`。英语选 `B2`，考试选 `Passed`。我不熟悉 `CEFR` 和哪些情况可 `Exempt`，人物卡的 B2 和已通过能直接对应两项。 |
| 09 · `A2-en-d-step09.png` | `Simulation date` 对应卡片里的「今天」2026-11-16，截图是 `16/11/2026`。前面填过的七个税年和这里相符。`Go back to check earnings` 让我知道改日期之后可以回去检查。看完蓝色声明后选 `View results`。 |
| 结果 · `A2-en-d-result.png` | 开头有 `Shared scenario loaded. You can edit the inputs.`，来自这份共享情景截图，我没有看到实际提交表单时是否出现。正文左右两栏都显示 `Likely not eligible`，也都显示 2029-09-15。我先读左边的 `What is missing`，再往下找 `Not met (3)` 来弄明白两个年限及工资。 |

## 任务 B · 读结果并和参考答案对照

先从 `A2-en-d-result.png` 和文字稿作答，再读试玩包第 7 节。第 7 节直接给 A2 的状态、主路径年限和日期，其余题按截图的理由与声明核对。

| 题目 | 我的第一遍回答 | 对照 |
|---|---|---|
| B1 · 现在能申请吗？最早哪天？ | 2026-11-16 大概不能申请永居。页面给 2029-09-15，我把它读作从 2019-09-15 起满 10 年的 Long Residence 日期，先拿它做计划。人物卡的签证 2027 年就到期，摘要没告诉我如何衔接到那一天。 | 符合 A2 参考答案。现行法律是「可能不符合」、10 年 Long Residence，页面给 2029-09-15。Skilled Worker 的五年也在同一天满。 |
| B2 · 两栏有什么不同？ | 左栏按现在的法律算。右栏按已经公布、尚未生效的改革，假定它们在模拟日适用。两边日期一样，我差点当成同一条路径。再看一眼才发现左边写 `10 years`，右边写 `5 years`，两栏起算点也不同。 | 符合。第 7 节右栏也是「可能不符合」、5 年、2029-09-15。黄色 `Announced, not in force` 和栏上面的假设说明回答了规则是否生效。 |
| B3 · 还差什么？ | Long Residence 目前只有 7 个整年，要继续积累到 10 年。往下读才发现 Skilled Worker 另算，它只有 2 个整年，离 5 年尚远，£45,000 也低于该岗位的 £54,700 `going rate`。第一眼看 `Not met (3)`，我差点当成三项必须全补。更早收入未知是右栏里单独列出的未决项。 | 符合第 7 节的两条居留时间线。工资差距来自左栏 `Skilled Worker settlement salary (going rate)`，我由随后的数字才懂 `going rate` 在这里是对应岗位的薪资要求。右栏的 `Unknown / unresolved (2)` 保留了对旧税年收入的不确定性。 |
| B4 · 会直接用结果递交吗？ | 不会。第 9 步和结果尾部说是一般政策信息和假设模拟，无法判定移民身份或保证申请结果。我会拿日期和规则清单去核对正式要求、许可和证据，必要时找受监管的顾问。 | 参考表没有单列此题。结果页的 `Seek regulated advice` 和 `It does not determine your legal immigration status or guarantee the outcome of an application.` 支持这个判断。 |

## 任务 C · 假设 2023 年离境 200 天

1. **入口找到了。** 在 `A2-en-d-result.png` 左栏的 Long Residence 理由下面就有蓝色 `Try in What-if`，我会先点这里。拉到结果页底部也看到 `Scenario lab · What-if` 和 `Edit inputs`。
2. **在实验室卡住。** `A2-en-d-whatif.png` 能调整模拟日期、收入、英语、考试、是否假定未领 public funds。和这题相关的只有 `Assume no absences`，当前已是未勾选。我第一反应是取消勾选会让日期框出来，但截图的未勾选状态也没有日期或天数输入。两栏都写 `Same as the current scenario`，左边 `10 years → 10 years`、右边 `5 years → 5 years`，日期都是 `2029-09-15 → 2029-09-15`。这只能读作截图里的基线。
3. **我会走修改输入。** 用 `Back to results` 返回，记下基线，通过 `Edit inputs` 找到第 4 步 `Time outside the UK`，选 `Add an absence`。任务卡只有年份和总天数，我得先为这一次比较选定一对日期，再回结果看现行法律栏的状态、路径和日期。现有截图没有新增离境后的画面，所以本次找到入口和备用走法，未完成 200 天重算，也没有把基线当成这道题的答案。

## 任务 D · Nora Aziz，Graduate

`d-game-select.png` 右上角有 `English`，Nora 的卡在下排右侧。`d-game-morning-card.png`、`d-game-town.png`、`d-game-home-menu.png` 和 `d-game-chat.png` 给了晨间弹窗、地点按钮、家中动作、聊天各自的位置。故事从英文人物简介读起。Nora 刚读完软件工程硕士，拿着 Graduate permission，要在到期前找到有担保的工作。

### 从起床到转换许可

| 游玩到哪里 | 我看到的选项与实际选择 |
|---|---|
| 第 1 年第 4 季，2026-09-29 07:00 | `opening-graduate` · `Life beyond the gown`。看到 `At Work, apply, interview and ask HR about sponsorship and the CoS.`，也看到 Graduate 不能续签的提醒。选唯一的 `Put your CV in your bag and look around`。我知道第一站该是 Work，不过当时不懂 `CoS` 是哪份文件。在家有 `Rest`、`Take a nap`、`Study English` 等。我先和室友 Maeve 打招呼，遇到 `maeve-daily-59` 的 `Full screw box. Not the one I need.`，从开场才联想到她在修收音机。 |
| 第 1 天，先看镇上 | 07:10 去 Work，当时没有动作。等到 08:00，先去 Town hall，选 `Read both settlement assessments`。逻辑给的两套状态分别是资料不足、可能不符合。这下明白这回先要解决工作许可。我又到 Corner shop，Rahman 的 `rahman-intro` 问 `What sort of tea takes your fancy?`。在茶、饼干、花和点心之外看到 `Turnip seeds`，于是花 £3 买一包去 Allotment。 |
| 第 1 天，菜地 | 看见 `Rent an allotment` 和 `Mark the public flowerbed from Margaret’s note (free)`。我租自己的地，扣 £60 后出现六块空地。种一包种子再浇水，分别看到 `Seeds tucked in, soil patted down.` 和 `Water sinks into the soil; the can feels lighter.`。种子从背包减少，第一块地有苗。 |
| 第 1 天，09:00 回公司 | 可选 `Job search: apply / interview / follow up with HR` 和 `Work a shift`，先找工作。卡片 `graduate-cv` 写 `The vacancy is still open.`，两个选项是 `Send the testing team your project`、`Eat today; apply another time`。我怕职位关掉，先投。选择后找工作动作消失。我和 Ade 聊了一句（`ade-intro` · `Task: meet you. That one's done.`），10:10 探一下 Visa centre，营业时也没有可用动作。我猜要等担保。回公司上了一班，赚 £340，回家睡觉。 |
| 首季周末、节日和小结 | 2026-10-03 下雨，去看苗长到 2，回家 `Rest` 后睡到 12-12 节日，苗长到 4。Village green 有 `Join the festival`。我去逛，看到 `A gingerbread person settles safely into its box.`。回家睡过第三天后，出现季度日志 `Pay arrives, bills go out, and another season passes outside.`，结算里现金减少 £6,655，进入下一季。看到了逻辑层的季度小结记录，浏览器小结弹窗的展示未观察。 |
| 第 1 年第 1 季，2026-12-29 | 刚起床连着来了 `news-consultation-response` 和 `news-budget-2026`。先选 `Hear the bulletin out before paying`，再选 `Note the window separately from the pending details`，明白卡片上的公布和细则出来是两件事。邮箱有信件 `graduate-life-gown-return`，在回校园转一圈和买热饮之间选 `Buy a warm drink on the corner`，喝了就准备面试。 |
| 第 1 年第 1 季，面试与周末 | 09:00 回 Work 同一个招聘动作，触发 `graduate-interview`。`the demo throws an error`，两个选项是 `Trace the error and explain your reasoning`、`Admit you need preparation and reschedule`。我选现场排查，正好展示 Nora 是怎样做测试的。周末去菜地找上季种的苗，六块地都空了，收获和继续浇水都用不了。我回家睡到节日，再进入下一季。 |
| 第 1 年第 2 季，2027-03-23 | 回 Work 看到 `graduate-sponsor` · `HR wants to hire you.`。选 `Ask HR to verify the sponsor and role`，手上还没有可交的文件，光等回复也不踏实。状态里的健康在降，我顺路去 GP surgery。Priya 自我介绍为 `clinic reception`（`priya-intro`），选 `See the GP` 后健康加 6。之后回家休息，周末也在家恢复。节日早上 `graduate-life-weekend-chat` 给了回传水壶声、改约电话两个选择，我选 `Arrange another call`，然后睡过该季。 |
| 第 1 年第 3 季，2027-06-29 | `graduate-salary` · `The contract figure`，HR 报 £40,700。可以 `Negotiate £44200 and an updated contract`，也可以 `Keep the original offer and check the papers`。我选谈薪，手头存款每季在降。去 Visa centre 仍然没有动作，我还不知道要等多久才有 CoS。回去上班补一点钱。周末休息，节日读到 `graduate-life-mattress`，在把床垫倒着挪和稍后再搬之间选 `Put it down and rest before retrying`，再睡到下一季。 |
| 第 2 年第 4 季，2027-09-28，拿到 CoS | 再次在 Work 跟进，`graduate-cos` 写 `HR sends the CoS after checking the role and contract.`。可直接归档，也可 `Check the spelling with HR, then file it`。我选后者，第一次从上下文明白 CoS 是到签证中心之前必须拿到的担保文件。 |
| 同日 10:00，签证中心查工资 | 这次出现 `Check the offer (standard-pay scenario)` 和 `Switch to Skilled Worker (£4048)`。我先点 `graduate-check-offer`，读到 £44,200 同时达到一般门槛 £41,700 和 SOC 2136 对应的 £41,200。后面一下子出现 `new entrants`、`SW 12.2(f)`、`Tier 2` 和合计年限，我重读才懂这是另一个工资选项，游戏只判这份 offer 的标准工资情景。我没有从这张卡得出 Nora 也通过了 new entrant 选项。 |
| 同日 11:00，实际转换 | 选 `graduate-switch` 后，出现 `You receive Skilled Worker permission in this scenario and file the contract and CoS.`。余额从 £13,937 到 £9,889，剩余许可从 11 到 35 个月，同一按钮消失。状态从 Graduate 转成 Skilled Worker，SOC 2136、£44,200，旧许可记录接到 2027-09-14。游戏可玩日是 09-28，新许可记录使用 2027-09-15 至 2030-09-14。 |

拿到 CoS 前，我靠休息和睡觉手动推进各季。看到同一句 `Job search: apply / interview / follow up with HR` 再出现时，我不知道它这次具体会做哪一环。谈薪后第二次跑去签证中心扑空，到这时我最想跳过的是已经做完本季主线后的周末和节日。首季我愿意查市政厅、逛店、种菜和看节日，后来也去了 GP，和室友及镇民聊过。我没有钓鱼、做实际的厨房动作，也没有收获萝卜。

### 转换后快进到结局

我用 `fastForward` 推进，停在事件就读文案和选项再继续。快进执行上班、休息、放松、节日等日常动作。我在这一段只处理弹出的选项，没有手动回签证中心续 Skilled Worker 或去参加考试。

| 游戏季度 | 快进中读到的事件和实际选择 |
|---|---|
| 第 2 年第 4 季 | `graduate-life-calendar` · `Dinner finally beats refreshing the inbox.`。找到工作后我也想把晚饭留出来，选 `Give dinner a whole square`。 |
| 第 2 年第 1 季 | `graduate-life-reference` · `Your supervisor agrees to be a referee`，选 `Thank them and attach the role description`。随后 `graduate-life-desk-photo` 同学发来收干净的桌子，我选 `Send your desk as it is, with a smile`。 |
| 第 2 年第 2 季 | `graduate-life-commute` 路过面包店闻到香味，选 `Turn back for tomorrow’s bread`。`graduate-life-plants` 同学留的植物叶子下垂，想到前面种菜没成功，选 `Ask about the drooping leaves with a photo`。 |
| 第 2 年第 3 季 | `graduate-life-cover-letter` 写着 `The cover letter still names the previous company.`，让我纳闷都换到工签了，眼下在申请哪个职位，先选 `Save this one for revision`。在 `common-museum-label` 我更想听人讲缝纫机的故事，选 `Ask the volunteer who used it`。 |
| 第 3 年第 4 季 | `graduate-life-team-photo` 同事把我招进合照，选 `Move in a little`。紧接 `graduate-life-badge` 写的是 `your first work badge`，扣夹很硬。我选 `Ask a colleague how it opens`。 |
| 第 3 年第 1 季 | `graduate-life-spare-room` 经过已经有人住的旧宿舍，我选 `Keep walking to your own home`。`graduate-life-rain-cv` 的 `document wallet was waterproof`，衣领反而湿了，我选 `Tidy the wet collar in the bathroom`。 |
| 第 3 年第 2 季 | `common-new-glasses`，公交车到站才看清车号，我选 `Start with an eye test`。然后 `graduate-life-career-fair` 的传单塞了一袋，我选先理清方向的 `Choose the role you most want to understand`。 |
| 第 3 年第 3 季 | `graduate-life-practice` 对着橱柜练习自我介绍时被 Maeve 听见，我选 `Laugh together, then try again`。`graduate-life-winter-list` 购物单上漏了洋葱，选 `Ask Maeve to add the onions`。 |
| 第 4 年第 4 季 | `graduate-life-station-case` 同学告别时箱轮卡住，选 `Lift the case, then wave`。`graduate-life-meeting-room` 把会议室 Elm 当成人名，我选 `Sketch a small map of the rooms`。 |
| 第 4 年第 1 季 | `graduate-life-cv-font` 的 `No new words appear; your stomach supplies the sound.` 让我想这时就先吃饭，选 `Stop formatting and cook`，这是剧情选项。`common-bus-small-talk` 在车上遇熟面孔，选 `Talk about weekend walks`。 |
| 第 4 年第 2 季 | `graduate-life-bus-interview` 候车椅都湿了，我选 `Wait in a café`。`graduate-life-mentor` 前辈演示时点错菜单，我选 `Write the steps for the next newcomer`，正好给下一位新人留个办法。 |
| 第 4 年第 3 季 | 剩 2 个月时，先遇 `common-paperback-note`，旧书里夹着购物单，我选 `Send a photo of the note to a friend`。再遇 `graduate-life-curtain`，窗帘太短，我选 `Add old fabric along the bottom`。这一轮的日常卡读完，没有弹出续签选项。我再按快进，游戏结束。 |

**结局** 第 4 年第 3 季，日记结算了 16 季。游戏结算日为 2030-09-15，许可到期日是 2030-09-14，状态记入 `OVERSTAYING`，结局 id 是 `overstayed`。英文说 `Your permission expired without new permission in place. This town life ends here.`。我知道这次快进没有替我续签。后一句 `seek work, confirm sponsorship and a CoS, then switch at the visa centre` 却把我带回 Graduate 的开头，和这局已经转换成功的记录对不上。我先怀疑转换有没有被记住，回看许可记录才确认最后过期的是 Skilled Worker。

## 试玩后问卷

### 5.1 SUS 易用性

| 题 | 评分 | 理由 |
|---|---:|---|
| 1 · 愿意经常使用 | 3 | 有签证或就业变动时会回来核对，平时未必常开。 |
| 2 · 不必要地复杂 | 4 | 结果的两条居留路线挤在一个 `Not met` 列表里，离境假设也得先退出比较页。 |
| 3 · 容易使用 | 4 | 九步进度、继续按钮和结果入口容易顺着走。题卡替我准备了日期、SOC 和考试状态，所以这一分基于有材料可抄的体验。 |
| 4 · 需要懂技术的人帮忙 | 1 | 看懂页面与选择的动作不需要技术知识。真正拦我的是国籍代码和个别规则术语。 |
| 5 · 功能衔接得好 | 3 | 结果页能直接进 What-if，但要增加离境又得回问卷。游戏开头指到公司和签证中心，主线中途的下一步不够明确。 |
| 6 · 前后不一致太多 | 3 | 问卷按钮和两栏标记很一致，但游戏在已换成 Skilled Worker 后仍出现 Graduate 转换版结局提示。 |
| 7 · 大部分人很快学会 | 4 | 有人物卡时很容易理解每页要填什么，也能顺着晨间卡开始玩。困难更多出现在如何解读结果和等待下一步。 |
| 8 · 用起来很麻烦 | 3 | 填三段签证日期和找不到新增离境入口有点费力，多数空白步骤继续就行。 |
| 9 · 使用有信心 | 3 | 能说明两栏和日期，但要回看规则理由才有把握区分等待时间和岗位薪资。 |
| 10 · 开始前要学很多东西 | 3 | 不用先学怎么操作。能否自助填对，取决于是否已知三字母国籍代码和岗位信息。 |

奇数题换算合计 12，偶数题换算合计 11，SUS 为 **57.5 / 100**。这是 P2 一次模拟的评分。

### 5.2 理解

1. 网站的结果是法律意见吗？**不是。**
2. 已公布改革一栏的规则现在生效了吗？**还没有。**
3. 小雯按当前栏大概仍不能申请。Long Residence 还没满 10 年，Skilled Worker 也未满 5 年，现有工资低于页面给出的岗位要求。

### 5.3 游戏

1. **好玩 3/5。** 面试演示出错和商店买种子让我愿意选。后面好几季有相同的工作和睡觉流程。
2. **了解增加 4/5。** 我现在能复述先找能担保的工作、确认合同、拿 CoS，再到签证中心转换这条游戏里的顺序。工资核查里的折扣选项仍要慢慢读。
3. **会主动再打开 2/5。** 如果直接接续到正在等的招聘环节，会想试一试。已经做完本季面试后还得走两天，我容易停在中间。
4. **最有意思的是** `graduate-interview` 的现场排查，让我在做 Nora 自己的职业选择。**最想跳过的是** 谈完薪等 CoS 的两天，以及快进后又提到求职材料、却没说明在找什么工作的生活卡。

### 5.4 如果只能改一个地方

我会让 What-if 直接添加一段离境，保留原情景，在同一屏显示当前法律的状态、路径和日期各改了什么。离境这道题是我找到正确入口后仍做不完的一道。

## 实际遇到的问题

| 严重度 | 位置 | 现象 | 建议 |
|---|---|---|---|
| 高 | `A2-en-d-whatif.png` · `Adjust the scenario` | 找得到实验室，但只看到 `Assume no absences`，无法在这页输入 2023 年离境 200 天。页面的 `Same as the current scenario` 对这道题没有给出新结果。 | 支持新增临时离境，显示计入的天数并即时对比。若只允许在问卷录入，给「新增离境」直达第 4 步并让玩家能回到原结果比较。 |
| 中 | `A2-en-d-step01.png` · `Nationality` | 我会先想到输入 `Malaysia`，`ISO 3166-1 alpha-3` 和 `CHN` 没给出它对应的代码。从预填截图才知道用 `MYS`。 | 允许按国家名称查找并显示相应代码，例如 `Malaysia (MYS)`。 |
| 中 | `A2-en-d-step03.png` · `Immigration Salary List` | 我能选「不确定」，但不知道名单是什么、怎样查，也不知道按未列入计算会让什么变化。 | 给一句用途说明，附查找入口或说明该选项影响哪些结果。 |
| 中 | `A2-en-d-result.png` · `What is missing`、`Not met (3)` | 两栏日期相同，左栏展开又把 Long Residence、Skilled Worker 的年限与工资并排。我第一眼差点把三项当成同一路径都要补，也得回想 2027 年的签证到期日才能理解为何不能直接等到 2029 年。 | 在各栏日期旁标明对应路径及适用前提，按路径显示差距，并在跨过已填许可到期日时解释中间须维持有效许可。 |
| 中 | `graduate-cv` 至 `graduate-cos`，Work / Visa centre | 同一个招聘按钮做了不同的事，完成本季就消失。在签证中心两次都没有可用动作，第二次已谈好合同依然不知道去哪里、什么时候拿 CoS。 | 明示当前招聘进度和下一步，比如「已谈薪，下季工作日向 HR 领取 CoS」。在开场第一次提 CoS 时写出全称。 |
| 中 | Allotment · `plant`、`water`、`quarter` | 首季种下并浇水的萝卜在季末前有苗。换季后六块地都空了，我回去找才发现收不了，也不能继续浇水。看到的种植反馈和季度日志没有讲苗会怎样。 | 种植时显示离成熟还差几天和本季余量，换季清除时在小结交代未收作物。 |
| 中 | Visa centre · `graduate-check-offer` | 这份 offer 已经同时过了两个标准工资数字。我读到长段 `new entrants` 时又以为有第三项要检查，反复看才懂它属于没有算完的另一选项。 | 在开头明确写「标准工资情景通过」，把 new entrant 的适用条件与本局未判定的内容放在独立的简短说明里。 |
| 中 | 末季 `fastForward` · `overstayed` | 逻辑流程从剩 2 个月、日常卡未完，到了下一次快进直接结束。游戏已有数字倒计时，我没有遇到针对本次快进跨过到期日的可选动作。结局还让我再次走已完成的 Graduate 转换，导致我回头确认是否存档成功。 | 若快进将越过许可到期，给明确日期和返回签证中心的动作。结局文本按实际过期的许可说明漏了哪一步。 |
| 低 | `A2-en-d-step06.png` · `statutory payments` | 知道人物卡没有相关款项所以能继续，但不确定日常打工的某类支付是否填在这里。 | 题目旁给一两个常见例子，延续现有「网站会判断是否算 public funds」的说明。 |
| 低 | 转换许可后的 `graduate-life-cover-letter`、`graduate-life-bus-interview` | Nora 已有担保工作，随后又在改求职信、去面试。我不知道是在回忆初次求职，还是有新的换工作剧情。 | 给这些卡片补一句回忆或换工作的背景，让它们接得上已转换的故事。 |
