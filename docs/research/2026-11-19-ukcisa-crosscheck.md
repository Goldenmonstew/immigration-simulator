# 用 UKCISA 交叉核对学生、毕业生路线（2026-11-19）

**结论。** 在本次核对范围内，项目已写的学生、毕业生相关规则、参数和游戏情景，与 UKCISA 及官方原文没有冲突，规则和数据不用改。另有三点要说明：

- **游戏情景说明不完整。** 毕业生角色转 Skilled Worker 时，没有提新入职者选项，见"情景差距"一节。
- **模型覆盖范围有限。** 项目只建模了游戏角色诺拉需要的部分：非博士、2027-01-01 前申请的两年 Graduate 许可。通用的 Graduate 许可期没有建模。预算案的大学例外见 PD-077。
- **UKCISA 有一处不精确。** 它没写清 2027 年 1 月 1 日当天申请适用哪一档。

**核对方法。** UKCISA（UK Council for International Student Affairs）是二手来源，只用于交叉验证。凡是与项目不一致或项目没写到的地方，都回到 `docs/SOURCES.md` 已登记的官方原文核对。只在 UKCISA 出现、没有对照官方原文的内容标为"待核"，也不写入政策数字。

## 核对的 UKCISA 页面

抓取时间为 2026-11-19 12:55 UTC。下表日期取页头的 "Last updated on"；同一页里各段另有各自的更新日期，见下文。

| 页面 | 页头更新日 |
|---|---|
| [Graduate route](https://www.ukcisa.org.uk/student-advice/working/graduate-route/) | 2026-10-28 |
| [Skilled Worker route](https://www.ukcisa.org.uk/student-advice/working/skilled-worker-route/) | 2026-03-13 |
| [Working after studies](https://www.ukcisa.org.uk/student-advice/working/working-after-studies/) | 2026-01-28 |
| [Student work](https://www.ukcisa.org.uk/student-advice/working/student-work/) | 2026-01-28 |
| [Student route: eligibility and requirements](https://www.ukcisa.org.uk/student-advice/visas-and-immigration/student-route-eligibility-and-requirements/) | 2026-10-26 |
| [Student route: applying in the UK](https://www.ukcisa.org.uk/student-advice/visas-and-immigration/student-route-applying-in-the-uk/) | 2026-11-16 |
| [Student route: bringing your family](https://www.ukcisa.org.uk/student-advice/visas-and-immigration/student-route-bringing-your-family/) | 2026-09-14 |
| [Student immigration: the basics](https://www.ukcisa.org.uk/student-advice/visas-and-immigration/student-immigration-the-basics/) | 2026-01-28 |

## 逐项核对

| 项目 | 项目里的写法 | UKCISA | 官方原文 | 结果 |
|---|---|---|---|---|
| **Graduate 许可期** | 只建模诺拉的情景：`graduateNonDoctoralEarlyGrantMonths` 24 个月、`graduateNonDoctoralShorterGrantFrom` 2027-01-01（`packages/policy-data` 现行参数）；博士三年与 18 个月一档没有用于计算 | 非博士 2027 年 1 月 1 日前申请两年，"after 1 January 2027" 申请 18 个月；博士三年 | SRC-034 GR 8.1：before 1 January 2027 两年，"on or after 1 January 2027" 18 个月，博士三年，从决定日起算 | 一致。1 月 1 日当天以 GR 8.1 为准，适用 18 个月 |
| **只能获批一次** | 游戏开场写明不能续签（注释引 GR 1.4） | 只能获批一次，不能延期，也不能拆成几段 | SRC-034 GR 1.4：曾获 Graduate 或 Doctorate Extension Scheme 许可的，不能再申请 | 一致 |
| **预算案的大学例外** | PD-077 记为未定（UNKNOWN） | 2026-10-28 段写明尚无进一步细节 | SRC-032 §5.6、§7.9 只给方向 | 一致，PD-077 保持未定 |
| **与定居的关系** | **现行规则：** 合资格的 Student、Graduate 居留可计入 Long Residence（LR 11.1(a)）。引擎说明里写明未建模 LR 11.2 的部分情形。 **Skilled Worker 5 年：** 诺拉这类居留不计入（SW 21.2 的可计入路线不含 Student、Graduate），引擎未建模 SW 21.2(i)。 **改革栏：** 按 SRC-001 p23–24，两者归为不计入。问卷允许录入这两类许可 | Graduate 本身不通向定居，只能经 Long Residence 计入 | SRC-005 LR 11.1(a)；SRC-004 SW 21.2；SRC-001 p23–24 | 现行规则部分一致。UKCISA 没提改革方案 |
| **许可起算日** | 诺拉 2026-09-01 递交，2026-09-15 获批，许可从决定日起算 24 个月 | 同 | SRC-034 GR 8.1 | 一致 |
| **境内申请、须持学生许可** | 诺拉的学生许可到 2026-09-14，到期前递交 | 只能在英国境内申请，须持有效 Student 许可 | SRC-034 GR 1.2(d)、GR 1.3 | 一致 |
| **结业与学校通知** | 情景假定已满足 | 学校确认结业后，还要通知 Home Office | SRC-034 GR 4.2–4.3 | 一致 |
| **待决期间与处理时长** | 诺拉的时间线只有相邻两段许可，不涉及待决期间 | 按期递交后，等待期间仍合法在英（3C），并转述了官方的通常处理时长 | 本次未对照一级来源 | 待核，不写数字 |
| **Skilled Worker 一般门槛** | £41,700 加 going rate（SW 4.2 Option A、SW 24.3 第 A 行） | £41,700 | SRC-004 SW 4.2 Option A | 一致 |
| **移民健康附加费** | 每年 £1,035（SRC-030） | Graduate、Skilled Worker 页都写每年 £1,035 | SRC-030；SRC-044 Cost for a year | 一致 |
| **Skilled Worker 定居** | 连续 5 年（SW 21.1） | 连续 5 年 | SRC-004 SW 21.1 | 一致 |

## 情景差距：毕业生转 Skilled Worker 时没提新入职者选项

UKCISA 的 Skilled Worker 页写明，新入职者选项（new entrant，Option E）适用于从 Student 或 Graduate 转来的人，薪资门槛更低，但有 4 年总期限。官方原文（SRC-004）的相关条款：

- **SW 4.2 Option E**：新入职者的薪资须同时不低于 £33,400/年和该职业 going rate 的 70%。
- **SW 12.1(a)**：按 Appendix Skilled Occupations 的 Table 1 或 1a 取对应档。SOC 2136 的 Option E 档为 £33,400（£17.13/小时）（SRC-017 Table 1）。
- **SW 12.2(f)**：最近一次许可（不计访客）是 Graduate 的，可算新入职者；Graduate 许可若已到期，须在申请日前不足 2 年内到期。
- **SW 12.3**：获批后，Skilled Worker、Graduate 与 Tier 2 的许可合计不得超过 4 年，不连续也合并计算。
- **SW 14.1–14.4**：可计入薪资的项目，以及工时折算规则。
- **SW 18.1**：许可期到 CoS 结束日后 14 天。

游戏里诺拉的情景（`packages/game/src/graduate-route.ts`）：

- 用引擎的两条定居薪资规则 `CL-SW-SALARY`、`CL-SW-GOING-RATE`（SW 24.3 第 A 行）预览标准档。代码注释写明不采用新入职者折扣，游戏内说明写"只核对标准薪资"。
- 较低报价 £40,700（一般门槛减 £1,000）判为不达标，谈成的 £44,200 达标。
- 岗位是 SOC 2136，going rate 为 £41,200（SRC-017 Table 1）。
- 签证中心的合同期设为 36 个月（`balance.extensionMonths`）。

据此：

- **薪资。** 按游戏的标准工时假设，£40,700 满足 Option E 的薪资门槛（£33,400）。能否获批是另一回事，还要看担保、CoS 等其他条件。
- **4 年总期限，无法判断。** 把已获批的 24 个月 Graduate 与 36 个月合同相加是 60 个月，看上去超过 4 年。但还有两点没核实，所以本次证据无法判断这份合同是否超限：
  - 换签时没用完的 Graduate 许可怎么计入，要看 Skilled Worker caseworker guidance，项目还没登记这份文件；
  - 实际许可期按 CoS 计算（SW 18.1），不等于合同期。
- **游戏的两处简化。**
  - 递交和获批合成了一个动作。开场写"到期前转换"，到期结局写"没有接上新许可"，玩家可能把"到期前获批"当成实际期限；实际是到期前按期递交，等待期间按 3C 处理（待核）。
  - UKCISA 还列出符合条件的 Student 直接转 Skilled Worker 的路径（SRC-004 SW 1.5A、SW 12.2(e)），游戏没有这条。

所以游戏现在的判定不一定错。但玩家可能把"£40,700 不够"理解成对所有毕业生都成立。

建议（未做；属于情景内容或规则语义改动，需另起任务）：

- **方案一：补说明。** 在情景说明里补一句，讲清新入职者选项的薪资门槛和 4 年总期限，以及本情景为什么按标准档核对。
- **方案二：建模 Option E。** 在引擎和游戏里建模，前提是先登记 caseworker guidance，确认 4 年怎么算。
- **注意 PD-076。** PD-076 记有预算案拟统一新入职者折扣，改动落地前，Option E 的数字可能变化。

## UKCISA 自身要注意的地方

- **同页新旧段落矛盾。** Graduate 页 2026-10-28 的段落已写 18 个月；但 2024-05-14 的"处理时间"段仍写 "most applicants will be granted two years"，2026-07-21 的"工作"段引用的雇主指引也只写两年。
- **讲座截图是旧版。** 截图是 2024-10-21 的版本，只写两年、博士三年。
- **网址已改。** 旧网址 `/Information--Advice/...` 已改为 `/student-advice/...`。

讲座、截图和二手网站容易落后于条文，数字一律以登记的官方原文为准。

## UKCISA 写到、项目没有建模的内容

这些内容不影响现有结论，记下来供以后扩展参考。

- **Graduate 许可条件（SRC-034 GR 8.2）。**
  - (a) 不能使用 public funds；
  - (b) 不能做职业运动员（主申请人条文只写 professional sportsperson，"教练也不行"是 UKCISA 的解释；家属条件明写包括教练）；
  - (c) 不能读 Student sponsor 开设、可走 Student 路线的课程；
  - (d) 学习受 ATAS 条件约束。
- **Graduate 家属（SRC-034 GR 9.4A(c)–(d)）。**
  - (c)：学生最后一段学生许可期间在英国出生、且该学生正在申请或已获 Graduate 的子女；
  - (d)：在英国出生、父母一方持有 Graduate 许可的子女。
  - UKCISA 说 (d) 自 2026-08-03 起适用，本次未对照修订记录。其余家属须原为学生签证家属，这一点为 UKCISA 的说法，待核。
- **费用。** 金额已对照官方原文，项目没有使用：
  - Graduate 境内申请费 £937（SRC-031 §7）；
  - 学生签证境内申请费 £558（SRC-031 §8）；
  - 学生的健康附加费每年 £776（SRC-044 Cost for a year）。
- **待核（Appendix Student 未登记，不写数字）。**
  - UKCISA 列出学生在学期内的打工时长上限和假期规则，适用条件取决于担保学校类型和课程层级，也有学生没有工作权限；
  - 学生许可在课程结束后的收尾期（诺拉的学生许可正好 12 个月，是虚构设定）；
  - Graduate 申请待决期间离境会被视为撤回。
