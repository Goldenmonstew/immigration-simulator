# 用 UKCISA 交叉核对学生、毕业生路线（2026-11-19）

结论：**项目里学生、毕业生路线的规则和数据与 UKCISA 一致，不需要改。**

- 毕业生角色转 Skilled Worker 的情景说明不完整：没有提新入职者选项。见"情景差距"一节。
- UKCISA 有一处写得不精确：18 个月许可的起始日。

UKCISA（UK Council for International Student Affairs）是二手来源，只用于交叉验证。凡是与项目不一致或项目没写到的地方，都回到 `docs/SOURCES.md` 已登记的官方原文核对：

- SRC-034：Appendix Graduate，2026-08-03 版，HC 259；
- SRC-004：Appendix Skilled Worker，2026-10-08 版，HC 584。

## 核对的 UKCISA 页面

抓取时间：2026-11-19 12:55 UTC。下表的日期是页头的 "Last updated on"；同一页里各段另有自己的更新日期，见下文。

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
| **Graduate 许可长度** | `graduateNonDoctoralEarlyGrantMonths` 为 24 个月；`graduateNonDoctoralShorterGrantFrom` 为 2027-01-01（`packages/policy-data` 现行参数） | 非博士 2027 年 1 月 1 日之前申请两年，"after 1 January 2027" 申请 18 个月；博士三年 | SRC-034 GR 8.1：before 1 January 2027 两年，"on or after 1 January 2027" 18 个月，从决定日起算 | 一致。UKCISA 没写清 1 月 1 日当天适用哪一档，以 GR 8.1 为准：当天申请也是 18 个月 |
| **只能获批一次、不能续** | 游戏毕业生开场写明不能续签（注释引 GR 1.4） | 只能获批一次，不能再申请延期，也不能拆成几段 | SRC-034 GR 1.4 | 一致 |
| **预算案"部分大学恢复两年"** | PD-077 记为未定（UNKNOWN） | 2026-10-28 段："We do not yet have any further detail" | SRC-032 只给方向 | 一致，PD-077 保持未定 |
| **与定居的关系** | Student、Graduate 时间计入 Long Residence（LR 11.1(a)），不计入 Skilled Worker 5 年（SW 21.2 的可计入路线不含二者） | Graduate 本身不通向定居，只能经 Long Residence 计入 | SRC-005 LR 11.1(a)；SRC-004 SW 21.2 | 一致 |
| **申请时间与起算** | 游戏中诺拉的学生许可到 2026-09-14，2026-09-01 递交 Graduate 申请，2026-09-15 获批，许可从决定日起算 24 个月 | 可申请的时间：学校确认结业起，到学生许可到期为止；按期递交后，等待期间仍合法在英（3C）；官方页写通常 8 周内决定 | SRC-034 GR 8.1 从决定日起算 | 一致 |
| **Skilled Worker 一般薪资门槛** | £41,700 加 going rate（SW 4.2 Option A、SW 24.3 第 A 行） | £41,700 | SRC-004 SW 4.2 Option A | 一致 |
| **移民健康附加费** | 每年 £1,035（SRC-030） | Graduate、Skilled Worker 页都写每年 £1,035 | SRC-030 | 一致 |
| **Skilled Worker 定居** | 连续 5 年（SW 21.1） | 连续 5 年 | SRC-004 SW 21.1 | 一致 |

## 情景差距：毕业生转 Skilled Worker 时没提新入职者选项

UKCISA 的 Skilled Worker 页写明，"新入职者"（new entrant，Option E）适用于从 Student 或 Graduate 转来的人，薪资门槛更低，并有 4 年总期限。官方原文（SRC-004）规定如下：

- **SW 4.2 Option E**：新入职者的薪资须同时不低于 £33,400/年，且不低于该职业 going rate 的 70%。
- **SW 12.2(f)**：最近一次许可（不计访客）是 Graduate 的，即可算新入职者。
- **SW 12.3**：按新入职者获批后，Skilled Worker、Graduate 与 Tier 2 的许可合计不得超过 4 年。

游戏里诺拉的情景（`packages/game/src/graduate-route.ts`）：

- **核对标准。** 薪资按标准门槛核对，代码注释写明"不采用新入职者折扣"，游戏内说明写"只核对标准薪资"。
- **两档报价。**
  - 较低报价 £40,700（一般门槛减 £1,000）判为不达标；
  - 谈成的报价 £44,200 达标。
- **岗位与合同。** 岗位是 SOC 2136，SRC-017 Table 1 的 going rate 为 £41,200。签证中心的合同期是 36 个月（`balance.extensionMonths`）。

据此：

- **只看薪资。** £40,700 满足 Option E：不低于 £33,400，也高于 going rate 的 70%，即 £28,840。
- **但有总期限限制。** 诺拉已获批 24 个月 Graduate，再加 36 个月合同，按 SW 12.3 字面合计超过 4 年。所以这份合同可能用不了 Option E。
- **期限怎么算没核实。** 换签时没用完的 Graduate 时间算不算进 4 年，需要看 Skilled Worker caseworker guidance，项目还没登记这份文件。

所以游戏现在的判定不一定错。但玩家可能把"£40,700 不够"理解成对所有毕业生都成立；而按条文，刚毕业、合同期使总期限不超过 4 年的人可以走新入职者选项。

建议（未做，属于情景内容或规则语义改动，需另起任务）：

- 方案一：在情景说明里补一句，说明新入职者选项的薪资条件和 4 年总期限，以及本情景为什么按标准薪资核对。
- 方案二：在引擎和游戏里建模 Option E。这需要先登记 caseworker guidance，确认 4 年怎么算。
- 另外，PD-076 记有预算案拟统一新入职者折扣。改动落地前，Option E 的数字可能变。

## UKCISA 自身要注意的地方

- **同页新旧段落矛盾。** Graduate 页的 2026-10-28 段已写明 18 个月；但 2024-05-14 的"处理时间"段仍写"most applicants will be granted two years"，2026-07-21 的"工作"段引用的雇主指引也只写两年。
- **讲座截图已过时。** 截图里是 2024-10-21 的旧版，只写两年、博士三年。
- **网址已改。** 旧网址 `/Information--Advice/...` 已改为 `/student-advice/...`。

讲座、截图和二手网站容易落后于条文，数字一律以登记的官方原文为准。

## UKCISA 写到、项目没有建模的内容

这些内容不影响现有规则的结论，只记录下来，供以后扩展时参考。

- **学生打工时长。** 学期中每周 20 小时（学位及以上课程）或 10 小时；假期可全职。
- **Graduate 期间的限制。**
  - 不能做职业运动员（GR 8.2(b)；UKCISA 另写明不能做教练）；
  - 不能读学生签证担保学校的可担保课程（GR 8.2(c)）；
  - 申请待决期间离开共同旅行区，申请视为撤回。
- **Graduate 家属。**
  - 一般只能由学生签证家属转过来；
  - 在英国出生的子女可以申请，包括 2026-08-03 起 Graduate 期间出生的子女（SRC-034 的家属条款，本版已含）。
- **费用。** 以下金额未对照官方原文，项目没有使用：
  - Graduate 申请费 £937；
  - 学生签证境内申请费 £558；
  - 学生的健康附加费每年 £776。
- **学生许可的收尾期。** UKCISA 举例说一年制硕士的许可是一年加四个月。诺拉的学生许可正好 12 个月，是虚构设定；Appendix Student 没有登记，未核对。
