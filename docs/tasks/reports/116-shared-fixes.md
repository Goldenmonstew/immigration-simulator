# 任务 116：共用游戏外壳的小修正

实现者：Fable（Claude Opus 5.5）。来源：美国（106）、德国（110）、澳大利亚（103）游戏的实现报告与审核意见里指出的共用问题。

## 1. 做了什么（按 commit）

| PROGRESS | commit | 内容 |
|---|---|---|
| 1220 | `Fix: 游戏进度详情弹窗标题改为路径名` | 进度条详情弹窗原来固定显示“进入新一年前 → 进入新一年后”，与内容不符。现在标题取该进度条的路径名（各国 `ruleColumns` 的 `label`）。日本 e2e 新增一项，核对点开“Permanent residence”后弹窗名就是它。季度小结里同一文案的原用法不变。 |
| 1221 | `Fix: 共用游戏文案：日记加入日本入籍分组，自动退租与菜地文案去掉英国语境` | 日记的申请分组加入 `naturalise`，日本递交帰化后出现“文件夹越装越厚”；季末余额不足自动退租的日志不再写英国的“明亮住处”，日记菜地收成的英文由 allotment 改为 garden plot，各国通用。日记分组与自动退租日志有单测核对；菜地英文只改字面，没有单独断言。 |
| 1222 | `Test: 日本英文 e2e 存款只匹配金额格式，内容契约测试放宽超时`、`Test: web 与 engine 单测默认超时设为 60 秒` | 日本英文 e2e 原来断言存款恰好 ¥1,800,000，但游戏种子取当前时间，开局卡片会花钱（审核者统计约 3.75% 的种子会失败）；改为匹配 `¥1,xxx,xxx`。`apps/web` 与 `packages/engine` 的 `test` 脚本照 `packages/game` 已有的写法设 `--testTimeout=60000`：CI runner 约慢 3 倍，西班牙游戏结局链接（11 秒）、葡萄牙政策页（5.4 秒）等重测试在 CI 上超过默认 5 秒（PR #97 的 check 失败即此）。`packages/game` 本来就是 60 秒，不另改单个测试。 |
| 1223 | `Fix: 游戏结局页链接按钮恢复白字` | `.theme.theme a`（特异性 0,2,1）高于 `.theme .button`（0,2,0），结局页“在模拟器里打开这条时间线”变成深绿字配绿底（对比度约 1.3:1）。加 `.theme.theme a.button` 规则恢复白字（悬停同样白字），并为将来的 `a.secondary` 链接加同类规则；英国 e2e 核对默认状态为白色。 |
| 1224 | `Docs: AGENTS.md 记录 Claude 终审后合并的决定` | 记录用户 2026-11-25 的决定：Gemini 周额度用完后由未参与实现的 Claude 子 agent 终审、通过即合并，Gemini 恢复后补复查。 |
| 1225 | `Docs: 任务 116 报告` | 本报告。 |
| 1226 | `Fix: 审核建议跟进（review116-1）` | 删掉 engine 希腊入籍单测的 10 秒单测超时（会低于新的 60 秒默认）；`.theme.theme a.secondary` 同样恢复按钮文字色；报告措辞改准。 |

## 2. 怎么验证的

- 先写失败的测试：日记分组的新断言在改动前失败（`× applying for naturalisation ends with the naturalisation text`），改后通过。
- 完整验收（`VITEST_MAX_WORKERS=2`）：`pnpm lint`、`pnpm typecheck` 退出码 0；game 36 个文件 1,362 项、web 51 个文件 1,106 项通过；`pnpm --filter web build` 成功。
- e2e：4491 端口确认空闲后跑 `tests/japan-game.spec.ts tests/game.spec.ts tests/life.spec.ts --project=desktop`，27 项通过（含新的弹窗名与按钮颜色断言），跑完删除 `test-results`。

## 3. 没做或没验证的

- 未在 CI 之外比对英国截图基线；结局页的记忆卡片截图不含该按钮，不受影响。
- 各国游戏分支里同类的 e2e 金额断言由各自分支处理（德国、葡萄牙、西班牙已改）。
- `site-shell.tsx` 的场景国家名单改读 `scenarioLinks` 留到马来西亚页面合入后再做，避免与在审分支冲突。

## 4. 发现与建议（范围外，未实现）

- 各国游戏角色开局预设了机关结论（品行、融入、安全审查等），与日本试点一致，暂保留；Gemini 恢复后复查时一并判断。
- `prettier --check` 对 main 上的 `spain-form.ts`、`spain.ts`、`ireland-2026-11.ts` 报格式问题；`pnpm lint` 只跑 ESLint，不影响 CI。
