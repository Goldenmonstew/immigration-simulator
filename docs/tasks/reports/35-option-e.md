# 任务 35｜Skilled Worker 新入职者档（Option E）

## 1. 做了什么

- **引擎**：新增 `skilledWorkerApplication()`（`packages/engine/src/rules/current-law/sw-application.ts`），核对 Skilled Worker 申请的 SW 4.2 Option A 与 Option E，结果分两档给出，任一档通过即可申请。与定居薪资规则（SW 24.3）分开，定居结论与黄金案例不变。
  - 薪资：Option A 要求 £41,700 与 going rate；Option E 要求 £33,400 与 SRC-017 Table 1 公布的 Option E 列（going rate 的 70%，不低于引言规定的每小时最低额）。两档都按每周工时相对 37.5 小时折算（Table 1 引言）。抽取脚本新增 Table 1／1a 的 Option E 列（`newEntrantRate`）。
  - SW 12.2(f)：最近一次非访客许可是 Graduate；已到期的须距申请日不足 2 年，恰好 2 年不成立。
  - SW 12.3：已持 Graduate 与 Skilled Worker 许可的实际有效期间（空档不计）加拟授予许可（到 CoS 结束后 14 天，SW 18.1）合计不超过 4 年。决定日仍有效的许可在决定日截断（SRC-050 §23.1）。section 3C 延续期计入与否会改变结论时为 `UNKNOWN`（PD-081）。
- **政策参数**：新增 `skilledWorkerNewEntrantGraduateExpiryYears`（2，SRC-004 SW 12.2(f)）与 `skilledWorkerGrantDaysAfterCos`（14，SRC-004 SW 18.1）。
- **游戏**：诺拉的转签改用该检查。核对结果分别列出标准档与新入职者档，说明按 CoS 年薪、每周 37.5 小时与拟授予许可期核对。
- **诺拉情景的结果变化**：低报价 £40,700 低于标准档，但达到新入职者档的薪资。游戏时间线按季度起始日记录许可，递交、决定与 HR 开具的 36 个月 CoS 都从该日起算（预览开头写明这一前提）。2027-09-15 转签时，一年 Graduate 加新许可恰好 4 年（1,461 天），符合 SW 12.3，可以转签；下一季度再转则超过 4 年，须谈到标准档薪资。原先"低报价一定转不了"的设定按条文改为上述结果。签证中心按钮改为"核对转签条件（标准档与新入职者档）"。

## 2. 怎么验证的

| 命令 | 结果 |
|---|---|
| `pnpm --filter @uk-immigration/engine test` | 通过，新增 `sw-application.test.ts` 5 组用例 |
| `pnpm --filter @uk-immigration/game test` | 通过，诺拉转签用例按新结果改写 |
| 全仓 gate 与 e2e | 见 PR 说明 |

## 3. 没做或没验证的

- 网站问卷没有 Option E（契约约定只做游戏情景）。
- 其他 Option（B–D、F–K）、担保与 CoS 的其他有效性要求（SW 5.x）未建模；游戏情景假定已核实。
- 合计期限按日历日累计，4 年上限按首段计入许可起日推 4 个日历年。许可之间有空档、合计与上限只差一天以内时为 `UNKNOWN`（PD-081）。
- CoS 缺起日或止日时合计期限为 `UNKNOWN`；年薪按 SW 14.1–14.3 的可计入薪资输入。

## 4. 发现与建议

- 诺拉在季度首日以低报价恰好卡在 4 年上限，晚一天就不行。若希望情景更稳定，可考虑让 HR 的 CoS 期限短一些，或在剧情里提示申请日的影响；这属于游戏设计取舍，本任务未改。
- 任务 40（诺拉情景补"递交与获批的先后、3C 延续"说明）可直接引用本检查的决定日与 3C 处理。
